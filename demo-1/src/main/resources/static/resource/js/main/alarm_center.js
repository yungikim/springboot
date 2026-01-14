function gAlarmCenter() {
	this.is_init = false;
	this.rp = "https://one.kmslab.com";
	this.sys_list = "";
	
	/**** 환경설정 설정값 바뀔때마다 업데이트 될 데이터 ****/
	/// 알림센터 메인 미확인 건 수 종모양 아이콘과 환경설정 연동에 사용
	this.env_data = "";
}

gAlarmCenter.prototype = {
	
	/// 알림센터 최초 실행 시 표시될 로딩화면을 그리는 함수
	"draw_loading_screen" : function(){
	
		$("#inner_alarm").empty();
	
		var html = "";
		
		html += "<div id='loading_screen_box'>";
		html += "	<div class='loading_screen_box_wrap'>";
		html += "		<div id='loading_item' class='loading-items'>";
		html += "			<div class='loading'>";
		html += "				<span></span>";
		html += "				<span></span>";
		html += "				<span></span>";
		html += "			</div>";
		html += "		</div>";
		
		//html += "		<div class='loading_txt'>" + gap.lang.loading_msg.replace("$", "<br>") + "</div>";
		html += "		<div class='loading_txt'>알림센터 로딩중..</div>";
		html += "	</div>";
	/*	html += "	<div class='spinner_wrap'>";
		html += "		<span class='spinner'>";
		html += "			<span></span>";
		html += "			<span></span>";
		html += "			<span></span>";
		html += "			<span></span>";
		html += "		</span>";
		html += "		<div class='loading_txt'>알림센터를 불러오는 중입니다.<br>잠시만 기다려주세요.</div>";
		html += "	</div>";*/
		html += "</div>";
		
		
		
		$("#alarm_center_layer").append(html);
	},
		
	"init" : function(){
		if (gap.isDev){
			gAct.rp = "https://one.kmslab.com";
		}		
		///////// 알림센터 타이틀 그리는 함수  ///////////
		
		$("#alarm_center_layer").empty();
		
		var resize_handle = "<div class='resize_handle'></div>";
		$("#alarm_center_layer").append(resize_handle);
		
		gAct.resize_alarm_center();
		
		gAct.draw_main_alarm_title();
		//gAct.draw_system_menu_list();
		gAct.draw_alarm_list_section();
		/// 알림 미확인 건 수 리스트 그리는 함수
		gAct.draw_unread_alarm_list();
		
		/******** 미처리 건 수, 미확인 건 수 데이터 응답이 모두 왔을 때 사용 *********/
		// App으로 웹페이지 로드 완료 메시지 전송 /////////////////////////////////////////////////////////////
		if (window.chrome.webview){
			window.chrome.webview.postMessage('{"type":"action", "stype":"load_complete"}');
			window.chrome.webview.addEventListener('message', function(arg){

				var _evdata = arg.data;
				var evt = _evdata.evt;
				var nid = _evdata.id;
				console.log("event >>> ", _evdata);

				if (evt == "noti"){
					// 읽음 처리 후 팝업 실행
					var data = [];
					var postData;
					
					if (nid == "kp_channel"){
						var per_key = _evdata.ex.per_key;
						
						if (per_key == ""){
							// 공유 업무방
							data.push(_evdata.rid);
							postData = {
									"ty" : "rid",
									"nid" : nid,
									"ex" : {},
									"data" : data
								};
							
							var url = gAct.rp + "/noti/alarm/confirm";
							$.ajax({
								type : "POST",
								url : url,
								dataType : "json",
								data : postData,
								beforeSend : function(xhr){
									xhr.setRequestHeader("auth", gap.get_auth());
								},
								success : function(res){
									if (res.result == "success"){
										gAct.alarm_content_popup(nid, _evdata.rid, _evdata);
									}
								},
								error : function(e){
								}
							});
							
						}else{
							// 과제관리
							postData = {
									"nid" : nid,
									"unread" : "T",
									"word" : "",
									"skip" : "",
									"limit" : ""
								};
							var url = gAct.rp + "/noti/alarm/list";
							$.ajax({
								type : "POST",
								url : url,
								dataType : "json",
								data : postData,
								beforeSend : function(xhr){
									xhr.setRequestHeader("auth", gap.get_auth());
								},
								success : function(res){
									if (res.result == "success"){
										var per_key_list = $.grep(res.content, function(item) {
										    return item.ex.per_key === per_key;
										});
										$.each(per_key_list, function(idx, item){
											data.push(item.id);
										});
										
										postData = {
												"ty" : "data",
												"nid" : nid,
												"ex" : per_key_list[0].ex,
												"data" : data
											};
										
										var url = gAct.rp + "/noti/alarm/confirm";
										$.ajax({
											type : "POST",
											url : url,
											dataType : "json",
											data : postData,
											beforeSend : function(xhr){
												xhr.setRequestHeader("auth", gap.get_auth());
											},
											success : function(res){
												if (res.result == "success"){
													gAct.alarm_content_popup(nid, _evdata.rid, _evdata);
												}
											},
											error : function(e){
											}
										});											
									}
								},
								error : function(e){
								}
							});									
						}
					
					}else{
						if (nid == "kp_chat"){
							data.push(_evdata.rid);
							postData = {
									"ty" : "rid",
									"nid" : nid,
									"ex" : {},
									"data" : data
								};							
						}else{
							data.push(_evdata.data.tid);
							postData = {
									"ty" : "data",
									"nid" : nid,
									"ex" : {},
									"data" : data
								};
						}

						var url = gAct.rp + "/noti/alarm/confirm";
						$.ajax({
							type : "POST",
							url : url,
							dataType : "json",
							data : postData,
							beforeSend : function(xhr){
								xhr.setRequestHeader("auth", gap.get_auth());
							},
							success : function(res){
								if (res.result == "success"){
									gAct.alarm_content_popup(nid, _evdata.rid, _evdata);
								}
							},
							error : function(e){
							}
						});								
					}
					
				}else if (evt == "confirm"){
					gAct.confirm_app_event_data(_evdata);	// 이미 그려진 알림 삭제/갱신
					
				}else if (evt == "count"){
					// 미처리 카운트만 처리
					gAct.direct_sys_unread_count(nid);

				}else if (evt == "savecount"){
					// 미처리 / 미확인 둘 다 처리 (메일에서 알림차단한 메일인 경우 - 알림이 켜져 있어도 noti창 표시 안하고 데이터만 업데이트)
					// 채팅 / 업무방 도 적용됨 (방별로 끌 수 있는 시스템 - 2025.02.27)
					gAct.direct_sys_unread_count(nid);
					gAct.draw_app_event_data(_evdata);	// 이벤트용 데이터 처리
					
				}else if (evt == "new"){						
					// 미처리 / 미확인 둘 다 처리
					gAct.direct_sys_unread_count(nid);
					gAct.draw_app_event_data(_evdata);	// 이벤트용 데이터 처리
					
				}else if (evt == "alarm_off"){
					// 알림 끄기

					var postData;
					var url = "";
					
					if (nid == "kp_channel" || nid == "kp_chat" || nid == "kp_mail"){
						// 특정 시스템은 알림 끄기를 별도로 처리한다 (업무방별 / 대화방별 / 발신자별)
						if (nid == "kp_channel"){
							postData = JSON.stringify({
									"email" : gap.userinfo.rinfo.ky,
									"key" : _evdata.rid,
									"opt4" : "2"
								});
							url = gap.channelserver + "/channel_options.km";
							
						}else if (nid == "kp_chat"){
							postData = {
									"cid" : _evdata.rid,
									"pu" : "off"
								};
							url = gAct.rp + "/noti/alarm/chat/opt-set";
							
						}else if (nid == "kp_mail"){
							postData = {
									"__Click" : "0",
									"Action" : "savealarmblock",
									"OrgUnid" : "email-spl-" + _evdata.ex.em + "-spl-same"
								};
							url = gAct.rp + "/" + maildbpath + "/process_action?OpenForm";								
						}
						$.ajax({
							type : "POST",
							url : url,
							dataType : "json",
							data : postData,
							beforeSend : function(xhr){
								xhr.setRequestHeader("auth", gap.get_auth());
							},
							success : function(res){
							},
							error : function(e){
							}
						});	
						
					}else{
						postData = {
								"nid" : nid,
								"opt" : "off"
							};
						
						url = gAct.rp + "/noti/config/user/alarm-set";
						$.ajax({
							type : "POST",
							url : url,
							dataType : "json",
							data : postData,
							beforeSend : function(xhr){
								xhr.setRequestHeader("auth", gap.get_auth());
							},
							success : function(res){
								if (res.result == "success"){
									//var bell_el = $("#alarm_li_" + nid).find(".btn_alarm_toggle");
									//var fix_bell_el = $("#fix_" + nid + "_alarm_title").find(".btn_alarm_toggle");
									
									bell_el.addClass("off");
									fix_bell_el.addClass("off");
								}
							},
							error : function(e){
							}
						});								
					}

				}else if (evt == "refresh_all"){
					
					$("#system_alarm_box").remove();
					$("#alarm_category_box_wrap").remove();
					$("#alarm_ul").remove();
					
					// 새로그림
					gAct.draw_system_menu_list();
				}
			});
		}
		//////////////////////////////////////////////////////////////////////////////////////
	},
	
	// 모바일에서 사용
	"mobile_init" : function(_evdata){
		var evt = _evdata.evt;
	//	gap.gAlert( evt );		
		if (evt == "savecount"){
			gAct.draw_app_event_data(_evdata);	// 이벤트용 데이터 처리
			
		}else if (evt == "new"){
			gAct.draw_app_event_data(_evdata);	// 이벤트용 데이터 처리
			
		}else if (evt == "confirm"){
			gAct.confirm_app_event_data(_evdata);	// 이미 그려진 알림 삭제/갱신			
		}
	},
	
	// 클라이언트에서 수신된 이벤트로 새로 그림
	"draw_app_event_data" : function(_evdata){
		// 알림 없음 문구 영역이 있는 경우
		if ($("#empty_unread").length > 0){
			$("#empty_unread").remove();	
		}
			
		if ($("#tab_unread_list").hasClass("select")){
			// 알림미확인 건수가 열린 경우
			var $fix_el = $("#fix_" + _evdata.id + "_alarm_title");
			var fix_el_disp = $fix_el.css("display");							
			
			if (fix_el_disp == "none" || fix_el_disp == undefined){
				// 접혀 있는 경우
				var item = gAct.convert_group_evt_data(_evdata);
				
				if ( $("#alarm_li_" + item.nid).length == 0 ){
					item.unread = 1;
				}else{
					var unread_count = $("#group_" + item.nid + "_unread_count").html();
					item.unread = parseInt(unread_count) + 1;
				}
				gAct.draw_unread_alarm_group_one(item, false);
				
				// 이벤트 처리
				gAct.event_unread_alarm_group();
				
			}else{
				// 펼져져 있는 경우
				// 개별 알림 처리
				var item = gAct.convert_evt_data(_evdata);
				gAct.draw_unread_alarm_list_one(item, $("#alarm_li_" + item.nid), item.nid, 0, false);
				
				// 개별 알림 - 이벤트 처리
				$("#alarm_card_" + item.id).on("click", function(){
					var el = $(this);
					gAct.alarm_card_click_event(el);
				});
				
				$("#alarm_card_" + item.id).find(".btn_delete_alarm_card").on("click", function(e){
					e.stopPropagation();
					
					var el = $(this);
					gAct.alarm_card_delete_event(el);
				});
				
				$("#alarm_card_" + item.id).find(".emp_name").on("click", function(e){
					e.stopPropagation();
					
					var el = $(this);
					gAct.show_user_profile(el);
				});
				
				// 그룹 알림 처리
				var gr_item = gAct.convert_group_evt_data(_evdata);
				var unread_count = $("#group_" + gr_item.nid + "_unread_count").html();
				gr_item.unread = parseInt(unread_count) + 1;
				gAct.draw_unread_alarm_group_one(gr_item, false);
				
				// 그룹 알림 - 이벤트 처리
				gAct.event_unread_alarm_group();								
			}
			
		}else{
			var nid = _evdata.id;
			var layer_nid = $("#alarm_detail_list_layer").data("nid");
			var detail_list_layer_disp = $("#alarm_detail_list_layer").css("display");		
			
			if (detail_list_layer_disp == "none" || detail_list_layer_disp == undefined){
				// 알림 이력 보기가 열린 경우
				gAct.draw_all_alarm_list();	
				
			}else{
				// 알림 이력 - 상세 보기 레이어가 열린 경우
				if (nid == layer_nid){
					// 이벤트로 들어온 nid와 열려 있는 레이어의 nid가 같은 경우
					$("#detail_all_alarm").empty();
					gAct.draw_mail_alarm_list("all", nid, "");
				}
			}
		}		
	},
	
	// 알림 콘텐츠 팝업 이후 그려진 미확인 알림을 삭제
	"confirm_app_event_data" : function(_evdata){
		var confirm_ty = _evdata.data.ty;
		var nid = _evdata.id;
	//	console.log("confirm_ty >>>", confirm_ty);
		
		if(confirm_ty == "all"){
			// 전체 시스템 읽음 처리
			if ($("#unread_alarm_list").find(".alarm_li_wrap").length == 0){
				return;
			}
		}
		
		if ($("#tab_unread_list").hasClass("select")){
			// 알림미확인 건수가 열린 경우
			var $fix_el = $("#fix_" + nid + "_alarm_title");
			var fix_el_disp = $fix_el.css("display");
			
			if (fix_el_disp == "none" || fix_el_disp == undefined){
				// 접혀 있는 경우
				var url = gAct.rp + "/noti/alarm/group-sum";
				$.ajax({
					type : "GET",
					url : url,
					xhrFields : {
						withCredentials : true
					},
					dataType : "json",
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
					},
					success : function(res){
						var alarm_json = res.content;
												
						/// 미확인 건 수가 없을 때
						if( alarm_json.length === 0 ){
							//// 20250205 박대민 추가, 알림없음 문구가 깜빡이는 문제 
							if($("#empty_unread").length !== 0){
								return;
							}
							
							$("#unread_alarm_list").empty();
							
							var list_empty = "";
							list_empty += "<div id='empty_unread' style='opacity: 1;'>";
							list_empty += "	<div class='empty_ico'></div>";
							list_empty += "	<span>" + gap.lang.not_found_alarm + "</span>";
							list_empty += "</div>";
							
							list_empty = $(list_empty);
							
							$("#unread_alarm_list").append(list_empty);
						} else {
							var item = alarm_json.filter(function(data) {
								return data.nid == nid;
							});
							
							if (item[0] != undefined){
								gAct.draw_unread_alarm_group_one(item[0], true);	// group-sum 에 데이터가 있으면 last 값으로 그려줌
							}else{
								$fix_el.closest(".alarm_li_wrap").remove();		// group-sum 에 데이터가 없으면 삭제
							}
						}
					},
					error : function(e){
					}
				});					
				
			}else{
				// 펼져져 있는 경우
				if (_evdata.data.ty == "nid"){
					var sys_el = $("#alarm_li_" + _evdata.data.nid);
					sys_el.closest(".alarm_li_wrap").remove();
					
					/// 알림을 제거하고 알림이 0개일 때 미확인 알림이 없다는 문구 표시
					if($("#unread_alarm_list").find(".alarm_li_wrap").length === 0){
						
						var list_empty = "";
						list_empty += "<div id='empty_unread' style='opacity: 1;'>";
						list_empty += "	<div class='empty_ico'></div>";
						list_empty += "	<span>" + gap.lang.not_found_alarm + "</span>";
						list_empty += "</div>";
						
						list_empty = $(list_empty);
						
						$("#unread_alarm_list").append(list_empty);
						
					}
					return;
					
				}else if (_evdata.data.ty == "rid"){
					var card_parent = $("#alarm_li_" + nid).siblings(".list_container");
					var cards = $("#alarm_li_" + nid).siblings(".list_container").find(".alarm_card");
					var rid = _evdata.data.data[0];

				}else{
					var el = $("#alarm_card_" + _evdata.data.data[0]);
					if (el.length == 0){
						// 이미 삭제된 경우 처리하지 않음
						return;
					}					
					var card_parent = el.closest(".list_container");
					var cards = el.closest(".list_container").find(".alarm_card");
					var info = el.data("info");
					var rid = info.rid;
					var id = info.id					
				}
				var data = [];

				if (nid == "kp_chat"){
					// 채팅방은 rid 갯수만큼 지운다
					if (_evdata.data.ty == "rid"){
						var rid_list = cards.filter(function(){
							var _info = $(this).data("info");
							return _info.rid === rid;
						});
						rid_list.each(function(idx, ele){
							var _info = $(this).data("info");
							data.push(_info.id);
						});						
					}else{
						data.push(id);
					}
					
				}else if (nid == "kp_channel"){
				/*	// 업무방은 per_key까지 체크
					var per_key = (typeof(_evdata.ex) != "undefined" ? (typeof(_evdata.ex.per_key) != "undefined" ? _evdata.ex.per_key : "") : "");
					
					if (per_key == ""){
						// 공유 업무방
						var rid_list = cards.filter(function(){
							var _info = $(this).data("info");
							return _info.rid === rid;
						});
						rid_list.each(function(idx, ele){
							var _info = $(this).data("info");
							data.push(_info.id);
						});
						
					}else{
						// 과제관리
						var per_key_list = cards.filter(function(){
							var _info = $(this).data("info");
							return _info.ex.per_key === per_key;
						});
						per_key_list.each(function(idx, ele){
							var _info = $(this).data("info");
							data.push(_info.id);
						});
					}*/
					data = _evdata.data.data;
					
				}else{
					// 그 외
					data.push(id);
				}
				
				if (data.length == 0){
					// data가 없으면 중지
					return;
				}				
				
				var group_title_el = $("#alarm_li_" + nid);
				var unread_cnt = $("#fix_" + nid + "_unread_count").html();
				unread_cnt = parseInt(unread_cnt) - data.length;
				if (unread_cnt < 0){
					unread_cnt = 0;
				}
				$("#fix_" + nid + "_unread_count").html(unread_cnt);
				$("#group_" + nid + "_unread_count").html(unread_cnt);
				
				if (unread_cnt == 2){
					group_title_el.removeClass("triple").addClass("double");
				}else if (unread_cnt == 1){
					group_title_el.removeClass("triple");
					group_title_el.removeClass("double").addClass("one");
				}
				if (unread_cnt == 0){
					el.closest(".alarm_li_wrap").remove();
				}else{
					$(data).each(function(idx, val){
						var _el = $("#alarm_card_" + val);
						_el.remove();
					});	

					cards = card_parent.find(".alarm_card");
					var first_el = cards.eq(0);
					
					group_title_el.data("info", first_el.data("info"));
					group_title_el.data("nid", first_el.data("nid"));
					group_title_el.find(".sender_name").html( first_el.find(".emp_name").html() );
					group_title_el.find(".send_time").html( first_el.find(".alarm_time").html() );
					group_title_el.find(".alarm_desc_txt").html( first_el.find(".unread_alarm_desc").html() );					
				}
			}
			
		}else{
			var layer_nid = $("#alarm_detail_list_layer").data("nid");
			var detail_list_layer_disp = $("#alarm_detail_list_layer").css("display");		
			
			if (detail_list_layer_disp == "none" || detail_list_layer_disp == undefined){
				// 알림 이력 보기가 열린 경우
				gAct.draw_all_alarm_list();	
				
			}else{
				// 알림 이력 - 상세 보기 레이어가 열린 경우
				if (nid == layer_nid){
					// 이벤트로 들어온 nid와 열려 있는 레이어의 nid가 같은 경우
					$("#detail_all_alarm").empty();
					gAct.draw_mail_alarm_list("all", nid, "");
				}
			}
		}		
	},
	
	// 클라이언트에서 수신되는 데이터 컨버트
	"convert_evt_data" : function(data){
		var _convert = {
				"evt" : data.evt,
				"nid" : data.id,
				"dt" : data.data.tdt,
				"ex" : (typeof(data.ex) != "undefined" ? data.ex : {}),
				"id" : data.data.tid,
				"lnk" : data.data.lnk,
				"msg" : data.data.msg,
				"read" : "N",
				"rid" : data.rid,
				"send" : {
					"ky" : data.data.ky,
					"nm" : data.data.nm,
					"enm" : data.data.enm
				}
		}
		return _convert;
	},
	
	"convert_group_evt_data" : function(data){
		var _convert = {
				"evt" : data.evt,
				"nid" : data.id,
				"nm" : data.nm,
				"enm" : data.enm,
				"unread" : 99999,
				"last" : {
					"dt" : data.data.tdt,
					"ex" : (typeof(data.ex) != "undefined" ? data.ex : {}),
					"id" : data.data.tid,
					"lnk" : data.data.lnk,
					"msg" : data.data.msg,
					"rid" : data.rid,
					"send" : {
						"ky" : data.data.ky,
						"nm" : data.data.nm,
						"enm" : data.data.enm
					}
				}
		}
		return _convert;
	},	
	
	///////// 알림센터 타이틀 그리는 함수  ///////////
	"draw_main_alarm_title" : function(){
		
		var html = "";
		
		html += "<div id='alarm_title_box' class='alarm_title_box'>";
		html +=	"	<div class='title_wrap'>";
		html +=	"		<h2 class='title_txt'>" + gap.lang.alarm_center + "</h2>";
		html +=	"	</div>";
		html += "	<div class='btn_wrap'>";
/*		html +=	"		<button type='button' id='btn_alarm_preferences' class='btn_preferences'></button>";
		html +=	"		<button type='button' id='btn_alarm_minimize' class='btn_alarm_minimize'><span class='btn_ico'></span></button>";*/
		html +=	"		<button type='button' id='btn_alarm_close' class='btn_alarm_close'></button>";
		html +=	"	</div>";
		html += "</div>";
		
		$("#alarm_center_layer").append(html);
		
		// 환경설정 버튼
		$("#btn_alarm_preferences").off().on("click", function(){
			gAenv.draw_popup_preferences();
		});
		
		// 최소화 버튼
		$("#btn_alarm_minimize").off().on("click", function(){
			if (window.chrome.webview){
				window.chrome.webview.postMessage('{"type":"action", "stype":"minimize"}');				
			}
		});
		
		// 닫기 버튼
		$("#btn_alarm_close").off().on("click", function(){
			/*if($("#alarm_setting_box_wrap").length !== 0){
				$("#btn_close_preferences").click();
			}*/
			$("#btn_notification").removeClass("active");
			
			$("#alarm_center_layer").fadeOut(function(){
				$("#alarm_center_layer").empty();
			});
		});

	},
	
	/// 미처리 건 수에 시스템 메뉴가 표시되기 전까지 표시될 로딩 화면
	"draw_system_menu_loading": function(){
		
		var html = "";
		
		html += "<div id='loading_screen_box'>";
		html += "	<div class='loading_screen_box_wrap'>";
		html += "		<div id='loading_item' class='loading-items'>";
		html += "			<div class='loading'>";
		html += "				<span></span>";
		html += "				<span></span>";
		html += "				<span></span>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";
		
		$("#system_menu_list").append(html);
		
	},
	
	//// 시스템 메뉴 그리는 함수 /////////////
	"draw_system_menu_list": function(type){
		var html = "";
		var url = gAct.rp + "/noti/config/user";
		
		$.ajax({
			type : "GET",
			url : url,
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
			},
			success : async function(res){
				var data = res.ct.sys;

				if(gAct.env_data == ""){
					gAct.env_data = res.ct;
		        	 
		        	 // 일정알림 함수 호출
		        	 gAcal.init();
				}
				if (gAct.sys_list == ""){
					gAct.sys_list = await gAenv.load_preferences_list_data();	 
				}
				
				var arr = gAct.sys_list.data.response.filter(function(item) {
					/// 전체 시스템 알림 목록에서 사용자가 활성화한 알림 목록만 뽑아낸다.
					return data.indexOf(item.noti_id) !== -1;
				});
				
				//arr = data.map(id => arr.find(item => item.noti_id === id));
				arr = data
					.map(id => arr.find(item => item.noti_id === id))
					.filter(item => item !== undefined);

					var html = "";
					
					if(type !== "refresh"){
						html += "<div id='system_alarm_box'>";
						html += "	<div class='title_box'>";
						html += "		<div class='title_content_wrap'>";
						html += "			<h4 class='title'>" + gap.lang.unprocessed_count + "</h2>";
						html += "			<button type='button' id='btn_unprocessed_sys_refresh' class='btn_refresh'>";
						html += "				<span class='btn_ico_wrap'>";
						html += "					<span class='btn_ico'></span>";
						html += "				</span>";
						html += "			</button>";
						html += "		</div>";
						html += "		<button type='button' id='btn_edit_unprocessed_order' class='btn_edit_unprocessed_order'>";
						html += "			<span>" + gap.lang.edit_order + "</span>";
						html += "		</button>";
						html += "	</div>";
						html += "	<div id='system_menu_list_wrap'>";
						html += "		<div id='system_menu_list' class='system_menu_ul'>";
						html += "		</div>";
						html += "	</div>";
						html += "</div>";
						
						$("#alarm_center_layer").append(html);
						
						/// 미처리 건 수 새로고침 버튼
						$("#btn_unprocessed_sys_refresh").off().on("click", function(){
							gAct.draw_system_menu_list("refresh");
						});
						
						//순서편집
						$("#btn_edit_unprocessed_order").off().on("click", function(){
							gAenv.draw_edit_unprocessed_order_layer();
						});
						
						//// 스크롤이 있을 때만 
						if( $("#system_menu_list")[0].scrollWidth > $("#system_menu_list")[0].clientWidth) {
						}
						/// 드래그, 휠로 좌우 스크롤
						gAct.x_scroll_move($("#system_menu_list"));
						/// 알림 카테고리 영역 그리는 함수 //
						gAct.draw_alarm_list_section();
						/// 알림 미확인 건 수 리스트 그리는 함수
						gAct.draw_unread_alarm_list();	        		 
					}
					
					if(arr.length === 0){
						///// 사용자가 활성화한 시스템 알림이 없을 때
						var sys_html = "";
						sys_html += "			<div class='empty_unprocessed_box'>";
						sys_html += "				<span class='unprocessed_ico'></span>";
						sys_html += "				<span class='unprocessed_txt'>" + gap.lang.not_found_unprocessed + "</span>";
						sys_html += "			</div>";
						
						$("#system_menu_list").html(sys_html);
						
					} else {
						$("#system_menu_list").empty();
						
						//gAct.draw_system_menu_loading();
						for(var i = 0; i < arr.length; i++){
							var item = arr[i];
							if (item){
								var code = item.noti_id;
								var sys_nm = "";
								
								/// 언어가 한국어 일 때
								if(gap.curLang === "ko"){
									sys_nm = item.nm;
									// 시스템명 예외처리
									if (code == "approval"){
										sys_nm = "전자결재";
									}
								} else {
									sys_nm = item.enm;
									// 시스템명 예외처리
									if (code == "approval"){
										sys_nm = "Approval";
									}
								}
								//var alarm_count = arr[i].alarm;
								var alarm_count = i;
								var icon_src = gap.channelserver + "/alarmcenter_icon.do?code=" + item.noti_id + '&ver=' + jsversion;
								var sys_html = "";
								
								sys_html += "		<div class='menu_li' id='unprocessed_sys_" + code + "' style='display:none;'>";
								sys_html += "			<div class='menu_img_wrap'>";
								sys_html += "				<div class='menu_img' style='background-image: url(" + icon_src + ")'></div>";
								sys_html += "				<span class='count_wrap'>";
								sys_html += "					<span id='unprocessed_count_" + code + "' class='menu_alarm_count'>" + alarm_count + "</span>";
								sys_html += "					<span>" + gap.lang.alarm_item + "</span>";
								sys_html += "				</span>";
								sys_html += "			</div>";
								sys_html += "			<div class='border_line'></div>";
								sys_html += "			<div class='menu_desc'>" + sys_nm + "</div>";
								sys_html += "		</div>";
								
								$("#system_menu_list").append(sys_html);
								//$("#system_alarm_box .menu_li").eq(i).fadeIn(100);
								
								$("#unprocessed_sys_" + code).data("info", item);								
							}
						}
						
						$("#system_menu_list .menu_li").off().on("click", function(){
							
							/*** 드래그 중일 때 해당 시스템위에서 마우스를 떼면 클릭이 되지 않도록 ***/
							if($("#system_menu_list").hasClass("dragging")){
								/// "dragging" class가 있으면 시스템 클릭이 안됨
								$("#system_menu_list").removeClass("dragging");
								return false;
							}
							
							var info = $(this).data("info");
							var url = info.link;
							
							if (info.noti_id == "kp_mail"){
								url = location.protocol + "//" + location.host + "/" + mailfile + "/FrameMail?openform";
								if (window.chrome.webview){
									window.chrome.webview.postMessage('{"type":"openurl", "stype":"' + url + '"}');									
			
								}else{
									gap.openOnce(url, info.noti_id);
								}
								
							}else{
								if (url != "" && url != "-none-"){
									if (url.indexOf("mf_prefix") > -1){
										url = url.replace("mf_prefix", mailfile_prefix);
									}
									if (window.chrome.webview){
										window.chrome.webview.postMessage('{"type":"openurl", "stype":"' + url + '"}');

									}else{
										gap.openOnce(url, info.noti_id);
									}									
								}
							}
						});
					}
					
					// 미처리 시스템 - 안읽은 갯수 처리
					gAct.search_unread_count(arr);

			},
			error : function(e){
			}
		});
	},
	
	"search_unread_count" : function(item_list){
		//시스템의 읽지 않은 건수를 가져와야 한다.
		for (var i = 0 ; i < item_list.length; i++){
			var item = item_list[i];
			gAct.search_sys_unread_count(item);
		}		
	},
	
	"direct_sys_unread_count" : function(code){
		var data = gAct.sys_list.data.response.filter(function(item) {
			return item.noti_id == code;
		});
		if (data[0]){
			gAct.search_sys_unread_count(data[0]);
		}
	},
	
	"search_sys_unread_count" : function(item){
		//시스템의 읽지 않은 건수를 가져와야 한다.
		//받은편지함 (unreadmail) / 전자결재 (appno) / 경비결재 (costappno) / 이슈관리 (issue) / 두드림콜 (dudurim) / PLM(plmcount)
		//VOC통합관리 (voccount) / MDM결재 (mdmcount1) / 시장조사 (marketingresearch) / 상상제작소 (coDoctor) / 영양정보 (foodeffect)
		//웹하드관리결재 (webhardappno) / PC관리결재 (pcappno) / DRM 결재 (drmcount) / 범무미결 사항 (lawcount)
		//SAP쪽 연동 사항
		//법인카드미처리(cardcount) / 세금계산서및리 (taxcount) / HR결제 (hrapprocount) / DECO (decocount) / 전자계약 (ec_count)
		
		var code = item.noti_id;
		var ckurl = item.cntlink;
		var ckurl_org = ckurl;
		var linkurl = item.link;			
		var menu_name = item.nm;	
		if (code == "kp_mail"){
			ckurl = gAct.rp + "/"+maildbpath+"/XML_Inbox_unread?ReadViewEntries&outputformat=json&start=1&count=1&charset=utf-8&"+new Date().getTime();
		}
		if (ckurl != ""){
			if (ckurl.indexOf("dbconnector.nsf") >-1){
				gAct.count_check_sap(code);
			}else if (ckurl.indexOf(".km") >-1 || ckurl.indexOf(".ch") >-1){
				gAct.count_check_box(code, ckurl);
			}else{
				//var ckurl = ckurl.toLowerCase();
				if (ckurl.indexOf("readviewentries") > -1){
					ckurl = ckurl.replace("readviewentries","readviewentries&outputformat=json");
				}		
				if (ckurl.indexOf("loginid") > -1){
					ckurl = ckurl.replace("loginid", gap.userinfo.rinfo.id);
				}
				if (ckurl.indexOf("ou1") > -1){
					ckurl = ckurl.replace("ou1", gap.userinfo.rinfo.ky);
				}
				if (ckurl.indexOf("ou6") > -1){
					ckurl = ckurl.replace("ou6", gap.userinfo.rinfo.emp);
				}
				if (ckurl.indexOf("comcode") > -1){
					ckurl = ckurl.replace("comcode", gap.userinfo.rinfo.cpc);
				}
				if (ckurl != "-none-"){
					ckurl = gAct.change_rp_server(ckurl);						
					gAct.count_check_new(code, ckurl, linkurl);						
				}else{
					// ckurl 값이 "-none-" 이지만 별도로 처리하는 경우
					if (code == "meetingroom"){
						// 회의예약
						gAct.setTodayMeetingCount(code);
						
					}else if (code == "kp_work"){
						// 할일
						gAcal.setTodayWorkCount(code);
					}
				}
			}
		}		
	},
	
	"count_check_new" : function(code, ckurl, linkurl){
		var url = ckurl;
		if (typeof(url) != "undefined"){
			$.ajax({
				type : "GET",
				url : url,
				cache : false,
				contentType : "applicaion/json; charset=utf-8",
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
				},
				success : function(res){						
					var unread_count = 0;
					if (res != null){
						unread_count = res["@toplevelentries"];
						if (typeof(unread_count) == "undefined"){
							unread_count = 0;
						}
					}
			
					if (code == "mdmcount1" || code == "plmcount" || code == "coDoctor" || code == "foodeffect" || code == "dps_count"){
						res = res.trim().replace(/\r\n/gi, "");
						res = res.replace(/\n/gi, "");
						res = res.replace("\<ES_CNT\>", "");
						res = res.replace("\<\/ES_CNT\>", "");
						unread_count = res;
					}else if (code == "drmcount"){
						unread_count = res.appCount;
					}else if (code == "voccount"){
						var in1 = res.indexOf("_CNT>");
						var in2 = res.indexOf("</ES_CNT");
						unread_count = res.substring(in1+5, in2);
					} else if (code == "dsdpcount"){ //2024.11.28 DSDP결재 추가
						unread_count = res.count;
					} else if (code == "kp_chat"){
						unread_count = res.unread;
					}
					
				//// 999건 초과일 때 +999로 표시
					if(unread_count > 999){
						unread_count = "999+";
					}
					
					$("#unprocessed_count_" + code).html(unread_count);
					
					if (unread_count > 0){
						gAct.show_unprocessed_sys(code);
					}else{
						$("#unprocessed_sys_" + code).hide();
					}
				},
				error : function(e){
					console.log("-------------------------");
					console.log("[알람센터] 미처리 건 수 URL 호출 에러");
					console.log(code + " / " + ckurl);
				}
			});
		}		
	},
	
	/// 미처리 건 수 999건 넘을 때 999+로 변환해주는 함수
	"transfrom_unprocessed_count": function(cnt){
		
		if(cnt > 999){
			cnt = "999+";
		}
		
		return cnt;
		
	},
	
	// 
	"show_unprocessed_sys" : function(code){
		$("#unprocessed_sys_" + code).show();
	},
	
	"count_check_box" : function(code, ckurl){
		if (code == "kp_channel" || code == "kp_collect"){
			$.ajax({
				type : "POST",
				url : ckurl,
				cache : false,
				dataType : "json",
				data : {},
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
				},
				success : function(res){
					if (res.unread_count){
						var count = parseInt(res.unread_count);
						
					//// 999건 초과일 때 +999로 표시
						if(count > 999){
							count = "+999";
						}
						
						$("#unprocessed_count_" + code).html(count);
						if (count > 0){
							gAct.show_unprocessed_sys(code);
						}else{
							$("#unprocessed_sys_" + code).hide();
						}
					}
				},
				error : function(e){
					console.log("-------------------------");
					console.log("[알람센터] 미처리 건 수 URL 호출 에러");
					console.log(code + " / " + ckurl);
				}
			});	
		}else if (code == "changhyewon"){
			$.ajax({
				type : "POST",
				url : ckurl,
				cache : false,
				dataType : "json",
				data : JSON.stringify({ky: gap.userinfo.rinfo.ky}),
				success : function(res){
					if (res.data){
						var count = parseInt(res.data.approve);
						
					//// 999건 초과일 때 +999로 표시
						if(count > 999){
							count = "+999";
						}
						
						$("#unprocessed_count_" + code).html(count);
						if (count > 0){
							gAct.show_unprocessed_sys(code);
						}else{
							$("#unprocessed_sys_" + code).hide();
						}
					}
				},
				error : function(e){
					console.log("-------------------------");
					console.log("[알람센터] 미처리 건 수 URL 호출 에러");
					console.log(code + " / " + ckurl);
				}
			});				
		}
	},
	
	"count_check_sap" : function(code){
		var url = gap.channelserver + "/sapcount_check.km";
		var info = gap.userinfo.rinfo;
		var cp = info.cpc;
		if (cp == "10"){
			cp = "1000";
		}else if (cp == "L0"){
			cp = "5000";
		}
		var empno = info.emp;
		var email = info.em;

		if (code == "hrapprocount"){
			empno = info.ky;
		}
		var decoid = "";
		if (code == "decocount"){
			decoid = DecoID;
			if (decoid == ""){
				$("#unprocessed_count_" + code).html("0");
			//	gAct.nocount_style(code);
				return false;
			}
		}
		
		var data = JSON.stringify({
			"code" : code,
			"companycode" : cp,
			"empno" : empno,
			"email" : email,
			"decoid" : decoid
		})
		$.ajax({
			type : "POST",
			url : url,
			cache : false,
			data : data,
			dataType : "json",
			contentType : "applicaion/json; charset=utf-8",
			success : function(res){			
				if (res.result == "OK"){
					
					var count = parseInt(res.data.count);
					
				//// 999건 초과일 때 +999로 표시
					if(count > 999){
						count = "+999";
					}
					
					$("#unprocessed_count_" + code).html(count);
					if (count > 0){
						gAct.show_unprocessed_sys(code);
					}else{
						$("#unprocessed_sys_" + code).hide();
					}
				}				
			}
		});
	},	
	
	"change_rp_server" : function(ckurl){
		if (gap.isDev){
			ckurl = ckurl.replace("http://dapp2.daesang.com", gAct.rp);
			ckurl = ckurl.replace("http://dapp1.daesang.com", gAct.rp);
			ckurl = ckurl.replace("http://dst.daesang.com", gAct.rp);
			ckurl = ckurl.replace("http://mdmdev.daesang.com:7777", gAct.rp);
			ckurl = ckurl.replace("http://mdm0.daesang.com:8686", gAct.rp);
			ckurl = ckurl.replace("http://192.168.14.152:8801", gAct.rp);
			ckurl = ckurl.replace("http://devplm.daesang.com", gAct.rp);
			ckurl = ckurl.replace("http://192.168.14.121:8503", gAct.rp);
			ckurl = ckurl.replace("http://192.168.9.19:8080", gAct.rp);
			ckurl = ckurl.replace("http://192.168.15.250:8080", gAct.rp + "/count01");
			ckurl = ckurl.replace("http://192.168.14.153:8080", gAct.rp + "/count02");
		}else{
			ckurl = ckurl.replace("http://dspsec.daesang.com", gAct.rp);
			ckurl = ckurl.replace("http://dsp.daesang.com", gAct.rp);
			ckurl = ckurl.replace("http://dst.daesang.com", gAct.rp);
			ckurl = ckurl.replace("http://plm.daesang.com", gAct.rp);
			ckurl = ckurl.replace("http://vocweb.daesang.com", gAct.rp);
			ckurl = ckurl.replace("http://dsmdm.daesang.com", gAct.rp);
			ckurl = ckurl.replace("http://mdm0.daesang.com:8686", gAct.rp);
			ckurl = ckurl.replace("http://sangsang.daesang.com:9000", gAct.rp);
			ckurl = ckurl.replace("http://dsdrm.daesang.com:8080", gAct.rp + "/count02");
			ckurl = ckurl.replace("http://dsin.daesang.com", gAct.rp +"/dsin");
			ckurl = ckurl.replace("http://192.168.15.138:8081", gAct.rp + "/count01");
			ckurl = ckurl.replace("http://dps.daesang.com", gAct.rp +"/count03");
		}
		
		//ckurl = ckurl.replace("10051077", gap.userinfo.rinfo.ky);
		return ckurl;
	},
	
	"setTodayMeetingCount" : function(code){
		var _self = this;
		var list_1 = this.getOnlineList(true);
		var list_2 = this.getMeetingList(true);
		
		$.when(list_1, list_2).then(function(res_1, res_2){
			// 2개 데이터를 통합해서 하나로 합쳐줘야 함
			var list = res_1.concat(res_2);
			list.sort(function(a,b){
				if (a.starttime > b.starttime) {
					return 1;
				} else {
					return -1;
				}
			});
			
			// 현재 시간 이전 미팅건은 카운트하지 않음
			var now = moment();			
			var filter_list = list.filter(function(data){
				var meet_et = moment(data.endtime);
				return now.diff(meet_et) < 0;
			}); 

			// 카운트 표시
			var count = filter_list.length;
			
		//// 999건 초과일 때 +999로 표시
			if(count > 999){
				count = "+999";
			}
			
			$("#unprocessed_count_" + code).html(count);
			if (count > 0){
				gAct.show_unprocessed_sys(code);
			}else{
				$("#unprocessed_sys_" + code).hide();
			}
			
		}, function(err_1, err_2){
			console.log('회의 데이터 로드 중 오류 발생');
		});
	},
	
	// 화상회의 목록 가져오기
	"getOnlineList" : function(is_today){
		// 화상회의 요청
		var req_nm = "getMeetingList.do";
		var req = {
			cntperpage: 1000,
			pageno: 1,
			scheduletype: ""
		};
		
		if (is_today) {
			// 오늘
			req.starttime = moment().startOf('day').utc().format();
			req.endtime = moment(req.starttime).add(1, 'day').utc().format();
		} else {
			// 예정
			req.starttime = moment().add(1,'day').startOf('day').utc().format();
			req.endtime = moment(req.starttime).add(1,'year').utc().format();
		}
		
		return this.onlineAPI(req_nm, req).then(function(data){
			// 데이터를 가공해야 함
			if (data.code != '00') {
				console.log('화상회의 API 호출 오류 : ' + req_nm, data);
				return [];
			}
			
			var list = [];
			$.each(data.meetinglist, function(){
				var pt_ky = [];
				
				// 회의실은 대표로 1개만 표시한다
				var ep = '';
				if (this.endpointlist.length > 0) {
					ep = this.endpointlist[0];
				}
				
				$.each(this.partylist, function(){
					pt_ky.push(this.id);
				});				
								
				list.push({
					scheduleid	: this.scheduleid, 
					type		: this.scheduletype == '0' || this.scheduletype == '3' ? '3' : '1',
					realtime	: this.scheduletype == '3' ? true : false,	// 즉석회의 여부
					title		: this.title,
					contents	: this.contents,
					owner_id	: this.schedulerid,
					owner_nm	: this.schedulernm,
					owner_dept	: this.schedulerdept,
					starttime	: this.starttime,
					endtime		: this.endtime,
					repeat		: false,
					endpoint_nm	: ep.endpointnm || '',
					endpoint_key: ep.endpointkey || '',
					floor_nm	: ep.floornm || '',
					place_nm	: ep.placenm || '',
					endpoint_length: this.endpointlist.length,
					partylist	: pt_ky,
					online_url	: this.meetingurl
				});
			});
			return list;
		}, function(){
			return [];
		});
	},
	
	// 회의실 목록 가져오기
	"getMeetingList" : function(is_today){
		var req = {
			firstNo: 1,
			lastNo: 1000,
			resveTy: 'D'
		};
		var req_nm = "my_reserve_list.open";

		/*
		// 회의
		if (is_today) {
			// 오늘
			req.startDate = moment().startOf('day').format('YYYYMMDD');
			req.endDate = req.startDate;
		} else {
			// 예정
			req.startDate = moment().add(1,'day').format('YYYYMMDD');
			req.endDate = moment().add(1,'year').format('YYYYMMDD');
		}
		*/
			
		// GMT 시간으로 요청
		if (is_today) {
			// 오늘
			req.startGmt = moment().startOf('day').utc().format();
			req.endGmt = moment(req.startGmt).add(1, 'day').utc().format();
		} else {
			// 예정
			req.startGmt = moment().add(1,'day').startOf('day').utc().format();
			req.endGmt = moment(req.startGmt).add(1,'year').utc().format();
		}
		
		return this.meetingAPI(req_nm, req).then(function(data){
			// 데이터를 가공해야 함
			if (data.code != '1') {
				console.log('회의실예약 API 호출 오류 : ' + req_nm, data);
				return [];
			}
			
			var list = [];
			$.each(data.result, function(){
				var pt_ky = [];
				
				// 내부 참석자
				if (this.attendeeId) {
					pt_ky = this.attendeeId.split(',');
				}
				
				// 외부 참석자
				if (this.extrlpsn) {
					pt_ky = pt_ky.concat(this.extrlpsn.split(','));
				}			
				
				list.push({
					scheduleid	: this.reserveId, 
					type		: '2',	// 1: 회의+화상, 2:회의, 3:온라인화상
					realtime	: false,
					title		: this.title,
					contents	: this.mtgCn,
					owner_id	: this.writerId,
					owner_nm	: this.writer,
					owner_dept	: this.dept,
					starttime	: this.startGmt,
					endtime		: this.endGmt,
					endpoint_nm	: this.room,
					endpoint_key: this.roomCode,
					floor_nm	: this.sub,
					place_nm	: this.floor,
					repeat		: this.repetitionAt == 'Y' ? true : false,
					endpoint_length : 1,	// 회의실 예약은 무조건 1개
					partylist	: pt_ky
				});
			});
			return list;
		}, function(data){
			console.log('회의실예약 API 호출 오류 : ' + req_nm, data);
			return [];
		});
	},
	
	// 화상회의 API
	"onlineAPI" : function(req_name, req){
		
		/**
		 * 1) 위치정보 : getSubDept.do
		 * deptcd
		 *
		 * 
		 * 2) 가용단말목록 : getEndpointList.do
		 * starttime
		 * endtine
		 * deptcd
		 * 
		 * 
		 * 3) 회의목록 : getMeetingList.do
		 * starttime
		 * endtime
		 * cntperpage
		 * pageno
		 * schedulerid
		 * 
		 * 
		 * 4) 회의예약 : scheduleinterface.do
		 * type 		: C/U/D
		 * scheduletype : 0(온라인회의)/1(화상회의)
		 * title 		: 
		 * starttime 	: 2022-07-12T01:00:00Z (회의 시작일시 GMT)
		 * endtime 		: 2022-07-12T02:00:00Z (회의 종료일시 GMT)
		 * scheduleid 	: C일때는 빈 값, U,D일 때는 scheduleid
		 * schedulerid 	: 10im0966(요청자 사번)
		 * recordingyn 	: Y/N (녹화여부)
		 * timezone 	: +09:00 (요청자의 로컬타임)
		 * partylist 	: [{id:""}] (참석자 정보)
		 * endpointlist : [{endpointkey:""}] (회상장비 key)
		 */
		
		return $.ajax({
			type: 'POST',
			headers: {
	        	'auth': gap.get_auth() 
	    	},
			url: '/vemanager/' + req_name,
			data: JSON.stringify(req),
			contentType: 'application/json',
			dataType: 'json',
			success: function(res){
				
			},
			error: function(err){
				console.log(err);
			}
		});
	},
	
	// 회의실예약 API
	"meetingAPI" : function(req_name, req){
		var url = '/rezmanager/openapi/meeting/' + req_name;
		var token = gap.get_auth();
		
		// 회의예약 PUT, DELETE를 POST로 변경하기로 함 (외부에서 요청들어노는 문제 때문에)
		var method = '';
		if (req_name == 'reserve.open'){
			method = 'POST';
		} else if (req_name == 'update.open'){
			//method = 'PUT';
			method = 'POST';
		} else if (req_name == 'cancel.open'){
			//method = 'DELETE';
			method = 'POST';
		} else {
			method = 'GET';
		}
		
		// 호의실 예약, 업데이트는 Body 데이터로 전송하고 나머지 요청들은 GET파라메터로 연동
		var req_data = {};
		if (req_name == 'reserve.open' || req_name == 'update.open') {
			req_data = JSON.stringify(req);
		} else {
			url += '?' + $.param(req);
		}
		
		var ajax_opt = {
			headers: {
	        	'Authorization': 'Bearer ' + token 
	    	},
			type: method,
			url: url,
			dataType: 'json',
			success: function(res){
				
			},
			error: function(err){
				console.log(err);
			}
		};
		
		if (method == 'POST' || method == 'PUT'){
			ajax_opt.data = req_data;
			ajax_opt.contentType = 'application/json';
		}
		
		return $.ajax(ajax_opt);
	},	
	
	/// 드래그, 휠로 좌우 스크롤
	"x_scroll_move": function($container){
		//// $container : $("#system_menu_list");
		
		var isDown = false;
	    var startX;
	    var scrollLeft;
	    var isDragged = false;
	    var threshold = 5; // 드래그 무시 거리

	    var scrollSpeed = 3.23;
	    var scrolling = false;

	    $container.on('wheel', function (e) {
	        e.preventDefault(); // 기본 세로 스크롤 방지
	        
	        var delta = e.originalEvent.deltaY; // 휠의 세로 방향 움직임
	        
	        $(this).css({
	        	"scroll-behavior" : "smooth"
	        });

	        if (!scrolling) {
	            scrolling = true;
	            requestAnimationFrame(function smoothScroll() {
	                $container.scrollLeft($container.scrollLeft() + delta * scrollSpeed);
	                scrolling = false;
	            });
	        }
	    });
	    
	    $container.on('mousedown', function(e) {
	    	//// 스크롤이 있을 때만 드래그 시작
			if( $("#system_menu_list")[0].scrollWidth <= $("#system_menu_list")[0].clientWidth ) {
				return false;
			}
	    	if(e.button === 2){
	    		/// 우클릭은 드래그 방지
	    		return false;
	    	}
	    	/// 마우스클릭 시 클릭이 가능하도록 누르는시점에 클래스제거
	    	$container.removeClass('dragging');
	    	
	        isDown = true;
	        isDragged = false;
	        //$container.addClass('dragging');
	        startX = e.pageX - $container.offset().left;
	        scrollLeft = $container.scrollLeft();
	    });

	    $container.on('mouseleave', function() {
	        isDown = false;
	        //$container.removeClass('dragging');
	    });

	    $container.on('mouseup', function(e) {
	        isDown = false;
	        ////$container.removeClass("dragging");
	        if (isDragged) {
	            e.preventDefault(); // 드래그 중일 때 클릭 이벤트 방지
	            return false;
	        }
	    });

	    $container.on('mousemove', function(e) {

	    	if (!isDown) return;
	        e.preventDefault();
	        
	        var x = e.pageX - $container.offset().left;
	        var walk = (x - startX) * 5; // 스크롤 속도 조절
	        
	        if (Math.abs(x - startX) > threshold) {
	            isDragged = true;
	            /// 이 때만 드래그로 인식
	            $container.addClass('dragging');
	        }
	        $container.scrollLeft(scrollLeft - walk);
	        $(this).css({
	    		"scroll-behavior" : "auto"
	    	});
	    });
		
		/*let isDragging = false;
	    let startX;
	    let scrollLeft;

	    // mousedown 이벤트로 드래그 시작
	    $container.on("mousedown", function (e) {
	        isDragging = true;
	        startX = e.pageX; // X축 시작 위치
	        scrollLeft = $container.find(".mCSB_container").position().left; // 현재 스크롤 위치
	        $container.addClass("dragging"); // 드래그 중 텍스트 선택 방지
	    });

	    // mousemove 이벤트로 스크롤 제어
	    $(document).on("mousemove", function (e) {
	        if (!isDragging) return;
	        
	        var delta = startX - e.pageX; // 드래그 이동 거리 계산
	        
	        /// 왼쪽으로 스크롤 시 scrollLeft + delta 값이 1보다 커질경우 반대로 스크롤 됨
	        if(scrollLeft + delta < 1){
	        	$container.mCustomScrollbar("scrollTo", scrollLeft + delta, { scrollInertia: 0 });
	        }
	        
	    });

	    // mouseup 이벤트로 드래그 종료
	    $(document).on("mouseup", function () {
	        if (isDragging) {
	            isDragging = false;
	            $container.removeClass("dragging");
	        }
	    });*/
	},
	
	"resize_alarm_center": function(){
		let isResizing = false;
        let startX, startWidth;

        $("#alarm_center_layer").find(".resize_handle").on("mousedown", function(e) {
            e.preventDefault();
            isResizing = true;
            startX = e.clientX;
            startWidth = $("#alarm_center_layer").width();

            $(document).on("mousemove", resize);
            $(document).on("mouseup", stopResize);
        });

        function resize(e) {
            if (isResizing) {
                let newWidth = startWidth - (e.clientX - startX);
                $("#alarm_center_layer").css("width", newWidth + "px");
            }
        }

        function stopResize() {
            isResizing = false;
            $(document).off("mousemove", resize);
            $(document).off("mouseup", stopResize);
        }
	},
	
	////// 알람 목록 영역 그리는 함수 (카테고리 + 목록)///////
	"draw_alarm_list_section": function(){
		
		var html = "";
		
		/////카테고리/////
		html += "<div id='alarm_category_box_wrap'>";
		
		html += "	<div class='category_wrap'>";
		html += "		<div class='category_box'>";
		html += "			<div id='tab_unread_list' class='category select'>" + gap.lang.alarm_unread_count + "</div>";
		html += "			<div class='vertical_bar'></div>";
		html += "			<div id='tab_all_list' class='category'>" + gap.lang.alarm_history_list + "</div>";
		html +=	"		</div>";
		html += "		<div class='btn_wrap'>";
//		html += "			<button type='button' id='app_test' style='width:auto; margin-right: 8px;' class='btn_all_read_alarm'><span>앱 통신 테스트</span></button>";
		html += "			<button type='button' id='btn_all_read_alarm' class='btn_all_read_alarm'><span>" + gap.lang.read_all + "</span></button>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";
		
		/////목록/////
		html += "<div id='alarm_ul' class='alarm_ul'>";
		///// 미처리 건 수가 표시될 때
		if($("#system_menu_list").length !== 0){
			html += "	<div id='alarm_box_wrap' class='alarm_box_wrap unread'>";			
		} else {
		///// 미처리 건 수가 표시될 때
			//html += "	<div id='alarm_box_wrap' class='alarm_box_wrap unread' style='height: calc(100vh - 140px);'>";
			html += "	<div id='alarm_box_wrap' class='alarm_box_wrap unread'>";
		}
		html += "		<div id='unread_alarm_list' class='alarm_box'></div>";
		html += "		<div id='all_alarm_list' class='alarm_box'></div>";
		html += "	</div>";
		html += "</div>";
		
		$("#alarm_center_layer").append(html);
		
		$("#tab_unread_list").off().on("click", function(){
			$(this).addClass("select");
			$(this).siblings(".category").removeClass("select");
			
			$("#alarm_box_wrap").removeClass("all");
			$("#alarm_box_wrap").addClass("unread");
			
			$("#alarm_box_wrap").css("margin-left", "0");
			
			if( $("#alarm_detail_list_layer").length !== 0 ){
				$("#alarm_detail_list_layer").removeClass("show");
				setTimeout(function(){
					$("#alarm_detail_list_layer").remove();
				}, 100);
			}
			
			gAct.draw_unread_alarm_list();
		});
		$("#tab_all_list").off().on("click", function(){
			$(this).addClass("select");
			$(this).siblings(".category").removeClass("select");
			
			$("#alarm_box_wrap").removeClass("unread");
			$("#alarm_box_wrap").addClass("all");
			
			$("#alarm_box_wrap").css("margin-left", "-100%");
			gAct.draw_all_alarm_list();
		});
		
		$("#alarm_box_wrap").find('.alarm_box').on('scroll', function () {
	        var scrollTop = $(this).scrollTop(); // 현재 스크롤 위치
	        var innerHeight = $(this).innerHeight(); // 요소의 높이 (padding 포함)
	        var scrollHeight = $(this)[0].scrollHeight; // 전체 스크롤 가능한 높이

	      //스크롤 최하단일 때 그라디언트 숨김
	        if (scrollTop + innerHeight >= scrollHeight) {
	            $(this).parent().addClass("hide_gradient");
	        } else if (scrollTop + innerHeight < scrollHeight) {
	        	$(this).parent().removeClass("hide_gradient");
	        }
	        
	    });
		
		$("#btn_all_read_alarm").off().on("click", function(){
			gap.showConfirm({
				title: gap.lang.Confirm,
				//iconClass: 'remove',
				contents: gap.lang.confirm_all_read,
				callback: function(){
					var postData = {
							"ty" : "all",
							"nid" : "confirm_all",
							"ex" : {},
							"data" : ""
						};
					var url = gAct.rp + "/noti/alarm/confirm";
					$.ajax({
						type : "POST",
						url : url,
						dataType : "json",
						data : postData,
						beforeSend : function(xhr){
							xhr.setRequestHeader("auth", gap.get_auth());
						},
						success : function(res){
							if (res.result == "success"){
								if($("#alarm_box_wrap").hasClass("unread")){
									/// "알림 미확인 건수"를 보고 있을 때
									$("#unread_alarm_list").find(".alarm_li").addClass("remove");
									
									if($("#empty_unread").length === 0){
										setTimeout(function(){
											//// 알림이 우측으로 사라지는 애니메이션이 끝나면 제거
											$("#unread_alarm_list").empty();
											
											var list_empty = "";
											list_empty += "<div id='empty_unread'>";
											list_empty += "	<div class='empty_ico'></div>";
											list_empty += "	<span>" + gap.lang.not_found_alarm + "</span>";
											list_empty += "</div>";
											
											list_empty = $(list_empty);
											
											setTimeout(function(){
												list_empty.animate({
													"opacity": 1
												}, 200);						
											}, 90);
											$("#unread_alarm_list").append(list_empty);
										}, 300);
										//gAct.show_empty_alarm_msg();
									}
								}
								if($("#alarm_box_wrap").hasClass("all")){
									/// "알림 이력 보기"를 보고 있을 때
									$("#all_alarm_list").find(".unread_count").html("0");
								}
								
								// 알림 이력 상세 보기가 열린 경우
								var detail_list_layer_disp = $("#alarm_detail_list_layer").css("display");		
								if (detail_list_layer_disp == "none" || detail_list_layer_disp == undefined){
								}else{
									// 알림 이력 - 상세 보기 레이어가 열린 경우
									$("#alarm_detail_list_layer .detail_alarm_li").removeClass("unread");
									$("#alarm_detail_list_layer .detail_alarm_li").data("read", "Y");
									$("#list_unread_count").html("0");
								}								
							}
						},
						error : function(e){
						}
					});
				}
			});
		});		
	},
	
	//// 미확인 알림이 없을 때 표시되는 메시지  표시하는 함수
	"show_empty_alarm_msg": async function() {
	    
	    var list_empty = "";
	    
	    list_empty += "<div id='empty_unread'>";
	    list_empty += "	<div class='empty_ico'></div>";
	    list_empty += "	<span>" + gap.lang.not_found_alarm + "</span>";
	    list_empty += "</div>";
	    
	    list_empty = $(list_empty);
	    
	    // 알림을 비우고 새로운 메시지 생성
	    $("#unread_alarm_list").empty();
	    // 새로운 메시지를 append
	    $("#unread_alarm_list").append(list_empty);
	    
	    // 300ms 후 애니메이션 시작
	    await new Promise(function(resolve){
	    	setTimeout(resolve, 300);	
	    });

	    // opacity 애니메이션 실행
	    await new Promise(function(resolve) {
	    	list_empty.animate({ opacity: 1 }, 200, resolve);
	    });
	},
	
	////// 시스템별 미확인 알람 리스트 그리는 함수 /////////////
	"draw_unread_alarm_list": function(){
		
		var url = gAct.rp + "/noti/alarm/group-sum";
		$.ajax({
			type : "GET",
			url : url,
			xhrFields : {
				withCredentials : true
			},
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
			},
			success : function(res){
				var alarm_json = res.content;
				var html = "";
				
				///	20250205 박대민 추가,
				///	알림 미확인 건 수에 알림없음 문구가 있는 상태에서 
				///	이력보기로 이동한 뒤 미확인 건 수를 누르면 알림없음 문구가 깜빡이는 문제
				
				if($("#empty_unread").length !== 0){
					//return;
				}
				
				$("#unread_alarm_list").empty();
				
				/// 미확인 건 수가 없을 때
				if( alarm_json.length === 0 ){
					var list_empty = "";
					list_empty += "<div id='empty_unread' style='opacity: 1;'>";
					list_empty += "	<div class='empty_ico'></div>";
					list_empty += "	<span>" + gap.lang.not_found_alarm + "</span>";
					list_empty += "</div>";
					
					list_empty = $(list_empty);
					
					$("#unread_alarm_list").append(list_empty);
				} else {
					for(var i = 0; i < alarm_json.length; i++){
						var item = alarm_json[i];
						gAct.draw_unread_alarm_group_one(item, true);
					}
					
				}
				
				// 이벤트 처리
				gAct.event_unread_alarm_group();
			
			},
			error : function(e){
			}
		});		
	},
	
	"draw_unread_alarm_group_one" : function(item, is_group_sum){
		var search_key = ["fst", "nst", "pst"];

		/** 전체 알림 ON/OFF 여부 **/
		var fsh = gAct.env_data.fsh;			// 작업표시줄
		var noti = gAct.env_data.noti;		// 알림창
		var psh = gAct.env_data.psh;			/// 모바일
		
		/** 각 알림 ON/OFF 여부 **/
		var fst = gAct.env_data.fst;			// 작업표시줄
		var nst = gAct.env_data.nst;			// 알림창
		var pst = gAct.env_data.pst;			// 모바일
		var disp_sender_nm = (gap.curLang == "ko" ? item.last.send.nm : item.last.send.enm);
		var html = "";
		var sys_name = "";
		
		// admin 이름 처리
		if (disp_sender_nm == "CN=admin/O=daesang"){
			disp_sender_nm = (gap.curLang == "ko" ? "관리자" : "Admin");
		}
		
		if (item.unread > 0){
			var icon_src = gap.channelserver + "/alarmcenter_icon.do?code=" + item.nid + '&ver=' + jsversion;

			html += "<div class='alarm_li_wrap'>";
			
			/// 언어가 한국어 일 때
			if(gap.curLang === "ko"){
				sys_name = item.nm;
			} else {
				sys_name = item.enm;
			}
			/// 펼쳤을 때 상단 고정영역
			html += "	<div id='fix_" + item.nid + "_alarm_title' class='fix_alarm_title'>";
			html += "		<div class='title_box'>";
			html += "			<div class='alarm_img_box'>";
			html += "				<div class='alarm_img' style='background-image: url(" + icon_src + ")'></div>";
			html += "			</div>";
			html += "			<div class='alarm_title_txt_wrap'>";
			html += "				<span class='alarm_type'>" + sys_name + "</span>";
			html += "				<span class='count_wrap'>";
			html += "					<span id='fix_" + item.nid + "_unread_count' class='alarm_count'>" + item.unread + "</span>";
			html += "					<span>" + gap.lang.alarm_item + "</span>";
			html += "				</span>";
			html += "			</div>";
			
			/*
			 * 종모양 사용하지 않으므로 주석
			if (fsh === 'N' && noti === 'N' && psh === 'N') {
				if ( fst.includes(item.nid) && nst.includes(item.nid) && pst.includes(item.nid)) {
					/// 해당 알림이 fst, nst, pst 전체에 있을 경우 OFF 해야 함.
					html += "			<button type='button' class='btn_alarm_toggle off'></button>";
				} else {
					if (fst.length === 0 && nst.length === 0 && pst.length === 0) {
						//// 배열 데이터가 []이고, 전체 ON/OFF 데이터가 N인 경우도 OFF (사용자 설정값이 최초에는 배열 데이터가 비어있기 때문)
						html += "			<button type='button' class='btn_alarm_toggle off'></button>";
					} else if ( fst.includes(item.nid) || nst.includes(item.nid) || pst.includes(item.nid) ){
						if (
							    (fst.includes(item.nid) && nst.length === 0 && pst.length === 0) ||
							    (nst.includes(item.nid) && fst.length === 0 && pst.length === 0) ||
							    (pst.includes(item.nid) && fst.length === 0 && nst.length === 0)
							) {
								html += "			<button type='button' class='btn_alarm_toggle off'></button>";
							} else {
								html += "			<button type='button' class='btn_alarm_toggle'></button>";
							}
					} else {
						html += "			<button type='button' class='btn_alarm_toggle'></button>";
					}
				}
			} else {
				html += "			<button type='button' class='btn_alarm_toggle'></button>";
			}
			
			*/
			
			html += "		</div>";
			html += "		<span class='arrow_top_ico'></span>";
			html += "		<button type='button' class='btn_delete_alarm_li_wrap' data-nid='" + item.nid + "'></button>";
			html += "	</div>";
			
			if(item.unread === 1 || item.unread === 0){
				html += "	<div id='alarm_li_" + item.nid + "' class='alarm_li one' data-view_type='unread'>";
			} else if(item.unread === 2){
				html += "	<div id='alarm_li_" + item.nid + "' class='alarm_li double' data-view_type='unread'>";
			} else {
				html += "	<div id='alarm_li_" + item.nid + "' class='alarm_li triple' data-view_type='unread'>";
			}
			
			/////// 알림 좌측 이미지 관련
			html += "		<div class='alarm_img_box_wrap'>";
			
			html += "			<div class='alarm_img_box'>";
			html += "				<div class='alarm_img' style='background-image: url(" + icon_src + ")'></div>";
			html +=	"				<div class='alarm_count_wrap'>";
		//// 99건 초과일 때 +99로 표시
			if(item.unread > 99){
				item.unread = "99+";
			}
			html += "					<span id='group_" + item.nid + "_unread_count' class='alarm_count'>" + item.unread + "</span>";
			html += "				</div>";
			html += "			</div>";
			
			html += "			<div class='img_desc_wrap'>";
			
			/*** PC ***/

			/*
			 * 종모양 사용하지 않으므로 주석
			if (fsh === 'N' && noti === 'N' && psh === 'N') {
				if ( fst.includes(item.nid) && nst.includes(item.nid) && pst.includes(item.nid)) {
					/// 해당 알림이 fst, nst, pst 전체에 있을 경우 OFF 해야 함.
					html += "			<button type='button' class='btn_alarm_toggle off'></button>";
				} else {
					if (fst.length === 0 && nst.length === 0 && pst.length === 0) {
						//// 배열 데이터가 []이고, 전체 ON/OFF 데이터가 N인 경우도 OFF (사용자 설정값이 최초에는 배열 데이터가 비어있기 때문)
						html += "			<button type='button' class='btn_alarm_toggle off'></button>";
					} else if ( fst.includes(item.nid) || nst.includes(item.nid) || pst.includes(item.nid) ){
						if (
							    (fst.includes(item.nid) && nst.length === 0 && pst.length === 0) ||
							    (nst.includes(item.nid) && fst.length === 0 && pst.length === 0) ||
							    (pst.includes(item.nid) && fst.length === 0 && nst.length === 0)
							) {
								html += "			<button type='button' class='btn_alarm_toggle off'></button>";
							} else {
								html += "			<button type='button' class='btn_alarm_toggle'></button>";
							}
					} else {
						html += "			<button type='button' class='btn_alarm_toggle'></button>";
					}
				}
			} else {
				html += "			<button type='button' class='btn_alarm_toggle'></button>";
			}
			*/
			
			html += "				<div class='img_desc'>" + sys_name + "</div>";
			html += "			</div>";
			html += "		</div>";
			
			html += "		<div class='alarm_txt_box_wrap'>";
			html += "			<div class='alarm_sender_box'>";
			//////// 보낸사람 정보 , 보낸 시각 //////
			html += "				<div class='alarm_sender_info_wrap'>";
			html += "					<div class='alarm_sender_name_wrap'>";
			html += "						<span class='sender_name' data-ky='" + item.last.send.ky + "' title='" + disp_sender_nm + "'>" + disp_sender_nm + "</span>";
			html += "					</div>";
			html += "				</div>";
			
			html += "				<div class='send_btn_wrap'>";
			html += "					<div class='send_time_wrap'>";
			html += "						<div class='send_time'>" + gap.convertGMTLocalDateTime_new(item.last.dt) + "</div>";
			html += "						<div class='arrow_right_ico'></div>";
			html += "					</div>";
			html += "				</div>";
			html += "			</div>";
			///// 알림 상세정보, 알림 ON/OFF 버튼 ///////
			html += "			<div class='alarm_desc_box'>";
			html += "				<div class='alarm_desc_txt'>" + gAct.message_check(item.last.msg) + "</div>";
			html += "			</div>";
			html += "		</div>";
			
			/////////// 알람을 리스트에서 제거하는 버튼 ///////
			html += "		<button type='button' class='btn_delete_alarm_li' data-nid='" + item.nid + "'></button>";
			
			/////////// 알람을 펼쳐졌을 때 접는 버튼 ///////
			html += "		<button type='button' class='btn_fold_alarm_li'>";
			html += "			<span class='btn_ico'></span>";
			html += "		</button>";
			html += "	</div>";
			
			////// 알람 내용이 펼쳐지는 곳 ////
			html += "	<div class='list_container'>";
			html += "	</div>";
			////// 알람 내용이 펼쳐지는 곳 ////
			html += "</div>";
			
			var group_title_el = $("#alarm_li_" + item.nid);
			var group_el = group_title_el.closest(".alarm_li_wrap");
			if ( group_title_el.length == 0 ){
				// 신규로 그리는 경우
				if (is_group_sum){
					$("#unread_alarm_list").append(html);	
					
				}else{
					$("#unread_alarm_list").prepend(html);
				}
				
			}else{
				// 업데이트인 경우
				var unread_cnt = item.unread;
				$("#group_" + item.nid + "_unread_count").html(unread_cnt);
				
				if (unread_cnt == 1){
					group_title_el.removeClass("triple");
					group_title_el.removeClass("double").addClass("one");
				}else if (unread_cnt == 2){
					group_title_el.removeClass("triple")
					group_title_el.removeClass("one").addClass("double");
				}else if (unread_cnt == 3){
					group_title_el.removeClass("one");
					group_title_el.removeClass("double").addClass("triple");
				}
				group_title_el.find(".sender_name").data("ky", item.last.send.ky);
				group_title_el.find(".sender_name").html( item.last.send.nm );
				group_title_el.find(".send_time").html( gap.convertGMTLocalDateTime_new(item.last.dt) );
				group_title_el.find(".alarm_desc_txt").html( gAct.message_check(item.last.msg) );
				
				group_el.prependTo(group_el.parent());
			}
			
			$("#alarm_li_" + item.nid).data("info", item.last);
			$("#alarm_li_" + item.nid).data("nid", item.nid);
		}		
	},
	
	"event_unread_alarm_group" : function(){
		$("#unread_alarm_list .alarm_li").off().on("click", function(){
			var el = $(this);
			var target = el.closest(".alarm_li_wrap");
			var info = el.data("info");
			var nid = el.data("nid");
			var rid = info.rid;
			var id = info.id;
			var lnk = info.lnk;
			var alarm_cnt = parseInt(el.find(".alarm_count"));
			
			if(!el.hasClass("one")){
				// 1개가 아닌 경우
				gAct.show_unread_alarm(el, nid, alarm_cnt);
			} else {
				// 1개일 때
				var data = [];

				data.push(id);
				var postData = {
						"ty" : "data",
						"nid" : nid,
						"ex" : (typeof(info.ex) != "undefined" ? info.ex : {}),
						"data" : data
					};
				
				var url = gAct.rp + "/noti/alarm/confirm";
				$.ajax({
					type : "POST",
					url : url,
					dataType : "json",
					data : postData,
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
					},
					success : function(res){
						if (res.result == "success"){
							gAct.alarm_content_popup(nid, rid, info);
							
							target.addClass("remove");
							setTimeout(function(){
								// 알림이 우측으로 사라지는 애니메이션이 끝나면 제거
								target.remove();
								
								var alarm_li_el = $("#unread_alarm_list .alarm_li");
								
								///////// 미확인 건 수가 없을 때 "신규로 도착한 알림이 없습니다." 문구 표시 ///////
								if ( alarm_li_el.length == 0 || alarm_li_el === undefined ){
									
									var list_empty = "";
									
									list_empty += "<div id='empty_unread' style='opacity: 1;'>";
									list_empty += "	<div class='empty_ico'></div>";
									list_empty += "	<span>" + gap.lang.not_found_alarm + "</span>";
									list_empty += "</div>";
									
									list_empty = $(list_empty);											
									
									$("#unread_alarm_list").empty();
									$("#unread_alarm_list").append(list_empty);										
								}
							}, 270);
							
						}
					},
					error : function(e){
					}
				});
			}
		});
		
		$("#alarm_ul .fix_alarm_title").off().on("click", function(){
			gAct.show_unread_alarm($(this));
		});
		
		// 펼쳐진 상태에서 추가된 새 알림 카드에 대한 이벤트
		$("#unread_alarm_list .alarm_card").off().on("click", function(e){
			///카드
			var el = $(this);
			gAct.alarm_card_click_event(el);
		});
		
		/******************* 알림센터 메인 종모양 아이콘 *******************/
		//클릭 이벤트
		
