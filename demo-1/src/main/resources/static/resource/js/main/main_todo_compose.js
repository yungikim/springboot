
function gBodyTODOCompose(){
	//전역변수 선언
	this.calendar = "";
	this.per_page = 10;
	this.start_skp = 0;
	this.todo_file_count = 0;
	this.todo_file_total_count = 0;
	this.todo_star_count = 0;
	this.todo_star_total_count = 0;
	this.todo_archive_count = 0;
	this.todo_archive_total_count = 0;
	this.todo_mention_count = 0;
	this.todo_mention_total_count = 0;
	this.click_filter_image = "";
} 

$(document).ready(function(){
	
});

gBodyTODOCompose.prototype = {
	"init" : function(){
		
	},
	
	"init_load" : function(){
		//초기화 이벤트 핸들러 정의한다.
		gTodoC._eventHandler();		
	},
	
	"_eventHandler" : function(){
		$(".ico.btn-todo-add.todo-info").off();
		$(".ico.btn-todo-add.todo-info").on("click", function(){
			$.contextMenu({
				selector : ".ico.btn-todo-add.todo-info",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){
				gTodoC.context_menu_call(key, options, $(this).parent().attr("id"));
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
	            	},
	            	show : function (options){
	            	}
				},			
				build : function($trigger, options){
					return {
						items: gTodoC.todo_info_menu_content('todo_mng')
					}
				}
			});
		});
	},
	
	"todo_info_menu_content" : function(_key, _owner, _prjcode){
		
		var items = {};
		var is_owner = (_owner == gap.search_cur_em() ? true : false);
		var is_star = false;
		
		if (_prjcode != undefined){
			for (var i = 0; i < gBody.cur_todo_star_list.length; i++){
				var item = gBody.cur_todo_star_list[i];
				if (_prjcode == item._id){
					is_star = true;
					break;
				}
			}
		}

		if (_key == "todo_mng"){
			items["create_folder"] = {name : gap.lang.todo_create_folder};
			items["create_project"] = {name : gap.lang.todo_create_project};
			items["sep01"] = "-------------";
			items["exit_project_list"] = {name : gap.lang.exit_project_list};

		}else if (_key == "folder_mng"){
			if (is_owner){
				items["update_folder"] = {name : gap.lang.todo_update_folder};
				items["delete_folder"] = {name : gap.lang.todo_delete_folder};
				items["sep01"] = "-------------";
			}
			items["create_sub_project"] = {name : gap.lang.todo_create_project};
			
		}else if (_key == "project_mng"){
			if (is_owner){
				items["update_project"] = {name : gap.lang.todo_update_project};
				items["move_project"] = {name : gap.lang.todo_move_project};
				items["delete_project"] = {name : gap.lang.todo_delete_project};
				items["sep01"] = "-------------";
			}
			items["exit_project"] = {name : gap.lang.todo_exit_project};
			items["sep02"] = "-------------";
			if (is_star){
				items["del_favorite"] = {name : gap.lang.fix2};
			}else{
				items["add_favorite"] = {name : gap.lang.fix};
			}
			
		}else if (_key == "fav_project_mng"){
			if (is_owner){
				items["update_project"] = {name : gap.lang.todo_update_project};
				items["delete_project"] = {name : gap.lang.todo_delete_project};
				items["sep01"] = "-------------";
			}
			items["exit_project"] = {name : gap.lang.todo_exit_project};
			items["sep02"] = "-------------";
			items["del_favorite"] = {name : gap.lang.fix2};
		}

		return items;
	},
	
	"context_menu_call" : function(key, options, _id){
		
		if (_id != undefined){
			_id = _id.replace("favorite_", "");
		}
		
		if (key == "create_folder"){
			gTodoC.create_folder();
			
		}else if (key == "create_project"){
			gTodoC.create_project();
			
		}else if (key == "create_sub_project"){
			gTodoC.create_project(null, _id);	
			
		}else if (key == "update_folder"){
			gTodoC.modify_folder(_id);
			
		}else if (key == "update_project"){
			gTodoC.modify_project(_id);
			
		}else if (key == "move_project"){
			gTodoC.draw_folder_list(_id);
			
		}else if (key == "delete_folder" || key == "delete_project"){
			var _type = key.replace("delete_", "");
			gTodoC.delete_folder(_type, _id);
			
		}else if (key == "exit_project"){
			gTodoC.exit_project(_id);
			
		}else if (key == "exit_project_list"){
			gTodoC.draw_exit_info_list();
			
		}else if (key == "add_favorite"){
			gTodoC.update_todo_star('add', _id)
			
		}else if (key == "del_favorite"){
			gTodoC.update_todo_star('del', _id)
		}
	},
	
	"folder_layer_html" : function(is_update){
		var html = '';

		html += '<h2>' + (is_update ? gap.lang.todo_update_folder : gap.lang.todo_create_folder) + '</h2>';
		html += '<button class="ico btn-close" id="close_folder_layer">닫기</button>';
		html += '<div class="input-field">';
		html += '	<input type="text" class="formInput" id="input_folder_name" placeholder="">';
		html += '	<label for="input_folder_name">' + gap.lang.todo_folder_name + '</label>';
		html += '	<span class="bar"></span>';
		html += '</div>';
		html += '<div class="layer-bottom">';
		html += '	<button id="create_folder_btn"><strong>' + gap.lang.OK + '</strong></button>';
		html += '	<button id="cancel_folder_btn"><span>' + gap.lang.Cancel + '</span></button>';
		html += '</div>';		
		
		return html;
	},
	
	"create_folder" : function(obj){
		var is_update = (obj != undefined ? true : false);
		var html = gTodoC.folder_layer_html(is_update);
		$("#create_todo_layer").html(html);

		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#create_todo_layer')
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();
		
		if (is_update){
			//폴더 정보 update인 경우
			$("#input_folder_name").val(gap.textToHtml(obj.name));
			$("#input_folder_name").parent().find("label").addClass("on");
			$("#input_folder_name").focus();
		}
		
		$("#input_folder_name").on("change", function(){
			if($(this).val() == ""){
				$(this).parent().find("label").removeClass("on");
			} else {
				$(this).parent().find("label").addClass("on");
			}
		});			
		
		$("#create_folder_btn").on("click", function(){
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
				postData.key = obj._id;
			//	postData.email = gap.search_cur_em();
			}
			
			var surl = gap.channelserver + "/" + (is_update ? "modify_folder_todo.km" : "make_folder_todo.km");
			if (is_update){
				$.ajax({
					type : "POST",
					url : surl,
					dataType : "text",
					data : JSON.stringify(postData),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success : function(ress){
						gTodoC.create_folder_success(ress);
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
						return false;					
					}
				});
				
			}else{
				$.ajax({
					type : "POST",
					url : surl,
					dataType : "text",
					data : JSON.stringify(postData),
					success : function(ress){
						gTodoC.create_folder_success(ress);
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
						return false;					
					}
				});
			}
			
		});
		
		$("#close_folder_layer").on("click", function(){
			gap.close_layer('create_todo_layer');
		});
		$("#cancel_folder_btn").on("click", function(){
			gap.close_layer('create_todo_layer');
		});		
	},
	
	"create_folder_success" : function(ress){
		var res = JSON.parse(ress);
		if (res.result == "OK"){
			gap.close_layer('create_todo_layer');
			gTodoC.update_todo_list_info(true);
			
		}else{
			gap.gAlert(gap.lang.errormsg);
			return false;						
		}
	},
	
	"modify_folder" : function(_id){
		var surl = gap.channelserver + "/search_folder_todo.km";
	/*	var postData = {
				"key" : _id,
				"email" : gap.search_cur_em()
			};*/	
		
		var postData = {
				"key" : _id
			};

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					gTodoC.create_folder(res.data);
					
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
	
	"delete_folder" : function(_type, _id){
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
						var surl = gap.channelserver + "/delete_folder_todo.km";
					/*	var postData = {
								"key" : _id,
								"email" : gap.search_cur_em()
							};*/
						
						var postData = {
								"key" : _id
							};

						$.ajax({
							type : "POST",
							url : surl,
							dataType : "json",
							data : JSON.stringify(postData),
							beforeSend : function(xhr){
								xhr.setRequestHeader("auth", gap.get_auth());
								xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
							},
							success : function(res){
								if (res.result == "OK"){
									$("#" + _id).remove();
									if (_id == gTodo.cur_todo_code){
										$("#todo").click();
										
									}else{
										gTodoC.update_todo_list_info(true);
										if (gBody.cur_todo == "main"){
											gTodo.draw_my_static();
										}
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
	},
	
	"update_todo_list_info" : function(draw){
		
		
		// Todo 폴더/프로젝트  리스트 정보 가져오기
		var is_draw = (draw != undefined ? draw : false);
		var surl = gap.channelserver + "/folder_list_todo.km";
	/*	var postData = JSON.stringify({
				email : gap.search_cur_em_sec()
			});*/
		
		var postData = JSON.stringify({});

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (is_draw){
					gTodoC.draw_todo_left(res);
					
				}else{
					var _data = res.data.data;
					var _favorite = res.data.favorite;

					gBody.cur_todo_list = _data;
					gBody.cur_todo_star_list = _favorite;
				}
				gTodoC.__todo_left_event();
			},
			error : function(e){
			}
		});		
	},
	
	"project_layer_html" : function(is_update){
		var html = '';

		html += '<h2>' + (is_update ? gap.lang.todo_update_project : gap.lang.todo_create_project) + '</h2>';
		html += '<button class="ico btn-close" id="close_project_layer">닫기</button>';
		html += '<div class="input-field">';
		html += '	<input type="text" class="formInput" id="input_project_name" placeholder="">';
		html += '	<label for="input_project_name">' + gap.lang.todo_project_name + '</label>';
		html += '	<span class="bar"></span>';
		html += '</div>';
		html += '<div class="input-field">';
		html += '	<input type="text" class="formInput" id="input_project_comment" placeholder="">';
		html += '	<label for="input_project_comment">' + gap.lang.todo_project_comment + '</label>';
		html += '	<span class="bar"></span>';
		html += '</div>';
		/*html += '<div class="checkbox">';
		html += '	<label>';
		html += '		<input type="checkbox"><span class="checkbox-material"><span class="check"></span></span> ' + gap.lang.nondisclosure;
		html += '	</label>';
		html += '</div>';*/
		html += '<div class="input-field">';
		html += '	<input type="text" class="formInput" id="input_project_user">';
		html += '	<label for="input_project_user">' + gap.lang.invite_user + '</label>';
		html += '	<span class="bar"></span>';
		if (isShowOrg == "T"){
			html += '	<button id="org_pop_btn" class="ico btn-org"></button>';
		}
		html += '</div>';
		html += '<div class="todo-invite-user" id="project_member_list">';
		html += '</div>';
		html += '<ul class="same-name" style="top:224px; display:none;" id="same_name_list">';
		html += '</ul>';			
		html += '<div class="layer-bottom">';
		html += '	<button id="create_project_btn"><strong>' + gap.lang.OK + '</strong></button>';
		html += '	<button id="cancel_project_btn"><span>' + gap.lang.Cancel + '</span></button>';
		html += '</div>';		
		
		return html;
	},
	
	"create_project" : function(obj, id){
		var is_update = (obj != undefined ? true : false);
		var folderkey = (id != undefined ? id : "");
		if (is_update){
			folderkey = obj.folderkey
		}
		
		var html = gTodoC.project_layer_html(is_update);
		$("#create_todo_layer").html(html);

		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#create_todo_layer')
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();
		
		if (is_update){
			//프로젝트 정보 update인 경우
			$("#input_project_name").val(gap.textToHtml(obj.name));
			$("#input_project_name").parent().find("label").addClass("on");
			$("#input_project_name").focus();
			
			if (obj.comment != ""){
				$("#input_project_comment").val(gap.textToHtml(obj.comment));
				$("#input_project_comment").parent().find("label").addClass("on");
			}
			
			for (var i = 0; i < obj.member.length; i++){
				gTodoC.todo_add_user("P", obj.member[i]);
			}	
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
		
		$("#input_project_user").keydown(function(evt){
			if (evt.keyCode == 13){
				$("#same_name_list").empty();
				$("#same_name_list").hide();
				if ($("#input_project_user").val().trim() == ""){
					gap.gAlert(gap.lang.input_invite_user);
					return;
				}
				gTodoC.todo_user_search("P", $("#input_project_user").val() );
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
		
		$("#org_pop_btn").on("click", function(){
			window.ORG.show(
					{
						'title': gap.lang.invite_user,
						'single':false
					}, 
					{
						getItems:function() { return []; },
						setItems:function(items) { /* 반환되는 Items */
							for (var i = 0; i < items.length; i++){
								var _res = gap.convert_org_data(items[i]);
								if (_res.em.toLowerCase() != gap.userinfo.rinfo.em.toLowerCase()){
									gTodoC.todo_add_user('P', _res)
								}
							}
						}
					});
		});	
		
		$("#create_project_btn").on("click", function(){
			
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
			
			gTodo.user_ky_list = user_ky_list;
			
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
				postData.key = obj._id;
			//	postData.email = gap.search_cur_em();
				
				var pre_member = obj.member
				var pre_member_ky = $.map(pre_member, function(ret, key) {
					return ret.ky;
				});
				new_member_ky = $(user_ky_list).not(pre_member_ky);
			}
			
			var surl = gap.channelserver + "/" + (is_update ? "modify_folder_todo.km" : "make_folder_todo.km");
			if (is_update){
				$.ajax({
					type : "POST",
					url : surl,
					dataType : "text",
					data : JSON.stringify(postData),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success : function(ress){
						var res = JSON.parse(ress);
						if (res.result == "OK"){
							if (is_update){
								//현재 수정한 프로젝트 정보가 우측프레임에 보여지고 있는 프로젝트일 경우 gTodo.cur_project_info를 업데이트 해주고 gTodo.todo_members()를 호출해준다.
								var modify_project = res.data.project_info;
								if (gTodo.cur_todo_code == modify_project._id){
									gTodo.cur_project_info = modify_project;
									gTodo.todo_top_title_change(modify_project.name, modify_project.comment);
									gTodo.todo_members();
								}
								
								////// PC Web Push 날린다 ///////////////////////////////
								var info = res.data.project_info;
//								for (var i = 0 ; i < new_member_ky.length; i++){
//									var xp = new_member_ky[i];
//										
//								}
								
								
														
								//모바일  Push를 날린다. ///////////////////////////////////
								if (new_member_ky.length > 0){
									
									var obj = new Object();
									obj.id = "";
									obj.type = "invite";  //change status
									obj.p_code = info._id;
									obj.p_name = info.name;
									obj.title = info.name;
									obj.sender = new_member_ky;  //해당 프로젝트의 owner에게만 전송한다.							
									_wsocket.send_todo_msg(obj);	
									
									
									
									var new_member_ky_list = [];
									for (var j = 0; j < new_member_ky.length; j++){
										new_member_ky_list.push(new_member_ky[j]);
									}
									
									var smsg = new Object();
									smsg.msg = info.name + " " + gap.lang.miv;
									smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";	
									smsg.type = "invite";
									smsg.key1 = info._id;
									smsg.key2 = "";
									smsg.key3 = "";
									smsg.fr = gap.userinfo.rinfo.nm;
									smsg.sender = new_member_ky_list.join("-spl-");										
						//		gap.push_noti_mobile(smsg);	
									
									//알림센터에 푸쉬 보내기
									var rid = info._id;
									var receivers = new_member_ky_list;
									var msg2 = info.name + " " + gap.lang.miv;
									var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(info.name) +"]"
									gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
								}
								////////////////////////////////////////////////////
								
								
							}else{
								////// PC Web Push 날린다 ///////////////////////////////
								var info = res.data.project_info;
								var list = gTodo.user_ky_list;
//								for (var i = 0 ; i < list.length; i++){
//									var xp = list[i];
//										
//								}
								
								if (list.length > 0){
									var obj = new Object();
									obj.id = "";
									obj.type = "invite";  //change status
									obj.p_code = info._id;
									obj.p_name = info.name;
									obj.title = info.name;
									obj.sender = list;  //해당 프로젝트의 owner에게만 전송한다.							
									_wsocket.send_todo_msg(obj);	
								}
														
								 //모바일  Push를 날린다. ///////////////////////////////////						
								var smsg = new Object();
								smsg.msg = info.name + " " + gap.lang.miv;
								smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";	
								smsg.type = "invite";
								smsg.key1 = info._id;
								smsg.key2 = "";
								smsg.key3 = "";
								smsg.fr = gap.userinfo.rinfo.nm;
								//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
								smsg.sender = list.join("-spl-");										
								//gap.push_noti_mobile(smsg);			
								
								//알림센터에 푸쉬 보내기
								var rid = info._id;
								var receivers = list;
								var msg2 = gap.textToHtml(info.name) + " " + gap.lang.miv;	
								var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(info.name) +"]"
								gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
								////////////////////////////////////////////////////
							}
							gap.close_layer('create_todo_layer');
							gTodoC.update_todo_list_info(true);
							if (gBody.cur_todo == "main"){
								gTodo.draw_my_static();
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
				
			}else{
				$.ajax({
					type : "POST",
					url : surl,
					dataType : "text",
					data : JSON.stringify(postData),
					success : function(ress){
						var res = JSON.parse(ress);
						if (res.result == "OK"){
							if (is_update){
								//현재 수정한 프로젝트 정보가 우측프레임에 보여지고 있는 프로젝트일 경우 gTodo.cur_project_info를 업데이트 해주고 gTodo.todo_members()를 호출해준다.
								var modify_project = res.data.project_info;
								if (gTodo.cur_todo_code == modify_project._id){
									gTodo.cur_project_info = modify_project;
									gTodo.todo_top_title_change(modify_project.name, modify_project.comment);
									gTodo.todo_members();
								}
								
								////// PC Web Push 날린다 ///////////////////////////////
								var info = res.data.project_info;
//								for (var i = 0 ; i < new_member_ky.length; i++){
//									var xp = new_member_ky[i];
//											
//								}
								if (new_member_ky.length > 0){
									var obj = new Object();
									obj.id = "";
									obj.type = "invite";  //change status
									obj.p_code = info._id;
									obj.p_name = info.name;
									obj.title = info.name;
									obj.sender = new_member_ky;  //해당 프로젝트의 owner에게만 전송한다.							
									_wsocket.send_todo_msg(obj);
								}
								

								//모바일  Push를 날린다. ///////////////////////////////////
								if (new_member_ky.length > 0){
										
									var new_member_ky_list = [];
									for (var j = 0; j < new_member_ky.length; j++){
										new_member_ky_list.push(new_member_ky[j]);
									}
									
									var smsg = new Object();
									smsg.msg = info.name + " " + gap.lang.miv;
									smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";	
									smsg.type = "invite";
									smsg.key1 = info._id;
									smsg.key2 = "";
									smsg.key3 = "";
									smsg.fr = gap.userinfo.rinfo.nm;
									smsg.sender = new_member_ky_list.join("-spl-");										
								//	gap.push_noti_mobile(smsg);	
									
									//알림센터에 푸쉬 보내기
									var rid = info._id;
									var receivers = new_member_ky_list;
									var msg2 = gap.textToHtml(info.name) + " " + gap.lang.miv;
									var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(info.name) +"]"
									gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
								}
								////////////////////////////////////////////////////
							
							
							}else{
								////// PC Web Push 날린다 ///////////////////////////////
								var info = res.data.project_info;
								var list = gTodo.user_ky_list;
//								for (var i = 0 ; i < list.length; i++){
//									var xp = list[i];
//		
//								}
								
								if (list.length > 0){
									var obj = new Object();
									obj.id = "";
									obj.type = "invite";  //change status
									obj.p_code = info._id;
									obj.p_name = info.name;
									obj.title = info.name;
									obj.sender = list;  //해당 프로젝트의 owner에게만 전송한다.							
									_wsocket.send_todo_msg(obj);
								}
													
								//모바일  Push를 날린다. ///////////////////////////////////						
								var smsg = new Object();
								smsg.msg = info.name + " " + gap.lang.miv;
								smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";
								smsg.type = "invite";
								smsg.key1 = info._id;
								smsg.key2 = "";
								smsg.key3 = "";
								smsg.fr = gap.userinfo.rinfo.nm;
								//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
								smsg.sender = list.join("-spl-");										
							//	gap.push_noti_mobile(smsg);		
								
								//알림센터에 푸쉬 보내기
								var rid = info._id;
								var receivers = list;
								var msg2 = gap.textToHtml(info.name) + " " + gap.lang.miv;	
								var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(info.name) +"]"
								gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);	
								////////////////////////////////////////////////////
							}
							gap.close_layer('create_todo_layer');
							gTodoC.update_todo_list_info(true);
							if (gBody.cur_todo == "main"){
								gTodo.draw_my_static();
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
		
		});
		
		$("#close_project_layer").on("click", function(){
			gap.close_layer('create_todo_layer');
		});
		$("#cancel_project_btn").on("click", function(){
			gap.close_layer('create_todo_layer');
		});		
	},
	
	"create_project_success" : function(is_update, ress){
		var res = JSON.parse(ress);
		if (res.result == "OK"){
			if (is_update){
				//현재 수정한 프로젝트 정보가 우측프레임에 보여지고 있는 프로젝트일 경우 gTodo.cur_project_info를 업데이트 해주고 gTodo.todo_members()를 호출해준다.
				var modify_project = res.data.project_info;
				if (gTodo.cur_todo_code == modify_project._id){
					gTodo.cur_project_info = modify_project;
					gTodo.todo_top_title_change(modify_project.name, modify_project.comment);
					gTodo.todo_members();
				}
				
				////// PC Web Push 날린다 ///////////////////////////////
				var info = res.data.project_info;
				for (var i = 0 ; i < new_member_ky.length; i++){
					var xp = new_member_ky[i];
		
				}
				
				if (new_member_ky.length > 0){
					var obj = new Object();
					obj.id = "";
					obj.type = "invite";  //change status
					obj.p_code = info._id;
					obj.p_name = info.name;
					obj.title = info.name;
					obj.sender = new_member_ky;  //해당 프로젝트의 owner에게만 전송한다.							
					_wsocket.send_todo_msg(obj);
				}
										
				//모바일  Push를 날린다. ///////////////////////////////////
				if (new_member_ky.length > 0){
					var new_member_ky_list = [];
					for (var j = 0; j < new_member_ky.length; j++){
						new_member_ky_list.push(new_member_ky[j]);
					}
					
					var smsg = new Object();
					smsg.msg = info.name + " " + gap.lang.miv;
					smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";
					smsg.type = "invite";
					smsg.key1 = info._id;
					smsg.key2 = "";
					smsg.key3 = "";
					smsg.fr = gap.userinfo.rinfo.nm;
					smsg.sender = new_member_ky_list.join("-spl-");										
				//	gap.push_noti_mobile(smsg);	
					
					//알림센터에 푸쉬 보내기
					var rid = info._id;
					var receivers = new_member_ky_list;
					var msg2 = gap.textToHtml(info.name) + " " + gap.lang.miv;	
					var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(info.name) +"]"
					gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
				}
				////////////////////////////////////////////////////
				
				
			}else{
				////// PC Web Push 날린다 ///////////////////////////////
				var info = res.data.project_info;
				var list = gTodo.user_ky_list;
//				for (var i = 0 ; i < list.length; i++){
//					var xp = list[i];
//					
//				}
				
				if (list.length > 0){
					var obj = new Object();
					obj.id = "";
					obj.type = "invite";  //change status
					obj.p_code = info._id;
					obj.p_name = info.name;
					obj.title = info.name;
					obj.sender = list;  //해당 프로젝트의 owner에게만 전송한다.							
					_wsocket.send_todo_msg(obj);		
				}
										
				 //모바일  Push를 날린다. ///////////////////////////////////						
				var smsg = new Object();
				smsg.msg = info.name + " " + gap.lang.miv;
				smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";	
				smsg.type = "invite";
				smsg.key1 = info._id;
				smsg.key2 = "";
				smsg.key3 = "";
				smsg.fr = gap.userinfo.rinfo.nm;
				//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
				smsg.sender = list.join("-spl-");										
			//	gap.push_noti_mobile(smsg);			
				
				//알림센터에 푸쉬 보내기
				var rid = info._id;
				var receivers = list;
				var msg2 = gap.textToHtml(info.name) + " " + gap.lang.miv;
				var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(info.name) +"]"
				gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
				////////////////////////////////////////////////////
			}
			gap.close_layer('create_todo_layer');
			gTodoC.update_todo_list_info(true);
			if (gBody.cur_todo == "main"){
				gTodo.draw_my_static();
			}
			
		}else{
			gap.gAlert(gap.lang.errormsg);
			return false;						
		}		
	},
	
	"modify_project" : function(_id){
		var surl = gap.channelserver + "/search_folder_todo.km";
	/*	var postData = {
				"key" : _id,
				"email" : gap.search_cur_em()
			};*/
		
		var postData = {
				"key" : _id
			};

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					gTodoC.create_project(res.data);
					
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
	
	"exit_project" : function(_id){
		var surl = gap.channelserver + "/release_folder_todo.km";
	/*	var postData = {
				"key" : _id,
				"email" : gap.search_cur_em()
			};*/

		var postData = {
				"key" : _id
			};
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					$("#" + _id).remove();
					if (_id == gTodo.cur_todo_code){
						$("#todo").click();
						
					}else{
						gTodoC.update_todo_list_info(true);
						if (gBody.cur_todo == "main"){
							gTodo.draw_my_static();
						}
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
	},	
	
	"todo_user_search" : function(ch_type, str){
		/*
		 * ch_type : D(드라이브), C(채널), F(폴더)
		 */
		if (ch_type == "P"){
			$("#input_project_user").val("");
			
		}
		
		gsn.requestSearch('', str, function(sel_data){
            
            for (var i = 0 ; i < sel_data.length; i++){
           	 	var info = sel_data[i];
           	 //결과가 1명인 경우	
				if (info.em.toLowerCase() == gap.userinfo.rinfo.em.toLowerCase()){
					gap.gAlert(gap.lang.me_not_add_invite_user);
					return false;
				}else{
					gTodoC.todo_add_user(ch_type, info);
				}
            }    
            
        });
		
		
		
		return false;
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
				if (info.length > 1){
					//동명이인이 있는 경우
					var html = "";
					for (var i = 0; i < info.length; i++){
						var user = info[i];
						var name = user.nm;
						var dept = user.dp;
						var pos = user.jt;
						var notesid = user.ky;
						var empno = user.emp;
						var photourl = user.pu;
						
						var	html = "<li style='cursor:pointer' id='uschres_" + empno + "'><a>" + name + " / " + dept + " / " + pos + "</a></li>";
						
						$("#same_name_list").append(html);
						$("#uschres_" + empno).bind("click", user, function(event) {
							gTodoC.todo_list_user(ch_type, event.data);
						});
					}
					$("#same_name_list").show();
				
				}else{
					//결과가 1명인 경우	
					if (info[0].em.toLowerCase() == gap.userinfo.rinfo.em.toLowerCase()){
						gap.gAlert(gap.lang.me_not_add_invite_user);
						return false;
					}else{
						gTodoC.todo_add_user(ch_type, info[0]);
					}
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},
	
	"todo_list_user" : function(ch_type, obj){
		$("#same_name_list").hide();
		if (obj.em.toLowerCase() == gap.userinfo.rinfo.em.toLowerCase()){
			gap.gAlert(gap.lang.me_not_add_invite_user);
			return false;

		}else{
			gTodoC.todo_add_user(ch_type, obj);
		}
	},
	
	"todo_add_user" : function(ch_type, obj){
		if (obj == undefined){
			gap.gAlert(gap.lang.searchnoresult);
			return false;
		}
		var id = obj.ky;
		if (ch_type == "P"){
			var len = $("#project_member_list #member_" + obj.emp).length;
			
		}
		
		if (len > 0){
			gap.gAlert(gap.lang.existuser);
			return false;
		}
		
		var user_info = gap.user_check(obj)
		var html = "";
		
		html += '	<div class="member-profile" id="member_' + obj.emp + '">';
		html += '		<button class="ico btn-member-del" onClick="gTodoC.todo_delete_user(this)">삭제</button>';
		html += '		<div class="user-result-thumb">' + user_info.user_img + '</div>';
		html += '		<dl>';
		html += '			<dt><span class="status online"></span>' + user_info.name + '</dt><dd>' + user_info.dept + '</dd>';
		html += '		</dl>';
		html += '	</div>';
		
		if (ch_type == "P"){
			$("#project_member_list").append($(html));
			
		}
				
		delete obj['_id'];
		$("#member_" + obj.emp).attr('data-user', JSON.stringify(obj));
	},
	
	"todo_delete_user" : function(obj){
		var id = $(obj).parent().attr("id");
		$("#" + id).remove();
	},	
	
	"draw_folder_list" : function(pid){
	//	console.log("project id >>> " + pid);
		var html = '';
		html += '<h2>' + gap.lang.todo_move_project + '</h2>';
		html += '<button class="ico btn-close" id="close_folder_info_layer">닫기</button>';
		html += '<ul class="folder-tree" id="folder_info_list">';
		html += '	<li>';
		html += '		<div style=""><span class="ico ico-todo-folder"></span>Root<button class="btn-entry" id="enter_root"><span>' + gap.lang.move + '</span></button></div>';
		html += '	</li>';		
		html += '</ul>';
		html += '<div class="layer-bottom">';
//		html += '	<button><strong>' + gap.lang.OK + '</strong></button>';
		html += '	<button id="cancel_folder_info_layer"><span>' + gap.lang.Cancel + '</span></button>';
		html += '</div>';
		
		$("#exit_info_layer").html(html);

		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#exit_info_layer')
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();

		
		//폴더 리스트 가져오기
		var surl = gap.channelserver + "/folder_list_todo.km";
	/*	var postData = JSON.stringify({
			email : gap.search_cur_em_sec()
		});*/

		var postData = JSON.stringify({});
		
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : surl,
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					for (var i = 0; i < res.data.data.length; i++){
						var _info = res.data.data[i];
						if (_info.type == "folder"){
							var _html = '';
							_html += '<li>';
							_html += '	<div style=""><span class="ico ico-todo-folder"></span>' + _info.name + '<button class="btn-entry" id="enter_' + _info._id + '"><span>' + gap.lang.move + '</span></button></div>';
							_html += '</li>';
							$("#folder_info_list").append(_html);
						}
					}
					
					//이동 버튼 클릭
					$(".btn-entry").off();
					$(".btn-entry").on("click", function(){
						var fid = $(this).attr("id").replace("enter_", "");
						fid = (fid == "root" ? "" : fid);
						gTodoC.move_project_to_folder(pid, fid);
					});
				}
			},
			error : function(e){
				gap.error_alert();
			}
		})		

		
		$("#close_folder_info_layer").on("click", function(){
			gap.close_layer('exit_info_layer');
		})
		$("#cancel_folder_info_layer").on("click", function(){
			gap.close_layer('exit_info_layer');
		})
	},
	
	"move_project_to_folder" : function(pkey, fkey){
	//	console.log(">>> " + fkey);
		var surl = gap.channelserver + "/move_folder_todo.km";
		var postData = JSON.stringify({
				"key" : pkey,
				"folderkey" : fkey
			});			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			success : function(res){
				if (res.result == "OK"){
					gap.close_layer('exit_info_layer');
					gTodoC.update_todo_list_info(true);
					if (gBody.cur_todo == "main"){
						gTodo.draw_my_static();
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
	},	
	
	
	"draw_exit_info_list" : function(ty){
		var html = '';
		html += '<h2>' + gap.lang.exit_project_list + '</h2>';
		html += '<button class="ico btn-close" id="close_exit_info_layer">닫기</button>';
		html += '<ul class="folder-tree" id="exit_info_list">';
		html += '</ul>';
		html += '<div class="layer-bottom">';
//		html += '	<button><strong>' + gap.lang.OK + '</strong></button>';
		html += '	<button id="cancel_exit_info_layer"><span>' + gap.lang.Cancel + '</span></button>';
		html += '</div>';
		
		$("#exit_info_layer").html(html);

		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#exit_info_layer')
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();

		
		//나간 프로젝트 리스트 가져오기
		var surl = gap.channelserver + "/release_list_todo.km";
	/*	var postData = JSON.stringify({
				"email" : gap.search_cur_em()
			});	*/	
		
		var postData = JSON.stringify({});	

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					for (var i = 0; i < res.data.data.length; i++){
						var _info = res.data.data[i];
						var _status = gTodoC.get_todo_progress_ststus(_info);
						var _html = '';
						_html += '<li>';
						_html += '	<div style=""><span class="ico ico-' + _status + '-c"></span>' + _info.name + '<button class="btn-entry" id="enter_' + _info._id + '"><span>' + gap.lang.enter + '</span></button></div>';
						_html += '</li>';
						$("#exit_info_list").append(_html);

						//등러가기 버튼 클릭
						$("#enter_" + _info._id).bind("click", _info, function(event){
							gTodoC.enter_info(event.data);
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
		
		$("#close_exit_info_layer").on("click", function(){
			gap.close_layer('exit_info_layer');
		})
		$("#cancel_exit_info_layer").on("click", function(){
			gap.close_layer('exit_info_layer');
		})
	},	
	
	"enter_info" : function(_info){
		var surl = gap.channelserver + "/enter_folder_todo.km";
	/*	var postData = JSON.stringify({
				"key" : _info._id,
				"email" : gap.search_cur_em(),
				"owner" : gap.userinfo.rinfo
			});	*/	
		
		var postData = JSON.stringify({
			"key" : _info._id,
			"owner" : gap.userinfo.rinfo
		});	

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					/*	
				 	var res_id = _info._id;
					var folderkey = _info.folderkey;
					var project_name = _info.name;
					var _html = '';

					_html += '<li id="' + res_id + '" class="project-item" todo-name="' + project_name + '" todo-type="proect" owner="' + _info.owner.em + '">';
					_html += '	<em id="em_' + res_id + '"><span class="ico ico-wait-c"></span>' + project_name + '<button class="ico btn-more project-mng">더보기</button></em>';
					_html += '</li>';
					
					if (folderkey != ""){
						if ($("#" + folderkey).find("li").length == 0){
							var _ul_html = '<ul id="ul_' + folderkey + '">' + _html + '</ul>';
							$("#" + folderkey).append(_ul_html);
							
						}else{
							$("#ul_" + folderkey).append(_html);
						}	
						
					}else{
						$("#todo_folder_list").append(_html);
					}
					*/

					gap.close_layer('exit_info_layer');
					gTodoC.update_todo_list_info(true);
					if (gBody.cur_todo == "main"){
						gTodo.draw_my_static();
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
	},	
	
	"draw_calendar" : function(){
		//메인에서 칼린더 메뉴 클릭하면 호출되는 함수
		var _html = '';
		var pinfo = gTodo.cur_project_info;
		var member_count = pinfo.member.length;
		var favorite = pinfo.favorite;
		
		gTodo.todo_top_title_change(pinfo.name, pinfo.comment);
		if (favorite == "T"){
			$("#todo_top_favorite_btn").addClass("on");
		}else{
			$("#todo_top_favorite_btn").removeClass("on");
		}
		$("#todo_top_member_count").html("(" + (member_count + 1) + ")");
		
		
		_html += '<div id="fullcalendar"></div>';
		$("#todo_calendar_area").html(_html);
		if (gTodo.cur_todo_caller == "plugin"){
			$("#todo_calendar_area").css("height", "calc(100% - 257px)");
			
		}else{
			$("#todo_calendar_area").css("height", "calc(100% - 115px)");
		}
		
		$("#todo_calendar_area").css("background-color", "#fff");
		$(".todo-option").css("margin-bottom", "15px");
		
		gTodoC.init_calendar();
	//	gTodoC.__after_draw_calendar_event();
		gTodo.__after_draw_event();
	},
	
	"init_calendar" : function(){
		var date = new Date();
		var year = date.getFullYear();
		var month = date.getMonth()+1;
		var dt = date.getDate();

		if (dt < 10) {
		  dt = '0' + dt;
		}
		if (month < 10) {
		  month = '0' + month;
		}
		
		var locale_code = "";
		var lan = gap.etc_info.ct.lg;
		if ((lan == "") || (typeof(lan) == "undefined")){
			lan = gap.curLang;
		}
		
		if (lan == "ko"){
			locale_code = "ko";
		}else if (lan == "cn"){
			locale_code = "zh-cn";
		}else{
			locale_code = "en";
		}
		
		var ko = {
				code: 'ko',
				buttonText: {
					prev: '이전달',
					next: '다음달',
					today: '오늘',
					month: '월',
					week: '주',
					day: '일',
					list: '일정목록'
				},
				weekText: '주',
				allDayText: '종일',
				moreLinkText: '개',
				noEventsText: '일정이 없습니다'
		};		
		var zhCn = {
				code: 'zh-cn',
				week: {
					// GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
					dow: 1, // Monday is the first day of the week.
					doy: 4 // The week that contains Jan 4th is the first week of the year.
				},
				buttonText: {
					prev: '上月',
					next: '下月',
					today: '今天',
					month: '月',
					week: '周',
					day: '日',
					list: '日程'
				},
				weekText: '周',
				allDayText: '全天',
				moreLinkText: function(n) {
					return '另外 ' + n + ' 个'
				},
				noEventsText: '没有事件显示'
		};
		
/*		// 프로젝트 이번트 세팅
		var _event_list = new Array();
		for (var i = 0; i < gTodo.cur_project_item_list.length; i++){
			var _item = gTodo.cur_project_item_list[i];
			var _event = new Object();

			if (_item.startdate != undefined){
				_event.id = _item._id;
				_event.title = _item.title + (_item.asignee != undefined ? " (" + gap.user_check(_item.asignee).disp_user_info + ")" : "");
				_event.start = moment.utc(_item.startdate).local().format('YYYY-MM-DD');
				_event.end = moment.utc(_item.enddate).local().add(1, "days").format("YYYY-MM-DD");

				if (_item.color != undefined){
					var $p = $("<p class='" + _item.color + "'></p>").hide().appendTo("body");
				    var rgb = $p.css("background-color");
				    $p.remove();
				    
				    _event.color = gTodoC.rgb2hex(rgb);				
				}

				_event_list.push(_event);
			}
		}*/
		
		var surl = gap.channelserver + "/list_item_todo.km";
	/*	var postData = JSON.stringify({
				"project_code" : gTodo.cur_todo_code,
				"email" : gap.search_cur_em_sec(),
				"category" : "1"
			});*/
		
		var postData = JSON.stringify({
				"project_code" : gTodo.cur_todo_code,
				"category" : "1"
			});

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					var list = res.data.data;
					gTodo.cur_project_item_list = list;
					
					// 캘린더 설정
					var calendarEl = document.getElementById('fullcalendar');
					gTodoC.calendar = new FullCalendar.Calendar(calendarEl, {
						locale: locale_code,
						eventColor: 'grey',
						height: '100%',
						expandRows: true,
						slotMinTime: '08:00',
						slotMaxTime: '20:00',
						headerToolbar: {
						/*	left: 'prev,next today',
							center: 'title',
							right: 'dayGridMonth,timeGridWeek'*/
							left: 'title',
							center: '',
							right: 'today prevYear,prev,next,nextYear'
						},
						initialView: 'dayGridMonth',
						initialDate: year + "-" + month + "-" + dt,
						fixedWeekCount: false,	// true : 항상 6주
						navLinks: false, // can click day/week names to navigate views
						editable: true,
						selectable: true,
						nowIndicator: true,
						dayMaxEvents: true, // allow "more" link when too many events
						/*dateClick: function(info) {
							alert('clicked ' + info.dateStr);
						},*/
						select: function(info) {
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							var firstDate = new Date(info.start); // 29th of Feb at noon your timezone
							var secondDate = new Date(info.end); // 2st of March at noon
							var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
							var start_date = "";
							var end_date = "";

							if (diffDays == 1){
								start_date = info.startStr;
								end_date = info.startStr;
								cal_end_date = end_date;
								
							}else{
								start_date = info.startStr;
								end_date = moment(info.end).subtract(1, "days").format("YYYY-MM-DD");
							}
							
							gTodoC.compose_todo_calendar(start_date, end_date);
						},
						eventDrop: function(info) {
							var start_date = info.event.startStr;
							var end_date = (info.event.endStr == "" ? start_date : moment(info.event.endStr).subtract(1, "days").format("YYYY-MM-DD"));
							gTodoC.change_todo_date(info.event.id, start_date, end_date);
						},
						eventResize: function(info) {
							//console.log(info);
							var start_date = info.event.startStr;
							var end_date = (info.event.endStr == "" ? start_date : moment(info.event.endStr).subtract(1, "days").format("YYYY-MM-DD"));
							gTodoC.change_todo_date(info.event.id, start_date, end_date);
						},			
						eventClick: function(info) {
							//console.log(info);
							gTodo.compose_layer( info.event.id );
							
							/*alert('Event: ' + info.event.title);
							alert('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
							alert('View: ' + info.view.type);

							// change the border color just for fun
							info.el.style.borderColor = 'red';*/
						},
					/*	events: [ 
						         {
						        	 title: '테스트',
						        	 start: '2021-04-05',
						        	 end: '2021-04-09'
						        	
						         },
						         {
						        	 title: '주간회의1',
						        	 start: '2021-04-12T12:30:00',
						        	 end: '2021-04-12T13:30:00'
						         }
						]*/
						events: gTodoC.get_calendar_event_list()	//_event_list
					});
					
					gTodoC.calendar.render();					
					
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
	
	"get_calendar_event_list" : function(){
		// 프로젝트 이번트 세팅 (배열)
	
		var _event_list = new Array();
		var list = "";
		if (gTodo.filtering){
			list = gTodo.cur_project_item_list_temp;
		}else{
			list = gTodo.cur_project_item_list;
		}
		for (var i = 0; i < list.length; i++){
			var _item = list[i];
			var _event = new Object();

			if (_item.startdate != undefined){
				var is_edit = false;
				if (_item.asignee != undefined && _item.asignee.ky == gap.userinfo.rinfo.ky){
					is_edit = true;
				}
				if (_item.owner.ky == gap.userinfo.rinfo.ky){
					is_edit = true;
				}
				
				_event.id = _item._id;
				_event.title = gap.textToHtml(_item.title) + (_item.asignee != undefined ? " (" + gap.user_check(_item.asignee).disp_user_info + ")" : "");
				_event.start = moment.utc(_item.startdate).local().format('YYYY-MM-DD');
				_event.end = moment.utc(_item.enddate).local().add(1, "days").format("YYYY-MM-DD");
				_event.editable = is_edit;

				if (_item.color != undefined){
					var $p = $("<p class='" + _item.color + "'></p>").hide().appendTo("body");
				    var rgb = $p.css("background-color");
				    $p.remove();
				    
				    _event.color = gTodoC.rgb2hex(rgb);				
				}

				_event_list.push(_event);
			}
		}
		
		return _event_list;
	},
	
	"get_calendar_event_info" : function(_data){
		// 캘린더 이벤트 세팅(싱글)
		var _item = _data;
		var _event = new Object();

		_event.id = _item._id;
		_event.title = gap.textToHtml(_item.title) + (_item.asignee != undefined ? " (" + gap.user_check(_item.asignee).disp_user_info + ")" : "");
		_event.start = moment.utc(_item.startdate).local().format('YYYY-MM-DD');
		_event.end = moment.utc(_item.enddate).local().add(1, "days").format("YYYY-MM-DD");

		if (_item.color != undefined){
			var $p = $("<p class='" + _item.color + "'></p>").hide().appendTo("body");
		    var rgb = $p.css("background-color");
		    $p.remove();
		    
		    _event.color = gTodoC.rgb2hex(rgb);				
		}
		_event.allDay = true;
		
		return _event;
	},
	
	"__after_draw_calendar_event" : function(){
	
/*		$(".todo-option button").off();
		$(".todo-option button").on("click", function(e){
		//	console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>");
			var bol = $(this).hasClass("on");
			var cls = $(this).parent().attr("class");

			$("#y_tag").fadeOut();			
			$("#y_priority").fadeOut();
			$("#y_color").fadeOut();
			$("#y_filter").fadeOut();
			$("#x_tag").removeClass("on");
			$("#x_priority").removeClass("on");
			$("#x_color").removeClass("on");
			$("#x_filter").removeClass("on");
			
			
			if (cls == "option-tag"){				
				var list = gTodo.cur_project_item_list;
				var arr = [];
				for (var i = 0 ; i < list.length; i++){
					var info = list[i];
					if (typeof(info.tag) != "undefined"){
						var ln = info.tag;
						for (var k = 0; k < ln.length; k++){
							arr.push(ln[k]);
						}
					}					
				}
				var ux = [];
				$.each(arr, function(i,el){
					if ($.inArray(el, ux) === -1){
						ux.push(el);						
					}
				});

				var html2 = "";
				html2 += "<div class='qtip-default' style='border:none'>";
				html2 += "	<ul class='layer-option-list' id='option_change_tag'>";
				for (var u = 0 ; u < ux.length; u++){
					html2 += "		<li class='on'> <!-- 체크박스 체크 on 클래스 추가 -->";
					html2 += "			<div class='checkbox'>";
					html2 += "				<label>";
					html2 += "				<input type='checkbox' value='"+ux[u]+"'><span class='checkbox-material'><span class='check'></span></span> <em>"+ux[u]+"</em>";
					html2 += "				</label>";
					html2 += "			</div>";
					html2 += "		</li>";
				}
				html2 += "	</ul>";
				html2 += "</div>";
				
				gTodo.show_qtip(e, html2, 0);

			}else if (cls == "option-priority"){
				
				var html2 = "";
				html2 += "<div class='qtip-default'  style='border:none'>";
				html2 += "	<ul class='layer-option-list' id='option_change_priority'>";
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "			<label>";
				html2 += "				<input type='checkbox' value='1'><span class='checkbox-material'><span class='check'></span></span> <span class='ico p1'></span> <em>"+gap.lang.priority1+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "				<label>";
				html2 += "					<input type='checkbox' value='2'><span class='checkbox-material' ><span class='check'></span></span> <span class='ico p2'></span> <em>"+gap.lang.priority2+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "				<label>";
				html2 += "					<input type='checkbox' value='3'><span class='checkbox-material'><span class='check'></span></span> <span class='ico p3'></span> <em>"+gap.lang.priority3+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "				<label>";
				html2 += "					<input type='checkbox' value='4'><span class='checkbox-material'><span class='check'></span></span> <span class='ico p4'></span> <em>"+gap.lang.priority4+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "				<label>";
				html2 += "					<input type='checkbox' value='5'><span class='checkbox-material'><span class='check'></span></span> <span class='ico p5'></span> <em>"+gap.lang.priority5+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				html2 += "	</ul>";
				html2 += "</div>";
				
				gTodo.show_qtip(e, html2, 0);

			}else if (cls == "option-color"){
				
				var html2 = "";
				html2 += "<div class='qtip-default' style='border:none'>";
				html2 += "	<ul class='layer-color' id='option_change_color'>";
				html2 += "		<li class='c1'></li>";
				html2 += "		<li class='c2'></li>";
				html2 += "		<li class='c3'></li>";
				html2 += "		<li class='c4'></li>";
				html2 += "		<li class='c5'></li>";
				html2 += "		<li class='c6'></li>";
				html2 += "		<li class='c7'></li>";
				html2 += "		<li class='c8'></li>";
				html2 += "		<li class='c9'></li>";
				html2 += "		<li class='c10'></li>";
				html2 += "		</ul>";
				html2 += "</div>";
				
				gTodo.show_qtip(e, html2, 0);

			}else if (cls == "option-filter"){
				var html2 = "";
				html2 += "<div class='qtip-default' style='border:none'>";
				html2 += "	<ul class='layer-option-list' id='option_change_asignee'>";
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "				<label>";
				html2 += "					<input type='checkbox' value='1'><span class='checkbox-material'><span class='check'></span></span> <em>"+gap.lang.t1+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "				<label>";
				html2 += "					<input type='checkbox' value='2'><span class='checkbox-material'><span class='check'></span></span> <em>"+gap.lang.t2+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "				<label>";
				html2 += "					<input type='checkbox' value='3'><span class='checkbox-material'><span class='check'></span></span> <em>"+gap.lang.t3+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				html2 += "	</ul>";
				html2 += "</div>";
				
				gTodo.show_qtip(e, html2, 0);
			}
		});*/
	},
	
	"redraw_calendar_event" : function(){
		// 선택된 필터 값에 따라 캘린더를 다시 그린다.
		gTodoC.calendar.removeAllEvents();
		gTodoC.calendar.addEventSource(gTodoC.get_calendar_event_list());	
	},
	
	"update_calendar_event" : function(id){
		if (gBody.cur_todo == "calendar"){
			var _event = new Object();
			var _item = $.map(gTodo.cur_project_item_list, function(ret, key) {
				if (ret._id == id){
					return ret;
				}
			});
			//console.log(_item);
/*			_item = _item[0];
			_event.id = _item._id;
			_event.title = _item.title + (_item.asignee != undefined ? " (" + gap.user_check(_item.asignee).disp_user_info + ")" : "");
			_event.start = moment.utc(_item.startdate).local().format('YYYY-MM-DD');
			_event.end = moment.utc(_item.enddate).local().add(1, "days").format("YYYY-MM-DD");

			if (_item.color != undefined){
				var $p = $("<p class='" + _item.color + "'></p>").hide().appendTo("body");
			    var rgb = $p.css("background-color");
			    $p.remove();
			    
			    _event.color = gTodoC.rgb2hex(rgb);				
			}
			_event.allDay = true;*/
			
			gTodoC.calendar.getEventById(id).remove();
			gTodoC.calendar.addEvent(gTodoC.get_calendar_event_info(_item[0]));	
		}
	},
	
	"change_todo_date" : function(id, start_date, end_date){
		var startdate = moment.utc(start_date).format();
		var enddate = moment.utc(end_date).format();
		var data = JSON.stringify({
			startdate : startdate,
			enddate : enddate,
			project_code : gTodo.cur_todo_code,
			select_id : id
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
					// do nothing...
				}else{
					gap.error_alert();
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"compose_todo_calendar" : function(_start_date, _end_date){
		var html = '';
		html += '<h2>' + gap.lang.addtodo + '</h2>';
		html += '<button id="close_todo_calendar" class="ico btn-close">닫기</button>';
		html += '<div class="input-field">';
		html += '	<input type="text" class="formInput" id="new_todo_name">';
		html += '	<label for="new_todo_name" class="">' + gap.lang.todo + '</label>';
		html += '	<span class="bar"></span>';
		html += '</div>';
		html += '<div class="calendar-date">';
		html += '	<h3>' + gap.lang.todo_period + '</h3>';
//		html += '	<p>' + start_date + ' ~ ' + end_date + '</p>';
		html += '	<div class="input-field">';
		html += '		<input type="text" class="formInput" id="cal_startdate" placeholder="' + gap.lang.startdate + '" value="' + _start_date.replace(/-/gi, ".") + '">';
		html += '		<span class="bar"></span>';
		html += '	</div>';
		html += '	~';
		html += '	<div class="input-field">';
		html += '		<input type="text" class="formInput" id="cal_enddate" placeholder="' + gap.lang.enddate + '" value="' + _end_date.replace(/-/gi, ".") + '">';
		html += '		<span class="bar"></span>';
		html += '	</div>';		
		html += '</div>';
		html += '<div class="layer-bottom">';
		html += '	<button id="ok_todo_calendar"><strong>' + gap.lang.OK + '</strong></button>';
		html += '	<button id="cancel_todo_calendar"><span>' + gap.lang.Cancel + '</span></button>';
		html += '</div>';
		$('#compose_todo_calendar').html(html);
				
		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#compose_todo_calendar')
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();
		
		$("#close_todo_calendar").on("click", function(){
			gap.close_layer('compose_todo_calendar');
		});
		$("#cancel_todo_calendar").on("click", function(){
			gap.close_layer('compose_todo_calendar');
		});
		$("#ok_todo_calendar").on("click", function(){
			var title = $("#new_todo_name").val();
			var start_date = $("#cal_startdate").val();
			var end_date = $("#cal_enddate").val();

			if (title == ""){
			//	gap.gAlert('');
			//	return;
			}
			
			if (start_date == ""){
				gap.gAlert(gap.lang.input_startdate);
				return false;
			}
			
			if (end_date == ""){
				gap.gAlert(gap.lang.input_enddate);
				return false;
			}			
			
			var status = "1";
			var tlist = gTodo.get_column_list_ids_list("list_card_" + status);
			var _startdate = new Date(start_date.replace(/\./gi, "-"));
			var _enddate = new Date(end_date.replace(/\./gi, "-"));
			var startdate = moment.utc(_startdate).format();
			var enddate = moment.utc(_enddate).format();
			var cal_start_date = moment(_startdate).format("YYYY-MM-DD")
			var cal_end_date = moment(_enddate).add(1, "days").format("YYYY-MM-DD")
			
			var url = gap.channelserver + "/make_item_todo.km";
			var data = JSON.stringify({
				title : title,
				owner : gap.userinfo.rinfo,
				status : status,
				project_code : gTodo.cur_todo_code,
				project_name : gTodo.cur_todo_name,
				tlist : tlist,
				priority : 3,
				startdate : startdate,
				enddate : enddate,
				checklist : [],
				file : [],
				reply : []
			});
			$.ajax({
				type : "POST",
				datatype : "json",
				contentType : "application/json; charset=utf-8",
				url : url,
				data : data,
				success : function(res){
					if (res.result == "OK"){
						var list = res.data.data;
						gTodo.cur_project_item_list = list;
						gap.close_layer('compose_todo_calendar');

						gTodoC.calendar.addEvent({
							id: res.data.id,
							title: title,
							start: cal_start_date,
							end: cal_end_date,
							allDay: true
						});	
						
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			})			
		});
		
		gTodoC.__todo_selectDate_event();
	},
	
	"__todo_selectDate_event" : function(){
		
		$("#cal_startdate").dateRangePicker({
			container:'body',
			showShortcuts: false,
			format: "YYYY-MM-DD",
			singleDate : false,
			singleMonth: false,
			autoClose: true
			
		}).bind('datepicker-change', function(evt,obj){
			$(this).val("");				
										
			var dis_start = moment.utc(obj.date1).format("YYYY.MM.DD");
			var dis_end = moment.utc(obj.date2).format("YYYY.MM.DD");
			
			var startdate = moment.utc(obj.date1).format();
			var enddate = moment.utc(obj.date2).format();

			$("#cal_startdate").val(dis_start);
			$("#cal_enddate").val(dis_end);
			
		}).bind('datepicker-first-date-selected', function(event, obj){
							
		}).bind('datepicker-closed',function(){
			var obj = $("#cal_startdate").data('dateRangePicker');
			if (typeof(obj) != "undefined"){
	
			}
		});

		$("#cal_startdate").on("click", function(e){		
			e.stopPropagation();
			
			var st = $("#cal_startdate").val();
			var et = $("#cal_enddate").val();
			if (st != ""){
			}
			
			$("#cal_startdate").data('dateRangePicker').open();
			var max_idx = gap.maxZindex();
			$(".date-picker-wrapper").css({'zIndex': parseInt(max_idx) + 1});
		});
		
		$("#cal_enddate").on("click", function(e){		
			e.stopPropagation();
			
			var st = $("#cal_startdate").val();
			var et = $("#cal_enddate").val();
			if (st != ""){
			}
			
			$("#cal_startdate").data('dateRangePicker').open();

			var max_idx = gap.maxZindex();
			$(".date-picker-wrapper").css({'zIndex': parseInt(max_idx) + 1});
		});
	},	
	
	"rgb2hex" : function(orig){
		var rgb = orig.replace(/\s/g,'').match(/^rgba?\((\d+),(\d+),(\d+)/i);
		return (rgb && rgb.length === 4) ? "#" +
				("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
				("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
				("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : orig;
	},

	
	
	
	
	
	
	
	
	"todo_left" : function(){
		/////////////////////////////// 좌측 메뉴  디자인 ////////////////////////////////////////////////////////////
		var html = "";
		
		html += "<button class='ico btn-left-fold'>접기</button> <!-- 클릭시 on 클래스 추가 -->";
		html += "<div class='nav-todo'>";
		html += "	<ul>";
		html += "		<li class='lnb-mytodo' id='my_job_static'>";
		html += "			<em id='my_job_menu'><span class='ico ico-my'></span>"+gap.lang.myjob+"</em>";
		html += "		</li>";
		
		if (useMention == "T"){
			html += "		<li class='lnb-mytodo' id='my_all_mention'>";
			html += "			<em id='my_mention_menu'><span class='ico ico-mention'></span>"+gap.lang.mention+"</em>";
			html += "		</li>";			
		}
		
		html += "		<li class='lnb-bookmark-todo'>";
//		html += "			<em><button class='btn-fold on'>접기</button>"+gap.lang.favorite+"</em>";
		html += "			<em><button class='ico ico-star'>접기</button>"+gap.lang.favorite+"</em>";
		html += "			<ul id='todo_favorite_list'>";
		html += "			</ul>";
		html += "		</li>";
		html += "		<li class='lnb-todo'>";
		html += "			<em><button class='btn-fold on'>접기</button>To Do<button id='create_todo_folder' class='ico btn-todo-add todo-info'>추가</button></em>";
		html += "			<ul id='todo_folder_list' class='todo-folder-list'>";
		html += "			</ul>";
		html += "		</li>";
		html += "		<li class='lnb-box-todo' >";										
		html += "			<em><button class='btn-fold on'>접기</button>"+gap.lang.ch_tab1 + " " + gap.lang.ch_tab3+" List<!--<button class='ico btn-todo-add box-todo-info'>추가</button>--></em>";		
		html += "			<ul id='todo_box_list'>";		
//		html += "				<li><em><span class='ico ico-continue-c'></span>ECM-Lite 연동프로젝트<button class='ico btn-more'>더보기</button></em></li>";		
//		html += "				<li><em><span class='ico ico-continue-c'></span>모바일 개발<button class='ico btn-more'>더보기</button></em></li>";		
//		html += "				<li><em><span class='ico ico-continue-c'></span>Exchange 제거<button class='ico btn-more'>더보기</button></em></li>";		
//		html += "				<li><em><span class='ico ico-continue-c'></span>디자인팀<button class='ico btn-more'>더보기</button></em></li>";		
		html += "			</ul>";		
		html += "		</li>";		
		html += "	</ul>";		
		html += "</div>";		
		
		$("#nav_left_menu").off();
		$("#nav_left_menu").html(html);
		
		var url = gap.channelserver + "/folder_list_todo.km";
	/*	var data = JSON.stringify({
			email : gap.search_cur_em_sec()
		});*/
		
		var data = JSON.stringify({});
		
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : url,
			data : data,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					gTodoC.draw_todo_left(res);
				}
			},
			error : function(e){
				gap.error_alert();
			}
		})
	
		gTodoC.__todo_left_event();
		///////////////////////////// 좌측 메뉴 디자인 종료 /////////////////////////////////////////////////////////////
	},
	
	"draw_todo_left" : function(res){
		var _data = res.data.data;
		var _favdata = res.data.favorite;
		gBody.cur_todo_list = _data;
		gBody.cur_todo_star_list = _favdata;
		
		$("#todo_favorite_list").empty();
		$("#todo_folder_list").empty();
		$("#todo_box_list").empty();
				
		for (var i = 0; i < _data.length; i++){
			var info = _data[i];
			var _type = info.type;
			var _id = info._id;
			var _name = info.name;
			var _owner = info.owner.em;
			var _html = '';
			                 
			if (_type == "folder"){
				_html += '<li id="' + _id + '" todo-name="' + _name + '" todo-type="folder" owner="' + _owner + '" >';
				_html += '	<em id="em_' + _id + '" class="folder-item"><span class="ico ico-todo-folder"></span>' + _name + '<button class="ico btn-more folder-mng">더보기</button></em>';
				_html += '</li>';
				
			}else if (_type == "project"){
				var _status = gTodoC.get_todo_progress_ststus(info);

				_html += '<li id="' + _id + '" class="project-item" todo-name="' + _name + '" todo-type="project" owner="' + _owner + '">';
				_html += '	<em id="em_' + _id + '"><span class="ico ico-' + _status + '-c"></span>' + _name + '<button class="ico btn-more project-mng">더보기</button></em>';
				_html += '</li>';							
			}
			
			
			if (_type == "project" && info.opt && info.opt == "plugin"){
				$("#todo_box_list").append(_html);
					
			}else if (_type == "project" && info.folderkey && info.folderkey != ""){
				if ($("#" + info.folderkey).length == 0){
					$("#todo_folder_list").append(_html);
					
				}else{
					if ($("#" + info.folderkey).find("li").length == 0){
						var _ul_html = '<ul id="ul_' + info.folderkey + '">' + _html + '</ul>';
						$("#" + info.folderkey).append(_ul_html);
			
					}else{
						$("#ul_" + info.folderkey).append(_html);
					}				
				}

			}else{
				$("#todo_folder_list").append(_html);
			}
		}
		
		//즐겨찾기
		for (var i = 0; i < _favdata.length; i++){
			var favinfo = _favdata[i];
			var _owner = favinfo.owner.em;
			var _status = gTodoC.get_todo_progress_ststus(favinfo);
			var _html = '';
		
			_html += '<li id="favorite_' + favinfo._id + '" class="fav-project-item" todo-name="' + favinfo.name + '" todo-type="project" owner="' + _owner + '">';
			_html += '	<em id="fav_em_' + favinfo._id + '"><span class="ico ico-' + _status + '-c"></span>' + favinfo.name + '<button class="ico btn-more favorite-mng">더보기</button></em>';
			_html += '</li>';
			
			$("#todo_favorite_list").append(_html);
		}	
		
		//ToDo를 드래그&드롭으로 이동하기
		//gTodo.dragset();
		
		
	},
	
	
	
	"get_todo_progress_ststus" : function(info){
		var _res = "";
		if (info.count_0 == undefined){
			_res = "wait";
			
		}else{
			if (info.count_4 > 0){
				_res = "delay";	
				
			}else if (info.count_2 > 0){
				_res = "continue";
				
			}else if ((info.count_3 > 0) && (info.count_1 == 0 && info.count_2 == 0 && info.count_4 == 0)){
				_res = "complete";
				
			}else{
				_res = "wait";
			}
		}
		return _res;
	},
	
	"draw_favorite_list" : function(_type, _info){
		
		// 즐겨찾기만 처리 (추가 / 삭제)
		var todo_code = _info._id;
		var todo_name = _info.name;

		if (_type == "add"){
			gBody.cur_todo_star_list.push(_info);
			
			var _status = gTodoC.get_todo_progress_ststus(_info);
			var _html = '';
			
			_html += '<li id="favorite_' + todo_code + '" class="fav-project-item" todo-name="' + todo_name + '" todo-type="project">';
			_html += '	<em id="fav_em_' + todo_code + '"><span class="ico ico-' + _status + '-c"></span>' + todo_name + '<button class="ico btn-more favorite-mng">더보기</button></em>';
			_html += '</li>';
			
			$("#todo_favorite_list").append(_html);			
			
		}else if (_type == "del"){
			for (var i = 0; i < gBody.cur_todo_star_list.length; i++){
				var item = gBody.cur_todo_star_list[i];
			    if (item._id == todo_code) { 
			    	gBody.cur_todo_star_list.splice(i, 1);
			        break;
			    }				
			}
			
			$("#favorite_" + todo_code).remove();
		}
		
	},
	
	"update_todo_progress_icon" : function(_id, _status){
		// 프로젝트 정보 화면에서 이벤트 발생 시 호출 (상태 아이콘 업데이트)
		var ret = "";
		if (_status == "1"){
			ret = "wait";
			
		}else if (_status == "2"){
			ret = "continue";
			
		}else if (_status == "3"){
			ret = "complete";
			
		}else if (_status == "4"){
			ret = "delay";
			
		}
		
		$("#fav_em_" + _id + " span").removeClass();
		$("#em_" + _id + " span").removeClass();
		
		$("#fav_em_" + _id + " span").addClass('ico ico-' + ret + '-c');
		$("#em_" + _id + " span").addClass('ico ico-' + ret + '-c');
	},
	
	"todo_attachment" : function(){
		var _html = "";
		_html += "<div class='todo-files' style='height:100%;'>";
		_html += "	<h2>파일</h2>";
		_html += "	<button class='ico btn-right-close' id='file_layer_close'>닫기</button>";
		_html += "	<div class='todo-option' style='display:" + (gTodo.cur_todo_caller == "plugin" ? "none" : "") + "'>";
		_html += "		<div class='option-folder' id='todo_option_folder_select'>";
		_html += "			<button class='btn-txt'><em class='caret'></em><span id='project_option_title' project_cd=''>" + gap.lang.all_folders + "</span></button>";
		_html += "		</div>";
		_html += "		<div class='option-member' id='todo_option_member_select'>";
		_html += "			<button class='btn-txt'><em class='caret'></em><span id='member_option_title' member_em=''>" + gap.lang.all_members + "</span></button>";
		_html += "		</div>";
		_html += "	</div>";
		_html += "	<div class='filter' id='file_filter'" + (gTodo.cur_todo_caller == "plugin" ? " style='padding-top:8px;'" : "") + ">";
		_html += "		<ul>";
		_html += "			<li style='margin-right:8px'><button class='ico btn-filter-ppt'></button></li>";
		_html += "			<li style='margin-right:8px'><button class='ico btn-filter-word'></button></li>";
		_html += "			<li style='margin-right:8px'><button class='ico btn-filter-excel'></button></li>";
		_html += "			<li style='margin-right:8px'><button class='ico btn-filter-pdf'></button></li>";
		_html += "			<li style='margin-right:8px'><button class='ico btn-filter-img'></button></li>";
		_html += "			<li style='margin-right:8px'><button class='ico btn-filter-video'></button></li>";
		_html += "		</ul>";
		_html += "	</div>";		
		_html += "	<div class='card-list' id='wrap_todo_file_list' style='height:calc(100% - 90px)'>";
		_html += "		<ul class='card' id='todo_file_list' style='padding-right:13px;'>";
		_html += "		</ul>";
		_html += "	</div>";
		_html += "</div>";
		
		$("#center_content").css("width","calc(100% - 300px)");
		$("#sub_channel_content").css("width","calc(100% - 300px)");   //채널에서 To Do 우측 프레임 닫았다가 다시 열때 사용함
	//	$("#user_profile").css("width", "290px");
		$(".right-area").hide();
		$("#user_profile").css("width", "290px");
		$("#user_profile").show();
		$("#user_profile").off();
		$("#user_profile").removeAttr("class");
		$("#user_profile").addClass("right-area channel-info");
		$("#user_profile").html(_html);
		
		$("#project_option_title").html(gTodo.cur_todo_name);
		$("#project_option_title").attr("project_cd", gTodo.cur_todo_code);
		
		gTodoC.__todo_attachment_option_event();
		gTodoC.draw_todo_attachment(1);
	},
	
	"draw_todo_attachment" : function(page_no){
		
		$("#todo_file_list").empty();
		gTodoC.todo_file_count = 0;
		gTodoC.todo_file_total_count = 0;			
		gTodoC.start_skp = (parseInt(gTodoC.per_page) * (parseInt(page_no))) - (parseInt(gTodoC.per_page) - 1);
		
		var project_code = $("#project_option_title").attr("project_cd");
		var member_email = $("#member_option_title").attr("member_em");

		var surl = gap.channelserver + "search_file_todo.km";
		var postData = JSON.stringify({
				"project_code" : (project_code == "" ? gTodo.cur_todo_code : project_code),
				"type" : gTodoC.click_filter_image,
				"member" : member_email,
				"perpage" : gTodoC.per_page,
				"start" : gTodoC.start_skp - 1
			});			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			success : function(res){
				if (res.result == "OK"){
					gTodoC.todo_file_count += res.data.data.length;
					gTodoC.todo_file_total_count = res.data.totalcount;
					gTodoC.draw_todo_attachment_list(page_no, res.data.data);			
					
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
	
	"add_todo_attachment_list" : function(page_no){
		
		var is_continue = false;
		if (gTodoC.todo_file_total_count > gTodoC.todo_file_count){
			is_continue = true;
		}
		if (is_continue){
			gTodoC.start_skp = (parseInt(gTodoC.per_page) * (parseInt(page_no))) - (parseInt(gTodoC.per_page) - 1);
			
			var project_code = $("#project_option_title").attr("project_cd");
			var member_email = $("#member_option_title").attr("member_em"); 
			
			var surl = gap.channelserver + "search_file_todo.km";
			var postData = JSON.stringify({
					"project_code" : (project_code == "" ? gTodo.cur_todo_code : project_code),
					"type" : gTodoC.click_filter_image,
					"member" : member_email,					
					"perpage" : gTodoC.per_page,
					"start" : gTodoC.start_skp - 1
				});			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : postData,
				success : function(res){
					if (res.result == "OK"){
						gTodoC.todo_file_count += res.data.data.length;
						gTodoC.todo_file_total_count = res.data.totalcount;
						gTodoC.draw_todo_attachment_list(page_no, res.data.data)					
						
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
	
	"draw_todo_attachment_list" : function(page_no, res){
		var _data = res;
		for (var i = 0; i < _data.length; i++){
			if (_data[i].file != undefined){
				var files = _data[i].file;
				var todo_id = _data[i]._id;
				var todo_title = gap.textToHtml(_data[i].title);
				
				for (var j = 0; j < files.length; j++){
					var file_info = files[j];
					gTodoC.draw_todo_attachment_html(file_info, todo_id, todo_title);
					/*var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(file_info.GMT));
					var disp_time = gap.change_date_localTime_only_time(String(file_info.GMT));
					var icon_kind = gap.file_icon_check(file_info.filename);
					var file_owner = gap.user_check(file_info.owner);
					var is_show = gap.check_preview_file(file_info.filename);
		    		var is_pre = gap.is_file_type(file_info.filename);
					var _html = '';
					
					_html += "<li id='" + file_info.md5.replace(".","_") + "' tid='" + todo_id + "' fserver='" + file_info.fserver + "' fname='" + file_info.filename + "'>";
					_html += "	<span class='name'>" + file_owner.name + gap.lang.hoching + "<em class='date'>" + disp_date + " " + disp_time + "</em></span>";
					_html += "	<div class='todo-attach'>";
					_html += "		<span class='ico ico-file " + icon_kind + "'></span>";
					_html += "		<dl>";						
					_html += "			<dt>" + file_info.filename + "</dt>";
					_html += "			<dd>" + gap.file_size_setting(file_info.file_size.$numberLong) + "</dd>";
					_html += "		</dl>";
					_html += "	</div>";
					_html += "	<div class='todo-sbj'><span class='ico ico-wait-c'></span>" + todo_title + "</div>";
					_html += "	<div class='card-btns'>";
					_html += "		<div class='wrap-btns'>";
					if (is_show || is_pre == "img" || is_pre == "movie"){
						_html += "			<button class='ico btn-c-preview'></button>";
					}
					_html += "			<button class='ico btn-c-download'></button>";
					if (file_owner.ky == gap.userinfo.rinfo.ky){
						_html += "			<button class='ico btn-c-delete'></button>";
					}
					_html += "		</div>";
					_html += "	</div>";
					_html += "</li>";

					$("#todo_file_list").append(_html);*/
				}				
				
			}else{
				var file_info = _data[i];
				var todo_id = file_info.id;
				var todo_title = file_info.title;
				gTodoC.draw_todo_attachment_html(file_info, todo_id, todo_title);
				
				/*var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(file_info.GMT));
				var disp_time = gap.change_date_localTime_only_time(String(file_info.GMT));
				var icon_kind = gap.file_icon_check(file_info.filename);
				var file_owner = gap.user_check(file_info.owner);
				var is_show = gap.check_preview_file(file_info.filename);
	    		var is_pre = gap.is_file_type(file_info.filename);
				var _html = '';
				
				_html += "<li id='" + file_info.md5.replace(".","_") + "' tid='" + todo_id + "' fserver='" + file_info.fserver + "' fname='" + file_info.filename + "'>";
				_html += "	<span class='name'>" + file_owner.name + gap.lang.hoching + "<em class='date'>" + disp_date + " " + disp_time + "</em></span>";
				_html += "	<div class='todo-attach'>";
				_html += "		<span class='ico ico-file " + icon_kind + "'></span>";
				_html += "		<dl>";						
				_html += "			<dt>" + file_info.filename + "</dt>";
				_html += "			<dd>" + gap.file_size_setting(file_info.file_size.$numberLong) + "</dd>";
				_html += "		</dl>";
				_html += "	</div>";
				_html += "	<div class='todo-sbj'><span class='ico ico-wait-c'></span>" + todo_title + "</div>";
				_html += "	<div class='card-btns'>";
				_html += "		<div class='wrap-btns'>";
				if (is_show || is_pre == "img" || is_pre == "movie"){
					_html += "			<button class='ico btn-c-preview'></button>";
				}
				_html += "			<button class='ico btn-c-download'></button>";
				if (file_owner.ky == gap.userinfo.rinfo.ky){
					_html += "			<button class='ico btn-c-delete'></button>";
				}
				_html += "		</div>";
				_html += "	</div>";
				_html += "</li>";
				
				$("#todo_file_list").append(_html);*/
			}

			
		}

		$("#wrap_todo_file_list").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable: false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : false,
			callbacks : {
				onTotalScrollBackOffset: 100,
				onTotalScroll: function(){
					gTodoC.add_todo_attachment_list(page_no + 1);
				},
				onTotalScrollOffset: 100,
				alwaysTriggerOffsets:true
			}
		});
		
		gTodoC.__todo_attachment_list_event();
	},
	
	"draw_todo_attachment_html" : function(file_info, todo_id, todo_title){
		var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(file_info.GMT));
		var disp_time = gap.change_date_localTime_only_time(String(file_info.GMT));
		var icon_kind = gap.file_icon_check(file_info.filename);
		var file_owner = gap.user_check(file_info.owner);
		var is_show = gap.check_preview_file(file_info.filename);
		var is_pre = gap.is_file_type(file_info.filename);
		var _html = '';
		
		_html += "<li id='" + file_info.md5.replace(".","_") + "' tid='" + todo_id + "' fserver='" + file_info.fserver + "' fname='" + file_info.filename + "'>";
		_html += "	<span class='name'>" + file_owner.name + gap.lang.hoching + "<em class='date'>" + disp_date + " " + disp_time + "</em></span>";
		_html += "	<div class='todo-attach'>";
		_html += "		<span class='ico ico-file " + icon_kind + "'></span>";
		_html += "		<dl>";						
		_html += "			<dt>" + file_info.filename + "</dt>";
		_html += "			<dd>" + gap.file_size_setting(file_info.file_size.$numberLong) + "</dd>";
		_html += "		</dl>";
		_html += "	</div>";
		_html += "	<div class='todo-sbj'><span class='ico ico-wait-c'></span>" + todo_title + "</div>";
		_html += "	<div class='card-btns'>";
		_html += "		<div class='wrap-btns'>";
		if (is_show || is_pre == "img" || is_pre == "movie"){
			_html += "			<button class='ico btn-c-preview'></button>";
		}
		_html += "			<button class='ico btn-c-download'></button>";
		if (file_owner.ky == gap.userinfo.rinfo.ky){
			_html += "			<button class='ico btn-c-delete'></button>";
		}
		_html += "		</div>";
		_html += "	</div>";
		_html += "</li>";
		
		$("#todo_file_list").append(_html);		
	},
	
	"todo_archive" : function(){
		//alert("아카이브 리스트 표시해야 한다. 즐겨찾기와 동일하게");
		//아카이브 항목 불러오는 함수 search_archive_todo.km
		//인자 (project_code, start, perpage)
		var html = "";
		
		html += "<div class='todo-archive' style='height:100%;'>";
		html += "	<h2>" + gap.lang.archive + "</h2>";
		html += "	<button class='ico btn-right-close' id='archive_layer_close'>닫기</button>";
		html += "	<div class='todo-option'>";
		html += "		<div class='todo-align'>";
		html += "			<div class='selectbox'>";
		html += "				<select id='todo_project_select'>";
		html += "				</select>";
		html += "			</div>";
		html += "		</div>";
		html += "		<button class='btn-file-search ico' id='btn_archive_search'>Search</button>";
		html += "		<button class='ico btn-search-close ico' id='btn_archive_search_close' style='display:none;'>Close</button>";
		html += "	</div>";
		html += "	<div class='input-field' id='archive_search_input' style='display:none;'>";
		html += "		<input type='text' id='archive_search_query_field' class='formInput' placeholder='" + gap.lang.input_search_query + "'>";
		html += "		<span class='bar'></span>";
		html += "		<button class='btn-file-search ico' id='archive_search_btn'>Search</button>";
		html += "	</div>";
		html += "	<div class='card-list' id='wrap_todo_archive_list' style='height:calc(100% - 70px)'>";
		html += "		<ul class='card' id='todo_archive_list' style='padding-right:13px;'>";
		html += "		</ul>";
		html += "	</div>";
		html += "</div>";
		
		$("#center_content").css("width","calc(100% - 300px)");
		$("#sub_channel_content").css("width","calc(100% - 300px)");   //채널에서 To Do 우측 프레임 닫았다가 다시 열때 사용함
	//	$("#user_profile").css("width", "290px");
		$(".right-area").hide();
		$("#user_profile").css("width", "290px");
		$("#user_profile").show();
		$("#user_profile").off();
		$("#user_profile").removeAttr("class");
		$("#user_profile").addClass("right-area channel-info");
		$("#user_profile").html(html);
		
		var _h = "";
		_h += "<option value='all'>" + gap.lang.All + "</option>";
		
	//	for (var i = 0; i < gBody.cur_todo_list.length; i++){
//			var item = gBody.cur_todo_list[i];
//			if (item.type == "project"){
//				_h += "<option value='" + item._id + "'>" + item.name + "</option>";
//			}
//		}
		
		for (var i = 0; i < gap.cur_channel_list_info.length; i++){
			var item = gap.cur_channel_list_info[i];
			if (item.type != "folder"){
				_h += "<option value='" + item._id + "'> " + item.ch_name + "</option>";
			}
		}
		$("#todo_project_select").html(_h).val(gTodo.cur_project_info._id).material_select();		
		
		gTodoC.__todo_archive_event();
		gTodoC.draw_todo_archive(1);
	},
	
	"draw_todo_archive" : function(page_no){
		$("#todo_archive_list").empty();
		gTodoC.todo_archive_count = 0;
		gTodoC.todo_archive_total_count = 0;			
		gTodoC.start_skp = (parseInt(gTodoC.per_page) * (parseInt(page_no))) - (parseInt(gTodoC.per_page) - 1);
		
		var project_code = $("#todo_project_select").val();
		var search_val = $("#archive_search_query_field").val();
		var surl = gap.channelserver + "/search_archive_todo.km";
	/*	var postData = JSON.stringify({
				"project_code" : (project_code == null ? "all" : project_code),
				"email" : gap.userinfo.rinfo.em,
				"perpage" : gTodoC.per_page,
				"start" : gTodoC.start_skp - 1,
				"q_str" : search_val
			});	*/
		
		var postData = JSON.stringify({
			"project_code" : (project_code == null ? "all" : project_code),
			"perpage" : gTodoC.per_page,
			"start" : gTodoC.start_skp - 1,
			"q_str" : search_val
		});	

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					gTodoC.todo_archive_count += res.data.data.length;
					gTodoC.todo_archive_total_count = res.data.totalcount;
					gTodoC.draw_todo_archive_list(page_no, res.data.data);			
					
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
	
	
	"add_todo_archive_list" : function(page_no){
		var is_continue = false;
		if (gTodoC.todo_archive_total_count > gTodoC.todo_archive_count){
			is_continue = true;
		}
		if (is_continue){
			gTodoC.start_skp = (parseInt(gTodoC.per_page) * (parseInt(page_no))) - (parseInt(gTodoC.per_page) - 1);
			
			var project_code = $("#todo_project_select").val();
			var search_val = $("#archive_search_query_field").val();
			var surl = gap.channelserver + "/search_archive_todo.km";
		/*	var postData = JSON.stringify({
					"project_code" : (project_code == null ? "all" : project_code),
					"email" : gap.userinfo.rinfo.em,
					"perpage" : gTodoC.per_page,
					"start" : gTodoC.start_skp - 1,
					"q_str" : search_val
				});	*/
			
			var postData = JSON.stringify({
				"project_code" : (project_code == null ? "all" : project_code),
				"perpage" : gTodoC.per_page,
				"start" : gTodoC.start_skp - 1,
				"q_str" : search_val
			});	

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : postData,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){
					if (res.result == "OK"){
						gTodoC.todo_archive_count += res.data.data.length;
						gTodoC.todo_archive_total_count = res.data.totalcount;
						gTodoC.draw_todo_archive_list(page_no, res.data.data);				
						
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
	
	"draw_todo_archive_list" : function(page_no, res){
		var _data = res;
		for (var i = 0; i < _data.length; i++){
			gTodoC.draw_todo_archive_html(_data[i]);
		}

		$("#wrap_todo_archive_list").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable: false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : false,
			callbacks : {
				onTotalScrollBackOffset: 100,
				onTotalScroll: function(){
					gTodoC.add_todo_archive_list(page_no + 1);
				},
				onTotalScrollOffset: 100,
				alwaysTriggerOffsets:true
			}
		});
		
		gTodoC.__todo_archive_list_event();
	},
	
	"draw_todo_archive_html" : function(item){
		var file_count = item.file.length;
		var reply_count = (item.reply != undefined ? item.reply.length : 0);
		var total_check_count = item.checklist.length;
		var checked_count = 0;
		for (var j = 0; j < item.checklist.length; j++){
			if (item.checklist[j].complete == "T"){
				checked_count++;
			}
		}
		var html = "";
		
		html += "<li id='archive_" + item._id  + "'>";
		html += "	<div class='color-bar " + item.color + "'></div>";
		html += "	<button class='ico btn-more'>더보기</button>";
		if (item.asignee != undefined){
			var user_info = gap.user_check(item.asignee);
			html += "	<div><span class='name'>" + user_info.name + gap.lang.hoching + "<em class='team'>" + user_info.jt + "/" + user_info.dept + "</em></span></div>";
		}
		
		html += "	<h3>" + item.title + "</h3>";
		if (item.startdate != undefined){
			var dinfo = gTodo.date_diff(item.startdate, item.enddate);
			html += "	<span class='todo-period'>" + dinfo.st + " ~ " + dinfo.et + " (" + dinfo.term + "day)</span>";
		}
		html += "	<dl class='icons'>";
		html += "		<dd><span class='ico ico-clip'></span><em>" + file_count + "</em></dd>";
		html += "		<dd><span class='ico ico-reply'></span><em>" + reply_count + "</em></dd>";
		html += "		<dd><span class='ico ico-checklist'></span><em>" + checked_count + "/" + total_check_count + "</em></dd>";
		html += "	</dl>";
		html += "</li>";
		
		$("#todo_archive_list").append(html);		
	},	
	
	"todo_star" : function(){
		var html = "";
		
		html += "<div class='todo-bookmark' style='height:100%;'>";
		html += "	<h2>" + gap.lang.favorite + "</h2>";
		html += "	<button class='ico btn-right-close' id='star_layer_close'>닫기</button>";
		html += "	<div class='todo-option'>";
		html += "		<div class='todo-align'>";
		html += "			<div class='selectbox'>";
		html += "				<select id='todo_project_select'>";
		html += "				</select>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		html += "	<div class='card-list' id='wrap_todo_star_list' style='height:calc(100% - 70px)'>";
		html += "		<ul class='card' id='todo_star_list' style='padding-right:13px;'>";
		html += "		</ul>";
		html += "	</div>";
		html += "</div>";
		
		$("#center_content").css("width","calc(100% - 300px)");
	//	$("#user_profile").css("width", "290px");
		$(".right-area").hide();
		$("#user_profile").css("width", "290px");
		$("#user_profile").show();
		$("#user_profile").off();
		$("#user_profile").removeAttr("class");
		$("#user_profile").addClass("right-area channel-info");
		$("#user_profile").html(html);
		
		var _h = "";
		_h += "<option value=''>" + gap.lang.All + "</option>";
//		for (var i = 0; i < gBody.cur_todo_list.length; i++){
//			var item = gBody.cur_todo_list[i];
//			if (item.type == "project"){
//				_h += "<option value='" + item._id + "'>" + item.name + "</option>";
//			}
//		}
		
		for (var i = 0; i < gap.cur_channel_list_info.length; i++){
			var item = gap.cur_channel_list_info[i];
			if (item.type != "folder"){
				_h += "<option value='" + item._id + "'> " + item.ch_name + "</option>";
			}
		}
		
	//	$("#todo_project_select").html(_h).val('').material_select();
		$("#todo_project_select").html(_h).val(gTodo.cur_project_info._id).material_select();	
		
		gTodoC.__todo_star_event();
		gTodoC.draw_todo_star(1);
	},
	
	"draw_todo_star" : function(page_no){
		
		$("#todo_star_list").empty();
		gTodoC.todo_star_count = 0;
		gTodoC.todo_star_total_count = 0;			
		gTodoC.start_skp = (parseInt(gTodoC.per_page) * (parseInt(page_no))) - (parseInt(gTodoC.per_page) - 1);
		
		var project_code = $("#todo_project_select").val();
		var surl = gap.channelserver + "/search_favorite_todo.km";
	/*	var postData = JSON.stringify({
				"project_code" : project_code,
				"email" : gap.userinfo.rinfo.em,
				"perpage" : gTodoC.per_page,
				"start" : gTodoC.start_skp - 1
			});*/
		
		var postData = JSON.stringify({
			"project_code" : project_code,
			"perpage" : gTodoC.per_page,
			"start" : gTodoC.start_skp - 1
		});

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					gTodoC.todo_star_count += res.data.data.length;
					gTodoC.todo_star_total_count = res.data.totalcount;
					gTodoC.draw_todo_star_list(page_no, res.data.data);			
					
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
	
	
	"add_todo_star_list" : function(page_no){
		var is_continue = false;
		if (gTodoC.todo_star_total_count > gTodoC.todo_star_count){
			is_continue = true;
		}
		if (is_continue){
			gTodoC.start_skp = (parseInt(gTodoC.per_page) * (parseInt(page_no))) - (parseInt(gTodoC.per_page) - 1);
			
			var project_code = $("#todo_project_select").val();			
			var surl = gap.channelserver + "/search_favorite_todo.km";
		/*	var postData = JSON.stringify({
					"project_code" : project_code,
					"email" : gap.userinfo.rinfo.em,
					"perpage" : gTodoC.per_page,
					"start" : gTodoC.start_skp - 1
				});*/
			
			var postData = JSON.stringify({
				"project_code" : project_code,
				"perpage" : gTodoC.per_page,
				"start" : gTodoC.start_skp - 1
			});

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : postData,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){
					if (res.result == "OK"){
						gTodoC.todo_star_count += res.data.data.length;
						gTodoC.todo_star_total_count = res.data.totalcount;
						gTodoC.draw_todo_star_list(page_no, res.data.data);				
						
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
	
	"draw_todo_star_list" : function(page_no, res){
		var _data = res;
		for (var i = 0; i < _data.length; i++){
			gTodoC.draw_todo_star_html(_data[i]);
/*			var item = _data[i];
			var file_count = item.file.length;
			var reply_count = (item.reply != undefined ? item.reply.length : 0);
			var total_check_count = item.checklist.length;
			var checked_count = 0;
			for (var j = 0; j < item.checklist.length; j++){
				if (item.checklist[j].complete == "T"){
					checked_count++;
				}
			}
			var html = "";
			
			html += "<li id='star_" + item._id  + "'>";
			html += "	<div class='color-bar " + item.color + "'></div>";
			html += "	<button class='ico btn-more'>더보기</button>";
			if (item.asignee != undefined){
				var user_info = gap.user_check(item.asignee);
				html += "	<span class='name'>" + user_info.name + gap.lang.hoching + "<em class='team'>" + user_info.jt + "/" + user_info.dept + "</em></span>";
			}
			
			html += "	<h3>" + item.title + "</h3>";
			if (item.startdate != undefined){
				var dinfo = gTodo.date_diff(item.startdate, item.enddate);
				html += "	<span class='todo-period'>" + dinfo.st + " ~ " + dinfo.et + " (" + dinfo.term + "day)</span>";
			}
			html += "	<dl class='icons'>";
			html += "		<dd><span class='ico ico-clip'></span><em>" + file_count + "</em></dd>";
			html += "		<dd><span class='ico ico-reply'></span><em>" + reply_count + "</em></dd>";
			html += "		<dd><span class='ico ico-checklist'></span><em>" + checked_count + "/" + total_check_count + "</em></dd>";
			html += "	</dl>";
			html += "</li>";
			
			$("#todo_star_list").append(html);*/
		}

		$("#wrap_todo_star_list").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable: false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : false,
			callbacks : {
				onTotalScrollBackOffset: 100,
				onTotalScroll: function(){
					gTodoC.add_todo_star_list(page_no + 1);
				},
				onTotalScrollOffset: 100,
				alwaysTriggerOffsets:true
			}
		});
		
		gTodoC.__todo_star_list_event();
	},
	
	"draw_todo_star_html" : function(item){
		var file_count = item.file.length;
		var reply_count = (item.reply != undefined ? item.reply.length : 0);
		var total_check_count = item.checklist.length;
		var checked_count = 0;
		for (var j = 0; j < item.checklist.length; j++){
			if (item.checklist[j].complete == "T"){
				checked_count++;
			}
		}
		var html = "";
		
		html += "<li id='star_" + item._id  + "'>";
		html += "	<div class='color-bar " + item.color + "'></div>";
		html += "	<button class='ico btn-more'>더보기</button>";
		if ( (item.asignee != undefined) && (item.asignee != "")){
			var user_info = gap.user_check(item.asignee);
			html += "	<div><span class='name'>" + user_info.name + gap.lang.hoching + "<em class='team'>" + user_info.jt + "/" + user_info.dept + "</em></span></div>";
		}
		
		html += "	<h3>" + item.title + "</h3>";
		if (item.startdate != undefined){
			var dinfo = gTodo.date_diff(item.startdate, item.enddate);
			html += "	<span class='todo-period'>" + dinfo.st + " ~ " + dinfo.et + " (" + dinfo.term + "day)</span>";
		}
		html += "	<dl class='icons'>";
		html += "		<dd><span class='ico ico-clip'></span><em>" + file_count + "</em></dd>";
		html += "		<dd><span class='ico ico-reply'></span><em>" + reply_count + "</em></dd>";
		html += "		<dd><span class='ico ico-checklist'></span><em>" + checked_count + "/" + total_check_count + "</em></dd>";
		html += "	</dl>";
		html += "</li>";
		
		$("#todo_star_list").append(html);		
	},
	
	"update_todo_star_list" : function(_type){
		if ($("#todo_star_list").length == 0){
		//	console.log("gTodoC.update_todo_star_list() >>> 실행안함!!!");
			return false;
		}
		
		if (_type == "add"){
			gTodoC.todo_star_count += 1;
			gTodoC.todo_star_total_count += 1;
			
			gTodoC.draw_todo_star_html(gTodo.select_todo);
			gTodoC.__todo_star_list_event();
			
		}else if (_type == "del"){
			gTodoC.todo_star_count = gTodoC.todo_star_count - 1;
			gTodoC.todo_star_total_count = gTodoC.todo_star_total_count - 1;
			
			$("#star_" + gTodo.select_todo._id).remove();
		}
	},
	
	"update_todo_star" : function(_type, _id){
		// 왼쪽 즐겨찾기 더보기 메뉴에서 즐겨찾기 등록/해제 
		var selected_info = "";
		for (var i = 0; i < gBody.cur_todo_list.length; i++){
			var item = gBody.cur_todo_list[i];
			if (_id == item._id){
				selected_info = item;
				break;
			}
		}
		
		var surl = gap.channelserver + "/update_folder_favorite_todo.km";
	/*	var postData = JSON.stringify({
				"email" : gap.userinfo.rinfo.em,
				"project_code" : selected_info._id,
				"project_name" : selected_info.name,
				"ty" : _type
			});*/	
		
		var postData = JSON.stringify({
			"project_code" : selected_info._id,
			"project_name" : selected_info.name,
			"ty" : _type
		});

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
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
	
	
	"check_todo_list" : function(){
		var url = gap.channelserver + "/folder_list_todo.km";					
		var data = JSON.stringify({});		
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : url,
			data : data,
			async : false,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
				
					var _data = res.data.data;
					gBody.cur_todo_list = _data;
				}
			},
			error : function(e){
				gap.error_alert();
			}
		})
	},
	
	
	"todo_mention" : function(){
		
		var html = "";
		
		html += "<div class='todo-bookmark' style='height:100%;'>";
		html += "	<h2>" + gap.lang.mention + " (<span id='mention_unread_count'></span>)</h2>";
		html += "	<button class='ico btn-right-close' id='mention_layer_close'>닫기</button>";
		html += "	<div class='todo-option'>";
		html += "		<div class='todo-align'>";
		html += "			<div class='selectbox'>";
		html += "				<select id='todo_project_select'>";
		html += "				</select>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		html += "	<div class='card-list' id='wrap_todo_mention_list' style='height:calc(100% - 70px)'>";
		html += "		<ul class='card' id='todo_mention_list' style='padding-right:13px;'>";
		html += "		</ul>";
		html += "	</div>";
		html += "</div>";
		
		$("#center_content").css("width","calc(100% - 300px)");
		$("#sub_channel_content").css("width","calc(100% - 300px)");   //채널에서 To Do 우측 프레임 닫았다가 다시 열때 사용함
		
	//	$("#user_profile").css("width", "290px");
		$(".right-area").hide();
		$("#user_profile").css("width", "290px");
		$("#user_profile").show();
		$("#user_profile").off();
		$("#user_profile").removeAttr("class");
		$("#user_profile").addClass("right-area channel-info");
		$("#user_profile").html(html);
		
		var _h = "";
		_h += "<option value=''>" + gap.lang.All + "</option>";
		
		if (gBody.cur_todo_list.length == 0){
			gTodoC.check_todo_list();
		}
		
//		for (var i = 0; i < gBody.cur_todo_list.length; i++){
//			var item = gBody.cur_todo_list[i];
//			if (item.type == "project"){
//				_h += "<option value='" + item._id + "'>" + item.name + "</option>";
//			}
//		}
		
		for (var i = 0; i < gap.cur_channel_list_info.length; i++){
			var item = gap.cur_channel_list_info[i];
			if (item.type != "folder"){
				_h += "<option value='" + item._id + "'> " + item.ch_name + "</option>";
			}
		}
		
		
	//	$("#todo_project_select").html(_h).val('').material_select();
		$("#todo_project_select").html(_h).val(gTodo.cur_project_info._id).material_select();	
		
		gTodoC.__todo_mention_event();
		gTodoC.draw_todo_mention(1);
	},
	
	
	"draw_todo_mention" : function(page_no, opt){
		
		$("#todo_mention_list").empty();
		gTodoC.todo_mention_count = 0;
		gTodoC.todo_mention_total_count = 0;			
		gTodoC.start_skp = (parseInt(gTodoC.per_page) * (parseInt(page_no))) - (parseInt(gTodoC.per_page) - 1);
		
		var project_code = $("#todo_project_select").val();
		var surl = gap.channelserver + "/search_mention_todo.km";
	/*	var postData = JSON.stringify({
				"project_code" : project_code,
				"email" : gap.userinfo.rinfo.em,
				"perpage" : gTodoC.per_page,
				"start" : gTodoC.start_skp - 1
			});*/
		
		var postData = JSON.stringify({
			"project_code" : project_code,
			"perpage" : gTodoC.per_page,
			"start" : gTodoC.start_skp - 1
		});
		

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					
				
					
					gTodoC.todo_mention_count += res.data.data.length;
					gTodoC.todo_mention_total_count = res.data.totalcount;
					
					$("#mention_unread_count").text(res.data.unreadcount)
					
					gTodoC.draw_todo_mention_list(page_no, res.data.data);			
					
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
	
	
	"draw_todo_status" : function(opt, status){
		$("#todo_status_list").empty();
//		gTodoC.todo_mention_count = 0;
//		gTodoC.todo_mention_total_count = 0;			
//		gTodoC.start_skp = (parseInt(gTodoC.per_page) * (parseInt(page_no))) - (parseInt(gTodoC.per_page) - 1);
//		
//		var project_code = $("#todo_project_select").val();
		var surl = gap.channelserver + "/status_search_mobile.km";
	/*	var postData = JSON.stringify({
				"project_code" : project_code,
				"email" : gap.userinfo.rinfo.em,
				"perpage" : gTodoC.per_page,
				"start" : gTodoC.start_skp - 1
			});*/
		
		var postData = JSON.stringify({
			"opt" : opt,
			"status" : status
		});
		

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
				//	gTodoC.todo_mention_count += res.data.data.length;
				//	gTodoC.todo_mention_total_count = res.data.totalcount;
					gTodoC.draw_todo_status_list(res.data.data);			
					
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
	
	
	
	
	
	
	
	"add_todo_mention_list" : function(page_no){
		var is_continue = false;
		if (gTodoC.todo_mention_total_count > gTodoC.todo_mention_count){
			is_continue = true;
		}
		if (is_continue){
			gTodoC.start_skp = (parseInt(gTodoC.per_page) * (parseInt(page_no))) - (parseInt(gTodoC.per_page) - 1);
			
			var project_code = $("#todo_project_select").val();			
			var surl = gap.channelserver + "/search_mention_todo.km";
		/*	var postData = JSON.stringify({
					"project_code" : project_code,
					"email" : gap.userinfo.rinfo.em,
					"perpage" : gTodoC.per_page,
					"start" : gTodoC.start_skp - 1
				});*/
			
			var postData = JSON.stringify({
				"project_code" : project_code,
				"perpage" : gTodoC.per_page,
				"start" : gTodoC.start_skp - 1
			});

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : postData,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){
					if (res.result == "OK"){
						gTodoC.todo_mention_count += res.data.data.length;
						gTodoC.todo_mention_total_count = res.data.totalcount;
						gTodoC.draw_todo_mention_list(page_no, res.data.data);				
						
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
	
	"draw_todo_mention_list" : function(page_no, res){
		var _data = res;
		for (var i = 0; i < _data.length; i++){
			gTodoC.draw_todo_mention_html(_data[i]);
		}

		$("#wrap_todo_mention_list").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable: false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : false,
			callbacks : {
				onTotalScrollBackOffset: 100,
				onTotalScroll: function(){
					gTodoC.add_todo_mention_list(page_no + 1);
				},
				onTotalScrollOffset: 100,
				alwaysTriggerOffsets:true
			}
		});
		
		gTodoC.__todo_mention_list_event();
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
		var item = gTodo.code_change_status(info.status);
		var project_code = $("#todo_project_select").val();	
		
		var html = "";
		
		html += "<li id='mention_" + info._id  + "' data-todo='" + info._id + "'>";
		
		if (typeof(info.color) != "undefined"){
			html += "	<div class='color-bar " + info.color + "'></div>";
		}else{
			html += "	<div class='color-bar'></div>";
		}
		
		html += "	<button class='ico btn-more'>더보기</button>";
	//	html += "	<div><span class='name'>" + info.owner.nm + gap.lang.hoching + "<em class='team'>" + disp_date + ' ' + disp_time + "</em></span></span></div>";
		
		if (info.status != "0"){
			html += "	<div class='status'><span class='ico ico-" + item.style + "-c'></span>" + item.txt + "</div>";
		}

		var priority = info.priority;
		if (typeof(info.priority) != "undefined" || priority == ""){
			html += "	<h3 class='todo-title' style='padding-left:15px'><span class='ico p" + priority + "'></span>" + (project_code == "" ? "[" + info.project_name + "] " : "") + info.title + "</h3>";
		}else{
			html += "	<h3 class='todo-title' style='padding-left:15px'>" + (project_code == "" ? "[" + info.project_name + "] " : "") + info.title + "</h3>";
		}
		
		if (info.startdate != undefined){
			var dinfo = gTodo.date_diff(info.startdate, info.enddate);
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
	
	
	
	
	
	"draw_todo_status_list" : function(res){
		var _data = res;
		for (var i = 0; i < _data.length; i++){
			gTodoC.draw_todo_status_html(_data[i]);
		}

		$("#wrap_todo_status_list").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable: false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : false,
			callbacks : {
				onTotalScrollBackOffset: 100,
//				onTotalScroll: function(){
//					gTodoC.add_todo_star_list(page_no + 1);
//				},
				onTotalScrollOffset: 100,
				alwaysTriggerOffsets:true
			}
		});
		
		gTodoC.__todo_status_list_event();
	},
	
	"draw_todo_status_html" : function(item){
		var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(item.GMT));
		var disp_time = gap.change_date_localTime_only_time(String(item.GMT));
		
//		var html = "";
//		
//		html += "<li id='mention_" + item.key2  + "'>";
//		html += "	<div class='color-bar'></div>";
//		html += "	<button class='ico btn-more'>더보기</button>";
//		html += "	<div><span class='name'>" + item.fr + gap.lang.hoching + "<em class='team'>" + disp_date + ' ' + disp_time + "</em></span></div>";
//		html += "	<h3>" + item.content + "</h3>";
//		html += "</li>";
//		
//		$("#todo_status_list").append(html);		
		
		var file_count = item.file.length;
		var reply_count = (item.reply != undefined ? item.reply.length : 0);
		var total_check_count = item.checklist.length;
		var checked_count = 0;
		for (var j = 0; j < item.checklist.length; j++){
			if (item.checklist[j].complete == "T"){
				checked_count++;
			}
		}
		
		var html = "";
		
		html += "<li id='star_" + item._id  + "'>";
		html += "	<div class='color-bar " + item.color + "'></div>";
		html += "	<button class='ico btn-more'>더보기</button>";
	//	if (item.asignee != undefined){
		if ( (item.asignee != undefined) && (item.asignee != "")){
			var user_info = gap.user_check(item.asignee);
			html += "	<div><span class='name'>" + user_info.name + gap.lang.hoching + "<em class='team'>" + user_info.jt + "/" + user_info.dept + "</em></span></div>";
		}
		
		html += "	<h3>" + item.title + "</h3>";
		if (item.startdate != undefined){
			var dinfo = gTodo.date_diff(item.startdate, item.enddate);
			html += "	<span class='todo-period'>" + dinfo.st + " ~ " + dinfo.et + " (" + dinfo.term + "day)</span>";
		}
		html += "	<dl class='icons'>";
		html += "		<dd><span class='ico ico-clip'></span><em>" + file_count + "</em></dd>";
		html += "		<dd><span class='ico ico-reply'></span><em>" + reply_count + "</em></dd>";
		html += "		<dd><span class='ico ico-checklist'></span><em>" + checked_count + "/" + total_check_count + "</em></dd>";
		html += "	</dl>";
		html += "</li>";
		
		$("#todo_status_list").append(html);
		
		
	},
	
	
	"show_qtip" : function(e, html, leftposition){
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
				event : 'unfocus click',
				fixed : true
			},
			style : {
				classes : 'qtip-bootstrap',
				tip : true
			},
			position : {
				viewport: $("#todo_scroll"),
				my : 'top center',
//				at : 'bottom bottom',			
				adjust: {
				  x: leftposition,
				  y: -5
				}
				
			},
			events : {
				show : function(event, api){	

					$("#project_option_list li").off();
					$("#project_option_list li").on("click", function(e){
						$("#project_option_title").html($(this).attr("project_nm"));
						$("#project_option_title").attr("project_cd", $(this).attr("id").replace("project_", ""));
						
						$("#member_option_title").html(gap.lang.all_members);
						$("#member_option_title").attr("member_em", "");
						
						gTodoC.draw_todo_attachment(1);
					});
					
					$("#member_option_list li").off();
					$("#member_option_list li").on("click", function(e){
						$("#member_option_title").html($(this).attr("member_nm"));
						$("#member_option_title").attr("member_em", $(this).attr("member_em"));
						gTodoC.draw_todo_attachment(1);
					});					
					
				},
				hidden : function(event, api){
					api.destroy(true);
				}
			}
		});
	},	
	
	"__todo_attachment_option_event" : function(){
		$("#file_layer_close").off();
		$("#file_layer_close").on("click", function(e){
			$("#center_content").css("width","calc(100% - 10px)");
			//$("#user_profile").hide();
			$("#btn_todo_invite").click();
		});

		$(".todo-option .btn-txt").off();
		$(".todo-option .btn-txt").on("click", function(e){
			var cls = $(this).parent().attr("class");
			var _html = "";

			if (cls == "option-folder"){
				_html += "<div class='qtip-default' style='border:none' id='project_option_list'>";
			/*	_html += "		<ul class='layer-option-list'>";
				_html += "			<li class='on'><em>" + gap.lang.all_folders + "</em></li>";
				_html += "		</ul>";*/
				_html += "		<div class='option-group'>";
				_html += "			<ul class='layer-option-list'>";
				for (var i = 0; i < gap.cur_channel_list_info.length; i++){
					var todo_item = gap.cur_channel_list_info[i];
					if (todo_item.type != "folder"){
						_html += "				<li id='project_" + todo_item._id + "' project_nm='" + todo_item.ch_name + "'><em>" + todo_item.ch_name + "</em></li>";
					}
				}
				_html += "			</ul>";
				_html += "		</div>";

				_html += "	</div>";
				_html += "</div>";
				
			}else if (cls == "option-member"){
				/////////////////////////////////////////////////////////////////////////
				var member_list = new Array();
				var unique_member_list = new Array();
				var selected_project_code = $("#project_option_title").attr("project_cd");

				for (var i = 0; i < gap.cur_channel_list_info.length; i++){
					var todo_item = gap.cur_channel_list_info[i];
					if (todo_item.type != "folder"){
						if (todo_item._id == selected_project_code){
							member_list.push(todo_item.owner);
							for (var j = 0; j < todo_item.member.length; j++){
								member_list.push(todo_item.member[j]);
							}
						}
					}
				}
				
		        var count = 0;
		        var start = false;
		          
		        for (var h = 0; h < member_list.length; h++) {
		            for (var k = 0; k < unique_member_list.length; k++) {
		                if ( member_list[h].ky == unique_member_list[k].ky ) {
		                    start = true;
		                }
		            }
		            count++;
		            if (count == 1 && start == false) {
		            	unique_member_list.push(member_list[h]);
		            }
		            start = false;
		            count = 0;
		        }
		        /////////////////////////////////////////////////////////////////////////

				_html += "<div class='qtip-default' style='border:none' id='member_option_list'>";
				_html += "	<div class='layer-option-member'>";
				_html += "	<ul class='layer-option-list'>";
				_html += "		<li id='option_all_members' member_em='' member_nm='" + gap.lang.all_members + "'><em>" + gap.lang.all_members + "</em></li>";

				for (var k = 0; k < unique_member_list.length; k++){
					var member_info = gap.user_check(unique_member_list[k]);
					
					_html += "		<li member_em='" + member_info.email + "' member_nm='" + member_info.name + gap.lang.hoching + "'>";
					_html += "			<div class='user'>";
					_html += "				<div class='user-thumb'>" + member_info.user_img + "</div>";
					_html += "				<dl>";
					_html += "					<dt>" + member_info.name + gap.lang.hoching + "</dt>";
					_html += "					<dd>" + member_info.jt + " / " + member_info.dept + "</dd>";
					_html += "				</dl>";
					_html += "			</div>";
					_html += "		</li>";					
				}

				_html += "	</ul>";
				_html += "</div>";
				_html += "</div>";
			}
			gTodoC.show_qtip(e, _html, 0);
		});
		
		$("#file_filter ul li button").on("click", function(e){
			$("#file_filter ul li button").removeClass("on");
			
			var id = $(this).get(0).className;
			var filter = "";
			var pre_filter = gTodoC.click_filter_image;
			
			if ((id.indexOf(pre_filter) > -1) && (pre_filter != "")){
				//alert("기존에 클릭한 거 클릭");
				gTodoC.click_filter_image = "";
				gTodoC.draw_todo_attachment(1);
				$(this).removeClass("on");
					
			}else{
				//alert("다른거 클릭");		
				gTodoC.click_filter_image = id.replace("ico btn-filter-", "");
					
				$(this).addClass("on");
				gTodoC.draw_todo_attachment(1);
			}
		});		
	},	
	
	"__todo_attachment_list_event" : function(){

		$("#todo_file_list .btn-c-preview").off();
		$("#todo_file_list .btn-c-preview").on("click", function(e){
			var tid = $(this).closest("li").attr("tid");
			var filename = $(this).closest("li").attr("fname");
			var fserver = $(this).closest("li").attr("fserver");
			var md5 = $(this).closest("li").attr("id").replace("_", ".");

			gTodo.show_file_fullscreen_todo(filename, fserver, md5, tid);
		});		
		
		$("#todo_file_list .btn-c-download").off();
		$("#todo_file_list .btn-c-download").on("click", function(e){
			var filename = $(this).closest("li").attr("fname");
			var fserver = $(this).closest("li").attr("fserver");
			var md5 = $(this).closest("li").attr("id").replace("_", ".");

			var downloadurl = gap.search_file_convert_server(fserver) + "/FDownload.do?id=" + gTodo.select_id + "&md5=" + md5 + "&ty=todo"
			gap.file_download_normal(downloadurl, filename);
			return false;
		});
		
		$("#todo_file_list .btn-c-delete").off();
		$("#todo_file_list .btn-c-delete").on("click", function(e){
			var pid = $(this).closest("li").attr("id");
			var tid = $(this).closest("li").attr("tid");
			var filename = $(this).closest("li").attr("fname");
			var fserver = $(this).closest("li").attr("fserver");
			var md5 = $(this).closest("li").attr("id").replace("_", ".");
			
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
								"id" : tid,
								"md5" : md5
							});			
							url = gap.channelserver + "/delete_sub_file_todo.km";
							$.ajax({
								type : "POST",
								dataType : "json",
								url : url,
								data : data,
								success : function (res){
									if (res.result == "OK"){								
										$("#" + pid).remove();
										gTodo.file_count_check();
									
										var change_doc = res.data.doc;
										gTodo.change_local_data(change_doc);
									
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
		});
	},
	
	"__todo_star_event" : function(){
		//$('select').material_select();
		
		$("#star_layer_close").off();
		$("#star_layer_close").on("click", function(e){
			$("#center_content").css("width","calc(100% - 10px)");
		//	$("#user_profile").hide();
			$("#btn_todo_invite").click();
		});
		
		$("#todo_project_select").off();
		$("#todo_project_select").on("change", function(e){
			gTodoC.draw_todo_star(1);
		});
		
		
/*		$(".todo-option .btn-txt").off();
		$(".todo-option .btn-txt").on("click", function(e){
			var cls = $(this).parent().attr("class");
			var _html = "";

			_html += "<div class='qtip-default' style='border:none' id='project_option_list'>";
			_html += "		<div class='option-group'>";
			_html += "			<ul class='layer-option-list'>";
			for (var i = 0; i < gBody.cur_todo_list.length; i++){
				var todo_item = gBody.cur_todo_list[i];
				if (todo_item.type == "project"){
					_html += "				<li id='project_" + todo_item._id + "' project_nm='" + todo_item.name + "'><em>" + todo_item.name + "</em></li>";
				}
			}
			_html += "			</ul>";
			_html += "		</div>";

			_html += "	</div>";
			_html += "</div>";
			
			gTodoC.show_qtip(e, _html, 0);
		});		*/
	},
	
	"__todo_star_list_event" : function(){
		$("#todo_star_list li").off();
		$("#todo_star_list li").on("click", function(){
			gTodo.compose_layer( $(this).attr("id").replace("star_", "") );
		});
	},
	
	
	"__todo_status_list_event" : function(){
		$("#todo_status_list li").off();
		$("#todo_status_list li").on("click", function(){
			gTodo.compose_layer( $(this).attr("id").replace("star_", "") );
		});
	},

	"__todo_archive_event" : function(){
		//$('select').material_select();
		
		$("#archive_layer_close").off();
		$("#archive_layer_close").on("click", function(e){
			$("#center_content").css("width","calc(100% - 10px)");
		//	$("#user_profile").hide();
			$("#btn_todo_invite").click();
		});
		
		$("#todo_project_select").off();
		$("#todo_project_select").on("change", function(e){
			gTodoC.draw_todo_archive(1);
		});
		
		// 아카이브 검색 버튼 클릭
		$("#btn_archive_search").on("click", function(){
			$("#btn_archive_search").hide();
			$("#btn_archive_search_close").show();
			$("#archive_search_input").show();
/*			mail_select_mode = "2";
			is_more_action = "0";*/
		});	
		
		// 메일 검색 닫기 버튼 클릭
		$("#btn_archive_search_close").on("click", function(){
			$("#btn_archive_search").show();
			$("#btn_archive_search_close").hide();
			$("#archive_search_input").hide();
			$("#archive_search_query_field").val("");
			gTodoC.draw_todo_archive(1);			
		});	
		
		// 검색 시 엔터키 처리
		$("#archive_search_query_field").keypress(function(e) { 
			if (e.keyCode == 13){                
				$("#archive_search_btn").click();
			}    
		});

		// 아카이브 검색 수행
		$("#archive_search_btn").on("click", function(){
			var search_val = $("#archive_search_query_field").val();
			if (search_val == 0){
				$("#archive_search_query_field").focus();
				return false;
			}
			gTodoC.draw_todo_archive(1);
		});	
	},
	
	"__todo_archive_list_event" : function(){
		$("#todo_archive_list li").off();
		$("#todo_archive_list li").on("click", function(){
			gTodo.compose_layer( $(this).attr("id").replace("archive_", "") );
		});
	},
	
	"__todo_mention_event" : function(){
		//$('select').material_select();
		
		$("#mention_layer_close").off();
		$("#mention_layer_close").on("click", function(e){
			$("#center_content").css("width","calc(100% - 10px)");
		//	$("#user_profile").hide();
			$("#btn_todo_invite").click();
		});
		
		$("#todo_project_select").off();
		$("#todo_project_select").on("change", function(e){
			gTodoC.draw_todo_mention(1);
		});
	},
	
	
	"__todo_status_event" : function(){
		
		
		$("#status_layer_close").off();
		$("#status_layer_close").on("click", function(e){
			$("#center_content").css("width","calc(100% - 10px)");
		//	$("#user_profile").hide();
			$("#btn_todo_invite").click();
		});
		
		
	},
	
	
	
	"__todo_mention_list_event" : function(){
		$("#todo_mention_list li").off();
		$("#todo_mention_list li").on("click", function(){
			
			var elem = $(this);
			if (elem.data("read") == "F"){
				var data = JSON.stringify({
					"id" : elem.data("todo")
				});	
				url = gap.channelserver + "/todo_unread.km";
				$.ajax({
					type : "POST",
					dataType : "json",
					url : url,
					data : data,
					success : function (res){
						if (res.result == "OK"){
							elem.removeAttr("style");
							gTodo.compose_layer( elem.attr("id").replace("mention_", "") );
							
							//var cn = $("#mention_unread_count").text();
							if ($("#mention_unread_count").text() > 0){
								$("#mention_unread_count").text($("#mention_unread_count").text() -1);
							}
						
						
						}else{
							gap.gAlert(gap.lang.errormsg);
						}
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
					}
				});
				
			}else{
				gTodo.compose_layer( elem.attr("id").replace("mention_", "") );
			}
			
		});
	},
	
	"__todo_left_event" : function(){
		
		$("#my_job_static").off();
		$("#my_job_static").on("click", function(e){
			gTodo.click_display("my_job_menu");
			gTodo.draw_my_static();
		});
		
		
		$("#my_all_mention").on("click", function(e){
			gTodo.click_display("my_mention_menu");
			gTodo.draw_my_all_mention();
		});

	
		$("#todo_folder_list").off("click", ".folder-item");
		$("#todo_folder_list").on("click", ".folder-item", function(e){
			
			if (e.target.className == "ico btn-more folder-mng"){
				$.contextMenu({
					selector : ".ico.btn-more.folder-mng",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
						gTodoC.context_menu_call(key, options, $(this).parent().parent().attr("id"));
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
		            	},
		            	show : function (options){
		            	}
					},			
					build : function($trigger, options){
						var owner = $($trigger).parent().parent().attr("owner");
						return {
							items: gTodoC.todo_info_menu_content('folder_mng', owner)
						}
					}
				});
				
			}else{
				// 클릭한 메뉴에 add class "on"
				gTodo.click_display($(this).attr("id"));
			}
		});
		
		$("#todo_folder_list").off("click", ".project-item");
		$("#todo_folder_list").on("click", ".project-item",  function(e){
			
			gTodo.ck = "";
			gTodo.cklist = [];
			if (e.target.className == "ico btn-more project-mng"){
				$.contextMenu({
					selector : ".ico.btn-more.project-mng",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
					gTodoC.context_menu_call(key, options, $(this).parent().parent().attr("id"));
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
		            	},
		            	show : function (options){
		            	}
					},			
					build : function($trigger, options){
						var owner = $($trigger).parent().parent().attr("owner");
						var project_code = $($trigger).parent().parent().attr("id");
						return {
							items: gTodoC.todo_info_menu_content('project_mng', owner, project_code)
						}
					}
				});
				
			}else{
				$("#channel_list").empty();		//Box에 있는 코드 초기화
				gBody.cur_todo = "status";
				gTodo.cur_todo_code = $(this).attr("id");
				gTodo.cur_todo_name = $(this).attr("todo-name");
				gTodo.cur_todo_caller = "todo";
				gTodo.todo_call_status_compose();

				// 클릭한 메뉴에 add class "on"
				gTodo.click_display($(this).children("em").attr("id"));
			}
		});
		
		$("#todo_box_list").off("click", ".project-item");
		$("#todo_box_list").on("click", ".project-item",  function(e){
	
			gTodo.ck = "";
			gTodo.cklist = [];
			if (e.target.className == "ico btn-more project-mng"){
				$.contextMenu({
					selector : ".ico.btn-more.project-mng",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
					gTodoC.context_menu_call(key, options, $(this).parent().parent().attr("id"));
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
		            	},
		            	show : function (options){
		            	}
					},			
					build : function($trigger, options){
						var owner = $($trigger).parent().parent().attr("owner");
						var project_code = $($trigger).parent().parent().attr("id");
						return {
							items: gTodoC.todo_info_menu_content('project_mng', owner, project_code)
						}
					}
				});
				
			}else{
				$("#channel_list").empty();		//Box에 있는 코드 초기화
				gBody.cur_todo = "status";
				gTodo.cur_todo_code = $(this).attr("id");
				gTodo.cur_todo_name = $(this).attr("todo-name");
				gTodo.cur_todo_caller = "todo";
				gTodo.todo_call_status_compose();

				// 클릭한 메뉴에 add class "on"
				gTodo.click_display($(this).children("em").attr("id"));
			}
		});		
		
		$("#todo_favorite_list").off("click", ".fav-project-item");
		$("#todo_favorite_list").on("click", ".fav-project-item",  function(e){
			
			gTodo.ck = "";
			gTodo.cklist = [];
			if (e.target.className == "ico btn-more favorite-mng"){
				$.contextMenu({
					selector : ".ico.btn-more.favorite-mng",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
					gTodoC.context_menu_call(key, options, $(this).parent().parent().attr("id"));
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
		            	},
		            	show : function (options){
		            	}
					},			
					build : function($trigger, options){
						var owner = $($trigger).parent().parent().attr("owner");
						return {
							items: gTodoC.todo_info_menu_content('fav_project_mng', owner)
						}
					}
				});
				
			}else{
				$("#channel_list").empty();		//Box에 있는 코드 초기화
				gBody.cur_todo = "status";
				gTodo.cur_todo_code = $(this).attr("id").replace("favorite_", "");
				gTodo.cur_todo_name = $(this).attr("todo-name");
				gTodo.cur_todo_caller = "todo";
				gTodo.todo_call_status_compose();

				// 클릭한 메뉴에 add class "on"
				gTodo.click_display($(this).children("em").attr("id"));
			}
		});			

		
	}
	
}

