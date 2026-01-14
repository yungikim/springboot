if(window.kEditorApOn == null){ 
    (function(){
        window.kEditorApOn = function(ui, wrapper, imageLinkKey, unid){
            if(window.ImageUploader){
    				ImageUploader.deploy();
    		}
            var _wrapper = wrapper;
            var _uidoc = $ep.ui.doc($(".formpage", ui));
            var page_scroll = $(".frm_page_scroll", ui)[0];
            var _instanceId = unid + '' + (window.kEditorApOn.InstanceCount++);
            var _imageLinkKey = imageLinkKey;
            if(!window._KEDITOR_PATH) window._KEDITOR_PATH = '/res/core/keditorv3';
            var _keditor = KEditor.build({
                'instanceId':_instanceId,
                'language':(window._KEDITOR_LANGUAGE?window._KEDITOR_LANGUAGE:''),
                'wrapper':_wrapper,
                'form':_uidoc.elements.form[0].name,
                'iconPath':window._KEDITOR_PATH + '/images/icon/editor',
                'decoPath':window._KEDITOR_PATH + '/images/deco/contents',
                'skinPath':window._KEDITOR_PATH + '/images/icon/editor/skin/01',
                'imageUploadPath':function(){
                        return '/' + (_uidoc.options.server?_uidoc.options.server + '/':'') 
                            + 'ngw/core/temporarily.nsf/ImageUploadv3?OpenForm'
						    + '&ImageLinkKey=' + encodeURIComponent(imageLinkKey)
						    + '&prefix=' + _uidoc.options.server;
                }
                ,
				'largeToolbar': true,
				//'showBottomTab': true,
                'imageLinkKey':imageLinkKey,
                'imageUploader':window.ImageUploader,
				'imageEditorPath': window._KEDITOR_PATH + '/image_editor/main.html?open',
                'beforeSaveDom':function(dom){
                },
                'beforeSaveHtml':function(html){
                    return html;
                }, //getSaveHtml 에서 처리할 내역
                'confirmPasteType':true, // 이미지로 붙여넣을지 confirm
                'core':{
                    'canvas':{
                        initHeight:410		// 411
                    }
                },
                'method':{
                    '_createImageUrl':function(_host, _path){
                        return _host + (_uidoc && _uidoc.options.server?'/' + _uidoc.options.server:'') + _path;
                    }
                },
                'fullscreenEvent':function(isFull, isBefore) {
                    // if(!_form.wrapper) return;
                    var height = 450;
                    if(isFull && isBefore){
                        var scrollElem = null;
                        if($(page_scroll).css('overflow-y') == "visible"){
                            height = window.document.body.offsetHeight - 4;
                            scrollElem = window.document.body;
                        }else if(page_scroll){
                            height = page_scroll.offsetHeight - 4;
                            scrollElem = page_scroll;
                        }
                         $(_wrapper).css({"height":height + "px"});                         
                        _keditor.setHeight(height);
                        if(scrollElem == window.document.body){if(window.scrollTo) window.scrollTo(0, $(_wrapper)[0].offsetTop);}
                        else scrollElem.scrollTop = $(_wrapper)[0].offsetTop - page_scroll.offsetTop;
                    }else if(!isFull && isBefore){
                         $(_wrapper).css({"height":height + "px"});
                        _keditor.setHeight(height);
                    }
                    return false;
                },
                'jsLoadComplete':function(){
                    
                }
                /*,'font_list':[
                    { label: '<span f-style>맑은 고딕</span> (<span class="tx-txt">가나다라</span>)', title: '맑은 고딕', data: 'Malgun Gothic,맑은 고딕,sans-serif', klass: '' }
                ]*/
            });
            _keditor["do"](
                function(adapter){
                    var WEC = {
                        parent : function(){return document.parentIFrameElement;}
                        ,onLoadComplete : function(){
                            _wrapper.data("WEC",this);
                            _wrapper.trigger("initEditorComplete",WEC); 				
                        }
                        ,getHTML : function(){
                            return adapter.getHtml();
                        }
                        ,saveHTML : function(uidoc, _html){
                            if(adapter.editor.getCanvas().mode != "html")
                                adapter.editor.getCanvas().changeMode('html');
                            if(!_html) return adapter.getHtml();
                            var html = _html;
                            var compNewCids = {}, newCids = [];
                            var compOldCids = {}, oldCids = [];
                            var _imageLinkKey = (uidoc.elements.form[0].MIMEMerge_ImageLinkKey||{value:uidoc.options.unid}).value;
                            var newImageRegExp = null;
                            eval("(newImageRegExp = /[\"'][^\"']*\\/Body\\/M2\\?OpenElement(?:\\&amp;|\\&)linked\\=" + _imageLinkKey + "(?:\\&amp;|\\&)cid\\=([^\"']*)[\"']/gi)");
                            html = html.replace(newImageRegExp, function(a, b){
                                if(compNewCids[b] == null){
                                    newCids.push(b);
                                    compNewCids[b] = true;
                                }
                                return "\"cid:" + b + "\"";
                            });
                            var oldImageRegExp = null;
                            eval("(oldImageRegExp = /[\"'][^\"']*\\?OpenElement(?:\\&amp;|\\&)linked\\=" + _imageLinkKey + "_OLD(?:\\&amp;|\\&)cid\\=([^\"']*)[\"']/gi)");
                            html = html.replace(oldImageRegExp, function(a, b){
                                if(compOldCids[b] == null){
                                    oldCids.push(b);
                                    compOldCids[b] = true;
                                }
                                return "\"cid:" + b + "\"";
                            });
                            
                            uidoc.elements.form[0].Body_NewCids.value = newCids.join("; ");
                            uidoc.elements.form[0].Body_OldCids.value = oldCids.join("; ");
                            
                            return html;
                        }
                        ,getText : function(){
                            var editor = _keditor.editor.getCanvas().getPanel('html').iframe.contentWindow.document.body;
                            return editor.textContent||editor.innerText;
                        }
                        ,setHTML : function(html){
                           adapter.setHtml(html);
                        }
                        ,getStyle : function() {
                            var _style =  _keditor.editor.getCanvas().getStyleConfig();
                            //_style.fontFamily = "{TOOLBAR.FONTFAMILY_DEFAULT}";
                            return _style;
                        }
                        ,init : function(uidoc){
                            _uidoc = uidoc;
                            this.kEditorV2 = KEditor;
                            this.kEditorV2Instance = _keditor;
                            this.kEditorCanvas = _keditor.editor.getCanvas().getPanel('html').iframe;
                            this.kEditorTrex = Trex;
                            this.kEditorVersion = "v2";
                        }
                        ,destroy:function(){
                            try{
                                delete window.Editor.__MULTI_LIST[_keditor.instanceId];
                            }catch(e){}
                        }
                    };
                    WEC.onLoadComplete();
                }
            )
            /*.setHtml(
                //KEditor.getInlineStyleHtml(document.forms[0].Body_EDITOR.value)
            )*/
            ;
        };
        window.kEditorApOn.InstanceCount = 0;
    })();
}