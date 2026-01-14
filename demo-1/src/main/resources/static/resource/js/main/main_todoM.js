

function gTodoM(){
	// 전역변수
	this.cur_project_code = "";
	this.cur_project_name = "";
	this.cur_project_info = "";
	this.cur_project_item_list = "";
	this.cur_tab_status = "";
	this.view_mode = "";
	this.select_todo = "";
	this.select_id = "";
	this.title = "";
	this._click_obj = "";
	this.click_checklist_id = "";
	this.click_file_info = "";
	this.select_check_item = "";
	this.compose_admin = false;
	this.compose_asignee = false;
	this.per_page = 10;
	this.start_skp = 0;
	this.todo_star_count = 0;
	this.todo_star_total_count = 0;
	this.todo_archive_count = 0;
	this.todo_archive_total_count = 0;
	this.todo_project_list = "";
	this.todo_mention_count = 0;
	this.todo_mention_total_count = 0;

	this.todo_opt = "";
	this.todo_status = "";
	this.scroll_bottom = false;
	this.todo_title = "";
	this.systitle = "DSW";
} 



gTodoM.prototype = {
	"init" : function(){
		gap.cur_window = "";
		gTodoM.todo_title = gap.lang.ch_tab3;
	},
	
	"folder_layer_html" : function(is_update){
		var html = '';

	//	html += '<h2>' + (is_update ? gap.lang.todo_update_folder : gap.lang.todo_create_folder) + '</h2>';
		html += '<div class="wrap drive-create">';
		html += '	<div class="input-field">';
		html += '		<input type="text" class="formInput" id="input_folder_name" placeholder="">';
		html += '		<label for="input_folder_name">' + gap.lang.todo_folder_name + '</label>';
		html += '		<span class="bar"></span>';
		html += '	</div>';
		html += '</div>';
		
		return html;
	},
	
	"create_folder" : function(_code){
		var is_update = (_code != undefined ? true : false);
		var html = gTodoM.folder_layer_html(is_update);
		$("#create_channel_layer").html(html);
		
		if (is_update){
			//폴더 정보 update인 경우
			
			var surl = gap.channelserver + "/search_folder_todo.km";
			var postData = {
					"key" : _code,
					"email" : gap.search_cur_em()
				};			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){
						var obj = res.data;
						$("#input_folder_name").val(obj.name);
						$("#input_folder_name").parent().find("label").addClass("on");
						$("#input_folder_name").focus();
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});					

		}
		
		$("#input_folder_name").on("change", function(){
			if($(this).val() == ""){
				$(this).parent().find("label").removeClass("on");
			} else {
				$(this).parent().find("label").addClass("on");
			}
		});			
		
		gBodyM.mobile_open_layer('create_channel_layer');
		gBodyM.mobile_finish();
	},
	
	"create_folder_action" : function(code){
		/*
		 * 폴더 생성/수정
		 */
		var is_update = (code != undefined ? true : false);
		if ($("#input_folder_name").val().trim() == ""){
			gap.gAlert(gap.lang.input_foldername);
			return;
		}
		var folder_name = $("#input_folder_name").val();
		var readers = [];
		
		readers.push(gap.search_cur_em());
		var postData = {
				"name" : folder_name,
				"sort" : 1,			// folder : 1, project : 2
				"type" : "folder",	// type : folder / project
				"owner" : gap.userinfo.rinfo,
				"readers" : readers	//gap.search_cur_em()
			};
		
		if (is_update){
			postData.key = code;	//obj._id.$oid;
			postData.email = gap.search_cur_em();
		}
		
		var surl = gap.channelserver + "/" + (is_update ? "modify_folder_todo.km" : "make_folder_todo.km");
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text",
			data : JSON.stringify(postData),
			success : function(ress){
				var res = JSON.parse(ress);
				if (res.result == "OK"){
					
					gBodyM.mobile_close_layer('create_channel_layer');
					var url_link = "kPortalMeet://NativeCall/callCloseLayer?done=yes";
					gBodyM.connectApp(url_link);
					return false;
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;						
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;					
			}
		});
	},
	
	"project_layer_html" : function(is_update){
		var html = '';

	//	html += '<h2>' + (is_update ? gap.lang.todo_update_project : gap.lang.todo_create_project) + '</h2>';
		html += '<div class="wrap drive-create">';
		html += '	<div class="input-field">';
		html += '		<input type="text" class="formInput" id="input_project_name" placeholder="">';
		html += '		<label for="input_project_name">' + gap.lang.todo_project_name + '</label>';
		html += '		<span class="bar"></span>';
		html += '	</div>';
		html += '	<div class="input-field">';
		html += '		<input type="text" class="formInput" id="input_project_comment" placeholder="">';
		html += '		<label for="input_project_comment">' + gap.lang.todo_project_comment + '</label>';
		html += '		<span class="bar"></span>';
		html += '	</div>';
		html += '	<div class="input-field">';
		html += '		<input type="text" class="formInput" id="input_project_user">';
		html += '		<label for="input_project_user">' + gap.lang.invite_user + '</label>';
		html += '		<span class="bar"></span>';
		html += '		<button class="btn-txt-search" id="search_user"><span>' + gap.lang.search + '</span></button>';
		html += '	</div>';
		html += '	<ul id="project_member_list">';
		html += '	</ul>';
		html += '	<div class="same-name" style="top:206px; display:none;" id="same_name_list">';
		html += '	</div>';	
		
		html += '</div>';
		
		return html;
	},
	
	"create_project" : function(_pcode, _fcode){
		/*
		 * 일반 프로젝트 생성 시 			: gTodoM.create_project()
		 * 특정폴더 아래에 프로젝트 생성 시 	: gTodoM.create_project(null, folderkey)
		 * 프로젝트 수정 시				: gTodoM.create_project(_id.$oid, folderkey)
		 */
		var is_update = (_pcode != undefined ? true : false);
		var folderkey = (_fcode != undefined ? _fcode : "");
	
		var html = gTodoM.project_layer_html(is_update);
		$("#create_channel_layer").html(html);
		
		// folderkey 값 예외처리
		if (folderkey == '(null)'){
			folderkey = "";
		}
		
		if (is_update){
			//프로젝트 정보 update인 경우
			
			var surl = gap.channelserver + "/search_folder_todo.km";
			var postData = {
					"key" : _pcode,
					"email" : gap.search_cur_em()
				};			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){
						gTodoM.cur_project_info = res.data;
						var obj = res.data;
						folderkey = obj.folderkey;
						
						$("#input_project_name").val(obj.name);
						$("#input_project_name").parent().find("label").addClass("on");
						$("#input_project_name").focus();
						
						if (obj.comment != ""){
							$("#input_project_comment").val(obj.comment);
							$("#input_project_comment").parent().find("label").addClass("on");
						}
						
						for (var i = 0; i < obj.member.length; i++){
						//	gTodoM.todo_add_user("P", obj.member[i]);	//20211104
							gTodoM.todo_add_user(obj.member[i]);
						}							
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
		}
		
		$("#input_project_name").on("change", function(){
			if($(this).val() == ""){
				$(this).parent().find("label").removeClass("on");
			} else {
				$(this).parent().find("label").addClass("on");
			}
		});
		
		$("#input_project_comment").on("change", function(){
			if($(this).val() == ""){
				$(this).parent().find("label").removeClass("on");
			} else {
				$(this).parent().find("label").addClass("on");
			}
		});			
		
		$("#search_user").on("click", function(){
			$("#same_name_list").empty();
			$("#same_name_list").hide();
			if ($("#input_project_user").val().trim() == ""){
				gap.gAlert(gap.lang.input_invite_user);
				return;
			}
			gTodoM.todo_user_search( $("#input_project_user").val() );			
		});
		
		$("#input_project_user").keydown(function(evt){
			if (evt.keyCode == 13){
				$("#same_name_list").empty();
				$("#same_name_list").hide();
				if ($("#input_project_user").val().trim() == ""){
					gap.gAlert(gap.lang.input_invite_user);
					return;
				}
				gTodoM.todo_user_search( $("#input_project_user").val() );
			}else{
				$("#same_name_list").empty();
				$("#same_name_list").hide();
			}

		}).on("change", function(){
			if($(this).val() == ""){
				$(this).parent().find("label").removeClass("on");
			} else {
				$(this).parent().find("label").addClass("on");
			}
		});		
		
		$("#create_project_btn").on("click", function(){

		});
		
		gBodyM.mobile_open_layer('create_channel_layer');
		gBodyM.mobile_finish();
	},
	
	"create_project_action" : function(_pcode, _fcode){
		/*
		 * 프로젝트 생성/수정
		 */
		var is_update = (_pcode != undefined ? true : false);
		var folderkey = (_fcode != undefined ? _fcode : "");
		
		if ($("#input_project_name").val().trim() == ""){
			gap.gAlert(gap.lang.input_projectname);
			return;
		}
		
		var readers = [];
		var user_list = [];
		var user_ky_list = [];
		var new_member_ky = "";
		
		var project_name = $("#input_project_name").val();
		var project_comment = $("#input_project_comment").val();
		var member_count = $("#project_member_list").children().length;
		
		readers.push(gap.search_cur_em());
		for(var i = 0; i < member_count; i++){
			var user_info = JSON.parse( $("#project_member_list").children().eq(i).attr("data-user") );
			readers.push(user_info.em);
			user_list.push(user_info);
			user_ky_list.push(user_info.ky);
		}
		var postData = {
				"name" : project_name,
				"comment" : project_comment,
				"sort" : 2,			// folder : 1, project : 2
				"type" : "project",	// type : folder / project
				"folderkey" : folderkey,
				"owner" : gap.userinfo.rinfo,
				"readers" : readers,	//readers.join(" "),
				"member" : user_list
			};
		
		if (is_update){
			postData.key = _pcode;		//obj._id.$oid;
			postData.email = gap.search_cur_em();
			
			var pre_member_ky = $.map(gTodoM.cur_project_info.member, function(ret, key) {
				return ret.ky;
			});
			new_member_ky = $(user_ky_list).not(pre_member_ky);
		}
		
		var surl = gap.channelserver + "/" + (is_update ? "modify_folder_todo.km" : "make_folder_todo.km");
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text",
			data : JSON.stringify(postData),
			success : function(ress){
				var res = JSON.parse(ress);
				if (res.result == "OK"){
					if (is_update){
						////// PC Web Push 날린다 ///////////////////////////////
						var info = res.data.project_info;
//						for (var i = 0 ; i < new_member_ky.length; i++){
//							var xp = new_member_ky[i];
//							
//						}
						if (new_member_ky.length > 0){
							var obj = new Object();
							obj.id = "";
							obj.type = "invite";  //change status
							obj.p_code = info._id.$oid;
							obj.p_name = gap.textToHtml(info.name);
							obj.title = info.name;
							obj.sender = new_member_ky;  //해당 프로젝트의 owner에게만 전송한다.							
							//_wsocket.send_todo_msg(obj);
							gBodyM.send_box_msg(obj, 'todo');
						}
						
												
						//모바일  Push를 날린다. ///////////////////////////////////
						if (new_member_ky.length > 0){
							var new_member_ky_list = [];
							for (var j = 0; j < new_member_ky.length; j++){
								new_member_ky_list.push(new_member_ky[j]);
							}

							var smsg = new Object();
							smsg.msg = "[" + gap.textToHtml(info.name) + "] " + gap.lang.miv;
							smsg.title = gTodoM.systitle + "["+gTodoM.todo_title+"]";			
							smsg.type = "todo";
							smsg.key1 = info._id.$oid;
							smsg.key2 = "";
							smsg.key3 = "";
							smsg.fr = gap.userinfo.rinfo.nm;
							smsg.sender = new_member_ky_list.join("-spl-");										
							//gap.push_noti_mobile(smsg);	
							
							//알림센터에 푸쉬 보내기
							var rid = info._id.$oid;
							var receivers = new_member_ky_list;
							var msg2 = "[" + gap.textToHtml(info.name) + "] " + gap.lang.miv;
							var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(info.name) +"]"
							var data = smsg;
							gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
						}
						////////////////////////////////////////////////////
						
					}else{
						////// PC Web Push 날린다 ///////////////////////////////
						var info = res.data.project_info;
						var list = user_ky_list;
//						for (var i = 0 ; i < list.length; i++){
//							var xp = list[i];
//							
//						}
						if (list.length > 0){
							var obj = new Object();
							obj.id = "";
							obj.type = "invite";  //change status
							obj.p_code = info._id.$oid;
							obj.p_name = gap.textToHtml(info.name);
							obj.title = info.name;
							obj.sender = list;  //해당 프로젝트의 owner에게만 전송한다.							
							//_wsocket.send_todo_msg(obj);
							gBodyM.send_box_msg(obj, 'todo');
						}
						
												
						//모바일  Push를 날린다. ///////////////////////////////////	
						if (list.length > 0){
							var smsg = new Object();
							smsg.msg = "[" + gap.textToHtml(info.name) + "] " + gap.lang.miv;
							smsg.title = gTodoM.systitle + "["+gTodoM.todo_title+"]";		
							smsg.type = "todo";
							smsg.key1 = info._id.$oid;
							smsg.key2 = "";
							smsg.key3 = "";
							smsg.fr = gap.userinfo.rinfo.nm;
							//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
							smsg.sender = list.join("-spl-");										
						//	gap.push_noti_mobile(smsg);			
							
							//알림센터에 푸쉬 보내기
							var rid = info._id.$oid;
							var receivers = list;
							var msg2 = "[" + gap.textToHtml(info.name) + "] " + gap.lang.miv;
							var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(info.name) +"]"
							var data = smsg;
							gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
						}
						
						////////////////////////////////////////////////////

					}

					
					
					gBodyM.mobile_close_layer('create_channel_layer');
					var url_link = "kPortalMeet://NativeCall/callCloseLayer?done=yes&title=" + encodeURIComponent(info.name);
					gBodyM.connectApp(url_link);
					return false;
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;						
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;					
			}
		});		
	},
	
	"todo_user_search" : function(str){
		/*
		 * 프로젝트 생성 화면에서 사용자 검색
		 */
		$("#input_project_user").val("");
		
		var surl = gap.channelserver + "/search_user.km";
		var postData = {
				"name" : str,
				"companycode" : ""
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				var info = res;
				if (info.length == 0){
					gap.gAlert(gap.lang.searchnoresult);
					return false;
					
				}
				
				if (info.length > 1){
					//동명이인이 있는 경우
					var _html = '<ul id="same_name_list_ul"></ul>';
					$("#same_name_list").html(_html);
					
					for (var i = 0; i < info.length; i++){
						var user = info[i];
						var name = user.nm;
						var dept = user.dp;
						var pos = user.jt;
						var notesid = user.ky;
						var empno = user.emp;
						/*var photo_url = "";
						if (user.pu == ""){
							photo_url = "https://meet.kmslab.com/photo/none.jpg";
						}else{
							photo_url = user.pu;
						}*/
						var person_img = gap.person_profile_uid(notesid);
						var html = '';
						
					//	var	html = "<li style='cursor:pointer' id='uschres_" + empno + "'><a>" + name + " / " + dept + " / " + pos + "</a></li>";
						
						html += '<li id="uschres_' + empno + '">'
						html += '	<div class="invite-user">';
						html += '		<div class="user">';
						html += '			<div class="user-thumb">' + person_img + '</div>';
						html += '		</div>';
						html += '		<dl>';
						html += '			<dt>' + name + '</dt>';
						html += '			<dd>' + dept + '</dd>';
						html += '		</dl>';
						html += '	</div>';
						html += '</li>'
						
						$("#same_name_list_ul").append(html);
						$("#uschres_" + empno).bind("click", user, function(event) {
							gTodoM.todo_list_user(event.data);
						});
					}
					$("#same_name_list").show();
				
				}else{
					//결과가 1명인 경우				
					if (info[0].em.toLowerCase() == gap.userinfo.rinfo.em.toLowerCase()){
						gap.gAlert(gap.lang.me_not_add_invite_user);
						return false;
					}else{
						gTodoM.todo_add_user(info[0]);
					}					
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},
	
	"todo_list_user" : function(obj){
		$("#same_name_list").hide();
		if (obj.em.toLowerCase() == gap.userinfo.rinfo.em.toLowerCase()){
			gap.gAlert(gap.lang.me_not_add_invite_user);
			return false;

		}else{
			gTodoM.todo_add_user(obj);
		}
	},	
	
	"todo_add_user" : function(obj){
		/*
		 * 검색된 사용자 화면에 추가
		 */
		if (obj == undefined){
			gap.gAlert(gap.lang.searchnoresult);
			return false;
		}
		var id = obj.ky;
		var len = $("#project_member_list #member_" + obj.emp).length;
		
		if (len > 0){
			gap.gAlert(gap.lang.existuser);
			return false;
		}
		
		/*var photo_url = "";
		if (obj.pu == ""){
			photo_url = "https://meet.kmslab.com/photo/none.jpg";
		}else{
			photo_url = obj.pu;
		}*/
		var person_img = gap.person_profile_uid(id);
		
		var html = "";
		html += '<li id="member_' + obj.emp + '" style="list-style:none;">'
		html += '	<div class="invite-user">';
		html += '		<div class="user">';
		html += '			<div class="user-thumb">' + person_img + '</div>';
		html += '		</div>';
		html += '		<dl>';
		html += '			<dt>' + obj.nm + '</dt>';
		html += '			<dd>' + obj.dp + '</dd>';
		html += '		</dl>';
		html += '		<button class="ico btn-del1" onClick="gTodoM.todo_delete_user(this)">삭제</button>';
		html += '	</div>';
		html += '</li>'
		
		$("#project_member_list").append($(html));
		
		if ($(document).height() > $(window).height()){
			$(".drive-create").height('100%');
		}
				
		delete obj['_id'];
		$("#member_" + obj.emp).attr('data-user', JSON.stringify(obj));
	},
	
	"todo_delete_user" : function(obj){
		/*
		 * 프로젝트 생성화면에서 추가된 사용자 삭제
		 */
		var id = $(obj).parent().parent().attr("id");
		$("#" + id).remove();
	},

	"draw_exit_info_list" : function(){
		/*
		 * 나간 프로제트 목록
		 */
		var html = '';
		html += '<div class="wrap list list-exit">';
		html += '	<ul id="exit_info_list">';
		html += '	</ul>';
		html += '</div>';
		
		$("#exit_info_layer").html(html);

		//나간 프로젝트 가져오기
		var surl = gap.channelserver + "/release_list_todo.km";
		var postData = JSON.stringify({
				"email" : gap.search_cur_em()
			});		

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			success : function(res){
				if (res.result == "OK"){
					for (var i = 0; i < res.data.data.length; i++){
						var _info = res.data.data[i];
						var _status = gTodoM.get_todo_progress_ststus(_info);
						var _html = '';
						_html += '<li>';
						_html += '	<div class="status"><span class="ico ico-' + _status + '"></span></div>';
						_html += '	<dl>';
						_html += '		<dt><strong>' + _info.name + '</strong></dt>';
						_html += '	</dl>';
						_html += '	<button class="btn-entry" id="enter_' + _info._id.$oid + '"><span>' + gap.lang.enter + '</span></button></div>';
						_html += '</li>';
						$("#exit_info_list").append(_html);

						//등러가기 버튼 클릭
						$("#enter_" + _info._id.$oid).bind("click", _info, function(event){
							var msg = gap.lang.confirm_enter;
							$.confirm({
								title : "Confirm",
								content : msg,
								type : "default",  
								closeIcon : true,
								closeIconClass : "fa fa-close",
								columnClass : "s", 			 				
								animation : "top", 
								animateFromElement : false,
								closeAnimation : "scale",
								animationBounce : 1,	
								backgroundDismiss: false,
								escapeKey : false,
								buttons : {		
									confirm : {
										keys: ['enter'],
										text : gap.lang.OK,
										btnClass : "btn-default",
										action : function(){
											gTodoM.enter_info(event.data);
										}
									},
									cancel : {
										keys: ['esc'],
										text : gap.lang.Cancel,
										btnClass : "btn-default",
										action : function(){
										}
									}
								}		 			
							});								
						});
					}
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});

		gBodyM.mobile_open_layer('exit_info_layer');
	},
	
	"enter_info" : function(_info, _ty){
		/*
		 * 나간 프로젝트 들어가기
		 */
		var surl = gap.channelserver + "/enter_folder_todo.km";
		var postData = JSON.stringify({
				"key" : _info._id.$oid,
				"email" : gap.search_cur_em(),
				"owner" : gap.userinfo.rinfo
			});			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			success : function(res){
				if (res.result == "OK"){
					gBodyM.mobile_close_layer('exit_info_layer');
					var url_link = "kPortalMeet://NativeCall/callCloseLayer?done=yes";
					gBodyM.connectApp(url_link);
					return false;					
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},	
	
	"get_todo_progress_ststus" : function(info){
		var _res = "";
		if (info.count_0 == undefined){
			_res = "wait";
			
		}else{
			if (info.count_4 > 0){
				_res = "delay";
				
			}else if (info.count_1 > 0 || (info.count_1 == 0 && info.count_2 == 0 && info.count_3 == 0 && info.count_4 == 0)){
				_res = "wait";
				
			}else if (info.count_2 > 0){
				_res = "continue";
				
			}else if (info.count_1 == 0 && info.count_2 == 0 && info.count_4 == 0){
				_res = "complete";
			}
		}
		return _res;
	},
	
	"delete_folder" : function(_id){
		var surl = gap.channelserver + "/delete_folder_todo.km";
		var postData = {
				"key" : _id,
				"email" : gap.search_cur_em()
			};

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
			},
			error : function(e){
			}
		});	
	},
	
	"exit_project" : function(_id){
		var surl = gap.channelserver + "/release_folder_todo.km";
		var postData = {
				"key" : _id,
				"email" : gap.search_cur_em()
			};

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
			},
			error : function(e){
			}
		});				
	},
	
	"update_todo_star" : function(_type, _id){
		// 왼쪽 즐겨찾기 더보기 메뉴에서 즐겨찾기 등록/해제 
		var selected_info = "";
		for (var i = 0; i < gBody.cur_todo_list.length; i++){
			var item = gBody.cur_todo_list[i];
			if (_id == item._id.$oid){
				selected_info = item;
				break;
			}
		}
		
		var surl = gap.channelserver + "/update_folder_favorite_todo.km";
		var postData = JSON.stringify({
				"email" : gap.userinfo.rinfo.em,
				"project_code" : selected_info._id.$oid,
				"project_name" : selected_info.name,
				"ty" : _type
			});			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			success : function(res){
				if (res.result == "OK"){
					if (_id == gTodo.cur_todo_code){
						// 트리에서 클릭한 프로젝트 코드와 오른쪽에 오픈된 프로젝트 코드가 동일할 경우
						if (_type == "add"){
							$("#todo_top_favorite_btn").addClass("on");
							
						}else{
							$("#todo_top_favorite_btn").removeClass("on");
						}
					}
					
					gTodoC.draw_favorite_list(_type, selected_info);
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});			
		
	},	
	
	
	
	
	
	
	
	
	
	
	
	"load_todo" : function(project_code, bun, is_mention){
		//gap.gAlert(">> " + project_code + " / bun >> " + bun);
		
		gBodyM.all_close_layer();
		gap.cur_window = "enter_project";
		
		var html = '';
		
		html += '<div class="wrap">';
		
//		html += '	<ul class="tabs todo-tabs" id="todo_status_tab">';
//	//	html += "		<li class='tab'><a href='#' id='tab0'>" + gap.lang.temps + "</a></li>";
//		html += "		<li class='tab'><a href='#' id='tab1'>" + gap.lang.wait + "</a></li>";
//		html += "		<li class='tab'><a href='#' id='tab2'>" + gap.lang.doing + "</a></li>";
//		html += "		<li class='tab'><a href='#' id='tab3'>" + gap.lang.done + "</a></li>";
//		html += "		<li class='tab'><a href='#' id='tab5'>" + gap.lang.archive + "</a></li>";
//		html += "		<li class='tab'><a href='#' id='tab6'>" + gap.lang.favorite + "</a></li>";
//		html += '		<li class="indicator" style="min-width: 70px; max-width: 70px; right: 221px; left: 0px;"></li>';
//		html += '	</ul>';
		
		
		html += "<div class='chat-bx-wrap wr_pb work-up' style='margin-left:5px'> ";
		html += "<!-- 활성화시 class on추가 -->";
		html += "	<ul class='btn_staus flex' id='todo_status_tab'>";
//		html += "		<li id='tab0'>" + gap.lang.temps + "</li>";
		html += "		<li class='on' id='tab1'>" + gap.lang.wait + "</li>";
		html += "		<li id='tab2'>" + gap.lang.doing + "</li>";
		html += "		<li id='tab3'>" + gap.lang.done + "</li>";
		html += "		<li id='tab5'>" + gap.lang.archive + "</li>";
		html += "		<li id='tab6'>" + gap.lang.favorite + "</li>";
		html += "	</ul>";
		html += "</div>";
		
		
		
		html += '	<section style="width:100%; height:100%; padding: 0 2rem 0 2rem;" id="todo_section">';
		html += '		<div class="input-field" id="add_todo" >';
		html += '		</div>';
		html += '		<div class="todo-card">';
		html += '			<!-- ';
		html += '				우선순위 아이콘 ';
		html += '				.p1 : 매우높음';
		html += '				.p2 : 높음';
		html += '				.p3 : 보통';
		html += '				.p4 : 낮음';
		html += '				.p5 : 매우낮음';
		html += '			-->';
		html += '			<ul class="card" id="todo_card_list" style="list-style:none">';
		html += '			</ul>';
		html += '		</div>';
		html += '	</section>';
		html += '</div>';
		
		$("#dis").html(html);
		gTodoM.draw_add_todo_html();
		
		if (typeof is_mention != "undefined" && is_mention == "T"){
			$("#todo_status_tab").hide();
			$("#add_todo").hide();
			gTodoM.cur_project_code = project_code;
			gTodoM.draw_todo_mention(1);
			
		}else if (bun == "5" || bun == "6"){
			// 아카이브, 즐겨찾기 클릭 시
			gTodoM.cur_project_code = project_code;
			gTodoM.__draw_todo_tab_event();
			$("#tab" + bun).click();
			
		}else{
			var surl = gap.channelserver + "/list_item_todo.km";
			var postData = {
					"project_code" : project_code,
					"email" : gap.search_cur_em_sec()
				};			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){
						gBodyM.mobile_finish();
						
						gTodoM.cur_project_item_list = res.data.data;
						gTodoM.cur_project_info = res.data.project_info;
						gTodoM.cur_project_name = res.data.project_info.name;
						gTodoM.cur_project_code = res.data.project_info._id.$oid;
						
						if (typeof(bun) == "undefined"){
							bun = "1";
						}
						
						gTodoM.draw_todo_list(bun);
						gTodoM.__draw_todo_tab_event();
						$("#tab" + bun).click();
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
		}
	},
	
	
	"draw_add_todo_html" : function(){
		var html = '';
		html += '<input type="text" class="formInput" placeholder="+ ' + gap.lang.addtodo + '" />';
		html += '<span class="bar"></span>';
		
		$("#add_todo").html(html);
	},
	
	/*
	 * param :
	 * 	- opt		>>> 1 : 나에게 할당된 업무, 2 : 내가 지시한 업무
	 * 	- status	>>> 1 : 대기, 2 : 진행, 3 : 완료, 4 : 지연
	 */
	"load_todo_status" : function(opt, status){
		gBodyM.all_close_layer();
		gTodoM.cur_tab_status = "";
		gap.cur_window = "enter_status";
		gTodoM.todo_opt = opt;
		gTodoM.todo_status = status;

		var surl = gap.channelserver + "/status_search_mobile.km";
		var postData = {
				/*"project_code" : project_code,*/
				"email" : gap.userinfo.rinfo.em,
				"opt" : opt,
				"status" : status
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					gBodyM.mobile_finish();
					
					gTodoM.cur_project_item_list = res.data.data;
				//	gTodoM.cur_project_info = res.data.project_info;
				//	gTodoM.cur_project_name = res.data.project_info.name;
				//	gTodoM.cur_project_code = res.data.project_info._id.$oid;
					
					gTodoM.draw_todo_status_list();
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});				
	},	
	
	"load_todo_mention" : function(){
		gBodyM.all_close_layer();
		gap.cur_window = "enter_project";
		
		var html = '';
		
		html += '<div class="wrap">';
		html += '	<section style="width:100%; height:100%; padding: 0 2rem 0 2rem;" id="todo_section">';
		html += '		<div class="todo-card">';
		html += '			<ul class="card" id="todo_card_list" style="list-style:none">';
		html += '			</ul>';
		html += '		</div>';
		html += '	</section>';
		html += '</div>';
		
		$("#dis").html(html);

		gTodoM.cur_project_code = "";
		gTodoM.draw_todo_mention(1);		
	},

	"draw_todo_list" : function(status){
		
		if (gTodoM.cur_project_item_list == ""){
			var surl = gap.channelserver + "/list_item_todo.km";
			var postData = {
					"project_code" : gTodoM.cur_project_code,
					"email" : gap.search_cur_em_sec()
				};			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){
						gTodoM.cur_project_item_list = res.data.data;
						gTodoM.cur_project_info = res.data.project_info;
						gTodoM.cur_project_name = res.data.project_info.name;
						gTodoM.cur_project_code = res.data.project_info._id.$oid;
						
						gTodoM.draw_todo_card_html(status);
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
			
		}else{
			gTodoM.draw_todo_card_html(status);
		}
	},
	
	"draw_todo_card_html" : function(status){
		gTodoM.cur_tab_status = status;
		var html = '';

		for (var i = 0; i < gTodoM.cur_project_item_list.length; i++){
			var info = gTodoM.cur_project_item_list[i];
			html += gTodoM.make_todo_card(info, status);
		}
		
		$("#todo_card_list").html(html);
		
	//	gTodoM.__draw_todo_event();
		gTodoM.__draw_todo_click_event();
	},
	
	"load_todo_archive" : function(){
		var html = "";
		html += "<div class='todo-option' style='margin-top:0;'>";
		html += "	<div class='todo-align'>";
		html += "		<div class='selectbox'>";
		html += "			<select id='todo_project_select'>";
		html += "			</select>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";
		$("#add_todo").html(html);
		
		if (gTodoM.todo_project_list == ""){
		//	var surl = gap.channelserver + "/folder_list_todo.km";
			var surl = gap.channelserver + "/channel_info_list.km";
			var postData = JSON.stringify({
					email : gap.userinfo.rinfo.ky,
					depths : fulldeptcode
				});		

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				data : postData,
				success : function(res){
				
					//gTodoM.todo_project_list = res.data.data;
					
					var list = [];
					for (var i = 0 ; i < res.length; i++){
						var item = res[i];
						if (item.type != "folder"){
							list.push(item);
						}
					}
					gTodoM.todo_project_list = list;
					gTodoM.draw_todo_project_select(gTodoM.todo_project_list, 'archive');
					gTodoM.draw_todo_archive(1);
				},
				error : function(e){
				}
			});
			
		}else{
			gTodoM.draw_todo_project_select(gTodoM.todo_project_list, 'archive');
			gTodoM.draw_todo_archive(1);
		}
	},
	
	"draw_todo_project_select" : function(_data, _type){
		var _h = "";
		_h += "<option value='" + ( _type == "archive" ? "all" : "" ) + "'>" + gap.lang.All + "</option>";
		for (var i = 0; i < _data.length; i++){
			var item = _data[i];
			//if (item.type == "project"){
				_h += "<option value='" + item._id.$oid + "'>" + item.ch_name + "</option>";
			//}
		}
		$("#todo_project_select").html(_h).val( _type == "archive" ? gTodoM.cur_project_code : "").material_select();
		
		$("#todo_project_select").off();
		$("#todo_project_select").on("change", function(e){
			if (_type == "archive"){
				gTodoM.draw_todo_archive(1);
				
			}else{
				gTodoM.draw_todo_star(1);
			}
		});
	},
	
	"draw_todo_archive" : function(page_no){
		if (page_no == "1"){
			$("#todo_card_list").empty();
		}

		gTodoM.todo_archive_count = 0;
		gTodoM.todo_archive_total_count = 0;			
		gTodoM.start_skp = (parseInt(gTodoM.per_page) * (parseInt(page_no))) - (parseInt(gTodoM.per_page) - 1);
		
		var project_code = $("#todo_project_select").val();
		var surl = gap.channelserver + "/search_archive_todo.km";
		var postData = JSON.stringify({
				"project_code" : (project_code == null ? "all" : project_code),
				"email" : gap.userinfo.rinfo.ky,
				"perpage" : gTodoM.per_page,
				"start" : gTodoM.start_skp - 1,
				"q_str" : ""
			});			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			success : function(res){
				if (res.result == "OK"){
					gTodoM.todo_archive_count += res.data.data.length;
					gTodoM.todo_archive_total_count = res.data.totalcount;
					gTodoM.draw_todo_archive_list(page_no, res.data.data);			
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});					
	},
	
	"draw_todo_archive_list" : function(page_no, res){
		gTodoM.cur_tab_status = '5';
		
		var html = '';
		var _data = res;
		
		for (var i = 0; i < _data.length; i++){
			var info = _data[i];
			html += gTodoM.make_todo_card(info, '4');
		}
		
		$("#todo_card_list").append(html);
		
		gTodoM.__draw_todo_click_event();
		
		$(window).scroll(function(){
			if($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
				if (!gTodoM.scroll_bottom) {
					gTodoM.scroll_bottom = true;
					gTodoM.add_todo_archive_data_list(page_no + 1);
					
				}else{
					gTodoM.scroll_bottom = false;
				}
			}
		});
	},
	
	"add_todo_archive_data_list" : function(page_no){
		if (gTodoM.todo_archive_total_count > gTodoM.todo_archive_count){
			gTodoM.start_skp = (parseInt(gTodoM.per_page) * (parseInt(page_no))) - (parseInt(gTodoM.per_page) - 1);
			
			var project_code = $("#todo_project_select").val();
			var surl = gap.channelserver + "/search_archive_todo.km";
			var postData = JSON.stringify({
					"project_code" : (project_code == null ? "all" : project_code),
					"email" : gap.userinfo.rinfo.em,
					"perpage" : gTodoM.per_page,
					"start" : gTodoM.start_skp - 1,
					"q_str" : ""
				});			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : postData,
				success : function(res){
					if (res.result == "OK"){
						gTodoM.todo_archive_count += res.data.data.length;
						gTodoM.todo_archive_total_count = res.data.totalcount;
						gTodoM.draw_todo_archive_list(page_no, res.data.data);			
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});			
		}
	},	
	
	
	"load_todo_star" : function(){
		var html = "";
		html += "<div class='todo-option' style='margin-top:0;'>";
		html += "	<div class='todo-align'>";
		html += "		<div class='selectbox'>";
		html += "			<select id='todo_project_select'>";
		html += "			</select>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";
		$("#add_todo").html(html);
		
		if (gTodoM.todo_project_list == ""){
			var surl = gap.channelserver + "/channel_info_list.km";
			var postData = JSON.stringify({
					email : gap.userinfo.rinfo.ky,
					depths : fulldeptcode
				});			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				data : postData,
				success : function(res){
					//gTodoM.todo_project_list = res.data.data;
					
					var list = [];
					for (var i = 0 ; i < res.length; i++){
						var item = res[i];
						if (item.type != "folder"){
							list.push(item);
						}
					}
					gTodoM.todo_project_list = list;
					gTodoM.draw_todo_project_select(gTodoM.todo_project_list, 'star');
					gTodoM.draw_todo_star(1);
				},
				error : function(e){
				}
			});
			
		}else{
			gTodoM.draw_todo_project_select(gTodoM.todo_project_list, 'star');
			gTodoM.draw_todo_star(1);
		}		
	},
	
	"draw_todo_star" : function(page_no){
		if (page_no == "1"){
			$("#todo_card_list").empty();
		}

		gTodoM.todo_star_count = 0;
		gTodoM.todo_star_total_count = 0;			
		gTodoM.start_skp = (parseInt(gTodoM.per_page) * (parseInt(page_no))) - (parseInt(gTodoM.per_page) - 1);
		
		var project_code = $("#todo_project_select").val();
		var surl = gap.channelserver + "/search_favorite_todo.km";
		var postData = JSON.stringify({
				"project_code" : project_code,
				"email" : gap.userinfo.rinfo.ky,
				"perpage" : gTodoM.per_page,
				"start" : gTodoM.start_skp - 1
			});			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			success : function(res){
				if (res.result == "OK"){
					gTodoM.todo_star_count += res.data.data.length;
					gTodoM.todo_star_total_count = res.data.totalcount;
					gTodoM.draw_todo_star_list(page_no, res.data.data);			
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},
	
	"draw_todo_star_list" : function(page_no, res){
		gTodoM.cur_tab_status = '6';
		
		var html = '';
		var _data = res;

		for (var i = 0; i < _data.length; i++){
			var info = _data[i];
			html += gTodoM.make_todo_card(info, '6');
		}
		
		$("#todo_card_list").append(html);
		
		gTodoM.__draw_todo_click_event();
		
		$(window).scroll(function(){
			if($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
				if (!gTodoM.scroll_bottom) {
					gTodoM.scroll_bottom = true;
					gTodoM.add_todo_star_data_list(page_no + 1);
					
				}else{
					gTodoM.scroll_bottom = false;
				}
			}
		});
	},
	
	"add_todo_todo_data_list" : function(page_no){
		if (gTodoM.todo_star_total_count > gTodoM.todo_star_count){
			gTodoM.start_skp = (parseInt(gTodoM.per_page) * (parseInt(page_no))) - (parseInt(gTodoM.per_page) - 1);
			
			var project_code = $("#todo_project_select").val();
			var surl = gap.channelserver + "/search_favorite_todo.km";
			var postData = JSON.stringify({
					"project_code" : project_code,
					"email" : gap.userinfo.rinfo.em,
					"perpage" : gTodoM.per_page,
					"start" : gTodoM.start_skp - 1
				});			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : postData,
				success : function(res){
					if (res.result == "OK"){
						gTodoM.todo_star_count += res.data.data.length;
						gTodoM.todo_star_total_count = res.data.totalcount;
						gTodoM.draw_todo_star_list(page_no, res.data.data);			
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});		
		}
	},	
	
	
	"draw_todo_status_list" : function(){
		var temp_list = [];
		var wait_list = [];
		var doing_list = [];
		var done_list = [];
		var delay_list = [];
		var html = '';
		
		if (gTodoM.cur_project_item_list.length == 0){
			var no_todo_html = '';
			no_todo_html += '<div class="wrap box-empty">';
			no_todo_html += '	<dl>';
			no_todo_html += '		<dt><span class="ico no-box"></span></dt>';
			no_todo_html += '		<dd>' + gap.lang.no_todo_list + '</dd>';
			no_todo_html += '	</dl>';
			no_todo_html += '</div>';
			
			$("#dis").html(no_todo_html);			
			return false;
		}
		
		for (var i = 0; i < gTodoM.cur_project_item_list.length; i++){
			var item = gTodoM.cur_project_item_list[i];
			
			if (item.status == "0"){
				temp_list.push(item);
				
			}else if (item.status == "1"){
				wait_list.push(item);
				
			}else if (item.status == "2"){
				doing_list.push(item);
				
			}else if (item.status == "3"){
				done_list.push(item);
			
			}else if (item.status == "4"){
				delay_list.push(item);

			}
		}
		
		html += '<div class="wrap">';
		html += '	<section style="width:100%; height:100%; padding: 0 2rem 0 2rem;">';
		
		if (temp_list.length > 0){
			html += '		<div class="todo-list-status" >';
			html += '			<h2>' + gap.lang.temps + '(' + temp_list.length + ')</h2>';
			html += '			<ul class="card" id="todo_card_list" style="list-style:none">';
			
			for (var a = 0; a < temp_list.length; a++){
				var info = temp_list[a];
				html += gTodoM.make_todo_card(info, '0');
			}
			
			html += '			</ul>';
			html += '		</div>';
		}
		
		if (wait_list.length > 0){
			html += '		<div class="todo-list-status" >';
			html += '			<h2>' + gap.lang.wait + '(' + wait_list.length + ')</h2>';
			html += '			<ul class="card" id="todo_card_list" style="list-style:none">';
			
			for (var a = 0; a < wait_list.length; a++){
				var info = wait_list[a];
				html += gTodoM.make_todo_card(info, '1');
			}
			
			html += '			</ul>';
			html += '		</div>';
		}
		
		if (doing_list.length > 0){
			html += '		<div class="todo-list-status" >';
			html += '			<h2>' + gap.lang.doing + '(' + doing_list.length + ')</h2>';
			html += '			<ul class="card" style="list-style:none">';
			
			for (var b = 0; b < doing_list.length; b++){
				var info = doing_list[b];
				html += gTodoM.make_todo_card(info, '2');
			}
			
			html += '			</ul>';
			html += '		</div>';
		}		

		if (done_list.length > 0){
			html += '		<div class="todo-list-status" >';
			html += '			<h2>' + gap.lang.done + '(' + done_list.length + ')</h2>';
			html += '			<ul class="card" style="list-style:none">';
			
			for (var c = 0; c < done_list.length; c++){
				var info = done_list[c];
				html += gTodoM.make_todo_card(info, '3');
			}
			
			html += '			</ul>';
			html += '		</div>';
		}	
		
		
		if (delay_list.length > 0){
			html += '		<div class="todo-list-status">';
			html += '			<h2>' + gap.lang.delay + '(' + delay_list.length + ')</h2>';
			html += '			<ul class="card" style="list-style:none">';
			
			for (var d = 0; d < delay_list.length; d++){
				var info = delay_list[d];
				html += gTodoM.make_todo_card(info, '4');
			}
			
			html += '			</ul>';
			html += '		</div>';
		}			
		

		
		html += '	</section>';
		html += '</div>';
		
		$("#dis").html(html);
		
		gTodoM.__draw_todo_event();
	},
	
	"make_todo_card" : function(info, status){
		var html = '';
		var id = info._id.$oid;
		var item = gTodoM.code_change_status(info.status);
		var priority = info.priority;
		var is_delay = false;

		if (info.status == status || status == "6"){
			
			if (info.startdate && info.startdate != ""){
				var dinfo = gTodoM.date_diff(info.startdate, info.enddate);
				if (info.status != "3"){
					if (dinfo.rate > 100){
						is_delay = true;						
					}
				}
			}
			
			var asignee = "";
			var owner = info.owner.ky;
			/*
			if (typeof(info.asignee) != "undefined"){
				asignee = info.asignee.ky;
			}
			*/
			var _asignee = info.asignee;
			var edit_permission_list = [];
			if (_asignee != undefined && _asignee != ""){
				if (Array.isArray(_asignee)==false) {
					edit_permission_list.push(_asignee.ky);
				} else {
					for (i=0;i<_asignee.length;i++) {
						edit_permission_list.push(_asignee[i].ky);
					}
				}
			}

			if (info.project_owner != undefined && info.project_owner != ""){
				edit_permission_list.push(info.project_owner.ky);
			}else{
				edit_permission_list.push(gTodoM.cur_project_info.owner.ky);
			}
			
			asignee = edit_permission_list.join("{`");			
			
			if (is_delay){
				html += '<li id="' + id + '" class="delay" data="'+info.project_name+'" data-owner="'+owner+'" data-assignee="'+asignee+'">';
			}else{
				html += '<li id="' + id + '" data="'+info.project_name+'" data-owner="'+owner+'" data-assignee="'+asignee+'">';
			}

			html += '	<div class="color-bar ' + (info.color != undefined ? info.color : "") + '"></div> <!-- 사용자 지정색상  -->';
			if (status == "0" || status == "1" || status == "2" || status == "3"){
				// 임시저장 / 대기중 / 진행중 /완료 인 경우에만
				html += '	<button class="ico btn-more">더보기</button>';
				if (status != "0"){
					html += '	<div class="status"><span class="ico ico-' + item.style + '"></span></div>';	
				}
			}
			if (info.priority != undefined || priority == ""){
				if (status == "3"){
					html += '	<h3 style="text-decoration:line-through; color:#999"><span class="ico p' + priority + '"></span>' + info.title + '</h3> ';
				}else{
					html += '	<h3><span class="ico p' + priority + '"></span>' + info.title + '</h3> ';
				}
				
			}else{
				if (status == "3"){
					html += '	<h3 style="text-decoration:line-through; color:#999">' + info.title + '</h3> ';
				}else{
					html += '	<h3>' + info.title + '</h3> ';
				}
				
			}
			
			if (info.startdate && info.startdate != ""){
//				var dinfo = gTodoM.date_diff(info.startdate, info.enddate);
//				if (info.status != "3"){
//					if (dinfo.rate > 100){
//						is_delay = true;
//					}
//				}
				html += '	<div class="todo-period"><span><div class="bar" style="width:' + dinfo.rate + '%;"></div><em>' + dinfo.st + ' ~ ' + dinfo.et + ' (' + dinfo.term + 'day)</em></span></div>';
				
			}else{
				html += '	<div class="todo-period" style="display:none;"></div>';
			}
			
			if (info.tag && info.tag != ""){
				html += '	<div class="todo-tag">';
				for (var j = 0; j < info.tag.length; j++){
					html += '		<span>' + info.tag[j] + '</span>';
				}
				html += '	</div>';					
			}

			/*
			if (info.asignee && info.asignee != ""){
				var mp = info.asignee;
				var user_info = gap.user_check(mp);

				html += '	<div class="user">';
				html += '		<div class="user-thumb">' + user_info.user_img + '</div>';
				html += '		<dl>';
				html += '			<dt>' + user_info.name + gap.lang.hoching + '</dt>';
				html += '			<dd>' + user_info.jt + ' / ' + user_info.dept + '</dd>';
				html += '		</dl>';
				html += '	</div>';					
			}
			*/
			var user_info;
			var asignee_list = info.asignee;
			if (asignee_list!=undefined && asignee_list != ""){
				html += '	<div class="user">';
				if (Array.isArray(asignee_list)==false) {
					user_info = gap.user_check(asignee_list);
					html += '		<div class="user-thumb">' + user_info.user_img + '</div>';
					html += '		<dl>';
					html += '			<dt>' + user_info.name + gap.lang.hoching + '</dt>';
					html += '			<dd>' + user_info.jt + ' / ' + user_info.dept + '</dd>';
					html += '		</dl>';
				} else {
					for (i=0;i<asignee_list.length;i++) {
						user_info = gap.user_check(asignee_list[i]);
						
						//html += '	<div class="user-thumb-parent">';
						html += '		<div class="user-thumb">' + user_info.user_img + '</div>';
						html += '		<dl>';
						html += '			<dt>' + user_info.name + gap.lang.hoching + '</dt>';
						html += '			<dd>' + user_info.jt + ' / ' + user_info.dept + '</dd>';
						html += '		</dl>';
						//html += '	</div>';
					}
				}
				html += '	</div>';
			}			

			if (info.checklist.length == 0 && info.file.length == 0 && info.reply.length == 0){
				html += '	<dl class="icons">';
				html += '		<dd><span class="ico ico-clip"></span><em id="file_' + id + '">0</em></dd>';
				html += '		<dd><span class="ico ico-reply"></span><em id="rep_' + id + '">0</em></dd>';
				html += '		<dd><span class="ico ico-checklist"></span><em id="ck_' + id + '">0/0</em></dd> ';
				html += '	</dl>';	

			}else{
				html += '	<dl class="icons">';
				
				if (info.file.length > 0){
					html += '		<dd><span class="ico ico-clip"></span><em id="file_' + id + '">' + info.file.length + '</em></dd>';
				}
				
				if (info.reply.length > 0){
					html += '		<dd><span class="ico ico-reply"></span><em id="rep_' + id + '">' + +info.reply.length + '</em></dd>';
				}
				
				if (info.checklist.length > 0){
					var clist = gTodoM.check_complete_todo(info.checklist);
					var tlist = info.checklist.length;
					if (clist == tlist){
						html += '		<dd class="checked"><span class="ico ico-checklist"></span><em id="ck_' + id + '">' + clist + '/' + tlist + '</em></dd>';
					}else{
						html += '		<dd><span class="ico ico-checklist"></span><em id="ck_' + id + '">' + clist + '/' + tlist + '</em></dd> ';
					}
				}
				html += '	</dl>';					
			}
			html += '</li>';						
		}
		return html;
	},
	
	"__draw_todo_event" : function(){
		gTodoM.__draw_todo_tab_event();
		gTodoM.__draw_todo_click_event();
	},
	
	"__draw_todo_tab_event" : function(){
		$('.tabs').tabs();

		//$("#todo_status_tab .tab a").off();
		//$("#todo_status_tab .tab a").on("click", function(e){
		$("#todo_status_tab li").off();
		$("#todo_status_tab li").on("click", function(e){
		//	$("#todo_status_tab .tab a").removeClass("active");
		//	$(this).addClass("active");
			$("#todo_status_tab li").removeClass("on");
			$(this).addClass("on");
			
			
			var bun = $(e.currentTarget).attr("id").replace("tab","");

			if (bun == "5"){
				//아카이브
				gTodoM.load_todo_archive();
			
			}else if (bun == "6"){
				//즐겨찾기
				gTodoM.load_todo_star();
			
			}else{
				gTodoM.draw_add_todo_html();
				gTodoM.draw_todo_list(bun);
			}
		
			/*if (e.target.text == gap.lang.temps){
				gTodoM.draw_todo_list('0');
		
			}else if (e.target.text == gap.lang.wait){
				gTodoM.draw_todo_list('1');
		
			}else if (e.target.text == gap.lang.doing){
				gTodoM.draw_todo_list('2');
		
			}else if (e.target.text == gap.lang.done){
				gTodoM.draw_todo_list('3');
		
			}else if (e.target.text == gap.lang.archive){
				$("#add_todo").hide();
				gTodoM.draw_todo_list('4');
		
			}else if (e.target.text == gap.lang.favorite){
				$("#add_todo").hide();
				gTodoM.draw_todo_list('5');
			}*/
		});		
	},
	
	"__draw_todo_click_event" : function(){
		$("#todo_section .formInput").off();
		$("#todo_section .formInput").keypress(function(evt){
			if (evt.keyCode == 13){
				var _self = this;
				var msg = $(this).val();
				var target_list = [];
				var card_list = $("#todo_card_list li");
				for (var i = 0; i < card_list.length; i++){
					var card = card_list[i];
					target_list.push($(card).attr("id"));
				}
				
				var surl = gap.channelserver + "/make_item_todo.km";
				var postData = {
						title : msg,
						owner : gap.userinfo.rinfo,
						status : gTodoM.cur_tab_status,
						project_code : gTodoM.cur_project_code,
						project_name : gTodoM.cur_project_name,
						tlist : target_list.join("-"),
						priority : 3,
						checklist : [],
						file : [],
						reply : []
					};			

				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(postData),
					success : function(res){
						if (res.result == "OK"){
							$(_self).val("");
							gTodoM.cur_project_item_list = res.data.data;
							gTodoM.draw_todo_list(gTodoM.cur_tab_status);
							
						}else{
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				});				
			}
		});
		
	//	$("#todo_card_list li").off();
	//	$("#todo_card_list li").on("click", function(e){
		
		
		$(".todo-list-status li, #todo_card_list li").off();
	//	$("#todo_card_list li").longpress(function(e){
		$(".todo-list-status li, #todo_card_list li").longpress(function(e){

			var id = $(e.currentTarget).attr("id");
			var owner = $(e.currentTarget).data("owner");
			var asignee = $(e.currentTarget).data("assignee");
			var tab = gTodoM.cur_tab_status;
			
			if (gap.cur_window == "enter_project"){
				if (tab == "5" || tab == "6"){
					//아카이브와 즐겨찾기는 롱프레스를 예외처리한다.
					return false;
				}
			}else if (gap.cur_window == "enter_status"){
				tab = gTodoM.todo_status;	
			}
	
			var cuser = gap.userinfo.rinfo.ky;
			/*
			if ((cuser != owner) && (cuser != asignee)){
				mobiscroll4.toast({
					message: gap.lang.noauth
				});
				return false;
			}
			*/
			// 편집 권한이 없는 사용자  메시지 처리
			var edit_permission = false;
			var edit_permission_list = asignee.split("{`");
			for (i=0;i<edit_permission_list.length;i++) {
				if (cuser == edit_permission_list[i]) edit_permission = true;
			}
			if (cuser == owner) edit_permission = true

			if (edit_permission == false) {
				mobiscroll4.toast({
					message: gap.lang.noauth
				});
				return false;
			}

			gTodoM.cowner = owner;
			
			$("#li0").text(gap.lang.li0);
			$("#li1").text(gap.lang.li1);
			$("#li2").text(gap.lang.li2);
			$("#li3").text(gap.lang.li3);
			$("#li4").text(gap.lang.archive);
			
			$("#listview li").show();
			$("#listview li[data='"+tab+"']").hide();
			if (gap.userinfo.rinfo.ky != owner){
				$("#listview li[data='0']").hide();
			}
			
			// 초기화면 '지언'으로 들어간 경우 완료 메뉴만 표시되게 처리.
			if (gap.cur_window == "enter_status" && tab == "4"){
				$("#listview li").hide();
				$("#listview li[data='3']").show();
			}
			
			if (gap.cur_window == "enter_project"){
				if (gTodoM.cur_tab_status == "3"){
					$("#s_archive").show();				
				}else{
					$("#s_archive").hide();
				}				
				
			}else if (gap.cur_window == "enter_status"){
				if (gTodoM.todo_status == "3"){
					$("#s_archive").show();				
				}else{
					$("#s_archive").hide();
				}
			}
			
			gTodoM.cid = id;
			$('#listview').mobiscroll4().listview({
				theme: 'ios',
				themeVariant: 'light',
				enhance: true,
				swipe: false,
				onItemTap: function (event, inst) {
					vertical.hide();
					mobiscroll4.toast({
						message: event.target.textContent
					});
					
					var skey = $(event.target).attr("data");
					
					var data = "";
					var url = "";
					
					if (skey == "4"){
						//아카이브로 이동하는 경우
						data = JSON.stringify({
							project_code : gTodoM.cur_project_code,							
							docid : gTodoM.cid
						});						
						url = gap.channelserver + "/move_archive_todo.km";
					}else{
						data = JSON.stringify({
							project_code : gTodoM.cur_project_code,
							update_key : "status",
							update_data : skey,
							select_key : "_id",
							select_id : gTodoM.cid
						});
						
						url = gap.channelserver + "/update_todo_item_sub.km";
					}
					
					$.ajax({
						type : "POST",
						dataType : "json",
						contentType : "application/json; charset=utf-8",
						data : data,
						url : url,
						success : function(res){
							if (res.result == "OK"){
								//리스트 모드 인지 카드 모드 인지에 따라 선택된 데이터를 이동한다.
								
								if (skey == "4"){
									
								}else{
									var change_doc = res.data.doc;
									gTodoM.change_local_data(change_doc);

									//상태가 변경될 경우 알려주는 함수를 호출한다. //////////////
									//알려주는 대상자는 1. 프로젝트 Owner, 2. TODO 작성자
															
									var obj = new Object();
									obj.id = change_doc._id.$oid;
									obj.type = "cs";  //change status
									obj.p_code = change_doc.project_code;
									obj.p_name = gap.textToHtml(change_doc.project_name);
									obj.title = change_doc.title;
									obj.status = change_doc.status;

									
									var tsender = [];

									if (gap.cur_window == "enter_project"){
										if (gTodoM.cur_project_info.owner.ky != gap.userinfo.rinfo.ky){	
											var list = [];
											list.push(gTodoM.cur_project_info.owner.ky);
											obj.sender = list ;  //해당 프로젝트의 owner에게만 전송한다.							
											//_wsocket.send_todo_msg(obj);
											gBodyM.send_box_msg(obj, 'todo');
											tsender.push(gTodoM.cur_project_info.owner.ky);
										}
										//현재 수정하는 사용자가  TODO생성자가 아닐 경우 TODO생성자에게 알림을 전송한다.	
										if (gTodoM.cur_project_info.owner.ky != gTodoM.cowner){	
											if (gTodoM.cowner != gap.userinfo.rinfo.ky){
												//obj.sender = gTodoM.cowner;  //TODO생성자에게 전송한다.	
												var list = [];
												list.push(gTodoM.cowner);
												obj.sender = list;
												//_wsocket.send_todo_msg(obj);
												gBodyM.send_box_msg(obj, 'todo');
												tsender.push(gTodoM.cowner);
											}
										}
										
									}else if (gap.cur_window == "enter_status"){
										if (change_doc.owner.ky != gap.userinfo.rinfo.ky){							
											//obj.sender = change_doc.owner.ky;  //해당 프로젝트의 owner에게만 전송한다.							
											//_wsocket.send_todo_msg(obj);
											var list = [];
											list.push(change_doc.owner.ky);
											obj.sender = list;
											gBodyM.send_box_msg(obj, 'todo');
											tsender.push(change_doc.owner.ky);
										}
										//현재 수정하는 사용자가  TODO생성자가 아닐 경우 TODO생성자에게 알림을 전송한다.	
										if (change_doc.owner.ky != gTodoM.cowner){	
											if (gTodoM.cowner != gap.userinfo.rinfo.ky){
											//	obj.sender = gTodoM.cowner;  //TODO생성자에게 전송한다.						
												//_wsocket.send_todo_msg(obj);
												var list = [];
												list.push(gTodoM.cowner);
												obj.sender = list;
												gBodyM.send_box_msg(obj, 'todo');
												tsender.push(gTodoM.cowner);
											}
										}
									}


									//모바일  Push를 날린다. ///////////////////////////////////		
									var mx = "";
									if (obj.status == "0"){
										mx = gap.lang.temps;
									}else if (obj.status == "1"){
										mx = gap.lang.wait;
									}else if (obj.status == "2"){
										mx = gap.lang.doing;
									}else if (obj.status == "3"){
										mx = gap.lang.done;
									}
									var smsg = new Object();
									smsg.msg = "[" + change_doc.project_name + "] " + gTodoM.short_title(obj.title) + " - " + gap.lang.cs.replace("$s",mx);
									smsg.title =  gTodoM.systitle + "["+gTodoM.todo_title+"]";	
									smsg.type = "cs";
									smsg.key1 = change_doc.project_code;
									smsg.key2 = change_doc._id.$oid;
									smsg.key3 = "";
									smsg.fr = gap.userinfo.rinfo.nm;
									//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
									if (tsender.length > 0){
										smsg.sender = tsender.join("-spl-");
									//	gap.push_noti_mobile(smsg);
										
										//알림센터에 푸쉬 보내기
										var rid = change_doc.project_code;
										var receivers = tsender;
										var msg2 = "[" + gTodoM.short_title(obj.title) + "] " + gap.lang.cs.replace("$s",mx);
										var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(change_doc.project_name) +"]"
										var data = smsg;
										gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
									}																				
									//////////////////////////////////////////////////////
									
								}
								
								if (gap.cur_window == "enter_project"){
									gTodoM.load_todo(gTodoM.cur_project_code, gTodoM.cur_tab_status);
									
								}else if (gap.cur_window == "enter_status"){
									gTodoM.load_todo_status(gTodoM.todo_opt, gTodoM.todo_status);
								}
								
																		
								//////////////////////////////////////////////////////						
								
							}else{
								gap.error_alert();
							}
						},
						error : function(e){
							gap.error_alert();
						}
					});
				}
			});			

			vertical = $('#vertical').mobiscroll4().popup({
				display: 'bubble',
				anchor: '#' + id,
				buttons: [],
				cssClass: 'mbsc-no-padding md-vertical-list'
			}).mobiscroll4('getInst')
			vertical.show();
			return false;
		});
		
		var startEvent = false, moveEvent = false;
		$(".todo-list-status li, #todo_card_list li").on("touchstart", function(e){
			startEvent = true;
		});
		$(".todo-list-status li, #todo_card_list li").on("touchmove", function(e){
			moveEvent = true;
		});
		$(".todo-list-status li, #todo_card_list li").on("touchend", function(e){
		//$(".todo-list-status li, #todo_card_list li").on("click", function(e){
			// touchstart 후 touchmove가 발생된 경우 skip
			if (startEvent && !moveEvent) {
				startEvent = false;
				moveEvent = false;
			} else {
				startEvent = false;
				moveEvent = false;
				return;
			}

			// 롱프레스로 인해 팝업창이 뜬 경우 skip
			//if ($('#vertical').is(':visible')==true) return;
			if ($('.mbsc-fr-popup').is(':visible')==true) return;
						
			if (e.target.className == "ico btn-more"){
				/*
				 * 1 : 업무 즐겨찾기, 2 : 업무 삭제, 3 : 할일로 변경하기, 4 : 체크리스트 삭제, 5 : 파일 미리보기, 6 : 파일 삭제
				 * card 메뉴 : 업무 즐겨찾기 / 업무 삭제 
				 */				
				gTodoM.select_id = $(this).attr("id");
				var url_link = "kPortalMeet://NativeCall/callTodoMenu"
								+ "?param1=1"
								+ "&param2=2"
								+ "&param3="
								+ "&param4="
								+ "&param5="
								+ "&param6="
								+ "&json="
				gBodyM.connectApp(url_link);
				return false;				
				
			}else{
			
				var _id = $(this).attr("id");
				var cur_tab = gTodoM.cur_tab_status;
				var title = $(this).attr("data");
				
				/*if (is_mobile){
					var url_link = "kPortalMeet://NativeCall/callDetailTodo?id=" + _id + "&tab="+cur_tab+"&title=" + title;
					gBodyM.connectApp(url_link);
					return false;
					
				}else{
					gTodoM.compose_layer(_id);
				}*/	
				
				var url_link = "kPortalMeet://NativeCall/callDetailTodo?id=" + _id + "&tab="+cur_tab+"&title=" + title;
				gBodyM.connectApp(url_link);
				return false;
			}

		});	
	},
	
	"code_change_status" : function(opt){
		var res = new Object();
		
		if (opt == "1"){
			res.txt = gap.lang.wait;
			res.style = "wait";
		}else if (opt == "2"){
			res.txt = gap.lang.doing;
			res.style = "continue";
		}else if (opt == "3"){
			res.txt = gap.lang.done;
			res.style = "complete";
		}else if (opt == "0"){
			res.txt = gap.lang.temps;
			res.style = "temp";
		}
		
		return res;
	},
	
	"check_complete_todo" : function(list){
		var count = 0;
		for (var i = 0; i < list.length; i++){
			var ck = list[i];
			if (ck.complete == "T"){
				count ++;
			}
		}
		return count;
	},	
	
	"date_diff" : function(startdate, enddate){
		var sdate = new Object();
		var st = moment.utc(new Date(startdate)).format("YYYY.MM.DD");
		var et = moment.utc(new Date(enddate)).format("YYYY.MM.DD");
		var duration = moment.duration(moment.utc(new Date(enddate)).diff(moment.utc(new Date(startdate))));
		var term = duration.asDays()+1;
		
		var now = moment.utc(new Date());
		var sts = moment.utc(new Date(startdate));
		var ets = moment.utc(new Date(enddate));
		var df = sts.diff(now, "days");
		var rate = 0;
		if (df < 0){
			//시작일이 오늘을 지났기 때문에 비율을 계산해야 한다.
			var df1 = ets.diff(sts, "days")+1;
			var df2 = now.diff(sts, "days")+1;
			rate = parseInt((parseInt(df2) / parseInt(df1)) * 100);
		}	
		
		sdate.st = st;
		sdate.et = et;
		sdate.rate = rate;
		sdate.term = term;
		
		return sdate;
	},
	
	"compose_layer" : function(id){
		var data = JSON.stringify({
			key : id
		});
		var url = gap.channelserver + "/search_item_todo.km";
		$.ajax({
			type : "POST",
			dataType : "json",
			//contentType : "application/json; charset=utf-8",
			url : url,
			data : data,
			success : function(res){
				if (res.result == "OK"){
					gTodoM.cur_project_info = res.data.project_info;
					gTodoM.cur_project_name = res.data.project_info.name;
					gTodoM.cur_project_code = res.data.project_info._id.$oid;
					
					gTodoM.compose_layer_draw(res);
				
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});
		
		gBodyM.mobile_open_layer('todo_content_layer');		
		
		
		////////////기존에 띄워져 있는 mobiscroll을 모두 제거한다. //////////////////////
		var datep = $("#todo_startdate").mobiscroll("getInst");
		if (typeof(datep._active) != "undefined"){
			datep.close();
		}
		
		var dateone = $(".todo-list-right .ico-time").mobiscroll("getInst");
		if (typeof(dateone._active) != "undefined"){
			dateone.close();
		}		
		$('#list').mobiscroll4().popup();
		$('#memberlist').mobiscroll4().popup();
		////////////////////////////////////////////////////////////////
	},
	
	
	"compose_layer_draw" : function(item){
		
		gTodoM.isupdate = false;		
		gTodoM.view_mode = "read" //현재 조회창 형태로 띄워져 있는 상태를 표시한다.
		var info = item.data;
		var files = info.file;
			
	
		gTodoM.select_todo = info;
		gTodoM.select_id = info._id.$oid;
			
		//현재 접속한 사용자가 편집을 할 수 있는 사용자인지 판단한다.
		var is_admin = (gap.userinfo.rinfo.em == gTodoM.cur_project_info.owner.em ? true : false);
		var is_owner = (gTodoM.select_todo.owner.em == gap.userinfo.rinfo.em ? true : false);
		var is_asignee = false;
		
		/*
		if (gTodoM.select_todo.asignee != undefined){
			is_asignee = (gTodoM.select_todo.asignee.em == gap.userinfo.rinfo.em ? true : false);
		}
		*/
		var asignee_list = gTodoM.select_todo.asignee;
		if (asignee_list!=undefined && asignee_list != ""){
			if (Array.isArray(asignee_list)==false) {
				if (asignee_list.em == gap.userinfo.rinfo.em) is_asignee = true;
			} else {
				for (i=0;i<asignee_list.length;i++) {
					if (asignee_list[i].em == gap.userinfo.rinfo.em) is_asignee = true;
				}
			}
		}		
		
		if (is_admin || is_owner){
			gTodoM.compose_admin = true;
		}else{
			gTodoM.compose_admin = false;
		}
			
		if (is_asignee){
			gTodoM.compose_asignee = true;
		}else{
			gTodoM.compose_asignee = false;
		}
		
		var star = false;
		if (info.favorite != undefined){
			if ($.inArray(gap.userinfo.rinfo.em, info.favorite) > -1){
				star = true;
			}
		}
		
		var html = '';
		

		html += '<section style="width:100%; height:100%; padding: 0 2rem 0 2rem; margin-top:15px">';				
		//작성자 표시하기
		html += '	<div style="margin-bottom:25px">';
		html += '		<h3>'+gap.lang.maker+'</h3>';
		//gTodoM.select_todo
		var owner_info = gap.user_check(gTodoM.select_todo.owner);
		html += '   <ul class="card">';
		html += '	<div class="user" style="padding-left:0px">';
		html += '		<div class="user-thumb" data-ky="'+owner_info.ky+'" id="m_todo_owner">' + owner_info.user_img + '</div>';
		html += '		<dl>';
		html += '			<dt id="owner_disp_name">' + owner_info.name + gap.lang.hoching + '</dt>';
		if (owner_info.jt != ""){
			html += '			<dd id="owner_disp_dept">' + owner_info.jt + ' | ' + owner_info.dept + '</dd>';
		}else{
			html += '			<dd id="owner_disp_dept">' + owner_info.dept + '</dd>';
		}
		
		html += '		</dl>';
		html += '	</div>';
		html += '   </ul>';		
		html += '   </div>';
		
		
		if (gTodoM.compose_admin){
			html += '	<div class="input-field">';
			html += '		<input type="text" class="formInput" id="todo_compose_title" value="' + info.title + '">';
			html += '		<label for="todo_compose_title" class="' + (info.title != "" ? "on" : "") + '">' + gap.lang.todo + '</label> <!-- 텍스트 필스 포커스, 입력값 있을때 on 클래스 추가 -->';
			html += '		<span class="bar"></span>';
			html += '	</div>';
			
			html += '	<div class="input-field textarea">';
			html += '		<textarea type="text" class="formInput" id="todo_compose_express_edit" value="' + info.express + '" placeholder="' + gap.lang.input_todo_comment + '"></textarea>';
			html += '		<span class="bar"></span>';
			html += '		<div class="todo-right" id="todo_compse_express_save" style="display:none;">';
			html += '			<button class="btn-txt btn-ok" id="todo_compose_express_save_btn"><span>확인</span></button>';
			html += '		</div>';
			html += '	</div>';			
			
		}else{
			html += '	<h1>' + info.title + '</h1>';
			html += '	<h2 id="todo_compose_express"></h2>';
		}
		
		
		// 체크 리스트
		html += '	<div class="check-graph">';
		html += '		<div class="bar"><span style="width:50%;"></span></div>';
		html += '		<em>0/0</em>';
		html += '	</div>';
		html += '	<div class="check-list">';
		html += '		<h3>' + gap.lang.checklist + '<span id="todo_checklist_count"></span></h3>';
		html += '		<ul id="todo_compose_checklist" style="list-style:none">';
		
		if (info.checklist != undefined){
			var chlist = info.checklist;
			for (var i = 0 ; i < chlist.length; i++){
				var citem = chlist[i];
				var owner = "";
				
				if (citem.asign != undefined){
					owner = citem.asign.em;
				}
				if (citem.complete == "T"){
					html += '			<li id="' + citem.tid + '" data="' + owner + '" class="list-checked">';
					html += '				<button class="ico btn-check on">체크</button>';
					
				}else{
					html += '			<li id="' + citem.tid + '" data="' + owner + '">';
					html += '				<button class="ico btn-check">체크</button>';					
				}
				
				html += '				<p>' + citem.txt + '</p>';
				html += '				<dl class="todo-list-right">';
				if (citem.complete_date != undefined){
					var st = moment.utc(citem.start_date).format("YYYY-MM-DD");
					var dt = moment.utc(citem.complete_date).format("YYYY-MM-DD");
					if (citem.complete == "T"){
						html += '					<dd><span class="btn-time checked"><button id="time_' + citem.tid + '" class="ico ico-time">시간</button><em>' + st + "~" + dt + '</em></span></dd>';
						
					}else{
						html += '					<dd><span class="btn-time"><button id="time_' + citem.tid + '" class="ico ico-time">시간</button><em>' + st + "~" + dt + '</em></span></dd>';
					}
					
				}else{
					if (citem.complete == "T"){
						html += '					<dd><span class="btn-time checked"><button id="time_' + citem.tid + '" class="ico ico-time">시간</button><em></em></span></dd>';
						
					}else{
						html += '					<dd><span class="btn-time"><button id="time_' + citem.tid + '" class="ico ico-time">시간</button></span><em></em></dd>';
					}
				}				
				
				if (citem.asign != undefined){
					var user_info = gap.user_check(citem.asign);
					var person_img = '<div class="user-thumb" data-ky="'+user_info.ky+'" style="cursor:pointer">' + user_info.user_img + '</div>';
					html += '					<dd>' + person_img + '</dd>';
					
				}else{
					html += '					<dd><button class="ico btn-user-add">사용자추가</button></dd>';
				}
				if (gTodoM.compose_admin || gTodoM.compose_asignee){
					html += '					<dd><button class="ico btn-more">더보기</button></dd>';
				}
				
				html += '				</dl>';
				html += '			</li>';
			}			
		}
		html += '		</ul>';
		
		html += '		<div class="input-field">';
		if (gTodoM.compose_admin || gTodoM.compose_asignee){
			//html += '			<input type="text" class="formInput" id="todo_compose_checklist_save" placeholder="' + gap.lang.input_checklist + '">';
			html += '			<input type="text" class="formInput" id="todo_compose_checklist_save" placeholder="' + gap.lang.input_checklist + '" enterkeyhint="Go">';
			html += '			<span class="bar"></span>';			
		}
		html += '		</div>';
		
		
		html += '	</div>';
		
		
		// 첨부파일
		html += '	<div class="attach-list">';
		html += '		<h3>' + gap.lang.attachment + '<strong id="todo_file_count"></strong></h3>';
		html += '		<button class="ico btn-attach" id="todoattach"><span>파일추가</span></button>';
		html += '		<ul id="todo_compose_view_attach" style="list-style:none">';
		
		if (files != undefined){
			for (var k = 0; k < files.length; k++){
				var f = files[k];
	    		var icon = gap.file_icon_check(f.filename);
	    		var fsize = gap.file_size_setting(f.file_size.$numberLong);
	    		var md5 = f.md5.replace(".","_");
	    		var owner = f.owner;
	    		var name = owner.nm;
	    		var dept = owner.dp;
	    		if (gap.curLang != "ko"){
	    			name = owner.enm;
	    		}    		
	    		var ftype = f.file_type;
	    		var time = gap.change_date_localTime_full2(f.GMT);
	    		
	    		html += '			<li id="' + md5 + '" data1="' + f.filename + '" data2="' + f.fserver + '" owner="' + owner.em + '" owner_nm="' + name + '" date="' + time + '">';
	    		html += '				<div class="chat-attach">';
	    		html += '					<div>';
	    		html += '						<span class="ico ico-s ' + icon + '"></span>';
	    		html += '						<dl>';
	    		html += '							<dt>' + f.filename + '</dt>';
	    		html += '							<dd>(' + fsize + ')</dd>';
	    		html += '						</dl>';
	    		html += '					</div>';
	    		html += '				</div>';
	    		html += '			</li>';
			}
		}
		html += '		</ul>';
		html += '	</div>';
		
		// 기간
		var start_date = "";
		var end_date = "";

		if (info.startdate != undefined){
			start_date = moment.utc(new Date(info.startdate)).format("YYYY-MM-DD");
		}
		
		if (info.enddate != undefined){
			end_date = moment.utc(new Date(info.enddate)).format("YYYY-MM-DD");
		}

		html += '	<div class="todo-period todo-option">';
		html += '		<h3>' + gap.lang.todo_period + '</h3>';
		if (gTodoM.compose_admin){
			html += '		<div>';
			html += '			<div class="input-field">';
			html += '				<input type="text" class="formInput" id="todo_startdate" value="' + start_date + " - " + end_date + '" placeholder="' + gap.lang.select_period + '" readonly>';
			html += '				<span class="bar"></span>';
			html += '			</div>';
		//	html += '			~';
		//	html += '			<div class="input-field">';
		//	html += '				<input type="text" class="formInput" id="todo_enddate" value="' + end_date + '" placeholder="' + gap.lang.enddate + '" readonly>';
		//	html += '				<span class="bar"></span>';
		//	html += '			</div>';
			html += '		</div>';
			
		}else{
			html += '		<p>' + start_date + ' ~ ' + end_date + '</p>';
		}
		html += '	</div>';
		
		// 상태
		html += '	<div class="todo-view-2cell">';
		html += '		<div class="todo-status todo-option">';
		html += '			<h3>' + gap.lang.status + '</h3>';
		if (gTodoM.compose_admin || gTodoM.compose_asignee){
			html += '			<div class="selectbox">';
			html += '				<select id="st_sel">';
			if (is_owner){
				// 임시저장은  To Do 작성자만 처리 가능 (임시저장은 작성자에게만 보임. 담당자가 임시저장으로 변경해도 원 작성자가 아니면 보이지 않는다)
				html += '					<option id="chx_0" value="0" data-icon="' + cdbpath + '/img/temp.png">' + gap.lang.temps + '</option>';
			}
			html += '					<option id="chx_1" value="1" data-icon="' + cdbpath + '/img/wait.png">' + gap.lang.wait + '</option>';
			html += '					<option id="chx_2" value="2" data-icon="' + cdbpath + '/img/continue.png">' + gap.lang.doing + '</option>';
			html += '					<option id="chx_3" value="3" data-icon="' + cdbpath + '/img/complete.png">' + gap.lang.done + '</option>';
			if (info.status == "4"){
				html += '					<option id="chx_4" value="4" data-icon="' + cdbpath + '/img/archive.png">' + gap.lang.archive + '</option>';
			}
			html += '				</select>';
			html += '			</div>';			
			
		}else{
		//	html += '			<p>대기</p>';
			html += '			<div class="selectbox">';
			html += '				<p id="sx_1" style="padding-top:10px"></p>';
			html += '			</div>';
		}
		
		html += '		</div>';
		
		// 우선순위
		html += '		<div class="todo-level todo-option">';
		html += '			<h3>' + gap.lang.priority + '</h3>';
		if (gTodoM.compose_admin){
			html += '			<div class="selectbox">';
			html += '				<select id="pt_sel">';
			html += '					<option id="chp_1" value="1" data-icon="' + cdbpath + '/img/arrow1.png">' + gap.lang.priority1 + '</option>';
			html += '					<option id="chp_2" value="2" data-icon="' + cdbpath + '/img/arrow2.png">' + gap.lang.priority2 + '</option>';
			html += '					<option id="chp_3" value="3" data-icon="' + cdbpath + '/img/bar.png">' + gap.lang.priority3 + '</option>';
			html += '					<option id="chp_4" value="4" data-icon="' + cdbpath + '/img/arrow3.png">' + gap.lang.priority4 + '</option>';
		//	html += '					<option id="chp_5" value="5" data-icon="' + cdbpath + '/img/arrow4.png">' + gap.lang.priority5 + '</option>';
			html += '				</select>';
			html += '			</div>';
			
		}else{
		//	html += '			<p>높음</p>';
			html += '			<div class="selectbox">';
			html += '				<p id="sx_2" style="padding-top:10px"></p>';
			html += '			</div>';			
		}
		html += '		</div>';
		
		
		// 담당자
		html += '		<div class="todo-owner todo-option" id="main_owner">';
		html += '			<h3>' + gap.lang.asign + '</h3>';
		html += '			<div class="user">';
		if (gTodoM.compose_admin){
			if (info.asignee == undefined || info.asignee == ""){
				html += '				<div class="user-thumb" id="asignee_btn" data-ky="" style="cursor:pointer"><img src="' + cdbpath + '/img/user_d.jpg" alt=""></div>';
				
			}else{
				var user_info = gap.user_check(info.asignee);
				html += '				<button class="btn-g-del"></button>';
				html += '				<div class="user-thumb" id="asignee_btn" data-ky="'+user_info.ky+'" style="cursor:pointer">' + user_info.user_img + '</div>';
			}
			
		}else{
			if (info.asignee == undefined || info.asignee == ""){
				html += '					<div class="user-thumb" ><img src="' + cdbpath + '"/img/user_d.jpg" alt=""></div>';
			}else{
				var user_info = gap.user_check(info.asignee);		
				html += '					<div class="user-thumb">' + user_info.user_img + '</div>';
			}	
		}
		html += '			</div>';
		html += '		</div>';
		
		
		
		
		
		// 색상		
		html += '		<div class="todo-color todo-option" style="display:none">';
		html += '			<h3>' + gap.lang.color + '</h3>';
		if (info.color != undefined){
			if (gTodoM.compose_admin){
				html += '			<div class="color ' + info.color + '" id="todo_color_img"><button class="btn-g-del">삭제</button></div>';
				
			}else{
				html += '			<div class="color ' + info.color + '"></div>';
			}
		}else{
			if (gTodoM.compose_admin){
				html += '			<button class="btn-color-add" id="todo_color_add">색상추가</button>';
			}
		}
		html += '		</div>';
		html += '	</div>';
		
		// 멀티 담당자
//		html += '		<div class="todo-owner todo-option">';
//		html += '			<h3>' + gap.lang.asign + '</h3>';
//		if (gTodoM.compose_admin){
//			html += '			<button class="btn-asignee-add" id="todo_asignee_add">담당자추가</button>';
//		}
//		html += '			<div class="user">';
//		var _asignee = info.asignee;
//		if (_asignee != undefined && _asignee != ""){
//			if (Array.isArray(_asignee)==false) {
//				var user_info = gap.user_check(_asignee);
//				html += '<div class="user-thumb-parent" data-ky="'+user_info.ky+'">';
//				html += (gTodoM.compose_admin?'<button class="btn-g-del"></button>':'');
//				html += '<div class="user-thumb">' + user_info.user_img + '</div>';
//				html += '</div>';
//			}else {
//				for (i=0;i<_asignee.length;i++) {
//					var user_info = gap.user_check(_asignee[i]);
//					html += '<div class="user-thumb-parent" data-ky="'+user_info.ky+'">';
//					html += (gTodoM.compose_admin?'<button class="btn-g-del"></button>':'');
//					html += '<div class="user-thumb">' + user_info.user_img + '</div>';
//					html += '</div>';
//				}
//			}
//		}
//		html += '			</div>';
//		html += '		</div>';
		
		// 태그
		html += '	<div class="todo-tag todo-option" id="tag_list_div" style="display:none">';
		html += '		<h3>' + gap.lang.tag + '</h3>';
		if (info.tag != undefined){
			if (gTodoM.compose_admin){
				html += '	<ul id="tag_list_ul">';
				for (var i = 0; i < info.tag.length; i++){
					html += '		<span>' + info.tag[i] + '<button class="btn-g-del"></button></span>';
				}
				html += '	</ul>';
				
				html += '		<div class="input-field">';
				html += '			<input type="text" class="formInput" id="todo_compose_tag" placeholder="' + gap.lang.input_tag + '">';
				html += '			<span for="todo_compose_tag" class="bar"></span>';
				html += '		</div>';					
				
			}else{
				for (var i = 0; i < info.tag.length; i++){
					html += '		<span>' + info.tag[i] + '</span>';
				}
			}
		}else{
			if (gTodoM.compose_admin){
				html += '	<ul id="tag_list_ul">';
				html += '	</ul>';
				html += '		<div class="input-field">';
				html += '			<input type="text" class="formInput" id="todo_compose_tag" placeholder="' + gap.lang.input_tag + '">';
				html += '			<span for="todo_compose_tag" class="bar"></span>';
				html += '		</div>';
			}
		}
		html += '	</div>';
		
		
		
		if (typeof(info.ref) != "undefined" && info.ref.length > 0){
			// 참조자 표시
			html += '		<div class="todo-owner todo-option">';
			html += '			<h3>' + gap.lang.collect_referrer + '</h3>';
			html += '			<div class="user" style="display:flex">';
			
			for (var k = 0 ; k < info.ref.length; k++){
				var rinfo = info.ref[k];				
				var user_info = gap.user_check(rinfo);		
				html += '					<div class="user-thumb" style="margin-left:5px">' + user_info.user_img + '</div>';					
			}				
			html += '			</div>';
			html += '		</div>';
		}
		
		
		

		// 댓글
		html += '	<div class="todo-reply" style="margin-top:2rem">';
		html += '		<h3>' + gap.lang.reply + '<span id="todo_reply_count"></span></h3>';
		html += '		<div class="message-reply" id="todo_compose_reply_list">';
		
		var rcount = 0;
		if (item.data.reply != undefined){
			rcount = item.data.reply.length;
			for (var k = 0; k < item.data.reply.length; k++){
				var rinfo = item.data.reply[k];
				var id = rinfo.key;
				var msg = rinfo.msg;
				var GMT = rinfo.GMT;
				
				var owner = rinfo.owner;
				var user_info = gap.user_check(owner);
				var time = gap.change_date_localTime_full2(GMT);
				
				msg = gTodoM.message_check(msg);
				
				if (msg.indexOf("&lt;/mention&gt;") > -1){
					//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
					msg = gap.textToHtml(msg).replace(/&nbsp;/g, " ");
				}
				
				html += '			<dl class="user' + (k == 0 ? ' first-reply' : '') + '" id="' + id + '">';
				html += '				<dt>';
				html += '					<div>';
				html += '						<div class="user-thumb">' + user_info.user_img + '</div>';
				html += '					</div>';
				html += '				</dt>';
				html += '				<dd>';
				html += '					<span>' + user_info.name + '<em class="team">' + user_info.dept + '</em><em>' + time + '</em></span>';
				if (owner.em == gap.userinfo.rinfo.em){
					html += '					<button class="ico btn-edit" style="position:absolute; right:48px; top:14px"><span>수정</span></button>';
					html += '					<button class="ico btn-del1"><span>삭제</span></button>';
					html += '					<p style="padding-right:76px;">' + msg + '</p>';
				}else{
					html += '					<p>' + msg + '</p>';
				}
				html += '				</dd>';
				html += '			</dl>';				
			}
		}
		html += '		</div>';
	/*	html += '		<div class="input-chat" >';
		html += '			<textarea style="" class="txt-chat" id="todo_reply_input" placeholder="' + gap.lang.input_replay + '"></textarea>';
		html += '			<button style="" class="btn-chat-send" id="todo_reply_send_btn"><span class="ico ico-send">전송</span></button>';
		html += '		</div>';*/
		html += '		<div class="input-todo-reply" id="input_todo_reply">';
		html += '			<div>' + gap.lang.input_replay + '</div>';
		html += '		</div>';
		html += '	</div>';	
		html += '</section>';
		
		$('#todo_content_layer').html(html);

		
		//설명 초기화 하기
		if (info.express != undefined){
			$("#todo_compose_express").html(gTodoM.message_check(info.express));
			$("#todo_compose_express_edit").val(gap.textToHtml(info.express));
		}
		
		//댓글 스크롤 하단으로 이동
		$("#todo_reply_count").html(" ("+ rcount +")");
		
		//파일 건수 표시
		var fcount = $("#todo_compose_view_attach li").length;
		$("#todo_file_count").html(" ("+ fcount +")");
		
		
				
		if (gTodoM.compose_admin || gTodoM.compose_asignee){
			//상태 변경하기
			var st = item.data.status;
			$("#chx_" + st).prop("selected", true);
		
			//우선 순위 변경하기
			var pt = item.data.priority;
			$("#chp_" + pt).prop("selected", true);
			
		}else{
			//상태 변경하기
			var st = item.data.status;

			var tx = "";
			if (st == "0"){
				tx = gap.lang.temps;
			}else if (st == "1"){
				tx = gap.lang.wait;
			}else if (st == "2"){
				tx = gap.lang.doing;
			}else if (st == "3"){
				tx = gap.lang.done;
			}else if (st == "4"){
				tx = gap.lang.archive;
			}
			$("#sx_1").html(tx);
			
			//우선 순위 변경하기
			var pt = item.data.priority;
			var tt = gap.lang["priority" + pt];
			$("#sx_2").html(tt)
		}		
		
		$("select").material_select();
		
		//체크리스트 건수 표시하기
		gTodoM.checklist_count_check();
		
		gTodoM.__todo_compose_event();
	},
	
	
	
	
	"draw_attach" : function(res){
		//gap.gAlert("파일업로드 이후 업로드 파일을 추가해야 한다.");
		
		//var list = JSON.parse(res);
		var list = res;
		var flist = list.files;
		
		var html = "";
		
		for (var i = 0 ; i < flist.length; i++){
			var f = flist[i];
    		var icon = gap.file_icon_check(f.filename);
    		var fsize = gap.file_size_setting(f.file_size.$numberLong);
    		var md5 = f.md5.replace(".","_");
    		var owner = f.owner;
    		var name = owner.nm;
    		var dept = owner.dp;
    		if (gap.curLang != "ko"){
    			name = owner.enm;
    		}    		
    		var ftype = f.file_type;
    		var time = gap.change_date_localTime_full2(f.GMT);
    		
			var fserver = "";
    		if (typeof(f.fserver) != "undefined"){
    			fserver = f.fserver;
    		}else{
    			fserver = gap.channelserver;
    		}
    		
    		html += '			<li id="' + md5 + '" data1="' + f.filename + '" data2="' + fserver + '" owner="' + owner.em + '" owner_nm="' + name + '" date="' + time + '">';
    		html += '				<div class="chat-attach">';
    		html += '					<div>';
    		html += '						<span class="ico ico-s ' + icon + '"></span>';
    		html += '						<dl>';
    		html += '							<dt>' + f.filename + '</dt>';
    		html += '							<dd>(' + fsize + ')</dd>';
    		html += '						</dl>';
    		html += '					</div>';
    		html += '				</div>';
    		html += '			</li>';
		}
		
		$("#todo_compose_view_attach").append(html);
		
		var count = $("#todo_compose_view_attach li").length;
		$("#todo_file_count").html("(" + count + ")");
		
		gTodoM.__todo_file_event();
		
		//webpush를 발송한다.
		
		var rlist = $.unique(gap.check_cur_todo_members_mobile());
		var info = res.data.doc;
//		for (var i = 0 ; i < rlist.length; i++){
//			var sn = rlist[i];
//			
//		}
		if (rlist.length > 0){
			var obj = new Object();
			obj.id = info._id.$oid;
			obj.type = "attach";  //change status
			obj.p_code = info.project_code;
			obj.p_name = gap.textToHtml(info.project_name);
			obj.title = info.title;
			obj.sender = rlist;  //해당 프로젝트의 owner에게만 전송한다.					
			//_wsocket.send_todo_msg(obj);
			gBodyM.send_box_msg(obj, 'todo');
		}
		
		
		//모바일 push를 발송한다.
		if (rlist.length > 0){
			var smsg = new Object();
			smsg.msg = "[" + gap.textToHtml(info.project_name) + "] " + gTodoM.short_title(info.title) + " - " + gap.lang.reg_file;
			smsg.title =  gTodoM.systitle + "["+gTodoM.todo_title+"]";	
			smsg.type = "attach";
			smsg.key1 = info.project_code;
			smsg.key2 = info._id.$oid;
			smsg.key3 = "";
			smsg.fr = gap.userinfo.rinfo.nm;
			//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
			smsg.sender = rlist.join("-spl-");			
		//	gap.push_noti_mobile(smsg);	
			
			//알림센터에 푸쉬 보내기
			var rid = info.project_code;
			var receivers = rlist;
			var msg2 = "[" + gTodoM.short_title(info.title) + "] " +  gap.lang.reg_file;	
			var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(info.project_name) +"]"
			var data = smsg;
			gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);	
		}
		
		return false;		
				
	},
	
	"__todo_file_event" : function(){
		$("#todo_compose_view_attach li").off();
		$("#todo_compose_view_attach li").on("click", function(e){
			/*
			 * 1 : 업무 즐겨찾기, 2 : 업무 삭제, 3 : 할일로 변경하기, 4 : 체크리스트 삭제, 5 : 파일 미리보기, 6 : 파일 삭제
			 * 파일 메뉴 : 미리보기 / 파일삭제 
			 */
			var fpid = $(this).attr("id");
			var fmd5 = $(this).attr("id").replace("_", ".");
			var fname = $(this).attr("data1");
			var fserver = $(this).attr("data2");
			var owner = $(this).attr("owner");
			var owner_nm = $(this).attr("owner_nm");
			var date = $(this).attr("date");
			var is_show = gap.check_preview_file(fname);
			var ext = gap.is_file_type_filter(fname);
    		var is_pre = gap.is_file_type(fname);

			var obj = new Object();
			obj.f_server = fserver;
			obj.f_name = fname;
			obj.f_pid = fpid;
			obj.f_md5 = fmd5;
			obj.f_url = "";
			obj.f_video_url = "";

			if (is_pre == "img"){
				obj.f_url = fserver + "/FDownload.do?id=" + gTodoM.select_id + "&md5=" + fmd5 + "&ty=todo"
				
			}else if (ext == "movie"){
				var vserver = gap.search_video_server(fserver);
				var fname = fmd5 + fname.substring(fname.lastIndexOf("."), fname.length);
			//	obj.f_video_url =  vserver + "/4//" + gTodoM.select_id + "/" + fname + "/";
				obj.f_video_url =  fserver + "/FDownload.do?id=" + gTodoM.select_id + "&md5=" + fmd5 + "&ty=todo"
			}
			gTodoM.click_file_info = obj;

			//App 팝업 메뉴에서 정보를 표시하기 위해 설정 (파일명, 작성자, 날짜)
			var _disp_file_info = new Object();
	
			_disp_file_info.filename = fname;
			_disp_file_info.name = owner_nm;			
			_disp_file_info.date = date;

			var url_link = "kPortalMeet://NativeCall/callTodoMenu"
							+ "?param1="
							+ "&param2="
							+ "&param3="
							+ "&param4="
							+ "&param5=" + (is_show || is_pre == "img" || is_pre == "movie" ? "5" : "")
							+ "&param6=" + (owner == gap.userinfo.rinfo.em ? "6" : "")
							+ "&json=" + encodeURIComponent(JSON.stringify(_disp_file_info))
			gBodyM.connectApp(url_link);
			return false;	
		});
	},
	
	"checklist_count_check" : function(){
		var checked_count = $("#todo_compose_checklist .list-checked").length;
		var total_count = $("#todo_compose_checklist li").length;
		
		var ck = checked_count + "/" + total_count;
		$(".check-graph em").html(ck);

		var rate = parseInt(checked_count) / parseInt(total_count);		
		rate = parseInt(rate * 100);
		if (total_count == 0){
			rate = 0;
		}
		$(".check-graph span").css("width", rate +"%");
		
		//체크리스트 건수 표시
		var fcount = $("#todo_compose_checklist li").length;
		$("#todo_checklist_count").html(" ("+ fcount +")");
		
		
		//하단의 숨김여부를 판단한다.
	//	gTodoM.item_list_count();
		
	},
	
	"file_count_check" : function(){
		//파일 건수 표시
		var fcount = $("#todo_compose_view_attach li").length;
		
		$("#todo_file_count").html(" ("+ fcount +")");
	},
	
	"reply_count_check" : function(){
		//댓글 건수 표시
		var rcount = $("#todo_compose_reply_list dl").length;
		$("#todo_reply_count").html(" ("+ rcount +")");
	},	
	
	"enter_next_line_todo" : function(evt){
    	var id = $(evt.currentTarget).attr("id");
		$("#" + id).height($("#" + id).height() + 23);      	
    	var countRows = $("#" + id).val().split(/\r|\r\n|\n/).length;   
    	$("#" + id).attr("rows", countRows + 1);
    	
    	evt.stopPropagation();
	},	
	
	"sendMessage" : function(e){
		var msg = $("#todo_reply_input").val();
		
		if (msg.trim() == ""){
			gap.gAlert(gap.lang.input_message);
			return false;
		}
		var owner = gap.userinfo.rinfo;
		
		var data = JSON.stringify({
			id : gTodoM.select_id,
			owner : owner,
			msg : msg
		});
		
		var url = gap.channelserver + "/reply_todo_save.km";
		$.ajax({
			type : "POST",
			dataType : "text",
			url : url,
			data : data,
			success : function(res){
				var rrx = JSON.parse(res);
				
				if (rrx.result == "OK"){
					$("#todo_compose_reply_list").show();
					
					var id = rrx.data.tkey;
					var GMT = rrx.data.GMT;
					var user_info = gap.user_check(owner);
					var time = gap.change_date_localTime_full2(GMT);
					msg = msg = gTodoM.message_check(msg);
					
					var html = "";

					html += "<dl id='" + id + "' class='user'>";
					html += "	<dt>";
					html += "		<div>";
					html += "				<div class='user-thumb'>" + user_info.user_img + "</div>";
					html += "		</div>";
					html += "	</dt>";
					html += "	<dd>";
					html += "		<span>" + user_info.name + "<em class='team'>" + user_info.dept + "</em><em>" + time + "</em></span>";
					html += '		<button class="ico btn-edit" style="position:absolute; right:48px; top:14px"><span>수정</span></button>';
					html += "		<button class='ico btn-del1'><span>삭제</span></button>";
					html += "		<p style='padding-right:76px;'>" + msg + "</p>";
					html += "	</dd>";
					html += "</dl>";
					
					$("#todo_compose_reply_list").append(html);
					
					//댓글 스크롤 하단으로 이동
					$("#todo_compose_reply_list").animate({ scrollTop: $('#todo_compose_reply_list').prop("scrollHeight")}, 1000);
					
					gTodoM.reply_count_check();
					
					//텍스트 박스 초기화
					$("#todo_reply_input").val("");
										
					var change_doc = rrx.data.doc.doc;
					gTodoM.change_local_data(change_doc);
					
					gTodoM.__todo_compose_event();
					
					
					//본인을 제외한 멤버들에게 Push 알림을 전송한다.
					var member_list = $.unique(gap.check_cur_todo_members_mobile());
//					for (var i = 0 ; i < member_list.length; i++){
//						var mk = member_list[i];
//
//					}
					if (member_list.length > 0){
						var obj = new Object();
						obj.id = gTodoM.select_id;
						obj.type = "reply";  //change status
						obj.p_code = gTodoM.cur_project_code;
						obj.p_name = gap.textToHtml(gTodoM.cur_project_name);
						obj.title = gTodoM.select_todo.title;
						obj.sender = member_list;  //해당 프로젝트의 owner에게만 전송한다.							
						//_wsocket.send_todo_msg(obj);
						gBodyM.send_box_msg(obj, 'todo');
					}

					
					if (member_list.length > 0){
						var smsg = new Object();
						smsg.msg = "[" + gap.textToHtml(gTodoM.cur_project_name) + "] " + gTodoM.short_title(obj.title) + " - " + gap.lang.reg_reply;	
						smsg.title =  gTodoM.systitle + "["+gTodoM.todo_title+"]";
						smsg.type = "reply";
						smsg.key1 = gTodoM.cur_project_code;
						smsg.key2 = gTodoM.select_id;
						smsg.key3 = "";
						smsg.fr = gap.userinfo.rinfo.nm;
						//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
						smsg.sender = member_list.join("-spl-");										
					//	gap.push_noti_mobile(smsg);	
						
						//알림센터에 푸쉬 보내기
						var rid = gTodoM.cur_project_code;
						var receivers = member_list;
						var msg2 = "[" + gTodoM.short_title(obj.title) + "] " + gap.lang.reg_reply;
						var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(gTodoM.cur_project_name) +"]"
						var data = smsg;
						gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
					}
								
				}
				
			},
			error : function(e){
				gap.error_alert();
			}
		})
		
	    e.stopPropagation();
	    e.preventDefault();
	},
	
	"sendReplyMessage" : function(msg, mention_list){

		if (msg.trim() == ""){
			gap.gAlert(gap.lang.input_message);
			return false;
		}
		var owner = gap.userinfo.rinfo;
		
		var data = JSON.stringify({
			id : gTodoM.select_id,
			owner : owner,
			msg : msg,
			mention : mention_list
		});
		
		var url = gap.channelserver + "/reply_todo_save.km";
		$.ajax({
			type : "POST",
			dataType : "text",
			url : url,
			data : data,
			success : function(res){
				var rrx = JSON.parse(res);
			
				if (rrx.result == "OK"){
					$("#todo_compose_reply_list").show();
					
					var id = rrx.data.tkey;
					var GMT = rrx.data.GMT;
					var user_info = gap.user_check(owner);
					var time = gap.change_date_localTime_full2(GMT);
					msg = msg = gTodoM.message_check(msg);
					
					if (msg.indexOf("&lt;/mention&gt;") > -1){
						//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
						msg = gap.textToHtml(msg).replace(/&nbsp;/g, " ");
					}
					
					var html = "";

					html += "<dl id='" + id + "' class='user'>";
					html += "	<dt>";
					html += "		<div>";
					html += "				<div class='user-thumb'>" + user_info.user_img + "</div>";
					html += "		</div>";
					html += "	</dt>";
					html += "	<dd>";
					html += "		<span>" + user_info.name + "<em class='team'>" + user_info.dept + "</em><em>" + time + "</em></span>";
					html += '		<button class="ico btn-edit" style="position:absolute; right:48px; top:14px"><span>수정</span></button>';
					html += "		<button class='ico btn-del1'><span>삭제</span></button>";
					html += "		<p>" + msg + "</p>";
					html += "	</dd>";
					html += "</dl>";
					
					$("#todo_compose_reply_list").append(html);
					
					//댓글 스크롤 하단으로 이동
					$("#todo_compose_reply_list").animate({ scrollTop: $('#todo_compose_reply_list').prop("scrollHeight")}, 1000);
					
					gTodoM.reply_count_check();
					
					//텍스트 박스 초기화
					//$("#todo_reply_input").val("");
										
					var change_doc = rrx.data.doc.doc;
					gTodoM.change_local_data(change_doc);
					
					gTodoM.__todo_compose_event();
					
					
					//webpush를 전송
					var dd = rrx.data.doc.doc;
					var rlist = gTodoM.search_todo_member_exit_me();
//					for (var i = 0 ; i < rlist.length; i++){
//						var sn = rlist[i];
//						
//					}
					
					if (rlist.length > 0){
						var obj = new Object();
						obj.id = dd.tlist;
						obj.type = "reply";  //change status
						obj.p_code = dd.project_code;
						obj.p_name = gap.textToHtml(dd.project_name);
						obj.title = dd.title;
						obj.sender = rlist;  //해당 프로젝트의 owner에게만 전송한다.							
						//_wsocket.send_todo_msg(obj);
						gBodyM.send_box_msg(obj, 'todo');
					}
					
										
					//모바일 push 전송
					var smsg = new Object();
					smsg.msg = "[" + gap.textToHtml(dd.project_name) + "] " + gTodoM.short_title(dd.title) + " - " + gap.lang.reg_reply;	
					smsg.title = gTodoM.systitle + "["+gTodoM.todo_title+"]";
					smsg.type = "reply";
					smsg.key1 = dd.project_code;
					smsg.key2 = dd._id.$oid;	//dd.tlist;
					smsg.key3 = "";
					smsg.fr = gap.userinfo.rinfo.nm;
					//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
					smsg.sender = rlist.join("-spl-");
					
					if (typeof mention_list != "undefined" && mention_list.length > 0){
						var mentions_ky = [];
						var mentions_em = [];
						
						for (var i = 0; i < mention_list.length; i++){
							var mention_info = mention_list[i];
							
							mentions_ky.push(mention_info.id);
							mentions_em.push(mention_info.em)
						}
						
						smsg.mention_log = "T";
						smsg.project_name = dd.project_name;
						smsg.emails = mentions_em.join("-spl-");
						smsg.sender = mentions_ky.join("-spl-");
						smsg.content = msg;
					//	gap.push_noti_mobile(smsg);		
						
					}else if (rlist.length > 0){
					//	gap.push_noti_mobile(smsg);		
					}
					
					//알림센터에 푸쉬 보내기
					var rid = dd.project_code;
					var receivers = rlist;
					var msg2 = "[" + gTodoM.short_title(dd.title) + "] " + gap.lang.reg_reply;
					var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(dd.project_name) +"]"
					var data = smsg;
					gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
					
					$('html, body').animate({ scrollTop:$(document).height() }, 0 , function(){});
					
				}
				
			},
			error : function(e){
				gap.error_alert();
			}
		})
	},
	
	"__todo_selectDate_event" : function(){
		$('#todo_startdate').off();
		$('#todo_startdate').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			theme: 'ios',
			themeVariant : 'light',
			dateFormat: 'YYYY-MM-DD',
			select: 'range',
		//	startInput: '#todo_startdate',
		//	endInput: '#todo_enddate',
			onChange: function (event, inst) {
				var _period = ($('#todo_startdate').val() == " - " ? "" : $('#todo_startdate').val());	// 최초 로딩 시 기간입력 필드의 값은 " - "임 >>> mobiscroll이 이렇게 세팅함.
				if (_period != event.valueText){
					var startdate = moment.utc(event.inst._tempStartText).format();
					var enddate = moment.utc(event.inst._tempEndText).format();

					var data = JSON.stringify({
						startdate : startdate,
						enddate : enddate,
						select_id : gTodoM.select_id,
						project_code : gTodoM.select_todo.project_code
					});

					var url = gap.channelserver + "/update_todo_item_sub_date.km";
					$.ajax({
						type : "POST",
						dataType : "json",
						contentType : "application/json; charset=utf-8",
						data : data,
						url : url,					
						success : function(res){
							if (res.result == "OK"){
								var change_doc = res.data.doc;
								gTodoM.change_local_data(change_doc);
								
								//날짜가 변경될 경우 담당자의 일정을 수정해 준다.
								gap.schedule_update(change_doc, "asignee", "U");
								
							}else{
								gap.error_alert();
							}
						},
						error : function(e){
							gap.error_alert();
						}
					});
				}
		    }
		});

		
		
	/*	$("#todo_startdate").off();
		$("#todo_startdate").on("click", function(){
			var url_link = "kPortalMeet://NativeCall/callTodoCalendar"
				+ "?param1=start"
				+ "&param2="
			gBodyM.connectApp(url_link);
			return false;	
		});
		
		$("#todo_enddate").off();
		$("#todo_enddate").on("click", function(){
			var url_link = "kPortalMeet://NativeCall/callTodoCalendar"
				+ "?param1=end"
				+ "&param2="
			gBodyM.connectApp(url_link);
			return false;	
		});	*/
	},
	
	"__item_delete_event" : function(){
		//담당자가 여러명인 경우
//		$(".todo-owner .btn-g-del").off();
//		$(".todo-owner .btn-g-del").on("click", function(e){
//			var _self = $(this);

//			var del_key = _self.closest("div.user").find(".user-thumb-parent").attr("data-ky");	
//		//	var del_key_json = gTodoM.search_user_cur_project_info(del_key);
//			
//			//var del_text = $(this).parent().text();
//			var data = JSON.stringify({
//				todo_id : gTodoM.select_id,
//				ty : "owner",
//				//email : del_key_json.em
//				email : del_key
//			});
//			var url = gap.channelserver + "/delete_sub_item_todo.km";
//			//var url = gap.channelserver + "/delete_asignee_todo_multi.km";
//			$.ajax({
//				type : "POST",
//				dataType : "text",
//				url : url,
//				data : data,
//				success : function(res){
//					var rres = JSON.parse(res);
//					if (rres.result == "OK"){
//						/*						
//						var html = "<img src='" + cdbpath + "/img/user_d.jpg' alt=''>";
//						$(".todo-owner .user-thumb").html(html);
//						$(".todo-owner .user-thumb").attr("id", "asignee_btn");
//						$(".todo-owner .btn-g-del").remove();
//						*/
//						var list = _self.closest("div.user").find(".user-thumb-parent");
//						
//						for (var i = 0 ; i < list.length; i++){
//							if ($(list[i]).attr("data-ky") == del_key){
//								$(list[i]).remove();
//							}
//						}
//						
//						var change_doc = rres.data.doc;
//						gTodoM.change_local_data(change_doc);
//						
//						gTodoM.__todo_compose_event();
//						
//					}else{
//						gap.error_alert();
//					}
//				},
//				error : function(e){
//					gap.error_alert();
//				}
//			});
//		});
		
		//담당자가 1명인 경우
		$(".todo-owner .btn-g-del").off();
		$(".todo-owner .btn-g-del").on("click", function(e){
			//gTodo.cur_obj = e;
			var del_text = $(this).parent().text();
			var data = JSON.stringify({
				todo_id : gTodoM.select_id,
				ty : "owner"
			});
			var url = gap.channelserver + "/delete_sub_item_todo.km";
			$.ajax({
				type : "POST",
				dataType : "text",
				url : url,
				data : data,
				success : function(res){
					var rres = JSON.parse(res);
					if (rres.result == "OK"){
					
						
						
						var html = "<img src='" + cdbpath + "/img/user_d.jpg' alt=''>";
					//	$(".todo-owner .user-thumb").html(html);
					//	$(".todo-owner .user-thumb").attr("id", "asignee_btn");
					//	$(".todo-owner .btn-g-del").remove();
					//	$(gTodo.cur_obj).remove();
						
						$("#main_owner .user-thumb").html(html);
						$("#main_owner .user-thumb").attr("id", "asignee_btn");
						$("#main_owner .btn-g-del").remove();
						
						//일정에 삭제를 요청한다.  삭제 버튼 클릭시
						var obb = new Object();						
						obb.del_id = gTodoM.select_todo.project_code + "^" + gTodoM.select_todo._id.$oid;
						obb.del_emp = gTodoM.select_todo.asignee.ky;
						gap.schedule_update(obb, "asignee", "D");
						
						
						
						var change_doc = rres.data.doc;
						gTodoM.change_local_data(change_doc);
						
						gTodoM.__todo_compose_event();
						
						
						
						gTodoM.select_todo = change_doc;
						
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});
		});
		
		
		
		$(".todo-tag .btn-g-del").off();
		$(".todo-tag .btn-g-del").on("click", function(e){
			$(this).parent().remove();
			var del_text = $(this).parent().text();
			var data = JSON.stringify({
				todo_id : gTodoM.select_id,
				del_text : del_text,
				ty : "tag"
			});
			var url = gap.channelserver + "/delete_sub_item_todo.km";
			$.ajax({
				type : "POST",
				dataType : "text",
				url : url,
				data : data,
				success : function(res){
					var rres = JSON.parse(res);
					if (rres.result == "OK"){
												
						var change_doc = rres.data.doc;
						gTodoM.change_local_data(change_doc);
						
						gTodoM.__item_delete_event();

					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});
			
		});
		
		$(".todo-color .btn-g-del").off();
		$(".todo-color .btn-g-del").on("click", function(e){
			
			var cls = $(this).parent().attr("class").replace("color ", "");
			var del_text = $(this).parent().text();
			var data = JSON.stringify({
				todo_id : gTodoM.select_id,
				ty : "color"
			});
			var url = gap.channelserver + "/delete_sub_item_todo.km";
			$.ajax({
				type : "POST",
				dataType : "text",
				url : url,
				data : data,
				success : function(res){
					var rres = JSON.parse(res);
					if (rres.result == "OK"){

						var change_doc = rres.data.doc;
						gTodoM.change_local_data(change_doc);
						
						$(".todo-color .color").remove();
						$(".todo-color").append("<button class='btn-color-add' id='todo_color_add'>색상추가</button>");

						gTodoM.__todo_compose_event();
						
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});
		});
	},	
	
	"check_in_asignee" : function(val){
		var res = false;
		var list = $(gTodoM._click_obj).closest("div").find(".user-thumb-parent");
		if (list.length > 0){
			for (var i = 0 ; i < list.length; i++){
				if ($(list[i]).attr("data-ky") == val){
					res = true;
					return res;
				}
			}
		}		
		return res;
	},
	
	"__todo_compose_event" : function(){
		//멘션을 클릭한 경우 사용자 정보를 표시한다.
		$(".message-reply mention").off();
		$(".message-reply mention").on("click", function(e){
			var id = $(this).attr("data");
			var url_link = "kPortalMeet://NativeCall/callUserProfile?ky=" + encodeURIComponent(id);
			gBodyM.connectApp(url_link);
			return false;
		});
		
		//기존에 체크리스트에 대한 이벤트를 적용한다.
		gTodoM.__todo_checklist_after_event();
		
		if (gTodoM.compose_admin){
			gTodoM.__todo_selectDate_event();
			gTodoM.__item_delete_event();
		}
		
			
		//작성창이 띄워질때 멤버들을 세팅해 놓는다.	//////////////////////////////////////////////////////////////////////////////////////////////
	//	var list = gTodoM.cur_project_info.member;
		var list = [];
		$(gTodoM.cur_project_info.member).each(function(idx, val){
			if (val.dsize != "group"){
				list.push(val);
			}
			
		});
		list.push(gTodoM.cur_project_info.owner);

		list = sorted=$(list).sort(gap.sortNameDesc);
		
		$("#members").empty();
		for (var i = 0 ; i < list.length; i++){
			var member = list[i];
			var user_info = gap.user_check(member);
			var html = "<li data='li_"+user_info.ky+"' style='height:65px'>"+user_info.user_img;
			html += "<h3 style='font-size:14px' data='"+user_info.ky+"'>"+ user_info.name + " " + user_info.jt; // + "/" + user_info.jt ;
			html += "<br><span style='font-size:11px'>"+user_info.dept+"</span>";
			html += "</h3>";
			html += "</li>";
			$("#members").append(html);
		}
	/*	var user_info = gap.user_check(gTodoM.cur_project_info.owner);
		var html = "<li data='li_"+user_info.ky+"' style='height:65px'>"+user_info.user_img;
		html += "<h3 style='font-size:14px' data='"+user_info.ky+"'>"+ user_info.name + gap.lang.hoching; // + "/" + user_info.jt ;
		html += "<br><span style='font-size:11px'>"+user_info.dept+"</span>";
		html += "</h3>";
		html += "</li>";
		$("#members").append(html);*/
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		$("#m_todo_owner").off();
		$("#m_todo_owner").on("click", function(e){
			
			if (gTodoM.compose_admin){
				gTodoM._click_obj = $(e.currentTarget);
				
				var click_id = $(this).attr("id");
				gTodoM.click_checklist_id = click_id;
				
	
				$("body").css("overflow", "hidden");
				$('#memberlist').show();					
				$('#members').mobiscroll4().listview({
					theme: 'ios',
					themeVariant: 'light',
					swipe : false,
					striped: true,
			        enhance: true, 
					onItemTap: function (event, inst) {
						
						$("body").css("overflow-y", "auto");			
						scrollable.hide();					
						
						var ky = $(event.target).find("h3").attr('data');
						var info = gTodoM.search_user_cur_project_info(ky);	
						var user_info = gap.user_check(info);
						
						//TODO 전체 담당자를 선택한 경우 별도 처리해 준다.
						var data = JSON.stringify({
							owner : info,
							key : gTodoM.select_id
						});
						var url = gap.channelserver + "/update_todo_owner.km";
						$.ajax({
							type : "POST",
							dataType : "json",
							conteType : "application/json; charset=utf-8",
							data : data,
							url : url,
							success : function(res){
								if (res.result == "OK"){
									var person_img = "<div class='user-thumb' id='m_todo_owner' data-ky='"+user_info.ky+"' style='cursor:pointer'>" + user_info.user_img + "</div>";
									$(gTodoM._click_obj).parent().prepend(person_img);
									$("#owner_disp_name").html(user_info.name + gap.lang.hoching);
									$("#owner_disp_dept").html(user_info.jt + "/" + user_info.dept);
				
									//gTodoM._click_obj는 체크리스트에서 사용자 선택 버튼을 클릭 할때 설정했음
									$(gTodoM._click_obj).qtip("destroy");
									$(gTodoM._click_obj).remove();
																			
									var change_doc = res.data.doc;
									gTodoM.change_local_data(change_doc);

									// Owner 변경 후 수행자와 같지 않을 경우 전역변수 초기화 ///////////////////////////
									gTodoM.select_todo = change_doc;
									if ((gTodoM.select_todo.owner.em != gap.userinfo.rinfo.em) && (gTodoM.cur_project_info.owner.em != gap.userinfo.rinfo.em)){
										gTodoM.compose_admin = false;
									}
									///////////////////////////////////////////////////////////
																				
									gTodoM.__item_delete_event();
									gTodoM.__todo_compose_event();
									
									//TODO 작성자거 변경된 경우 작성자로 지정된 사용자에게 알림
									if (change_doc.owner.ky != gap.userinfo.rinfo.ky){
										var obj = new Object();
										obj.id = change_doc._id.$oid;
										obj.type = "cw";  //change writer
										obj.p_code = change_doc.project_code;
										obj.p_name = gap.textToHtml(change_doc.project_name);
										obj.title = change_doc.title;
										var list = [];
										list.push(change_doc.owner.ky);
										obj.sender = list;  //해당 프로젝트의 owner에게만 전송한다.
										//_wsocket.send_todo_msg(obj);
										gBodyM.send_box_msg(obj, 'todo');
										
										
										var smsg = new Object();
										smsg.msg = "[" + change_doc.project_name + "] " + gTodoM.short_title(obj.title) + " - " + gap.lang.change_todo_writer;
										smsg.title =  gTodoM.systitle + "["+gTodoM.todo_title+"]";
										smsg.type = "cw";
										smsg.key1 = change_doc.project_code;
										smsg.key2 = change_doc._id.$oid;
										smsg.key3 = "";
										smsg.fr = gap.userinfo.rinfo.nm;										
										//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
										//smsg.sender = change_doc.asignee.ky.join("-spl-");	
										smsg.sender = change_doc.owner.ky;	
									//	gap.push_noti_mobile(smsg);		
										
										//알림센터에 푸쉬 보내기
										var rid = change_doc.project_code;
										var receivers = [];
										receivers.push(change_doc.owner.ky)
										var msg2 = "[" + gTodoM.short_title(obj.title) + "] " + gap.lang.change_todo_writer;
										var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(change_doc.project_name) +"]"
										var data = smsg;
										gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);			
									}
									
								}else{
									gap.error_alert();
								}
							},
							error : function(e){
								gap.error_alert();
							}
						});
					}
				});			
				
				var css = "";
				if (list.length > 5){
					css = "mbsc-no-padding md-content-scroll";
				}else{
					css = "mbsc-no-padding md-vertical-list";
				}
			
				var scrollable = $('#memberlist').mobiscroll4().popup({
					anchor: '#m_todo_owner',
		            display: 'bubble',            // Specify display mode like: display: 'bottom' or omit setting to use default
		            scrollLock: false,                              // More info about scrollLock: https://docs.mobiscroll.com/4-10-9/popup#opt-scrollLock
		            cssClass: css,  // More info about cssClass: https://docs.mobiscroll.com/4-10-9/popup#opt-cssClass
		            buttons: [],                                     // More info about buttons: https://docs.mobiscroll.com/4-10-9/popup#opt-buttons
		            onClose : function(event, inst){
						$("body").css("overflow-y", "auto");			
					}                                  
		        }).mobiscroll4('getInst');			
				
				scrollable.show();
			    return false;
								
			//	gTodoM.todo_select_user_layer(e);
			}else{
				mobiscroll4.toast({
					message: gap.lang.noauth
				});
				return false;
			}
		});			
		
		
		//단일 담당자의 경우
		$("#asignee_btn").off();
		$("#asignee_btn").on("click", function(e){
			
			if (gTodoM.compose_admin){
				gTodoM._click_obj = $(e.currentTarget);
				
				var click_id = $(this).attr("id");
				gTodoM.click_checklist_id = click_id;
				
				
				var ori_asignee_key = "";
				var info2 = "";
				if (typeof(gTodoM.select_todo.asignee) != "undefined"){
					ori_asignee_key = gTodoM.select_todo.asignee.ky;
					info2 = gTodoM.search_user_cur_project_info(ori_asignee_key);
				}	
				
	
				$("body").css("overflow", "hidden");
				$('#memberlist').show();					
				$('#members').mobiscroll4().listview({
					theme: 'ios',
					themeVariant: 'light',
					swipe : false,
					striped: true,
			        enhance: true, 
					onItemTap: function (event, inst) {
						
						$("body").css("overflow-y", "auto");			
						scrollable.hide();					
						
						var ky = $(event.target).find("h3").attr('data');
						var info = gTodoM.search_user_cur_project_info(ky);	
						var user_info = gap.user_check(info);
						
						//TODO 전체 담당자를 선택한 경우 별도 처리해 준다.
						var data = JSON.stringify({
							asignee : info,
							todo_id : gTodoM.select_id,
							ty : "add"
						});
						var url = gap.channelserver + "/update_asignee_todo.km";
						$.ajax({
							type : "POST",
							dataType : "json",
							conteType : "application/json; charset=utf-8",
							data : data,
							url : url,
							success : function(res){
								if (res.result == "OK"){
									var person_img = "<button class='btn-g-del'></button><div class='user-thumb' id='asignee_btn' data-ky='"+user_info.ky+"' style='cursor:pointer'>" + user_info.user_img + "</div>";
									$(gTodoM._click_obj).parent().append(person_img);
				
									//gTodoM._click_obj는 체크리스트에서 사용자 선택 버튼을 클릭 할때 설정했음
									$(gTodoM._click_obj).qtip("destroy");
									$(gTodoM._click_obj).remove();
																			
									var change_doc = res.data.doc;
									gTodoM.change_local_data(change_doc);
																				
									gTodoM.__item_delete_event();
									gTodoM.__todo_compose_event();
									
													
									
									if (ori_asignee_key == "" || ori_asignee_key == change_doc.asignee.ky){
										//alert("기존 담당자와 신규 선택 담당자가 동일할 경우 또는 최초 등록인 경우")
										//기존 담당자와 신규 선택 담당자가 동일할 경우 또는 최초 등록인 경우
										//기존 데이터를 업데이트 한다.
										
										gap.schedule_update(change_doc, "asignee", "U");
									}else{
										//기존 담담자와 신규 담당자가 틀릴 경우
										// 기존 담당자의 업무를 제거한다.
										//alert("기존 담담자와 신규 담당자가 틀릴 경우");
										
										var obb = new Object();						
										obb.del_id = gTodoM.select_todo.project_code + "^" + gTodoM.select_todo._id.$oid;
										obb.del_emp = info2.ky;
										gap.schedule_update(obb, "asignee", "D");
										//신규 담당자의 업무를 등록한다.
										gap.schedule_update(change_doc, "asignee", "U");
									}
									gTodoM.select_todo = change_doc;
							
									//TODO에 담당자를 지정할 경우 해당 사용자에게 TODO가 할당되었음을 실시간 알려준다.
									if (change_doc.asignee.ky != gap.userinfo.rinfo.ky){
										var obj = new Object();
										obj.id = change_doc._id.$oid;
										obj.type = "as";  //change status
										obj.p_code = change_doc.project_code;
										obj.p_name = gap.textToHtml(change_doc.project_name);
										obj.title = change_doc.title;
										obj.sender = change_doc.asignee.ky;  //해당 프로젝트의 owner에게만 전송한다.
										//_wsocket.send_todo_msg(obj);	
										gBodyM.send_box_msg(obj, 'todo');
										
										var smsg = new Object();
										smsg.msg = "[" + gap.textToHtml(change_doc.project_name) + "] " + obj.title + " - " + gap.lang.csm;
										smsg.title = gTodoM.systitle + "["+gTodoM.todo_title+"]";	
										smsg.type = "as";
										smsg.key1 = change_doc.project_code;
										smsg.key2 = change_doc._id.$oid;
										smsg.key3 = "";
										smsg.fr = gap.userinfo.rinfo.nm;
										//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
										//smsg.sender = change_doc.asignee.ky.join("-spl-");	
										smsg.sender = change_doc.asignee.ky;	
									//	gap.push_noti_mobile(smsg);	
										
										//알림센터에 푸쉬 보내기
										var rid = change_doc.project_code;
										var receivers = [];
										receivers.push(change_doc.asignee.ky);
										var msg2 =  "[" + obj.title + "] " +  gap.lang.csm;
										var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(change_doc.project_name) +"]"
										var data = smsg;
										gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);				
									}
									
								}else{
									gap.error_alert();
								}
							},
							error : function(e){
								gap.error_alert();
							}
						});
					}
				});			
				
				var css = "";
				if (list.length > 5){
					css = "mbsc-no-padding md-content-scroll";
				}else{
					css = "mbsc-no-padding md-vertical-list";
				}
			
				var scrollable = $('#memberlist').mobiscroll4().popup({
					anchor: '#asignee_btn',
		            display: 'bubble',            // Specify display mode like: display: 'bottom' or omit setting to use default
		            scrollLock: false,                              // More info about scrollLock: https://docs.mobiscroll.com/4-10-9/popup#opt-scrollLock
		            cssClass: css,  // More info about cssClass: https://docs.mobiscroll.com/4-10-9/popup#opt-cssClass
		            buttons: [],                                     // More info about buttons: https://docs.mobiscroll.com/4-10-9/popup#opt-buttons
		            onClose : function(event, inst){
						$("body").css("overflow-y", "auto");			
					}                                  
		        }).mobiscroll4('getInst');			
				
				scrollable.show();
			    return false;
								
			//	gTodoM.todo_select_user_layer(e);
			}else{
				mobiscroll4.toast({
					message: gap.lang.noauth
				});
				return false;
			}
		});	
		
		
		//멀티 담당자의 경우
		$(".todo-owner .btn-asignee-add").off().on("click", function(e){
			
			if (gTodoM.compose_admin || gTodoM.compose_asignee){
				gTodoM._click_obj = $(e.currentTarget);
				
				var click_id = $(this).attr("id");
				gTodoM.click_checklist_id = click_id;

				$("body").css("overflow", "hidden");

				var list = $.extend([], gTodoM.cur_project_info.member);
				list.unshift(gTodoM.cur_project_info.owner);
				
				var css = "";
				if (list.length > 5){
					css = "mbsc-no-padding md-content-scroll";
				}else{
					css = "mbsc-no-padding md-vertical-list";
				}

			//	var scrollable = $('#multi_memberlist').mobiscroll4().popup({
				var scrollable = $('#memberlist').mobiscroll4().popup({
					anchor: '#todo_asignee_add',
		            display: 'bubble',            
		            scrollLock: false,                             
		            cssClass: css,  
		            buttons: [],     
		            onBeforeShow : function(event, inst){
						var user_info, html = "";
						for (var i = 0 ; i < list.length; i++){
							user_info = gap.user_check(list[i]);
											
							if (gTodoM.check_in_asignee(user_info.ky)){
								html += "<li data='li_"+user_info.ky+"' style='height:65px' data-selected='true'>";
							} else {
								html += "<li data='li_"+user_info.ky+"' style='height:65px'>";
							}
							
							html += user_info.user_img;
							html += "<h3 style='font-size:14px' data='"+user_info.ky+"'>"+ user_info.name + gap.lang.hoching; // + "/" + user_info.jt ;
							html += "<br><span style='font-size:11px'>"+user_info.dept+"</span>";
							html += "</h3>";
							html += "</li>";
						}
					//	$("#multi_members").empty().append(html).mobiscroll4().listview({
						$("#members").empty().append(html).mobiscroll4().listview({
							theme: 'ios',
							themeVariant: 'light',
							swipe : false,
							striped: true,
					        enhance: true
					      //  select: 'multiple'
						});
					
					},
		       //     onClose : function(event, inst){
					onClose : function(event, inst){
						
						$("body").css("overflow-y", "auto");
						scrollable.hide();
						
						var key, user_info;
						var asignee_list = [], user_info_list = [], before_key_list = [], after_key_list = [];
					//	$.each($('#multi_members li[data-selected="true"]'), function(i,el){
						$.each($('#members li[data-selected="true"]'), function(i,el){
							key = $(el).attr("data").replace(/li_/g, '');
							after_key_list.push(key);
							user_info = gTodoM.search_user_cur_project_info(key);
							asignee_list.push(user_info);
							user_info_list.push(gap.user_check(user_info));
						});
						
						// 담당자 변동사항이 없을 경우에는 저장처리하지 않음
						var list = $(gTodoM._click_obj).closest("div").find(".user-thumb-parent");;	
						for (var i = 0 ; i < list.length; i++){
							before_key_list.push($(list[i]).attr("data-ky"));
						}
						after_key_list.sort();
						before_key_list.sort();
						if (after_key_list.length == 0){
							return;
						}
						if (after_key_list.equals(before_key_list) == true) {
							//console.log('담당자 변동사항이 없으므로 저장안함');
							return;
						}

						var post_data = JSON.stringify({
							asignee : asignee_list,
							todo_id : gTodoM.select_id,
							ty : "replace" // add : 담당자 1명을 추가 , replace : 선택된 담당자들로 교체
						});
						
				//		var url = gap.channelserver + "/update_asignee_todo_multi.km";
						var url = gap.channelserver + "/update_asignee_todo.km";
						$.ajax({
							type : "POST",
							dataType : "json",
							conteType : "application/json; charset=utf-8",
							data : post_data,
							url : url,
							success : function(res){
								if (res.result == "OK"){
									var before_asignee = [];
									var list = $(gTodoM._click_obj).closest("div").find(".user-thumb-parent");
									if (list.length > 0){
										for (var i = 0 ; i < list.length; i++){
											before_asignee.push(gTodoM.search_user_cur_project_info($(list[i]).attr("data-ky"))); // 문서 수정 전 담당자 정보
										}
									}
								
									asignee_layer = $(gTodoM._click_obj).closest("div").find(".user");
									asignee_layer.empty();
									for (var i = 0 ; i < user_info_list.length; i++){
										person_img = (gTodoM.compose_admin ? "<button class='btn-g-del'></button>" : "") + "<div class='user-thumb'>"+user_info_list[i].user_img+"</div>";
										asignee_layer.append("<div class='user-thumb-parent' data-ky='"+user_info_list[i].ky+"'>"+person_img+"</div>");	
									}
																			
									var change_doc = res.data.doc;
									gTodoM.change_local_data(change_doc);
									
									after_asignee = change_doc.asignee; // 문서 수정 후 담당자 정보
									
									// 담당자 변경 후 수행자와 같지 않을 경우 전역변수 초기화 ///////////////////////////
									gTodoM.select_todo = change_doc;
									gTodoM.compose_asignee = false;
									var asignee_list = gTodoM.select_todo.asignee;
									if (asignee_list!=undefined && asignee_list != ""){
										if (Array.isArray(asignee_list)==false) {
											if (asignee_list.em == gap.userinfo.rinfo.em) gTodoM.compose_asignee = true;
										} else {
											for (i=0;i<asignee_list.length;i++) {
												if (asignee_list[i].em == gap.userinfo.rinfo.em) gTodoM.compose_asignee = true;
											}
										}
									}
									///////////////////////////////////////////////////////////
																				
									gTodoM.__item_delete_event();
									gTodoM.__todo_compose_event();
									
									// Push 메시지 전송 처리 (담당자 변경 알림) - 담당자로 추가된 사용자만 전송
									
									if (after_asignee != undefined) {
										for (i=0;i<after_asignee.length;i++) {
											
											function isEqID(element, index, array) {
												return element.ky == after_asignee[i].ky
											}

											if (after_asignee[i].ky != gap.userinfo.rinfo.ky && before_asignee.some(isEqID) == false){ // 본인이 아니고 이전 담당자가 아닌 경우, 즉 신규 담당자인 경우에만 Push 메시지 전송
												var obj = new Object();
												obj.id = change_doc._id.$oid;
												obj.type = "as";  //change status
												obj.p_code = change_doc.project_code;
												obj.p_name = gap.textToHtml(change_doc.project_name);
												obj.title = change_doc.title;
											//	obj.sender = after_asignee[i].ky;						
												//_wsocket.send_todo_msg(obj);	
												var list = [];
												list.push(after_asignee[i].ky);
												obj.sender = list;
												gBodyM.send_box_msg(obj, 'todo');
												
												//모바일 Push를 전송한다.
												var smsg = new Object();
												smsg.msg = "[" + gap.textToHtml(change_doc.project_name) + "]" + gTodoM.short_title(obj.title) + " - " + gap.lang.csm;
												smsg.title = gTodoM.systitle + "["+gTodoM.todo_title+"]";
												smsg.type = "as";
												smsg.key1 = change_doc.project_code;
												smsg.key2 = change_doc._id.$oid;
												smsg.key3 = "";
												smsg.fr = gap.userinfo.rinfo.nm;
												smsg.sender = after_asignee[i].ky;	
											//	gap.push_noti_mobile(smsg);	
												
													//알림센터에 푸쉬 보내기
												var rid = change_doc.project_code;
												var receivers = [];
												receivers.push(after_asignee[i].ky);
												var msg2 = "[" + gTodoM.short_title(obj.title) + "] "+ gap.lang.csm;	
												var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(change_doc.project_name) +"]"
												gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
											}
										}
									}
								}else{
									gap.error_alert();
								}
							},
							error : function(e){
								gap.error_alert();
							}
						});
						
						
					}                                  
		        }).mobiscroll4('getInst');			
				
				scrollable.show();
			    return false;
			}else{
				mobiscroll4.toast({
					message: gap.lang.noauth
				});
				return false;
			}
		});		
		
		$(".todo-color .btn-color-add").off();
		$(".todo-color .btn-color-add").on("click", function(e){
			gTodoM._click_obj = $(e.currentTarget);

			var click_id = $(this).attr("id");
			gTodoM.click_checklist_id = click_id;
			gTodoM.todo_select_color_layer(e);
		});
		
		$(".todo-color .color").off();
		$(".todo-color .color").on("click", function(e){
			gTodoM._click_obj = $(e.currentTarget);
			
			var click_id = $(this).attr("id");
			gTodoM.click_checklist_id = click_id;
			gTodoM.todo_select_color_layer(e);
		});			
		
		//상태값 변경시 호출
		$("#st_sel").off();
		$("#st_sel").on("change", function(e){
			var key = $("#st_sel option:selected").attr("id");
			var skey = key.replace("chx_", "");
			
			var data = JSON.stringify({
				project_code : gTodoM.cur_project_code,
				update_key : "status",
				update_data : skey,
				select_key : "_id",
				select_id : gTodoM.select_id
			});

			var url = gap.channelserver + "/update_todo_item_sub.km";
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				data : data,
				url : url,
				success : function(res){
					if (res.result == "OK"){
						//리스트 모드 인지 카드 모드 인지에 따라 선택된 데이터를 이동한다.
						var change_doc = res.data.doc;
						gTodoM.change_local_data(change_doc);
						
						//상태가 변경될 경우 알려주는 함수를 호출한다. //////////////
						//알려주는 대상자는 1. 프로젝트 Owner, 2. TODO 작성자
												
						var obj = new Object();
						obj.id = change_doc._id.$oid;
						obj.type = "cs";  //change status
						obj.p_code = change_doc.project_code;
						obj.p_name = gap.textToHtml(change_doc.project_name);
						obj.title = change_doc.title;
						obj.status = change_doc.status;
						
						var tsender = [];
						if (gTodo.cur_project_info.owner.ky != gap.userinfo.rinfo.ky){							
							//obj.sender = gTodo.cur_project_info.owner.ky;  //해당 프로젝트의 owner에게만 전송한다.							
							//_wsocket.send_todo_msg(obj);
							var list = [];
							list.push(gTodo.cur_project_info.owner.ky);
							obj.sender = list;
							gBodyM.send_box_msg(obj, 'todo');
							tsender.push(gTodo.cur_project_info.owner.ky);
						}
						//현재 수정하는 사용자가  TODO생성자가 아닐 경우 TODO생성자에게 알림을 전송한다.		
						if (gTodo.cur_project_info.owner.ky != gTodo.select_todo.owner.ky){	
							if (gTodo.select_todo.owner.ky != gap.userinfo.rinfo.ky){
								//obj.sender = gTodo.select_todo.owner.ky;  //TODO생성자에게 전송한다.						
								//_wsocket.send_todo_msg(obj);
								var list = [];
								list.push(gTodo.select_todo.owner.ky);
								obj.sender = list;
								gBodyM.send_box_msg(obj, 'todo');
								gTodo.cur_project_info.owner.ky 
								tsender.push(gTodo.select_todo.owner.ky);
							}
						}													
						//////////////////////////////////////////////////////	

						 //모바일  Push를 날린다. ///////////////////////////////////		
						var mx = "";
						if (obj.status == "0"){
							mx = gap.lang.temps;
						}else if (obj.status == "1"){
							mx = gap.lang.wait;
						}else if (obj.status == "2"){
							mx = gap.lang.doing;
						}else if (obj.status == "3"){
							mx = gap.lang.done;
						}
						var smsg = new Object();
						smsg.msg = "[" + change_doc.project_name + "] " + gTodoM.short_title(obj.title) + " - " + gap.lang.cs.replace("$s",mx);
						smsg.title =  gTodoM.systitle + "["+gTodoM.todo_title+"]";	
						smsg.type = "cs";
						smsg.key1 = change_doc.project_code;
						smsg.key2 = change_doc._id.$oid;
						smsg.key3 = "";
						smsg.fr = gap.userinfo.rinfo.nm;
						//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
						if (tsender.length > 0){
							smsg.sender = tsender.join("-spl-");
							//gap.push_noti_mobile(smsg);
							//알림센터에 푸쉬 보내기
							var rid = change_doc.project_code;
							var receivers = tsender;
							var msg2 = "[" + gTodoM.short_title(obj.title) + "] " + gap.lang.cs.replace("$s",mx);
							var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(change_doc.project_name) +"]"
							gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
						}																				
						//////////////////////////////////////////////////////
						
						
						
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});
		});
		
		//우선 순위 변경시 호출
		$("#pt_sel").off();
		$("#pt_sel").on("change", function(e){
			var key = $("#pt_sel option:selected").attr("id");
			var skey = parseInt(key.replace("chp_", ""));
			
			var data = JSON.stringify({
				project_code : gTodoM.cur_project_code,
				update_key : "priority",
				update_data : skey,
				select_key : "_id",
				select_id : gTodoM.select_id
			});

			var url = gap.channelserver + "/update_todo_item_sub.km";
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				data : data,
				url : url,
				success : function(res){
					if (res.result == "OK"){
						var change_doc = res.data.doc;
						gTodoM.change_local_data(change_doc);

					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});
		});
		
		gTodoM.__todo_file_event();
		
		//댓글 입력 이벤트 처리	
		$("#todo_reply_send_btn").off();
		$("#todo_reply_send_btn").on("click", function(e){
			gTodoM.sendMessage(e);
		});
		
		
		gTodoM.__checklist_box_click_event();
		
		//체크리스트를 등록한다.
		$("#todo_compose_checklist_save").off();
		$("#todo_compose_checklist_save").keypress(function(e){
			if (e.keyCode == 13){
				var tid = new Date().getTime() + "_" + Math.random().toString(26).substr(2,11);
				var txt = $(this).val();
				
				var data = JSON.stringify({
					tid : tid,
					txt : txt,
					key : gTodoM.select_id,
					type : "checklist",
					action : "add",
					complete : "F"
				});
				var url = channelserver + "/update_todo_item_list.km";
				$.ajax({
					type : "POST",
					dataType : "text",
					url : url,
					data : data,
					success : function(res){
						var rres = JSON.parse(res);
						var change_doc = rres.data.doc;
						gTodoM.change_local_data(change_doc);
						
						gTodoM.__checklist_box_click_event();						
						gTodoM.__todo_checklist_after_event();
						
						//전체 건수를 표시해야 한다.
						gTodoM.checklist_count_check();
					},	
					error : function(e){
						gap.error_alert();
					}
				});
				
				var html = '';
				html += '<li id="' + tid + '">';
				html += '	<button class="ico btn-check">체크</button>';
				html += '	<p>' + txt + '</p>';
				html += '	<dl class="todo-list-right">';
				html += '		<dd><span class="btn-time"><button id="time_' + tid + '" class="ico ico-time">시간</button></span></dd>';
				html += '		<dd><button class="ico btn-user-add">사용자추가</button></dd>';
				html += '		<dd><button class="ico btn-more">더보기</button></dd>';
				html += '	</dl>';
				html += '</li>';
				
				$("#todo_compose_checklist").append(html);
				$(this).val("");
			}
		});

		
		//설명문구에 포커스가 들어가면 저장 버튼이 표시딘다.
		$("#todo_compose_express_edit").focus(function(e){
			//$("#todo_compse_express_save").show();
		});
		
		$("#todo_compose_express_edit").blur(function(e){
			$("#todo_compose_express_save_btn").click();
		});
		
		$("#todo_compose_express_save_btn").off();
		$("#todo_compose_express_save_btn").on("click", function(e){
			//할일 설명을 업데이트 한다.
			var data = JSON.stringify({
				key : gTodoM.select_id,
				express : $("#todo_compose_express_edit").val(),
				project_code : gTodoM.cur_roject_code
			});
			var url = gap.channelserver + "/update_todo_item.km";
			$.ajax({
				type : "POST",
				dataType : "text",
				data : data,
				url : url,
				success : function(res){
					var rres = JSON.parse(res);
					if (rres.result == "OK"){
						$("#todo_compse_express_save").hide();
						
						var change_doc = rres.data.doc;
						gTodoM.change_local_data(change_doc);
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});
		});		
		
		$("#todo_compose_title").focus(function(e){
			gTodoM.title = $(this).val();
		});
		
		$("#todo_compose_title").blur(function(e){
			if (gTodoM.title != $(this).val()){
				var data = JSON.stringify({
					key : gTodoM.select_id,
					title : $("#todo_compose_title").val()
				});
				var url = gap.channelserver + "/update_todo_item.km";
				$.ajax({
					type : "POST",
					dataType : "text",
				//	contentType : "application/json; charset=utf-8",
					data : data,
					url : url,
					success : function(res){
						var rres = JSON.parse(res);
						var change_doc = rres.data.doc;
						gTodoM.change_local_data(change_doc);
					},
					error : function(e){
						gap.error_alert();
					}
				});
			}
		});
		
		
		
		$("#todo_compose_tag").off();
		$("#todo_compose_tag").keypress(function(e){
			if (e.keyCode == 13){
				
				var tag = $(this).val();
				if (tag.trim() == ""){
					$(this).val("");
					gap.gAlert(gap.lang.input_tag);
					return false;
				}
				var data = JSON.stringify({
					tag : tag,
					todo_id : gTodoM.select_id,
					ty : "add"
				});
				var url = gap.channelserver + "/update_tag_todo.km";
				$.ajax({
					type : "POST",
					dataType : "text",
					url : url,
					data : data,
					success : function(res){
						var rrx = JSON.parse(res);
					
						if (rrx.result == "OK"){
							$("#tag_list_ul").append("<span>" + tag + "<button class='btn-g-del'></button></span>");
							$("#todo_compose_tag").val("");
							
							var change_doc = rrx.data.doc;
							gTodoM.change_local_data(change_doc);
							
							gTodoM.__item_delete_event();
						}
					},
					error : function(e){
						gap.error_alert();
					}
				});
			}
		});
		
		$("#todo_compose_reply_list .btn-edit").off();
		$("#todo_compose_reply_list .btn-edit").on("click", function(e){
			
			var rid = $(e.currentTarget).parent().parent().attr("id");
			var mention_list = $(e.currentTarget).data("mention");
			
			var message = "";
			message = $(e.currentTarget).parent().find("p").html();
			
			if (typeof(message) == "undefined"){
				message = "";
			}

			if (message != ""){
				message = message.replace(/\<br\>/gi, "\n").replace(/&nbsp;/gi," ");
			}
			
			var url_link = "kPortalMeet://NativeCall/callTodoReplyModify?content=" + encodeURIComponent(message) + "&tid=" + gTodoM.select_id + "&rid=" + rid;
			gBodyM.connectApp(url_link);
			return false;
		});
		
		$("#todo_compose_reply_list .btn-del1").off();
		$("#todo_compose_reply_list .btn-del1").on("click", function(e){
			var todo_id = gTodoM.select_id;
			var rid = $(e.currentTarget).parent().parent().attr("id");
			
			var url = gap.channelserver + "/delete_reply_todo.km";
			var data = JSON.stringify({
				"todo_id" :  todo_id,				
				"rid" : rid
			});
			
			$.ajax({
				type : "POST",
				dataType : "json",
				url : url,
				data : data,
				success : function(res){						
					if (res.result == "OK"){							
						$("#" + rid).remove();
						
						gTodoM.reply_count_check();
						
						var change_doc = res.data.doc;
						gTodoM.change_local_data(change_doc);
						
					}else{
						gap.gAlert(gap.lang.errormsg);
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
				}
			});
		});
		
		//파일 업로드 호출
		$("#todoattach").on("click", function(e){
			var url_link = "kPortalMeet://NativeCall/callAddFile";
			gBodyM.connectApp(url_link);
			return false;
		});
		
		//댓글 입력란 호출
		$("#input_todo_reply").on("click", function(e){
			var url_link = "kPortalMeet://NativeCall/callTodoReply";
			gBodyM.connectApp(url_link);
			return false;
		});
		
	},
	
	"reply_modify_native" : function(todo_id, rid, msg, mention_list){
		
		var content = msg;
	
		var url = gap.channelserver + "/modify_reply_todo.km";
		var data = JSON.stringify({
			"todo_id" : todo_id,
			"rid" :  rid,
			"msg" : content,
			"mention" : mention_list
		});
		
		$.ajax({
			type : "POST",
			dataType : "text",
			url : url,
			data : data,
			success : function(ress){
				var res = JSON.parse(ress);

				if (res.result == "OK"){
					content = gBodyM.message_check(content);
					content = gap.textToHtml(content).replace(/&nbsp;/g, " ");
					$("#" + rid + " p").html(content);
					
					//모바일 푸시
					var member_list = $.unique(gap.check_cur_todo_members_mobile());
					var smsg = new Object();
					smsg.msg = "[" + gTodoM.select_todo.project_name + "] " + gTodoM.short_title(gTodoM.select_todo.title) + " - " + gap.lang.modify_reply;
					smsg.title =  gTodoM.systitle + "["+gTodoM.todo_title+"]";
					smsg.type = "reply";
					smsg.key1 = gTodoM.select_todo.project_code;
					smsg.key2 = gTodoM.select_todo._id.$oid;
					smsg.key3 = "";
					smsg.fr = gap.userinfo.rinfo.nm;
					//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
					smsg.sender = member_list.join("-spl-");
					
					if (mention_list.length > 0){
						var mentions_ky = [];
						var mentions_em = [];
						
						for (var i = 0; i < mention_list.length; i++){
							var info = mention_list[i];
							mentions_ky.push(info.id);
							mentions_em.push(info.em);
						}
						
						smsg.mention_log = "T";
						smsg.project_name = gTodoM.select_todo.project_name;
						smsg.emails = mentions_em.join("-spl-");
						smsg.sender = mentions_ky.join("-spl-");
						smsg.content = content;
					//	gap.push_noti_mobile(smsg);		
						
					}else if (member_list.length > 0){
					//	gap.push_noti_mobile(smsg);		
					}
					
					//알림센터에 푸쉬 보내기
					var rid = gTodoM.select_todo.project_code;
					var receivers = member_list;
					var msg2 = "[" + gTodoM.short_title(gTodoM.select_todo.title) + "] " + gap.lang.modify_reply;
					var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(gTodoM.select_todo.project_name) +"]"
					gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
								
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
	},		
	
	"__checklist_box_click_event" : function(){
		//체크박스 클릭할 경우
		$("#todo_compose_checklist .btn-check").off();
		$("#todo_compose_checklist .btn-check").on("click", function(e){
		
			var email = $(e.currentTarget).parent().attr("data");
			var check_id = $(e.currentTarget).parent().attr("id");
			var is_checklist_owner = false;
			if (email == gap.userinfo.rinfo.em){
				is_checklist_owner = true;
			}
			
			if (gTodoM.compose_admin || is_checklist_owner){
				var cc = "F";
				if ($(this).hasClass("on")){
					//선택된 것을 푼다.
					$(this).parent().removeClass("list-checked");
					$(this).removeClass("on");
					$(this).parent().find(".btn-time").removeClass("checked");
					
					//해당 체크 리스트를 완료 취소로 처리한다.
				}else{
					//클릭한것을 선택한다.
					$(this).parent().addClass("list-checked");
					$(this).addClass("on");
					$(this).parent().find(".btn-time").addClass("checked");		
					cc = "T";
				}
				
				//해당 체크 리스트를 제크 완료로 처리한다.
			
				//현재 클릭한 아이디의 배열에 완료예정일을 업데이트 한다.
				var click_id = $(this).parent().attr("id");
				var data = JSON.stringify({
					project_code : gTodoM.cur_project_code,
					update_key : "checklist.$.complete",
					update_data : cc,
					select_key : "checklist.tid",
					select_id : click_id,
					sid : gTodoM.select_id
				});

				var url = gap.channelserver + "/update_todo_item_sub.km";
				$.ajax({
					type : "POST",
					dataType : "text",
				//	contentType : "application/json; charset=utf-8",
					data : data,
					url : url,
					success : function(res){
						var rres = JSON.parse(res);
						if (rres.result == "OK"){
							var change_doc = rres.data.doc;
							gTodoM.change_local_data(change_doc);
							
						}else{
							gap.error_alert();
						}
					},
					error : function(e){
						gap.error_alert();
					}
				});
				gTodoM.checklist_count_check();
				
			}else{
				gap.gAlert(gap.lang.cppi);
			}
		});
	},
	
	"__todo_checklist_after_event" : function(){
		
		$("#todo_compose_checklist li p").off();
		$("#todo_compose_checklist li p").on("click", function(e){
			
			var html = "<div style='padding:5px'>" + $(this).text(); + "</div>";
			$(this).qtip({
				overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
				content : {
					text : html
				},
				show : {
					event: 'click',
					ready: true
				},
				hide : {
					event : 'click unfocus',
					//event : 'mouseout',
					fixed : true
				},
				style : {
					classes : 'qtip-bootstrap',
					tip : true
				},
				position : {
					my : 'bottom left',
					at : 'top top'
				},
				events : {
					show : function(event, api){						
					},
					hidden : function(event, api){
						api.destroy(true);
					}
				}
			});				
			
			
		});
		
		
//		$(".todo-list-right .ico-time").off();		
//		$(".todo-list-right .ico-time").on("click", function(e){	
//			if ( (gTodoM.compose_admin) || (gTodoM.compose_asignee)){						
//			}else{
//				return false;
//			}
//			
//			var term = $("#todo_startdate").val();
//			if (term == ""){
//				mobiscroll.toast({message:gap.lang.chdate, color:'danger'});
//				return false;
//			}
//			
//			var click_id = $(this).parent().parent().parent().parent().attr("id");
//			/*var url_link = "kPortalMeet://NativeCall/callTodoCalendar"
//				+ "?param1=check"
//				+ "&param2=" + click_id
//			gBodyM.connectApp(url_link);
//			return false;*/
//			
////			$('#time_' + click_id).off();
//			var picker = $('#time_' + click_id).mobiscroll().datepicker({
//				locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
//				theme: 'ios',
//				themeVariant : 'light',
//				display: 'anchored',
//				buttons: ['cancel'],
//				onCellClick: function (event, inst) {
//					
//					var new_date = new Date(event.date);
//					new_date = moment(new_date).format("YYYY-MM-DD")
//					
//					var select_date = moment.utc(new_date).format();
//					
//					if (gTodoM.select_todo.startdate > select_date){
//						mobiscroll.toast({message:gap.lang.chbefore, color:'danger'});
//						return false;
//					}
//					
//					if (gTodoM.select_todo.enddate < select_date){
//						mobiscroll.toast({message:gap.lang.chafter, color:'danger'});
//						return false;
//					}
//					
//					
//					gTodoM.setTodoDate(new_date, 'check', click_id);
//			    }
//			}).mobiscroll('getInst');
//			picker.open();
//			$('#time_' + click_id).mobiscroll('setVal', new Date($(this).parent().find("em").text()));
//			return false;
//			
//		});
		
		
		
		$(".todo-list-right .ico-time").off();		
		$(".todo-list-right .ico-time").on("click", function(e){	
			if ( (gTodoM.compose_admin) || (gTodoM.compose_asignee)){						
			}else{
				return false;
			}
			
			var term = $("#todo_startdate").val();
			if (term == ""){
				mobiscroll.toast({message:gap.lang.chdate, color:'danger'});
				return false;
			}
			
			var click_id = $(this).parent().parent().parent().parent().attr("id");

			
//			$('#time_' + click_id).off();
			var picker = $('#time_' + click_id).mobiscroll().datepicker({
				locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
				theme: 'ios',
				themeVariant : 'light',
				dateFormat: 'YYYY-MM-DD',
				select: 'range',
				onChange: function (event, inst) {
					
					var spl = event.valueText.split(" - ");
					var st = spl[0];
					var et = spl[1];
					
					var dis_start = moment.utc(st).format("YYYY-MM-DD");
					var dis_end = moment.utc(et).format("YYYY-MM-DD");
					
					var startdate = moment.utc(st).format();
					var enddate = moment.utc(et).format();
					
					if (gTodoM.select_todo.startdate > startdate){
						mobiscroll.toast({message:gap.lang.chbefore, color:'danger'});
						return false;
					}
					
					if (gTodoM.select_todo.enddate < enddate){
						mobiscroll.toast({message:gap.lang.chafter, color:'danger'});
						return false;
					}
					
					
					gTodoM.setTodoDate(dis_end, dis_start, 'check', click_id);
			    }
			}).mobiscroll('getInst');
			picker.open();
			
			
			//기본 날짜 설정하기 체크리스트 변경사항
			if ($(this).parent().find("em").text() != ""){
				var dt = $(this).parent().find("em").text().split("~");
				var st = dt[0];
				var et = dt[1];		
				$('#time_' + click_id).mobiscroll('setVal', [new Date(st), new Date(et)]);
			}

			
			//$('#time_' + click_id).mobiscroll('setVal', new Date($(this).parent().find("em").text()));
			return false;
		
		});
		
		
			
		
		
		
		$(".check-list .btn-user-add").off();
		$(".check-list .btn-user-add").on("click", function(e){
			
			if ((gTodoM.compose_admin) || (gTodoM.compose_asignee)){				
			}else{
				mobiscroll4.toast({
					message: gap.lang.noauth
				});
				return false;
			}
			
			$("body").css("overflow", "hidden");	
			gTodoM._click_obj = $(e.currentTarget);
			
			var click_id = $(this).parent().parent().parent().attr("id");
			gTodoM.click_checklist_id = click_id;
			
			gTodoM.select_checklist_ky = $(e.target).data("key");
			
			$('#memberlist').show();					
			$('#members').mobiscroll4().listview({
				theme: 'ios',
				themeVariant: 'light',
				swipe : false,
				striped: true,
		        enhance: true, 
				onItemTap: function (event, inst) {
			
					$("body").css("overflow-y", "auto");			
					scrollable.hide();					
					
					var ky = $(event.target).find("h3").attr('data');
					var info = gTodoM.search_user_cur_project_info(ky);	
					var user_info = gap.user_check(info);
					
					var click_id = gTodoM.click_checklist_id;
					gTodoM.ssid = click_id;
						
					
					//체크리스트 목록에서 담당자를 선택한 경우								
					var click_id = gTodoM.click_checklist_id;
					
					var data = JSON.stringify({
						project_code : gTodoM.cur_project_code,
						update_key : "checklist.$.asign",
						update_data : info,
						select_key : "checklist.tid",
						select_id : click_id,
						sid : gTodoM.select_id
					});
					
					var url = gap.channelserver + "/update_todo_item_sub.km";
					$.ajax({
						type : "POST",
						dataType : "text",
					//	contentType : "application/json; charset=utf-8",
						data : data,
						url : url,
						success : function(res){
							var rres = JSON.parse(res);
							if (rres.result == "OK"){
								var person_img = "<div class='user-thumb' data-ky='"+user_info.ky+"'>" + user_info.user_img + "</div>";
								$(gTodoM._click_obj).parent().append(person_img);
			
								//gTodoM._click_obj는 체크리스트에서 사용자 선택 버튼을 클릭 할때 설정했음
								$(gTodoM._click_obj).qtip("destroy");
								$(gTodoM._click_obj).remove();
								
								var change_doc = rres.data.doc;
								gTodoM.change_local_data(change_doc);
								
								gTodoM.__item_delete_event();
								gTodoM.__todo_compose_event();
								
								
							
								for (var k = 0 ; k < change_doc.checklist.length; k++){
									var inn = change_doc.checklist[k];
									if (inn.tid == gTodoM.ssid){													
										if (gTodoM.select_checklist_ky == inn.asign.ky){														
										}else{					
											if (typeof(gTodoM.select_checklist_ky) != "undefined"){
										        var obb = new Object();
										    //    var ip = gTodoM.search_user_cur_project_info_email(gTodoM.select_checklist_ky);
												obb.del_emp = gTodoM.select_checklist_ky;
												obb.del_id = gTodoM.select_todo.project_code + "^" + gTodoM.select_todo._id.$oid + "^" + gTodo.ssid;
												gap.schedule_update(obb, "checklist", "D");															
											}
											break;														
										}
									}
								}
								
								gap.checklist_update_schedule(gTodoM.ssid, JSON.parse(res).data.doc, "mobile");
								
								
								//TODO에 체크리스트에 담당자를 지정할 경우 지정된 사용자에게 알림을 보내준다.
								if (info.ky != gap.userinfo.rinfo.ky){
									var obj = new Object();
									obj.id = change_doc._id.$oid;
									obj.type = "checklist";  //change status
									obj.p_code = change_doc.project_code;
									obj.p_name = gap.textToHtml(change_doc.project_name);
									obj.title = change_doc.title;
								//	obj.sender = info.ky;  //해당 프로젝트의 owner에게만 전송한다.							
									//_wsocket.send_todo_msg(obj);
									var list = [];
									list.push(info.ky);
									obj.sender = list;
									gBodyM.send_box_msg(obj, 'todo');
									
									var smsg = new Object();
									smsg.msg = "[" + gap.textToHtml(change_doc.project_name) + "] " + gTodoM.short_title(obj.title) + " - " + gap.lang.checklist + " " + gap.lang.csm;	
									smsg.title =  gTodoM.systitle + "["+gTodoM.todo_title+"]";
									smsg.type = "checklist";
									smsg.key1 = change_doc.project_code;
									smsg.key2 = change_doc._id.$oid;
									smsg.key3 = "";
									smsg.fr = gap.userinfo.rinfo.nm;
									//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
									//smsg.sender = info.ky.join("-spl-");	
									smsg.sender = info.ky;	
								//	gap.push_noti_mobile(smsg);	
									
									//알림센터에 푸쉬 보내기
									var rid = change_doc.project_code;
									var receivers = [];
									receivers.push(info.ky);
									var msg2 = "[" + gTodoM.short_title(obj.title) + "] " + gap.lang.checklist + " " + gap.lang.csm;
									var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(change_doc.project_name) +"]"
									gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
								}
								
								
								
								
								
								
							}else{
								gap.error_alert();
							}
						},
						error : function(e){
							gap.error_alert();
						}
					});
					
					
				}
			});			
			
			var css = "";
			var list = gTodoM.cur_project_info.member;
			if (list.length > 5){
				css = "mbsc-no-padding md-content-scroll";
			}else{
				css = "mbsc-no-padding md-vertical-list";
			}
		
			var scrollable = $('#memberlist').mobiscroll4().popup({
				anchor: gTodoM._click_obj,
	            display: 'bubble',            // Specify display mode like: display: 'bottom' or omit setting to use default
	            scrollLock: false,                              // More info about scrollLock: https://docs.mobiscroll.com/4-10-9/popup#opt-scrollLock
	            cssClass: css,  // More info about cssClass: https://docs.mobiscroll.com/4-10-9/popup#opt-cssClass
	            buttons: [],                                     // More info about buttons: https://docs.mobiscroll.com/4-10-9/popup#opt-buttons
	            onClose : function(event, inst){
					$("body").css("overflow-y", "auto");			
				}                                     // More info about buttons: https://docs.mobiscroll.com/4-10-9/popup#opt-buttons
	        }).mobiscroll4('getInst');			
			
			scrollable.show();
		    return false;
		//	gTodoM.todo_select_user_layer(e);
		});	
		
		$(".todo-list-right .user-thumb").off();
		$(".todo-list-right .user-thumb").on("click", function(e){
		
			if (gTodoM.compose_admin || gTodoM.compose_asignee){		
			}else{
				mobiscroll4.toast({
					message: gap.lang.noauth
				});
				return false;
			}
			
			$("body").css("overflow", "hidden");			
			gTodoM._click_obj = $(e.currentTarget);
			
			var click_id = $(this).parent().parent().parent().attr("id");
			gTodoM.click_checklist_id = click_id;
			
			$('#memberlist').show();					
			$('#members').mobiscroll4().listview({
				theme: 'ios',
				themeVariant: 'light',
				swipe : false,
				striped: true,
		        enhance: true, 
				onItemTap: function (event, inst) {
					
					$("body").css("overflow-y", "auto");			
					scrollable.hide();					
					
					var ky = $(event.target).find("h3").attr('data');
					var info = gTodoM.search_user_cur_project_info(ky);	
					var user_info = gap.user_check(info);
						
					
					//체크리스트 목록에서 담당자를 선택한 경우								
					var click_id = gTodoM.click_checklist_id;
					
					var data = JSON.stringify({
						project_code : gTodoM.cur_project_code,
						update_key : "checklist.$.asign",
						update_data : info,
						select_key : "checklist.tid",
						select_id : click_id,
						sid : gTodoM.select_id
					});
					
					var url = gap.channelserver + "/update_todo_item_sub.km";
					$.ajax({
						type : "POST",
						dataType : "text",
					//	contentType : "application/json; charset=utf-8",
						data : data,
						url : url,
						success : function(res){
							var rres = JSON.parse(res);
							if (rres.result == "OK"){
							
								var person_img = "<div class='user-thumb' data-ky='"+user_info.ky+"'>" + user_info.user_img + "</div>";
								$(gTodoM._click_obj).parent().append(person_img);
			
								//gTodoM._click_obj는 체크리스트에서 사용자 선택 버튼을 클릭 할때 설정했음
								$(gTodoM._click_obj).qtip("destroy");
								$(gTodoM._click_obj).remove();
								
								var change_doc = rres.data.doc;
								gTodoM.change_local_data(change_doc);
								
								gTodoM.__item_delete_event();
								gTodoM.__todo_compose_event();
								
								
								///////////////////////////////////////////////////////////////////////////////////////////
								var ori = $(gTodoM._click_obj).attr("data-ky");
								var tar = user_info.ky;
								
								for (var k = 0 ; k < change_doc.checklist.length; k++){
									var inn = change_doc.checklist[k];
									if (inn.tid == click_id){													
										if (ori == inn.asign.ky){														
										}else{					
											if (typeof(ori) != "undefined"){
										        var obb = new Object();
										   //     var ip = gTodo.search_user_cur_project_info_email(gTodo.select_checklist_ky);
												obb.del_emp = ori;															
												obb.del_id = gTodoM.select_todo.project_code + "^" + gTodoM.select_todo._id.$oid + "^" + click_id;
												gap.schedule_update(obb, "checklist", "D");															
											}
											break;														
										}
									}
								}
								
								gap.checklist_update_schedule(click_id, JSON.parse(res).data.doc, "");
								
								
								//TODO에 체크리스트에 담당자를 지정할 경우 지정된 사용자에게 알림을 보내준다.
								if (info.ky != gap.userinfo.rinfo.ky){
									var obj = new Object();
									obj.id = change_doc._id.$oid;
									obj.type = "checklist";  //change status
									obj.p_code = change_doc.project_code;
									obj.p_name = gap.textToHtml(change_doc.project_name);
									obj.title = change_doc.title;
								//	obj.sender = info.ky;  //해당 프로젝트의 owner에게만 전송한다.							
									//_wsocket.send_todo_msg(obj);
									var list = [];
									list.push(info.ky);
									obj.sender = list;
									gBodyM.send_box_msg(obj, 'todo');
									
									var smsg = new Object();
									smsg.msg = "[" + gap.textToHtml(change_doc.project_name) + "] " + gTodoM.short_title(obj.title) + " - " + gap.lang.checklist + " " + gap.lang.csm;	
									smsg.title =  gTodoM.systitle + "["+gTodoM.todo_title+"]";
									smsg.type = "checklist";
									smsg.key1 = change_doc.project_code;
									smsg.key2 = change_doc._id.$oid;
									smsg.key3 = "";
									smsg.fr = gap.userinfo.rinfo.nm;
									//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
									//smsg.sender = info.ky.join("-spl-");	
									smsg.sender = info.ky;	
								//	gap.push_noti_mobile(smsg);	
									
									//알림센터에 푸쉬 보내기
									var rid = change_doc.project_code;
									var receivers = [];
									receivers.push(info.ky);
									var msg2 = "[" + gTodoM.short_title(obj.title) + "] " + gap.lang.checklist + " " + gap.lang.csm;	
									var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(change_doc.project_name) +"]"
									gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
								}
								
								
							}else{
								gap.error_alert();
							}
						},
						error : function(e){
							gap.error_alert();
						}
					});
					
					
				}
			});			
			
			var css = "";
			var list = gTodoM.cur_project_info.member;
			if (list.length > 5){
				css = "mbsc-no-padding md-content-scroll";
			}else{
				css = "mbsc-no-padding md-vertical-list";
			}
		
			var scrollable = $('#memberlist').mobiscroll4().popup({
				anchor: gTodoM._click_obj,
	            display: 'bubble',            // Specify display mode like: display: 'bottom' or omit setting to use default
	            scrollLock: false,                              // More info about scrollLock: https://docs.mobiscroll.com/4-10-9/popup#opt-scrollLock
	            cssClass: css,  // More info about cssClass: https://docs.mobiscroll.com/4-10-9/popup#opt-cssClass
	            buttons: [],                                     // More info about buttons: https://docs.mobiscroll.com/4-10-9/popup#opt-buttons
	            onClose : function(event, inst){
					$("body").css("overflow-y", "auto");
				}
	        }).mobiscroll4('getInst');			
			
			scrollable.show();
		    return false;
		//	gTodoM.todo_select_user_layer(e);
		});
		
		$(".todo-list-right .btn-more").off();
		$(".todo-list-right .btn-more").on("click", function(e){
			$("#t01").text(gap.lang.changetask);
			$("#t02").text(gap.lang.basic_modify);
			$("#t03").text(gap.lang.basic_delete);
	
			
			var select_item_key = $(e.currentTarget).parent().parent().parent().attr("id");
			var select_id = gTodoM.select_id;
			var select_user = $(e.target).parent().parent().find(".user-thumb").attr("data-ky");
			
			
			if ( gTodoM.compose_admin || gTodoM.compose_asignee ){
			}else{
				mobiscroll4.toast({
	                message: gap.lang.noauth
	            });
				return false;
			}
			
			mobiscroll4.settings = {
				    theme: 'ios',
				    themeVariant: 'light'
			};
			
			var list = $('#list').mobiscroll4().popup({
		        buttons: [],
		        display: 'bottom',
		        cssClass: 'mbsc-no-padding'
		    }).mobiscroll4('getInst');
			 
			$('#action_list').mobiscroll4().listview({
		        enhance: true,
		        swipe: false,
		        onItemTap: function (event, inst) {
		            list.hide();

		          
		            var type = $(event.target).attr("data");
		            if (type == "2"){
		            	//수정하기
		            	
		            	$("body").css("overflow", "hidden");
		            	var message = $("#" + select_item_key).find("p").text();
						$("#rmtext").val(message);
											
						$("#rmlayer").css("top", "30%");
						gap.showBlock();

						$("#rmtitle").text(gap.lang.basic_modify);
						$("#rmsave").text(gap.lang.OK);
						$("#rmcancel").text(gap.lang.Cancel);
						$("#rmtext").val();

						//편집창을 띄운다.
						var inx = parseInt(gap.maxZindex()) + 1;
						$("#rmlayer").css("z-index", inx);
						$("#rmlayer").show();

						$("#rmclose").off();
						$("#rmclose").on("click", function(e){	
							$("body").css("overflow-y", "auto");
							gap.hideBlock();
							$("#rmlayer").hide();
						});

						$("#rmcancel").off();
						$("#rmcancel").on("click", function(e){
							$("#rmclose").click();
						});
						
						$("#rmsave").off();
						$("#rmsave").on("click", function(e){		
							
							$("body").css("overflow-y", "auto");
							var sel_item = select_item_key;
							var sel_todo = gTodoM.select_id;
							var mx = $("#rmtext").val();		

							var data = JSON.stringify({
								todo_id : sel_todo,
								cid : sel_item,
								msg : mx
							})
							var url = gap.channelserver + "/modify_checklist_title_todo.km";
							$.ajax({
								type : "POST",
								dataType : "text",
								url : url,
								data : data,
								success : function(res){
									var rx = JSON.parse(res);
									if (rx.result == "OK"){
										
									//	$("#rmlayer").hide();
										$("#" + select_item_key + " p").text(mx);		
										
										/////////////// 로컬 데이터 업데이트 ////////////
										var change_doc = rx.data.doc;
										gTodoM.change_local_data(change_doc);
										
										$("#rmtext").val("");
										$("#rmcancel").click();
									}else{
										gap.error_alert();
									}
								},
								error : function(e){
									gap.error_alert();
								}
							})
						});
		            	
		            }else{
		            	var data = "";
		            	if (type == "1"){
		            		//할일로 변경하기
		            		data = JSON.stringify({
		            			id : select_item_key,
		            			sid : gTodoM.select_id,
		            			ty : "change"
		            		});
		            	}else if (type == "3"){
		            		//삭제
		            		data = JSON.stringify({
		            			id : select_item_key,
		            			sid : gTodoM.select_id,
		            			ty : "del"
		            		});
		            	}
		            	
		            	
		            	
		            	var url = gap.channelserver + "/update_todo_checklist.km";
		            	$.ajax({
		            		type : "POST",
		            		dataType : "text",
		            		url : url,
		            		data : data,
		            		success : function(res){	
		            			var rres = JSON.parse(res);
		            			
		            			if (rres.result == "OK"){
		            				$("#" + select_item_key).remove();
		            				
		            				if (type == "1"){
		            					// Change_Task
		            					var list = rres.data.data;
		            					gTodoM.cur_project_item_list = list;
		            										
		            				}else if (type == "3"){
		            					var change_doc = rres.data.doc;
		            					gTodoM.change_local_data(change_doc);
		            				}
		            			
		            				
		            				var obb = new Object();						
		            				obb.del_id = gTodoM.cur_project_code + "^" +  gTodoM.select_id+ "^" + select_item_key;
		            				obb.del_emp = select_user;
		            				gap.schedule_update(obb, "asignee", "D");
		            				
		            				
		            				//전체 건수를 표시해야 한다.
		            				gTodoM.checklist_count_check();
		            			}else{
		            				gap.error_alert();
		            			}
		            		},
		            		error : function(e){
		            			gap.error_alert();
		            		}
		            	});
		            }
		        }
		    });
					 
			 list.show();
			
			return false;
			
//			if (e.target.className == "ico btn-more"){
//				/*
//				 * 1 : 업무 즐겨찾기, 2 : 업무 삭제, 3 : 할일로 변경하기, 4 : 체크리스트 삭제, 5 : 파일 미리보기, 6 : 파일 삭제
//				 * 체크리스 더보기 메뉴 : 할일로 변경하기 / 체크리스트 삭제
//				 */
//				gTodoM.select_check_item = $(this).parent().parent().parent().attr("id")
//				
//				var url_link = "kPortalMeet://NativeCall/callTodoMenu"
//					+ "?param1="
//					+ "&param2="
//					+ "&param3=3"
//					+ "&param4=4"
//					+ "&param5="
//					+ "&param6="
//					+ "&json="
//				gBodyM.connectApp(url_link);
//				return false;
//			}					
		});		
	},
	
	"setTodoDate" : function(_date, _stdate,  _kind, _key){
		var select_date = moment.utc(_date).format();
		var start_date = moment.utc(_stdate).format();

		if (_kind == "check"){
			$("#time_" + _key).parent().find("em").remove();
			$("#time_" + _key).parent().append("<em>" + _stdate + "~" + _date + "</em>");
			
			//현재 클릭한 아이디의 배열에 완료예정일을 업데이트 한다.
			var click_id = _key;
			var data = JSON.stringify({
				project_code : gTodoM.select_todo.project_code,
				update_key : "checklist.$.complete_date",
				update_data : select_date,
				start_date : start_date,
				select_key : "checklist.tid",
				select_id : click_id,
				sid : gTodoM.select_id
			});

			var url = gap.channelserver + "/update_todo_item_sub.km";
			$.ajax({
				type : "POST",
				dataType : "text",
				data : data,
				url : url,
				success : function(res){
					var rres = JSON.parse(res);
					if (rres.result == "OK"){
						var change_doc = rres.data.doc;
						gTodoM.change_local_data(change_doc);
						
						gap.checklist_update_schedule(click_id, rres.data.doc, "");
						
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});
			
		}else if (_kind == "start"){
			$("#todo_startdate").val(_date);
			var startdate = moment.utc(_date).format();
			var enddate = moment.utc($("#todo_enddate").val()).format();

			var data = JSON.stringify({
				startdate : startdate,
				enddate : enddate,
				select_id : gTodoM.select_id,
				project_code : gTodoM.select_todo.project_code
			});

			var url = gap.channelserver + "/update_todo_item_sub_date.km";
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				data : data,
				url : url,					
				success : function(res){
					if (res.result == "OK"){
						var change_doc = res.data.doc;
						gTodoM.change_local_data(change_doc);
						
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});			
			
		}else if (_kind == "end"){
			$("#todo_enddate").val(_date);
			var startdate = moment.utc($("#todo_startdate").val()).format();
			var enddate = moment.utc(_date).format();	

			var data = JSON.stringify({
				startdate : startdate,
				enddate : enddate,
				select_id : gTodoM.select_id,
				project_code : gTodoM.select_todo.project_code
			});

			var url = gap.channelserver + "/update_todo_item_sub_date.km";
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				data : data,
				url : url,					
				success : function(res){
					if (res.result == "OK"){
						var change_doc = res.data.doc;
						gTodoM.change_local_data(change_doc);
						
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});
			
		}
	},
	
	"change_local_data" : function(doc){	
		gTodoM.select_todo = doc;
		var list = gTodoM.cur_project_item_list;		
		for (var i = 0; i < list.length; i++){
			var item = list[i];
			if (item._id.$oid == gTodoM.select_id){
				gTodoM.cur_project_item_list[i] = doc;
				break;
			}
		}		
	},
	
	"todo_select_user_layer" : function(e){
		
	//	var list = gTodoM.cur_project_info.member;
		var list = [];
		$(gTodoM.cur_project_info.member).each(function(idx, val){
			list.push(val);
		});
		list.push(gTodoM.cur_project_info.owner);

		list = sorted=$(list).sort(gap.sortNameDesc);
		
		var html = "";
		
		html += "<div class='qtip-default'>";
		html += "	<div class='layer-option-member' style='width:210px;'>";
		html += "		<ul class='layer-option-list' id='search_user_list_item'>";
		html += "			<li><em>Member</em></li>";
		
		for (var i = 0 ; i < list.length; i++){
			var member = list[i];
			var user_info = gap.user_check(member);
			
			html += "			<li>";
			html += "				<div class='user' data='" + user_info.ky + "'>";
			html += "					<div class='user-thumb'>" + user_info.user_img + "</div>";
			html += "					<dl>";
			html += "						<dt>" + user_info.name + gap.lang.hoching + "</dt>";
			html += "						<dd>" + user_info.jt + " / " + user_info.dept + "</dd>";
			html += "					</dl>";
			html += "				</div>";
			html += "			</li>";
		}
		
	/*	var user_info = gap.user_check(gTodoM.cur_project_info.owner);
		
		html += "			<li>";
		html += "				<div class='user'  data='" + user_info.ky + "'>";
		html += "					<div class='user-thumb'>" + user_info.user_img + "</div>";
		html += "					<dl>";
		html += "						<dt>" + user_info.name + gap.lang.hoching + "</dt>";
		html += "						<dd>" + user_info.jt + " / " + user_info.dept + "</dd>";
		html += "					</dl>";
		html += "				</div>";
		html += "			</li>";*/
		
		html += "		</ul>";
		html += "	</div>";
		html += "</div>";
		
		gTodoM.show_qtip_user(e, html, -10);
	},
	
	"todo_select_color_layer" : function(e){
		var html = "";

		html += "	<div class='qtip-default' style='border:none'>";
		html += "		<ul class='layer-color'>";
		html += "			<li class='c1'></li>";
		html += "			<li class='c2'></li>";
		html += "			<li class='c3'></li>";
		html += "			<li class='c4'></li>";
		html += "			<li class='c5'></li>";
		html += "			<li class='c6'></li>";
		html += "			<li class='c7'></li>";
		html += "			<li class='c8'></li>";
		html += "			<li class='c9'></li>";
		html += "			<li class='c10'></li>";
		html += "		</ul>";
		html += "	</div>";
	
		gTodoM.show_qtip_user(e, html, -10);
	},	
	
	"show_qtip_user" : function(e, html, leftposition){
		$("body").css("overflow", "hidden");
		$(e.currentTarget).qtip({
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			content : {
				text : html
			},
			show : {
				event: 'click',
				ready: true
			},
			hide : {
				event : 'unfocus',
				fixed : true
			},
			style : {
				classes : 'qtip-bootstrap',
				tip : true
			},
			position : {
				
				viewport: $("#todo_content_layer"),
//				viewport: $(window),
				my : 'top center',
//				at : 'bottom bottom',			
				adjust: {
				  x: leftposition,
				  y: 0
				}
			},
			events : {
			show : function(event, api){						
					
					$("#search_user_list_item .user").off();
					$("#search_user_list_item .user").on("click", function(e){

						var ky = $(e.currentTarget).attr("data");
						var info = gTodoM.search_user_cur_project_info(ky);	
						var user_info = gap.user_check(info);

						if (gTodoM.click_checklist_id == "asignee_btn"){
							//TODO 전체 담당자를 선택한 경우 별도 처리해 준다.
							var data = JSON.stringify({
								asignee : info,
								todo_id : gTodoM.select_id,
								ty : "add"
							});
							var url = gap.channelserver + "/update_asignee_todo.km";
							$.ajax({
								type : "POST",
								dataType : "json",
								conteType : "application/json; charset=utf-8",
								data : data,
								url : url,
								success : function(res){
									if (res.result == "OK"){
										var person_img = "<button class='btn-g-del'></button><div class='user-thumb' id='asignee_btn' style='cursor:pointer'>" + user_info.user_img + "</div>";
										$(gTodoM._click_obj).parent().append(person_img);
					
										//gTodoM._click_obj는 체크리스트에서 사용자 선택 버튼을 클릭 할때 설정했음
										$(gTodoM._click_obj).qtip("destroy");
										$(gTodoM._click_obj).remove();
																				
										var change_doc = res.data.doc;
										gTodoM.change_local_data(change_doc);
																					
										gTodoM.__item_delete_event();
										gTodoM.__todo_compose_event();
										
										//TODO에 담당자를 지정할 경우 해당 사용자에게 TODO가 할당되었음을 실시간 알려준다.
										if (change_doc.asignee.ky != gap.userinfo.rinfo.ky){
											var obj = new Object();
											obj.id = change_doc._id.$oid;
											obj.type = "as";  //change status
											obj.p_code = change_doc.project_code;
											obj.p_name = gap.textToHtml(change_doc.project_name);
											obj.title = change_doc.title;
										//	obj.sender = change_doc.asignee.ky;  //해당 프로젝트의 owner에게만 전송한다.
											//_wsocket.send_todo_msg(obj);
											var list = [];
											list.push(change_doc.asignee.ky);
											obj.sender = list;
											gBodyM.send_box_msg(obj, 'todo');
											
											
											var smsg = new Object();
											smsg.msg = "[" + gap.textToHtml(change_doc.project_name) + "] " + gTodoM.short_title(obj.title) + " - " + gap.lang.csm;		
											smsg.title =  gTodoM.systitle + "["+gTodoM.todo_title+"]";
											smsg.type = "as";
											smsg.key1 = change_doc.project_code;
											smsg.key2 = change_doc._id.$oid;
											smsg.key3 = "";
											smsg.fr = gap.userinfo.rinfo.nm;
											//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
											smsg.sender = change_doc.asignee.ky.join("-spl-");										
										//	gap.push_noti_mobile(smsg);		
											
											//알림센터에 푸쉬 보내기
											var rid = change_doc.project_code;
											var receivers = change_doc.asignee.ky;
											var msg2 = "[" + gTodoM.short_title(obj.title) + "] " + gap.lang.csm;		
											var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(change_doc.project_name) +"]"
											gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);		
										}
										
									}else{
										gap.error_alert();
									}
								},
								error : function(e){
									gap.error_alert();
								}
							});
							
						}else{
							//체크리스트 목록에서 담당자를 선택한 경우								
							var click_id = gTodoM.click_checklist_id;
							
							var data = JSON.stringify({
								project_code : gTodoM.cur_project_code,
								update_key : "checklist.$.asign",
								update_data : info,
								select_key : "checklist.tid",
								select_id : click_id,
								sid : gTodoM.select_id
							});
							
							var url = gap.channelserver + "/update_todo_item_sub.km";
							$.ajax({
								type : "POST",
								dataType : "text",
							//	contentType : "application/json; charset=utf-8",
								data : data,
								url : url,
								success : function(res){
									var rres = JSON.parse(res);
									if (rres.result == "OK"){
										var person_img = "<div class='user-thumb'>" + user_info.user_img + "</div>";
										$(gTodoM._click_obj).parent().append(person_img);
					
										//gTodoM._click_obj는 체크리스트에서 사용자 선택 버튼을 클릭 할때 설정했음
										$(gTodoM._click_obj).qtip("destroy");
										$(gTodoM._click_obj).remove();
										
										var change_doc = rres.data.doc;
										gTodoM.change_local_data(change_doc);
										
										gTodoM.__item_delete_event();
										gTodoM.__todo_compose_event();
										
										
										//체크르리스에 담당자를 지정할 경우 해당 사용자에게 알려준다.
										if (change_doc.asignee.ky != gap.userinfo.rinfo.ky){
											var obj = new Object();
											obj.id = change_doc._id.$oid;
											obj.type = "as";  //change status
											obj.p_code = change_doc.project_code;
											obj.p_name = gap.textToHtml(change_doc.project_name);
											obj.title = change_doc.title;
										//	obj.sender = ky;  //해당 프로젝트의 owner에게만 전송한다.
											//_wsocket.send_todo_msg(obj);
											var list = [];
											list.push(ky);
											obj.sender = list;
											gBodyM.send_box_msg(obj, 'todo');
											
											
											var smsg = new Object();
											smsg.msg = "[" + gap.textToHtml(change_doc.project_name) + "] " + gTodoM.short_title(obj.title) + " - " + gap.lang.csm;	
											smsg.title =  gTodoM.systitle + "["+gTodoM.todo_title+"]";
											smsg.type = "as";
											smsg.key1 = change_doc.project_code;
											smsg.key2 = change_doc._id.$oid;
											smsg.key3 = "";
											smsg.fr = gap.userinfo.rinfo.nm;
											//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
											smsg.sender = ky.join("-spl-");										
										//	gap.push_noti_mobile(smsg);	
											
											//알림센터에 푸쉬 보내기
											var rid = change_doc.project_code;
											var receivers = ky;
											var msg2 = "[" + gTodoM.short_title(obj.title) + "] " + gap.lang.csm;	
											var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(change_doc.project_name) +"]"
											gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);			
										}
										
									}else{
										gap.error_alert();
									}
								},
								error : function(e){
									gap.error_alert();
								}
							});
						}
					});
						

					//Color를 선택하는 경우
					$(".layer-color li").off();
					$(".layer-color li").on("click", function(e){
						var color = $(this).attr("class");
						$(".layer-color li").removeClass("on");
						$(this).addClass("on");
													
						var data = JSON.stringify({
							color : color,
							todo_id : gTodoM.select_id,
							ty : "add"
						});
						var url = gap.channelserver + "/update_color_todo.km";
						$.ajax({
							type : "POST",
							dataType : "text",
							url : url,
							data : data,
							success : function(res){
								var rrx = JSON.parse(res);
								if (rrx.result == "OK"){
									
									$(gTodoM._click_obj).qtip("destroy");
									$(gTodoM._click_obj).remove();
									
									$(".todo-color .btn-color-add").remove();
									$(".todo-color .color").remove();
									$(".todo-color").append("<div class='color " + color + "' id='todo_color_img'><button class='btn-g-del'>삭제</button></div>");
									
									var change_doc = rrx.data.doc;
									gTodoM.change_local_data(change_doc);
									
									gTodoM.__item_delete_event();
									gTodoM.__todo_compose_event();
								}
							},
							error : function(e){
								gap.error_alert();
							}
						})
					});
				},
				hidden : function(event, api){
					$("body").css("overflow-y", "auto");
					api.destroy(true);
				}
			}
		});
	},
	
	"search_user_cur_project_info" : function(ky){
		var list = gTodoM.cur_project_info.member;
		for (var i = 0; i < list.length; i++){
			var item = list[i];
			if (item.ky == ky){
				return item;
				break;
			}
		}
		
		if (gTodoM.cur_project_info.owner.ky == ky){
			return gTodoM.cur_project_info.owner;
		}		
	},	
	
	"message_check" : function(msg){
		var message = gap.aLink(msg);   //http자동 링크 걸기			
		if (message.indexOf("<a href=") > -1){
			message = message.replace(/[\n]/gi, "<br>");
		}else{
			message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');		
			message = message.replace(/[\n]/gi, "<br>");
			message = message.replace(/\s/gi, "&nbsp;");
		}
		
		return message;
	},
	
	
	"search_todo_member_exit_me" : function(){
		//현재 선택된 Todo정보에서 본인을 제외한 나머지 멤버리스트를 배열로 리턴해 준다.
		
		var list = gTodoM.cur_project_info;		
		var mlist = list.member;		
		var rlist = [];
		for (var i = 0 ; i < mlist.length ; i++){
			var item = mlist[i];
			if (item.ky != gap.userinfo.rinfo.ky){
				rlist.push(item.ky);
			}
		}
				
		if (list.owner.ky != gap.userinfo.rinfo.ky){
			rlist.push(list.owner.ky);
		}
				
		return rlist;
	},
	
	"mobile_todo_menu_mng" : function(opt){
		var _fserver = gTodoM.click_file_info.f_server;
		var _fname = gTodoM.click_file_info.f_name;
		var _pid = gTodoM.click_file_info.f_pid;
		var _md5 = gTodoM.click_file_info.f_md5;
		var _furl = gTodoM.click_file_info.f_url;
		var _fvurl = gTodoM.click_file_info.f_video_url;
		
		
		if (opt == "1"){
			// 업무 즐겨찾기
			gTodoM.update_star_task(gTodoM.select_id);
			
		}else if (opt == "2"){
			// 업무 삭제
			gTodoM.delete_task(gTodoM.select_id);
			
		}else if (opt == "3" || opt == "4"){
			// 케크리스트 : 할일로 변경하기 / 삭제
			var data = "";
			if (opt == "3"){
				data = JSON.stringify({
					id : gTodoM.select_check_item,
					sid : gTodoM.select_id,
					ty : "change"
				});
				
			}else if (opt == "4"){
				data = JSON.stringify({
					id : gTodoM.select_check_item,
					sid : gTodoM.select_id,
					ty : "del"
				});
			}
			
			var url = gap.channelserver + "/update_todo_checklist.km";
			$.ajax({
				type : "POST",
				dataType : "text",
				url : url,
				data : data,
				success : function(res){	
					var rres = JSON.parse(res);
					
					if (rres.result == "OK"){
						$("#" + gTodoM.select_check_item).remove();
						
						if (opt == "3"){
							// Change_Task
							var list = rres.data.data;
							gTodoM.cur_project_item_list = list;
												
						}else{
							var change_doc = rres.data.doc;
							gTodoM.change_local_data(change_doc);
						}
						
						//전체 건수를 표시해야 한다.
						gTodoM.checklist_count_check();
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});			
			
		}else if (opt == "5"){
			// 파일 미리보기
			var ext = gap.is_file_type_filter(_fname);
			
			if (ext == "movie"){
				gBodyM.call_preview(_fvurl, _fname, 'video');
				
			}else if (ext == "img"){
				gBodyM.call_preview(_furl, _fname, 'image');
				
			}else{
				gBodyM.mobile_start();
				gTodoM.file_convert(_fserver, _fname, _md5);				
			}
			
		}else if (opt == "6"){
			// 파일 삭제
			var msg = gap.lang.confirm_delete;
			$.confirm({
				title : "Confirm",
				content : msg,
				type : "default",  
				closeIcon : true,
				closeIconClass : "fa fa-close",
				columnClass : "s", 			 				
				animation : "top", 
				animateFromElement : false,
				closeAnimation : "scale",
				animationBounce : 1,	
				backgroundDismiss: false,
				escapeKey : true,
				buttons : {
					confirm : {
						keys: ['enter'],
						text : gap.lang.OK,
						btnClass : "btn-default",
						action : function(){
							var data = JSON.stringify({
								"id" : gTodoM.select_id,
								"md5" : _md5
							});			
							url = gap.channelserver + "/delete_sub_file_todo.km";
							$.ajax({
								type : "POST",
								dataType : "json",
								url : url,
								data : data,
								success : function (res){
									if (res.result == "OK"){								
										$("#" + _pid).remove();
										gTodoM.file_count_check();

										var change_doc = res.data.doc;
										gTodoM.change_local_data(change_doc);
									
									}else{
										gap.gAlert(gap.lang.errormsg);
									}
								},
								error : function(e){
									gap.gAlert(gap.lang.errormsg);
								}
							});
						}
					},
					cancel : {
						keys: ['esc'],
						text : gap.lang.Cancel,
						btnClass : "btn-default",
						action : function(){
						}
					}
				}
			});
			
		}else{
			gap.gAlert("개발중...");
		}
	},
	
	"update_star_task" : function(id){		
		var url = gap.channelserver + "/favorite_todo_item.km";
		var data = JSON.stringify({
			key : id,
			email : gap.userinfo.rinfo.em
		});
		
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : data,
			url : url,
			success : function(res){	
				if (res.result == "OK"){					
					gap.gAlert(gap.lang.added_favorite_menu);
					
				}else if (res.result == "RELEASE"){
					gap.gAlert(gap.lang.release_favorite_menu);
					
				}else{
					gap.error_alert();
				}
				
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"delete_task" : function(id){
		var msg = gap.lang.confirm_delete;
		$.confirm({
			title : "Confirm",
			content : msg,
			type : "default",  
			closeIcon : true,
			closeIconClass : "fa fa-close",
			columnClass : "s", 			 				
			animation : "top", 
			animateFromElement : false,
			closeAnimation : "scale",
			animationBounce : 1,	
			backgroundDismiss: false,
			escapeKey : false,
			buttons : {		
				confirm : {
					keys: ['enter'],
					text : gap.lang.OK,
					btnClass : "btn-default",
					action : function(){
						
						var url = gap.channelserver + "/delete_todo.km";
						var data = JSON.stringify({
							key : id,
							email : gap.userinfo.rinfo.em,
							project_code : gTodoM.cur_project_info._id.$oid
						});
						$.ajax({
							type : "POST",
							dataType : "json",
							contentType : "application/json; charset=utf-8",
							data : data,
							url : url,
							success : function(res){
								if (res.result == "OK"){
									var list = res.data.data;
									gTodoM.cur_project_item_list = list;
									$("#" + id).remove();	
									
									
									//일정에 등록된 담당자와 체크리스트 사용자의 정보를 삭제해 준다.
									var data2 = res.data.data2;
									gap.todo_connect_schedule_update(data2, "D", "");
								}
							},
							error : function(e){
								gap.error_alert();
							}
						});
						
					}
				},
				cancel : {
					keys: ['esc'],
					text : gap.lang.Cancel,
					btnClass : "btn-default",
					action : function(){
						//$("#" + xid).css("border","");
					}
				}
			}		 			
		});		
	},
	
	"file_convert" : function(fserver, fname, md5){

		//싸이냅으로 변경한다.
		var ft = gap.file_extension_check(fname);		
		var filePath = gap.synapserver + "\\upload\\todo\\" + gTodoM.select_id + "\\" + md5 + "." + ft;
	//	var filePath = gap.synapserver + "\\upload\\todo\\" + gTodoM.select_id;
		var obj = new Object();
		obj.channel_name = gTodoM.cur_project_name;
		obj.upload_path = gap.synapserver + "\\upload\\todo\\" + gTodoM.select_id;
		gap.call_synap(md5, filePath, fname, "TT", "todo", obj);		
		return false;
		
		
//		var surl = fserver + "/FileConvert_todo.km";
//		var postData = {
//				"id" : gTodoM.select_id,
//				"filename" : fname,
//				"md5" : md5
//			};	
//
//		$.ajax({
//			type : "POST",
//			url : surl,
//			dataType : "json",
//			data : JSON.stringify(postData),
//			success : function(res){
//				gBodyM.mobile_finish();
//				gap.gAlert("온다");
//				gap.gAlert(res.result);
//				
//				if (res.result == "OK"){
//					if (isNaN(res.data.count)){
//						gap.gAlert(gap.lang.noimage);
//						return false;
//						
//					}else{
//						var url_link = "kPortalMeet://NativeCall/callAfterImage?fserver=" + gap.channelserver + "&fname=" + fname + "&md5=" + md5 + "&totalPage=" + res.data.count;
//						gBodyM.connectApp(url_link);
//											
//						return false;
//					}
//					
//				}else{
//					gap.gAlert(gap.lang.noimage);
//					return false;
//				}
//			},
//			error : function(e){
//				gBodyM.mobile_finish();
//				gap.gAlert(gap.lang.errormsg);
//				return false;
//			}
//		});						
	},
	
	"todo_info_member" : function(){
		var surl = gap.channelserver + "/list_item_todo.km";
		var postData = {
				"project_code" : gTodoM.cur_project_code,
				"email" : gap.search_cur_em_sec()
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					gTodoM.cur_project_info = res.data.project_info;
					
					var owner = gTodoM.cur_project_info.owner;
					var member = gTodoM.cur_project_info.member;
					var sortedmember = sorted=$(member).sort(gap.sortNameDesc);
					var list = new Object();
					list.member = new Object();
					list.owner = owner;
					var arr = new Array();		
					for (var i = 0 ; i < sortedmember.length; i++){
						arr.push(sortedmember[i]);
					}
					list.member.list = arr;
					
					var url_link = "kPortalMeet://NativeCall/callUserInfoTodo?info=" + encodeURIComponent(JSON.stringify(list));
					gBodyM.connectApp(url_link);
					return false;
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},
	
	"draw_todo_mention" : function(page_no, opt){
		var html = '';
		
		html += '<div class="wrap">';
		html += '	<section style="width:100%; height:100%; padding: 2rem 2rem 0 2rem;" id="todo_section">';
		html += '		<div class="todo-card">';
		html += '			<ul class="card" id="todo_mention_list" style="list-style:none">';
		html += '			</ul>';
		html += '		</div>';
		html += '	</section>';
		html += '</div>';
		
		$("#dis").html(html);

		gTodoM.todo_mention_count = 0;
		gTodoM.todo_mention_total_count = 0;			
		gTodoM.start_skp = (parseInt(gTodoM.per_page) * (parseInt(page_no))) - (parseInt(gTodoM.per_page) - 1);
		
		var project_code = gTodoM.cur_project_code;
	//	var surl = gap.channelserver + "/search_mention_todo.km";
		var surl = gap.channelserver + "/search_mention_todo_db.km";
		var postData = JSON.stringify({
				"project_code" : project_code,
				"email" : gap.userinfo.rinfo.em,
				"perpage" : gTodoM.per_page,
				"start" : gTodoM.start_skp - 1
			});

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			success : function(res){
				if (res.result == "OK"){
					gTodoM.todo_mention_count += res.data.data.length;
					gTodoM.todo_mention_total_count = res.data.totalcount;
					
			//		$("#mention_unread_count").text(res.data.unreadcount)
					
					gTodoM.draw_todo_mention_list(page_no, res.data.data);			
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});			
	},
	
	"draw_todo_mention_test" : function(page_no, project_code){
		var html = '';
		
		html += '<div class="wrap">';
		html += '	<section style="width:100%; height:100%; padding: 2rem 2rem 0 2rem;" id="todo_section">';
		html += '		<div class="todo-card">';
		html += '			<ul class="card" id="todo_mention_list" style="list-style:none">';
		html += '			</ul>';
		html += '		</div>';
		html += '	</section>';
		html += '</div>';
		
		$("#dis").html(html);
		
		gTodoM.todo_mention_count = 0;
		gTodoM.todo_mention_total_count = 0;			
		gTodoM.start_skp = (parseInt(gTodoM.per_page) * (parseInt(page_no))) - (parseInt(gTodoM.per_page) - 1);
		
	//	var surl = gap.channelserver + "/search_mention_todo.km";
		var surl = gap.channelserver + "/search_mention_todo_db.km";
		var postData = JSON.stringify({
				"project_code" : project_code,
				"email" : gap.userinfo.rinfo.em,
				"perpage" : gTodoM.per_page,
				"start" : gTodoM.start_skp - 1
			});

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			success : function(res){
				if (res.result == "OK"){
					gTodoM.todo_mention_count += res.data.data.length;
					gTodoM.todo_mention_total_count = res.data.totalcount;
					
			//		$("#mention_unread_count").text(res.data.unreadcount)
					
					gTodoM.draw_todo_mention_list(page_no, res.data.data);			
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});			
	},	
	
	"draw_todo_mention_list" : function(page_no, res){
		var _data = res;

		if (_data.length == 0){
			var no_todo_html = '';
			no_todo_html += '<div class="wrap box-empty">';
			no_todo_html += '	<dl>';
			no_todo_html += '		<dt><span class="ico no-box"></span></dt>';
			no_todo_html += '		<dd>' + gap.lang.no_todo_list + '</dd>';
			no_todo_html += '	</dl>';
			no_todo_html += '</div>';
			
			$("#dis").html(no_todo_html);			
			return false;
		}
		
		for (var i = 0; i < _data.length; i++){
			gTodoM.draw_todo_mention_html(_data[i]);
		}

		gTodoM.__todo_mention_list_event();
		
		$(window).scroll(function(){
			if($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
				if (!gTodoM.scroll_bottom) {
					gTodoM.scroll_bottom = true;
					gTodoM.add_todo_mention_list(page_no + 1);
					
				}else{
					gTodoM.scroll_bottom = false;
				}
			}
		});
	},
	
	"add_todo_mention_list" : function(page_no){
		if (gTodoM.todo_mention_total_count > gTodoM.todo_mention_count){
			gTodoM.start_skp = (parseInt(gTodoM.per_page) * (parseInt(page_no))) - (parseInt(gTodoM.per_page) - 1);
			
			var project_code = gTodoM.cur_project_code;			
		//	var surl = gap.channelserver + "/search_mention_todo.km";
			var surl = gap.channelserver + "/search_mention_todo_db.km";
			var postData = JSON.stringify({
					"project_code" : project_code,
					"email" : gap.userinfo.rinfo.em,
					"perpage" : gTodoM.per_page,
					"start" : gTodoM.start_skp - 1
				});

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : postData,
				success : function(res){
					if (res.result == "OK"){
						gTodoM.todo_mention_count += res.data.data.length;
						gTodoM.todo_mention_total_count = res.data.totalcount;
						gTodoM.draw_todo_mention_list(page_no, res.data.data);				
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});	
		}
	},
	
	"draw_todo_mention_html" : function(info){
		var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(info.GMT));
		var disp_time = gap.change_date_localTime_only_time(String(info.GMT));
		var file_count = info.file.length;
		var reply_count = (info.reply != undefined ? info.reply.length : 0);
		var total_check_count = info.checklist.length;
		var checked_count = 0;
		for (var j = 0; j < info.checklist.length; j++){
			if (info.checklist[j].complete == "T"){
				checked_count++;
			}
		}
		var item = gTodoM.code_change_status(info.status);
		var project_code = gTodoM.cur_project_code;
		var status = info.status;
		var priority = info.priority;
		var html = "";
		
		html += '<li id="mention_' + info._id.$oid  + '" data-todo="' + info._id.$oid + '" data-title="' + info.project_name + '">';
		html += '	<div class="color-bar ' + (info.color != undefined ? info.color : "") + '"></div>';
	
		if (status == "0" || status == "1" || status == "2" || status == "3"){
			// 임시저장 / 대기중 / 진행중 /완료 인 경우에만
			if (status != "0"){
				html += '	<div class="status"><span class="ico ico-' + item.style + '"></span></div>';	
			}
		}

		if (info.priority != undefined || priority == ""){
			if (status == "3"){
				html += '	<h3 style="text-decoration:line-through; color:#999; padding-bottom:10px;"><span class="ico p' + priority + '"></span>' + (project_code == "" ? "[" + info.project_name + "] " : "") + info.title + '</h3> ';
			}else{
				html += '	<h3 style="padding-bottom:10px;"><span class="ico p' + priority + '"></span>' + (project_code == "" ? "[" + info.project_name + "] " : "") + info.title + '</h3> ';
			}
			
		}else{
			if (status == "3"){
				html += '	<h3 style="text-decoration:line-through; color:#999; padding-bottom:10px;">' + (project_code == "" ? "[" + info.project_name + "] " : "") + info.title + '</h3> ';
			}else{
				html += '	<h3 style="padding-bottom:10px;">' + (project_code == "" ? "[" + info.project_name + "] " : "") + info.title + '</h3> ';
			}
		}
		
		if (info.startdate != undefined){
			var dinfo = gTodoM.date_diff(info.startdate, info.enddate);
			html += "	<span class='todo-period'>" + dinfo.st + " ~ " + dinfo.et + " (" + dinfo.term + "day)</span>";
		}
		html += "	<dl class='icons'>";
		html += "		<dd><span class='ico ico-clip'></span><em>" + file_count + "</em></dd>";
		html += "		<dd><span class='ico ico-reply'></span><em>" + reply_count + "</em></dd>";
		html += "		<dd><span class='ico ico-checklist'></span><em>" + checked_count + "/" + total_check_count + "</em></dd>";
		html += "	</dl>";
		
		html += "</li>";
		
		$("#todo_mention_list").append(html);		
	},
	
	"__todo_mention_list_event" : function(){
		$("#todo_mention_list li").off();
		$("#todo_mention_list li").on("click", function(){
			
			var elem = $(this);
			
			var url_link = "kPortalMeet://NativeCall/callDetailTodo?id=" + elem.attr("id").replace("mention_", "") + "&tab=&title=" + elem.data("title");
			gBodyM.connectApp(url_link);
			return false;			
		});
	},
	
	"short_title" : function(title){
		var len = 10; 
		if (title.length > len){
			title = title.substr(0, len - 2) + '...';
		}
		return title;
	},
	
	"cur_todo_member_list" : function(){
		var member_list = [];
		
		for (var i = 0; i < gTodoM.cur_project_info.member.length; i++){
			member_list.push(gTodoM.cur_project_info.member[i]);
		}
		member_list.push(gTodoM.cur_project_info.owner);
		
		return member_list;
	},
	
	"get_tab_num" : function(code){
		var status = "";
		for (var i = 0; i < gTodoM.cur_project_item_list.length; i++){
			var info = gTodoM.cur_project_item_list[i];
			if (info._id.$oid == code){
				status = info.status;
				break;
			}
		}
		return status;
	}
}
