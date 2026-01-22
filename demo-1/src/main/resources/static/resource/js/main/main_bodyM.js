/*
 특정 채널방에 들어가는 함수 : gBodyM.load_channel('64915816b618c91ae489a2d1','테스트', '')
 */

function gBodyM(){
	this.start = 0;
	this.perpage = 10;
	this.cur_opt = ""; //현재 열려 있는 컨텐트가 무엇인가? "allcontent" : 전체 보기 , "mycontent" : 내가올린 컨텐츠 , "sharecontent" : 공유된 컨텐츠 , "favoritecontent" : 즐겨착기, "channel_code" : 특정 채널
	this.cur_name = "";
	
	this.islast = "F";
	
	this.popup_status = "";
	this.isFirst = "T";
	this.scrollT = 0;
	
	this.select_channel_code = "";
	this.select_channel_name = "";
	this.select_files_tab = false;  // files 탭 클릭 여부
	
	this.cur_channel_list_info = ""; //현재 가입된 채널의 정보 배열
	
	//type : 1 : 즐겨찾기  / 2 : 상세보기 / 3 : URL 복사 / 4 : 드라이브 등록   / 5 : 미리보기 / 6 : 다운로드  / 7 : 이동하기 / 8 : 삭제하기
	this.cur_more_click_opt = "";    //현재 클릭한 메뉴가 무엇인지 체크한다.
	this.cur_select_info = "";       //메뉴에서 값을 받아서 실제 처리하기 위해서 기본 값을 저장하고 있는다.
	this.cur_select_display = "";    //메뉴창에 사용자 정보를 넘기는 용도로 사용한다.
	
	this.cur_user_email = "";
	this.q_str = "";   //검색어가 있는 경우 설정한다.
	
	this.target_id = "";   //상세보기에서 현재 선택된 내용의 channel_id
	this.target_name = "";  //상세보기에서 현재 선택된 내용의 channel_name
	
	this.layer_list = ['create_channel_layer', 'move_file_layer', 'drive_fileupload_layer', 'exit_info_layer', 'preview_img', 'preview_video', 'todo_content_layer'];
	
	this.cur_msg_list = [];
	this.cur_select_images = "";
	
	this.prevent_auto_scrolling = "1";	//(localStorage.getItem('prevent_auto_scrolling') == null ? "2" : localStorage.getItem('prevent_auto_scrolling'));
	this.collapse_reply = "2";	//(localStorage.getItem('collapse_reply') == null ? "2" : localStorage.getItem('collapse_reply'));	
	this.post_view_type = "1";	//(localStorage.getItem('post_view_type') == null ? "1" : localStorage.getItem('post_view_type'));
	this.push_receive = "1";
	this.collapse_editor = "2";
	
	this.is_mention = "";
	this.is_receive_draw_reply = false;	//소켓으로 받아 댓글 그리는거 초기화
	
	
} 



