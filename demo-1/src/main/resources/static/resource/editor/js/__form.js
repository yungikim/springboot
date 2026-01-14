if(typeof(window.__UI._FORM) == "undefined") {
	__UI._FORM = {
		_parent:"UI",
		_class_name:"FORM",
		_initialize:function(_window, _info){
			$super(null, null, _window);
			this._info = _info;
			this._init();
		},

		"_init": function() {			
			var _self = this;
			_self._page_content_inner = 'editor_wrapper';
			if (this._info.DocMode == 'read') {
				this._init_read();
			} else {
				this._init_edit("editor_wrapper");				
			}
		},
		"_init_read":function(){
			var _self = this;
			$(document).ready(function(){
				_self.getDocBody(_self.readDoc.bind(_self));
			});
		},
		"_init_edit":function(id){
			var _self = this;
			this.keditor = KEditor.build({
				'instanceId':'001',
				'wrapper':'#' + id,
				'language':(window._i18n_editor&&window._i18n_editor.language||'ko'),
				'form':'chat',	//document.forms[0].name,
				'iconPath': '/' + window._KEDITOR_BASE_PATH + '/images/icon/editor',
				'decoPath': '/' + window._KEDITOR_BASE_PATH + '/images/deco/contents',
				'skinPath': '/' + window._KEDITOR_BASE_PATH + '/images/icon/editor/skin/01',
				'imageUploadPath':'/common/images.nsf/ImageUploadKEditor?OpenForm&ImageLinkKey=' + window._KEDITOR_ImageLinkKey,
				'imageEditorPath': '/' + window._KEDITOR_BASE_PATH + '/image_editor/main.dev.html?open',
				'imageLinkKey': window._KEDITOR_ImageLinkKey,
				'imageUploader':window.ImageUploader,
				'confirmPasteType':true,
				'dropEvent':function(e){
				},				
				'imageLimitSize':(10 * 1024 * 1024), //10MB
				'largeToolbar': true,
				'showBottomTab': true,
				'font_list':[
{ label: '<span f-style>맑은 고딕</span> (<span class="tx-txt">가나다라</span>)', title: '맑은 고딕', data: "'Malgun Gothic','맑은 고딕'", klass: '' },
{ label: '<span f-style>나눔고딕</span> (<span class="tx-txt">가나다라</span>)', title: '나눔고딕', data: "나눔고딕", klass: '' },
{ label: '<span f-style>굴림</span> (<span class="tx-txt">가나다라</span>)', title: '굴림', data: 'Gulim,굴림', klass: '' },
{ label: '<span f-style>굴림체</span> (<span class="tx-txt">가나다라</span>)', title: '굴림체', data: '굴림체', klass: '' },
{ label: '<span f-style>돋움</span> (<span class="tx-txt">가나다라</span>)', title: '돋움', data: 'Dotum,돋움,sans-serif', klass: '' },
{ label: '<span f-style>돋움체</span> (<span class="tx-txt">가나다라</span>)', title: '돋움체', data: '돋움체', klass: '' },
{ label: '<span f-style>바탕</span> (<span class="tx-txt">가나다라</span>)', title: '바탕', data: 'Batang,바탕', klass: '' },
{ label: '<span f-style>궁서</span> (<span class="tx-txt">가나다라</span>)', title: '궁서', data: 'Gungsuh,궁서', klass: '' },
{ label: '<span f-style>궁서체</span> (<span class="tx-txt">가나다라</span>)', title: '궁서체', data: '궁서체', klass: '' },
{ label: '<span f-style>Arial</span> (<span class="tx-txt">abcde</span>)', title: 'Arial', data: 'Arial', klass: '' },
{ label: '<span f-style>Arial narrow</span> (<span class="tx-txt">abcde</span>)', title: 'Arial narrow', data: "'Arial narrow'", klass: '' },
{ label: '<span f-style>Courier new</span> (<span class="tx-txt">abcde</span>)', title: 'Courier new', data: "'Courier new'", klass: '' },
{ label: '<span f-style>Century gothic</span> (<span class="tx-txt">abcde</span>)', title: 'Century gothic', data: "'Century gothic'", klass: '' },
{ label: '<span f-style>Comic sans ms</span> (<span class="tx-txt">abcde</span>)', title: 'Comic sans ms', data: "'Comic sans ms'", klass: '' },
{ label: '<span f-style>Tahoma</span> (<span class="tx-txt">abcde</span>)', title: 'Tahoma', data: 'Tahoma', klass: '' },
{ label: '<span f-style>Segoe UI</span> (<span class="tx-txt">abcde</span>)', title: 'Segoe UI', data: "'Segoe UI'", klass: '' },
{ label: '<span f-style>Trebuchet MS</span> (<span class="tx-txt">abcde</span>)', title: 'Trebuchet MS', data: "'Trebuchet MS'", klass: '' },
{ label: '<span f-style>Verdana</span> (<span class="tx-txt">abcde</span>)', title: 'Verdana', data: 'Verdana', klass: '' },
{ label: '<span f-style>MS GOTHIC</span> (<span class="tx-txt">abcde</span>)', title: 'MS GOTHIC', data: "'MS GOTHIC'", klass: '' },
{ label: '<span f-style>MS PGOTHIC</span> (<span class="tx-txt">abcde</span>)', title: 'MS PGOTHIC', data: "'MS PGOTHIC'", klass: '' },
{ label: '<span f-style>宋体</span> (<span class="tx-txt">ABCDE</span>)', title: '宋体', data: 'SimSun', klass: '' }
				],
	/*
				'method':{
					'_checkExternalImage':function(src, domain){
						if(!domain) domain = domain = document.location.hostname.substring(document.location.hostname.indexOf(".") + 1).toLowerCase();
						var host = document.location.hostname.toLowerCase();
						return (src.toLowerCase().indexOf(domain) != -1
								&& src.toLowerCase().indexOf(host) == -1);
					}
				},
				
	*/
				'core':{}
				/*,
				'font_list':[
					{ label: '<span f-style>맑은 고딕</span> (<span class="tx-txt">가나다라</span>)', title: '맑은 고딕', data: 'Malgun Gothic,맑은 고딕,sans-serif', klass: '' }
				],
				hideMenus: [
					`fontfamily`, //폰트 리스트
					`fontsize`, //폰트 크기
					`bold`, //볼드
					`underline`, //under line
					`italic`, //italic
					`strike`, //strike
					`forecolor`, //글자색
					`backcolor`, //글자 배경색
					`alignleft`, //왼쪽정렬
					`aligncenter`, //가운데정렬
					`alignright`, //오른쪽정렬
					`alignfull`, //양쪽정렬
					`indent`, //들여쓰기
					`outdent`, //내어쓰기
					`lineheight`, //줄간격
					`styledlist`, //리스트
					`link`, //링크
					`image`, //이미지
					`image_edit`, //이미지 편집기
					`media`, //외부컨텐츠
					`recorder`, //음성 녹음
					`specialchar`, //특수문자
					`table`, //표만들기
					`horizontalrule`, //구분선
					`richtextbox` //글상자
				],
				hideMenuBars: [
					`font`, //볼드 앞의 구분자
					`align`, //왼쪽정렬 앞의 구분자
					`tab`, //들여쓰기 앞의 구분자
					`list`, //줄간격 앞의 구분자
					`etc`// 링크 앞의 구분자
				]*/
			});
			this.keditor['do'](function(adapter) {
				_self.load_complete(adapter);

				//adapter.setHtml('');
				//adapter.getHtml();
				//adapter.getDom();
				//adapter.changeMode('html');
				//adapter.getMode();
				//adapter.getSaveHtml();
			});
			
			
		},
		"load_complete": function(adapter) {
			var _self = this;
			
			// 번역기능 주석 처리(19.5.9))
//			if (adapter.setTranslate) {
//				adapter.setTranslate(function(txt, html, callback, range){
//					if(txt.replace(/\s*/g, '') == ""){
//						alert('번역할 문구를 선택 후 버튼을 클릭하여 주십시오.');
//						return;
//					}
//					_self.translatePopup(txt, html, callback, range);
//				});
//			}
			
			
			if (this._info.DocMode == 'edit') {				
				this.getDocBody(function(_data){
					var _head_reg = new RegExp(/<head[^>]*>((.|[\n\r])*)<\/head>/gi);
					var _body_reg = new RegExp(/<body[^>]*>((.|[\n\r])*)<\/body>/gi);
					
					var _head_arr = _head_reg.exec(_data);
					var _body_arr = _body_reg.exec(_data);
					
					if (_body_arr.length > 0) {
						adapter.setHtml(_body_arr[1]);
					}
				});
			}
		},

		"_translate_type":function(){
			if(this._init_translate_type) return;
			this._init_translate_type = true;	
			var lang = this._info.Language;
			this._translate_lang_range = {
				'ko':/[\uAC00-\uD7AF]/,
				'ja':/[\u3040-\u30FF]/		
			};
			this._translate_lang = {
				'auto':{'key':'auto', 'value':(lang == "Kor"?"언어감지":"Detect language"), 'enable':/google/},
				'ko':{'key':'ko', 'value':(lang == "Kor"?"한국어":"Korean")},
				'en':{'key':'en', 'value':(lang == "Kor"?"영어":"English")},
				'ja':{'key':'ja', 'value':(lang == "Kor"?"일본어":"Japanese")},
				'zh-CN':{'key':'zh-CN', 'value':(lang == "Kor"?"중국어(간체)":"Chinese (Simplified)")},
				'zh-TW':{'key':'zh-TW', 'value':(lang == "Kor"?"중국어(번체)":"Chinese (Traditional)")},
				'es':{'key':'es', 'value':(lang == "Kor"?"스페인어":"Spanish")},
				'fr':{'key':'fr', 'value':(lang == "Kor"?"프랑스어":"French")},
				'vi':{'key':'vi', 'value':(lang == "Kor"?"베트남어":"Vietnamese")},
				'th':{'key':'th', 'value':(lang == "Kor"?"태국어":"Thai")},
				'id':{'key':'id', 'value':(lang == "Kor"?"인도네시아어":"Indonesian")}				
			};
			this._translate_target = {
				'papago':{			
					'ko':['en','ja','zh-CN','zh-TW','es','fr','vi','th','id'],
					'en':['ko','ja','fr'],
					'ja':['ko'],
					'zh-CN':['ko'],
					'zh-TW':['ko'],
					'es':['ko'],
					'fr':['ko'],
					'vi':['ko'],
					'th':['ko'],
					'id':['ko']
				},
				'google':{
					'auto':['ko','en','ja','zh-CN','zh-TW','es','fr','vi','th','id'],
					'ko':['en','ja','zh-CN','zh-TW','es','fr','vi','th','id'],
					'en':['ko','ja','zh-CN','zh-TW','es','fr','vi','th','id'],
					'ja':['ko','en','zh-CN','zh-TW','es','fr','vi','th','id'],
					'zh-CN':['ko','en','ja','zh-TW','es','fr','vi','th','id'],
					'zh-TW':['ko','en','ja','zh-CN','es','fr','vi','th','id'],
					'es':['ko','en','ja','zh-CN','zh-TW','fr','vi','th','id'],
					'fr':['ko','en','ja','zh-CN','zh-TW','es','vi','th','id'],
					'vi':['ko','en','ja','zh-CN','zh-TW','es','fr','th','id'],
					'th':['ko','en','ja','zh-CN','zh-TW','es','fr','vi','id'],
					'id':['ko','en','ja','zh-CN','zh-TW','es','fr','vi','th']
				}
			};
		},

		"_translateCheck":function(e, iframe, doc){
			if(!doc) return;
			var info = this._selectionString(doc);
			var is_show = info.text.replace(/\s*/g, '') != '';
			if(is_show){
				this._translateCheckInfo = info;
				var pos = __dom.get_position(iframe, this._page_content_inner);
	//				console.log(info.pos, pos.y - this._page_content_inner.parentNode.scrollTop);
				info.pos+=pos.y;// - this._page_content_inner.parentNode.scrollTop;
			}
			this._translateIconShow(info, is_show, doc);
		},

		"_translateIconShow":function(info, is_show, doc){
			var _self = this;
			if(!this._translateIconInit && is_show){
				this._translateIconInit = true;
				this._translateIcon = document.createElement("div");
				this._translateIcon.className = "translateIcon";				
	//				document.body.appendChild(this._translateIcon);
				this._page_content_inner.appendChild(this._translateIcon);
				this._translateIcon.innerHTML = '<div class="icon"></div>';	
				
				this._translateIcon.addEventListener('click', function(e){
					if(_self._translateCheckInfo.text) _self.translatePopup(_self._translateCheckInfo.text);
				});
			}
			if(is_show && this._translateIcon){
				this._translateIcon.style.top = info.pos + 'px';
				this._translateIcon.style.opacity = '';
			}else if(this._translateIcon){
				this._translateIcon.style.opacity = 0;
			}
		},

		"_selectionString":function(doc){
			var win = doc.parentWindow || doc.defaultView;
			var range = null, txt, html;
			var _sel = win.getSelection || win.document.getSelection;
			var pos = 0;
			if(_sel){
				var sel = _sel();
				txt = sel + '';
				if(txt){
					range = sel.getRangeAt(0);
					var elem = range.startContainer;  
					try{
						if(elem) pos = __dom.get_position(elem.nodeType != 1?elem.parentNode:elem).y;
					}catch(e){}                	
					var _clone = range.cloneContents();
					var div = document.createElement('div');
					div.appendChild(_clone);
					html = div.innerHTML;
					var tmp = $('<div></div>');
					if(__browser.is_ie){
						tmp.html(html.replace(/<div/gi, "<span").replace(/<\/div>/gi, "</span>").replace(/><br\/?></gi, '><'));
						$("p", tmp).css({"display":"inline"});
					}else{
						tmp.html(html.replace(/<p/gi, "<div").replace(/<\/p>/gi, "</div>"));
					}
					txt = (tmp[0].innerText||tmp[0].textContent||txt);
				}
			}else if(win.document.selection){
				range = win.document.selection.createRange().text;
				txt = range.text;
				html = range.htmlText;
			}
			return {text:txt, html:html, pos:pos};
		},

		"translatePopup": function(txt, html, callback, range){
			var lang = this._info.Language;
			var _self = this;
			if(!this._translatePopup){
				this._getTranslateOptions();
				var dialogEvt = new (__UI.ClassLoader("DIALOG_EVENT_ADAPTER"))();
				dialogEvt.close = function(){
					/*
					try{
						if(_self._info._shortCuts) _self._info._shortCuts.DISABLED = false;
					}catch(e){}	
					*/
					return true;
				};
				this._translatePopup = new (__UI.ClassLoader("DIALOG"))(
						this._window
						,__UI.CONST.DIALOG.MOVE_WINDOW
						|__UI.CONST.DIALOG.TITLE
						|__UI.CONST.DIALOG.CLOSE
						|__UI.CONST.DIALOG.CUSTOMIZE
						|__UI.CONST.DIALOG.MODAL
						, dialogEvt
						, "_main");
				this._translate_type();
				this._translatePopup.set_title("Translate");
				var source = '<select id="translateSrcLang" onchange="__UI.get_instance(\'' + this._instance_id + '\')._changeTranslateSrcLang(null);">';
				source += '</select>';
				this._translatePopup.set_html(
						'<div class="dialog_content" style="width:700px;" id="translateWrapper">'
						+'<div style="padding:0px;overflow:hidden;overflow-y:auto;">'
						+ source 
						+'&nbsp;'
						+ '<label class="cls_custom_radio"><input type="radio" name="vendor" id="vendor_1" onclick="__UI.get_instance(\'' + this._instance_id + '\')._changeTranslateVendor(this);" value="papago"' + (this._translateDefaultOptions.vendor == "papago"?" checked":"") + '><span class="icon"></span><span class="text">Papago</span></label>'
						+ '<label class="cls_custom_radio"><input type="radio" name="vendor" id="vendor_2" onclick="__UI.get_instance(\'' + this._instance_id + '\')._changeTranslateVendor(this);" value="google_text"' + (this._translateDefaultOptions.vendor == "google_text" || (!html && this._translateDefaultOptions.vendor == "google_html")?" checked":"") + '><span class="icon"></span><span class="text">Google(Text)</span></label>'
						+ (html?'<label class="cls_custom_radio"><input type="radio" name="vendor" id="vendor_3" onclick="__UI.get_instance(\'' + this._instance_id + '\')._changeTranslateVendor(this);" value="google_html"' + (this._translateDefaultOptions.vendor == "google_html"?" checked":"") + '><span class="icon"></span><span class="text">Google(Html)</span></label>':'')
						+'&nbsp;&nbsp;&nbsp;<span class="small_btn" id="translationBtn" onclick="__UI.get_instance(\'' + this._instance_id + '\')._translation(event);">' + (lang=="Kor"?'번역하기':'Translation') + '</span>'
						+'<div id="translateSrc" style="margin-top:5px;margin-bottom:5px;padding:5px;min-height:50px;max-height:150px;overflow:hidden;overflow-y:auto;border:1px solid #ededed;"'
						+' contenteditable onpaste="__UI.get_instance(\'' + this._instance_id + '\')._translatePopupPaste(event);"'
						+' onkeyup="__UI.get_instance(\'' + this._instance_id + '\')._translatePopupLayout(event);"'
						+'></div>'
						+'<select id="translateTrgLang" onchange="__UI.get_instance(\'' + this._instance_id + '\')._changeTranslateTrgLang(null);"></select>'
						+'<div id="translateTrg" style="margin-top:5px;padding:5px;min-height:50px;max-height:150px;overflow:hidden;overflow-y:auto;border:1px solid #ededed;"></div>'
						+'</div>'
						+'<div class="cls_dialog_btn_wrapper">'
						+ (callback?'<span class="pop_btn" onclick="__UI.get_instance(\'' + this._instance_id + '\')._translatePopupCallback();">Insert</span>':'')
						+ '<span  class="pop_btn btn_cancel" onclick="__UI.get_instance(\'' + this._instance_id + '\')._translatePopup.dialog_close();">Close</span>'
						+ '</div></div>'
				);
				this._trnaslateVendor = [
										 this._get_id_obj("vendor_1"),
										 this._get_id_obj("vendor_2")
										 ];
				if(html) this._trnaslateVendor.push(this._get_id_obj("vendor_3"));
				this._translateWrapper = this._get_id_obj('translateWrapper');
				this._translationBtn = this._get_id_obj("translationBtn");
				this._translateSrc = this._get_id_obj("translateSrc");
				this._translateTrg = this._get_id_obj("translateTrg");
				this._translateSrcLangOpt = this._get_id_obj("translateSrcLang").options;
				this._translateTrgLangOpt = this._get_id_obj("translateTrgLang").options;
			}
			if(this._page_content_inner.offsetWidth < 700) this._translateWrapper.style.width = (this._page_content_inner.offsetWidth - 20) + 'px';
			var source_lang = null;//this._translateDefaultOptions.source;
			this._translatePopup._detectLang = '';
			for(var idx in this._translate_lang_range){
				var range = this._translate_lang_range[idx];
				if(range && range.test(txt)){
					source_lang = idx;
					this._translatePopup._detectLang = source_lang;
					this._translateDefaultOptions.source = source_lang; // 자동으로 찾은 언어를 기본으로(저장안함)
					break;
				}
			}
			this._translatePopup._originSrc = {text:txt, html:html};
			this._translatePopup._translate_callback = callback;
			this._drawTranslateSrcLang(true);
			this._changeTranslateSrcLang(source_lang);
			if(this._translateDefaultOptions.vendor == "google_html"){
				this._translateSrc.innerHTML = html;	
			}else{
				this._translateSrc.innerHTML = txt.replace(/\r/g, '').replace(/\n/g, '<br>');	
			}
			this._translation();
			this._translatePopup.show_center();
		},

		"_getTranslateVendor":function(){
			var vendor = 'papago';
			for(var i = 0; i < this._trnaslateVendor.length; i++){
			if(this._trnaslateVendor[i].checked){
				vendor = this._trnaslateVendor[i].value;
				break;
			}
			}
			return vendor;
		},

		"_drawTranslateSrcLang":function(flag){
			var vendor = this._getTranslateVendor();
			var opt = this._translateSrcLangOpt;
			var selected = (opt.selectedIndex > -1?opt[opt.selectedIndex].value:'');
			opt.length = 0;
			if(selected == '' && vendor != 'papago') selected = 'auto';
			else if((selected == 'auto' || selected == '') && vendor == 'papago') selected = this._translateDefaultOptions.source;
			for(var idx in this._translate_lang){
			var item = this._translate_lang[idx];
			if(!item.enable || item.enable.test(vendor)){
				opt.length++;
				opt[opt.length - 1].value = item.key;
				opt[opt.length - 1].text = item.value;
				if(flag && item.key == selected) opt[opt.length - 1].selected = true;
			}
			}
		},

		"_changeTranslateSrcLang":function(key){
			var vendor = this._getTranslateVendor();
			var opt = this._translateSrcLangOpt;
			var trgOpt = this._translateTrgLangOpt;
			if(key){
			for(var i = 0; i < opt.length; i++){
				if(opt[i].value == key){
				opt[i].selected = true;
				break;
				}
			}
			}
			var src = opt[opt.selectedIndex].value;
			var trg = '';
			if(key) trg = this._translateDefaultOptions.target[key];
			else if(trgOpt.selectedIndex > -1) trg = trgOpt[trgOpt.selectedIndex].value;
			var vendor_key = vendor != 'papago'?'google':vendor;
			trgOpt.length = 0;
			for(var i = 0; i < this._translate_target[vendor_key][src].length; i++){
			var item = this._translate_lang[this._translate_target[vendor_key][src][i]];
			trgOpt.length++;
			trgOpt[trgOpt.length - 1].value = item.key;
			trgOpt[trgOpt.length - 1].text = item.value;
			if(item.key == trg) trgOpt[trgOpt.length - 1].selected = true;
			}
		},

		"_changeTranslateTrgLang":function(){	
			this._translateTrg.innerHTML = '';
		},

		"_changeTranslateVendor":function(obj){
			var vendor = obj.value;
			this._drawTranslateSrcLang(true);
			if(vendor == "google_html"){
			this._translateSrc.innerHTML = this._translatePopup._originSrc.html;	
			}else{
			this._translateSrc.innerHTML = this._translatePopup._originSrc.text.replace(/\r/g, '').replace(/\n/g, '<br>');	
			}
			this._changeTranslateSrcLang(null);
			this._translateTrg.innerHTML = '';
			this._translatePopup.layout();
		},

		"_translatePopupPaste":function(e){
			e.preventDefault();
			if (e.clipboardData && e.clipboardData.getData) {
			var text = e.clipboardData.getData("text/plain");
			document.execCommand("insertHTML", false, text);
			} else if (window.clipboardData && window.clipboardData.getData) {
			var text = window.clipboardData.getData("Text");
			var sel, range, html;
			if (window.getSelection) {
				sel = window.getSelection();
				if (sel.getRangeAt && sel.rangeCount) {
				range = sel.getRangeAt(0);
				range.deleteContents();
				range.insertNode(document.createTextNode(text));
				}
			} else if (document.selection && document.selection.createRange) {
				document.selection.createRange().text = text;
			}
			}
		},

		"_translatePopupLayout":function(e){
			this._translatePopup.layout();
		},

		"_translation":function(){
			if(this._translation_) return;
			this._translation_ = true;
			var _self = this;
			var lang = this._info.Language;
			_self._translateTrg.innerHTML = (lang == "Kor"?"번역중...":"Translating...");
			_self._translationBtn.style.opacity = 0.5;
			
			var txt = this._translateSrc.innerText||this._translateSrc.textContent;
			var html = this._translateSrc.innerHTML;
			var srcLang = this._translateSrcLangOpt[this._translateSrcLangOpt.selectedIndex].value;
			var trgLang = this._translateTrgLangOpt[this._translateTrgLangOpt.selectedIndex].value;
			var vendor = this._getTranslateVendor();
			var _default = this._translateDefaultOptions;
			if(_default.vendor != vendor || _default.source != srcLang || _default.target[srcLang] != trgLang){
				_default.vendor = vendor;
				_default.source = srcLang;
				_default.target[srcLang] = trgLang;
				//this._setTranslateOptions();
			}
			var url = './Translate?openform';
			var post_data = {
				"__Click":"0",
				"%%PostCharset":"UTF-8",
				"Vendor":vendor,
				"translateInfo":"",
				"srcLang":srcLang,
				"trgLang":trgLang,
				"source":vendor == "google_html"?html:txt
			};
			__xml.request("p", url, "text", true
				, function(result){
				var json = null;
				_self._translation_ = false;
				_self._translationBtn.style.opacity = 1;
				try{json = eval('(' + result + ')')}catch(e){}
				var translateResult = '';
				if(vendor == "papago"){
					if(json){
					translateResult = json.message.result.translatedText;
					}
				}else{
					try{
					translateResult = json.data.translations[0].translatedText;
					}catch(e){}				
				}
				if(vendor == "google_html"){
					_self._translateTrg.innerHTML = translateResult;
				}else{
					_self._translateTrg.innerHTML = translateResult.replace(/\n/g, "<br>");
				}
				_self._translatePopup._translateResult = translateResult;
				_self._translatePopup.layout();
				}
				, post_data);
		},

		"_getTranslateOptions":function(){		
			this._translateDefaultOptions = {
				'vendor':'papago',
				'source':'en',
				'target':{
					'ko':'en',
					'en':'ko',
					'ja':'ko',
					'zh-CN':'ko',
					'zh-TW':'ko',
					'es':'ko',
					'fr':'ko',
					'vi':'ko',
					'th':'ko',
					'id':'ko'
				}
			};
			/*
			var url = '/' + this._info.DBPath + '/getProfileField?open&f=TranslateOptions';
			var result = __xml.request("g", url, "text", false);
			try{
			if(result.trim() != ""){
				this._translateDefaultOptions = eval('(' + result + ')');
			}
			}catch(e){}		
			*/
		},

		"_setTranslateOptions":function(){
			var url = '/' + this._info.DBPath + '/SysProfile/$first?EditDocument&updatetabinfo&Seq=1';
			var post_data = {"__Click":"0",
			"%%PostCharset":"UTF-8",
			"TranslateOptions":JSON.stringify(this._translateDefaultOptions)};		
			__xml.request("p", url, "text", false, null, post_data);
		},

		"_translatePopupCallback":function(){
			var html = '';
			var param = [];
			var origin = this._translatePopup._originSrc;
			var result = this._translatePopup._translateResult||'';
			html = result;
			param = result.split("\n");
			if(!/<[a-zA-Z]+/.test(result)){
			html = param.join('<br>');
			}
			if(!/^\s*<[a-zA-Z]/.test(result)){
			html = '<span>' + html + '</span>';
			if(/^\s*<p[ >]/i.test(origin.html)){
				var _mat = origin.html.match(/^\s*(<[a-zA-Z]+[^>]*?>\s*)+/gi);
				var prefix, suffix;
				if(_mat && _mat[0]){
				prefix = _mat[0];
				suffix = ''; 
				var _mat2 = _mat[0].match(/<([a-zA-Z]+)/gi);			
				for(var i = _mat2.length - 1; i >= 0; i--){
					suffix += '</' + _mat2[i].replace(/</,'') + '>';
				}
				html = '';
				for(var i = 0; i < param.length; i++){				
					html += prefix + (param[i].replace(/[\r\n]/g,'')||'&nbsp;') + suffix;
				}
				}
			}
			}
			this._translatePopup._translate_callback(html);		
			this._translatePopup.dialog_close();
		},
		"getDocBody":function(_callback){
			var _self = this;
			var _url = '/' + this._info.DBPath + '/0/' + this._info.UNID + '/Body?OpenField';
			$.ajax({
				url: _url,
				cache: false,
				success: function(_data) {
					if (typeof(_callback) == 'function') {
						_callback(_data);
					}
				}
			});
		},
		"resizeBody":function(){
			var _self = this;
			$('#ifm_body').height($('#ifm_body').contents()[0].body.scrollHeight + 20);
		},
		"readDoc":function(_data){
			var _self = this;
			this.resizeInterval = setInterval(function(){
				_self.resizeBody();
			}, 200);
			
			var ifm = $('#ifm_body')[0];
			ifm.style.overflowY = 'hidden';
			ifm.onload = function() {_self.readDocComplete();}
			ifm.contentWindow.document.open();
			ifm.contentWindow.document.write(_data);
			ifm.contentWindow.document.close();
			
		},
		"readDocComplete":function(){
			this.resizeBody();
			clearInterval(this.resizeInterval);
		},
		"editDoc":function(){
			window.document.location.href = "/" + this._info.DBPath + "/0/" + this._info.UNID + "?EditDocument";
		},
		"saveDoc":function(){
			this.keditor.getMimeFrom(this.keditor.getHtmlValue(), function(data){
				document.getElementById("mimeBody").value = data;
				document.forms[0].submit();
			});
		},
		"closeDoc":function(){
			window.close();
		},
		"returnList":function(){
			window.document.location.href = "/" + this._info.DBPath + "/disp_list?open&dn=keditor/keditor.nsf&vn=XML_View&pn=1&sn=4^D&cn=bbs3&isnew=T&title=WebEditor";
		}
	}
}