/*		$("#alarm_ul .btn_alarm_toggle").off().on("click", function(e){
			e.stopPropagation();
			
			$(this).closest(".alarm_li_wrap").find(".btn_alarm_toggle").toggleClass("off");
			
			// 현재 알림의 종모양 아이콘
			var target = $(this).closest(".alarm_li_wrap").find(".btn_alarm_toggle");
			
			/// 알림 켜져있을 떄
			var on = !$(this).hasClass("off");
			var $nid = $(this).closest(".alarm_li_wrap").find(".alarm_li").data("nid");
			var $opt = "";
			
			if( on ){
				*//*** 알림 ON ***//*
				$opt = "on";

			} else {
				*//*** 알림 OFF ***//*
				$opt = "off";
			}
			
			var postData = JSON.stringify({
				nid: $nid,
				opt: $opt
			});
			
			gAenv.save_alarm_preferences(postData, "", [true, target]);
		});
		
		/// 커서 올렸을 때
		$("#alarm_ul .btn_alarm_toggle").on("mouseenter", function(e){
			if(!$(this).hasClass("off")){
//				gAct.draw_main_alarm_bell_tooltip($(this));
			}
		});
		
		// 커서를 뗐을 때
		$("#alarm_ul .btn_alarm_toggle").on("mouseleave", function(e){
			$("#alarm_li_bell_tooltip").remove();
		});
*/
		$(".btn_delete_alarm_li_wrap").off().on("click", function(e){
			e.stopPropagation();
			
			var el = $(this);
			var target = el.closest(".alarm_li_wrap");
			var nid = el.data("nid");
			var postData = {
					"ty" : "nid",
					"nid" : nid,
					"ex" : {},
					"data" : ""
				};
			var url = gAct.rp + "/noti/alarm/confirm";
			$.ajax({
				type : "POST",
				url : url,
				dataType : "json",
				data : postData,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
				},
				success : function(res){
					if (res.result == "success"){
						el.closest(".alarm_li_wrap").addClass("remove");
						
						setTimeout(function(){
							//// 알림이 우측으로 사라지는 애니메이션이 끝나면 제거
							target.remove();
							
							// 미확인 건 수가 모두 비워지면 "신규로 도착한 알림이 없습니다."문구 표시
							if($("#unread_alarm_list .alarm_li_wrap").length === 0){
								setTimeout(function(){
									//// 알림이 우측으로 사라지는 애니메이션이 끝나면 제거
									$("#unread_alarm_list").empty();
									
									var list_empty = "";
									list_empty += "<div id='empty_unread'>";
									list_empty += "	<div class='empty_ico'></div>";
									list_empty += "	<span>" + gap.lang.not_found_alarm + "</span>";
									list_empty += "</div>";
									
									list_empty = $(list_empty);
									
									setTimeout(function(){
										list_empty.animate({
											"opacity": 1
										}, 200);						
									}, 90);
									$("#unread_alarm_list").append(list_empty);
								}, 300);
							}
							
						}, 270);
					}
				},
				error : function(e){
				}
			});	
		});
		
		//사용자 정보 표시
		$('.sender_name').off().on("click", function(e){
			
			var el = $(this);
			
			if(el.data("ky") !== ""){
				e.stopPropagation();
			}
			gAct.show_user_profile(el);
		});
		
		$(".btn_delete_alarm_li").off().on("click", function(e){
			e.stopPropagation();
			
			var el = $(this);
			var remove_target = el.closest(".alarm_li_wrap");
			var nid = el.data("nid");
			var postData = {
					"ty" : "nid",
					"nid" : nid,
					"ex" : {},
					"data" : ""
				};
			var url = gAct.rp + "/noti/alarm/confirm";
			$.ajax({
				type : "POST",
				url : url,
				dataType : "json",
				data : postData,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
				},
				success : function(res){
					if (res.result == "success"){
						el.parent(".alarm_li").addClass("remove");
						
						setTimeout(function(){
							//// 알림이 우측으로 사라지는 애니메이션이 끝나면 제거
							remove_target.remove();
							
							//var alarm_li_el = $("#alarm_ul .alarm_li");
							var alarm_li_el = $("#unread_alarm_list .alarm_li");
							
							if (alarm_li_el.length == 0){
								var list_empty = "";
								list_empty += "<div id='empty_unread' style='opacity: 1;'>";
								list_empty += "	<div class='empty_ico'></div>";
								list_empty += "	<span>" + gap.lang.not_found_alarm + "</span>";
								list_empty += "</div>";
								
								list_empty = $(list_empty);											

								$("#unread_alarm_list").empty();
								$("#unread_alarm_list").append(list_empty);										
							}									
						}, 300);									
					}
				},
				error : function(e){
				}
			});
		});			
	},
	
	/// 미확인 알림 상세 리스트 펼치는 함수
	"show_unread_alarm": function(target, nid, cnt){
		///// target : 펼치려는 알람 대상
		///// nid : 알람 시스템 id
		///// cnt : 해당 알림의 미확인 건 수

		var postData = {
				"nid" : nid,
				"unread" : "T",
				"word" : "",
				"skip" : "",
				"limit" : ""
			};
		var url = gAct.rp + "/noti/alarm/list";
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
			},
			success : function(res){
				var unread_alarm_json = res.content;
				var isOpen = target[0].classList[0] === 'alarm_li';	
				
				if(isOpen){
					/// 펼쳐질 때
				
					for(var i = 0; i < unread_alarm_json.length; i++){
						var item = unread_alarm_json[i];
						gAct.draw_unread_alarm_list_one(item, target, nid, i, true);
					}
					
					/*$(".alarm_card").css({
						"transition-delay": "0s"
					});*/
					
					target.toggleClass("open");
					//target.parent().find(".list_container").toggleClass("slide_down");

					/// 알림 펼쳐졌을 때
					if(target.parent().find(".alarm_li").hasClass("open")){
						
						setTimeout(function(){
							target.css("display", "none");
							target.find(".alarm_count_wrap").hide();
							target.find(".img_desc_wrap").hide();
							target.find(".btn_delete_alarm_li").hide();
						//	target.parent().find(".list_container").append(html);
							
						/*	if(noti_id === "kp_mail"){
								target.siblings(".fix_alarm_title").find(".alarm_count").text(5);						
							} else {
								target.siblings(".fix_alarm_title").find(".alarm_count").text(unread_alarm_json.length);
							}*/
							target.siblings(".fix_alarm_title").find(".alarm_count").text(unread_alarm_json.length);
							
							target.find(".arrow_right_ico").hide();
							target.find(".btn_delete_alarm_card").show();
							target.closest(".alarm_li_wrap").addClass("slide");
							
							var container = target.closest(".alarm_box");
							
							target.parent().find(".list_container").addClass("slide_down").slideDown(300,
								function(){
									setTimeout(function(){
										$("#unread_alarm_list").animate({
											"scrollTop": target.closest(".alarm_li_wrap").position().top - 19 + container.scrollTop()
										});
										
										/// 모두 펼쳐진 뒤 transition-delay 0초로 초기화
										target.siblings(".list_container").find(".alarm_card").css({
											/*"transition-delay": "0.2s"*/
											"transition-delay": "0s"
										});
									}, 0);
								}
							);
							
							target.parent().find(".alarm_card").addClass("expand");
							
							//사용자 정보 표시
							$('.emp_name').off().on("click", function(e){
								
								var el = $(this);
								
								if(el.data("ky") !== ""){
									e.stopPropagation();
								}
								
								gAct.show_user_profile(el);
							});							

							$(".btn_delete_alarm_card").off().on("click", function(e){
								e.stopPropagation();
								
								var el = $(this);
								gAct.alarm_card_delete_event(el);
							});
							
							/// 해당 카테고리의 알람 목록
							var $list = target.siblings(".list_container").find(".alarm_card");
							
							$list.off().on("click", function(){
								var el = $(this);
								gAct.alarm_card_click_event(el);
							});
						}, 200);
					}
					
				} else {
					///// 알림 접힐 때

					target.parent().find(".list_container").removeClass("slide_down");
					
					target.closest(".alarm_li_wrap").find(".alarm_count_wrap").show();
					target.closest(".alarm_li_wrap").find(".img_desc_wrap").show();
					target.siblings().find(".btn_delete_alarm_li").show();
					target.closest(".alarm_li_wrap").find(".arrow_right_ico").show();
					
					target.parent().find(".list_container").slideUp(300, function(){
						target.parent().find(".alarm_card").removeClass("expand");
						target.parent().find(".list_container").empty();
						target.siblings(".alarm_li").removeClass("open");
					});

					//pc에서만
					if(!target.siblings(".alarm_li_wrap").hasClass("slide_down")){
						target.closest(".alarm_li_wrap").removeClass("slide");
						target.siblings(".alarm_li").css("display", "flex");					
						setTimeout(function(){
							target.siblings(".alarm_li").removeClass("open");
						}, 300);
						setTimeout(function(){
							//target.closest(".alarm_li_wrap").mCustomScrollbar( "destroy" );
							target.find(".btn_delete_alarm_li").show();
						}, 400);
						
						//// 원래 위치로 되돌아가기
						var container = target.closest(".alarm_box");
						
						$("#unread_alarm_list").animate({
							"scrollTop": target.closest(".alarm_li_wrap").position().top - 19 + container.scrollTop()
						}, 0);
					}

				}				
				
			},
			error : function(e){
			}
		});
	},
	
	"draw_unread_alarm_list_one" : function(item, target, nid, i, is_list){
		// 알림 목록 간의 간격.
		var alarm_gap = "12px";
		var disp_sender_nm = (gap.curLang == "ko" ? item.send.nm : item.send.enm);
		var html = "";
		
		// admin 이름 처리
		if (disp_sender_nm == "CN=admin/O=daesang"){
			disp_sender_nm = (gap.curLang == "ko" ? "관리자" : "Admin");
		}
		
		html += "<div class='alarm_card' id='alarm_card_" + item.id + "' style='";
		
		/******* inline css *****/
		//////// 순서대로 같은 간격으로 배치 ///////  
		// 알림 간의 간격만큼 더 움직여야 함.
		html +=	"transform: translateY( calc( "+ (i+1) * (-100) + "% - " + alarm_gap + " + " + ((i+1) * 6)+ "px ));";
		
		//////// 순서대로 나타내기 ///////
		
		if(i > 7){
			/// 7개 이후 부터는 지연 없이 동시에 나타남, 갯수가 많을 경우 알림이 늦게 나타나지 않도록
			html += " transition-delay: 0.8s;'>";
		} else {
			/// 7개까지는 순서대로 0.1초씩 지연되어 나타남
			html += " transition-delay: " + ((i+1)*0.1).toFixed(1) + "s;'>";
		}
		
		html += "	<div class='alarm_info_box'>";
		html += "		<div class='alarm_title_box_wrap'>";
		html += "			<div class='alarm_title_box'>";
		html += "				<div class='emp_name_wrap'>";
		html += "					<span class='emp_name' data-ky='" + item.send.ky + "' title='" + disp_sender_nm + "'>" + disp_sender_nm + "</span>";
		html +=	"				</div>";
		html += "			</div>";
		html += "			<div class='alarm_time_wrap'>";
		html += "				<span class='alarm_time'>" + gap.convertGMTLocalDateTime_new(item.dt) + "</span>";
		html += "				<button type='button' class='btn_delete_alarm_card'>";
		html += "					<span class='btn_ico'></span>";
		html += "				</button>";
		html += "			</div>";
		html += "		</div>";
		html += "		<div class='unread_alarm_desc'>" + gAct.message_check(item.msg) + "</div>";
		html += "	</div>";
		html += "</div>";
		
		if (is_list){
			// noti/alarm/list 호출하여 그리는 경우
			target.parent().find(".list_container").append(html);
			
		}else{
			// 클라이언트로부터 받는 이벤트로 그리는 경우
			var unread_cnt = $("#fix_" + nid + "_unread_count").html();
			var $html_el = $(html);
			
			target.siblings(".list_container").prepend($html_el);
			$("#fix_" + nid + "_unread_count").html( parseInt(unread_cnt) + 1 );
			
			requestAnimationFrame(() => {
				//신규알림 div가 렌더링 된 후 애니메이션 class 추가
				$html_el.addClass("expand");
				
				// 애니메이션 끝난 후 transition-delay를 0s로 초기화
				requestAnimationFrame(() => {
					$html_el.css({ "transition-delay" : "0s" });
				});
			});
		}
		
		$("#alarm_card_" + item.id).data("info", item);
		$("#alarm_card_" + item.id).data("nid", nid);		
	},
	
	"alarm_card_click_event": function(el){
		var el_idx = el.index();
		var card_parent = el.closest(".list_container");
		var cards = el.closest(".list_container").find(".alarm_card");
		var info = el.data("info");
		var nid = el.data("nid");
		var rid = info.rid;
		var lnk = info.lnk;
		var id = info.id;
		var data = [];

		
		if (nid == "kp_chat"){
			// 채팅방은 rid 갯수만큼 읽음 처리
			var rid_list = cards.filter(function(){
				var _info = $(this).data("info");
				return _info.rid === rid;
			});
			rid_list.each(function(idx, ele){
				var _info = $(this).data("info");
				data.push(_info.id);
			});
			
		}else if (nid == "kp_channel"){
			// 업무방은 per_key까지 체크
			var per_key = info.ex.per_key;
			
			if (per_key == ""){
				// 공유 업무방
				var rid_list = cards.filter(function(){
					var _info = $(this).data("info");
					return _info.rid === rid;
				});
				rid_list.each(function(idx, ele){
					var _info = $(this).data("info");
					data.push(_info.id);
				});
				
			}else{
				// 과제관리
				var per_key_list = cards.filter(function(){
					var _info = $(this).data("info");
					return _info.ex.per_key === per_key;
				});
				per_key_list.each(function(idx, ele){
					var _info = $(this).data("info");
					data.push(_info.id);
				});
			}

		}else{
			data.push(id);
		}

		var postData = {
				"ty" : "data",
				"nid" : nid,
				"ex" : (typeof(info.ex) != "undefined" ? info.ex : {}),
				"data" : data
			};
		var url = gAct.rp + "/noti/alarm/confirm";
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
			},
			success : function(res){
				if (res.result == "success"){
					var group_title_el = $("#alarm_li_" + nid);
					var unread_cnt = $("#fix_" + nid + "_unread_count").html();
					unread_cnt = parseInt(unread_cnt) - data.length;
					if (unread_cnt < 0){
						unread_cnt = 0;
					}
					$("#fix_" + nid + "_unread_count").html(unread_cnt);
					$("#group_" + nid + "_unread_count").html(unread_cnt);
					
					if (unread_cnt == 2){
						group_title_el.removeClass("triple").addClass("double");
					}else if (unread_cnt == 1){
						group_title_el.removeClass("triple");
						group_title_el.removeClass("double").addClass("one");
					}
					
					gAct.alarm_content_popup(nid, rid, info);
					if (unread_cnt == 0){
						el.closest(".alarm_li_wrap").remove();
						
						// 미확인 건 수가 모두 비워지면 "신규로 도착한 알림이 없습니다."문구 표시
						if($("#unread_alarm_list .alarm_li_wrap").length === 0){
							setTimeout(function(){
								//// 알림이 우측으로 사라지는 애니메이션이 끝나면 제거
								$("#unread_alarm_list").empty();
								
								var list_empty = "";
								list_empty += "<div id='empty_unread'>";
								list_empty += "	<div class='empty_ico'></div>";
								list_empty += "	<span>" + gap.lang.not_found_alarm + "</span>";
								list_empty += "</div>";
								
								list_empty = $(list_empty);
								
								setTimeout(function(){
									list_empty.animate({
										"opacity": 1
									}, 200);						
								}, 90);
								$("#unread_alarm_list").append(list_empty);
							}, 300);
						}

					}else{
						$(data).each(function(idx, val){
							var _el = $("#alarm_card_" + val);
							_el.remove();
						});	

						cards = card_parent.find(".alarm_card");
						var first_el = cards.eq(0);
						
						group_title_el.data("info", first_el.data("info"));
						group_title_el.data("nid", first_el.data("nid"));
						group_title_el.find(".sender_name").html( first_el.find(".emp_name").html() );
						group_title_el.find(".send_time").html( first_el.find(".alarm_time").html() );
						group_title_el.find(".alarm_desc_txt").html( first_el.find(".unread_alarm_desc").html() );
					}
				}
			},
			error : function(e){
			}
		});		
	},
	
	"alarm_card_delete_event": function(el){
		var remove_target = el.closest(".alarm_card");
		var remove_target_idx = remove_target.index();
		
		var $close = el.closest(".alarm_li_wrap").find(".btn_delete_alarm_li_wrap");
		var cards = el.closest(".list_container").find(".alarm_card");
		var info = remove_target.data("info");
		var nid = remove_target.data("nid");
		var id = info.id;
		var data = [];

		data.push(id);
		var postData = {
				"ty" : "data",
				"nid" : nid,
				"ex" : (typeof(info.ex) != "undefined" ? info.ex : {}),
				"data" : data
			};								
		
		var url = gAct.rp + "/noti/alarm/confirm";
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
			},
			success : function(res){
				if (res.result == "success"){
					var group_title_el = $("#alarm_li_" + nid);
					var unread_cnt = $("#fix_" + nid + "_unread_count").html();
					unread_cnt = parseInt(unread_cnt) - data.length;
					if (unread_cnt < 0){
						unread_cnt = 0;
					}
					$("#fix_" + nid + "_unread_count").html(unread_cnt);
					$("#group_" + nid + "_unread_count").html(unread_cnt);
					
					if (unread_cnt == 2){
						group_title_el.removeClass("triple").addClass("double");
					}else if (unread_cnt == 1){
						group_title_el.removeClass("triple");
						group_title_el.removeClass("double").addClass("one");
					}

					if (remove_target_idx == 0){
						// 첫번재 미확인 알림을 클릭한 경우
						if (cards.length > 1){
							var first_el = cards.eq(1);
							
							group_title_el.data("info", first_el.data("info"));
							group_title_el.data("nid", first_el.data("nid"));
							group_title_el.find(".sender_name").html( first_el.find(".emp_name").html() );
							group_title_el.find(".send_time").html( first_el.find(".alarm_time").html() );
							group_title_el.find(".alarm_desc_txt").html( first_el.find(".unread_alarm_desc").html() );
						}
					}
					
					if(cards.length !== 1){
						//$(this).closest(".alarm_card").addClass("remove");
						
						//// 알림이 사라지는 애니메이션
						remove_target.addClass("remove");
						
						setTimeout(function(){
							//// 알림이 우측으로 사라지는 애니메이션이 끝나면 제거
							remove_target.remove();
						}, 200);
					} else {
						$close.click();
						
						/*// 미확인 건 수가 모두 비워지면 "신규로 도착한 알림이 없습니다."문구 표시
						if($("#empty_unread").length === 0){
							setTimeout(function(){
								//// 알림이 우측으로 사라지는 애니메이션이 끝나면 제거
								$("#unread_alarm_list").empty();
								
								var list_empty = "";
								list_empty += "<div id='empty_unread'>";
								list_empty += "	<div class='empty_ico'></div>";
								list_empty += "	<span>" + gap.lang.not_found_alarm + "</span>";
								list_empty += "</div>";
								
								list_empty = $(list_empty);
								
								setTimeout(function(){
									list_empty.animate({
										"opacity": 1
									}, 200);						
								}, 90);
								$("#unread_alarm_list").append(list_empty);
							}, 300);
						}*/
						
					}									
				}
			},
			error : function(e){
			}
		});		
	},
	
	"show_user_profile": function(el){
		var _key = el.data('ky');

		if (_key != ""){
			gap.showDetailUserInfo(_key);
			return false;
		}
	},

	////// 전체 알람 리스트 그리는 함수 //////////////
	"draw_all_alarm_list": function(){		
		var url = gAct.rp + "/noti/alarm/count-sum";
		$.ajax({
			type : "GET",
			url : url,
			xhrFields : {
				withCredentials : true
			},
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
			},
			success : function(res){
				var alarm_json = res.content;
				var html = "";
				
				$("#all_alarm_list").empty();
				
				if( alarm_json.length === 0 ){
					html = "";
					
					html += "<div class='empty_all_alarm_wrap'>";
					html += "	<div class='guide_ico'></div>";
					html += "	<span>" + gap.lang.not_found_all_alarm + "</span>";
					html += "</div>";
					
					
					$("#all_alarm_list").append(html);
					
					return;
				}
				
				var sys_name = "";
				
				for(var i = 0; i < alarm_json.length; i++){
					var item = alarm_json[i];
					var icon_src = gap.channelserver + "/alarmcenter_icon.do?code=" + item.nid + '&ver=' + jsversion;
					
					if(gap.curLang === "ko"){
						sys_name = item.nm;
					} else {
						sys_name = item.enm;
					}
					
					html = "";
					
					html += "<div id='alarm_li_all_" + item.nid + "' class='alarm_li' data-view_type='all'>";
					html += "	<div class='alarm_img_wrap'>";
					html += "		<div class='alarm_img' style='background-image: url(" + icon_src + ")'></div>";
					html += "	</div>";
					html += "	<div class='alarm_desc_wrap'>";
					html += "		<div class='alarm_desc' title='" + sys_name + "'>" + sys_name + "</div>";
					html += "		<div class='alarm_count_wrap'>";
					html += "			<div class='unread_count'>" + item.unread + "</div>";
					html += "			<div class='slash'>/</div>";
					html += "			<div class='total_count'>" + item.total + "</div>";
					html += "		</div>";
					html += "	</div>";
					html += "</div>";
					
					$("#all_alarm_list").append(html);
					$("#alarm_li_all_" + item.nid).data("nid", item.nid);
				}			
				
				$("#all_alarm_list .alarm_li").off().on("click", function(){
					var nid = $(this).data("nid");
					
					gAct.draw_alarm_detail_list_layer("all", nid);
				});				
			},
			error : function(e){
			}
		});		
	},
	///////// 알람 세부 리스트 그리는 함수 ///////////////
	"draw_alarm_detail_list_layer": function(view_type, nid){
		///// view_type: "미확인", "알림 이력 보기"인지 체크
		///// nid: 업무방, 채팅, 메일 여부 체크
		console.log("draw_alarm_detail_list_layer >>> call!!!!!");
		var qry = "";
		var html = "";
		
		html += "<div id='alarm_detail_list_layer' class='alarm_detail_list_layer' data-nid='" + nid + "'>";
		html += "	<div class='layer_inner'>";
		html += "		<div class='layer_top'>";
		html += "			<div class='layer_title_box_wrap'>";
		html += "				<button type='button' id='btn_prev' class='btn_prev'>";
		html += "					<span class='btn_ico_wrap'>";
		html += "						<span class='btn_ico'></span></button>";		
		html += "					</span>";
		html += "				</button>";
		html += "				<div class='layer_title_box'>";
		html += "					<div class='layer_title'>";
		html += "						<span id='alarm_list_title' class='alarm_title'></span>";
		html += "					</div>";
		//html += "					<button type='button' class='btn_all_read_alarm'>모두읽음</button>";
		html += "				</div>";
		html += "			</div>";
		html += "			<button type='button' id='btn_layer_close' class='btn_layer_close'></button>";
		html += "		</div>";
		
		html += "		<div class='layer_content'>";
		html += "			<div class='category_box_wrap'>";
		
		//////////// 알림 이력 보기에서만 검색창 표시 ///////////
		if(view_type === "all"){
			html += "				<div class='search_box'>";
			html += "					<input type='text' id='input_alarm_search' class='input_alarm_search' placeholder='" + gap.lang.search_guide + "'>";
			html += "					<span class='search_ico'></span>";
			html += "					<button type='button' id='btn_search_keyword_init' class='btn_search_keyword_init'></button>";
			html += "				</div>";
		}
		html += "				<div id='detail_alarm_count_wrap' class='alarm_count_wrap' style='display:none;'>";
		html += "					<span id='list_total_count_box' class='total_alarm_count_box'>";
		html += "						<div class='list_cnt_wrap'>";
		html += "							<span id='list_unread_count' class='list_unread_count'></span>";
		html += "							<span class='slash'>/</span>";
		html += "							<span id='list_total_count' class='list_total_count'></span>";
		html += "						</div>";
		html += "						<span>" + gap.lang.alarm_item + "</span>";
		html += "					</span>";
		html += "					<button type='button' class='btn_all_read_alarm'>" + gap.lang.read_all + "</button>";
		html += "				</div>";
		html += "			</div>";
	
		html += "			<div id='detail_alarm_container' class='detail_alarm_container'>";
		
		if(view_type !== "all"){
			///// 미확인 알람 리스트 /////
			html += "				<div id='detail_all_alarm' class='detail_alarm_box'></div>";
		} else {
			///// 전체 알람 리스트 /////
			
			/// 검색창 높이만큼 리스트영역을 더 줄여야함.
			html += "				<div id='detail_all_alarm' class='detail_alarm_box all'></div>";
		}
	//	html += "					<div id='detail_all_alarm_list' class='detail_alarm_ul_box'></div>";		
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";
		
		//$("#alarm_center_layer").append(html);
		
		$("#alarm_ul").append(html);
		
		setTimeout(function(){
			$("#alarm_detail_list_layer").addClass("show");
		});
		
		/*
		/// 상세 알림 리스트가 띄워진 다음 애니메이션 속성 초기화 (닫을 때 애니메이션을 줘야함.)
		$("#alarm_detail_list_layer").on("animationend", function(){
			$(this).css({
				"animation": "none"
			});			
		});
		*/
		
		view_type = view_type == "all" ? view_type : "unread";

		/*var loading = "";
		
		loading += "<div id='loading_screen_box'>";
		loading += "	<div class='loading_screen_box_wrap'>";
		loading += "		<div id='loading_item' class='loading-items'>";
		loading += "			<div class='loading'>";
		loading += "				<span></span>";
		loading += "				<span></span>";
		loading += "				<span></span>";
		loading += "			</div>";
		loading += "		</div>";
		loading += "	</div>";
		loading += "</div>";*/
		
		$("#detail_all_alarm").empty();
		//$("#detail_all_alarm").append(loading);
		
		gAct.draw_mail_alarm_list(view_type, nid, qry);
		
		$("#btn_prev").off().on("click", function(){
			$("#btn_layer_close").click();
		});
		$("#btn_layer_close").off().on("click", function(){
			//gAct.draw_all_alarm_list();
			//gAct.close_modal_layer();
			
			/*
			/// 상세 알림 리스트 띄우는 애니메이션을 역방향으로 실행
			$("#alarm_detail_list_layer").css({
				"animation": "layer_show 0.2s both reverse"
			});
			setTimeout(function(){
				/// 리스트 닫는 애니메이션이 끝난 뒤 해당 요소 제거
			}, 200);
			*/
			$("#alarm_detail_list_layer").removeClass("show");
			setTimeout(function(){
				$("#alarm_detail_list_layer").remove();
			}, 200);
			
			/// 레이어를 띄우면서 추가했던 스크롤 없애는 class를 다시 제거하여 되돌린다.
			$("#alarm_ul .alarm_box").removeClass("no_scroll");
			
		});
		
		//////////// 검색창 이벤트 //////////////
		$("#input_alarm_search").off().on("keypress input", function(e){
			var qry = $(this).val();
			
			if (e.keyCode == 13){
				
				if($.trim(qry).length >= 1){
					$("#btn_search_keyword_init").fadeIn(150);
					
					///검색창 css
					$(this).siblings(".search_ico").addClass("focus");
					$("#input_alarm_search").css({
						"border-color": "#777" 
					});
					///검색창 css
					
					//// 검색 시 건 수를 숨김.
					$("#list_total_count_box").hide();
					$("#detail_alarm_count_wrap").addClass("row_reverse");
					
				} else {
					//$("#btn_search_keyword_init").fadeOut(150);
					
					/***** 검색어 입력하지 않고 Enter 눌렀을 때 *****/
					/// 검색어 입력하지 않고 Enter 눌렀을 때 Toast 위치를 알림포탈 내부에 위치 시킨다.
					if($(".mbsc-toast").length === 0){
						mobiscroll.toast({
							message: gap.lang.search_guide,
							color: 'danger',
							display: "bottom"
						});
					} else {
						$(".mbsc-toast").remove();
					}

					var target_el = $("#alarm_detail_list_layer")[0];
					var rect = target_el.getBoundingClientRect();
					
					setTimeout(function(){
						var toastEl = $(".mbsc-toast");
						
						if (toastEl.length !== 0) {
							toastEl.css({
								"position" : "absolute",
								"top" : rect.top + window.scrollY + "px",
								"left" : rect.left + window.scrollX + "px"
							});
						}
					});
					/***** 검색어 입력하지 않고 Enter 눌렀을 때 *****/

					return;
				}
				
				$("#detail_all_alarm").empty();
				gAct.draw_mail_alarm_list(view_type, nid, qry);
			}
		});
		$("#input_alarm_search").on("focus", function(){
			$(this).siblings(".search_ico").addClass("focus");
			
			/// 검색창 input border 색상 변경
			$("#input_alarm_search").css({
				"border-color": "#777" 
			});
		});
		$("#input_alarm_search").on("blur", function(){
			var qry = $("#input_alarm_search").val();
			$.trim(qry);
			
			/// 검색창에 검색어가 남아 있지 않을 때
			if($.trim(qry).length < 1){
				$(this).siblings(".search_ico").removeClass("focus");
				$("#input_alarm_search").css({
					"border-color": "#E5E5E5" 
				});
			} else {
				/// 검색창에 검색어가 남아 있을 때
				$("#input_alarm_search").css({
					"border-color": "#777" 
				});
			}
		});
		
		/////// 검색창 키워드 초기화(지우기) ////////
		$("#btn_search_keyword_init").off().on("click", function(){
			$(this).fadeOut(150);
			
			//// 검색 해제시 건 수를 다시 표시.
			$("#list_total_count_box").show();
			$("#detail_alarm_count_wrap").removeClass("row_reverse");
			
			$("#input_alarm_search").focus().val("");
			
			///검색창 css
			$(this).siblings(".search_ico").removeClass("focus");
			$("#input_alarm_search").css({
				"border-color": "#E5E5E5" 
			});
			///검색창 css
			
			$("#detail_all_alarm").empty();
			gAct.draw_mail_alarm_list(view_type, nid, "");			
		});
		
		//////////// 검색창 이벤트 //////////////
		
		/// 모두 읽음
		$("#alarm_detail_list_layer .btn_all_read_alarm").off().on("click", function(){
			gap.showConfirm({
				title: gap.lang.Confirm,
				//iconClass: 'remove',
				contents: gap.lang.confirm_all_read,
				callback: function(){
					var postData = {
							"ty" : "nid",
							"nid" : nid,
							"ex" : {},
							"data" : ""
						};
					var url = gAct.rp + "/noti/alarm/confirm";
					$.ajax({
						type : "POST",
						url : url,
						dataType : "json",
						data : postData,
						beforeSend : function(xhr){
							xhr.setRequestHeader("auth", gap.get_auth());
						},
						success : function(res){
							if (res.result == "success"){
								$("#list_unread_count").html("0");
								$(".detail_alarm_li").data("read", "Y");
								$(".detail_alarm_li").removeClass("unread");									
							}
						},
						error : function(e){
						}
					});				
				}
			});
		});
	},
	
	////메일 알람 리스트 그리는 함수 
	"draw_mail_alarm_list": function(view_type, nid, qry){
		
		var observer;
		var start = 0;
		var end = 100;

		//var is_scroll_end = false;
		
		var loading = "";
		
		loading += "<div id='loading_screen_box'>";
		loading += "	<div class='loading_screen_box_wrap detail_list'>";
		loading += "		<div id='loading_item' class='loading-items'>";
		loading += "			<div class='loading'>";
		loading += "				<span></span>";
		loading += "				<span></span>";
		loading += "				<span></span>";
		loading += "			</div>";
		loading += "		</div>";
		loading += "	</div>";
		loading += "</div>";

		var search_null = "";
		
		search_null += "<div class='empty_search_res'>";
		search_null += "	<span class='empty_ico'></span>";
		search_null += "	<span>" + gap.lang.not_found_search + "</span>";
		search_null += "</div>";
		
		var url = gAct.rp + "/noti/alarm/list";
		
		list_load();

		function list_load(opt){
			
			$.ajax({
				type : "POST",
				url : url,
				dataType : "json",
				data: {
					"nid" : nid,
					"unread" : "",
					"word" : qry,
					"skip" : start,
					"limit" : end
				},
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					
					if( $("#loading_screen_box").length === 0 ){
						$("#detail_all_alarm").append(loading);
						
						///로딩이 append된 다음 스크롤을 내려줘야 로딩이 보여짐.
						$("#detail_all_alarm").scrollTop($("#detail_all_alarm")[0].scrollHeight);
					}
				},
				success : function(res){
					
					//로딩 바 제거
					$("#loading_screen_box").remove();
					
					// 최초 리스트를 불러올 때, 검색을 했을 때는 리스트를 비운다.
					if(opt !== "add"){
						$('#detail_all_alarm').empty();
					}
					
					/*** 건수 업데이트 관련 소스 ***/
					if( observer === undefined && start === 0 ){
						/// 건 수는 처음에만 표시한다.
						$("#list_unread_count").html(res.t_unrd);
						$("#list_total_count").html(res.t_cnt);
					}
					/*** 건수 업데이트 관련 소스 ***/
					
					/// 목록 데이터
					var detail_alarm_json = res.content;
					
					/// 데이터가 있다면  start를 100씩 늘린다.
					if( detail_alarm_json.length !== 0 ){
						start += 100;
						//console.log(">>>>>>>>>>>>>>> 새 이력 데이터 로드");
					} else {
						// 데이터가 없을 때
						//is_scroll_end = true;
						//$('#detail_all_alarm').append("마지막 이력입니다.");
						console.log(">>>>> 더이상 이력 데이터 없음.");
						
						///레이어를 띄운 상태 또는 검색으로 데이터를 불러왔을 때
						if(opt !== "add"){
							if(detail_alarm_json.length === 0){
								$("#detail_all_alarm").append(search_null);
							}
						}
						/*if(is_mobile){
								mobiscroll.toast({
									// 모바일에서는 입력창에 가려지지 않도록 위치지정
									display: "top",
									message: gap.lang.search_guide,
									color:'danger'
								});
							} else {
								mobiscroll.toast({
									message: gap.lang.search_guide,
									color:'danger'
								});	
							}*/
						return;
					}
					
					$("#alarm_list_title").html(res.nm);
					
					/*** 건수 업데이트 관련 소스 ***/
					
					if( $("#list_total_count").html() === "" ){
						$("#list_total_count").html(res.t_cnt);
					}
					
					/// 검색 했을 때
					if(qry !== ""){
						if(detail_alarm_json.length === 0){
							$("#detail_all_alarm").append(search_null);
						}
					}
					/*** 건수 업데이트 관련 소스 ***/
					
					// 목록이 없을 때
					if(detail_alarm_json.length === 0){
						$("#detail_alarm_count_wrap").hide();
					} else {
						$("#detail_alarm_count_wrap").show();
					}
					
					
					// 검색 결과가 있을 때
					for( var i = 0; i < detail_alarm_json.length; i++){
						
						var item = detail_alarm_json[i];
						var disp_sender_nm = (gap.curLang == "ko" ? item.send.nm : item.send.enm);
						var date = gap.convertGMTLocalOnlyDate(item.dt);
						
					//	var dis_date = gap.change_date_default(gap.convertGMTLocalOnlyDate(item.dt));
						var dis_only_date = gap.change_date_default(gap.convertGMTLocalOnlyDate(item.dt));
						var dis_date = gap.convertGMTLocalDateTime_new(item.dt)
						var cnt = $("#all_alarm_dis_" + date).length;		
						var html = "";
						
						// admin 이름 처리
						if (disp_sender_nm == "CN=admin/O=daesang"){
							disp_sender_nm = (gap.curLang == "ko" ? "관리자" : "Admin");
						}
						
						if (cnt == 0){
							html += "<div id='all_alarm_dis_" + date + "' class='ul_title_wrap'><span class='ul_title'>" + dis_only_date + "</span></div>";
						}

						html += "<div class='detail_alarm_ul'>";
						html += "	<div id='alarm_li_" + item.id + "' class='detail_alarm_li" + (item.read == "N" ? " unread" : "") + "'>";
					//	html += "		<div class='datail_alarm_img' style='background-image: url(" + detail_alarm_json[i].list[j].emp_img + ")'></div>";
						html += "		<div class='detail_alarm_info_box'>";
						html += "			<div class='detail_alarm_title_box_wrap'>";
						html += "				<div class='detail_alarm_title_box'>";
						html += "					<div class='emp_name_wrap'>";
						html += "						<span class='emp_name' data-ky='" + item.send.ky + "' title='" + disp_sender_nm + "'>" + disp_sender_nm + "</span>";
					//	html += "						<span class='emp_duty'>" + detail_alarm_json[i].list[j].emp_duty + "</span>";
						html +=	"					</div>";
					//	html += "					<span class='vertical_bar'></span>";
					//	html += "					<span class='emp_dept'>" + detail_alarm_json[i].list[j].emp_dept + "</span>";
						html += "				</div>";
						html += "				<div class='detail_alarm_time_wrap'>";
						html += "					<span class='detail_alarm_time'>" + dis_date + "</span>";
					//	html += "					<div class='arrow_right_ico'></div>";
					//	html += "					<button type='button' class='btn_detail_alarm_li'>";
					//	html += "						<span class='btn_ico'></span>";
					//	html += "					</button>";
						html += "				</div>";
						html += "			</div>";
						html += "			<div class='detail_alarm_desc'>" + gAct.message_check(item.msg) + "</div>";
						html += "		</div>";
						html += "	</div>"; //detail_alarm_li			
						html += "</div>";
						
						$("#detail_all_alarm").append(html);
						$("#alarm_li_" + item.id).data("info", item);
						$("#alarm_li_" + item.id).data("read", item.read);
						$("#alarm_li_" + item.id).data("nid", nid);
					}
					
					//if(qry === ""){
						/*** 무한스크롤 ***/
						if (observer) {
							// 기존 감시 중지
							observer.disconnect();
						}
						
						// 감지할 요소
						var lastItem = $("#detail_all_alarm").find(".detail_alarm_ul").last()[0]; // 마지막 요소 선택
						if (!lastItem) return;
						
						observer = new IntersectionObserver(entries => {
							
							if (entries[0].isIntersecting) {
								
								/// 리스트에 스크롤이 있는지 체크하는 변수
								var hasScroll = $("#detail_all_alarm")[0].scrollHeight > $("#detail_all_alarm")[0].clientHeight;
								
								// 리스트에 스크롤이 있을 때만 데이터 요청
								//if( hasScroll && !is_scroll_end) {
								if( hasScroll ) {
									//console.log(">>>>>>>>>>>>>>> 스크롤을 통한 새 알림 이력 데이터 요청");
									list_load("add");
								}

							}
							
						}, { root: $("#detail_all_alarm")[0], threshold: 0 } );
						
						observer.observe(lastItem); // 마지막 요소 감시 시작
						/*** 무한스크롤 ***/
					//}
					
					//사용자 정보 표시
					$('.emp_name').off().on("click", function(e){

						var el = $(this);
						
						if(el.data("ky") !== ""){
							e.stopPropagation();
						}
						
						gAct.show_user_profile(el);
					});
					
					// 이벤트 처리
					$(".detail_alarm_li").off().on('click', function(){
						var el = $(this);
						var read = el.data("read");
						var info = el.data("info");
						var nid = el.data("nid");
						var rid = info.rid;
						var lnk = info.lnk;
						var id = info.id;
						var data = [];

						gAct.alarm_content_popup(nid, rid, info);
						
						// 읽음 처리
						if (read == "N"){
							if (nid == "kp_chat"){
								// 채팅방은 rid 갯수만큼 읽음 처리
								var rid_list = $(".detail_alarm_li").filter(function(){
									var _info = $(this).data('info');
									return _info.rid === rid;
								});
								rid_list.each(function(idx, ele){
									var _info = $(this).data('info');
									data.push(_info.id);
								});
								
							}else if (nid == "kp_channel"){
								// 업무방은 per_key까지 체크
								var per_key = info.ex.per_key;
								
								if (per_key == ""){
									// 공유 업무방
									var rid_list = $(".detail_alarm_li").filter(function(){
										var _info = $(this).data("info");
										return _info.rid === rid;
									});
									rid_list.each(function(idx, ele){
										var _info = $(this).data("info");
										data.push(_info.id);
									});
									
								}else{
									// 과제관리
									var per_key_list = $(".detail_alarm_li").filter(function(){
										var _info = $(this).data("info");
										return _info.ex.per_key === per_key;
									});
									per_key_list.each(function(idx, ele){
										var _info = $(this).data("info");
										data.push(_info.id);
									});
								}
								
							}else{
								data.push(id);
							}

							var postData = {
									"ty" : "data",
									"nid" : nid,
									"ex" : (typeof(info.ex) != "undefined" ? info.ex : {}),
									"data" : data
								};
							var url = gAct.rp + "/noti/alarm/confirm";
							$.ajax({
								type : "POST",
								url : url,
								dataType : "json",
								data : postData,
								beforeSend : function(xhr){
									xhr.setRequestHeader("auth", gap.get_auth());
								},
								success : function(res){
									if (res.result == "success"){
										var unread_cnt = $("#list_unread_count").html();
										unread_cnt = parseInt(unread_cnt) - data.length;
										if (unread_cnt < 0){
											unread_cnt = 0;
										}
										$("#list_unread_count").html(unread_cnt);
										
										// 읽음 처리
										$(data).each(function(idx, val){
											var _el = $("#alarm_li_" + val);
											_el.data("read", "Y");
											_el.removeClass("unread");
										});
									}
								},
								error : function(e){
								}
							});
						}
					});
					
					// 알림 세부 리스트 이벤트 함수 호출
					gAct.detail_all_alarm_event_bind("mail");				
				},
				error : function(e){
				}
			});
		}
	},

	
	//// 알림 세부 리스트 이벤트 함수
	"detail_all_alarm_event_bind": function(type){
		/// 리스트에서 알림 지우기
		$("#detail_all_alarm .btn_detail_alarm_li").off().on("click", function(e){
			e.stopPropagation();
			
			$(this).closest(".detail_alarm_li").addClass("remove");
			
			var $this_count = Number($(this).closest('.detail_alarm_li').find(".alarm_count").text());
			setTimeout(function(){
				$(".detail_alarm_li.remove").remove();

				for(var i = 0; i < $(".detail_alarm_ul").length; i++){
					/// 리스트가 없는 날짜 제거
					if($("#detail_all_alarm .detail_alarm_ul").eq(i).find(".detail_alarm_li").length === 0){
						$("#detail_all_alarm .detail_alarm_ul_box").eq(i).remove();
					}
				}
				if(type === "mail"){
					$("#list_unread_count").text($(".detail_alarm_li.unread").length);
				}
				if(type === "chat"){
					var total = Number($("#list_unread_count").text());
					$("#list_unread_count").text(total - $this_count);
				}
			}, 250);
		});

	},
	
	"open_modal_layer": function(html){
		$("#modal").append(html);
		$("#modal").fadeIn(150);
		
		$("#alarm_ul .alarm_box").addClass("no_scroll");
	},
	
	"close_modal_layer": function(html){
		$("#modal").fadeOut(150, function(){
			$("#modal").empty();
			
			/// 레이어를 띄우면서 추가했던 스크롤 없애는 class를 다시 제거하여 되돌린다.
			$("#alarm_ul .alarm_box").removeClass("no_scroll");
		});
	},
	
	/// 메인 미확인 건 수 종모양 아이콘 툴팁 표시 함수
	"draw_main_alarm_bell_tooltip": function(target, flag){
		
		// 대상의 위치와 크기
        var offset = target.offset();
        var width = target.outerWidth();
        var height = target.outerHeight();

        // 중앙 좌표 계산
        var centerX = (offset.left + width / 2 - 30).toFixed(0);
        if(flag === "toggle"){
        	/// 꺼진 상태에서 켜졌을 때는 2를 더한다. → 마우스를 올리면서 아이콘의 크키가 변하기 때문
        	centerX = (offset.left + width / 2 - 30 + 2).toFixed(0);
        }
        var centerY = (offset.top + height / 2 + 25).toFixed(0);

		var html = "";
		
		var data = gAct.env_data;
		var nid = target.closest(".alarm_li_wrap").find(".alarm_li").data("nid");
		
		var fst_tooltip = "";
		var nst_tooltip = "";
		var pst_tooltip = "";
		
		//작업표시줄
		if(data.fsh === "Y"){
			fst_tooltip = "ON";
		} else {
			//if(data.fst.includes(nid) || (data.fst.length === 0 && data.fsh === "N")){
			if( data.fst.includes(nid) ){
				fst_tooltip = "OFF";
			} else {
				fst_tooltip = "ON";
			}
		}
		
		//알림창
		if(data.noti === "Y"){
			nst_tooltip = "ON";
		} else {
			if( data.nst.includes(nid) ){
				nst_tooltip = "OFF";
			} else {
				nst_tooltip = "ON";
			}
		}

		//모바일
		if(data.psh === "Y"){
			pst_tooltip = "ON";
		} else {
			if( data.pst.includes(nid) ){
				pst_tooltip = "OFF";
			} else {
				pst_tooltip = "ON";
			}
		}
		
		//전부 ON이면 툴팁 표시 안함
		if(fst_tooltip === "ON" && nst_tooltip === "ON" && pst_tooltip === "ON"){
			return false;
		}
		
		html += "<div id='alarm_li_bell_tooltip' style='left: " + centerX + "px; top: " + centerY + "px;'>";
		
		///// 켜진 알림 정보 ////
		html += "<div class='alarm_info_box'>";
		html += "	<div>" + gap.lang.taskbar + " : " + fst_tooltip + "</div>";
		html += "	<span> / </span>";
		html += "	<div>" + gap.lang.noti + " : " + nst_tooltip + "</div>";
		html += "	<span> / </span>";
		html += "	<div>" + gap.lang.mobile + " : " + pst_tooltip + "</div>";
		html += "</div>";
		///// 켜진 알림 정보 ////
		
		html += "</div>";
		
		$("body").append(html);
	},

	"message_check" : function(msg){
		var message = msg;		
		message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');		
	//	message = message.replace(/[\n]/gi, "<br>");
		message = message.replace(/[\n]/gi, "-=spl=-");
		message = message.replace(/\s/gi, "&nbsp;");
		message = message.split("-=spl=-")[0];
		return message;
	},
	
	"alarm_content_popup" : function(nid, rid, info){
		// PC일때
		var url = "";
		var link = (typeof(info.lnk) != "undefined" ? info.lnk : info.data.lnk);

		var exJson;
		if (info.ex && typeof(info.ex) == "string"){
			exJson = {};
			
		    // 'ex' 데이터를 JSON으로 변환
		    var exString = info.ex;
		    
		    // key-value 쌍을 JSON으로 변환
		    exString.replace(/^{|}$/g, '').split(',').forEach(function(pair) {
		        var parts = pair.split(':');
		        var key = parts[0].trim();
		        var value = parts[1] ? parts[1].trim() : "";
		        exJson[key] = value;
		    });				
		}else{
			exJson = info.ex;
		}

		if (nid == "kp_chat"){
		//	url = "./chat?readform&key=" + $.base64.encode(rid) + "&callfrom=alarm";
			gap.chatroom_create_after2(rid);
			return;
			
		}else if (nid == "kp_channel"){
		//	url = "./chat?readform&channel&" + rid + "&alarm&" + (exJson.per_key ? exJson.per_key : "");
			gap.channel_enter_popup(rid);
			return;
			
		}else if (nid == "kp_files"){
		//	url = "./chat?readform&drive&" + rid;
			url = "/v/files";
			
		}else if (nid == "approval" && link != ""){
		//	url = link;	//gAct.change_rp_server(link);
			if (link.indexOf("-=server-host=-") > -1){
				url = link.replace("-=server-host=-", location.protocol + '//' + location.host);
			}else{
				url = location.protocol + '//' + location.host + link;
			}
			url = url + "&callFrom=alarm";
			
		}else if (nid == "calendar" && link != ""){
			if (link.indexOf("-=server-host=-") > -1){
				url = link.replace("-=server-host=-", location.protocol + '//' + location.host);
			}else{
				url = location.protocol + '//' + location.host + link;
			}
			url = url + "&alarmportal=T";			
			
		}else{
			if (link.indexOf("/XML_Inbox/") > -1 || link == ""){
				var mail_host = (gap.isDev ? location.host.replace("dev.", "one.") : location.host);
				url = location.protocol + '//' + mail_host + "/" + maildbpath + "/XML_Inbox/" + rid + "?Opendocument&viewname=XML_Inbox&folderkey=&opentype=popup&relatedyn=N&readtype=alarm_popup";
												
			}else{
				url = link;	//gAct.change_rp_server(link);
			}	
		}
		gap.open_subwin(url, "1200","850", "yes" , "", "yes")	
	},
	
	//////영문+숫자 조합하여 무작위로 12자리 반환하는 함수 ////////
	"generateUniqueId": function() {
		var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	    var uniqueId = '';
		for (var i = 0; i < 12; i++) {
			const randomIndex = Math.floor(Math.random() * chars.length);
			uniqueId += chars[randomIndex];
		}
		return uniqueId;
	}
}