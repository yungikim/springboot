/*
 * 채팅방 입장 : enter_chatroom_for_chatroomlist / chatroom_dis
 * 채팅방 리스트 : chatroom_draw
 * 채팅방 메인 리스트 : chatroom_last_draw
 * 채팅창에 데이터 그리는 함수 : write_chat_log
 * 상태변경 함수 : temp_list_status_dis
 * 타임, unreadcoutn, 메뉴 레이아웃 통함 : check_display_layer 
 * 높이 자동 맞추가 : check_display_layer
 * 무한 스크롤 지정하기 : chat_addContent        
 * 퀵 알림 화면 그리기 : chat_alarm_draw
 * 상태값 호출하기 : temp_list_status
 * 채팅방에 10139992 가 있으면 칭찬 코끼리로 인식하고 예외처리한다.
 * //즐겨찾기 그리기
	gBody.set_etc_info(gap.etc_info);
	gBody.favorite_draw(obj);
	버디리스트 그릭 : buddy_draw
	우클릭 : person_menu_content
	버디리스트 상태 등록 : buddy_list_status_dis
	이미지 이전 다음 : show_chat_images
	gap.chatroom_create : 채팅방이 없으면 생성하고 있으면 들어간다.
 * 특정 시스템에서 메시지르 보내는 경우 : send_msg_etc
 * 
 */
window.addEventListener('focus', function() {	
	gap.focus = true;
	var len = $("#left_roomlist .ico-new").length;
	//console.log("focus in: " + len);
	if (len == 0){
		gap.change_title("1","");
	}			
}, false);

window.addEventListener('blur', function(){
	//console.log("foucs out");
    gap.focus = false;
});

//멘션 선택 레이어가 표시되고 있는 경우 닫아준다.
$('body').off('click.hidemention').on('click.hidemention', function(){
	if (typeof(gBody) != 'undefined' && gBody.cur_opt != '') {
		$('.mentions-autocomplete-list:visible').prev().mentionsInput('hideMention');		
	}
});

$(document).ready(function(){
	var isNotificationSupported = "Notification" in window;
	if (isNotificationSupported){
		Notification.requestPermission().then(function(result){
			if (result === "granted"){
				console.log("[Notification] Permision : ", result);
			}else{
				console.log("[Notification] Cancel : ", result);
			}
		});
	}
	if (window.Dropzone) Dropzone.autoDiscover = false;	
	$(window).resize(function(){
		if (call_key != ""){
			var width = $(window).width();	
			if (call_key != ""){
				//채팅 새창에서 resize에 대한 처리흘 진행한다.			
				if (gap.curpage == "chat"){				
					gap.make_resize_body();
				}
			}	
		}	
	});	

});

function gBodyFN(){
	
	this.right_side_open_layer = "";
	this.select_buddy_id = "";	
	this.select_change_group_name = "";  //그룹명 변경할때 임시적으로 소스그룹명을 저장한다.
	this.drag_person_obj = new Object();  //사용자를 드래그 할때 정보를 임시저장한다.
	this.click_img_obj = ""; //사용자 이미지 클릭했을 때 서버에서 정보를 받아와서 해당 obj에 툴팁으로 표시하기 위해 등록한다.	
	this.drag_id = "";     //사용자 검색해서 드래그 할때 선택한 사용자의 id값
	this.drop_text = "";    //사용자 검색해서 드래그 할때 선택 당한 영역의 그룹명을 임시적으로 저장하는 공간
	this.dragg_user = "";   //드래그 또는 그룹추가를 클릭한  사용자 uid	
	this.enter_opt = "";			//엔터값에 대한 설정
	this.cur_cid = "";			//현재 열려 있는 채팅방 cid;	
	this.topsearch_totalcount = 0;
	this.topsearch_curcount = 0;
	this.searchcnt = 1;	
	this.lastchatter = "";			//마지막에 메시지를 전달한 사용자 정보	
	this.chat_profile_file_draw_cnt = 0;    //우축에 있는 파일 리스트 스크롤에 사용
	this.chat_profile_image_draw_cnt = 0;   //우축에 있는 이미지 리스트 스크롤에 사용	
	this.unload_img = "";
	this.last_draw_id = "";				//현재 채팅방에서 이전대화를 표시할때 다음 대화를 붙이기 위해서 마지막 그린 데이터의 id값을 가지고 있다가 그 뒤에 붙인다.	
	this.last_enter_id = "";			//메시지를 입력할 때 key값을 기억하고 있어야 마지막 메시지를 찾을 수 있다... 동일한 분에 나와 상대가 같이 입력하면 신규 메시지가 위로 올라가는 현상 방지
	this.last_enter_type = "";			//마지막 메시지 타입이 메시지 / 파일 / 이미지 / ogtag 인지 판단해서 ogtag가 마지막일경우 시간 그룹을 하지 않고 별도로 표시한다.
	this.last_other_read_id = 0;		//상대방이 마지막에 읽은 아이디 정보 새메시지 표시할때 기준으로 사용함	
	this.last_msg = new Object();		//마지막 정보를 템프에 넣어서 입력할때 채팀방 정보 업데이트 용으로 사용한다.
	this.search_type = "";				//사용자 초대(addmember) 또는 대화상대 생성(makeroom)할 때 어떤 경우인지 판단하기 위한 근거	
	this.file_upload_infos = new Array();		//버디리스트에서 사용자 선택하고 마우스 우클릭으로 여러개의 파일을 전송할 경우 템프성으로 결과를 가지고 있다가 최종 완료후 메신저 서버로 정보를 전송한다.
	this.cur_room_att_info_list = new Array();	
	this.ty = "";     // myDropzone2 업로드 할때 버디리스트에서 한것인지 chatroom에서 한것인지 확인하기 위해서 참조하는 필드  buddylist or chatroom
	this.file_drag_room_id = "";		//파일 드래그했을때 Taget 대상 Chatroom id를 저장한다.	
	this.dropzone = "";
	this.dropzone_popup = "";
	this.clipbord_file = "";	
	this.image_max_upload_size = 200;   // 20M  (21000000)
	this.file_max_upload_size = 200;    //40M (53000000)	
	this.image_max_upload_size_box = 1000;   // 20M  (21000000)
	this.file_max_upload_size_box = 1000;    //40M (53000000)	
	this.remove_user_status = new Array();		
	this.selected_user_list = "";	
	this.click_room_id = "";
	this.is_ma = isma;
	this.select_channel_code = "";
	this.select_channel_name = "";
	this.cur_drive_list_info = ""; //현재 가입된 드라이브의 정보 배열
	this.cur_drive_folder_list_info = "";	//드라이브 폴더 리스트 정보 배열
	
	this.parent_folder_info = ""; //현재 클릭된 폴더의 상위폴더 정보 배열
	this.cur_folder_info = ""; //현재 클릭된 폴더의 정보 배열
	this.click_filter_image = "";    //파일 필터링 선택한 형식 	
	this.cur_tab = "";
	this.cur_todo = "";
	this.cur_todo_list = "";
	this.cur_todo_star_list = "";	
	this.drive_size_over = false;
	this.scrollP = "";	
	this.prevent_auto_scrolling = "1";	//(localStorage.getItem('prevent_auto_scrolling') == null ? "2" : localStorage.getItem('prevent_auto_scrolling'));
	this.collapse_reply = "2";	//(localStorage.getItem('collapse_reply') == null ? "2" : localStorage.getItem('collapse_reply'));
	this.post_view_type = "1";	//(localStorage.getItem('post_view_type') == null ? "2" : localStorage.getItem('post_view_type'));
	this.push_receive = "1";
	this.collapse_editor = "2";  //에디터로 작성된 컨텐트 기본 펼치기로 설정	
	this.mygraph = "";
	this.cMain = "1";
	this.search_resources = [];	
	this.chat_show = "chat_msg";
	this.chat_show_dis = "chat_msg_dis";
	this.chat_show_channel = "ref_dis";
	this.chat_show_channel_sub = "chat_msg_dis_ref";
	this.chat_show_popup = "alarm_chat_top";
	this.chat_show_popup_sub = "alarm_chat_sub";	
	this.searchMode = "F";
	this.main_start = "";
	this.main_end = "";
	this.main_sort = "2";
	this.main_query = "";	
	this.call_open_chatroom = "F";
	this.ucnt_padding = "7px";
	this.trans_lang = "";    //현재 번역을 요청한 언어 타입
	this.trans_tile = "";    //현재 번역을 요청한 언어명
	this.is_my_chat = false;   //나와의 대화창인가 여부 	
	this.chat_add_opt = "F";
	this.scroll_bottom = 100;	
	this.lnb_menu_load = false;
	this.folder_menu_info = [];	
	this.receive_msg_id = "";
	this.receive_elephant = "칭찬 메시지가 도착했습니다.";
	this.is_buddylist_search = false;
	this.temp_search_result = [];
	this.tMultiImages = [] //멀티 이미지 파일 드래그 & 드롭 또는 전송할때 사용하는 현재 창에 멀티 이미지 컨텐츠를 등록하고 드롭하는 지점에서 참고한다.
	this.tMultiImages2 = [];
	this.image_view_direction = true;
	this.all_files_selected_tab = "";
	this.all_files_selected_member = "";
	this.mail_domain = "";

} 

gBodyFN.prototype = {

	"resize" : function(){
		var width = $(window).width();	
		if (call_key != ""){
			//채팅 새창에서 resize에 대한 처리흘 진행한다.			
			if (gap.curpage == "chat"){				
				gap.make_resize_body();
			}
		}	
	},
	"init" : function(opt){		
		
		gBody.mail_domain = "https://" + mailserver + "/" + maildbpath;	
		if (location.href.indexOf("dev.kmslab.com") > -1){
			gBody.isDev = true;
			//gBody.mail_domain = gBody.mail_domain.replace("https://","http://");
		 }
		
		
		if (call_key == ""){
			//top만 띄워지고 나중에 body가 표시되어 한번에 띄운다. 새창으로 메신저 열때 어색함을 제거한다..
			$("#top_header_layer").show();
		}else{
		//	$("#area_top").hide();
		}
		//메신저의 좌측프레임을 HTML에서 javascript으로 변경함	
		gBody.main_sort = "2";		
		gBody.go_chat_left_draw();		
		//gMet.setTodayMeetingCount();
		//여러창을 띄워서 하나의 알림 메시지만 처리하기위해서 남겨놓은 로그를 제거한다.
		gap.remove_localstorage_chat_noti();		
		//채팅방 정보 가져오기
		gBody.chatroom_list_enter_display_empty();
		
		$(".left-menu").show();
		$("#left_main").show();
		$("#main_body").show();
		
		$("#nav_left_menu .tabs").tabs();
		
		gap.show_content("main");			
		gBody.chat_right_menu_open();				
		$("#channel_main").hide();		
		$(".left-area").css("width", "calc(100% - " + gap.right_page_width + ")");				
		
	
		
		
		
		//if (gap.param == "abc2" || gap.param == "channel" || gap.param == "home" ||  gap.param.indexOf("key=") > -1){
			/////////////////////////////////////////			
			//if (gap.ext_user != "T"){
				
				//gBody.show_announce();	
				//버디리스트를 그린다.					
				//_wsocket.load_etc_info();
				_wsocket.load_buddy_list();					
//				gBody.set_etc_info(gap.etc_info);						
			//	$("#channel-search").css("top","30px");
				$("#chat_add_member").css("top","19px");
				$("#chat_new_window").css("top","19px");
				if (call_key != ""){					
					$("#user_profile").hide();				
					////////////////////////////////////////////////////////////////////////
					$("#left_main").hide();
					$("#channel_main").hide();
					$("#left_menu_list").hide();
					$("#left_menu_list").css("width","0px");
					$("#left_main").css("width", "0px");
					$("#left_main").css("left", "0px");		
					$("#main_body").css("left","0px");
					$("#main_body").show();
					$("#top_header_layer").css("height","0px");
					$("#top_header_layer").hide();
					$("#main_body").css("top","0px");					
					$("#chat_room_back").hide();
			//		$("#chat_add_member").hide();
			//		$("#chat_new_window").hide();
					$("#realtime_video2").css("left", "10px");					
				//	$(".channel-search").css("right","20px");					
				//	$("#right_menu").hide();
				//	$("#right_menu").css("width","0px");					
					////////////////////////////////////////////////////////////////////////					
					//call_key가 있는 경우는 특정 채팅방을 바로 호출한 경우로 해당 채팅방으로 바로 등어간다.
					gap.cur_el = gap.userinfo.rinfo.el;   //팝업으로 띄워질 경우 해당 정보가 세팅되지 않아 영문으로 버디리스트가 띄워지는 오류 처리
					_wsocket.load_chatroom_list("popup");				
					gap.make_resize_body();		
					
					
				}else{				
					//채팅방 리스트 그린다.
					//_wsocket.load_chatroom_list();			
				}				
				gBody.myinfo_draw();			
				//Box에 읽지 않은 내용이 있는지 체크한다.
			//}else{
				//gBody.go_channel_view();
			//}			
			//gBody3.check_unread();
		//}else{
			//채팅방 리스트 그린다.
			_wsocket.load_chatroom_list();		
		//}	
		
		
			//$("#tab3").show();			
		//	var uid = gap.userinfo.userid.toLowerCase();
		//	if (uid == "ac920209" || uid == "ac912741" || uid == "ac926455" || uid == "ac926456" || uid == "ac903089" || uid == "ac923062" ){
		//		$("#tab4").show();
		//	}else{
		//		$("#tab4").hide();
		//	}			
		
		
		if (call_key == ""){			
			gap.cur_window = gap.param;
			if (!gap.cur_window){
				gap.cur_window = "chat";
			}
			
			$("#nav_left_menu .tabs").tabs();			
			
			//채팅호출할때
		//	if (gap.param == "abc2"){
				gBody.favorite_draw(gap.etc_info);
		//	}
			
			
			
			gap.browser_title_set(gap.param);
		}	
		//초기화 이벤트 핸들러 정의한다.
		gBody._eventHandler();	
		//favorite가 없어져서 여기다 설정한다.
		
		if (gap.etc_info.ct){
			if (typeof(gap.etc_info.ct.enter) == "undefinded" || gap.etc_info.ct.enter == "1" || gap.etc_info.ct.enter == ""){
				gBody.enter_opt = "1";
			}else{
				gBody.enter_opt = "2";
			}		
		}else{
			gBody.enter_opt = "1";
		}
		
		gBody.searchMode_draw = "F";	
		
	},	
	
	"_eventHandler" : function(){		
	
		gap.curpage = "main";		
		//Tip 지정하기 ////////////////////////////////////////////////////////////////
		gap.draw_qtip_right("#add_group_btn", gap.lang.addGroup);		
		gap.draw_qtip_left("#show_attach_layer", gap.lang.searchFile);
		gap.draw_qtip_left("#show_link_layer", gap.lang.searchLinkChat);
	//	gap.draw_qtip_left("#show_memo_layer", gap.lang.sendNotificatioin);
		gap.draw_qtip_left("#show_video_layer", gap.lang.make_video);		
		gap.draw_qtip_left("#show_chat_layer", gap.lang.show_chat);
		gap.draw_qtip_left("#show_todo_layer", gap.lang.show_todo);		
		///////////////////////////////////////////////////////////////////////////
				
		////////////// 언어 선택에 따른 초기 값 설정 /////////////////////////////////////////////
		$("#tab1_sub").text(gap.lang.buddylist);
		$("#tab2_sub").text(gap.lang.chatroom);
		$("#tab3_sub").text(gap.lang.channel);
		$("#tab4_sub").text(gap.lang.mail);		
		$("#group_txt").attr("placeholder",gap.lang.inputgroupname);
		$("#group_txt2").attr("placeholder",gap.lang.inputgroupname);
		$("#chatroom_back").text(gap.lang.back);		
		$("#message_txt").attr("placeholder",gap.lang.input_message);	
		$("#fileupload_content").attr("placeholder",gap.lang.input_message);
		$("#add_file_text").text(gap.lang.addFile);		
		$("#f_s_btn").text(gap.lang.upload);
		$("#f_c_btn").text(gap.lang.Cancel);		
		$("#rmtitle").text(gap.lang.reply + " " + gap.lang.basic_modify);
		$("#rmsave").text(gap.lang.basic_save);
		$("#rmcancel").text(gap.lang.Cancel);
		$("#add_reply_file").text(gap.lang.addFile);		
		$("#bstitle").text(gap.lang.profile);
		$("#bssave").text(gap.lang.basic_save);
		$("#bscancel").text(gap.lang.Cancel);
		$("#bsbottom").text(gap.lang.m10);
		$("#bstext").attr("placeholder", gap.lang.profilein);
		$("#realtime_video2").html(gap.lang.make_video + " <span class='ico ico-camera'></span>");
		///////////////////////////////////////////////////////////////////////////		
		$("#create_work_room").off();
		
	
		
		$(document).on("dragstart",function(e){			
			//특정 영역만 마우스 드래그 될수 있게 제한다... 그렇지 않을 경우 드래그 오류 발생
			if ($(e.target).hasClass("balloon") || $(e.target).hasClass("chat-attach") || 
					$(e.target).hasClass("user") || 
					$(e.target).hasClass("ui-draggable") ||
					$(e.target).hasClass("img-content") ||
					$(e.target).hasClass("user-folder-menu")){	
			}else{
		         return false;
			}           
        });				
			
		$("#chat_new_window").off().on("click", function(){		
			if (call_key != ""){
				//새창에서 도 새창을 못 띄우게 한다.	
				mobiscroll.toast({message:gap.lang.not_support, color:'info'});
				return false;
			}else{
				gap.chatroom_create_after2(gBody.cur_cid);
//				var url = "./chat?readform&key=" + $.base64.encode(gBody.cur_cid);
//				gap.open_subwin(url, "1190","850", "yes" , "", "yes");	
//				return false;
			}			
		});		
		
		$("#right_menu_collpase_btn").off().on("click", function(){
			//우측 프레임 레이어 펼치고 닫고 이벤트			
			if (gap.tmppage == "usearch" || gap.tmppage == "history"){
				return false;
			}			
			//우측 버튼은 모두 선택 안된 걸로 변경한다.
			gBody.rigth_btn_change_empty();			
			var cpage = gap.curpage;			
			if (cpage == ""){return false;}				
			if ($(this).hasClass("on")){
				$(".left-area").css("width", "calc(100% - "+gap.right_page_width+")");
				if (cpage == "main"){
					$("#user_profile").show();
					$("#center_content").css("width", "calc(100% - "+gap.right_page_width+")");
				}else if (cpage == "chat"){		
					$("#chat_profile").show();
				}
				$(this).removeClass("on");				
				localStorage.setItem(gBody.cur_cid + "_room", "on");
			}else{
				$(".left-area").css("width", "100%");							
				$("#ext_body").hide();
				$("#user_profile").hide();
				$("#chat_profile").hide();
				$(this).addClass("on");				
				localStorage.setItem(gBody.cur_cid + "_room", "off");
			}			
			gma.refreshPos();
		});
		
		$("#left_sub_buddylist").on("click", function(){
			//낮은 해상도 우측 메뉴에서 버디리스트를 클릭한 경우 우측 메뉴을 펼치면서 버디리스트를 표시한다.			
			$("#tab2_sub").removeClass("active");	
			$("#tab1_sub").addClass("active");			
			$("#nav_left_sub_menu").hide();
			$("#nav_left_menu").fadeIn();
			$("#left_main").css("width", "312px");
			$("#main_body").css("left", "312px");			
			$("#tab3_sub").click();	
		});
		
		$("#left_sub_chatroom").on("click", function(){
			//낮은 해상도 우측 메뉴에서 채팅방을 클릭한 경우 우측 메뉴을 펼치면서 채팅방을 표시한다.
			$("#tab1_sub").removeClass("active");
			$("#tab2_sub").addClass("active");		
			$("#nav_left_sub_menu").hide();
			$("#nav_left_menu").fadeIn();			
			$("#left_main").css("width", "312px");
			$("#main_body").css("left", "312px");			
			$("#tab2_sub").click();			
		});
		
		var mail_select_mode = "1";		// 1이면 메일함 선택, 2면 검색 카테고리
		var mail_box_value = "inbox";	// 선택된 메일함
		var s_idx = 1;	// 메일 시작 번호
		var is_searched = "0";	// 검색 여부	
		
		$("#nav_left_menu .tabs .tab").off();
		$("#nav_left_menu .tabs .tab").on("click", function(event){
			
			var res = gap.checkEditor();
			if (!res) return false;
			
			//버디리스트, 채팅방 탭 클릭			
			gBody.searchMode = "F";
			gBody.searchMode_draw = "F";	
			//레이어 숨김 처리
			$('#ext_body').hide();
			$('#channel_aside_right').hide();	
			
			//$("#chat_content").hide();
			//$("#chat_msg").hide();
			
			
			
			
			
			gBody.favorite_draw(gap.etc_info);
			
			
			if (this.id == "tab1"){	
				gap.write_log_box("member_tab","멤버탭 클릭", "menu", "pc");
				localStorage.setItem(gap.userinfo.rinfo.ky+"_chat_tab", "1");
			//	gBody3.cur_window = "chat";
			//	$("#center_content").show();
				gBody.chat_right_menu_open();				
				$("#channel_left_menu").hide();
				$("#channel_main").hide();
			//	$("#user_profile").show();				
				$("#sub_channel_content").hide();
				$("#box_search_content").hide();
				$(".left-area").css("width", "calc(100% - " + gap.right_page_width + ")");				
				$("#left_channel").hide();
				$("#left_roomlist").hide();
				$("#left_roomlist_btn").hide();
				$("#left_buddylist").show();		
				$("#left_buddylist_btn").show();
				$("#add_group_btn").show();				
				$("#left_mail").hide();
				$("#person_dis").hide();				
				$(".chat-bottom").show();	
				$("#channel_right").show();
				$("#center_content_main").show();
				$("#show_mypage").hide();				
				$("#chatroom_search_area").hide();				
			//	gBody3.cur_opt = "";
			//	gBody.cur_cid = "";				
				if ( (gBody.cur_tab != "tab1") && (gBody.cur_tab != "tab2")){
					gap.show_content("main");
				}				
				gBody.cur_tab = "tab1";
				gap.change_location("abc2");
				$("#main_body").css("width", "");				
			//	gap.show_content("main");
			//	$("#group_add_layer").show();				
				//즐겨찾기 여부에 따라 높이 지정하기
				gBody.left_height_control();
				

				gBody.buddy_draw();
			}else if (this.id == "tab2"){			
				localStorage.setItem(gap.userinfo.rinfo.ky+"_chat_tab", "2");
				//로그 남기기
				gap.write_log_box("chat_tab","채팅 탭 클릭", "menu", "pc");				
			//	gap.show_content("main");
				gBody.chatroom_list_enter_display_empty();				
				//$("#channel").addClass("act");
			//	gBody3.cur_window = "chat";
				gBody.chat_right_menu_open();
			//	$("#user_profile").show();				
				$("#channel_left_menu").hide();
				$("#channel_main").hide();
				$("#sub_channel_content").hide();
				$("#box_search_content").hide();
				$(".left-area").css("width", "calc(100% - " + gap.right_page_width + ")");				
				$("#left_channel").hide();
				$("#left_buddylist").hide();
				$("#left_buddylist_btn").hide();
				$("#left_roomlist").show();				
				$("#left_roomlist_btn").show();
				$("#add_group_btn").hide();
				$("#add_group2").hide();
				$("#left_mail").hide();
				$("#person_dis").hide();				
				$(".chat-bottom").show();
				$("#user_profile").css("width", "315px");				
				$("#channel_right").show();
				$("#center_content_main").show();
				$("#show_mypage").hide();				
			//	gBody3.cur_opt = "";				
				gap.change_location("abc2");
				$("#main_body").css("width", "");				
				if ( (gBody.cur_tab != "tab1") && (gBody.cur_tab != "tab2")){
					gap.show_content("main");
				}
				
			//	gap.show_content("main");				
				$("#chatroom_search_area").show();				
				gBody.cur_tab = "tab2";
				gBody.left_height_control();				
				$("#left_roomlist").css("height", "calc(100% - 100px)");				
				 //브라우저 타이틀을 설정한다.
				gap.browser_title_set("abc2");			
			}else if (this.id == "tab3"){				
				//로그 남기기
				gap.write_log_box("channel_tab","업무방 탭 클릭", "menu", "pc");				
				gap.cur_window = "channel";
				gBody.cur_opt = "";
				gBody.cur_cid = "";				
				gBody.chat_right_menu_close();
				$("#sub_channel_content").hide();
				$("#channel_main").css("width","100%");
				$("#user_profile").hide();
				$("#channel_left_menu").show();
				$("#channel_main").show();
				$("#left_roomlist").hide();
				$("#left_roomlist_btn").hide();
				$("#left_buddylist").hide();
				$("#left_buddylist_btn").hide();
				$("#group_add_layer").hide();			
				$("#add_group_btn").hide();
				$("#add_group2").hide();
				$("#left_mail").hide();				
				$("#left_channel").show();
				$("#chatroom_search_area").hide();				
				gap.change_location("channel");				
				//신규 메시지 붉은 점을 제거한다.
				gap.change_title("1","");
				$("#tab3_sub").text(gap.lang.channel);				
				gBody.cur_tab = "tab3";
				gBody.left_height_control();				
				gBody.show_channel();
			//	gBody3.show_channel_content();				
				gap.browser_title_set("channel");
			}else if (this.id == "tab4"){				
				//로그 남기기
				
				gap.write_log_box("mail_tab","메일 탭 클릭", "menu", "pc");				
				$("#channel_left_menu").hide();
			//	$("#channel_main").hide();
				$("#left_roomlist").hide();
				$("#left_roomlist_btn").hide();
				$("#left_buddylist").hide();
				$("#left_buddylist_btn").hide();
				$("#group_add_layer").hide();			
				$("#add_group_btn").hide();
				$("#add_group2").hide();
				$("#left_channel").hide();
				$("#left_mail").show();
				$("#chatroom_search_area").hide();
				$("#btn_search").show();
				$("#btn_search_close").hide();
				$("#left_mail_search").hide();
				$("#mail_search_query_field").val("");
				mail_select_mode = "1";
				is_more_action = "0";
				gBody4.get_mail_list("", "inbox", 1);				
				$("#menu_inbox").text(gap.lang.menu_inbox);
				$("#menu_sent").text(gap.lang.menu_sent);
				$("#mail_search_query_field").attr("placeholder", gap.lang.input_search_query);
				$('#mailbox_select').val('1').material_select();				
				$("#left_mail").css("height", "calc(100% - 20px)");
				$("#left_mail_list").css("height", "calc(100% - 50px)");				
				gBody.cur_tab = "tab4";
				gBody.left_height_control();
			}			
			gBody.cur_tab = this.id;			
			if (this.id != "tab4"){
				//열려 있는 채팅 정보를 초기화 한다.
			//	gBody.cur_cid = "";
			}			
			gma.refreshPos();
		});
		
		//채팅창에서 파일 선택창을 클릭한다.
		$("#open_attach_window_call").off().on("click", function(e){			
			var html = "";
			html += "<div class='plus-cont' id='other_layer_chat' style='bottom:66px; width:210px; height:175px; border-radius:0px'>";
			html += "	<div class='flex plus-top'>";
			html += "		<div>";
			html += "			<h2>"+gap.lang.addFile+"</h2>";
			html += "			<div class='max150'>";
			html += "				<ul class='f_between'>";
			html += "					<li class='plus-list' id='pc' style='margin-right:0px'>";
			html += "						<div class='sal'><span class='ico ico-pc'></span></div>";
			html += "						<span>"+gap.lang.mypc+"</span>";
			html += "					</li>";
			html += "					<li class='plus-list' id='drive' style='margin-left:20px'>";
			html += "						<div class='yel'><span class='ico ico-drive'></span></div>";
			html += "						<span>Other</span>";
			html += "					</li>";
			html += "				</ul>";
			html += "			</div>";
			html += "		</div>";
			html += "	</div>";
			html += "</div>";			
			$("#open_attach_window_call").qtip({
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
					at : 'bottom top',
					//target : $(this)
					adjust: {
					  x: 10,
					  y: -30
					}
				},
				events : {
					show : function(event, api){							
						//$("#other_layer .box button").on("click", function(e){
						$("#other_layer_chat .f_between li").on("click", function(e){							
							var id = e.currentTarget.id;
							if (id == "pc"){			
								gma.chat_position = "chat";
								$("#open_attach_window").click();								
							}else if (id == "drive"){
								gBody.call_open_chatroom = "T";
								gBody.show_all_files();
							}							
						});						
					},
					hidden : function(event, api){
						api.destroy(true);
					}
				}
			});	
		});
				
		// 메일 검색 버튼 클릭
		$("#btn_search").on("click", function(){
			$("#btn_search").hide();
			$("#btn_search_close").show();
			$("#left_mail_search").show();			
			//검색을 클릭하면 높이를 줄여야 스크롤 끝에 짤리지 않는다 2021.09.29. yg
			$("#left_mail_list").css("height", "calc(100% - 90px)");			
			mail_select_mode = "2";
			is_more_action = "0";
		});	
		
		// 메일 검색 닫기 버튼 클릭
		$("#btn_search_close").on("click", function(){
			$("#btn_search").show();
			$("#btn_search_close").hide();
			$("#left_mail_search").hide();
			$("#mail_search_query_field").val("");
			mail_select_mode = "1";
			is_more_action = "0";			
			//검색창을 닫으면 원상 복구한다. 2021.09.29. yg
			$("#left_mail_list").css("height", "calc(100% - 50px)");			
			if(is_searched == "1") {
				gBody4.get_mail_list("", mail_box_value, 1);
				is_searched = "0";
			}			
		});	
		
		//대화방 리스트에서 검색할 경우
		$("#inpuser_field").keypress(function(e) { 
			if (e.keyCode == 13){                
				gBody.search_chatroom_list();
			}    
		});
		
		// 검색 시 엔터키 처리
		$("#mail_search_query_field").keypress(function(e) { 
			if (e.keyCode == 13){                
				$("#mail_search_btn").click();
			}    
		});

		// 메일 검색 수행
		$("#mail_search_btn").on("click", function(){			
			$("#mail_query_btn_close").show();
			$("#mail_query_btn_close").off().on("click", function(e){				
				$("#mail_query_btn_close").hide();
				var box = "inbox";
				if ($("#mailbox_select").val() == "2"){
					box = "sent";
				}
				gBody4.get_mail_list("", box, 1);				
			});			
			var search_val = $("#mail_search_query_field").val();
			if (search_val == 0){
				$("#mail_search_query_field").focus();
				return false;
			}			
			// 메일 검색 후 결과 표시
			is_searched = "1";
			is_more_action = "0";
			start_idx = 1;
			gBody4.get_mail_list(search_val, mail_box_value, s_idx);
		});	
		
		// 메일함 선택 시
		$("#mailbox_select").change(function(){
			var select_item = $("#mailbox_select option:selected").val(); 
			is_more_action = "0";
			// 폴더 선택 모드
			if (mail_select_mode == "1") {
				if (select_item == "1"){
					mail_box_value = "inbox";
				}else{
					mail_box_value = "sent";
				}
				gBody4.get_mail_list("", mail_box_value, s_idx);				
			// 카테고리 선택
			} else {
				if (select_item == "1"){
					mail_box_value = "inbox";
				}else{
					mail_box_value = "sent";
				}
			}
		});
		
			
		
		$("#favorite_sub_show").on("click", function(){
			//낮은 해상도 우측 메뉴에서 즐겨찾기 사용자를 표시할 지 말지 선택하는 버튼 클릭
			if ($(this).hasClass("on")){
				$(this).removeClass("on");
				$("#favorite_small").hide();
			}else{
				$(this).addClass("on");
				$("#favorite_small").show();
			}			
		});
		
		$("#left_frame_collapse_btn").on("click", function(){		
			$("#nav_left_menu").hide();
			$("#nav_left_sub_menu").fadeIn();
			$("#left_main").css("width", "60px");
			if ($(".left-menu").css("display") == "none"){
				$("#main_body").css("left", "60px");				
			}else{				
				if (gap.cur_window == "channel"){
					//Drive메뉴에서 열고 닫는 함수는 하단에 $("#nav_left_menu .btn-left-fold").off(); 이다
					if ($("#channel_right").css("display") == "none"){
						$("#main_body").css("left", "114px");
					//	$("#main_body").css("right", "0px");
						$("#main_body").css("width", "");
					//	$("#sub_channel_content").css("width", "100%");
					}else{
						$("#main_body").css("left", "114px");
						$("#main_body").css("width", "");
					}
				}else{
					$("#main_body").css("left", "114px");
				}							
			}
		});
		
		$("#left_frame_collapse_sub_btn").on("click", function(){			
			$("#nav_left_sub_menu").hide();
			$("#nav_left_menu").fadeIn();
			$("#left_main").css("width", "312px");			
			if ($(".left-menu").css("display") == "none"){
				$("#main_body").css("left", "312px");				
			}else{
				$("#main_body").css("left", "366px");
			}
		});	
		
		$("#add_group_btn").on("click", function(event){
			//그룹 추가 버튼 클릭			
			$("#group_txt").attr("placeholder",gap.lang.inputgroupname);
			$("#group_txt2").attr("placeholder",gap.lang.inputgroupname);
			gBody.select_change_group_name = "";
			var iscss = $(".add-group").css("display");				
			if (iscss == "none"){				
			//	gap.draw_qtip_right("#add_group_btn", gap.lang.closeGroup);
				var html = "<div style='padding:10px'>" + gap.lang.closeGroup + "</div>";
				$("#add_group_btn").qtip('option', 'content.text', html);				
				$(".add-group").fadeIn();
				$("#group_txt").focus();
			}else{
				var html = "<div style='padding:10px'>" + gap.lang.addGroup + "</div>";
				$("#add_group_btn").qtip('option', 'content.text', html);
				$(".add-group").fadeOut();				
			}			
		});	
		
		$("#group_txt").bind("keypress", function(e){
			if (e.keyCode == 13){									
				if (gBody.select_change_group_name != ""){
					//그룹명을 변경한다.
					var change_group_name = $("#group_txt").val();
					if (change_group_name == ""){						
					}else{
						_wsocket.change_group(gBody.select_change_group_name, change_group_name);
						var html = "<div style='padding:10px'>" + gap.lang.addGroup + "</div>";
						$("#add_group_btn").qtip('option', 'content.text', html);
						$(".add-group").fadeOut();
					}
				}else{
					//그룹명을 추가한다.
					_wsocket.add_group($(this).val());
					var html = "<div style='padding:10px'>" + gap.lang.addGroup + "</div>";
					$("#add_group_btn").qtip('option', 'content.text', html);
					$(".add-group").fadeOut();
				}				
				$(".add-group").fadeOut();
				$("#group_txt").val("");
				return false;
			}
		});
		
		$("#group_txt2").bind("keypress", function(e){
			if (e.keyCode == 13){									
				if (gBody.select_change_group_name != ""){
					//그룹명을 변경한다.
					var change_group_name = $("#group_txt2").val();
					if (change_group_name == ""){
						
					}else{
						_wsocket.change_group(gBody.select_change_group_name, change_group_name);
					}
				}else{
					//그룹명을 추가한다.
					_wsocket.add_group($(this).val());
				}			
				$(".add-group2").fadeOut();
				$("#group_txt2").val("");				
				$("#tab1").click();
				$("#add_group_btn").click();
				return false;
			}
		});	
				
		$("#chat_room_back").on("click", function(event){			
			gBody.chatroom_list_enter_display_empty();			
			//채널에서 즐겨찾기에 있는 사용자를 활용해서 대화를 실행시킨 경우 뒤로 가기하면 채널로 돌아가야 한다.
			if (gBody.cur_tab == "tab3"){
				if ($("#left_channel_list .channel-code.on").length >0){
					$("#left_channel_list .channel-code.on").click();
					
				}else if ($("#channel_option .on").length > 0){
					$("#channel_option .on").click();
				}			
			}else{
				gap.show_content("main");
				gap.curpage = "main";
				gBody.cur_cid = "";
				gap.backpage = "";				
				gap.remove_status_user();				
				$("#chatroom_all_status").hide();
				gBody.hideNoticeChat();
				//대화창에 들어갔다 나오면 onclick로 되어 있는 다운로드 이벤트가 적용되지 않아 아래 소스를 추가함
				$(".ico.btn-download").off();			
				$("#message_txt").val("");
			//	$("#message_txt").css("height", "38px");			
			//	gap.change_title("1","");					
				var len = $("#left_roomlist .ico-new").length;
				//console.log("focus in: " + len);
				if (len == 0){
					gap.change_title("1","");
				}
			}			
			gma.refreshPos();
		});		
		
		$("#person_text_option").on("click", function(){
			//채팅창에서 개인 설정 선택한 경우			
			var html = "";
			html += "<div class='layer layer-menu opt-enter' id='enter_opt'>";
			html += "<ul>";		
			if (gBody.enter_opt == "1"){
				html += "<li class='on' onclick='gBody.enteropt(1)'>"+gap.lang.enteroptions1+"</li>";
				html += "<li  onclick='gBody.enteropt(2)'>"+gap.lang.enteroptions2+"</li>";
			}else{
				html += "<li  onclick='gBody.enteropt(1)'>"+gap.lang.enteroptions1+"</li>";
				html += "<li class='on'  onclick='gBody.enteropt(2)'>"+gap.lang.enteroptions2+"</li>";
			}			
			html += "</ul>";
			html += "</div>";				
			$("#person_text_option").qtip({
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
					my : 'bottom right',
					at : 'bottom top',
					//target : $(this)
					adjust: {
		              x: 10,
		              y: -20
					}
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
		
		$("#open_emoticon").on("click", function(){

			//채팅창에서 개인 설정 선택한 경우			
			var html = "";
			html += "<div class='layer-emoticon' >";				
			html += "<ul class='tab-nav'>";
			html += "	<li ><h2 class='tab_emo_active' data-id='APBADAs'>K-Portal Friends</h2></a></li>";
	//		html += "	<li><h2 class='tab_emo_noactive' data-id='APFriends'>DSW Friends2</h2></a></li>";
			html += "</ul>";			
			html += "	<button class='ico btn-article-close' id='emo_close'>닫기</button>";			
			html += "	<div class='tabcontent'>";
			html += "		<div id='APBADAs' >";
			html += "			<ul class='list-emoticon' id='emoti_dis' style='overflow:hidden'>";
			for (var kk = 1; kk < 31; kk++){
				html += "				<li><img src='/resource/images/emoticons/" + kk + ".gif' data='"+kk+".gif' /></li>";
			}			
			html += "			</ul>";
			html += "		</div>";
			html += "		<div id='APFriends' style='display:none'>";
			html += "			<ul class='list-emoticon' id='emoti_dis2' style='overflow:hidden'>";
			for (var k = 1; k < 31; k++){
			//	html += "		<li><img src='./emoticons/"+k+".gif' data='"+k+".gif'></li>";
			}	
			html += "			</ul>";
			html += "		</div>";
			html += " 	</div>";			
			html += "</div>";							
			$("#open_emoticon").qtip({
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
					//event : 'mouseout',
					fixed : true
				},
				style : {
					classes : 'qtip-bootstrap',
					tip : true

				},
				position : {
					my : 'bottom right',
					at : 'bottom top',
					//target : $(this)
					adjust: {
		              x: 10,
		              y: -20
					}
				},
				events : {
					show : function(event, api){		
						$("#emoti_dis, #emoti_dis2").mCustomScrollbar({
							theme:"dark",
							autoExpandScrollbar: true,
							scrollButtons:{
								enable:false
							},
							mouseWheelPixels : 200, // 마우스휠 속도
							scrollInertia : 400, // 부드러운 스크롤 효과 적용
						//	mouseWheel:{ preventDefault: false },
							advanced:{
								updateOnContentResize: true
							},
							autoHideScrollbar : true
							//setTop : $(this).height() + "px"
						});						
						$("#emoti_dis li, #emoti_dis2 li").on("click", function(e){							
							var fname = $(this).find("img").attr("data");
							gBody.send_emoticon_msg(fname);
							return false;							
						});						
						$(".tab-nav h2").on("click", function(e){
							var cl = $(e.currentTarget).data("id");
							$(".tab-nav h2").removeClass();
							$(".tab-nav h2").addClass("tab_emo_noactive");
							$(e.currentTarget).attr("class", "tab_emo_active");
							if (cl == "APFriends"){								
								$("#APFriends").show();
								$("#APBADAs").hide();
							}else if(cl == "APBADAs"){
								$("#APFriends").hide();
								$("#APBADAs").show();
							}
						});						
						$("#emo_close").on("click", function(e){
							$("#open_emoticon").qtip('api').hide();
						});
					},
					hidden : function(event, api){
						api.destroy(true);
					}
				}
			});				
		});	
		
				
		
		$("#chat_add_member").off().on("click", function(event){			
//			gap.show_content("subsearch");
//			gBody.search_type = "addmember";
//			gBody.open_add_member_search_layer("addmember");			
			if (gBody.is_my_chat){
				mobiscroll.toast({message:gap.lang.mychat, color:'danger'});
				return false;
			}			
			if (call_key != ""){
				//새창에서 호출하기 때문에 딤처리흘 전체로 처리한다..
				gap.blockall = true;
			}			
			gBody.chat_add_opt = "T";
			gBody.add_chatroom();
		});
		
		// Conversation 탭 화면 설정
		$("#chat_config").off();
		$("#chat_config").on("click", function(e){			
			var is_push = gap.chatroom_push_get(gBody.cur_cid);
			var is_scroll = gap.check_scroll_chat(gBody.cur_cid);			
			var html = "";
			html += "<article class='right-area' style='width:240px;'>"
			html += "<div class='setting' style='padding-top:10px;'>";
			html += "	<h2>"+gap.lang.userConfig+"</h2>";
			html += "	<button class='ico btn-right-close' style='top:10px;' id='chat_config_close'>닫기</button>";			
			html += "	<div class='set-language' style='margin-top:20px;'>";
			html += "		<h4>"+gap.lang.prevent_auto_scrolling+"</h4>";
			html += "		<div class='radio'>";
			html += "			<label>";
			html += "				<input name='prevent_auto_scrolling_chat' class='with-gap' type='radio' value='1'" + (is_scroll == "1" ? " checked" : "") + ">";
			html += "				<span>"+gap.lang.use+"</span>";
			html += "			</label>";
			html += "		</div>";
			html += "		<div class='radio'>";
			html += "			<label>";
			html += "				<input name='prevent_auto_scrolling_chat' class='with-gap' type='radio' value='2'" + (is_scroll == "2" ? " checked" : "") + ">";
			html += "				<span>"+gap.lang.not_used+"</span>";
			html += "			</label>";
			html += "		</div>";
			html += "	</div>";				
			html += "	<div class='set-language' style='margin-top:20px;'>";
			html += "		<h4>"+gap.lang.push_noti+"</h4>";
			html += "		<div class='radio'>";
			html += "			<label>";
			html += "				<input name='push_receive' class='with-gap' type='radio' value='1'" + (is_push ? " checked" : "") + ">";
			html += "				<span>"+gap.lang.receive+"</span>";
			html += "			</label>";
			html += "		</div>";
			html += "		<div class='radio'>";
			html += "			<label>";
			html += "				<input name='push_receive' class='with-gap' type='radio' value='2'" + (!is_push ? " checked" : "") + ">";
			html += "				<span>"+gap.lang.do_not_receive+"</span>";
			html += "			</label>";
			html += "		</div>";	
			html += "	</div>";			
			html += "</div>";
			html += "</article>";							
			$("#chat_config").qtip({
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
					//event : 'mouseout',
					fixed : true
				},
				style : {
					classes : 'qtip-bootstrap',
					tip : true	
				},
				position : {
					my : 'top right',
					at : 'bottom top',
					//target : $(this)
					adjust: {
					  x: 10,
					  y: 5
					}
				},
				events : {
					show : function(event, api){					
						$("#chat_config_close").on("click", function(e){
							api.destroy(true);
						});							
						$("[name=push_receive]").on("click", function(){							
							var push = $(this).val();
							var spush = "";
							if (push == 1){
								spush = "pon";
							}else{
								spush = "poff";
							}						
							_wsocket.fix_top_layer(spush, gBody.cur_cid);							
						});						
						$("[name=prevent_auto_scrolling_chat]").on("click", function(){							
							var push = $(this).val();
							var spush = "";
							if (push == 1){
								spush = "1";
							}else{
								spush = "2";
							}						
							try{
								//로컬 스토리지에 저장한다.
								localStorage.setItem(gBody.cur_cid + "_scroll", spush);
							}catch(e){}							
						});
					},
					hidden : function(event, api){
					//	gBody.save_channel_option();
						api.destroy(true);
					}
				}
			});
		});		
		
		$("#video_add_member").off().on("click", function(event){			
			var cid = gBody.cur_cid;
			var sendObj = new Object();
			sendObj.target_uid = "";	
			sendObj.room_code = gap.userinfo.rinfo.id + "_" + gBody.make_video_roomkey();
			sendObj.direct = "T"   //옵션이 T인 경우 대화창에 내용을 바로 입력해야 주어야 한다.		
			gBody.send_invite_msg(sendObj, cid);				
			//본인은 채팅창을 바로 띄운다.
			gBody.open_video_popup("T", sendObj.room_code);   
		});			
		
		//메인 채팅방 마우스 우클릭 ContentMenu 작성하기
		$.contextMenu({
			selector : ".chatroomlist",
			autoHide : true,
			callback : function(key, options){				
				var tid = $(this).attr("id");
			//	var cid = tid.replace("main_","").replace(/_/gi,"^").replace("-spl-",".");
				var cid = gap.decodeid(tid.replace("main_",""));			
				if (key == "out"){				
					gBody.chatroom_out(cid);
				}else if (key == "allout"){
					gBody.chatroom_out("all");
				}else if (key == "mail"){
					gBody.group_mail_start_cid(cid);					
				}else if (key == "file"){
					gBody.ty = "chatroom";
					gBody.person_file_upload_chatroom(tid);					
				}else if (key == "memo"){
					gBody.group_memo_start_cid(cid);
				}else if (key == "video"){
					gBody.group_video_invite_cid(cid);
				}else if (key == "changename"){
					gBody.changename_show(cid);
				}else if (key == "fix"){
					gBody.change_fix_item(cid);
				}else if (key == "fix2"){
					gBody.change_fix_item2(cid);
				}
			},			
			build : function($trigger, e){
				gBody.click_room_id = $trigger.attr("id");
				//options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
				return {
					items : gBody.chatroom_menu_content()
				}
			}
		});				
		////////////////////////////////////////////////////////////////////////////////////////
						
		$("#center_content").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable:true
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
		//	mouseWheel:{ preventDefault: false },
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : true
			//setTop : $(this).height() + "px"
		});		
		//채팅방에 드래그 & 드롭하는 함수를 별도로 빼서 팝업창 드래그 기능과 통합한다.
		gBody.chat_file_drop();
		
		//채팅 메인 또는 채팅방 리스트에서 우클릭 메뉴르에서 파일을 전송하는 경우
		var isdropzone2 = $("#fileupload_temp")[0].dropzone;
		if (!isdropzone2) {
			var myDropzone2 = new Dropzone("#fileupload_temp", { // Make the whole body a dropzone
			      //url: "http://localhost:8080/fileupload", // Set the url
			      url : gap.fileupload_server_url + "/" + gap.search_today_only(),
			      autoProcessQueue : false, 
			      parallelUploads : 1,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
			  	  uploadMultiple: false,
			  	  previewsContainer: "#previews", // Define the container to display the previews
			  	  clickable: "#open_attach_temp", // Define the element that should be used as click trigger to select files.
			  	  renameFile: function(file){
					return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
				  },
			  	  init: function() {		
						myDropzone2 = this;
						this.imagelist = new Array();						
			      },
			      success : function(file, json){			    	
			    	  var info = json.files[0];
			    	  var filename = info.name;
			    	  if (gap.check_image_file(filename)){
			    		  info.type = "image";
			    	  }else{
			    		  info.type = "file";
			    	  }
			    	  //파일이 정상적으로 업로드 되었으니 해당 JSON정보를 그대로 메신저 서버에 넘기면된다.
			    	  //파일을 여러개 보낼 경우 하나에 한번씩 여기를 호출해서 올려진 파일의 정보를 배열로 가지고 있다가 최종 완료되면 메신저 서버로 순차적으로 발송처리해야 한다.		    	     	  
			    	  gBody.file_upload_infos.push(info);	 			
			      },
			      addedfile :  function(file) {
					 gap.dropzone_upload_limit(this, file, "chat");
				 }
			});
			myDropzone2.on("totaluploadprogress", function(progress) {	
				if (myDropzone2.files.length > 0){
					if (document.querySelector("#total-progress2 .progress-bar") != null){
						document.querySelector("#total-progress2 .progress-bar").style.width = progress + "%";
					}	
				}
			});
			myDropzone2.on("queuecomplete", function (file) {				
				var xytime = setTimeout(function(){
					gBody.complete_process2(myDropzone2);
					clearTimeout(xytime);
					myDropzone2.removeAllFiles();
				}, 800);
		    });
			myDropzone2.on("addedfiles", function (file) {			
				
				if (gBody.ty == "chatroom"){				
					myDropzone2.options.autoProcessQueue = false;				
				//	var curid = gBody.select_buddy_id.replace("main_","").replace(/_/gi,"^").replace("-spl-",".");
					var curid = gap.decodeid(gBody.select_buddy_id.replace("main_",""));
		 			var roomlists = gap.chat_room_info.ct;
		 			var select_room_info = "";		 			
		 			for (var k = 0 ; k < roomlists.length; k++){
		 				var lxl = roomlists[k];
		 				if (lxl.cid == curid){
		 					select_room_info = lxl.att;
		 					break;
		 				}
		 			}		 				 			
		 			var slist = "";
		 			slist += "<div style='text-align:left;padding-bottom:10px'>";
		 			for (var y = 0 ; y < select_room_info.length; y++){
		 				var sr = select_room_info[y];
		 				if (gap.search_cur_ky() != sr.ky){
		 					if (gap.cur_el == sr.el){
			 					slist += "<div>" + sr.nm + " / " + sr.dp + "</div>";
			 				}else{
			 					slist += "<div>" + sr.enm + " / " + sr.edp + "</div>";
			 				}	
		 				}			 						 				
		 			}
		 			slist += "<div>";		 			
		 			if (myDropzone2.files.length > 0){
		 				var msg = gap.lang.dragandadd;
			 			msg += "<div style='text-align:left;  padding-top:10px;'>["+gap.lang.cose+"]</div>" + slist;			 			
			 			gap.showConfirm({
			 				title: "Confirm",
			 				contents: msg,
			 				callback: function(){
			 					myDropzone2.options.autoProcessQueue = true;		 
								myDropzone2.processQueue();
			 				}
			 			});
		 			}										
				}else{					
					myDropzone2.options.autoProcessQueue = true;	
					myDropzone2.processQueue();
				}
		    });

			myDropzone2.on('sending', function(file, xhr, formData){			
				var fx = file;
				var is_image = gap.check_image_file(fx.name);				
				//var curid = gBody.select_buddy_id.replace("main_","").replace(/_/gi,"^").replace("-spl-",".");
				var curid = gap.decodeid(gBody.select_buddy_id.replace("main_",""));
				myDropzone2.sendOK = true;
				$("#total-progress2").show();     
		    });	
		}			
	},	
	
	"chat_file_drop" : function(){	
		if (typeof($("#chat_msg")[0]) != "undefined"){
			var isdropzone2 = $("#chat_msg")[0].dropzone;
			if (isdropzone2) {
				isdropzone2.destroy();
	        }
		}
		var isdropzone = $("#chat_msg")[0].dropzone;				
		if (!isdropzone) {					
			var myDropzone = new Dropzone("#chat_msg", { // Make the whole body a dropzone
				//url: "http://localhost:8080/fileupload", // Set the url
				 autoProcessQueue : false, 
				 addRemoveLinks: true,
			     url : gap.fileupload_server_url + "/" + gap.search_today_only(),
			  	 previewsContainer: "#previews", // Define the container to display the previews
			  	 clickable: "#open_attach_window", // Define the element that should be used as click trigger to select files.
			  	 parallelUploads : 100,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
			  	 maxFilesize: 100,
			  	 uploadMultiple: false,
			  	 renameFile: function(file){
					return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
				 },
			  	 init: function() {					
			      	myDropZone = this;
			      	gBody.dropzone = this;
			      	this.imagelist = new Array();
			      	this.file_lists = new Array();			      	
			        this.on('dragover', function(e,xhr,formData){	
		        		gma.chat_position = "chat";
		        		$("#chat_msg").css("border", "2px dotted #005295");			        	
			        	return false;
			        });
			        this.on('dragleave', function(e,xhr,formData){
			        	$("#chat_msg").css("border", "");
			        	return false;
			        });	   
			       
			     },
			     success : function(file, json){		
			    	 this.file_lists.push(json.files[0]);	
			    	 myDropzone.options.autoProcessQueue = false;
			     },
			     addedfile :  function(file) {			
			    	 gap.dropzone_upload_limit(this, file, "chat");
			     }
			});
			myDropzone.on("totaluploadprogress", function(progress) {	
				document.querySelector("#total-progress .progress-bar").style.width = progress + "%";			
			});
			myDropzone.on("queuecomplete", function (file) {	
			
				var lx = myDropzone.imcount;				
				var flist =  "";
				
				if (this.file_lists.length == 0){
					return false;
				}
				flist = this.file_lists;										
				var opt = "";		
								
				var send_items = new Array();
				
				var fnames = new Array();
				var snames = new Array();
				var dnames = new Array();
				var pnames = new Array();
				
				for (var i = 0 ; i < flist.length; i++){
					var file = flist[i];
					var info = "";
					info = file;			
					var filename = info.name;
					if (gap.check_image_file(filename)){
						info.type = "image";
					}else{
						info.type = "file";
					}		    	  
					//파일이 정상적으로 업로드 되었으니 해당 JSON정보를 그대로 메신저 서버에 넘기면된다.			    	
					var key = gap.search_cur_ky();
					var time = gap.search_time_only();	    	  
					var xdate = new Date();		
		  		  	var date = xdate.YYYYMMDDHHMMSS();
		  			var fname = info.name;
		  			fname = fname.replace("'","`");		    	  
		  		  	var inx = info.url.lastIndexOf("/");
		  		  	var url = info.url.substring(0, inx);			    	  
		  		  	var downloadurl = gap.fileupload_server_url + "/filedown" + info.savefolder + "/" + info.savefilename + "/" + encodeURIComponent(fname);
		  		  	var previewurl = gap.fileupload_server_url + info.savefolder + "/thumbnail/" + info.savefilename;		    		  
		  		  	var ty = info.type;		  		  
		  		  	var siz = info.size;
		  		  	var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.		    	 
		  		  	var obj = new Object();
		  		  	if (info.type == "image"){
		  		  		obj.ty = 6;
		  		  	}else{
		  		  		obj.ty = 5;
		  		  	}
		  		  	obj.msg = fname;
		  		  	obj.cid = gBody.cur_cid;		  		  	
		  		  	var ek = "";
		  		  	var croom_key = gBody.cur_cid;
		  		  	obj.mid = msgid;		    	 
		  		  	var exobj = new Object();		    	 		    	 
		  		  	exobj.nid = gap.sid;
		  		  	exobj.ty = gap.file_extension_check(info.name);
		  		  	exobj.sn = info.savefilename;
		  		  	exobj.sf = info.savefolder;
		  		  	exobj.sz = info.size;
		  		  	exobj.nm = info.name;	    	
		  		  	obj.ex = exobj;		  		  	
		  		  	//정보를 모았다가 하단에서 일괄 발송함
		  		  	this.imagelist.push(obj);		  		 
		  		  	var ucnt = gBody.cur_room_att_info_list.length -1;	  		 
		  		//  	gBody.file_draw('me', ty, key, date, time, fname, siz, downloadurl, previewurl, msgid, '','D', ucnt, "", ek, croom_key);
		  		  	
		  		  	var opp = new Object();
		  		  	opp.t1 = 'me';
		  		  	opp.t2 = ty;
		  		  	opp.t3 = key;
		  		  	opp.t4 = date;
		  		  	opp.t5 = time;
		  		  	opp.t6 = fname;
		  		  	opp.t7 = siz;
		  		  	opp.t8 = downloadurl;
		  		  	opp.t9 = previewurl;
		  		  	opp.t10 = msgid;
		  		  	opp.t11 = "",
		  		  	opp.t12 = 'D';
		  		  	opp.t13 = ucnt;
		  		  	opp.t14 = "";
		  		  	opp.t15 = ek;
		  		  	opp.t16 = croom_key;		  		  
		  		  	send_items.push(opp);
		  		  	
		  		  	fnames.push(fname);
		  		  	snames.push(siz);
		  		  	dnames.push(downloadurl);
		  		  	pnames.push(previewurl);
		  		  	
		  		  	gBody.check_display_layer();		  		  		    	 
		  		  	gBody.last_msg.ty = obj.ty 
		  		  	gBody.last_msg.ex = obj;
		  		  	gBody.last_msg.downloadurl = downloadurl;				
		  		  	if (opt != "all"){
		  		  		if (info.type == "image"){
		  		  			if (opt == "5"){
		  		  				opt = "all";
		  		  			}else{
		  		  				opt = 6;
		  		  			}			    		 
		  		  		}else{
		  		  			if (opt == "6"){
		  		  				opt = "all";
		  		  			}else{
			    				opt = 5;
			    			}			    		 
		  		  		}			 
		  		  	}					
				}

				var isOnlyImage = true;
				var multimsg = [];
				for (var k = 0 ; k < flist.length; k++){
					if (!gap.check_image_file(flist[k].name)){
						isOnlyImage = false;
						break;
					}else{
						multimsg.push(flist[k].name);
					}
				}				
		
				if (flist.length > 1 && isOnlyImage){					
					if (myDropzone.sendOpt == "all"){						
						msgid = send_items[0].t10;
						gBody.file_draw('me', ty, key, date, time, fnames, snames, dnames, pnames, msgid, '','D', ucnt, "", ek, croom_key);
						
						
						var chatroom_id = gBody.cur_cid;			
						var imlist = myDropzone.imagelist;
						var item = imlist[0];
						var files = new Array();
						for (var u = 0 ; u < imlist.length; u++){
							files.push(imlist[u].ex);
						}						
						var list = new Object();
						list.files = files;
						item.ex = list;													
						item.cid = chatroom_id;
						item.msg = multimsg.join(";");
						
						_wsocket.send_chat_msg(item);					
						
						gBody.chat_send_after_event(chatroom_id, opt);
					}else{
						//이미지 외의 파일이 선택된 경우 와 파일을 하나만 선택한 경우
						//파일을 순차적으로 발송한다.						
						for (var p = 0 ; p < send_items.length; p++){
							var pitem = send_items[p];
							gBody.file_draw(pitem.t1, pitem.t2, pitem.t3, pitem.t4, pitem.t5, pitem.t6, 
									pitem.t7, pitem.t8, pitem.t9, pitem.t10, pitem.t11 , 
									pitem.t12, pitem.t13, pitem.t14, pitem.t15, pitem.t16);
						}						
						
						
						var chatroom_id = gBody.cur_cid;			
						var imlist = myDropzone.imagelist;		
						imlist.forEach(function(item, index){	
							var id = "time_" + index;
							id = setTimeout(function(){ 
								item.cid = chatroom_id;
							//	item.ex = item.ex.files[0];

						        _wsocket.send_chat_msg(item);
						        clearTimeout(id);
						    }, index * 100 + 1000 );
						});								
						gBody.chat_send_after_event(chatroom_id, opt);
					}
				}else{
					//이미지 외의 파일이 선택된 경우 와 파일을 하나만 선택한 경우
					//파일을 순차적으로 발송한다.	
					for (var p = 0 ; p < send_items.length; p++){
						var pitem = send_items[p];
						gBody.file_draw(pitem.t1, pitem.t2, pitem.t3, pitem.t4, pitem.t5, pitem.t6, 
								pitem.t7, pitem.t8, pitem.t9, pitem.t10, pitem.t11 , 
								pitem.t12, pitem.t13, pitem.t14, pitem.t15, pitem.t16);
					}					
				
					
					var chatroom_id = gBody.cur_cid;			
					var imlist = myDropzone.imagelist;		
					imlist.forEach(function(item, index){	
						var id = "time_" + index;
						id = setTimeout(function(){ 
							item.cid = chatroom_id;
					        _wsocket.send_chat_msg(item);
					        clearTimeout(id);
					    }, index * 100 + 1000 );
					});								
					gBody.chat_send_after_event(chatroom_id, opt);
				}			
		    });

			myDropzone.on("addedfiles", function (file) {		
				$("#total-progress").hide();				
				$("#chat_msg").css("border", "");
				
				var isOnlyImage = true;
				for (var k = 0 ; k < file.length; k++){
					if (!gap.check_image_file(file[k].name)){
						isOnlyImage = false;
						break;
					}
				}
				
				if (file.length > 1 && isOnlyImage){				
					gap.showConfirm_new({
						title: gap.lang.sendfile,
						text1 : gap.lang.sop1,
						text2 : gap.lang.sop2,
						contents: gap.lang.sop3,
						callback: function(e){
							//묶음 보내기		
							myDropzone.sendOpt = "all";
							myDropzone.options.autoProcessQueue = true;	
							myDropzone.processQueue();
							myDropzone.options.autoProcessQueue = false;	
						},
						callback2 : function(){
							//하나씩 보내기
							//파일을 순차적으로 발송한다.					
							myDropzone.sendOpt = "divide";		
							myDropzone.options.autoProcessQueue = true;	
							myDropzone.processQueue();
							myDropzone.options.autoProcessQueue = false;
						}						
					});
				}else{					
					myDropzone.options.autoProcessQueue = true;	
					myDropzone.processQueue();
				//	myDropzone.options.autoProcessQueue = false;	
				}				
		    });
			myDropzone.on('sending', function(file, xhr, formData){		
				gma.chat_position = "chat";
				gma.click_left_menu = false;				
		        $("#chat_msg").css("border","");
		        $("#total-progress").show();	
		        document.querySelector("#total-progress .progress-bar").style.display = "";		       
		    });		
		}	
	},

	
	"chat_send_after_event" : function(chatroom_id, opt){
		gBody.dropzone.imagelist = new Array();				
		if (opt == "all"){
			var all_t1 = setTimeout(function() {			
				 _wsocket.chat_room_image_list(chatroom_id);
				 _wsocket.chat_room_file_list(chatroom_id);
				 
				 clearTimeout(all_t1);
 			}, 1500);
		}else if (opt == 5){					
			 var all_t2 = setTimeout(function() {			
				 _wsocket.chat_room_file_list(chatroom_id);
				 clearTimeout(all_t2);
 			}, 1500);
		}else if (opt == 6){
			var all_t3 = setTimeout(function() {			
				 _wsocket.chat_room_image_list(chatroom_id);
				 clearTimeout(all_t3);
 			}, 1500);					
		}				
		var xtime1 = setTimeout(function(){
			gBody.complete_process();
			clearTimeout(xtime1);
		}, 800);								
		gBody.dropzone.file_lists = new Array();			
	},
	
	"chat_file_drop_popup" : function(){	
		if (typeof($("#alarm_chat_sub")[0]) != "undefined"){
			var isdropzone3 = $("#alarm_chat_sub")[0].dropzone;
			if (isdropzone3) {
				isdropzone3.destroy();
	        }
		}	
		var isdropzone = $("#alarm_chat_sub")[0].dropzone;		
		if (!isdropzone) {		
			var myDropzone_popup = new Dropzone("#alarm_chat_sub", { // Make the whole body a dropzone
				//url: "http://localhost:8080/fileupload", // Set the url
				 autoProcessQueue : false, 
				 addRemoveLinks: true,
			     url : gap.fileupload_server_url + "/" + gap.search_today_only(),
			  	 previewsContainer: "#previews", // Define the container to display the previews
			  	 clickable: "#open_attach_window_popup", // Define the element that should be used as click trigger to select files.
			  	 parallelUploads : 100,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
			  	 maxFilesize: 100,
			  	 uploadMultiple: false,
			  	 renameFile: function(file){
					return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
				 },
			  	 init: function() {					
			      	myDropZone_popup = this;
			      	gBody.dropzone_popup = this;
			      	this.imagelist = new Array();
			      	this.file_lists = new Array();			      	
			        this.on('dragover', function(e,xhr,formData){
			        	gma.chat_position = "popup_chat";
			        	$("#alarm_chat_sub").css("border", "2px dotted #005295");			        	
			        	return false;
			        });
			        this.on('dragleave', function(e,xhr,formData){
			        	$("#alarm_chat_sub").css("border", "");			        	
			        	return false;
			        });    
			     },
			     success : function(file, json){ 		
			    	 this.file_lists.push(json.files[0]);	
			    	 myDropzone_popup.options.autoProcessQueue = false;
			     },
			     addedfile :  function(file){			    	 
			    	 gap.dropzone_upload_limit(this, file, "chat");
			     }
			});
			myDropzone_popup.on("totaluploadprogress", function(progress) {				
				document.querySelector("#total-progress-popup-chat .progress-bar").style.width = progress + "%";		
			});
			myDropzone_popup.on("queuecomplete", function (file) {			
				var lx = myDropzone_popup.imcount;				
				var flist =  "";				
				if (this.file_lists.length == 0){
					return false;
				}				
				flist = this.file_lists;									
				var opt = "";				
				
				var send_items = new Array();
				var fnames = new Array();
				var snames = new Array();
				var dnames = new Array();
				var pnames = new Array();
				
				
				for (var i = 0 ; i < flist.length; i++){
					var file = flist[i];
					var info = "";
					info = file;			
					var filename = info.name;
					if (gap.check_image_file(filename)){
						info.type = "image";
					}else{
						info.type = "file";
					}		    	  
					//파일이 정상적으로 업로드 되었으니 해당 JSON정보를 그대로 메신저 서버에 넘기면된다.			    	
					var key = gap.search_cur_ky();
					var time = gap.search_time_only();		    	  
					var xdate = new Date();		
		  		  	var date = xdate.YYYYMMDDHHMMSS();
		  			var fname = info.name;
		  			fname = fname.replace("'","`");		    	  
		  		  	var inx = info.url.lastIndexOf("/");
		  		  	var url = info.url.substring(0, inx);			    	  
		  		  	var downloadurl = gap.fileupload_server_url + "/filedown" + info.savefolder + "/" + info.savefilename + "/" + encodeURIComponent(fname);
		  		  	var previewurl = gap.fileupload_server_url + info.savefolder + "/thumbnail/" + info.savefilename;		    		  
		  		  	var ty = info.type;		  		  
		  		  	var siz = info.size;
		  		  	var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.	    	 
		  		  	var obj = new Object();
		  		  	if (info.type == "image"){
		  		  		obj.ty = 6;
		  		  	}else{
		  		  		obj.ty = 5;
		  		  	}
		  		  	obj.msg = fname;
		  		  	obj.cid = gBody.cur_cid;		  		  	
		  		  	var ek = "";
		  		  	var croom_key = gBody.cur_cid;
		  		  	obj.cid = gma.cur_cid_popup;
		  		  	ek = "popup";
		  		  	croom_key = gma.cur_cid_popup;	
		  		  	obj.mid = msgid;	    	 
		  		  	var exobj = new Object();		    	 		    	 
		  		  	exobj.nid = gap.sid;
		  		  	exobj.ty = gap.file_extension_check(info.name);
		  		  	exobj.sn = info.savefilename;
		  		  	exobj.sf = info.savefolder;
		  		  	exobj.sz = info.size;
		  		  	exobj.nm = info.name;	    	
		  		  	obj.ex = exobj;		  		  	
		  		  	//정보를 모았다가 하단에서 일괄 발송함
		  		  	this.imagelist.push(obj);		  		 
		  		  	var ucnt = gBody.cur_room_att_info_list.length -1;	  
		  		  	
		  		  	
		  		  	
		  		  	
		  		  	var opp = new Object();
		  		  	opp.t1 = 'me';
		  		  	opp.t2 = ty;
		  		  	opp.t3 = key;
		  		  	opp.t4 = date;
		  		  	opp.t5 = time;
		  		  	opp.t6 = fname;
		  		  	opp.t7 = siz;
		  		  	opp.t8 = downloadurl;
		  		  	opp.t9 = previewurl;
		  		  	opp.t10 = msgid;
		  		  	opp.t11 = "",
		  		  	opp.t12 = 'D';
		  		  	opp.t13 = ucnt;
		  		  	opp.t14 = "";
		  		  	opp.t15 = ek;
		  		  	opp.t16 = croom_key;		  		  
		  		  	send_items.push(opp);
		  		  	
		  		  	fnames.push(fname);
		  		  	snames.push(siz);
		  		  	dnames.push(downloadurl);
		  		  	pnames.push(previewurl);
		  		  	
		  		  	gBody.check_display_layer();		  		  		    	 
		  		  	gBody.last_msg.ty = obj.ty 
		  		  	gBody.last_msg.ex = obj;
		  		  	gBody.last_msg.downloadurl = downloadurl;				
		  		  	if (opt != "all"){
		  		  		if (info.type == "image"){
		  		  			if (opt == "5"){
		  		  				opt = "all";
		  		  			}else{
		  		  				opt = 6;
		  		  			}			    		 
		  		  		}else{
		  		  			if (opt == "6"){
		  		  				opt = "all";
		  		  			}else{
			    				opt = 5;
			    			}			    		 
		  		  		}			 
		  		  	}
		  		  	
		  		  	
		  		  	
//		  		  	gBody.file_draw('me', ty, key, date, time, fname, siz, downloadurl, previewurl, msgid, '','D', ucnt, "", ek, croom_key);	
//		  		  	gBody.check_display_layer();		  		  	
//		  		  	gBody.last_msg.ty = obj.ty 
//		  		  	gBody.last_msg.ex = obj;
//		  		  	gBody.last_msg.downloadurl = downloadurl;		
//		  		  	
//		  		  	
//		  		  	
//		  		  	
//		  		  	if (opt != "all"){
//		  		  		if (info.type == "image"){
//		  		  			if (opt == "5"){
//		  		  				opt = "all";
//		  		  			}else{
//		  		  				opt = 6;
//		  		  			}			    		 
//		  		  		}else{
//		  		  			if (opt == "6"){
//		  		  				opt = "all";
//		  		  			}else{
//			    				opt = 5;
//			    			}			    		 
//		  		  		}			 
//		  		  	}
		  		  	
		  		  	
		  		  	
		  		  	
		  		  	
		  		  	
		  		  	
				}
				
				
				
				var isOnlyImage = true;
				var multimsg = [];
				for (var k = 0 ; k < flist.length; k++){
					if (!gap.check_image_file(flist[k].name)){
						isOnlyImage = false;
						break;
					}else{
						multimsg.push(flist[k].name);
					}
				}				

				if (flist.length > 1 && isOnlyImage){					
					if (myDropzone_popup.sendOpt == "all"){						
						msgid = send_items[0].t10;
						gBody.file_draw('me', ty, key, date, time, fnames, snames, dnames, pnames, msgid, '','D', ucnt, "", ek, croom_key);
						
						var chatroom_id = gma.cur_cid_popup;			
						var imlist = myDropzone_popup.imagelist;
						var item = imlist[0];
						var files = new Array();
						for (var u = 0 ; u < imlist.length; u++){
							files.push(imlist[u].ex);
						}						
						var list = new Object();
						list.files = files;
						item.ex = list;													
						item.cid = chatroom_id;
						item.msg = multimsg.join(";");
						
						_wsocket.send_chat_msg(item);					
						
						gBody.chat_send_after_event_popup(chatroom_id, opt);
					}else{
						//이미지 외의 파일이 선택된 경우 와 파일을 하나만 선택한 경우
						//파일을 순차적으로 발송한다.						
						for (var p = 0 ; p < send_items.length; p++){
							var pitem = send_items[p];
							gBody.file_draw(pitem.t1, pitem.t2, pitem.t3, pitem.t4, pitem.t5, pitem.t6, 
									pitem.t7, pitem.t8, pitem.t9, pitem.t10, pitem.t11 , 
									pitem.t12, pitem.t13, pitem.t14, pitem.t15, pitem.t16);
						}	
						
						var chatroom_id = gma.cur_cid_popup;			
						var imlist = myDropzone_popup.imagelist;		
						imlist.forEach(function(item, index){	
							var id = "time_" + index;
							id = setTimeout(function(){ 
								item.cid = chatroom_id;
							//	item.ex = item.ex.files[0];

						        _wsocket.send_chat_msg(item);
						        clearTimeout(id);
						    }, index * 100 + 1000 );
						});								
						gBody.chat_send_after_event_popup(chatroom_id, opt);
					}
				}else{
					//이미지 외의 파일이 선택된 경우 와 파일을 하나만 선택한 경우
					//파일을 순차적으로 발송한다.	
					for (var p = 0 ; p < send_items.length; p++){
						var pitem = send_items[p];
						gBody.file_draw(pitem.t1, pitem.t2, pitem.t3, pitem.t4, pitem.t5, pitem.t6, 
								pitem.t7, pitem.t8, pitem.t9, pitem.t10, pitem.t11 , 
								pitem.t12, pitem.t13, pitem.t14, pitem.t15, pitem.t16);
					}	
				
					var chatroom_id = gma.cur_cid_popup;			
					var imlist = myDropzone_popup.imagelist;		
					imlist.forEach(function(item, index){	
						var id = "time_" + index;
						id = setTimeout(function(){ 
							item.cid = chatroom_id;
					        _wsocket.send_chat_msg(item);
					        clearTimeout(id);
					    }, index * 100 + 1000 );
					});								
					gBody.chat_send_after_event_popup(chatroom_id, opt);
				}	
				
				
				
				
				
				
				
				
				
				
//				var chatroom_id = gBody.cur_cid;			
//				chatroom_id = gma.cur_cid_popup;				
//				var imlist = myDropzone_popup.imagelist;		
//				imlist.forEach(function(item, index){	
//					var id = "time_" + index;
//					id = setTimeout(function(){ 
//						item.cid = chatroom_id;
//				        _wsocket.send_chat_msg(item);
//				        clearTimeout(id);
//				    }, index * 100 + 1000 );
//				});
//				myDropzone_popup.imagelist = new Array();				
//				if (opt == "all"){
//					var all_t1 = setTimeout(function() {			
//						 _wsocket.chat_room_image_list(chatroom_id);
//						 _wsocket.chat_room_file_list(chatroom_id);
//						 
//						 clearTimeout(all_t1);
//		 			}, 1500);
//				}else if (opt == 5){					
//					 var all_t2 = setTimeout(function() {			
//						 _wsocket.chat_room_file_list(chatroom_id);
//						 clearTimeout(all_t2);
//		 			}, 1500);
//				}else if (opt == 6){
//					var all_t3 = setTimeout(function() {			
//						 _wsocket.chat_room_image_list(chatroom_id);
//						 clearTimeout(all_t3);
//		 			}, 1500);				
//				}				
//				var xtime1 = setTimeout(function(){
//					gBody.complete_process();
//					clearTimeout(xtime1);
//				}, 800);								
//				this.file_lists = new Array();
				
				
		    });
			
			
			myDropzone_popup.on("addedfiles", function (file) {			
				$("#total-progress-popup-chat").hide();	
				$("#alarm_chat_sub").css("border", "");		
				
				var isOnlyImage = true;
				for (var k = 0 ; k < file.length; k++){
					if (!gap.check_image_file(file[k].name)){
						isOnlyImage = false;
						break;
					}
				}
				
				if (file.length > 1 && isOnlyImage){				
					gap.showConfirm_new({
						title: gap.lang.sendfile,
						text1 : gap.lang.sop1,
						text2 : gap.lang.sop2,
						contents: gap.lang.sop3,
						callback: function(e){
							//묶음 보내기		
						myDropzone_popup.sendOpt = "all";
						myDropzone_popup.options.autoProcessQueue = true;	
						myDropzone_popup.processQueue();
						myDropzone_popup.options.autoProcessQueue = false;	
						},
						callback2 : function(){
							//하나씩 보내기
							//파일을 순차적으로 발송한다.					
							myDropzone_popup.sendOpt = "divide";		
							myDropzone_popup.options.autoProcessQueue = true;	
							myDropzone_popup.processQueue();
							myDropzone_popup.options.autoProcessQueue = false;
						}						
					});
				}else{					
					myDropzone_popup.options.autoProcessQueue = true;	
					myDropzone_popup.processQueue();
				//	myDropzone.options.autoProcessQueue = false;	
				}				
				
		    });
			myDropzone_popup.on('sending', function(file, xhr, formData){					
				gma.chat_position = "popup_chat";
				gma.click_left_menu = false;				
				$("#alarm_chat_sub").css("border", "");	       
		  //      if (gma.chat_position == "popup_chat"){
		        	$("#total-progress-popup-chat").show();	
		        	 document.querySelector("#total-progress-popup-chat .progress-bar").style.display = "";
		  //      }else{
		        	$("#total-progress").show();	
		        	 document.querySelector("#total-progress .progress-bar").style.display = "";
		  //      }		       
		    });		
		}	
	},
	
	
	"chat_send_after_event_popup" : function(chatroom_id, opt){
//		gBody.dropzone.imagelist = new Array();				
//		if (opt == "all"){
//			var all_t1 = setTimeout(function() {			
//				 _wsocket.chat_room_image_list(chatroom_id);
//				 _wsocket.chat_room_file_list(chatroom_id);
//				 
//				 clearTimeout(all_t1);
// 			}, 1500);
//		}else if (opt == 5){					
//			 var all_t2 = setTimeout(function() {			
//				 _wsocket.chat_room_file_list(chatroom_id);
//				 clearTimeout(all_t2);
// 			}, 1500);
//		}else if (opt == 6){
//			var all_t3 = setTimeout(function() {			
//				 _wsocket.chat_room_image_list(chatroom_id);
//				 clearTimeout(all_t3);
// 			}, 1500);					
//		}				
//		var xtime1 = setTimeout(function(){
//			gBody.complete_process();
//			clearTimeout(xtime1);
//		}, 800);								
//		gBody.dropzone.file_lists = new Array();		
		
		
//		var chatroom_id = gBody.cur_cid;			
//		chatroom_id = gma.cur_cid_popup;				
//		var imlist = myDropzone_popup.imagelist;		
//		imlist.forEach(function(item, index){	
//			var id = "time_" + index;
//			id = setTimeout(function(){ 
//				item.cid = chatroom_id;
//		        _wsocket.send_chat_msg(item);
//		        clearTimeout(id);
//		    }, index * 100 + 1000 );
//		});
		gBody.dropzone_popup.imagelist = new Array();				
		if (opt == "all"){
			var all_t1 = setTimeout(function() {			
				 _wsocket.chat_room_image_list(chatroom_id);
				 _wsocket.chat_room_file_list(chatroom_id);
				 
				 clearTimeout(all_t1);
 			}, 1500);
		}else if (opt == 5){					
			 var all_t2 = setTimeout(function() {			
				 _wsocket.chat_room_file_list(chatroom_id);
				 clearTimeout(all_t2);
 			}, 1500);
		}else if (opt == 6){
			var all_t3 = setTimeout(function() {			
				 _wsocket.chat_room_image_list(chatroom_id);
				 clearTimeout(all_t3);
 			}, 1500);				
		}				
		var xtime1 = setTimeout(function(){
			gBody.complete_process();
			clearTimeout(xtime1);
		}, 800);								
		
		gBody.dropzone_popup.file_lists = new Array();	
		
		
	},

	
	"add_chatroom" : function(){

		var html = gBody.new_chat_layer_html();			
		gap.showBlock();
		$("#common_work_layer").show();
		$("#common_work_layer").html(html);
		var $layer = $('#new_chat_layer');
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');		
		$("#input_chat_user").keydown(function(evt){
			if (evt.keyCode == 13){
				if ($("#input_chat_user").val().trim() == ""){
					mobiscroll.toast({message:gap.lang.inputname, color:'danger'});
					return false;
				}				
				gBody.channel_user_search("T", $("#input_chat_user").val());
			}
		})	
		.bind('paste', function(e){
			gap.change_paste_text(e, this);
		});		
		$("#org_pop_btn").on("click", function(){
			window.ORG.show(
			{
				'title': gap.lang.inviteContact,
				'single':false
			}, 
			{
				getItems:function() { return []; },
				setItems:function(items) { /* 반환되는 Items */
				
					gBody.aleady_select_user_count = 0;
					for (var i = 0; i < items.length; i++){
						var _res = gap.convert_org_data(items[i]);
						if (_res.ky.toLowerCase() != gap.userinfo.rinfo.ky.toLowerCase()){
							
							gBody.channel_add_user('T', _res);
						}
					}
					gBody.alert_aleady_select_user();
				}
			});
		});		
		$("#create_chat_btn").off().on("click", function(){
			if ($("#chat_member_list").children().length == 0){
				mobiscroll.toast({message:gap.lang.inputname, color:'danger'});
				return false;
			}						
			var member_count = $("#chat_member_list").children().length;
			var list = new Array();
			var tlist = new Array();
			for(var i = 0; i < member_count; i++){
			//	var user_info = JSON.parse( $("#chat_member_list").children().eq(i).attr("data-user"));
				var user_info = $("#chat_member_list").children().eq(i).data("user");
				list.push(user_info.ky);
				tlist.push(user_info.ky);
			}			
			$("#close_chat_layer").click();
			_wsocket.search_user_addmember(tlist);	
		});
		
		$("#close_chat_layer").on("click", function(){
			gap.remove_layer('new_chat_layer');
		});
	},

	"show_announce" : function(){
		return false;
		//최초로그인시 도움말 창 띄우지 않기
		var isLock = localStorage.getItem('install_preview');		
		if (isLock == "OK"){			
		}else{			
			$("#xxmanual_title").text("AP-ON ABC2 Web " + gap.lang.svr_gu);
			$("#ann_title").text(gap.lang.videomanual);
			$("#ann_desc").text(gap.lang.in_guide);			
			$("#ann_img").attr("src", "./img/intro01_"+gap.curLang+".jpg");			
			$("#ann_s1").text("- " + gap.lang.manu1);
			$("#ann_s2").text("- " + gap.lang.manu2);
			$("#ann_s3").text("- " + gap.lang.manu3);
			$("#ann_s4").text("- " + gap.lang.manu4);
			$("#ann_s5").text("- " + gap.lang.manu5);
			$("#ann_s6").text("- " + gap.lang.manu6);
			$("#ann_s7").text("- " + gap.lang.manu7);
			$("#ann_s8").text("- " + gap.lang.manu8);	
			$("#ann_s9").text("- " + gap.lang.manu9);			
			var int = gap.maxZindex();
			$("#preview_install").css("zIndex", parseInt(int)+1);
			$("#preview_install").show();			
			$("#ann_close").on("click", function(){
				$("#preview_install").fadeOut();
				localStorage.setItem('install_preview', 'OK');
			});
		}		
	},
	
	"complete_process" : function(){		
		$("#total-progress .progress-bar").fadeOut(function(){
			document.querySelector("#total-progress .progress-bar").style.display = "none";
			document.querySelector("#total-progress .progress-bar").style.width = "0%";
		});		
		$("#total-progress-popup-chat .progress-bar").fadeOut(function(){
			document.querySelector("#total-progress-popup-chat .progress-bar").style.display = "none";
			document.querySelector("#total-progress-popup-chat .progress-bar").style.width = "0%";
		});
	},
	
	"fileinfo_send_to_server" : function(room_key, filelist){
		//특정 채팅방에서 파일은 전송했다는 메시지를 서버에 전송한다.		
		gBody.file_drag_room_id = room_key;
		var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.		
		var flist = new Array();			
		for (var i = 0 ; i < filelist.length; i++){
			var info = filelist[i];			
			var obj = new Object();
			var filename = info.name;			
			var size = info.size;
			filename = filename.replace("'","`");			
			//채팅창 안에서 드래그한 파일 또는 이미지일 경우
			if (info.type == "file"){
				obj.ty = 5;
			}else{
				obj.ty = 6;
			}			
			obj.msg = filename;
			obj.cid = room_key;
			obj.mid = msgid;													 
			var exobj = new Object();		    	 		    	 
			exobj.nid = gap.sid;
			exobj.ty = gap.file_extension_check(filename);			 					 								 
			exobj.sn = info.savefilename;
			exobj.sf = info.savefolder;
			exobj.sz = parseFloat(size);
			exobj.nm = filename;
			obj.ex = exobj;			 
			flist.push(obj);		
			var inx = info.url.lastIndexOf("/");
		    var url = info.url.substring(0, inx);			    	  
		    var downloadurl = url+ "/filedown" + info.savefolder + "/" + info.savefilename + "/" + encodeURIComponent(filename);
		    var previewurl = info.url + "/thumbnail/" + info.savefilename;			 
		    gBody.last_msg.ty = obj.ty 
	    	gBody.last_msg.ex = obj;
	    	gBody.last_msg.downloadurl = downloadurl;
	    	if (room_key == gBody.cur_cid){
				//동일한 채팅방이 열려있는 상태에서 버디리스트에 파일을 멀티로 전송한 경우 채팅방에 바로 표시해 줘야 한다.
				var time = gap.search_time_only();				    	  
		    	var xdate = new Date();		
		  		var date = xdate.YYYYMMDDHHMMSS();	
		  		var ucnt = gBody.cur_room_att_info_list.length -1 ;
		  		var croom_key = gBody.cur_cid;
				gBody.file_draw('me', info.type, gap.search_cur_ky(), date, time, filename, size, downloadurl, previewurl, msgid, '','D', ucnt, "","",croom_key);	
				
				gBody.check_display_layer();
				
			}			
		}		
		var imlist = flist;		
		imlist.forEach(function(item, index){		
			var id = "tmi_" + index;
			id = setTimeout(function(){
		        _wsocket.send_chat_msg(item);
		        clearTimeout(id);
		    }, index * 100 + 1000 );
		});			
	},	
	
	"change_chatroom_and_main_chatlog" : function(obj, room_key){	
		//버디리스트에서 파일을 전송할 경우 해당 채팅방이 존재하면 최종 수신된 메시지와 최종 메시지를 변경해 주어야 한다.
		//var xid = obj.cid.replace(/\^/gi,"_").replace(".","-spl-");
		var xid = gap.encodeid(obj.cid);
		var date = new Date();		
		var today = date.YYYYMMDD();
		var today2 = date.YYYYMMDDHHMMSS();
		var tm = gap.change_date_localTime_only_time(today2.toString());		
		if (gap.chatroom_exist_check(obj.cid)){		
			//기존에 있는 채팅방의 경우 채팅방 리스트 정보를 변경한다.				
			var copyObj = $("#" + xid).get(0).outerHTML;			
			$("#" + xid).remove();			
			var rdate = gap.change_date_default(today);			
			if ($("#chatroom_"+today).length == 0){
				var html_top = "";
				html_top += "<div class='group' id='chatroom_"+today+"'>";
				html_top += "<h3><span>"+rdate+"</span></h3>";
				html_top += "	<ul id='chatroom_ul_"+today+"'>";
				html_top += "	</ul>";
				html_top += "</div>";
				$("#add_group2").after(html_top);							
				$(copyObj).insertAfter("#chatroom_ul_"+today);
			}else{
				$(copyObj).insertBefore("#chatroom_ul_"+today);
			}			
		}else{
			//기존에 존재 하지 않는 방일 경우 신규로 리스틀 불러온다.
			_wsocket.load_chatroom_list();
		}		
		//메인에 정보를 신규 메시지로 변경한다.		
		if ($("#li_main_" + xid).length > 0){
			var copyObj = $("#li_main_" + xid).get(0).outerHTML;
			$("#li_main_" + xid).remove();			
			$(copyObj).insertAfter("#make_new_chat_room");			
			gBody._event_main_chatroom_last();			
		}			
		//신규로 제거하 다시 붙이고 해서 이벤트가 모두 제거된 상태로 변경되어 다시 이벤트를 추가해 준다.
		gBody._event_chatroom_list();
	},
	
	"complete_process2" : function(myDrop){
		//버디리스트에서 바로 파일 업로드하는 경우 파일 업로드가 완료되면 처리하는 프로세스	
		if (!myDrop.sendOK){
			return false;
		}		
		var ty = gBody.ty;		
		myDrop.options.autoProcessQueue = false;	
		$("#total-progress2 .progress-bar").fadeOut(function(){			
			if (document.querySelector("#total-progress2 .progress-bar") != null){
				document.querySelector("#total-progress2 .progress-bar").style.display = "none";
				document.querySelector("#total-progress2 .progress-bar").style.width = "0%";
			}		
			$("#total-progress2").remove();			
		});		
		//서버로 정보를 발송한다. file_upload_infos값을 활용해서			
		var sel = gBody.select_buddy_id;
		var filelist = gBody.file_upload_infos;	
		var room_key = "";		
		var room_enter_key = "";
		if (ty == "chatroom"){
			//채팅방에서 업로드한 경우이다
			//room_key = sel.replace("main_","").replace(/_/gi,"^").replace("-spl-",".");
			room_key = gap.decodeid(sel.replace("main_",""));
			room_enter_key = sel.replace("main_","");
		}else{
			//버디리스트에서 업로드한 경우이다.
			var uid = $("#" + sel).attr("data");		
			var name = $("#" + sel).attr("data4");
			gBody.pname = name;
			room_key = _wsocket.make_room_id(uid);
			var exist_room = gap.chatroom_exist_check(room_key);
			if (exist_room == false){
				//기존에 채팅방이 없을 경우 방을 만들고 메시지를 보내야 한다.
				_wsocket.make_chatroom_11_only_make(uid, name);
			}
		}		
	//	room_key = room_key + "^" + gap.userinfo.rinfo.cpc;  //roomkey생성시 회사코드를 추가한다.
		room_key = room_key;
		gBody.fileinfo_send_to_server(room_key, filelist);		
		//////////////////////////////////////////////////////////////////////////////////////////////		
		gBody.file_upload_infos = new Array();		
		if (room_key != gBody.cur_cid){			
			var sx1 = setTimeout(function(){
				var msg = gap.lang.enter_room;				
				gap.showConfirm({
					title: "Confirm",
					contents: msg,
					callback: function(){
					if (ty == "chatroom"){
							gBody.enter_chatroom_for_chatroomlist(room_enter_key, "");
						}else{
							gBody.enter_chatroom_for_chatroomlist(room_key, uid, gBody.pname);
						} 							
						gBody.ty = "";			
					}
				});	 			
	 			clearTimeout(sx1);
			}, 1500);			
		}	
	},
		
	"enteropt" : function(opt){
		gBody.enter_opt = String(opt);
		_wsocket.change_enter_opt(opt);
	},
	
	"send_msg" : function(evt){		
		
		var opt = "me";		
		var input_area = $(evt.currentTarget).attr("id");
		if (input_area == "alarm_chat_send" || input_area == "alarm_chat_msg"){
			gma.chat_position = "popup_chat";
			gma.chat_position_id = "alarm_chat_msg";
			input_area = "alarm_chat_msg";
		}else{
			gma.chat_position = "chat";
			gma.chat_position_id = "message_txt";
		}		
		var msg = $("#"+input_area).val();		
		if (msg.substring(0,4).toLowerCase() == "/gpt"){
			//GPT에서 물어보는 질문으로 인식한다.
			gBody.temp_gpt_msg = true;
			var msg = msg.replace("/gpt", "");
			gkgpt.chatgpt_call(msg);			
		}else{
			gBody.temp_gpt_msg = false;
			var type = "msg";
			var name = gap.userinfo.rinfo.nm;	
			var key = gap.search_cur_ky();    
			
			gBody.MessageSend(opt, msg, type, name, key,"");
		}		
        $("#"+input_area).attr("rows", 0);
        $("#"+input_area).attr("placeholder",gap.lang.input_message);
        evt.stopPropagation();
        evt.preventDefault();
	},
	
	"send_msg_etc" : function(msg, receivers){
		//특정 시스템에서 메시지르 보내는 경우
		for (var i = 0 ; i < receivers.length; i++){
			var r = receivers[i];
			var msgid = gap.make_msg_id(); 
			
			var obj = new Object();
			obj.cid = _wsocket.make_room_id(r);
			obj.mid = msgid;
			obj.msg = msg;
			obj.ty = 1
			obj.type = "msg"
			_wsocket.send_chat_msg(obj);	
		}
	},
	
	"enter_next_line" : function(evt){
    	evt.stopPropagation();
	},
	
	"enter_line_control" : function(evt){
    	evt.stopPropagation();
	},	
	
	"file_draw" : function(opt, type, key, date, time, filename, filesize, downloadurl, previewurl, msgid, tp, init, ucnt, info, ek, croom_key){

		var draw_dis = gBody.chat_show_dis;
		var draw_dis_parent = gBody.chat_show;		
		if (typeof(ek) != "undefined" && ek != ""){
			if (ek.indexOf("channel") > -1){
				draw_dis = gBody.chat_show_channel_sub;
				draw_dis_parent = gBody.chat_show_channel;
			}else if (ek.indexOf("popup") > -1 || gma.chat_position == "popup_chat"){
				draw_dis = gBody.chat_show_popup_sub;
				draw_dis_parent = gBody.chat_show_popup;
			}
		}		
		var isonetoone = gap.search_is_onetoone();	
		var userinfo = gap.cur_room_att_info_list_search(key);
		
		var xmlen = gBody.cur_room_att_info_list.length-1;  //삭제를 위한 카운트 설정 읽지 않은 건수와 비교		
		var name = "";					
		var dept = "";	
		var xuser = "";			
		var pxuser = "";
//		if (typeof(userinfo) == "undefined"){
//			xuser = info.nm;			
//		}else{
			if (opt == "me"){
				name = userinfo.nm;
			}else{
				pxuser = gap.cur_room_att_info_list_search(key);
				if (typeof(pxuser) != "undefined"){
					var sxuser = gap.user_check(pxuser);
					var xuser = sxuser.disp_user_info;
				}else{
					//xuser = name + " | " + dept;					
					pxuser = gap.cur_room_att_person_img_info_search4(key, croom_key);				
					if (typeof(pxuser) != "undefined"){
						var sxuser = gap.user_check(pxuser);
						var xuser = sxuser.disp_user_info;
					}else{
						//xuser = name ; //+ " | " + dept;
						
						if (!userinfo){							
							var ppx = gap.search_user_emp(key);							
							ppx = JSON.parse(ppx.responseText);		
							if (ppx[0].length == 0){
								//퇴사자으이 경우
								xuser = name ; //+ " | " + dept;
								var userinfo = new Object();
								userinfo.ky = key;
								userinfo.nm = "";
							}else{
								userinfo = ppx[0][0];
								pxuser = userinfo;
								var sxuser = gap.user_check(pxuser);
								var xuser = sxuser.disp_user_info;
							}						
						}
					}			
				}				
			}			
//		}			
		var xydate = new Date();		
		var today = xydate.YYYYMMDD();			
		var bun = "";
		if (init == "D"){
			bun = today + time.replace(":","");
		}else{
			var xdate = gap.search_today_only3(date);	
			var xtime = gap.change_date_localTime_only_time(date.toString());		
			bun = xdate + time.replace(":","");
		}		
		date = String(date).substring(0,8);				
		var html = "";
		var cnt = $("#" + draw_dis + " #web_chat_dis_" + date).length;
		var dis_date = gap.change_date_default(gap.search_today_only3(date));
		var dis_id = "date_" + date;
		if (cnt == 0){
			html += "	<div class='wrap-chat' id='web_chat_dis_"+date+"' style='margin-top:30px'>";
			html += "		<div class='date' id='"+dis_id+"'><span>"+dis_date+"</span></div>";
			html += "   </div>";			
			var hx = $("#"+draw_dis_parent +" .wrap-chat").length;		
			if (hx == 0){		
				$("#" + draw_dis).html(html);
			}else{
				if (init != "D"){
					if (init == "F"){						
						$(html).insertBefore($("#"+draw_dis_parent+ " .wrap-chat").first());
					}else{						
						if (croom_key != ""){
							if (croom_key == gBody.cur_cid){
								$(html).insertAfter($("#"+gBody.chat_show_dis+ " .wrap-chat").last());
							}else if (croom_key == gma.cur_cid_popup){
								//$(html).insertAfter($("#"+gBody.chat_show_popup_sub+ " .wrap-chat").last());
							}
						}else{
							$(html).insertAfter($("#"+draw_dis_parent+ " .wrap-chat").last());
						}						
					}								
				}else{
					//$("#" + draw_dis).children().last().append(html);		
					$("#" + draw_dis).append(html);	
					if (gBody.cur_cid == gma.cur_cid_popup){
						//직접입력하는 경우 하단과 팝업 채팅창 모두 표시해야 한다.
						if (draw_dis == "chat_msg_dis"){
							$("#alarm_chat_sub").append(html);	
						}else if (draw_dis == "alarm_chat_sub"){
							$("#chat_msg_dis").append(html);	
						}
					}	
				}			
			}
		}		
		var html = "";
		var person_img = "";
		if (opt == "me"){
			person_img = gap.person_profile_photo(gap.cur_room_att_info_list_search(key));
		}else{
			person_img = gap.person_profile_photo(pxuser);
		}
//		아래 소스를 적용하면 스크롤해서 다음 데이터를 찾아오는 것이 가능하지만 대화 꼬리 이미지를 제거하기 못해 신규 메시지 형태로 표시한다.
		var bol = false;
		if (init == "F"){	
			var ttm = $("#"+draw_dis_parent+" .time").first();			
			if (gma.chat_position == "channel" || gma.chat_position == "popup_chat"){
				ttm = $("#" + draw_dis + " .time").first();
			}
			var xxt = gBody.lastchatter.substring(10, gBody.lastchatter.length);
			var nx = gBody.lastchatter.slice(0,-5) + ttm.html().substring(0,5);
			if (nx == key + date + time){
				bol = true;
			}
		}else{
			if (gBody.lastchatter == key + date + time){
				if ($("#" + draw_dis + " .wrap-message").last().parent().parent().attr("class") == opt){
					bol = true;
				}else{
					bol = false;
				}		
				//bol = true;
			}
		}				
		var caller = "2"		
		if (typeof(info.ex) != "undefined" && typeof(info.ex.caller) != "undefined"){
			caller = info.ex.caller;
		}
		if (type == "file"){					
			var icon = gap.file_icon_check(filename);		
			var show_video = gap.file_show_video(filename);
			if ( (bol) && (gBody.last_enter_type != "ogtag"  && gBody.last_enter_type != "emoticon")){				
				html += "		<br id='br_"+msgid+"'>";
				if (opt == "me"){
					if (tp == "log"){
						html += "		<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"' style='margin-top:25px'>";
					}else{
						html += "		<div class='wrap-message disabled' id='"+msgid+"' mid='"+msgid+"' style='margin-top:25px'>";
					}					
				}else{
					html += "		<div class='wrap-message'  id='"+msgid+"' mid='"+msgid+"' style='margin-top:25px'>";
				}				
				if (show_video){
					html += "			<div class='chat-attach' data='"+filename+"' data2='"+downloadurl+"' data3='"+filesize+"' onclick=\"gap.show_video('"+downloadurl+"', '"+filename+"')\">";
				}else{
					html += "			<div class='chat-attach' data='"+filename+"' data2='"+downloadurl+"' data3='"+filesize+"' data4='"+caller+"'>";
				}				
				html += "				<div>";
				html += "					<span class='ico ico-file "+icon+"' ></span>";
				html += "					<dl style='margin-right:15px'>";
				if (show_video){
					html += "						<dt title='"+gap.lang.pv+"'>"+filename+"</dt>";
				}else{
					html += "						<dt>"+filename+"</dt>";
				}				
				html += "						<dd>"+gap.file_size_setting(filesize)+"</dd>";
				html += "					</dl>";			
				html += "					<button class='ico btn-file-download' title='File download' style='right:15px'>다운로드</button>";
				if (gap.check_preview_file(filename)){
					html += "					<button class='ico btn-file-view' data-key='"+key+"' title='File preview'  style='right:38px'>preview</button>";
				}				
				html += "				</div>";
				html += "			</div>";
				if (opt == "me"){
					if (tp != "log"){
						html += "			<button class='ico btn-chat-resend'>재전송</button>";
					}					
					if (!gBody.is_my_chat){
						html += "			<button class='ico btn-chat-more on'>더보기</button>";
					}
				}else{
					html += "			<button class='ico btn-chat-more on'>더보기</button>";
				}				
				html += "		</div>";				
				if (opt == "me"){
					if (init == "D"){
						if (isonetoone){
							html += "		<div class='time'  id='time_"+bun+"' data='"+msgid+"' >"+time+"<span class='ico-new' style='display:none'></span></div>";
						}else{
							html += "		<div class='time'  id='time_"+bun+"' data='"+msgid+"'>"+time+"</div>";
						}						
					}else{
						html += "		<div class='time'  id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";
					}							
					if (!gBody.is_my_chat){
						if (ucnt > 0){
							html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
						}
					}						
				}else{
					html += "		<div class='time' style='margin-left:10px' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";
					
					if (!gBody.is_my_chat && !isonetoone){
						if (ucnt > 0){
							html += "				<span class='ucnt' style='margin-left:10px' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
						}
					}	
				}			
				if (init == "T" || init == "D"){					
					var lastObj = $("#" + draw_dis_parent + " ."+opt+"").last().attr("id");
					var obj = $("#" + draw_dis_parent + " .wrap-message").last().parent().parent().find(".time");
					//$(obj).parent().append(html);		
					
					if (croom_key != "" && croom_key == gBody.cur_cid){
						$(obj).parent().append(html);
					}else if (croom_key != "" && croom_key == gma.cur_cid_popup){
						$(obj).parent().append(html);
					}else if (croom_key == ""){
						$(obj).parent().append(html);
					}
					
					if (init == "D"){
						if (gBody.cur_cid == gma.cur_cid_popup){
							//직접입력하는 경우 하단과 팝업 채팅창 모두 표시해야 한다.
							if (draw_dis == "chat_msg_dis"){
								var lastObj = $("#alarm_chat_sub ."+opt+"").last().attr("id");
								var obj = $("#alarm_chat_sub .wrap-message").last().parent().parent().find(".time");
								$(obj).parent().append(html);
							}else if (draw_dis == "alarm_chat_sub"){
								var lastObj = $("#chat_msg_dis ."+opt+"").last().attr("id");
								var obj = $("#chat_msg_dis .wrap-message").last().parent().parent().find(".time");
								$(obj).parent().append(html);
							}
						}						
					}else{
						if (gma.chat_position == "popup_chat" && draw_dis != "alarm_chat_sub"){
							var obj = $("#alarm_chat_sub" + " .wrap-message").last().parent().parent().find(".time");
							$(obj).parent().append(html);
						}
					}				
					if (init == "D"){
						//연속으로 입력할때 그룹을 매칭되면 상단에 있는 메시지에 읽지 않음 메시지를 표시해야 한다.						
						var objx = $("#" + draw_dis + " .wrap-message").last().prev().prev();
						var xxid = $(objx).attr("id");
						var mdata = $(objx).attr("mdata");							
						var cur_chatroom_last_read = gBody.last_other_read_id;					
						if (isonetoone){
							if ((cur_chatroom_last_read < parseFloat(mdata)) || typeof(mdata) == "undefined"){
								//typeof(mdata) == "undefined" 일 경우는 첫메시지 체크 전송 체크 이전에 바로 다음 메시지를 발송한 경우
								objx.append("<span class='ico-new' style='display:none' id=\"ico-new_"+xxid+"\" data='"+mdata+"'></span>");
							}
						}												
						var kyk = $("#" + draw_dis + " .wrap-message").last();
						var cck = $(kyk).attr("id");						
						if (isonetoone){
							var isNewicon = $(kyk).find(".ico-new");
							if (isNewicon.length == 0){
								var ccid = $(kyk).attr("mid");
								if ((cur_chatroom_last_read < parseFloat(mdata)) || typeof(ccid) == "undefined"){								
									$(kyk).next().append("<span class='ico-new' style='display:none' id=\"ico-new_"+xxid+"\" data='"+ccid+"'></span>");
								}
							}		
						}						
						if (gBody.cur_cid == gma.cur_cid_popup){
							//직접입력하는 경우 하단과 팝업 채팅창 모두 표시해야 한다.
							if (draw_dis == "chat_msg_dis"){
								gBody.change_setting_position_file("alarm_chat_sub", isonetoone);
							}else if (draw_dis == "alarm_chat_sub"){
								gBody.change_setting_position_file("chat_msg_dis", isonetoone);
							}
						}	
					}else{
						$(obj).attr("data", msgid);
					}					
				}else{
					var lastObj = bun;
					var ll = $("#" + draw_dis + " #time_" + lastObj).parent().first();
					$(html).prependTo(ll);					
				}					
				html = "";
			}else{
				html += "<div class='"+opt+"' id='"+bun+"' data='"+key +"^" + date+"^" + time+"'> ";   //disabled				
				html += "	<div class='user' >";
				html += "		<div class='user-thumb' data='"+userinfo.ky+"' data4='"+userinfo.nm+"'>"+person_img+"</div>";
				html += "	</div>";				
				if (opt == "me"){
					if (dept != ""){
						html += "	<div class='name'>"+name + gap.lang.hoching + " | " + dept + "</div>";
					}else{
						html += "	<div class='name'>"+name + gap.lang.hoching +"</div>";
					}
				}else{
					html += "	<div class='name'>"+ xuser +"</div>";
				}			
				html += "	<div class='talk'>";
				html += "		<br id='br_"+msgid+"'>";
				if (opt == "me"){
					if (tp == "log"){
						html += "		<div class='wrap-message'  id='"+msgid+"' mid='"+msgid+"'>";
					}else{
						html += "		<div class='wrap-message disabled'  id='"+msgid+"' mid='"+msgid+"'>";
					}					
				}else{
					html += "		<div class='wrap-message'  id='"+msgid+"' mid='"+msgid+"'>";
				}				
				if (show_video){
					html += "			<div class='chat-attach' data='"+filename+"' data2='"+downloadurl+"'  data3='"+filesize+"' onclick=\"gap.show_video('"+downloadurl+"', '"+filename+"')\">";
				}else{
					html += "			<div class='chat-attach' data='"+filename+"' data2='"+downloadurl+"'  data3='"+filesize+"' data4='"+caller+"'>";
				}				
				html += "				<div>";
				html += "					<span class='ico ico-file "+icon+"' ></span>";
				html += "					<dl style='margin-right:15px'>";
				if (show_video){
					html += "						<dt title='"+gap.lang.pv+"'>"+filename+"</dt>";
				}else{
					html += "						<dt>"+filename+"</dt>";
				}				
				html += "						<dd>"+gap.file_size_setting(filesize)+"</dd>";
				html += "					</dl>";				
				html += "					<button class='ico btn-file-download' title='File download' style='right:15px'>다운로드</button>";
				if (gap.check_preview_file(filename)){
					html += "					<button class='ico btn-file-view' data-key='"+key+"' title='File preview' style='right:38px'>preview</button>";
				}				
				html += "				</div>";
				html += "			</div>";
				if (opt == "me"){
					if (tp != "log"){
						html += "			<button class='ico btn-chat-resend'>재전송</button>";
					}					
					if (!gBody.is_my_chat){
						html += "			<button class='ico btn-chat-more on'>더보기</button>";
					}
				}else{
					html += "			<button class='ico btn-chat-more on'>더보기</button>";
				}				
				html += "		</div>";
				if (opt == "me"){
					if (init == "D"){
						if (isonetoone){
							html += "		<div class='time'  id='time_"+bun+"' data='"+msgid+"' >"+time+"<span class='ico-new' style='display:none'></span></div>";
						}else{
							html += "		<div class='time'  id='time_"+bun+"' data='"+msgid+"'>"+time+"</div>";
						}						
					}else{
						html += "		<div class='time'  id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";
					}					
					if (!gBody.is_my_chat){
						if (ucnt > 0){
							html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
						}
					}					
				}else{
					html += "		<div class='time'  style='margin-left:10px' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";					
					if (!gBody.is_my_chat && !isonetoone){
						if (ucnt > 0){
							html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
						}
					}
				}				
				html += "	</div>";
				html += "</div>";	
			}			
		}else{
			//이미지 일 경우		
			
			if ( (bol) && (gBody.last_enter_type != "ogtag" && gBody.last_enter_type != "emoticon")){
				
				html += "		<br id='br_"+msgid+"'>";				
				if (opt == "me"){
					if (tp == "log"){
						html += "		<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"'>";
					}else{
						html += "		<div class='wrap-message disabled' id='"+msgid+"' mid='"+msgid+"'>";
					}					
				}else{
					html += "		<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"'>";
				}
				
				
				if ($.isArray(filename) && filename.length > 1){
					var nwidth = "300px";
					if (filename.length == 2){
						nwidth = "200px";
					}
					//border:1px solid #e9e7e7;
					if (opt == "me"){
						html += "<div class='grid-container' style='display:flex; flex-wrap:wrap; gap:3px ; max-width:201px; justify-content:flex-end'>"
					}else{
						html += "<div class='grid-container' style='display:flex; flex-wrap:wrap; gap:3px ; max-width:201px'>"
					}
					
					for (var e = 0 ; e < filename.length; e++){
						var fns = filename[e];
						var sns = filesize[e];
						var dns = downloadurl[e];
						var pns = previewurl[e];
						var spln = dns.split("/");
						var thumb = spln[0] + "//" + spln[2] + "/" + spln[3] + "/" + spln[5] + "/thumbnail/" + spln[6];					
						html += "<div class='grid-item' data='"+fns+"' data2='"+dns+"' data3='"+sns+"' data4='"+e+"' data5='"+msgid+"' style=\"cursor:pointer; margin-bottom:2px; border:1px solid #e9e7e7;background-image:url('"+thumb+"'); width:65px; height:80px; background-size:cover; display:flex; align-items:center; justify-content:center\">";
												
					//	html += "<img src='"+dns+"' style='' onerror='this.src=\"img/thm_img.png\"' id='pimg_"+msgid+"' alt=''>";
						html += "</div>";
					}
					html += "</div>";	
				}else{
					html += "			<div class='img-content' data='"+filename+"' data2='"+downloadurl+"'  data3='"+filesize+"'>";				
					if (init == "D"){
						html += "				<div class='img-thumb'><img src='"+downloadurl+"' onerror='this.src=\"../resource/images/thm_img.png\"' alt=''></div>";
					}else{
						html += "				<div class='img-thumb'><img src='"+previewurl+"' onerror='this.src=\"../resource/images/thm_img.png\"' alt=''></div>";
					}				
					html += "				<ul style='list-style:none'>";
					html += "					<li class='img-title'>"+filename+"</li>";
					html += "					<li class='img-size'>"+gap.file_size_setting(filesize)+"</li>";
					html += "					<li class='img-btns'>";
					html += "						<button class='ico btn-view' title='Full Screen'>크게보기</button>";
					html += "						<button class='ico btn-download' title='File download'>다운로드</button>";
					html += "					</li>";
					html += "				</ul>";
					html += "			</div>";
				
				}			
				
				if (opt == "me"){
					if (tp != "log"){
						html += "			<button class='ico btn-chat-resend'>재전송</button>";
					}					
					if (!gBody.is_my_chat){
						html += "			<button class='ico btn-chat-more on'>더보기</button>";
					}			
				}else{
					html += "			<button class='ico btn-chat-more on'>더보기</button>";
				}	
				html += "		</div>";				
				if (opt == "me"){
					if (init == "D"){			
						if (isonetoone){
							html += "		<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"<span class='ico-new' style='display:none'></span></div>"; 
						}else{
							html += "		<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>"; 
						}						
					}else{
						html += "		<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";      //<span class='ico-new'></span>신규 메시지 일 경우
					}							
					if (!gBody.is_my_chat){
						if (ucnt > 0){
							html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
						}
					}				
				}else{
					html += "		<div class='time' style='margin-left:10px' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";					
					if (!gBody.is_my_chat && !isonetoone){
						if (ucnt > 0){
							html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
						}
					}
				}				
				if (init == "T" || init == "D"){
					var lastObj = $("#"+draw_dis_parent+" ."+opt+"").last().attr("id");					
					var obj = $("#" + draw_dis_parent + " .wrap-message").last().parent().parent().find(".time");
					if (croom_key != "" && croom_key == gBody.cur_cid){
						$(obj).parent().append(html);
					}else if (croom_key != "" && croom_key == gma.cur_cid_popup){
						$(obj).parent().append(html);
					}else if (croom_key == ""){
						$(obj).parent().append(html);
					}
											
					if (init == "D"){
						if (gBody.cur_cid == gma.cur_cid_popup){
							//직접입력하는 경우 하단과 팝업 채팅창 모두 표시해야 한다.
							if (draw_dis == "chat_msg_dis"){
								var lastObj = $("#alarm_chat_sub ."+opt+"").last().attr("id");					
								var obj = $("#alarm_chat_sub .wrap-message").last().parent().parent().find(".time");
								$(obj).parent().append(html);	
							}else if (draw_dis == "alarm_chat_sub"){
								var lastObj = $("#chat_msg_dis ."+opt+"").last().attr("id");					
								var obj = $("#chat_msg_dis .wrap-message").last().parent().parent().find(".time");
								$(obj).parent().append(html);	
							}
						}						
					}else{
						if (gma.chat_position == "popup_chat" && draw_dis != "alarm_chat_sub"){					
							var obj = $("#alarm_chat_sub" + " .wrap-message").last().parent().parent().find(".time");
							$(obj).parent().append(html);
						}
					}			
					obj = $("#" + draw_dis + " .wrap-message").last().parent().parent().find(".time");					
					if (init == "D"){
						//연속으로 입력할때 그룹을 매칭되면 상단에 있는 메시지에 읽지 않음 메시지를 표시해야 한다.					
						var objx = $("#" + draw_dis + " .wrap-message").last().prev().prev();
						var xxid = $(objx).attr("id");
						var mdata = $(objx).attr("mdata");							
						var cur_chatroom_last_read = gBody.last_other_read_id;					
						if (isonetoone){
							if ((cur_chatroom_last_read < parseFloat(mdata)) || typeof(mdata) == "undefined"){
								//typeof(mdata) == "undefined" 일 경우는 첫메시지 체크 전송 체크 이전에 바로 다음 메시지를 발송한 경우
								objx.append("<span class='ico-new' style='display:none' id=\"ico-new_"+xxid+"\" data='"+mdata+"'></span>");
							}													
							var kyk = $("#" + draw_dis + " .wrap-message").last();
							var cck = $(kyk).attr("id");
							var isNewicon = $(kyk).find(".ico-new");
							if (isNewicon.length == 0){
								var ccid = $(kyk).attr("mid");
								if ((cur_chatroom_last_read < parseFloat(mdata)) || typeof(ccid) == "undefined"){									
									$(kyk).next().append("<span class='ico-new' style='display:none' id=\"ico-new_"+xxid+"\" data='"+ccid+"'></span>");
								}
							}
						}						
						if (gBody.cur_cid == gma.cur_cid_popup){
							//직접입력하는 경우 하단과 팝업 채팅창 모두 표시해야 한다.
							if (draw_dis == "chat_msg_dis"){
								gBody.change_setting_position("alarm_chat_sub", isonetoone);
							}else if (draw_dis == "alarm_chat_sub"){
								gBody.change_setting_position("chat_msg_dis", isonetoone);
							}
						}	
					}else{
						$(obj).attr("data", msgid);
					}
				}else{
					//var lastObj = date + time.replace(":","");
					var lastObj = bun;
					var ll = $("#" + draw_dis + " #time_" + lastObj).parent().first();
					$(html).prependTo(ll);				
				}			
				html = "";				
			}else{			
				
				html += "<div class='"+opt+"' id='"+bun+"' data='"+key +"^" + date+"^" + time+"'>";   //disabled				
				html += "	<div class='user' >";				
				html += "		<div class='user-thumb' data='"+userinfo.ky+"' data4='"+userinfo.nm+"'>"+person_img+"</div>";
				html += "	</div>";			
				if (opt == "me"){
					if (dept != ""){
						html += "	<div class='name'>"+name + gap.lang.hoching + " | " + dept +"</div>";
					}else{
						html += "	<div class='name'>"+name + gap.lang.hoching +"</div>";
					}
				}else{
					html += "	<div class='name'>"+ xuser +"</div>";
				}			
				
				
				html += "	<div class='talk img'>";
				html += "		<br id='br_"+msgid+"'>";
				if (opt == "me"){
					if (tp == "log"){
						html += "		<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"'>";
					}else{
						html += "		<div class='wrap-message disabled' id='"+msgid+"' mid='"+msgid+"'>";
					}					
				}else{
					html += "		<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"'>";
				}		
				
				
				if ($.isArray(filename)){
					var nwidth = "300px";
					if (filename.length == 2){
						nwidth = "200px";
					}
					//border:1px solid #e9e7e7;
					if (opt == "me"){
						html += "<div class='grid-container' style=' display:flex; flex-wrap:wrap; gap:3px ; max-width:201px; justify-content:flex-end'>"
					}else{
						html += "<div class='grid-container' style=' display:flex; flex-wrap:wrap; gap:3px ; max-width:201px '>"
					}
				
						for (var e = 0 ; e < filename.length; e++){
							var fns = filename[e];
							var sns = filesize[e];
							var dns = downloadurl[e];
							var pns = previewurl[e];
							
							var spln = dns.split("/");
							var thumb = spln[0] + "//" + spln[2] + "/" + spln[3] + "/" + spln[5] + "/thumbnail/" + spln[6];						
							html += "<div class='grid-item' data='"+fns+"' data2='"+dns+"' data3='"+sns+"' data4='"+e+"' data5='"+msgid+"' style=\"cursor:pointer; margin-bottom:2px; border:1px solid #e9e7e7;background-image:url('"+thumb+"'); width:65px; height:80px; background-size:cover; display:flex; align-items:center; justify-content:center\">";
														
						//	html += "<img src='"+dns+"' style='' onerror='this.src=\"img/thm_img.png\"' id='pimg_"+msgid+"' alt=''>";
							html += "</div>";
						}
					html += "</div>";	
				}else{
					html += "			<div class='img-content' data='"+filename+"' data2='"+downloadurl+"'  data3='"+filesize+"'>";				
					if (init == "D"){
						html += "				<div class='img-thumb'><img src='"+downloadurl+"' onerror='this.src=\"../resource/images/thm_img.png\"' id='pimg_"+msgid+"' alt=''></div>";
					}else{
						html += "				<div class='img-thumb'><img src='"+previewurl+"' onerror='this.src=\"../resource/images/thm_img.png\"' alt=''></div>";
					}				
					
					html += "				<ul style='list-style:none'>";
					html += "					<li class='img-title'>"+filename+"</li>";
					html += "					<li class='img-size'>"+gap.file_size_setting(filesize)+"</li>";
					html += "					<li class='img-btns'>";
					html += "						<button class='ico btn-view' title='Full Screen'>크게보기</button>";
					html += "						<button class='ico btn-download' title='File download'>다운로드</button>";
					html += "					</li>";
					html += "				</ul>";
					html += "			</div>";
				}
						
				if (opt == "me"){
					if (tp != "log"){
						html += "			<button class='ico btn-chat-resend'>재전송</button>";
					}					
					if (!gBody.is_my_chat){
						html += "			<button class='ico btn-chat-more on'>더보기</button>";
					}
				}else{
					html += "			<button class='ico btn-chat-more on'>더보기</button>";
				}			
				html += "		</div>";			
				if (opt == "me"){
					if (init == "D"){			
						if (isonetoone){
							html += "		<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"<span class='ico-new' style='display:none'></span></div>"; 
						}else{
							html += "		<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>"; 
						}						
					}else{
						html += "		<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";      //<span class='ico-new'></span>신규 메시지 일 경우
					}					
					if (!gBody.is_my_chat){
						if (ucnt > 0){
							html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
						}
					}
				}else{
					html += "		<div class='time' style='margin-left:10px' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";					
					if (!gBody.is_my_chat && !isonetoone){
						if (ucnt > 0){
							html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
						}
					}
				}				
				html += "	</div>";
				html += "</div>";
			}		
		}	
		if (html != ""){
			if (init == "T" || init == "D"){				
				var ccid = gBody.cur_cid;
				if (draw_dis == "alarm_chat_sub"){
					ccid = gma.cur_cid_popup;
				}			
				if ( croom_key == "" || croom_key== ccid){
					$("#" + draw_dis + " #web_chat_dis_"+date).append(html);
					$("#" + draw_dis + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
				}				
				if (init == "D"){
					if (gBody.cur_cid == gma.cur_cid_popup){
						if (draw_dis == "chat_msg_dis"){
							$("#alarm_chat_sub" + " #web_chat_dis_"+date).append(html);
							$("#alarm_chat_sub" + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");						
						}else if (draw_dis == "alarm_chat_sub"){
							$("#chat_msg_dis" + " #web_chat_dis_"+date).append(html);
							$("#chat_msg_dis" + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
							
						}
					}	
				}else{
					if (draw_dis != "alarm_chat_sub"){
						if (croom_key == "" || croom_key == gma.cur_cid_popup){
							if (!gma.click_left_menu){
								$("#alarm_chat_sub" + " #web_chat_dis_"+date).append(html);
								$("#alarm_chat_sub" + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
							}
						}
					}
				}										

			}else{				
				$(html).insertAfter("#" + draw_dis + " #date_"+date);
			}			
		}else{
			//중간단계 메시지 위치를 조정한다.
			$("#alarm_chat_sub" + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
			$("#chat_msg_dis" + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
		}			
	//	if (opt == "me"){
			gBody.delete_icon_action();
	//	}		
		if (type == "file"){
			gBody.chat_att_drag_action();			
			//텍스트 내용 더블 클릭하면 복사할 수 있게 영역을 잡아 준다.
			$(".chat-attach dt").on("dblclick", function(){						
				if (document.selection) { // IE
			        var range = document.body.createTextRange();
			        range.moveToElementText($(this)[0]);
			        range.select();
			     } else if (window.getSelection) {
			        var range = document.createRange();
			        range.selectNode($(this)[0]);
			        window.getSelection().removeAllRanges();
			        window.getSelection().addRange(range);
			    }				
			});				
		}else{
			gBody.image_file_drag_action();
		}		
		gBody.img_open();
		gBody.img_open2();
		gBody.user_profile_popup();			
		

		if (init == "D" || init == "T"){
			
			gap.scroll_move_to_bottom_time(draw_dis_parent, 1000);	
			
			if (init == "D"){
				if (gBody.cur_cid == gma.cur_cid_popup){
					//동시 작성되는 화면에 자동 스크롤 내린다.
					if (draw_dis_parent == gBody.chat_show){
						gap.scroll_move_to_bottom_time(gBody.chat_show_popup, 1000);
					}else{
						gap.scroll_move_to_bottom_time(gBody.chat_show, 1000);
					}
				}		
			}
			
		}		
		
		gBody.lastchatter = key + date + time;	
		gBody.last_enter_id = msgid;
		gBody.last_enter_type = type;	
	},
	
	
	"load_image" : function(id, url){
		var image = $("#" + id)[0];
		var downloadingImage = new Image();
		downloadingImage.onload = function(){
		    image.src = this.src;   
		};
		downloadingImage.src = url;
	},	
	
	"ogtag_draw" : function(opt, key, time, linkurl, url, title, desc, domain, str, date, msgid, tp, init, ucnt, trans, name, ek, croom_key){
		var xmlen = gBody.cur_room_att_info_list.length-1;  //삭제를 위한 카운트 설정 읽지 않은 건수와 비교
		var draw_dis = gBody.chat_show_dis;
		var draw_dis_parent = gBody.chat_show;		
		if (typeof(ek) != "undefined" && ek != ""){
			if (ek.indexOf("channel") > -1){
				draw_dis = gBody.chat_show_channel_sub;
				draw_dis_parent = gBody.chat_show_channel;
			}else if (ek.indexOf("popup") > -1 || gma.chat_position == "popup_chat"){
				draw_dis = gBody.chat_show_popup_sub;
				draw_dis_parent = gBody.chat_show_popup;
			}
		}			
		var tpro = "https:";
		if (typeof(url) != "undefined"){
			if (url.indexOf("http") > -1){
				var bun = url.indexOf("//");
				tpro = url.substring(0, bun);
			}
		}		
		if ($.isArray(linkurl)){
			linkurl = linkurl[0];
		}		
		var isDsDrive = false;
		if (typeof(linkurl) != "undefined"){
			if (linkurl.indexOf("http") < 0){
				if (tpro != ""){
					linkurl = tpro + "//" + linkurl;
				}
			}			
			if (linkurl.indexOf("drive.daesang.com") > -1){
				isDsDrive = true;
			}
		}		
		str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;');		
		str = gBody.message_check(str);
		str = str.replace(/[\n]/gi, "<p style='height:5px'></p>");		
		var istrans = false;		
		if (typeof(trans) != "undefined" && trans != ""){
			istrans = true;
			tmsg = trans.msg;
			tmsg = tmsg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
			tmsg = tmsg.replace(/[\n]/gi, "<p style='height:5px'></p>");		
			tx = trans.lang;
		}		
		var isonetoone = gap.search_is_onetoone();		
		var userinfo = gap.cur_room_att_info_list_search(key);	
		var person_img = gap.person_profile_photo(gap.cur_room_att_info_list_search(key));
		var xuser = "";		
		if (typeof(userinfo) != "undefined"){
			var sxuser = gap.user_check(userinfo);
			var xuser = sxuser.disp_user_info;
		}else{
			pxuser = gap.cur_room_att_person_img_info_search4(key, croom_key);	
			if (typeof(pxuser) != "undefined"){
				var sxuser = gap.user_check(pxuser);
				var xuser = sxuser.disp_user_info;
				
				person_img = gap.person_profile_photo(pxuser);
			}else{
				//xuser = name;
				
				if (!userinfo){							
					var ppx = gap.search_user_emp(key);							
					ppx = JSON.parse(ppx.responseText);		
					if (ppx[0].length == 0){
						//퇴사자으이 경우
						xuser = name ; //+ " | " + dept;
						var userinfo = new Object();
						userinfo.ky = key;
						userinfo.nm = "";
					}else{
						userinfo = ppx[0][0];
						pxuser = userinfo;
						var sxuser = gap.user_check(pxuser);
						xuser = sxuser.disp_user_info;
					}						
				}
			}
			
		}		
		var name = "";
		var dept = "";
		if (typeof(userinfo) == "undefined"){
			name = gap.search_username(key);
		}else{
			if (opt == "me"){
				name = userinfo.nm;
			}else{					
			}	
		}		
		var bun = new Date().getTime();  //<== 나중에 메신지 키로 변경해야 한다.		
		var xdate = new Date();		
		var today = xdate.YYYYMMDD();		
		var html = "";
		var cnt = $("#" + draw_dis + " #web_chat_dis_" + date).length;
		var dis_date = gap.change_date_default(gap.search_today_only3(date));
		var dis_id = "date_" + date;
		if (cnt == 0){
			html += "	<div class='wrap-chat' id='web_chat_dis_"+date+"' style='margin-top:30px'>";
			html += "		<div class='date' id='"+dis_id+"'><span>"+dis_date+"</span></div>";
			html += "   </div>";			
			var hx = $("#"+draw_dis_parent+" .wrap-chat").length;			
			if (hx == 0){
				$("#"+ draw_dis).html(html);								
			}else{
				if (init != "D"){
					//기존거 위에다 표시해야 한다.
					if (init == "F"){
						$(html).insertBefore($("#"+draw_dis_parent+" .wrap-chat").first());
					}else{						
						if (croom_key != ""){
							if (croom_key == gBody.cur_cid){
								$(html).insertAfter($("#"+gBody.chat_show_dis+ " .wrap-chat").last());
							}else if (croom_key == gma.cur_cid_popup){
								//$(html).insertAfter($("#"+gBody.chat_show_popup_sub+ " .wrap-chat").last());
							}
						}else{
							$(html).insertAfter($("#"+draw_dis_parent+" .wrap-chat").last());
						}					
					}								
				}else{
					$("#" + draw_dis).append(html);				
					if (gBody.cur_cid == gma.cur_cid_popup){
						//직접입력하는 경우 하단과 팝업 채팅창 모두 표시해야 한다.
						if (draw_dis == "chat_msg_dis"){
							$("#alarm_chat_sub").append(html);	
						}else if (draw_dis == "alarm_chat_sub"){
							$("#chat_msg_dis").append(html);	
						}
					}
				}				
			}
		}		
		var html = "";
		html += "		<div class='"+opt+"' data='"+key +"^" + date+"^" + time+"'>";
		html += "			<div class='user' >";
		
		html += "				<div class='user-thumb' data='"+userinfo.ky+"' data4='"+userinfo.nm+"'>"+person_img+"</div>";
		html += "			</div>";		
		if (opt == "me"){
			if (dept != ""){
				html += "			<div class='name'>"+name + gap.lang.hoching + " | " + dept +"</div>";
			}else{
				html += "			<div class='name'>"+name + gap.lang.hoching+"</div>";
			}
		}else{
			html += "			<div class='name'>"+ xuser +"</div>";
		}		
		if (tp == "log"){
			html += "			<div class='talk link' id='"+msgid+"' mid='"+msgid+"'>";	
		}else{
			if (opt == "me"){
				html += "			<div class='talk link disabled' id='"+msgid+"'>";	
			}else{
				html += "			<div class='talk link' id='"+msgid+"'>";	
			}
		}				
		if ( (url == "") || (typeof(url) == "undefined") ){				
			if (opt == "me"){
				html += "		<div class='wrap-message ' id='"+bun+"' mid='"+bun+"'>";
			}else{
				html += "		<div class='wrap-message' id='"+bun+"' mid='"+bun+"'>";
			}			
			html += "				<div class='balloon' ><div>";
			html += "					<span class='tail ico'></span>";			
			if (istrans){
				if (opt == "me"){
					html += "				<span id='msg_"+bun +"_" + msgid +"' class='trans_me1'>"+str+"</span>";
					html += "					<span class='trans_gap'><span class='trans_me2'>"+ tx + "</span> " + tmsg+"</span>";
					html += "				</div></div>";
				}else{
					html += "				<span id='msg_"+bun +"_" + msgid +"' class='trans_you1'>"+str+"</span>";
					html += "					<span class='trans_gap'><span class='trans_you2'>"+ tx + "</span> " + tmsg+"</span>";
					html += "				</div></div>";
				}
			}else{
				html += "				<span id='msg_"+bun +"_" + msgid +"' class='xgptcls'>"+str+"</span></div></div>";
			}					
			html += "               <br>";				
			if (opt == "me"){
				if (tp == "log"){
					if (ucnt == xmlen && !gBody.is_my_chat){
						html += "					<button class='ico btn-chat-more on mk'>더보기</button>";
					}
				}else{
					html += "					<button class='ico btn-chat-resend'>재전송</button>";
					if (ucnt == xmlen && !gBody.is_my_chat){
						html += "					<button class='ico btn-chat-more on mk'>더보기</button>";
					}
				}
			}else{
				html += "					<button class='ico btn-chat-more on mk'>더보기</button>";
			}		
			html += "					</div>";
			if (opt == "me"){
				if (init == "D"){
					if (isonetoone){
						html += "					<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"<span class='ico-new' style='display:none' id=\"ico-new_"+msgid+"\"></span></div>";
					}else{
						html += "					<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";
					}					
				}else{
					html += "					<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";
				}				
				if (!gBody.is_my_chat){
					if (ucnt > 0){
						html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
					}
				}					
			}else{
				html += "					<div class='time' style='margin-left:10px' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";				
				if (!gBody.is_my_chat && !isonetoone){
					if (ucnt > 0){
						html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
					}
				}
			}		
			html += "				</div>";
			html += "			</div>";	
		}else{
			html += "				<div class='balloon' data='"+linkurl+"'><div>";		
			html += "					<span class='tail ico'></span>";			
			if (istrans){
				if (opt == "me"){
					html += "				<span id='msg_"+bun +"_" + msgid +"' class='trans_me1'>"+str+"</span>";
					html += "					<span class='trans_gap'><span class='trans_me2'>"+ tx + "</span> " + tmsg+"</span>";
					html += "				</div></div>";
				}else{
					html += "				<span id='msg_"+bun +"_" + msgid +"' class='trans_you1'>"+str+"</span>";
					html += "					<span class='trans_gap'><span class='trans_you2'>"+ tx + "</span> " + tmsg+"</span>";
					html += "				</div></div>";
				}
			}else{
				if (opt == "me"){
					html += "				<span id='msg_"+ msgid +"' class='xgptcls'>"+str+"</span>";
					
					html += "				</div></div>";
				}else{
					html += "				<span id='msg_"+bun +"_" + msgid +"' class='xgptcls'>"+str+"</span></div></div>";
				}
			}				
			html += "               <br>"			
			if (opt == "me"){
				html += "		<div class='wrap-message ' id='"+bun+"' mid='"+bun+"'>";
			}else{
				html += "		<div class='wrap-message' id='"+bun+"' mid='"+bun+"'>";
			}		
			if (!isDsDrive){
				var og_img = gap.og_url_check(url);
				html += "						<div class='link-content' onclick=\"gap.goP('"+linkurl+"'); return false;\">";
				html += "							<a href='#' target='_blank'>";
			//	html += "								<div class='link-thumb'><img src='"+url+"' onerror='this.src=\"img/thm_link.png\"' alt='' /></div>";
				html += "								<div class='link-thumb'>"+og_img+"</div>";
				html += "								<ul>";
				html += "									<li class='link-title'>"+title+"</li>";
				html += "									<li class='link-summary'>"+desc+"</li>";
				html += "									<li class='link-site' onclick=\"gap.goP('"+domain+"');return false;\">"+domain+"</li>";
				html += "								</ul>";
				html += "							</a>";
				html += "						</div>";
			}			
			if (opt == "me"){
				if (tp == "log"){
					if (!gBody.is_my_chat){
						html += "					<button class='ico btn-chat-more on mk'>더보기</button>";
					}
				}else{
					html += "					<button class='ico btn-chat-resend'>재전송</button>";
					if (!gBody.is_my_chat){					
						html += "					<button class='ico btn-chat-more on mk'>더보기</button>";					
					}
				}
			}else{
				html += "					<button class='ico btn-chat-more on mk'>더보기</button>";	
			}
			html += "					</div>";
			if (opt == "me"){
				if (init == "D"){	
					if (isonetoone){
						html += "					<div class='time' id='time_"+bun+"' data='"+msgid+"'>"+time+"<span class='ico-new' style='display:none' id=\"ico-new_"+msgid+"\"></span></div>";
					}else{
						html += "					<div class='time' id='time_"+bun+"' data='"+msgid+"'>"+time+"</div>";
					}					
				}else{
					html += "					<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";
				}				
				if (!gBody.is_my_chat){
					if (ucnt > 0){
						html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
					}
				}
			}else{
				html += "					<div class='time' style='margin-left:10px' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";				
				if (!gBody.is_my_chat && !isonetoone){
					if (ucnt > 0){
						html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
					}
				}
			}		
			html += "				</div>";
			html += "			</div>";
		}		
		if (init == "T" || init == "D"){
			if (croom_key == "" || croom_key== gBody.cur_cid){
				$("#" + draw_dis + " #web_chat_dis_"+date).append(html);			
				$("#" + draw_dis + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
			}
			if (init == "D"){
				if (gBody.cur_cid == gma.cur_cid_popup){
					if (draw_dis == "chat_msg_dis"){
						$("#alarm_chat_sub #web_chat_dis_"+date).append(html);			
						$("#alarm_chat_sub #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
						gap.scroll_move_to_bottom_time(gBody.chat_show_popup, 1000);
					}else if (draw_dis == "alarm_chat_sub"){
						$("#chat_msg_dis #web_chat_dis_"+date).append(html);			
						$("#chat_msg_dis #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
						gap.scroll_move_to_bottom_time(gBody.chat_show, 1000);
					}
				}else{
					if (croom_key== gma.cur_cid_popup){
						$("#alarm_chat_sub #web_chat_dis_"+date).append(html);			
						$("#alarm_chat_sub #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
					}
				}
			}else{
				if (draw_dis != "alarm_chat_sub"){
					if (croom_key == "" || croom_key == gma.cur_cid_popup){
						if (!gma.click_left_menu){
							$("#alarm_chat_sub" + " #web_chat_dis_"+date).append(html);			
							$("#alarm_chat_sub" + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
						}
					}
				}
			}
		}else{
			$(html).insertAfter("#" + draw_dis + " #date_"+date)
		}				
	//	if (opt == "me"){
			gBody.delete_icon_action();
	//	}		
		gBody.user_profile_popup();
		if (init == "D"){
			gap.scroll_move_to_bottom(draw_dis_parent);
		}		
		if (init == "D"){			
			$("#message_txt").val("");
			//$("#message_txt").focus();
			if (gma.chat_position == "popup_chat"){
				$("#alarm_chat_msg").val("");
				$("#alarm_chat_msg").focus();
			}
		}		
		
		
		gBody.msg_drag_action();	
		gBody.lastchatter = key + date + time;	
		gBody.last_enter_id = msgid;
		gBody.last_enter_type = "ogtag";		
		if (init == "D"){
			gBody.last_msg.ty = 4;
			gBody.last_msg.msg = str;		
		}		
		//텍스트 내용 더블 클릭하면 복사할 수 있게 영역을 잡아 준다.
		$(".talk .balloon").single_double_click(function (e) {			
			var linkurl = $(this).attr("data");		
			if (typeof(linkurl) == "undefined" || linkurl == ""){
				var txt = $(this).text().trim();
				linkurl = gBody.findUrls(txt);	
			}else{
			//	gap.goP(linkurl);
			}					
			return false;
		}, function (e) {			
			var id = $(e.target).attr("id");
			gBody.selectText(id);
			e.stopImmediatePropagation()
			return false;
		});	
	},	
	
	"MessageSend" : function(opt, msg, type, name, key, noticekey){
		
		var mlen = $(".wrap-message").length;
		if (msg.trim() == ""){
			gap.gAlert(gap.lang.input_message);
			return false;
		}		
		var ek = "";
		var croom_key = gBody.cur_cid;
		if (gma.chat_position == "popup_chat"){
			$("#alarm_chat_msg").css("height", "38px");
			ek = "popup";
			croom_key = gma.cur_cid_popup;
		}else{
			$("#message_txt").css("height", "38px");
		}
		var date = gap.search_today_only2();
		var time = gap.search_time_only();	
		var bun = date + time.replace(":","");		
		var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.		
		//텍스트에 링크 정보가 있는지 판단한다.
		var isURL = gBody.findUrls(msg);
		if (isURL.length > 0 && noticekey == ""){
			//입력 내용중에 URL이 포함되어 있을 경우
			var res = gBody.search_og(msg, bun, date, key, name, time);
			return false;		
		}else{			
			var ucnt = gBody.cur_room_att_info_list.length - 1;
			
			//채팅창과 팝업 채팅탕이 동시에 띄워질 수 있기 때문에 구분해야 한다.
			if (ek == "popup"){
				//2024.04.23 업무방에서 퀵채팅 대화방에 들어간 채로 채팅으로 옮겨간 경우 참석자 정보가 없음.
				if(gBody.cur_room_att_info_list_popup){
					ucnt = gBody.cur_room_att_info_list_popup.length - 1;
				} else {
					//참석자 정보가 없을 경우 다시 가져옴.
					ucnt = gap.search_cur_chatroom_attx(croom_key).length -1;
				}
			}

			var rinfo = "";			
			var reply_info = new Object();
			if ($(".reply-chat-wrap").length > 0){
				rinfo = gBody.cur_reply_chat_info;
				
				reply_info.ky = gap.userinfo.rinfo.ky;
				reply_info.ex = new Object();
				reply_info.ex.reply = rinfo;
			}else if (noticekey != ""){
				reply_info.ex = new Object();
				reply_info.ex.notice = gBody.cur_notice_chat_info;
				reply_info.ex.notice.id = noticekey;
			}else{
				reply_info = "";
			}
			
			var res1 = gBody.chat_draw(opt, name, msg, date, time, type, bun, key, msgid, "", "D", "1", "" , ucnt, "", ek, croom_key, reply_info);	
			gBody.img_open_reply();
			gBody.check_display_layer();
		}	
		var obj = new Object();		
		obj.type = "msg";
		obj.mid = msgid;
		obj.msg = msg;		
		if (gma.chat_position == "popup_chat"){
			obj.cid = gma.cur_cid_popup;
		}else{
			obj.cid = gBody.cur_cid;
		}		
		obj.ty = 1;		
		if (gBody.trans_lang != ""){
			obj.lang = gBody.trans_lang;
		}
		if ($(".reply-chat-wrap").length > 0){
			var op = new Object();
			op.reply = gBody.cur_reply_chat_info;
			obj.ex = op;
			if (ek == "popup"){
				gBody.replyChatBottomHide("alarm");
			}else{
				gBody.replyChatBottomHide();
			}		
		}else if (noticekey != ""){
			var op = new Object();
			op.notice = gBody.cur_notice_chat_info;
			op.notice.id = noticekey;
			obj.ex = op;
		}
		//답장 원본이 긴 경우 접기 처리한다.
		gBody.reply_expand_check();
		_wsocket.send_chat_msg(obj);					
	},	
	
	"MessageSend_log_draw" : function(opt, msg, type, name, key, msgid, sdate, init, tp, dept, ucnt, trans, ek, croom_key, reply_info){
		var cdate = gap.change_date_localTime_full(sdate.toString());		
		var date = gap.search_today_only3(cdate);
		var time = gap.change_date_localTime_only_time(sdate.toString());		
		var bun = date + time.replace(":","");		
		var res1 = gBody.chat_draw(opt, name, msg, date, time, type, bun, key, msgid, "log", init, tp, dept, ucnt, trans, ek, croom_key, reply_info);	
		gBody.check_display_layer();
	},	
	
	"enter_video_room" : function(roomkey, opt){
		//var auth = gap.get_auth();
		//roomkey = roomkey + "&auth="+auth;
		window.open(roomkey, null);
	},
	
	"chat_draw" : function(opt, name,  message, date, time, type, bun, key, msgid, tp, init, tp2, dept, ucnt, trans, ek, croom_key, reply_info){
		var draw_dis = gBody.chat_show_dis;
		var draw_dis_parent = gBody.chat_show;
		var wPosition = "";	//"bottom" 하단 , "top" 상단 , "both" 양쪽 모두
		
		if ((croom_key == gBody.cur_cid) && (croom_key == gma.cur_cid_popup)){
			wPosition = "both";
		}else if(croom_key == gBody.cur_cid) {
			wPosition = "bottom";
		}else if (croom_key == gma.cur_cid_popup){
			wPosition = "top";
		}
	//	console.log("wPosition : " + wPosition);
		
		if (typeof(ek) != "undefined" && ek != ""){
			if (ek.indexOf("channel") > -1){
				draw_dis = gBody.chat_show_channel_sub;
				draw_dis_parent = gBody.chat_show_channel;
				
			}else if (ek.indexOf("popup") > -1 || gma.chat_position == "popup_chat"){
				draw_dis = gBody.chat_show_popup_sub;
				draw_dis_parent = gBody.chat_show_popup;
				
			}
		}			
		
		//tp2가 100인 경우른 회수된 메시지 표시하는 경우임
		if (message == "" && tp2 != 100){
			return false;
		}		
		var xuser = "";		
		var pxuser = "";
		if (opt == "you"){			
		//	var pxuser = gap.cur_room_att_person_img_info_search4(key, croom_key);
			pxuser = gap.cur_room_att_info_list_search(key);		
			if (typeof(pxuser) != "undefined"){
				var sxuser = gap.user_check(pxuser);
				var xuser = sxuser.disp_user_info;
			}else{
				pxuser = gap.cur_room_att_person_img_info_search4(key, croom_key);				
				if (typeof(pxuser) != "undefined"){
					var sxuser = gap.user_check(pxuser);
					var xuser = sxuser.disp_user_info;
				}else{
					//xuser = name ; //+ " | " + dept;
					if (!pxuser){							
						var ppx = gap.search_user_emp(key);							
						ppx = JSON.parse(ppx.responseText);		
						if (ppx[0].length == 0){
							//퇴사자으이 경우
							xuser = name ; //+ " | " + dept;
							
						}else{
							userinfo = ppx[0][0];
							pxuser = userinfo;
							var sxuser = gap.user_check(pxuser);
							var xuser = sxuser.disp_user_info;
						}						
					}
				}			
				//pxuser = pxuser = gap.cur_room_att_person_img_info_search4(key, croom_key);
			}	
		}		
		var isonetoone = gap.search_is_onetoone();
		var xmlen = gBody.cur_room_att_info_list.length-1;  //삭제를 위한 카운트 설정 읽지 않은 건수와 비교		
		var rcount = message.split(/\r\n|\r|\n/).length;
		var mcount = message.length;		
		var message = gap.aLink(message);    //http자동 링크 걸기	
	
		//자동 변환된 상태에서 아래것을 진행하면 태그가 텍스트로 풀려보인다.
		if (key != "chatgpt"){
			if (message.indexOf("a href=") == -1){
				message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
				//	message = message.replace(/[\n]/gi, "<p style='height:5px'></p>");		
				message = message.replace(/[\n]/gi, "<br>");	
				message = message.replace(/\s/gi, "&nbsp;");
			}else{
				message = message.replace(/[\n]/gi, "<br>");	
			}
		}
		
		if (key == "10139992"){
			//칭찬코끼리 계정이 포함되어 있는 경우 예외 처리한다.
			try{				
				var mmp = JSON.parse(message);
				//감사해요, 힘내세요, 축하해요, 
				var imgsrc = "";
				if (mmp.category == "고마워요"){
					imgsrc = "img/elephant/img_01.gif";
				}else if (mmp.category == "축하해요"){
					imgsrc = "img/elephant/img_02.gif";
				}else if (mmp.category == "잘했어요"){
					imgsrc = "img/elephant/img_03.gif";
				}else if (mmp.category == "힘내세요"){
					imgsrc = "img/elephant/img_04.gif";
				}else if (mmp.category == "감사해요"){
					imgsrc = "img/elephant/img_01.gif";
				}
				var ht = "";
				ht = "<span style='display:flex; flex-direction:column'>";
				ht += "<span><img src='"+imgsrc+ "'></span>";
				ht += "<span>보내는 사람 : "+mmp.send_name + "</span>";
				ht += "<span>받은 코끼리수  : "+mmp.elephant_cnt+"마리</span>";
				ht += "<span>메시지 :</span>";
				ht += "<span>"+mmp.content+"</span>";
				if (mmp.send_id != ""){
					//ht += "<span><a href='"+mmp.PC_link+"' target='_new'><img src='img/elephant/icon_el.png'>나도 보내기</a></span>";
					ht += "<span style='text-align:center;margin-top:5px'>";
					ht += "<a href='"+mmp.PC_link+"' target='_new'><img src='img/elephant/btn_send.png'></a>";
					ht += "</span>";
				}				
				ht += "</span>";
				message = ht;
			}catch(e){				
			}			
			message = message;
		}	
		var tmsg = "";
		var tx = "";
		var istrans = false;
		if (typeof(trans) != "undefined" && trans != ""){
			istrans = true;
			tmsg = trans.ct.msg;
			tmsg = tmsg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		//	tmsg = tmsg.replace(/[\n]/gi, "<p style='height:5px'></p>");
			tmsg = tmsg.replace(/[\n]/gi, "<br>");
			tmsg = tmsg.replace(/\s/gi, "&nbsp;");
			tx = trans.ct.lang;
		}		
		var roomkey = "";		
		var external_msg = "";
		var external_info = "";		
		if (tp2 == "21"){
			//화상회의 초대 메시지인 경우
			var lx = message.split("-spl-");			
			var tpx = lx[0];
			if (tpx == "mail_link"){
				external_msg = "mail_link";
				external_info = lx[2];
				message = lx[1];
			}else{				
				external_msg = "video_call";
				roomkey = lx[1];
				var opt1 = lx[2];
				var opt2 = lx[3];
				var caller = lx[4];
				var mg = lx[0];
			//	if (caller == gap.userinfo.rinfo.ky){
					mg = mg + "<br>" + "미팅 번호 (Meeting Number) : " + opt1 + "<br>" + " 호스트 키 (Host Key) : " + opt2;
			//	}
				if (opt != "me"){
					message = mg + "<a class='link-meet' onclick=\"gBody.enter_video_room('"+roomkey+"', 'F')\">"+gap.lang.enter_videoroom+"</a>";
				}else{
					message = mg + "<a class='link-meet' onclick=\"gBody.enter_video_room('"+roomkey+"', 'T')\">"+gap.lang.enter_videoroom+"</a>";
				}
			}		
		}		
		if (tp2 == 100){
			message = gap.recall_msg();
		}	
		
		var rdis = false;
		if ( (rcount > 10) || (mcount > 800)){
			rdis = true;
		}		
//		if ( (rcount > 10) || (mcount > 300)){
//			rdis = true;
//		}	
		//답장일 경우 메시지 형식을 별도로 처리한다.
		var tmm = "";

		var isNotice = false;
		if (reply_info != ""){	

			if (reply_info.ex.notice){
				
				isNotice = true;
				var rhtml = "";
				rhtml = gap.lang.mn3;
				var tmm = message;
				
				var imt = reply_info.ex.notice;
				
				var kmsg = gap.HtmlToText(message);
				
				
				if (imt.ty == 1){
					kmsg = gap.textToHtml(kmsg);
				}
				
				if (imt.ty == 6){
					var infox = imt.info[0];
					//이미지 파일을 공지한 경우
					//https://dswdv.daesang.com/fud/20231228/thumbnail/upload_f52bdf637b394338404245a547e261e0.jpg
				//	var turlx = gap.fileupload_server_url + infox.sf + "/thumbnail/" + infox.sn;
					
					var imgext = infox.filename.substring(infox.filename.lastIndexOf(".")+1, infox.filename.length);
					
					var kky = reply_info.ky;
					if (typeof(reply_info.ky) == "undefined"){
						kky = reply_info.ex.notice.ky;
					}
					
					var xpath = kky + "/" + imt.upload_path + "/thumbnail/" + infox.md5 + "." + imgext; 
					var turlx = gap.channelserver + "FDownload_noticefile.do?path="+xpath+"&fn="+encodeURIComponent(infox.filename)
				//	message = "<div class='img-content'>";
					message = "";
					message += "	<div class='img-thumb2' style='position:relative; width:100%; height:100%; text-align:center'>";
					message += "		<img style='width:100px' src='"+turlx+"' />";
					message += "	</div>";
				//	message += "</div>";
					
					
				}else if (imt.ty == 5){
					//일반 파일을 공지한 경우
					message = "<span class='notice_ico_file_"+opt+"'></span>" + "<span style='padding-left:20px'>" + imt.msg + "</span>";
				}else if (imt.ty == 4){
					
					kmsg = imt.msg;
					//message = "<span class='notice_ico_file_"+opt+"'></span>" + "<span style='padding-left:20px'>" + imt.msg + "</span>";
				}else{
					//이외 텍스트를 공지한 경우
				}
				
			
				
				if (kmsg.length > 40){
					message = kmsg.substring(0, 40) + "...";
					rdis = false;
				}
				
				ncolor = "#ed8181";
				tcolor = "#777";
				pcolor = "white";
				bcolor = "#eebeb4";
				mcolor = "white";
				
				if (opt == "you"){
					mcolor = "#333";
					ncolor = "#dedada";
					tcolor = "#333";
					pcolor = "#8f8f8f";
					bcolor = "#efefef";
				}
				
				//인라인 스타일 변경하면 안됨
				message = "<div class='msg_notice' data='"+imt.id+"' style='border-radius:7px; padding:0px; cursor:pointer'><dl style='padding:10px; font-size:12px; color:"+pcolor+"'>" + rhtml + "<dd style='margin-top:5px;margin-bottom:6px;height:1px;background-color:"+ncolor+"'></dd><dd style='font-size:13px; color:"+mcolor+"'>" + message+ "</dd></dl>";
				message += "<dd class='msg_notice_dd' style='font-size:12px; color:"+tcolor+";  background-color:"+bcolor+"; '>";
				message += "<span class='ico-notice-check' style='left:7px'></span>" + gap.lang.mn4 + "<span class='ico-notice-back'></span></dd>";
				message += "</div>";
				
			}else{
				var tip = gBody.reply_title_setting(reply_info);
				var rpinfo = reply_info.ex.reply;			
				var rmsg = rpinfo.msg.replace(/[\n]/gi, "<br>");	
				rmsg = gap.aLink(rmsg);
				
				tcolor = "";
				line_color = "";
				if (opt == "me"){
					tcolor = "#dadae4";
					line_color = "#f88b8b";
				}else{
					tcolor = "#a8a8ac";
					line_color = "#f2eeee";
				}			
				if (rpinfo.ty == "3"){
					//이모티콘의 답장일 경우
					var rhtml = "<span style='display:flex; flex-direction:row;  border-bottom: 1px solid "+line_color+"; padding-bottom: 5px; '>";
					rhtml += "<span><img style='width:40px; margin-right:5px' src='/resource/images/emoticons/" +rpinfo.msg+ "'></span>";				
					rhtml += "<span style='display:flex; flex-direction:column'>";
					rhtml += "	<span>" + tip + "</span>";		
					rhtml += "	<span style='color:"+tcolor+"; font-size:13px; overflow:hidden; text-overflow:ellipsis' class='rmsg_cls'>"+gap.lang.emoti+"</span>";
					rhtml += "</span>";
				}else if (rpinfo.ty == "5"){
					//파일을 답장한 부분 표시하기				
					var rfilename = rpinfo.ex.nm.replace("'","`");	
					var show_video = gap.file_show_video(rfilename);
					var rtitle = "File preview";
					if (show_video){
						rtitle = gap.lang.pv;
					}
					var chatserver_domain = gap.search_chatserver_domain(rpinfo.ex.nid);				    	  
			    	var downloadurl = chatserver_domain+ "/filedown" + rpinfo.ex.sf + "/" + rpinfo.ex.sn + "/" + encodeURIComponent(rfilename);		    	
			    	var caller = "2"		
		    		if (typeof(reply_info.ex) != "undefined" && typeof(reply_info.ex.caller) != "undefined"){
		    			caller = reply_info.ex.caller;
		    		}
			    	var key = reply_info.ky;				
					var rhtml = "<span style='display:flex; flex-direction:column'>";
					rhtml += "<span>" + tip + "</span>";
					rmsg = gap.lang.file + " : " + rmsg;				
					rhtml += "<span style='display:flex; flex-direction:row; border-bottom: 1px solid "+line_color+"; padding-bottom: 5px;'>";
					rhtml += "	<span class='reply_file_thumbail' title='"+rtitle+"' data1='"+downloadurl+"' data2='"+rfilename+"' data3='"+caller+"' data4='"+key+"' style=' cursor:pointer; color:"+tcolor+"; font-size:13px; overflow:hidden; text-overflow:ellipsis;padding-right:10px'>" + rmsg + "</span>";
					rhtml += "		<span>";
					rhtml += "			<button class='ico btn-file-download_reply' title='File download' style='background-position:-210px -20px; width:16px; height:16px; position:initial'>다운로드</button>";
					rhtml += "	</span>";
					rhtml += "</span>";				
				}else if (rpinfo.ty == "6"){
					//이미지 파일을 답장한 부분 표시하기
					var isMultifiles = false;
					var multicount = 0;	
					var rin = "";
					var tsq = "";
					if (typeof(rpinfo.ex.files) != "undefined"){
						//묶음 발송된 경우
						var isMultifiles = true;
						multicount = rpinfo.ex.files.length;
						rin = rpinfo.ex.files[0];
						tsq = rpinfo.sq + "_0";
					}else{
						rin = rpinfo.ex;
						tsq = rpinfo.sq;
					}
					var impath = gap.fileupload_server_url + rin.sf + "/thumbnail/" + rin.sn;				
					var rfilename = rin.nm.replace("'","`");	
					var chatserver_domain = gap.search_chatserver_domain(rin.nid);				    	  
			    	var downloadurl = chatserver_domain+ "/filedown" + rin.sf + "/" + rin.sn + "/" + encodeURIComponent(rfilename);
					var downloadpath = "";		
					
					var rhtml = "<span style='display:flex; flex-direction:row ; border-bottom: 1px solid "+line_color+"; padding-bottom: 5px;'>";
					rhtml += "<span style='position:relative'>";
					
					rhtml += "<img class='reply_img_thumbail' data1='"+downloadurl+"' data2='"+rfilename+"' data3='"+tsq+"' style='cursor:pointer; width:40px;height:40px; margin-right:5px' src='"+impath+"'>";
					
//					if (isMultifiles){
//						//묶음 파일 전송이라는 이미지를 우측 하단에 표시힌다.
//						rhtml += "<div style='position:absolute; background-color:white; bottom:15px; right:18px; width:15px'><img src='common/img/multi_image.png'></div>"
//					}
					
					rhtml += "</span>";				
					rhtml += "<span style='display:flex; flex-direction:column; '>";
					rhtml += "	<span>" + tip + "</span>";		
					
					if (isMultifiles){
						if (gap.curLang == "ko"){
							rhtml += "	<span style='color:"+tcolor+"; font-size:13px; overflow:hidden; text-overflow:ellipsis' class='rmsg_cls'>"+gap.lang.sajin+ " " + multicount + "장</span>";
						}else{
							rhtml += "	<span style='color:"+tcolor+"; font-size:13px; overflow:hidden; text-overflow:ellipsis' class='rmsg_cls'>"+multicount + " " + gap.lang.sajin+ "</span>";
						}
						
					}else{
						rhtml += "	<span style='color:"+tcolor+"; font-size:13px; overflow:hidden; text-overflow:ellipsis' class='rmsg_cls'>"+gap.lang.sajin+"</span>";
					}
					
					rhtml += "</span>";
				}else{				
					var rhtml = "<span style='display:flex; flex-direction:column'>";
					rhtml += "<span>" + tip + "</span>";				
					rhtml += "<span style='color:"+tcolor+"; font-size:13px; overflow:hidden; text-overflow:ellipsis; border-bottom: 1px solid "+line_color+"; padding-bottom: 5px;' class='rmsg_cls'>"+rmsg+"</span>";								
					rhtml += "<span class='balloon-btn2' style='display:none'><button class='btn-expand'>"+gap.lang.expand+"</button></span>";
				}			
				rhtml += "</span>";
				//리스트에 마지막 메시지 설정때문에 여기서 저장한다. gBody.last_msg 설정
				var tmm = message;
				message = rhtml + "<dd style='height:10px'></dd>" + message;
			}
			
			
			
		}
		var html = "";		
		var xdate = new Date();		
		var today = xdate.YYYYMMDD();		
		var cnt = $("#" + draw_dis + " #web_chat_dis_" + date).length;	
		var dis_date = gap.change_date_default(gap.search_today_only3(date));
		var dis_id = "date_" + date;
		if (cnt == 0){						
			if (key == "chatgpt"){
				html += "	<div class='wrap-chat' id='web_chat_dis_"+date+"' style='margin-top:10px'>";
			//	html += "		<div class='date' id='"+dis_id+"'><span>"+dis_date+"</span></div>";
				html += "   </div>";	
			}else{
				html += "	<div class='wrap-chat' id='web_chat_dis_"+date+"' style='margin-top:30px'>";
				html += "		<div class='date' id='"+dis_id+"'><span>"+dis_date+"</span></div>";
				html += "   </div>";	
			}			
			hx = $("#"+draw_dis+ " .wrap-chat").length;						
			if (hx == 0){
				//$("#chat_msg_dis").html(html);
				if (croom_key != ""){
					//신규로 메시지가 수신된 경우
					if (croom_key == gBody.cur_cid){
						$("#"+gBody.chat_show_dis).html(html);
					}else if (croom_key == gma.cur_cid_popup){
						if (init == "D"){
							//퀵창에서 최초 대화할때 이게 없으면 바로 등록되지 않는다.
							$("#"+gBody.chat_show_popup_sub).html(html);
						}
					}
				}else{
					$("#"+draw_dis).html(html);
				}				
			}else{
				if (init != "D"){
					if (init == "F"){
						$(html).insertBefore($("#"+draw_dis_parent+ " .wrap-chat").first());
					}else{						
						if (croom_key == "" || croom_key == gBody.cur_cid){
							$(html).insertAfter($("#"+draw_dis_parent+ " .wrap-chat").last());
						}					
					}		
				}else{
				//	$("#"+draw_dis).children().last().append(html);
					$("#"+draw_dis).append(html);
					if (gBody.cur_cid == gma.cur_cid_popup){
						//직접입력하는 경우 하단과 팝업 채팅창 모두 표시해야 한다.
						if (draw_dis == "chat_msg_dis"){
							$("#alarm_chat_sub").append(html);	
						}else if (draw_dis == "alarm_chat_sub"){
							$("#chat_msg_dis").append(html);	
						}
					}
				}				
			}	
		}							
		var html = "";
//		아래 소스를 적용하면 스크롤해서 다음 데이터를 찾아오는 것이 가능하지만 대화 꼬리 이미지를 제거하기 못해 신규 메시지 형태로 표시한다.
		var bol = false;
		if (init == "F"){		
			var	ttm = $("#"+draw_dis_parent+" .time").first();
			var xxt = gBody.lastchatter.substring(10, gBody.lastchatter.length);
			var nx = gBody.lastchatter.slice(0,-5) + ttm.html().substring(0,5);
			var ck = $(ttm).parent().parent().attr("data");
			var nk = key + "^" +  date + "^" + time;
			if (ck == nk){
				bol = true;
			}			
		}else{
			if (gBody.lastchatter == key + date + time){
				if ($("#" + draw_dis + " .wrap-message").last().parent().parent().attr("class") == opt){
					bol = true;
				}else{
					bol = false;
				}		
			}
		}
		if (key == "chatgpt"){
			bol = false;
		}		
		
		if ( (bol) && (gBody.last_enter_type != "ogtag"  && gBody.last_enter_type != "emoticon") && (external_msg != "mail_link")){
			//마지막 입력자가 자신과 같을 경우 텍스트 표시 디자인이 연결된 형태로 변경되어야 한다.					
			if (opt == "you"){
				html += "               <br id='br_"+msgid+"'>";					
				
				if (rdis){
					html += "				<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"' style='max-width:calc(100% - 60px)'>";
					html += "					<div class='balloon msg-fold'><span class='tail'></span>";
					if (istrans){
						html += "						<div><span id='msg_"+msgid+"' class='xgptcls'>"+message+"</span>";
						html += "							<span class='trans_gap'> <span class='trans_you2'>"+ tx + "</span> " + tmsg+"</span>";
						html += "						</div>";
					}else{
						if (isNotice){
							html += "						<div style='padding:0px'><span id='msg_"+msgid+"' class='xgptcls'>"+message+"</span>";
							html += "						</div>";
						}else{
							html += "						<div><span id='msg_"+msgid+"' class='xgptcls'>"+message+"</span>";
							html += "						</div>";
						}
						
					}
					
					html += "						<span class='balloon-btn'><button class='btn-expand'>"+gap.lang.expand+"</button></span>";
					html += "					</div>";
				}else{
					html += "				<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"'>";
					html += "					<div class='balloon'><span class='tail'></span>";
					if (istrans){
						html += "						<div><span id='msg_"+msgid+"' class='xgptcls'>"+message+"</span>";
						html += "							<span class='trans_gap'> <span class='trans_you2'>"+ tx + "</span> " + tmsg+"</span>";
						html += "						</div>";
					}else{
						if (isNotice){
							html += "						<div style='padding:0px'><span id='msg_"+msgid+"' class='xgptcls'>"+message+"</span></div>";
						}else{
							html += "						<div><span id='msg_"+msgid+"' class='xgptcls'>"+message+"</span></div>";
						}
						
					}					
					html += "					</div>";
				}						
				if (tp2 != 100 && !gBody.is_my_chat && gBody.cur_cid != "chatgpt" && !isNotice){
					html += "					<button class='ico btn-chat-more on mk'>더보기</button>";
				}
				html += "				</div>";				
				if (init == "D"){					
					if (isonetoone){
						html += "				<div class='time' style='margin-left:10px' id='time_"+bun+"' data='"+msgid+"'>"+time+"<span class='ico-new' style='display:none' id=\"ico-new_"+msgid+"\"></span></div>";
					}else{
						html += "				<div class='time' style='margin-left:10px' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";
					}	
				}else{	
					html += "				<div class='time' style='margin-left:10px' id='time_"+bun+"' data='"+msgid+"'>"+time+"</div>";
				}					
				if (ucnt > 0 && !isonetoone){
					html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"'>"+ucnt+"</span>";
				}
				if (init == "F"){		
					//해당 값이 없으면 이전 대화 그리는 첫번째로 인식하고 새로 그린다.
					var lastObj = date + time.replace(":","");	
					var ll = $("#time_" + lastObj).parent();
					$(html).prependTo(ll);						
					
				}else{							
					var obj = $("#" + draw_dis + " #" + gBody.last_enter_id).parent().parent().find(".time");
				//	$(obj).before(html);	
					$(obj).parent().append(html);
						
					if (draw_dis != "alarm_chat_sub"){
						if (gBody.receive_msg_id == "" || gBody.receive_msg_id == gma.cur_cid_popup){
							if (!gma.click_left_menu){
								var obj = $("#alarm_chat_sub" + " #" + gBody.last_enter_id).parent().parent().find(".time");
								$(obj).parent().append(html);
							}
						}
					}
				}
				html = "";				
			}else{			
				html += "               <br id='br_"+msgid+"'>";			
				if (tp == "log"){											
					if (rdis){
						html += "				<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"' style='max-width:calc(100% - 60px)'>";
						html += "					<div class='balloon msg-fold'><span class='tail '></span>";
						if (istrans){
							html += "						<div><span id='msg_"+msgid+"'>"+message+"</span>";
							html += "							<span class='trans_gap'><span class='trans_me2'>"+ tx + "</span> " + tmsg+"</span>";
							html += "						</div>";
						}else{
							if (isNotice){
								html += "						<div style='padding:0px'><span id='msg_"+msgid+"'>"+message+"</span></div>";
							}else{
								html += "						<div><span id='msg_"+msgid+"'>"+message+"</span></div>";
							}
							
						}						
						html += "						<span class='balloon-btn'><button class='btn-expand'>"+gap.lang.expand+"</button></span>";
						html += "					</div>";
					}else{
						html += "				<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"'>";
						html += "					<div class='balloon'><span class='tail '></span>";
						if (istrans){
							html += "						<div><span id='msg_"+msgid+"'>"+message+"</span>";
							html += "							<span class='trans_gap'><span class='trans_me2'>"+ tx + "</span> " + tmsg+"</span>";
							html += "						</div>";
						}else{
							if (isNotice){
								html += "						<div style='padding:0px'><span id='msg_"+msgid+"'>"+message+"</span></div>";
							}else{
								html += "						<div><span id='msg_"+msgid+"'>"+message+"</span></div>";
							}
						
						}						
						html += "					</div>";
					}									
					if (tp2 != 100 && !gBody.is_my_chat && gBody.cur_cid != "chatgpt"){
						html += "					<button class='ico btn-chat-more on mk'>더보기</button>";
					}
					html += "				</div>";									
					if (init == "D"){					
						if (isonetoone){
							html += "				<div class='time' id='time_"+bun+"' data='"+msgid+"'>"+time+"<span class='ico-new' style='display:none' id=\"ico-new_"+msgid+"\"></span></div>";
						}else{
							html += "				<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";
						}	
					}else{	
						html += "				<div class='time' id='time_"+bun+"' data='"+msgid+"'>"+time+"</div>";
					}	
					if (!gBody.is_my_chat  && gBody.cur_cid != "chatgpt"){
						if (ucnt > 0){
							html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"'>"+ucnt+"</span>";
						}
					}				
				}else{				
					
					if (rdis){
						html += "				<div class='wrap-message disabled' id='"+msgid+"' mid='"+msgid+"' style='max-width:calc(100% - 60px)'>";
						html += "					<div class='balloon msg-fold'><span class='tail '></span>";
						if (istrans){
							html += "						<div><span id='msg_"+msgid+"'>"+message+"</span>";
							html += "							<span class='trans_gap'><span class='trans_me2'>"+ tx + "</span> " + tmsg+"</span>";
							html += "						</div>";
						}else{
							if (isNotice){
								html += "						<div style='padding:0px'><span id='msg_"+msgid+"'>"+message+"</span></div>";
							}else{
								html += "						<div><span id='msg_"+msgid+"'>"+message+"</span></div>";
							}
							
						}						
						html += "						<span class='balloon-btn'><button class='btn-expand'>"+gap.lang.expand+"</button></span>";
						html += "					</div>";
					}else{
						html += "				<div class='wrap-message disabled' id='"+msgid+"' mid='"+msgid+"'>";
						html += "					<div class='balloon'><span class='tail'></span>";
						if (istrans){
							html += "						<div><span id='msg_"+msgid+"' class='trans_me1'>"+message+"</span>";
							html += "							<span class='trans_gap'><span class='trans_me2'>"+ tx + "</span> " + tmsg+"</span>";
							html += "						</div>";
						}else{
							if (isNotice){
								html += "						<div style='padding:0px'><span id='msg_"+msgid+"'>"+message+"</span></div>";
							}else{
								html += "						<div><span id='msg_"+msgid+"'>"+message+"</span></div>";
							}
							
						}
						html += "					</div>";
					}					
					if (gBody.cur_cid != "chatgpt" && !gBody.temp_gpt_msg ){
						html += "					<button class='ico btn-chat-resend'>재전송</button>";
					}				
					if (tp2 != 100 && !gBody.is_my_chat  && gBody.cur_cid != "chatgpt" && !gBody.temp_gpt_msg){
						html += "					<button class='ico btn-chat-more on mk'>더보기</button>";	
					}
					html += "				</div>";									
					if (init == "D"){					
						if (isonetoone){
							html += "				<div class='time' id='time_"+bun+"' data='"+msgid+"'>"+time+"<span class='ico-new' style='display:none' id=\"ico-new_"+msgid+"\"></span></div>";
						}else{
							html += "				<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";
						}	
					}else{	
						html += "				<div class='time' id='time_"+bun+"' data='"+msgid+"'>"+time+"</div>";
					}
					if (!gBody.is_my_chat  && gBody.cur_cid != "chatgpt"){
						if (ucnt > 0){
							html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"'>"+ucnt+"</span>";
						}
					}										
				}					
				if (init == "F"){						
					//해당 값이 없으면 이전 대화 그리는 첫번째로 인식하고 새로 그린다.
					var lastObj = date + time.replace(":","");					
					var ll = $("#" + draw_dis + " #time_" + lastObj).parent().first();
					$(html).prependTo(ll);	
				}else{							
					var isexist = $("#" + draw_dis + " #" + gBody.last_enter_id);
					var obj = "";
					if (isexist.length > 0){
						obj = $("#" + draw_dis + " #" + gBody.last_enter_id).parent().parent().find(".time");
					}else{
						obj = $("#" + draw_dis + " .wrap-message").last().parent().find(".time");
					}
					$(obj).parent().append(html.trim());					
					if (init == "D"){
						if (gBody.cur_cid == gma.cur_cid_popup){
							//직접입력하는 경우 하단과 팝업 채팅창 모두 표시해야 한다.
							if (draw_dis == "chat_msg_dis"){
								var isexist = $("#alarm_chat_sub #" + gBody.last_enter_id);
								var obj = "";
								if (isexist.length > 0){
									obj = $("#alarm_chat_sub #" + gBody.last_enter_id).parent().parent().find(".time");
								}else{
									obj = $("#alarm_chat_sub .wrap-message").last().parent().find(".time");
								}
								$(obj).parent().append(html.trim());
							}else if (draw_dis == "alarm_chat_sub"){
								var isexist = $("#chat_msg_dis #" + gBody.last_enter_id);
								var obj = "";
								if (isexist.length > 0){
									obj = $("#chat_msg_dis #" + gBody.last_enter_id).parent().parent().find(".time");
								}else{
									obj = $("#chat_msg_dis .wrap-message").last().parent().find(".time");
								}
								$(obj).parent().append(html.trim());
							}
						}						
					}								
					if (tp != "log"){
						$(obj).parent().find(".ucnt").last().html(gBody.cur_room_att_info_list.length - 1);
					}									
					if (init == "D"){
						//연속으로 입력할때 그룹을 매칭되면 상단에 있는 메시지에 읽지 않음 메시지를 표시해야 한다.					
						var objx = $("#" + draw_dis + " .wrap-message").last().prev().prev();
						var xxid = $(objx).attr("id");
						var mdata = $(objx).attr("mdata");						
						//마지막 바로 위에 있는 new-icon data값을 이전 값으로 변경해 준다.
						var kk = $(objx).attr("mid");
						var more_btn = $(objx).find(".mk");
						$(more_btn).attr("data",kk);					
						var cur_chatroom_last_read = gBody.last_other_read_id;						
						if (isonetoone){
							if ((cur_chatroom_last_read < parseFloat(mdata)) || typeof(mdata) == "undefined"){
								//typeof(mdata) == "undefined" 일 경우는 첫메시지 체크 전송 체크 이전에 바로 다음 메시지를 발송한 경우
								objx.append("<span class='ico-new' style='display:none' id=\"ico-new_"+xxid+"\" data='"+mdata+"'></span>");
							}
						}						
						var kyk = $("#" + draw_dis + " .wrap-message").last();
						var cck = $(kyk).attr("id");						
						if (isonetoone){
							var isNewicon = $(kyk).find(".ico-new");
							if (isNewicon.length == 0){
								var ccid = $(kyk).attr("mid");
								if ((cur_chatroom_last_read < parseFloat(mdata)) || typeof(ccid) == "undefined"){									
									$(kyk).next().append("<span class='ico-new' style='display:none' id=\"ico-new_"+xxid+"\" data='"+ccid+"'></span>");
								}
							}		
						}						
						if (gBody.cur_cid == gma.cur_cid_popup){
							//직접입력하는 경우 하단과 팝업 채팅창 모두 표시해야 한다.
							if (draw_dis == "chat_msg_dis"){
								gBody.change_setting_position("alarm_chat_sub", isonetoone);
							}else if (draw_dis == "alarm_chat_sub"){
								gBody.change_setting_position("chat_msg_dis", isonetoone);
							}
						}						
					}else{
						//그룹으로 묶을 경우 time의 data값을  현재 값으로 변경해 준다.
						$(obj).attr("data", msgid);
					}
				}
				html = "";								
			}
		}else if (external_msg == "mail_link"){
			//메일 링크일 경우		
			//external_info
			var exinfo = JSON.parse(external_info);			
			if (exinfo.process == "MAIL_ERROR"){
				return false;
			}			
			var sname = exinfo.sender;
			if (sname == ""){
				sname = "None";
			}
			var person_img = "";	
			var attach_list = exinfo.attach.split("*?*");
			var attach_size = exinfo.attachsize.split("*?*");
			var target_server = exinfo.target_server;		
			var tunid = exinfo.target_unid;
			var tdb = exinfo.target_db;	
			if (opt == "you"){
				person_img = gap.person_profile_photo_by_ky2(key);				
				html += "		<div class='"+opt+"' data='"+key +"^" + date+"^" + time+"' id='"+bun+"'>";
				html += "			<div class='user'>";
				html += "				<div class='user-thumb' data='"+key+"' data4='"+name+"'>"+person_img+"</div>";
				html += "			</div>";
		//		html += "			<div class='name'>"+name + gap.lang.hoching+ "</div>";  
				html += "			<div class='name'>"+xuser+ "</div>"; 
				html += "			<div class='talk'>";
				html += "               <br id='br_"+msgid+"'>"
				html += "				<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"'>";			
				html += "                   <div class='chat-mail' id='mail_"+msgid+"' data1='"+tunid+"' data2='"+tdb+"' data3='"+target_server+"'>";			
				html += "                      <div>";
				html += "                         <span class='ico ico-mail'></span>";
				if (exinfo.attach != ""){	
					html += "                         <dl style='cursor:pointer' data='"+msgid+"'>";
				}else{
					html += "                         <dl style='cursor:pointer; border-bottom:0px' data='"+msgid+"'>";
				}				
				html += "                            <dt>" + sname + "</dt>";
				html += "                            <dd>" + exinfo.title + "</dd>";
				html += "                         </dl>";				
				if (exinfo.attach != ""){					
					html += "                         <div class='mail-attach-list'>";
					if (attach_list.length > 1){
						html += "                            <button class='ico btn-fold' data='"+msgid+"'>"+gap.lang.fold+"</button>";
						html += "                            <h4>"+gap.lang.attachment+"<span> ("+attach_list.length+")</span></h4>";
						html += "                            <ul style='display:none; list-style:none' id='m_ul_"+msgid+"'>";						
					}else{
						html += "                            <button class='ico btn-fold on' data='"+msgid+"'>"+gap.lang.fold+"</button>";
						html += "                            <h4>"+gap.lang.attachment+"<span> ("+attach_list.length+")</span></h4>";
						html += "                            <ul id='m_ul_"+msgid+"' style='list-style:none'>";
					}						
					for (var i = 0 ; i < attach_list.length ; i++){
						var attname = attach_list[i];						
						attname = attname.replace(/&nbsp;/gi," ");
						var attsize = attach_size[i];
						var icon = gap.file_icon_check(attname);
						html += "                               <li style='cursor:pointer' data='"+msgid+"'  data2='"+attname+"' data3='"+target_server+"'>";
						html += "                                  <span class='ico ico-attach "+icon+"'></span>";
						html += "                                  <span>"+attname+"</span>";
						html += "                                  <em>("+gap.file_size_setting(attsize)+")</em>";
						html += "                                  <button class='ico btn-download'></button>";
						html += "                               </li>";
					}					
					html += "                            </ul>";
					html += "                         </div>";
				}								
				html += "                      </div>";				
				html += "                   </div>";						
				html += "				</div>";	
				html += "				<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";				
				if (!gBody.is_my_chat  && gBody.cur_cid != "chatgpt" && !isonetoone){
					if (ucnt > 0){
						html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
					}
				}				
				html += "			</div>";
				html += "		</div>";			
			}else{				
				person_img = gap.person_profile_photo(gap.userinfo.rinfo);				
				html += "		<div class='"+opt+"' data='"+key +"^" + date+"^" + time+"' id='"+bun+"'>";
				html += "			<div class='user'>";
				html += "				<div class='user-thumb' data='"+key+"' data4='"+name+"'>"+person_img+"</div>";
				html += "			</div>";
				html += "			<div class='name'>"+ name + gap.lang.hoching+"</div>";
				html += "			<div class='talk'>";
				html += "               <br id='br_"+msgid+"'>";
				if (tp == "log"){
					html += "				<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"'>";					
				//	html += "					<div class='chat-mail'><div><span id='msg_"+msgid+"'>"+message+"</span></div></div>";					
					html += "                   <div class='chat-mail' id='mail_"+msgid+"' data1='"+tunid+"' data2='"+tdb+"' data3='"+target_server+"'>";					
					html += "                      <div>";
					html += "                         <span class='ico ico-mail'></span>";					
					if (exinfo.attach != ""){	
						html += "                         <dl style='cursor:pointer' data='"+msgid+"'>";
					}else{
						html += "                         <dl style='cursor:pointer; border-bottom:0px' data='"+msgid+"'>";
					}								
					html += "                            <dt>" + sname + "</dt>";
					html += "                            <dd>" + exinfo.title + "</dd>";
					html += "                         </dl>";					
					if (exinfo.attach != ""){					
						html += "                         <div class='mail-attach-list'>";						
						if (attach_list.length > 1){
							html += "                            <button class='ico btn-fold' data='"+msgid+"'>"+gap.lang.fold+"</button>";
							html += "                            <h4>"+gap.lang.attachment+"<span> ("+attach_list.length+")</span></h4>";
							html += "                            <ul style='display:none; list-style:none' id='m_ul_"+msgid+"'>";							
						}else{
							html += "                            <button class='ico btn-fold on' data='"+msgid+"'>"+gap.lang.fold+"</button>";
							html += "                            <h4>"+gap.lang.attachment+"<span> ("+attach_list.length+")</span></h4>";
							html += "                            <ul id='m_ul_"+msgid+"' style='list-style:none'>";
						}								
						for (var i = 0 ; i < attach_list.length ; i++){
							var attname = attach_list[i];
							attname = attname.replace(/&nbsp;/gi," ");
							var attsize = attach_size[i];
							var icon = gap.file_icon_check(attname);
							html += "                               <li style='cursor:pointer' data='"+msgid+"' data2='"+attname+"' data3='"+target_server+"'>";
							html += "                                  <span class='ico ico-attach "+icon+"'></span>";
							html += "                                  <span>"+attname+"</span>";
							html += "                                  <em>("+gap.file_size_setting(attsize)+")</em>";
							html += "                                  <button class='ico btn-download'></button>";
							html += "                               </li>";
						}						
						html += "                            </ul>";
						html += "                         </div>";
					}					
					html += "                      </div>";					
					html += "                   </div>";				
					if (ucnt == xmlen && tp2 != 100 && !gBody.is_my_chat  && gBody.cur_cid != "chatgpt"){
						html += "					<button class='ico btn-chat-more on mk'>더보기</button>";
					}
					html += "				</div>";	
				}else{
					html += "				<div class='wrap-message ' id='"+msgid+"'>";					
					html += "                   <div class='chat-mail' id='mail_"+msgid+"' data1='"+tunid+"' data2='"+tdb+"' data3='"+target_server+"'>";					
					html += "                      <div>";
					html += "                         <span class='ico ico-mail'></span>";					
					if (exinfo.attach != ""){	
						html += "                         <dl style='cursor:pointer' data='"+msgid+"'>";
					}else{
						html += "                         <dl style='cursor:pointer; border-bottom:0px' data='"+msgid+"'>";
					}					
					html += "                            <dt>" + sname + "</dt>";
					html += "                            <dd>" + exinfo.title + "</dd>";
					html += "                         </dl>";				
					if (exinfo.attach != ""){					
						html += "                         <div class='mail-attach-list'>";						
						if (attach_list.length > 1){
							html += "                            <button class='ico btn-fold' data='"+msgid+"'>"+gap.lang.fold+"</button>";
							html += "                            <h4>"+gap.lang.attachment+"<span> ("+attach_list.length+")</span></h4>";
							html += "                            <ul style='display:none; list-style:none' id='m_ul_"+msgid+"'>";							
						}else{
							html += "                            <button class='ico btn-fold on' data='"+msgid+"'>"+gap.lang.fold+"</button>";
							html += "                            <h4>"+gap.lang.attachment+"<span> ("+attach_list.length+")</span></h4>";
							html += "                            <ul id='m_ul_"+msgid+"' style='list-style:none'>";
						}							
						for (var i = 0 ; i < attach_list.length ; i++){
							var attname = attach_list[i];
							attname = attname.replace(/&nbsp;/gi," ");
							var attsize = attach_size[i];
							var icon = gap.file_icon_check(attname);
							html += "                               <li style='cursor:pointer' data='"+msgid+"' data2='"+attname+"' data3='"+target_server+"'>";
							html += "                                  <span class='ico ico-attach "+icon+"'></span>";
							html += "                                  <span>"+attname+"</span>";
							html += "                                  <em>("+gap.file_size_setting(attsize)+")</em>";
							html += "                                  <button class='ico btn-download'></button>";
							html += "                               </li>";
						}						
						html += "                            </ul>";
						html += "                         </div>";
					}					
					html += "                      </div>";					
					html += "                   </div>";						
					if (gBody.cur_cid != "chatgpt" && !gBody.temp_gpt_msg){
						html += "					<button class='ico btn-chat-resend'>재전송</button>";
					}
					if (ucnt == xmlen && tp2 != 100 && !gBody.is_my_chat  && gBody.cur_cid != "chatgpt" && !gBody.temp_gpt_msg){
						html += "					<button class='ico btn-chat-more on mk'>더보기</button>";
					}					
					html += "				</div>";	
				}				
				if (init == "D"){				
					if (isonetoone){
						html += "				<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"<span class='ico-new' style='display:none' id=\"ico-new_"+msgid+"\"></span></div>";
					}else{
						html += "				<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";
					}					
				}else{					
					html += "				<div class='time' id='time_"+bun+"' data='"+msgid+"'>"+time+"</div>";
				}					
				if (!gBody.is_my_chat  && gBody.cur_cid != "chatgpt"){
					if (ucnt > 0){
						html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
					}
				}				
				html += "			</div>";				
				html += "		</div>";	
			}
		}else{
			//이전 입력 데이터와 동일한 시간:분 이 아닐 경우 별도로 표시해 준다.
			var person_img = "";						
			if (opt == "you"){				
				//var person_img = gap.person_profile_photo(gap.cur_room_att_info_list_search(key));
				var person_img = gap.person_profile_photo(pxuser);
				if (key == "chatgpt"){
					person_img = gap.chat_photo();
				}				
				html += "		<div class='"+opt+"' data='"+key +"^" + date+"^" + time+"' id='"+bun+"'>";
				html += "			<div class='user'>";
				html += "				<div class='user-thumb' data='"+key+"' data4='"+name+"'>"+person_img+"</div>";
				html += "			</div>";
				html += "			<div class='name'>"+ xuser + "</div>";				
				html += "			<div class='talk'>";
				html += "               <br id='br_"+msgid+"'>"
								
				if (rdis){
					html += "				<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"' style='max-width:cacl(100% - 60px)'>";
					html += "					<div class='balloon msg-fold'><span class='tail ico'></span>";
					if (istrans){
						html += "						<div><span id='msg_"+msgid+"' class='trans_you1'>"+message+"</span>";
						html += "							<span class='trans_gap'> <span class='trans_you2'>"+ tx + "</span> " + tmsg+"</span>";
						html += "						</div>";
					}else{
						if (isNotice){
							html += "						<div style='padding:0px'><span id='msg_"+msgid+"' class='xgptcls'>"+message+"</span></div>";
						}else{
							html += "						<div><span id='msg_"+msgid+"' class='xgptcls'>"+message+"</span></div>";
						}
						
					}					
					html += "						<span class='balloon-btn'><button class='btn-expand'>"+gap.lang.expand+"</button></span>";
					html += "					</div>";	
				}else{
					html += "				<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"'>";
					html += "					<div class='balloon'><span class='tail ico'></span>";							
					if (istrans){
						html += "						<div><span id='msg_"+msgid+"' class='trans_you1'>"+message+"</span>";
						html += "							<span class='trans_gap'> <span class='trans_you2'>"+ tx + "</span> " + tmsg+"</span>";
						html += "						</div>";
					}else{
						if (isNotice){
							html += "						<div style='padding:0px'><span id='msg_"+msgid+"' class='xgptcls'>"+message+"</span></div>";
						}else{
							html += "						<div><span id='msg_"+msgid+"' class='xgptcls'>"+message+"</span></div>";
						}
						
					}
					html += "					</div>";	
				}				
				if (tp2 != 100 && !gBody.is_my_chat  && gBody.cur_cid != "chatgpt" && !isNotice){
					html += "					<button class='ico btn-chat-more on mk'>더보기</button>";
				}			
				html += "				</div>";			
				html += "				<div class='time' style='margin-left:10px' id='time_"+bun+"'  data='"+msgid+"'>"+time+"</div>";					
				if (!gBody.is_my_chat  && gBody.cur_cid != "chatgpt" && !isonetoone){
					if (ucnt > 0){
						html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ucnt+"</span>";
					}
				}				
				html += "			</div>";
				html += "		</div>";					
			}else{				
				var person_img = gap.person_profile_photo(gap.userinfo.rinfo);
				html += "		<div class='"+opt+"' data='"+key +"^" + date+"^" + time+"' id='"+bun+"'>";
				html += "			<div class='user'>";
				html += "				<div class='user-thumb' data='"+key+"' data4='"+name+"'>"+person_img+"</div>";
				html += "			</div>";
				html += "			<div class='name'>"+name + gap.lang.hoching+"</div>";
				html += "			<div class='talk'>";
				html += "               <br id='br_"+msgid+"'>";							
				if (tp == "log"){					
					if (rdis){
						html += "				<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"' style='max-width:calc(100% - 60px)'>";
						html += "					<div class='balloon msg-fold'><span class='tail ico'></span>";
						if (istrans){
							html += "						<div><span id='msg_"+msgid+"' class='trans_me1'>"+message+"</span>";
							html += "							<span class='trans_gap'><span class='trans_me2'>"+ tx + "</span> " + tmsg+"</span>";
							html += "						</div>";
						}else{
							if (isNotice){
								html += "						<div style='padding:0px'><span id='msg_"+msgid+"' class='xgptcls'>"+message+"</span>";							
								html += "						</div>";
							}else{
								html += "						<div><span id='msg_"+msgid+"' class='xgptcls'>"+message+"</span>";							
								html += "						</div>";
							}

						}						
						html += "						<span class='balloon-btn'><button class='btn-expand'>"+gap.lang.expand+"</button></span>";
						html += "					</div>";
					}else{		
						html += "				<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"'>";
						html += "					<div class='balloon'><span class='tail ico'></span>";
						if (trans){
							html += "						<div><span id='msg_"+msgid+"' class='trans_me1'>"+message+"</span>";
							html += "							<span class='trans_gap'><span class='trans_me2'>"+ tx + "</span> " + tmsg+"</span>";
							html += "						</div>";
						}else{
							if (isNotice){
								html += "						<div style='padding:0px'><span id='msg_"+msgid+"' class='xgptcls'>"+message+"</span></div>";
							}else{
								html += "						<div><span id='msg_"+msgid+"' class='xgptcls'>"+message+"</span></div>";
							}
							
						}						
						html += "					</div>";
					}
					if (tp2 != 100 && !gBody.is_my_chat  && gBody.cur_cid != "chatgpt"){
						html += "					<button class='ico btn-chat-more on mk'>더보기</button>";
					}					
					html += "				</div>";					
				}else{					
					if (rdis){
						html += "				<div class='wrap-message disabled' id='"+msgid+"' style='max-width:calc(100% - 60px)'>";
						html += "					<div class='balloon msg-fold'><span class='tail ico'></span>";
						if (istrans){
							html += "						<div><span id='msg_"+msgid+"' class='trans_me1'>"+message+"<span>";
							html += "							<span class='trans_gap'><span class='trans_me2'>"+ tx + "</span> " + tmsg+"</span>";
							html += "						</div>";
						}else{
							if (isNotice){
								html += "						<div style='padding:0px'><span id='msg_"+msgid+"' class='xgptcls'>"+message+"<span>";
							}else{
								html += "						<div><span id='msg_"+msgid+"' class='xgptcls'>"+message+"<span>";
							}
							
						}						
						html += "						</div>";
						html += "						<span class='balloon-btn'><button class='btn-expand'>"+gap.lang.expand+"</button></span>";
						html += "					</div>";
					}else{
						html += "				<div class='wrap-message disabled' id='"+msgid+"'>";
						html += "					<div class='balloon'><span class='tail ico'></span>";
						if (istrans){
							html += "						<div><span id='msg_"+msgid+"' class='trans_me1'>"+message+"<span>";
							html += "							<span class='trans_gap'><span class='trans_me2'>"+ tx + "</span> " + tmsg+"</span>";
							html += "						</div>";
						}else{
							if (isNotice){
								html += "						<div style='padding:0px'><span id='msg_"+msgid+"' class='xgptcls'>"+message+"<span>";							
								html += "						</div>";
							}else{
								html += "						<div><span id='msg_"+msgid+"' class='xgptcls'>"+message+"<span>";							
								html += "						</div>";
							}

						}
						html += "					</div>";
					}					
					if (gBody.cur_cid != "chatgpt" && !gBody.temp_gpt_msg){
						html += "					<button class='ico btn-chat-resend'>재전송</button>";
					}			
					if (tp2 != 100 && !gBody.is_my_chat  && gBody.cur_cid != "chatgpt" && !gBody.temp_gpt_msg){
						html += "					<button class='ico btn-chat-more on mk'>더보기</button>";
					}					
					html += "				</div>";	
				}				
				if (init == "D"){					
					if (isonetoone){
						html += "				<div class='time' id='time_"+bun+"' data='"+msgid+"'>"+time+"<span class='ico-new' style='display:none' id=\"ico-new_"+msgid+"\"></span></div>";
					}else{
						html += "				<div class='time' id='time_"+bun+"' data='"+msgid+"' >"+time+"</div>";
					}					
				}else{					
					html += "				<div class='time' id='time_"+bun+"' data='"+msgid+"'>"+time+"</div>";
				}							
				if (!gBody.is_my_chat  && gBody.cur_cid != "chatgpt"){
					if (ucnt > 0){
						html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"'>"+ucnt+"</span>";
					}
				}				
				html += "			</div>";				
				html += "		</div>";					
			}		
		}			
		
		
		if (init == "D"){			
			if (html != ""){				
				$("#" + draw_dis + " #web_chat_dis_"+date).append(html);
				$("#" + draw_dis + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");				
				if (gBody.cur_cid == gma.cur_cid_popup){
					if (draw_dis == "chat_msg_dis"){
						$("#alarm_chat_sub" + " #web_chat_dis_"+date).append(html);
						$("#alarm_chat_sub" + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
						gap.scroll_move_to_bottom_time(gBody.chat_show_popup, 100);
					}else if (draw_dis == "alarm_chat_sub"){
						$("#chat_msg_dis" + " #web_chat_dis_"+date).append(html);
						$("#chat_msg_dis" + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
						gap.scroll_move_to_bottom_time(gBody.chat_show, 100);
					}
				}							
			}else{
				//중간단계 메시지 위치를 조정한다.
				$("#alarm_chat_sub" + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
				$("#chat_msg_dis" + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
			}
			if (gma.chat_position == "popup_chat"){
				$("#alarm_chat_msg").val("");
				$("#alarm_chat_msg").focus();	
			}else{
				$("#message_txt").val("");
				$("#message_txt").focus();	
			}		
			$("#chat_msg .date:first" ).css( "margin-top", "0px" );
		
			if (gma.chat_position == "channel" || gma.chat_position == "popup_chat"){
				ttm = $("#"+draw_dis+" .date:first" ).css( "margin-top", "0px" );
			}			
			gap.scroll_move_to_bottom_time(draw_dis_parent, 100);			
			if (gBody.cur_cid == gma.cur_cid_popup){
				//동시 작성되는 화면에 자동 스크롤 내린다.
				if (draw_dis_parent == gBody.chat_show){
					gap.scroll_move_to_bottom_time(gBody.chat_show_popup, 100);
				}else{
					gap.scroll_move_to_bottom_time(gBody.chat_show, 100);
				}
			}			
		}else{			
			if (html != ""){
				if (init == "T"){					
					if (croom_key == "" || croom_key== gBody.cur_cid){
						
						$("#" + draw_dis + " #web_chat_dis_"+date).append(html);					
						$("#" + draw_dis + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
					}				
					if (draw_dis != "alarm_chat_sub"){
						if (croom_key == "" || croom_key == gma.cur_cid_popup){
							if (!gma.click_left_menu){
								$("#alarm_chat_sub" + " #web_chat_dis_"+date).append(html);
								$("#alarm_chat_sub" + " #web_chat_dis_"+date).find(".ucnt").last().css("top","0px");
							}
						}
					}
				}else{					
					if (gBody.lastchatter == key + date + time){
						$(html).insertAfter("#" + draw_dis + " #date_"+date);
					}else{					
						var last_id = gBody.last_draw_id;
						$(html).insertAfter($("#" + draw_dis + " #date_"+date));
					}					
				}				
			}			
		}		
		gBody.lastchatter = key + date + time;		
		gBody.last_enter_id = msgid;
		gBody.last_enter_type = "msg";				
		if (init == "F"){
			//동일 분 그룹했을때 처음 메시지 꼬리 이미지를 제거하고 첫 메시지만 꼬리 이미지를 추가한다.
			$("#"+draw_dis_parent+" .talk").first().find(".tail.ico").removeClass("ico");
			$("#"+draw_dis_parent+" .talk").first().find(".wrap-message").first().find(".tail").addClass("ico");
		}		
		
		if (init == "D"){
			gBody.last_msg.ty = type;
			if (tmm != ""){
				gBody.last_msg.msg = tmm;	
			}else{
				gBody.last_msg.msg = message;	
			}
				
		}	
		
		
	//	if (opt == "me"){		
			gBody.delete_icon_action();				
	//	}		
		gBody.msg_drag_action();		
		gBody.user_profile_popup();		
		gBody.img_open_reply();
		
		$(".wrap-message .msg_notice").off().on("click", function(e){
			//공지사항 팝업 띄우기
			var id = $(e.currentTarget).attr("data");
			
			var re = "chat";
			if (gap.isPopup(e.currentTarget)){
				re = "quick_chat";
			}
			gap.noticeOpen(id, re);
		});
		
		$("#realtime_video2").off();
		$("#realtime_video2").on("click", function(e){						
			gap.showConfirm({
				title : "Confrim",
				contents : gap.lang.video_in,
				callback : function(){
					gap.invite_video_chat2();
				}
			});
		});		
		//텍스트 내용 더블 클릭하면 복사할 수 있게 영역을 잡아 준다.
		$(".wrap-message .balloon").on("dblclick", function(){		
			var id = $(this).parent().attr("id");
			id = "msg_" + id;
			gBody.selectText(id);
		});		
		$(".wrap-message .balloon-btn").off().on("click", function(){			
			if ($(this).children().hasClass("btn-expand")){
				$(this).children().text(gap.lang.fold);
				$(this).children().attr("class","btn-fold");
				$(this).parent().attr("class","balloon msg-expand");
			}else{
				$(this).children().text(gap.lang.expand);
				$(this).children().attr("class","btn-expand");
				$(this).parent().attr("class","balloon msg-fold");
			}
			return false;			
		});		
		//메일목록 관련 이벤트 등록하기
		$(".mail-attach-list button").off().on("click", function(e){			
			//m_ul_"+msgid+
			var id = $(e.currentTarget).attr("data");
			if ($(e.currentTarget).hasClass("on")){
				$("#m_ul_"+ id).hide();
				$(e.currentTarget).removeClass("on");				
			}else{
				$("#m_ul_"+ id).show();
				$(e.currentTarget).addClass("on");
			}
		});		
		$(".chat-mail dl").off().on("click", function(e){		
			//메일을 조회한다.
			var id = $(e.currentTarget).attr("data");
			var tunid = $("#mail_" + id).attr("data1");
			var tdb = $("#mail_" + id).attr("data2");
			var target_server = $("#mail_" + id).attr("data3");		
			
			gBody4.openMail_layer(tunid, "body", tdb, target_server);
		});		
		$(".mail-attach-list li").off().on("click", function(e){
			//첨부파일을 다운로드 받는다.			
			var id = $(e.currentTarget).attr("data");
			var attname = $(e.currentTarget).attr("data2");			
			var tunid = $("#mail_" + id).attr("data1");
			var tdb = $("#mail_" + id).attr("data2");
			var target_server = $(e.currentTarget).attr("data3");	
			//var url = "/"+target_server +"/webchat/bigfile/bigmail"+tdb+".nsf/0/"+tunid+"/Body/M2/" + encodeURIComponent(attname);
			var url = "/"+target_server +"/webchat/bigfile/bigmail"+tdb+".nsf/0/"+tunid+"/$FILE/" +encodeURIComponent(attname);
			gap.file_download_mail(url, attname);			
			//gap.file_download2(url);	
		});		
		$("#chat_query").attr("placeholder", gap.lang.input_search_query);		
		$("#chat_query").off();
		$("#chat_query").keypress(function(evt){			
			if (evt.keyCode == 13){								
				$("#chat_query_btn").click();
				return false;
			}			
		});
		$("#chat_query_btn").off().on("click", function(e){			
			var input_txt = $("#chat_query").val();
			if (input_txt == ""){
				 mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
				 return false;
			}			
			$("#msg_query_btn_close").show();
			$("#chat_query_btn").hide();			
			$("#msg_query_btn_close").off().on("click", function(e){				
				$("#chat_query").val("");
				$("#msg_query_btn_close").hide();
				$("#chat_query_btn").show();
				
				gBody.searchMode = "F";				
				gBody.enter_chatroom_for_chatroomlist(gBody.cur_cid, "", "");
			});			
			gBody.search_chatroom_content();
			return false;
		});				
		return html;
	},
	
	
	
	"change_setting_position" : function(draw_dis, isonetoone){		
		var objx = $("#" + draw_dis + " .wrap-message").last().prev().prev();
		var xxid = $(objx).attr("id");
		var mdata = $(objx).attr("mdata");		
		//마지막 바로 위에 있는 new-icon data값을 이전 값으로 변경해 준다.
		var kk = $(objx).attr("mid");
		var more_btn = $(objx).find(".mk");
		$(more_btn).attr("data",kk);		
		var cur_chatroom_last_read = gBody.last_other_read_id;		
		if (isonetoone){
			if ((cur_chatroom_last_read < parseFloat(mdata)) || typeof(mdata) == "undefined"){
				//typeof(mdata) == "undefined" 일 경우는 첫메시지 체크 전송 체크 이전에 바로 다음 메시지를 발송한 경우
				objx.append("<span class='ico-new' style='display:none' id=\"ico-new_"+xxid+"\" data='"+mdata+"'></span>");
			}
		}						
		var kyk = $("#" + draw_dis + " .wrap-message").last();
		var cck = $(kyk).attr("id");		
		if (isonetoone){
			var isNewicon = $(kyk).find(".ico-new");
			if (isNewicon.length == 0){
				var ccid = $(kyk).attr("mid");
				if ((cur_chatroom_last_read < parseFloat(mdata)) || typeof(ccid) == "undefined"){					
					$(kyk).next().append("<span class='ico-new' style='display:none' id=\"ico-new_"+xxid+"\" data='"+ccid+"'></span>");
				}
			}		
		}			
	},
	
	"change_setting_position_file" : function(draw_dis, isonetoone){
		//연속으로 입력할때 그룹을 매칭되면 상단에 있는 메시지에 읽지 않음 메시지를 표시해야 한다.						
		var objx = $("#" + draw_dis + " .wrap-message").last().prev().prev();
		var xxid = $(objx).attr("id");
		var mdata = $(objx).attr("mdata");							
		var cur_chatroom_last_read = gBody.last_other_read_id;					
		if (isonetoone){
			if ((cur_chatroom_last_read < parseFloat(mdata)) || typeof(mdata) == "undefined"){
				//typeof(mdata) == "undefined" 일 경우는 첫메시지 체크 전송 체크 이전에 바로 다음 메시지를 발송한 경우
				objx.append("<span class='ico-new' style='display:none' id=\"ico-new_"+xxid+"\" data='"+mdata+"'></span>");
			}
		}												
		var kyk = $("#" + draw_dis + " .wrap-message").last();
		var cck = $(kyk).attr("id");						
		if (isonetoone){
			var isNewicon = $(kyk).find(".ico-new");
			if (isNewicon.length == 0){
				var ccid = $(kyk).attr("mid");
				if ((cur_chatroom_last_read < parseFloat(mdata)) || typeof(ccid) == "undefined"){								
					$(kyk).next().append("<span class='ico-new' style='display:none' id=\"ico-new_"+xxid+"\" data='"+ccid+"'></span>");
				}
			}		
		}	
	},
	
	"selectText" : function (containerid){		
		 if (document.selection) { // IE
	        var range = document.body.createTextRange();
	        range.moveToElementText($("#" + containerid)[0]);
	        range.select();
	     } else if (window.getSelection) {
	        var range = document.createRange();
	        range.selectNode($("#" + containerid)[0]);
	        window.getSelection().removeAllRanges();
	        window.getSelection().addRange(range);
	    }
	},
		
	"exit_chatroom_dis" : function(info){		
		//1:N 대화중에 특정 사용자가 채팅방을 나간경우
		//현재창이 특정사용자가 나간 대화창이면 나갔다고 표시해 줘야 한다.	
		if (gBody.cur_cid == info.cid[0]){
			//나간 사용자의 key값으로 정보를 검색해서 한글 / 영어 이름을 표시해 줘야 한다.
			var lists = gBody.cur_room_att_info_list;
			var name = "";
			for (var i = 0 ; i < lists.length; i++){
				var xinfo = lists[i];
				if (info.ky == xinfo.ky){
					if (gap.cur_el == xinfo.el){
						name = xinfo.nm;
					}else{
						name = xinfo.enm;
					}
					break;
				}
			}			
			gBody.chatroom_enter_msg(name, "l", info.dt, "D", info.sq, "");	
			var myArray = gBody.cur_room_att_info_list;
			for (var i = myArray.length - 1; i >= 0; --i) {
			    if (myArray[i].ky == info.ky) {
			        myArray.splice(i,1);
			    }
			}			
			gBody.draw_chat_room_members();
		}		
		_wsocket.load_chatroom_list();
	},
	
	"enter_chatroom_dis" : function(sinfo){						
		if (sinfo.ky != gap.search_cur_ky()){
			var item = sinfo.att[0];			
			if (gBody.cur_cid == sinfo.cid){
				//같은 방에 사용자가 초대된 경우
				var name = item.nm;			
				if (gap.curLang != "ko"){
					if (gap.userinfo.rinfo.el == gap.curLang){
						name = item.onm;
					}else{
						name = item.enm;
					}
				}
				sq = sinfo.cid.replace(/\^/, "_") + "_" + sinfo.dt;
				gBody.chatroom_enter_msg(name, "e", "", "D", sq, "");				
				gap.chatroom_push_att(sinfo.cid, item);
			}			
			gap.chatroom_push_att(sinfo.cid, item);			
		}
	},	
	
	"chatroom_enter_msg" : function(name, opt, tim, init, sq, ek, croom_key){
		
		//name : 이름, opt : "e"입장 , "l"퇴장, tim이 있으면 그걸로 계산하고 없으면 현재 시간을 계산한다.		
		var draw_dis = gBody.chat_show_dis;
		var draw_dis_parent = gBody.chat_show;		
		if (typeof(ek) != "undefined"){
			if (ek.indexOf("channel") > -1){
				draw_dis = gBody.chat_show_channel_sub;
				draw_dis_parent = gBody.chat_show_channel;
			}else if (ek.indexOf("popup") > -1 || gma.chat_position == "popup_chat"){
				draw_dis = gBody.chat_show_popup_sub;
				draw_dis_parent = gBody.chat_show_popup;
			}
		}		
		var date = "";
		var time = "";
		if (tim != ""){			
			var cdate = gap.change_date_localTime_full(tim.toString());			
			//date = gap.search_today_only3(tim);	
			date = gap.search_today_only3(cdate);	
			time = gap.change_date_localTime_only_time(tim.toString());
		}else{
			date = gap.search_today_only2();
			time = gap.search_time_only();
		}		
		var dis_date = gap.change_date_default(gap.search_today_only3(date));
		var dis_id = "date_" + date;		
		var cnt = $("#" + draw_dis + " #web_chat_dis_" + date).length;
		if (cnt == 0){			
			var html = "";
			html += "	<div class='wrap-chat' id='web_chat_dis_"+date+"'>";
			html += "		<div class='date' id='"+dis_id+"'><span>"+dis_date+"</span></div>";
			html += "   </div>";	
			hx = $("#"+draw_dis_parent+" .wrap-chat").length;			
			if (hx == 0){				
				if (typeof(ek) != "undefined"){
					if (ek.indexOf("channel") > -1){
						$("#"+draw_dis).html(html);
					}else if (ek.indexOf("popup") > -1 || gma.chat_position == "popup_chat"){					 
						//$("#"+draw_dis).html(html);
						$(html).prependTo($("#" + draw_dis));
					}else{
						$(html).prependTo($("#" + draw_dis));					 
					}
				}else{
					$(html).prependTo($("#"+draw_dis));
				}
			}else{				
				if (typeof(ek) != "undefined"){
					if (ek.indexOf("channel") > -1){
						$("#"+draw_dis).children().last().append(html);
					 }else if (ek.indexOf("popup") > -1 || gma.chat_position == "popup_chat"){
						 if (init == "T" || init == "D"){
								$("#"+draw_dis).children().last().append(html);
							}else{
								$(html).prependTo($("#"+draw_dis));
							}
					 }else{
						 if (init == "T" || init == "D"){
							$("#chat_msg_dis").children().last().append(html);
						}else{
							$(html).prependTo($("#chat_msg_dis"));
						}
					 }
				}else{
					 if (init == "T" || init == "D"){
						$("#"+draw_dis).children().last().append(html);
						
					}else{
						$(html).prependTo($("#"+draw_dis));
					}
				}
			}
		}		
		var spl = name.split("-spl-");
		for (var k = 0 ; k < spl.length; k++){
			var info = spl[k];			
			var dis = "";
			if (opt == "e"){
				dis = info + gap.lang.enter_chat;
			}else{
				dis = info + gap.lang.exit_chat;
			}	
			var html = "<div class='alarm-user' id='"+sq+"'><span>" + dis + " [" + time +"]</span></div>";			
			if (init == "D" || init == "T"){
				if (croom_key == "" || croom_key== gBody.cur_cid){
					$("#" + draw_dis + " #web_chat_dis_" + date).append(html);
				}
				
				if (draw_dis != "alarm_chat_sub"){
					if (croom_key == "" || croom_key == gma.cur_cid_popup){
						if (!gma.click_left_menu){
							$("#alarm_chat_sub" + " #web_chat_dis_"+date).append(html);
						}						
					}
				}
				
			}else{
				$("#" + draw_dis + " #date_" + date).after(html);
			}
		}	
	},
	
	"send_emoticon_msg" : function(fname){		
		
		var date = new Date();		
		var dt = date.YYYYMMDDHHMMSS();	
		var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.		
		var obj = new Object();		
		obj.type = "emoticon";
		obj.mid = msgid;   //랜덤한 키값을 생성한다.;
		obj.msg = fname;
		obj.cid = gBody.cur_cid;
		obj.ty = 3;
		obj.dt = dt;
		obj.ky = gap.search_cur_ky();			
		var ucnt = gBody.cur_room_att_info_list.length - 1;
		obj.ucnt = ucnt;		
		var croom_key = gBody.cur_cid;
		
//		var rinfo = "";			
//		var reply_info = new Object();
//		if ($(".reply-chat-wrap").length > 0){
//			rinfo = gBody.cur_reply_chat_info;			
//			reply_info.ky = gap.userinfo.rinfo.ky;
//			reply_info.ex = new Object();
//			reply_info.ex.reply = rinfo;
//		}else{
//			reply_info = "";
//		}
		
		if ($(".reply-chat-wrap").length > 0){
			var op = new Object();
			op.reply = gBody.cur_reply_chat_info;
			obj.ex = op;
//			if (ek == "popup"){
//				gHome.replyChatBottomHide("alarm");
//			}else{
				gBody.replyChatBottomHide();
//			}	
		}		
		gBody.chatroom_emoticon_msg(obj, "D", "", croom_key);			
		gBody.check_display_layer();		
		_wsocket.send_chat_msg(obj);		
		var timex_1 = setTimeout(function(){
			//채팅창 이외에서 이모티콘을 전송하지 못하기 때문에 주석 처리한다.
			gap.scroll_move_to_bottom("chat_msg");		
			clearTimeout(timex_1);
		}, 1000);			
		$("#open_emoticon").qtip("hide");
	},	
	
	"chatroom_emoticon_msg" : function (info, init, ek, croom_key){		
		
		var draw_dis = gBody.chat_show_dis;
		var draw_dis_parent = gBody.chat_show;		
		if (typeof(ek) != "undefined" && ek != ""){
			if (ek.indexOf("channel") > -1){
				draw_dis = gBody.chat_show_channel_sub;
				draw_dis_parent = gBody.chat_show_channel;
			}else if (ek.indexOf("popup") > -1 || gma.chat_position == "popup_chat"){
				draw_dis = gBody.chat_show_popup_sub;
				draw_dis_parent = gBody.chat_show_popup;
			}
		}		
		var isonetoone = gap.search_is_onetoone();
		var mlen = $("#" + draw_dis + " .wrap-message").length;		
		var	date = "";
		var time = "";		
		var msgid = "";
		if (init == "D"){
			date = gap.search_today_only2();
			time = gap.search_time_only();	
			msgid = info.mid;
		}else{
			var tim = info.dt;			
			var cdate = gap.change_date_localTime_full(tim.toString());
			date = gap.search_today_only3(cdate);
			time = gap.change_date_localTime_only_time(tim.toString());
			msgid = info.sq;
		}		
		var dis_date = gap.change_date_default(gap.search_today_only3(date));
		var dis_id = "date_" + date;
		var cnt = $("#" + draw_dis + " #web_chat_dis_" + date).length;		
		if (cnt == 0){
			var html = "";
			html += "	<div class='wrap-chat' id='web_chat_dis_"+date+"' style='margin-top:30px'>";
			html += "		<div class='date' id='"+dis_id+"'><span>"+dis_date+"</span></div>";
			html += "   </div>";					
			var hx = $("#"+draw_dis_parent+" .wrap-chat").length;			
			if (hx == 0){
				$("#"+draw_dis).html(html);		
			}else{
				if (init != "D"){
					//기존거 위에다 표시해야 한다.				
					if (init == "F"){
						$(html).insertBefore($("#"+draw_dis_parent+" .wrap-chat").first());
					}else{		
						if (croom_key != ""){
							if (croom_key == gBody.cur_cid){
								$(html).insertAfter($("#"+gBody.chat_show_dis+ " .wrap-chat").last());
							}else if (croom_key == gma.cur_cid_popup){
								//$(html).insertAfter($("#"+gBody.chat_show_popup_sub+ " .wrap-chat").last());
							}
						}else{
							$(html).insertAfter($("#"+draw_dis_parent+" .wrap-chat").last());
						}
					}										
				}else{			
					//$("#"+draw_dis).children().last().append(html);	
					$("#"+draw_dis).append(html);
					if (gBody.cur_cid == gma.cur_cid_popup){
						//직접입력하는 경우 하단과 팝업 채팅창 모두 표시해야 한다.
						if (draw_dis == "chat_msg_dis"){
							$("#alarm_chat_sub").append(html);	
						}else if (draw_dis == "alarm_chat_sub"){
							$("#chat_msg_dis").append(html);	
						}
					}
				}				
			}
		}		
		var bun = "";
		if (init == "D"){
			var xydate = new Date();		
			var today = xydate.YYYYMMDD();
			bun = today + time.replace(":","");
		}else{
			var xdate = gap.search_today_only3(date);	
			var xtime = gap.change_date_localTime_only_time(date.toString());		
			bun = xdate + xtime.replace(":","");
		}	
//		var person_img = gap.person_profile_photo(gap.cur_room_att_info_list_search(info.ky));
//		var userinfo = gap.cur_room_att_info_list_search(info.ky);
		
		
		var person_img = "";
		var userinfo = gap.cur_room_att_info_list_search(info.ky);
		
		
		var html = "";		
		var opt = "me";
		if (info.ky != gap.search_cur_ky()){
			opt = "you";
		}		
		var xuser = "";		
		if (opt == "you"){			
			if (typeof(userinfo) != "undefined"){
				var sxuser = gap.user_check(userinfo);
				var xuser = sxuser.disp_user_info;
				
				person_img = gap.person_profile_photo(sxuser);

			}else{
				pxuser = gap.cur_room_att_person_img_info_search4(info.ky, croom_key);		
				if (typeof(pxuser) != "undefined"){
					var sxuser = gap.user_check(pxuser);
					xuser = sxuser.disp_user_info;
					
					
					person_img = gap.person_profile_photo(pxuser);
					userinfo = pxuser;
				}else{
					//xuser = info.name ; //+ " | " + dept;
					if (typeof(userinfo) == "undefined"){							
						var ppx = gap.search_user_emp(info.ky);							
						ppx = JSON.parse(ppx.responseText);		
						if (ppx[0].length == 0){
							//퇴사자으이 경우
							xuser = name ; //+ " | " + dept;
							var userinfo = new Object();
							userinfo.ky = key;
							userinfo.nm = "";
						}else{
							userinfo = ppx[0][0];
							pxuser = userinfo;
							var sxuser = gap.user_check(pxuser);
							xuser = sxuser.disp_user_info;
						}						
					}
					
				}			
			//	xuser = info.nm;
			}	
		}else{
			person_img = gap.person_profile_photo(gap.cur_room_att_info_list_search(info.ky));
			
		}		
		var name = "";
		var dept = "";
		var tcolor = "";
		var bimg_path = "";
		if (opt == "me"){
			name = userinfo.nm;
			tcolor = "#dadae4";
			bimg_path = "ic_reply_red.png";
		}else{
			tcolor = "#a8a8ac";
			bimg_path = "ic_reply_gr.png";
		}
		
		var key = info.ky;		
		html += "<div class='"+opt+"' id='emo_"+msgid+"' data='"+key +"^" + date+"^" + time+"'>";
		html += "	<div class='user'>";
		html += "		<div class='user-thumb' data='"+userinfo.ky+"' data4='"+userinfo.nm+"'>"+person_img+"</div>";
		html += "	</div>";		
		if (opt == "me"){
			if (dept != ""){
				html += "	<div class='name'>" + name + gap.lang.hoching + " | " + dept + "</div>";
			}else{
				html += "	<div class='name'>" + name + gap.lang.hoching+ "</div>";
			}
		}else{
			html += "	<div class='name'>" + xuser + "</div>";
		}	
		html += "		<div class='talk img'>";		
		html += "			<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"'>";
		if (typeof(info.ex) != "undefined"){	
			var rinfo = info.ex.reply;
			var rpinfo = rinfo;
			var rmsg = rinfo.msg.replace(/[\n]/gi, "<br>");				
			var tip = gBody.reply_title_setting(info);
			if (rpinfo.ty == "3"){
				//이모티콘의 답장일 경우
				var rhtml = "<span style='display:flex; flex-direction:row'>";
				rhtml += "<span><img style='width:40px; margin-right:5px' src='/resource/images/emoticons/" +rpinfo.msg+ "'></span>";				
				rhtml += "<span style='display:flex; flex-direction:column'>";
				rhtml += "	<span style='min-width:110px'>" + tip + "</span>";
				rhtml += "	<span style='color:"+tcolor+"; font-size:13px; overflow:hidden; text-overflow:ellipsis' class='rmsg_cls'>"+gap.lang.emoti+"</span>";
				rhtml += "</span>";
			}else if (rpinfo.ty == "5"){
				//파일을 답장한 부분 표시하기
				var rfilename = rpinfo.ex.nm.replace("'","`");	
				var chatserver_domain = gap.search_chatserver_domain(rpinfo.ex.nid);				    	  
		    	var downloadurl = chatserver_domain+ "/filedown" + rpinfo.ex.sf + "/" + rpinfo.ex.sn + "/" + encodeURIComponent(rfilename);		    	
		    	var caller = "2"		
	    		if (typeof(info.ex) != "undefined" && typeof(info.ex.caller) != "undefined"){
	    			caller = info.ex.caller;
	    		}
		    	var key = rinfo.ky;	
				
				var rhtml = "<span style='display:flex; flex-direction:column'>";
				rhtml += "<span>" + tip + "</span>";
				rmsg = gap.lang.file + " : " + rmsg;				
				rhtml += "<span style='display:flex; flex-direction:row;min-width:155px'>";
				rhtml += "	<span class='reply_file_thumbail' data1='"+downloadurl+"' data2='"+rfilename+"' data3='"+caller+"' data4='"+key+"' style='cursor:pointer; color:"+tcolor+"; font-size:13px; overflow:hidden; text-overflow:ellipsis;padding-right:10px'>" + rmsg + "</span>";
				rhtml += "		<span>";
				rhtml += "			<button class='ico btn-file-download_reply' title='File download' style='background-position:-210px -20px; width:16px; height:16px; position:initial'>다운로드</button>";
				rhtml += "	</span>";
				rhtml += "</span>"
			}else if (rpinfo.ty == "6"){
				//이미지 파일을 답장한 부분 표시하기
				var isMultifiles = false;
				var multicount = 0;	
				var rin = "";
				var tsq = "";
				if (typeof(rpinfo.ex.files) != "undefined"){
					//묶음 발송된 경우
					var isMultifiles = true;
					multicount = rpinfo.ex.files.length;
					rin = rpinfo.ex.files[0];
					tsq = rpinfo.sq + "_0";
				}else{
					rin = rpinfo.ex;
					tsq = rpinfo.sq;
				}
				var impath = gap.fileupload_server_url + rin.sf + "/thumbnail/" + rin.sn;;	
				var rhtml = "<span style='display:flex; flex-direction:row'>";
				var rfilename = rin.nm.replace("'","`");	
				var chatserver_domain = gap.search_chatserver_domain(rin.nid);				    	  
		    	var downloadurl = chatserver_domain+ "/filedown" + rin.sf + "/" + rin.sn + "/" + encodeURIComponent(rfilename);
				var downloadpath = "";				
				rhtml += "<span><img class='reply_img_thumbail' data1='"+downloadurl+"' data2='"+rfilename+"' data3='"+tsq+"' style='cursor:pointer; width:40px;height:40px; margin-right:5px' src='"+impath+"'></span>";
				
				rhtml += "<span style='display:flex; flex-direction:column;min-width:110px'>";
				rhtml += "	<span>" + tip + "</span>";
				if (isMultifiles){
					if (gap.curLang == "ko"){
						rhtml += "	<span style='color:"+tcolor+"; font-size:13px; overflow:hidden; text-overflow:ellipsis' class='rmsg_cls'>"+gap.lang.sajin+ " " + multicount + "장</span>";
					}else{
						rhtml += "	<span style='color:"+tcolor+"; font-size:13px; overflow:hidden; text-overflow:ellipsis' class='rmsg_cls'>"+multicount + " " + gap.lang.sajin+ "</span>";
					}
				}else{
					rhtml += "	<span style='color:"+tcolor+"; font-size:13px; overflow:hidden; text-overflow:ellipsis' class='rmsg_cls'>"+gap.lang.sajin+"</span>";
				}
				
				rhtml += "</span>";
			}else{		
				var rhtml = "<span style='display:flex; flex-direction:column; max-width:100%' class='talk'>";
				rhtml += "<span style='min-width:155px'>" + tip + "</span>";			
				rhtml += "<span style='color:"+tcolor+"; font-size:13px; overflow:hidden; text-overflow:ellipsis;max-width:100%' class='rmsg_cls'>"+rmsg+"</span>";
				rhtml += "<span class='balloon-btn2' style='display:none'><button class='btn-expand'>"+gap.lang.expand+"</button></span>";
			}
			html += "	<div class='balloon' style='margin-bottom:5px'>";
			html += "		<span class='tail ico'></span>";
			html += "		<div>";
			html += "			<span>"+rhtml+"<span></span></span>";
			html += "		</div>";
			html += "	</div>";
		}		
//		html += "	</div>";//		
//		html += "			<div class='wrap-message' id='"+msgid+"' mid='"+msgid+"'>";
		if (opt == "me"){	
			html += "			<div class='img-content2' style='display:flex; justify-content:flex-end;'>";	
		}else{
			html += "			<div class='img-content2' style='display:flex; justify-content:flex-start;'>";	
		}			
		if (typeof(info.ex) != "undefined"){
			//이모티콘으로 답장을 했을 경우 답장 형태의 이미지를 추가한다.
			html += "			<div><img style='width:20px;height:20px' src='../resource/images/"+bimg_path+"'></div>";		
		}		
		html += "				<div class='img-thumb2'><img src='/resource/images/emoticons/"+info.msg+"' alt=''></div>";
		html += "			</div>";
		if (opt == "me"){
			if (!gBody.is_my_chat){
				html += "		<button class='ico btn-chat-more on'>더보기</button>";
			}	
		}else{
			html += "		<button class='ico btn-chat-more on'>더보기</button>";
		}		
		html += "	</div>";
		
		
		
		
		
		
		var ucnt = info.ucnt;
		if (opt == "me"){			
			html += "	<div class='time' id='time_"+bun+"' data='"+msgid+"'>"+time+"<span class='ico-new' style='display:none' id=\"ico-new_"+msgid+"\" data='"+msgid+"'></span></div>";
			if (!gBody.is_my_chat){
				if (ucnt > 0){
					html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ ucnt+"</span>";
				}
			}
		}else{
			html += "	<div class='time' style='margin-left:10px' id='time_"+bun+"' data='"+msgid+"'>"+time+"</div>";			
			if (!gBody.is_my_chat && !isonetoone){
				if (ucnt > 0){
					html += "				<span class='ucnt' id='ucnt_"+bun+"' data-bun='"+msgid+"' >"+ ucnt+"</span>";
				}
			}
		}			
		
		
		
		
		html += "	</div>";
		html += "</div>";				
		if (init == "D" || init == "T"){
			if (croom_key == "" || croom_key== gBody.cur_cid){
				$("#" + draw_dis + " #web_chat_dis_"+date).append(html);
			}		
			if (init == "D"){
				if (gBody.cur_cid == gma.cur_cid_popup){
					if (draw_dis == "chat_msg_dis"){
						$("#alarm_chat_sub #web_chat_dis_"+date).append(html);
						gap.scroll_move_to_bottom_time(gBody.chat_show_popup, 1000);
					}else if (draw_dis == "alarm_chat_sub"){
						$("#chat_msg_dis #web_chat_dis_"+date).append(html);
						gap.scroll_move_to_bottom_time(gBody.chat_show, 1000);
					}
					
					
				}	
			}else{
				if (draw_dis != "alarm_chat_sub"){
					if (croom_key == "" || croom_key == gma.cur_cid_popup){
						if (!gma.click_left_menu){
							$("#alarm_chat_sub" + " #web_chat_dis_"+date).append(html);
						}			
					}	
				}
				
				if (croom_key == gBody.cur_cid ){
					gap.scroll_move_to_bottom_time(gBody.chat_show, 1000);
				}
				if (croom_key == gma.cur_cid_popup){
					gap.scroll_move_to_bottom_time(gBody.chat_show_popup, 1000);
				}
			}
		}else{
			$("#" + draw_dis + " #date_" + date).after(html);
		}		
		
		
		gBody.last_enter_type = "emoticon";			
	//	if (opt == "me"){
			gBody.delete_icon_action();
	//	}		
			
		
		if (init == "D"){
			gBody.last_msg.ty = 3;
			gBody.last_msg.msg = info;	
		//	gBody.last_msg.msg = info.msg;
		}		
		
		
		gBody.reply_expand_check();
		gBody.img_open_reply();
	},
			
	"findUrls" : function(text){
		var source = (text || '').toString();
	    var urlArray = [];
	    var url;
	    var matchArray;
	    // Regular expression to find FTP, HTTP(S) and email URLs.
	//    var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;
	    var regexToken = /(((https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)/g;
	    // Iterate through any URLs in the text.
	    while( (matchArray = regexToken.exec( source )) !== null )
	    {
	        var token = matchArray[0];
	        urlArray.push( token );
	    }
	    return urlArray;
	},	
	
	"domain_search" : function(url){
		var domain;
	    //find & remove protocol (http, ftp, etc.) and get domain
	    if (url.indexOf("://") > -1) {
	        domain = url.split('/')[2];
	    }
	    else {
	        domain = url.split('/')[0];
	    }
	    domain = domain.split(':')[0];
	    return domain;
	},
	
	
	"search_og" : function(str, append_id, date, key, name, time){	
		var mlen = $(".wrap-message").length;		
		var xtime = time;
		var urlstr = gBody.findUrls(str);		
		if (urlstr.length == 0){
			return false;
		}
		var data = JSON.stringify({
			url : urlstr[0]
		});		
		var res = false;
		//var input_domain = urlstr[0].match(/(?<=https?:\/\/)(.*?)(?=$|[\/?\&])/)[0]; <== IE에서 적용되지 않는 정규식이라서 교체
		var input_domain = gBody.domain_search(urlstr[0]);
		var input_h = urlstr[0].match(/(.*?)(?=$|[\/?\&])/)[0];
		var input_url = input_h + "//" + input_domain;		
		var surl = gap.ogtag_search_url;
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : surl,
			data : data,
			success : function(res){				
				var og = res.data;				
				var ek = "";
				var cid = gBody.cur_cid;
				if (gma.chat_position == "popup_chat"){
					ek = "popup";
					cid = gma.cur_cid_popup;
				}				
				if (res.success){
					var html = "";
					var linkurl = og.ogUrl;									
					if (typeof(og.ogTitle) != "undefined"){			
					}
					if (typeof(og.ogDescription) != "undefined"){				
					}				
					if ( typeof(og.ogImage) != "undefined") {
						var cnt = og.ogImage.length;
						var url = og.ogImage.url;
						if (cnt > 1) {
							url = og.ogImage[0].url;
						}					
						var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.						
						 var obj = new Object();
				    	 obj.ty = 4;
				    	 obj.msg = str;
				    	 obj.cid = cid;
				    	 obj.mid = msgid;				    	 
				    	 var ucnt = gBody.cur_room_att_info_list.length - 1;						
						if (typeof(url) != "undefined" && url != ""){
							if (url.indexOf("http") < 0){
								var rurl = input_url;
								var turl = input_domain;
								if (url.indexOf("//" + turl) > -1){
									//https://www.kookmin.ac.kr 이 경우
									url = rurl.replace("//" + turl, "") + url.replace("./","/");
								}else if (url.indexOf(turl) > -1){
									url = rurl.replace(turl, "") + url.replace("./","/");
								}else if (url.substring(0,2) == "//"){
									if (rurl.indexOf("https") > -1){
										url = "https:" + url;
									}else{
										url = "http:" + url;
									}
								}else{
									url = rurl + url.replace("./","/");
								}						
							}							
							url = url.replace("cdn.ddaily.co.kr","www.ddaily.co.kr");							
							var regexToken = /(http(s)?:\/\/)([a-z0-9\w]+\.*)+[a-z0-9]{2,4}/g;						    
							var domain = regexToken.exec( og.ogUrl );							
							var title  = og.ogTitle;
							var desc = og.ogDescription;							
							if (domain != null){
								domain = domain[0];
							}else{
								domain = "";
							}							
							if (typeof(title) == "undefined"){
								title = "";
							}
							if (typeof(desc) == "undefined"){
								desc = "";
							}							
							gBody.ogtag_draw("me", key, xtime, linkurl, url, title, desc, domain, str, date, msgid, "", "D", ucnt, "", name, ek, cid);					
							if (gma.chat_position == "channel"){
								gap.scroll_move_to_bottom_time(gBody.chat_show_channel_sub, 50);
							}else if (gma.chat_position == "popup_chat"){
								gap.scroll_move_to_bottom_time(gBody.chat_show_popup_sub, 50);
							}else{
								gap.scroll_move_to_bottom_time("chat_msg", 50);	
							}							
							if (typeof(linkurl) == "undefined"){
								linkurl = urlstr;
							}					    	 
					    	var exobj = new Object();		    	 		    	 
					    	exobj.tle = title;
					    	exobj.lnk = linkurl;
					    	exobj.img = url;
					    	exobj.desc = desc;
					    	exobj.dmn = domain;					    
					    	obj.ex = exobj;				    	
					    	if (gBody.trans_lang != ""){
					    		obj.lang = gBody.trans_lang;
							}					    	
					    	_wsocket.send_chat_msg(obj);							
						}else{										 
							var exobj = new Object(); 
					    	exobj.lnk = str;		    
					    	obj.ex = exobj;					    					    	 
					    	gBody.ogtag_draw("me", key, xtime, "", "", "", "", "", str, date, msgid, "", "D", ucnt, "", name, ek, cid);	
					    	if (gma.chat_position == "channel"){					    	
					    		gap.scroll_move_to_bottom_time(gBody.chat_show_channel_sub, 50);	
					    	}else if (gma.chat_position == "popup_chat"){
					    		gap.scroll_move_to_bottom_time(gBody.chat_show_popup_sub, 50);
					    	}else{
					    		gap.scroll_move_to_bottom_time(gBody.chat_show, 50);	
					    	}					    	
					    	if (gBody.trans_lang != ""){
					    		obj.lang = gBody.trans_lang;
							}					    	
					    	_wsocket.send_chat_msg(obj);	
						}						
					}else{						
						var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.						
						var obj = new Object();
				    	obj.ty = 4;
				    	obj.msg = str;
				    	obj.cid = gBody.cur_cid;
				    	obj.mid = msgid;				    	 
				    	var exobj = new Object(); 
				    	exobj.lnk = str;		    
				    	obj.ex = exobj;				    	 
				    	gBody.ogtag_draw("me", key, xtime, "", "", "", "", "", str, date, msgid, "", "D", ucnt, "", name, ek, cid);	
				    	if (gma.chat_position == "channel"){
				    		gap.scroll_move_to_bottom_time(gBody.chat_show_channel_sub, 50);	
				    	}else if (gma.chat_position == "popup_chat"){
				    		gap.scroll_move_to_bottom_time(gBody.chat_show_popup_sub, 50);	
				    	}else{
				    		gap.scroll_move_to_bottom_time(gBody.chat_show, 50);	
				    	}				    	
				    	if (gBody.trans_lang != ""){
				    		obj.lang = gBody.trans_lang;
						}				    	 
				    	_wsocket.send_chat_msg(obj);
					}					
					res = true;					
				}else{				
					var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.					
					var obj = new Object();
			    	obj.ty = 4;
			    	obj.msg = str;
			    	obj.cid = gBody.cur_cid;
			    	obj.mid = msgid;			    	 
			    	var exobj = new Object(); 
			    	exobj.lnk = str;		    
			    	obj.ex = exobj;			    	 
			    	gBody.ogtag_draw("me", key, xtime, "", "", "", "", "", str, date, msgid, "", "D", ucnt, "", name, ek, cid);	
			    	if (gma.chat_position == "channel"){
			    		gap.scroll_move_to_bottom_time(gBody.chat_show_channel_sub, 50);	
			    	}else if (gma.chat_position == "popup_chat"){
			    		gap.scroll_move_to_bottom_time(gBody.chat_show_popup_sub, 50);	
			    	}else{
			    		gap.scroll_move_to_bottom_time(gBody.chat_show, 50);	
			    	}			    	
			    	if (gBody.trans_lang != ""){
			    		obj.lang = gBody.trans_lang;
					}			    	 
			    	_wsocket.send_chat_msg(obj);					
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.ogerror);
			}
		});		
		return res;
	},	
	
	"search_og_only_search" : function(str){
		//url을 넘기면 해당 ogTag 정보만 리턴해 주는 함수로 드래그 & 드롭으로 ogTag을 특정사용자에게 전달할때 정보를 읽어오기 위해서 만들었음.		
		var urlstr = gBody.findUrls(str);		
		if (urlstr.length == 0){
			return false;
		}
		var data = JSON.stringify({
			url : urlstr[0]
		});	
		var res = false;
		//var input_domain = urlstr[0].match(/(?<=https?:\/\/)(.*?)(?=$|[\/?\&])/)[0]; <== IE에서 적용되지 않는 정규식이라서 교체
		var input_domain = gBody.domain_search(urlstr[0]);
		var input_h = urlstr[0].match(/(.*?)(?=$|[\/?\&])/)[0];
		var input_url = input_h + "//" + input_domain;		
		var obj = new Object();
		var surl = gap.ogtag_search_url;
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : surl,
			async : false,
			data : data,
			success : function(res){				
				var og = res.data;
				if (res.success){
					var html = "";
					var linkurl = og.ogUrl;									
					if (typeof(og.ogTitle) != "undefined"){				
					}
					if (typeof(og.ogDescription) != "undefined"){				
					}
					if (typeof(og.ogImage) != "undefined"){
						var cnt = og.ogImage.length;
						var url = og.ogImage.url;
						if (cnt > 1) {
							url = og.ogImage[0].url;
						}						
						var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.						
				    	obj.ty = 4;
				    	obj.msg = str;
				    	obj.cid = gBody.cur_cid;
				    	obj.mid = msgid;						
						if (typeof(url) != "undefined" && url != ""){
							if (url.indexOf("http") < 0){
								var rurl = input_url;
								var turl = input_domain;
								if (url.indexOf("//" + turl) > -1){
									//https://www.kookmin.ac.kr 이 경우
									url = rurl.replace("//" + turl, "") + url.replace("./","/");
								}else if (url.indexOf(turl) > -1){
									url = rurl.replace(turl, "") + url.replace("./","/");
								}else if (url.substring(0,2) == "//"){
									if (rurl.indexOf("https") > -1){
										url = "https:" + url;
									}else{
										url = "http:" + url;
									}									
								}else{
									url = rurl + url.replace("./","/");
								}						
							}							
							url = url.replace("cdn.ddaily.co.kr","www.ddaily.co.kr");							
							var regexToken = /(http(s)?:\/\/)([a-z0-9\w]+\.*)+[a-z0-9]{2,4}/g;						    
							var domain = regexToken.exec( og.ogUrl );							
							var title  = og.ogTitle;
							var desc = og.ogDescription;							
							if (domain != null){
								domain = domain[0];
							}else{
								domain = "";
							}							
							if (typeof(title) == "undefined"){
								title = "";
							}
							if (typeof(desc) == "undefined"){
								desc = "";
							}
					    	 var exobj = new Object();		    	 		    	 
					    	 exobj.tle = title;
					    	 exobj.lnk = linkurl;
					    	 exobj.img = url;
					    	 exobj.desc = desc;
					    	 exobj.dmn = domain;					    
					    	 obj.ex = exobj;						
						}else{							
						}						
					}else{					
					}					
				}else{							
				}
			},
			error : function(e){
				alert(e);
			}
		});
		return obj;
	},
		
	"person_file_upload" : function(obj){
		//버디리스트에서 마우스 우클릭으로 파일 전송하기		
		var obb = obj;
		obj = obj.replace("li_main_","").replace("main_","");
		gBody.select_buddy_id = obj;				
		var html = "";
		html += "<div id='total-progress2' class='' style='height:1px; width: 100%; margin-left:0px; margin-top:7px'>";
		html += "	<div class='progress-bar' style='width:0%; background:#337ab7; height:2px ;' ></div>";
		html += "</div>";		
		if ($("#" + obb).hasClass("result-profile") || $("#" + obb).hasClass("usearch_person")){
			$("#" + obb).append(html);
		}else{
			//$("#" + gBody.select_buddy_id).parent().parent().append(html);
			$("#" + obb).append(html);
		}	
		$("#open_attach_temp").click();
	},
	
	"person_file_upload_chatroom" : function(obj){
		//대화방에서 마우스 우클릭으로 파일 전송하기		
		var obb = obj;
		var disoob = obj.replace("li_","");
		obj = obj.replace("li_main_","").replace("main_","");
		gBody.select_buddy_id = obj;				
		var html = "";
		if (obb.indexOf("main_") > -1){
			//메인 채팅방인 경우
			html += "<div id='total-progress2' class='' style='height:1px; width: 100%; margin-left:0px; margin-top:20px'>";
		}else{
			//채팅 리스트인 경우
			html += "<div id='total-progress2' class='' style='height:1px; width: 100%; margin-left:0px; margin-top:0px'>";
		}		
		html += "	<div class='progress-bar' style='width:0%; background:#337ab7; height:2px ;' ></div>";
		html += "</div>";				
		$(html).insertAfter("#" + disoob);	
		$("#open_attach_temp").click();
	},
	
	"context_menu_call_person" : function(key, options, obj){			
		var spl = key.split("-spl-");
		if (spl[0] == "talk"){			
			var uid = $("#"+ obj).attr("data");
			var name = $("#"+ obj).attr("data4");
			var room_key = _wsocket.make_room_id(uid);			
			var cid = $("#"+ obj).attr("data");			
			gBody.enter_chatroom_for_chatroomlist(room_key, cid, name);
		}else if (spl[0] == "file"){
			gBody.person_file_upload(obj);
		}else if (spl[0] == "del"){			
			var user = $("#"+ obj).attr("data");
			var srcid = obj.split("_")[1];
			var srcname = $("#group_" + srcid).attr("data");			
			_wsocket.delete_person_all_group(user);			
		}else if (spl[0] == "del2"){
			var user = $("#"+ obj).attr("data");
			var srcid = obj.split("_")[1];
			var srcname = $("#group_" + srcid).attr("data");			
			_wsocket.delete_person_only_this_group(srcname, user);			
		}else if (spl[0] == "move"){
			var targetname = spl[1];
			var user = $("#"+ obj).attr("data");
			var name = $("#"+ obj).attr("data4");
			var srcid = obj.split("_")[1];
			var srcname = $("#group_" + srcid).attr("data");			
			_wsocket.move_person(srcname, user, targetname, name);			
		}else if (spl[0] == "copy"){			
			var targetname = spl[1];			
			var user = $("#"+ obj).attr("data");
			var name = $("#"+ obj).attr("data4");
			var srcid = obj.split("_")[1];
			var srcname = $("#group_" + srcid).attr("data");			
			_wsocket.copy_person(user, targetname, name);
		}else if (spl[0] == "favorite"){
			var user = $("#"+ obj).attr("data");			
			gBody.add_favorite_member(user);
		}else if (spl[0] == "memo"){		
			$("#show_memo_layer").click();
			var uid = $("#" + obj).attr("data");
			var email =  $("#" + obj).attr("data2");			
			var name = $("#" + obj).attr("data4");			
			gBody.add_member_memo(uid, email, name);
		}else if (spl[0] == "profile"){	
			var uid = $("#" + obj).attr("data");
//			var noteid = uid.replace(/,/gi,"/");
//			var email =  $("#" + obj).attr("data2");
//		//	gBody.popup_user_layer(email);			
			gap.showUserDetailLayer(uid);
		}else if (spl[0] == "mail"){	
			var uid = $("#" + obj).attr("data");
			var email =  $("#" + obj).attr("data2");			
			var name = $("#" + obj).attr("data4");		
			gBody.open_email_send(encodeURIComponent(name) + "<" + email + ">");			
		}else if (spl[0] == "video"){
			if (gap.IE_Check()){
				gap.gAlert(gap.lang.IE_Notsupport);
			}else{
				var uid = $("#" + obj).attr("data");				
				var sendObj = new Object();
				sendObj.target_uid = uid;	
				sendObj.room_code = gap.userinfo.rinfo.id + "_" + gBody.make_video_roomkey();				
				//본인은 채팅창을 바로 띄운다.
				gBody.open_video_popup("T", sendObj.room_code);			
				gBody.send_invite_msg(sendObj, "");
			}			
		}else if (spl[0] == "calendar"){
			var jun = location.pathname.split("/")[1];
			var uid = $("#" + obj).attr("data").replace(/,/gi, "/");
			gBody.calendar_view(jun, uid);		
		}else{
			var m = "clicked : context_menu_call_person " + key + "/" + $(this).attr("id");
			alert(m);
		}
	},
	
	"calendar_view" : function(jun, uid){
		var url = "/ngw/core/lib.nsf/redirect_mail?readform&action=calview&uname="+uid+"&viewname=F";
		gap.open_subwin(url, "1240","660", "yes" , "", "yes");	
	},
	
	"delete_user_from_group" : function(groupname, key){
		_wsocket.load_buddy_list('etc');		
	},	
	
	"popup_user_layer" : function(email){
		var url ="./checkInputAddress?open&query=" + email;
		$.ajax({
			type : "GET",
			url : url,
			dataType : "json",
			contentType : "applicatino/json; charset=utf-8",
			success : function(info){			
				var html = "";
				html += "<div id='ep-epdialog-732145-0' class='ui-dialog-content ui-widget-content' style='border:0px solid white; width: auto; min-height: 86px; max-height: none; height: auto;'>";
				html += "	<div class='profile' style='text-align:left'>";
				html += "		<div class='profileWrap'>";
				html += "			<span class='profileImgWrap'>";
				html += "				<span class='imgFrame'></span>";				
				var person_img = gap.person_profile_photo(info);				
				html += "					<span class='imgHolder' style='position:relative;'>"+person_img+"</span>";
			//	html += "						<span class='state ep-widget ep-epawareness' style='margin: 20px 5px 0 5px;display:inline-block;'><span class='awareness_mail icon mailC' title='Send mail'></span><span class='awareness_sametime icon pc_offLine' title='Unknown'></span><span class='awareness_iptel icon tel_noStay' title='Unknown'></span></span>";
				html += "					</span>";
				html += "					<div class='infoWrap'>";
				html += "						<dl class='briefInfo'>";
				html += "							<dt>";
				if ((typeof(info.user_name) != "undefined") && (typeof(info.user_name_eng) != "undefined")){
					if (info.user_name == info.user_name_eng){
						html += "								<strong>"+(typeof(info.user_name) == "undefined" ? "" : info.user_name)+"</strong>";
					}else{
						html += "								<strong>"+(typeof(info.user_name) == "undefined" ? "" : info.user_name)+"</strong>";
						html += "								"+(typeof(info.user_name_eng) == "undefined" ? "" : info.user_name_eng)+" ";
					}
					
				}else{
					html += "								<strong>"+(typeof(info.user_name) == "undefined" ? "" : info.user_name)+"</strong>";
					html += "								"+(typeof(info.user_name_eng) == "undefined" ? "" : info.user_name_eng)+" ";
				}

				html += "								<span id='btn5' style='margin-left:10px' class='ep-widget ep-epbutton show'><!-- 주소록 추가 --><span class='epbutton' id='addcontact' data='"+info.user_id+"'>"+gap.lang.ac+"</span></span>";
				html += "							</dt>";
				html += "							<dd>";
				html += "								<ul style='list-style:none'>";		
				if (gap.curLang == "ko"){
					html += "									<li><span class='profile_grade'>"+(typeof(info.grade) == "undefined" ? "" : info.grade)+"</span><span class='profile_extgrade'>"+info.duty+"</span></li>";
					html += "									<li>"+(typeof(info.dept_name) == "undefined" ? "" : info.dept_name)+"</li>";
					html += "									<li>"+(typeof(info.company_name) == "undefined" ? "" : info.company_name)+"</li>";
				}else{
					html += "									<li><span class='profile_grade'>"+(typeof(info.grade_eng) == "undefined" ? "" : info.grade_eng)+"</span><span class='profile_extgrade'>"+info.eduty+"</span></li>";
					html += "									<li>"+(typeof(info.dept_name_eng) == "undefined" ? "" : info.dept_name_eng)+"</li>";
					html += "									<li>"+(typeof(info.company_name_eng) == "undefined" ? "" : info.company_name_eng)+"</li>";
				}
				html += "								</ul>";
				html += "							</dd>";
				html += "						</dl>";				
				html += "						<dl class='detailInfo'>";
				html += "							<dt>"+gap.lang.empno+"</dt> <dd><span class='empno'>"+(typeof(info.user_id) == "undefined" ? "" : info.user_id)+"</span></dd>";
				html += "							<dt>"+gap.lang.email+"</dt> <dd><span class='email'>"+(typeof(info.email) == "undefined" ? "&nbsp; " : info.email == "" ? "&nbsp; " : info.email)+"</span></dd>";
				html += "							<dt>"+gap.lang.mobile+"</dt> <dd><span class='iptcall'>"+(typeof(info.mp) == "undefined" ? "&nbsp; " : info.mp == "" ? "&nbsp; " : info.mp)+"</span></dd>";
				html += "							<dt>"+gap.lang.ipt+"</dt> <dd><span class='iptcall'>"+(typeof(info.op) == "undefined" ? "&nbsp;" : info.op == "" ? "&nbsp;" : info.op)+"</span></dd>";
				html += "							<dt>"+gap.lang.OP+"</dt> <dd><span class='iptcall'>"+(typeof(info.op2) == "undefined" ? "&nbsp;" : info.op2 == "" ? "&nbsp;" : info.op2)+"</span></dd>";
				html += "							<dt>"+gap.lang.FAX+"</dt><dd>"+(typeof(info.fx) == "undefined" ? "&nbsp;" : info.fx == "" ? "&nbsp;" : info.fx)+"</dd>";
				html += "						</dl>";
				html += "					</div>";
				html += "					<ul class='profileMemoWrap jsAcc'>";
				html += "						<li id='colayer' class='on'>";	
				html += "							<a id='popup_user_btn' class='btnMore' style='cursor:pointer'><span title='더보기'></span></a>";
				html += "							<dl>";
				html += "								<dt>"+gap.lang.jd+"</dt>";
				html += "								<dd>";
				html += "									<textarea readonly>" + info.profile.replace(/(<br>|<br\/>|<br \/>)/g, '\r\n');
				html += "									</textarea>";
				html += "								</dd>";
				html += "							</dl>";
				html += "						</li>";
				html += "					</ul>";
				html += "				</div>";
				html += "			</div>";			
				
				$.dialog({
		            title: gap.lang.openprofile,
		            content: html,
		            animation: 'scale',
		            columnClass: 'medium',
		            closeAnimation: 'scale',
		            backgroundDismiss: false,
		            onOpen: function(){						
						var that = this;
						this.$content.find('#addcontact').click(function(){	             
							//주소록 추가
							var id = $(this).attr("data");
							var curUser = gap.userinfo.userid;
							var url = "./process?open&uid=" + id + "&tuser="+curUser;
							$.ajax({
								type : "GET",
								dataType : "json",
								contentType : "application/json; charset=utf-8",
								url : url,
								cache : false,
								success : function(data){							
									if (data.result == "OK"){
										gap.gAlert(gap.lang.added);
									}
								}, 
								error : function(e){
									alert(e);
								}
							})							
						});						
						this.$content.find('#view1').click(function(){	   
							//일정 보기
							var key = $(this).attr("data");
							var url = "../ngw/core/lib.nsf/redirect_mail?readform&action=calview&uname="+encodeURIComponent(key)+"&viewname=F";
							gap.open_subwin(url, "1240", "600", false, "", true);
							return false;
						});					
						this.$content.find('#view2').click(function(){	   
							//프로필 보기
							var email = $(this).attr("data");
							var url = "/profiles/html/profileView.do?email=" + email;
							gap.open_null(url);
							return false;
						});						
						this.$content.find('#popup_user_btn').click(function(){	   
							if ($("#colayer").hasClass("on")){
								$("#colayer").removeClass("on");
							}else{
								$("#colayer").addClass("on");
							}
						});						
						this.$content.find('#view3').click(function(){	   
							//파일즈 보기
							var email = $(this).attr("data");
							var url = "/files/app#/person/" + email;
							gap.open_null(url);
							return false;
						});						
						this.$content.find('#view4').click(function(){	   
							//업무분장			
							var empno = $(this).attr("data");
							var lang = gap.userinfo.userLang;
							var url = "https://ehr.amorepacific.com/irj/portal/ehr/hr0146_ql&I_ORGEH="+empno+"&I_LANGU="+lang;
							gap.open_subwin(url, "700", "800", false, "", true);
						});						
		         	}            
		        });				
			},
			error : function(e){
				alert(e);
			}			
		})		
	},	
	
	"context_menu_call_person_top_search" : function(key, options, obj){		
		var spl = key.split("-spl-");
		var cid = $("#"+ obj).parent().attr("data2");
		var name = $("#"+ obj).parent().attr("data4");		
		if (key == "talk"){
			var room_key = _wsocket.make_room_id(cid);
			if (cid != gap.search_cur_ky()){
				gBody.enter_chatroom_for_chatroomlist(room_key, cid, name);
			}					
		}else if (key == "file"){			
			if (cid != gap.search_cur_ky()){
				gBody.select_buddy_id = obj;
				gBody.person_file_upload(obj);
			}
		}else if (key == "del"){
			
		}else if (key == "del2"){
			var user = $("#"+ obj).attr("data");
			var srcid = obj.split("_")[1];
			var srcname = $("#group_" + srcid).attr("data");			
			_wsocket.delete_person_only_this_group(srcname, user);			
		}else if (spl[0] == "add"){	
			if (cid != gap.search_cur_ky()){
				var targetname = spl[1];					
				_wsocket.copy_person(cid, targetname, name);
			}	
		}else if (spl[0] == "favorite"){	
			if (cid != gap.search_cur_ky()){
				gBody.add_favorite_member(cid);
			}			
		}else if (spl[0] == "memo"){	
			if (cid != gap.search_cur_ky()){
				$("#show_memo_layer").click();				
				var email =  $("#" + obj).parent().attr("data3");
				var name =  $("#" + obj).parent().attr("data4");
				gBody.add_member_memo(cid, email, name);
			}
		}else if (spl[0] == "mail"){		
			var email =  $("#" + obj).parent().attr("data3");	
			var name =  $("#" + obj).parent().attr("data4");
			gBody.open_email_send(encodeURIComponent(name) + "<" + email + ">");
		}else if (spl[0] == "profile"){			
			var email =  $("#" + obj).parent().attr("data3");
			gBody.popup_user_layer(email);			
		}else if (spl[0] == "video"){
			if (gap.IE_Check()){
				gap.gAlert(gap.lang.IE_Notsupport);
			}else{
				var uid = $("#" + obj).attr("data");				
				var sendObj = new Object();
				sendObj.target_uid = uid;	
				sendObj.room_code = gap.userinfo.rinfo.id + "_" + gBody.make_video_roomkey();
				//본인은 채팅창을 바로 띄운다.
				gBody.open_video_popup("T", sendObj.room_code);			
				gBody.send_invite_msg(sendObj, "");
			}
		}else if (spl[0] == "calendar"){
			var jun = location.pathname.split("/")[1];
			var uid = $("#" + obj).attr("data").replace(/,/gi, "/");
			gBody.calendar_view(jun, uid);			
		}else{
			var m = "clicked : context_menu_call_person_top_search " + key + "/" + $(this).attr("id");
			alert(m);
		}
	},
	
	"open_email_send" : function(email){	
		localStorage.setItem("authorsend", email);
		var url = location.protocol + "//" + location.host + "/"+mailfile+"/Memo?openform&opentype=popup&callfrom=address&";		
		gap.open_subwin(url, "900", "850", false, "", true);
	},	
	
	"open_onetoonechat" : function(cid, name){		
		var room_key = _wsocket.make_room_id(cid);
		gBody.enter_chatroom_for_chatroomlist(room_key, cid, name);
	},
	
	"context_menu_call_group" : function(key, options, obj){
		if (key == "close"){
			//전체 닫기 호출
			gBody.close_all_group();
		}else if (key == "open"){
			//전체 그룹 열기
			gBody.open_all_group();
		}else if (key == "del"){
			var groupname = $("#"+obj).attr("data");
			gBody.delete_group(groupname);	
		}else if (key == "manage"){
			var groupname = $("#"+obj).attr("data");
			gBody.create_buddy_group(groupname);
		}else if (key == "change"){
			var groupname = $("#"+obj).attr("data");
			gBody.select_change_group_name = groupname;			
			$("#group_txt").attr("placeholder", "[" + groupname + "] " + gap.lang.changegroupname);
			$(".add-group").fadeIn();
			$("#group_txt").focus();			
			var html = "<div style='padding:10px'>" + gap.lang.closeGroup + "</div>";
			$("#add_group_btn").qtip('option', 'content.text', html);			
		}else if (key == "out"){
			
		}else if (key == "talk"){
			gBody.group_chat_start(obj);
		}else if (key == "memo"){
			gBody.group_memo_start(obj);
		}else if (key == "mail"){
			gBody.group_mail_start(obj);		
		}else if (key == "video"){			
			gBody.group_video_invite_send(obj);		
		}else{
			var m = "clicked : context_menu_call_group " + key + "/" + $(this).attr("id");
			alert(m);
		}
	},
	
	"close_all_group" : function(){
		$("#buddylist_main .ico.btn-list-fold").removeClass("on");
		$("#buddylist_main .groupClass").hide();
		_wsocket.close_group_all();		
	},
	
	"open_all_group" : function(){
		$("#buddylist_main .ico.btn-list-fold").addClass("on");
		$("#buddylist_main .groupClass").show();
		_wsocket.open_group_all();
	},	
	
	"group_menu_content" : function(){
		var items = {};
		items["talk"] = {name : gap.lang.groupchat};
		items["mail"] = {name : gap.lang.groupmail};
		//items["memo"] = {name : gap.lang.groupnoti};
		if (role == "T"){
			items["sep15"] = "-------------";
		//	items["video"] = {name : gap.lang.invite_videochat};				
		}		
		items["sep12"] = "-------------";
	//	items["change"] = {name : gap.lang.groupchangename};
		items["manage"] = {name : gap.lang.groupm};
		items["del"] = {name : gap.lang.groupdelete};
		items["sep13"] = "-------------";
		items["open"] = {name : gap.lang.groupallopen};
		items["close"] = {name : gap.lang.groupallclose};
		return items;
	},	
	
	"group_list" : function(opt){		
		var objx = gap.buddy_list_info.ct.bl;
		var obj = sorted=$(objx).sort(gap.sortNameDesc);		
		var subItems2 = new Object();
		var obb2 = new Object();
		for (var i = 0 ; i < obj.length; i++){
			var info = obj[i];
			var obb = new Object();
			obb.name = info.nm;			
			obb2[opt + "-spl-" + info.nm] = obb;
		}	
		var subItems = obb2;		
		return subItems;
	},
		
	"chatroom_menu_content" : function(){	
		
		var iid = gBody.click_room_id;		
		var fix_check = false;
		if (iid.indexOf("main_") == -1){
			var kk = $("#" + iid).parent().attr("id");
			if (kk == "chatroom_ul_fix"){
				fix_check = true;
			}
		}		
		var sid = iid.replace("main_","").replace("li_","");	
		if (iid.indexOf("main_") > -1){
			var ccn = $("#chatroom_ul_fix").find("#" + sid).length;
			if (ccn >  0){
				fix_check = true;
			}
		}
		var items = {};
		if (sid.substring(0,1) == "n"){
			items["changename"] = {name : gap.lang.changename};
			items["sep10"] = "-------------";			
		}
		items["out"] = {name : gap.lang.exit};		
		items["sep11"] = "-------------";
		if (fix_check){
			items["fix2"] = {name : gap.lang.fix2};	
		}else{
			items["fix"] = {name : gap.lang.fix};	
		}
		items["sep111"] = "-------------";
		items["mail"] = {name : gap.lang.sendmail};
		items["file"] = {name : gap.lang.sendfile};
		//items["memo"] = {name : gap.lang.sendnoti};
//		if (role == "T"){
//			items["sep12"] = "-------------";
//		//	items["video"] = {name : gap.lang.invite_videochat};				
//		}		
//		items["allout"] = {name : gap.lang.exitall};
		return items;
	},	
	
	"person_menu_content" : function(opt, id){	
		var favorite_msg = "";
		if (opt == "favorite"){
			favorite_msg = gap.lang.favorite_delete;
		}else{
			favorite_msg = gap.lang.favorite;
		}
		var xitems = {};
	//	xitems["talk"] = {name : gap.lang.chat};
	//	xitems["favorite"] = {name : favorite_msg};
	//	xitems["sep11"] = "-------------";
		xitems["mail"] = {name : gap.lang.sendmail};
		xitems["file"] = {name : gap.lang.sendfile};
	//	xitems["memo"] = {name : gap.lang.sendnoti};
		if (role == "T"){
			xitems["sep12"] = "-------------";
		//	xitems["video"] = {name : gap.lang.invite_videochat};			
		}		
		xitems["sep13"] = "-------------";
		if (hasSchAuth == "T"){
			xitems["calendar"] = {name : gap.lang.vc};
		}		
		xitems["profile"] = {
			name : gap.lang.openprofile		
		};		
				
		
		if (gap.buddy_list_info.ct.bl.length > 1){
			//if (!gBody.is_buddylist_search){
				xitems["sep14"] = "-------------";
				xitems["copy"] = {
					name : gap.lang.copyuser,
					items : gBody.group_list('copy')			
				};
			//}

			if (!gBody.is_buddylist_search){
				xitems["move"] = {
						name : gap.lang.moveuser,
						items : gBody.group_list('move')			
					};
				xitems["del"] = {name : gap.lang.deluser};
				xitems["del2"] = {name : gap.lang.deluseronly};	
			}
		}else if (gap.buddy_list_info.ct.bl.length > 0){
			if (gBody.is_buddylist_search && id != gap.userinfo.rinfo.ky){
				xitems["sep14"] = "-------------";
				xitems["copy"] = {
					name : gap.lang.copyuser,
					items : gBody.group_list('copy')			
				};
			}

		}
		
		
	
		return xitems;
	},
	
	"person_menu_content_top_search" : function(opt){
		var favorite_msg = "";		
		favorite_msg = gap.lang.favorite;		
		var xitems = {};
		xitems["talk"] = {name : gap.lang.chat};
	//	xitems["favorite"] = {name : favorite_msg};
		xitems["sep11"] = "-------------";
		xitems["mail"] = {name : gap.lang.sendmail};
		xitems["file"] = {name : gap.lang.sendfile};
	//	xitems["memo"] = {name : gap.lang.sendnoti};
		if (role == "T"){
			xitems["sep121"] = "-------------";
		//	xitems["video"] = {name : gap.lang.invite_videochat};			
		}
		xitems["sep133"] = "-------------";
		if (hasSchAuth == "T"){
			xitems["calendar"] = {name : gap.lang.vc};
		}		
		xitems["profile"] = {
			name : gap.lang.openprofile
		};
//		xitems["sep13"] = "-------------";
//		xitems["add"] = {
//			name : gap.lang.adduser,
//			items : gBody.group_list('add')
//		};
		return xitems;
	},
	
	"person_menu_content_favorite" : function(opt){	
		var favorite_msg = "";		
		favorite_msg = gap.lang.favorite_delete;		
		var xitems = {};
		xitems["talk"] = {name : gap.lang.chat};
		xitems["favorite"] = {name : favorite_msg};
		xitems["sep11"] = "-------------";
		xitems["mail"] = {name : gap.lang.sendmail};
		xitems["file"] = {name : gap.lang.sendfile};
	//	xitems["memo"] = {name : gap.lang.sendnoti};
		if (role == "T"){
			xitems["sep12"] = "-------------";
		//	xitems["video"] = {name : gap.lang.invite_videochat};			
		}
		xitems["sep111"] = "-------------";
		if (hasSchAuth == "T"){
			xitems["calendar"] = {name : gap.lang.vc};
		}		
		xitems["profile"] = {name : gap.lang.openprofile};
		return xitems;
	},
		
	"favorite_draw" : function(obj){	
		return false;
		if (gap.cur_window != "chat" && gap.cur_window != "abc2"){
			return false;
		}
		
		var info = obj.ct;		
		if (typeof(info) == "undefined"){
			return false;
		}
		var fav = info.fav;		
	//	gap.etc_info.ct = obj.ct;
		gap.etc_info.ct.fav = fav;
		gap.favorite_list = fav;		
		//즐겨찾기가 없을 경우 그룹 추가 버튼 위치를 위로 올려야 한다.		
		if (typeof(gap.etc_info.ct.enter) == "undefinded" || gap.etc_info.ct.enter == "1" || gap.etc_info.ct.enter == ""){
			gBody.enter_opt = "1";
		}else{
			gBody.enter_opt = "2";
		}
		if (typeof(fav) == "undefined" || fav.length == 0){
			gap.hide_favorite_layer();
			return false;
		}		
	//	var html = '<h2 style="font-size:16.5px; line-height:35px; height:35px">'+gap.lang.favorite+'</h2>';
		var html = '<h2 style="font-size:13px; line-height:15px; height:15px; margin-top:10px">'+gap.lang.favorite+'</h2>';
		var html2 = "";
		html += "<ul id='favorite_layer' style='margin-top:5px'>";		
		var lists = new Array();		
		for (var i = 0 ; i < fav.length; i++){
			var info = fav[i];	
			var person_img = gap.person_profile_photo(info);
		//	var key = gap.seach_canonical_id(info.ky);
			var key = info.ky;
			lists.push(info.ky);
			var nam = info.nm;
			var dept = info.dp;			
			if (gap.cur_el != info.el){
				nam = info.enm;
				dept = info.edp;
			}			
			var key2 = key.replace(/\./gi,"_");
			key = key.replace(/\./gi,"-spl-");	
			html2 += "<li id='favorite_" + i + "_" + key+"' data='"+info.ky+"' data2='" +info.em+ "' data4='" +nam+ "' data5='"+dept+"' data6='"+info.el+"'>";
			html2 += "<div class='user' data='"+info.em+"'>";
			html2 += "	<div class='user-thumb' style='width:45px; height:45px' title='"+nam+"'>"+person_img+"</div>";
			html2 += "		<span id='favorite_"+key2+"' class='offline status'></span>";
			html2 += "	</div>";
			html2 += "</li>";
		}	
		var html3 = "</ul>";		
		gap.show_favorite_layer();
		$("#left_favorite").html(html + html2 + html3);	
		html2 = html2.replace(/favorite_/gi,"sfavorite_");		
		//1000이하 해상도일경우 보여지는 레이어에 즐겨찾기 사용자 이미지를 미리 넣어 놓는다.
		$("#favorite_small").html(html2);		
		//즐겨찾기 사용자 상태 요청한다.
		//lists : 대상자 ky값 / opt 등록 : 1, 종료 : 2 / ty : 어디서 호출한 것인지 등록해서 나중에 판단 기준으로 사용한다.		
		_wsocket.temp_list_status(lists, 1, "favorite");		
//        $("#favorite_layer .user-thumb img, #nav_left_sub_menu .user-thumb img").single_double_click(function (e) {
//    	  	gBody.click_img_obj = this;	     
//    	  	var uid = $(this).parent().parent().parent().attr("data");
//        	gOrg.showUserDetailLayer(uid);
//        }, function (e) {        	
//    	   var cid = $(this).parent().parent().parent().attr("data");
//    	   var name = $(this).parent().parent().parent().attr("data4");
//    	   var room_key = _wsocket.make_room_id(cid);
//    	   gBody.enter_chatroom_for_chatroomlist(room_key, cid, name);
//    	});
        
        $("#favorite_layer .user-thumb img").off().on("click", function(e){
        	 var cid = $(this).parent().parent().parent().attr("data");
      	   var name = $(this).parent().parent().parent().attr("data4");
      	   var room_key = _wsocket.make_room_id(cid);
      	   gBody.enter_chatroom_for_chatroomlist(room_key, cid, name);
        });
        
        $("#nav_left_sub_menu .user-thumb img").off().on("click", function(e){
     	   var cid = $(this).parent().parent().parent().attr("data");
     	   var name = $(this).parent().parent().parent().attr("data4");
     	   var room_key = _wsocket.make_room_id(cid);
     	   gBody.enter_chatroom_for_chatroomlist(room_key, cid, name);
       });
        
							
		//즐겨찾기 마우스 우클릭 ContentMenu 작성하기
		$.contextMenu({
			selector : "#left_favorite ul li, #nav_left_sub_menu ul li",
			autoHide : true,
			callback : function(key, options){
				gBody.context_menu_call_person(key, options, $(this).attr("id"));
			},
			items: gBody.person_menu_content_favorite("favorite")
		});		
		
		$("#favorite_layer li .user").on("mouseover", function(){	
			$(this).css("cursor","pointer");
			$(this).draggable({
				 revert: "invalid",
				 stack: ".draggable",     //가장위에 설정해 준다.
				 opacity: 1,
			//	 containment: "window",
				 scroll: false,
			//	 helper: 'clone',
				 cursorAt: { top: 15, left:15},
				 helper: function (e) { 
					//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.		
					return $(this).clone().appendTo("#nav_left_menu").css("zIndex",2000).show();
			     },			 			     
			     cursor: 'move',	  
			     
				 start : function(event, ui){
					$(this).draggable("option", "revert", false);
				},
				stop : function(event, ui){						
				}
			});
		});		
		
		$("#nav_left_sub_menu li .user").on("mouseover", function(){			
			$(this).css("cursor","pointer");
			$(this).draggable({
				 revert: "invalid",
				 stack: ".draggable",     //가장위에 설정해 준다.
				 opacity: 1,
			//	 containment: "window",
				 scroll: false,
			//	 helper: 'clone',
				 cursorAt: { top: 15, left:15},
				 helper: function (e) { 
					//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.			
					return $(this).clone().appendTo("#nav_left_sub_menu").css("zIndex",2000).show();
			     },			 			     
			     cursor: 'move',	     
			     
				 start : function(event, ui){
					$(this).draggable("option", "revert", false);					
				},
				stop : function(event, ui){						
				}
			});
		});
		gBody.left_height_control();	
	},
	
	"left_height_control" : function(){
		//즐겨찾기 여부에 따라 좌측 프레임 높이를 조절해 준다.
		//return false;

		if ((typeof(gap.favorite_list) != "undefined") && (gap.favorite_list != "")){
	
			if (gap.favorite_list.length == 0){
				//즐겨찾기가 없는 경우 높이를 높혀준다.
			//	$(".wrap-nav").css("height", "calc(100% - 94px");		
				if (gBody.cur_tab == "tab2"){
					$(".wrap-nav").css("height", "calc(100% - 5px");
				}else if (gBody.cur_tab == "tab4"){
					$(".wrap-nav").css("height", "calc(100% - 5px");
				}else if (gBody.cur_tab == "tab1"){
					$(".wrap-nav").css("height", "calc(100% - 60px");
					
				}
				
			}else{
				if (gBody.cur_tab == "tab1"){
					$(".wrap-nav").css("height", "calc(100% - 150px");
				}else if (gBody.cur_tab == "tab2"){
					$(".wrap-nav").css("height", "calc(100% - 100px");
				}
				
			}
		}else{
			//즐겨찾기가 없는 경우 높이를 높혀준다.
			if (gBody.cur_tab == "tab2"){
				$(".wrap-nav").css("height", "calc(100% - 94px");
			}else{
				$(".wrap-nav").css("height", "calc(100% - 64px");
			}
			
		}		
	},	
	
	"chat_start" : function(cid){		
//		//기존 메시지 내역을 지우고 다시 그려야 한다.		
//		if (gma.cur_cid_popup == cid){
//			$("#alarm_chat_sub").empty();
//		}	

		$("#chat_msg_dis").empty();
		//내용이 없을때 이미지 붙여넣기가 되지 않아 공백 문자를 추가한다.
		$("#chat_msg_dis").html("&nbsp;");
		//////////////////////////////////////////////
		$("#chat_image_dis").empty();
		$("#chat_file_dis").empty();		
		$("#chat_image_dis").hide();
		$("#chat_file_dis").hide();		
		//채팅방 명을 설정해 주어야 한다.
		var roominfo = gap.search_chat_info_cur_chatroom(cid);
		var gubun = cid.substring(0,1);	
		if (roominfo != ""){
			var room_title = "";
			if (typeof(roominfo.tle) != "undefined" && roominfo.tle != ""){
				room_title = roominfo.tle;
			}else if (gubun == "s" ){				
				//1:1방의 경우
				for (var i = 0 ; i < roominfo.att.length; i++){
					if (gap.userinfo.rinfo.ky != roominfo.att[i].ky){
						room_title = roominfo.att[i].nm;
					}
				}				
			}else if (gubun == "n"){
				//방명이 지정되지 않는 1:N 채팅방의 경우
				room_title = gap.lang.gchat;
			}			
			if (room_title == ""){
				room_title = gap.lang.no_chatroom;
				$("#chatroomtitle").html(room_title);
			}else{
				if (gBody.cur_room_att_info_list.length > 2) {					
					$("#chatroomtitle").html(room_title  + " (" + gBody.cur_room_att_info_list.length + ")");
				} else {
					$("#chatroomtitle").html(room_title);
				}
			}		
		}else{
			var cpx = cid.substring(0,1);
			if (cpx == "n"){
				if (gBody.cur_room_att_info_list && gBody.cur_room_att_info_list.length > 2) {					
					$("#chatroomtitle").html(gap.lang.gchat + " (" + gBody.cur_room_att_info_list.length + ")");				
				} else {
					$("#chatroomtitle").html(gap.lang.gchat);
				}
			}else{
				$("#chatroomtitle").html(gBody.select_name);
			}	
		}		
		//혹시 우측 버튼이 클릭되어 있으면 클릭 안된 버튼으로 변경한다.
		gBody.rigth_btn_change_empty();			
		gap.backpage = gap.curpage;
		gap.curpage = "chat";
		gap.tmppage = "";				
		gBody.chat_profile_image_draw_cnt = 0;
		gBody.chat_profile_file_draw_cnt = 0;		
		gBody.cur_cid = cid;				
		//현재방에  마지막 읽음 순번을 가져와서 세팅한다. 1:1 인 경우만 체크한다.
		var ch = cid.toString().substring(0,1);
		if (ch == "s"){
			var last_read = gBody.search_chatroom_last_read_id(cid);
			gBody.last_other_read_id = last_read;
		}		
		$(".left-area").css("width", "calc(100% - "+gap.right_page_width+")");
		try{
			$("#chat_msg").mCustomScrollbar('destroy');
			$("#file_wrap").mCustomScrollbar('destroy');
		}catch(e){}
		gap.show_content("chat");	
		if (cid.substring(0,1) == "n"){
			gBody.draw_chat_room_members();
		}		
		if (typeof(gBody.temp_invate_user) != "undefined" && gBody.temp_invate_user != ""){
			gBody.temp_invate_user = "";
		}		
	},
	
	"buddy_search_field" : function(){
		var html = "";
	//	html += "<div class='quick-work-layer'>";
		html += "<div class='input-field' style='display:flex;magin-bottom:10px'>";
		html += "	<span class='ico ico-search btn-search-ico' id='search_user_chatting' style='cursor:pointer'></span>";
		html += "	<input type='text' id='quick_search_buddylist' class='formInput' placeholder='"+gap.lang.input_search_query2+"' autocomplete='off'>";
		html += "	<div class='btn-quick-org' id='btn_buddylist_org'></div>";
		html += "</div>";
	//	html += "</div>";
		return html;
	},
	
	"buddy_draw" : function(){
		
		//채팅탭일 경우 만 버디리스트를 그린다.
		gBody.is_buddylist_search = false;
		gBody.temp_search_result = [];
		
		//Quick 채팅에서 업데이트를 사용하기 위해 설정해 준다.
		gma.setBuddyListPage();
		
		//websocket.js에서 로그인 처리 후 호출됨		
		var objx = gap.buddy_list_info;
		var obj = sorted=$(objx.ct.bl).sort(gap.sortNameDesc);		
		var buddy_list_info = obj;   //배열로 넘어옴			
		
		if (buddy_list_info.length == 0){
			//버디리스트에 하나도 없는 경우 도움말 표시하기
			var html = "";
			html += gBody.buddy_search_field();
			
			html += "<div class='group' id='buddylist_main'>";	
			
			html += "<div class='nav-info' style='background:white; left:20px; padding-top:0px; transform:rotate(180deg); position:absolute; bottom:0px'>";
			html += "	<img src='/resource/images/arrow.png'>	"
			html += "	<p style='transform:rotate(180deg)'>"+gap.lang.exbtn+"</p>";
			
		//	html += "	<a style='cursor:pointer' class='btn-view-manual' id='manual_show'>"+gap.lang.manu+"</a>";
			html += "</div>";		
			
			html + "</div>";
			$("#group_add_layer").css("position","inherit");
			$("#buddy_list_dis").css("height","calc(100vh - 210px)");
			$("#buddy_list_dis").css("position","relative")
			$("#buddy_list_dis").html(html);			
			$("#manual_show").on("click", function(e){				
				gTop.Open_Manual();							
			});			
			

			gBody.draw_event();
			
			return false;
		}	
		
		$("#group_add_layer").css("position","absolute");	
		
		
		var html = ""; 		
		html += gBody.buddy_search_field();
		
		html += "<div class='group' id='buddylist_main'>";	
		
		
		//내 프로필 상단에 표시하기		
//		var myinfo = gap.user_check(gap.userinfo.rinfo);
//		var fname = myinfo.disp_name_info;
//		var dept = myinfo.dept;
//		var company = myinfo.company;
//		var profile_img_tag = myinfo.user_img;
//		var id = myinfo.ky;
//		var email = myinfo.email;
//		var disd = myinfo.disp_name_info;
//		var name = myinfo.name;
//		
//		html += "<h3>";
//		html += "<dx id='group_"+i+"' data='"+group_name+"' style='cursor:pointer;display:block;width:230px;'>";
//		html += "			<span>내프로필</span> ";	
//		html += "</dx>";
//		html += "</h3>";	
//		html += "	<ul  class='groupClass' style='list-style:none'>";
//		html += "		<li style='border:1px solid white'>";
//		html += "			<div class='user '>";	
//		html += "				<div class='person_dis' id='person_"+i+"_"+id+"' data='"+id+"' data2='"+email+"' data3='"+disd+"' data4='"+name+"'>";
//		html += "  				<div class='btn-user-remove' id='buddy_del_id_"+id+"'><span></span></div>";	
//		html += "					<div>"
//		html += "						<div class='user-thumb' style='width:40px;height:40px;' id='person_"+id+"_img'>"+profile_img_tag+"</div>";
//		html += "						<span class='status offline' style='position:absolute;border-radius:50%;left:30px;top:30px' id='person_"+id+"_status' data-status='"+id+"' data2='"+i+"'></span>";
//		html += "					</div>";
//		html += "					<dl>";
//		html += "						<dt id='person_"+id+"_name'>"+disd+"</dt>";
//		html += "						<dd >";
//		html += "							<span>"+ dept + " / " + company +"</span>"
//		html += "							<dd class='status-message' id='person_"+id+"_status_msg'  title=''></dd>";
//		html += "					</dl>";
//		html += "				</div>";
//		html += "				<button class='ico btn-more person' data='person'>더보기</button>";
//		html += "			</div>";
//		html += "		</li>";
//		html += "</ul>";
		//내 프로필 상단에 표시하기 끝
		
		
		for (var i = 0 ; i < buddy_list_info.length; i++){		
			var info = buddy_list_info[i];			
			var group_name = gap.HtmlToText(info.nm);			
			var group_total_cnt = "";
			if (typeof(info.usr) != "undefined"){
				group_total_cnt = gap.numberComma(info.usr.length);				
			}else{
				group_total_cnt = 0;
			}						
			html += "	<h3>";
			html += "		<!-- .btn-list-fold 클릭시 on 클래스 제거 -->";
			html += "		<dx id='group_"+i+"' data='"+group_name+"' style='cursor:pointer;display:block;width:230px;'>";
			if (info.o){
				html += "			<button class='ico btn-list-fold on'>접기</button><span title='"+group_name+"'>"+group_name+"</span> ";
			}else{
				html += "			<button class='ico btn-list-fold'>접기</button><span title='"+group_name+"'>"+group_name+"</span> ";
			}			
			html += "				(<span><em id='group_"+i+"_online_cnt'>0</em></span>/<span><em id='group_"+i+"_total_cnt'>"+group_total_cnt+"</em></span>)";
			html += "		</dx>";
			html += "		<button class='ico btn-more group' data='group'>더보기</button>";
			html += "	</h3> ";			
			if (info.o){
				html += "	<ul id='group_ul_"+i+"' class='groupClass' style='list-style:none'>";
			}else{
				html += "	<ul id='group_ul_"+i+"' class='groupClass' style='list-style:none; display:none'>";
			}						
			if (typeof(info.usr) != "undefined"){				
				var sinfo = sorted=$(info.usr).sort(gap.sortNameDesc);				
				for (var j = 0 ; j < sinfo.length; j++){
					var sub_info = sinfo[j];		
			
					var user_info = gap.user_check(sub_info);
					html += gBody.draw_buddylist_info(i, user_info, "F");
				}
			}
			html += "	</ul>";
		}		
		html += "</div>";
		$("#buddy_list_dis").html(html);			
		//버디리스트 상태 등록한다.
		_wsocket.buddy_list_status();		
		//gBody.chatroom_list_right_click();
		
		
		gBody.__buddylist_events();
	
		
		$("#search_user_chatting").off().on("click", function(e){
			if ($("#quick_search_buddylist").val().trim() == ""){
				mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
				return false;
			}
			gBody.buddylist_user_search($("#quick_search_buddylist").val(), true);
		});
		
		
		gBody.draw_event();
		gBody.left_height_control();
				
		
	},
	
	"channel_user_search" : function(ch_type, str, selectme){
	
		/*
		 * ch_type : D(드라이브), C(채널), F(폴더), B(버디리스트)
		 */
		if (ch_type == "D"){
			$("#input_drive_user").val("");
			
		}else if (ch_type == "C"){
			$("#input_channel_user").val("");
		}else if (ch_type == "CO"){
			$("#input_reg_user").val("");
		}else if (ch_type == "T"){
			$("#input_chat_user").val("");	
		}else if (ch_type == "B"){
			$("#input_chat_user").val("");	
		}
		
		gsn.requestSearch('', str, function(sel_data){
			
			for (var i = 0 ; i < sel_data.length; i++){
				var info = sel_data[i];
				if (selectme){	
					gBody.aleady_select_user_count = 0;
					gBody.channel_add_user(ch_type, info);
					gBody.alert_aleady_select_user();					
				}else{
				//	if (info.ky.toLowerCase() == gap.userinfo.rinfo.ky.toLowerCase()){
				//		mobiscroll.toast({message:gap.lang.me_not_add_invite_user, color:'danger'});
						
				//	}else{
						gBody.aleady_select_user_count = 0;
						gBody.channel_add_user(ch_type, info);
						gBody.alert_aleady_select_user();
				//	}
				}
				
			}
		});
	},

	"alert_aleady_select_user" : function(){
		if (gBody.aleady_select_user_count == 0){
			//nothing
			
		}else if (gBody.aleady_select_user_count == 1){
			gap.gAlert(gap.lang.existuser);
			return false;
			
		}else{
			gap.gAlert(gap.lang.existuser + " (" + gBody.aleady_select_user_count + " " + gap.lang.myung + ")");
			return false;	
		}
		
	},

	"draw_event" : function(){
		//버디리스트 사용자 검색과 조직도 클릭 이벤트 처리
		$("#quick_search_buddylist").keydown(function(evt){
			if (evt.keyCode == 13){
				
				if ($("#quick_search_buddylist").val().trim().length == 1){
					gap.gAlert(gap.lang.valid_search_keyword);
					$("#quick_search_buddylist").focus();
					return false;
				}
				
				if ($("#quick_search_buddylist").val().trim() == ""){
					mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
					return false;
				}
				gBody.buddylist_user_search($("#quick_search_buddylist").val(), true);
			}
		})
		.bind('paste', function(e){
			gap.change_paste_text(e, this);
		});
		
		$("#btn_buddylist_org").on("click", function(){
			gap.showBlock();
			window.ORG.show(
			{
				'title': gap.lang.invite_user,
				'single':false,
				'pergroup': false,
				'peraddr': false,				
				'select': 'person'
			}, 
			{
				getItems:function() { return []; },
				setItems:function(items) { /* 반환되는 Items */						
					gBody.aleady_select_user_count = 0;
					var infos = [];
					for (var i = 0; i < items.length; i++){
						var _res = gap.convert_org_data(items[i]);
						if (_res.ky.toLowerCase() != gap.userinfo.rinfo.ky.toLowerCase()){
							//gBody.buddylist_search_result_display(_res);
							infos.push(_res);
						}
					}
					
					gBody.buddylist_search_result_display(infos);
					
					gBody.alert_aleady_select_user();
					gap.hideBlock();
				},
				onClose : function(){
					gap.hideBlock();
				}
			});
		});		
	},
	
	"draw_buddylist_info" : function(i, user_info, is_search_mode){
		
		var html = "";
		var fname = user_info.disp_name_info;
		var dept = user_info.dept;
		var company = user_info.company;
		var profile_img_tag = user_info.user_img;
		var id = user_info.ky;
		var email = user_info.email;
		var disd = user_info.disp_name_info;
		var name = user_info.name;
		
		html += "		<li style='border:1px solid white'>";
		html += "			<div class='user '>";	
		html += "				<div class='person_dis' id='person_"+i+"_"+id+"' data='"+id+"' data2='"+email+"' data3='"+disd+"' data4='"+name+"'>";
	//	if (is_search_mode == "T"){
			html += "  				<div class='btn-user-remove' id='buddy_del_id_"+id+"'><span></span></div>";
	//	}	
		html += "					<div>"
		html += "						<div class='user-thumb' style='width:40px;height:40px;' id='person_"+id+"_img'>"+profile_img_tag+"</div>";
		html += "						<span class='status offline' style='position:absolute;border-radius:50%;left:30px;top:30px' id='person_"+id+"_status' data-status='"+id+"' data2='"+i+"'></span>";
		html += "					</div>";
		html += "					<dl>";
		html += "						<dt id='person_"+id+"_name'>"+disd+"</dt>";
		html += "						<dd >";
		html += "							<span>"+ dept + " / " + company +"</span>"
		html += "							<dd class='status-message' id='person_"+id+"_status_msg'  title=''></dd>";
		html += "					</dl>";
		html += "				</div>";
		html += "				<button class='ico btn-more person' data='person'>더보기</button>";
		html += "			</div>";
		html += "		</li>";
		return html;
	},
	
	"__buddylist_events" : function(){
		
		gBody.buddy_list_right_click();		
//      $(".person_dis img").single_double_click(function (e) {        
//      	e.preventDefault();
//  	  	gBody.click_img_obj = this;	     
//  	  	var uid = $(this).parent().parent().attr("data");
//      	_wsocket.search_user_one_for_popup(uid);  
//      }, function (e) {        	
//  	});		
		
		//버디리스트 높이를 변경해서 여기서 줘야 적용이 된다.(2023-11-30) /////////////////
		$("#buddy_list_dis").css("height", "calc(100% - 65px)");
		$("#buddylist_main").css("height", "100%");
		$("#buddylist_main").css("margin-top", "10px");
		////////////////////////////////////////////////////////////
		
		var color = gBody.get_lnb_color();		
		$("#buddylist_main li").on("mouseover", function(e){
		//	$(e.currentTarget).css("border", "1px solid rgb(231, 227, 227)");
			$(e.currentTarget).css("border", "1px solid " + color);
		});
		$("#buddylist_main li").on("mouseout", function(e){
			$(e.currentTarget).css("border", "1px solid white");
		});
		
		$( "#buddylist_main .user" ).off().on("click", function(e) {
			//$( "#buddylist_main .user" ).on("click", function() {
				//버디리스트에서 사용자를 더블클릭하면 대화방으로 이동하는 버튼
				//돌아갈 페이지를 등록하고 , 현재 오픈하는 페이지를 등록한다.		
				//기존에 대화 채널이 있는지 확인한다.		
				console.log("click : " + $(e.target).attr("class"));
				if ($(e.target).attr("class") && $(e.target).attr("class").indexOf("ico btn-more person") > -1){
					
					var type = $(this).attr("data");
					var html = "";			
					$(this).addClass("on");						
					if (type == "group"){
						//그룹 ContextMenu 클릭한 경우			
						$.contextMenu({
							selector : ".ico.btn-more.group",
							autoHide : true,
							trigger : "left",
							callback : function(key, options){					
								var id = $(this).parent().children(0).attr("id");
								gBody.context_menu_call_group(key, options, id);
							},
							events : {
								hide: function (options) {
									$(this).removeClass("on");
			                	}				
							},				
							items: gBody.group_menu_content()
						});				
					}else if (type == "person"){
						//버디리스트 사용자 ContextMenu 클릭한 경우
						$.contextMenu( 'destroy', ".ico.btn-more.person" );				
						$.contextMenu({
							selector : ".ico.btn-more.person",
							autoHide : true,
							trigger : "left",
							callback : function(key, options){	
						
								var id = $(this).parent().find(".person_dis").attr("id");
								var name = $(this).parent().find(".person_dis").attr("data4");
								key = key + "-spl-" + name;
								gBody.context_menu_call_person(key, options, id);						
							},
							events : {
								hide: function (options) {
									$(this).removeClass("on");
			                	}				
							},				
						//	items: gBody.person_menu_content("person")
							build : function($trigger, e){
								
								var id = $trigger.attr("data");
								//options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
								return {
									items : gBody.person_menu_content("person", id)
								}
							}
							
//							build : function($trigger, e){
//								gBody.click_room_id = $trigger.attr("id");
//								var id = $(this).parent().find(".person_dis").attr("id");
//								//options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
//								return {
//									//items : gBody.person_menu_content("person")
//								}
//							}
						});
					}else if (type == "chatroom"){
						//메인 체팅방 ContentMenu 클릭한 경우				
						$.contextMenu({
							selector : ".ico.btn-more.chat",
							autoHide : true,
							trigger : "left",
							callback : function(key, options){						
								var m = "clicked : 메인 체팅방 ContentMenu 클릭한 경우 " + key + "/" + $(this).attr("id");
								alert(m);
							},
							events : {
								hide: function (options) {
									$(this).removeClass("on");
			                	}				
							},				
							items: gBody.chatroom_menu_content()
						});
					}	
				}else if ($(e.target).hasClass("btn-user-remove")){
					
					var delid = $(e.target).attr("id").replace("buddy_del_id_","");
					var srcname = $(e.target).parent().parent().parent().parent().prev().find("dx").attr("data");
					
					var tname = $(e.target).parent().attr("data3");
					
					var msg = gap.lang.cout_msg;
					if (gap.curLang == "ko"){
						 msg = tname + " " + gap.lang.cout_msg;
					}
					gap.showConfirm_new({
						title: gap.lang.groupdelete,
						text1 : gap.lang.Cancel,
						text2 : gap.lang.OK,
						contents: msg,
						callback: function(e){
							_wsocket.delete_person_only_this_group(srcname, delid);
						},
						callback2 : function(){
						}
					});
					
				}else{
					var uid = $(this).children().attr("data");		
					var name = $(this).children().attr("data4");
					var room_key = _wsocket.make_room_id(uid);	
					
					if ($(e.target).attr("class") == "mCS_img_loaded"){
						//이미지를 클릭한 것이기 때문에 프로피을 띄워준다.
						gap.showUserDetailLayer(uid);
					}else{
						gBody.enter_chatroom_for_chatroomlist(room_key, uid, name);
					
					}
				}				
			});				
		
			

			$("#buddylist_main .ico.btn-more").on("click", function(event){			
				//더보기 메뉴 클릭하는 경우 버디리스트와 그룹 / 메인에서 채팅방 메뉴		
				
				var type = $(this).attr("data");
				var html = "";			
				$(this).addClass("on");						
				if (type == "group"){
					//그룹 ContextMenu 클릭한 경우			
					$.contextMenu({
						selector : ".ico.btn-more.group",
						autoHide : true,
						trigger : "left",
						callback : function(key, options){					
							var id = $(this).parent().children(0).attr("id");
							gBody.context_menu_call_group(key, options, id);
						},
						events : {
							hide: function (options) {
								$(this).removeClass("on");
		                	}				
						},				
						items: gBody.group_menu_content()
					});				
				}else if (type == "person"){
					//버디리스트 사용자 ContextMenu 클릭한 경우
					$.contextMenu( 'destroy', ".ico.btn-more.person" );				
					$.contextMenu({
						selector : ".ico.btn-more.person",
						autoHide : true,
						trigger : "left",
						callback : function(key, options){	
					
							var id = $(this).parent().find(".person_dis").attr("id");
							var name = $(this).parent().find(".person_dis").attr("data4");
							key = key + "-spl-" + name;
							gBody.context_menu_call_person(key, options, id);						
						},
						events : {
							hide: function (options) {
								$(this).removeClass("on");
		                	}				
						},				
						
						build : function($trigger, e){
							
							var id = $trigger.prev().attr("data");
							//options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
							return {
								items : gBody.person_menu_content("person", id)
							}
						}
						//items: gBody.person_menu_content("person")
						
						
						
					});
				}else if (type == "chatroom"){
					//메인 체팅방 ContentMenu 클릭한 경우				
					$.contextMenu({
						selector : ".ico.btn-more.chat",
						autoHide : true,
						trigger : "left",
						callback : function(key, options){						
							var m = "clicked : 메인 체팅방 ContentMenu 클릭한 경우 " + key + "/" + $(this).attr("id");
							alert(m);
						},
						events : {
							hide: function (options) {
								$(this).removeClass("on");
		                	}				
						},				
						items: gBody.chatroom_menu_content()
					});
				}		
				
			});			
			
			$(".group h3 dx").on("click", function(event){	
				var cls = $(this).attr("id");
				var bun = cls.replace("group_","");			
				var isOpen = $(this).find("button").attr("class");			
				var groupname = $("#" + cls).attr("data");	
				//groupname = groupname.trim();
				
				if (isOpen.indexOf("on") > -1){
					$(this).find("button").removeClass("on");
					$("#group_ul_"+bun).fadeOut();				
					_wsocket.close_group(groupname);		
					gap.search_buddylist_change_expand_info(groupname, false);
				}else{
					$(this).find("button").addClass("on");
					$("#group_ul_"+bun).fadeIn();				
					_wsocket.open_group(groupname);
					gap.search_buddylist_change_expand_info(groupname, true);
				}
				event.stopPropagation();
			});				
//			//그룹추가를 위해서 미리 만들어 놓아야 한다. 그룹명으로 버튼 형태로 표시		
			var group_info = gap.buddy_list_info.ct.bl;		
			group_info = sorted=$(group_info).sort(gap.sortNameDesc);		
			var html = "";
			html += "<h2>"+gap.lang.addChatUser+"</h2>";
			html += "<button class='ico btn-nav-close' id='group_add_layer_close'></button>";
			html += "<ul>";
			for (var k = 0 ; k < group_info.length; k++){
				var info_g = group_info[k];
				html += "	<li ><span>"+info_g.nm+"</span></li>";
			}
			html += "</ul>";
			$("#group_add_layer").hide();
			$("#group_add_layer").html(html);		
			$("#group_add_layer_close").on("click", function(){
				$("#group_add_layer").fadeOut();
			});		
			$("#group_add_layer ul li").on("click", function(){
				$(this).addClass("on");			
				gBody.drop_text = $(this).text();			
				//멀티로 선택한 사용자를 체크한다.
				gBody.multi_select_user_check();			
				var msg = "";
				if (gBody.selected_user_list == ""){
					msg = gap.lang.AddthisGroup;
				}else{
					var cnt = gBody.selected_user_list.split("-spl-").length;
					msg = gap.lang.selx + " " +  cnt + gap.lang.mys + " " + gap.lang.AddthisGroup;
				}			
	 			$.confirm({
	 				title : "Confirm",
	 				content : msg +"<hr>",
	 				type : "default",  
	 				closeIcon : true,
	 				closeIconClass : "fa fa-close",
	 				columnClass : "small",  
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
				 				$("#group_add_layer").fadeOut(1000, function(){
					 				$("#group_add_layer ul li").removeClass("on");
					 			});			 			
	 							var user = gBody.dragg_user;
	 							var name = gBody.dragg_user_name;
	 							var targetgroup = gBody.drop_text; 				
	 							if (gBody.selected_user_list == ""){
	 								_wsocket.copy_person(user, targetgroup, name);
	 							}else{
	 								//멀티로 선택한 경우
	 								var list = gBody.selected_user_list.split("-spl-");
	 								var list_name = gBody.selected_user_list_name.split("-spl-");
	 								for (var i = 0 ; i < list.length; i++){
	 									var user = list[i];
	 									var name = list_name[i];
	 									_wsocket.copy_person(user, targetgroup, name);
	 								}
	 							} 							
	 							gBody.multi_select_check_empty();
	 						}
	 					},
	 					cancel : {
	 						keys: ['esc'],
	 						text : gap.lang.Cancel,
	 						btnClass : "btn-default",
	 						action : function(){
	 							$("#group_add_layer ul li").removeClass("on"); 							
	 							gBody.multi_select_check_empty();
	 						}
	 					}
	 				}
	 			});	
			});	
			$("#group_add_layer ul li").droppable({
				drop : function(event, ui){		
				
					try{				
						var droppable = $(this);
				 		var draggable = ui.draggable;
				 		var dragid = ui.draggable.attr("id");
				 		gBody.drag_user = ui.draggable.attr("data2");
				 		gBody.drag_name = ui.draggable.attr("data4");			 		
				 		gBody.drag_id = dragid;
						gBody.drop_text = droppable.children().text();					
				 		if (draggable.hasClass("result-profile")){
				 			//파일을 드래그해서 이동하면 업로드하는 프로그레스바 효과를 추가해 준다.		 			
				 			droppable.addClass("on");			 			
				 			//멀티로 선택한 사용자를 체크한다.
							gBody.multi_select_user_check();						
							var msg = "";
							if (gBody.selected_user_list == ""){
								msg = gap.lang.AddthisGroup;
							}else{
								var cnt = gBody.selected_user_list.split("-spl-").length;
								msg = gap.lang.selx + " " + cnt + gap.lang.mys + " " + gap.lang.AddthisGroup;
							}		 			
				 //			var msg = gap.lang.AddthisGroup;
				 			$.confirm({
				 				title : "Confirm",
				 				content : msg +"<hr>",
				 				type : "default",  
				 				closeIcon : true,
				 				closeIconClass : "fa fa-close",
				 				columnClass : "small",  
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
				 			
//				 							var ke = gBody.drag_id;
				 							var user = gBody.drag_user;
				 							var name = gBody.drag_name;			 									 							
							 				$("#group_add_layer").fadeOut(1000, function(){
								 				$("#group_add_layer ul li").removeClass("on");
								 			});						 			
							 				var targetgroup = gBody.drop_text;			 							
				 						//	_wsocket.copy_person(user, targetgroup);			 							
				 							if (gBody.selected_user_list == ""){
				 								_wsocket.copy_person(user, targetgroup, name);
				 							}else{
				 								//멀티로 선택한 경우
				 								var list = gBody.selected_user_list.split("-spl-");
				 								var list_name = gBody.selected_user_list_name.split("-spl-");
				 								for (var i = 0 ; i < list.length; i++){
				 									var user = list[i];
				 									var name = list_name[i];
				 									_wsocket.copy_person(user, targetgroup, name);
				 								}
				 							}			 							
				 							gBody.multi_select_check_empty();					 				
				 						}
				 					},
				 					cancel : {
				 						keys: ['esc'],
				 						text : gap.lang.Cancel,
				 						btnClass : "btn-default",
				 						action : function(){
				 							$("#group_add_layer ul li").removeClass("on");			 							
				 							gBody.multi_select_check_empty();
				 						}
				 					}
				 				}
				 			});	 			
				 		}
					}catch(e){}		 		
				},
				hoverClass: "drop-area",
			//	accept: "div.user",
		    	classes: {
		    //       "ui-droppable-active": "drop-area"
		        }
			});			
			gBody.buddy_scroll_bar();		
			$("#buddylist_main ul li").droppable({
				drop : function(event, ui){		
					try{
					
						var droppable = $(this);
				 		var draggable = ui.draggable;
				 		var dragid = ui.draggable.attr("id");	 			
				 		if (draggable.hasClass("chat-attach") || 
				 				draggable.hasClass("balloon") || 			 				
				 				draggable.hasClass("chat_img") ||
				 				draggable.hasClass("chat_img2") ||
				 				draggable.hasClass("chat_file") ||	
				 				draggable.hasClass("user") ||
				 				draggable.hasClass("grid-container") ||
				 				draggable.hasClass("img-content")){
				 			//파일을 드래그해서 이동하면 업로드하는 프로그레스바 효과를 추가해 준다.			 			
				 			var msg = "";
				 			if (draggable.hasClass("user")){			 						 			
				 				var msg = "";				 		
					 			var na = $($(draggable).html()).attr("data4");				 		
					 			var mgroup = $(this).parent().prev().find("dx").attr("data");				 			
					 			var msg = gap.lang.user_group_move.replace("$1",na).replace("$2",mgroup);			 				
				 			}else{
				 				var msg = gap.lang.dragandadd;
				 			}			 			
				 			if (draggable.hasClass("user")){
				 				//같은 그룹에 드래그 한 경우 패스한다.			 				
								var id = droppable.children().children().get(0).id.split("_")[1];
								var targetname = $("#group_" + id).attr("data");
								var srcname = gBody.drag_person_obj.srcgroup;
								if (targetname == srcname){
									return false;
								} 								
				 			}		 			
				 			gap.showConfirm({
								title: "Confrim",
								contents: msg,
								callback: function(){
				 				if (draggable.hasClass("user")){	
	 								//그룹을 이동한 경우 처라히기	
	 								var id = droppable.children().children().get(0).id.split("_")[1];
	 								var targetname = $("#group_" + id).attr("data");
	 								var srcname = gBody.drag_person_obj.srcgroup;
	 								var user = gBody.drag_person_obj.uid; 				
	 								var name = $(droppable.children().children().get(0)).attr("data4");
	 								if (typeof(srcname) == "undefined" || srcname == ""){
	 									_wsocket.copy_person(user, targetname, name);
	 								}else{
	 									_wsocket.move_person(srcname, user, targetname, name);
	 								}
	 								
	 							}else{ 								
	 								//드롭을 당하는 사용자 uid
	 								var uid = droppable.children().children().attr("data");
	 								var name = droppable.children().children().attr("data4");
					 				var room_key = _wsocket.make_room_id(uid);
					 				room_key = room_key.replace(/-lpl-/gi,"_");
					 				gBody.file_drag_room_id = room_key;
					 				var exist_room = gap.chatroom_exist_check(room_key);
					 				if (exist_room == false){
					 					//기존에 채팅방이 없을 경우 방을 만들고 메시지를 보내야 한다.
					 					_wsocket.make_chatroom_11_only_make(uid, name);
					 				}		
					 				var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다. 								
	 								if (draggable.hasClass("balloon")){
	 					 				//대화내역중에 메시지를 버디리스트에 드래그 & 드롭하는 경우 처리
	 					 				//드래그된 사용자와의 대화방이 기존에 있는지 없는지에 따라 처리한다. 									
	 									var tx = $(draggable).html();
	 									var txHTML = "";
	 									if (typeof($(tx).not(".balloon-btn").remove().get(1)) == "undefined"){
	 										//ogtag를 드래그하는 경우
	 										txHTML = $(tx).children().get(1).outerHTML;
	 									}else{
	 										//일반 메시지를 드래그하는 경우
	 										txHTML = $(tx).not(".balloon-btn").remove().get(1).innerHTML;
	 									}					 						 					 				
	 					 			//	var sendmsg = $(draggable).text();	
	 					 			//	var sendmsg = $(draggable).html().replace(/\<p style=\"height\:5px\"><\/p>/gi,"\n");
	 					 				var sendmsg = txHTML.replace(/\<p style=\"height\:5px\"><\/p>/gi,"\n");
	 					 				sendmsg = $(sendmsg).text();
	 					 				gBody.last_msg.msg = sendmsg;
	 					 				gBody.last_msg.ty = "msg"; 					 				
		 								var parentClass = $(draggable).parent().attr("class");
		 								if (parentClass == "talk link"){
		 									//ogTag를 드래그 & 드롭한 경우
		 									//aaaaa	 								
		 									var obj = gBody.search_og_only_search(sendmsg);
		 									obj.cid = room_key;
		 									 _wsocket.send_chat_msg(obj);			 									
		 								}else{
		 									var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.		 					 					 				
		 					 				gBody.msg_send_to_server(msgid, sendmsg, room_key);	
		 								}			 				
		 							}else{ 								
		 								
		 								
		 								var obj = new Object();	 												 								
		 								var filename = $(draggable).attr("data");
		 								var downloadurl = $(draggable).attr("data2");
		 								var size = $(draggable).attr("data3");
		 								var ty = "";
		 								var previewurl = "";
		 								//채팅창 안에서 드래그한 파일 또는 이미지일 경우
		 								if (draggable.hasClass("chat-attach")){
		 									obj.ty = 5;
		 								}else{
		 									obj.ty = 6;
		 								}				 								
		 								//우측 프레임에서 파일또는 이미지를 드래그 한 경우		
		 								var ismultiImage = false;
		 								var multiID = "";
		 								if (draggable.hasClass("chat_img2") || draggable.hasClass("chat_img") || draggable.hasClass("grid-container")){
		 									ty = "image";
		 									
		 									obj.ty = 6;
		 									filename = $(draggable.html()).find("img").attr("data1");
		 									downloadurl = $(draggable.html()).find("img").attr("data2");
		 									previewurl = $(draggable.html()).find("img").attr("src");
		 									size = $(draggable.html()).find("img").attr("data3");
		 									
		 									var pkn = $(draggable.html()).find(".submulti");
		 									if (pkn.length > 0){
		 										//묶음 전송된 이미지를 드래그 & 드롭으로 전송하는 경우임
		 										ismultiImage=true;
		 										multiID = pkn.attr("id").split("_")[1];
		 									}
		 									if ($(draggable.html()).length > 1){
		 										//채팅 내용에 멀티 이미지를 드래그 & 드롭한 경우이다.
		 										ismultiImage=true;
		 										multiID = $($(draggable.html())[0]).attr("data5");
		 										filename = $($(draggable.html())[0]).attr("data");
		 									}
		 								}else if (draggable.hasClass("chat_file")){
		 									ty = "file";
		 									obj.ty = 5;
		 									filename = $(draggable).find("span").attr("data1");
		 									downloadurl = $(draggable).find("span").attr("data2");
		 									size = $(draggable).find("span").attr("data3");
		 								} 								
		 								obj.msg = filename;
		 								obj.cid = room_key;
		 								obj.mid = msgid; 										 								 
		 								var exobj = new Object();	 								
		 								exobj.nid = gap.sid;
		 								exobj.ty = gap.file_extension_check(filename);
		 								var fnames = [];
		 								var fsizes = [];
		 								var fdownloads = [];
		 								
		 								
		 								if (ismultiImage){
		 									//이미지 묶믕한 이미지 파일들의 정보를 수집한다.
		 									for (var k = 0 ; k < gBody.tMultiImages.length; k++){
		 										var ipm = gBody.tMultiImages[k];
		 										if (ipm.sq == multiID){
		 											obj.ex = ipm.ex;
		 											for (var u = 0 ; u < obj.ex.files.length; u++){
		 												var pkitem = obj.ex.files[u];
		 												
		 												fnames.push(pkitem.nm);
		 												fsizes.push(pkitem.sz);
		 												var downloadurl = gap.fileupload_server_url + "/filedown" + pkitem.sf + "/" + pkitem.sn + "/" + encodeURIComponent(pkitem.nm);
		 												fdownloads.push(downloadurl);
		 												
		 											}
		 											break;
		 										}
		 									} 	
		 									
		 								}else{
			 								var spl = downloadurl.split("/");		 				
			 								exobj.sn = spl[6];
				 							exobj.sf = "/" + spl[5];		 						 								 
			 								exobj.sz = parseFloat(size);
			 								exobj.nm = filename;
			 								obj.ex = exobj; 
		 								}
		 								
		 								
						
		 								 
		 								 
		 								 
		 								 
		 								 if (gBody.cur_cid == room_key){
		 									 //드래그하는 상황에 현재 창이 동일한 창이면 파일을 그려 준다.
		 									var key = gap.search_cur_ky();
		 							    	var time = gap.search_time_only();	 							    	  
		 							    	var xdate = new Date();		
		 							  		var date = xdate.YYYYMMDDHHMMSS();
		 							  		filename = filename.replace("'","`");	 							  		 
		 							  		var ucnt = gBody.cur_room_att_info_list.length -1 ;							  		
		 							  		if (ty == "file"){
		 							  			gBody.file_draw('me', ty, key, date, time, filename, size, downloadurl, previewurl, msgid, '','D', ucnt, "", "");	
		 							  		}else{
		 							  			if (ismultiImage){
		 							  				gBody.file_draw('me', ty, key, date, time, fnames, fsizes, fdownloads, previewurl, msgid, '','D', ucnt, "", "",room_key);	
		 							  			}else{
		 							  				gBody.file_draw('me', ty, key, date, time, filename, size, downloadurl + "/" + encodeURIComponent(filename), previewurl, msgid, '','D', ucnt, "", "");
		 							  			}
		 							  				
		 							  		}	 	
		 							  	
		 							  		gBody.check_display_layer();	 									
		 								 } 								 
		 								 gBody.last_msg.ty = obj.ty 
		 								 gBody.last_msg.ex = obj;
		 								 gBody.last_msg.downloadurl = downloadurl; 								 
		 								 _wsocket.send_chat_msg(obj);
		 								////////////////////////////////////////////////////////////////////////////////////////////////////////////// 								
		 								//파일 전송 처리하기 그래프
		 								gBody.process_display(droppable);						 			
		 							}
	 							}		
								}
							});		 			 			
				 		}			 	
					}catch(e){}		 		
				},
				hoverClass: "drop-area",
			//	accept: "div.user",
		    	classes: {
		    //       "ui-droppable-active": "drop-area"
		        }
			});			
			
			$("#buddylist_main dx").droppable({
				drop : function(event, ui){
				
					try{
						var droppable = $(this);
				 		var draggable = ui.draggable;
				 		var dragid = ui.draggable.attr("id");			
				 		if (draggable.hasClass("user")){
				 			//파일을 드래그해서 이동하면 업로드하는 프로그레스바 효과를 추가해 준다.			 			
				 			var msg = "";
				 			//var na = $($(draggable).html()).attr("data");
				 			//na = gap.search_username(na);
				 			var na = $($(draggable).html()).attr("data4");
				 			var mgroup = $(this).find("span").get(0).innerText;			 			
				 			var msg = gap.lang.user_group_move.replace("$1",na).replace("$2",mgroup);			 						 			
				 			if (draggable.hasClass("user")){
				 				//같은 그룹에 드래그 한 경우 패스한다.			 				
								var id = droppable.children().children().get(0).id.split("_")[1];
								var targetname = $("#group_" + id).attr("data");
								var srcname = gBody.drag_person_obj.srcgroup;
								if (targetname == srcname){
									return false;
								} 								
				 			}		 			 			
				 			gap.showConfirm({
				 				title: "Confrim",
				 				contents: msg,
				 				callback: function(){
				 				//확인을 클릭한 경우
	 							if (draggable.hasClass("user")){	
	 								//그룹을 이동한 경우 처라히기
	 								var id = droppable.children().children().get(0).id.split("_")[1];
	 								var targetname = $("#group_" + id).attr("data");
	 								var srcname = gBody.drag_person_obj.srcgroup;
	 								var user = gBody.drag_person_obj.uid; 		
	 								var name = $($(draggable).html).find(".person_dis").attr("data4");
	 								if (typeof(srcname) == "undefined" || srcname == ""){
	 									//복사인 경우	
	 									_wsocket.copy_person(user, targetname, name);	 								
	 								}else{
	 									_wsocket.move_person(srcname, user, targetname, name);
	 								}
	 								
	 							}else{ 								
	 								//드롭을 당하는 사용자 uid
	 								var uid = droppable.children().children().attr("data");
	 								var name = droppable.children().children().attr("data4");
						 				var room_key = _wsocket.make_room_id(uid);
						 				gBody.file_drag_room_id = room_key;
						 				var exist_room = gap.chatroom_exist_check(room_key);
						 				if (exist_room == false){
						 					//기존에 채팅방이 없을 경우 방을 만들고 메시지를 보내야 한다.
						 					_wsocket.make_chatroom_11_only_make(uid, name);
						 				}		
						 				var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다. 								
	 								if (draggable.hasClass("balloon")){
	 					 				//대화내역중에 메시지를 버디리스트에 드래그 & 드롭하는 경우 처리
	 					 				//드래그된 사용자와의 대화방이 기존에 있는지 없는지에 따라 처리한다.			 					 						 					 				
	 					 				//var sendmsg = $(draggable).text();	
	 									var tx = $(draggable).html();
	 									var txHTML = $(tx).not(".balloon-btn").remove().get(1).innerHTML;
	 					 			//	var sendmsg = $(draggable).html().replace(/\<p style=\"height\:5px\"><\/p>/gi,"\n");
	 					 				var sendmsg = txHTML.replace(/\<p style=\"height\:5px\"><\/p>/gi,"\n");
	 					 				sendmsg = $(sendmsg).text();
	 					 				gBody.last_msg.msg = sendmsg;
	 					 				gBody.last_msg.ty = "msg"; 					 				
		 								var parentClass = $(draggable).parent().attr("class");
		 								if (parentClass == "talk link"){
		 									//ogTag를 드래그 & 드롭한 경우				 									
		 									var obj = gBody.search_og_only_search(sendmsg);
		 									obj.cid = room_key;
		 									 _wsocket.send_chat_msg(obj);			 									
		 								}else{
		 									var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.		 					 					 				
		 					 				gBody.msg_send_to_server(msgid, sendmsg, room_key);	
		 								}					 				
		 							}else{	 											 					 				
	 					 				/////////////////////////////////////////////////////////////////////////////////////////////////////////
		 								var obj = new Object(); 								
		 								var filename = $(draggable).attr("data");
		 								var downloadurl = $(draggable).attr("data2");
		 								var size = $(draggable).attr("data3");
		 								var ty = "";
		 								//채팅창 안에서 드래그한 파일 또는 이미지일 경우
		 								if (draggable.hasClass("chat-attach")){
		 									obj.ty = 5;
		 								}else{
		 									obj.ty = 6;
		 								} 								
		 								if (draggable.hasClass("chat_img2") || draggable.hasClass("chat_img") ){
		 									obj.ty = 6;
		 									filename = $(draggable.html()).find("img").attr("data1");
		 									downloadurl = $(draggable.html()).find("img").attr("data2");
		 									size = $(draggable.html()).find("img").attr("data3");
		 								}else if (draggable.hasClass("chat_file")){
		 									obj.ty = 5;
		 									filename = $(draggable).find("span").attr("data1");
		 									downloadurl = $(draggable).find("span").attr("data2");
		 									size = $(draggable).find("span").attr("data3");
		 								} 								
		 								obj.msg = filename;
		 								obj.cid = room_key;
		 								obj.mid = msgid;	 										 								 
		 								 var exobj = new Object();		    	 		    	 
		 								 exobj.nid = gap.sid;
		 								 exobj.ty = gap.file_extension_check(filename);
		 								 var spl = downloadurl.split("/");			 								 
		 							//	 if (gap.isDev){
		 							//		exobj.sn = spl[5];
		 							//		exobj.sf = "/" + spl[4];
		 							//	 }else{
		 									exobj.sn = spl[6];
		 									exobj.sf = "/" + spl[5];
		 							//	 }
		 								 exobj.sz = parseFloat(size);
		 								 exobj.nm = filename;
		 								 obj.ex = exobj;	 								 
		 								gBody.last_msg.ty = obj.ty 
		 								gBody.last_msg.ex = obj;
		 								gBody.last_msg.downloadurl = downloadurl; 								 
		 								 _wsocket.send_chat_msg(obj); 								 					 								
		 								//파일 전송 처리하기 그래프
		 								gBody.process_display(droppable);					 			
		 							}
	 							}	
				 				}
				 			});			 				 			
				 		}	
					}catch(e){}		 		
				},
				hoverClass: "drop-area",
			//	accept: "div.user",
		    	classes: {
		    //       "ui-droppable-active": "drop-area"
		        }
			});
					
			$("#buddylist_main .user").draggable({
				 revert: "invalid",
				 stack: ".draggable",     //가장위에 설정해 준다.
				 opacity: 1,
			//	 containment: "window",
				 scroll: false,
			//	 helper: 'clone',
				 helper: function () { 
					//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.
					return $(this).clone().appendTo("#nav_left_menu").css("zIndex",2000).show();
			     },			 
			     cursor: 'move',			 
				 start : function(event, ui){
					$(this).draggable("option", "revert", false);				
					var uid = $(this).children().attr("data");
					var id = $(this).children().attr("id").split("_")[2];
					var bun = $(this).children().attr("id").split("_")[1];
					var srcgroup = $("#group_"+bun).attr("data");
					var person_img = $("#person_"+id+"_img").children().attr("src");
					var job = $("#person_"+id+"_job").text();
					var dept = $("#person_"+id+"_dept").text();
					var name = $("#person_"+id+"_name").text();
					var status = $("#person_"+id+"_status").attr("class");	
					var dp = $("#person_"+id+"_name").parent().find("span").text();
					
					gBody.drag_person_obj.uid = uid;
					gBody.drag_person_obj.srcgroup = srcgroup;			
					var html = "";
					html += "<div  style='width:"+gap.right_page_width+"; padding:10px 5px 10px 15px; background:#fff;border:1px solid #999;border-radius:3px;box-shadow:0px 2px 8px 0 rgba(217,217,217,1);overflow:hidden;display:inline-block;;z-index:2200;'>";
					html += "	<div class='user' >";
					html += "		<div class='user-thumb'><img src='"+person_img+"' /></div>";
					html += "			<span class='"+status+"'></span>";
					html += "			<dl style='padding-left:55px'>";
					html += "				<dt>"+name+"</dt>";
					html += "				<dd style='font-size:12px; color:#666; word-break:break-all; width:100%; white-space:nowrap; over-flow:hidden; text-overflow:ellipsis;'>"+dp+"</dd>";
					html += "			</dl>";
					html += "		</div>";
					html += "	</div>";
					html += "</div>";		
					ui.helper.html(html);
				},
				stop : function(event, ui){						
				}
			});
	},
	
	"buddylist_user_search" : function(str, selectme){
		
		gsn.requestSearch('', str, function(sel_data){	
			var infos = [];
			for (var i = 0 ; i < sel_data.length; i++){
				var info = sel_data[i];
				if (selectme){	
					gBody.aleady_select_user_count = 0;
				//	gBody.buddylist_search_result_display(info);
					infos.push(info);
					gBody.alert_aleady_select_user();					
				}else{
					if (info.ky.toLowerCase() == gap.userinfo.rinfo.ky.toLowerCase()){
						mobiscroll.toast({message:gap.lang.me_not_add_invite_user, color:'danger'});
						
					}else{
						gBody.aleady_select_user_count = 0;
					//	gBody.buddylist_search_result_display(info);
						infos.push(info);
						gBody.alert_aleady_select_user();
					}
				}
				
			}
			
			gBody.buddylist_search_result_display(infos);
		});
	},
	
	"buddylist_search_result_display" : function(infos){
		//버디리스트에서 사용자 검색한 결과를 버디리스트 영역에 리스트로 표시한다.
	//	$("#buddylist_main").empty();
	

		gBody.is_buddylist_search = true;
		var slist = [];

		for(var k = 0; k < infos.length; k++){
			if ($("#buddy_search_ul [data="+infos[k].ky+"]").length == 0){
				gBody.temp_search_result.push(infos[k]);
			}			
		}
		
		try{
			$("#buddylist_main").mCustomScrollbar('destroy');
		}catch(e){
		}	
		var html = "";
		html += "<h3 style='font-size:15px; margin-bottom:5px' id='buddylist_search_result'>"+gap.lang.search+" ("+gBody.temp_search_result.length+gap.lang.total_attach_count_txt+")</h3>";
		html += "<div class='start_chatting_btn' id='start_chatting' style='display:none'>"+gap.lang.allchat+"</div>";
		html += "<div class='search_btn_close'></div>";
		html += "	<ul  class='groupClass' style='list-style:none' id='buddy_search_ul'>";
		for (var i = 0 ; i < gBody.temp_search_result.length; i++){
			var sub_info = gBody.temp_search_result[i];
			var user_info = gap.user_check(sub_info);		
			slist.push(sub_info.ky);
			html += gBody.draw_buddylist_info(i, user_info, "T");
		}

		$("#buddylist_main").html(html);		
		
		$("#quick_search_buddylist").val("");
		$("#quick_search_buddylist").focus();
		
		if (gBody.temp_search_result.length > 1){
			$("#start_chatting").show();
		}
		

		gBody.__buddylist_events();
		
		$("#buddylist_main .search_btn_close").off().on("click", function(){
			$("#tab1_sub").click();
		});
		
		//삭제 버튼 이벤트 처리
		$("#buddylist_main .btn-user-remove").off().on("click", function(e){
			//is_buddylist_search
			var delid = $(e.currentTarget).parent().attr("data");
			var tarray = [];
			for (var i = 0 ; i < gBody.temp_search_result.length; i++){
				var item = gBody.temp_search_result[i];
				if (delid == item.ky){
				}else{
					tarray.push(item);
				}
			}
			gBody.temp_search_result = tarray;
			$(e.currentTarget).parent().parent().parent().remove();
			$("#buddylist_search_result").html(gap.lang.search + " ("+gBody.temp_search_result.length+gap.lang.total_attach_count_txt +")");
			
			if (gBody.temp_search_result.length < 2){
				$("#start_chatting").hide();
			}			
			//gBody.temp_search_result 배열에서 제거해 줘야 한다.			
		});
		
		//전체 채팅 클릭시 이벤튼 처리
		$("#start_chatting").off().on("click", function(e){
		
			if (gBody.temp_search_result.length == 1){
				//1:1 일 경우
				var item = gBody.temp_search_result[0];
				var uid = item.ky;		
				var name = item.nm;
				var room_key = _wsocket.make_room_id(uid);	
				gBody.enter_chatroom_for_chatroomlist(room_key, uid, name);
			}else{
				//1:N일 경우
				var list = [];
				var exist_me = false;
				for (var i = 0 ; i < gBody.temp_search_result.length; i++){
					var item = gBody.temp_search_result[i];
					list.push(item.ky);
					if (item.ky == gap.userinfo.rinfo.ky){
						exist_me = true;
					}
				}
				if (!exist_me){
					list.push(gap.userinfo.rinfo.ky);
				}
				//기존에 팀			
				var res = gap.search_exist_chatroom_nn(list);
				if (res != ""){
					//기존에 참석자가 포함된 방이 있다는 이야기임
					 gBody.enter_chatroom_for_chatroomlist(res, "", "");
					 return false;
				}	
				_wsocket.search_user_makeroom(list);
			}		
		});
		
		//검색 결과 상태값 검색하기
		gap.status_check(slist, 3, "buddylist_search");	
		
	},
	
	"buddylist_search_status" : function (ky, st, msg, ty, exst){
		gap.buddy_change_status(ky, st, msg, "init", exst);
	},

	
	"person_more_btn_event" : function(obj){
		
		var _self = obj;
		var type = $(_self).attr("data");
		var html = "";			
		$(this).addClass("on");						
		if (type == "group"){
			//그룹 ContextMenu 클릭한 경우			
			$.contextMenu({
				selector : ".ico.btn-more.group",
				autoHide : true,
				trigger : "left",
				callback : function(key, options){					
					var id = $(this).parent().children(0).attr("id");
					gBody.context_menu_call_group(key, options, id);
				},
				events : {
					hide: function (options) {
						$(_self).removeClass("on");
                	}				
				},				
				items: gBody.group_menu_content()
			});				
		}else if (type == "person"){
			//버디리스트 사용자 ContextMenu 클릭한 경우
			$.contextMenu( 'destroy', ".ico.btn-more.person" );				
			$.contextMenu({
				selector : ".ico.btn-more.person",
				autoHide : true,
				trigger : "left",
				callback : function(key, options){	
			
					var id = $(_self).parent().find(".person_dis").attr("id");
					var name = $(_self).parent().find(".person_dis").attr("data4");
					key = key + "-spl-" + name;
					gBody.context_menu_call_person(key, options, id);						
				},
				events : {
					hide: function (options) {
						$(_self).removeClass("on");
                	}				
				},				
				items: gBody.person_menu_content("person")
			});
		}else if (type == "chatroom"){
			//메인 체팅방 ContentMenu 클릭한 경우				
			$.contextMenu({
				selector : ".ico.btn-more.chat",
				autoHide : true,
				trigger : "left",
				callback : function(key, options){						
					var m = "clicked : 메인 체팅방 ContentMenu 클릭한 경우 " + key + "/" + $(this).attr("id");
					alert(m);
				},
				events : {
					hide: function (options) {
						$(_self).removeClass("on");
                	}				
				},				
				items: gBody.chatroom_menu_content()
			});
		}
	},
	
	"multi_select_user_check" : function(){
		//$("#wrap-usearch-dis .usearch_person");		
		var res = "";
		var res2 = "";		
		$("#wrap-usearch-dis .ico.btn-check.on").each(function(inx){
			var info = this;			
			var cid = gap.search_cur_ky();
			var tid = $(info).parent().attr("data2");
			var name = $(info).parent().attr("data4");
			if (cid != tid){
				if (res == ""){
					res = tid;
					res2 = name;
				}else{
					res += "-spl-" + tid;
					res2 += "-spl-" + name;
				}
			}		
		});			
		gBody.selected_user_list = res;
		gBody.selected_user_list_name = res2;		
	},	
	
	"multi_select_check_empty" : function(){
		//그룹에 추가 후에 선택했던 것은 모두 지운다.
		$("#wrap-usearch-dis .ico.btn-check.on").removeClass("on");
	},	
	
	"buddy_list_status_dis" : function(obj){	
		//- 사용자 상태 변경 : 0(offline), 1(online), 2(부재중), 3(방해금지), (사용자 정의 : 151~255)
		if (typeof(obj.ct) != "undefined"){
			var lists = obj.ct.usr;			
			for (var i = 0 ; i < lists.length; i++){
				var info = lists[i];				
				
				gap.buddy_change_status(info.ky, info.st, info.msg, "init", info.exst);				
				var obj = new Object();
				obj.id = info.ky;
				obj.st = info.st;
				gap.status_add(obj);
			}			
			gap.buddy_set_status();
		}		
	},	
	
	"delete_group" : function(groupname){
		var msg = gap.lang.delgroup.replace("$s", "[" + groupname + "]");		
		gap.showConfirm({
			title: "Confrim",
			contents: msg,
			callback: function(){
			//확인을 클릭한 경우
			_wsocket.delete_group(groupname);
			}
		});
	},
	
	"temp_list_status_dis" : function(obj){
		if (typeof(obj.ct) != "undefined"){		
			if (obj.ek == "remove"){
				return false;
			}			
			var lists = obj.ct.usr;
			var ty = obj.ek;			
			var isOff = false;
			var offcount = 0;			
			if (ty == "topsearch"){				
				for (var i = 0 ; i < lists.length; i++){
					var info = lists[i];
					gap.temp_change_status_search(info.ky, info.st, info.msg, ty);
				}				
			}else if (ty == "buddylist_search"){
				for (var i = 0 ; i < lists.length; i++){
					var info = lists[i];
					gBody.buddylist_search_status(info.ky, info.st, info.msg, ty, info.exst);
				}	
			}else if (ty == "useraddsearch"){				
				for (var i = 0 ; i < lists.length; i++){
					var info = lists[i];
					gap.temp_change_status_search(info.ky, info.st, info.msg, ty);
				}
			}else if (ty == "channel"){				
				for (var i = 0 ; i < lists.length; i++){
					var info = lists[i];
					var key = info.ky;
					//온라인 오프라인 상태 정보를 변경한다.
					var st = info.st;
					$("[data-status='status_"+key+"']").removeClass();					
					if (st == 1){						
						$("[data-status='status_"+key+"']").addClass("status online");
					}else if (st == 2){
						$("[data-status='status_"+key+"']").addClass("status away");
					}else if (st == 3){
						$("[data-status='status_"+key+"']").addClass("status deny");	
					}else{
						$("[data-status='status_"+key+"']").addClass("status offline");
					}
					//모바일 접속 여부를 변경한다.
					var mst = info.mst;
					if (typeof(mst) != "undefined"){
						if (mst == 0){
							$("[data-phone='phone_"+key+"']").removeClass();
						}else{
							$("[data-phone='phone_"+key+"']").removeClass();
							$("[data-phone='phone_"+key+"']").addClass("phone_icon abs");
						}
					}					
					//휴가 정보관련 상태를 변경한다.					
					var exst = info.exst;
					if (typeof(exst) != "undefined"){
						//1: 휴가, 2: 휴직, 3: 오전반차, 4: 오후반차, 5: 장기휴가, 6: 해외출장, 7: 국내출장, 8: 교육, 9: 재택 , 10 :휴무
						if (exst != ""){			
							$("[data-day='day_"+key+"']").show();
							$("[data-day='day_"+key+"']").removeClass().addClass("biz_check day_"+exst+"");
							$("[data-day='day_"+key+"']").text(gap.lang["v"+exst]);
						//	$("[data-day='day_"+key+"']").text(gap.lang["ws_type_"+exst]);							
						}
					}
				}
			}else if (ty == "org"){				
				gOrg.statusCheckResult(lists);				
			}else if (ty == "org_detail"){				
				gOrg.detailLayerStatus(lists);
			}else if (ty == "popup_chat_member"){
				gma.statusCheckResult(lists);
			}else if (ty == "quick_chat_buddy"){
				gma.statusBuddyList(lists);
			}else{
				for (var i = 0 ; i < lists.length; i++){
					var info = lists[i];
					//상태 이미지를 변경 시킨다.			
			//		gap.temp_change_status(info.ky, info.st, ty);
					var key = info.ky;
					var st = info.st;				
					$("[data-status='status_"+key+"']").removeClass();					
					if (st == 1){						
						$("[data-status='status_"+key+"']").addClass("status online");
					}else if (st == 2){
						$("[data-status='status_"+key+"']").addClass("status away");
					}else if (st == 3){
						$("[data-status='status_"+key+"']").addClass("status deny");	
					}else{
						$("[data-status='status_"+key+"']").addClass("status offline");
					}					
					var obj = new Object();
					obj.id = info.ky;
					obj.st = info.st;
					gap.status_change(obj);					
					if (info.st == 0){
						isOff = true;					
						offcount ++;
					}				
					//모바일 접속 여부를 변경한다.
					var mst = info.mst;
					if (typeof(mst) != "undefined"){
						if (mst == 0){
							$("[data-phone='phone_"+key+"']").removeClass();
						}else{
							$("[data-phone='phone_"+key+"']").removeClass();
							$("[data-phone='phone_"+key+"']").addClass("phone_icon abs");
						}
					}					
					//휴가 정보관련 상태를 변경한다.					
					var exst = info.exst;
					if (typeof(exst) != "undefined"){
						//1: 휴가, 2: 휴직, 3: 오전반차, 4: 오후반차, 5: 장기휴가, 6: 해외출장, 7: 국내출장, 8: 교육, 9: 재택 , 10 :휴무
						if (exst != ""){			
							$("[data-day='day_"+key+"']").show();
							$("[data-day='day_"+key+"']").removeClass().addClass("biz_check day_"+exst+"");
							$("[data-day='day_"+key+"']").text(gap.lang["v"+exst]);
						//	$("[data-day='day_"+key+"']").text(gap.lang["ws_type_"+exst]);							
						}
					}				
				}		
				if (ty == "chatroom"){					
					if (isOff){
						if (gap.search_is_onetoone()){
							//1:1일 경우							
							var chatname = "";
							var uinfo = gap.cur_room_att_info_list_search(obj.id);							
							if (typeof(uinfo) == "undefined"){
								chatname = gBody.cur_room_att_info_list[0].nm;
							}else{
								if (gap.cur_el == uinfo.el){
									chatname = gBody.cur_room_att_info_list[0].nm;
								}else{
									chatname = gBody.cur_room_att_info_list[0].enm;
								}
							}						
							$("#chatroom_all_status").text(chatname +gap.lang.offline_one);							
						}else{
							//1:N일 경우
							if (offcount == (lists.length)){
								$("#chatroom_all_status").text(gap.lang.all_off_chat);
							}else{
								$("#chatroom_all_status").text(gap.lang.offline_status);
							}						
						}
						//$("#chatroom_all_status").show();
						if (gBody.cur_cid.indexOf("10139992") > -1){							
						}else{
							$("#chatroom_all_status").fadeIn(1000);
						}					
					}
					
					gBody.chatroom_dis_height();
				}
			}
		}		
	},
	
	"chatroom_dis_height" : function(opt){
		var minus_h = 45;	// 기본값은 40
		
		// 오프라인 표시 여부
		if ($('#chatroom_all_status').is(':visible')) {
			minus_h += $('#chatroom_all_status').outerHeight(true);
		}
		
		// 공지 표시 여부
		if ($('#notice_top_chat').is(':visible')) {
			minus_h += $('#notice_top_chat').outerHeight(true);
		}
		
		$("#chat_list").css("height", "calc(100% - " + minus_h + "px)");
		
		/*
		//opt가 T일 경우 한명이상 부재중이기 때문에 높이를 줄어야 한다.	
		if (opt == "T"){
			$("#chat_list").css("height", "calc(100% - 68px)");
		}else{
			$("#chat_list").css("height", "calc(100% - 40px)");
		}
		*/
		
	},
		
	"receive_change_status" : function(obj){		
		var key = obj.ky;
		var status = obj.st;
		var mx = obj.msg;	
		var exst = obj.exst;  //휴가 정보
		if (key == gap.search_cur_ky()){
			if (typeof(obj.msg) != "undefined"){
				gap.my_profile_status(obj.st, obj.msg);
			}else{
				gap.my_profile_status(obj.st, "");
			}			
		}	
		//버디리스트 사용자 상태 변경
		var ky = key;
		gap.buddy_change_status(ky, status, mx, "receive", exst);
		gap.buddy_set_status();
		//즐겨찾기 상태 변경경
		gap.temp_change_status(ky , status, "favorite");		
		//현재 대화방에 사용자의 상태 정보를 가지고 있는 메모리를 변경해준다.
		var lis = gap.cur_user_status;
		for (var i = 0 ; i < lis.length; i++){
			var ix = lis[i];
			if (ix.ky == key){
				ix.st = 1;
			}
		}		
		///////// 상태 등록한다. /////////////////////////////
		var obj = new Object();
		obj.id = obj.ky;
		obj.st = obj.st;
		gap.status_change(obj);
		/////////////////////////////////////////////////		
		//현재 대화창이 열려 있는 상태이면 상태 체크 보내준다.
		if (gap.curpage == "chat"){
			gap.temp_change_status(ky , status, "chatroom");			
			if (gap.search_is_onetoone()){
				//1:1일 경우 상대방이 들어왔으면  부재중 바를 제거한다.
				if (key == gBody.cur_room_att_info_list[0].ky){
					$("#chatroom_all_status").fadeOut(1000, function(){gBody.chatroom_dis_height();});
				}
			}else{
				var isOff = false;
				for (var i = 0 ; i < lis.length; i++){
					var xx = lis[i];
					if (xx.st == 0){
						isOff = true;
					}
				}				
				if (!isOff){
					$("#chatroom_all_status").fadeOut(1000, function(){gBody.chatroom_dis_height();});
				}
			}			
		}		
	},
	
	"process_display" : function(droppable){
		//파일 전송 처리하기 그래프		
		var he = 3;
		if ($(droppable).parent().hasClass("result-profile")){
			//사용자 검색 후 드래그 하는 경우
			he = 28;
		}
		var pro = '<div id="prog" class="progress_temp" style="width:100%;margin-top:'+he+'px"><div id="px" ></div></div>';
		droppable.append(pro);		
		var obj = "px";
		var count = 10;  
		var interval = setInterval(function(){
			count = count -1;
			if (count == 0){
				clearInterval(interval);
				$(".progress_temp").fadeOut(300);
				$(".progress_temp").remove();			
				return;
			}
			var percentage = 100 - (((count -1) / 10) * 100);
			$("#" + obj).css("background", "#337ab7");
			$("#" + obj).height("2px");
			$("#" + obj).width(percentage + "%");
		}, 100);
		$("#prog").fadeIn();
	},	
	
	"process_display2" : function(droppable, bbx, opt){
		//파일 전송 처리하기 그래프		
		var pro = '<div id="prog" class="progress_temp" style="width:100%;padding-top:19px"><div id="px" ></div></div>';
		droppable.append(pro);		
		var obj = "px";
		var count = 10;  
		var interval = setInterval(function(){
			count = count -1;
			if (count == 0){
				clearInterval(interval);
				$(".progress_temp").fadeOut(300);
				$(".progress_temp").remove();				
				 _wsocket.send_chat_msg(bbx);				 
				 if (opt == "scroll"){
					 if (gma.chat_position == "channel"){
						 gap.scroll_move_to_bottom(gBody.chat_show_channel_sub);
					 }else if (gma.chat_position == "popup_chat"){
						 gap.scroll_move_to_bottom(gBody.chat_show_popup_sub);
					 }else{
						 gap.scroll_move_to_bottom(gBody.chat_show);
					 }		
				 }				
				return;
			}
			var percentage = 100 - (((count -1) / 10) * 100);
			$("#" + obj).css("background", "#337ab7");
			$("#" + obj).height("2px");
			$("#" + obj).width(percentage + "%");
		}, 100);
		$("#prog").fadeIn();
	},
	
	"context_menu_reload" : function(){
	},
		
	"chatroom_list_right_click" : function(){
		//좌측 메뉴 채팅방 마우스 우클릭 ContentMenu 작성하기
		$.contextMenu({
			selector : ".chatroom_list_li",
			autoHide : true,
			callback : function(key, options){	
				var tid = $(this).attr("id");
			//	var cid = tid.replace(/_/gi,"^").replace("-spl-",".");
				var cid = gap.decodeid(tid);			
				if (key == "out"){
					gBody.chatroom_out(cid);
				}else if (key == "allout"){
					gBody.chatroom_out("all");
				}else if (key == "mail"){
					gBody.group_mail_start_cid(cid);					
				}else if (key == "file"){
					gBody.ty = "chatroom";
					gBody.person_file_upload_chatroom(tid);					
				}else if (key == "memo"){
					gBody.group_memo_start_cid(cid);
				}else if (key == "video"){
					gBody.group_video_invite_cid(cid);
				}else if (key == "changename"){
					gBody.changename_show(cid);
				}else if (key == "fix"){
					gBody.change_fix_item(cid);
				}else if (key == "fix2"){
					gBody.change_fix_item2(cid);
				}
			},			
			build : function($trigger, options){
			
				gBody.click_room_id = $trigger.attr("id");
				return{
					items : gBody.chatroom_menu_content()
				}
			}
			//items: gBody.chatroom_menu_content()
		});
	},	
	
	"buddy_list_right_click" : function(){	
		//그룹을 마우스 우클릭 ContentMenu 작성하기				
		$.contextMenu( 'destroy', ".person_dis" );		
		$.contextMenu({
			selector : ".group h3 dx",
			autoHide : true,
			callback : function(key, options){			
				gBody.context_menu_call_group(key, options, $(this).attr("id"));
			},
			items: gBody.group_menu_content()
		});		
		//버디리스트 개인을 마우스 우클릭 ContentMenu 작성하기
		$.contextMenu({
			selector : ".person_dis",
			autoHide : true,
			callback : function(key, options){
				gBody.context_menu_call_person(key, options, $(this).attr("id"));	
			},
			events : {
				hide: function (options) {				
            	}				
			},	
		//	items: gBody.person_menu_content("person")
			build : function($trigger, e){
				var id = $trigger.attr("data");
				//options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
				return {
					items : gBody.person_menu_content("person", id)
				}
			}
		});	
	},
		
	"buddy_scroll_bar" : function(){
		//$("#left_buddylist").mCustomScrollbar({
		
		$("#buddylist_main").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable:false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			autoHideScrollbar : true
		});
	},	
	
	"msg_send_to_server" : function(msgid, msg, roomkey){
		var obj = new Object();		
		obj.type = "msg";
		obj.mid = msgid;
		obj.msg = msg;
		obj.cid = roomkey;
		obj.ty = 1;
		_wsocket.send_chat_msg(obj);
	},
	
	//Quick 채팅창에 표시되는 데이터 컨트롤.............
	"chat_alarm_draw" : function(infos){	

		var sbj = infos;		
		var sortingField = "wd";
		var list = sbj.sort(function(a, b){
			return b[sortingField] - a[sortingField];
		})		
		for (var i = 0 ; i < list.length ; i++){
			var info = list[i];
			var dis_time = gap.change_date_default_for_popupchat(info.wd);
			var html = "";
			html += '<div class="q_chatroom_list" data-key="'+info.xid+'">';
			html += '   <div class="q_team_mem">';
			html += '		<div class="photo-wrap">';
			html += '			<div class="user">';
			html += '				<div class="user-thumb">'+info.person_img+'</div>';
			html += '			</div>';
			html += '		</div>';
			html +=	'		<div class="q_name_wr">';
			html += '			<p class="mem-name">';
			html += '				<span class="name">'+info.disname+'</span>';
			html += '              	<span class="date">';
			if (info.bun != 0){
				html += '				<span class="chat-mem-num">'+info.bun + gap.lang.myung+'</span>';
			}
			html += '					<span id="chat_time_popup_'+info.xid+'">' + dis_time + '</span>';
			html += '				</span>';
			html += '			</p>';
			html += '			<div class="q_user-info">';		
			
			if (info.wty == 5 || info.wty == 6){
				var ico = gap.file_icon_check(info.wmsg);
				html += "<span class='ico ico-attach "+ico+"' id='chat_msg_icon_popup_"+info.xid+"'></span>";
				html += '				<p class="chat-msg" style="line-height:15px" id="chat_msg_popup_'+info.xid+'">&nbsp;'+info.wmsg+'</p>';
			}else if (info.wty == 4){
				html += '				<p class="chat-msg" id="chat_msg_popup_'+info.xid+'">'+info.wmsg+'</p>';
			}else{				
				if (info.xid.indexOf("10139992") > -1){
					//칭찬 코끼리일 경우 별도 처리한다.
					html += '				<p class="chat-msg" id="chat_msg_popup_'+info.xid+'">'+gBody.receive_elephant+'</p>';
				}else{
					if (info.wty != 3){
						html += '				<p class="chat-msg" id="chat_msg_popup_'+info.xid+'">'+gap.textToHtml(info.wmsg)+'</p>';
					}else{
						html += '				<p class="chat-msg" id="chat_msg_popup_'+info.xid+'">'+info.wmsg+'</p>';
					}
					
				}		
			}			
			html += '			</div>';
			html += '		</div>';
			html += '	</div>';
			if (info.ucnt != 0){
				html += '	<div class="alarm-num">'+ info.ucnt+'</div>';
			}		
			html += '</div>';				
			$('#alarm_list_sub').append(html);
		}		
		gBody.chat_alarm_draw_event();		
	},
	
	"chat_alarm_draw_event" : function(){
		$('#alarm_list_sub .q_chatroom_list').off().on("click", function(e){
			//해당 방의 데이터를 불러와야 한다.
			var room_key = gap.decodeid($(e.currentTarget).data("key"));			
			//선택한 채팅방의 건수를 제거한다.
			$(e.currentTarget).find(".alarm-num").remove();			
			_wsocket.load_chatlog_list_popup(room_key);				
		});
	},
	
	"makeroom_after_search_popup" : function(obj){
		var cur_room_att = [];
		var newChatroom_list = [];
		var res = obj.ct.rt;
		for (var i = 0 ; i < res.length; i++){
			var user = res[i];
			cur_room_att.push(user);
			if (name == ""){
				name = user.nm;
			}else{
				name += "-spl-" + user.nm;
			}		
			var nobj = {"ky" : user.ky, "nm" : user.nm};
			newChatroom_list.push(nobj);	
		}		
		gBody.cur_room_att_info_list_popup = cur_room_att;
		_wsocket.make_chatroom_1N_popup(newChatroom_list);
		//_wsocket.load_chatlog_list_popup(room_key);
	},
	
	"makeroom_after_search_popup_after" : function(cid){
		_wsocket.load_chatlog_list_popup(cid);
	},	
	
	"write_chat_log_popup" : function(obj){			
		//_wsocket.load_chatlog_list_popup(room_key); 호출한 이후 여기로 온다.	
		gma.cur_cid_popup = obj.ct.cid;
		gma.changePage("chat");		
		$("#alarm_chat_msg").val("");		
		$("#"+gBody.chat_show_popup_sub).empty();
		gma.chat_position = "popup_chat";
		gBody.lastchatter = "";		
		
		var info = obj.ct.log;		
		//들어가는 채팅방의 읽지 않은 건수를 0으로 세팅한다.
		gap.search_cur_chatroom_change_ucnt(obj.ct.cid, 0);
		//하단에 채팅방 리스트에 들어 있는 건수도 0으로 세팅한다.
		gBody.set_count_chatroom(obj.ct.cid, 0);		
		//계산된 읽지 않은 건수를 좌측 메뉴와 알림 메시지 뱃지에 적용한다.
		gBody.unread_chat_count_check_realtime_popup();		
		//들어가는 채팅방을 읽었다는 이벤트를 전송한다.
		var xobj = gap.search_chat_info_cur_chatroom(obj.ct.cid);
		if (xobj) {
			gBody.cur_room_att_info_list_popup = xobj.att;			
		}
		setTimeout(function(){
			_wsocket.chat_room_read_event(obj.ct.cid, xobj.wsq);
		}, 500);		
		////////////////////////////////////////////////////////////////////////		
		gBody.cur_room_att_info_list = gap.search_cur_chatroom_attx(obj.ct.cid);		
		gBody.write_chat_log(info, "T", obj.ek);		
		$("#" + gBody.chat_show_popup_sub).css("height", "100%");		
		//채팅방 타이틀 지정하기
		var cid = gma.cur_cid_popup;
		//채팅방 명을 설정해 주어야 한다.
		var roominfo = gap.search_chat_info_cur_chatroom(cid);
		var gubun = cid.substring(0,1);		
		var title = "";
		if (roominfo != ""){
			var room_title = "";
			if (typeof(roominfo.tle) != "undefined" && roominfo.tle != ""){
				room_title = roominfo.tle;
			}else if (gubun == "s" ){				
				//1:1방의 경우
				for (var i = 0 ; i < roominfo.att.length; i++){
					if (gap.userinfo.rinfo.ky != roominfo.att[i].ky){
						room_title = roominfo.att[i].nm;
					}
				}				
			}else if (gubun == "n"){
				//방명이 지정되지 않는 1:N 채팅방의 경우
				room_title = gap.lang.gchat;
			}			
			if (room_title == ""){
				room_title = gap.lang.no_chatroom;
				title = room_title;				
			}else{
				title = room_title;
				
				// 3명 이상일 때만 숫자를 표시
				var user_cnt = gBody.cur_room_att_info_list_popup.length;
				if (user_cnt > 2) {
					title += " (" + gBody.cur_room_att_info_list_popup.length + ")";
				}
			}			
		}else{
			var cpx = cid.substring(0,1);
			
			if (cpx == "n"){
				title = gap.lang.gchat;
				var user_cnt = gBody.cur_room_att_info_list_popup.length;
				if (user_cnt > 2) {
					title += " (" + gBody.cur_room_att_info_list_popup.length + ")";
				}
			}else{
				title = gBody.select_name;
			}			
		}		
		gma.setTitle(title);		
		/////////////////////////////////////////////////////////////				
		//팝업창에 채팅 영역에 드래그 & 드롭으로 파일 전송할 수 있게 설정한다.
		gBody.chat_file_drop_popup();		
		//채팅창에 이미지 파일 붙여넣기 했을때 전송하는 함수
		gBody.image_paste_action();		
		try{
			$("#" + gBody.chat_show_popup).mCustomScrollbar('destroy');			
		}catch(e){}		
		$("#" + gBody.chat_show_popup).mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable: false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
	//			updateOnContentResize: true
			},
			autoHideScrollbar : true,
			setTop : ($("#"+gBody.chat_show_popup).height()) + "px",
			callbacks : {
				onTotalScrollBack: function(){
					gBody.scrollP = $("#"+gBody.chat_show_popup).find(".mCSB_container").height();
					gBody.chat_addContent(this, gma.cur_cid_popup, 'popup');			
				},
				onTotalScrollBackOffset: 10,
				alwaysTriggerOffsets:true
			}
		}).mCustomScrollbar("scrollTo", "bottom", {scrollInertia : 0})
		
		$("#alarm_chat_send").off().on("click", function(e){
			gBody.send_msg(e)
		});		
		$("#alarm_chat_file").off().on("click", function(e){
			gma.chat_position = "popup_chat";
			$("#open_attach_window_popup").click();		
		});		
		$(".quick_alarm").off();
		$(".quick_alarm").on('keydown.confirmback', function(e){
			// backspace
			if (e.keyCode == 8) {				
				var tar = $(e.target).is("input");
				var tar2 = $(e.target).is("textarea");	
				var foc = $(':focus');
				if (tar || tar2){					
				}else{
					$('#btn_alarm_golist').click();
				}	
			}
		});
		//답장내용이 긴 경우 자동 접기한다.
		gBody.reply_expand_check();
		gBody.img_open2();
		
	},
	
	"write_chat_log_popup_continue" : function(logs){		
		var obj = logs.ct.log;
		gma.chat_position = "popup_chat";		
		var count = obj.length;
		if (count > 0){
			gBody.write_chat_log(obj, "F", logs.ek);			
			setTimeout(function(){
				gBody.fix_position();
				//답장내용이 긴 경우 자동 접기한다.
				gBody.reply_expand_check();
			}, 500);
		}	
	},	
	///////////////////////////////////////////////////////////////////////////////////////////////////
	
	"chatroom_draw" : function(type){	
	
		var obj = gap.chat_room_info;
		
		if (gap.cur_window != "chat"){
			gBody.searchMode_draw = "F";
		}
		
		if (gBody.searchMode_draw == "T"){
			obj = gap.chat_room_info_search;
		}
		
		// 퀵채팅에서 검색한 경우
		if (type == "main_alarm"){
			if (gBody.searchMode_draw_popup == "T"){
				obj = gap.chat_room_info_search_popup;
			}else{
				
				/*
				if (gap.chat_room_info_search && gap.chat_room_info_search.ct.length > 0){
					obj = gap.chat_room_info_ori;
				}else{
					obj = gap.chat_room_info;
				}
				*/
				
				obj = gap.chat_room_info;
				
			}			
		}
		
		var sbj = obj.ct;
		var fix_count = 0;	
		var unread_count = 0;		
		//팝업 채팅에서 사용할 대화방 리스트 묶음 함수
		var alarm_infos = [];
		for (var i = 0 ; i < sbj.length; i++){			
			//팝업 채팅에 표시할 각 방의 정보 변수
			var alarm_data = new Object();
			var info = sbj[i];			
			var rlist = gap.delete_user_set(info.att);
			info.att = rlist;
			var wd = info.wdt;
			var wdfull = wd;
			alarm_data.wd = wd;					
			wd = gap.change_date_localTime_only_date(wd.toString());			
			var rdate = gap.change_date_default(wd);
			var ddx = String(wd).substring(0,8);	
			if (type != "main_alarm"){
				if (i == 0){
					//chatgpt 링크 추가
					if (chagegpt_user == "T"){
						var bothtml = "";
						bothtml += "	<li class='chatroom_list_li' id='chatgpt'>";
						bothtml += "		<div class='user'>";
						bothtml += "			<div class='user-thumb'>"+gap.chat_photo()+"</div>";
						bothtml += "				<dl><dt>"+gap.lang.gptname+"</dt><dd>질문해 보세요</dd></dl>"
						bothtml += "		</div>";
						bothtml += "   </li>";
						$("#left_roomlist_sub").append(bothtml);
					}
				}				
				if ($("#chatroom_fix").length == 0){
					var html_top = "";
					html_top += "<div class='group' id='chatroom_fix' style='display:none'>";
					html_top += "<h3><span>"+gap.lang.favorite+"</span></h3>";
					html_top += "	<ul id='chatroom_ul_fix' style='list-style:none'>";
					html_top += "	</ul>";
					html_top += "</div>";
					$("#left_roomlist_sub").append(html_top);	
				}					
				if (info.pt == 0){
					if ($("#chatroom_"+ddx).length == 0){
						var html_top = "";
						html_top += "<div class='group' id='chatroom_"+ddx+"'>";
						html_top += "<h3><span>"+rdate+"</span></h3>";
						html_top += "	<ul id='chatroom_ul_"+ddx+"' style='list-style:none'>";
						html_top += "	</ul>";
						html_top += "</div>";
						$("#left_roomlist_sub").append(html_top);
					}		
				}else{
					fix_count ++;
				}
			}
			var temail = "";
			var tuid = "";
			var nam = "";
			var last_sq = "";		
			if (info.cty == 10){				
				last_sq = info.rsq;
				tuid = info.att[0];			
				if (gap.cur_el == tuid.el){
					nam = tuid.nm;
				}else{
					nam = tuid.enm;
				}
			}else{
				for (var j = 0 ; j < info.att.length; j++){
					var spl = info.att[j];				
					if (gap.search_cur_ky() == spl.ky){
						last_sq = spl.rsq;
					}else{
						tuid = spl;
						//내가 한국어면 무조건 한국어 ==> 같은 언어 타입이면 자국어 다른 언어 타입이면 영어로 표시
						if (gap.cur_el == "ko"){
							nam = spl.nm;
						}else{
							if (gap.cur_el == spl.el){
								nam = spl.onm;
							}else{
								nam = spl.enm;
							}
						}						
						break;
					}
				}
			}						
			var person_img = gap.person_profile_photo(tuid);	
			if (info.att.length > 2){
				person_img = gap.team_photo();
			}			
			var html = "";
			var time = gap.change_date_localTime_only_time(wdfull.toString());					
			var bun = 0;
			var disname = "";
			var gubun = info.cid.substring(0,1);
			if (info.tle != ""){
				disname = info.tle;
			}else if (gubun == "n"){
				var rex = [];
				for (var ii = 0 ; ii < info.att.length; ii++){
					var xin = info.att[ii];
					if (xin.ky != gap.userinfo.rinfo.ky){
						if (typeof(xin.dpc) != "undefined"){
							rex.push(xin.nm);
						}						
					}
				}
				if (rex.length == 0){
					disname = gap.lang.no_chatroom;
					person_img = gap.team_photo();
				}else{
					disname = rex.join(",");
				}				
			}else if (gubun == "s"){
				if (nam == ""){
					disname = gap.lang.no_chatroom;
				}else{
					disname = nam + gap.lang.hoching;
				}				
			}			
			bun = info.att.length;
			var xid = gap.encodeid(info.cid);			
			alarm_data.xid = xid;			
			html += "	<li class='chatroom_list_li' id='"+xid+"' data='"+tuid+"'>";
			html += "		<div class='user' data='"+info.wdt+"'>";
			html += "			<div class='user-thumb'>"+person_img+"</div>";			
			var ch = info.cid.toString().substring(0,1);
			if (last_sq == ""){
				html += "			<span class='' id='chat_new_"+xid+"'></span>";    //신규로 들어오면 class='ico-new' 추가해야 한다.
			}else{
				html += "			<span class='' id='chat_new_"+xid+"'></span>";    //신규로 들어오면 class='ico-new' 추가해야 한다.
			}			
			html += "				<dl>";			
			if (info.tle != ""){
				html += "					<dt class='chg-name' style='font-weight:bold'>"+disname+"</dt>";
			}else{
				html += "					<dt>"+disname+"</dt>";
			}			
			if (info.wty == 5 || info.wty == 6){		
				var xhtml = info.wmsg;
				//if ((info.wty == 6) && (typeof(info.ex.files) != "undefined")){
				if ((info.wty == 6) && info.ex && info.ex.files){
					info.ex = info.ex.files[0];
				}
				if (typeof(info.ex) != "undefined"){	
					if (typeof(info.ex.nm) != "undefined"){						
						var fname = info.ex.nm;
						fname = fname.replace("'","`");
						var url = gap.search_fileserver(info.ex.nid);	
						var downloadurl = url+ "/filedown" + info.ex.sf + "/" + info.ex.sn + "/" + encodeURIComponent(fname);						
						if (typeof(info.ex.caller) != "undefined"){
							if (info.ex.caller == "1" || info.ex.caller == "3"){
								var spl = downloadurl.split("/");
								var id = spl[6];
								var path = spl[5];
								var filename = spl[7];
								var fserver = "https://" + spl[2] + "/WMeet"
								downloadurl = gap.search_file_convert_server(fserver) + "/FDownload.do?id=" + path + "&ty=chat&md5=" + id + "&fn=" + filename + "&ky="+gap.search_cur_ky();
							}
						}						
						var xhtml = gBody.chatroom_last_msg_file_dis(fname, downloadurl);		
						alarm_data.wmsg = fname;						
						html += "					<dd id='chat_msg_"+xid+"'>"+xhtml+"</dd>";
					}else{
						html += "					<dd id='chat_msg_"+xid+"'>"+info.wmsg+"</dd>";
						alarm_data.wmsg = info.wmsg;
					}					
				}else{
					html += "					<dd id='chat_msg_"+xid+"'>"+info.wmsg+"</dd>";
					alarm_data.wmsg = info.wmsg;
				}
			}else if (info.wty == 4){				
//				if ( (typeof(info.ex) != "undefined" ) && (info.ex != "")){
//					if (typeof(info.ex.lnk) != "undefined"){
//						if ($.isArray(info.ex.lnk)){
//							alarm_data.wmsg = info.ex.lnk[0];
//							html += "			<dd id='chat_msg_"+xid+"'>"+info.ex.lnk[0].autoLink({target:"_blank"})+"</dd>";
//						}else{
//							alarm_data.wmsg = info.ex.lnk;
//							html += "			<dd id='chat_msg_"+xid+"'>"+info.ex.lnk.autoLink({target:"_blank"})+"</dd>";
//						}						
//					}else{
//						alarm_data.wmsg = info.wmsg;
//						html += "			<dd id='chat_msg_"+xid+"'>"+info.wmsg.autoLink({target:"_blank"})+"</dd>";
//					}				
//				}else{
//					alarm_data.wmsg = info.wmsg;
//					html += "			<dd id='chat_msg_"+xid+"'>"+info.wmsg.autoLink({target:"_blank"})+"</dd>";
//				}				
			
				html += "			<dd id='chat_msg_"+xid+"'>"+gap.HtmlToText(info.wmsg)+"</dd>";
				alarm_data.wmsg = gap.HtmlToText(info.wmsg);
			}else if (info.wty == 3){	
				
				var emoticon_img = "<img style=' height:35px' src='/resource/images/emoticons/"+info.wmsg+"' alt=''>";				
				html += "					<dd id='chat_msg_"+xid+"'>"+emoticon_img+"</dd>";		
				
				if (typeof(info.wmsg.msg) == "undefined"){
					alarm_data.wmsg =  "<img style=' height:35px' src='/resource/images/emoticons/"+info.wmsg+"' alt=''>";
				}else{
					alarm_data.wmsg =  "<img style=' height:35px' src='/resource/images/emoticons/"+info.wmsg.msg+"' alt=''>";
				}
				
				//alarm_data.wmsg = info.wmsg;
			}else if (info.wty == 2){	
				//시스템 메시지 입장과 퇴장
				var spl = info.wmsg.split(" ");
				var opt = spl[0];					
				var lastr = info.wmsg.substring(2, info.wmsg.length); //영문명에 공백이 들어갈 수 있기 때문에 " "으로 split하면 잘못 계산되어 index로 짤라야 한다.
				var name = "";			
				var cel = lastr.split(":")[3];
				if (gap.cur_el == cel){
					name = lastr.split(":")[1];
				}else{
					name = lastr.split(":")[2];
					if (typeof(name) == "undefined"){
						name = lastr.split(":")[1];
					}
				}				
				var dis = "";
				if (opt == "e"){
					dis = name + gap.lang.enter_chat;
				}else{
					dis = name + gap.lang.exit_chat;
				}				
				html += "			<dd id='chat_msg_"+xid+"'>"+dis+"</dd>";				
				alarm_data.wmsg = dis;
			}else if (info.wty == 3){	
				//이모티콘이 마지막 메시지일 경우 표시하지 않는다.
			}else if (info.wty == 21){				
				var lx = info.wmsg.split("-spl-");
				var tpx = lx[0];				
				if (tpx == "mail_link"){
					var mxg =  lx[1];
					html += "					<dd id='chat_msg_"+xid+"'>"+mxg+"</dd>";
				}else{
					var mxg = info.wmsg.split("-spl-")[0];
					html += "					<dd id='chat_msg_"+xid+"'>"+mxg+"</dd>";
				}				
				alarm_data.wmsg = mxg;
			}else{				
				if (info.wty == 100){
					//회수된 메세지인 경우
					html += "					<dd id='chat_msg_"+xid+"'>"+gap.lang.re_msg+"</dd>";
					alarm_data.wmsg = gap.lang.re_msg;
				}else if (info.wky == "10139992"){
					//칭찬코끼리에서 수신된 경우
					html += "					<dd id='chat_msg_"+xid+"'>"+gBody.receive_elephant+"</dd>";				
				}else{
					var xxx = gap.HtmlToText(info.wmsg);
					alarm_data.wmsg = xxx;
					html += "					<dd id='chat_msg_"+xid+"'>"+xxx+"</dd>";
				}
			}			
			html += "				</dl>";
			alarm_data.bun = 0;
			if (gubun == "n"){
				alarm_data.bun = bun;
				html += "			<span class='time_count'>"+bun+gap.lang.myung+"</span>";
			}			
			html += "			<span class='time' id='chat_time_"+xid+"' data='"+xid+"'>"+time+"</span>";			
			alarm_data.ucnt = 0;
			if (info.ucnt > 0){
				unread_count = unread_count + info.ucnt;
				html += "			<span class='cnt' id='unread_count_"+xid+"'>"+info.ucnt+"</span>";
				alarm_data.ucnt = info.ucnt;
			}			
			html += "		</div>";
			html += "	</li>";			
			if (type != "main_alarm"){
				if (info.pt == 0){
					$("#chatroom_ul_"+ddx).append(html);	
				}else{
					$("#chatroom_ul_fix").append(html);	
				}
			}			
			//팝업 채팅창의 데이터를 수집한다.
			alarm_data.nam = nam;
			alarm_data.person_img = person_img;
			alarm_data.time = time;
			alarm_data.disname = disname;
			alarm_data.wty = info.wty;						
			alarm_infos.push(alarm_data);
		}			
		
		//if (gBody.searchMode_draw != "T"){
		if (type == "main_alarm"){
			//팝업 채팅방 리스트 표시하기 ////////////////////////////////////////////			
			$("#alarm_list_sub .q_chatroom_list").remove();
			$("#alarm_list_sub .alarmlist_bg").remove();
			try{
				$("#alarm_list_sub").mCustomScrollbar('destroy');
			}catch(e){}
			
			if (alarm_infos.length == 0){
				gma.setEmpty();
			}else{
				gBody.chat_alarm_draw(alarm_infos);
				$("#alarm_list_sub").mCustomScrollbar({
					theme:"dark-2",
					autoExpandScrollbar: false,
					scrollButtons:{
						enable:false
					},
					mouseWheelPixels : 200, // 마우스휠 속도
					scrollInertia : 400, // 부드러운 스크롤 효과 적용
					autoHideScrollbar : false
				});
			}
			/////////////////////////////////////////////////////////////
		}		
		if (unread_count > 0){
			gBody.chatroom_new_msg_icon("new");
		}	
		if (fix_count > 0){
			$("#chatroom_fix").show();
		}	
		$("#left_roomlist").mCustomScrollbar({
			theme:"dark-2",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable:false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
		//	mouseWheel:{ preventDefault: false },
		//	advanced:{
		//		updateOnContentResize: true
		//	},
			autoHideScrollbar : true
			//setTop : $(this).height() + "px"
		});	
		gBody.chatroom_list_right_click();
		gBody._event_chatroom_list();
	},	
	
	"_event_chatroom_list" : function(){			
		$("#left_roomlist ul li").off();
		$("#left_roomlist ul li").droppable({
			drop : function(event, ui){
				try{
			 		var droppable = $(this);
			 		var draggable = ui.draggable;
			 		var dragid = ui.draggable.attr("id");		
			 		
			 		if (draggable.hasClass("chat-attach") || 
			 				draggable.hasClass("balloon") || 			 				
			 				draggable.hasClass("chat_img") ||
			 				draggable.hasClass("chat_img2") ||
			 				draggable.hasClass("chat_file") ||		
			 				draggable.hasClass("grid-container") ||	
			 				draggable.hasClass("img-content")){
			 			//파일을 드래그해서 이동하면 업로드하는 프로그레스바 효과를 추가해 준다.			 			
			 			//var room_key = droppable.attr("id").replace(/_/gi,"^").replace("-spl-",".");			
			 			var room_key = gap.decodeid(droppable.attr("id"));
			 			gBody.file_drag_room_id = room_key;		 			
			 			var roomlists = gap.chat_room_info.ct;
			 			var select_room_info = "";			 			
			 			for (var k = 0 ; k < roomlists.length; k++){
			 				var lxl = roomlists[k];
			 				if (lxl.cid == room_key){
			 					select_room_info = lxl.att;
			 					break;
			 				}
			 			}		 			
			 			var slist = "";
			 			slist += "<div style='text-align:left;padding-bottom:10px'>";
			 			for (var y = 0 ; y < select_room_info.length; y++){
			 				var sr = select_room_info[y];
			 				if (gap.search_cur_ky() != sr.ky){
			 					if (gap.cur_el == sr.el){
				 					slist += "<div>" + sr.nm + " / " + sr.dp + "</div>";
				 				}else{
				 					slist += "<div>" + sr.enm + " / " + sr.edp + "</div>";
				 				}	
			 				}			 						 				
			 			}
			 			
			 			slist += "<div>";			 			
			 			var msg = gap.lang.dragandadd;
			 			msg += "<div style='text-align:left;  padding-top:10px;'>["+gap.lang.cose+"]</div>" + slist;			 			
			 			gap.showConfirm({
			 				title: "Confrim",
			 				contents: msg,
			 				callback: function(){
			 				var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.						
							if (draggable.hasClass("balloon")){
					 			//대화내역중에 메시지를 버디리스트에 드래그 & 드롭하는 경우 처리
					 			//드래그된 사용자와의 대화방이 기존에 있는지 없는지에 따라 처리한다.								
								var tx = $(draggable).html();
								var txHTML = $(tx).not(".balloon-btn").remove().get(1).innerHTML;					 						 					 				
					 		//	var sendmsg = $(draggable).text();		
					 		//	var sendmsg = $(draggable).html().replace(/\<p style=\"height\:5px\"><\/p>/gi,"\n");
					 			var sendmsg = txHTML.replace(/\<p style=\"height\:5px\"><\/p>/gi,"\n");
					 			sendmsg = $(sendmsg).text();
					 			gBody.last_msg.msg = sendmsg;
					 			gBody.last_msg.ty = "msg";					 			
 								var parentClass = $(draggable).parent().attr("class");
 								if (parentClass == "talk link"){		 								
 									var obj = gBody.search_og_only_search(sendmsg);
 									obj.cid = room_key;
 									 _wsocket.send_chat_msg(obj);			 									
 								}else{
 									var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.		 					 					 				
 					 				gBody.msg_send_to_server(msgid, sendmsg, room_key);	
 								}
 							}else{ 								
 								var obj = new Object();			 								
 								var filename = $(draggable).attr("data");
 								var downloadurl = $(draggable).attr("data2");
 								var size = $(draggable).attr("data3");
 								var previewurl = "";
 								var ty = "";
 								//채팅창 안에서 드래그한 파일 또는 이미지일 경우
 								if (draggable.hasClass("chat-attach")){ 									
 									obj.ty = 5;
 								}else{ 									
 									obj.ty = 6;
 								} 								
 								
 								var ismultiImage = false;
 								var multiID = "";
 								if (draggable.hasClass("chat_img2") || draggable.hasClass("chat_img") || draggable.hasClass("grid-container")){ 							
 									obj.ty = 6;
 									filename = $(draggable.html()).find("img").attr("data1");
 									downloadurl = $(draggable.html()).find("img").attr("data2");
 									previewurl = $(draggable.html()).find("img").attr("src");
 									size = $(draggable.html()).find("img").attr("data3");
 									ty = "image";
 									
 									var pkn = $(draggable.html()).find(".submulti");
 									if (pkn.length > 0){
 										//묶음 전송된 이미지를 드래그 & 드롭으로 전송하는 경우임
 										ismultiImage=true;
 										multiID = pkn.attr("id").split("_")[1];
 									}
 									if ($(draggable.html()).length > 1){
 										//채팅 내용에 멀티 이미지를 드래그 & 드롭한 경우이다.
 										ismultiImage=true;
 										multiID = $($(draggable.html())[0]).attr("data5");
 										filename = $($(draggable.html())[0]).attr("data");
 									}
 									
 								}else if (draggable.hasClass("chat_file")){
 									ty = "file";
 									obj.ty = 5;
 									filename = $(draggable).find("span").attr("data1");
 									downloadurl = $(draggable).find("span").attr("data2");
 									size = $(draggable).find("span").attr("data3");
 								} 								
 								obj.msg = filename;
 								obj.cid = room_key;
 								obj.mid = msgid; 	
 								
 								
 								var exobj = new Object();	
									exobj.nid = gap.sid;
 	 								exobj.ty = gap.file_extension_check(filename);
 	 								
 	 								var fnames = [];
 	 								var fsizes = [];
 	 								var fdownloads = [];
 	 								
 								if (ismultiImage){
 									//이미지 묶믕한 이미지 파일들의 정보를 수집한다.
 									for (var k = 0 ; k < gBody.tMultiImages.length; k++){
 										var ipm = gBody.tMultiImages[k];
 										if (ipm.sq == multiID){
 											obj.ex = ipm.ex;
 											for (var u = 0 ; u < obj.ex.files.length; u++){
 												var pkitem = obj.ex.files[u];
 												
 												fnames.push(pkitem.nm);
 												fsizes.push(pkitem.sz);
 												var downloadurl = gap.fileupload_server_url + "/filedown" + pkitem.sf + "/" + pkitem.sn + "/" + encodeURIComponent(pkitem.nm);
 												fdownloads.push(downloadurl);
 											}
 											break;
 										}
 									} 	
 									
 								}else{
 	 								var spl = downloadurl.split("/");			 								 
 	 								exobj.sn = spl[6];
 	 								exobj.sf = "/" + spl[5]; 							
 	 								exobj.sz = parseFloat(size);
 	 								exobj.nm = filename;
 	 								obj.ex = exobj;
 								}							
 								
 								if (gBody.cur_cid == room_key){
 									 //드래그하는 상황에 현재 창이 동일한 창이면 파일을 그려 준다.
 									var key = gap.search_cur_ky();
 							    	var time = gap.search_time_only(); 							    	  
 							    	var xdate = new Date();		
 							  		var date = xdate.YYYYMMDDHHMMSS();
 							  		filename = filename.replace("'","`"); 							  		 
 							  		var ucnt = gBody.cur_room_att_info_list.length -1 ; 							  		
 							  		var croom_key = gBody.cur_cid;
 							  		 if (ty == "file"){
 							  			 gBody.file_draw('me', ty, key, date, time, filename, size, downloadurl, previewurl, msgid, '','D', ucnt, "", "", croom_key);	
 							  		 }else{
 							  			if (ismultiImage){
 							  				gBody.file_draw('me', ty, key, date, time, fnames, fsizes, fdownloads, previewurl, msgid, '','D', ucnt, "", "",room_key);	
 							  			}else{
 							  			 gBody.file_draw('me', ty, key, date, time, filename, size, downloadurl + "/" + encodeURIComponent(filename), previewurl, msgid, '','D', ucnt, "", "", croom_key);	
 							  			}
 							  			
 							  		 } 	
 							  	
 							  		gBody.check_display_layer(); 									
 								}								 
 								gBody.last_msg.ty = obj.ty 
 								gBody.last_msg.ex = obj;
 								gBody.last_msg.downloadurl = downloadurl;
 								// _wsocket.send_chat_msg(obj); 											 								 					 								
 								//파일 전송 처리하기 그래프
 								gBody.process_display2(droppable, obj, "");				 			
 							}
			 				}
			 			});			 				 		
			 		}		 			
				}catch(e){}		
		 		var x = ui.helper.clone();		 		
		 		var top = ui.helper.position().top;
		 		var left = ui.helper.position().left;		 		
		 		top = "20px";
		 		left = "50px";		 		
		 		x.css({ 'top': top, 'left': left }).appendTo($(this)).fadeOut(1000);			    	
			},
			hoverClass: "drop-area",
		//	accept: "div.user",
	    	classes: {
	    //       "ui-droppable-active": "drop-area"
	        }
		});		
		      
        $("#left_roomlist_sub .chatroom_list_li").off();
		$("#left_roomlist_sub .chatroom_list_li").on("click", function(e){			
			//전체 신규 메시지가 있는지 확인하고 없을 경우 대화창에 신규 메시지 표시 까지 제거한다.			
			if ($(e.currentTarget).attr("id") == "chatgpt"){
				//gBody.chat_room_goto("chatgpt");
				//gBody.enter_chatroom_for_chatroomlist("chatgpt", "");
				
				gkgpt.plugin = false;
				gkgpt.select_plugin = "";
				
				var kp = gap.userinfo.rinfo.ky;			
				gBody.chat_start("chatgpt");	
				$("#left_roomlist_sub li").css("border", "1px solid rgb(231, 227, 227)"); //선택된 테두리를 모두 제거한다.
				$(e.currentTarget).css("border", "2px solid rgb(238, 113, 88");   //현재 li의 테두리에 색상을 적용한다.
				gBody.chat_profile_init_chatgpt();
			}else{
				
				if ($(e.target).attr("class") == "ico btn-download"){
				}else if ($(e.target).attr("class") == "mCS_img_loaded"){
					var ky = $(e.target).data("key");
					if (typeof(ky) != "undefined"){
						gap.showUserDetailLayer(ky);
					}	        	
		        	return false;
				}else{
					var cid = $(this).attr("id");
					if (cid.indexOf("s_") > -1){
						//1:1인 경우
						var key = $(e.currentTarget).find("img").data("key");
						gBody.chat_room_goto(cid, key);
					}else{
						gBody.chat_room_goto(cid, "");
					}					
				}
			}						
		});      
	},	
	
	"chatroom_list_enter_display" : function(id){
		id = id.replace("#","").replace(/\^/gi,"_");
		$("#left_roomlist_sub li").css("border", "1px solid #e7e3e3");
		$("#" + id).css("border", "2px solid #ee7158");
	},
	
	"chatroom_list_enter_display_empty" : function(){
		$("#left_roomlist_sub li").css("border", "1px solid #e7e3e3");
	},	
	
	"chat_room_goto" : function(cid, key){
		var xid = gap.decodeid(cid);
		var obj = gap.search_chat_info_cur_chatroom(xid);	
		_wsocket.chat_room_read_event(xid, obj.wsq);	
		gBody.minus_count_chatroom(cid);	
		var len = gBody.unread_count_control();
		if (len == 0){
			gBody.chatroom_new_msg_icon("");
			gap.change_title("1","");
		}	
		gBody.enter_chatroom_for_chatroomlist(cid, key);
	},	
	
	"enter_chatroom_for_chatroomlist_popup_empty" : function (cid){
		
		//popup으로 호출되었는데 기존에 채팅방이 존재하지 않을 경우 처리한다.			
		$("#message_txt").val("");	
		var len = $("#left_roomlist .ico-new").length;
		//console.log("focus in: " + len);
		if (len == 0){
			gap.change_title("1","");
		}	
		//해당 방에 관련된 알림창이 있으면 닫아준다.
		gap.clear_toast_alram(cid);				
		///////////////////////////////////////////////////		
		cid = gap.decodeid(cid);
		var bol = false;	
		if (cid.substring(0,1) == "s"){			
			$("#chat_msg_dis").empty();
			$("#chat_image_dis").empty();
			$("#chat_file_dis").empty();			
			//혹시 우측 버튼이 클릭되어 있으면 클릭 안된 버튼으로 변경한다.
			gBody.rigth_btn_change_empty();			
			gap.backpage = gap.curpage;
			gap.curpage = "chat";
			gap.tmppage = "";					
			gBody.chat_profile_image_draw_cnt = 0;
			gBody.chat_profile_file_draw_cnt = 0;			
			gBody.cur_cid = cid;			
			$("#message_txt").val("");			
			var lists = window.opener.gap.cur_room_att_info_list;
			var tkey = "";
			if  (window.opener.gap.cur_room_att_info_list){
				for (var i = 0 ; i < lists.length; i++){
					var list = lists[i];
				//	if (gap.search_cur_ky() != list.ky){   //본인과 1:1 채팅할 수 있기 때문에 주석처리한다.
						bol = true;
						tkey = list.ky;
				//	}
				}	
			}

			//채팅에서 새창을 띄울경우 반드시 방이 생성된 상태에서 띄우지만 다른 App에서 사용자 선택후 채팅을 호출하면 기존에 방이 없을 수도 있다...
			//해서 기본에 채팅방이 없는 경우 별도로 처리해 주어야 다른 App에서 바로 호출할 수 있다.			
			if (bol){
				_wsocket.search_user_one_for_profile(tkey);
				//	_wsocket.make_chatroom_11(tkey);  <== 채팅에서 호출할 경우 이미 생성되기 때문에 해당 함수를 호출할 필요없다.
				_wsocket.load_chatlog_list(cid);	
				gBody.chat_start(cid);
			}else{
				//해당 창을 호출하는 함수는 gBody.cur_chat_user에 호출당하는 사용자의 메신저에서 사용하는 notesid 설정하고 호출해야 한다.
				var tkey2 = opener.gap.cur_chat_user;
				var name = opener.gap.cur_chat_name;
				_wsocket.search_user_one_for_profile(tkey2);
				_wsocket.make_chatroom_11(tkey2, name);				
				_wsocket.load_chatlog_list(cid);	
				gBody.chat_start(cid);
			}	
		}else{
			//1:N 채팅방의 경우
			//현재 채팅방에 참석해 있는 사용자를 지정해 줘야 한다.
			
			gBody.cur_room_att_info_list = window.opener.gap.cur_room_att_info_list;			
			_wsocket.chat_room_image_list(cid);
			_wsocket.chat_room_file_list(cid);			
			var room_key = cid;
			_wsocket.load_chatlog_list(room_key);					
			gBody.chat_start(room_key);			
			gap.clearSelection();
		}	
	},
	
	"enter_chatroom_for_chatroomlist" : function(cid, tkey, name){

		//채팅방 들어가기		
		gBody.tMultiImages = [];
		gma.click_left_menu = true;	
		//해당 채팅방의 읽지 않은 건수를 재정리한다.
		gap.search_cur_chatroom_change_ucnt(gap.decodeid(cid), 0);		
		gBody.receive_msg_id = "";	
		///////// 검색어가 등록되어 있는 경우 초기화 한다. /////////////////////
		$("#chat_query").val("");
		$("#msg_query_btn_close").hide();
		$("#chat_query_btn").show();
		$("#message_txt").css("height", "38px");
		$("#gpt_plugin_dis").hide();		
		gBody.searchMode = "F";
		/////////////////////////////////////////////////////	
	//	gkgpt.plugin = false;
	//	gkgpt.select_plugin = "";
		
		gBody.chatgpt_disable();		
		gBody.trans_lang = "";
		gBody.trans_title = "";
		$(".trans-box").hide();
		gBody.chatroom_list_enter_display(cid);		
		gma.chat_position = "chat";		
		$("#message_txt").val("");
		gap.remove_status_user();		
		var len = $("#left_roomlist .ico-new").length;
		//console.log("focus in: " + len);
		if (len == 0){
			gap.change_title("1","");
		}	
	//	gap.change_title("1","");			
		//해당 방에 관련된 알림창이 있으면 닫아준다.
		gap.clear_toast_alram(cid);				
		///////////////////////////////////////////////////		
		cid = gap.decodeid(cid);
		var bol = false;
	//	cid = cid.replace(/-spl-/gi,".");		
		gBody.is_my_chat = false;		
		var dis_win_title = "";
		if (cid.substring(0,1) == "s"){
			//1:1 채팅방의 경우		
			if (tkey != ""){
				gBody.remove_user_status.push(tkey);
			}				
		
			var chlist = gap.chat_room_info.ct;			
			for (var i = 0 ; i < chlist.length; i++){
				var inx = chlist[i];
				if (gap.encodeid(inx.cid) == gap.encodeid(cid)){
					var att = inx.att;
					bol = true;					
					var is_member_exist = false;
					for (var j = 0 ; j < att.length; j++){
						var at = att[j];						
						if (inx.cty == 10){
							//나와의 대화일 경우 예외 처리한다.
							gBody.is_my_chat = true;
							_wsocket.search_user_one_for_profile(at.ky);
							dis_win_title = at.nm;
						}else{
							if (at.ky != gap.search_cur_ky()){
								//본인과 1:1로 대화를 할 수 있기 때문에 unique를 찾아서 처리한다. 이러지 않으면 2번 호출한다.
								_wsocket.search_user_one_for_profile(at.ky);		
								dis_win_title = at.nm;
								is_member_exist = true;
							}	
						}						
					}				
					if (!is_member_exist){
						_wsocket.search_user_one_for_profile(at.ky);		
						dis_win_title = at.nm;
					}					
					gBody.cur_room_att_info_list = inx.att;
					break;
				}
			}			
			if (bol == false){				
				//기존 메시지 내역을 지우고 다시 그려야 한다.				
				$("#chat_msg_dis").empty();
				$("#chat_image_dis").empty();
				$("#chat_file_dis").empty();				
				//혹시 우측 버튼이 클릭되어 있으면 클릭 안된 버튼으로 변경한다.
				gBody.rigth_btn_change_empty();				
				gap.backpage = gap.curpage;
				gap.curpage = "chat";
				gap.tmppage = "";						
				gBody.chat_profile_image_draw_cnt = 0;
				gBody.chat_profile_file_draw_cnt = 0;				
				gBody.cur_cid = cid;			
				$("#message_txt").val("");			
			
				_wsocket.make_chatroom_11(tkey, name);	
				
				setTimeout(function(){
					_wsocket.search_user_one_for_profile(tkey);	
				}, 200)
						
			}else{
				_wsocket.load_chatlog_list(cid);					
				gBody.chat_start(cid);
			}
		}else{
			//1:N 채팅방의 경우
			//현재 채팅방에 참석해 있는 사용자를 지정해 줘야 한다.
			gBody.cur_room_att_info_list = gap.search_att_list_in_chat_info(cid);			
			_wsocket.chat_room_image_list(cid);
			_wsocket.chat_room_file_list(cid);			
			var room_key = cid;
			_wsocket.load_chatlog_list(room_key);					
			gBody.chat_start(room_key);			
			gap.clearSelection();
		}		
		var len = gBody.cur_room_att_info_list.length - 2;
		for (var i = 0 ; i < gBody.cur_room_att_info_list.length; i++){
			gBody.remove_user_status.push(gBody.cur_room_att_info_list[i].ky);
			if (cid.substring(0,1) != "s"){
				if (i == 0){
					dis_win_title = gBody.cur_room_att_info_list[i].nm;
				}
			}			
		}		
		if (call_key != ""){			
			//새창에서 채팅방의 사이즈가 1200이하면 우측 프레임 정보르 다시 표시해 줘야 한다.
			var width = $(window).width();
			if (width < 1200){
				gBody.resize();
			}			
			var dis = "";
			if (cid.substring(0,1) == "s"){
				dis = "Member : " + dis_win_title;
			}else{
				dis = "Members : " + dis_win_title + " " + gap.lang.other + " " + len + gap.lang.myung;
			}
			document.title = dis;			
		}	
		var room_expand = gBody.cur_cid + "_room";
		var op = localStorage.getItem(room_expand);		
		//우측 버튼은 모두 선택 안된 걸로 변경한다.
		gBody.rigth_btn_change_empty();			
		var cpage = gap.curpage;			
		if (cpage == ""){return false;}		
		if (op == "off"){
			$(".left-area").css("width", "100%");							
			$("#ext_body").hide();
			$("#user_profile").hide();
			$("#chat_profile").hide();
			$("#right_menu_collpase_btn").addClass("on");			
		}else{
			$(".left-area").css("width", "calc(100% - "+gap.right_page_width+")");
			if (cpage == "main"){
				$("#user_profile").show();
				$("#center_content").css("width", "calc(100% - "+gap.right_page_width+")");
			}else if (cpage == "chat"){		
				$("#chat_profile").show();
			}
			$("#right_menu_collpase_btn").removeClass("on");
		}
		//사용자 클릭시 상세 정보 띄워주기		
		gma.refreshPos();		
		//unread건수 체크한다.
		gBody.unread_chat_count_check_realtime();
		
	
	},	
	
	"chatroom_last_draw" : function(){		
		gBody.chatroom_list_enter_display_empty();	
		if ($("#center_content_main").length == 0){
			//업무방 클릭시 리프레쉬하지 않고 원페이지로 처리하기 위해서 아래 소스를 다시 설정해 줘야 한다.
			$("#center_content").css("width", "calc(100% - 315px)");
		//	$("#user_profile").removeAttr("style");			
			$("#center_content").empty();
			var kkk = "<div id='center_content_main'></div>";
			$("#center_content").append(kkk);
		}	
		$("#person_dis").hide();		
		var html = "";		
		//채팅방 리스트 정보			
		var obj = gap.chat_room_info;	
		var sbj = obj.ct;		
		var dis_date_bun = 0;		
		if (sbj.length == 0){
			var date = new Date();		
			var today = date.YYYYMMDD();
			var rdate = gap.change_date_default(today);			
			var html_top = "";				
			html_top += "<div class='wrap-room' id='chatroom_main_"+today+"'>";
			html_top += "<div class='date'><span>"+rdate+"</span></div>";
			html_top += "	<ul id='chatroom_main_ul_"+today+"'>";
			html_top += "	</ul>";
			html_top += "</div>";			
			$("#center_content_main").append(html_top);			
			var html = "	<li class='new-room' id='make_new_chat_room' style='background-color:white !important'><a href='#'><span id='make_chatroom_now'></span></a></li>";
			$("#chatroom_main_ul_"+today).append(html);
		}else{			
			var sortingField = "wdt";
			var list = sbj.sort(function(a, b){
				return b[sortingField] - a[sortingField];
			});			
			for (var i = 0 ; i < sbj.length; i++){
				var info = sbj[i];		
				var rlist = gap.delete_user_set(info.att);
				info.att = rlist;			
				var wd = info.wdt;				
				var wdfull = wd;				
				wd = gap.change_date_localTime_only_date(wd.toString());				
				var rdate = gap.change_date_default(wd);
				var ddx = String(wd).substring(0,8);				
				if ($("#chatroom_main_"+ddx).length == 0){					
					dis_date_bun ++;
					if (dis_date_bun > 2){
						//최근 2일찌만 데이터를 표시한다.						
						break;
					}
					var html_top = "";				
					html_top += "<div class='wrap-room' id='chatroom_main_"+ddx+"'>";
					html_top += "<div class='date'><span>"+rdate+"</span></div>";
					html_top += "	<ul id='chatroom_main_ul_"+ddx+"'>";
					html_top += "	</ul>";
					html_top += "</div>";					
					$("#center_content_main").append(html_top);			
				}				
				var nam = "";				
				if (info.cty == 10){
					//나와의 대화일 경우 예외 처리한다.
					var spl = info.att[0];
					if (gap.cur_el == "ko"){
						nam = spl.nm;
					}else{
						if (gap.cur_el == spl.el){
							nam = spl.onm;
						}else{
							nam = spl.enm;
							if (nam == ""){
								nam = spl.nm;
							}
						}
					}				
				}else{				
					for (var j = 0 ; j < info.att.length; j++){
						var spl = info.att[j];						
						if (gap.search_cur_ky() == spl.ky){
						}else{							
							if (gap.cur_el == "ko"){
								nam = spl.nm;
							}else{
								if (gap.cur_el == spl.el){
									nam = spl.onm;
								}else{
									nam = spl.enm;
									if (nam == ""){
										nam = spl.nm;
									}
								}
							}							
							break;						
						}
					}		
				}									
				var html = "";			
				var time = gap.change_date_localTime_only_time(wdfull.toString());							
				var disname = "";				
				if (info.tle != ""){
					disname = info.tle;
				}else if (info.att.length > 2){
					var bun = info.att.length - 2;
					disname = nam + gap.lang.hoching + " " + gap.lang.other + " " + bun + "" + gap.lang.myung;
				}else{					
					if (nam == ""){
						disname = gap.lang.no_chatroom;
					}else{
						disname = nam + gap.lang.hoching;
					}					
				}							
				var xid = "main_" + gap.encodeid(info.cid);
				if (i == 0){
					html += "	<li class='new-room' id='make_new_chat_room' style='background-color:white !important'><a href='#'><span id='make_chatroom_now'></span></a></li>";
				}			
				html += "	<li id='li_"+xid+"'>";
				html += "		<div class='chatroomlist' id='"+xid+"' style='height:100%'>";				
				if (info.tle != ""){
					html += "			<h3 class='chg-name'>"+disname+"</h3>";
				}else{
					html += "			<h3>"+disname+"</h3>";
				}					
				if (info.wty == 5 || info.wty == 6){
					var xhtml = info.wmsg;
					if (typeof(info.ex) != "undefined"){
						if (typeof(info.ex.nm) != "undefined"){
							var fname = info.ex.nm;
							var url = gap.search_fileserver(info.ex.nid);
							fname = fname.replace("'","`");
							var downloadurl = url+ "/filedown" + info.ex.sf + "/" + info.ex.sn + "/" + encodeURIComponent(fname);							
							if (typeof(info.ex.caller) != "undefined"){
								if (info.ex.caller == "1" || info.ex.caller == "3"){
									var spl = downloadurl.split("/");
									var id = spl[6];
									var path = spl[5];
									var filename = spl[7];
									var fserver = "https://" + spl[2] + "/WMeet"
									downloadurl = gap.search_file_convert_server(fserver) + "/FDownload.do?id=" + path + "&ty=chat&md5=" + id + "&fn=" + filename + "&ky="+gap.search_cur_ky();
								}
							}							
							var xhtml = gBody.chatroom_last_msg_file_dis(fname, downloadurl, "main");
							html += "			<div class='message' id='li_msg_"+xid+"'>"+xhtml+"</div>";
						}else{
							html += "			<div class='message' id='li_msg_"+xid+"'>"+info.wmsg+"</div>";
						}						
					}else{
						html += "			<div class='message' id='li_msg_"+xid+"'>"+info.wmsg+"</div>";
					}
				}else if (info.wty == 4){				
					if ( (typeof(info.ex) != "undefined" ) && (info.ex != "")){
						if (typeof(info.ex.lnk) != "undefined"){
							if ($.isArray(info.ex.lnk)){
								html += "			<div class='message' id='li_msg_"+xid+"'>"+info.ex.lnk[0].autoLink({target:"_blank"})+"</div>";
							}else{
								html += "			<div class='message' id='li_msg_"+xid+"'>"+info.ex.lnk.autoLink({target:"_blank"})+"</div>";
							}
							
						}else{
							html += "			<div class='message' id='li_msg_"+xid+"'>"+info.wmsg.autoLink({target:"_blank"})+"</div>";
						}
						
					}else{
						html += "			<div class='message' id='li_msg_"+xid+"'>"+info.wmsg.autoLink({target:"_blank"})+"</div>";
					}
				}else if (info.wty == 3){
					var emoticon_img = "<img style=' height:35px' src='/resource/images/emoticons/"+info.wmsg+"' alt=''>";
					html += "			<div class='message' id='li_msg_"+xid+"'>"+emoticon_img+"</div>";
				}else if (info.wty == 2){					
					var spl = info.wmsg.split(" ");
					var opt = spl[0];					
					var lastr = info.wmsg.substring(2, info.wmsg.length);					
					var name = "";					
					var cel = lastr.split(":")[3];
					if (gap.cur_el == cel){
						name = lastr.split(":")[1];
					}else{
						name = lastr.split(":")[2];
						if (typeof(name) == "undefined"){
							name = lastr.split(":")[1];
						}
					}				
					var dis = "";
					if (opt == "e"){
						dis = name + gap.lang.enter_chat;
					}else{
						dis = name + gap.lang.exit_chat;
					}					
					html += "			<div class='message' id='li_msg_"+xid+"'>"+dis+"</div>";
				}else if (info.wty == 3){
					//이모티콘은 표시하지 않는다.
				}else if (info.wty == 21){
					var lx = info.wmsg.split("-spl-");
					var tpx = lx[0];					
					if (tpx == "mail_link"){
						var mxg =  lx[1];
						html += "		    <div class='message' id='li_msg_"+xid+"'>"+mxg+"</div>";
					}else{
						var mxg = info.wmsg.split("-spl-")[0];
						html += "			<div class='message' id='li_msg_"+xid+"'>"+mxg+"</div>";
					}
				}else{					
					if (info.wty == 100){
						//회수된 메시지 표시
						html += "			<div class='message' id='li_msg_"+xid+"'>"+gap.lang.re_msg+"</div>";
					}else if (info.wky == "10139992"){
						html += "			<div class='message' id='li_msg_"+xid+"'>"+gBody.receive_elephant+"</div>";
					}else{
						var xxx = gap.HtmlToText(info.wmsg);
						html += "			<div class='message' id='li_msg_"+xid+"'>"+xxx+"</div>";
					}
				}			
				html += "			<div class='member'>";				
				var bx = 3;
				if (info.att.length < 3){
					bx = info.att.length;
				}
				var kk = 0;	
				for (var j = 0 ; j < info.att.length; j++){
					var spl = info.att[j];				
					if (info.cty == 10){
						var person_img = gap.person_profile_photo(spl);		
						html += "				<div class='user-thumb' data='"+spl.ky+"'>"+person_img+"</div>";
						
					}else{
						var person_img = gap.person_profile_photo(spl);					
						if (gap.search_cur_ky() != spl.ky){
							html += "				<div class='user-thumb' data='"+spl.ky+"'>"+person_img+"</div>";	
							kk ++;
						}											
						if (kk > 2){
							break;
						}		
					}						
				}				
				if (info.att.length > 3){
					var bun = info.att.length - 4;
					if (bun != 0){
						html += "				<div class='user-thumb count' id='count_"+xid+"' title='"+gap.lang.show_all_user+"'>+"+bun+"</div>";
					}					
				}			
				html += "			</div>";
				html += "			<div class='time' id='li_time_"+xid+"' data='"+xid+"'>"+time+"</div>";
				html += "		</div>";
				html += "		<button class='ico btn-more chat' data='chatroom'>더보기</button>";				
				html += "	</li>";					
				$("#chatroom_main_ul_"+ddx).append(html);			
			}
		}		
		$("#make_chatroom_now").text(gap.lang.makechatroom);	
		gBody._event_main_chatroom_last();		
	},
	
	"_event_main_chatroom_last" : function(){	
	
		$("#center_content_main .ico.btn-more.chat").off().on("click", function(){			
			$.contextMenu({
				selector : ".ico.btn-more.chat",
				autoHide : true,
				trigger : "left",
				callback : function(key, options){				
					var tid = $(this).parent().attr("id");
				//	var cid = tid.replace("li_main_","").replace(/_/gi,"^").replace("-spl-",".");
					var cid = gap.decodeid(tid.replace("li_main_",""));					
					if (key == "allout"){
						gBody.chatroom_out("all");
					}else if (key == "out"){
						//"li_main_s_loverabbit_ndh"
						gBody.chatroom_out(cid);
					}else if (key == "mail"){
						gBody.group_mail_start_cid(cid);					
					}else if (key == "file"){
						gBody.ty = "chatroom";
						gBody.person_file_upload_chatroom(tid);					
					}else if (key == "memo"){
						gBody.group_memo_start_cid(cid);
					}else if (key == "video"){
						gBody.group_video_invite_cid(cid);
					}else if (key == "changename"){
						gBody.changename_show(cid);
					}else if (key == "fix"){
						gBody.change_fix_item(cid);
					}else if (key == "fix2"){
						gBody.change_fix_item2(cid);
					}
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
                	}				
				},				
				build : function($trigger, options){
				
					gBody.click_room_id = $trigger.parent().attr("id");
					return{
						items : gBody.chatroom_menu_content()
					}
				}
				//items: gBody.chatroom_menu_content()
			});		
		});	
		
		$("#center_content_main ul li").off();
		$("#center_content_main ul li").droppable({
			drop : function(event, ui){
				try{					
			 		var droppable = $(this);
			 		var draggable = ui.draggable;
			 		var dragid = ui.draggable.attr("id");			 		
			 		if (draggable.hasClass("chat-attach") || 
			 				draggable.hasClass("balloon") || 			 				
			 				draggable.hasClass("chat_img") ||
			 				draggable.hasClass("chat_img2") ||
			 				draggable.hasClass("chat_file") ||			 				
			 				draggable.hasClass("tmail") ||	
			 				draggable.hasClass("img-content")){
			 			//파일을 드래그해서 이동하면 업로드하는 프로그레스바 효과를 추가해 준다.			 			
			 			//var room_key = droppable.attr("id").replace("li_main_","").replace(/_/gi,"^").replace("-spl-",".");	
			 			var room_key = gap.decodeid(droppable.attr("id").replace("li_main_",""));	
			 			gBody.file_drag_room_id = room_key;			 			
			 			var roomlists = gap.chat_room_info.ct;
			 			var select_room_info = "";			 			
			 			for (var k = 0 ; k < roomlists.length; k++){
			 				var lxl = roomlists[k];
			 				if (lxl.cid == room_key){
			 					select_room_info = lxl.att;
			 					break;
			 				}
			 			}			 			
			 			var slist = "";
			 			slist += "<div style='text-align:left;padding-bottom:10px'>";
			 			for (var y = 0 ; y < select_room_info.length; y++){
			 				var sr = select_room_info[y];
			 				if (gap.search_cur_ky() != sr.ky){
			 					if (gap.cur_el == sr.el){
				 					slist += "<div>" + sr.nm + " / " + sr.dp + "</div>";
				 				}else{
				 					slist += "<div>" + sr.enm + " / " + sr.edp + "</div>";
				 				}	
			 				}			 						 				
			 			}
			 			slist += "<div>";			 			
			 			var msg = gap.lang.dragandadd;
			 			msg += "<div style='text-align:left;  padding-top:10px;'>["+gap.lang.cose+"]</div>" + slist;			 			
			 			gap.showConfirm({
			 				title: "Confrim",
			 				contents: msg,
			 				callback: function(){
			 					//확인을 클릭한 경우						 			
			 					var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.							
								if (draggable.hasClass("balloon")){
						 			//대화내역중에 메시지를 버디리스트에 드래그 & 드롭하는 경우 처리
						 			//드래그된 사용자와의 대화방이 기존에 있는지 없는지에 따라 처리한다.						 						 					 				
						 		//	var sendmsg = $(draggable).text();			
						 			var sendmsg = $(draggable).html().replace(/\<p style=\"height\:5px\"><\/p>/gi,"\n");
						 			sendmsg = $(sendmsg).text();
						 			gBody.last_msg.msg = sendmsg;
						 			gBody.last_msg.ty = "msg";						 			
	 								var parentClass = $(draggable).parent().attr("class");
	 								if (parentClass == "talk link"){		 								
	 									var obj = gBody.search_og_only_search(sendmsg);
	 									obj.cid = room_key;
	 									 _wsocket.send_chat_msg(obj);			 									
	 								}else{
	 									var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.		 					 					 				
	 					 				gBody.msg_send_to_server(msgid, sendmsg, room_key);	
	 								}
								}else if (draggable.hasClass("tmail")){
									//메일을 드래그 & 드롭으로 이동한 경우
									//메일서버 정보, 메일 DB 정보, unid값을 가져와야 한다.									
									var ms = draggable.attr("data1");
									var mf = draggable.attr("data2");
									var unid = draggable.attr("id");
									var empno = gap.userinfo.userid;
									var lan = gap.userinfo.userLang;								
								//	var url = cdbpath + "/(agtCopyDoc)?openAgent&ms="+mailserver+"&mf="+maildbpath+"&unid="+unid+"&empno=" + empno + "&lan=" + lang;
								//	var url = "/w0.nsf/(agtCopyDoc)?openAgent&ms="+mailserver+"&mf="+maildbpath+"&unid="+unid+"&empno=" + empno + "&lan=" + lang;
									var url = gap.make_mail_url(ms, mf, unid, empno, lan);
									$.ajax({
										type : "GET",
										dataType : "json",
										xhrFields: {
											withCredentials: true	
										},
										contentType : "application/json; charset=utf-8",
										url : url,
										success : function(res){											
											var cid = room_key;											
											var sendObj = new Object();
											sendObj.target_uid = "";	
											sendObj.room_code = res;
											sendObj.direct = "F";   //옵션이 T인 경우 대화창에 내용을 바로 입력해야 주어야 한다.
											sendObj.from = "mail";																								
											gBody.send_invite_msg(sendObj, cid);											
											gBody.last_msg.msg = res.title;
								 			gBody.last_msg.ty = "msg"; 											
											$(".wrap-room .tmail.ui-draggable").remove();											
										},
										error : function(e){
											gap.gAlert(gap.lang.errormsg);
											return false;
										}
									})									
	 							}else{		 			
	 								var obj = new Object();			 								
	 								var filename = $(draggable).attr("data");
	 								var downloadurl = $(draggable).attr("data2");
	 								var size = $(draggable).attr("data3");
	 								var ty = "";
	 								//채팅창 안에서 드래그한 파일 또는 이미지일 경우
	 								if (draggable.hasClass("chat-attach")){
	 									obj.ty = 5;
	 								}else{
	 									obj.ty = 6;
	 								}	 											 								
	 								if (draggable.hasClass("chat_img2") || draggable.hasClass("chat_img") ){
	 									obj.ty = 6;
	 									filename = $(draggable.html()).find("img").attr("data1");
	 									downloadurl = $(draggable.html()).find("img").attr("data2");
	 									size = $(draggable.html()).find("img").attr("data3");
	 								}else if (draggable.hasClass("chat_file")){
	 									obj.ty = 5;
	 									filename = $(draggable).find("span").attr("data1");
	 									downloadurl = $(draggable).find("span").attr("data2");
	 									size = $(draggable).find("span").attr("data3");
	 								} 								
	 								obj.msg = filename;
	 								obj.cid = room_key;
	 								obj.mid = msgid;	 										 								 
	 								var exobj = new Object();		    	 		    	 
	 								exobj.nid = gap.sid;
	 								exobj.ty = gap.file_extension_check(filename);	
	 								var spl = downloadurl.split("/");			 								 
	 							//	 if (gap.isDev){
	 							//		exobj.sn = spl[5];
	 							//		exobj.sf = "/" + spl[4];
	 							//	 }else{
	 								exobj.sn = spl[6];
	 								exobj.sf = "/" + spl[5];
	 							//	 }
	 								exobj.sz = parseFloat(size);
	 								exobj.nm = filename;	
	 								obj.ex = exobj; 								 
	 								gBody.last_msg.ty = obj.ty 
	 						    	gBody.last_msg.ex = obj;
	 						    	gBody.last_msg.downloadurl = downloadurl;	 						    				 						    	
	 						    	gBody.process_display2(droppable, obj, "");					 			
	 							}	
			 				}
			 			});		 					 		
			 		}		 			
				}catch(e){}		
		 		var x = ui.helper.clone();		 		
		 		var top = ui.helper.position().top;
		 		var left = ui.helper.position().left;		 		
		 		top = "20px";
		 		left = "50px";		 		
		 		x.css({ 'top': top, 'left': left }).appendTo($(this)).fadeOut(1000);			    	
			},
			hoverClass: "drop-area",
		//	accept: "div.user",
	    	classes: {
	    //       "ui-droppable-active": "drop-area"
	        }
		});	
		
		$("#center_content_main ul li").off();
		$("#center_content_main ul li").each(function(i, el){		
			var id = $(el).attr("id");
			
			if ( (typeof(id) != "undefined") && (id != "make_new_chat_room") ){				
				if (typeof($("#" + id)) != "undefined"){
					var dropzoneControl = $("#" + id)[0].dropzone;
			        if (dropzoneControl) {
			            dropzoneControl.destroy();
			        }
				}				
				//채팅 메인에서 드래그 & 드롭으로 파일을 전송하는 경우
				var myDropzonexx = new Dropzone("#" + id, { // Make the whole body a dropzone
				      //url: "http://localhost:8080/fileupload", // Set the url
				      url : gap.fileupload_server_url + "/" + gap.search_today_only(),
				      autoProcessQueue : false,
				  	  previewsContainer: "#previews", // Define the container to display the previews
				  	  clickable : false,
				//  	  clickable: "#open_attach_window", // Define the element that should be used as click trigger to select files.
				  	  parallelUploads : 1,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
				  	  uploadMultiple: false,
				  	  renameFile: function(file){
						return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
					  },
				  	  init: function() {						
						myDropzonexx = this;
				      	this.file_lists = new Array();
				        this.on('dragover', function(e,xhr,formData){					        
				        	$("#"+id).css("border", "2px dotted #005295");
				        	return false;
				        });
				        this.on('dragleave', function(e,xhr,formData){		
				        	$("#"+id).css("border", "");
				        	return false;
				        });	    			  
				      },
				      success : function(file, json){ 				    	
				    	  this.file_lists.push(json);	    	 
				      },
				      addedfile :  function(file) {				    	
			    		  gap.dropzone_upload_limit(this, file, "chat");
				      }
				});
				myDropzonexx.on("totaluploadprogress", function(progress) {			
					if ($("#total-progress_s .progress-bar").length > 0){
						document.querySelector("#total-progress_s .progress-bar").style.width = progress + "%";
					}					
				});
				myDropzonexx.on("queuecomplete", function (file) {
					if (!myDropzonexx.sendOK){						
						var curid = this.element.id;
						$("#"+curid).css("border", "");
						return false;
					}					
					var opt = "";	
					var flist = this.file_lists;					
					var xxid = this.element.id.replace("li_main_","");
					var curid = gap.decodeid(this.element.id.replace("li_main_",""));
					gBody.file_drag_room_id = curid;					
					$("#total-progress_s").remove();					
					for (var i = 0 ; i < flist.length; i++){
						var file = flist[i];
						var info = file.files[0];				
				    	var filename = info.name;
				    	 if (gap.check_image_file(filename)){
				    		 info.type = "image";
				    	 }else{
				    		 info.type = "file";
				    	 }				    	  
				    	 //파일이 정상적으로 업로드 되었으니 해당 JSON정보를 그대로 메신저 서버에 넘기면된다.			    	
				    	 var key = gap.search_cur_ky();
				    	 var time = gap.search_time_only();			    	  
				    	 var xdate = new Date();		
				  		 var date = xdate.YYYYMMDDHHMMSS();				    	  
				    	 var inx = info.url.lastIndexOf("/");
				    	 var url = info.url.substring(0, inx);			    	  
				    	 var downloadurl = gap.fileupload_server_url + "/filedown" + info.savefolder + "/" + info.savefilename + "/" + encodeURIComponent(info.name);
				    	 var previewurl = gap.fileupload_server_url + info.savefolder + "/thumbnail/" + info.savefilename;				    		  
				    	 var ty = info.type;
				    	 var fname = info.name;
				    	 var siz = info.size; 
				    	 var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.    	 
				    	 var obj = new Object();
				    	 if (info.type == "image"){
				    		 obj.ty = 6;
				    	 }else{
				    		 obj.ty = 5;
				    	 }
				    	 obj.msg = fname;
				    	 obj.cid = curid;
				    	 obj.mid = msgid;				    	 
				    	 var exobj = new Object();		    	 		    	 
				    	 exobj.nid = gap.sid;
				    	 exobj.ty = gap.file_extension_check(info.name);
				    	 exobj.sn = info.savefilename;
				    	 exobj.sf = info.savefolder;
				    	 exobj.sz = info.size;
				    	 exobj.nm = info.name;				    	
				    	 obj.ex = exobj;			    	 
				    	 gBody.last_msg.ty = obj.ty 
				    	 gBody.last_msg.ex = obj;
				    	 gBody.last_msg.downloadurl = downloadurl;				    					   		    	  	
					     _wsocket.send_chat_msg(obj);				     			    		
					}					
					var timex_2= setTimeout(function(){
						var msg = gap.lang.enter_room;						
						gap.showConfirm({
							title: "Confrim",
							contents: msg,
							callback: function(){
								gBody.enter_chatroom_for_chatroomlist(xxid, "");
							}
						});			 			
			 			clearTimeout(timex_2);
					}, 700);	
//					myDropzonexx.removeAllFiles();
		 			this.file_lists = new Array();										
			    });

				myDropzonexx.on("addedfiles", function (file) {				
					var curid = this.element.id;
					$("#"+curid).css("border", "");
					for (var i = 0 ; i < file.length; i++){
						var fx = file[i];
						var is_image = gap.check_image_file(fx.name);
						
						if (is_image){
							//이미지일 경우 파일 사이즈를 20M로 설정한다.
							//alert(fx.size + "/" + gBody.image_max_upload_size);
							if (fx.size > (gap.image_max_upload_size_chat * 1024 * 1024)){
								var si = (fx.size / 1024 / 1024) + "M";										 
								myDropzonexx.removeFile(fx);
								if (!myDropzonexx.sendOK){
									myDropzonexx.sendOK = false;	
								}							
							}else{
								myDropzonexx.sendOK = true;
							}							
						}else{
							//일반 파일일 경우 사이즈를 100M로 설정한다.
							//alert(fx.size + "/" + gBody.file_max_upload_size);
							if (fx.size > (gap.file_max_upload_size_chat * 1024 * 1024)){
								if (!myDropzonexx.sendOK){
									myDropzonexx.sendOK = false;
								}								
							}else{								
								if (gap.no_upload_file_type_check(fx.name)){
									$("#total-progress_s").hide();
									myDropzonexx.removeFile(fx);
									if (!myDropzonexx.sendOK){
										myDropzonexx.sendOK = false;	
									}							
								}else{
									myDropzonexx.sendOK = true; 
								}							
							}			
						}	
					}									
					if (myDropzonexx.sendOK == false){					
						var curid = this.element.id;
						$("#"+curid).css("border", "");
						return false;
					}
					var xid = gap.encodeid(this.element.id);
					var curid = gap.decodeid(this.element.id.replace("li_main_",""));
		 			var roomlists = gap.chat_room_info.ct;
		 			var select_room_info = "";		 			
		 			for (var k = 0 ; k < roomlists.length; k++){
		 				var lxl = roomlists[k];
		 				if (lxl.cid == curid){
		 					select_room_info = lxl.att;
		 					break;
		 				}
		 			}	 			
		 			var slist = "";
		 			slist += "<div style='text-align:left;padding-bottom:10px'>";
		 			for (var y = 0 ; y < select_room_info.length; y++){
		 				var sr = select_room_info[y];
		 			//	if (gap.search_cur_ky() != sr.ky){
		 					if (gap.cur_el == sr.el){
			 					slist += "<div>" + sr.nm + " / " + sr.dp + "</div>";
			 				}else{
			 					slist += "<div>" + sr.enm + " / " + sr.edp + "</div>";
			 				}	
		 			//	}			 						 				
		 			}
		 			slist += "<div>";	 		
		 		//	if (myDropzonexx.files.length > 0){
		 				var msg = gap.lang.dragandadd;
			 			msg += "<div style='text-align:left;  padding-top:10px;'>["+gap.lang.cose+"]</div>" + slist;			 			
			 			$.confirm({
			 				title : "Confirm",
			 				content : msg +"<hr>",
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
			 							myDropzonexx.options.autoProcessQueue = true;		 
			 							myDropzonexx.processQueue();
			 						}
			 					},
			 					cancel : {
			 						keys: ['esc'],
			 						text : gap.lang.Cancel,
			 						btnClass : "btn-default",
			 						action : function(){
			 						 	$("#" + xid).css("border","");
			 						}
			 					}
			 				}		 			
			 			});
		 		//	}				
			    });
				myDropzonexx.on('sending', function(file, xhr, formData){										
					myDropzonexx.sendOK = true;
					$("#total-progress_s").show();			
		 			var id = this.element.id.replace(/\^/gi,"_").replace(".","-spl-");
		 		//	var id = gap.encodeid(this.element.id);
					var pid = this.element.id.replace("li_","").replace(/\^/gi,"_").replace(".","-spl-");
				//	var pid = gap.encodeid(this.element.id.replace("li_",""));					
			        $("#" + id).css("border","");		       
					var html = "";
					html += "<div id='total-progress_s' style='height:2px; width: calc(100% - 1px); margin-left:0px; margin-right:0px; margin-top:20px'>"; 
					html += "	<div class='progress-bar' style='height:2px; width:0%;background:#337ab7' data-dz-uploadprogress></div>";
					html += "</div>";
					var cnt = $("#total-progress_s").length;
					if (cnt == 0){
						$(html).insertAfter("#" + pid);
					}				
			        document.querySelector("#total-progress_s .progress-bar").style.display = "";				
			    });				
			}			
		});

		$("#center_content_main ul li").off().on("click", function(e){
			//메인창에서 대화방 들어가기								
			//대화방 리스트에 있는 신규 메시지 정보를 정리한다.
			
			var op = $(e.target).data("key");
			var cls = $(e.target).attr("class");
			if (typeof(op) != "undefined"){
				//이미지 파일을 클릭한 경우이다.
				var ky = $(e.target).data("key");
	        	gap.showUserDetailLayer(ky);
	        	return false;
			}else if (cls == "ico btn-more chat on" || cls == "ico btn-more chat"){
				
			}else if (cls == "ico btn-download"){
				//gBody.chatroom_last_msg_file_dis()함수에서 구현되어 있다.
			}else if (cls == "user-thumb count"){				
				var tid = $(e.target).parent().parent().attr("id");
				//tid = tid.replace("main_","").replace(/_/gi,"^").replace("-spl-",".");
				tid = gap.decodeid(tid.replace("main_",""));
				var chinfo = gap.search_chat_info_cur_chatroom(tid);
				var chatt = chinfo.att;							
				var html = "";
				html += "<div class='layer-member' style='width:500px'>";
				html += "	<h2>"+gap.lang.chatuser+" (" + (parseInt(chatt.length)-1) + gap.lang.myung +")</h2>";
				html += "	<button class='ico btn-member-close'>닫기</button>";				
				html += "	<ul class='list-member' id='member_dis' style='overflow:hidden'>";									
				for (var k = 0; k < chatt.length; k++){
					var cinfo = chatt[k];
					if (cinfo.ky != gap.search_cur_ky()){
						html += "<li>";
						html += "	<dl>";
						if (gap.cur_el == cinfo.el){
							html += "		<dt>"+cinfo.nm+"</dt>";
							html += "		<dd>"+cinfo.dp+"</dd>";
						}else{
							html += "		<dt>"+cinfo.enm+"</dt>";
							html += "		<dd>"+cinfo.edp+"</dd>";
						}			
						html += "	</dl>";
						
						var imgpath = gap.person_profile_photo(cinfo);
						html += "	<span>"+imgpath+"</span>";
						html += "</li>";
					}					
				}			
				html += "	</ul>";
				html += "</div>";								
				$(e.target).qtip({
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
					position: {
				         viewport: $('#window')
				    },
					events : {
						show : function(event, api){		
							$("#member_dis").mCustomScrollbar({
								theme:"dark",
								autoExpandScrollbar: true,
								scrollButtons:{
									enable:false
								},
								mouseWheelPixels : 200, // 마우스휠 속도
								scrollInertia : 400, // 부드러운 스크롤 효과 적용
							//	mouseWheel:{ preventDefault: false },
								advanced:{
									updateOnContentResize: true
								},
								autoHideScrollbar : true
								//setTop : $(this).height() + "px"
							});
						},
						hidden : function(event, api){
							api.destroy(true);
						}
					}
				});	
				return false;
			}else{
				var tcid = $(this).attr("id").replace("li_main_","");				
				var xid = gap.decodeid(tcid);	
				var obj = gap.search_chat_info_cur_chatroom(xid);			
				_wsocket.chat_room_read_event(xid, obj.wsq);			
				gBody.minus_count_chatroom(tcid);		
				var len = gBody.unread_count_control();
				if (len == 0){
					gBody.chatroom_new_msg_icon("");
					gap.change_title("1","");	
				}				
				//더블클릭한 방에 들어간다.
				//var cid = $(this).attr("id").replace(/_/gi,"^").replace("-spl-",".").replace("main^","").replace("li^","");
				var cid = gap.decodeid($(this).attr("id").replace("main^","").replace("li^",""));
				var xxid = $(this).attr("id").replace("main_","").replace("li_","");			
				gBody.enter_chatroom_for_chatroomlist(xxid, "");
			}		
		});		
		
		$("#make_new_chat_room").off().on("click", function(){						
			$("#create_chat_room_left").click();
			return false;
			gap.show_content("subsearch");
			gBody.search_type = "makeroom";
			gBody.open_add_member_search_layer("makeroom");	
			if (role != "T"){
				$("#video_invite_btn").hide();
			}
		});	
	},
	
	"chatroom_out" : function(cid){		
		var msg = "";
		if (cid == "all"){
			msg = gap.lang.msg_exitall;
		}else{
			msg = gap.lang.msg_exit2;
		}		
		gap.showConfirm({
			title: "Confrim",
			contents: msg,
			callback: function(){
				//확인을 클릭한 경우				
				if (cid == gBody.cur_cid){
					//좌측에 대화방 리스트에서 나가기 하는 경우 현재 창이 동일한 채팅 창이면 나가기 한다.
					$("#chat_room_back").click();
				}			
				if (cid == "all"){
					//모두 나가기 하는 경우
					_wsocket.chat_room_out_event("all");				
					//채팅탭에 읽지 않는 건수 초기화
					$("#tab2_sub .ico-new").remove();
					//채팅메뉴에 읽지 않는 건수 초기화
					gap.unread_count_check("chat", 0);				
				}else{
					//특정 방을 나가기 한 경우
					_wsocket.chat_room_out_event(cid);
				}
			}
		});
	},
	
	"chatroom_read_msg" : function(info){
		//현재 채팅방 정보에서 해당 사용자의 최종 읽음 순번 정보를 업데이트 한다.		
		var info = JSON.parse(info);
		if (typeof(gap.chat_room_info.ct) == "undefined"){
			return false;
		}
		var chatroom_list = gap.chat_room_info.ct;
		for (var i = 0 ; i < chatroom_list.length; i++){
			var cinfo = chatroom_list[i];
			if (cinfo.cid == info.cid){
				var atts = cinfo.att;
				for (var j = 0 ; j < atts.length; j++){
					var jinfo = atts[j];
					if (jinfo.ky == info.ky){
						jinfo.rsq = info.sq;
					}
				}				
				cinfo.last_read_id = info.sq;
				cinfo.rsq = info.sq;
				gBody.last_other_read_id = info.sq;
			}
		}		
		if ( (gBody.cur_cid == info.cid) || (gma.cur_cid_popup == info.cid)){
			var read_id = info.sq;
			gBody.chatroom_unread_check();
		}	
		if (gap.search_cur_ky() == info.ky){
			//메시지가 왔는데 다른 곳에서 읽은 경우 (PC난 모바일에서 읽음 경우) 빨꽁을 확인해서 처리해 줘야 한다.
			var cid = gap.encodeid(info.cid);
			gBody.minus_count_chatroom(cid);
			var len = gBody.unread_count_control();
			if (len == 0){
				gBody.chatroom_new_msg_icon("");
				gap.change_title("1","");
			}			
			gap.unread_count_check("chat", len);
		}else{		
			//읽은 처리 건수를 계산해서 -1씩 해주고 결과가 0인경우 항목을 제거한다.
			var list  = $("#chat_msg_dis .ucnt");			
			var last_read_msg_bun = info.sq;
			var ulc = info.rsq;  //이수자 보다 큰것만 읽음 건수를 출여야 한다.
			var sq = info.sq;			
			//혹시 현재 바로 입력한 값에 숫자를 빼줘야 한다.		
			for (var ii = 0 ; ii < list.length; ii++){
				var ff = list[ii];
				var bun = parseInt($(ff).html());
				var mdata = parseInt($(ff).prev().attr("data"));				
				if (mdata > ulc && mdata <= sq){				
				//	if (bun <= last_read_msg_bun){				
						var tp = parseInt($(ff).html()) - 1;
						if (tp == 0){
							$(ff).remove();
						}else{
							$(ff).html(tp);
						}
				//	}
				}			
			}			
			var list2 = $("#alarm_chat_sub .ucnt");
			for (var ii = 0 ; ii < list2.length; ii++){
				var ff = list2[ii];
				var bun = parseInt($(ff).html());
				var mdata = parseInt($(ff).prev().attr("data"));				
				if (mdata > ulc && mdata <= sq){			
				//	if (bun <= last_read_msg_bun){				
						var tp = parseInt($(ff).html()) - 1;
						if (tp == 0){
							$(ff).remove();
						}else{
							$(ff).html(tp);
						}
				//	}
				}			
			}			
		}		
	},
	
	"chatroom_unread_check" : function(){				
		var newicons = $(".talk .ico-new");
		var cur_chatroom_last_read = gBody.last_other_read_id;
		for (var i = 0 ; i < newicons.length; i++){
			var icon = newicons[i];
			var dx = $(icon).attr("data");
			if (typeof(dx) != "undefined"){
				var dat = parseFloat(dx.replace("ico-new_",""));
				if (cur_chatroom_last_read >= dat){
					$(icon).parent().parent().find(".mk").remove();
					$(icon).remove();					
				}
			}			
		}		
		//일반 메시지와 파일의 경우
		var mkbtns = $(".talk .wrap-message .btn-chat-more");
		for (var j = 0 ; j < mkbtns.length; j++){
			var mk = mkbtns[j];
			var dat = parseFloat($(mk).parent().attr("mid"));
			if (cur_chatroom_last_read >= dat){
				$(mk).remove();
			}			
		}	
		//ogtag의 경우 구조가 틀려서 별도로 처리한다.
		var mkbtns = $(".talk.link .btn-chat-more");
		for (var j = 0 ; j < mkbtns.length; j++){
			var mk = mkbtns[j];
			var dat = parseFloat($(mk).parent().parent().attr("mid"));
			if (cur_chatroom_last_read >= dat){
				$(mk).remove();
			}			
		}		
	},
	
	"search_chatroom_last_read_id" : function(){
		var cid = gBody.cur_cid;
		var res = 0;
		var chatroom_list = gap.chat_room_info.ct;
		for (var i = 0 ; i < chatroom_list.length; i++){
			var cinfo = chatroom_list[i];
			if (cinfo.cid == cid){				
				if (typeof(cinfo.last_read_id) != "undefined"){
					gBody.last_other_read_id = cinfo.last_read_id;
					return cinfo.last_read_id;
					break;
				}else{
					//값이 없을 경우 내가 아닌 상대방의 rsq값을 가져와서 세팅해 준다.					
					var atts = cinfo.att;
					for (var j = 0 ; j < atts.length; j++){
						var jinfo = atts[j];
						if (jinfo.ky != gap.search_cur_ky()){
							gBody.last_other_read_id = jinfo.rsq;							
							cinfo.last_read_id = jinfo.rsq;							
							return jinfo.rsq;
							break;
						}
					}					
				}				
			}
		}
		return res;		
	},	
	
	"myinfo_draw" : function(){	
		
		var userinfo = gap.userinfo.rinfo;		
		userinfo = gap.user_check(userinfo);	
		var person_img = gap.person_profile_photo(userinfo);	
		var jobtitle = "";
		var dept = "";
		var name = "";			
		name = userinfo.nm;		
		if (typeof(userinfo.jt) != "undefined"){
			jobtitle = userinfo.jt;
		}		
		if (typeof(userinfo.dp) != "undefined"){
			dept = userinfo.dp.replace("#","");
		}		
		gap.cur_el = userinfo.el;	
		var msg = "";
		if (typeof(gap.userinfo.rinfo.msg) != "undefined"){
			msg = gap.userinfo.rinfo.msg;
		}				
		var html = "";
		html += "	<div class='aside-profile'>";
		html += "		<div class='profile-img'>";		
		html += "			<div class='user' style='position:absolute; top:60px; left:80px; width:140px; height:141px; cursor:pointer' id='my_profile_image'>";
		html += "				<div class='photo-wrap' style='border-radius:50%; background-image:url(" + gap.person_photo_url(userinfo) + "),url(../resource/images/none.jpg);'></div>";
		html += "			</div>";		
		html += "			<p class='name' style='padding-top:140px'>"+ name + " " +  jobtitle + "</p>";
		html += "			<p class='desc'>"+ dept +"</p>";
		html += "			<p class='group'>" + userinfo.cp + "</p>";
		html += "		</div>";
		html += "		<div class='profile-card'>";
		html += "			<ul>";
		html += "				<li>";
		html += "					<span class='tit'>Emp</span>";
		html += "					<span class='item'>"+userinfo.emp+"</span>";
		html += "				</li>";
		html += "				<li>";
		html += "					<span class='tit'>E-Mail</span>";
		html += "					<span class='item'>"+userinfo.em+"</span>";
		html += "				</li>";
		html += "				<li>";
		html += "					<span class='tit'>Mobile</span>";
		html += "					<span class='item'>"+userinfo.mp+"</span>";
		html += "				</li>";
		html += "				<li>";
		html += "					<span class='tit'>Tel</span>";
		if (userinfo.iptno != ""){
			html += "					<span class='item'>"+userinfo.op + "(" + userinfo.iptno+")</span>";
		}else{
			html += "					<span class='item'>"+userinfo.op +"</span>";
		}		
		html += "				</li>";
		html += "			</ul>";
		html += "		</div>";
		html += "	</div>";			
		$("#user_profile").html(html);		
		$("#my_profile_image").off().on("click", function(e){
			gap.showUserDetailLayer(gap.userinfo.rinfo.ky);
		});		
		$(".btn-job-edit").off().on("click", function(e){						
			$("#bstext").val(gap.userinfo.rinfo.mm);			
			gap.showBlock();
			//편집창을 띄운다.
			var inx = parseInt(gap.maxZindex()) + 1;
			$("#bslayer").css("z-index", inx);
			$("#bslayer").show();			
			$("#bsclose").off();
			$("#bsclose").on("click", function(e){				
				gap.hideBlock();
				$("#bslayer").hide();
			});			
			$("#bscancel").off();
			$("#bscancel").on("click", function(e){
				$("#bsclose").click();
			});			
			$("#bsmsave").off();
			$("#bssave").on("click", function(e){
				var content = $("#bstext").val();
				gBody.modify_business(content);
			});
		});	
		try{
			var g_status = sessionStorage.getItem("status");
			var g_status_msg = sessionStorage.getItem("msg");
			if (g_status != null){				
				_wsocket.change_status_new(parseInt(g_status, 10), g_status_msg);
			}
		}catch(e){}	
	},
	
	"modify_business" : function(content){		
		var type = gap.userinfo.rinfo.id.substring(0,2);
		if (type != "EX"){
			type = "";
		}
		var url = "/mobile/mprofile.nsf/changeTask?Openform&amp;Seq=1";
		var _form_data ={
			'__Click' : '0',
			'usertype' : type,
			'profile' : content
		};		
		$.ajax({
			type : "POST",
			url : url,
			data : _form_data,
			async : false,
			success : function(data){
				var res = JSON.parse(data);
				if (res.result == "ok"){
					gap.gAlert(gap.lang.m10);
					$("#bsclose").click();
				}else{
					gap.error_alert();
				}				
			},
			error : function(x){
				gap.error_alert();
			}
		})
	},	
	
	"chatroom_new_msg_icon" : function(opt){
		if (opt == "new"){
			$("#tab2_sub").html(gap.lang.chatroom + "<span class='ico-new'></span>");
			$("#left_sub_chatroom_new_dis").addClass("ico-new");
		}else{
			$("#tab2_sub").html(gap.lang.chatroom);
			$("#left_sub_chatroom_new_dis").removeClass();
		}
	},
	
	"call_draw_received_img" : function(){
		
	},	
	
	
	
	"receive_enter_room" : function(cid, id, event, roomkey){		
		//알림창에서 알림창을 클릭한 경우
		event.stopPropagation();		
		gap.clear_toast_alram(id);		
		var xid = gap.encodeid(cid);	
		gBody.minus_count_chatroom(xid);	
		var len = gBody.unread_count_control();
		if (len == 0){
			gBody.chatroom_new_msg_icon("");
			gap.change_title("1","");	
		}		
		if (typeof(roomkey) != "undefined" && roomkey != ""){
			//화상회의에 바로 입장한다.
			gBody.open_video_popup("F", roomkey);
		}else{		
			gBody.enter_chatroom_for_chatroomlist(xid,"");
		}	
	},	
	
	"receive_file_download" : function (url, event){		
		event.stopPropagation();		
		gap.file_download(url);		
		return false;
	},	
	
	"refresh_chatroom" : function(cid){
		var date = new Date();		
		var today = date.YYYYMMDD();
		var ddt = date.YYYYMMDDHHMMSS();
		var tm = gap.change_date_localTime_only_time(ddt);		
		var xid = gap.encodeid(cid);		
		//값을 초기화 한다.
		gBody.file_drag_room_id = "";	
		if (xid == ""){
			return false;
		}		
		//현재 브라우저 로컬에 가지고 있는 gap.chat_room_info 정보를 갱신한다.
		var tid = gap.decodeid(xid);
		var bun = gap.chatroom_position_check(tid);
		var arr = gap.chat_room_info.ct;
		gBody.arraymove(arr, bun, 0);		
		//기존에 있는 채팅방의 경우 채팅방 리스트 정보를 변경한다.	
		//var isExistChatRoom = $("#chatroom_"+today).length;		
		if (typeof($("#" + xid).get(0)) != "undefined"){
			var copyObj = $("#" + xid).get(0).outerHTML;			
			var idx = $("#" + xid).parent().children().length;	
			var pid = $("#" + xid).parent().attr("id");			
			var ccn = $("#chatroom_fix").find("[id='"+xid+"']").length;
			if (ccn == 0){
				$("#" + xid).remove();				
				if (idx == 1){				
					pid = pid.replace("_ul","");
				//	$("#" + pid).remove();	//오늘 대화방이 1개만 존재하는 경우 깜박이는 현상으로 인해 remark - 2022.03.31
				}
			}
			var rdate = gap.change_date_default(today);
			if ($("#chatroom_"+today).length == 0){	
				_wsocket.load_chatroom_list();
			}else{				
				if (ccn == 0){
					$("#chatroom_ul_"+today).prepend($(copyObj));					
					//신규로 제거하 다시 붙이고 해서 이벤트가 모두 제거된 상태로 변경되어 다시 이벤트를 추가해 준다.
					gBody._event_chatroom_list();
				}			
				//메인에 정보를 신규 메시지로 변경한다.		
				if ($("#li_main_" + xid).length > 0){			
					var copyObj = $("#li_main_" + xid).get(0).outerHTML;					
					var pid = $("#li_main_" + xid).parent().children().length;
					if (pid == 1){
						$("#center_content_main").empty();
						gBody.chatroom_last_draw();
					}else{
						$("#li_main_" + xid).remove();			
						$(copyObj).insertAfter("#make_new_chat_room");			
						gBody._event_main_chatroom_last();
					}
				}	
			}			
		}	
	},	
		
	"arraymove" : function(arr, fromIndex, toIndex) {
	    var element = arr[fromIndex];
	    arr.splice(fromIndex, 1);
	    arr.splice(toIndex, 0, element);
	},
	
	"write_chat_log" : function(info, init, ek){		
		if (info.length == 0){
			return false;
		}		
		
		var mul_imgs = [];
		for (var i = 0 ; i < info.length; i++){
			var sinfo = info[i];			
			var croom_key = "";
			if (typeof(sinfo.cid) != "undefined"){
				croom_key = sinfo.cid
			}			
			if (sinfo.ty == 1 || sinfo.ty == 21 || sinfo.ty == 100){
				var opt = "you";
				if (gap.search_cur_ky() == sinfo.ky){
					opt = "me";
				}
				var msg = sinfo.msg;
				var type = "msg";				
				var dept = "";								
				var userinfo = gap.cur_room_att_info_list_search(sinfo.ky);				
				if (typeof(userinfo) == "undefined"){
					name = sinfo.nm;
					dept = "";
				}else{
					if (opt == "me"){
						name = userinfo.nm;
					}else{
						if (gap.cur_el == userinfo.el){
							name = userinfo.nm;
							dept = gap.cur_room_att_person_dept_search(sinfo.ky, "ko")
						}else{
							name = userinfo.enm;
							dept = gap.cur_room_att_person_dept_search(sinfo.ky, "")
						}					
					}						
				}								
				var sdate = sinfo.dt;
				var msgid = sinfo.sq;
				var key = sinfo.ky;
				var ucnt = sinfo.ucnt;	
				if (typeof(sinfo.ucnt) == "undefined"){
					ucnt = sinfo.cnt - 1;
				}
				var trans = "";
				var ex = sinfo.ex;
				if (typeof(ex) != "undefined"){
					if (typeof(ex.ty) != "undefined"){
						if (ex.ty == "tr"){
							//번역문자로 인식한다.
							trans = sinfo.ex;
						}					
					}
				}	
				
				
				var reply_info = "";
				if (typeof(sinfo.ex) != "undefined"){
					if (typeof(sinfo.ex.reply) != "undefined" || typeof(sinfo.ex.notice) != "undefined"){
						reply_info = sinfo;
					}
				}
		        gBody.MessageSend_log_draw(opt, msg, type, name, key, msgid, sdate, init, sinfo.ty, dept, ucnt, trans, ek, croom_key, reply_info);		        
		        if (init == "F"){
		        	//이전대화 작성할 때만 마지막 아이디 값을 등록한다.
		        	 gBody.last_draw_id = msgid;		        	 
		        }
			}else if (sinfo.ty == 2){
				//시스템 메시지 뿌리기				
				var spl = sinfo.msg.split(" ");
				var opt = spl[0];
				var lastr = sinfo.msg.substring(2, sinfo.msg.length); //영문명에 공백이 들어갈 수 있기 때문에 " "으로 split하면 잘못 계산되어 index로 짤라야 한다.				
				var ukey = lastr.split(":")[0];
				var uinfo = gap.cur_room_att_info_list_search(ukey);				
				var name = "";
				if (gap.cur_el == lastr.split(":")[3]){
					name = lastr.split(":")[1];
				}else{
					name = lastr.split(":")[2];
					if (typeof(name) == "undefined"){
						name = lastr.split(":")[1];
					}
				}				
				gBody.chatroom_enter_msg(name, opt, sinfo.dt, init, sinfo.sq, ek, croom_key);			
			}else if (sinfo.ty == 3){				
				//이모티콘 이미지 표시하기
				gBody.chatroom_emoticon_msg(sinfo, init, ek, croom_key);
			}else if (sinfo.ty == 4){				
				//ogTag 표시하는 소스 추가
				var opt = "";
				if (sinfo.ky == gap.search_cur_ky()){
					opt = "me";
				}else{
					opt = "you";
				}
				var key = sinfo.ky;			
				var time = gap.change_date_localTime_only_time(sinfo.dt.toString());				
				var linkurl = sinfo.ex.lnk;
				var url = sinfo.ex.img;
				var title = sinfo.ex.tle;
				var desc = sinfo.ex.desc;
				var domain = sinfo.ex.dmn;
				var str = sinfo.msg;
				var name = sinfo.nm;				
				var date = gap.change_date_localTime_only_date(sinfo.dt.toString());				
				var msgid = sinfo.sq;
				var tp = "log";				
				var ucnt = sinfo.ucnt;
				if (typeof(sinfo.ucnt) == "undefined"){
					ucnt = sinfo.cnt - 1;
				}			
				var trans = "";
				var ex = sinfo.ex;
				if (typeof(ex) != "undefined"){
					if (typeof(ex.ty) != "undefined"){
						if (ex.ty == "tr"){
							//번역문자로 인식한다.
							trans = sinfo.ex.ct;
						}					
					}
				}				
				gBody.ogtag_draw(opt, key, time, linkurl, url, title, desc, domain, str, date, msgid, tp, init, ucnt, trans, name, ek, croom_key);					
				if (init == "F"){
		        	//이전대화 작성할 때만 마지막 아이디 값을 등록한다.
		        	 gBody.last_draw_id = msgid;		        	 
		        }				
			}else if (sinfo.ty == 5 || sinfo.ty == 6){				
				//일반 첨부파일 표시 
				
				var opt = "";
				if (sinfo.ky == gap.search_cur_ky()){
					opt = "me";
				}else{
					opt = "you";
				}
				var key = sinfo.ky;			
				var time = gap.change_date_localTime_only_time(sinfo.dt.toString());			
				var date = gap.change_date_localTime_full(sinfo.dt.toString());				
				var type = "file";
				if (sinfo.ty == 6){
					type = "image";
				}					
				
				
				var filename = ""
				var filesize = "";				
				var chatserver_domain = "";				    	  
		    	var downloadurl = "";
		    	var previewurl = "";	
		    	var isMulti = false;
		    	
				var fnames = new Array();
				var snames = new Array();
				var dnames = new Array();
				var pnames = new Array();
				
				if (sinfo.ty == 6 && typeof(sinfo.ex.files) != "undefined"){
					//묶음 보내기하는 경우
					isMulti = true;					
					for (var k = 0 ; k < sinfo.ex.files.length; k++){
						var itm = sinfo.ex.files[k];
						filename = itm.nm;
						filesize = itm.sz;		
						filename = filename.replace("'","`");	
						chatserver_domain = gap.search_chatserver_domain(itm.nid);				    	  
				    	downloadurl = chatserver_domain+ "/filedown" + itm.sf + "/" + itm.sn + "/" + encodeURIComponent(filename);
				    	previewurl = chatserver_domain + itm.sf + "/thumbnail/" + itm.sn;	
				    	
						fnames.push(filename);
						snames.push(filesize);
						dnames.push(downloadurl);
						pnames.push(previewurl);
					}
//					var firstex = sinfo.ex.files[0];
//					filename = firstex.nm;
//					filesize = firstex.sz;		
//					filename = filename.replace("'","`");				
//					chatserver_domain = gap.search_chatserver_domain(firstex.nid);				    	  
//			    	downloadurl = chatserver_domain+ "/filedown" + firstex.sf + "/" + firstex.sn + "/" + encodeURIComponent(filename);
//			    	previewurl = chatserver_domain + firstex.sf + "/thumbnail/" + firstex.sn;	
				}else{
					//하나씩 보내기 하는 경우
					filename = sinfo.ex.nm;
					filesize = sinfo.ex.sz;		
					filename = filename.replace("'","`");				
					chatserver_domain = gap.search_chatserver_domain(sinfo.ex.nid);				    	  
			    	downloadurl = chatserver_domain+ "/filedown" + sinfo.ex.sf + "/" + sinfo.ex.sn + "/" + encodeURIComponent(filename);
			    	previewurl = chatserver_domain + sinfo.ex.sf + "/thumbnail/" + sinfo.ex.sn;	
				}
			
				
		    	if (sinfo.ty == 5){
					previewurl = "";
				}				
				
				
				var msgid = sinfo.sq;
				var tp = "log";				
				var ucnt = sinfo.ucnt;
				if (typeof(sinfo.ucnt) == "undefined"){
					ucnt = sinfo.cnt - 1;
				}		
			
				if (isMulti){
					gBody.file_draw(opt, type, key, date, time, fnames, snames, dnames, pnames, msgid, tp, init, ucnt, sinfo, ek, croom_key);
					gBody.tMultiImages.push(sinfo);
				}else{
					gBody.file_draw(opt, type, key, date, time, filename, filesize, downloadurl, previewurl, msgid, tp, init, ucnt, sinfo, ek, croom_key);
				}
			
							
				if (init == "F"){
		        	//이전대화 작성할 때만 마지막 아이디 값을 등록한다.
		        	 gBody.last_draw_id = msgid;		        	 
		        }			
			}
		}		
		
		
		
		//타임, 읽지 않은 건수, 메뉴 버튼의 위치를 조정한다.		
		gBody.check_display_layer();		
		var isone = gBody.cur_cid.substring(0,1);
		if (isone == "s"){
			gBody.chatroom_unread_draw();
		}	
		if (init == "T"){
			if (gma.chat_position == "channel"){
				gap.scroll_move_to_bottom_time(gBody.chat_show_channel_sub, 900);
			}else if (gma.chat_position == "popup_chat"){
				gap.scroll_move_to_bottom_time(gBody.chat_show_popup, 900);
			}else{
			//	var key = gap.check_scroll_chat(sinfo.cid);
				var key = gap.check_scroll_chat(gBody.cur_cid);
				if (key == "2"){
					gap.scroll_move_to_bottom_time(gBody.chat_show, 900);
				}	
				//gap.scroll_move_to_bottom_time("chat_msg", 900);
			}			
		}		
		$("#chat_msg_dis .user-thumb").off().on("click", function(e){			
			var ky = $(e.target).data("key");
			gap.showUserDetailLayer(ky);
			return false;
		});	
		
		$("#chat_msg_dis .user").on("mouseover", function(){	
			$(this).css("cursor","pointer");
			$(this).draggable({
				 revert: "invalid",
				 stack: ".draggable",     //가장위에 설정해 준다.
				 opacity: 1,
			//	 containment: "window",
				 scroll: false,
			//	 helper: 'clone',
				 cursorAt: { top: 15, left:15},
				 helper: function (e) { 
					//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.		
					return $(this).clone().appendTo("#nav_left_menu").css("zIndex",2000).show();
			     },			 			     
			     cursor: 'move',	  
			     
				 start : function(event, ui){
			    	
			    	var uid = $(this).children().attr("data");
			    	gBody.drag_person_obj.uid = uid;
			    	gBody.drag_person_obj.srcgroup = "";
					$(this).draggable("option", "revert", false);
				},
				stop : function(event, ui){						
				}
			});
		});		
		
		gBody.reply_expand_check();
		
	},
	
	"reply_expand_check" : function(){
		$(".rmsg_cls").each(function(index, info){
			
			if ($(info).height() > 30){
				$(info).css("height", "25px");
				$(info).next().show();
				
				$(info).parent().parent().parent().parent().parent().css("max-width","calc(100% - 60px)")
			}
		});
		$(".balloon-btn2").off().on("click", function(e){
			var tobj = $(e.currentTarget);
			var cls = tobj.children(0).attr("class");
			if (cls.indexOf("expand") > -1){
				tobj.prev().css("height", "auto");
				tobj.children(0).text(gap.lang.fold);
				tobj.children(0).attr("class", "btn-fold");
			}else{
				tobj.prev().css("height", "25px");
				tobj.children(0).text(gap.lang.expand);
				tobj.children(0).attr("class", "btn-expand");
			}
		});
		
		
	},
	
	"check_display_layer" : function(){		

		var obj = $(".wrap-message").last().parent().parent().find(".time");		
		var dis_object = "chat_msg_dis";
		if (gma.chat_position == "channel"){
			dis_object = gBody.chat_show_channel_sub;
		}else if (gma.chat_position == "popup_chat"){
			dis_object = gBody.chat_show_popup_sub;
		}else{			
		}
		var ttplist = $("#"+dis_object).find(".time");
		if (ttplist.length > 0){								
			for (var u = 0 ; u < ttplist.length; u++){
				var pxt = ttplist[u];				
				var multi_line = $(pxt).prev().find(".btn-expand");
				var reply_multi_line =$(pxt).prev().find(".balloon-btn2");				
				var tpxt = $(pxt).prev().find(".img-thumb");
				var clx = $(pxt).parent().parent().attr("class");
				if (clx == "you"){
					
					
					if (tpxt.length > 0){
						//이미지인 경우
						$(pxt).css("top", "190px");
						$(pxt).next().css("top", "190px");
						$(pxt).css("padding-right", "0px");
						$(pxt).css("margin-right", "0px");
						$(pxt).css("padding-left", "10px");							
					}else{
						//일반 파일인 경우
						if ($(pxt).prev().find(".chat-attach").length > 0){
							$(pxt).css("top", "40px");
							$(pxt).next().css("top", "40px");
							$(pxt).css("padding-right", "0px");
							$(pxt).css("margin-right", "0px");
							$(pxt).css("padding-left", "10px");							
						}else{
							//메시지인 경우
							if (typeof(reply_multi_line) != "undefined" && reply_multi_line.length > 0){
								//텍스트 긴문장을 답장했을때 타임의 높이 조절
								$(pxt).css("top", "145px");
								$(pxt).next().css("top", "145px");
							}else if (typeof(multi_line) != "undefined" && multi_line.length > 0){
								//기본 메시지가 긴 문장일 경우 타임의 높이 조절
								$(pxt).css("top", "265px");
								$(pxt).next().css("top", "265px");
							}else{
								$(pxt).css("top", "25px");
								$(pxt).next().css("top", "25px");								
							}
							$(pxt).css("margin-right", "0px");
							$(pxt).css("padding-right", "0px");
							$(pxt).css("padding-left", "10px");
	
						}
					}					
					if($(pxt).next().next().next().length == 0){
						//마지막 이미지 이다.
						$(pxt).css("top", "0px");
						$(pxt).css("padding-left", "5px");
						$(pxt).next().css("top", "0px");
					}	
				}else{

					if (tpxt.length > 0){
						//이미지인 경우
						$(pxt).css("top", "190px");
						$(pxt).next().css("top", "190px");
						$(pxt).next().css("padding-left", "10px");											
					}else{
						//일반 파일인 경우
						if ($(pxt).prev().find(".chat-attach").length > 0){
							$(pxt).css("top", "38px");
							$(pxt).next().css("top", "38px");
							$(pxt).next().css("padding-left", "10px");
						}else{
							//메시지인 경우							
							if (typeof(reply_multi_line) != "undefined" && reply_multi_line.length > 0){
								//텍스트 긴문장을 답장했을때 타임의 높이 조절
								$(pxt).css("top", "145px");
								$(pxt).next().css("top", "145px");
							}else if (typeof(multi_line) != "undefined" && multi_line.length > 0){
								//기본 메시지가 긴 문장일 경우 타임의 높이 조절
								$(pxt).css("top", "265px");
								$(pxt).next().css("top", "265px");
							}else{
								$(pxt).css("top", "25px");
								$(pxt).next().css("top", "25px");
							}
							
							$(pxt).next().css("padding-left", "10px");
						}
					}
					if($(pxt).next().next().next().length == 0){
						//마지막 이미지 이다.
						$(pxt).css("top", "0px");
						$(pxt).next().css("top", "0px");
					}	
				}						
			}
		}
	},	
	
	"chatroom_dis" : function(obj){		
		if (typeof(obj.ct) != "undefined"){
			if (obj.ct.cid != gBody.cur_cid){
				return false;
			}
		}
		$("#channel_main").hide();		
		$("#chat_msg_dis").show();
		//대화방을 처음 그릴때 마지막 채팅자를 초기화 한다.
		if (typeof(obj) != "undefined"){
			if (obj.rc !=0){
				$("#chat_room_back").click();
				return false;
			}
		}		
		gBody.lastchatter = "";		
		$("#chatroom_all_status").hide();
		gBody.hideNoticeChat();
		if ((typeof(obj) != "undefined") && (obj.rc == 0)){
			var info = obj.ct.log;	
			gBody.write_chat_log(info, "T", obj.ek);
		}		
		
		//채팅방에 공지가 있는지 체크한다.
		gap.read_notice(obj.ct.cid);
		
		$("#chat_msg .date:first" ).css( "margin-top", "0px" );			
		$("#chat_msg").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable: true
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
	//			updateOnContentResize: true
			},
			autoHideScrollbar : false,
			setTop : ($("#chat_msg").height()) + "px",
			callbacks : {
				onTotalScrollBack: function(){					
					if (gBody.searchMode != "T"){
						gBody.scrollP = $("#chat_msg").find(".mCSB_container").height();
						gBody.chat_addContent(this, gBody.cur_cid, "chat");
					}				
				},
				onTotalScrollBackOffset: 10,
				alwaysTriggerOffsets:false,				
				whileScrolling : function(){
					gBody.scroll_bottom = this.mcs.topPct;
				}
			}
		}); //.mCustomScrollbar("scrollTo", "bottom", {scrollInertia : 0})
				
		$("textarea#message_txt").off();
		$("textarea#message_txt").keypress(function(evt) {	
			var enter_opt = gBody.enter_opt;
			if (enter_opt == ""){
				enter_opt = "1";
			}			
	        if (evt.keyCode == 13 && !evt.shiftKey){	 
	        	if (enter_opt == "1"){
	                gBody.send_msg(evt);                
	        	}else if (enter_opt == "2"){
	        		//다음줄로 내려간다.    
	        		gBody.enter_next_line(evt);
	        	}
	        }           
	        if (evt.keyCode == 13 && evt.shiftKey) {	        	
	        	if (enter_opt == "1"){
	        		//다음줄로 내려간다.
	        		gBody.enter_next_line(evt);
	        	}else{
	        		 gBody.send_msg(evt);     
	        	}       	
	        }
	    });		
		//채팅화면에 이미지 붙여넣기 하기
		gBody.image_paste_action();
		//현재 채팅방에 마지막 sq를 읽었다고 서버에 전송함	
		if ((typeof(obj) != "undefined")  && (obj.rc == 0) && (obj.ct.log.length > 0)){
			var last_sq = obj.ct.log[obj.ct.log.length-1].sq;			
			var chat_info = gap.search_chat_info_cur_chatroom(gBody.cur_cid);			
			if (typeof(chat_info) != "undefined"){
				if (last_sq > chat_info.rsq){
					_wsocket.chat_room_read_event(gBody.cur_cid, last_sq);				
					gap.search_cur_chatroom_change_rsq(gBody.cur_cid, last_sq);
				}	
			}					
		}		
		setTimeout(function(){
			$("#chat_msg").mCustomScrollbar("scrollTo", "bottom");	
		}, 600);	
		gBody._chat_eventHandler();	
		gBody.change_status();		
	},	
	
	"image_paste_action" : function(){
		$("#chat_msg, #alarm_chat_top").off("paste");
		$("#chat_msg, #alarm_chat_top").on("paste",function(e){			
			var target = "chat";
			if ($(e.currentTarget).attr("id") == "alarm_chat_top"){
				target = "popup";
			}			
			e.stopPropagation();
			e.preventDefault();
			var items = (event.clipboardData || event.originalEvent.clipboardData).items;
			for (index in items) {
				var item = items[index];
				gBody.clipbord_file = item;
				if (item.kind === 'file') {					
					gBody.retrieveImageFromClipboardAsBlob(event, function(imageBlob){
				        // If there's an image, display it in the canvas						
				        if(imageBlob){			            
				            var html = "";
				            html += "<div class='layer-result' id='chat_history_content' style='max-width:1000px; max-height:750px; left:50%;top:50%;transform:translate(-50%,-50%);'>";
				    		html += "	<h2>" + gap.lang.paste1 + "</h2>";
				    		html += "	<button class='ico btn-article-close'>닫기</button>";				    		
				    		html += "   <div style='width:100%; border-bottom : 1px solid #e6e2e2 ; padding-top:5px'></div>";				    		
				    		html += "	<canvas style='max-width:900px; max-height:500px' id='mycanvas'></canvas>";				    			
				    		html += "	<div class='right-bottom-btns' style='margin-bottom:15px; padding-top:15px; border-top: 1px solid #e6e2e2'>";
				    		html += "		<button id='go_paste' style='height:32px'><span>" + gap.lang.go_paste + "</span></button>"
				    		html += "		<button id='go_cancel'  style='height:32px' ><span>" + gap.lang.Cancel + "</span></button>";
				    		html += "	</div>";				    		
				            html += "</div>";				            
				            $("#past_image_viewer").html(html);				            
				            var canvas = document.getElementById("mycanvas");
				            var ctx = canvas.getContext('2d');				            
				            // Create an image to render the blob on the canvas
				            var img = new Image();	
				            // Once the image loads, render the img on the canvas
				            img.onload = function(){
				                // Update dimensions of the canvas with the dimensions of the image
				                canvas.width = this.width;
				                canvas.height = this.height;	
				                // Draw the image
				                ctx.drawImage(img, 0, 0);
				            };	
				            // Crossbrowser support for URL
				            var URLObj = window.URL || window.webkitURL;	
				            // Creates a DOMString containing a URL representing the object given in the parameter
				            // namely the original Blob					    		
				            img.src = URLObj.createObjectURL(imageBlob);
				            $('#past_image_viewer').find('.btn-article-close').on('click', function() {
				            	$('#past_image_viewer').empty();
				            	$('#past_image_viewer').hide();
				            	gap.hideBlock();
				            });			           
				    		$('#go_paste').off().on('click', function(e) {				    			
				    			//이미지 붙여넣기 하면 이름을 등록하지 않고 바로 추가 할 수 있게 수정합니다.
				    			 var oob = canvas.toDataURL('image/png');
 				            	 var ooo = gBody.dataURItoBlob(oob);          	 
 				            	 ooo.name = "clipboard_image.png"; 					            		
 				            	 $('#past_image_viewer').hide();
				            	 gap.hideBlock();			           
				            	 
				            	 if (target == "popup"){
				            		 gBody.dropzone_popup.addFile(ooo); 
				            		 

				            		 gBody.dropzone_popup.options.autoProcessQueue = true;	
				            		 gBody.dropzone_popup.processQueue();
				            		 gBody.dropzone_popup.options.autoProcessQueue = false;
				            		 
				            	 }else{
				            		 gBody.dropzone.addFile(ooo); 
				            		 gBody.dropzone.options.autoProcessQueue = true;	
				            		 gBody.dropzone.processQueue();
				            		 gBody.dropzone.options.autoProcessQueue = false;	
				            	 }
				            });
				    		$('#go_cancel').off().on('click', function() {
				            	$('#past_image_viewer').empty();
				            	$('#past_image_viewer').hide();
				            	gap.hideBlock();
				            });			            
				            $("#past_image_viewer").show();
				            var max_idx = gap.maxZindex();
				    		$('#past_image_viewer')
				            .css({'width':'1100px','height':'400px','zIndex': parseInt(max_idx) + 1})
				            .show()
				            .position({
				                my: 'center',
				                at: 'center',
				                of: window
				            });
				            gap.showBlock();
				            var inx = parseInt(gap.maxZindex()) + 1;
				            $("#past_image_viewer").css("z-index", inx);
				            $("#past_image_viewer").show();			            
				        }
				    });
				}else if (item.kind === 'string'){
				}
		 	}
		});
	},
	
	"fix_position" : function(){		
		//스크롤 해서 데이터가 추가되면 추가되기 이전의 Position에 그대로 있어야 한다.
		var scroll_after_position = "";
		if (gma.chat_position == "channel"){
			scroll_after_position = $("#"+gBody.chat_show_channel_sub).find(".mCSB_container").height();
			var orignal_position = scroll_after_position - gBody.scrollP;	
			$("#"+gBody.chat_show_channel_sub).mCustomScrollbar("scrollTo", orignal_position);	
		}else if (gma.chat_position == "popup_chat"){
			scroll_after_position = $("#"+gBody.chat_show_popup).find(".mCSB_container").height();
			var orignal_position = scroll_after_position - gBody.scrollP;	
			$("#"+gBody.chat_show_popup).mCustomScrollbar("scrollTo", orignal_position);	
		}else{
			scroll_after_position = $("#"+gBody.chat_show).find(".mCSB_container").height();
			var orignal_position = scroll_after_position - gBody.scrollP;	
			$("#"+gBody.chat_show).mCustomScrollbar("scrollTo", orignal_position);	
		}		
		gBody.scrollP = scroll_after_position;		
	},	
	
	"retrieveImageFromClipboardAsBlob" : function(pasteEvent, callback){
		if(pasteEvent.clipboardData == false){
	        if(typeof(callback) == "function"){
	            callback(undefined);
	        }
	    };
	    var items = pasteEvent.clipboardData.items;
	    if(items == undefined){
	        if(typeof(callback) == "function"){
	            callback(undefined);
	        }
	    };
	    for (var i = 0; i < items.length; i++) {
	        // Skip content if not image
	        if (items[i].type.indexOf("image") == -1) continue;
	        // Retrieve image on clipboard as blob
	        var blob = items[i].getAsFile();
	        if(typeof(callback) == "function"){
	            callback(blob);
	        }
	    }
	},
	
	"dataURItoBlob" : function(dataURI) {
	    var byteString, mimestring;
	    if(dataURI.split(',')[0].indexOf('base64') !== -1 ) {
	        byteString = atob(dataURI.split(',')[1])
	    } else {
	        byteString = decodeURI(dataURI.split(',')[1])
	    }
	    mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0];
	    var content = new Array();
	    for (var i = 0; i < byteString.length; i++) {
	        content[i] = byteString.charCodeAt(i)
	    }
	    return new Blob([new Uint8Array(content)], {type: mimestring});
	},
	
	"change_status" : function(){
		var list = gBody.cur_room_att_info_list;	
		if (call_key != ""){
			list = window.opener.gBody.cur_room_att_info_list;
		}	
		var list_out_me = new Array();		
		var lists = new Array();		
		for (var k = 0; k < list.length; k++){
			var xinfo = list[k];
			//나와의 대화도 가능해서 여길 푼다..
			var cky2 = xinfo.ky;
			lists.push(cky2);				
			list_out_me.push(xinfo);		
		}		
		//채팅방 사용자 상태 요청한다.
		//lists : 대상자 ky값 / opt 등록 : 1, 종료 : 2 / ty : 어디서 호출한 것인지 등록해서 나중에 판단 기준으로 사용한다.		
		_wsocket.temp_list_status(lists, 1, "chatroom");	
	},
	
	"chatroom_unread_draw" : function(){
		
		//1:1 채팅방에서 동작한다.
		//현재 방에서 최종 읽은 메시지 순번을 가져와서 혹시 값이 더 크게 있으면 읽지 않은 아이콘을 표시해 준다.		
		if (gBody.is_my_chat){
			return false;
		}		
		var xdate = new Date();		
		var today = xdate.YYYYMMDD();		
		var last_read = gBody.last_other_read_id;		
		var lists = $(".wrap-message");
		for (var i = 0 ; i < lists.length; i++){
			var list = lists[i];			
			if ($(list).find(".tool_ico_chat").length == 0){
				var isme = $(list).parent().parent().attr("class");
				var isogtag = $(list).parent().attr("class");
				if (isme == "me"){
					if (isogtag == "talk link"){
						curid = $(list).parent().attr("id");
						if (last_read < parseFloat(curid)){
							//ogTag는 단독으로 표시되어 모두 time을 갖는다.
							var oob = $(".time[data="+curid+"]");						
							var otim = $(oob).html();						
							oob.html(otim + "<span class='ico-new' style='display:none' id=\"ico-new_"+curid+"\" data='"+curid+"'></span>");							
							var ht = "<button class='ico btn-chat-more on mk'>더보기</button>";
							var kkx = $("#ico-new_" + curid).parent().parent().find(".wrap-message");					
							$(kkx).append(ht);
						}		
					}else{
						var curid = $(list).attr("id");
						if (last_read < parseFloat(curid)){												
							var lb = $(list).next().attr("class");						
							if (lb == "time"){
								//time앞메 new icon을 추가 해야 한다.							
								var oob = $(".time[data="+curid+"]");						
								var otim = $(oob).html();						
								oob.html(otim + "<span class='ico-new' style='display:none' id=\"ico-new_"+curid+"\" data='"+curid+"'></span>");							
								//오늘 날짜것만 삭제버튼을 추가한다.
								var group_date = $(list).parent().parent().attr("id").substring(0,8);   //201911131753								
								if ($(list).parent().find(".tool_ico_chat").length == 0){
									if (group_date == today){
										var ht = "<button class='ico btn-chat-more on mk'>더보기</button>";
										var kkx = $("#ico-new_" + curid).parent().parent().find(".wrap-message");
										
										$(kkx).find(".btn-chat-more").remove(".btn-chat-more");
										
										$(kkx).append(ht);
									}
								}								
							}else{
								//그냥 추가해야 한다.
								var oob = $("#" + curid);
								//var op = $(oob).find("button");
								oob.append("<span class='ico-new' style='display:none' id=\"ico-new_"+curid+"\" data='"+curid+"'></span>");								
								if ($(list).parent().find(".tool_ico_chat").length == 0){
									if (group_date == today){
										var ht = "<button class='ico btn-chat-more on mk'>더보기</button>";
										$(ht).insertBefore("#ico-new_"+curid);
									}
								}							
							}
						}else {
							var oob = $(".time[data="+curid+"]");	
							oob.find('span.ico-new').remove();
						}	
					}
				}
			}						
		}		
		
		gBody.delete_icon_action();	
		
	},
		
	"chat_addContent" : function(obj, cid, caller){		
		//마지막 채팅의 id값을 가져다기 그 이전 값을 구해 온다.		
		//var cid = gBody.cur_cid;		
		var lastid = "";		
		if (caller == "channel"){
			if ($("#"+gBody.chat_show_channel_sub+" .wrap-message").parent().attr("class") == "talk link"){
				lastid = $("#"+gBody.chat_show_channel_sub+" .wrap-message").parent().attr("id");
			}else{
				lastid = $("#"+gBody.chat_show_channel_sub+" .wrap-message").first().attr("mid");
			}			
			var alrams = $("#"+gBody.chat_show_channel_sub + " .alarm-user");
			if (alrams.length > 0){
				xlastid = alrams.first().attr("id");
				if (parseInt(xlastid) < parseInt(lastid)){
					lastid = xlastid;
				}
			}
		}else if (caller == "popup" || gma.chat_positionn == "popup_chat"){
			if ($("#"+gBody.chat_show_popup_sub+" .wrap-message").parent().attr("class") == "talk link"){
				lastid = $("#"+gBody.chat_show_popup_sub+" .wrap-message").parent().attr("id");
			}else{
				lastid = $("#"+gBody.chat_show_popup_sub+" .wrap-message").first().attr("mid");
			}			
			var alrams = $("#"+gBody.chat_show_popup_sub + " .alarm-user");
			if (alrams.length > 0){
				xlastid = alrams.first().attr("id");
				if (parseInt(xlastid) < parseInt(lastid)){
					lastid = xlastid;
				}
			}
		}else{
			if ($("#"+gBody.chat_show_dis + " .wrap-message").parent().attr("class") == "talk link"){
				lastid = $("#"+gBody.chat_show_dis + " .wrap-message").parent().attr("id");
			}else{
				lastid = $("#"+gBody.chat_show_dis + " .wrap-message").first().attr("mid");
			}			
			var alrams = $("#"+gBody.chat_show_dis + " .alarm-user");
			if (alrams.length > 0){
				xlastid = alrams.first().attr("id");
				if (parseInt(xlastid) < parseInt(lastid)){
					lastid = xlastid;
				}
			}
		}
		lastid = parseFloat(lastid);	
		if (caller == "channel"){
			_wsocket.load_chatlog_list_continue_channel(cid, lastid);
		}else if (caller == "popup"){
			_wsocket.load_chatlog_list_continue_popup(cid, lastid);
		}else{
			_wsocket.load_chatlog_list_continue(cid, lastid);
		}		   
	},
	
	"write_chat_log_continue" : function(obj){		
		//스크롤 올려서 이전 대화 가져오면 이 함수를 호출한다.
		gma.chat_position = "chat";
		var loglist = obj.ct.log;
		var count = loglist.length;
		if (count > 0){
			gBody.write_chat_log(loglist, "F", obj.ek);		
			//답장내용이 긴 경우 자동 접기한다.
			gBody.reply_expand_check();
			setTimeout(function(){
				gBody.fix_position();				
			}, 500);
		}		
	},	
	
	"real_draw_chat" : function(){		
	},
		
	"img_open" : function(){
		$(".ico.btn-view").on("click", function(){		
			var url = $(this).parent().parent().parent().attr("data2");
			var  title = $(this).parent().parent().parent().attr("data");		
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;			
			gap.show_image(url, title);
		});			
		//메일 첨부 다운로드와 동일한 클래스를 사용해서 앞에 .img-btns를 추가함
		$(".img-btns .ico.btn-download").off().on("click", function(){		
			var url = $(this).parent().parent().parent().attr("data2");			
			gap.file_download(url);
			return false;
		});		
		$(".ico.btn-file-download").off().on("click", function(e){			
			e.preventDefault();
			e.stopPropagation();
			var url = $(this).parent().parent().attr("data2");
			var ty = $(this).parent().parent().attr("data4");
			if (ty == "1" || ty == "3"){				
				var spl = url.split("/");
				var id = spl[6];
				var path = spl[5];
				var filename = spl[7];
				var fserver = "https://" + spl[2] + "/WMeet"
				var url = gap.search_file_convert_server(fserver) + "/FDownload.do?id=" + path + "&ty=chat&md5=" + id + "&fn=" + filename + "&ky="+gap.search_cur_ky();
				//https://dsw.daesang.com/WMeet/FDownload.do?id=648ad60243c75f2698bce4fe_20230615181245_ICB07LQQJV&ty=reply&md5=b249eae9f1a4664dd714b7bf2ab24e16.228341&ky=10im0959
				//gap.file_download(url);
				gap.file_download_normal(url, filename);
			}else{
				gap.file_download(url);	
			}
		});		
		$(".ico.btn-file-view").off().on("click", function(e){			
			e.preventDefault();
			e.stopPropagation();			
			var filename = $(this).parent().parent().attr("data");
			var url = $(this).parent().parent().attr("data2");
			var caller =  $(this).parent().parent().attr("data4");
			var key = $(this).data("key");			
			
			
			if (gap.checkFileExtension(filename)){
				    var spl = url.split("/");
					var id = spl[6];
					var surl = gap.channelserver + "officeview/ov.jsp?url=" +url + "&filename="+filename + "&dockey=" + id;
					gap.popup_url_office(surl);	
					return false;
			}else{
				gBody.file_convert("", url, "", gBody.cur_cid, "chat", caller, key, filename);	
			}
			
		});
	},
		
	"img_open2" : function(){
		
		
		//이미지 파일 원본 보기 클릭
		$(".img-thumb img").off().on("click", function(){		
	
//			var url = $(this).parent().parent().attr("data2");
//			var title = $(this).parent().parent().attr("data");						
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;		
			
			var sq = $(this).parent().parent().parent().attr("mid");
			//gap.show_image(url, title);
			
			
			//2024.04.23 퀵채팅에서 대화방에 들어가면 업무방의 이미지 슬라이드가 되지 않는 오류 수정
			if(typeof sq == "undefined"){ return; }
			
			gBody.image_view_direction = true;
			
			var ispopup = gap.isPopup(this);
			gBody.chat_gallery_show(sq, ispopup);
		});
		
		$(".wrap-message .grid-item").off().on("click", function(e){
			var obj = $(e.currentTarget);
//			var opp = $(obj).css("background-image");
//			var url = opp.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
			
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;	
			
		//	var sq = obj.parent().parent().attr("id");
			var sq = obj.parent().parent().attr("mid");
			var sq2 = obj.attr("data4");   //로컬 순번(배열에 몇번째인가)
			
			gBody.image_view_direction = true;
			var ispopup = gap.isPopup(this);
			gBody.chat_gallery_show(sq + "_" + sq2, ispopup);
		});
		
		gBody.img_open_reply();
	},
	
	"img_open_reply" : function(){
		//채팅에서 답장을 하는 경우 이미지 미리보기, 파일 미리보기, 파일 다운로드의 기능을 제공한다.
		$(".reply_img_thumbail").off().on("click", function(){		
			var url = $(this).attr("data1");
			var title = $(this).attr("data2");						
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;	
			
			var sq = $(this).attr("data3");
		//	gap.show_image(url, title);
			gBody.image_view_direction = true;
			
			var ispopup = gap.isPopup(this);
			gBody.chat_gallery_show(sq, ispopup);
		});		
		$(".reply_file_thumbail").off().on("click", function(){		
			var url = $(this).attr("data1");
			var filename = $(this).attr("data2");						
			var caller = $(this).attr("data3");	
			var key = $(this).attr("data4");	
			var show_video = gap.file_show_video(filename);
			if (show_video){				
				gap.show_video(url, filename);
			}else{
				gBody.file_convert("", url, "", gBody.cur_cid, "chat", caller, key, filename);	
			}		
		});		
		$(".btn-file-download_reply").off().on("click", function(){	
			var url = $(this).parent().prev().attr("data1");
			gap.file_download(url);	
		});
	},
	
	"user_profile_popup" : function(){		
		//버디리스트에서 사용자 이미지 클릭 했을때 상세 정보 표시하기		
		$("#chat_msg_dis .user-thumb img").off().on("click", function(e){			
			gBody.click_img_obj = this;
			var uid = $(this).parent().parent().parent().attr("data");
			uid = uid.split("^")[0];
			gap.showUserDetailLayer(uid);
			e.stopPropagation();
		});		
		$("#chat_msg_dis .user-thumb img").off().on("mouseover", function(){
			$(this).css("cursor", "pointer");
		});
	},
	
	"chat_att_drag_action" : function(){
		$(".chat-attach").off().on("mouseover", function(){
			try{				
				
				$(this).css("cursor","pointer");
				$(this).draggable({
					 revert: "invalid",
					 stack: ".draggable",     //가장위에 설정해 준다.
					 opacity: 1,
				//	 containment: "body",
					 scroll: false,
					 cursorAt: { top: 0, left:0},
				//	 helper: 'clone',
					 helper: function () { 
						//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.
						return $(this).clone().appendTo("#nav_left_menu").css("zIndex",2000).show();
				     },			 
				     cursor: 'move',			 
					 start : function(event, ui){				    	
				    	if ($(event.target.parentElement).hasClass("disabled")){
				    		$("body").css("cursor", "default");
				    		return false;
				    	}
						$(this).draggable("option", "revert", false);
						ui.helper.find("div").css("max-width", "250px");
					},
					stop : function(event, ui){						
					}
				});
			}catch(e){
				console.log("file drag install event Error");				
			}			
		});
	},
	
	"image_file_drag_action" : function(){	
		
		$(".img-content").off().on("mouseover", function(){
			try{
				$(this).css("cursor","pointer");
				$(this).draggable({
					 revert: "invalid",
					 stack: ".draggable",     //가장위에 설정해 준다.
					 opacity: 1,
				//	 containment: "body",
					 scroll: false,
				//	 helper: 'clone',
					 cursorAt: { top: 0, left:0},
					 helper: function (e) { 
						//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.
						var html = "";
						html += "<img style='width:100px' src=" +$(e.target).attr("src")+ ">";		
						console.log(this);
						return $(this).clone().appendTo("#nav_left_menu").css("zIndex",2000).show();
				     },				     
				     cursor: 'move',				     
					 start : function(event, ui){	
				    	if ($(event.target.parentElement).hasClass("disabled")){
				    		$("body").css("cursor", "default");
				    		return false;
						}		    	 
						$(this).draggable("option", "revert", false);			
						var html = "";
						html += "<div style='width:90px; text-align:center'>";
						html += "	<img style='width:70px;' src=" +ui.helper.find("img").attr("src")+ ">";
						html += "</div>";
						//위에 div를 추가하고 width값을 잡아줘야 정상적으로 표시된다. 아니면 좌측메뉴 위에 왔을때만 이미지가 보여진다.
						
						ui.helper.html(html);
					},
					stop : function(event, ui){						
					}
				});
			}catch(e){
				console.log("image file drag install event Error");
			}			
		});
		
		$(".grid-container").off().on("mouseover", function(){
			try{
				$(this).css("cursor","pointer");
				$(this).draggable({
					 revert: "invalid",
					 stack: ".draggable",     //가장위에 설정해 준다.
					 opacity: 1,
				//	 containment: "window",
					 scroll: false,
				//	 helper: 'clone',
					 cursorAt: { top: 0, left:0},
					 helper: function (e) { 
						//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.						
						var html = "";
						html += "<img style='width:100px' src=" +$(e.target).attr("src")+ ">";					
						return $(this).clone().appendTo("#nav_left_menu").css("zIndex",2000).show();
				     },				     
				     cursor: 'move',				     
					 start : function(event, ui){	
				    	
				    	if ($(event.target.parentElement).hasClass("disabled")){
				    		$("body").css("cursor", "default");
				    		return false;
						}		    	 
						$(this).draggable("option", "revert", false);			
						var html = "";
						var count = ui.helper.find(".grid-item").length;
					//	var txid = "temp_" + $(ui.helper.find(".grid-item")[0]).attr("data5");
					
						html += "<div style='width:100px; border:1px solid grey; background-color:white;text-align:center'>";
						html += "	<img style='width:70px' src=" +$(ui.helper.find(".grid-item")[0]).attr("data2")+ ">";
						html += "	<div style='font-size:12px'>Image Files("+count+")</div>";
					//	html += "	<div class='submulti' id='"+txid+"'></div>";
						html += "</div>";
						ui.helper.html(html);
					},
					stop : function(event, ui){						
					}
				});
			}catch(e){
				console.log("image file drag install event Error");
			}			
		});
	},
	
	"msg_drag_action" : function(){
		//Box2차 프로젝트시 웹메신저에서 텍스트를 드래그 & 드롭으로 하는 것 보다 드래그해서 텍스트 영역을 선택하는 기능을 더 많이 사용한다고 해서 해당 기능을 제거한다.
		return false;
		$(".balloon").on("mouseover", function(){
			try{
				$(this).css("cursor","pointer");				
				$(this).draggable({
					 revert: "invalid",
					 stack: ".draggable",     //가장위에 설정해 준다.
					 opacity: 1,
				//	 containment: "window",
					 scroll: false,
					 cursorAt: { top: 0, left: -10},
					// helper: 'clone',
					 helper: function (e) { 
						//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.					
			    	    var original = $(e.target).hasClass("ui-draggable") ? $(e.target) :  $(e.target).closest(".ui-draggable");
			    	//    return $(this).clone().appendTo("#nav_left_menu").css("zIndex",2000).css({ width: 100}).show();	   
			    	    return $(this).clone().appendTo("#nav_left_menu").css("zIndex",2000).css({ width: 100}).show();
				     },			     
				     cursor: 'move',			 
					 start : function(event, ui){
				    	 if ($(event.target.parentElement).hasClass("disabled")){
					   		$("body").css("cursor", "default");
					   		return false;
					   	}				    	 
						$(this).draggable("option", "revert", false);				
						var html = "";
						if ($(event.target).parent().parent().hasClass("me")){
							html += "<div class='balloon drag' style='padding:10px; background:#005295; color:white; white-space:nowrap; '>";
						}else{
							html += "<div class='balloon drag' style='padding:10px;   white-space:nowrap;  '>";
						}						
						var txt = ui.helper.get(0).innerText;
						var msg = "";
						if (txt.length > 15){
							html += "<div class=''><span class='tail ico'></span>"+ui.helper.get(0).innerText.substring(0,15)+" ...</div></div>";
						}else{
							html += "<div class=''><span class='tail ico'></span>"+ui.helper.get(0).innerText+"</div></div>";
						}					
						ui.helper.html(html);
					},
					stop : function(event, ui){						
					}
				});
			}catch(e){
				console.log("msg drag install event Error");
			}			
		});	
	},	
	
	
	
	"search_last_sq" : function(){
		var lastobj = $(".wrap-message").last();
		var last_sq = "";
		if ($(lastobj).parent().attr("class") == "talk link"){
			//ogTag를 삭제할 경우
			last_sq = $(lastobj).parent().attr("mid");
		}else{
			last_sq = $(lastobj).attr("mid");
		}
		var ttm = $("#chat_msg .time").last().parent().parent().attr("data");		
		if (typeof(ttm) != "undefined"){
			gBody.lastchatter = ttm.replace(/\^/gi,"");
		}else{
			gBody.lastchatter = "";
		}		
		return last_sq;
	},	
	
	"delete_msg" : function(info, opt){		
	
		var last_sq = "";
		var cid = "";
		var csq = "";
		if (typeof(info.ct) != "undefined"){
			last_sq = gap.search_last_bun_chat_info(info.ct.cid);
			cid = info.ct.cid;
			csq = info.ct.sq;
		}else{
			last_sq = gap.search_last_bun_chat_info(info.cid);
			cid = info.cid;
			csq = info.sq;
		}
		var isLast = false;
		var sq = "";
		if (opt == ""){
			sq = info.ct.sq;
		}else{
			sq = info.sq;
		}		
		if (last_sq == sq){
			//마지막을 삭제하는 것이다.
			isLast = true;
		}
		
		var is_refresh_imsg = false;
		var is_refesh_file = false;
		if ( (gap.curpage == "chat" && gBody.cur_cid == cid) || gma.cur_cid_popup == cid){
			var id = sq;							
			var ob = $(".wrap-message[mid="+id+"]");			
			if (ob.length == 0){
				ob = $(".talk.link[mid="+id+"]");
			}			
			var talk = $(ob).parent();
			var nextisTime = false;			
			var pob = ob.parent().find(".wrap-message").length;			
			if (pob == 1){
				//상단 이미지 까지 삭제해야 한다.
				//회수 메시지로 변경한다. 2022-11-23	
				
				var msgid = "msg_" + ob.attr("id");
				$("#" + msgid).html(gap.recall_msg());	
				$("#" + msgid).parent().css("padding", "10px");
				//메시지 관려 버튼을 제거한다.
				$(ob).parent().find(".btn-chat-more").remove();
				$(ob).parent().find(".trans_gap").remove();				
				//ogtag 사이트 제거
				$(ob).parent().find(".link-content").remove();				
				var kid = $(ob).attr("id");
				var hp = "";
				hp += '<div class="balloon">';
				hp += '<span class="tail ico"></span>';
				hp += '<div style="padding:10px">';
				hp += '	<span id="msg_'+kid+'">';
				hp += 	gap.recall_msg();
				hp += '	</span>';
				hp += '</div>';
				hp += '</div>';			
				if ($(ob).find(".img-content").length > 0){					
					$(ob).html(hp);		
					is_refresh_imsg = true;
				}
				if ($(ob).find(".img-content2").length > 0){					
					$(ob).html(hp);
					is_refresh_imsg = true;
				}				
				if ($(ob).find(".chat-attach").length > 0){
					$(ob).html(hp);
					is_refesh_file = true;
				}				
				if ($(ob).find("a").length > 0){
					$(ob).html(hp);
				}
				if ($(ob).find(".grid-container").length > 0){
					$(ob).html(hp);
					is_refresh_imsg = true;
				}
			}else{
				//자신만 삭제하면 된다.				
				if ($(".time[data="+id+"]").length > 0){				
					//만약 삭제할때 time값이 제거되면 해당 그룹은 Time값이 없기 때문에 해당 그룹 마지막에 Time을 추가해 줘야 한다.
					if ($(ob).parent().attr("class") == "talk link"){
						//ogTag를 삭제할 경우 디자인 변경 없음						
					}else{		
						
						if ($(ob).next().attr("class") == "time"){
							//취소하는 경우 해당 메시지를 취소 문구로만 변경한데 아래 처럼 그룹이라고 하단을 지우고 상단에 time정보를 옮기지 않아도 된다.							
						//	$(ob).parent().find(".ucnt").remove();
							$(ob).parent().find(".trans_gap").remove();							
							var kid = $(ob).attr("id");
							var hp = "";
							hp += '<div class="balloon">';
							hp += '<span class="tail ico"></span>';
							hp += '<div style="padding:10px">';
							hp += '	<span id="msg_'+kid+'">';
							hp += 	gap.recall_msg();
							hp += '	</span>';
							hp += '</div>';
							hp += '</div>';												
							var isx = true;
							if ($(ob).find(".img-content").length > 0){	
								$(ob).children().find(".btn-chat-more").remove();
								$(ob).html(hp);
								is_refresh_imsg = true;
								isx = false;
							}
							if ($(ob).find(".img-content2").length > 0){
								$(ob).children().find(".btn-chat-more").remove();
								$(ob).html(hp);
								is_refresh_imsg = true;
								isx = false;
							}
							
							if ($(ob).find(".chat-attach").length > 0){
								$(ob).children().find(".btn-chat-more").remove();
								$(ob).html(hp);
								is_refesh_file = true;
								isx = false;
							}
							if ($(ob).find(".grid-container").length > 0){
								$(ob).children().find(".btn-chat-more").remove();
								$(ob).html(hp);
								is_refresh_imsg = true;
								isx = false;
							}
							if (isx){
								var msgid = "msg_" + ob.attr("id");
								$("#" + msgid).html(gap.recall_msg());
								$("#" + msgid).parent().css("padding", "10px");
								//메시지 관려 버튼을 제거한다.
								$(ob).children().find(".btn-chat-more").remove();
							}							
						}
					}				
				}else{					
					//그룹으로 묶여 있는 상태에서 상단을 취소한 경우				
					var msgid = "msg_" + ob.attr("id");
					$("#" + msgid).html(gap.recall_msg());
					//메시지 관려 버튼을 제거한다.
					$(ob).find(".btn-chat-more").remove();
					$(ob).find(".trans_gap").remove();				
					var kid = $(ob).attr("id");
					var hp = "";
					hp += '<div class="balloon">';
					hp += '<span class="tail ico"></span>';
					hp += '<div>';
					hp += '	<span id="msg_'+kid+'">';
					hp += 	gap.recall_msg();
					hp += '	</span>';
					hp += '</div>';
					hp += '</div>';				
					if ($(ob).find(".img-content").length > 0){					
						$(ob).html(hp);		
						is_refresh_imsg = true;
					}
					if ($(ob).find(".img-content2").length > 0){					
						$(ob).html(hp);
						is_refresh_imsg = true;
					}					
					if ($(ob).find(".chat-attach").length > 0){
						$(ob).html(hp);
						is_refesh_file = true;
					}		
					if ($(ob).find(".grid-container").length > 0){
						$(ob).html(hp);
						is_refresh_imsg = true;
					}
				}			
			}
			$(talk).first().find(".wrap-message").first().find(".tail").addClass("ico");			
			//삭제되는 메시지가 채팅방의 마지막 메시지일 경우 채팅방과 메인채팅방 정보에 데이터 수정해 줘야 한다. 이런 젠장...
			if (pob == 1){				
				if (isLast){
					_wsocket.load_chatroom_list();	
				}				
			}else{
				if (isLast){			
					//상위 메시지의 형태를 파악해서 정보를 가져와댜 한다.
					var curroom_id= gBody.cur_cid;
					//var rid = curroom_id.replace(/\^/gi,"_").replace(".","-spl-");
					var rid = gap.encodeid(curroom_id);					
					var last_msg_sq = $(".wrap-message").last();
					var last_sq = "";
					var wty = "";
					var dmsg = "";				
					if ($(last_msg_sq).parent().attr("class") == "talk link"){
						last_sq = parseFloat($(last_msg_sq).parent().attr("mid"));
						var lastObj = $(".wrap-message[mid="+last_sq+"]");
						wty = 4;						
					}else{
						last_sq = parseFloat($(last_msg_sq).attr("mid"));
						var isFile = $(last_msg_sq).find(".chat-attach");
						var isImage = $(last_msg_sq).find(".img-content");						
						var lastObj = $(".wrap-message[mid="+last_sq+"]");
						var tmm = $(lastObj).parent().find(".time").last().text();						
						if (isFile.length > 0){					
							wty = 5;
							is_refesh_file = true;
							var fname = $(lastObj).find(".chat-attach").attr("data");
							var downloadurl = $(lastObj).find(".chat-attach").attr("data2");
							dmsg = fname;							
							var html = gBody.chatroom_last_msg_file_dis(fname, downloadurl, "");
							var html2 = gBody.chatroom_last_msg_file_dis(fname, downloadurl, "main");							
							$("#chat_time_" + rid).text(tmm);		
							$("#li_time_main_" + rid).text(tmm);						
							$("#li_msg_main_" + rid).html(html2);							
							if ($("#chat_msg_" + rid).next().attr("class") == "nav-attach"){
								$("#chat_msg_" + rid).next().remove();
							}			
							$("#chat_msg_" + rid).html("");
							$("#chat_msg_" + rid).after(html);							
						}else if (isImage.length >0){					
							wty = 6;
							is_refresh_imsg = true;
							var fname = $(lastObj).find(".img-content").attr("data");
							var downloadurl = $(lastObj).find(".img-content").attr("data2");
							dmsg = fname;							
							var html = gBody.chatroom_last_msg_file_dis(fname, downloadurl, "");
							var html2 = gBody.chatroom_last_msg_file_dis(fname, downloadurl, "main");							
							$("#chat_time_" + rid).text(tmm);		
							$("#li_time_main_" + rid).text(tmm);					
							$("#li_msg_main_" + rid).html(html2);							
							if ($("#chat_msg_" + rid).next().attr("class") == "nav-attach"){
								$("#chat_msg_" + rid).next().remove();
							}			
							$("#chat_msg_" + rid).html("");
							$("#chat_msg_" + rid).after(html);
						}else{							
							wty = 1;
							var msg = $(lastObj).children().find("div").text();
							dmsg = msg;													
							$("#chat_time_" + rid).text(tmm);		
							$("#li_time_main_" + rid).text(tmm);						
							$("#li_msg_main_" + rid).text(msg);							
							if ($("#chat_msg_" + rid).next().attr("class") == "nav-attach"){
								$("#chat_msg_" + rid).next().remove();
							}			
							$("#chat_msg_" + rid).text(msg);		
						}						
						var chatroom_list = gap.chat_room_info.ct;
						for (var i = 0 ; i < chatroom_list.length; i++){
							var cinfo = chatroom_list[i];
							if (cinfo.cid == curroom_id){
								cinfo.wsq = parseFloat(last_sq);
								cinfo.wty = wty;
								cinfo.wky = gap.search_cur_ky();
								cinfo.wmsg = dmsg;
								break;
							}
						}					
					}			
				}				
				gBody.last_enter_id = gBody.search_last_sq();				
			}		
			//메시지를 회수하면 이미지 파일을 다시 불러완야 한다.
			
			if (is_refresh_imsg){
				_wsocket.chat_room_image_list(gBody.cur_cid);
			}
			if (is_refesh_file){
				_wsocket.chat_room_image_list(gBody.cur_cid);
			}

			 
		}		
		//채팅 목록 리스트에서  채팅방 정보를 찾아서 마지막 문구가 삭제된 경우만 최종 메시지를 변경한다.
		if (gap.cur_window == "chat"){
			var list_chat_info = gap.search_chat_info_cur_chatroom(cid);
			if (csq == list_chat_info.wsq){
				var code = cid.replace(/\^/gi,"_");
				$("#chat_msg_"+code).empty();
				$("#chat_msg_"+code).parent().find(".nav-attach").remove();
				$("#chat_msg_"+code).text(gap.lang.re_msg);
				
				$("#li_msg_main_"+code).empty();
				$("#li_msg_main_"+code).text(gap.lang.re_msg);
			}
		}else{
			//채팅방 화면이 아닐 경우 refreh 해준다.
			if (last_sq <= sq){
				_wsocket.load_chatroom_list();
			}
		}
	},
	
	"delete_call" : function(sq){		
		var cid = gBody.cur_cid;
		if (gma.chat_position == "popup_chat"){
			cid = gma.cur_cid_popup;
		}
		sq = parseFloat(sq);
		var filename = $($("#chat_msg_dis").find("[mid="+sq+"]").children().get(0)).attr("data");		
		//점점점 아이콘을 제거한다.
		$("#chat_msg_dis").find("[mid="+sq+"]").find("button").remove();		
		_wsocket.delete_msg(cid, sq);	//호출후 .gBody.delete_msg 호출된다.		
		setTimeout(function(){			
			if (typeof(filename) != "undefined"){
				var is_image = gap.file_icon_check(filename);
				if (is_image == "img"){
					//이미지 파일을 삭제한 경우
					 _wsocket.chat_room_image_list(cid);
				}else{
					//일반 파일을 삭제한 경우
					 _wsocket.chat_room_file_list(cid);
				}
			}
		}, 1000);		
	},
	
	"delete_layer_popup" : function(opt, obj){
		
		var is_popup = "chat";
		if ($(obj).closest("#alarm_chat_sub").length == 1){
			is_popup = "popup_chat";
		}		
		var isog = $(obj).parent().parent().attr("class");
		if (isog == "talk link"){
			var sq = parseFloat($(obj).parent().parent().attr("mid"));
		}else{
			var sq = parseFloat($(obj).parent().attr("mid"));
		}
		var sender = $(obj).parent().parent().parent().attr("class");
		var html = "";
		html += "<ul class='layer layer-menu'>";
		if (sender == "me"){
			html += "	<li onclick=\"gBody.delete_call('"+sq+"')\" style='border-bottom:1px solid #dddcdc'>"+gap.lang.re_fi+"</li>";
		}		
		
		
		if ($(obj).parent().find(".chat-mail").length == 0 && $(obj).parent().find(".msg_notice").length == 0){
			html += "	<li onclick=\"gBody.reply_chat('"+sq+"', this)\">"+gap.lang.mail_reply+"</li>";
			html += "	<li onclick=\"gBody.msg_send('"+sq+"', 'other', this)\">"+gap.lang.mail_forward+"</li>";
			html += "	<li onclick=\"gBody.msg_send('"+sq+"', 'me', this)\" style='border-bottom:1px solid #dddcdc'>"+gap.lang.sendme+"</li>";
			
			//if ($(obj).parent().find(".img-thumb2").length == 0 && $(obj).parent().find(".rmsg_cls").length == 0){
			if ($(obj).parent().find(".img-thumb2").length == 0){
				html += "	<li onclick=\"gBody.msg_send_notice('"+sq+"', '"+is_popup+"')\">"+gap.lang.nreg+"</li>";
			}			
		}
		
		
		html += "</ul>";		
		var pos = "";
		if (opt == "me"){
			pos = {my : 'top left',at : 'top top',	adjust: { x: -72, y: -55}}
		}else{
			pos = {my : 'top left',at : 'top top',	adjust: { x: 4, y: -55}}
		}		
		$(obj).qtip({
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
				classes : 'qtip-bootstrap ' + is_popup,
				tip : false
			},
			position : pos,
			events : {
				hidden : function(event, api){
					api.destroy(true);
				}
			}
		});			
	},
	
	"reply_chat" : function(id, obj){
		//현재 채팅방의 특정 sq의 상세 데이터를 검색한다.
		gBody.sel_position = "chat";
		var cur_cid = gBody.cur_cid;
		if ($(obj).closest(".popup_chat").length == 1){
			gBody.sel_position = "popup";
			cur_cid = gma.cur_cid_popup;
		}
		_wsocket.load_chatlog_sq(cur_cid, parseInt(id,10)+1);
		
	},
	
	"search_chat_sq" : function(info){
	
		var chat = info.ct.log[0];		
		gBody.cur_reply_chat_info = chat;
		var obj = new Object();
		var tchat = new Object();
		tchat.ky = gap.userinfo.rinfo.ky;
		tchat.ex = new Object();
		tchat.ex.reply = chat;
		obj.title = gBody.reply_title_setting(tchat);		
		chat.dis_msg = chat.msg;
		if (chat.ty == 6 || chat.ty == 3 || chat.ty == 5){		
			var imgsrc = "";
			if (chat.ty == 6){
				//이미지인 경우
				if (typeof(chat.ex.files) == "undefined"){
					chat.dis_msg = gap.lang.sajin;
					imgsrc = gap.getHostUrl() + "/fud" + chat.ex.sf + "/thumbnail/" + chat.ex.sn;
				}else{
					//묶음으로 발송된 경우
					if (gap.curLang = "ko"){
						chat.dis_msg = gap.lang.sajin + " " + chat.ex.files.length + "장";
					}else{
						chat.dis_msg = chat.ex.files.length + " " + gap.lang.sajin 
					}
					
					imgsrc = gap.getHostUrl() + "/fud" + chat.ex.files[0].sf + "/thumbnail/" + chat.ex.files[0].sn;
				}

			}else if (chat.ty == 5){
				chat.dis_msg = gap.lang.file + " : " + chat.msg;
			}else{
				//이모티콘인 경우					
				//imgsrc = gap.getHostUrl() + cdbpath + "/emoticons/" + chat.msg;
				imgsrc = root_path + "/resource/images/emoticons/" + chat.msg;
				chat.dis_msg = gap.lang.emoti;
			}
			obj.imgurl = imgsrc;
		}		
		

		obj.dis_msg = chat.dis_msg;
		var opt = "";
		if (gBody.sel_position == "popup"){
			opt = "alarm";
		}
		gBody.replyChatBottom(obj, opt);	
	},	
	
	"reply_title_setting" : function(chat){
		//답장을 위해서 서버에서 sq에 해당하는 데이터만 리턴해 함수 결과 표시하기 
		var title = "";
		if (typeof(chat) != "undefined"){
			var title = "";
			var reply = chat.ex.reply;
			if (chat.ky != gap.userinfo.rinfo.ky){				
				if (gap.curLang == "ko"){			
					title = reply.nm + "" + gap.lang.replytitle;
				}else if (gap.curLang == "ja"){
					title = reply.enm + "" + gap.lang.replytitle;
				}else{
					title = gap.lang.replytitle + " " + reply.enm;
				}
			}else{
				if (reply.ky == chat.ky){		
					title = gap.lang.replyme;	
				}else{
					if (gap.curLang == "ko"){
						title = reply.nm + "" + gap.lang.replytitle;
					}else if (gap.curLang == "ja"){
						title = reply.enm + "" + gap.lang.replytitle;
					}else{
						title = gap.lang.replytitle + " " + reply.enm;
					}
				}
			}
		}
		return title;
	},
	
	
	
	"msg_send" : function(id, opt, obj){
		
		
		gBody.sender = "me";
		//텍스트인지, 이미지 파일인지, 일반파일인지, 이모티콘인지	
		var sel_obj = $($("#chat_msg_dis").find("[mid="+id+"]").children().get(0));
		if ($(obj).closest(".popup_chat").length == 1){
			sel_obj = $($("#alarm_chat_sub").find("[mid="+id+"]").children().get(0));
		}
		gBody.sel_obj_opt = "1";   //1 : 텍스트, 2 : ogTag, 3 파일, 4이모티콘
		gBody.tempobj = new Object();	
		var opp = sel_obj.prev().prevObject;		
		var sender_class = $(sel_obj).parent().parent().parent().attr("class");		
		if (sender_class == "you"){
			gBody.sender = "you";
		}
		if (opp.hasClass("chat-attach") || opp.hasClass("img-content")){
			//파일
			gBody.sel_obj_opt = "3";
		}else if (opp.hasClass("grid-container")){
			//묶음 발송한 경우
			gBody.sel_obj_opt = "5";
			
		}else if (opp.hasClass("img-content2")){
			//이모티콘
			gBody.sel_obj_opt = "4"
		}else if (opp.hasClass("balloon")){
			//일반 텍스트
			gBody.sel_obj_opt = "1";
			var parentClass = $(sel_obj).parent().attr("class");		
			if (parentClass == "talk link"){
				//ogTag
				gBody.sel_obj_opt = "2";
			}
		}		
		if (gBody.sel_obj_opt == "1" || gBody.sel_obj_opt == "2"){
			//텍스트 내용을 전송할려고 한다.			
			var txHTML = "";		
			txHTML = $(sel_obj).find(".xgptcls").text();
			var sendmsg = txHTML.replace(/\<p style=\"height\:5px\"><\/p>/gi,"\n");
			//sendmsg = $(sendmsg).text();
			gBody.tempobj.sendmsg = sendmsg;			
			gBody.last_msg.msg = sendmsg;
			gBody.last_msg.ty = "msg"; 		
			var parentClass = $(sel_obj).parent().attr("class");		
			if (parentClass == "talk link"){
				//ogTag를 드래그 & 드롭한 경우			
				var obj = gBody.search_og_only_search(sendmsg);		
				gBody.tempobj.obj = obj;
				gBody.sel_obj_opt = "2"				
			}else{
				//일반 텍스트일 경우
				var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.		 					 					 				
				gBody.tempobj.msgid = msgid;
				gBody.sel_obj_opt = "1"
			}	
		}else if (gBody.sel_obj_opt == "4"){
			//이모티콘일 경우
			var date = new Date();		
			var dt = date.YYYYMMDDHHMMSS();	
			var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.	
			var obj = new Object();
			obj.ty = 3;
			obj.dt = dt;
			obj.type = "emoticon";
			var imgsrc = $(sel_obj).find("img").attr("src").split("/");
			obj.msg = imgsrc[imgsrc.length-1];			
			obj.ky = gap.userinfo.rinfo.ky;
			obj.mid = msgid;
			gBody.tempobj.obj = obj;
			gBody.sel_obj_opt = "4";			
			//목록 그릴때 사용하는 옵션 처리
			gBody.last_msg.msg = obj;
			gBody.last_msg.ty = 3; 		
		}else if (gBody.sel_obj_opt == "5"){
			//묶음 발송한 경우
			var flist = $(opp).find(".grid-item");
			
			var filename = [];
			var downloadurl = [];
			var size = [];
			var spl = "";	
			var sp6 = "";
			var inx = "";
			var md5 = [];
			var tfolder = [];
			for (var u = 0 ; u < flist.length; u++){
				var sobj = flist[u];
				var xfilename = $(sobj).attr("data");
				var xdownloadurl = $(sobj).attr("data2");
				var xsize = $(sobj).attr("data3");
				var spl = xdownloadurl.split("/");	
				var sp6 = spl[6].replace("upload_","");
				var inx = sp6.lastIndexOf(".");
				var xmd5 = sp6.substring(0, inx);
				var xtfolder = spl[5];
				
				filename.push(xfilename);
				downloadurl.push(xdownloadurl);
				size.push(xsize);
				md5.push(xmd5);
				tfolder.push(xtfolder);
			}
		}else{
			//일반 파일 또는 이미지 파일일 경우
			gBody.sel_obj_opt = "3";
			//하나씩 발송한 경우
			var filename = sel_obj.attr("data");
			var downloadurl = sel_obj.attr("data2");
			var size = sel_obj.attr("data3");
			var spl = downloadurl.split("/");	
			var sp6 = spl[6].replace("upload_","");
			var inx = sp6.lastIndexOf(".");
			var md5 = sp6.substring(0, inx);
			var tfolder = spl[5];
		}
		var type = "2";
		gBody.sel_members = [];		
		if (opt == "other"){
			//조직도에서 사용자를 선택한다.
			gap.showBlock_todo();
			window.ORG.show(
				{
					'title': gap.lang.inviteContact,
					'single':false
				}, 
				{
					getItems:function() { return []; },
					onClose : function(){
						gap.hideBlock_todo();
						//gap.hideBlock();
					},
					setItems:function(items) { /* 반환되는 Items */							
						for (var i = 0; i < items.length; i++){								
							var _res = gap.convert_org_data(items[i]);
							gBody.sel_members.push(_res);
						}
						gap.hideBlock_todo();			
						
						
						
						if (gBody.sel_members.length == 1){
							//수신자가 한명일 경우 바로 발송한다.
							var minfo = gBody.sel_members[0];								
							var uid = minfo.ky;
							var name = minfo.nm;
			 				var room_key = _wsocket.make_room_id(uid);
			 				room_key = room_key.replace(/-lpl-/gi,"_");	
			 				var exist_room = gap.chatroom_exist_check(room_key);
			 				if (exist_room == false){
			 					//기존에 채팅방이 없을 경우 방을 만들고 메시지를 보내야 한다.
			 					_wsocket.make_chatroom_11_only_make(uid, name);
			 				}				 				
							if (gBody.sel_obj_opt == "1"){
								//텍스트인 경우									
								gBody.msg_send_to_server(gBody.tempobj.msgid, gBody.tempobj.sendmsg, room_key);	
							}else if (gBody.sel_obj_opt == "2" || gBody.sel_obj_opt == "4"){
								//ogTag인 경우
								gBody.tempobj.obj.cid = room_key;
								_wsocket.send_chat_msg(gBody.tempobj.obj);
							}else if (gBody.sel_obj_opt == "3" || gBody.sel_obj_opt == "5"){
								//파일인 경우
								var members = [];
								members.push(gBody.sel_members[0]);
								gBody.send_files_chat(type, downloadurl, md5, size, filename, members, tfolder);
							}			
						}else{
							var msg = gap.lang.smmk;
							gap.showConfirm_new({
								title: gap.lang.smmk2,
								text1 : gap.lang.smmk3,
								text2 : gap.lang.smmk4,
								contents: msg,
								callback: function(e){
									//그룹 발송					
									if (gBody.sel_obj_opt == "3" || gBody.sel_obj_opt == "5"){
										//파일인 경우
										gBody.send_files_chat(type, downloadurl, md5, size, filename, gBody.sel_members, tfolder);
									}else{
										//텍스트일 경우
										var lists = [];
										var newChatroom_list = [];
										var firstkey = "";
										for (var i = 0 ; i < gBody.sel_members.length; i++){
											var user = gBody.sel_members[i];
											var user_info = gap.user_check(user);
											if (user.ky != gap.userinfo.rinfo.ky){
												lists.push(user.ky);
												var nobj = {"ky" : user.ky, "nm" : user_info.name};				
												newChatroom_list.push(nobj);	
											}		
										}		
										var owner = gap.userinfo.rinfo;
										var owner_info = gap.user_check(owner);
										lists.push(owner.ky);
										var nobj = {"ky" : owner.ky, "nm" : owner_info.name};				
										newChatroom_list.push(nobj);										
										res = gap.search_exist_chatroom_nn(lists);
										if (res == ""){
											//기존에 생성된 방이 없어 신규로 만들어야 한다.
											var cuidc = gap.search_cur_ky();	
											var d = new Date();
									        var ckey = d.YYYYMMDDHHMMSS();
											var cid = "n^" + cuidc + "^" + ckey;
											_wsocket.make_chatroom_1N_with_cid(newChatroom_list, cid);	
											res = cid;
										}
										scid = res;										
										setTimeout(function(){
											if (gBody.sel_obj_opt == "1"){
												//텍스트인 경우
												gBody.msg_send_to_server(gBody.tempobj.msgid, gBody.tempobj.sendmsg, scid);
											}else if (gBody.sel_obj_opt == "2" || gBody.sel_obj_opt == "4"){
												//ogTag인 경우
												gBody.tempobj.obj.cid = scid;
												_wsocket.send_chat_msg(gBody.tempobj.obj);
											}
										}, 1000);										
									}
								},
								callback2 : function(){					
									//개개인 발송								
									for (var k = 0 ; k < gBody.sel_members.length; k++){
										var minfo = gBody.sel_members[k];											
										var uid = minfo.ky;
		 								var name = minfo.nm;
						 				var room_key = _wsocket.make_room_id(uid);
						 				room_key = room_key.replace(/-lpl-/gi,"_");				
						 				var exist_room = gap.chatroom_exist_check(room_key);
						 				if (exist_room == false){
						 					//기존에 채팅방이 없을 경우 방을 만들고 메시지를 보내야 한다.
						 					_wsocket.make_chatroom_11_only_make(uid, name);
						 				}					 				
						 				//setTimeout(function(){
						 					if (gBody.sel_obj_opt == "1"){
												//텍스트인 경우									
												gBody.msg_send_to_server(gBody.tempobj.msgid, gBody.tempobj.sendmsg, room_key);	
											}else if (gBody.sel_obj_opt == "2" || gBody.sel_obj_opt == "4"){
												//ogTag인 경우
												gBody.tempobj.obj.cid = room_key;
												_wsocket.send_chat_msg(gBody.tempobj.obj);
											}else if (gBody.sel_obj_opt == "3" || gBody.sel_obj_opt == "5"){											
												var members = [];
												members.push(gBody.sel_members[k]);
												gBody.send_files_chat(type, downloadurl, md5, size, filename, members, tfolder);											
											}
						 				//},1000);										
									}																				
								}
							});
						}							
					}
				});
		}else{
			//나에게 전송한다.
			var msg = gap.lang.optional;
			gap.showConfirm_new({
				title: gap.lang.sendme2,
				text1 : gap.lang.Cancel,
				text2 : gap.lang.sok,
				contents: msg,
				callback: function(e){
					//나에게 전송하기 
					var room_key = _wsocket.make_room_id(gap.userinfo.rinfo.ky);					
					if (gBody.sel_obj_opt == "1"){
						//텍스트인 경우
						gBody.msg_send_to_server(gBody.tempobj.msgid, gBody.tempobj.sendmsg, room_key);
					}else if (gBody.sel_obj_opt == "2" || gBody.sel_obj_opt == "4"){
						//ogTag인 경우
						gBody.tempobj.obj.cid = room_key;
						_wsocket.send_chat_msg(gBody.tempobj.obj);
					}else if (gBody.sel_obj_opt == "3"){
						var members = [];
						members.push(gap.userinfo.rinfo);
						gBody.send_files_chat(type, downloadurl, md5, size, filename, members, tfolder);
					}else if (gBody.sel_obj_opt == "5"){
						var members = [];
						members.push(gap.userinfo.rinfo);
						gBody.send_files_chat(type, downloadurl, md5, size, filename, members, tfolder);
					}
				},
				callback2 : function(){					
					//화면 닫기 / 취소					
				}
			});
		}
	},
	
	"send_files_chat" : function(type, urls, md5s, sizes, filenames, members, tfolder){	
	
		//gBody3.send_files_chat을 참고한다.
		var owner = gap.userinfo.rinfo;
		var owner_info = gap.user_check(owner);
		var scid = "";
		var filename = "";			
		var obj = new Object();			
	
		if ($.isArray(urls) && urls.length > 1){
			//묶음 발송인 경우
			var files = [];
			for (var p  = 0 ; p < urls.length ; p++){
				var size = sizes[p];
				var md5 = md5s[p];
				var filename = filenames[p];
				var fileinfo = urls[p].split("/");	
				
				var exobj = new Object();
				exobj.nid = gap.sid;
				exobj.ty = gap.file_extension_check(filename);				
				exobj.sn = fileinfo[6];
				exobj.sf = "/" + fileinfo[5];
				tfolder = fileinfo[5];
				exobj.sz = parseFloat(size);
				exobj.nm = filename;
				
				files.push(exobj);
			}
			obj.ex = new Object();
			obj.ex.files = files;
			
		}else{
			//하나씩 발송하는 경우
			//파일의 개수만큰 전송해야 한다.
			var size = sizes;
			var md5 = md5s;
			var filename = filenames;
			var fileinfo = urls.split("/");				
			
			var exobj = new Object();
			exobj.nid = gap.sid;
			exobj.ty = gap.file_extension_check(filename);				
			exobj.sn = fileinfo[6];
			exobj.sf = "/" + fileinfo[5];
			tfolder = fileinfo[5];
			exobj.sz = parseFloat(size);
			exobj.nm = filename;
			obj.ex = exobj;			
		}
		
		var res = "";		
		if (gBody.call_open_chatroom == "T"){
			scid = gBody.cur_cid;
		}else{
			if (members.length > 1){
				//여러명일 경우
				var lists = [];
				var newChatroom_list = [];
				for (var i = 0 ; i < members.length; i++){
					var user = members[i];
					var user_info = gap.user_check(user);
					if (user.ky != gap.userinfo.rinfo.ky){
						lists.push(user.ky);
						var nobj = {"ky" : user.ky, "nm" : user_info.name};				
						newChatroom_list.push(nobj);	
					}
				}
				lists.push(owner.ky);
				var nobj = {"ky" : owner.ky, "nm" : owner_info.name};				
				newChatroom_list.push(nobj);				
				res = gap.search_exist_chatroom_nn(lists);
				if (res == ""){
					//기존에 생성된 방이 없어 신규로 만들어야 한다.
					var cuidc = gap.search_cur_ky();							
					var d = new Date();
			        var ckey = d.YYYYMMDDHHMMSS();
					var cid = "n^" + cuidc + "^" + ckey;
					_wsocket.make_chatroom_1N_with_cid(newChatroom_list, cid);	
					res = cid;
				}
				scid = res;
			}else{
				//한명일 경우				
				var lists = [];
				var mem_info = gap.user_check(members[0]);
				lists.push(members[0].ky);
				lists.push(owner.ky);
				res = gap.search_exist_chatroom_nn(lists);
				if (res == ""){
					//기존에 방이 없어 신규로 만들어야 한다.
					var cid = _wsocket.make_room_id(members[0].ky);
					_wsocket.make_chatroom_11_only_make_with_cid(members[0].ky, mem_info.nm, cid);
					res = cid;
				}
				scid = res;
			}					
		}			
		obj.mid =  gap.make_msg_id();   //랜덤한 키값을 생성한다.	
		obj.cid = scid;
		obj.msg = filename;		
		var typ = "";
		
		if (gap.check_image_file(filename)){
			obj.ty = 6;
			typ = "image";
		}else{
			obj.ty = 5;
			typ = "file";
		}			

		 if (gBody.call_open_chatroom == "T" || scid == gBody.cur_cid){
			 //채팅방에서 직접 공유하는 경우
			 var key = gap.search_cur_ky();
			 var time = gap.search_time_only();	
			 var ucnt = gBody.cur_room_att_info_list.length -1 ;
			 var msgid = obj.mid; 
			 var xdate = new Date();		
	  		 var date = xdate.YYYYMMDDHHMMSS();
	  		 
	  		 var downloadurls = [];
	  		 var previewurls = [];
	  		if ($.isArray(urls) && urls.length > 1){
	  			filename = filenames;
	  			size = sizes;
	  			for (var k = 0 ; k < urls.length; k++){
	  				var fileinfo = urls[k].split("/");	
	  				var savefilename = fileinfo[6];
					var downloadurl = gap.fileupload_server_url + "/filedown/" + tfolder + "/" + savefilename + "/" + encodeURIComponent(filename);
			  		var previewurl = gap.fileupload_server_url + "/" + tfolder + "/thumbnail/" + savefilename;
	  				downloadurls.push(downloadurl);
	  				previewurls.push(previewurl);
	  			}
	  			previewurl = previewurls;
	  			downloadurl = downloadurls;
	  			
	  		}else{
				 var savefilename = exobj.sn;
				 var downloadurl = gap.fileupload_server_url + "/filedown/" + tfolder + "/" + savefilename + "/" + encodeURIComponent(filename);
		  		 var previewurl = gap.fileupload_server_url + "/" + tfolder + "/thumbnail/" + savefilename;
	  		}	    		  
	  		 var chatroom_key = gBody.cur_cid;	  		 
			 gBody.file_draw('me', typ, key, date, time, filename, size, downloadurl, previewurl, msgid, '','D', ucnt, obj, "", chatroom_key);				 
	
			 gBody.last_msg.ty = obj.ty 
  		  	 gBody.last_msg.ex = obj;
  		  	 gBody.last_msg.downloadurl = downloadurl;		  	
		 }
		
		setTimeout(function(){
			_wsocket.send_chat_msg(obj);	
			
			setTimeout(function(){					
				 $(".pop_btn_close").click();
				 _wsocket.load_chatroom_list();	
			 }, 700);
		}, 1000);	
		 gap.hide_loading2();
		 mobiscroll.toast({message:gap.lang.f_complete, color:'info'});		
	},
	
	"delete_icon_action" : function(){
		$(".ico.btn-chat-more.on.mk").off().on("click", function(){
			gBody.delete_layer_popup("me", this);		
		});		
		$(".ico.btn-chat-more.on").off().on("click", function(){			
			gBody.delete_layer_popup("me", this);		
		});		
		$(".ico.btn-chat-more.on.other").off().on("click", function(){
			gBody.delete_layer_popup("you", this);		
		});
	},
		
	"translate_list_popup" : function(list){
		//번역팝업 띄우기				
		var language = gap.getCookie("language");
		var lang_list = "";
		if (language == "ko"){
			lang_list = JSON.parse(list.ct.lko).languages;
		}else{
			lang_list = JSON.parse(list.ct.len).languages;
		}		
		var inx = parseInt(gap.maxZindex()) + 1;				
		var html = "";
		html += "<div class='layer_wrap gathering_write_pop center' id='tran_popup' style='width: 1190px; height: 788px; z-index:"+inx+"'>";
		html += "	<div class='layer_inner set_pop global_pop'>";
		html += "		<div class='pop_btn_close' id='trans_close_btn'></div>";
		html += "		<h4>언어설정</h4>";
		html += "			<div class='global_box'>";
		html += "				<div class='global_list' id='tran_list_data'>";		
		for (var i = 0 ; i < lang_list.length; i++){
			var ko = lang_list[i].displayName;
			var en = lang_list[i].languageCode;
			html += "					<span class='global' data-name='"+ko+"' data-code='"+en+"'>"+ ko +"</span>";
		}
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";
		if (call_key != ""){
			//새창에서 호출하기 때문에 딤처리흘 전체로 처리한다..
			gap.blockall = true;
		}
		gap.showBlock();
		$(html).appendTo('body');
		var $layer = $('#wrap_manual_layer');
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
		$layer.wrap('<div id="common_work_layer" class="mu_container mu_work mu_group" style="top:-50%;"></div>');
		$("#trans_close_btn").off().on("click", function(e){
			$("#tran_popup").remove();
			gap.hideBlock();
			return false;
		});	
		$("#tran_list_data span").off().on("click", function(e){			
			var pp = $(e.currentTarget).attr("class");
			$("#tran_list_data span").removeClass("on");
			if (pp.indexOf("on") > -1){
				//기존에 선택건 제거만 한다.		
				$(".trans-box").hide();
				gBody.trans_lang = "";
				gBody.trans_title = "";
				$("#trans_box_title").html("");
			}else{
				$(e.currentTarget).addClass("on");
				var title = $(e.currentTarget).data("name");
				var code = $(e.currentTarget).data("code");
				$("#trans_box_title").html(title + " / " + code);
				$(".trans-box").show();
				gBody.trans_lang = code;
				gBody.trans_title = title;
				$("#trans_close_btn").click();				
			}		
		});
	},
	
	"_chat_eventHandler" : function(){
		gap.draw_qtip_left("#video_add_member", gap.lang.invite_videochat);
		$("#chat_config").attr("title",gap.lang.userConfig);
		$("#translate_btn").attr("title",gap.lang.trn);
		$("#chat_add_member").attr("title",gap.lang.addChatUser);
		$("#chat_new_window").attr("title",gap.lang.openNewWin);
		gBody.img_open();		
		gBody.img_open2();	
		gBody.user_profile_popup();		
		gBody.chat_att_drag_action();
		gBody.msg_drag_action();
		gBody.image_file_drag_action();		
		gBody.delete_icon_action();				
		$("#preview_download").off().on("click", function(e){
			e.preventDefault();
			gap.close_preview_download();
			return false;
		});		
		$("#translate_btn").off().on("click", function(e){
			//번역리스트를 호출한다. 웹소켓  수신후 gBody.translate_list_popup(list)을 호춯한다.
			_wsocket.translate_list();
		});		
		$("#trans_close_btn_bottom").off().on("click", function(e){
			$(".trans-box").hide();
			gBody.trans_lang = "";
			gBody.trans_title = "";
			$("#trans_box_title").html("");
		});		
		$("#chat_msg_dis .user-thumb").off().on("click", function(e){		
			var ky = $(e.target).data("key");
	        gap.showUserDetailLayer(ky);
	        return false;
		});
		$("#message_txt").focus();		
		$("#chat_msg").droppable({
			drop : function(event, ui){			
				try{					
					var droppable = $(this);
			 		var draggable = ui.draggable;
			 		var dragid = ui.draggable.attr("id");	
			 		if (draggable.hasClass("user")){
			 			//채팅창에 사용자를 드래그 & 드롭한 경우 사용자 추가로 인식한다.
			 			var x = ui.helper.clone();	 
				 		if (x.hasClass("user")){
				 			x.css({ 'top': ui.offset.top, 'left': ui.offset.left - 100 })
					 		.appendTo($(this)).fadeOut(1000).animate(x.originalPosition);
				 		}			 		
				 		//1:1에서 초대하는 경우는 신규로 방을 요청하고 해당 방으로 들어가야하고
				 		//1:N인 경우 사용자를 초대만 하면 된다.
				 		var cur_room_type = gBody.cur_cid.substring(0,1);  //현재방 key값 첫글자가 "s"면 1:1 "n" 이면 1:N이다
				 		var drag_user = $(ui.draggable).children().attr("data");
				 		var dis_drag_user = $(ui.draggable).children().attr("data4");   //한글모드에서 한글 영문 모드에서 영어를 표시하는 사용자 이름			 		
				 		if (typeof(drag_user) == "undefined"){
				 			//즐겨찾기에서 사용자 정보 가져오기
				 			drag_user = $(ui.draggable).parent().attr("data");
				 			dis_drag_user = $(ui.draggable).parent().attr("data4");
				 		}			 		
				 		var exist_check = gap.search_user_in_cur_chatroom(drag_user);
				 		if (exist_check){
				 			gap.gAlert(dis_drag_user + gap.lang.hoching + gap.lang.exist);
				 			return false;
				 		}			 		
				 		if (gap.search_is_onetoone()){
				 			//1:1이므로 1:N방을 신규로 생성하고 들어가야 한다.
				 			//현재 접속해 있는 사용자 정보를 가져온다.			 			
				 			var newChatroom_list = [];
				 			var cur_room_att = [];			 			
				 			var draguserInfo = gap.search_user_to_favorite_and_buddylist(drag_user);
				 			cur_room_att.push(draguserInfo);		 			
				 			//var name = gap.search_username(drag_user);	 
				 			var name = dis_drag_user;
				 			var nobj = {"ky" : drag_user, "nm" : name};
				 			newChatroom_list.push(nobj);			 			
				 			var att_list = gBody.cur_room_att_info_list;				 			
				 			for (var j = 0 ; j < att_list.length; j++){
				 				var xinfo = att_list[j];
				 				cur_room_att.push(xinfo);			 				
				 				var nnobj = new Object();			 			
				 				nnobj = {"ky" : xinfo.ky, "nm" : xinfo.nm};			 				
				 				newChatroom_list.push(nnobj);			 				
				 			}			 			
				 			gBody.cur_room_att_info_list = cur_room_att;
				 			_wsocket.make_chatroom_1N(newChatroom_list);				 			
				 			gBody.temp_invate_user = dis_drag_user;			 			
				 		}else if (cur_room_type == "n"){
				 			//1:N 채팅방에 추가로 사용자 초대되는 경우 신규로 방을 생성하지 않고 초대 함수만 호출한다.			 			
				 			//현재 채팅방에 등록된 사용자 리스트를 가져와서 추가된 사용자를 추가한다.
				 			var att_list = gBody.cur_room_att_info_list;
				 			var cur_room_att = [];				 			
				 			var draguserInfo = gap.search_user_to_favorite_and_buddylist(drag_user);
				 			cur_room_att.push(draguserInfo);
				 			for (var j = 0 ; j < att_list.length; j++){
				 				var xinfo = att_list[j];
				 				cur_room_att.push(xinfo);		 				
				 			}		 			
				 			//var name = gap.search_username(drag_user);
				 			var name = dis_drag_user;
				 			var no = {"ky" : drag_user, "nm" : name};
				 			var newChatroom_list = [];
				 			newChatroom_list.push(no);
				 			var obj = new Object();
				 			obj.cid = gBody.cur_cid;
				 			obj.att = newChatroom_list;
				 			_wsocket.attend_chatroom(obj);				 			
				 			gBody.cur_room_att_info_list = cur_room_att;				 						 			
				 			//사용자를 추가하는 경우이므로 채팅방 정보를 다시 로드해 줘야 한다.
							var xtim3 = setTimeout(function() {			
								_wsocket.load_chatroom_list();
								clearTimeout(xtim3);
							}, 1000);
							var msgid = gap.make_msg_id();						
							gBody.chatroom_enter_msg(dis_drag_user, "e", "", "D", msgid, "");						
				 		}	 
			 		}else if (draggable.hasClass("tmail")){		 			
			 			//메일을 드래그 & 드롭으로 이동한 경우
						//메일서버 정보, 메일 DB 정보, unid값을 가져와야 한다.					
						var ms = draggable.attr("data1");
						var mf = draggable.attr("data2");
						var unid = draggable.attr("id");
						var empno = gap.userinfo.userid;
						var lan = gap.userinfo.userLang;						
					//	var url = cdbpath + "/(agtCopyDoc)?openAgent&ms="+mailserver+"&mf="+maildbpath+"&unid="+unid+"&empno=" + empno + "&lan=" + lang;
					//	var url = "/w0.nsf/(agtCopyDoc)?openAgent&ms="+mailserver+"&mf="+maildbpath+"&unid="+unid+"&empno=" + empno + "&lan=" + lang;
						var url = gap.make_mail_url(ms, mf, unid, empno, lan);
						$.ajax({
							type : "GET",
							dataType : "json",
							xhrFields: {
								withCredentials: true	
							},
							contentType : "application/json; charset=utf-8",
							url : url,
							success : function(res){								
								var cid = gBody.cur_cid;								
								var sendObj = new Object();
								sendObj.target_uid = "";	
								sendObj.room_code = res;
								sendObj.direct = "T";   //옵션이 T인 경우 대화창에 내용을 바로 입력해야 주어야 한다.
								sendObj.from = "mail";																					
								gBody.send_invite_msg(sendObj, cid);								
							},
							error : function(e){
								gap.gAlert(gap.lang.errormsg);
								return false;
							}
						})			 			
			 		}else if (draggable.hasClass("chat_img") ||
			 				draggable.hasClass("chat_img2") ||
			 				draggable.hasClass("chat_file")	 				
			 				){			 			
			 			
			 		
			 
			 				var room_key = gBody.cur_cid;				 			
				 			gBody.file_drag_room_id = room_key;			 			
				 		//	var roomlists = gap.chat_room_info.ct;
				 			var select_room_info = "";				 			
				 			var msg = gap.lang.opt;		
				 			gap.showConfirm({
				 				title: "Confrim",
				 				contents: msg,
				 				callback: function(){
				 				//확인을 클릭한 경우	
		 							
				 				var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.																				 					 				
	 								
 								var obj = new Object();			 								
 								var filename = $(draggable).attr("data");
 								if (filename != undefined){
 									filename = filename.replace("'","`");
 								}
 								var downloadurl = $(draggable).attr("data2");
 								var size = $(draggable).attr("data3");
 								var previewurl = "";
 								var ty = "";
 								//채팅창 안에서 드래그한 파일 또는 이미지일 경우 		
 								
 								var ismultiImage = false;
 								var multiID = "";
 								if (draggable.hasClass("chat_img2") || draggable.hasClass("chat_img") ){
 									
 									obj.ty = 6;
 									filename = $(draggable.html()).find("img").attr("data1");
 									downloadurl = $(draggable.html()).find("img").attr("data2");
 									previewurl = $(draggable.html()).find("img").attr("src");
 									size = $(draggable.html()).find("img").attr("data3");
 									ty = "image";
 									var pkn = $(draggable.html()).find(".submulti");
 									if (pkn.length > 0){
 										//묶음 전송된 이미지를 드래그 & 드롭으로 전송하는 경우임
 										ismultiImage=true;
 										multiID = pkn.attr("id").split("_")[1];
 									}
 								}else if (draggable.hasClass("chat_file")){
 									ty = "file";
 									obj.ty = 5;
 									filename = $(draggable).find("span").attr("data1");
 									downloadurl = $(draggable).find("span").attr("data2");
 									size = $(draggable).find("span").attr("data3");
 								}			
 								obj.msg = filename;
 								obj.cid = room_key;
 								obj.mid = msgid; 										 								 
 								var exobj = new Object();		    	 		    	 
 								exobj.nid = gap.sid;
 								exobj.ty = gap.file_extension_check(filename);								
 								
 								var fnames = [];
 								var fsizes = [];
 								var fdownloads = [];
 								if (ismultiImage){
 									//이미지 묶믕한 이미지 파일들의 정보를 수집한다.
 									for (var k = 0 ; k < gBody.tMultiImages.length; k++){
 										var ipm = gBody.tMultiImages[k];
 										if (ipm.sq == multiID){
 											obj.ex = ipm.ex;
 											
 											for (var u = 0 ; u < obj.ex.files.length; u++){
 												var pkitem = obj.ex.files[u];
 												
 												fnames.push(pkitem.nm);
 												fsizes.push(pkitem.sz);
 												var downloadurl = gap.fileupload_server_url + "/filedown" + pkitem.sf + "/" + pkitem.sn + "/" + encodeURIComponent(pkitem.nm);
 												fdownloads.push(downloadurl);
 											}
 											break;
 										}
 									} 									
 								}else{
 	 								var spl = downloadurl.split("/");			 								 
 	 								exobj.sn = spl[6];
 	 								exobj.sf = "/" + spl[5];
 	 								exobj.sz = parseFloat(size);
 	 								exobj.nm = filename;
 	 								obj.ex = exobj;	
 								} 								
							
								//드래그하는 상황에 현재 창이 동일한 창이면 파일을 그려 준다.
								var key = gap.search_cur_ky();
						    	var time = gap.search_time_only();						    	  
						    	var xdate = new Date();		
						  		var date = xdate.YYYYMMDDHHMMSS();
						  		filename = filename.replace("'","`");						  		 
						  		var ucnt = gBody.cur_room_att_info_list.length -1 ;					  		
						  		if (ty == "file"){
						  			gBody.file_draw('me', ty, key, date, time, filename, size, downloadurl, previewurl, msgid, '','D', ucnt, "", "",room_key);	
						  		}else{
						  			if (ismultiImage){
						  				gBody.file_draw('me', ty, key, date, time, fnames, fsizes, fdownloads, previewurl, msgid, '','D', ucnt, "", "",room_key);	
						  			}else{
						  				gBody.file_draw('me', ty, key, date, time, filename, size, downloadurl + "/" + encodeURIComponent(filename), previewurl, msgid, '','D', ucnt, "", "",room_key);	
						  			}
						  			
						  		}						  		 
						  	
						  		gBody.check_display_layer(); 								 	 								 
 								gBody.last_msg.ty = obj.ty 
 								gBody.last_msg.ex = obj;
 								gBody.last_msg.downloadurl = downloadurl;								 											 								 					 								
 								//파일 전송 처리하기 그래프
 								gBody.process_display2(droppable, obj, "scroll");
				 				}
				 			}); 			
			 		}		 		
			 		return false;		        
				}catch(e){} 		
			},
			hoverClass: ".chat-area.drop-area",
		//	accept: "div.user", 
	    	classes: {
				"ui-droppable-active": "chat-area drop-area"
	        }
		});	
	},	
	
	"addmember_chatroom" : function(){
		//채팅방에서 사용자 검색해서 추가하는 경우			
	//	var search_result = $("#addUser_frame").find(".member-profile");
		var search_result = $("#search_result_diss .result-profile");
		var list = new Array();
		for (var i = 0 ; i < search_result.length; i++){
			var info = search_result[i];			
		//	var usr = $(info).attr("data");
			var usr = $(info).attr("id").replace("result_","");
			list.push(usr);				
		}	
		_wsocket.search_user_addmember(list);
	},
	
	"addmember_chatroom_after_search" : function(lists){
		var res = lists.ct.rt;		
		var newChatroom_list = [];
		var newChatroom_list2 = [];
		var cur_room_att = [];		
		var name = "";		
		for (var i = 0 ; i < res.length; i++){
			var user = res[i];			
			var uinfo = gap.cur_room_att_info_list_search(user.ky);	
			if (uinfo == null){
				cur_room_att.push(user);				
				if (name == ""){
					name = user.nm;
				}else{
					name += "-spl-" + user.nm;
				}				
				var nobj = {"ky" : user.ky, "nm" : user.nm};
				newChatroom_list.push(nobj);				
				if (!gap.search_is_onetoone()){
					//1:N의 경우 초대된 사용자를 그려준다.					
					var msgid = gap.make_msg_id();				
					if (gap.cur_el == user.el){
						gBody.chatroom_enter_msg(user.nm, "e", "", "D", msgid, "");
					}else{
						gBody.chatroom_enter_msg(user.enm, "e", "", "D", msgid, "");
					}								
				}	
			}					
		}	
		//현재방에 등록된 사용자 정보 추가
		var att_list = gBody.cur_room_att_info_list;		
		for (var j = 0 ; j < att_list.length; j++){
			var xinfo = att_list[j];		
			cur_room_att.push(xinfo);			
			var nnobj = new Object();
			nnobj = {"ky" : xinfo.ky, "nm" : xinfo.nm};
			newChatroom_list.push(nnobj);	 				
		}	
		gBody.cur_room_att_info_list = cur_room_att;		
		var nlist = lists.ct.rt;
		for (var k = 0 ; k < nlist.length; k++){
			var xinfo2 = nlist[k];	
			var nnobj = new Object();
			nnobj = {"ky" : xinfo2.ky, "nm" : xinfo2.nm};
			newChatroom_list2.push(nnobj);			
		}		
		if (gap.search_is_onetoone()){
			//현재 채팅방이 1:1인 경우
			gBody.temp_invate_user = name;
			_wsocket.make_chatroom_1N(newChatroom_list);			
		}else{
			//현재 채팅방이 1:N인 경우
			var obj = new Object();
			obj.cid = gBody.cur_cid;
		//	obj.att = newChatroom_list;
			obj.att = newChatroom_list2;
			_wsocket.attend_chatroom(obj);		
			gBody.cur_room_att_info_list = cur_room_att;				
			//사용자를 추가하는 경우이므로 채팅방 정보를 다시 로드해 줘야 한다.
			var xtim4 = setTimeout(function() {			
				_wsocket.load_chatroom_list();
				clearTimeout(xtim4);
			}, 1000);		
		}	
		gap.scroll_move_to_bottom_time("chat_msg", 10);
		//$("#search_window_close").click();
	},
	
	"makeroom" : function(){
		//채팅방을 만든다.				
		//대상용으로 신규 작성한다.
		var search_result = $("#search_result_diss .result-profile");		
		var list = new Array();
		for (var i = 0 ; i < search_result.length; i++){
			var info = search_result[i];
			list.push($(info).attr("id").replace("result_",""))
		}
		list.push(gap.search_cur_ky());
		_wsocket.search_user_makeroom(list);	
	},	
	
	"makeroom_video" : function(){
		//채팅방을 만든다.	
		var search_result = $("#addUser_frame").find(".member-profile");		
		if (search_result.length == 1){
			var info = search_result[0];
			if ($(info).attr("data") == gap.search_cur_ky()){
				return false;
			}
		}	
		var video_chat_room_key = gap.userinfo.rinfo.id + "_" + gBody.make_video_roomkey();		
		var list = new Array();
		for (var i = 0 ; i < search_result.length; i++){
			var info = search_result[i];
			var uid = $(info).attr("data");						
			var sendObj = new Object();
			sendObj.target_uid = uid;	
			sendObj.room_code = video_chat_room_key;		
			gBody.send_invite_msg(sendObj, "");		
		}
		//본인은 채팅창을 바로 띄운다.
		gBody.open_video_popup("T", video_chat_room_key);					
	},
	
	"makeroom_after_search" : function(lists){		
		var res = lists.ct.rt;		
		var newChatroom_list = [];
		var cur_room_att = [];
		var otherman = "";		
		var otherman_name = "";
		var cky = gap.search_cur_ky();		
		var name = "";
		var oneUserkey = "";		
		for (var i = 0 ; i < res.length; i++){
			var user = res[i];
			cur_room_att.push(user);			
		//	if (gap.search_cur_ky() != user.ky){
				if (name == ""){
					name = user.nm;
				}else{
					name += "-spl-" + user.nm;
				}
		//	}			
			var nobj = {"ky" : user.ky, "nm" : user.nm};
			newChatroom_list.push(nobj);			
			if (user.ky != cky){
				otherman = user.ky;
				otherman_name = user.nm;
			}
		}		
		if (otherman == ""){
			otherman = cky;
		}		
		gBody.cur_room_att_info_list = cur_room_att;	
		if (res.length > 2){
			//1:N채팅방을 생성한다.
			gBody.temp_invate_user = name;
			_wsocket.make_chatroom_1N(newChatroom_list);
		}else{
			//1:1채팅방을 생성한다.
			name = otherman_name;
			gBody.temp_invate_user = name;
			var room_key = _wsocket.make_room_id(otherman);
	
			gBody.enter_chatroom_for_chatroomlist(room_key, otherman, name);
		//	gBody.enter_onetoone_chatroom(otherman);				
		}		
	},
		
	"chatroom_info_change_last_msg_receive" : function(info){
		//메시지가 수신된 경우		
		var curroom_id = info.cid;
		//var rid = curroom_id.replace(/\^/gi,"_").replace(".","-spl-");
		var rid = gap.encodeid(curroom_id);
		var tm = gap.change_date_localTime_only_time(info.dt.toString());		
		if (info.ty == 5 || info.ty == 6){
			var fname = info.ex.nm;
			var url = gap.search_fileserver(info.ex.nid);			
			var downloadurl = url+ "/filedown" + info.ex.sf + "/" + info.ex.sn + "/" + encodeURIComponent(fname);			 
			$("#chat_time_" + rid).text(tm);		
			$("#li_time_main_" + rid).text(tm);
			var html = gBody.chatroom_last_msg_file_dis(fname, downloadurl, "");					
			var html2 = gBody.chatroom_last_msg_file_dis(fname, downloadurl, "main");
			$("#li_msg_main_" + rid).html(html2);			
			if ($("#chat_msg_" + rid).next().attr("class") == "nav-attach"){
				$("#chat_msg_" + rid).next().remove();
			}			
			$("#chat_msg_" + rid).html("");
			$("#chat_msg_" + rid).html(html);
		}else if (info.ty == 3){			
			wty = 3 ;						
			$("#chat_time_" + rid).text(tm);		
			$("#li_time_main_" + rid).text(tm);		
			var emoticon_img = "<img style=' height:35px' src='/resource/images/emoticons/"+info.msg+"' alt=''>";
			$("#li_msg_main_" + rid).html(emoticon_img);		
			if ($("#chat_msg_" + rid).next().attr("class") == "nav-attach"){
				$("#chat_msg_" + rid).next().remove();
			}	
			$("#chat_msg_" + rid).html(emoticon_img);	
		}else{
			$("#chat_time_" + rid).text(tm);		
			$("#li_time_main_" + rid).text(tm);
			if ($("#chat_msg_" + rid).next().attr("class") == "nav-attach"){
				$("#chat_msg_" + rid).next().remove();
			}			
			if (info.ty == 4){
				$("#chat_msg_" + rid).html(info.msg.autoLink({target:"_blank"}));
				$("#li_msg_main_" + rid).html(info.msg.autoLink({target:"_blank"}));
			}else{
				$("#chat_msg_" + rid).html(info.msg);
				$("#li_msg_main_" + rid).html(info.msg);
			}			
		}		
		var chatroom_list = gap.chat_room_info.ct;
		for (var i = 0 ; i < chatroom_list.length; i++){
			var cinfo = chatroom_list[i];
			if (cinfo.cid == curroom_id){
				cinfo.wsq = info.sq;
				cinfo.wty = info.ty;
				cinfo.wky = info.ky;				
				cinfo.wmsg = info.msg;	
				cinfo.wdt = info.dt;
				break;			
			}
		}		
		gBody.last_msg = new Object();
	},
	
	"chatroom_last_msg_file_dis" : function(fname, downloadurl, opt){		
		var ico = gap.file_icon_check(fname);
		var show_video = gap.file_show_video(fname);		
		var html = "";
		if (show_video){
			html += "<dd class='nav-attach' >";	
			html += "<span onclick=\"gap.show_video('"+downloadurl+"', '"+fname+"')\" title='"+gap.lang.pv+"'>";
			html += "<span class='ico ico-attach "+ico+"'></span>";
			html += fname;
			html + "</span>"
			html += "<button class='ico btn-download' onclick=\"gap.file_download_video('"+downloadurl+"', event)\">저장</button>";
			html += "</dd>";
		}else if (ico == "img"){
			html += "<dd class='nav-attach' >";	
			html += "<span onclick=\"gap.show_image('"+downloadurl+"', '"+fname+"')\" title='"+gap.lang.pv+"'>";
			html += "<span class='ico ico-attach "+ico+"'></span>";
			html += fname;
			html += "</span>";
			html += "<button class='ico btn-download' onclick=\"gap.file_download_video('"+downloadurl+"', event)\">저장</button>";
			html += "</dd>";
		}else{			
			html += "<dd class='nav-attach' >";		
			html += "<span class='ico ico-attach "+ico+"'></span>";
			html += fname;
			html += "<button class='ico btn-download' onclick=\"gap.file_download('"+downloadurl+"')\">저장</button>";
			html += "</dd>";	
		}			
		return html;
	},	
		
	"chatroom_info_change_last_msg" : function(sq, id, obj){
		
		//내가 입력한 경우			
		//메시지가 수신될때 값을 잘못 세팅해서 현재 열려 있는 채팅방 정보를 잘못 변경하는 오류로 수신된 메시지가 다른 대화방에 메시지가 표시되는 문제 핵결 2022.03.21
		//chatroom_info_change_last_msg를 호출하는 곳에서 원래 인자로 sq만 넘겼는데 roomid까지 같이 넘기는 형태로 변경해서 
		//동시에 수신되는 데이터에 대한 개별 처리를 가능하게 변경함
		var curroom_id = id;	
		var exit = gap.search_chat_info_cur_chatroom(curroom_id);
		//좌측메뉴 전체 에서 찾아야 한다. 
		var exit2 = $("#left_roomlist_sub #" + gap.encodeid(curroom_id)).length;
		
		// 퀵채팅 리스트도 체크한다
		if ($('#quick_alarm_wrap').hasClass('show')){
			exit2 += $('#alarm_list_sub').find('[data-key="'+gap.encodeid(curroom_id)+'"]').length;
		}
		
		if ( typeof(exit) == "undefined" || exit2 == 0){
			//	if (gap.cur_window == "chat"){
			//다른 창을 보고 있어도 재정리되어야 여기로 들어올때 신규를 확인 할 수 있다.
				_wsocket.load_chatroom_list();
		//	}			
		}else{
		//	var rid = curroom_id.replace(/\^/gi,"_").replace(".","-spl-");
			var rid = gap.encodeid(curroom_id);
			msginfo = gBody.last_msg;		
			var xdate = new Date();	
			var tm = xdate.HHMM();		
			var wty = "";
			if (msginfo.ty == "msg"){
				//일반 텍스트 문구일 경우
				//화상회의 요청의 경우 텍스트가 별도로 처리되어 예외처리해 준다.
				var msg = msginfo.msg;
				if (id.indexOf("10139992") > -1){
					msg = gBody.receive_elephant;
				}
				if (msg.indexOf("gBody.enter_video_room") >-1){
					msg = gap.lang.call_attend;
				}
				wty = 1 ;						
				$("#chat_time_" + rid).text(tm);		
				$("#li_time_main_" + rid).text(tm);		
				$("#chat_time_popup_" + rid).text(tm);
				
				$("#li_msg_main_" + rid).html(msg);
				
				if ($("#chat_msg_" + rid).next().attr("class") == "nav-attach"){
					$("#chat_msg_" + rid).next().remove();
				}			
				$("#chat_msg_" + rid).html(msg);	
				$("#chat_msg_icon_popup_" + rid).removeClass();
				$("#chat_msg_popup_" + rid).html(msg);				
			}else if (msginfo.ty == 2){
				//시스템 메시지 인 경우
			}else if (msginfo.ty == 3){
				//이모티콘인 경우			
				wty = 3 ;						
				$("#chat_time_" + rid).text(tm);	
				$("#chat_time_popup" + rid).text(tm);	
				$("#li_time_main_" + rid).text(tm);			
				var emoticon_img = "<img style=' height:35px' src='/resource/images/emoticons/"+msginfo.msg.msg+"' alt=''>";
				$("#li_msg_main_" + rid).html(emoticon_img);				
				if ($("#chat_msg_" + rid).next().attr("class") == "nav-attach"){
					$("#chat_msg_" + rid).next().remove();
				}	
				$("#chat_msg_" + rid).html(emoticon_img);	
				$("#chat_msg_icon_popup_" + rid).removeClass();
				$("#chat_msg_popup_" + rid).html(emoticon_img);				
			}else if (msginfo.ty == 4){
				//ogTag인 경우
				wty = 4 ;			
				$("#chat_time_" + rid).text(tm);	
				$("#chat_time_popup" + rid).text(tm);
				$("#li_time_main_" + rid).text(tm);			
				$("#li_msg_main_" + rid).html(msginfo.msg.autoLink({target:"_blank"}));				
				if ($("#chat_msg_" + rid).next().attr("class") == "nav-attach"){
					$("#chat_msg_" + rid).next().remove();
				}	
				$("#chat_msg_" + rid).html(msginfo.msg.autoLink({target:"_blank"}));			
				$("#chat_msg_icon_popup_" + rid).removeClass();
				$("#chat_msg_popup_" + rid).html(msginfo.msg);
			}else if (msginfo.ty == 6 || msginfo.ty == 5){
				//이미지 파일일 경우
				wty = msginfo.ty;		
				$("#chat_time_" + rid).text(tm);	
				$("#chat_time_popup_" + rid).text(tm);
				$("#li_time_main_" + rid).text(tm);			
			//	var downloadurl = msginfo.downloadurl;	
				
				if (typeof(msginfo.ex.ex.files) != "undefined"){
					msginfo.ex.ex = msginfo.ex.ex.files[0];
				}
				
				var fname = msginfo.ex.ex.nm;			
				var url = gap.search_fileserver(msginfo.ex.ex.nid);					
				var downloadurl = url+ "/filedown" + msginfo.ex.ex.sf + "/" + msginfo.ex.ex.sn + "/" + encodeURIComponent(fname);			
				var html = gBody.chatroom_last_msg_file_dis(fname, downloadurl, "");
				var html2 = gBody.chatroom_last_msg_file_dis(fname, downloadurl, "main");
				$("#li_msg_main_" + rid).html(html2);				
				if ($("#chat_msg_" + rid).next().attr("class") == "nav-attach"){
					$("#chat_msg_" + rid).next().remove();
				}			
				$("#chat_msg_" + rid).html("");
				$("#chat_msg_" + rid).after(html);			
				$("#chat_msg_popup_" + rid).html("&nbsp;" + fname);
				var ico = gap.file_icon_check(fname);				
				$("#chat_msg_icon_popup_" + rid).removeClass();
				var cln = "ico ico-attach "+ico;
				$("#chat_msg_icon_popup_" + rid).addClass(cln);
				
				//퀵채팅 마지막 메시지 설정을 위해서 여기서 설정해 준다.
				gap.last_msg_file_change(curroom_id, msginfo.ex);
			}
			var chatroom_list = gap.chat_room_info.ct;
			for (var i = 0 ; i < chatroom_list.length; i++){
				var cinfo = chatroom_list[i];
				if (cinfo.cid == curroom_id){
					cinfo.wsq = parseFloat(sq);
					cinfo.wty = wty;
					cinfo.wky = gap.search_cur_ky();
					if (typeof(obj.msg) == "undefined"){
						cinfo.wmsg = msginfo.msg;
					}else{
						cinfo.wmsg = obj.msg;
					}
					cinfo.wdt =  obj.dt; //gap.change_date_localTime_full(String(obj.dt)); //+ "000";					
					break;
				}
			}	
			gBody.last_msg = new Object();		
			if (gBody.searchMode_draw != "T"){
				gBody.refresh_chatroom(id);	
			}				
		}			
	},
	
	"file_down_chatroom" : function(url){
		location.href = url;
		return false;
	},
		
	"draw_chat_room_members" : function(attender){	

		if (typeof(attender) != "undefined"){
			//attender정보가 있는 경우는 신규로 해당 방에 참석자가 들어온 경우라 신규 참석자 표시를 해주어야 한다.
			var name = attender.ct.att[0].nm;
			sq = attender.ct.cid.replace(/\^/, "_") + "_" + attender.ct.dt;
			gBody.chatroom_enter_msg(name, "e", "", "D", sq, "", attender.ct.cid);		
		}
		
		gBody.unload_img = "";			
		var list = gBody.cur_room_att_info_list;		
		if (call_key != ""){
			list = window.opener.gBody.cur_room_att_info_list
		}
			
		gBody.cur_room_att_info_list_temp = list;		
		//최사자 처리 루틴 추가한다.
		var rlist = gap.delete_user_set(list);
		list = rlist;	
		var list_out_me = new Array();		
		var lists = new Array();
		for (var k = 0; k < list.length; k++){
			var xinfo = list[k];
			if (xinfo.ky != gap.search_cur_ky()){				
				var cky2 = xinfo.ky;
				lists.push(cky2);				
				list_out_me.push(xinfo);			
			}			
		}		
		//채팅방 사용자 상태 요청한다.
		//lists : 대상자 ky값 / opt 등록 : 1, 종료 : 2 / ty : 어디서 호출한 것인지 등록해서 나중에 판단 기준으로 사용한다.
	//	_wsocket.temp_list_status(lists, 1, "chatroom");		
		list_out_me = sorted=$(list_out_me).sort(gap.sortNameDesc);		
		var len = list_out_me.length;
		var imgcount = $("#image_tcount").text();
		var fcount = $("#file_tcount").text();		
		var bbn = 0;
		var btn_dis = false;
		if (len == 2) {			
			bbn = len - 2;
			len = 2;
			btn_dis = true;
		}else if (len > 2) {			
			bbn = len - 2;
			len = 2;
			btn_dis = true;
		}		
		var html = "";		
		html += "	<h2>"+gap.lang.chatm
		html += "<span style='color:#005295'> ("+(list_out_me.length+1)+ "" + gap.lang.myung +")</span> ";		
		if (list_out_me.length > 0){
			html += "<button id='members_fnc' class='ico btn-more'>더보기</button>";
		}		
		html += "</h2>";			
		html += "<div class='office_part' style='height:336px; margin-top:20px' >";
		html += "	<div class='o_p_list' style='height:380px; overflow:hidden; padding: 0 0 0 15px' id='memberframe'>";
		html += "";		
		members = sorted=$(list_out_me).sort(gap.sortNameDesc);
		var user_info = gap.user_check(gap.userinfo.rinfo);		
		var jt = user_info.jt;
		if (typeof(jt) == "undefined"){
			jt = "";
		}	
		html += "		<div class='office_mem_card' style='margin:5px 15px 0px 4px' id='member_list_"+user_info.ky+"'>";
		html += "			<div class='office_prof user'>";
		html += '				<div class="photo-wrap" style="background-image:url(' + gap.person_photo_url(user_info) + '),url(../resource/images/none.jpg);"></div>'
		html += "				<span data-status='status_"+user_info.ky+"' class='status ' style='top:6px; left:7px'></span>";
		html += "				<button data-phone='phone_"+user_info.ky+"' type='button' style='position:absolute'></button>";
		html += "			</div>";
		html += "			<div class='office_right' style='width: 64%;'>";
		html += "				<div class='office_mem_name'>";
		html += "					<span data-day='day_"+user_info.ky+"' style='display:none'></span>";
		html += "					"+user_info.name+"";
		html += "					<span class='rank'>"+user_info.jt+"</span>";
		html += "				</div>";
		html += "				<div class='office_mem_info'>";
		html += "					<p>"+user_info.dept+"</p>";
		html += "					<p class='company'>"+user_info.company+"</p>";
		html += "				</div>";
		html += "			</div>";
		html += "			<div class='abs hover-box'>";
		html += "				<div class='inner f_between f_middle'>";
		html += "					<span class='ico ico-chat' title='"+gap.lang.startChat+"' data-name='"+user_info.name+"' data-key='"+user_info.ky+"' >채팅</span>";
	//	if (use_tel == "1"){
			html += "					<span class='ico ico-phone' data-ky='"+user_info.ky+"'  title='"+gap.lang.mobile+"' >전화</span>";
	//	}				
		html += "					<span class='ico ico-profile' data-ky='"+user_info.ky+"' title='"+gap.lang.openprofile+"' >프로필</span>";
		html += "				</div>";		
		html += "			</div>";
		html += "		</div>";		
		for (var i = 0 ; i < len; i++){
			var member = members[i];			
			lists.push(member.ky);			
			var user_info = gap.user_check(member);			
			var jt = user_info.jt;
			if (typeof(jt) == "undefined"){
				jt = "";
			}			
			var ky = user_info.ky;			
			var ex = user_info.email.replace("@","").replace(" ","");			
			html += "		<div class='office_mem_card' style='margin:5px 15px 0px 4px' id='member_list_"+ky+"'>";
			html += "			<div class='office_prof user'>";
		//	html += "				<div class='owner-thumb'>"+user_info.user_img+"</div>";
			html += '				<div class="photo-wrap" style="background-image:url(' + gap.person_photo_url(member) + '),url(../resource/images/none.jpg);"></div>'
			html += "				<span data-status='status_"+user_info.ky+"' class='status ' style='top:6px; left:7px'></span>";
			html += "				<button data-phone='phone_"+user_info.ky+"' type='button' style='position:absolute'></button>";
			html += "			</div>";
			html += "			<div class='office_right' style='width: 64%;'>";
			html += "				<div class='office_mem_name'>";
			html += "					<span data-day='day_"+user_info.ky+"' style='display:none'></span>";
			html += "					"+user_info.name+"";
			html += "					<span class='rank'>"+user_info.jt+"</span>";
			html += "				</div>";
			html += "				<div class='office_mem_info'>";
			html += "					<p>"+user_info.dept+"</p>";
			html += "					<p class='company'>"+user_info.company+"</p>";
			html += "				</div>";
			html += "			</div>";
			html += "			<div class='abs hover-box'>";
			html += "				<div class='inner f_between f_middle'>";
			html += "					<span class='ico ico-chat' title='"+gap.lang.startChat+"' data-name='"+user_info.name+"' data-key='"+user_info.ky+"' >채팅</span>";
	//		if (use_tel == "1"){
				html += "					<span class='ico ico-phone' data-ky='"+user_info.ky+"'  title='"+gap.lang.mobile+"' >전화</span>";
	//		}				
			html += "					<span class='ico ico-profile' data-ky='"+user_info.ky+"' title='"+gap.lang.openprofile+"' >프로필</span>";
			html += "				</div>";		
			html += "			</div>";
			html += "		</div>";			
		}		
		if (list_out_me.length > 2){
			html += "				<button type='button' style='margin-top:15px' class='more_btn more_btn_open' onclick=\"gBody.all_list();\"><span class='ico'></span>더보기 ("+bbn+" " + gap.lang.myung +")</button>";
		}		
		html += "	</div>";
		html += "</div>";					
		$("#chat_profile_view").hide();
		$("#chat_profile_view").removeClass("your-info");
		$("#chat_profile_view").addClass("member-info");
		$("#chat_profile_view").html(html).fadeIn(1000);		
		gap.draw_qtip_left(".ico.btn-chat", gap.lang.startChat);
		gap.draw_qtip_left(".ico.btn-mail", gap.lang.sendmail);
		gap.draw_qtip_left(".ico.btn-message", gap.lang.sendNotificatioin);		
		$("#members_fnc").off().on("click", function(){			
			var html = "";
			html += "<div class='layer layer-menu opt-enter' id='member_list_opt'>";
			html += "<ul>";		
			html += "<li style='padding-left : 10px !important' onclick='gBody.all_send_opt(1)'>"+gap.lang.allsend+"</li>";
			html += "<li style='padding-left : 10px !important' onclick='gBody.all_send_opt(2)'>"+gap.lang.allmemo+"</li>";			
			html += "</ul>";
			html += "</div>";			
			$("#members_fnc").qtip({
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
					tip : false
				},
				position : {
					my : 'top right',
					at : 'bottom left',
					//target : $(this)
					adjust: {
					  x: 10,
					  y: 5
					}
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
		gBody._event_set_member();		
		//상태값을 검사한다.
		var opt = 1;
		var ty = "channel";

		gap.status_check(lists, opt, ty);	
	},
	
	"all_list" : function(){		
		if (call_key != ""){			
		}else{
			$(".left-area").css("width", "calc(100% - "+gap.right_page_width+")");
		}
		gap.show_content("ext");		
		var list = gBody.cur_room_att_info_list_temp;		
		//퇴사자 처리 루틴 추가한다.
		var rlist = gap.delete_user_set(list);
		list = rlist;		
		list = sorted=$(list).sort(gap.sortNameDesc);		
		var slist = [];
		for (var i = 0 ; i < list.length; i++){
			slist.push(list[i].ky);
		}		
		var html = "";		
		html += "<div class='member-info total-member' style='height:calc(100% - 20px)'> ";					
		html += "	<h2 style='margin-left:15px'>"+gap.lang.chatm+"<span style='color:#005295'> ("+(list.length)+ "" + gap.lang.myung +")</span>";
		if (list.length > 0){
			html += "<button id='members_fnc' class='ico btn-more' style='right:-9px'>더보기</button>";
		}		
		html += "</h2>";
		html += "	<button class='ico btn-right-close' style='display:none' id='list_layer_close'>닫기</button>";				
		html += "<div class='office_part' style='height:calc(100% - 55px); margin-top:20px' >";
		html += "	<div class='o_p_list' style='height:calc(100% - 10px); overflow-y:auto; padding: 0 0 0 10px' id='memberframe'>";
		////////////////////// 나의 정보 표시 //////////////////////////////////////
		var user_info = gap.user_check(gap.userinfo.rinfo);			
		var ky = user_info.ky;			
		var ex = user_info.email.replace("@","").replace(" ","");			
		html += "		<div class='office_mem_card' style='margin:5px 5px 0px 4px' id='member_list_"+ky+"'>";
		html += "			<div class='office_prof user'>";
	//	html += "				<div class='owner-thumb'>"+user_info.user_img+"</div>";
		html += '				<div class="photo-wrap" style="background-image:url(' + gap.person_photo_url(user_info) + '),url(../resource/images/none.jpg);"></div>'
		html += "				<span data-status='status_"+user_info.ky+"' class='status ' style='top:6px; left:7px'></span>";
		html += "				<button data-phone='phone_"+user_info.ky+"' type='button' style='position:absolute'></button>";
		html += "			</div>";
		html += "			<div class='office_right' style='width: 64%;'>";
		html += "				<div class='office_mem_name'>";
		html += "					<span data-day='day_"+user_info.ky+"' style='display:none'></span>";
		html += "					"+user_info.name+"";
		html += "					<span class='rank'>"+user_info.jt+"</span>";
		html += "				</div>";
		html += "				<div class='office_mem_info'>";
		html += "					<p>"+user_info.dept+"</p>";
		html += "					<p class='company'>"+user_info.company+"</p>";
		html += "				</div>";
		html += "			</div>";
		html += "			<div class='abs hover-box'>";
		html += "				<div class='inner f_between f_middle'>";
		html += "					<span class='ico ico-chat' title='"+gap.lang.startChat+"' data-name='"+user_info.name+"' data-key='"+user_info.ky+"' >채팅</span>";
	//	if (use_tel == "1"){
			html += "					<span class='ico ico-phone' data-ky='"+user_info.ky+"'  title='"+gap.lang.mobile+"' >전화</span>";
	//	}				
		html += "					<span class='ico ico-profile' data-ky='"+user_info.ky+"' title='"+gap.lang.openprofile+"' >프로필</span>";
		html += "				</div>";		
		html += "			</div>";
		html += "		</div>";
		//////////////////////////////////////////////////////////////////////		
		members = sorted=$(list).sort(gap.sortNameDesc);			
		for (var i = 0 ; i < list.length; i++){
			var member = members[i];				
			if (gap.search_cur_ky() != member.ky){
				var user_info = gap.user_check(member);					
				var ky = user_info.ky;			
				var ex = user_info.email.replace("@","").replace(" ","");					
				html += "		<div class='office_mem_card' style='margin:5px 5px 0px 4px' id='member_list_"+ky+"'>";
				html += "			<div class='office_prof user'>";
			//	html += "				<div class='owner-thumb'>"+user_info.user_img+"</div>";
				html += '				<div class="photo-wrap" style="background-image:url(' + gap.person_photo_url(member) + '),url(../resource/images/none.jpg);"></div>'
				html += "				<span data-status='status_"+user_info.ky+"' class='status ' style='top:6px; left:7px'></span>";
				html += "				<button data-phone='phone_"+user_info.ky+"' type='button' style='position:absolute'></button>";
				html += "			</div>";
				html += "			<div class='office_right' style='width: 64%;'>";
				html += "				<div class='office_mem_name'>";
				html += "					<span data-day='day_"+user_info.ky+"' style='display:none'></span>";
				html += "					"+user_info.name+"";
				html += "					<span class='rank'>"+user_info.jt+"</span>";
				html += "				</div>";
				html += "				<div class='office_mem_info'>";
				html += "					<p>"+user_info.dept+"</p>";
				html += "					<p class='company'>"+user_info.company+"</p>";
				html += "				</div>";
				html += "			</div>";
				html += "			<div class='abs hover-box'>";
				html += "				<div class='inner f_between f_middle'>";
				html += "					<span class='ico ico-chat' title='"+gap.lang.startChat+"' data-name='"+user_info.name+"' data-key='"+user_info.ky+"' >채팅</span>";
		//		if (use_tel == "1"){
					html += "					<span class='ico ico-phone' data-ky='"+user_info.ky+"'  title='"+gap.lang.mobile+"' >전화</span>";
		//		}				
				html += "					<span class='ico ico-profile' data-ky='"+user_info.ky+"' title='"+gap.lang.openprofile+"' >프로필</span>";
				html += "				</div>";		
				html += "			</div>";
				html += "		</div>";
			}
		}				
		html += "	</div>";
		html += "</div>";		
		html += "<div class='office_part'>";
		html += "	<button type='button' class='more_btn more_btn_close' onclick=\"gBody.member_all_layer_close();\"><span class='ico'>1111</span></button>";
		html += "</div>";		
		html += "</div>";	
//		$("#ext_body").html(html);
		//2024.03.28 More버튼에 대한 이벤트가 없어서 추가함.
		$("#ext_body").html(html).promise().done(function(){
			$("#ext_body #members_fnc").off().on("click", function(){			
				var html = "";
				html += "<div class='layer layer-menu opt-enter' id='member_list_opt'>";
				html += "<ul>";		
				html += "<li style='padding-left : 10px !important' onclick='gBody.all_send_opt(1)'>"+gap.lang.allsend+"</li>";
				html += "<li style='padding-left : 10px !important' onclick='gBody.all_send_opt(2)'>"+gap.lang.allmemo+"</li>";			
				html += "</ul>";
				html += "</div>";			
				$("#ext_body #members_fnc").qtip({
					overwrite: false,
					content : { text : html },
					show : { event: 'click', ready: true },
					hide : { event : 'click unfocus', fixed : true },
					style : { classes : 'qtip-bootstrap', tip : false },
					position : {
						my : 'top right',
						at : 'bottom left',
						adjust: { x: 10, y: 5 }
					},
					events : {
						show : function(event, api){},
						hidden : function(event, api){ api.destroy(true); }
					}
				});
			});
		});
		
		//상태 표시 한다. 이전에 받은 상태정보를 그대로 사욯한다.
		for (var k = 0 ; k < list.length; k++){
			var llk = list[k];
			var status = gap.status_search(llk.ky);
		//	var yk = gap.seach_canonical_id(llk.ky);
			var yk = llk.ky;
			gap.temp_change_status(yk, status, "multimember");			
		}
		$("#list_layer_close").on("click", function(){
			if (gap.curpage == "" || gap.tmppage == "usearch" || gap.tmppage == "history"){
				$(".left-area").css("width", "100%");
			}
			$("#ext_body").fadeOut();
		});
		$("#chat_profile_view .office_part").css("display", "none");		
		$("#mall_draw").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable:false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			scrollbarPosition : "outside",
		//	mouseWheel:{ preventDefault: false },
		//	advanced:{
		//		updateOnContentResize: true
		//	},
			autoHideScrollbar : true
		//	setTop : ($("#chat_msg").height() + 100) + "px"
		});
		gBody._event_set_member();
		//상태값을 검사한다.
		var opt = 1;
		var ty = "channel";
		gap.status_check(slist, opt, ty);	
	},
	
	"_event_set_member" : function(){	
		$(".ico-chat").off().on("click", function(e){			
			gap.cur_room_att_info_list = [];			
			var ky = $(e.currentTarget).data("key");
			var name = $(e.currentTarget).data("name");			
			var room_key = _wsocket.make_room_id(ky); // + "^" + gap.userinfo.rinfo.cpc;
			//대상자 정보를 넣어주서야 새창에서 기존에 채팅방이 없는 경우 해당 사용자와 1:1 방을 만들고 들어간다.	
			gap.cur_chat_user = ky;
			gap.cur_chat_name = name;
//			var url = cdbpath + "/chat?readform&key=" + $.base64.encode(room_key);
//			gap.open_subwin(url, "1200","850", "yes" , "", "yes");				
			gap.chatroom_create_after2(room_key);
		});		
		$(".ico-phone").off().on("click", function(e){
			var ky = $(e.currentTarget).data("ky");
			gap.phone_call(ky, "");  //핸드폰으로 전화 건다.
		});		
		$(".ico-profile").off().on("click", function(e){
			var ky = $(e.currentTarget).data("ky");
			gap.showUserDetailLayer(ky);
		});
	},
	
	"member_all_layer_close" : function(){
		$("#chat_profile_view .office_part").css("display", "");
		$("#list_layer_close").click();
	},
	
	"all_send_opt" : function(opt){	
		var att_list = gBody.cur_room_att_info_list;
		if (opt == "1"){
			//참석자 전체 메일 발송
			var all_sender_list = "";
			for (var i = 0 ; i < att_list.length; i++){
				var info = att_list[i];
				var name = info.nm;				
			//	if (gap.curLang != "ko"){
				if (gap.cur_el != info.el){
					name = info.enm;
				}
				var email = info.em;				
				if (info.ky != gap.search_cur_ky()){
					if (all_sender_list == ""){					
						all_sender_list = encodeURIComponent(name) + "<" + email + ">";
					}else{
						all_sender_list += ";" + encodeURIComponent(name) + "<" + email + ">";
					}
				}				
			}			
			gBody.open_email_send(all_sender_list);			
		}else if (opt == "2"){
			//참석자 전체 쪽지 발송	
			gRM.create_memo(att_list);
		}
	},
	
	"empty_img" : function(obj){		
		var id = $(obj).parent().attr("id").replace("mm_","");
		if (gBody.unload_img != ""){
			gBody.unload_img = id;
		}else{
			gBody.unload_img += "-spl-" + id;
		}		
		$("#mem_" + id).addClass("no-image");
	},	
	
	"add_member_memo" : function(uid, email, name){
		$("#show_memo_layer").click();
		gRM.show_memo_sender(uid, email, name);
		return false;
	},
	
	"add_member_memo_call_org" : function(){
		$("#show_memo_layer").click();
		var uid = new Array();
		var emails = new Array();
		var names = new Array();		
		uid = localStorage.getItem("memo_ky");
		emails = localStorage.getItem("memo_emails");
		names = localStorage.getItem("memo_names");		
		gRM.show_memo_sender(uid, emails, names);
		return false;
	},	
	
	"chatgpt_init" : function(){
		$("#chatroomtitle").html(gap.lang.gptname + " Conversation");
		$("#realtime_video2").hide();
		$(".channel-search").hide();
		$("#chat_add_member").hide();
		$("#chat_config").hide();
		$("#chat_new_window").hide();
		$("#open_emoticon").hide();
		$("#person_text_option").hide();
		//$("#open_attach_window_call").hide();
		$("#translate_btn").css("right", "11px"); //원래 111px임
		$(".trans-box").css("right", "35px"); //원래 355px임
	},
	
	"chatgpt_disable" : function(){
		$("#chatroomtitle").html("");
		$("#realtime_video2").show();
		$(".channel-search").show();
		$("#chat_add_member").show();
		$("#chat_config").show();
		$("#chat_new_window").show();
		$("#open_emoticon").show();
		$("#person_text_option").show();
		//$("#open_attach_window_call").hide();
		$("#translate_btn").css("right", "111px"); //원래 111px임
		$(".trans-box").css("right", "355px"); //원래 355px임
	},
	
	"chat_profile_init_chatgpt" : function(){
		//chatgpt 수정
		//수정되거나 제거해야 할 파트를 처리한다.
		gkgpt.chatgpt_greeting();
		$("#chatroom_all_status").hide();
		gBody.hideNoticeChat();
		gBody.chatgpt_init();		
		$("#translate_btn").off().on("click", function(e){
			//번역리스트를 호출한다. 웹소켓  수신후 gBody.translate_list_popup(list)을 호춯한다.
			_wsocket.translate_list();
		});		
		$("textarea#message_txt").off();
		$("textarea#message_txt").keypress(function(evt) { 
			if (evt.keyCode == 13){
				var msg = $("#message_txt").val();			
				//chatgpt 수정
				if (gBody.cur_cid == "chatgpt"){
					gkgpt.chatgpt_call(msg);
					return false;
				}		
			}			
	    });		
		$("#trans_close_btn_bottom").off().on("click", function(e){
			$(".trans-box").hide();
			gBody.trans_lang = "";
			gBody.trans_title = "";
			$("#trans_box_title").html("");
		});	
		$("#chat_msg").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable: true
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
	//			updateOnContentResize: true
			},
			autoHideScrollbar : false,
			callbacks : {			
			}
		}); 		
		//////////////////////////////////////////////		
		var html = "";
		var lists2 = [];
		html += "	<h2>"+gap.lang.chatm + "</h2>";			
		html += "			<div class='o_p_list' style='height:235px; overflow:hidden; padding:0px; margin-top:10px'>";			
		//1:1도 나의 정보를 추가한다.
		var xuser_info = gap.user_check(gap.userinfo.rinfo);			
		lists2.push(xuser_info.ky);			
		var jt = xuser_info.jt;
		if (typeof(jt) == "undefined"){
			jt = "";
		}	
		////////////////////////////////////////////////////////////////////////////////////////////
		html += "		<div class='office_mem_card' style='margin:5px 2px 1px 1px' id='member_list_"+xuser_info.ky+"'>";
		html += "			<div class='office_prof user'>";
	//	html += "				<div class='owner-thumb'>"+user_info.user_img+"</div>";
		html += '				<div class="photo-wrap" style="background-image:url(' + gap.person_photo_url(xuser_info) + '),url(../resource/images/none.jpg);"></div>'
		html += "				<span data-status='status_"+xuser_info.ky+"' class='status ' style='top:6px; left:7px'></span>";
		html += "				<button data-phone='phone_"+xuser_info.ky+"' type='button' style='position:absolute'></button>";
		html += "			</div>";
		html += "			<div class='office_right' style='width: 64%;'>";
		html += "				<div class='office_mem_name'>";
		html += "					<span data-day='day_"+xuser_info.ky+"' style='display:none'></span>";
		html += "					"+xuser_info.name+"";
		html += "					<span class='rank'>"+xuser_info.jt+"</span>";
		html += "				</div>";
		html += "				<div class='office_mem_info'>";
		html += "					<p>"+xuser_info.dept+"</p>";
		html += "					<p class='company'>"+xuser_info.company+"</p>";
		html += "				</div>";
		html += "			</div>";		
		html += "			<div class='abs hover-box'>";
		html += "				<div class='inner f_between f_middle'>";
		html += "					<span class='ico ico-chat' title='"+gap.lang.startChat+"' data-name='"+xuser_info.name+"' data-key='"+xuser_info.ky+"' >채팅</span>";
		if (use_tel == "1"){
			html += "					<span class='ico ico-phone' data-ky='"+xuser_info.ky+"'  title='"+gap.lang.mobile+"' >전화</span>";
		}				
		html += "					<span class='ico ico-profile' data-ky='"+xuser_info.ky+"' title='"+gap.lang.openprofile+"' >프로필</span>";
		html += "				</div>";		
		html += "			</div>";
		html += "		</div>";
		html += "		<div class='office_mem_card' style='margin:5px 2px 1px 1px' id=''>";
		html += "			<div class='office_prof user'>";
	//	html += "				<div class='owner-thumb'>"+user_info.user_img+"</div>";
		html += '				<div class="photo-wrap" style="background-image:url(' + gap.chat_photo_url() + '),url(../resource/images/none.jpg);"></div>'
		html += "			</div>";
		html += "			<div class='office_right' style='width: 64%;'>";
		html += "				<div class='office_mem_name'>";
		html += "					<span style='display:none'></span>";
		html += "					"+gap.lang.gptname+"";
//		html += "					<span class='rank'>"+jobtitle+"</span>";
		html += "				</div>";
		html += "				<div class='office_mem_info'>";
		html += "					<p>"+xuser_info.dept+"</p>";
		html += "					<p class='company'>"+xuser_info.company+"</p>";
		html += "				</div>";
		html += "			</div>";	
		html += "		</div>";		
		html += "		</div>";					
		$("#chat_profile_view").hide();
		$("#chat_profile_view").removeClass("member-info");
		$("#chat_profile_view").addClass("your-info");
		$("#chat_profile_view").html(html).fadeIn(1000);		
		gBody._event_set_member();			
		//상태값을 검사한다.
		var opt = 1;
		var ty = "channel";		
		gap.status_check(lists2, opt, ty);		
	},
	
	"chat_profile_init" : function(obj){	
		
		//1:1 시작 할때만 호출하는 함수 1:N은 호출하지 않는다.		
		var list = obj.rt;		
		var html = "";							
		var userinfo = list[0];			
		var lists2 = [];
		if (typeof(userinfo) != "undefined"){
			var uid = userinfo.ky;			
			var jobtitle = "";
			var dept = "";			
			var statusmsg = "";
			var email = userinfo.em;			
		//	var cky = gap.seach_canonical_id(userinfo.ky);	
			var cky = userinfo.ky;	
			var person_img = gap.person_profile_photo(userinfo);
			var name = "";
			var cp = "";
			var ky = userinfo.ky;
			var company = userinfo.cp;			
			lists2.push(ky);			
			var user = gap.user_check(userinfo);
			name = user.name;
			company = user.company;
			dept = user.dept;
			jobtitle = user.jt;
			var dis = jobtitle + "/" + dept;	
			html += "	<h2>"+gap.lang.chatm + "</h2>";		
			html += "			<div class='o_p_list' style='height:235px; overflow:hidden; padding:0px; margin-top:10px'>";			
			//1:1도 나의 정보를 추가한다.
			var xuser_info = gap.user_check(gap.userinfo.rinfo);			
			lists2.push(xuser_info.ky);			
			var jt = xuser_info.jt;
			if (typeof(jt) == "undefined"){
				jt = "";
			}		
			////////////////////////////////////////////////////////////////////////////////////////////
			html += "		<div class='office_mem_card' style='margin:5px 2px 1px 1px' id='member_list_"+xuser_info.ky+"'>";
			html += "			<div class='office_prof user'>";
		//	html += "				<div class='owner-thumb'>"+user_info.user_img+"</div>";
			html += '				<div class="photo-wrap" style="background-image:url(' + gap.person_photo_url(xuser_info) + '),url(../resource/images/none.jpg);"></div>'
			html += "				<span data-status='status_"+xuser_info.ky+"' class='status ' style='top:6px; left:7px'></span>";
			html += "				<button data-phone='phone_"+xuser_info.ky+"' type='button' style='position:absolute'></button>";
			html += "			</div>";
			html += "			<div class='office_right' style='width: 64%;'>";
			html += "				<div class='office_mem_name'>";
			html += "					<span data-day='day_"+xuser_info.ky+"' style='display:none'></span>";
			html += "					"+xuser_info.name+"";
			html += "					<span class='rank'>"+xuser_info.jt+"</span>";
			html += "				</div>";
			html += "				<div class='office_mem_info'>";
			html += "					<p>"+xuser_info.dept+"</p>";
			html += "					<p class='company'>"+xuser_info.company+"</p>";
			html += "				</div>";
			html += "			</div>";			
			html += "			<div class='abs hover-box'>";
			html += "				<div class='inner f_between f_middle'>";
			html += "					<span class='ico ico-chat' title='"+gap.lang.startChat+"' data-name='"+xuser_info.name+"' data-key='"+xuser_info.ky+"' >채팅</span>";
			if (use_tel == "1"){
				html += "					<span class='ico ico-phone' data-ky='"+xuser_info.ky+"'  title='"+gap.lang.mobile+"' >전화</span>";
			}				
			html += "					<span class='ico ico-profile' data-ky='"+xuser_info.ky+"' title='"+gap.lang.openprofile+"' >프로필</span>";
			html += "				</div>";		
			html += "			</div>";
			html += "		</div>";			
			if (userinfo.ky != gap.userinfo.rinfo.ky){
				html += "		<div class='office_mem_card' style='margin:5px 2px 1px 1px' id='member_list_"+ky+"'>";
				html += "			<div class='office_prof user'>";
			//	html += "				<div class='owner-thumb'>"+user_info.user_img+"</div>";
				html += '				<div class="photo-wrap" style="background-image:url(' + gap.person_photo_url(userinfo) + '),url(../resource/images/none.jpg);"></div>'
				html += "				<span data-status='status_"+userinfo.ky+"' class='status ' style='top:6px; left:7px'></span>";
				html += "				<button data-phone='phone_"+userinfo.ky+"' type='button' style='position:absolute'></button>";
				html += "			</div>";
				html += "			<div class='office_right' style='width: 64%;'>";
				html += "				<div class='office_mem_name'>";
				html += "					<span data-day='day_"+userinfo.ky+"' style='display:none'></span>";
				html += "					"+name+"";
				html += "					<span class='rank'>"+jobtitle+"</span>";
				html += "				</div>";
				html += "				<div class='office_mem_info'>";
				html += "					<p>"+dept+"</p>";
				html += "					<p class='company'>"+company+"</p>";
				html += "				</div>";
				html += "			</div>";				
				html += "			<div class='abs hover-box'>";
				html += "				<div class='inner f_between f_middle'>";
				html += "					<span class='ico ico-chat' title='"+gap.lang.startChat+"' data-name='"+userinfo.name+"' data-key='"+userinfo.ky+"' >채팅</span>";
				if (use_tel == "1"){
					html += "					<span class='ico ico-phone' data-ky='"+userinfo.ky+"'  title='"+gap.lang.mobile+"' >전화</span>";
				}				
				html += "					<span class='ico ico-profile' data-ky='"+userinfo.ky+"' title='"+gap.lang.openprofile+"' >프로필</span>";
				html += "				</div>";		
				html += "			</div>";
				html += "		</div>";
			}			
			html += "		</div>";							
			$("#chat_profile_view").hide();
			$("#chat_profile_view").removeClass("member-info");
			$("#chat_profile_view").addClass("your-info");
			$("#chat_profile_view").html(html).fadeIn(1000);			
			gBody._event_set_member();
		}		
		_wsocket.chat_room_image_list(gBody.cur_cid);
		_wsocket.chat_room_file_list(gBody.cur_cid);		
		//채팅방 사용자 상태 요청한다.
		//lists : 대상자 ky값 / opt 등록 : 1, 종료 : 2 / ty : 어디서 호출한 것인지 등록해서 나중에 판단 기준으로 사용한다.
		if (typeof(userinfo) != "undefined"){
			var lists = new Array();
			lists.push(userinfo.ky);
			//_wsocket.temp_list_status(lists, 1, "chatroom");	
			gBody.cur_room_att_info_list = list;
			gBody.cur_room_att_info_list.push(gap.userinfo.rinfo);
		}
		//상태값을 검사한다.
		var opt = 1;
		var ty = "channel";		
		gap.status_check(lists2, opt, ty);	
	},	
	
	"chat_profile_file_draw" : function(obj){	
		
		if ((typeof(obj) == "undefined")){
			return false;
		}	
		var lists = obj.log;
		if (typeof(obj.log) == "undefined" || lists.length == 0){
			$("#chat_file_dis").html("");
			return false;
		}		
		$("#chat_file_dis").show();		
		var len = 0; 
		if (lists.length > 5){
			len = 5;
		}else{
			len = lists.length;
		}
		var html = "";
		html += "<div class='share-file' id='sh-file'>";
		html += "	<h2>"+gap.lang.sharefile+"<span>(<span style='margin-left:0px' id='file_ccount'></span>/";
		html += "<span style='margin-left:0px' id='file_tcount'></span>)</span></h2>";
		html += "	<button class='ico btn-right-more' id='share_file_more'>더보기</button>";
		html += "	<ul>";	
		var lists = obj.log;
		for (var i = 0 ; i < len; i++){
			var item = lists[i];
			var key = lists[i].ky;
			var info = lists[i].ex;		
			var ex = gap.file_icon_check(info.nm);			
			var fserver = gap.search_fileserver(info.nid);
			var downloadpath = fserver + "/filedown" + info.sf + "/" + info.sn +"/" + encodeURIComponent(info.nm);
			var fname = info.nm;
			if (fname.length > 22){
				fname = info.nm.substring(0,22);
			}			
			var dis_date = gap.change_date_default(gap.search_today_only3(item.dt));
		
			html += "		<li class='chat_file'  title='"+info.nm+"'>";
			html += "			<span class='ico ico-file "+ex+"' data1='"+info.nm+"' data2='"+downloadpath+"' data3='"+info.sz+"' data-key='"+key+"'></span>"+fname;
			html += "			<button class='ico btn-file-download' style='width: 16px; height: 16px; left:250px; top: 50%; margin-top: -8px; background-position: -210px -20px;position : absolute;' title='File download'>다운로드</button>";
			html += "			<br><span>"+item.nm+" | "+dis_date+" | "+gap.file_size_setting(info.sz)+"</span>"
			html += "		</li>";		
			
		}
		html += "	</ul>";
		html += "</div>";		
		$("#chat_file_dis").html(html);		
		if (typeof(obj.cnt) != "undefined"){
			$("#file_tcount").text(obj.cnt);
		}		
		gBody.chat_profile_file_draw_cnt += lists.length;
		if (gBody.chat_profile_file_draw_cnt > 5){
			if (lists.length < 5){
				gBody.chat_profile_file_draw_cnt = lists.length;
			}else{
				gBody.chat_profile_file_draw_cnt = 5;
			}			
		}else{
			gBody.chat_profile_file_draw_cnt = lists.length;
		}
		$("#file_ccount").text(gBody.chat_profile_file_draw_cnt);	
		$("#chat_file_dis .chat_file").off().on("click", function(e){

			
			var url = $(this).find("span").attr("data2");
			var key = $(e.target).children(0).data("key");
			var filename = $(e.target).children(0).attr("data1");
			if (typeof(filename) == "undefined"){
				filename = $(e.target).prev().attr("data1");
			}
			if ($(e.target).attr("class") == "ico btn-file-download"){
				filename = $(e.target).prev().attr("data1");
				gap.file_download_normal(url, filename);
			}else{
				
				if (gap.checkFileExtension(filename)){
				    var spl = url.split("/");
					var id = spl[6];
					var surl = gap.channelserver + "officeview/ov.jsp?url=" +url + "&filename="+filename + "&dockey=" + id;
					gap.popup_url_office(surl);	
					return false;
				}else{
				//	if (gap.check_preview_file(filename)){
				//		gBody.file_convert("", url, "", gBody.cur_cid, "chat", "", key, filename);	
					if (gap.file_show_video(filename)){
						gap.show_video(url, filename);
					}else{
						gap.file_download_normal(url, filename);
					}	
				}
				
				
							
			}
		});		
		//전체 보기 클릭시 추가한다.
		$("#file_wrap").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable:false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
		//	mouseWheel:{ preventDefault: false },
		//	advanced:{
		//		updateOnContentResize: true
		//	},
			autoHideScrollbar : true
		//	setTop : ($("#chat_msg").height() + 100) + "px"
		});			
		$("#sh-file ul li").css("cursor","pointer");
		$("#sh-file ul li").draggable({
			 revert: "invalid",
			 stack: ".draggable",     //가장위에 설정해 준다.
			 opacity: 1,
		//	 containment: "window",
			 scroll: false,
		//	 helper: 'clone',
			 cursorAt: { top: 5, left:5},
			 helper: function (e) { 
				//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.					
				return $(this).clone().appendTo("#nav_left_menu").css("zIndex",2000).show();
		     },			 		     
		     cursor: 'move',	  		     
			 start : function(event, ui){
				$(this).draggable("option", "revert", false);		
		
				var html = "";			
				html += "<div class='balloon drag' style='padding:10px;   white-space:nowrap;  '>";
				html += ui.helper.get(0).innerHTML;
				html + "</div>";
				ui.helper.html(html);
			},
			stop : function(event, ui){						
			}
		});				
		$("#share_file_more").on("click", function(){
			gRM.file_cur_cnt = 0;		//파일 갯수 초기화
			gRM.file_total_cnt = 0;		//파일 갯수 초기화
			_wsocket.chat_room_file_list_right_frame(obj.cid, 0);
		});			
	},
	
	"chat_profile_image_draw" : function(obj){		
		if ((typeof(obj) == "undefined")){
			return false;
		}		
		if (typeof(obj.log) == "undefined"){
			return false;
		}
		var lists = obj.log;
		if (lists.length == 0){
			$("#chat_image_dis").empty();
			return false;
		}	
		var len = 0;
		if (lists.length > 3){
			len = 3;
		}else{
			len = lists.length;
		}
		var html = "";
		html += "<div class='share-photo' style='margin-bottom:10px'>";
		html += "	<h2>"+gap.lang.shareimage+"<span>(<span style='margin-left:0px' id='image_ccount'></span>/";
		html += "<span style='margin-left:0px' id='image_tcount'></span>)</span></h2>";
		html += "	<button class='ico btn-right-more' id='share_img_more'>더보기</button>";
		html += "	<div class='group-img'>";
		html += "		<ul>";	
		

		
		var mul_imgs = [];
		for (var i = 0 ; i < len; i++){
			var info = lists[i].ex;
			var sq = lists[i].sq;
			
			var multicount = 0;
			if (typeof(lists[i].ex.files) != "undefined"){
				sq = sq + "_0";	
				mul_imgs.push(lists[i]);
				gBody.tMultiImages.push(lists[i]);
				
				multicount = lists[i].ex.files.length;
				
			}
			var isMulti = false;
			if ((typeof(info.files) != "undefined")  && (info.files.length > 0)){
				info = info.files[0];
				isMulti = true;
			}
			var fserver = gap.search_fileserver(info.nid);
			var preview_img = fserver + info.sf + "/thumbnail/" + info.sn;
			var downloadpath = fserver + "/filedown" + info.sf + "/" + info.sn;
			html += "	<li class='chat_img2'>";
			html += "		<span style='border:1px solid #DDDAE2' data='"+multicount+"'>";
			html += "				<img style='width:75px; ' data1='"+info.nm+"' data2='" + downloadpath + "' data3='"+info.sz+"' data4='"+sq+"' src='"+preview_img+"' onerror='this.src=\"../resource/images/thm_img_s.png\"' alt='' />";
			
			if (isMulti){
				html += "<div class='submulti' style='position:absolute; bottom:5px; right:5px; width:20px; height:20px' id='multi_"+sq+"'>";
				html += "<img src='common/img/multi_image.png'>";
				html += "</div>";
			}
			html += "		</span>";
			html += "	</li>";
		}
		
		html += "		</ul>";
		html += "	</div>";
		html += "</div>";		
		$("#chat_image_dis").html(html);	
		
		if (typeof(obj.cnt) != "undefined"){
			$("#image_tcount").text(obj.cnt);
		}		
		gBody.chat_profile_image_draw_cnt += lists.length;
		if (gBody.chat_profile_image_draw_cnt > 3){			
			if (lists.length < 3) {
				gBody.chat_profile_image_draw_cnt = lists.length;
			}else{
				gBody.chat_profile_image_draw_cnt = 3;
			}			
		}else{
			gBody.chat_profile_image_draw_cnt = lists.length;
		}	
		$("#chat_image_dis").show();	
		$("#image_ccount").text(gBody.chat_profile_image_draw_cnt);		
		
		
		//묶음 이미지 파일을 드래그 & 드롭으로 전송할때 참고하려서 추가함.
		if (mul_imgs.length > 0){
			for (var k = 0 ; k < mul_imgs.length; k++){
				var pk = mul_imgs[k];
				$("#multi_" + pk.sq + "_0").data("finfo", pk.ex.files);
			}	
			//gBody.tMultiImages.push(mul_imgs);
			//gBody.tMultiImages = mul_imgs;
		}

		
		$(".share-photo span").off().on("click", function(e){		

//			var fname = $(this).find("img").attr("data1");
//			var url = $(this).children().attr("data2") + "/" + encodeURIComponent(fname);						
//			gap.image_gallery = new Array();  //변수 초기화 해준다.
//			gap.image_gallery_current = 1;		
//			var image_list = $(this).parent().parent().find("img");
//			if (image_list.length > 0){				
//				var k = 1;
//				for (var i = 0 ; i < image_list.length; i++){
//					var image_object = new Object();
//					var image_info = image_list[i];					
//					var fname = $(image_info).attr("data1");
//					var turl = $(image_info).attr("data2") + "/" + encodeURIComponent(fname);
//					image_object.title = fname;
//					image_object.url = turl;
//					image_object.sort = k;					
//					gap.image_gallery.push(image_object);
//					if (turl == url){
//						gap.image_gallery_current = k;
//					}
//					k++;
//				}
//			}		
//			gap.show_image(url, fname);		
			
//			var fname = $(this).find("img").attr("data1");
//			var url = $(this).children().attr("data2") + "/" + encodeURIComponent(fname);
			
			var sq = $(this).find("img").attr("data4");
			
			gBody.image_view_direction = false;
			
			var ispopup = gap.isPopup(this);
			gBody.chat_gallery_show(sq, ispopup);
		});

		$(".group-img ul li").css("cursor","pointer");
		$(".group-img ul li").draggable({
			revert: "invalid",
			stack: ".draggable",     //가장위에 설정해 준다.
			opacity: 1,
		//	containment: "window",
			scroll: false,
		//	helper: 'clone',
			cursorAt: { top: 5, left:5},
			helper: function (e) { 
				//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.
				return $(this).clone().appendTo("#nav_left_menu").css("zIndex",2000).show();
		    },			 
		    cursor: 'move',			 
			start : function(event, ui){
		    	$(this).draggable("option", "revert", false);
				var html = "";				
				var iobj = ui.helper.find("img");				
				if (ui.helper.find("img").attr("src") == "img/thm_img_s.png"){						
					return false;
				}				
				
				html += "<div style='width:100px; height:100px; border:1px solid grey; background-color:white;text-align:center'>";
				html += "<img style='width:90px; height:80px' data1="+iobj.attr("data1")+" data2="+iobj.attr("data2")+"  data3="+iobj.attr("data3")+"  src=" +iobj.attr("src")+ " onerror='this.src=\"../resource/images/thm_img_s.png\"'>";
				
				if ($(ui.helper).find(".submulti").length > 0){
					//멀티 이미지 전송이다.
					var multicount = $($(ui.helper).html()).attr("data");
					html += "<div style='font-size:12px'>Image Files("+multicount+")</div>";
				}
				
				html += "</div>";
				ui.helper.html(html);
			},
			stop : function(event, ui){						
			}
		});
		
		$("#share_img_more").on("click", function(){
			gRM.image_cur_cnt = 0;			//파일 갯수 초기화
			gRM.image_total_cnt = 0;		//파일 갯수 초기화
			_wsocket.chat_room_image_list_right_frame(obj.cid, 0);
		});			
	},
	
	"chat_gallery_show" : function(select_sq, isPopup){
		var chatroom_id = gBody.cur_cid;
//		if (gma.chat_position == "popup_chat"){
//			chatroom_id = gma.cur_cid_popup;
//		}
		if (isPopup){
			chatroom_id = gma.cur_cid_popup;
		}
		_wsocket.chat_room_image_all(chatroom_id, select_sq); //호출시 소켓 리턴 함수 gBody.show_chat_images 호출함	
	},
	
	"show_chat_images" : function(obj){
	
		var ssq = obj.ek.replace("chat_room_image_all_","");
		var image_list = obj.ct.log;
		var tfname = "";
		var tnm = "";
		var tdt = "";
		var tsz = "";
		var k = 1;
		var surl = "";						
		gap.image_gallery = [];
		if (gBody.image_view_direction){
			//채팅창에서 이미지를 클릭한 경우 
			for (var i = image_list.length-1 ; i >= 0 ; i--){
				if (typeof(image_list[i].ex.files) != "undefined"){
					//묶음 발송된 이미지 이다.
					for (var y = 0 ; y < image_list[i].ex.files.length; y++){
						var image_object = new Object();
						var item = image_list[i];
						var image_info = item.ex.files[y];
						var fname = image_info.nm;
						var fserver = gap.search_fileserver(image_info.nid);
						var turl = fserver + "/filedown" + image_info.sf + "/" + image_info.sn + "/" + encodeURIComponent(fname);
						var sq = item.sq + "_" + y;					
						var nm = item.nm;
						var dt = item.dt;
						var sz = image_info.sz;					
						image_object.title = fname;
						image_object.url = turl;
						image_object.sort = k;		
						image_object.sq = sq;	
						image_object.nm = nm;
						image_object.dt = dt;
						image_object.sz = sz;					
						gap.image_gallery.push(image_object);
						if (sq == ssq){
							gap.image_gallery_current = k;
							tfname = fname;
							tnm = nm;
							tdt = dt;
							tsz = sz;
							surl = turl;
						}
						k++;
					}
				}else{
					//하나씩 발송된 이미지 이다.
					var item = image_list[i];
					var image_object = new Object();
					var image_info = item.ex;
					var fname = image_info.nm;
					var fserver = gap.search_fileserver(image_info.nid);
					var sq = item.sq;
					var nm = item.nm;
					var dt = item.dt;
					var sz = image_info.sz;

					var turl = fserver + "/filedown" + image_info.sf + "/" + image_info.sn + "/" + encodeURIComponent(fname);
					image_object.title = fname;
					image_object.url = turl;
					image_object.sort = k;	
					image_object.sq = sq;	
					image_object.nm = nm;
					image_object.dt = dt;
					image_object.sz = sz;
					
					gap.image_gallery.push(image_object);
					if (sq == ssq){
						gap.image_gallery_current = k;
						tfname = fname;
						tnm = nm;
						tdt = dt;
						tsz = sz;
						surl = turl;
					}
					k++;
				}
			}
		}else{
			//이미지 목록에서 클릭한 경우
			for (var i = 0 ; i < image_list.length; i++){
				if (typeof(image_list[i].ex.files) != "undefined"){
					//묶음 발송된 이미지 이다.
					for (var y = 0 ; y < image_list[i].ex.files.length; y++){
						var image_object = new Object();
						var item = image_list[i];
						var image_info = item.ex.files[y];
						var fname = image_info.nm;
						var fserver = gap.search_fileserver(image_info.nid);
						var turl = fserver + "/filedown" + image_info.sf + "/" + image_info.sn + "/" + encodeURIComponent(fname);
						var sq = item.sq + "_" + y;					
						var nm = item.nm;
						var dt = item.dt;
						var sz = image_info.sz;					
						image_object.title = fname;
						image_object.url = turl;
						image_object.sort = k;		
						image_object.sq = sq;	
						image_object.nm = nm;
						image_object.dt = dt;
						image_object.sz = sz;					
						gap.image_gallery.push(image_object);
						if (sq == ssq){
							gap.image_gallery_current = k;
							tfname = fname;
							tnm = nm;
							tdt = dt;
							tsz = sz;
							surl = turl;
						}
						k++;
					}
				}else{
					//하나씩 발송된 이미지 이다.
					var item = image_list[i];
					var image_object = new Object();
					var image_info = item.ex;
					var fname = image_info.nm;
					var fserver = gap.search_fileserver(image_info.nid);
					var sq = item.sq;
					var nm = item.nm;
					var dt = item.dt;
					var sz = image_info.sz;

					var turl = fserver + "/filedown" + image_info.sf + "/" + image_info.sn + "/" + encodeURIComponent(fname);
					image_object.title = fname;
					image_object.url = turl;
					image_object.sort = k;	
					image_object.sq = sq;	
					image_object.nm = nm;
					image_object.dt = dt;
					image_object.sz = sz;
					
					gap.image_gallery.push(image_object);
					if (sq == ssq){
						gap.image_gallery_current = k;
						tfname = fname;
						tnm = nm;
						tdt = dt;
						tsz = sz;
						surl = turl;
					}
					k++;
				}
			}
		}
	
//		for (var i = image_list.length-1 ; i >= 0 ; i--){
//						
//		}
		
		//현재 클릭한 이미지의 순번을 계산한다.
//		for (var k = 0; k < image_gallery.length; k++){
//			var ig = image_gallery[k];
//			if (ssq)
//		}
		var dis_date = gap.change_date_localTime_full2(""+tdt);
		var disadd = "&nbsp; <span style='font-size:15px'>["+tnm+" | "+dis_date+" | "+gap.file_size_setting(tsz)+"]</span>"
		
	//	gap.show_image(surl, tfname);	
		gap.show_image(surl, tfname + disadd );	
	},
	
	"search_memo_user" : function(str, cnt){
		if (gBody.searchcnt == 1){
			gBody.open_add_member_search_layer_memo(str);
		}		
		_wsocket.search_user_memo_sendto(str, cnt);
	},
	
	"open_add_member_search_layer_memo" : function(str){		
		var html = "";		
		var title = "";		
		title = gap.lang.sendto;     // 메모에서 사용자 검색 했을때		
		html += "<h2>"+title+" (<span id='ms_cur'>0</span>/<span id='ms_total'>0</span>) </h2>";
		html += "<button class='ico btn-article-close' id='search_window_close'>닫기</button>";
		html += "<div class='user-search' id='user_search_frame'>";
		html += "	<div class='input-field'> ";
		html += "		<input class='formInput' id='user_search_query' autocomplete='off' type='text' value='"+str+"' placeholder='이름을 입력하세요.'>";
		html += "		<span class='bar'></span>";
		html += "		<button class='ico btn-search-b' id='member_search_btn'>검색</button>";
		html += "	</div>";	
		html += "</div>";		
		html += "<div class='wrap-result' id='search_result_dis2' style='height:calc(100% - 280px); overflow:hidden'>";
		html += "<div id='search_rdis'></div>";
		html += "</div>";			
		$("#sub_search_content").html(html);		
		$("#user_search_query").focus();		
		$("#user_search_query").attr("placeholder",gap.lang.inputname);			
		$("#member_search_btn").on("click", function(event){			
			var len = $("#user_search_query").val();
			if (len == 0){
				gap.gAlert(gap.lang.input_search_query);
				return false;
			}
			gBody.search_result_add_member();			
		});
		
		$("#search_window_close").on("click", function(event){		
			if (gap.curpage == "main"){
				$("#center_content").show();
			}else if (gap.curpage == "chat"){
				$("#chat_content").show();
			}
			$("#sub_search_content").hide();
		});
		
		$("#user_search_query").keypress(function(e) { 
            if (e.keyCode == 13){                
            	var query = $("#user_search_query").val();
            	if (query.length == 0){
            		gap.gAlert(gap.lang.input_search_query);
            	}            	
            	gBody.searchcnt = 1;
        		gBody.topsearch_curcount = 0;        	
                gBody.search_memo_user(query, gBody.topsearch_curcount);
            }    
        }).bind('paste', function(e){
        	gap.change_paste_text(e, this);
        });		
	},
	
	"remove_select_user" : function(id){
		$("#result_"+id).find("button").removeClass("on");
	},
	
	"search_result_add_member_memo" : function(obj){		
		
		var users = obj.ct.rt;		
		if (users.length == 1){
			//검색 결과가 한명이면 그대로 넣어 준다.
			var info = users[0];
			var uid = new Array();
			var email = new Array();			
			uid.push(info.ky);
			email.push(info.em);
			var disname = "";
			
			if (gap.cur_el == info.el){
				disname = info.nm;
			}else{
				disname = info.enm;
				if (disname == ""){
					disname = info.nm;
				}
			}
			gRM.show_memo_sender(info.ky, info.em, disname);				
			$("#user_search_query").val("");			
			return false;
		}
			
		gap.show_content("subsearch_memo");	
		
		gBody.topsearch_curcount += users.length;
		$("#ms_cur").text(gBody.topsearch_curcount);
		
		var html = "";
		for (var i = 0 ; i < users.length; i++){
			var user = users[i];			
			var person_img = gap.person_profile_photo(user);	
		//	var id = gap.seach_canonical_id(user.ky);	
			var id = user.ky;
		//	id = id.replace(/\./gi,"-spl-").replace(/\^/gi,"_");
			id = gap.encodeid(id);
			var disname = "";
			var name1 = "";
			var name2 = "";
			var cp = "";
			var dept = "";
			
			if (gap.cur_el == user.el){
				disname = user.nm;
				name1 = user.nm;
				name2 = user.enm;
				cp = user.cp;
				if (typeof(user.dp) != "undefined"){
					dept = user.dp.replace("#","");
				}
				
				if (typeof(cp) == "undefined"){
					cp = "";
				}
				
			}else{
				disname = user.enm;
				name1 = user.enm;
				name2 = user.nm;
				cp = "";
				if (typeof(user.ecp) != "undefined"){
					cp = user.ecp;
				}
				
				if (typeof(user.edp) != "undefined"){
					dept = user.edp.replace("#","");
				}
				
			}	
			
			html += "	<div class='result-profile' id='result_"+id+"' data='"+user.em+"^"+user.ky+"^"+disname+"'>";
			html += "		<button class='ico btn-check'>체크</button>";
			html += "		<div class='user-result-thumb'>"+person_img+"</div>";
			html += "		<dl>";
			html += "			<dt><span class='status online'></span>"+name1+"</dt><dd>"+name2+"</dd>";
			html += "		</dl>";
			html += "		<ul class='result-info'>";
			html += "			<li>"+dept+"</li>";
			html += "			<li>"+cp+"</li>";
			html += "		</ul>";
			html += "	</div>";
		}
		$("#search_rdis").append(html);		
		$("#search_result_dis2 .result-profile").unbind("click");
		$("#search_result_dis2 .result-profile").on("click", function(){			
			if ($(this).find("button").hasClass("on")){
				//선택을 취소한다.
				$(this).find("button").removeClass("on");				
				var cid = $(this).attr("id");
				var id = cid.replace("result_","");		
				gRM.remove_memo_sender(id);
			}else{
				//선택한다.		
				$(this).find("button").addClass("on");				
				$("#sub_search_profile").find("p").remove();
	
				var callid = "sub_" + $(this).attr("id");
				var pinfo = $(this).attr("data").split("^");			
				gRM.show_memo_sender(pinfo[1], pinfo[0], pinfo[2]);				
			}	
		});
				
		//전체 보기 클릭시 추가한다.
		if (gBody.searchcnt == 1){
			gBody.topsearch_totalcount = obj.ct.cnt;			
			$("#ms_total").text(gBody.topsearch_totalcount);			
			$("#search_result_dis2").mCustomScrollbar({
				theme:"dark",
				autoExpandScrollbar: false,
				scrollButtons:{
					enable:false
				},
				mouseWheelPixels : 200, // 마우스휠 속도
				scrollInertia : 400, // 부드러운 스크롤 효과 적용
			//	mouseWheel:{ preventDefault: false },
			//	advanced:{
			//		updateOnContentResize: true
			//	},
				autoHideScrollbar : false,
			//	setTop : ($("#chat_msg").height() + 100) + "px"
				callbacks:{
				//	onTotalScrollBack: function(){addContent2(this)},
				//	onTotalScrollBackOffset: 100,
					onTotalScroll:function(){ gBody.addContent2(this) },
					onTotalScrollOffset:100,
					alwaysTriggerOffsets:true
				}
			});			
		}
	},	
	
	"addContent2" : function(obj){
		if (gBody.topsearch_totalcount > gBody.topsearch_curcount){
			var str = $("#user_search_query").val();
			gBody.searchcnt ++;
			_wsocket.search_user_memo_sendto(str, gBody.topsearch_curcount);
		}
	},
		
	"open_add_member_search_layer" : function(opt){		
		var html = "";		
		var title = "";
		if (opt == "makeroom"){
			title = gap.lang.newchat;   //"새로운 채팅";
		}else if (opt == "memo"){
			title = gap.lang.sendto;     // 메모에서 사용자 검색 했을때
		}else{
			title = gap.lang.inviteContact;   //"대화상대 초대";
		}		
		html += "<h2>"+title+" (<span id='mss_cur'>0</span>/<span id='mss_total'>0</span>)</h2>";
		html += "<button class='ico btn-article-close' id='search_window_close'>닫기</button>";
		html += "<div class='user-search' id='user_search_frame'>";
		html += "	<div class='input-field'> ";
		html += "		<input class='formInput' id='user_search_query' autocomplete='off' type='text' placeholder='이름을 입력하세요.'>";
		html += "		<span class='bar'></span>";
		html += "		<button class='ico btn-search-b' id='member_search_btn'>검색</button>";
		html += "	</div>";			
		html += "</div>";		
		html += "<div class='wrap-result' id='search_result_diss' style='height:calc(100% - 308px); overflow-y:hidden'>";	
		html += "<div id='search_rdis'></div>";
		html += "</div>";		
		if (opt == "makeroom"){
			html += "<button class='btn-invite-video ico disabled' id='video_invite_btn' style='display:none'>"+gap.lang.make_video+"</button>";
			
			html += "<button class='btn-new-chat ico disabled' id='search_invite_btn'>"+gap.lang.chat+"</button>";
		}else if (opt == "addmember"){
			html += "<button class='btn-new-chat ico disabled' id='search_invite_btn'>"+gap.lang.invite+"</button>";
		}		
		$("#sub_search_content").html(html);		
		$("#user_search_query").focus();		
		if (opt != "memo"){
			var html = "";
			html += "<h2>"+gap.lang.invitemember+"</h2>";
			html += "<p>"+gap.lang.buddylistdrag+"</p>";	
			html += "<div id='xppx' style='height:100%'>";
			html += "<div id='xwrap-member' style='height:calc(100% - 20px); margin-right:14px'><div class='wrap-member' id='addUser_frame'></div></div>";
			html += "</div>";
			$("#sub_search_profile").html(html);
		}	
		$("#xppx").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
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
				//onTotalScrollBack: function(){gBody3.channel_addContent(this)},
				//onTotalScrollBackOffset: 10,
				//alwaysTriggerOffsets:true
			}
		});	
		$("#user_search_query").attr("placeholder",gap.lang.inputname);			
		$("#member_search_btn").on("click", function(event){
			gBody.searchUser();
		});		
		$("#search_window_close").on("click", function(event){			
			if (gap.cur_window == "drive"){
				//드라이브에서 다중대화 요청후 닫기를 클릭한 경우
				$("#sub_search_profile").hide();
				if (gBody.select_folder_code != "root"){
					//폴더를 보고 있던 중이라 판단한다.
					$("#em_folder_"+ gBody.select_folder_code).click();
				}else{
					$("#btn_fold_"+ gBody.select_drive_code).click();
				}				
			}else if (gap.cur_window == "todo"){
				$("#sub_search_profile").hide();
				$("#em_"+ gTodo.cur_todo_code).click();
			}else{
				if (gBody.cur_opt != ""){
					//채널에서 다중대화 요청후 닫기를 클릭한 경우
					$("#sub_search_profile").hide();
					$("#"+ gBody.cur_opt).click();
				}else{
					if (opt == "makeroom"){
						gap.show_content("main");
					}else{
						//채팅창으로 돌아간다.		
						gap.show_chat_room();
					}	
				}		
			}			
			gap.remove_status_user();
		});
		
		$("#user_search_query").keypress(function(e) { 
            if (e.keyCode == 13){        	
                gBody.searchUser();
            }    
        }).bind('paste', function(e){
        	gap.change_paste_text(e, this);
        });
		
		$("#search_invite_btn").on("click", function(e){			
			if ($(this).hasClass("disabled")){
				$("#user_search_query").focus();
			}else{				
				if (gBody.search_type == "addmember"){
					gBody.addmember_chatroom();
				}else if (gBody.search_type == "makeroom"){
					gBody.makeroom();
				}
			}			
		});		
				
		$("#video_invite_btn").on("click", function(e){						
			if ($(this).hasClass("disabled")){
				$("#user_search_query").focus();
			}else{		
				if (gap.IE_Check()){
					gap.gAlert(gap.lang.IE_Notsupport);
				}else{
					gBody.makeroom_video();
				}			
			}		
		});	
				
		$("#sub_search_profile, #sub_search_content").droppable({			
			drop : function(event, ui){			
				try{				
					var droppable = $(this);
			 		var draggable = ui.draggable;
			 		var dragid = ui.draggable.attr("id");
			 		gBody.drag_id = dragid;
					gBody.drop_text = droppable.children().text();					
			 		if (draggable.hasClass("user")){
			 			//파일을 드래그해서 이동하면 업로드하는 프로그레스바 효과를 추가해 준다.		 			
			 			droppable.addClass("on");		 			
			 			var id = "";
			 			var uid = "";
			 			var dept = "";
			 			var el = "";
			 			var username = "";			 			
			 			if (typeof(draggable.children().attr("id")) != "undefined"){
			 				//버디리스트를 드래그 한 경우
			 				id = draggable.children().attr("id").split("_")[2];    //"person_0_khpark2019"	
			 				uid = draggable.children().attr("data");
				 			dept = draggable.find("#person_"+id+"_dept").text();
				 			username = draggable.children().attr("data4");				 			
			 			}else{
			 				//즐겨찾기에서 드래그한 경우
			 				var tid = $(ui.draggable).parent().attr("data");
			 				id = tid;
			 				uid = tid;
			 				dept =  $(ui.draggable).parent().attr("data5");	
			 				username = $(ui.draggable).parent().attr("data4");	
			 			}			 					 			
			 			var len = $("#addUser_frame").find("#"+id).length;
			 			if (len > 0){
			 				gap.gAlert(gap.lang.existuser);
			 				return false;
			 			}		 			
			 			$("#sub_search_profile").find("p").remove();			 			
			 			var html = "";
			 			var jso = gap.search_user_to_favorite_and_buddylist(uid);
			 			var person_img = gap.person_profile_photo(jso);
			 		//	var person_img = gap.person_profile_uid(uid);
			 		//	var username = gap.search_username(uid);		 			
			 			var uuid = uid;			 			
						html += "<div class='member-profile' id='"+uuid+"' data='"+uid+"'>";
						html += "	<button class='ico btn-member-del'>삭제</button>";
						html += "	<div class='user-result-thumb'>"+person_img+"</div>";
						html += "		<dl>";
						html += "			<dt><span class='status online'></span>"+username+"</dt><dd>"+dept+"</dd>";
						html += "		</dl>";
						html += "	</div>";
						html += "</div>";
						$("#addUser_frame").append(html);						
						$("#addUser_frame .member-profile button").on("click", function(){
							//선택한 화면에 선택 상태를 제거한다.
							var cid = $(this).parent().attr("id").replace("sub_","");
							$("#" + cid).find("button").removeClass("on");							
							//현재 박스에서 객체를 삭제한다.
							$(this).parent().remove();							
							var cnt = $("#addUser_frame .member-profile").length;							
							if (cnt  == 0){
								$("#search_invite_btn").addClass("disabled");
								$("#search_invite_btn").attr("style","");								
								$("#video_invite_btn").addClass("disabled");
								$("#video_invite_btn").attr("style","");								
								$("#sub_search_profile").find("p").show();
							}
						});						
						var cnt = $("#addUser_frame .member-profile").length;						
						if (cnt > 0){
							$("#search_invite_btn").removeClass("disabled");
							$("#search_invite_btn").attr("style","cursor:pointer");							
							$("#video_invite_btn").removeClass("disabled");
							$("#video_invite_btn").attr("style","cursor:pointer");
						}			 			
			 		}
				}catch(e){}		 		
			},
			hoverClass: "drop-area",
		//	accept: "div.user",
	    	classes: {
	    //       "ui-droppable-active": "drop-area"
	        }
		});		
	},	
	
	"searchUser" : function(){	
		var str = $("#user_search_query").val();
		if (str.length == 0){
			gap.gAlert(gap.lang.input_search_query);
			return false;
		}
		gBody.searchcnt = 1;
		gBody.topsearch_curcount = 0;		
		 gsn.requestSearch('', str, function(sel_data){
             console.log(sel_data);
             var obj = new Array();
             for (var i = 0 ; i < sel_data.length; i++){
            	 obj.push(sel_data[i]);
             }             
             gBody.search_result_add_member(obj);
         });		
	//	_wsocket.search_user_make_chat(str, gBody.topsearch_curcount);		
	},
	
	"search_result_add_member" : function(obj){	
		if (gBody.searchcnt == 1){
			$("#search_rdis").html("");
		}		
		var users = "";
		if (typeof(obj.ct) != "undefined"){
			users = obj.ct.rt;
		}else{
			users = obj;
		}		
		gBody.topsearch_curcount += users.length;
		$("#mss_cur").text(gBody.topsearch_curcount);		
		var lists = new Array();		
		var html = "";	
		for (var i = 0 ; i < users.length; i++){
			var user = users[i];			
			lists.push(user.ky);
			gBody.remove_user_status.push(user.ky);			
			var person_img = gap.person_profile_photo(user);
//			var uuid = gap.seach_canonical_id(user.ky);		
//			var xuuid = gap.seach_canonical_id(user.ky);
			var uuid = user.ky;		
			var xuuid = user.ky;
			//uuid = uuid.replace(/\./gi,"-spl-").replace(/\^/gi,"_");
			uuid = gap.encodeid(uuid);
			var dept = "";			
			var disname = "";
			var name1 = "";
			var name2 = "";
			var cp = "";
			if (gap.cur_el == user.el){
				disname = user.nm;
				name1 = user.nm;
				name2 = user.enm;
				cp = user.cp;
				if (typeof(user.dp) != "undefined"){
					dept = user.dp.replace("#","");
				}				
				if (typeof(cp) == "undefined"){
					cp = "";
				}
			}else{
				disname = user.enm;
				name1 = user.enm;
				name2 = user.nm;			
				if (typeof(user.ecp) != "undefined"){
					cp = user.ecp;
				}				
				if (typeof(user.edp) != "undefined"){
					dept = user.edp.replace("#","");
				}
			}			
			html += "	<div class='result-profile' id='result_"+uuid+"' data='"+disname+"^"+dept+"^"+user.ky+"^"+user.cpc+"^"+user.emp+"'>";
			html += "		<button class='ico btn-check on'>체크</button>";
			html += "		<div class='user-result-thumb'>"+person_img+"</div>";
			html += "		<span class='' id='result_status_"+uuid+"'></span>"	
			html += "		<dl>";
			html += "			<dt><span class='status online'></span>"+name1+"</dt><dd>"+name2+"</dd>";
			html += "           <dd class='status-message' id='result_msg_"+uuid+"'></dd>"
			html += "		</dl>";	
			html += "		<ul class='result-info'>";
			html += "			<li>"+dept+"</li>";
			html += "			<li>"+cp+"</li>";
			html += "		</ul>";		
			html += "	</div>";
		}	
		$("#search_rdis").append(html);	
		_wsocket.temp_list_status(lists, 1, "useraddsearch");	
		$("#search_invite_btn").removeClass("disabled");
		$("#search_invite_btn").attr("style","cursor:pointer");	
		$("#search_rdis .result-profile").unbind("click");
		$("#search_rdis .result-profile").on("click", function(e){			
			if ($(this).find("button").hasClass("on")){
				//선택을 취소한다.
				$(this).find("button").removeClass("on");			
				var cid = $(this).attr("id").replace("result_","");
				$("#" + cid).remove();					
			//	var cnt = $("#addUser_frame .member-profile").length;	
				var cnt = $("#search_result_diss .btn-check.on").length;
				if (cnt  == 0){
					$("#search_invite_btn").addClass("disabled");
					$("#search_invite_btn").attr("style","");	
					$("#sub_search_profile").find("p").show();
				}				
			}else{
				//선택한다.					
				var pinfo = $(this).attr("data").split("^");				
			//	var id = gap.seach_canonical_id(pinfo[2]);
				var id = pinfo[2];			
				id = gap.encodeid(id);
				var callid = id;
	 			var len = $("#addUser_frame").find("#"+id).length;
	 			if (len > 0){
	 				gap.gAlert(gap.lang.existuser);
	 				return false;
	 			}				
	 			$("#sub_search_profile").find("p").remove();
	 			$(this).find("button").addClass("on");			
				var jso = new Object();
				jso.emp = pinfo[4];
				jso.cpc = pinfo[3];	
				var person_img = gap.person_profile_photo(jso);				
				var html = "";
				html += "<div class='member-profile' id='"+callid+"' data='"+pinfo[2]+"'>";
				html += "	<button class='ico btn-member-del'>삭제</button>";
				html += "	<div class='user-result-thumb'>"+person_img+"</div>";
				html += "		<dl>";
				html += "			<dt><span class='status online'></span>"+pinfo[0]+"</dt><dd>"+pinfo[1]+"</dd>";
				html += "		</dl>";
				html += "	</div>";
				html += "</div>";
				$("#addUser_frame").append(html);				
				$("#addUser_frame .member-profile button").on("click", function(){
					//선택한 화면에 선택 상태를 제거한다.					
					var cid = $(this).parent().attr("id").replace("sub_","");
					$("#result_" + cid).find("button").removeClass("on");					
					//현재 박스에서 객체를 삭제한다.
					$(this).parent().remove();					
					var cnt = $("#addUser_frame .member-profile").length;					
					if (cnt  == 0){
						$("#search_invite_btn").addClass("disabled");
						$("#search_invite_btn").attr("style","");				
						$("#sub_search_profile").find("p").show();
					}					
				});				
				var cnt = $("#addUser_frame .member-profile").length;				
				if (cnt > 0){
					$("#search_invite_btn").removeClass("disabled");
					$("#search_invite_btn").attr("style","cursor:pointer");
				}				
			}
		});		
		//전체 보기 클릭시 추가한다.	
		if (gBody.searchcnt == 1){		
			if (typeof(obj.ct) != "undefined"){
				gBody.topsearch_totalcount = obj.ct.cnt;		
			}else{
				gBody.topsearch_totalcount = obj.length;		
			}				
			$("#mss_total").text(gBody.topsearch_totalcount);			
			$("#search_result_diss").mCustomScrollbar('destroy');				
			$("#search_result_diss").mCustomScrollbar({
				theme:"dark",
				autoExpandScrollbar: false,
				scrollButtons:{
					enable:false
				},
				mouseWheelPixels : 200, // 마우스휠 속도
				scrollInertia : 400, // 부드러운 스크롤 효과 적용
				mouseWheel:{ preventDefault: false },
				advanced:{
					updateOnContentResize: true
				},
				autoHideScrollbar : false,

				callbacks:{
					onTotalScroll:function(){ gBody.addContent(this) },
					onTotalScrollOffset:100,
					alwaysTriggerOffsets:false
				}
			});			
		}
	},	
	
	"addContent" : function(obj){
		if (gBody.topsearch_totalcount > gBody.topsearch_curcount){
			var str = $("#user_search_query").val();
			gBody.searchcnt ++;
			_wsocket.search_user_make_chat(str, gBody.topsearch_curcount);
		}
	},	
	
	"rigth_btn_change_empty" : function(){
		$("#show_attach_layer").removeClass("on");
		$("#show_link_layer").removeClass("on");
		$("#show_memo_layer").removeClass("on");		
		$("#show_memo_video").removeClass("on");		
		$("#show_chat_layer").removeClass("on");
		$("#show_todo_layer").removeClass("on");
	},
	
	"rigth_btn_change" : function(obj){
		$("#show_"+obj+"_layer").addClass("on");
	},
	
	"play_video_manual" : function(filename){
		var video = $("#video_play_div");		
		var url = "http://ap-on.amorepacific.com/abc2/wm/";	
	   // video[0].src = "video/"+filename;
		video[0].src = url + filename;
	    video[0].load();
	    video[0].play();
	},
	
	"set_etc_info" : function(obj){
		//최초 로그인시 기본 정보 가져와서 세팅하는 함수
		gBody.favorite_draw(obj);
	},
	
	"add_favorite_member" : function(uid){		
		//기존에 등록된 사용자 이면 삭제하고 없는 사용자면 추가한다.
		if (gBody.check_is_favorite(uid)){
			//삭제한다.
			_wsocket.add_favorite(uid, "d");
		}else{
			//추가한다.
			_wsocket.add_favorite(uid, "a");
		}		
	},	
	
	"check_is_favorite" : function(uid){
		if (typeof(uid) == "undefined"){
			return false;
		}else{
			var list = gap.favorite_list;
			if (typeof(list) == "undefined"){
				return false;
			}else{
				for (var i = 0 ; i < list.length ; i++){
					var info = list[i];
					if (info.ky == uid){
						return true;
					}
				}
				return false;
			}
		}		
	},
	
	
	"group_chat_start" : function (obj){	
		
		var id = obj.replace("group_", "group_ul_");
		var list = $("#" + id).find(".person_dis");		
		if (list.length == 0){
			gap.gAlert(gap.lang.nouser);
			return false;
		}		
		var lists = new Array();
		for (var i = 0 ; i < list.length; i++){
			var info = list[i];
			var ky = $(info).attr("data");
			lists.push(ky);
		}
		lists.push(gap.search_cur_ky());
		
		var res = gap.search_exist_chatroom_nn(lists);
		if (res != ""){
			//기존에 참석자가 포함된 방이 있다는 이야기임
			 gBody.enter_chatroom_for_chatroomlist(res, "", "");
			 return false;
		}
		
		_wsocket.search_user_makeroom(lists);
	},
	
	"group_memo_start" : function(obj){		
		var id = obj.replace("group_", "group_ul_");
		var list = $("#" + id).find(".person_dis");
		var lists = new Array();
		var emails = new Array();
		var names = new Array();		
		for (var i = 0 ; i < list.length; i++){
			var info = list[i];		
			var ky = $(info).attr("data");
			var email = $(info).attr("data2");
			var name = $(info).attr("data4");
			lists.push(ky);
			emails.push(email);
			names.push(name);			
		}		
		gBody.add_member_memo(lists, emails, names);	
	},	
	
	"group_video_invite_send" : function(obj){		
		if (gap.IE_Check()){
			gap.gAlert(gap.lang.IE_Notsupport);
		}else{
			var id = obj.replace("group_", "group_ul_");
			var list = $("#" + id).find(".person_dis");
			var lists = new Array();	
			var lls = "";			
			var video_chat_room_key = gap.userinfo.rinfo.id + "_" + gBody.make_video_roomkey();			
			for (var i = 0 ; i < list.length; i++){
				var info = list[i];
				var ky = $(info).attr("data");				
				var sendObj = new Object();
				sendObj.target_uid = ky;	
				sendObj.room_code = video_chat_room_key;			
				gBody.send_invite_msg(sendObj, "");		
			}		
			//본인은 채팅창을 바로 띄운다.
			gBody.open_video_popup("T", video_chat_room_key);
		}	
	},
	
	"group_mail_start" : function(obj){
		var id = obj.replace("group_", "group_ul_");
		var list = $("#" + id).find(".person_dis");
		var lists = new Array();	
		var lls = "";
		for (var i = 0 ; i < list.length; i++){
			var info = list[i];
			var ky = $(info).attr("data");
			var email = $(info).attr("data2");
			var nm = $(info).attr("data4");
			lists.push(encodeURIComponent(nm) + "<" +email+ ">");			
			if (lls == ""){
				lls = encodeURIComponent(nm) + "<" +email+ ">";
			}else{
				lls += ";" + encodeURIComponent(nm) + "<" +email+ ">";
			}			
		}		
		gBody.open_email_send(lists.join(";"));		
	},	
	
	"group_mail_start_cid" : function(cid){		
		var info = gap.search_chat_info_cur_chatroom(cid);		
		var lists = new Array();
		for (var i = 0; i < info.att.length; i++){
			var ls = info.att[i];
			var name = "";
			if (gap.cur_el == ls.el){
				name = ls.nm;
			}else{
				name = ls.enm;
			}
			var email = ls.em;
			if (gap.search_cur_ky() != ls.ky){
				lists.push(encodeURIComponent(name) + "<" +email+ ">");
			}			
		}
		gBody.open_email_send(lists.join(";"));		
	},
	
	"group_video_invite_cid" : function(cid){		
		if (gap.IE_Check()){
			gap.gAlert(gap.lang.IE_Notsupport);
		}else{
			var xinfo = gap.search_chat_info_cur_chatroom(cid);			
			var video_chat_room_key = gBody.make_video_roomkey();									
			var sendObj = new Object();
			sendObj.target_uid = "";	
			sendObj.room_code = gap.userinfo.rinfo.id + "_" + video_chat_room_key;		
			gBody.send_invite_msg(sendObj, cid);		
			//본인은 채팅창을 바로 띄운다.
			gBody.open_video_popup("T", sendObj.room_code);
		}
	},
	
	"group_memo_start_cid" : function(cid){		
		var xinfo = gap.search_chat_info_cur_chatroom(cid);		
		var lists = new Array();
		var emails = new Array();
		var names = new Array();
		var list = [];
		for (var i = 0; i < xinfo.att.length; i++){		
			var info = xinfo.att[i];	
			if (gap.search_cur_ky() != info.ky){
				var ky = info.ky;
				var email = info.em;
				var name = "";
				if (gap.cur_el == info.el){
					name = info.nm;
				}else{
					name = info.enm;
				}				
				lists.push(ky);
				emails.push(email);
				names.push(name);	
				list.push(info);
			}			
		}
	//	gBody.add_member_memo(lists, emails, names);	
		gRM.create_memo(list);	
	},
	

	
	"open_video_popup" : function(isnew, roomkey){
		var is_dev = false;
		try{
			is_dev = document.location.host.search(/devportal/i) != -1;
		}catch(err){}		
		var video_url = (is_dev ? "https://devportal01.amorepacific.com/devaphqapp" : "https://ap-on.amorepacific.com/aphqappv02");		
		if (isnew == "F"){
			var url = video_url + "/videocall/kfiles.nsf/weBoard?readform&mode=1&isnew=F&roomkey="+roomkey;		
			window.open(url ,'Video Chat','height=' + screen.height + ',width=' + screen.width + 'fullscreen=yes, addressbar=0,toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,screenX=0,screenY=0,top=0,left=0,maximize=1');
		}else{
			var url = "";
			if (roomkey == ""){
				url = video_url + "/videocall/kfiles.nsf/weBoard?readform&mode=1&isnew=T";
			}else{
				url = video_url + "/videocall/kfiles.nsf/weBoard?readform&mode=1&isnew=T&roomkey="+roomkey;
			}					
			window.open(url ,'Video Chat','height=' + screen.height + ',width=' + screen.width + 'fullscreen=yes, addressbar=0,toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,screenX=0,screenY=0,top=0,left=0,maximize=1');
		}
	},	
	
	"send_invite_msg" : function(sendobj, webchatroomkey){	
		var msg = gap.lang.call_attend;					
		var msgid = gap.make_msg_id();		
		if (sendobj.direct == "T"){			
			//현재 대화창에 메시지를 입력한다.
			var date = gap.search_today_only2();
			var time = gap.search_time_only();	
			var bun = date + time.replace(":","");			
			var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.			
			var opt = "me";			
			var type = "msg";		
			var name = gap.userinfo.rinfo.nm;			
			var key = gap.search_cur_ky(); 			
			if ( typeof(sendobj.from) != "undefined" && sendobj.from == "mail"){
				msg = "mail_link-spl-" + sendobj.room_code.title + "-spl-" +  JSON.stringify(sendobj.room_code);
				gBody.chat_draw(opt, name, msg, date, time, type, bun, key, msgid, "", "D", "21", 0 , "", "", "", "", "");				
			}else{
				gBody.chat_draw(opt, name, msg, date, time, type, bun, key, msgid, "", "D", "1", 0, "","","","","");	
			}
			gBody.check_display_layer();			
		}				
		var roomkey = "";
		if (webchatroomkey == ""){
			//1:1일 경우
			//_wsocket.make_chatroom_11(sendobj.target_uid);		
			_wsocket.make_chatroom_11_invite(sendobj.target_uid);
			roomkey = _wsocket.make_room_id(sendobj.target_uid);
		}else{
			//기존에 채팅방이 만들어져 있는 경우
			roomkey = webchatroomkey;
		}		
		var obj = new Object();		
		obj.type = "msg";
		obj.mid = msgid;		
		if (typeof(sendobj.from) != "undefined" && sendobj.from == "mail"){
			obj.msg = "mail_link" + "-spl-" + sendobj.room_code.title + "-spl-" + JSON.stringify(sendobj.room_code);
		}else{
			obj.msg = msg + "-spl-" + sendobj.room_code;
		}	
		roomkey = roomkey.replace(/-lpl-/gi, "_");		
	//	if (roomkey.split("^").length == 4){
			//채팅방 상단에 버튼 클릭시는 ^000000 회사코드를 달고 들어와서 회사코드를 추가로 추가하지 않는다.
			obj.cid = roomkey;
	//	}else{
	//		obj.cid = roomkey + "^" + gap.userinfo.rinfo.cpc;
	//	}		
		obj.ty = 21;		
		var curinfo = gap.userinfo.rinfo;
		obj.name = curinfo.nm;
		obj.name_eng = curinfo.enm;
		obj.el = curinfo.el;		
		_wsocket.send_chat_msg(obj);		
	},	
	
	"make_video_roomkey" : function(){
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (var i = 0; i < 32; i++ ){
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	},
	
	"changename_show" : function(cid){
		var pl = $("#" + cid.replace(/\^/gi,"_") + " .user dt").text();
		 $.confirm({
			 title: gap.lang.changename ,
			 content: '' +
				 '<form action="" class="formName">' +
				 '<div class="form-group">' +
				 '<input type="text" id="smit"  autocomplete="off"  value="'+pl+'" class="name form-control" required />' +
				 '</div>' +
				 '</form>',
			 buttons: {
				 formSubmit: {
					 text: gap.lang.OK,
					 btnClass: 'btn-blue',
					 action: function(){
						 var name = this.$content.find('.name').val();						 
						 var obj = new Object();
						 obj.cid = cid;
						 obj.title = name;	
						 _wsocket.save_chatroom_title(obj);
					 }
				 },
				 cancel: {
					 text: gap.lang.Cancel
				 }				
			 },
			 onContentReady: function(){
				 // you can bind to the form				
				 $("#smit").focus();
				 $("#smit").select();				 
				 var jc = this;
				 this.$content.find('form').on('submit', function(e){ // if the user submits the form by pressing enter in the field.
					 e.preventDefault();
					 jc.$$formSubmit.trigger('click'); // reference the button and click it
				 });
			 }
		 });
	},
	
	"open_notice_list_layer" : function(opt){
		var html = "";		
		var title = gap.lang.notice;
		html += "<h2>" + title + "</h2>";
		html += "<button class='ico btn-article-close' id='notice_list_close'>닫기</button>";
		if (gBody.is_ma == "true"){
			html += "<button class='btn-notice' id='notice_compose'><span>" + gap.lang.notice_compose + "</span></button>";
		}
		html += "<table>";
		html += "	<colgroup>";
		html += "		<col style='' />";
		html += "		<col style='width:170px;' />";
		html += "	</colgroup>";
		html += "	<tbody id='notice_list'>";
		html += "	</tbody>";		
		html += "</table>";
		$("#sub_notice_list").html(html);		
		$("#notice_list_close").on("click", function(){
			$("#sub_notice_list").hide();
		});		
		$("#notice_compose").on("click", function(){
			var url = "/" + gap.noticeDb + "/fmNotice?OpenForm";
			gap.open_subwin(url, "1000", "820", false, "", true);
		});		
		gBody.xml_download('1', 'MeetNotice.nsf', 'vwNoticeList')
	},
	
	"open_notice_content_layer" : function(docid){
		var html = "";		
		var title = gap.lang.notice;
		var url = "/" + gap.noticeDb + "/agGetDocInfo?openagent&unid=" + docid;		
		$.ajax({
			method : "get",
			url : url,
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			success : function(data){
				html += "<h2>" + title + "</h2>";
				html += "<button class='ico btn-article-close' id='notice_content_close'>닫기</button>";
				if (gBody.is_ma == "true"){
					html += "<div class='notice-right-btns'>";
					html += "	<button class='' id='notice_edit'><span>" + gap.lang.basic_modify + "</span></button>";
					html += "	<button class='' id='notice_delete'><span>" + gap.lang.basic_delete + "</span></button>";
					html += "</div>";
				}
				html += "<div id='notice_content_area'>";
				html += "<dl>";
				html += "	<dt><h3>" + data.subject + "</h3><span class='notice-date'>" + data.created + "</span></dt>";
				if (data.attachname != ""){
					var attachname_info = data.attachname.split("-spl-");
					var attachsize_info = data.attachsize.split("-spl-");
					var draw_attach_list = false;					
					for (var i = 0; i < attachname_info.length; i++){
						if (attachname_info[i].substr(0, 6) != "image."){
							draw_attach_list = true;
						}
					}				
					if (draw_attach_list){
						html += "	<dd class='attach-list'>";
						html += "		<ul>";
						for (var i = 0; i < attachname_info.length; i++){
							if (attachname_info[i].substr(0, 6) != "image."){
								var download_url = "/" + gap.noticeDb + "/0/" + docid + "/$FILE/" + encodeURIComponent(attachname_info[i]);
								html += "			<li><a href='" + download_url + "' target='_blank' download><span class='attach-name'>" + attachname_info[i] + "</span> (<span class='attach-size'>" + gap.file_size_setting(attachsize_info[i]) + "</span>)</a></li>";								
							}
						}
						html += "		</ul>";						
						html += "	</dd>";							
					}
				}
				html += "	<dd id='notice_body' style='margin-top:30px;'>";
				html += "	</dd>";	
				html += "</dl>";
				html += "</div>";
				$("#sub_notice_content").html(html);
				$("#notice_content_area").css("height", "calc(100% - 40px)");			
				$(".attach-downlaod").on("click", function(){
					var filename = $(this).attr("data");
					var download_url = "/" + gap.noticeDb + "/0/" + docid + "/$FILE/" + encodeURIComponent(filename);
				});
				$("#notice_edit").on("click", function(){
					var url = "/" + gap.noticeDb + "/0/" + docid + "?EditDocument";
					gap.open_subwin(url, "1000", "820", false, "", true);
				});				
				$("#notice_delete").on("click", function(){
					gBody.delete_notice_doc(docid);
				});
				$("#notice_content_close").on("click", function(){
					try{
						$("#notice_content_area").mCustomScrollbar('destroy');	
					}catch(e){}
					$("#sub_notice_content").empty();
					$("#sub_notice_content").hide();
					$("#sub_notice_list").show();
				});				
				$.ajax({
					method : "get",
					url : "/" + gap.noticeDb + "/0/" + docid + "/Body?OpenField",
					dataType : "text",
					cache : false,
					success : function(data){
						var body_html = gBody.get_body_html(data);
						$("#notice_body").html(body_html);						
						$("#notice_content_area").mCustomScrollbar({
							theme:"dark",
							autoExpandScrollbar: false,
							scrollButtons:{
								enable:false
							},
							mouseWheelPixels : 200, // 마우스휠 속도
							scrollInertia : 400, // 부드러운 스크롤 효과 적용
							autoHideScrollbar : true
						});
					},
					error : function(e){
						gap.error_alert();
					}
				});
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"delete_notice_doc" : function(docid){
		var msg = gap.lang.confirm_delete;
		gap.showConfirm({
			title: "Confrim",
			contents: msg,
			callback: function(){
			//확인을 클릭한 경우
			$.ajax({
				method : "get",
				url : "/" + gap.noticeDb + "/agDocDelete?openagent&unid=" + docid,
				dataType : "json",			
				contentType : "application/json; charset=utf-8",
				cache : false,
				success : function(data){
					if (data.result){
						try{
							$("#notice_content_area").mCustomScrollbar('destroy');	
						}catch(e){}
						$("#sub_notice_content").empty();
						$("#sub_notice_content").hide();
						$("#sub_notice_list").show();
						gBody.open_notice_list_layer();						
						$.ajax({
							method : "get",
							url : "/MeetNotice.nsf/agGetNewNotice?openagent",
							dataType : "json",			
							contentType : "application/json; charset=utf-8",
							success : function(data){	
								if (data.isnew == "false"){
									$("#disp_new_notice").remove();
								}
							},
							error : function(e){
								gap.error_alert();
							}
						});		
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
	},	
	
	"xml_download" : function(page, cdbpath, cviewname){
		var opt = "&start=" + page + "&count=10";
		var url = "/" + cdbpath + "/" + cviewname + "?ReadViewEntries" + opt + "&outputformat=JSON";
		$.ajax({
			method : "get",
			url : url,
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			cache : false,
			success : function(data){
				var docs = data.viewentry;
				var doc_count = (typeof(docs) != "undefined" ? docs.length : 0);
				var html = "";
				if (doc_count == 0){
					html += "		<tr>";
					html += "			<td>" + gap.lang.list_no_document + "</td>"
					html += "			<td></td>"
					html += "		</tr>";						
				}else{
					for (var i = 0; i < doc_count; i++){
						html += "		<tr>";
						html += "			<td><a href='#' class='notice-unid' id='" + docs[i]['@unid'] + "'>" + docs[i].entrydata[0].text[0] + "</a></td>"
						html += "			<td>" + docs[i].entrydata[1].text[0] + "</td>"
						html += "		</tr>";					
					}					
				}
				$("#notice_list").html(html);				
				$(".notice-unid").on("click", function(){
					var docid = $(this).attr("id");
					gap.show_content("notice_content");
					gBody.open_notice_content_layer(docid);	;					
				});
			},
			error : function(e){
				gap.error_alert();
			}
		})	
	},
	
	"get_body_html" : function(data){
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
			return data.replace(/[\n\r]/g," <br />");
		}	
	},	
	
	
	
	
	
	
	
	"readTime_check" : function(data){	
		var lastupdate = data.lastupdate;
		if (data.read_time != ""){
			var lt = parseInt(data.lastupdate);
			var mt = parseInt(data.read_time);
			if (lt > mt){
				return true;
			}
		}		
		return false;
	},	
	
	
	
	

	
	
	"sub_file_delete_send_server" : function(){		
		var sel_val = $("#share_channel_list_popup option:checked").val();
		//gBody3.delete_file_list 배열안에 있는 md5값을 과 gBody3.select_channel_id 값을 활용해서 저장된 파일을 삭제합니다.
		var data = JSON.stringify({
			"id" : gBody.select_channel_id,
			//"id" : sel_val,
			"md5" : gBody.delete_file_list
		});			
		url = gap.channelserver + "/delete_sub_file_list.km";
		$.ajax({
			type : "POST",
			dataType : "json",
			url : url,
			data : data,
			success : function (res){
				if (res.result == "OK"){										
					myDropzone_channel.processQueue();
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				alert(e);
			}
		});		
	},
	
	"sub_file_delete_send_server2" : function(content, mention){		
		var sel_txt = $("#share_channel_list_popup option:checked").text();
		var sel_val = $("#share_channel_list_popup option:checked").val();
		//gBody3.delete_file_list 배열안에 있는 md5값을 과 gBody3.select_channel_id 값을 활용해서 저장된 파일을 삭제합니다.
		//에디터에서 기존에 파일이 있는 경우에 삭제하는 경우 호출되는 함수		
		if (gBody.delete_file_list.length > 0){
			var data = JSON.stringify({
				"id" : gBody.select_channel_id,
			//	"id" : sel_val,
				"md5" : gBody.delete_file_list
			});			
			url = gap.channelserver + "/delete_sub_file_list.km";
			$.ajax({
				type : "POST",
				dataType : "json",
				url : url,
				data : data,
				success : function (res){
					if (res.result == "OK"){									
						var type = "";
						if (typeof(gBody.select_doc_info.info) != "undefined"){
							var original_doc_filecount = gBody.select_doc_info.info.length;
							var cur_editor_delete_filecount = gBody.delete_file_list.length;													
							if (original_doc_filecount != cur_editor_delete_filecount){
								//파일 업로드 형식으로 처리한다... 파일이 하나라도 남아있다는 이야기다
								type = "file";
							}else{
								type = "msg";
							}
						}else{
							type = "msg";
						}					
						var og = gBody.og_search(content);						
						//기존 파일을 모두 삭제한경우 일반 메시지 처럼 저장한다.
						var data = JSON.stringify({
							"type" : type,
//							"channel_code" : gBody.select_channel_code,
//							"channel_name" : gBody.select_channel_name,
							"channel_code" : sel_val,
							"channel_name" : sel_txt,
						//	"email" : gap.userinfo.rinfo.em,
							"email" : gap.userinfo.rinfo.em,
							"ky" : gap.userinfo.rinfo.ky,
							"owner" : gap.userinfo.rinfo,
							"content" : content,
							"mention" : mention,						
							"id" : gBody.select_channel_id,
							"edit" : gBody.edit_mode,
							"og" : og,
							"fserver" : gap.channelserver							
						});						
						gBody.send_msg_to_server(data);
						$("#editor_close").click();						
						if (gBody.edit_mode == "T"){						
						}else{
							gap.scroll_move_to_bottom_time("channel_list", 200);
						}					
						gap.hideBlock();						
					}else{
						gap.gAlert(gap.lang.errormsg);
					}
				},
				error : function(e){
					alert(e);
				}
			});
		}else{			
			//삭제 할 파일 없는 경우
			var type = "";
			if (typeof(gBody.select_doc_info.info) != "undefined"){
				var original_doc_filecount = gBody.select_doc_info.info.length;
				var cur_editor_delete_filecount = gBody.delete_file_list.length;										
				if (original_doc_filecount != cur_editor_delete_filecount){
					//파일 업로드 형식으로 처리한다... 파일이 하나라도 남아있다는 이야기다
					type = "file";
				}else{
					type = "msg";
				}
			}else{
				type = "msg";
			}		
			var og = gBody.og_search(content);			
			//기존 파일을 모두 삭제한경우 일반 메시지 처럼 저장한다.
			var data = JSON.stringify({
				"type" : type,
//				"channel_code" : gBody.select_channel_code,
//				"channel_name" : gBody.select_channel_name,
				"channel_code" : sel_val,
				"channel_name" : sel_txt,
		//		"email" : gap.userinfo.rinfo.em,
				"email" : gap.userinfo.rinfo.em,
				"ky" : gap.userinfo.rinfo.ky,
				"owner" : gap.userinfo.rinfo,
				"content" : content,
				"mention" : mention,		
				"id" : gBody.select_channel_id,
				"edit" : gBody.edit_mode,
				"og" : og,
				"fserver" : gap.channelserver				
			});			
			gBody.send_msg_to_server(data);
			$("#editor_close").click();			
			if (gBody.edit_mode == "T"){						
			}else{
				gap.scroll_move_to_bottom_time("channel_list", 200);
			}		
			gap.hideBlock();
		}
	},
	
	
	
	"change_fix_item" : function(id){		
		_wsocket.fix_top_layer("rp", id);
	},
	
	"change_fix_item2" : function(id){	
		_wsocket.fix_top_layer("up", id);
	},
	
	"disp_right_menu" : function(id){		
		var disp_rm = $("#right_menu").css("display");
		if (id == "todo"){
			if (disp_rm != "none"){
				$("#right_menu").hide();
				$("#main_body").css("right", "0");
			}
		}else if (id == "meet"){
			if (disp_rm == "none"){			
				$("#right_menu").show();
				$("#main_body").css("right", "41px");
			}
		}
	},
	
	
	"create_buddy_group" : function(groupname){
		//버디리스트에서 그룹을 생성하는 기능
		if (typeof(groupname) == "undefined"){
			groupname = "";
		}
		var is_update = groupname != "" ? true : false;
		var html = gBody.buddy_group_layer_html(is_update, groupname);	
		gap.showBlock();
		$("#common_work_layer").show();
		$("#common_work_layer").html(html);		
		$("#input_drive").focus();
		
		
		var $layer = $(html);
		var bl = gap.buddy_list_info.ct.bl;
		if (bl.length > 0) {
			bl.sort(gap.sortNameDesc);			
			var html = '';
			$.each(bl, function(){
				var $tmp = $('<div></div>').text(this.nm);
				html += '<option>' + $tmp.text() + '</option>';
			});
			
			$layer.find('.b_group').show();
			$('#group_select_list').append(html).material_select();
			
			$layer.find('.b_group').show();
			$("#sel_chatting_list").show();
		}
		
	
		//업데이트 인 경우 기존 멤버를 추가해 줘야 한다.		
		if (is_update){
			var cgroup = "";
			
			var grouplist = gap.buddy_list_info.ct.bl;
			for (var k = 0 ; k < grouplist.length; k++){
				if (grouplist[k].nm == groupname){
					if (typeof(grouplist[k].usr) != "undefined"){
						for (var u = 0 ; u < grouplist[k].usr.length; u++){									
							gBody.channel_add_user("B", grouplist[k].usr[u]);
						}
						break;
					}
				}
			}
		}
		//버디리스트에서 검색하고 그룹추가 버튼을 클릭하는 경우 검색결과 사용자를 리스트에 추가한다.
		if (gBody.is_buddylist_search){
			for (var p = 0 ; p < gBody.temp_search_result.length; p++){
				if (gBody.temp_search_result[p].ky != gap.userinfo.rinfo.ky){
					gBody.channel_add_user("B", gBody.temp_search_result[p]);
				}
				
			}
		}
		
		var $layer = $('#update_drive_layer');
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
		
		$("#input_buddylist_user").keydown(function(evt){
			if (evt.keyCode == 13){
				if ($("#input_buddylist_user").val().trim() == ""){
					mobiscroll.toast({message:gap.lang.input_invite_user, color:'danger'});
					return false;
				}
				
				gBody.channel_user_search("B", $("#input_buddylist_user").val());
				$("#input_buddylist_user").val("");
				setTimeout(function(){
					$("#input_buddylist_user").focus();
				}, 1000)
				
			}
		})
		.bind('paste', function(e){
			gap.change_paste_text(e, this);
		});
		$("#org_pop_btn").on("click", function(){
			window.ORG.show(
					{
						'title': gap.lang.invite_user,
						'single':false,
						'pergroup': false,
						'peraddr': false,
						'select': 'person'
					}, 
					{
						getItems:function() { return []; },
						setItems:function(items) { /* 반환되는 Items */						
							gBody.aleady_select_user_count = 0;
							for (var i = 0; i < items.length; i++){
								var _res = gap.convert_org_data(items[i]);
								if (_res.ky.toLowerCase() != gap.userinfo.rinfo.ky.toLowerCase()){
									gBody.channel_add_user('B', _res);
								}
							}
							gBody.alert_aleady_select_user();
						}
					});
		});		
		$("#create_buddylist_save_btn").off().on("click", function(){
			//그룹 추가
			//groupname이 정의 되어 있으면 기존 그룹을 수정하는 것이고 없으면 신규로 생성하는 것이다.
			var sobj = new Object();
			var group_name = "";		
			
			
			var is_new = $('#group_sel_new').is(':checked');
			if (is_new){
				group_name = $("#input_buddy_groupname").val();	
			}else{
				var $sel = $('#group_select_list option:selected');
				var group_name = $sel.text();
			}
			
			
			if (group_name == ""){
				$("#input_buddy_groupname").focus();
				gap.gAlert(gap.lang.inputgroupname);
				
				return false;
			}		
			
			var usrs = []			            
			$("#buddylist_member_list .f_between").each(function(index, key){				
				var id = $(key).attr("data1");
				var name = $(key).attr("data2");
				var opp = new Object();
				opp.nm = name;
				opp.ky = id;
				usrs.push(opp);
			});			
			sobj.nm = group_name;
			sobj.src = usrs;
			dest = "";
			if (groupname != ""){
				_wsocket.update_group(groupname, group_name , usrs);
			}else{
				if (is_new){
					_wsocket.update_group(group_name, "" , usrs);
				}else{
					_wsocket.copy_person_multi(group_name, usrs);
				}
				
			}		
			
			$("#close_buddylist_layer").click();			
			//그룹명 변경
			//_wsocket.change_group(gBody.select_change_group_name, change_group_name);
		});
		$("#close_buddylist_layer").on("click", function(){
			gap.remove_layer('update_drive_layer');
		});
	},	
	
	
	
	"buddy_group_layer_html" : function(is_update, gname){
	
		var html = '';	
		
		html += '<div id="update_drive_layer" class="layer_wrap center" style="width: 400px;">';
		html += '	<div class="layer_inner">';
		html += '		<div id="close_buddylist_layer" class="pop_btn_close"></div>';
		html += '		<h4>' + (is_update ? gap.lang.groupm : gap.lang.addGroup) + '</h4>';
		html += '		<div class="layer_cont left">';
		html += '			<div class="cont_wr rel">';
	//	html += '				<h5>' + gap.lang.groupname + '</h5>';
		
		html +='					<span class="radio_box">';
		html +='						<input type="radio" id="group_sel_new" name="group_select" checked>';
		html +='						<label for="group_sel_new" style="font-size:14px">' + gap.lang.newchatgroup + '</label>';
		html +='					</span>';
		
		html += '				<div class="before_select">';
		html += '					<input type="text" id="input_buddy_groupname" class="input" value="'+gname+'" placeholder="' + gap.lang.inputgroupname + '">';
		html += '				</div>';
	//	html += '				<div class="limit_wr">';
	//	html += '					<span class="num">0</span>/60';
	//	html += '				</div>';
		html += '			</div>';
		
		html += '			<div class="cont_wr rel b_group" id="sel_chatting_list" style="display:none;">';
		html += '				<span class="radio_box">';
		html += '					<input type="radio" id="group_sel_add" name="group_select">';
		html += '						<label for="group_sel_add" style="font-size:14px">' + gap.lang.oldchatgroup + '</label>';
		html += '					</span>';
		html += '					<div class="input-field selectbox">';
		html += '						<select id="group_select_list">';
		html += '						</select>';
		html += '					</div>';
		html += '			</div>';
	
		
		
		
		html += '			<div class="cont_wr rel" style="height: 230px">';
		html += '				<h5>' + gap.lang.invite_member + '</h5>';
		html += '				<div class="before_select f_between">';
		html += '					<input type="text" id="input_buddylist_user" class="input" placeholder="' + gap.lang.inputname + '">';
		html += '					<button id="org_pop_btn" class="type_icon"></button>';
		html += '				</div>';
		html += '				<!-- 선택하면 나오면 화면 -->';
		html += '				<div class="after_select until_wr" style="display:none">';
		html += '					<ul id="buddylist_member_list" class="scroll until p5" style="max-height:125px; overflow-y:auto;">';
		html += '					</ul>';
		html += '				</div>';
		html += '			</div>';
		html += '		</div>';
		html += '		<div class="btn_wr">';
		html += '			<button id="create_buddylist_save_btn" class="btn_layer confirm">' + (is_update ? gap.lang.basic_save : gap.lang.create) + '</button>';
		html += '		</div>';
		html += '	</div>';
		html += '</div>';
		
		return html;
	},
	"go_channel_view" : function(){		
		gap.cur_window = "channel";
		gBody.channel_left_draw();				
		$("#tab1").hide();
		$("#tab2").show();
		$("#tab3").show();		
		$("#left_roomlist").hide();
		$("#left_buddylist").hide();
		$("#group_add_layer").hide();			
		$("#add_group_btn").hide();
		$("#add_group2").hide();
		$("#left_mail").hide();//
		$("#left_channel").show();
		gBody.show_channel();
	},
	
	"channel_left_draw" : function(){		
		var html = "";
		html += "<button class='ico btn-left-fold' id='left_frame_collapse_btn'></button> ";
		html += "<h2 class='left-title'>Channel</h2>";		
		html += "<div class='wrap-nav'>";
		html += "	<div class='nav-tab'>";
		html += "		<ul class='tabs'>";
		html += "			<li class='tab' id='tab3' ><a href='#' id='tab3_sub'></a></li> ";
		html += "			<li class='tab' id='tab2'><a href='#' id='tab2_sub'></a></li>";	
		html += "			<li class='tab' id='tab4'><a href='#' id='tab4_sub'></a></li>";
		html += "		</ul>";
		html += "</div>";
		html += "<div class='nav-channel' id='left_channel' style='display:none; overflow-y:hidden'>";
		html += "	<div class='filter' id='channel_filter'>";
		html += "		<ul>";
		html += "			<li><button class='ico btn-filter-ppt' title='ppt'></button></li>";
		html += "			<li><button class='ico btn-filter-word' title='word'></button></li>";
		html += "			<li><button class='ico btn-filter-excel' title='excel'></button></li>";
		html += "			<li><button class='ico btn-filter-pdf' title='pdf'></button></li>";
		html += "			<li><button class='ico btn-filter-img' title='image'></button></li> ";
		html += "			<li><button class='ico btn-filter-video' title='video'></button></li>";
		html += "		</ul>";
		html += "	</div>";
		html += "	<div class='lnb' id='channel_option'>";
		html += "		<ul>";
		html += "			<li class='lnb-all on' id='allcontent'><em><span class='ico'></span></em></li>";
		html += "			<li class='lnb-upload' id='mycontent'><em><span class='ico'></span></em></li>";
		html += "			<li class='lnb-share' id='sharecontent'><em><span class='ico'></span></em></li>";
		html += "			<li class='lnb-bookmark' id='favoritecontent'><em><span class='ico'></span></em></li>";		
		if (useMention == "T"){
			html += "			<li class='lnb-mention' id='allmention'><em><span class='ico'></span></em></li>";			
		}		
		html += "		</ul>";
		html += "	</div>";
		html += "	<div class='folder-area' id='left_channel_list' style='overflow:hidden; height:calc(100% - 200px)'>";
		html += "	</div>";
		html += "</div>";
		html += "<div class='nav-list room' id='left_mail' style='display:none; padding-right:5px; overflow:hidden'>";
		html += "	<div class='nav-list-top'>";
		html += "		<div class='nav-category'>";
		html += "			<div class='input-field selectbox'>";
		html += "				<select id='mailbox_select'>";
		html += "					<option value='1' selected id='menu_inbox'>Inbox</option>";
		html += "					<option value='2' id='menu_sent'>Sent</option>";
		html += "				</select>";
		html += "			</div>";
		html += "		</div>";
		html += "		<button class='ico btn-search' id='btn_search'>Search</button>";
		html += "		<button class='ico btn-search-close' id='btn_search_close' style=''>Close</button>";
		html += "		<button class='ico btn-mail-write' id='mail_compose_btn'>Compose</button>";
		html += "		<div class='mail-search' id='left_mail_search' style='display:none;'>";
		html += "			<div class='input-field'> ";
		html += "				<input type='text' id='mail_search_query_field' autocomplete='off' class='formInput' placeholder=''>";
		html += "					<span class='bar'></span>";
		html += "			</div>";
		html += "			<button class='ico btn-search' id='mail_search_btn'>Search</button>";
		html += "		</div>";
		html += "	</div>";
		html += "	<div id='left_mail_list' class='ui-droppable' style='height:calc(100% - 50px)'>";
		html += "	<div id='left_mail_sub' style=''></div>";
		html += "</div>";
		html += "</div>";
		html += "</div>";		
		$("#nav_left_menu").html(html);		
		$("#tab2_sub").text(gap.lang.channel);
		$("#tab3_sub").text(gap.lang.channel);
		$("#tab4_sub").text(gap.lang.mail);		
		gBody.channel_left_event_handler();	
		$("#tab4_sub").removeClass("active");	
		$("#tab3_sub").addClass("active");			
		$('.tabs').tabs();	
		///전체 보기에서는 우측 프레임을 닫는다.
		gBody.channel_right_frame_close();		
		//가장 우측 메뉴 제거한다.
		gBody.chat_right_menu_close();		
		//채널에서 댓글 클릭시 TODO에서 클릭한 것이 아니라고 설정한다.
		gBody.cur_todo = "";	
		//Box에 읽지 않은 내용이 있는지 체크한다.
		gBody.check_unread();
	},
	
	"chat_right_menu_close" : function(){
		$("#right_menu").hide();
		$("#main_body").css("right", "0px");
	},
	
	"chat_right_menu_open" : function(){	
		$("#right_menu").show();
		$("#main_body").css("right", "41px");
	},	
	
	"channel_right_frame_close" : function(){		
		$(".left-area").css("width", "100%");							
		$("#ext_body").hide();
		$("#user_profile").hide();
		$("#chat_profile").hide();		
		$("#channel_right").hide();		
		$("#main_body").css("width", "");
	},
	
	"channel_left_event_handler" : function(){		
		$(".tabs .tab").on("click", function(event){
			//버디리스트, 채팅방 탭 클릭						
			if (this.id == "tab3"){
				$("#left_mail").hide();
				$("#left_channel").show();
				gBody.show_channel();
			}else if (this.id == "tab4"){
				$("#left_roomlist").hide();
				$("#left_buddylist").hide();
				$("#group_add_layer").hide();			
				$("#add_group_btn").hide();
				$("#add_group2").hide();
				$("#left_channel").hide();
				$("#left_mail").show();
				$("#btn_search").show();
				$("#btn_search_close").hide();
				$("#left_mail_search").hide();
				$("#mail_search_query_field").val("");
				mail_select_mode = "1";
				is_more_action = "0";
				gBody4.get_mail_list("", "inbox", 1);				
				$("#menu_inbox").text(gap.lang.menu_inbox);
				$("#menu_sent").text(gap.lang.menu_sent);
				$("#mail_search_query_field").attr("placeholder", gap.lang.input_search_query);
				$('#mailbox_select').val('1').material_select();
			}			
			gBody.cur_tab = this.id;
		});	
	},	
	
	
	
	
	"change_page" : function(){
		gma.hideChatButton();		
		var pa = gap.param;	
		gap.cur_el = gap.userinfo.rinfo.el;   //채틸을 호출하지 않고 다이렉트로 호출되면 언어 타입이 설정되지 않는 문제 해결
		if (pa.indexOf("key=") > -1){
			$("#right_menu").show();	
			if (call_key != ""){
				$("#right_menu").css("top", "0px");
			}
		}else{			
			if (pa != "" || typeof(pa) != "undefined"){
				$(".left-menu li").removeClass("act");
				if (pa != ""){
					gap.change_location(pa);
					$("#" + pa).addClass("act");
				}				
				if (pa == "abc2"){				
					$("#right_menu").show();				
					setTimeout(function(){	
							
//						var lock = localStorage.getItem(gap.userinfo.rinfo.ky + "_chat_tab");
//						if (typeof(lock) == "undefined"){
//							if ($("#menu_id_3").text() != ""){
//								//읽지 않은 채팅 건수가 포함된 경우
//								$("#tab2_sub").click();
//							}else{
//								$("#tab1_sub").click();
//							}
//						}else{
//							if (lock == "2"){
//								$("#tab2_sub").click();
//							}else{
//								$("#tab1_sub").click();
//							}
//						}
						$("#tab2_sub").click();	
					
						
						setTimeout(function(){									
							if (typeof(gap.param2) != "undefined"){								
								if (gap.param2 == "openmemo"){
									gBody.add_member_memo_call_org();
								}else{
									var room_key = decodeURI(gap.param2).replace(/\^/gi,"_");
									if (room_key.indexOf("s_") > -1){
										var pk = room_key.replace("s_","");
										var plist = pk.split("_");
										var youkey = "";
										for (var u = 0 ; u < plist.length; u++){
											if (plist[u] != gap.userinfo.rinfo.ky){
												youkey = plist[u];
											}
										}
										gBody.chat_room_goto(room_key, youkey);
									}else{
										gBody.chat_room_goto(room_key, "");
									}
								}
							};						
						}, 1000);
					}, 500);				
				}else if (pa == "channel"){
				//	gBody.go_channel_view();							
					///채널이 abc2안에 있기 때문에 abc2 메뉴를 클릭한 표시를 지정한다.					
					$("#channel").addClass("on");					
					setTimeout(function(){							
						$("#tab3_sub").click();							
						//////////////////////////////////
						setTimeout(function(){							
							if (typeof(gap.param2) != "undefined"){
								//$("#611c94c847b6e8339de51038").click();
								//$("#" + gap.param2).click();
								gBody.show_channel_data(gap.param2)
							};							
						}, 100);
					}, 500);					
				}else if (pa == "todo"){
					gBody.goTodo();
					//gap.param2 : 프로젝트 코드  (ex : 60ac8ef4be76e1515907f36e);
					//gap.param3 : 프로젝트 내에 특정 할일 코드 (ex : 60aca9b0be76e1515907f379);
					setTimeout(function(){
						if (typeof(gap.param2) != "undefined"){
							$("#em_" + gap.param2).click();
							if (typeof(gap.param3) != "undefined"){
								setTimeout(function(){
									$("#card_" + gap.param3).click();
								}, 500);
							}
						}						
					}, 500);
				}else if (pa == "drive"){					
					gBody.go_drive_view();
					//gap.param2 : 드라이브 코드 (ex : 611c8dfd47b6e8339de51037);
					setTimeout(function(){
						$("#" + gap.param2).click();
					}, 500);
				}else if (pa == "home"){
					gHome.init();
				}
			}
		}		
		// 채팅 레이어
		gma.showChatButton();
	},
	
	"goOrg" : function(){
		//가장 우측 메뉴 제거한다.		
		gBody.chat_right_menu_close();				
		gOrg.showMainOrg();		
	},
	
	"goMeeting" : function(){
		//가장 우측 메뉴 제거한다.
		gBody.chat_right_menu_close();
		gMet.showMainMeeting();
	},
	
	"goCollect" : function(){
		//가장 우측 메뉴 제거한다.		
		gBody.chat_right_menu_close();
		gCol.showMainCollect();		
	},	
	
	/*
	 * mention 입력할때 필요한 데이터를 미리 가져온다
	 */
	"init_mention_userdata" : function(){
		$('#message_txt_channel').mentionsInput({
			onDataRequest:function (mode, query, callback) {
				var list = gBody.search_channel_members(gBody.cur_opt);
				var data = JSON.parse(gap.convert_mention_userdata(list));				
				data = _.filter(data, function(item) { return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1 });
				callback.call(this, data);
			}
		});
	},
	
	
	"daesang_channel" : function(){		
		$("#center_content").show();
		$("#user_profile").hide();
		$("#left_main").show();
		$("#main_body").show();
		$(".tabs").tabs();
		$("#sub_channel_content").hide();
		$("#channel_right").hide();
		$("#center_content_main").hide();	
		$("#person_dis").show();	
		$("#work_filter").off();
		$("#work_filter").on("click", function(e){
			gBody.draw_work_card(e);
		});	
		gBody.work_view = localStorage.getItem("work_view");		
		if (gBody.work_view == null){
			gBody.work_view = "1";
		}		
		if (gBody.work_view == "2"){
			$("#show_mypage").hide();		
			$("#work_show_card").show();
			$("#work_filter").removeClass("on");
		}else{
			$("#show_mypage").show();		
			$("#work_show_card").hide();
			$("#work_filter").addClass("on");
		}		
		var s_key = moment().date(1).startOf('month').format('YYYY-MM-DD[T00:00:00Z]'); // 타임존 때문에 데이터 안나오는 경우 없도록 시작일 -1
		var e_key = moment().date(1).endOf('month').format('YYYY-MM-DD[T23:59:59Z]'); // Mini캘린더에 뿌려지는 날짜수 +1
		gBody.sdate = s_key;
		gBody.edate = e_key;
		var data = JSON.stringify({
			start : gBody.sdate,
			end : gBody.edate,
			type : gBody.cMain
		});
		//type : "1" 내가할일,, "2" 내가 지시한일,  "3"검색
		var url = gap.channelserver + "/channel_my_todo_list.km";		
		$.ajax({
			type : "POST",
			dataType : "json",
			data : data,
			url : url,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){				
				//카드뷰를 미리 만들어 놓는다.
				gBody.view_work_card_show(res);				
				gBody.mygraph = $('#show_mypage').mobiscroll().eventcalendar({
					locale : mobiscroll.localeKo,
					view : {
						timeline : {
							type : "month",
							startDay: 1,
		                    endDay: 5,
		                    weekNumbers: true,
		                    eventList: true
						}		
					},
					data: res.data,
				    resources: res.resources,
				    onEventClick: function (args) {	
						tempEvent = args.event;
						gTodo.compose_layer(tempEvent.key);
				    },
				    renderScheduleEvent: function (data) {				    
				        var ev = data.original;  
				        var color = "";
				        var fcolor = "";
				        var preText = "";
				        if (ev.pri == "1"){
				        	color = "#FFEAE7";
				        	fcolor = "#ED677E";
				        	preText = "<span style='color:"+fcolor+"; margin-right:10px'>1순위</span>";
				        }else if (ev.pri == "2"){
				        	color = "#FDF5D9";
				        	fcolor = "#F39562";
				        	preText = "<span style='color:"+fcolor+"; margin-right:10px'>2순위</span>";
				        }else if (ev.pri == "3"){
				        	color = "#E6F0FF";
				        	fcolor = "#7194EC";
				        	preText = "<span style='color:"+fcolor+"; margin-right:10px'>3순위</span>";
				        }else if (ev.pri == "4"){
				        	color = "#F4EFF6";
				        	fcolor = "#71368D";
				        	preText = "<span style='color:"+fcolor+"; margin-right:10px'>4순위</span>";
				        }			       
				        var html = "";
				        html += "<div class='nonewline'>";
				        html += "	<div class='main-cal-event event-work' style='font-weight:bold; background-color:"+color+"'>";
				        html += "		<span class='marker' style='background:"+fcolor+"'></span>";
				        if (ev.status == '3'){
				        	html += "		<span class='event-text' style='text-decoration:line-through'>" + preText + " " + ev.title+"</span>"
				        }else{
				        	html += "		<span class='event-text'>" + preText + " " + ev.title+"</span>"
				        }				        
				        html += "	</div>";
				        html += "</div>";				        
				        return html;
				    },
				    onInit: function(event, inst){
					},					
					onPageLoaded: function (event, inst) {						
						setTimeout(function(){
							var list = $("#show_mypage .mbsc-timeline-resource.mbsc-ios.mbsc-ltr");
							for (var i = 0 ; i < list.length; i++){
								var item = list[i];
								var kk = $(item).css("min-height").replace("px","");
								if (kk < 100){
									$(item).css("min-height", "100px");
								}
							}							
							var list = $("#show_mypage .mbsc-flex.mbsc-timeline-row.mbsc-ios");
							for (var i = 0 ; i < list.length; i++){
								var item = list[i];
								var kk = $(item).css("min-height").replace("px","");
								if (kk < 100){
										$(item).css("min-height", "100px");
								}
							}						
						}, 10);
				    },			    
					onPageChange: function(event, inst){
						// 월을 변경할 때 호출					
						var s_key = moment(event.firstDay).format('YYYY-MM-DD[T00:00:00Z]');
						var e_key = moment(event.lastDay).add(-1,'days').format('YYYY-MM-DD[T23:59:59Z]');
						gBody.sdate = s_key;
						gBody.edate = e_key;
						gBody.daesang_channel_search();
					},
				    onSelectedDateChange: function(event, inst){
					},				    
				    onEventHoverIn: function (args, inst) {
			        },
			        onEventHoverOut: function (args) {
			        }
				}).mobiscroll('getInst');			
				//참조자 표시하기
			//	if (typeof(res.ref) != "undefined" && res.ref.length > 0){
					gBody.draw_ref(res.ref);
					$(".left-area").css("width", "calc(100% - 315px)");					
			//	}else{
			//		$(".left-area").css("width", "100%");
			//	}			
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
	},
	
	"view_work_card_show" : function(res){		
		var resources = res.resources;		
		var html = "";
		html += "<div class='flex' style='overflow-x:auto'>";		
		for (var i = 0; i < resources.length; i++){
			var info = resources[i];
			var id = "work_" + info.id;
			html += "	<div class='request-card-wr'>";
			html += "		<h2>"+info.name+"</h2>";
			html += "		<div class='request-card-list custom-scroll' id='"+id+"'>";	
			html += "		</div>";
			html += "	</div>";
		}					
		html += "</div>";			
		$("#work_show_card").html(html);		
		gBody.work_card(res.data);		
	},
	
	"work_card" : function(items){
		var p1 = 0;
		var p2 = 0;
		var p3 = 0;
		var p4 = 0;		
		for (var i = 0 ; i < items.length; i++){
			var item = items[i];
			var status = item.status;
			var dis_status = "";
			if (status == "0"){
				dis_status = gap.lang.temps;				
			}else if (status == "1"){
				dis_status = gap.lang.wait;
			}else if (status == "2"){
				dis_status = gap.lang.doing;
			}else if (status == "3"){
				dis_status = gap.lang.done;
			}			
			var dinfo = gTodo.date_diff(item.start, item.end);			
			var person_img = gap.person_profile_photo(item.user);
			var name = item.user.nm;
			var deptname = item.user.dp;
			var jt = item.user.jt;
			if (gap.userinfo.rinfo.el != item.user.el){
				name = item.user.enm;
				if (name == ""){
					name = item.user.nm;
				}
				deptname = item.user.dp;
			}			
			var ordercls = "";
			if (item.pri == "2"){
				ordercls = "2nd";
				p2++;
			}else if (item.pri == "3"){
				ordercls = "3th";
				p3++;
			}else if (item.pri == "4"){
				ordercls = "4th";
				p4++
			}else if (item.pri == "1"){
				ordercls = "1st";
				p1++;
			}			
			if (item.status == "3"){
				ordercls += " done";
			}		
			var html = "";
			html += "<ul>";
			html += "	<li class='request-card order-"+ordercls+"' id='"+item.key+"' style='cursor:pointer'>";
			html += "		<div class='top'>";
//			html += "			<button class='ico btn-more bl'>더보기</button>";
			html += "			<div>";
			html += "				<p class='work-staus'>"+dis_status+"</p>";
			html += "				<p class='tit'>"+item.title+"</p>    ";			
			html += "				<p class='date'>"+dinfo.st+" ~ "+dinfo.et+"</p>";
			html += "			</div>";
			html += "			<div class='team-mem flex'>";
			html += "				<div class='team-img user'>";
			html += "					<div class='user-thumb'>" + person_img + "</div>";
	//		html += "					<span class='status online' id='status_"+item.user.ky+"'></span>";
			html += "				</div>";
			html += "				<div>";
			html += "					<p class='mem-name'>"+name+"</p>";
			html += "					<div class='flex'>";
			if (jt != ""){
				html += "						<p class='team-level'>"+jt+"</p>";
				html += "						<p class='team-name'>"+deptname+"</p>";
			}else{
				html += "						<p class='team-name'>"+deptname+"</p>";
			}			
			html += "					</div>";
			html += "				</div>";
			html += "			</div>";
			html += "		</div>";
			html += "		<div class='bot flex'>";
			html += "			<div class='add-file'>";
			html += "				<span class='ico ico-file'></span> " + item.filecount;
			html += "			</div>";
			html += "			<div class='reply'>";
			html += "				<span class='ico ico-textball'></span> " + item.replycount;
			html += "			</div>";
			html += "		</div>";
			html += "	</li>";
			html += "</ul>";			
			$("#work_" + item.resource).append(html);
		}	
		//우선순위 개수 재정리 한다.
		$("#pri_1").html(p1);
		$("#pri_2").html(p2);
		$("#pri_3").html(p3);
		$("#pri_4").html(p4);		
		$(".request-card").off();
		$(".request-card").on("click", function(e){			
			var id = $(e.currentTarget).attr("id");
			gTodo.todo_show_other_app(id);
		});
	},
	
	"work_card2" : function(items){		
		var p1 = 0;
		var p2 = 0;
		var p3 = 0;
		var p4 = 0;
		for (var i = 0 ; i < items.length; i++){
			var item = items[i];			
			var status = item.status;
			var dis_status = "";
			if (status == "0"){
				dis_status = gap.lang.temps;				
			}else if (status == "1"){
				dis_status = gap.lang.wait;
			}else if (status == "2"){
				dis_status = gap.lang.doing;
			}else if (status == "3"){
				dis_status = gap.lang.done;
			}			
			var dinfo = gTodo.date_diff(item.start, item.end);			
			var person_img = gap.person_profile_photo(item.user);
			var name = item.user.nm;
			var deptname = item.user.dp;
			var jt = item.user.jt;
			if (gap.userinfo.rinfo.el != item.user.el){
				name = item.user.enm;
				if (name == ""){
					name = item.user.nm;
				}
				deptname = item.user.dp;
			}			
			var ordercls = "";
			if (item.pri == "2"){
				ordercls = "2nd";
				p2++;
			}else if (item.pri == "3"){
				ordercls = "3th";
				p3++;
			}else if (item.pri == "4"){
				ordercls = "4th";
				p4++
			}else if (item.pri == "1"){
				ordercls = "1st";
				p1++;
			}		
			var html = "";
			html += "<ul>";
			html += "	<li class='request-card order-"+ordercls+"' id='"+item.key+"' style='cursor:pointer'>";
			html += "		<div class='top'>";
//			html += "			<button class='ico btn-more bl'>더보기</button>";
			html += "			<div>";
			html += "				<p class='work-staus'>"+dis_status+"</p>";
			html += "				<p class='tit'>"+item.title+"</p>    ";
			html += "				<p class='date'>"+dinfo.st+" ~ "+dinfo.et+"</p>";
			html += "			</div>";
			html += "			<div class='team-mem flex'>";
			html += "				<div class='team-img user'>";
			html += "					<div class='user-thumb'>" + person_img + "</div>";
			html += "					<span class='status online' id='status_"+item.user.ky+"'></span>";
			html += "				</div>";
			html += "				<div>";
			html += "					<p class='mem-name'>"+name+"</p>";
			html += "					<div class='flex'>";
			if (jt != ""){
				html += "						<p class='team-level'>"+jt+"</p>";
				html += "						<p class='team-name'>"+deptname+"</p>";
			}else{
				html += "						<p class='team-name'>"+deptname+"</p>";
			}			
			html += "					</div>";
			html += "				</div>";
			html += "			</div>";
			html += "		</div>";
			html += "		<div class='bot flex'>";
			html += "			<div class='add-file'>";
			html += "				<span class='ico ico-file'></span> " + item.filecount;
			html += "			</div>";
			html += "			<div class='reply'>";
			html += "				<span class='ico ico-textball'></span> " + item.replycount;
			html += "			</div>";
			html += "		</div>";
			html += "	</li>";
			html += "</ul>";			
			$("#work_" + item.resource).append(html);
		}	
		//우선순위 개수 재정리 한다.
		$("#pri_1").html(p1);
		$("#pri_2").html(p2);
		$("#pri_3").html(p3);
		$("#pri_4").html(p4);		
		$(".request-card").off();
		$(".request-card").on("click", function(e){
			var id = $(e.currentTarget).attr("id");
			gTodo.todo_show_other_app(id);
		});
	},
	
	"draw_work_card" : function(e){
		var has = $(e.currentTarget).hasClass("on");
		if (has){
			$("#show_mypage").hide();
			$("#work_show_card").show();
			$("#work_filter").removeClass("on");
			try{
				localStorage.setItem("work_view", "2");
			}catch(e){}
		}else{
			$("#show_mypage").show();
			$("#work_show_card").hide();
			$("#work_filter").addClass("on");
			try{
				localStorage.setItem("work_view", "1");
			}catch(e){}
		}		
	},	
	
	"daesang_channel_search" : function(){
		//channel_my_todo_list.km
		var url = gap.channelserver + "/channel_my_todo_list.km";
		var data = JSON.stringify({
			start : gBody.sdate,
			end : gBody.edate,
			type : gBody.cMain
		});		
		$.ajax({
			type : "POST",
			dataType : "json",
			data : data,
			url : url,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				//카드뷰를 미리 만들어 놓는다.
				gBody.view_work_card_show(res);				
				gBody.mygraph.setEvents(res.data);				
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
	},
	
	"draw_ref" : function(list){		
		//채팅에서 올수 있기 때문에 해당 값을 초기화 시킨다.
		gBody.cur_cid == "";			
		$("#user_profile").empty();	
		if (list.length == 0){
			$("#user_profile").hide();
			$("#center_content").css("width", "calc(100% - 10px)")
		}else{
			$("#user_profile").show();
		}		
		var html = "";		
		html += "<div class='mu_container mu_work' style='position:unset'>";
		html += "<aside class='work-aside meeting'>";	
		html += "	<div class='aside-wide'>";
		html += "		<button class='ico btn-right-fold'>접기</button> ";
		html += "		<div class='nav-tab'>";
		html += "			<ul class='tabs' id='rmet'>";
		html += "				<li class='tab on'><a href='' id='tp1'>"+gap.lang.chat+"</a></li>";
		html += "				<li class='tab'><a href='' id='tp2'>"+gap.lang.reference+"</a></li>";
		html += "			</ul>";
		html += "		</div>";
		html += "		<div class='aside-inner' id='mchatlist'>";
		html += "			<div class='input-field' style='padding : 0 15px 0 15px'>";
		html += "				<span class='ico ico-search' style='left:25px; top:16px'></span>";
		html += "				<input type='text' class='formInput' id='search_user_fd' autocomplete='off' placeholder='"+gap.lang.inpuser+"' />";
		html += "			</div>";
		html += "		</div>";
		html += " 		<div class='chatting' style='padding-top:0px; height:calc(100% - 80px);'><div class='chat-area' style='height:100%'><div class='chat_msg' style='height:100%'>";
		html += "       	<div id='ref_dis' style='height:100%'><div id='chat_msg_dis_ref'></div></div>";
		html += "       </div></div></div>"
		html += "	</div>";
		html += "	<div class='type_list_wr rel meet_mem' id='minchat'>";
		html += "		<input type='text' name='' id='search_user_msg' class='' autocomplete='off' placeholder='"+gap.lang.input_message+"'>";
		html += "		<div class='abs type_icon' id='search_user_msg_submit' style='cursor:pointer'></div>";
		html += "	</div>";
		html += "</aside>";
		html += "</div>>";		
		$("#user_profile").show();
		$("#user_profile").append(html);			
		$('#rmet').tabs();		
		$("#search_user_msg_submit").on("click", function(e){
			gBody.send_msg_search();
		});		
		$("#search_user_msg").keypress(function(e){
			if (e.keyCode == 13){					
				gBody.send_msg_search();
				return false;
			}			
		});		
		$("#search_user_fd").keypress(function(e){
			if (e.keyCode == 13){				
				var query = $("#search_user_fd").val();	
				if (query.indexOf(",") > -1){
					gap.gAlert(gap.lang.onesok);
					$("#search_user_fd").val("");
					$("#search_user_fd").focus();
					return false;
				}
				gsn.requestSearch('', query, function(sel_data){		           
		             var obj = new Array();
		             for (var i = 0 ; i < sel_data.length; i++){
		            	 obj.push(sel_data[i]);
		             }		             
		             gBody.chat_one_to_one(obj);
		         });				
				return false;
			};
		});		
		$("#rmet .tab a").on("click", function(e){
			$("#rmet .tab a").removeClass("active");
			$("#rmet .tab").removeClass("on");
			$(this).addClass("active");	
			$(this).parent().addClass("on");		
			var id = $(e.currentTarget).attr("id");
			if (id == "tp2"){
				$("#rmet .indicator").css("left", "130px");
				$("#mchatlist").hide();
				$("#minchat").hide();
				$("#ref_dis").show();
				$("#ref_dis").empty();
				gBody.draw_referlist(list);
			}else{
				$("#rmet .indicator").css("left", "0px");
				$("#mchatlist").show();
				$("#minchat").show();
				$("#ref_dis").hide();
				gBody.draw_ref(list);
			}			
			return false;
		});	
		return false;			
	},
	
	"chat_one_to_one" : function(obj){	
		if (obj.length == 0){
			gap.gAlert(gap.lang.searchnoresult);
			return false;
		}
		var cid = obj[0].ky;
		var name = obj[0].nm;
		var owner = gap.userinfo.rinfo.ky;	
		var room_key = _wsocket.make_room_id(cid);
		gBody.cur_cid = room_key;		
		cid = gap.decodeid(room_key);
		var bol = false;		
		if (cid != ""){
			gBody.remove_user_status.push(cid);
		}	
		var chlist = gap.chat_room_info.ct;			
		for (var i = 0 ; i < chlist.length; i++){
			var inx = chlist[i];
			if (gap.encodeid(inx.cid) == gap.encodeid(cid)){
				var att = inx.att;
				bol = true;
				for (var j = 0 ; j < att.length; j++){
					var at = att[j];
					if (at.ky != gap.search_cur_ky()){
						_wsocket.search_user_one_for_profile(at.ky);							
					}					
				}					
				gBody.cur_room_att_info_list = inx.att;
				break;
			}
		}
		if (bol == false){							
			gap.tmppage = "";			
			gBody.cur_cid = cid;			
			$("#search_user_msg").val("");	
			_wsocket.make_chatroom_11_only_make(cid, name);
		}else{
			_wsocket.load_chatlog_list_channel(cid);					
			//gBody.chat_start(cid);
		}	
		for (var i = 0 ; i < gBody.cur_room_att_info_list.length; i++){
			gBody.remove_user_status.push(gBody.cur_room_att_info_list[i].ky);
		}	
	},	
	
	"write_chat_log_channel" : function(obj){		
		gap.curpage = "chat";
		$("#"+gBody.chat_show_channel_sub).empty();
		gma.chat_position = "channel";
		var info = obj.ct.log;		
		gBody.write_chat_log(info, "T", obj.ek);		
		$("#"+ gBody.chat_show_channel).show();		
		try{
			$("#" + gBody.chat_show_channel).mCustomScrollbar('destroy');			
		}catch(e){}		
		$("#" + gBody.chat_show_channel).mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable: true
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
	//			updateOnContentResize: true
			},
			autoHideScrollbar : false,
			setTop : ($("#"+gBody.chat_show_channel).height()) + "px",
			callbacks : {
				onTotalScrollBack: function(){
					gBody.scrollP = $("#"+gBody.chat_show_channel).find(".mCSB_container").height();
					gBody.chat_addContent(this, gBody.cur_cid, "channel");			
				},
				onTotalScrollBackOffset: 10,
				alwaysTriggerOffsets:true
			}
		}); //.mCustomScrollbar("scrollTo", "bottom", {scrollInertia : 0})
		
	},
	
	"write_chat_log_channel_continue" : function(logs){		
		var obj = logs.ct.log;
		gma.chat_position = "channel";		
		var count = obj.length;
		if (count > 0){
			gBody.write_chat_log(obj, "F", logs.ek);			
			setTimeout(function(){
				gBody.fix_position();
			}, 500);
		}	
	},
	
	"send_msg_search" : function(){	
		if (gBody.cur_cid == "" || gma.chat_position == ""){
			gap.gAlert(gap.lang.inpuser);
			return false;
		}
		gma.chat_position = "channel";		
		var opt = "me";
		var msg = $("#search_user_msg").val();
		var type = "msg";
		var name = gap.userinfo.rinfo.nm;		
		var key = gap.search_cur_ky(); 	
		gBody.MessageSend(opt, msg, type, name, key, "");		
		$("#search_user_msg").val("");
	},
	
	"draw_referlist" : function(list){
		var html = "";		
		html += "<div class='todo-bookmark' style='height:100%; padding: 5px'>";
	//	html += "	<h2 style='margin-bottom:18px'>" + gap.lang.ref + "</h2>";
		html += "	<button class='ico btn-right-close' id='star_layer_close' >닫기</button>";		
		html += "	<div class='card-list' id='wrap_todo_star_list' style='height:calc(100% - 40px)'>";
		html += "		<ul class='card' id='todo_star_list' style='padding-right:13px;'>";		
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];			
			var file_count = item.file.length;
			var reply_count = (item.reply != undefined ? item.reply.length : 0);
			var total_check_count = item.checklist.length;
			var checked_count = 0;
			for (var j = 0; j < item.checklist.length; j++){
				if (item.checklist[j].complete == "T"){
					checked_count++;
				}
			}		
			html += "<li id='star_" + item._id.$oid  + "' style='list-style:none; height:150px; text-align:left'>";
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
			html += "	<dl class='icons' style='padding-top:0px'>";
			html += "		<dd><span class='ico ico-clip'></span><em>" + file_count + "</em></dd>";
			html += "		<dd><span class='ico ico-reply'></span><em>" + reply_count + "</em></dd>";
			html += "		<dd><span class='ico ico-checklist'></span><em>" + checked_count + "/" + total_check_count + "</em></dd>";
			html += "	</dl>";
			html += "</li>";					
		}	
		html += "		</ul>";
		html += "	</div>";
		html += "</div>";		
		$("#ref_dis").append(html);		
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
//				onTotalScrollBackOffset: 100,
//				onTotalScroll: function(){
//					gTodoC.add_todo_mention_list(page_no + 1);
//				},
//				onTotalScrollOffset: 100,
				alwaysTriggerOffsets:true
			}
		});	
		$("#ref_dis li").off().on("click", function(){
			gTodo.compose_layer( $(this).attr("id").replace("star_", "") );
		});
	},	
	
	"__daesang_channel_event" : function(){		
		$("#p1").on("click", function(e){
			$('#show_mypage').mobiscroll('destroy');
			//$("#show_mypage").empty();		
			$("#work_show_card").empty();			
			$(".work-tab li").removeClass("on");
			$(e.currentTarget).addClass("on");			
			$("#work_search").hide();
			$("#work_filter").show();			
			gBody.cMain = "1";
			gBody.daesang_channel();
		});		
		$("#p2").on("click", function(e){
			$('#show_mypage').mobiscroll('destroy');
			//$("#show_mypage").empty();		
			$("#work_show_card").empty();			
			$(".work-tab li").removeClass("on");
			$(e.currentTarget).addClass("on");			
			$("#work_search").hide();
			$("#work_filter").show();			
			gBody.cMain = "2";
			gBody.daesang_channel();
		});		
		$("#p3").on("click", function(e){			
			$('#show_mypage').mobiscroll('destroy');
			//$("#show_mypage").empty();		
			$("#work_show_card").empty();
			$("#channel_main").css("overflow", "hidden");			
			$(".work-tab li").removeClass("on");
			$(e.currentTarget).addClass("on");			
			$("#work_search").show();
			$("#work_filter").hide();			
			//우선순위 개수 초기화 한다.
			$("#pri_1").html(0);
			$("#pri_2").html(0);
			$("#pri_3").html(0);
			$("#pri_4").html(0);			
			//채널 리스트를 추가한다.  select_my_channel_combo
			var clist = gBody.cur_channel_list_info;
			var list = " <option value='' selected>업무방 선택</option>";
			for (var k = 0 ; k < clist.length; k++){
				var citem = clist[k];
				if (citem.type != "folder"){
					list += "<option value='"+citem.ch_code+"'>" + citem.ch_name + "</option>";
				}			
			}
			$("#select_my_channel_combo").html(list);
			$('select').material_select();			
			$('#select_my_channel_combo').off();
			$('#select_my_channel_combo').on('change',function() {				
		        var selectedid = $(this).val();
		     //   var selectedText = $(".optgroup-option.active.selected").text();		        
		        var list = gap.cur_room_members_key(selectedid);
		        gBody.cMain_members = list;		        
		        $('#show_mypage').mobiscroll('destroy');
		        gBody.daesang_channel3();
		    });	
		});		
		$("#cMain_query").off();
		$("#cMain_query").keypress(function(e){
			if (e.keyCode == 13){			
				var len = $("#cMain_query").val();
				if (len == 0){
					gap.gAlert(gap.lang.input_search_query);
					$("#cMain_query").focus();
					return false;
				}				
				if (len.trim().length == 1){
					gap.gAlert(gap.lang.valid_search_keyword);
					$("#cMain_query").focus();
					return false;
				}				
				var query = $("#cMain_query").val();				
				 gsn.requestSearch('', query, function(sel_data){		           
					// var obj = new Array();
					 $('#show_mypage').mobiscroll('destroy');					 
					 gBody.multi_user_work_display(sel_data);
					 $("#cMain_query").val("");							 
				 });				
				return false;
			}
		});		
		$("#cMain_org").off().on("click", function(e){
			gap.showBlock();
			window.ORG.show(
			{
				'title': gap.lang.invite_user,
				'single': false
			}, 
			{
				getItems:function() { 
					return []; 
				},
				setItems:function(items) {  
					//반환되는 Items						
					var arr = [];
					for (var i = 0 ; i < items.length; i++){
						var itm = gap.convert_org_data(items[i]);
						arr.push(itm);
					}					
					$('#show_mypage').mobiscroll('destroy');					 
					gBody.multi_user_work_display(arr);
					return false;
				},
				onClose : function(){
					gap.hideBlock();
				}
			});
		});
	},
	
	"multi_user_work_display" : function(members){
		//멀티로 검색된 사용자의 워크를 타임라인에 그려준다.		
		gBody.search_resources = [];
		 var lists = "";
		 for (var i = 0 ; i < members.length; i++){
			 //obj.push(sel_data[i]);
			 var itm = members[i];
			 if (lists == ""){
				lists = itm.ky;
			 }else{
				lists += "-" + itm.ky;
			 }			 
			 //타임라인의 resources 필드를 정리해야 한다..
			var resource_data = new Object();
    		resource_data.cp = itm.cp;
    		resource_data.cpc = itm.cpc;
    		resource_data.dp = itm.dp;
    		resource_data.id = itm.ky;
    		resource_data.emp = itm.emp;
    		resource_data.nm = itm.nm;
    		gBody.search_resources.push(resource_data);
		 }			
		 gBody.cMain_members = lists;;
		 gBody.daesang_channel3();
	},
	
	"daesang_channel3" : function(){		
		var p1 = 0;
		var p2 = 0;
		var p3 = 0;
		var p4 = 0;
		var s_key = moment().date(1).startOf('month').format('YYYY-MM-DD[T00:00:00Z]'); // 타임존 때문에 데이터 안나오는 경우 없도록 시작일 -1
		var e_key = moment().date(1).endOf('month').format('YYYY-MM-DD[T23:59:59Z]'); // Mini캘린더에 뿌려지는 날짜수 +1
		gBody.sdate = s_key;
		gBody.edate = e_key;		
		var url = gap.channelserver + "/channel_search_todo_list.km";
	//	gBody.email = "10im0959-10im0966";
		var data = JSON.stringify({
			"email" : gBody.cMain_members,
			"start" : gBody.sdate,
			"end" : gBody.edate
		});			
		$.ajax({
			type : "POST",
			dataType : "json",
			data : data,
			url : url,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){				
				$("#show_mypage").show();
				$("#show_mypage").css("min-height","");				
				//우선순위 개수 재정리 한다.				
				var lists = res.data;
				for (var i =0 ; i < lists.length; i++){
					var itm = lists[i];
					if (itm.pri == "1"){
						p1 += 1;
					}else if (itm.pri == "2"){
						p2 += 1;
					}else if (itm.pri == "3"){
						p3 += 1;
					}else if (itm.pri == "4"){
						p4 += 1;
					}
				}
				$("#pri_1").html(p1);
				$("#pri_2").html(p2);
				$("#pri_3").html(p3);
				$("#pri_4").html(p4);				
				gBody.mygraph = $('#show_mypage').mobiscroll().eventcalendar({
					locale : mobiscroll.localeKo,
					view : {
						timeline : {
							type : "month",
							startDay: 1,
                            endDay: 5,
                            weekNumbers: true,
                            eventList: true
						}		
					},
					data: res.data,					
				    resources: gBody.search_resources,
				    onEventClick: function (args) {							
						tempEvent = args.event;
						gTodo.compose_layer(tempEvent.key);
				    },				    
				    renderScheduleEvent: function (data) {					    
				        var ev = data.original;
				        var color = "";
				        var fcolor = "";
				        var preText = "";
				        if (ev.pri == "1"){
				        	color = "#FFEAE7";
				        	fcolor = "#ED677E";
				        	preText = "<span style='color:"+fcolor+"; margin-right:10px'>1순위</span>";
				        }else if (ev.pri == "2"){
				        	color = "#FDF5D9";
				        	fcolor = "#F39562";
				        	preText = "<span style='color:"+fcolor+"; margin-right:10px'>2순위</span>";
				        }else if (ev.pri == "3"){
				        	color = "#E6F0FF";
				        	fcolor = "#7194EC";
				        	preText = "<span style='color:"+fcolor+"; margin-right:10px'>3순위</span>";
				        }else if (ev.pri == "4"){
				        	color = "#F4EFF6";
				        	fcolor = "#71368D";
				        	preText = "<span style='color:"+fcolor+"; margin-right:10px'>4순위</span>";
				        }				        
				        var html = "";
				        html += "<div class='nonewline'>";
				        html += "	<div class='main-cal-event event-work' style='font-weight:bold; background-color:"+color+"'>";
				        html += "		<span class='marker' style='background:"+fcolor+"'></span>";			      
				        if (ev.status == '3'){
				        	html += "		<span class='event-text' style='text-decoration:line-through'>" + preText + " " + ev.title+"</span>"
				        }else{
				        	html += "		<span class='event-text'>" + preText + " " + ev.title+"</span>"
				        }
				        html += "	</div>";
				        html += "</div>";				        
				        return html;
				    },			    
				    renderResource: function (resource) {				    	
				    	var obj = new Object();
				    	obj.cpc = resource.cpc;
				    	obj.emp = resource.emp;
				    	var empty_url = "../resource/images/none.jpg";			    	
				    	var html = "";
				    	html += "<div class='user-chat f_middle'>";
				    	html += "	<div class='user'>";
				  //  	html += "		<div class='user-thumb'><img src='" + gap.person_photo_url(obj) + "'  onError='this.onerror=null; this.src=\'"+empty_url+"\';'/></div>";
				    	html += "		<div class='user-thumb'>"+gap.person_profile_photo(obj)+"</div>";
				    	html += "	</div>";
				    	html += "	<div class='user-inf' style='padding-left:6px'>";
				    	html += "		<p>"+resource.nm+"</p>";
				    	html += "		<span>"+resource.dp+"</span>"; //<div>"+resource.cp+"</div>
				//    	html += "		<span class='onetoonechat' data-ky='"+resource.id+"' data-nm='"+resource.nm+"'>1:1 Chat</span>";
				    	html += "	</div>";
				    	
				    	html += "</div>";
				    	html += "	<div class='onetoonechat' data-ky='"+resource.id+"' data-nm='"+resource.nm+"'>1:1 Chat</div>";		    	
				    	return html;
				    },
				    onInit: function(event, inst){			    	
				    	$(".onetoonechat").off();
						$(".onetoonechat").on("click", function(e){
							var ky = $(e.currentTarget).data("ky");
							var nm = $(e.currentTarget).data("nm");
							var obj = new Object();
							obj.ky = ky;
							obj.nm = nm;
							var ar = [];
							ar.push(obj);
							gBody.chat_one_to_one(ar);
							return false;
						});						
					},					
					onPageLoading: function (event, inst){						
					},
					onPageLoaded: function (event, inst) {											
						setTimeout(function(){
							var list = $("#show_mypage .mbsc-timeline-resource.mbsc-ios.mbsc-ltr");
							for (var i = 0 ; i < list.length; i++){
								var item = list[i];
								var kk = $(item).css("min-height").replace("px","");
								if (kk < 100){
									$(item).css("min-height", "100px");
								}
							}							
							var list = $("#show_mypage .mbsc-flex.mbsc-timeline-row.mbsc-ios");
							for (var i = 0 ; i < list.length; i++){
								var item = list[i];
								var kk = $(item).css("min-height").replace("px","");
								if (kk < 100){
										$(item).css("min-height", "100px");
								}
							}						
						}, 10);
				    },					
					onPageChange: function(event, inst){
						// 월을 변경할 때 호출
						var s_key = moment(event.firstDay).format('YYYY-MM-DD[T00:00:00Z]');
						var e_key = moment(event.lastDay).add(-1, 'days').format('YYYY-MM-DD[T23:59:59Z]');
						gBody.sdate = s_key;
						gBody.edate = e_key;
						gBody.daesang_channel_search3();
					},
				    onSelectedDateChange: function(event, inst){
					},				    
				    onEventHoverIn: function (args, inst) {
			        },
			        onEventHoverOut: function (args) {
			        }
			        }).mobiscroll('getInst');	
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});		
	},
	
	"daesang_channel_search3" : function(){
		//channel_my_todo_list.km
		var url = gap.channelserver + "/channel_search_todo_list.km";
		var data = JSON.stringify({
			start : gBody.sdate,
			end : gBody.edate,
			email : gBody.cMain_members
		});	
		$.ajax({
			type : "POST",
			dataType : "json",
			data : data,
			url : url,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				gBody.mygraph.setEvents(res.data);
				
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
	},
	
	"search_chatroom_content" : function(){
		var word = $("#chat_query").val();
		//search_chatroom_inner" : function(kw, id){
		var id = gBody.cur_cid;
		_wsocket.search_chatroom_inner(word, id);		
	},
	
	"search_chatroom_content_after" : function(obj){	
		gBody.searchMode = "T";		
		$("#chat_msg_dis").html("");
	//	for (var i = 0 ; i < obj.ct.rt.length; i++){
		for (var i = obj.ct.rt.length -1 ; i >= 0 ; i--){
			if (i == obj.ct.rt.length-1){
				gBody.write_chat_log(obj.ct.rt[i].log, "T", obj.ek);
			}else{
				gBody.write_chat_log(obj.ct.rt[i].log, "F", obj.ek);
			}		
		}	
		//검색결과 하일라이트 처리하기
		var query = obj.ek;
		$("#chat_msg_dis").highlight(query);	
	},
	
	"search_chatroom_list" : function(){
		var word = $("#inpuser_field").val();		
		$("#chlist_query_btn_close").show();		
		$("#chlist_query_btn_close").off().on("click", function(e){
			$("#chlist_query_btn_close").hide();
			$("#inpuser_field").val("");
			gBody.searchMode_draw = "F";
			_wsocket.load_chatroom_list();			
		});		
		_wsocket.search_chatroom_list(word, "search");		
	},
	
	"draw_search_chatroom_list_after" : function(obj){
		//대화 목록 검색		

		gBody.searchMode_draw = "T";
		$("#left_roomlist_sub").html("");
		//검색 결과를 역순으로 추가해야 목록이 정상적으로 표시된다.
		var list = obj.ct;
		//list.reverse();
		obj.ct = list;	
		
		gap.chat_room_info_ori.ct = gap.chat_room_info.ct;
		//채팅방 리스트를 100건만 가져오는데 검색하면 100 이후것도 가져와서 로컬에 채팅방 정보를 못찾는 경우가 발생해서 추가한다. 검색결과 의 채팅방 정보를 로컬 기본 채티방 정보에 추가한다.
		for (var i = 0 ; i < obj.ct.length; i++){
			var info = obj.ct[i];
			gap.chat_room_info.ct.push(info);
			gap.chat_room_info_ori.ct.pop();
		}		
		gap.chat_room_info_search = obj;
		gBody.chatroom_draw();
		
	},
	
	"unread_count_control" : function(){		
		var list = $("#left_roomlist .cnt");
		var res_cnt = 0 ;
		for (var i = 0 ; i < list.length; i++){
			res_cnt = res_cnt + parseInt($(list[i]).html());
		}
		return res_cnt;
	},
	
	"minus_count_chatroom" : function(id){
		//ty : T : 1:1인경우, F : 1:N방인경우 		
		var obj = $("#unread_count_" + id);
		if (typeof(obj) != "undefined"){
			obj.remove();
		}		
	},
	
	"set_count_chatroom" : function(id, ucnt){
		var obj = $("#unread_count_" + gap.encodeid(id));
		if (ucnt == 0){
			obj.remove();
		}else{
			obj.text(ucnt);
		}
	},	
	
	"unread_mail_count_check" : function(){
	//	var url = location.protocol + "//" + location.host + "/" + mailfile + "/agGetUnreadMailCountPortal?openAgent";
		var url = location.protocol + "//" + window.mailserver + "/" + mailfile + "/agGetUnreadMailCountPortal?openAgent";
		$.ajax({
			type : "GET",
			url : url,
			xhrFields : {
				withCredentials : true
			},			
			dataType : "json",
			contentType : "applicaion/json; chatset-utf8",
			success : function(res){				
				var cnt = res.count;			
				$(".ptlmailcount").each(function(index, item){
					if (cnt == 0){
						var pobj = $(item).parent().parent();
						pobj.removeClass();
						pobj.addClass("msgcenter_ban nocount");
					}else{
						var pobj = $(item).parent().parent();
						pobj.removeClass();
						pobj.addClass("msgcenter_ban unreadmail");
					}
					$(item).html(cnt);
				});
				gap.unread_count_check("mail", cnt);				
			}
		});	
	},	
	
	"unread_collec_count_check" : function(){
		var surl = gap.channelserver + "/api/collection/search_collection.km";
		var postData = {
				"start" : 0,
				"perpage" : 1,
				"day" : moment.utc().format(),
				"dcode" : gap.userinfo.rinfo.dpc,
				"type" : "1",
				"opt" : "2"
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
					var cnt = res.data.t1;
					if (cnt > 0){
						gap.unread_count_check("gathering", cnt);
					}				
				}
			}
		});
	},

	"unread_channel_count_check_realtime" : function(select_id){
		//실시간 변동되는 채팅룸의 건수를 계산하는 함수		
		if (gBody3.cur_window == "channel"){			
			//현재 채널이 폴더안에 있을 경우 체크해서  폴더에 읽지 않음 표시 갱신한다.
			var id = select_id;			
			if (typeof($("#share_channel_list") != "undefined")){
				var citem = $("#share_channel_list #" + id);				
				if (citem.length > 0){
					var $folder = $(citem).closest('.channel-folder');
					var ucnt = $folder.find('.ico-new').length;
					if (ucnt == 0) {
						$folder.removeClass('new');
					}else{
						$folder.addClass('new');
					}
					
					/*
					 * 폴더 빨콩표시하는 로직 변경
					var folder = $(citem).parent().parent().prev();
					if ($(folder).hasClass("folder-code")){
						//클릭한 업무방은 폴더 아래 있는 업무방이다.						
						//clistxx
						var unread_channel_count = $(folder).next().find(".ico-new").length;
						if (unread_channel_count > 0){
							//폴더에 빨콩 유지
							$(folder).find("em .ico-new").remove();
							$(folder).find("em").append("<span class='ico-new'></span>");
						}else{
							//폴더데 빨콩 제거
							$(folder).find("em .ico-new").remove();
						}		
					}
					*/
				}
			}		
			var ucnt = $("#share_channel_list span .ico-new").not(".folder-code").length;
			var dew_ucnt = $("#dew_channel_list span .ico-new").length; 
			gap.unread_count_check("2", ucnt + dew_ucnt);			
		}else{
			//채팅리스를 계산할 수 없는 상황인 경우는 +1해준다.
			gBody.unread_channel_count_check();
		}
		if (gBody3.cur_window == "boxmain"){
			var text = $("#portlet_channel_"+select_id).text();
			//포틀릿 신규 메시지 도착 알림 스타일 적용 - 업무방
			$("."+select_id).css("background-color", gptl.unread_background_color);
			$("."+select_id).css("border", "2px solid #f1c4aa");
			$("."+select_id + " .top").css("border-bottom", "1px solid #ee7158");
		}
	},
	
	"unread_channel_count_check" : function(){
		var surl = gap.channelserver + "/api/channel/channel_info_unread.km";
		var postData = {};
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
				if (res.result == "T"){
					var cnt = res.ucnt;
					if (cnt > 0){
						gap.unread_count_check("work", cnt);
					}				
				}
			}
		});
	},
	
	
	
	"unread_chat_count_check" : function(){
		var list = gap.chat_room_info.ct;
		var $quick_list = $('#alarm_list_sub');
		if (typeof(list) != "undefined"){
			var attlist = "";
			var ucnt = 0; 
			for (var i = 0 ; i < list.length; i++){
				var info = list[i];
				ucnt += info.ucnt;
			}	
			if (ucnt > 0){
				gap.unread_count_check("chat", ucnt);
			}		
		}		
	},
	
	"unread_chat_count_check_realtime" : function(){
		/*
		//실시간 변동되는 채팅룸의 건수를 계산하는 함수	
		var list = $("#left_roomlist_sub .cnt");
		var ucnt = 0;
		for (var i = 0; i < list.length; i++){
			var info = list[i];
			ucnt += parseInt($(info).text());			
		}
		*/
		
		// 검색한 경우 리스트가 변경되므로 위와 같이 검색하면 카운트가 안맞음
		// 전역에 설정된 값으로 계산하도록 변경함
		var ucnt = gap.search_all_chatroom_ucnt();
		gap.unread_count_check("chat", ucnt);
	},	
		
	"unread_chat_count_check_realtime_popup" : function(){
		//실시간 변동되는 채팅룸의 건수를 계산하는 함수	
		var ucnt = gap.search_all_chatroom_ucnt();
		gap.unread_count_check("chat", ucnt);
	},	
	
	"draw_ref_new" : function(opt){
		//opt가 T이면 참조가 먼저 열린다.
		var s_key = moment().date(1).startOf('month').format('YYYY-MM-DD[T00:00:00Z]'); // 타임존 때문에 데이터 안나오는 경우 없도록 시작일 -1
		var e_key = moment().date(1).endOf('month').format('YYYY-MM-DD[T23:59:59Z]'); // Mini캘린더에 뿌려지는 날짜수 +1
		gBody.sdate = s_key;
		gBody.edate = e_key;
		var data = JSON.stringify({
			start : gBody.sdate,
			end : gBody.edate,
			type : gBody.cMain
		});
		//type : "1" 내가할일,, "2" 내가 지시한일,  "3"검색		
		var url = gap.channelserver + "/channel_my_todo_list.km";		
		$.ajax({
			type : "POST",
			dataType : "json",
			data : data,
			url : url,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				gBody.draw_ref2(res.ref, opt);
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},	
	
	"draw_ref2" : function(list, opt){
		//채팅에서 올수 있기 때문에 해당 값을 초기화 시킨다.
		gBody.cur_cid == "";			
		$("#channel_chat").empty();	
		var html = "";
		html += "<div class='mu_container mu_work' style='position:unset'>";
		html += "<aside class='work-aside meeting'>";
		html += "	<div class='aside-wide'>";
		html += "		<div class='nav-tab'>";
		html += "			<ul class='tabs' id='rmet'>";
		html += "				<li class='tab on'><a href='' id='tp1'>"+gap.lang.chat+"</a></li>";
		html += "				<li class='tab'><a href='' id='tp2'>"+gap.lang.mail_cc+"</a></li>";
		html += "			</ul>";
		html += "		</div>";
		html += "		<div class='aside-inner' id='mchatlist'>";
		html += "			<div class='input-field' style='padding : 0 15px 0 15px'>";
		html += "				<span class='ico ico-search' style='left:25px; top:16px'></span>";
		html += "				<input type='text' class='formInput' id='search_user_fd' autocomplete='off' placeholder='"+gap.lang.inpuser+"' />";
		html += "			</div>";
		html += "		</div>";
		html += " 		<div class='chatting' style='padding-top:0px; height:calc(100% - 80px);'><div class='chat-area' ><div class='chat_msg' style='height:100%'>";
		html += "       	<div id='ref_dis' style='height:100%'><div id='chat_msg_dis_ref'></div></div>";
		html += "       </div></div></div>"
		html += "	</div>";
		html += "	<div class='type_list_wr rel meet_mem' id='minchat' style='bottom:60px'>";
		html += "		<input type='text' name='' id='search_user_msg' class='' autocomplete='off' placeholder='"+gap.lang.input_message+"'>";
		html += "		<div class='abs type_icon' id='search_user_msg_submit' style='cursor:pointer'></div>";
		html += "	</div>";
		html += "</aside>";
		html += "</div>>";	
		$("#channel_chat").show();
		$("#channel_chat").append(html);	
		$("#search_user_msg_submit").on("click", function(e){
			gBody.send_msg_search();
		});		
		$("#search_user_msg").keypress(function(e){
			if (e.keyCode == 13){					
				gBody.send_msg_search();
				return false;
			}			
		});		
		$("#search_user_fd").keypress(function(e){
			if (e.keyCode == 13){				
				var query = $("#search_user_fd").val();	
				if (query.indexOf(",") > -1){
					gap.gAlert(gap.lang.onesok);
					$("#search_user_fd").val("");
					$("#search_user_fd").focus();
					return false;
				}
				gsn.requestSearch('', query, function(sel_data){		           
		             var obj = new Array();
		             for (var i = 0 ; i < sel_data.length; i++){
		            	 obj.push(sel_data[i]);
		             }		             
			         gBody.chat_one_to_one(obj);
		         });				
				return false;
			};
		});	
		$("#rmet .tab a").on("click", function(e){
			$("#rmet .tab a").removeClass("active");
			$("#rmet .tab").removeClass("on");
			$(this).addClass("active");	
			$(this).parent().addClass("on");			
			var id = $(e.currentTarget).attr("id");
			if (id == "tp2"){
				$("#rmet .indicator").css("left", "130px");
				$("#mchatlist").hide();
				$("#minchat").hide();
				$("#ref_dis").show();
				$("#ref_dis").empty();
				gBody.draw_referlist2(list);
			}else{
				$("#rmet .indicator").css("left", "0px");
				$("#mchatlist").show();
				$("#minchat").show();
				$("#ref_dis").hide();
				gBody.draw_ref2(list);
			}			
			return false;
		});		
		$('#rmet').tabs();
		if (opt == "T"){
			setTimeout(function(){				
				$("#channel_main_right_folder").addClass("on");
				$("#tp2").click();				
			}, 1);
		}else{
		}	
		return false;			
	},
	
	"draw_referlist2" : function(list){	
		var html = "";		
		html += "<div class='todo-bookmark' style='height:100%; padding: 5px'>";
		html += "	<button class='ico btn-right-close' id='star_layer_close' >닫기</button>";	
		html += "	<div class='card-list' id='wrap_todo_star_list' style='height:calc(100% - -120px)'>";
		html += "		<ul class='card' id='todo_star_list' style='padding-right:13px;'>";	
		if (list.length == 0){
			html += "<div class='msg-empty'>";
			html += '	<img src="' + cdbpath + '/img/empty.png" alt="" />';
			html += gap.lang.nocontent;
			html += "</div>";
		}else{
			for (var i = 0 ; i < list.length; i++){
				var item = list[i];				
				var file_count = 0;
				if (typeof(item.file) != "undefined"){
					file_count = item.file.length;
				}
				var reply_count = (item.reply != undefined ? item.reply.length : 0);
				var total_check_count = 0;
				var checked_count = 0;				
				if (typeof(item.checklist) != "undefined"){
					total_check_count = item.checklist.length;
					for (var j = 0; j < item.checklist.length; j++){
						if (item.checklist[j].complete == "T"){
							checked_count++;
						}
					}
				}			
				html += "<li id='star_" + item._id.$oid  + "' style='list-style:none; height:150px; text-align:left'>";
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
				html += "	<dl class='icons' style='padding-top:0px'>";
				html += "		<dd><span class='ico ico-clip'></span><em>" + file_count + "</em></dd>";
				html += "		<dd><span class='ico ico-reply'></span><em>" + reply_count + "</em></dd>";
				html += "		<dd><span class='ico ico-checklist'></span><em>" + checked_count + "/" + total_check_count + "</em></dd>";
				html += "	</dl>";
				html += "</li>";							
			}		
			html += "		</ul>";
			html += "	</div>";
			html += "</div>";
		}		
		$("#ref_dis").append(html);	
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
//				onTotalScrollBackOffset: 100,
//				onTotalScroll: function(){
//					gTodoC.add_todo_mention_list(page_no + 1);
//				},
//				onTotalScrollOffset: 100,
				alwaysTriggerOffsets:true
			}
		});	
		$("#ref_dis li").off().on("click", function(){
			gTodo.compose_layer( $(this).attr("id").replace("star_", "") );
		});
	},
	
	
	
	
	
	
	"show_app_more_bak" : function(){		
		var inx = gap.maxZindex() + 1;
		var html = "";          	
    	html += "<div class='layer_wrap home-more' style='max-width: 397px;'>";
		html += "<div class='layer_inner' id='layer-wrap-inner' style='padding-right:0;padding-bottom:0;'>";
		html += "	<ul class='f_column' id='pop_main_layer'>";
		if (gTop.use_dsp == "1"){
			html += "		<li>";
			html += "			<div class='img-bx bx01' data-key='1'>";
			html += "				<span class='ico'></span>";
			html += "			</div>";
			html += "			<span class='tit'>DSP</span>";
			html += "		</li>";
		}
		if (gTop.use_erp == "1"){
			html += "		<li>";
			html += "			<div class='img-bx bx02' data-key='2'>";
			html += "				<span class='ico'></span>";
			html += "			</div>";
			html += "			<span class='tit'>ERP</span>";
			html += "		</li>";
		}
		if (gTop.use_sms == "1"){
			html += "		<li>";
			html += "			<div class='img-bx bx03' data-key='3'>";
			html += "				<span class='ico'></span>";
			html += "			</div>";
			html += "			<span class='tit'>SMS</span>";
			html += "		</li>";
		}
		if (gTop.use_elephant == "1"){
			if (gap.userinfo.rinfo.ky.indexOf("im") == -1){
				html += "		<li>";
				html += "			<div class='img-bx bx04' data-key='4'>";
				html += "				<span class='ico'></span>";
				html += "			</div>";
				html += "			<span class='tit'>"+gap.lang.epent+"</span>";
				html += "		</li>";
			}			
		}
		if (gTop.use_ep == "1"){
			html += "		<li>";
			html += "			<div class='img-bx bx05' data-key='5'>";
			html += "				<span class='ico'></span>";
			html += "			</div>";
			html += "			<span class='tit'>EP</span>";
			html += "		</li>";
		}
		if (gTop.use_it == "1"){
			html += "		<li>";
			html += "			<div class='img-bx bx07' data-key='7'>";
			html += "				<span class='ico'></span>";
			html += "			</div>";
			html += "			<span class='tit'>서비스데스크</span>";
			html += "		</li>";
		}		
		if (gTop.use_sabo == "1"){
			html += "		<li>";
			html += "			<div class='img-bx bx08' data-key='8'>";
			html += "				<span class='ico'></span>";
			html += "			</div>";
			html += "			<span class='tit'>"+gap.lang.esabo+"</span>";
			html += "		</li>";
		}
		// 전자결재
		if (gap.userinfo.rinfo.ky.indexOf('im') == -1) {
			html += "		<li>";
			html += "			<div class='img-bx bx09' data-key='9'>";
			html += "				<span class='ico'></span>";
			html += "			</div>";
			html += "			<span class='tit'>" + gap.lang.more_aprv + "</span>";
			html += "		</li>";			
		}		
		// 대상주식회사 이면서 im사번이 아닌 경우 CRM아이콘 표시
		if (gap.userinfo.rinfo.cpc == '10' && gap.userinfo.rinfo.ky.indexOf('im') == -1) {
			html += "		<li>";
			html += "			<div class='img-bx bx10' data-key='10'>";
			html += "				<span class='ico'></span>";
			html += "			</div>";
			html += "			<span class='tit'>CRM</span>";
			html += "		</li>";			
		}		
		// 정원e샵
		if ( (gap.userinfo.rinfo.cpc == 'M3' || //대상홀딩스
			  gap.userinfo.rinfo.cpc == '10' || //대상
			  gap.userinfo.rinfo.cpc == 'E8' || //대상다이브스
			  gap.userinfo.rinfo.cpc == 'L0' || //대상웰라이프
			  gap.userinfo.rinfo.cpc == '90' || //대상정보
			  gap.userinfo.rinfo.cpc == '33' || //대상건설
			  gap.userinfo.rinfo.cpc == 'M0' || //대상문화재단
			  gap.userinfo.rinfo.cpc == 'J0' || //대상푸드플러스
			  gap.userinfo.rinfo.cpc == 'K0' || //신안천일염
			  gap.userinfo.rinfo.cpc == 'D1' || //디유퓨드
			  gap.userinfo.rinfo.cpc == 'G1' || //대상네트웍스(주)
			  gap.userinfo.rinfo.cpc == '50' || //대상셀진 주식회사
			  gap.userinfo.rinfo.cpc == '51' || //대상델리하임
			  gap.userinfo.rinfo.cpc == 'H1' || //혜성프로비젼
			  gap.userinfo.rinfo.cpc == 'E2'    //홍보에너지
			) && gap.userinfo.rinfo.ky.indexOf('im') == -1) {
			html += "		<li>";
			html += "			<div class='img-bx bx11' data-key='11'>";
			html += "				<span class='ico'></span>";
			html += "			</div>";
			html += "			<span class='tit'>정원e샵</span>";
			html += "		</li>";			
		}		
		// 제품정보
		if (gap.userinfo.rinfo.cpc == '10' && gap.userinfo.rinfo.ky.indexOf('im') == -1) {
			html += "		<li>";
			html += "			<div class='img-bx bx12' data-key='12'>";
			html += "				<span class='ico'></span>";
			html += "			</div>";
			html += "			<span class='tit'>제품정보</span>";
			html += "		</li>";			
		}		
		// DAYS
		if (gap.userinfo.rinfo.cpc == '10' && gap.userinfo.rinfo.ky.indexOf('im') == -1) {
			html += "		<li>";
			html += "			<div class='img-bx bx13' data-key='13'>";
			html += "				<span class='ico'></span>";
			html += "			</div>";
			html += "			<span class='tit'>DAYS</span>";
			html += "		</li>";			
		}		
		// PLM
		if (gap.userinfo.rinfo.cpc == '10' && gap.userinfo.rinfo.ky.indexOf('im') == -1) {
			html += "		<li>";
			html += "			<div class='img-bx bx14' data-key='14'>";
			html += "				<span class='ico'></span>";
			html += "			</div>";
			html += "			<span class='tit'>PLM</span>";
			html += "		</li>";			
		}		
		// 전자연구노트
		if (gap.userinfo.rinfo.cpc == '10' && gap.userinfo.rinfo.ky.indexOf('im') == -1) {
			html += "		<li>";
			html += "			<div class='img-bx bx15' data-key='15'>";
			html += "				<span class='ico'></span>";
			html += "			</div>";
			html += "			<span class='tit'>전자연구노트</span>";
			html += "		</li>";			
		}		
		// 제로캠페인
		if (gap.userinfo.rinfo.cpc == '10' && gap.userinfo.rinfo.ky.indexOf('im') == -1) {
			html += "		<li>";
			html += "			<div class='img-bx bx16' data-key='16'>";
			html += "				<span class='ico'></span>";
			html += "			</div>";
			html += "			<span class='tit'>제로캠페인</span>";
			html += "		</li>";			
		}		
		html += "	</ul>";
		html += "</div>";
		html += "</div>";		
		$("#app_more").qtip({
			selector : "#app_more",
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			zIndex : inx,
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
				tip : false
			},
			position : {
				my : 'bottom left',
				at : 'bottom right',
				//target : $(this)
				adjust: {
	              x: 0,
	              y: 0
				}
			},
			events : {
				show : function(event, api){	
					$("#layer-wrap-inner .img-bx").on("click", function(e){
						var win_name = "";
						var key = $(e.currentTarget).data("key");
						var url = "";
						if (key == "1"){
							if (gap.isDev){
								url = "http://dapp1.daesang.com";
							}else{
								url = "http://dsp.daesang.com";
							}
							win_name = "dsp";
							
						}else if (key == "2"){
							//ERP
							var _url = gap.channelserver + "/aes.km";
							$.ajax({
								method : "GET",
								url : _url,
								dataType : "json",
								beforeSend : function(xhr){
									xhr.setRequestHeader("auth", gap.get_auth());
									xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
								},
								success : function(res){
									var key = res.aes;
									var url = "";
									if (gap.isDev){
										url = "http://ep.erpp.daesang.com:50000/daesangSSO/sso.jsp?userid="+key+"&systemType=GW";
									}else{
										url = "http://ep.erpp.daesang.com:50000/daesangSSO/sso.jsp?userid="+key+"&systemType=ERP";
									}
									win_name = "erp";
									api.destroy(true);
									window.open(url, win_name, null);
									return false;
								}									
							});							
						}else if (key == "3"){
							//SMS
							url =  "http://dsin.daesang.com/sso/auth?client_id=SMS_01&response_type=code";
							win_name = "sms";
						}else if (key == "4"){
							//칭찬코끼리
							//url = "http://sso.daesang.com/dispatcher.do?eMateApps=SBH_47&redURL=http://sabo.daesang.com/elephant/list.jsp";
							//URL 변경됨 (23.01.13)
							url = "http://dsin.daesang.com/sso/auth?client_id=SBH_01&response_type=code&rd_c_p=http://sabo.daesang.com/elephant/list.jsp";
						}else if (key == "5"){
							//EP
							if (gap.isDev){
								url = "http://dsso.daesang.com/dispatcher.do?eMateApps=EPS_07";
							}else{
								url = "http://sso.daesang.com/dispatcher.do?eMateApps=EPS_07";
							}
							win_name = "ep";
						}else if (key == "6"){
							$("#meeting").click();
							api.destroy(true);
							return false;
						}else if (key == "7"){
							//IT서비스센터
							if (gap.isDev){
								url = "http://dsso.daesang.com/dispatcher.do?eMateApps=HPD_13";
							}else{
								url = "http://dsin.daesang.com/sso/auth?response_type=code&client_id=HPD_01";
							}
							win_name = "it";
						}else if (key == "8"){
							//온라인 사보
							url ="http://sso.daesang.com/dispatcher.do?eMateApps=SBH_47&redURL=http://sabo.daesang.com";
							win_name = "sabo";
						}else if (key == "9"){
							//전자결재
							url ="http://dsp.daesang.com/portal.nsf/APRVPortal";
							win_name = "aprv";
						}else if (key == "10"){
							//CRM
							url ="https://daesang.my.salesforce.com";
							win_name = "crm";
						}else if (key == "11"){
							//정원e샵
							url ="http://sso.daesang.com/dispatcher.do?eMateApps=JFS_16";
							win_name = "eshop";
						}else if (key == "12"){
							//제품정보
							url ="http://dsin.daesang.com/sso/auth?response_type=code&client_id=PMS_01";
							win_name = "productinfo";
						}else if (key == "13"){
							//DAYS
							url ="https://days.daesang.com";
							win_name = "days";
						}else if (key == "14"){
							//PLM
							url ="http://dsin.daesang.com/sso/auth?response_type=code&client_id=PLM_02";
							win_name = "plm";
						}else if (key == "15"){
							//전자연구노트
							url ="http://dsin.daesang.com/sso/auth?response_type=code&client_id=PLM_02&rd_c_p=eln";
							win_name = "resnote";
						}else if (key == "16"){
							//제로캠페인
							url ="http://sso.daesang.com/dispatcher.do?eMateApps=SBH_47&redURL=http://sabo.daesang.com/zero";
							win_name = "zero";
						}					
						api.destroy(true);
						window.open(url, win_name, null);
					});
				},
				hidden : function(event, api){
					api.destroy(true);
				}
			}
		});	
	},
	
	"show_app_more" : function(){
		// 레이어가 표시되어 있는 경우 예외처리
		if ($('.qtip-app').length > 0) {
			$('#app_more').qtip('destroy', true);
			return false;
		}		
		var _self = this;
		var inx = gap.maxZindex() + 1;		
		var html = 
			'<div class="quick_personal_menu">' +
			'	<div class="tit_bar">' +
			'		<button id="btn_app_config" class="q_menu_set"><img src="./img/icon/ico_setting.png">' + gap.lang.menu_setup + '</button>' +
			'		<h2 class="top-tit">' + gap.lang.quick_menu + '</h2>' +
			'	</div>' +
			'	<div class="scroll">' +
			'		<div id="user_folder_list" class="layer_inner">' +
			'		</div>' +
			'	</div>' +
			'</div>';
		var $layer = $(html);		
		// 폴더 정보 셋팅		
		$.each(_self.folder_menu_info, function(){
			var folder_nm = (this.folder_name ? this.folder_name : gap.lang.user_folder); 			
			html = 
				'<div class="q_folder_list">' +
				'	<div class="q_tit">' +
				'		<h2 class="f_between">' + folder_nm + '</h2>' +
				'	</div>' +
				'	<ul class="flex">' +
				'	</ul>' +
				'</div>';			
			var $folder = $(html);			
			$layer.find('#user_folder_list').append($folder);			
			$.each(this.list, function(){
				var _icon = gap.channelserver + "/menuicon.do?code=" + this.code + '&ver=' + this.last_update;
				var _menu_nm = gap.userinfo.userLang == 'ko' ? this.menu_kr : this.menu_en;
				html =
					'		<li class="app-icon">' +
					'			<div class="ico_box" style="background-color:' + this.bg + '">' +
					'				<span class="ico menu" style="background-image:url(' + _icon + ')"></span>' +
					'			</div>' +
					'			<span class="tit" title="' + _menu_nm + '">' + _menu_nm + '</span>' +
					'		</li>';				
				var $icon = $(html);				
				$icon.data('info', this);				
				$folder.find('ul').append($icon);
			});
		});	
		$("#app_more").qtip({
			selector : "#app_more",
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			zIndex : inx,
			content : {
				text : $layer
			},
			show : {
				event: 'click',
				ready: true,
				effect: false
			},
			hide : {
				event : 'unfocus',
				//event : 'mouseout',
				fixed : true
			},
			style : {
				classes : 'qtip-bootstrap qtip-app',
				tip : false
			},
			position : {
				my : 'bottom left',
				at : 'bottom right',
				viewport: $('#main_home'),
				adjust: {
	              x: 0,
	              y: 0,
	              method: 'shift'
				}
			},
			events : {
				show : function(event, api){
					setTimeout(function(){
						$(api.tooltip).addClass('show-layer');
					}, 50);
					
					$('#btn_app_config').on('click', function(){
						// 이미 열려있는 경우 예외처리
						if ($('#edit_menu_layer').is(':visible')) {
							api.destroy(true);
							return;
						}						
						// 메뉴설정
						_self.show_app_setting();
						api.destroy(true);
					});					
					$(api.tooltip).find('.app-icon').on('click', function(){
						_self.go_app_url($(this).data('info'));
						api.destroy(true);
					});
				},
				hidden : function(event, api){
					api.destroy(true);
				}
			}
		});	
	},
	
	"show_app_setting" : function(callfrom, portlet_el){
		var _self = this;		
		var _title = callfrom == 'portlet' ? gap.lang.menu_config : gap.lang.quick_setup;
		// 현재 데이터 가져와서 뿌려야 함
		var html =
			'<div id="edit_menu_layer" class="layer_wrap quick_menu_popup center " style="width: 1380px;">' +
			'	<div class="layer_inner">' +
			'		<div class="pop_btn_close"></div>' +
			'		<div class="top-tit">' +
			'			<h4>' + _title + '</h4>' +
			'		</div>' +
			'		<div class="bot-main flex">' +
			'			<div class="quick_left_list">' +
			'				<div id="menu_left_wrap" class="q_list_wrap">' +
			'					<div id="menu_left_cont" class="scroll">' +
			'						<buttom id="btn_folder_add"><span>' + gap.lang.add_folder + '</span></buttom>' +			
			// 좌측메뉴 
			'						<div class="lnb_menu_set">' +
			'							<div class="select-folder-line"></div>' +
            '							<div class="tit_bar">' +
            '								<h2 class="f_between">' +
            '									' + gap.lang.lnb_menu + 
            '									<span class="tit_noti">* ' + gap.lang.quick_setup_info + '</span>' +
            '								</h2>' +
            '							</div>' +
            '							<ul id="lnb_app_list" class="flex">' +            
            '								<li class="add-menu-wrap">' +
            '									<div class="ico_box add">' +
            '										<span class="ico add-menu"></span>' +
            '									</div>' +
            '									<span class="tit">' + gap.lang.add_menu + '</span>' +
            '								</li>' +
            '								<li class="color-change-wrap">' +
            '									<div class="ico_box">' +
            '									</div>' +
            '									<span class="tit">' + gap.lang.change_color + '</span>' +
            '								</li>' +
            '							</ul>' +
            '						</div>' +	
			'					</div>' +	// end scroll
			'				</div>' +
			'			</div>' +
			'			<div class="quick_right_list disable">' +
			'				<div class="right-block">' + gap.lang.quick_right_info + '</div>' +
			'				<div class="q_list_wrap">' +
			'					<div class="scroll">' +
			'						<div class="tit_bar">' +
			'							<h2 class="f_between">' + gap.lang.all_menu + '</h2>' +
			'						</div>' +
			'						<ul id="all_app_list" class="flex"></ul>' + // 오른쪽 전체 메뉴 리스트
			'					</div>' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'		<div class="bot-btn">' +
			'			<div class="btn-wr">' +
			'				<button class="confirm">' + gap.lang.basic_save + '</button>' +
			'				<button class="cancel">' + gap.lang.Cancel + '</button>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'</div>';		
		var $layer = $(html);
		$('body').append($layer);
		$layer.wrap('<div id="common_work_layer" class="mu_container mu_work mu_group" style="top:-50%;"></div>');	
		gap.show_loading('');		
		// LNB메뉴 Block처리
		$('#blockui').addClass('hide-lnb');		
		if (callfrom == 'portlet') {
			$layer.addClass('portlet');			
			var portlet_info = portlet_el.data('app_info');
			if (portlet_info) {
				// 포틀릿 메뉴를 설정한 경우
				var req_1 = _self.get_user_applist_portlet(portlet_info);
			} else {
				var req_1 = _self.get_user_applist();
			}			
		} else {
			var req_1 = _self.get_user_applist();
		}		
		var req_2 = _self.get_all_applist();		
		$.when(req_1, req_2).then(function(){
			gap.hide_loading();
			gap.showBlock();			
			var inx = parseInt(gap.maxZindex()) + 1;
			$layer.css('z-index', inx).addClass('show');			
			_self.event_app_setting(portlet_el);			
			_self.before_app_json = _self.get_app_json();
		}, function(){
			gap.hide_loading();
			mobiscroll.toast({message:gap.lang.errormsg, color:'danger'});
		});		
	},
	
	"event_app_setting" : function(portlet_el){
		var _self = this;		
		var $layer = $('#edit_menu_layer');				
		// 닫기
		$layer.find('.pop_btn_close').on('click', function(){
			var before_data = JSON.stringify(_self.before_app_json);
			var cur_data = JSON.stringify(_self.get_app_json());			
			// 닫기 전 변경사항 체크
			if (before_data != cur_data) {
				gap.showConfirm({
					title: gap.lang.save_change,
					contents: gap.lang.save_change_confirm,
					callback: function(){
						_self.save_app = true;
						_self.save_app_menu(portlet_el);
					},
					onClose: function(){
						_self.close_app_layer();
					}
				});
			} else {
				_self.close_app_layer();
			}
		});		
		// 좌측 메뉴 추가
		$layer.find('#lnb_app_list .add-menu-wrap').on('click', function(){
			$layer.find('.lnb_menu_set').addClass('active');
			$layer.find('.folder_set').removeClass('active');			
			var $folder = $layer.find('.lnb_menu_set');			
			_self.ready_right_menu($folder)
		});	
		// 죄측 메뉴 색상변경
		var html = 
			'<div class="lnb-color-picker">' +
			'	<div class="color-picker-title">' + gap.lang.lnb_color_select + '</div>' +
			'	<div class="color-picker-cont">' +
			'		<div class="color-item" data-color="#ec5f78"><span>d</span></div>' +
			'		<div class="color-item" data-color="#e41a12"><span>a</span></div>' +
			'		<div class="color-item" data-color="#ee7158"><span>e</span></div>' +
			'		<div class="color-item" data-color="#5b5ca6"><span>s</span></div>' +
			'		<div class="color-item" data-color="#733b93"><span>a</span></div>' +
			'		<div class="color-item" data-color="#f3985c"><span>n</span></div>' +
			'		<div class="color-item" data-color="#fac675"><span>g</span></div>' +			
			'		<div class="color-item" data-color="#4f4d56"></div>' +
			'		<div class="color-item" data-color="#4B5F6D"></div>' +
			'		<div class="color-item" data-color="#275660"></div>' +
			'		<div class="color-item" data-color="#565902"></div>' +
			'		<div class="color-item" data-color="#E1B24E"></div>' +
			'		<div class="color-item" data-color="#6CA584"></div>' +
			'		<div class="color-item" data-color="#A88584"></div>' +
			'	</div>' +
			'</div>';
		var $color = $(html);		
		// 컬러피커 색 지정 및 선택된 값 선택 표시
		$color.find('.color-item').each(function(){
			var color = $(this).data('color');
			$(this).css('background-color', color);			
			// 현재 선택된 lnb-color 표시
			var lnb_color = _self.get_lnb_color();
			if (color == lnb_color) {
				$(this).addClass('on');
			}
		});		
		$color.find('.color-item').on('mouseover', function(){
			var color = $(this).data('color');
			// quickmenu.css 에 정의된 값을 수정
			_self.set_lnb_color(color);
		});		
		$color.find('.color-item').on('click', function(){
			$('.color-item').removeClass('on');
			$(this).addClass('on');
			$layer.find('.color-change-wrap').qtip('hide');
		});	
		var inx = gap.maxZindex() + 1;
		$layer.find('.color-change-wrap').qtip({
			//selector : ".color-change-wrap",
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			zIndex : inx,
			content : {
				text : $color
			},
			show : {
				//event: 'mouseover'
				event: 'click'
			},
			hide : {
				event : 'mouseout',
				//event: 'click',
				fixed : true
			},
			style : {
				classes : 'qtip-bootstrap qtip-color-picker',
				tip : false
			},
			position : {
				my : 'top left',
				at : 'top left',
				adjust: {
					//x: -50,
					y: -30
				},
				viewport: $layer
			},
			events : {
				show : function(event, api){
					$('#blockui').addClass('preview-mode');
					$('#edit_menu_layer').addClass('preview-mode');
					$('#top_header_layer').addClass('show-quick');				
				},
				hidden : function(event, api){
					$('#blockui').removeClass('preview-mode');
					$('#edit_menu_layer').removeClass('preview-mode');
					$('#top_header_layer').removeClass('show-quick');					
					var color = $('.color-item.on').data('color');
					_self.set_lnb_color(color);
				}
			}
		});		
		// 폴더 추가하기
		$layer.find('#btn_folder_add').on('click', function(){
			_self.draw_menu_folder();			
			// 추가된 폴더가 자동 선택되도록 처리
			$layer.find('.folder_set:last-child .add-menu-wrap').click();
		});		
		// 저장
		$layer.find('.confirm').on('click', function(){
			_self.save_app_menu(portlet_el);
		});		
		// 취소
		$layer.find('.cancel').on('click', function(){
			$layer.find('.pop_btn_close').click();
		});		
		// LNB 메뉴 Drag & Drop 정렬
		// sortablejs를 활용하려면 document이벤트에 걸려있는 dragstart 이벤트에 클래스명으로 예외처리 해줘야 함
		$('#lnb_app_list').sortablejs({
			animation: 150,
			ghostClass: 'menu-ghost',
			filter: '.add-menu-wrap,.color-change-wrap',
			onStart: function(evt){
				$(evt.from).addClass('dragging');
			},
			onEnd: function(evt){
				$(evt.from).removeClass('dragging');
			},
			onMove: function (evt) {
				if (evt.related.className.indexOf('add-menu-wrap') >= 0) {
					return false;
				} else if (evt.related.className.indexOf('color-change-wrap') >= 0) {
					return false;
				} else {
					return true;
				}						
			}
		});		
	},
	
	"close_app_layer" : function(is_force){
		$('#edit_menu_layer').parent().remove();		
		if (is_force){
			this.save_app = false;
			$('#blockui').removeClass('hide-lnb');
			gap.hideBlock();
			return;
		}		
		if (!this.save_app){
			// 색상이 변경된 경우 여기서 원복해야 함
			var before_color = this.before_app_json.color;
			var lnb_color = this.get_lnb_color();
			if (before_color != lnb_color) {
				this.set_lnb_color(before_color);
			}			
			$('#blockui').removeClass('hide-lnb');
			gap.hideBlock();
		}
	},
	
	"draw_menu_folder" : function(f_info){
		// 왼쪽에 폴더 정보 뿌리기
		var def_folder_nm = gap.lang.user_folder;		
		var _self = this;		
		var html = 
			'<div class="folder_set hide-folder">' +
			'	<div class="select-folder-line"></div>' +
            '	<div class="tit_bar">' +
    		'		<div class="f_between">' +
    		'			<input class="folder-name-input" type="text" maxlength="25">' +
    		'		</div>' +
    		'		<button class="ico menu_del"></button>' +
    		'	</div>' +
    		'	<ul class="flex">' +
    		'		<li class="add-menu-wrap">' +
			'			<div class="ico_box add">' +
			'				<span class="ico add-menu"></span>' +
			'			</div>' +
			'			<span class="tit">' + gap.lang.add_menu + '</span>' +
			'		</li>' +
			'	</ul>' +
            '</div>';		
		var $folder = $(html);	
		$('#menu_left_cont').append($folder);	
		// 폴더 리스트
		if (f_info) {
			// 기존 생성된 폴더
			$folder.find('.folder-name-input').val(f_info.folder_name ? f_info.folder_name : def_folder_nm);
			$folder.removeClass('hide-folder');			
			// 메뉴 추가
			if (f_info.list) {
				$.each(f_info.list, function(){
					_self.left_add_menu(false, this, $folder);					
				});
			}
		} else {
			// 신규
			$folder.find('.folder-name-input').val(def_folder_nm);
			$('#menu_left_wrap').scrollTop($('#menu_left_cont').height());
			setTimeout(function(){$folder.removeClass('hide-folder');}, 200);
		}					
		// 폴더 이벤트 처리
		// 폴더명 수정
		$folder.find('.folder-name-input').on('focus', function(e){
			$(this).data('f_name', $(this).val());			
		});		
		$folder.find('.folder-name-input').on('blur', function(e){
			if ($.trim($(this).val()) == '') {
				$(this).val($(this).data('f_name'));
			}			
			$(this).val($.trim($(this).val()));
		});		
		$folder.find('.folder-name-input').on('keydown', function(e){
			if (e.keyCode == 13) {
				$(this).blur();
				return false;
			}
		});	
		// 폴더 삭제
		$folder.find('.menu_del').on('click', function(){
			gap.showConfirm({
				title: gap.lang.folder_del,
				contents: gap.lang.folder_del_confirm,
				callback: function(){
					// 활성화된 상태에서 삭제하는 경우
					if ($folder.hasClass('active')) {
						$('.quick_right_list').addClass('disable');
						$('#all_app_list li.on .ico_box').css('background-color', '#fff');
						$('#all_app_list li.on').removeClass('on');						
					}
					$folder.addClass('hide-folder');
					setTimeout(function(){
						$folder.remove();						
					}, 200);
				}
			});
		});		
		// 메뉴 추가
		$folder.find('.add-menu-wrap').on('click', function(){
			// LNB 메뉴 선택된 경우 해제로 변경
			$('#edit_menu_layer .lnb_menu_set').removeClass('active');			
			// 활성화된 상태인 폴더가 있으면 비활성으로 변경
			$('#edit_menu_layer .folder_set').removeClass('active');			
			// 현재 선택한 폴더 활성화
			$folder.addClass('active');			
			_self.ready_right_menu($folder);
		});		
		// 메뉴 위치 변경
		$folder.find('ul.flex').sortablejs({
			animation: 150,
			ghostClass: 'menu-ghost',
			filter: '.add-menu-wrap',
			onStart: function(evt){
				$(evt.from).addClass('dragging');
			},
			onEnd: function(evt){
				$(evt.from).removeClass('dragging');
			},
			onMove: function (evt) {
				return evt.related.className.indexOf('add-menu-wrap') === -1;
			}
		});
	},
	
	"ready_right_menu" : function($folder){
		// 선택한 폴더의 메뉴를 표시		
		// 우측 전체 메뉴 리스트
		var $list = $('#all_app_list');
		// 우측 메뉴 영역 초기화
		$list.find('li.on .ico_box').css('background-color', '');
		$list.find('li.on').removeClass('on');		
		var $menus = $folder.find('.user-folder-menu');
		$menus.each(function(){
			var _key = $(this).data('key');
			var $li = $list.find('li[data-key="' + _key + '"]');
			var $menubox = $li.find('.ico_box');			
			$li.addClass('on');
			$menubox.css('background-color', $menubox.data('bg'));
		});		
		// 선택 가능한 상태로 만들어 준다
		$('.quick_right_list').removeClass('disable');
	},
	
	"get_user_applist" : function(){
		var _self = this;		
		var postData = {
			"start" : 0,
			"perpage" : 1000
		};		
		return $.ajax({
			type: "POST",
			url: root_path + "/appstore_person_list.km",
			dataType : "text",	//"json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success: function(__res){
				var res = JSON.parse(__res);
				var data = res.data.data;
				
				_self.draw_my_applist(data);
			}
		});		
	},
	
	"get_user_applist_portlet" : function(data){
		var def = $.Deferred();
		this.draw_my_applist(data);		
		def.resolve();
		return def;
	},
	
	"draw_my_applist" : function(data){
		var _self = this;		
		// LNB 정보 표시
		if (data.lnb) {
			var $wrap = $('.lnb_menu_set');
			$.each(data.lnb, function(){
				_self.left_add_menu(true, this, $wrap);
			});
		}		
		// 폴더 정보 표시
		if (data.folder) {
			$.each(data.folder, function(){
				_self.draw_menu_folder(this);
			});
		}
	},	
	
	"get_all_applist" : function(){
		var _self = this;		
		var postData = {
			"start" : 0,
			"perpage" : 1000,
			"query" : "",
			"admin" : ""
		};		
		return $.ajax({
			type: "POST",
			url: gap.channelserver + "/api/portal/appstore_list.km",
			dataType : "text",	//"json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success: function(__res){
				var res = JSON.parse(__res);
				var data = res.data.response;				
				// 메뉴명으로 정렬
				data.sort(function(a, b){
					if (gap.userinfo.userLang == 'ko') {
						if(a.menu_kr > b.menu_kr) return 1;
						if(a.menu_kr < b.menu_kr) return -1;
						if(a.menu_kr === b.menu_kr) return 0;
					} else {
						if(a.menu_en > b.menu_en) return 1;
						if(a.menu_en < b.menu_en) return -1;
						if(a.menu_en === b.menu_en) return 0; 
					}
				});				
				var $list = $('#all_app_list');
				$.each(data, function(){
					var _icon = gap.channelserver + "/menuicon.do?code=" + this.code + '&ver=' + this.last_update;
					var _menu_nm = gap.userinfo.userLang == 'ko' ? this.menu_kr : this.menu_en;					
					var html =
						'<li data-key="' + this.code + '">' +
						'	<div class="ico_box" data-bg="' + this.bg + '" style="background-color:#fff">' +
						'		<span class="ico menu" style="background-image:url(' + _icon + ')"></span>' +
						'	</div>' +
						'	<span class="tit" title="' + _menu_nm + '">' + _menu_nm + '</span>' +
						'</li>';
					
					var $li = $(html)
					$li.data('info', this);					
					$list.append($li);
				});				
				// 이벤트 처리
				$list.find('li').on('click', function(){					
					var is_lnb = false;
					var info = $(this).data('info');
					// LNB 메뉴 추가인지 체크
					if ($('.lnb_menu_set.active').length == 1) {
						is_lnb = true;
						var $folder = $('.lnb_menu_set.active');
					} else {
						var $folder = $('.folder_set.active');						
					}
					if ($(this).hasClass('on')) {
						// 메뉴삭제
						var $target_menu = $folder.find('li[data-key="' + info.code + '"]'); 
						$target_menu.remove();						
						$(this).removeClass('on');
						$(this).find('.ico_box').css('background-color', '');
					} else {						
						// LNB인 경우 개수 제한 확인
						if (is_lnb) {
							if ($folder.find('.user-folder-menu').length >=5) {
								mobiscroll.toast({message:gap.lang.quick_setup_alert, color:'danger'});
								return;
							}
						}						
						_self.left_add_menu(is_lnb, info, $folder);						
						$(this).addClass('on');
						$(this).find('.ico_box').css('background-color', info.bg);
					}					
				});
			}
		});
	}, 
	
	"left_add_menu" : function(is_lnb, info, $folder){		
		// 기존에 같은 키로 등록된게 있으면 예외처리
		var $target_menu = $folder.find('li[data-key="' + info.code + '"]'); 
		if ($target_menu.length > 0) {
			return;
		}		
		var _icon = gap.channelserver + "/menuicon.do?code=" + info.code + '&ver=' + info.last_update;
		var _menu_nm = (gap.userinfo.userLang == 'ko' ? info.menu_kr : info.menu_en);
		var html = 
			'<li data-key="' + info.code + '" class="user-folder-menu hide-menu">' +
    		'	<div class="ico_box">' +
    		'		<button class="del"></button>' +
    		'		<span class="ico menu" style="background-image:url(' + _icon + ')"></span>' +
    		'	</div>' +
    		'	<span class="tit" title="' + _menu_nm + '">' + _menu_nm + '</span>' +
    		'</li>';
		var $new_menu = $(html);		
		if (!is_lnb) {
			$new_menu.find('.ico_box').css('background-color', info.bg);	
		}		
		$new_menu.data('info', info);
		$folder.find('.add-menu-wrap').before($new_menu);
		setTimeout(function(){$new_menu.removeClass('hide-menu');}, 100);		
		// 삭제 이벤트
		$new_menu.find('.del').on('click', function(){
			var $list = $('#all_app_list');			
			if (is_lnb) {
				var $parent = $new_menu.closest('.lnb_menu_set');
			} else {
				var $parent = $new_menu.closest('.folder_set');
			}
			// 삭제한 메뉴가 활성화된 상태인 경우 우측 메뉴 on클래스 제거
			if ($parent.hasClass('active')) {
				var $li = $list.find('li[data-key="' + info.code + '"]');
				$li.removeClass('on');
				$li.find('.ico_box').css('background-color', '#fff');
			}			
			$new_menu.remove();
		});
	},
	
	"save_app_menu" : function(portlet_el){
		// 포틀릿에서 저장한 경우 어떤 포틀릿에서 수정하여 들어왔는지 portlet_el 값이 셋팅되어 넘어온다
		var _self = this;		
		var postData = this.get_app_json();
		gap.show_loading(gap.lang.processing);	
		// 포틀릿 메뉴에서 들어온 설정인 경우
		if ($('#edit_menu_layer').hasClass('portlet')){
			// 포틀릿 엘리먼트 data셋에 정보 저장
			var info = portlet_el.data('info');
			info.config = {folder: postData.folder};			
			// 메뉴에 전체 데이터를 별도 데이터셋에 저장한다
			var full_info = this.get_app_json(true);
			portlet_el.data('app_info', full_info);			
			gHome.savePortletInfo('portlet').then(function(){
				gap.hide_loading();
				portlet_el.find('.btn_refresh').click();
				_self.close_app_layer(true);
			});
			return;
		}	
		$.ajax({
			type: "POST",
			url: gap.channelserver + "/appstore_save_person.km",
			dataType : "text",	//"json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success: function(__res){
				// 저장 완료되면 새로고침				
				location.reload();
			},
			error: function(){
				gap.hide_loading();
				mobiscroll.toast({message:gap.lang.errormsg, color:'danger'});
			}
		});		
	},
	
	"get_app_json" : function(full_info){
		var $layer = $('#edit_menu_layer');
		var lnb_color = this.get_lnb_color();		
		var postData = {
			color: lnb_color,
			lnb: [],
			folder: []
		}	
		// LNB 정보
		$('#lnb_app_list li').each(function(){
			// 더 보기 메뉴 예외처리
			if ($(this).hasClass('add-menu-wrap')) return true;
			if ($(this).hasClass('color-change-wrap')) return true;
			if ($(this).hasClass('lnb-fix')) return true;			
			var _info = $(this).data('info');
			postData.lnb.push(_info.code);
		});		
		// 폴더 정보
		var $folders = $layer.find('.folder_set');
		$folders.each(function(){
			var f_info = {};			
			// 폴더명
			f_info['folder_name'] = $(this).find('input').val();			
			// 폴더에 할당된 메뉴
			var list = [];
			$(this).find('li').each(function(){
				if ($(this).hasClass('add-menu-wrap')) return true;
				var _info = $(this).data('info');
				
				if (full_info) {
					list.push(_info);
				} else {
					list.push(_info.code);
				}
			});			
			f_info['list'] = list;			
			postData.folder.push(f_info);
		});		
		return postData;
	},
	
	"load_person_app" : function(){
		var _self = this;
		$.ajax({
			async: false,
			type: "POST",
			url: root_path + "/appstore_person_list.km",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success: function(__res){
				var data = __res.data.data;				
				// lnb 색상 변경
				if (data.color) {
					_self.set_lnb_color(data.color);					
				}				
				_self.draw_lnb_menu(data.lnb);				
				if (data.folder) {
					_self.folder_menu_info = data.folder;
				}				
				_self.lnb_menu_load = true;				
			},
			error: function(){
				mobiscroll.toast({message:gap.lang.errormsg, color:'danger'});
			}
		});
	},
	
	"draw_lnb_menu" : function(data){
		var _self = this;		
		if (!data) return;
		if (!Array.isArray(data)) return;		
		$.each(data, function(){
			var menu_nm = (gap.userinfo.userLang == 'ko' ? this.menu_kr : this.menu_en);
			var menu_icon = gap.channelserver + "/menuicon.do?code=" + this.code + '&ver=' + this.last_update;
			var html =
				'<li>' +
				'	<div class="lnb-ico" style="background-image:url(' + menu_icon + ')"></div>' +
				'	<a class="lnb-title" title="' + menu_nm + '"><span>' + menu_nm + '</span></a>' +
				'</li>';
			var $lnb_menu = $(html);			
			// 기존에 있던 LNB메뉴인 경우는 ID값을 넣어준다
			if (this.link == "LNB") {
				$lnb_menu.attr('id', this.code);				
				// 메일, 회의예약, 취합은 카운트 표시되어야 함
				var menu_id = '';
				if (this.code == 'mail') {
					menu_id = '4';
				} else if (this.code == 'meeting') {
					menu_id = '6';
				} else if (this.code == 'collect') {
					menu_id = '7';
				}
				if (menu_id != '') {
					$lnb_menu.find('a').append('<div class="menu-cnt-bx" style="display:none" id="menu_id_' + menu_id + '"></div>');
				}
			} 
			$lnb_menu.addClass('custom-lnb');
			$lnb_menu.data('info', this);
			$('#app_more').before($lnb_menu);			
		});
	},
	
	"go_app_url" : function(info){		
		/*
		// 메일, 캘린더 사용여부 판단
		if ( window.use_mail == 'Y' && (info.code == 'mail' ) {
			mobiscroll.toast({message:gap.lang.no_access, color:'danger'});
			return;
		}
		*/		
		// 기본 LNB메뉴인 경우 별도 처리
		if (info.link == 'LNB') {
			this.lnb_menu_click(info.code);
			$('#app_more').qtip('destroy', true);
			return;
		}
		this.replace_app_url(info.link).then(function(url){
			window.open(url, info.code, null);
		}, function(){
			mobiscroll.toast({message:gap.lang.errormsg, color:'danger'});
		});		
		//클릭 로그를 남긴다.
		gap.write_log_box(info.code, info.menu_kr, "menu", "pc");
	},
	
	"replace_app_url" : function(url){
		var $def = $.Deferred();		
		// 사용자 Key
		if (url.indexOf('__key__') >= 0) {
			url = url.replace('__key__', gap.userinfo.rinfo.ky);
		}		
		// 사용자 ID
		if (url.indexOf('__id__') >= 0) {
			url = url.replace('__id__', gap.userinfo.userid);
		}		
		// 언어
		if (url.indexOf('__lang__') >= 0) {
			url = url.replace('__lang__', gap.userinfo.userLang);
		}		
		// EP 연결인 경우
		if (url.indexOf('__aes__') >= 0) {
			$.ajax({
				url : gap.channelserver + "/aes.km",
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){
					if (res.aes) {
						var key = res.aes;
						url = url.replace('__aes__', key);
						$def.resolve(url);						
					} else {
						$def.reject();
					}
				},
				error: function(){
					$def.reject();
				}
			});
		} else {
			$def.resolve(url);			
		}	
		return $def;
	},
	
	"lnb_menu_click" : function(id){		
		//클릭 로그를 남긴다.
		gap.write_log_box(id, "", "menu", "pc");		
		if (id == "help"){
			gap.hide_new_layer();
			gBody.cur_opt = ""; //현재 열려 있는 체널 값을 초기화 한다.
			gTop.show_manual();
			return;
		}else if (id == "mail" || id == "cal"){			
			if (id == "mail"){				
				var url = location.protocol + "//" + location.host + "/" + mailfile + "/FrameMail?openform";
				gap.openOnce(url, "dsw_mail");
			}else if (id == "cal"){
				var vp = maildbpath.split("/")[0];	
				var url = location.protocol + "//" + location.host + "/" + opath + "/cal/calendar.nsf/main?readform";			
				window.open(url, "dsw_cal", "");	
			}
			return;
		}else{
			gap.hide_new_layer();
			gBody.cur_opt = ""; //현재 열려 있는 체널 값을 초기화 한다.
			// 업무 시작하기 레이어 닫기
			$('#top_header_layer').removeClass('show-quick');
			gTop.hideUserSchedule();
		}		
		gma.hideChatButton();		
		//통합검색창이 떠 있을 경우 제거한다. /////////////////////
		$("#portal_search").hide();
		$("#alram_layer").fadeOut();		
		$("#left_main").show();
		$("#main_body").show();	
		$("#right_menu").show();
		$("#main_center").show();
		$("#main_right_wrap").show();
		$("#chat_profile").hide();
		////////////////////////////////////////////
		$('.meet-block-layer').remove();	
		if (id == "abc2" || id=="channel" || id=="home" || id=="drive" || id == "todo"  || id == "note" || id == "action" || id == "apps" || id == "org" || id=="collect" || id=="meeting"){
			//열려 있는 채팅 정보를 초기화 한다.
			gBody.cur_cid = "";		
			if (id == "home"){
				$("#main_content").show();
				$("#left_main").hide();
				$("#main_body").hide();
				$("#channel_main").hide();				
			} else {
				gap.hide_layer();
				$("#main_content").hide();
				$("#left_main").show();
				$("#main_body").show();
			}		
			$(".left-menu li").removeClass("act");
			$('#' + id).addClass("act");
			if (gap.ext_user == "T" && id == "abc2"){
				var url = location.pathname + "?readform&" + id;
				if (history.state != id){
					history.pushState(id, null, url);
				}else{
					history.replaceState(id, null, url);
				}
			}else{
				var url = location.pathname + "?readform&" + id;
				if (history.state != id){
					history.pushState(id, null, url);
				}else{
					history.replaceState(id, null, url);
				}
			}				
		}		
		if (id == "abc2"){
			gap.cur_window = "chat";
			gap.LoadPage("body_content", "html/main_body.html?open&ver=" + jsversion);  
		}else if (id == "channel"){
			$("#ext_body_search").hide();
			$("#box_search_content").hide();
			$("#user_profile").hide();
			$("#left_main").empty();
			$("#channel_main").css("width","100%");
			gap.cur_window = "channel";				
			gBody.chat_right_menu_close();
		//	gBody.go_chat_left_draw();			
			$("#left_roomlist").hide();
			$("#left_buddylist").hide();
			$("#group_add_layer").hide();			
			$("#add_group_btn").hide();
			$("#add_group2").hide();
			$("#left_mail").hide();
			$("#sub_channel_content").hide();
			$("#left_main").show();				
			$("#left_channel").show();				
			gap.change_location("channel");				
			//신규 메시지 붉은 점을 제거한다.
			gap.change_title("1","");
			$("#tab3_sub").text(gap.lang.channel);						
			gap.param = "channel";				
			$("#left_main").css("width","312px;");			
			//초기화 이벤트 핸들러 정의한다.		
			gBody.init();
			gBody.show_channel();	//init함수 호출 후에 호출해야 한다.
			$("#channel_right").css("display","none");
			$("#center_content").css("display","none");
			$("#main_body").removeAttr("style");
			$("#main_body").css("right", "0px");		
		}else if (id == "todo"){			
			gBody.cur_tab = "";			
			var cls = $("#left_frame_collapse_sub_btn").attr("class");
			if (cls == "ico btn-left-fold on"){
				$("#left_frame_collapse_sub_btn").click();
			}			
			$("#ext_body_search").hide(); //통합검색창이 열려 있는 경우 닫아 준다.
			gBody.channel_right_frame_close();			
			gBody.goTodo();
			gap.cur_window = "todo";			
		}else if (id == "drive"){			
			gBody.cur_tab = "";			
			var cls = $("#left_frame_collapse_sub_btn").attr("class");
			if (cls == "ico btn-left-fold on"){				
				$("#left_frame_collapse_sub_btn").click();
			}			
			$("#container_detail").hide();
			$("#channel_right").show();			
			gap.cur_window = "drive";
			gBody.go_drive_view();			
		}else if (id == "org"){			
			gBody.cur_tab = "";			
			var cls = $("#left_frame_collapse_sub_btn").attr("class");
			if (cls == "ico btn-left-fold on"){
				$("#left_frame_collapse_sub_btn").click();
			}			
			$("#ext_body_search").hide(); //통합검색창이 열려 있는 경우 닫아 준다.
			gBody.channel_right_frame_close();			
			gBody.goOrg();
			gap.cur_window = "org";
		}else if (id == "meeting"){			
			gBody.cur_tab = "";			
			var cls = $("#left_frame_collapse_sub_btn").attr("class");
			if (cls == "ico btn-left-fold on"){
				$("#left_frame_collapse_sub_btn").click();
			}			
			$("#ext_body_search").hide(); //통합검색창이 열려 있는 경우 닫아 준다.
			gBody.channel_right_frame_close();			
			gBody.goMeeting();
			gap.cur_window = "meeting";			
		}else if (id == "collect"){			
			gBody.cur_tab = "";			
			var cls = $("#left_frame_collapse_sub_btn").attr("class");
			if (cls == "ico btn-left-fold on"){
				$("#left_frame_collapse_sub_btn").click();
			}			
			$("#ext_body_search").hide(); //통합검색창이 열려 있는 경우 닫아 준다.
			gBody.channel_right_frame_close();			
			gBody.goCollect();
			gap.cur_window = "collect";			
		}else if (id == "note"){
			gap.gAlert(gap.lang.sv);
		}else if (id == "action"){
			gap.gAlert(gap.lang.sv);
		}else if (id == "videochat"){
			if (gap.IE_Check()){
				gap.gAlert(gap.lang.IE_Notsupport);
			}else{
				gBody.rigth_btn_change_empty();			
				gBody.open_video_popup("T", "");
			}
		}else if (id == "home"){							
			gBody.cur_tab = "";			
			var cls = $("#left_frame_collapse_sub_btn").attr("class");
			if (cls == "ico btn-left-fold on"){
				$("#left_frame_collapse_sub_btn").click();
			}			
			$("#ext_body_search").hide(); //통합검색창이 열려 있는 경우 닫아 준다.
			gBody.channel_right_frame_close();			
			gHome.init();
			gap.cur_window = "boxmain";
		}		
		// 오른쪽 사이드 메뉴 표시/감추기
		gBody.disp_right_menu(id);		
		//브라우저 타이틀을 설정한다.
		gap.browser_title_set(id);		
		// 채팅 레이어
		gma.showChatButton();		
	},
	
	"get_lnb_color" : function(){
		return getComputedStyle(document.querySelector(':root')).getPropertyValue('--lnb-color');
	},
	
	"set_lnb_color" : function(color){
		document.querySelector(':root').style.setProperty('--lnb-color', color);		
		// 퀵메뉴 백그라운드는 LNB 색상보다 좀 더 밝게 설정
		var q_color = '#' + tinycolor(color).lighten(7).toHex();
		document.querySelector(':root').style.setProperty('--lnb-quick-color', q_color);
	},
	
	"msg_send_notice" : function(id, obj){
		
		var msg = gap.lang.mn5;
	//	msg += "<div style='text-align:left;  padding-top:10px;'>["+gap.lang.cose+"]</div>" + "공지로 등록하시겠습니까?";			 			
		gap.showConfirm({
			title: "Confirm",
			contents: msg,
			callback: function(){
				//현재 채팅방의 특정 sq의 상세 데이터를 검색한다.
				gBody.sel_position = "chat";
				
				var cur_cid = gBody.cur_cid;
//				if ($(obj).closest(".popup_chat").length == 1){
//					gBody.sel_position = "popup";
//					cur_cid = gma.cur_cid_popup;
//				}
				if (obj == "popup_chat"){
					gBody.sel_position = "popup";
					cur_cid = gma.cur_cid_popup;
				}
				_wsocket.load_chatlog_sq_notice(cur_cid, parseInt(id,10)+1, obj);
			}
		});
		
		
	},
	
	"search_chat_sq_notice" : function(obj){
		
		var data = obj.ct.log[0];
		//선택한 메시지가 파일일 경우 복사하는 URL을 호출해 줘야 한다.
		var tpath = "/" + gap.search_today_only();
		
		

		
		var ty = obj.ct.log[0].ty;
		
	//	if (data.ex){
		if (ty == 5 || ty == 6){
			
			var url = gap.fileupload_server_url + "/movefile";
			var body = JSON.stringify({
				"sourcepath" : data.ex.sf.replace("/",""),
				"targetpath" : gap.userinfo.rinfo.ky,
				"filename" : data.ex.sn,
				"type" : "notice"
			});
			$.ajax({
				type : "POST",
				url : url,
				data : body,
				contentType : "application/json; charset=utf-8",
				success : function(res){
				
					var rx = JSON.parse(res);
					var upload_path = rx.upload_path;
					//data.ex.sf = "/" + gap.search_today_only();
					gBody.reg_notice(obj, "", upload_path);
				},
				error : function(e){
					gap.error_alert();
				}
			});
		}else{
			gBody.reg_notice(obj, "", "");
		}	
	},
	
	"reg_notice" : function(obj, opt, upload_path){
		var data = "";
		var room_key = "";
		if (opt == "editor"){
			data = obj;
			var callfrom = $('#notice_ly').data('info').callfrom;
			if (callfrom == "chat"){
				room_key = gBody.cur_cid;
			}else{
				room_key = gma.cur_cid_popup;
			}			
		}else{
			data = obj.ct.log[0];
			room_key = obj.ct.cid;
		}		
		//data의 작성자 정보로 변경한다.
		var isFile = false;		
		if (obj.ct){
			var ty = obj.ct.log[0].ty;
			if (ty == 5 || ty == 6){
				isFile = true;
			}
		}else{
			if (obj.ex){
				isFile = true;
			}
		}
		if (isFile){			
			var fileinfo = data.ex;
			var filename = fileinfo.nm;
			var filesize = fileinfo.sz;
			var file_type = fileinfo.ty;
			var rp = "."+ file_type;
			var _lastDot = fileinfo.sn.lastIndexOf(".");
			var md5 = fileinfo.sn.substring(0, _lastDot);
			//var md5 = fileinfo.sn.replace(rp, "");
			var dtype = gap.file_icon_check(filename);
			
			var newfileinfo = new Object();
			newfileinfo.dtype = dtype;
			newfileinfo.file_type = file_type;
			newfileinfo.filename = filename;
			newfileinfo.md5 = md5;
			newfileinfo.file_size = {'$numberLong' : ""+filesize+""}
			
			data.info = [];
			data.info.push(newfileinfo);			
			data.upload_path = upload_path;
			delete data.ex;			
		}
		
		data.ky = gap.userinfo.rinfo.ky;
		data.nm = gap.userinfo.rinfo.nm;
		data.enm = gap.userinfo.rinfo.enm;
		
		var url = gap.channelserver + "/save_notice.km";
		var body = JSON.stringify({
			"owner" : gap.userinfo.rinfo,
			"data" : data,
			"upload_path" : upload_path,
			"key" : room_key,
			"use" : "T",
			"tyx" : "chat"
		});
		
		$.ajax({
			type : "POST",
			url : url,
			data : body,
			contentType : "application/json; charset=utf-8",
			success : function(res){			
				//공지 등록되었다는 채팅을 전송한다.
				
				if (opt == "editor"){
					gap.read_notice(room_key);
				}else{
					gBody.send_msg_notice(data, res.id, room_key);
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"reg_notice_update" : function(obj, opt){
		
		var data = "";
		var room_key = "";
		var isPopup = false;
		if (opt == "editor"){
			data = obj;
			var callfrom = $('#notice_ly').data('info').callfrom;
			if (callfrom == "chat"){
				room_key = gBody.cur_cid;
			}else{
				isPopup = true;
				room_key = gma.cur_cid_popup;
			}
			$("#btn_notice_close").click();
			
		}else{
			data = obj.ct.log[0];
			room_key = obj.ct.cid;
		}
		
		var url = gap.channelserver + "/update_notice.km";
		var body = JSON.stringify({
			"editor" : data.editor,
			"title" : data.title,
			"updatekey" : gHome.notice_data._id.$oid
		});
		
		$.ajax({
			type : "POST",
			url : url,
			data : body,
			contentType : "application/json; charset=utf-8",
			success : function(res){			
				//공지 등록되었다는 채팅을 전송한다.
				if (opt == "editor"){
					gap.read_notice(room_key);
				}else{
					gBody.send_msg_notice(data, res.id, room_key);
				}			
				
				var xinfo = new Object();
				if (obj.channel_code != ""){
					//업무방에서 수정한 경우					
					gBody.drawNoticeWork(gBody.cur_opt);
					var list = gap.cur_room_search_info_member_ids(gBody.cur_opt);	
					xinfo.channel_code = obj.channel_code;
					xinfo.sender = list;
					xinfo.room_key = gBody.cur_opt;
					xinfo.type = "update_notice_channel";
					_wsocket.send_msg_other(xinfo, "update_notice_channel");	 //obj.sender에 참석자를 추가해야 함
				}else{
					//채팅에서 수정한 경우
					var member_list = "";
					if (isPopup){
						member_list = gBody.cur_room_att_info_list_popup;
					}else{
						member_list = gBody.cur_room_att_info_list;
					}
					var sender = [];
					for (var k = 0 ; k < member_list.length; k++){
						var info = member_list[k];
						if (info.ky != gap.userinfo.rinfo.ky){
							sender.push(info.ky);
						}
					}
					xinfo.room_key = room_key;
					xinfo.sender = sender;
					_wsocket.send_msg_other(xinfo, "update_notice_chat");	 //obj.sender에 참석자를 추가해야 함
				}
				
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"send_msg_notice" : function(obj, id, room_key){
				
		gBody.temp_gpt_msg = false;
		var type = "msg";
		var name = gap.userinfo.rinfo.nm;	
		var key = gap.search_cur_ky();    
		var msg = gap.lang.chat_notice;
		
		msg = obj.msg;  //"파일이 공지로 등록되었습니다", "사진이 공지로 등록되었습니다.", 메시지는 그냥 메시지
		if (obj.ty == 6){
			msg = gap.lang.mn2;
		}else if (obj.ty == 5){
			msg = gap.lang.mn1
		}
		var opt = "me";
		
		obj.nm = name;
		obj.ky = key;
		obj.enm = gap.userinfo.rinfo.enm;
		gBody.cur_notice_chat_info = obj;
		
		
		if (room_key != gma.cur_cid_popup){
			gma.chat_position = "";
		}
		
		gBody.MessageSend(opt, msg, type, name, key, id);
		gap.read_notice(room_key);
	},
	
	"go_chat_left_draw" : function(){	
		
		var html = "";		
		html += "<div class='nav-wide' id='nav_left_menu'>";
		html += "<div id='container' class='mu_container mu_work mu_test' style='overflow:none'>";
		html += "	<div class='contents '>";
		html += "		<nav>";
		html += "			<div class='nav-wide'> ";
		html += "				<button class='ico btn-left-fold' style='display:none'>접기</button> ";
		
		html += "				<div class='favorite' id='left_favorite' style='display:none'>";
		html += "				</div>";
		
		html += "				<div class='wrap-nav'>";
		html += "					<div class='nav-tab'>";
		html += "						<ul class='tabs'>";		
		html += "							<li class='tab' id='tab1' style='width:33%'><a href='#' id='tab1_sub' style='font-size:16.5px'><p></p></a></li>";
		html += "							<li class='tab' id='tab2' style='width:33%'><a href='#' id='tab2_sub' style='font-size:16.5px'><p></p></a></li>";
		html += "							<li class='tab' id='tab4'  style='width:33%'><a href='#' id='tab4_sub' style='font-size:16.5px'><p></p></a></li>";	
		html += "						</ul>";
		html += "					</div>";	
		html += "					<div class='aside-inner' id='chatroom_search_area' style='display:none'>";
		html += "						<div class='input-field'>";
		html += "							<span class='ico ico-search'></span>";
		html += "							<input type='text' class='formInput' id='inpuser_field' autocomplete='off' placeholder='"+gap.lang.inpuser+"' />";
		html += "							<div class='xbtn-search-close' style='display:none' id='chlist_query_btn_close'></div>"
		html += "						</div>";
		html += "					</div>";
		html += "				<div class='nav-list room' id='left_roomlist' style='display:none; '>";
		html += "					<div id ='left_roomlist_sub'></div>";
		html += "				</div>";
		
		html += "				<div class='nav-list room' id='left_buddylist'>";
		html += "					<div class='add-group' id='add_group1' style='display:none; margin-top:5px'>";
		html += "						<div class='input-field'>";
		html += "							<input type='text' id='group_txt' class='formInput' style='border-radius:unset;border:none;box-shadow:none' placeholder='그룹명을 입력하세요' />";
		html += "							<span class='bar'></span>";
		html += "						</div>";
		html += "					</div>";			
		html += "					<div id ='buddy_list_dis' style='margin-top:10px'></div>";
		html += "				</div>";
		html += "				<div  id='left_buddylist_btn' style=''>";		
		html +=	"					<button class='btn-work-add' id='create_chat_room_left_add_group'><span class='ico ico-plus'></span>"+gap.lang.addGroup+"</button>";		
		html += "				</div>";
		
		html += "				<div  id='left_roomlist_btn' style='display:none'>";		
		html +=	"					<button class='btn-work-add' id='create_chat_room_left'><span class='ico ico-plus'></span>"+gap.lang.makechatroom+"</button>";		
		html += "				</div>";
		
		//메일 영역	//////////////////////////////////////////////
		html += "				<div class='nav-list room' id='left_mail' style='display:none; padding-right:5px; padding-left:20px; overflow:hidden'>";		
		html += "					<div class='nav-list-top' style='margin-top:10px'>";
		html += "						<div class='nav-category' style='width:calc(100% - 85px)'>";
		html += "							<div class='input-field selectbox'>";
		html += "								<select id='mailbox_select' style='height:35px'>";
		html += "									<option value='1' selected id='menu_inbox'>Inbox</option>";
		html += "									<option value='2' id='menu_sent'>Sent</option>";
		html += "								</select>";	
		html += "							</div>";
		html += "						</div>";		
		html += "						<button class='mail_list_write_btn' id='mail_compose_btn'>"+gap.lang.basic_write+"</button>";		
		html += "							<div class='mu__work aside-inner input-field' style='padding: 5px 8px 5px 0'>";
		html += "								<span class='ico ico-search' style='top:16px'></span>";
		html += "								<input type='text' id='mail_search_query_field' autocomplete='off' class='formInput' placeholder='"+gap.lang.input_search_query+"' />";
		html += "								<div class='xbtn-search-close' style='display:none' id='mail_query_btn_close'></div>"
		html += "							</div>";
		html += "						<div class='mail-search' id='left_mail_search' style='display:none;'>";
		html += "							<div class='input-field'> ";
		html += "								<input type='text' id='mail_search_query_field' autocomplete='off' class='formInput' placeholder=''>";
		html += "									<span class='bar'></span>";
		html += "							</div>";
		html += "							<button class='ico btn-search' id='mail_search_btn'>Search</button>";
		html += "						</div>";
		html += "					</div>";		
		html += "	<div id='left_mail_list' class='ui-droppable' style='margin-top:5px; height:calc(100% - 100px)'>";
		html += "	<div id='left_mail_sub' style=''></div>";
		html += "</div>";
		///////////////////////////////////////////////////////////////////////////////////		
		html += "			</div>  ";	
		html += "		</nav> ";	
		html += "	</div>";
		html += "</div>";		
		html += "</div>";		
		$("#left_main").show();
		$("#left_main").html(html);		
		

		$("#left_roomlist_btn").off().on("click", function(e){
			gBody.chat_add_opt = "F";
			gBody.create_chatroom();
		});	
		$("#left_buddylist_btn").off().on("click", function(e){
			gBody.create_buddy_group();
		});		
		$('select').material_select();		
		$("#mail_compose_btn").off().on("click", function(e){			
			var _url = "/" + mailfile + "/Memo?openform&opentype=popup";
			_url = location.protocol + "//" + location.host + _url;
			gap.open_subwin(_url , '1000', '800', 'yes', '', 'yes')
		});
		
		
	},
	
	
	"create_chatroom" : function(){
		var html = gBody.new_chat_layer_html();	
		
		gap.showBlock();
		$("#common_work_layer").show();
		$("#common_work_layer").html(html);
		
		$("#input_chat_user").focus();
		
//		$(html).appendTo('body');
		var $layer = $('#new_chat_layer');
//		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
//		$layer.wrap('<div id="common_work_layer" class="mu_container mu_work" style="top:-50%;"></div>')
//		
		$("#input_chat_user").keydown(function(evt){
			if (evt.keyCode == 13){
				if ($("#input_chat_user").val().trim() == ""){
					mobiscroll.toast({message:gap.lang.inputname, color:'danger'});
					return false;
				}
				
				gBody.channel_user_search("T", $("#input_chat_user").val(), true);				
			}
		})
		.bind('paste', function(e){
			gap.change_paste_text(e, this);
		});
		
		$("#org_pop_btn").on("click", function(){
			window.ORG.show(
					{
						'title': gap.lang.invite_user,
						'single':false,
						'pergroup': false,
						'peraddr': false,
						'select': 'person'
					}, 
					{
						getItems:function() { return []; },
						setItems:function(items) { /* 반환되는 Items */
						
							gBody.aleady_select_user_count = 0;
							for (var i = 0; i < items.length; i++){
								var _res = gap.convert_org_data(items[i]);
								if (_res.ky.toLowerCase() != gap.userinfo.rinfo.ky.toLowerCase()){
									gBody2.channel_add_user('T', _res);
								}
							}
							gBody.alert_aleady_select_user();
						}
					});
		});
		
		$("#create_chat_btn").on("click", function(){
	
			if ($("#chat_member_list").children().length == 0){
				mobiscroll.toast({message:gap.lang.inputname, color:'danger'});
				return false;
			}
						
			var member_count = $("#chat_member_list").children().length;
			var list = new Array();
			var select_name = "";
			for(var i = 0; i < member_count; i++){
				var user_info = $("#chat_member_list").children().eq(i).data("user");	//JSON.parse( $("#chat_member_list").children().eq(i).attr("data-user"));
				list.push(user_info.ky);
				if (user_info.ky != gap.userinfo.rinfo.ky){
					if (gap.userLang == "ko"){
						select_name = user_info.nm;
					}else if (user_info.el == gap.userinfo.rinfo.el){
						select_name = user_info.onm;
					}else{
						select_name = user_info.enm;
					}
					
				}
			}
			gBody.select_name = select_name;
			list.push(gap.search_cur_ky());
			
			
			//기존에 팀
			if (member_count > 1){
				var res = gap.search_exist_chatroom_nn(list);
				if (res != ""){
					//기존에 참석자가 포함된 방이 있다는 이야기임
					 $("#close_chat_layer").click();
					 gBody.enter_chatroom_for_chatroomlist(res, "", "");
					 return false;
				}
			}		
			$("#close_chat_layer").click();
			_wsocket.search_user_makeroom(list);
		});
		
		$("#close_chat_layer").on("click", function(){
			gap.remove_layer('new_chat_layer');
		//	gap.remove_layer('common_work_layer');
		});
	},
	
	
	"channel_user_search" : function(ch_type, str, selectme){
	
		/*
		 * ch_type : D(드라이브), C(채널), F(폴더), B(버디리스트)
		 */
		if (ch_type == "D"){
			$("#input_drive_user").val("");
			
		}else if (ch_type == "C"){
			$("#input_channel_user").val("");
		}else if (ch_type == "CO"){
			$("#input_reg_user").val("");
		}else if (ch_type == "T"){
			$("#input_chat_user").val("");	
		}else if (ch_type == "B"){
			$("#input_chat_user").val("");	
		}
		
		gsn.requestSearch('', str, function(sel_data){
			
			for (var i = 0 ; i < sel_data.length; i++){
				var info = sel_data[i];
				if (selectme){	
					gBody.aleady_select_user_count = 0;
					gBody.channel_add_user(ch_type, info);
					gBody.alert_aleady_select_user();					
				}else{
					if (info.ky.toLowerCase() == gap.userinfo.rinfo.ky.toLowerCase()){
						mobiscroll.toast({message:gap.lang.me_not_add_invite_user, color:'danger'});
						
					}else{
						gBody.aleady_select_user_count = 0;
						gBody.channel_add_user(ch_type, info);
						gBody.alert_aleady_select_user();
					}
				}
				
			}
		});
	},
	
	"new_chat_layer_html" : function(){
		var html = '';
		
		html += '<div id="new_chat_layer" class="layer_wrap center" style="width: 400px;">';
		html += '	<div class="layer_inner">';
		html += '		<div id="close_chat_layer" class="pop_btn_close"></div>';
		html += '		<h4>' + gap.lang.newchat + '</h4>';
		html += '		<div class="layer_cont left">';
		html += '			<div class="cont_wr rel" style="height: 230px">';
		html += '				<h5>' + gap.lang.inviteContact + '</h5>';
		html += '				<div class="before_select f_between">';
		html += '					<input type="text" id="input_chat_user" class="input" placeholder="' + gap.lang.inputname + '">';
		html += '					<button id="org_pop_btn" class="type_icon"></button>';
		html += '				</div>';
		html += '				<!-- 선택하면 나오면 화면 -->';
		html += '				<div class="after_select until_wr" style="display:none;">';
		html += '					<ul id="chat_member_list" class="scroll until p5" style="overflow-y:auto;">';
		html += '					</ul>';
		html += '				</div>';
		html += '			</div>';
		html += '		</div>';
		html += '		<div class="btn_wr">';
		html += '			<button id="create_chat_btn" class="btn_layer confirm">' + gap.lang.chat + '</button>';
		html += '		</div>';
		html += '	</div>';
		html += '</div>';
		
		return html;
	},
	
	"channel_add_user" : function(ch_type, obj){
		if (obj == undefined){
			mobiscroll.toast({message:gap.lang.searchnoresult, color:'danger'});
			return false;
		}
		
		var $el;
		var id = obj.ky;
		if (ch_type == "D"){	// 드라이브
			$el = $("#drive_member_list");
		}else if (ch_type == "C"){	// 채널
			$el = $("#channel_member_list");			
		}else if (ch_type == "CO"){	// 채널 옵션
			$el = $("#reg_member_list");		
		}else if (ch_type == "T"){	// 새로운 채팅(대화방)
			$el = $("#chat_member_list");
		}else if (ch_type == "F"){	// 폴더
			$el = $("#folder_member_list");
		}else if (ch_type == "I"){	// 폴더 (초대 가능 멤버 표시)
			$el = $("#folder_add_member_list");
		}else if (ch_type == "B"){   //버디리스트
			$el = $("#buddylist_member_list");
		}
		var len = $el.find("#member_" + id).length;
		
		if (len > 0){
		//	gap.gAlert(gap.lang.existuser);
			gBody.aleady_select_user_count += len;
			return false;
		}
		
		var user_info = gap.user_check(obj);
		var person_img = gap.person_profile_photo(obj);
		var html = "";

		if (ch_type == "C" || ch_type == "CO" || ch_type == "D" || ch_type == "T" || ch_type == "B"){
			html += '<li class="f_between" id="member_' + id + '" data1="'+id+'" data2="'+user_info.nm+'">';
			html += '	<span class="txt ko">' + user_info.disp_user_info + '</span>';
			html += '	<button class="file_remove_btn" onClick="gBody.channel_delete_user(this,\'' + ch_type + '\')"></button>';
			html += '</li>';			
			
		}else{
			html += '	<div class="member-profile" id="member_' + id + '"' + (ch_type == "I" ? " style='cursor:pointer' onClick='gBody.add_folder_member(this)'" : "") + '>';
			if (ch_type != "I"){
				html += '		<button class="ico btn-member-del" onClick="gBody.channel_delete_user(this,\'' + ch_type + '\')">삭제</button>';
			}
			html += '		<div class="user-result-thumb">' + person_img + '</div>';
			html += '		<dl>';
			html += '			<dt><span class="status online"></span>' + user_info.name + '</dt><dd>' + user_info.dept + '</dd><dd>' + user_info.company + '</dd>';
			html += '		</dl>';
			html += '	</div>';
		}

		
		if (ch_type == "F" || ch_type == "I"){
			$el.append($(html));
		} else {
			$el.append($(html));
			
			if ($el.children().length > 0){
				$el.parent().show();
			}
		}
				
		delete obj['_id'];
		$el.find("#member_" + id).data('user', obj);
	},
	
	"channel_delete_user" : function(obj, ch_type){
		
		var user_info = $(obj).parent().data("user");	//JSON.parse( $(obj).parent().attr("data-user") );
		var id = $(obj).parent().attr("id");
		
		if (ch_type == "C") {
			$("#channel_member_list #" + id).remove();
		} else if (ch_type == "CO") {
			$("#reg_member_list #" + id).remove();
		} else {			
			$("#" + id).remove();
		}
		
		if (ch_type == "C"){
			if ($("#channel_member_list").children().length == 0){
				$("#channel_member_list").parent().hide();
			}
			
		}else if (ch_type == "CO"){
			if ($("#reg_member_list").children().length == 0){
				$("#reg_member_list").parent().hide();
			}
				
		}else if (ch_type == "D"){
			if ($("#drive_member_list").children().length == 0){
				$("#drive_member_list").parent().hide();
			}
			
		}else if (ch_type == "T"){
			if ($("#chat_member_list").children().length == 0){
				$("#chat_member_list").parent().hide();
			}
		}else if (ch_type == "B"){
			if ($("#buddylist_member_list").children().length == 0){
				$("#buddylist_member_list").parent().hide();
			}
		}
		
		var mem_info = gap.user_check(user_info);
		
		if (ch_type == "F" || ch_type == "I"){
			var id = user_info.ky;
			var person_img = gap.person_profile_photo(user_info);
			var html = "";
			
			html += '	<div class="member-profile" id="member_' + id + '" style="cursor:pointer" onClick="gBody.add_folder_member(this)">';
			html += '		<div class="user-result-thumb">' + person_img + '</div>';
			html += '		<dl>';
			html += '			<dt><span class="status online"></span>' + mem_info.name + '</dt><dd>' + mem_info.dept + '</dd><dd>' + mem_info.company + '</dd>';
			html += '		</dl>';
			html += '	</div>';
			
			$("#folder_add_member_list").append($(html));
			$("#member_" + id).data('user', user_info);
			
			if ($("#folder_add_member_list").children().length > 5){
				$("#folder_member_list").css("max-height", "244px")
				
			}
		}
	},
	"new_chat_layer_html" : function(){
		var html = '';		
		html += '<div id="new_chat_layer" class="layer_wrap center" style="width: 400px;">';
		html += '	<div class="layer_inner">';
		html += '		<div id="close_chat_layer" class="pop_btn_close"></div>';
		html += '		<h4>' + gap.lang.newchat + '</h4>';
		html += '		<div class="layer_cont left">';
		html += '			<div class="cont_wr rel" style="height: 230px">';
		html += '				<h5>' + gap.lang.inviteContact + '</h5>';
		html += '				<div class="before_select f_between">';
		html += '					<input type="text" id="input_chat_user" class="input" placeholder="' + gap.lang.inputname + '">';
		html += '					<button id="org_pop_btn" class="type_icon"></button>';
		html += '				</div>';
		html += '				<!-- 선택하면 나오면 화면 -->';
		html += '				<div class="after_select until_wr" style="display:none;">';
		html += '					<ul id="chat_member_list" class="scroll until p5" style="overflow-y:auto;">';
		html += '					</ul>';
		html += '				</div>';
		html += '			</div>';
		html += '		</div>';
		html += '		<div class="btn_wr">';
		html += '			<button id="create_chat_btn" class="btn_layer confirm">' + gap.lang.chat + '</button>';
		html += '		</div>';
		html += '	</div>';
		html += '</div>';		
		return html;
	},
	
	"show_all_files" : function(user_obj){
		gBody.all_files_selected_member = "";
		
		var html =
			'<div id="all_files_layer" class="inner mu_container" style="top:50%;left:50%;transform: translate(-50%, -50%);">' + 
			'	<div id="work-chat" class="mu_work">' + 
			'		<div class="dsw_pjt_inner pjt_h_flex">' + 
			'			<div class="work-tab">' + 
			'				<div class="pop_btn_close"></div>' + 
			'				<ul class="flex">' + 
			'					 <!-- 활성화 on 클래스 추가 -->' + 
			'					<li class="on" id="workroom_files"><span>' + gap.lang.channel_files + '</span></li>' + 
			'					<li id="chatroom_files"><span>' + gap.lang.chatroom_files + '</span></li>' + 
			'					<li id="all_files"><span>Files</span></li>' + 
			'				</ul>' + 
			'			</div>' + 
			'		</div>' + 
			'		<div class="chat-wide">' + 
			'			<div class="file-btn-wrap f_between">' + 
			'				<ul class="flex">' + 
			'					<li id="select_all_files">' + gap.lang.selectall + '</li>' + 
			'					<li id="deselect_all_files">' + gap.lang.deselection + '</li>' + 
			'				</ul>' + 
			'				<div class="drop-s search-bx">' + 
			'					<div class="bx f_between search-field">' + 
			'						<span class="ico ico-search"></span>' + 
			'						<input type="text" name="" id="input_files_search" class="input" placeholder="' + gap.lang.input_search_query + '">' + 
			'						<div class="btn-search-close" style="display:none;top:12px;right:100px;"></div>' +'' +
			'						<button class="type_icon" id="file_transfer" style="background:none;">' + gap.lang.file_transfer + '</button>' + 
			'					</div>' + 
			'				</div>' + 
			'			</div>' + 
			'			<div class="chat-body wokr-file">' + 
			'				<div class="tab_cont_wr">' + 
			'					<table class="table_type_a">' + 
			'						<colgroup>' + 
			'							<col style="width: 8%;">' + 
			'							<col style="width: 62%;">' + 
			'							<col style="width: 15%;">' + 
			'							<col style="width: 15%;">' + 
			'						</colgroup>' + 
			'						<tbody id="file_list">' + 
			'						</tbody>' + 
			'					</table>' + 
			'				</div>' + 
			'				<div class="pagination_wr" id="paging_area">' + 
			'				</div>' + 
			'			</div>' +             
			'		</div>' +        
			'	</div>' + 
			'</div>';
				
		gap.showBlock();
		$(html).appendTo('body');
	//	$("#common_work_layer").show();
	//	$("#common_work_layer").html(html);
		var $layer = $('#all_files_layer');
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
		$layer.wrap('<div id="common_work_layer" class="drop-pop-mu" style="top:-50%;"></div>')
		
		gBody.all_files_selected_tab = "workroom_files";
		gBody.all_files_selected_member = user_obj;
		
		// 기본 호출 목록
		gBody.get_channel_all_files(1);
		
		// 이벤트 처리
		gBody.event_all_files($layer);
	},
	
	"event_all_files" : function($layer){
		// 닫기
		$layer.find('.pop_btn_close').off().on('click', function(){
			gap.remove_layer('all_files_layer');
		//	gap.remove_layer('common_work_layer');
		});
		
		// 탭 선택
		$layer.find('.work-tab li').off().on('click', function(){
			if ($(this).hasClass('on')) return;
			$('.work-tab li').removeClass('on');
			$(this).addClass('on');
			
			// 선택된 탭
			gBody.all_files_selected_tab = $(this).attr('id');
			if (gBody.all_files_selected_tab == "workroom_files"){
				gBody.get_channel_all_files(1);
				
			}else if (gBody.all_files_selected_tab == "chatroom_files"){
				gBody.get_chat_all_files(1);
				
			}else if (gBody.all_files_selected_tab == "all_files"){
				gBody.get_all_files(1);
			}
		});
		
		// 전체 선택
		$layer.find('#select_all_files').off().on('click', function(){
			$("input[name=file_checkbox]").each(function() {
				$(this).prop("checked", true);
			});
		});
		
		// 선택 해제
		$layer.find('#deselect_all_files').off().on('click', function(){
			$("input[name=file_checkbox]").each(function() {
				$(this).prop("checked", false);
			});
		});
		
		// 파일 전송
		$layer.find('#file_transfer').off().on('click', function(){	
			
			$("input[name=file_checkbox]:checked").each(function() {
				
				var file_check = [];
				var file_size = [];
				var file_md5 = [];
				var file_name = [];
				var file_path = [];
				
				var file_check2 = [];
				var file_size2 = [];
				var file_md52 = [];
				var file_name2 = [];
				var file_path2 = [];	
				
				
				file_check.push($(this).val());
				file_size.push($(this).data('fsize'));
				file_name.push($(this).data('fname'));
				if (gBody.all_files_selected_tab != "chatroom_files"){
					file_md5.push($(this).data('md5'));
				}
				
				file_check2 = $(this).data('fdownload2');
				file_size2 = $(this).data('fsize2');
				file_md52 = $(this).data('fmd52');
				file_name2 = $(this).data('fname2');
				file_path2 = $(this).data('fpath2');	
				
				
				if (file_check.length == 0){
					mobiscroll.toast({message:gap.lang.select_file, color:'danger'});
					return false;
				}
					
				var ty = "";
				if (gBody.all_files_selected_tab == "workroom_files"){
					ty = "1";
					
				}else if (gBody.all_files_selected_tab == "chatroom_files"){
					ty = "2";
					
				}else if (gBody.all_files_selected_tab == "all_files"){
					ty = "3";
				}
				
				if (ty == "2"){	
					if (file_check.length > 1){
						gBody.send_files_chat("6", file_check2, file_md52, file_size2, file_name2, gBody.all_files_selected_member, file_path2);
					}else{
						gBody.send_files_chat("6", file_check[0], file_md5[0], file_size[0], file_name[0], gBody.all_files_selected_member, file_path[0]);
					}				
				}else{
					gBody.send_files(ty, file_check, file_md5, file_size, file_name, gBody.all_files_selected_member);
				}	
				
			});		
		});
		
		// 검색어 입력 후 엔터
		$layer.find('#input_files_search').keypress(function(e){
			if (e.keyCode == 13){
				var qry = $.trim($(this).val());
				qry.replace(/\[\]\*/g, '');
				$(this).val(qry);

				if (qry.length < 2) {
					mobiscroll.toast({message:gap.lang.valid_search_keyword, color:'danger'});
					return false;
				}
				gap.query_str = $(this).val();
				
				if (gBody.all_files_selected_tab == "workroom_files"){
					gBody.get_channel_all_files(1);
					
				}else if (gBody.all_files_selected_tab == "chatroom_files"){
					gBody.get_chat_all_files(1);
					
				}else if (gBody.all_files_selected_tab == "all_files"){
					gBody.get_all_files(1);
				}
			}
		});
		
		// 검색 초기화
		$layer.find(".btn-search-close").on("click", function(){
			gap.query_str = "";
			$layer.find("#input_files_search").val("");
			$layer.find(".btn-search-close").hide();
			
			if (gBody.all_files_selected_tab == "workroom_files"){
				gBody.get_channel_all_files(1);
				
			}else if (gBody.all_files_selected_tab == "chatroom_files"){
				gBody.get_chat_all_files(1);
				
			}else if (gBody.all_files_selected_tab == "all_files"){
				gBody.get_all_files(1);
			}
		});
	},
	
	"get_channel_all_files" : function(page_no){
		
		gBody.get_channel_info_list();
		
		if (page_no == 1){
			gap.start_page = "1";
			gap.cur_page = "1";
			gap.total_data_count = 0;
		}
		
		gap.start_skp = (parseInt(gap.per_page) * (parseInt(page_no))) - (parseInt(gap.per_page) - 1);
		var surl = gap.channelserver + "/channel_list.km";
		
		var postData = {
			"channel_code" : gBody.select_channel_code,
			"query_type" : "allcontent",
			"start" : (gap.start_skp - 1).toString(),
			"perpage" : gap.per_page,
			"q_str" : gap.query_str,
			"dtype" : "",
			"type" : "2"
		};
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text", //"json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(__res){
				var res = JSON.parse(__res);
				if (res.result == "OK"){
					var $layer = $('#all_files_layer');
					var list = res.data.data;
					
					if (gap.query_str != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find('#file_list').empty();
					
					for (var i = 0; i < list.length; i++){
						var info = list[i];
						var owner_info = gap.user_check(info.owner);
						var file_info = info.info;
												
						var ty = "2";
						if (info.id.split("_").length > 1){
							ty = "reply";
						}
						var downloadpath = gap.search_file_convert_server(info.fserver) + "/FDownload.do?id=" + info.id + "&md5=" + file_info.md5 + "&ty="+ty+"&ky="+gap.userinfo.rinfo.ky;
						
						var html = 
							'<tr class="type_file">' +
							'	<td class="mu_chk_box">' +
							'		<!-- input id값 변경 가능, label for과 동일한 id값 사용필요 -->' +
							'		<span class="chk_box">' +
							'			<input type="checkbox" name="file_checkbox" id="' + info._id.$oid + '" value="' + downloadpath + '">' +
							'			<label for="' + info._id.$oid + '"></label>' +
							'		</span>' +
							'	</td>' +
							'	<td><span class="ico ico-ex-min ico-' + gap.file_icon_check_mu(file_info.filename) + '"></span>' + file_info.filename + '&nbsp;<b class="size">(' + gap.file_size_setting(file_info.file_size.$numberLong) + ')</b></td>' +
							'	<td>' + owner_info.name + '</td>' +
							'	<td class="c08">' + gap.convertGMTLocalDateTime(info.GMT) + '</td>' +
							'</tr>';
						
						$layer.find('#file_list').append(html);
						
						$layer.find('#' + info._id.$oid).data('fsize', file_info.file_size.$numberLong);
						$layer.find('#' + info._id.$oid).data('fname', file_info.filename);
						$layer.find('#' + info._id.$oid).data('md5', file_info.md5.split(".")[0]);
					}

					//페이징
					gap.total_data_count = res.data.totalcount;
					gap.total_page_count = gBody._getPageCount(gap.total_data_count, gap.per_page);
					gBody._initializePage();

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
	
	
	"get_channel_info_list" : function(){	
		var url = gap.channelserver + "/channel_info_list.km";
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
				
				gap.cur_channel_list_info = res;
				
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
				gBody.select_channel_code = list;
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"get_chat_all_files" : function(page_no){
		if (page_no == 1){
			gap.start_page = "1";
			gap.cur_page = "1";
			gap.total_data_count = 0;
		}
		
		gap.start_skp = (parseInt(gap.per_page) * (parseInt(page_no))) - (parseInt(gap.per_page) - 1);
		_wsocket.chat_room_all_files("", [5, 6], [], gap.query_str, parseInt(gap.per_page), (gap.start_skp - 1));
	},
	
	"draw_chat_all_files" : function(obj){
		
		var $layer = $('#all_files_layer');
		
		if (obj.skp == 0){
			gap.total_data_count = obj.cnt;
		}
		
		if (gap.query_str != ""){
			$layer.find(".btn-search-close").show();	
		}
		$layer.find('#file_list').empty();
		
		for (var i = 0; i < obj.rt.length; i++){
			var file_info = obj.rt[i];
			var fserver = gap.search_fileserver(file_info.nid);
			var downloadpath = fserver + "/filedown" +  file_info.sf + "/" + file_info.sn + "/" + encodeURIComponent(file_info.nm);
			
			var isgp = file_info.isgp;
			
			var html = "";
			
			var fname = [];
			var fsize = [];
			var fpath = [];
			var fdownload = [];
			var fmd5 = [];
			
			if (isgp){
				//묶음으로 보낸 경우 별도로 처리한다.				
				for (var u = 0 ; u < file_info.grp.length; u++){
					var item = file_info.grp[u];
					fname.push(item.nm);
					fsize.push(item.sz);
					var pp = fserver + "/filedown" +  item.sf + "/" + item.sn + "/" + encodeURIComponent(item.nm);
					fdownload.push(pp);
					fpath.push(item.sf);					
				}
			
				html += "<tr class='type_file'>";
				html += "	<td class='mu_chk_box'>";
				html += " 		<span class='chk_box'>";
				html += "			<input type='checkbox' name='file_checkbox' id='chat_file_" + file_info.sq + "' value='" + downloadpath + "'>";
				html += "     		<label for='chat_file_" + file_info.sq + "'></label>";
				html += "		</span>";
				html += "	</td>";
				html += "	<td>";
				html += "		<span style='margin-left:8px;margin-right:18px'><img src='common/img/multi_image.png' style='width:20px;height:20px'></span>";
				html += "		" + file_info.grp[0].nm;
				html += "		&nbsp;<b class='size'>(" + gap.file_size_setting(file_info.sz) + ")</b></td>";
				html += "	</td><td>";
				html += "	<td class='c08'>" + gap.convertGMTLocalDateTime(file_info.dt) + "</td>";
				html += "</tr>";
			}else{
				html += '<tr class="type_file">' +
				'	<td class="mu_chk_box">' +
				'		<!-- input id값 변경 가능, label for과 동일한 id값 사용필요 -->' +
				'		<span class="chk_box">' +
				'			<input type="checkbox" name="file_checkbox" id="chat_file_' + file_info.sq + '" value="' + downloadpath + '">' +
				'			<label for="chat_file_' + file_info.sq + '"></label>' +
				'		</span>' +
				'	</td>' +
				'	<td>' +
				'		<span class="ico ico-ex-min ico-' + gap.file_icon_check_mu(file_info.nm) + '"></span>' + 
				file_info.nm + 
				'&nbsp;<b class="size">(' + gap.file_size_setting(file_info.sz) + ')</b></td>' +
				'	<td></td>' +
				'	<td class="c08">' + gap.convertGMTLocalDateTime(file_info.dt) + '</td>' +
				'</tr>';
			}
			
			
			$layer.find('#file_list').append(html);
			
			$layer.find('#chat_file_' + file_info.sq).data('fsize', file_info.sz);
			$layer.find('#chat_file_' + file_info.sq).data('fname', file_info.nm);
			
			$layer.find('#chat_file_' + file_info.sq).data('fname2', fname);
			$layer.find('#chat_file_' + file_info.sq).data('fsize2', fsize);
			$layer.find('#chat_file_' + file_info.sq).data('fpath2', fpath);
			$layer.find('#chat_file_' + file_info.sq).data('fdownload2', fdownload);
			$layer.find('#chat_file_' + file_info.sq).data('fmd52', fmd5);

		}
		
		//페이징
		gap.total_page_count = gBody._getPageCount(gap.total_data_count, gap.per_page);
		gBody._initializePage();
	},
	
	"get_all_files" : function(page_no){
		if (page_no == 1){
			gap.start_page = "1";
			gap.cur_page = "1";
			gap.total_data_count = 0;
		}
		
		gap.start_skp = (parseInt(gap.per_page) * (parseInt(page_no))) - (parseInt(gap.per_page) - 1);
		var surl = gap.channelserver + "/api/files/folder_list_main.km";
		
		var postData = {
			"start" : (gap.start_skp - 1).toString(),
			"perpage" : gap.per_page,
			"q_str" : gap.query_str,
			"dtype" : "",
			"type" : "1"
		};		
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text", //"json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(__res){
				var res = JSON.parse(__res);
				if (res.result == "OK"){
					var $layer = $('#all_files_layer');
					var list = res.data.filelist;
					
					if (gap.query_str != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find('#file_list').empty();
					
					for (var i = 0; i < list.length; i++){
						var file_info = list[i];
						var owner_info = gap.user_check(file_info.owner);
						var downloadpath = gap.search_file_convert_server(file_info.fserver) + "/FDownload.do?id=" + file_info._id.$oid + "&ty=1&ky="+gap.userinfo.rinfo.ky;
						
						var html = 
							'<tr class="type_file">' +
							'	<td class="mu_chk_box">' +
							'		<!-- input id값 변경 가능, label for과 동일한 id값 사용필요 -->' +
							'		<span class="chk_box">' +
							'			<input type="checkbox" name="file_checkbox" id="' + file_info._id.$oid + '" value="' + downloadpath + '">' +
							'			<label for="' + file_info._id.$oid + '"></label>' +
							'		</span>' +
							'	</td>' +
							'	<td><span class="ico ico-ex-min ico-' + gap.file_icon_check_mu(file_info.filename) + '"></span>' + file_info.filename + '&nbsp;<b class="size">(' + gap.file_size_setting(file_info.file_size.$numberLong) + ')</b></td>' +
							'	<td>' + owner_info.name + '</td>' +
							'	<td class="c08">' + gap.convertGMTLocalDateTime(typeof(file_info.lastupdate) != "undefined" ? file_info.lastupdate : file_info.GMT) + '</td>' +
							'</tr>';
						
						$layer.find('#file_list').append(html);
						
						$layer.find('#' + file_info._id.$oid).data('fsize', file_info.file_size.$numberLong);
						$layer.find('#' + file_info._id.$oid).data('fname', file_info.filename);
						$layer.find('#' + file_info._id.$oid).data('md5', file_info.md5.split(".")[0]);
					}

					//페이징
					gap.total_data_count = res.data.totalcount;
					gap.total_page_count = gBody._getPageCount(gap.total_data_count, gap.per_page);
					gBody._initializePage();

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
	
	"_getPageCount" : function(doc_count, rows){
		return ret_page_count = Math.floor(gap.total_data_count / rows) + (((gap.total_data_count % rows) > 0) ? 1 : 0);
	},
	
	"_initializePage" : function(){
		var alldocuments = gap.total_data_count;
		if (alldocuments % gap.per_page > 0 & alldocuments % gap.per_page < gap.per_page/2 ){
			gap.all_page = Number(Math.round(alldocuments/gap.per_page)) + 1
		}else{
			gap.all_page = Number(Math.round(alldocuments/gap.per_page))
		}	

		if (gap.start_page % gap.per_page > 0 & gap.start_page % gap.per_page < gap.per_page/2 ){
			gap.cur_page = Number(Math.round(gap.start_page/gap.per_page)) + 1
		}else{
			gap.cur_page = Number(Math.round(gap.start_page/gap.per_page))
		}

		gBody._initializeNavigator();		
	},
	
	"_initializeNavigator" : function(){
		var $layer = $('#all_files_layer');
		var alldocuments = gap.total_data_count;

		if (gap.total_page_count == 0){
			gap.total_page_count = 1;
		}

		if (alldocuments == 0){
			alldocuments = 1;
			gap.total_page_count = 1;
			gap.cur_page = 1;
		}

		if (alldocuments != 0) {
			if (gap.total_page_count % 10 > 0 & gap.total_page_count % 10 < 5 ){
				var all_frame = Number(Math.round(gap.total_page_count / 10)) + 1
			}else{
				var all_frame = Number(Math.round(gap.total_page_count / 10))	
			}

			if (gap.cur_page % 10 > 0 & gap.cur_page % 10 < 5 ){
				var c_frame = Number(Math.round(gap.cur_page / 10)) + 1
			}else{
				var c_frame = Number(Math.round(gap.cur_page / 10))
			}

			var nav = new Array();
			if (c_frame == 1){
				nav[0] = '<ul class="pagination inb">';
			}else{
				nav[0] = '<div class="arrow prev" onclick="gBody._gotoPage(' + ((((c_frame-1) * 10) - 1)*gap.per_page + 1) + ',' + ((c_frame - 1) * 10) + ');"></div><ul class="pagination inb">';
			}			
			
			var pIndex = 1;
			var start_page = ((c_frame-1) * 10) + 1;

			for (var i = start_page; i < start_page + 10; i++){
				if (i == gap.cur_page){
					if (i == '1'){
						nav[pIndex] = '<li class="on">' + i + '</li>';
					}else{
						if (i % 10 == '1'){
							nav[pIndex] = '<li class="on">' + i + '</li>';
						}else{
							nav[pIndex] = '<li class="on">' + i + '</li>';
						}
					}
				}else{
					if (i == '1'){
						nav[pIndex] = '<li onclick="gBody._gotoPage(' + (((i-1) * gap.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
					}else{
						if (i % 10 == '1' ){
							nav[pIndex] = '<li onclick="gBody._gotoPage(' + (((i-1) * gap.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}else{
							nav[pIndex] = '<li onclick="gBody._gotoPage(' + (((i-1) * gap.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}
					}
				}				

				if (i == gap.total_page_count) {
					break;
				}
				pIndex++;				
			}

			if (c_frame < all_frame){
				nav[nav.length] = '</ul><div class="arrow next" onclick="gBody._gotoPage(' + ((c_frame * gap.per_page * 10) + 1) + ',' + ((c_frame * 10) + 1) + ');"></div>';
				
			}else{
				nav[nav.length] = '</ul>';
			}
			
		
			var nav_html = '';

			if (c_frame != 1 ){
			//	nav_html = '<li class="p-first" onclick="gBody._gotoPage(1,1);"><span>처음</span></li>';
			}		    
			for( var i = 0 ; i < nav.length ; i++){	
				nav_html += nav[i];
			}
					

			if (c_frame < all_frame){
			//	nav_html += '<li class="p-last" onclick="gBody._gotoPage(' + ((gBody.all_page - 1) * gap.per_page + 1) + ',' + gBody.all_page + ')"><span>마지막</span></li>';
			}

			$layer.find("#paging_area").html(nav_html);
		}		
	},
	
	"_gotoPage" : function(idx, page_num){
		if (gap.total_data_count < idx) {
			gap.start_page = idx - 10;
			if ( gap.start_page < 1 ) {
				return;
			}
		}else{
			gap.start_page = idx;
		}
		cur_page = page_num;
		
		if (gBody.all_files_selected_tab == "workroom_files"){
			gBody.get_channel_all_files(cur_page);
			
		}else if (gBody.all_files_selected_tab == "chatroom_files"){
			gBody.get_chat_all_files(cur_page);
			
		}else if (gBody.all_files_selected_tab == "all_files"){
			gBody.get_all_files(cur_page);			
		}
	},
	
	"replyChatBottom" : function(obj, type){
		var _self = this;
		
		/*
		 * obj.imgurl : 이미지 URL
		 * obj.title : 김윤기님에게 답장
		 * obj.msg : 메세지 내용
		 * 
		 * type : alarm에서 호출했는지 여부
		 */
		
		if (type == 'alarm') {
			var $chat_box = $('#alarm_chat .bot');
		} else {
			var $chat_box = $('#chat_content .chat-bottom');
		}
		
		// DOM 삭제
		$chat_box.find('.reply-chat-wrap').remove();
				
		var html =
			'<div class="reply-chat-wrap">' +
			'	<div class="reply-chat-inner">' +
			'		<div class="cont-wrap">' +
			'			<div class="tit">' + obj.title + '</div>' +
			'			<div class="cont">' + obj.dis_msg + '</div>' +
			'		</div>' +
			'		<div class="btn-wrap">' +
			'			<div class="btn-close">' +
			'				<span></span>' +
			'				<span></span>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'</div>';		
		var $wrap = $(html);
		$chat_box.append($wrap);

		// 이미지url이 있는 경우 이미지 표시
		if (obj.imgurl) {
			var $img = $('<div class="img-wrap"></div>');
			$img.css('background-image', 'url(' + obj.imgurl + ')');
			$wrap.find('.reply-chat-inner').prepend($img);
		}


		$chat_box.addClass('show-reply');
		
		/*
		 * 이벤트 처리
		 */
		$chat_box.find('textarea').focus();
		$chat_box.find('textarea').attr('placeholder', gap.lang.replymsg);
		
		// 답장 취소
		$wrap.find('.btn-close').on('click', function(){
			_self.replyChatBottomHide(type);
		});
	},
	
	"replyChatBottomHide" : function(type){
		
		if (type == 'alarm') {
			var $chat_box = $('#alarm_chat .bot');
		} else {
			var $chat_box = $('#chat_content .chat-bottom');
		}
		
		$chat_box.removeClass('show-reply');
		
		$chat_box.find('.reply-chat-wrap').remove();
		$chat_box.find('textarea').attr('placeholder', gap.lang.input_message);
	},
	
	"message_check" : function(msg){
		var message = msg;
		if (typeof(msg) != "undefined"){
			message = gap.aLink(msg);   //http자동 링크 걸기	
			if (message.indexOf("<a href=") > -1){
				message = message.replace(/[\n]/gi, "<br>");
			}else{
				message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');		
				message = message.replace(/[\n]/gi, "<br>");
				message = message.replace(/\s/gi, "&nbsp;");
			}
		}else{
			message = "";
		}	
		return message;
	},
	
	"dispNoticeFile" : function($el){
		var info = $el.data('info');
		var finfos = info.data.info;
		
		if (!finfos) return;
		if (finfos.length == 0) return;
		
		var $file_list = $el.find('.notice-filelist');
		if ($file_list.length == 0) {
			$file_list = $('<div class="notice-filelist"></div>');
			$el.find('.notice-writer').before($file_list);
		}
		
		$.each(finfos, function(){
			var finfo = this;
			var file_ext = finfo.filename.substr(finfo.filename.lastIndexOf('.') + 1);
			var upload_path = info.data.upload_path;
			var upload_ky = info.owner.ky;
			var upload_file = finfo.md5 + '.' + file_ext;
			
			var fname = gap.textToHtml(finfo.filename);
			var icon_kind = gap.file_icon_check(fname);
		//	var file_url = upload_ky + '/' + upload_path + '/' + upload_file;
			var file_url = upload_ky + upload_path + '/' + upload_file;		// upload_path 앞에 슬래시가 있어서 기존 '/' 제거 - 2025.08.22
			
			var html = 
				'<li class="notice-file-wr" title="' + finfo.filename + '">' +
				'	<div class="ico ico-file ' + icon_kind + '"></div>' +
				'	<div class="filename-wr">' +
				'		<span class="notice-filename">' + finfo.filename + '</span>' +
				'		<span class="notice-filesize">' + gap.file_size_setting(finfo.file_size['$numberLong']) + '</span>' +
				'	</div>' +
				'	<button type="button" class="btn-notice-filedown" title="Download"></button>' +
				'</li>';
			
			var $file_el = $(html);
			$file_el.data('url', file_url);
			$file_el.data('filename', fname);
			$file_el.data('fileinfo', finfo);
			$file_list.append($file_el);
		});
			
		$el.find('.notice-writer').before($file_list);
	},	
	
	"drawNoticeChat" : function(is_quick){
		var _self = this;
		var cur_cid = is_quick ? gma.cur_cid_popup : gBody.cur_cid;
		$.ajax({
			type : "POST",
			url : gap.channelserver + "/read_notice.km",
			dataType : "json",
			data : JSON.stringify({key:cur_cid}),
			success : function(res){
				// 공지가 없을 경우 예외처리
				if (!res.data) {
					if (is_quick){
						_self.hideNoticeQuickChat();
					} else {
						_self.hideNoticeChat();						
					}
					return;
				}
				
				var el_id = is_quick ? 'alarm_notice' : 'notice_top_chat';
				var $el = $('#' + el_id);
				if (is_quick) {
					res.data.response.callfrom = 'quick_chat';
				} else {
					res.data.response.callfrom = 'chat';
				}
				$el.data('info', res.data.response);

				
				var data = res.data.response.data;
				var title = _self.getNoticeTitle(data);
				
				// 공지 타입에 맞게 표시
				$el.removeClass().addClass('notice-top');
				$el.find('.notice-filelist').remove();
				$el.find('.notice-img').remove();
				
				if (data.editor) {
					// 에디터 타입인 경우
					if (data.info && data.info.length > 0) {
						_self.dispNoticeFile($el);
					}
					
				} else if (data.info && data.info.length > 0) {
					if (data.ty == 5) {
						
						_self.dispNoticeFile($el);
						$el.addClass('type-file');
						
					} else if (data.ty == 6) {
						var finfo = data.info[0];
						var file_ext = finfo.filename.substr(finfo.filename.lastIndexOf('.') + 1);
						var upload_path = res.data.response.data.upload_path;
						var upload_ky = res.data.response.owner.ky;
						var upload_file = finfo.md5 + '.' + file_ext;
						var fname = gap.textToHtml(finfo.filename);						
						
						
						var thumb_path = upload_ky + '/' + upload_path + '/thumbnail/' + upload_file;
						var img_path = upload_ky + '/' + upload_path + '/' + upload_file;
											
						
						var thumb_url = gap.channelserver + 'FDownload_noticefile.do?path=' + thumb_path + '&fn=' + encodeURIComponent(fname);
						var img_url = gap.channelserver + 'FDownload_noticefile.do?path=' + img_path + '&fn=' + encodeURIComponent(fname);

						
						var $img = $('<img class="notice-img">');
						
						$img.attr('src', thumb_url);
						$img.data('url', img_url);
						$img.data('filename', fname);
						
						$el.addClass('type-img');
						$el.find('.notice-writer').before($img);					
					}
				}
				
				
				// 제목 & 본문
				$el.find('.notice-head').html(title);
				
				// 작성자 정보
				var owner = gap.user_check(res.data.response.owner);
				var writer = owner.disp_user_info + " | ";
				var notice_date = res.data.response.GMT;
				var html = '<span class="userinfo">' + owner.disp_user_info + '</span>';
				html += '<span class="dt">' + gap.convertGMTLocalDateTime(notice_date) + '</span>';
				$el.find('.notice-writer').html(html);
				
				$el.find('.btn-notice-detail').text(gap.lang.view_detail);
				$el.find('.btn-notice-modify').text(gap.lang.basic_modify);
				$el.find('.btn-notice-remove').text(gap.lang.basic_delete);
				
				// 수정, 삭제 버튼 표시
				if (gap.userinfo.rinfo.ky == owner.ky) {
					$el.find('.btn-notice-modify').show();
					$el.find('.btn-notice-remove').show();
				} else {
					$el.find('.btn-notice-modify').hide();
					$el.find('.btn-notice-remove').hide();
				}
				
				
				// 이벤트 처리
				_self.eventNotice($el, is_quick ? 'quick_chat' : 'chat');
				
				// 공지 표시
				var p_id = is_quick ? 'alarm_chat' : 'chat_content';
				$('#' + p_id).addClass('show-notice');
				
				// 댓글 개수 표시
				if (res.data.response.reply && res.data.response.reply.length > 0) {
					$el.find('.reply-cnt').text(res.data.response.reply.length);
				} else {
					$el.find('.reply-cnt').text(0);
				}
				
				if (!is_quick) gBody.chatroom_dis_height();
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"hideNoticeChat" : function(){
		$('#chat_content').removeClass('show-notice');
		$('#notice_top_chat').removeClass('expand');
		gBody.chatroom_dis_height();
	},
	
	"hideNoticeQuickChat" : function(){
		$('#alarm_chat').removeClass('show-notice');
	},
	
	"hideNoticeWork" : function(){
		$('#sub_channel_content').removeClass('show-notice');
		$('#notice_top_work').removeClass('expand');
		this.workRefreshHeight();
	},
	
	"getNoticeTitle" : function(data){
		var title = '';
		
		if (data.ex) {
			
			// 업무방 컨텐츠인지 먼저 확인한다
			title = '<span class="notice-work-title">' + data.ex.title + '</span>';
			
			if (data.ex.type == 'vote') {
				var _vote = data.ex;
				var _info = {
						"key" : _vote.key,
						"title" : _vote.title,
						"comment" : _vote.comment,
						"endtime" : _vote.end_date + ' ' + _vote.end_time,
						"anonymous" : _vote.anonymous_vote,
						"multi" : _vote.multi_choice,
						"owner" : data.ky
				};
				
				title += '<button type="button" class="btn-notice-vote" data-vote=\'' + JSON.stringify(JSON.stringify(_info)) + '\'>' + gap.lang.vote + '</button>';
			} else if (data.ex.type == 'aprv') {
				title += '<button type="button" class="btn-notice-newwin" data-url="' + data.ex.link + '">' + gap.lang.openNewWin + '</button>';
			} else if (data.ex.type == 'bbs') {
				title += '<button type="button" class="btn-notice-newwin" data-url="' + data.ex.link + '">' + gap.lang.openNewWin + '</button>';
			}
				
		} else if (data.editor) {
			
			// 에디터로 작성된 경우
			if (data.title) {
				title = data.title;
			} else {
				title = gap.lang.mn3;;
			}
			title += '<br>' + gap.textToHtml(data.editor);
			
		} else {
			if (data.ty == 5) {
				// 파일
				title = gap.lang.mn1;
			} else if (data.ty == 6) {
				// 이미지
				title = gap.lang.mn2;
			} else {
				// 그 외
				if (data.content) {
					title = data.content.replace(/\r\n|\n/g, '<br/>');;
				} else if (data.msg){
					title = data.msg.replace(/\r\n|\n/g, '<br/>');;
				} else {
					title = gap.lang.mn3;
				}
			}
		}
		
		return title;
	},
	
	"eventNotice" : function($layer, type){
		var _self = this;
		var data = $layer.data('info').data;
		var ty = data.ty;	// 공지 타입 (6:이미지)

		
		// 파일 미리보기
		$layer.find('.notice-file-wr').off().on('click', function(){
			var info = $layer.data('info');				
			var path = $(this).data('url');
			var fn =  $(this).data('filename');
			var ext = gap.is_file_type_filter(fn);
			
			if (ext == 'movie') {
				//PC에서 재생되는 확장자 인지  확인 한다.
				if (gap.is_file_preview_mobile(fn)){
					gap.gAlert(gap.lang.not_support);
					return false;		
				}
				var download_url = gap.channelserver + 'FDownload_noticefile.do?path=' + path + '&fn=' + encodeURIComponent(fn);
				
				gap.show_video(download_url, fn);	
			} else {
				var f_info = $(this).data('fileinfo');
				var fs = gap.channelserver;
				var md5 = f_info.md5;
				var id = info._id['$oid'];
				var ft = f_info.file_type;
				var ky = data.ky;
				var upload_path = info.data.upload_path;
				
				gBody3.file_convert(fs, fn, md5, id, "notice", ft, ky, upload_path);
				
			}
			
			return false;
		});
		
		
		// 파일 다운로드
		$layer.find('.btn-notice-filedown').off().on('click', function(){
			var $wr = $(this).parent();
			var path = $wr.data('url');
			var fn =  $wr.data('filename');
			var download_url = gap.channelserver + 'FDownload_noticefile.do?path=' + path + '&fn=' + encodeURIComponent(fn);
			
			gap.file_download_normal(download_url, fn);
			return false;
		});

		
		// 이미지 미리보기
		$layer.find('.notice-img').off().on('click', function(){
			//var img_src = gap.fileupload_server_url + '/filedown/' + data.ex.sf + '/' + data.ex.sn + '/' + encodeURIComponent(data.ex.nm);
			var img_src = $(this).data('url');
			var fname = $(this).data('filename');
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;
			gap.show_image(img_src, fname);
			return false;
		});
		
		
		// 투표하기
		$layer.find('.btn-notice-vote').off().on('click', function(){
			var _vote = $(this).data('vote');
			gBody3.response_vote(_vote);
			return false;
		});
		
		// 결재, 게시판
		$layer.find('.btn-notice-newwin').off().on('click', function(){
			var link = $(this).data('url');
			gap.open_subwin(link, "1240","760", "yes" , "", "yes");
			return false;
		});
		
		// 펼쳐보기/접어보기
		$layer.find('.notice-detail-inner').off().on('click', function(){
			$layer.toggleClass('expand');
		});
		
		// 작성자 프로필
		$layer.find('.userinfo').off().on('click', function(){
			var info = $layer.data('info');
			gOrg.showUserDetailLayer(info.owner.ky);
			return false;
		});
		
		// 상세보기
		$layer.find('.btn-notice-detail').off().on('click', function(){
			var info = $layer.data('info');
			gap.noticeOpen(info._id.$oid, type);
			return false;
		});
		
		// 수정
		$layer.find('.btn-notice-modify').off().on('click', function(){
			gap.noticeWrite($layer.data('info'));
			return false;
		});
		
		// 삭제
		$layer.find('.btn-notice-remove').off().on('click', function(){
			var docid = $layer.data('info')._id.$oid;
			_self.removeNotice(docid, type);
			return false;
		});
	},
	
	"drawNoticeWork" : function(){
		var _self = this;
		var cur_cid = gBody3.cur_opt;
		$.ajax({
			type : "POST",
			url : gap.channelserver + "/read_notice.km",
			dataType : "json",
			data : JSON.stringify({key:cur_cid}),
			success : function(res){
				
				// 공지가 없을 경우 예외처리
				if (!res.data) {
					_self.hideNoticeWork();
					return;
				}
				
				var $el = $('#notice_top_work');
				res.data.response.callfrom = 'work';
				$el.data('info', res.data.response);
				
				var data = res.data.response.data;
				var title = _self.getNoticeTitle(data);
				
				// 공지 타입에 맞게 표시
				$el.removeClass().addClass('notice-top');
				$el.find('.notice-filelist').remove();
				$el.find('.notice-img').remove();
				
				
				_self.dispNoticeFile($el);
				
				if (data.editor){
					
				} else if (data.type == 'file') {
					$el.addClass('type-file');
				} else if (data.ex) {
					// vote, aprv, bbs
					$el.addClass('type-' + data.ex.type);
					$el.addClass('special-type');
				}
				
				
				
				////////////// 데이터 확인 후 뿌릴 것 //////////////
				
				// 제목 & 본문
				$el.find('.notice-head').html(title);
				
				// 작성자 정보
				var owner = gap.user_check(res.data.response.owner);
				var writer = owner.disp_user_info + " | ";
				var notice_date = res.data.response.GMT;
				var html = '<span class="userinfo">' + owner.disp_user_info + '</span>';
				html += '<span class="dt">' + gap.convertGMTLocalDateTime(notice_date) + '</span>';
				$el.find('.notice-writer').html(html);

				
				// 디스플레이 초기화
				$el.find('.notice-btn-wr').show();
				$el.find('.btn-notice-detail').show();
				$el.find('.reply-cnt').show();
				
				// 수정, 삭제 버튼 표시
				if (gap.userinfo.rinfo.ky == owner.ky) {
					$el.find('.btn-notice-modify').show();
					$el.find('.btn-notice-remove').show();
				} else {
					$el.find('.btn-notice-modify').hide();
					$el.find('.btn-notice-remove').hide();
					if (data.ex) {
						$el.find('.notice-btn-wr').hide();
					}
				}
				
				// 업무방 투표, 게시판, 결재 등은 상세보기, 수정 버튼 숨김
				if (data.ex) {
					$el.find('.btn-notice-detail').hide();
					$el.find('.btn-notice-modify').hide();
					$el.find('.reply-cnt').hide();
				} 
				
				// 이벤트 처리
				_self.eventNotice($el, 'work');
				
				
				// 공지 표시
				$('#sub_channel_content').addClass('show-notice');
				
				
				// 댓글 개수 표시
				if (res.data.response.reply && res.data.response.reply.length > 0) {
					$el.find('.reply-cnt').text(res.data.response.reply.length);
				} else {
					$el.find('.reply-cnt').text(0);
				}
				
				_self.workRefreshHeight();
			}
		});
	},
	
	"workRefreshHeight" : function(){
		var minus_h = 50;
		
		// 공지 표시 여부
		if ($('#notice_top_work').is(':visible')) {
			minus_h += $('#notice_top_work').outerHeight(true);
		}
		
		var is_write_atuh = gap.checkAuth();
		
		
		if (!is_write_atuh){
			//작성 권한이 없는 경우
			minus_h = minus_h - 50;
			$("#chat_bottom_dis").addClass('hide');
			$("#btn_editor_change").addClass('hide');
		}else{
			$("#chat_bottom_dis").removeClass('hide');
			$("#btn_editor_change").removeClass('hide');
		}
		
		$("#channel_top_list").css("height", "calc(100% - " + minus_h + "px)");

	},
	
	"removeNotice" : function(docid, type){
		var _self = this;
		gap.showConfirm({
			title: gap.lang.basic_delete,
			iconClass: 'remove',
			contents: gap.lang.confirm_delete,
			callback: function(){
				gap.delete_notice(docid, type);
			}
		});
	},
	
	"saveNoticeReply" : function(){
		var _self = this;
		var $layer = $('#notice_ly');
		var info = $layer.data('info');
		var txt = $layer.find('.txt-notice-reply').val();
		var $list = $layer.find('.reply-list');
		
		var postData = {
				"key" : info._id.$oid,
				"owner" : gap.userinfo.rinfo,
				"content" : txt
			};
		
		$.ajax({
			type : "POST",
			url : gap.channelserver + "/save_notice_reply.km",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == 'ERROR') {
					gap.gAlert(gap.lang.mt_err_1);
					return;
				}
			
				var res = res.data;
				
				gHome.noticeAddReply(info._id.$oid, res);
				
				// 스크롤 최상단
				var reply_body = $layer.find('.cont-inner').get(0); 
				reply_body.scroll({left:0, top:reply_body.scrollHeight, behavior:'smooth'});
				
				// 값 비우기
				$layer.find('.txt-notice-reply').val('');
				$layer.find('.btn-notice-reply-reg').removeClass('enable');
				
				var p_id = '';
				if (info.callfrom == 'quick_chat') {
					p_id = 'alarm_chat';
				} else if (info.callfrom == 'chat') {
					p_id = 'notice_top_chat';
				} else {
					p_id = 'notice_top_work';
				}
				
				var reply_cnt = parseInt($('#' + p_id).find('.reply-cnt').text()) + 1;
				$('#' + p_id).find('.reply-cnt').text(reply_cnt);
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"removeNoticeReply" : function(rinfo){
		var _self = this;
		var postData = {
				"key" : rinfo.key,
				"rid" : rinfo.rid
			};
		
		$.ajax({
			type : "POST",
			url : gap.channelserver + "/delete_notice_reply.km",
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == 'ERROR') {
					gap.gAlert(gap.lang.mt_err_1);
					return;
				}
				
				var info = $('#notice_ly').data('info');
				$('#notice_reply_' + rinfo.rid).remove();
				
				// 메인 공지 댓글 수 조정
				var p_id = '';
				if (info.callfrom == 'quick_chat') {
					p_id = 'alarm_chat';
				} else if (info.callfrom == 'chat') {
					p_id = 'notice_top_chat';
				} else {
					p_id = 'notice_top_work';
				}
				
				var reply_cnt = parseInt($('#'+p_id).find('.reply-cnt').text()) - 1;
				if (reply_cnt < 0) reply_cnt = 0;
				$('#'+p_id).find('.reply-cnt').text(reply_cnt);
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	}	
	
}