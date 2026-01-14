/**
 * 아카이빙 - 상세검색 for CS
 */
function archive_search_view(){}
$ep.inheritStatic(archive_search_view,"MAIL.ARCHIVE2");
archive_search_view.QUERY = {view:null, query:{}};
archive_search_view.TERM_SD = "";
archive_search_view.TERM_SD_1M = "";
archive_search_view.TERM_SD_3M = "";
archive_search_view.TERM_SD_6M = "";
archive_search_view.TERM_SD_1Y = "";
archive_search_view.TERM_ED = "";
archive_search_view._block = null;
archive_search_view.FOLDER_CATEGORYS = {};
archive_search_view.init = function(info){
	var _activeUi = $ep.ui.active();
	var _options = {};
	archive_search_view.initIntergrationSearch(_activeUi, info);
	var _ext_opt = info.ext_opt||{};
	_options = $.extend(true, {}, _options, _ext_opt);
	_options = $.extend(true, _options, {
		actions : {
			action : {
				search_action : {
					text : "{SEARCH_BUTTON}"
					,click : function() {
						archive_search_view.search_action();
					}
					,show : false
				}

				,delete_action : {
					text : "{DELETE}"
					,show : true
					,click : function(){
						debugger;
						var _self = this;
						var _dialog = this;
						var rex = this.getSelected();
						var list = new Array();
						for (i =0 ; i < rex.length; i++){
							list.push(rex[i].data._id)
						}
						if (list.length == 0){
							alert(mail_archive2.LangString("DELCONFIRM"));return false;
						}
						
						var _userAction = "del_archive_doc";
						var baseurl = $.CURI("/arch/monitor.nsf/action_form?openform");
						var inputdata = {
							__Click : "0", ActKind : _userAction,
							DocUNIDs : list.join(","), EmpNo: info.empno, uniquekey: info.uniquekey
						}

						var _block = $ep.util.blockUI({message :   mail_archive2.LangString("DELING") + "......"});
						$.ajax({
							url: baseurl.url,
							type: "POST",
							data: inputdata,
							dataType: "html",
							async : true,
							success : function(data, status, xhr){
								setTimeout(function() {
									_self.refresh().done(function() {
										_block.unblock();
									});	
								},1000);
												
							}
						})		
					}
				}
				,move_action : {
					text : "{MOVE}"
					,show : true
					,click : function() {
						debugger;
						var _self = this;
						var rex = _self.getSelected();
						var list = new Array();
						for (i =0 ; i < rex.length; i++){
							list.push(rex[i].data._id)
						}

						if (list.length == 0){
							alert(mail_archive2.LangString("MOVECONFIRM")); return false;
						}

						$ep.ui.dialog({							
							content : { url : "/" + info.mailmaster + "/mail/archive/archive.nsf/foldermanage?openform&epcall=y&act=move"}
							,width : 600
						    ,height : 550
						    ,title : "{ARCHIVEFOLDERMOVE}"
						    ,buttons : [
						    	{
						    		     //확인
						    		text :"{OK}"
						    		
						    		,highlight : true
						    		,click : function() {
						    			var _dialog = this;

										var tree = $ep.ui.tree($("#treeFolderSelect",this))											
										var _activenode = tree.getActiveNode();
										var targetNodeName = _activenode.title;
										var targetNodeCode = _activenode.key;
										
										var _userAction = "move_archive_doc";
										var baseurl = $.CURI("/arch/monitor.nsf/action_form?openform");
										var inputdata = {
												__Click : "0", ActKind : _userAction,
												DocUNIDs : list.join(","), EmpNo: info.empno,
												FolderName : targetNodeName, FolderCode : targetNodeCode, uniquekey : info.uniquekey
										}

										var _block = $ep.util.blockUI({message :   mail_archive2.LangString("MOVEMAIL") + "......"});
										$ep.util.ajax({
											url: baseurl.url,
											type: "POST",
											data: inputdata,
											dataType: "html",
											async : false,
											success : function(data, status, xhr){
												setTimeout(function (){
													_self.refresh().done(function() {														
															_block.unblock();
															$(_dialog).epdialog("close");
														});	
												}, 1000)												
											}
										})									
						    			
						    		}
						    	}
						    	,{
						    			//취소
						    		text : "{CANCEL}"
						    		,click : function(){
						    			$(this).epdialog("close")
						    		}
						    	}
						    ]
						},mail_archive2);
					}
				}

			}
		}		
		,column : {		
			selectable : "checkbox"
			,foldername : {
				title : "{FOLDERNAME}"
				,css : {"text-align": "center",width: "100px"}
			}			
			,from : {
				title : "{FROM}"
				,css : {"text-align": "center",width: "150px"}
			}				
			,dissendto:{
				title : "{RECIPIENTS}"
				,css : {"text-align": "center",width: "150px"}
			}
			,_icon : {
				css : {width: "20px"}
				,classes : "txtC"
				,render : function(tr,td,data,col){
					if (data.attachname != ""){
						return '<p class="ep-icon attachment" />';
					}else{
						return '';
					}
				}
				,hidewidth : true
			}		
			,subject : {
				title : "{SUBJECT}"
				,hcss : {"text-align": "center"}
			}
			,timez : {
				title : "{DATE}"
				,type : "isodate"
				,dateformat : "fullDateTime"
				,css : {"text-align": "center",width : "100px"}
			}
			,docsize : {
				title : "{SIZE}"
				,css : {"text-align" : "center", width: "120px"}
			}
		}
		,appcode : "archive.search"
		,rowdatapath : "hits.hits"
		,datapath : "fields"
		,events : {
			viewuri : function(opt) {
				debugger;
				var _q = null;
				var _p = {};
				
				_q = archive_search_view.QUERY.query = $.extend(true, {}, opt.query);
				
				if(_q.page == null) _q.page = 0;
				if(_q.ps == null) _q.ps = 15;
				_p.page = _q.page = opt.query.page;
				_p.ps = _q.ps = opt.query.ps;
				_p.start = (_q.page * _q.ps).toString();
				_p.colldisplay = _q.ps;
				_p.empno = info.empno;
				_p.companycode = info.companycode;
				_p.uniquekey = info.uniquekey;
				if(_q._pc && _q._pt && _q._ps && _q._pe){
					_p.pc = _q._pc;
					var psd = _q._ps.toDate("yyyy-MM-dd");
					var ped = _q._pe.toDate("yyyy-MM-dd");
					psd.setHours(0, 0, 0, 0);
					ped.setHours(23, 59, 59, 0);
					var sd = new Date(psd.getUTCFullYear(), psd.getUTCMonth(), psd.getUTCDate(), psd.getUTCHours(), psd.getUTCMinutes(), psd.getUTCSeconds(), 0);
					var ed = new Date(ped.getUTCFullYear(), ped.getUTCMonth(), ped.getUTCDate(), ped.getUTCHours(), ped.getUTCMinutes(), ped.getUTCSeconds(), 0);
					sd.setHours(sd.getHours() + 9);
					ed.setHours(ed.getHours() + 9);
					var tsd = sd.format("yyyy-mm-dd HH:MM:ss");
					var ted = ed.format("yyyy-mm-dd HH:MM:ss");
					/* 검색은 날짜를 한국 시간대로 변경하여 검색함. */
					_p.dr = tsd + "|" + ted;
				}

				if(_q._fc) _p.fc = _q._fc = opt.query._fc;
				if(_q._t_sb) _p.t_sb = _q._t_sb = opt.query._t_sb;
				//if(_q._t_wr) _p.t_wr = _q._t_wr = opt.query._t_wr;
				if(_q._t_fr) _p.t_fr = _q._t_fr = opt.query._t_fr;
				if(_q._t_st) _p.t_st = _q._t_st = opt.query._t_st;
				if(_q._t_ct) _p.t_ct = _q._t_ct = opt.query._t_ct;
				if(_q._t_bt) _p.t_bt = _q._t_bt = opt.query._t_bt;
				
				if(_q._t_bd) _p.t_bd = _q._t_bd = opt.query._t_bd;
				if(_q._t_at) _p.t_at = _q._t_at = opt.query._t_at;  
				if(_q._t_ab) _p.t_ab = _q._t_ab = opt.query._t_ab;
				if(_q._s_sb) _p.s_sb = _q._s_sb = opt.query._s_sb;
				//if(_q._s_wr) _p.s_wr = _q._s_wr = opt.query._s_wr;
				if(_q._s_fr) _p.s_fr = _q._s_fr = opt.query._s_fr;
				if(_q._s_st) _p.s_st = _q._s_st = opt.query._s_st;
				if(_q._s_ct) _p.s_ct = _q._s_ct = opt.query._s_ct;
				if(_q._s_bt) _p.s_bt = _q._s_bt = opt.query._s_bt;
				
				if(_q._s_dr) _p.s_dr = _q._s_dr = opt.query._s_dr;
				if(_q._s_bd) _p.s_bd = _q._s_bd = opt.query._s_bd;
				if(_q._s_at) _p.s_at = _q._s_at = opt.query._s_at;
				if(_q._s_ab) _p.s_ab = _q._s_ab = opt.query._s_ab;
				
				try{
					if(_p.page != null) _p.page = _p.page.toString();
					if(_p.start != null) _p.start = _p.start.toString();
				}catch(err){}					
				
				//var search_url = "/" + info.mailmaster + "/mail/archive/archive.nsf/cs_detail_search?openagent";
				var search_url = "/arch/monitor.nsf/agt_esdsearch_mail?openagent";
				
				var _uri = $.CURI(search_url, _p).encode();
				return _uri.url;
			}
			,beforeData : function() {
				setTimeout(function(){
					if (archive_search_view._block) {
						archive_search_view._block.unblock();
						archive_search_view._block = null;
					}
				}, 500);
				this.total = undefined;
			}
			,afterData : function(data) {			
				this.total = data.hits.total;
			}
			,click : function(a, b, c) {			
				debugger;
				$ep.util.ajax({						
					url : "/arch/monitor.nsf/agt_archive_restore_person?openagent&sabun="+info.empno+"&unid="+c._id + "&ms="+ info.curhost + "&" + new Date().getTime()
					,dataType : "text"
					,complete : function(data,stat,xhr) {
						var url = "/"+ info.mailpath +"/0/"+data.responseText + "?opendocument"+ "&" + new Date().getTime();
						if ($ep.util.browser.msie){
							window.open(url,"","width=1000, height=700");
						}else{
							$ep.ui.dialog({
								content : {url : url}
								,title : c.fields.subject
								,iframe : true 
								,width : 1100
							    ,height : 700
							});
						}
					}
				});

			}
		}		
		,extcount:function(callback){
			var _callback = callback;
			_callback(this.total);				
		}
	});

 	if(!_options.query) _options.query = {};
	if(!_options.query.entrycount) _options.query.entrycount = "false";
	archive_search_view.active = $ep.ui.view($(".viewpage",_activeUi),_options,archive_search_view);
};
archive_search_view.active = null;
archive_search_view.ATTACH = "<p class=\"ep-icon attachment\"/>";
archive_search_view.initIntergrationSearch = function(_activeUi, info){
	$ep.ui.initFieldSet($(".intergration-search", _activeUi));
//	var _query = info.ext_opt.query;
	var _query = null;
	archive_search_view.TERM_SD = info.term_sd;
	archive_search_view.TERM_SD_1M = info.term_sd_1m;
	archive_search_view.TERM_SD_3M = info.term_sd_3m;
	archive_search_view.TERM_SD_6M = info.term_sd_6m;
	archive_search_view.TERM_SD_1Y = info.term_sd_1y;
	archive_search_view.TERM_ED = info.term_ed;
	//if($ep.ui.getPageHref().indexOf("&page=") == -1) archive_search_view.QUERY.view = ""; /*왼쪽메뉴에서 클릭시 초기화 */
	_query = archive_search_view.QUERY.query = $.extend(true, {}, info.ext_opt.query);
	/* query
	 * _fc : Folder Category
	 * _pc : 기건 선택 조건
	 * _pt : 기간 Type
	 * _ps : 기간 시작
	 * _pe : 기간 종료
	 * _t_sb : subject

	 * _t_fr : 발신자명
	 * _t_st : 수신자명
	 * _t_ct : 참조자명
	 * _t_bt : 비밀참조자명
	 * _t_bd : 본문
	 * _t_at : 첨부명
	 * _t_ab : 첨부내용 
	 
	 * _s_sb : subject 검색조건
	 * _s_fr : 발신자명 검색조건
	 * _s_st : 수신자명 검색조건
	 * _s_ct : 참조자명 검색조건
	 * _s_bt : 비밀참조자명 검색조건
	  	 
	 * _s_dr : 기간 검색조건 (기간내 or 기간제외)
	 * _s_bd : 본문 검색조건
	 * _s_at : 첨부명 검색조건
	 * _s_ab : 첨부내용 검색조건
	 */
	
	/* 폴더 선택 부분 */
	//var _sel_opt = {id:"_", text:$ep.LangString("$MAIL.ARCHIVE2.SEARCH_SELECT_OPTION"), data:{is_null:true, folder_category:"_"}};
	//var parent_map = [_sel_opt];
	var parent_map = [];
	parent_map.push({id:"_all", text:$ep.LangString("$MAIL.ARCHIVE2.ALLLIST")});
	parent_map.push({id:"_inbox", text:$ep.LangString("$MAIL.ARCHIVE2.ARCHIVE_INBOX")});
	parent_map.push({id:"_sent", text:$ep.LangString("$MAIL.ARCHIVE2.ARCHIVE_SENT")});
	var folder_category = archive_search_view.getFolderCategoryList(info);
	var fc_key = "_all";
	if(folder_category != null){
		for(var i = 0; i < folder_category.length; i++){
			var item = folder_category[i];
			parent_map.push({id:item.key, text:item.name, data:item});
			if(_query._fc && _query._fc == item.key) fc_key = item.key;
		}
	}
	
	$ep.ui.select($(".parent_map", _activeUi), {
		width:140
		,items:parent_map
		,events:{
			selectchange:function(){
				//_folder_category_event(this.getSelectedValue());
			}
		}
	});
	if(fc_key){
		$ep.ui.select($(".parent_map", _activeUi)).setSelected(fc_key);
		//_folder_category_event(fc_key);
	}
	/* 폴더 선택 부분 끝 */	
	
//	var _sel_condition_opt = [{id:"AND", text:"AND"},{id:"OR", text:"OR"},{id:"NOT", text:"NOT"}];
	var field_suffix_list = "sb|fr|st|ct|bt|bd|at|ab";
	var field_suffix = field_suffix_list.split("|");
	for (var i = 0; i < field_suffix.length; i++){
		$ep.ui.input(".input_" + field_suffix[i],{
			icon : "search" //아이콘 버튼 타입 선택
			,name : "squery_" + field_suffix[i]
			,width : "80%"
			,icoClick : function() {archive_search_view.search_action();}
			,event : "keydown"
			,eventHandler : function(e) {
				if(e.keyCode != 13) {return;}
				archive_search_view.search_action();
			}		
		});
	}
	if(_query._t_bd || _query._t_at || _query._t_ab){
		//상세검색을 한 경우
		var _sel = $("#ico_detail_search");
		archive_search_view.show_search_detail(_sel[0]);
	}

	/* 기건 선택 조건 설정 */
	var _exist_chk_term = false;
	if(_query._pc){
		$("[name=chk_term]", _activeUi).each(function(){
			_exist_chk_term = true;
			if (_query._pc == this.value) this.checked = true;
		});
		if(_exist_chk_term){
			if(_query._pc == "st"){
				$("[name=sdate]", _activeUi).prop('disabled', false);
				$("[name=edate]", _activeUi).prop('disabled', false);
			}else{
				$("[name=sdate]", _activeUi).prop('disabled', true);
				$("[name=edate]", _activeUi).prop('disabled', true);
			}			
		}
	}
	if(_query._t_sb) $("[name=squery_sb]", _activeUi).val(_query._t_sb);
	//if(_query._t_wr) $("[name=squery_wr]", _activeUi).val(_query._t_wr);
	if(_query._t_fr) $("[name=squery_fr]", _activeUi).val(_query._t_fr);
	if(_query._t_st) $("[name=squery_st]", _activeUi).val(_query._t_st);
	if(_query._t_ct) $("[name=squery_ct]", _activeUi).val(_query._t_ct);
	if(_query._t_bt) $("[name=squery_bt]", _activeUi).val(_query._t_bt);
	
	if(_query._t_bd) $("[name=squery_bd]", _activeUi).val(_query._t_bd);
	if(_query._t_at) $("[name=squery_at]", _activeUi).val(_query._t_at);
	if(_query._t_ab) $("[name=squery_ab]", _activeUi).val(_query._t_ab);
	if(_query._s_sb) $ep.ui.select($("[name=select_sb]", _activeUi)).setSelected(_query._s_sb);
	//if(_query._s_wr) $ep.ui.select($("[name=select_wr]", _activeUi)).setSelected(_query._s_wr);
	if(_query._s_fr) $ep.ui.select($("[name=select_fr]", _activeUi)).setSelected(_query._s_fr);
	if(_query._s_st) $ep.ui.select($("[name=select_st]", _activeUi)).setSelected(_query._s_st);
	if(_query._s_ct) $ep.ui.select($("[name=select_ct]", _activeUi)).setSelected(_query._s_ct);
	if(_query._s_bt) $ep.ui.select($("[name=select_bt]", _activeUi)).setSelected(_query._s_bt);
	
	if(_query._s_dr) $ep.ui.select($("[name=select_dr]", _activeUi)).setSelected(_query._s_dr);
	if(_query._s_bd) $ep.ui.select($("[name=select_bd]", _activeUi)).setSelected(_query._s_bd);
	if(_query._s_at) $ep.ui.select($("[name=select_at]", _activeUi)).setSelected(_query._s_at);
	if(_query._s_ab) $ep.ui.select($("[name=select_ab]", _activeUi)).setSelected(_query._s_ab);
	//if(_query._pt) $ep.ui.select($("[name=select_term]", _activeUi)).setSelected(_query._pt);
	if(_query._ps) $("[name=sdate]", _activeUi).val(_query._ps);
	if(_query._pe) $("[name=edate]", _activeUi).val(_query._pe);
};
archive_search_view.show_search_detail = function(obj){
	var trobj = "";
	if (obj.className == "icon fold collapsed"){
		obj.className = obj.className.replace(/collapsed/g, "expanded");
		for (var i = 1; i < 3;  i++){
 			trobj = $("#search_detail_" + i);
 			if (trobj != null){
 				trobj.css("display", "");
 			}
 		}
	}else{
		obj.className = obj.className.replace(/expanded/g, "collapsed");
		for (var i = 1; i < 3;  i++){
 			trobj = $("#search_detail_" + i);
 			if (trobj != null){
 				trobj.css("display", "none");
 			}
 		}
	}
};

