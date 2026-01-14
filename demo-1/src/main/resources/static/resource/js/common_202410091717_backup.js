$(document).ready(function(){
	
});

$(document).keyup(function(e) {
    if (e.keyCode === 27) {
		if ($("#btn_all_menu_layer_close").length == 1){
			$("#btn_all_menu_layer_close").click();
		}
    }
});

function gcommon(){
	_this = this;
	_this.gptserver = 'https://kgpt.kmslab.com:5004';	
	_this.topsearch_totalcount = 0;
	_this.topsearch_curcount = 0;
	_this.searchcnt = 1;
	_this.perpage = "30";
	_this.select_search_type = "";
	_this.manual_folder_id = "";	
	_this.per_page = "10";
	_this.all_page = "1";
	_this.start_skp = "";
	_this.start_page = "1";
	_this.cur_page = "1";
	_this.start_nav = "1";	
	_this.total_page_count = "";
	_this.total_data_count = "";
	_this.admin_log_query = "";
	_this.admin_log_menu = "";		
}

gcommon.prototype = {
	
	"init": function(){
	
		gcom.set_lang();
	
		call_key = "";
		gcom.menu_data_load();
	    //gcom.login_data_load();
	    gcom.area_right_draw("init");
	    gcom.event_bind();
	    gcom.portal_setting();
	
		
	},
	
	
	"chat_init" : function(){
		gcom.set_lang();
		gBody3.cur_window = "chat";
		setTimeout(function(){
			gap.LoadPage("area_content", root_path + "/page/chat.jsp"); 
		}, 300)
	},
	
	
	"portal_setting" : function(){
		//포털 시작할 때 세팅되어야 하는 정보
		//debugger;
		//_wscoket.load_buddy_list();	
	},
	
	"set_lang" : function(){
		var _lang = navigator.language || navigator.userLanguage;
		var browser_lang = ((_lang == "ko" || _lang == "ko-KR") ? "ko" : "en");		
		var lang = gap.getCookie("language");
		if (typeof(lang) == "undefined" || lang == "" || lang == "undefined" || lang == "lang"){
			userlang = browser_lang;	//"ko";
			gap.setCookie("language", userlang);			
		}else{
			userlang = lang;
		}
			
		
		gap.curLang = userlang;
		$.ajax({
			method : "get",
			url : root_path + "/resource/lang/" + userlang + ".json?open&ver=" + window.jsversion,
			dataType : "json",			
			contentType : "application/json; charset=utf-8",
			async : false,
			success : function(data){	
				gap.lang = data;	
				gap.channel_push_title = "K-PORTAL["+gap.lang.channel+"]";
				gap.drive_push_title = "K-PORTAL[Files]";
				gap.todo_push_title = "K-PORTAL["+gap.lang.ch_tab3+"]";
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	},
	
	"logout" : function(){
		var url = root_path + "/logout.do?userid="+gap.userinfo.rinfo.id;		
		$.ajax({
			"type" : "GET",
			"url" : url,
			"contentType" : "application/json; charset=utf-8",
			"success" : function(res){
				console.log(res);
				if (res.result == "OK"){					
					//도미노 인증 쿠키를 설정한다.
					gcom.delete_cookie("LtpaToken");
					gcom.delete_cookie("JSESSIONID");
					
					
					//메인 페이지로 이동한다.
					location.href = root_path + "/";
				}else{
					gap.error_alert();
				}
			},
			"error" : function(e){
				alert(e);
			}
		})
	},
	
	"delete_cookie" : function(name){
		document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
	},
	
	//전체메뉴 호출 & 그리기
	"all_menu_data_load": function(){
		var surl = root_path + "/appstore_list.km";
		var postData = {
				"start" : "0",
				"perpage" : "100",
				"query" : "",
				"admin" : ""
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
					var _list = res.data.response;
					var _html = "";
		
					_html += "<div id='all_menu_inner'class='inner'>";
					_html += "	<button type='button' id='btn_all_menu_layer_close'><span class='layer_close_img'></span></button>";
					_html += "</div>";
					$("#all_menu_layer").html(_html);
					
					var myapps = $.map(_list, function(ret, key) {
					     if (ret.category_code == "MYAPPS"){
					        return ret;
					     }
					});
					myapps = myapps.sort(SortByDateTime);
					if (myapps.length > 0){
						_html = "";
						_html += "<div class='all_menu_list_box'>";
           				_html += "	<div class='list_title_wrap'><h4 class='list_title'>" + myapps[0].category_name + "</h4></div>";
           				_html += "	<div id='" + myapps[0].category_code + "' class='menu_ul'>";
           				_html += "	</div>";
           				_html += "</div>";
						$("#all_menu_inner").append(_html);
						$.each(myapps, function(){
							var _menu = "<li id='" + this.code + "' class='menu_li'><span>" + this.menu_kr + "</span><button type='button' class='btn_open_win'></button></li>";
							$("#" + myapps[0].category_code).append(_menu);
							$("#" + this.code).data("link", (this.code == "KP_MAIL" ? this.link.replace("-maildbpath-", maildbpath) : this.link));
						});						
					}


					var workplace = $.map(_list, function(ret, key) {
					     if (ret.category_code == "WORKPLACE"){
					        return ret;
					     }
					});
					workplace = workplace.sort(SortByDateTime);
					if (workplace.length > 0){
						_html = "";
						_html += "<div class='all_menu_list_box'>";
           				_html += "	<div class='list_title_wrap'><h4 class='list_title'>" + workplace[0].category_name + "</h4></div>";
           				_html += "	<div id='" + workplace[0].category_code + "' class='menu_ul'>";
           				_html += "	</div>";
           				_html += "</div>";
						$("#all_menu_inner").append(_html);
						$.each(workplace, function(){
							var _menu = "<li id='" + this.code + "' class='menu_li'><span>" + this.menu_kr + "</span><button type='button' class='btn_open_win'></button></li>";
							$("#" + workplace[0].category_code).append(_menu);
							$("#" + this.code).data("link", this.link);
						});						
					}
					
					
					var cowork = $.map(_list, function(ret, key) {
					     if (ret.category_code == "COWORK"){
					        return ret;
					     }
					});
					cowork = cowork.sort(SortByDateTime);
					if (cowork.length > 0){
						_html = "";
						_html += "<div class='all_menu_list_box'>";
           				_html += "	<div class='list_title_wrap'><h4 class='list_title'>" + cowork[0].category_name + "</h4></div>";
           				_html += "	<div id='" + cowork[0].category_code + "' class='menu_ul'>";
           				_html += "	</div>";
           				_html += "</div>";
						$("#all_menu_inner").append(_html);
						$.each(cowork, function(){
							var _menu = "<li id='" + this.code + "' class='menu_li'><span>" + this.menu_kr + "</span><button type='button' class='btn_open_win'></button></li>";
							$("#" + cowork[0].category_code).append(_menu);
							$("#" + this.code).data("link", this.link);
						});						
					}					
					
					//전체메뉴 레이어 닫기
					$("#btn_all_menu_layer_close").on("click", function(){
						$("#all_menu_layer").fadeOut(100);
						$("#all_menu_layer").empty();
					});
					
					//메뉴 클릭
					$("#all_menu_layer li").on("click", function(){
						if ($(this).data("link") != ""){
							window.open($(this).data("link"));
						}
					});
					
					function SortByDateTime(a, b){
 						var aSort = a.sort;
 						var bSort = b.sort; 
						return ((aSort < bSort) ? -1 : ((aSort > bSort) ? 1 : 0));
					}
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},
	
	//왼쪽 메뉴 불러오는 함수
	"menu_data_load": function(){
		$.ajax({
			type: "GET",
			url: "./resource/data/menu_data.txt",
			dataType: "json",
			success: function(data){
				
				var top_menu = '';
				var bot_menu = '';
				
				for(var i = 0; i < data.length; i++){
					if(i === 0){
						top_menu += "<button type='button' class='btn btn_left_menu active' id='btn_menu_" + data[i].name + "'><span class='menu_img' style='background-image:url(" + data[i].img + ")'></span><span class='menu_name_wrap'><span class='menu_name'>" + data[i].name_ko + "</span></span></button>";
					} else {
						if(data[i].name !== 'help'){
							top_menu += "<button type='button' class='btn btn_left_menu' id='btn_menu_" + data[i].name + "'><span class='menu_img' style='background-image:url(" + data[i].img + ")'></span><span class='menu_name_wrap'><span class='menu_name'>" + data[i].name_ko + "</span></span></button>";
						} else {
							//help_메뉴일때
							bot_menu += "<button type='button' class='btn_menu_help' id='btn_menu_" + data[i].name + "'><span class='menu_img' style='background-image:url(" + data[i].img + ")'></span><span class='menu_name_wrap'><span class='menu_name'>" + data[i].name_ko + "</span></span></button>";
						}
					}
				}
				
				//상단 메뉴
				$("#area_left .menu_wrap").append(top_menu);
				//하단 메뉴
				$("#area_left .menu_bot").append(bot_menu);
				
				console.log(">>>>>>>메뉴 데이터 로드 성공");
				
				
				//box에서 사용하던 기본 함/////////////////////////////////////////
				/*
				$("#rmclose").click();
				// 기본 LNB메뉴가 아닌 경우 새창으로 링크를 열어준다
				if ($(this).hasClass('custom-lnb')) {
					var _info = $(this).data('info');						
					// 업무방 작성중인 컨텐츠 확인
					if (_info.link == 'LNB' && _info.code != "mail" && _info.code != "cal") {
						var res = gap.checkEditor();
						if (!res) return false;
					}						
					gBody.go_app_url(_info);
					return false;
				}								
				var id = $(this).attr("id");				
				// 업무방 작성중인 컨텐츠 확인
				if (id != "mail" && id != "cal") {
					var res = gap.checkEditor();
					if (!res) return false;				
				}			
				// 더보기 클릭
				if (id == 'app_more') {
					gBody.show_app_more();
					return false;
				}			
				// LNB메뉴 처리
				gBody.is_buddylist_search = false;
				gBody.temp_search_result = [];
				//gBody.lnb_menu_click(id);
				*/
				//////////////////////////////////////////////////////////////
				
				
				
				//Home
				$("#btn_menu_home").on("click", function(e){
					 //gcom.area_right_draw();
	    			//gcom.event_bind();
					gcom.area_right_draw("init");
				});
				
				//업무방
				$("#btn_menu_work").on("click", function(e){
					/*
					
					gBody3.cur_window = "channel";				
					gBody.chat_right_menu_close();		
								
					gap.change_location("channel");				
					//신규 메시지 붉은 점을 제거한다.
					gap.change_title("1","");
									
							
					//초기화 이벤트 핸들러 정의한다.		
					gBody.init();
					gBody.show_channel();	//init함수 호출 후에 호출해야 한다.
					$("#channel_right").css("display","none");
					$("#center_content").css("display","none");
					$("#main_body").removeAttr("style");
					$("#main_body").css("right", "0px");	
					*/
					
					/*
					$("#area_content").empty();
					
					gBody3.cur_window = "channel";	
					$("#left_main").empty();	
					
					$("#tab3_sub").text(gap.lang.channel);						
					gap.param = "channel";
					
					$("#ext_body_search").hide();
					$("#box_search_content").hide();
					$("#user_profile").hide();
					$("#left_roomlist").hide();
					$("#left_buddylist").hide();
					$("#group_add_layer").hide();			
					$("#add_group_btn").hide();
					$("#add_group2").hide();
					
					$("#sub_channel_content").hide();
					$("#left_main").show();				
					$("#left_channel").show();	
					$("#channel_main").css("width","100%");
					
					$("#left_mail").hide();
					$("#left_main").css("width","312px;");	
					
					$("#channel_right").css("display","none");
					$("#center_content").css("display","none");
					$("#main_body").removeAttr("style");
					$("#main_body").css("right", "0px");	
					
					gBody.go_chat_left_draw();
					gBody.show_channel();	//init함수 호출 후에 호출해야 한다.
					*/
					
					
					gap.LoadPage("area_content", root_path + "/page/channel.jsp");
				});
				
				//채팅
				$("#btn_menu_chat").on("click", function(e){
					gBody3.cur_window = "chat";
					gap.LoadPage("area_content", root_path + "/page/chat.jsp"); 
				});
				
				//AI Portal
				$("#btn_menu_portal").on("click", function(){
					gap.LoadPage("area_content", root_path + "/page/kgpt.jsp");
				});
				
				// 메일
				$("#btn_menu_mail").on("click", function(){
					var mail_domain = "http://" + mailserver + "/" + maildbpath;
					var url = mail_domain + "/FrameMail?openform";
					window.open(url, "", "");		
				});
				
				// 일정관리
				$("#btn_menu_calendar").on("click", function(){
					
					var mail_domain = "http://" + mailserver + "/" + maildbpath.split("/")[0];
					var url = mail_domain + "/cal/calendar.nsf/main?readform";
					window.open(url, "", "");
				});
				
				// 취합
				$("#btn_menu_gathering").on("click", function(){
					gap.LoadPage("area_content", root_path + "/page/collect.jsp"); 
					gap.cur_window = "collect"
				});
				
				// 조직도
				$("#btn_menu_tree").on("click", function(){
					gap.LoadPage("area_content", root_path + "/page/organ.jsp");
					gap.cur_window = "org"
				});				
				
				//Files
				$("#btn_menu_folder").on("click", function(e){
					gap.LoadPage("area_content", root_path + "/page/files.jsp");
					gap.cur_window = "drive"
				});
				
				// 회의예약
				$("#btn_menu_meeting").on("click", function(){
					gap.LoadPage("area_content", root_path + "/page/meeting.jsp");
					gap.cur_window = "meeting"
				});			
				
				
				//메뉴 클릭 이벤트(공통);
				$(".btn_left_menu").on("click", function(){
					$(this).siblings().removeClass("active");
					$(this).addClass("active");	
				});
				
				//help 메뉴
				$("#btn_menu_help").on("click", function(){
					gcom.manual_layer_draw();
				});
				
			},
			error: function(xhr, error){
				console.log(error);
			}
		});
	},
	
	//매뉴얼 레이어 그리는 함수
	"manual_layer_draw": function(){
		
		var html = '';
		
		$("#dark_layer").fadeIn(200);
		
		html += "<div id='manual_layer'>";
		
		html += "<div class='layer_top'>";
		html += "<div class='layer_top_left'>";
		html += "<div class='tab_box'>";
		html += "<li class='tab_li'>K-Portal Manual</li>";
		html += "</div>"; //tab_box
		html += "<div class='indicatior_bar'></div>"; //탭 밑줄
		html += "</div>"; // layer_top_left
		html += "<div class='layer_top_right'>";
		html += "<div class='search_box'>";
		//검색박스
		html += "<input type='text' id='input_manual_search' class='manual_search_input' placeholder='찾고 싶은 매뉴얼 내용을 입력해주세요.'><button type='button' id='btn_manual_search' class='btn_manual_search'><span>검색</span></button>";
		html += "</div>"; //search_box
		html += "<button type='button' id='btn_manual_layer_close' class='btn_manual_layer_close'><span class='btn_img'></span></button>";
		html += "</div>"; //레이어 상단 오른쪽
		html += "</div>"; //layer_top
		
		//콘텐츠 영역
		html += "<div id='manual_content' class='layer_content'>";
		
		html += "<div class='content_box content_left_box'>";
		html += "<div class='content_title_wrap'><h4 class='content_title_txt'>Manual Folder</h4><button type='button' class='btn_folder_registration'><span>Folder Registration</span></button></div>";
		html += "<div id='manual_folder_box' class='content_item_box'>";
		
		var folder_length = 12;
		var folder_arr = [
			"메인", "업무방(Work)/채팅(Chat)", "조직도(Org)", "메일(Mail)", "일정관리(Cal)",
			"회의예약(Meet)", "취합(Gather)", "Files", "K-Portal 자동로그인",
			"모바일", "기타", "모바일 기기 일정 연동"
		]
		for(var i = 0; i < folder_length; i++){
			if(i === 5){
				html += "<div class='folder_item active'><span class='folder_name'>" + (i+1) + ". " + folder_arr[i] + "</span></div>";
			} else {
				html += "<div class='folder_item'><span class='folder_name'>" + (i+1) + ". " + folder_arr[i] + "</span></div>";
			}
		}
		
		html += "</div>";
		html += "</div>";
		
		html += "<div class='content_box content_right_box'>";
		html += "<div class='content_title_wrap'><h4 class='content_title_txt'>Manual Files</h4><button type='button' class='btn_file_registration'><span>File Registration</span></button></div>";
		
		html += "<div id='manual_file_box' class='content_item_box'>";
		
		html += "<div class='file_item'>";
		html += "<div class='file_name'>6. K-Portal Meet (회의예약) Web.pdf</div>";
		html += "<div class='btn_wrap'>";
		html += "<button type='button' class='file_btn view_file_btn'><span class='btn_img'></span></button>";
		html += "<button type='button' class='file_btn download_file_btn'><span class='btn_img'></span></button>";
		html += "<button type='button' class='file_btn del_file_btn'><span class='btn_img'></span></button>";
		html += "</div>";
		html += "</div>";
		html += "<div class='file_item'>";
		html += "<div class='file_name'>6. K-Portal Meet (회의예약) Mobile.pdf</div>";
		html += "<div class='btn_wrap'>";
		html += "<button type='button' class='file_btn view_file_btn'><span class='btn_img'></span></button>";
		html += "<button type='button' class='file_btn download_file_btn'><span class='btn_img'></span></button>";
		html += "<button type='button' class='file_btn del_file_btn'><span class='btn_img'></span></button>";
		html += "</div>";
		html += "</div>";
		
		html += "</div>"; // manual_file_box
		
		html += "</div>";
		html += "</div>";
		
		html += "</div>";
		
		html += "</div>";
		
		$("#dark_layer").append(html);
		$("#input_manual_search").focus();
		/*이벤트*/
		
		//검색버튼
		$("#btn_manual_search").on("click", function(){
			
			var $val = $.trim($("#input_manual_search").val());
			
			if( $val.length === 0 ){
				alert("찾고 싶은 매뉴얼 내용을 입력해주세요.");
				return;
			}
			if( $val.length !== 0 ){
				gcom.manual_search_layer_draw($val);
				$("#input_manual_search").val('');
			}
		});
		//검색입력창
		$("#input_manual_search").on("keypress", function(e){
			if(e.keyCode === 13){
				$("#btn_manual_search").click();
			}
		});
		//폴더 클릭
		$("#manual_folder_box .folder_item").on("click", function(){
			$(this).addClass("open");
			$(this).siblings().removeClass("open");
		})
		//레이어 닫기
		$("#btn_manual_layer_close").on("click", function(){
			$("#dark_layer").fadeOut(200);
			$("#dark_layer").empty();
		});
		
	},
	
	"manual_search_layer_draw": function(val){
		
		var val = '<strong>"'+  val + '"</strong>';
		
		//검색 레이어
		var layer = '';
		
		layer += "<div id='manual_search_layer'>";
		layer += "<div class='ai_answer_wrap'>";
		//답변 타이틀
		layer += "<div class='ans_title_wrap'>";
		layer += "<div class='ans_title'><div class='ai_img'></div><span class='ans_title_txt'>" + val + "에 대해 설명해드리겠습니다:</span></div>";
		layer += "<button type='button' id='btn_manual_search_layer_close' class='btn_manual_search_layer_close'><span class='btn_img'></span></button>";
		layer += "</div>"; //ans_title_wrap
		//답변 내용
		layer += "<div class='ai_answer_box'>";
		layer += "<div class='ans_detail_box'>";
		layer += "<div class='ans_detail_wrap'>";
		layer += "<div class='ans_detail_title'>조직도 추가하는 방법</div>";
		layer += "<div class='ans_detail_txt'>";
		layer += "<strong>1. 관리자 계정으로 로그인: </strong>관리자 권한이 필요합니다.<br>";
		layer += "<strong>2. 조직 관리 메뉴로 이동: </strong>'설정' 또는 '관리자 도구'에서 '조직 관리' 선택<br>";
		layer += "<strong>3. 조직도 추가/편집 선택: </strong>'조직도 추가' 또는 '편집' 클릭<br>";
		layer += "<strong>4. 부서 및 직원 추가: </strong><br>";
		layer += "<div class='ans_detail_ul'>";
		layer += "<li class='ans_detail_li'>부서 추가: 부서 이름과 상위 부서 입력.</li>";
		layer += "<li class='ans_detail_li'>직원 추가: 직원 이름, 직위, 소속 부서 입력.</li>";
		layer += "</div>"; //ans_detail_ul
		layer += "<strong>5. 저장 및 확인: </strong>관리자 권한이 필요합니다.<br>";
		layer += "</div>";
		layer += "</div>"; //ans_detail_txt
		layer += "</div>"; //ans_detail_box
		layer += "<div class='ans_files_box'>";
		layer += "<div class='ans_files_wrap'>";
		layer += "<div class='ans_files_title'>관련 문서</div>";
		layer += "<div id='ans_files_ul' class='ans_files_ul'>";
		layer += "<div class='file_item'>";
		layer += "<div class='file_name'>3. K-Portal 조직도 설정.pdf</div>";
		layer += "<div class='btn_wrap'>";
		layer += "<button type='button' class='file_btn view_file_btn'><span class='btn_img'></span></button>";
		layer += "<button type='button' class='file_btn download_file_btn'><span class='btn_img'></span></button>";
		layer += "<button type='button' class='file_btn del_file_btn'><span class='btn_img'></span></button>";
		layer += "</div>";
		layer += "</div>";
		layer += "</div>";
		layer += "</div>"; //ai_answer_box
		layer += "</div>"; //ai_answer_wrap
		layer += "</div>"; //manuaL_search_layer
		
		$("#manual_search_layer").remove();
		
		if($("#manual_search_layer").length === 0){
			$("#manual_content").append(layer);
		}
		
		$("#btn_manual_search_layer_close").on("click", function(){
			$("#manual_search_layer").remove();
		});
		
	},
	
	/* todo_그래프 그리는 함수 */
	"todo_graph_draw": function(graphType, work_category){
		
		var ctx = $("#todo_graph");
		
		var data_arr = [25, 50, 10];
		
		var graph_txt = "";
		
		//그래프 텍스트
		if(graphType === "mine"){
			graph_txt = "나에게 할당된 업무";
		}
		if(graphType === "others"){
			graph_txt = "내가 지시한 업무";	
		}
		
		//그래프 데이터
		if( work_category === "by_state" && graphType === "mine" ){
			data_arr = [10, 30, 30];
		}
		if( work_category === "by_state" && graphType === "others" ){
			data_arr = [10, 40, 50];
		}
		if(graphType === "mine" && work_category === "by_manager"){
			data_arr = [10, 30, 0];
		}
		if(graphType === "others" && work_category === "by_manager"){
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
		      	ctx.fillText(graph_txt, xCoor, yCoor - 15);
			  	ctx.fillText(total, xCoor, yCoor + 25);
		      	ctx.restore();
			},
		};
		
		//이미 차트가 존재하는 경우 파괴한다.
		if($("#todo_graph").data("chart") !== undefined){
			$("#todo_graph").data("chart").destroy();
		}
		
		var todoChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [
                    gap.lang.wait,
                    gap.lang.doing,
                    gap.lang.delay,
                ],
                datasets: [{
                    label: 'label',
                    data: data_arr,
                    backgroundColor: [
                        '#3BC3D7',
                        '#1668BC',
                        '#E871DC'
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
                            font: {
                                color: "#777777",
                                size: 14,
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
        });
		
		$("#todo_graph").data("chart", todoChart);
		
	},
	
	//todo_list 데이터 불러오는 함수
	"todo_list_data_load": function(){
		
		$.ajax({
			type: "GET",
			url: "./resource/data/" + (userlang == "ko" ? "todo_list_data.txt" : "todo_list_data_en.txt"),
			dataType: "json",
			success: function(data){
				
				var html = "<div id='todo_list_ul'>";
				
				for(var i = 0; i < data.length; i++){
					if(data[i].checked === 'false'){ //체크안된 목록
						html += "<div class='todo_li' key='" + data[i].key + "'><input type='checkbox' id='" + data[i].key + "' value='' class='todo_li_chkbox'><label for='" + data[i].key + "'></label>" + data[i].title + "</div>";						
						
					} else { //체크된 목록
						html += "<div class='todo_li checked' key='" + data[i].key + "'><input type='checkbox' id='" + data[i].key + "' value='' class='todo_li_chkbox' checked><label for='" + data[i].key + "'></label>" + data[i].title + "</div>";
					}
				}
				html += "</div>";
				
				// 오늘 할 일 입력창
				html += "<div id='todo_input_wrap'>";
				html += "<div class='todo_input_box'><input type='text' class='todo_input' placeholder='" + gap.lang.reg_todo_today + "'></div><button type='button' class='btn_todo_regist'><span>" + gap.lang.registration + "</span></button>";
				html += "</div>";
				
				$("#todo_list_wrap .box_content").append(html);
								
				console.log(">>>>>>>>>>todo 리스트 로드 성공");
				
				$(".todo_li_chkbox").on("change", function(){
					$(this).closest(".todo_li").toggleClass("checked");
				});
				
			},
			error: function(xhr, error){
				console.log(error);				
			}
		});
		
	},
	
	//상단 로그인 데이터 불러오는 함수
	"login_data_load": function(){
	
		$.ajax({
            type: "GET",
            url: "./resource/data/" + (userlang == "ko" ? "login_data.txt" : "login_data_en.txt"),
            dataType: "json",
            success: function(data){
                
                //왼쪽영역 즐겨찾기 사원이미지 표시
                $(".user_name").text(data[0].user_data.name); // 현재 사용자의 이름 표시
                $("#area_top_status .user_img").css({   //상단영역 유저이미지 표시
                    "background-image": "url(" + data[0].user_data.img + ""
                })
                var html = "";

                html = 
                    '<div id="user_content_wrap" class="personal_box">' +
                    '   <div class="content_box">' +
                    '        <div class="user_wrap">' +
                    '            <div class="user_img" style="background-image: url(' + data[0].user_data.img + ')"></div>' +
                    '            <div class="user_info_wrap">' +
                    '                <div class="user_dept">' + data[0].user_data.dept + '</div>' +
                    '                <div class="user_name">' + data[0].user_data.name + '</div>' +
                    '            </div>' +
                    '        </div>' +
                    '        <button type="button" class="btn btn_setting"></button>' +
                    '    </div>' +
                    '</div>' +
                    '<div id="emp_bookmark" class="personal_box">' +
                    '    <div class="title_wrap"><h4 class="title">' + gap.lang.favorite + '</h4><button type="button" id="emp_folder" class="btn btn_fold open"></button></div>' +
                    '        <div class="box_content emp_img_wrap">';

                for (var i = 0; i < data[0].emp_data.length; i++) {

                    html += `<div class="user_status_wrap">`;
                    html += `<div class="user_img" style="background-image: url(${data[0].emp_data[i].img})">`;
                    if (data[0].emp_data[i].status === "on") {
                        html += `<span class="user_status on">`
                    }
                    if (data[0].emp_data[i].status === "off") {
                        html += `<span class="user_status off">`
                    }

                    html += `
							<span class="status_circle"></span>
                                </span>
                            </div>
                            </div> `;
                }

                html += `
                            <div class='btn_plus_bookmark'><span class='add_img'></span></div>
                        </div>
                        </div>
                    </div>
                    <div id='todo_graph_wrap' class="personal_box">
                        <div class='title_wrap'><h4 class='title'>${gap.lang.todo_graph}</h4><button type='button' id='todo_graph_close' class='btn btn_fold open'></button></div>
                        <div class='box_content'>
	                        <div class='todo_graph_tab_box'>
									<li id='tab_todo_mine' class='todo_tab_li active'><span>${gap.lang.ingwork}</span></li>
									<li id='tab_todo_others' class='todo_tab_li'><span>${gap.lang.ingwork2}</span></li>
							</div>
                            <canvas id='todo_graph'></canvas>
                            <div class='btn_wrap'>
                                <button type='button' id='btn_todo_work_all_view' class='btn_white'><span>${gap.lang.expand}</span></button>
                            </div>
                        </div>
                    </div>
                    

                    
                    
                    <div id='todo_list_wrap' class="personal_box">
                        <div class='title_wrap'><h4 class='title'>${gap.lang.todo_list}</h4><button type='button' class='btn btn_fold open'></button></div>
                        <div class='box_content'></div>
                    </div>
                    `;
                    
                var folder_title_html = `
                    <div id='folder_title_wrap' class='user_folder_title_wrap'>
                        
                        <button type='button' id='btn_folder_setting'><span class='setting_img'></span><span>메인설정</span></button>
                    </div>
                `;

                $("#personal_area").append(html); //사용자 개인영역 안의 콘텐츠를 그린다
                $("#user_folder_content").prepend(folder_title_html);
                
				//즐겨찾기한 사원 마우스 이벤트
				$("#emp_bookmark .user_status_wrap").on("mouseenter", function(){
					
					//해당 사원에 지우기버튼 마스크
					var del_mask = "";
					
					del_mask += "<div class='emp_mask'>";
					del_mask +=   "<div class='emp_mask_inner'></div>";
					del_mask +=   "<button type='button' class='btn_del_bookmark_emp'></button>";
					del_mask += "</div>";
					
					// 현재 마우스를 올린 사진에 마스크를 씌운다.
					$(this).prepend(del_mask);
					
					//즐겨찾기 사원 제거 버튼
					$(".btn_del_bookmark_emp").on("click", function(){
						$(this).closest($(".user_status_wrap")).remove();
					});
					
					//$(this).children(".user_img").append(gcom.bookmark_emp_popup_draw($(this)));
					
					//현재 마우스를 올린 사진에 팝업창을 표시한다.
					gcom.bookmark_emp_popup_draw($(this));				
					
					$(".emp_work_popup").css({
						"top": $(this).offset().top + 63,
						"left": $(this).offset().left - 88
					});
					
				});
				$("#emp_bookmark .user_status_wrap").on("mouseleave", function(){
					$(".emp_mask").remove();
					$(".emp_work_popup").remove();
				});
				$("#emp_bookmark .user_status_wrap").on("mousewheel", function(e){
					e.preventDefault();
				});
				
				
                //왼쪽 영역 사용자영역 폴더 열고닫기
                $(".btn_fold").on("click", function(){
                    $(this).toggleClass("open")
                    $(this).parent().siblings(".box_content").toggle();
                });
				
				//todo그래프 전체보기버튼
				$("#btn_todo_work_all_view").on("click", function(){
					$(this).addClass("disable");
					gcom.todo_work_layer_draw();
				});
				
                //폴더 메인설정 버튼
                $("#btn_folder_setting").on("click", function(){
					$(".personal_box").hide();					
                    gcom.folder_personalize();
                });
				
				//TO-DO 그래프 탭 버튼
				$(".todo_tab_li").on("click", function(){
					$(this).siblings().removeClass("active");
					$(this).addClass("active");
					
					var id = $(this).attr("id");
					var graph_type = "";
					
					if(id === "tab_todo_mine"){
						graph_type = "mine";
					}
					if(id === "tab_todo_others"){
						graph_type = "others";
					}
					
					var category = '';
					
					//TO-DO 레이어가 표시되어 있을 때
					if($("#todo_work_area").length !== 0){

						var tab_id = $("#todo_work_area .tab_li.active").attr("id");
						
						
						if(tab_id === 'tab_todo_state'){
							category = 'by_state';
						}
						if(tab_id === 'tab_todo_manager'){
							category = 'by_manager';
						}
						
						gcom.todo_work_list_draw(category);
						
					} else {
						category = 'by_state';
					}
					
					gcom.todo_graph_draw(graph_type, category);
					
				});
				
				//초기값: 나에게 할당된 업무, 상태별 업무목록
				gcom.todo_graph_draw("mine", "by_state");
				gcom.todo_list_data_load();
				
				console.log(">>>>>>>>로그인 데이터 로드 성공");
            },
            error: function(xhr, error){
                console.log(error);
            }
        });
			
	},
	
	//오른쪽 영역 그리는 함수
    "area_right_draw": function(flag){
		if(flag === "init"){
			//메인화면 html
			var main_html = 
				'<div id="personal_area" class="overflow"></div>' + 
				'<div id="area_right">' +
	                '<div class="inner">' +
		            	'<div class="ceo_mail_wrap">' +
		              		'<div class="ceo_mail_bg">' +
		                		'<div class="ceo_mail_line"></div>' +
		                    		'<div id="ceo_mail">' +
		                    			'<div class="txt_wrap">' +
				                    		'<div class="ceo_mail_title">CEO MESSAGE</div>' +
				                    		'<div class="vertical_bar"></div>' +
			                    			'<div class="ceo_mail_desc">Let us actively utilize contemporary technology to communicate with the world.</div>' +
	                    				'</div>' +
			                    		'<button type="button" id="btn_to_ceo_mail"></button>' +
	                    			'</div>' +
	                    		'</div>' +
	                	'</div>' +
	                    '<div id="user_folder_content" class="content_wrap"></div>' +
	                    '<div id="content_container"></div>' +
	                '</div>' +
	            '</div>';
	
			$("#area_content").empty();
			$("#area_content").append(main_html);
			
			$("#right_menu").hide();
			
			//로그인 데이터를 불러온다.
			gcom.login_data_load();
		}
		
		//콘텐츠 그리는 함수들을 담은 배열
		var content_arr = [
			gcom.news_data_load(),
			gcom.approval_data_load(),
			gcom.weather_data_load(),
			gcom.schedule_data_load(),
			gcom.holiday_data_load(),
			gcom.mail_data_load(),
			gcom.board_data_load(),
			gcom.emp_search_box_draw(),
			gcom.chat_data_load(),
			gcom.bookmark_data_load(),
			gcom.survey_data_load()
		];
		
		$("#content_container").empty();
		
		$.when.apply($, content_arr).done(function() {
			
			//아이템들이 전부 append 된 후 컨테이너를 packery 레이아웃으로 만든다.			
			gcom.main_packery_layout();
			
			$("#content_container").on( 'layoutComplete', gcom.main_layout_load() );
			
		    console.log("!!!>!!!>>!!>>>>>>>>>>사용자 컨텐츠 모두 로드성공<<<<<<<<<<<<!!");
			
		}).catch(function(error) {
		    console.error("사용자 컨텐츠 로드 실패", error);
		});
		
	},
	
	//메인 레이아웃 초기화하는 함수 
	"main_packery_layout": function(){
		
		$("#content_container").packery({
		  	itemSelector: '.content_item',
			columnWidth: '.content_item',
			stamp: ".stamp",
		  	gutter: 16,
			initLayout: false,
			transitionDuration: "0.3s"
		});

	},
	
	//메인 레이아웃 위치 저장하는 함수
	"main_layout_save": function(){
		
		//아이템의 위치 로컬스토리지에 저장
		var positions = $("#content_container").packery( 'getShiftPositions', 'idx' );
  		localStorage.setItem( 'main_item_position', JSON.stringify( positions ) );
		
		/*var pckry = $("#content_container").data('packery');
		
		var sortOrder = [];
		var itemElems = pckry.getItemElements();
	    // reset / empty order array

	    sortOrder.length = 0;
	    for (var i=0; i< itemElems.length; i++) {
	      sortOrder[i] = itemElems[i].getAttribute("idx");
	    }
	    // save idx ordering
		localStorage.setItem('sortOrder', [] );
	    localStorage.setItem('sortOrder', JSON.stringify(sortOrder) );*/
	},
	
	//저장된 메인 레이아웃 위치 불러오는 함수
    "main_layout_load": function() {
	
		// 메인 아이템 포지션 데이터 가져오기
		var initPositions = localStorage.getItem('main_item_position');
		// 저장된 아이템 포지션으로 레이아웃 초기화
		$("#content_container").packery( 'initShiftLayout', initPositions, 'idx' );
		
		$(window).on("resize", function(){
			if($(window).width() > 1680){
				$("#content_container").packery( 'initShiftLayout', initPositions, 'idx' );
			}
		});
		
		$(".content_item").addClass("item_show");

		/*var pckry = $("#content_container").data('packery');
		
		var storedSortOrder = localStorage.getItem('sortOrder');
		if ( storedSortOrder ) {
			storedSortOrder = JSON.parse( storedSortOrder );
		    // create a hash of items by their idx
		    var itemsByidx = {};
		    var idx;
			
		    for ( var i=0, len = pckry.items.length; i < len; i++ ) {
		        var item = pckry.items[i];
		        idx = $( item.element ).attr('idx');
		        itemsByidx[ idx ] = item;
		    }
		    // overwrite packery item order
		    i = 0; len = storedSortOrder.length;

		    for (; i < len; i++ ) {
				idx = storedSortOrder[i];
				pckry.items[i] = itemsByidx[ idx ];
		    }
		}
		
		//아이템 배치가 끝나면 packery 옵션 변경
		$("#content_container").packery({
			initLayout: true,
			stagger: 100
		});
		
		$("#content_container").packery("layout");
		$(".content_item").addClass("item_show");*/
		
    },
	
	//즐겨찾기한 사원에 마우스 올렸을 때 팝업창 띄우는 함수
	"bookmark_emp_popup_draw": function(target){
		
		var html = '';
		
		html += "<div class='emp_work_popup'>";
		html += "<div class='popup_inner'>";
		html += "<div class='popup_title_wrap'><div class='emp_info'>";
		html += "<span class='emp_name'>홍미나</span><span class='emp_duty'>대리</span>";
		html += "</div><span class='emp_dept'>기술전략팀</span></div>";
		html += "<div class='work_btn_wrap'>";
		html += "<div class='work_btn_box'><button type='button' class='popup_btn btn_emp_call'><span class='btn_img'></span></button><span class='btn_name'>전화</span></div>";
		html += "<div class='work_btn_box'><button type='button' class='popup_btn btn_emp_chat'><span class='btn_img'></span></button><span class='btn_name'>채팅</span></div>";
		html += "<div class='work_btn_box'><button type='button' class='popup_btn btn_emp_mail'><span class='btn_img'></span></button><span class='btn_name'>메일</span></div>";
		html += "<div class='work_btn_box'><button type='button' class='popup_btn btn_emp_info'><span class='btn_img'></span></button><span class='btn_name'>정보</span></div>";
		html += "</div>";
		html += "</div>";
		html += "</div>";
		
		target.append(html);
	},
	
	// 폴더 안의 콘텐츠를 MASONRY 레이아웃으로 보여주는 함수
	"folder_masonry_layout": function(){
		$("#content_container").masonry({
			initLayout: true,
            columnWidth: ".content_item",
           	itemSelector: '.content_item',
            gutter: 16,
			stagge: 10,
            percentPosition: true
        });
	},
	
	"news_data_load": function(){
		
		return new Promise(function(resolve, reject) {
		
			$.ajax({
				type: "GET",
				url: "./resource/data/news_data.txt",
				dataType: "json",
				success: function(data){
					
					var item = `
						<div id='news_box' class='content_item stamp' idx='-1'>
						<div class='new_wrap_container'>`;
											
						for(var i = 0; i < data.length; i++){
			                item += `<div class='news_wrap'><div class='news_img' style='background-image: url(${data[i].img})'></div>
			                <div class='news_title_wrap'>
			                        <div class='date'><span>${data[i].title}</span></div>
			                        <div class='title'>${data[i].desc}</div>
	                        </div>
							</div>`;
						}
	                        item += `
							</div>
							<div class='btn_wrap'>
	                            <button type='button' class='btn btn_prev'><span class='prev_btn'></span></button>
	                            <button type='button' class='btn btn_next'><span class='next_btn'></span></button>
	                        </div>
	                        <div class='dot_wrap'>`
							for(var i = 0; i < data.length; i++){
								if(i === 0){
		                            item += "<span class='page_dot active'></span>";
								} else {
									item += "<span class='page_dot'></span>";
								}
							}
	                        item += `</div>
	                </div>
					`;
					
					//뉴스 데이터는 고정(stamp)
					$("#content_container").append(item);
					
					//뉴스콘텐츠 마우스 이벤트
			        $("#news_box").on("mouseenter", function(){
			            $(this).children(".btn_wrap").fadeIn(150);
			        });
			        $("#news_box").on("mouseleave", function(){
			            $(this).children(".btn_wrap").fadeOut(150);
		       		});
	
					var count = 0; //배너 이전/다음버튼 클릭 횟수
					var animate_speed = 200; //애니메이트 속도
					
					//캐러셀 배너 이전버튼
					$("#news_box .btn_prev").on("click", function(){
						
						$("#news_box .btn_next").show();
						
						if(count > 0){
							count -= 1;
						}
						if(count === 0){ //첫번쨰 배너일때는 이전버튼을 숨긴다.
							$("#news_box .btn_prev").hide();
						}
						
						$(".page_dot").removeClass("active");
						$(".page_dot").eq(count).addClass("active");
						
						$(".new_wrap_container").animate({
							"margin-left": -($(".content_item").outerWidth() * count)
						}, animate_speed);
						
					});
					//캐러셀 배너 다음버튼
					$("#news_box .btn_next").on("click", function(){
						
						$("#news_box .btn_prev").show();
						
						if(count < $(".page_dot").length - 1){
							count += 1;
						}
						if(count === $(".page_dot").length - 1){ //마지막 배너일때는 다음버튼을 숨긴다.
							$("#news_box .btn_next").hide();
						}
						
						$(".page_dot").removeClass("active");
						$(".page_dot").eq(count).addClass("active");
						
						$(".new_wrap_container").animate({
							"margin-left": - ($(".content_item").outerWidth() * count)
						}, animate_speed);
						
					});
					
					//페이지 버튼(점)
					$(".page_dot").on("click", function(){
						
						$(this).siblings().removeClass("active");
						$(this).addClass("active");
						
						count = $(this).index(); //현재 클릭한 페이지 버튼이 몇번째인지
						
						if(count === 0){ //첫번쨰 배너일때는 이전버튼을 숨긴다.
							$("#news_box .btn_prev").hide();
							$("#news_box .btn_next").show();
						}
						if(count !== 0 && count !== $(".page_dot").length - 1){ ////첫번쨰 배너, 마지막 배너가 아닐 때는 이전/다음을 모두 표시한다.
							$("#news_box .btn_prev").show();
							$("#news_box .btn_next").show();
						}
						if(count === $(".page_dot").length - 1){ //마지막 배너일때 다음버튼을 숨긴다.
							$("#news_box .btn_prev").show();
							$("#news_box .btn_next").hide();
						}
						
						console.log($(this).index());
						console.log($(".content_item").outerWidth());
						
						$(".new_wrap_container").animate({
							"margin-left": - ($(".content_item").outerWidth() * count)
						}, animate_speed);
						
					});
	
					console.log(">>>>>>>>>뉴스 데이터 로드 성공");
					resolve(item);
				},
				error: function(xhr, error){
					console.log(error);
					reject(error);
				}
			});
		});
		
	},
	
	//결재문서 데이터 불러오는 함수
	"approval_data_load": function(flag){
		
		return new Promise(function(resolve, reject) {
		
			$.ajax({
				type: "GET",
				url: location.protocol + "//" + window.mailserver + "/" + window.aprvdbpath + "/getAprvStatusCount?open&owner=" + gap.userinfo.rinfo.ky,
				xhrFields : {
					withCredentials : true
				},
				dataType: "json",
				success: function(data){
					
					var item = `
						<div id='approval_box' class='content_item' app='approval' idx='0'>
							<div>
							<div class='content_title_wrap'><h4 class='content_title'>${gap.lang.aprv}</h4><button type='button' class='btn arrow_right'></button></div>
								<div class='list_wrap'>
									<div id='approval_category' class='category_wrap'></div>
									<div id='approval_ul' class='doc_ul'></div>
								</div>
							</div>
							<div class='btn_wrap'>
								<button type='button' class='btn_white' id='btn_aprv_view_all'><span>${gap.lang.expand}</span></button>
								<button type='button' class='btn_blue' id='btn_aprv_compose'><span>${gap.lang.compose_doc}</span></button>
							</div>
						</div>
					`;
					
					
					if(flag === 'add'){
						var item_mask = `
							<div class='item_mask'><button type='button' class='btn_item_delete'></button></div>
						`;
		                
						$("#content_container").append(item).packery( 'prepended', $("#approval_box") ).packery('shiftLayout');
						$("#approval_box").append(item_mask);
						$(".content_item").addClass("item_show");
						
						//드래그 활성화
						gcom.main_content_draggable();
					} else {
						$("#content_container").append(item);
					}
					
					// 폴더아이템 제거 버튼
					$(".btn_item_delete").on("click", function(){
						//제거하려는 아이템
						var item = $(this).closest(".content_item");
						//제거하려는 아이템의 키
						var key = item.attr("app");
						
						$(this).closest(".item_mask").remove();
						$("#content_container").packery('remove', item).packery('layout');
						$(".app_box[key='" + key + "']").removeClass("select");
					});
					
					var approval_show_length = 8; //메인에서 보여질 갯수
					var category = '';
					
					var wait = data.wait ? data.wait : 0;
					var progress = data.progress ? data.progress : 0;
					var reject = data.reject ? data.reject : 0;
					var complete = data.complete ? data.complete : 0;
					
					category += "<li class='category category_approval wait active' id='tab_aprv_wait'><span class='category_name'>" + gap.lang.wait + "</span><span class='doc_count'>" + wait + "</span></li>";
					category += "<li class='category category_approval progress' id='tab_aprv_progress'><span class='category_name'>" + gap.lang.doing + "</span><span class='doc_count'>" + progress + "</span></li>";
					category += "<li class='category category_approval reject' id='tab_aprv_reject'><span class='category_name'>" + gap.lang.reject + "</span><span class='doc_count'>" + reject + "</span></li>";
					category += "<li class='category category_approval complete' id='tab_aprv_complete'><span class='category_name'>" + gap.lang.done + "</span><span class='doc_count'>" + complete + "</span></li>";
					
					$("#approval_category").append(category);
					$(".category_approval").on("click", function(){
					
						$(this).siblings().removeClass("active");
						$(this).addClass("active");
						
						var cate = $(this).attr("id").replace("tab_aprv_", "");
						
						$.ajax({
							type : "GET",
							url : location.protocol + "//" + window.mailserver + "/" + window.aprvdbpath + "/api/data/collections/name/vwAprvList_" + cate + "_EmpNo?restapi&category=" + gap.userinfo.rinfo.ky + "&start=0&ps=10&entrycount=false",
							xhrFields : {
								withCredentials : true
							},				
							dataType : "json",
							success : function(res){
								$('#approval_ul').empty();
								
								for(var i = 0; i < res.length; i++){
									var html = '';
									var unid = res[i]['@unid'];
									var href = res[i]['@link']['href'];
									var link = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + href.replace('api/data/documents/unid', '0') + '?opendocument';
									var title = res[i].title;
									var createddate = res[i].createdDate;
									var authorinfo = res[i].writerinfo;
									var aprv_data = {
										"unid" : unid,
										"title" : title,
										"link" : link
									}							
									html += "<li class='doc_li approval_li' id='" + unid + "'>";
									html += "<span class='item_title'>" + title + "</span>";
									html += "<div class='item_writer_wrap'>";
									html += "<span class='item_writer'>" + authorinfo + "</span>";
									html += "<span> · </span>";
									html += "<span class='item_date'>" + moment.utc(createddate).local().format('YYYY-MM-DD') + "</span>";
									html += "</div>";
									html += "</li>";
									
									$('#approval_ul').append(html);
									$('#' + unid).data('info', aprv_data);
									$('#' + unid).data('link', link);
								}
								
								// 제목 클릭
								$(".approval_li").off().on('click', function(){
									var _id = $(this).attr('id');
									var _link = $('#' + _id).data('link');
									var _url = _link;
									gap.open_subwin(_url, "1200","900", "yes" , "", "yes");
								});
								
								// 버튼 클릭
								$("#btn_aprv_view_all").off().on('click', function(){
									var aprv_domain = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + window.aprvdbpath;
									var url = aprv_domain + "/FrameApproval?openform";
									window.open(url, "", "");
								});
								
								$("#btn_aprv_compose").off().on('click', function(){
									var aprv_domain = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + window.aprvdbpath;
									var url = aprv_domain + "/FrameApproval?openform";
									window.open(url, "", "");
								});								
							},
							error : function(e){
								gap.gAlert(gap.lang.errormsg);
								return false;
							}
						});
	                });
					
					$(".category_approval.wait").click();
					
					console.log(">>>>>>>>결재문서 데이터 로드 성공");
					
					resolve(item);
				},
				error: function(xhr, error){
					console.log(error);
					reject(error);
				}
			});
		});
	},	
	
	//결재문서 데이터 불러오는 함수 - 원래 함수
	"approval_data_load_20240711": function(flag){
		
		return new Promise(function(resolve, reject) {
		
			$.ajax({
	            type: "GET",
	            url: "./resource/data/" + (userlang == "ko" ? "approval_data.txt" : "approval_data_en.txt"),
	            dataType: "json",
	            success: function(data){
					
					var item = `
						<div id='approval_box' class='content_item' app='approval' idx='0'>
			                <div>
			                    <div class='content_title_wrap'><h4 class='content_title'>${gap.lang.aprv}</h4><button type='button' class='btn arrow_right'></button></div>
			                    <div class='list_wrap'>
			                        <div id='approval_category' class='category_wrap'></div>
			                        <div id='approval_ul' class='doc_ul'></div>
			                    </div>
			                </div>
		                    <div class='btn_wrap'>
		                        <button type='button' class='btn_white'><span>${gap.lang.expand}</span></button>
		                        <button type='button' class='btn_blue'><span>${gap.lang.compose_doc}</span></button>
		                    </div>
		                </div>
					`;
					
					
					if(flag === 'add'){
	                	var item_mask = `
	                		<div class='item_mask'><button type='button' class='btn_item_delete'></button></div>
	                	`;
		                
						$("#content_container").append(item).packery( 'prepended', $("#approval_box") ).packery('shiftLayout');
		                $("#approval_box").append(item_mask);
						$(".content_item").addClass("item_show");
		                
						//드래그 활성화
						gcom.main_content_draggable();
	                } else {
						$("#content_container").append(item);
	                }
					
					// 폴더아이템 제거 버튼
		            $(".btn_item_delete").on("click", function(){
		            	//제거하려는 아이템
		            	var item = $(this).closest(".content_item");
						//제거하려는 아이템의 키
		            	var key = item.attr("app");
		            					
		    			$(this).closest(".item_mask").remove();
						$("#content_container").packery('remove', item).packery('layout');
		
		            	$(".app_box[key='" + key + "']").removeClass("select");
		            });
					
	                var approval_show_length = 8; //메인에서 보여질 갯수
	                
	                var category = '';
	                
	                var wating = 0;
	                var proceeding = 0;
	                var companion = 0;
	                var complete = 0;
						
	                for(var i = 0; i < data.length; i++){
	                    if(data[i].status === 'wating'){
	                        wating += 1;
	                    }
	                    if(data[i].status === 'proceeding'){
	                        proceeding += 1;
	                    }
	                    if(data[i].status === 'companion'){
	                        companion += 1;
	                    }
	                    if(data[i].status === 'complete'){
	                        complete += 1;
	                    }
	                }
	
	                category += "<li class='category category_approval wating active'><span class='category_name'>" + gap.lang.wait + "</span><span class='doc_count'>" + wating + "</span></li>";
	                category += "<li class='category category_approval proceeding'><span class='category_name'>" + gap.lang.doing + "</span><span class='doc_count'>" + proceeding + "</span></li>";
	                category += "<li class='category category_approval companion'><span class='category_name'>" + gap.lang.reject + "</span><span class='doc_count'>" + companion + "</span></li>";
	                category += "<li class='category category_approval complete'><span class='category_name'>" + gap.lang.done + "</span><span class='doc_count'>" + complete + "</span></li>";
	                
	                $("#approval_category").append(category);
	                $(".category_approval").on("click", function(){
	                    
	                    $(this).siblings().removeClass("active");
	                    $(this).addClass("active");
	
	                    var html = '';
	
	                    for(var i = 0; i < data.length; i++){
	
	                        if($(this).hasClass(data[i].status)){
	
	                            html += "<li class='doc_li approval_li'>";
	                            html += "<span class='item_title'>" + data[i].doc_title + "</span>";
	                            html += "<div class='item_writer_wrap'>";
	                            html += "<span class='item_writer'>" + data[i].writer + "</span>";
	                            html += "<span> · </span>";
	                            html += "<span class='item_date'>" + data[i].created + "</span>";
	                            html += "</div>";
	                            html += "</li>";
	                            
	                        }
	                    }
	                    $("#approval_ul").empty();
	                    $("#approval_ul").append(html);
	
	                });
	
	                $(".category_approval.wating").click();
	
	                console.log(">>>>>>>>결재문서 데이터 로드 성공");
					resolve(item);
	            },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });
		});
		
	},
	
	//날씨 데이터 불러오는 함수
	"weather_data_load": function(){
		
		return new Promise(function(resolve, reject) {
			
			$.ajax({
	            type: "GET",
	            url: "./resource/data/" + (userlang == "ko" ? "weather_data.txt" : "weather_data_en.txt"),
	            dataType: "json",
	            success: function(data){
	                
	                var item = `
	                	<div id='weather_box' class='content_item' idx='1'>
	                        <div class='content_title_wrap'><h4 class='content_title'>${gap.lang.weather_info}</h4><button type='button' class='btn btn_refresh'></button></div>
	               		</div>
	                `;
	                
	                $("#content_container").append(item);
	                
	                var html = '';
	
	                html = `
	                    <div class='weather_info_wrap'>
							<div class='weather_info_top'>
			                    <div class='loacation_wrap'>
			                        <div class='location_img'></div>
									<div class='location_info_box'>
										<div class='city'>${data[0].location.city}</div>/<div class='town'>${data[0].location.town}</div>
									</div>
			                    </div>
			                    <div class='weather_info'>
			                        <div class='weather'>
			                            <div class='weather_img' style='background-image: url(${data[0].sky.img})'></div>
			                            <div class='temperatures'>${data[0].temperature.now}°</div>
			                        </div>
			                        <div class='weather_desc'>
			                            <div>${data[0].sky.status}</div>`
			                            if(Math.ceil(data[0].temperature.now - data[0].temperature.yesterday) > 0){
			                                html += `<div>어제보다 약 ${Math.abs(Math.ceil(data[0].temperature.now - data[0].temperature.yesterday))}° 높아요!</div>`;
			                            } else {
			                                html += `<div>어제보다 약 ${Math.abs(Math.ceil(data[0].temperature.now - data[0].temperature.yesterday))}° 낮아요!</div>`;
			                            }
			                        html += `</div>
			                    </div>
							</div>
		                    <div class='detail_info'>
		                        <div class='detail_box'>
		                            <div class='detail_title'>체감</div>
		                            <div class='detail_data'>${data[0].temperature.perceived}°</div>
		                        </div>
		                        <div class='detail_box'>
		                            <div class='detail_title'>습도</div>
		                            <div class='detail_data'>${data[0].humidity}%</div>
		                        </div>
		                        <div class='detail_box'>
		                            <div class='detail_title'>바람(${data[0].wind.direction})</div>
		                            <div class='detail_data'>${data[0].wind.speed}m/s</div>
		                        </div>
		                    </div>
	                `;
	                
	                $("#weather_box").append(html);
	                
	                console.log(">>>>>>>>>>날씨정보 데이터 로드 성공");
					resolve(item);
	            },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });
		});
		
	},
	
	//메일 데이터 불러오는 함수
	"mail_data_load": function(flag){
		return new Promise(function(resolve, reject) {
			$.ajax({
	            type: "GET",
	            url: "./resource/data/" + (userlang == "ko" ? "mail_data.txt" : "mail_data_en.txt"),
	            dataType: "json",
	            success: function(data){
					
					var item = `
					<div id='mail_box' class='content_item' app='mail' idx='2'>
	                <div>
	                    <div class='content_title_wrap'><h4 class='content_title'>${gap.lang.mail}</h4><button type='button' class='btn arrow_right'></button></div>
	                    <div class='list_wrap'>
	                        <div id='mail_category' class='category_wrap'></div>
	                        <div id='mail_ul' class='msg_ul'></div>
	                    </div>
	                </div>
	                    <div class='btn_wrap'>
	                        <button type='button' class='btn_white'><span>${gap.lang.expand}</span></button>
	                        <button type='button' class='btn_blue'><span>${gap.lang.create_mail}</span></button>
	                    </div>
	                </div>`;
	                
	                if(flag === 'add'){
	                	var item_mask = `
	                		<div class='item_mask'><button type='button' class='btn_item_delete'></button></div>
	                	`;
		                $("#content_container").append(item).packery( 'prepended', $("#mail_box") ).packery('shiftLayout');
		                $("#mail_box").append(item_mask);
		                $(".content_item").addClass("item_show");

						//드래그 활성화
						gcom.main_content_draggable();
		                
	                } else {
						$("#content_container").append(item);                
	                }
					
					// 폴더아이템 제거 버튼
		            $(".btn_item_delete").on("click", function(){
		            	//제거하려는 아이템
		            	var item = $(this).closest(".content_item");
						//제거하려는 아이템의 키
		            	var key = item.attr("app");
		            					
		    			$(this).closest(".item_mask").remove();
						$("#content_container").packery('remove', item).packery('layout');
		
		            	$(".app_box[key='" + key + "']").removeClass("select");
		            });
	            
	                var unread_count = 0;
	                
	                for(var i = 0; i < data.length; i++){
	                    if(data[i].category === 'unread'){
	                        unread_count += 1;
	                    }
	                }
	                
	                var category = '';
	
	                category += "<li class='category category_mail mail_unread unread active'><span class='category_name'>" + gap.lang.unread_mail + "</span><span class='doc_count'>" + unread_count + "</span></li>";
	                category += "<li class='category category_mail mail_all'><span class='category_name'>" + gap.lang.inbox_mail + "</span><span class='doc_count'>" + data.length + "</span></li>";
					
	                $("#mail_category").append(category);
	                
	                $(".category_mail").on("click", function(){
	
	                    $(this).siblings().removeClass("active");
	                    $(this).addClass("active");
	
	                    // if($(this).hasClass("unread")){ //안읽은메일함
	                    //     mail_list_draw(data, "unread");
	                    // } else { //받은 메일함(모든 메일)
	                    //     mail_list_draw(data, "all");
	                    // }
	
	                    var mail_li = '';
	                    var date = '';
	                    
	                    var condition = '';
	
	                    for(var i = 0; i < data.length; i++){
	                        if($(this).hasClass('mail_unread')) {
	                            condition = data[i].category === "unread";
	                        }
	                        if($(this).hasClass('mail_all')){
	                            condition = data[i].category === "unread" || data[i].category === "read";
	                        }
	                        
	                        if(condition){ //조건에 맞는 메일만 목록에 표시
	                            mail_li += `<li class='msg_li'>
	                            <div class='msg_title_wrap'>
	                            <div class='sender_img' style='background-image: url(${data[i].img})'></div>
	                            <div class='msg_info'>`
	                            mail_li += "<span class='sender_name'>" + data[i].sender + "</span>";
	                            mail_li += "<span class='item_title'>" + data[i].title + "</span>";
	                            mail_li += `</div>
	                            </div>
	                            <div class='msg_send_time_wrap'>`
	                            if(new Date(data[i].date) < new Date().setHours(0, 0, 0, 0)){ //오늘 이전날짜에 전송된 메일인 경우
	                                if(new Date(data[i].date).getFullYear() < new Date().getFullYear()){ // 올해 이전의 날짜에 전송된 메일인 경우
	                                    //연,월,일 모두 표시
										if (userlang == "ko"){
											date = new Date(data[i].date).getFullYear() + "년 " + (new Date(data[i].date).getMonth()+1) + "월 " + new Date(data[i].date).getDate() + "일";
										}else{
											date = new Date(data[i].date).getFullYear() + "-" + (new Date(data[i].date).getMonth()+1) + "-" + new Date(data[i].date).getDate();
										}
	                                    mail_li += "<span class='send_time'>" + date + "</span>";
	                                } else { // 오늘 이전의 날짜이지만 올해안에 전송된 메일인 경우
	                                    //월,일까지 표시
										if (userlang == "ko"){
											date = (new Date(data[i].date).getMonth()+1) + "월 " + new Date(data[i].date).getDate() + "일";
										}else{
											date = (new Date(data[i].date).getMonth()+1) + "-" + new Date(data[i].date).getDate();
										}
	                                    mail_li += "<span class='send_time'>" + date + "</span>";
	                                }
	                            } else { //오늘 전송된 메일인 경우
	                                //시간만 표시, 단 오전, 오후 구분
	                                if(new Date(data[i].date).getHours() < 12) { //오전 시간대 인경우
	                                    date = "오전 " + new Date(data[i].date).getHours() + ":" + addZero(new Date(data[i].date).getMinutes());
	                                } else {
	                                    date = "오후 " + (new Date(data[i].date).getHours() - 12) + ":" + addZero(new Date(data[i].date).getMinutes());
	                                }
	                                mail_li += "<span class='send_time'>" + date + "</span>";
	                            }
	                            mail_li += `<div class='msg_btn_wrap'>`
	                                if(data[i].bookmark === 'yes'){
	                                    mail_li += `
	                                        <button type='button' class='btn btn_bookmark_mail active'></button>
	                                        <button type='button' class='btn btn_mail_remove'></button>
	                                        `;
	                                } else {
	                                    mail_li += `
	                                        <button type='button' class='btn btn_bookmark_mail'>
	                                        <button type='button' class='btn btn_mail_remove'></button>
	                                        `;
	                                }
	                                mail_li += `</div>
	                                </div>
	                                </li>`
	                        }
	                    }
	
	                    $("#mail_ul").empty();
	                    $("#mail_ul").append(mail_li);
						
	                });
	
	                $(".category_mail.unread").click();
					
					resolve(item);

	            },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });

		});
		
	},
	
	//나의연차 데이터 불러오는 함수
	"holiday_data_load": function(flag){
		
		return new Promise(function(resolve, reject) {
			
			$.ajax({
	            type: "GET",
	            url: "./resource/data/" + (userlang == "ko" ? "holiday_data.txt" : "holiday_data_en.txt"),
	            dataType: "json",
	            success: function(data){
	            	
	            	var item = `
	            		<div id='holidays_box' class='content_item' idx='3'>
	                    <div class='content_title_wrap'><h4 class='content_title'>${gap.lang.my_annual_leave}</h4><button type='button' class='btn arrow_right'></button></div>
	                    <div class='holiday_info_wrap'>
							<div class='holiday_info'>
	                        <div class='remain_title_wrap'><span class='remain_title'>${gap.lang.remaining_annual_leave}</span><span class='remain_count'>${data[0].all - data[0].used} ${gap.lang.day}</span></div>
	                        <div class='detail_count_wrap'><span class='detail_count_title'>${gap.lang.accrued_annual_leave}</span><span class='detail_count'>${data[0].all}</span></div>
	                        <div class='detail_count_wrap'><span class='detail_count_title'>${gap.lang.used_annual_leave}</span><span class='detail_count'>${data[0].used}</span></div>
	                    </div>
	                    <div class='holiday_img'></div>
						</div>
	                    <div class='btn_wrap'>
	                        <button type='button' class='btn_blue' id='btn_aprv_req'><span>${gap.lang.annual_leave_application}</span></button>
	                    </div>
	                </div>
	            	`;
	            	
	            	$("#content_container").append(item);

					// 버튼 클릭
					$("#btn_aprv_req").off().on('click', function(){
						var aprv_domain = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + window.aprvdbpath;
						var url = aprv_domain + "/F2?Openform&opentype=popup&tabtitle=new0";
						gap.open_subwin(url, "1200","900", "yes" , "", "yes");
					});

					resolve(item);
	            },
	            error: function(xhr, error){
	               console.log(error);
					reject(error);
	            }
	        });
		});
	},
	
	//오늘일정 날짜 데이터 불러오는 함수
	"schedule_data_load": function(flag){
		
		return new Promise(function(resolve, reject) {
			
			$.ajax({
	            type: "GET",
	            url: "./resource/data/schedule_data.txt",
	            dataType: "json",
	            success: function(data){
	                                
	                var item = `
	                                
		        	<div id='schedule_box' class='content_item' app='calendar' idx='4'>
		            <div class='content_title_wrap'><h4 class='content_title'>${gap.lang.today_cal}</h4><button type='button' class='btn arrow_right'></button></div>
		            <div class='calendar_wrap'>
		                <div id='calendar'></div>
		                <div id='schedule_info_box'><div class='schedule_info_wrap'></div></div>
		            </div>
		            <div class='btn_wrap'>
		                <button type='button' class='btn_white'><span>${gap.lang.expand}</span></button>
		                <button type='button' class='btn_blue'><span>${gap.lang.tab_reg_cal}</span></button>
		            </div>
		        </div>
		        `;
		        
		        if(flag === 'add'){
	            	var item_mask = `
	            		<div class='item_mask'><button type='button' class='btn_item_delete'></button></div>
	            	`;
	                
					$("#content_container").append(item).packery( 'prepended', $("#schedule_box") ).packery('shiftLayout');
	                $("#schedule_box").append(item_mask);						
	                $(".content_item").addClass("item_show");

					//드래그 활성화
					gcom.main_content_draggable();
	                
	            } else {
					$("#content_container").append(item);
	            }
				
				// 폴더아이템 제거 버튼
	            $(".btn_item_delete").on("click", function(){
	            	//제거하려는 아이템
	            	var item = $(this).closest(".content_item");
					//제거하려는 아이템의 키
	            	var key = item.attr("app");
	            					
	    			$(this).closest(".item_mask").remove();
					$("#content_container").packery('remove', item).packery('layout');
	
	            	$(".app_box[key='" + key + "']").removeClass("select");
	            });
	            
				var today_time = new Date().setHours(0, 0, 0, 0); // 오늘 날짜의 시간(0시 0분 0초)		
			
				var data = data;
				
			    $("#calendar").mobiscroll().datepicker({
			        controls: ['calendar'],
			        display: 'inline',
			        touchUI: true,
			        locale: mobiscroll.localeKo,
			        defaultSelection: new Date(),
			        renderCalendarHeader: function () {
			            return '<div mbsc-calendar-prev class="custom-prev"></div>' +
			                '<div mbsc-calendar-nav class="custom-nav"></div>' +
			                '<div mbsc-calendar-next class="custom-next"></div>';
			        },
			        onCellClick: function(e, inst){
			            var select_date = inst._lastSelected; // 선택한 날짜
			            gcom.datepicker_event(select_date, today_time, data);
			        },
			        onPageLoaded: function (e, inst) {
			            var select_date = new Date(inst._active); // 선택한 날짜
			            gcom.datepicker_event(select_date, today_time, data);
			            
			        },
			        
			    });
					
	                console.log(">>>>>오늘일정 데이터 로드 성공");

					resolve(item);

	            },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });

		});
		
	},
	
	// 오늘일정 데이트피커 이벤트함수
	"datepicker_event": function(select, today, data){
		
		var html = "";
	        
        if(select.getTime() === today){
            html += "<div class='schedule_title'>TODAY</div>";
        } else {
            html += "<div class='schedule_title'>" + (select.getMonth()+1) + "월 " + select.getDate() + "일" + "</div>";
        }
        
        html += "<ul class='schedule_ul'>";
        for(var i = 0; i < data.length; i++){

            if(new Date(data[i].date).getTime() === select.getTime()){

                if(data[i].schedule[0].title !== ''){
                    for(var j = 0; j < data[i].schedule.length; j++){
                        html += "<li class='schedule_li'>- " + data[i].schedule[j].title + "</li>";
                    }
                }
                
            }
        }

        html += "</ul>";
        
        $(".schedule_info_wrap").empty();
        $(".schedule_info_wrap").append(html);

        if($(".schedule_ul").html() === ''){
            $(".schedule_ul").html("<li>일정 없음</li>");
        }
		
	},
	
	//게시판 데이터 불러오는 함수
	"board_data_load": function(){
		
		return new Promise(function(resolve, reject) {

			$.ajax({
	            type: "GET",
	            url: "./resource/data/" + (userlang == "ko" ? "board_data.txt" : "board_data_en.txt"),
	            dataType: "json",
	            success: function(data){
					
					var item = `
						<div id='board_box' class='content_item' idx='5'>
	                <div>
	                    <div class='content_title_wrap'><h4 class='content_title'>${gap.lang.bbs}</h4><button type='button' class='btn arrow_right'></button></div>
	                    <div class='list_wrap'>
	                        <div class='category_wrap'>
	                            <li class='category category_board board_notice active' id='tab_bbs_notice'><span class='category_name'>${gap.lang.notice2}</span></li>
	                            <li class='category category_board board_square' id='tab_bbs_square'><span class='category_name'>${gap.lang.square}</span></li>
	                            <li class='category category_board board_cnc' id='tab_bbs_cnc'><span class='category_name'>${gap.lang.cnc}</span></li>
	                            <li class='category category_board board_tip' id='tab_bbs_tip'><span class='category_name'>${gap.lang.tipntech}</span></li>
	                        </div>
	                        <div id='board_ul' class='doc_ul'></div>
	                    </div>
	                </div>
	                    <div class='btn_wrap'>
	                        <button type='button' class='btn_white' id='btn_bbs_view_all'><span>${gap.lang.expand}</span></button>
	                    </div>
	                </div>
					`;
					
					$("#content_container").append(item);
					
	                $(".category_board").on("click", function(e){
	                    
	                    $(this).siblings().removeClass("active");
	                    $(this).addClass("active");

						var cate = $(this).attr("id").replace("tab_bbs_", "");
						var bbsdbpath = "";
						var viewname = (cate == "cnc" ? "vwEventDocsBox" : "vwAllDocsBox");
						
						if (cate == "notice"){
							bbsdbpath = window.noticedbpath;
							
						} else if (cate == "square" || cate == "cnc"){
							bbsdbpath = window.boarddbpath;
							
						} else if (cate == "tip"){
							bbsdbpath = window.tipdbpath;
						}
	                    
						$.ajax({
							type : "GET",
							url : location.protocol + "//" + window.mailserver + "/" + bbsdbpath + "/api/data/collections/name/" + viewname + "?restapi&&start=0&ps=10&entrycount=false",
							xhrFields : {
								withCredentials : true
							},				
							dataType : "json",
							success : function(res){
								$('#board_ul').empty();
								
								for(var i = 0; i < res.length; i++){
									var html = '';
									var unid = res[i]['@unid'];
									var href = res[i]['@link']['href'];
									var link = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + href.replace('api/data/documents/unid', '0') + '?opendocument';
									var title = res[i].title;
									var createddate = res[i].pubdate;
									var authorinfo = res[i].writerinfo;
									var bbs_data = {
										"unid" : unid,
										"title" : title,
										"link" : link
									}							
									html += "<li class='doc_li' id='" + unid + "'>";
									html += "<span class='item_title'>" + title + "</span>";
									html += "<div class='item_writer_wrap'>";
								//	html += "<span class='item_writer'>" + authorinfo + "</span>";
								//	html += "<span> · </span>";
									html += "<span class='item_date'>" + moment.utc(createddate).local().format('YYYY-MM-DD') + "</span>";
									html += "</div>";
									html += "</li>";
									
									$('#board_ul').append(html);
									$('#' + unid).data('info', bbs_data);
									$('#' + unid).data('link', link);
								}
								
								// 제목 클릭
								$(".doc_li").off().on('click', function(){
									var _id = $(this).attr('id');
									var _link = $('#' + _id).data('link');
									var _url = _link;
									gap.open_subwin(_url, "1200","900", "yes" , "", "yes");
								});
								
								// 버튼 클릭
								$("#btn_bbs_view_all").off().on('click', function(){
									var bbs_domain = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + bbsdbpath;
									var url = bbs_domain + "/FrameBBS?openform" + (cate == "cnc" ? "&vn=vwEventDocs" : "");
									window.open(url, "", "");
								});
							},
							error : function(e){
								gap.gAlert(gap.lang.errormsg);
								return false;
							}
						});
	                });
	
	                $("#tab_bbs_notice").click();
	                
	                console.log(">>>>>>>>>>>>게시판 데이터 로드 성공");
					
					resolve(item);

	            },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });
	
		});
		
	},
	
	"emp_search_box_draw": function(){
		
		return new Promise(function(resolve, reject) {
			
			$.ajax({
	    		type: "GET",
	    		url: "./resource/data/" + (userlang == "ko" ? "emp_search_box_data.txt" : "emp_search_box_data_en.txt"),
	    		dataType: "html",
	    		success: function(data){
	    			var item = $(data);
	
	    			$("#content_container").append(item);
					resolve(item);
					
	    		},
	    		error: function(xhr, error){
					console.log(error);
					reject(error);
	    		}
	    	});
		});
		
	},
	
	//채팅방 데이터 불러오는 함수
	"chat_data_load": function(){
		
		return new Promise(function(resolve, reject) {
			$.ajax({
	            type: "get",
	            url: "./resource/data/" + (userlang == "ko" ? "chat_data.txt" : "chat_data_en.txt"),
	            dataType: "json",
	            success: function(data){
					
					var item = `
						<div id='chat_box' class='content_item' idx='7'>
	                <div>
	                    <div class='content_title_wrap'><h4 class='content_title'>${gap.lang.chatroom}</h4><button type='button' class='btn arrow_right'></button></div>
	                    <div class='list_wrap'>
	                        <div id='chat_category' class='category_wrap'></div>
	                        <div id='chat_ul' class='msg_ul'></div>
	                    </div>
	                </div>
	                    <div class='btn_wrap'>
	                        <button type='button' class='btn_white'><span>${gap.lang.expand}</span></button>
	                    </div>
	                </div>
					`;
			
					$("#content_container").append(item);
	
	                var personal_chat_count = 0;
	                    group_chat_count = 0;
	                for(var i = 0; i < data.length; i++){
	                    if(data[i].type === 'personal'){
	                        personal_chat_count += 1;
	                    }
	                    if(data[i].type === 'group'){
	                        group_chat_count += 1;
	                    }
	                }
	                
	                var category = `<li class='category category_chat chat_personal active'><span class='category_name'>${gap.lang.individual}</span><span class='doc_count'>${personal_chat_count}</span></li>
	                <li class='category category_chat chat_group'><span class='category_name'>${gap.lang.group}</span><span class='doc_count'>${group_chat_count}</span></li>`;
	
	                $("#chat_category").append(category);
	
	                $(".category_chat").on("click", function(){ 
	
	                    var chat_li = '';
	
	                    var condition = '';
	
	                    $(this).siblings().removeClass("active");
	                    $(this).addClass("active");
	                    
	
	                    for(var i = 0; i < data.length; i++){
	                        if($(this).hasClass("chat_personal")){
	                            condition = data[i].type === "personal";
	                            
	                        }
	                        if($(this).hasClass("chat_group")){
	                            condition = data[i].type === "group";
	                        }
	                        
	                        if(condition){
	
	                            chat_li += `<li class='msg_li'>
	                            <div class='msg_title_wrap'>`;
	                            
	                            if($(this).hasClass("chat_personal")){
	                                chat_li += "<div class='sender_img' style='background-image: url(" + data[i].img + ")'></div>";
	                            }
	                            if($(this).hasClass("chat_group")){
	                                var img_arr = data[i].img.split(",");
	                                chat_li += "<div class='sender_img_wrap'>";
	                                for(var j = 0; j < img_arr.length; j++){
	                                    chat_li += "<div class='sender_img_group' style='background-image: url(" + img_arr[j] + ")'></div>";
	                                }
	                                chat_li += "</div>";
	                            }
	                            chat_li += `<div class='msg_info'>`;
	                                if($(this).hasClass("chat_personal")){
	                                    chat_li += `<span class='sender_name'>${data[i].name}</span>`;
	                                }
	                                if($(this).hasClass("chat_group")){
	                                    var count = data[i].name.split(",").length;
	                                    chat_li += `<span class='sender_name'>${data[i].name} <span class='people_count'>${count}</span></span>`;
	                                }
	                                chat_li +=`<span class='item_title'>${data[i].msg}</span>
	                            </div>
	                            </div>
	                            <div class='msg_send_time_wrap'>`;
	                            if(new Date(data[i].date) < new Date().setHours(0, 0, 0, 0)){ //오늘 이전날짜에 전송된 메일인 경우
	                                if(new Date(data[i].date).getFullYear() < new Date().getFullYear()){ // 올해 이전의 날짜에 전송된 메일인 경우
	                                    //연,월,일 모두 표시
	                                    date = new Date(data[i].date).getFullYear() + "년 " + (new Date(data[i].date).getMonth()+1) + "월 " + new Date(data[i].date).getDate() + "일";
	                                    chat_li += "<span class='send_time'>" + date + "</span>";
	                                } else { // 오늘 이전의 날짜이지만 올해안에 전송된 메일인 경우
	                                    //월,일까지 표시
										if (userlang == "ko"){
											date = (new Date(data[i].date).getMonth()+1) + "월 " + new Date(data[i].date).getDate() + "일";
										}else{
											date = (new Date(data[i].date).getMonth()+1) + "-" + new Date(data[i].date).getDate();
										}
	                                    chat_li += "<span class='send_time'>" + date + "</span>";
	                                }
	                            } else { //오늘 전송된 메일인 경우
	                                //시간만 표시, 단 오전, 오후 구분
	                                if(new Date(data[i].date).getHours() < 12) { //오전 시간대 인경우
	                                    date = "오전 " + new Date(data[i].date).getHours() + ":" + addZero(new Date(data[i].date).getMinutes());
	                                } else {
	                                    date = "오후 " + (new Date(data[i].date).getHours() - 12) + ":" + addZero(new Date(data[i].date).getMinutes());
	                                }
	                                chat_li += "<span class='send_time'>" + date + "</span>";
	                            }
	                            // chat_li += "<span class='send_time'>${data[i].date}</span>";
	                            if(data[i].unread_count !== 0){ // 안읽은 메시지가 있을경우만 표시
	                                chat_li += `<div class='unread_count_wrap'><span class='unread_count'>${data[i].unread_count}</span></div>`
	                            }
	                            chat_li += `
	                            </div>
	                            </li>`
	                        }
	                    }
	
	                    $("#chat_ul").empty();
	                    $("#chat_ul").append(chat_li);
	
	                });
	
	                $(".category_chat.chat_personal").click();
	
	                console.log(">>>>>>>>>채팅 데이터 로드 성공");
					resolve(item);

	            },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });

		});
		
	},
	
	//진행중인 설문 데이터 가져오는 함수
	"survey_data_load": function(){
		return new Promise(function(resolve, reject) {
			$.ajax({
	            type: "GET",
	            url: "./resource/data/" + (userlang == "ko" ? "survey_data.txt" : "survey_data_en.txt"),
	            dataType: "json",
	            success: function(data){
	            
	            	var item = `
	            		<div id='survey_box' class='content_item' idx='8'>
	                    <div class='content_title_wrap'><h4 class='content_title'>${gap.lang.ongoing_survey}</h4><button type='button' class='btn arrow_right'></button></div>
	                    
	                    <div class='btn_wrap'>
	                        <button type='button' class='btn_blue'><span>${gap.lang.survey_participation}</span></button>
	                    </div>
	                </div>
	            	`;
	            	
	    			$("#content_container").append(item);
	
	                var html = "";
	            
	                var today = new Date().setHours(0,0,0,0);
	                var end = new Date(data[0].period.end);
	
	                var start_day = new Date(data[0].period.start).getDay();
	                var end_day = new Date(data[0].period.end).getDay();
	
	                html += `
	                        <div class='survey_title_wrap'>
	                        <div class='survey_desc_wrap'>
	                        <li class='survey_desc'>${(today - end) / (1000 * 60 * 60 * 24)}${gap.lang.day} ${gap.lang.remaining}</li>
	                        `
	                            if(data[0].anonymous === "yes"){
	                                html += "<li class='survey_desc _anonymous'>" + gap.lang.real_name + "</li>"
	                            }
	                            if(data[0].anonymous === "no"){
	                                html += "<li class='survey_desc '>" + gap.lang.real_name + "</li>"
	                            }
	                        html += `</div>
	                        <div>
	                            <h4>${data[0].title}</h4>
	                        </div>
	                    </div>
	                    <div class='survey_info_wrap'>
	                        <div class='survey_info'>
	                            <div class='info_title'>${gap.lang.maker}</div><div>${data[0].writer.name} / ${data[0].writer.dept} / ${data[0].writer.hierarchy}</div>
	                        </div>
	                        <div class='survey_info'>
	                            <div class='info_title'>${gap.lang.survey_period}</div><div>${data[0].period.start}${"(" + gcom.return_day(start_day) + ")"} ~ ${data[0].period.end}${"(" + gcom.return_day(end_day) + ")"}</div>
	                        </div>
	                    </div>
	                `;
	
	                $("#survey_box .content_title_wrap").after(html);
	
	                console.log(">>>>>>>>설문조사 데이터 로드 성공");

					resolve(item);

	            },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });

		});
		
	},
	
	"bookmark_data_load": function(){
		
		return new Promise(function(resolve, reject) {
			
			$.ajax({
	    		type: "GET",
	    		url: "./resource/data/bookmark_data.txt",
	    		dataType: "json",
	    		success: function(data){
	    		
	    			var item = `
	    				<div id='bookmark_app_box' class='content_item' idx='9'>
	                    <div class='content_title_wrap'><h4 class='content_title'>즐겨찾는 APP</h4><button type='button' class='btn btn_setting'></button></div>
	                    <div class='app_box_wrap'>`;
	                    
	                    /*for(var i = 0; i < bookmark_app_list.length; i++){
	                        html += `<div class='app_box'>
	                                <div class='app_info_wrap'>
	                                    <div class='app_img' style='background-image: url(./resource/images/${bookmark_app_list[i].img}'></div>
	                                    <div class='app_title'>${bookmark_app_list[i].title}</div>
	                                </div>
	                            </div>`;
	                    }*/
	                    html += `</div>
	                </div>
	    			`;
	    			
	    			$("#content_container").append(item);
	    			
	    			var html = '';
	    			
	    			for(var i = 0; i < data.length; i++){
	                    html += `<div class='app_box'>
	                            <div class='app_info_wrap'>
	                                <div class='app_img' style='background-image: url(${data[i].img})'></div>
	                                <div class='app_title'>${data[i].title}</div>
	                            </div>
	                        </div>`;
	                }
	                
	                $("#bookmark_app_box .app_box_wrap").append(html);
	    			
	    			console.log(">>>>>>>북마크 데이터 로드 성공");
					
					resolve(item);

	    		},
	    		error: function(xhr, error){
	    			console.log(error);
					reject(error);
	    		}
	    	});

		});
		
	},
	
	//폴더 개인화
	"folder_personalize": function(){
		
		var folder_name = $(".user_folder_title").text(); // 폴더명
            
            // 폴더 타이틀 영역에 넣을 html
            var title_html = `
                <div id='folder_title_btn_wrap' class='btn_wrap'>
					<div id='layout_chkbox_wrap' class="chkbox_wrap">
						<label for="layout_sort" class="chkbox_label"><input id="layout_sort" class="layout_sort_chkbox" type="checkbox"><span class="chkbox"></span><span class="label_txt">레이아웃 붙이기</span></label>
					</div>
                    <button type='button' id='btn_folder_cancel' class='folder_btn'><span class='btn_img'></span><span>취소</span></button>
                    <button type='button' id='btn_folder_save' class='folder_btn'><span class='btn_img'></span><span>저장</span></button>
                </div>
            `;
            
            //폴더 아이템에 씌울 마스크
            var mask_html = `
                <div class='item_mask'><button type='button' class='btn_item_delete'></button></div>
            `;
            
            $(".user_folder_title, #btn_folder_setting").hide();

            gcom.app_area_data_load();

            $(".user_folder_title_wrap").prepend(title_html);
			
			// 뉴스를 제외한 나머지 폴더아이템에 마스크를 씌운다
			for(var i = 0; i < $(".content_item").length; i++){
				if(!$(".content_item").eq(i).hasClass("stamp")){
					$(".content_item").eq(i).append(mask_html);
				}
			}
			
			//드래그 활성화
			gcom.main_content_draggable();
			
            // packery 아이템 제거 버튼
            $(".btn_item_delete").on("click", function(){
            	//제거하려는 아이템
            	var item = $(this).closest(".content_item");
				//제거하려는 아이템의 키
            	var key = item.attr("app");
            					
    			$(this).closest(".item_mask").remove();
				$("#content_container").packery('remove', item).packery('layout');

            	$(".app_box[key='" + key + "']").removeClass("select");
            });
	
			//레이아웃 자동정렬 체크박스
			$("#layout_sort").on("change", function(){
				if($(this).prop("checked")){ //체크되면 자동정렬
					$("#content_container").packery("layout");
				}
			});
			
			//저장버튼
			$("#btn_folder_save").on("click", function(){
				
				$("#app_area, .input_folder_name, #folder_title_btn_wrap, .item_mask").remove();
                $(".user_folder_title, #btn_folder_setting").show();
				$(".personal_box").show();
				
	            gcom.main_layout_save(); //위치좌표 저장
				//gcom.main_layout_load(); //위치좌표 불러오기
				
				$("#content_container").packery('destroy');
				gcom.area_right_draw();
				
			});
            // 취소버튼
            $("#btn_folder_cancel").on("click", function(){
            	
                $("#app_area, .input_folder_name, #folder_title_btn_wrap, .item_mask").remove();
                $(".user_folder_title, #btn_folder_setting").show();
				$(".personal_box").show();
				
				//수정 전 원래대로 돌아가기
				$("#content_container").packery('destroy');
				gcom.area_right_draw();
            });
		
	},
	
	//사용자 콘텐츠 드래그 활성화하는 함수
	"main_content_draggable": function(){
		
		//드래그할땐 layout 속도 높임
		/*$("#content_container").packery({
			stagger: 20,
		});*/
		
		var pckry = Packery.data( $("#content_container")[0] );
		
		//드래그할땐 layout 속도 높임
		pckry.options.stagger = 20;
		
		//드래그 기능 활성화
		var $items = $('.content_item').draggable({
			cancel: ".stamp",
			containment: "#content_container",
			start: function(event, ui) {
	            var $this = $(this);
	            $this.data('originalPosition', $this.position()); // 현재 드래그하려는 태그의 좌표
	        },
	        stop: function(event, ui) {
		
				var droppedPosition = ui.position; //드롭한 위치의 좌표
				
	            var droppedElement = document.elementsFromPoint(event.pageX, event.pageY); //드롭한 위치에 놓인 태그들
	            var $droppedOnItem = $(droppedElement).closest('.stamp'); //찾으려는 태그
				
	            // Exclude the dragged element itself
	            if ($droppedOnItem.length && !$droppedOnItem.is(ui.helper) && $droppedOnItem.attr("id") === 'news_box') {
					//스탬프에 드랩한 경우 원래 위치로 되돌린다.
					var shouldRevert = true; // Replace with your own condition
					console.log("스탬프에 드롭했습니다.");
	            }
			
	            if (shouldRevert) { //스탬프(고정콘텐츠에 드롭됐을 때)
	                var originalPosition = $(this).data('originalPosition');
	                $(this).animate({
	                    left: originalPosition.left,
	                    top: originalPosition.top
	                }, 150, function() {
	                    //자동정렬 체크되어있을 때
						if($("#layout_sort").prop("checked")){
				            $("#content_container").packery('layout');						
						} else {
						//자동정렬 체크되어있지 않을 때
							$("#content_container").packery('shiftLayout');
						}
	                });

	            } else {
		
                    var $this = $(this);
                    var $prevItem = $droppedOnItem.prev();
                    if ($prevItem.length) {
                        $prevItem.after($this);
                    } else {
                        $droppedOnItem.before($this);
                    }
					//자동정렬 체크되어있을 때
					if($("#layout_sort").prop("checked")){
			            $("#content_container").packery('layout');						
					} else {
					//자동정렬 체크되어있지 않을 때
						$("#content_container").packery('shiftLayout');
					}
	            }

	        }

		});

		$(".content_item:not('.stamp')").addClass("draggable"); //드래그하려는 태그의 커서를 pointer로 변경
		$("#content_container").packery( 'bindUIDraggableEvents', $items ).packery("shiftLayout");
		
	},
	
	//사용자 개인영역(왼쪽영역)에 앱 목록 데이터 불러오는 함수
	"app_area_data_load": function(){
		
		$.ajax({
            type: "GET",
            url: "./resource/data/app_area_data.txt",
            dataType: "json",
            success: function(data){
				
                var html = '';
        
                html += `
                    <div id='app_area'>
                        <div class='inner'>
                            <div class='app_search_wrap'>
                                <div class='searcch_input_wrap'><input type='text' id='input_app_search' class='search_input' placeholder='검색어를 입력해주세요'></div>
                                <button type='button' id='btn_app_search' class='app_search_btn'><span>검색</span></button>
                            </div>`;

                            for(var i = 0; i < data.length; i++){
                                html += "<div class='app_wrap'>";
                           		html += "<div class='app_box_title'><h4>" + data[i].name + "</h4><button type='button' id='' class='btn btn_fold open'></button></div>";
                           		html += "<div class='app_list'>";
								for(var j = 0; j < data[i].apps.length; j++){
									if(data[i].apps[j]['select'] === 'on'){
										html += "<div class='app_box select' key='" + data[i].apps[j]['key'] + "'>";
									} else {
										html += "<div class='app_box'>";
									}
									
									html += "<div class='app_box_inner'>";
									html += "<div class='app_box_img' style='background-image: url(" + data[i].apps[j]['img'] + ")'></div>";
									html += "<span class='app_box_name'>" + data[i].apps[j]['app_name'] + "</span>";
									html += "</div></div>";
                            	}
                            	html += "</div>";
                            	html += "</div>";
                            }
                            
                        html += `</div>
                    </div>
                `;
                
                $("#personal_area").append(html);
	
				$(".app_box").on("click", function(e){
				
					var key = $(this).attr("key");
					
					//해당 key를 가진 아이템이 존재하지 않을 때만 추가
					if(key !== undefined && $(".content_item[app='"+ key + "']").length === 0){
						$(this).addClass("select");	
					} else {
						$(this).removeClass("select");
					}
					
					if(!$(this).hasClass("select")){ //선택해제한 앱의 콘텐츠를 제거한다.
						$("#content_container").packery('remove', $(".content_item[app='"+ key + "']")).packery('layout');
					}
					if($(this).hasClass("select")){ //선택한 앱의 콘텐츠를 그린다.
						
							if(key === 'mail'){
								gcom.mail_data_load('add');
							}
							if(key === 'calendar'){
								gcom.schedule_data_load('add');
							}
							if(key === 'approval'){
								gcom.approval_data_load('add');
							}

					}
					
				});
		
                console.log(">>>>>>앱 목록 데이터 로드 성공");                

            },
            error: function(xhr, error){
                console.log(error);
            }
        });
		
	},
	
	//알림 팝업창 그리는 함수
	"notification_popup_draw": function(category){
		
		$.ajax({
			type: "GET",
			url: "./resource/data/notify_category_data.txt",
			dataType: "json",
			success: function(data){
				
				var html = '';
				
				var all = 0;
				var mail = 0;
				var approval = 0;
				var workplace = 0;
				
				
				
				html += `<div id='notify_popup'>
						
						<div class='box_top'><h4>알림</h4></div>
						<div class='box_mid'>
							<div class='category_box'>
								<div class='category_wrap'>`;
									for(var i = 0; i < data.length; i++){
										if(i === 0){ 
											html += `<li class='category active' key='${data[i].category}'><div class='category_inner'><span class='category_name'>${data[i].category_ko}</span><span class='category_count_wrap'><span class='category_count'>${data[i].length}</span></span></div></li>`;
										} else {
											html += `<li class='category' key='${data[i].category}'><div class='category_inner'><span class='category_name'>${data[i].category_ko}</span><span class='category_count_wrap'><span class='category_count'>${data[i].length}</span></span></div></li>`;	
										}										
									}

									html+= `<span class='indicator_bar'></span>
								</div>
								<button type='button' class='btn_notify_setting'><span class='notify_setting_img'></span></button>
							</div>
							<div id='notify_ul'>
								<div class='notify_ul_inner'></div>
							</div>
						</div>
						<div class='box_bot'>
							<div class='bot_btn_wrap'>
							<button type='button' class='btn_all_remove'><span class='all_remove_img'></span><span>전체삭제</span></button>
							<button type='button' class='btn_all_read'><span class='all_read_img'></span><span>전체읽기</span></button>
							</div>
						</div>
				</div>`;
				
				$("#area_top").append(html);
				
				gcom.notification_data_load('all');
				
				$("#notify_popup .category").on("click", function(){
					var idx = $(this).index();
					
					var category = $(this).attr("key");
					
					$(this).addClass("active");
					$(this).siblings().removeClass("active");
					
					$("#notify_popup .indicator_bar").css({
						"left": $(this).outerWidth() * idx
					});
					
					gcom.notification_data_load(category);
					
				});
				
				console.log(">>>>>>>알림팝업 그리기");
			},
			error: function(xhr, error){
				console.log(error);
			}
		});
		
	},
	
	//알림 팝업창 데이터 불러오는 함수
	"notification_data_load": function(key){
		
		$.ajax({
			type: "GET",
			url: "./resource/data/notify_data.txt",
			dataType: "json",
			success: function(data){
				
				var html = '';

				$(".notify_ul_inner").empty();

				for(var i = 0; i < data.length; i++){
					if(data[i].category === key || key === 'all'){
						html += `<li class='notify_li unread'>
						<div class='profile_img_wrap'>
							<div class='profile_img' style='background-image: url("${data[i].head.img}")'></div>`;
							if(data[i].head.status === 'on'){ //접속중인 유저일때
								html +=`<span class="user_status on"><span class="status_circle"></span></span>`;
							} else { //접속중이지 않은 유저일때
								html +=`<span class="user_status"><span class="status_circle"></span></span>`;
							}
						html += `</div>
						<div class='notify_desc_wrap'>
							<div class='notify_desc'>
								<div class='notify_desc_inner'>`;
						
						//글 작성시간
						var uptime = gcom.time_transform(new Date() - new Date(data[i].head.time));
						var detail_uptime = gcom.time_transform(new Date() - new Date(data[i].detail.time));
						
						if(data[i].category === 'approval'){
							html +=`<div class='notify_desc_inner_wrap'><span class='notify_title_wrap'><strong>${data[i].head.name}</strong>님이 <strong class='notify_title'>${data[i].head.to}</strong> 승인을 요청했습니다.</span><span class='read_status'></span></div>
									<span class='notify_time'>${uptime} 전 · 전자결재</span>
								</div>`;
						}
						if(data[i].category === 'workplace'){
							if(data[i].head.type === 'reply_regist'){
								html +=`<div class='notify_desc_inner_wrap'><span class='notify_title_wrap'><strong>${data[i].head.name}</strong>님이 '<strong class='notify_title'>${data[i].head.to}</strong>'댓글을 등록했습니다.</span><span class='read_status'></span></div>
									<span class='notify_time'>${uptime} 전 · 업무방</span>
								</div>`;
							}
							if(data[i].head.type === 'post_regist'){
								html +=`<div class='notify_desc_inner_wrap'><span class='notify_title_wrap'><strong>${data[i].head.name}</strong>님이 <strong class='notify_title'>${data[i].head.to}</strong>에 글을 등록했습니다.</span><span class='read_status'></span></div>
									<span class='notify_time'>${uptime} 전 · 업무방</span>
								</div>`;											
							}
						}
								
							html +=`</div>
							<div id='notify_detail'>
							 	<div class='detail_title_wrap'>
									<div class='detail_title_box''>`;
									if(data[i].head.type_img !== ''){
										html +=`<div class='notify_type'><span class='notify_type_img' style='background-image: url("${data[i].head.type_img}")'></span></div>`;														
									}
									
									html +=`<div class='detail_title_txt'>
										<div class='detail_title'>${data[i].detail.title}</div>`;
										
									if(data[i].category === 'workplace' && data[i].head.type === 'reply_regist'){
										//댓글등록일때는 비움
									} else {
										html += `<div class='detail_time_wrap'><span>${detail_uptime} 전 · ${data[i].detail.writer} 제작</span></div>`;
									}
									html += `</div></div>`;
									
								//해당 글로 이동하기 버튼은 결재알림을 제외하고 모두 표시
								if(data[i].category !== 'approval'){
									html +=`<button type='button' class='btn_to_post'></button>`;													
								}
																				
								html += `</div>`;
								if(data[i].category === 'approval'){
									html += `<div class='detail_btn_wrap'>
												<button type='button' class='detail_btn btn_doc_view'><span>문서보기</span></button>
												<button type='button' class='detail_btn btn_approve'><span>승인</span></button>
										</div>
									`;
								}
						
						html += `
								</div>
							</div>
						</li>`;
					}
				
				}
				if(html === ''){
					html += "<li class='notify_li none_notify'><strong>알림이 없습니다.</strong></li>";
				}

				$(".notify_ul_inner").append(html);
					
				console.log(">>>>>>>>>>알림 팝업창 데이터 로드 성공");
			},
			error: function(xhr, error){
				console.log(error);
			}
		});
		
	},
	
	//TO-DO 그래프 전체보기 레이어 그리는 함수
	"todo_work_layer_draw": function(){
		
		var mask = '';
		var layer = '';
		
		mask += "<div class='mask_top'></div><div class='mask_bot'></div>";
		
		layer += "<div id='todo_work_area'>";
		
		/*layer += "<div class='arc_top'></div><div class='arc_bot'></div><div class='border_hide_bar'></div>"*/
		layer += "<div class='box_top'>"
		layer += "<div class='tab_box'>";
		layer += "<li id='tab_todo_state' class='tab_li state active'><span class='btn_img'></span><span class='tab_txt'>상태</span></li>";
		layer += "<li id='tab_todo_manager' class='tab_li manager'><span class='btn_img'></span><span class='tab_txt'>담당자</span></li>";
		layer += "</div>";
		layer += "<button type='button' id='btn_work_area_close' class='close_btn'></button>"
		layer += "</div>";
		
		layer += "<div class='box_content'>";
		
		//업무목록 append할 위치
		
		layer += "</div>"; //box_content
		
		layer += "</div>";
		
		layer += "</div>";
		
		$("#personal_area").addClass("no_scroll");
		$("#todo_graph_wrap").addClass("work_view");
		
		//레이어 표시
		if($("#todo_work_area").length === 0){
			
			$("#personal_area").append(mask);
			$("#area_right").append(layer);			
			
			// 업무콘텐츠 그리기
			gcom.todo_work_list_draw('by_state');
			
			// border 라운딩 처리하는 태그 css
			$("#personal_area .mask_top").css({
				"top" : $("#area_top").outerHeight(),
				"height": $("#todo_graph_wrap").position().top + 1
			});
			$("#personal_area .mask_bot").css({
				"top": $("#area_top").outerHeight() + $("#todo_graph_wrap").position().top + $("#todo_graph_wrap").outerHeight() - 1,
				"height": $("#todo_list_wrap").outerHeight() + parseInt($("#todo_list_wrap").css("padding")) * 2
			});
			
			//탭 버튼
			$("#todo_work_area .tab_li").on("click", function(){
				
				var id = $(this).attr("id");
				var category = '';
				
				$(this).siblings().removeClass("active");
				$(this).addClass("active");
				
				var graph_tab_id = $(".todo_tab_li.active").attr("id");
				var graph_type = "";
				
				//TODO 그래프 켜져있는 탭버튼의 ID
				if(graph_tab_id === "tab_todo_mine"){
					graph_type = "mine";
				}
				if(graph_tab_id === "tab_todo_others"){
					graph_type = "others";
				}
				
				//업무 레이어안의 켜져있는 탭버튼 ID
				if(id === 'tab_todo_state'){
					category = 'by_state';					
				}
				if(id === 'tab_todo_manager'){
					category = 'by_manager';
				}
				
				gcom.todo_graph_draw(graph_type, category);
				gcom.todo_work_list_draw(category);
			});
			
		}
		
	},
	
	//TO-DO 그래프 업무목록 그리는 함수
	"todo_work_list_draw": function(category){
		$.ajax({
			type: "GET",
			url: "./resource/data/todo_work_list_data_" + category + ".txt",
			dataType: "json",
			success: function(data){
				
				var html = '';
				var table = '';
				
				//thead
				var thead = ["업무명", "코멘트", "상태", "담당자", "시작일", "마감일", "우선순위", "진행률", "파일"];
				
				var work_type = "";
				
				//담당자별 업무를 지시한 사람을 나타낼 변수
				var order = "";
				
				if($("#tab_todo_state").hasClass("active")){
					if($("#tab_todo_mine").hasClass("active")){
						work_type = "mine";
					}
					if($("#tab_todo_others").hasClass("active")){
						work_type = "others";
					}					
				}
				if($("#tab_todo_manager").hasClass("active")){
					
					work_type = "manager";
					
					//나에게 할당된 업무		
					if($("#tab_todo_mine").hasClass("active")){
						order = "others";
					}
					//내가 지시한 업무
					if($("#tab_todo_others").hasClass("active")){
						order = "me";
					}
				}
				
				
				for(var i = 0; i < data.length; i++){
					
					//상태별 업무목록
					if(category === 'by_state' && data[i].work_type === work_type) {
						html += "<div class='work_wrap'>";
						
						if( work_type === "mine" ){
							html += "<div class='work_title'>나에게 할당된 업무</div>";
						}
						if( work_type === "others" ){
							html += "<div class='work_title'>내가 지시한 업무</div>";
						}
											
						html += "<div class='work_list_box_wrap'>";
						
						for(var j = 0; j < data[i].work.length; j++){
						
						if(data[i].work[j].state === 'progress') {
							html += "<div class='work_list_box progress_work'>";					
						}						
						if(data[i].work[j].state === 'complete') {
							html += "<div class='work_list_box complete_work'>";
						}
						
						html += "<div class='work_list_title_wrap'>";
							
						html += "<div class='work_list_title'>";
						if(data[i].work[j].state === 'progress') {
							html += "<div class='work_list_title_txt_wrap'><span>진행중</span><span class='work_list_count'>(" + data[i].work[j].list.length + ")</span></div>";						
							html += "<button type='button' class='btn_work_list_fold'></button>";
						}
						if(data[i].work[j].state === 'complete') {
							html += "<div class='work_list_title_txt_wrap'><span>완료</span><span class='work_list_count'>(" + data[i].work[j].list.length + ")</span></div>";
							html += "<button type='button' class='btn_work_list_fold'></button>";
						}
						html += "</div>"; //work_list_title
						
						if(data[i].work[j].state === 'progress') {
							html += "<div class='work_btn_wrap'>";
							html += "<button type='button' class='work_btn filter_btn'><span class='btn_img'></span><span>필터</span></button>";
							html += "<button type='button' class='work_btn work_regist_btn'><span class='btn_img'></span><span>업무등록</span></button>";
							html += "</div>"; //work_btn_wrap
						}
						
						html += "</div>"; //work_list_title_wrap
						
						
						table = '';
						table += "<div class='work_table'>";
						table += "<div class='thead'>";
						
						for(var k = 0; k < thead.length; k++) {
							table += "<div class='thead_td'>" + thead[k] + "</div>";			
						}
						table += "</div>"; //thead
						
						//리스트
						table += "<div class='list_ul'>";
						
						for(var n = 0; n < data[i].work[j].list.length; n++){
							
							table += "<div class='list_tr'>";
							table += 	"<div class='list_td'><div class='td_inner'><span class='work_name'>" + data[i].work[j].list[n].name + "</span></div></div>";
							table += 	"<div class='list_td'><div class='td_inner comment_wrap'><span class='comment_img'></span><span>" + data[i].work[j].list[n].comment + "</span></div></div>";
							table += 	"<div class='list_td'><div class='td_inner'><span class='work_state " + data[i].work[j].list[n].state + "'>" + data[i].work[j].list[n].state_ko + "</span></div></div>";
							table += 	"<div class='list_td'><div class='td_inner'><span class='profile_img' style='background-image: url(" + data[i].work[j].list[n].manager + ")'></span></div></div>";
							table += 	"<div class='list_td'><div class='td_inner'><span class='start_date'>" + data[i].work[j].list[n].start_date + "</span></div></div>";
							table += 	"<div class='list_td'><div class='td_inner'><span class='deadline_date'>" + data[i].work[j].list[n].deadline_date + "</span></div></div>";
							table += 	"<div class='list_td'><div class='td_inner'><span class='work_priority " + data[i].work[j].list[n].priority + "'></span><span>" + data[i].work[j].list[n].priority_ko + "</span></div></div>";
							table += 	"<div class='list_td'><div class='td_inner progress_rate_wrap'><span class='progress_rate_bar'><span class='progress_rate'></span></span><span class='progress_rate_txt'>" + data[i].work[j].list[n].progress_rate + "</span></div></div>";
							table += 	"<div class='list_td'><div class='td_inner'><span class='file_img'></span><span class='count_file'>" + data[i].work[j].list[n].file + "</span></div></div>";
							table += "</div>";							
						}
						
						table += "</div>"; //list_ul
						
						table += "</div>"; 
						//테이블
				
						html += table; //work_list_box에 테이블 추가
						
						html += "</div>"; //work_list_box
						
						
						}
						html += "</div>";
						html += "</div>"; //work_wrap
					}

					//담당자별 업무목록
					if(category === 'by_manager' ) {
						html += "<div class='work_wrap'>";
					
						html += "<div class='work_title'>담당자별 업무</div>";
					
																		
						html += "<div class='work_list_box_wrap'>"; //이 안에 담당자별 업무목록이 있어야 간격 40px
							
						for(var j = 0; j < data[i].persons.length; j++){
							
							if( data[i].persons[j].order === order ){
								
								html += "<div class='work_list_box'>";
						
								html += "<div class='work_list_title_wrap'>";
									
								html += "<div class='work_list_title'>";
								
								if(j === 0){ //나의 이름은 푸른색상으로 표시
									html += "<div class='work_list_title_txt_wrap'><span class='my_name'>" + data[i].persons[j].manager + "</span><span class='work_list_count'>(" + data[i].persons[j].list.length + ")</span></div>";
								} else {
									html += "<div class='work_list_title_txt_wrap'><span>" + data[i].persons[j].manager + "</span><span class='work_list_count'>(" + data[i].persons[j].list.length + ")</span></div>";
								}
	
								html += "<button type='button' class='btn_work_list_fold'></button>";
								
								html += "</div>"; //work_list_title
								
								html += "<div class='work_btn_wrap'>";
								html += "<button type='button' class='work_btn filter_btn'><span class='btn_img'></span><span>필터</span></button>";
								html += "<button type='button' class='work_btn work_regist_btn'><span class='btn_img'></span><span>업무등록</span></button>";
								html += "</div>"; //work_btn_wrap
								
								html += "</div>"; //work_list_title_wrap
								
								table = '';
								table += "<div class='work_table'>";
								table += "<div class='thead'>";
							
								for(var k = 0; k < thead.length; k++) {
									table += "<div class='thead_td'>" + thead[k] + "</div>";
								}
								table += "</div>"; //thead
								
								//리스트
								table += "<div class='list_ul'>";
								
								for(var n = 0; n < data[i].persons[j].list.length; n++){
									
									table += "<div class='list_tr'>";
									table += 	"<div class='list_td'><div class='td_inner'><span class='work_name'>" + data[i].persons[j].list[n].name + "</span></div></div>";
									table += 	"<div class='list_td'><div class='td_inner comment_wrap'><span class='comment_img'></span><span>" + data[i].persons[j].list[n].comment + "</span></div></div>";
									table += 	"<div class='list_td'><div class='td_inner'><span class='work_state " + data[i].persons[j].list[n].state + "'>" + data[i].persons[j].list[n].state_ko + "</span></div></div>";
									table += 	"<div class='list_td'><div class='td_inner'><span class='profile_img' style='background-image: url(" + data[i].persons[j].list[n].manager + ")'></span></div></div>";
									table += 	"<div class='list_td'><div class='td_inner'><span class='start_date'>" + data[i].persons[j].list[n].start_date + "</span></div></div>";
									table += 	"<div class='list_td'><div class='td_inner'><span class='deadline_date'>" + data[i].persons[j].list[n].deadline_date + "</span></div></div>";
									table += 	"<div class='list_td'><div class='td_inner'><span class='work_priority " + data[i].persons[j].list[n].priority + "'></span><span>" + data[i].persons[j].list[n].priority_ko + "</span></div></div>";
									table += 	"<div class='list_td'><div class='td_inner progress_rate_wrap'><span class='progress_rate_bar'><span class='progress_rate'></span></span><span class='progress_rate_txt'>" + data[i].persons[j].list[n].progress_rate + "</span></div></div>";
									table += 	"<div class='list_td'><div class='td_inner'><span class='file_img'></span><span class='count_file'>" + data[i].persons[j].list[n].file + "</span></div></div>";
									table += "</div>";
								}
								
								table += "</div>"; //list_ul
								
								table += "</div>"; 
								//테이블
						
								html += table; //work_list_box에 테이블 추가
								
								html += "</div>"; //work_list_box
							
							}
							
						}
						
						html += "</div>";
						html += "</div>"; //work_wrap
						
					}
					
				}
				
				
				$("#todo_work_area .box_content").empty();
				$("#todo_work_area .box_content").append(html);
				
				//업무 진행률 바 애니메이션
				for(var i = 0; i < $("#todo_work_area .progress_rate").length; i++){
					$("#todo_work_area .progress_rate").eq(i).animate({
						"width": parseInt($("#todo_work_area .progress_rate_txt").eq(i).text()) + "%"
					});
				}
				
				//오늘날짜(YYYY-MM-DD형식)
				var today = new Date().getFullYear() + "-" + gcom.addZero(new Date().getMonth()+1) + "-" + gcom.addZero(new Date().getDate());
				
				//업무 마감일 체크
				for(var i = 0; i < $(".work_list_box .list_tr").length; i++){
					if( $(".work_list_box .deadline_date").eq(i).text() === today){
						$(".work_list_box .deadline_date").eq(i).closest(".list_tr").addClass("deadline_work");
					}
				}
				
				// ESC키로 업무창 닫기
				$(document).on("keydown", function(e){
					if(e.keyCode === 27){
						$("#btn_work_area_close").click();
					}
				});
				
				//todo 업무 전체보기 닫기
				$("#btn_work_area_close, #todo_graph_close").on("click", function(){
					$("#btn_todo_work_all_view").removeClass("disable");
					$("#personal_area").removeClass("no_scroll");
					$("#todo_graph_wrap").removeClass("work_view");
					$("#personal_area .mask_top, #personal_area .mask_bot").remove();
					$("#todo_work_area").remove();
					
					var graph_tab_id = $(".todo_tab_li.active").attr("id");
					var graph_type = "";
					
					if( graph_tab_id === "tab_todo_mine" ){
						graph_type = "mine";
					}
					if( graph_tab_id === "tab_todo_others" ){
						graph_type = "others";
					}
					
					gcom.todo_graph_draw(graph_type, "by_state");
					
				});
				
				//업무창 펼치기/접기
				$("#todo_work_area .btn_work_list_fold").on("click", function(){
					$(this).toggleClass("fold");
					$(this).closest(".work_list_box").find(".work_table").toggle();
				});
				
				console.log("TO-DO 전체보기 데이터 로드 성공");
			},
			error: function(xhr, error){
				console.log(error);
			}
		});
	},
	
	"event_bind": function(){
		
		$(document).on("click", function(e){
			
			//알림창 바깥영역 클릭시 알림창 닫기/ 알림버튼 비활성화
			if(!$(e.target).closest('#notify_popup').length && !$(e.target).is('#btn_notification')){
				$("#btn_notification").removeClass("active");
				$("#notify_popup").remove();
			}
			
		});
		
		$("#dark_layer").on("keydown", function(e){
			if(e.keyCode === 27){
				$(this).fadeOut(150);
				$(this).empty();
			}
		});
		
		//전체메뉴 레이어 열기
		$("#btn_all_menu_open").on("click", function(){
			$("#all_menu_layer").fadeIn(100);
			gcom.all_menu_data_load();
			
			$(document).on("keydown", function(e){
				if(e.keyCode === 27){
					$("#btn_all_menu_layer_close").click();
				}
			});
			
		});
		
		//통합검색 버튼
		$("#btn_search").on("click", function(){
			
			var keyword = $("#input_search").val();
			
			if( keyword !== '' ){
				gcom.search_result_draw(keyword);
				
				/*$("#search_layer").hide(); // 통합검색 레이어 숨김
				$("#input_search").val(""); // 검색어 입력창 비우기*/
				
			} else {
				alert("검색어를 입력해주세요.");
			}
		});
		//통합검색 입력창
		$("#input_search").on("keydown", function(e){
			
			if( e.keyCode === 13 ){
				
				var keyword = $(this).val();
				
				if( keyword !== '' ) {
					gcom.search_result_draw(keyword);
					
					/*$("#search_layer").hide(); // 통합검색 레이어 숨김
					$("#input_search").val(""); // 검색어 입력창 비우기*/
				} else {
					alert("검색어를 입력해주세요.");
				}
				
			}
			
		});
		
		//통합검색 레이어 열기
		$("#btn_search_layer_open").on("click", function(){
			$("#search_layer").fadeIn(100);
			$("#search_selectmenu").selectmenu();
			$("#input_search").focus();
			
			$(document).on("keydown", function(e){
				if(e.keyCode === 27){
					$("#btn_search_layer_close").click();
				}
			});
			
		});				
		//통합검색 레이어 닫기
		$("#btn_search_layer_close").on("click", function(){
			$("#search_layer").fadeOut(100);
		});
		
		//알림 버튼
		$("#btn_notification").off();
		$("#btn_notification").on("click", function(e){
			e.stopPropagation();
						
			if($(this).hasClass("active")){ // 팝업이 켜져있을 때
				$(this).removeClass("active");
				$("#notify_popup").remove();
			} else {
				$(this).addClass("active");
				gcom.notification_popup_draw("all");
			}
			
		});
		
		// 사용자 이름/이미지 클릭
		$("#area_top_status").off();
		$("#area_top_status").on("click", function(e){
			var idx = gap.maxZindex() + 1;
			$.contextMenu( 'destroy', "#area_top_status" );
			$.contextMenu({
				selector : "#area_top_status",
				zIndex : idx,
				position: function(opt, x, y){
			        opt.$menu.css({right: 15, top: 58 });
			    },
				autoHide : false,
				trigger : "left",
				callback : function(key, options){						
					var opt = key.split("-spl-");
					var op = opt[0];
					var msg = opt[1];			
					
					if (op == "admin"){
						gcom.draw_admin();
					}else if (op == "logout"){
						gcom.logout();
					}	
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
					}				
				},				
				items: gcom.status_menu_content()
			});		
		});
		
	},
	
	//날짜요일 반환하는 함수
	"return_day": function(day){
		
		if(day === 0){
            day = userlang == "ko" ? "일" : "Sun";
        }
        if(day === 1){
            day = userlang == "ko" ? "월" : "Mon";
        }
        if(day === 2){
            day = userlang == "ko" ? "화" : "Tue";
        }
        if(day === 3){
            day = userlang == "ko" ? "수" : "Wed";
        }
        if(day === 4){
            day = userlang == "ko" ? "목" : "Thu";
        }
        if(day === 5){
            day = userlang == "ko" ? "금" : "Fri";
        }
        if(day === 6){
            day = userlang == "ko" ? "토" : "Sat";
        }

        return day;
		
	},
	
	"time_transform": function(time){
		
		if(time > 1000 * 60 * 60 * 24){ //등록한지 하루를 넘었을 경우 '일'로 표시
			time = Math.floor(time / (1000 * 60 * 60 * 24)) + "일";
		}
		if(time > 1000 * 60 * 60){ //등록한지 한시간을 넘었을 경우 '시간'으로 표시
			time = Math.floor(time / (1000 * 60 * 60)) + "시간";
		}
		if(time < 1000 * 60 * 60){ // 등록한지 한시간이 지나지 않았을 경우 '분'으로 표시
			time = Math.floor(time / (1000 * 60)) + "분";
		}
		
		return time;
		
	},
	
	"addZero": function(num){
		return (num < 10 ? '0' : '') + num;
	},
	
	"maxZindex" : function(){
		var zIndexMax = 0;
		$("header, div, article, section, nav, aside, #alram_layer").not("[class*='mbsc-']").each(function(){
			if (!$(this).is(':visible')) return true;
			var z = parseInt($(this).css("z-index"));
			if (z > zIndexMax) zIndexMax = z;
		});
		return parseInt(zIndexMax);
	},
	
	"status_menu_content" : function(){
		var _items = {
			"online" : {
				name : "온라인",
				className: 'online',
				items : ""
			},
			"empty" : {
				name : "부재중",
				items : ""
			},
			"donottouch" : {
				name : "방해금지",
				items : ""
			},
			"emptystatus" : {
				name : "상태메세지 설정 안함"
			}		
		}	
		

		var logout ={
			"sepa01" : "-------------",
			"logout" : {
				name : "Logout"
			}
		}
		_items = $.extend(_items, logout);

		if (role_admin == "T"){
			var admin ={
				"sepa02" : "-------------",
				"admin" : {
					name : "Admin"
				}
			}
			_items = $.extend(_items, admin);
		}
			
/*		if (cal_admin == "T"){
			var admin ={
				"sepa03" : "-------------",
				"cal" : {
					name : "휴일관리"
				}
			}
			_items = $.extend(_items, admin);
		}
		
		if (stat_admin == "T"){
			var admin ={
				"sepa04" : "-------------",
				"stat" : {
					name : "DSW통계"
				}
			}
			_items = $.extend(_items, admin);
		}*/
		
		return _items;	
	},
	
	"draw_admin" : function(){
		gcom.show_admin_log();
	},
	
	"show_admin_log" : function(){
		var html = gcom.admin_log_main_html();	
		
		gap.showBlock();
		$(html).appendTo('body');
		var $layer = $('#admin_log_layer');
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
		$layer.wrap('<div id="common_work_layer" class="mu_container mu_work mu_group" style="top:-50%;"></div>');
		
		if (menu_admin == 'T') {
			gcom.admin_log_menu = "menu_mng";	
		} else {
			gcom.admin_log_menu = "file_log";
		}
		$('#' + gcom.admin_log_menu).addClass('on');
		
		gcom.admin_log_head_html(gcom.admin_log_menu);
		
		// 셀렉트 박스 그리기
		$('#search_field').material_select();
		
		// 기간 선택
		var s_date = moment().add(-1, 'y');
		var e_date = moment();

		$('#ws_s_date').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			defaultSelection: moment(s_date),
			theme: 'ios',
			controls: ['calendar'],
			select: 'range',				
			dateFormat: 'YYYY-MM-DD',	
			//display: 'anchored',
			animation: 'pop',
			calendarType: 'month',	
			startInput: '#ws_s_date',
		    endInput: '#ws_e_date',
			pages : 2,
			touchUi: false
		});
		
		$('#ws_s_date').val(s_date.format('YYYY-MM-DD'));
		$('#ws_e_date').val(e_date.format('YYYY-MM-DD'));
		
		// 목록 그리기
		gcom.draw_admin_log_list(1);
		
		// 왼쪽 메뉴 클릭
		$layer.find(".left-nav ul li").on("click", function(){
			$layer.find(".left-nav ul li").removeClass("on");
			$(this).addClass("on");
			gcom.admin_log_menu = $(this).attr("id")
			
			if (gcom.admin_log_menu == "arch_search"){
				// 아카이빙 검색 새창
				var url = "";
				if (gap.isDev){
					url = "http://dswdvarmc01.daesang.com";
				}else{
					url = "https://dsw.daesang.com";
				}
				url += "/arch/KPortal.nsf/arch_admin?openform";
			//	window.open(url, gcom.admin_log_menu, null);
				gap.open_subwin(url, "1590", "850", "yes" , gcom.admin_log_menu, "yes");
				
			}else if (gcom.admin_log_menu == "kgpt_admin"){
				var url = root_path + "/page/kgpt_admin.jsp";
				window.open(url);
				
			}else{
				// 그 외
				var s_date = moment().add(-1, 'y');
				var e_date = moment();
				
				$('#ws_s_date').val(s_date.format('YYYY-MM-DD'));
				$('#ws_e_date').val(e_date.format('YYYY-MM-DD'));
				gcom.admin_log_query = "";
				$layer.find("#log_search_txt").val("");
				$layer.find(".btn-search-close").hide();
				
				gcom.admin_log_head_html(gcom.admin_log_menu);
				gcom.draw_admin_log_list(1);
			}
		});
		
		// 검색
		$layer.find('#log_search_txt').on("keydown", function(e){
			if (e.keyCode == 13){
				// validation 체크
				var qry = $.trim($(this).val());
				qry.replace(/\[\]\*/g, '');
				$(this).val(qry);

				if (qry.length < 2) {
					mobiscroll.toast({message:gap.lang.valid_search_keyword, color:'danger'});
					return false;
				}
				
				gcom.admin_log_query = $(this).val();
				gcom.draw_admin_log_list(1);
			}
		});
		
		// 검색 버튼
		$layer.find('#log_search_btn').off().on('click', function(){
			// validation 체크
			var qry = $.trim($layer.find('#log_search_txt').val());
			qry.replace(/\[\]\*/g, '');
			$(this).val(qry);

			if (qry.length < 2) {
				mobiscroll.toast({message:gap.lang.valid_search_keyword, color:'danger'});
				return false;
			}
			
			gcom.admin_log_query = $layer.find('#log_search_txt').val();
			gcom.draw_admin_log_list(1);
		});
		
		// 검색 초기화
		$layer.find(".btn-search-close").on("click", function(){
			var s_date = moment().add(-1, 'y');
			var e_date = moment();
			
			$('#ws_s_date').val(s_date.format('YYYY-MM-DD'));
			$('#ws_e_date').val(e_date.format('YYYY-MM-DD'));
			gcom.admin_log_query = "";
			$layer.find("#log_search_txt").val("");
			$layer.find(".btn-search-close").hide();
			gcom.draw_admin_log_list(1);
		});
		
		// 다운로드 버튼
		$layer.find("#log_download_btn").off().on('click', function(){
			gcom.download_log_file();
		});
		
		// 카테고리 등록 버튼
		$layer.find("#category_upload_btn").off().on('click', function(){
			gcom.show_category_upload();
		});		
		
		// 메뉴 업로드 버튼
		$layer.find("#menu_upload_btn").off().on('click', function(){
			gcom.show_menu_upload();
		});
		
		// 모바일 메뉴 업로드 버튼
		$layer.find("#m_menu_upload_btn").off().on('click', function(){
			gcom.show_mobile_menu_upload();
		});
		
		// 포틀릿 업로드 버튼
		$layer.find("#portlet_upload_btn").off().on('click', function(){
			gcom.show_portlet_upload();
		});
		
		// Intent 업로드 버튼
		$layer.find("#intent_upload_btn").off().on('click', function(){
			gcom.show_intent_upload();
		});
		
		// Intent 실시간 학습
		$layer.find("#realtime_train_btn").off().on('click', function(){
			gcom.callRealtimeTraining();
		});			
		
		// 닫기
		$layer.find(".pop_btn_close").on("click", function(){
			$('#admin_log_layer').parent().remove();
			gap.remove_layer('admin_log_layer');
			//gap.remove_layer('common_work_layer');
		});
	},
	
	"show_category_upload" : function(info){
		var _self = this;
		
		var html = 
			'<div id="menu_upload_layer" class="reg-category-ly">' +
			'	<div class="layer-inner" style="padding:0;">' +
			'		<div class="btn-close pop_btn_close"></div>' +
			'		<h4>카테고리 등록</h4>' +
			'		<div class="layer-cont">' +
			'			<div class="left-cont">' + // 왼쪾 메뉴 S
			'				<div class="each">' +
			'					<div class="menu-title">Key</div>' +
			'					<div style="display:flex">' +
			'						<input id="reg_category_code" placeholder="카테고리 Key를 입력하세요 ex) aprv, crm">' +
			'					</div>' +
			'				</div>' +
			'				<div class="each" style="display:flex;">' +
			'					<div style="margin-right:7px;width:50%;">' +
			'						<div class="menu-title">카테고리명 (한글)</div>' +
			'						<input id="reg_category_name_kr">' +
			'					</div>' +
			'					<div style="width:50%;">' +
			'						<div class="menu-title">카테고리명 (영문)</div>' +
			'						<input id="reg_category_name_en">' +
			'					</div>' +
			'				</div>' +
			'			</div>' +	// 왼쪽 메뉴 E
			'		</div>' +
			'		<div style="margin-top:20px;text-align:center;">' +
			'			<button class="btn-ok">확인</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		// 컨펌창 표시하기
		$('#admin_log_layer').parent().append(html);
		
		// index 값 조정
		var block_idx = parseInt($('#blockui').css('z-index'));
		$('#admin_log_layer').css('z-index', block_idx - 1);
		$('#menu_upload_layer').css('z-index', block_idx + 1);
		

		var is_edit = (info ? true : false);
		var is_mobile = false;
		this.category_upload_event(is_edit, is_mobile);
		
		// 편집으로 여는 경우
		if (is_edit) {
			$('#reg_category_code').val(info.code).prop('readonly', true);
			$('#reg_category_code').data('sort', info.sort);
			$('#reg_category_name_kr').val(gap.textToHtml(info.category_kr));
			$('#reg_category_name_en').val(gap.textToHtml(info.category_en));
		}
	},
	
	"category_upload_event" : function(is_edit, is_mobile){
		var _self = this;
		
		// 이벤트 처리
		var $menu_ly = $('#menu_upload_layer');
		$menu_ly.find('.btn-close').on('click', function(){
			_self.hide_menu_upload();
		});
		
		// 저장하기
		$menu_ly.find('.btn-ok').on('click', function(){
			var $this = $(this);
			// 중복 수행 방지
			if ($this.hasClass('process')) return;
			
			$this.addClass('process');

			var valid = _self.reg_category_valid();
			
			if (!valid) {
				$this.removeClass('process');
				return false;
			}
			

			if (is_edit) {
				_save_category();
				
			} else {
				var _code = $.trim($('#reg_category_code').val());
				var check_url = gap.channelserver;
				check_url += (is_mobile ? root_path + "/appstore_mobile_dual_check.km" : root_path + "/appstore_dual_check.km");
				$.ajax({
					type: "POST",
					async: false,
					url: check_url,
					dataType : "json",
					data : JSON.stringify({code:_code}),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success: function(res){
						if (res.data.data.exist == 'T') {
							mobiscroll.toast({message:"중복된 Key가 있습니다.", color:"danger"});
							$('#reg_menu_code').focus();
							$this.removeClass('process');
						} else {
							
							// 키 중복 체크 후 최종 저장하는 부분
							_save_category();							
						}
					},
					error: function(){
						mobiscroll.toast({message:"Key 중복 체크 수행중 오류가 발생했습니다", color:"danger"});
						$this.removeClass('process');
					}
				});
			}
		});
		
		function _save_category(){
			_self.reg_category_save(is_mobile);
		}
	},
	
	"reg_category_valid" : function(){
		var _code = $.trim($('#reg_category_code').val());
		if (_code == '') {
			mobiscroll.toast({message:'Key를 입력해주세요.', color:'danger'});
			$('#reg_category_code').focus();
			return false;
		}
		
		// 카테고리명 (한글, 영문)
		var _category_kr = $.trim($('#reg_category_name_kr').val());
		var _category_en = $.trim($('#reg_category_name_en').val());
		if (!_category_kr) {
			mobiscroll.toast({message:'카테고리명(한글)을 입력해주세요.', color:'danger'});
			$('#reg_category_name_kr').focus();
			return false;
		}
		if (!_category_en) {
			mobiscroll.toast({message:'카테고리명(영문)을 입력해주세요.', color:'danger'});
			$('#reg_category_name_en').focus();
			return false;
		}
		
		return true;
	},
	
	"reg_category_save" : function(is_mobile){
		// 최종 완료 처리
		var _self = this;
		
		gap.show_loading('');
		
		var _code = $.trim($('#reg_category_code').val());
		var _category_kr = $.trim($('#reg_category_name_kr').val());
		var _category_en = $.trim($('#reg_category_name_en').val());
		var _sort = $('#reg_category_code').data('sort');
		
		var obj = {
			code: _code,
			category_kr: _category_kr,
			category_en: _category_en,
			sort: _sort ? _sort : moment().format('YYYYMMDDHHmmss'),	// 소트는 처음 생성시 만들어지고 업데이트 안함
			//sort: moment().format('YYYYMMDDHHmmss'),
			last_update: moment().format('YYYYMMDDHHmmss')
		};
	
		var _url = gap.channelserver;
		_url += (is_mobile ? root_path + "/appstore_category_mobile_save.km" : root_path + "/appstore_category_save.km");

		$.ajax({
			type: 'POST',
			url: _url,
			dataType: 'json',
			data: JSON.stringify(obj),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success: function(res){
				mobiscroll.toast({message:'저장되었습니다', color:'info'});
				$('#show_loading_layer').remove();
				$('#menu_upload_layer .btn-close').click();

				// 리스트를 새로고침해야 함
				_self.draw_admin_log_list(1);
			},
			error: function(){
				
			}
			
		});		
	},	
	
	"show_menu_upload" : function(info){
		var _self = this;
		
		var html = 
			'<div id="menu_upload_layer" class="reg-menu-ly">' +
			'	<div class="layer-inner" style="padding:0;">' +
			'		<div class="btn-close pop_btn_close"></div>' +
			'		<h4>메뉴 등록</h4>' +
			'		<div class="layer-cont">' +
			'			<div class="left-cont">' + // 왼쪾 메뉴 S
			'				<div class="each">' +
			'					<div class="menu-title">대메뉴</div>' +
			'					<div style="display:flex">' +
			'						<div class="input-field selectbox t_sec_sel" style="width:100%;">' +
			'							<select id="reg_category_field">' +
			'							</select>' +
			'						</div>' +
			'					</div>' +
			'				</div>' +			
			'				<div class="each">' +
			'					<div class="menu-title">Key</div>' +
			'					<div style="display:flex">' +
			'						<input id="reg_menu_code" placeholder="메뉴Key를 입력하세요 ex) aprv, crm">' +
			'					</div>' +
			'				</div>' +
			'				<div class="each" style="display:flex;">' +
			'					<div style="margin-right:7px;width:50%;">' +
			'						<div class="menu-title">이미지</div>' +
			'						<div style="display:flex;">' +
			'							<div id="reg_menu_icon" class="reg-menu-preview dropzone-previews"></div>' +
			'							<button id="reg_menu_add_file" class="btn-menu">이미지 선택</button>' +
			'						</div>' +
			'					</div>' +
			'					<div style="width:50%;">' +
			'						<div class="menu-title">배경색</div>' +
			'						<input id="reg_menu_bgcolor" value="#fde6d9">' +
			'					</div>' +
			'				</div>' +			
			'				<div class="each" style="display:flex;">' +
			'					<div style="margin-right:7px;width:50%;">' +
			'						<div class="menu-title">메뉴명 (한글)</div>' +
			'						<input id="reg_menu_name_kr">' +
			'					</div>' +
			'					<div style="width:50%;">' +
			'						<div class="menu-title">메뉴명 (영문)</div>' +
			'						<input id="reg_menu_name_en">' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">링크 URL</div>' +
			'					<input id="reg_menu_link">' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">담당자</div>' +
			'					<div style="display:flex;">' +
			'						<input id="reg_menu_mng">' +
			'						<div class="btn-menu-mng-org"></div>' +
			'					</div>' +
			'					<div id="menu_mng_user_wrap" style="display:none;">' +
			'						<ul id="menu_mng_user_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +
			'				</div>' +
			'			</div>' +	// 왼쪽 메뉴 E
			'			<div class="right-cont">' + // 오른쪽 메뉴 S
			'				<div class="each">' +
			'					<div class="menu-title">권한 (회사)</div>' +
			'					<div class="grant-com-sel-wrap"><span id="grant_com_allsel">전체선택</span> | <span id="grant_com_desel">선택해제</span></div>' +
			'					<div id="menu_grant_com_wrap">' +
			'						<ul id="menu_grant_com_list" class="menu-usermng-wrap grant-com-list"></ul>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">권한 (부서,개인)</div>' +
			'					<div style="display:flex;">' +
			'						<input id="reg_menu_grant">' +
			'						<div class="btn-menu-grant-org"></div>' +
			'					</div>' +
			'					<div id="menu_grant_wrap" style="display:none;">' +
			'						<ul id="menu_grant_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<label><input type="checkbox" id="menu_disable_im" value="T">im사번 표시 안함</label>' +
			'				</div>' +
			'			</div>' +	//오른쪽 메뉴 E
			'		</div>' +
			'		<div style="margin-top:20px;text-align:center;">' +
			'			<button class="btn-ok">확인</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		// 컨펌창 표시하기
		$('#admin_log_layer').parent().append(html);
		
		// index 값 조정
		var block_idx = parseInt($('#blockui').css('z-index'));
		$('#admin_log_layer').css('z-index', block_idx - 1);
		$('#menu_upload_layer').css('z-index', block_idx + 1);
		
		var _company = '';
		// 회사정보 가져오기
		$.ajax({
			url: root_path + "/search_company.km",
			async: false,
			success: function(res){
				$.each(res, function(){
					_company += 
						'<li data-key="' + this.cpc + '">' +
						'	<label>' +
						'		<input type="checkbox" value="' + this.cpc + '">' +
						'		<span>' + this.cp + '</span>' +
						'	</label>' +
						'</li>';
				});
				$('#menu_grant_com_list').html(_company);
			}
		});
		
		// 대메뉴 가져오기
		var surl = root_path + "/appstore_category_list.km";
		var postData = {
				"start" : "0",
				"perpage" : gcom.per_page,
				"query" : "",
				"admin" : "T"
			};
			
		$.ajax({
			type : "POST",
			url : surl,
			async: false,
			dataType : "text",	//"json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},	
			success : function(__res){
				var res = JSON.parse(__res);
				var _list = res.data.response;
				var _html = "";
				
				for (var i = 0; i < _list.length; i++){
					var _info = _list[i];						
									
					_html += '<option value="' + _info.code + '">' + _info.category_kr + '</option>';
				}
				$("#reg_category_field").html(_html);
				$("#reg_category_field").material_select();
					
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
		
		var is_edit = (info ? true : false);
		var is_mobile = false;
		this.menu_upload_event(is_edit, is_mobile);
		
		// 편집으로 여는 경우
		if (is_edit) {
			$('#reg_category_field').val(info.category_code).material_select();
			$('#reg_menu_code').val(info.code).prop('readonly', true);
			$('#reg_menu_code').data('sort', info.sort);
			$('#reg_menu_bgcolor').val(info.bg);
			$('#reg_menu_name_kr').val(gap.textToHtml(info.menu_kr));
			$('#reg_menu_name_en').val(gap.textToHtml(info.menu_en));
			$('#reg_menu_link').val(info.link);
			
			$('#reg_menu_key_check').hide();
			
			// 아이콘
			var icon_src = root_path + "/menuicon.do?code=" + info.code + '&ver=' + info.last_update;
			var preview_icon = '<div class="menu-preview-icon" style="background-image:url(' + icon_src + ')"></div>';
			$('#reg_menu_icon').append(preview_icon);
			
			
			// 담당자 정보 입력
			if (info.manager) {
				$.each(info.manager, function(){
					_self.add_menu_mnguser(this);					
				});
			}
			
			// 권한 (회사)
			if (info.readers_company) {
				$.each(info.readers_company, function(){
					$('input[value="' + this + '"]').prop('checked', true);
				});
			}
			
			// 권한 (부서,개인)
			if (info.readers_deptuser) {
				$.each(info.readers_deptuser, function(){
					_self.add_menu_grant(this);
				});
			}
			
			// im사번 표시
			if (info.im_disable == 'T') {
				$('#menu_disable_im').prop('checked', true);
			}
		}
	},
	
	"show_mobile_menu_upload" : function(info){
		var _self = this;
		
		var html = 
			'<div id="menu_upload_layer" class="reg-menu-ly">' +
			'	<div class="layer-inner" style="padding:0;">' +
			'		<div class="btn-close pop_btn_close"></div>' +
			'		<h4>모바일 메뉴 등록</h4>' +
			'		<div class="layer-cont">' +
			'			<div class="left-cont">' + // 왼쪾 메뉴 S
			'				<div class="each">' +
			'					<div class="menu-title">Key</div>' +
			'					<div style="display:flex">' +
			'						<input id="reg_menu_code" placeholder="메뉴Key를 입력하세요 ex) aprv, crm">' +
			'					</div>' +
			'				</div>' +
			'				<div class="each" style="display:flex;">' +
			'					<div style="margin-right:7px;width:50%;">' +
			'						<div class="menu-title">이미지</div>' +
			'						<div style="display:flex;">' +
			'							<div id="reg_menu_icon" class="reg-menu-preview dropzone-previews"></div>' +
			'							<button id="reg_menu_add_file" class="btn-menu">이미지 선택</button>' +
			'						</div>' +
			'					</div>' +
			'					<div style="width:50%;">' +
			'						<div class="menu-title">배경색</div>' +
			'						<input id="reg_menu_bgcolor" value="#fde6d9">' +
			'					</div>' +
			'				</div>' +			
			'				<div class="each" style="display:flex;">' +
			'					<div style="margin-right:7px;width:50%;">' +
			'						<div class="menu-title">메뉴명 (한글)</div>' +
			'						<input id="reg_menu_name_kr">' +
			'					</div>' +
			'					<div style="width:50%;">' +
			'						<div class="menu-title">메뉴명 (영문)</div>' +
			'						<input id="reg_menu_name_en">' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">타입</div>' +
			'					<div class="radio-wr">' +
			'						<label><input type="radio" name="m_menu_type" class="with-gap" value="inapp"><span>인앱</span></label>' +
			'						<label><input type="radio" name="m_menu_type" class="with-gap" value="browser"><span>브라우저</span></label>' +
			'						<label><input type="radio" name="m_menu_type" class="with-gap" value="deeplink"><span>딥링크</span></label>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each" id="mobile_link_url">' +
			'					<div class="menu-title">링크 URL</div>' +
			'					<input id="reg_menu_link">' +
			'				</div>' +
			'				<div class="each" id="deeplink_android" style="display:none;">' +
			'					<div class="menu-title">딥링크 (안드로이드)</div>' +
			'					<input id="txt_deeplink_android">' +
			'				</div>' +
			'				<div class="each" id="deeplink_ios" style="display:none;">' +
			'					<div class="menu-title">딥링크 (iOS)</div>' +
			'					<input id="txt_deeplink_ios">' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">담당자</div>' +
			'					<div style="display:flex;">' +
			'						<input id="reg_menu_mng">' +
			'						<div class="btn-menu-mng-org"></div>' +
			'					</div>' +
			'					<div id="menu_mng_user_wrap" style="display:none;">' +
			'						<ul id="menu_mng_user_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +
			'				</div>' +
			'			</div>' +	// 왼쪽 메뉴 E
			'			<div class="right-cont">' + // 오른쪽 메뉴 S
			'				<div class="each">' +
			'					<div class="menu-title">권한 (회사)</div>' +
			'					<div class="grant-com-sel-wrap"><span id="grant_com_allsel">전체선택</span> | <span id="grant_com_desel">선택해제</span></div>' +
			'					<div id="menu_grant_com_wrap">' +
			'						<ul id="menu_grant_com_list" class="menu-usermng-wrap grant-com-list"></ul>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">권한 (부서,개인)</div>' +
			'					<div style="display:flex;">' +
			'						<input id="reg_menu_grant">' +
			'						<div class="btn-menu-grant-org"></div>' +
			'					</div>' +
			'					<div id="menu_grant_wrap" style="display:none;">' +
			'						<ul id="menu_grant_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<label><input type="checkbox" id="menu_disable_im" value="T">im사번 표시 안함</label>' +
			'				</div>' +
			'			</div>' +	//오른쪽 메뉴 E
			'		</div>' +
			'		<div style="margin-top:20px;text-align:center;">' +
			'			<button class="btn-ok">확인</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		// 컨펌창 표시하기
		$('#admin_log_layer').parent().append(html);
		
		// index 값 조정
		var block_idx = parseInt($('#blockui').css('z-index'));
		$('#admin_log_layer').css('z-index', block_idx - 1);
		$('#menu_upload_layer').css('z-index', block_idx + 1);
		
		var _company = '';
		// 회사정보 가져오기
		$.ajax({
			url: gap.channelserver + "/search_company.km",
			async: false,
			success: function(res){
				$.each(res, function(){
					_company += 
						'<li data-key="' + this.cpc + '">' +
						'	<label>' +
						'		<input type="checkbox" value="' + this.cpc + '">' +
						'		<span>' + this.cp + '</span>' +
						'	</label>' +
						'</li>';
				});
				$('#menu_grant_com_list').html(_company);
			}
		});
		
		var is_edit = (info ? true : false);
		var is_mobile = true;
		this.menu_upload_event(is_edit, is_mobile);
		
		// 편집으로 여는 경우
		if (is_edit) {
			$('#reg_menu_code').val(info.code).prop('readonly', true);
			$('#reg_menu_code').data('sort', info.sort);
			$('#reg_menu_bgcolor').val(info.bg);
			$('#reg_menu_name_kr').val(gap.textToHtml(info.menu_kr));
			$('#reg_menu_name_en').val(gap.textToHtml(info.menu_en));
			$('#reg_menu_link').val(info.link);
			$('#txt_deeplink_android').val(info.deeplink_and);
			$('#txt_deeplink_ios').val(info.deeplink_ios);
			
			$('#reg_menu_key_check').hide();
			
			// 아이콘
			var icon_src = gap.channelserver + "/menuicon_mobile.do?code=" + info.code + '&ver=' + info.last_update;
			var preview_icon = '<div class="menu-preview-icon" style="background-image:url(' + icon_src + ')"></div>';
			$('#reg_menu_icon').append(preview_icon);
			
			// 타입
			if (info.link_type){
				$('input[name="m_menu_type"][value="' + info.link_type + '"]').prop('checked', true);
				if (info.link_type == 'inapp' || info.link_type == 'browser'){
					$('#mobile_link_url').show();
					$('#deeplink_android').hide();
					$('#deeplink_ios').hide();
				}else{
					$('#mobile_link_url').hide();
					$('#deeplink_android').show();
					$('#deeplink_ios').show();
				}
			}
			
			
			// 담당자 정보 입력
			if (info.manager) {
				$.each(info.manager, function(){
					_self.add_menu_mnguser(this);					
				});
			}
			
			// 권한 (회사)
			if (info.readers_company) {
				$.each(info.readers_company, function(){
					$('input[value="' + this + '"]').prop('checked', true);
				});
			}
			
			// 권한 (부서,개인)
			if (info.readers_deptuser) {
				$.each(info.readers_deptuser, function(){
					_self.add_menu_grant(this);
				});
			}
			
			// im사번 표시
			if (info.im_disable == 'T') {
				$('#menu_disable_im').prop('checked', true);
			}
		}
	},	
	
	"hide_menu_upload" : function(){
		$('#menu_upload_layer').remove();
		
		var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
		var block_idx = parseInt($('#blockui').css('z-index'));
		
		// Admin 페이지가 열려있는 상황인 경우 처리
		if (admin_menu_idx && block_idx) {
			$('#admin_log_layer').css('z-index', block_idx+1);
		}
	},
	
	"category_remove" : function(code, menu_nm, is_mobile){
		var _self = this;
		var _url = gap.channelserver;
		_url += (is_mobile ? root_path + "/appstore_category_mobile_delete.km" : root_path + "/appstore_category_delete.km");
		
		gap.showConfirm({
			title: '대메뉴 삭제',
			//iconClass: 'remove',
			contents: '<span>' + menu_nm + '</span><br>대메뉴를 정말 삭제할까요?',
			callback: function(){
				gap.show_loading('처리 중');
				
				$.ajax({
					type: 'POST',
					url: _url,
					dataType: 'json',
					data: JSON.stringify({code: code}),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success: function(res){
						mobiscroll.toast({message:'삭제되었습니다', color:'info'});
						
						$('#show_loading_layer').remove();
						var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
						var block_idx = parseInt($('#blockui').css('z-index'));
						
						// Admin 페이지가 열려있는 상황인 경우 처리
						if (admin_menu_idx && block_idx) {
							$('#admin_log_layer').css('z-index', block_idx+1);
						}
						
						_self.draw_admin_log_list(_self.cur_page);
						
					},
					error: function(){
						$('#show_loading_layer').remove();
						var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
						var block_idx = parseInt($('#blockui').css('z-index'));
						
						// Admin 페이지가 열려있는 상황인 경우 처리
						if (admin_menu_idx && block_idx) {
							$('#admin_log_layer').css('z-index', block_idx+1);
						}
					}
					
				});
			}
		});
	},		
	
	"menu_remove" : function(code, menu_nm, is_mobile){
		var _self = this;
		var _url = gap.channelserver;
		_url += (is_mobile ? root_path + "/appstore_mobile_delete.km" : root_path + "/appstore_delete.km");
		
		gap.showConfirm({
			title: '메뉴삭제',
			//iconClass: 'remove',
			contents: '<span>' + menu_nm + '</span><br>메뉴를 정말 삭제할까요?',
			callback: function(){
				gap.show_loading('처리 중');
				
				$.ajax({
					type: 'POST',
					url: _url,
					dataType: 'json',
					data: JSON.stringify({code: code}),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success: function(res){
						mobiscroll.toast({message:'삭제되었습니다', color:'info'});
						
						$('#show_loading_layer').remove();
						var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
						var block_idx = parseInt($('#blockui').css('z-index'));
						
						// Admin 페이지가 열려있는 상황인 경우 처리
						if (admin_menu_idx && block_idx) {
							$('#admin_log_layer').css('z-index', block_idx+1);
						}
						
						_self.draw_admin_log_list(_self.cur_page);
						
					},
					error: function(){
						$('#show_loading_layer').remove();
						var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
						var block_idx = parseInt($('#blockui').css('z-index'));
						
						// Admin 페이지가 열려있는 상황인 경우 처리
						if (admin_menu_idx && block_idx) {
							$('#admin_log_layer').css('z-index', block_idx+1);
						}
					}
					
				});
			}
		});
	},	
	
	"menu_upload_event" : function(is_edit, is_mobile){
		var _self = this;
		
		// 이벤트 처리
		var $menu_ly = $('#menu_upload_layer');
		$menu_ly.find('.btn-close').on('click', function(){
			_self.hide_menu_upload();
		});
		
		if (window.myDropzone_menuico) {
			myDropzone_menuico.destroy();
			myDropzone_menuico = null;
		}
		
	//	var _url = gap.channelserver;
		var _url = root_path;
		_url += (is_mobile ? "/FileControl_mobile_appstore.do" : "/FileControl_appstore.do");
		
		var selectid = 'reg_menu_icon';
		window.myDropzone_menuico = new Dropzone("#" + selectid, { // Make the whole body a dropzone
			url: _url,
			autoProcessQueue: false, 
			parallelUploads: 100, 
			maxFiles: 1,
			maxFilesize: 1024,
			timeout: 180000,
			uploadMultiple: true,
			acceptedFiles: 'image/png',
			withCredentials: false,
			previewsContainer: "#reg_menu_icon",
			clickable: "#" + selectid,
			renameFile: function(file){		
				return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			},
			init: function() {
				myDropzone_menuico = this;
				this.imagelist = new Array();
				
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
				//alert('이미지 등록 성공');
				_self.reg_menu_save(is_mobile);
			},
			error: function(){
				
			}
		});
		
		myDropzone_menuico.is_edit = is_edit;
		
		myDropzone_menuico.on("totaluploadprogress", function(progress) {	
			//$("#show_loading_progress").text(parseInt(progress) + "%");
		});
		
		myDropzone_menuico.on("addedfiles", function (file) {
			// 파일은 하나만 저장되도록 처리함
			if (myDropzone_menuico.files.length >= 2) {
				myDropzone_menuico.removeFile(myDropzone_menuico.files[0]);
			}
			
			// 편집상태인 경우 기존 등록한 미리보기 엘리먼트 삭제
			$('#reg_menu_icon .menu-preview-icon').remove();
		});
		
		myDropzone_menuico.on("sending", function (file, xhr, formData) {
			gap.show_loading(gap.lang.saving);
			
			//$("#"+selectid).css("border", "");
			
			_code = $.trim($('#reg_menu_code').val());
			formData.append("code",_code);
			//formData.append("ky", gap.userinfo.rinfo.ky);
			//formData.append("orikey", (myDropzone_menuico.is_edit ? myDropzone_menuico.orikey : gCol.orikey));
			//formData.append("owner", JSON.stringify(gap.userinfo.rinfo));
			//formData.append("fserver", gap.channelserver);
			//formData.append("saveFolder", "menu");
			//myDropzone_menuico.files_info = "";
		});
		
		// 파일추가
		$('#reg_menu_add_file').on('click', function(){
			$('#reg_menu_icon').click();
		});
		
		
		
		// 담당자 입력
		$('#reg_menu_mng').on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			var terms = $.trim($(this).val());
			if (terms == '') return;
			
			var users = terms.split(',');
			
			gsn.requestSearch('', terms, function(res){
				$.each(res, function(){
					_self.add_menu_mnguser(this);
				});
				$('#reg_menu_mng').focus();				
			});					
			
			
			$(this).val('');
		})
		
		
		// 담당자 입력 (조직도 선택)
		$menu_ly.find('.btn-menu-mng-org').on('click', function(){
			var block_idx = parseInt($('#blockui').css('z-index'));
			$menu_ly.css('z-index', block_idx-1);
			window.ORG.show(
				{
					'title': '담당자 선택',
					'single': false,
					'show_ext' : false, // 외부 사용자 표시 여부
					'select': 'person' // [all, team, person]
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length == 0) return;
						for (var i = 0; i < items.length; i++){
							var _res = gap.convert_org_data(items[i]);
							_self.add_menu_mnguser(_res);
						}
					},
					onClose: function(){
						$menu_ly.css('z-index', block_idx+1);
					}
				}
			);
		});
		
		// 회사 전채선택
		$('#grant_com_allsel').on('click', function(){
			$('#menu_grant_com_list input[type="checkbox"]').prop('checked', true);
		});
		$('#grant_com_desel').on('click', function(){
			$('#menu_grant_com_list input[type="checkbox"]').prop('checked', false);
		});
		
		
		
		// 권한 등록
		$('#reg_menu_grant').on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			var terms = $.trim($(this).val());
			if (terms == '') return;
			
			var users = terms.split(',');
			
			gsn.requestSearch('', terms, function(res){
				$.each(res, function(){
					_self.add_menu_grant(this);
				});
				$('#reg_menu_grant').focus();				
			});					
			
			
			$(this).val('');
		})
		
		// 모바일 타입 선택
		$('input[name="m_menu_type"]').on('change', function(){
			var val = $(this).val();
			if (val == 'inapp' || val == 'browser'){
				$('#mobile_link_url').show();
				$('#deeplink_android').hide();
				$('#deeplink_ios').hide();
			} else {
				$('#mobile_link_url').hide();
				$('#deeplink_android').show();
				$('#deeplink_ios').show();
			}
		});
		
		// 권한 입력 (조직도 선택)
		$menu_ly.find('.btn-menu-grant-org').on('click', function(){
			var block_idx = parseInt($('#blockui').css('z-index'));
			$menu_ly.css('z-index', block_idx-1);
			window.ORG.show(
				{
					'title': '권한 설정',
					'single': false,
					'show_ext' : false // 외부 사용자 표시 여부
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length == 0) return;
						for (var i = 0; i < items.length; i++){
							var _res = gap.convert_org_data(items[i]);
							_self.add_menu_grant(_res);
						}
					},
					onClose: function(){
						$menu_ly.css('z-index', block_idx+1);
					}
				}
			);
		});
		
		// 저장하기
		$menu_ly.find('.btn-ok').on('click', function(){
			var $this = $(this);
			// 중복 수행 방지
			if ($this.hasClass('process')) return;
			
			$this.addClass('process');

			var valid = _self.reg_menu_valid();
			
			if (!valid) {
				$this.removeClass('process');
				return false;
			}
			

			if (is_edit) {

				_save_menu();
				
			} else {
				var _code = $.trim($('#reg_menu_code').val());
				var check_url = gap.channelserver;
				check_url += (is_mobile ? root_path + "/appstore_mobile_dual_check.km" : root_path + "/appstore_dual_check.km");
				$.ajax({
					type: "POST",
					async: false,
					url: check_url,
					dataType : "json",
					data : JSON.stringify({code:_code}),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success: function(res){
						if (res.data.data.exist == 'T') {
							mobiscroll.toast({message:"중복된 Key가 있습니다.", color:"danger"});
							$('#reg_menu_code').focus();
							$this.removeClass('process');
						} else {
							
							// 키 중복 체크 후 최종 저장하는 부분
							_save_menu();							
						}
					},
					error: function(){
						mobiscroll.toast({message:"Key 중복 체크 수행중 오류가 발생했습니다", color:"danger"});
						$this.removeClass('process');
					}
				});
			}
		});
		
		function _save_menu(){
			if (myDropzone_menuico.files.length == 0){
				_self.reg_menu_save(is_mobile);
			}else{
				myDropzone_menuico.processQueue();
			}
		}
	},
	
	"reg_menu_valid" : function(){
		var _code = $.trim($('#reg_menu_code').val());
		if (_code == '') {
			mobiscroll.toast({message:'Key를 입력해주세요.', color:'danger'});
			$('#reg_menu_code').focus();
			return false;
		}
		
		// 이미지 선택 여부
		// 신규 등록인데 이미지가 없으면 안됨
		if (!myDropzone_menuico.is_edit && myDropzone_menuico.files.length == 0) {
			mobiscroll.toast({message:'이미지를 선택해주세요.', color:'danger'});
			$('#reg_menu_add_file').click();
			return false;
		}
		
		// 메뉴명 (한글, 영문)
		var _menu_kr = $.trim($('#reg_menu_name_kr').val());
		var _menu_en = $.trim($('#reg_menu_name_en').val());
		if (!_menu_kr) {
			mobiscroll.toast({message:'메뉴명(한글)을 입력해주세요.', color:'danger'});
			$('#reg_menu_name_kr').focus();
			return false;
		}
		if (!_menu_en) {
			mobiscroll.toast({message:'메뉴명(영문)을 입력해주세요.', color:'danger'});
			$('#reg_menu_name_en').focus();
			return false;
		}
		
		
		if ($('input[name="m_menu_type"]').length > 0){
			// 모바일인 경우
			var m_type = $('input[name="m_menu_type"]:checked').val();
			if (!m_type){
				alert('타입을 선택해주세요');
				return false;
			}else{
				if (m_type == 'inapp' || m_type == 'browser'){
					var _url_link = $.trim($('#reg_menu_link').val());
					if (!_url_link) {
						mobiscroll.toast({message:'링크 URL을 입력해주세요.', color:'danger'});
						$('#reg_menu_link').focus();
						return false;
					}
				}else{
					var _and_link = $.trim($('#txt_deeplink_android').val());
					var _ios_link = $.trim($('#txt_deeplink_ios').val());
					if (!_and_link) {
						mobiscroll.toast({message:'딥링크 (안드로이드) URL을 입력하세요.', color:'danger'});
						$('#txt_deeplink_android').focus();
						return false;
					}
					if (!_ios_link) {
						mobiscroll.toast({message:'딥링크 (iOS) URL을 입력하세요.', color:'danger'});
						$('#txt_deeplink_ios').focus();
						return false;
					}
					
				}
			}
		} else {
			// 링크 URL
			var _url_link = $.trim($('#reg_menu_link').val());
			if (!_url_link) {
				mobiscroll.toast({message:'링크 URL을 입력해주세요.', color:'danger'});
				$('#reg_menu_link').focus();
				return false;
			}
		}
			
		return true;
	},
	
	"reg_menu_save" : function(is_mobile){
		// 최종 완료 처리
		var _self = this;
		
		gap.show_loading('');
		
		var _category_code = $.trim($('#reg_category_field').val());
		var _category_name = $.trim($('#reg_category_field option:selected').text())
		var _code = $.trim($('#reg_menu_code').val());
		var _bgcolor = $.trim($('#reg_menu_bgcolor').val());
		var _menu_kr = $.trim($('#reg_menu_name_kr').val());
		var _menu_en = $.trim($('#reg_menu_name_en').val());
		var _sort = $('#reg_menu_code').data('sort');
		var _link = $.trim($('#reg_menu_link').val());
		var _mng_user = [];
		var _readers_all = [];
		var _readers_company = [];
		var _readers_deptuser = [];
		var _im_disable = $('#menu_disable_im').is(':checked') ? 'T' : 'F';
		
		
		
		// 담당자
		$('#menu_mng_user_list li').each(function(){
			_mng_user.push($(this).data('info'));
		});
		
		// 권한 (회사)
		$('#menu_grant_com_list input[type="checkbox"]:checked').each(function(){
			_readers_all.push($(this).val() + "");
			_readers_company.push($(this).val() + "");
		});
		// 권한 (부서,개인)
		$('#menu_grant_list li').each(function(){
			_readers_all.push($(this).data('key') + "");
			_readers_deptuser.push($(this).data('info'));
		});
		// 권한 설정 안한경우 전체 권한 부여
		if (_readers_all.length == 0) {
			_readers_all.push('all');
		}
		
		var obj = {
			category_code: _category_code,
			category_name: _category_name,
			code: _code,
			bg: _bgcolor,
			menu_kr: _menu_kr,
			menu_en: _menu_en,
			link: _link,
			manager: _mng_user,
			readers: _readers_all,
			readers_company: _readers_company,
			readers_deptuser: _readers_deptuser,
			im_disable: _im_disable,
			sort: _sort ? _sort : moment().format('YYYYMMDDHHmmss'),	// 소트는 처음 생성시 만들어지고 업데이트 안함
			//sort: moment().format('YYYYMMDDHHmmss'),
			last_update: moment().format('YYYYMMDDHHmmss')
		};
		
		// 모바일인 경우 값 추가하기
		if (is_mobile){
			var _type = $('input[name="m_menu_type"]:checked').val();
			var _link = '';
			var _deep_and = '';
			var _deep_ios = '';
			
			if (_type == 'inapp' || _type == 'browser'){
				_link = $.trim($('#reg_menu_link').val());
			}else{
				_deep_and = $.trim($('#txt_deeplink_android').val());
				_deep_ios = $.trim($('#txt_deeplink_ios').val());
			}
			
			obj.link_type = _type;
			obj.link = _link;
			obj.deeplink_and = _deep_and;
			obj.deeplink_ios = _deep_ios;
		}
		
		var _url = gap.channelserver;
		_url += (is_mobile ? root_path + "/appstore_mobile_save.km" : root_path + "/appstore_save.km");

		$.ajax({
			type: 'POST',
			url: _url,
			dataType: 'json',
			data: JSON.stringify(obj),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success: function(res){
				mobiscroll.toast({message:'저장되었습니다', color:'info'});
				$('#show_loading_layer').remove();
				$('#menu_upload_layer .btn-close').click();

				// 리스트를 새로고침해야 함
				if (myDropzone_menuico.is_edit) {
					_self.draw_admin_log_list(_self.cur_page);
				} else {
					_self.draw_admin_log_list(1);					
				}
			},
			error: function(){
				
			}
			
		});		
	},	
	
	"admin_log_main_html" : function(){
		var html =
			'<div id="admin_log_layer" class="layer_wrap admin-popup new_work_pop center" style="width: 1500px;">' +
			'	<div class="layer_inner" >' +
			'		<div class="pop_btn_close" style="right:33px;"></div>' +
			'		<div class="flex" style="min-height:833px">' +
			'			<div class="left-nav">' +
			'				<h2>시스템 관리</h2>' +
			'				<ul>' +
			'					<!-- 활성시 on 클래스 추가 --> ';
		if (menu_admin == 'T'){
			html +=
				'					<li id="category_mng">대메뉴 관리</li>' +
				'					<li id="menu_mng">메뉴 관리</li>' +
				'					<li id="m_menu_mng">모바일 메뉴 관리</li>' +
				'					<li id="portlet_mng">포틀릿 관리</li>' +
				'					<li id="kgpt_intent">K-GPT Intent Mng.</li>' +				
				'					<li id="kgpt_admin">K-GPT Admin</li>';					
		}
		
		if (filelog_admin == 'T'){
			html += '				<li id="file_log">File 로그</li>';
		}
		
		
		
		if (arch_admin == 'T'){
			html +=
				'					<li id="arch_search">아카이빙 검색</li>';			
		}
		
		if (archlog_admin == 'T'){
			html +=
				'					<li id="arch_search_log">아카이빙 검색 로그</li>';			
		}
		
		if (dswlog_admin == 'T'){
			html +=
				'					<li id="dsw_login_log">DSW 접속 로그</li>';			
		}
		
			
//		html +=
//			'					<li id="arch_search_log">아카이빙 검색 로그</li>' +
//			'					<li id="dsw_login_log">DSW 접속 로그</li>';
				
		html +=	'				</ul>' +
			'			</div>' +
			'			<div class="right-main">' +			
/*			'				<div class="aside-inner" style="width:400px; margin-top:-65px; margin-right:25px;float:right;">' +
			'					<div class="input-field search-field">' +
			'						<span class="ico-search btn-search-ico" style="top:12px;"></span>' +
			'						<input type="text" id="log_search_txt" class="formInput" placeholder="검색어를 입력하세요.">' +
			'						<div class="btn-search-close" style="display:none;"></div>' +'' +
			'					</div>' +
			'				</div>' +	*/
			
			
			
			'				<div class="t_sec">' +
			'					<div class="cal">' +
			'						<div class="date-wrap rel">' +
			'							<input type="text" id="ws_s_date" class="ws-date">' +
			'							<div class="icon"></div>' +
			'						</div>' +
			'						 <div class="and">~</div>' +
			'						<div class="date-wrap">' +
			'							<input type="text" id="ws_e_date" class="ws-date">' +
			'							<div class="icon"></div>' +
			'						</div>' +
			'					</div>' +
			'					<div class="se_right">' +
			'						<div id="admin_selectbox" class="input-field selectbox t_sec_sel">' +
			'							<select id="search_field">' +
			'								<option value="filename">파일명</option>' +
			'								<option value="username">사용자명</option>' +
			'							</select>' +
			'						</div>' +
			'						<div class="f_between">' +
			'							<input type="text" name="" id="log_search_txt" class="input" style="width:200px; padding:0 15px;" placeholder="' + gap.lang.input_search_query + '" autocomplete="off">' +
			'							<div class="btn-search-close" style="display:none;top:73px;right:195px;"></div>' +
			'							<button id="log_search_btn" class="type_icon"></button>' +
			'							<button id="log_download_btn" style="width: auto;border-radius: 10px;text-align: center;padding: 0 27px;margin-right: 0;margin-left: 10px;height: 38px;font-size: 13.5px;font-weight: bold;border: none;color: rgba(255, 255, 255, 0.8);background-color: #71368d;">다운로드</button>' +
			'							<button id="category_upload_btn" style="display: none; width: auto;border-radius: 10px;text-align: center;padding: 0 27px;margin-right: 0;margin-left: 10px;height: 38px;font-size: 13.5px;font-weight: bold;border: none;color: rgba(255, 255, 255, 0.8);background-color: #71368d;">카테고리 등록</button>' +
			'							<button id="menu_upload_btn" style="display: none; width: auto;border-radius: 10px;text-align: center;padding: 0 27px;margin-right: 0;margin-left: 10px;height: 38px;font-size: 13.5px;font-weight: bold;border: none;color: rgba(255, 255, 255, 0.8);background-color: #71368d;">업로드</button>' +
			'							<button id="m_menu_upload_btn" style="display: none; width: auto;border-radius: 10px;text-align: center;padding: 0 27px;margin-right: 0;margin-left: 10px;height: 38px;font-size: 13.5px;font-weight: bold;border: none;color: rgba(255, 255, 255, 0.8);background-color: #71368d;">업로드</button>' +
			'							<button id="portlet_upload_btn" style="display: none; width: auto;border-radius: 10px;text-align: center;padding: 0 27px;margin-right: 0;margin-left: 10px;height: 38px;font-size: 13.5px;font-weight: bold;border: none;color: rgba(255, 255, 255, 0.8);background-color: #71368d;">업로드</button>' +
			'							<button id="realtime_train_btn" style="display: none; width: auto;border-radius: 10px;text-align: center;padding: 0 27px;margin-right: 0;margin-left: 10px;height: 38px;font-size: 13.5px;font-weight: bold;border: none;color: rgba(255, 255, 255, 0.8);background-color: #71368d;">실시간 학습</button>' +				
			'							<button id="intent_upload_btn" style="display: none; width: auto;border-radius: 10px;text-align: center;padding: 0 27px;margin-right: 0;margin-left: 10px;height: 38px;font-size: 13.5px;font-weight: bold;border: none;color: rgba(255, 255, 255, 0.8);background-color: #71368d;">업로드</button>' +	
			'						</div>' +
			'					</div>' +
			'				</div>' +					
			'				<div class="tab_cont_wr">' +
			'					<table id="admin_log_head" class="table_type_a">' +
			'					</table>' +
			'				</div>' +
			'				<div class="pagination_wr" id="log_paging_area" style="position:absolute; bottom:30px; left:50%">' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		
		
		return html;
	},
	
	"admin_log_head_html" : function(_type){
		var html = "";
		var select_html = "";
		
		if (_type == "file_log"){
			html +=
				'<thead>' +
				'	<tr>' +
				'		<th style="width: 10%;" class="inb">구분</th>' +
				'		<th style="width: 15%;" class="inb">파일위치</th>' +
				'		<th style="width: auto;" class="inb">파일명</th>' +
				'		<th style="width: 15%;" class="inb">사용자명</th>' +
				'		<th style="width: 15%;" class="inb">일시</th>' +
				'		<th style="width: 8%; text-align: center !important;" class="inb">보기</th>' +
			//	'		<th style="width: 8%;" class="inb ta_left">다운로드</th>' +
				'	</tr>' +
				'</thead>' +
				'<tbody id="admin_log_list">' +
				'</tbody>';
			
			select_html =
				'<option value="filename">파일명</option>' +
				'<option value="username">사용자명</option>';
			
		}else if (_type == "arch_search_log"){
			html +=
				'<thead>' +
				'	<tr>' +
				'		<th style="width: 20%;" class="inb">Action</th>' +
				'		<th style="width: 20%;" class="inb">일시</th>' +
				'		<th style="width: auto;" class="inb">검색어</th>' +
				'		<th style="width: 25%; text-align: center !important;" class="inb">수행자</th>' +
				'	</tr>' +
				'</thead>' +
				'<tbody id="admin_log_list">' +
				'</tbody>';
			
			select_html = 
				'<option value="username">수행자</option>';
			
		}else if (_type == "dsw_login_log"){
			html +=
				'<thead>' +
				'	<tr>' +
				'		<th style="width: 15%;" class="inb">Action</th>' +
				'		<th style="width: 15%;" class="inb">일시</th>' +
				'		<th style="width: auto;" class="inb">접속 ID</th>' +
				'		<th style="width: 20%;" class="inb">접속 장비</th>' +
				'		<th style="width: 20%; text-align: center !important;" class="inb">모바일 장비</th>' +
				'	</tr>' +
				'</thead>' +
				'<tbody id="admin_log_list">' +
				'</tbody>';
			
			select_html = 
				'<option value="lid">접속 ID</option>';
		}else if (_type == "category_mng"){
			html +=
				'<thead>' +
				'	<tr>' +
				'		<th style="width: 200px" class="inb">Key</th>' +
				'		<th style="width: 200px" class="inb">카테고리명(한글)</th>' +
				'		<th style="width: 200px" class="inb">카테고리명(영문)</th>' +
				'		<th style="width: 80px" class="inb">삭제</th>' +				
				'		<th style="width: auto" class="inb"></th>' +
				'	</tr>' +
				'</thead>' +
				'<tbody id="admin_log_list" class="menu-list-table">' +
				'</tbody>';
			
			select_html = '';
		}else if (_type == "menu_mng"){
			html +=
				'<thead>' +
				'	<tr>' +
				'		<th style="width: 100px" class="inb">아이콘</th>' +
				'		<th style="width: 100px" class="inb">Key</th>' +
				'		<th style="width: 100px" class="inb">대메뉴명</th>' +	
				'		<th style="width: 100px" class="inb">메뉴명</th>' +						
				'		<th style="width: 100px" class="inb">im표시안함</th>' +
				'		<th style="width: 80px" class="inb">삭제</th>' +
				'		<th style="width: auto;" class="inb">링크 URL</th>' +
				'	</tr>' +
				'</thead>' +
				'<tbody id="admin_log_list" class="menu-list-table">' +
				'</tbody>';
			
			select_html =
				'<option value="title">메뉴명</option>' +
				'<option value="code">Key</option>';
		}else if (_type == "m_menu_mng"){
			html +=
				'<thead>' +
				'	<tr>' +
				'		<th style="width: 100px" class="inb">아이콘</th>' +
				'		<th style="width: 100px" class="inb">Key</th>' +
				'		<th style="width: 100px" class="inb">메뉴명</th>' +
				'		<th style="width: 100px" class="inb">im표시안함</th>' +
				'		<th style="width: 80px" class="inb">삭제</th>' +
				'		<th style="width: 100px" class="inb">타입</th>' +
				'		<th style="width: auto;" class="inb">링크 URL</th>' +
				'	</tr>' +
				'</thead>' +
				'<tbody id="admin_log_list" class="menu-list-table">' +
				'</tbody>';
			
			select_html =
				'<option value="title">메뉴명</option>' +
				'<option value="code">Key</option>';
		}else if (_type == "portlet_mng"){
			html +=
				'<thead>' +
				'	<tr>' +
				'		<th style="width: 150px" class="inb">미리보기</th>' +
				'		<th style="width: 100px" class="inb">메뉴명</th>' +
				'		<th style="width: 150px" class="inb">호출 함수명</th>' +
				'		<th style="width: 100px" class="inb">im표시안함</th>' +
				'		<th style="width: 80px" class="inb">삭제</th>' +
				'		<th style="width: auto;" class="inb">포틀릿 설명</th>' +
				'	</tr>' +
				'</thead>' +
				'<tbody id="admin_log_list" class="menu-list-table portlet-list">' +
				'</tbody>';
			
			select_html =
				'<option value="title">메뉴명</option>' +
				'<option value="code">호출 함수명</option>';
				
		}else if (_type == "kgpt_intent"){
			html +=
				'<thead>' +
				'	<tr>' +
				'		<th style="width: 150px" class="inb">코드</th>' +
				'		<th style="width: 150px" class="inb">메뉴명</th>' +
				'		<th style="width: auto" class="inb">메시지</th>' +
				'		<th style="width: 150px" class="inb">브리핑 사용</th>' +
				'		<th style="width: 80px" class="inb">삭제</th>' +
				'	</tr>' +
				'</thead>' +
				'<tbody id="admin_log_list" class="menu-list-table portlet-list">' +
				'</tbody>';
			
			select_html = '';
		}
		

		$('#admin_log_layer .t_sec .cal').hide();
		$('#log_download_btn').hide();
		$('#category_upload_btn').hide();
		$('#menu_upload_btn').hide();
		$('#m_menu_upload_btn').hide();
		$('#portlet_upload_btn').hide();
		$('#realtime_train_btn').hide();
		$('#intent_upload_btn').hide();
		
		if (_type == "category_mng" || _type == "kgpt_intent"){
			// 대메뉴 등록 메뉴, K-GPT Intent Mng. 에서는 숨김
			$('#admin_selectbox').hide();
			$("#log_search_txt").hide();
			$('#log_search_btn').hide();
		}else{
			$('#admin_selectbox').show();
			$("#log_search_txt").show();
			$('#log_search_btn').show();
		}
		
		if (_type == "menu_mng"){
			$('#menu_upload_btn').show();
		} else if (_type == "category_mng"){
			$('#category_upload_btn').show();
		} else if (_type == "m_menu_mng"){
			$('#m_menu_upload_btn').show();
		} else if (_type == "portlet_mng"){
			$('#portlet_upload_btn').show();
		} else if (_type == "kgpt_intent"){
			$('#realtime_train_btn').show();
			$('#intent_upload_btn').show();
		} else {
			$('#admin_log_layer .t_sec .cal').show();
			$('#log_download_btn').show();
		}
		
		
		$('#admin_log_head').html(html);
		$('#search_field').html(select_html);
		$('#search_field').material_select();
	},
	
	"add_menu_mnguser" : function(user_info){	// 담당자 추가
		var $list = $('#menu_mng_user_list');
		var ck = $list.find('li[data-key="' + user_info.ky + '"]');
		if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
		
				
		var disp_txt = '';
		user_info = gap.user_check(user_info);
		disp_txt = '<a onclick="gOrg.showUserDetailLayer(\'' + user_info.ky + '\')">' + user_info.name + ' ' + user_info.jt + ' | ' + user_info.dept + '</a>';
				
		var html =
			'<li class="f_between" data-key="' + user_info.ky + '">' +
			'	<span class="txt ko">' + disp_txt + '</span>' +
			'	<button class="file_remove_btn"></button>' +
			'</li>';
		
		var $li = $(html);
		
		$li.data('info', user_info);
		$li.find('.file_remove_btn').on('click', function(){
			$(this).closest('li').remove();
			
			if ($list.find('li').length == 0) {
				$('#menu_mng_user_wrap').hide();
			}
		});
		
		$list.append($li);
		$('#menu_mng_user_wrap').show();
	},	
	
	"add_menu_grant" : function(user_info){	// 권한 추가
		var $list = $('#menu_grant_list');
		var ck = $list.find('li[data-key="' + user_info.ky + '"]');
		if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
		
				
		var disp_txt = '';
		user_info = gap.user_check(user_info);
		
		
		
		if (user_info.dsize == 'group'){
			disp_txt = '<a class="grant-group">' + user_info.name + ' | ' + user_info.cp + '</a>';
		} else {
			disp_txt = '<a onclick="gOrg.showUserDetailLayer(\'' + user_info.ky + '\')">' + user_info.name + ' ' + user_info.jt + ' | ' + user_info.dept + '</a>';			
		}
		
		var html =
			'<li class="f_between" data-key="' + user_info.ky + '">' +
			'	<span class="txt ko">' + disp_txt + '</span>' +
			'	<button class="file_remove_btn"></button>' +
			'</li>';
		
		var $li = $(html);
		
		$li.data('info', user_info);
		$li.find('.file_remove_btn').on('click', function(){
			$(this).closest('li').remove();
			
			if ($list.find('li').length == 0) {
				$('#menu_grant_wrap').hide();
			}
		});
		
		$list.append($li);
		$('#menu_grant_wrap').show();
	},
	
	"draw_admin_log_list" : function(page_no){
		var $layer = $('#admin_log_layer');
		
		if (page_no == 1){
			gcom.start_page = "1";
			gcom.cur_page = "1";
		}

		var s_date = moment($('#ws_s_date').val()).utc().local().format('YYYYMMDD') + '000000';
		var e_date = moment($('#ws_e_date').val()).utc().local().format('YYYYMMDD') + '999999';
		
		gcom.start_skp = (parseInt(gcom.per_page) * (parseInt(page_no))) - (parseInt(gcom.per_page) - 1);
		
		if (gcom.admin_log_menu == "file_log"){
			var surl = root_path + "/admin_log_search.km";
			var postData = {
					"start" : (gcom.start_skp - 1).toString(),
					"perpage" : gcom.per_page,
					"from" : s_date,
					"to" : e_date,
					"category" : (gcom.admin_log_query != "" ? $('#search_field').val() : ""),
					"query" : gcom.admin_log_query
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
					var _list = res.data.response;
					
					if (gcom.admin_log_query != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find("#admin_log_list").empty();
					
					for (var i = 0; i < _list.length; i++){
						var _info = _list[i];
						var _action = (typeof(_info.action) != "undefined" ? _info.action : "");
						var _device = _info.action_os.toUpperCase();
						var _filename = _info.filename;
						var _actor_info = gap.user_check(_info.actor);
						var _app = _action.split("_")[0];
						var _type = _action.split("_")[2];
						var _device_txt = "";
						var _action_txt = "";
						var _type_txt = "";
						var _html = "";
						
						if (_type == "download"){
							_type_txt = "다운로드";
							
						}else if (_type == "preview"){
							_type_txt = "미리보기";
						}
						
						if (_device == "PC" || _device == "MOBILE"){
							_device_txt = _device;	
						}
						
						if (_app == "chat"){
							_action_txt = "채팅";
						}else if (_app == "reply"){
							_action_txt = "댓글 파일 다운로드";
							
						}else if (_app == "channel"){
							_action_txt = "업무방(" + _info.channel_name + ")";
							_filename = (typeof(_info.info) != "undefined" ? _info.info[0].filename : _info.filename);
									
						}else if (_app == "drive"){
							_action_txt = "Files(" + _info.drive_name + ")";
							
						}else if (_app == "todo"){
							_action_txt = "업무요청(" + _info.fserver + ")";
							
						}else if (_app == "collect" || _app == "collection"){
							_action_txt = "취합";
							
						}else if (_app == "favorite"){
							if (_info.file_source == "channel"){
								_action_txt = gap.lang.favorite + "(업무방)";
								
							}else{
								_action_txt = gap.lang.favorite + "(Files)";
							}
							
						}
						
						_html += '<tr id="' + _info._id.$oid + '">';
						_html += '	<td>' + _device_txt + '</td>';
						_html += '	<td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + _action_txt + '">' + _action_txt + '</td>';
						_html += '	<td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + _filename + '">' + _filename + '</td>';
						_html += '	<td>' + _actor_info.disp_user_info + '</td>';
						_html += '	<td>' + gcom.convertGMTLocalDateTime(_info.action_time) + '</td>';
						_html += '	<td style="text-align: center !important;"><button class="ico ico-view">보기</button></td>';
					//	_html += '	<td><button class="ico ico-down">다운로드</button></td>';
						_html += '</tr>';
						
						$layer.find("#admin_log_list").append(_html);
						$layer.find("#" + _info._id.$oid).data('info', _info);
					}
					
					//페이징
					gcom.total_data_count = res.data.total;
					gcom.total_page_count = gcom.getPageCount(gcom.total_data_count, gcom.per_page);
					gcom.initializePage('log_paging_area');
					
					// 이벤츠 처리
					gcom.event_admin_log_list($layer);
					
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});			
			
		}else if (gcom.admin_log_menu == "arch_search_log"){
			var surl = root_path + "/admin_log_archive_search.km";
			var postData = {
					"start" : (gcom.start_skp - 1).toString(),
					"perpage" : gcom.per_page,
					"from" : s_date,
					"to" : e_date,
					"category" : (gcom.admin_log_query != "" ? $('#search_field').val() : ""),
					"query" : gcom.admin_log_query
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
					var _list = res.data.response;
					
					if (gcom.admin_log_query != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find("#admin_log_list").empty();
					
					for (var i = 0; i < _list.length; i++){
						var _info = _list[i];
						var _action_txt = (_info.type == "search" ? "검색" : "복구");
						var _action_user = _info.search_user_name + ' ' + (_info.search_user_duty != "" ? ' ' + _info.search_user_duty : '') + ' | ' + _info.search_user_group;
						var _html = "";
					
						_html += '<tr id="' + _info._id.$oid + '">';
						_html += '	<td>' + _action_txt + '</td>';
						_html += '	<td>' + gcom.convertGMTLocalDateTime(_info.action_time) + '</td>';
						if (typeof(_info.from) != "undefined" && _info.from != ""){
							_html += '	<td>발신자 : ' + _info.from + " | " + _info.query + '</td>';
							
						}else{
							_html += '	<td>' + _info.query + '</td>';
						}
						_html += '	<td style="text-align: center !important;">' + _action_user + '</td>';
						_html += '</tr>';
						
						$layer.find("#admin_log_list").append(_html);
						$layer.find("#" + _info._id.$oid).data('info', _info);
					}
					
					//페이징
					gcom.total_data_count = res.data.total;
					gcom.total_page_count = gcom.getPageCount(gcom.total_data_count, gcom.per_page);
					gcom.initializePage('log_paging_area');
					
					// 이벤츠 처리
					gcom.event_admin_log_list($layer);
					
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});			
			
		}else if (gcom.admin_log_menu == "dsw_login_log"){
			var surl = root_path + "/admin_log_login_search.km";
			var postData = {
					"start" : (gcom.start_skp - 1).toString(),
					"perpage" : gcom.per_page,
					"from" : s_date + '000',
					"to" : e_date + '999',
					"category" : (gcom.admin_log_query != "" ? $('#search_field').val() : ""),
					"query" : gcom.admin_log_query
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
					var _list = res.data.response;
					
					if (gcom.admin_log_query != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find("#admin_log_list").empty();
					
					for (var i = 0; i < _list.length; i++){
						var _info = _list[i];
						var _action_txt = (_info.lty == "1" ? "로그인" : "로그아웃");
						var _device_txt = "";
						var _mobile_device_txt = _info.ei;
						var _html = "";
						
						if (_info.eqt == "1"){
							_device_txt = "PC";
							
						}else if (_info.eqt == "10"){
							_device_txt = "모바일";
							
						}else if (_info.eqt == "15"){
							_device_txt = "태블릿";
							
						}else if (_info.eqt == "20"){
							_device_txt = "Web";
							
						}
						
						_html += '<tr id="' + _info._id.$oid + '">';
						_html += '	<td>' + _action_txt + '</td>';
						_html += '	<td>' + gcom.convertGMTLocalDateTime(_info.dt.$numberLong) + '</td>';
						_html += '	<td>' + _info.lid + '</td>';
						_html += '	<td>' + _device_txt + '</td>';
						_html += '	<td style="text-align: center !important;">' + _mobile_device_txt + '</td>';
						_html += '</tr>';
						
						$layer.find("#admin_log_list").append(_html);
						$layer.find("#" + _info._id.$oid).data('info', _info);
					}
					
					//페이징
					gcom.total_data_count = res.data.total;
					gcom.total_page_count = gcom.getPageCount(gcom.total_data_count, gcom.per_page);
					gcom.initializePage('log_paging_area');
					
					// 이벤츠 처리
					gcom.event_admin_log_list($layer);
					
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
		}else if (gcom.admin_log_menu == "category_mng"){
			var surl = root_path + "/appstore_category_list.km";
			var postData = {
					"start" : (gcom.start_skp - 1).toString(),
					"perpage" : gcom.per_page,
					"query" : gcom.admin_log_query,
					"admin" : "T"
				};
			
			if (gcom.admin_log_query) {
				postData['category'] = ($('#search_field').val());
			}
			
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
					var _list = res.data.response;
					
					if (gcom.admin_log_query != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find("#admin_log_list").empty();
					
					for (var i = 0; i < _list.length; i++){
						var _info = _list[i];						
						var _key = _info.code;
						var _html = "";					
						_html += '<tr id="' + _info._id.$oid + '" class="menu-list-tr">';
						_html += '	<td>' + _key + '</td>';
						_html += '	<td>' + _info.category_kr + '</td>';
						_html += '	<td>' + _info.category_en + '</td>';
						_html += '	<td><button type="button" class="btn-menu-remove" data-key="' + _key + '" data-name="' + _info.category_kr + '">삭제</button></td>';
						_html += '	<td></td>';
						_html += '</tr>';
						
						$layer.find("#admin_log_list").append(_html);
						$layer.find("#" + _info._id.$oid).data('info', _info);
					}
					
					//페이징
					gcom.total_data_count = res.data.total;
					gcom.total_page_count = gcom.getPageCount(gcom.total_data_count, gcom.per_page);
					gcom.initializePage('log_paging_area');
					
					// 이벤츠 처리
					gcom.event_admin_log_list($layer);
					
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
		}else if (gcom.admin_log_menu == "menu_mng"){
			var surl = root_path + "/appstore_list.km";
			var postData = {
					"start" : (gcom.start_skp - 1).toString(),
					"perpage" : gcom.per_page,
					"query" : gcom.admin_log_query,
					"admin" : "T"
				};
			
			if (gcom.admin_log_query) {
				postData['category'] = ($('#search_field').val());
			}
			
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
					var _list = res.data.response;
					
					if (gcom.admin_log_query != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find("#admin_log_list").empty();
					
					var _default_bg = '#fde6d9';	// 기본 백그라운드 색상
					
					for (var i = 0; i < _list.length; i++){
						var _info = _list[i];						
						var _key = _info.code;
						var _icon_src = root_path + "/menuicon.do?code=" + _key + '&ver=' + _info.last_update;
						var _icon_img = '<div class="menu-list-icon-preview" style="background-image:url(' + _icon_src + ');"></div>';
						_icon_img = '<div class="menu-list-icon-preview-wrap" style="background-color:' + (_info.bg ? _info.bg : _default_bg) + '">' + _icon_img + '</div>';
						
						var _html = "";					
						_html += '<tr id="' + _info._id.$oid + '" class="menu-list-tr">';
						_html += '	<td>' + _icon_img + '</td>';
						_html += '	<td>' + _key + '</td>';
						_html += '	<td>' + _info.category_name + '</td>';
						_html += '	<td>' + _info.menu_kr + '</td>';
						_html += '	<td>' + (_info.im_disable == 'T' ? '✔' : '') + '</td>';
						_html += '	<td><button type="button" class="btn-menu-remove" data-key="' + _key + '" data-name="' + _info.menu_kr + '">삭제</button></td>';
						_html += '	<td><span class="menu-link">' + _info.link + '</span></td>';
						_html += '</tr>';
						
						$layer.find("#admin_log_list").append(_html);
						$layer.find("#" + _info._id.$oid).data('info', _info);
					}
					
					//페이징
					gcom.total_data_count = res.data.total;
					gcom.total_page_count = gcom.getPageCount(gcom.total_data_count, gcom.per_page);
					gcom.initializePage('log_paging_area');
					
					// 이벤츠 처리
					gcom.event_admin_log_list($layer);
					
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
		}else if (gcom.admin_log_menu == "m_menu_mng"){
			var surl = root_path + "/appstore_mobile_list.km";
			var postData = {
					"start" : (gcom.start_skp - 1).toString(),
					"perpage" : gcom.per_page,
					"query" : gcom.admin_log_query,
					"admin" : "T"
				};
			
			// 페이지 초기화
			$('#log_paging_area').empty();
			
			if (gcom.admin_log_query) {
				postData['category'] = ($('#search_field').val());
			}
			
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
					var _list = res.data.response;
					
					if (gcom.admin_log_query != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find("#admin_log_list").empty();
					
					var _default_bg = '#fde6d9';	// 기본 백그라운드 색상
					
					for (var i = 0; i < _list.length; i++){
						var _info = _list[i];						
						var _key = _info.code;
						var _icon_src = root_path + "/menuicon_mobile.do?code=" + _key + '&ver=' + _info.last_update;
						var _icon_img = '<div class="menu-list-icon-preview" style="background-image:url(' + _icon_src + ');"></div>';
						_icon_img = '<div class="menu-list-icon-preview-wrap" style="background-color:' + (_info.bg ? _info.bg : _default_bg) + '">' + _icon_img + '</div>';
						
						var _ty = '';
						var _link = '';
						
						if (_info.link_type == 'inapp'){
							_ty = '인앱';
							_link = _info.link;
						} else if (_info.link_type == 'browser'){
							_ty = '브라우저';
							_link = _info.link;
						} else {
							_ty = '딥링크';
							_link = _info.deeplink_and + '<br>' + _info.deeplink_ios;
						}
						
						var _html = "";					
						_html += '<tr id="' + _info._id.$oid + '" class="menu-list-tr">';
						_html += '	<td>' + _icon_img + '</td>';
						_html += '	<td>' + _key + '</td>';
						_html += '	<td>' + _info.menu_kr + '</td>';
						_html += '	<td>' + (_info.im_disable == 'T' ? '✔' : '') + '</td>';
						_html += '	<td><button type="button" class="btn-menu-remove" data-key="' + _key + '" data-name="' + _info.menu_kr + '">삭제</button></td>';
						_html += '	<td>' + _ty + '</td>';
						_html += '	<td><span class="menu-link">' + _link + '</span></td>';
						_html += '</tr>';
						
						$layer.find("#admin_log_list").append(_html);
						$layer.find("#" + _info._id.$oid).data('info', _info);
					}
					
					//페이징
					gcom.total_data_count = res.data.total;
					gcom.total_page_count = gcom.getPageCount(gcom.total_data_count, gcom.per_page);
					gcom.initializePage('log_paging_area');
					
					// 이벤츠 처리
					gcom.event_admin_log_list($layer);
					
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
		}else if (gcom.admin_log_menu == "portlet_mng"){
			var surl = root_path + "/portlet_list.km";
			var postData = {
					"start" : (gcom.start_skp - 1).toString(),
					"perpage" : gcom.per_page,
					"query" : gcom.admin_log_query,
					"admin" : "T"
				};
			
			if (gcom.admin_log_query) {
				postData['category'] = ($('#search_field').val());
			}
			
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
					var _list = res.data.response;
					
					if (gcom.admin_log_query != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find("#admin_log_list").empty();
					
					for (var i = 0; i < _list.length; i++){
						var _info = _list[i];						
						var _key = _info.code;
						
						var _icon_src = root_path + "/portletpreview.do?code=" + _key + '&ver=' + _info.last_update;
						var _icon_img = '<div class="menu-list-icon-preview" style="background-image:url(' + _icon_src + ');"></div>';
						_icon_img = '<div class="menu-list-icon-preview-wrap">' + _icon_img + '</div>';
						
						
						var _html = "";					
						_html += '<tr id="' + _info._id.$oid + '" class="menu-list-tr">';
						_html += '	<td>' + _icon_img + '</td>';
						_html += '	<td>' + _info.menu_kr + '</td>';
						_html += '	<td>' + _key + '</td>';
						_html += '	<td>' + (_info.im_disable == 'T' ? '✔' : '') + '</td>';
						_html += '	<td><button type="button" class="btn-menu-remove" data-key="' + _key + '" data-name="' + _info.menu_kr + '">삭제</button></td>';
						_html += '	<td><span>' + _info.comm + '</span></td>';
						_html += '</tr>';
						
						$layer.find("#admin_log_list").append(_html);
						$layer.find("#" + _info._id.$oid).data('info', _info);
					}
					
					//페이징
					gcom.total_data_count = res.data.total;
					gcom.total_page_count = gcom.getPageCount(gcom.total_data_count, gcom.per_page);
					gcom.initializePage('log_paging_area');
					
					// 이벤츠 처리
					gcom.event_admin_log_list($layer);
					
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
		}else if (gcom.admin_log_menu == "kgpt_intent"){
			if (isNaN(page_no)) page_no = 1;
			var start_idx = ((parseInt(gcom.per_page) * page_no) - (parseInt(gcom.per_page) - 1)) - 1;  
		
			var fd = {
				start: start_idx,
				end: parseInt(gcom.per_page)
			}			
			
			$.ajax({
				type: 'POST',
				url: gcom.gptserver + '/intent_list',
				crossDomain: true,
				contentType : "application/json; charset=utf-8",
				data: JSON.stringify(fd),
				success : function(res){
					var _list = res[1];
					
					if (gcom.admin_log_query != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find("#admin_log_list").empty();
					
					for (var i = 0; i < _list.length; i++){
						var _info = _list[i];						
						var _key = _info._id.$oid;
						var _code = _info.code;
						var _html = "";					
						_html += '<tr id="' + _info._id.$oid + '" class="menu-list-tr">';
						_html += '	<td>' + _code + '</td>';
						_html += '	<td>' + _info.menu + '</td>';
						_html += '	<td style="text-align:left;">' + _info.msg + '</td>';
						_html += '	<td>' + (_info.use_brief == "T" ? "사용" : "사용 안함") + '</td>';
						_html += '	<td><button type="button" class="btn-menu-remove" data-key="' + _key + '" data-code="' + _code + '" data-name="' + _info.menu + '">삭제</button></td>';
						_html += '</tr>';
						
						$layer.find("#admin_log_list").append(_html);
						$layer.find("#" + _info._id.$oid).data('info', _info);
					}
					
					//페이징
					gcom.total_data_count = res[0].totalcount;
					gcom.total_page_count = gcom.getPageCount(gcom.total_data_count, gcom.per_page);
					gcom.initializePage('log_paging_area');
					
					// 이벤츠 처리
					gcom.event_admin_log_list($layer);
					
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});				
		}
	},
	
	"event_admin_log_list" : function($layer){
		var _self = this;
		
		// 미리보기
		$layer.find('.ico-view').on("click", function(){
			var _info = $(this).parent().parent().data('info');
			var _action = _info.action;
			var _app = _action.split("_")[0];
			var _type = _action.split("_")[2];
			var _ty = (_app == "drive" ? "1" : (_app == "channel" ? "2" : "3"));
			var _email = _info.email;
			var _filename = "";
			var _md5 = "";
			var _item_id = ""
			var _ft = "";
			var _upload_path = "";

			if (typeof(_info.md5) != "undefined"){
				_md5 = _info.md5;
				
			}else{
				_md5 = _info.info[0].md5;
			}
			
			_filename = _info.filename;
			_ty = _app;
			_item_id = _info._id.$oid;
			_upload_path = (typeof(_info.upload_path) != "undefined" ? _info.upload_path : "");
			
			if (_app == "channel"){
				_item_id = _info.oid;
				_ty = "2";
				
			}else if (_app == "drive"){
				_item_id = _info.oid;
				_ty = "1";
				
			}else if (_app == "chat"){
				_item_id = _info.item_id;
				_filename = (typeof(_info.upload_path) != "undefined" ? _info.upload_path : "");
				_upload_path = _info.filename;
				
			}else if (_app == "todo"){
				_filename = (typeof(_info.upload_path) != "undefined" ? _info.upload_path : "");
				_upload_path = _info.filename;
				_ft = gap.file_extension_check(_info.filename);
				
			}else if (_app == "collect"){
				_item_id = _info.item_id;
				
			}else{
				_item_id = _info.oid;
				_ty = "3";
			}
						
			gBody3.call_system = "admin";
			gBody3.file_convert(_info.fserver, _filename, _md5, _item_id, _ty, _ft, _email, _upload_path);
			
		});
		
		// 다운로드
		$layer.find('.ico-down').on("click", function(){
			var _info = $(this).parent().parent().data('info');
			var _action = _info.action;
			var _app = _action.split("_")[0];
			var _type = _action.split("_")[2];
			var _ty = (_app == "drive" ? "1" : (_app == "channel" ? "2" : "3"));
			var _md5 = "";
			
			if (typeof(_info.md5) != "undefined"){
				_md5 = _info.md5;
				
			}else{
				_md5 = _info.info[0].md5;
			}
			
			
			var download_url = gap.search_file_convert_server(_info.fserver) + "/FDownload.do?id=" + _info.oid + "&ty=" + _ty + "&md5=" + _md5;
			
		//	var downloadurl = _fserver + "/FDownload_collection_one.do?key=" + _key + "&type=" + _type + "&md5=" + _md5;
			gBody3.call_system = "admin";
			gap.file_download_normal_todo(download_url, _info.filename);
		});
		
		// 메뉴 편집
		$layer.find('.menu-list-tr').on('click', function(){
			var _info = $(this).data('info');
			
			if (gcom.admin_log_menu == "portlet_mng") {
				_self.show_portlet_upload(_info);
			} else if (gcom.admin_log_menu == "m_menu_mng") {
				_self.show_mobile_menu_upload(_info);
			} else if (gcom.admin_log_menu == "category_mng") {
				_self.show_category_upload(_info);
			} else if (gcom.admin_log_menu == "kgpt_intent") {
				_self.show_intent_upload(_info);	
			} else {
				_self.show_menu_upload(_info);				
			}
		});
		
		// 메뉴 링크
		$layer.find('.menu-link').on('click', function(){
			var info = $(this).closest('.menu-list-tr').data('info');
			if (info.link == 'LNB') {
				mobiscroll.toast({message:'기본 LNB 메뉴는 열 수 없습니다', color:'danger'});
			} else {
				gBody.go_app_url(info);				
			}
			return false;
		});
		
		// 메뉴 삭제
		$layer.find('.btn-menu-remove').on('click', function(){
			var _key = $(this).data('key');
			var _code = $(this).data('code');
			var _name = $(this).data('name');
			
			if (gcom.admin_log_menu == "portlet_mng") {
				_self.portlet_remove(_code, _name);
			} else if (gcom.admin_log_menu == "m_menu_mng") {
				_self.menu_remove(_code, _name, true);
			} else if (gcom.admin_log_menu == "category_mng") {
				_self.category_remove(_code, _name);
			} else if (gcom.admin_log_menu == "kgpt_intent") {
				_self.intent_remove(_key, _code, _name);
			} else {
				_self.menu_remove(_code, _name);
			}
			return false;
		});
		
	},	
	
	"convertGMTLocalDateTime" : function(val){
		var _date = moment(val, 'YYYYMMDDHHmmss').utc().local().format('YYYY-MM-DD[T]HH:mm:00[Z]')
		var ret = moment.utc(_date).local().format('YYYY.MM.DD') + '(' + moment.utc(_date).local().format('ddd') + ') ' + moment.utc(_date).local().format('HH:mm');
		return ret;
	},
	
	"getPageCount" : function(doc_count, rows){
		return ret_page_count = Math.floor(gcom.total_data_count / rows) + (((gcom.total_data_count % rows) > 0) ? 1 : 0);
	},
	
	"initializePage" : function(id){
		var alldocuments = gcom.total_data_count;
		if (alldocuments % gcom.per_page > 0 & alldocuments % gcom.per_page < gcom.per_page/2 ){
			gcom.all_page = Number(Math.round(alldocuments/gcom.per_page)) + 1
		}else{
			gcom.all_page = Number(Math.round(alldocuments/gcom.per_page))
		}	

		if (gcom.start_page % gcom.per_page > 0 & gcom.start_page % gcom.per_page < gcom.per_page/2 ){
			gcom.cur_page = Number(Math.round(gcom.start_page/gcom.per_page)) + 1
		}else{
			gcom.cur_page = Number(Math.round(gcom.start_page/gcom.per_page))
		}

		gcom.initializeNavigator(id);		
	},
	
	"initializeNavigator" : function(id){
		var alldocuments = gcom.total_data_count;

		if (gcom.total_page_count == 0){
			gcom.total_page_count = 1;
		}

		if (alldocuments == 0){
			alldocuments = 1;
			gcom.total_page_count = 1;
			gcom.cur_page = 1;
		}

		if (alldocuments != 0) {
			if (gcom.total_page_count % 10 > 0 & gcom.total_page_count % 10 < 5 ){
				var all_frame = Number(Math.round(gcom.total_page_count / 10)) + 1
			}else{
				var all_frame = Number(Math.round(gcom.total_page_count / 10))	
			}

			if (gcom.cur_page % 10 > 0 & gcom.cur_page % 10 < 5 ){
				var c_frame = Number(Math.round(gcom.cur_page / 10)) + 1
			}else{
				var c_frame = Number(Math.round(gcom.cur_page / 10))
			}

			var nav = new Array();
			if (c_frame == 1){
				nav[0] = '<ul class="pagination inb">';
			}else{
				nav[0] = '<div class="arrow prev" onclick="gcom.gotoPage(' + ((((c_frame-1) * 10) - 1)*gcom.per_page + 1) + ',' + ((c_frame - 1) * 10) + ');"></div><ul class="pagination inb">';
			}			
			
			var pIndex = 1;
			var start_page = ((c_frame-1) * 10) + 1;

			for (var i = start_page; i < start_page + 10; i++){
				if (i == gcom.cur_page){
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
						nav[pIndex] = '<li onclick="gcom.gotoPage(' + (((i-1) * gcom.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
					}else{
						if (i % 10 == '1' ){
							nav[pIndex] = '<li onclick="gcom.gotoPage(' + (((i-1) * gcom.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}else{
							nav[pIndex] = '<li onclick="gcom.gotoPage(' + (((i-1) * gcom.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}
					}
				}				

				if (i == gcom.total_page_count) {
					break;
				}
				pIndex++;				
			}

			if (c_frame < all_frame){
				nav[nav.length] = '</ul><div class="arrow next" onclick="gcom.gotoPage(' + ((c_frame * gcom.per_page * 10) + 1) + ',' + ((c_frame * 10) + 1) + ');"></div>';
				
			}else{
				nav[nav.length] = '</ul>';
			}
			
		
			var nav_html = '';

			if (c_frame != 1 ){
			//	nav_html = '<li class="p-first" onclick="gcom.gotoPage(1,1);"><span>처음</span></li>';
			}		    
			for( var i = 0 ; i < nav.length ; i++){	
				nav_html += nav[i];
			}
					

			if (c_frame < all_frame){
			//	nav_html += '<li class="p-last" onclick="gcom.gotoPage(' + ((gcom.all_page - 1) * gcom.per_page + 1) + ',' + gcom.all_page + ')"><span>마지막</span></li>';
			}
			$("#" + id).html(nav_html);
		}		
	},
	
	"gotoPage" : function(idx, page_num){
		if (gcom.total_data_count < idx) {
			gcom.start_page = idx - 10;
			if ( gcom.start_page < 1 ) {
				return;
			}
		}else{
			gcom.start_page = idx;
		}
		cur_page = page_num;
		gcom.draw_admin_log_list(page_num);
	},
	
	"show_portlet_upload" : function(info){
		var _self = this;
		
		var html = 
			'<div id="portlet_upload_layer" class="reg-menu-ly">' +
			'	<div class="layer-inner" style="padding:0;">' +
			'		<div class="btn-close pop_btn_close"></div>' +
			'		<h4>포틀릿 등록</h4>' +
			'		<div class="layer-cont">' +
			'			<div class="left-cont">' + // 왼쪾 메뉴 S
			'				<div class="each">' +
			'					<div class="menu-title">호출 함수명<span class="">*</span></div>' +
			'					<div style="display:flex">' +
			'						<input id="reg_portlet_code" placeholder="함수명을 입력하세요 ex) portlet_mail, portlet_menu">' +
			'					</div>' +
			'				</div>' +
			'				<div class="each" style="display:flex;">' +
			'					<div style="margin-right:7px;width:50%;">' +
			'						<div class="menu-title">포틀릿명 (한글)<span class="">*</span></div>' +
			'						<input id="reg_portlet_name_kr">' +
			'					</div>' +
			'					<div style="width:50%;">' +
			'						<div class="menu-title">포틀릿명 (영문)<span class="">*</span></div>' +
			'						<input id="reg_portlet_name_en">' +
			'					</div>' +
			'				</div>' +
			'				<div class="each" style="display:flex;">' +
			'					<div style="width:100%;">' +
			'						<div class="menu-title">미리보기 이미지<span class="">*</span></div>' +
			'						<div style="display:flex;">' +
			'							<div id="reg_portlet_icon" class="reg-menu-preview dropzone-previews"></div>' +
			'							<button id="reg_portlet_add_file" class="btn-menu">이미지 선택</button>' +
			'						</div>' +
			'						<div style="font-size:13px;color:#ff0000;margin-top:2px;">png 파일만 업로드 가능합니다.</div>' +
			'					</div>' +
			'				</div>' +			
			'				<div class="each">' +
			'					<div class="menu-title">포틀릿 설명</div>' +
			'					<textarea id="reg_portlet_comm"></textarea>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">버튼표시</div>' +
			'					<div style="display:flex">' +
			'						<label style="margin-right:20px;"><input type="checkbox" id="portlet_btn_refresh" value="T">새로고침</label>' +
			'						<label><input type="checkbox" id="portlet_btn_config" value="T">환경설정</label>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each" style="display:none;">' +
			'					<div class="menu-title">담당자</div>' +
			'					<div style="display:flex;">' +
			'						<input id="reg_portlet_mng">' +
			'						<div class="btn-menu-mng-org"></div>' +
			'					</div>' +
			'					<div id="portlet_mng_user_wrap" style="display:none;">' +
			'						<ul id="portlet_mng_user_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +
			'				</div>' +
			'			</div>' +	// 왼쪽 메뉴 E
			'			<div class="right-cont">' + // 오른쪽 메뉴 S
			'				<div class="each">' +
			'					<div class="menu-title">권한 (회사)</div>' +
			'					<div class="grant-com-sel-wrap"><span id="grant_com_allsel">전체선택</span> | <span id="grant_com_desel">선택해제</span></div>' +
			'					<div id="portlet_grant_com_wrap">' +
			'						<ul id="portlet_grant_com_list" class="menu-usermng-wrap grant-com-list"></ul>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">권한 (부서,개인)</div>' +
			'					<div style="display:flex;">' +
			'						<input id="reg_portlet_grant">' +
			'						<div class="btn-menu-grant-org"></div>' +
			'					</div>' +
			'					<div id="portlet_grant_wrap" style="display:none;">' +
			'						<ul id="portlet_grant_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<label><input type="checkbox" id="portlet_disable_im" value="T">im사번 표시 안함</label>' +
			'				</div>' +
			'			</div>' +	//오른쪽 메뉴 E
			'		</div>' +
			'		<div style="margin-top:20px;text-align:center;">' +
			'			<button class="btn-ok">확인</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		// 컨펌창 표시하기
		$('#admin_log_layer').parent().append(html);
		
		// index 값 조정
		var block_idx = parseInt($('#blockui').css('z-index'));
		$('#admin_log_layer').css('z-index', block_idx - 1);
		$('#portlet_upload_layer').css('z-index', block_idx + 1);
		
		var _company = '';
		// 회사정보 가져오기
		$.ajax({
			url: gap.channelserver + "/search_company.km",
			async: false,
			success: function(res){
				$.each(res, function(){
					_company += 
						'<li data-key="' + this.cpc + '">' +
						'	<label>' +
						'		<input type="checkbox" value="' + this.cpc + '">' +
						'		<span>' + this.cp + '</span>' +
						'	</label>' +
						'</li>';
				});
				$('#portlet_grant_com_list').html(_company);
			}
		});
		
		var is_edit = (info ? true : false);
		
		this.portlet_upload_event(is_edit);
		
		// 편집으로 여는 경우
		if (is_edit) {
			$('#reg_portlet_code').val(info.code).prop('readonly', true);
			$('#reg_portlet_code').data('sort', info.sort);
			$('#reg_portlet_name_kr').val(gap.textToHtml(info.menu_kr));
			$('#reg_portlet_name_en').val(gap.textToHtml(info.menu_en));
			$('#reg_portlet_comm').val(gap.textToHtml(info.comm));
			
			$('#reg_menu_key_check').hide();
			
			
			// 아이콘
			var icon_src = root_path + "/portletpreview.do?code=" + info.code + '&ver=' + info.last_update;
			var preview_icon = '<div class="menu-preview-icon" style="background-image:url(' + icon_src + ')"></div>';
			$('#reg_portlet_icon').append(preview_icon);
			
			// 버튼
			if (info.btn_refresh == 'T') {
				$('#portlet_btn_refresh').prop('checked', true);
			}
			if (info.btn_config == 'T') {
				$('#portlet_btn_config').prop('checked', true);
			}
			
			
			// 담당자 정보 입력
			if (info.manager) {
				$.each(info.manager, function(){
					_self.add_portlet_mnguser(this);					
				});
			}
			
			// 권한 (회사)
			if (info.readers_company) {
				$.each(info.readers_company, function(){
					$('#portlet_upload_layer input[value="' + this + '"]').prop('checked', true);
				});
			}
			
			// 권한 (부서,개인)
			if (info.readers_deptuser) {
				$.each(info.readers_deptuser, function(){
					_self.add_portlet_grant(this);
				});
			}
			
			// im사번 표시
			if (info.im_disable == 'T') {
				$('#portlet_disable_im').prop('checked', true);
			}
		}
	},
	
	"hide_portlet_upload" : function(){
		$('#portlet_upload_layer').remove();
		
		var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
		var block_idx = parseInt($('#blockui').css('z-index'));
		
		// Admin 페이지가 열려있는 상황인 경우 처리
		if (admin_menu_idx && block_idx) {
			$('#admin_log_layer').css('z-index', block_idx+1);
		}
	},
	
	"portlet_remove" : function(code, menu_nm){
		var _self = this;
		
		gap.showConfirm({
			title: '포틀릿 삭제',
			//iconClass: 'remove',
			contents: '<span>' + menu_nm + '</span><br>포틀릿을 정말 삭제할까요?',
			callback: function(){
				gap.show_loading('처리 중');
				
				$.ajax({
					type: 'POST',
					url: gap.channelserver + '/portlet_delete.km',
					dataType: 'json',
					data: JSON.stringify({code: code}),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success: function(res){
						mobiscroll.toast({message:'삭제되었습니다', color:'info'});
						
						$('#show_loading_layer').remove();
						var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
						var block_idx = parseInt($('#blockui').css('z-index'));
						
						// Admin 페이지가 열려있는 상황인 경우 처리
						if (admin_menu_idx && block_idx) {
							$('#admin_log_layer').css('z-index', block_idx+1);
						}
						
						_self.draw_admin_log_list(_self.cur_page);
						
					},
					error: function(){
						$('#show_loading_layer').remove();
						var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
						var block_idx = parseInt($('#blockui').css('z-index'));
						
						// Admin 페이지가 열려있는 상황인 경우 처리
						if (admin_menu_idx && block_idx) {
							$('#admin_log_layer').css('z-index', block_idx+1);
						}
					}
					
				});
			}
		});
	},
	
	"portlet_upload_event" : function(is_edit){
		var _self = this;
		
		// 이벤트 처리
		var $menu_ly = $('#portlet_upload_layer');
		$menu_ly.find('.btn-close').on('click', function(){
			_self.hide_portlet_upload();
		});
		
		
		
		if (window.myDropzone_portletico) {
			myDropzone_portletico.destroy();
			myDropzone_portletico = null;
		}
		
		var selectid = 'reg_portlet_icon';
		window.myDropzone_portletico = new Dropzone("#" + selectid, { // Make the whole body a dropzone
			url: root_path + "/FileControl_portlet.do",
			thumbnailWidth: 250,
			thumbnailHeight: 100,
			thumbnailMethod: 'crop', // contain , crop
			autoProcessQueue: false, 
			parallelUploads: 100, 
			maxFiles: 1,
			maxFilesize: 1024,
			timeout: 180000,
			uploadMultiple: true,
			acceptedFiles: 'image/png',
			withCredentials: false,
			previewsContainer: "#" + selectid,
			clickable: "#" + selectid,
			renameFile: function(file){		
				return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			},
			init: function() {
				myDropzone_portletico = this;
				this.imagelist = new Array();
			},
			success : function(file, json){
				_self.reg_portlet_save();
			},
			error: function(){
				
			}
		});
		
		myDropzone_portletico.is_edit = is_edit;
		
		myDropzone_portletico.on("totaluploadprogress", function(progress) {	
			//$("#show_loading_progress").text(parseInt(progress) + "%");
		});
		
		myDropzone_portletico.on("addedfiles", function (file) {
			
			/*
			// png 이외 파일은 업로드 안되도록 예외처리
			var f_nm = file[0].name;
			var f_ext = f_nm.substr(f_nm.indexOf('.') + 1);
			if (f_ext != 'png') {
				alert('png이미지만 업로드 가능합니다');
				
				setTimeout(function(){
					// 문제되는 파일들이 있음 먼저 삭제처리
					var reject_list = myDropzone_portletico.getRejectedFiles();
					$.each(reject_list, function(){
						$(this.previewElement).remove();
					});
				}, 1000);
				
				return false;
			}
			*/
			
			
			// 파일은 하나만 저장되도록 처리함
			if (myDropzone_portletico.files.length >= 2) {
				myDropzone_portletico.removeFile(myDropzone_portletico.files[0]);
			}
			
			// 편집상태인 경우 기존 등록한 미리보기 엘리먼트 삭제
			$('#reg_portlet_icon .menu-preview-icon').remove();
		});
		
		myDropzone_portletico.on("sending", function (file, xhr, formData) {
			gap.show_loading(gap.lang.saving);
			
			_code = $.trim($('#reg_portlet_code').val());
			formData.append("code",_code);
		});
		
		// 파일추가
		$('#reg_portlet_add_file').on('click', function(){
			$('#reg_portlet_icon').click();
		});
		
		
		
		// 담당자 입력
		$('#reg_portlet_mng').on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			var terms = $.trim($(this).val());
			if (terms == '') return;
			
			var users = terms.split(',');
			
			gsn.requestSearch('', terms, function(res){
				$.each(res, function(){
					_self.add_portlet_mnguser(this);
				});
				$('#reg_portlet_mng').focus();				
			});					
			
			
			$(this).val('');
		})
		
		
		// 담당자 입력 (조직도 선택)
		$menu_ly.find('.btn-menu-mng-org').on('click', function(){
			var block_idx = parseInt($('#blockui').css('z-index'));
			$menu_ly.css('z-index', block_idx-1);
			window.ORG.show(
				{
					'title': '담당자 선택',
					'single': false,
					'show_ext' : false, // 외부 사용자 표시 여부
					'select': 'person' // [all, team, person]
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length == 0) return;
						for (var i = 0; i < items.length; i++){
							var _res = gap.convert_org_data(items[i]);
							_self.add_portlet_mnguser(_res);
						}
					},
					onClose: function(){
						$menu_ly.css('z-index', block_idx+1);
					}
				}
			);
		});
		
		// 회사 전채선택
		$('#grant_com_allsel').on('click', function(){
			$('#portlet_grant_com_list input[type="checkbox"]').prop('checked', true);
		});
		$('#grant_com_desel').on('click', function(){
			$('#portlet_grant_com_list input[type="checkbox"]').prop('checked', false);
		});
		
		
		
		// 권한 등록
		$('#reg_portlet_grant').on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			var terms = $.trim($(this).val());
			if (terms == '') return;
			
			var users = terms.split(',');
			
			gsn.requestSearch('', terms, function(res){
				$.each(res, function(){
					_self.add_portlet_grant(this);
				});
				$('#reg_portlet_grant').focus();				
			});					
			
			
			$(this).val('');
		})
		
		// 권한 입력 (조직도 선택)
		$menu_ly.find('.btn-menu-grant-org').on('click', function(){
			var block_idx = parseInt($('#blockui').css('z-index'));
			$menu_ly.css('z-index', block_idx-1);
			window.ORG.show(
				{
					'title': '권한 설정',
					'single': false,
					'show_ext' : false // 외부 사용자 표시 여부
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length == 0) return;
						for (var i = 0; i < items.length; i++){
							var _res = gap.convert_org_data(items[i]);
							_self.add_portlet_grant(_res);
						}
					},
					onClose: function(){
						$menu_ly.css('z-index', block_idx+1);
					}
				}
			);
		});
		
		// 저장하기
		$menu_ly.find('.btn-ok').on('click', function(){
			var $this = $(this);
			// 중복 수행 방지
			if ($this.hasClass('process')) return;
			
			$this.addClass('process');

			var valid = _self.reg_portlet_valid();
			
			if (!valid) {
				$this.removeClass('process');
				return false;
			}
			

			if (is_edit) {

				_save_portlet();
				
			} else {
				var _code = $.trim($('#reg_portlet_code').val());
				$.ajax({
					type: "POST",
					async: false,
					url: gap.channelserver + "/portlet_dual_check.km",
					dataType : "json",
					data : JSON.stringify({code:_code}),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success: function(res){
						if (res.data.data.exist == 'T') {
							mobiscroll.toast({message:"중복된 Key가 있습니다.", color:"danger"});
							$('#reg_portlet_code').focus();
							$this.removeClass('process');
						} else {
							
							// 키 중복 체크 후 최종 저장하는 부분
							_save_portlet();							
						}
					},
					error: function(){
						mobiscroll.toast({message:"Key 중복 체크 수행중 오류가 발생했습니다", color:"danger"});
						$this.removeClass('process');
					}
				});
			}
		});
		
		function _save_portlet(){
			if (myDropzone_portletico.files.length == 0){
				_self.reg_portlet_save();
			}else{
				myDropzone_portletico.processQueue();
			}
		}

	},
	
	"reg_portlet_valid" : function(){
		var _code = $.trim($('#reg_portlet_code').val());
		if (_code == '') {
		//	alert('호출 함수명을 입력해주세요');
			mobiscroll.toast({message:'호출 함수명을 입력해주세요', color:'danger'});
			$('#reg_portlet_code').focus();
			return false;
		}
		
		
		// 이미지 선택 여부
		// 신규 등록인데 이미지가 없으면 안됨
		if (!myDropzone_portletico.is_edit && myDropzone_portletico.files.length == 0) {
		//	alert('미리보기 이미지를 선택해주세요');
			mobiscroll.toast({message:'미리보기 이미지를 선택해주세요', color:'danger'});
			$('#reg_portlet_add_file').click();
			return false;
		} else if (myDropzone_portletico.files.length == 1) {
			var f_nm = myDropzone_portletico.files[0].name;
			var f_ext = f_nm.substr(f_nm.indexOf('.') + 1);
			if (f_ext != 'png') {
				alert('png이미지만 업로드 가능합니다');
				return false;
			}
		}
		
		
		// 메뉴명 (한글, 영문)
		var _menu_kr = $.trim($('#reg_portlet_name_kr').val());
		var _menu_en = $.trim($('#reg_portlet_name_en').val());
		if (!_menu_kr) {
		//	alert('포틀릿명(한글)을 입력해주세요.');
			mobiscroll.toast({message:'포틀릿명(한글)을 입력해주세요.', color:'danger'});
			$('#reg_portlet_name_kr').focus();
			return false;
		}
		if (!_menu_en) {
		//	alert('포틀릿명(영문)을 입력해주세요.');
			mobiscroll.toast({message:'포틀릿명(영문)을 입력해주세요.', color:'danger'});
			$('#reg_portlet_name_en').focus();
			return false;
		}

		return true;
	},
	
	"reg_portlet_save" : function(){
		// 최종 완료 처리
		var _self = this;
		
		gap.show_loading('');
		
		var _code = $.trim($('#reg_portlet_code').val());
		var _menu_kr = $.trim($('#reg_portlet_name_kr').val());
		var _menu_en = $.trim($('#reg_portlet_name_en').val());
		var _sort = $('#reg_portlet_code').data('sort');
		var _comm = $.trim($('#reg_portlet_comm').val());
		var _mng_user = [];
		var _readers_all = [];
		var _readers_company = [];
		var _readers_deptuser = [];
		
		var _btn_refresh = $('#portlet_btn_refresh').is(':checked') ? 'T' : 'F';
		var _btn_config = $('#portlet_btn_config').is(':checked') ? 'T' : 'F';
		var _im_disable = $('#portlet_disable_im').is(':checked') ? 'T' : 'F'; 
		// 담당자
		$('#portlet_mng_user_list li').each(function(){
			_mng_user.push($(this).data('info'));
		});
		
		// 권한 (회사)
		$('#portlet_grant_com_list input[type="checkbox"]:checked').each(function(){
			_readers_all.push($(this).val() + "");
			_readers_company.push($(this).val() + "");
		});
		// 권한 (부서,개인)
		$('#portlet_grant_list li').each(function(){
			_readers_all.push($(this).data('key') + "");
			_readers_deptuser.push($(this).data('info'));
		});
		// 권한 설정 안한경우 전체 권한 부여
		if (_readers_all.length == 0) {
			_readers_all.push('all');
		}
		
		var obj = JSON.stringify({
			code: _code,
			menu_kr: _menu_kr,
			menu_en: _menu_en,
			comm: _comm,
			manager: _mng_user,
			readers: _readers_all,
			readers_company: _readers_company,
			readers_deptuser: _readers_deptuser,
			im_disable: _im_disable,
			btn_refresh: _btn_refresh,
			btn_config: _btn_config,
			sort: _sort ? _sort : moment().format('YYYYMMDDHHmmss'),	// 소트는 처음 생성시 만들어지고 업데이트 안함
			last_update: moment().format('YYYYMMDDHHmmss')
		});

		$.ajax({
			type: 'POST',
			url: gap.channelserver + '/portlet_save.km',
			dataType: 'json',
			data: obj,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success: function(res){
				mobiscroll.toast({message:'저장되었습니다', color:'info'});
				$('#show_loading_layer').remove();
				$('#portlet_upload_layer .btn-close').click();

				// 리스트를 새로고침해야 함
				if (myDropzone_portletico.is_edit) {
					_self.draw_admin_log_list(_self.cur_page);
				} else {
					_self.draw_admin_log_list(1);					
				}
			},
			error: function(){
				
			}
			
		});		
	},
	
	"add_portlet_mnguser" : function(user_info){	// 담당자 추가
		var $list = $('#portlet_mng_user_list');
		var ck = $list.find('li[data-key="' + user_info.ky + '"]');
		if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
		
				
		var disp_txt = '';
		user_info = gap.user_check(user_info);
		disp_txt = '<a onclick="gOrg.showUserDetailLayer(\'' + user_info.ky + '\')">' + user_info.name + ' ' + user_info.jt + ' | ' + user_info.dept + '</a>';
				
		var html =
			'<li class="f_between" data-key="' + user_info.ky + '">' +
			'	<span class="txt ko">' + disp_txt + '</span>' +
			'	<button class="file_remove_btn"></button>' +
			'</li>';
		
		var $li = $(html);
		
		$li.data('info', user_info);
		$li.find('.file_remove_btn').on('click', function(){
			$(this).closest('li').remove();
			
			if ($list.find('li').length == 0) {
				$('#portlet_mng_user_wrap').hide();
			}
		});
		
		$list.append($li);
		$('#portlet_mng_user_wrap').show();
	},
	
	"add_portlet_grant" : function(user_info){	// 권한 추가
		var $list = $('#portlet_grant_list');
		var ck = $list.find('li[data-key="' + user_info.ky + '"]');
		if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
		
				
		var disp_txt = '';
		user_info = gap.user_check(user_info);
		
		
		
		if (user_info.dsize == 'group'){
			disp_txt = '<a class="grant-group">' + user_info.name + ' | ' + user_info.cp + '</a>';
		} else {
			disp_txt = '<a onclick="gOrg.showUserDetailLayer(\'' + user_info.ky + '\')">' + user_info.name + ' ' + user_info.jt + ' | ' + user_info.dept + '</a>';			
		}
		
		var html =
			'<li class="f_between" data-key="' + user_info.ky + '">' +
			'	<span class="txt ko">' + disp_txt + '</span>' +
			'	<button class="file_remove_btn"></button>' +
			'</li>';
		
		var $li = $(html);
		
		$li.data('info', user_info);
		$li.find('.file_remove_btn').on('click', function(){
			$(this).closest('li').remove();
			
			if ($list.find('li').length == 0) {
				$('#portlet_grant_wrap').hide();
			}
		});
		
		$list.append($li);
		$('#portlet_grant_wrap').show();
	},
	
	"show_intent_upload" : function(info){
		var _self = this;
		
		var html = 
			'<div id="intent_upload_layer" class="reg-menu-ly">' +
			'	<div class="layer-inner" style="padding:0;">' +
			'		<div class="btn-close pop_btn_close"></div>' +
			'		<h4>Intent 등록</h4>' +
			'		<div class="layer-cont">' +
			'			<div class="left-cont">' + // 왼쪾 메뉴 S
			'				<div class="each" style="display:flex;">' +
			'					<div style="margin-right:7px;width:50%;">' +
			'						<div class="menu-title">코드</div>' +
			'						<input id="reg_code" placeholder="코드 입력">' +
			'					</div>' +
			'					<div style="width:50%;">' +
			'						<div class="menu-title">메뉴 코드</div>' +
			'						<input id="reg_menu_code" placeholder="메뉴 코드 입력">' +
			'					</div>' +
			'				</div>' +
			'				<div class="each" style="display:flex;">' +
			'					<div style="margin-right:7px;width:50%;">' +
			'						<div class="menu-title">메뉴명 (한글)</div>' +
			'						<input id="reg_menu_name_kr">' +
			'					</div>' +
			'					<div style="width:50%;">' +
			'						<div class="menu-title">메뉴명 (영문)</div>' +
			'						<input id="reg_menu_name_en">' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">메시지 (한글)</div>' +
			'					<input id="reg_msg_kr">' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">메시지 (영문)</div>' +
			'					<input id="reg_msg_en">' +
			'				</div>' +			
			'				<div class="each">' +
			'					<div class="menu-title">Refer</div>' +
			'					<div style="display:flex;">' +
			'						<input id="reg_intent_refer" placeholder="입력 후 엔터">' +
		//	'						<div class="btn-menu-mng-org"></div>' +
			'					</div>' +
			'					<div id="menu_mng_user_wrap" style="display:none;">' +
			'						<ul id="menu_mng_user_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">브리핑 사용</div>' +
			'					<div style="display:flex; padding-top:5px;">' +			
			'						<div class="type_list flex on" data-value="T">' +
			'							<div class="chk_wr" style="margin-top:3px;"><div class="chk_point"></div></div>' +
			'							<div class="txt_wr">' +
			'								<strong>사용</strong>' +
			'							</div>' +
			'						</div>' +
			'						<div class="type_list flex" data-value="F" style="margin-left:10px;">' +
			'							<div class="chk_wr" style="margin-top:3px;"><div class="chk_point"></div></div>' +
			'							<div class="txt_wr">' +
			'								<strong>사용 안함</strong>' +
			'							</div>' +
			'						</div>' +
			'					</div>' +				
			'				</div>' +			
			'			</div>' +	// 왼쪽 메뉴 E
			'			<div class="right-cont">' + // 오른쪽 메뉴 S
			'				<div class="each">' +
			'					<div class="menu-title">권한 (회사)</div>' +
			'					<div class="grant-com-sel-wrap"><span id="grant_com_allsel">전체선택</span> | <span id="grant_com_desel">선택해제</span></div>' +
			'					<div id="menu_grant_com_wrap">' +
			'						<ul id="menu_grant_com_list" class="menu-usermng-wrap grant-com-list"></ul>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">권한 (부서,개인)</div>' +
			'					<div style="display:flex;">' +
			'						<input id="reg_menu_grant">' +
			'						<div class="btn-menu-grant-org"></div>' +
			'					</div>' +
			'					<div id="menu_grant_wrap" style="display:none;">' +
			'						<ul id="menu_grant_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<label><input type="checkbox" id="menu_disable_im" value="T">im사번 표시 안함</label>' +
			'				</div>' +
			'			</div>' +	//오른쪽 메뉴 E
			'		</div>' +
			'		<div style="margin-top:20px;text-align:center;">' +
			'			<button class="btn-ok">확인</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		// 컨펌창 표시하기
		$('#admin_log_layer').parent().append(html);
		
		// index 값 조정
		var block_idx = parseInt($('#blockui').css('z-index'));
		$('#admin_log_layer').css('z-index', block_idx - 1);
		$('#intent_upload_layer').css('z-index', block_idx + 1);
		
		var _company = '';
		// 회사정보 가져오기
		$.ajax({
			url: root_path + "/search_company.km",
			async: false,
			success: function(res){
				$.each(res, function(){
					_company += 
						'<li data-key="' + this.cpc + '">' +
						'	<label>' +
						'		<input type="checkbox" value="' + this.cpc + '">' +
						'		<span>' + this.cp + '</span>' +
						'	</label>' +
						'</li>';
				});
				$('#menu_grant_com_list').html(_company);
			}
		});
		
		var is_edit = (info ? true : false);
		var is_mobile = false;
		this.intent_upload_event(is_edit, is_mobile);
		
		// 편집으로 여는 경우
		if (is_edit) {
			$('#reg_code').val(info.code).prop('readonly', true);
			$('#reg_menu_code').val(info.menu_code); //.prop('readonly', true);
			$('#reg_menu_code').data('sort', info.sort);
			$('#reg_menu_code').data('key', info._id.$oid);
			$('#reg_menu_name_kr').val(gap.textToHtml(info.menu));
			$('#reg_menu_name_en').val(gap.textToHtml(info.menu_en));
			$('#reg_msg_kr').val(info.msg);
			$('#reg_msg_en').val(info.msg_en);			
			
			if (info.ref.length > 0){
				$.each(info.ref, function(){
					_self.add_intent_refer(this);	
				});
			}
			
			// 타입선택
			$.each($('#intent_upload_layer').find('.type_list'), function(){
				if ($(this).data('value') == info.use_brief){
					(this).click();
					return false;
				}
			});
			
			// 담당자 정보 입력
			if (info.manager) {
				$.each(info.manager, function(){
					_self.add_menu_mnguser(this);					
				});
			}
			
			// 권한 (회사)
			if (info.readers_company) {
				$.each(info.readers_company, function(){
					$('input[value="' + this + '"]').prop('checked', true);
				});
			}
			
			// 권한 (부서,개인)
			if (info.readers_deptuser) {
				$.each(info.readers_deptuser, function(){
					_self.add_menu_grant(this);
				});
			}
			
			// im사번 표시
			if (info.im_disable == 'T') {
				$('#menu_disable_im').prop('checked', true);
			}
		}
	},
	
	"hide_intent_upload" : function(){
		$('#intent_upload_layer').remove();
		
		var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
		var block_idx = parseInt($('#blockui').css('z-index'));
		
		// Admin 페이지가 열려있는 상황인 경우 처리
		if (admin_menu_idx && block_idx) {
			$('#admin_log_layer').css('z-index', block_idx+1);
		}
	},
	
	"intent_remove" : function(key, code, menu_nm){
		var _self = this;
		
		gap.showConfirm({
			title: 'Intent 삭제',
			//iconClass: 'remove',
			contents: '<span>' + menu_nm + '</span><br>Intent를 정말 삭제할까요?',
			callback: function(){
				gap.show_loading('처리 중');
				
				$.ajax({
					type: 'POST',
					url: gcom.gptserver + '/intent_delete',
					crossDomain: true,
					contentType : "application/json; charset=utf-8",
					data: JSON.stringify({key: key, code: code}),
					success : function(res){
						mobiscroll.toast({message:'삭제되었습니다', color:'info'});
						
						$('#show_loading_layer').remove();
						var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
						var block_idx = parseInt($('#blockui').css('z-index'));
						
						// Admin 페이지가 열려있는 상황인 경우 처리
						if (admin_menu_idx && block_idx) {
							$('#admin_log_layer').css('z-index', block_idx+1);
						}
						
						_self.draw_admin_log_list(_self.cur_page);				
					},
					error : function(e){
						$('#show_loading_layer').remove();
						var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
						var block_idx = parseInt($('#blockui').css('z-index'));
						
						// Admin 페이지가 열려있는 상황인 경우 처리
						if (admin_menu_idx && block_idx) {
							$('#admin_log_layer').css('z-index', block_idx+1);
						}
					}
				});					
			}
		});
	},	
	
	"intent_upload_event" : function(is_edit, is_mobile){
		var _self = this;
		
		// 이벤트 처리
		var $intent_ly = $('#intent_upload_layer');
		$intent_ly.find('.btn-close').on('click', function(){
			_self.hide_intent_upload();
		});
		
		// Refer 입력
		$('#reg_intent_refer').on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			var terms = $.trim($(this).val());
			if (terms == '') return;
			
			_self.add_intent_refer(terms);
			
			$(this).focus();	
			$(this).val('');
		});
		
		// 타입선택
		$intent_ly.find('.type_list').on('click', function(){
			if ($(this).hasClass('on')) return false;
			$intent_ly.find('.type_list').removeClass('on');
			$(this).addClass('on');
		});
		
		
		// 담당자 입력
		$('#reg_menu_mng').on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			var terms = $.trim($(this).val());
			if (terms == '') return;
			
			var users = terms.split(',');
			
			gsn.requestSearch('', terms, function(res){
				$.each(res, function(){
					_self.add_menu_mnguser(this);
				});
				$('#reg_menu_mng').focus();				
			});					
			
			
			$(this).val('');
		})
		
		
		// 담당자 입력 (조직도 선택)
		$intent_ly.find('.btn-menu-mng-org').on('click', function(){
			var block_idx = parseInt($('#blockui').css('z-index'));
			$intent_ly.css('z-index', block_idx-1);
			window.ORG.show(
				{
					'title': '담당자 선택',
					'single': false,
					'show_ext' : false, // 외부 사용자 표시 여부
					'select': 'person' // [all, team, person]
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length == 0) return;
						for (var i = 0; i < items.length; i++){
							var _res = gap.convert_org_data(items[i]);
							_self.add_menu_mnguser(_res);
						}
					},
					onClose: function(){
						$menu_ly.css('z-index', block_idx+1);
					}
				}
			);
		});
		
		// 회사 전채선택
		$('#grant_com_allsel').on('click', function(){
			$('#menu_grant_com_list input[type="checkbox"]').prop('checked', true);
		});
		$('#grant_com_desel').on('click', function(){
			$('#menu_grant_com_list input[type="checkbox"]').prop('checked', false);
		});
		
		
		// 권한 등록
		$('#reg_menu_grant').on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			var terms = $.trim($(this).val());
			if (terms == '') return;
			
			var users = terms.split(',');
			
			gsn.requestSearch('', terms, function(res){
				$.each(res, function(){
					_self.add_menu_grant(this);
				});
				$('#reg_menu_grant').focus();				
			});					
			
			
			$(this).val('');
		})
		
	
		// 권한 입력 (조직도 선택)
		$intent_ly.find('.btn-menu-grant-org').on('click', function(){
			var block_idx = parseInt($('#blockui').css('z-index'));
			$intent_ly.css('z-index', block_idx-1);
			window.ORG.show(
				{
					'title': '권한 설정',
					'single': false,
					'show_ext' : false // 외부 사용자 표시 여부
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length == 0) return;
						for (var i = 0; i < items.length; i++){
							var _res = gap.convert_org_data(items[i]);
							_self.add_menu_grant(_res);
						}
					},
					onClose: function(){
						$intent_ly.css('z-index', block_idx+1);
					}
				}
			);
		});
		
		// 저장하기
		$intent_ly.find('.btn-ok').on('click', function(){
			var $this = $(this);
			// 중복 수행 방지
			if ($this.hasClass('process')) return;
			
			$this.addClass('process');

			var valid = _self.reg_intent_valid();
			
			if (!valid) {
				$this.removeClass('process');
				return false;
			}
			

			_save_intent(is_edit);
		});
		
		function _save_intent(is_edit){
			_self.reg_intent_save(is_edit);
		}
	},	
	
	"add_intent_refer" : function(disp_txt){	// refer 추가
		var $list = $('#menu_mng_user_list');
		var ck = $list.find('li[data-txt="' + disp_txt + '"]');
		if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
		
		var html =
			'<li class="f_between">' +
			'	<span class="txt ko" style="font-size:13px;padding-top:2px;">' + disp_txt + '</span>' +
			'	<button class="file_remove_btn"></button>' +
			'</li>';
		
		var $li = $(html);
		
		$li.data('txt', disp_txt);
		$li.find('.file_remove_btn').on('click', function(){
			$(this).closest('li').remove();
			
			if ($list.find('li').length == 0) {
				$('#menu_mng_user_wrap').hide();
			}
		});
		
		$list.append($li);
		$('#menu_mng_user_wrap').show();
	},
	
	"reg_intent_valid" : function(){
		var _code = $.trim($('#reg_code').val());
		if (_code == '') {
			mobiscroll.toast({message:'코드를 입력해주세요.', color:'danger'});
			$('#reg_code').focus();
			return false;
		}	
		
		var _menu_code = $.trim($('#reg_menu_code').val());
		if (_menu_code == '') {
			mobiscroll.toast({message:'메뉴 코드를 입력해주세요.', color:'danger'});
			$('#reg_menu_code').focus();
			return false;
		}
		
		// 메뉴명 (한글, 영문)
		var _menu_kr = $.trim($('#reg_menu_name_kr').val());
		var _menu_en = $.trim($('#reg_menu_name_en').val());
		if (!_menu_kr) {
			mobiscroll.toast({message:'메뉴명(한글)을 입력해주세요.', color:'danger'});
			$('#reg_menu_name_kr').focus();
			return false;
		}
		if (!_menu_en) {
			mobiscroll.toast({message:'메뉴명(영문)을 입력해주세요.', color:'danger'});
			$('#reg_menu_name_en').focus();
			return false;
		}
		
		// 메시지 (한글, 영문)
		var _msg_kr = $.trim($('#reg_msg_kr').val());
		var _msg_en = $.trim($('#reg_msg_en').val());
		if (!_msg_kr) {
			mobiscroll.toast({message:'메시지(한글)를 입력해주세요.', color:'danger'});
			$('#reg_msg_name_kr').focus();
			return false;
		}
		if (!_msg_en) {
			mobiscroll.toast({message:'메시지(영문)를 입력해주세요.', color:'danger'});
			$('#reg_msg_name_en').focus();
			return false;
		}
		
		if ($("#menu_mng_user_list li").length == 0){
			mobiscroll.toast({message:'Refer를 입력해주세요.', color:'danger'});
			$('#reg_intent_refer').focus();
			return false;
		}
			
		return true;
	},
	
	"reg_intent_save" : function(is_edit){
		// 최종 완료 처리
		var _self = this;
		
		gap.show_loading('');
		
		var _key = $('#reg_menu_code').data('key');
		var _code = $.trim($('#reg_code').val());
		var _menu_code = $.trim($('#reg_menu_code').val());
		var _menu_kr = $.trim($('#reg_menu_name_kr').val());
		var _menu_en = $.trim($('#reg_menu_name_en').val());
		var _sort = $('#reg_menu_code').data('sort');
		var _msg_kr = $.trim($('#reg_msg_kr').val());
		var _msg_en = $.trim($('#reg_msg_en').val());
		var _refer = [];
		var _mng_user = [];
		var _readers_all = [];
		var _readers_company = [];
		var _readers_deptuser = [];
		var _im_disable = $('#menu_disable_im').is(':checked') ? 'T' : 'F';
		
		var $intent_ly = $('#intent_upload_layer');
		var $sel_type = $intent_ly.find('.type_list.on');
		var _use_brief = $sel_type.data('value');
		
		// Refer
		$('#menu_mng_user_list li').each(function(){
			_refer.push($(this).data('txt') + "");
		});

		// 담당자
		$('#menu_mng_user_list li').each(function(){
			_mng_user.push($(this).data('info'));
		});
		
		// 권한 (회사)
		$('#menu_grant_com_list input[type="checkbox"]:checked').each(function(){
			_readers_all.push($(this).val() + "");
			_readers_company.push($(this).val() + "");
		});
		// 권한 (부서,개인)
		$('#menu_grant_list li').each(function(){
			_readers_all.push($(this).data('key') + "");
			_readers_deptuser.push($(this).data('info'));
		});
		// 권한 설정 안한경우 전체 권한 부여
		if (_readers_all.length == 0) {
			_readers_all.push('all');
		}
		
		var obj = {
			key: _key,
			code: _code,
			menu_code: _menu_code,
			menu: _menu_kr,
			menu_en: _menu_en,
			msg: _msg_kr,
			msg_en: _msg_en,
			ref: _refer,		
			use_brief: _use_brief,
			readers: _readers_all,
			readers_company: _readers_company,
			readers_deptuser: _readers_deptuser,
			train: "F",
			update: (is_edit ? "T" : "F"),
			im_disable: _im_disable,
			sort: _sort ? _sort : moment().format('YYYYMMDDHHmmss'),	// 소트는 처음 생성시 만들어지고 업데이트 안함
			//sort: moment().format('YYYYMMDDHHmmss'),
			last_update: moment().format('YYYYMMDDHHmmss')
		};

		$.ajax({
			type: 'POST',
			url: gcom.gptserver + '/intent_save',
			crossDomain: true,
			contentType : "application/json; charset=utf-8",
			data: JSON.stringify(obj),
			success : function(res){
				mobiscroll.toast({message:'저장되었습니다', color:'info'});
				$('#show_loading_layer').remove();
				$('#intent_upload_layer .btn-close').click();
					// 리스트를 새로고침해야 함
				_self.draw_admin_log_list(1);					
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});	
	},	
	
	"callRealtimeTraining" : function(){
		var _self = this;
		
		$.ajax({
			type: 'POST',
			url: this.gptserver + '/run_script_intent',
			crossDomain: true,
			contentType : "application/json; charset=utf-8",
			success: function(res){
				if (res.result == 'OK') {
					setTimeout(function(){
						mobiscroll.toast({message:'정상적으로 요청되었습니다', color:'info'});
					}, 2000);					
				} else {
					mobiscroll.toast({message:'처리 중 오류가 발생했습니다', color:'danger'});
				}
			},
			error: function(){
				mobiscroll.toast({message:'처리 중 오류가 발생했습니다', color:'danger'});
			}
		});
	},	
	
	
	//통합검색 결과 그리는 함수
	"search_result_draw": function(keyWord){
		
		$.ajax({
			type: "GET",
			url: "./resource/data/search_res_data.txt",
			dataType: "json",
			success: function(data){
				
				//url에 검색키워드 파라미터 붙이기
				/*history.pushState(null, null, location.href + "search?keyword=" + keyWord);*/
				
				$("#search_res_box").remove();
				
				$("#search_layer").hide(); // 통합검색 레이어 숨김
				$("#input_search").val(""); // 검색어 입력창 비우기
				
				console.log(">>>>>>>검색키워드: " + keyWord);
					
				var html = '';
				
				html += `
					<div id='search_res_box'>
						<div class='inner'>
							<div id='search_res_area'>
								<div class='search_res_area_inner'>
								<button type='button' id='btn_ai_sidebar_toggle'><span class='arrow_img'></span></button>
								<div class='res_content_container_wrap'>
									<div id='search_res_input_wrap'>
										<div id='res_box_inputBox' class='search_box'>
											<select name="search_selectmenu" id="res_box_selectmenu">
											  <option>통합검색</option>
											  <option>제목</option>
											  <option>제목+내용</option>
											</select>
											<input type='text' id='input_res_box_search' class='search_input' placeholder='검색어를 입력해주세요'></input>
											<div class='btn_wrap'>
												<button type='button' class='mic_search_btn'></button>
												<button type='button' id='btn_res_box_search' class='search_btn'><span>검색</span></button>
											</div>
										</div>
									</div>
									
									
										<div id='res_content_container'>
											<div class='search_res_length_box'>
												<span class='search_img'></span><div class='search_res_length_txt'><strong class='search_keyword'>${keyWord}</strong>에 대한 <strong class='search_res_length'>${data.length}</strong>건의 검색결과가 있습니다.</div>
											</div>
										
										<div class='res_content_wrap'>	
											<div id='res_category_ul'>
												<li class='res_category active'><span>전체(23)</span></li>
												<li class='res_category'><span>직원(15)</span></li>
												<li class='res_category'><span>게시판(13)</span></li>
												<span class="indicator_bar"></span>
											</div>
											
											<div id='emp_res_wrap' class='result_wrap'>
												
												<div class='res_title_box'>
													<div class='res_title_wrap'>
														<h4 class='res_title'>직원</h4>
														<span class='res_length'>15</span>
													</div>
													<button type='button' class='btn_more'><span class='more_img'></span><span>더보기</span></button>
												</div>
												
												<div id='emp_card_box'>
													<!-- emp_card -->
													<div class='emp_card'>
														<div class='card_top_btn_wrap'>
															<button type='button' class='btn_emp_card_bookmark active'></button>
															<button type='button' class='btn_emp_card_more'></button>
														</div>
														<div class='emp_card_inner'>
															<div class='emp_card_profile'>
																<div class='emp_img' style='background-image: url(./resource/images/emp05_img.jpg)'></div>
																<div class='emp_info'>
																	<div class='emp_name_wrap'>
																		<span class='emp_name'>김가영</span><span class='emp_duty'>과장</span>
																	</div>
																	<span class='emp_dept'>경영지원팀</span>
																</div>
															</div>
															<div class='card_btn_wrap'>
																<div class='card_btn_box'><button type='button' class='card_btn call'><span class='btn_img'></span></button><span>통화</span></div>
																<div class='card_btn_box'><button type='button' class='card_btn chat'><span class='btn_img'></span></button><span>채팅</span></div>
																<div class='card_btn_box'><button type='button' class='card_btn mail'><span class='btn_img'></span></button><span>메일</span></div>
															</div>
														</div>
													</div>
													<div class='emp_card'>
														<div class='card_top_btn_wrap'>
															<button type='button' class='btn_emp_card_bookmark'></button>
															<button type='button' class='btn_emp_card_more'></button>
														</div>
														<div class='emp_card_inner'>
															<div class='emp_card_profile'>
																<div class='emp_img' style='background-image: url(./resource/images/emp02_img.jpg)'></div>
																<div class='emp_info'>
																	<div class='emp_name_wrap'>
																		<span class='emp_name'>김민규</span><span class='emp_duty'>과장</span>
																	</div>
																	<span class='emp_dept'>경영지원팀</span>
																</div>
															</div>
															<div class='card_btn_wrap'>
																<div class='card_btn_box'><button type='button' class='card_btn call'><span class='btn_img'></span></button><span>통화</span></div>
																<div class='card_btn_box'><button type='button' class='card_btn chat'><span class='btn_img'></span></button><span>채팅</span></div>
																<div class='card_btn_box'><button type='button' class='card_btn mail'><span class='btn_img'></span></button><span>메일</span></div>
															</div>
														</div>
													</div>
													<div class='emp_card'>
														<div class='card_top_btn_wrap'>
															<button type='button' class='btn_emp_card_bookmark'></button>
															<button type='button' class='btn_emp_card_more'></button>
														</div>
														<div class='emp_card_inner'>
															<div class='emp_card_profile'>
																<div class='emp_img' style='background-image: url(./resource/images/emp01_img.jpg)'></div>
																<div class='emp_info'>
																	<div class='emp_name_wrap'>
																		<span class='emp_name'>김소영</span><span class='emp_duty'>과장</span>
																	</div>
																	<span class='emp_dept'>부서</span>
																</div>
															</div>
															<div class='card_btn_wrap'>
																<div class='card_btn_box'><button type='button' class='card_btn call'><span class='btn_img'></span></button><span>통화</span></div>
																<div class='card_btn_box'><button type='button' class='card_btn chat'><span class='btn_img'></span></button><span>채팅</span></div>
																<div class='card_btn_box'><button type='button' class='card_btn mail'><span class='btn_img'></span></button><span>메일</span></div>
															</div>
														</div>
													</div>
													<div class='emp_card'>
														<div class='card_top_btn_wrap'>
															<button type='button' class='btn_emp_card_bookmark'></button>
															<button type='button' class='btn_emp_card_more'></button>
														</div>
														<div class='emp_card_inner'>
															<div class='emp_card_profile'>
																<div class='emp_img' style='background-image: url(./resource/images/emp03_img.jpg)'></div>
																<div class='emp_info'>
																	<div class='emp_name_wrap'>
																		<span class='emp_name'>김하나</span><span class='emp_duty'>사원</span>
																	</div>
																	<span class='emp_dept'>경영지원팀</span>
																</div>
															</div>
															<div class='card_btn_wrap'>
																<div class='card_btn_box'><button type='button' class='card_btn call'><span class='btn_img'></span></button><span>통화</span></div>
																<div class='card_btn_box'><button type='button' class='card_btn chat'><span class='btn_img'></span></button><span>채팅</span></div>
																<div class='card_btn_box'><button type='button' class='card_btn mail'><span class='btn_img'></span></button><span>메일</span></div>
															</div>
														</div>
													</div>
													<!-- emp_card -->
													
												</div>
												
												
											</div>
											
											<div id='board_res_wrap' class='result_wrap'>
												<div class='res_title_box'>
													<div class='res_title_wrap'>
														<h4 class='res_title'>게시판</h4>
														<span class='res_length'>13</span>
													</div>
													<button type='button' class='btn_more'><span class='more_img'></span><span>더보기</span></button>
												</div>
												
												<div id='board_res_post_ul'>
												
													<div class='post_li'>
														<div class='post_li_inner'>
															<div class='post_top_wrap'>
																<div class='post_top_category_wrap'>
																	<div class='post_category'>공지</div>
																	<div class='post_date'>2024년 5월 10일</div>
																</div>
																<button type='button' class='btn_more'></button>
															</div>
															<div class='post_info_wrap'>
																<h4 class='post_title'>인사발령 제 2024-8호</h4>
																<div class='post_desc'>경영지원팀에서 아래와 같이 인사발령을 공지합니다. 1. 시행일자 : 2024년 5월 13일부</div>
															</div>
														</div>
													</div>
													
													<div class='post_li'>
														<div class='post_li_inner'>
															<div class='post_top_wrap'>
																<div class='post_top_category_wrap'>
																	<div class='post_category'>공지</div>
																	<div class='post_date'>2022년 4월 12일</div>
																</div>
																<button type='button' class='btn_more'></button>
															</div>
															<div class='post_info_wrap'>
																<h4 class='post_title'>5월 가정의 달 이벤트</h4>
																<div class='post_desc'>어느덧 4월이 지나고 5월 가정의 달이 돌아왔습니다. 5월에는 어린이날과  어버이날, 스승의날까지 행사가 많은 달인데요! 여러분은 주변 사람에게 사랑의 표현을 잘 하고...</div>
															</div>
														</div>
													</div>
													<div class='post_li'>
														<div class='post_li_inner'>
															<div class='post_top_wrap'>
																<div class='post_top_category_wrap'>
																	<div class='post_category'>매뉴얼</div>
																	<div class='post_date'>2022년 4월 12일</div>
																</div>
																<button type='button' class='btn_more'></button>
															</div>
															<div class='post_info_wrap'>
																<h4 class='post_title'>[경영지원] 회의실 대여 관련의 건</h4>
																<div class='post_desc'>안녕하세요. 경영지원팀입니다. 회의실 대여 관련 안내 드립니다. </div>
															</div>
														</div>
													</div>
													<div class='post_li'>
														<div class='post_li_inner'>
															<div class='post_top_wrap'>
																<div class='post_top_category_wrap'>
																	<div class='post_category'>공지</div>
																	<div class='post_date'>2024년 5월 10일</div>
																</div>
																<button type='button' class='btn_more'></button>
															</div>
															<div class='post_info_wrap'>
																<h4 class='post_title'>인사발령 제 2024-8호</h4>
																<div class='post_desc'>경영지원팀에서 아래와 같이 인사발령을 공지합니다. 1. 시행일자 : 2024년 5월 13일부</div>
															</div>
														</div>
													</div>
													
													<div class='post_li'>
														<div class='post_li_inner'>
															<div class='post_top_wrap'>
																<div class='post_top_category_wrap'>
																	<div class='post_category'>공지</div>
																	<div class='post_date'>2022년 4월 12일</div>
																</div>
																<button type='button' class='btn_more'></button>
															</div>
															<div class='post_info_wrap'>
																<h4 class='post_title'>5월 가정의 달 이벤트</h4>
																<div class='post_desc'>어느덧 4월이 지나고 5월 가정의 달이 돌아왔습니다. 5월에는 어린이날과  어버이날, 스승의날까지 행사가 많은 달인데요! 여러분은 주변 사람에게 사랑의 표현을 잘 하고...</div>
															</div>
														</div>
													</div>
													<div class='post_li'>
														<div class='post_li_inner'>
															<div class='post_top_wrap'>
																<div class='post_top_category_wrap'>
																	<div class='post_category'>매뉴얼</div>
																	<div class='post_date'>2022년 4월 12일</div>
																</div>
																<button type='button' class='btn_more'></button>
															</div>
															<div class='post_info_wrap'>
																<h4 class='post_title'>[경영지원] 회의실 대여 관련의 건</h4>
																<div class='post_desc'>안녕하세요. 경영지원팀입니다. 회의실 대여 관련 안내 드립니다. </div>
															</div>
														</div>
													</div>
													
												</div>
												
											</div>
										
										</div> <!-- res_content_wrap -->
										
									</div>
										
									</div>
									
								</div>
							</div>
							<!-- ai_사이드 바 -->
							<div id='ai_sidebar'>
								<div class='box_top'>
									<div class='ai_info_wrap'>
										<div class='ai_img'></div>
										<div class='ai_info_txt'><span class='user_name'>홍길동</span>님!
											<strong>경영지원</strong> 관련하여 문서를 작성할 수 있습니다.
											아래버튼을 눌러 확인해주세요!</div>
									</div>
									<div class='ai_req_btn_wrap'>
										<button type='button' class='ai_req_btn'><div class='ai_req_btn_txt_wrap'><span class='chk_img'></span><span>경비청구/지불요청서</span></div><span class='arrow_right_blue'></span></button>
										<button type='button' class='ai_req_btn'><div class='ai_req_btn_txt_wrap'><span class='chk_img'></span><span>경조금 지급 신청서</span></div><span class='arrow_right_blue'></span></button>	
									</div>
								</div>
								
								<div class='box_mid'>
									<div id='ai_qna_box'>
										<!-- 질문 -->
										<div class='qna_box user_que_box'>
											<div class='user_que_txt'>연차 신청해줘</div>
										</div>
										<!-- 답변 -->
										<div class='qna_box ai_answer_box'>
											<div class='ai_answer_txt'>알겠습니다. 휴가 등록 방법은 아래와 같습니다.
											제가 사용자님의 정보를 활용하여 <strong>연차 휴가를 등록</strong>해 드리겠습니다.
											아래 '<strong>휴가 등록하기</strong>'버튼을 클릭해주세요.
											
											<strong>홍길동</strong>님 연차 정보: 잔여 연차 <strong>15</strong>개 (총 20개)
											</div>
											<button type='button' class='btn_regist_holidays'><span>휴가 등록하기</span></button>
										</div>
										<!-- 질문 -->
										<div class='qna_box user_que_box'>
											<div class='user_que_txt'>오후 반차로 신청할거야</div>
										</div>
										<!-- 답변 -->
										<div class='qna_box ai_answer_box'>
											<div class='ai_answer_txt'>알겠습니다. <strong>오후 반차로 등록</strong>해 드리겠습니다.
											아래 '<strong>휴가 등록하기</strong>'버튼을 클릭해주세요.
											
											<strong>홍길동</strong>님 연차 정보: 잔여 연차 <strong>15</strong>개 (총 20개)
											</div>
											<button type='button' class='btn_regist_holidays'><span>휴가 등록하기</span></button>
										</div>
									</div>
								</div>
								
								<div class='box_bot'>
									<div class='que_textarea_wrap'>
										<textarea class='ai_que_textarea' placeholder='더 필요하신 게 있으신가요?'></textarea>
										<button type='button' class='btn_send_que'><span>보내기</span></button>
									</div>
								</div>
							</div>
							
						</div>
					</div>
				`;
		
				$("#area_content").append(html);
				
				$("#res_box_selectmenu").selectmenu();
			
				$("#btn_ai_sidebar_toggle").on("click", function(){
					$("#search_res_box").toggleClass("expand");
				});
				
				console.log(">>>>>>>>>>>>검색결과 로드 성공");
			},
			error: function(xhr, error){
				console.log(error);
			}
		});
		
		
	}
	

}