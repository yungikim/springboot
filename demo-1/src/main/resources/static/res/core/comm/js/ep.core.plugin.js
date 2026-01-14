/**
 *  2014.09.18
 *  - tony
 */

(function() {
	"use strict";
	var _log = typeof $ep === "undefined" || function(){};
	
	(function() {
		/* 
		 *  $(ele).viewlist 
		 */
		$.widget( "ep.epviewlist", {
			version: "1.11.1"
			,widgetEventPrefix: "epviewlist"
			,options : {
				column : null /* {
					created : {
						title : function(ele,col) {return "작성일";}   // this=plugin, (th element,col)
						,hidewidth : true 					
						,hcss : {width: "110px"}
						,hclasses : "" 
						,sortable : {descending : true, ascending: true}
						,css : {width : "100px"}
						,type : "isodate"
						,dateformat : "yyyy-mm-dd"
						//,render :  function(rele,cele,data,colset) {return data.created;}
							
					}
					//,selectable : "checkbox"  //checkbox,radio
				  	,subject : {	title : "제목"	,sortable : true}
				  	
				} */
				/*,hideheader : true*/
				,dataset : null /*[
						  {created : "20140921T090000",subject : "dafdsafdsfdsfds"}
						  ,{created : "20140922T090000", subject : "Dafdsafdsafdsfadsfdsafds"}
				]*/
				/*,click : function(e,rowele,target,data) {
					_log("rowclick",[e.target,rowele,target,data])
				}*/
				/*,rowrender : function(e,ele,data)*/ 
				/*,clickheader : function(e,_id,_clickid,_head) {
					_log("clickheader",[_id,_clickid,_head]);  //id=fieldid,clickid=header,ascending,descending , _head = th element
				}*/
				,level : 0
			 }
			,_destroy: function() { 
				this.widget().empty().removeClass(this.widgetFullName);
				this.elements = null;
				delete this.elements;
				//$.Widget.prototype.destroy.apply( this, arguments)
			} 
			,elements : {wrap : null, head : null, body : null, data : null}
			,_setOption: function(key, value){ $.Widget.prototype._setOption.apply(this, arguments);return this;}
			,_setOptions : function(options) { $.Widget.prototype._setOption.apply(this, options);return this;}
			,_create : function() {
				
				//if(this.options.column === null) {this.destroy();return;}
				this.element.addClass("ep-widget " + this.widgetFullName);
				this._makeElement();
				if(this.options.hideheader !== true) {this._initHeader();};
				if(this.options.dataset){ this.addData(this.options.dataset);}
				this.element.has(".viewlist-wrap").size() == 0 && this.element.html(this.elements.warp);
			}
			,_makeElement : function() {
				var _warp =  $(".viewlist-wrap",this.element).size() > 0 ? $(".viewlist-wrap",this.element) : $('<div class="viewlist-wrap" />')
					,_head = this.options.hideheader === true ? null : $('<div class="viewlist-head"><table class="viewlist-head-table" /></div>').appendTo(_warp)
					,_body = $('<div class="viewlist-body"><table class="viewlist-body-table"><tbody /></table></div>').appendTo(_warp)
					,_data = $(".viewlist-body-table tbody",_body); 
				this.elements = {
						warp : _warp
						,head : _head
						,body : _body
						,data : _data
				};			
			}
			,_selectable : function(ishead,ele,opt) {
				var _self = this,_html = "<span />";
				switch(opt.type) {
				case "checkbox":			
					ele.addClass("selectable");
					opt.css = opt.css||{width : "20px"};			
					_html = $('<input type="checkbox" name="'+ (ishead ? "checkall" : "check") + '">');
					_html.on("click",function(e) {
						e.stopPropagation();
						if(ishead === true) { 	_self.selectall($(this).prop("checked"));}
					});			
					break;
				case "radio":
					ele.addClass("selectable");
					opt.css = opt.css||{width : "20px"};
					if(ishead === false) {
						_html = $('<input type="radio" name="check">');
						_html.on("click",function(e) {e.stopPropagation();});							
					}
					break;
				}
				return $(_html);
			}
			,_initHeader : function() {
				var _self = this
					,_colset = this.options.column
					,_head = this.elements.head
					,_htable = $(".viewlist-head-table",_head)
					,_thead = $('<thead><tr class="viewlist-head-tr" /></thead>').appendTo(_htable)
					,_tr = $("tr",_thead)
					,_query = _self.options.query
					,_sortcol = _query ? _query.sortcolumn : ""
					,_order = _query ? _query.sortorder :"";	
				if(!_colset) { return;}
				$.each(_colset, function(idx,o) {
					var __col = $('<th class="column header" id="' + idx + '"/>')
						,__o = o
						,__data = idx == "selectable" ? _self._selectable(true,__col,typeof __o === "string" ? (__o = { type : o }) : __o) :  o.title ? (typeof __o.title === "function" ? __o.title.call(_self.element,__col,__o) : __o.title) : "";
					__col.html(__data);
					if(__o.sortable) {
						var _sortable = __col.wrapInner('<span class="sortable" />').children(".sortable");
						if (typeof _sortable === "object") {
							if (__o.sortable === true) {__o.sortable = {ascending : true, descending : true};}
							if(__o.sortable.ascending === true) {
								_sortable.append('<span class="ep-icon arrow-up'+ (_sortcol == idx && _order == "ascending" ? " on" : " off") + '"/>');}
							if(__o.sortable.descending === true) {_sortable.append('<span class="ep-icon arrow-down'+ (_sortcol == idx && _order == "descending" ? " on" : " off") + '"/>');}
							if(__o.sortable.descending && __o.sortable.ascending) {_sortable.addClass("both");} 
							
						}
					}
					__col.on("click",function(e) {
						var _target = $(e.target)
							,_head = _target.closest("th.column.header");
						if(_head.size() == 0) {return ;}
						if(_head.is(".selectable")) {return;}
						var _id = _head.attr("id")
							,_clickid = _target.is(".arrow-up") ? "ascending" : _target.is(".arrow-down") ? "descending" : "header"; 
						_self._trigger("clickheader",null,[_id,_clickid,_head]);
					});			
					__o.hidewidth === true && __col.addClass("dsp_none");
					if(__o.hcss){ __col.css(__o.hcss);} 
					else if(__o.css) {__col.css(__o.css);}
					if(__o.hclasses) {__col.addClass(__o.hclasses);}
					else if(__o.classes){__col.addClass(__o.classes);}
					__col.appendTo(_tr);				
				});
				$(".column.data:last",_tr).addClass("last");
			}
			,_formatter : function($row,$col,_opt, data,row) {
				var _type = _opt.type||"normal";
				switch(_type) {
				case "normal" : return data;break;
				case "isodate" :
					if (!data) {return;}
					var _date = typeof data === "string" && data ? data.isoToDate() : new Date()
						,tday = new Date()
						,istoday = tday.getDate() == _date.getDate() && tday.getMonth() == _date.getMonth() && tday.getFullYear() == _date.getFullYear()
						,_dateFormat = _opt.dateformat == "fullDateTime" ? istoday ? "today" : "beforeDayTime" :
									_opt.dateformat == "fullDate" ? istoday ? "today" : "beforeDay" : _opt.dateformat ; 
					return _date.format(_dateFormat);
					break;
				case "multilevel":
					var _ind = parseInt(row["@indent"],10)
						,_data = data
						,_level = this.options.level;
					
					if(_ind <= _level) {return data;}
					if(!isNaN(_ind)) {
						$col.addClass("rescol");
						_data = '<span class="multilevel" style="margin-left:'+ (20 * (_ind - 1) - (20 * _level)) +'px;" />' + _data;
					}
					return _data;
					break;
				case "date":break;
				case "userinfo":
					if(!data.trim()) {return;}
					if(!$ep.ui || !$ep.ui.makeUserInfo) {return data;}					
					$ep.ui.makeUserInfo($col,data,this.options.server,false,_opt.userinfo ? _opt.userinfo : null)
						.click(function(e) {e.stopPropagation();});
					return ;
					break;
				}
			}
			,_getPathData : function(data,path) {
				if(!path) {return data;}
				var _path = path.split(".")
					,_data = data;
				$.each(_path, function(idx,val) {
					if(!_data[val]) {return false;}
					_data = _data[val];
				});
				return _data;	
			}
			,_addData : function(o) {
				var _self = this
					,_colset = this.options.column
					,_data =  this.elements.data
					,_row = $('<tr class="viewlist-data-tr"/>') 
					,_rowdata = _self.options.datapath ? _self._getPathData(o,_self.options.datapath) : o;
				if(!_colset) { return;} 
				if(parseInt(_rowdata["@indent"],10) > 0) {_row.addClass("response");}
				_row.data("view-list-data",o);
				$.each(_colset, function(_idx,_o) {
					var __col = $('<td class="column data" id="'+ _idx + '"/>')
						,__opt = _o
						,__text = ""
					    ,__re = _idx == "selectable" ? _self._selectable(false,__col,typeof __opt === "string" ? (__opt = { type : _o }) : __opt)  : _self._formatter(_row,__col,__opt,_rowdata[_idx],o);
					    
					if(typeof __opt.render === "function") {
						__re = __opt.render(_row,__col,_rowdata,__opt,__re);
						if(__re === false) {return true;}
						if(__re !== undefined && __re !== true ) {__col.html(__re);__text = __col.text();}
					} else {
						if(typeof __re !== "undefined") {__col.html(__re);__text = __col.text();}				
					}
					__col.attr("title",__text);
					__opt.hidewidth === true && __col.addClass("dsp_none");
					if(__opt.css) {__col.css(__opt.css);}
					if(__opt.classes){ __col.addClass(__opt.classes);}
					if(__col) {__col.appendTo(_row);}
				});
				$(".column.data:first",_row).addClass("first");
				$(".column.data:last",_row).addClass("last");
				if(this._trigger("rowrender",null,[_row,_rowdata]) === false){ return; }
				_row.off("click").on("click", function(e) {
					if($(e.target).closest(".column.data").is(".selectable")) {return;}
					var __data = o;
					_self._trigger("click",e,[_row,$(e.target),__data]);	
				});
				_row.appendTo(_data);
			}
			,refreshHeaderByQuery : function(query) {
				var _head = this.elements.head
					,_sortcol = query ? query.sortcolumn : ""
					,_order = query ? query.sortorder :"";
					
				$(".sortable .ep-icon.on").removeClass("on").addClass("off");
				if(!_sortcol||!_order) {return;} 
				var _col = $("#"+_sortcol,_head).has(".sortable");
				if(_col.size() == 0) {return;}
				switch(_order) {
				case "ascending":
					$(".ep-icon.arrow-up",_col).removeClass("off").addClass("on");
					break;
				case "descending":
					$(".ep-icon.arrow-down",_col).removeClass("off").addClass("on");
					break;
				}
			}
			,addData : function(o) {
				var _self = this
					,_type = $.isArray(o) ? "array" : $.isFunction(o) ?  "function" : typeof o === "string" ? "" : "object";
				if(!_type) {return;}
				switch(_type) { 
				case "object":	if(!$.isEmptyObject(o)) {_self._addData(o);};break;
				case "array" :	$.each(o,function(idx,_o) {_self._addData(_o);});break;
				case "function":
					var _callback = function (_o) { return _self.addData(_o);};
					o.call(_self,_callback);
					break;
				}
			}
			,selectall : function(ischeck) {
				var _val = ischeck === false ? false : true;
				$(".viewlist-body .column.data.selectable input:checkbox",this.element).prop("checked",_val);
			}
			,getSelected : function() {
				var _r = []
					,_scop = this.options.column.selectable == "checkbox" ? "input:checkbox:checked" : this.options.column.selectable == "radio" ? "input:radio:checked" : ""; 
				if(!_scop) {return [];}
				$(".viewlist-body .viewlist-data-tr .column.data.selectable " + _scop,this.element).closest(".viewlist-data-tr").each(function() {
					_r.push({element : $(this), data : $(this).data("view-list-data")});	
				});
				return _r;
			}
			,clearData : function() {
				$(".viewlist-data-tr",this.widget()).remove();
				$(".errormessage",this.widget()).remove(); 
			}
			,errorShow : function(msg,cd) {
				this.clearData();
				$(this.elements.body)		
				.append($('<div class="errormessage" />').html('<P' + (cd ? ' class="' + cd + '"' : '') +'>' + msg+'</P>'));
			}
		});
	})();
	
	(function() {
		/*
		 *  - pageNavigator
		 */
		
		$.widget("ep.eppagenavigator", {
			version: "1.11.1"
			,options : {
				pageSize : 10  /* 네비게이션 페이지 수*/
				,page :0    /* 현재 페이지 */
				,maxPage : 0
				,hideTotal : false
				,total : "( Total: %s )"
				,title : {
					prev : "이전"
					,next : "다음"
					,prevpage : "이전페이지"
					,nextpage : "다음페이지"
				}
				,tag : {
					prev : " &lt; "
					,next : " &gt; "
					,prevpage : " &lt;&lt; "
					,nextpage : " &gt;&gt; "
				}
			}
			,_destroy: function() {
				this.widget().removeClass(this.widgetFullName).empty();
			} 
			,_create : function(){
				this.widget().addClass("ep-widget " + this.widgetFullName);
				if(this.options.maxPage == 0) {return;}
				if(this.options.page == 0) {return;}
				this._drawNavigator();
			}
			,_drawNavigator : function() {
				this.widget().empty();
				var _html = '<table cellpadding="0" cellspacing="0 border="0"><tbody><tr>';
				_html += this._prevpghtml();
				_html += this._prevhtml();
				_html += this._makePage(this._getStart(this.options.page));
				_html += this._nexthtml();
				_html += this._nextpghtml();
				_html += this._totalhtml();
				_html += '</tr></tbody></table>';
				this.widget().html(_html);
				this._bindEvent();
				
			}
			,_bindEvent : function() {
				var _self = this;
				$(".navigator", this.element)
				.off("click")
				.on("click", function(e) {
					e.preventDefault();
					e.stopPropagation();			
					var _cmd = $(e.target).attr("page");
					switch(_cmd) {
						case "prev":_self._prev();break;
						case "next":_self._next();break;
						case "prevpage":_self._prevPage();break;
						case "nextpage":_self._nextPage();break;
						case "total":return;break;
						default :_self.setPage(parseInt(_cmd,10));break;
					}
					_self._trigger("change",null,[_self.options.page]);
				});
			}
			,_getStart : function(page) {		
				var _page = page > this.options.maxPage ? this.options.maxPage : page;
				var _cp = (Math.ceil((_page ? _page : this.options.page) / this.options.pageSize) * this.options.pageSize) - this.options.pageSize + 1 ;
				return _cp;
			}
			//,_getLastPage : function() {return Math.ceil(this.options.maxPage / this.options.pageSize);}
			,_makePage : function(start) {
				var _html = "",i=0;
				while(true) {
					var _pg = (i + start);
					if(i >= this.options.pageSize) {break;}
					if(_pg > this.options.maxPage) {break;}
					_html += '<td class="navigator page' 
						+ (_pg == this.options.page ? ' selected' : '' ) 
						+ '" title="' + _pg 
						+ '" page="' + _pg + '">' 
						+ _pg + '</td>';
					i++;
				}
				return _html;
			}
			,_totalhtml : function() {
				if(this.options.hideTotal) {return "";}
				if(parseInt(this.options.maxPage,10) == 0) {return "";}
				return '<td class="navigator total" page="total">' + sprintf(this.options.total,parseInt(this.options.maxPage,10).toCurrency()) + '</td>';
			}
			,_prevhtml : function() {
				var _title = this.option("title.prev")
					,_html = '<td class="navigator prev"'+ (_title ? ' title="' + _title + '"' : '') + ' page="prev">' + this.option("tag.prev") + '</td>';
				return this._getStart() > 1 ? _html : ""; 
			}
			,_nexthtml : function() {
				var _title = this.option("title.next")
					,_html = '<td class="navigator next"'+ (_title ? ' title="' + _title + '"' : '') + ' page="next">' + this.option("tag.next") + '</td>';
				return this._getStart(this.options.maxPage) > this.options.page ? _html : "";
			}
			,_prevpghtml : function(){
				var _title = this.option("title.prevpage")
					,_html = '<td class="navigator prevpage"'+ (_title ? ' title="' + _title + '"' : '') + ' page="prevpage">' + this.option("tag.prevpage") + '</td>';
				return this._getStart() > 1 ? _html : "";
			}
			,_nextpghtml : function(){
				var _title = this.option("title.nextpage")
					,_html = '<td class="navigator nextpage"'+ (_title ? ' title="' + _title + '"' : '') + ' page="nextpage">' + this.option("tag.nextpage") + '</td>';
				return this._getStart(this.options.maxPage) > this.options.page ? _html : "";
			}
			,_setOption: function(key, value){
				if(key == "page") {	this.setPage(value);return;}
				if(key == "maxPage") {	this.setMaxPage(value);return;}
				$.Widget.prototype._setOption.apply(this, arguments);
			}
			,setPage : function(page) {
				if(parseInt(page,10) <= 0) { return; }
				this.options.page = parseInt(page,10);
				this._drawNavigator();		
			}
			,setMaxPage : function(page,isupdate) {
				//if(page <= 0) return;
				this.options.maxPage = page;
				if(isupdate === true) {this._drawNavigator();}		
			}
			,_prev : function() {
				var _page = this._getStart(this.options.page - this.options.pageSize);
				return this.setPage(_page < 1 ? 1 : _page); 
			}
			,_next : function() {
				var _page = this._getStart(this.options.page + this.options.pageSize);
				return this.setPage(_page < 1 ? 1 : _page); 
			}
			,_prevPage : function() {
				var _page = 1;
				return this.setPage(_page < 1 ? 1 : _page); 
			}
			,_nextPage : function() {
				var _page = this.options.maxPage;
				return this.setPage(_page < 1 ? 1 : _page);
			}
			
		});
	})();
	
	(function() {
		// Client 통신
		var awareness = new (function _awareness(data){
			this.data = data || {};
			this.curr_uid = '';
			this.unique_id = (new Date()).getTime().toString(16);
			this.req_queue = [];
			this.req_count = 0;
			this.req_id = 0;
			this.req_status_id = 0;
			this._started = false;
			this._req_loop_started = false;
			this.init = function(){
			};
			/* 연달아 여러명의 요청이 있을 수 있으므로 delay 500 줌. 한번에 처리 하기 위함 */
			this.reqStatus = function(id, callback){				
				var _self = this;
				_self.req_queue.push(id);
				if(_self.delay_req) _self.delay_req.clear();
				_self.delay_req = $ep.util.delay();
				_self.delay_req.run(function(){
					_self._reqStatus(callback);
				},500);
			};
			this._reqStatus = function(callback){
				var _self = this;
				if(_self._req_loop_started){
					_self.req_status_id++;
					return _self.getStatus(
							_self.unique_id,
							callback || _self.data.callback, _self.req_id, _self.req_status_id);
				}else{
					_self.req_id++;
					_self.start(callback, _self.req_id);
				}
			};
			this.reset = function(callback){
				var _self = this;
				_self.stop();
				_self.req_queue = [];
				_self.req_count = 0;
				$ep.util.cleanAwareness();
				$.each($ep.cache.awareness, function(_id, _obj){
					_self.req_queue.push(_id);
					_obj.localUpdateStatus({status:-1, ipt:14});
				})
//				console.log("reset", this.req_id, this.req_queue);
				this.start(callback, this.req_id);
			};
			this.stop = function(){
				this.req_id++;
				this._started = false;
				this._req_loop_started = false;
			};
			this.start = function(callback, req_id){
//				console.log("start", req_id);
				this._started = true;
				var _self = this;
				if(_self.req_id != req_id) return;
				if(this.delay_retry) this.delay_retry.clear();
				/*this.removeAll().then(
					function(){	// done
						return _self.getUID(callback);
					}
				)*/
				return _self.getUID(callback)
				.then(
					function(){
						if(_self.req_id == req_id){
							_self._req_loop_started = true;
							_self.req_status_id++;
							return _self.getStatus(
									_self.unique_id,
									callback || _self.data.callback, req_id, _self.req_status_id);
						}else{
							return $.Deferred().reject("req_id");
						}
					},
					function(){
//						console.log("start fail - ", req_id, arguments);
						// removeAll or getUID fail 재시도
						if(_self.delay_retry) _self.delay_retry.clear();
						if(_self.req_id == req_id){
							_self.delay_retry = $ep.util.delay();
							_self.delay_retry.run(function(){
								_self.start(callback, req_id);
							}, _self.data.repeattime);
						}
					}
				)
			};
			this.request = function _request(req, callback){
				var _self = this;
				return $.ajax({
					url:$ep._CONST.ABC.REQUESTURL,
					dataType:"jsonp",
					timeout:(req.subType == "getStatus"?_self.data.repeattime:1500),
					cache:false,
					async:true,
					data:req
				})
				.then(
					function(data, textStatus, xhr){
						// done
						var obj = {};
						try{
							obj = (typeof data == "object"?data:$.parseSJON(data));
						}catch(e){
							obj = data;
						}
						return obj;
					},
					function(xhr, textStatus, err){
					}
				);
			};
			this.removeAll = function _removeAll(callback){
				var _self = this;
				var req = {
					reqType:"typeAW",
					subType:"removeAll"
				};
				return _self.request(req, callback);
			};
			this.getUID = function _getUID(callback){
				var _self = this;
				var req = {
					reqType:"typeAW",
					subType:"getUID"
				};
				return _self.request(req, callback)
				.then(
					function(obj){
//						console.log("getUID - ", arguments);
						_self.curr_uid = obj.loginID[0].uid;
						$ep.util.abc.status = 1;
						$ep.util.abc.abc_login_user = obj.loginID[0].uid;
						$ep.util.abc.abc_login_id = obj.loginID[0].userid;
					},
					function(){
//						console.log("getUID fail - ", arguments);
						$ep.util.abc.status = 0;
						$ep.util.abc.abc_login_user = "";
						$ep.util.abc.abc_login_id = "";
					}
				);
			};
			this.getStatus = function(uniqueid, callback, req_id, req_status_id){
				var vids = [];
				for(var i = 0; i < 50; i++){
					if(this.req_queue.length == 0) break;
					vids.push(this.req_queue.shift().replace(/,/g, "/"));
				}
				this.req_count += vids.length;
				return this._getStatus(vids, uniqueid, callback, req_id, req_status_id);				
			};
			this._getStatus = function __getStatus(vids, uniqueid, callback, req_id, req_status_id){
//				console.log("req getStatus : ", req_id, req_status_id, uniqueid, "요청수 : ", vids.length, vids);
				var _self = this;
				var req = {
						reqType:"typeAW",
						subType:"getStatus",
						param0:uniqueid,
						param1:vids.join("|")
				};
				return this.request(req, callback)
				.then(function(data){
//					console.log("res getStatus : ", data);
					if(!data || !data.buddyState) {return data;}
					var _list = $ep.cache.awareness;
					$.each(data.buddyState, function(_idx,_data) {
						var _o = _list[_data.uid];
						if(!_o) {return;}
						_o.localUpdateStatus(_data);
					});
					return data;
				})
				.then(
					function(data){
						if(data && data.buddyCnt != null
								&& data.buddyCnt === 0){
//							console.log("response buddyCnt 불일치 : ", _self.req_count, data.buddyCnt);
							return $.Deferred().reject("nothing");
						}
						return data;
					},
					function(){
						// fail
//						console.log("getStatus 실패", arguments);
						return _self.getUID();
					}
				)
				.then(
					function(data){
						// getStatus, 또는 getStatus 실패 후 getUID 성공시
						// delaytime마다 다시 요청함.
						if(_self.req_id == req_id && _self.req_status_id == req_status_id){
							if(_self.delay_get_status) _self.delay_get_status.clear();						
							_self.delay_get_status = $ep.util.delay();
							_self.delay_get_status.run(function(){
//								console.log("delay_get_status run", req_id, req_status_id);
								_self.getStatus(uniqueid, callback, req_id, req_status_id);
							}, _self.data.delaytime);	
						}else{
//							console.log("req_status_id 불일치 종료",req_status_id, _self.req_status_id);
							return $.Deferred().reject("req_status_id");
						}
					},
					function(){
//						console.log("buddyCnt == 0, getStatus, getUID 실패");
						if(_self.req_status_id == req_status_id){
							_self.reset();
						}else{
//							console.log("req_status_id 불일치 종료",req_status_id, _self.req_status_id);
							return $.Deferred().reject("req_status_id");
						}
					}
				);
			}
		})(
			{
				interval:30000,
				repeattime:35000, 
				delaytime:1500,
				callback:null
			}
		);
		/*
		 * ep.epawareness
		 * 
		 */
		/*
		 * ABC AWARENESS : stproxy 사용안함.
		 if(typeof stproxy != "undefined" && !window.stproxy.uiControl.preferences.updateStore) {
			window.stproxy.uiControl.preferences.updateStore = function(){};
		}; 
		*/
		/* baseComps.js 오류  방어.... include.js 로드하면 불필요...*/
		function _stName(uid,info) {
			var _self = this
				,_stbind = []
				,_stHandler = null
				,_timer = 0
				,_info = info || {ipt : ""};
			this.id = uid;
			this.info = function(info) {info && $.extend(true,_info,info);return _info;};
			this.refCount = function() {return _stbind.length;};
			this.stproxy = {
				model : null
				,status : -1
				,statusMsg : ""
				,className : ""
				,isReady : false
				,isChat : false
			};
			/* ABC AWARENESS */
			this.awareness_type = {
					   AVAILABLE: 1,
					   AVAILABLE_MOBILE: 6,
					   AWAY: 2,
					   AWAY_MOBILE: 7,
					   DND: 3,
					   DND_MOBILE: 8,
					   IN_MEETING: 5,
					   IN_MEETING_MOBILE: 10,
					   NOT_USING: 4,
					   OFFLINE: 0,
					   UNKNOWN: -1
					};
			this.ipt = {
				status : 14,
				statusMsg : "",
				className : "tel_noStay"					
			};
			this.unusedtime = function() {
				return this.refCount() == 0 ? ((new Date().getTime() - _timer)/1000/60) : 0;
			};
			this.destroy = function(){
				/* ABC AWARENESS
				 * _stHandler && stproxy.hitch.disconnect(_stHandler);*/
				_self = null;				
				this.stproxy = null;
				this.ipt = null;
				$ep.cache.awareness[this.id] = null;
				delete $ep.cache.awareness[this.id];
			};
			this.abcStatus = function() {return $ep.util.abc.status;};
			this.abc = function() {return $ep.util.abc;};
			this.bindUpdate = function(parent,handler) {
				var _parent = parent,_handler = handler;
				var _src = {parent : _parent, event : _handler	};
				_stbind.push(_src);
				_timer = new Date().getTime();
			};
			this.unbindUpdate = function(handler) {
				_stbind = $.grep(_stbind,function(src) {return !(src.event == handler);});
				_timer = new Date().getTime();
			};
			this.phone = function(){
				//if(this.abcStatus() == 0) {_log("abc not ready");return;}
				//if(this.ipt.statusMsg !=  "available") {_log("abc not available");return;} //상태와 관계없이 전화
				if(!_info.ipt) {_log("empty phone number!!");return;}
				this.abc().phone(_info.ipt).fail(function() {_log("abc phone error!")});
				return;
			} ; 
			this.login = function() {
				/* ABC AWARENESS
				 * if(stproxy.isLoggedIn){_onLoggedIn();return;}
				stproxy.login.loginByToken(null, stproxy.awareness.AVAILABLE, null, _onLoggedIn, _loginFailed);*/
				//stproxy.login.loginAsAnonWithToken(null, stproxy.awareness.AVAILABLE, null, _onLoggedIn, _loginFailed);
				//stproxy.login.loginAsAnon(null, stproxy.awareness.AVAILABLE, null, _onLoggedIn, _loginFailed);
				
			};
			this.update = function(){
				/* ABC AWARENESS
				 * if(!_self.stproxy.model) {return;}
				_stChangeStatus(_self.stproxy.model.status,_self.ipt.status);*/
				_stChangeStatus.call(_self, _self.stproxy.status, _self.ipt.status);
			};
			this.iptUpdateStatus = function(s) {		
				return;
				/*if(this.ipt.status == s) {return;}				
				this.ipt.status = s;				
				_iptChangeStatus.call(this);*/
			};
			
			this.chat = function() {
				var _sts = this.stproxy.status
					,/* ABC AWARENESS
					_aware = stproxy.awareness*/
					_aware = this.awareness_type;
				
				if(_sts == _aware.UNKNOWN 	|| _sts == _aware.OFFLINE ||
					_sts ==  _aware.DND		|| _sts ==  _aware.NOT_USING ||
					_sts == _aware.IN_MEETING || _sts == _aware.IN_MEETING_MOBILE) {
					_log("not available");
					return;
				}
				this.abc().chat(this.id)
				.fail(function() {
					/* ABC AWARENESS
					 * stproxy && stproxy.openChat(_self.stproxy.model.id);*/ 						
				});
				return;
			};
			/* ABC AWARENESS */
			this.localUpdateStatus = function(res){
				var _st = res.status;
				var _ipt = res.ipt;
				_stChangeStatus.call(this, _st, _ipt);
			}
			
			function _triggerUpdate(){$.each(_stbind, function(idx,bind) {bind.event.apply(bind.parent,[_self]);});};
			function _stChangeStatus(st,ipt) {
				/* ABC AWARENESS
				 * var _aware = stproxy.awareness, _st = _self.stproxy,_ipt = _self.ipt;*/
				var _aware = this.awareness_type,
				_st = _self.stproxy,_ipt = _self.ipt;
				//if(_st.status == st && _ipt.status == ipt ) {return;}
				_st.status = st;
				_ipt.status = ipt;
				switch(_st.status) {
				/*  ABC AWARENESS
				 * 	case _aware.UNKNOWN				: _st.statusMsg = "unknown"; _st.className = "pc_offLine";break; 			//-1
					case _aware.OFFLINE				: _st.statusMsg = "offline";_st.className = "pc_offLine"; break;			//0
					case _aware.AVAILABLE			: _st.statusMsg = "available";_st.className = "pc_onLine";break;			//1
					case _aware.AWAY				: _st.statusMsg = "away"; _st.className = "pc_noStay";break;				//2
					case _aware.DND					: _st.statusMsg = "dnd"; _st.className = "pc_noRecive";break;				//3
					case _aware.NOT_USING			: _st.statusMsg = "unknown"; _st.className = "pc_offLine";break; 			//4
					case _aware.IN_MEETING			: _st.statusMsg = "inmetting"; _st.className = "pc_meeting";break;			//5
					case _aware.AVAILABLE_MOBILE	: _st.statusMsg = "availablemobile"; _st.className = "mobile_online";break;	//6
					case _aware.AWAY_MOBILE			: _st.statusMsg = "awaymobile"; _st.className = "mobile_noStay";break;		//7
					case _aware.DND_MOBILE			: _st.statusMsg = "dndmobile"; _st.className = "mobile_noRecive";break;		//8
					case _aware.IN_MEETING_MOBILE	: _st.statusMsg = "inmeetingmobile"; _st.className = "mobile_meting";break; //10*/
				case 0 : _st.statusMsg = "offline"; _st.className = "pc_offLine";break;
				case 1 : _st.statusMsg = "available"; _st.className = "pc_onLine";break;
				case 2 : _st.statusMsg = "away"; _st.className = "pc_noStay";break;
				case 3 : _st.statusMsg = "dnd"; _st.className = "pc_noRecive";break;
				case 8 : _st.statusMsg = "inmetting"; _st.className = "pc_meeting";break;
				case 544 : _st.statusMsg = "availablemobile"; _st.className = "mobile_online";break;
				case 608 : _st.statusMsg = "awaymobile"; _st.className = "mobile_noStay";break;
				case 640 : _st.statusMsg = "dndmobile"; _st.className = "mobile_noRecive";break;
				case 520 : _st.statusMsg = "inmeetingmobile"; _st.className = "mobile_meting";break;
				default : _st.statusMsg = "unknown"; _st.className = "pc_offLine";break;
				};
				switch(_ipt.status) {
					/* ABC AWARENESS
					 * case 0 							: _ipt.statusMsg = "available";_ipt.className = "tel_callPossible"; break;		
					case 7 							: _ipt.statusMsg = "busy";_ipt.className = "tel_calling"; break;
					case 14 						: _ipt.statusMsg = "unknown";_ipt.className = "tel_noStay"; break;					
					case 21 						: _ipt.statusMsg = "incoming";_ipt.className = "tel_receipt"; break;*/
				case 0 : _ipt.statusMsg = "busy";_ipt.className = "tel_calling"; break;
				case 7 : _ipt.statusMsg = "available";_ipt.className = "tel_callPossible"; break;
				case 14 : _ipt.statusMsg = "unknown";_ipt.className = "tel_noStay"; break;
				case 21 : _ipt.statusMsg = "incoming";_ipt.className = "tel_receipt"; break;
				}
				_triggerUpdate();
			};
			
			function _onLoggedIn() {
				/* ABC AWARENESS TODO model ?
				 * _self.stproxy.model = stproxy.getLiveNameModel(_self.id,{"isInBuddyList":false, "forceWatchlist" : false });
				_stHandler = stproxy.hitch.connect(_self.stproxy.model, "onUpdate", stproxy.hitch.bind(_self,_stOnUpdate));*/	
				//_stOnUpdate(_self.stproxy.model);
			};
			function _stOnUpdate(resp) {
				var _sts = resp.status,_ipts = _self.ipt.status;	
				_self.stproxy.isReady = true;				
				if(resp.statusMessage) {
					var _res = null;
					if((_res = resp.statusMessage.match(/[\x0d]([0-2])/g)) !== null) {
						var _i = parseInt(_res[0],10);
						_ipts = (_i == 0 ? 7 : _i == 1 ? 0 : _i == 2 ? 21 : 14);
					};
				}			
				_stChangeStatus.call(_self,_sts,_ipts);
			};
			function _loginFailed() {
				_log("loginFailed")
			};
			_timer = new Date().getTime();
			this.login();
			/* ABC AWARENESS */
			awareness.reqStatus(this.id);
			return;
		};
		function _getAwareness(uid,info) {
			var _aw;
			/* ABC AWARENESS
			 * if(typeof stproxy === "undefined") {return null;}*/
			$ep.util.cleanAwareness();
			if($ep.cache.awareness[uid]) { _aw = $ep.cache.awareness[uid];info && _aw.info(info);return _aw;}			
			return $ep.cache.awareness[uid] = new _stName(uid,info);				
		};
		
		$.widget("ep.epawareness", {
			version: "1.11.1"
			,options : {
				id : ""
				,message : {
					mail : "Send mail"
					,status : {
						offline 			: "Offline",
						available 			: "Available",
						away 				: "Away",
						dnd 				: "Do Not Disturb",
						inmetting			: "Meeting",
						availablemobile		: "Available(Mobile)",
						awaymobile			: "Away(Mobile)",
						dndmobile			: "Do Not Disturb(Mobile)",
						inmeetingmobile		: "Meeting(Mobile)",
						unknown 			: "Unknown"
					}					
					,iptstatus : {
						available 			: "Available",
						busy 				: "Busy",
						incoming 			: "Incoming",
						unknown 			: "Unknown"
					}
				}
				,server : ""			//master host 
				,mail : function(){}
				,sametime : function(){}
				,iptel : function(){} //return true cancel
				,info : {ipt : ""}
			}
			,listener : null
			,elements : {
				mail : null,
				sametime : null,
				iptel : null
			}
			,_create : function() {
				this.elements = {};
				this.listener = null;
				this.widget().addClass("ep-widget " + this.widgetFullName);
				this.options.classes && this.widget().addClass(this.options.classes); 
				!this.options.id && this.widget().attr("uid") && (this.options.id = this.widget().attr("uid"));
				
				!this.options.info["ipt"] && this.widget().attr("ipt")  && (this.options.info["ipt"] = this.widget().attr("ipt"));
				
			}
			,_init : function() {
				this._initSTProxy();
			}
			,_initSTProxy : function(){
				var _self = this;
				this.options.id && (this.options.id = this.options.id.replace(/\//g,","));
				this.options.id && (this.listener = _getAwareness(this.options.id,this.options.info));
				this.elements.mail = this.widget().hasClass("awareness_mail") ? $(".awareness_mail").removeAttr("class").addClass("icon mailC") : $('<span class="awareness_mail icon mailC" />').appendTo(this.widget());
				this.elements.mail.attr("title",this.options.message.mail);
				this.options.hidemail === true && this.elements.mail.hide();
				this.elements.sametime = this.widget().hasClass("awareness_sametime") ? $(".awareness_sametime").removeAttr("class").addClass("icon pc_offLine") : $('<span class="awareness_sametime icon pc_offLine" />').appendTo(this.widget()); 
				this.options.hidesametime === true && this.elements.sametime.hide();
				this.elements.iptel = this.widget().hasClass("awareness_iptel") ? $(".awareness_iptel").removeAttr("class").addClass("icon tel_noStay") : $('<span class="awareness_iptel icon tel_noStay" />').appendTo(this.widget());
				this.options.hideiptel === true && this.elements.iptel.hide();
				if(this.listener) {	this.listener.bindUpdate(this,this._bindSTUpdate = function(stx) { this.updateStatus(stx)});	}
				this.elements.mail.size() > 0 && this.elements.mail.off("click").on("click", function(e) {
					e.stopPropagation();
					if( _self._trigger("mail") === false) {	return;	};
					$.winOpen((_self.options.server ? "/" + _self.options.server : "") + $ep._CONST.PATH.LIB + "/redirect_mail?readform&action=newmail&id=" + _self.options.id.replace(/\,/g,"/"));
				});
				this.elements.sametime.size() > 0 && this.elements.sametime.off("click").on("click", function(e) {
					e.stopPropagation();
					if(_self._trigger("sametime") === false) {	return;	};
					_self.listener && _self.listener.chat();}) ;
				this.elements.iptel.size() > 0 && this.elements.iptel.off("click").on("click", function(e){
					e.stopPropagation();
					if(_self._trigger("iptel") === false) {	return;	};
					_self.listener && _self.listener.phone();});
				this.listener && this.listener.update();
			}
			,updateStatus : function(x) {
				var className = x.stproxy.className;
				this.elements.sametime.removeClass(function(idx,cls) {
					return cls.replace(/(\W|^)icon(\W|$)/g," ").replace(/(\W|^)awareness_\w+(\W|$)/g,"").trim();
				}).addClass(className)
				.attr("title",this.options.message.status[x.stproxy.statusMsg]);
				
				//if(x.ipt.status == 14) {return;}
				className = x.ipt.className;
				this.elements.iptel.removeClass(function(idx,cls) {
					return cls.replace(/(\W|^)icon(\W|$)/g," ").replace(/(\W|^)awareness_\w+(\W|$)/g,"").trim();
				}).addClass(className)
				.attr("title",this.options.message.iptstatus[x.ipt.statusMsg]);
			}
			,destroy : function(){
				this._super('destroy');	
				this.listener && this.listener.unbindUpdate(this._bindSTUpdate);
			}
		});
	})();
	
	(function() {
		/*
		 *  - button
		 */
		
		$.widget("ep.epbutton", {
			version: "1.11.1"
			,locked : false
			,options : {
				//id: ""
				dblock : 300
				,defshow :true
				/*text : "dddd"
				 ,css:
				 ,classes :
				 ,highlight : true
				 ,dblock : 1000
				 ,click : function(e) {
					_log("click");
				 }
				,lockclick : function(e,unlock) {
					_log("lockClick");
				}
				,hook : {
					click : function(){
					
					}
				}
				*/
			}
			,_destroy: function() {
				this.widget().qtip("destroy",true);
				this.widget().off("showbutton hidebutton click").empty();		
			} 
			,_create : function() {
				var _self = this,_ele = this.widget();
				_ele.addClass("ep-widget " + _self.widgetFullName);
				if(typeof this.options.show === "undefined") {this.options.show = this.options.defshow;} 
				this.options.classes && _ele.addClass(this.options.classes);
				this.options.highlight === true && _ele.addClass("highlight");
				this.options.css && _ele.css(this.options.css); 
				this.options.show !== true && _ele.removeClass("show") && _ele.addClass("hide");
				this.options.show == true && _ele.removeClass("hide") && _ele.addClass("show");
				this.options.id && _ele.attr("id",this.options.id);
				if(!this.options.id && _ele.attr("id")) {this.options.id = _ele.attr("id");}
				 
				_self._makebutton();
				_self._bindbutton();
				_self._makesecondary();
				this.widget().on("showbutton", function(e,btns) {$.each(btns, function(idx,val){_self.show(val);});	});
				this.widget().on("hidebutton", function(e,btns) {$.each(btns, function(idx,val){_self.hide(val);});	});
			}
			,_makebutton : function() {		
				this.buttonElement = $('<span class="epbutton">'+ (this.options.text||"button" ) + '</span>').appendTo(this.widget());
				!$.isEmptyObject(this.options.children) && this.buttonElement.addClass("haschildren");
				this.options.children && $('<span class="secondary ep-icon"></span>').appendTo(this.widget());
			} 
			,_bindbutton : function() {
				var _self = this
					,_target = _self.buttonElement.hasClass("haschildren") ? _self.buttonElement : _self.widget();
					
				$(_target).on("click",function(e) {
					var _id = _self.options.bindchild ? _self.options.id + "." + _self.options.bindchild : _self.options.id;
					_self._click(e,_id);
				});
			}
			,_getButton : function(id,ele) {
				var _ids = id ? id.split(".") : [];
				return _ids.length > 1 ? this.options.children[_ids[1]] : this.options;
			}
			,_click : function(e,id) {
				var _self = this
				   ,_btn = this._getButton(id,$(e.target).closest(".ep-epbutton"));
				
				if(_btn.lockclick) { return _self._lockclick(e,id);}
				if(this.locked) {return;}
				this.options.dblock && (this.locked = true);
				this.options.dblock && setTimeout(function() {	_self.locked = false;},this.options.dblock);
				if(this.options.hook) {
					if ($.isFunction(this.options.hook["click"])) {
						this.options.hook.click.apply(this.widget(),[e,id,_btn]);
						return;
					} 
				} 
				return _btn.click ? _btn.click.apply(_self.widget(),[e,id,_btn]) : undefined;
				
			}
			
			,_lockclick : function(e,id) {
				var _self = this
					,_btn = _self._getButton(id,$(e.target).closest(".ep-epbutton"));
		
				if(this.alreadyClicked || this.locked) {_log("locked");return;}
				this.locked = true;
				if(this.options.hook) {
					if ($.isFunction(this.options.hook["click"])) {
						return this.options.hook.lockclick.apply(this.widget(),[e,id,_btn,function() {_self.unlock();}]);
					} 
				} 
				return _btn.lockclick ? _btn.lockclick.apply(_self.widget(),[e,id,_btn,function() {_self.unlock();}]) : undefined;
			}
			,_makeQtip : function() {
				var _self = this
					,_opt = _self.options
					,target = _self.widget();
				
				var _keep = null;
				
				$(target).qtip({
					overwrite: true
					,content : function(e,api) {
						var _$qtip = $(this)
							,_api = api
							,_wrap = $('<div class="epbutton"><ul class="epbutton-item" /></div>')
							,_ul = _wrap.find(".epbutton-item")
							,_fixed = [];
						_api.tooltip.css("min-width",_$qtip.outerWidth() - 2);
						
						$.each(_opt.children,function(idx,val) {
							if(val.fixed == true) {_fixed.push($.extend(true,{id : idx},val));return true;}
							if(val.show !== true) {return true;}
							
							$('<li class="epbutton-item" id="'+ _self.options.id + '.' + idx + '">'
							+ '<span title="'+ val.text + '">' + val.text + '</span></li>')
							.appendTo(_ul)
							.click(function(e){
								var _val = val
								   ,_id = $(e.target).closest("li").attr("id");
								_self._click(e,_id);
							});
						});
						_ul =  $('<ul class="epbutton-item fixed" />').appendTo(_wrap);
						$.each(_fixed,function(idx,val) {
							if(val.show !== true) {return true;}
							$('<li class="epbutton-item" id="'+ _self.options.id + '.' + val.id + '">'
								+ '<span title="'+ val.text + '">' + val.text + '</span></li>')
									.appendTo(_ul)
									.click(function(e){
										var _val = val
										   ,_id = $(e.target).closest("li").attr("id");
										_self._click(e,_id);
									}
							);
						});
						
						return _wrap;
					}
					,position: $.extend({at : 'bottom left',my : 'top left',adjust : { method: "shift flip" ,x : 0 ,y : 0,screen:true }, viewport: true},_self.options.position) 
					,hide : {	event : "unfocus mouseleave click" // 
								,target : !(_opt.bindchild||_opt.click||_opt.lockclick) ? target : $(".secondary",target)
								,delay : 200,fixed:true,effect : true}
					,show: {delay : 50, event: 'click',target : !(_opt.bindchild||_opt.click||_opt.lockclick) ? target : $(".secondary",target), solo: true, effect : true} 
					,style : {tip : false	,classes : _self.widgetFullName + "-qtip"}
					,events : {
						show : function(e,api) {
							var _show = _self.children > 0;
							if(_show && $ep.util.browser.msie){
								_keep && _keep.clear() && (_keep = null);
								_keep = $ep.util.keepObject();
								_keep.hide();
							}
							return _show;
						}
						,hide : function(e,api) {
							_keep && _keep.show();
							//api.destroy(true);
						}
					}
				});
			}
			,_makesecondary : function(){
				if(!this.options.children) {return;}
				var _self = this;
				this._updateChild();
				//if(this.children == 0) {_self.hide();return;}
				this._makeQtip(/*this.options.children*/);
				
			}
			,_updateChild : function(){
				var _self = this;
				this.children = (function(){
					var _cnt = 0;
					$.each(_self.options.children, function(idx,val){
						if(typeof val.show  === "undefined") {val.show = _self.options.defshow;}
						val.show == true && (_cnt++);
					});			
					return _cnt;
				})();		
			}
			,hide : function(key) {
				var _self = this;
				if(!key) {this.widget().removeClass("show").addClass("hide");this.options.show = false;return;}
				var _key = key.split(".");
				if(_key[0] !== this.options.id) {return;}
				if(_key.length == 1 ) {	_self.hide();return;}
				if(!_self.options.children) {return;}
				if(!_self.options.children[_key[1]]) {return;}
				_self.options.children[_key[1]].show = false;
				_self._updateChild();
				this.children == 0 && this.hide(); 
			}
			,show : function(key) {
				var _self = this;
				if(!key) {this.widget().removeClass("hide").addClass("show");this.options.show = true;return;}
				var _key = key.split(".");
				if(_key[0] !== this.options.id) {return;}
				if(_key.length >= 1 ) {	_self.show();}
				if(_key.length == 1) {return;}
				if(!_self.options.children) {return;}
				if(!_self.options.children[_key[1]]) {return;}
				_self.options.children[_key[1]].show = true;		
				_self._updateChild();
				this.children == 1 && this.show();
			}
			,disable : function(){this.widget().prop("disabled",true);}
			,enable : function() {this.widget().prop("disabled",false);}
			,unlock : function() {	this.locked = false;}
		});
	})();
	(function() {
		/*
		 *  - `
		 *  - dependecy
		 *    $ep.ui
		 */
		if(!$.ui) {return;} 
		$.widget("ep.epdialog",$.ui.dialog, {
			options : {
				modal : true
				,iframe : false
				,resizable: false
				,content : {}
				//,script : $ep
				,lang : {
					script : typeof $ep !== "undefined" ?  $ep : null
					,prefix : ""
				}
				,complete : function() {
					//_log("dialog","complete");
				}
			}
			//,active : null
			,content : null
			,_create : function() {
				if(this.options.lang.script) {this.options.lang.script.LangConvertObject(this.options,"title,text");}
				this._super('_create');
				this.content = $(this.element);
				this.widget().addClass("ep-widget " + this.widgetFullName);
				this._content();
				//this._super("_position");
			}
			,_content : function(){
				var _self = this
					,_opt = _self.options
					,_curi = _opt.content ? _opt.content.url ? $.CURI(_opt.content.url) : typeof _opt.content == "string" ? $.CURI(_opt.content) : null  : null;

				try {
						if (top.mailserver != undefined || top.LINKURL != undefined) {
							if (top.LINKURL != "" || top.mailserver != "") {
								_opt.position.at = "top";
							}	
						}
				} catch (e) {}				
					
				_curi && _curi.setArgv({dialogid : _opt.dialogid});
				if(_opt.iframe !== true && _curi) {			
					var _wuri = $.CURI();
					 if(_wuri.host().toLowerCase() != _curi.host().toLowerCase()) {_opt.iframe = true;}
				}
				
				if(_opt.iframe === true) {
					$(_self.content).css("overflow","hidden");
					_self.content = $('<iframe src="'+ (_curi ? _curi.url : "about:blank") + '" frameborder="0" style="display:inline-block;height:100%;width:100%;" />')
						.load(function() {
							_opt.content.html && $(this).contents().find("body").html(_opt.content.html) ;
							_self._trigger("complete");
						})
						.appendTo(_self.content);
					return;
				}
				$ep && $ep.ui && ((_self.options.active = $ep.ui.activeId()) && $ep.ui.active(_self.options.dialogid));
				if(!_curi && _opt.content.html){
					$(_self.content).html(_opt.content.html);
				}
				if(!_curi) {_self._trigger("complete");return;}
				var _lang = _opt.lang; 
				if(_lang.langpack && _lang.prefix) {
					$ep.ui.loadPageLangPack(_self.content,_curi.url,_lang.langpack,_lang.prefix).done(function() {_self._trigger("complete");});;
				} else {
					$ep.ui.loadPageLang(_self.content,_curi.url,_lang.script||$ep).done(function() {_self._trigger("complete");});;
				}
				
			}
			,_createOverlay: function() {
				if ( !this.options.modal ) {
					return;
				}
				/* allowtransparency="true" 제거함 IE8에서 하단 Object 표시됨.*/
				this.overlayIframe = $('<iframe src="about:blank" class="ui-widget-overlay-iframe" frameborder="0" style="z-index:99;"/>' )
					.appendTo( this._appendTo() ); 
				this._super('_createOverlay');
				
			}
			,close : function(e) {
				var _before = this.options.beforeClose;
				if ( !this._isOpen || this._trigger( "beforeClose", e ) === false ) {	return;	}
				this.overlayIframe && this.overlayIframe.size() > 0 && this.overlayIframe.remove();
				this.options.beforeClose = null;	
				this._super('close');
				this.options.beforeClose = _before;
				this.options.active && ($ep && $ep.ui && $ep.ui.active(this.options.active));
				this.destroy();
			}
			,destroy : function() {
				$(this.element).empty(); 
				this._super('destroy');
				//this.active = null; 
				$(this.element).remove();
			}
		});
	})();
	
	(function() {
		/*
		 * epsideMenu
		 */
		$.widget("ep.epSideMenu", {
			version: "1.11.1"
			,options : {
				speed : 150
				,mode : "multi"
				
		/*		title : "UI 공통 설계"
				,mode : "single"
				,speed : 150
				,positionTop : 87px
				,positionBottom : 0px
				,button : {
					
				}
				,items : [
				   { text : function(){return "function Menu 1";}
				   	  ,isopen : true
					  ,items : {
						   test : {
							   text : function(e) { e.html("innerHTML");}
							   ,isactive : true					   
						   }
					   }
				   }          
				   ,{ 
					   text : " Menu 2"
					   ,isopen : true 
					   ,items : [
					      { text : "Menu2-1" , classes : "menu21"
					    	, click : function(e,ele) {
					    		_log("--",arguments);
					      	} 
					      }
					      ,{ text : "Menu2-2" } 
					      ,{ text : "Menu2-3" ,items : [ {text : "Menu2-3-1"} ]} 
					   ] 
				   }
				   ,{  
					   text : " Menu 3"
					   ,href : "http://me.amorepacific.com/ngw/comm/prototype.nsf/viewpage?readform&alias=view01"
				   }		   
				]*/
			}
			,dataKey : function() {return this.widgetName +".data";}
			,elements : {
				wrap : null
				,top : null
				,title : null
			}
			,_create : function() {
				this.widget().addClass("ep-widget " + this.widgetFullName);
				this.elements.wrap = this.widget().wrapInner('<div class="side-wrap" />').children(":first").disableSelection();
				this.elements.top = $(this.elements.wrap).has('ul').size() > 0  ? $("ul:first",this.elements.wrap).addClass("side-ul") : $('<ul class="side-ul" />').appendTo(this.elements.wrap);
				this.elements.items = $(".side-ul.menu-wrapper",this.elements.wrap).size() > 0 ? $(".side-ul.menu-wrapper",this.elements.wrap) : $('<ul class="side-ul menu-wrapper" />').appendTo(this.elements.wrap);
				(typeof this.options.positionTop !== "undefined") && this.elements.items.css("top",this.options.positionTop) ; 
				(typeof this.options.positionBottom !== "undefined") && this.elements.items.css("bottom",this.options.positionBottom) ;
				this._draw();
			}
			,_closeAll : function(e,parent) {
				var _self = this;
				$(parent).children("li.open").each(function() {
					var _t = $(this);
					$("ul.side-ul:first",_t).slideToggle({ 
						duration : _self.options.speed
						,start : function() {return _self._eventTrigger("close",e,_t);}
						,complete : function() {
							$(_t).removeClass("open");
							$(this).css("display","");
						}
					});
				});
			}
			,_eventTrigger : function(ev,e,ele) { /*"click",e,ele,...*/
				var _o = $(ele).data(this.dataKey());
				if(!$(ele).hasClass("haschild")) {
					switch(ev) {
					case "click":
						$("li.active",this.widget()).removeClass("active");
						$(ele).addClass("active");
						break;
					}
				}
				/*evt,event,ele,object,....*/
				if($.isFunction(this.options.eventListener)) {
					return this.options.eventListener.apply(this.element,[ev,e,ele,_o].concat(Array.prototype.slice.call(arguments,3)));}
				switch(ev) {
				default: return _o && _o[ev] && _o[ev].apply(this.widget(),[e,ele,_o].concat(Array.prototype.slice.call(arguments,3)));break;
				}
			}
			,_toggleMenu : function(e,element) {
				var _self = this
					,_li = element;
		
				$("ul.side-ul:first",_li).slideToggle({
					duration : _self.options.speed
					,start : function(){
						return _li.hasClass("open") ? _self._eventTrigger.call(_self,"close",e,_li) :  _self._eventTrigger.call(_self,"open",e,_li) ;
					}
					,complete : function() {
						if(_li.hasClass("open")) {
							_li.removeClass("open");				
						} else {
							if(_self.options.mode == "single") { _self._closeAll(e,_li.closest("ul"));}
							_li.addClass("open");
						}
						$(this).css("display","");
					}
				});
			}
			,_draw : function() {
				var _self = this;
				this._drawTitle(); 
				this._drawButton();
				
				this._drawMenu(this.elements.items,this.options.items,0);
				$('li.item > span',this.widget()).click(function(e) {
					var _li = $(this).closest("li.item");
					_li.hasClass("haschild") && _self._toggleMenu(e,_li);
					_self._eventTrigger("click",e,_li);
				});
			}
			,_drawTitle : function(){
				var _opt = this.options
					,_$title = $("li.title",this.elements.top);
				
				if(!_opt.title) {return;}
				var _$title = _$title.size() > 0 ? $("li.title",this.elements.top) : $('<li class="side-li title" />').prependTo(this.elements.top);
				this.elements.title = _$title;
				switch(typeof _opt.title) {
					case "string":	_$title.html(_opt.title);break;
					case "function":_$title.html(_opt.title.apply(this,_$title));break;
				}
				_$title.wrapInner('<span class="side-item item-label" />');
				return;
			}
			,_drawButton : function(){
				var _opt = this.options;
				if(!_opt.button) {
					!(_opt["positionTop"]) && this.elements.items.css({"top": "87px"});
					return;}
				var _$b = $('li.side-li.button',this.elements.top);
				_$b = _$b.size() > 0 ? _$b :$('<li class="side-li button" />').insertAfter(this.elements.title || this.elements.top);
				var _$button = this.elements.button = $('<span class="side-button" />').appendTo(_$b.empty());
				var _$tr = $("<table><tbody><tr /></tbody></table>").appendTo(_$button).find("tr");
				
				$.each(_opt.button, function(idx,o){
					var _$td = $('<td></td>').appendTo(_$tr);
					if (o.width && _$td.css({width : o.width})) {delete o.width;}
					$('<span id="' + ($.isNumeric(idx) ? "side" + idx : idx) + '" />').appendTo(_$td).epbutton(o);
					
				});
				
			}
			,_drawMenu : function(parent,items,depth) {
				var _self = this
					,_items = items
					,_parent = parent;
				if(!_items) {return;}
				$.each(_items, function(idx,v) {
					var _$item = $('<li class="side-li item" />').appendTo(_parent)
						,_$label = $(v.tag ? v.tag : '<span class="side-item item-label" />').appendTo(_$item);
					_$item.data(_self.dataKey(),v);
					var _$data = v.text ? $.isFunction(v.text) ? v.text.apply(_self,[_$label]) : v.text : "";
					_$data instanceof jQuery ? _$label.append(_$data) :  _$label.html(_$data);			
					//v.href && _$item.attr("href",$.isFunction(v.href) ? v.href.call(_self,_$item) : v.href);
					v.classes && _$item.addClass(v.classes);
					v.isactive === true && _$item.addClass("active");
					v.ishide === true && _$item.hide();
					if(v.items) {
						_$item.addClass("haschild");
						v.isopen === true && _$item.addClass("open");
						//v.isactive === true && _$item.addClass("active");
						$('<span class="side-item holder" />').appendTo(_$item);
						_$item.wrapInner('<span class="side-item item-wrap" />');
						var __$item = $('<ul class="side-ul depth' + (depth+1)  + '" />').appendTo(_$item);
						_self._drawMenu(__$item,v.items,depth+1);
					}
					//$.isFunction(v.click) && _$item.click(function() {v.click.apply(_self,[_$item]);});  
				});		
			}
			,destroy: function() {
				this._super("destroy");
			} 
		});
	})();
	
	(function() {
		if(!$.ui) {return;}
		if(!$.ui.fancytree) {return;} 
		$.widget("ep.eptree",$.ui.fancytree, {
			_create : function() {
				this._super("_create"); 
				this.tree._triggerNodeEvent = function(type, node, originalEvent, extra) {
					//this.debug("_trigger(" + type + "): '" + ctx.node.title + "'", ctx);
					//_log("tree NodeEvent",type,originalEvent);
					var ctx = this._makeHookContext(node, originalEvent, extra),
						res = this.widget.options.hooking ? this.widget.options.hooking.apply(this.widget.element, [type,originalEvent,ctx]) : this.widget._trigger(type, originalEvent, ctx);
					if(res !== false && ctx.result !== undefined){
						return ctx.result;
					}
					return res;			
				};
				/* _trigger a widget event with additional tree data. */
				this.tree._triggerTreeEvent = function(type, originalEvent) {
		//			this.debug("_trigger(" + type + ")", ctx);
		//			_log("tree TreeEvent",type,originalEvent);
					var ctx = this._makeHookContext(this, originalEvent),
						res = this.widget._trigger(type, originalEvent, ctx);
		
					if(res !== false && ctx.result !== undefined){
						return ctx.result;
					}
					return res;
				};
			}
		});
		$.ui.fancytree.registerExtension({
			name: "mail.extension",
			version: "0.2.0",
		/*	options : {
				source : [
				   {title : "수신(0)",key : "to"	,type : "mailroot", 	folder : true}
				  ,{title : "참조(0)",key : "cc"	,type : "mailroot", 	folder : true}
				  ,{title : "비밀(0)",key : "bcc"	,type : "mailroot", 	folder : true}
				]
				,renderNode : function(e,ctx) {
					var node = ctx.node
						,_title = node.title;
					if(!node.isFolder()) {return;}
					if(node.isFolder() && node.children) {
						var _count = node.children.length;
						_title = _title.replace(/(^.*)\([0-9]+\)/g,"$1("+_count+")");
						node.setTitle(_title);
					}
				}
			},*/
			treeInit: function(ctx){
				var tree = ctx.tree;
				//$.extend(this.options, this.options["mail.extension"]);
				//this.options.renderNode = this.options["mail.extension"].renderNode;
				this._super(ctx);		
			},
			// Default options for this extension.
			treeRegisterNode : function(ctx, add, node) {
				if(node.isFolder()) {return;}
				this.options.dataRender && this.options.dataRender.call(this,ctx,add,node); 
				this._super(ctx);
			}
			/*,nodeRender: function(ctx) {
				var node = ctx.node,
					_title = node.title;
				this._super(ctx);
				_log("nodeRender",ctx);		
				
			}*/
		});
	})();
	(function() {
		if(!$.ui) {return;} 
		$.widget("ep.eptabs", $.ui.tabs, { 
			tabselect : function(index) {
				var self = this;//, $e = $(self.element),o = this.options;
				self._activate(index);
				return;
			}
			,getActivePanel : function() {
				var self = this//, $e = $(self.element),o = this.options
				,_panel = self.panels.filter( ".ui-tabs-panel[aria-hidden=false]" );
				return _panel;
			}
			,getPanel : function(tabid) {return this.panels.filter("#"+"tabid");}
		});	
	})();
	
	(function() {
		"use strict";
		/*
		 * ep.epgrid
		 * - options
		 * 		draggable :
		 * 		isduplicate : 중복 처리
		 * 		keycode : 
		 * 		reverse :
		 * 		numbering :	Object	N	순번 표시 - true 이거나 Object 선언이 되면 순번 표시 
		 *			- start	String	N	시작 지점을 순번 대신 텍스트로 표시
		 *			- end	String	N	종료 지점을 순번 대신 텍스트로 표시
		 *			- width	String	N	
		 * 		duplicate 
		 * 			- message
		 * 		headers
		 * 			id			String	Y	데이터 Object의 field명
		 *			label		String	Y	Grid Column title
		 *			width		String	Y	Column의 width로 px 단위 또는 "*"
		 *			hcss		Object	N	COlumn Header의 Style
		 *			css			Object	N	Data Column의 Style
		 *			format		String	N	Data 표시 형식(formatComplete사용)
		 *			expression	Function	N	(ele,colset,data), return되는 결과값 반영
		 *			inputType	Object	N	컬럼 입력 형식 정의
		 *				- type		String	Y	selectbox 만 현재 지원
		 *				- def		String	N	기본값
		 *				- itemset	ListArray	Y	selectbox 선택 값을 List Array로 정의
		 * 		itemRender
		 * 		selectType
		 * 		dataset
		 * 			- hidecheckbox
		 * 			- hideradio
		 * 			- disabled
		 * 			- selected
		 * 		rowclick 
		 *
		 */
		var __wait	= function(){return (function() {	var _timer = 0;	
		var _result = {	clear : function(){clearTimeout(_timer);return this;}
			,run : function(callback,ms){this.clear();	_timer = setTimeout(callback,ms);}};return _result;	})();};
		$.widget( "ep.epgrid", {
			version: "1.11.2"
			,options : {
				draggable 	: true,			/* drag 지원 여부*/
				isduplicate : false,			/* 중복 방지 여부 */
				keycode 	: "key",			/* 중복 방지 키 필드 기본값은 key */
				reverse 	: false,				/* 역 방향 추가 */
				numbering 	: false,			/* 순번 추가 */  
				duplicate 	: {	 message : "",type : "" /*alert,toast*/ },
				hideheader 	: false,
				headers 	: null,
				itemRender 	: undefined, 	/*callback */
				selectType 	: "", /*checkbox, radio, rowselect*/
				dataset 	: null,
				rowclick 	: null,
				dragstop 	: null,
				offresize	: false,
				className 	: "",		/* plugin class 명 변경.*/
				height		: null,
				width 		: null
			 }
			,_create : function() {
				if(!this.options.className) {this.options.className =  this.widgetFullName };
				this.element.addClass("ep-widget " + this.options.className);
				this.options.classes && this.element.addClass(this.options.classes);
				this.options.width !== null && this.element.css("width",this.options.width);
				this.options.height !== null && this.element.css("height",this.options.height);
				this.options.hideheader === true && this.element.addClass("hideheader");
				this._delay = __wait();
				this._initGrid();
				if(this.options.draggable == true) {	this._initSortable();return;}
				//$(this.element).disableSelection(); FF에서 문제..ㅜㅜ 
				//if(typeof this.options.complete == "function") { this.options.complete.call(this.Element);}
			}
			,_destroy: function() {this.element.removeClass("ep-widget " + this.options.className);	return this;} 
			,_setOption: function(key, value){ 	$.Widget.prototype._setOption.apply(this, arguments);return this;}
			,_setOptions : function(options) {$.Widget.prototype._setOptions.apply(this, arguments);return this;}
			,_initSortable : function() {
				var _self = this;
				if(!($.ui && $.ui.sortable)) {return;}
				$("table tbody",this.element).sortable({ axis: 'y' ,revert: 100, delay : 200, items : 'tr:not(.' + _self.options.className +'-disabled)' 
					,helper: function(e, tr)	{
						var orgs = tr.children(),
						_helper = tr.clone(); 
						_helper.children().each(
								function(index) {
									$(this).width(orgs.eq(index).width());
									$("select",this).val($("select",orgs.eq(index)).val());													
								}); 
						return _helper; 
					}
					,stop : function() {
						//e.stopImmediatePropagation();
						
						if(_self.options.numbering) {_self._refreshNumber();return;}
						_self._trigger("dragstop");						

					}
				});
			}
			,_initGrid : function() {
				this._Elements = {};
				var _self = this, ele = _self.element,opt = this.options, _iele = this._Elements;
				
				if(!opt.headers) {return;}				
				var _head = opt.headers
					,_hwrap = $('<div class="' + this.options.className +'-header-div" />').appendTo(ele)
					,_htbl = $('<table class="' + this.options.className +'-header-table" border="0" cellpadding="0" cellspacing="0" />').appendTo(_hwrap);
					
				_self._draw_colgroup(_htbl);
				var _hth = $('<thead />').appendTo(_htbl);
				_iele.htbl = _htbl; 
				  
				
				var _htr = $('<tr />').appendTo(_hth);
				if(opt.numbering) {	_self._drawNumber(_htr,true);}
				_self._selectTypeHandle(null,true,_htr);						
				for(var x = 0; _head.length > x; x++) {
					var __th = $('<th id="' + _head[x].id + '">' + (_head[x].label ? _head[x].label :"" ) + '</th>').appendTo(_htr);
					if(_head[x].hcss) {__th.css(_head[x].hcss);}
					_head[x].hclasses && __th.addClass(_head[x].hclasses);
				} 
				
				var _dwrap = $('<div class="' + this.options.className +'-data-div" />').appendTo(ele)
					,_dtbl = $('<table class="' + this.options.className +'-data-table" border="0" cellpadding="0" cellspacing="0" />').appendTo(_dwrap);
				_iele.dtbl = _dtbl;
				_self._draw_colgroup(_iele.dtbl);
				_iele.databody = $('<tbody class="' + this.options.className +'-data" />').appendTo(_dtbl);
				$(ele).bind("epgridresize",function() {_self._resizeHandle();});
				this.options.offresize !== true && $(window).on("resize",function() {_self._delay.run(function(){_self._resizeHandle();},200);});					
				if(opt.selectType == "checkbox") {
					$("#checkall input",_iele.htbl).click(function(_e) {if($(this).is(":checked")) {_self.allChecked(true);	} else {_self.allChecked(false);	}});
				}
				_self.addData(typeof opt.dataset === "function" ? opt.dataset.call(this.element) : opt.dataset);
			}
			,_resizeHandle : function() {
				this.options.offresize !== true && $(this._Elements.htbl).css({width: this._Elements.dtbl.width()-1});
			}
			,_draw_colgroup : function(_par) {
				var _self = this
					, ele = _self.element
					,opt = this.options
					,_head = opt.headers
					,_cg = $('<colgroup />').appendTo(_par);
				if(opt.numbering){$('<col width="' + (typeof opt.numbering === "object" ? opt.numbering.width ? opt.numbering.width : "40px" : "40px")+ '" />').appendTo(_cg);}
				if(opt.selectType != "rowselect" && opt.selectType) {$('<col width="26px" />').appendTo(_cg);} 
				for (var x=0; opt.headers.length > x; x++) { 
					$('<col width="' + (_head[x].width ? _head[x].width : '*' ) + '" />').appendTo(_cg);
				}
			}
			,_drawNumber : function(head,isheader) {
				if(!this.options.numbering) {return;}
				var _tag = isheader === true ? "th" : "td"
					,_num = $('<' + _tag + ' id="num">' + (isheader === true ? "No." : "")+'</'+ _tag + '>').appendTo(head);
				if(isheader === true ) {return;}
				return;
			}
			,_refreshNumber : function() {
				var _self = this,opt = _self.options;if(!opt.numbering) {return;}
				var _nodes = _self.getAllNodes();	if(_nodes.size() == 0 ) {return;}
				var _len = _nodes.size(),_cnt = opt.reverse ? _len + 1 : 0;
				_nodes.each(function() {
					var $num = $("#num",this);_cnt = opt.reverse ? _cnt-1 : _cnt+1;
					if(typeof opt.numbering === "object") { 
						$num.text(_cnt == 1 ? opt.numbering.start ? opt.numbering.start : _cnt 
									: _cnt == _len ? opt.numbering.end ? opt.numbering.end : _cnt : _cnt);
					} else {$num.text(_cnt);}
				});
			}
			,_selectTypeHandle : function(data,isheader,par) {
				var _self = this, opt = this.options;
				var _html = "";
				//if(isheader !== true && data && (data.hidecheckbox||data.hideradio)) {return '<td width="26px"></td>';}
				switch(opt.selectType) {
				case "checkbox":
					_html = '<' + (isheader === true ? 'th' : 'td') + (isheader === true ? ' id="checkall" class="checkbox"' : ' class="checkbox"') 
						+ '><input type="checkbox" name="grid_check"'+ (data && data.hidecheckbox ? ' style="display:none"' : '') + '></' + (isheader === true ? 'th' : 'td') +'>';
					if(isheader === true) { $(_html).appendTo(par);} 
					break;
				case "radio":
					_html = '<' + (isheader === true ? 'th' : 'td') + ' width="26px">' 
						+ (isheader === true ? '' : '<input type="radio" name="grid_check"'+ (data && data.hideradio ? ' style="display:none"' : '') + '>')
						+ '</' + (isheader === true ? 'th' : 'td') +'>';
					if(isheader === true) { $(_html).appendTo(par);} 
					break;
				}
				return _html;
			}
			,_makeInputType : function(colset,data) {
				var _colset = colset, _inType = _colset.inputType, _data = data, _$ret = null;
				switch(_inType.type) {
				case "selectbox":
					_$ret = $('<select class="organ_item_select" />');
					$.each(_inType.itemset, function(idx,val) {_$ret.append('<option value="' + idx + '">' + val + '</option>');});
					_$ret.val( _data[_colset.id] ? _data[_colset.id] : _inType.def ? _inType.def : "");
					_data[_colset.id] = _$ret.val();
					_$ret.on("change", function(e) {
						e.stopPropagation();
						_data[_colset.id] = $(this).val();
					});
					break;
				}
				return _$ret;
			}
			,_makeDataColumn : function(ele,colset,data) {
				var _td = $('<td />')
					,_txt = (colset.inputType ? this._makeInputType(colset,data) : 
								colset.format ? $ep.util.patternCompletion(colset.format,data) : 
									colset.expression ? colset.expression.apply(this.element,[_td,colset,data]) : 
										(data[colset.id] ? data[colset.id] : "")); 
					if(!_td.attr("title")){
						if(typeof _txt == "string")	_td.attr("title",_txt);
					}
					colset.id && _td.attr("id",colset.id);
					colset.classes && _td.addClass(colset.classes);
					_td.append(_txt).appendTo(ele);
				if(colset.css) { _td.css(colset.css);}
			}
			,_throwMessage : function() {
				var opt = this.options;
				if(opt.duplicate.message) {
					opt.duplicate.type && opt.duplicate.type == "alert" && alert(opt.duplicate.message);
					opt.duplicate.type && opt.duplicate.type == "toast" && $ep.util.toast(opt.duplicate.message,opt.duplicate.delay ? opt.duplicate.delay : 1000);
				}
			}
			,_addData : function(node) {				
				var _self = this, opt = this.options,_node = node;
				var _tr = $('<tr class="' + this.options.className +'-item" />');
				if(typeof opt.itemRender === "function") {
					var _r = opt.itemRender.call(_self.element, _node,_tr) ;
					if (_r === false) {return;};
					if(_r) {_node = _r;}
				}
				if(opt.isduplicate === true ) {
					if(_self.getDataByKey(_node[opt.keycode]).length > 0 ) { 
						_self._throwMessage();
						return;
					}
				}		 
				
				if(opt.reverse === true) {$(this._Elements.databody).prepend(_tr);}
					else {_tr.appendTo(this._Elements.databody);	}
				if(opt.numbering) {	_self._drawNumber(_tr);}				
				_tr.append(_self._selectTypeHandle(_node));
				_node.selected  == true && _tr.find("input:radio,input:checkbox").prop("checked",true) && (delete _node.selected); 
				if(_node.disabled === true) {	_tr.addClass(_self.options.className + "-disabled");}
				
				for (var i=0; opt.headers.length > i; i++) { _self._makeDataColumn(_tr,opt.headers[i],_node);}
				
				$(_tr).data("data",_node);
				if($(_tr).hasClass(_self.options.className + "-disabled")) { $("select,input",_tr).attr("disabled",true);};
				var _dbclick = false;
				function __select(_this,force) {
					switch(opt.selectType) {
						case "rowselect":
							if(force===true) {
								$(_this).addClass(_self.options.className + "-selected");	
							} else {
								$(_this).toggleClass(_self.options.className + "-selected");	
							}
							break;  
						case "checkbox":
							if(force===true) {$("input[name=grid_check]",_this).prop("checked",true);return;}
							if($("input[name=grid_check]",_this).prop("checked")) {
								$("input[name=grid_check]",_this).prop("checked",false);	
							} else {
								$("input[name=grid_check]",_this).prop("checked",true);
							}							
							break;
						case "radio":
							if(force===true) {$("input[name=grid_check]",_this).prop("checked",true);return;}
							if($("input[name=grid_check]",_this).prop("checked")) { 
								$("input[name=grid_check]",_this).prop("checked",false);	
							} else {
								$("input[name=grid_check]",_this).prop("checked",true);
							}									
							break;
					}
				}
				$(_tr).click(function(e) {
					var _e = e,_opt = opt,_this = this,__node = _node;
					if(!$(_e.target).parent().is("tr")) {_e.stopPropagation();return;}
					setTimeout(function() {
						if (_dbclick === true) {return;}
						if(!$(_this).hasClass(_self.options.className + "-item")) {return;}
						if($(_this).hasClass(_self.options.className + "-disabled")) {return;};
						_self._trigger("rowclick",_e,__node); 
						__select(_this);
					},200);
				}).dblclick(function(e) {
					_dbclick = true; 
					setTimeout(function() {_dbclick = false;},300);	 
					var _e = e,__node = _node,_this = this;
					if(!$(_e.target).parent().is("tr")) {_e.stopPropagation();_e.preventDefault(); return;} 
					if(!$(_this).hasClass(_self.options.className + "-item")) {return;}
					if($(_this).hasClass(_self.options.className + "-disabled")) {return;};
					__select(_this,true);
					_self._trigger("rowdblclick",_e,__node);  
											
				}); 						
				_self._refreshNumber();
				_self._fireResize(); 
				_self._trigger("afterItemRender",null,_tr);
			} 
			,_fireResize : function() {var _self = this;setTimeout(function() {_self._trigger("resize");},200); }
			,allChecked : function(flag) {
				if(flag === true) {$('.' + this.options.className +'-item:not(.' + this.options.className +'-disabled) input[name=grid_check]',this._Elements.databody).prop("checked",true);}
				else {$('.' + this.options.className +'-item:not(.' + this.options.className +'-disabled) input[name=grid_check]',this._Elements.databody).prop("checked",false);}
			}
			,addData : function(node) {
				var _self = this;
				if(!node) {return;}
				if($.isArray(node)) {$.each(node,function(idx,data){_self._addData(data);});
				} else  { this._addData(node);	}
				_self._trigger("afterAddData");
			}
			,getAllData : function() {
				var _dataNodes = this.getAllNodes()
					,_result = [];_dataNodes.each(function(idx,ele) {_result.push($(this).data("data"));});
				return this.options.reverse === true ? _result.reverse() : _result;
			} 
			,getSelectedData : function() {
				var _dataNodes = this.getSelectedNodes()
					,_result = [];_dataNodes.each(function(idx,ele) {_result.push($(this).data("data"));});
				return this.options.reverse === true ? _result.reverse() : _result;
			}
			,getDataByKey : function(keyVal) {
				if(!keyVal) {return [];}
				var _self = this,_result = [],_data = this.getAllData(); 
				if(_data.length == 0) {return _result;} 
				_result = $ep.Array(_data).filter( function(idx,data) {
					return data[_self.options.keycode] === keyVal;});					
				return _result;  
			}
			,removeAll : function() {
				var _result = this.getAllNodes(':not(.' + this.options.className +'-disabled)').remove();
				this._refreshNumber();
				this._fireResize();
				return _result;
			}
			,removeSelected : function() {
				var nodes = this.getSelectedNodes();
				if(nodes) {nodes.remove();}
				this._refreshNumber();
				this._fireResize();
			}
			,getSelectedNodes : function() {
				var _self = this,opt = _self.options, _dataBody = _self._Elements.databody
					,dataNodes =null;
				switch(opt.selectType) {
					case "checkbox":
						dataNodes = $('.' + this.options.className +'-item input[name=grid_check]:checked', _dataBody)
									.closest('.' + this.options.className +'-item');
						break;
					case "radio":
						dataNodes = $('.' + this.options.className +'-item input[name=grid_check]:checked', _dataBody)
						.closest('.' + this.options.className +'-item');
						break;
					default:
						dataNodes =$('.' + this.options.className +'-item.' + this.options.className +'-selected',_dataBody);
						break;
				}
				return dataNodes;						
			} 
			,getColumnById : function(id,tr) {
				var _tr = tr;
				if(!_tr) {_tr = this.getSelectedNodes();}
				if(_tr.size() == 0) {return [];}				
				return _tr.find('td[id='+id+']');				
			}
			,getAllColumnById : function(id) {	return this.getColumnById(id,this.getAllNodes());}
			,deSelectedAll : function() {
				var _self = this,opt = _self.options, _dataBody = _self._Elements.databody;
				switch(opt.selectType) {
				case "checkbox":
					$('.' + this.options.className +'-item input[name=grid_check]:checked', _dataBody).prop("checked",false);
					break;
				case "radio":
					$('.' + this.options.className +'-item input[name=grid_check]:checked', _dataBody).prop("checked",false);
					break;
				default:
					$('.' + this.options.className +'-item.' + this.options.className +'-selected',_dataBody).removeClass( this.options.className +'-selected');
					break;
				}
			}
			,getAllNodes : function(sel) {	var _nodes = $('.' + this.options.className +'-item',this._Elements.databody); return sel ? _nodes.filter(sel) : _nodes;}
			,selectedUp : function(node) {
				var _self = this, _node = node ? node : this.getSelectedNodes();
				var _resolv = null
					,_done = {done : function(callback) {_resolv = callback;}};
				_node.each(function() {
					var prev = $(this).prev();
					
					while(prev.hasClass(_self.options.className +'-disabled')) {
						prev = $(prev).prev();									
					}
					if(prev.size() == 0 ) {return _done;}
					$(this).effect("transfer",{
						to : prev,className : "ep-epgrid-transfer"
					},300, function() {
							$(this).insertBefore(prev);
							_self._refreshNumber();
							_resolv && _resolv.call(_self,this);							
					});					
				});
				return _done;
			}
			,selectedDown : function(node) {
				var _self = this, _node = node ? node : this.getSelectedNodes(),_len = _node.size();
				var _resolv = null
					,_done = {done : function(callback) {_resolv = callback;}};
				for(var x=_len-1;x >= 0; x--) {
					var after = $(_node.eq(x)).next();
					while(after.hasClass(_self.options.className +'-disabled')) {
						after = $(after).next();
					}
					if(after.size() == 0 ) {continue;}; 
					
					$(_node.eq(x)).effect("transfer",{
						to : after,className : "ep-epgrid-transfer"
					},300, function() {
						$(this).insertAfter(after);
						_self._refreshNumber();
						_resolv && _resolv.call(_self,this);	
					});
				}
				return _done;
			}
			
		}); 
	})();
	/*
	 * ep.epupload
	 */
	(function (factory) {
	    'use strict';
	    factory(window.jQuery);
	}(function ($) {
		'use strict';
		var  _fext = $.fileext = {
			"bmp" 	: "img"		,"jpg" 	: "img"		,"png" 	: "img"		,"psd" : "img"		,"gif" 	: "img"		,"tiff" : "img"		
			,"doc" 	: "doc"		,"docx"	: "doc"		
			,"ppt" 	: "ppt"		,"pptx"	: "ppt"
			,"xls" 	: "xls"		,"xlsx" : "xls"
			,"hwp" 	: "hwp"		,"pdf" 	: "pdf"
			,"exe" 	: "exe"		
			,"html" : "html"	,"htm" 	: "html"	,"txt" 	: "txt"		,"text" : "txt"		 
			,"zip" 	: "zip"		,"etc" 	: "etc"
			,"getExt" : function(name) {
				(/\.(\w+)$/g).test(name);
				var _ext = RegExp.$1.toLowerCase();
   	  		 	return this[_ext] || "etc"
			}
		};
		$.widget('ep.epupload', $.ep.epgrid,{
			widgetEventPrefix : "epgrid",
	        options: {
	        	draggable : false,
	        	hideheader : false,
	        	numbering : false,
	        	keycode : "name",
	        	//selectType : "rowselect",
	        	i18n : {
	        		filename : "Name",
	        		filesize : "Size",
	        		filestatus : "Status",
	        		Attached : "Attached",
	        		AttachmentFiles : "Attachment Files",
	        		AttachmentTooltip : "Please select if you have a file attachment.",
	        		Failed : "Failed",
	        		Completed : "Completed"
	        	},
	        	isduplicate : true
	        	,duplicate : {
	        		message : "파일명이 중복입니다."
	        		,type : "toast"
	        		,delay: 1000
	        	},	        	
	        	headers : null,
	        	/* dataset :  [
		           {name : "첨부파일1.txt",size : 324342},
	 	           {name : "첨부파일3.txt",size : 43253425432}, 
		           {name : "첨부파일4.txt",size : 2542}
		    	], */
		    	itemRender : function(data,tr) {
		    		if(!data.upload) {return;}
		    		data.upload.context = tr;
		    	},
				className : "ep-epgrid",
				url : "", //"/devaphqapp/ngw/core/temporarily.nsf/Upload?OpenForm"
				formData : {}
	        }
			,widgetName : "epgrid"
			,_setHeader : function(){
				var _i18n = this.options.i18n;
				var _header =  [
	        	  	{id : "name" , 		label : _i18n.filename, 	width : "*", hcss : {"textAlign" : "left","paddingLeft":"5px"}, css : {"padding" : "0 5px"},
	        	  	  expression : function(e,c,d) {
	        	  		 var ext = _fext.getExt(d.name);
	        	  		 return d.name ? $('<span class="file_icon ' + ext + '" /><span class="file_name">'+ (d.name || "")  +'</span>') : "";
	        	  	  }
	        	  	},
	        	  	{id : "size" , 		label : _i18n.filesize, 	width : "100px", css : {"text-align" : "center","padding":"0 5px"},
	        	  		expression : function(e,c,f){return f.size ? f.size.toSize() : "";}
	        	  	},
	        	  	{id : "progress" , 	label : _i18n.filestatus, 	width : "150px", css : {"text-align" : "center","padding":"0 5px"},
	        	  		expression : function(ele,col,data) {
	        	  			if(data.isnew !== true){return _i18n.Attached;}
	        	  			var _tag = '<div class="progress progress-success progress-striped active" ' 
				        		 + 'role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' 
				        		 + '<div class="bar" style="width:0%;"></div>' 
				        		 + '</div>';
				        	return $(_tag);
	        	  		}
	        	  	}
	        	  	,{id : "process", label : "", width : "25px", css : {"text-align":"center"},classes : "nostrike",
	        	  		expression : function(ele,col,data) {
	        	  			var _this = this
	        	  				,_data = data
	        	  				,_ele = ele
	        	  				,_html = $('<span class="ep-icobutton"><span class="ep-icon cancel" /></span>').on("click",function(){
	        	  					$(_this).epupload(_data.isnew ? "removeElement" : "strikeElement",_ele,_data); 
	        	  				});
	        	  			return _html;
	        	  		}
	        	  	}
	        	  	
	        	];
				this.options.headers = _header;
			}
			,_create : function(){
				!this.options.headers && this._setHeader();
				this._super("create");
				this.widget().addClass("ep-widget "+ this.widgetFullName);
				this._createUI();
				this._initUploader();
			}
			,_createUI : function() {
				$(this.element).wrapInner('<div class="epuploader-files" />');
				$(this.element).prepend('<div class="epuploader-header"><span class="epuploader-input"><span class="epuploader-button" id="attach"></span><input id="attach" type="file" name="%%File" multiple title="'+ this.options.i18n.AttachmentTooltip + '"></span></div>');
				$("#attach.epuploader-button",this.element).epbutton({text : this.options.i18n.AttachmentFiles});			
			}
			,_setOptions : function(options){
				$.extend(true,this.options,options);
				/*if(options.formData && options.formData.unique) {
					$(".epuploader-input",this.element).fileupload("option","formData.unique",options.formData.unique);
				}*/
			}
			,_initUploader : function() {
				var _self = this;
				$(".epuploader-input",_self.element).fileupload({
					add : function(e,data) {
						var _data = data;
						_self.addData({	upload : _data	,name : _data.files[0].name	,size : _data.files[0].size ,isnew : true});	
					}
					,dataType : "json"
					,progress : _self._onProgress
					,fail : function(e,data){_self._onFail(e,data);}
					,done : function(e,data){_self._onDone(e,data);}
					,formData : function(f) {
						var _formData = $.extend(true,{},_self.options.formData,{idx : this.files[0].idx}),_arr = [];
						$.each(_formData, function(_idx,_val) {_arr.push({name : _idx, value : _val});});
						return _arr;
					}/*_self.options.formData */
					,url : _self.options.url ? _self.options.url : "/Upload?OpenForm" 
				});
			}		
			,_onFail : function(e,data){
				var _this = this, _data = data;
				var _prog = _this.getColumnById("progress",data.context);
				_prog.html(this.options.i18n.Failed);
			}
			,_onDone : function(e,data) {
				var _this = this, _data = data;
				var _prog = _this.getColumnById("progress",data.context);
				_prog.html(this.options.i18n.Completed);
				
			}
			,_onProgress : function(e,data) {
	            if (data.context) {
	                var progress = Math.floor(data.loaded / data.total * 100);
	                data.context.find('.progress')
	                    .attr('aria-valuenow', progress)
	                    .find('.bar').css('width',progress + '%'); 
	            }
	        }
			,getAllStrike : function() {
				return this.getAllNodes().filter(".strike");
			}
			,getAllFileNodes : function() {
				return this.getAllNodes().filter(":not(.strike)");
			}
			,getAllFileNames : function() {
				var _dataNodes = this.getAllFileNodes()
					,_result = _dataNodes && 
						$ep.Array(_dataNodes).datafilter(function(_idx,val) {
							var _data = $(this).data("data");
							return _data ? _data.name ? _data.name : null : null;
						});  
				return _result;
			}
			,getDelFileName : function(){
				var _nodes = this.getAllStrike()
					,_result = [];
				$.each(_nodes,function() {_result.push($(this).data("data").name);});
				return _result;
			}
			,getDataByKey : function(keyVal) {
				if(!keyVal) {return [];}
				var _self = this,_nodes = _self.getAllFileNodes()
					,_data = $ep.Array(_nodes).datafilter(function() {
						var _= $(this).data("data");
						return 	typeof _[_self.options.keycode] === "string" ? _[_self.options.keycode].match(new RegExp("^[\\s]*"+keyVal + "[\\s]*$","gi")) ? _ : null : _[_self.options.keycode] === keyVal ? _: null;}); 
				if(!_data) {return [];}
				return _data;  
			}
			,submit : function(){
				var _tmp = this.options.keycode;
				this.options.keycode = "isnew";
				var _self = this, _idx = 0 ,	_data = this.getDataByKey(true),_promise = new $.Deferred();
				this.options.keycode = _tmp;
				var _delFiles = this.getDelFileName();
				$.when.apply(this,$ep.Array(_data).datafilter(function() {	this.upload.files[0]["idx"] = _idx;_idx++;	return this.upload.submit.apply(this.upload);}))
				.done(function(data) {
					var _result = null;					
					_self._trigger("completed",data,_delFiles);
					_result = $.isArray(data) ? data[0] : data;
					_promise.resolve(_result,_delFiles);
				})
				.fail(function() {
					_self._trigger("failed");	
					_promise.reject(""); 
				});
				return _promise.promise();
			}
			,strikeElement : function(ele) {
				var _self = this,_ele = ele
					,_tr = _ele.closest("tr.ep-epgrid-item");
				if(_tr.hasClass("strike")) {
					var _data = _tr.data("data");
					if(_self.getDataByKey(_data[_self.options.keycode]).length > 0) {
						_self._throwMessage();
						return;
					} 
				}
				_tr.toggleClass("strike");
			}
			,removeElement : function(ele){
				var _self = this,_ele = ele;
				_ele.closest("tr.ep-epgrid-item").fadeOut(150,function() {$(this).remove();_self._fireResize();});			
			}
		});
		
		
		$.widget('ep.xamupload', $.ep.epgrid,{
			widgetEventPrefix : "epgrid"
			,widgetName : "epgrid"
			,_create : function(){
				this._super("create");
				this.widget().addClass("ep-widget "+ this.widgetFullName);
				this.widget().removeClass("ep-epgrid");
				$(this.element).wrapInner('<div class="epuploader-files" id="xamuploader-files" />');
				this._initUploader();
			}
			,_getDateFormat : function () {
				var _self = this
				var _date = new Date();
				var yyyy = _date.getFullYear().toString();
				var MM = _self._getPad(_date.getMonth() + 1,2);
				var dd = _self._getPad(_date.getDate(), 2);
				var hh = _self._getPad(_date.getHours(), 2);
				var mm = _self._getPad(_date.getMinutes(), 2);
				var ss = _self._getPad(_date.getSeconds(), 2);
				return yyyy + MM + dd+ hh + mm + ss;
			}
			,_getPad : function (number, length) {
				var str = '' + number;
				while (str.length < length) {
					str = '0' + str;
				}
				return str;
			}
			,_getRandomChar : function() { 
				return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) +
								Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
			}				
			,_setOptions : function(options){
				var _self = this;
				$.extend(true,this.options,options);
			}		
			,_attachunid : ""
			,_attachunique : ""
			,_initUploader : function() {
				var _self = this, def = $.Deferred();
				
				_self._attachunid = ((_self.options.formData&&_self.options.formData.unid)?_self.options.formData.unid:_self._getDateFormat());
				_self._attachunique = ((_self.options.formData&&_self.options.formData.unique)?_self.options.formData.unique:_self._getRandomChar());
				
				var isEdit = (_self.options.mode === 'edit'?true:false);
				_self.am = new XAM({
					disp_id          : $(this.element).attr('id'),
					parent_ele       : this.element,
					config_url       : '/config/app_xam_config' + ($ep.lang() == 'ko' ? '' : '_eng') + '.xml?open',							
					isEdit			 : isEdit,
					save_path		 : _self.options.url ? _self.options.url : "/Upload?OpenForm",		
					serverzip_path   : _self.options.url.replace(/Upload/g, 'xam_zipdownload'),							
					attachunid       : _self._attachunid,
					attachunique     : _self._attachunique,	
					deleteCallback    : "read_v3",
					OnMoveBefore     : function(file, el, move_type) {
						if (isEdit) {
							if (file.status == 'complete') {
								// 기첨부된 파일은 이동이 안되도록 처리
								$(el).removeClass('click-on');
								return false;
							} else {
								// 기첨부된 파일은 위,아래로 이동이 안되도록 처리
								var dstEl = (move_type == 'up' ? $(el).prev() : $(el).next());
								var dstStat = dstEl.find('.upload-status');
								if (dstStat.hasClass('complete')) { 
									return false; 
								}
							}
						}
						return true;
					},
					OnRemoveBefore   : function(file, el) {
						/*
						if (isEdit && file.status == 'Complete') {
							if ($(el).hasClass('remove')) {
								// 대기열에 동일 파일명이 있는 경우 삭제 해제 안되도록 처리
								var file_list = _self.am.g.getFileList();
								var remove_avail = true;
								$.each(file_list, function(idx, _file) {
									if (_file.status == 'wait' && _file.name == file.name) {
										remove_avail = false;
										return false;
									}
								});
								if (remove_avail) {
									$(el).removeClass('remove');
								} else {
									alert(_self.am.g('MSG.INVALID_DUP_FILE'));
								}
							} else {
								$(el).addClass('remove');
							}
							return false;
						}
						return true;
						*/
					},
					OnError : function(e){ 
						def.reject();
					},
					OnInitCompleted  : function(id){
						var att_list = _self.options.dataset;
						var lists = [];
						if(att_list.length != 0){
							for(var i = 0; i < att_list.length; i++){
				                var attach = {
				                    type: (isEdit?'edit':'read'),
				                    name: att_list[i].name,
				                    origname: att_list[i].name,
				                    size: att_list[i].size,
				                    downloadpath: att_list[i].url
				                };
				                lists.push(attach);
							}
							_self.am.g.setFileList(lists, isEdit);
						}				
						def.resolve();
					}
				});

			}
			,getDelFileName : function(){
				var _nodes = this.am.g.getFileList();
				var _result = [];
				$.each(_nodes,function(idx, file) {
					if (file.status == 'remove') {
						_result.push(file.name);
					}					
				});
				return _result;				
			}
			,getAllFileNames : function(){
				var _nodes = this.am.g.getFileList();
				var _result = [];
				$.each(_nodes,function(idx, file) {
					if (file.status != 'remove') {
						_result.push(file.name);
					}					
				});
				return _result;				
			}
			,submit : function(){				
				var _tmp = this.options.keycode;
				this.options.keycode = "isnew";
				var _self = this,_promise = new $.Deferred();
				this.options.keycode = _tmp;
				var _delFiles = _self.getDelFileName();

				if (_self.am.g.getIESupport()) { // IE10 이하의 브라우저인 경우
					var ifr_doc = $('#' + _self.am.g.iframe_id)[0].contentWindow;
					var _result = {"id":ifr_doc._XAM.uploaderid, "unique":_self._attachunique, "unid":_self._attachunid};
					_promise.resolve(_result,_delFiles);
				} else {				
	                var _attach_form = $('#' + _self.am.g.iframe_id).contents().find('form');				

	                _attach_form.find('input[name="unid"]').val(_self._attachunid);
	                _attach_form.find('input[name="unique"]').val(_self._attachunique);
					
					$('#' + _self.am.g.iframe_id)[0].contentWindow.OnUploadComplete = function(files, _result) {   
	                	_promise.resolve(_result,_delFiles);
	                }	
					
					if (_self.am.g.upload()) {
					} else {
						_promise.resolve([], _delFiles);
					}
				}
				return _promise.promise();				
			}
		});
		
	}));
	
	
})();