gBodyM.prototype = {
	"init" : function(){
	
		//로딩이 완료 되면 폰으로 함수를 호출하라고 넘겨준다.
//	gap.gAlert("로딩완료2222");
//		setTimeout(function(){
//			gap.gAlert("로딩완료");
//			gBodyM.init_phone_call();
//		}, 2000);
	//	gBodyM.init_phone_call();
		
	
		gBodyM.user_lang_set();
	
		gBodyM.all_close_layer();
//		gBodyM.load_channel_list_info();

	},
	
	"user_lang_set" : function(){
		
		var lan = "";
		if (typeof(gap.etc_info.ct) != "undefined"){
			lan = gap.etc_info.ct.lg;
		}else{
			lan = userlang;
		}
		if ( (lan == "") || (typeof(lan) == "undefined")){
			lan = gap.curLang;
		}else{
			gap.curLang = lan;
		}
		
		if (typeof(mobile_lang) != "undefined"){
			lan = mobile_lang;
			gap.curLang = lan;
		}
		
		gBodyM.cur_user_email = gap.userinfo.rinfo.em;
				
		$.ajax({
			method : "get",
			url : cdbpath + "/lang/m_" + lan + ".json?open&ver="+jsversion,
		//	url : cdbpath + "/lang/m_" + lan + ".json",
			dataType : "json",			
			contentType : "application/json; charset=utf-8",
			async : false,
			success : function(data){	
				gap.lang = data;					
				//$("#dis").html("사용자 계정 : " + gap.userinfo.userid + " / 접속한 사용자 언어 : " + gap.userinfo.userLang + " / loading Title : " + gap.lang.title);
				
				
				
								
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	
	"data_load" : function(opt, q_str){
//	"data_load" : function(opt){
		
		// 채널 설정 전역변수 설정
		
		
		var surl = gap.channelserver + "/channel_options_read.km";
		var postData = {
				"email" : gap.search_cur_ky(),
				"key" : opt
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text",	//"json",
			data : JSON.stringify(postData),
			async : false,
			success : function(__res){
				var res = JSON.parse(__res);
				if (res.result == "OK"){
					gBodyM.prevent_auto_scrolling = (res.data.opt1 != "" ? res.data.opt1 : "1");
					gBodyM.collapse_reply = (res.data.opt2 != "" ? res.data.opt2 : "2");
					gBodyM.post_view_type = (res.data.opt3 != "" ? res.data.opt3 : "1");
					gBodyM.push_receive = (res.data.opt4 != "" ? res.data.opt4 : "1");
					gBodyM.collapse_editor = (res.data.opt5 != "" && typeof(res.data.opt5) != "undefined" ? res.data.opt5 : "2");
				}
			
			//	console.log("gBodyM.prevent_auto_scrolling : " + gBodyM.prevent_auto_scrolling);
			//	console.log("gBodyM.collapse_reply : " + gBodyM.collapse_reply);
			//	console.log("gBodyM.post_view_type : " + gBodyM.post_view_type);
			},
			error : function(e){
			}
		});
		
		gBodyM.select_files_tab = false;
		gBodyM.cur_opt = opt;
		gBodyM.q_str = q_str;
		
		$("#dis").empty();
		var html = "<div class='wrap' style='height: calc(100% - 20px)'>";
		html += "<section id='channel_list' >";		
		html += "</section>";
		html += "</div>";
		
		$("#dis").html(html);
		
		gBodyM.start = 0;
		gBodyM.islast ="F";
		if (opt == 1){
			gBodyM.cur_opt = "allcontent";
			gBodyM.cur_name = gap.lang.allcontent;
		}else if (opt == 2){
			gBodyM.cur_opt = "mycontent";
			gBodyM.cur_name = gap.lang.mycontent;
		}else if (opt == 3){
			gBodyM.cur_opt = "sharecontent";
			gBodyM.cur_name = gap.lang.sharecontent;
		}else if (opt == 4){
			gBodyM.cur_opt = "allmention";
			gBodyM.cur_name = gap.lang.mention;
		}
		gBodyM.select_channel_code = "";
		gBodyM.draw_channel_list();	
	},
	
	
	"search_my_channel_list" : function(){
		var list = "";		
		
		var infos = gBodyM.cur_channel_list_info;
		if (infos == ""){
			gBodyM.load_channel_list_info();
			infos = gBodyM.cur_channel_list_info;
		}
		
		for (var i = 0 ; i < infos.length; i++){
			var info = infos[i];
			if (typeof(info.type) != "undefined" && info.type == "folder"){
				// do nothing...
			}else{
				if (list == ""){
					list = info.ch_code;
				}else{
					list = list + "-spl-" + info.ch_code;
				}
			}
		}
		gBodyM.select_channel_code = list;
	},
	
	
	"load_channel" : function(id, name, q_str, is_mention){
	//"load_channel" : function(id, name){
		$("#dis").empty();
		
		//if (name.indexOf('AP-ON 운영팀') > -1) {gap.gAlert(1)}
		
		// 채널 설정 전역변수 설정		
		var surl = gap.channelserver + "/channel_options_read.km";
		var postData = {
				"email" : gap.search_cur_ky(),
				"key" : id
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text",	//"json",
			data : JSON.stringify(postData),
			async : false,
			success : function(__res){
				var res = JSON.parse(__res);
				if (res.result == "OK"){
					gBodyM.prevent_auto_scrolling = (res.data.opt1 != "" ? res.data.opt1 : "1");
					gBodyM.collapse_reply = (res.data.opt2 != "" ? res.data.opt2 : "2");
					gBodyM.post_view_type = (res.data.opt3 != "" ? res.data.opt3 : "1");
					gBodyM.push_receive = (res.data.opt4 != "" ? res.data.opt4 : "1");
					gBodyM.collapse_editor = (res.data.opt5 != "" && typeof(res.data.opt5) != "undefined" ? res.data.opt5 : "2");
				}
			},
			error : function(e){
			}
		});
		
		//현재 채널의 정보를 가져와서 세팅한다.
		var cinfo = gap.search_channel_info(id);
		gap.cur_channel_info = cinfo.responseJSON.data;

		
		//지금 읽은 채널의 마지막 접속 기록을 업데이트 한다.
		gBodyM.channel_read_update(id);
		
		gBodyM.select_files_tab = false;
		gBodyM.cur_opt = id;
		gBodyM.cur_name = name;
		gBodyM.q_str = q_str;
		gBodyM.is_mention = (typeof is_mention != "undefined" && is_mention == "T" ? "T" : "F");
		
		// 신규 생성된 채널에 들어온 경우 해당 채널 코드정보가 전역변수에 없으면 초기화 시킨다. ///////////////
		var is_exist = false;
		for (var i = 0; i < gBodyM.cur_channel_list_info.length; i++){
			var info = gBodyM.cur_channel_list_info[i];
			if (info.ch_code == id){
				is_exist = true;
				break;
			}
		}

		if (!is_exist){
			gBodyM.cur_channel_list_info = "";
		}
		//////////////////////////////////////////////////////////////////
		
	//	$("#dis").empty();
		var html = "<div class='wrap' style='height: calc(100% - 20px)'>";
		html += "<section id='channel_list' >";		
		html += "</section>";
		html += "</div>";
		
		$("#dis").html(html);
		
		
		gBodyM.start = 0;
		gBodyM.islast ="F";

		gBodyM.select_channel_code = id;
		gBodyM.draw_channel_list();	

	},
	
	"draw_channel_list" : function(){
			
		
		gBodyM.close_all();
		$("dis").empty();
		//console.log("............... draw_channel_list ..............")
		id = gBodyM.cur_opt;
		
		gBodyM.select_files_tab = false;
		
		var query_str = "";
		var filter = "";
		
		if (id == "allcontent"){
			var list = gBodyM.search_my_channel_list();
			query = JSON.stringify({
				"channel_code" : gBodyM.select_channel_code,
				"query_type" : "allcontent",
				"start" : gBodyM.start,
				"perpage" : gBodyM.perpage,
				"q_str" : gBodyM.q_str,
				"dtype" : filter,
				"type" : "1",
				"sort" : gBodyM.post_view_type
			});
		}else if (id == "mycontent"){
			var list = gBodyM.search_my_channel_list();
			query = JSON.stringify({
				"channel_code" : gBodyM.select_channel_code,
				"query_type" : "mycontent",
				"start" : gBodyM.start,
				"perpage" : gBodyM.perpage,
				"q_str" : gBodyM.q_str,
				"dtype" : filter,
				"type" : "1",
				"sort" : gBodyM.post_view_type
			});
		}else if (id == "sharecontent"){
			var list = gBodyM.search_my_channel_list();
			query = JSON.stringify({
				"channel_code" : gBodyM.select_channel_code,
				"query_type" : "sharecontent",
				"start" : gBodyM.start,
				"perpage" : gBodyM.perpage,
				"q_str" : gBodyM.q_str,
				"dtype" : filter,
				"type" : "1",
				"sort" : gBodyM.post_view_type					
			});	
		}else if (id == "allmention"){
			var list = gBodyM.search_my_channel_list();
			query = JSON.stringify({
				"channel_code" : gBodyM.select_channel_code,
				"query_type" : "allmention",
				"start" : gBodyM.start,
				"perpage" : gBodyM.perpage,
				"q_str" : gBodyM.q_str,
				"dtype" : filter,
				"type" : "1",
				"sort" : gBodyM.post_view_type
			});			
		
		}else{
			
			var m_r_t = gBodyM["last_read_time_" + gBodyM.select_channel_code];			
//			var m_r_t = "";
//			if (typeof(lrt) != "undefined"){
//				m_r_t = lrt;
//			}else{
//				gBodyM.check_cur_channel_read_time(gBodyM.select_channel_code);
//				m_r_t = gBodyM["last_read_time_" + gBodyM.select_channel_code];	
//			}
			
			
			query = JSON.stringify({
				"channel_code" : gBodyM.select_channel_code,
				"query_type" : (gBodyM.is_mention == "T" ? "mention" : ""),
				"start" : gBodyM.start,
				"perpage" : gBodyM.perpage,
				"q_str" : gBodyM.q_str,
				"dtype" : filter,
				"type" : "1",
				"sort" : gBodyM.post_view_type,
				"read_time" : m_r_t
			});
		}

		if (gBodyM.start == 0){
			gBodyM.cur_msg_list = [];
		}

		var url = gap.channelserver + "/channel_list.km";
		$.ajax({
			type : "POST",
			dataType : "text",
		//	dataType : "json",
		//	contentType : "application/json; charset=utf-8",
			async : false,
			data : query,
			url : url,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(ress){
				$("#channel_list").css({opacity:0})
				var res = JSON.parse(ress);
				
				
				if (res.data == null){
					if (query_str != ""){							
						//gap.gAlert(gap.lang.searchnoresult);
					}
					//$("#channel_list").empty();
				}else{
					var list = res.data.data;			
					var html = "";
					if (list.length == 0){
						gBodyM.mobile_finish();
						if (gBodyM.start == 0){			
							//Files탭을 클릭한 상태에서 좌측에 메인 메뉴를 클릭한경우 데이터가 없으면 별도로 처리해 줘야 한다.
							
							var htm = "";
							htm += "<div class='wrap box-empty'>";
							htm += "	<dl>";
							htm += "		<dt><span class='ico no-box'></span></dt>";
							htm += "		<dd>"+gap.lang.nocontent+"</dd>";
							htm += "	</dl>";
							htm += "</div>";
							
							$("#channel_list").html(htm);
							
							
							
							
						}
						gBodyM.islast= "T";
						$("#channel_list").css({opacity:1})
						
						//등록하는 입력창을 권한에 따라 숨겨야 한다.
						
						var is_write_auth = gap.checkAuth();
						if (is_write_auth){
							gBodyM.show_input("T");
						}else{
							gBodyM.show_input("F");
						}
						
						return false;
					}else{
						//gBodyM.cur_msg_list = $.merge(list, gBodyM.cur_msg_list);
						gBodyM.cur_msg_list = $.merge($.merge([],list), gBodyM.cur_msg_list);
//						try{
//						    !!$("#channel_list").data("mCS") && $("#channel_list").mCustomScrollbar("destroy"); //Destroy
//						}catch (e){
//						    $("#channel_list").data("mCS",''); //수동제거
//						}
					}
					
					
					//현재 채널에 마지막 접속한 시간을 가져온다.
					if (typeof(res.unread_count) != "undefined"){
						gBodyM["unread_count_" + gBodyM.select_channel_code] = parseInt(res.unread_count);
					}
					var my_last_read_time = gBodyM["last_read_time_" + gBodyM.select_channel_code];
					var draw_unread_line = false;
					gBodyM.cur_channel_unread_line_draw = false;
					
					

					var is_write_auth = "T";
					if (!gap.check_top_menu_new()){
						//일반 채널일 경우'
						var write_auth = gap.checkAuth2(gBodyM.cur_opt);
						if (!write_auth){
							is_write_auth = "F";
						}
					}
					
					
					for (var i = 0 ; i < list.length; i++){
						var item = list[i];
						
						//어디까지 조회 했는지 체크하는 모듈.////////////////////////////////////					
						var cxtime = item.GMT2;
						
						if (my_last_read_time < cxtime){
							draw_unread_line = true;
							gBodyM.cur_channel_unread_line_draw = true;
						}
						/////////////////////////////////////////////////////////
						
						var date = "";
						var dis_date = "";
						if (gBodyM.post_view_type == "2"){
							date = gap.change_date_localTime_only_date(item.GMT2);
							dis_date = gap.change_date_default(gap.change_date_localTime_only_date(item.GMT));
						}else{
							date = gap.change_date_localTime_only_date(item.GMT);
							dis_date = gap.change_date_default(gap.change_date_localTime_only_date(item.GMT));
						}
					//	var date = gap.change_date_localTime_only_date(item.GMT);
			
						var cnt = $("#web_channel_dis_" + date).length;
						//var dis_date = gap.change_date_default(gap.search_today_only3(item.GMT));					
						
						
						var dis_id = "date_" + date;
						
						
						var datehtml = "";
						if (cnt == 0){			
							datehtml += "<div class='wrap-channel' >";
							datehtml += "<div class='date' id='web_channel_dis_"+date+"' data='"+date+"'><span>"+dis_date+"</span></div>";
							datehtml += "</div>";
				
							var cnt = $(".wrap-channel").length;
							if (cnt > 0){
								//기존에 날짜가 있는 경우
								//$(datehtml).insertBefore($("#channel_list").children().first());
								$($("#channel_list").children().first()).before(datehtml);
							}else{
								//기존에 날짜가 없는 경우
								$("#channel_list").append(datehtml);
							}
						}
						
						if (item.type == "msg"){							
							var html = gBodyM.draw_msg(item, "msg", date, is_write_auth);
							//$(html).insertAfter("#web_channel_dis_"+date);
							$("#web_channel_dis_"+date).after(html);
						}else if (item.type == "file"){							
							var html = gBodyM.draw_file(item, date, is_write_auth);
							//$(html).insertAfter("#web_channel_dis_"+date);
							$("#web_channel_dis_"+date).after(html);
						}else if (item.type == "emoticon"){							
							var html = gBodyM.draw_msg(item, "emoticon", date, is_write_auth);
							//$(html).insertAfter("#web_channel_dis_"+date);	
							$("#web_channel_dis_"+date).after(html);
						}
						
						
						
						var totalpage = gBodyM.start + gBodyM.perpage;
						var ucount = parseInt(gBodyM["unread_count_" + gBodyM.select_channel_code]);
						var mp = "";
						if (totalpage >= ucount ){
							mp = gap.lang.readline;
							
						}else{
							mp = gap.lang.upreadline;
						}
						if (draw_unread_line){
							
							//여기까지 읽어다는 표시해주기
							$("#read_time_check").remove();
							//var html2 = "<div id='read_time_check' class='read_line' style='border:2px solid red; width:100%; margin-top:10px; text-align:center'>"+mp+"</div>";
							var html2 = "<div id='read_time_check' class='read-line' ><span>"+mp+"</span></div>"
							$(html2).insertAfter("#web_channel_dis_"+date);
							draw_unread_line = false;						
						}						
					}					
				}

				gBodyM.image_css_change();

				if (gBodyM.start == 0){
					
					try{		
						gBodyM.isFirst = "F";						
						if ($("#read_time_check").length > 0){								
							setTimeout(function(){
								var he = $("#read_time_check").position().top;
								$('html, body').animate({ scrollTop: he }, 0 , function(){
									$("#channel_list").css({opacity:1})
									gBodyM.mobile_finish();
								});
							}, 900);
							
						}else{							
							setTimeout(function(){
								$('html, body').animate({ scrollTop: $(document).height() }, 0 , function(){
									$("#channel_list").css({opacity:1})
									gBodyM.mobile_finish();
								});
							}, 900);
						}			
					}catch(e){}		
					

					
				}else{				
					//alert(gBodyM.scrollT);
					//$('html, body').animate({ scrollTop: (gBodyM.scrollT)}, 1000);
//					if ($("#read_time_check").length > 0){								
//						setTimeout(function(){
//							var he = $("#read_time_check").position().top;
//							$('html, body').animate({ scrollTop: he }, 0 , function(){								
//								//gBodyM.mobile_finish();
//							});
//						}, 900);
//					}
					
					$("#channel_list").css({opacity:1})
				}							

				
				if (gBodyM.q_str != ""){
					$(".wrap-message p").highlight(gBodyM.q_str);
					$(".wrap-message h3").highlight(gBodyM.q_str);
					$(".chat-attach dt").highlight(gBodyM.q_str);
				}
	
				gBodyM.__event_init_load();				
				
				gBodyM.__draw_reply_event();  //댓글관련 컨텍스트 메뉴 적용을 위한 함수
				
				$("table").css("width", "auto");
				
				//등록하는 입력창을 권한에 따라 숨겨야 한다.
				var is_write_auth = gap.checkAuth();
				if (is_write_auth){
					gBodyM.show_input("T");
				}else{
					gBodyM.show_input("F");
				}
				
				return false;	
				
			},
			error : function(e){
				gap.error_alert();
			}
		})
	},
	
	
	
	"channel_addContent" : function(){
		
		//마지막 채팅의 id값을 가져다기 그 이전 값을 구해 온다.		
		if (gBodyM.islast == "T"){
		//	$("#channel_list").css({opacity:1})
			return false;
		}	
		var new_start = parseFloat(gBodyM.start) + parseFloat(gBodyM.perpage);
		gBodyM.start = new_start;
		gBodyM.draw_channel_list();
		
		return false;
		
	},
	"image_css_change" : function(){
		// 댓글 UI를 제외한 에디터 상에서 사용하는 Div는 일괄적으로 width를 auto 처리 (웹에디터에서 div width가 강제로 지정된 경우는 Div 안의 이미지에 대한 자동 너비 처리가 안됨)
		// 즉 div를 800px로 하고 그 안의 이미지를 max-width : 100%하면 800px의 100%가 되기 때문에 모바일에서 이미지 너비가 잘려보임
		$(".wrap-message.editor div:not([class])").width("auto"); 
		$(".wrap-message.editor img").css("max-width", "98%");
		$(".wrap-message.editor img").css("height", "auto"); // height auto를 주지 않으면 이미지 너비만 줄이므로 이미지가 깨져보임
		$(".link-content img").css("max-width", "40%");
	},
	"__event_init_load" : function(){
		
		//채널영을 클릭시 해당 채널로 바로 이동한다. 전체 컨텐트, 공유컨텐츠... 에서
		$(".talk .channel-name").off().on("click", function(e){
			var ch_code = $(e.currentTarget).data("chcode");
			var ch_name = $(e.currentTarget).data("chname");
			gap.goto_channel_mobile(ch_code, ch_name);
		});
		
		
		//통합회의에 연결된 회의 내용 클릭하기
		$(".meet_invite").off().on("click", function(e){
			var url_link = "kPortalMeet://NativeCall/goMeet";
			gBodyM.connectApp(url_link);
			return false;
		});
		
		//사용자 사진을 클릭한 경우 사용자 정보를 표시한다.
		$(".user-thumb img").off();
		$(".user-thumb img").on("click", function(e){
			var id = $(this).data("key");
			var url_link = "kPortalMeet://NativeCall/callUserProfile?ky=" + encodeURIComponent(id);
			gBodyM.connectApp(url_link);
			return false;
		});
		
		//멘션을 클릭한 경우 사용자 정보를 표시한다.
		$(".wrap-message mention").off();
		$(".wrap-message mention").on("click", function(e){
			var id = $(this).attr("data");
			var url_link = "kPortalMeet://NativeCall/callUserProfile?ky=" + encodeURIComponent(id);
			gBodyM.connectApp(url_link);
			return false;
		});
		 
		//모바일에서 에디터내의 이미지 사이즈를 폰의 사이즈를 넘지 않게 처리하기 위해서 별도로 처리한다. /////
		//$(".wrap-message.editor img").css("max-width", "98%"); 스크롤 처리 후 UI를 관여해선 안되기 때문에 여기서 수행하지 않고 별도 함수 처리
		
		$(".wrap-message.editor img").off();
		$(".wrap-message.editor img").on("click", function(e){
		
			var url = this.src;
			gBodyM.call_image_view_editor(url); //<==모바일팀에서 개발해 줘야 한다.
		});
		
		///////////////////////////////////////////////////////////
		//$(".link-content img").css("max-width", "40%"); 스크롤 처리 후 UI를 관여해선 안되기 때문에 여기서 수행하지 않고 별도 함수 처리
		
		
		$(".ico.btn-edit").off();
		$(".ico.btn-edit").on("click", function(e){
		//$(".user .btn-edit").off().on("click", function(e){
			//$("body").css("overflow", "hidden");
			
			var channel_code = $(e.currentTarget).data("channel_code");
			var channel_name = $(e.currentTarget).data("channel_name");
			var channel_id =  $(e.currentTarget).data("channel_id");
			var type = $(e.currentTarget).data("ty");
			var ty = $(e.currentTarget).data("type");
			var mention_list = $(e.currentTarget).data("mention");
			
		//	if (mention_list != ""){
		//		gap.gAlert(gap.lang.mention_cannot_edited);
		//		return false;
		//	}
			 		
			var message = "";
			var tobj = "";
			if ($(e.currentTarget).data("type") == "editor"){
				tobj = $(e.currentTarget).parent().find("h3");
				message =  $(e.currentTarget).parent().find("h3").html();
			}else{
			//	tobj = $(e.currentTarget).parent().find("p");
				tobj = $("#cc_" + channel_id);
				message = $(e.currentTarget).parent().find("p").html();
			}
			if (typeof(message) == "undefined"){
				message = "";
			}

		//	if (sabun == "AC928074" || sabun == "AC926455" || sabun == "AC925454" || sabun == "AC925455" || sabun == "AC903453"){
				if (message != ""){
					message = message.replace(/\<br\>/gi, "\n").replace(/&nbsp;/gi," ");
				}
				
				var url_link = "kPortalMeet://NativeCall/callChannelBodyModify?content=" + encodeURIComponent(message) + "&code=" + channel_code + "&ty=" + ty + "&type=" + type + "&id=" + channel_id + "&cname=" + encodeURIComponent(channel_name);
				gBodyM.connectApp(url_link);
				return false;
				
		//	}else{
			/*	$("body").css("overflow", "hidden");
				if (message != ""){
					message = message.replace(/\<br\>/gi, "\n").replace(/&nbsp;/gi," ");
					
					if (message.indexOf("<mention") > -1){
						var mk = $("<span>" + message + "</span>");
						var lk = $(mk).find("mention");
						for (var i = 0 ; i < lk.length; i++){
							var item = lk[i];
							var nam = $(item).text();
							message = message.replace($(item).get(0).outerHTML, nam);
						}
					}
				}
				
				$("#rmtext").val(message);
				
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
						
					var msg = $("#rmtext").val();
					
					var mlist = [];
					if (mention_list.length > 0){
						for (var i = 0; i < mention_list.length; i++){
							var info = mention_list[i];
							var _nm = info.nm;
							var _id = info.id;
							
							if (_nm.indexOf("@") == -1){
								_nm = "@" + _nm;
							}
							
							if (msg.indexOf(_nm) > -1){
								var mhtml = "<mention data='" + _id + "'>" + _nm + "</mention>"
								msg = msg.replace(_nm, mhtml);
								
								mlist.push(info);
							}
						}
					}
						
					var data = JSON.stringify({
						"channel_code" : channel_code,						
						"content" : msg,
						"mention" : mlist,
						"email" : gap.userinfo.rinfo.em,
						"edit" : ty,
						"id" : channel_id,
						"type" : type
					});
						
					var url = gap.channelserver + "/send_msg_edit.km";
					$.ajax({
						type : "POST",
						dataType : "text",   //<<== "json"을  text로 변경한 것은 입력 내용에 ?? 가 2개 이상 있을 경우 JQuery오류가 발생해서 변경함 // 대신 리턴값을 JSON.parse로 처리해야 함
					//	contentType : "application/json; charset=utf-8",
						data : data,
						url : url,
						success : function(ress){
							var resx= JSON.parse(ress);
							if (resx.result == "OK"){
									
								var res = resx.data.docinfo;
								var GMT = resx.GMT;
									
								var doc = new Object();
								doc.GMT = GMT;
								doc.GMT2 = res.GMT2;
								doc.channel_code = channel_code;
								doc.channel_name = channel_name;
								doc.email = gap.userinfo.rinfo.em;
								var jj = JSON.parse(data);
								doc.content = jj.content;
								doc.owner = gap.userinfo.rinfo;
								doc.type = jj.type;
									
								if (typeof(res.title) != "undefined" && res.title != ""){
									doc.title = jj.content;
									doc.editor = res.editor;
									doc.content = ""; //에디터 모드일 경우 content를 제거해야 한다.
								}
								
																												
								doc._id = jj.id;
																			
								doc.direct = "T";										
						//		doc.editor = jj.editor;
						//		doc.title = jj.title;
									
								if (res.type == "emoticon"){
									doc.epath = res.epath;
								}
								
								if (typeof(res.og) != "undefined"){
									doc.og = res.og;
								}
									
								if (typeof(res.ex) != "undefined"){
									//메일 처럼 다른 시스템에서 호출되는 경우 처리한다.
									doc.ex = res.ex;
								}
									
									
								var date = "";
								
								if (gBodyM.post_view_type == "2"){
									date = gap.change_date_localTime_only_date(doc.GMT2);
								}else{
									date = gap.change_date_localTime_only_date(GMT);
								}
									
								var html = "";
									
									
								//html = gBody3.draw_msg(doc, jj.type, date);
								
								//var message = $("#rmtext").val().replace(/[\n]/gi, "<br>");
								var message = msg.replace(/[\n]/gi, "<br>");
								//$(".wrap-message p").html(message);
									
								$(tobj).html(message);
								
								//멘션을 클릭한 경우 사용자 정보를 표시한다.
								$(".wrap-message mention").off();
								$(".wrap-message mention").on("click", function(e){
									var id = $(this).attr("data");
									var url_link = "kPortalMeet://NativeCall/callUserProfile?ky=" + encodeURIComponent(id);
									gBodyM.connectApp(url_link);
									return false;
								});
								
								doc.date = date;
								doc.edit = "T";
								doc.res = res;
								doc.doctype = doc.type;
								
								gBodyM.send_socket(doc, "ms"); 
																
								$("#rmtext").val("");
								$("#rmcancel").click();
								
							}else{
								gap.gAlert(gap.lang.errormsg);
							}
						},
						error : function(e){
							gap.gAlert(gap.lang.errormsg);
						}
					});
					
						
						
				});
				return false;*/			
		//	}
			
		});
		
		
		$(".ico.btn-more").off();
		$(".ico.btn-more").on("click", function(e){
			//모바일 기기에서 호출하는 경우								
			//컨텐츠 id값과 채널명이 있으면 삭제와 상세보기시 기능을 수행 할 수 있다.
			var obj = new Object();
			obj.id = $(e.currentTarget).attr("data4");
			obj.channel_name = $(e.currentTarget).attr("data3");
			obj.channel_code = $(e.currentTarget).attr("data2");
			var fcount = $(e.currentTarget).attr("data5");
			var ky = $(e.currentTarget).attr("data6");
			var etype = $(e.currentTarget).attr("data7");
			var notice = $(e.currentTarget).attr("data8");
			
			var is_del_auth = $(e.currentTarget).attr("data9");
			var is_copy_auth = $(e.currentTarget).attr("data10");
			gBodyM.cur_select_info = obj;
			
			//팝업메뉴에서 정보를 표시하기 위햇 설정한다. /////////////////////////////////////////
			var dis = new Object();
			var ox = $("#ms_" + obj.id);
			dis.img = ox.find(".user-thumb img").attr("src");			
			dis.dept = ox.find(".name em").text();
			dis.name = ox.find(".name").text().replace(dis.dept, "");
			dis.time = ox.find(".time").text();		
			var mm = ox.find(".wrap-message p").first().text();			
			var msg = mm;			
			if (etype == "mail"){
				//내용이 없는 경우 메일 공유자료 인지 찾아본다.
				msg = $("#ms_"+obj.id+" .chat-mail dd").text();				
			}else if (etype == "editor"){
				msg = $("#ms_"+obj.id+" .talk h3").text()
			}else{
				if (msg.indexOf("&lt;/mention&gt;") > -1){
					//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
					msg = gap.textToHtml(msg).replace(/&nbsp;/g, " ");
				}
			}		
			if (msg.length > 40){
				msg = msg.substring(0,40) + "...";
			}
			dis.msg = msg;
			dis.filecount = fcount;
			dis.ky = ky;						
			dis.ch = $(e.currentTarget).attr("data3");				
			var exchange = JSON.stringify(dis).replace(/\&/gi,"and");			
			dis = JSON.parse(exchange);						
			gBodyM.cur_select_display = dis;			
			//////////////////////////////////////////////////////////////////			
			var type = "1";
			var opt = $(e.currentTarget).attr("data");			
			gBodyM.cur_more_click_opt = type;
			
			//복사 버튼을 숨길지 권한 체크한다.
			gBodyM.mobile_app_call(type, opt, notice, is_del_auth, is_copy_auth);	
						
			return false;
		});
		
		$(".img-thumb").off();
		$(".img-thumb").on("click", function(e){
			
				
			var oob = $(e.currentTarget).attr("id").replace("msg_file_","");
			var filename = $(e.currentTarget).attr("data");
			
			//msg_file_5ff6b16307543a6eb2cec97f_490a9fc4c11a60feca9a40ffd11e4060_801555
			var id = oob.split("_")[0];
			var md5 = oob.split("_")[1] + "_" + oob.split("_")[2];
			
			var obj = new Object();
			obj.id = id;
			obj.filename = filename;
			obj.md5 = md5;			
			obj.channel_code = $("#ms_" + id).find(".btn-more").attr("data2");
			obj.channel_name = $("#ms_" + id).find(".btn-more").attr("data3");
			gBodyM.cur_select_info = obj;

			
			//팝업메뉴에서 정보를 표시하기 위햇 설정한다. /////////////////////////////////////////
			var dis = new Object();  //파일명, 작성자, 날짜
			var ox = $("#ms_" + id);
	
			dis.filename = filename;
			dis.dept = ox.find(".name em").text();
			dis.name = ox.find(".name").text().replace(dis.dept, "");			
			dis.date = ox.find(".time").text();
			
			
			var exchange = JSON.stringify(dis).replace(/\&/gi,"and");			
			dis = JSON.parse(exchange);
	
			gBodyM.cur_select_display = dis;
			
			///////////////////////////////////////////////////////////////////
			
//			if ($(e.currentTarget).text() != ""){
//				//여러창이 있을 경우 +5장 등 이미지 위에 특정 텍스트가 있는 경우 상세보기로 이동한다.
//				gBodyM.detail_view(id, obj.channel_code, obj.channel_name);
//			}else{
//				var type = "2";			
//				var opt = $(e.currentTarget).attr("data2");
//				gBodyM.cur_more_click_opt = type
//				
//				gBodyM.mobile_app_call(type, opt, "image");	
//			}
			
			//신규 버전에서는 이미지를 클릭하면 바로 띄워져야 해서 수정한다.
			
			try{
				gBodyM.cur_more_click_opt = "2";
				var opt = $(e.currentTarget).attr("data2");
				var ll = gBodyM.cur_msg_info(id);
				gBodyM.cur_select_images = ll.info;
				var bun = $(this).attr("data3");
				gBodyM.call_image_view(bun, id, opt);	
			}catch(e){
				if ($(e.currentTarget).text() != ""){
					//여러창이 있을 경우 +5장 등 이미지 위에 특정 텍스트가 있는 경우 상세보기로 이동한다.
					gBodyM.detail_view(id, obj.channel_code, obj.channel_name);
				}else{
					var type = "2";			
					var opt = $(e.currentTarget).attr("data2");
					gBodyM.cur_more_click_opt = type
				
					gBodyM.mobile_app_call(type, opt, "image");	
				}
			}
			
	
			
		});
		
		
		$(".message-file li").off();
		$(".message-file li").on("click", function(e){
			
			var oob = $(e.currentTarget).attr("id").replace("msg_file_","");
			var filename = $(e.currentTarget).attr("data");
		
			
			var upload_path = $(e.currentTarget).attr("data3");
			var email = $(e.currentTarget).attr("data4");
			
			
			
			//msg_file_5ff6b16307543a6eb2cec97f_490a9fc4c11a60feca9a40ffd11e4060_801555
			var id = oob.split("_")[0];
			var md5 = oob.split("_")[1] + "_" + oob.split("_")[2];
			
			var obj = new Object();
			obj.id = id;
			obj.filename = filename;
			obj.md5 = md5;			
			obj.channel_code = $("#ms_" + id).find(".btn-more").attr("data2");
			obj.channel_name = $("#ms_" + id).find(".btn-more").attr("data3");
			
			obj.email = email;
			obj.upload_path = upload_path;
			obj.ftype = gap.file_extension_check(filename);
			
			gBodyM.cur_select_info = obj;
			
			//팝업메뉴에서 정보를 표시하기 위햇 설정한다. /////////////////////////////////////////
			var dis = new Object();  //파일명, 작성자, 날짜
			var ox = $("#ms_" + id);
	
			dis.filename = filename;
			dis.dept = ox.find(".name em").text();
			dis.name = ox.find(".name").text().replace(dis.dept, "");			
			dis.date = ox.find(".time").text();
			
			var exchange = JSON.stringify(dis).replace(/\&/gi,"and");			
			dis = JSON.parse(exchange);
	
			gBodyM.cur_select_display = dis;
			
			///////////////////////////////////////////////////////////////////
			
			var type = "2";			
			var opt = $(e.currentTarget).attr("data2");
			gBodyM.cur_more_click_opt = type
			gBodyM.mobile_app_call(type, opt, "file");	
			
		});
		
		
		
		
		$(".fold-btns").off();
		$(".fold-btns").on("click", function(ix){
			
			if ($(this).hasClass("repdis")){
				
				var target = $(this).children().first();
				var tid = target.attr("data");
				var rcount = $("#mr_" + tid + " dl").length;
				if (target.hasClass("btn-reply-fold")){	
					target.removeClass("btn-reply-fold");
					target.addClass("btn-reply-expand");	
					target.find("span").first().text(gap.lang.reply + " " + gap.lang.ex);
					target.find("span").first().next().text(rcount);
					$("#mr_"+tid).fadeOut();
				}else{
					target.removeClass("btn-reply-expand");
					target.addClass("btn-reply-fold");
					target.find("span").first().text(gap.lang.reply + " " + gap.lang.fold);
					target.find("span").first().next().text(rcount);
					$("#mr_"+tid).fadeIn();
				}
			}else if ($(this).hasClass("editor")){
				
				var target = $(this).children().first();
				var tid = $(this).data("key");
				
				var cparent = $("#ms_"+tid);
				
				if (target.hasClass("btn-editor-fold")){	
					target.removeClass("btn-editor-fold");
					target.addClass("btn-editor-expand");	
					target.text(gap.lang.expand_editor);
					$("#ss_"+tid).fadeOut();
					cparent.find(".img-content").css("display", "none");
					cparent.find(".message-file").css("display", "none");
				}else{
					
					target.removeClass("btn-editor-expand");
					target.addClass("btn-editor-fold");
					target.text(gap.lang.collapse_editor);
					$("#ss_"+tid).fadeIn();
					
					cparent.find(".img-content").css("display", "");
					cparent.find(".message-file").css("display", "");
				}
			}else{
				var classname = $(this).parent().find("p").attr("class");
				if (classname == "msg-fold"){
					
					$(this).parent().find("p").removeClass("msg-fold");
					$(this).parent().find("p").addClass("msg-expand");
					$(this).find("span").text(gap.lang.fold);
					$(this).find("button").removeClass("btn-expand");
					$(this).find("button").addClass("btn-fold");
				}else{
				
					$(this).parent().find("p").removeClass("msg-expand");
					$(this).parent().find("p").addClass("msg-fold");
					$(this).find("span").text(gap.lang.expand);
					$(this).find("button").removeClass("btn-fold");
					$(this).find("button").addClass("btn-expand");
				}
			}
			
			
		});
		
		$('.wrap-message a').click(function(event){
			
		     var url = $(this).attr('href');
		     
		     //대상에서 DSDrive를 예외 처리 해야 한다.
		     if (url.indexOf("\/drive.daesang.com") > -1){
		    	 mobiscroll.toast({message:gap.lang.cannot_download, color:'danger'});
				return false;
		     }
		     
		     if (url.indexOf("dsdrive.daesang.com") > -1){
		    	url = url.replace("dsdrive.daesang.com","drive.daesang.com");
		     }
		     
		//     if(url.match(urlWebServer)) {		    	
		        event.preventDefault();
		        gBodyM.url_open(url);
		//     }
		});
		
		$('.req_box button').off().on('click', function(){
			
			var _type = $(this).data('type');
			var _url = "";
			var _title = "";
		
			if (_type == "vote"){
				_url = gap.getBaseUrl() + "mobile?readform&t=vote&k1=" + encodeURIComponent($(this).parent().data('vote')) + "&k2=&k3=response";
				_title = gap.lang.vote;
				
			}else if (_type == "todo"){
				_url = gap.getBaseUrl() + "mobile?readform&t=todo&k1=&k2=" + $(this).parent().data('url') + "&k3=response";
				_title = "To Do"
				
			}else if (_type == "bbs" || _type == "aprv"){
				_url = gap.getHostUrl() + $(this).parent().data('url');
				_title = (_type == "bbs" ? gap.lang.bbs : gap.lang.aprv);
				
				var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(_url) + "&title=" + encodeURIComponent(_title);
				gBodyM.connectApp(url_link);
				
				//gap.gAlert(gap.lang.not_support_mobile);
				return false;
			}else if (_type == "channel_meeting"){
				_url = $(this).parent().data('url');
				_title = "VideoMeeting";				
				var url = "auth?openagent";
				$.ajax({
					type : "GET",
					dataType : "json",
					url : url,
					async : false,
					success : function(res){
						if (res.result == "OK"){
							_url = _url + encodeURIComponent("&auth=" + res.auth);
							var url_link = "kPortalMeet://NativeCall/callUrl?url=" + encodeURIComponent(_url) + "&title=" + encodeURIComponent(_title);
							gBodyM.connectApp(url_link);
						}else{
							gap.gAlert(gap.lang.errormsg);
						}
					},
					error : function(e, res, x, t){
						gap.gAlert(gap.lang.errormsg);	
					}
				})
				
				return false;
			}else if (_type == "normal"){
				var _key = $(this).parent().data('key');
				
				var url_link = "kPortalMeet://NativeCall/callNoticeDetail?id=" + encodeURIComponent(_key);
				gBodyM.connectApp(url_link);
				return false;
			}
			
			if (_url != ""){
				var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(_url) + "&title=" + encodeURIComponent(_title);
				gBodyM.connectApp(url_link);
				return false;
			}
		});
		
		
		gBodyM.__event_reply_file_click();
	},
	
	
	
	
	"__event_reply_file_click" : function(){
		$(".chat-attach .reply-file").off();
		$(".chat-attach .reply-file").on("click", function(e){
			
			var rid = $(e.currentTarget).attr("data6");
			var md5 = $(e.currentTarget).attr("data3");
			var rpath = $(e.currentTarget).attr("data2");
			var fname = $(e.currentTarget).attr("data7");
			var file_type = $(e.currentTarget).attr("data5");
			var owner_ky = $(e.currentTarget).attr("data4");
			var call = "reply";
			
			var fs = gap.channelserver;			
			var ext = gap.is_file_type_filter(fname);
			var ex = gap.file_extension_check(fname);
			
			if (ex == "movie"){
				var fserver = gap.server_check(fs);			
				var vserver = gap.search_video_server(fserver);
				var url = vserver + "/2/" + owner_ky + "/" + rpath + "/" + md5 + "/" + ex;				
				gBodyM.call_preview(url, fname, "video");
			}else if (gBodyM.pp_check(fname)){
				var filePath = gap.synapserver + "\\upload\\" + owner_ky + "\\" + rpath + "\\" + md5 + "." + file_type;	
				
				gap.call_synap(md5, filePath, fname, "TT", call);
			}else{
				gap.gAlert(gap.lang.noconvert);
			}
			
			
		});
	},
	
	
	/*
	 * 업무방 게시글을 공지로 등록
	 */
	"notice_channel_data" : function(key, id){
		var url = gap.channelserver + "/channel_noticedata_save.km";		
		var data = JSON.stringify({
			"id" : id,
			"key" : key,
			"owner" : gap.userinfo.rinfo
		});		
		$.ajax({
			type : "POST",
			dataType : "json",
			data : data,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			url : url,
			success : function(res){
				var item = res.data;
				
				gBodyM.load_channel(gBodyM.cur_opt, gBodyM.cur_name, gBodyM.q_str);
				
				//등록된 공지를 전송한다.
				gBodyM.send_socket(item, "ms");
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});			
	},
	
	
	
	
	/*
	 * 채널 본문을 수정하고 저장
	 */
	"sendModifyMessage" : function(msg, mention_list, channel_code, channel_name, ty, type, channel_id){
		$("body").css("overflow-y", "auto");
		
		var tobj = $("#cc_" + channel_id);
		var data = JSON.stringify({
			"channel_code" : channel_code,						
			"content" : msg,
			"mention" : mention_list,
			"email" : gap.userinfo.rinfo.ky,
			"edit" : ty,
			"id" : channel_id,
			"type" : type
		});
			
		var url = gap.channelserver + "/send_msg_edit.km";
		$.ajax({
			type : "POST",
			dataType : "text",   //<<== "json"을  text로 변경한 것은 입력 내용에 ?? 가 2개 이상 있을 경우 JQuery오류가 발생해서 변경함 // 대신 리턴값을 JSON.parse로 처리해야 함
		//	contentType : "application/json; charset=utf-8",
			data : data,
			url : url,
			success : function(ress){
				var resx= JSON.parse(ress);
				if (resx.result == "OK"){
						
					var res = resx.data.docinfo;
					var GMT = resx.GMT;
						
					var doc = new Object();
					doc.GMT = GMT;
					doc.GMT2 = res.GMT2;
					doc.channel_code = channel_code;
					doc.channel_name = gap.textToHtml(channel_name);
					doc.email = gap.userinfo.rinfo.ky;
					var jj = JSON.parse(data);
					doc.content = jj.content;
					doc.owner = gap.userinfo.rinfo;
					doc.type = jj.type;
						
					if (typeof(res.title) != "undefined" && res.title != ""){
						doc.title = jj.content;
						doc.editor = res.editor;
						doc.content = ""; //에디터 모드일 경우 content를 제거해야 한다.
					}
																									
					doc._id = jj.id;
					doc.direct = "T";										
						
					if (res.type == "emoticon"){
						doc.epath = res.epath;
					}
					
					if (typeof(res.og) != "undefined"){
						doc.og = res.og;
					}
						
					if (typeof(res.ex) != "undefined"){
						//메일 처럼 다른 시스템에서 호출되는 경우 처리한다.
						doc.ex = res.ex;
					}
						
						
					var date = "";
					
					if (gBodyM.post_view_type == "2"){
						date = gap.change_date_localTime_only_date(doc.GMT2);
					}else{
						date = gap.change_date_localTime_only_date(GMT);
					}
						
					
					//var message = $("#rmtext").val().replace(/[\n]/gi, "<br>");
					var message = msg.replace(/[\n]/gi, "<br>");
					//$(".wrap-message p").html(message);
						
					if (message.indexOf("&lt;/mention&gt;") > -1){
						//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
						message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
					}
						
					$(tobj).html(message);
					
					//멘션을 클릭한 경우 사용자 정보를 표시한다.
					$(".wrap-message mention").off();
					$(".wrap-message mention").on("click", function(e){
						var id = $(this).attr("data");
						var url_link = "kPortalMeet://NativeCall/callUserProfile?ky=" + encodeURIComponent(id);
						gBodyM.connectApp(url_link);
						return false;
					});
					
					doc.date = date;
					doc.edit = "T";
					doc.res = res;
					doc.doctype = doc.type;
					
					gBodyM.send_socket(doc, "ms"); 
					
					
					//모바일 Push발송 등록 ////////////////////////////////////////////////////////		
					var smsg = new Object();
					smsg.msg = "[" + gap.textToHtml(channel_name) + "] " + gap.lang.nmsg;	
					smsg.title = gap.systemname + "[" + gap.lang.channel + "]";	
					smsg.type = "ms";		
					smsg.key1 = channel_code;
					smsg.key2 = "";
					smsg.key3 = gap.textToHtml(channel_name);
					smsg.fr = gap.userinfo.rinfo.nm;
					//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.	
					
					if (typeof mention_list != "undefined" && mention_list.length > 0){
						// mention 관련 데이터가 있는 경우
						var slist = [];
						for (var i = 0; i < mention_list.length; i++){
							slist.push(mention_list[i].ky);
						}
						smsg.sender = slist.join("-spl-");	
						
					}else{
						smsg.sender = gBodyM.search_channel_member(channel_code).join("-spl-");
					}
								
					//gap.push_noti_mobile(smsg);	
					
					//알림센터에 푸쉬 보내기
					var rid = channel_code;
					var receivers = smsg.sender.split("-spl-");
					var msg2 = gap.lang.nmsg;	
					var sendername = "["+gap.lang.channel+" : "+ gap.textToHtml(channel_name) +"]"
					gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
					/////////////////////////////////////////////////////////////////////					
								
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});		
	},
	
	
	"cur_select_image_list" : function(){
		return gBodyM.cur_select_images;
	},
	
	"cur_msg_info" : function(id){
		
		var list = gBodyM.cur_msg_list;
		for (var i = 0 ; i < list.length; i++){
			if (list[i]._id.$oid){
				if (id == list[i]._id.$oid){
					return list[i];
				}
			}else{
				// 파일 업로드 후 바로 (이미지)파일을 클릭하는 경우
				if (id == list[i]._id){
					return list[i];
				}
			}

		}
		return false;
	},
	
	
		
	"__event_save_reply" : function(){
		
	},
	
	"load_channel_list_info" : function(){
		
		var url = gap.channelserver + "/api/channel/channel_info_list.km";
		var data = JSON.stringify({});
		
		$.ajax({
			type : "POST",
			dataType : "text",
			async : false,
			data : data,
			url : url,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(ress){
				var res = JSON.parse(ress);
				
				gBodyM.cur_channel_list_info = res;
				
				var list = "";
				for (var i = 0 ; i < res.length; i++){
					var info = res[i];
					
					if (typeof(info.type) != "undefined" && info.type == "folder"){
						// do nothing...
					}else{
						if (list == ""){
							list = info.ch_code;
						}else{
							list += "-spl-" + info.ch_code;
						}	
					}
				}
				gBodyM.select_channel_code = list;
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	
	
	
	"check_preview_file" : function(file){
		var reg = /(.*?)\.(ppt|pptx|xls|xlsx|doc|docx|pdf|hwp|txt)$/;
	  	if(file.toLowerCase().match(reg)) {
			return true;
		} else {
			return false;
		}
	},
		
	
	
	
	"draw_msg" : function(item, type, date, is_write_auth){
		
		
		var html = "";
		var uinfo = gap.userinfo.rinfo;	
		var docid = "";		
		var like_count = 0;
		var show_notice_btn = "F";
		
		var is_owner_delete = false;
		var is_delete_auth = "F";
//		if ((gap.cur_channel_info && gap.cur_channel_info.opt_del && gap.cur_channel_info.opt_del == "T") || (!gap.check_top_menu_new())){
//			is_owner_delete = true;
//			is_delete_auth = "T";
//		}
		var is_copy_auth = "T";
		if ((gap.cur_channel_info && gap.cur_channel_info.opt_copy && gap.cur_channel_info.opt_copy == "F") && (!gap.check_top_menu_new())){
			is_copy_auth = "F";
		}

		
		
		if (item.owner_delete && item.owner_delete == "T"){
			is_owner_delete = true;
			is_delete_auth = "T";
		}
		
		if (typeof(item.tyx) != "undefined" && item.tyx == "notice"){
			show_notice_btn = "T";
		}else{
			if (typeof(item.ex) != "undefined"){
				var ex_ty = item.ex.type;
				//결재, 게시판, 투표만 공지로 등록 가능
				if (ex_ty != "aprv" && ex_ty != "bbs" && ex_ty != "vote"){
					show_notice_btn = "T";
				}
			}
		}
		

		if (item.direct == "T"){						
			docid = item._id;
		}else{
			docid = item._id.$oid;
			if (typeof(item.like_count.$numberLong) != "undefined"){
				like_count = item.like_count.$numberLong;
			}else{
				like_count = item.like_count;
			}		
			if (typeof(docid) == "undefined"){
				docid = item._id;
			}
		}
			
	//	var person_img = item.owner.pu;
	//	var person_img = gap.person_profile_uid(item.owner.ky);
		var person_img = gap.person_profile_photo(item.owner);
		
	//	var person_img = gap.person_profile_img(item.owner.em);
		
		var user_info = gap.user_check(item.owner);
		var name = user_info.name;
		var deptname = user_info.dept;
		var channel_name = item.channel_name;		
		// disp_user_info
		
//		var xydate = new Date();		
//		var today = xydate.YYYYMMDD();		
//		var cday = gap.change_date_localTime_only_date(item.GMT);
//		var time = "";
//		if (today == cday){
//			time = gap.change_date_localTime_only_time(item.GMT);
//		}else{
//			time = gap.change_date_localTime_full2(item.GMT);
//		}
		
		var GMT = item.GMT;
		var GMT2 = item.GMT2;
		
		var day = gap.change_date_default2(gap.change_date_localTime_only_date(item.GMT));
		var time2 = gap.change_date_localTime_only_time(item.GMT);
		time = day + " " + time2;
		
		if (typeof(GMT2) != "undefined"){
			if (GMT != GMT2){
				var GMT2_dis = gap.change_date_localTime_full2(GMT2);
				time = time + " (Created : " + GMT2_dis + ")";
			}else{
				time = time;
			}
		}else{
			time = time;
		}
		
		
	
		var messagex = item.content;
		var rcount = messagex.split(/\r\n|\r|\n/).length;
		var mcount = messagex.length;
		var rdis = false;
		if ( (rcount > 10) || (mcount > 800)){
			rdis = true;
		}	
		
		var fcount = "";
		var ky = item.owner.ky;
		var mention = "";
		
		if ( (typeof(item.mention) != "undefined") ){
			mention = JSON.stringify(item.mention)
		}
		
		var message = gBodyM.message_check(messagex);
				
		if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){
			var editor_html = item.editor.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
			//모바일은 도메인이 틀려서 변경해 주어야 한다.
			editor_html = editor_html.replace(/dsw.daesang.com/gi,"dswext.daesang.com");
			message = message + editor_html;
		}
		
		if (message.indexOf("&lt;/mention&gt;") > -1){
			//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
			message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
		}
		
		var isMe = "me";
		if (item.owner.ky.toLowerCase() == uinfo.ky.toLowerCase()){
			html += "<div class='group me' id='ms_"+docid+"'> <!-- me 클래스 변경 -->";
		}else{
			isMe = "you";
			html += "<div class='group you' id='ms_"+docid+"'> <!-- me 클래스 변경 -->";
		}
	
		var etype = "msg";
		if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){
			etype = "editor";
		}else if ( (typeof(item.ex) != "undefined") && (item.ex.type == "mail")){
			etype = "mail";
		}		

		html += "	<dl class='user' >";
		html += "		<dt>";
		html += "			<div class='user-thumb'>"+person_img+"</div>";
		html += "		</dt>";
		html += "		<dd>";
	//	html += "			<span class='name'>"+name+"<em class='team'>"+deptname+"</em></span>";
		html += "			<span class='name'>"+user_info.disp_user_info +"</span>";
		html += "			<div class='time' id='update_time_"+docid+"'>"+time+" </div>"; //(Update : 2020.01.01 15:12)
		html += "		</dd>";
		html += "	</dl>";
		
//		if (isMe == "me"){
//			if (typeof(item.ex) == "undefined"){
//				html += "	<span class='musign'><button class='ico btn-edit' style='width:20px; height:20px; background-position:-206px -212px;position:absolute; right:35px; top:14px' data-channel_code='"+item.channel_code+"' data-channel_name='"+item.channel_name+"' data-channel_id='"+docid+"' data-ty='"+type+"' data-type='"+etype+"' data-mention='"+mention+"'>편집</button></span>";
//			}
//			
//		}
		
		if (!is_owner_delete){
			html += "	<button class='ico btn-more' id='btn_more_"+docid+"' data='"+isMe+"' data2='"+item.channel_code+"' data3='"+item.channel_name+"' data4='"+docid+"' data5='"+fcount+"' data6='"+ky+"' data7='"+etype+"' data8='"+show_notice_btn+"' data9='"+is_delete_auth+"' data10='"+is_copy_auth+"'>더보기</button>";
		}
		
		html += "	<div class='talk' style='overflow-x:auto'>";
		
		
		if (is_owner_delete){
			html += "<p>" + gap.owner_delete_msg(item.delete_owner, item.delete_owner_time) + "</p>";
		}else{
			if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){
				html += "		<div class='wrap-message editor'> ";
			}else{
				html += "		<div class='wrap-message' style='overflow:hidden;word-break:break-all'> ";
			}
			
			
			if (item.channel_code != gBodyM.cur_opt){
				html += "			<span class='channel-name' data-chcode='"+item.channel_code+"', data-chname='"+item.channel_name+"'>"+channel_name+"</span>";
			}
			
			
			if ((typeof(item.tyx) != "undefined") && item.tyx == "notice"){
				var subj = item.content;
				if (item.editor && item.title != ""){
					subj = item.title;
				}else if (item.editor){
					subj = item.editor;
				}
				
				if (typeof(item.ex) != "undefined"){
					if (item.ex.type == "vote"){
						var _vote = item.ex;
						var _info = {
								"key" : _vote.key,
								"title" : _vote.title,
								"comment" : _vote.comment,
								"endtime" : _vote.end_date + ' ' + _vote.end_time,
								"anonymous" : _vote.anonymous_vote,
								"multi" : _vote.multi_choice
						};
						
						html += '<div class="top">';
						html += '   <div class="req_box" id="req_'+docid+'" data-vote=\'' + JSON.stringify(JSON.stringify(_info)) + '\'>';
						html += '   		<div class="req_left">';
						html += '   			<div class="req_icon" style="background-position: -316px -293px;  border-radius:20px"></div>';
						html += '           		<div class="req_info" style="padding:0px; ">';
						html += '           			<h3 class="reg_notice_class">' + gap.lang.mn3 + '</h3>';
						html += '						<span class="req_txt">' + gap.truncateString(subj, 50) + '</span>';
						html += '           		</div>';
						html += '   		</div>';
						html += '   		<button type="button" class="req_btn" data-type="vote" style="border:none">'+gap.lang.openNewWin+'</button>';
						html += '   </div>';
						html += '</div>';
					}else if (item.ex.type == "aprv"){
						var _aprv = item.ex;

						//var date = moment(_aprv.pubdate).utc().format("YYYY-MM-DD hh:mm");
						var date = _aprv.pubdate;
						
						html += '<div class="top">';
						html += '   <div class="req_box" id="req_'+docid+'" data-url=\'' + _aprv.link + '\'>';
						html += '   		<div class="req_left">';
						html += '   			<div class="req_icon" style="background-position: -316px -293px;  border-radius:20px"></div>';
						html += '           		<div class="req_info" style="padding:0px; ">';
						html += '           			<h3 class="reg_notice_class">' + gap.lang.mn3 + '</h3>';
						html += '						<span class="req_txt">' + gap.truncateString(subj, 50) + '</span>';
						html += '           		</div>';
						html += '   		</div>';
						html += '   		<button type="button" class="req_btn" data-type="aprv" style="border:none">'+gap.lang.openNewWin+'</button>';
						html += '   </div>';
						html += '</div>';
					}else if (item.ex.type == "bbs"){
						var _bbs = item.ex;
			
						//var date = moment(_bbs.pubdate).utc().format("YYYY-MM-DD hh:mm");
						var date = _bbs.pubdate;
						
						html += '<div class="top">';
						html += '   <div class="req_box" id="req_'+docid+'" data-url=\'' + _bbs.link + '\'>';
						html += '   		<div class="req_left">';
						html += '   			<div class="req_icon" style="background-position: -316px -293px;  border-radius:20px"></div>';
						html += '           		<div class="req_info" style="padding:0px; ">';
						html += '           			<h3 class="reg_notice_class">' + gap.lang.mn3 + '</h3>';
						html += '						<span class="req_txt">' + gap.truncateString(subj, 50) + '</span>';
						html += '           		</div>';
						html += '   		</div>';
						html += '   		<button type="button" class="req_btn" data-type="bbs" style="border:none">'+gap.lang.openNewWin+'</button>';
						html += '   </div>';
						html += '</div>';
					}
				}else{
					html += '<div class="top">';
					html += '   <div class="req_box" id="req_'+docid+'" data-key=\'' + item.notice_id + '\'>';
					html += '   		<div class="req_left">';
					html += '   			<div class="req_icon" style="background-position: -316px -293px;  border-radius:20px"></div>';
					html += '           		<div class="req_info" style="padding:0px; ">';
					html += '           			<h3 class="reg_notice_class">' + gap.lang.mn3 + '</h3>';
					html += '						<span class="req_txt">' + gap.truncateString(subj, 50) + '</span>';
					html += '           		</div>';
					html += '   		</div>';
					html += '   		<button type="button" class="req_btn" data-type="normal" style="border:none">'+gap.lang.openNewWin+'</button>';
					html += '   </div>';
					html += '</div>';
				}
				
			}else{
				if (type == "emoticon"){
					var sppl = item.epath.split("/");
					var xppl = sppl[sppl.length-1];
					var ep = "/resource/images/emoticons/" + xppl;
					//html += "                   <div><img src='"+item.epath+"'></div>";
					html += "                   <div><img src='"+ep+"' class='mobile_emoticon'></div>";
				}
				
				if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){
					html += "<h3>"+item.title+"</h3>";
					if (gBodyM.collapse_editor == "1"){
						html += "<span class='fold-btns editor' data-key='"+docid+"' ><button class='btn-editor-expand'>"+gap.lang.expand_editor+"</button></span>";
					}
				}
				
				
				if (typeof(item.ex) != "undefined" && (item.ex.type == "meet")){	
					
					scheduleid = item.ex.scheduleid;
					
					var m_width = $(window).width();
					if (m_width > 500){
						html += "					<p>"+message+"<span class='meet_invite' data-id='"+item.ex.scheduleid+"' data-type='"+item.ex.meet_type+"'>"+gap.lang.meetdetail+"</span></p>" + "";
						
					}else{
						html += "					<p>"+message+"<br><span class='meet_invite' data-id='"+item.ex.scheduleid+"' data-type='"+item.ex.meet_type+"'>"+gap.lang.meetdetail+"</span></p>" + "";
						
					}
					
				}else if (rdis){
					html += "					<p id='cc_"+docid+"' class='msg-fold'>"+message+"</p>";
					html += "						<span class='fold-btns' style='cursor:pointer'><button class='btn-expand' style='cursor:pointer'><span style='cursor:pointer'>"+gap.lang.expand+"</span></button></span>";
				}else{
					if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){
						if (gBodyM.collapse_editor == "1"){
							html += "					<span id='ss_"+docid+"' style='display:none'>"+message+"</span>";
							disopt = "none";
						}else{
							html += "					<span id='ss_"+docid+"'>"+message+"</span>";
						}
					}else{
						if (message != ""){
							html += "					<p id='cc_"+docid+"'>"+message+"</p>";
						}	
					}
							
				}
				
				
				
				
				if ((typeof(item.og) != "undefined") && (typeof(item.og.msg) != "undefined") ){
					//alert("og : " + item.og.msg);
					
					var og = item.og.ex;
					if (typeof(og) != "undefined"){
						var imgurl = og.img;
						var title = og.tle;
						var url = og.lnk;
						var desc = og.desc;
						var dmn = og.dmn;
						if (typeof(og.dmn) == "undefined"){
							dmn = url;
						}
						
						if (typeof(dmn) == "undefined"){					
						}else{
							html += "<div class='link-content'>";
							html += "	<a href='"+url+"' target='_blank'>";
							var emppath = cdbpath + "/img/thm_link.png";
							var im = "<img src='" + imgurl + "' onerror='this.src="+emppath+"' />"
							html += "	<div class='img-thumb'>"+im+"</div>";
							html += "	<ul style='list-style:none; padding:5px; margin-top:10px'>";
							html += "		<li class='link-title' style='color:black'>"+title+"</li>";
							html += "		<li class='link-summary'  style='color:black'>"+desc+"</li>";
							html += "		<li class='link-site'>"+dmn+"</li>";
							html += "	</ul>";
							html += "	</a>";
							html += "</div>";
						}
						

					}
					
							
				}else if (typeof(item.ex) != "undefined"){
				
					if (item.ex.type == "mail"){
						var from = item.ex.sender;
						if (from == ""){
							from = "None";
						}
						var title = item.ex.title;
						
						var tunid = item.ex.target_unid;
						var tdb = item.ex.target_db;
						var tserver = item.ex.target_server;
						
						if (typeof(item.ex.attach) != "undefined"){
							var attach_list = item.ex.attach.split("*?*");
							var attach_size = item.ex.attachsize.split("*?*");
							var acount = 0;
							if (item.ex.attach != ""){
								acount = attach_list.length;
							}
							
//							html += "<div class='chat-mail'>";
//							html += "<div>";
//							html += "	<span class='ico ico-mail'></span>";
//							html += "	<dl style='cursor:pointer' onclick=\"gBodyM.openMail('"+docid+"','"+item.channel_code+"', '"+channel_name+"')\">";
//							html += "		<dt >"+from+"</dt>";
//							html += "		<dd>"+title+"</dd>";
//							html += "	</dl>";
//							
//							
//							if (acount > 0){
//								html += "	<div class='mail-attach-list'>";
//								html += "		<button class='ico btn-fold'>접기</button> <!-- 클릭 시 .on 클래스 토글 -->";
//								html += "		<h4>"+gap.lang.attachment+" <span>"+acount+"</span></h4>";
//							//	html += "		<button class='btn-save-all'><span>모두저장</span></button>";
//								html += "		<ul style='list-style:none'>";	
//								
//								
//								for (var i = 0 ; i < attach_list.length ; i++){
//									var attname = attach_list[i];
//									var attsize = attach_size[i];
//									var icon = gap.file_icon_check(attname);
//									
//									html += "			<li style='padding-left:20px' onclick=\"gBodyM.file_convert_mail('"+tunid+"','"+attname+"', '"+tdb+"', '"+tserver+"', '')\">";
//									html += "				<span class='ico ico-s "+icon+"' style='left:0px'></span><span>"+attname+"</span>";
//									html += "				<em>("+gap.file_size_setting(attsize)+")</em>";
//									html += "			</li>";
//								}
//								
//								
		//
//								html += "		</ul>";
//								html += "	</div>";
//							}
							
							
							html += "<div class='chat-mail'>";
							html += '<div class="top">';
							html += '   <div class="req_box" id="req_'+docid+'">';
							html += '   		<div class="req_left" style="">';
							html += '   			<div class="req_icon" style="background-position: -138px -293px;  border-radius:20px"></div>';
							html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
							html += '           			<h3>' + title + '</h3>';
							if (date != ""){
								html += '						<span class="req_txt">'+from+ ' / ' + date +'</span>';
							}else{
								html += '						<span class="req_txt">'+from +'</span>';
							}
							
							html += '           		</div>';
							html += '   		</div>';
							
							
							html += '   		<button onclick=\'gBodyM.openMail("'+docid+'","'+item.channel_code+'", "'+channel_name+'")\' type="button" class="req_btn" data-type="mail" data-t1="'+tunid+'" data-t2="'+tdb+'" data-t3="'+target_server+'" style="border:none">'+gap.lang.openNewWin+'</button>';
							
							
							
							html += '   </div>';
							
							
							
							
							
							if (acount > 0){
								html += "	<div class='mail-attach-list' style='border-radius:0px'>";
								html += "		<button class='ico btn-fold'>접기</button> <!-- 클릭 시 .on 클래스 토글 -->";
								html += "		<h4>"+gap.lang.attachment+" <span>"+acount+"</span></h4>";
							//	html += "		<button class='btn-save-all'><span>모두저장</span></button>";
								html += "		<ul style='list-style:none'>";	
								
								
								for (var i = 0 ; i < attach_list.length ; i++){
									var attname = attach_list[i];
									var attsize = attach_size[i];
									var icon = gap.file_icon_check(attname);
									var target_server = item.ex.target_server;
								
								
									html += "			<li onclick=\"gBodyM.file_convert_mail('"+tunid+"','"+attname+"', '"+tdb+"', '"+tserver+"', '')\"><span class='ico2 ico-attach "+icon+"'></span><span>"+attname+"</span> <em>("+gap.file_size_setting(attsize)+")</em>";
								//	html += "				<button class='ico btn-download'>저장</button>";
									html += "			</li>";
								}
								
								

								html += "		</ul>";
								html += "	</div>";
							}
							

							html += "	</div>";
							html += "</div>";
						}
						
					}else if (item.ex.type == "todo"){

						var xinfo = item.ex;
						
						var ux = xinfo.owner;  //나중에 asign.pu로 변경해야 한다.
					//	var asign_img = gap.person_photo(ux.pu);
						var asign_img = gap.person_profile_box_uid(ux);
						
						var user_info = gap.user_check(ux);
						var member_name = user_info.name;
						var dept = user_info.dept;
						var email = user_info.email;
						var jt = user_info.jt;
						
						var todo_item_id = xinfo._id.$oid;
						
//						html += "<div class='chat-todo'>";
//						html += "<div>";
//						html += "	<span class='ico ico-todo'></span>";
//						html += "	<dl style='cursor:pointer' onclick=\"gBodyM.openTodo('"+todo_item_id+"', '"+xinfo.project_name+"')\">";
//						html += "		<dt>"+member_name+"</dt>";
//						html += "		<dd>["+xinfo.project_name+"] "+xinfo.title+"</dd>";
//						if (typeof(ux.startdate) != "undefined"){
//							html += "	<dd>"+ux.startdate+" ~ "+ux.enddate+" ("+ux.term+"day)</dd>";
//						}
//						html += "	</dl>";
//						html += "</div>";
//						html += "</div>";
						
						
						
						html += '<div class="top">';
						html += '   <div class="req_box" id="req_'+docid+'"  data-url=\'' + todo_item_id + '\'>';
						html += '   		<div class="req_left" >';
						html += '   			<div class="req_icon" style="background-position:-181px -292px; border-radius:20px"></div>';
						html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
						html += '           			<h3>['+xinfo.project_name+'] '+xinfo.title+'</h3>';
						html += "						<div class='user-chat f_middle' style='padding:0px'>";
						html += "							<div class='user' style='position:absolute; top:-5px; left:-10px; width:55px; height:55px'>";
						html += "								<div class='photo-wrap' style='border-radius:50%; background-image:url(" + gap.person_photo_url(ux) + "),url(../resource/images/none.jpg);'></div>";
						html += "							</div>";
					//	html += "							<div class='user-thumb'>"+asign_img+"</div>";
						html += "							<div clss='p_file_info' >";
						html += "								<span class='p_file_name'>"+member_name+ gap.lang.hoching + "</span>";
						html += "								<span class='p_file_time'>"+jt+" / "+dept+"</span>";
						html += "							</div>";	
						html += '           			</div>';
						html += '           		</div>';
						html += '   		</div>';
						html += '   		<button type="button" class="req_btn xtodo" data-type="todo" style="border:none">'+gap.lang.openNewWin+'</button>';
						html += '   </div>';
						html += '</div>';
						
					}else if (item.ex.type == "vote"){
						var _vote = item.ex;
						var _info = {
								"key" : _vote.key,
								"title" : _vote.title,
								"comment" : _vote.comment,
								"endtime" : _vote.end_date + ' ' + _vote.end_time,
								"anonymous" : _vote.anonymous_vote,
								"multi" : _vote.multi_choice
						};
						
						html += '<div class="top">';
						html += '   <div class="req_box" id="req_'+docid+'" data-vote=\'' + JSON.stringify(JSON.stringify(_info)) + '\'>';
						html += '   		<div class="req_left" >';
						html += '   			<div class="req_icon" style=" border-radius:20px;"></div>';
						html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
						html += '           			<h3>' + _vote.title + '</h3>';
						html += '           			<span class="req_txt">' + _vote.comment + '</span>';
						html += '           			<time>' + _vote.end_date + ' ' + _vote.end_time + ' 까지</time>';
						html += '           		</div>';
						html += '   		</div>';
						html += '   		<button type="button" class="req_btn" data-type="vote" style="border:none">'+gap.lang.vote+'</button>';
						html += '   </div>';
						html += '</div>';
					}else if (item.ex.type == "aprv"){
						var _aprv = item.ex;

						//var date = moment(_aprv.pubdate).utc().format("YYYY-MM-DD hh:mm");
						var date = _aprv.pubdate;
						
						html += '<div class="top">';
						html += '   <div class="req_box" id="req_'+docid+'" data-url=\'' + _aprv.link + '\'>';
						html += '   		<div class="req_left">';
						html += '   			<div class="req_icon" style="background-position: -95px -293px; border-radius:20px"></div>';
						html += '           		<div class="req_info" style="padding:0px;">';
						html += '           			<h3>' + _aprv.title + '</h3>';
						html += '						<span class="req_txt">Date : '+date+'</span>';
					//	html += '           			<span class="req_txt">' + _aprv.comment + '</span>';
					//	html += '           			<time>' + _vote.end_date + ' ' + _vote.end_time + ' 까지</time>';
						html += '           		</div>';
						html += '   		</div>';
						html += '   		<button type="button" class="req_btn" data-type="aprv" style="border:none">'+gap.lang.openNewWin+'</button>';
						html += '   </div>';
						html += '</div>';
					}else if (item.ex.type == "bbs"){
						var _bbs = item.ex;
			
						//var date = moment(_bbs.pubdate).utc().format("YYYY-MM-DD hh:mm");
						var date = _bbs.pubdate;
						
						html += '<div class="top">';
						html += '   <div class="req_box" id="req_'+docid+'"  data-url=\'' + _bbs.link + '\'>';
						html += '   		<div class="req_left">';
						html += '   			<div class="req_icon" style="background-position: -52px -293px;  border-radius:20px"></div>';
						html += '           		<div class="req_info" style="padding:0px; ">';
						html += '           			<h3>' + _bbs.title + '</h3>';
						html += '						<span class="req_txt">Date : '+date+'</span>';
						html += '           		</div>';
						html += '   		</div>';
						html += '   		<button type="button" class="req_btn" data-type="bbs" style="border:none">'+gap.lang.openNewWin+'</button>';
						html += '   </div>';
						html += '</div>';
					}else if (item.ex.type == "channel_meeting"){
						
						var _meet = item.ex;
						
						html += '<div class="top">';
						html += '   <div class="req_box" id="req_'+docid+'" data-url=\'' + _meet.meetingurl + '\'>';
						html += '   		<div class="req_left" >';
						html += '   			<div class="req_icon" style="background-position:-10px -293px;  border-radius:20px"></div>';
						html += '           		<div class="req_info" style="padding:0px; max-width:350px">';
						html += '           			<h3>미팅 번호 (Meeting Number) : ' + _meet.meetingkey + '<br> 호스트 키 (Host Key) : "'+_meet.hostkey+'" </h3>';
						html += '           		</div>';
						html += '   		</div>';
						html += '   		<button type="button" class="req_btn" data-type="channel_meeting" style="border:none">'+gap.lang.notice_attend+'</button>';
						html += '   </div>';
						html += '</div>';
					}
					
					
				}			
			}
			
			
			var replylists = item.reply;
			var rcount = 0;
			if (typeof(replylists) != "undefined"){
				rcount = replylists.length;
				
				
			}
			
			html += "			<ul class='musign message-btns'>";
				var cname= item.channel_name.replace(/&#39;/gi,"-spl-");
			//	html += "				<li><button class='ico btn-reply'>댓글</button><span>0</span></li>";
			//	html += "				<li><button class='ico btn-like' onclick=\"gBodyM.like_channel_data('"+docid+"','"+item.email.toLowerCase()+"')\">좋아요</button><span id='like_"+docid+"'>"+like_count+"</span></li>";
				if ((gap.cur_channel_info && gap.cur_channel_info.opt_reply && gap.cur_channel_info.opt_reply == "T") || (is_write_auth == "T")){
					html += "				<li><button class='btn' onclick=\"gBodyM.call_reply_window('"+docid+"', '"+item.channel_code+"', '"+cname+"')\">";
					html += "				<em class='ico btn-reply' style='background-position:-126px -212px; margin-top:-3px'></em>"+gap.lang.reply+"<strong id='rp_"+docid+"'>"+rcount+"</strong></button></li>";
				}else{
					html += "				<li style='height:38px'>&nbsp;</li>";
				}
				
				
				html += "				<li><button class='btn' onclick=\"gBodyM.like_channel_data('"+docid+"','"+item.email.toLowerCase()+"')\">";
				html += "				<em class='ico btn-like' style='background-position:-153px -211px; margin-top:-6px'></em>"+gap.lang.like+"<strong id='like_"+docid+"'>"+like_count+"</strong>";
				html += "				</button></li>";
				
			//	if (item.email.toLowerCase() == uinfo.em.toLowerCase()){
			//		html += "				<li><button class='ico btn-del'>삭제</button></li>";
			//	}
				
				html += "			</ul>";
				
			
			html +=  gBodyM.draw_reply(item);
			

			
			
			
			
			html += "		</div>";
			html += "	</div>";
			html += "</div>";
		}
		
		
		
		
		
		
	
		
		
		
		return html;
	},
	
	
	"get_body_html" : function(data){
		
		var RegExpDS = /<!--[^>](.*?)-->/g;	//주석제거
		
		try{
			
			var x_data = data.replace(/[\n\r]/gi," ");
			
			try{
				var res = x_data.match(/\<table border=\"1\" cellspacing=\"2\" (.*?)\<\/table>/gi);			
				for (var i = 0 ; i < res.length; i++){
					var spl = res[i];
					x_data = x_data.replace(spl, "");
				}
			}catch(e){}
					
			var array_href = x_data.match(/href=([\"|\'])([http|https])([^\"\']*([\"|\']))/g);
			if (array_href != null) {				
    			var pre_bigfileurl = '';
   				 for (i = 0; i < array_href.length; i++) {
        			var cur_link = array_href[i].slice(5, array_href.lengtth).replace(/"|'/g, '');

        			if (cur_link.indexOf('/bigmail/') > -1) {
        				
        				// (구)대용량 링크인 경우
            			a_url = decodeURIComponent(cur_link).replace(/https:\/\/|http:\/\//gi, '');
            			a_ptname = String(a_url.match(/\/.*\.nsf\//));
            			/*a_unid = a_url.slice(a_url.indexOf('FileDownView\/') + 13, a_url.indexOf('\/$file') + 1);*/
            			var _bigviewN = (a_url.indexOf('download\/')>-1?'download\/':'FileDownView\/');
            			a_unid = a_url.slice(a_url.indexOf(_bigviewN) + _bigviewN.length, a_url.indexOf('\/$file') + 1);                   
            			app_server = a_url.slice(0, a_url.indexOf('.'));
            			app_path = a_ptname.slice(1, a_ptname.length - 1);
            			app_unid = a_unid.slice(0, a_unid.indexOf('&'));
            			app_filename = a_url.slice(a_url.indexOf('\$file/') + 6, a_url.length);
            			if (app_filename.indexOf('?') > -1) {
            				app_filename = app_filename.slice(0, app_filename.indexOf('?'));
            			}
            			change_link = 'javascript:gBodyM.downAttFile(\'' + app_server + '\', \'' + app_path + '\', \'' + app_unid + '\', \'' + app_filename + '\', \'' + i + '\')';
            			//change_link = 'javascript:downAttFile(\"' + app_server + '\", \"' + app_path + '\", \"' + app_unid + '\", \"' + app_filename + '\", \"' + i + '\")';
            			x_data = x_data.replace(cur_link, change_link);
        			
        			}else{
        				x_data= x_data.replace(cur_link, '');
        			}
   				 }	
			}
			
			var kkk = x_data.replaceAll(/target=\"_blank\"/gi, "");			
			return kkk;
		}catch(e){
			return data.replace(/[\n\r]/g," <br />")
		}
		

		/*
		var RegExpDS = /<!--[^>](.*?)-->/g;	//주석제거
		try{
			var x_data = data.replace(/[\n\r]/gi," ");
			var one = x_data.match(/\<body(.*?)\<\/body>/i);
			if (one != null){
				var inx1 = one[1].indexOf(">");
				var retHTML = one[1].substring(inx1+1, one[1].lengths);
			}else{
				var retHTML = x_data;
			}
			retHTML = retHTML.replace(RegExpDS,"");
			
			return retHTML;
		}catch(e){
			//return ori_data
			return data.replace(/[\n\r]/g," <br />")
		}	
		*/
	},
	
	"downAttFile" : function(server, path, unid, filename){
				
		var ext = gap.is_file_type_filter(filename);
		
		var kkk = gBodyM.pp_check(filename);			
		
		
		var url = location.protocol + "//" + location.host + path + "/download/" + unid + "/Body/M2/" + filename;
						
		if (ext == "movie"){
			gBodyM.call_preview(url, filename, "video");
		}else if (ext == "img"){
			gBodyM.call_preview(url, filename, "image");		
		}else if (gBodyM.pp_check(filename)){		
			
			
			var spl = path.split("/");
			var tserver = spl[1];
			var tdb = spl[3].replace("bigmail", "").replace(".nsf","");
			
			gBodyM.file_convert_mail(unid, filename, tdb, tserver, 'big');
		}
	},
	
	"openMail" : function(id, channel_code,  channel_name){
	//	gBodyM.detail_view(id, channel_code, channel_name);
		var _url = gap.getBaseUrl() + "mobile?readform&t=channel&k1=" + id + "&k2=&k3=mailview";
		var _title = channel_name;
		var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(_url) + "&title=" + encodeURIComponent(_title);
		gBodyM.connectApp(url_link);
		return false;
	},
	
	
	"openTodo" : function(id, title){

		var url_link = "kPortalMeet://NativeCall/callDetailTodo?id=" + id + "&tab=&title=" + title;
		gBodyM.connectApp(url_link);
		return false;
	},
	
	
	
	"draw_file" : function(item, date, is_write_auth){
		//파일이 포함된 경우
		
		
		var html = "";
		var docid = "";		
		var like_count = 0;
		var show_notice_btn = "F";
		
		var is_owner_delete = false;
		var is_delete_auth = "F";
		if (item.owner_delete && item.owner_delete == "T"){
			is_owner_delete = true;
		}
		
//		var is_owner_delete = false;
//		var is_delete_auth = "F";
//		
//		if ((gap.cur_channel_info && gap.cur_channel_info.opt_del && gap.cur_channel_info.opt_del == "T") || (!gap.check_top_menu_new())){
//			is_owner_delete = true;
//			is_delete_auth = "T";
//		}
		var is_copy_auth = "T";
		if ((gap.cur_channel_info && gap.cur_channel_info.opt_copy && gap.cur_channel_info.opt_copy == "F") && (!gap.check_top_menu_new())){
			is_copy_auth = "F";
		}
		
		if (typeof(item.tyx) != "undefined" && item.tyx == "notice"){
			show_notice_btn = "T";
		}else{
			if (typeof(item.ex) != "undefined"){
				var ex_ty = item.ex.type;
				//결재, 게시판, 투표만 공지로 등록 가능
				if (ex_ty != "aprv" && ex_ty != "bbs" && ex_ty != "vote"){
					show_notice_btn = "T";
				}
			}
		}	
	
		if (item.direct == "T"){
			docid = item._id;
		}else{
			docid = item._id.$oid;
			if (typeof(item.like_count.$numberLong) != "undefined"){
				like_count = item.like_count.$numberLong;
			}else{
				like_count = item.like_count;
			}
			if (typeof(docid) == "undefined"){
				docid = item._id;
			}
		}
		
		html += "<div class='xman'  data='"+date+"'>";
		
		var uinfo = gap.userinfo.rinfo;	
		
		
	//	var person_img = item.owner.pu;
	//	var person_img = gap.person_profile_uid(item.owner.ky);
		var person_img = gap.person_profile_photo(item.owner);
		var user_info = gap.user_check(item.owner);
		var name = user_info.name;
		var deptname = user_info.dept;		
		
		var messagex = item.content;
		var rcount = messagex.split(/\r\n|\r|\n/).length;
		var mcount = messagex.length;
		var rdis = false;
		if ( (rcount > 10) || (mcount > 800)){
			rdis = true;
		}	
		
		
//		var xydate = new Date();		
//		var today = xydate.YYYYMMDD();
//		var cday = gap.change_date_localTime_only_date(item.GMT);
//		var time = "";
//		if (today == cday){
//			time = gap.change_date_localTime_only_time(item.GMT);
//		}else{
//			time = gap.change_date_localTime_full2(item.GMT);
//		}
		
		var GMT = item.GMT;
		var GMT2 = item.GMT2;
		
		var day = gap.change_date_default2(gap.change_date_localTime_only_date(item.GMT));
		var time2 = gap.change_date_localTime_only_time(item.GMT);
		time = day + " " + time2;
		
		if (typeof(GMT2) != "undefined"){
			var day = gap.change_date_default2(gap.change_date_localTime_only_date(item.GMT));
			var time2 = gap.change_date_localTime_only_time(item.GMT);
			time = day + " " + time2;
			
			if (GMT != GMT2){
				var GMT2_dis = gap.change_date_localTime_full2(GMT2);
				time = time + " (Created : " + GMT2_dis + ")";
			}else{
				time = time;
			}
		}else{
			time = time;
		}
		
		
	
		var message = gBodyM.message_check(item.content);
	//	message = message.replace(/[\n]/gi, "<br>");			
		var editor_body = ""	
		if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){
			var editor_html = item.editor.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
			editor_html = editor_html.replace(/dsw.daesang.com/gi,"dswext.daesang.com");
			message = message + editor_html;
		}
		

		
		if (message.indexOf("&lt;/mention&gt;") > -1){
			//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
			message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
		}
		
		var channel_name = item.channel_name;
		
		var files = item.info;		
		var images = new Array();
		var normalfiles = new Array();		
		for (var i = 0 ; i < files.length; i++){
			var file = files[i];
			var isImage = gap.check_image_file(file.filename);
			if (isImage){
				images.push(file);
			}else{
				normalfiles.push(file);
			}
		}
		
		var fcount = 0;
		if (typeof(files) != "undefined"){
			fcount = files.length;
		}
		
		var ky = item.owner.ky;
		
		var html = "";
	
		var isMe = "me";
		if (item.email.toLowerCase() == uinfo.ky.toLowerCase()){
			html += "<div class='group me' id='ms_"+docid+"'>";
		}else{
			isMe = "you";
			html += "<div class='group you' id='ms_"+docid+"'>";
		}		
		
		
		var etype = "msg";
			
		
		html += "	<dl class='user' >";
		html += "		<dt>";
		html += "			<div class='user-thumb'>"+person_img+"</div>";
		html += "		</dt>";
		html += "		<dd>";
	//	html += "			<span class='name'>"+name+"<em class='team'>"+deptname+"</em></span>";
		html += "			<span class='name'>"+user_info.disp_user_info +"</span>";
		html += "			<div class='time' id='update_time_"+docid+"'>"+time+"</div>";
		html += "		</dd>";
		html += "	</dl>";
		
//		if (isMe == "me"){
//			html += "	<span class='musign'><button class='ico btn-edit' style='width:20px; height:20px; background-position:-206px -212px; position:absolute; right:35px; top:14px' data-channel_code='"+item.channel_code+"' data-channel_name='"+item.channel_name+"' data-channel_id='"+docid+"' data-ty='"+item.type+"' data-type='"+etype+"'>편집</button></span>";
//		}
		if (!is_owner_delete){
			html += "	<button class='ico btn-more' id='btn_more_"+docid+"' data='"+isMe+"' data2='"+item.channel_code+"' data3='"+item.channel_name+"' data4='"+docid+"' data5='"+fcount+"' data6='"+ky+"' data7='"+etype+"' data8='"+show_notice_btn+"' data9='"+is_delete_auth+"' data10='"+is_copy_auth+"'>더보기</button>";
		}
		
		html += "	<div class='talk' style='overflow-x:auto'>";
		
		
		if (is_owner_delete){
			html += "<p>" + gap.owner_delete_msg(item.delete_owner, item.delete_owner_time) + "</p>";
		}else{
			html += "		<div class='wrap-message' style='overflow:hidden'> <!-- wrap-message 감싸기 -->";
			
			if (item.channel_code != gBodyM.cur_opt){
				html += "			<span class='channel-name' data-chcode='"+item.channel_code+"', data-chname='"+item.channel_name+"'>"+channel_name+"</span>";
			}
			
			if ((typeof(item.tyx) != "undefined") && item.tyx == "notice"){
				var subj = item.content;
				if (item.editor && item.title != ""){
					subj = item.title;
				}else if (item.editor){
					subj = item.editor;
				}
				html += '<div class="top">';
				html += '   <div class="req_box" id="req_'+docid+'" data-key=\'' + item.notice_id + '\'>';
				html += '   		<div class="req_left">';
				html += '   			<div class="req_icon" style="background-position: -316px -293px;  border-radius:20px"></div>';
				html += '           		<div class="req_info" style="padding:0px; ">';
				html += '           			<h3 class="reg_notice_class">' + gap.lang.mn3 + '</h3>';
				html += '						<span class="req_txt">' + gap.truncateString(subj, 50) + '</span>';
				html += '           			<span class="bot flex text-ico" style="border-radius:0px; border-top:none; padding:5px;">';
				html += '							<span class="notice-msg-img-ico" style="margin:4px 6px 0 0;"></span><span>' + images.length + '</span>';
				html += '							<span class="notice-msg-attach-ico" style="margin:4px 6px 0 10px;"></span><span>' + normalfiles.length + '</span>';
				html += '           			</span>';	
				html += '           		</div>';
				html += '   		</div>';
				html += '   		<button type="button" class="req_btn" data-type="normal" style="border:none">'+gap.lang.openNewWin+'</button>';
				html += '   </div>';
				html += '</div>';
				
			}else{
				if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){
					
					if (gBodyM.collapse_editor == "1"){
						html += "<h3>"+item.title+"  </h3> ";
						html += "<span class='fold-btns editor' data-key='"+docid+"' ><button class='btn-editor-expand'>"+gap.lang.expand_editor+"</button></span>";
					}else{
						html += "<h3>"+item.title+"</h3>";
					}
					
				}
				
				
				
				var disopt = "";
				
				if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){
					if (gBodyM.collapse_editor == "1"){
						html += "					<span id='ss_"+docid+"' style='display:none'>"+message+"</span>";
						disopt = "none";
					}else{
						html += "					<span id='ss_"+docid+"'>"+message+"</span>";
					}
					
				}else{
					if (rdis){
						html += "					<p class='msg-fold' >"+message+"</p>";
						html += "						<span class='fold-btns' style='cursor:pointer'><button class='btn-expand' style='cursor:pointer'><span style='cursor:pointer'>"+gap.lang.expand+"</span></button></span>";
					}else{
						html += "					<p >"+message+"</p>";
					}
				}
				
				
				
			
				
				var icount = images.length;
				var ccnt = icount - 6;
				var bun = 1;
				if (images.length > 6){
					icount = 6;
					if (images.length > 0){
						html += "			<div class='img-content img"+icount+"' id='img_s_"+docid+"' style='display:"+disopt+"'>";
						for (var i = 0 ; i < icount; i++){
							var image = images[i];		
							var fserver = gap.server_check(item.fserver);
							var image_url = fserver + "/FDownload_thumb.do?id=" + docid + "&md5="+image.md5+"&ty=2";
							var fn = image.filename.replace("'","`");
							if (i == 5){
								html += "				<div class='img-thumb' id='msg_file_"+ docid + "_" + image.md5.replace(".","_")+"' data='"+fn+"' data2='"+isMe+"' data3='"+bun+"'><img src='"+image_url+"' alt=''><span class='img-more'><em>+"+ccnt+"장</em></span></div>";		
							}else{
								html += "				<div class='img-thumb' id='msg_file_"+ docid + "_" + image.md5.replace(".","_")+"' data='"+fn+"' data2='"+isMe+"'  data3='"+bun+"'><img src='"+image_url+"' alt=''></div>";		
							}
							bun++;
						}
						html += "			</div>";
					}
				}else{
					if (images.length > 0){
						html += "			<div class='img-content img"+icount+"' id='img_s_"+docid+"' style='display:"+disopt+"'>";
						for (var i = 0 ; i < icount; i++){
							var image = images[i];				
							var fserver = gap.server_check(item.fserver);
							var image_url = fserver + "/FDownload_thumb.do?id=" + docid + "&md5="+image.md5+"&ty=2";
							var fn = image.filename.replace("'","`");
							
							html += "				<div class='img-thumb' id='msg_file_"+ docid + "_" + image.md5.replace(".","_")+"' data='"+fn+"' data2='"+isMe+"'  data3='"+bun+"'><img src='"+image_url+"' alt=''></div>";		
							bun++;
						}
						html += "			</div>";
					}
				}
				
				
				var xupload_path = item.upload_path;
				var xemail = item.email;
				
				
				if (normalfiles.length > 0){
					//일반 파일일 경우 표시하기
					html += "			<ul class='message-file' style='display:"+disopt+"'>";		
					for (var i = 0 ; i < normalfiles.length; i++){
						var file = normalfiles[i];
						
						var file = normalfiles[i];
						var ftype = gap.file_icon_check(file.filename);
						var size = gap.file_size_setting(parseInt(file.file_size.$numberLong));
						
						var show_video = gap.file_show_video(file.filename);
						var fn = file.filename.replace("'","`");
						

						
						html += "				<li id='msg_file_"+ docid + "_" + file.md5.replace(".","_")+"' data='"+fn+"' data2='"+isMe+"' data3='"+xupload_path+"' data4='"+xemail+"'>";
						html += "					<div class='chat-attach'>";
						html += "						<div>";
						html += "							<span class='ico ico-file  "+ftype+"'></span>";
						html += "							<dl>";
						html += "								<dt>"+file.filename+"</dt>";
						html += "								<dd>"+size+"</dd>";
						html += "							</dl>";
						html += "						</div>";
						html += "					</div>";
						html += "				</li>";		
						
					}
					html += "			</ul>";
				}	
				
				
				
				if ((typeof(item.og) != "undefined") && (typeof(item.og.msg) != "undefined") ){
					//alert("og : " + item.og.msg);
					
					var og = item.og.ex;
					if (typeof(og) != "undefined"){
						var imgurl = og.img;
						var title = og.tle;
						var url = og.lnk;
						var desc = og.desc;
						var dmn = og.dmn;
						if (typeof(og.dmn) == "undefined"){
							dmn = url;
						}
						
						if (typeof(dmn) == "undefined"){					
						}else{
							html += "<div class='link-content'>";
							html += "	<a href='"+url+"' target='_blank'>";
							var emppath = cdbpath + "/img/thm_link.png";
							var im = "<img src='" + imgurl + "' onerror='this.src="+emppath+"' />"
							html += "	<div class='img-thumb'>"+im+"</div>";
							html += "	<ul style='list-style:none;padding:5px; margin-top:10px'>";
							html += "		<li class='link-title' style='color:black'>"+title+"</li>";
							html += "		<li class='link-summary'  style='color:black'>"+desc+"</li>";
							html += "		<li class='link-site'>"+dmn+"</li>";
							html += "	</ul>";
							html += "	</a>";
							html += "</div>";
						}
						

					}
				}			
			}
			
			
			var replylists = item.reply;
			var rcount = 0;
			if (typeof(replylists) != "undefined"){
				rcount = replylists.length;
			}
			
			
			html += "			<ul class='musign message-btns'>";
			var cname= item.channel_name.replace(/&#39;/gi,"-spl-");
			
			if ((gap.cur_channel_info && gap.cur_channel_info.opt_reply && gap.cur_channel_info.opt_reply == "T") || (is_write_auth == "T")){
				html += "				<li><button class='btn' onclick=\"gBodyM.call_reply_window('"+docid+"', '"+item.channel_code+"', '"+cname+"')\">";
				html += "				<em class='ico btn-reply' style='background-position:-126px -212px; margin-top:-3px'></em>"+gap.lang.reply+"<strong id='rp_"+docid+"'>"+rcount+"</strong></button></li>";
			
			}else{
				html += "				<li style='height:38px'>&nbsp;</li>"
			}
			html += "				<li><button class='btn' onclick=\"gBodyM.like_channel_data('"+docid+"','"+item.email.toLowerCase()+"')\">";
			html += "				<em class='ico btn-like' style='background-position:-153px -211px; margin-top:-6px'></em>"+gap.lang.like+"<strong id='like_"+docid+"'>"+like_count+"</strong>";
			html += "				</button></li>";

			
			html += "			</ul>";
			
			
		
			html +=  gBodyM.draw_reply(item);
			
			
			
			
			html += "		</div>";
			html += "	</div>";
			html += "</div>";
		}
		
		
		
		
		return html;
		
	},
	
	
	
	
	"draw_reply" : function(item){
	
		var html = "";
		var uinfo = gap.userinfo.rinfo;	
		
		var docid = "";
		if (item.direct == "T"){
			docid = item._id;
		}else{
			docid = item._id.$oid;
		}
		
		var replylists = item.reply;
		
		
		
		if (typeof(replylists) != "undefined"){			
			if (replylists.length > 0){
				
				html += "<span class='fold-btns repdis'>";
				if (gBodyM.collapse_reply == 1){
					html += "	<button class='btn-reply-expand' data='"+docid+"'><span>"+gap.lang.reply + " " + gap.lang.ex+"</span> (<span id='rcount_"+docid+"'>"+replylists.length+"</span>)</button>";
				}else{
					html += "	<button class='btn-reply-fold' data='"+docid+"'><span>"+gap.lang.reply + " " + gap.lang.fold+"</span> (<span id='rcount_"+docid+"'>"+replylists.length+"</span>)</button>";
				}				
				html += "</span>";
				
				if (gBodyM.collapse_reply == 1){
					html += "<div class='message-reply' id='mr_"+docid+"' style='margin-top:10px; margin-bottom:10px; display:none'>";
				}else{
					html += "<div class='message-reply' id='mr_"+docid+"' style='margin-top:10px; margin-bottom:10px'>";
				}
				
			}else{
				
				
				
				html += "<div class='message-reply' id='mr_"+docid+"' style='display:none; margin-top:10px; margin-bottom:10px'>";
			}
		}else{
			
			
			html += "<div class='message-reply' id='mr_"+docid+"' style='display:none; margin-top:10px; margin-bottom:10px'>";
		}
		
		

		if (typeof(replylists) != "undefined"){
			
			if (replylists.length > 0){
				
				
				
				for (var k = 0 ; k < replylists.length; k++){
					var info = replylists[k];
				//	var user_photo = info.owner.pu;
				//	var user_photo = gap.person_profile_uid(info.owner.ky);
					var user_photo = gap.person_profile_photo(info.owner);
					var user_info = gap.user_check(info.owner);
					var name = user_info.name;
					var content = info.content;
					
				//	var time = gap.change_date_localTime_full2(info.GMT);	
					
					
					
					var day = gap.change_date_default2(gap.change_date_localTime_only_date(info.GMT));
					var time2 = gap.change_date_localTime_only_time(info.GMT);
					var time = day + " " + time2;
					
					
					var message = gBodyM.message_check(info.content);
					
					if (message.indexOf("&lt;/mention&gt;") > -1){
						//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
						message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
					}
					
					html += "<dl id='mreplay_"+info.rid+"' class='user' style=' margin-bottom:7px'>";
					
					html += "	<dt>";
					html += "		<div>";
					html += "			<div class='user-thumb' data='"+info.owner.ky+"'>"+user_photo+"</div>";
					html += "		</div>";
					html += "	</dt>";
					html += "	<dd>";
		//			html += "		<span>"+name+"<em >"+time+"</em></span>";
					html += "		<span>"+user_info.disp_user_info+"<em >"+time+"</em></span>";
					
				
//					if (info.owner.em.toLowerCase() == uinfo.em.toLowerCase()){
//						//html += "<button class='btn-reply-del' style='margin-left:10px' data='"+info.channel_data_id+"' data2='"+info.rid+"' data3='"+item.channel_code+"'><span>삭제</span></button>";
//						
//						html += "<button class='btn-reply-more' data='"+info.channel_data_id+"' data2='"+info.rid+"' data3='"+item.channel_code+"' data4='"+item.channel_name+"'>";
//					//	html += "<span class='ico ico-reply-more'></span>";
//						html += "</button>";
//					
//					}
				
				//	html += "		<div style='font-size:1.5rem'>"+message+"</div>";
					html += "		<p>"+message+"</p>";
					html += "	</dd>";
					html += "</dl>";
					
					
					info.fserver = item.fserver;
					info.upload_path = item.upload_path;
					info.owner_ky = item.owner.ky;
					html += gBodyM.file_infos_draw(info);
					
					
				}
				
			}
		}
		
		html += "</div>";
		
		return html;
	},
	
	
	
	"file_infos_draw" : function(info){
		var html = "";
		
	
		if (typeof(info.file_infos) != "undefined"){
			html += "<div class='reply-filelist' style='padding-top:0px;padding-bottom:0px'>";
			html += "	<div class='chat-attach' id='reply_att_"+info.rid+"' style='padding-top:0px; padding-bottom:0px'>";
			for (var p = 0 ; p < info.file_infos.length; p++){
				var finfo = info.file_infos[p];
				
				
				var fname = finfo.filename;
				var ext = gap.file_icon_check(fname);
				var size = gap.file_size_setting(finfo.file_size);
				var title = fname + "(" + size + ")";
				
				var rpath = info.rid.split("_");
				var rpath2 = rpath[1] + "_" + rpath[2];
				
				var upload_path = info.upload_path + "/reply/" + rpath2;
				var md5 = finfo.md5;
				var ty = finfo.file_type;
				
				var email = "";
				if (typeof(info.owner_ky) != "undefined"){
					email = info.owner_ky;
				}
				
				var id = info.rid;
				var fserver = info.fserver;
				
				
				html += "		<div class='reply-file' data1='"+fserver+"' data2='"+upload_path+"' data3='"+md5+"' data4='"+email+"' data5='"+ty+"' data6='"+id+"' data7='"+fname+"'>";
				html += "			<span class='ico ico-file "+ext+"' style='scale:100%;'></span>";
				html += "			<p style='padding-left:15px;'>"+fname+ "<br>" +  size +"" +"</p>";
//				html += "			<button class='ico btn-file-view' title='미리보기'>미리보기</button>";
//				html += "			<button class='ico btn-file-download' title='다운로드'>다운로드</button>";
				html += "		</div>";
			}

			
			html += "	</div>";
			html += "</div>";		
		}		
		
		return html;
	},
	
	
	
	
	"__draw_reply_event" : function(){
		
		return false;
	},
	
	
	
	
	
	"data_load_member" : function(id){
		var id = "5fa2027960f52439e2a7d8d8";
		id = "5fa2027960f52439e2a7d8d8";
		
		var url = gap.channelserver + "/channel_info_member.km";
		var data = JSON.stringify({
			"id" : id
		});			
		
		$.ajax({
			type : "POST",
			dataType : "json",
			contenType : "application/json; charset=utf-8",
			data : data,
			url : url,
			success : function(res){						
				if (res.result == "OK"){
							
				}else{
					gap.error_alert();
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	
	"data_load_member2" : function(id){
		var id = "5f97d0843131ee4ad1655460";
		var fd = "5fa4f28c5163ed2b4cc1f542";
		
		var url = gap.channelserver + "/drive_info_member.km";
		var data = JSON.stringify({
			"drive_code" : id,
			"folder_code" : fd
		});			
		
		$.ajax({
			type : "POST",
			dataType : "json",
			contenType : "application/json; charset=utf-8",
			data : data,
			url : url,
			success : function(res){						
				if (res.result == "OK"){
							
				}else{
					gap.error_alert();
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	
	
	"data_load_channel2" : function(id){
		var id = "5ffd5e3797ad6f05c15e9600";
		gBodyM.data_load_channel(id);
	},
	
	"data_load_channel" : function(id){
		gBodyM.all_close_layer();

		var url = gap.channelserver + "/file_info_all.km";
		//{"id":"5febdcb32fa7234596c453a8","md5":"65fa99bb2a332173f9219f2205545488.1598834","ty":"2"}: 
		var data = JSON.stringify({
			"id" : id
		});			
		
		$.ajax({
			type : "POST",
			dataType : "json",
			contenType : "application/json; charset=utf-8",
			data : data,
			url : url,
			success : function(res){	
				if (res.result == "OK"){
					
					var item = res.data;
					gBodyM.item = item;
					
					var docid = "";		
					var like_count = 0;
					

					docid = item._id.$oid;
					if (typeof(item.like_count.$numberLong) != "undefined"){
						like_count = item.like_count.$numberLong;
					}else{
						like_count = item.like_count;
					}
					
					var channel_code = item.channel_code;
					var channel_name = item.channel_name;
					gBodyM.target_id = channel_code;
					gBodyM.target_name = channel_name;
					
					var uinfo = gap.userinfo.rinfo;	
			//		var person_img = item.owner.pu;
			//		var person_img = gap.person_profile_uid(item.owner.ky);
					var person_img = gap.person_profile_photo(item.owner);
					var user_info = gap.user_check(item.owner);
					var name = user_info.name;
					var deptname = user_info.dept;
					
					var messagex = item.content;
					var rcount = messagex.split(/\r\n|\r|\n/).length;
					var mcount = messagex.length;
					var rdis = false;
					if ( (rcount > 10) || (mcount > 800)){
						rdis = true;
					}	
					
					var time = gap.change_date_localTime_full2(item.GMT);		
					var message = gBodyM.message_check(item.content);
					message = message.replace(/[\n]/gi, "<br>");			
					var editor_body = ""	
					if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){
						var editor_html = item.editor.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
						message = message + editor_html;
					}
					
					if (message.indexOf("&lt;/mention&gt;") > -1){
						//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
						message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
					}
					
					
					if (typeof(item.ex) != "undefined" && item.ex.type == "mail"){
		
							var tunid = item.ex.target_unid;
							var tdb = item.ex.target_db;
							var jj = "";
							var body = "";
							var target_server = item.ex.target_server;

							// 메일 정보 그리기
							gBodyM.getMailSummary(target_server, tdb, tunid, item);																					
					
					}else{
						var html = "";
						
						html += "<div class='wrap detail-info'>";
						html += "<section style='width:100%;height:100%;padding:0 2rem 0 2rem'> ";
						html += "	<dl class='owner'>";
						html += "		<dt>";
						html += "			<div class='user'>";
						html += "				<div class='user-thumb'>"+person_img+"</div>";
						html += "			</div>";
						html += "			<dd>";
						html += "				<span>"+name+"</span>";
						html += "				<div class='date'>"+time+"</div>";
						html += "			</dd>";
			//			html += "			<button class='ico btn-more'>더보기</button>";
						
						
						html += "		</dt>";
						html += "   </dl>";
						
						
						html += "			<div class='wrap-message'>";
						
						
						
						if (item.type == "emoticon"){
							var sppl = item.epath.split("/");
							var xppl = sppl[sppl.length-1];
							var ep = "/resource/images/emoticons/" + xppl;
						//	html += "                   <div><img src='"+item.epath+"'></div>";
							html += "                   <div><img src='"+ep+"'></div>";
						}
						
						if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){
							html += "<h3>"+item.title+"</h3>";
						}
						
						
						
						html += "				<p>"+message+"</p>";
						
						
//						if ( (item.type == "msg") && (typeof(item.og.msg) == "undefined")){
//							//단순 텍스트 일때만 수정이 가능하게 처리한다.
//							if (item.owner.em.toLowerCase() == uinfo.em.toLowerCase()){
//							//	html += "	<button class='ico btn-edit' id='channel_msg_modify' style='position:absolute; top:34px; right: 20px'  ><span>수정</span></button>";
//								
//							}
//						}
						
						
						
						if (typeof(item.info) != "undefined"){
							var files = item.info;		
							var images = new Array();
							var normalfiles = new Array();		
							for (var i = 0 ; i < files.length; i++){
								var file = files[i];
								var isImage = gap.check_image_file(file.filename);
								if (isImage){
									images.push(file);
								}else{
									normalfiles.push(file);
								}
							}
							
							var icount = images.length;
							if (images.length > 0){
								html += "				<div class='img-content img1'>";
								for (var i = 0 ; i < icount; i++){
									var image = images[i];				
									var fserver = gap.server_check(item.fserver);
									var image_url = fserver + "/FDownload_thumb.do?id=" + docid + "&md5="+image.md5+"&ty=2";
									html += "					<div class='img-thumb' data='"+image.filename+"'><img src='"+image_url+"' alt=''></div>";
								}
								html += "				</div>";
							}
	
							
							if (normalfiles.length > 0){
								html += "				<ul class='message-file'>";
								
								var xemail = item.email;
								var xupload_path = item.upload_path;
								
								for (var i = 0 ; i < normalfiles.length; i++){
									var file = normalfiles[i];
									
									var file = normalfiles[i];
									var ftype = gap.file_icon_check(file.filename);
									var size = gap.file_size_setting(parseInt(file.file_size.$numberLong));
									
									
									
									var show_video = gap.file_show_video(file.filename);
									
									var ty = "";
									if (item.owner.em.toLowerCase() == uinfo.em.toLowerCase()){
										ty = "me";
									}else{
										ty = "you";
									}
									
									html += "					<li data1='"+docid+"' data2='"+file.md5+"' data3='"+file.filename+"' data4='"+ty+"' data5='"+xupload_path+"' data6='"+xemail+"'>";
									html += "						<div class='chat-attach'>";
									html += "							<div>";
									html += "								<span class='ico ico-file "+ftype+"'></span>";
									html += "								<dl>";
									html += "									<dt>"+file.filename+"</dt>";
									html += "									<dd>("+size+")</dd>";
									html += "								</dl>";
									html += "							</div>";
									html += "						</div>";
									html += "					</li>";
								}
													
								html += "				</ul>";
							}
						}
						
						
						
					
						if ((typeof(item.og) != "undefined") && (typeof(item.og.msg) != "undefined") ){
							var og = item.og.ex;
							var imgurl = og.img;
							var title = og.tle;
							var url = og.lnk;
							var desc = og.desc;
							var dmn = og.dmn;
							if (typeof(og.dmn) == "undefined"){
								dmn = url;
							}
							
							if (typeof(dmn) == "undefined"){								
							}else{
								html += "				<div class='link-content'>";
								html += "	<a href='"+url+"' target='_blank'>";
								var emppath = cdbpath + "/img/thm_link.png";
								var im = "<img src='" + imgurl + "' onerror='this.src="+emppath+"' />"
								html += "					<div class='img-thumb'>"+im+"</div>";
								html += "	</a>";
								html += "					<ul style='list-style:none;padding:5px; margin-top:10px'>";
								html += "						<li class='link-title'>"+title+"</li>";
								html += "						<li class='link-summary'  style='color:black'>"+desc+"</li>";
								html += "						<li class='link-site'><a href='"+dmn+"' target='_blank'>"+dmn+"</a></li>";
								html += "					</ul>";
								
								html += "				</div>";
							}
							
							

						}
							
						
						html += "			</div>";
						
						
						var replylists = item.reply;
						if (typeof(replylists) != "undefined"){
							if (replylists.length > 0){
								html += "			<div class='channel-right-reply'>";
								html += "				<h2>"+gap.lang.reply+" <span id='rcount_dis'>("+replylists.length+")</span></h2>";
								for (var k = 0 ; k < replylists.length; k++){
									var info = replylists[k];
								//	var user_photo = info.owner.pu;
								//	var user_photo = gap.person_profile_uid(info.owner.ky);
									var user_photo = gap.person_profile_photo(info.owner);
									var user_info = gap.user_check(info.owner);
									var name = user_info.name;
									var content = info.content;								
									var time = gap.change_date_localTime_full2(info.GMT);				
									var message = gBodyM.message_check(info.content);	
									
									if (message.indexOf("&lt;/mention&gt;") > -1){
										//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
										message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
									}
									
									html += "				<dl id='reply_"+info.rid+"'>";
									html += "					<dt>";
									html += "						<div class='user'>";
									html += "							<div class='user-thumb'>"+user_photo+"</div>";
									html += "						</div>";
									html += "					</dt>";
									html += "					<dd>";
									html += "						<span>"+name+"<em>"+time+"</em></span>";
									
									if (info.owner.em.toLowerCase() == uinfo.em.toLowerCase()){
									//	html += "						<button class='ico btn-edit' style='position:absolute; top:4px; right: 20px' data='"+info.channel_data_id+"' data2='"+info.rid+"' data3='"+item.channel_code+"' data4='"+item.channel_name+"' ><span>수정</span></button>";
										html += "						<button class='ico btn-del1' data='"+info.channel_data_id+"' data2='"+info.rid+"' data3='"+item.channel_code+"' data4='"+item.channel_name+"' ><span>삭제</span></button>";
									}
									
									html += "						<p>"+message+"</p>";
									html += "					</dd>";
									html += "				</dl>";
								}							
								html += "			</div>";
							}
						}					
						html += "		</section>";
						html += "</div>";
					}			
					
									
					$("#dis").html(html);
					
					
					
					
					$(".ico.btn-del1").off();
					$(".ico.btn-del1").on("click", function(e){
						gBodyM.delete_reply(e);
						return false;
					});
					
					$(".img-content .img-thumb").off();
					$(".img-content .img-thumb").on("click", function(e){
						
					
						
						var filename = $(e.currentTarget).attr("data");
						var thum_url = $(e.currentTarget).find("img").attr("src");
						var original_url = thum_url.replace("FDownload_thumb.do","File_MP.do");
					//	gBodyM.show_image(original_url, filename);
						gBodyM.call_preview(original_url, filename, "image");
						
						return false;
						
					});
					
					
					$(".message-file li").off();
					$(".message-file li").on("click", function(e){
					
					//	var oob = $(e.currentTarget).attr("data1");
						var filename = $(e.currentTarget).attr("data3");	
						
					
						var id = $(e.currentTarget).attr("data1");
						var md5 = $(e.currentTarget).attr("data2");	
						var fs = gap.channelserver;						
						var ext = gap.is_file_type_filter(filename);
						
						var upload_path = $(e.currentTarget).attr("data5");	
						var email = $(e.currentTarget).attr("data6");	
						var ex = gap.file_extension_check(filename);
												
						var kkk = gBodyM.pp_check(filename);						
						
						if (ext == "movie"){
							//https://meet.kmslab.com:8443/WMeet/FDownload.do?id=6000002dba387b3593850abc&md5=3ee86da10765f08423414819fe8acde4.867414&ty=2
							var fserver = gap.server_check(fs);
							//var url = fserver + "/FDownload.do?id="+ id + "&md5="+ md5 + "&ty=2";
						
							
							var vserver = gap.search_video_server(fserver);
							var url = vserver + "/2/" + email + "/" + upload_path + "/" + md5 + "/" + ex;
							
							
							
							gBodyM.call_preview(url, filename, "video");
						}else if (gBodyM.pp_check(filename)){
							gBodyM2.file_convert(fs, filename, md5, id, "2");
						}else{
							gap.gAlert(gap.lang.noconvert);
						}	
						return false;
					});
					
					
					
					$("#channel_msg_modify").off();
					$("#channel_msg_modify").on("click", function(e){
						
												
						
//						var message = gBodyM.message_check(item.content);
						var message = $(".wrap-message p").html();
						var message = message.replace(/\<br\>/gi, "\n\r").replace(/&nbsp;/gi," ");	
						$("#rmtext").val(message);
						
						
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
							gap.hideBlock();
							$("#rmlayer").hide();
						});

						$("#rmcancel").off();
						$("#rmcancel").on("click", function(e){
							$("#rmclose").click();
						});

						$("#rmsave").off();
						$("#rmsave").on("click", function(e){		
							
							
							var msg = $("#rmtext").val();
							
							var data = JSON.stringify({
								"type" : "msg",
								"channel_code" : gBodyM.target_id,
								"channel_name" : gBodyM.target_name,
								"email" : gap.userinfo.rinfo.ky,
								"owner" : gap.userinfo.rinfo,
								"content" : msg,
								"edit" : "F",
								"msg_edit" : "T",
								"id" : gBodyM.item._id.$oid,
								"og" : {}
							});
							
							var url = gap.channelserver + "/send_msg.km";
							$.ajax({
								type : "POST",
								dataType : "text",   //<<== "json"을  text로 변경한 것은 입력 내용에 ?? 가 2개 이상 있을 경우 JQuery오류가 발생해서 변경함 // 대신 리턴값을 JSON.parse로 처리해야 함
							//	contentType : "application/json; charset=utf-8",
								data : data,
								url : url,
								success : function(ress){
									var resx= JSON.parse(ress);
									if (resx.result == "OK"){

														
										var res = resx.data.docinfo;
										
										var GMT = resx.GMT;
										var doc = new Object();
										doc.GMT = GMT;
										doc.GMT2 = res.GMT2;
										doc.channel_code = gBodyM.target_id;
										doc.channel_name = gap.textToHtml(gBodyM.target_name);
										doc.email = gap.userinfo.rinfo.ky;
										var jj = JSON.parse(data);
										doc.content = jj.content;
										doc.owner = gap.userinfo.rinfo;
										doc.type = jj.type;
																													
										doc._id = jj.id;
																				
										doc.direct = "T";										
										doc.editor = jj.editor;
										doc.title = jj.title;
										
										if (jj.type == "emoticon"){
											doc.epath = jj.epath;
										}
									
										if (typeof(res.og) != "undefined"){
											doc.og = res.og;
										}
										
										if (typeof(res.ex) != "undefined"){
											//메일 처럼 다른 시스템에서 호출되는 경우 처리한다.
											doc.ex = res.ex;
										}
										
										
										var date = gap.change_date_localTime_only_date(GMT);
										var html = "";
										
										
										//html = gBody3.draw_msg(doc, jj.type, date);
										var message = $("#rmtext").val().replace(/[\n]/gi, "<br>");
										$(".wrap-message p").html(message);
										
										doc.date = date;
										doc.edit = "T";
										doc.res = res;
										doc.doctype = doc.type;
										
										gBodyM.send_socket(doc, "ms"); 
																	
										
										$("#rmtext").val("");
										$("#rmcancel").click();
										
									}else{
										gap.gAlert(gap.lang.errormsg);
									}
								},
								error : function(e){
									gap.gAlert(gap.lang.errormsg);
								}
							});
						
							
							
						});
						return false;
					});
					
					$(".channel-right-reply .btn-edit").on("click", function(e){
						
						gBodyM.cid = $(this).attr("data");
						gBodyM.rid = $(this).attr("data2");
												
						
						var message = $(this).parent().find("p").html();
					//	var message = message.replace(/\<br\>/gi, "\n\r").replace(/&nbsp;/gi," ");	
						var message = message.replace(/\<br\>/gi, "\n").replace(/&nbsp;/gi," ");	
						
						$("#rmtext").val(message);
						
						
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
							gap.hideBlock();
							$("#rmlayer").hide();
						});

						$("#rmcancel").off();
						$("#rmcancel").on("click", function(e){
							$("#rmclose").click();
						});

						$("#rmsave").off();
						$("#rmsave").on("click", function(e){		
							
												
							var channel_id = gBodyM.target_id;
							var channel_name = gBodyM.target_name;						
								
							gBodyM.reply_modify(gBodyM.cid, gBodyM.rid, channel_code, channel_name);
							
							
						});
						return false;
					});	
					
					//멘션을 클릭한 경우 사용자 정보를 표시한다.
					$(".wrap.detail-info mention").off();
					$(".wrap.detail-info mention").on("click", function(e){
						var id = $(this).attr("data");
						var url_link = "kPortalMeet://NativeCall/callUserProfile?ky=" + encodeURIComponent(id);
						gBodyM.connectApp(url_link);
						return false;
					});
					
					
				}else{
					gap.error_alert();
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"getMailSummary" : function(target_server, tdb, tunid, item){
		var url = "(agtGetMailInfo)?openAgent&ms=" + target_server + "&mf=" + target_server + "/WebChat/bigfile/bigmail" + tdb + ".nsf&unid=" + tunid + "&lang=ko&type=body";
		$.ajax({
			type : "GET",
			url : url,
			contentType : "application/json; charset=utf-8",
			success : function(res){
			
				jj = JSON.parse(res);
				
				var url = "/" + target_server + "/WebChat/bigfile/bigmail"+tdb+".nsf/0/"+tunid+"/Body?OpenField"
				$.ajax({
					type : "GET",
					url : url,
					contentType : "text/plain; charset=utf-8",
					success : function(res){
						var xfrom = jj.from.split("^");
						var from = xfrom[0] + "&lt;" + xfrom[1] + "&gt;";
						var html = "";
						
						html += "<div class='wrap contents-view mail' style='padding:10px'>";
						html += "<section style='padding: 0 10px'>";
						html += "	<h1>"+jj.subject+"</h1>";
						html += "	<dl class='owner'>";
						html += "		<dt>";
						html += "			<div class='user' >";
						html += "				<div class='user-thumb'><img src='../../../"+jj.photo+"' alt=''></div>";
						html += "			</div>";
						html += "		</dt>";
						html += "		<dd>";
						html += "			<span>"+from+"<!--<button class='ico btn-detail-open'>펼치기</button>  접기 : .btn-detail-close, 클릭시 .get-view 접고 펼치기, btn-detail-close가 기본 --></span>";
						html += "			<div class='date'>"+jj.simpledate+"</div>";
						html += "		</dd>";
						html += "	</dl>";
						html += "	<div class='get-view'>";
						html += "		<dl>";
						html += "			<dt style='width:30px'>TO</dt>";
						if (jj.sendto_info == '' || jj.sendto_info == undefined) {
							html += "			<dd><span>"+jj.sendto.replace(/\</gi,'&lt;')+"</span></dd>";
							
						}else{
							html += "			<dd><span>"+jj.sendto_info.replace(/\</gi,'&lt;')+"</span></dd>";
						}
				
						html += "		</dl>";
						
						
						if (jj.ccCnt > 0){
							html += "		<dl>";
							html += "			<dt style='width:30px'>CC</dt>";
							if (jj.copyto_info == '' || jj.copyto_info == undefined) {
								html += "			<dd><span>"+jj.copyto.replace(/\</gi,'&lt;').replace(/,/gi,'<br>')+"</span></dd>";
								
							}else{
								html += "			<dd><span>"+jj.copyto_info.replace(/\</gi,'&lt;').replace(/,/gi,'<br>')+"</span></dd>";
							}
							html += "		</dl>";
						}
						
						if (jj.bccCnt > 0){
							html += "		<dl>";
							html += "			<dt style='width:30px'>BCC</dt>";
							if (jj.blindcopyto_info == '' || jj.blindcopyto_info == undefined) {
								html += "			<dd><span>"+jj.blindcopyto.replace(/\</gi,'&lt;').replace(/,/gi,'<br>')+"</span></dd>";
								
							}else{
								html += "			<dd><span>"+jj.blindcopyto_info.replace(/\</gi,'&lt;').replace(/,/gi,'<br>')+"</span></dd>";													
							}
							html += "		</dl>";
						}

						html += "	</div>";
						
						
						var attnames = jj.attachmentname.split("}`");											
						var attsizes = jj.attachmentsize.split("}`");		
						var attexts = jj.attachmentext.split("}`");	
						var atturl = jj.attachmenturl;
						
						if (jj.attachmentname != ""){
							html += "	<div class='attach-list'>";											
							html += "		<h2>"+gap.lang.attachment+" <strong>"+attnames.length+"</strong> </h2>"; ///<span>(12.5MB)</span>
					//		html += "		<button class='btn-save-all'><span>모두저장</span></button>";
							html += "		<ul style='list-style:none'>";
							
							for (var i = 0 ; i < attnames.length; i++){
								var attn = attnames[i];
								var atts = attsizes[i];
								var atte = attexts[i];
								var icon = gap.file_icon_check(attn);
								
								html += "			<li data2='"+attn+"' data='"+jj.unid+"' data3='"+jj.mailFile+"' data4='"+target_server+"'>";
								html += "				<div class='chat-attach'>";
								html += "					<div>";
								html += "						<span class='ico ico-s "+icon+"'></span>";
								html += "						<dl>";
								html += "							<dt>"+attn+"</dt>";
								html += "							<dd>("+gap.file_size_setting(atts)+")</dd>";
								html += "						</dl>";
								html += "					</div>";
								html += "				</div>";
								html += "			</li>";
							}								
							
							html += "		</ul>";
							html += "	</div>";
						}
															
						
						html += "	<div class='read'>";
						html += gBodyM.get_body_html(res);
						html += "	</div>";
						
				
						if (typeof(item) != "undefined"){
							var replylists = item.reply;
							if (typeof(replylists) != "undefined"){
								if (replylists.length > 0){
									html += "			<div class='channel-right-reply'>";
									html += "				<h2>"+gap.lang.reply+" <span id='rcount_dis'>("+replylists.length+")</span></h2>";
									for (var k = 0 ; k < replylists.length; k++){
										var info = replylists[k];
									//	var user_photo = info.owner.pu;
									//	var user_photo = gap.person_profile_uid(info.owner.ky);
										var user_photo = gap.person_profile_photo(info.owner);
										var user_info = gap.user_check(info.owner);
										var name = user_info.name;
										var content = info.content;								
										var time = gap.change_date_localTime_full2(info.GMT);				
										var message = gBodyM.message_check(info.content);	
										
										if (message.indexOf("&lt;/mention&gt;") > -1){
											//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
											message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
										}
										
										html += "				<dl id='reply_"+info.rid+"'>";
										html += "					<dt>";
										html += "						<div class='user'>";
										html += "							<div class='user-thumb'>"+user_photo+"</div>";
										html += "						</div>";
										html += "					</dt>";
										html += "					<dd>";
										html += "						<span>"+name+"<em>"+time+"</em></span>";
										
										if (info.owner.em.toLowerCase() == uinfo.em.toLowerCase()){
											html += "						<button class='ico btn-del1' data='"+info.channel_data_id+"' data2='"+info.rid+"' data3='"+item.channel_code+"' data4='"+item.channel_name+"' ><span>삭제</span></button>";
										}
										
										html += "						<p>"+message+"</p>";
										html += "					</dd>";
										html += "				</dl>";
									}							
									html += "			</div>";
								}
							}
						}
						
						html += "</section>";
						html += "</div>";
				
						$("#dis").html(html);
						
						
						$(".ico.btn-del1").off();
						$(".ico.btn-del1").on("click", function(e){
							gBodyM.delete_reply(e);
							return false;
						});
						
						$(".attach-list li").on("click", function(e){
							var unid = $(e.currentTarget).attr("data");
							var filename = $(e.currentTarget).attr("data2");
							var fx = $(e.currentTarget).attr("data3");
							
							
							var ppl = fx.split("/");
							var tpl = ppl[ppl.length-1];
							//var tdb = fx.replace("mail/bigmail/bigmail","").replace(".nsf","");
							var tdb = tpl.replace("bigmail","").replace(".nsf","");
							var tserver = $(e.currentTarget).attr("data4");
							
							gBodyM.file_convert_mail(unid, filename, tdb, tserver, '');
							
						});
					},
					error : function(e){
						gap.error_alert();
					}
				})
				
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	},
	
	"reply_modify" : function(channel_id, rid, channel_code, channel_name){
		
	//	var rinfo = gBody3.select_reply_info;
		

		var channel_data_id = channel_id;
		var reply_id = rid;
		var channel_code = channel_code;
		var content = $("#rmtext").val();
		

		var url = gap.channelserver + "/modify_reply.km";
		var data = JSON.stringify({
			"owner" : gap.userinfo.rinfo,
			"channel_data_id" :  channel_data_id,
			"reply_id" : reply_id,
			"content" : content
		});
		gBodyM.tempData = data;
		
		$.ajax({
			type : "POST",
			dataType : "text",
			url : url,
			data : data,
			
			success : function(ress){
			
			
				var res = JSON.parse(ress);
				if (res.result == "OK"){
					gap.hideBlock();
					$("#rmlayer").hide();
					
					var txt = $("#rmtext").val();
					$("#rmtext").val("");
					
					$("#mreplay_" + reply_id).remove();
					$("#reply_" + reply_id).remove();
					
					
					var channe_code = gBodyM.target_id;
					var channe_name = gBodyM.target_name;
					
					var id = channel_data_id;				
					
					var GMT = res.data.GMT;
			
					//타켓 문서를 현재 창에서 제거하고 오늘의 마지막으로 이동시킨다... 댓글을 달면 최근 데이터로 업데이트 한다.
					//var klen = $("#ms_" + channel_id).length;
					
					//////////////////////////////////////////////////////////////////////////////
					var info = res.data;
				//	var user_photo = gap.userinfo.rinfo.pu;
					
				//	var user_photo = gap.person_profile_uid(gap.userinfo.rinfo.ky);
					var user_photo = gap.person_profile_photo(gap.userinfo.rinfo);
					var user_info = gap.user_check(gap.userinfo.rinfo);
					var name = user_info.name;
					
					var content = txt;								
				//	var time = gap.change_date_localTime_full2(info.GMT);
					var day = gap.change_date_default2(gap.change_date_localTime_only_date(info.GMT));
					var time2 = gap.change_date_localTime_only_time(info.GMT);
					var time = day + " " + time2;
					var message = gBodyM.message_check(content);								
					var html = "";
					html += "				<dl id='reply_"+info.rid+"'>";
					html += "					<dt>";
					html += "						<div class='user'>";
				//	html += "							<div class='user-thumb'><img src='"+user_photo+"' alt=''></div>";
					html += "							<div class='user-thumb'>"+user_photo+"</div>";
					html += "						</div>";
					html += "					</dt>";
					html += "					<dd>";
					html += "						<span>"+name+"<em>"+time+"</em></span>";
					
					//if (info.owner.em.toLowerCase() == uinfo.em.toLowerCase()){
						html += "						<button class='ico btn-edit' style='position:absolute; top:4px; right: 20px' data='"+id+"' data2='"+info.rid+"' data3='"+channel_code+"' data4='"+channel_name+"' ><span>수정</span></button>";
						html += "						<button class='ico btn-del1' data='"+id+"' data2='"+info.rid+"' data3='"+channel_code+"' data4='"+channel_name+"' ><span>삭제</span></button>";
					//}
					
					html += "						<p>"+message+"</p>";
					html += "					</dd>";
					html += "				</dl>";
					
					$(".channel-right-reply").append(html);
					/////////////////////////////////////////////////////////////////////////
									
					
					var obj = new Object();
					obj.reply_id = reply_id;
					obj.id = channel_data_id;
					obj.channel_code = channel_code;
					obj.channel_name = gap.textToHtml(channel_name);
					obj.content = content;
					obj.resdata = res.data;
					obj.tempdata = gBodyM.tempData;
					obj.owner = gap.userinfo.rinfo;
					gBodyM.send_socket(obj, "mr");
					
					
					$(".ico.btn-del1").off();
					$(".ico.btn-del1").on("click", function(e){
						gBodyM.delete_reply(e);
						return false;
					});
					
					
					$(".channel-right-reply .btn-edit").on("click", function(e){
						
						gBodyM.cid = $(this).attr("data");
						gBodyM.rid = $(this).attr("data2");
												
						var message = $(this).parent().find("p").html();
						var message = message.replace(/\<br\>/gi, "\n\r").replace(/&nbsp;/gi," ");	
						
						$("#rmtext").val(message);
						
											
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
							gap.hideBlock();
							$("#rmlayer").hide();
						});

						$("#rmcancel").off();
						$("#rmcancel").on("click", function(e){
							$("#rmclose").click();
						});

						$("#rmsave").off();
						$("#rmsave").on("click", function(e){		
							
												
							var channel_id = gBodyM.target_id;
							var channel_name = gBodyM.target_name;						
								
							gBodyM.reply_modify(gBodyM.cid, gBodyM.rid, channel_code, channel_name);
							
							
						});
						return false;
					});
					
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
	},
	
	
	
	
	
	
	"delete_reply" : function(obj){
		
		
		var msg = gap.lang.confirm_delete;
		//	msg += "<div style='text-align:left;  padding-top:10px;'>["+gap.lang.cose+"]</div>" + slist;
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
							obj = obj.currentTarget;
			
							var channel_data_id = $(obj).attr("data");
							var reply_id = $(obj).attr("data2");
							var channel_code = $(obj).attr("data3");
							var channel_name = $(obj).attr("data4");
			
							
							var url = gap.channelserver + "/delete_reply.km";
							var data = JSON.stringify({
								"channel_data_id" :  channel_data_id,
								"reply_id" : reply_id
							});
							
							$.ajax({
								type : "POST",
								dataType : "json",
								url : url,
								data : data,
								success : function(res){
								
									if (res.result == "OK"){
										
									//	$("#mreplay_" + reply_id).remove();
										$("#reply_" + reply_id).remove();
										
										var id = channel_data_id;
										
										var cnt = $(".channel-right-reply dl").length;
										
										if (cnt == 0 ){
											$("#ms_"+id).find(".message-reply").remove();
										}
										
										$("#rcount_dis").text("(" + cnt + ")");	
								
			//							$("#r_"+id).next().text( cnt  );
			//							$(".comment").parent().find("h2 span").text("(" + cnt + ")");					
										//응답 개수를 다시 계산해야 한다.
										
										var obj = new Object();
										obj.reply_id = reply_id;
										obj.id = channel_data_id;
										obj.channel_code = channel_code;
										obj.channel_name = gap.textToHtml(channel_name);
										gBodyM.send_socket(obj, "dr");
									}else{
										gap.gAlert(gap.lang.errormsg);
									}
								},
								error : function(e){
									gap.gAlert(gap.lang.errormsg);
								}
							})
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
	
	
	"like_channel_data" : function(id, email){
		
		if (email == gap.userinfo.rinfo.em.toLowerCase()){
			gap.gAlert(gap.lang.nolike);
			return false;
		}else{
			var url = gap.channelserver + "/channel_data_like.km";
//			var data = JSON.stringify({
//				"id" : id,
//				"email" : gap.userinfo.rinfo.ky
//			});			
			
			var data = JSON.stringify({
				"id" : id,
				"email" : gap.userinfo.rinfo.ky,
				"owner" : gap.userinfo.rinfo
			});
			
			$.ajax({
				type : "POST",
				dataType : "json",
				contenType : "application/json; charset=utf-8",
				data : data,
				url : url,
				success : function(res){						
					if (res.result == "OK"){							
						$("#like_" + id).html(res.data.count);					
					}else if (res.result == "EXIST"){
						gap.gAlert(gap.lang.badded);
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});
		}
		
		
	},
	
	
	"search_channel_members" : function(channelid){
		
		var infos = gBodyM.cur_channel_list_info;
		if (infos == ""){
			gBodyM.load_channel_list_info();
			infos = gBodyM.cur_channel_list_info;
		}
		var members = new Object();
		
		for (var i = 0 ; i < infos.length; i++){
			var info = infos[i];
			if (info.ch_code == channelid){
				members.member = info.member;
				members.owner = info.owner;
				return members;
				break;
			}
		}
	},
	
			
	
//	"send_socket" : function(obj, id){
//		
//				
//		obj.type = id;
//		var ch_code = obj.channel_code;
//		
//		var ll = gBodyM.search_channel_members(ch_code);
//		var members = ll.member;
//			
//		if ( (typeof(members) != "undefined") &&  (members.length > 0)){
//			for (var i = 0 ; i < members.length; i++){
//				var lx = members[i];
//			//	if (lx.ky != gap.userinfo.rinfo.ky){
//					//본인이 아닌 경우만 발송합니다.
//					obj.sender = lx.ky;
//					//_wsocket.send_box_msg(obj, id);
//					gBodyM.send_box_msg(obj, id);
//			//	}		
//			}
//		}	
//		//채널에 owner가 내가 아닌 경우 owner에게 발송합니다.
//
//	//	if ( (ll.owner.ky != gap.userinfo.rinfo.ky) ){
//	//		gap.gAlert("ll.owner.ky : " + ll.owner.ky);
//
//			obj.sender = ll.owner.ky;			
//			obj.callfrom = "mobile";			
//			//_wsocket.send_box_msg(obj, id);
//			gBodyM.send_box_msg(obj, id);
//	//	}
//		
//	//	_wsocket.send_box_msg(doc);
//	},
	
	
	"send_socket" : function(obj, id){
		
		
		obj.type = id;
		var ch_code = obj.channel_code;
		
		var ll = gBodyM.search_channel_members(ch_code);
		var members = ll.member;
			
		var list = [];
		if ( (typeof(members) != "undefined") &&  (members.length > 0)){
			for (var i = 0 ; i < members.length; i++){
				var lx = members[i];
				list.push(lx.ky);
//					//본인이 아닌 경우만 발송합니다.
//					obj.sender = lx.ky;
//					//_wsocket.send_box_msg(obj, id);
//					gBodyM.send_box_msg(obj, id);
				
			}
		}	
		//채널에 owner가 내가 아닌 경우 owner에게 발송합니다.

	//	if ( (ll.owner.ky != gap.userinfo.rinfo.ky) ){
	//		gap.gAlert("ll.owner.ky : " + ll.owner.ky);
			list.push(ll.owner.ky);
			obj.sender = list;			
			obj.callfrom = "mobile";			
			//_wsocket.send_box_msg(obj, id);
			
			gBodyM.send_box_msg(obj, id);
	//	}
		
	//	_wsocket.send_box_msg(doc);
	},
	
	
	"search_channel_member" : function(channel_code){
		//채널 코드를 넘겨주면 채널 코드 멤버 중에 본인을 제외한 나머지 사용자 ky를 배열로 리턴해 준다.
		
		var ll = gBodyM.search_channel_members(channel_code);
		var members = ll.member;	
		
		var list = [];	
		if ( (typeof(members) != "undefined") &&  (members.length > 0)){
			for (var i = 0 ; i < members.length; i++){
				var lx = members[i];
				if (lx.dsize != "group"){
					if (lx.ky != gap.userinfo.rinfo.ky){
						list.push(lx.ky);
					}	
				}				
			}
		}	
		if ( (ll.owner.ky != gap.userinfo.rinfo.ky) ){	
			list.push(ll.owner.ky);
		}
		
		return list;
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

	"htmlTOtext" : function(content){
		
		content = content.replace(/<(\/a|a)([^>]*)>/gi,"");
		
		content = content.replace(/&lt;/g, '<').replace(/&gt;/g, '>');		
		content = content.replace(/&amp;/gi,"&");
		content = content.replace(/<br>/gi, "\r\n");
		content = content.replace(/&nbsp;/gi, " ");
		
		return content;
	},
	
	
	"receive_box_msg" : function(obj){
		//gap.gAlert("receive_box_msg")
		if (gBodyM.select_files_tab){
			//현재 Files탭을 보고 있을 경우 처리하지 않는다.
			return false;
		}
		var cur_channel = gBodyM.cur_opt;
		var jj = JSON.parse(obj.f1);
		if (typeof(jj._id) != "undefined" && typeof(jj._id.$oid) != "undefined"){
			jj._id = jj._id.$oid;
		}
		
	//	gap.gAlert(jj.channel_code);
	//	gap.gAlert(jj.type);
		if ( ((cur_channel == jj.channel_code) || (cur_channel == "allcontent") || (cur_channel == "sharecontent") || (cur_channel == "allmention"))  ){
			
			if (jj.type == "ms"){
			//	if (jj.owner.em == gap.userinfo.rinfo.em){
			//		if (jj.callfrom == "mobile"){
			//			return false;
			//		}
			//	}
				
				//상대방이 메시지를 입력한 경우
				var jinfo = JSON.parse(obj.f1);
				
				if (jinfo.edit == "T"){
					var doc = jinfo;
					var date = gap.change_date_localTime_only_date(jinfo.GMT);
					var html = "";
					
					if (typeof(doc._id.$oid) != "undefined"){
						doc._id = doc._id.$oid;
					}
					
					gBodyM.select_doc_info = jinfo.res;
					
					if (jinfo.doctype == "file"){
						//에디터에서 작성한 첨부가 있는 파일을 편집해서 재 저장한 경우 여기를 타지만 파일로 인식해야 한다.
						doc.fserver = jinfo.res.fserver;
						doc.info = jinfo.res.info;
						doc.upload_path = jinfo.res.upload_path;
						
						var is_write_auth = gap.mobile_write_auth_check();
						
						html = gBodyM.draw_file(doc, jj.type, is_write_auth);
					}else{
						if (typeof(jj.epath) != "undefined"){
							jj.type = "emoticon";
						}
						
						
						var is_write_auth = gap.mobile_write_auth_check();					
						html = gBodyM.draw_msg(doc, jj.type, date, is_write_auth);
					}

					gBodyM.direct_draw(html, jinfo.GMT, doc._id);
					
				}else{
					if (typeof(jj.epath) != "undefined"){
						jj.type = "emoticon";
					}
					
					var is_write_auth = gap.mobile_write_auth_check();
					var html = gBodyM.draw_msg(jj, jj.type, jj.date, is_write_auth);
					gBodyM.direct_draw(html, jj.GMT, jj._id);
				}
				
				if (typeof(jj.tyx) != "undefined" && jj.tyx == "notice"){
					var url_link = "kPortalMeet://NativeCall/callRegNoticeChannel?id=" + encodeURIComponent(jj.channel_code);
					gBodyM.connectApp(url_link);
					return false;
				}

			}else if(jj.type == "fs"){
				//상대방이 파일을 업로드한  경우
			
				var jinfo = JSON.parse(obj.f1);
				gBodyM.select_doc_info = jinfo.res;	
				
				var is_write_auth = gap.mobile_write_auth_check();
				
				var html = gBodyM.draw_file(jj, jj.date, is_write_auth);		
				gBodyM.direct_draw(html, jj.GMT, jj._id);
				
				if (typeof(jj.tyx) != "undefined" && jj.tyx == "notice"){
					var url_link = "kPortalMeet://NativeCall/callRegNoticeChannel?id=" + encodeURIComponent(jj.channel_code);
					gBodyM.connectApp(url_link);
					return false;
				}
				
			}else if(jj.type == "update_notice_channel"){
				// 공지사항이 수정된 경우
				var url_link = "kPortalMeet://NativeCall/callRegNoticeChannel?id=" + encodeURIComponent(jj.channel_code);
				gBodyM.connectApp(url_link);
				return false;
			
			}else if(jj.type == "delete_notice_channel"){
				// 공지사항이 삭제된 경우
				var url_link = "kPortalMeet://NativeCall/callDelNoticeChannel?id=" + encodeURIComponent(jj.channel_code);
				gBodyM.connectApp(url_link);
				return false;
				
			}else if (jj.type == "del_msg"){
				//msg타입을 전체 삭제한 경우				
				var id = jj.id;
				var obj = $("#ms_" + id);				
				if (obj.length > 0){
					var parent = obj.parent();
					var date = parent.first().attr("data");
					$("#ms_" + id).remove();
					
					//해당 일에 데이터가 없을 경우 날짜 표시 데이터를 제거한다.
					if (parent.children().length == 1){
						parent.remove();
					}					
				}
				/*
				var ddx = $("#ms_" + id).attr("data");
				$("#ms_" + id).fadeOut().fadeOut();
			//	$("#ms_" + id).remove();
				
				//date항목을 삭제해야 할지 체크하는 로직입니다.
				var last_className = $("#web_channel_dis_" + ddx).next().attr("class");
				if (last_className != "xman"){
					$("#web_channel_dis_" + ddx).fadeOut();
				}		
				*/		
			}else if (jj.type == "sr"){
				//상대방이 응답을 저장한 경우			
			
				gBodyM.tempData = JSON.parse(obj.f1).tempData;
					
				
				var json = JSON.parse(gBodyM.tempData);			
				//타켓 문서를 현재 창에서 제거하고 오늘의 마지막으로 이동시킨다... 댓글을 달면 최근 데이터로 업데이트 한다.
				
				var date = gap.change_date_localTime_only_date(json.GMT);
				var klen = $("#ms_" + json.channel_data_id).length;
				//var date = $("#ms_" + json.channel_data_id).attr("data");
				
			
			
				if (klen > 0){
				
					//html +=  gBodyM.draw_reply(item);
					var dis_date = gap.change_date_default(gap.change_date_localTime_only_date(json.GMT));
					var dis_id = "date_" + date;
					var cnt = $("#web_channel_dis_" + date).length;
					
					if (gBodyM.post_view_type == 2){		
						
					}else{
						if (cnt == 0){		
							var datehtml = "";
							datehtml += "<div class='wrap-channel' >";
							
							if (gap.userinfo.rinfo.ky == jj.owner.ky){
								datehtml += "<div class='date' id='web_channel_dis_"+date+"' data='"+date+"'><span>"+dis_date+"</span></div>";
							}else{
								datehtml += "<div class='date' id='web_channel_dis_"+date+"' data='"+date+"'><span>"+dis_date+"</span></div>";
							}
							
							datehtml += "</div>";
							
							$("#channel_list").append(datehtml);
							
							var xhtml = $("#ms_" + json.channel_data_id).get(0).outerHTML;
							$("#ms_" + json.channel_data_id).remove();
							$("#web_channel_dis_" + date).parent().append(xhtml);
							$("#ms_" + json.channel_data_id).show();
						}else{
							var xhtml = $("#ms_" + json.channel_data_id).get(0).outerHTML;
							$("#ms_" + json.channel_data_id).remove();
							$("#web_channel_dis_" + date).parent().append(xhtml);
							
						}
					}
					
		
					
					var ccn = $("#mr_" + json.channel_data_id).length;
					var ccn_child = $("#mr_" + json.channel_data_id).children().length;
					//기존 하위에 댓글이 없는 경우 접고 펼치기를 추가해 주어야 한다.
					if (ccn_child == 0){
						var khtml = "<span class='fold-btns repdis'>";
						if (gBodyM.collapse_reply == 1){
							khtml += "	<button class='btn-reply-expand' data='"+json.channel_data_id+"'><span>"+gap.lang.reply + " " + gap.lang.ex+"</span> (<span id='rcount_"+json.channel_data_id+"'>1</span>)</button>";
						}else{
							khtml += "	<button class='btn-reply-fold' data='"+json.channel_data_id+"'><span>"+gap.lang.reply + " " + gap.lang.fold+"</span> (<span id='rcount_"+json.channel_data_id+"'>1</span>)</button>";
						}				
						khtml += "</span>";
						$(khtml).insertBefore($("#mr_" + json.channel_data_id));
					}
					
					if (ccn > 0){
						var uinfo = gap.userinfo.rinfo;	
					
					//	var user_photo = json.owner.pu;
					//	var user_photo = gap.person_profile_uid(json.owner.ky);
						var user_photo = gap.person_profile_photo(json.owner);
						var user_info = gap.user_check(json.owner);
						var name = user_info.name;
						var content = json.content;
						
						
						var day = gap.change_date_default2(gap.change_date_localTime_only_date(json.GMT));
						var time2 = gap.change_date_localTime_only_time(json.GMT);
						var time = day + " " + time2;
						
					//	var time = gap.change_date_localTime_full2(json.GMT);	
						
						
						
						var message = gBodyM.message_check(content);
						
						if (message.indexOf("&lt;/mention&gt;") > -1){
							//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
							message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
						}
												
						var html = "";
						html += "<dl id='mreplay_"+json.rid+"' class='user'>";
						html += "	<dt>";
						html += "		<div>";
						html += "			<div class='user-thumb' data='"+json.owner.ky+"'>"+user_photo+"</div>";
						html += "		</div>";
						html += "	</dt>";
						html += "	<dd>";
					//	html += "		<span>"+name+"<em>"+time+"</em></span>";
						html += "		<span>"+user_info.disp_user_info+"<em>"+time+"</em></span>";
						
						
					
						html += "		<p>"+message+"</p>";
						html += "	</dd>";
						html += "</dl>";		
						
						var info = json;
						info.fserver = jj.fserver;
						info.upload_path = jj.upload_path;
						info.owner_ky = json.owner.ky;
						html += gBodyM.file_infos_draw(info);
	
						
						//동일한 댓글이 2개 동시에 표시되는 문제 해결을 위해 동일한 key가 있으면 추가하지 않는다.
						if ($("#mreplay_"+json.rid).length == 0){
							if (gBodyM.collapse_reply != "1"){
								$("#mr_" + json.channel_data_id).show();
							}
							
							
							$("#mr_" + json.channel_data_id).append(html);
							var rcount = $("#mr_" + json.channel_data_id).find("dl").length;
							$("#rp_" + json.channel_data_id).text(rcount);
							$("#rcount_" + json.channel_data_id).text(rcount);
							
							//원본이 수정된 시간을 변경해 준다.
							
							var GMT = json.GMT;
							var GMT2 = jj.GMT2;
							
							var otime = "";
							
							if (typeof(GMT2) != "undefined"){
								if (GMT != GMT2){
									otime = gap.change_date_localTime_only_time(json.GMT) + " (Created : " + gap.change_date_localTime_full2(GMT2) + ")";
								}else{
									otime = gap.change_date_localTime_only_time(json.GMT);
								}
							}else{
								otime = gap.change_date_localTime_only_time(json.GMT);
							}
							
							
						//	var otime = gap.change_date_localTime_only_time(json.GMT);
							$("#update_time_" + json.channel_data_id).text(otime);
						}
						
						gBodyM.image_css_change();
													
						if (gBodyM.post_view_type == 2){	
							
						}else{
							gBodyM.scroll_move_to_bottom();
						}
						
					} else {
						gBodyM.image_css_change();
					}
					
					//Dom객체를 짤라서 마지막에 추가했기 때문에 이벤트를 다시 정리해 줘야 한다.
					gBodyM.__event_init_load();
				
				}					
				
				//gBody3.update_reply_list(JSON.parse(obj.f1).data);				
			}else if (jj.type == "dr"){
				//상대방이 응답을 삭제한 경우
			
				
				var reply_id = JSON.parse(obj.f1).reply_id;								
				
				$("#mreplay_" + reply_id).remove();
				$("#reply_" + reply_id).remove();	
				$("#reply_att_"+reply_id).parent().remove()
				
				var id = JSON.parse(obj.f1).id;				
				var cnt = $("#ms_"+id).find(".message-reply").children().length;				
				if (cnt == 0 ){
					//$("#ms_"+id).find(".message-reply").remove();
					
					$("#ms_"+id).find(".fold-btns.repdis").remove();
					$("#ms_"+id).find(".message-reply").hide(); //응답을 삭제하고 바로 작성할때 표시되지 않는 오류 처리 2021.02.24
				}		
				$("#r_"+id).next().text( cnt  );
				$("#rp_" + jj.id).text(cnt);
				$("#rcount_" + jj.id).text(cnt);
				
				
				
				
									
				//응답 개수를 다시 계산해야 한다.
				
			}else if (jj.type == "mr"){
				//댓글을 수정했을 경우
				
				
				
				var jinfo = JSON.parse(obj.f1);
				var reply_id = jinfo.reply_id;

				$("#mreplay_" + reply_id).remove();
				$("#reply_" + reply_id).remove();
				$("#reply_att_"+reply_id).parent().remove()
				
				var id = jinfo.id;				
				var channel_id = id;
				var change_id = jinfo.resdata.rid;
				
			
				var GMT = jj.resdata.GMT;
				//타켓 문서를 현재 창에서 제거하고 오늘의 마지막으로 이동시킨다... 댓글을 달면 최근 데이터로 업데이트 한다.
				var klen = $("#ms_" + channel_id).length;
				//var date = $("#ms_" + channel_id).attr("data");
				var date = gap.change_date_localTime_only_date(GMT);
				
				if (gBodyM.post_view_type == 2){	
					
				}else{
					if (klen > 0){
						var ccn = $("#web_channel_dis_"+date).length;
						if (ccn > 0){
							var html = $("#ms_" + channel_id).get(0).outerHTML;							
							$("#ms_" + channel_id).remove();							
							var len = $("#web_channel_dis_"+date).length;
							if (len > 0){
								//오늘 날짜가 있는 것이다.
								if ($("#web_channel_dis_"+date).next().length == 0){
									$(html).insertAfter($("#web_channel_dis_"+date));
								}else{
									$(html).insertAfter($("#web_channel_dis_"+date).parent().last());
								}
							}else{
								//오늘 날짜 항목이 없다.
								var GMT = res.data.GMT;
								var dis_date = gap.change_date_default(gap.change_date_localTime_only_date(GMT));
								var datehtml = "";															
								datehtml += "<div class='date' id='web_channel_dis_"+date+"'><span>"+dis_date+"</span></div>";
								
								var hx = $("#channel_list .user-thumb").length;
								if (hx == 0){
									$("#channel_list").html(datehtml);				
								}else{
									$(datehtml).insertAfter($("#channel_list .xman").children().last().parent());
								}

								
								$(html).insertAfter($("#web_channel_dis_"+date).last());
							}
							gBodyM.image_css_change();
							
							gBodyM.scroll_move_to_bottom();
						}else{
							//오늘 날짜 항목이 없다.
							var html = $("#ms_" + channel_id).get(0).outerHTML;			
							var GMT = res.data.GMT;
							var dis_date = gap.change_date_default(gap.change_date_localTime_only_date(GMT));
							var datehtml = "";															
							datehtml += "<div class='date' id='web_channel_dis_"+date+"'><span>"+dis_date+"</span></div>";
							
							var hx = $("#channel_list .user-thumb").length;
							if (hx == 0){
								$("#channel_list").html(datehtml);				
							}else{
								$(datehtml).insertAfter($("#channel_list .xman").children().last().parent());
							}

							$("#ms_" + channel_id).remove();
							$(html).insertAfter($("#web_channel_dis_"+date).last());
							
							gBodyM.image_css_change();
							
							gBodyM.scroll_move_to_bottom();
						}
						//Dom객체를 짤라서 마지막에 추가했기 때문에 이벤트를 다시 정리해 줘야 한다.
						gBodyM.__event_init_load();
					}
				}

				
			
				var replyinfo = JSON.parse(jj.tempdata);
				/*
				 channel_data_id: "5ff5657407543a6eb2cec95c"
				content: "222222dddddd"
				owner: {id: "filestest@kmslab.com", ky: "CN=KM9999 Files테스트,O=Kmslab,C=kr", nm: "관리자", enm: "MNG", jt: "사원", …}
				reply_id: "5ff5657407543a6eb2cec95c_20210106164845_KMSLWIPNMA"
				 */
				
				var uinfo = gap.userinfo.rinfo;	
				
			//	var user_photo = replyinfo.owner.pu;
			//	var user_photo = gap.person_profile_uid(replyinfo.owner.ky);
				var user_photo = gap.person_profile_photo(replyinfo.owner);
				var user_info = gap.user_check(replyinfo.owner);
				var name = user_info.name;
				var content = replyinfo.content;
				
			//	var time = gap.change_date_localTime_full2(GMT);
				var day = gap.change_date_default2(gap.change_date_localTime_only_date(GMT));
				var time2 = gap.change_date_localTime_only_time(GMT);
				var time = day + " " + time2;
				var otime = gap.change_date_localTime_only_time(GMT);
				var message = gBodyM.message_check(content);
				
				if (message.indexOf("&lt;/mention&gt;") > -1){
					//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
					message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
				}
				
				var html = "";
				html += "<dl id='mreplay_"+change_id+"' class='user'>";
				html += "	<dt>";
				html += "		<div>";
				html += "			<div class='user-thumb' data='"+replyinfo.owner.ky+"'>"+user_photo+"</div>";
				html += "		</div>";
				html += "	</dt>";
				html += "	<dd>";
				html += "		<span>"+name+"<em>"+time+"</em></span>";
			
				html += "		<P>"+message+"</P>";
				html += "	</dd>";
				html += "</dl>";		
				
	
				html += gBodyM.file_infos_draw(jj.resdata);

				//기존 댓글을 삭제하고 수정된 댓글을 추가한다.
				$("#mreplay_" + replyinfo.reply_id).remove();
				if (!gBodyM.is_receive_draw_reply){
					$("#mr_" + replyinfo.channel_data_id).append(html);
				}

				//원본이 수정된 시간을 변경해 준다.
				$("#update_time_" + replyinfo.channel_data_id).text(otime);
				
				gBodyM.is_receive_draw_reply = true;			
				
				
				//Dom객체를 짤라서 마지막에 추가했기 때문에 이벤트를 다시 정리해 줘야 한다.
				gBodyM.__event_init_load();

				
			//	gBody3.tempdata = jinfo.tempdata;
			//	jinfo.resdata.channel_code = jinfo.channel_code;	
			//	jinfo.resdata.edit = "T";
			//	jinfo.resdata.tempdata = JSON.parse(jinfo.tempdata);
			//	gBody3.update_reply_list(jinfo.resdata);	
			//	gBodyM.draw_reply(JSON.parse(jj.tempdata));
			
				
			}else if (jj.type == "dcf"){
				//상대방이 채널 데이터중에 특정 파일을 삭제한 경우
				var jj = JSON.parse(obj.f1);
				var md5 = jj.del_id;
				var id = jj.id;
				
				
				var url = gap.channelserver + "/file_info_all.km";
				var data = JSON.stringify({
					"id" : id
				});			
				
				$.ajax({
					type : "POST",
					dataType : "json",
					contenType : "application/json; charset=utf-8",
					data : data,
					url : url,
					success : function(res){						
						if (res.result == "OK"){
							
							var item = res.data;
							var files = item.info;		
							var images = new Array();
							var normalfiles = new Array();		
							for (var i = 0 ; i < files.length; i++){
								var file = files[i];
								var isImage = gap.check_image_file(file.filename);
								if (isImage){
									images.push(file);
								}else{
									normalfiles.push(file);
								}
							}
							
							if (images.length < 5){
								$("#img_s_" + id).attr("class", "img-content img"+images.length+"");
								$("#msg_file_" + id + "_" + md5.replace(".","_")).remove();
							}else{
								//이미지 표시를 다시 그려줘야 한다.
								var html = "";
								var icount = images.length;
								var ccnt = icount - 6;
								if (images.length > 6){
									icount = 6;
									if (images.length > 0){
										//html += "			<div class='img-content img"+icount+"' >";
										for (var i = 0 ; i < icount; i++){
											var image = images[i];				
											var fserver = gap.server_check(item.fserver);
											var image_url = fserver + "/FDownload_thumb.do?id=" + id + "&md5="+image.md5+"&ty=2";
										
											if (i == 5){
												html += "				<div class='img-thumb' id='msg_file_"+ id + "_" + image.md5.replace(".","_")+"'><img src='"+image_url+"' alt=''><span class='img-more'><em>+"+ccnt+"장</em></span></div>";		
											}else{
												html += "				<div class='img-thumb' id='msg_file_"+ id + "_" + image.md5.replace(".","_")+"'><img src='"+image_url+"' alt=''></div>";		
											}
											
										}
										//html += "			</div>";
									}
								}else{
									if (images.length > 0){
										//html += "			<div class='img-content img"+icount+"' >";
										for (var i = 0 ; i < icount; i++){
											var image = images[i];		
											var fserver = gap.server_check(item.fserver);
											var image_url = fserver + "/FDownload_thumb.do?id=" + id + "&md5="+image.md5+"&ty=2";
											html += "				<div class='img-thumb' id='msg_file_"+ id + "_" + image.md5.replace(".","_")+"'><img src='"+image_url+"' alt=''></div>";		
										}
										//html += "			</div>";
									}
								}
																
								//	html += "			<div class='img-content img"+icount+"' id='img_s_"+docid+"' >";
								$("#img_s_" + id).attr("class", "img-content img"+icount+"");
								$("#img_s_" + id).html(html);
								
							}
						}
					},
					error : function(e){
						
					}
				});
				
				
				
			}
			
		

		}else{
			//Box 탭 메뉴에 신규 메시지 도착 표시흘 한다.
			
			
			
//			gBody3.send_alram(jj);
//			
//		
//			
//			
//			var json = JSON.parse(obj.f1);
//			var ch_code = json.channel_code;
//			
//			var pre_count = $("#clist_" + ch_code).text().replace("(","").replace(")","");
//			if (pre_count == ""){
//				pre_count = 0;
//			}
//			var t_count = parseInt(pre_count) + 1;
//			
//			
//			$("#clist_" + ch_code).text("(" + t_count + ")");
//			
//			
//			gap.change_title("","");
//			$("#tab3_sub").html(gap.lang.box + "<span class='ico-new'></span>");
		}
	},
	
	"direct_draw" : function(html, GMT, id){
		//현재 날짜의 날짜 Tag가 있는지 확인하고 없으면 추가한다.

		$(".box-empty").remove();
		
		if (gBodyM.select_files_tab){
			$("#conversations_tab").click();
		}else{
			var len = $("#ms_" + id).length;
			$("#ms_" + id).remove();
		
			var date = gap.change_date_localTime_only_date(GMT);
			
			var cnt = $("#web_channel_dis_" + date).length;
			var dis_date = gap.change_date_default(gap.change_date_localTime_only_date(GMT));
			var dis_id = "date_" + date;

			var datehtml = "";
			if (cnt == 0){			
				datehtml += "<div class='wrap-channel' >";
				datehtml += "<div class='date' id='web_channel_dis_"+date+"'><span>"+dis_date+"</span></div>";
				datehtml += "</div>";
	
			//	var cnt = $(".wrap-channel").length;
			//	if (cnt > 0){
					//기존에 날짜가 있는 경우
			//		$(datehtml).insertBefore($("#channel_list").children().first());
			//	}else{
					//기존에 날짜가 없는 경우
					$("#channel_list").append(datehtml);
					//$("#web_channel_dis_" +date).parent().append($(datehtml));
			//	}
			}

		
			if (cnt == 0){
				$(html).insertAfter($("#web_channel_dis_"+date).last());
			}else{
			//	$(html).insertAfter($("#web_channel_dis_"+date).last());
			//	$(html).insertAfter("#web_channel_dis_"+date);
				$("#web_channel_dis_" + date).parent().append($(html));
				
				//if ($("#web_channel_dis_"+date).parent().find('.xman').last().length == 0){
				//	$(html).insertAfter($("#web_channel_dis_"+date));
					
				//}else{
				//	$(html).insertAfter($("#web_channel_dis_"+date).parent().find('.xman').last());
				//}
				
			}

			
			var len = $("#ms_" + id).length;
			if (len > 0){

				//댓글이 있는 경우 표시해 줘야 한다.
				if (typeof(gBodyM.select_doc_info) != "undefined"){
					if (typeof(gBodyM.select_doc_info.reply) != "undefined"){
						
						var item = gBodyM.select_doc_info;			
						var xhtml = gBodyM.draw_reply(item);					
						
						var parent = $("#ms_" + item._id.$oid).find(".message-btns");				
						$("#rp_" + id).text(item.reply.length);					
						$(xhtml).insertBefore(parent);				
					}
				}			
			}			 
		
			gBodyM.image_css_change();
			
			if (gBodyM.prevent_auto_scrolling == 2){
				gBodyM.scroll_move_to_bottom();	
			}
			
			setTimeout(function(){
				gBodyM.__event_init_load();
			}, 1000);
			
		
		}	
	},
	
	
	
	"scroll_move_to_bottom" : function(id){
		$('html, body').animate({ scrollTop: $(document).height() }, 500);
	},
	
	"delete_channel_notice" : function(id){
		var obj = new Object();
		obj.id = id;
		obj.channel_code = gBodyM.cur_opt;
		gBodyM.send_socket(obj, "delete_notice_channel");
	},
	
	"delete_channel_data" : function(id, channel_code, channel_name){
		gBodyM.mobile_finish();
		
		var msg = gap.lang.confirm_delete;
		//	msg += "<div style='text-align:left;  padding-top:10px;'>["+gap.lang.cose+"]</div>" + slist;
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
							//확인을 클릭한 경우			 				
							var url = gap.channelserver + "/channel_data_delete.km";
							var data = JSON.stringify({
								"id" : id
							});
							
							
							$.ajax({
								type : "POST",
								dataType : "json",
								contenType : "application/json; charset=utf-8",
								data : data,
								beforeSend : function(xhr){
									xhr.setRequestHeader("auth", gap.get_auth());
								},
								url : url,
								success : function(res){
									
									if (res.result == "OK"){										
										var ddx = $("#ms_" + id).parent().find(".date").attr("data");									
										$("#ms_" + id).fadeOut().remove();									
										//date항목을 삭제해야 할지 체크하는 로직입니다.									
										if ($("#web_channel_dis_" + ddx).parent().children().length == 1){
											$("#web_channel_dis_" + ddx).fadeOut(1000).remove();
										}																			
										var obj = new Object();
										obj.id = id;
										obj.channel_code = channel_code;
										obj.channel_name = gap.textToHtml(channel_name);									
										gBodyM.send_socket(obj, "del_msg");										
									}else if (res.result == "owner_delete"){										
										gap.remove_owner_delete_obj(id);
										
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
						 	//$("#" + xid).css("border","");
						}
					}
				}		 			
			});
	},
	
	
	
	"write_reply" : function(id, content, channel_name, channel_code, mention_obj){
		
		/*
		var id = "5ffc102f07543a6eb2ceca0b";
		var content = "댓글 모바일 자동 입력";		
		var channel_name = "AP-ON 기능 개선";
		var channel_code = "5fc849ce6f9e552fbfaa9ade";
		*/
		
//		gap.gAlert(id);
//		gap.gAlert(content);
//		gap.gAlert(channel_name);
//		gap.gAlert(channel_code);

		var mentions_data = [];
		if (typeof mention_obj != "undefined" && mention_obj.length > 0){
			mentions_data = mention_obj;
		}

		var data = JSON.stringify({
			"content" : content,
			"mention" : mentions_data,
			"owner" : gap.userinfo.rinfo,
			"channel_data_id" : id
		});
		
		gBodyM.tempData = data;
		
		var url = gap.channelserver + "/save_reply.km";
		$.ajax({
			type : "POST",
			dataType : "text",
			url : url,
			data : data,
			success : function(ress){
			
			
			
				var res = JSON.parse(ress);
				if (res.result == "OK"){
												
				
					var GMT = res.data.GMT;
					var GMT2 = res.data.GMT2;
					var rid = res.data.rid;					
					var date = gap.change_date_localTime_only_date(GMT);
									
					var obj = new Object();
					//obj.channel_code = gBody3.xcode;
					obj.channel_code = channel_code;
					
					
					
					//res.data.channel_code = gBody3.xcode;
					res.data.channel_code = channel_code;
					obj.channel_name = gap.textToHtml(channel_name);
					obj.data = res.data;
					obj.type = "sr";
					obj.owner = gap.userinfo.rinfo;
					
					obj.GMT = GMT;
					obj.GMT2 = GMT2;
					obj.rid = rid;
					var spx = JSON.parse(gBodyM.tempData);
					spx.GMT = GMT;
					spx.rid = rid;
					obj.tempData = JSON.stringify(spx);				
					gBodyM.send_socket(obj, "sr");	
					
					//모바일 Push발송 등록 ////////////////////////////////////////////////////////		
					var smsg = new Object();
					smsg.msg = "[" + channel_name + "] " + gap.lang.reg_reply;				
					smsg.title = gap.systemname + "[" + gap.lang.channel + "]";							
					smsg.type = "sr";
					smsg.key1 = channel_code;
					smsg.key2 = "";
					smsg.key3 = channel_name;
					smsg.fr = gap.userinfo.rinfo.nm;
					//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.	
					
					if (typeof mention_obj != "undefined" && mention_obj.length > 0){
						// mention 관련 데이터가 있는 경우
						var slist = [];
						for (var i = 0; i < mention_obj.length; i++){
							slist.push(mention_obj[i].ky);
						}
						smsg.sender = slist.join("-spl-");	
						
					}else{
						smsg.sender = gBodyM.search_channel_member(channel_code).join("-spl-");		
					}
							
					//gap.push_noti_mobile(smsg);
					
					//알림센터에 푸쉬 보내기
					var rid = channel_code;
					var receivers = smsg.sender.split("-spl-");
					var msg2 = gap.lang.reg_reply;	
					var sendername = "["+gap.lang.channel+" : "+ gap.textToHtml(channel_name) +"]"
					var data = smsg;
					gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
					/////////////////////////////////////////////////////////////////////
							
					
					gBodyM.mobile_close();				
					
				}else{
					gap.gAlert(gap.lang.ermsg);
					//gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		})
	},
	
	/*
	 * 콘텐츠 목록에서 댓글 클릭하면 댓글만 보여주는 함수
	 */
	"display_reply" : function(id){
		
		gBodyM.all_close_layer();
		
		var url = gap.channelserver + "/reply_info.km";
		var data = JSON.stringify({
			"id" : id
		});
		
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : data,
			url : url,
			success : function(res){
				$("#dis").css({opacity:0});
				
				
				if (res.result == "OK"){
					var count = 0;
					if (typeof(res.data.reply.reply) != "undefined"){
						count = res.data.reply.reply.length;
					}
					
					var html = "";
					
					if (count > 0){
						
						html += "<div class='wrap reply'>";		
						
						for (var i = 0 ; i < count ; i++){
							
							var info = res.data.reply.reply[i];
						//	var user_photo = info.owner.pu;
						//	var user_photo = gap.person_profile_uid(info.owner.ky);
							var user_photo = gap.person_profile_photo(info.owner);
							var user_info = gap.user_check(info.owner);
							var name = user_info.name;
							var content = info.content;
									
							
							var channel_code = res.data.reply.channel_code;
							var channel_name = res.data.reply.channel_name;
							
							//var time = gap.change_date_localTime_full2(info.GMT);	
							
							var day = gap.change_date_default2(gap.change_date_localTime_only_date(info.GMT));
							var time2 = gap.change_date_localTime_only_time(info.GMT);
							var time = day + " " + time2;
							var mention = "";
							
							if ( (typeof(info.mention) != "undefined") ){
								mention = JSON.stringify(info.mention)
							}
							
							var message = gBodyM.message_check(info.content);
							
							if (message.indexOf("&lt;/mention&gt;") > -1){
								//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
								message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
							}
							
							
							if (info.owner.ky == gap.userinfo.rinfo.ky){
								html += "	<div class='reply-user me' id='mreplay_"+info.rid+"'>";
							}else{
								html += "	<div class='reply-user' id='mreplay_"+info.rid+"'>";
							}
							
							html += "		<div class='user' >";
							html += "			<div class='user-thumb' data='"+info.owner.ky+"'>"+user_photo+"</div>";
							html += "		</div>";
							html += "		<dl style='width:100%'>";													
							html += "			<dt>"+name+"</dt>";						
							html += "			<dd>"+message+"</dd>";
							html += "		</dl>";
							
							html += " 		<div class='reply-bottom'>"; 
							html += "			<span class='reply-time'>"+time+"</span>";
							if (info.owner.ky == gap.userinfo.rinfo.ky){
								html += "<button class='btn-reply-del modify' data='"+info.channel_data_id+"' data2='"+info.rid+"' data3='"+channel_code+"' data4='"+channel_name+"' data-mention='"+mention+"'><span>["+gap.lang.basic_modify+"]</span></button>";
								html += "<button class='btn-reply-del del' data='"+info.channel_data_id+"' data1='"+info.rid+"' data2='"+channel_code+"'><span class=''>["+gap.lang.basic_delete+"]</span></button>";
							}
							
							html += "		</div>";
							html += "	</div>";
						
							info.owner_ky = res.data.reply.ky;
							html += gBodyM.file_infos_draw(info);
							
						}
									
						html += "</div>";
						
					}else{
						html += "<div class='wrap reply-empty'>";
						html += "	<dl>";
						html += "		<dt><span class='ico no-reply'></span></dt>";
						html += "		<dd>"+gap.lang.no_reply+"</dd>";
						html += "	</dl>";
						html += "</div>";
					}
				}		
				
				$("#dis").html(html);
				
				gBodyM.__event_reply_file_click();
				
				$('html, body').animate({ scrollTop:$(document).height() }, 500 , function(){
					$("#dis").css({opacity:1})
				});
				gBodyM.__display_reply_event();
				
			},
			error : function(e){
				gap.error_alert();
			}
		});

	},
	
	
	"__display_reply_event" : function(){
		
		//멘션을 클릭한 경우 사용자 정보를 표시한다.
		$(".wrap.reply mention").off();
		$(".wrap.reply mention").on("click", function(e){
			var id = $(this).attr("data");
			var url_link = "kPortalMeet://NativeCall/callUserProfile?ky=" + encodeURIComponent(id);
			gBodyM.connectApp(url_link);
			return false;
		});		
		
		$(".btn-reply-del.modify").off();
		$(".btn-reply-del.modify").on("click", function(e){
		//	$("body").css("overflow", "hidden");
			gBodyM.cid = $(this).attr("data");
			gBodyM.rid = $(this).attr("data2");
			
			var channel_code = $(this).attr("data3");
			var channel_name = $(this).attr("data4");
			var mention_list = $(this).data("mention");
			
		//	if (mention_list != ""){
		//		gap.gAlert(gap.lang.mention_cannot_edited);
		//		return false;
		//	}			
									
		//	var message = $(this).parent().find("p").html();
			
			var message = $(e.currentTarget).parent().parent().find("dd").html();

			
		//	if (sabun == "AC926455" || sabun == "AC925454" || sabun == "AC925455" || sabun == "AC903453"){
				if (message != ""){	
					message = message.replace(/\<br\>/gi, "\n").replace(/&nbsp;/gi," ");
				}
				
				var url_link = "kPortalMeet://NativeCall/callChannelReplyModify?content=" + encodeURIComponent(message) + "&code=" + channel_code + "&id=" + gBodyM.cid + "&rid=" + gBodyM.rid + "&cname=" + encodeURIComponent(channel_name);
				gBodyM.connectApp(url_link);
				return false;
				
		//	}else{
			/*	$("body").css("overflow", "hidden");
				if (message != ""){
						message = message.replace(/\<br\>/gi, "\n").replace(/&nbsp;/gi," ");
							
						if (message.indexOf("<mention") > -1){
							var mk = $("<span>" + message + "</span>");
							var lk = $(mk).find("mention");
							for (var i = 0 ; i < lk.length; i++){
								var item = lk[i];
								var nam = $(item).text();
								message = message.replace($(item).get(0).outerHTML, nam);
							}
						}
					}
				
				$("#rmtext").val(message);
				
				
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
										
					gBodyM.reply_modify_new(gBodyM.cid, gBodyM.rid, channel_code, channel_name, mention_list);
				});
				return false;*/
		//	}

		});
		
		$(".btn-reply-del.del").off();
		$(".btn-reply-del.del").on("click", function(e){
			
			
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
							var url = gap.channelserver + "/delete_reply.km";
				
							var channel_data_id = $(e.currentTarget).attr("data");
							var reply_id = $(e.currentTarget).attr("data1");
							var channel_code = $(e.currentTarget).attr("data2");
				
							var data = JSON.stringify({
								"channel_data_id" : channel_data_id,
								"reply_id" : reply_id
							});
				
							$.ajax({
								type : "POST",
								dataType : "json",
								contentType : "application/json; charset=utf-8",
								data : data,
								url : url,
								success : function(res){
						
								if (res.result == "OK"){
							
									$("#mreplay_"+ reply_id).remove();
							
									//삭제하면 소켓으로 삭제 정보가 발송되기 때문에 앞 레이어에 정보가 삭제된다.											
									var channel = gBodyM.search_channel_info(channel_code);
									var obj = new Object();
									obj.reply_id = reply_id;
									obj.id = channel_data_id;
									obj.channel_code = channel.ch_code;
									obj.channel_name = gap.textToHtml(channel.ch_name);
									gBodyM.send_socket(obj, "dr");
							
								}
							},
							error : function(e){
								gap.error_alert();
							}
							})
						
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
			
		});
	},
	
	
	"reply_modify_new" : function(channel_id, rid, channel_code, channel_name, mention_list){
		
		var channel_data_id = channel_id;
		var channel_name = channel_name;
		var channel_code = channel_code;
		var reply_id = rid;
		var channel_code = channel_code;
		var content = $("#rmtext").val();
	
		var mlist = [];
		if (mention_list.length > 0){
			for (var i = 0; i < mention_list.length; i++){
				var info = mention_list[i];
				var _nm = info.nm;
				var _id = info.id;
				
				if (_nm.indexOf("@") == -1){
					_nm = "@" + _nm;
				}
				
				if (content.indexOf(_nm) > -1){
					var mhtml = "<mention data='" + _id + "'>" + _nm + "</mention>"
					content = content.replace(_nm, mhtml);
					
					mlist.push(info);
				}
			}
		}
		

		var url = gap.channelserver + "/modify_reply.km";
		var data = JSON.stringify({
			"owner" : gap.userinfo.rinfo,
			"channel_data_id" :  channel_data_id,
			"reply_id" : reply_id,
			"content" : content,
			"mention" : mlist
		});
		gBodyM.tempData = data;
		
		$.ajax({
			type : "POST",
			dataType : "text",
			url : url,
			data : data,
			
			success : function(ress){
			
			
				var res = JSON.parse(ress);
				if (res.result == "OK"){
					gap.hideBlock();
					$("#rmlayer").hide();
					
					var txt = $("#rmtext").val();
					$("#rmtext").val("");
					
				//	$("#mreplay_" + reply_id).remove();
				//	$("#reply_" + reply_id).remove();
					
					
					var channe_code = channel_code;
					var channe_name = channel_name;
					
					var id = channel_data_id;				
					
					var GMT = res.data.GMT;
					
					
				
					//타켓 문서를 현재 창에서 제거하고 오늘의 마지막으로 이동시킨다... 댓글을 달면 최근 데이터로 업데이트 한다.
					var klen = $("#mreplay_" + reply_id).length;
					if (klen > 0){
						$("#mreplay_" + reply_id).remove();
					}
					
					//////////////////////////////////////////////////////////////////////////////
					var info = res.data;
				//	var user_photo = gap.userinfo.rinfo.pu;
				//	var user_photo = gap.person_profile_uid(gap.userinfo.rinfo.ky);
					var user_photo = gap.person_profile_photo(gap.userinfo.rinfo);
					var user_info = gap.user_check(gap.userinfo.rinfo);
					var name = user_info.name;
					var mention = JSON.stringify(mlist);
					
					var content = txt;								
					var time = gap.change_date_localTime_full2(info.GMT);				
					var message = gBodyM.message_check(content);						
					var html = "";
//					html += "				<dl id='reply_"+info.rid+"'>";
//					html += "					<dt>";
//					html += "						<div class='user'>";
//					html += "							<div class='user-thumb'><img src='"+user_photo+"' alt=''></div>";
//					html += "						</div>";
//					html += "					</dt>";
//					html += "					<dd>";
//					html += "						<span>"+name+"<em>"+time+"</em></span>";
//					
//					//if (info.owner.em.toLowerCase() == uinfo.em.toLowerCase()){
//						html += "						<button class='ico btn-edit' style='position:absolute; top:4px; right: 20px' data='"+id+"' data2='"+info.rid+"' data3='"+channel_code+"' data4='"+channel_name+"' ><span>수정</span></button>";
//						html += "						<button class='ico btn-del1' data='"+id+"' data2='"+info.rid+"' data3='"+channel_code+"' data4='"+channel_name+"' ><span>삭제</span></button>";
//					//}
//					
//					html += "						<p>"+message+"</p>";
//					html += "					</dd>";
//					html += "				</dl>";
					
					
					info.owner = gap.userinfo.rinfo;
				///	if (info.owner.em == gap.userinfo.rinfo.em){
						html += "	<div class='reply-user me' id='mreplay_"+info.rid+"'>";
				//	}else{
				//		html += "	<div class='reply-user' id='mreplay_"+info.rid+"'>";
				//	}


					html += "		<div class='user'>";
					html += "			<div class='user-thumb' data='"+info.owner.ky+"'>"+user_photo+"</div>";
					html += "		</div>";
					html += "		<dl>";													
					html += "			<dt>"+name+"</dt>";						
					html += "			<dd>"+message+"</dd>";
					html += "		</dl>";

					html += " 		<div class='reply-bottom'>"; 
					html += "			<span class='reply-time'>"+time+"</span>";
				//	if (info.owner.em == gap.userinfo.rinfo.em){
					
						html += "<button class='btn-reply-del modify' data='"+id+"' data2='"+info.rid+"' data3='"+channel_code+"' data4='"+channel_name+"' data-mention='"+mention+"'><span>["+gap.lang.basic_modify+"]</span></button>";
						html += "<button class='btn-reply-del del' data='"+id+"' data1='"+info.rid+"' data2='"+channel_code+"'><span class=''>["+gap.lang.basic_delete+"]</span></button>";
				//	}

					html += "		</div>";

					html += "	</div>";
					
					$(".wrap.reply").append(html);
					/////////////////////////////////////////////////////////////////////////
					gBodyM.__display_reply_event();
					
					
					
					var obj = new Object();
					obj.reply_id = reply_id;
					obj.id = channel_data_id;
					obj.channel_code = channel_code;
					obj.channel_name = gap.textToHtml(channel_name);
					obj.content = content;
					obj.resdata = res.data;
					obj.tempdata = gBodyM.tempData;
					obj.owner = gap.userinfo.rinfo;
					gBodyM.send_socket(obj, "mr");
								
					
					
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
	},
	
	"reply_modify_native" : function(channel_id, rid, channel_code, channel_name, msg, mention_list){
		
		var channel_data_id = channel_id;
		var channel_name = channel_name;
		var channel_code = channel_code;
		var reply_id = rid;
		var channel_code = channel_code;
		var content = msg;
	
		var url = gap.channelserver + "/modify_reply.km";
		var data = JSON.stringify({
			"owner" : gap.userinfo.rinfo,
			"channel_data_id" :  channel_data_id,
			"reply_id" : reply_id,
			"content" : content,
			"mention" : mention_list
		});
		gBodyM.tempData = data;
		
		$.ajax({
			type : "POST",
			dataType : "text",
			url : url,
			data : data,
			success : function(ress){
				var res = JSON.parse(ress);

				if (res.result == "OK"){
					var channe_code = channel_code;
					var channe_name = channel_name;
					var id = channel_data_id;				
					var GMT = res.data.GMT;
				
					//타켓 문서를 현재 창에서 제거하고 오늘의 마지막으로 이동시킨다... 댓글을 달면 최근 데이터로 업데이트 한다.
					var klen = $("#mreplay_" + reply_id).length;
					if (klen > 0){
						$("#mreplay_" + reply_id).remove();
					}
					
					//////////////////////////////////////////////////////////////////////////////
					var info = res.data;
				//	var user_photo = gap.person_profile_uid(gap.userinfo.rinfo.ky);
					var user_photo = gap.person_profile_photo(gap.userinfo.rinfo);
					var user_info = gap.user_check(gap.userinfo.rinfo);
					var name = user_info.name;
					var mention = JSON.stringify(mention_list);
							
					var time = gap.change_date_localTime_full2(info.GMT);				
					var message = gBodyM.message_check(content);						
					var html = "";
					
					if (message.indexOf("&lt;/mention&gt;") > -1){
						//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
						message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
					}
					
					info.owner = gap.userinfo.rinfo;
					html += "	<div class='reply-user me' id='mreplay_"+info.rid+"'>";
					html += "		<div class='user'>";
					html += "			<div class='user-thumb' data='"+info.owner.ky+"'>"+user_photo+"</div>";
					html += "		</div>";
					html += "		<dl>";													
					html += "			<dt>"+name+"</dt>";						
					html += "			<dd>"+message+"</dd>";
					html += "		</dl>";

					html += " 		<div class='reply-bottom'>"; 
					html += "			<span class='reply-time'>"+time+"</span>";
					html += "<button class='btn-reply-del modify' data='"+id+"' data2='"+info.rid+"' data3='"+channel_code+"' data4='"+channel_name+"' data-mention='"+mention+"'><span>["+gap.lang.basic_modify+"]</span></button>";
					html += "<button class='btn-reply-del del' data='"+id+"' data1='"+info.rid+"' data2='"+channel_code+"'><span class=''>["+gap.lang.basic_delete+"]</span></button>";

					html += "		</div>";
					html += "	</div>";
					
					$(".wrap.reply").append(html);
					/////////////////////////////////////////////////////////////////////////
					gBodyM.__display_reply_event();
					
					
					var obj = new Object();
					obj.reply_id = reply_id;
					obj.id = channel_data_id;
					obj.channel_code = channel_code;
					obj.channel_name = gap.textToHtml(channel_name);
					obj.content = content;
					obj.resdata = res.data;
					obj.tempdata = gBodyM.tempData;
					obj.owner = gap.userinfo.rinfo;
					gBodyM.send_socket(obj, "mr");
								
					
					//모바일 Push발송 등록 ////////////////////////////////////////////////////////		
					var smsg = new Object();
					smsg.msg = "[" + channel_name + "] " + gap.lang.modify_reply;	
					smsg.title = gap.systemname + "[" + gap.lang.channel + "]";	
					smsg.type = "mr";		
					smsg.key1 = channel_code;
					smsg.key2 = "";
					smsg.key3 = channel_name;
					smsg.fr = gap.userinfo.rinfo.nm;
					//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.	
					
					if (typeof mention_list != "undefined" && mention_list.length > 0){
						// mention 관련 데이터가 있는 경우
						var slist = [];
						for (var i = 0; i < mention_list.length; i++){
							slist.push(mention_list[i].ky);
						}
						smsg.sender = slist.join("-spl-");	
						
					}else{
						smsg.sender = gBodyM.search_channel_member(channel_code).join("-spl-");
					}
								
					//gap.push_noti_mobile(smsg);	
					
					//알림센터에 푸쉬 보내기
					var rid = channel_code;
					var receivers = smsg.sender.split("-spl-");
					var msg2 = gap.lang.modify_reply;	
					var sendername = "["+gap.lang.channel+" : "+ gap.textToHtml(channel_name) +"]"
					var data = smsg;
					gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
					/////////////////////////////////////////////////////////////////////
								
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
	},	
	
	
	"search_channel_info" : function(id){
		var lists = gBodyM.cur_channel_list_info;
		if (lists == ""){
			gBodyM.load_channel_list_info();
			lists = gBodyM.cur_channel_list_info;
		}
		var res = "";
		for (var i = 0 ; i < lists.length; i++){
			var item = lists[i];
			if (item.ch_code ==  id){
				res = item;
				break;
			}
		}
		
		return res;		
	},
	
	
	"load_option" : function(type){
		
		//type : 1 : 즐겨찾기  / 2 : 상세보기 / 3 : URL 복사 / 4 : 드라이브 등록   / 5 : 미리보기 / 6 : 다운로드  / 7 : 이동하기 / 8 : 삭제하기
		gBodyM.mobile_finish();
	//	gap.gAlert("type : " + type);	
		var click_mode = gBodyM.cur_more_click_opt;  //현재 어떤 상황에서 호출했는지 정보를 가지고 있다.
		
	//	gap.gAlert("click_mode : " + click_mode);
		if (click_mode == "1"){
			//채널 목록에서 컨텐츠에 대한 More를 클릭한 경우
			var id  = gBodyM.cur_select_info.id;
			var channel_code = gBodyM.cur_select_info.channel_code;
			var channel_name = gBodyM.cur_select_info.channel_name;
			
			if (type == "2"){
				//상세보기를 실행한다.
				gBodyM.detail_view(id, channel_code, channel_name);
			}else if (type == "8"){
				//삭제를 실행한다.
				gBodyM.delete_channel_data(id, channel_code, channel_name);
			}else if (type == "9"){
				//공지등록을 실행한다.
				gBodyM.notice_channel_data(channel_code, id);
			}
				
		}else if (click_mode == "2"){
			//특정 파일을 클릭해서 컨텍스트 메뉴을 실행하고 리턴되어 오는 경우
			var id = gBodyM.cur_select_info.id;
			var md5 = gBodyM.cur_select_info.md5;
			var fs = gap.channelserver;
			var fname = gBodyM.cur_select_info.filename;
			var ftype = gBodyM.cur_select_info.ftype;
			var upload_path = gBodyM.cur_select_info.upload_path;
			var emial = gBodyM.cur_select_info.email;
			
			var channel_code = gBodyM.cur_select_info.channel_code;
			var channel_name = gBodyM.cur_select_info.channel_name;
			
			md5 = md5.replace("_",".");
			
			if (type == "1"){
				//특정 파일 즐겨찾기
				var data = JSON.stringify({
					"id" : id,
					"md5" : md5,
					"type" : "2",
					"email" : gap.userinfo.rinfo.ky,
					"fserver" : fs
				});
				url = gap.channelserver + "/copy_favorite.km";
				$.ajax({
					type : "POST",
					dataType : "json",
					url : url,
					data : data,
					success : function (res){
						if (res.result == "OK"){
							gap.gAlert(gap.lang.added_favorite_menu);
						}else if (res.result == "EXIST"){
							gap.gAlert(gap.lang.exist_file);
						}else{
							gap.gAlert(gap.lang.errormsg);
						}
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
					}
				});				
				
			}else if (type == "3"){
				//특정 파일 URL복사
				var fserver = gap.server_check(fs);
				var url = fserver + "/FDownload.do?id="+ id + "&md5="+ md5 + "&ty=2";
				gBodyM2.copy_file_url(url);
				
			}else if (type == "4"){
				//드라이브 등록
			//	gBodyM2.files_reg_drive_select_item(id + "-spl-" + md5);
				var url_link = "kPortalMeet://NativeCall/callChannelMove?id=" + id + "-spl-" + md5 + "&mode=gBodyM2";
				gBodyM.connectApp(url_link);
				
			}else if (type == "5"){
				//미리보기
				
				var ext = gap.is_file_type_filter(fname);
									
				if (ext == "movie"){
					var fserver = gap.server_check(fs);
					var url = fserver + "/FDownload.do?id="+ id + "&md5="+ md5 + "&ty=2";
				//	gBodyM.show_video(url, fname);
					
//					var vserver = gap.search_video_server(fserver);
//					var url = vserver + "/2/" + email + "/" + upload_path + "/" + md5 + "/" + ftype;			
					gBodyM.call_preview(url, fname, "video");
				}else if (ext == "img"){
				//	var url = fs + "/File_MP.do?id="+ id + "&md5="+ md5 + "&ty=2";
					var fserver = gap.server_check(fs);
					var url = fserver + "/FDownload.do?id="+ id + "&md5="+ md5 + "&ty=2";
				//	gBodyM.show_image(url, fname);
					gBodyM.call_preview(url, fname, "image");
				}else if (gBodyM.pp_check(fname)){
					gBodyM.mobile_start();
					gBodyM2.file_convert(fs, fname, md5, id, "2", "channel");
				}else{
					gap.gAlert(gap.lang.noconvert);
				}	
				
				
			}else if (type == "8"){
				//특정 파일 삭제 하기
				
				var ln = fname.lastIndexOf(".");			
				var ft = fname.substring(ln+1, fname.length);
			
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
					
								
								var data = JSON.stringify({
									"id" : id,
									"md5" : md5.replace("_","."),
									"ft" : ft
								});			
								url = gap.channelserver + "/delete_sub_file.km";
								$.ajax({
									type : "POST",
									dataType : "json",
									url : url,
									data : data,
									success : function (res){
										if (res.result == "OK"){
											
											$("#msg_file_" + id + "_" + md5.replace(".","_")).remove();
																					
											var obj = new Object();
											obj.channel_id = gBodyM.cur_opt;
											obj.del_id = md5.replace(".","_");
											obj.channel_code = channel_code;
											obj.channel_name = gap.textToHtml(channel_name);
											obj.id = id;
											
											gBodyM.send_socket(obj, "dcf");
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
								//$("#" + xid).css("border","");
							}
						}
					}		 			
				});
			}else if (type == "9"){
				//공지등록을 실행한다.
				gBodyM.notice_channel_data(channel_code, id);
			}
		}
	},
	
	
	"msg_send_complete" : function(obj, mention_obj){
//		gap.gAlert(obj.docinfo.type);
//		
//		if (obj.docinfo.type == "emoticon"){
//			
//		}else{
//			
//		}
		
		//$("#mmsg").html(JSON.stringify(obj));	
		
		var date = gap.change_date_localTime_only_date(obj.docinfo.GMT);
		var oob = JSON.stringify(obj);
		//$("#mmsg").text(oob);
		
		var obb = new Object();	
		obb = obj.docinfo;
		obb.direct = "T";
		obb._id = obj.docinfo._id.$oid;		
	
		
		var is_write_auth = gap.mobile_write_auth_check();
		var html = gBodyM.draw_msg(obb, obj.docinfo.type, date, is_write_auth);	
		gBodyM.direct_draw(html, obj.docinfo.GMT, obj.docinfo._id.$oid);		
		
		obb.date = date;
		obb.edit = "";	
		obb.doctype = obj.docinfo.type;	
		obb.GMT = obj.docinfo.GMT;
		//obb.channel_code = gBodyM.cur_opt;	
		obb.channel_code = obj.docinfo.channel_code;
	//	obb.channel_name = gBody.select_channel_name;		
		obb.email = gap.userinfo.rinfo.ky;
		obb.owner = gap.userinfo.rinfo;
		obb.type = obj.docinfo.type;	
		gBodyM.send_socket(obb, "ms");
		
		
		var channel_name = gap.textToHtml(obj.docinfo.channel_name);
		
		//모바일 Push발송 등록 ////////////////////////////////////////////////////////		
		var smsg = new Object();
		smsg.msg = "[" + gap.textToHtml(channel_name) + "] " + gap.lang.nmsg;	
		smsg.title = gap.systemname + "[" + gap.lang.channel + "]";	
		smsg.type = "ms";		
		smsg.key1 = obb.channel_code;
		smsg.key2 = "";
		smsg.key3 = gap.textToHtml(channel_name);
		smsg.fr = gap.userinfo.rinfo.nm;
		//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.	
		
	//	var mlist = JSON.parse(mention_obj);
		if (typeof mention_obj != "undefined" && mention_obj.length > 0){
			// mention 관련 데이터가 있는 경우
			var slist = [];
			for (var i = 0; i < mention_obj.length; i++){
				slist.push(mention_obj[i].ky);
			}
			smsg.sender = slist.join("-spl-");	
			
		}else{
			smsg.sender = gBodyM.search_channel_member(obb.channel_code).join("-spl-");
		}
	//	smsg.sender = gBodyM.search_channel_member(obb.channel_code).join("-spl-");
					
	//	gap.push_noti_mobile(smsg);	
		
		//알림센터에 푸쉬 보내기
		var rid = obb.channel_code;
		var receivers = smsg.sender.split("-spl-");
		var msg2 = gap.lang.nmsg;	
		var sendername = "["+gap.lang.channel+" : "+ gap.textToHtml(channel_name) +"]"
		var data = smsg;
		gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
		/////////////////////////////////////////////////////////////////////
		
		
	},
	
	"file_send_complete" : function(obj){
	
	//	gap.gAlert(JSON.stringify(obj));
	//	gap.gAlert(json.channel_code);
	
		var json = obj;
		
		if ( (gBodyM.cur_opt == json.channel_code) || (gBodyM.cur_opt == "allcontent") || (gBodyM.cur_opt == "mycontent")){
			var GMT = json.GMT;
			var doc = new Object();
			doc.GMT = GMT;
			doc.channel_code = json.channel_code;
			doc.channel_name = gap.textToHtml(json.channel_name);
			doc.email = gap.userinfo.rinfo.ky;
			doc.content = json.content;
			doc.owner = gap.userinfo.rinfo;
			doc.type = "file";
			doc.upload_path = json.upload_path;
			doc.info = json.file_infos;
			doc.direct = "T";
			doc._id = json.id;
			doc.fserver = gap.channelserver;
			
			if (typeof(json.doc_info.og) != "undefined"){
				doc.og = json.doc_info.og;
			}
			

			var date = gap.change_date_localTime_only_date(GMT);
			
			var is_write_auth = gap.mobile_write_auth_check();
			
			var html = gBodyM.draw_file(doc, date, is_write_auth);
			gBodyM.direct_draw(html, json.GMT, json.id);
			
			gBodyM.cur_msg_list.push(doc);	//2022.01.10

			doc.date = date;
			gBodyM.send_socket(doc, "fs");
			
			
			
			//모바일 Push발송 등록 ////////////////////////////////////////////////////////		
			var smsg = new Object();
			
//			if (json.content == ""){
//				smsg.title = json.file_infos[0].filename;		
//			}else{
//				smsg.title = json.content;		
//			}
			
			smsg.title = gap.systemname + "[" + gap.lang.channel + "]";
			smsg.msg = "[" + json.channel_name + "] " + gap.lang.reg_file;
			smsg.type = "fs";
			smsg.key1 = json.channel_code;
			smsg.key2 = "";
			smsg.key3 = json.channel_name;
			smsg.fr = gap.userinfo.rinfo.nm;			
			//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
			smsg.sender = gBodyM.search_channel_member(json.channel_code).join("-spl-");				
		//	gap.push_noti_mobile(smsg);	
			
			//알림센터에 푸쉬 보내기
			var rid = json.channel_code;
			var receivers = mlist;
			var msg2 = gap.lang.reg_file;
			var sendername = "["+gap.lang.channel+" : "+ gap.textToHtml(json.channel_name) +"]"
			var data = smsg;
			gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
			/////////////////////////////////////////////////////////////////////
		}
		

	},
	
	"create_vote" : function(ch_code, ch_name){
		function _getTimeHtml() {
			var html_time = '';
			var now = moment();
			now.set({'hour':0, 'minute':0, 'second':0, 'millisecond':0});
			
			var ckdate = now.clone();
			ckdate.add(1, 'day');
			
			while (now.format() != ckdate.format()) {
				html_time += '<option value="' + now.format('HH:mm') + '">' + now.format('h:mm A') + '</option>';;
				now.add(30, 'minutes');
			}
			return html_time;
		}
		
		gBodyM.select_channel_code = ch_code;
		gBodyM.select_channel_name = ch_name;
		
		var html =
			'<div class="wrap">' +   
			'	<div id="container" class="mu_mobile">' +
			'		<section class="work mu_work">' +
			'			<div class="folder-add dead_time">' +
			'				<div class="mo_tit_box">' +
			'					<h1>' + gap.lang.deadline + '</h1>' +
			'					<div class="mo_table_box">' +
			'						<div id="end_date" class="sch_day_box">' +
			'							<input type="text" name="" id="disp_end_date" class="input day" placeholder="' + gap.lang.deadline + '">' +
			'							<button type="button" class=mo_ico></button>' +
			'						</div>' +
		//	'						<div class="input-field selectbox time">' +
		//	'							<select id="end_time">' +
		//	'							</select>' +
		//	'						</div>' +
			'						<div class="sch_day_box">' +
			'							<input type="text" id="end_time" class="input day">' +
			'						</div>' +
			'					</div>' +
			'				</div>' +
			'				<div class="mo_tit_box">' +
			'					<h1 class="oren">' + gap.lang.vote_title + '</h1>' +
			'					<div>' +
			'						<div class="n_input">' +
			'							<input type="text" id="vote_title" placeholder="(' + gap.lang.essential + ') ' + gap.lang.input_vote_title + '"/>' +
			'						</div>' +
			'					</div>' +     
			'				</div>' +        
			'				<div class="mo_tit_box">' +
			'					<h1 class="oren">' + gap.lang.description + '</h1>' +
			'					<div>' +
			'						<div>' +
			'							<div class="n_input">' +
			'								<textarea id="vote_description" placeholder="(' + gap.lang.optional + ') ' + gap.lang.input_vote_comment + '"></textarea>' +
			'							</div>' +
			'						</div>' +
			'					</div>' +      
			'				</div>' +
			'				<div class="mo_tit_box chk_sel_box">' +
			'					<h1 class="oren">' + gap.lang.select_item + '</h1>' +  
			'					<div class="set_sec">' +
			'						<span class="radio_box">' +
			'							<input type="radio" id="sele_01" name="select_item" value="text" checked="checked">' +
			'							<label for="sele_01">' + gap.lang.text + '</label>' +
			'						</span>' +
			'						<span class="radio_box">' +
			'							<input type="radio" id="sele_02" name="select_item" value="date">' +
			'							<label for="sele_02">' + gap.lang.date + '</label>' +
			'						</span>' +
			'						<div id="text_area" class="mo_table_box">' +
//			'							<div class="sch_day_box">' +
//			'						    	<input type="text" name="text_item" id="text_input_1" class="input day" placeholder="' + gap.lang.input_content + '">' +
//			'							</div>' +
//			'							<div class="sch_day_box">' +
//			'								<input type="text" name="text_item" id="text_input_2" class="input day" placeholder="' + gap.lang.input_content + '">' +
//			'							</div>' +
			'							<div class="n_input">' +
			'						    	<textarea name="text_item" id="text_input_1" class="input day" style="border:solid 1px #e5e5e5; " placeholder="' + gap.lang.input_content + '"></textarea>' +
			'							</div>' +
			'							<div class="n_input">' +
			'								<textarea name="text_item" id="text_input_2" class="input day" style="border:solid 1px #e5e5e5; " placeholder="' + gap.lang.input_content + '"></textarea>' +
			'							</div>' +
			'						</div>' +			
			'						<div id="date_area" class="mo_table_box" style="display:none;">' +
			'							<div class="sch_day_box">' +
			'						    	<input type="text" name="date_item" id="date_input_1" class="input day" placeholder="' + gap.lang.input_date + '">' +
			'								<button type="button" class="mo_ico" id="date_input_ico_1"></button>' +
			'							</div>' +
			'							<div class="sch_day_box">' +
			'								<input type="text" name="date_item" id="date_input_2" class="input day" placeholder="' + gap.lang.input_date + '">' +
			'								<button type="button" class="mo_ico" id="date_input_ico_2"></button>' +
			'							</div>' +
			'						</div>' +
			'						<div id="add_item">' +
			'							<button type="button" class="add_item"><span class="ico"></span>' + gap.lang.add_item + '</button>' +
			'						</div>' +
			'					</div>' +     
			'				</div>' +
			'				<div class="mo_tit_box chk_sel_box">' +
			'					<h1>' + gap.lang.anonymous_voting + '</h1>' +
			'					<div class="set_sec">' +
			'						<span class="radio_box">' +
			'							<input type="radio" id="sele_03" name="anonymous"  value="T">' +
			'							<label for="sele_03">' + gap.lang.use + '</label>' +
			'						</span>' +
			'						<span class="radio_box">' +
			'							<input type="radio" id="sele_04" name="anonymous" value="F" checked="checked">' +
			'							<label for="sele_04">' + gap.lang.not_used + '</label>' +
			'						</span>' +
			'					</div>' +  
			'				</div>' +
			'				<div class="mo_tit_box chk_sel_box">' +
			'					<h1>' + gap.lang.item + ' ' + gap.lang.multiple_choice + '</h1>' +
			'					<div class="set_sec">' +
			'						<span class="radio_box">' +
			'							<input type="radio" id="sele_05" name="multiple"  value="T">' +
			'							<label for="sele_05">' + gap.lang.possible + '</label>' +
			'						</span>' +
			'						<span class="radio_box">' +
			'							<input type="radio" id="sele_06" name="multiple" value="F" checked="checked">' +
			'							<label for="sele_06">' + gap.lang.impossible + '</label>' +
			'						</span>' +
			'					</div>' +  
			'				</div>' +
			'			</div>' +    
			'		</section>' +
			'	</div>' +
			'</div>';
		
		$("#dis").html(html);
		
		
		// 마감일
		var $end_date = $('#disp_end_date');
		var sel_date = moment().format('YYYY-MM-DD');
		$('#disp_end_date').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			defaultSelection: moment(sel_date),
			anchor: $end_date.get(0),
			display: 'anchored',
			theme: 'ios',
			themeVariant : 'light',
			controls: ['calendar'],
			select: 'date',
			dateFormat: 'YYYY.MM.DD',
			calendarType: 'month',
			touchUi: true,
			buttons: [],
			min: moment().format('YYYY.MM.DD'),
		    onChange: function (event, inst) {
				$('#disp_end_date').val(event.valueText)
		    }
		});
		
		$("input[name='date_item']").each(function(idx, val){
			var $date = $('#date_input_' + (idx + 1));
			var sel_date = moment().format('YYYY-MM-DD');
			$('#date_input_' + (idx + 1)).mobiscroll().datepicker({
				locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
				defaultSelection: moment(sel_date),
				anchor: $date.get(0),
				display: 'anchored',
				theme: 'ios',
				themeVariant : 'light',
				controls: ['calendar'],
				select: 'date',
				dateFormat: 'YYYY.MM.DD',
				calendarType: 'month',
				touchUi: true,
				buttons: [],
				min: moment().format('YYYY.MM.DD'),
			    onChange: function (event, inst) {
			    }
			});
		});
		
		// 시간 selectbox
		var $end_time = $('#end_time');
		var time_html = _getTimeHtml();
		
		// 시간 (기본은 현재 시간 +1)
		var end_time;
		var now = moment();
		var add_hour = now.get('h') < 23 ? 1 : 0; // 11시가 넘으면 +1 하지 않음
		end_time = now.startOf('h').add(add_hour, 'h').format('HH:mm');
	//	$end_time.append(time_html).val(end_time);
	//	$('select').material_select();
		
		$('#end_time').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			theme: 'ios',
			themeVariant : 'light',
			controls: ['time'],
			stepMinute: 30,
			timeFormat: 'hh:mm A',
            onInit: function (event, inst) {
				inst.setVal(end_time, true);
			}
		});	
		
		// 선택항목
		$("input[name='select_item']").off().on('change', function(){
			var _val = $("input[name='select_item']:checked").val();
			
			if (_val == "text"){
				$('#text_area').show();
				$('#date_area').hide();
				
			}else{
				$('#date_area').show();
				$('#text_area').hide();
			}
		});
		
		// 항목추가
		$('#add_item').off().on('click', function(){
			var _val = $("input[name='select_item']:checked").val();
			if (_val == "text"){
				var html =
//					'<div class="sch_day_box">' +
//					'	<input type="text" name="text_item" id="text_input_' + ($("input[name='text_item']").length + 1) + '" class="input" placeholder="' + gap.lang.input_content + '">' +
//					'</div>';
					'<div class="n_input">' +
					'	<textarea name="text_item" style="border:solid 1px #e5e5e5; " id="text_input_' + ($("input[name='text_item']").length + 1) + '" class="input" placeholder="' + gap.lang.input_content + '"></textarea>' +
					'</div>';
				$('#text_area').append(html);
				
			}else if (_val == "date"){
				var html =
					'<div class="sch_day_box">' +
					'	<input type="text" name="date_item" id="date_input_' + ($("input[name='date_item']").length + 1) + '" class="input day" placeholder="' + gap.lang.input_date + '">' +
					'	<button type="button" class="mo_ico" id="date_input_ico_' + ($("input[name='date_item']").length + 1) + '"></button>' +
					'</div>';
				$('#date_area').append(html);
				
				var input_idx = $("input[name='date_item']").length;
				var $date = $('#date_input_' + input_idx);
				var sel_date = moment().format('YYYY-MM-DD');
				$('#date_input_' + input_idx).mobiscroll().datepicker({
					locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
					defaultSelection: moment(sel_date),
					anchor: $date.get(0),
					display: 'anchored',
					theme: 'ios',
					themeVariant : 'light',
					controls: ['calendar'],
					select: 'date',
					dateFormat: 'YYYY.MM.DD',
					calendarType: 'month',
					touchUi: true,
					buttons: [],
					min: moment().format('YYYY.MM.DD'),
				    onChange: function (event, inst) {
				    }
				});
			}
		});
		
		$('.sch_day_box .mo_ico').on('click', function(){
			$(this).parent().find('input').click();
			return false;
		});
	},
	
	"create_vote_action" : function(){
		
		var $deadline = $('#disp_end_date');
		if ($deadline){
			if ($deadline.val() == ""){
				mobiscroll.toast({message:gap.lang.set_enddate, color:'danger'});
				return false;
			}
		}
		
		var $title = $('#vote_title');
		if ($title){
			if ($title.val() == ""){
				mobiscroll.toast({message:gap.lang.input_vote_title, color:'danger'});
				return false;
			}
		}
		
		var _list = [];
		var _val = $("input[name='select_item']:checked").val();
		if (_val == "text"){
//			$("input[name='text_item']").each(function(idx, obj){
//				if ($.trim($(obj).val()) != ""){
//					_list.push($(obj).val());
//				}
//			});
			$("textarea[name='text_item']").each(function(idx, obj){
				if ($.trim($(obj).val()) != ""){
					_list.push($(obj).val());
				}
			});
			
		}else if (_val == "date"){
			$("input[name='date_item']").each(function(idx, obj){
				if ($.trim($(obj).val()) != ""){
					_list.push($(obj).val());
				}
			});
		}
		
		var surl = gap.channelserver + "/vote_response.km";
		var postData = {
				"lists" : _list.join("-spl-")
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
					var voteData = {
							"key" : res.data.key,
							"end_date" : $('#disp_end_date').val(),
							"end_time" : moment($('#end_time').mobiscroll('getVal')).format('HH:mm'),	//$('#end_time').val(),
							"title" : $('#vote_title').val(),
							"comment" : $('#vote_description').val(),
							"select_item" : $("input[name='select_item']:checked").val(),
							"anonymous_vote" : $("input[name='anonymous']:checked").val(),
							"multi_choice" : $("input[name='multiple']:checked").val(),
							"item_list" : _list
						};
				//	gBody3.channel_reg_vote(voteData);
					gBodyM.channel_reg_vote(voteData);
					
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
	
	
	"search_cur_channel_member" : function(channelid){
		//모바일 push에 사용할 나를 제외한 현재 채널의 멤버 리스트를 가져온다.
		
		var infos = gBodyM.cur_channel_list_info;
		var members = new Object();
		var list = [];
		for (var i = 0 ; i < infos.length; i++){
			
			var info = infos[i];
			if (info.ch_code == channelid){
				for (var j = 0 ; j < info.member.length; j++){
				//	if (info.member[j].ky != gap.userinfo.rinfo.ky){
					//모바일은 본인에게도 푸쉬를 날려야 페이지에 실시간 적용할 수 있다.
						if (info.member[j].ky != ""){
							list.push(info.member[j].ky);
						}						
				//	}
				}
				if (info.owner.ky != gap.userinfo.rinfo.ky){
					list.push(info.owner.ky);
				}
				return list;
				break;
			}
		}
	},
	
	
	
	 "channel_reg_vote" : function(obj){
		 obj.type = "vote";													
		 var data = {
		 	"type" : "msg",
		 	"channel_code" : gBodyM.select_channel_code,
		 	"channel_name" : gap.textToHtml(gBodyM.select_channel_name),
		 	"email" : gap.userinfo.rinfo.em,
		 	"ky" : gap.userinfo.rinfo.ky,
		 	"owner" : gap.userinfo.rinfo,
		 	"content" : "",
		 	"edit" : "F",
		 	"msg_edit" : "",
		 	"id" : "",
		 	"ex" : obj,
		 	"fserver" : gap.channelserver
		 };

		// gBodyM.send_socket(data, "ms");
		 
		 gap.send_msg_to_server_mobile(data);
	 },
	
	"response_vote" : function(_vote){
		/*
		 * _vote 데이터 샘플 : "{\"key\":\"20220901070915_2NYWZCESIT455HZ\",\"title\":\"보안 일자 점검\",\"comment\":\"11111111\",\"endtime\":\"마감일 17:00\"}"
		 */
		 _vote = decodeURIComponent(_vote);
		var _info = JSON.parse(_vote);
		if (typeof(_info) == "string"){
			_info = JSON.parse(_info);
		}
		var _key = _info.key;
		var _title = _info.title;
		var _comment = _info.comment;
		var _endtime = _info.endtime;
		var _anonymous = _info.anonymous;
		var _multi = _info.multi;
		var _deadline = false;
		var t1 = moment(_endtime, 'YYYY-MM-DD HH:mm'); 
		var t2 = moment(); 
		var dif = moment.duration(t2.diff(t1)).asMinutes();
		
		// 투표 마감 기한 체크
		if (dif > 0){
			_deadline = true;
		}
		
		var surl = gap.channelserver + "/vote_response_search.km";
		var postData = {
				"key" : _key
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
					var vote_done = false;
					
					var html =
						'<div class="wrap">' +
						'	<div id="container" class="mu_mobile mu_work_cont vote">' +
						'		<section class="work mu_work mo_vote vote_wrap">' +
						'			<div class="mo_tit_box">' +
						'				<div class="vote_deadline">' +
						'					<span class="deadline">' + gap.lang.deadline + '</span>' +
						'					<time>' + _endtime + '</time>' +
						'				</div>' +
						'				<div class="vote_tit">' +
						'					<p>' + _title + '</p>' +
						'					<span>' + _comment.replace(/[\n]/gi,"<br>") + '</span>' +
						'				</div>' +
						'			</div>' +
						'			<div>' +
						'				<div class="layer_inner">' +
						'					<div class="vote_list">' +
						'					</div>' +
						'					<div class="btn_wr">' +
						'						<button type="button" class="btn_layer confirm vote">' + gap.lang.vote + '</button>' +
						'					</div>' +
						'				</div>' +
						'			</div>' +
						'		</section>' +
						'	</div>' +
						'</div>';
						
					$("#dis").html(html);
					
					for (var i = 0; i < res.data.data.length; i++){
						var info = res.data.data[i];
						var item_id = info._id.$oid;
						var vote_list_html = '';
						
						if (typeof(info.members) != "undefined"){
							if (!vote_done){
								var _ky = info.members.filter(function(obj) {
									return (obj === gap.userinfo.rinfo.ky);
								});
								if (_ky.length > 0){
									vote_done = true;
								}	
							}
						}
						
						vote_list_html += '<div id="' + item_id + '" class="input_box rel" style=" height:auto; display:flex; justify-content:space-between">';

					//	vote_list_html += '	<input type="text" name="input_vote" class="formInput" value="' + info.data + '" readonly>';
						vote_list_html += '	<div name="input_vote" class="formInput" style="word-break:break-all; border-radius:8px; font-size:14px; height:auto; width: calc(100% - 50px) ">'+info.data.replace(/[\n]/gi,"<br>")+'</div>';
						
						vote_list_html += '	<div id="voter_' + item_id + '" class="icon_box">';
						vote_list_html += '		<span class="ico"></span>';
						vote_list_html += '		<span class="vote_count">' + (typeof(info.members) != "undefined" ? info.members.length : '0') + '</span>';
						vote_list_html += '	</div>';
						
						vote_list_html += '</div>';
						
						$('.vote_list').append(vote_list_html);
						$('#voter_' + item_id).data('voter', (typeof(info.members) != "undefined" ? info.members : ''));
					}
					
					if (_multi == "T"){
						var multi_html = 
							 '<div class="list_sub_txt">' +
							 '	<span class="ico"></span>' +
							 '	<span>' + gap.lang.possible_multiple_choice + '</span>' +
							 '</div>';
						$('.vote_list').append(multi_html);
					}
					
					if (vote_done){
						$('.confirm.vote').html(gap.lang.basic_modify);
					}
					
					// 투표항목 클릭
					$('.input_box.rel').off().on('click', function(e){
						;
						if (e.target.className == "formInput"){
							if (_multi == "T"){
								if ($(this).hasClass('on')){
									$(this).removeClass('on');
									
								}else{
									$(this).addClass('on');
								}
								
							}else{
								$('.input_box.rel').each(function(idx, el){
									$(el).removeClass('on');
								});
								
								$(this).addClass('on');
							}
							$('.formInput').blur();
							
						}else if (e.target.className == "ico" || e.target.className == "vote_count"){
							if (_anonymous == "T"){
								return false;
							}
							var $el = $('#voter_' + $(this).attr('id'));
							var voter = $el.data('voter');
							if (voter != ""){
								$("#members").empty();
								
								var surl = gap.channelserver + "/search_user_empno.km";
								var postData = {
										"empno" : voter.join(",")
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
										var list = res[0];
										var html = '';
										
									//	html += '<div>';
										for (var i = 0; i < list.length; i++){
											var info = gap.user_check(list[i]);

											html += '<div class="vote_select">';
											html += info.user_img;
											html += '<span class="vote_name">' + info.disp_user_info + '</span>';
											html += '</div>';
										}
									//	html += '</div>';
										
										$('#members').html(html);
										$('#members').css('background', '#f7f7f7');

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
												$('#members').css('background', '#ccc');
											}
										});

										var scrollable = $('#memberlist').mobiscroll4().popup({
											anchor: $el,
											display: 'bubble',
											scrollLock: false,
										//	cssClass: css,
											buttons: [],
											onClose : function(event, inst){
												$("body").css("overflow-y", "auto");
											}                                 
										}).mobiscroll4('getInst');			
										
										scrollable.show();
									    return false;
									},
									error : function(e){
										gap.gAlert(gap.lang.errormsg);
										return false;
									}
								});	
							}
						}
					});
					
					// 투표버튼 클릭
					$('.confirm.vote').off().on('click', function(){
						if (_deadline){
							mobiscroll.toast({message:gap.lang.close_vote, color:'info'});
							return false;
						}
						if (vote_done){
						//	mobiscroll.toast({message:gap.lang.aleady_vote, color:'danger'});
						//	return false;
						}
						
						var id_list = [];
						$('.input_box.rel.on').each(function(idx, el){
							id_list.push($(el).attr('id'))
						});
						
						if (id_list.length == 0){
							mobiscroll.toast({message:gap.lang.select_vote_item, color:'danger'});
							return false;
						}
						
						var surl = gap.channelserver + "/vote_response_update.km";
						var postData = {
								"id" : id_list.join("-spl-"),
								"type" : (!vote_done ? "insert" : "update"),
								"key" : _key
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
									// 다시 그림
									//location.reload();
									
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
					});
					
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
	
	
	
	
	
	
	"mobile_app_call" : function(type, opt, fopt, is_del_auth, is_copy_auth){
		//type : 어디서 클릭 했는지 구부하는 인자 1: 컨텐츠 목록 에서 메뉴 클릭한 경우 / 2 : 파일 단위 클릭한 경우
		//1 : 즐겨찾기  / 2 : 상세보기 / 3 : URL 복사 / 4 : 드라이브 등록   / 5 : 미리보기 / 6 : 다운로드  / 7 : 이동하기 / 8 : 삭제하기
		//opt : 컨텐츠 작성자가 본인인 경우  me, 다른사람이 작성한 컨텐츠일 경우 : you
		
		var url_link = "";
		var is_copy = "";
		if (fopt == "T"){
			is_copy = "";
		}else{
			if (is_copy_auth == "F"){
				is_copy = "";
			}else{
				is_copy = "9";
			}			
		}
		var is_write = "9";
		if (fopt == "F"){
			is_write = "9";
			var is_write_auth = gap.checkAuth2(gBodyM.cur_opt);
			if (!is_write_auth){
				is_write = "";
			}
		}else{
			is_write = "";
		}
		if (type == "1"){
			//채널에서 더보기 버튼 클릭한 경우 - 자신의 컨텐츠를 클릭한 경우
			//상세보기, 삭제하기 메뉴를 표시한다.	
			
			var json = JSON.stringify(gBodyM.cur_select_display);
			
			json = encodeURIComponent(json);
			if (opt == "me"){
				url_link = "kPortalMeet://NativeCall/callChannelMenu?param1=&param2=&param3=&param4=&param5=&param6=&param7=&param8=8&param9="+ is_write + "&param10="+is_copy;
			}else{
				//권한에 따라 Owner가 삭제할 수 있다
				
				var is_del = "";
				if (gap.cur_channel_info.opt_del && gap.cur_channel_info.opt_del == "T"){
					if (gap.cur_channel_info.owner.ky == gap.userinfo.rinfo.ky){
						is_del = 8;
					}else{
						if (gap.cur_channel_info.owner.ky.toLowerCase() == gap.userinfo.rinfo.ky.toLowerCase()){
							is_del = 8;
						}
					}
				}else{
					if (gap.cur_channel_info.owner.ky.toLowerCase() == gap.userinfo.rinfo.ky.toLowerCase()){
						is_del = 8;
					}
				}	
				url_link = "kPortalMeet://NativeCall/callChannelMenu?param1=&param2=&param3=&param4=&param5=&param6=&param7=&param8="+is_del+"&param9="+ is_write + "&param10="+ is_copy;
			}
			url_link += "&mode=gBodyM&json="+json;
			gBodyM.connectApp(url_link);
			
		}else if (type == "2"){
			//채널 컨텐츠내에서 특정 파일을 클릭한 경우
			//otp : me ==> (즐겨찾기 , URL복사,미리보기, 드라이브 등록, 삭제)
			//opt : you ==> (즐겨찾기, URL복사, 미리보기, 드라이브등록)
			
			var json = JSON.stringify(gBodyM.cur_select_display);  //파일명, 작성자, 날짜
			json = encodeURIComponent(json);

			if (opt == "me"){
				url_link = "kPortalMeet://NativeCall/callChannelMenu?param1=1&param2=&param3=&param4=4&param5=5&param6=&param7=&param8=8&param9="+(fopt=="T"?"":"9");
			}else{
				url_link = "kPortalMeet://NativeCall/callChannelMenu?param1=1&param2=&param3=&param4=4&param5=5&param6=&param7=&param8=&param9="+(fopt=="T"?"":"9");
			}
			url_link += "&mode=gBodyM&json="+json;
			gBodyM.connectApp(url_link);
		}	
	},
	
	"testRun" : function(){
		
	},
	
	"detail_view" : function(id, channel_code, channel_name){
		
		var url_link = "kPortalMeet://NativeCall/callDetailChannel?id=" + id + "&channel_code=" + channel_code + "&channel_name=" + channel_name + "&ty=&mode=gBodyM";
		gBodyM.connectApp(url_link);
	},
	
	"call_reply_window" : function(id, channel_code, channel_name){		
		channel_name = channel_name.replace(/-spl-/gi,"'");
		gBodyM.is_receive_draw_reply = false;	//소켓으로 받아 댓글 그리는거 초기화
		var url_link = "kPortalMeet://NativeCall/callWrteReply?id=" + id + "&channel_code=" + channel_code + "&channel_name=" + channel_name;
		gBodyM.connectApp(url_link);
	},
	
	"call_image_view" : function(bun, id, opt){		

		var json = JSON.stringify(gBodyM.cur_select_display);  //파일명, 작성자, 날짜
		json = encodeURIComponent(json);

		if (opt == "me"){
			url_link = "kPortalMeet://NativeCall/callImageView?bun=" + bun + "&id="+id+"&param1=1&param2=&param3=3&param4=4&param5=&param6=&param7=&param8=8&mode=gBodyM&json="+json;
		}else{
			url_link = "kPortalMeet://NativeCall/callImageView?bun=" + bun + "&id="+id+"&param1=1&param2=&param3=3&param4=4&param5=&param6=&param7=&param8=&mode=gBodyM&json="+json;
		}
		gBodyM.connectApp(url_link);
		
	},
	
	
	"call_image_view_editor" : function(url){		
		//에디터 내의 이미지를 클릭했을 때 호출되는 함수로 넘어온 URL을 모바일 앱에서 그대로 표시만 해주면 된다.
		//파일명은 별도로 없다. 그냥 Editor Image로 통일해도 되지 않을까.
		//단독으로 클릭한 이미지만 이미지 보기로 띄워주고 닫으면 현재창을 그냥 닫는 기능만 있으면 됨
		var json = encodeURIComponent(url);
	
		url_link = "kPortalMeet://NativeCall/callImageView_editor?url="+json;
		gBodyM.connectApp(url_link);
		
	},
	
	
	
	"connectApp" : function(url){
		try{
			if (window.name=='kPortalMeet') {
				gBodyM.openInWebView(url);					
			}else{
				gBodyM.openInWebView(url);	
			}
		}catch(e){}
		
	},
	
	"openInWebView" : function(url){
		if (typeof androidHandler === 'undefined') {
			var appFrame = '<iframe id="appFrame" class="appFrame" src="'+url+'" width="0" height="0" style="display:none"></iframe>';
			$('body').append(appFrame);
			setTimeout(function(){
				$(".appFrame").remove();
			}, 1000);
			
		} else {
			//gap.gAlert(url);
			androidHandler.openurl(url);
		}
	},
	
	"mobile_finish" : function(){
		var url_link = "kPortalMeet://NativeCall/callFinishWeb";
		gBodyM.connectApp(url_link);
	},
	
	"mobile_close" : function(){
		var url_link = "kPortalMeet://NativeCall/callFinishWebClose";
		gBodyM.connectApp(url_link);
	},

	
	"mobile_start" : function(){		
		var url_link = "kPortalMeet://NativeCall/callStartLoading";
		gBodyM.connectApp(url_link);
	},
	
		
	"mobile_open_layer" : function(selector){
		/*for (var i = 0; i < gBodyM.layer_list.length; i++){
			if (gBodyM.layer_list[i] != selector){
				$('#' + gBodyM.layer_list[i]).empty();
				$('#' + gBodyM.layer_list[i]).hide();				
			}
		}*/
		
		$("div").each(function(){
			if ($(this).attr("data") == "_layer"){
				if ($(this).attr("id") != selector){
				//	$('#' + $(this).attr("id")).empty();
					$('#' + $(this).attr("id")).hide();				
				}
			}
		});
		
		$('#dis').fadeOut();
		
		var max_idx = gap.maxZindex();
		$('#' + selector)
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();		
	},
	
	"mobile_close_layer" : function(selector){
	//	$('#' + selector).empty();
		$('#' + selector).fadeOut();
		try{
			gap.hideBlock();
		}catch(e){}
		$('#dis').fadeIn();
	},
	
	"all_close_layer" : function(){
		/*for (var i = 0; i < gBodyM.layer_list.length; i++){
			$('#' + gBodyM.layer_list[i]).empty();
			$('#' + gBodyM.layer_list[i]).hide();
		}*/
		
		gap.hideBlock();
		
		$("div").each(function(){
			if ($(this).attr("data") == "_layer"){
			//	$('#' + $(this).attr("id")).empty();
				$('#' + $(this).attr("id")).hide();	
			}
		});
		$('#dis').empty();
		$('#dis').show();
	},	
	
	"url_open" : function(url){		
		url = encodeURIComponent(url);
		var url_link = "kPortalMeet://NativeCall/callUrl?url="+url;
		gBodyM.connectApp(url_link);
	},
	
	"go_home" : function(){		
		var url_link = "kPortalMeet://NativeCall/callCloseLayer?done=no";
		gBodyM.connectApp(url_link);
	},
	
	"go_home_refresh" : function(){		
		var url_link = "kPortalMeet://NativeCall/callCloseLayer?done=yes";
		gBodyM.connectApp(url_link);
	},
	
	"init_phone_call" : function(){
		//최초 로딩이 완료되었을 경우만 phone으로 완료 여부를 넘겨준다.
		var url_link = "kPortalMeet://NativeCall/loadComplete";		
		gBodyM.connectApp(url_link);
	},
	
	/* @param
	 * ty : 1(사용자만 검색), 2(사용자+부서 검색), 3(조직도 사용자만 선택), 4(조직도 사용자 + 수버 선택)
	 * txt : 검색어
	 * gvar : callback 함수가 포함된 전역변수명
	 * func_nm : callback 함수명
	 */
	"mobile_org_req" : function(ty, txt, gvar, func_nm){		
		var param = {
			type: ty || 1,
			query : txt,
			c1 : gvar || '',
			c2 : func_nm || ''
		}
		
		var url_link = "kPortalMeet://NativeCall/callOrgSearch?" + $.param(param);
		gBodyM.connectApp(url_link);		
	},
	
	"org_search" : function(only_user_search, qry, gvar, func_nm){
		this.mobile_org_req(only_user_search ? '1' : '2', qry, gvar, func_nm);
	},
	
	"org_open" : function(only_user_search, gvar, func_nm){
		this.mobile_org_req(only_user_search ? '3' : '4', '', gvar, func_nm);
	},
	
	"call_preview" : function(url, filename, type){
		
	//	if (type == "video" && is_ios){	
		if (type == "video"){	
//			var ext = "";
//			att_names = filename.toString();
//			if(att_names.lastIndexOf(".") != -1){
//				ext = att_names.substring(att_names.lastIndexOf(".") + 1);
//				if(ext.search(/[^A-Za-z0-9]/) != -1){
//					ext = ext.substring(0, ext.search(/[^A-Za-z0-9]/));
//				}
//			}
//			if (ext.toLowerCase() != "mp4"){
//				gap.gAlert(gap.lang.not_support_ios);
//				return false;				
//			}
			
			//안드로이드 iOS에서 기본 HTML5에서 동영상을 재생할 수 있는 확장자 체크시 .mp4, .mov, .3gp여기 3개만 통과시키고 나머지는 지원하지 않는다 표시함
			//안드로이드는 .mkv 확장자도 가능한데 iOS에 맞춤
	//		if ( (ext.toLowerCase() != "mp4") && (ext.toLowerCase() != "mov") && (ext.toLowerCase() != "3gp")){
			if (gap.is_file_preview_mobile(filename)){
				gap.gAlert(gap.lang.not_support_mobile);
				return false;		
			}
		}
		
		
		
		url = encodeURIComponent(url);
		var url_link = "kPortalMeet://NativeCall/callFileViewer?url="+url+"&fname="+filename+"&type="+type;		
		gBodyM.connectApp(url_link);
	},
	
	
	//'"+tunid+"','"+attname+"', '"+tdb+"'
	//var url = "/mail/bigmail/bigmail"+tdb+".nsf/0/"+tunid+"/$FILE/" + encodeURIComponent(attname);
	//gap.file_download_mail(url, attname);
	"file_convert_mail" : function(unid, filename, tdb, tserver, opt){
		/*
		 * 메일 첨부파일을 After-image로 보기위해서 호출되는 함수
		 */
		
		
		var xp = gap.is_file_type_filter(filename);
		bserver = location.host +"/" + tserver;
		
		if (xp == "img"){
			var url = location.protocol + "//" +  bserver + "/WebChat/bigfile/bigmail"+tdb+".nsf/0/"+unid+"/$FILE/" + filename;
			gBodyM.call_preview(url, filename, "image");
		}else if (xp == "movie"){
			var url = location.protocol + "//" +  bserver + "/WebChat/bigfile/bigmail"+tdb+".nsf/0/"+unid+"/$FILE/" + filename;
			gBodyM.call_preview(url, filename, "video");
		}else{
			
			if (gap.check_preview_file(filename)){
				gBodyM.mobile_start();
				
				//bserver = "files.kmslab.com";
				//var url = location.protocol + "//" +  bserver + "/mail/bigmail/bigmail"+tdb+".nsf/0/"+unid+"/$FILE/" + encodeURIComponent(filename);
				
				var url = "";
				if (opt == "big"){
					//메일 본문에 BigFile 형태를 클릭한 경우 
					//var url = location.protocol + "//" + location.host + path + "/download/" + unid + "/Body/M2/" + filename;
					url = location.protocol + "//" +  bserver + "/bigmail/bigmail"+tdb+".nsf/download/"+unid+"/$FILE/";
				}else{
					//메일에 일반 첨부를 클릭한 경우
					url = location.protocol + "//" +  bserver + "/WebChat/bigfile/bigmail"+tdb+".nsf/0/"+unid+"/$FILE/";
				}
				
								
				var surl = gap.channelserver + "/FileConvert_mail.km";
				var postData = {
					"url" : url,
					"filename" : filename
				};	
			
					
				
				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(postData),
					success : function(res){
					//	gBodyM.mobile_finish();
						if (res.result == "OK"){
							
							
							gBodyM.mobile_finish();
							
							var md5 = res.data.md5;
							var filename = res.data.filename;
							var filepath = res.data.filepath;
							filepath = filepath.replace("D:\\", gap.synapserver + "\\");
							filepath = filepath.replace("/dsw-synap/", gap.synapserver + "\\");
							
							//var count = res.data.count;
							
							
							//싸이냅 소프트 파일 미리보기로 변경한다.
							//Y:\upload\dosa777@daesang.com\20220617150006_UUKYRUBAZJVCGE7\60eba30ab7174f846d32d702a4cf55c2.223956.pptx
							//"||192.168.14.47\talkdev\upload"
						//	var filePath = gap.synapserver + "\\upload\\" + email + "\\" + upload_path + "\\" + md5 + "." + ft;	
						//	var filePath = "\\\\192.168.14.47\\talkdev\\upload\\1.txt";// 파일이 다운로드 된 서버 로컬 경로
						//	var filePath = "D:\\테스트.txt";// 파일이 다운로드 된 서버 로컬 경로
							
							gap.call_synap(md5, filepath, filename, "TT");

							
						}else{
						//	gap.hide_loading();
							gBodyM.mobile_finish();
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					},
					error : function(e){
					//	gBodyM.mobile_finish();
						gBodyM.mobile_finish();
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				});
			}else{
				gap.gAlert(gap.lang.noconvert);
			}
		}
		
		
		
								
	},
	
	
	
	
	
	
	
	
	
	
	
	
	"show_image" : function(url){
		
		$("#dis").hide();
		$("#preview_video").hide();
    //	$("#preview_title").text(title);
    	$("#preview_img_src").attr("src", url);			
    	$("#preview_img_src").attr("data", url);
    	
    	var int = gap.maxZindex();
    	$("#preview_img").css("zIndex", parseInt(int) + 1);
    	$("#preview_img").fadeIn();	

    	$("#img_close_btn").on("click", function(){
    		$("#preview_img_src").attr("src","");
    		$("#preview_img").hide();
    		$("#dis").show();
    	});		
    	
    	
    	
    	return false;
	},
	
	"show_video" : function(url){

		$("#dis").hide();
	//	$("#video_title").text(title);
		$("#preview_img").hide();
		$("#video_play_div_mp4").attr("src", url);
		
		var int = gap.maxZindex();		
		$("#preview_video").css("zIndex", parseInt(int)+1);
		$("#preview_video").show();		
		
		var video = $("#video_play_div_mp4");
		video[0].play();
		
		$("#video_close_btn").on("click", function(){
			video[0].src = "";
			video[0].pause();
			$("#preview_video").hide();
			$("#dis").show();
		});	
		
		return false;
	},
	
	"pp_check" : function(filename){		
		
		var ext = gap.is_file_type_filter(filename);
	
		if (ext == "doc" || ext == "ppt" || ext == "xls" || ext == "pdf" || ext == "txt" || ext == "hwp" ){
			return true;
		}else{
			return false;
		}
	},
	
	"safari_check" : function(){
		var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
		var is_explorer = navigator.userAgent.indexOf('MSIE') > -1;
		var is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
		var is_safari = navigator.userAgent.indexOf("Safari") > -1;
		var is_opera = navigator.userAgent.toLowerCase().indexOf("op") > -1;
		if ((is_chrome)&&(is_safari)) { is_safari = false; }
		if ((is_chrome)&&(is_opera)) { is_chrome = false; }
		return is_safari;
	},
	
	"channel_read_update" : function(channel_code){
		//채널코드를 넘겨서 해당 채널에 마지막 읽은 시간을 업데이트 한다.
		
		var data = JSON.stringify({
			"email" : gap.search_cur_ky(),
			"channel_code" : channel_code
		});
		
	//	gap.gAlert(data);
		
		var url = gap.channelserver + "/channel_read_update.km";
		$.ajax({
			type : "POST",
			data : data,
			async : false,
			url : url,
			contentType : "application/json; charset=utf-8",
			datatype : "json",
			success : function(res){
			if (res.result == "OK"){							
				
				gBodyM["last_read_time_" + channel_code] = res.data.last_read_time;   
//				gBodyM.change_cur_channel_read_time(channel_code, res.data2);
			}
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
//	
//	"change_cur_channel_read_time" : function(room_key, read_time){
//		//해당 채널에 내가 마지막으로 읽은 시간을 다시 기록 한다.
//		//gBody3. channel_read_update 함수 호출 결과를 받아서 여기에 업데이트 한다.
//		//방마다 내가 읽지 않은 위치로 이동하기 위해서 처리한다.		
//		//gBodyM["last_read_time_" + room_key] = info.read_time;   
//		
//    	
//	},
//	
//	"check_cur_channel_read_time" : function(room_key){
//		
//		var surl = gap.channelserver + "/check_channel_last_read_time.km";
//		var postData = {
//					"id" : room_key
//				};
//		$.ajax({
//			type : "POST",
//			url : surl,
//			async : false,
//			dataType : "text",	//"json",
//			data : JSON.stringify(postData),
//			beforeSend : function(xhr){
//				xhr.setRequestHeader("auth", gap.get_auth());
//				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
//			},
//			success : function(__res){
//				
//				var res = JSON.parse(__res);
//				if (res.result == "OK"){									
//					gBodyM["last_read_time_" + room_key] = res.data2;    
//					return res.data2;
//				}else{
//					gap.gAlert(gap.lang.errormsg);
//					return false;
//				}
//			},
//			error : function(e){
//				gap.gAlert(gap.lang.errormsg);
//				return false;
//			}
//		});		
//	},
	
	
	"save_channel_option" : function(key){
		// 채널 설정 값 저장
		var surl = gap.channelserver + "/channel_options.km";
		var postData = {
			//	"email" : gap.userinfo.rinfo.ky,
				"opt1" : $("[name=prevent_auto_scrolling]:checked").val(),
				"opt2" : $("[name=collapse_reply]:checked").val(),
				"opt3" : $("[name=post_view_type]:checked").val(),
				"opt4" : $("[name=push_receive]:checked").val(),
				"opt5" : $("[name=collapse_editor]:checked").val(),
				"key" : key
			};

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text",	//"json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(__res){
				var res = JSON.parse(__res);
				if (res.result == "OK"){
					// do nothing
					
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
	
	/*
	 * App에서 해당 함수 호출하므로 함수명 변경 불가 !!!!!!!!!!!!!
	 */
	"set_channel_option" : function(){
		var sp = "-spl-";
		var _prevent_auto_scrolling = (gBodyM.prevent_auto_scrolling != "" ? gBodyM.prevent_auto_scrolling : "1");
		var _collapse_reply = (gBodyM.collapse_reply != "" ? gBodyM.collapse_reply : "2");
		var _post_view_type = (gBodyM.post_view_type != "" ? gBodyM.post_view_type : "1");
		var _push_receive = (gBodyM.push_receive != "" ? gBodyM.push_receive : "1");
		var _collapse_editor = (gBodyM.collapse_editor != "" ? gBodyM.collapse_editor : "2");
		
		return _prevent_auto_scrolling + sp + _collapse_reply + sp + _post_view_type + sp + _push_receive + sp + _collapse_editor;
	},
	
	/*
	 * App에서 해당 함수 호출하므로 함수명 변경 불가 !!!!!!!!!!!!!
	 */
	"reload_channel" : function(param){
		var _val = param.split("-spl-");
		
		// load_channel 함수에서 채널설정 전역 변수를 설정하기 때문에 아래 전역변수 설정은 의미 없음 - 굳이 지울 필요는 없음
		gBodyM.prevent_auto_scrolling = _val[0];
		gBodyM.collapse_reply = _val[1];
		gBodyM.post_view_type = _val[2];
		gBodyM.push_receive = _val[3];
		gBodyM.collapse_editor = _val[4];
		
		// 채널 호출
		gBodyM.load_channel(gBodyM.cur_opt, gBodyM.cur_name, gBodyM.q_str);
	},
	
	"receive_native" : function(_data){
		
	/*	console.log(_data);
		gap.gAlert(_data);
		gap.gAlert(_data.f1);
		gap.gAlert("앱에서 Push를 받는다");*/
		
			
		//소켓 메시지 수신시 호출되는 함수로 넘긴다.
		
		gBodyM.receive_box_msg(_data);  

	//	gap.check_alert(_data);
	//	var kk = JSON.parse(_data);
		
	},
	
	
	"mobileSend" : function(body){
	//	gap.gAlert("APP의 소켓을 이용한다");
		var url_link = "kPortalMeet://NativeCall/sendMsg?key1=100&key2=1&obj=" + encodeURIComponent(JSON.stringify(body));
		gBodyM.connectApp(url_link);
		return false;
	},
	
	
	"send_box_msg" : function(obj, id){		
		
		if (obj.sender != ""){
			var sendObj = new Object();
			sendObj.v = "2.0.0";
			sendObj.id = id;
			sendObj.ky = obj.sender;
			sendObj.ty = gap.search_cur_ky();
			sendObj.ft = [10, 15, 20];
			sendObj.f1 = JSON.stringify(obj);
		//	sendObj.f1 = obj;
			sendObj.f4 = "webview_";
			
			//if (gap.userinfo.userid == "AC926456" || gap.userinfo.userid == "AC926455" || gap.userinfo.userid == "AC925454" || gap.userinfo.userid == "AC925455" || gap.userinfo.userid == "AC912741"){
				gBodyM.mobileSend(sendObj);
			//}else{
			//	_self.sendMsg(sendObj, 100, 1);
			//}
			
		}
		
	},
	
	"send_box_notice_msg" : function(obj, id){		
		if (obj.sender != ""){
			var sendObj = new Object();
			sendObj.v = "2.0.0";
			sendObj.id = id;
			sendObj.ky = obj.sender;
			sendObj.ty = gap.search_cur_ky();
			sendObj.ft = [10, 15, 20];
			sendObj.f1 = JSON.stringify(obj);
			sendObj.f4 = obj.channel_code;
			
			gBodyM.mobileSend(sendObj);			
		}
	},	
	
	"close_all" : function(){
		$("#rmclose").click();
	},
	
	 "change_page" : function(){
		
		var pa1 = decodeURIComponent(gap.param1);
		var pa2 = decodeURIComponent(gap.param2);
		var pa3 = decodeURIComponent(gap.param3);
		var pa4 = decodeURIComponent(gap.param4);
		
		/*
		 * p1 값 종류
		 * channel : 채널
		 * drive : 드라이브
		 * todo : TO Do
		 * vote : 투표
		 * mail : 메일
		 * bbs : 게시파
		 * aprv : 결재
		 * vmeet : 화상회의
		 */
	
	//	gap.gAlert("change_page 호출");
	//	gap.gAlert(pa1 + "/" + pa2 + "/" + pa3 + "/" + pa4);
			
		if (typeof(pa1) != "undefined" && pa1 != ""){
			//특정 파라메터가 호출된 경우
			if (pa1 == "channel"){
				if (pa2 == "allcontent"){
					// 전체 - 업무 대화 Tab
					gBodyM.data_load('1', '');
					
				}else if (pa2 == "mycontent"){
					// 나의 콘텐츠 - 업무 대화 Tab
					gBodyM.data_load('2', '');
					
				}else if (pa2 == "sharecontent"){
					// 공유 콘텐츠 - 업무 대화 Tab
					gBodyM.data_load('3', '');
					
				}else if (pa2 == "allmention"){
					// 전체 멘션
					gBodyM.data_load('4', '');
					
				}else if (pa2 == "favorite"){
					// 전체 즐겨찾기
					gBodyM2.load_favorite('channel', '');
					
				}else if (pa2 == "allcontent_files" || pa2 == "mycontent_files" || pa2 == "sharecontent_files"){
					// 전체 / 나의 컨텐츠 / 공유 컨텐츠 - 업무 파일 Tab
					var list = gBodyM.search_my_channel_list();
					gBodyM.cur_opt = pa2.replace("_files", "");
					gBodyM2.load_files();
					
				}else if (pa4 == "files"){
					gBodyM.cur_opt = pa2;
					gBodyM.select_channel_code = pa2;
					gBodyM2.load_files();
					
				}else if (pa4 == "todo"){
					gTodoM.load_todo(pa2, 1);
					
				}else if (pa4 == "mailview"){
					gBodyM.data_load_channel(pa2);
					
				}else{
					gBodyM.load_channel(pa2, pa4, '');
				}
				
			}else if (pa1 == "todo"){
				
				//특정 To Do에 프로젝트를 연다
				if (pa3 != ""){
					//특정 할일을 바로 연다.
					gTodoM.compose_layer(pa3);	
				}else{
					//특정 프로젝트를 바로 연다
					gTodoM.load_todo(pa2, '1');
				}
			//	gTodoM.load_todo(pa2, '1');		
			//	setTimeout(function(){							
					//특정 할일에 바로 들어간다.
										
			//	}, 500);
				
			}else if (pa1 == "drive"){
				if (pa2 == "allcontent"){
					gBodyM2.load_drive_main('1', '');
					
				}else if (pa2 == "mycontent"){
					gBodyM2.load_drive_main('2', '');
					
				}else if (pa2 == "sharecontent"){
					gBodyM2.load_drive_main('3', '');
					
				}else if (pa2 == "favorite"){
					gBodyM2.load_favorite('drive', '');
					
				}else if (pa3 == "root" || pa3 == ""){
					//특정 드라이브를 호출하는 경우
					gBodyM2.load_drive(pa2, decodeURIComponent(pa4.replace(/\+/, "%20")), '');
					
				}else{
					//특정 폴더를 호출하는 경우				
					gBodyM2.load_folder(pa2, pa3, decodeURIComponent(pa4.replace(/\+/, "%20")));
				}
				
			}else if (pa1 == "vote"){
				if (pa4 == "create"){
					// 투표 생성
					gBodyM.create_vote(pa2, pa3);
					
				}else if (pa4 == "response"){
					// 투표 응답
					gBodyM.response_vote(pa2);
				}
				
			}else if (pa1 == "mailview"){
				gBodyM.getMailSummary(pa2, pa3, pa4);
				
			}else{
				// URL로 호출된게 아닐 경우
				var url_link = "kPortalMeet://NativeCall/loadComplete";		
				gBodyM.connectApp(url_link);
				return false;
			}
		}	
	},
	
	
	"updae_channel_data" : function(gubun, code, name){
		if (gubun == "todo"){
			//업무요청으로 들어간다.
			gTodoM.load_todo(code, '1');		
		}else if (gubun == "files"){
			//업무파일을 로딩한다.
			gBodyM.cur_opt = code;
			gBodyM.select_channel_code = code;
			gBodyM2.load_files();
		}else if (gubun == "favorite"){
			gBodyM2.load_favorite('channel', '');
		}else{
			if (code == "1" || code == "2" || code == "3" || code == "4"){
				gBodyM.data_load(code, '');
			}else{
				//특정 업무방으로 등어간다.
				gBodyM.load_channel(code, name, '');
			}
			
		}
	},
	
	"content_empty" : function(){
		$("#dis").empty();
	},
	
	"show_input" : function(opt){
		//kportalmeet://NativeCall/callShowInputControl
		//인자 : isShow (YES:보이기 NO:숨기기)
		var isShow = "YES";
		if (opt == "F"){
			isShow = "NO";
		}
		var url_link = "kPortalMeet://NativeCall/callShowInputControl?isShow="+isShow;	
		gBodyM.connectApp(url_link);
	},
	
	
	"channel_data_copy_other" : function(channel_code, channel_name){
		
		var is_write_auth = gap.checkAuth2(channel_code);
		if (!is_write_auth){
			gap.gAlert(gap.lang.ba4);
			return false;
		}

		var data = JSON.stringify({
			"channel_code" : channel_code,
			"channel_name" : channel_name,
			"key" : gBodyM.cur_select_info.id,
			"owner" : gap.userinfo.rinfo
		});
		var url = gap.channelserver + "/channel_data_copy_other.km";
		$.ajax({
			type : "POST",
			url : url,
			contentType : "application/json; charset=utf-8",
			dataType : "json",
			data : data,
			success : function(res){
				if (res.result == "OK"){
					//$("#close_copy_channel").click(); 
					gap.gAlert(gap.lang.ba3);
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





$(document).ready(function(){
	var previousY = 0;
	
	var pa1 = gap.param1;
	var pa2 = gap.param2;
	var pa3 = gap.param3;
	var pa4 = gap.param4;
//	var pa5 = gap.param5;
	
//	gap.gAlert("pa1 : " + pa1);
//	gap.gAlert("pa2 : " + pa2);
//	gap.gAlert("pa3 : " + pa3);
//	gap.gAlert("pa4 : " + pa4.sbustring(0,6));
//	gap.gAlert("pa5 : " + pa5);


//	if (pa1 == ""){
//		setTimeout(function(){
//			gBodyM.init_phone_call();	
//		}, 700);
//	}

	var loadcom = false;
	
	window.addEventListener('scroll', function(e) {
		//if ( (gBodyM.cur_opt == "allcontent") || (gBodyM.cur_opt == "mycontent") || (gBodyM.cur_opt == "sharecontent") || (gBodyM.cur_opt == "channel")){

		if (gBodyM.cur_opt != ""){
			if (!gBodyM.select_files_tab){
				// 채널이 호출된 경우 (Conversation 클릭 포함)
				
//				if (loadcom){
//					return false;
//				}			
//				var currentY = window.scrollY;
//			    if (currentY < previousY && currentY < 150 ) {	 
//			    	if (gBodyM.islast == "F"){
//			    		loadcom = true;
//			    		setTimeout(function(){
//			    			gBodyM.channel_addContent();
//			    			loadcom = false;			    			
//			    		}, 5000);
//			    		
//			    	}
//			    }
//			    previousY = currentY;	
				
				
				var currentY = window.scrollY;
			    if (currentY < previousY && currentY < 150 ) {	 
			    	if (gBodyM.islast == "F"){
			    		gBodyM.channel_addContent();
			    	}
			    }
			    previousY = currentY;				
			   
			    
			}else{
				// 채널에서 Files 클릭된 경우
				if($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
					if (!gBodyM2.scroll_bottom) {
						gBodyM2.scroll_bottom = true;
						gBodyM2.files_page_no++;
						gBodyM2.add_files_data_list(gBodyM2.files_page_no);
						
					}else{
						gBodyM2.scroll_bottom = false;
					}
				}				
			}

		}	    
	});
});
