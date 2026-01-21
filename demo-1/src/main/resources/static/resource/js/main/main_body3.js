/*
 draw_channel_list : 리스트 그리기
 여기까지 읽은 처리 : gBody3.cur_channel_unread_line_draw = true; 로 검색해서 주석 제거하면 됨
 특정 채널방에 들어가는 함수 : gBody2.show_channel_data ==> draw_channel_list

 show_channel ==> gBody2.draw_channel_left ==> channel_main_draw(좌측메뉴) ==> draw_channel_main(우측 영역)
 */

var myDropzone_channel;

function gBodyFN3(){
	this.start = 0;
	this.perpage = 10;
	this.cur_opt = ""; //현재 열려 있는 컨텐트가 무엇인가? "allcontent" : 전체 보기 , "mycontent" : 내가올린 컨텐츠 , "sharecontent" : 공유된 컨텐츠 , "favoritecontent" : 즐겨착기, "channel_code" : 특정 채널
	this.islast = "F";	
	this.popup_status = "";
	this.click_file_info = "";
	this.edit_editor = "F";
	this.select_doc_info = "";
	this.select_channel_id = "";
	this.select_files_tab = false;
	this.delete_file_list = "";
	this.per_page = "10";
	this.all_page = "1";
	this.start_skp = "";
	this.start_page = "1";
	this.cur_page = "1";
	this.start_nav = "1";
	this.total_data_count = "";
	this.show_layer_type = "";
	this.edit_mode = "";
	this.scrollP = "";
	this.channel_plugins = new Array();	
	this.right_window_open = false;
	this.isFold = false;
	this.editor_isFold = false;	
	this.aprv_select_html = "";
	this.aprv_select_db = "";
	this.bbs_select_html = "";
	this.bbs_select_db = "";
	this.bbs_list_info = "";
	this.bbs_select_sub_html = "";	
	this.scroll_bottom = true;	
	this.click_filter_image = "";    //파일 필터링 선택한 형식 
	this.main_sort = "";
	this.select_channel_code = "";
	this.select_channel_code2 = "";
	this.post_view_type = "1";	//(localStorage.getItem('post_view_type') == null ? "2" : localStorage.getItem('post_view_type'));
	this.prevent_auto_scrolling = "1";	//(localStorage.getItem('prevent_auto_scrolling') == null ? "2" : localStorage.getItem('prevent_auto_scrolling'));
	this.collapse_reply = "2";	//(localStorage.getItem('collapse_reply') == null ? "2" : localStorage.getItem('collapse_reply'));
	this.push_receive = "1";
	this.collapse_editor = "2";  //에디터로 작성된 컨텐트 기본 펼치기로 설정	
	this.cur_todo = "";
	this.temp_mentions_msg = "";
	this.temp_mentions_data = "";
	this.click_img_obj = ""; //사용자 이미지 클릭했을 때 서버에서 정보를 받아와서 해당 obj에 툴팁으로 표시하기 위해 등록한다.	
	this.main_start = "";
	this.main_end = "";
	this.main_sort = "2";
	this.main_query = "";
	this.select_main_user_ky = "";
	
	
//	if (gap.isDev){	
//		this.temp_room_key = "636210430bab7864b2f8bb1f"; //특정 업무방을 선택하면 업무지시의 리스트형태로 메인이 표시되게 변경해 달라는 요청으로 설정함 나중에 삭제해야 함 
//	}else{
//		this.temp_room_key = "649e75c02299463948c2e663"; //특정 업무방을 선택하면 업무지시의 리스트형태로 메인이 표시되게 변경해 달라는 요청으로 설정함 나중에 삭제해야 함 
//	}
} 

$(document).ready(function(){
	Dropzone.autoDiscover = false;
});

gBodyFN3.prototype = {
	"init" : function(){			
		gap.cur_window = "channel";		
		gBody3.go_chat_left_draw();				
		gBody3.show_channel();	//init함수 호출 후에 호출해야 한다.		
		gBody3.language_set();	
		gBody3._eventHandler();		
		if (call_key != ""){
			gBody2.show_channel_data(call_key);			
			$("#left_main").hide();
			$("#channel_main").hide();
			$("#left_menu_list").hide();
			$("#left_menu_list").css("width","0px");
			$("#left_main").css("width", "0px");
			$("#left_main").css("left", "0px");		
			$("#main_body").css("left","0px");
			$("#main_body").css("width","100%");
			$("#main_body").show();
			$("#top_header_layer").css("height","0px");
			$("#top_header_layer").hide();
			$("#main_body").css("top","0px");			
		}		
	},
	
	"language_set" : function(){
		$("#tab3_sub").text(gap.lang.channel);
		$("#tab4_sub").text(gap.lang.mail);		
		$("#nav_left_menu .tabs").tabs();
		$("#f_s_btn").text(gap.lang.upload);
		$("#f_c_btn").text(gap.lang.Cancel);		
	},
	
	"_eventHandler" : function(){
		
		$("#create_work_room").on("click", function(e){
			gBody2.create_channel(null, null, 'Y');
			return false;
		});		
		
		//채널 좌측 메뉴의 문서 종류 필터 클릭하는 경우
		$("#channel_filter ul li button").on("click", function(e){
			
			var res = gap.checkEditor();
			if (!res) return false;
			
			//Plugin 실행후 다시 Box UI로 돌아가는 함수 호출
			gBody3.backto_box_layout();
			/////////////////////////////////////////////		
			$("#channel_filter ul li button").removeClass("on");		
			var id = $(this).get(0).className;
			var filter = "";		
			var pre_filter = gBody3.click_filter_image;
			if ( (id.indexOf(pre_filter) > -1) && (pre_filter != "")){
			//	alert("기존에 클릭한 거 클릭");
				gBody3.click_filter_image = "";				
				if (gBody3.cur_opt != ""){					
					$("#channel_list .date").remove();
					$("#channel_list .xman").remove();
					$("#channel_list #grid_wrap").remove();					
					if (gBody3.select_files_tab){
						gBody2.draw_files(1);
					}else{						
						gBody3.draw_channel_list();
					}					
				}else if (gBody2.select_drive_code != ""){
					gBody2.draw_drive_data(1);
				}				
				$(this).removeClass("on");
			}else{			
				if (id == "ico btn-filter-ppt"){
					//filter = "ppt-spl-pptx";
					gBody3.click_filter_image = "ppt";
				}else if (id == "ico btn-filter-word"){
					//filter = "doc-spl-docs";
					gBody3.click_filter_image = "word";
				}else if (id == "ico btn-filter-excel"){
					//filter = "xls-spl-xlsx";
					gBody3.click_filter_image = "excel";
				}else if (id == "ico btn-filter-pdf"){
					//filter = "pdf";
					gBody3.click_filter_image = "pdf";
				}else if (id == "ico btn-filter-img"){
					//filter = "jpg-spl-jpeg-spl-gif-spl-bmp-spl-png";
					gBody3.click_filter_image = "img";
				}else if (id == "ico btn-filter-video"){
					//filter = "avi-spl-wmv-spl-mp4-spl-mkv-spl-mov";
					gBody3.click_filter_image = "video";
				}				
				$(this).addClass("on");								
				if (gBody3.cur_opt != ""){
					gBody3.islast = "F";
					gBody3.start = 0;									
					$("#channel_list .date").remove();
					$("#channel_list .xman").remove();
					$("#channel_list #grid_wrap").remove();					
					if (gBody3.select_files_tab){
						gBody2.draw_files(1);
					}else{						
						gBody3.draw_channel_list();
					}
				}else if (gBody3.cur_opt == ""){
					gBody3.cur_opt = "allcontent";					
					gBody3.islast = "F";
					gBody3.start = 0;									
					$("#channel_list .date").remove();
					$("#channel_list .xman").remove();
					$("#channel_list #grid_wrap").remove();					
					if (gBody3.select_files_tab){
						gBody2.draw_files(1);
					}else{						
						gBody3.draw_channel_list();
					}					
				}else if (gBody2.select_drive_code != ""){
					gBody2.draw_drive_data(1);
				}
			}
		});	
		
		
		$("#nav_left_menu .tabs .tab").off();
		$("#nav_left_menu .tabs .tab").on("click", function(event){			
			var res = gap.checkEditor();
			
			if (!res) return false;	
			//레이어 숨김 처리
			$('#ext_body').hide();
			$('#channel_aside_right').hide();	

			if (this.id == "tab1"){	
				
			}else if (this.id == "tab2"){			
						
			}else if (this.id == "tab3"){				
				//로그 남기기
				gap.write_log_box("channel_tab","업무방 탭 클릭", "menu", "pc");				
				gap.cur_window = "channel";
				gBody3.cur_opt = "";
				gBody3.cur_cid = "";				
		//		gBody.chat_right_menu_close();
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
				gBody3.cur_tab = "tab3";
				gBody3.left_height_control();				
				gBody3.show_channel();
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
				$("#left_mail").css("height", "calc(100% - 75px)");
				$("#left_mail_list").css("height", "calc(100% - 50px)");				
				gBody3.cur_tab = "tab4";
				gBody3.left_height_control();
			}			
		
			if (this.id != "tab4"){
				//열려 있는 채팅 정보를 초기화 한다.
			//	gBody.cur_cid = "";
			}			
			//gma.refreshPos();
		});
	},
	
	"left_height_control" : function(){
		//즐겨찾기 여부에 따라 좌측 프레임 높이를 조절해 준다.
		//return false;
		if (typeof(gap.favorite_list) != "undefined"){
			if (gap.favorite_list.length == 0){
				//즐겨찾기가 없는 경우 높이를 높혀준다.
			//	$(".wrap-nav").css("height", "calc(100% - 94px");		
				if (gBody3.cur_tab == "tab2"){
					$(".wrap-nav").css("height", "calc(100% - 5px");
				}else if (gBody3.cur_tab == "tab4"){
					$(".wrap-nav").css("height", "calc(100% - 5px");
				}else if (gBody3.cur_tab == "tab1"){
					$(".wrap-nav").css("height", "calc(100% - 60px");
					
				}
				
			}else{
				if (gBody3.cur_tab == "tab1"){
					$(".wrap-nav").css("height", "calc(100% - 150px");
				}else if (gBody3.cur_tab == "tab2"){
					$(".wrap-nav").css("height", "calc(100% - 100px");
				}
				
			}
		}else{
			//즐겨찾기가 없는 경우 높이를 높혀준다.
			$(".wrap-nav").css("height", "calc(100% - 94px");
		}		
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
		
		html += "							<li class='tab' id='tab3' style='width:48%'><a href='#' id='tab3_sub' style='font-size:16.5px'><p></p></a></li>";
	//	html += "							<li class='tab' id='tab2'><a href='#' id='tab2_sub' style='font-size:16.5px'><p></p></a></li>";
		html += "							<li class='tab' id='tab4'  style='width:48%'><a href='#' id='tab4_sub' style='font-size:16.5px'><p></p></a></li>";
	//	html += "							<li class='tab' id='tab1'><a href='#' id='tab1_sub' style='font-size:16.5px'><p></p></a></li>";

		
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
		
		html += "				<div class='nav-list room' id='left_buddylist' style='display:none; '>";
		html += "					<div class='add-group' id='add_group1' style='display:none; margin-top:5px'>";
		html += "						<div class='input-field'>";
		html += "							<input type='text' id='group_txt' class='formInput' style='border-radius:unset;border:none;box-shadow:none' placeholder='그룹명을 입력하세요' />";
		html += "							<span class='bar'></span>";
		html += "						</div>";
		html += "					</div>";			
		html += "					<div id ='buddy_list_dis' style='margin-top:10px'></div>";
		html += "				</div>";
		html += "				<div style='display:none' id='left_buddylist_btn'>";		
		html +=	"					<button class='btn-work-add' id='create_chat_room_left_add_group'><span class='ico ico-plus'></span>"+gap.lang.addGroup+"</button>";		
		html += "				</div>";
		
		html += "				<div style='display:none' id='left_roomlist_btn'>";		
		html +=	"					<button class='btn-work-add' id='create_chat_room_left'><span class='ico ico-plus'></span>"+gap.lang.makechatroom+"</button>";		
		html += "				</div>";		
		html += "					<!-- 채널 시작 -->";
		html += "					<div class='nav-channel' style='display:block;' id='channel_left_menu'>";
		html += "						<div class='filter' id='channel_filter'>";
		html += "							<ul>";
		html += "								<li><button class='ico btn-filter-ppt' title='ppt'></button></li>";
		html += "								<li><button class='ico btn-filter-word' title='word'></button></li>";
		html += "								<li><button class='ico btn-filter-excel' title='excel'></button></li>";
		html += "								<li><button class='ico btn-filter-pdf' title='pdf'></button></li>";
		html += "								<li><button class='ico btn-filter-img' title='image'></button></li>";
		html += "								<li><button class='ico btn-filter-video' title='video'></button></li>";
		html += "							</ul>";
		html += "						</div>";
		html += "						<div class='lnb' id='channel_option'>";
		html += "							<ul>";
		html += "								<li class='lnb-all' id='allcontent' style='cursor:pointer'><a href='#'><em></em></a></li>";
		html += "								<li class='lnb-upload' id='mycontent' style='cursor:pointer'><a href='#'><em></em></a></li>";
		html += "								<li class='lnb-share' id='sharecontent' style='cursor:pointer'><a href='#'><em></em></a></li>";
		html += "								<li class='lnb-bookmark' id='favoritecontent' style='cursor:pointer'><a href='#'><em></em></a></li>";
		if (useMention == "T"){
			html += "								<li class='lnb-mention' id='allmention' style='cursor:pointer'><a href='#'><em></em></a></li>";
		}		
		html += "							</ul>";
		html += "						</div>";		
		html += "						<div id='left_channel_list_top' style=' height:calc(100% - 310px); padding: 0 10px'>";
		html += "							<div class='folder-area' id='left_channel_list' style='overflow:hidden; height:calc(100% - 10px); padding-top: 0px !important'>";
		html += "							</div>";
		html += "						</div>";
		html += "					<button class='btn-work-add' id='create_work_room'><span class='ico ico-plus'></span>"+gap.lang.create_channel+"</button>";
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
		
/*
		$("#left_roomlist_btn").off().on("click", function(e){
			gBody3.chat_add_opt = "F";
			gBody2.create_chatroom();
		});	
		$("#left_buddylist_btn").off().on("click", function(e){
			gBody3.create_buddy_group();
		});	
		*/	
		$('select').material_select();		
		$("#mail_compose_btn").off().on("click", function(e){			
			var _url = "/" + mailfile + "/Memo?openform&opentype=popup";
			_url = location.protocol + "//" + location.host + _url;
			gap.open_subwin(_url , '1000', '800', 'yes', '', 'yes')
		});
	},	
	
	"show_channel" : function(id){
		//채널 목록 표시하기		
		
		$("#allcontent em").html("<span class='ico'></span>" + gap.lang.allcontent);
		$("#mycontent em").html("<span class='ico'></span>" + gap.lang.mycontent);
		$("#sharecontent em").html("<span class='ico'></span>" + gap.lang.sharecontent);
		$("#favoritecontent em").html("<span class='ico'></span>" + gap.lang.ff);
		$("#allmention em").html("<span class='ico'></span>" + gap.lang.mention);
		gBody3.show_channel_body();	
		var html = "";
		html += '<div class="lnb-channel channel-category" style="margin-bottom:15px">';
		html += '	<div class="favorit" style="padding: 18px 0 10px 15px !important"><h2>'+gap.lang.favorite+'</h2></div>';
		html += '	<ul id="favorite_channel_list">';
		html += '	</ul>';
		html += '</div>';
		html += '<div class="lnb-channel channel-category">';
		html += '	<div class="folder-area" style="padding: 18px 0 10px 15px !important"><h2>'+gap.lang.unch+'<button class="mu_work ico btn-search" id="workroom_search" style="padding-left:5px"></button></h2></div>';
		html += " 	";
		html += '	<button class="ico btn-more channelinfo" id="create_share_channel" style="top: 30px; right: 15px;display: block;">더보기</button>';
		html += '	<ul id="share_channel_list">';
		html += '	</ul>';
		html += '</div>';
		$("#left_channel_list").mCustomScrollbar('destroy');
		$("#left_channel_list").html(html);	
		//내 사이즈 체크해서 표시한다.
		//gBody3.check_my_drive_size();
		// 공유채널 리스트 정보 가져오기	
		var surl = gap.channelserver + "/channel_info_list.km";
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
				gBody2.draw_channel_left(res);							
				///////////////// 대상그룹 채널 초기화면 구현 하는 부분////////////////////	
				//본부장님 요청으로 해당 기능을 제거하고 신규로 개발한다.
//				gBody3.daesang_channel();			
//				gBody3.__daesang_channel_event();	
			
				if (typeof(id) != "undefined"){//					
//					var html2 = "";
//					html2 += "<div class='chat-area' id='channel_top_list' style='height: calc(100% - 50px); padding: 20px 20px 14px;'>";
//					html2 += "</div>";
//					$("#sub_channel_content").append(html2);
					gBody3.channel_main_draw("2"); //등록일 순으로 소트로 호출한다.
					gBody2.show_channel_data(id);	
				}else{
					gBody3.channel_main_draw("2"); //등록일 순으로 소트로 호출한다.
				}			
				//////////////////////////////////////////////////////////				
				gBody2.__channel_left_event();			
				if (typeof(gap.favorite_list) == "undefined" || gap.favorite_list.length == 0){
					//즐겨찾기가 없는 경우 높이를 높혀준다.
					$(".wrap-nav").css("height", "calc(100% - 0px");
					$("#left_channel").css("height", "calc(100% - 70px");
					$("#left_channel_list_top").css("height", "calc(100% - 265px)");
					$("#left_channel_list").css("height", "calc(100% - 1px)");
				}else{
					$(".wrap-nav").css("height", "calc(100% - 0px");
					$("#left_channel").css("height", "calc(100% - 70px");
					$("#left_channel_list_top").css("height", "calc(100% - 300px)");
				}		
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});			
		$("#left_channel_list").mCustomScrollbar({
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
			autoHideScrollbar : true							
		//	callbacks : {
				//onTotalScrollBack: function(){gBody3.channel_addContent(this)},
				//onTotalScrollBackOffset: 10,
				//alwaysTriggerOffsets:true
		//	}
		});		
		$(".ico.btn-more.channelinfo").off().on("click", function(){
			$.contextMenu({
				selector : ".ico.btn-more.channelinfo",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){
					gBody2.context_menu_call_channel_mng(key, options, $(this).parent().attr("id"));
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
	            	},
	            	show : function (options){
	            	}
				},			
				build : function($trigger, options){
					var is_folder_share = ($trigger.attr("id") == "create_share_channel" ? "Y" : "N");
					return {
						items: gBody2.channel_info_menu_content(is_folder_share)
					}
				}
			});			
		});	
		$("#workroom_search").off().on("click", function(e){			
			var inx = gap.maxZindex() + 1;
			var html = "";			
			html += "<div class='mu_work mu_container lnb-drive channel-category workroom'>";
			html += "	<div class='aside-inner workroom rel'>";
			html += "		<div class='input-field'>";
			html += "			<span class='ico ico-search'></span>";
			html += "			<input type='text' class='formInput' id='workroom_search_field'  placeholder='"+gap.lang.input_channel_name+"'>";
			html += "		</div> ";
			html += "		<button class='ico ico-x'>닫기</button>";
			html += "	</div>";
			html += "	<ul class='people-list custom-scroll' id='workroom_search_result'>";
			html += "	</ul>";
			html += "</div>";			
			$("#workroom_search").qtip({
				selector : "#workroom_search",
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
					//event : 'click unfocus',
					//event : 'mouseout',
					event: false,
					fixed : true
				},
				style : {
					classes : 'qtip-bootstrap',
					tip : false
				},
				position : {
					viewport: $('#nav_left_menu'),
					my : 'top right',
					at : 'bottom left',
					//target : $(this)
					adjust: {
		              x: 90,
		              y: 1
					}
				},
				events : {
					show : function(event, api){	
						setTimeout(function(){
							$("#workroom_search_field").focus();
						}, 500);					
						$(".ico.ico-x").off().on("click", function(e){
							api.destroy(true);
						});						
						$("#workroom_search_field").keypress(function(e){
							if (e.keyCode == 13){
								var query = $("#workroom_search_field").val();
								gBody3.workroom_search(query);
							}
						})
					},
					hidden : function(event, api){
						api.destroy(true);
					}
				}
			});				
		});
	},
	
	"show_channel_body" : function(id){		
		
		var html2 = "";
		html2 += "<div class='chat-area' id='channel_top_list' style='height : calc(100% - 50px)'>";
		html2 += "<div class='channel-header' id='work-chat'>";
		html2 += "<span class='before_btn_icon' id='channel_back' style='cursor:pointer; margin-right:9px;height:18px'></span>"
		html2 += "	<h2 style='max-width:calc(100% - 500px)'></h2>";
//		html2 += "			<div class='info-type' id='realtime_video' style='display:none; position:relative; top:-5px; left:-25px; cursor:pointer'>"+gap.lang.make_video+" <span class='ico ico-camera'></span></div>";
		
		
		html2 += "<div class='btn-wrap'>";		
		html2 += "	<div class='channel-search'>";
		html2 += "		<div class='input-field'>";
		html2 += "			<input type='text' class='' id='ch_query'  autocomplete='off' placeholder='"+gap.lang.input_search_query+"' />";
		html2 += "		</div>";
		html2 += "		<button class='ico btn-channel-search' id='ch_query_btn'>검색</button> ";
		html2 += "		<div class='xbtn-search-close' style='display:none' id='ch_query_btn_close'></div>"
		html2 += "	</div>";
	//	html2 += "	<button id='notice_write' class='ico btn-work-notice'>공지작성</button>";
		html2 += "	<button id='channel_add_member' class='ico btn-add'>사용자추가</button>";
		if (useMention == "T"){
			html2 += "	<button id='header_mention' class='ico header-mention'>mention</button>";			
		}
		html2 += "	<button id='conv_config' class='ico header-setting'>설정</button>";
		html2 += "</div>";
		
		
		html2 += "	<div class='channel-tab'>";
		html2 += "		<ul class='tabs' style='overflow:hidden'>";
		html2 += "			<li class='tab' ><a href='' id='conversations_tab' class='active'>"+gap.lang.ch_tab1+"</a></li>";
		html2 += "			<li class='tab'><a href='#' id='files_tab'>"+gap.lang.ch_tab2+"</a></li>";
		//if (gBody3.check_top_menu_box(gBody3.cur_opt)){
			html2 += "			<li class='tab' ><a href='#' id='channel_todo' style='display:none'>"+gap.lang.ch_tab3+"</a></li>";
			html2 += "			<li class='tab' ><a href='#' id='channel_collect' style='display:none'>"+gap.lang.ch_tab4+"</a></li>";
		//}
		html2 += "		</ul>";
		html2 += "	</div>";		
		html2 += "	<div id='view_mode_tab' class='drive-btns' style='display:none;'>";
		html2 += "		<button id='files_download_file_btn'>" + gap.lang.download + "</button>";
		html2 += "		<button id='files_delete_file_btn'><span>" + gap.lang.basic_delete + "</span></button>";
		html2 += "		<button id='files_reg_drive_file_btn'><span>" + gap.lang.reg_on_drive + "</span></button>";
		html2 += "		<button id='files_select_all_btn'><span>" + gap.lang.selectall + "</span></button>";
		html2 += "		<button id='files_deselect_all_btn'><span>" + gap.lang.deselection + "</span></button>";
		html2 += "		<button id='view_mode_list' class='ico btn-mode-list" + (gBody2.disp_view_mode == "list" ? " on" : "") + "'>리스트보기</button>";
		html2 += "		<button id='view_mode_image' class='ico btn-mode-img" + (gBody2.disp_view_mode == "image" ? " on" : "") + "'>이미지보기</button>";
//		html2 += "		<button id='view_mode_gallery' class='ico btn-mode-gallery" + (gBody2.disp_view_mode == "gallery" ? " on" : "") + "'>갤러리보기</button>";
		html2 += "	</div>";
		html2 += "	</div>";	// work-chat End
		
		// 공지관련		
		html2 += "	<div class='notice-top' id='notice_top_work'>";
		html2 += "		<div class='notice-detail-wr'>";
		html2 += "			<div class='notice-detail-inner'>";
		html2 += "				<div class='notice-head-wr'>";
		html2 += "					<div class='ico-notice'></div>";
		html2 += "					<div class='notice-head'></div>";
		html2 += "				</div>";
		html2 += "				<div class='reply-cnt'>0</div>";
		html2 += "				<div class='ico-expand'></div>";
		html2 += "			</div>";
		html2 += "			<div class='notice-writer'></div>";
		html2 += "			<div class='notice-btn-wr'>";
		html2 += "				<button type='button' class='btn-notice-detail'>" + gap.lang.view_detail + "</button>";
		html2 += "				<button type='button' class='btn-notice-modify'>" + gap.lang.basic_modify + "</button>";
		html2 += "				<button type='button' class='btn-notice-remove'>" + gap.lang.basic_delete + "</button>";
		html2 += "			</div>";
		html2 += "		</div>";
		html2 += "	</div>";
	
		html2 += "	<div id='channel_list' class='wrap-channel' style='overflow:hidden; height: 100%'>	";
		html2 += " 	</div>";
		html2 += "</div>";
		
		
		// 에디터 전환 버튼
		html2 += "	<div id='btn_editor_change' class='btn-editor-chg'><span>" + gap.lang.change_editor + "</span><img src='../resource/images/ico_editor_trans.png'/></div>";

		// 에디터 표시 버튼
		html2 += "<div class='btn-editor-disp disp-show hide' id='btn_editor_show'>";
		html2 += "	<span class='txt'>" + gap.lang.show_editor + "</span>";
		html2 += "	<span class='arrow fold'></span>";
		html2 += "</div>";
				
		html2 += "	<div class='chat-bottom' id='chat_bottom_dis'>";				
		html2 += "<div class='input-editor layer-upload'  id='editor_dis' style='display:none'>";
		
		// 에디터 숨김 버튼 
		html2 += "<div class='btn-editor-disp' id='btn_editor_hide'>";
		html2 += "	<span class='txt'>" + gap.lang.hide_editor + "</span>";
		html2 += "	<span class='arrow'></span>";
		html2 += "</div>";
		
		html2 += "	<div class='upload-btns'>";
		//html2 += "		<button id='editor_upload_start'><span>"+gap.lang.basic_save+"</span></button>";
		html2 += "		<button id='editor_upload_notice'><span>"+gap.lang.nreg+"</span></button>";
		html2 += "		<span class='btn-sepa'></span>";
		html2 += "		<button id='editor_upload_start'><span>"+gap.lang.registration+"</span></button>";
		html2 += "		<button id='editor_close'><span>"+gap.lang.Cancel+"</span></button>";
		html2 += "		<span class='btn-sepa'></span>";
		html2 += "		<button id='editor_temp_save'><span>"+gap.lang.temps+"</span></button>";
		html2 += "		<button id='editor_temp_list'><span>"+gap.lang.templist+"</span></button>";
		html2 += "	</div>";
		html2 += "	<div class='input-field select-share'>";
		html2 += "		<h3>채널</h3>";
		html2 += "		<select id='share_editor_list_popup'>";
		html2 += "		</select>";
		html2 += "	</div>";
		html2 += "	<div class='input-field'>";
		html2 += "		<input class='formInput' id='editor_title' type='text' autocomplete='off' />";
		html2 += "		<label for='editor_title' id='editor_title_label'>제목</label> <!-- input id와 label for 동일한 값 주세요. 텍스트필드 포커스시 on 클래스 추가해 주세요. -->";
		html2 += "		<span class='bar'></span>";
		html2 += "	</div>";
		html2 += "	<button class='btn-attach-add' id='editor_add_file'><span>파일 추가</span></button>";
		html2 += "	<ul class='attach-list' id='upload_file_list_editor_edit' style='list-style:none'></ul>"; 
		html2 += "	<ul class='attach-list' id='upload_file_list_editor' style='list-style:none'>";
		html2 += "	</ul>";
		html2 += "	<div class='editor-area'>";
		//html2 += "		<iframe src='' id='editor_iframe' border=0 frameborder=0 style='display:block; width: 100%; height: 500px; overflow:hidden'></iframe>";
		html2 += "		<iframe src='' id='editor_iframe' border=0 frameborder=0 style='display:block; width: 100%; height: 100%; overflow:hidden'></iframe>";
		html2 += "	</div>";
		html2 += "</div>";		
		html2 += "		<div id='total-progress_channel' class='' style='height:1px;width: calc(100% - 20px); margin-left:10px'>";
		html2 += "			<div class='progress-bar' style='width:0%;background:#337ab7' data-dz-uploadprogress></div>";
		html2 += "		</div>";
		html2 += "	<div class='input-area'>";	
	//	html2 += "		<button class='btn-choose ico' id='other_btn'></button>";
		html2 += "		<button class='abs  ico-plus2' id='other_btn'></button>";
		html2 += "		<textarea class='txt-chat' style='overflow:hidden; resize:none;line-height:20px;border-radius:initial' id='message_txt_channel' onInput='gap.auto_height_check(this)' placeholder='"+gap.lang.input_message2+"' /></textarea>";
	//	html2 += "		<button class='btn-emoticon ico' id='open_emoticon2'></button>";
		html2 += "		<button class='abs ico-emoticon' id='open_emoticon2'></button>";
		html2 += "		<button class='btn-clip ico' id='open_attach_window2' style='display:none'></button>";
		html2 += "		<button class='btn-more ico' id='person_text_option2'></button>";
		html2 += "	</div>";
		html2 += "</div>";
		$("#sub_channel_content").html(html2);		
		if (typeof(id) != "undefined"){
			gBody2.show_channel_data(id);	
		}		
		//	if (sabun == "AC000020"){
		if (!gBody3.select_files_tab){
			gBody3.show_conversation_config();			
		}else{
		//	gBody3.hide_conversation_config();
		}		
		$("#realtime_video").off().on("click", function(e){			
			gap.showConfirm({
				title : "Confirm",
				contents : gap.lang.video_in,
				callback : function(){
					gap.invite_video_chat();
				}
			});		
		});		
		$("#channel_back").off().on("click", function(e){
			var res = gap.checkEditor();
			if (!res) return false;
			
			
			$("#channel_right").hide();
			$("#center_content").hide();
			$("#user_profile").hide();
			$("#sub_channel_content").hide();
			//todo에서 뒤로 하고 다시 들어가면 todo 클래스가 적용되어 화면이 깨지는 현상 처리			
			$("#channel_list").empty();
			$("#channel_top_list").css("padding", "20px 20px 14px 20px");						
			gBody3.select_files_tab = false;			
			$("#channel_list").removeAttr('class');
			$("#channel_list").addClass("wrap-channel");
			$("#channel_list").css("height", "100%");
			
			gBody3.main_sort = "2";
			gBody3.channel_main_draw();
		});
		
		// 에디터로 전환 버튼 이벤트
		$('#message_txt_channel').on('focus', function(){
			$('#sub_channel_content').addClass('expand-input');
		});
		$('#btn_editor_change').on('mouseenter', function(){
			$(this).addClass('grow');
			$('#chat_bottom_dis').addClass('shrink');
		});
		$('#btn_editor_change').on('mouseleave', function(){
			$(this).removeClass('grow');
			$('#chat_bottom_dis').removeClass('shrink');
		});
		$('#btn_editor_change').on('click', function(){
			gBody3.show_editor();
		});
		
		
//	};
		gBody3.channel_init("channel_list");	
		$("#editor_title").focus(function(e){
			$("#editor_title_label").addClass("on");
		});	
	//mention
	//gBody3.init_mention_userdata();
		gBody3.init_mention_userdata('message_txt_channel');
		gBody3.init_mention_userdata('fileupload_content');
	},
	
	"show_conversation_config" : function(){
	
		if (useMention == "T"){
			if (gBody3.check_top_menu_new() || gBody3.cur_opt == ""){
				//$('#work-chat .channel-search').css('right', '70px');
				//$('#conv_config').css('right', '40px');
				$("#conv_config").show();
				$("#header_mention").hide();
				$("#channel_add_member").hide();				
			}else{
				//$('#work-chat .channel-search').css('right', '130px');
				//$('#conv_config').css('right', '40px');
				$("#conv_config").show();
				$("#header_mention").show();
				$("#channel_add_member").show();
			}			
		}else{
			//$('#work-chat .channel-search').css('right', '70px');
			//$('.header-setting').css('right', '40px');
			$("#conv_config").show();	
		}
	},
	
	
	
	"clear_dropzone2" : function(){
		$("#total-progress_folder").hide();
		myDropzone_folder.removeAllFiles(true);		
	},
	
	"complete_process_folder" : function(){
		$("#total-progress_folder").fadeOut(function(){
			document.querySelector("#folder_process").style.display = "none";
			document.querySelector("#folder_process").style.width = "0%";

		});
	},	
	
	
	"removeClass_channel" : function(){
		$("#channel_option li").removeClass("on");
		$("#left_channel_list .drive-code").removeClass("on");
		$("#left_channel_list .channel-code").removeClass("on");
		$("#left_channel_list li").removeClass("on");
		$("#left_channel_list .folder-code").removeClass("on");
	},
	
	"search_my_channel_list" : function(){
		var list = "";		
		$("#share_channel_list .channel-code").each(function(inx){
			if (list == ""){
				list = $(this).attr("id");
			}else{
				list = list + "-spl-" + $(this).attr("id");
			}
		});
		$("#person_channel_list .channel-code").each(function(inx){
			if (list == ""){
				list = $(this).attr("id");
			}else{
				list = list + "-spl-" + $(this).attr("id");
			}
		});			
		gBody3.select_channel_code = list;
	},
	
	"search_enter" : function(){
		var res = gap.checkEditor();
		if (!res) return false;
		$("#ch_query_btn").hide();
		$("#ch_query_btn_close").show();
		$("#ch_query_btn_close").off().on("click", function(e){			
			var res = gap.checkEditor();
			if (!res) return false;			
			$("#ch_query").val("");
			$("#ch_query_btn").show();
			$("#ch_query_btn_close").hide();
			gBody2.show_channel_data(gBody3.cur_opt);			
		});		
		gBody3.bofore_data_remove();
		gBody3.start = 0;
		gBody3.islast = "F";			
		if (gBody3.select_files_tab){
			//Files 탭
			gBody2.draw_files(1);
		}else{
			//Conversations 탭
			gBody3.draw_channel_list();
		}
	},
	
	"expand_collapse_btn" : function(){
		var html = "<button class='ico btn-view' id='ch_ex_col_btn' onclick=\"gBody3.ex_col_btn_call(this)\"></button>";
		return html;
	},
	
	"ex_col_btn_call" : function(obj){		
		var isExpand = $(obj).hasClass("on");
		var open = gBody3.right_window_open;
		if (isExpand){
			$(obj).removeClass("on");
			$("#left_frame_collapse_sub_btn").click();  //채널메뉴에서 접고 펼치기 처리
			$("#todo_left_col").click();  //드라이브 메뉴에서 접고 펼치기 처리			
			if (open){				
				$("#sub_channel_content").css("width","calc(100% - 315px)");
				$("#main_body").css("width","");
				$("#channel_right").show();
			}else{
				$("#main_body").css("width","calc(100% - 315px)");
			}
		}else{
			$("#left_frame_collapse_btn").click();   //채널 메뉴에서 접고 펼치기 처리
			$("#nav_left_menu .btn-left-fold").click();   //드라이브 메뉴에서 접고 펼치기 처리			
			$(obj).addClass("on");
			$("#sub_channel_content").css("width","calc(100% - 50px)");
			$("#main_body").css("width","calc(100% - 57px)");
			$("#channel_right").hide();
		}	
	},
	
	"tabs_visible" : function(opt){		
		if (opt == "T"){
			$("#channel_todo").show();
		}else{
			$("#channel_todo").hide();
		}
	},	
	
	"draw_channel_list_request" : function(){
		//이함수는 특정 채널에서 업무지시를 바로 표시하기 위해서 완전 하드코딩으로 예외처리하는 함수이다..		
		gap.hide_loading2();
		gBody3.toggle_event();	
		gBody3.show_conversation_config();
		gBody3.select_files_tab = false;
		gBody2.select_drive_code = "";		
		//에디터가 떠 있을 경우 닫는다.
		if ($("#editor_dis").css("display") != "none"){
			$("#editor_close").click();
		}		
		$("#add_tab_btn").hide();
		$("#sub_search_profile").hide();
		$("#channel_main").hide();	
		var query_str = $("#ch_query").val();
		if (typeof(query_str) == "undefined"){
			query_str = "";
		}	
		$("#user_search_content").hide();		
		gap.show_content("channel");		
		var isetc = false;		
		$("#realtime_video").show();		
		gBody3.tabs_visible("T");	
		$("#left_channel").show();
		$("#chat_profile").hide();		
		gBody3.channel_read_update(gBody3.select_channel_code2);
		gBody3.unread_channel_count_check_realtime(gBody3.cur_opt);		
		gBody3.right_window_open = true;		
		isetc = true;		
		$("#add_tab_btn").show();		
		$("#channel_todo").click();		
	},
	
	"draw_channel_list" : function(is_add_content){		
		
		
		
		$('#sub_channel_content').removeClass('expand-input');		
		$("#message_txt_channel").val("");
		$("#message_txt_channel").css("height","38px");	
		gap.hide_loading2();
		gBody3.toggle_event();		
		gBody3.show_conversation_config();		
		if (gBody3.start == 0){			
			var oop = gBody3.cur_opt;
			var key = "";
			if (oop == "allcontent"){
				key = "1";
			}else if (oop == "mycontent"){
				key = "2";
			}else if (oop == "sharecontent"){
				key = "3";
			}else if (oop == "allmention"){
				key = "4";
			}else{
				key = gBody3.select_channel_code;
			}		
			var surl = gap.channelserver + "/channel_options_read.km";
			var postData = {
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
				async : false,
				success : function(__res){
			
					var res = JSON.parse(__res);
					if (res.result == "OK"){
						gBody3.prevent_auto_scrolling = (res.data.opt1 != "" ? res.data.opt1 : "1");
						gBody3.collapse_reply = (res.data.opt2 != "" ? res.data.opt2 : "2");
						gBody3.post_view_type = (res.data.opt3 != "" ? res.data.opt3 : "1");
						gBody3.push_receive = (res.data.opt4 != "" ? res.data.opt4 : "1");	
						gBody3.collapse_editor = (res.data.opt5 != "" && typeof(res.data.opt5) != "undefined" ? res.data.opt5 : "2");
					}
				},
				error : function(e){
				}
			});		
		}			
		id = gBody3.cur_opt;
		gBody3.islast ="F";
		gBody3.select_files_tab = false;
		gBody2.select_drive_code = "";	
		gBody3.cur_todo = "";		
		// 스크롤 이동시 호출됐을 경우는 에디터 닫지 않음 (에디터 숨기기를 했을 수 있기 때문에)
		if (is_add_content != 'T') {
			//에디터가 떠 있을 경우 닫는다.
			if ($("#editor_dis").css("display") != "none"){
				$("#editor_close").click();
			}			
		}	
		//댓글 자동 접기를 처리한다.
		if (gBody3.collapse_reply == 1){
			gBody3.isFold = true;
		}else{
			gBody3.isFold = false;
		}		
		$("#add_tab_btn").hide();
		$("#sub_search_profile").hide();
		$("#channel_main").hide();		
		var query_str = $("#ch_query").val();
		if (typeof(query_str) == "undefined"){
			query_str = "";
		}		
		var filter = gBody3.click_filter_image;		
		//"dtype" : 은 파일 형식으로 필터링 할때 사용한다. ppt, xls, doc, pdf, image, movie, hwp, txt, etc		
		$("#user_search_content").hide();		
		gap.show_content("channel");		
		var isetc = false;		
		if ($("#sub_channel_content").hasClass("drive")){			
			$("#sub_channel_content").removeClass("drive");
			$("#sub_channel_content").empty();
			gBody3.show_channel_body();
		}	
		gBody3.tabs_visible("F");
		$("#realtime_video").hide();		
		if (id == "allcontent"){
			var list = gBody3.search_my_channel_list();			
			query = JSON.stringify({
				"channel_code" : gBody3.select_channel_code,
				"query_type" : "allcontent",
				"start" : gBody3.start,
				"perpage" : gBody3.perpage,
				"q_str" : query_str,
				"dtype" : filter,
				"type" : "1",
				"sort" : gBody3.post_view_type
			});			
			$("#left_channel").show();
			$("#chat_profile").hide();
			gBody3.channel_right_frame_close();		
			$("#channel_top_list .channel-header h2").html(gap.lang.allcontent );			
		}else if (id == "allmention"){	
			var list = gBody3.search_my_channel_list();		
			query = JSON.stringify({
				"channel_code" : gBody3.select_channel_code,
				"query_type" : "allmention",
				"start" : gBody3.start,
				"perpage" : gBody3.perpage,
				"q_str" : query_str,
				"dtype" : filter,
				"type" : "1",
				"sort" : gBody3.post_view_type
			});			
			$("#left_channel").show();
			$("#chat_profile").hide();
			gBody3.channel_right_frame_close();
			$("#channel_top_list .channel-header h2").html(gap.lang.mention );			
		}else if (id == "mycontent"){
			var list = gBody3.search_my_channel_list();			
			query = JSON.stringify({
				"channel_code" : gBody3.select_channel_code,
				"query_type" : "mycontent",
				"start" : gBody3.start,
				"perpage" : gBody3.perpage,
				"q_str" : query_str,
				"dtype" : filter,
				"type" : "1",
				"sort" : gBody3.post_view_type
			});			
			$("#left_channel").show();
			$("#chat_profile").hide();
			gBody3.channel_right_frame_close();
			$("#channel_top_list .channel-header h2").html(gap.lang.mycontent );
		}else if (id == "sharecontent"){
			var list = gBody3.search_my_channel_list();		
			query = JSON.stringify({
				"channel_code" : gBody3.select_channel_code,
				"query_type" : "sharecontent",
				"start" : gBody3.start,
				"perpage" : gBody3.perpage,
				"q_str" : query_str,
				"dtype" : filter,
				"type" : "1",
				"sort" : gBody3.post_view_type
			});			
			$("#left_channel").show();
			$("#chat_profile").hide();
			gBody3.channel_right_frame_close();
			$("#channel_top_list .channel-header h2").html(gap.lang.sharecontent);			
		}else if (id == "favoritecontent" || id == "favoritecontent_drive"){
			$("#channel_top_list .channel-header h2").html(gap.lang.favorite );			
			$("#left_channel").show();
			$("#chat_profile").hide();
			gBody3.channel_right_frame_close();					
			gBody2.query_str = "";
			gBody2.draw_favorite_data(1);			
		}else{			
			$("#realtime_video").show();			
			gBody3.tabs_visible("T");
			if (gBody3.start == 0){
				gBody3.channel_read_update(gBody3.select_channel_code);
			}		
			$("#left_channel").show();
			$("#chat_profile").hide();			
			gBody3.right_window_open = true;			
			isetc = true;			
			// 접속자가 채널에 Owner인경우 플러그인을 추가 할 수 있는 버튼을 표시한다.
			$("#add_tab_btn").show();						
			$(".chat-bottom").show();			
			var lrt = gBody3["last_read_time_" + gBody3.select_channel_code];			
			var m_r_t = "";
			if (typeof(lrt) != "undefined"){
				m_r_t = lrt;
			}else{
				m_r_t = gap.check_cur_channel_read_time(gBody3.select_channel_code);
			}		
			query = JSON.stringify({
				"channel_code" : gBody3.select_channel_code,
				"query_type" : (gap.is_mention == "T" ? "mention" : ""),
				"start" : gBody3.start,
				"perpage" : gBody3.perpage,
				"q_str" : query_str,
				"dtype" : filter,
				"type" : "1",
				"sort" : gBody3.post_view_type,
				"read_time" : m_r_t
			});
		}	
		var url = gap.channelserver + "/channel_list.km";
		$.ajax({
			type : "POST",
			dataType : "text",
		//	dataType : "json",
		//	contentType : "application/json; charset=utf-8",
			data : query,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			url : url,			
			success : function(ress){				
				var res = JSON.parse(ress);				
				if (res.data == null){
					if (query_str != ""){							
					}
				}else{					
					//공지사항이 있는지 체크한다.
					gBody.drawNoticeWork();
					
					var list = res.data.data;					
					var html = "";
					if (list.length == 0){
						if (gBody3.start == 0){							
							//Files탭을 클릭한 상태에서 좌측에 메인 메뉴를 클릭한경우 데이터가 없으면 별도로 처리해 줘야 한다.
							$("#channel_list").empty();						
							gBody3.select_files_tab = false;
							$("#view_mode_tab").hide();
							$("#channel_top_list").css("padding-top", "0");
							gBody3.bofore_data_remove();					
							$("#sub_channel_content .tab a").removeClass("active");
							$('.channel-header .tabs').tabs();							
							var htm = "";
							htm += "<div class='msg-empty'>";
							htm += '	<img src="' + root_path + '/resource/images/empty.png" alt="" />';
							htm += gap.lang.nocontent;
							htm += "</div>";						
							$("#channel_list").html(htm);
						}						
						gBody3.tab_click_event();						
						gBody3.islast= "T";						
						//채널을 처음으로 이동하면서 여기서 show를 해준다.
						
						$("#left_main").show();
						$("#main_body").show();
						$(".tabs").tabs();
						//////////////////////////////////
						var is_compose_auth = gap.checkAuth();

						if (is_compose_auth){
							gBody3.paste_image_upload();
						}
																	
						return false;
					}else{					
						try{
						    !!$("#channel_list").data("mCS") && $("#channel_list").mCustomScrollbar("destroy"); //Destroy
						}catch (e){
						    $("#channel_list").data("mCS",''); //수동제거
						}
					}					
					//현재 채널에 마지막 접속한 시간을 가져온다.
					if (typeof(res.unread_count) != "undefined"){
						gBody3["unread_count_" + gBody3.select_channel_code] = parseInt(res.unread_count);
					}					
					var my_last_read_time = gBody3["last_read_time_" + gBody3.select_channel_code];
					var draw_unread_line = false;
					gBody3.cur_channel_unread_line_draw = false;
					
					
					
					//////////////////////////////////////////////////////////////////
					
					for (var i = 0 ; i < list.length; i++){
						var item = list[i];						
						//어디까지 조회 했는지 체크하는 모듈.////////////////////////////////////					
						var cxtime = item.GMT2;
						if (my_last_read_time < cxtime){
							draw_unread_line = true;
							gBody3.cur_channel_unread_line_draw = true;
						}
						/////////////////////////////////////////////////////////						
						var date = "";
						var dis_date = "";
						if (gBody3.post_view_type == "2"){
							//등록일 순으로 표시한다.
							 date = gap.change_date_localTime_only_date(item.GMT2);
							 dis_date = gap.change_date_default(gap.change_date_localTime_only_date(item.GMT2));
						}else{
							//최신 업데이트 순으로 표시한다.
							 date = gap.change_date_localTime_only_date(item.GMT);
							 dis_date = gap.change_date_default(gap.change_date_localTime_only_date(item.GMT));
						}	
						var cnt = $("#web_channel_dis_" + date).length;						
						var dis_id = "date_" + date;						
						var datehtml = "";
						if (cnt == 0){									
							datehtml += "<div class='date' id='web_channel_dis_"+date+"'><span>"+dis_date+"</span></div>";							
							var hx = $("#channel_list .user-thumb").length;
							if (hx == 0){
								$("#channel_list").html(datehtml);				
							}else{						
								$(datehtml).insertBefore($("#channel_list").children().first());			
							}
						}									
						if (item.type == "msg"){
							var html = gBody3.draw_msg(item, "msg", date);
							$(html).insertAfter("#web_channel_dis_"+date);							
						}else if (item.type == "file"){
							var html = gBody3.draw_file(item, date);
							$(html).insertAfter("#web_channel_dis_"+date);							
						}else if (item.type == "emoticon"){
							var html = gBody3.draw_msg(item, "emoticon", date);
							$(html).insertAfter("#web_channel_dis_"+date);							
						}else if (item.type == "ogtag"){
							
						}					
						var totalpage = gBody3.start + gBody3.perpage;
						var ucount = parseInt(gBody3["unread_count_" + gBody3.select_channel_code]);						
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
				$("#channel_list").mCustomScrollbar({
					theme:"dark",
					scrollbarPosition: "inside",
					autoExpandScrollbar: true,
					scrollButtons:{
						enable: true
					},
					mouseWheelPixels : 200, // 마우스휠 속도
					scrollInertia : 400, // 부드러운 스크롤 효과 적용
					mouseWheel:{ preventDefault: false },
					advanced:{
					//	updateOnContentResize: true
					},
					autoHideScrollbar : false,
				//	setTop : ($("#channel_list").height()) + "px",
					callbacks : {
						onTotalScrollBack: function(){							
							gBody3.scrollP = $("#channel_list").find(".mCSB_container").height();							 
							gBody3.channel_addContent(this);						
						},
						onTotalScrollBackOffset: 10,
						alwaysTriggerOffsets:false,						
						whileScrolling : function(){
							gBody3.scroll_bottom = this.mcs.topPct;						
						}
					}
				}); //.mCustomScrollbar("scrollTo", "bottom", {scrollInertia : 0})
				if (gBody3.start !=0){					
					setTimeout(function(){						
						gBody3.fix_position();
					}, 100);
				}else{				
					try{							
						if ($("#read_time_check").length > 0){								
							gap.scroll_move_to_bottom_time_auto_pos("channel_list", 500);							
						}else{
							gap.scroll_move_to_bottom_time("channel_list", 500);
						}				
					}catch(e){}				
				}				
				if (query_str != ""){
					$(".balloon p").highlight(query_str);
					$(".balloon h3").highlight(query_str);
					$(".balloon dt").highlight(query_str);					
					$(".balloon .name").highlight(query_str);
					$(".balloon .team").highlight(query_str);
				}
				//채널을 처음으로 이동하면서 여기서 show를 해준다.
				
				if (call_key == ""){
					$("#left_main").show();
				}
				
				$("#main_body").show();
				$(".tabs").tabs();
				//////////////////////////////////				
				gap.draw_qtip_left("#channel_add_member", gap.lang.member_invite);
			//	gap.draw_qtip_left("#conv_config", gap.lang.userConfig); <== 클릭했을때 qtip이 또 사용되기 때문에 여기서 뺀다.
				gap.draw_qtip_left("#header_mention", gap.lang.mention);				
				gBody3.tab_click_event();				
				gBody3.__event_init_load();						
				gBody3.__draw_reply_event();  //댓글관련 컨텍스트 메뉴 적용을 위한 함수				
				gBody3.unread_channel_count_check_realtime(gBody3.cur_opt);

				return false;				
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		})
	},
	
	"channel_addContent" : function(obj){
		//마지막 채팅의 id값을 가져다기 그 이전 값을 구해 온다.	
		if (($(".xman").length) < 9){
			//중복해서 표시되는 데이터가 이런 경우가 아닐까 한다...
			return false;
		}
		if (gBody3.islast == "T"){
			return false;
		}		
		$(".message-file").removeClass("line1");		
		var new_start = parseFloat(gBody3.start) + parseFloat(gBody3.perpage);
		gBody3.start = new_start;
		gBody3.draw_channel_list('T');		
		return false;		
	},
	
	"fix_position" : function(){
	  //스크롤 해서 데이터가 추가되면 추가되기 이전의 Position에 그대로 있어야 한다.		
	  var scroll_after_position = $("#channel_list").find(".mCSB_container").height();
	  var orignal_position = scroll_after_position - gBody3.scrollP;  
	  $("#channel_list").mCustomScrollbar("scrollTo", orignal_position);  
	  gBody3.scrollP = scroll_after_position;  
	},
	
	"sc" : function(){
		//업무방에 컨텐츠가 하나도 없을 경우 메시지를 입력하면 스크롤이 자동 생성되지 않는 문제 해결
		try{
		    !!$("#channel_list").data("mCS") && $("#channel_list").mCustomScrollbar("destroy"); //Destroy
		}catch (e){
		    $("#channel_list").data("mCS",''); //수동제거
		}
		$("#channel_list").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable: true
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
		//		updateOnContentResize: true
			},
			autoHideScrollbar : true,
			setTop : ($("#channel_list").height()) + "px",
			callbacks : {
				onTotalScrollBack: function(){					
					gBody3.scrollP = $("#channel_list").find(".mCSB_container").height();
					gBody3.channel_addContent(this);					
				},
				onTotalScrollBackOffset: 10,
				alwaysTriggerOffsets:true
			}
		}).mCustomScrollbar("scrollTo", "bottom", {scrollInertia : 0})
	},	
	
	"reply_total_draw" : function(res, id){
		//댓글 등록후 바로 변경하는 함수	
		$("#reply_compose_"+id).val("");	
		//타켓 문서를 현재 창에서 제거하고 오늘의 마지막으로 이동시킨다... 댓글을 달면 최근 데이터로 업데이트 한다.
		var klen = $("#ms_" + gBody3.xkey).length;		
		var GMT = res.data.GMT;
		var GMT2 = res.data.GMT2;
		var rid = res.data.rid;		
		var date = gap.change_date_localTime_only_date(GMT);		
		if (klen > 0){			
			if (gBody3.post_view_type == "2"){				
			}else{
				var ccn = $("#web_channel_dis_"+date).parent().find('.xman').length;
				if (ccn > 0){
					var html = $("#ms_" + gBody3.xkey).get(0).outerHTML;							
					$("#ms_" + gBody3.xkey).remove();							
					var len = $("#web_channel_dis_"+date).length;
					if (len > 0){
						//오늘 날짜가 있는 것이다.
						//var len = $("#web_channel_dis_"+date).find('.xman').length;
						var len = $("#web_channel_dis_"+date).next().length;
						if (len == 0){
							//$(html).insertAfter($("#web_channel_dis_"+date).parent());
							$("#web_channel_dis_"+date).parent().append($(html));
						}else{
							$(html).insertAfter($("#web_channel_dis_"+date).parent().find('.xman').last());
						}						
					}else{
						//오늘 날짜 항목이 없다.
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
					gap.scroll_move_to_bottom_time("channel_list", 200);
				}else{
					//오늘 날짜 항목이 없다.
					var html = $("#ms_" + gBody3.xkey).get(0).outerHTML;					
					var dis_date = gap.change_date_default(gap.change_date_localTime_only_date(GMT));
					var datehtml = "";															
					datehtml += "<div class='date' id='web_channel_dis_"+date+"'><span>"+dis_date+"</span></div>";					
					var hx = $("#channel_list .user-thumb").length;
					if (hx == 0){
						$("#channel_list").html(datehtml);				
					}else{
						$(datehtml).insertAfter($("#channel_list .xman").children().last().parent());
					}
					$("#ms_" + gBody3.xkey).remove();
					$(html).insertAfter($("#web_channel_dis_"+date).last());
				}
			}		
			//Dom객체를 짤라서 마지막에 추가했기 때문에 이벤트를 다시 정리해 줘야 한다.							
			gBody3.__event_init_load();
		}
		//원본의 날짜를 댓글을 저장한 시점의 GMT날짜로 변경해 줘야 한다.
		var time = "";
		if (GMT != GMT2){
			var GMT2_dis = gap.change_date_localTime_full2(GMT2);
			time = gap.change_date_localTime_only_time(GMT) + " (Created : " + GMT2_dis + ")";
		}else{
			time = gap.change_date_localTime_only_time(GMT);
		}		
		$("#ms_" + gBody3.xkey).find(".time").text(time);
		// mention div 영역 초기화 
	     gap.reset_mentions_div();	
		res.data.channel_code = gBody3.select_channel_code2;
		res.data.channel_name = gBody3.select_channel_name2;		
		if (typeof(res.file_infos) != "undefined"){
			res.data.file_infos = res.file_infos;
		}
		res.data.upload_path = res.upload_path;
		res.data.fserver = res.fserver;
		res.data.owner_ky = res.owner_ky;		
		gBody3.update_reply_list(res.data);		
		var obj = new Object();
		obj.channel_code =  gBody3.select_channel_code2;
		obj.tempData = gBody3.tempData;
		res.data.channel_code = gBody3.select_channel_code2;
		obj.channel_name = gap.textToHtml(gBody3.select_channel_name2);
		obj.data = res.data;
		obj.type = "sr";
		obj.owner = gap.userinfo.rinfo;		
		obj.GMT = GMT;
		obj.GMT2 = GMT2;
		obj.rid = rid;		
		obj.upload_path = res.upload_path;
		obj.fserver = res.fserver;		
		var spx = JSON.parse(gBody3.tempData);
		spx.GMT = GMT;
		spx.rid = rid;	
		obj.tempData = JSON.stringify(spx);		
		gBody3.send_socket(obj, "sr");		
		 //모바일  Push를 날린다. ///////////////////////////////////
		var smsg = new Object();
		smsg.msg = "[" + gBody3.select_channel_name2 + "] " + gap.lang.reg_reply;
		smsg.title = gap.systemname + "["+gap.lang.channel+"]";		
		smsg.type = "sr";
		smsg.key1 = obj.channel_code;
		smsg.key2 = "";
		smsg.key3 = gBody3.select_channel_name2;
		smsg.fr = gap.userinfo.rinfo.nm;
		//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
		smsg.sender = gBody3.search_cur_channel_member(obj.channel_code).join("-spl-");		
		//gap.push_noti_mobile(smsg);	
		////////////////////////////////////////////////////
		
		//알림센터에 푸쉬 보내기
		var rid = obj.channel_code;
		var receivers = smsg.sender.split("-spl-");
		var msg2 = "[" + gap.textToHtml(gBody3.select_channel_name2) + "] " + gap.lang.reg_reply;
		var sendername = "["+gap.lang.channel+" : "+ gap.textToHtml(gBody3.select_channel_name2) +"]"
		gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
		
		
		$("#reply_compose_"+id).css("height", "45px");	
		$("#reply_compose_"+id).focus();		
		// 멘션 설정 초기화
		gBody3.init_mention_userdata("reply_compose_"+id);		
		gBody3.reply_attach_event();
		
		
	},	
	
	"__event_init_load" : function(){		
		 //이미지 붙여넣기 할 경우 처리하는 함수
		
		var is_compose_auth = gap.checkAuth();

		if (is_compose_auth){
			gBody3.paste_image_upload();
		}
		 		 
		//에디터 내용 중에 URL이 포함된 경우 자동으로 링크를 걸어주는 기능 추가
		 autolink($(".wrap-editor-area p"));		 
		 $(".wrap-message .write").off().on("click", function(e){			 
			var res = gap.checkEditor();
			if (!res) return false;			
			var id = $(e.currentTarget).data("id");
			var ch_code = $(e.currentTarget).data("ch_code");
			var ch_name = $(e.currentTarget).data("ch_name");			
			gBody3.edit_channel_data(id, ch_code, ch_name);
		 });		 
		 $(".wrap-message .trash").off().on("click", function(e){				
			var id = $(e.currentTarget).data("id");
			var ch_code = $(e.currentTarget).data("ch_code");
			var ch_name = $(e.currentTarget).data("ch_name");
			var ch_name = $(e.currentTarget).data("ch_name");
			var scheduleid = $(e.currentTarget).data("scheduleid");		
			gBody3.delete_channel_data(id, ch_code, ch_name, scheduleid);			
		 });		 
		 $(".bot.flex.text-ico .reply").off();
		 $(".bot.flex.text-ico .reply").on("click", function(e){		
			gBody3.reply_attach_event();			
			var id = $(e.currentTarget).attr("id").replace("r_","");
			//댓글에서 파일 업로드 할때 사용한다.
			gBody3.select_reply = id;			
			var dis = $("#reply_write_" + id).css("display");			
			$(".channel_reply_top").hide();
			if (dis == "none"){
				$("#reply_write_" + id).show();
			}else{
				$("#reply_write_" + id).hide();
			}		
			gBody3.init_mention_userdata("reply_compose_"+id);	

			//댓글 등록이 최하단에 있을 경우 스크로을 내려줘서 글을 입력할 수 있게 해준다..
			//현재 클릭한 댓글이 마지막 댓글인지 판단해서 자동 스크롤 해준다..		
			var lne = $(".xman .reply").length;
			var obj = $(".xman .reply").get(lne-1);
			var tid = $(obj).attr("id");
			var sid = $(e.currentTarget).attr("id");
			if (tid == sid){
				gap.scroll_move_to_bottom_time("channel_list", 10);
			}			
			$(e.currentTarget).parent().parent().find(".channel_reply_cls").focus();						
		 });		 
		 $(".channel_reply_cls").off("keypress.line").bind("keypress.line", function(e){
			 if (e.keyCode == 13 && !e.shiftKey){  
				 //발송 버튼을 클릭한다.						
				 //reply_attach_6450a02f65d822154b0162cc
				 var msg = $(this).val();			 
				 if (msg == ""){					 
					 var att_id = $(e.currentTarget).parent().parent().attr("id").replace("reply_write_","");
					 if ($("#reply_attach_" + att_id).html() == ""){
						 mobiscroll.toast({message:gap.lang.input_message2, color:'danger'});
						 return false;
					 }else{
						 $(e.currentTarget).parent().parent().find(".type_icon_channel").click(); 
					 }
				}else{
					 $(e.currentTarget).parent().parent().find(".type_icon_channel").click(); 
				 }				 			
				 return false;
			 }
			 if (e.keyCode == 13 && e.shiftKey) {
				 //다음줄로 넘어간다.
				 //강제로 BR을 넣어보자				 
			 }
		 });		 
	
		 $(".type_icon_channel").off();
		 $(".type_icon_channel").on("click", function(e){					
			var attach_files = $("#reply_attach_" +  gBody3.select_reply).text();			 
			var txt = $(e.currentTarget).parent().find("textarea").val();
			var id = $(e.currentTarget).parent().attr("id").replace("reply_write_","");					 
			//mention 처리 /////////////////////////////////////////////////////////////
			var mentions_msg = "";
			var mentions_data = "";				
			$("#reply_compose_"+id).mentionsInput('val', function(text){
				mentions_msg = gap.textMentionToHtml(text);;
			});
			$("#reply_compose_"+id).mentionsInput('getMentions', function(data) {
				mentions_data = data;
			});		
			if (mentions_msg == ""){
				 if ($("#reply_attach_" + id).html() == ""){
					 mobiscroll.toast({message:gap.lang.input_message2, color:'danger'});
					 return false;
				 }
			}			
			///////////////////////////////////////////////////////////////////////////			
			if (attach_files != ""){
				//댓글에 파일을 첨부한 경우 
				//myDropzone22.processQueue();
				gBody3.temp_mentions_msg = mentions_msg;
				gBody3.temp_mentions_data = mentions_data;				
				gBody3.cur_reply_attach.options.autoProcessQueue = true;	
				gBody3.cur_reply_attach.processQueue();
				return false;
			}			
			var data = JSON.stringify({
				"content" : mentions_msg,	//content,
				"mention" : mentions_data,
				"owner" : gap.userinfo.rinfo,
				"channel_data_id" : id
			});			
			gBody3.xkey = id;
			gBody3.tempData = data;			
			var url = gap.channelserver + "/save_reply.km";
			$.ajax({
				type : "POST",
				dataType : "text",
				url : url,
				data : data,
				success : function(ress){				
					var res = JSON.parse(ress);
					if (res.result == "OK"){											
						gBody3.reply_total_draw(res, id);							
						
					}else{
						gap.gAlert(gap.lang.errormsg);
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
				}
			});		 
		 });		 
		 
		$(".channel_reply_top").off();
		$(".channel_reply_top").bind("keypress", function(e){			
			if (e.keyCode == 13){
				//다음줄로 내려간다.    
	        	gBody3.enter_next_line_reply(e);
			}
		});
		
		$(".channel_reply_top").bind("keyup", function(e){
			if (e.keyCode == 8 || e.keyCode == 46){		// backspace or delete key
				//gBody3.enter_line_control_reply_calc(e);
				gBody3.enter_line_control(e);
			}
		});
		
		// 붙여넣기 처리
		$(".channel_reply_top").bind("keydown", function(e){
			if (e.ctrlKey && e.keyCode == 86) {
				setTimeout(function(){
					//gBody3.enter_line_control_reply_calc(e);
					gBody3.enter_line_control(e);
				}, 200);
			}
		});			
		
		 $(".like .like-btn").off();
		 $(".like .like-btn").on("click", function(e){			 
			 gBody3.popup_like_person(e);
		 });
		 
		 $(".message-btns li span").off();
		 $(".message-btns li span").on("click", function(e){			
			gBody3.popup_like_person(e);
		 });
		
		//멘션을 클릭한 경우 사용자 정보를 표시한다.
		 $(".wrap-message mention").off();
		 $(".wrap-message mention").on("click", function(e){
			 var id = $(this).attr("data");
			 gBody3.click_img_obj = this;
		//	 _wsocket.search_user_one_for_popup(id);
			 gap.showUserDetailLayer(id);
		 });
		 
		 $(".wrap-message mention").css("cursor", "pointer");
		 
		//에디터 안에 이미지를 적당한 넓이로 설정한다.
		$(".wrap-editor-area img").css("max-width", "98%");
		$(".wrap-editor-area img").css("cursor", "pointer");
		
		$(".wrap-editor-area img").on("click", function(e){			
			var url = this.src;
			var title = "Editor_image.png";			
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;		
			gap.show_image(url, title);
		});
		////////////////////////////////////////////////////////////
			
		$("#channel_list .fold-btns").off();
		$("#channel_list .fold-btns").on("click", function(ix){			
			if ($(this).hasClass("repdis")){
				//TODO에서 댓글 접고 펼치기 할때 사용할려고 추가합니다. 				
				var target = $(this).children().first();
				var tid = target.attr("data");
				var rcount = $("#channel_list #reply_group_" + tid + " dl").length;
				if (target.hasClass("btn-reply-fold")){	
					target.removeClass("btn-reply-fold");
					target.addClass("btn-reply-expand");	
					target.find("span").first().text(gap.lang.reply + " " + gap.lang.ex);
					target.find("span").first().next().text(rcount);
					$("#channel_list #reply_group_"+tid).fadeOut();
				}else{
					target.removeClass("btn-reply-expand");
					target.addClass("btn-reply-fold");
					target.find("span").first().text(gap.lang.reply + " " + gap.lang.fold);
					target.find("span").first().next().text(rcount);
					$("#channel_list #reply_group_"+tid).fadeIn();
				}				
			}else if ($(this).hasClass("editor")){				
				var target = $(this).children().first();
				var tid = $(this).data("key");				
				var cparent = $("#ms_"+tid);				
				if (target.hasClass("btn-editor-fold")){	
					target.removeClass("btn-editor-fold");
					target.addClass("btn-editor-expand");	
					target.find("span").first().text(gap.lang.collapse_editor);
					$("#p_"+tid).parent().fadeOut();
					cparent.find(".tmpimagelist").css("display", "none");
					cparent.find(".message-file").css("display", "none");
				}else{					
					target.removeClass("btn-editor-expand");
					target.addClass("btn-editor-fold");
					target.find("span").first().text(gap.lang.expand_editor);
					$("#p_"+tid).parent().fadeIn();					
					cparent.find(".tmpimagelist").css("display", "");
					cparent.find(".message-file").css("display", "");
				}				
			}else{
				//기존 텍스트 문구가 길어질 경우 접고 펼치기 영역
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
		
		$(".user .user-thumb.showorg").off();
		$(".user .user-thumb.showorg").on("click", function(e){		
			gBody3.click_img_obj = this;	  
    	  	var uid = $(this).attr("data");
        //	_wsocket.search_user_one_for_popup(uid);  
        	gap.showUserDetailLayer(uid);
		});
		
		$(".img-content .img-thumb").off();
		$(".img-content .img-thumb").on("click", function(e){
			//이미지 직접 클릭해서 미리보기 전체 창으로 띄우기
			var url = $(this).find("img").attr("src");
			url = url.replace("_thumb.do",".do");			
			var title = $(this).find("img").attr("data");			
			//이미지 리스트를 등록한다.			
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;		
			var image_list = $(this).parent().parent().find("img");
			if (image_list.length > 0){				
				var k = 1;
				for (var i = 0 ; i < image_list.length; i++){
					var image_object = new Object();
					var image_info = image_list[i];
					var turl = $(image_info).attr("src").replace("_thumb.do",".do");
					image_object.title = $(image_info).attr("data");
					image_object.url = turl;
					image_object.sort = k;					
					gap.image_gallery.push(image_object);
					if (turl == url){
						gap.image_gallery_current = k;
					}
					k++;
				}
			}			
			gap.show_image(url, title);
		});
		
		$(".img-btns .btn-view").off();
		$(".img-btns .btn-view").on("click", function(e){
			//이미지 마우스 오버시 확장 버튼으로 전체 창으로 띄우기
			var url = $(this).parent().parent().prev().find("img").attr("src");
			//url = url.replace("ty=2","ty=1");
			url = url.replace("_thumb.do", ".do");			
			var title = $(this).parent().parent().prev().find("img").attr("data");			
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;			
			gap.show_image(url, title);
		});
		
		$(".img-btns .btn-download").off();
		$(".img-btns .btn-download").on("click", function(e){
			//이미지 마우스 오버시 다운로드 클릭으로 파일 다운로드 하기
			var url = $(this).parent().parent().prev().find("img").attr("src");
		//	url = url.replace("ty=2","ty=1");
			url = url.replace("_thumb.do",".do");			
			var title = $(this).parent().parent().prev().find("img").attr("data");
			gap.file_download_normal(url, title);
		});
		
		$(".chat-attach .btn-file-view").off();
		$(".chat-attach .btn-file-view").on("click", function(e){			
			e.preventDefault();		
			//일반 파일 미리 보기 클릭 한  경우				
			var citem =  "";			
			var filename = "";
			var fserver ="";
			var upload_path = "";
			var md5 = "";
			var email = "";
			var ty = "";
			var id = "";		
			var is_reply_att = false;			
			if ($(e.currentTarget).parent().attr("class") == "reply-file"){
				is_reply_att = true;
				var citem =  $(this).parent();		
				filename = citem.attr("data7");
				fserver = citem.attr("data1");
				upload_path = citem.attr("data2");
				md5 = citem.attr("data3");
				email = citem.attr("data4");
				ty = citem.attr("data5");
				id = citem.attr("data6");
				
			}else{
				//일반 파일 미리 보기 클릭 한  경우				
				var citem =  $(this).parent().find("dt");			
				filename = citem.text();
				fserver = citem.attr("data1");
				upload_path = citem.attr("data2");
				md5 = citem.attr("data3");
				email = citem.attr("data4");
				ty = citem.attr("data5");
				id = citem.attr("data6");
			}
			var ext = gap.is_file_type_filter(filename);
			if (ext == "movie"){				
				//PC에서 재생되는 확장자 인지  확인 한다.
				if (gap.is_file_preview_mobile(filename)){
					gap.gAlert(gap.lang.not_support);
					return false;		
				}				
		//	if (ty == "mp4"){
				//var download_url = fserver + "/FileDownload.do?em=" + email + "&fd=" + upload_path + "&ty=1&m5=" + md5 + "&fn=" + encodeURIComponent(filename);
				//var download_url = fserver + "/FDownload.do?id=" + id + "&ty=2&md5=" + md5;
				//gap.show_video(download_url, filename);					
			//	var vserver = gap.search_video_server(fserver);
			//	var url = vserver + "/2/" + email + "/" + upload_path + "/" + md5 + "/" + ty;]				
				var url = gap.search_file_convert_server(fserver) + "/FDownload.do?id=" + id + "&ty=2&md5=" + md5;							
				gap.show_video(url, filename);	
				return false;							
			}else{				
			//	gap.show_loading(gap.lang.changeimg);
			
				if (gap.checkFileExtension(filename)){
					var url = gap.channelserver + "office/" + id+ "_"+ md5 + "/channel";
					gap.popup_url_office(url);	
					return false;
				}
			
			
				var id = "";
				var ft = "";
				var px = "2";
				if (is_reply_att){
					id = id;
					ft = ty;
					px = "reply"
				}else{
					id = $(this).parent().find("dl dt").attr("data6");
					ft = $(this).parent().find("dl dt").attr("data5");					
				}		
				var obj = new Object();
				obj.id = id;
				obj.md5 = md5;
				obj.ty = "2";
				obj.filename = filename;
				obj.fserver = fserver;
				gBody3.click_file_info =  obj;				
				var fs = gap.server_check(fserver);				
				gBody3.file_convert(fs, filename, md5, id, px, ft, email, upload_path);						
			}		
			return false;
			
		});
		
		$(".chat-attach .btn-file-download").off();
		$(".chat-attach .btn-file-download").on("click", function(e){			
			//일반 파일 다운로드 클릭한 경우			
			var is_reply_att = false;			
			var citem = "";
			var filename = "";
			var pty = "2";
			var email = "";
			if ($(e.currentTarget).parent().attr("class") == "reply-file"){
				citem =  $(e.currentTarget).parent();	
				filename = citem.attr("data7");
				email = citem.attr("data4");
				pty = "reply";
			}else{
				citem =  $(this).parent().find("dt");				
				filename = citem.text();				
				email = citem.attr("data4");
			}
			var fserver = citem.attr("data1");
			var upload_path = citem.attr("data2");
			var md5 = citem.attr("data3");			
			var ty = citem.attr("data5");
			var id = citem.attr("data6");			
			var ky = gap.userinfo.rinfo.ky;		
			var download_url = gap.search_file_convert_server(fserver) + "/FDownload.do?id=" + id + "&ty="+pty+"&md5=" + md5 + "&ky="+ky;		
			gap.file_download_normal(download_url, filename);		
			return false;			
		});
		
		$(".chat-attach dt").off();	
		$(".chat-attach dt").on("click", function(e){			
			var id = gBody3.cur_opt;			
			//현재 채널방 참석자가 띄워져 있으면 다시 그리지 않는다.			
			if ( gBody3.check_top_menu()){
				$(".owner-info").remove();
				$("#member_info_dis").remove();
			}else{				
				if ($("#owner_info_dis").length > 0){
					var mdata = $("#owner_info_dis").attr("data").replace("member_","");
				if (mdata != id){
					gBody3.draw_channel_members(id);
				}
			}
		}
			
		var md5 = $(this).attr("data3");
		var xid = $(this).attr("data6");
		gBody3.xkey = xid;
		gBody3.xcode = $(this).attr("data7");	
		var url = gap.channelserver + "/file_info.km";
		var data = JSON.stringify({
			"id" : xid,
			"md5" : md5,
			"ty" : "2"
		});		
		$.ajax({
			type : "POST",
			dataType : "json",
		//	contenType : "application/json; charset=utf-8",
			data : data,
			url : url,
			success : function(res){				
				if (res.result == "OK"){
					var file_info = res.data;					
					gBody3.draw_file_detail(file_info);					
					$(".detail-info").mCustomScrollbar({
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
						autoHideScrollbar : true,							
						callbacks : {
							//onTotalScrollBack: function(){gBody3.channel_addContent(this)},
							//onTotalScrollBackOffset: 10,
							//alwaysTriggerOffsets:true
						}
					});								
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});			
	});	
	
		$(".btn-reply-del").off();
		$(".btn-reply-del").on("click", function(e){
			gBody3.delete_reply(this);
		});		
		
		$(".chat-attach .btn-more").off();
		$(".chat-attach .btn-more").on("click", function(e){			
			$.contextMenu({
				selector : ".chat-attach .btn-more",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){					
					var info = $(this).parent().find("dl dt");
					var id = info.attr("data6");
					var md5 = info.attr("data3");
					var ft = info.attr("data5");
					var channel_code = info.attr("data7");
					var channel_name = info.attr("data8");
					var fs  = info.attr("data1");					
					gBody3.context_menu_call_file(key, id, md5, ft, channel_code, fs, channel_name);
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
					},
					show : function (options){
					}
				},			
				build : function($trigger, options){
					options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
						return {
						items: gBody3.file_context($trigger.parent().find("dl dt").attr("data4"))
					}
				}
			});
		});	
		
		$(".img-btns .btn-more").off();
		$(".img-btns .btn-more").on("click", function(e){			
			$.contextMenu({
				selector : ".img-btns .btn-more",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){					
					var info = $(this).parent().parent().parent().find("img");
					var id = info.attr("data3");
					var md5 = info.attr("data1");
					var ft = info.attr("data2");
					var channel_code = info.attr("data5");
					var channel_name = info.attr("data8");
					var fs  = info.attr("data1");
					gBody3.context_menu_call_file(key, id, md5, ft, channel_code, fs, channel_name);
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
					},
					show : function (options){
					}
				},			
				build : function($trigger, options){
					options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
					return {
						items: gBody3.file_context($trigger.parent().parent().parent().find("img").attr("data4"))
					}
				}
			});
		});		
		gBody3.btn_event();
		gBody3.toggle_event();
	},
	
	"btn_event" : function(){		
		$(".meet_invite").off().on("click", function(e){
			//채널에서 화의실 연동해서 자동 넘어온 회의실 정보를 표시하는 함수
			var key = $(e.currentTarget).data("id");
			var type = $(e.currentTarget).data("type");
			gMet.showMeetingDetailLayer(type, key);
		});
		
		$(".req_box .req_btn").off().on("click", function(e){	
		
			var _vote = $(this).parent().data("vote");
			var type = $(this).data("type");			
			if (type == "vote"){
				gBody3.response_vote(_vote);
			}else if (type == "notice_vote"){
				var _vote = $(this).data("vote");
				gBody3.response_vote(_vote);
			}else if (type == "aprv"){
				var link = $(this).parent().data("url");
				link = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + link;
				gap.open_subwin(link, "1240","760", "yes" , "", "yes");	
			}else if (type == "notice_aprv"){
				var link = $(this).data("url");
				gap.open_subwin(link, "1240","760", "yes" , "", "yes");	
			}else if (type == "bbs"){
				var link = $(this).parent().data("url");
				gap.open_subwin(link, "1240","760", "yes" , "", "yes");	
			}else if (type == "notice_bbs"){
				var link = $(this).data("url");
				gap.open_subwin(link, "1240","760", "yes" , "", "yes");	
			}else if (type == "channel_meeting"){
				var auth = gap.get_auth();
				var link = $(this).parent().data("url");
				link = link + "&auth=" + auth;
				window.open(link, null);
			}else if (type == "todo"){
				var id = $(this).parent().data("url");
				gTodo.todo_show_other_app(id);
			}else if (type == "mail"){
				var id = $(this).data("t1");
				var tdb = $(this).data("t2");
				var tserver = $(this).data("t3");
				gBody4.openMail(id,'body', tdb, tserver);
			}else if (type == "notice"){				
				var key = $(e.currentTarget).attr("data");
				gap.noticeOpen(key, "work");
			}			
		});
		
		$(".wrap-editor-area table").css("width","auto");		
		$(".xman .channel-name").off().on("click", function(e){
			var id = $(e.currentTarget).data("key");
			$("#" + id).click();			
		});
	},		

	"toggle_event" : function(){		
		$("#channel_list").off();
		$("#channel_list").droppable({
			drop : function(event, ui){
				try{
					var droppable = $(this);
					var draggable = ui.draggable;
					var dragid = ui.draggable.attr("id");					
					if (draggable.hasClass("tmail")){						
						var msg = gap.lang.dragandadd;
						gap.showConfirm({
							title: "Confirm",
							contents: msg,
							callback: function(){
							if (draggable.hasClass("tmail")){
								//메일을 드래그 & 드롭으로 이동한 경우
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
										res.type = "mail";													
										var data = JSON.stringify({
											"type" : "msg",
											"channel_code" : gBody3.select_channel_code,
											"channel_name" : gBody3.select_channel_name,
											"email" : gap.userinfo.rinfo.em,
											"ky" : gap.userinfo.rinfo.ky,
											"owner" : gap.userinfo.rinfo,
											"content" : "",
											"edit" : gBody3.edit_editor,
											"msg_edit" : "",
											"id" : gBody3.select_channel_id,
											"ex" : res
										});
										
										if ( gBody3.check_top_menu() ){
											//이경우 메시지를 어떤 채널에 추가할지를 선택하는 창을 띄워야 한다.
											//이경우 메시지를 어떤 채널에 추가할지를 선택하는 창을 띄워야 한다.
											gBody3.popup_status = "mail";
											gBody3.add_upload_file_list("","mail");
											gBody3.temp_mail_info = data;											
											gap.showBlock();
											var inx = parseInt(gap.maxZindex()) + 1;											
											$("#f_u1_ex").text(gap.lang.mup);
											$("#f_u2_ex").text(gap.lang.scpp);											
											var from = res.sender;
											if (from == ""){
												from = "None";
											}
											var title = res.title;
											var tunid= res.target_unid;
											var tdb = res.target_db;											
											var attach_list = res.attach.split("*?*");
											var attach_size = res.attachsize.split("*?*");
											var target_server = res.target_server;
											var acount = 0;
											if (attach_list != ""){
												acount = attach_list.length;
											}											
											var html = "";
											html += "<div class='chat-mail'>";
											html += "<div style='width:100%'>";
											html += "	<span class='ico ico-mail'></span>";
											html += "	<dl style='cursor:pointer' onclick=\"gBody4.openMail('"+tunid+"','body', '"+tdb+"', '"+target_server+"')\">";											
											html += "		<dt>"+from+"</dt>";
											html += "		<dd>"+title+"</dd>";
											html += "	</dl>";											
											if (attach_list != ""){
												html += "	<div class='mail-attach-list'>";
												html += "		<button class='ico btn-fold'>접기</button> <!-- 클릭 시 .on 클래스 토글 -->";
												html += "		<h4>첨부파일 <span>"+acount+"</span></h4>";
												html += "		<ul style='list-style:none'>";											
													for (var i = 0 ; i < attach_list.length; i++){
														var attname = gap.textToHtml(attach_list[i]);
														var attsize = attach_size[i];
														var icon = gap.file_icon_check(attname);	
														var target_server = res.target_server;														
													//	html += "			<li onclick=\"gBody3.mail_file_down('"+target_server+"','"+tunid+"','"+attname+"', '"+tdb+"')\">";
														html += "			<li data-target='"+target_server+"' data-tunid='"+tunid+"' data-attname='"+attname+"' data-tdb='"+tdb+"' onclick=\"gBody3.mail_file_down2(this)\">";
														html += "			<span class='ico ico-attach "+icon+"'></span><span>"+attname+"</span>";
														html += "			<em>("+gap.file_size_setting(attsize)+")</em>";
														html += "			</li>";
													}												
												html += "		</ul>";
												html += "	</div>";
											}											
											html += "</div>";
											html += "</div>";											
											$("#ex_body_dis").html(html);											
											$("#fileupload_layer").css("z-index", inx);
											$("#fileupload_layer").fadeIn();						
										}else{
											//이경우 메시지를 어떤 채널에 추가할지를 선택하는 창을 띄워야 한다.
											gBody3.send_msg_to_server(data);
										}	
									},
									error : function(e){
										gap.gAlert(gap.lang.errormsg);
										return false;
									}
								});							
							}
						}
					});

				}
			}catch(e){}				
			},
			hoverClass: "chat-area drop-area"
		});
	},				
		
	"paste_image_upload" : function(){
		$("#channel_top_list").off("paste");
		$("#channel_top_list").on("paste",function(e){			
			var target = $(e.target).attr("class");
			if (target == "formInput" || target == "channel_reply_cls"){
				//TODO의 등록하는 화면에서 붙여넣기가 안되서 예외처리한다.
				return;
			}			
			e.stopPropagation();
			e.preventDefault();		
			var items = (event.clipboardData || event.originalEvent.clipboardData).items;
			for (index in items){
				var item = items[index];
				gBody3.clipboard_file = item;				
				if (item.kind === "file"){					
					if (gBody3.check_top_menu()){
						return false;
					}					
					gBody3.retrieveImageFromClipboardAsBlob(event, function(imageBlob){
						 if(imageBlob){
							 var html = "";
					            html += "<div class='layer-result' id='chat_history_content' style='max-width:1000px; max-height:850px; left:50%;top:50%;transform:translate(-50%,-50%);'>";
					    		html += "	<h2>" + gap.lang.paste1 + "</h2>";
					    		html += "	<button class='ico btn-article-close'>닫기</button>";					    		
					    		html += "   <div style='width:100%; border-bottom : 1px solid #e6e2e2 ; padding-top:5px'></div>";					    		
					    		html += "<canvas style='max-width:1000px; max-height:500px' id='mycanvas_channel' />";					    		
					    	//	html += "<div class='layer layer-upload'>";
					    		html += "<div class='input-field' style='padding:5px 10px'>";
					    		html += "	<textarea class='formInput' style='max-height:68px; width:100%; padding-left:10px; border:1px solid #d9d9d9' id='fileupload_content_clipboard' placeholder='"+gap.lang.input_message+"'></textarea>";
					    		html += "	<span class='bar'></span>";
					    		html += "</div>";
					    	//	html += "</div>";					    			
					    		html += "<div class='right-bottom-btns' style='margin-bottom:15px; padding-top:15px; border-top: 1px solid #e6e2e2'>";
					    		html += "	<button id='go_paste_channel' style='height:32px'><span>" + gap.lang.go_paste + "</span></button>"
					    		html += "	<button id='go_cancel_channel'  style='height:32px' ><span>" + gap.lang.Cancel + "</span></button>";
					    		html += "</div>";					    		
					            html += "</div>";					            
					            $("#past_image_viewer_channel").html(html);				         
					            var canvas = document.getElementById("mycanvas_channel");
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
					            $('#past_image_viewer_channel').find('.btn-article-close').on('click', function() {
					            	$('#past_image_viewer_channel').empty();
					            	$('#past_image_viewer_channel').hide();
					            	gap.hideBlock();
					            });					           
					            $('#go_paste_channel').off();
					    		$('#go_paste_channel').on('click', function() {					    			
					    			 var mmx = $("#fileupload_content_clipboard").val();					    			
					    			 $('#past_image_viewer_channel').empty();       	
    				            	 $('#past_image_viewer_channel').hide();
    				            	 gap.hideBlock();    				            				            
    				            	 var oob = canvas.toDataURL('image/png');
    				            	 var ooo = gBody3.dataURItoBlob(oob);   				            	 
    				            	 ooo.name = "clipboard_image.png";     				            	
    				            	 myDropzone_channel.addFile(ooo);       				            	 
    				            	 myDropzone_channel.clipboardtext = mmx;
    				            	 myDropzone_channel.processQueue();		
					            });					    		
					    		$('#go_cancel_channel').off();
					    		$('#go_cancel_channel').on('click', function() {
					            	$('#past_image_viewer_channel').empty();
					            	$('#past_image_viewer_channel').hide();
					            	gap.hideBlock();
					            });				            
					            $("#past_image_viewer_channel").show();
					            var max_idx = gap.maxZindex();
					    		$('#past_image_viewer_channel')
					            .css({'width':'1100px','height':'400px','zIndex': parseInt(max_idx) + 1})
					            .show()
					            .position({
					                my: 'center',
					                at: 'center',
					                of: window
					            });
					            gap.showBlock();					            
					            var inx = parseInt(gap.maxZindex()) + 1;
					            $("#past_image_viewer_channel").css("z-index", inx);
					            $("#past_image_viewer_channel").show();
						 }
					});
				}else if (item.kind === 'string'){
					//var pastedData = e.originalEvent.clipboardData.getData('text');
					//$("#message_txt_channel").val($("#message_txt_channel").val() + pastedData);
				}
			}		
		});
	},
		
	"__event_save_reply" : function(){
		//댓글 저장하기
		$("#reply_save").on("click", function(e){			
			var content = $("#reply_content").val();
			var channel_name = $(e.currentTarget).attr("data");			
			//mention 처리 /////////////////////////////////////////////////////////////
			var mentions_msg = "";
			var mentions_data = "";
			$("#reply_content").mentionsInput('val', function(text){
				mentions_msg = gap.textMentionToHtml(text);;
			});
			$("#reply_content").mentionsInput('getMentions', function(data) {
				mentions_data = data;
			});		
			var data = JSON.stringify({
				"content" : mentions_msg,	//content,
				"mention" : mentions_data,
				"owner" : gap.userinfo.rinfo,
				"channel_data_id" : gBody3.xkey
			});			
			gBody3.tempData = data;		
			var url = gap.channelserver + "/save_reply.km";
			$.ajax({
				type : "POST",
				dataType : "text",
				url : url,
				data : data,
				success : function(ress){				
					var res = JSON.parse(ress);
					if (res.result == "OK"){
						$("#reply_content").val("");					
						//타켓 문서를 현재 창에서 제거하고 오늘의 마지막으로 이동시킨다... 댓글을 달면 최근 데이터로 업데이트 한다.
						var klen = $("#ms_" + gBody3.xkey).length;					
						var GMT = res.data.GMT;
						var GMT2 = res.data.GMT2;
						var rid = res.data.rid;						
						var date = gap.change_date_localTime_only_date(GMT);					
						if (klen > 0){							
							if (gBody3.post_view_type == "2"){								
							}else{
								var ccn = $("#web_channel_dis_"+date).parent().find('.xman').length;
								if (ccn > 0){
									var html = $("#ms_" + gBody3.xkey).get(0).outerHTML;							
									$("#ms_" + gBody3.xkey).remove();							
									var len = $("#web_channel_dis_"+date).length;
									if (len > 0){
										//오늘 날짜가 있는 것이다.
										//var len = $("#web_channel_dis_"+date).find('.xman').length;
										var len = $("#web_channel_dis_"+date).next().length;
										if (len == 0){
											//$(html).insertAfter($("#web_channel_dis_"+date).parent());
											$("#web_channel_dis_"+date).parent().append($(html));
										}else{
											$(html).insertAfter($("#web_channel_dis_"+date).parent().find('.xman').last());
										}										
									}else{
										//오늘 날짜 항목이 없다.
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
									gap.scroll_move_to_bottom_time("channel_list", 200);
								}else{
									//오늘 날짜 항목이 없다.
									var html = $("#ms_" + gBody3.xkey).get(0).outerHTML;									
									var dis_date = gap.change_date_default(gap.change_date_localTime_only_date(GMT));
									var datehtml = "";															
									datehtml += "<div class='date' id='web_channel_dis_"+date+"'><span>"+dis_date+"</span></div>";									
									var hx = $("#channel_list .user-thumb").length;
									if (hx == 0){
										$("#channel_list").html(datehtml);				
									}else{
										$(datehtml).insertAfter($("#channel_list .xman").children().last().parent());
									}			
									$("#ms_" + gBody3.xkey).remove();
									$(html).insertAfter($("#web_channel_dis_"+date).last());
								}
							}							
							//Dom객체를 짤라서 마지막에 추가했기 때문에 이벤트를 다시 정리해 줘야 한다.
							gBody3.__event_init_load();
						}						
						//원본의 날짜를 댓글을 저장한 시점의 GMT날짜로 변경해 줘야 한다.
						var time = "";
						if (GMT != GMT2){
							var GMT2_dis = gap.change_date_localTime_full2(GMT2);
							time = gap.change_date_localTime_only_time(GMT) + " (Created : " + GMT2_dis + ")";
						}else{
							time = gap.change_date_localTime_only_time(GMT);
						}						
						$("#ms_" + gBody3.xkey).find(".time").text(time);
						// mention div 영역 초기화 
					     gap.reset_mentions_div();					
						res.data.channel_code = gBody3.xcode;
						res.data.channel_name = channel_name;				
						gBody3.update_reply_list(res.data);						
						var obj = new Object();
						obj.channel_code = gBody3.xcode;
						obj.tempData = gBody3.tempData;
						res.data.channel_code = gBody3.xcode;
						obj.channel_name = gap.textToHtml(channel_name);
						obj.data = res.data;
						obj.type = "sr";
						obj.owner = gap.userinfo.rinfo;						
						obj.GMT = GMT;
						obj.GMT2 = GMT2;
						obj.rid = rid;
						var spx = JSON.parse(gBody3.tempData);
						spx.GMT = GMT;
						spx.rid = rid;
						obj.tempData = JSON.stringify(spx);					
						gBody3.send_socket(obj, "sr");					
						 //모바일  Push를 날린다. ///////////////////////////////////
						var smsg = new Object();
						smsg.msg = "[" + channel_name + "] " + gap.lang.reg_reply;
						smsg.title = gap.systemname + "["+gap.lang.channel+"]";		
						smsg.type = "sr";
						smsg.key1 = obj.channel_code;
						smsg.key2 = "";
						smsg.key3 = gBody3.select_channel_name2;
						smsg.fr = gap.userinfo.rinfo.nm;
						//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
						smsg.sender = gBody3.search_cur_channel_member(obj.channel_code).join("-spl-");					
						//gap.push_noti_mobile(smsg);			
						////////////////////////////////////////////////////		
						
						//알림센터에 푸쉬 보내기
						var rid = obj.channel_code;
						var receivers = smsg.sender.split("-spl-");
						var msg2 = "[" + gap.textToHtml(channel_name) + "] " + gap.lang.reg_reply;
						var sendername = "["+gap.lang.channel+" : "+ gap.textToHtml(channel_name) +"]"
						gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);				
					}else{
						gap.gAlert(gap.lang.errormsg);
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
				}
			});			
		});
	},
	
	"file_convert_manual" : function(){
		
	},
	
	"file_convert" : function(fserver, fname, md5, item_id, ty, ft, email, upload_path){		
		
		gBody3.callsys = ty;
		var islog = true;
		//미리보기 로그를 남겨야 한다. 하단에 file_info.km을 호출하는 경우 해당 함수에서 log:T인 경우 처리하기 되어 있어 추가하지 않는다.
		var log = new Object();
		log.fserver = fserver;
		log.filename = fname;
		log.md5 = md5;
		log.item_id = item_id;
		log.ty = ty;
		log.ft = ft;
		log.email = email;
		log.upload_path = upload_path;
		log.actor = gap.userinfo.rinfo;
		log.action_os = "PC";
		//////////////////////////////////////////////////////////////////////////////	
		var filePath = "";
		if (ty == "todo"){				
			if (gap.isDev){			
				filePath = gap.synapserver + gap.filesepa + fname.replace(gap.synapserver,"") + gap.filesepa + md5 + "." + ft;	
			}else{
				filePath = gap.synapserver + gap.filesepa + fname.replace(gap.nasfolder,"") + gap.filesepa + md5 + "." + ft;	
			}					
			log.action = "todo";
			log.filename = upload_path;
			log.upload_path = fname;
			log.fserver = email;		
		}else if (ty == "manual"){
			filePath = gap.synapserver + gap.filesepa + "upload"+gap.filesepa+"manual"+ gap.filesepa + upload_path + gap.filesepa + fname;	
			islog = false;			
		}else if (ty == "collect"){			
			var year = upload_path.substring(0,4);
			if (item_id == "response"){
				filePath = gap.synapserver + gap.filesepa +"upload"+gap.filesepa+"collect"+ gap.filesepa + year + gap.filesepa + upload_path + gap.filesepa + "response" + gap.filesepa + fname;
			}else{
				filePath = gap.synapserver + gap.filesepa + "upload"+gap.filesepa+"collect" + gap.filesepa + year + gap.filesepa + upload_path + gap.filesepa + fname;
			}
			log.action = "collect";			
		}else if (ty == "chat"){
			var inx = fname.indexOf("/filedown");
			var inx2 = fname.substring(inx+9, fname.length).lastIndexOf("/");
			var subpath = fname.substring(inx+9, fname.length).substring(0, inx2);
			subpath = subpath.replace(/\//gi, "\\\\");				
			if (gap.isDev){		
				filePath = gap.synapserver + gap.filesepa + "vol_epchat"+gap.filesepa+"data"+gap.filesepa+"upload_root" + subpath;
			}else{			
				filePath = gap.synapserver.replace("dswsynap","dswchat") + gap.filesepa + "data"+gap.filesepa+"upload_root" + subpath;				
				if (ft == "1" || ft == "3"){
					filePath = gap.synapserver + gap.filesepa + "vol_epchat"+gap.filesepa+"data"+gap.filesepa+"upload_root" + subpath;
				}
			}			
			log.upload_path = fname;
			log.filename = upload_path;
			log.md5 = md5;
			log.action = "chat";
		}else if (ty == "reply"){
			filePath = gap.synapserver + gap.filesepa + "upload"+gap.filesepa+ email + gap.filesepa  + upload_path + gap.filesepa + md5 + "." + ft;			
			log.upload_path = upload_path;
			log.filename = fname;
			log.md5 = md5;
			log.action = "reply";
		}else if (ty == "notice"){
			var file_ext = fname.substr(fname.lastIndexOf('.') + 1);
			filePath = gap.synapserver + gap.filesepa + "upload" + gap.filesepa + "notice" + gap.filesepa + email + gap.filesepa + upload_path + gap.filesepa + md5 + "." + file_ext;	
		}else{
			
			islog = false;
			//정보를 가져오지 못해서 찾아서 설정한다.
			var surl = gap.channelserver + "/file_info.km";
			var postData = {
				"id" : item_id,
				"md5" : md5,
				"ty" : ty,
				"log" : "T",
				"actor" : gap.userinfo.rinfo,
				"fname" : fname				
			};	
			$.ajax({
				type : "POST",
				url : surl,
				async : false,
				dataType : "json",
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){					
						var file_info = res.data;												
						//3 - 즐겨찾기 : dpath = dir + "/favorite/" + sdoc.getString("email") + "/" + sdoc.getString("upload_path") + "/" + sdoc.getString("md5") + "." + sdoc.getString("file_type");
						//2 - 채널 : dpath = dir + "/" + sdoc.getString("email") + "/" + sdoc.getString("upload_path") + "/" + xdoc.getString("md5") + "." + xdoc.getString("file_type");
						//1 - 드라이비 : dpath = sdoc.getString("fpath") + "/" + sdoc.getString("md5") + "." + sdoc.getString("file_type");
						//todo : dir + "/todo/" + id + "/" + xdoc.getString("md5") + "." + xdoc.getString("file_type");						
						if (gBody3.callsys == "1"){
							//드라이브인 경우
							filePath = gap.synapserver + gap.filesepa+ file_info.fpath.replace(gap.nasfolder,"").replace(gap.synapserver, "") + gap.filesepa + file_info.md5 + "." + file_info.file_type;	
						}else if (gBody3.callsys == "2"){
							//채널
							filePath = gap.synapserver + gap.filesepa + "upload" + gap.filesepa + file_info.owner.ky + gap.filesepa + file_info.upload_path + gap.filesepa + file_info.md5 + "." + file_info.file_type;	
						}else if (gBody3.callsys == "3"){
							//즐겨찾기
							filePath = gap.synapserver + gap.filesepa + "upload"+gap.filesepa+"favorite"+ gap.filesepa + file_info.email + gap.filesepa + file_info.upload_path + gap.filesepa + file_info.md5 + "." + file_info.file_type;	
						}			
						if (gBody3.callsys == "todo"){
							gap.hide_loading2();
						}else if (gBody3.call_system == "admin"){
						}else{
							gap.hide_loading();
						}
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
		}
		
		if (islog){
			//로그를 서버에 전송한다.		
		//	if (gBody3.call_system == "admin"){
				//관리자 모듈에서 보는 로그는 기록하지 않는다.
		//	}else{
				var surl = gap.channelserver + "/preivew_log.km";			
				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(log),
					success : function(res){
					},
					error : function(e){}
				});
		//	}		
		}		
		//gap.call_synap(md5, filePath, fname, "F");		
		
		
		
		return false;					
	},
	
	"isNumberic" : function(data){
		return !isNaN(data);
	},
	
	"update_reply_list" : function(info){
		var GMT = info.GMT;
		var GMT2 = info.GMT2;
		var rid = info.rid;		
		var inn = "";
		if ( (typeof(info.edit) != "undefined") && (info.edit == "T")){
			inn = info.tempdata;
		}else{
			inn = JSON.parse(gBody3.tempData);
		}
		var channel_data_id = inn.channel_data_id;
		var channel_code = info.channel_code;
		var channel_name = info.channel_name;
		//Content 메인 창에서 응답 추가하는 소스
		var user_photo = gap.person_profile_photo(inn.owner);
		var user_info = gap.user_check(inn.owner);
		var name = user_info.name;
		var content = inn.content;		
		var time = gap.change_date_localTime_full2(GMT);					
//		var message = gap.aLink(content);   //http자동 링크 걸기						
//		message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
//	//	message = message.replace(/[\n]/gi, "<p style='height:5px'></p>");
//		message = message.replace(/[\n]/gi, "<br>");
//		message = message.replace(/\s/gi, "&nbsp;");				
		//줄바꿈 http링크 모두 처리한 다음 리턴해준다.
		var message = gBody3.message_check(content);		
		if (message.indexOf("&lt;/mention&gt;") > -1){
			//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
			message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
		}		
		if (message == ""){
			message = "&nbsp;";
		}		
		var html = "";
		html += "<dl id='mreplay_"+info.rid+"'>";
		html += "	<dt>";
		html += "		<div class='user'>";
	//	html += "			<div class='user-thumb' data='"+inn.owner.ky+"'><img src='"+user_photo+"' alt=''></div>";
		html += "			<div class='user-thumb' data='"+inn.owner.ky+"'>"+user_photo+"</div>";
		html += "		</div>";
		html += "	</dt>";
		html += "	<dd>";
	//	html += "		<span>"+name+"<em>"+time+"</em></span>";
		html += "		<span>"+user_info.disp_user_info+"<em>"+time+"</em></span>";	
		if (inn.owner.em.toLowerCase() == gap.userinfo.rinfo.em.toLowerCase()){
		//	html += "<button class='btn-reply-del' style='margin-left:10px' data='"+inn.channel_data_id+"' data2='"+info.rid+"' data3='"+channel_code+"'><span>삭제</span></button>";
			html += "<button class='btn-reply-more' data='"+inn.channel_data_id+"' data2='"+info.rid+"' data3='"+channel_code+"' data4='"+channel_name+"'><span class='ico ico-reply-more'></span></button>";
			
		}
		html += "		<p>"+message+"</p>";
		html += "	</dd>";
		html += gBody3.file_infos_draw(info);	
		html += "</dl>";	
		var id = inn.channel_data_id;
		if ($("#ms_" + id + " .message-reply").length >0){
			$("#ms_" + id + " .message-reply").append(html);
		}else{
			//기존에 댓글이 없는 상태에서 처음 댓글을 추가하는 경우
			//보기 옵션에서 댓글 펼치기 또는 접기 옵션에 따라 추가되어야 한다.		
			var xhtml = "";
			xhtml += "<span class='fold-btns repdis'>";
			if (gBody3.isFold){
				xhtml += "	<button class='btn-reply-expand' data='"+id+"'><span>"+gap.lang.reply + " " + gap.lang.ex+"</span> (<span id='rcount_"+id+"'>1</span>)</button>";
			}else{
				xhtml += "	<button class='btn-reply-fold' data='"+id+"'><span>"+gap.lang.reply + " " + gap.lang.fold+"</span> (<span id='rcount_"+id+"'>1</span>)</button>";
			}
			xhtml += "</span>";
			if (gBody3.isFold){
				xhtml += "<div class='message-reply' style='display:none' id='reply_group_"+id+"'>";
			}else{
				xhtml += "<div class='message-reply' id='reply_group_"+id+"'>";
			}			
			xhtml += html;
			xhtml += "</div>";
		//	$(xhtml).insertBefore($("#ms_" +id).find(".message-btns"));
			$(xhtml).insertBefore($("#ms_" +id).find(".channel_reply_top"));
		}	
		//접고 펼치기 기능을 주기 위해서 이벤트를 호출한다.ㄴ
		gBody3.__event_init_load();	
		var html = "";
		//우측 응답 화면에 추가하는 소스
		html += "<dl id='reply_"+info.rid+"'>";
		html += "	<dt>";
		html += "		<div class='user'>";
	//	html += "			<div class='user-thumb' data='"+inn.owner.ky+"'><img src='"+user_photo+"' alt=''></div>";
		html += "			<div class='user-thumb' data='"+inn.owner.ky+"'>"+user_photo+"</div>";
		html += "		</div>";
		html += "	</dt>";
		html += "	<dd>";
		html += "		<span>"+name+"<em>"+time+"</em></span>";		
		if (inn.owner.em.toLowerCase() == gap.userinfo.rinfo.em.toLowerCase()){
			html += "<button class='btn-reply-more' data='"+inn.channel_data_id+"' data2='"+info.rid+"' data3='"+channel_code+"' data4='"+channel_name+"'><span class='ico ico-reply-more'></span></button>";
		}	
		html += "		<p>"+message+"</p>";
		html += "	</dd>";
		html += "</dl>";		
		$("#rlist .mCSB_container").append(html);		
		$("#rlist").mCustomScrollbar("update");		
		if (gBody3.prevent_auto_scrolling == 2){
		//	$("#rlist").mCustomScrollbar("scrollTo", "bottom");
		}
		var cnt = $("#ms_"+id).find(".message-reply").children().length;		
		$("#rdis_"+id).text( cnt  );
		$("#rcount_" + id).text(cnt);
		$(".comment").parent().find("h2 span").text("(" + cnt + ")");	
		$(".btn-reply-del").off();
		$(".btn-reply-del").on("click", function(e){
			gBody3.delete_reply(this);
		});		
		gBody3.__draw_reply_event();		
	},
	
	"check_member_top_height" : function(){
		var h = $("#member_info_dis").height();
		if ($("#member_info_dis").length == 0){
			h = 0;
		}
		var h2 = $(".owner-info").height();		
		if (typeof(h2) == "undefined"){
			h = 40;
			//$(".owner-info").hide();
		}else{
			//$(".owner-info").show();
			//h = $("#member_info_dis").height() + ;
			if (gBody3.check_top_menu_new()){
				h = 30;
			}else{
				var hk = (parseInt(h) + parseInt(h2));
				if (h == 0){
					h = hk + 400;
				}else{
					h = hk + 50;
				}
			}		
		}
		return h;
	},	
	
	"draw_file_detail" : function(info){
		$("#sub_channel_content").css("width", "calc(100% - 315px)");
		$("#main_body").css("width", "");   //댓글이 열릴때 가운데 컨텐츠 창을 줄여야 우측 프레임이 열린다.	
		$("#channel_right").show();
	//	gRM.box_layer_close(); //우측 프레임을 연다   / 채널 전체 보기에서 파일 상세 클릭시 열리지 않아 주석 처리한다.		
		//미리보기 창이 떠 있는 경우 숨긴다.
		$("#channel_file_layer_close").click();		
		var oob = new Object();
		oob.filename = info.filename;
		oob.fserver = info.fserver;
		oob.upload_path = info.upload_path;
		oob.md5 = info.md5;
		oob.email = info.email;
		oob.ty = info.file_type;
		oob.id = info._id.$oid;
	//	gBody3.select_file_info = info;
		gBody3.select_file_info = oob;		
		if ($("#right_menu_collpase_btn").hasClass("on")){
			$("#right_menu_collpase_btn").click();
		}		
		var owner_img = gap.person_profile_photo(info.owner);
		var dis_date = gap.change_date_localTime_full2(info.GMT);		
		var filename = info.filename;	
		var size = gap.file_size_setting(parseInt(info.file_size.$numberLong));	
		var h = 1;		
		var user_info = gap.user_check(info.owner);
		var name = user_info.name;
		var html = "";
		html += "<div class='detail-info' id='detail_info_dis' style='height:calc(100% - "+h+"px); margin-top:5px'>";
		if (info.thumbOK == "T"){
			html += "<button class='ico btn-file-view' id='detail_file_info_preview' style='width:16px;height:16px;position:absolute;top:20px;right:45px;background-position: -652px -20px;'>미리보기</button>";
		}		
		html += "<button class='ico btn-right-close' id='detail_file_info_close'>닫기</button>";
		html += "<dl class='owner'>";
		html += "	<dt>";
		html += "		<div class='user'>";
		html += "			<div class='user-thumb showorg' data='"+info.owner.ky+"'>"+owner_img+"</div>";
		html += "		</div>";
		html += "	</dt>";
		html += "	<dd>";
		html += "		<span>"+name+"</span>";
		html += "		<div class='date'>"+dis_date+"</div>";
		html += "	</dd>";
		html += "</dl>";
		html += "<div class='file-info'>";
		if (info.thumbOK == "T"){
			var thumbnail_url = gap.search_file_convert_server(info.fserver) + "/FDownload_thumb.do?id=" + info._id.$oid + "&md5="+info.md5+"&ty=2";
			html += "	<div class='file-thm'>";
			html += "		<img src='"+thumbnail_url+"' alt='' />";
			html += "	</div>";
		}
		if ( (typeof(info.meta) != "undefined") && (info.meta != "")){			
			html += "	<button class='ico btn-detail-open'>펼치기</button> <!-- 접기 : .btn-detail-close 20200922 -->";
			html += "	<a >"+filename+"<span>&nbsp;("+size+")</span></a>";
			html += "	<div class='file-info-detail'>";
			html += "		<table>";
			html += "			<tbody>";			
		//	var metainfo = JSON.parse(info.info.meta);
			var metainfo = JSON.parse(info.meta);
			var file_type = gap.is_file_type(filename);
			metainfo.size = size;
			html += gap.draw_file_info(metainfo, file_type);			
			html += "			</tbody>";
			html += "		</table>";
			html += "	</div>";
		}else{
			html += "	<a>"+filename+"<span>&nbsp;("+size+")</span></a>";			
		}				
		html += "</div>";	
		var replydata = info.reply;
		if (replydata != null){
			replydata.channel_name = info.channel_name;
			replydata.channel_code = info.channel_code;		
		}		
		html += "</div>";		
		$("#user_profile").hide();
		$("#chat_profile").hide();
		$("#detail_info_dis").remove();
		$(".channel-right-reply").remove();		
		$("#channel_right").empty();
		$("#channel_right").append(html);		
		$(".user-thumb.showorg").off().on("click", function(e){
			var ky = $(e.currentTarget).find("img").data("key");
			gap.showUserDetailLayer(ky);
		});		
		gBody3.__event_save_reply();		
		$("#detail_file_info_close").off();
		$("#detail_file_info_close").on("click", function(e){			
			if (gBody3.right_window_open){
				//멤버창이 오픈되어 있는 상태에서 댓글을 작성하고 닫은 경우
				gBody3.draw_channel_members(gBody3.cur_opt);				
			}else{
				gBody3.channel_right_frame_close();
			}
		});		
		
		$(".file-info .btn-detail-open").off();
		$(".file-info .btn-detail-open").on("click", function(e){			
			if ($(this).attr("class") == "ico btn-detail-open"){
				$(".file-info-detail").fadeOut();
				$(this).attr("class", "ico btn-detail-close");
			}else{
				$(".file-info-detail").fadeIn();
				$(this).attr("class", "ico btn-detail-open");
			}
		});		
		
		$(".user .user-thumb").off();
		$(".user .user-thumb").on("click", function(e){	
			gBody3.click_img_obj = this;	  
    	  	var uid = $(this).attr("data");
        	_wsocket.search_user_one_for_popup(uid);  
		});		
		
		$(".btn-reply-del").off();
		$(".btn-reply-del").on("click", function(e){
			gBody3.delete_reply(this);
		});		
		
		$("#detail_file_info_preview").off();
		$("#detail_file_info_preview").on("click", function(e){		
			var info = gBody3.select_file_info;
			//일반 파일 미리 보기 클릭 한  경우										
			var filename = info.filename;
			var fserver = info.fserver;
			var upload_path = info.upload_path;
			var md5 = info.md5;
			var email = info.email;
			var ty = info.ty;
			var id = info.id;
			if (ty == "mp4"){	
				//var download_url = fserver + "/FileDownload.do?em=" + email + "&fd=" + upload_path + "&ty=1&m5=" + md5 + "&fn=" + encodeURIComponent(filename);
				var download_url = gap.search_file_convert_server(fserver) + "/FDownload.do?id=" + id + "&ty=2&md5=" + md5;
				gap.show_video(download_url, filename);					
			}else{				
			//	var id = $(this).parent().parent().parent().attr("id").replace("msg_file_","");
				var id = id;
				var ft = ty;			
				var obj = new Object();
				obj.id = id;
				obj.md5 = md5;
				obj.ty = "2";
				obj.filename = filename;
				obj.fserver = fserver;
				gBody3.click_file_info =  obj;				
				var fs = gap.server_check(fserver);
				gBody3.file_convert(fs, filename, md5, id, "2", ft, email, upload_path);						
			}		
			return false;
		});		
		//댓글 저장하기	
	},	
	
	"delete_reply" : function(obj){	
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
					$("#mreplay_" + reply_id).remove();
					$("#reply_" + reply_id).remove();					
					var id = channel_data_id;					
					var cnt = $("#ms_"+id).find(".message-reply").children().length;					
					if (cnt == 0 ){
						$("#ms_"+id).find(".message-reply").remove();
					}				
					$("#r_"+id).next().text( cnt  );
					$("#rcount_" + id).text(cnt);
					$(".comment").parent().find("h2 span").text("(" + cnt + ")");						
					//응답 개수를 다시 계산해야 한다.					
					var obj = new Object();
					obj.reply_id = reply_id;
					obj.id = channel_data_id;
					obj.channel_code = channel_code;
					obj.channel_name = gap.textToHtml(channel_name);
					gBody3.send_socket(obj, "dr");
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});		
	},	
	
	"draw_reply_memo" : function(replydata, ty){
		var lists = replydata.reply;	
		var html = "";		
		if (ty == "1"){
			html += "<div class='channel-right-reply' style='display:block;'>";
		}else if (ty == "2"){
			var cnt = $("#member_info_dis").length;			
			var h = gBody3.check_member_top_height();			
				html += "<div class='channel-right-reply' style='display:block; margin: 0px 10px 0 0; height:calc(100% - 1px)'>";				
		}	
		if ( (typeof(lists) != "undefined") && (lists != null)){
			html += "<h2>"+gap.lang.reply+" <span>("+lists.length+")</span></h2>";			
			html += "<div id='rlist' style='height: calc(100% - 150px)'>"
			for (var i = 0 ; i < lists.length; i++){
				var info = lists[i];
				var user_photo = gap.person_profile_photo(info.owner);
				var user_info = gap.user_check(info.owner);
				var name = user_info.name;
				var content = info.content;				
				var time = gap.change_date_localTime_full2(info.GMT);				
				var message = gBody3.message_check(info.content);				
				if (message.indexOf("&lt;/mention&gt;") > -1){
					//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
					message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
				}										
				html += "<dl id='reply_"+info.rid+"'>";
				html += "	<dt>";
				html += "		<div class='user'>";
				html += "			<div class='user-thumb' data='"+info.owner.ky+"'>"+user_photo+"</div>";
				html += "		</div>";
				html += "	</dt>";
				html += "	<dd>";
				html += "		<span>"+name+"<em>"+time+"</em></span>";
				if (info.owner.em.toLowerCase() == gap.userinfo.rinfo.em.toLowerCase()){				
				//	html += "<button class='btn-reply-del' style='margin-left:10px' data='"+info.channel_data_id+"' data2='"+info.rid+"' data3='"+gBody3.xcode+"' data4='"+replydata.channel_name+"'><span>삭제</span></button>";
					html += "<button class='btn-reply-more' data='"+info.channel_data_id+"' data2='"+info.rid+"' data3='"+gBody3.xcode+"' data4='"+replydata.channel_name+"'><span class='ico ico-reply-more'></span></button>";
				}
				html += "		<p style='max-width:200px'>"+message+"</p>";
				html += "	</dd>";
				html += "</dl>";
			}			
			html += "</div>";
		}else{
			html += "<h2>"+gap.lang.reply+" <span>(0)</span></h2>";			
			html += "<div id='rlist' style='height: calc(100% - 150px)'>";
			html += "</div>";				
		}		
		html += "<div class='comment'>";
		html += "	<textarea placeholder='"+gap.lang.input_replay+"' id='reply_content'></textarea>";
		html += "	<button class='btn-comment' id='reply_save' data='"+replydata.channel_name+"'>"+gap.lang.save_reply+"</button>";
		html += "</div>";	
		return html;
	},

	"download_url_check" : function(item){
		//http://files.kmslab.com:8080/WMeet/FileDownload.do?em=ygkim@kmslab.com&fd=20201026173457_HHDTOEVK2H5OJDI&m5=fc115fdbe6510050065d45628d580e19.255795&fn=(10%EC%9B%9426%EC%9D%BC%20%EB%B0%B0%EC%9B%80%20%EA%BE%B8%EB%9F%AC%EB%AF%B8).pdf
		var url = "";
		return url;
	},
	
	"check_preview_file" : function(file){
		var reg = /(.*?)\.(ppt|pptx|xls|xlsx|doc|docx|pdf|hwp|txt|zip|csv)$/;
	  	if(file.toLowerCase().match(reg)) {
			return true;
		} else {
			return false;
		}
	},
	
	"draw_msg" : function(item, type, date){
		var html = "";		
		var uinfo = gap.userinfo.rinfo;			
		var docid = "";			
		var is_owner_delete = false;
		if (item.owner_delete && item.owner_delete == "T"){
			is_owner_delete = true;
		}
		//작성 권한 체크
		var is_compose_auth = gap.checkAuth();
		
		var like_count = 0;		
		if (item.direct == "T"){
			docid = item._id;
			
		}else{
			if (typeof(item._id) != "undefined"){
				docid = item._id.$oid;
			}else{
				docid = item.id;
			}			
			if (typeof(item.like_count) != "undefined"){
				if (typeof(item.like_count.$numberLong) != "undefined"){
					like_count = item.like_count.$numberLong;
				}else{
					like_count = item.like_count;
				}
			}else{
				like_count = 0;
			}		
		}		
		html += "<div class='xman' id='ms_"+docid+"' data='"+date+"'>";		
		if (item.email.toLowerCase() == uinfo.em.toLowerCase()){
			html += "<div class='me'>";
		}else{
			html += "<div class='you'>";
		}		
		//var person_img = item.owner.pu;
		var person_img = gap.person_profile_photo(item.owner);
		var user_info = gap.user_check(item.owner);
		var name = user_info.name;
		var deptname = user_info.dept;
		var time = gap.change_date_localTime_only_time(item.GMT);	
		var messagex = item.content;
		var rcount = messagex.split(/\r\n|\r|\n/).length;
		var mcount = messagex.length;
		var rdis = false;
		if ( (rcount > 10) || (mcount > 800)){
			rdis = true;
		}		
		var message = gBody3.message_check(messagex);	
		if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){
			var editor_html = item.editor.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
			message = message + editor_html;
		}		
		if (message.indexOf("&lt;/mention&gt;") > -1){
			//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
			message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
		}		
		html += "	<div class='user'>";
		html += "		<div class='user-thumb showorg' style='cursor:pointer' data='"+item.owner.ky+"'>"+person_img+"</div>";
		html += "	</div>";
		html += "	<div class='talk'>";
		html += "	<br />";
		html += "		<div class='wrap-message'> <!-- wrap-message 감싸기 -->";
		html += "			<div class='balloon'> <!-- 20200106 -->";
		html += "				<div>";
		html += "					<span class='name'>"+name+" "+user_info.jt+"<em class='team'>"+deptname+"</em>";
		if (typeof(item.GMT2) == "undefined"){
			item.GMT2 = item.GMT;
		}
		if (item.GMT != item.GMT2){
			var GMT2 = gap.change_date_localTime_full2(item.GMT2);
			html += "						<em class='time' id='update_time_"+docid+"'>"+time+" (Created : " + GMT2 + ")</em>";
		}else{
			html += "						<em class='time' id='update_time_"+docid+"'>"+time+"</em>";
		}		
		html += "					</span>";		
		if (item.channel_code != gBody3.cur_opt){
			html += "                   <span class='channel-name' data-key='"+item.channel_code+"' style='cursor:pointer'>"+item.channel_name+"</span>";
		}		
		if (!is_owner_delete){
			if (type == "emoticon"){
				html += "                   <div class='img-thumb2'><img src='" +item.epath+"'></div>";
			}	
		}
	
		//스케줄 아이디가 있는 경우 컨텐츠를 삭제할때 통합회의쪽에 데이터도 삭제하라고 호출해주어야 한다.
		var scheduleid = "";		
		var isNotice = false;
		
		if (is_owner_delete){
			html += "<p>" + gap.owner_delete_msg(item.delete_owner, item.delete_owner_time) + "</p>";
		}else if ((item.tyx) && item.tyx == "notice"){
			isNotice = true;
			var images = new Array();
			var normalfiles = new Array();			
			var show_file = false
			if (item.info){
				show_file = true;
				var files = item.info;				
				for (var i = 0 ; i < files.length; i++){
					var file = files[i];
					var isImage = gap.check_image_file(file.filename);
					if (isImage){
						images.push(file);
					}else{
						normalfiles.push(file);
					}
				}
			}
			var subj = item.content;
			var callty = "normal";
			if (item.editor && item.title != ""){
				subj = item.title;
			}else if (item.editor){
				subj = item.editor;
			}else if (item.ex){
				subj = item.ex.title;
				callty = item.ex.type;
			}			
			html += '<div class="top">';
			html += '   <div class="req_box" id="req_'+docid+'" style="display:flex">';
			html += '   		<div class="req_left" style="width:500px; display:flex">';
			html += '   			<div class="notice-msg-icon" style="width:62px;"></div>';
			html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
			html += '           			<h3>' + gap.lang.mn3 + '</h3>';
			html += '						<span class="req_txt">' + subj + '</span>';
			if (show_file){
				html += '           			<span class="bot flex text-ico" style="border-radius:0px; border-top:none; padding:5px;">';
				html += '							<span class="notice-msg-img-ico" style="margin-top:2px;"></span><span>' + images.length + '</span>';
				html += '							<span class="notice-msg-attach-ico" style="margin-top:2px; margin-left:10px;"></span><span>' + normalfiles.length + '</span>';
				html += '           			</span>';
			}
			html += '           		</div>';
			html += '   		</div>';
			
			var kdocid = docid;
			if (item.notice_id){
				kdocid = item.notice_id;
			}
			if (callty == "vote"){				
				var _vote = item.ex;
				var _info = {
						"key" : _vote.key,
						"title" : _vote.title,
						"comment" : _vote.comment,
						"endtime" : _vote.end_date + ' ' + _vote.end_time,
						"anonymous" : _vote.anonymous_vote,
						"multi" : _vote.multi_choice,
						"owner" : item.ky
				};				
				var vinfo = JSON.stringify(_info);
				html += '   		<button type="button" data-vote=\'' + JSON.stringify(JSON.stringify(_info)) + '\' class="req_btn" data-type="notice_vote" style="margin-right:10px">'+gap.lang.view_detail+'</button>';
			}else if (callty == "aprv"){
				html += '   		<button type="button" data-url=\'' + item.ex.link + '\' class="req_btn" data-type="notice_aprv" style="margin-right:10px">'+gap.lang.view_detail+'</button>';
			}else if (callty == "bbs"){
				var _bbs = item.ex;
				html += '   		<button type="button" data-url=\'' + item.ex.link + '\' class="req_btn" data-type="notice_bbs" style="margin-right:10px">'+gap.lang.view_detail+'</button>';
			}else{
				html += '   		<button type="button" class="req_btn" data-type="notice" data="'+kdocid+'" style="margin-right:10px">'+gap.lang.view_detail+'</button>';
			}
			
			html += '   </div>';
			html += '</div>';
		}else if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){
			if (typeof(item.ty) == "undefined"){
				if (gBody3.collapse_editor == "1"){
					//에디터로 작성된 내용의 본문을 자동으로 접기 하겠다는 옵션
					html += "<h3>"+item.title+"  <span class='fold-btns editor' data-key='"+docid+"' style='display:inline-block; width:100px'><button class='btn-editor-expand'>"+gap.lang.expand_editor+"</button></span></h3> ";
					html += "<div class='wrap-editor-area' style='display:none; overflow:auto'>";
					html += "					<p id='p_"+docid+"'>"+message+"</p>";
					html += "</div>";
				}else{
					html += "<h3>"+item.title+"  <span class='fold-btns editor' data-key='"+docid+"' style='display:none; width:100px'><button class='btn-editor-fold'>"+gap.lang.expand_editor+"</button></span></h3> ";
					html += "<div class='wrap-editor-area' style='overflow:auto'>";
				
					html += "					<p id='p_"+docid+"'>"+message+"</p>";
					html += "</div>";
				}
			}
		}else if (typeof(item.ex) != "undefined" && (item.ex.type == "meet")){		
			scheduleid = item.ex.scheduleid;
			html += "					<p>"+message+"<span class='meet_invite' data-id='"+item.ex.scheduleid+"' data-type='"+item.ex.meet_type+"'>"+gap.lang.meetdetail+"</span></p>" + "";
		}else{
			if (rdis){
				html += "					<p id='p_"+docid+"' class='msg-fold'>"+message+"</p>";
				html += "						<span class='fold-btns' style='cursor:pointer'><button class='btn-expand'><span>"+gap.lang.expand+"</span></button></span>";
			}else{
				html += "					<p id='p_"+docid+"'>"+message+"</p>";
			}
		}	
		
		if (!is_owner_delete){
			//ogtag가 있는지 체크한다.		
			if ((typeof(item.og) != "undefined") && (typeof(item.og.msg) != "undefined") ){			
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
					html += "<div class='link-content'>";
					html += "	<a href='"+url+"' target='_blank'>";				
					var im = gap.og_url_check(imgurl);
					if (typeof(title) == "undefined"){title = "";}
					if (typeof(desc) == "undefined"){desc = "";}
					if (typeof(dmn) == "undefined"){dmn = "";}				
					html += "	<div class='link-thumb'>"+im+"</div>";
					html += "	<ul>";
					html += "		<li class='link-title'>"+title+"</li>";
					html += "		<li class='link-summary'>"+desc+"</li>";
					html += "		<li class='link-site'>"+dmn+"</li>";
					html += "	</ul>";
					html += "	</a>";
					html += "</div>";
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
					var date = "";				
					if (typeof(item.ex.date) != "undefined"){
						date = item.ex.date;
					}			
					if (typeof(item.ex.attach) != "undefined"){
						var attach_list = item.ex.attach.split("*?*");
						var attach_size = item.ex.attachsize.split("*?*");
						var target_server = item.ex.target_server;
						var acount = 0;
						if (item.ex.attach != ""){
							acount = attach_list.length;
						}					
						html += "<div class='chat-mail'>";
						html += '<div class="top">';
						html += '   <div class="req_box" style="display:flex">';
						html += '   		<div class="req_left" style="width:500px; display:flex">';
						html += '   			<div class="req_icon" style="background-position: -9px -413px; width:62px; border-radius:20px"></div>';
						html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
						html += '           			<h3>' + title + '</h3>';
						if (date != ""){
							html += '						<span class="req_txt">'+from+ ' / ' + date +'</span>';
						}else{
							html += '						<span class="req_txt">'+from +'</span>';
						}					
						html += '           		</div>';
						html += '   		</div>';
						html += '   		<button type="button" class="req_btn" data-type="mail" data-t1="'+tunid+'" data-t2="'+tdb+'" data-t3="'+target_server+'" style="margin-right:10px">'+gap.lang.openNewWin+'</button>';					
						if (acount > 0){
							html += "	<div class='mail-attach-list' style='border-radius:0px'>";
							html += "		<button class='ico btn-fold'>접기</button> <!-- 클릭 시 .on 클래스 토글 -->";
							html += "		<h4>"+gap.lang.attachment+" <span>"+acount+"</span></h4>";
						//	html += "		<button class='btn-save-all'><span>모두저장</span></button>";
							html += "		<ul style='list-style:none'>";						
							for (var i = 0 ; i < attach_list.length ; i++){
								var attname = gap.textToHtml(attach_list[i]);
								var attsize = attach_size[i];
								var icon = gap.file_icon_check(attname);
								var target_server = item.ex.target_server;
								
								html += "			<li data-target='"+target_server+"' data-tunid='"+tunid+"' data-attname='"+attname+"' data-tdb='"+tdb+"' onclick=\"gBody3.mail_file_down2(this)\"><span class='ico ico-attach "+icon+"'></span><span>"+attname+"</span> <em>("+gap.file_size_setting(attsize)+")</em>";
							//	html += "			<li onclick=\"gBody3.mail_file_down('"+target_server+"', '"+tunid+"','"+attname+"', '"+tdb+"')\"><span class='ico ico-attach "+icon+"'></span><span>"+attname+"</span> <em>("+gap.file_size_setting(attsize)+")</em>";
							//	html += "				<button class='ico btn-download'>저장</button>";
								html += "			</li>";
							}
							html += "		</ul>";
							html += "	</div>";
						}				
						html += '   </div>';				
						html += '</div>';					
						html += '</div>';				
					}				
				}else if (item.ex.type == "todo"){
					var xinfo = item.ex;				
					var ux = gap.user_check(xinfo.owner);  //나중에 asign.pu로 변경해야 한다.
				//	var asign_img = gap.person_photo(ux.pu);
					var asign_img = gap.person_profile_photo(ux);				
					var member_name = ux.name;
					var dept = ux.dept;
					var email = ux.email;
					var jt = ux.jt;				
					var todo_item_id = xinfo._id.$oid;				
					html += '<p class="xnewtodo">' +gap.lang.newtodo + '</p>';				
					html += '<div class="top">';
					html += '   <div class="req_box"  style="display:flex" data-url=\'' + todo_item_id + '\'>';
					html += '   		<div class="req_left" style="width:500px; display:flex">';
					html += '   			<div class="req_icon" style="background-position: -111px -414px; width:62px; border-radius:20px"></div>';
					html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
					html += '           			<h3>['+xinfo.project_name+'] '+xinfo.title+'</h3>';
					html += "						<div class='user-chat f_middle' style='padding:0px'>";
					html += "							<div class='user' style='position:absolute; top:-5px; left:-10px; width:55px; height:55px'>";
					html += "								<div class='photo-wrap' style='border-radius:50%; background-image:url(" + gap.person_photo_url(ux) + "),url("+gap.none_img+");'></div>";
					html += "							</div>";
				//	html += "							<div class='user-thumb'>"+asign_img+"</div>";
					html += "							<div clss='p_file_info' style='margin-left:35px'>";
					html += "								<span class='p_file_name'>"+member_name+ gap.lang.hoching + "</span>";
					html += "								<span class='p_file_time'>"+jt+" / "+dept+"</span>";
					html += "							</div>";			
					html += '           			</div>';
					html += '           		</div>';
					html += '   		</div>';
					html += '   		<button type="button" class="req_btn xtodo" data-type="todo" style="margin-right:10px">'+gap.lang.openNewWin+'</button>';
					html += '   </div>';
					html += '</div>';							
				}else if (item.ex.type == "vote" && !isNotice){
					var _vote = item.ex;
					var _info = {
							"key" : _vote.key,
							"title" : _vote.title,
							"comment" : _vote.comment,
							"endtime" : _vote.end_date + ' ' + _vote.end_time,
							"anonymous" : _vote.anonymous_vote,
							"multi" : _vote.multi_choice,
							"owner" : item.ky
					};				
					html += '<div class="top">';
					html += '   <div class="req_box" style="display:flex" data-vote=\'' + JSON.stringify(JSON.stringify(_info)) + '\'>';
					html += '   		<div class="req_left" style="width:500px; display:flex">';
					html += '   			<div class="req_icon" style="width:62px; border-radius:20px"></div>';
					html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
					html += '           			<h3>' + _vote.title + '</h3>';
					html += '           			<span class="req_txt">' + _vote.comment + '</span>';
					html += '           			<time>' + _vote.end_date + ' ' + _vote.end_time + ' 까지</time>';
					html += '           		</div>';
					html += '   		</div>';
					html += '   		<button type="button" class="req_btn" data-type="vote" style="margin-right:10px">'+gap.lang.vote+'</button>';
					html += '   </div>';
					html += '</div>';			
				}else if (item.ex.type == "aprv"  && !isNotice){
					var _aprv = item.ex;
					//대상정보에서 GMT값 사용하지 않는다고 해서 그냥 예외처리 한다.
					//var date = moment(_aprv.pubdate).utc().format("YYYY-MM-DD hh:mm");
					var date = _aprv.pubdate;				
					html += '<div class="top">';
					html += '   <div class="req_box" style="display:flex" data-url=\'' + _aprv.link + '\'>';
					html += '   		<div class="req_left" style="width:500px; display:flex">';
					html += '   			<div class="req_icon" style="background-position: -60px -414px; width:62px; border-radius:20px"></div>';
					html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
					html += '           			<h3>' + _aprv.title + '</h3>';
					html += '						<span class="req_txt">Date : '+date+'</span>';
				//	html += '           			<span class="req_txt">' + _aprv.comment + '</span>';
				//	html += '           			<time>' + _vote.end_date + ' ' + _vote.end_time + ' 까지</time>';
					html += '           		</div>';
					html += '   		</div>';
					html += '   		<button type="button" class="req_btn" data-type="aprv" style="margin-right:10px">'+gap.lang.openNewWin+'</button>';
					html += '   </div>';
					html += '</div>';
				}else if (item.ex.type == "bbs" && !isNotice){
					var _bbs = item.ex;					
					//대상정보에서 GMT값 사용하지 않는다고 해서 그냥 예외처리 한다.
					//var date = moment(_bbs.pubdate).utc().format("YYYY-MM-DD hh:mm");
					var date = _bbs.pubdate;				
					html += '<div class="top">';
					html += '   <div class="req_box" style="display:flex" data-url=\'' + _bbs.link + '\'>';
					html += '   		<div class="req_left" style="width:500px; display:flex">';
					html += '   			<div class="req_icon" style="background-position: -340px -388px; width:62px; border-radius:20px"></div>';
					html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
					html += '           			<h3>' + _bbs.title + '</h3>';
					html += '						<span class="req_txt">Date : '+date+'</span>';
					html += '           		</div>';
					html += '   		</div>';
					html += '   		<button type="button" class="req_btn" data-type="bbs" style="margin-right:10px">'+gap.lang.openNewWin+'</button>';
					html += '   </div>';
					html += '</div>';
				}else if (item.ex.type == "channel_meeting"){				
					var _meet = item.ex;				
					scheduleid = item.ex.scheduleid;				
					html += '<div class="top">';
					html += '   <div class="req_box" style="display:flex" data-url=\'' + _meet.meetingurl + '\'>';
					html += '   		<div class="req_left" style="width:500px; display:flex">';
					html += '   			<div class="req_icon" style="background-position:-439px -389px; width:62px; border-radius:20px"></div>';
					html += '           		<div class="req_info" style="padding:0px; max-width:350px">';				
					html += " 							<h3>"+ gap.lang.call_attend +"</h3>";
				//	if (item.owner.ky == gap.search_cur_ky()){
						html += '           			<h3>미팅 번호 (Meeting Number) : ' + _meet.meetingkey + '<br> 호스트 키 (Host Key) : '+_meet.hostkey+' </h3>';
				//	}				
					html += '           		</div>';
					html += '   		</div>';
					html += '   		<button type="button" class="req_btn" data-type="channel_meeting" style="margin-right:10px">'+gap.lang.notice_attend+'</button>';
					html += '   </div>';
					html += '</div>';
				}
			}	

			var replylists = item.reply;		
			html += "<div class='bot flex text-ico' style='border-radius:0px'>";
			
			//2024.04.30 업무방 최근 컨텐츠에서는 댓글 작성이 보이면 안됨.
			if (this.cur_opt && this.cur_opt == "allcontent"){
			} else {
				if ((gap.cur_channel_info && gap.cur_channel_info.opt_reply && gap.cur_channel_info.opt_reply == "T")
						|| (gap.cur_channel_info && typeof(gap.cur_channel_info.opt_reply) == "undefined")){
					html += "	<span class='reply' title='"+gap.lang.reply+"' id='r_"+docid+"' data='"+item.channel_code+"'>";
					html += "		<span class='ico ico-textball'></span>";
					if (typeof(replylists) != "undefined"){
						html += "		<span id='rdis_"+docid+"'>"+replylists.length+"</span>"	
					}else{
						html += "		<span id='rdis_"+docid+"'>0</span>"	
					}		
					html += "	</span>";
				}
			}
			
			html += "	<span class='like' title='"+gap.lang.like+"' >";
			html += "		<span class='ico ico-like' onclick=\"gBody3.like_channel_data('"+docid+"','"+item.email.toLowerCase()+"')\"></span>";
			html += "       <span id='like_"+docid+"' class='like-btn' style='cursor:pointer'>"+like_count+"</span>"
			html += "	</span>";		
			
			
			if (!((item.tyx) && item.tyx == "notice")){
				//공지 등록 아이콘
				if (type != "emoticon" && !gBody3.check_top_menu_new() && is_compose_auth){
					html += "	<span class='like' title='"+gap.lang.nreg+"' >";
					html += "		<span class='ico ico-notice' onclick=\"gBody3.notice_channel_data('"+item.channel_code+"', '"+docid+"')\"></span>";
					html += "	</span>";
				}
				
			}
			
			//권한에 따라 복사 버튼을 표시한다.
			if ( (gap.cur_channel_info && gap.cur_channel_info.opt_copy && gap.cur_channel_info.opt_copy == "T") || (gap.cur_channel_info && typeof(gap.cur_channel_info.opt_copy) == "undefined")){
				html += "	<span class='like' title='"+gap.lang.copy+"' >";
				html += "		<span class='ico ico-copy' onclick=\"gBody3.channel_data_copy('"+item.channel_code+"', '"+docid+"')\"></span>";
				html += "	</span>";
			}
			
			if (typeof(item.owner.ky) != "undefined"){
				if (item.owner.ky.toLowerCase() == uinfo.ky.toLowerCase()){		

					if (item.tyx && item.tyx == "notice"){
					}else{
						html += "	<span class='write' title='"+gap.lang.basic_modify+"' data-id='"+docid+"' data-ch_code='"+item.channel_code+"' data-ch_name='"+item.channel_name+"' >";
						html += "		<span class='ico ico-write'></span>";
						html += "	</span>";
					}			
				}
			}		

			var is_del_auth = false;
			if (gap.cur_channel_info && gap.cur_channel_info.opt_del && gap.cur_channel_info.opt_del == "T"){
				if (gap.cur_channel_info.owner.ky == gap.userinfo.rinfo.ky){
					is_del_auth = true;
				}else{
					if (item.owner.ky.toLowerCase() == uinfo.ky.toLowerCase()){
						is_del_auth = true;
					}
				}
			}else{
				if (item.owner.ky.toLowerCase() == uinfo.ky.toLowerCase()){
					is_del_auth = true;
				}
			}	
			
			if (is_del_auth){				
				html += "	<span class='trash' title='"+gap.lang.basic_delete+"' data-id='"+docid+"' data-ch_code='"+item.channel_code+"' data-ch_name='"+item.channel_name+"' data-scheduleid='"+scheduleid+"'>";
				html += "		<span class='ico ico-trash'></span>";
				html += "	</span>";			
			}
			
			html += "	<span class='emotion'>";		
			html += "	</span>";
			html += "</div>";		
			
			
			
			if (typeof(replylists) != "undefined"){
				if (item.reply.length > 0){
					html += "<span class='fold-btns repdis'>";
					if (gBody3.isFold){
						html += "	<button class='btn-reply-expand' data='"+docid+"'><span>"+gap.lang.reply + " " + gap.lang.ex+"</span> (<span id='rcount_"+docid+"'>"+replylists.length+"</span>)</button>";
					}else{
						html += "	<button class='btn-reply-fold' data='"+docid+"'><span>"+gap.lang.reply + " " + gap.lang.fold+"</span> (<span id='rcount_"+docid+"'>"+replylists.length+"</span>)</button>";
					}
					
					html += "</span>";
				}
			}	
			html += gBody3.draw_reply(item);			
			html += gBody3.draw_reply_new(docid);		
			html += "				</div>";			
			html += "			</div>";
			html += "		</div>";
			html += "	</div>";
		}
		
		
		html += "</div>";
		html += "</div>";		
		return html;	
	},
	
	"show_emo" : function(id, channel_code, channel_name){
	//	$("#emo_" + id).show();
		var html = "";		
		html += "		<span class='emtion-cont f_center' id='emo_"+id+"'>";
		html += "			<ul class='f_center'>";
		html += "				<li><span class='ico ico-smile'></span></li>";
		html += "				<li><span class='ico ico-sad'></span></li>";
		html += "				<li><span class='ico ico-angry'></span></li>";
		html += "			</ul>";
		html += "		</span>";	
		$("#emo_top_" + id).qtip({
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
	},
		
	"mail_file_down" : function(target_server, tunid, attname, tdb){				
		var url = "/"+target_server+"/webchat/bigfile/bigmail"+tdb+".nsf/0/"+tunid+"/$FILE/" + encodeURIComponent(attname);
		gap.file_download_mail(url, attname);		
	},
	
	"mail_file_down2" : function(obj){		
		//파일명에 작은 따옴표가 있는 것이 있어 신규로 등록해서 이걸로 사용한다.
		var target_server = $(obj).data("target");
		var tdb = $(obj).data("tdb");
		var tunid = $(obj).data("tunid");
		var attname = $(obj).data("attname");		
		var url = "/"+target_server+"/webchat/bigfile/bigmail"+tdb+".nsf/0/"+tunid+"/$FILE/" + encodeURIComponent(attname);
		gap.file_download_mail(url, attname);		
	},
	
	"mail_f_d" : function(url, attname){	
		//메일 조회 화면에서 파일 다운로드 호출하는 경우		
		gap.file_download_mail(url, attname);		
	},	
	
	"draw_file" : function(item, date){
		//파일이 포함된 경우	
		
		var html = "";
		var docid = "";		
		var like_count = 0;
		var is_owner_delete = false;
		if (item.owner_delete && item.owner_delete == "T"){
			is_owner_delete = true;
		}
		
		var is_compose_auth = gap.checkAuth();
		
		if (item.direct == "T"){
			docid = item._id;
			
		}else{
			docid = item._id.$oid;
			if (typeof(item.like_count.$numberLong) != "undefined"){
				like_count = item.like_count.$numberLong;
			}else{
				like_count = item.like_count;
			}
		}		
		html += "<div class='xman' id='ms_"+docid+"' data='"+date+"'>";		
		var uinfo = gap.userinfo.rinfo;	
		if (item.email.toLowerCase() == uinfo.em.toLowerCase()){
			html += "<div class='me'>";
		}else{
			html += "<div class='you'>";
		}		
		var person_img = gap.person_profile_photo(item.owner);
		var user_info = gap.user_check(item.owner);
		var name = user_info.name;
		var deptname = user_info.dept;
		var time = gap.change_date_localTime_only_time(item.GMT);
		var message = gBody3.message_check(item.content);
		message = message.replace(/[\n]/gi, "<br>");		
		var rcount = message.split(/\r\n|\r|\n/).length;
		var mcount = message.length;
		var rdis = false;
		if ( (rcount > 10) || (mcount > 800)){
			rdis = true;
		}	
		var editor_body = "";	
		if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){
			var editor_html = item.editor.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
			message = message + editor_html;
		}		
		if (message.indexOf("&lt;/mention&gt;") > -1){
			//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
			message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
		}		
		html += "<div class='user'>";
		html += "	<div class='user-thumb showorg' style='cursor:pointer' data='"+item.owner.ky+"'>"+person_img+"</div>";
		html += "</div>";
		html += "<div class='talk'>";
		html += "	<br />";
		html += "	<div class='wrap-message'> <!-- wrap-message 감싸기 -->";
		html += "		<div class='balloon'> <!-- 20200106 -->";
		html += "			<div>";
		html += "				<span class='name'>"+name+" "+user_info.jt+"<em class='team'>"+deptname+"</em>";	
		if (typeof(item.GMT2) == "undefined"){
			item.GMT2 = item.GMT;
		}
		if (item.GMT != item.GMT2){
			var GMT2 = gap.change_date_localTime_full2(item.GMT2);
			html += "						<em class='time' id='update_time_"+docid+"'>"+time+" (Created : " + GMT2 + ")</em>";
		}else{
			html += "						<em class='time' id='update_time_"+docid+"'>"+time+"</em>";
		}
		html += "				</span>";
		if (item.channel_code != gBody3.cur_opt){
			html += "                   <span class='channel-name' data-key='"+item.channel_code+"' style='cursor:pointer'>"+item.channel_name+"</span>";
		}	
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
		if (is_owner_delete){
			html += "<p>" + gap.owner_delete_msg(item.delete_owner, item.delete_owner_time) + "</p>";
		
		// 공지로 등록된 item인 경우
		}else if ((item.tyx) && item.tyx == "notice"){
			html += '<div class="top">';
			html += '   <div class="req_box" style="display:flex">';
			html += '   		<div class="req_left" style="width:500px; display:flex">';
			html += '   			<div class="notice-msg-icon" style="width:62px;"></div>';
			html += '           		<div class="req_info" style="padding:0px; max-width:350px;">';
			html += '           			<h3>' + gap.lang.mn3 + '</h3>';
			html += '						<span class="req_txt">' + item.content + '</span>';
			html += '           			<span class="bot flex text-ico" style="border-radius:0px; border-top:none; padding:5px;">';
			html += '							<span class="notice-msg-img-ico" style="margin-top:2px;"></span><span>' + images.length + '</span>';
			html += '							<span class="notice-msg-attach-ico" style="margin-top:2px; margin-left:10px;"></span><span>' + normalfiles.length + '</span>';
			html += '           			</span>';
			html += '           		</div>';
			html += '   		</div>';
			var kdocid = docid;
			if (item.notice_id){
				kdocid = item.notice_id;
			}
			html += '   		<button type="button" class="req_btn" data-type="notice" data="'+kdocid+'" style="margin-right:10px">'+gap.lang.view_detail+'</button>';
			html += '   </div>';
			html += '</div>';			
		}else{
			var disopt = "";		
			if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){				
				if (gBody3.collapse_editor == "1"){
					//에디터로 작성된 내용의 본문을 자동으로 접기 하겠다는 옵션
					html += "<h3>"+item.title+"  <span class='fold-btns editor' data-key='"+docid+"' style='display:inline-block; width:100px'><button class='btn-editor-expand'>"+gap.lang.expand_editor+"</button></span></h3> ";
					html += "<div class='wrap-editor-area' style='display:none; overflow:auto'>";
					html += "					<p id='p_"+docid+"'>"+message+"</p>";
					html += "</div>";
					disopt = "none";
				}else{
					html += "<h3>"+item.title+"</h3>";
					html += "<div class='wrap-editor-area' style='overflow:auto'>";
					html += "					<p id='p_"+docid+"'>"+message+"</p>";
					html += "</div>";
				}			
			}else{				
				if (rdis){
					html += "					<p class='msg-fold' id='p_"+docid+"'>"+message+"</p>";
					html += "						<span class='fold-btns' style='cursor:pointer'><button class='btn-expand'><span>"+gap.lang.expand+"</span></button></span>";
				}else{
					html += "					<p id='p_"+docid+"'>"+message+"</p>";
				}
			}			
			//이미지 파일일 경우 표시하기
			if (images.length > 0){
				html += "<div id='mfile_"+docid+"' class='tmpimagelist' style='display:"+disopt+"'>";
				for (var i = 0 ; i < images.length; i++){
					var image = images[i];
					var size = gap.file_size_setting(parseInt(image.file_size.$numberLong));
					var image_url = gap.search_file_convert_server(item.fserver) + "/FDownload_thumb.do?id=" + docid + "&md5="+image.md5+"&ty=2";				
					html += "			<div class='img-content' id='msg_file_"+ docid + "_" + image.md5.replace(".","_")+"'>";		
					html += "<div class='img-thumb'>";
					html += "	<img src='"+image_url+"' data='"+image.filename+"' data1='"+image.md5+"' data2='"+image.file_type+"' data3='"+docid+"'  data4='"+item.email+"' data5='"+item.channel_code+"' data8='"+item.channel_name+"'>";
					html += "</div>";
					html += "<ul style='list-style:none'>";
					html += "	<li class='img-title'>"+image.filename+"</li>";
					html += "   <li class='img-size'>"+size+"</li>";
					html += "   <li class='img-btns'>";
					html += "   	<button class='ico btn-view'>크게보기</button>";
					html += "   	<button class='ico btn-download' title='"+gap.lang.download+"'>다운로드</button>";
					html += "   	<button class='ico btn-more'>더보기</button>";
					html += "   </li>";
					html += "</ul>";
					html += "			</div>";
				}
				html += "</div>";				
			}		
			if (normalfiles.length > 0){
				//일반 파일일 경우 표시하기
				html += "			<ul class='message-file' style='display:"+disopt+"'>";
				for (var i = 0 ; i < normalfiles.length; i++){
					var file = normalfiles[i];
					var ftype = gap.file_icon_check(file.filename);
					var size = gap.file_size_setting(parseInt(file.file_size.$numberLong));					
					var show_video = gap.file_show_video(file.filename);			
					html += "					<li id='msg_file_"+ docid + "_" + file.md5.replace(".","_")+"'>";
					html += "						<div class='chat-attach'>";
					html += "							<div>";
					html += "								<span class='ico ico-file "+ftype+"'></span>";
					html += "								<dl>";
					html += "									<dt data1='"+item.fserver+"' data2='"+item.upload_path+"' data3='"+file.md5+"' data4='"+item.ky+"' data5='"+file.file_type+"' data6='"+docid+"' data7='"+item.channel_code+"' data8='"+item.channel_name+"' title='"+file.filename+"'>"+file.filename+"</dt>";
					html += "									<dd>"+size+"</dd>";
					html += "								</dl>";					
					if (gBody3.check_preview_file(file.filename)){
						html += "								<button class='ico btn-file-view' title='"+gap.lang.preview+"'>미리보기</button>";
					}else if (show_video){
						html += "								<button class='ico btn-file-view' title='"+gap.lang.preview+"'>미리보기</button>";
					}					
					html += "								<button class='ico btn-file-download' title='"+gap.lang.download+"'>다운로드</button>";
					html += "								<button class='ico btn-more'>더보기</button>";							
					html += "							</div>";
					html += "						</div>";
					html += "					</li>";
				}
				html += "				</ul>";
			}			
		}	
		
		if ((typeof(item.og) != "undefined") && (typeof(item.og.msg) != "undefined") ){
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
				html += "<br>";
				html += "<div class='link-content'>";
				html += "	<a href='"+url+"' target='_blank'>";				
				var im = gap.og_url_check(imgurl);
				if (typeof(title) == "undefined"){title = "";}
				if (typeof(desc) == "undefined"){desc = "";}
				if (typeof(dmn) == "undefined"){dmn = "";}				
				html += "	<div class='link-thumb'>"+im+"</div>";
				html += "	<ul>";
				html += "		<li class='link-title'>"+title+"</li>";
				html += "		<li class='link-summary'>"+desc+"</li>";
				html += "		<li class='link-site'>"+dmn+"</li>";
				html += "	</ul>";
				html += "	</a>";
				html += "</div>";
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
				if (typeof(item.ex.attach) != "undefined"){
					var attach_list = item.ex.attach.split("*?*");
					var attach_size = item.ex.attachsize.split("*?*");
					var target_server = item.ex.target_server;
					var acount = 0;
					if (item.ex.attach != ""){
						acount = attach_list.length;
					}					
					html += "<div class='chat-mail'>";
					html += "<div>";
					html += "	<span class='ico ico-mail'></span>";
					html += "	<dl style='cursor:pointer' onclick=\"gBody4.openMail('"+tunid+"','body', '"+tdb+"', '"+target_server+"')\">";
					html += "		<dt>"+from+"</dt>";
					html += "		<dd>"+title+"</dd>";
					html += "	</dl>";					
					if (acount > 0){
						html += "	<div class='mail-attach-list'>";
						html += "		<button class='ico btn-fold'>접기</button> <!-- 클릭 시 .on 클래스 토글 -->";
						html += "		<h4>"+gap.lang.attachment+" <span>"+acount+"</span></h4>";
						html += "		<ul style='list-style:none'>";						
						for (var i = 0 ; i < attach_list.length ; i++){
							var attname = attach_list[i];
							var attsize = attach_size[i];
							var icon = gap.file_icon_check(attname);
							var target_server = item.ex.target_server;						
							html += "			<li data-target='"+target_server+"' data-tunid='"+tunid+"' data-attname='"+attname+"' data-tdb='"+tdb+"' onclick=\"gBody3.mail_file_down2(this)\"><span class='ico ico-attach "+icon+"'></span><span>"+attname+"</span> <em>("+gap.file_size_setting(attsize)+")</em>";
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
				var ux = gap.user_check(xinfo.owner);  //나중에 asign.pu로 변경해야 한다.
			//	var asign_img = gap.person_photo(ux.pu);
				var asign_img = gap.person_profile_photo(ux);				
				var member_name = ux.name;
				var dept = ux.dept;
				var email = ux.email;
				var jt = ux.jt;				
				var todo_item_id = xinfo._id.$oid;				
				html += "<div class='chat-todo' id='todo_"+todo_item_id+"' style='cursor:pointer'>";
				html += "<div>";
				html += "	<div class='status'><span class='ico ico-todo'></span></div>";
			//	html += "	<h3><span class='ico p2'></span>["+xinfo.project_name+"] "+xinfo.title+"</h3>";
				html += "	<h3 style='padding-left:40px'>["+xinfo.project_name+"] "+xinfo.title+"</h3>";
				if (typeof(ux.startdate) != "undefined"){
					html += "	<span class='todo-period'>"+ux.startdate+" ~ "+ux.enddate+" ("+ux.term+"day)</span>";
				}else{
					html += "	<span class='todo-period' style='height:20px'></span>";
				}				
				html += "	<div class='user'>";
				html += "		<div class='user-thumb showorg'>"+asign_img+"</div>";
				html += "			<dl>";
				html += "				<dt>"+member_name+ gap.lang.hoching + "</dt>";
				html += "				<dd>"+jt+" / "+dept+"</dd>";
				html += "			</dl>";
				html += "		</div>";
				html += "	</div>";
				html += "</div>";
			}	
		}			
		
		if (!is_owner_delete){
			var replylists = item.reply;		
			html += "<div class='bot flex text-ico' style='border-radius:0px'>";
			
			//2024.04.30 업무방 최근 컨텐츠에서는 댓글 작성이 보이면 안됨.
			if (this.cur_opt && this.cur_opt == "allcontent"){
			} else {
				if ((gap.cur_channel_info && gap.cur_channel_info.opt_reply && gap.cur_channel_info.opt_reply == "T") 
						||  (gap.cur_channel_info && typeof(gap.cur_channel_info.opt_reply) == "undefined")){
					
					html += "	<span class='reply' title='"+gap.lang.reply+"' id='r_"+docid+"' data='"+item.channel_code+"'>";
					html += "		<span class='ico ico-textball'></span>";
					if (typeof(replylists) != "undefined"){
						html += "		<span id='rdis_"+docid+"'>"+replylists.length+"</span>"	
					}else{
						html += "		<span id='rdis_"+docid+"'>0</span>"	
					}		
					html += "	</span>";
				}
			}

			html += "	<span class='like' title='"+gap.lang.like+"' >";
			html += "		<span class='ico ico-like' onclick=\"gBody3.like_channel_data('"+docid+"','"+item.email.toLowerCase()+"')\"></span>";
			html += "       <span id='like_"+docid+"' class='like-btn' style='cursor:pointer'>"+like_count+"</span>"
			html += "	</span>";		
			if (!((item.tyx) && item.tyx == "notice")){
				//공지 등록 아이콘
				if (!gBody3.check_top_menu_new() && is_compose_auth){
					html += "	<span class='like' title='"+gap.lang.nreg+"' >";
					html += "		<span class='ico ico-notice' onclick=\"gBody3.notice_channel_data('"+item.channel_code+"', '"+docid+"')\"></span>";
					html += "	</span>";
				}
			
			}		
			
			//권한에 따라 복사 버튼을 표시한다.
			if ((gap.cur_channel_info && gap.cur_channel_info.opt_copy && gap.cur_channel_info.opt_copy == "T") || (gap.cur_channel_info && typeof(gap.cur_channel_info.opt_copy) == "undefined")){
				html += "	<span class='like' title='"+gap.lang.copy+"' >";
				html += "		<span class='ico ico-copy' onclick=\"gBody3.channel_data_copy('"+item.channel_code+"', '"+docid+"')\"></span>";
				html += "	</span>";
			}

			
			if (typeof(item.owner.ky) != "undefined"){
				if (item.owner.ky.toLowerCase() == uinfo.ky.toLowerCase()){
					if (item.tyx && item.tyx == "notice"){
					}else{
						//	html += "	<span class='write' title='"+gap.lang.basic_modify+"' onclick=\"gBody3.edit_channel_data('"+docid+"', '"+item.channel_code+"', '"+item.channel_name+"')\">";
						html += "	<span class='write' title='"+gap.lang.basic_modify+"' data-id='"+docid+"' data-ch_code='"+item.channel_code+"' data-ch_name='"+item.channel_name+"' >";
						html += "		<span class='ico ico-write'></span>";
						html += "	</span>";
					}
				}
			}		
			
			var is_del_auth = false;
			if (gap.cur_channel_info && gap.cur_channel_info.opt_del && gap.cur_channel_info.opt_del == "T"){
				if (gap.cur_channel_info.owner.ky == gap.userinfo.rinfo.ky){
					is_del_auth = true;
				}else{
					if (item.owner.ky.toLowerCase() == uinfo.ky.toLowerCase()){
						is_del_auth = true;
					}
				}
			}else{
				if (item.owner.ky.toLowerCase() == uinfo.ky.toLowerCase()){
					is_del_auth = true;
				}
			}	
			
			if (is_del_auth){
				html += "	<span class='trash' title='"+gap.lang.basic_delete+"' data-id='"+docid+"' data-ch_code='"+item.channel_code+"' data-ch_name='"+item.channel_name+"' data-scheduleid=''>";
				html += "		<span class='ico ico-trash'></span>";
				html += "	</span>";
			}
			
			html += "	<span class='emotion'>";		
			html += "	</span>";
			html += "</div>";		
			
			if (typeof(replylists) != "undefined"){				
				html += "<span class='fold-btns repdis'>";
				if (gBody3.isFold){
					html += "	<button class='btn-reply-expand' data='"+docid+"'><span>"+gap.lang.reply + " " + gap.lang.ex+"</span> (<span id='rcount_"+docid+"'>"+replylists.length+"</span>)</button>";
				}else{
					html += "	<button class='btn-reply-fold' data='"+docid+"'><span>"+gap.lang.reply + " " + gap.lang.fold+"</span> (<span id='rcount_"+docid+"'>"+replylists.length+"</span>)</button>";
				}
				html += "</span>";
			}		
			html += gBody3.draw_reply(item);		
			html += gBody3.draw_reply_new(docid);	
			html += "			</div>";
			html += "		</div>";
			html += "	</div>";
			html += "</div>";
		}
		
		
		html += "</div>";		
		html += "</div>";	
		return html;
	},	
	
	"draw_reply_new____" : function(docid){		
		var html = "";
		html += "	<div class='channel_reply_top' id='reply_write_"+docid+"' style='display:none'>";
		html += "		<textarea name='' id='reply_compose_"+docid+"' class='channel_reply_cls' style='padding-top:10px' placeholder='"+gap.lang.input_replay+"'></textarea>";
		html += "		<span class='type_icon_channel' style='cursor:pointer; right:17px; top:20px'></span>";
		html += "	</div>";		
		return html;
	},
	
	//댓글에 파일 첨부하기
	"draw_reply_new" : function(docid){		
		var html = "";		
		html += "	<div class='channel_reply_top' id='reply_write_"+docid+"' style='display:none'>";			
		html += "		<dl id='total-progress-"+docid+"' class='' style='height:1px;width: calc(100% - 20px); margin-left:10px'>";
		html += "			<dd class='progress-bar' style='width:0%;background:#337ab7' data-dz-uploadprogress></dd>";
		html += "		</dl>";	
		html += "  		<button class='reply_attachment'><span>+</span>"+gap.lang.file+"</button>";
		html += "		<textarea name='' id='reply_compose_"+docid+"' class='channel_reply_cls' style='padding-left: 70px !important; padding-top:10px' placeholder='"+gap.lang.input_replay+"'></textarea>";
		html += "		<span class='type_icon_channel' style='cursor:pointer; right:17px; top:20px'></span>";		
		html += "		<div class='add-filelist'>";		
		html += "			<div id='reply_attach_"+docid+"' style='display:none' class='chat-attach'></div>";
		html += "		</div>";
		html += "	</div>";	
		html += "";
		return html;
	},	
	
	"draw_reply" : function(item){		
		var html = "";
		var uinfo = gap.userinfo.rinfo;	
		var replylists = item.reply;
		if (typeof(replylists) != "undefined"){
			if (replylists.length > 0){				
				var docid = "";
				if (item.direct == "T"){
					docid = item._id;
				}else{
					docid = item._id.$oid;
				}			
				if (gBody3.isFold){
					html += "<div class='message-reply' id='reply_group_"+docid+"' style='display:none'>";
				}else{
					html += "<div class='message-reply' id='reply_group_"+docid+"' >";
				}				
				for (var k = 0 ; k < replylists.length; k++){
					var info = replylists[k];
					var user_photo = gap.person_profile_photo(info.owner);
					var user_info = gap.user_check(info.owner);
					var name = user_info.name;
					var content = info.content;					
					var time = gap.change_date_localTime_full2(info.GMT);					
					var message = gBody3.message_check(info.content);					
					if (message.indexOf("&lt;/mention&gt;") > -1){
						//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
						message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
					}					
					if (message == ""){
						message = "&nbsp;";
					}				
					html += "<dl id='mreplay_"+info.rid+"' >";
					html += "	<dt>";
					html += "		<div class='user'>";
					html += "			<div class='user-thumb showorg' data='"+info.owner.ky+"'>"+user_photo+"</div>";
					html += "		</div>";
					html += "	</dt>";
					html += "	<dd>";
					html += "		<span>"+user_info.disp_user_info+"<em>"+time+"</em></span>";				
					if (info.owner.em.toLowerCase() == uinfo.em.toLowerCase()){
						html += "<button class='btn-reply-more' data='"+info.channel_data_id+"' data2='"+info.rid+"' data3='"+item.channel_code+"' data4='"+item.channel_name+"'><span class='ico ico-reply-more'></span></button>";
					}					
					html += "		<p >"+message+"</p>";
					html += "	</dd>";					
					////////////////// 댓글 파일 그리기 /////////////////////////////					
					var ppinfo = info;
					ppinfo.upload_path = item.upload_path;
					
					//2024.04.16 item.fserver가 없는 경우 넣지 않음.
					if(item.fserver){
						ppinfo.fserver = item.fserver;
					}
					ppinfo.owner_ky = item.owner.ky;			
					html += gBody3.file_infos_draw(ppinfo);					
					/////////////////////////////////////////////////////////
					html += "</dl>";			
				}
				html += "</div>";
			}
		}		
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
				if (typeof(finfo.file_size.$numberLong) != "undefined"){
					size = gap.file_size_setting(finfo.file_size.$numberLong);
				}
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
				html += "			<span class='ico ico-file "+ext+"' style='scale:75%'></span>";
				html += "			<p style='padding-left:30px;padding-right:70px' title='"+title+"'>"+fname+ " (" +  size +")" +"</p>";
				html += "			<button class='ico btn-file-view' title='미리보기'>미리보기</button>";
				html += "			<button class='ico btn-file-download' title='다운로드'>다운로드</button>";
				html += "		</div>";
			}	
			html += "	</div>";
			html += "</div>";		
		}		
		return html;
	},
	
	"file_infos_draw_add" : function(file){	
		var ext = gap.file_icon_check(file.name);
		var size = gap.file_size_setting(file.size);
		var title = file.name + "(" + size + ")";		
		var html = "";
		html += "<div class='reply-file add'>";
		html += "	<span class='ico ico-file "+ext+"' style='scale:75%'></span>";
		html += "	<p title='"+title+"'>"+file.name + " (" +  size +")</p>";
		html += "	<button class='ico btn-delete' title='삭제' data='"+file.name+"', data2='"+file.size+"'>삭제</button>";
		html += "</div>";		
		return html;
	},
	
	"complete_process22" : function(myDrop){
		//버디리스트에서 바로 파일 업로드하는 경우 파일 업로드가 완료되면 처리하는 프로세스	
		if (!myDrop.sendOK){
			return false;
		}		
		var ty = gBody3.ty;		
		myDrop.options.autoProcessQueue = false;	
		$("#total-progress2 .progress-bar").fadeOut(function(){			
			if (document.querySelector("#total-progress2 .progress-bar") != null){
				document.querySelector("#total-progress2 .progress-bar").style.display = "none";
				document.querySelector("#total-progress2 .progress-bar").style.width = "0%";
			}		
			$("#total-progress2").remove();			
		});		
	},
	
	"complete_process_reply" : function(myDrop){
		//댓글에서 바로 파일 업로드하는 경우 파일 업로드가 완료되면 처리하는 프로세스	
		if (!myDrop.sendOK){
			return false;
		}		
		var ty = gBody3.ty;		
		myDrop.options.autoProcessQueue = false;
		var targetid = "total-progress-" + gBody3.select_reply;		
		$("#"+targetid+" .progress-bar").fadeOut(function(){			
			if (document.querySelector("#"+targetid+" .progress-bar") != null){
				document.querySelector("#"+targetid+" .progress-bar").style.display = "none";
				document.querySelector("#"+targetid+" .progress-bar").style.width = "0%";
			}		
			$("#"+targetid).remove();			
		});		
	},	
	
	"reply_attach_event" : function(){		
		var lex = $(".reply_attachment").length;
		if (lex > 0){
			var dropzoneControl = $(".reply_attachment")[0].dropzone;
	        if (dropzoneControl) {
	            dropzoneControl.destroy();
	        }		
			var isdropzone22 = $(".reply_attachment")[0].dropzone;
			if (!isdropzone22) {
				var myDropzone22 = new Dropzone(".reply_attachment", { // Make the whole body a dropzone
					 url: gap.channelserver + "/FileControl_reply.do", // Set the url
				      autoProcessQueue : false, 
				      parallelUploads : 10,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
				  	  uploadMultiple: true,
				  	  previewsContainer: "#previews", // Define the container to display the previews
				  	  clickable: ".reply_attachment", // Define the element that should be used as click trigger to select files.
				  	  renameFile: function(file){
						return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
					  },
				  	  init: function() {						 
						  myDropzone22 = this;
						  gBody3.cur_reply_attach = this;
						  this.imagelist = new Array();		
						  this.file_list = new Array();
						  
				      },
				      success : function(file, json){				    	 
				    	  var jj = JSON.parse(json);		    	 
				    	  if (jj.result == "OK"){				    		  			    		  
				    		  this.res = jj;
				    		  this.file_list = jj.file_infos;
				    	  }	 			
				      },
				      addedfile :  function(file) {				    	
						 gap.dropzone_upload_limit(this, file, "chat");
						 var o_id = gBody3.select_reply;
						// var html = "<span style='border:1px solid red; padding:10px'>"+file.name+"</span>";
						 var html = gBody3.file_infos_draw_add(file);
						 $("#reply_attach_" + o_id).append(html);				 
					 }
				});
				myDropzone22.on("totaluploadprogress", function(progress) {						
					var targetid = "total-progress-" + gBody3.select_reply;
					if (myDropzone22.files.length > 0){
						if (document.querySelector("#"+targetid+" .progress-bar") != null){
							document.querySelector("#"+targetid+" .progress-bar").style.width = progress + "%";
						}	
					}
				});
				myDropzone22.on("queuecomplete", function (file) {				
					var flist = this.file_list;
					//실제 첨부된 댓글의 파일을 그려 준다.
					if (flist.length == 0){						
						$(".reply-file.add").remove();
						myDropzone22.removeAllFiles();
						return false;
					}					
					////////////////////////////////////////					
					var jj = this.res;
					var id = jj.data.rid.split("_")[0];		    		  
		    		var data = JSON.stringify({
		  				"content" : gBody3.temp_mentions_msg,	//content,
		  				"mention" : gBody3.temp_mentions_data,
		  				"owner" : gap.userinfo.rinfo,
		  				"channel_data_id" : id,
		  				"file_infos" : flist
		  			});		  			
		  			gBody3.xkey = id;
		  			gBody3.tempData = data;		    		  
		    		gBody3.reply_total_draw(jj, id);		    		
		    		//초기화
		    		$("#reply_attach_" + id).html("");
		    		this.file_list = new Array();    							
					var xytime = setTimeout(function(){
						gBody3.complete_process_reply(myDropzone22);
						clearTimeout(xytime);
						myDropzone22.removeAllFiles();
						gap.hide_loading();
					}, 100);
			    });
				myDropzone22.on("addedfiles", function (file) {
					$("#reply_attach_" + gBody3.select_reply).show();				
					$(".add-filelist .reply-file .btn-delete").off();
					$(".add-filelist .reply-file .btn-delete").on("click", function(e){
						gBody3.removeRF(e.currentTarget);
					});
			    });
				myDropzone22.on('sending', function(file, xhr, formData){		
					gap.show_loading(gap.lang.saving);
					var fx = file;
					var is_image = gap.check_image_file(fx.name);					
					formData.append("email", gap.userinfo.rinfo.ky);
					formData.append("ky", gap.userinfo.rinfo.ky);									
					formData.append("channel_code", gBody3.select_channel_code);
					formData.append("channel_name", gBody3.select_channel_name);
					formData.append("owner", JSON.stringify(gap.userinfo.rinfo));
					formData.append("fserver", gap.channelserver);
					formData.append("type", "reply");					
					formData.append("id", gBody3.select_reply);
					formData.append("upload_path", gBody3.select_doc_info.upload_path);
					formData.append("mentions_msg", gBody3.temp_mentions_msg);
					formData.append("mentions_data", JSON.stringify(gBody3.temp_mentions_data));			
					myDropzone22.sendOK = true;
					$("#total-progress2").show();     
			    });	
			}
		}
	},
	
	"reply_modify_att_event" : function(){
		//댓글 수정 화면에서 파일을 첨부한 경우 바로 서버로 발송한다.		
		var lex = $("#add_reply_file").length;
		if (lex > 0){			
			var dropzoneControl = $("#add_reply_file")[0].dropzone;
	        if (dropzoneControl) {
	            dropzoneControl.destroy();
	        }			
			var isdropzone222 = $("#add_reply_file")[0].dropzone;
			if (!isdropzone222) {
				var myDropzone222 = new Dropzone("#add_reply_file", { // Make the whole body a dropzone
					 url: gap.channelserver + "/FileControl_reply.do", // Set the url
				      autoProcessQueue : true, 
				      parallelUploads : 10,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
				  	  uploadMultiple: true,
				  	  previewsContainer: "#previews", // Define the container to display the previews
				  	  clickable: "#add_reply_file", // Define the element that should be used as click trigger to select files.
				  	  renameFile: function(file){
						return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
					  },
				  	  init: function() {						 
						  myDropzone222 = this;
						  gBody3.cur_reply_attach2 = this;
						  this.imagelist = new Array();		
						  this.file_list = new Array();
						  
				      },
				      success : function(file, json){				    	 
				    	  var jj = JSON.parse(json);		    	 
				    	  if (jj.result == "OK"){				    		  			    		  
				    		  this.res = jj;
				    		  this.file_list = jj.file_infos;
				    		  
				    		  this.upload_path = jj.upload_path;
				    		  this.fserver = jj.fserver;
				    	  }	 			
				      },
				      addedfile :  function(file) {
						 gap.dropzone_upload_limit(this, file, "chat");
						 var o_id = gBody3.select_reply;						
					 }
				});
				myDropzone222.on("totaluploadprogress", function(progress) {					
					var targetid = "total-progress-" + gBody3.select_reply;
					if (myDropzone222.files.length > 0){
						if (document.querySelector("#"+targetid+" .progress-bar") != null){
							document.querySelector("#"+targetid+" .progress-bar").style.width = progress + "%";
						}	
					}
				});
				myDropzone222.on("queuecomplete", function (file) {					
					var flist = this.file_list;
					//실제 첨부된 댓글의 파일을 그려 준다.	    			    		
		    		 this.file_list = new Array();	    		
		    		 if (flist.length > 0){
		    			 //댓글 수정창에 파일 정보를 추가한다.
		    			 var khtml = "";
		    			 var html = "";
		    			 $("#rm_attachment_dis").show();	    			 
		    			 khtml += "<div style='display:flex; justify-content:space-between; flex-wrap : wrap' id='reply_file_disp'>";
		    			 for (var p = 0 ; p < flist.length; p++){
		    				 var item = flist[p];
		    				 khtml += gBody3.add_reply_att(item.filename, item.md5, item.file_type);	    				
		    				 var fname = item.filename;
		    				 var ext = gap.file_icon_check(fname);
		    				 var md5 = item.md5;
		    				 var email = gap.userinfo.rinfo.ky;
		    				 var ty = item.file_type;
		    				 var size = gap.file_size_setting(item.file_size);		    				
		    				 var id = gBody3.tselect_rid;
		    				 var spl = id.split("_");
		    				 var rpath = spl[1] + "_" + spl[2];
		    				 var upload_path = this.upload_path + "/reply/" + rpath;
		    				 var fserver = this.fserver;
		    				 var title = fname + "(" + size + ")";		    				 
			 				 html += "		<div class='reply-file' data1='"+fserver+"' data2='"+upload_path+"' data3='"+md5+"' data4='"+email+"' data5='"+ty+"' data6='"+id+"' data7='"+fname+"'>";
							 html += "			<span class='ico ico-file "+ext+"' style='scale:75%'></span>";
							 html += "			<p style='padding-left:30px;padding-right:70px' title='"+title+"'>"+fname+ " (" +  size +")" +"</p>";
							 html += "			<button class='ico btn-file-view' title='"+gap.lang.preview+"'>미리보기</button>";
							 html += "			<button class='ico btn-file-download' title='"+gap.lang.download+"'>다운로드</button>";
							 html += "		</div>";	    				 
		    			 }	    			 
		    			 khtml += "</div>";
		    			 //레이어 하단에 추가된 파일을 표시한다.
		    			 var pobj = $("#reply_att_" + id);
		    			 if (pobj.length == 0){		    				
		    				 var parobj = $("#mreplay_" + id);
		    				 var phtml = "<div style='display:flex; justify-content:space-between; flex-wrap : wrap' id='reply_file_disp'>";
		    				 phtml += "			<div id='reply_att_"+id+"' class='chat-attach'></div>";
		    				 phtml += "</div>";		    				
		    				 $(parobj).append(phtml);		    				 
		    				 $("#reply_att_" + id).append(html)
		    			 }else{
		    				 $("#reply_att_" + id).append(html)
		    			 }	    			 
		    			 //해당 레이어 창에 추가된 파일을 표시한다.
		    			// $("#reply_file_disp").append(khtml);
		    			 gBody3.add_reply_att_draw(khtml);		    			 
		    			 //본문에 추가된 파일 정보에 클릭 이벤트를 추가한다.
		    			 gBody3.__event_init_load();		    			 
		    			 //하단에 원본 컨텐츠 영역에 파일을 추가한다.
		    		}	    							
					var xytime = setTimeout(function(){
						gBody3.complete_process_reply(myDropzone222);
						clearTimeout(xytime);
						myDropzone222.removeAllFiles();
						gap.hide_loading2();						
						gBody3.reply_modify_att_event();
					}, 100);
			    });
				myDropzone222.on("addedfiles", function (file) {					
			    });

				myDropzone222.on('sending', function(file, xhr, formData){		
					gap.show_loading2(gap.lang.saving);
					var fx = file;
					var is_image = gap.check_image_file(fx.name);					
					formData.append("email", gap.userinfo.rinfo.ky);
					formData.append("ky", gap.userinfo.rinfo.ky);									
					formData.append("channel_code", gBody3.select_channel_code);
					formData.append("channel_name", gBody3.select_channel_name);
					formData.append("owner", JSON.stringify(gap.userinfo.rinfo));
					formData.append("fserver", gap.channelserver);
					formData.append("type", "reply_modify");					
					formData.append("id", gBody3.tselect_reply);
					formData.append("rid", gBody3.tselect_rid);
					formData.append("upload_path", gBody3.tupload_path);								
					myDropzone222.sendOK = true;
					$("#total-progress22").show();     
			    });	
			}
		}
	},
	
	
	"__draw_reply_event" : function(){	
		$(".wrap-message .btn-reply-more, #rlist .btn-reply-more").off();
		$(".wrap-message .btn-reply-more, #rlist .btn-reply-more").on("click", function(e){			
			$.contextMenu({
				selector : ".wrap-message .btn-reply-more, #rlist .btn-reply-more",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){					
					var channel_id = $(this).attr("data");
					var rid = $(this).attr("data2");
					var channel_code = $(this).attr("data3");					
					var channel_name = $(this).attr("data4");
					var content = $(this).next().html();					
					content = gBody3.htmlTOtext(content);
					gBody3.init_mention_userdata('rmtext');   //댓글 수정					
					gBody3.context_menu_call_reply(key, channel_id, rid, channel_code, content, channel_name);
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
					},
					show : function (options){
					}
				},			
				build : function($trigger, options){
					options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
						return {
						items: gBody3.reply_context()
					}
				}
			});
		});	
	},
	
	"context_menu_call_reply" : function(key, channel_id, rid, channel_code, content, channel_name){		
		if (key == "delete"){			
			var channel_data_id = channel_id;
			var reply_id = rid;
			var channel_code = channel_code;
			var channel_name = channel_name;			
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
						$("#mreplay_" + reply_id).remove();
						$("#reply_" + reply_id).remove();						
						var id = channel_data_id;						
						var cnt = $("#ms_"+id).find(".message-reply").children().length;						
						if (cnt == 0 ){
							$("#ms_"+id).find(".message-reply").remove();
						}						
						$("#rdis_"+id).text( cnt  );
						if (cnt == 0){
							//접고 펼치기 버튼을 숨긴다.
							$("#rcount_" + id).parent().parent().remove();
						}
						$("#rcount_" + id).text(cnt);
						$(".comment").parent().find("h2 span").text("(" + cnt + ")");					
						//응답 개수를 다시 계산해야 한다.						
						var obj = new Object();
						obj.reply_id = reply_id;
						obj.id = channel_data_id;
						obj.channel_code = channel_code;
						obj.channel_name = gap.textToHtml(channel_name);
						gBody3.send_socket(obj, "dr");
					}else{
						gap.gAlert(gap.lang.errormsg);
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
				}
			});
		  }else if (key == "edit"){ 			  
			  gBody3.reply_modify_att_event();			    
			   gap.showBlock(); 		   
			   //댓글 수정창에서 파일을 업로드할때 사용하려고 임시로 설정한다.
			   gBody3.tselect_reply = rid.split("_")[0];
			   gBody3.tselect_rid = rid;
			   ///////////////////////////////////			    
			   if (content.indexOf("<mention") > -1){ 
				   var mk = $("<span>" + content + "</span>"); 
				   var ctext = ""; 
				   var lk = $(mk).find("mention"); 
				   for (var i = 0 ; i < lk.length; i++){ 
					   var item = lk[i]; 
					   var cn = $(item).attr("data"); 
					   var na = $(item).text(); 
					   var txt = "@[" + na + "](contact:" + cn + ")"; 			 
					   content = content.replace($(item).get(0).outerHTML, txt); 
				   } 
			   }		  
			   $("#rm_attachment_dis").empty();			   
			   //댓글에 파일이 있는 경우 표시한다. //////////////////////////////////////////////////////
			   if ($("#reply_att_" + rid).length > 0){
				   var att_dis = $("#reply_att_" + rid).html();
				   if (att_dis != ""){				   
					   $("#rm_attachment_dis").show();				  
					   var reply_data = $("#reply_att_" + rid).find("span");
					   var html = "";					   
					   html += "<div style='display:flex; justify-content:space-between; flex-wrap : wrap' id='reply_file_disp'>";
					   for (var u = 0 ; u < reply_data.length; u++){
						   var ritem = reply_data[u];						   
						   var md5 = $(ritem).parent().attr("data3");
						   var filename = $(ritem).parent().attr("data7");
						   var owner = $(ritem).parent().attr("data4");
						   var ftype = $(ritem).parent().attr("data5");
						   var ext = gap.file_icon_check(filename);					   
						   html += gBody3.add_reply_att(filename, md5, ftype);							
					   }
					   html += "</div>";
					   gBody3.add_reply_att_draw(html);
				   }else{
					   $("#rm_attachment_dis").hide();
				   }
			   }
			   /////////////////////////////////////////////////////////////////////////////		 
			   $("#rmtext").mentionsInput('edit', content); 			    
			   //편집창을 띄운다. 
			   var inx = parseInt(gap.maxZindex()) + 1; 
			   $("#rmlayer").css("z-index", inx); 
			   $("#rmlayer").show(); 
			   $("#rmclose").off(); 
			   $("#rmclose").on("click", function(e){      
				    gap.hideBlock(); 
				    $("#rmlayer").hide(); 				     
				    $("#rmtext").removeAttr("style"); 
				    $("#rmtext").removeAttr("rows"); 
			   }); 			    
			   $("#rmcancel").off(); 
			   $("#rmcancel").on("click", function(e){ 
			    $("#rmclose").click(); 
			   }); 			    
			   $("#rmsave").off(); 
			   $("#rmsave").on("click", function(e){   			     
				   gBody3.reply_modify(channel_id, rid, channel_code, channel_name); 
			   }); 	    
			   $("#rmtext").bind("keypress", function(e){   
			    if (e.keyCode == 13) { 
			    	//다음줄로 내려간다. 
			    	$(this).height($(this).height() + 23);        
			    	var countRows = $(this).val().split(/\r|\r\n|\n/).length;    
			    	$(this).attr("rows", countRows + 1); 
			    	e.stopPropagation();   
			    	} 
			   }); 			    
			   return false; 			
		}
	},
	
	"add_reply_att" : function(filename, md5, ftype){	
		var channel_id = gBody3.tselect_reply;
		var rid = gBody3.tselect_rid;
     	var ext = gap.file_icon_check(filename);
		var html = "";
		html += "<div class='reply-file add' style='width:calc((100% - 20px) / 2) !important; display: flex; padding : 0px !important'>";
		html += "	<span class='ico ico-file "+ext+"' style='scale:75%; margin-top:3px; padding: 15px 25px 5px 5px'></span>";
		html += "	<p style='line-height:inherit; max-width:180px'>"+filename + "</p>";
		html += "	<button class='ico btn-delete' style='top: 10px; width: 16px; height: 16px; right: 10px; background-position: -484px -123px !important; position: absolute;' onClick=\"gBody3.del_reply_att('"+channel_id+"','"+rid+"', '"+md5+"','"+ftype+"', this)\">삭제</button>";
		html += "</div>";	
		return html;
	},
	
	"add_reply_att_draw" : function(obj){
		 $("#rm_attachment_dis").append(obj);
	},
	
	"del_reply_att" : function(channel_id, rid, md5, ftype, obj){		
		var url = gap.channelserver + "/delete_reply_attachment.km";
		var data = JSON.stringify({
			"channel_id" : channel_id,
			"rid" : rid,
			"md5" : md5,
			"ftype" : ftype
		});		
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : url,
			data : data,
			success : function(res){								
				if (obj == "reply"){
					if (gBody2.disp_view_mode == "list"){
						var key1 = (gBody2.total_file_count - 1);
						var key2 = (gBody2.cur_page * gBody2.per_page - gBody2.per_page);
						if (key1 > key2){
							gBody2.draw_files(gBody2.cur_page);
						}else{
							var page = gBody2.cur_page - 1;
							if (page <= 0){
								page = 1;
							}
							gBody2.draw_files(page);
						}									
					}else{
						$("#" + select_id).remove();
						if ($("#files_data_gallery_area").children().length == 0){
							//데이터가 없는 경우
							var html = '<div class="msg-empty"><img src="' + cdbpath + '/img/empty.png" alt="" />' + gap.lang.no_upload_file + '</div>';
							$("#wrap_files_data_list").empty();
							$("#wrap_files_data_list").html(html);
							return false;
						}
					}
				}else{
					$(obj).parent().remove();				
					$("#reply_att_" + gBody3.tselect_rid).find('[data3="'+md5+'"]').remove();
				}
			},
			error : function(e){
				gap.error_alert();
			}
		})
	},
	
	"reply_modify" : function(channel_id, rid, channel_code, channel_name){	
		  var rinfo = gBody3.select_reply_info; 		   
		  var channel_data_id = channel_id; 
		  var reply_id = rid; 
		  var channel_code = channel_code; 
		  var channel_name = channel_name; 
		  var content = $("#rmtext").val(); 		 
		  //mention 처리 ///////////////////////////////////////////////////////////// 
		  var mentions_msg = ""; 
		  var mentions_data = ""; 
		  $("#rmtext").mentionsInput('val', function(text){ 
			  mentions_msg = gap.textMentionToHtml(text);; 
		  }); 
		  $("#reply_content").mentionsInput('getMentions', function(data) { 
			  mentions_data = data; 
		  }); 
		  //////////////////////////////////////////////////////////////////////////	   
		  var url = gap.channelserver + "/modify_reply.km"; 
		  var data = JSON.stringify({ 
		   "owner" : gap.userinfo.rinfo, 
		   "channel_data_id" :  channel_data_id, 
		   "reply_id" : reply_id, 
		   "content" : mentions_msg, //content 
		   "mention" : mentions_data 
		  }); 
		  gBody3.tempData = data;		   
		  $.ajax({ 
		   type : "POST", 
		   dataType : "text", 
		   url : url, 
		   data : data, 
		   success : function(ress){ 
		    var res = JSON.parse(ress);		     
		    if (res.result == "OK"){		     
		     if (typeof(res.data.file_infos) != "undefined"){
		    	 gBody3.tempData.file_infos = res.data.file_infos;
		     }		         
		     gap.hideBlock(); 
		     $("#rmlayer").hide(); 
		     $("#rmtext").val("");	      
		     $("#mreplay_" + reply_id).remove(); 
		     $("#reply_" + reply_id).remove();	      
		     var id = channel_data_id;	      
		     var GMT = res.data.GMT;	    
		     //타켓 문서를 현재 창에서 제거하고 오늘의 마지막으로 이동시킨다... 댓글을 달면 최근 데이터로 업데이트 한다. 
		     var klen = $("#ms_" + channel_id).length; 	   
		     if (gBody3.post_view_type == "2"){ 		       
		     }else{ 
		    	 var date = "";      
		    	 date = gap.change_date_localTime_only_date(GMT);	       
		    	 if (klen > 0){ 
		    		 var ccn = $("#web_channel_dis_"+date).parent().find('.xman').length; 
		    		 if (ccn > 0){ 
		    			 var html = $("#ms_" + channel_id).get(0).outerHTML; 	         
		    			 $("#ms_" + channel_id).remove();        
		    			 var len = $("#web_channel_dis_"+date).length; 
		    			 if (len > 0){ 
		    				 //오늘 날짜가 있는 것이다. 
		    				 if ($("#web_channel_dis_"+date).next().length == 0){ 
		    					 $(html).insertAfter($("#web_channel_dis_"+date)); 
		    				 }else{ 
		    					 $(html).insertAfter($("#web_channel_dis_"+date).parent().find('.xman').last()); 
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
		    			 gap.scroll_move_to_bottom_time("channel_list", 200);	         
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
		    			 gap.scroll_move_to_bottom_time("channel_list", 200); 
		    		 }		     
		    		 //Dom객체를 짤라서 마지막에 추가했기 때문에 이벤트를 다시 정리해 줘야 한다. 
		    		 gBody3.__event_init_load(); 
		    	 } 
		     }		      
		     res.data.channel_code = channel_code; 
		     gBody3.update_reply_list(res.data);	     
		     $(".channel_reply_top").hide();		      
		     var obj = new Object(); 
		     obj.reply_id = reply_id; 
		     obj.id = channel_data_id; 
		     obj.channel_code = channel_code; 
		     obj.channel_name = gap.textToHtml(channel_name); 
		     obj.content = content; 
		     obj.resdata = res.data; 
		     obj.tempdata = gBody3.tempData; 
		     obj.owner = gap.userinfo.rinfo; 
		     gBody3.send_socket(obj, "mr"); 
		    }else{ 
		     gap.gAlert(gap.lang.errormsg); 
		   } 
		  }, 
		  error : function(e){ 
		    gap.gAlert(gap.lang.errormsg); 
		  } 
		 });
	},
	
	"edit_channel_data" : function(id, ch_code){
		var url = gap.channelserver + "/doc_info.km";
		var data = JSON.stringify({
			"id" : id
		});		
		gBody3.edit_mode = "T";		
		$.ajax({
			type : "POST",
			dataType : "json",
			url : url,
			data : data,
			success : function(res){			
				//편집을 클릭한 내용이 채널 텍스트인지, 에디터내용인지, 채널 파일인지 확인하고 처리한다.
				gBody3.select_doc_info = res.data;
				var info = res.data;			
				info.content = gap.textToHtml(info.content);				
				if ( (typeof(info.editor) != "undefined") && (info.editor != "")){
					//에디터로 작성된 문건인다.
					if (typeof(info.info) != "undefined"){
						//에디터로 작성된 문건이고 파일이 첨부되어 있다.
						gBody3.show_editor_edit(res.data, id);
					}else{
						//에디터로 작성된 문건이고 파일이 없는 경우						
						gBody3.show_editor_edit(res.data, id);
					}
				}else{
					//에디터로 작성된 건 아니다.
					if (typeof(info.info) == "undefined"){
						//일반 메시지로 작성된 문건이고 파일이 첨부되어 있다.
						if (info.type == "emoticon"){
							gBody3.show_emoticon_edit(res.data, id);
						}else{
							gBody3.show_msg_edit(res.data, id);
						}						
					}else{
						//일반 메시지로 작성된 문건이고 파일이 없는 경우
						if (info.type == "emoticon"){
							gBody3.show_emoticon_edit(res.data, id);
						}else{
							gBody3.show_file_edit(res.data, id);
						}						
					}
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		})		
	},
	
	"show_msg_edit" : function(info, id){
		gBody3.select_channel_id = id;
		gBody3.edit_mode = "T";
		gBody3.popup_status = "msg";
		gBody3.add_upload_file_list("","msg");		
		gap.showBlock();
		var inx = parseInt(gap.maxZindex()) + 1;	
		$("#f_u1").text(gap.lang.mup);
		$("#f_u2").text(gap.lang.scpp);		
		$("#fileupload_layer").css("z-index", inx);
		$("#fileupload_layer").fadeIn();
	},
	
	"show_file_edit" : function(info, id){		
		gBody3.select_channel_id = id;
		gBody3.edit_mode = "T";		
		gBody3.popup_status = "file";
		info.edit = "T";
		gBody3.add_upload_file_list(info, "file");	
		$("#f_u1").text(gap.lang.file + " " + gap.lang.upload);
		$("#f_u2").text(gap.lang.scpp);		
		gap.showBlock();	
		var inx = parseInt(gap.maxZindex()) + 1;
		$("#fileupload_layer").css("z-index", inx);
		$("#fileupload_layer").fadeIn();
		$("#total-progress_channel").show();
	},
	
	"show_emoticon_edit" : function(info, id){	
		gBody3.select_channel_id = id;
		gBody3.edit_mode = "T";		
		$("#open_emoticon2").qtip("hide");
		$("#fileupload_content").val("");	
		gBody3.popup_status = "emoticon";
		gBody3.add_upload_file_list("","emoticon");		
		var filepath = info.epath;
		$("#up_emoticon_img").attr("src", filepath);		
		$("#fileupload_content").mentionsInput('edit', gap.convert_mention_content(info.content));		
		gap.showBlock();		
		var inx = parseInt(gap.maxZindex()) + 1;
		$("#f_u1").text(gap.lang.mup);
		$("#f_u2").text(gap.lang.scpp);		
		$("#fileupload_layer").css("z-index", inx);
		$("#fileupload_layer").fadeIn();
	},	
	
	"show_editor_edit" : function(info, id){		
		gBody3.select_channel_id = id;
		gBody3.edit_editor = "T";		
		// 에디터 버튼 관련 처리
		$('#sub_channel_content').addClass('show-edit');
		$('#chat_bottom_dis').removeClass('minimize');
		$('#btn_editor_show').addClass('hide');		
		var message = info.editor;				
		message = message.replace(/&lt;/g, '<').replace(/&gt;/g, '>');		
		gBody3.editor_html = message;
		gBody3.change_editor_width();		
		$("#editor_iframe").attr("src",root_path+"/page/kEditor.jsp?docmode=edit");			
		var list = "";	
		list += '<optgroup label="'+gap.lang.sharechannel+'" id="share_channel_list_popup">';
		list += "<option value=''>"+gap.lang.channelchoice+"</option>";		
		var clist = gap.cur_channel_list_info;
		for (var k = 0 ; k < clist.length; k++){
			var citem = clist[k];
			if (citem.type != "folder"){
				list += "<option value='"+citem.ch_code+"'>" + citem.ch_name + "</option>";
			}			
		}		
		list += '</optgroup>';		
		$("#share_editor_list_popup").html(list);				
		$('#share_editor_list_popup').val(info.channel_code);
		$('#share_editor_list_popup').material_select();		
		gBody3.select_channel_code = info.channel_code;
		gBody3.select_channel_name = info.channel_name;	
		$('#share_editor_list_popup').on('change',function() {			
	        var selectedid = $(this).val();
	        var selectedText = $(".optgroup-option.active.selected").text();	       
	        gBody3.select_channel_code = selectedid;
	        gBody3.select_channel_name = selectedText;
	    });		
		$("#editor_dis").fadeIn();		
		$("#editor_close").off().on("click", function(e){
			$('#sub_channel_content').removeClass('show-edit');
			gBody3.edit_editor = "F";
			$("#upload_file_list_editor_edit").empty();
			$("#editor_title").val("");
			$("#editor_dis").fadeOut();
			$("#message_txt_channel").attr("disabled", false);
			$("#share_editor_list_popup").empty();
		});
		
		$('#btn_editor_hide').off().on('click', function(){
			$('#chat_bottom_dis').addClass('minimize');
			$('#btn_editor_show').removeClass('hide');
		});
		$('#btn_editor_show').off().on('click', function(){
			$('#chat_bottom_dis').removeClass('minimize');
			$('#btn_editor_show').addClass('hide');
		});
		
		$("#message_txt_channel").attr("disabled", true);	
		$("#editor_title").val(gap.textToHtmlBox(info.title));
		$("#editor_title").focus();		
		gBody3.delete_file_list = new Array();		
		var html = "";
		if (typeof(info.info) != "undefined"){			
			gBody3.draw_temp_file_list(info.info);
		}						
		gBody3.Fileupload_init();		
	},
	
	"draw_temp_file_list" : function(info){
		if (typeof(info) != "undefined"){
			$("#upload_file_list_editor_edit").empty();
			var html = "";
			for (var i = 0 ; i < info.length; i++){
				var fx = info[i];			
				var ext = gap.file_icon_check(fx.filename);
				var size = gap.file_size_setting(fx.file_size.$numberLong);					
				var fn = fx.filename;				
				html += "<li>";
				html += "	<span class='ico ico-file "+ext+"'></span>";
				html += "	<div class='attach-name'><span>"+fn+"</span><em>("+size+")</em></div>";
				html += "	<button class='ico btn-delete' data='"+fn+"' data2='"+fx.file_size.$numberLong+"' data3='"+fx.md5+"' data3='"+fx.file_type+"' onClick=\"gBody3.removeF_editor_edit(this)\">삭제</button>";
				html += "</li>";				
			}			
			$("#upload_file_list_editor_edit").append(html);
		}	
	},	
	
	"removeF_editor_edit" : function(obj){		
		var del_md5 = $(obj).attr("data3");
		gBody3.delete_file_list.push(del_md5);
		$(obj).parent().remove();
	},
	
	
	"sub_file_delete_send_server" : function(){	
		//gBody3.delete_file_list 배열안에 있는 md5값을 과 gBody3.select_channel_id 값을 활용해서 저장된 파일을 삭제합니다.
		var data = JSON.stringify({
			"id" : gBody3.select_channel_id,
			"md5" : gBody3.delete_file_list
		});			
		url = gap.channelserver + "/delete_sub_file_list.km";
		$.ajax({
			type : "POST",
			dataType : "json",
			url : url,
			data : data,
			success : function (res){
				if (res.result == "OK"){
										
					myDropzone_editor.processQueue();
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});		
	},
	
	"sub_file_delete_send_server2" : function(html){		
		//gBody3.delete_file_list 배열안에 있는 md5값을 과 gBody3.select_channel_id 값을 활용해서 저장된 파일을 삭제합니다.
		//에디터에서 기존에 파일이 있는 경우에 삭제하는 경우 호출되는 함수
		var data = JSON.stringify({
			"id" : gBody3.select_channel_id,
			"md5" : gBody3.delete_file_list
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
					if (typeof(gBody3.select_doc_info.info) != "undefined"){
						var original_doc_filecount = gBody3.select_doc_info.info.length;
						var cur_editor_delete_filecount = gBody3.delete_file_list.length;												
						if (original_doc_filecount != cur_editor_delete_filecount){
							//파일 업로드 형식으로 처리한다... 파일이 하나라도 남아있다는 이야기다
							type = "file";
						}else{
							type = "msg";
						}
					}else{
						type = "msg";
					}				
					//기존 파일을 모두 삭제한경우 일반 메시지 처럼 저장한다.
					var data = JSON.stringify({
						"type" : type,
						"channel_code" : gBody3.select_channel_code,
						"channel_name" : gBody3.select_channel_name,
						"email" : gap.userinfo.rinfo.em,
						"ky" : gap.userinfo.rinfo.ky,
						"owner" : gap.userinfo.rinfo,
						"content" : "",
						"editor" : html,
						"title" : myDropzone_editor.title,
						"id" : gBody3.select_channel_id,
						"msg_edit" : gBody3.edit_mode,
						"edit" : gBody3.edit_editor						
					});					
					gBody3.send_msg_to_server(data);
					$("#editor_close").click();					
					gap.scroll_move_to_bottom_time("channel_list", 200);
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
		
	},	

	"context_menu_call_file" : function(key, id, md5, ft, channel_code , fs, channel_name){		
		var url = "";		
		if (key == "delete"){			
			var msg = gap.lang.confirm_delete;			
			gap.showConfirm({
				title: "Confirm",
				contents: msg,
				callback: function(){
				var data = JSON.stringify({
					"id" : id,
					"md5" : md5,
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
							obj.channel_id = gBody3.cur_opt;
							obj.del_id = md5.replace(".","_");
							obj.channel_code = channel_code;
							obj.channel_name = gap.textToHtml(channel_name);
							obj.id = id;							
							gBody3.send_socket(obj, "dcf");
						}else{
							gap.gAlert(gap.lang.errormsg);
						}
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
					}
				});
				}
			});
		}else if (key == "favorite"){			
			var data = JSON.stringify({
				"id" : id,
				"md5" : md5,
				"type" : "2",
				"fserver" : gap.channelserver
			});
			url = gap.channelserver + "/copy_favorite.km";
			$.ajax({
				type : "POST",
				dataType : "json",
				url : url,
				data : data,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
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
		}else if (key == "copyurl"){
			var url = gap.search_file_convert_server(fs) + "/FDownload.do?id="+ id + "&md5="+ md5 + "&ty=2";
			gBody2.copy_file_url(url);
		}else if (key == "dmove"){
			gBody2.files_reg_drive_select_item(id + "-spl-" + md5);
		}
	},
	
	"file_context" : function(owner){
		if (owner == gap.search_cur_ky()){
			var items = {
				"favorite" : {name : gap.lang.favorite},
			//	"copyurl" : {name : gap.lang.copyurl},
				"sep00" : "----------------",
				"dmove" : {name : gap.lang.reg_on_drive},
				"sep01" : "----------------",
				"delete" : {name : gap.lang.basic_delete}
			}			
		}else{
			var items = {
				"favorite" : {name : gap.lang.favorite},
		//		"copyurl" : {name : gap.lang.copyurl},
				"sep00" : "----------------",
				"dmove" : {name : gap.lang.reg_on_drive}
			}			
		}
		return items;
	},	
	
	"reply_context" : function(owner){
			var items = {
					"edit" : {name : gap.lang.basic_modify},
					"sep01" : "----------------",
					"delete" : {name : gap.lang.basic_delete}
			}
		return items;
	},
	
	"direct_change_msg" : function (id, html, type){
		//보기 소트가 등록일일 경우 현재 메시지에 있는 텍스트 내용만 변경해야 하기 때문에 별도 함수를 만들어 사용한다. 2021.12.20		
		$("#ms_" + id).find(".name").html($(html).find(".name").html());
		if (type == "file"){
			//내용 처리하기
			$("#p_" + id).html($(html).find("p").html());			
			//파일 정보 업데이트 한다.				
			if ($(html).find(".message-file").length == 0){
				$("#ms_" + id).find(".message-file").remove();
			}else{
				$("#ms_" + id).find(".message-file").html("");
			}
			$("#ms_" + id).find(".message-file").html($(html).find(".message-file").html());		
			//이미지 파일 처리하기
			if ($(html).find(".img-content").length == 0){
				$("#ms_" + id).find(".img-content").remove();
			}else{
				$("#mfile_" + id).html($(html).find("#mfile_" + id).html());
			}					
		}else if (type == "editor"){
			$("#ms_" + id).find("h3").html($(html).find("h3").html());
			$("#ms_" + id).find(".wrap-editor-area").html($(html).find(".wrap-editor-area").html());			
		}else{
			$("#p_" + id).html($(html).find("p").html());
		}
		gBody3.__event_init_load();		
		gBody3.__draw_reply_event();
	},
	
	
	"direct_draw" : function(html, GMT, id, type, toastmsg){
		//현재 날짜의 날짜 Tag가 있는지 확인하고 없으면 추가한다.		
		if (gBody3.select_files_tab){
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
				datehtml += "<div class='date' id='web_channel_dis_"+date+"'><span>"+dis_date+"</span></div>";				
				if (gBody3.cur_todo != ""){
					var hx = $("#todo_channel_list .xman").length;
					if (hx == 0){
						$("#todo_channel_list").html(datehtml);				
					}else{
						$(datehtml).insertAfter($("#todo_channel_list .xman").children().last().parent());	
					}
				}else{
					var hx = $("#channel_list .xman").length;
					if (hx == 0){
						$("#channel_list").html(datehtml);				
					}else{
						$(datehtml).insertAfter($("#channel_list .xman").children().last().parent());
					}
				}				
			}			
			if (cnt == 0){
				$(html).insertAfter($("#web_channel_dis_"+date).last());
			}else{
				if ($("#web_channel_dis_"+date).next().length == 0){
					$(html).insertAfter($("#web_channel_dis_"+date));
				}else{
					$(html).insertAfter($("#web_channel_dis_"+date).parent().find('.xman').last());
				}
			}	
			if (len > 0){
				//댓글이 있는 경우 표시해 줘야 한다.
				if (typeof(gBody3.select_doc_info.reply) != "undefined"){
					var item = gBody3.select_doc_info;
					var xhtml = gBody3.draw_reply(item);
					var parent = $("#ms_" + item._id.$oid).find(".channel_reply_top");  //댓글 디지안과 구조가 변경되어 수정합니다.					
					$("#rdis_" + id).text(item.reply.length);
					$("#rcount_" + id).text(item.reply.length);
					$(xhtml).insertBefore(parent);
				}
			}
			 
			if (gap.cur_window == "chat" || gap.cur_window == "channel" ){							
				if (gBody3.prevent_auto_scrolling == 2 || type == ""){
					gap.scroll_move_to_bottom_time("channel_list", 500);
				}else{
					if (gBody3.scroll_bottom < 100){
						mobiscroll.toast({message:toastmsg, color:'info'});
					}else{
						gap.scroll_move_to_bottom_time("channel_list", 500);
					}					
				}				
			}else if (gap.cur_window == "todo"){
				//todo에서 첨부파일은 하나당 한줄씩 표시한다.
				$(".wrap-channel .message-file li").css("width", "100%");
				if (gBody3.prevent_auto_scrolling == 2 || type == ""){
					gap.scroll_move_to_bottom_time("todo_channel_list", 500);
				}			
			}		
			gBody3.__event_init_load();		
			gBody3.__draw_reply_event();
		}	
	},
		
	"send_emoticon_msg" : function(fname){
		//if ( (gBody3.cur_opt == "allcontent") ||(gBody3.cur_opt == "mycontent") ||(gBody3.cur_opt == "sharecontent") ||(gBody3.cur_opt == "favoritecontent") ){
			//이경우 메시지를 어떤 채널에 추가할지를 선택하는 창을 띄워야 한다.
		$("#open_emoticon2").qtip("hide");
		$("#fileupload_content").val("");	
		gBody3.popup_status = "emoticon";
		gBody3.add_upload_file_list("","emoticon");			
		var filepath = "/resource/images/emoticons/" + fname;
		$("#up_emoticon_img").attr("src", filepath);			
		gap.showBlock();			
		var inx = parseInt(gap.maxZindex()) + 1;
		$("#f_u1").text(gap.lang.mup);
		$("#f_u2").text(gap.lang.scpp);			
		$("#fileupload_layer").css("z-index", inx);
		$("#fileupload_layer").fadeIn();
	},	
	
	"send_file" : function(){	
		var json = myDropzone_channel.files_info;		
		if ( (gBody3.cur_opt == json.channel_code) || (gBody3.cur_opt == "allcontent") || (gBody3.cur_opt == "mycontent")){
			var GMT = json.GMT;
			var doc = new Object();
			doc.GMT = GMT;			
			doc.channel_code = gBody3.select_channel_code2;
			doc.channel_name = gap.textToHtml(gBody3.select_channel_name2);
			doc.email = gap.userinfo.rinfo.em;
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
			if (typeof(json.doc_info.ex) != "undefined"){
				doc.ex = json.doc_info.ex;
			}		
			var date = gap.change_date_localTime_only_date(GMT);			
			doc.ky = gap.userinfo.rinfo.ky;			
			var html = gBody3.draw_file(doc, date);		
			if (gBody3.edit_mode == "T" && gBody3.post_view_type == "2"){
				gBody3.direct_change_msg(doc._id, html, "file");
			}else{
				gBody3.direct_draw(html, json.GMT, json.id, "", "");
			}
			doc.date = date;
			gBody3.send_socket(doc, "fs");
		}
	},	
	
	"sendMessage" : function(evt){		
	    gBody3.edit_editor = "F";
	    gBody3.edit_mode = "F";
	    gBody3.select_channel_id = "";	    
		if ( gBody3.check_top_menu() ){
			//이경우 메시지를 어떤 채널에 추가할지를 선택하는 창을 띄워야 한다.
			gBody3.popup_status = "msg";
			gBody3.add_upload_file_list("","msg");			
			gap.showBlock();
			var inx = parseInt(gap.maxZindex()) + 1;			
			$("#f_u1").text(gap.lang.mup);
			$("#f_u2").text(gap.lang.scpp);			
			$("#fileupload_layer").css("z-index", inx);
			$("#fileupload_layer").fadeIn();			
		}else{			
			var msg = $("#message_txt_channel").val();
			var type = "msg";			
			if (msg.trim() == ""){
				mobiscroll.toast({message:gap.lang.input_message2, color:'danger'});
				//gap.gAlert(gap.lang.input_message);
				return false;
			}	
			//메시지 내용에 URL이 포함되어 있는지 확인한다.			
			var og = gBody3.og_search(msg);			
			//mention 처리 /////////////////////////////////////////////////////////////
			var mentions_msg = "";
			var mentions_data = "";
			$("#message_txt_channel").mentionsInput('val', function(text){
				mentions_msg = gap.textMentionToHtml(text);;
			});
			$("#message_txt_channel").mentionsInput('getMentions', function(data) {
				mentions_data = data;
			});
			///////////////////////////////////////////////////////////////////////////			
			var data = JSON.stringify({
				"type" : "msg",
				"channel_code" : gBody3.select_channel_code,
				"channel_name" : gBody3.select_channel_name,
				"email" : gap.userinfo.rinfo.em,
				"ky" : gap.userinfo.rinfo.ky,
				"owner" : gap.userinfo.rinfo,
				"content" : mentions_msg, //msg,
				"mention" : mentions_data,
				"edit" : gBody3.edit_editor,
				"msg_edit" : gBody3.edit_mode,
				"id" : gBody3.select_channel_id,
				"og" : og
			});		
			gBody3.send_msg_to_server(data);		
		}		
	    evt.stopPropagation();
	    evt.preventDefault();
	},	
	
	"send_msg_to_server" : function(data){		
		//댓글에 파일 저장을 위해서 원본 문서에 fserver를 저장해야 한다.
		var pdata = JSON.parse(data);
		pdata.fserver = gap.channelserver;
		tdata = JSON.stringify(pdata);		
		var url = gap.channelserver + "/send_msg.km";
		$.ajax({
			type : "POST",
			dataType : "text",   //<<== "json"을  text로 변경한 것은 입력 내용에 ?? 가 2개 이상 있을 경우 JQuery오류가 발생해서 변경함 // 대신 리턴값을 JSON.parse로 처리해야 함
		//	contentType : "application/json; charset=utf-8",
			data : tdata,
			url : url,
			success : function(ress){
				var resx= JSON.parse(ress);				
				if (resx.result == "OK"){					
					var res = resx.data.docinfo;					
					var GMT = resx.GMT;
					var GMT2 = res.GMT2;
					var doc = new Object();
					doc.GMT = GMT;
					doc.GMT2 = res.GMT2;					
					var ssl = gBody3.select_channel_code2;
					var sslname = gBody3.select_channel_name2;
					if (typeof(ssl) == "undefined"){
						ssl = gBody3.select_channel_code;
					}
					if (typeof(sslname) == "undefined"){
						sslname = gBody3.select_channel_name;
					}			
					//공지사항 체크하기
					var ty = "";					
					if (typeof(res.ty) != "undefined"){
						doc.ty = res.ty;
					}
					doc.channel_code = ssl;
					doc.channel_name = gap.textToHtml(sslname);					
					doc.email = gap.userinfo.rinfo.em;
					doc.ky = gap.userinfo.rinfo.ky;
					var jj = JSON.parse(data);
					doc.content = jj.content;
					doc.owner = gap.userinfo.rinfo;
					doc.type = jj.type;				
					if (jj.edit == "T"){
						doc._id = jj.id;						
					}else{
						doc._id = res._id.$oid;
					}				
					if (gBody3.isTempSave == "T"){
						doc._id = res._id.$oid;
					}
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
					if (typeof(res.notice_id) != "undefined"){
						//메일 처럼 다른 시스템에서 호출되는 경우 처리한다.
						doc.notice_id = res.notice_id;
					}
					var date = "";
					date = gap.change_date_localTime_only_date(GMT);				
					var html = "";					
					if (doc.type == "file"){
						//에디터에서 작성한 첨부가 있는 파일을 편집해서 재 저장한 경우 여기를 타지만 파일로 인식해야 한다.
						doc.fserver = res.fserver;
						doc.info = res.info;
						doc.upload_path = res.upload_path;
						html = gBody3.draw_file(doc, jj.type, date);
					}else{					
						if (res.tyx == "notice"){
							doc.tyx = "notice";
							
						}
						html = gBody3.draw_msg(doc, jj.type, date);
					}					
				//	if (myDropzone_editor.save_type != "temp"){
						//임시 저장이 아닌 경우만 처리한다.
						if ((ssl == gBody3.cur_opt) || (gBody3.cur_opt == "allcontent") || (gBody3.cur_opt == "mycontent")){	
							var sGMT = "";
							sGMT = res.GMT;						
							/////////////////////////////////////////////////////////////////////////
							if (gBody3.edit_mode == "T" && gBody3.post_view_type == "2"){
								//수정하는 경우이고 보기 소트가 작성일일 경우 해당 채널에 메시지 텍스트만 변경한다.	
								if (res.type == "file"){
									gBody3.direct_change_msg(doc._id, html, "file");
								}else if (typeof(doc.editor) != "undefined" && doc.editor != ""){
									gBody3.direct_change_msg(doc._id, html, "editor");
								}else{
									gBody3.direct_change_msg(doc._id, html, "msg");
								}							
							}else{
								gBody3.direct_draw(html, sGMT, doc._id, "", "");
							}					
							doc.date = date;
							doc.edit = gBody3.edit_mode;
							doc.res = res;
							doc.doctype = doc.type;						
							gBody3.send_socket(doc, "ms");
						}					
						if (jj.channel_code != gBody3.cur_opt){
							if ((gBody3.cur_opt != "allcontent") && (gBody3.cur_opt != "mycontent")){
								//채널을 이동하는 경우로 현재 창에 띄워진 메시지 내용을 제거한다.
								$("#ms_" + jj.id).remove();
							}
						}
					    // mention div 영역 초기화
						gap.reset_mentions_div();					
						$("#message_txt_channel").val("");
						$("#message_txt_channel").attr("rows", 0);
						$("#message_txt_channel").css("height", "38px");
					    $("#message_txt_channel").attr("placeholder",gap.lang.input_message2);			    
					    gBody3.edit_editor = "F";
					    gBody3.edit_mode = "F";
					    gBody3.select_channel_id = "";			   
					  //모바일  Push를 날린다. ///////////////////////////////////
						var smsg = new Object();
						smsg.msg = "[" + gBody3.select_channel_name + "] " + gap.lang.nmsg;
						smsg.title = gap.systemname + "["+gap.lang.channel+"]";			
						smsg.type = "ms";
						smsg.key1 = ssl;
						smsg.key2 = "";
						smsg.key3 = sslname;
						smsg.fr = gap.userinfo.rinfo.nm;
						//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
						var mlist = JSON.parse(data);
						if (typeof mlist.mention != "undefined" && mlist.mention.length > 0){
							// mention 관련 데이터가 있는 경우
							var slist = [];
							for (var i = 0; i < mlist.mention.length; i++){
								slist.push(mlist.mention[i].id);
							}
							smsg.sender = slist.join("-spl-");						
						}else{						
							smsg.sender = gBody3.search_cur_channel_member(ssl).join("-spl-");	
						}														
						//gap.push_noti_mobile(smsg);					
						//만약 첫번째 컨텐트를 저장한 경우 스크로 컨트롤을 해주서야 한다.					
						var llp = $("#channel_list .xman").length;
						if (llp == 1){
							gBody3.sc();
						}
						////////////////////////////////////////////////////
						gap.change_cur_channel_read_time(gBody3.cur_opt, resx.GMT);		
						
						//알림선터에 알림을 전송한다. "alarm_center_msg_save" : function(receivers, nid, sendername, msg){
						var receivers = smsg.sender.split("-spl-");
						//var sendername = gap.user_check(gap.userinfo.rinfo).disp_user_info;
						var sendername = "["+gap.lang.channel+" : "+doc.channel_name+"]"
						var rid = ssl;
						var msg2 = smsg.msg;
						
						if (doc.ex){
							if (doc.ex.type == "vote"){
								msg2 = gap.lang.va001;
							}else if (doc.ex.type == "todo"){
								msg2 = gap.lang.newtodo;
							}else if (doc.ex.type == "mail"){
								msg2 = gap.lang.mail + " " +  gap.lang.share + " : " + doc.ex.title
							}else if (doc.ex.type == "aprv"){
								msg2 = '"' + doc.ex.title + '"' + " " + gap.lang.va003;
							}else if (doc.ex.type == "bbs"){
								msg2 = '"' + doc.ex.title + '"' + " " + gap.lang.va004;
							}
						}else if (doc.title){
							msg2 = doc.title
						}else if (doc.doctype == "emoticon"){
							msg2 = gap.lang.va002;
						}else{
							msg2 = doc.content;
						}					//doc.ex.type : "vote","todo","mail", / doc.type에 따라 msg(title가 있으면 에디터에서 작성), emoticon,
						
						if (doc.ex && doc.ex.type =="channel_meeting"){						
						}else{
							gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
						}
						
														
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
	},
	
	"mobile_push_drive" : function(data){
		
		//모바일  Push를 날린다. ///////////////////////////////////
		var smsg = new Object();
		smsg.title = gap.systemname + "["+gap.lang.channel+"]";
		smsg.msg = "[" + gap.textToHtml(data.channel_name) + "] " + gap.lang.nmsg;
		smsg.type = "ms";
		smsg.key1 = data.channel_code;
		smsg.key2 = "";
		smsg.key3 = gap.textToHtml(data.channel_name);
		smsg.fr = gap.userinfo.rinfo.nm;
		//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
		smsg.sender = gBody3.search_cur_channel_member(data.channel_code).join("-spl-");				
		//gap.push_noti_mobile(smsg);		
		
		//알림센터에 푸쉬 보내기
		var rid = data.channel_code;
		var receivers = smsg.sender.split("-spl-");
		var msg2 = "[" + gap.textToHtml(data.channel_name) + "] " + gap.lang.nmsg;
		var sendername = "["+gap.lang.drive+" : " +gap.textToHtml(data.channel_name) +"]"
		gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);	
	},	
	
	"enter_next_line" : function(evt){
		var $el = $(evt.target);		
		// mention 으로 인해 기존 ling-height 23px -> 20px 로 변경
		$el.height($el.height() + 20);      	
    	var countRows = $el.val().split(/\r|\r\n|\n/).length;   
    	$el.attr("rows", countRows + 1);
    	evt.stopPropagation();
	},	
	
	"enter_line_control" : function(evt){
		var $el = $(evt.target);		
		var is_reply = ($el.attr('id').indexOf('reply_compose_') != -1 ? true : false);
		var padding = is_reply ? 13 : 9;
		// mention 으로 인해 기존 ling-height 23px -> 20px 로 변경
		var countRows = $el.val().split(/\r|\r\n|\n/).length;
		$el.height((countRows * 20) + padding);		
		$el.attr("rows", countRows);
    	evt.stopPropagation();
	},
	
	"enter_next_line_reply" : function(evt){
		var _id = $(evt.target).attr("id");
		$("#" + _id).height($("#" + _id).height() + 20);      	
    	var countRows = $("#" + _id).val().split(/\r|\r\n|\n/).length;   
    	$("#" + _id).attr("rows", countRows + 1);
    	evt.stopPropagation();
	},
	
	"enter_line_control_reply" : function(evt){
		var _id = $(evt.target).attr("id");
		var countRows = $("#" + _id).val().split(/\r|\r\n|\n/).length;
		if (countRows == 1){
			$("#" + _id).height('35');			
		}else{
			$("#" + _id).height((countRows * 20) + 14);
		}
		$("#" + _id).attr("rows", countRows);
    	evt.stopPropagation();
	},
	
	"enter_line_control_reply_calc" : function(e){
		var _id = $(e.target).attr("id");
		var _h = $(e.target).parent().find('.mentions > div').outerHeight();
		_h = (_h <= 35 ? 35 : _h);
		$("#" + _id).height(_h);
		e.stopPropagation();
	},
	
	"clear_dropzone" : function(){
		$("#total-progress_channel").hide();
		myDropzone_channel.removeAllFiles(true);
		$("#upload_file_list").empty();
	},
	
	"hide_upload_layer" : function(){
		$("#fileupload_layer").fadeOut();		
	},
	
	"complete_process_channel" : function(){
		$("#total-progress_channel .progress-bar").fadeOut(function(){
			document.querySelector("#total-progress_channel .progress-bar").style.display = "none";
			document.querySelector("#total-progress_channel .progress-bar").style.width = "0%";
		});
	},
	
	"add_upload_file_list" : function(file, type){
		var list = "";	
		list += '<optgroup label="'+gap.lang.sharechannel+'" id="share_channel_list_popup">';
		list += "<option value=''>"+gap.lang.channelchoice+"</option>";	
		var clist = gap.cur_channel_list_info;
		for (var k = 0 ; k < clist.length; k++){
			var citem = clist[k];
			if (citem.type != "folder"){
				list += "<option value='"+citem.ch_code+"'>" + citem.ch_name + "</option>";
			}			
		}		
		list += '</optgroup>';		
		$("#share_channel_list_popup").html(list);	
		//편집을 위해 현재 선택되 문서의 모든 정보를 가지고 있는 변수
		var info = gBody3.select_doc_info;
		if (gBody3.edit_mode == "T"){			
			$('#share_channel_list_popup').val(info.channel_code);
			$('#share_channel_list_popup').material_select();
			
			gBody3.select_channel_code2 = info.channel_code;
			gBody3.select_channel_name2 = info.channel_name;
		}else{
			$('#share_channel_list_popup').val(gBody3.cur_opt);
			$('#share_channel_list_popup').material_select();
		}
		$('#share_channel_list_popup').on('change',function() {			
	        var selectedid = $(this).val();
	        var selectedText = $(".optgroup-option.active.selected").text();	       
	        gBody3.select_channel_code2 = selectedid;
	        gBody3.select_channel_name2 = selectedText;
	    });		
		$("#file_upload_add").show();
		$("#fileupload_content").show();
		$("#ex_body_dis").hide();
		if (type == "file"){
			$("#file_upload_add").show();
			$("#up_emoticon").hide();			
			if ( (gBody3.edit_mode == "T") && (typeof(file.edit) != "undefined")){				
				$("#upload_file_list_edit").show();
				$("#upload_file_list").css("max-height","150px");
				$("#fileupload_content").mentionsInput('edit', gap.convert_mention_content(file.content));				
				gBody3.delete_file_list = new Array();				
				var html = "";
				if (typeof(info.info) != "undefined"){
					for (var i = 0 ; i < info.info.length; i++){
						var fx = info.info[i];			
						var ext = gap.file_icon_check(fx.filename);
						var size = gap.file_size_setting(fx.file_size.$numberLong);						
						var fn = fx.filename;					
						html += "<li>";
						html += "	<span class='ico ico-file "+ext+"'></span>";
						html += "	<div class='attach-name'><span>"+fn+"</span><em>("+size+")</em></div>";
						html += "	<button class='ico btn-delete' data='"+fn+"' data2='"+fx.file_size.$numberLong+"' data3='"+fx.md5+"' data3='"+fx.file_type+"' onClick=\"gBody3.removeF_file_edit(this)\">삭제</button>";
						html += "</li>";				
					}				
					$("#upload_file_list_edit").append(html);
				}
			}else{								
				var html = "";
				for (var i = 0 ; i < file.length; i++){
					var fx = file[i];			
					var ext = gap.file_icon_check(fx.name);
					var size = gap.file_size_setting(fx.size);					
					html += "<li>";
					html += "	<span class='ico ico-file "+ext+"'></span>";
					html += "	<div class='attach-name'><span>"+fx.name+"</span><em>("+size+")</em></div>";
					html += "	<button class='ico btn-delete' data='"+fx.name+"' data2='"+fx.size+"' onClick=\"gBody3.removeF(this)\">삭제</button>";
					html += "</li>";						
				}			
				$("#upload_file_list").append(html);
			}		
		}else if (type == "msg"){			
			if (gBody3.edit_mode == "T"){
				$("#up_emoticon").hide();			
				$("#fileupload_content").mentionsInput('edit', gap.convert_mention_content(info.content));		
			}else{
				$("#up_emoticon").hide();		
				$("#fileupload_content").val($("#message_txt_channel").val());
			}		
		}else if (type == "emoticon"){
			$("#file_upload_add").hide();
			$("#up_emoticon").show();
			
		}else if (type == "mail"){
			$("#file_upload_add").hide();
			$("#fileupload_content").hide();
			$("#ex_body_dis").show();
		}
	},
	
	"removeF_file_edit" : function(obj){		
		var del_md5 = $(obj).attr("data3");
		gBody3.delete_file_list.push(del_md5);
		$(obj).parent().remove();
	},
	
	"removeF" : function(obj){
		$(obj).parent().remove();		
		var filename = $(obj).attr("data");
		var size = $(obj).attr("data2");				
		var list = myDropzone_channel.files;		
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];
			if ( (filename == item.name) && (size == item.size)){
				$("#total-progress_channel").hide();
				myDropzone_channel.removeFile(item);
				break;
			}
		}
	},
	
	"removeRF" : function(obj){		
		$(obj).parent().remove();		
		var filename = $(obj).attr("data");
		var size = parseInt($(obj).attr("data2"));				
		var list = gBody3.cur_reply_attach.files;		
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];
			if ( (filename == item.name) && (size == item.size)){
				gBody3.cur_reply_attach.removeFile(item);
				break;
			}
		}
	},	
	
	"bofore_data_remove" : function(){		
		$("#channel_list #grid_wrap").remove();		
		$("#channel_list .xman").remove();
		$("#channel_list .date").remove();
	},
	
	"show_channel_content" : function(){		
		gap.show_content("channel");
		$('.channel-header .tabs').tabs();
		$("#allcontent").click();		
	},	
	
	"channel_right_frame_draw" : function(channel_id){
		//gap.cur_channel_list_info 배열에서 channel_id 값을 찾아와서 멤버를 표시한다.		
	},
	
	"tab_click_event" : function(){	
		//files 탭 버튼 영역 초기화
		$("#view_mode_tab").hide();	
		$("#sub_channel_content .tab a").removeClass("active");
		$('.channel-header .tabs').tabs();		
		$("#sub_channel_content .tab a").off();
		$("#sub_channel_content .tab a").on("click", function(inx){
			var res = gap.checkEditor();
			if (!res) return false;		
			$("#sub_channel_content .tab a").removeClass("active");					
			$(this).addClass("active");			
			gap.cur_window = "channel";			
			// 에디터 전환 버튼 표시/숨김
			if (inx.target.id == "conversations_tab"){
				$('#btn_editor_change').removeClass('hide');
				$('#notice_top_work').removeClass('hide');
			} else {
				$('#btn_editor_change').addClass('hide');
				$('#btn_editor_show').addClass('hide');
				$('#notice_top_work').addClass('hide');
			}			
			if (inx.target.id == "conversations_tab"){				
				$("#realtime_video").show();
				$("#channel_list").empty();
				$("#channel_top_list").css("padding", "20px 20px 14px 20px");
				$("#channel_list").css("height", "100%");				
				gBody3.select_files_tab = false;
				$("#view_mode_tab").hide();
				$("#channel_list").removeAttr('class');
				$("#channel_list").addClass("wrap-channel");
				$(".channel-search").show();
				$("#chat_bottom_dis").show();
				$("#channel_add_member").show();				
				//Plugin 실행후 다시 Box UI로 돌아가는 함수 호출				
				gBody3.bofore_data_remove();
				gBody3.draw_channel_list();				
				//플러그인 갔다가 converstion 클릭할대 드래그& 드롭 이벤트를 재설정 한다.
				gBody3.channel_init("channel_list");
				gBody3.toggle_event();			
				if (gBody3.check_top_menu_box(gBody3.cur_opt)){					
				}else{
					gBody3.draw_channel_members(gBody3.select_channel_code2);
				}			
			}else if (inx.target.id == "files_tab"){			
				//Plugin 실행후 다시 Box UI로 돌아가는 함수 호출
				
			//	gBody3.backto_box_layout();
				$("#realtime_video").hide();
				$("#chat_bottom_dis").hide();
				$("#channel_list").empty();
				$("#channel_top_list").css("padding", "40px 20px 0px 20px");
				$("#channel_list").css("height", "100%");				
				gBody3.select_files_tab = true;
				gBody3.hide_conversation_config();
				$("#view_mode_tab").show();
				$("#channel_list").removeAttr('class');
				$("#channel_list").addClass("wrap-channel");
				$(".channel-search").show();
				$("#channel_add_member").show();				
				gBody2.draw_files(1);				
				//플러그인 갔다가 converstion 클릭할대 드래그& 드롭 이벤트를 재설정 한다.
				gBody3.channel_init("channel_list");
				gBody3.toggle_event();
			}else if (inx.target.id == "channel_todo"){	
						
				$("#realtime_video").hide();
				gBody3.select_files_tab = false;
				gBody3.hide_conversation_config();
				gTodo.cur_todo_code = gBody3.select_channel_code;
				gTodo.cur_todo_name = gBody3.select_channel_name;
				gTodo.cur_todo_caller = "plugin";
				gBody3.cur_todo = "status";
				gap.cur_window = "todo";				
				$(".channel-search").hide();
				$("#channel_add_member").hide();
				
				gTodo.todo_call_status_plugin();		
				$("#channel_right").show();		
			}else if (inx.target.id == "channel_collect"){
				gBody3.select_files_tab = false;
				gBody3.hide_conversation_config();
			}else{
			}			
		});		
	},
		
	"backto_box_layout" : function(){	
		$("#channel_list").empty();
		$("#channel_top_list").css("padding", "20px 20px 14px 20px");
		$("#channel_list").css("height", "100%");
		$("#channel_list").addClass("wrap-channel");
		$("#channel_list").removeClass("left-area todo fold-temp");				
		$("#channel_right").show();
		$("#member_layer_close2").click();	
		//우측 상단 검색창을 연다.
		$(".channel-search").show();	
	},
		
	"delete_channel_data" : function(id, channel_code, channel_name, scheduleid){		
		var msg = gap.lang.confirm_delete;	
		gap.showConfirm({
			title: "Confirm",
			contents: msg,
			callback: function(){
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
						var ddx = $("#ms_" + id).attr("data");
						$("#ms_" + id).fadeOut().remove();
						//date항목을 삭제해야 할지 체크하는 로직입니다.
						var last_className = $("#web_channel_dis_" + ddx).next().attr("class");
						if (last_className != "xman"){
							$("#web_channel_dis_" + ddx).remove();
						}						
						var obj = new Object();
						obj.id = id;
						obj.channel_code = channel_code;
						obj.channel_name = gap.textToHtml(channel_name);					
						gBody3.send_socket(obj, "del_msg");						
						//통합회의 시스템에 회의가 삭제되었음을 알린다.					
						if (typeof(scheduleid) != "undefined" && scheduleid != ""){
							gMet.callMeetingRemove(scheduleid);
						}
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
		});		
	},
	
	
	
	"like_channel_data" : function(id, email){		
		if (email == gap.userinfo.rinfo.em.toLowerCase()){
			gap.gAlert(gap.lang.nolike);
			return false;
		}else{
			var url = gap.channelserver + "/channel_data_like.km";			
			var data = JSON.stringify({
				"id" : id,
				"owner" : gap.userinfo.rinfo
			});			
			$.ajax({
				type : "POST",
				dataType : "json",
				contenType : "application/json; charset=utf-8",
				data : data,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				url : url,
				success : function(res){					
					if (res.result == "OK"){	
						$("#like_" + id).html(res.data.count);
					
					}else if (res.result == "EXIST"){
						gap.gAlert(gap.lang.badded);
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
				}
			});
		}		
	},
		
	"notice_channel_data" : function(key, id){
		//key 업무방 코드 , id : 컨텐츠 아이디
		var msg = gap.lang.mn5;	 			
		gap.showConfirm({
			title: "Confirm",
			contents: msg,
			callback: function(){
				//해당 컨텐츠를 공지로 등록한다.
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
						if (res.result == "OK"){
							var item = res.data;
							var date = "";
							var dis_date = "";
							if (gBody3.post_view_type == "2"){
								//등록일 순으로 표시한다.
								 date = gap.change_date_localTime_only_date(item.GMT2);
								 dis_date = gap.change_date_default(gap.change_date_localTime_only_date(item.GMT2));
							}else{
								//최신 업데이트 순으로 표시한다.
								 date = gap.change_date_localTime_only_date(item.GMT);
								 dis_date = gap.change_date_default(gap.change_date_localTime_only_date(item.GMT));
							}									
							if (item.type == "msg"){
								var html = gBody3.draw_msg(item, "msg", date);
							}else if (item.type == "file"){
								var html = gBody3.draw_file(item, date);
							}else if (item.type == "emoticon"){
								var html = gBody3.draw_msg(item, "emoticon", date);
							}else if (item.type == "ogtag"){
								
							}						
							gBody3.direct_draw(html, item.GMT, item._id.$oid, "", "");						
							gBody.drawNoticeWork();
							
							//등록된 공지를 전송한다.
							item.direct = "T";
							//data.channel_code = item.channel_code;
							gBody3.send_socket(item, "ms");
							
							
//							//업무방 멤버에서 공지 등록을 알린다.
//							var list = gap.cur_room_search_info_member_ids(gBody3.cur_opt);						
//							var obj = new Object();
//							obj.sender = list;
//							obj.room_key = item.channel_code;						
//							_wsocket.send_msg_other(obj, "reg_notice_channel");	



							//알림센터에 푸쉬 보내기
						//	var perkey = gBody.select_per_key || gBody3.cur_per_key() || item.per_key;
							var perkey = "";
							var mlist = item;
							var smsg  = new Object();
							smsg.msg = "[" + item.channel_name + "] " + gap.lang.mn3;
						//	smsg.title = gap.systemname + "["+gap.lang.channel+"]";		
							smsg.title = "["+gap.lang.channel+" : "+ gap.textToHtml(item.channel_name) +"]";
							smsg.type = "ms";
							smsg.key1 = item.channel_code;
							smsg.key2 = "";
							smsg.key3 = item.channel_name;
							smsg.fr = gap.userinfo.rinfo.nm;
							smsg.per_key = perkey;
							if (typeof mlist.mention != "undefined" && mlist.mention.length > 0){
								// mention 관련 데이터가 있는 경우
								var slist = [];
								for (var i = 0; i < mlist.mention.length; i++){
									slist.push(mlist.mention[i].id);
								}
								smsg.sender = slist;						
							}else{						
								smsg.sender = gap.cur_room_search_info_member_ids2(item.channel_code);
							}		
							
							var rid = item.channel_code;
							var receivers = smsg.sender;
							var msg2 = gap.lang.mn3;
							var sendername = "["+gap.lang.channel+" : "+ gap.textToHtml(item.channel_name) +"]";
							gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);		
							
						}else{
							gap.gAlert("File move error !");
						}
						
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
					}
				});		
			}
		});		
	},
	
	"draw_channel_members" : function(id){		
		var list = gBody3.search_channel_members(id);	
		gBody3.draw_members('C', list);
	},
	
	"draw_drive_members" : function(id){		
		var list = gBody3.search_drive_members(id);
		gBody3.draw_members('D', list);
	},
	
	"draw_folder_members" : function(){
		var list = gBody3.search_folder_members();
		gBody3.draw_members('F', list);
	},	
	
	"draw_members" : function(kind, list){
		
		$("#sub_channel_content").css("width","calc(100% - 315px)"); //확장하고 접고하는 과정에서 수정되기 때문에 초기화 해준다.
		gBody3.right_window_open = true;
		gBody3.member_list_show();		
		if (typeof(list) == "undefined"){
			return false;
		}	
		var owner = list.owner;
		var owner_info = gap.user_check(owner);
		var html = "";		
		var is_admin = false;
		if (owner.ky == gap.userinfo.rinfo.ky){
			if (kind != "F"){
				//폴더는 owner 변경을 하지 않는다.
				is_admin = true;	
			}
		}		
		var user_photo = gap.person_profile_photo(owner);		
		$("#user_profile").hide();
		var html = "";
		html += "	<div class='aside-wide' style='height:100%' >";
		html += "		<div class='close_box'><button type='button' class='pop_btn_close' id='member_layer_close2'></button></div>";
		html += "		<div class='office_const'>";
		html += "			<h2>Owner</h2>";
		html += "			<div class='o_const_list' style='margin-top:10px'>";
		html += "				<div class='office_mem_card'>";
		html += "					<div class='office_prof user'>";
		html += '						<div class="photo-wrap" style="background-image:url(' + gap.person_photo_url(owner) + '),url("+gap.none_img+");"></div>';				
		html += "						<span data-status='status_"+owner.ky+"' style='top:6px; left:7px' class='status offline'></span>";
		html += " 						<button data-phone='phone_"+owner.ky+"' type='button' style='position:absolute'></button>";
		html += "					</div>";
		html += "					<div class='office_right' style='width: 64%;'>";	
		html += "						<div class='office_mem_name'>";
		html += "							<span data-day='day_"+owner.ky+"' style='display:none'></span>";
		html += "							" + owner_info.name + "";
		html += "							<span class='rank'>" + owner_info.jt + "</span>";	
		html += "						</div>";		
		html += "						<div class='office_mem_info'>";
		html += "							<p>" + owner_info.dept + "</p>";
		html += "							<p class='company'>" + owner_info.company + "</p>";
		html += "						</div>";		
//		html += "						<div class='office_mem_info'>";
//		html += "							<p class='company' style='font-size:12px; color:blue' data-smsg='smsg_"+owner.ky+"'>여기 표시되어야 한다. 여기 표시되어야 한다. 여기 표시되어야 한다.</p>";
//		html += "						</div>";
		html += "					</div>";
		html += "					<div class='abs hover-box'>";
		html += "						<div class='inner f_between f_middle'>";
		html += "							<span class='ico ico-chat' title='"+gap.lang.startChat+"' data-name='"+name+"' data-key='"+owner.ky+"'>채팅</span>";
//		if (use_tel == "1"){
			html += "							<span class='ico ico-phone' data-ky='"+owner.ky+"' title='"+gap.lang.mobile+"'>전화</span>";
//		}		
		html += "							<span class='ico ico-profile' data-ky='"+owner.ky+"' title='"+gap.lang.openprofile+"'>프로필</span>";		
		var expire = "";
		if ( typeof(gap.cur_room_search_info(gBody3.cur_opt).owner_expire) != "undefined"){
			expire = gap.cur_room_search_info(gBody3.cur_opt).owner_expire;
		}
		if (is_admin || expire == "T"){
			html += "							<div class='group_right_pop' style='position:unset;width:0px' id='owner-info'><div class='user-remove' data-key='"+owner.ky+"'><span></span></div></div>";		
		}		
		html += "						</div>";
		html += "					</div>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		html += "";	
		var lists = [];
		lists.push(owner.ky);		
		var members = list.member;
		if ( (typeof(members) == "undefined") || (members.length == 0)){
			//return false;
		}else{			
			html += "<div class='office_part' style='height:100%' >";
			html += "	<h2 style='margin-bottom:10px'>Member ("+members.length+")<button class='ico btn-more bl' id='members_fnc_box'>더보기</button></h2>";
			html += "	<div class='o_p_list' style='height : calc(100% - 280px); padding:0 17px' id='memberframe'>";
			html += "";			
			members = sorted=$(members).sort(gap.sortNameDesc);				
			for (var i = 0 ; i < members.length; i++){
				var member = members[i];
				lists.push(member.ky);				
				var user_info = gap.user_check(member);
				var ky = user_info.ky;			
				var ex = user_info.email.replace("@","").replace(" ","");				
				html += "		<div class='office_mem_card' style='margin:5px 15px 0px 4px' id='member_list_"+ky+"'>";
				html += "			<div class='office_prof user'>";
				html += '				<div class="photo-wrap" style="background-image:url(' + gap.person_photo_url(member) + '),url('+gap.none_img+');"></div>'
				html += "				<span data-status='status_"+user_info.ky+"' class='status online' style='top:6px; left:7px'></span>";
				html += "				<button data-phone='phone_"+user_info.ky+"' type='button' style='position:absolute'></button>";
				html += "			</div>";
				html += "			<div class='office_right' style='width: 64%;'>";
				html += "				<div class='office_mem_name'>";
				html += "					<span data-day='day_"+user_info.ky+"' style='display:none'></span>";
				html += "					" + user_info.name + "";
				html += "					<span class='rank'>" + user_info.jt + "</span>";
				html += "				</div>";
				html += "				<div class='office_mem_info'>";
				html += "					<p>" + user_info.dept + "</p>";
				html += "					<p class='company'>" + user_info.company + "</p>";
				html += "				</div>";
				html += "			</div>";			
				if (typeof(member.dsize) != "undefined" && member.dsize == "group"){
					if (is_admin  ){
						html += "			<div class='abs hover-box'>";
						html += "				<div class='inner f_between f_middle'>";
						html += "					<div class='group_right_pop' style='position:unset;width:0px'><div class='user-remove' data-key='"+user_info.ky+"'><span></span></div></div>";
						html += "				</div>";
						html += "			</div>";						
					}				
				}else{
					html += "			<div class='abs hover-box'>";
					html += "				<div class='inner f_between f_middle'>";
					html += "					<span class='ico ico-chat' title='"+gap.lang.startChat+"' data-name='"+user_info.name+"' data-key='"+user_info.ky+"' >채팅</span>";
				//	if (use_tel == "1"){
						html += "					<span class='ico ico-phone' data-ky='"+user_info.ky+"'  title='"+gap.lang.mobile+"' >전화</span>";
				//	}				
					html += "					<span class='ico ico-profile' data-ky='"+user_info.ky+"' title='"+gap.lang.openprofile+"' >프로필</span>";
					if (is_admin  || gap.userinfo.rinfo.ky == user_info.ky){
						html += "					<div class='group_right_pop' style='position:unset;width:0px'><div class='user-remove' data-ty='"+kind+"' data-key='"+user_info.ky+"'><span></span></div></div>";
					}
					html += "				</div>";
					html += "			</div>";					
				}				
				html += "		</div>";				
			}			
			html += "	</div>";
			html += "</div>";			
		}
		$("#channel_right").html(html);		
		//상태값을 검사한다.
		var opt = 1;
		var ty = "channel";		
		gap.status_check(lists, opt, ty);		
		$("#memberframe").mCustomScrollbar({
			theme:"dark",
			//autoExpandScrollbar: true,
			scrollButtons:{
				enable: false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : true
		});

		$("#members_fnc_box").off();
		$("#members_fnc_box").on("click", function(){			
			var html = "";
			html += "<div class='layer layer-menu opt-enter' id='member_list_opt_box'>";
			html += "<ul>";		
			html += "<li style='padding-left : 10px !important; text-align:left' onclick='gBody3.all_send_opt_box(1)'>"+gap.lang.groupmail+"</li>";
			html += "<li style='padding-left : 10px !important; text-align:left' onclick='gBody3.all_send_opt_box(2)'>"+gap.lang.groupchat+"</li>";
			html += "<li style='padding-left : 10px !important; text-align:left' onclick='gBody3.all_send_opt_box(5)'>"+gap.lang.tab_reg_cal+"</li>";
			
			if (is_admin){
				html += "<li style='padding-left : 10px !important; text-align:left' onclick='gBody3.all_send_opt_box(3)'>"+gap.lang.member_invite+"</li>";	
				
			}
			html += "<li style='padding-left : 10px !important; text-align:left; border-top:1px solid #d5d2d2' onclick='gBody3.all_send_opt_box(4)'>"+gap.lang.up_mem+"</li>";
			html += "</ul>";
			html += "</div>";			
			$("#members_fnc_box").qtip({
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
		gBody3.member_list_event();	
	},
	
	"all_send_opt_box" : function(opt){	
		//멤버에서 more버튼 클릭한 결과 처리 함수		
		var att_list_all = "";
		var att_list = "";
		var att_list_temp = "";
		if (gap.cur_window == "drive"){
			if (gBody2.select_folder_code == "root"){
				att_list_all = gBody3.search_drive_members(gBody2.select_drive_code);
			}else{
				att_list_all = gBody3.search_folder_members();
			}			
		}else{
			att_list_all = gBody3.search_channel_members(gBody3.cur_opt);			
		}		
		att_list_temp = att_list_all.member;	
		var att_list = att_list_temp.concat(att_list_all.owner);	
		if (opt == "1"){
			//참석자 전체 메일 발송			
			var all_sender_list = "";
			for (var i = 0 ; i < att_list.length; i++){
				var info = att_list[i];
				var user_info = gap.user_check(info);
				var name = user_info.name;
				var email = info.em;				
				if (info.ky != gap.search_cur_ky()){
					if (all_sender_list == ""){					
						all_sender_list = encodeURIComponent(name) + "<" + email + ">";
					}else{
						all_sender_list += ";" + encodeURIComponent(name) + "<" + email + ">";
					}
				}				
			}			
			gBody3.open_email_send(all_sender_list);				
		}else if (opt == "2"){
			
			//참석자를 포함한 채팅차 열기
			//DSW형식으로 다중 채팅을 처리함			
			gap.chatroom_create(att_list);			
			return false;
			//하단 방식은 아모레 버전으로 이전 방식임
			$("#user_profile").show();
			$("#sub_channel_content").hide();
			$("#box_search_content").hide();
			$(".left-area").css("width", "calc(100% - " + gap.right_page_width + ")");				
			$("#add_group_btn").show();		
			$(".chat-bottom").show();					
			gap.show_content("subsearch");
			gBody3.search_type = "makeroom";
			gBody3.open_add_member_search_layer("makeroom");		
			$("#sub_search_profile").find("p").remove();
			//멤버를 선택 창에 추가한다.			
			for (var i = 0 ; i < att_list.length; i++){
				var info = att_list[i].ky;
				var user_info = gap.user_check(att_list[i]);
				var name = user_info.name;
				var company = user_info.company;				
				if (info != gap.search_cur_ky()){
					var id = gap.seach_canonical_id(info);
					id = gap.encodeid(id);
					var callid = id;
					var person_img = gap.person_profile_photo(info);
					var html = "";
					html += "<div class='member-profile' id='"+callid+"' data='"+info+"'>";
					html += "	<button class='ico btn-member-del'>삭제</button>";
					html += "	<div class='user-result-thumb'>"+person_img+"</div>";
					html += "		<dl>";
					html += "			<dt><span class='status online'></span>"+name+"</dt><dd>"+company+"</dd>";
					html += "		</dl>";
					html += "	</div>";
					html += "</div>";
					$("#addUser_frame").append(html);
				}			
			}			
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
		}else if (opt == "3"){
			if (gap.cur_window == "drive"){
				if (gBody2.select_folder_code == "root"){
					gBody2.modify_drive(gBody2.select_drive_code);
				}else{
					gBody2.drive_modify_folder(gBody2.select_folder_code);
				}
			}else{
				gBody2.context_menu_call_channel_mng("modify", "", gBody3.cur_opt);
			}		
		}else if (opt == "4"){
			gBody3.update_member_last();			
		}else if (opt == "5"){
			// 일정등록
			gHome.addEventRegist(att_list);			
		}
		
	},
	
	"update_member_last" : function(){
		//멤버의 부서 / 직급등이 정보를 최신 데이터로 업데이트하는 함수 호출하기	
		var url = gap.channelserver + "/update_members.km";		
		if (gap.cur_window == "drive"){
			//드라이브의 정보 업데이트
			var data = "";
			var scode = "";
			if (gBody2.select_folder_code == "root"){
				//드라이브 멤버업데이트	
				scode = gBody2.select_drive_code;
				data = JSON.stringify({
					code : scode ,
					category : "drive"
				});
			}else{
				//폴더 멤버업데이트
				scode = gBody2.select_folder_code;
				data = JSON.stringify({
					code : scode,
					category : "folder"
				});
			}		
			$.ajax({
				type : "POST",
				url : url,
				data : data,
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				success : function(res){
					if (res.result == "OK"){
						
						gBody2.update_drive_info(scode, false);	
					}									
				},
				error : function(e){
					gap.error_alert();
				}
			});		
		}else{
			//채널의 멤버 정보 업데이트			
			var data = JSON.stringify({
				code : gBody3.cur_opt,
				category : "channel"
			});
			$.ajax({
				type : "POST",
				url : url,
				data : data,
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				success : function(res){
					if (res.result == "OK"){
						gBody2.update_channel_info(gBody3.cur_opt, false);	
					}									
				},
				error : function(e){
					gap.error_alert();
				}
			});			
		}
	},
	
	"member_list_show" : function(){	
		if (call_key == ""){
			$("#main_body").css("width","calc(100% - 379px)");
			
		}else{
			$("#main_body").css("width","100%");
		}
		$("#channel_right").show();		
		gma.refreshPos();

	},
	
	"member_list_event" : function(){
		$("#member_layer_close2").off();
		$("#member_layer_close2").on("click", function(e){			
			gBody3.right_window_open = false;			
			$("#main_body").css("width", "");
			$("#sub_channel_content").css("width", "100%");			
			$("#channel_right").hide();			
			gma.refreshPos();
		});
		
		$(".owner-btns .btn-mail").off();
		$(".owner-btns .btn-mail").on("click", function(e){			
			var _self = $(this);
			var email = $(e.currentTarget).attr("data");
			var name = $(e.currentTarget).attr("data2");			
			gBody3.open_email_send(encodeURIComponent(name) + "<" + email + ">");	
		});
		
		$(".ico-chat").off();
		$(".ico-chat").on("click", function(e){			
			gap.cur_room_att_info_list = [];			
			var ky = $(e.currentTarget).data("key");
			var name = $(e.currentTarget).data("name");			
			var room_key = _wsocket.make_room_id(ky); // + "^" + gap.userinfo.rinfo.cpc;
			//대상자 정보를 넣어주서야 새창에서 기존에 채팅방이 없는 경우 해당 사용자와 1:1 방을 만들고 들어간다.	
			gap.cur_chat_user = ky;
			gap.cur_chat_name = name;			
			gap.chatroom_create_after2(room_key);
		});
		
		$(".ico-phone").off();
		$(".ico-phone").on("click", function(e){
			var ky = $(e.currentTarget).data("ky");
			gap.phone_call(ky, "");  //핸드폰으로 전화 건다.
		});
		
		$(".ico-profile").off();
		$(".ico-profile").on("click", function(e){
			var ky = $(e.currentTarget).data("ky");
			gap.showUserDetailLayer(ky);
		});	
		
		$(".owner-btns .btn-chat").off();
		$(".owner-btns .btn-chat").on("click", function(e){			
			//기존에 대화한 기록이 없는 사용자를 새창으로 띄우면 해당 데이터를 참조 (gBody : enter_chatroom_for_chatroomlist_popup_empty) 하는데
			//채팅창에 들어갔다가 바로 이 버튼을 클릭하면 기존에 클릭한 사용자와 대롸한 것 처럼 이루어 진다.
			//이 값이 없을 경울 room_key로 재설정하기 때문에 공백 배열로 처리하고 호출해야 한다.			
			gap.cur_room_att_info_list = [];			
			var ky = $(e.currentTarget).attr("data");
			var name = $(e.currentTarget).attr("data2");			
			var room_key = _wsocket.make_room_id(ky); // + "^" + gap.userinfo.rinfo.cpc;
			//대상자 정보를 넣어주서야 새창에서 기존에 채팅방이 없는 경우 해당 사용자와 1:1 방을 만들고 들어간다.	
			gap.cur_chat_user = ky;
			gap.cur_chat_name = name;			
			gap.chatroom_create_after2(room_key);
		});		
		
		$(".btn-invite-add").off();
		$(".btn-invite-add").on("click", function(e){			
			gBody2.context_menu_call_channel_mng("modify", "", gBody3.cur_opt);			
		});		
		
		$("#channel_right .user-remove").off();
		$("#channel_right .user-remove").on("click", function(e){			
			gBody3.member_process(e);	
		});
		
		$(".owner-btns .btn-invite-del").off();
		$(".owner-btns .btn-invite-del").on("click", function(e){			
			var ty = "1";  //기본은 채널에서 멤버를 삭제하는 옵션이다.
			var id = gBody3.cur_opt;
			if (gap.cur_window == "drive"){
				if (gBody2.select_folder_code == "root"){
					id = gBody2.select_drive_code;
					ty = "2";					
				}else{
					id = gBody2.select_folder_code;
					ty = "3";
				}				
			}else if (gap.cur_window == "todo"){
				ty = "4";
			}			
			var pid = $(e.currentTarget).parent().parent().parent().parent().attr("id");
			if (pid == "owner_info_dis"){
				//Owner를 변경하는 창이 띄워진다.				
				window.ORG.show(
						{
							'title': "Change Owner",
							'single': true
						}, 
						{
							getItems:function() { return []; },
							setItems:function(items) { /* 반환되는 Items */																
								var _res = gap.convert_org_data(items[0]);
								var url = gap.channelserver + "/change_owner.km";
								var data = JSON.stringify({
									owner : _res,
									id : id,
									type : ty
								});							
								$.ajax({
									type : "POST",
									dataType : "json",
									contentType : "applcation/json; charset=utf-8",
									url : url,
									data : data,
									success : function(res){
										if (res.result == "ERROR"){
											gap.error_alert();
										}else{						
											$("#li_cl_" + id).remove();	
											
											$("#allcontent").click();
											gBody2.update_channel_info();
										}
									},
									error : function(e){
										gap.error_alert();
									}
								});		
							}
						});			
			}else{						
				var _self = $(this);
				var email = $(e.currentTarget).attr("data");
				var url = gap.channelserver + "/channel_delete_member.km";
				var data = JSON.stringify({
					email : email,
					id : id,
					type : ty
				});
				$.ajax({
					type : "POST",
					dataType : "json",
					contentType : "applcation/json; charset=utf-8",
					url : url,
					data : data,
					success : function(res){
						if (res.result == "ERROR"){
							gap.error_alert();
						}else{						
							$(_self).parent().parent().parent().remove();							
							var count = $(".invite-info .btn-invite-del").length;
							$("#right_frame_member_count").html("("+count+")");							
							if (gap.cur_window == "drive"){
								if (gBody2.select_folder_code == "root"){
									gBody3.drive_members_delete(gBody2.select_drive_code, email);
									gBody2.update_drive_info();
								}else{
									gBody3.drive_folder_members_delete(gBody2.select_folder_code, email);
									gBody2.update_folder_info();
								}						
							}else if (gap.cur_window == "todo"){
								gTodo.todo_members_delete(gBody3.cur_opt, email);
							}else{
								gBody3.channel_members_delete(gBody3.cur_opt, email);
							}							
						}
					},
					error : function(e){
						gap.error_alert();
					}
				});
			}			
		});
	},
	
	"member_process" : function(e){		
		//채널과 TODO에서 Owner를 변경하거나 멤버를 제거하는 경우 처리되는 함수
		var ty = "1";  //기본은 채널에서 멤버를 삭제하는 옵션이다.
		var id = gBody3.cur_opt;
		if (gap.cur_window == "drive"){
			if (gBody2.select_folder_code == "root"){
				id = gBody2.select_drive_code;
				ty = "2";				
			}else{
				id = gBody2.select_folder_code;
				ty = "3";
			}			
		}else if (gap.cur_window == "todo"){
			//ty = "4";
			ty = "1"; //채널멤버를 제거하면 TODO 멤버도 제거된다.
		}
		var pid = $(e.currentTarget).parent().attr("id");
		if (pid == "owner-info"){
			//Owner를 변경하는 창이 띄워진다.
			gap.showBlock_todo();
			window.ORG.show(
					{
						'title': "Change Owner",
						'single': true
					}, 
					{
						getItems:function() { return []; },
						
						onClose : function(){
							gap.hideBlock_todo();
							//gap.hideBlock();
						},
						setItems:function(items) { /* 반환되는 Items */
							var _res = gap.convert_org_data(items[0]);
							gBody2.update_display_members(ty, id, _res);						
						}
					});
			setTimeout(function(){
				var inx = parseInt(gap.maxZindex()) + 1;
				$(".card-panel").css("zIndex", inx);
			}, 500);			
		}else{			
			var mmx = gap.lang.channel + gap.lang.extwork;
			var pp = $(e.currentTarget).data("ty");
			if (pp == "D"){
				//드라이브를 나간다는 문구로 변경되어야 한다.
				mmx = gap.lang.folder + gap.lang.extwork;
			}			
			gap.showConfirm({
 				title: "Confirm",
 				contents: mmx,
 				callback: function(){
					var _self = $(e.currentTarget);
					var email = $(e.currentTarget).data("key");
					var url = gap.channelserver + "/channel_delete_member.km";
					var data = JSON.stringify({
						email : email,
						id : id,
						type : ty
					});
					$.ajax({
						type : "POST",
						dataType : "json",
						contentType : "applcation/json; charset=utf-8",
						url : url,
						data : data,
						success : function(res){
							if (res.result == "ERROR"){
								gap.error_alert();
							}else{								
								$(_self).parent().parent().parent().parent().remove();								
								var count = $(".invite-info .btn-invite-del").length;
								$("#right_frame_member_count").html("("+count+")");								
								if (gap.cur_window == "drive"){
									if (gBody2.select_folder_code == "root"){
										gBody3.drive_members_delete(gBody2.select_drive_code, email);
										gBody2.update_drive_info();
									}else{
										gBody3.drive_folder_members_delete(gBody2.select_folder_code, email);
										gBody2.update_folder_info();
									}						
								}else{
									gBody3.channel_members_delete(gBody3.cur_opt, email);
								}							
								if (email == gap.userinfo.rinfo.ky){
									//본인이 삭제 하는 경우 업무방 리스트에서 제거한다.
									$("#li_cl_" + id).remove();									
									//즐겨찾기도 삭제한다.
									$("#" + id).remove();									
									//메인으로 나간다.
									$("#channel_back").click();
								}						
							}
						},
						error : function(e){
							gap.error_alert();
						}
					});
 				}
 			});		
		}
	},
	
	"draw_members_backup" : function(kind, list){		
		if (typeof(list) == "undefined"){
			return false;
		}	
		var owner = gap.user_check(list.owner);		
		var html = "";	
		var name = owner.name;
		var user_photo = gap.person_profile_photo(owner);		
		html += "<div class='owner-info' id='owner_info_dis' data='member_"+id+"'>";
		html += "<h2>Owner</h2>";
		html += "	<div class='owner-detail'>";
		html += "		<div class='owner-thumb'>"+user_photo+"</div>";
		html += "	<ul>";
		html += "		<li class='kname'>"+name+"</li> ";
		html += "		<li class='email'>"+owner.email+"</li>";
		html += "		<li>"+owner.mobile+"</li>";
		html += "		<li>"+owner.dept+"/"+owner.company+"</li>";
		html += "	</ul>";
		html += "	</div>";
		html += "</div>";		
		var members = list.member;
		if ( (typeof(members) == "undefined") || (members.length == 0)){
			//return false;
		}else{			
			html += "<div class='member-info' id='member_info_dis' >";
			html += "	<h2>Member <!--<button class='ico btn-more'>더보기</button>--></h2>";
			html += "	<ul class='member'>";			
			var count = members.length + 1;
			var nm = "";
			if (count > 8){
				for (var i = 0 ; i < 7; i++){
					var member = members[i];
					var user_info = gap.user_check(member);
					var user_photo = gap.person_profile_photo(member);			
					nm = user_info.name;					
					html += "		<li>";
				//	html += "			<div class='member-thumb' data='"+member.ky+"'><img src='"+member.pu+"' alt='' /></div><span>"+nm+"</span>";
					html += "			<div class='member-thumb' data='"+member.ky+"'>"+user_photo+"</div><span>"+nm+"</span>";
					html += "		</li>";
				}
				var lcount = count - 8;
				html += "		<li class='member-count' onClick=\"gBody3.member_show_all('"+kind+"', '"+id+"')\">";
				html += "			<span>+"+lcount+""+gap.lang.myung+"</span>";
				html += "		</li>";
			}else{
				for (var i = 0 ; i < members.length; i++){
					var member = members[i];
					var user_info = gap.user_check(member);
					var user_photo = gap.person_profile_photo(member);					
					nm = user_info.name;					
					html += "		<li>";
					html += "			<div class='member-thumb' data='"+member.ky+"'>"+user_photo+"</div><span>"+nm+"</span>";
					html += "		</li>";
				}
			}			
			html += "	</ul>";
			html += "</div>";
		}
				
		$("#user_profile").hide();
		$("#channel_right").html(html);	
		$(".member .member-thumb").off();
		$(".member .member-thumb").on("click", function(e){				
			gBody3.click_img_obj = this;	
			gBody3.show_position = "right";
    	  	var uid = $(this).attr("data");
        	_wsocket.search_user_one_for_popup(uid);  
		});
	},
	
	
	"member_show_all_old" : function(id){
		var list = gBody3.search_channel_members(id);		
		var members = list.member;
		var owner = list.owner;
		var owner_img = gap.person_profile_photo(owner);		
		var html = "";		
		html += "	<h2>Member<!--<button class='ico btn-more'>더보기</button>--></h2>";
		html += "	<ul class='member'>";
		html += "		<li>";
		html += "			<div class='member-thumb'>"+owner_img+"</div>";
		html += "		</li>";		
		for (var i = 0 ; i < members.length; i++){
			var member = members[i];
			var member_img = gap.person_profile_photo(member);
			html += "		<li>";
			html += "			<div class='member-thumb'>"+member_img+"</div>";
			html += "		</li>";
		}	
		html += "	</ul>";
		$("#user_profile").hide();
		$("#member_info_dis").html(html);
		var h = gBody3.check_member_top_height();		
		$('#detail_info_dis').attr('style','height:calc(100% - '+h+'px)');
	},	
	
	"member_show_all" : function(kind, id){
		var selector = $(".member-count");		
		var _html = '';
		_html += '<div class="layer-member" style="width:500px">';
		_html += '<h2>Member</h2>';
		_html += '<ul class="list-member" id="share_member_dis">';	
		var list = (kind == "C" ? gBody3.search_channel_members(id) : gBody3.search_drive_members(id));	
		var members = list.member;
		var owner = gap.user_check(list.owner);
		var owner_img = gap.person_profile_photo(list.owner);		
		_html += "		<li>";
		_html += "           <dl>";
		_html += "                 <dt>" + owner.name + "</dt>";
		_html += "                 <dd>" + owner.dept + "</dd>"
		_html += "           </dl>";
		_html += "           <span>" + owner_img + "</span>";
		_html += "		</li>";		
		for (var i = 0 ; i < members.length; i++){
			var member = members[i];
			var mem_info = gap.user_check(member);
			var member_img = gap.person_profile_photo(member);			
			_html += "		<li>";
			_html += "           <dl>";
			_html += "                 <dt>" + mem_info.name + "</dt>";
			_html += "                 <dd>" + mem_info.dept + "</dd>"
			_html += "           </dl>";
			_html += "           <span>" + member_img + "</span>";
			_html += "		</li>";
		}	
		_html += '</ul>';
		_html += '</div>';
		selector.qtip({
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			content : {
				text : _html
			},
			show : {
				event: 'click',
				ready: true
			},
			hide : {
				event : 'click unfocus',
				fixed : true
			},
			style : {
				classes : 'qtip-bootstrap',
				tip : true
			},
			position: {
				my : 'top right',
				viewport: $('#window')
		    },
			events : {
				show : function(event, api){		
					$("#share_member_dis").mCustomScrollbar({
						theme:"dark",
						autoExpandScrollbar: true,
						scrollButtons:{
							enable:false
						},
						mouseWheelPixels : 200, // 마우스휠 속도
						scrollInertia : 400, // 부드러운 스크롤 효과 적용
						advanced:{
							updateOnContentResize: true
						},
						autoHideScrollbar : true
					});						
				},
				hidden : function(event, api){
					api.destroy(true);
				}
			}
		});			
	
	},
	
	
	"channel_members_delete" : function(channelid, email){
		//로컬에 저장된 채널 정보에서 특정 채널에 특정 멤버를 제거한다.		
		var infos = gap.cur_channel_list_info;
		var members = new Object();		
		for (var i = 0 ; i < infos.length; i++){
			var info = infos[i];
			if (info.ch_code == channelid){
				var list = info.member;
				var mlist = [];
				for (var k = 0 ; k < list.length; k++){
					if (email == list[k].ky){						
					}else{
						mlist.push(list[k]);
					}
				}
				info.member = mlist;				
				break;
			}
		}
	},
	
	"search_channel_members" : function(channelid){		
		
		var infos = gap.cur_channel_list_info;
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
	
	"search_cur_channel_member" : function(channelid){
		//모바일 push에 사용할 나를 제외한 현재 채널의 멤버 리스트를 가져온다.		
		var infos = gap.cur_channel_list_info;
		var members = new Object();
		var list = [];
		for (var i = 0 ; i < infos.length; i++){			
			var info = infos[i];
			if (info.ch_code == channelid){
				for (var j = 0 ; j < info.member.length; j++){
					if (info.member[j].ky != gap.userinfo.rinfo.ky){
						if (info.member[j].ky != ""){
							list.push(info.member[j].ky);
						}						
					}
				}
				if (info.owner.ky != gap.userinfo.rinfo.ky){
					list.push(info.owner.ky);
				}
				return list;
				break;
			}
		}
	},
	
	
	
	"drive_members_delete" : function(driveid, email){
		//로컬에 저장된 채널 정보에서 특정 채널에 특정 멤버를 제거한다.		
		var infos = gBody3.cur_drive_list_info;
		var members = new Object();		
		for (var i = 0 ; i < infos.length; i++){
			var info = infos[i];
			if (info.ch_code == driveid){
				var list = info.member;
				var mlist = [];
				for (var k = 0 ; k < list.length; k++){
					if (email == list[k].ky){						
					}else{
						mlist.push(list[k]);
					}
				}
				info.member = mlist;				
				break;
			}
		}
	},
	
	"drive_folder_members_delete" : function(folderid, email){
		//로컬에 저장된 드라이브 폴더 정보에서 특정 폴더에 특정 멤버를 제거한다.		
		var infos = gBody3.cur_drive_folder_list_info;
		var members = new Object();		
		for (var i = 0 ; i < infos.length; i++){
			var info = infos[i];
			if (info._id.$oid == folderid){
				var list = info.member;
				var mlist = [];
				for (var k = 0 ; k < list.length; k++){
					if (email == list[k].ky){						
					}else{
						mlist.push(list[k]);
					}
				}
				info.member = mlist;				
				break;
			}
		}
	},		
	
	"search_drive_members" : function(driveid){
		//드라이브의 멤버를 찾는다.
		var infos = gBody3.cur_drive_list_info;
		var members = new Object();		
		for (var i = 0 ; i < infos.length; i++){
			var info = infos[i];
			if (info.ch_code == driveid){
				members.member = info.member;
				members.owner = info.owner;
				return members;
				break;
			}
		}
	},
	
	"search_folder_members" : function(folderid){
		//폴더에 멤버를 찾는다.
		var info = gBody3.cur_folder_info;
		var members = new Object();		
		members.member = info.member;
		members.owner = info.owner;
		return members;				
	},
	
	"send_socket" : function(obj, id){		

		obj.type = id;
		var ch_code = obj.channel_code;
		var ll = gBody3.search_channel_members(ch_code);
		var members = ll.member;
		var mlist = [];
		if ( (typeof(members) != "undefined")){
			for (var i = 0 ; i < members.length; i++){
				var lx = members[i];
					mlist.push(lx.ky);		
			}
			mlist.push(ll.owner.ky);
			obj.sender = mlist;
			obj.callfrom = "pc";			
			_wsocket.send_box_msg(obj, id);
		}
	},
	
	
	
	"change_editor_width" : function(){
		$("#editor_iframe").css("width", "100%");
	},
	
	"show_editor" : function(){		
		//아래 2값을 초기화 해주지 않으면 다른 채널에서 에디터로 파일 첨부해서 등록하고 수정할 경우 다른 채널에서 에디터로 등록하면 이전 채널의 데이터를 삭제하는 버그 수정
		gBody3.select_channel_id = "";
		gBody3.edit_mode = "";
		/////////////////////////////////////////////////////////////////////////////////////////
		// 에디터 버튼 관련 처리
		$('#sub_channel_content').addClass('show-edit');
		$('#chat_bottom_dis').removeClass('minimize');
		$('#btn_editor_show').addClass('hide');		
		gBody3.change_editor_width();		
		$("#editor_iframe").attr("src", root_path +"/page/kEditor.jsp?docmode=new");			
		var list = "";	
		list += '<optgroup label="'+gap.lang.sharechannel+'" id="share_channel_list_popup">';
		list += "<option value=''>"+gap.lang.channelchoice+"</option>";		
		var clist = gap.cur_channel_list_info;
		for (var k = 0 ; k < clist.length; k++){
			var citem = clist[k];
			if (citem.type != "folder"){
				list += "<option value='"+citem.ch_code+"'>" + citem.ch_name + "</option>";
			}			
		}	
		list += '</optgroup>';		
		$("#share_editor_list_popup").html(list);
		$('#share_editor_list_popup').val(gBody3.cur_opt);
		$('#share_editor_list_popup').material_select();
		$('#share_editor_list_popup').on('change',function() {			
	        var selectedid = $(this).val();
	        var selectedText = $(".optgroup-option.active.selected").text();	       
	        gBody3.select_channel_code = selectedid;
	        gBody3.select_channel_name = selectedText;
	    });	
		$("#editor_dis").fadeIn();		
		$("#editor_close").off().on("click", function(e){		
			$('#sub_channel_content').removeClass('show-edit');
			$('#chat_bottom_dis').removeClass('minimize');
			$('#btn_editor_show').addClass('hide');			
			$("#editor_title").val("");
			//$("#editor_dis").fadeOut();
			$("#editor_dis").hide();
			$("#message_txt_channel").attr("disabled", false);			
			$("#upload_file_list_editor_edit").empty();
			$("#share_editor_list_popup").empty();			
			gBody3.clear_dropzone_editor();
		});
		
		$('#btn_editor_hide').off().on('click', function(){
			$('#chat_bottom_dis').addClass('minimize');
			$('#btn_editor_show').removeClass('hide');
		});
		$('#btn_editor_show').off().on('click', function(){
			$('#chat_bottom_dis').removeClass('minimize');
			$('#btn_editor_show').addClass('hide');
		});		
		
		$("#message_txt_channel").attr("disabled", true);					
		gBody3.Fileupload_init();		
	},
	
	"show_editor_reply" : function(){		
		//아래 2값을 초기화 해주지 않으면 다른 채널에서 에디터로 파일 첨부해서 등록하고 수정할 경우 다른 채널에서 에디터로 등록하면 이전 채널의 데이터를 삭제하는 버그 수정
		gBody3.select_channel_id = "";
		gBody3.edit_mode = "";
		/////////////////////////////////////////////////////////////////////////////////////////	
		gBody3.change_editor_width();		
		$("#editor_iframe").attr("src", cdbpath+"/wEditor?openform");			
		var list = "";	
		list += '<optgroup label="'+gap.lang.sharechannel+'" id="share_channel_list_popup">';
		list += "<option value=''>"+gap.lang.channelchoice+"</option>";		
		var clist = gap.cur_channel_list_info;
		for (var k = 0 ; k < clist.length; k++){
			var citem = clist[k];
			if (citem.type != "folder"){
				list += "<option value='"+citem.ch_code+"'>" + citem.ch_name + "</option>";
			}			
		}	
		list += '</optgroup>';		
		$("#share_editor_list_popup").html(list);	
		$('#share_editor_list_popup').val(gBody3.cur_opt);
		//$('#share_editor_list_popup').val(gBody3.select_channel_code);
		$('#share_editor_list_popup').material_select();
		$('#share_editor_list_popup').on('change',function() {			
	        var selectedid = $(this).val();
	        var selectedText = $(".optgroup-option.active.selected").text();	       
	        gBody3.select_channel_code = selectedid;
	        gBody3.select_channel_name = selectedText;
	    });	
		
		$("#editor_dis").fadeIn();		
		$("#editor_close").off().on("click", function(e){					
			$("#editor_title").val("");
			$("#editor_dis").hide();
			$("#message_txt_channel").attr("disabled", false);			
			$("#upload_file_list_editor_edit").empty();
			$("#share_editor_list_popup").empty();			
			gBody3.clear_dropzone_editor();
		});
		
		$('#btn_editor_hide').off().on('click', function(){
			$('#chat_bottom_dis').addClass('minimize');
			$('#btn_editor_show').removeClass('hide');
		});
		$('#btn_editor_show').off().on('click', function(){
			$('#chat_bottom_dis').removeClass('minimize');
			$('#btn_editor_show').addClass('hide');
		});
		
		$("#message_txt_channel").attr("disabled", true);				
		gBody3.Fileupload_init();		
	},
	
	"Fileupload_init" : function(){		
		var isdropzone = $("#editor_upload_dis")[0].dropzone;
		if (isdropzone) {
			isdropzone.destroy();
			//return false;
		}		
		myDropzone_editor = new Dropzone("#editor_upload_dis", { // Make the whole body a dropzone
		      url: gap.channelserver + "/FileControl.do", // Set the url
		      autoProcessQueue : false, 
			  parallelUploads : 100,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
			  maxFilesize: 1000,
			  timeout: 180000,
		  	  uploadMultiple: true,
		  	  withCredentials: false,
		  	  previewsContainer: "#previews_channel", // Define the container to display the previews
		  	  clickable: "#editor_add_file", // Define the element that should be used as click trigger to select files.
		  	  renameFile: function(file){	
				return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			  },
		  	  init: function() {	
					myDropzone_editor = this;
		      },
		      success : function(file, json){
		    	
		    	  var jj = JSON.parse(json);	    	  
		    	  if (jj.result == "OK"){		    		 
		    		  myDropzone_editor.files_info = jj;
		    	  }		    	 		
		      }		
		});		
		myDropzone_editor.on("totaluploadprogress", function(progress) {	
			document.querySelector("#total-progress_channel .progress-bar").style.width = progress + "%";
		});		
		myDropzone_editor.on("queuecomplete", function (file) {	

			$("#editor_close").click();
			gap.hide_loading();			
			//파일을 컨텐트 영역에 그린다. ////////////
			if (myDropzone_editor.save_type != "temp"){
				gBody3.send_file_editor();
			}
			
			if (myDropzone_editor.save_type == "notice"){
				gBody.drawNoticeWork();
			}
			//////////////////////////////			
			gBody3.clear_dropzone_editor();
			var xtime1 = setTimeout(function(){
				gBody3.complete_process_channel();
				clearTimeout(xtime1);
			}, 800);
		});	      
		myDropzone_editor.on("addedfiles", function (file) {				
			for (var i = 0 ; i < file.length; i++){				
				var fx = file[i];				
				if (fx.size > (this.options.maxFilesize * 1024 * 1024)){
				   myDropzone_editor.removeFile(fx);
				   alert("'" + fx.name + "'" + "" + gap.lang.file_ex + "\n(MaxSize : " + this.options.maxFilesize + "M)");				  
				}
				if (gap.no_upload_file_type_check(fx.name)){
					$("#total-progress_channel").hide();
					myDropzone_editor.removeFile(fx);				
					gap.gAlert(fx.name + " " + gap.lang.nofileup);							
				}				
			}			
			var files = myDropzone_editor.files;
			if (files.length > 0){
				gBody3.add_upload_file_list_editor(files, "file");	
			}
		});		
		myDropzone_editor.on("sending", function (file, xhr, formData) {
			gap.show_loading(gap.lang.saving);			
			var title = myDropzone_editor.title;
			var xcontent = myDropzone_editor.editor_body;
			formData.append("email", gap.userinfo.rinfo.ky);
			formData.append("ky", gap.userinfo.rinfo.ky);
			formData.append("content", "");
			formData.append("editor", xcontent);
			formData.append("channel_code", gBody3.select_channel_code);
			formData.append("channel_name", gBody3.select_channel_name);
			formData.append("owner", JSON.stringify(gap.userinfo.rinfo));
			formData.append("fserver", gap.channelserver);
			if (myDropzone_editor.save_type == "temp"){
				formData.append("edit", "T");
			}else{
				formData.append("edit", gBody3.edit_editor);
			}			
			formData.append("type", myDropzone_editor.save_type);			
			formData.append("title", title);
			formData.append("id", gBody3.select_channel_id);
			formData.append("upload_path", gBody3.select_doc_info.upload_path);			
			myDropzone_editor.files_info = "";
			$("#total-progress_channel").show();	
	        document.querySelector("#total-progress_channel .progress-bar").style.display = "";
		});		
		$("#upload_channel_file").off();
		$("#upload_channel_file").on("click", function(e){			
			myDropzone_editor.processQueue();
		});		
		$("#fileupload_cancel").off();
		$("#fileupload_cancel").on("click", function(e){
			gBody3.hide_upload_layer();
			gBody3.clear_dropzone_editor();			
			return false;
		});		
		$("#file_upload_add").off();
		$("#file_upload_add").on("click", function(e){
			$("#open_attach_window2").click();
		});		
		// 임시저장
		$("#editor_temp_save").off();
		$("#editor_temp_save").on("click", function(){

			var drop_file_count = myDropzone_editor.files.length;
			if (drop_file_count > 0){
				// 파일을 선택한 경우				
				gap.showConfirm({
					title: gap.lang.temps,
					contents: '임시저장시 파일은 저장되지 않습니다<br><span>계속 진행할까요?</span>',
					callback: function(){
						gBody3.editor_temp_save();
					}
				});				
			} else {
				// 파일을 선택하지 않은 경우
				gBody3.editor_temp_save();			
			}
		});		
		// 임시저장 목록 
		$("#editor_temp_list").off();
		$("#editor_temp_list").on("mouseenter", function(e){
			var target = e.currentTarget;
			gBody3.show_temp_list(target);
		});		
		
		$("#editor_upload_notice").off().on("click", function(e){
			myDropzone_editor.save_type = "notice";
			gBody3.real_upload_process();
		});
		
		$("#editor_upload_start").off();
		$("#editor_upload_start").on("click", function(e){	
			myDropzone_editor.save_type = "channel";		
			gBody3.real_upload_process();
		});	
	},
	
	"real_upload_process" : function(){		
		gBody3.isTempSave = "F";
		var key = $('#share_editor_list_popup').val();
		if ( (key == null) || (key == "")){
			gap.gAlert(gap.lang.selectchannel);
			return false;
		}			
		var editor_title = $("#editor_title").val();
		if (editor_title == ""){
			gap.gAlert(gap.lang.input_title)
			return false;
		}
		var drop_file_count = myDropzone_editor.files.length;			
		myDropzone_editor.title = $("#editor_title").val();
		var html = $("#editor_iframe").get(0).contentWindow._form.keditor.getBodyValue();
		myDropzone_editor.editor_body = html;	
		if (drop_file_count > 0){			
			var exist_files = $("#upload_file_list_editor_edit li").length;
			if (exist_files > 0){
				gBody3.edit_editor = "T";
				gBody3.isTempSave = "T";
			}			
			//원본 문서에서 파일을 삭제하는 경우 삭제된 파일을 먼저 정리한다.
			if (gBody3.delete_file_list.length > 0){
				gBody3.sub_file_delete_send_server();
			}else{
				myDropzone_editor.processQueue();
			}	
			gBody.drawNoticeWork();
		}else{
			//기존 에디터 문서를 편집하는 경우 기존에 파일이 있는 경우가 있을 수 있다.		
			var exist_files = $("#upload_file_list_editor_edit li").length;
			if (exist_files > 0){
				gBody3.edit_editor = "T";
				gBody3.isTempSave = "T";
			}			
			if (gBody3.edit_editor == "T"){					
				//원본 문서에 첨부가 있는 경우 편집해서 특정 파일을 삭제한 경우 해당 파일을 먼저 삭제하고 진행해야 한다.
				if (gBody3.delete_file_list.length > 0){
					gBody3.sub_file_delete_send_server2(html);
				}else{
					var type = "";
					if (typeof(gBody3.select_doc_info.info) != "undefined"){
						var original_doc_filecount = gBody3.select_doc_info.info.length;
						var cur_editor_delete_filecount = gBody3.delete_file_list.length;
												
						if (original_doc_filecount != cur_editor_delete_filecount){
							//파일 업로드 형식으로 처리한다... 파일이 하나라도 남아있다는 이야기다
							type = "file";
						}else{
							type = "msg";
						}
					}else{
						type = "msg";
					}						
					//기존 파일을 모두 삭제한경우 일반 메시지 처럼 저장한다.
					var data = JSON.stringify({
						"type" : type,
						"channel_code" : gBody3.select_channel_code,
						"channel_name" : gBody3.select_channel_name,
						"email" : gap.userinfo.rinfo.em,
						"ky" : gap.userinfo.rinfo.ky,
						"owner" : gap.userinfo.rinfo,
						"content" : "",
						"editor" : html,
						"title" : myDropzone_editor.title,
						"id" : gBody3.select_channel_id,
						"msg_edit" : gBody3.edit_mode,
						"edit" : gBody3.edit_editor							
					});						
					gBody3.send_msg_to_server(data);
					$("#editor_close").click();						
					gap.scroll_move_to_bottom_time("channel_list", 200);					
					gBody.drawNoticeWork();
				}					
			}else{
				//기존에도 파일이 없는 경우			
				if (gBody3.delete_file_list.length > 0){
					gBody3.sub_file_delete_send_server2(html);
				}else{
					var type = "";
					var tyx = "";
					if (typeof(gBody3.select_doc_info.info) != "undefined"){
						var original_doc_filecount = gBody3.select_doc_info.info.length;
						var cur_editor_delete_filecount = gBody3.delete_file_list.length;												
						if (original_doc_filecount != cur_editor_delete_filecount){
							//파일 업로드 형식으로 처리한다... 파일이 하나라도 남아있다는 이야기다
							type = "file";
						}else{
							type = "msg";
						}
					}else if (myDropzone_editor.save_type == "notice"){
						tyx = "notice";
						type = "msg";
					}else{
						type = "msg";
					}					
					var datx = {
							"type" : type,
							"tyx" : tyx,
							"channel_code" : gBody3.select_channel_code,
							"channel_name" : gBody3.select_channel_name,
							"email" : gap.userinfo.rinfo.em,
							"ky" : gap.userinfo.rinfo.ky,
							"owner" : gap.userinfo.rinfo,
							"content" : "",
							"editor" : html,
							"title" : myDropzone_editor.title,
							"id" : gBody3.select_channel_id,
							"msg_edit" : gBody3.edit_mode,
							"edit" : gBody3.edit_editor
					}					
					if (type == "file"){
						datx.info = gBody3.select_doc_info.info;
						datx.upload_path = gBody3.select_doc_info.upload_path;
					}					
					var data = JSON.stringify(datx);				
					gBody3.send_msg_to_server(data);
					$("#editor_close").click();					
					gap.scroll_move_to_bottom_time("channel_list", 200);					
					gBody.drawNoticeWork();
				}			
			}			
		}	
	},
	
	"add_upload_file_list_editor" : function(file, type){					
		$("#upload_file_list_editor").empty();
			var html = "";
			for (var i = 0 ; i < file.length; i++){
				var fx = file[i];			
				var ext = gap.file_icon_check(fx.name);
				var size = gap.file_size_setting(fx.size);					
				html += "<li>";
				html += "	<span class='ico ico-file "+ext+"'></span>";
				html += "	<div class='attach-name'><span>"+fx.name+"</span><em>("+size+")</em></div>";
				html += "	<button class='ico btn-delete' data='"+fx.name+"' data2='"+fx.size+"' onClick=\"gBody3.removeF_editor(this)\">삭제</button>";
				html += "</li>";					
			}				
			$("#upload_file_list_editor").append(html);	
	},
	
	
	"clear_dropzone_editor" : function(){
		$("#total-progress_folder").hide();
		$("#total-progress_channel").hide();
		$("#upload_file_list_editor").empty();
		myDropzone_editor.removeAllFiles(true);		
	},
	
	
	
	"removeF_editor" : function(obj){
		$(obj).parent().remove();		
		var filename = $(obj).attr("data");
		var size = $(obj).attr("data2");				
		var list = myDropzone_editor.files;		
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];
			if ( (filename == item.name) && (size == item.size)){
				$("#total-progress_channel").hide();
				myDropzone_editor.removeFile(item);
				break;
			}
		}
	},
	
	
	"send_file_editor" : function(){
		var json = myDropzone_editor.files_info;		
		if ( (gBody3.cur_opt == json.channel_code) || (gBody3.cur_opt == "allcontent") || (gBody3.cur_opt == "mycontent")){
			var GMT = json.GMT;
			var doc = new Object();
			doc.GMT = GMT;
			doc.channel_code = gBody3.select_channel_code;
			doc.channel_name = gap.textToHtml(gBody3.select_channel_name);
			doc.email = gap.userinfo.rinfo.em;
			doc.content = json.content;
			doc.owner = gap.userinfo.rinfo;
			doc.type = "file";
			doc.upload_path = json.upload_path;
			doc.info = json.file_infos;
			doc.direct = "T";
			doc._id = json.id;
			doc.fserver = gap.channelserver;
			doc.editor = json.editor;
			doc.title = json.title;			
			var date = gap.change_date_localTime_only_date(GMT);	
			if (myDropzone_editor.save_type == "notice"){			
				//업무방에 공지사항을 표시하는 함수를 호출해 준다.
				doc.tyx = "notice";
				var html = gBody3.draw_msg(doc, "msg", date);				
			}else{
				var html = gBody3.draw_file(doc, date);				
			}
			gBody3.direct_draw(html, json.GMT, doc._id, "", "");		
			doc.date = date;
			gBody3.send_socket(doc, "fs");
		}
	},
	
	"send_file_drive" : function(json){	
		if ( (gBody3.cur_opt == json.channel_code) || (gBody3.cur_opt == "allcontent") || (gBody3.cur_opt == "mycontent")){
			var GMT = json.GMT;
			var doc = new Object();
			doc.GMT = GMT;
			doc.channel_code = json.channel_code;
			doc.channel_name = gap.textToHtml(json.channel_name);
			doc.email = gap.userinfo.rinfo.em;
			doc.content = json.content;
			doc.owner = gap.userinfo.rinfo;
			doc.type = "file";
			doc.upload_path = json.upload_path;
			doc.info = json.info;
			doc.direct = "T";
			doc._id = json.id;
			doc.fserver = gap.channelserver;		
			if (typeof(json.og) != "undefined"){
				doc.og = json.og;
			}			
			var date = gap.change_date_localTime_only_date(GMT);	
			var html = gBody3.draw_file(doc, date);
			gBody3.direct_draw(html, json.GMT, doc._id, "", "");			
			doc.date = date;
			gBody3.send_socket(doc, "fs");
		}
	},
	
	"invite_video_chat" : function(){
		//WebX 화상회의를 호출한다.		
		//참석자 정보를 수집힌다.
		var channel_id = gBody3.cur_opt;
		var list = gBody3.search_channel_members(channel_id);	
		var participants = [];
		if (typeof(list.member) == "undefined"){			
		}else{
			if ( (typeof(list.member) != "undefined") && (list.member.length > 0)){
				for (var i = 0 ; i < list.member.length; i++){
					var info = list.member[i];
					var user_info = gap.user_check(info);
					var member = new Object();
					member.email = user_info.email;
					member.name = user_info.name;
					participants.push(member);
				}
			}
		}		
		var owner = gap.userinfo.rinfo;
		var owner_info = gap.user_check(owner);
		//예야 식간 
		var date = moment.utc().format();
		var start = moment.utc(date).local().format('YYYYMMDDHHmmss');
		var end = moment().add(1, "h").format('YYYYMMDDHHmmss'); 
		var appservice = {
		 		type : "C",  // 일정 구분 -> 신규: C, 수정 : U, 삭제 : D
				title : gBody3.select_channel_name2 + " Meeting",
				starttime : start, //utc 0
				endtime : end,   //utc 0
				passcode : ""  , 
				scheduleid : "",
				scheduleremail : owner_info.email,  // 예약자 이메일 
				schedulernm : owner_info.name,  // 예약자 이름 
				memberid : owner_info.emp,  // 예약자 아이디
				partylist : participants   // 참석자 정보 
        };
		var aaa = JSON.stringify(appservice);	
		gap.show_loading(gap.lang.lex);
		var url = location.protocol + "//" + location.host + "/vemanager/scheduleinterface.do";
		 $.ajax({
	            url: url,
	            type: "POST",
	            dataType: 'json',
	            data: JSON.stringify(appservice),
	            contentType: 'application/json',
	            mimeType: 'application/json',
	            async: true,
	            success: function (data) {
			 		if (data.result == "true"){
			 			$("#resultVaule").text(JSON.stringify(data));
			 			window.open(data.meetingurl, "meeting", null);
			 			var res = data;
			 			res.type = "channel_meeting";													
						var data = JSON.stringify({
							"type" : "msg",
							"channel_code" : gBody3.select_channel_code,
							"channel_name" : gBody3.select_channel_name,
							"email" : gap.userinfo.rinfo.em,
							"ky" : gap.userinfo.rinfo.ky,
							"owner" : gap.userinfo.rinfo,
							"content" : "",
							"edit" : "",
							"msg_edit" : "",
							"id" : gBody3.select_channel_id,
							"ex" : res
						});
						gBody3.send_msg_to_server(data);						
						gap.hide_loading();		 			
			 		}else{
			 			gap.hide_loading();
			 			gap.gAlert(data.message);		 			
			 		}	            	   	    
	            },
	            error: function(XMLHttpRequest, textStatus, errorThrown) {
	            	gap.hide_loading();
	            	alert(textStatus);
	             }	            
	        });	
	},
	
		"check_reddot_backup" : function(channel_code){
		//채널면을 클릭했을때 gBody2에서 호출한다. 빨콩이 있는 경우 해제를 처리한다
		//현재 채널에 빨콩이 있는 경우 제거한다.
		$("#clist_" + channel_code).text("");		
		//나머지 채널에 읽지 읺은 내용이 있는지 체크해서 하나도 없을 경우 상단 box탭에 빨콩을 제거한다.
		var exist = false;
		$(".clistxx").each(function(index){
			var ll = $(this).text();
			if (ll != ""){
				exist = true;
			}
		});
		if (!exist){
			gap.change_title("1","");
			$("#tab3_sub").html(gap.lang.channel);
		}
	},	
	
	"check_reddot" : function(channel_code){
		//채널면을 클릭했을때 gBody2에서 호출한다. 빨콩이 있는 경우 해제를 처리한다
		//현재 채널에 빨콩이 있는 경우 제거한다.	
		$("#clist_" + channel_code).text("");		
		var len = $(".clistxx .ico-new").length;				
		for (var i = 0 ; i < len; i++){
			var info = $(".clistxx .ico-new")[i];
			if (typeof($(info).parent().attr("id")) != "undefined"){
				var id = $(info).parent().attr("id").replace("clist_","");
				if (id == channel_code){
					$(info).parent().text("");
				}
			}			
		}		
		var len = $(".clistxx .ico-new").length;
		if (len == 0){			
			gap.change_title("1","");
			$("#tab3_sub").html(gap.lang.channel);
		}
	},
	
	"invite_video_chat_backup" : function(){
		if (gBody3.check_top_menu()){
			if (gap.IE_Check()){
				gap.gAlert(gap.lang.IE_Notsupport);
			}else{
				gBody3.rigth_btn_change_empty();			
				gBody3.open_video_popup("T", "");
			}
		}else{
			if (gap.IE_Check()){
				gap.gAlert(gap.lang.IE_Notsupport);
			}else{
				var channel_id = gBody3.cur_opt;		
				var list = gBody3.search_channel_members(channel_id);			
				if (typeof(list.member) == "undefined"){					
				}else{
					var html = "";
					html += "<h2>"+gap.lang.invite_videochat+"</h2>";
					html += "<button class='ico btn-close' id='invite_layer_close'>닫기</button>";					
					html += "<div class='checkbox all'>";
					html += "	<label>";
					html += "		<input type='checkbox' id='ch_invite'><span class='checkbox-material'><span class='check'></span></span> <em>"+gap.lang.selectall+"</em>";
					html += "	</label>";
					html += "</div>";					
					html += "<ul id='invite_ul'>";									
					if ( (typeof(list.member) != "undefined") && (list.member.length > 0)){
						for (var i = 0 ; i < list.member.length; i++){						
							var info = list.member[i];
							var user_info = gap.user_check(info);
							var uid = info.ky;							
							var rx = false;
							if (uid != gap.userinfo.rinfo.ky){								
								var person_img = gap.person_profile_photo(info);
								var name = user_info.name;
								var deptname = user_info.dept;
								var jobtitle = user_info.jt;									
								html += "	<li>";
								html += "		<div class='checkbox'>";
								html += "		<label>";
								html += "			<input type='checkbox' data='"+info.ky+"'><span class='checkbox-material'><span class='check'></span></span>";
								html += "		</label>";
								html += "       </div>"
								html += "		<dl class=''>";
								html += "			<dt>";
								html += "				<div class='user'>";
								html += "					<div class='user-thumb'>"+person_img+"</div>";
								html += "				</div>";
								html += "			</dt>";
								html += "			<dd>";
								html += "				<span>"+name+"</span>";
								html += "				<div class=''>"+deptname+"/"+jobtitle+"</div>";
								html += "			</dd>";
								html += "		</dl>";
								html += "	</li>";								
							}								
						}					
						if (list.owner.ky != gap.userinfo.rinfo.ky){
							var person_img = gap.person_profile_photo(list.owner);
							var user_info = gap.user_check(list.owner);
							var name = user_info.name;
							var deptname = user_info.dept;
							var jobtitle = user_info.jt;							
							html += "	<li>";
							html += "		<div class='checkbox'>";
							html += "		<label>";
							html += "			<input type='checkbox' data='"+list.owner.ky+"'><span class='checkbox-material'><span class='check'></span></span>";
							html += "		</label>";
							html += "       </div>"
							html += "		<dl class=''>";
							html += "			<dt>";
							html += "				<div class='user'>";
							html += "					<div class='user-thumb'>"+person_img+"</div>";
							html += "				</div>";
							html += "			</dt>";
							html += "			<dd>";
							html += "				<span>"+name+"</span>";
							html += "				<div class=''>"+deptname+"/"+jobtitle+"</div>";
							html += "			</dd>";
							html += "		</dl>";
							html += "	</li>";							
						}				
					}								
					html += "</ul>";
					html += "<div class='layer-bottom'>";
					html += "	<button id='invite_ok'><strong>"+gap.lang.invite+"</strong></button>";
					html += "	<button id='invite_layer_cancel'><span>"+gap.lang.Cancel+"</span></button>";
					html += "</div>";				
					gap.showBlock();					
					var inx = parseInt(gap.maxZindex()) + 1;
					$("#invite_video").css("z-index", inx);
					$("#invite_video").html(html);
					$("#invite_video").fadeIn();
					
					$("#invite_layer_close").on("click", function(e){
						gap.hideBlock();
						$("#invite_video").fadeOut();
					});
					
					$("#invite_layer_cancel").on("click", function(e){
						$("#invite_layer_close").click();
					});
					
					$("#ch_invite").on("click", function(e){
						var bol = $(this).parent().find(":checkbox").is(":checked");						
						if (bol){
							$("#invite_ul").find(":checkbox").each(function(inx){
								$(this).prop('checked', true);
							});							
						}else{
							$("#invite_ul").find(":checkbox").each(function(inx){
								$(this).prop('checked', false);
							});
						}						
					});
					
					$("#invite_ul").mCustomScrollbar({
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
						autoHideScrollbar : true,							
						callbacks : {
							//onTotalScrollBack: function(){gBody3.channel_addContent(this)},
							//onTotalScrollBackOffset: 10,
							//alwaysTriggerOffsets:true
						}
					});				
					
					$("#invite_ok").on("click", function(e){											
						var list = [];	
						$("#invite_ul").find(":checkbox").each(function(inx){
							//$(this).prop('checked', true);
							if ($(this).is(":checked")){
								var data = $(this).attr("data");
								list.push(data);
							}else{
								//alert("없다");
							}						
						})				
						gBody3.makeroom_video_channel(list);
					});
				}			
			}
		}
	},
	
	
	"makeroom_video_channel" : function(list){
		//채팅방을 만든다.	
		var video_chat_room_key = gap.userinfo.rinfo.id + "_" + gBody3.make_video_roomkey();	
		if ( (typeof(list) != "undefined") && (list.length > 0)){
			for (var i = 0 ; i < list.length; i++){				
				var info = list[i];
				var uid = info;								
				var sendObj = new Object();
				sendObj.target_uid = uid;	
				sendObj.room_code = video_chat_room_key;
				gBody3.send_invite_msg_channel(sendObj, "");	
			}			
			$("#invite_layer_close").click();
			gBody3.open_video_popup("T", video_chat_room_key);
			return false;
		}					
	},
	
	"send_invite_msg_channel" : function(sendobj, webchatroomkey){	
		var msg = gap.lang.call_attend;					
		var msgid = gap.make_msg_id();					
		var roomkey = "";	
		if (webchatroomkey == ""){
			//1:1일 경우
			_wsocket.make_chatroom_11_only_make(sendobj.target_uid);
			roomkey = _wsocket.make_room_id(sendobj.target_uid);
		}else{
			//기존에 채팅방이 만들어져 있는 경우
			roomkey = webchatroomkey;
		}		
		var obj = new Object();		
		obj.type = "msg";
		obj.mid = msgid;
		obj.msg = msg + "-spl-" + sendobj.room_code;
		obj.cid = roomkey;		
		obj.ty = 21;		
		var curinfo = gap.userinfo.rinfo;
		obj.name = curinfo.nm;
		obj.name_eng = curinfo.enm;
		obj.el = curinfo.el;		
		_wsocket.send_chat_msg(obj);		
	},	
	
	"show_add_tab_layer" : function(){
		var html = "";
		html += "<h2>Plugin Install</h2>";
		html += "<button class='ico btn-close' id='plugin_close'>닫기</button>";	
		var list = gap.cur_room_exist_plugin(gBody3.cur_opt);
		var lx = "";
		if (typeof(list) != "undefined"){
			for (var i = 0 ; i < list.length; i++){
				var item = list[i].list;
				if (lx == ""){
					lx = item;
				}else{
					lx = lx + "-" + item;
				}
			}
		}	
		var url = gap.channelserver + "/plugin_list.km";
		$.ajax({
			typt : "GET",
			contentType : "application/json; charset=utf-8",
			url : url,
			success : function(res){
				html += "<ul>";			
				var list = res.data.list;				
				for (var k = 0 ; k < list.length; k++){
					var item = list[k];					
					html += "	<li style='min-height:160px'>";
					html += "		<span class='ico ico-"+item.uniquekey+"'></span>";
					html += "		<h3>"+item.title+"</h3>";
					html += "		<p>"+item.express+"</p>";
					if (lx.indexOf(item.title) > -1){
						html += "		<button class='btn-release' style='margin-top:65px;' data='"+item.title+"'><span>"+gap.lang.uninstall+"</span></button>";
					}else{
						html += "		<button style='margin-top:65px' data='"+item.title+"'><span>"+gap.lang.install+"</span></button>";
					}					
					html += "	</li>";					
				}			
				html += "</ul>";
				html += "<div class='layer-bottom'>";
				html += "	<button id='plugin_cancel'><span>"+gap.lang.Cancel+"</span></button>";
				html += "</div>";					
				gap.showBlock();			
				var inx = parseInt(gap.maxZindex()) + 1;
				$("#plugin_dis").css("z-index", inx);
				$("#plugin_dis").html(html);
				$("#plugin_dis").fadeIn();
				
				$("#plugin_close").on("click", function(e){
					$("#plugin_dis").fadeOut();
					gap.hideBlock();
				});
				
				$("#plugin_cancel").on("click", function(e){
					$("#plugin_close").click();
				});
				
				$("#plugin_dis ul li button").on("click", function(e){
					var cl = $(e.currentTarget).attr("class");
					var item = $(e.currentTarget).attr("data");
					if (item != "TO-DO"){
						gap.gAlert(gap.lang.sv);
						return false;
					}									
					var oob = new Object();
					oob.id = gBody3.cur_opt;
					oob.item = item;									
					var c_info = gap.cur_room_search_info(gBody3.cur_opt);					
					oob.name = c_info.ch_name;
					oob.owner = c_info.owner;					
					var ssp1 = c_info.readers;
					var treaders = [];
					for (var i = 0 ; i < ssp1.length; i++){
						if (ssp1[i].indexOf("@") > -1){
							treaders.push(ssp1[i]);
						}
					}
					oob.readers = treaders;					
					if (typeof(c_info.member) == "undefined"){
						oob.member = [];	
					}else{	
						var ssp2 = c_info.member;
						var tmember = [];
						for (var k = 0 ; k < ssp2.length; k++){
							if (ssp2[k].dsize != "group"){				
								tmember.push(ssp2[k]);
							}
						}
						oob.member = tmember;
					}
					var url = gap.channelserver + "/plugin.km";					
					if (cl == "btn-release" ){
						//설치 제거하기						
						var msg = gap.lang.confirm_delete;						
						gap.showConfirm({
							title: "Confirm",
							contents: msg,
							callback: function(){
							oob.ty = "del";
							var data = JSON.stringify(oob);
							$.ajax({
								type : "POST",
								dataType : "json",
								data : data,
								url : url,
								success : function(res){								
									$(e.currentTarget).removeClass("btn-release");
									$(e.currentTarget).find("span").text(gap.lang.install);								
									//gap.cur_channel_list_info 정보 업데이트 해야 한다.						
									//로컬 채널 정보를 업데이트 한다.
									gap.cur_room_exist_plugin_setting(gBody3.cur_opt, item, "del");													
									//하단 탭을 추가한다.
									$("#" + item + "_tab").parent().remove();									
									//현재창에 등록된 플러그인 정보를 제거한다.												
									gBody3.channel_plugins.pop("TO-DO");									
									gBody3.tab_click_event();
									////////////////////////////////////////////////////////////	
								},
								error : function(e){
									gap.error_alert();
								}
							});	
							}
						});
					}else{
						//플러그인 설치하기				
						oob.ty = "add";
						var data = JSON.stringify(oob);				
						$.ajax({
							type : "POST",
							dataType : "json",
							data : data,
							url : url,
							success : function(res){
								//gap.cur_channel_list_info 정보 업데이트 해야 한다.
								if (res.result == "OK"){									
									$(e.currentTarget).addClass("btn-release");
									$(e.currentTarget).find("span").text(gap.lang.uninstall);									
									//로컬 채널 정보를 업데이트 한다.
									gap.cur_room_exist_plugin_setting(gBody3.cur_opt, item, "add");													
									//하단 탭을 추가한다.
									var elx = $(".channel-tab .tabs");
									var hx = "<li class='tab'><a href='#' id='"+item+"_tab'>"+item+"</a></li>";
									elx.append($(hx));									
									//현재창에 등록된 플러그인 정보를 등록한다.									
									gBody3.channel_plugins.push("TO-DO");									
									gBody3.tab_click_event();
									////////////////////////////////////////////////////////////							
								}
							},
							error : function(e){
								gap.error_alert();
							}
						});	
					}				
					return false;
				});	
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	},
	
	"check_top_menu_new" : function(){		
		if ( (gBody3.cur_opt=="allcontent") || (gBody3.cur_opt=="mycontent") || (gBody3.cur_opt=="sharecontent") || (gBody3.cur_opt=="favoritecontent") || (gBody3.cur_opt=="allmention")){
			return true;			
		}else if ( (gBody2.select_left_menu=="1") || (gBody2.select_left_menu=="2") || (gBody2.select_left_menu=="3") || (gBody2.select_left_menu=="4") ){
			return true;
		}
		return false;
	},
	
	"check_top_menu" : function(){		
		if ( (id=="allcontent") || (id=="mycontent") || (id=="sharecontent") || (id=="favoritecontent") || (id=="allmention")){
			return true;
		}
		return false;
	},
	
	"check_top_menu_box" : function(id){		
		if ( (id=="allcontent") || (id=="mycontent") || (id=="sharecontent") || (id=="favoritecontent") || (id=="allmention")){
			return true;
		}
		return false;
	},
	
	"check_top_menu2" : function(){		
		if ( (id=="allcontent") || (id=="mycontent") || (id=="sharecontent")){
			return true;
		}
		return false;
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
	
	"message_check_reverse" : function(msg){
		var message = msg;
		message = message.replace(/&lt;/g, '<').replace(/&gt;/g, '>');		
		message = message.replace(/<br>/gi, "\n");
		message = message.replace(/&nbsp;/gi, " ");		
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
	
	"og_search" : function(content){		
		var isURL = gBody3.findUrls(content);
		var og = "";
		if (isURL.length > 0){
			if (gBody3.og_check(isURL[0])){
				og = gBody.search_og_only_search(isURL[0]);
			}else{
				og = {}
			}			
		}else{
			og = {};
		}		
		return og;
	},
	
	"og_check" : function(url){		
		//ogTag URL 날리기 전에 ogtag를 체크하지 않는 예외 처리를 추가한다.
		var ext = url.substr(url.lastIndexOf('.') + 1).toLowerCase();
		
		if (ext == "exe" || ext == "zip"){
			return false;
		}else{
			return true;
		}		
	},
		
	//////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////// TO-DO 관련 스크립트 ///////////////////////////////////////////////////
	"show_todo_init" : function(){
		gBody3.rigth_btn_change_empty();	
		gBody3.rigth_btn_change("todo");		
		//to-do를 표시할 수 있는 프레임은 보여주고 나머지는 숨긴다.
		gBody3.cur_todo = "status";		
		gTodo.init_load();		
		$("#left_main").css("width","312px");
		$("#main_body").css("left","366px");				
	},
	
	"channel_viewer" : function(ch_code, viewer_id, parent_id){	
		//viewer_id에 ch_code의 채널 데이터를 채팅 형태로 표시하는 함수 공통으로 사용하기 위해서 만든다.
		gBody3.cur_opt = ch_code;
		var id = ch_code;
		var query_str = "";
		var filter = "";		
		var query = JSON.stringify({
			"channel_code" : ch_code,
			"query_type" : "",
			"start" : gBody3.start,
			"perpage" : gBody3.perpage,
			"q_str" : query_str,
			"dtype" : filter,
			"type" : "1",
			"sort" : gBody3.post_view_type
		});		
		var url = gap.channelserver + "/channel_list.km";
		$.ajax({
			type : "POST",
			dataType : "text",
			data : query,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			url : url,			
			success : function(ress){				
				var res = JSON.parse(ress);				
				var list = res.data.data;			
				var html = "";
				if (list.length == 0){
					if (gBody3.start == 0){												
						var htm = "";
						htm += "<div class='msg-empty'>";
						htm += '	<img src="' + root_path + '/resource/images/empty.png" alt="" />';
						htm += gap.lang.nocontent;
						htm += "</div>";					
						$("#"+viewer_id).html(htm);
					}
					gBody3.islast= "T";
					return false;
				}else{
					try{
					    !!$("#"+viewer_id).data("mCS") && $("#"+viewer_id).mCustomScrollbar("destroy"); //Destroy
					}catch (e){
					    $("#"+viewer_id).data("mCS",''); //수동제거
					}
					
					for (var i = 0 ; i < list.length; i++){
						var item = list[i];						
						var date = "";
						if (gBody3.post_view_type == "2"){
							date = gap.change_date_localTime_only_date(item.GMT2);
						}else{
							date = gap.change_date_localTime_only_date(item.GMT);
						}			
						var cnt = $("#web_channel_dis_" + date).length;				
						var dis_date = gap.change_date_default(gap.change_date_localTime_only_date(item.GMT));						
						var dis_id = "date_" + date;					
						var datehtml = "";
						if (cnt == 0){									
							datehtml += "<div class='date' id='web_channel_dis_"+date+"'><span>"+dis_date+"</span></div>";							
							var hx = $("#" +viewer_id+ " .user-thumb").length;
							if (hx == 0){
								$("#"+viewer_id).html(datehtml);				
							}else{						
								$(datehtml).insertBefore($("#"+viewer_id).children().first());			
							}
						}										
						if (item.type == "msg"){
							var html = gBody3.draw_msg(item, "msg", date);
							$(html).insertAfter("#web_channel_dis_"+date);
						}else if (item.type == "file"){
							var html = gBody3.draw_file(item, date);
							$(html).insertAfter("#web_channel_dis_"+date);
						}else if (item.type == "emoticon"){
							var html = gBody3.draw_msg(item, "emoticon", date);
							$(html).insertAfter("#web_channel_dis_"+date);			
							
						}else if (item.type == "ogtag"){
							
						}
					}	
					if (gBody3.start == 0){
						gap.scroll_move_to_bottom_time(viewer_id, 500);
					}					
					var html2 = "";
					html2 += "<div class='chat-bottom'> ";		
					html2 += "		<div id='total-progress_channel' class='' style='height:1px;width: calc(100% - 1px); margin-left:10px'>";
					html2 += "			<div class='progress-bar' style='width:0%;background:#337ab7' data-dz-uploadprogress></div>";
					html2 += "		</div>";									
					html2 += "<div class='input-area'>";
					html2 += "	<button class='btn-choose ico'  id='other_btn'>추가</button>";
					html2 += "	<button class='btn-clip ico' id='open_attach_window2' style='display:none'></button>";					
					html2 += "	<textarea class='txt-chat' placeholder='"+gap.lang.input_message+"' id='message_txt_channel'></textarea>";
					html2 += "	<button class='btn-emoticon ico' id='open_emoticon2'>이모티콘</button>";
					html2 += "	<button class='btn-more ico' id='person_text_option2'>더보기</button>";
					html2 += "</div>";
					html2 += "	<div class='layer layer-menu opt-enter' style='right:10px;bottom:42px;display:none'>";
					html2 += "		<ul>";
					html2 += "			<li class='on'>Enter 전송 (Shift+Enter 줄바꿈)</li>";
					html2 += "			<li>Shift+Enter 전송 (Enter 줄바꿈)</li>";
					html2 += "		</ul>";
					html2 += "	</div>";
					html2 += "</div>";
					$("#todo_channel_top .chat-bottom").remove();   //기존내용을 제거하고 계속해야 이벤트가 적용된다.
					$("#" + parent_id).append(html2);					
					// mention
					gBody3.init_mention_userdata('message_txt_channel');				
				}			
				try{
				    !!$("#"+viewer_id).data("mCS") && $("#"+viewer_id).mCustomScrollbar("destroy"); //Destroy
				}catch (e){
				    $("#"+viewer_id).data("mCS",''); //수동제거
				}			
				$("#" + viewer_id).mCustomScrollbar({
					theme:"dark",
					autoExpandScrollbar: true,
					scrollButtons:{
						enable: false
					},
					mouseWheelPixels : 200, // 마우스휠 속도
					scrollInertia : 400, // 부드러운 스크롤 효과 적용
					mouseWheel:{ preventDefault: false },
					advanced:{
				//		updateOnContentResize: true
					},
					autoHideScrollbar : false,
					setTop : ($("#"+viewer_id).height()) + "px",
					callbacks : {
						onTotalScrollBack: function(){gBody3.channel_addContent_new(this, ch_code, viewer_id, parent_id)},
						onTotalScrollBackOffset: 10,
						alwaysTriggerOffsets:true
					}
				});				
				
				$("#" + parent_id +" .mCustomScrollBox").css("padding-right", "20px");
				$(".wrap-channel .message-file li").css("width", "100%");
				
				gBody3.__event_init_load();						
				gBody3.__draw_reply_event();  //댓글관련 컨텍스트 메뉴 적용을 위한 함수
				gBody3.__bottom_btn_event(viewer_id);				
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"channel_addContent_new" : function(obj, ch_code, vid, pid){
		//마지막 채팅의 id값을 가져다기 그 이전 값을 구해 온다.				
		if (gBody3.islast == "T"){
			return false;
		}			
		var new_start = parseFloat(gBody3.start) + parseFloat(gBody3.perpage);
		gBody3.start = new_start;	
		gBody3.channel_viewer(ch_code, vid, pid);		
		return false;		
	},
	
	"channel_item_add" : function(){
		// 공유채널 리스트 정보 가져오기		
		if (gap.cur_channel_list_info == ""){
			var surl = gap.channelserver + "/channel_info_list.km";			
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
					gap.cur_channel_list_info = res;					
					gBody3.add_channel_list();					
				},
				error : function(e){
					gap.error_alert();
				}
			});			
		}else{
			gBody3.add_channel_list();				
		}
	},
	
	"add_channel_list" : function(){		
		var list = "";	
		list += '<optgroup label="'+gap.lang.sharechannel+'" id="channel_list_opt">';
		list += "<option value=''>"+gap.lang.channelchoice+"</option>";	
		var clist = gap.cur_channel_list_info;
		for (var k = 0 ; k < clist.length; k++){
			var citem = clist[k];
			if (citem.type != "folder"){
				list += "<option value='"+citem.ch_code+"'>" + citem.ch_name + "</option>";
			}			
		}		
		list += '</optgroup>';
		$("#channel_list_opt").html(list);		
		$('#channel_list_opt').val(gBody3.cur_opt);
		$('#channel_list_opt').material_select();
		$('#channel_list_opt').on('change',function() {			
	        var selectedid = $(this).val();
	        var selectedText = $(".optgroup-option.active.selected").text();	       
	        gBody3.select_channel_code = selectedid;
	        gBody3.select_channel_name = selectedText;
	        id = selectedid;	        
	        //로컬 스토리지에 TO-DO코드에 대한 Default channel 코드와 이름을 등록해 놓고 추후 기본 값으로 불러온다.
	        localStorage.setItem("todocode", selectedid+"-spl-"+selectedText);		
	        gBody3.start = 0;
	        $("#todo_channel_list").empty();
			gBody3.channel_viewer(selectedid,"todo_channel_list", "todo_channel_top");
	    });
	},
	
	"__bottom_btn_event" : function(selectid){	
		//채널 리스트를 등록한다.
		//채널 정보를 가지고 온다. gap.cur_channel_list_info에 값이 없을 경우 // Box메뉴을 한번도 클릭하지 않고 바로 TO-DO를 클릭한 경우		
		var isdropzone = $("#"+selectid)[0].dropzone;
		if (isdropzone) {
			isdropzone.destroy();
		}		
		myDropzone_channel = new Dropzone("#"+selectid, { // Make the whole body a dropzone
		      url: gap.channelserver + "/FileControl.do", // Set the url
		      autoProcessQueue : false, 
			  parallelUploads : 100,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
			  maxFilesize: 1000,
			  timeout: 36000000,
		  	  uploadMultiple: true,
		  	  withCredentials: false,
		  	  previewsContainer: "#previews_channel", // Define the container to display the previews
		  	  clickable: "#other_btn", // Define the element that should be used as click trigger to select files.
		  	  renameFile: function(file){
					return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			  },
		  	  init: function() {		
					myDropzone_channel = this;
					this.imagelist = new Array();
				//	this.on('error', function(file, response){			        	
			    //    	gap.gAlert(response);       	
			     //   	return false;
			    //    });
					this.on('dragover', function(e,xhr,formData){
			        	$("#"+selectid).css("border", "2px dotted #005295");
			        	return false;
			        });
			        this.on('dragleave', function(e,xhr,formData){
			        	$("#"+selectid).css("border", "");
			        	return false;
			        });
			  },
		      success : function(file, json){		    	
		    	  var jj = JSON.parse(json);
		    	  if (jj.result == "OK"){		    		 
		    		  myDropzone_channel.files_info = jj;
		    	  }		    	 		
		      }		
		});
		
		myDropzone_channel.on("totaluploadprogress", function(progress) {	
			$("#show_loading_progress").text(parseInt(progress) + "%");
			document.querySelector("#total-progress_channel .progress-bar").style.width = progress + "%";
		});
		
		myDropzone_channel.on("queuecomplete", function (file) {	
			
			gap.hide_loading();			
			//파일을 컨텐트 영역에 그린다. ////////////			
			gBody3.send_file();
			//////////////////////////////			
			gBody3.clear_dropzone();
			var xtime1 = setTimeout(function(){
				gBody3.complete_process_channel();
				clearTimeout(xtime1);				
			}, 800);
		});
	      
		myDropzone_channel.on("addedfiles", function (file) {	
			if (file.size > (this.options.maxFilesize * 1024 * 1024)){
			   this.removeFile(file);
			   alert("'" + file.name + "'" + "" + gap.lang.file_ex + "\n(MaxSize : " + this.options.maxFilesize + "M)");
			}
			if (gap.no_upload_file_type_check(file.name)){
				$("#total-progress_folder").hide();
				this.removeFile(file);				
				gap.gAlert(file.name + " " + gap.lang.nofileup);			
			}		
	        $("#"+selectid).css("border", "");
			gBody3.popup_status = "file";
			gBody3.add_upload_file_list(file, "file");				
			$("#f_u1").text(gap.lang.file + " " + gap.lang.upload);
			$("#f_u2").text(gap.lang.scpp);			
			gap.showBlock();	
			var inx = parseInt(gap.maxZindex()) + 1;
			$("#fileupload_layer").css("z-index", inx);
			$("#fileupload_layer").fadeIn();
			$("#total-progress_channel").show();
		});
		
		myDropzone_channel.on("sending", function (file, xhr, formData) {			
			gap.show_loading(gap.lang.saving);			
			$("#"+selectid).css("border", "");			
			var msg = $("#fileupload_content").val();			
			var og = gBody3.og_search(msg);			
			//mention 처리 /////////////////////////////////////////////////////////////
			var mentions_msg = "";
			var mentions_data = "";
			$("#fileupload_content").mentionsInput('val', function(text){
				mentions_msg = gap.textMentionToHtml(text);;
			});
			$("#fileupload_content").mentionsInput('getMentions', function(data){
				mentions_data = data;
			});
			//////////////////////////////////////////////////////////////////////////			
			formData.append("email", gap.userinfo.rinfo.ky);
			formData.append("ky", gap.userinfo.rinfo.ky);
		//	formData.append("content", msg);
			formData.append("content", mentions_msg);
			formData.append("mention", mentions_data);
			formData.append("channel_code", gBody3.select_channel_code2);
			formData.append("channel_name", gBody3.select_channel_name2);
			formData.append("owner", JSON.stringify(gap.userinfo.rinfo));
			formData.append("fserver", gap.channelserver);
			formData.append("type", "channel");
			formData.append("edit", gBody3.edit_mode);
			formData.append("id", gBody3.select_channel_id);
			formData.append("og", JSON.stringify(og));		
			myDropzone_channel.files_info = "";
			$("#total-progress_channel").show();	
	       // $("#chat_msg").css("border","");
	        document.querySelector("#total-progress_channel .progress-bar").style.display = "";
		});
		
		$("#add_tab_btn").off();
		$("#add_tab_btn").on("click", function(e){
			gBody3.show_add_tab_layer();
			//선택창 레이어를 띄워야 한다.
		});		
		
		$("#upload_channel_file").off();
		$("#upload_channel_file").on("click", function(e){
			myDropzone_channel.processQueue();
		});
		
		$("#fileupload_cancel").off();
		$("#fileupload_cancel").on("click", function(e){			
			$("#p_close_channel").click();			
			return false;
		});	
		
		$("#file_upload_add").off();
		$("#file_upload_add").on("click", function(e){
			$("#open_attach_window2").click();
		});
		
		/*
		$("#fileupload_start").off();
		$("#fileupload_start").on("click", function(e){	
			var sel_txt = $("#share_channel_list_popup option:checked").text();
			var sel_val = $("#share_channel_list_popup option:checked").val();	
			var key = $('#share_channel_list_popup').val();
			if ( (key == null) || (key == "")){
				gap.gAlert(gap.lang.selectchannel);
				return false;
			}			
			if (gBody3.popup_status == "file"){				
				if (gBody3.edit_mode == "T"){
					var drop_file_count = myDropzone_channel.files.length;
					if (drop_file_count > 0){
						//원본 문서에서 파일을 삭제하는 경우 삭제된 파일을 먼저 정리한다.
						if (gBody3.delete_file_list.length > 0){
							gBody3.sub_file_delete_send_server();
						}else{
							myDropzone_channel.processQueue();
						}			
					}else{
						//추가된 파일이 없는 경우						
						//mention 처리 /////////////////////////////////////////////////////////////
						var mentions_msg = "";
						var mentions_data = "";
						$("#fileupload_content").mentionsInput('val', function(text){
							mentions_msg = gap.textMentionToHtml(text);;
						});
						$("#fileupload_content").mentionsInput('getMentions', function(data) {
							mentions_data = data;
						});
						///////////////////////////////////////////////////////////////////////////						
						gBody3.sub_file_delete_send_server2(mentions_msg, mentions_data);
					}
				}else{
					//업로드 할 파일이 있는지 체크한다.					
					var fcount = $("#upload_file_list .attach-name").length;					
					if (fcount == 0){
						gap.gAlert(gap.lang.select_upload_file);
						return false;
					}					
					myDropzone_channel.processQueue();
				}	
				gBody3.hide_upload_layer();				
				gBody3.popup_status = "";
				// mention div 영역 초기화
				gap.reset_mentions_div();				
				$("#upload_file_list_edit").empty();
				$("#fileupload_content").val("");				
			}else if (gBody3.popup_status == "msg"){			
				var msg = $("#fileupload_content").val();								
				if (msg.trim() == ""){
					gap.gAlert(gap.lang.input_message);
					return false;
				}				
				var og = gBody3.og_search(msg);				
				//mention 처리 /////////////////////////////////////////////////////////////
				var mentions_msg = "";
				var mentions_data = "";
				$("#fileupload_content").mentionsInput('val', function(text){
					mentions_msg = gap.textMentionToHtml(text);;
				});
				$("#fileupload_content").mentionsInput('getMentions', function(data) {
					mentions_data = data;
				});
				///////////////////////////////////////////////////////////////////////////				
				var data = JSON.stringify({
					"type" : "msg",
					"channel_code" : sel_val,
					"channel_name" : sel_txt,
					"email" : gap.userinfo.rinfo.em,
					"ky" : gap.userinfo.rinfo.ky,
					"owner" : gap.userinfo.rinfo,
					"content" : mentions_msg,	//msg,
					"mention" : mentions_data,
					"edit" : gBody3.edit_editor,
					"msg_edit" : gBody3.edit_mode,
					"id" : gBody3.select_channel_id,
					"og" : og
				});				
				gBody3.send_msg_to_server(data);				
				gBody3.popup_status = "";
				// mention div 영역 초기화
				gap.reset_mentions_div();				
				$("#fileupload_content").val("");
				gBody3.hide_upload_layer();	
				gap.hideBlock();			
			}else if (gBody3.popup_status == "emoticon"){							
				var msg = $("#fileupload_content").val();
				var filepath = $("#up_emoticon_img").attr("src");				
				var og = gBody3.og_search(msg);				
				//mention 처리 /////////////////////////////////////////////////////////////
				var mentions_msg = "";
				var mentions_data = "";
				$("#fileupload_content").mentionsInput('val', function(text){
					mentions_msg = gap.textMentionToHtml(text);;
				});
				$("#fileupload_content").mentionsInput('getMentions', function(data) {
					mentions_data = data;
				});
				///////////////////////////////////////////////////////////////////////////				
				var data = JSON.stringify({
					"type" : "emoticon",
					"channel_code" : sel_val,
					"channel_name" : sel_txt,
					"email" : gap.userinfo.rinfo.em,
					"ky" : gap.userinfo.rinfo.ky,
					"owner" : gap.userinfo.rinfo,
					"content" : mentions_msg,	//msg,
					"mention" : mentions_data,
					"epath" : filepath,
					"edit" : gBody3.edit_editor,
					"msg_edit" : gBody3.edit_mode,
					"id" : gBody3.select_channel_id,
					"og" : og
				});				
				gBody3.send_msg_to_server(data);
				gBody3.hide_upload_layer();	
				gap.hideBlock();				
				gBody3.popup_status = "";
				// mention div 영역 초기화
				gap.reset_mentions_div();				
				$("#fileupload_content").val("");				
			}else if (gBody3.popup_status == "mail"){
				var data = gBody3.temp_mail_info;
				gBody3.send_msg_to_server(data);
				gBody3.popup_status = "";
				gBody3.hide_upload_layer();	
				gap.hideBlock();				
			}			
		});
		*/
		
		$("#p_close_channel").off();
		$("#p_close_channel").on("click", function(e){			
			gBody3.edit_mode = "";
			gBody3.popup_status = "";
			// mention div 영역 초기화
			gap.reset_mentions_div();				
			$("#fileupload_content").val("");
			$("#upload_file_list_edit").empty();			
			gBody3.hide_upload_layer();
			gap.hideBlock();
			gBody3.clear_dropzone();		
			return false;
		});
				
		$("#channel_option li").off();
		$("#channel_option li").on("click", function(e){			
			var id = e.currentTarget.id;			
			//$("#channel_list").html("");
			$("#"+selectid+" .date").remove();
			$("#"+selectid+" .xman").remove();
			$("#"+selectid+" #grid_wrap").remove();			
			$("#ch_query").val("");			
			gBody3.removeClass_channel();
			$("#" + id).addClass("on");			
			var query = "";			
			gBody3.cur_opt = id;
			gBody3.islast = "F";
			gBody3.start = 0;			
			//필터링 설정한 부분을 초기화 한다.
			gBody3.click_filter_image = "";
			$("#channel_filter ul li button").removeClass("on");									
			gBody3.draw_channel_list();						
		});			
		
		$("#person_text_option2").off();
		$("#person_text_option2").on("click", function(){
			//채팅창에서 개인 설정 선택한 경우				
			var html = "";
			html += "<div class='layer layer-menu opt-enter' id='enter_opt'>";
			html += "<ul>";		
			if (gap.enter_opt == "1"){
				html += "<li class='on' onclick='gBody3.enteropt(1)'>"+gap.lang.enteroptions1+"</li>";
				html += "<li  onclick='gBody3.enteropt(2)'>"+gap.lang.enteroptions2+"</li>";
			}else{
				html += "<li  onclick='gBody3.enteropt(1)'>"+gap.lang.enteroptions1+"</li>";
				html += "<li class='on'  onclick='gBody3.enteropt(2)'>"+gap.lang.enteroptions2+"</li>";
			}			
			html += "</ul>";
			html += "</div>";		
			$("#person_text_option2").qtip({
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
		
		$("#message_txt_channel").off();
		$("#message_txt_channel").bind("keypress", function(e){			
			if (e.keyCode == 13){				
				var enter_opt = gap.enter_opt;		
		        if (e.keyCode == 13 && !e.shiftKey){          	
		        	if (enter_opt == "1"){
		        		gBody3.sendMessage(e);            
		        	}else if (enter_opt == "2"){
		        		//다음줄로 내려간다.    
		        	//	gBody3.enter_next_line(e);
		        	}
		        }           
		        if (e.keyCode == 13 && e.shiftKey) {
		        	if (enter_opt == "1"){
		        		//다음줄로 내려간다.
		        	//	gBody3.enter_next_line(e);
		        	}else{
		        		gBody3.sendMessage(e);  
		        	}       	
		        }
			}
		});
		
		$("#message_txt_channel").bind("keyup", function(e){
			if (e.keyCode == 8 || e.keyCode == 46){		// backspace or delete key
			//	gBody3.enter_line_control(e);
			}
		});		
		
		/*
		$("#open_emoticon2").off();
		$("#open_emoticon2").on("click", function(){
			
			//채팅창에서 개인 설정 선택한 경우				
			$("#editor_close").click();			
			var html = "";
			html += "<div class='layer-emoticon' >";			
			html += "<ul class='tab-nav'>";
			html += "	<li ><h2 class='tab_emo_active' data-id='APBADAs'>DSW Friends1</h2></a></li>";
			html += "	<li><h2 class='tab_emo_noactive' data-id='APFriends'>DSW Friends2</h2></a></li>";
			html += "</ul>";
			for (var k = 101; k < 106; k++){
				html += "		<li><img src='./emoticons/"+k+".gif' data='"+k+".gif'></li>";
			}
			html += "	<button class='ico btn-article-close' id='emo_close'>닫기</button>";			
			html += "	<div class='tabcontent'>";
			html += "		<div id='APBADAs' >";
			html += "			<ul class='list-emoticon' id='emoti_dis' style='overflow:hidden'>";
			html += "			</ul>";
			html += "		</div>";
			html += "		<div id='APFriends' style='display:none'>";
			html += "			<ul class='list-emoticon' id='emoti_dis2' style='overflow:hidden'>";		
			for (var kk = 1; kk < 31; kk++){
				html += "				<li><img src='./emoticons/" + kk + ".gif' data='"+kk+".gif' /></li>";
			}
			html += "			</ul>";
			html += "		</div>";
			html += " 	</div>";			
			html += "</div>";
							
			$("#open_emoticon2").qtip({
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
							gBody3.send_emoticon_msg(fname);
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
							$("#open_emoticon2").qtip('api').hide();
						});
					},
					hidden : function(event, api){
						api.destroy(true);
					}
				}
			});				
		});
			*/
		
		
		$("#ch_query").keypress(function(e){
			if (e.keyCode == 13){
				gBody3.search_enter();
			}
		});
		
		$("#ch_query_btn").on("click", function(e){
			gBody3.search_enter();
		});	
	},
	
	"enteropt" : function(opt){
		gap.enter_opt = String(opt);
		_wsocket.change_enter_opt(opt);
	},	
	
	"channel_read_update" : function(channel_code){
		//채널코드를 넘겨서 해당 채널에 마지막 읽은 시간을 업데이트 한다.		
		var data = JSON.stringify({
			"channel_code" : channel_code
		});
		var url = gap.channelserver + "/channel_read_update.km";		
		$.ajax({
			type : "POST",
			data : data,
			url : url,
			contentType : "application/json; charset=utf-8",
			datatype : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					//gap.delete_all_read_time();
					gap.change_cur_channel_read_time(channel_code, res.data2);
				}
			},
			error : function(e){
				gap.error_alert();
			}
		})
	},
	
	//gBody가 최초 실행 될때 읽지 않은 Box내용이 있는지 확인하기 위해서 호출된다.
	"check_unread" : function(){		
		var mserver = mailserver.toLowerCase();	
		if (mserver.indexOf("dswdv") > -1){
			loc = "dev";		
		}else{
			loc = "ko";
		}		
		if (loc == "dev" || loc == "ko"){		
			if (localStorage.getItem("auth") != null){
				var data = JSON.stringify({});				
				var url = gap.channelserver + "/api/channel/channel_info_unread.km";
				$.ajax({
					type : "POST",
					data : data,
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					url : url,
					dataType : "json",
					contentType : "application/json; charset=utf-8",
					success : function(res){
					
						if (res.result == "T"){
							$("#tab3_sub").html(gap.lang.channel + "<span class='ico-new'></span>");
						}
					},
					error : function(e){
						gap.error_alert();
					}
				});
			}		
		}		
	},
		
	 "init_mention_userdata" : function(elem_id){ 		
		if (elem_id == "rmtext" || (elem_id.indexOf("reply_compose_") > -1)){
			//$("#" + elem_id).closest('.mentions-input-box').children('.mentions').remove();
			//$("#" + elem_id).closest('.mentions-input-box').children('.mentions-autocomplete-list').remove();
			gBody3.reset_mention_userdata(elem_id);
		}	
		$('#' + elem_id).mentionsInput({ 
			onDataRequest:function (mode, query, callback) { 
				if (elem_id == "fileupload_content" || elem_id == "rmtext" || (elem_id.indexOf("reply_compose_") > -1)){ 
					$(".mentions-input-box .mentions-autocomplete-list").css("position", "absolute"); 
					if (gBody3.select_channel_code2 != undefined){ 
						var list = gBody3.search_channel_members(gBody3.select_channel_code2); 
						
					}else{ 
						var list = [];
					}
				}else{ 
					$(".mentions-input-box .mentions-autocomplete-list").css("position", (gap.browser == "msie" ? "-ms-page" : "fixed")); 
					var list = gBody3.search_channel_members(gBody3.select_channel_code); 
				} 
				var data = JSON.parse(gap.convert_mention_userdata(list)); 
				
				data = _.filter(data, function(item) { return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1 }); 
				callback.call(this, data); 
			} 
		});
	},
	
	"reset_mention_userdata" : function(elem_id){
		// 멘션 설정 초기화
		/*
		$("#" + elem_id).parent().children().eq(0).remove();
		$("#" + elem_id).parent().children().eq(1).remove();		// 0번째가 삭제 되었으므로 기존 2번째는 1번째임
		$("#" + elem_id).unwrap();
		$("#" + elem_id).removeAttr('data-mentions-input');
		*/
		
		var $el = $("#" + elem_id);
		$el.closest('.mentions-input-box').children('.mentions').remove();
		$el.closest('.mentions-input-box').children('.mentions-autocomplete-list').remove();
		$el.removeAttr('data-mentions-input');
		if ($el.parent().hasClass('mentions-input-box')) {
			$el.unwrap();			
		}
	},
	 
	 "popup_like_person" : function(e){		 
		 gBody3.click_like_obj = $(e.currentTarget);
		 var id = $(e.currentTarget).attr("id").replace("like_","");		 
		 var cnt = $("#like_" + id).text();
		 if (cnt == '0'){
			 return false;
		 }	 
		 var url = gap.channelserver + "/like_list.km";
		 var data = JSON.stringify({
			 id : id
		 })
		 $.ajax({
			 type : "POST",
			 data : data,
			 url : url,
			 contentType : "application/json; charset=utf-8",
			 dataType : "json",
			 success : function(res){
				var html = "";					
				var list = res.data.data;					
				html += "<div id='work-chat-popup' style='max-height:300px; overflow-y:auto; padding: 0 15px 10px 15px'>";
				html += "<div class='like-cont' style=''>";
				for (var i = 0 ; i < list.length; i++){
					var item = list[i];
					var user_info = gap.user_check(item.owner);
					var owner_img = gap.person_profile_photo(item.owner);
					html += "<div class='like-who'>";
					html += "	<div class='user' style='width:30px; height:30px; border-radius:50%;'>";
					html += "		"+owner_img+"";
				//	html += "		<span class='status online'></span>";
					html += "	</div>";
					html += "<div class='who-name' style='padding-left:5px'>" + user_info.name + " " +  user_info.jt + " <span>" + user_info.dept + "</span></div>";
					html += "</div>";										
				}
				html += "</div>";
				html += "</div>";
		
				gBody3.click_like_obj.qtip({
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
						viewport: $("#channel_list"),
	                    					
						my : 'top right',
						at : 'bottom left',
						//target : $(this)
						adjust: {
						  x: 100,
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
		 	},
		 	error : function(e){
		 		gap.error_alert();
		 	}
		 });
	 },
	 
	 "channel_reg_vote" : function(obj){
		 obj.type = "vote";													
		 var data = JSON.stringify({
		 	"type" : "msg",
		 	"channel_code" : gBody3.select_channel_code,
		 	"channel_name" : gBody3.select_channel_name,
		 	"email" : gap.userinfo.rinfo.em,
		 	"ky" : gap.userinfo.rinfo.ky,
		 	"owner" : gap.userinfo.rinfo,
		 	"content" : "",
		 	"edit" : gBody3.edit_editor,
		 	"msg_edit" : "",
		 	"id" : gBody3.select_channel_id,
		 	"ex" : obj
		 });

		 gBody3.send_msg_to_server(data);
	 },
	 
	 "create_vote" : function(){
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
		var html =
			'<div id="vote_write_layer" class="mu_container layer_wrap center vote_create" style="width: 570px;">' +
			'	<div class="layer_inner">' +
			'		<div class="pop_btn_close"></div>' +
			'		<h4>' + gap.lang.vote_creation + '</h4>' +
			'		<div class="layer_cont left">' +
			'			<div class="cont_wr f_between v_color">' +
			'				<div class="table_type_c" style="max-height:600px; overflow:auto">' +
			'					<table class="nothover">' +
			'						<tbody>' +
			'						<tr>' +
			'							<th><span>' + gap.lang.deadline + '</span></th>' +
			'							<td class="inb">' +
			'								<div class="selectbox mu_calendar" style="width: 135px;">' +
			'									<div id="end_date" class="rel">' +
			'										<div class="abs type_icon"></div><span id="disp_end_date" style="line-height:36px">' + gap.lang.deadline + '</span>' +
			'									</div>' +
			'								</div>' +
			'								<div class="input-field selectbox">' +
			'									<select id="end_time">' +
			'									</select>' +
			'								</div>' +
			'							</td>' +
			'						</tr>' +
			'						<tr>' +
			'							<th><span>' + gap.lang.vote_title + '</span></th>' +
			'							<td>' +
			'								<input type="text" name="" id="vote_title" class="input" placeholder="(' + gap.lang.essential + ') ' + gap.lang.input_vote_title + '">' +
			'							</td>' +
			'						</tr>' +
			'						<tr>' +
			'							<th><span>' + gap.lang.description + '</span></th>' +
			'							<td>' +
		//	'								<input type="text" name="" id="vote_description" class="input" placeholder="(' + gap.lang.optional + ') ' + gap.lang.input_vote_comment + '">' +
			'								<textarea name="" id="vote_description" class="input" onInput="gap.auto_height_check(this)" style="line-height:25px; max-height:70px; width:100%" placeholder="(' + gap.lang.optional + ') ' + gap.lang.input_vote_comment + '"></textarea>' +
			'							</td>' +
			'						</tr>' +
			'						<tr>' +
			'							<th style="vertical-align: top;"><span style="vertical-align: -16px;">' + gap.lang.select_item + '</span></th>' +
			'							<td>' +
			'								<span class="radio_box">' +
			'									<input type="radio" id="sele_01" name="select_item" value="text" checked="checked">' +
			'									<label for="sele_01">' + gap.lang.text + '</label>' +
			'								</span>' +
			'								<span class="radio_box">' +
			'									<input type="radio" id="sele_02" name="select_item" value="date">' +
			'									<label for="sele_02">' + gap.lang.date + '</label>' +
			'								</span>' +
			'								<!-- 텍스트 선택시 활성화 (dn 제거) -->' +
			'								<div id="text_area" class="v_text_wr">' +
//			'									<input type="text" name="text_item" id="text_input_1" class="input" placeholder="' + gap.lang.input_content + '">' +
//			'									<input type="text" name="text_item" id="text_input_2" class="input" placeholder="' + gap.lang.input_content + '">' +
			'									<textarea name="text_item" id="text_input_1" onInput="gap.auto_height_check(this)" style="line-height:25px; max-height:70px; width:100%" class="input" placeholder="' + gap.lang.input_content + '"></textarea>' +
			'									<textarea name="text_item" id="text_input_2" onInput="gap.auto_height_check(this)" style="line-height:25px; max-height:70px; width:100%" class="input" placeholder="' + gap.lang.input_content + '"></textarea>' +
			'								</div>' +
			'								<!-- 날짜 선택시 활성화 -->' +
			'								<div id="date_area" class="v_date_wr dn">' +
			'									<div class="f_between">' +
			'										<input type="text" name="date_item" id="date_input_1" class="input" placeholder="' + gap.lang.input_date + '">' +
			'										<button class="type_icon" id="date_input_ico_1"></button>' +
			'									</div>' +
			'									<div class="f_between">' +
			'										<input type="text" name="date_item" id="date_input_2" class="input" placeholder="' + gap.lang.input_date + '">' +
			'										<button class="type_icon" id="date_input_ico_2"></button>' +
			'									</div>' +
			'								</div>' +
			'								<div id="add_item" class="item_add_wr">' +
			'									<button><span></span>' + gap.lang.add_item + '</button>' +
			'								</div>' +
			'							</td>' +
			'						</tr>' +
			'						<tr>' +
			'							<th><span>' + gap.lang.anonymous_voting + '</span></th>' +
			'							<td>' +
			'								<span class="radio_box">' +
			'								    <input type="radio" id="anon_01" name="anonymous" value="T">' +
			'								    <label for="anon_01">' + gap.lang.use + '</label>' +
			'								</span>' +
			'								<span class="radio_box">' +
			'								    <input type="radio" id="anon_02" name="anonymous" value="F" checked="checked">' +
			'								    <label for="anon_02">' + gap.lang.not_used + '</label>' +
			'								</span>' +
			'							</td>' +
			'						</tr>' +
			'						<tr>' +
			'							<th><span>' + gap.lang.item + '<br>' + gap.lang.multiple_choice + '</span></th>' +
			'							<td>' +
			'								<span class="radio_box">' +
			'									<input type="radio" id="mult_01" name="multiple" value="T">' +
			'									<label for="mult_01">' + gap.lang.possible + '</label>' +
			'								</span>' +
			'								<span class="radio_box">' +
			'									<input type="radio" id="mult_02" name="multiple" value="F" checked="checked">' +
			'									<label for="mult_02">' + gap.lang.impossible + '</label>' +
			'								</span>' +
			'							</td>' +
			'						</tr>' +
			'						</tbody>' +
			'					</table>' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'		<div class="btn_wr">' +
			'			<button class="btn_layer confirm">' + gap.lang.create + '</button>' +
			'		</div>' +
			'	</div>' +
			'</div>'
		
		$("#channel_main").hide();
		gap.showBlock();
		$(html).appendTo('body');
		var $layer = $('#vote_write_layer');
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');	
		
		// 닫기
		$layer.find('.pop_btn_close').off().on('click', function(){
			gap.hideBlock();		
			$layer.remove();		
			return false;
		});
		
		// 마감일
		var $end_date = $('#end_date');
		var sel_date = moment().format('YYYY-MM-DD');
		$layer.find('#end_date').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			defaultSelection: moment(sel_date),
			anchor: $end_date.get(0),
			display: 'anchored',
			themeVariant : 'light',
			theme: 'ios',
			controls: ['calendar'],
			select: 'date',
			dateFormat: 'YYYY.MM.DD',
			calendarType: 'month',
			touchUi: true,
			buttons: [],
			min: moment().format('YYYY.MM.DD'),
		    onChange: function (event, inst) {
			//	$el.data('duedate', event.valueText);						// 표시용
			//	$el.data('sdate', moment().utc().format());					// 일정등록 시 사용
			//	$el.data('edate', moment(event.value).utc().format());		// 마감일
				
				$layer.find('#disp_end_date').html(event.valueText)
		    }
		});
		
		$("input[name='date_item']").each(function(idx, val){
			var $date = $('#date_input_' + (idx + 1));
			var sel_date = moment().format('YYYY-MM-DD');
			$layer.find('#date_input_' + (idx + 1)).mobiscroll().datepicker({
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
					console.log(">> " + event.valueText);
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
		$end_time.append(time_html).val(end_time);
		$layer.find('select').material_select();
			
		// 선택항목
		$("input[name='select_item']").off().on('change', function(){
			var _val = $("input[name='select_item']:checked").val();
			
			if (_val == "text"){
				$layer.find('#text_area').removeClass('dn');
				$layer.find('#date_area').addClass('dn');
				
			}else{
				$layer.find('#date_area').removeClass('dn');
				$layer.find('#text_area').addClass('dn');
			}
		});
		
		// 항목추가
		$layer.find('#add_item').off().on('click', function(){
			var _val = $("input[name='select_item']:checked").val();
			if (_val == "text"){
			//	var html = '<input type="text" name="text_item" id="text_input_' + ($("input[name='text_item']").length + 1) + '" class="input" placeholder="' + gap.lang.input_content + '">';
				var html = '<textarea name="text_item" id="text_input_' + ($("input[name='text_item']").length + 1) + '" class="input" onInput="gap.auto_height_check(this)" style="line-height:25px; max-height:70px; width:100%" placeholder="' + gap.lang.input_content + '"></textarea>';
				$layer.find('#text_area').append(html);
				
			}else if (_val == "date"){
				var html =
					'<div class="f_between">' +
					'	<input type="text" name="date_item" id="date_input_' + ($("input[name='date_item']").length + 1) + '" class="input" placeholder="' + gap.lang.input_date + '">' +
					'	<button class="type_icon" id="date_input_ico_' + ($("input[name='date_item']").length + 1) + '"></button>' +
					'</div>';
				$layer.find('#date_area').append(html);
				
				$("input[name='date_item']").each(function(idx, val){
					var $date = $('#date_input_' + (idx + 1));
					var sel_date = moment().format('YYYY-MM-DD');
					$layer.find('#date_input_' + (idx + 1)).mobiscroll().datepicker({
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
							console.log(">> " + event.valueText);
					    }
					});
				});
				
				$layer.find('.v_date_wr .type_icon').off().on('click', function(){
					$(this).parent().find('input').click();
					return false;
				});
			}
		});
		
		// 생성
		$layer.find('.confirm').off().on('click', function(){
			var $title = $layer.find('#vote_title');
			if ($title){
				if ($title.val() == ""){
					mobiscroll.toast({message:gap.lang.input_vote_title, color:'danger'});
					return false;
				}
			}
			
			var _list = [];
			var _val = $("input[name='select_item']:checked").val();
			if (_val == "text"){
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
								"end_date" : $layer.find('#disp_end_date').html(),
								"end_time" : $layer.find('#end_time').val(),
								"title" : $layer.find('#vote_title').val(),
								"comment" : $layer.find('#vote_description').val(),
								"select_item" : $("input[name='select_item']:checked").val(),
								"anonymous_vote" : $("input[name='anonymous']:checked").val(),
								"multi_choice" : $("input[name='multiple']:checked").val(),
								"item_list" : _list
							};
						gBody3.channel_reg_vote(voteData);
						$layer.find('.pop_btn_close').click();
						
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
		
		$layer.find('.v_date_wr .type_icon').on('click', function(){
			$(this).parent().find('input').click();
			return false;
		});
	},
	
	"response_vote" : function(_vote){
		var _info = JSON.parse(JSON.parse(_vote));
		var _key = _info.key;
		var _title = _info.title;
		var _comment = _info.comment;
		var _endtime = _info.endtime;
		var _anonymous = _info.anonymous;
		var _multi = _info.multi;
		var _owner = _info.owner;		
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
					
					// 처음 호출한 경우
					if ($('#vote_response_layer').length == 0){
						var html =
							'<div id="vote_response_layer" class="mu_container layer_wrap center vote_wrap" style="width: 460px;">' +
							'	<div class="layer_inner">' +
							'		<div class="pop_btn_close"></div>' +
							'		<h4>' + gap.lang.vote + '</h4>' +
							'		<div class="vote_deadline">' +
							'			<span class="deadline">' + gap.lang.deadline + '</span>' +
							'			<time>' + _endtime + '</time>' +
							'		</div>' +
							'		<div class="vote_tit">' +
							'			<p>' + _title + '</p>' +
							'			<span>' + gap.aLink(_comment.replace(/[\n]/gi,"<br>")) + '</span>' +
							'		</div>' +
							'		<div class="vote_list">' +
						//	'			<div class="list_sub_txt">' +
						//	'				<span class="ico"></span>' +
						//	'				<span>복수선택 가능</span>' +
						//	'			</div>' +
							'		</div>' +
							'		<div class="btn_wr">';
					
						if (_owner == gap.userinfo.rinfo.ky && _anonymous != "T"){
							// 투표 생성자인 경우 다운로드 버튼 제공
							html +=
								'			<button type="button" class="btn_layer confirm vote" style="margin-right:5px;">' + gap.lang.vote + '</button>' +
								'			<button type="button" class="btn_layer download vote" style="margin-left:5px;">' + gap.lang.download + '</button>';
							
						}else {
							html +=
								'			<button type="button" class="btn_layer confirm vote">' + gap.lang.vote + '</button>';
						}
						
						html +=
							'		</div>' +
							'	</div>' +
							'</div>'							
					
						$("#channel_main").hide();
						gap.showBlock();
						$(html).appendTo('body');					
						var $layer = $('#vote_response_layer');
						$layer.show();
						var inx = parseInt(gap.maxZindex()) + 1;
						$layer.css('z-index', inx).addClass('show-layer');						
					}else{
						// 투표완료 후 다시 그릴때
						var $layer = $('#vote_response_layer');
						$layer.find('.vote_list').empty();
					}				
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
						vote_list_html += '<div id="' + item_id + '" class="input_box rel">';						
						vote_list_html += '	<span class="vote_text">' + info.data.replace(/[\n]/gi,"<br>") +'</span>';						
						vote_list_html += '	<div id="voter_' + item_id + '" class="icon_box">';
						vote_list_html += '		<span class="ico"></span>';
						vote_list_html += '		<span class="vote_count">' + (typeof(info.members) != "undefined" ? info.members.length : '0') + '</span>';
						vote_list_html += '	</div>';
						vote_list_html += '</div>';						
						$layer.find('.vote_list').append(vote_list_html);
						$layer.find('#voter_' + item_id).data('voter', (typeof(info.members) != "undefined" ? info.members : ''));
					}
					
					if (_multi == "T"){
						var multi_html = 
							 '<div class="list_sub_txt">' +
							 '	<span class="ico"></span>' +
							 '	<span>' + gap.lang.possible_multiple_choice + (_anonymous == "T" ? ', ' + gap.lang.anonymous_voting : "") + '</span>' +
							 '</div>';
						$layer.find('.vote_list').append(multi_html);
						
					}else{
						if (_anonymous == "T"){
							var add_html = 
								 '<div class="list_sub_txt">' +
								 '	<span>' + gap.lang.anonymous_voting + '</span>' +
								 '</div>';
							$layer.find('.vote_list').append(add_html);
						}
					}
					
					if (vote_done){
						$layer.find('.confirm').html(gap.lang.basic_modify);
					}
					
					// 닫기
					$layer.find('.pop_btn_close').off().on('click', function(){
						gap.hideBlock();
						$layer.remove();
						gBody3.hideBodyBlock();
						return false;
					});					
					
					// 투표항목 클릭
					$layer.find('.input_box.rel').off().on('click', function(e){
						if (e.target.className == "vote_text"){
							if (_multi == "T"){
								if ($(this).hasClass('on')){
									$(this).removeClass('on');
									
								}else{
									$(this).addClass('on');
								}								
							}else{
								$layer.find('.input_box.rel').each(function(idx, el){
									$(el).removeClass('on');
								});
								
								$(this).addClass('on');
							}
							$layer.find('.formInput').blur();
							
						}else if (e.target.className == "ico" || e.target.className == "vote_count"){
							
							if (_anonymous == "T"){
								mobiscroll.toast({message:gap.lang.anonymous_vote_not_support, color:'info'});
								return false;
							}
							var $el = $('#voter_' + $(this).attr('id'));
							var voter = $el.data('voter');
							if (voter != ""){
								gBody3.show_voter_list($el, voter);
							}
						}
					});
					
					// 투표버튼 클릭
					$layer.find('.confirm').off().on('click', function(){
						var _deadline = false;
						var t1 = moment(_endtime, 'YYYY-MM-DD HH:mm'); 
						var t2 = moment(); 
						var dif = moment.duration(t2.diff(t1)).asMinutes();						
						// 투표 마감 기한 체크
						if (dif > 0){
							_deadline = true;
						}
						
						if (_deadline){
							mobiscroll.toast({message:gap.lang.close_vote, color:'info'});
							return false;
						}
						if (vote_done){
							// 이미 투표를 한 경우
						//	mobiscroll.toast({message:gap.lang.aleady_vote, color:'danger'});
						//	return false;
						}
						
						var id_list = [];
						$layer.find('.input_box.rel.on').each(function(idx, el){
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
									gBody3.response_vote(_vote);
									
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
					
					// 다운로드 버튼 클릭
					$layer.find('.download').off().on('click', function(){
						var downloadurl = gap.channelserver + "/FDownload_vote_response.do?key=" + _key;
						
						var link = document.createElement("a");
						$(link).click(function(e) {
							e.preventDefault();
							window.location.href = downloadurl;
						});
						$(link).click();
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
	
	"show_voter_list" : function($el, _voter){
		var surl = gap.channelserver + "/search_user_empno.km";
		var postData = {
				"empno" : _voter.join(",")
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
				var html = ''
				var list = res[0];
				
				html += '<div class="vote_pop">';
				for (var i = 0; i < list.length; i++){
					var info = gap.user_check(list[i]);
					html += '<div class="vote_select">';
					html += info.user_img;
					html += '<span class="vote_name">' + info.disp_user_info + '</span>';
					html += '</div>';
				}
				html += '</div>';	
				$el.qtip({
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
						fixed : true
					},
					style : {
						classes : 'qtip-bootstrap',
						tip : false
					},
					position: {
				         viewport: $('#main_body')
//					position : {
//						my : 'top left',
//						at : 'bottom top',
//						adjust: {
//						  x: 10,
//						  y: 5
//						}
					},
					events : {
						show : function(event, api){	
							
						},
						hidden : function(event, api){
							api.destroy(true);
						}
					}
				});	
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},
	
	"show_aprv_list" : function(){
		gBody3.show_layer_type = "aprv";
		gBody3.aprv_select_html = "";
		gBody3.aprv_select_db = "work/2002.nsf";		

		var html =
			'<div id="aprv_list_layer" class="mu_container layer_wrap center new_work_pop new_post_pop">' + 
			'	<div class="layer_inner" style="height:710px;">' + 
			'		<div class="pop_btn_close"></div>' + 
			'		<h4>' + gap.lang.add_aprvdoc + '</h4>' + 
			'		<div class="layer_cont left">' + 
			'			<div class="cont_wr rel">' + 
			'				<div class="t_sec">' +
			'					<div class="cal">' +
		//	'						<div class="input-field selectbox t_sec_sel">' +
		//	'							<select id="aprv_profile"></select>' +
		//	'						</div>' +
			'					</div>' +
			'					<div class="se_right">' +
			'						<div class="input-field selectbox t_sec_sel">' +
			'							<select id="search_field">' +
			'								<option value="ALL">' + gap.lang.All + '</option>' +
			'								<option value="Username">' + gap.lang.aprv_from + '</option>' +
		//	'								<option value="authorinfo">' + gap.lang.aprv_req_dept + '</option>' +
			'								<option value="FormTitle">' + gap.lang.form_name + '</option>' +
			'								<option value="startDate">' + gap.lang.aprv_req_date + '</option>' +
		//	'								<option value="completeDate">' + gap.lang.aprv_completed_date + '</option>' +
			'								<option value="title">' + gap.lang.basic_title + '</option>' +
			'							</select>' +
			'						</div>' +
			'						<div class="f_between">' +
			'							<input type="text" name="" id="aprv_search_txt" class="input" placeholder="' + gap.lang.input_search_query + '" autocomplete="off">' +
			'							<div class="btn-search-close" style="display:none;"></div>' +
			'							<button id="aprv_search_btn" class="type_icon"></button>' +
			'						</div>' +	
			'					</div>' +
			'				</div>' +
			'				<div id="wrap_aprv_list">' +	
			'				<table class="table_type_b" style="width: 860px;">' + 
			'					<thead>' + 
			'						<tr>' + 
			'							<th style="width: 8%;" class="h0"></th>' + 
			'							<th style="width: 15%;">' + gap.lang.form_name + '</th>' + 
			'							<th style="width: auto;">' + gap.lang.basic_title + '</th>' + 
			'							<th style="width: 25%;">' + gap.lang.aprv_from + '</th>' + 
			'							<th style="width: 20%; padding-right: 1.5%">' + gap.lang.aprv_date + '</th>' + 
			'						</tr>' + 
			'					</thead>' +
			'					<tbody id="aprv_list">' + 
			'					</tbody>' +
			'				</table>' + 
			'				</div>' +
			'				<div class="pagination_wr" id="paging_area">' +
			'				</div>' + 
			'			</div>' + 
			'		</div>' + 
			'		<div class="btn_wr">' + 
			'			<button class="btn_layer confirm">' + gap.lang.add_selected + '</button>' + 
			'		</div>' + 
			'	</div>' + 
			'</div>';

		$("#channel_main").hide();		
		gap.showBlock();		
		$(html).appendTo('body');
		var $layer = $('#aprv_list_layer');
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');

		// 문서 목록 갯수 가져오기(그리기)
		gBody3.get_aprvdoc_count();
			
		// 셀렉트 박스 그리기
		$('#search_field').material_select();
	
		// 닫기
		$layer.find('.pop_btn_close').off().on('click', function(){
			$layer.remove();
			gap.hideBlock();
			gBody3.hideBodyBlock();
			return false;
		});
		
		$layer.find('.date-wrap .icon').on('click', function(){
			$(this).parent().find('input').click();
			return false;
		});
		
		// 검색
		$('#aprv_search_txt').keydown(function(evt){
			if (evt.keyCode == 13){
				if ($('#aprv_search_txt').val().trim() == ""){
					mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
					return;
				}
				gBody3.draw_aprv_domino_search_list();
			}			
		})
		
		$('#aprv_search_btn').off().on('click', function(){
			if ($('#aprv_search_txt').val().trim() == ""){
				mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
				return;
			}
			gBody3.draw_aprv_domino_search_list();
		});
		
		// 검색 초기화
		$layer.find(".btn-search-close").on("click", function(){
			$layer.find("#aprv_search_txt").val("");
			$layer.find(".btn-search-close").hide();
			$layer.find('#aprv_list').empty();
			$layer.find('#wrap_aprv_list').removeClass('wrap-aprv-list');
			
			gBody3.draw_aprv_domino_list(1);
		});
	},
	
	"get_aprvdoc_count" : function(){
		var $layer = $('#aprv_list_layer');
		
		var surl = location.protocol + "//" + window.mailserver + "/" + gBody3.aprv_select_db + "/agGetAllDocCount?open&cn=" + gap.userinfo.rinfo.ky + "&vn=vwAprvList_Complete_EmpNo";
		$.ajax({
			type : "POST",
			url : surl,
			xhrFields : {
				withCredentials : true
			},			
			dataType : "text",	//"json",
			success : function(res){
				gBody3.total_data_count = parseInt(res);

				if (gBody3.total_data_count == "0"){
					var _html =
						'<tr>' +
						'	<td colspan="5" style="text-align:center;">' + gap.lang.list_no_document + '</td>' +
						'</tr>'
						
					$layer.find('#aprv_list').html(_html);
					
				}else{
					gBody3.draw_aprv_domino_list(1);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},
	
	"draw_aprv_domino_list" : function(page_no){
		if (page_no == 1){
			gBody3.start_page = "1";
			gBody3.cur_page = "1";
		}
		
		gBody3.start_skp = (parseInt(gBody3.per_page) * (parseInt(page_no))) - (parseInt(gBody3.per_page) - 1);
		var surl = location.protocol + "//" + window.mailserver + "/" + gBody3.aprv_select_db + "/api/data/collections/name/vwAprvList_Complete_EmpNo?restapi&category=" + gap.userinfo.rinfo.ky + "&start=" + (gBody3.start_skp - 1) + "&ps=" + gBody3.per_page + "&entrycount=false";

		$.ajax({
			type : "GET",
			url : surl,
			xhrFields : {
				withCredentials : true
			},				
			dataType : "json",
			success : function(res){
				var $layer = $('#aprv_list_layer');
				var data = res;				
				$layer.find('#aprv_list').empty();				
				$(data).each(function(idx, val){
					var html = '';					
					var unid = val['@unid'];
					var copy = gBody3.aprv_select_db + "-spl-" + unid;
					var href = val['@link']['href'];
			//		var link = href.replace('api/data/documents/unid', '0') + '?opendocument&EEDS=Y';
					var link = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + href.replace('api/data/documents/unid', '0') + '?opendocument';
					var copy = gBody3.aprv_select_db + "-spl-" + unid;
					var formname = val.formname;
					var title = val.title;
					var pubdate = val.pubdate;
			//		var completedate = val.completeDate;
					var createddate = val.createdDate;
					var author = val.author;
					var authorinfo = val.writerinfo;
					var aprv_data = {
							"unid" : unid,
							"title" : title,
							"author" : author,
							"pubdate" : pubdate,
							"link" : link,
							"copy" : copy
					}					
					html += '<tr>';
					html += '	<td>';
					html += '		<span class="chk_box">';
					html += '			<input type="checkbox" name="aprv_checkbox" id="' + unid + '">';
					html += '			<label for="' + unid + '"></label>';
					html += '		</span>';
					html += '	</td>';
					html += '	<td class="bold ta_l t_overflow td_subject" title="' + formname + '">' + formname + '</td>';					
					html += '	<td class="bold ta_l t_overflow td_subject" id="title_' + unid + '" title="' + title + '">' + title + '</td>';
					html += '	<td class="bold ta_l t_overflow td_subject" style="text-align:center;">' + authorinfo + '</td>';
					html += '	<td class="en g_txt_2 normal">' + moment.utc(createddate).local().format('YYYY.MM.DD HH:mm') + '</td>';
					html += '</tr>';					
					$layer.find('#aprv_list').append(html);					
					$('#' + unid).data('info', aprv_data);
					$('#' + unid).data('link', link);
				});
				
				// 페이징
				gBody3.total_page_count = gBody3.get_page_count(gBody3.total_data_count, gBody3.per_page);
				gBody3.initialize_page();
				
				// 제목 클릭
				$layer.find('.td_subject').off().on('click', function(){
					var _id = $(this).attr('id').replace('title_', '');
					var _link = $layer.find('#' + _id).data('link');
					var _url = _link;	//'/approval' + _link.replace('api/data/documents/unid', '0') + '?opendocument';
					gap.open_subwin(_url, "1200","900", "yes" , "", "yes");
				});
				
				// 선택첨부 클릭
				$layer.find('.confirm').off().on('click', function(){
					var data_check = [];
					$layer.find('input[name=aprv_checkbox]:checked').each(function() {
						var _id = $(this).attr("id").replace('check_', '');
						data_check.push($('#' + _id).data('info'));
					});
					if (data_check.length == 0){
						gap.gAlert(gap.lang.select_doc);
						return false;
						
					}else{
						var ids = []
						$(data_check).each(function(idx, val){
							ids.push(val.copy);
						});
						
						_form_data = {
								'__Click': '0',
								'%%PostCharset': 'UTF-8',
								'SaveOptions': '0',
								'Data' : ids.join(';')
							};
						
						var url = location.protocol + "//" + window.mailserver + "/" + gBody3.aprv_select_db + "/RequestForm?openform";
						$.ajax({
							type : "POST",
							url : url,
							xhrFields : {
								withCredentials : true
							},							
							data : _form_data,
							dataType : "json",
							success : function(res){
								var data = res.data;
								$(data).each(function(idx, val){
									var selected_data = val;
									selected_data.type = "aprv";
									
									// 채널로 전송
									var data = JSON.stringify({
										"type" : "msg",
										"channel_code" : gBody3.select_channel_code,
										"channel_name" : gBody3.select_channel_name,
										"email" : gap.userinfo.rinfo.em,
										"ky" : gap.userinfo.rinfo.ky,
										"owner" : gap.userinfo.rinfo,
										"content" : "",
										"edit" : gBody3.edit_editor,
										"msg_edit" : "",
										"id" : gBody3.select_channel_id,
										"ex" : selected_data
									});

									gBody3.send_msg_to_server(data);
								});
								
								$layer.find('.pop_btn_close').click();
							},
							error : function(e){
							}
						});
					}
				});				
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},
	
	"draw_aprv_domino_search_list" : function(){
		var surl = location.protocol + "//" + window.mailserver + "/" + gBody3.aprv_select_db + "/agAprvSearchDoc?openagent" +
			"&dbpath=" + gBody3.aprv_select_db +
			"&s_field=" + $('#search_field').val() +
			"&s_query=" + encodeURIComponent($('#aprv_search_txt').val())
			
		$.ajax({
			type : "GET",
			url : surl,
			xhrFields : {
				withCredentials : true
			},				
			dataType : "json",
			success : function(res){
				if (typeof(res['@toplevelentries']) == "undefined"){
					gBody3.total_data_count = 0;
					
				}else{
					gBody3.total_data_count = parseInt(res['@toplevelentries']);
				}
				
				var $layer = $('#aprv_list_layer');
				var data = res.viewentry;
				
				$layer.find('#aprv_list').empty();
				$('#paging_area').empty();
				
				if (gBody3.total_data_count == "0"){
					var _html =
						'<tr>' +
						'	<td colspan="5" style="text-align:center;">' + gap.lang.list_no_document + '</td>' +
						'</tr>'						
					$layer.find('#aprv_list').html(_html);					
				}else{
					$(data).each(function(idx, val){
						var html = '';						
						var unid = val['@unid'];
						var entrydata = $.map(val.entrydata, function(ret, key) {
							return ret.text[0];
						});
					//	var link = "/" + gBody3.aprv_select_db + "/0/" + unid + "?opendocument&EEDS=Y";
						var link = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + gBody3.aprv_select_db + "/0/" + unid + "?opendocument";
						var copy = gBody3.aprv_select_db + "-spl-" + unid;
						var formname = entrydata[0];
						var title = entrydata[2];
						var pubdate = entrydata[4];
						var completedate = entrydata[5];
						var author = entrydata[3].split("/")[0].replace("CN=", "");
						var aprv_data = {
								"unid" : unid,
								"title" : title,
								"author" : author,
								"pubdate" : pubdate,
								"link" : link,
								"copy" : copy
						}						
						html += '<tr>';
						html += '	<td>';
						html += '		<span class="chk_box">';
						html += '			<input type="checkbox" name="aprv_checkbox" id="' + unid + '">';
						html += '			<label for="' + unid + '"></label>';
						html += '		</span>';
						html += '	</td>';
						html += '	<td class="bold ta_l t_overflow td_subject" title="' + formname + '">' + formname + '</td>';					
						html += '	<td class="bold ta_l t_overflow td_subject" id="title_' + unid + '" title="' + title + '">' + title + '</td>';
						html += '	<td class="bold ta_l t_overflow td_subject" style="text-align:center;">' + author + '</td>';
						html += '	<td class="en g_txt_2 normal">' + completedate + '</td>';					
						html += '</tr>';						
						$layer.find('#aprv_list').append(html);
						
						$('#' + unid).data('info', aprv_data);
						$('#' + unid).data('link', link);
					});
				}
				
				$layer.find('#wrap_aprv_list').addClass('wrap-aprv-list');
				
				if ($('#aprv_search_txt').val() != ""){
					$('#aprv_list_layer').find(".btn-search-close").show();	
				}
				
				// 제목 클릭
				$layer.find('.td_subject').off().on('click', function(){
					var _id = $(this).attr('id').replace('title_', '');
					var _link = $layer.find('#' + _id).data('link');
					var _url = _link;	//'/approval' + _link.replace('api/data/documents/unid', '0') + '?opendocument';
					gap.open_subwin(_url, "1200","900", "yes" , "", "yes");
				});
				
				// 선택첨부 클릭
				$layer.find('.confirm').off().on('click', function(){
					var data_check = [];
					$layer.find('input[name=aprv_checkbox]:checked').each(function() {
						var _id = $(this).attr("id").replace('check_', '');
						data_check.push($('#' + _id).data('info'));
					});
					if (data_check.length == 0){
						gap.gAlert(gap.lang.select_doc);
						return false;						
					}else{
						var ids = []
						$(data_check).each(function(idx, val){
							ids.push(val.copy);
						});						
						_form_data = {
								'__Click': '0',
								'%%PostCharset': 'UTF-8',
								'SaveOptions': '0',
								'Data' : ids.join(';')
							};						
						var url = "/emate_app/dsw_appradddoc.nsf/RequestForm?openform";
						$.ajax({
							type : "POST",
							url : url,
							data : _form_data,
							dataType : "json",
							success : function(res){
								var data = res.data;
								$(data).each(function(idx, val){
									var selected_data = val;
									selected_data.type = "aprv";									
									// 채널로 전송
									var data = JSON.stringify({
										"type" : "msg",
										"channel_code" : gBody3.select_channel_code,
										"channel_name" : gBody3.select_channel_name,
										"email" : gap.userinfo.rinfo.em,
										"ky" : gap.userinfo.rinfo.ky,
										"owner" : gap.userinfo.rinfo,
										"content" : "",
										"edit" : gBody3.edit_editor,
										"msg_edit" : "",
										"id" : gBody3.select_channel_id,
										"ex" : selected_data
									});
									gBody3.send_msg_to_server(data);
								});								
								$layer.find('.pop_btn_close').click();
							},
							error : function(e){
							}
						});
					}
				});				
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},
	
	"draw_aprv_list" : function(page_no){
		if (page_no == 1){
			gBody3.start_page = "1";
			gBody3.cur_page = "1";
		}
		
		var s_date = moment($('#ws_s_date').val()).format('YYYYMMDD[T000000]');
		var e_date = moment($('#ws_e_date').val()).format('YYYYMMDD[T235959]');

		s_date = moment(s_date).utc().format('YYYYMMDDTHHmmss');
		e_date = moment(e_date).utc().format('YYYYMMDDTHHmmss');
		
		gBody3.start_skp = (parseInt(gBody3.per_page) * (parseInt(page_no))) - (parseInt(gBody3.per_page) - 1);
		var surl = '/emate_app/appro_sv.nsf/ReadViewEntries4Elastic?openagent' +
				'&name=view053_sv' + 
				'&application=' + (gap.isDev ? 'approcompletedev' : 'approcomplete') + 
				'&db=emate_app/appro_sv.nsf' + 
				'&outputformat=json' + 
				'&range={"field":"startdate","from":"' + s_date + '","to":"' + e_date + '"}' +
				'&start=' + gBody3.start_skp + 
				'&count=' + gBody3.per_page +
				'&charset=utf-8' + 
				'&tmptime=' + new Date()
		if ($('#aprv_search_txt').val() != ""){
			surl += '&query=[{"' + $('#search_field').val() + '":"' + $('#aprv_search_txt').val() + '"}]'
		}
		
		$.ajax({
			type : "GET",
			url : surl,
			dataType : "json",
			success : function(res){
				if (typeof(res['@toplevelentries']) == "undefined"){
					gBody3.total_data_count = 0;
					
				}else{
					gBody3.total_data_count = parseInt(res['@toplevelentries']);
				}				
				var $layer = $('#aprv_list_layer');
				var data = res.viewentry;				
				$layer.find('#aprv_list').empty();				
				if (gBody3.total_data_count == "0"){
					var _html =
						'<tr>' +
						'	<td colspan="5" style="text-align:center;">' + gap.lang.list_no_document + '</td>' +
						'</tr>'						
					$layer.find('#aprv_list').html(_html);					
				}else{
					$(data).each(function(idx, val){
						var html = '';						
						var unid = val['@unid'];
						var entrydata = $.map(val.entrydata, function(ret, key) {
							return ret.text[0];
						});
						var tmp_link = entrydata[0].split("&SAPP=")[0];
						var link = "/" + tmp_link.split("&SDB=")[1] + "/0/" + unid + "?opendocument&EEDS=Y";
						var copy = tmp_link.split("&SDB=")[1] + "-spl-" + unid;
						var formname = entrydata[1];
						var title = $(entrydata[3]).text();
						var pubdate = $(entrydata[7]).text();
						var completedate = $(entrydata[8]).text();
						var author = $(entrydata[6]).text();
						var aprv_data = {
								"unid" : unid,
								"title" : title,
								"author" : author,
								"pubdate" : pubdate,
								"link" : link,
								"copy" : copy
						}						
						html += '<tr>';
						html += '	<td>';
						html += '		<span class="chk_box">';
						html += '			<input type="checkbox" name="aprv_checkbox" id="' + unid + '">';
						html += '			<label for="' + unid + '"></label>';
						html += '		</span>';
						html += '	</td>';
						html += '	<td class="bold ta_l t_overflow td_subject" title="' + formname + '">' + formname + '</td>';					
						html += '	<td class="bold ta_l t_overflow td_subject" id="title_' + unid + '" title="' + title + '">' + title + '</td>';
						html += '	<td class="bold ta_l t_overflow td_subject" style="text-align:center">' + author + '</td>';
						html += '	<td class="en g_txt_2 normal">' + completedate + '</td>';					
						html += '</tr>';						
						$layer.find('#aprv_list').append(html);						
						$('#' + unid).data('info', aprv_data);
						$('#' + unid).data('link', link);
					});
				}				
				if ($('#aprv_search_txt').val() != ""){
					$('#aprv_list_layer').find(".btn-search-close").show();	
				}				
				// 페이징
				gBody3.total_page_count = gBody3.get_page_count(gBody3.total_data_count, gBody3.per_page);
				gBody3.initialize_page();
				
				// 제목 클릭
				$layer.find('.td_subject').off().on('click', function(){
					var _id = $(this).attr('id').replace('title_', '');
					var _link = $layer.find('#' + _id).data('link');
					var _url = _link;	//'/approval' + _link.replace('api/data/documents/unid', '0') + '?opendocument';
					gap.open_subwin(_url, "1200","900", "yes" , "", "yes");
				});
				
				// 선택첨부 클릭
				$layer.find('.confirm').off().on('click', function(){
					var data_check = [];
					$layer.find('input[name=aprv_checkbox]:checked').each(function() {
						var _id = $(this).attr("id").replace('check_', '');
						data_check.push($('#' + _id).data('info'));
					});
					if (data_check.length == 0){
						gap.gAlert(gap.lang.select_doc);
						return false;
						
					}else{
						var ids = []
						$(data_check).each(function(idx, val){
							ids.push(val.copy);
						});						
						_form_data = {
								'__Click': '0',
								'%%PostCharset': 'UTF-8',
								'SaveOptions': '0',
								'Data' : ids.join(';')
							};						
						var url = "/emate_app/dsw_appradddoc.nsf/RequestForm?openform";
						$.ajax({
							type : "POST",
							url : url,
							data : _form_data,
							dataType : "json",
							success : function(res){
								var data = res.data;
								$(data).each(function(idx, val){
									var selected_data = val;
									selected_data.type = "aprv";									
									// 채널로 전송
									var data = JSON.stringify({
										"type" : "msg",
										"channel_code" : gBody3.select_channel_code,
										"channel_name" : gBody3.select_channel_name,
										"email" : gap.userinfo.rinfo.em,
										"ky" : gap.userinfo.rinfo.ky,
										"owner" : gap.userinfo.rinfo,
										"content" : "",
										"edit" : gBody3.edit_editor,
										"msg_edit" : "",
										"id" : gBody3.select_channel_id,
										"ex" : selected_data
									});
									gBody3.send_msg_to_server(data);
								});
								
								$layer.find('.pop_btn_close').click();
							},
							error : function(e){
							}
						});
					}
				});				
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},
	
	"show_bbs_list" : function(){
		gBody3.show_layer_type = "bbs";
		gBody3.bbs_select_html = "";
		gBody3.bbs_select_db = "board/common.nsf";		
/*		var url = "getAprvBbsProfile?openagent&code=" + window.companycode + "&view=sysview_dsw2";
		$.ajax({
			type : "POST",
			url : url,
			async : false,
			dataType : "json",
			success : function(res){
				gBody3.bbs_list_info = res;
				var select_html = '';
				var category_all = $.map(res, function(ret, key) {
					return ret.title;
				});
				var category = category_all.filter(function(item, i, category_all) {
					return i == category_all.indexOf(item);
				});
				$(category).each(function(idx, val){
					select_html += '<option value="' + idx + '"' + (idx == 0 ? ' selected' : '') + '>' + val + '</option>';
				});
				gBody3.bbs_select_html += select_html;
			},
			error : function(){				
			}
		});	*/	
		var html =
			'<div id="bbs_list_layer" class="mu_container layer_wrap center new_work_pop new_post_pop">' + 
			'	<div class="layer_inner" style="height:680px;">' + 
			'		<div class="pop_btn_close"></div>' + 
			'		<h4>' + gap.lang.add_notice + '</h4>' +
			'		<div class="layer_cont left">' + 
			'			<div class="cont_wr rel">' + 
			'				<div class="t_sec">' +
			'					<div class="cal">' +
	//		'						<div class="input-field selectbox t_sec_sel">' +
	//		'							<select id="bbs_profile"></select>' +
	//		'						</div>' +
	//		'						<div class="input-field selectbox t_sec_sel">' +
	//		'							<select id="bbs_profile_sub"></select>' +
	//		'						</div>' +
			'					</div>' +
			'				</div>' +
			'				<table class="table_type_b" style="width: 860px">' + 
			'					<thead>' + 
			'						<tr>' + 
			'							<th style="width: 8%;" class="h0"></th>' + 
			'							<th style="width: auto;">' + gap.lang.basic_title + '</th>' + 
			'							<th style="width: 25%;">' + gap.lang.maker + '</th>' + 
			'							<th style="width: 20%;">' + gap.lang.created + '</th>' + 
			'						</tr>' + 
			'					</thead>' + 
			'					<tbody id="bbs_list">' + 
			'					</tbody>' + 
			'				</table>' + 
			'				<div class="pagination_wr" id="paging_area">' +
			'				</div>' + 
			'			</div>' + 
			'		</div>' + 
			'		<div class="btn_wr">' + 
			'			<button class="btn_layer confirm">' + gap.lang.add_selected + '</button>' + 
			'		</div>' + 
			'	</div>' + 
			'</div>';
		
		$("#channel_main").hide();		
		gap.showBlock();		
		$(html).appendTo('body');
		var $layer = $('#bbs_list_layer');
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');		
/*		// 셀렉트 박스 그리기
		$('#bbs_profile').html(gBody3.bbs_select_html);
		$('#bbs_profile').material_select();
		
		// 셀렉트 박스 change 이벤트
		$("#bbs_profile").off();
		$("#bbs_profile").change(function(e){
			var select_txt = $("#bbs_profile option:selected").text();
			var select_html = '';			
			var _bbs = gBody3.bbs_list_info.filter(function(obj) {
				return (obj.title === select_txt);
			});			
			$(_bbs).each(function(idx, val){
				if (idx == 0){
					gBody3.bbs_select_db = val.dbpath;
				}
				select_html += '<option value="' + val.dbpath + '"' + (idx == 0 ? ' selected' : '') + '>' + val.title_sub + '</option>';
			});
			$('#bbs_profile_sub').html(select_html);
			$('#bbs_profile_sub').material_select();			
			gBody3.get_bbsdoc_count();
		});
		var select_txt = $("#bbs_profile option:selected").text();
		var select_sub_html = '';		
		var _bbs = gBody3.bbs_list_info.filter(function(obj) {
			return (obj.title === select_txt);
		});		
		$(_bbs).each(function(idx, val){
			if (idx == 0){
				gBody3.bbs_select_db = val.dbpath;
			}
			select_sub_html += '<option value="' + val.dbpath + '">' + val.title_sub + '</option>';
		});		
		$('#bbs_profile_sub').html(select_sub_html);
		$('#bbs_profile_sub').material_select();	*/
		
		
		// 문서 목록 갯수 가져오기(그리기)
		gBody3.get_bbsdoc_count();	
			
/*		// 셀렉트 박스 change 이벤트
		$("#bbs_profile_sub").off();
		$("#bbs_profile_sub").change(function(e){
			gBody3.bbs_select_db = $("#bbs_profile_sub option:selected").val();
			gBody3.get_bbsdoc_count();
		});	*/	
		
		// 닫기
		$layer.find('.pop_btn_close').off().on('click', function(){
			$layer.remove();
			gap.hideBlock();
			gBody3.hideBodyBlock();
			return false;
		});
	},
	
	"get_bbsdoc_count" : function(){
		var $layer = $('#aprv_list_layer');		
		var surl = location.protocol + "//" + window.mailserver + "/" + gBody3.bbs_select_db + "/agGetAllDocCount?open&vn=vwAllDocsBox";
		$.ajax({
			type : "POST",
			url : surl,
			xhrFields : {
				withCredentials : true
			},
			dataType : "text",	//"json",
			success : function(res){
				gBody3.total_data_count = parseInt(res);

				if (gBody3.total_data_count == "0"){
					var _html =
						'<tr>' +
						'	<td colspan="5" style="text-align:center;">' + gap.lang.list_no_document + '</td>' +
						'</tr>'						
					$layer.find('#aprv_list').html(_html);					
				}else{
					gBody3.draw_bbs_list(1);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},
	
	"draw_bbs_list" : function(page_no){
		if (page_no == 1){
			gBody3.start_page = "1";
			gBody3.cur_page = "1";
		}		
		// dsw_view01 신규 생성
		gBody3.start_skp = (parseInt(gBody3.per_page) * (parseInt(page_no))) - (parseInt(gBody3.per_page) - 1);
		var surl = location.protocol + "//" + window.mailserver + "/" + gBody3.bbs_select_db + "/api/data/collections/name/vwAllDocsBox?restapi&start=" + (gBody3.start_skp - 1) + "&ps=" + gBody3.per_page + "&entrycount=false";
		$.ajax({
			type : "GET",
			url : surl,
			xhrFields : {
				withCredentials : true
			},
			dataType : "text",	//"json",
			success : function(res){
				var $layer = $('#bbs_list_layer');
				var data = JSON.parse(res);				
				$layer.find('#bbs_list').empty();				
				$(data).each(function(idx, val){
					var html = '';
					var unid = val['@unid'];
					var href = val['@link']['href'];
				//	var link = "/app1" + href.replace('api/data/documents/unid', '0') + '?opendocument';
					var link = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + href.replace('api/data/documents/unid', '0') + '?opendocument';
					var title = val.title;
					var pubdate = val.pubdate;
					var author = val.author;
					var authorinfo = val.writerinfo;
					var bbs_data = {
							"title" : title,
							"author" : author,
							"pubdate" : pubdate,
							"link" : link
					}					
					html += '<tr id="' + unid + '">';
					html += '	<td>';
					html += '		<span class="chk_box">';
					html += '			<input type="checkbox" name="bbs_checkbox" id="check_' + unid + '">';
					html += '			<label for="check_' + unid + '"></label>';
					html += '		</span>';
					html += '	</td>';
					html += '	<td class="bold ta_l t_overflow td_subject" id="title_' + unid + '" style="text-align:left" title="' + title + '">' + title + '</td>';
					html += '	<td class="bold ta_l t_overflow td_subject" style="text-align:center" title="' + authorinfo + '">' + authorinfo + '</td>';
					html += '	<td class="en g_txt_2 normal">' + moment.utc(pubdate).local().format('YYYY.MM.DD HH:mm') + '</td>';
					html += '</tr>';					
					$layer.find('#bbs_list').append(html);					
					$('#' + unid).data('info', bbs_data);
					$('#' + unid).data('link', link);
				});
				
				// 페이징
				gBody3.total_page_count = gBody3.get_page_count(gBody3.total_data_count, gBody3.per_page);
				gBody3.initialize_page();
				
				// 제목 클릭
				$layer.find('.td_subject').off().on('click', function(){
					var _id = $(this).attr('id').replace('title_', '');
					var _link = $layer.find('#' + _id).data('link');
					var _url = _link;	//'/bbs' + _link.replace('api/data/documents/unid', '0') + '?opendocument';
					gap.open_subwin(_url, "1200","900", "yes" , "", "yes");
				});
				
				// 선택첨부 클릭
				$layer.find('.confirm').off().on('click', function(){
					var data_check = [];
					$layer.find('input[name=bbs_checkbox]:checked').each(function() {
						var _id = $(this).attr("id").replace('check_', '');
						data_check.push($('#' + _id).data('info'));
					});
					if (data_check.length == 0){
						gap.gAlert(gap.lang.select_doc);
						return false;
						
					}else{
						$(data_check).each(function(idx, val){
							var selected_data = val;
							selected_data.type = "bbs";
							
							// 채널로 전송
							var data = JSON.stringify({
								"type" : "msg",
								"channel_code" : gBody3.select_channel_code,
								"channel_name" : gBody3.select_channel_name,
								"email" : gap.userinfo.rinfo.em,
								"ky" : gap.userinfo.rinfo.ky,
								"owner" : gap.userinfo.rinfo,
								"content" : "",
								"edit" : gBody3.edit_editor,
								"msg_edit" : "",
								"id" : gBody3.select_channel_id,
								"ex" : selected_data
							});

							gBody3.send_msg_to_server(data);
						});

						 $layer.find('.pop_btn_close').click();
					}
				});
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},	
	
	"get_page_count" : function(doc_count, rows){
		return ret_page_count = Math.floor(doc_count / rows) + (((doc_count % rows) > 0) ? 1 : 0);
	},
		
	"initialize_page" : function(){
		var alldocuments = gBody3.total_data_count;
		if (alldocuments % gBody3.per_page > 0 & alldocuments % gBody3.per_page < gBody3.per_page/2 ){
			gBody3.all_page = Number(Math.round(alldocuments/gBody3.per_page)) + 1
		}else{
			gBody3.all_page = Number(Math.round(alldocuments/gBody3.per_page))
		}	
		if (gBody3.start_page % gBody3.per_page > 0 & gBody3.start_page % gBody3.per_page < gBody3.per_page/2 ){
			gBody3.cur_page = Number(Math.round(gBody3.start_page/gBody3.per_page)) + 1
		}else{
			gBody3.cur_page = Number(Math.round(gBody3.start_page/gBody3.per_page));
		}
		gBody3.initialize_navigator();		
	},
	
	"initialize_navigator" : function(){
		var alldocuments = gBody3.total_data_count;

		if (gBody3.total_page_count == 0){
			gBody3.total_page_count = 1;
		}

		if (alldocuments == 0){
			alldocuments = 1;
			gBody3.total_page_count = 1;
			gBody3.cur_page = 1;
		}

		if (alldocuments != 0) {
			if (gBody3.total_page_count % 10 > 0 & gBody3.total_page_count % 10 < 5 ){
				var all_frame = Number(Math.round(gBody3.total_page_count / 10)) + 1
			}else{
				var all_frame = Number(Math.round(gBody3.total_page_count / 10))	
			}
			if (gBody3.cur_page % 10 > 0 & gBody3.cur_page % 10 < 5 ){
				var c_frame = Number(Math.round(gBody3.cur_page / 10)) + 1
			}else{
				var c_frame = Number(Math.round(gBody3.cur_page / 10))
			}
			var nav = new Array();
			if (c_frame == 1){
				nav[0] = '<ul class="pagination inb">';
			}else{
				nav[0] = '<div class="arrow prev" onclick="gBody3.goto_page(' + ((((c_frame - 1) * 10) - 1) * gBody3.per_page + 1) + ',' + ((c_frame - 1) * 10) + ');"></div><ul class="pagination inb">';
			}			
			var pIndex = 1;
			var start_page = ((c_frame-1) * 10) + 1;

			for (var i = start_page; i < start_page + 10; i++){
				if (i == gBody3.cur_page){
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
						nav[pIndex] = '<li onclick="gBody3.goto_page(' + (((i - 1) * gBody3.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
					}else{
						if (i % 10 == '1' ){
							nav[pIndex] = '<li onclick="gBody3.goto_page(' + (((i - 1) * gBody3.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}else{
							nav[pIndex] = '<li onclick="gBody3.goto_page(' + (((i - 1) * gBody3.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}
					}
				}				

				if (i == gBody3.total_page_count) {
					break;
				}
				pIndex++;				
			}

			if (c_frame < all_frame){
				nav[nav.length] = '</ul><div class="arrow next" onclick="gBody3.goto_page(' + ((c_frame * gBody3.per_page * 10) + 1) + ',' + ((c_frame * 10) + 1) + ');"></div>';
			}
			var nav_html = '';

			if (c_frame != 1 ){
			//	nav_html = '<li class="p-first" onclick="gBody3.goto_page(1,1);"><span>처음</span></li>';
			}		    
			for( var i = 0 ; i < nav.length ; i++){	
				nav_html += nav[i];
			}
						
			nav_html += "</TD>"; 

			if (c_frame < all_frame){
			//	nav_html += '<li class="p-last" onclick="gBody3.goto_page(' + ((gBody3.all_page - 1) * gBody3.per_page + 1) + ',' + gBody3.all_page + ')"><span>마지막</span></li>';
			}
			$("#paging_area").html(nav_html);
		}		
	},
		
	"goto_page" : function(idx, page_num){
		if (gBody3.total_data_count < idx) {
			gBody3.start_page = idx - 10;
			if ( gBody3.start_page < 1 ) {
				return;
			}
		}else{
			gBody3.start_page = idx;
		}
		cur_page = page_num;
		if (gBody3.show_layer_type == "aprv"){
			if (window.companycode != "10"){
				gBody3.draw_aprv_domino_list(page_num);
				
			}else{
				gBody3.draw_aprv_list(page_num);
			}
			
		}else if (gBody3.show_layer_type = "bbs"){
			gBody3.draw_bbs_list(page_num);
		}
	},	
	 
	"showBodyBlock" : function(el){
		$('#layerDimDark').remove();
		var html = '<div id="layerDimDark"></div>';
		var $block = $(html);
		$(el).prepend($block);
	},
		
	"hideBodyBlock" : function(){
		$('#layerDimDark').remove();
	},
		
	"setBodyLayer" : function(el, html){
		gBody3.showBodyBlock(el);			
		var $target = $(el);
		var $layer = $(html);
		$target.prepend($layer);
	},

	
	"enter_meeting" : function(opt){		
		var channel_code = gBody3.select_channel_code2;
		var channel_name = gBody3.select_channel_name2;		
		var opt = opt; //type (String) : 1:화상, 2:대면, 3:비대면회의 
		var cur_room_key = gBody3.cur_opt;
		var lists =  gap.cur_room_members_key(cur_room_key);
		var members = lists.split("-");
		gMet.reserveMeeting(opt, members, channel_code, channel_name, function(){
		 // 상세프로필 레이어 닫아주기
		 //$layer.find('.btn-close').click();
		}); 
		
	},	
	
	"show_search_content" : function(obj){
			var obj = $(obj).parent().parent();
			var item_type = obj.attr("itemty");			
			if (item_type == "msg" || item_type == "reply"){
				var id = (item_type == "msg" ? obj.attr("id") : obj.attr("cdataid"));
				var surl = gap.channelserver + "/file_info_all.km";
				var postData = JSON.stringify({
						"id" : id
					});			
				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : postData,
					success : function(res){
						if (res.result == "OK"){							
							var info = res.data
							var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(info.GMT));
							var disp_time = gap.change_date_localTime_only_time(String(info.GMT));
							var docid = "";		
							var like_count = 0;
							// 메일은 바로 레이어를 오픈
							if (info.ex != undefined && info.ex.type == "mail"){
								var tunid = info.ex.target_unid;
								var tdb = info.ex.target_db;
								var tserver = info.ex.target_server;								
								gBody4.openMail(tunid, 'body', tdb, tserver);
								return false;
							}							
							if ($("#ext_body_search").attr("class") == "right-area view-info"){
								$("#ext_body_search").removeClass("view-info");
								$("#ext_body_search").addClass("channel view-info chat-area");
							}
							$("#ext_body_search").css("padding-right", "10px");							
							if (info.direct == "T"){
								docid = item._id;								
							}else{
								docid = info._id.$oid;
								if (info.like_count.$numberLong != undefined){
									like_count = info.like_count.$numberLong;

								}else{
									like_count = info.like_count;
								}
							}
							var person_img = gap.person_profile_photo(info.owner);
							var user_info = gap.user_check(info.owner);
							var name = user_info.name;
							var deptname = user_info.dept;							
							var messagex = info.content;
							var rcount = messagex.split(/\r\n|\r|\n/).length;
							var mcount = messagex.length;
							var rdis = false;
							if ((rcount > 10) || (mcount > 800)){
								rdis = true;
							}							
							var message = gBody3.message_check(messagex);
							message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
							if ((info.editor != undefined) && (info.editor != "")){
								var editor_html = info.editor.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
								message = message + editor_html;
							}						
							var html = "";
							html += "<div class='info_pop wrap-channel' style='height:calc(100% - 100px);padding-bottom:32px'>";
							html += "	<div class='info_pop_inner' id='info_pop_inner_div' style='height:100%'>";
							html += "		<div class='l_img_box prof' style='height:46px'>";
							html += "			 "+person_img;
							html += "		 </div>";

							html += "		 <div class='result_box' style='margin-bottom:50px'>";
							html += "			<div class='w_info'>";
							html += "				 <div class='flex'>";
							html += "					<p class='f_in name'>"+name+ " " + deptname + "</p>";
							html += "					<p class='f_in time'>"+disp_date + ' ' + disp_time +"</p>";
							html += "					<p class='red_txt'>"+info.channel_name+"</p>";
							html += "				</div>"; 		
							html += "			</div>";					
							html += "		</div>";							
							
							if (info.type == "emoticon"){
								html += '						<div><img src="' + info.epath + '"></div>';
							}						
							if ((info.editor != undefined) && (info.editor != "")){
								html += '						<h3 class="ts-result-content">' + info.title + '</h3>';
								html += '						<div class="wrap-editor-area ts-result-content">';
								html += '							<p>' + message + '</p>';
								html += '						</div>';							
							}else{
								if (rdis){
									html += '						<p class="msg-fold ts-result-content" style="overflow:unset">' + message + '</p>';
									html += '						<span class="fold-btns" style="cursor:pointer"><button class="btn-expand"><span>' + gap.lang.expand + '</span></button></span>';									
								}else{
									html += '						<p class="ts-result-content">' + message + '</p>';
								}
							}							
							if ((info.og != undefined) && (info.og.msg != undefined)){
								var og = info.og.ex;
								if (og != undefined){
									var imgurl = og.img;
									var title = og.tle;
									var url = og.lnk;
									var desc = og.desc;
									var dmn = (og.dmn != undefined ? og.dmn : url);
									var im = gap.og_url_check(imgurl);
									if (typeof(title) == "undefined"){title = "";}
									if (typeof(desc) == "undefined"){desc = "";}
									if (typeof(dmn) == "undefined"){dmn = "";}
									html += '<div class="link-content">';
									html += '	<a href="' + url + '" target="_blank">';
									html += '		<div class="link-thumb">' + im + '</div>';
									html += '		<ul>';
									html += '			<li class="link-title">' + title + '</li>';
									html += '			<li class="link-summary">' + desc + '</li>';
									html += '			<li class="link-site">' + dmn + '</li>';
									html += '		</ul>';
									html += '	</a>';
									html += '</div>';
								}								
							}else if (info.ex != undefined){								
								if (info.ex.type == "mail"){
									var from = info.ex.sender;
									var title = info.ex.title;									
									var tunid = info.ex.target_unid;
									var tdb = info.ex.target_db;
									var tserver = info.ex.target_server;									
									var attach_list = info.ex.attach.split("*?*");
									var attach_size = info.ex.attachsize.split("*?*");
									var acount = 0;
									if (info.ex.attach != ""){
										acount = attach_list.length;
									}									
									html += "<div class='chat-mail'>";
									html += "<div>";
									html += "	<span class='ico ico-mail'></span>";
									html += "	<dl style='cursor:pointer' onclick=\"gBody4.openMail('" + tunid + "','body', '" + tdb + "', '" + tserver + "')\">";
									html += "		<dt>" + from + "</dt>";
									html += "		<dd>" + title + "</dd>";
									html += "	</dl>";									
									if (acount > 0){
										html += "	<div class='mail-attach-list'>";
										html += "		<button class='ico btn-fold'>접기</button> <!-- 클릭 시 .on 클래스 토글 -->";
										html += "		<h4>" + gap.lang.attachment + " <span>" + acount + "</span></h4>";
										html += "		<ul>";											
										for (var i = 0 ; i < attach_list.length ; i++){
											var attname = attach_list[i];
											var attsize = attach_size[i];
											var icon = gap.file_icon_check(attname);										
											html += "			<li data-target='"+target_server+"' data-tunid='"+tunid+"' data-attname='"+attname+"' data-tdb='"+tdb+"' onclick=\"gBody3.mail_file_down2(this)\"><span class='ico ico-attach " + icon + "'></span><span>" + attname + "</span><em>(" + gap.file_size_setting(attsize) + ")</em>";
										//	html += "			<li onclick=\"gBody3.mail_file_down('" + tunid + "','" + attname + "', '" + tdb + "')\"><span class='ico ico-attach " + icon + "'></span><span>" + attname + "</span><em>(" + gap.file_size_setting(attsize) + ")</em>";
											html += "			</li>";
										}
										html += "		</ul>";
										html += "	</div>";
									}
									html += "	</div>";
									html += "</div>";
								}else if (info.ex.type == "todo"){								
									var xinfo = info.ex;									
									var ux = xinfo.owner;  //나중에 asign.pu로 변경해야 한다.
								//	var asign_img = gap.person_photo(ux.pu);
									var asign_img = gap.person_profile_photo(ux);
									var mem_info = gap.user_check(ux)
									var member_name = mem_info.name;
									var dept = mem_info.dept;
									var email = mem_info.email;
									var jt = mem_info.jt;									
									var todo_item_id = xinfo._id.$oid;								
									html += '<div class="top">';
									html += '   <div class="req_box"  style="display:flex" data-url=\'' + todo_item_id + '\'>';
									html += '   		<div class="req_left" style="width:500px; display:flex">';
									html += '   			<div class="req_icon" style="background-position: -111px -414px; width:62px; border-radius:20px"></div>';
									html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
									html += '           			<h3>['+xinfo.project_name+'] '+xinfo.title+'</h3>';
									html += "						<div class='user-chat f_middle' style='padding:0px'>";
									html += "							<div clss='p_file_info'>";
									html += "								<span class='p_file_name'>"+member_name+ gap.lang.hoching + "</span>";
									html += "								<span class='p_file_time'>"+jt+" / "+dept+"</span>";
									html += "							</div>";								
									html += '           			</div>';
									html += '           		</div>';
									html += '   		</div>';
									html += '   		<button type="button" class="req_btn xtodo" data-type="todo" style="margin-right:10px">'+gap.lang.openNewWin+'</button>';
									html += '   </div>';
									html += '</div>';
								}else if (info.ex.type == "bbs"){
									var _bbs = info.ex;									
									var date = moment(_bbs.pubdate).utc().format("YYYY-MM-DD hh:mm");									
									html += '<div class="top">';
									html += '   <div class="req_box" style="display:flex" data-url=\'' + _bbs.link + '\'>';
									html += '   		<div class="req_left" style="width:500px; display:flex">';
									html += '   			<div class="req_icon" style="background-position: -340px -388px; width:62px; border-radius:20px"></div>';
									html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
									html += '           			<h3>' + _bbs.title + '</h3>';
									html += '						<span class="req_txt">Date : '+date+'</span>';
									html += '           		</div>';
									html += '   		</div>';
									html += '   		<button type="button" class="req_btn" data-type="bbs" style="margin-right:10px">'+gap.lang.openNewWin+'</button>';
									html += '   </div>';
									html += '</div>';
								}else if (info.ex.type == "aprv"){
									var _aprv = info.ex;
									var date = moment(_aprv.pubdate).utc().format("YYYY-MM-DD hh:mm");									
									html += '<div class="top">';
									html += '   <div class="req_box" style="display:flex" data-url=\'' + _aprv.link + '\'>';
									html += '   		<div class="req_left" style="width:500px; display:flex">';
									html += '   			<div class="req_icon" style="background-position: -60px -414px; width:62px; border-radius:20px"></div>';
									html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
									html += '           			<h3>' + _aprv.title + '</h3>';
									html += '						<span class="req_txt">Date : '+date+'</span>';
								//	html += '           			<span class="req_txt">' + _aprv.comment + '</span>';
								//	html += '           			<time>' + _vote.end_date + ' ' + _vote.end_time + ' 까지</time>';
									html += '           		</div>';
									html += '   		</div>';
									html += '   		<button type="button" class="req_btn" data-type="aprv" style="margin-right:10px">'+gap.lang.openNewWin+'</button>';
									html += '   </div>';
									html += '</div>';
								}else if (info.ex.type == "vote"){						
									var _vote = info.ex;
									var _info = {
											"key" : _vote.key,
											"title" : _vote.title,
											"comment" : _vote.comment,
											"endtime" : _vote.end_date + ' ' + _vote.end_time,
											"anonymous" : _vote.anonymous_vote,
											"multi" : _vote.multi_choice
									};									
									html += '<div class="top">';
									html += '   <div class="req_box" style="display:flex" data-vote=\'' + JSON.stringify(JSON.stringify(_info)) + '\'>';
									html += '   		<div class="req_left" style="width:500px; display:flex">';
									html += '   			<div class="req_icon" style="width:62px; border-radius:20px"></div>';
									html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
									html += '           			<h3>' + _vote.title + '</h3>';
									html += '           			<span class="req_txt">' + _vote.comment + '</span>';
									html += '           			<time>' + _vote.end_date + ' ' + _vote.end_time + ' 까지</time>';
									html += '           		</div>';
									html += '   		</div>';
									html += '   		<button type="button" class="req_btn" data-type="vote" style="margin-right:10px">'+gap.lang.vote+'</button>';
									html += '   </div>';
									html += '</div>';									
								}else if (info.ex.type == "channel_meeting"){
									var _meet = info.ex;									
									html += '<div class="top">';
									html += '   <div class="req_box" style="display:flex" data-url=\'' + _meet.meetingurl + '\'>';
									html += '   		<div class="req_left" style="width:500px; display:flex">';
									html += '   			<div class="req_icon" style="background-position:-439px -389px; width:62px; border-radius:20px"></div>';
									html += '           		<div class="req_info" style="padding:0px; max-width:350px">';
									html += '           			<h3>미팅 번호(Meeting Number) : ' + _meet.meetingkey + '<br> 호스트 키(Host Key) : "'+_meet.hostkey+'" </h3>';
									html += '           		</div>';
									html += '   		</div>';
									html += '   		<button type="button" class="req_btn" data-type="bbs" style="margin-right:10px">'+gap.lang.notice_attend+'</button>';
									html += '   </div>';
									html += '</div>';									
								}								
							}							
							// 파일 처리
							if (info.info != undefined){
								var files = info.info;
								var image_files = new Array();
								var normal_files = new Array();								
								for (var i = 0; i < files.length; i++){
									var file = files[i];
									var isImage = gap.check_image_file(file.filename);
									if (isImage){
										image_files.push(file);
									}else{
										normal_files.push(file);
									}
								}								
								//이미지 파일일 경우 표시하기
								if (image_files.length > 0){
									for (var i = 0; i < image_files.length; i++){
										var image = image_files[i];
										var size = gap.file_size_setting(parseInt(image.file_size.$numberLong));
										var image_url = gap.search_file_convert_server(info.fserver) + "/FDownload_thumb.do?id=" + docid + "&md5=" + image.md5 + "&ty=2";										
										html += "<div class='img-content' id='msg_file_"+ docid + "_" + image.md5.replace(".","_")+"'>";		
										html += "	<div class='img-thumb'>";
										html += "		<img src='" + image_url + "' data='" + image.filename + "' data1='" + image.md5 + "' data2='" + image.file_type + "' data3='" + docid + "'  data4='" + info.email + "' data5='" + info.channel_code + "' data8='" + info.channel_name + "'>";
										html += "	</div>";
										html += "	<ul>";
										html += "		<li class='img-title'>" + image.filename + "</li>";
										html += "		<li class='img-size'>" + size + "</li>";
										html += "		<li class='img-btns'>";
										html += "   		<button class='ico btn-view'>크게보기</button>";
										html += "   		<button class='ico btn-download' title='" + gap.lang.download + "'>다운로드</button>";
										html += "   		<button class='ico btn-more'>더보기</button>";
										html += "   	</li>";
										html += "	</ul>";
										html += "</div>";
									}
								}							
								//일반 파일일 경우 표시하기
								if (normal_files.length > 0){
									html += '<ul class="message-file">';									
									for (var i = 0 ; i < normal_files.length; i++){
										var file_info = normal_files[i];
										var fname = file_info.filename;
										var md5 = file_info.md5;
										var fsize = gap.file_size_setting(parseInt(file_info.file_size.$numberLong));
										var add_dt_html = "data1='" + info.fserver + "' data2='" + info.upload_path + "' data3='" + file_info.md5 + "' data4='" + info.email + "' data5='" + file_info.file_type + "' data6='" + docid + "' data7='" + info.channel_code + "' data8='" + info.channel_name + "' title='" + file_info.filename + "'"
										var icon_kind = gap.file_icon_check(fname);
										var show_video = gap.file_show_video(fname);										
										html += '	<li id="msg_file_' + docid + '_' + md5.replace('.', '_') + '">';
										html += '		<div class="chat-attach">';
										html += '			<div style="width:100%">';
										html += '				<span class="ico ico-file ' + icon_kind + '"></span>';
										html += '				<dl>';
										html += '					<dt ' + add_dt_html + '>' + fname + '</dt>';
										html += '					<dd>' + fsize + '</dd>';
										html += '				</dl>';										
										if (gBody3.check_preview_file(fname)){
											html += '				<button class="ico btn-file-view" style="right:53px">파일보기</button>';
										}else if (show_video){
											html += '				<button class="ico btn-file-view" style="right:53px">파일보기</button>';
										}										
										html += '				<button class="ico btn-file-view" style="right:53px" >파일보기</button>';
										html += '				<button class="ico btn-file-download">다운로드</button>';
										html += '				<button class="ico btn-more">더보기</button>';
										html += '			</div>';
										html += '		</div>';
										html += '	</li>';								
									}
									html += '</ul>';									
								}
							}
					
							// reply 처처리
							if (info.reply != undefined){
								if (info.reply.length > 0){
									html += '<div class="message-reply">';									
									for (var i = 0; i < info.reply.length; i++){
										var reply_info = info.reply[i];
										var reply_disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(reply_info.GMT));
										var reply_disp_time = gap.change_date_localTime_only_time(String(reply_info.GMT));
										var reply_content = gBody3.message_check(reply_info.content);
										var reply_person_img = gap.person_profile_photo(reply_info.owner);
										var reply_user_info = gap.user_check(reply_info.owner);
										html += '	<dl>';
										html += '		<dt>';
										html += '			<div class="user">';
										html += '				<div class="user-thumb">' + reply_person_img + '</div>';
										html += '			</div>';
										html += '		</dt>';
										html += '		<dd>';
										html += '			<span>' + reply_user_info.name + '<em class="team">' + reply_user_info.dept + '</em><em>' + reply_disp_date + ' ' + reply_disp_time + '</em></span>';
										html += '			<p class="ts-result-content">' + reply_content + '</p>';
										html += '		</dd>';
										html += '	</dl>';
									}
									html += '</div>';
								}							
							}
							html += "	</div>";
							html += "</div>";										
							$("#portal_search_right").html(html);							
							//에디터 안에 테이블 스타일을 넓이를 맞춘다.
							$(".wrap-editor-area table").css("width", "auto");							
							//투표, 결재, 게시판 링크 클리하는 이벤트 주기
							gBody3.btn_event();				
							gBody2.event_init_ts_search_file();							
							// 하이라이트 처리
							var qry_list = gBody2.ts_query.split(" ");
							for (var k = 0; k < qry_list.length; k++){
								$(".ts-result-content").highlight(qry_list[k]);
							}							
							$("#ts_content").mCustomScrollbar({
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
								autoHideScrollbar : true,							
								callbacks : {
								}
							});									
							
							$("#info_pop_inner_div").mCustomScrollbar({
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
							
							$(".wrap-message mention").css("cursor", "pointer");
							 $(".wrap-message mention").off();
							 $(".wrap-message mention").on("click", function(e){
								 
								 var id = $(this).attr("data");
								 gBody3.click_img_obj = this;
								 _wsocket.search_user_one_for_popup(id);
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
			}else if (item_type == "channel_todo" || item_type == "todo_reply" || item_type == "todo_file"){
				var id = $(obj).attr("id");
				gTodo.compose_layer(id);
			}else{
				var id = "";
				var fserver = obj.attr("fserver");
				var fname = obj.attr("fname");
				var md5 = obj.attr("md5");
				var furl = obj.attr("furl");
				var thumbOK = obj.attr("thmok");
				var show_video = gap.file_show_video(fname);
				var icon_kind = gap.file_icon_check(fname);
				var ty = "";				
				if (item_type == "file"){
					ty = "1";
					id = obj.attr("id");					
				}else if (item_type == "channel_file"){
					ty = "2";
					id = obj.attr("dataid");					
				}else if (item_type == "favorite"){
					ty = "3";
					id = obj.attr("id");
				}				
				if (show_video){
					gap.show_video(furl, fname);					
				}else if (icon_kind == "img"){					
					gap.image_gallery = new Array();  //변수 초기화 해준다.
					gap.image_gallery_current = 1;					
					gap.show_image(furl, fname);
					
				}else{
					gBody3.file_convert(fserver, fname, md5, id, ty, true);	
				}
			}
		},
		
		"draw_box_search_list" : function(page_no, res){
			var item_id = "";			
			for (var i = 0; i < res.length; i++){
				var _html = '';
				var info = res[i]._source;
				var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(info.GMT));
				var disp_time = gap.change_date_localTime_only_time(String(info.GMT));
				var is_mail = false;				
				if (info.type == "msg" || info.type == "reply" || info.type == "channel_todo" || info.type == "todo_reply" || info.type == "todo_file"){				
					var add_li_html = "";
					var content = "";
					if (info.editor != undefined && info.editor != ""){
						content = info.title;						
					}else{
						if (info["ex.type"] != undefined){
							var tp = info["ex.type"];
							if (tp == "mail"){
								is_mail = true;
							}
							content = info["ex.title"];								
						}else{
							if (info.type == "channel_todo"){
								content = info.title;
							}else if (info.type == "todo_file"){
								content = info.ftitle;
							}else{
								content = info.content;
							}							
						}
					}					
					content = gap.textToHtml(content).replace(/&nbsp;/gi, " ");					
					if (info.type == "reply"){
						item_id = info.rid;
						add_li_html = 'cdataid="' + info.channel_data_id + '"';
						
					}else{
						item_id = info.id;
					}			
					_html += "		<div class='result_box' style='cursor:pointer'>";
					_html += "			<div class='team-mem flex' id='" + item_id + "' itemty='" + info.type + "' " + add_li_html + ">";					
					if (is_mail){
						_html += "				<div >";
						_html += "						<span class='ico ico-mail' style='background-position: -708px -58px; margin-right:20px'></span>";
						_html += "				</div>";
					}else{
						var obj = new Object();
						obj.cpc = info.owner_cpc;
						obj.emp = info.owner_empno;
						_html += "				<div class='l_img_box prof'>";
						_html += "						<div class='photo-wrap' style='border-radius:50%; background-image:url(" + gap.person_photo_url(obj) + "),url("+gap.none_img+");'></div>";
						_html += "				</div>";
					}					
					_html += "				<div class='w_info'>";
					_html += "					<div class='flex'>";
					_html += "						<p class='f_in name'>"+info.owner_nm+"</p>";
					_html += "						<p class='f_in time'>"+ disp_date + ' ' + disp_time +"</p>";
					_html += "						<p class='red_txt'>"+info.channel_name +"</p>";
					_html += "					</div>";
					_html += "					<div class='re_txt' style='height:20px'>";
					_html += "						"+content;
					_html += "					</div>";
					_html += "				</div>";
					_html += "			</div>";
					_html += "		</div>";
				}else{
					var icon_kind = gap.file_icon_check(info.ftitle);
					var owner_nm = (info.type == "favorite" ? gap.user_check(gap.userinfo.rinfo).name : info.owner_nm);
					var downloadurl = "";
					var add_li_html = "";
					var ch_name = "";
					var more_class = "";						
					if (info.type == "file"){
						item_id = info.id;
						downloadurl = gap.search_file_convert_server(info.fserver) + "/FDownload.do?id=" + item_id + "&ty=1";
						add_li_html = 'owner="' + info.email + '" fserver="' + info.fserver + '" fname="' + info.ftitle + '" md5="' + info.md5 + '" furl="' + downloadurl + '" thmok="' + info.thumbOK + '"';
						ch_name = (info.folder_code == "root" ? info.drive_name : info.folder_name);
						more_class = "file-menu";						
					}else if (info.type == "channel_file"){
						item_id = info.id;
						downloadurl = gap.search_file_convert_server(info.fserver) + "/FDownload.do?id=" + info.fid + "&md5=" + info.md5 + "&ty=2";
						add_li_html = 'dataid="' + info.fid + '" owner="' + info.email + '" fserver="' + info.fserver + '" fname="' + info.ftitle + '" ftype="' + info.file_type + '" md5="' + info.md5 + '" furl="' + downloadurl + '" thmok="' + info.thumbOK + '"';
						ch_name = info.channel_name;
						more_class = "files-file-menu";						
					}else if (info.type == "favorite"){
						item_id = info.id;
						downloadurl = gap.search_file_convert_server(info.fserver) + "/FDownload.do?id=" + item_id + "&ty=3";
						add_li_html = 'fserver="' + info.fserver + '" fname="' + info.ftitle + '" md5="' + info.md5 + '" furl="' + downloadurl + '" thmok="' + info.thumbOK + '"';
						ch_name = gap.lang.favorite;
						more_class = "favorite-file-menu";
					}
					_html += "		<div class='result_box' style='cursor:pointer'>";
					_html += "			<div class='team-mem flex' id='" + item_id + "' itemty='" + info.type + "' " + add_li_html + ">";
					_html += "				<div >";
					_html += "						<span class='ico ico-file " + icon_kind + "' style=' margin-right:20px'></span>";
					_html += "				</div>";
					_html += "				<div class='w_info'>";
					_html += "					<div class='flex'>";
					_html += "						<p class='f_in name'>"+ owner_nm +"</p>";
					_html += "						<p class='f_in time'>"+ disp_date + ' ' + disp_time +"</p>";
					_html += "						<p class='red_txt'>"+ch_name+"</p>";
					_html += "					</div>";
					_html += "					<div class='re_txt'>";
					_html += "						<strong>" + info.ftitle + "</strong> <span>(" + gap.file_size_setting(info.size) + ")</span>";
					_html += "					</div>";
					_html += "				</div>";
					_html += '				<span style="position:absolute;right:90px"><button class="ico btn-more ' + more_class + '" style=""></button></span>';
					_html += "			</div>";				
					_html += "		</div>";					
				}
				$("#box_search_list").append(_html);				
				gBody2.event_init_ts_search_list();
			}			
			// 검색어 하이라이트 처리//		
			var qry_list = gBody2.ts_query;
			$(".result_box").highlight(qry_list);					
			$("#wrap_box_search_list").mCustomScrollbar({
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
				autoHideScrollbar : true,							
				callbacks : {
					onTotalScrollBackOffset: 100,
					onTotalScroll: function(){
						page_no++;
						gBody2.add_box_search_list(page_no);
					},
					onTotalScrollOffset: 100,
					alwaysTriggerOffsets:true
				}
			});		
		},	
		
	"send_files" : function(type, urls, md5s, sizes, filenames, members){		
		gap.show_loading2(gap.lang.file_transfer + "......");	
		//멤버가 한명인지 여러명인지 확인한다.
		var tfolder = moment().format("YYYYMMDD");
		if (type == "1" || type == "3"){
			//채널과 드라이브에 있는 파일을 대화방 폴더로 복사해야 한다.
			var fnames = [];
			for (var i = 0 ; i < md5s.length; i++){
				var ext = gap.file_extension_check(filenames[i]);
				fnames.push("upload_" + md5s[i] + "." + ext);
			}
			var url = gap.channelserver + "/multifile_copy.km";
			var data = JSON.stringify({
				"url" : urls.join("-spl-"),
				"folder" : tfolder,
				"filenames" : fnames.join("-spl-")
			});
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				url : url,
				data : data,
				success : function(res){		
					gap.hide_loading2();
					if (res.result == "OK"){
						gBody3.send_files_chat(type, urls, md5s, sizes, filenames, members, tfolder);
					}else{
						gap.error_alert();
					}					
				},
				error : function(e){
					gap.hide_loading2();
					gap.error_alert();
				}
			});
		}else{
			//채팅방에서 전송되었던 파일은 별도 선처리가 필요 없어 바로 전송한다.			
			gBody3.send_files_chat(type, urls, md5s, sizes, filenames, members, tfolder);
		}
		return false;
		
		
	},
		
	"send_files_chat" : function(type, urls, md5s, sizes, filenames, members, tfolder){		
		var owner = gap.userinfo.rinfo;
		var owner_info = gap.user_check(owner);
		var scid = "";
		var filename = "";		
		for (var k = 0 ; k < urls.length; k++){
			var obj = new Object();			
			//파일의 개수만큰 전송해야 한다.
			var size = sizes[k];
			var md5 = md5s[k];
			var filename = filenames[k];
			var fileinfo = urls[k].split("/");	
			var exobj = new Object();
			exobj.nid = gap.sid;
			exobj.ty = gap.file_extension_check(filename);			
			if (type == "2"){
				exobj.sn = fileinfo[6];
				exobj.sf = "/" + fileinfo[5];
				tfolder = fileinfo[5];
			}else{
				//채팅 파일이 아닐경우 채팅파일 서버쪽으로 파일을 옮기고 설정해야 한다.
				exobj.sn = "upload_" + md5 + "." + exobj.ty;
				exobj.sf = "/" + tfolder;
				exobj.caller = type
			}			
			exobj.sz = parseFloat(size);
			exobj.nm = filename;
			obj.ex = exobj;		
			var res = "";		
			if (gBody3.call_open_chatroom == "T"){
				scid = gBody3.cur_cid;
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
						_wsocket.make_chatroom_11_only_make_with_cid(members[0].ky, mem_info.name, cid);
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
			 if (gBody3.call_open_chatroom == "T"){								 
				 //내창에 발송된 파일을 그린다.
				 var key = gap.search_cur_ky();
				 var time = gap.search_time_only();	
				 var ucnt = gap.cur_room_att_info_list.length -1 ;
				 var msgid = obj.mid; 
				 var xdate = new Date();		
		  		 var date = xdate.YYYYMMDDHHMMSS();				 
				 var savefilename = exobj.sn;
				 var downloadurl = gap.fileupload_server_url + "/filedown/" + tfolder + "/" + savefilename + "/" + encodeURIComponent(filename);
		  		 var previewurl = gap.fileupload_server_url + "/" + tfolder + "/thumbnail/" + savefilename;
				 gBody3.file_draw('me', typ, key, date, time, filename, size, downloadurl, previewurl, msgid, '','D', ucnt, obj);				 
				 gBody3.last_msg.ty = obj.ty 
	  		  	 gBody3.last_msg.ex = obj;
	  		  	 gBody3.last_msg.downloadurl = downloadurl;	  		  	
			 }
		//	 setTimeout(function(){					
				 _wsocket.send_chat_msg(obj);
		//	 }, 500);			
		}	
		 gap.hide_loading2();
		 mobiscroll.toast({message:gap.lang.f_complete, color:'info'});	
		 setTimeout(function(){					
			 $(".pop_btn_close").click();
			 _wsocket.load_chatroom_list();	
		 }, 700);
	},	
	
	"editor_temp_save" : function(){
		var req_data = {
			"title" : $("#editor_title").val(),
			"editor" : $("#editor_iframe").get(0).contentWindow._form.keditor.getBodyValue(),
			"ky" : gap.userinfo.rinfo.ky
		};		
		return $.ajax({
			url: gap.channelserver + "/channel_save_temp.km",
			type: "POST",
            dataType: 'json',
            data: JSON.stringify(req_data),
            contentType: 'application/json',
            beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
            success: function (data) {
				$("#editor_close").click();
				mobiscroll.toast({message:gap.lang.temp_saved, color:"info"});
			},
            error: function() {
            	
            }
        });
	},
	
	"editor_temp_delete" : function(key){
		var req_data = {"key":key};
		return $.ajax({
			url: gap.channelserver + "/channel_delete_temp.km",
			type: "POST",
            dataType: 'json',
            data: JSON.stringify(req_data),
            beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
            contentType: 'application/json',
            success: function (data) {

			},
            error: function() {
            	
            }
        });
	},
	
	"get_temp_list" : function(key){
		var req_data = {"key":(key?key:"")};
		return $.ajax({
			url: gap.channelserver + "/channel_list_temp.km",
			type: "POST",
            dataType: 'json',
            data: JSON.stringify(req_data),
            beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
            contentType: 'application/json',
            success: function (data) {
				            	   	    
			},
            error: function() {
            	
            }
        });
	},
	
	"show_temp_list" : function(target){
		var _self = this;
		this.get_temp_list().then(function(data){
						
			var html = 
				'<div class="ed-list-inner">' +
				'	<ul class="ed-list"></ul>' +
				'</div>';		
			$(target).qtip({
				overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
				content : {
					text : function(event, api){
						var $res = $(html);
						var empty_li = '<li class="empty">' + gap.lang.temp_empty + '</li>';						
						if (data.data.total == 0) {
							$res.find('.ed-list').append(empty_li);
						} else {
							var list = data.data.response;
							$.each(list, function(){
								var _id = this._id['$oid'];
								var _title = this.title ? this.title : gap.lang.notitle;
								var _dt = moment(this.GMT.substr(0,8) + 'T' + this.GMT.substr(8) + 'Z').format('YYYY-MM-DD HH:mm:ss');
								
								var _html = 
									'<li>' +
									'	<span class="temp-title">' + _title + '</span>' +
									'	<span class="temp-dt">' + _dt + '</span>' +
									'	<button class="btn-temp-del">삭제</button>' +
									'</li>';
								
								var $li = $(_html);
								$li.data('id', _id);
								$res.find('.ed-list').append($li);
								
							});							
							// 임시저장 항목 불러오기
							$res.find('.ed-list li').on('click', function(){
								// 에디터 로딩이 완료되었는지 화인
								var editor_el = $("#editor_iframe").get(0);
								if (editor_el.contentWindow._form && editor_el.contentWindow._form.keditor) {
									var sel_id = $(this).data('id');
									_self.get_temp_list(sel_id).then(function(tmpdata){
										var _cont = gap.textToHtmlEditor(tmpdata.data.data.editor);
										$("#editor_title").val(tmpdata.data.data.title);
										editor_el.contentWindow._form.keditor.setHtml(_cont);		
									}, function failFunc(){
										console.log('gBody3.show_temp_list Error');
									});								
								} 
							});
							
							$res.find('.btn-temp-del').on('click', function(){
								var $li = $(this).closest('li');
								var sel_id = $li.data('id');
								_self.editor_temp_delete(sel_id).then(function(data){
									gsap.to($li, {
										height: 0,
										padding: 0,
										onComplete: function(){
											$li.remove();											
											// 전체 삭제된 경우
											if ($res.find('.ed-list li').length == 0) {
												$res.find('.ed-list').append(empty_li);												
											}
										}
									});
								});
								return false;
							});
						}					
						return $res;
					}
				},
				show : {
					event: 'mouseover',
					ready: true
				},
				hide : {
					event : 'mouseout',
					//event: 'click',
					fixed : true,
					delay: 300
				},
				style : {
					classes : 'qtip-bootstrap channel-temp-list',
					tip : true
				},
				position : {
					my : 'top center',
					at : 'bottom center',
					viewport: $('#main_body'),
					adjust: {
						y: 5,
						method: 'shift'
					},
					effect: function(api, pos, viewport){
						//pos.top -= 15;
						//$(this).animate(pos,{duration: 200, queue: false, complete: function(){						
							//(gsap.timeline()).fromTo($('.user-favo-title'), {x:-20, opacity: 0}, {x:0, opacity:1, duration:0.2});
						//}});
					}
				},
				events : {
					hidden : function(event, api){
						api.destroy(true);
					},					
					render: function(event, api){						
					}
				}				
			});			
		}, function failFunc(){
			
		});
	},
	
	"channel_data_copy" : function(channel_code, id){
		
		var html = '';
		html += '<h2>' + gap.lang.csy + '</h2>';
		html += '<button id="close_copy_channel" class="ico btn-close">닫기</button>';		
		html += '<select id="share_channel_copy">';
		html += '</select>'
		html += '<div class="layer-bottom">';
		html += '	<button id="ok_copy_channel"><strong>' + gap.lang.OK + '</strong></button>';
		html += '	<button id="cancel_copy_channel"><span>' + gap.lang.Cancel + '</span></button>';
		html += '</div>';
		$('#compose_todo_calendar').html(html);	
				
		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#compose_todo_calendar')
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();
		
		var list = "";	
		list += '<optgroup label="'+gap.lang.sharechannel+'" id="share_channel_list_popup">';
		list += "<option value=''>"+gap.lang.channelchoice+"</option>";	
		var clist = gap.cur_channel_list_info;
		for (var k = 0 ; k < clist.length; k++){
			var citem = clist[k];
			if (citem.type != "folder"){
				list += "<option value='"+citem.ch_code+"'>" + citem.ch_name + "</option>";
			}			
		}		
		list += '</optgroup>';		
		$("#share_channel_copy").html(list);	
	//	$('#share_channel_copy').val(channel_code);
		$('#share_channel_copy').material_select();
		
		$("#close_copy_channel").on("click", function(){
			gap.close_layer('compose_todo_calendar');
		});
		$("#cancel_copy_channel").on("click", function(){
			gap.close_layer('compose_todo_calendar');
		});
		$("#ok_copy_channel").on("click", function(){
			
			var select_channel_name = $(".optgroup-option.active.selected").text();	 
			var select_channel_code = $('#share_channel_copy').val();
			
			var is_copy_auth = gap.checkAuth2(select_channel_code);
			if (!is_copy_auth){
				gap.gAlert(gap.lang.ba4);
				return false;
			}
			
			if (select_channel_code == ""){
				gap.gAlert(gap.lang.select_basic_channel);
			}else{
				var data = JSON.stringify({
					"channel_code" : select_channel_code,
					"channel_name" : select_channel_name,
					"key" : id,
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
							$("#close_copy_channel").click();
							gap.gAlert(gap.lang.ba3);
							//현재 방에 복사하는 경우는 Refresh를 
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
	
	"hide_conversation_config" : function(){
		if (useMention == "T"){
			//$('#work-chat .channel-search').css('right', '30px');
			$("#conv_config").hide();
			$("#header_mention").hide();		
		}else{
			//$('#work-chat .channel-search').css('right', '30px');
			$("#conv_config").hide();			
		}
	},
	
	"channel_init" : function(selectid){		
		var dropzoneControl = $("#" + selectid)[0].dropzone;
        if (dropzoneControl) {
            dropzoneControl.destroy();
        }		
		myDropzone_channel = new Dropzone("#"+selectid, { // Make the whole body a dropzone
		      url: gap.channelserver + "/FileControl.do", // Set the url
		 //     url : gap.fileupload_server_url + "/" + gap.search_today_only(),
		      autoProcessQueue : false, 
			  parallelUploads : 100,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
			  maxFilesize: 1000,
			  timeout: 180000,
		  	  uploadMultiple: true,
		  	  withCredentials: false,
		  	  previewsContainer: "#previews_channel", // Define the container to display the previews
		  	  clickable: "#open_attach_window2", // Define the element that should be used as click trigger to select files.
		  	  renameFile: function(file){		
					return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			  },
		  	  init: function() {		
				myDropzone_channel = this;
				this.imagelist = new Array();
				this.on('dragover', function(e,xhr,formData){						
		        	$("#"+selectid).css("border", "2px dotted #005295");
		        	return false;
		        });	
		      },
		      success : function(file, json){		    	
		    	  var jj = JSON.parse(json);	    	  
		    	  if (jj.result == "OK"){		    		  
		    		//동일한 파일을 제거한 상태로 driectDraw로 데이터 전송한다.
		    		  var lls = jj.file_infos;
		    		  var keys = [];
		    		  var lp = [];
		    		  for (var i = 0; i < lls.length; i++){
		    			  var lpx = lls[i].md5;
		    			  var ff = Object.keys(keys)[Object.values(keys).indexOf(lpx)];
		    			  if (typeof(ff) == "undefined"){
		    				  lp.push(lls[i]);
		    			  }
		    			  keys.push(lpx);
		    		  }	  
		    		  jj.file_infos = lp;		    		  
		    		  myDropzone_channel.files_info = jj;
		    	  }		    	 		
		      },
		      addedfile :  function(file) {		   
		    	 
		    	  myDropzone_channel.addfirst = true;
		    	  gap.dropzone_upload_limit(this, file, "box");
		    	  myDropzone_channel.upload_count--;		    	
		    	  if (myDropzone_channel.upload_count == 0){		  			
		  			$("#total-progress_channel").hide();
		  			$("#"+selectid).css("border", "");		  			
		  			if (myDropzone_channel.files.length > 0){
		  				gBody3.popup_status = "file";
		  				gBody3.add_upload_file_list(myDropzone_channel.files, "file");		  				
		  				$("#f_u1").text(gap.lang.file + " " + gap.lang.upload);
		  				$("#f_u2").text(gap.lang.scpp);		  				
		  				gap.showBlock();		  		
		  				var inx = parseInt(gap.maxZindex()) + 1;
		  				$("#fileupload_layer").css("z-index", inx);
		  				$("#fileupload_layer").fadeIn();	  
		  				$("#total-progress_channel").show();
		  			}
		    	  }
	    	 }	   
		});		
		myDropzone_channel.on("totaluploadprogress", function(progress) {			
			$("#show_loading_progress").text(parseInt(progress) + "%");
			document.querySelector("#total-progress_channel .progress-bar").style.width = progress + "%";
		});		
		myDropzone_channel.on("queuecomplete", function (file){		
			
			gap.hide_loading();			
			//파일을 컨텐트 영역에 그린다. ////////////			
			gBody3.send_file();
			//////////////////////////////			
			$("#fileupload_content").val("");  //입력창을 초기화 한다. 여러개의 파일을 동시에 올릴수 있기 때문에 여기서 초기화 해준다.			
			gBody3.clear_dropzone();
			myDropzone_channel.upload_count = 0;
			myDropzone_channel.addfirst = false;			
			//채널 파일 업로드 완료후 편집 모드 설정값을 초기화 해주어야 별도의 컨텐츠로 인식한다. (연속해서 파일 업로드시)
			gBody3.edit_mode = "";			
			gap.change_cur_channel_read_time(gBody3.cur_opt, this.files_info.GMT);			
			var xtime1 = setTimeout(function(){
				gBody3.complete_process_channel();				
				//만약 첫번째 컨텐트를 저장한 경우 스크로 컨트롤을 해주서야 한다.					
				var llp = $("#channel_list .xman").length;
				if (llp == 1){
					gBody3.sc();
				}
				////////////////////////////////////////////////////
				clearTimeout(xtime1);
			}, 800);
		});	      
		myDropzone_channel.on("addedfiles", function (file){	
			var is_compose_auth = gap.checkAuth();
			
			if (!is_compose_auth){
				$("#total-progress_channel").hide();
				$("#"+selectid).css("border", "");	
				gap.gAlert(gap.lang.ba4);
				return false;
			}
			
			if (myDropzone_channel.addfirst == false){
				//드래그 & 드롭으로 파일을 업로드한 경우
				myDropzone_channel.upload_count = file.length;
			}else{
				//파일 업로드 창으로 파일을 선택한 경우
				var upload_files = [];
				for (var i = 0 ; i < file.length; i++){								
					var fx = file[i];
					var is_image = gap.check_image_file(fx.name);
					if (is_image){
						//이미지일 경우 파일 사이즈를 20M로 설정한다.
						//alert(fx.size + "/" + gBody3.image_max_upload_size);
						if (fx.size > (gap.image_max_upload_size_box * 1024 * 1024)){
							var si = (fx.size / 1024 / 1024) + "M";
							myDropzone_channel.removeFile(fx);						
							if (!myDropzone.sendOK){
								myDropzone_channel.sendOK = false;	
							}	
						}else{
							myDropzone_channel.sendOK = true;
							upload_files.push(fx);
						}						
					}else{
						//일반 파일일 경우 사이즈를 100M로 설정한다.
						//alert(fx.size + "/" + gBody3.file_max_upload_size);
						if (fx.size > (gap.file_max_upload_size_box * 1024 * 1024)){	
							myDropzone_channel.removeFile(fx);
							if (!myDropzone_channel.sendOK){
								myDropzone_channel.sendOK = false;
							}
						}else{							
							if (gap.no_upload_file_type_check(fx.name)){
								$("#total-progress_channel").hide();
								myDropzone_channel.removeFile(fx);
								if (!myDropzone_channel.sendOK){
									myDropzone_channel.sendOK = false;	
								}						
							}else{
								myDropzone_channel.sendOK = true;
								upload_files.push(fx);
							}							
						}			
					}	
				}			
				$("#total-progress_channel").hide();
				$("#"+selectid).css("border", "");				
				if (upload_files.length > 0){
					gBody3.popup_status = "file";
					gBody3.add_upload_file_list(upload_files, "file");					
					$("#f_u1").text(gap.lang.file + " " + gap.lang.upload);
					$("#f_u2").text(gap.lang.scpp);					
					gap.showBlock();			
					var inx = parseInt(gap.maxZindex()) + 1;
					$("#fileupload_layer").css("z-index", inx);
					$("#fileupload_layer").fadeIn();
					$("#total-progress_channel").show();
				}
			}			
		});		
		myDropzone_channel.on("sending", function (file, xhr, formData){		
			if (gap.dropzone_upload_limit_only_check(file, "box")) {				
			}else{
				myDropzone_channel.removeFile(file);
				return false;
			}			
			gap.show_loading(gap.lang.saving);			
			$("#"+selectid).css("border", "");		
			var mentions_msg = "";
			var mentions_data = "";			
			var msg = $("#fileupload_content").val();
			var og = gBody3.og_search(msg);		
			var tmsg = this.clipboardtext;
			if (tmsg != "" && typeof(tmsg) != "undefined"){
				//클립보드에서 올린 내용은 여기서 별도로 처리한다.
				mentions_msg = tmsg;
				mentions_data = [];
				this.clipboardtext = "";
			}else{
				//mention 처리 /////////////////////////////////////////////////////////////				
				$("#fileupload_content").mentionsInput('val', function(text){
					mentions_msg = gap.textMentionToHtml(text);;
				});
				$("#fileupload_content").mentionsInput('getMentions', function(data) {
					mentions_data = data;
				});
				///////////////////////////////////////////////////////////////////////////
			}	
			formData.append("email", gap.userinfo.rinfo.em);
			formData.append("ky", gap.userinfo.rinfo.ky);
		//	formData.append("content", msg);
			formData.append("content", gap.HtmlToText(mentions_msg));		// 파일업로드시 입력되는 텍스트만 &lt; 형태로 변환되지 않아 함수를 통해 변환
			formData.append("mention", JSON.stringify(mentions_data));
			formData.append("channel_code", gBody3.select_channel_code2);
			formData.append("channel_name", gBody3.select_channel_name2);
			formData.append("owner", JSON.stringify(gap.userinfo.rinfo));
			formData.append("fserver", gap.channelserver);
			formData.append("type", "channel");			
			formData.append("id", gBody3.select_channel_id);
			formData.append("og", JSON.stringify(og));			
			formData.append("edit", gBody3.edit_mode);			
			formData.append("upload_path", gBody3.select_doc_info.upload_path);			
			myDropzone_channel.files_info = "";
			$("#total-progress_channel").show();	
	       // $("#chat_msg").css("border","");
	        document.querySelector("#total-progress_channel .progress-bar").style.display = "";
		});		
		$("#add_tab_btn").on("click", function(e){
			gBody3.show_add_tab_layer();
			//선택창 레이어를 띄워야 한다.
		});	
		$("#upload_channel_file").off().on("click", function(e){
			myDropzone_channel.processQueue();
		});
		$("#fileupload_cancel_new").off().on("click", function(e){			
			$("#p_close_channel").click();
			return false;
		});		
		$("#file_upload_add").off().on("click", function(e){
			$("#open_attach_window2").click();
		});		
		$("#fileupload_start").off().on("click", function(e){		
			var key = $('#share_channel_list_popup').val();
			if ( (key == null) || (key == "")){
				gap.gAlert(gap.lang.selectchannel);
				return false;
			}			
			//선택된 Box의 정보를 가져온다.
			var sel_txt = $("#share_channel_list_popup option:checked").text();
			var sel_val = $("#share_channel_list_popup option:checked").val();			
			gBody3.select_channel_code2 = sel_val;
			gBody3.select_channel_name2 = sel_txt;		
			if (gBody3.popup_status == "file"){				
				var isS = false;
				if (gBody3.edit_mode == "T"){
					var drop_file_count = myDropzone_channel.files.length;
					if (drop_file_count > 0){
						//원본 문서에서 파일을 삭제하는 경우 삭제된 파일을 먼저 정리한다.
						if (gBody3.delete_file_list.length > 0){
							isS = true;
							gBody3.sub_file_delete_send_server();
						}else{
							myDropzone_channel.processQueue();
						}			
					}else{
						//추가된 파일이 없는 경우
					/*	var content = $("#fileupload_content").val();
						//if (gBody3.delete_file_list.length > 0){							
						gBody3.sub_file_delete_send_server2(content);*/						
						//mention 처리 /////////////////////////////////////////////////////////////
						var mentions_msg = "";
						var mentions_data = "";
						$("#fileupload_content").mentionsInput('val', function(text){
							mentions_msg = gap.textMentionToHtml(text);;
						});
						$("#fileupload_content").mentionsInput('getMentions', function(data) {
							mentions_data = data;
						});
						///////////////////////////////////////////////////////////////////////////						
						gBody3.sub_file_delete_send_server2(mentions_msg, mentions_data);
					}
				}else{
					//업로드 할 파일이 있는지 체크한다.					
					var fcount = $("#upload_file_list .attach-name").length;					
					if (fcount == 0){
						gap.gAlert(gap.lang.select_upload_file);
						return false;
					}					
					myDropzone_channel.processQueue();
				}				
				gBody3.hide_upload_layer();					
				gBody3.popup_status = "";
				// mention div 영역 초기화
				gap.reset_mentions_div();				
				$("#upload_file_list_edit").empty();								
				if (isS == false){
					$("#fileupload_content").val("");
				}			
				//모바일  Push를 날린다. ///////////////////////////////////
				var smsg = new Object();
				smsg.msg = "[" + sel_txt + "] " + gap.lang.reg_file;	
				smsg.title = "DSW[Daesang Smart Work]";	
				smsg.type = "ms";
			//	smsg.key1 = gBody3.select_channel_code;
				smsg.key1 = sel_val;
				smsg.key2 = "";
				smsg.key3 = gBody3.select_channel_name2;
				smsg.fr = gap.userinfo.rinfo.nm;
				//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
			//	smsg.sender = gBody3.search_cur_channel_member(gBody3.select_channel_code).join("-spl-");	
				smsg.sender = gBody3.search_cur_channel_member(sel_val).join("-spl-");
				gap.push_noti_mobile(smsg);			
				////////////////////////////////////////////////////				
			}else if (gBody3.popup_status == "msg"){			
				var msg = $("#fileupload_content").val();								
				if (msg.trim() == ""){
					gap.gAlert(gap.lang.input_message);
					return false;
				}				
				var og = gBody3.og_search(msg);				
				//mention 처리 /////////////////////////////////////////////////////////////
				var mentions_msg = "";
				var mentions_data = "";
				$("#fileupload_content").mentionsInput('val', function(text){
					mentions_msg = gap.textMentionToHtml(text);;
				});
				$("#fileupload_content").mentionsInput('getMentions', function(data) {
					mentions_data = data;
				});
				///////////////////////////////////////////////////////////////////////////				
				var data = JSON.stringify({
					"type" : "msg",
//					"channel_code" : gBody3.select_channel_code,
//					"channel_name" : gBody3.select_channel_name,
					"channel_code" : sel_val,
					"channel_name" : sel_txt,
			//		"email" : gap.userinfo.rinfo.em,
					"email" : gap.userinfo.rinfo.em,
					"ky" : gap.userinfo.rinfo.ky,
					"owner" : gap.userinfo.rinfo,
					"content" : mentions_msg,	//msg,
					"mention" : mentions_data,
					"edit" : gBody3.edit_editor,
					"msg_edit" : gBody3.edit_mode,
					"id" : gBody3.select_channel_id,
					"og" : og,
					"fserver" : gap.channelserver
				});			
				gBody3.send_msg_to_server(data);				
				gBody3.popup_status = "";
				// mention div 영역 초기화
				gap.reset_mentions_div();				
				$("#fileupload_content").val("");
				gBody3.hide_upload_layer();	
				gap.hideBlock();			
			}else if (gBody3.popup_status == "emoticon"){								
				var msg = $("#fileupload_content").val();
				var filepath = $("#up_emoticon_img").attr("src");				
				var og = gBody3.og_search(msg);				
				//mention 처리 /////////////////////////////////////////////////////////////
				var mentions_msg = "";
				var mentions_data = "";
				$("#fileupload_content").mentionsInput('val', function(text){
					mentions_msg = gap.textMentionToHtml(text);;
				});
				$("#fileupload_content").mentionsInput('getMentions', function(data) {
					mentions_data = data;
				});
				///////////////////////////////////////////////////////////////////////////				
				var data = JSON.stringify({
					"type" : "emoticon",
					"channel_code" : sel_val,
					"channel_name" : sel_txt,
				//	"email" : gap.userinfo.rinfo.em,
					"email" : gap.userinfo.rinfo.em,
					"ky" : gap.userinfo.rinfo.ky,
					"owner" : gap.userinfo.rinfo,
					"content" : mentions_msg,	//msg,
					"mention" : mentions_data,
					"epath" : filepath,
					"edit" : gBody3.edit_editor,
					"msg_edit" : gBody3.edit_mode,
					"id" : gBody3.select_channel_id,
					"og" : og,
					"fserver" : gap.channelserver
				});				
				gBody3.send_msg_to_server(data);
				gBody3.hide_upload_layer();	
				gap.hideBlock();				
				gBody3.popup_status = "";
				// mention div 영역 초기화
				gap.reset_mentions_div();				
				$("#fileupload_content").val("");				
			}else if (gBody3.popup_status == "mail"){			
				var data = gBody3.temp_mail_info;
				var data2 = JSON.parse(data);
				data2.channel_code = sel_val;
				data2.channel_name = sel_txt;
				data2.fserver = gap.channelserver
				data = JSON.stringify(data2);				
				gBody3.send_msg_to_server(data);
				gBody3.popup_status = "";
				gBody3.hide_upload_layer();	
				gap.hideBlock();			
			}			
		});		
		$("#p_close_channel").off().on("click", function(e){			
			gBody3.edit_mode = "";
			gBody3.popup_status = "";			
			// mention div 영역 초기화
			gap.reset_mentions_div();			
			$("#fileupload_content").val("");
			$("#upload_file_list_edit").empty();			
			gBody3.hide_upload_layer();
			gap.hideBlock();
			gBody3.clear_dropzone();		
			return false;
		});				
		$("#channel_option li").off().on("click", function(e){	
			var res = gap.checkEditor();
			if (!res) return false;
			
			//Plugin 실행후 다시 Box UI로 돌아가는 함수 호출
			gBody3.backto_box_layout();
			//////////////////////////////////////////////					
			var id = e.currentTarget.id;			
			//$("#channel_list").html("");
			$("#channel_list .date").remove();
			$("#channel_list .xman").remove();
			$("#channel_list #grid_wrap").remove();			
			$("#ch_query").val("");			
			gBody3.removeClass_channel();
			$("#" + id).addClass("on");			
			var query = "";			
			gBody3.cur_opt = id;
			gBody3.islast = "F";
			gBody3.start = 0;			
			//필터링 설정한 부분을 초기화 한다.
			gBody3.click_filter_image = "";
			$("#channel_filter ul li button").removeClass("on");									
			gBody3.draw_channel_list();		
		});			
		$("#person_text_option2").off().on("click", function(){
			//채팅창에서 개인 설정 선택한 경우			
			var html = "";
			html += "<div class='layer layer-menu opt-enter' id='enter_opt'>";
			html += "<ul>";		
			if (gap.enter_opt == "1"){
				html += "<li class='on' onclick='gBody.enteropt(1)'>"+gap.lang.enteroptions1+"</li>";
				html += "<li  onclick='gBody.enteropt(2)'>"+gap.lang.enteroptions2+"</li>";
			}else{
				html += "<li  onclick='gBody.enteropt(1)'>"+gap.lang.enteroptions1+"</li>";
				html += "<li class='on'  onclick='gBody.enteropt(2)'>"+gap.lang.enteroptions2+"</li>";
			}			
			html += "</ul>";
			html += "</div>";			
			$("#person_text_option2").qtip({
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
		$("#other_btn").off().on("click", function(){
			
			var res = gap.checkEditor();
			if (!res) return false;
			
			//채팅창에서 개인 설정 선택한 경우	
			var html = "";
			html += "<div class='layer layer-choose' id='other_layer'>";
			html += "	<div class='box'>";
			html += "		<h3>"+gap.lang.file + " " + gap.lang.upload +"</h3>";
			html += "		<button id='pc'><span class='ico ico-pc' ></span>"+gap.lang.mypc+"</button>";
			html += "		<button id='drive'><span class='ico ico-drive' ></span>"+gap.lang.drive+"</button>	";
			html += "	</div>";
			html += "	<div class='box'>";
			html += "		<h3>"+gap.lang.etc+"</h3>";
			html += "		<button id='editor'><span class='ico ico-editor' ></span>"+gap.lang.editor+"</button>";			
			if (gBody3.check_top_menu()){				
			}else{
				html += "		<button id='todo'><span class='ico ico-todo' ></span>"+gap.lang.todo+"</button>";
				html += "		<button id='videocon'><span class='ico ico-video' ></span>"+gap.lang.make_video+"</button>";
			}
			html += "	</div>";
			html += "</div>";		
			var html = "";
			html += "<div class='plus-cont' id='other_layer'>";
			html += "	<div class='flex plus-top'>";
			html += "		<div>";
			html += "			<h2>"+gap.lang.file+"</h2>";
			html += "			<div class='max150'>";
			html += "				<ul class='f_between'>";
			html += "					<li class='plus-list' id='pc'>";
			html += "						<div class='sal'><span class='ico ico-pc'></span></div>";
			html += "						<span>"+gap.lang.mypc+"</span>";
			html += "					</li>";
			html += "					<li class='plus-list' id='drive'>";
			html += "						<div class='yel'><span class='ico ico-drive'></span></div>";
			html += "						<span>"+gap.lang.drive+"</span>";
			html += "					</li>";
			html += "				</ul>";
			html += "			</div>";
			html += "		</div>";
			html += "		<div>";
			html += "			<h2>"+gap.lang.mt_go_meeting+"</h2>";
			html += "			<div class='max150'>";
			html += "				<ul class='f_between'>";
			html += "					<li class='plus-list' id='meeting'>";
			html += "						<div class='sky'><span class='ico ico-room-res'></span></div>";
			html += "						<span>"+gap.lang.metitle+"</span>";
			html += "					</li>";
			html += "					<li class='plus-list' id='videomeet'>";
			html += "						<div class='pur'><span class='ico ico-cam'></span></div>";
			html += "						<span>"+gap.lang.vt+"</span>";
			html += "					</li>";
			html += "				</ul>";
			html += "			</div>";
			html += "		</div>";
			html += "	</div>";		
			html += "	<div class='pad28' style='margin-top:20px'>";
			html += "		<h2>"+gap.lang.etc+"</h2>";
			html += "		<div>";
			html += "			<ul class='f_between' style='justify-content:space-evenly'>";
			html += "				<li class='plus-list' id='vote'>";
			html += "					<div><span class='ico ico-vote'></span></div>";
			html += "					<span>"+gap.lang.vote+"</span>";
			html += "				</li>";
			html += "				<li class='plus-list' id='todo'>";
			html += "					<div><span class='ico ico-work'></span></div>";
			html += "					<span>"+gap.lang.addtodo+"</span>";
			html += "				</li>";			
			//협력업체와 직급이 SC인데 팀장이 아닌 경우는 결재와 게시판 메뉴를 숨겨야 한다. 
			if (gap.is_show_org(gap.userinfo.rinfo.ky) || gap.is_sc_user(gap.userinfo.rinfo) || gap.userinfo.rinfo.ky == "10im0959"){
				html += "				<li class='plus-list' id='approval'>";
				html += "					<div><span class='ico ico-sign'></span></div>";
				html += "					<span>"+gap.lang.apr+"</span>";
				html += "				</li>";
				html += "				<li class='plus-list' id='board'>";
				html += "					<div><span class='ico ico-board'></span></div>";
				html += "					<span>"+gap.lang.bbs+"</span>";
				html += "				</li>";
			}			
			html += "				<li class='plus-list' id='editor'>";
			html += "					<div><span class='ico ico-eidt'></span></div>";
			html += "					<span>"+gap.lang.editor+"</span>";
			html += "				</li>";		
			html += "			</ul>";
			html += "		</div>";
			html += "	</div>";
			html += "</div>";		
			$("#other_btn").qtip({
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
						$("#other_layer .f_between li").on("click", function(e){					
							var id = e.currentTarget.id;
							if (id == "pc"){						
								$("#open_attach_window2").click();								
							}else if (id == "drive"){
								gBody2.drive_file_upload();
							}else if (id == "editor"){
								gBody3.show_editor();
							}else if (id == "todo"){							
								var rex = false;
								var list = gBody3.channel_plugins;
								for (var i = 0 ; i < list.length; i++){
									var plugin = list[i];
									if (plugin == "TO-DO"){
										rex = true;
									}
								}								
								
							//	if (rex){
									gTodo.compose_todo_channel();
							//	}else{
							//		gap.gAlert(gap.lang.splugin);
							//	}									
							}else if (id == "videocon"){
								gap.invite_video_chat();
							}else if (id == "vote"){
								gBody3.create_vote();
							}else if (id == "approval"){
								gBody3.show_aprv_list();
							}else if (id == "board"){
								gBody3.show_bbs_list();
							}else if (id == "videomeet"){								
								gBody3.enter_meeting(1);
							}else if (id == "meeting"){
								gBody3.enter_meeting(2);
							}							
							if (id != "editor"){
								$("#editor_close").click();   //에디터창이 띄워져 있을 경우 닫는다.
							}							
						});						
					},
					hidden : function(event, api){
						api.destroy(true);
					}
				}
			});				
		});
		
		$("#message_txt_channel").off("keypress.enter");
		$("#message_txt_channel").bind("keypress.enter", function(e){		
		
			if (e.keyCode == 13){
				var enter_opt = gap.enter_opt;		
		        if (e.keyCode == 13 && !e.shiftKey){          	
		        	if (enter_opt == "1"){
		        		gBody3.sendMessage(e);            
		        	}else if (enter_opt == "2"){
		        		//다음줄로 내려간다.    
		        		gBody3.enter_next_line(e);
		        	}
		        }           
		        if (e.keyCode == 13 && e.shiftKey) {
		        	if (enter_opt == "1"){
		        		//다음줄로 내려간다.
		        		gBody3.enter_next_line(e);
		        	}else{
		        		gBody3.sendMessage(e);  
		        	}       	
		        }
			}
		});
		$("#message_txt_channel").bind("keyup", function(e){
			if (e.keyCode == 8 || e.keyCode == 46){		// backspace or delete key
				gBody3.enter_line_control(e);
			}
		});	
		$("#open_emoticon2").off().on("click", function(){
		
			var res = gap.checkEditor();
			if (!res) return false;
			
			//채팅창에서 개인 설정 선택한 경우					
			$("#editor_close").click();			
			var html = "";
			html += "<div class='layer-emoticon' >";			
			html += "<ul class='tab-nav'>";
			html += "	<li ><h2 class='tab_emo_active' data-id='APBADAs'>K-Portal Friends</h2></a></li>";
		//	html += "	<li><h2 class='tab_emo_noactive' data-id='APFriends'>DSW Friends2</h2></a></li>";
			html += "	</ul>";			
			html += "	<button class='ico btn-article-close' id='emo_close'>닫기</button>";			
			html += "	<div class='tabcontent'>";
			html += "		<div id='APBADAs' >";
			html += "			<ul class='list-emoticon' id='emoti_dis' style='overflow:hidden'>";			
			for (var k = 1; k < 31; k++){
				html += "		<li><img src='/resource/images/emoticons/"+k+".gif' data='"+k+".gif'></li>";
			}			
			html += "			</ul>";
			html += "		</div>";
			html += "		<div id='APFriends' style='display:none'>";
			html += "			<ul class='list-emoticon' id='emoti_dis2' style='overflow:hidden'>";
			for (var kk = 1; kk < 31; kk++){
			//	html += "				<li><img src='../emoticons/" + kk + ".gif' data='"+kk+".gif' /></li>";
			}
			html += "			</ul>";
			html += "		</div>";
			html += " 	</div>";			
			html += "</div>";							
			$("#open_emoticon2").qtip({
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
							gBody3.send_emoticon_msg(fname);
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
							$("#open_emoticon2").qtip('api').hide();
						});
					},
					hidden : function(event, api){
						api.destroy(true);
					}
				}
			});				
		});		
			
		$("#ch_query").off().on("keypress",function(e){
			if (e.keyCode == 13){
				gBody3.search_enter();
			}
		});		
		$("#ch_query_btn").off().on("click", function(e){
			gBody3.search_enter();
		});	
		$("#channel_add_member").off().on("click", function(e){			
			var cinfo = gap.cur_room_search_info(gBody3.select_channel_code2);
			if (cinfo.owner.ky == gap.userinfo.rinfo.ky){
				gBody2.modify_channel(gBody3.select_channel_code2);
			}else{
				mobiscroll.toast({message:gap.lang.exppy, color:'info'});
				return false;
			}			
		});
		// Conversation 탭 화면 설정
		$("#conv_config").off().on("click", function(e){		
			var html = "";
			html += "<article class='right-area' style='width:240px;'>"
			html += "<div class='setting' style='padding-top:10px;'>";
			html += "	<h2>"+gap.lang.userConfig+"</h2>";
			html += "	<button class='ico btn-right-close' style='top:10px;' id='conv_config_close'>닫기</button>";			
			html += "	<div class='set-language' style='margin-top:20px;'>";
			html += "		<h4>"+gap.lang.prevent_auto_scrolling+"</h4>";
			html += "		<div class='radio'>";
			html += "			<label>";
			html += "				<input name='prevent_auto_scrolling' class='with-gap' type='radio' value='1'" + (gBody3.prevent_auto_scrolling == "1" ? " checked" : "") + ">";
			html += "				<span>"+gap.lang.use+"</span>";
			html += "			</label>";
			html += "		</div>";
			html += "		<div class='radio'>";
			html += "			<label>";
			html += "				<input name='prevent_auto_scrolling' class='with-gap' type='radio' value='2'" + (gBody3.prevent_auto_scrolling == "2" ? " checked" : "") + ">";
			html += "				<span>"+gap.lang.not_used+"</span>";
			html += "			</label>";
			html += "		</div>";
			html += "	</div>";			
			html += "	<div class='set-language' style='margin-top:20px;'>";
			html += "		<h4>"+gap.lang.collapse_reply+"</h4>";
			html += "		<div class='radio'>";
			html += "			<label>";
			html += "				<input name='collapse_reply' class='with-gap' type='radio' value='1'" + (gBody3.collapse_reply == "1" ? " checked" : "") + ">";
			html += "				<span>"+gap.lang.use+"</span>";
			html += "			</label>";
			html += "		</div>";
			html += "		<div class='radio'>";
			html += "			<label>";
			html += "				<input name='collapse_reply' class='with-gap' type='radio' value='2'" + (gBody3.collapse_reply == "2" ? " checked" : "") + ">";
			html += "				<span>"+gap.lang.not_used+"</span>";
			html += "			</label>";
			html += "		</div>";
			html += "	</div>";			
			html += "	<div class='set-language' style='margin-top:20px;'>";
			html += "		<h4>"+gap.lang.editor_title+"</h4>";
			html += "		<div class='radio'>";
			html += "			<label>";
			html += "				<input name='collapse_editor' class='with-gap' type='radio' value='1'" + (gBody3.collapse_editor == "1" ? " checked" : "") + ">";
			html += "				<span>"+gap.lang.use+"</span>";
			html += "			</label>";
			html += "		</div>";
			html += "		<div class='radio'>";
			html += "			<label>";
			html += "				<input name='collapse_editor' class='with-gap' type='radio' value='2'" + (gBody3.collapse_editor == "2" ? " checked" : "") + ">";
			html += "				<span>"+gap.lang.not_used+"</span>";
			html += "			</label>";
			html += "		</div>";
			html += "	</div>";			
			html += "	<div class='set-language' style='margin-top:20px;'>";
			html += "		<h4>"+gap.lang.post_view_type+"</h4>";
			html += "		<div class='radio'>";
			html += "			<label>";
			html += "				<input name='post_view_type' class='with-gap' type='radio' value='1'" + (gBody3.post_view_type == "1" ? " checked" : "") + ">";
			html += "				<span>"+gap.lang.by_modified_date+"</span>";
			html += "			</label>";
			html += "		</div>";
			html += "		<div class='radio'>";
			html += "			<label>";
			html += "				<input name='post_view_type' class='with-gap' type='radio' value='2'" + (gBody3.post_view_type == "2" ? " checked" : "") + ">";
			html += "				<span>"+gap.lang.by_registration_date+"</span>";
			html += "			</label>";
			html += "		</div>";	
			html += "	</div>";			
			html += "	<div class='set-language' style='margin-top:20px;'>";
			html += "		<h4>"+gap.lang.push_noti+"</h4>";
			html += "		<div class='radio'>";
			html += "			<label>";
			html += "				<input name='push_receive' class='with-gap' type='radio' value='1'" + (gBody3.push_receive == "1" ? " checked" : "") + ">";
			html += "				<span>"+gap.lang.receive+"</span>";
			html += "			</label>";
			html += "		</div>";
			html += "		<div class='radio'>";
			html += "			<label>";
			html += "				<input name='push_receive' class='with-gap' type='radio' value='2'" + (gBody3.push_receive == "2" ? " checked" : "") + ">";
			html += "				<span>"+gap.lang.do_not_receive+"</span>";
			html += "			</label>";
			html += "		</div>";	
			html += "	</div>";			
			html += "</div>";
			html += "</article>";							
			$("#conv_config").qtip({
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
						$("#conv_config_close").on("click", function(e){
						//	gBody3.save_channel_option();
							api.destroy(true);
						});						
						$("[name=prevent_auto_scrolling]").on("click", function(){
							gBody3.prevent_auto_scrolling = $(this).val();
							gBody3.save_channel_option(false);
						//	localStorage.setItem('prevent_auto_scrolling', $(this).val());
						});						
						$("[name=collapse_reply]").on("click", function(){							
							gBody3.collapse_reply = $(this).val();
							gBody3.save_channel_option(false);
							if (gBody3.collapse_reply == "2"){
								//댓글 접기 사용 안함
								$(".btn-reply-expand").click();
							}else{
								//댓글 자동 접기 사용
								$(".btn-reply-fold").click();								
							}
						});						
						$("[name=collapse_editor]").on("click", function(){							
							gBody3.collapse_editor = $(this).val();
							gBody3.save_channel_option(false);
							if (gBody3.collapse_editor == "2"){
								//에디터 접기 사용 안함
								$(".btn-editor-expand").click();
							}else{
								//에디터 자동 접기 사용
								$(".fold-btns.editor").click();
								$(".fold-btns.editor").css("display","inline-block");							
							}
						});						
						$("[name=post_view_type]").on("click", function(){
							gBody3.post_view_type = $(this).val();
							gBody3.save_channel_option(false);
							$("#channel_list").empty();
							gBody3.draw_channel_list();
						});						
						$("[name=push_receive]").on("click", function(){
							gBody3.push_receive = $(this).val();
							gBody3.save_channel_option(true);
						});
					},
					hidden : function(event, api){
					//	gBody3.save_channel_option();
						api.destroy(true);
					}
				}
			});
		});
		$("#header_mention").off().on("click", function(e){	
			
			var res = gap.checkEditor();
			if (!res) return false;
			
			if ($(this).hasClass("on")){
				gap.is_mention = "F";
				$(this).removeClass("on");
			}else{
				gap.is_mention = "T";
				$(this).addClass("on");
			}			
			gBody3.bofore_data_remove();
			gBody3.start = 0;
			gBody3.islast = "F";			
			gBody3.draw_channel_list();
		});
		$("#notice_write").off().on("click", function(e){
			gap.noticeWrite();
		});
	},
	
	"save_channel_option" : function(channel_info_update){		
		var oop = gBody3.cur_opt;
		var key = "";
		if (oop == "allcontent"){
			key = "1";
		}else if (oop == "mycontent"){
			key = "2";
		}else if (oop == "sharecontent"){
			key = "3";
		}else if (oop == "allmention"){
			key = "4";
		}else{
			key = gBody3.select_channel_code;
		}		
		var surl = gap.channelserver + "/channel_options.km";
		var postData = {
		//		"email" : gap.userinfo.rinfo.em,
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
					if (channel_info_update){
						gBody2.update_channel_info();
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
	
	"channel_main_draw" : function(){
		$("#channel_main").show();
		$("#main_body").show();
		//메인 레이아웃 표시하
		gBody3.main_work_draw();
			
		//상단 읽지 않은 업무방 리스트 표시하기
		gBody3.channel_main_top_draw();
	
		//가운데 업무 내역 그래프 그리
		year = moment().year();
		gBody3.channel_work_main(year, gap.userinfo.rinfo.ky, "all");
		
		//하단에 업무 실제 내역 표시하기
		
		
	},
	
	"main_work_draw" : function(){
		//읽지 않은 업무방 표시하기
		var user_info = gap.user_check(gap.userinfo.rinfo);
		gBody3.select_main_user_ky = user_info.ky;
	
		var html = "";
		
		html = "<div id='work_room_container'>" +
		'<div id="content_work_room" class="work_content">' +
			
			/*'<div id="wm_content_top" class="content_top">' +
			'</div>' +*/
			'<div id="wm_content_mid" class="content_mid">' +
				'<h4 class="content_top_title">'+gap.lang.va157+'</h4>' +
				'<div class="content_mid_top_wrap">' +
					'<div class="emp_info_box_wrap">' +
						'<div class="emp_info_box">' + 
							'<div class="info_wrap" id="select_user_area">' +
								'<div class="emp_img" style="background:url('+user_info.user_img_url+') center center / cover no-repeat"></div>' +
								'<div class="emp_info_txt">'+user_info.disp_user_info+'</div>' +
							'</div>' +
							'<input type="hidden" id="years_datepicker">' +
							'<div id="btn_years_datepicker_open" class="years_wrap">' +
								'<div><span id="years_date">' + new Date().getFullYear() + '</span><span>년</span></div>' +
								'<span class="btn_ico"></span>' +
							'</div>'+ 
						'</div>' +
					'</div>' +
					'<div class="emp_search_box">' + 
						'<input type="text" class="input_emp_search" placeholder="'+gap.lang.manu3+'" id="search_user_work_main" autocomplete="off">' +
						'<button type="button" class="btn_my_work_graph" id="my_btn" style="display:none"><span>MY</span></button>' +
						'<button type="button" class="emp_search_btn"><span class="search_ico"></span></button>' +
					'</div>' +
				'</div>' +
				'<div class="graph_box_wrap">' +
					'<div class="graph_box">' +
						'<div class="graph_box_title_box">' +
							'<div class="graph_box_title_wrap">' +
								'<div class="graph_box_title_txt">'+gap.lang.va158+'</div>' +
							'</div>' +
							'<div class="work_legend_box_wrap">' +
								'<div class="work_legend_box"><span class="work_legend_line complete"></span><span>'+gap.lang.va162+'</span></div>' +
								'<div class="work_legend_box"><span class="work_legend_line request"></span><span>'+gap.lang.va163+'</span></div>' +
							'</div>' +
						'</div>' +
						'<canvas id="monthly_graph" class="graph" style="height: 220px; max-height:220px; width:100%">' +
					'</div>' +
					'<div class="graph_box">' +
						'<div class="graph_box_title_box">' +
							'<div class="graph_box_title_wrap">' +
								'<div class="graph_box_title_txt">'+gap.lang.va159+'</div>' +
							'</div>' +
						'</div>' +
						'<canvas id="by_priority_graph" class="graph" style="height: 220px; max-height:220px; width:100%">' +
					'</div>' +
				'</div>' +
			'</div>' +
			
			'<div id="wm_content_bot" class="content_bot">' +
				'<div class="work_tab_box">' + 
					'<li id="my_task_tab_li" class="work_tab_li active" data-code="my_task">' +
						'<span>'+gap.lang.ingwork+'</span>' + 
						/*'<div class="count_wrap">' +
							'<span>(</span>' +
								'<span id="my_task_count"></span>' + 
							'<span>)</span>' +
						'</div>' +*/
					'</li>' +
					'<li id="delg_task_tab_li" class="work_tab_li" data-code="delg_task">' + 
						'<span>'+gap.lang.ingwork2+'</span>' +
						/*'<div class="count_wrap">' +
							'<span>(</span>' +
								'<span id="delg_task_count"></span>' +
							'<span>)</span>' +
						'</div>' +*/
					'</li>' +
					'<li id="ref_task_tab_li" class="work_tab_li" data-code="ref_task">' + 
						'<span>'+gap.lang.va160+'</span>' + 
						/*'<div class="count_wrap">' +
							'<span>(</span>' +
								'<span id="ref_task_count"></span>' +
							'<span>)</span>' +
						'</div>' +*/
					'</li>' +
					'<span class="indicator_bar"></span>' +
				'</div>' +
				'<div class="work_wrap"></div>' +
			'</div>' +
			'</div>' +
			'<div id="unconfirm_list_box">' +
				'<button type="button" id="toggle_unconfirm_list" class="btn_toggle_unconfirm_list"><span class="arrow_img"></span></button>' + 
				'<div class="inner">' +
					'<h4 class="content_top_title">'+gap.lang.va161+'</h4>' +
					'<div class="content_top_box_wrap" id="content_main_top_work"></div>' +
				'</div>' +
			'</div>' +
		'</div>';
		
		$("#channel_main").css("width", "100%");
		$("#channel_main").html(html);
		
		$("#my_btn").off().on("click", function(e){
			var info = gap.userinfo.rinfo;
			gBody3.select_main_user_ky = info.ky;
			var year = moment().year();
			gBody3.channel_work_main(year, info.ky, "search");
			
			var sel_user = gap.user_check(info);
			//현재 선택된 사용자 정보 변경하기
			
			$("#select_user_area .emp_img").css("background", "url("+sel_user.user_img_url+") center center / cover no-repeat");
			$("#select_user_area .emp_info_txt").html(sel_user.disp_user_info);
			
			$("#search_user_work_main").val("");
			$(e.currentTarget).hide();
		});
		
		$("#toggle_unconfirm_list").off().on("click", function(){
			$(this).toggleClass("rotate");
			$("#unconfirm_list_box").toggleClass("slide");
			$("#content_work_room").toggleClass("expand");
		});
		
		$("#search_user_work_main").bind("keypress", function(e){
			if (e.keyCode == 13){				
				var query = $(e.currentTarget).val();
				if (query.trim() == ""){
					mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
					return false;
				}	
				gsn.requestSearch('', query, function(sel_data){
					for (var i = 0 ; i < sel_data.length; i++){
												
						var info = sel_data[i];
						gBody3.select_main_user_ky = info.ky;
						
						if (info.ky != gap.userinfo.rinfo.ky){
							$("#my_btn").show();
						}
						
						var year = years_datepicker._tempValueText;
						gBody3.channel_work_main(year, info.ky, "search");
						
						var sel_user = gap.user_check(info);
						//현재 선택된 사용자 정보 변경하기
						
						$("#select_user_area .emp_img").css("background", "url("+sel_user.user_img_url+") center center / cover no-repeat");
						$("#select_user_area .emp_info_txt").html(sel_user.disp_user_info);
						
						$("#search_user_work_main").val("");								
					}
				});
			}
		});
		
		$(".search_ico").off().on("click", function(e){
			var e = $.Event("keypress");
			e.keyCode = 13;
			$("#search_user_work_main").trigger(e);
		});
		
		
		/*** 업무방 연도별 데이트피커 표시 ***/
		var years_datepicker = $("#years_datepicker").mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			touchUi: true,
			themeVariant : 'light',
			controls: ['calendar'],
			dateFormat: 'YYYY',
			display: "anchored", /// anchor의 위치에 달력을 띄운다.
			anchor: $("#btn_years_datepicker_open")[0],
			onChange: function (event, inst) {
				$("#years_date").html(event.valueText);
				gBody3.channel_work_main(event.valueText, gap.userinfo.rinfo.ky, "none");
			}
		}).mobiscroll('getInst');
		
		$("#btn_years_datepicker_open").off().on("click", function(){
			years_datepicker.open();
			return false;
		});
		/*** 업무방 연도별 데이트피커 표시 ***/
	},
	
	"channel_main_top_draw" : function(){
		var show_member = 3; // 보여질 인원
		var overlap_width = 20; // 겹쳐지는 너비 (px)
		
		var url = gap.channelserver + "/channel_info_unread_info.km";
		var data = JSON.stringify({
			"email" : gap.userinfo.rinfo.ky
		});
		
		var html = "";
		gap.ajaxCall(url, data, function(res){
			if (res.result.length > 0){
				for (var k = 0 ; k < res.result.length; k++){
					var item = res.result[k];
					
					var total_member = item.member.length; // 총 인원					
					var owner = gap.user_check(item.owner);		
					
					var id = item.ch_code;			
					
					html += "<div class='content_top_box' data-id='"+id+"'>";
					html += " 	<div class='content_top_box_title_wrap'>";
					html += "		<span class='group_ico'></span>";
					html += "		<span class='content_tob_box_title'>"+item.ch_name+"</span>";
					html += "	</div>";
					html += "	<div class='content_top_box_detail_wrap'>";
					html += "		<div class='creator_box'>";
					
					var imgpath = owner.user_img_url;					
					html += "			<div class='creator_img' style='background:url("+imgpath+") center center / cover no-repeat'></div>";
					html += "			<div class='creator_info_box'>";
					html += "				<div class='creator_info'>";
					html += "					<span class='creator_name'>"+owner.disp_name_info+"</span>";
					html += "				</div>";
					
					html += "				<span class='create_date'>Data : "+gap.convertGMTLocalDateTime_new_day2(item.lastupdate)+"</span>";
					html += "			</div>";
					html += "		</div>";
					html += "		<div class='members_wrap'>";
					
					for(var i = 0; i < total_member; i++){
						var member_info = gap.user_check(item.member[i]);
						var img_url = member_info.user_img_url;
						if (total_member < show_member) {
							html += "<div class='member_img' style='transform: translate(" + overlap_width * i + "px, -50%); background-image: url("+img_url+");'></div>";
						}
						if (total_member > show_member) { // 보여지는 멤버이미지의 최대 개수보다 멤버가 많을 경우
							if(i < show_member){
								html += "<div class='member_img' style='transform: translate(" + overlap_width * i + "px, -50%); background-image: url("+img_url+");'></div>";
							}
							if(i === show_member){
								html += '<div class="member_more" style="transform: translate(' + overlap_width * i + 'px, -50%);"><span>+' + (total_member - show_member) + '</span></div>';
								break;
							}
						}
					}
					html += "		</div>";
					html += "	</div>";
					html += "</div>";
				}
				
			} else {
				// 미확인 업무방이 없을 때
				html += "<div class='empty_msg'>";
				html += "	<span class='empty_ico'></span>";
				html += "	<span>현재 확인이 필요한 업무방이 없습니다.</span>";
				html += "</div>";
			}
			
			$("#content_main_top_work").html(html);
			
			if (res.result.length == 0){

				$("#toggle_unconfirm_list").toggleClass("rotate");
				$("#unconfirm_list_box").toggleClass("slide");
				$("#content_work_room").toggleClass("expand");
			}
			
			$(".content_top_box").hover(
				function(){
					$(this).addClass("select");
				},
				function(){
					$(this).removeClass("select")
				}
			);	
			
			$(".content_top_box").off().on("click", function(e){
				
				var res = gap.checkEditor();
				if (!res) return false;
				
				//Plugin 실행후 다시 Box UI로 돌아가는 함수 호출
				gBody3.backto_box_layout();
				//////////////////////////////////////
				//gBody2.click_oob = e;

				var id = $(e.currentTarget).data("id");
				gBody2.show_channel_data(id);	
			});	
						
						
		});		
	},
	
	"channel_work_main" : function(year, ky, opt){
		if (opt == "search"){
			//탭 클릭 화면을 초기화 한다. 다른 탭에 있을때 사용자 검색을 하면 처음 탭으로 이동해야 한다. 
			var first = $("#content_work_room .work_tab_li").get(0);
			$("#content_work_room .work_tab_li").siblings().removeClass("active");			
			$(first).addClass("active");			
			/// indicator 이동에 사용되는 변수
			var idx = $("#content_work_room .work_tab_li.active").index();			
			$("#content_work_room .indicator_bar").css({
				"left": $(first).width() * idx
			});			
		}
		
		var url = gap.channelserver + "/channel_main_year_info.km";
	
		var data = JSON.stringify({
			"year" : parseInt(year),
			"ky" : ky
		});
		
		gap.ajaxCall(url, data, function(res){
			//gBody3.channel_main_draw_real(res.data, opt);
			
			//월별 처리건수 그래프 , 처리한 우선순위 건수 그래프 그리기
			gBody3.workroom_graph_month(res.data);
			
			//나에게 할당된 업무 관련 그래프 그리기
			gBody3.workroom_graph_releate("my_task");
			
			
		})
	},
	
	"workroom_graph_releate" : function(opt){
		
		//opt : my_task (나에게 할당된 업무) delg_task (내가 지시한 업무) ref_task (내가 참조로 들어간 업무)
			
		var url = gap.channelserver + "/api/todo/my_receive_work.km";		
		if (opt == "delg_task"){
			//내가 지시한 업무
			url = gap.channelserver + "/api/todo/my_asign_work.km";
		}else if (opt == "ref_task"){
			//내가 참조인 업무
			url = gap.channelserver + "/api/toto/my_asign_work.km";
		}
		
		var data = JSON.stringify({
			"ky" : gBody3.select_main_user_ky
		});
		gap.ajaxCall(url, data, function(res){
			
			var data = "";
			if (opt == "ref_task"){
				data = res.data.ref;	
			}else{
				data = res.data.list;
			}
			
			var html = "";
			html += "<div class='work_list_box_wrap'>"; //이 안에 담당자별 업무목록이 있어야 간격 40px
			html += "	<div class='graph_box'><canvas id='workroom_todo_graph''></div>";			
			html += "		<div class='work_list_box'>";	
				
		//	var thead = ["업무명", "상태", "담당자", "시작일", "마감일", "우선순위", "진행률", "파일"];
			html += "<div class='work_table'>";
			html += "<div class='thead'>";			
			html += "<div class='thead_td'>"+gap.lang.ws_title+"</div>";
			html += "<div class='thead_td'>"+gap.lang.status+"</div>";
			if (opt == "my_task"){				
				html += "<div class='thead_td'>"+gap.lang.req_user+"</div>";
			}else{
				html += "<div class='thead_td'>"+gap.lang.users+"</div>";
			}
			
			html += "<div class='thead_td'>"+gap.lang.startdate+"</div>";
			html += "<div class='thead_td'>"+gap.lang.enddate+"</div>";
			html += "<div class='thead_td pr'>"+gap.lang.priority+"</div>";
			html += "<div class='thead_td'>"+gap.lang.todo_rate+"</div>";
			//html += "<div class='thead_td'>"+gap.lang.file+"</div>";
			html += "</div>"; //thead
			
			var s1 = 0;
			var s2 = 0;
			var s3 = 0;
			var s4 = 0;
			var s5 = 0;
				
			
			//리스트
			html += "<div class='list_ul'>";		
			var todo_count_sum = [];	
			for(var n = 0; n <  data.length; n++){
				var item = data[n];
			//	console.log(item);

				var owner_info = "";

				if (opt == "my_task"){
					owner_info = gap.user_check(item.owner);
				}else{
					owner_info = gap.user_check(item.asignee);
				}
				
				var is_delay = false;
				if (item.status != "3"){
					is_delay = gap.delay_check(item.enddate);
				}
				
				var status = "";
				var status_txt = "";
		
				var id = item._id.$oid;
				
				if (is_delay){
					if (item.status == "3"){
						status = "complete";
						status_txt = gap.lang.done;		
						s5++;			
					}else{
					//	status = "delay";
					//	status_txt = "지연";
						s4++;						
						if (item.status == "0"){
							status = "temporary";
							status_txt = gap.lang.temps;
							
						}else if (item.status == "1"){
							status = "wait";
							status_txt = gap.lang.wait;
							
						}else if (item.status == "2"){
							status = "progress";
							status_txt = gap.lang.doing;		
						}						
					}
				}else{
					if (item.status == "0"){
						status = "temporary";
						status_txt = gap.lang.temps;
						s1++;
					}else if (item.status == "1"){
						status = "wait";
						status_txt = gap.lang.wait;
						s2++;
					}else if (item.status == "2"){
						status = "progress";
						status_txt = gap.lang.doing;
						s3++;
						
					}else if (item.status == "3"){
						status = "complete";
						status_txt = gap.lang.done;	
						s5++;			
					}
				}
	
				
				var pr = "";
				var pr_txt = "";
				if (item.priority == "1"){
					pr = "emergency";
					pr_txt = gap.lang.priority1;
				}else if (item.priority == "2"){
					pr = "high";
					pr_txt = gap.lang.priority2;
				}else if (item.priority == "3"){
					pr = "medium";
					pr_txt = gap.lang.priority3;
				}else if (item.priority == "4"){
					pr = "low";
					pr_txt = gap.lang.priority4;
				}
				
				var process_percent = 0;
				var totalcount =  item.checklist.length;
				var completecount = 0;
				if (item.checklist.length > 0){
					for (var k = 0; k < item.checklist.length; k++){
						if (item.checklist[k].complete == "T"){
							completecount++;
						}
					}
					process_percent = parseInt((completecount / totalcount) * 100, 10);
				}		
				if (is_delay){
					html += "<div class='list_tr deadline_work' data-id='"+id+"'>";
				}else{
					html += "<div class='list_tr' data-id='"+id+"'>";					
				}
				
				
				html += 	"<div class='list_td'><div class='td_inner'>";
				if (is_delay){
					html += 		"<span class='work_name' style='color:red'>" + item.title + "</span>";
				}else{
					html += 		"<span class='work_name' >" + item.title + "</span>";
				}
				html += "		<div class='ico_box_wrap'>";
				html += "			<div class='ico_box'>";
				html += "				<span class='comment_img'></span><span>" + item.reply_count + "</span>";
				html += "			</div>";
				html += "			<div class='ico_box'>";
				html += "				<span class='file_img'></span><span class='count_file'>" + item.file_count + "</span>";
				html += "			</div>";
				html += "		</div>";
				
				html += 	"</div></div>";
				
				html += 	"<div class='list_td'><div class='td_inner'><span class='work_state " + status + "'>" + status_txt + "</span></div></div>";
				html += 	"<div class='list_td'><div class='td_inner'><span class='profile_img' style='background-image: url(" + owner_info.user_img_url + ")'></span></div></div>";
				html += 	"<div class='list_td'><div class='td_inner'><span class='start_date'>" + gap.convertGMTLocalDateTime_new_day2(item.startdate) + "</span></div></div>";
				html += 	"<div class='list_td'><div class='td_inner'><span class='deadline_date'>" + gap.convertGMTLocalDateTime_new_day2(item.enddate) + "</span></div></div>";
				html += 	"<div class='list_td pr' title='" + pr_txt + "'><div class='td_inner'><span class='work_priority " + pr + "'></span></div></div>";
				//html += 	"<div class='list_td'><div class='td_inner'><span class='work_priority " + pr + "'></span><span>" + pr_txt + "</span></div></div>";
				html += 	"<div class='list_td' title='" + process_percent + "%'><div class='td_inner progress_rate_wrap'><span class='progress_rate_bar'><span class='progress_rate' data-rate='" + process_percent + "'></span></span></div></div>";
				//html += 	"<div class='list_td'><div class='td_inner progress_rate_wrap'><span class='progress_rate_bar'><span class='progress_rate'></span></span><span class='progress_rate_txt'>" + process_percent + "%</span></div></div>";
				//html += 	"<div class='list_td'><div class='td_inner'><span class='file_img'></span><span class='count_file'>" + item.file_count + "</span></div></div>";
				html += "</div>";
			}
			
		//	todo_count_sum.push(s1);
			todo_count_sum.push(s2);
			todo_count_sum.push(s3);
			todo_count_sum.push(s4);
			todo_count_sum.push(s5);
			
			html += "</div>"; //list_ul			
			html += "</div>"; 
			html += "</div>"; //work_list_box			
			html += "</div>";	
			
			//업무방에서 보여질 콘텐츠
	
			$("#wm_content_bot .work_wrap").empty();
			$("#wm_content_bot .work_wrap").append(html);					
			
			
			var show_type = "";
			show_type = "content_work_room";
		
			//업무 진행률 바 애니메이션
			for(var i = 0; i < $("#" + show_type + " .progress_rate").length; i++){
				$("#" + show_type + " .progress_rate").eq(i).animate({
					"width": parseInt($("#" + show_type + " .progress_rate").eq(i).data("rate")) + "%"
				});
			}
			
			//오늘날짜(YYYY-MM-DD형식)
			var today = new Date().getFullYear() + "-" + gBody3.addZero(new Date().getMonth()+1) + "-" + gBody3.addZero(new Date().getDate());
			
			//업무 마감일 체크
		//	for(var u = 0; u < $(".work_list_box .list_tr").length; u++){
		//		if( $(".work_list_box .deadline_date").eq(u).text() === today){
		//			$(".work_list_box .deadline_date").eq(u).closest(".list_tr").addClass("deadline_work");
		//		}
		//	}
			
			$(".list_tr").off().on("click", function(e){
				var id = $(e.currentTarget).data("id");
				gTodo.compose_layer(id);
			});
			
			
			//도넛 그래프 그리기
			gBody3.workroom_graph_todo(todo_count_sum, opt);	
			
		});
		
		
		$("#content_work_room .content_top_box").off().on("click", function(){
			$(this).siblings().removeClass("select");
			$(this).addClass("select");
		});
		
		$("#content_work_room .work_tab_li").off().on("click", function(e){
			
			$(this).siblings().removeClass("active");
			$(this).addClass("active");
			
			/// indicator 이동에 사용되는 변수
			var idx = $("#content_work_room .work_tab_li.active").index();
			var code = e.currentTarget.dataset.code; /// 업무 코드
			
			$("#content_work_room .indicator_bar").css({
				"left": $(this).width() * idx
			});
			
			gBody3.workroom_graph_releate(code);
			
			
		});
	},
	
	
	"workroom_graph_month" : function(info){
		var month = [];
		
		for(var i = 0; i < 12; i++){
			month.push(i+1 + "월");
		}
		
		//info에 p1 : 내가 처리한 업무 , p2 : 내가 지시한 업무, p3 : 우선순위 그룹핑
		
		var data1 = [0,0,0,0,0,0,0,0,0,0,0,0]
		for (var p1 = 0 ; p1 < info.p1.length ; p1++){
			let itm = info.p1[p1];
			let month = parseInt(itm.month) - 1;
			data1[month] = itm.count
		}
		
		
		var data2 = [0,0,0,0,0,0,0,0,0,0,0,0]
		for (var p2 = 0 ; p2 < info.p2.length ; p2++){
			let itm = info.p2[p2];
			let month = parseInt(itm.month) - 1;
			data2[month] = itm.count
		}
		
		let data3 = [0,0,0,0,0]
		for (var p3 = 0 ; p3 < info.p3.length ; p3++){
			let itm = info.p3[p3];
			let priority = parseInt(itm.priority) - 1;
			data3[priority] = itm.count
		}
		
		var month_graph = $("#monthly_graph");
		var priority_graph = $("#by_priority_graph");
		var ctx = $("#workroom_todo_graph");
		
		//월별 업무 그래프
		var month_config = {
		    type: 'line',
		    data: {
		        labels: month,
		        datasets: [
					{
			            label: [gap.lang.va162],
			            data: data1,
			            borderColor: "#7755CD",
						pointBackgroundColor: "#7755CD",
						pointRadius: 5,
						pointBorderColor: "#fff",
						pointBorderWidth: 2
			        },
					{
			            label: [gap.lang.va163],
			            data: data2,
			            borderColor: "#1DBAA5",
						pointRadius: 5,
						pointBackgroundColor: "#1DBAA5",
						pointBorderColor: "#fff",
						pointBorderWidth: 2
					},
				]
		    },
		    options: {
				ticks: {
					display: true,
	                stepSize: 10,
                },
		        responsive: true,
		        scales: {
		            y: {
		                display: true,
		                ticks: {
							callback: function(value, index, values) {
			                    return Number(value.toFixed(0)); // 소수점을 없애고 정수로 표시
			                }
		                },
						min: 0,
						//max: 60
						pointLabels: {
				          color: 'red'
				        }
		            },
					x: {
						pointLabels: {
							color: 'red'
				        },
						grid: {
							tickColor: "#777777",							
						},
						ticks: {
							color: "000",
							font: {
								weight: 700
							}
						}
					}
		        },
				plugins: {
					legend: {
						display: false,
						
					},
				},
				layout: {
					padding: {
						top: 30,
						right: 44,
						left: 30,
						bottom: 20
					}
				}
		    }
		}
		
		//우선순위별 업무 그래프
		var priority_config = {
			 type: 'bar',
			  data: {
				  labels: [gap.lang.priority1, gap.lang.priority2, gap.lang.priority3, gap.lang.priority4, gap.lang.va164],
				  datasets: [{
					data: data3,
				    backgroundColor: [
				      '#EC2C38',
				      '#F6B046',
				      '#01BD63',
				      '#777777',
				      '#555555',
				    ],
					barThickness: 20,
				    borderWidth: 1
				  }]
			  },
			  options: {
				stepSize: 10,
				layout: {
					padding: {
						top: 30,
						right: 44,
						left: 30,
						bottom: 18
					}
				},
				plugins: {
					legend: {
						display: false,
					},
				},
			    scales: {
					x: {
						grid: {
							tickColor: "#777777",							
						},
						ticks: {
							color: "000",
							font: {
								weight: 700
							}
						}
					},
					y: {
						min: 0
					}
			    }
			  },
		}
		
		
		var chart1 = Chart.getChart(month_graph);
		if (chart1){
			chart1.data.datasets = month_config.data.datasets;
			chart1.update();
		}else{
			var chart1 = new Chart(month_graph, month_config);
		}
		
		var chart2 = Chart.getChart(priority_graph);
		if (chart2){
			chart2.data.datasets = priority_config.data.datasets;
			chart2.update();
		}else{
			var chart2 = new Chart(priority_graph, priority_config);
		}
	},
	
	"workroom_graph_todo" : function(info, code){

		var data_arr = info;
		
		//그래프 텍스트
		if(code === "my_task"){
			graph_txt = gap.lang.ingwork;
		}
		if(code === "delg_task"){
			graph_txt = gap.lang.ingwork2;	
		}
		if(code === "ref_task"){
			graph_txt = gap.lang.va160;	
		}
		
		var total = 0;
		
		//할일 
		for(var i = 0; i < data_arr.length; i++){
			total += data_arr[i];
		}
		
		var innerLabel = {
			id: 'innerLabel',
			afterDatasetDraw(chart, args, pluginOptions) {
				const { ctx } = chart;
				const meta = args.meta;
				const xCoor = meta.data[0].x;
		      	const yCoor = meta.data[0].y;
		      	ctx.save();
		      	ctx.textAlign = 'center';
				ctx.font = 'bold 20px Pretendard';
		      	ctx.fillText(graph_txt, xCoor, yCoor - 10);
			  	ctx.fillText(total, xCoor, yCoor + 25);
		      	ctx.restore();
			},
		};
		
		var config = {
            type: 'doughnut',
            data: {
                labels: [					
                    gap.lang.wait,
                    gap.lang.doing,
                    gap.lang.delay,
                    gap.lang.done
                ],
                datasets: [{
                    label: 'label',
                    data: data_arr,
                    backgroundColor: [						
                        '#F6C833',
                        '#1DBAA5',
                        '#F22889',
                        '#7755CD'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4,
                }]
            },
            options: {
				responsive: false,
	 			maintainAspectRatio: false,
                scales: {
                    x: {
                        border: false,
                        grid: {
                            color: "transparent",
                            borderColor: "transparent"
                        },
                        ticks: {
                            display: false
                        },
                    },
                    y: {
                        border: false,
                        grid: {
                            color: "transparent",
                            borderColor: "transparent"
                        },
                        ticks: {
                            display: false
                        },
                        beginAtZero: true,
                    }
                },
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
	                        padding: 15,
                            boxWidth: 8,
                            boxHeight: 8,
							color: "#555555",
                            font: {
								family: "Pretendard",
                                size: 15,
								weight: "500",
								lineHeight: 15
                            },
                            usePointStyle: true,
                            pointStyle: "circle",
                        }
                    }
	                },
					/** 도넛 반지름, 두께 관련 옵션 **/
	                cutout: 95,
	                radius: 100,
					/** 도넛 반지름, 두께 관련 옵션 **/

            },
			plugins: [innerLabel]
        }

		var ctx = $("#workroom_todo_graph");	
		var chart3 = Chart.getChart(ctx);
		if (chart3){
			chart3.data.datasets = config.data.datasets;
			chart3.update();
		}else{
			var chart3 = new Chart(ctx, config);
		}
	},
	
	
	//업무방 그래프 그리는 함수
	"workroom_graph_draw": function(info, graph_target, code){
		
		var month = [];
		
		for(var i = 0; i < 12; i++){
			month.push(i+1 + "월");
		}
		
		//info에 p1 : 내가 처리한 업무 , p2 : 내가 지시한 업무, p3 : 우선순위 그룹핑
		
		var data1 = [0,0,0,0,0,0,0,0,0,0,0,0]
		for (var p1 = 0 ; p1 < info.p1.length ; p1++){
			let itm = info.p1[p1];
			let month = parseInt(itm.month) - 1;
			data1[month] = itm.count
		}
		
		
		var data2 = [0,0,0,0,0,0,0,0,0,0,0,0]
		for (var p2 = 0 ; p2 < info.p2.length ; p2++){
			let itm = info.p2[p2];
			let month = parseInt(itm.month) - 1;
			data2[month] = itm.count
		}
		
		let data3 = [0,0,0,0,0]
		for (var p3 = 0 ; p3 < info.p3.length ; p3++){
			let itm = info.p3[p3];
			let priority = parseInt(itm.priority) - 1;
			data3[priority] = itm.count
		}
		
		var month_graph = $("#monthly_graph");
		var priority_graph = $("#by_priority_graph");
		var ctx = $("#workroom_todo_graph");
		
		//월별 업무 그래프
		var month_config = {
		    type: 'line',
		    data: {
		        labels: month,
		        datasets: [
					{
			            label: [gap.lang.va162],
			            data: data1,
			            borderColor: "#7755CD",
						pointBackgroundColor: "#7755CD",
						pointRadius: 5,
						pointBorderColor: "#fff",
						pointBorderWidth: 2
			        },
					{
			            label: [gap.lang.va163],
			            data: data2,
			            borderColor: "#1DBAA5",
						pointRadius: 5,
						pointBackgroundColor: "#1DBAA5",
						pointBorderColor: "#fff",
						pointBorderWidth: 2
					},
				]
		    },
		    options: {
				ticks: {
					display: true,
	                stepSize: 10,
                },
		        responsive: true,
		        scales: {
		            y: {
		                display: true,
		                ticks: {
							callback: function(value, index, values) {
			                    return Number(value.toFixed(0)); // 소수점을 없애고 정수로 표시
			                }
		                },
						min: 0,
						//max: 60
						pointLabels: {
				          color: 'red'
				        }
		            },
					x: {
						pointLabels: {
							color: 'red'
				        },
						grid: {
							tickColor: "#777777",							
						},
						ticks: {
							color: "000",
							font: {
								weight: 700
							}
						}
					}
		        },
				plugins: {
					legend: {
						display: false,
						
					},
				},
				layout: {
					padding: {
						top: 30,
						right: 44,
						left: 30,
						bottom: 20
					}
				}
		    }
		}
		
		//우선순위별 업무 그래프
		var priority_config = {
			 type: 'bar',
			  data: {
				  labels: [gap.lang.priority1, gap.lang.priority2, gap.lang.priority3, gap.lang.priority4, gap.lang.va164],
				  datasets: [{
					data: data3,
				    backgroundColor: [
				      '#EC2C38',
				      '#F6B046',
				      '#01BD63',
				      '#777777',
				      '#555555',
				    ],
					barThickness: 20,
				    borderWidth: 1
				  }]
			  },
			  options: {
				stepSize: 10,
				layout: {
					padding: {
						top: 30,
						right: 44,
						left: 30,
						bottom: 18
					}
				},
				responsive: false,
				plugins: {
					legend: {
						display: false,
					},
				},
			    scales: {
					x: {
						grid: {
							tickColor: "#777777",							
						},
						ticks: {
							color: "000",
							font: {
								weight: 700
							}
						}
					},
					y: {
						min: 0
					}
			    }
			  },
		}
		
		var data_arr = [1, 3, 1];
		
		//그래프 텍스트
		if(code === "my_task" || graph_target === "all"){
			graph_txt = gap.lang.ingwork;
		}
		if(code === "delg_task"){
			graph_txt = gap.lang.ingwork2;	
		}
		if(code === "ref_task"){
			graph_txt = gap.lang.va160;	
		}
		
		var total = 0;
		
		//할일 
		for(var i = 0; i < data_arr.length; i++){
			total += data_arr[i];
		}
		
		var innerLabel = {
			id: 'innerLabel',
			afterDatasetDraw(chart, args, pluginOptions) {
				const { ctx } = chart;
				const meta = args.meta;
				const xCoor = meta.data[0].x;
		      	const yCoor = meta.data[0].y;
		      	ctx.save();
		      	ctx.textAlign = 'center';
				ctx.font = 'bold 20px Pretendard';
		      	ctx.fillText(graph_txt, xCoor, yCoor - 10);
			  	ctx.fillText(total, xCoor, yCoor + 25);
		      	ctx.restore();
			},
		};
		
		var config = {
            type: 'doughnut',
            data: {
                labels: [
                    gap.lang.wait,
                    gap.lang.doing,
                    gap.lang.delay,
                    gap.lang.done
                ],
                datasets: [{
                    label: 'label',
                    data: data_arr,
                    backgroundColor: [
                        '#F6C833',
                        '#1DBAA5',
                        '#F22889',
                        '#7755CD'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4,
                }]
            },
            options: {
				responsive: false,
	 			maintainAspectRatio: false,
                scales: {
                    x: {
                        border: false,
                        grid: {
                            color: "transparent",
                            borderColor: "transparent"
                        },
                        ticks: {
                            display: false
                        },
                    },
                    y: {
                        border: false,
                        grid: {
                            color: "transparent",
                            borderColor: "transparent"
                        },
                        ticks: {
                            display: false
                        },
                        beginAtZero: true,
                    }
                },
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
	                        padding: 15,
                            boxWidth: 8,
                            boxHeight: 8,
							color: "#555555",
                            font: {
								family: "Pretendard",
                                size: 15,
								weight: "500",
								lineHeight: 15
                            },
                            usePointStyle: true,
                            pointStyle: "circle",
                        }
                    }
	                },
	                radius: 100,
	                cutout: 85,

            },
			plugins: [innerLabel]
        }

		
		var chart1 = Chart.getChart(month_graph);
		if (chart1){
			chart1.data.datasets = month_config.data.datasets;
			chart1.update();
		}else{
			var chart1 = new Chart(month_graph, month_config);
		}
		
		var chart2 = Chart.getChart(priority_graph);
		if (chart2){
			chart2.data.datasets = priority_config.data.datasets;
			chart2.update();
		}else{
			var chart2 = new Chart(priority_graph, priority_config);
		}
			
		var chart3 = Chart.getChart(ctx);
		if (chart3){
			chart3.data.datasets = config.data.datasets;
			chart3.update();
		}else{
			var chart3 = new Chart(ctx, config);
		}

	},
	
	
	/* todo_그래프 그리는 함수 */
	"todo_graph_draw": function(work_type, work_category, use_type){
		
		var ctx = "";
		//gcom.todo_graph_draw("mine", "by_manager", "workroom");
		if(use_type !== "workroom") {
			ctx = $("#todo_graph");
		} else {
			ctx = $("#workroom_todo_graph");
		}
		
		ctx = $("#todo_graph");
		var data_arr = [];
		var graph_txt = "";
		
		//그래프 텍스트
		if(work_type === "mine"){
			graph_txt = gap.lang.ingwork;
		}
		if(work_type === "others"){
			graph_txt = gap.lang.ingwork2;	
		}
		
		//그래프 데이터
		if( work_category === "by_state" && work_type === "mine" ){
			data_arr = [10, 30, 30];
		}
		if( work_category === "by_state" && work_type === "others" ){
			data_arr = [10, 40, 50];
		}
		if(work_type === "mine" && work_category === "by_manager"){
			data_arr = [10, 30, 0];
		}
		if(work_type === "others" && work_category === "by_manager"){
			data_arr = [0, 50, 50];
		}
		
		var total = 0;
		
		//할일 
		for(var i = 0; i < data_arr.length; i++){
			total += data_arr[i];
		}
		
		var innerLabel = {
			id: 'innerLabel',
			afterDatasetDraw(chart, args, pluginOptions) {
				const { ctx } = chart;
				const meta = args.meta;
				const xCoor = meta.data[0].x;
		      	const yCoor = meta.data[0].y;
		      	ctx.save();
		      	ctx.textAlign = 'center';
				ctx.font = 'bold 23px Pretendard';
		      	ctx.fillText(graph_txt, xCoor, yCoor - 10);
			  	ctx.fillText(total, xCoor, yCoor + 25);
		      	ctx.restore();
			},
		};
		
		var config = {
            type: 'doughnut',
            data: {
                labels: [
                    gap.lang.wait,
                    gap.lang.doing,
                    gap.lang.delay,
                    gap.lang.done
                ],
                datasets: [{
                    label: 'label',
                    data: data_arr,
                    backgroundColor: [
                        '#F6C833',
                        '#1DBAA5',
                        '#F22889',
                        '#7755CD'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4,
                }]
            },
            options: {
                scales: {
                    x: {
                        border: false,
                        grid: {
                            color: "transparent",
                            borderColor: "transparent"
                        },
                        ticks: {
                            display: false
                        },
                    },
                    y: {
                        border: false,
                        grid: {
                            color: "transparent",
                            borderColor: "transparent"
                        },
                        ticks: {
                            display: false
                        },
                        beginAtZero: true,
                    }
                },
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
	                        padding: 15,
                            boxWidth: 8,
                            boxHeight: 8,
							color: "#555555",
                            font: {
								family: "Pretendard",
                                size: 16,
								weight: "500",
								lineHeight: 15
                            },
                            usePointStyle: true,
                            pointStyle: "circle",
                        }
                    }
	                },
	                radius: 128,
	                cutout: 110,

            },
			plugins: [innerLabel]
        }
		
		//이미 차트가 존재하는 경우 파괴한다.
		if(ctx.data("chart") !== undefined){
			ctx.data("chart").destroy();
		}
		
		var todoChart = new Chart(ctx, config);
		
		ctx.data("chart", todoChart);
		
	},
	
	
	//숫자가 한자리 인 경우 앞에 0을 붙여주는 함수
	"addZero": function(num){
		return (num < 10 ? '0' : '') + num;
	},
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	"channel_main_draw_backup" : function(){
		
		try{			
			sel = localStorage.getItem(gap.search_cur_ky() + "_channel_main_select");
			if (typeof(sel) != "undefined" && sel != "" && sel != null){
		//		gBody3.main_sort = sel;
			}			
		}catch(e){}		
		
		//gBody3.main_sort = 2; //업데이트 날자로 변경한다.
		
		//메인을 최종 이걸로 변경한다.
		
		var surl = gap.channelserver + "/channel_info_list_search_main.km";	
		var start = "";
		var end = "";
		if (gBody3.main_start != ""){
			start = gBody3.main_start;
			end = gBody3.main_end;
		}		
		var sort = gBody3.main_sort; //1이면 생성일 순으로 2이면 최신 업데이트 순으로		
		var postData = {
				"start" : start,
				"end" : end,
				"sort" : sort,
				"query" : gBody3.main_query
			};
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",	//"json",
		//	contentType : "application/json; charset=utf-8",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},			
			success : function(__res){
				var res = __res;
				if (res.result == "OK"){					
					var list = res.data.data;					
					$("#main_body").show();
					$(".left-area").css("width", "100%");
					$("#channel_main").show();	
							
					var html = gBody3.draw_channel_main(list);
					$("#channel_main").html(html);					
					$("select").material_select();				
					if (res.data.data2 == 0){
						$("#main_ref_count").hide();
					}else{
						$("#main_ref_count").show();
						$("#main_ref_count").html("(" + res.data.data2 + ")");
					}					
					$(".btn-right-refer").off().on("click", function(e){						
						$("#channel_main").addClass("right-area");
						$("#channel_main").addClass("my-profile");
						$("#channel_aside_right").css("width", "317px");
						$("#channel_right_ul").hide();
						gBody3.draw_ref_new("T");						
					});					
					$(".btn-right-send").off().on("click", function(e){						
						$("#channel_main_right_folder").click();						
					});					
					$(".request-card").off().on("click", function(e){			
						
						var cls = $(e.target).attr("class");
						if (cls == "photo-wrap"){
							var ky = $(e.target).parent().data("ky");
							gap.showUserDetailLayer(ky);
						}else if (cls == "ico btn-more bl"){							
							$.contextMenu({
								selector : ".ico.btn-more.bl",
								autoHide : false,
								trigger : "left",
								callback : function(key, options){								
									gBody2.context_menu_call_channel_mng(key, options, $(this).parent().attr("id"));						
								},
								events : {
									hide: function (options) {
										$(this).removeClass("on");
									}
								},			
								build : function($trigger, options){								
									return {										
										items: gBody2.channel_menu_content($($trigger).parent().attr("owner"), $($trigger))
									}
								}
							});
						}else{							
							var id = $(e.currentTarget).data("key");
							gBody3.cur_opt = id;
							gBody2.show_channel_data(id, "T");		
						}						
					});					
					$.contextMenu({
						selector : ".request-card",
						autoHide : false,
						callback : function(key, options){
							gBody2.context_menu_call_channel_mng(key, options, $(this).data("key"));						
						},
						events : {
							hide: function (options) {
								$(this).removeClass("on");
							}
						},			
						build : function($trigger, options){
							return {
								items: gBody2.channel_menu_content($($trigger).data("owner"),$($trigger))
							}
						}
					});
					$("#box_main_select").off().change(function(e){
						var select = $("#box_main_select option:selected").val(); 
						gBody3.main_sort = select;						
						if (typeof(select) == "undefined"){
							return false;
						}						
						try{
							localStorage.setItem(gap.search_cur_ky() + "_channel_main_select", select);
						}catch(e){}						
						if (select != "3"){
							gBody3.main_sort = select;
							gBody3.main_start = "";
							gBody3.main_end = "";
							gBody3.main_query = "";
							gBody3.channel_main_draw();
						}else{
							//기간을 선택한 경우							
							var picker = $(this).mobiscroll().datepicker({
								locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
								controls: ['calendar'],
								select: 'range',			
								themeVariant : 'light',
								dateFormat: 'YYYY.MM.DD',	
								display: 'center',
								calendarType: 'month',	
//								startInput: '#todo_startdate',
//							    endInput: '#todo_enddate',
								pages : 2,
								touchUi: true,
								onInit: function (event, inst) {								
							    },
							    onChange : function(event, inst){
							    	if (event.value[1] != null){							    									   										
										var startdate = moment.utc(event.value[0]).format("YYYYMMDDhhmmss");
										var enddate = moment.utc(event.value[1]).format("YYYYMMDDhhmmss");
										gBody3.main_start = startdate;
										gBody3.main_end = enddate;
										gBody3.main_sort = "1";
										gBody3.main_query = "";
							    		gBody3.channel_main_draw();
							    		return false;
							    	}							  	
							    }
							}).mobiscroll('getInst');
							picker.open();							
						}					
						$("#box_main_query").val("");						
					});					
					$("#box_main_query").keypress(function(e){
						if (e.keyCode == 13){							
							gBody3.main_start = "";
							gBody3.main_end = "";
							gBody3.main_sort = "2";							
							gBody3.main_query = $(this).val();							
							gBody3.channel_main_draw();						
							$(this).val("");		
							$("#main_query_btn_close").show();
						}
					});				
					$("#main_query_btn_close").off().on("click", function(e){
						$("#main_query_btn_close").hide();
						$("#box_main_query").val("");
						gBody3.main_query = "";
						gBody3.channel_main_draw();						
					});				
					$("#channel_main_right_folder").off().on("click", function(e){						
						var cls = $(e.target).attr("class");
						if (cls.indexOf("on") > -1){
							$(this).removeClass("on");
							$("#channel_right_ul").show();
							$("#channel_chat").hide();
							$("#channel_aside_right").css("width", "38px");
						}else{
							$(this).addClass("on");
							$("#channel_main").addClass("right-area");
							$("#channel_main").addClass("my-profile");
							$("#channel_aside_right").css("width", "317px");
							$("#channel_right_ul").hide();
							gBody3.draw_ref_new();
						}						
						gma.refreshPos();
					});				
					$(".bot .team-num").off().on("click", function(e){						
						var id = $(e.currentTarget).data("key");
						var item = gap.cur_room_search_info(id);
						var owner = item.owner;						
						var html = "";
						var chatt = item.member;
						html += "<div class='layer-member' style='width:500px'>";
						html += "	<h2>"+gap.lang.chatuser+" (" + (parseInt(chatt.length)+1) + gap.lang.myung +")</h2>";
						html += "	<button class='ico btn-member-close'>닫기</button>";						
						html += "	<ul class='list-member' id='member_dis' style='overflow:hidden'>";					
						//owner를 먼저 표시한다.
						html += "<li>";
						html += "	<dl>";
						var uinfo = gap.user_check(owner);			
						html += "		<dt>"+uinfo.name+"</dt>";
						html += "		<dd>"+uinfo.dept+"</dd>";					
						html += "	</dl>";						
						var imgpath = uinfo.user_img;
						html += "	<span>"+imgpath+"</span>";
						html += "</li>";					
						var obj = "";
						obj = sorted=$(chatt).sort(gap.sortNameDesc);
						for (var k = 0; k < obj.length; k++){
							var cinfo = obj[k];
							html += "<li>";
							html += "	<dl>";								
							var uinfo2 = gap.user_check(cinfo);
							html += "		<dt>"+uinfo2.name+"</dt>";
							html += "		<dd>"+uinfo2.dept+"</dd>";			
							html += "	</dl>";
							var imgpath = uinfo2.user_img;
							html += "	<span>"+imgpath+"</span>";
							html += "</li>";						
						}			
						html += "	</ul>";
						html += "</div>";										
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
							position: {
								 viewport: $('#channel_main')
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
									});								},
								hidden : function(event, api){
									api.destroy(true);
								}
							}
						});	
						return false; 				
					});				
					gma.refreshPos();
				}			
			}
		});
	},
	
	"workroom_search" : function(query){		
		
		var surl = gap.channelserver + "/channel_info_list_search.km";
		var postData = JSON.stringify({
				"query" : query
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
				var html = "";				
				if (res.length > 0){
					for (var i = 0 ; i < res.length; i++){
						var info = res[i];
						html += "<li>";
						html += "	<div class='fold_menu_wr' data-key='"+info.ch_code+"'>";
						html += "		<span class='ico ico-person' style='top:5px;'></span>";
						html += "		<em style='font-weight:bold;padding-left:23px'>"+info.ch_name+"</em>";
						html += "	</div>";
						html += "</li>";
					}
				}							
				$("#workroom_search_result").html(html);				
				$("#workroom_search_result div").on("click", function(e){
					var id = $(e.currentTarget).data("key");
					$("#" + id).click();					
					var obj = $("#workroom_search").qtip();
					obj.destroy(true);					
				});
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	},
	
	"unread_channel_count_check_realtime" : function(select_id){		
		//실시간 변동되는 채팅룸의 건수를 계산하는 함수		
		if (gap.cur_window == "channel"){			
			//현재 채널이 폴더안에 있을 경우 체크해서  폴더에 읽지 않음 표시 갱신한다.
			var id = select_id;			
			if (typeof($("#share_channel_list") != "undefined")){
				var citem = $("#share_channel_list #" + id);				
				if (citem != "undefined"){
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
				}
			}		
			var ucnt = $("#share_channel_list span .ico-new").not(".folder-code").length;		
			gap.unread_count_check("2", ucnt);			
		}else{
			//채팅리스를 계산할 수 없는 상황인 경우는 +1해준다.
			gBody3.unread_channel_count_check();
		}
		if (gBody3.cur_window == "boxmain"){
			var text = $("#portlet_channel_"+select_id).text();
			//포틀릿 신규 메시지 도착 알림 스타일 적용 - 업무방
			$("."+select_id).css("background-color", gptl.unread_background_color);
			$("."+select_id).css("border", "2px solid #f1c4aa");
			$("."+select_id + " .top").css("border-bottom", "1px solid #ee7158");
		}
	},
	
	"channel_right_frame_close" : function(){		
		$(".left-area").css("width", "100%");							
		$("#ext_body").hide();
		$("#user_profile").hide();
		$("#chat_profile").hide();		
		$("#channel_right").hide();		
		$("#main_body").css("width", "");
	},
	
	"make_mail_url" : function(ms, mf, unid, empno, lan){
		return cdbpath + "/(agtCopyDoc)?openAgent&ms="+ms+"&mf="+mf+"&unid="+unid+"&empno=" + empno + "&lan=" + lan;
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
	

	
	"draw_channel_main" : function(list){

		var html = "";
		html += "<div class='mu_container mu_work mu_test mu_work' style='padding:25px 45px;'>";
		html += "<div class='contents scroll'>";
		html += "<div id='workro'>";
		html += "<div class='section_inner dsw_pjt_inner' style='padding-top:0px;padding-bottom:0px'>";
		html += "	<h5>"+gap.lang.channel+"</h5> ";
		html += "	<div class='pjt_h_right flex'>";
		html += "		<div class='input_box' id='main_query_field'>";
		html += "			<span class='ico ico-search'></span>";
		html += "			<input type='text' class='formInput' id='box_main_query' placeholder='"+gap.lang.input_channel_name+"'>";
		html += "			<div class='xbtn-search-close' style='display:"+(gBody3.main_query == '' ?  'none' : '')+"' id='main_query_btn_close'></div>";
		html += "		</div>";
		html += "		<div class='work-search'>";
		html += "			<div class='input-field selectbox' autocomplete='off'>";
		html += "			<div class='select-wrapper'>";
		html += "				<select class='initialized' id='box_main_select'>";
		html += "					<option value='1' + " + (gBody3.main_sort == '1' ? 'selected' : '') + ">"+gap.lang.by_registration_date+"</option>";
		html += "					<option value='2' + " + (gBody3.main_sort == '2' ? 'selected' : '') + ">"+gap.lang.u_date+"</option>";
		html += "					<option value='3' + " + (typeof(gBody3.main_sort) == 'undefined' ? 'selected' : '') + ">"+gap.lang.todo_period+"</option>";
		html += "				</select>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";
		html += "<div class='work-requested custom-scroll-row pjt_re'>";
		html += "	<div class='flex'>";
		html += "		<div class='request-card-wr'>  ";
		html += "			<div class='request-card-list custom-scroll' style='height:calc(100vh - 210px)'>";
		html += "				<ul>";
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];
			html += gBody3.draw_channel_item(item);
		}
		html += "				</ul>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";
		html += "</div>";
		html += "</div>";	
		html += "</div>";		
		html += "<aside class='work-aside meeting off' id='channel_aside_right' style=''>";
		html += "<div class='aside-narrow'>   ";
		html += "	<button class='ico btn-right-fold' id='channel_main_right_folder'>접기</button> ";
		html += "	<ul id='channel_right_ul' style='background-color:#fff'>";
		html += "		<li><button class='ico btn-right-send'>보내기</button></li>";
		if (list.length > 0){
			html += "		<li  style='font-size:12px; color:#ee7158;'><button class='ico btn-right-refer' style='margin-bottom:2px'></button><br><span id='main_ref_count'>("+list.length+")</span></li>";
		}else{
			html += "		<li ><button class='ico btn-right-refer'>참조</button></li>";
		}		
		html += "	</ul>";
		html += "</div>";		
		html += "<div id='channel_chat'>";
		html += "</div>";		
		html += "</aside>";	
		return html;		
	},
	
	"draw_channel_item" : function(obj){
		var html = "";
		html += "<li class='request-card' data-key='"+obj.ch_code+"' data-owner='"+obj.owner.ky+"'>";
		html += "	<div class='top' owner='"+obj.owner.ky+"' id='"+obj.ch_code+"'>";
		html += "		<button class='ico btn-more bl'>더보기</button>";
		html += "		<div>";	
		var dis_date = gap.change_date_default(gap.change_date_localTime_only_date(obj.GMT));
		var str = "Created";
		if (gBody3.main_sort == "2"){
			str = "Update";
			dis_date = gap.change_date_default(gap.change_date_localTime_only_date(obj.lastupdate));				
		}
		if (obj.ch_share == "Y"){
			html += "			<p class='work-staus'>"+gap.lang.unch + " ("+str+":" + dis_date +")</p>";
		}else{
			html += "			<p class='work-staus'>"+gap.lang.cch + " ("+str+":" + dis_date +")</p>";
		}		
		html += "			<p class='tit' data-key='"+obj.ch_code+"'>"+obj.ch_name+"</p>";
		html += "		</div>";
		html += "		<div class='team-mem flex'>";	
		var owner = obj.owner;
		var ckuser = gap.user_check(owner);
		html += "			<div class='team-img user' data-ky='"+owner.ky+"' >";
		html += "				<div class='photo-wrap' style='border-radius:50%; background-image:url(" + gap.person_photo_url(owner) + "),url("+gap.none_img+");'></div>";
		html += "			</div>";
		html += "			<div>";
		html += "				<p class='mem-name'>"+ckuser.name+"</p>";
		html += "				<div class='flex'>";
		html += "					<p class='team-level'>"+ckuser.jt+"</p>";		
		html += "					<p class='team-name'>"+ckuser.dept+"</p>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		html += "	<div class='bot flex'>";	
		if (typeof(obj.member) != "undefined"){
			var members = obj.member;			
			var mcnt = members.length;
			var len = 0;
			if (mcnt > 5){
				len = 5;
			}else{
				len = mcnt;
			}			
			for (var k = 0 ; k < len; k++){
				var mm = members[k];
				html += "		<div class='team-img user' data-ky='"+mm.ky+"' data-pky='"+obj.ch_code + "_" + mm.ky+"' style='width:35px; height:35px'>";
				html += "			<div class='photo-wrap' style='border-radius:50%; background-image:url(" + gap.person_photo_url(mm) + "),url("+gap.none_img+");'></div>";
				html += "		</div>";
			}
			if (mcnt > 5){
				var bnt = mcnt - 5;
				html += "		<div class='team-num' data-key='"+obj.ch_code+"'>+ "+bnt+"</div> ";
			}			
			html += "	</div>";
			html += "</li>";
		}else{
			html += "		<div class='team-img user' style='width:35px; height:35px'>";
			html += "		</div>";
		}
		return html;		
	},
	
	"main_re_draw" : function(){		
		if ($("#channel_main").css("display") != "none"){
			gBody3.channel_main_draw();
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
	"draw_ref_new" : function(opt){
		//opt가 T이면 참조가 먼저 열린다.
		var s_key = moment().date(1).startOf('month').format('YYYY-MM-DD[T00:00:00Z]'); // 타임존 때문에 데이터 안나오는 경우 없도록 시작일 -1
		var e_key = moment().date(1).endOf('month').format('YYYY-MM-DD[T23:59:59Z]'); // Mini캘린더에 뿌려지는 날짜수 +1
		gBody3.sdate = s_key;
		gBody3.edate = e_key;
		var data = JSON.stringify({
			start : gBody3.sdate,
			end : gBody3.edate,
			type : gBody3.cMain
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
				gBody3.draw_ref2(res.ref, opt);
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},	
	
	"draw_ref2" : function(list, opt){
		//채팅에서 올수 있기 때문에 해당 값을 초기화 시킨다.
		gBody3.cur_cid == "";			
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
			gBody3.send_msg_search();
		});		
		$("#search_user_msg").keypress(function(e){
			if (e.keyCode == 13){					
				gBody3.send_msg_search();
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
			         gBody3.chat_one_to_one(obj);
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
				gBody3.draw_referlist2(list);
			}else{
				$("#rmet .indicator").css("left", "0px");
				$("#mchatlist").show();
				$("#minchat").show();
				$("#ref_dis").hide();
				gBody3.draw_ref2(list);
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
}

