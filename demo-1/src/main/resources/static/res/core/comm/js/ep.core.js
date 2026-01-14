/**
 *  2014.09.18
 *  - tony
 */

 (function() {
	 "use strict";
	 $(document).off("keydown").on("keydown",function(e) { 
	    var doPrevent = false;
        var d = e.srcElement || e.target;
	    if (e.keyCode === 8 ) {
	        if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE')) 
	             || d.tagName.toUpperCase() === 'TEXTAREA') {
	            doPrevent = d.readOnly || d.disabled; 
	        }
	        else {
	            doPrevent = true;
	        }
	    }
	    if (e.keyCode === 13) {
	    	if(d.tagName.toUpperCase() === "INPUT") {doPrevent = true;}
	    }
	    if (doPrevent) { e.preventDefault();}
	});
	 
	var 
		_log = $ep.log	
		,_isPromise = function(value) {
		    if (typeof value.then !== "function") {
		        return false;
		    }
		    var promiseThenSrc = String($.Deferred().then);
		    var valueThenSrc = String(value.then);
		    return promiseThenSrc === valueThenSrc;
		}
		,_util = {
			ajax : function(opt) {
				//var _dfd = new $.Deferred();
								
				return $.ajax(opt);			
			}
			,blockUI  : function _blockUI(opt,_t) { 
				/* allowtransparency="true" 제거함 IE8에서 하단 Object 표시됨.*/
				var _$block = $('<iframe class="ep-ui-block-iframe" src="about:blank" frameborder="0" /><div class="ep-ui-block ep-ui-blockUI" />').appendTo(document.body),_$msg = null,_tmout=0;
				if(opt && typeof opt.message !== "undefined") {
					_$msg = _$block.filter(".ep-ui-block.ep-ui-blockUI").after('<div class="ep-ui-block ep-ui-blockUI-message" style="display:none;">' + (typeof opt.message == "string" ? opt.message : 
					typeof opt.message == "object" ? opt.message.text ? opt.message.text : "" : "") +'</div>').next().fadeIn();
					typeof opt.message == "object" ? opt.message.css ? _$msg.css(opt.message.css) : "" : "";
					typeof opt.message == "object" ? opt.message.classes ? _$msg.addClass(opt.message.classes) : "" : "";				
				}

				if (_util.isMobile.Any()){
					opt.css = {"opacity" : "0", "filter" : "alpha(opacity=0)"}
				}
				
				var _do = { unblock : function() {if(_tmout) {clearTimeout(_tmout);};$(_$block).add($(_$msg)).fadeOut().remove();_$block=null;_$msg=null;opt && typeof opt.success == "function" ? opt.success() : "";}};
				opt && opt.css && _$block.css(opt.css);
				opt && opt.classes && _$block.addClass(opt.classes);
				opt && opt.hide && $.isNumeric(opt.hide) && (opt.hide = parseInt(opt.hide,10));
				if(opt && opt.hide) {
					switch(typeof opt.hide) {
					case "string":	$(_$block).add($(_$msg)).on(opt.hide, _do.unblock);break;
					case "number":
						_tmout=setTimeout(function(){_do.unblock();}, opt.hide);
						/*$(_$block).add($(_$msg)).on("click", _do.unblock);*/
						break;
					case "object": typeof opt.hide.event === "string" ?  $(_$block).add($(_$msg)).on(opt.hide.event, _do.unblock) : "";
						typeof opt.hide.delay === "number" ?  _tmout=setTimeout(function() {_do.unblock();}, opt.hide.delay) : "";break;
					}
				}
				return _do;
			}
			,toast : function(message , delay , success,css) {
				if($(".ep-ui-toast").size() > 0) {return;} 
				var _css = css || {};
				_util.blockUI({
					message : {  
						text : message
						,classes : "ep-ui-toast"
						,css : _css
						/*,css : {
							"background" : "#eef6f9 none"		,"padding" : "14px 10px"
							,"color" : "#005193" 					,"width" : "500px"
							,"line-height" : "22px"					,"font-size" : "14px"
							,"margin-left" : "-250px"				,"margin-top" : "-50px" 
						}*/
					}
					,success : typeof delay === "function" ? delay : typeof success === "function" ? success : undefined 
					,hide : (typeof delay == "undefined" || typeof delay == "function") ? 1300 : delay 
					,css : {"background" : "#fff", "opacity" : "0"}
				}); 
			}
			,loadPage : function(sel,url,e) {
				var _self = this,
					_dfd = new $.Deferred()
					,_url = $ep.urlVersion(url)
					,_isiframe = false	
					,_osel = $(sel);
				
				function _loadPage() {
					var _delay = _self.delay();
					if(_osel.size() >0 ) {
						_osel.empty();
						_delay.run(function() {
							_osel.html('<div class="ep-progress box-size"><span class="ep-loading">' + $ep.LangPatternString("{TEXT.LOADING}") + '</span></div>');
						},300);
						_osel.data("page_href",_url);
						if(_osel.is("iframe")) {_isiframe = true;}						
					}					 
					_self.ajax({
						url : _url 
						,type : "get"
						,async:true
						,success : function(html,textStatus,xhr) {
							function _write(__html) {
								_delay.clear();
								!_isiframe && _osel.size() > 0 && _osel.html(__html);
								_isiframe && (function() {
									var myIFrame = _osel[0];
									var ifdoc  = (myIFrame.contentWindow) ? myIFrame.contentWindow : (myIFrame.contentDocument.document) ? myIFrame.contentDocument.document : myIFrame.contentDocument;
									
									ifdoc.document.open();
									ifdoc.document.write(__html);
									ifdoc.document.close();
									ifdoc.document.parentIFrameElement = _osel[0];
								})();
								if(_isiframe) {	return ;}
								_dfd.resolve(__html,textStatus);
								if(e && _osel.size()) {	
									if(typeof e.after === "function") {e.after(_osel,textStatus,xhr);}	
								}							
							}
							 
							if (!(e && typeof e.before === "function")) {_write(html);return;}
							$.when(e.before(html,textStatus,xhr)).done(function(html) {
								var _html = html;
								if(_html === false) { return _dfd.resolve(textStatus,"cancel");}
								if(_html !== true && _html !== undefined) {html = _html;}
								_write(html);
							});
							
						}
						,error : function(xhr,textStatus,error) {
							_delay.clear();
							_osel.empty();
							_osel.html('<div class="errormessage"><p class="warning">'+$ep.LangString("ERROR.RESPONSE_PAGE_EXCEPTION")+'</p></div>');
							if(e) {	if(typeof e.after === "function") {if(e.after(error,textStatus,xhr) === false) { return _dfd.resolve(textStatus,error);}	}}
							_dfd.resolve(textStatus,error);
						}
					});
					
				};
				if(_osel.size() > 0) {
					var _event = $.Event("beforedestroy");
					$("form",_osel).trigger(_event);
					if(_event.result) {						
						if(_event.result === false) {return;}
						if(_isPromise(_event.result)) {
							_event.result.done(function(iscontinue) {
								if(iscontinue === false){ return;}
								_loadPage();
							});
						} else {
							_loadPage();
						};						
					} else {
						_loadPage();
					}					
				} else {_loadPage();}
				return _dfd.promise();
			}
			,expression : function (_pattern,_parent,nullpass) {
				var _v = _pattern;
				if(!_parent) {return;}
				while(_v.match(/\{([a-zA-Z0-9\.\$\@]+)\}/g)) {
					var _o = RegExp.$1 ,_re = new RegExp("\\{" + _o + "\\}","g")
						,_ip = _o.split(".") ,_fv = _parent;
					$.each(_ip,function(_idx,__v) {
						_fv = _fv[__v];
						if(!_fv) {return false;}
					});
					if(!_fv) { _fv = nullpass === true ?  "-null-" : "";} 
					_v = _v.replace(_re,_fv);					
				}
				return _v;
			}
			,tagReplace : function(shtml,stag,srep,isInner) {
				var _reg = new RegExp('(<'+stag+'.*?>)([\\s\\S]*?)(</'+stag+'>)|<'+stag+'.*?[/]?>',"gi"); 
				return isInner === true ? shtml.replace(_reg,"$1"+srep+"$3") : shtml.replace(_reg,srep); 
			} 
			,removeTag : function(html,stag,isInner){
				var _reg = new RegExp('(<'+stag+'.*?>)([\\s\\S]*?)(</'+stag+'>)|<'+stag+'.*?[/]?>',"gi"); 
				return isInner === false ? html.replace(_reg,"$2") : html.replace(_reg,""); 
			}
			,patternCompletion:function(pattern,data,nullstr) {
				var _pattern = pattern;
				while(_pattern.match(/\[([\w\s\{\}\=\-\(\)\/\:\"\'\&\#\;\%\+]+)\]/g)) {
					var _cap = RegExp.$1
						,__re = _util.expression(_cap,data,true) 
						,_reg = new RegExp("\\[" + _cap.replace(/\(/g,"\\(").replace(/\)/,"\\)") + "\\]","g");
					_pattern = _pattern.replace(_reg,__re.match(/-null-/g) ? nullstr ? nullstr : "" : __re);				
				}
				return _util.expression(_pattern,data);			
			}
			,CURI : $.CURI
			,browser : {
				msie : /MSIE|rv:11\.0/i.test(navigator.userAgent)
				,ie8 : /MSIE 8/i.test(navigator.userAgent)
				,ie9 : /MSIE 9/i.test(navigator.userAgent)
				,ie10 : /MSIE 10/i.test(navigator.userAgent)
				,ie11 : /rv:11\.0/i.test(navigator.userAgent)
				,chrome : /Chrome/i.test(navigator.userAgent) 
			}
			,isMobile : {
		        Android: function(){
		        	return navigator.userAgent.match(/Android/i) == null ? false : true;
		        },
		        BlackBerry: function(){
		        	return navigator.userAgent.match(/BlackBerry/i) == null ? false : true;
		        },
		        IOS: function(){
		        	return navigator.userAgent.match(/iPhone|iPad|iPod/i) == null ? false : true;
		        },
		        Opera: function(){
		        	return navigator.userAgent.match(/Opera Mini/i) == null ? false : true;
		        },
		        Windows: function () {
		        	return navigator.userAgent.match(/IEMobile/i) == null ? false : true;
		        },
		        Any: function () {
		        	return (_util.isMobile.Android() || _util.isMobile.BlackBerry() || _util.isMobile.IOS() || _util.isMobile.Opera() || _util.isMobile.Windows());
		        }
			}
			,getApp : function(appcode,company,callBack,ajaxOpt) {
				if(!appcode) {return null;}
				var _self = this, _result = null
					,_callback = typeof company == "function" ? company : callBack
					,_company = typeof company == "string" ? company : $ep.user.companycode() 
					,_ajaxOpt = typeof callBack != "function" && typeof ajaxOpt == "undefined" ? callBack : ajaxOpt
					,_appcode = (_company ? _company + "." : "") + appcode;
				
				if(!_company) {_log("companycode is empty.",arguments);return;}
				if($ep.cache.app[_appcode]) {_callback && _callback($ep.cache.app[_appcode]);return $ep.cache.app[_appcode];} /* cache */
				var _uri = $.CURI( "/ngw/core/profile.nsf/api/data/collections/name/profilecode",{
					category : _appcode
				});
				_util.ajax($.extend({
					url : _uri.url
					,async : true
					,success : function(data,txtStatus,xhr) {
						if(typeof data != "object" || data.length == 0) {_callback && _callback(_result);return;}
						$ep.cache.app[data[0]["_companycode"] + "." + data[0]["_syscode"]] = _result = {
							company : data[0]["_company"]
							,companycode : data[0]["_companycode"]
							,name : data[0]["_sysname"]
							,title : data[0]["_title"]
							,noteid :  data[0]["@noteid"]
							,syscode : data[0]["_syscode"]
							,sysdir :  data[0]["_sysdir"] && ("/" + data[0]["_sysdir"].replace("\\","/"))
							,langprefix : data[0]["_langprefix"].toUpperCase()
							,languagepack : data[0]["_languagepack"]
							,ismastercompute : data[0]["_mailmasterhost"] == "1" ? true : false 
						};
						function _completed(__master) {
							_result.leftframe =  (function(o,m) {
								if(!o) {return "";}
								var _o = o.match(/^\//g) ? o : (_result.sysdir.match(/^\//g) ? "" : "/") + _result.sysdir + (_result.sysdir.match(/\/$/g) ? o :  "/" + o);  
								return  __master ? _util.patternCompletion(_o,__master) : _o;
							})(data[0]["_leftframe"],__master);
							_result.contentframe = (function(o,m) {
								if(!o) {return "";}
								var _o = o.match(/^\//g) ? o : (_result.sysdir.match(/^\//g) ? "" : "/") + _result.sysdir + (_result.sysdir.match(/\/$/g) ? o :  "/" + o);  
								return  __master ? _util.patternCompletion(_o,__master) : _o; 
							})(data[0]["_contentframe"],__master);
							_callback && _callback(_result);
							return;
						};
						if(_result.ismastercompute) {
							_self.getMasterHost(function(_r) {_completed(_r ? _r : null);});
						} else {_completed();}
						return;
					}					
				},_ajaxOpt));
				return _result;
			}
			,getMasterHost : function(callback,id, opt){
				var _uri = $.CURI( "/ngw/core/lib.nsf/mailmasterhost?readform",{id : id});
				if($ep.cache.master[id]) {callback($ep.cache.master[id]);return;}
				_util.ajax({
					url : _uri.url
					,success : function(data, txtStatus,xhr) {
						if(!data || !data.mailmasterhost) {callback && callback(null);return;} 
						var _r = data;
						$ep.cache.master[_r.id] = _r;
						callback && callback(_r); 
					}
				});
			}
			,objectFilter : function(o,pattern) {
				if(!o) {return null;}
				var _r = null
					,_pattern = pattern ? $ep.Array(pattern).isArray() ? pattern : pattern.split($$.SEPERATE.field) : null;				

				if($ep.Array(o).isArray()) {
					_r = $ep.Array(o).datafilter(function(__idx,__dat) { return _util.objectFilter(__dat,_pattern);});
				} else {
					_r = {};
					for(var _idx = 0; _pattern.length > _idx; _idx++){
						_r[_pattern[_idx]] = o[_pattern[_idx]] ? o[_pattern[_idx]] : null; 
					};
				}
				return _r;
			}
			,objectToString : function(o,pattern,sep) {
				var _r = ""
					,_pattern = pattern ? $ep.Array(pattern).isArray() ? pattern : pattern.split($ep._CONST.SEPERATE.col) : $ep._CONST.ORG_DEF_MASK
					,_sep = sep ?  sep : $ep._CONST.SEPERATE.col;
				if($ep.Array(o).isArray()) {
					for(var a = 0; o.length > a; a++) {_r += (_r ? $ep._CONST.SEPERATE.record : "" ) + _util.objectToString(o[a],_pattern,_sep);}; 
					return _r; 
				}
				if(_pattern) { 
					for(var _idx = 0;_pattern.length > _idx; _idx++) {	
						var _i = _pattern[_idx];	_r += (_r ? _sep : "") + (o[_i] ? o[_i] : "");
					}
				} else { $.each(o, function(idx,v) {	_r += (_r ? _sep : "")  + v;	});}
				return _r;
			}
			,stringToObject : function(s,mask,col,field) {
				if(!s) {return;};
				var result = [], _s = $ep.Array(s).isArray() ? s : s.split(field ? field : $ep._CONST.SEPERATE.field)
					,_mask = mask ? mask.split($ep._CONST.SEPERATE.col) : $ep._CONST.ORG_DEF_MASK.split($ep._CONST.SEPERATE.col);
					$ep.Array(_s).datafilter(function(idx,dat) {			 		
						var __s = dat.ltrim().rtrim().split(col ? col : $ep._CONST.SEPERATE.col)
							,_obj = null;
						if(__s.length == 0) {return;}
						if(__s.length == 1 && __s[0] == "") {return;}
						$ep.Array(_mask).datafilter(function(_idx,_dat) {
							if(!_obj) {_obj = {};};
							//if(__s[_idx]) { 메일에서 공백일때도 구조체를 만들어야 한다.
								_obj[_dat] = __s[_idx] ? __s[_idx] : "";
							//}; 
						});
						if(_obj) {result.push(_obj);}
					}); 
				return result;
			}
			,delay : function(){
				return (function() {
					var _timer = 0
						,_result = {
							clear : function(){
								clearTimeout(_timer);
								return this;
							},
							run : function(callback,ms){
								this.clear();
								_timer = setTimeout(callback,ms);
							}
						};
					return _result;
				})();
			}
			,keepObject : function() {
				return (function() {
					var _v = $("body object:visible")
						,_result = {
							hide : function() {return _v && _v.hide();}
							,show : function() {return _v && _v.show();}
							,clear : function() {_v = null;}
						};
					return _result;
				})();
			}
			,cleanAwareness : function() {
				var _list = $ep.cache.awareness;
				$.each(_list,function() {if(this.unusedtime() > 10) {this.destroy();}	});
			}
			,directURL : function(url,argv,argv2) {
				var _uri = $.CURI(url,argv);
				_uri.setArgv({_ver : ""});
				var _undock = $.CURI("/ngw/core/lib.nsf/undock.html?readform",argv2);
				_undock.setParam({url : encodeURIComponent(_uri.url)});
				return _undock;
			}
			,openPage : function(url,argv,features,argv2) {
				/*var _uri = $.CURI(url,argv);
				_uri.setArgv({_ver : ""});
				var _undock = $.CURI("/res/core/undock.html",argv2);
				_undock.setParam({url : encodeURIComponent(_uri.url)});*/
				var _undock = this.directURL(url,argv,argv2); 
				var _features = features ? features : {};
				return $.winOpen(_undock.url,"_blank",$.extend({"scrollbars" : "yes"},_features));
			}
			,windowTitle : function(title) {
				document.title = $.type(title) == "function" ? title.call(this,title) : title;
			}
			,abc : {
				status : 0,   					//0 - offline, 1 - online 
				live : 0,						/* timeout */
				alive : false,  				/* 살아 있는지 */
				lock : false,					/* 처리중.. */
				repeatlimit : 10,  				/* abc online 체크 반복 제한. 0 - 무한*/
				_repeat : 0, 					/* abc 온라인 체크 반복 횟수 */
				delayRefresh : 10000,    		/* IPT Awareness 확인 주기 */
				delayConnection : 60000,  		/* ABC Online Check 확인 주기 */
				req : function(re,o) {
					var _self = this;
					return _util.ajax($.extend({
						url : $ep._CONST.ABC.REQUESTURL
						,dataType : "jsonp"							
						,timeout : 1500
						,data : re
					},o));
				},
				_onLineCheck : function() {
					var _self = this;
					_self.alive = true;
					return this.req({reqType : "typeChat",subType : "none"})
					.always(function(xhr,txt,msg) {
						if(txt == "timeout") {
							_self.status = 0;
							_self._repeat++;
							setTimeout(function() {
								if(_self.repeatlimit != 0 && _self.repeatlimit < _self._repeat) {_self.alive = false;return;}
								_self._onLineCheck();
							},_self.delayConnection);
							return;
						}
						_self._repeat = 0;
						_self.status = 1;
						_self.vitalize();
					});
				},
				chat : function(ids) {
					//if(this.status == 0) {_log("messenger offline...");return;}
					if(window.ePortalConfig && window.ePortalConfig.username){
						if(!this.abc_login_id || (this.abc_login_id != window.ePortalConfig.username)) return $.Deferred().reject("");
					}else if(window.$ep && $ep.cache && $ep.cache.master){
						var userfn = '';
						for(var idx in $ep.cache.master){
							if($ep.cache.master[idx].id){
								userfn = $ep.cache.master[idx].id;
								break;
							}
						}
						if(!this.abc_login_user || (userfn && userfn != this.abc_login_user.replace(/\,/g, "/"))) return $.Deferred().reject("");
					}
					var comp = this.abc_login_user.replace(/,/, "/");

					for(var i = ids.length - 1; i >= 0; i--){
						if(ids[i].replace(/,/, "/") == comp){
							ids.splice(i, 1);
							break;
						}
					}
					if(ids.length == 0) return $.Deferred().reject("");
					return this.req({
						reqType : "typeChat"
						,subType : "chat"
						,param1 : $.isArray(ids) ? ids.join("|") : ids
					});
				},
				phone : function(phon) {
					//if(this.status == 0) {_log("abc messenger offline...");return;}
					//if(!phone) {return;}
					if(window.ePortalConfig && window.ePortalConfig.username){
						if(!this.abc_login_id || (this.abc_login_id != window.ePortalConfig.username)) return $.Deferred().reject("");
					}else if(window.$ep && $ep.cache && $ep.cache.master){
						var userfn = '';
						for(var idx in $ep.cache.master){
							if($ep.cache.master[idx].id){
								userfn = $ep.cache.master[idx].id;
								break;
							}
						}
						if(!this.abc_login_user || (userfn && userfn != this.abc_login_user.replace(/\,/g, "/"))) return $.Deferred().reject("");
					}
					return this.req({
						reqType : "typeChat"
						,subType : "phone"
						,param1 : phon	
					});
				},
				awareness : function(ids) {
					return this.req({
						reqType : "typeAW"
						,subType : "getStatus"
						,param1 : $.isArray(ids) ? ids.join("|") : ids
					});
				},
				cacheRefresh : function(){
					var _dfd = new $.Deferred();
					/*if(this.status == 0 ) {_dfd.resolve();return _dfd.promise();}*/
					_util.cleanAwareness();
					var _list = $ep.cache.awareness,_ids = [];
					$.each(_list, function(v) {_ids.push(v);});
					if(_ids.length == 0) { _dfd.resolve("none");return _dfd.promise();}
					return this.awareness(_ids)
					.done(function(data) {
						if(!data || !data.buddyState) {return;}
						$.each(data.buddyState, function(_idx,_data) {
							var _o = _list[_data.uid];
							if(!_o) {return;}
							if(_o.ipt.status != _data.ipt) {	_o.iptUpdateStatus(_data.ipt);}							
						});
					}).fail(function() {$.each(_list, function(_idx,_o) {_o.iptUpdateStatus(14);});});
					
				},
				vitalize : function() {
					return;
					var _self = this;
					if(this.lock == true) {_log("locked");return;}
					_self.lock = true;
					_self.alive = true;
					_self.cacheRefresh().always(function(xhr,txt) {
						if(txt == "timeout") {_self.devitalize();_self._onLineCheck();return;}
						if(xhr == "none" && _self.status == 0) {_self._onLineCheck();_self.lock = false;return;}
						_self.lock = false;
						//_self.status = 1;						
						_self.live = setTimeout(function() {_self.live != 0 && _self.vitalize();},_self.delayRefresh); 	
					});
					
				},
				devitalize : function() {
					clearTimeout(this.live);
					this.live = 0;
					this.alive = false;
					this.lock = false;
				}
			}
			,stproxy : {
				chat : function(ids) {
					var _ids = $.isArray(ids) ? ids : [ids];
					if($ep.util.abc.status == 1) {
						$ep.util.abc.chat(_ids).fail(function() {
							
						});
						return;
					}
					/*
					 * ABC AWARENESS
					 * if(!stproxy.isLoggedIn) {
						//$ep.util.toast("로그인 암됨.",4000);
						return;
					}
					_ids.length > 1 && stproxy.openGroupChat(_ids);
					_ids.length == 1 && stproxy.openChat(_ids[0]);*/
				}
			}
			,connUserID : function(email,callback) {
				var _userid = "",_callback = callback;
				if(!email) {return _userid;}
				return this.ajax({	url : "/profiles/atom/profile.do",async:true,dataType : "xml",data : {email : email}})
				.always(function(xml,stat) {
					if(stat == "success") {_userid = $(xml).find("contributor").children("snx\\:userid").text();}					
					_callback && _callback(_userid);
				});				
			}
	};
	$ep.util = _util; 
 })();
 
 
 