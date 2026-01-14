/**
 * Bora Word Control
 */
function ApOnEditor(objkey){
	this._instanceId = null;
	this._parent = null;
	this.objectId = objkey;
	this._editor = null;
	this.isActiveXEditor = true;
	this._instanceId = ApOnEditor.set(this);
	$ep.loadLangPack("core.keditor");
	this._init();
}
$ep.inheritStatic(ApOnEditor, "CORE.KEDITOR", "core.keditor");
ApOnEditor.CLASSID = "CLSID:8EEBE06F-29A9-4704-B339-F6CB260F71E3";
ApOnEditor.VERSION = "1,7,10,601";
ApOnEditor.ObjectHTML = function(instance){
	return '<OBJECT name="' + instance.objectId + '" ID="' + instance.objectId + '"'
		+ ' instanceId="' + instance.getInstanceId() + '"'
		+ ' CLASSID="' + ApOnEditor.CLASSID + '"'
		+ ' height="100%" width="100%" '
		+ ' Codebase="/res/core/bora/ocx/BWordXU.cab#version=' + ApOnEditor.VERSION + '">'
		+ ' <PARAM name="InitFilePath" value="/res/core/bora/ini/BWordXU.ini">'
		+ ' <PARAM name="IsBrowserBar" value="true">'
		+ '</OBJECT>';
};
ApOnEditor._INSTANCE = {};
ApOnEditor._INSTANCE_COUNT = 0;
ApOnEditor.set = function(instance){
	var key = "ApOnEditor_" + (ApOnEditor._INSTANCE_COUNT++);
	ApOnEditor._INSTANCE[key] = instance;
	return key;
};
ApOnEditor.get = function(key){
	return ApOnEditor._INSTANCE[key];
};
ApOnEditor.destroy = function(key){
	ApOnEditor._INSTANCE[key] = null;
	delete ApOnEditor._INSTANCE[key];
};
ApOnEditor.prototype = {
	"getInstanceId":function(){
		return this._instanceId;
	},
	"_init":function(){
	},
	/**
	 * Editor 로드
	 * @param _formBody
	 * 		Editor 표시할 Object
	 */
	"deploy":function(_formBody){
		var _self = this;
		this._parent = _formBody;
		var obj = $(ApOnEditor.ObjectHTML(_self));
		/* IE7, 8 모드 실행 안됨
		 * obj[0].attachEvent("InitComplete", function(){
			ApOnEditor.get(_self.getInstanceId()).onLoadComplete();
		});*/
		obj.appendTo(_self._parent);		
		this._editor = document.getElementById(this.objectId);
		this._lcheckcount = 0;
		setTimeout(function(){_self._loadCheck();},20);
		this._parent.data("WEC",_self);
	},
	"_loadCheck":function(){
		var _self = this;
		this._lcheckcount++;
		if(this._lcheckcount > 5 || (_self._editor && _self._editor.IsOK && _self._editor.IsOK())){
			_self.onLoadComplete();
		}else{
			setTimeout(function(){_self._loadCheck();},20);
		}
	},
	/**
	 * Editor Load Complete Event
	 */
	"onLoadComplete":function(){		
		this._editorInit();
		this._parent.trigger("initEditorComplete",this);
		this._editor.SetCaretPosition(1,1,1);
	},
	/**
	 * Editor 초기설정
	 */
	"_editorInit":function(){
		this._editor.ShowBarIcon(10371, false);
		this._editor.showBarIcon(10380, true);
		this._editor.ShowBarSeparator(10380 , true);				
		this._editor.showBarIcon(10045, false);
		this._editor.showBarIcon(10400, false);
		this._editor.showBarIcon(10080, false);
		this._editor.showBarIcon(10059, false);
		this._editor.showBarIcon(10017, false);
		this._editor.showBarIcon(10068, false);
		this._editor.ShowBarSeparator(10068, false);
		this._editor.showBarIcon(10403, false);
		
		this._editor.showBarIcon(10443, false); // 도형
		this._editor.ShowBarSeparator(10443, false);
		
		this._editor.showBarIcon(10060, false);
		this._editor.showBarIcon(10067, false);
		this._editor.ShowBarSeparator(10067, false);
		this._editor.showBarIcon(57609, false);
//		this._editor.ShowBarSeparator(57603, true);

//		this._editor.IsWebMode = true;
		this._editor.SetServiceServer(document.location.hostname);
		this._editor.SetDefaultFont("맑은 고딕", 10);
//		this.setHTML("<P STYLE='line-height:1.5;margin-top:0;margin-bottom:0'>&nbsp;</P>");
	},
	/**
	 * Editor 초기화
	 */
	"init":function(uidoc){
	},
	/**
	 * Editor HTML 반환
	 */
	"getHTML":function(){
		var html = this._editor.GetHtmlSrc();
		html = html.replace(/<[a-zA-Z]+\s[^>]+([^0-9>])\.(5|50|25)pt[^>]+>/gi,
				function(all){
					return all.replace(/([^0-9>])\.(5|50|25)pt/g, "$1" + "1px");
				});
		return html;
	},
	/**
	 * Editor Text 만 반환
	 */
	"getText":function(){
		return this._editor.GetText();
	},
	/**
	 * Editor 내용 입력
	 * @param html
	 */
	"setHTML":function(html){
		var _html = html;
		try{
			_html = html.replace(/<([a-zA-Z0-9]+)([^>]*)((?:src|background)\s*=\s*["'])(\/[^"']*)(["'][^>]*)>/gi,
					function(img, a0, a, b, c, d){
						return '<' + a0 + a + b + "http://" + document.location.hostname + c + d + '>';
					}
				);
		}catch(e){}
		_html = _html.replace(/<[a-zA-Z]+[^>]*currentColor[^>]*>/gi, function(a){
			return a.replace(/currentColor/gi, "black");
		});
		try{
			_html = _html.replace(/<[a-zA-Z]+[^>]*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)[^>]*>/gi, function(a){
				var _color = a.replace(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi, function(a, b, c, d){
					return "#" + ("0" + parseInt(b, 10).toString(16)).slice(-2) 
					+ ("0" + parseInt(c, 10).toString(16)).slice(-2) 
					+ ("0" + parseInt(d, 10).toString(16)).slice(-2) + "";
				});
				return _color;
			});
		}catch(e){}
		var style = '<style> p {margin-top:0;margin-bottom:0} </style>';
		_html = _html.replace(/<bgsound[^>]*>/gi, "");
		if(_html.search(/<\/head/i) != -1) _html = _html.replace(/<\/head/i, style + "</head");
		else _html = "<html><head>" + style + "</head><body>" + _html + "</body></html>";
		try{
			_html = _html.replace(/<font\s+[^>]*face="[^"]*"[^>]*>/gi, function(a, b){
				var fonttag = a;
				var fontF = fonttag.match(/face="([^"]*)"/i)[1];
				fonttag = fonttag.replace(/face="([^"]*)"/i, "");
				if(fonttag.search(/style="/i) != -1){
					fonttag = fonttag.replace(/style="/i, "style=\"font-family:" + fontF + ";");
				}else{
					fonttag = fonttag.replace(/<font /i, "<font style=\"font-family:" + fontF + ";\" ");
				}
				return fonttag;
			});
		}catch(e){}
		_html = _html.replace(/(<[a-zA-Z]+\s+[^>]+font\-family\:)([^;">]*)([;">])/g, function(f, a, b, c){
			return a + b.replace(/'/g, "").replace(/맑은고딕/g, "맑은 고딕") + c;
		});
		try{
			_html = _html.replace(/<th(\s+[^>]*)?>/gi, function(a, b, c){
				if(b.search(/style\s*=\s*/) == -1){
					b = "style=\"font-weight:bold;\" " + b;
				}else if(b.search(/font-weight/i) == -1){
					b = b.replace(/(style\s*=\s*["']?)/, "$1" + "font-weight:bold;");
				}
				return "<th " + b.replace(/^\s*/, "") + ">";
			});
		}catch(e){}
		try{
			_html = _html.replace(/<strong(\s+[^>]*)?>/gi, function(a, b, c){
				if(b.search(/style\s*=\s*/) == -1){
					b = "style=\"font-weight:bold;\" " + b;
				}else if(b.search(/font-weight/i) == -1){
					b = b.replace(/(style\s*=\s*["']?)/, "$1" + "font-weight:bold;");
				}
				return "<strong " + b.replace(/^\s*/, "") + ">";
			});
		}catch(e){}
		try{
			_html = _html.replace(/<u(\s+[^>]*)?>/gi, function(a, b, c){
				if(b.search(/style\s*=\s*/) == -1){
					b = "style=\"text-decoration:underline;\" " + b;
				}else if(b.search(/text-decoration/i) == -1){
					b = b.replace(/(style\s*=\s*["']?)/, "$1" + "text-decoration:underline;");
				}
				return "<u " + b.replace(/^\s*/, "") + ">";
			});
		}catch(e){}
		try{
			_html = _html.replace(/<em(\s+[^>]*)?>/gi, function(a, b, c){
				if(b.search(/style\s*=\s*/) == -1){
					b = "style=\"font-style:italic;\" " + b;
				}else if(b.search(/font-style/i) == -1){
					b = b.replace(/(style\s*=\s*["']?)/, "$1" + "font-style:italic;");
				}
				return "<em " + b.replace(/^\s*/, "") + ">";
			});
		}catch(e){}
		try{
			_html = _html.replace(/<(em|u|strong)(?![a-zA-Z])/gi, "<font").replace(/<\/(em|u|strong)(?![a-zA-Z])/gi, "</font");
		}catch(e){}
//		this._editor.PutHtmlSrc();
		this._editor.HtmlText = _html;
		this._editor.SetCaretPosition(1,1,1);
	},
	/**
	 * Editor Style반환
	 */
	"getStyle":function(){
		var _style = {
			color : "#000000", /* 기본 글자색 */
			fontFamily : $ep.LangString("$CORE.KEDITOR.TOOLBAR.FONTFAMILY_DEFAULT"), /* 기본 글자체 */
			fontSize : "10pt", /* 기본 글자크기 */
			backgroundColor : "#fff", /*기본 배경색 */
			lineHeight : "1.5", /*기본 줄간격 */
			padding : "8px"
		};
		return _style;
	},
	/**
	 * Editor 내용 저장
	 * @param uidoc {$ep.ui.doc} instance
	 */
	"saveHTML":function(uidoc){
		var _self = this;
		var compNewCids = {}, newCids = [];
		var compOldCids = {}, oldCids = [];
		var _imageLinkKey = (uidoc.elements.form[0].MIMEMerge_ImageLinkKey||{value:uidoc.options.unid}).value;
		
		var mime = _self._editor.GetMimeValue();
		var imgCid = (new Date()).getTime().toString(16);
		var imgCount = 0;
		mime = mime.replace(/(content-type:\s*image\/)([^;]*)(;\s*)name="([^"]*)"/gi, function(a, b, c, d, e){
			var ext = c;
			if(ext.toLowerCase() == "jpeg") ext = "jpg";
			else if(ext == "") ext = "gif";
			return b + c + d + 'name="Image.' + imgCid + (imgCount++) + '.' + ext + '"';
		});
		_self._editor.PutMimeValue(mime);
		
		var uploadUrl = 'http://' + document.location.hostname + '/' + (uidoc.options.server?uidoc.options.server + '/':'') + 'ngw/core/temporarily.nsf/ImageUpload?OpenForm'
				+ '&ImageLinkKey=' + encodeURIComponent(_imageLinkKey)
				+ '&prefix=' + uidoc.options.server
				+ '&type=Bora';
		
		_self._editor.LocalUploadPath = 'bora://' + _imageLinkKey + '/'; //'http://' + document.location.hostname + '/' + _imageLinkKey + '/'; //
		var html = _self.getHTML();
		_self._editor.UploadImageDomino(
				uploadUrl, 
				_imageLinkKey);
		
		var newImageRegExp1 = null;
		eval("(newImageRegExp1 = /\"bora:\\/\\/" + _imageLinkKey + "\\/Image\\.([^\\.]*)\\.[^\"]*\"/gi)");
		html = html.replace(newImageRegExp1, function(a, b){
			if(compNewCids[b] == null){
				newCids.push(b);
				compNewCids[b] = true;
			}
			return "\"cid:" + b + "\"";
		});
		
		// 신규 이미지 cid 처리
		var newImageRegExp = null;
		eval("(newImageRegExp = /[\"'][^\"']*\\/Body\\/M2\\?OpenElement(?:\\&amp;|\\&)linked\\=" + _imageLinkKey + "(?:\\&amp;|\\&)cid\\=([^\"']*)[\"']/gi)");
		html = html.replace(newImageRegExp, function(a, b){
			if(compNewCids[b] == null){
				newCids.push(b);
				compNewCids[b] = true;
			}
			return "\"cid:" + b + "\"";
		});
		
		// 기존 이미지 cid 처리
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
	},
	/**
	 * destroy
	 */
	"destroy":function(){
		ApOnEditor.destroy(this._instanceId);
	}
};