archive_search_view.search_action = function(){
	debugger;
	if (archive_search_view._block == null) {
		archive_search_view._block = $ep.util.blockUI({message :   mail_archive2.LangString("SEARCH_DEFAULT_BLOCKUI_MSG") + "......"});	
	}
	event.target && event.target.blur();
	
	var _activeUi = $ep.ui.active();
	var _view = $ep.ui.view($(".viewpage",_activeUi));
	var pc = archive_search_view.getRadioVal($("[name=chk_term]", _activeUi));
	if(pc == "") pc = "1w";
	var fc = $ep.ui.select($(".parent_map", _activeUi)).getSelectedValue();
	if(fc == "_") fc = "";

	var _query = {
		page:"0",
		_fc:fc,
		_t_sb:$("[name=squery_sb]", _activeUi).val(),
		//_t_wr:$("[name=squery_wr]", _activeUi).val(),
		_t_fr:$("[name=squery_fr]", _activeUi).val(),
		_t_st:$("[name=squery_st]", _activeUi).val(),
		_t_ct:$("[name=squery_ct]", _activeUi).val(),
		_t_bt:$("[name=squery_bt]", _activeUi).val(),
		
		_t_bd:$("[name=squery_bd]", _activeUi).val(),
		_t_at:$("[name=squery_at]", _activeUi).val(),
		_t_ab:$("[name=squery_ab]", _activeUi).val(),
		_s_sb:$ep.ui.select($("[name=select_sb]", _activeUi)).getSelectedValue(),
		//_s_wr:$ep.ui.select($("[name=select_wr]", _activeUi)).getSelectedValue(),
		_s_fr:$ep.ui.select($("[name=select_fr]", _activeUi)).getSelectedValue(),
		_s_st:$ep.ui.select($("[name=select_st]", _activeUi)).getSelectedValue(),
		_s_ct:$ep.ui.select($("[name=select_ct]", _activeUi)).getSelectedValue(),
		_s_bt:$ep.ui.select($("[name=select_bt]", _activeUi)).getSelectedValue(),
		
		_s_dr:$ep.ui.select($("[name=select_dr]", _activeUi)).getSelectedValue(),
		_s_bd:$ep.ui.select($("[name=select_bd]", _activeUi)).getSelectedValue(),
		_s_at:$ep.ui.select($("[name=select_at]", _activeUi)).getSelectedValue(),
		_s_ab:$ep.ui.select($("[name=select_ab]", _activeUi)).getSelectedValue(),
		_pc:pc,
		//_pt:$ep.ui.select($("[name=select_term]", _activeUi)).getSelectedValue(),
		_ps:$("[name=sdate]", _activeUi).val(),
		_pe:$("[name=edate]", _activeUi).val()
	};

	_view.options.query = archive_search_view.QUERY.query = $.extend(true, {}, _view.options.query, _query);
	_view.drawView();
};
archive_search_view.changeView = function(obj){
	debugger;
	var _activeUi = $ep.ui.active();
	var _view = $ep.ui.view($(".viewpage",_activeUi));
	var _exist_chk_term = false;
	
	$ep.ui.select($(".parent_map", _activeUi)).setSelectedIndex(0);
	$("[name=squery_sb]", _activeUi).val("");
	//$("[name=squery_wr]", _activeUi).val("");
	$("[name=squery_fr]", _activeUi).val("");
	$("[name=squery_st]", _activeUi).val("");
	$("[name=squery_ct]", _activeUi).val("");
	$("[name=squery_bt]", _activeUi).val("");
	$("[name=squery_bd]", _activeUi).val("");
	$("[name=squery_at]", _activeUi).val("");
	$("[name=squery_ab]", _activeUi).val("");
	
	$ep.ui.select($("[name=select_sb]", _activeUi)).setSelectedIndex(0);
	//$ep.ui.select($("[name=select_wr]", _activeUi)).setSelectedIndex(0);
	$ep.ui.select($("[name=select_fr]", _activeUi)).setSelectedIndex(0);
	$ep.ui.select($("[name=select_st]", _activeUi)).setSelectedIndex(0);
	$ep.ui.select($("[name=select_ct]", _activeUi)).setSelectedIndex(0);
	$ep.ui.select($("[name=select_bt]", _activeUi)).setSelectedIndex(0);
	
	$ep.ui.select($("[name=select_dr]", _activeUi)).setSelectedIndex(0);
	$ep.ui.select($("[name=select_bd]", _activeUi)).setSelectedIndex(0);
	$ep.ui.select($("[name=select_at]", _activeUi)).setSelectedIndex(0);
	$ep.ui.select($("[name=select_ab]", _activeUi)).setSelectedIndex(0);
	//$ep.ui.select($("[name=select_term]", _activeUi)).setSelectedIndex(0);
	$("[name=chk_term]", _activeUi).each(function(){
		_exist_chk_term = true;
		if("1w" == this.value) this.checked = true;
	});
	$("[name=sdate]", _activeUi).val(archive_search_view.TERM_SD);
	$("[name=edate]", _activeUi).val(archive_search_view.TERM_ED);
	if(_exist_chk_term){
		$("[name=sdate]", _activeUi).prop('disabled', true);
		$("[name=edate]", _activeUi).prop('disabled', true);		
	}
	
	var _query = {
		page:"0",
		_fc:"",
		_t_sb:$("[name=squery_sb]", _activeUi).val(),
		//_t_wr:$("[name=squery_wr]", _activeUi).val(),
		_t_fr:$("[name=squery_fr]", _activeUi).val(),
		_t_st:$("[name=squery_st]", _activeUi).val(),
		_t_ct:$("[name=squery_ct]", _activeUi).val(),
		_t_bt:$("[name=squery_bt]", _activeUi).val(),
		
		_t_bd:$("[name=squery_bd]", _activeUi).val(),
		_t_at:$("[name=squery_at]", _activeUi).val(),
		_t_ab:$("[name=squery_ab]", _activeUi).val(),
		_s_sb:$ep.ui.select($("[name=select_sb]", _activeUi)).getSelectedValue(),
		//_s_wr:$ep.ui.select($("[name=select_wr]", _activeUi)).getSelectedValue(),
		_s_fr:$ep.ui.select($("[name=select_fr]", _activeUi)).getSelectedValue(),
		_s_st:$ep.ui.select($("[name=select_st]", _activeUi)).getSelectedValue(),
		_s_ct:$ep.ui.select($("[name=select_ct]", _activeUi)).getSelectedValue(),
		_s_bt:$ep.ui.select($("[name=select_bt]", _activeUi)).getSelectedValue(),
		
		_s_dr:$ep.ui.select($("[name=select_dr]", _activeUi)).getSelectedValue(),
		_s_bd:$ep.ui.select($("[name=select_bd]", _activeUi)).getSelectedValue(),
		_s_at:$ep.ui.select($("[name=select_at]", _activeUi)).getSelectedValue(),
		_s_ab:$ep.ui.select($("[name=select_ab]", _activeUi)).getSelectedValue(),
		//_pt:$ep.ui.select($("[name=select_term]", _activeUi)).getSelectedValue(),
		_ps:$("[name=sdate]", _activeUi).val(),
		_pe:$("[name=edate]", _activeUi).val()
	};

	_view.options.query = archive_search_view.QUERY.query = $.extend(true, {}, _view.options.query, _query);
	_view.drawView();
};
archive_search_view.changeTerm = function(obj){
	var _activeUi = $ep.ui.active();
	var _val = obj.value;
	
	if(_val == "1w") $("[name=sdate]", _activeUi).val(archive_search_view.TERM_SD);
	if(_val == "1m") $("[name=sdate]", _activeUi).val(archive_search_view.TERM_SD_1M);
	if(_val == "3m") $("[name=sdate]", _activeUi).val(archive_search_view.TERM_SD_3M);
	if(_val == "6m") $("[name=sdate]", _activeUi).val(archive_search_view.TERM_SD_6M);
	if(_val == "1y" || _val == "st") $("[name=sdate]", _activeUi).val(archive_search_view.TERM_SD_1Y);
	$("[name=edate]", _activeUi).val(archive_search_view.TERM_ED);
	
	if(_val == "st"){
		$("[name=sdate]", _activeUi).prop('disabled', false);
		$("[name=edate]", _activeUi).prop('disabled', false);
	}else{
		$("[name=sdate]", _activeUi).prop('disabled', true);
		$("[name=edate]", _activeUi).prop('disabled', true);
	}
};
archive_search_view.getRadioVal = function(obj){
	if(obj == null) return "";
	if(obj[0] == null){
		if(obj.checked) return obj.value;
	}else{
		for(var i = 0; i < obj.length; i++){
			if(obj[i].checked) return obj[i].value;
		}
	}
	return "";
};
/**
 * 아카이빙 통합검색 - 폴더 리스트 가져오기
 */
archive_search_view.getFolderCategoryList = function(info){
	archive_search_view.FOLDER_CATEGORYS = [];
	
	var _temp = new Date().getTime();
	var _url = $.CURI("/" + info.mailpath + "/archive_folder_view?readviewentries&count=-1&outputformat=json&stamp="+ _temp);
	$ep.util.ajax({
		type:"get",
		url: _url.url,
		async:false,
	}).done(function(viewobj, txtStatus, xhr){
		if (typeof viewobj=="undefined"||viewobj == null) return;
		var ecount = viewobj["@toplevelentries"] || "0";
		if (ecount == "0") return;
		for (var i = 0 ; i < ecount ; i++){
			var _row = viewobj.viewentry[i];
			var _name = _row.entrydata[2].text[0];	//폴더명
			var _code = _row.entrydata[3].text[0];	//폴더코드
			var _pname = _row.entrydata[4].text[0];	//상위폴더명
			var _pcode = _row.entrydata[5].text[0];	//상위폴더코드
			archive_search_view.FOLDER_CATEGORYS.push({key:_code, name:_name});
		}
	}).fail(function(){});
	return archive_search_view.FOLDER_CATEGORYS;
};
