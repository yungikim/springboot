if(window.KEditor == null){
    (function(){
        /**
         * *** jquery 1.8 이상 버전 사용할것. ***
         * *** IE 10+  ***
         * *** <!DOCTYPE html> 로 설정 할 것. ***
         * *** Domino Field $$HTMLFrontMatter ***
         * config:
         * {
         *  instanceId:'' // 각 editor key
         *  wrapper:'' // Editor를 표시해야하는 위치 selector
         *  form:'' // Editor 표시양식 formname
         *  iconPath:'images/icon/editor'
         *  decoPath:'images/deco/contents'
         *  skinPath:'images/deco/editor/skin/01'
         *  imageUploadPath: '' // 이미지 Upload경로
         *  imageLinkKey: imageLinkKey // 이미지 Link Key
         *  imageUploader: imageUploader // 이미지 컨트롤 사용시 Object 설정
         *  imageDomain: '' // mime에
         *  confirmPasteType: [true|false]
         *      // Applet 미사용 Chrome에서
         *      // (html과 image 를 선택해서 붙여넣기가 가능한 경우
         *      //  예) Excel에 도형이 포함된 부분을 붙여넣을경우
         *      //      이미지로 붙여넣을것인지 HTML로 붙여넣을것 인지 확인창 표시
         *      //      HTML로 붙여넣을경우 로컬이미지를 삭제함.
         *      //   )
         *  fullscreenEvent: func(isFullScreen, isBefore) // FullScreen 전환시 호출, 전환 처리 전, 후 두번씩 호출됨
         *  core: {} //위 설정값 이외의 Editor 기본 설정값.
         *  font_list:[
         *      { label: '<span  class="tx-txt">맑은 고딕</span> (<span class="tx-txt">가나다라</span>)', title: '맑은 고딕', data: 'Malgun Gothic,맑은 고딕,sans-serif', klass: '' }
         *      ...
         *  ] // null이 아니면 여기에 표시된 폰트 리스트 를 사용함.
         *  jsLoadComplete: function() // editor(.min).js 로드 완료시 호출됨
         *  font_default:
         *  {
         *  color: "#123456",
         *  fontFamily: "맑은 고딕",
         *  fontSize: "10pt",
         *  backgroundColor: "#fff",
         *  lineHeight: "1.5",
         *  padding: "8px"
         *  } // Editor 기본 스타일(font_list를 따로 정의 했으면 이것도 하자.)
         * }
         */
        var _DEFAULT_ICON_PATH = 'images/icon/editor';
        var _DEFAULT_DECO_PATH = 'images/deco/contents';
        var _DEFAULT_SKIN_PATH = 'images/deco/editor/skin/01';
        var _DEFAULT_IMAGE_UPLOAD_PATH = '/';

        var EDITOR = function(config){
            EDITOR.instanceCount++;
            this.config = config;
            this.instanceId = this.config.instanceId || ("instance_" + EDITOR.instanceCount);
            this.eInstanceId = this.instanceId.replace(/\$/g, "\\$");
            this._editor = null;
            this.editor = null;
            this.isInit = false;
            this.imageCount = 0;
            this.imageLinkKey = config.imageLinkKey;
            this.imageUploader = config.imageUploader;
            if(config.method){
                for(var nm in config.method){
                    this[nm] = config.method[nm];
                }
            }
            EDITOR._instance[this.instanceId] = this;
        };
        function _alertErrorEditorLoadFail(){
             alert(Trex._I18N.g('error_editor_load_fail', "에디터실행을 실패 하였습니다."));
        }
        function _getErrorEditorLoad(){
            return Trex._I18N.g('error_editor_load', "에디터가 로드되지 않았습니다. 잠시 후 다시 시도하여 주십시오.");
        }
        var Adapter = function(kEditor, editor){
            this.kEditor = kEditor;
            this.editor = editor;
        };
        Adapter.prototype = {
            'setHtml':function(_html) {
                this.editor.modify({'content':_html});
            },
            'getHtml':function() {
                return this.editor.getCanvas().getPanel('html').getContent();
            },
            'getDom':function() {
                return this.editor.getCanvas().getPanel('html').getDocument();
            },
            'changeMode':function(mode) {
                return this.editor.getCanvas().changeMode(mode);
            },
            'setHeight':function(height) {
                var canvas = this.editor.getCanvas();
                var toolbar = this.editor.getToolbar();
                if(this.kEditor.resizeBarSize == null){
                    var bar = $tx("tx_resizer" + this.editor.initialConfig.initializedId);
                    this.kEditor.resizeBarSize = bar?bar.offsetHeight:0;
                }
                height -= (toolbar?toolbar.el.offsetHeight:0) - this.kEditor.resizeBarSize;
                canvas.setCanvasSize({
                    height: height
                });
            },
            'getMode':function() {
                return this.editor.getCanvas().mode;
            },
            'getHeadStyle':function() {
                /**
                 * setFontStyle 참조
                 */
                var style = $.extend(true, {color: "#123456",
                            fontFamily: "맑은 고딕",
                            fontSize: "10pt",
                            backgroundColor: "#fff",
                            lineHeight: "1.5",
                            padding: "8px"}, this.kEditor.editor.config.canvas.styles);
                return 'p {margin:0;padding:0;}'
                + ' body, td, button, p { color:' + style.color + '; font-size:' + style.fontSize + '; font-family:' + style.fontFamily + '; line-height:' + style.lineHeight + '; }'
				+ ' a, a:hover, a:link, a:active, a:visited { color:' + style.color + '; }';
            },
            'getSaveHtml':function() {
                /**
                 * 1. base64ImageUpload
                 *      본문 <img src="data:image/xxx;base64,...">처리
                 *      : base64 -> blob : atob, Uint8Array, Blob 지원 Browser 필요
                 *      : blob upload -> FormData 지원 Browser
                 * 2. externalImageUpload
                 *      같은 도메인의 다른 문서 이미지 upload 처리
                 *      : image url -> Blob :
                 *          XMLHttpRequest의 responseType = "blob" 지원 browser 필요
                 *      : blob upload -> FormData 지원 Browser
                 * 3. htmlLocalImageUpload
                 *      Applet image upload
                 *      (로컬 이미지와 externalImageUpload가 처리 못한 이미지 처리)
                 *
                 * @return promise
                 */
                if(this.editor.getCanvas().mode != "html")
                    this.editor.getCanvas().changeMode('html');
                var _self = this;
                var promise = Trex.KEditor.base64ImageUpload(_self.kEditor)
                // base64ImageUpload 항상 success 를 반환. parameter로 오류 반환
                .then(
                    function(isSuccess, e){
                        // console.log('base64ImageUpload', isSuccess?"success":"fail", !isSuccess?e:undefined);
                        return Trex.KEditor.externalImageUpload(_self.kEditor);
                    }
                )
                // externalImageUpload  항상 success 를 반환. parameter로 오류 반환
                .then(
                    function(isSuccess, e){
                        // console.log('externalImageUpload', isSuccess?"success":"fail", !isSuccess?e:undefined);
                        if(_self.kEditor.config.beforeSaveDom){
                            _self.kEditor.config.beforeSaveDom(_self.kEditor.getDom());
                        }
                        var _html = _self.kEditor.getHtml();
                        _html = Trex.KEditor.htmlLocalImageUpload(_self.kEditor, _html);
                        _html = '<html><head><style>' + _self.kEditor.getHeadStyle() + '</style><body>' + _html + '</body></html>';
                        if(_self.kEditor.config.beforeSaveHtml){
                            _html = _self.kEditor.config.beforeSaveHtml(_html);
                        }
                        // console.log('htmlLocalImageUpload success');
                        return _html;
                    }
                );
                return promise;
            }
        };
        EDITOR.instanceCount = 0;
        EDITOR._instance = {};
        EDITOR.prototype = {
            'init':function() {
                var _self = this;
                _self._adapter = null;
                var dfd = $.Deferred();
                var _config = {
                    txHost: '',
                    txPath: '',
                    txService: 'sample',
                    txProject: 'sample',
                    initializedId: '',
                    wrapper: '',
                    form: '',
                    txIconPath: "",
                    txDecoPath: "",
                    toolbar: {
                        table:{
                            isHideAdvanceMenu:true
                        }
                    },
                    canvas: {
                        useImagePaste: false,
                        exitEditor: {
                        },
                        styles:{},
                        showGuideArea: false
                    },
                    events: {
                        preventUnload: false
                    },
                    sidebar: {
                        attachbox: {
                            show: true,
                            confirmForDeleteAll: true
                        }
                    },
                    size: {}
                };
                if(!_self.config.iconPath) _self.config.iconPath = _DEFAULT_ICON_PATH;
                if(!_self.config.decoPath) _self.config.decoPath = _DEFAULT_DECO_PATH;
                if(!_self.config.skinPath) _self.config.skinPath = _DEFAULT_SKIN_PATH;
                if(!_self.config.imageUploadPath) _self.config.imageUploadPath = _DEFAULT_IMAGE_UPLOAD_PATH;
                var _lang = _self.config.language||'ko';
                var config = $.extend(true, {}, _config, _self.config.core||{}, {
                    'initializedId':_self.instanceId,
                    'language':_lang,
                    'wrapper':'tx_trex_container' + _self.instanceId,
                    'form':_self.config.form || document.forms[0].name+'',
                    'txIconPath':_self.config.iconPath + '/',
                    'txDecoPath':_self.config.decoPath + '/',
                    'imageUploadPath':_self.config.imageUploadPath,
                    'imageUploadControl':_self.config.imageUploadControl,
                    'fontList':_self.config.font_list
                });

                if(_self.config.font_default){
                    config.canvas.styles = _self.config.font_default;
                }else{
                    config.canvas.styles = Trex._I18N.g('_FONT_DEFAULT', {
                            color: "#123456",
                            fontFamily: "맑은 고딕",
                            fontSize: "10pt",
                            backgroundColor: "#fff",
                            lineHeight: "1.5",
                            padding: "8px"
                        });
                }
                EditorJSLoader.ready(function(Editor) {
                    config.deferred = dfd;
                    if(_self.config.jsLoadComplete) _self.config.jsLoadComplete(Editor, config);
                    var editor = new Editor(config);
                },
                {
                    'editor_wrapper': _self.config.wrapper,
                    'editor_instanceId': _self.instanceId,
                    'iconPath':_self.config.iconPath,
                    'decoPath':_self.config.decoPath,
                    'skinPath':_self.config.skinPath,
                    'editor_language':_lang
                });
                _self._editor = dfd.promise().then(
                    function(_editor) {
                        Editor.__MULTI_LIST[_self.instanceId].kEditor = _self;
                        _self.editor = $.extend(false, {}, Editor, Editor.__MULTI_LIST[_self.instanceId]);
                        _self.isInit = true;
                        _self._adapter = new Adapter(_self, _self.editor);
                        return _self.editor;
                    },
                    function() {
                        _alertErrorEditorLoadFail();
                    }
                );
                return _self;
            },
            'setHtml':function(html) {
                var _self = this;
                this._editor = this._editor.then(
                    function(editor) {
                        _self._adapter.setHtml(html);
                        return editor;
                    },
                    function() {
                       //_alertErrorEditorLoadFail();
                    }
                );
                return this;
            },
            'changeMode':function(mode) {
                /**
                 * mode : html|source|text?
                 */
                var _self = this;
                this._editor = this._editor.then(
                    function(editor) {
                        _self._adapter.changeMode(mode);
                        return editor;
                    },
                    function() {
                        //_alertErrorEditorLoadFail();
                    }
                );
                return this;
            },
            'do':function(func) {
                /**
                 * func(editor(_adapter)) 를 호출함.
                 */
                var _self = this;
                this._editor = this._editor.then(
                    function(editor) {
                        func(_self._adapter);
                        return editor;
                    },
                    function() {
                        //_alertErrorEditorLoadFail();
                    }
                );
                return this;
            },
            'getHtml':function() {
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return this._adapter.getHtml();
            },
            'getDom':function() {
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return this._adapter.getDom();
            },
            'getMode':function() {
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return this._adapter.getMode();
            },
            'getHeadStyle':function() {
                return this._adapter.getHeadStyle();
            },
            'getSaveHtml':function() {
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return this._adapter.getSaveHtml();
            },
            'setHeight':function(height) {
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return this._adapter.setHeight(height);
            },
            '_eventFullScreen':function(isFullScreen, isBefore){
                /**
                 * FullScreen 전환을 위해 필요한 사전 작업.
                 */
                if(this.config.fullscreenEvent){
                   return this.config.fullscreenEvent(isFullScreen, isBefore);
                }
            },
            '_createImageUrl':function(_host, _path){
                return _host + _path;
            },
            '_getUploadImageInfo':function(name, type, ext, upload_type) {
                /**
                 * 이미지를 서버에 저장할 때 필요한 이미지 정보 반환.
                 * @param name : 이미지명
                 * @param type : 이미지 mime type
                 * @param ext : 이미지 확장자
                 * @param upload_type : blob|data|control|url...
                 * @return
                 *  {
                 *      cid: // 이미지 cid,
                 *      name: // 이미지 이름,
                 *      url: // 이미지 Upload URL,
                 *          "blob"의 응답은 {"fileName":..., "url":...}
                 *      host: // 응답으로 받은 image 경로의 host ( host + image 경로로 img src=를 구성),
                 *      postdata:{
                 *          [name]:value
                 *      }
                 *      type:'domino'(default)...
                 *  }
                 */
                var _cid = (new Date).getTime() + '' + (this.imageCount++);
                var _name = "image." + _cid + '.' + ext;
                var _url = (typeof this.config.imageUploadPath != 'string'?this.config.imageUploadPath():this.config.imageUploadPath)
				    //+ '&prefix=' +''
                    + '&type=CONTROL'
				    ;
                var _host = document.location.protocol + "//" + document.location.hostname;
                if(upload_type == "control" && _url.indexOf(_host) == -1) _url = _host + _url;
                return {
                    'type':'domino',
                    'cid':_cid,
                    'name':_name,
                    'url':_url,
                    'host':_host,
                    'fieldname':'%%File',
                    'postdata':{
                        //'ImageBody':'',
                        'cid':_cid
                    }
                };
            },
            '_parseUploadResponse':function(uploadResult, info, uploadType){
                /**
                 * @param uploadResult : responseText
                 * @param info : {_getUploadImageInfo} return값
                 * @param uploadType : 응답형식 구분.
                 * 이미지 업로드 후 http responseText를
                 * {'img_src':이미지경로, 'uploadResult':responseText, 'imageName':imageName}
                 * 형태로 반환한다.
                 */
                var result = null;
                if(uploadType == "blob"){
                    if(uploadResult){
                        var json = eval("(" + uploadResult + ")");
                        if(json){
                            var img_src = this._createImageUrl(info.host, json.url);
                            result = {img_src:img_src, uploadResult:uploadResult, imageName:info.name};
                        }
		            }
                }else if(uploadType == "applet"){
                    if(uploadResult){
                        var json = eval("(" + uploadResult + ")");
                        for(var i = 0; i < json.length; i++){
                            var imgs = info.uploadImageById[json[i].fileName];
                            if(imgs != null){
                                for(var j = 0; j < imgs.length; j++){
                                    //imgs[j].src = document.location.protocol + "//" + document.location.hostname + json[i].url;
                                    info.uploadedImage[info.name] = this._createImageUrl(info.host, json[i].url);
                                }
                            }
                        }
                    }
                }
                return result;
            },
            '_checkUploadImage':function(src) {
                // Applet이 호출
                var domain = document.location.hostname.substring(document.location.hostname.indexOf(".") + 1).toLowerCase();
                return this._checkLocalImage(src) || this._checkExternalImage(src, domain);
            },
            '_checkLocalImage':function(src){
                return src.search(/^(?:file:\/\/\/|[a-zA-Z]:)/) != -1;
            },
            '_checkExternalImage':function(src, domain){
                if(!domain) domain = document.location.hostname.toLowerCase();
                return (src.toLowerCase().indexOf(domain) != -1
						&& src.indexOf("linked=" + this.imageLinkKey) == -1);
            },
            'getInlineStyleHtml':function(_html) {
                return EDITOR.getInlineStyleHtml(_html, this.config.removeStyleProps);
            }
        };
        EDITOR.build = function(config){
            return new EDITOR(config).init();
        };
        EDITOR.get = function(instanceid){
            return EDITOR._instance[instanceid];
        };
        EDITOR.getInlineStyleHtml = function(_html, ignoreProps) {
            var styles = Trex.KEditor._getStyles(_html);
            _html = Trex.KEditor.inlineStyle(styles, _html, ignoreProps);
            return _html;
        };
        window.KEditor = EDITOR;
    })();
}