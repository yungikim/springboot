/*! newep.js
 *  @Author: tony
 *	@Version : 1.0
 *  @History    
 *    Created		2014.09.02		tony 생성 .
 */ 
(function() {
	if(typeof $ep === "object" && $ep.isloaded === true){ return};
	window.LANGPACK = {};     
	/*
	 	LAB.js4
	*/
	(function(window){
		eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('(3(g){8 h=g.$1f,1k="2a",1z="2m",1a="29",1m="2E",A="2b",1v="28",1o=/^[^?#]*\\//.1L(1Q.2e)[0],1h=/^\\w+\\:\\/\\/\\/?[^\\/]+/.1L(1o)[0],o=s.1Z||s.2t("1Z"),22=(g.23&&1r.1u.1x.S(g.23)=="[1A 2l]")||("2n"1g s.2I.2L),v=3(){},1J=v,11=s.1t("l"),1w=1W 11.M=="2O",10=1w||(11.y&&11.y=="2c"),1B=!10&&11.1D===q,1P=!10&&!1B&&!22;2(g.J&&g.J.1i){2(!g.J.1l)g.J.1l=g.J.1i;v=3(a){g.J.1i(a)};1J=3(a,b){g.J.1l(a,b)}}3 1q(a){6 1r.1u.1x.S(a)=="[1A 2d]"}3 1s(a){6 1r.1u.1x.S(a)=="[1A 2g]"}3 1K(a,b){8 c=/^\\w+\\:\\/\\//;2(/^\\/\\/\\/?/.1c(a)){a=1Q.2o+a}r 2(!c.1c(a)&&a.1O(0)!="/"){a=(b||"")+a}6 c.1c(a)?a:((a.1O(0)=="/"?1h:1o)+a)}3 Z(a,b){C(8 k 1g a){2(a.27(k)){b[k]=a[k]}}6 b}3 1U(a){8 b=9;C(8 i=0;i<a.z.m;i++){2(a.z[i].H&&a.z[i].Y){b=q;a.z[i].Y();a.z[i].Y=u}}6 b}3 X(a,b,c,d){a.1F=a.L=3(){2((a.y&&a.y!="26"&&a.y!="1R")||b[c])6;a.1F=a.L=u;d()}}3 1p(a){a.H=a.7=q;C(8 i=0;i<a.W.m;i++){a.W[i]()}a.V=[];a.W=[]}3 21(b,c,d,e,f){1H(3(){8 a,5=c.U,E;2("2f"1g o){2(!o[0]){1H(t.2h,25);6}o=o[0]}a=s.1t("l");2(c.x)a.x=c.x;2(c.P)a.P=c.P;2(f){2(10){2(b[A])v("T l M: "+5);d.1e=a;2(1w){a.M=q;a.2p=e}r{a.L=3(){2(a.y=="1R")e()}}a.5=5}r 2(f&&5.2q(1h)==0&&b[1k]){E=2r 2s();2(b[A])v("T l M (E): "+5);E.L=3(){2(E.y==4){E.L=3(){};d.R=E.2u+"\\n//@ 2y="+5;e()}};E.2A("2B",5);E.2C()}r{2(b[A])v("T l M (1S): "+5);a.x="R/1S-l";X(a,d,"H",3(){o.2G(a);e()});a.5=5;o.16(a,o.17)}}r 2(1B){2(b[A])v("T l 1X (2P 1D): "+5);a.1D=9;X(a,d,"7",e);a.5=5;o.16(a,o.17)}r{2(b[A])v("T l 1X: "+5);X(a,d,"7",e);a.5=5;o.16(a,o.17)}},0)}3 1j(){8 f={},20=10||1P,K=[],Q={},G;f[1k]=q;f[1z]=9;f[1a]=9;f[1m]=9;f[A]=9;f[1v]="";3 1G(a,b,c){8 d;3 1n(){2(d!=u){d=u;1p(c)}}2(Q[b.5].7)6;2(!a[1a])Q[b.5].7=q;d=c.1e||s.1t("l");2(b.x)d.x=b.x;2(b.P)d.P=b.P;X(d,c,"7",1n);2(c.1e){c.1e=u}r 2(c.R){d.1F=d.L=u;d.R=c.R}r{d.5=b.U}o.16(d,o.17);2(c.R){1n()}}3 1I(a,b,c,d){8 e,O,13=3(){b.13(b,3(){1G(a,b,e)})},N=3(){b.N(b,c)};b.5=1K(b.5,a[1v]);b.U=b.5+(a[1m]?((/\\?.*$/.1c(b.5)?"&1M":"?1M")+~~(2i.2j()*2k)+"="):"");2(!Q[b.5])Q[b.5]={1N:[],7:9};O=Q[b.5].1N;2(a[1a]||O.m==0){e=O[O.m]={H:9,7:9,V:[13],W:[N]};21(a,b,e,((d)?3(){e.H=q;C(8 i=0;i<e.V.m;i++){e.V[i]()}e.V=[]}:3(){1p(e)}),d)}r{e=O[0];2(e.7){N()}r{e.W.14(N)}}}3 15(){8 d,I=Z(f,{}),p=[],D=0,19=9,B;3 1T(a,b){2(I[A])v("l M 7: "+a.U);a.H=q;a.Y=b;1b()}3 1V(a,b){2(I[A])v("l 2v 7: "+a.U);a.H=a.7=q;a.Y=u;C(8 i=0;i<b.z.m;i++){2(!b.z[i].7)6}b.7=q;1b()}3 1b(){2w(D<p.m){2(1q(p[D])){2(I[A])v("$1f.F() 2x: "+p[D]);p[D++]();1d}r 2(!p[D].7){2(1U(p[D]))1d;2z}D++}2(D==p.m){19=9;B=9}}3 1Y(){2(!B||!B.z){p.14(B={z:[],7:q})}}d={l:3(){C(8 i=0;i<t.m;i++){(3(a,b){8 c;2(!1s(a)){b=[a]}C(8 j=0;j<b.m;j++){1Y();a=b[j];2(1q(a))a=a();2(!a)1d;2(1s(a)){c=[].1C.S(a);c.2D(j,1);[].2F.12(b,c);j--;1d}2(1W a=="2H")a={5:a};a=Z(a,{H:9,13:1T,7:9,N:1V});B.7=9;B.z.14(a);1I(I,a,B,(20&&19));19=q;2(I[1z])d.F()}})(t[i],t[i])}6 d},F:3(){2(t.m>0){C(8 i=0;i<t.m;i++){p.14(t[i])}B=p[p.m-1]}r B=9;1b();6 d}};6{l:d.l,F:d.F,1E:3(a){Z(a,I);6 d}}}G={2J:3(a){Z(a,f);6 G},1E:3(){6 15().1E.12(u,t)},l:3(){6 15().l.12(u,t)},F:3(){6 15().F.12(u,t)},2K:3(){K[K.m]={x:"l",1y:[].1C.S(t)};6 G},2M:3(){K[K.m]={x:"F",1y:[].1C.S(t)};6 G},2N:3(){8 a=G,24=K.m,i=24,18;C(;--i>=0;){18=K.2Q();a=a[18.x].12(u,18.1y)}6 a},2R:3(){g.$1f=h;6 G},2S:3(){6 1j()}};6 G}g.$1f=1j();(3(a,b,c){2(s.y==u&&s[a]){s.y="2T";s[a](b,c=3(){s.2U(b,c,9);s.y="26"},9)}})("2V","2W")})(2X);',62,184,'||if|function||src|return|finished|var|false||||||||||||script|length||append_to|chain|true|else|document|arguments|null|log_msg||type|readyState|scripts|_Debug|group|for|exec_cursor|xhr|wait|instanceAPI|ready|chain_opts|console|queue|onreadystatechange|preload|finished_cb|registry_items|charset|registry|text|call|start|real_src|ready_listeners|finished_listeners|create_script_load_listener|exec_trigger|merge_objs|real_preloading|test_script_elem|apply|ready_cb|push|create_chain|insertBefore|firstChild|val|scripts_currently_loading|_AllowDuplicates|advance_exec_cursor|test|continue|elem|LAB|in|root_domain|log|create_sandbox|_UseLocalXHR|error|_CacheBust|preload_execute_finished|root_page|script_executed|is_func|Object|is_array|createElement|prototype|_BasePath|explicit_preloading|toString|args|_AlwaysPreserveOrder|object|script_ordered_async|slice|async|setOptions|onload|execute_preloaded_script|setTimeout|do_script|log_error|canonical_uri|exec|_|items|charAt|xhr_or_cache_preloading|location|loaded|cache|chain_script_ready|check_chain_group_scripts_ready|chain_script_executed|typeof|load|init_script_chain_group|head|can_use_preloading|request_script|opera_or_gecko|opera|len||complete|hasOwnProperty|BasePath|AllowDuplicates|UseLocalXHR|Debug|uninitialized|Function|href|item|Array|callee|Math|random|1E9|Opera|AlwaysPreserveOrder|MozAppearance|protocol|onpreload|indexOf|new|XMLHttpRequest|getElementsByTagName|responseText|execution|while|executing|sourceURL|break|open|GET|send|unshift|CacheBust|splice|removeChild|string|documentElement|setGlobalDefaults|queueScript|style|queueWait|runQueue|boolean|ordered|shift|noConflict|sandbox|loading|removeEventListener|addEventListener|DOMContentLoaded|this'.split('|'),0,{}));	
	})(window); 
	
	if(typeof($LAB) === "undefined") { return;};
	$LAB.setGlobalDefaults({/*AlwaysPreserveOrder: true,*/AllowDuplicates:false	,CacheBust: false, Debug : false});
	var _cache = {}	,_debugMode = true	,_isdock = true	,_isembed = false
		,_minify = (function() {return document.location.href.match(/_min\=0/g) ? false : true;})()
		,_splinter = (function() {return document.location.href.match(/_split\=1/g) ? true : false;})()
		,__companyCode = (function() {	
			var _cookie = document.cookie,_cook = "";
			if(_cookie.match(/[;]?Companycode=([^\\s,;]*)/g)) {_cook = RegExp.$1;}
			if(!_cook) { _cook = "";}
			return _cook;
		})()		
		,__lang = (function() {
			var _cookie = document.cookie,_cook = "";
			if(_cookie.match(/[;]?language=([^\\s,;]*)/g)) { 
				_cook = RegExp.$1;
				_cook = _cook.substring(0,2);
			}
			return document.location.href.match(/lang=([a-z][a-z])/g) ? RegExp.$1 : (_cook || "ko");
		})()	
		,__ver = typeof ePortalConfig != "undefined" ? ePortalConfig["static_ver"] ? ePortalConfig["static_ver"] : "5" : "5" //(Math.random().toString().substr(2,5))
		,__cachecontrol = function(url) {
			function __control(__) {
				var _ = __;
				if(!_minify) {_ = _.replace(/\.min(\.js)/g,"$1");}
				return _.match(/_ver=/gi) ? _ :  (_ + (_.match(/\?/gi) ? "&" : "?") + "_ver=" + __ver);
			};
			if(Object.prototype.toString.call(url) == '[object Array]') {
				var _result = [];
				for(var o in url) {_result[o] = __control(url[o]);}
				return _result.length == 0 ? "" : _result;
			} else {return __control(url);}		 	 
		}
		,_lang = function(x) {if(x) {__lang = x;}return __lang;}
		,_log = function(name) {
			if(!_debugMode) {return;} 
			if (window.console == undefined) { window.console = {log : function(){}};}
			if(typeof console.log == "function") {
				console.log.apply(console, [name + (arguments.length > 1 ? " = " : "")].concat(Array.prototype.slice.call(arguments,1)));	
			} else {
				console.log(name + (arguments.length > 1 ? " = " : ""), Array.prototype.slice.call(arguments,1).join(" "));
			}			
			return;
		} 
		,_LAB = $LAB
		,_loadCSS = function(url) {
			var _lab = _LAB, _url = __cachecontrol(url); 
			if(_cache[_url]) {return;};
			_cache[_url] = true; 			
			if(document.createStyleSheet) { try {document.createStyleSheet(_url);} catch (e) { }} 
			else { var css = document.createElement("link");css.rel = "stylesheet";css.type = "text/css";
					css.media = "all";css.href = _url;document.getElementsByTagName("head")[0].appendChild(css);}
			return {
				script : _lab.script, wait : _lab.wait, css : _loadCSS
			};			
		}
		,_initLangPack = function(cd) {
			var _lang = window["LANGPACK"]; 
			if(!_lang) {return null;}
			if(!cd) {return _lang;}
			var _arr = cd.split(".");
			if(_arr.length == 0) {return null;}
			var _result = _lang;
			$.each(_arr, function(idx,val) {
				_result = _result[val];
				return _result ? true : false;
			});
			return _result ? _result : null;
		}
		,_langURI = function(langpack) {
			if(Object.prototype.toString.call(langpack) == '[object Array]') {
				var _result = [];
				for(var o in langpack) {
					_result[o] = "/res/lang/" + _lang() + "/" + langpack[o] + "." + _lang() + ".js";
				}
				return _result;
			} else {
				return "/res/lang/" + _lang() + "/" + langpack + "." + _lang() + ".js";		
			}
		}
 		,_loadLangPack = function(langpack) {
 			if(!langpack) {return {script : _LAB.script, wait : _LAB.wait, css : _loadCSS};}
 			if(Object.prototype.toString.call(langpack) == '[object Array]'&& langpack.length == 0 ) {return {script : _LAB.script, wait : _LAB.wait, css : _loadCSS};}
 			
			_LAB = _LAB.script(__cachecontrol(_langURI(langpack))).wait();
			return {script : _LAB.script, wait : _LAB.wait, css : _loadCSS}; 
		}
		
		,_loadString = function(cd, pack) {
			var _langPack = pack ? pack :_initLangPack();
			if(!_langPack) {return '<span title="'+cd + '">' + cd + '</span>';}
			var _langPath = cd.match(/^\$/g) ? "" : (this.LANG ? this.LANG + "." : "")
				,_arr = cd.split(".")
				,_result = _arr.length > 0 ? _arr[0].match(/^\$/g) ? window["LANGPACK"] : _langPack : _langPack   
				,_path = _langPath + cd;
			if(_result.length == 0) {return '<span title="'+cd + '">' + cd + '</span>';}
			_arr[0] = _arr[0].replace(/^\$/g,"");
			$.each(_arr, function(idx,val) {
				_result = _result[val];
				return _result ? true : false;});
			if(!_result) {_log("error LANG", "[" + _path + "]");}
			return _result ? _result : _path;
			
		}		
		,_loadModule = function(module) {
			var _mod = (typeof module === "string" ? module.split(",") : module)
				,_lo = []
				,_mo = {
				"jquery" : function() {
					if(!window.$) {	_lo.push(__cachecontrol("/res/core/jquery/jquery.min.js"));}										
				}
				,"jquery.ui" : function() {
					if(!window.$ || !window.$.ui) {
						_loadCSS("/res/core/jquery/jquery-ui/jquery-ui.css");
						_lo.push(__cachecontrol("/res/core/jquery/jquery-ui/jquery-ui.min.js"));
					}
				}
				,"jquery.plugin" : function() {
					if(_splinter) {
						_loadCSS("/res/core/jquery/qtip/jquery.qtip.css");
						_loadCSS("/res/core/jquery/fancytree/amore/ui.fancytree.css");
						_lo.push(__cachecontrol("/res/core/jquery/layout/jquery.layout.min.js"));
						_lo.push(__cachecontrol("/res/core/jquery/jquery.form.min.js"));
						_lo.push(__cachecontrol("/res/core/jquery/qtip/jquery.qtip.min.js"));
						_lo.push(__cachecontrol("/res/core/jquery/fancytree/jquery.fancytree-all.min.js"));
						_lo.push(__cachecontrol("/res/core/jquery/fileupload/jquery.fileupload.min.js"));
					} else {
						_loadCSS("/res/core/comm/css/core.comm.all.css");
						_lo.push(__cachecontrol("/res/core/comm/js/ep.jquery.plugin.all.min.js"));
					}
				}
				,"ep.core" : function() {
					if(_splinter) {
						_loadCSS("/res/core/comm/css/core.comm.base.css");					
						_loadCSS("/res/core/comm/css/core.comm.content.css");					
						_loadCSS("/res/core/comm/css/core.comm.plugin.css");
						_loadCSS("/res/core/comm/css/core.comm.organ.css");
						_lo.push(__cachecontrol("/res/core/comm/js/ep.jslib.min.js"));
						_lo.push(__cachecontrol("/res/core/comm/js/ep.core.min.js"));
						_lo.push(__cachecontrol("/res/core/comm/js/ep.core.plugin.min.js"));
						_lo.push(__cachecontrol("/res/core/comm/js/ep.core.ui.min.js"));
					} else {
						_lo.push(__cachecontrol("/res/core/comm/js/ep.core.all2.js")); 
					}
				}
			};
			
			for ( var _ in _mod) {
				_mo[_mod[_]] && _mo[_mod[_]]();
			};			
			return _lo.length > 0 ? _LAB.script.apply(_LAB,_lo) : _LAB;
		}
		,_loader = function() {
			_LAB = _loadModule(["jquery"]).wait();
			_LAB = _loadModule(["jquery.ui"]).wait();
			_LAB = _loadModule(["jquery.plugin"]).wait();
			_LAB = _LAB.script(__cachecontrol(_langURI("core"))).wait();
			_LAB = _loadModule(["ep.core"]).wait();
 
			return {script : _LAB.script, wait : _LAB.wait, css : _loadCSS};
		}; 

	_LAB = _loader();
	
	var _super = function() {
		function _expression(strLang) {
			var _self = this
			,_reg = /\{([\$0-9A-Z\.\_]+)\}/g  // /\{([\$0-9A-Z\.\_]+)+\}/g
			,_result = strLang.replace(_reg,function(match,langcd) {
				return _self.LangString(langcd);
			});
			return _result.match(_reg) ? _expression.call(_self,_result) : _result; 
			
		}
		function _objectConvert(obj,property) {
			var _self = this
				,_prop = property ? typeof property === 'string' ? property.split(",") : property  : undefined;

			$.each(obj,function(idx,val) {
				if(!val) {return true;}
				switch(typeof val) {
				case "string":
					if(_prop) {	$ep.Array(_prop).indexOf(idx) > -1 && (obj[idx] = _expression.call(_self,val));
					} else {obj[idx] = _expression.call(_self,val);}
					break;
				case "object":
					if(val == window || val == document || val instanceof jQuery || (val.ownerDocument)) {return true;}
					_objectConvert.call(_self,val,_prop);
					break;
				default:
					if($.isArray(val)) {_objectConvert.call(_self,val,_prop);	}
					break;
				}
			});
			return obj;
		}
		this.LangString = function(cd) {
			//if(cd.match(/^\{.*\}$/g)) {return this.LangPatternString(cd);}
			if (!this._LANG) {this._LANG = _initLangPack(this.LANG);}
			if (!this._LANG) {return cd.match(/^\$/g) ? cd : (this.LANG ? this.LANG + "." : "") + cd;}
			return _loadString.call(this, cd,this._LANG); 
		};
		this.LangConvert = function(sel) {
			var _self = this,_$ele = sel ? $(sel) : $("body"); 
			$("[langpack]",_$ele).each(function(idx,val) {
				var _isrep = $(this).is("[langreplace]")
					,_langpack = $(this).attr("langpack");
				if(_isrep) {
					$(this).replaceWith(_self.LangString.call(_self, _langpack));
				} else {					
					$(this).html(_self.LangString.call(_self, _langpack));
					$(this).removeAttr("langpack");
				}				 
			});
		};
		this.LangPatternString = function(cd) {return _expression.call(this,cd);};
		this.LangConvertObject = function(obj,property) {return $.isPlainObject(obj) || $.isArray(obj) ? _objectConvert.call(this,obj,property) : undefined;}	
	};

	var $ep = {
		_CONST : {
			PATH : {
				ORG : "/app/org.nsf"
				,LIB : "/ngw/core/lib.nsf"
				,TEMPATTACH : "/ngw/core/temporarily.nsf/Upload?OpenForm"
			}
			,SEPERATE : { record : ";" ,col : "^",field : "," }
			,ORG_DEF_MASK : "type^empno^name^ename^orgname^eorgname^orgcode^companycode^notesid^company^ecompany^post^epost^lang^email^officephonenumber" /* type^empno^name^ename^orgname^eorgname^orgcode^notesid^lang*/
			,ORG_PERSON_MASK : "type^empno^name^ename^orgname^eorgname^orgcode^companycode^notesid^company^ecompany^post^epost^lang^email^officephonenumber" //사번^이름^영문이름^부서^영문부서^팀코드^회사코드^노츠ID^eip_lang
			/*,ORG_DISPLAY_MASK : function(o) {
				return o.lang == $ep.lang() ? "{name}[ / {orgname}]" : o.ename ? "{ename}[ / {eorgname}]" : "{name}[ / {eorgname}]"	
			}*/
			,ORG_DISPLAY_MASK : {
				"default" : function(o) {return o.lang == $ep.lang() ? "{name}[ / {orgname}]" : o.ename ? "{ename}[ / {eorgname}]" : "{name}[ / {eorgname}]"}
				,"nameonly" : function(o) {return o.lang == $ep.lang() ? "{name}" : o.ename ? "{ename}" : "{name}"}
				,"postonly" : function(o) {return o.lang == $ep.lang() ? "{post}" : o.epost ? "{epost}" : "{post}"}
				,"orgnameonly" : function(o) {return o.lang == $ep.lang() ? "{orgname}" : o.eorgname ? "{eorgname}" : "{orgname}"}
				,"level1" : function(o) {return o.lang == $ep.lang() ? "{name}[ / {orgname}]" : o.ename ? "{ename}[ / {eorgname}]" : "{name}[ / {eorgname}]"}
				,"level2" : function(o) {return o.lang == $ep.lang() ? "{name}[ / {post}][ / {orgname}]" : o.ename ? "{ename}[ / {epost}][ / {eorgname}]" : "{name}[ / {epost}][ / {eorgname}]"}
				,"level3" : function(o) {return o.lang == $ep.lang() ? "{name}[ / {orgname}][ / {officephonenumber}]" : o.ename ? "{ename}[ / {eorgname}][ / {officephonenumber}]" : "{name}[ / {eorgname}][ / {officephonenumber}]"}
				,"level4" : function(o) {return o.lang == $ep.lang() ? "{name}[ / {post}][ / {orgname}][ / {officephonenumber}]" : o.ename ? "{ename}[ / {epost}][ / {eorgname}][ / {officephonenumber}]" : "{name}[ / {epost}][ / {eorgname}][ / {officephonenumber}]"}
			}
			,DATASERVICEMAXVIEWENTRIES : 1500
			,ABC : {
				REQUESTURL : "http://localhost:9414/getstate.html"
			}
		}
		,script : function(url,langPack) {
			var _lab = langPack ? _loadLangPack(langPack) : _LAB;
			_LAB = _lab.script(__cachecontrol(url));
			return {script : this.script, wait : _LAB.wait, css : this.css};
		}
		,css : function(url) {
			_loadCSS(url);	 
			return {script : this.script, wait : this.wait, css : this.css};
		}
		,wait : function(fnc) {
			_LAB = fnc ? _LAB.wait(fnc) : _LAB.wait();
			return {script : this.script, wait : _LAB.wait, css : this.css};
		}
		,lang : _lang
		,user : {
			companycode : function(v) {if(v){__companyCode=v;};return __companyCode;}			
		}
		,inheritStatic : function(method,langPrefix,langpack) {
			if(!langPrefix) {return method;}
			var _s = new _super();
			method.LANG = langPrefix;
			method.LANGPACK = langpack || method.LANG.toLowerCase();
			for (var o in _s) {
				method[o] = _s[o]; 
			}
			return method;
		}
		,loadModule : _loadModule
		,loadLangPack : _loadLangPack
		,inheritClass : function(method,langPrefix,langpack) {
			method.prototype = new _super();
			method.prototype.LANG = langPrefix;
			method.prototype.LANGPACK = langpack || method.LANG.toLowerCase();
			method.constructor = method;
			return method;
		}
		,urlVersion : __cachecontrol
		,log : _log
		,dock : function(isdoc) {if(isdoc === true || isdoc === false) {_isdock = isdoc;};return _isdock;}
		,embed : function(isembed) {if(isembed === true || isembed === false) {_isembed = isembed;};return _isembed;}
		,isloaded : true		 
		,cache : {
			app : {}
			,master : {}  /* mail master */
			,awareness : {}
		}		
	};
	window.$ep = $ep.inheritStatic($ep,"CORE");
	
})();

