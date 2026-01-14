(function(document) {
	// TODO option parameter 문서 정리
	// TODO bookmarklet 작성
	var DEFAULT_UNKNOWN_OPTION_VALUE = "",
			PREFIX_COOKIE = "tx_",
			STATUS_UNINITIALIZED = "uninitialized",
			STATUS_LOADING = "loading",
			STATUS_COMPLETE = "complete",
			ENV_PRODUCTION = "production",
			ENV_DEVELOPMENT = "development",
			MILLISECOND = 1000,
			DEFAULT_TIMEOUT = 5;
	
	var REGX_MATCH_VERSION = /\/(\d+[a-z.]?\.[a-z0-9\-]+\.[\-\w]+)\//;

	var DEFAULT_OPTIONS = {
		environment: ENV_PRODUCTION,
        service: "core",
		version: "",
		host: ""
	};

	var body_loader = null;

	function getBasePath(url) {
		return url.replace(/[^\/]+\/?$/, '');
	}
	var loader_script = {};
	function findLoaderScriptElement(filename) {
		if(loader_script[filename]) return loader_script[filename];
		var scripts = document.getElementsByTagName("script");
		for (var i = 0; i < scripts.length; i++) {
			if (scripts[i].src.indexOf(filename) >= 0) {
				loader_script[filename] = scripts[i];
				return loader_script[filename];
			}
		}
		throw "cannot find '" + filename + "' script element";
	}

	function readURLParam(filename) {
		try {
			var script = findLoaderScriptElement(filename);
			var url = script.src;
			return url.substring(url.indexOf("?") + 1);
		} catch (e) {
			return '';
		}
	}
	
	function readCurrentURLVersion(filename) {
		try {
			var script = findLoaderScriptElement(filename);
			var urlMatch = script.src.match(REGX_MATCH_VERSION);
			if( urlMatch && urlMatch.length == 2 ){
				return urlMatch[1];
			}
		} catch(e) { }
		return "";
	}

	function getDefaultOption(name) {
		return DEFAULT_OPTIONS[name] || DEFAULT_UNKNOWN_OPTION_VALUE;
	}

	function getUserOption(name) {
		var userOptions = Options.parse(readURLParam(Loader.NAME), "&");
		return userOptions.findByName(name);
	}

	function getCookieOption(name) {
		var cookieOptions = Options.parse(document.cookie, /;[ ]*/);
		var value = cookieOptions.findByName(PREFIX_COOKIE + name);
		return value ? decodeURIComponent(value) : value;
	}


	var Options = function() {
		this.data = [];
	};

	Options.prototype = {
		add: function(name, value) {
			this.data.push({ "name": name, "value": value });
		},
		findByName: function(name) {
			var founded;
			for (var i = 0; i < this.data.length; i++) {
				if (this.data[i] && this.data[i].name === name) {
					founded = this.data[i].value;
					break;
				}
			}
			return founded;
		}
	};

	Options.parse = function(rawOptions, separator) {
		var options = new Options();
		var params = rawOptions.split(separator);
		for (var i = 0; i < params.length; i++) {
			var nameAndValue = params[i].split("=");
			options.add(nameAndValue[0], nameAndValue[1]);
		}
		return options;
	};
	
	
	function createScriptDOMElement(src) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = src;
		return script;
	}

	function absolutizeURL(url) {
		var location = document.location;
		if (url.match(/^(https?:|file:|)\/\//)) {
		} else if (url.indexOf("/") === 0) {
			url = "http://" + location.host + url;
		} else {
			var href = location.href;
			var cutPos = href.lastIndexOf("/");
			url = href.substring(0, cutPos + 1) + url;
		}
		return url;
	}

	function loadScriptDOMElement(src, callback) {
		var script = createScriptDOMElement(src);
		var head = document.getElementsByTagName("head")[0] || document.documentElement;
		
		addScriptLoadListener(script, head, callback);
		
		head.insertBefore(script, head.firstChild); // Use insertBefore instead of appendChild to circumvent an IE6 bug.
		return script;
	}
	
	function addScriptLoadListener(script, head, callback){
		if(callback){
			script.onload = script.onreadystatechange = function() {
				if ( !this.readyState ||
						this.readyState === "loaded" || 
						this.readyState === "complete") {
					
					callback();
					
					// Handle memory leak in IE
					if (/MSIE/i.test(navigator.userAgent)) {
						script.onload = script.onreadystatechange = null;
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}
					}
				}
			};
		}
	}

	function callEditorOnLoadHandler(fn) {
		if (typeof fn === "object"  && typeof fn.fn === "function") {
			if(fn.config && fn.config.editor_instanceId != null){
				body_loader.then(
					function(data){
						var html = data.replace(/\$\{instanceId\}/g, fn.config.editor_instanceId||'');
						html = html.replace(/\$\{iconPath\}/g, fn.config.iconPath||'');
						html = html.replace(/\$\{skinPath\}/g, fn.config.skinPath||'');
						$(fn.config.editor_wrapper).html(html);
						if(fn.config.editor_language){
							$('.tx-editor-container', fn.config.editor_wrapper).addClass(fn.config.editor_language);
						}
						if($tx.msie && document.documentMode < 8){
							$tx.ltie8 = true;
							$('.tx-editor-container', fn.config.editor_wrapper).addClass('ltie8');
						}
						if($tx.msie){
							// Tool bar drag 금지
							$('.tx-toolbar-boundary *, .tx-toolbar-boundary').on("selectstart", function(ev){return ev.target && ev.target.tagName && (ev.target.tagName.toLowerCase() == "input" || ev.target.tagName.toLowerCase() == "textarea");});
							$('.tx-toolbar-boundary *, .tx-toolbar-boundary').on("drag", function(){return false;});
						}
						var keditor = KEditor.get(fn.config.editor_instanceId);
						if(keditor && keditor.config.largeToolbar){
							$('.tx-editor-container', fn.config.editor_wrapper).addClass('largeToolbar');
						}
						if(keditor && keditor.config.hideMenus){
							var _hm = keditor.config.hideMenus;
							for(var i = 0; i < _hm.length; i++){
								$('.tx-toolbar-boundary .tx-' + _hm[i], fn.config.editor_wrapper).closest('li.tx-list').hide();
							}
						}
						if(keditor && keditor.config.hideMenuBars){
							var _hb = keditor.config.hideMenuBars;
							for(var i = 0; i < _hb.length; i++){
								$('.tx-toolbar-boundary ul.tx-group-' + _hb[i], fn.config.editor_wrapper).css({'background':'none', 'padding-left':'0px!important'});
							}
						}
						if(keditor && keditor.config.showBottomTab){
                            $('.tx-bottom-tab-wrapper', fn.config.editor_wrapper).show();
                        }
						$('.tx-editor-container', fn.config.editor_wrapper).on('contextmenu', function(){
							return false;
						});
						fn.fn(Editor);
					},
					function(){
						// 본문 오류
					}
				);
			}else{
				fn.fn(Editor);
			}
		}
	}

	var AsyncLoader = function(config){
		this.TIMEOUT = DEFAULT_TIMEOUT * MILLISECOND;
		this.readyState = STATUS_UNINITIALIZED;
		this.url = config.url;
		this.callback = config.callback || function(){};
		this.id = config.id;
		this.load();
	};
	AsyncLoader.prototype = {
		load: function(){
			var url = this.url;
			var self = this;
			try {
				findLoaderScriptElement(url);
			} catch(e){
				self.readyState = STATUS_LOADING;
				var script = loadScriptDOMElement(url, function(){
					self.callback();
					self.readyState = STATUS_COMPLETE;
				});
				if( self.id ){
					script.id = self.id;
				}
			} 
			return this;
		},
		startErrorTimer: function() {
			var self = this;
			setTimeout(function() {
				if (self.readyState !== STATUS_COMPLETE) {
					self.onTimeout();
				}
			}, self.TIMEOUT);
		},
		onTimeout: function() {
			//NOTE: retry or error log?
		},
		onLoadComplete: function(){
		}
	};
	
	var onLoadHandlers = [], isRetry;

	//noinspection UnnecessaryLocalVariableJS
	var Loader = {
		NAME: "editor_loader.min.js",

		TIMEOUT: DEFAULT_TIMEOUT * MILLISECOND,

		readyState: STATUS_UNINITIALIZED,

		/**
		 * <p>개발 환경에서 페이지 로딩시 module 불러오기</p>
		 * @param moduleName {string} e.g. trex/header.js
		 */
		loadModule: function(moduleName) {
			function isModuleNameNotPath(name) {
				return !name.match(/^((https?:|file:|)\/\/|\.\.\/|\/)/);
			}
			
			var url = isModuleNameNotPath(moduleName) ? this.getJSBasePath() + moduleName : moduleName;
			if (DEFAULT_OPTIONS.environment === ENV_DEVELOPMENT) {
				url = url + '?Open&dummy=' + new Date().getTime();				
			}else if(Loader._VER){
				url += '?open&_ver=' + Loader._VER;
			}
			document.write('<script type="text/javascript" src="' + url + '" charset="utf-8"></script>');
		},

		/**
		 * <p>페이지 로딩 완료 후 module 불러오기</p>
		 */
		asyncLoadModule: function(config) {
			return new AsyncLoader(config);
		},

		/**
		 * <p>editor javascript 파일이 로딩 완료되었을 때 호출될 함수를 등록한다.</p>
		 * @param fn {function} 실행될 함수
		 */
		ready: function(fn, config) {
			if (this.readyState === STATUS_COMPLETE) {
				callEditorOnLoadHandler({fn:fn, config:config});
			} else {
				onLoadHandlers.push({fn:fn, config:config});
			}
		},

		finish: function() {
			for (var i = 0; i < onLoadHandlers.length; i++) {
				callEditorOnLoadHandler(onLoadHandlers[i]);
			}
			onLoadHandlers = [];
		},

		getBasePath: function(filename) {
			var basePath = getCookieOption("base_path");
			if (!basePath) {
				var script = findLoaderScriptElement(filename || Loader.NAME);				
				basePath = getBasePath(getBasePath(script.src));
			}
			return absolutizeURL(basePath);
		},

		getJSBasePath: function(filename) {
			return this.getBasePath() + "js/";
		},

		getCSSBasePath: function() {
			return this.getBasePath() + "css/";
		},

		getPageBasePath: function() {
			return this.getBasePath() + "pages/";
		},

		getOption: function(name) {
			return getCookieOption(name) || getUserOption(name) || getDefaultOption(name);
		},

		_VER:''
	};
	window.EditorJSLoader = Loader;

	function initialize() {
		var jsLibModuleName = "editor_lib.min.js";
		var jsModuleName = "editor.min.js";
		DEFAULT_OPTIONS["js_min"] = true;
		try{
			findLoaderScriptElement(Loader.NAME);			
		}catch(e){
			Loader.NAME = 'editor_loader.js';
			jsLibModuleName = "editor_lib.js";
			jsModuleName = "editor.js";
			DEFAULT_OPTIONS["js_min"] = false;
		}
		DEFAULT_OPTIONS["version"] = readCurrentURLVersion(Loader.NAME);
		var envConfig = getUserOption("environment");
		if (envConfig) {
			DEFAULT_OPTIONS.environment = envConfig;
		}
		var i18n = getUserOption("i18n");
		if (i18n) DEFAULT_OPTIONS.i18n = i18n;
		var _ver = getUserOption("_ver");
		if(_ver) Loader._VER = _ver;

		var body_url = (window._KEDITOR_BODY_PATH?window._KEDITOR_BODY_PATH:(Loader.getPageBasePath() + 'editor_body.html' + (_ver?'?open&_ver=' + _ver:'')));
		body_loader = $.ajax({
			url:body_url,
			dataType:'html'
		})
		.then(
			function(data){
				var html = '';
				var _i18n = window[i18n];
				if(_i18n){
					html = _i18n.format(data, false);
				}else{
					html = data.replace(/\{\{([^\}]+)\}\}/g, function($1, $2){
							var keys = $2.split('|');
							return keys[1]||keys[0];
						});
				}				
				return html;
			},
			function(){
				alert('본문 가져오기 오류.');
			}
		);
		Loader.loadModule(jsLibModuleName);
		Loader.loadModule(jsModuleName);
	}
	initialize();
})(document);