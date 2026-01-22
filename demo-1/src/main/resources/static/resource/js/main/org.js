$ep
.wait(function() {
	var _organ = $ep.ui.organ({});
	var pWin = window.opener ? window.opener : window.parent;
	window.NotesName = pWin.NotesName;
	var _orgOpt = pWin.ORG_ACTION[_org_action];	
	
	function getEmail(_name, _addr821){
		if(_name){
			return '"' + _name.replace(/ , /g, " ") + '"' + " <" + _addr821 + ">";
		}else{
			return _addr821
		}
	}
	
	function parseName(data, disp_mask){
		var notes_name = null;
		notes_name = new NotesName(data.notesid || data.email || data.name);
		var _disp_mask = disp_mask || "default";
		var val = null;
		var _name = '', _dept = '', _duty = '', _company = '', _ex_user = false;

		_name = (_orgOpt.lang == 'ko' ? data.name : _orgOpt.lang == data.lang ? data.oname : data.ename);
		if (data.email.indexOf('@daesang') == -1){
			// 외부사용자
			_ex_user = true;
		}

		if (data.type == "P"){
			if (data.dispgrade == "DUTY" || data.dispgrade == undefined) {
				_duty = (_orgOpt.lang == 'ko' ? data.duty : _orgOpt.lang == data.lang ? data.oduty : data.eduty) + "/";
				
			}else{
				_duty = (parent.gap.curLang == 'ko' ? data.post : parent.gap.curLang == data.lang ? data.opost : data.epost) + "/";
			}
			
			_dept = (_orgOpt.lang == 'ko' ? data.orgname : _orgOpt.lang == data.lang ? data.oorgname : data.eorgname) + "/";
			_company = (_orgOpt.lang == 'ko'? data.company : _orgOpt.lang == data.lang ? data.ocompany : data.ecompany);				

		}else if (data.type == "PC"){
			_duty = data.post + "/";
			_dept = data.orgname + "/";
			_company = data.company;			

		}else if (data.type == "D"){
			_duty = "";
			_dept = "";
			_company = data.company;			
		
		}else if (data.type == "PM"){
			_duty = data.post + "/";
			_dept = data.orgname + "/";
			_company = data.company;			
		}
		
		val = _name + "/" + _duty + _dept + _company;
		
		if (data.type == "PC" || data.type == "PM"){
			if (_ex_user){
				val = _name + " <" + data.email + ">";
			}
		}

		return val;
	}
	
	
//	function parseName(data, disp_mask){
//		debugger;
//		var notes_name = null;
//		notes_name = new NotesName(data.notesid || data.email || data.name);
//		var _disp_mask = disp_mask || "default";
//		var val = null;
//		var _name = '', _dept = '', _duty = '', _company = '';
//		if(data.name && data.ename && data.lang){
//			if(data.lang == _orgOpt.lang) _name = data.name;
//			else _name = data.ename;
//		}else{
//			_name = data.name;
//		}
//		if (data.type == "P"){
//			if(data.lang == _orgOpt.lang){
//				// _duty = data.duty + "/";
//				if (data.dispgrade == "DUTY") {
//					_duty		 = data.duty + "/";
//				} else {
//					_duty		 = data.post + "/";
//				}
//				_dept = data.orgname + "/";
//				_company = data.company;
//			}else{
//				// _duty = (data.eduty == ""?data.duty:data.eduty) + "/";
//				if (data.dispgrade == "DUTY") {
//					_duty		 = data.eduty + "/";
//				} else {
//					_duty		 = data.epost + "/";
//				}
//				_dept = (data.eorgname == ""?data.orgname:data.eorgname) + "/";
//				_company = (data.ecompany == ""?data.company:data.ecompany);				
//			}
//		}else if (data.type == "PM"){
//			_duty = data.post + "/";
//			_dept = data.orgname + "/";
//			_company = data.company;		
//		}else if (data.type == "PC"){
//			_duty = data.post + "/";
//			_dept = data.orgname + "/";
//			_company = data.company;			
//		}else if (data.type == "D"){
//			_duty = "";
//			_dept = "";
//			_company = data.company;			
//		}
//		//val = _name + "/" + _duty + "/" + _dept + "/"+ _company
//		val = _name + "/" + _duty + _dept+ _company
///*		
//		if(!_name && data.notesid && notes_name.isHierarchical) _name = notes_name.common;
//		
//		if(data.email){
//			val = getEmail(_name, data.email);
//		}else if(notes_name.addr821 && !notes_name.isHierarchical){
//			val = getEmail(_name||notes_name.addr822Phrase2, notes_name.addr821);
//		}else if(!data.name && data.notesid){
//			val = notes_name.abbreviated2;
//		}else if(_name){
//			val = _name;
//		}else{
//			if(!$ep._CONST.ORG_DISPLAY_MASK[_disp_mask]) _disp_mask = "default";
//			var pattern = $ep._CONST.ORG_DISPLAY_MASK[_disp_mask](data);
//			val = $ep.util.patternCompletion(pattern, data);
//		}
//*/		
//		return val;
//	}
	


	
	var dataset = _orgOpt.action.getItems();
	var parentFields = {};
	var resultHeaders = [
		{
			id:"icon",
			label:"",
			width:"26px",
			css:{
				"text-align":"left"
			},
			expression:function(td, colset, data){
				var _icon = (data.type == "D" || data.type == "G" || data.itemKind == "GROUP") ? '<span class="ep-icon organ-s"></span>'
						: '<span class="ep-icon person-s"></span>';
				return $(_icon);
			}
		},
		{
			id:"name",
			label:"",
			width:"*",
			css:{
				"text-align":"left"
			},
			expression:function(td, colset, data){
				return parseName(data).toEscape();
			}
		},
		{
			id:"up",
			label:"",
			width:"18px",
			css:{
				"text-align":"center"
			},
			expression:function(td, colset, data){
				var _td = td;
				if(data.disabled) return "";
				$(td)
						.on(
								"click",
								function(e){
									e.stopPropagation();
									_organ.dialog.api.results
											.selectedUp(_td
													.closest(".ep-epgrid-item"));
								});
				return $('<span class="list_ctrl aprv_list_ctrl"><span class="ctrl_up"></span></span>');
			}
		},
		{
			id:"down",
			label:"",
			width:"18px",
			css:{
				"text-align":"center"
			},
			expression:function(td, colset, data){
				var _td = td;
				if(data.disabled) return "";
				$(td)
						.on(
								"click",
								function(e){
									e.stopPropagation();
									_organ.dialog.api.results
											.selectedDown(_td
													.closest(".ep-epgrid-item"));
								});
				return $('<span class="list_ctrl aprv_list_ctrl"><span class="ctrl_down"></span></span>');
			}
		},
		{
			id:"delete",
			label:"",
			width:"23px",
			css:{
				"text-align":"left"
			},
			expression:function(td, colset, data){
				var _td = td;
				if(data.disabled) return "";
				$(td).on("click", function(e){
					e.stopPropagation();
					_td.closest(".ep-epgrid-item").remove();
				});
				return $('<span class="list_ctrl aprv_list_ctrl"><span class="ctrl_del"></span></span>');
			}
		}
	];
	
	var _opt = {}
	_opt = {
		content:_orgOpt.options.single?root_path + "/res/core/comm/html/organ/organ.single.html":root_path + "/res/core/comm/html/organ/organ.aprv.html",
		resizable:false,
		draggable:false,
		expandTree: _orgOpt.fulldept,
		organType:_orgOpt.options.single?"single":"custom", 
		title:_orgOpt.options.title,
		display: 'all', //[all, team]
		select: 'all', // [all, team, person]
		tabs: {
			organ: {
				tree: {
					server:_orgOpt.server,
					display: 'all',
					//select: _orgOpt.options.select ? _orgOpt.options.select : (parent.gBody3.cur_window && parent.gBody3.cur_window == "todo" ? 'person' : 'all'),
					select: _orgOpt.options.select ? _orgOpt.options.select : 'all',
					expandTree: _orgOpt.fulldept,
					checkbox:_orgOpt.options.single?false:true,
					radio:_orgOpt.options.single?true:false,
					search:{grid:{selectType:_orgOpt.options.single?'radio':'checkbox'}}
				}
			}
		},
		pubgroup: false,
		pergroup: typeof(_orgOpt.options.pergroup) != "undefined" ? _orgOpt.options.pergroup : true,
		peraddr: typeof(_orgOpt.options.peraddr) != "undefined" ? _orgOpt.options.peraddr : true,
		close: function(e){
			_orgOpt.action.hide();
			if (typeof(_orgOpt.action.onClose) == 'function') {
				_orgOpt.action.onClose();
			}
		},
		bindActions:{
			btnadd:{
				text:"{$CORE.ORGAN.BUTTON.BTNADD} &gt;",
				show:true,
				classes:"organ-mail-btn",
				click:function(){
					var _act = this.getActive();
					if(_act.options.issearch && _act.api.search){
						_act = _act.api.search;
					}
					var _d = this.getActiveSelectedData();
					if(_d){
						for(var i = 0; i < _d.length; i++){
							if((_d[i].type == "PM" || _d[i].type == "PC") && !_d[i].name && _d[i].notesid){
								var nm = new NotesName(_d[i].notesid);
								if(nm && nm.addr821 && !nm.isHierarchical){
									_d[i].name = nm.addr822Phrase2
											|| nm.addr821;
									_d[i].notesid = nm.addr821;
								}
							}
						}
						this.api.results.addData(_d);
					}
					_act.unselectedAll();
				}
			},
			btndel:{
				text:"&lt; {$CORE.ORGAN.BUTTON.BTNDEL}",
				show:true,
				classes:"organ-mail-btn",
				click:function(){
					this.api.results.removeSelected();
				}
			},
			btndetail:{
				text:"{$CORE.ORGAN.BUTTON.BTNDETAIL}",
				show:true,
				classes:"organ-mail-btn organ-detail",
				click:function(){
					var _self = this, _act = this.getActive();
					if(_act.options.issearch && _act.api.search){
						_act = _act.api.search;
					}
					var _d = this.getActiveSelectedData();
					if(!_d){
						return;
					}
					$.each(_d, function(){
						if(this.type === "P"){
							$ep.ui.userDetail(this.notesid,	_self.options.server, {position:{my:'center top', at:'center top+20', of:window}});
							return false;
						}
					});
				}
			},
			btnalldelete:{
				text:"{$CORE.ORGAN.BUTTON.BTNALLDEL}",
				show:true,
				click:function(){
					this.api.results.removeAll();
				}
			}
		},
		results:{
			element:"#result_approver",
			type:"organgrid",
			organgrid:{
				draggable:false,
				isduplicate:true,
				keycode:"notesid",
				hideheader:true,
				headers:resultHeaders,
				selectType:"checkbox",
				duplicate:undefined,
				duplicated:function(orig, dup){
					$ep.util.toast($ep
							.LangString("$CORE.ORGAN.TEXT.DUPLICATED"), 600);
					return false;
				},
				dataset:dataset,
				dragstop:function(elem){
				// this : organgrid
				}
			}
		},
		getResultData:function(){
			return _organ.dialog.api.results.getAllData();
		},
		buttons:{
			OK: {
				text: "{$CORE.ORGAN.BUTTON.OK}",
				highlight: true,
				click: function(){
					var result = _organ.dialog.getSelectedData();
					var _res = [];
					//조직도 사용자
					var _org = result.filter(function (data) {
						return (data.type == "P" || data.type == "D");
					});
					if (_org.length > 0){
						$(_org).each(function(idx, val){
							_res.push(val);
						});
					}
					
					//그 외
					var _etc = result.filter(function (data) {
						return (data.type != "P" && data.type != "D");
					});
					if (_etc.length > 0){
					/*	var _ky = $.map(_etc, function(ret, key) {
							return ret.notesid.split('/')[1].replace("OU=", "");
						});*/
						
						var _ky = [];
						var _ex_ky = [];
						
						$(_etc).each(function(idx, val){
							if (val.notesid.indexOf("OU=") > -1){
								_ky.push(val.notesid.split('/')[1].replace("OU=", ""));
								
							}else{
								val.ky = val.email;
								_ex_ky.push(val);
							}
						});
						
						if (_ky.length > 0){
							var surl = parent.gap.channelserver + "/api/user/search_user_multi.km";
							var postData = {
									"name" : _ky.join(','),
									"companycode" : ""
								};			

							$.ajax({
								type : "POST",
								url : surl,
								dataType : "json",
								async : false,
								data : JSON.stringify(postData),
								success : function(res){
									$(res).each(function(idx, val){
										_res.push(val[0]);
									});
								},
								error : function(e){
									gap.gAlert(gap.lang.errormsg);
									return false;
								}
							});							
						}

						if (_ex_ky.length > 0){
							$(_ex_ky).each(function(idx, val){
								_res.push(val);
							});
						}
						
						console.log(_res);
					}
					
				//	var flag = _orgOpt.action.setItems(result);
					var flag = _orgOpt.action.setItems(_res);
					if (flag == false) { return; }
					_orgOpt.action.hide();
					if (typeof(_orgOpt.action.onClose) == 'function') {
						_orgOpt.action.onClose();
					}
				}
			},
			CANCEL: {
				text:"{$CORE.ORGAN.BUTTON.CANCEL}",
				click:function(){
					_orgOpt.action.hide();
					if (typeof(_orgOpt.action.onClose) == 'function') {
						_orgOpt.action.onClose();
					}
				}
			}
		},
		create:function(){
			if(_orgOpt.options.subtitle){
				$(".ui-dialog-title").html('<span style="margin-top:10px;display:inline-block;line-height:22px;height:40px;">'
					+ _orgOpt.options.title
					+ '<br><span style="line-height:12px;font-size:12px;padding-left:2px;font-weight:normal;">' + _orgOpt.options.subtitle + '</span></span>'
					);
			}
		}
	};
	if(_orgOpt.options.single){
		_opt.height = 550;
		_opt.width = 400;
		_opt.radio = true;
		if(_orgOpt.options.peraddr){
			_opt.tabs.peraddr = {grid:{selectType:"radio"}};
		}
	}
	_organ.customSelect(_opt);
});
