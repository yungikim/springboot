/* base64 */
(function(c){var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var d=function(f){f=f.replace(/\x0d\x0a/g,"\x0a");var e="";for(var h=0;h<f.length;h++){var g=f.charCodeAt(h);if(g<128){e+=String.fromCharCode(g);}else{if((g>127)&&(g<2048)){e+=String.fromCharCode((g>>6)|192);e+=String.fromCharCode((g&63)|128);}else{e+=String.fromCharCode((g>>12)|224);e+=String.fromCharCode(((g>>6)&63)|128);e+=String.fromCharCode((g&63)|128);}}}return e;};var a=function(e){var f="";var g=0;var h=c1=c2=0;
while(g<e.length){h=e.charCodeAt(g);if(h<128){f+=String.fromCharCode(h);g++;}else{if((h>191)&&(h<224)){c2=e.charCodeAt(g+1);f+=String.fromCharCode(((h&31)<<6)|(c2&63));g+=2;}else{c2=e.charCodeAt(g+1);c3=e.charCodeAt(g+2);f+=String.fromCharCode(((h&15)<<12)|((c2&63)<<6)|(c3&63));g+=3;}}}return f;};c.extend({base64Encode:function(g){var e="";var o,m,k,n,l,j,h;var f=0;g=d(g);while(f<g.length){o=g.charCodeAt(f++);m=g.charCodeAt(f++);k=g.charCodeAt(f++);n=o>>2;l=((o&3)<<4)|(m>>4);j=((m&15)<<2)|(k>>6);
h=k&63;if(isNaN(m)){j=h=64;}else{if(isNaN(k)){h=64;}}e=e+b.charAt(n)+b.charAt(l)+b.charAt(j)+b.charAt(h);}return e;},base64Decode:function(g){var e="";var o,m,k;var n,l,j,h;var f=0;g=g.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<g.length){n=b.indexOf(g.charAt(f++));l=b.indexOf(g.charAt(f++));j=b.indexOf(g.charAt(f++));h=b.indexOf(g.charAt(f++));o=(n<<2)|(l>>4);m=((l&15)<<4)|(j>>2);k=((j&3)<<6)|h;e=e+String.fromCharCode(o);if(j!=64){e=e+String.fromCharCode(m);}if(h!=64){e=e+String.fromCharCode(k);}}e=a(e);
return e;}});c.cookie=function(f,n,q){if(typeof n!="undefined"){q=q||{};if(n===null){n="";q=$.extend({},q);q.expires=-1;}var j="";if(q.expires&&(typeof q.expires=="number"||q.expires.toUTCString)){var k;if(typeof q.expires=="number"){k=new Date();k.setTime(k.getTime()+(q.expires*24*60*60*1000));}else{k=q.expires;}j="; expires="+k.toUTCString();}var p=q.path?"; path="+(q.path):"";var l=q.domain?"; domain="+(q.domain):"";var e=q.secure?"; secure":"";document.cookie=[f,"=",encodeURIComponent(n),j,p,l,e].join("");
}else{var h=null;if(document.cookie&&document.cookie!=""){var o=document.cookie.split(";");for(var m=0;m<o.length;m++){var g=c.trim(o[m]);if(g.substring(0,f.length+1)==(f+"=")){h=decodeURIComponent(g.substring(f.length+1));break;}}}return h;}};c.ajaxTransport("binary",function(g){var f,h=0,i,e=window.ActiveXObject&&function(){var j;for(j in f){f[j](undefined,true);}};return{send:function(o,j){var m,k,n=g.xhr();n.open(g.type,g.url,g.async);n.responseType="arraybuffer";if(g.mimeType&&n.overrideMimeType){n.overrideMimeType(g.mimeType);
}if(!g.crossDomain&&!o["X-Requested-With"]){o["X-Requested-With"]="XMLHttpRequest";}try{for(k in o){n.setRequestHeader(k,o[k]);}}catch(l){}n.send((g.hasContent&&g.data)||null);i=function(r,q){var p,s,v,t;try{if(i&&(q||n.readyState===4)){i=undefined;if(m){n.onreadystatechange=c.noop;if(e){delete f[m];}}if(q){if(n.readyState!==4){n.abort();}}else{t={};p=n.status;s=n.getAllResponseHeaders();if(g.dataType=="binary"){t.binary=n.response;}else{if(typeof n.responseText==="string"){t.text=n.responseText;
}}try{v=n.statusText;}catch(u){v="";}if(!p&&g.isLocal&&!g.crossDomain){if(g.dataType=="binary"){p=t.binary?200:404;}else{p=t.text?200:404;}}else{if(p===1223){p=204;}}}}}catch(w){if(!q){j(-1,w);}}if(t){j(p,v,t,s);}};if(!g.async){i();}else{if(n.readyState===4){setTimeout(i);}else{m=++h;if(e){if(!f){f={};c(window).unload(e);}f[m]=i;}n.onreadystatechange=i;}}},abort:function(){if(i){i(undefined,true);}}};});})(jQuery);

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
        
        var _CRLF = "\r\n",
        _utils = {  		
            base64ArrayBuffer: function(arrayBuffer) {
                var base64 = '',
                    encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
                    bytes = new Uint8Array(arrayBuffer),
                    byteLength = bytes.byteLength,
                    byteRemainder = byteLength % 3,
                    mainLength = byteLength - byteRemainder,
                    a, b, c, d, chunk;
                for (var i = 0; i < mainLength; i = i + 3) {
                    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
                    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
                    b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
                    c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
                    d = chunk & 63 // 63       = 2^6 - 1
    
                    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
                }
                if (byteRemainder == 1) {
                    chunk = bytes[mainLength]
                    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
                    b = (chunk & 3) << 4 // 3   = 2^2 - 1
                    base64 += encodings[a] + encodings[b] + '=='
                } else if (byteRemainder == 2) {
                    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
                    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
                    b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4
                    c = (chunk & 15) << 2 // 15    = 2^4 - 1
                    base64 += encodings[a] + encodings[b] + encodings[c] + '='
                }
                return base64
            },
            encodeb64: function(data) {
                return $.base64Encode(data).replace(/.{76}(?=.)/g, '$&\r\n');
            },
            URI : function(url) {
                var _ret = {};
                if (url.match(/^((?:http|https):\/\/)([^\/:]+)?(.*)$/gi)) {
                    _ret.host = RegExp.$2
                } else {
                    _ret.host = document.location.hostname;
                }
                return _ret;
            }, 
            html2mime: function(data, _callback) {
                var _self = this,
                    _localhost = document.location.hostname,
                    _def = $.Deferred(), _defs = [],  _def_error = {},
                    _boundary = "related_boundary_" + Math.random().toString().substr(2),
                    _mime = "",
                    _imges = "",
                    _imgcnt = 0,
                    _b64 = function(bin) {return (bin ? _self.base64ArrayBuffer(bin) : "");},
                    _cache = {},
                    _getFileName = function(_h) {
                        var ext = "", subtype = "";
                        if(!_h) {return "";}
                        if(!_h.contentType) {return _h.id;}
                        var _ctype = _h.contentType.split("/");
                        if(_ctype[0]!= "image") {return _h.id;} 
                        if(_ctype.length < 2) {return _h.id;}
                        if (_h.contentType.match(/image\/([^\s]+)$/gi)){
                            subtype = RegExp.$1.toLowerCase();
                            ext = "." + (subtype == "jpeg" ? "jpg" : subtype);
                        }
                        
                        return _h.id + (_h.contentType.match(/image\/([^\s]+)$/gi) ? "." + RegExp.$1 : "");
                    },
                    _imageMime = function(__o) {
                        _imges += "--" + _boundary + _CRLF +
                            "Content-Type: " + __o.contentType + "; name=\"" + _getFileName(__o) + "\"" + _CRLF +
                            "Content-ID: <" + __o.cid + ">" + _CRLF +
                            "Content-Transfer-Encoding: base64" + _CRLF + _CRLF +
                            __o.data.replace(/.{76}(?=.)/g, '$&\r\n') + _CRLF + _CRLF;                        
                        return;
                    },
                    _html = data.replace(/(<img[^>]+src=["']?)([^">'\s]+)(["']?[^>]+?>)/gi,
                        function(s, $1, $2, $3) {
                            var _cid = Math.random().toString().substr(2, 6) + "_" + (++_imgcnt) + "_" + (Math.random().toString().substr(2, 5));
                            if (!_self.URI($2).host.match(new RegExp(_localhost + "$", "gi"))) {return s;}
                            var _o = null;
                            
                            if ($2.match(/data\:(image\/[^;]+);base64,([\S\s]+)/gi)) {
                                var _$1 = RegExp.$1, _$2 = RegExp.$2;
                                _o = {id: _cid, cid: _cid + "@keditor", cnt: _imgcnt,contentType: _$1,data: _$2.replace(/.{76}(?=.)/g, '$&\r\n')};
                                _imageMime(_o);
                                return $1 + "cid:" + _o.cid + $3;
                            }
                            _o = {id : _cid, cid: _cid + "@keditor", cnt: ++_imgcnt, url: $2, dataType: "binary"};
                            if (_cache[_o.url]) {return $1 + "cid:" + _cache[_o.url].cid + $3;};
                            _cache[_o.url] = _o;
                            
                            var $def = $.Deferred();
                            _defs.push($def);
                            
                            $.ajax(_o).then(
                                function(_data, txt, xhr) {
                                    if (_data) {  
                                        $.extend(true, _o, {data : _b64(_data),contentType : xhr.getResponseHeader("content-type")});
                                        _imageMime(_o);
                                    } else {
                                        _def_error[_o.cid] = _o;
                                    }
                                }, 
                                function(xhr, txt, err) {
                                    _def_error[_o.cid] = _o;
                                })
                            .always($def.resolve);
                            return $1 + "cid:" + _o.cid + $3;
                        }
                    );
                    
                _def.done(function() {
                    for(var idx in _def_error){
                        var _o = _def_error[idx];
                        _html = _html.replace("cid:" + _o.cid, _o.url);
                    }
                    var txthtm = _self.encodeb64(_html);
                    var _body = "";
                    _body += "Content-Type: text/html;" + _CRLF;
                    _body += "\tcharset=\"utf-8\"" + _CRLF;
                    _body += "Content-Transfer-Encoding: base64" + _CRLF + _CRLF;
                    _body += txthtm + _CRLF;
                    
                    if (_imges == ""){
                        _mime = "MIME-Version: 1.0" + _CRLF + _body;
                    }else{
                        _mime = "MIME-Version: 1.0" + _CRLF + "Content-Type: multipart/related; boundary=\"" + _boundary + "\"" + _CRLF + _CRLF
                        _mime += "--" + _boundary + _CRLF;
                        _mime += _body + _CRLF +_imges;
                            _mime += "--" + _boundary + "--" + _CRLF;
                    }
                    if (typeof _callback === "function") {
                        _callback(_mime);
                    }
                    return;
                });
                
                $.when.apply($, _defs).done(_def.resolve);
            }
        }

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
        var _empty_span_bg = /((<(span|strike|u|i|em|b|strong|font)[^>]*?>)*?(<span[^>]+?background[^>]+?>)(<(span|strike|u|i|em|b|strong|font)[^>]*?>)*?)(<br>|\uFEFF)?((<\/(span|strike|u|i|em|b|strong|font)>)+)/gi;
	var _bg_style = /background(\-color)?\s*:[^;]*;?/gi;
        Adapter.prototype = {
            'setHtml':function(_html) {
                _html = _html.replace(/\s*<meta[^>]*?>\s*<\/meta>\s*/g, '');
                _html = _html.replace(/\s*<meta[^>]*?>\s*/g, '');
                this.editor.modify({'content':_html});
            },
            'getText':function(args) {
            	_beforeAttr = [];
            	_dom = this.kEditor.getDom(args);
            	_div = _dom.getElementsByTagName('div');
            	for(i=0;i<_div.length;i++) {
            		if (_div[i].getAttribute('data-id')=='sign_card') {
            			_beforeAttr.push(_div[i].getAttribute('style'));
            			_div[i].setAttribute('style', 'display:none');
            		} else {
            			_beforeAttr.push('');
            		}
            	}
            	_text = _dom.body.innerText.replace(/\n\n/g, '\n');
            	for(i=0;i<_div.length;i++) {
            		if (_div[i].getAttribute('data-id')=='sign_card') {
            			_div[i].setAttribute('style', _beforeAttr[i]);
            		}
            	}                
                return _text;
            },            
            'getHtml':function(args) {
                html = this.editor.getCanvas().getPanel('html').getContent();
                if(args && args.removeBackgroundStyleEmptySpan){
                    try{
                        html = html.replace(_empty_span_bg, function(all,b,t1,t2,t3,t4,t5,e,a){
                            try{
                                var _b = b.split('>');
                                var _a = a.split('>');
                                var _bb = _b.splice(0, _b.length - _a.length);
                                _b = _b.join('>').replace(_bg_style, '');
                                if(_bb.length > 0) _b = _bb.join('>') + '>' + _b;
                                return _b + (e||'') + a;
                            }catch(err){
                                return all;
                            }
                        });
                    }catch(e){}
                }
                return html;
            },
            'getBodyValue': function(args){
                var _html = this.kEditor.getHtml(args);
                return _html;
            },
            'getHtmlValue': function(args){
                var _body = this.kEditor.getBodyValue(args);
                return '<html><head><style>' + this.kEditor.getHeadStyle() + '</style></head><body>' + _body + '</body></html>';
            },
            'getDom':function() {
                return this.editor.getCanvas().getPanel('html').getDocument();
            },
            'setFocus':function(){
                var _canvas = this.editor.getCanvas();
                try{if(_canvas) _canvas.focus();}catch(e){}
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
                var toolbarHeight = 0;
                if(toolbar){
                    toolbarHeight = toolbar.el.offsetHeight;
                    if(!$tx.msie) toolbar.el.style.overflow = 'hidden';
                    if(toolbarHeight < toolbar.el.scrollHeight) toolbarHeight = toolbar.el.scrollHeight;
                    if(!$tx.msie) toolbar.el.style.overflow = 'visible';
                }
                var bottomTab = $tx("tx_bottom_tab" + this.editor.initialConfig.initializedId);
                height -= (bottomTab?bottomTab.offsetHeight:0);
                var preview = $tx("tx_preview" + this.editor.initialConfig.initializedId);
                if(preview) preview.style.height = height + 'px';
                height -= (toolbar?toolbarHeight:0) + this.kEditor.resizeBarSize;
                canvas.setCanvasSize({
                    height: height
                });
                canvas.fireJobs('canvas.height.change', height);
            },
            'getMode':function() {
                return this.editor.getCanvas().mode;
            },
            'getHeadStyle':function() {
                /**
                 * setFontStyle 참조
                 */
                var style = this.kEditor.getDefaultStyle();
                return 'p {margin:0;padding:0;}'
                + ' body, td, button, p { color:' + style.color + '; font-size:' + style.fontSize + '; font-family:' + style.fontFamily + '; line-height:' + style.lineHeight + '; }'
				+ ' a, a:hover, a:link, a:active, a:visited { color:' + style.color + '; }';
            },
            'getDefaultStyle':function(){
                var style = $.extend(true, {color: "#123456",
                    fontFamily: "맑은 고딕",
                    fontSize: "10pt",
                    backgroundColor: "#fff",
                    lineHeight: "1.5",
                    padding: "15px"}, this.kEditor.editor.config.canvas.styles);
                return style;
            },
            'getSaveHtml':function(args) {
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
                        var _html = _self.kEditor.getHtml(args);
                        _html = Trex.KEditor.htmlLocalImageUpload(_self.kEditor, _html);
                        _html = '<html><head><style>' + _self.kEditor.getHeadStyle() + '</style></head><body>' + _html + '</body></html>';
                        if(_self.kEditor.config.beforeSaveHtml){
                            _html = _self.kEditor.config.beforeSaveHtml(_html);
                        }
                        // console.log('htmlLocalImageUpload success');
                        return _html;
                    }
                );
                return promise;
            },
            'setTranslate':function(translateFn){
                this.editor.setTranslate(translateFn);
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
                    imageEditorPath: '',
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
                if(!_self.config.previewInitHTML) _self.config.previewInitHTML = function(){
                    return '<!doctype html><html><head><style>' + _self.getHeadStyle() + '</style></head><body></body></html>';
                };
                if(!_self.config.previewBodyHTML) _self.config.previewBodyHTML = function(){
                    return _self.getHtml();
                };
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
                    'fontList':_self.config.font_list,
                    'imageEditorPath':_self.config.imageEditorPath,
                    'previewInitHTML': _self.config.previewInitHTML,
                    'previewBodyHTML': _self.config.previewBodyHTML
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
                            padding: "12px"
                        });
                }
                EditorJSLoader.ready(function(Editor) {
                    config.deferred = dfd;
                    if(_self.config.jsLoadComplete) _self.config.jsLoadComplete(Editor, config);
                    var editor = new Editor(config);
                    // 버튼 show/hide
                    if(config.imageEditorPath){
                        $('#tx_image_edit' + config.initializedId||'').parent().show();
                    }
                    if(_self.config.voice && _self.config.voice.enable){
                        $('#tx_voice' + config.initializedId||'').parent().show();
                    }
                    if(_self.config.recorder && _self.config.recorder.enable){
                        $('#tx_recorder' + config.initializedId||'').parent().show();
                    }            
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
                        if(_self.editor.initPreviewIframe) _self.editor.initPreviewIframe();
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
            'getMime':function(_callback) {
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return _utils.html2mime(this._adapter.getHtml(), _callback);
            },
            'getMimeFrom':function(data, _callback) {
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return _utils.html2mime(data, _callback);
            },
            'getText':function(args) {
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return this._adapter.getText(args);
            },            
            'getHtml':function(args) {
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return this._adapter.getHtml(args);
            },
            'setFocus':function(){
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return this._adapter.setFocus();
            },
            'getBodyValue': function(args){
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return this._adapter.getBodyValue(args);
            },
            'getHtmlValue': function(args){
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return this._adapter.getHtmlValue(args);
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
            'getDefaultStyle':function(){
                return this._adapter.getDefaultStyle();
            },
            'getSaveHtml':function(args) {
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return this._adapter.getSaveHtml(args);
            },
            'setHeight':function(height) {
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return this._adapter.setHeight(height);
            },
            'setTranslate':function(translateFn){
                if(!this.isInit) throw new Error(_getErrorEditorLoad());
                return this._adapter.setTranslate(translateFn);
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
            '_eventDrop': function(e){
                if(this.config.dropEvent) return this.config.dropEvent(e);
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
                var _host = document.location.protocol + "//" + document.location.host;
                if(upload_type == "control" && _url.indexOf(_host) == -1) _url = _host + _url;
                return {
                    'type':'domino',
                    'cid':_cid,
                    'name':_name,
                    'url':_url,
                    'host':_host,
                    'fieldname':'%%File',
                    'postdata':{
                        'ImageBody':'',
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
                        var json = null;
                        try{                            
                            json = eval("(" + uploadResult + ")");
                        }catch(e){json = null;}
                        if(json){
                            var img_src = this._createImageUrl(info.host, json.url);
                            result = {img_src:img_src, uploadResult:uploadResult, imageName:info.name};
                        }
		            }
                }else if(uploadType == "applet"){
                    if(uploadResult){
                        var json = null;
                        try{
                            json = eval("(" + uploadResult + ")");
                        }catch(e){json = null;}
                        if(json != null){
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
                if(!domain) domain = domain = document.location.hostname.substring(document.location.hostname.indexOf(".") + 1).toLowerCase();
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
        EDITOR.getInlineStyleHtml = function(_html, ignoreProps, wrapBody) {
            var styles = Trex.KEditor._getStyles(_html);
	if(styles && styles.length>0) {
            //if(styles && styles.length>1) {
            	var tmp_style = []
            	tmp_style.push(styles[0])
            	 _html = Trex.KEditor.inlineStyle(tmp_style, _html, ignoreProps, wrapBody);
            } else {
	//2023.05.10 에디터 html안에 style이 inline으로 추가되지 않은 문제 수정
	styles = [];
	styles.push("<style>" + _form.kEditor.getHeadStyle() + "</style>");
	if(_html == ""){
		_html = "<p><br></p>";
	}
            	 _html = Trex.KEditor.inlineStyle(styles, _html, ignoreProps, wrapBody);
            }
            return _html;
        };
        window.KEditor = EDITOR;
    })();
}