function ImageControl(uidoc){
	this._instanceId = null;
	this.imageInfoToolbar = null;
	this.editorDoc = null;
	this.canvasIframe = null;
	this.uidoc = uidoc;
	this.user_agent = window.navigator.userAgent;
	this.is_ie = /trident/i.test(this.user_agent);
	this.is_gecko = /gecko/i.test(this.user_agent);
	this.is_webkit = /webkit/i.test(this.user_agent);
	this.is_firefox = /firefox/i.test(this.user_agent);
	this.is_chrome = /chrome/i.test(this.user_agent);
	this.is_safari = !this.is_chrome && /safari/i.test(this.user_agent);
	this.is_opera = /opera/i.test(this.user_agent);
	this.version = (this.user_agent.match(/(?:msie |firefox\/|version\/|opera\/|chrome\/|safari\/)([\d\.]*)/i)||[])[1];
	this.majorVersion = this.version?(this.version.indexOf(".") != -1?this.version.substring(0, this.version.indexOf(".")):this.version):"";
	this.minorVersion = this.version?(this.version.indexOf(".") != -1?this.version.substring(this.version.indexOf(".")+1):this.version):"";
	this.language = navigator.language||navigator.userLanguage||navigator.browserLanguage;
	if(this.is_ie && this.user_agent.search(/Trident/i) != -1){
		this.majorVersion = window.document.documentMode;
	}
	this._instanceId = ImageControl.set(this);
}
(function(){
	var nv = navigator.userAgent;
	var nv_l = nv.toLowerCase();
	ImageControl.is_mobile = (nv_l.indexOf('mobile')>-1) || (nv_l.indexOf('android')>-1) || (nv_l.indexOf('iphone')>-1) || (nv_l.indexOf('ipad')>-1) || (nv_l.indexOf('blackberry')>-1) || (nv_l.indexOf('opera mini')>-1) || (nv_l.indexOf('iemobile')>-1);
})();
ImageControl._INSTANCE = {};
ImageControl._INSTANCE_COUNT = 0;
ImageControl.set = function(instance){
	var key = "ImageControl_" + (ImageControl._INSTANCE_COUNT++);
	ImageControl._INSTANCE[key] = instance;
	return key;
};
ImageControl.get = function(key){
	return ImageControl._INSTANCE[key];
};
ImageControl.destroy = function(key){
	ImageControl._INSTANCE[key] = null;
	delete ImageControl._INSTANCE[key];
};
ImageControl.APPLET_CODE = "com.kmslab.imgctrl.ImageControl";
ImageControl.APPLET_ARCHIVE = "ImageControl.1.1.0.6.amore.jar";
ImageControl.APPLET_WIDTH = "10";
ImageControl.APPLET_HEIGHT = "10";
ImageControl.APPLET_MINIMUM_VERSION = "1.6.0_24";
ImageControl.IS_DEPLOYED = false;
ImageControl.IS_INIT = false;
ImageControl.JS_CONNECTOR = null;
ImageControl.CONTROL = null;
ImageControl.PARAM = {};
ImageControl.deploy = function(){
	if(ImageControl.IS_DEPLOYED || !isChromeJavaAvailable()) return;
	/* Applet Tag Write */
	var att = {
		"id":"idImageControl"
		, "type":"application/x-java-applet"
		, "codebase":"/res/core/keditor/"
		, "code":ImageControl.APPLET_CODE
		, "archive":ImageControl.APPLET_ARCHIVE
		, "width":ImageControl.APPLET_WIDTH
		, "height":ImageControl.APPLET_HEIGHT
		, "style":"z-index:4000;position:absolute;left:-200px;top:-200px;"
			+ "width:" + ImageControl.APPLET_WIDTH + "px;"
			+ "height:" + ImageControl.APPLET_HEIGHT + "px;"
			+ "overflow:hidden;"
	};
	ImageControl.JS_CONNECTOR = "_ImageControl";
	window[ImageControl.JS_CONNECTOR] = ImageControl;
	ImageControl.PARAM["JSConnectName"] = ImageControl.JS_CONNECTOR;
	
	if(window.deployJava && window.deployJava.runApplet && !ImageControl.is_mobile){
		window.deployJava.runApplet(att, ImageControl.PARAM, ImageControl.APPLET_MINIMUM_VERSION);
	}else{
		var html = '';
		html += '<applet id="' + att.id + '" '
					+ 'codebase="' + att.codebase + '" '
					+ 'code="' + att.code + '" '
					+ 'archive="' + att.archive + '" '
					//+ (att.type?'type="' + att.type + '" ':"")
					+ 'width="' + att.width + '" '
					+ 'height="' + att.height + '" '
					//+ 'style="' + att.style + '"'
					+ '>';
		for(var idx in ImageControl.PARAM){
			html += '<param name="' + idx + '" value="' + ImageControl.PARAM[idx] + '">';
		}
		html += '<param name="java_version" value="' + ImageControl.APPLET_MINIMUM_VERSION + '+">';
		html += '</applet>';
		
		var applet_div = document.createElement("div");
		applet_div.style.zIndex = 4000;
		applet_div.style.position = "absolute";
		applet_div.style.left = "-200px";
		applet_div.style.top = "-200px";
		applet_div.style.width = "10px";
		applet_div.style.height = "10px";
		applet_div.innerHTML = html;
		document.body.appendChild(applet_div);
	}
	ImageControl.CONTROL = document.getElementById(att.id);
	ImageControl.IS_DEPLOYED = true;
};
ImageControl.onLoadComplete = function(){
	ImageControl.IS_INIT = true;
};
ImageControl.IframeLoad = function(iframe, uidoc){
	var _imageControl = new ImageControl(uidoc);
	_imageControl.init(iframe);
	return _imageControl;
};
ImageControl._add_event_listener = function(obj, event_type, func){
	if(obj.addEventListener){
		event_type = event_type.replace(/^on/, "");
		obj.addEventListener(event_type, func, false);
		return func;
	}else{
		if(event_type.search(/^on/i) == -1) event_type = "on" + event_type;
		obj.attachEvent(event_type, func);
	}
	return func;
};
ImageControl._bind_event_listener = function(){
	var args = ImageControl._to_array(arguments), win = args.shift(), object = args.shift(), m = args.shift();
	return function(e){
		return m.apply(object, [e||win.event].concat(args));
	};
};
ImageControl._to_array = function(object){
	var result = [];
	if(object != null && object.length != null && typeof(object) != "string" && typeof(object) != "function" && !('tagName' in object)){
		for(var i = 0; i < object.length; i++) result[i] = object[i];
	}else{
		result = [object];
	}
	return result;
};
ImageControl._get_position = function(elem, limit_elem){
	var x = 0; y = 0;
	var offset_parent = elem;				
	while(elem){
		if(limit_elem == elem) break;
		if(elem == offset_parent){
			x += elem.offsetLeft;
			y += elem.offsetTop;
			offset_parent = elem.offsetParent;
		}
		elem = elem.parentNode;
		if(elem != null){
			x -= elem.scrollLeft;
			y -= elem.scrollTop;
		}
		if(elem == null || !elem.offsetParent) elem = null;
	}
	return {x:x, y:y};
};
ImageControl.convertHTML = function(key, html){
	if(html.search(/<html/i) != -1) html = html.replace(/[^<]*(<html)/i, "$1");
	html = html.replace(/(<\!--\[if\s+(gte\s+|lte\s*|lt\s+|gt\s+|\!)(mso|vml)(\s+\d+|\s*)\]>(((?:[^<])*(?:<(?!\!\[endif\]\s*-->)[^>]*>)[^<]*)*)<\!\[endif\]\s*-->|<\!--\[if\s*\!mso\s*\&\s*vml\]>[\S\s]*?<\!\[endif]-->|<\!--\s*\[if\s+\!vml\]\s*-->|<\!--\s*\[endif\]\s*-->|<\!\[if\s+!vml\]>|<\!\[if\s+!supportEmptyParas\]>|<\!\[endif\]>|<\!--StartFragment-->|<\!--EndFragment-->)/g,""); //
//	html = html.replace(/<\!--\[if\s*\!mso\s*\&\s*vml\]>[\S\s]*?<\!\[endif]-->/gi, "");
	html = html.replace(/(<v:shape(?:>|\s+[^>]*>))(((?:[^<])*(?:<(?!\/v:shape>)[^>]*>)[^<]*)*)<\/v:shape>/g, 
			function(all, shapetag, shapecontent){
				if(shapecontent.search(/<v:imagedata/) != -1){
					var imagetag = shapecontent.match(/<v:imagedata(?:>|\s+[^>]*>)/)[0];
					var src = (imagetag.match(/src\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]*)/)||[""])[0];
					var style = (shapetag.match(/style\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]*)/)||[""])[0];
					return "<img " + src + " " + style + ">";
				}else{
					return all;
				}
			});
	html = html.replace(/(<style(?:>|\s+[^>]*>))(((?:[^<])*(?:<(?!\/style>)[^>]*>)[^<]*)*)<\/style>/gi,
			function(all){
				return all.replace(/([:\s]0?)\.5pt/g, "$1" + "1px");
			});
	try{
		html = ImageControl.get(key).uploadHTMLImage(html);
	}catch(e){}
	return html;
};
ImageControl.prototype = {
	"init":function(iframe){
		this.domain = document.location.hostname.substring(document.location.hostname.indexOf(".") + 1);
		this.canvasIframe = iframe;
		this.initCount = 0;
		this.initEditorDoc();
		this.imageLinkKey = (this.uidoc.elements.form[0].MIMEMerge_ImageLinkKey||{value:this.uidoc.options.unid}).value;
		this.isJavaAvailable = isChromeJavaAvailable();
		var chromeVersion = window.navigator.userAgent.match(/Chrome\/(\d+)\./);
		this.isChrome42 = chromeVersion && chromeVersion[1] && parseInt(chromeVersion[1], 10) >= 42;
	}
	,"initEditorDoc":function(){
		if(this.canvasIframe.contentWindow && this.canvasIframe.contentWindow.document){
			this.wrapperWindow = this.canvasIframe.contentWindow.parent;
			this.wrapperDoc = this.wrapperWindow.document;
			this.editorDoc = this.canvasIframe.contentWindow.document;
			this.addEditorEvent();
		}else{
			this.initCount++;
			var _self = this;
			if(this.initCount < 20)
				setTimeout(function(){_self.initEditorDoc.apply(_self);}, 50);
		}
	}
	,"getAllowEditorClipboardData":function(){
		return ImageControl.CONTROL.getAllowEditorClipboardData(this._instanceId, false); // key, replaceClipboard
	}
	,"addEditorEvent":function(){
		 if(this.editorDoc.body.getAttribute("initEditorEvent") == "true") return;
		 this.editorDoc.body.setAttribute("initEditorEvent", true);
		 if (this.is_ie) {
			 ImageControl._add_event_listener(this.editorDoc.body
						, "keydown"
						, ImageControl._bind_event_listener(window, this, this.editorKeydown, this.editorDoc));				 
		 }
		 ImageControl._add_event_listener(this.editorDoc.body
						, "paste"
						, ImageControl._bind_event_listener(window, this, this["editorPaste"], this.editorDoc));
		 if(this.is_webkit){
			 ImageControl._add_event_listener(this.editorDoc.body
					 , "click"
					 , ImageControl._bind_event_listener(window, this, this.editorFocus, this.editorDoc));
		 }
	}
	,"editorFocus":function(e){
		//if(!ImageControl.IS_INIT) return;
		var elem = e.srcElement||e.target;
		if(elem.tagName.toUpperCase() == "IMG"){
			this._setImageInfo(elem);
		}else{
			this._setImageInfo(null);
		}
	}
	,"_setImageInfo":function(img){
		if(this.imageInfoToolbar == null){
			this.basicToolbar = this.wrapperDoc.getElementById("tx_toolbar_basic");
			this.advanceToolbar = this.wrapperDoc.getElementById("tx_toolbar_advanced");
			this.imageInfoToolbar = this.wrapperDoc.getElementById("imageInfoToolbar");
			this.imageInfoToolbarWidth = this.wrapperDoc.getElementById("editorImageWidth");
			this.imageInfoToolbarHeight = this.wrapperDoc.getElementById("editorImageHeight");
			this.editorImageSizeLock = this.wrapperDoc.getElementById("editorImageSizeLock");
			ImageControl._add_event_listener(this.imageInfoToolbar, "keyup"
					, ImageControl._bind_event_listener(window, this, this.imageInfoKeyUp));
		}
		if(img != null){
			this.imageInfoToolbar.imgObject = img;
			this.imageInfoToolbarWidth.value = img.width;
			this.imageInfoToolbarHeight.value = img.height;
			/*var pos = ImageControl._get_position(AAA.EcK.getElementById("tx_canvas_" + this.sId));
			this.imageInfoToolbar.style.top = (pos.y + document.body.scrollTop + 1) + "px";
			this.imageInfoToolbar.style.left = (pos.x + document.body.scrollLeft) + "px";*/
			this.imageInfoToolbar.style.top = (this.basicToolbar.offsetHeight + this.advanceToolbar.offsetHeight + 1) + "px";
			this.imageInfoToolbar.style.left = "0px";
			this.imageInfoToolbar.style.display = "block";
		}else{
			this.imageInfoToolbar.imgObject = null;
			this.imageInfoToolbar.style.display = "none";
		}
	}
	,"imageInfoKeyUp":function(e){
		var elem = e.srcElement||e.target;
		if(this.imageInfoToolbar.imgObject == null) return;
		if(elem == this.imageInfoToolbarWidth){
			var width = parseInt(this.imageInfoToolbarWidth.value, 10);
			var height = parseInt(this.imageInfoToolbarHeight.value, 10);
			if(isNaN(width)) return;
			
			this.imageInfoToolbar.imgObject.width = width;
			this.imageInfoToolbar.imgObject.style.width = width + "px";
			
			if(this.editorImageSizeLock.checked || isNaN(height)){
				this.imageInfoToolbar.imgObject.removeAttribute("height");
				this.imageInfoToolbar.imgObject.style.height = "";
				height = this.imageInfoToolbar.imgObject.height;
				this.imageInfoToolbar.imgObject.style.height = height + "px";
				this.imageInfoToolbar.imgObject.height = height;
				this.imageInfoToolbarHeight.value = height;
			}else{
				this.imageInfoToolbar.imgObject.height = height;
				this.imageInfoToolbar.imgObject.style.height = height + "px";
			}
		}else if(elem == this.imageInfoToolbarHeight){
			var width = parseInt(this.imageInfoToolbarWidth.value, 10);
			var height = parseInt(this.imageInfoToolbarHeight.value, 10);
			if(isNaN(height)) return;
			this.imageInfoToolbar.imgObject.height = height;
			this.imageInfoToolbar.imgObject.style.height = height + "px";
			
			if(this.editorImageSizeLock.checked || isNaN(width)){
				this.imageInfoToolbar.imgObject.removeAttribute("width");
				this.imageInfoToolbar.imgObject.style.width = "";
				width = this.imageInfoToolbar.imgObject.width;
				this.imageInfoToolbar.imgObject.style.width = width + "px";
				this.imageInfoToolbar.imgObject.width = width;
				this.imageInfoToolbarWidth.value = width;
			}else{
				this.imageInfoToolbar.imgObject.width = width;
				this.imageInfoToolbar.imgObject.style.width = width + "px";
			}
		}
	}
	,"editorKeydown":function(e, doc){
		this.runKeydown = false;
		if(e.keyCode == 86 && (e.ctrlKey)){
			this.call_pasteExecute(e, doc);
			this.runKeydown = true;
		}
	}
	,"editorPaste":function(e, doc){
		if(!this.isJavaAvailable && this.isChrome42){
			var _self = this;
			function blobUpload(blob){
				var type = (blob.type.split("/")[1]||"").toLowerCase();
				var ext = "gif";
				if(type == "gif") ext = "gif";
				else if(type == "jpg" || type == "jpeg") ext = "jpg";
				else if(type == "png") ext = "png";
				else if(type != "") ext = type;
				
				var imageSeq = (new Date).getTime() + (_self.nSeq = (_self.nSeq || 0) +  1);
				var imageName = "image." + imageSeq + '.' + ext;			
				//var imageUrl = '$FILE/Image.' + imageSeq + "." + ext + '?OpenElement&' + imageSeq;
				
				var form_data = new FormData();
				form_data.append("__Click", "0");
				form_data.append("%%PostCharset", "UTF-8");
				form_data.append("cid", imageSeq);
				form_data.append("Body", "");
				form_data.append("%%File", blob, imageName);
				var formAction = document.location.protocol + "//" + document.location.host 
							+ (_self.uidoc.options.server?'/' + _self.uidoc.options.server:'')
							+ '/ngw/core/temporarily.nsf/ImageUpload?OpenForm'
							+ '&ImageLinkKey=' + encodeURIComponent(_self.imageLinkKey)
							+ '&prefix=' + _self.uidoc.options.server
							+ '&type=CONTROL';
				
				var xhr = new XMLHttpRequest();
				xhr.open("POST", formAction, false);
				xhr.send(form_data);
				var uploadResult = xhr.responseText;
				var result = null;
				if(uploadResult){
					var json = eval("(" + uploadResult + ")");
					if(json){
						var img_src = document.location.protocol + "//" + document.location.hostname + (_self.uidoc.options.server?'/' + _self.uidoc.options.server:'') + json.url;
						result = {img_src:img_src, uploadResult:uploadResult, imageName:imageName};
					}
				}
				return result;
			}
			function inlineStyle(styles, html){
				var cssReg = /<style[^>]*>([\S*\s*]*?)<\/style[^>]*>/i;
				var mediaReg = /[^{}]+{([^{}]+{[^}]*?})*}/g;
				var cssItemReg = /([^{}]+){([^}]*?)}/g;
				var selectorReg = /([^{}]+){([^}]*?)}/i;
				var cssText = "";
				var css_list = [];
				for(var i = 0; i < styles.length; i++){
					var css_match = styles[i].match(cssReg);
					if(css_match) cssText += css_match[1].replace(/<!--/g, "").replace(/-->/g, "");
				}
				cssText = cssText.replace(mediaReg, "");
				var selectors = cssText.match(cssItemReg);
				for(var i = 0; i < selectors.length; i++){
					var item_match = selectors[i].match(selectorReg);
					var selector = item_match[1];
					var sel_css = item_match[2];
					var sel_arr = selector.split(/,/);
					for(var j = 0; j < sel_arr.length; j++){
						var sel = sel_arr[j].replace(/^\s+/g, "").replace(/\s+$/g, "");
						if(sel.charAt(0) == "@") continue;
						var wk = sel.split(/\s/);
						wk = wk[wk.length - 1];
						var weight = 0;
						if(wk.indexOf(".") == -1){
							if(wk.charAt(0) == "#") weight = 900000;
							else weight = 0;
						}else{
							if(wk.charAt(0) == "#") weight = 910000;
							else weight = 100000 + (1000 * (wk.split(".").length - 1));
						}
						css_list.push({
							"selector":sel
							,"css":sel_css
							,"weight":weight
						});
					}
				}
				var elem = $('<div>' + html + '</div>');
				for(var i = 0; i < css_list.length; i++){
					var item = css_list[i];
					$.each($(item.selector, elem), function(){
						var _elem = $(this);
						_elem.addClass("_inline_style");
						var s_arr = _elem.data("__style")||[];
						s_arr.push(item);
						_elem.data("__style", s_arr);						
					});
				}
				$.each($("._inline_style", elem), function(){
					var _elem = $(this);
					var inline_style = _elem.attr("style")||'';
					var _data = _elem.data("__style");
					var _css = _data.sort(function(a, b){
						if(a.weight > b.weight){
							return 1;
						}else if(a.weight == b.weight){
							return 0;
						}else{
							return -1;
						}
					});
					var _csstext = '';
					for(var i = 0; i < _css.length; i++){
						_csstext += (_csstext?";":"") + _css[i].css;
					}
					_csstext += (_csstext?";":"") + inline_style;
					_csstext = _csstext.replace(/;;/g, ";");
					_elem.attr("style",_csstext);
				});
				$("[class], [id]", elem).removeAttr("class").removeAttr("id");
				return elem.html();
			}
			var edt = this.wrapperWindow.Editor;			
			if(e.clipboardData){
				var items = e.clipboardData.items;
				var img_item = null;
				var html_item = null;
				if(items[0]){
					for(var i = 0; i < items.length; i++){
						if(items[i].kind == "file" && items[i].type.search(/image/i) != -1){
							img_item = items[i];
						}else if(items[i].kind == "string" && items[i].type.search(/text\/html/i) != -1){
							html_item = items[i];
						}
					}
					if(html_item != null && img_item != null){
						var _html = e.clipboardData.getData("text/html");
						if(_html.search(/<img[^>]+src\s*=\s*["']?(?!http|\/|\.)/) == -1){
							img_item = null;
						}/*else if(!confirm("이미지로 붙여넣으시겠습니까?")){
							img_item = null;
						}*/
					}
					if(img_item != null && img_item.kind == "file" && img_item.type.search(/image/i) != -1){
						var blob = img_item.getAsFile();
						var result = blobUpload(blob);										
						if(result && result.img_src){
							var img_src = result.img_src;
							edt.canvas.execute(function(processor) {
									var _node = processor.win.img({ 'src': img_src, 'border': "0", 'className' : '' });
									processor.pasteNode(_node, false);
				               });
							if(e.preventDefault){e.preventDefault();}else{e.returnValue = false;}
							if(e.stopPropagation){e.stopPropagation();}else{e.cancelBubble = true;}
							return;
						}
					}else if(html_item != null){
						var _html = e.clipboardData.getData("text/html");
						if(_html.search(/<\!--StartFragment-->([\S\s]*?)<\!--EndFragment-->/i) != -1){
							var html = _html.match(/<\!--StartFragment-->([\S\s]*?)<\!--EndFragment-->/i)[1];
							if(html.search(/<[a-zA-Z]+[^>]*?>/) == -1){
								return; // plain text임
							}
						}
						_html = _html.replace(/(<v:shape(?:>|\s+[^>]*>))([\S*\s*]*?)<\/v:shape>/g,
						function(all, shapetag, shapecontent){
							if(shapecontent.search(/<v:imagedata/) != -1){								
								var imagetag = shapecontent.match(/<v:imagedata(?:>|\s+[^>]*>)/)[0];								
								var src = (imagetag.match(/src\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]*)/)||[""])[0];
								var style = (shapetag.match(/style\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]*)/)||[""])[0];
								return "<img " + src + " " + style + ">";
							}else{
								return all;
							}
						});
						
						_html = _html.replace(/(<\!--\[if\s+(gte\s+|lte\s*|lt\s+|gt\s+|\!)(mso|vml)(\s+\d+|\s*)\]>(((?:[^<])*(?:<(?!\!\[endif\]\s*-->)[^>]*>)[^<]*)*)<\!\[endif\]\s*-->|<\!--\[if\s*\!mso\s*\&\s*vml\]>[\S\s]*?<\!\[endif]-->|<\!--\s*\[if\s+\!vml\]\s*-->|<\!--\s*\[endif\]\s*-->|<\!\[if\s+\![a-zA-Z]+\]>|<\!\[endif\]>)/g,"");
						
						_html = _html.replace(/<(\/?)form/gi, "<" + "$1" + "x-form");
						_html = _html.replace(/<\/?[a-zA-Z]+\:[a-zA-Z]+[^>]*>/gi, "");
						_html = _html.replace(/(<style(?:>|\s+[^>]*>))(((?:[^<])*(?:<(?!\/style>)[^>]*>)[^<]*)*)<\/style>/g,
						function(all){
							return all.replace(/([:\s]0?)\.5pt/g, "$1" + "1px");
						});					
						if(_html.search(/<html/i) != -1) _html = _html.replace(/[\S\s]*?(<html)/i, "$1");
						var styles = null;
						if(_html.search(/<style/i) != -1){
							styles = _html.match(/<style[^>]*>[\S\s]*?<\/style>/gi);
						}
						if(_html.search(/<\!--StartFragment-->([\S\s]*?)<\!--EndFragment-->/) != -1){
							var html = _html.match(/<\!--StartFragment-->([\S\s]*?)<\!--EndFragment-->/i)[1];
							if(html.search(/<\/?(?!a|abbr|address|b|br|cite|code|em|font|i|img|label|span|strike|strong|sub|sup|tt|u)[a-zA-Z]/i) == -1){
								_html = html;
							}
						}
						_html = _html.replace(/(<\!--StartFragment-->|<\!--EndFragment-->)/gi, "");
						if(_html.search(/<body[^>]*>([\S\s]*)<\/body/i) != -1){
							_html = _html.match(/<body[^>]*>([\S\s]*)<\/body/i)[1];
						}
						var selection = (doc.getSelection?doc.getSelection():doc.selection);
						if(_html && selection){
							try{
								_html = inlineStyle(styles, _html);
								this.editorDoc.execCommand("insertHTML", false, _html);
								if(e.preventDefault){e.preventDefault();}else{e.returnValue = false;}
								if(e.stopPropagation){e.stopPropagation();}else{e.cancelBubble = true;}
								return;
							}catch(ee){								
							}
						}
					}
				}
			}
		}
		if(this.runKeydown) return;
		this.call_pasteExecute(e, doc);
	}
	,"call_pasteExecute":function(e, doc){
		if(!ImageControl.IS_INIT) return;
		this.editorPasteControl(e, doc);
		/*try {
			var data = this.getAllowEditorClipboardData();
			if(!data){
				if(navigator.userAgent.search(/Mac OS/i) != -1){
					setTimeout(this._bind_event_listener(window, this, this.uploadBodyImage, doc), 50);
				 }
				return;
			}
			//var w = Editor.canvas; 
			//w.execute(function () {						
				this.editorPasteControl(e, doc, data);
			//});
			if(e.preventDefault){e.preventDefault();}else{e.returnValue = false;}
			if(e.stopPropagation){e.stopPropagation();}else{e.cancelBubble = true;}
		} catch (er) {
			alert(er);
		}*/
	}
	,"editorPasteControl":function(e, doc, data){
		var data = this.getAllowEditorClipboardData();
		if(!data){
			if(navigator.userAgent.search(/Mac OS/i) != -1){
				setTimeout(ImageControl._bind_event_listener(window, this, this.uploadBodyImage, doc), 50);
			 }
			return;
		}
		var json = eval("(" + data + ")");
		var pasteHtml = null;
		//var styles = [];
		
		var selection = (doc.getSelection?doc.getSelection():doc.selection);
		if(json.type == "plain"){
			pasteHtml = json.data;
			pasteHtml = pasteHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r\n/g, "\n").replace(/\n/g, "<br>").replace(/\t/g, "                ").replace(/  /g, "&nbsp; ");
		}else if(json.type == "html"){
			pasteHtml = json.data;
			var plainText = "";
			if(pasteHtml.search(/<\!--StartFragment-->([\S\s]*?)<\!--EndFragment-->/i) != -1){
				var html = pasteHtml.match(/<\!--StartFragment-->([\S\s]*?)<\!--EndFragment-->/i)[1];
				if(html.search(/<[a-zA-Z]+[^>]*?>/) == -1){
					plainText = html;
				}
			}
			if(!plainText){
				pasteHtml = pasteHtml.replace(/(<\!--\[if\s+(gte\s+|lte\s*|lt\s+|gt\s+|\!)(mso|vml)(\s+\d+|\s*)\]>(((?:[^<])*(?:<(?!\!\[endif\]\s*-->)[^>]*>)[^<]*)*)<\!\[endif\]\s*-->|<\!--\[if\s*\!mso\s*\&\s*vml\]>[\S\s]*?<\!\[endif]-->|<\!--\s*\[if\s+\!vml\]\s*-->|<\!--\s*\[endif\]\s*-->|<\!\[if\s+\![a-zA-Z]+\]>|<\!\[endif\]>)/g,"");
				pasteHtml = pasteHtml.replace(/(<v:shape(?:>|\s+[^>]*>))(((?:[^<])*(?:<(?!\/v:shape>)[^>]*>)[^<]*)*)<\/v:shape>/g, 
						function(all, shapetag, shapecontent){
							if(shapecontent.search(/<v:imagedata/) != -1){
								var imagetag = shapecontent.match(/<v:imagedata(?:>|\s+[^>]*>)/)[0];
								var src = (imagetag.match(/src\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]*)/)||[""])[0];
								var style = (shapetag.match(/style\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]*)/)||[""])[0];
								return "<img " + src + " " + style + ">";
							}else{
								return all;
							}
						});
				pasteHtml = pasteHtml.replace(/<(\/?)form/gi, "<" + "$1" + "x-form"); // form tag ����
				pasteHtml = pasteHtml.replace(/<\/?[a-zA-Z]+\:[a-zA-Z]+[^>]*>/gi, ""); // namespace�� �����ִ� tag ����
				pasteHtml = pasteHtml.replace(/(<style(?:>|\s+[^>]*>))(((?:[^<])*(?:<(?!\/style>)[^>]*>)[^<]*)*)<\/style>/g,
						function(all){
							//styles.push(all.replace(/0\.5pt/g, "1px").replace(/([:\s]?)\.5pt/g, "$1" + "1px").match(/<style[^>]*>([\S\s]*)<\/style/i)[1]);
							//return "";
							return all.replace(/([:\s]0?)\.5pt/g, "$1" + "1px");
						});
				if(pasteHtml.search(/<html/i) != -1) pasteHtml = pasteHtml.replace(/[\S\s]*?(<html)/i, "$1");
				var hasError = false;
				
				if(pasteHtml.search(/<style/i) != -1){
					var html = ImageControl.CONTROL.convertInlineCSS(pasteHtml);
					if(html == ""){
						hasError = true;
					}else{
						pasteHtml = html;
					}
				}
				//if(styles.length != 0) pasteHtml = pasteHtml.replace(/(<body[^>]*>)/, "$1" + styles.join(""));
				/*if(pasteHtml.search(/<\!--StartFragment-->([\S\s]*?)<\!--EndFragment-->/) != -1){
					pasteHtml = pasteHtml.match(/<\!--StartFragment-->([\S\s]*?)<\!--EndFragment-->/i)[1];
				}else 
				*/
				if(pasteHtml.search(/<\!--StartFragment-->([\S\s]*?)<\!--EndFragment-->/) != -1){
					var html = pasteHtml.match(/<\!--StartFragment-->([\S\s]*?)<\!--EndFragment-->/i)[1];
					if(html.search(/<\/?(?!a|abbr|address|b|br|cite|code|em|font|i|img|label|span|strike|strong|sub|sup|tt|u)[a-zA-Z]/i) == -1){
						pasteHtml = html;
					}
				}
				pasteHtml = pasteHtml.replace(/(<\!--StartFragment-->|<\!--EndFragment-->)/gi, "");
				if(pasteHtml.search(/<body[^>]*>([\S\s]*)<\/body/i) != -1){
					pasteHtml = pasteHtml.match(/<body[^>]*>([\S\s]*)<\/body/i)[1];
				}
			}else{
				pasteHtml = plainText;
			}
		}else if(json.type == "image"){
			pasteHtml = "";
			var maxWidth = doc.body.clientWidth-40;
			var maxHeight = doc.body.clientHeight;
			
			for(var i = 0; i < json.data.length; i++){
				var width = maxWidth < json.data[i].width?maxWidth+"px":"";
				pasteHtml += '<img ' + (width?' width="' + width + '"':"") 
						+ 'src="file:///' + json.data[i].path.replace(/"/g, "&qout;").replace(/\\/g, "/") + '">';
			}
		}

		if(pasteHtml && selection){
			var node = null;
			var range = null;
			try{
				if(this.is_ie && this.is_gecko && selection.getRangeAt && selection.rangeCount != null){
					if(selection.rangeCount == 0) return;
					range = selection.getRangeAt(selection.rangeCount - 1);
					range.deleteContents();
					if(range.createContextualFragment){
						node = range.createContextualFragment(pasteHtml);
					}else{
						var div = doc.createElement("div");
						div.innerHTML = pasteHtml;
						node = document.createDocumentFragment();
						var child = div.firstChild;
						while(child != null){
							node.appendChild(child);
							child = div.firstChild;
						}
					}
					try{range.selectNode(node);}catch(e){}
					range.insertNode(node);
					selection.collapseToEnd();
				}else{
					this.editorDoc.execCommand("insertHTML", false, pasteHtml);
				}
			}catch(ee){
				if(selection.getRangeAt && selection.rangeCount != null){
					if(selection.rangeCount == 0) return;
					range = selection.getRangeAt(selection.rangeCount - 1);
					range.deleteContents();
					if(range.createContextualFragment){
						node = range.createContextualFragment(pasteHtml);
					}else{
						var div = doc.createElement("div");
						div.innerHTML = pasteHtml;
						node = document.createDocumentFragment();
						var child = div.firstChild;
						while(child != null){
							node.appendChild(child);
							child = div.firstChild;
						}
					}
					try{range.selectNode(node);}catch(e){}
					range.insertNode(node);
					selection.collapseToEnd();
				}else if(selection.type && selection.type != "Control"){
					range = selection.createRange();
					range.pasteHTML(pasteHtml);
				}
			}
			/*if(styles.length != 0){
				var style_tag = this.editorDoc.createElement("style");
				var firstItem = this.editorDoc.body.firstChild;
				if(firstItem){
					this.editorDoc.body.insertBefore(style_tag, firstItem);
				}else{
					this.editorDoc.body.appendChild(style_tag);
				}
				var css = styles.join('');
				if (style_tag.styleSheet) { // IE
					style_tag.styleSheet.cssText = css;
				} else {
					style_tag.appendChild(document.createTextNode(css));
				}
			}*/
			
			this.uploadBodyImage(doc);
			if(e.preventDefault){e.preventDefault();}else{e.returnValue = false;}
			if(e.stopPropagation){e.stopPropagation();}else{e.cancelBubble = true;}
		}
	}
	,"_checkUploadImage":function(src){
		/*return src.search(/^(?:file:\/\/\/|[a-zA-Z]:)/) != -1 || 
				(src.toLowerCase().indexOf(this.domain.toLowerCase()) != -1
						&& src.search(/openelement\&cid=/i) == -1
						&& src.search(/\$file\/image\.[0-9a-f]+(\.[^?]*)*\?openelement\&[0-9a-f]+/i) == -1);*/
		return src.search(/^(?:file:\/\/\/|[a-zA-Z]:)/) != -1 || 
				(src.toLowerCase().indexOf(this.domain.toLowerCase()) != -1
						&& src.indexOf("linked=" + this.imageLinkKey) == -1);
	}
	,"_showProgress":function(){
		if(this.imageUploadProgress == null){
			this.imageUploadProgress = this.wrapperDoc.getElementById("imageUploadProgress");
			this.wrapperDoc.body.appendChild(this.imageUploadProgress);
		}
		try{
			var progressInner = this.wrapperDoc.getElementById("imageUploadProgressInner");
			this.imageUploadProgress.style.display = "block";
			this.imageUploadProgress.style.width = this.wrapperDoc.body.scrollWidth + "px";
			this.imageUploadProgress.style.height = this.wrapperDoc.body.scrollHeight + "px";
			
			var clientWidth = this.wrapperDoc.body.clientWidth;
			var clientHeight = this.wrapperDoc.body.clientHeight;
			var x = (clientWidth - progressInner.offsetWidth) / 2;
			var y = (clientHeight - progressInner.offsetHeight) / 2;
			x += this.wrapperDoc.body.scrollLeft;
			y += this.wrapperDoc.body.scrollTop;
			progressInner.style.top = y + "px";
			progressInner.style.left = x + "px";
			//progressInner.focus();
		}catch(e){}
	}
	,"_hideProgress":function(){
		if(this.imageUploadProgress) this.imageUploadProgress.style.display = "none";
	}
	,"uploadHTMLImage":function(html){
		var uploadImages = {};
		var _self = this;
		var image_count = 0;
		html = html.replace(/<img[^>]*>/gi,
			function(img){
				var result = img;
				var src = img.match(/src\s*=\s*("[^"]*"|'[^']*')/i);
				if(src != null){
					src = src[1].match(/^["']([^"']*)["']$/)[1];
					if(_self._checkUploadImage(src)){
						if(uploadImages[src] == null) 
							uploadImages[src] = "tmpcid:" + (new Date).getTime() + "_" + (image_count++);
						result = img.replace(src, uploadImages[src]);
					}
				}
				return result;
			}
		);
		if(image_count > 0){
			this._showProgress();
			try{
				html = this._uploadHTMLImage(uploadImages, html);
			}catch(e){}
			this._hideProgress();
			return html;
		}else{
			return html;
		}
	}
	,"uploadBodyImage":function(doc){
		var imgs = doc.body.getElementsByTagName("img");
		var uploadImages = {};
		var hasImage = false;
		for(var i = 0; i < imgs.length; i++){
			var src = imgs[i].src;
			if(this._checkUploadImage(src)){
				if(uploadImages[imgs[i].src] == null){
					uploadImages[imgs[i].src] = [];
				}
				uploadImages[imgs[i].src].push(imgs[i]);
				hasImage = true;
			}else{
				imgs[i].width = imgs[i].width;
				imgs[i].height = imgs[i].height;
			}
		}
		if(hasImage){
			this._showProgress();
			try{
				this._uploadBodyImage(uploadImages, doc);
			}catch(e){}
			this._hideProgress();
		}
	}
	,"_uploadProcess":function(uploadImages){
		var uploadImageById = {};
		var uploadedImage = {};
		for(var img_path in uploadImages){
			var originFilePath = filePath = img_path;
			var ext = null;
			var isWMZ = false;
			var wmzExt = "";
			if(originFilePath.search(/^(?:file:\/\/\/|[a-zA-Z]:)/) != -1){
				filePath = decodeURIComponent(filePath);
				filePath = filePath.replace("file:///", "").replace("\\", "/");
				var ext = filePath;
				if(ext.lastIndexOf("/") != -1) ext = ext.substring(ext.lastIndexOf("/") + 1);
				if(ext.lastIndexOf(".") != -1) ext = ext.substring(ext.lastIndexOf("."));
				else ext = ".gif";	
				isWMZ = ext.toLowerCase() == ".wmz"?true:false;
				if(isWMZ){
					//ext = ".jpg";
					ext = ".svg";
				}
			}else{
				ext = ".gif";
			}
			
			var imageSeq = (new Date).getTime() + (this.nSeq = (this.nSeq || 0) +  1);
			var imageName = "image." + imageSeq + ext;
			//var imageUrl = '$FILE/Image.' + imageSeq + ext + '?OpenElement&' + imageSeq;
			
			var formAction = document.location.protocol + "//" + document.location.host 
				+ (this.uidoc.options.server?'/' + this.uidoc.options.server:'')
				+ '/ngw/core/temporarily.nsf/ImageUpload?OpenForm'
				+ '&ImageLinkKey=' + encodeURIComponent(this.imageLinkKey)
				+ '&prefix=' + this.uidoc.options.server
				+ '&type=CONTROL';
			
			ImageControl.CONTROL.imageUploadPostUrl(formAction);
			ImageControl.CONTROL.imageUploadFileField("%%File");
			
			ImageControl.CONTROL.imageUploadTextField("__Click", "0");
			ImageControl.CONTROL.imageUploadTextField("%%PostCharset", "UTF-8");
			
			ImageControl.CONTROL.imageUploadTextField("cid", imageSeq);
			ImageControl.CONTROL.imageUploadTextField("Body", "");

			if(originFilePath.search(/^(?:file:\/\/\/|[a-zA-Z]:)/) != -1){
				uploadImageById[imageName] = uploadImages[img_path];						
				ImageControl.CONTROL.imageUploadFile(imageName, filePath, isWMZ);
			}else{
				uploadImageById[imageName] = uploadImages[img_path];						
				ImageControl.CONTROL.imageUploadURL(imageName, filePath);
			}
			
			var uploadResult = ImageControl.CONTROL.imageUpload();
			
			if(uploadResult){
				var json = eval("(" + uploadResult + ")");
				for(var i = 0; i < json.length; i++){
					var imgs = uploadImageById[json[i].fileName];
					if(imgs != null){
						for(var j = 0; j < imgs.length; j++){
							//imgs[j].src = document.location.protocol + "//" + document.location.hostname + json[i].url;
							uploadedImage[imageName] = document.location.protocol + "//" + document.location.hostname + (this.uidoc.options.server?'/' + this.uidoc.options.server:'') + json[i].url;
						}
					}
				}
			}
		}
		return {uploadedImage:uploadedImage, uploadId:uploadImageById};
	}
	,"_uploadHTMLImage":function(uploadImages, html){		
		var uploadInfo = this._uploadProcess(uploadImages);
		for(var idx in uploadInfo.uploadedImage){
			var tmpcid = uploadInfo.uploadId[idx];
			if(tmpcid != null){
				html = html.replace(tmpcid, uploadInfo.uploadedImage[idx]);
			}
		}
		return html;
	}
	,"_uploadBodyImage":function(uploadImages, doc){
		var uploadInfo = this._uploadProcess(uploadImages);
		for(var idx in uploadInfo.uploadedImage){
			var imgs = uploadInfo.uploadId[idx];
			if(imgs != null){
				for(var j = 0; j < imgs.length; j++){
					imgs[j].src = uploadInfo.uploadedImage[idx];
				}
			}
		}
	}
	,"x_uploadBodyImage":function(uploadImages, uploadImageById, doc){
		var index = 0;
		for(var idx in uploadImages){
			var fileName = "image_" + index++;
			var ext = null;
			var filePath = idx;
			if(filePath.search(/^(?:file:\/\/\/|[a-zA-Z]:)/) != -1){
				filePath = decodeURIComponent(filePath);
				filePath = filePath.replace("file:///", "").replace("\\", "/");
				var ext = filePath;
				if(ext.lastIndexOf("/") != -1) ext = ext.substring(ext.lastIndexOf("/") + 1);
				if(ext.lastIndexOf(".") != -1) ext = ext.substring(ext.lastIndexOf("."));
				else ext = null;
				if(ext != null) fileName += ext;
				uploadImageById[fileName] = uploadImages[idx];						
				this.control.imageUploadFile(fileName, filePath);
			}else{
				fileName += ".img";
				uploadImageById[fileName] = uploadImages[idx];						
				this.control.imageUploadURL(fileName, filePath);
			}
		}
		
		// image upload
		var uploadResult = this.control.imageUpload();
		if(uploadResult){
			//try{
				var json = eval("(" + uploadResult + ")");
				for(var i = 0; i < json.length; i++){
					var imgs = uploadImageById[json[i].fileName];
					if(imgs != null){
						for(var j = 0; j < imgs.length; j++){
							imgs[j].src = document.location.protocol + "//" + document.location.hostname + json[i].url;
						}
					}
				}
			//}catch(e){}
		}
		
		this.imageUploadProgress.style.display = "none";
		
		var iframewin = this.wrapperDoc.getElementById('tx_canvas_wysiwyg').contentWindow;
		iframewin.focus();
	}
	,uploadBodyImageNoneApplet:function(doc, callback){
		var imgs = doc.body.getElementsByTagName("img");
		var uploadImages = {};
		var hasImage = false;
		
		for(var i = 0; i < imgs.length; i++){
			var src = imgs[i].src;
			if(this._checkUploadImage(src)){
				if(uploadImages[src] == null){
					uploadImages[src] = [];
				}
				uploadImages[src].push(imgs[i]);
				hasImage = true;
			}else{
				imgs[i].width = imgs[i].width;
				imgs[i].height = imgs[i].height;
			}
		}
		if(hasImage){
			this._showProgress();
			try{
				this._uploadProcessNoneApplet(uploadImages, doc, callback);
			}catch(e){}
		}else{
			if(callback) callback();
		}
	}
	,_uploadProcessNoneApplet:function(uploadImages, doc, callback){
		var _self = this;
		var _def = $.Deferred(), _defs = [];
		var uploadImageById = {};
		var uploadedImage = {};
		function blobUpload(blob, img_path){
			var type = (blob.type.split("/")[1]||"").toLowerCase();
			var ext = "gif";
			if(type == "gif") ext = "gif";
			else if(type == "jpg" || type == "jpeg") ext = "jpg";
			else if(type == "png") ext = "png";
			else if(type != "") ext = type;
			
			var imageSeq = (new Date).getTime() + (_self.nSeq = (_self.nSeq || 0) +  1);
			var imageName = "image." + imageSeq + '.' + ext;			
			//var imageUrl = '$FILE/Image.' + imageSeq + "." + ext + '?OpenElement&' + imageSeq;
			
			uploadImageById[imageName] = uploadImages[img_path];
			
			var form_data = new FormData();
			form_data.append("__Click", "0");
			form_data.append("%%PostCharset", "UTF-8");
			form_data.append("cid", imageSeq);
			form_data.append("Body", "");
			form_data.append("%%File", blob, imageName);
			var formAction = document.location.protocol + "//" + document.location.host 
						+ (_self.uidoc.options.server?'/' + _self.uidoc.options.server:'')
						+ '/ngw/core/temporarily.nsf/ImageUpload?OpenForm'
						+ '&ImageLinkKey=' + encodeURIComponent(_self.imageLinkKey)
						+ '&prefix=' + _self.uidoc.options.server
						+ '&type=CONTROL';
			
			var xhr = new XMLHttpRequest();
			xhr.open("POST", formAction, false);
			xhr.send(form_data);
			var uploadResult = xhr.responseText;
			var result = null;
			if(uploadResult){
				var json = eval("(" + uploadResult + ")");
				if(json){
					var img_src = document.location.protocol + "//" + document.location.hostname + (_self.uidoc.options.server?'/' + _self.uidoc.options.server:'') + json.url;
					result = {img_src:img_src, uploadResult:uploadResult, imageName:imageName};
				}
			}
			return result;
		}
		for(var img_path in uploadImages){
			var originFilePath = filePath = img_path;					
			if(originFilePath.search(/^(?:file:\/\/\/|[a-zA-Z]:)/) == -1){
				var $defe = $.Deferred();
				_defs.push($defe);
				function upimage(img_path){
					var $def = $.Deferred();							
					var xhr = new XMLHttpRequest();
					xhr.responseType = "blob";
					xhr.onload = function() {
						if (xhr.readyState == 4 && xhr.status == 200) {
							var uploadInfo = blobUpload(xhr.response, img_path);
							if(uploadInfo){
								try{
									//var json = eval("(" + uploadInfo.uploadResult + ")");
									var imgs = uploadImageById[uploadInfo.imageName];
									if(imgs != null){
										for(var j = 0; j < imgs.length; j++){
											//imgs[j].src = document.location.protocol + "//" + document.location.hostname + json[i].url;
											//uploadedImage[uploadInfo.imageName] = document.location.protocol + "//" + document.location.hostname + json.url;
											uploadedImage[uploadInfo.imageName] = uploadInfo.img_src;
										}
									}
								}catch(e){}
							}
							$def.resolve();
						}else{
							$def.resolve();
						}
					};
					xhr.onerror = function(){
						$def.resolve();
					}; 
					xhr.open("GET", img_path.replace(/\:\/\/[^\/]+\//, "://" + document.location.host + "/"), true);							
					xhr.send();
					return $def.promise();
				}
				$.when(upimage(img_path)).done($defe.resolve);
			}
		}
		_def.done( function(){
			var uploadInfo = {uploadedImage:uploadedImage, uploadId:uploadImageById};
			_self._updateImageLink(uploadInfo, callback);
		});
		$.when.apply($, _defs).done(_def.resolve);
	}
	,_updateImageLink:function(uploadInfo, callback){
		for(var idx in uploadInfo.uploadedImage){
			var imgs = uploadInfo.uploadId[idx];
			if(imgs != null){
				for(var j = 0; j < imgs.length; j++){
					imgs[j].removeAttribute("id");
					imgs[j].src = uploadInfo.uploadedImage[idx];
				}
			}
		}
		this._hideProgress();
		callback();
	}
};
function isChromeJavaAvailable() {
	function _isJavaAvailable(){
		var javaRegex = /(Java)(\(TM\)| Deployment)/,
		plugins = navigator.plugins;
		if (navigator && plugins) {
			for (plugin in plugins){
				if(plugins.hasOwnProperty(plugin) &&
						javaRegex.exec(plugins[plugin].name)) {
					return true;
				}
			}
		}
		return false;
	}
	var chromeVersion = window.navigator.userAgent.match(/Chrome\/(\d+)\./);
	return !(chromeVersion && chromeVersion[1] && parseInt(chromeVersion[1], 10) >= 42 && !_isJavaAvailable());
}