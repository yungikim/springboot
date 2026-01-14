/* jshint esversion : 6 */

//TO DO 그리는 함수 : todo_work_list_draw

$(document).keyup(function(e) {
    if (e.keyCode === 27) {
		if ($("#btn_all_menu_layer_close").length == 1){
			$("#btn_all_menu_layer_close").click();
		}
    }
});

function gcommon(){
	_this = this;
	_this.gptserver = 'https://kgpt.kmslab.com:' + (gap.isDev ? "5100" : "5005");	
	_this.topsearch_totalcount = 0;
	_this.topsearch_curcount = 0;
	_this.searchcnt = 1;
	_this.perpage = "30";
	_this.select_search_type = "";
	_this.manual_folder_id = "";	
	_this.curtab = 1;
	_this.temp_status_list = new Object();		
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
	_this.color_work = '#fdf5d9';
	_this.color_private = '#ffeae7';
	_this.calendar = null;
	_this.check_session_interval;
	_this.dummy_email = "dummy@dummy.com";
}

gcommon.prototype = {
	
	"init": function(){
		
		gcom.set_lang();
	
		call_key = "";
		gcom.load_menu();
	    //gcom.login_data_load();
	    gcom.area_right_draw("init");
	    gcom.event_bind();
	    gcom.portal_setting();

		// 주간보고 미작성 체크
		gcom.check_job_report();
		
		// 세션 체크
		gcom.check_session_interval = setInterval(gcom.check_auto_logout, 3600000);	// 1시간마다 실행
	//	gcom.check_session_interval = setInterval(gcom.check_auto_logout, 60000);	// 1분마다 실행	
	},
	
	"load_menu" : function(){
		gcom.menu_data_load();
	},
	
	"load_sub_start" : function(menu){
		//브라우저 URL로 메뉴 바로가기 할때 사용함
		gcom.set_lang();
		gcom.menu_data_load(menu);
		//로그인 데이터를 불러온다.
		gcom.login_data_load();
		gcom.event_bind();
	},
	
	"chat_init" : function(){	
		gcom.set_lang();
		gap.cur_window = "chat";
		setTimeout(function(){
			gap.LoadPage("area_content", root_path + "/page/chat.jsp"); 
		}, 300)
	},
	
	"channel_init" : function(){		
		gcom.set_lang();
		gap.cur_window = "channel";
		setTimeout(function(){
			gap.LoadPage("area_content", root_path + "/page/channel.jsp"); 
		}, 300)
	},	
	
	"portal_setting" : function(){
		//포털 시작할 때 세팅되어야 하는 정보
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
					gcom.delete_cookie_all("LtpaToken");
					gcom.delete_cookie_all("JSESSIONID");
					gcom.delete_cookie_all("userid");		
					gcom.delete_cookie_all("companycode");
					gcom.delete_cookie_all("language");			
					
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
		document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=kmslab.com';
	},
	
	"delete_cookie_all" : function(name){
		// 현재 도메인
	    var domain = window.location.hostname;
	    var domainParts = domain.split('.');
	    var domains = [domain];
	
	    // 상위 도메인까지도 시도
	    if (domainParts.length > 2) {
	        domains.push(domainParts.slice(-2).join('.'));
	    }
	
	    // 자주 쓰는 path들
	    var paths = ['/', window.location.pathname];
	
	    domains.forEach(function(d) {
	        paths.forEach(function(p) {
	            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=' + p + '; domain=' + d + ';';
	        });
	    });
	
	    // path와 domain 없이도 한 번 더 시도
	    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
	    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
	},
	
	"check_auto_logout" : function(){
		console.log("======================================================")
		console.log("★★★★★ 도미노 세션 체크 >>>>>", moment().format('YYYY-MM-DD HH:mm'))
		console.log("======================================================")
		var check_url = gap.rp + "/kwa01/sso.nsf/check.txt?open&ver="+new Date().getTime();
		$.ajax({
			type : "GET",
			url : check_url,
			xhrFields : {
				withCredentials : true
			},			
			success : function(res){
				if (res == "OK"){
				}else{
					// 세션이 끝났을 때 K-Portal ONE 로그아웃
					clearInterval(gcom.check_session_interval);
					gcom.logout();
				}
			},
			error : function(e){
			//	gap.error_alert();
			}
		});
	},
	
	"check_job_report" : function(){
		var surl = location.protocol + "//" + window.mailserver + "/info/jobreport.nsf/checkJobReport?OpenForm";
		var postData = {
				"__Click" : "0",
				"%%PostCharset" : "UTF-8",
				"SaveOptions" : "0"
			};		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			xhrFields : {
				withCredentials : true
			},	
			success : function(__res){
				var res = __res;
				if (res.success){
					if (res.msg != ""){
						gap.gAlert(gap.textToHtml(res.msg));	
					}
				}else{
					// do nothing...
				}
			},
			error : function(e){
				//mobiscroll.toast({message:'처리 중 오류가 발생했습니다.', color:'danger'});
				//return false;
			}
		});		
		
	},
	
	//전체메뉴 호출 & 그리기
	"all_menu_data_load": function(){
		var surl = root_path + "/appstore_list.km";
		var postData = {
				"start" : "0",
				"perpage" : "100",
				"query" : "",
				"admin" : "",
				"type" : "menu"
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
							var _menu = "";
							_menu += "<li id='" + this.code + "' class='menu_li'>";
							_menu += "<span>" + this.menu_kr + "</span>";
							if (this.link != "-function-"){
								_menu += "<button type='button' class='btn_open_win'></button>";
							}
							_menu += "</li>";
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
							var _menu = "";
							_menu += "<li id='" + this.code + "' class='menu_li'>";
							_menu += "<span>" + this.menu_kr + "</span>";
							if (this.link != "-function-"){
								_menu += "<button type='button' class='btn_open_win'></button>";
							}
							_menu += "</li>";
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
						
						//왼쪽 상단 로고 최상단으로 올리는 class 추가
						$("#main_logo").addClass("active");
						
						$.each(cowork, function(){
							var _menu = "";
							_menu += "<li id='" + this.code + "' class='menu_li'>";
							_menu += "<span>" + this.menu_kr + "</span>";
							if (this.link != "-function-"){
								_menu += "<button type='button' class='btn_open_win'></button>";
							}
							_menu += "</li>";
							$("#" + cowork[0].category_code).append(_menu);
							$("#" + this.code).data("link", this.link);
						});						
					}					
					
					//전체메뉴 레이어 닫기
					$("#btn_all_menu_layer_close").on("click", function(){
						$("#all_menu_layer").fadeOut(200);
						$("#all_menu_layer").empty();
						
						//왼쪽 상단 로고 최상단으로 올리는 class 제거
						$("#main_logo").removeClass("active");
						$("#btn_all_menu_open").removeClass("close_btn");
					});
					
					//메뉴 클릭
					$("#all_menu_layer li").on("click", function(){
						if ($(this).data("link") != "" && $(this).data("link") != "-function-"){
							window.open($(this).data("link"));
						}else{
							// URL이 없고 함수로 호출하는 경우
							var _id = $(this).attr("id");
							if (_id == "KP_KGPT"){
								$("#btn_menu_portal").click();
								
							}else if (_id == "KP_COLLECTION"){
								$("#btn_menu_gathering").click();
								
							}else if (_id == "KP_COLLECTION"){
								$("#btn_menu_gathering").click();
								
							}else if (_id == "KP_CHANNEL"){
								$("#btn_menu_work").click();
								
							}else if (_id == "KP_TODO"){
								$("#btn_menu_work").click();
								
							}else if (_id == "KP_FILES"){
								$("#btn_menu_folder").click();
								
							}else if (_id == "KP_MEET_RESERVATIONS"){
								$("#btn_menu_meeting").click();
								
							}else if (_id == "KP_CHAT"){
								$("#btn_menu_chat").click();								
							}							
							$("#all_menu_layer").fadeOut(500);							
							$("#all_menu_layer").empty();
							
							//왼쪽 상단 로고 최상단으로 올리는 class 제거
							$("#main_logo").removeClass("active");
							$("#btn_all_menu_open").removeClass("close_btn");							
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
	"menu_data_load": function(menu){
		$.ajax({
			type: "GET",
			url: root_path + "/resource/data/menu_data.txt",
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
				
				var left_menu = $("#area_left .menu_wrap");
				
				/// true면 현재 스크롤이 있는 상태
				var scroll_chk = gcom.check_hasScroll(left_menu);
				
				if(scroll_chk){
					gcom.draw_left_menu_scroll_btn();
				}
				
				$(window).on("resize", function(){
					if(gcom.check_hasScroll(left_menu)){
						gcom.draw_left_menu_scroll_btn();
					} else {
						gcom.remove_left_menu_scroll_btn();
					}
				});

				/// 개발용 files 메뉴
				var cid = gap.userinfo.rinfo.ky;
				if (cid == "KM0035" || cid == "KM0099"){
					var html = "<button type='button' class='btn btn_left_menu' id='btn_menu_folder_new' style='border-color: blue;'><span class='menu_img' style='background-image:url(../resource/images/menu_folder.svg)'></span><span class='menu_name_wrap'><span class='menu_name'>파일(개발용)</span></span></button>";
					//$("#btn_menu_folder").before(html);
				}
				
				$("#btn_menu_folder_new").on("click", function(){
					gap.LoadPage("area_content", root_path + "/page/files_new.jsp");
				});
				
				
				//하단 메뉴
				$("#area_left .menu_bot").append(bot_menu);
				
				/*** 알림 카운트 UI ***/
				var noti = "";
				noti += "<span class='noti_count_wrap'>";
				noti += "	<span class='noti_count'>99+</span>";
				noti += "</span>";
			//	$("#btn_notification").append(noti);
			//	$("#btn_menu_chat").append(noti);
				
				//// 1자리 수 일 떄
				$(".noti_count_wrap").css({
					"right" : "-2px"
				});
				//// 2자리 수 일 떄
				$(".noti_count_wrap").css({
					"right" : "-7px"
				});
				//// 99건 넘을 때
				$(".noti_count_wrap").css({
					"right" : "-14px"
				});
				/*** 알림 카운트 UI ***/
				
				//console.log(">>>>>>>메뉴 데이터 로드 성공");
				
				setTimeout(function(){				
					if (menu == "channel"){
						$("#btn_menu_work").click();
					}else if (menu == "chat"){
						$("#btn_menu_chat").click();
					}else if (menu == "files"){
						$("#btn_menu_folder").click();
					}else if (menu == "meeting"){
						$("#btn_menu_meeting").click();
					}else if (menu == "org"){
						$("#btn_menu_tree").click();
					}else if (menu == "collect"){
						$("#btn_menu_gathering").click();
					}else if (menu == "kgpt"){
						$("#btn_menu_portal").click();
					}
				}, 500);
				
				
				
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
					gap.history_save("portal");
				});
				
				//업무방
				$("#btn_menu_work").on("click", function(e){					
					gap.cur_window = "channel";
					gap.LoadPage("area_content", root_path + "/page/channel.jsp");					
					gap.history_save("channel");
				});
				
				//채팅
				$("#btn_menu_chat").on("click", function(e){
					gap.cur_window = "chat"
					gap.LoadPage("area_content", root_path + "/page/chat.jsp"); 					
					gap.history_save("chat");
				});
				
				//AI Portal
				$("#btn_menu_portal").on("click", function(){
					gap.cur_window = "kgpt"	
					gap.LoadPage("area_content", root_path + "/page/kgpt.jsp");
					gap.history_save("kgpt");
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
					gap.cur_window = "collect";
					gap.history_save("collect");
				});
				
				// 조직도
				$("#btn_menu_tree").on("click", function(){
					gap.LoadPage("area_content", root_path + "/page/organ.jsp");
					gap.cur_window = "org";
					gap.history_save("org");
				});				
				
				//Files
				$("#btn_menu_folder").on("click", function(e){
					gap.LoadPage("area_content", root_path + "/page/files.jsp");
					gap.cur_window = "drive";
					gap.history_save("files");
				});
				
				// 회의예약
				$("#btn_menu_meeting").on("click", function(){
					gap.LoadPage("area_content", root_path + "/page/meeting.jsp");
					gap.cur_window = "meeting";
					gap.history_save("meeting");
				});
				
				//help 메뉴
				$("#btn_menu_help").on("click", function(){
					gcom.manual_layer_draw();
				});				
				
				//메뉴 클릭 이벤트(공통);
				$(".btn_left_menu").on("click", function(){
					var ele = $(this);
					var check_url = gap.rp + "/kwa01/sso.nsf/check.txt?open&ver="+new Date().getTime();
					$.ajax({
						type : "GET",
						url : check_url,
						xhrFields : {
							withCredentials : true
						},
						success : function(res){
							if (res == "OK"){
								ele.siblings().removeClass("active");
								ele.addClass("active");	
								$("#right_menu").hide();
								$("#btn_notification").removeClass("active");
								
								// 알림센터가 떠있으면 제거한다 /////////////////////////////////////
								$("#alarm_center_layer").fadeOut(function(){
									$("#alarm_center_layer").empty();
								});
								//////////////////////////////////////////////////////////////
								
								// 포틀릿 일정 초기화
								if (typeof(gport) != "undefined"){
									gport.sidecal = null;
								}								
							}else{
								// 세션이 끝났을 때 K-Portal ONE 로그아웃
								gcom.logout();
							}
						},
						error : function(e){
						}
					});
				});
				
				gBody.unread_mail_count_check();
				gBody.unread_collec_count_check();
				//gMet.setTodayMeetingCount();
				gBody.unread_channel_count_check();				
				
			},
			error: function(xhr, error){
				console.log(error);
			}
		});
	},
	
	//매뉴얼 레이어 그리는 함수
	"manual_layer_draw": function(){
		
		var html = '';
		
		var inx = parseInt(gap.maxZindex()) + 1;
		
		/// 최상단으로 끌어올린다. (업무방, 채팅 메뉴에서 help 열었을 때 가려지는 문제)
		$("#dark_layer").css("zIndex", inx);
		$("#dark_layer").fadeIn(200);
		
		html += "<div id='manual_layer'>";
		
		html += "	<div class='layer_top'>";
		html += "		<div class='layer_top_left'>";
		html += "			<div class='tab_box'>";
		html += "				<li class='tab_li'>K-Portal Manual</li>";
		html += "			</div>"; //tab_box
		html += "			<div class='indicatior_bar'></div>"; //탭 밑줄
		html += "		</div>"; // layer_top_left
		html += "		<div class='layer_top_right'>";
		html += "			<div class='search_box'>";
		//검색박스
		html += "				<input type='text' id='input_manual_search' class='manual_search_input' placeholder='"+gap.lang.va165+"'><button type='button' id='btn_manual_search' class='btn_manual_search'><span>"+gap.lang.search+"</span></button>";
		html += "			</div>"; //search_box
		html += "			<button type='button' id='btn_manual_layer_close' class='btn_manual_layer_close'><span class='btn_img'></span></button>";
		html += "		</div>"; // layer_top_right
		html += "	</div>"; //layer_top
		
		//콘텐츠 영역
		html += "	<div id='manual_content' class='layer_content'>";
		
		html += "		<div class='content_box content_left_box'>";
		html += "			<div class='content_title_wrap'><h4 class='content_title_txt'>Manual Folder</h4><button type='button' class='btn_folder_registration'><span>Folder Registration</span></button></div>";
		html += "			<div id='manual_folder_box' class='content_item_box'>";
		
		var folder_length = 12;
		var folder_arr = [
			"메인", "업무방(Work)/채팅(Chat)", "조직도(Org)", "메일(Mail)", "일정관리(Cal)",
			"회의예약(Meet)", "취합(Gather)", "Files", "K-Portal 자동로그인",
			"모바일", "기타", "모바일 기기 일정 연동"
		]
		for(var i = 0; i < folder_length; i++){
			if(i === 5){
				html += "		<div class='folder_item open'><span class='folder_name'>" + (i+1) + ". " + folder_arr[i] + "</span></div>";
			} else {
				html += "		<div class='folder_item'><span class='folder_name'>" + (i+1) + ". " + folder_arr[i] + "</span></div>";
			}
		}
		
		html += "			</div>";
		html += "		</div>";
		
		html += "		<div class='content_box content_right_box'>";
		html += "			<div class='content_title_wrap'><h4 class='content_title_txt'>Manual Files</h4><button type='button' class='btn_file_registration'><span>File Registration</span></button></div>";
		
		html += "			<div id='manual_file_box' class='content_item_box'>";
		
		html += "				<div class='file_item'>";
		html += "					<div class='file_name'>6. K-Portal Meet (회의예약) Web.pdf</div>";
		html += "					<div class='btn_wrap'>";
		html += "						<button type='button' class='file_btn view_file_btn'><span class='btn_img'></span></button>";
		html += "						<button type='button' class='file_btn download_file_btn'><span class='btn_img'></span></button>";
		html += "						<button type='button' class='file_btn del_file_btn'><span class='btn_img'></span></button>";
		html += "					</div>";
		html += "				</div>";
		html += "				<div class='file_item'>";
		html += "					<div class='file_name'>6. K-Portal Meet (회의예약) Mobile.pdf</div>";
		html += "					<div class='btn_wrap'>";
		html += "						<button type='button' class='file_btn view_file_btn'><span class='btn_img'></span></button>";
		html += "						<button type='button' class='file_btn download_file_btn'><span class='btn_img'></span></button>";
		html += "						<button type='button' class='file_btn del_file_btn'><span class='btn_img'></span></button>";
		html += "					</div>";
		html += "				</div>";
		
		html += "			</div>"; // manual_file_box		
		html += "		</div>";	// content_right_box		
		html += "	</div>";		
		html += "</div>";
		
		$("#dark_layer").append(html);
		$("#input_manual_search").focus();
		/*이벤트*/
		
		//검색버튼
		$("#btn_manual_search").on("click", function(){			
			var $val = $.trim($("#input_manual_search").val());
			
			if( $val.length === 0 ){
				alert(gap.lang.va165);
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
	
	/// 좌측 고정메뉴 스크롤 있을 때 스크롤 버튼 그리는 함수
	"draw_left_menu_scroll_btn" : function(){
		
		var scroll_box = $("#area_left .menu_wrap");

		var topbtn = "";
		var botbtn = "";
		
		topbtn += "<button type='button' id='left_menu_scrollup' class='scroll_btn scroll_to_top_btn'><span class='btn_ico'></span></button>";
		botbtn += "<button type='button' id='left_menu_scrolldown' class='scroll_btn scroll_to_bot_btn'><span class='btn_ico'></span></button>";
		
		$("#left_menu_scrollup").remove();
		$("#left_menu_scrolldown").remove();
		
		scroll_box.prepend(topbtn);
		scroll_box.append(botbtn);
		
		scroll_box.css({
			"padding" : "0px"
		});
		
		var scrollInterval;
		
		$('#left_menu_scrollup').on('mousedown', function () {
		  scrollInterval = setInterval(function () {
		    scroll_box.scrollTop(scroll_box.scrollTop() - 100);
		  }, 100);
		}).on('click', function () {
		    scroll_box.scrollTop(scroll_box.scrollTop() - 100);
		}).on('mouseup mouseleave', function () {
		  clearInterval(scrollInterval);
		});
		
		$('#left_menu_scrolldown').on('mousedown', function () {
		  scrollInterval = setInterval(function () {
		    scroll_box.scrollTop(scroll_box.scrollTop() + 100);
		  }, 100);
		}).on('click', function () {
		    scroll_box.scrollTop(scroll_box.scrollTop() + 100);
		}).on('mouseup mouseleave', function () {
		  clearInterval(scrollInterval);
		});
		
	},
	
	"remove_left_menu_scroll_btn" : function(){
		var scroll_box = $("#area_left .menu_wrap");
		
		scroll_box.css({
			"padding" : "24px 0 0"
		});
		
		$('#left_menu_scrollup').remove();
		$('#left_menu_scrolldown').remove();
	},
	
	"manual_search_layer_draw": function(val){
		
		var val = '<strong>"'+  val + '"</strong>';
		
		//검색 레이어
		var layer = '';
		
		layer += "<div id='manual_search_layer'>";
		layer += "	<div class='ai_answer_wrap'>";
		//답변 타이틀
		layer += "		<div class='ans_title_wrap'>";
		layer += "			<div class='ans_title'><div class='ai_img'></div><span class='ans_title_txt'>" + val + "에 대해 설명해드리겠습니다:</span></div>";
		layer += "			<button type='button' id='btn_manual_search_layer_close' class='btn_manual_search_layer_close'><span class='btn_img'></span></button>";
		layer += "		</div>"; //ans_title_wrap
		//답변 내용
		layer += "		<div class='ai_answer_box'>";
		layer += "			<div class='ans_detail_box'>";
		layer += "				<div class='ans_detail_wrap'>";
		layer += "					<div class='ans_detail_title'>조직도 추가하는 방법</div>";
		layer += "					<div class='ans_detail_txt'>";
		layer += "						<strong>1. 관리자 계정으로 로그인: </strong>관리자 권한이 필요합니다.<br>";
		layer += "						<strong>2. 조직 관리 메뉴로 이동: </strong>'설정' 또는 '관리자 도구'에서 '조직 관리' 선택<br>";
		layer += "						<strong>3. 조직도 추가/편집 선택: </strong>'조직도 추가' 또는 '편집' 클릭<br>";
		layer += "						<strong>4. 부서 및 직원 추가: </strong><br>";
		layer += "						<div class='ans_detail_ul'>";
		layer += "							<li class='ans_detail_li'>부서 추가: 부서 이름과 상위 부서 입력.</li>";
		layer += "							<li class='ans_detail_li'>직원 추가: 직원 이름, 직위, 소속 부서 입력.</li>";
		layer += "						</div>"; //ans_detail_ul
		layer += "						<strong>5. 저장 및 확인: </strong>관리자 권한이 필요합니다.<br>";
		layer += "					</div>"; //ans_detail_txt
		layer += "				</div>"; // ans_detail_wrap
		layer += "			</div>"; //ans_detail_box
		layer += "			<div class='ans_files_box'>";
		layer += "				<div class='ans_files_wrap'>";
		layer += "					<div class='ans_files_title'>관련 문서</div>";
		
		layer += "					<div id='ans_files_ul' class='ans_files_ul'>";
		layer += "						<div class='file_item'>";
		layer += "							<div class='file_name'>3. K-Portal 조직도 설정.pdf</div>";
		layer += "							<div class='btn_wrap'>";
		layer += "								<button type='button' class='file_btn view_file_btn'><span class='btn_img'></span></button>";
		layer += "								<button type='button' class='file_btn download_file_btn'><span class='btn_img'></span></button>";
		layer += "								<button type='button' class='file_btn del_file_btn'><span class='btn_img'></span></button>";
		layer += "							</div>";
		layer += "						</div>";
		layer += "					</div>";
		layer += "				</div>";
		layer += "			</div>";
		layer += "		</div>"; //ai_answer_box
		layer += "	</div>"; //ai_answer_wrap
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
	"todo_graph_draw": async function(graphType, work_category){

		var ctx = $("#todo_graph");
		
		var data_arr = [];
		
		var graph_txt = "";
		
		//그래프 텍스트
		var ty = "me";
		if(graphType === "mine"){
			graph_txt = gap.lang.ingwork;
		}
		if(graphType === "others"){
			ty = "you";
			graph_txt = gap.lang.ingwork2;	
		}
		
		var url = root_path + "/my_space_portal.km";
		var rr = await $.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			data : JSON.stringify({
				type : ty
			}),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					return res;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});			
		
		gap.work_info = rr.data.data;
		var wait_count = 0;
		var process_count = 0;
		var delay_count = 0;
		
		for (var i = 0; i < rr.data.data.length; i++){
			var item = rr.data.data[i];
			
			if (item.enddate){
				var dateToCheck = moment(item.enddate);
				hasPassed = moment().isAfter(dateToCheck);
			//	console.log(hasPassed);
				if (hasPassed){
					delay_count++;
				}else{
					if (item.status == "1"){
						wait_count++;
					}else if (item.status == "2"){
						process_count++;
					}
				}
			}else{
				if (item.status == "1"){
					wait_count++;
				}else if (item.status == "2"){
					process_count++;
				}
			}		
		}
		
		data_arr.push(wait_count);
		data_arr.push(process_count);
		data_arr.push(delay_count);
		
	//	console.log("wait_count : " + wait_count);
	//	console.log("process_count : " + process_count);
	//	console.log("delay_count : " + delay_count);
	//	console.log(gap.work_info);
		
		/*
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
		*/
		
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
		
		if (ctx.length == 0){
			return false;
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
		var _self = this;
		var surl = root_path + "/todo_list.km";
		var postData = {
			"ky" : gap.userinfo.rinfo.ky
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
			//	console.log("res >>>", res);
				if (res.result == "OK"){
					var data = res.data.response;
					var html = "";
					// 오늘 할 일 입력창
					html += "<div id='todo_input_wrap'>";
					html += "<div class='todo_input_box'><input type='text' id='reg_todo_title' class='todo_input' placeholder='" + gap.lang.reg_todo_today + "'></div><button type='button' id='btn_todo_reg' class='btn_todo_regist'><span>" + gap.lang.registration + "</span></button>";
					html += "</div>";					
					html += "<div id='todo_list_ul'>";
					
					for(var i = 0; i < data.length; i++){
						var info = data[i];
						var todo_obj = new Object();
						todo_obj.key = info._id.$oid;
						todo_obj.title = info.title;
						
						html += _self.draw_todo_list_today(todo_obj);
					}
					html += "</div>";
					
					$("#todo_list_wrap .box_content").append(html);
					
					// 이벤트 처리
					// 완료 체크
					_self.todo_complete_event();
					
					// 입력창 엔터
					$("#reg_todo_title").on("keypress", function(e){
						if(e.keyCode === 13){
							$("#btn_todo_reg").click();
						}
					});
					
					
					// 등록
					$("#btn_todo_reg").off().on("click", function(){
						var _title = $.trim($('#reg_todo_title').val());
						if (_title == '') {
							mobiscroll.toast({message:gap.lang.input_content, color:'danger'});
							$('#reg_todo_title').focus();
							return false;
						}
			
						var surl = root_path + "/todo_save.km";
						var postData = {
							"ky" : gap.userinfo.rinfo.ky,
							"title" : _title
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
								//console.log("res >>>", res);
								if (res.result == "OK"){
									var todo_obj = new Object();
									todo_obj.key = res.data.id;
									todo_obj.title = _title;
									
									$("#todo_list_ul").append(_self.draw_todo_list_today(todo_obj));
									$('#reg_todo_title').val("");
									
									// 완료 체크 이벤트
									_self.todo_complete_event();
								}
							},
							error : function(e){
								gap.gAlert(gap.lang.errormsg);
								return false;
							}
						});
					});
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},
	
	"todo_complete_event" : function(){
		var _self = this;

		// 완료 체크
		$(".todo_li_chkbox").off().on("change", function(){
			$(this).closest(".todo_li").toggleClass("checked");
			var _key = $(this).attr("id");
			
			// 완료처리
			var surl = root_path + "/todo_complete.km";
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
						$("#todo_li_" + _key).remove();
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});					
				
		});	
	},
	
	"draw_todo_list_today" : function(info){
		var _self = this;
		var _key = info.key;
		var _title = info.title;
		
		var _html = "<div class='todo_li' id='todo_li_" + _key + "' key='" + _key + "'><input type='checkbox' id='" + _key + "' value='' class='todo_li_chkbox'><label for='" + _key + "'></label>" + _title + "</div>";
		return _html;
	},
	
	//상단 로그인 데이터 불러오는 함수
	"login_data_load_old": function(view_type){
		
		$.ajax({
            type: "GET",
            url: root_path +  "/resource/data/" + (userlang == "ko" ? "login_data.txt" : "login_data_en.txt"),
            dataType: "json",
            success: function(data){
               
                //왼쪽영역 즐겨찾기 사원이미지 표시
                $(".user_name").text(data[0].user_data.name); // 현재 사용자의 이름 표시
                
				$("#area_top_status .user_img").css({   //상단영역 유저이미지 표시
                    "background-image": "url(" + data[0].user_data.img + ")"
                });
				
                var html = "";

                html += "<div id='user_content_wrap' class='personal_box'>";
				html +=	"	<div class='content_box'>";
				html +=	"		<div class='user_wrap'>";
                html += "			<div class='user_img' data-empno='" + data[0].user_data.empno + "' style='background-image: url(" + data[0].user_data.img + ")'></div>";
				html +=	"			<div class='user_info_wrap'>";
                html +=	"				<div class='user_dept'>" + data[0].user_data.dept + "</div>";
                html += "				<div class='user_name'>" + data[0].user_data.name + "</div>";
                html += "			</div>";
				html +=	"		</div>";
                html +=	"		<button type='button' class='btn_setting' id='btn_user_config'></button>";
                html +=	"	</div>";
              	html +=	"</div>";

            	html += "<div id='emp_bookmark' class='personal_box'>";
                html +=	"	<div class='title_wrap'>";
				html += "		<h4 class='title'>" + gap.lang.favorite + "</h4>";
				html += "		<button type='button' id='emp_folder' class='btn btn_fold open'></button>";
				html +=	"	</div>";
				html +=	"	<div class='box_content emp_img_wrap'></div>";
                html +=	"</div>";

                html += "</div>";
			
			if(view_type === "calendar"){
				$("#todo_work_area").find(".emp_item_wrap").append(html);
			}
			
//////////////// TO DO 그래프 /////////////

				html += "<div id='todo_graph_wrap' class='personal_box'>";
				html += "	<div class='title_wrap'>";
				html += "		<h4 class='title'>" + gap.lang.todo_graph + "</h4>";
				html += "		<button type='button' id='todo_graph_close' class='btn btn_fold open'></button>";
				html += "	</div>";
				html += "	<div class='box_content'>";
				html += "		<div class='todo_graph_tab_box'>";
				html += "			<li id='tab_todo_mine' class='todo_tab_li active'><span>" + gap.lang.ingwork + "</span></li>";
				html += "			<li id='tab_todo_others' class='todo_tab_li'><span>" + gap.lang.ingwork2 + "</span></li>";
				html += "		</div>";
				html += "		<canvas id='todo_graph'></canvas>";
				html += "		<div class='btn_wrap'>";
				html += "			<button type='button' id='btn_todo_work_all_view' class='btn_white'><span>" + gap.lang.expand + "</span></button>";
				html += "		</div>";
				html += "	</div>";
				html += "</div>";

///////////// TO DO 리스트 //////////////
				html += "<div id='todo_list_wrap' class='personal_box'>";
				html += "	<div class='title_wrap'>";
				html += "		<h4 class='title'>TO-DO LIST</h4>";
				html += "		<button type='button' class='btn btn_fold open'></button>";
				html += "	</div>";
				html += "	<div class='box_content'></div>";
				html += "</div>";
				
								
                var folder_title_html = "";
				
				folder_title_html += "<div id='folder_title_wrap' class='user_folder_title_wrap'>";
				folder_title_html += "	<button type='button' id='btn_folder_setting'><span class='setting_img'></span><span>" + gap.lang.main_settings + "</span></button>";
				folder_title_html += "</div>";

                $("#personal_area").append(html); //사용자 개인영역 안의 콘텐츠를 그린다
                
				$("#user_folder_content").prepend(folder_title_html);

				// 즐겨찾기 그리기
				gport.draw_favorite_info();
					
				$("#emp_folder").on("click", function(e){
					$("#emp_bookmark").removeClass("work_view");
					
					if($("#todo_work_area").hasClass("bookmark")){
						//레이어 닫기
						gcom.todo_work_area_close();
					}
					
				});
				
				//환경설정 버튼 클릭
				$("#btn_user_config").on("click", function(){
					gcom.show_user_config();
				});
				
				/*
                //왼쪽 영역 사용자영역 폴더 열고닫기
                $(".btn_fold").on("click", function(){
					
                    $(this).toggleClass("open");
                    $(this).parent().siblings(".box_content").toggle();
					
					if($("#todo_work_area").hasClass("graph")){
						// 레이어 테두리 css
						$("#personal_area .mask_top").css({
							"top" : $("#area_top").outerHeight(),
							"height": $("#todo_graph_wrap").position().top + 1
						});
						$("#personal_area .mask_bot").css({
							"top": $("#area_top").outerHeight() + $("#todo_graph_wrap").position().top + $("#todo_graph_wrap").outerHeight() - 1,
							"height": $("#todo_list_wrap").outerHeight() + parseInt($("#todo_list_wrap").css("padding")) * 2
						});
					}
					
                });
				*/
				
				//todo그래프 전체보기버튼
				$("#btn_todo_work_all_view").on("click", function(){
					$(this).addClass("disable");
					var ky = gap.userinfo.rinfo.ky;
					gcom.todo_work_layer_draw("list", ky);
				});
				
                //폴더 메인설정 버튼
                $("#btn_folder_setting").on("click", function(){
					$(".personal_box").hide();					
                    gport.folder_personalize();
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
						
						if($("#todo_work_area").hasClass("bookmark")){
							category = 'by_state';
						} else {							
							gcom.todo_work_list_draw(category);
						}
						
					} else {
						category = 'by_state';
					}
					
					gcom.todo_graph_draw(graph_type, category);
					
				});
				
				//초기값: 나에게 할당된 업무, 상태별 업무목록
				gcom.todo_graph_draw("mine", "by_state");
				gcom.todo_list_data_load();
				
				//console.log(">>>>>>>>로그인 데이터 로드 성공");
				
				
            },
            error: function(xhr, error){
                console.log(error);
            }
        });
			
	},
	
	//상단 로그인 데이터 불러오는 함수
	"login_data_load": function(view_type){
	
		//왼쪽영역 즐겨찾기 사원이미지 표시
		var user_info = gap.user_check(gap.userinfo.rinfo)
		$(".user_name").text(user_info.name); // 현재 사용자의 이름 표시
		$("#area_top_status .user_img").css({   //상단영역 유저이미지 표시
			"background-image": "url(" + user_info.user_img_url + "), url("+gap.none_img+")"
		});
		
		$("#area_top_status").addClass("active");

		var html = "";
		html += "<div id='user_content_wrap' class='personal_box'>";
		html +=	"	<div class='content_box'>";
		html +=	"		<div class='user_wrap'>";
		html += "			<div class='user_img' data-empno='" + user_info.emp + "' style='background-image: url(" + user_info.user_img_url + "), url("+gap.none_img+")'></div>";
		html +=	"			<div class='user_info_wrap'>";
		html +=	"				<div class='user_dept'>" + user_info.dept + "</div>";
		html += "				<div class='user_name'>" + user_info.name + "</div>";
		html += "			</div>";
		html +=	"		</div>";
		html +=	"		<button type='button' class='btn_setting' id='btn_user_config'></button>";
		html +=	"	</div>";
		html +=	"</div>";
		html += "<div id='emp_bookmark' class='personal_box'>";
		html +=	"	<div class='title_wrap'><h4 class='title'>" + gap.lang.favorite + "</h4><button type='button' id='emp_folder' class='btn btn_fold open'></button></div>";
		html +=	"	<div class='box_content emp_img_wrap' style='display:none;'></div>";
		html += "</div>";

		if(view_type === "calendar"){
			$("#todo_work_area").find(".emp_item_wrap").append(html);
		}
		
		html +=	"<!-- todo 그래프 -->";
		html +=	"<div id='todo_graph_wrap' class='personal_box'>";
		html +=	"	<div class='title_wrap'><h4 class='title'>" + gap.lang.todo_graph + "</h4><button type='button' id='todo_graph_close' class='btn btn_fold open'></button></div>";
		html +=	"	<div class='box_content'>";
		html +=	"		<div class='todo_graph_tab_box'>";
		html +=	"			<li id='tab_todo_mine' class='todo_tab_li active'><span>" + gap.lang.ingwork + "</span></li>";
		html +=	"			<li id='tab_todo_others' class='todo_tab_li'><span>" + gap.lang.ingwork2 + "</span></li>";
		html +=	"		</div>";
		html +=	"		<canvas id='todo_graph'></canvas>";
		html +=	"		<div class='btn_wrap'>";
		html +=	"			<button type='button' id='btn_todo_work_all_view' class='btn_white'><span>" + gap.lang.expand + "</span></button>";
		html +=	"		</div>";
		html +=	"	</div>";
		html +=	"</div>";
		html +=	"<!-- todo 리스트 -->";
		html +=	"<div id='todo_list_wrap' class='personal_box'>";
		html +=	"	<div class='title_wrap'><h4 class='title'>TO-DO LIST</h4><button type='button' class='btn btn_fold open'></button></div>";
		html +=	"	<div class='box_content'></div>";
		html +=	"</div>";

		var folder_title_html = "";
		folder_title_html += "<div id='folder_title_wrap' class='user_folder_title_wrap'>";
		folder_title_html += "<button type='button' id='btn_folder_setting'><span class='setting_img'></span><span>" + gap.lang.main_settings + "</span></button>";
		folder_title_html += "</div>";

		$("#personal_area").append(html); //사용자 개인영역 안의 콘텐츠를 그린다
		$("#user_folder_content").prepend(folder_title_html);
		
		// 즐겨찾기 그리기
		gport.draw_favorite_info();
		
		// 알림 카운트 처리
		gap.total_count_alarm();
		
		
		$("#emp_folder").on("click", function(e){
			$("#emp_bookmark").removeClass("work_view");
			
			if($("#todo_work_area").hasClass("bookmark")){
				//레이어 닫기
				gcom.todo_work_area_close();
			}
		});
		
		//환경설정 버튼 클릭
		$("#btn_user_config").on("click", function(){
			gcom.show_user_config();
		});
		
		//왼쪽 영역 사용자영역 폴더 열고닫기
		$(".btn_fold").on("click", function(){
			$(this).toggleClass("open");
			$(this).parent().siblings(".box_content").toggle();
			
			if($("#todo_work_area").hasClass("graph")){
				// 레이어 테두리 css
				/*
				$("#personal_area .mask_top").css({
					"top" : $("#area_top").outerHeight(),
					"height": $("#todo_graph_wrap").position().top + 1
				});
				$("#personal_area .mask_bot").css({
					"top": $("#area_top").outerHeight() + $("#todo_graph_wrap").position().top + $("#todo_graph_wrap").outerHeight() - 1,
					"height": $("#todo_list_wrap").outerHeight() + parseInt($("#todo_list_wrap").css("padding")) * 2
				});
				*/
				gcom.draw_personal_area_border("list");
			}
		});
				
		//todo그래프 전체보기버튼
		$("#btn_todo_work_all_view").on("click", function(){
			$(this).addClass("disable");
			var ky = gap.userinfo.rinfo.ky;
			gcom.todo_work_layer_draw("list", ky);
		});
		
		//폴더 메인설정 버튼
		$("#btn_folder_setting").on("click", function(){
			$(".personal_box").hide();
			gport.folder_personalize();
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
						
				if($("#todo_work_area").hasClass("bookmark")){
					category = 'by_state';
				} else {							
					gcom.todo_work_list_draw(category);
				}
			} else {
				category = 'by_state';
			}
			
			gcom.todo_graph_draw(graph_type, category);
		});
		
		//초기값: 나에게 할당된 업무, 상태별 업무목록
		gcom.todo_graph_draw("mine", "by_state");
		gcom.todo_list_data_load();
		
	},	
	
	////// 사원 이미지에 테두리 그리는 함수
	"emp_mask_draw": function(target, flag){
		//사원이미지 테두리
		var user_info = target.data("info");
		var html = "";
		
		html += "<div class='emp_mask'>";
		html +=   "<div class='emp_mask_inner'></div>";
		
		///나를 제외한 다른 사원의 이미지에만 삭제버튼 표시
		if(target.closest("#user_item_wrap").length === 0){
			html +=   "<button type='button' class='btn_del_bookmark_emp' style='display: none;'></button>";
		}
		
		html += "</div>";
		
		//테두리 없을때만 추가
		if(target.find(".emp_mask").length === 0){
			// 현재 마우스를 올린 사원이미지에 테두리를 그린다.
			target.find(".user_img").prepend(html);			
		}
		
		//즐겨찾기 사원 제거 버튼
		$(target).find(".btn_del_bookmark_emp").off().on("click", function(){
			target.closest($(".user_status_wrap")).remove();
			
			var surl = gap.channelserver + "/portal_favorite_delete.km";
			var postData = JSON.stringify({
				"ky" : gap.userinfo.rinfo.ky,
				"key" : user_info.ky
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
						// do nothing...
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});			
			
		});
	},
	
	"getUserEvent" : function(s_key, e_key, pass_status, inst){
		var _self = this;
				
		// 사용자에 따라 mailfile을 계산해줘야 함
		var mf = this.getUserMailPath();
		
		// 등록되고 체크된 전체 사용자의 데이터를 가져옴
		var url = location.protocol + '//' + window.mailserver + '/' + mf + '/CustomEventList?ReadViewEntries&count=9999&StartKey=' + s_key + '&UntilKey=' + e_key + '&KeyType=time&outputformat=json';
		
		_self.setMainCalEvent(url, inst);
		
/*		if (!pass_status) {
			if (_self.req_status) {
				_self.req_status.abort();
			}
			_self.req_status = _self.setUserStatus(s_key, e_key);
		}*/
	},
	
	"emp_schedule_data_load": function(calendar, empno){
		var _self = this;
		var dt = moment(calendar._selected);
		
		// 페이지가 전환되었다가 표시된 경우
		if (!dt) dt = new Date();
			
		// 오늘 날짜로 이동
		calendar.navigate(dt);

		// 신규로 데이터 불러오기
		var first_day = calendar._firstDay;
		var last_day = calendar.lastDay;
		var s_key = moment(first_day).add(-1, 'days').format('YYYYMMDD[T000000Z]');
		var e_key = moment(last_day).add(1, 'days').format('YYYYMMDD[T235959Z]');

		// 사용자에 따라 mailfile을 계산해줘야 함
		var mf = this.getUserMailPath();

		// 등록되고 체크된 전체 사용자의 데이터를 가져옴
		var url = location.protocol + '//' + window.mailserver + '/' + mf + '/CustomEventList?ReadViewEntries&count=9999&StartKey=' + s_key + '&UntilKey=' + e_key + '&KeyType=time&outputformat=json';
		
		this.setMainCalEvent(url, calendar);			
	},
	
	//메인에서 직원의 일정 확인하는 달력 그리는 함수
	"emp_schedule_cal_draw": function(dt, pass_status){
		var _self = this;		
		
		if (this.calendar) {
			// 페이지가 전환되었다가 표시된 경우
			if (!dt) dt = new Date();
			
			// 오늘 날짜로 이동
			this.calendar.navigate(dt);

			// 신규로 데이터 불러오기
			var first_day = this.calendar._calendarView._firstPageDay;
			var last_day = this.calendar._calendarView._lastPageDay;
			//var first_day = this.maincal._firstDay;
			//var last_day = this.maincal._lastDay;
			var s_key = moment(first_day).add(-1, 'days').format('YYYYMMDD[T000000Z]');
			var e_key = moment(last_day).add(1, 'days').format('YYYYMMDD[T235959Z]');
			this.getUserEvent(s_key, e_key, pass_status, this.calendar);
			
		}else{
			this.calendar = $("#emp_schedule_cal").mobiscroll().eventcalendar({
				theme: 'ios',
					themeVariant : 'light',
					locale: mobiscroll.localeKo,
					touchUI: true,
					responsive: {
					    xsmall: {
							view: {
								calendar: {
									type: 'month',
									weekNumbers: true //주마다 올 해의 몇번째 주인지 표시
								}
							}
					    },
					    custom: { // Custom breakpoint
					    	breakpoint: 600,
					    	view: {
					    		calendar: {
						 			type: 'month',
									weekNumbers: true //주마다 올 해의 몇번째 주인지 표시
							  	}
					    	}
					    }
				  	},
			        dateFormat: 'YYYY-MM-DD',
					clickToCreate: true,
	   				dragToCreate: true,
					renderLabel: function(data){
	
						var html = "";
						
						//html +=		"<div class='mbsc-calendar-label-wrapper'>";
						/*html +=			"<div class='mbsc-calendar-text mbsc-ios mbsc-ltr mbsc-calendar-label'>";*/
						html +=				"<div class='mbsc-calendar-label-inner mbsc-ios'>";
						html +=					"<div class='label_wrap'>";
						
						if(data.original.category !== undefined){
						html +=						"<div class='label_category " + data.original.category + "'></div>";
						}
						
						html +=						"<div class='mbsc-calendar-label-text'>" + data.title + "</div>";
						html +=					"</div>";
						html +=				"</div>";
						/*html +=			"</div>";*/
						//html +=		"</div>";
						
						return html;
					},
		        	onInit: function(e, inst){
						var s_moment = moment(e.value).date(1).startOf('week'); // 해당월 주차의 첫째날로 셋팅
						var s_key = s_moment.add(-1, 'days').format('YYYYMMDD[T000000Z]'); // 타임존 때문에 데이터 안나오는 경우 없도록 시작일 -1
						var e_key = s_moment.add(43, 'days').format('YYYYMMDD[T235959Z]'); // Mini캘린더에 뿌려지는 날짜수 +1
						_self.getUserEvent(s_key, e_key, null, inst);		
			
				  	},
					onPageChange: function(e, inst){
						// 월을 변경할 때 호출
						var s_key = moment(e.firstDay).add(-1, 'days').format('YYYYMMDD[T000000Z]');
						var e_key = moment(e.lastDay).add(1, 'days').format('YYYYMMDD[T235959Z]');
						_self.getUserEvent(s_key, e_key, null, inst);
					},		
					onPageLoading: function(e, inst){
					},
		        	onPageLoaded: function(e, inst){
						$("#emp_schedule_cal [aria-label*='오늘']").find(".mbsc-calendar-cell-inner").addClass("today");
						$("#emp_schedule_cal [aria-label*='토요일']").find(".mbsc-calendar-cell-inner").addClass("saturday");
						$("#emp_schedule_cal [aria-label*='일요일']").find(".mbsc-calendar-cell-inner").addClass("sunday");
				  	},
					onLabelClick: function(event, inst){
						var dt = moment(event.date).format('YYYY-MM-DD');
						if (!event.label) {
							// more 클릭시
							//console.log("더보기 클릭!!!!!!!");
							
						}					
					},
					onEventClick: function(event, inst){
						gport.showCalEventDetail(event);
					},
				  	onEventCreate: function(args, inst){
						return false;
				  	}
			
			}).mobiscroll("getInst");
			
			this.calendar.setOptions({
				monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월', ],
				monthNamesShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
				dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
				yearSuffix: '년',
				todayText: '오늘',
			});			
		}
	},
	
	///임시 즐겨찾기 사원 그리는 함수
	"temporary_bookmark_draw": function(keyword){
		var _self = this;
		
		if (keyword.length == 0) return;
		$("#temporary_emp_wrap").empty();
		
		for (var i = 0; i < keyword.length; i++){
			var user_info = gap.user_check(keyword[i]);
			var html = "";
			
			html +=	"<div class='temporary_emp_item'>";
			html += "	<div class='user_status_wrap emp_item' id='tmp_bookmark_" + user_info.ky + "'>";
	        html += "		<div class='user_img' data-empno='" + user_info.emp + "' style='background-image: url(" + user_info.user_img_url +"), url("+gap.none_img+")'>";
		//	html +=	"			<span class='emp_name' style='width: 49px; height: 49px; display: flex; align-items: center; justify-content: center; color: white;'></span>";
			html +=	"		</div>";
	        html +=	"	</div>";
			html +=	"</div>";
	
			$("#temporary_emp_wrap").append(html);
			$("#tmp_bookmark_" + user_info.ky).data("info", user_info);
		}
		
		var cal = $("#emp_schedule_cal").mobiscroll("getInst");
		
		$("#temporary_emp_wrap .emp_item").off().on("mouseenter", function(){
			gcom.bookmark_emp_popup_draw($(this));
		});
		$("#temporary_emp_wrap .emp_item").on("mouseleave", function(){
			$(this).find(".emp_work_popup").remove();
		});
		
		$("#temporary_emp_wrap .emp_item").on("click", function(e){
			$(this).closest(".emp_top").find(".emp_item ").removeClass("select");
			$(this).addClass("select");
			
			gcom.emp_mask_draw($(this));
	
			var empno = $(e.currentTarget).children(".user_img")[0].dataset.empno;
			
			cal.setEvents(null);
			//gcom.emp_schedule_data_load(cal, empno);
			_self.emp_schedule_cal_draw(moment(_self.calendar._selected))
		});
		
	},
	
	"setMainCalEvent": function(url, inst){
		var _self = this;
		var is_my_event = window.mailfile == this.getUserMailPath();
				
		$.ajax({
			type: "GET",
			url: url,
			xhrFields : {
				withCredentials : true
			},			
			success: function(res){
				var dupl_doc = {};	//중복체크
				var evt_list = {};	// {20220518:{"work":1, "}}
				var events = [];				
				
				$.each(res.viewentry, function(idx, val){
					
					var evt = _self.getEventJson(val);
					if (!evt) return true;
					
					// 초대 양식은 표시 안함
					if (evt.type == 'Notice') return true;
					
					// 완료된 일정은 표시 안함
					//if (evt.completed == 'T') return true;
					
					// 중복 여부 체크 : 중복이 존재하는 경우
					// 1. 반복 문서
					// 2. 하루이상 기간 문서
					if (dupl_doc[evt.id]) {
						if (evt.type.indexOf('Repeat') == -1) {
							return true;
						}
					} else {
						dupl_doc[evt.id] = true;
					}
					
					// 다른 사람의 비공개 일정은 카운트하면 안됨
					if (!is_my_event && evt.ShowPS == "1") {
						return true;
					}
					
					if (!evt.start || !evt.end) {
						return true;
					}
					
					var ck_start = moment(evt.start);
					var ck_end = moment(evt.end);
					var limit_cnt = 45; // 최대 45개까지 카운트 (1개월 달력에 표시가능한 개수만큼만 체크)
					var ck_cnt = 0;
					while (ck_start.format("YYYYMMDD") <= ck_end.format("YYYYMMDD")) {
						ck_cnt++;
						if (ck_cnt >= limit_cnt) break;
						
						// 날짜 중복 체크 (이벤트가 여러개여도 마킹을 하나만 하기 위해 날짜 중복 체크)
						ck_date = ck_start.format("YYYYMMDD");
						_self.addEventCount(evt_list, ck_date, evt);
						
						
						// 상태 셋팅  (5:출장, 7:교육, 10:휴무)
						/*if (evt.apt_cate == '5') { // 출장
							_self.checkStatus(ck_date, '7');
						} else if (evt.apt_cate == '7') { // 교육
							_self.checkStatus(ck_date, '8');
						} else if (evt.apt_cate == '10' && evt.system_code != 'task') { // 휴무 (d)
							_self.checkStatus(ck_date, '10');
						}*/
						
						
						ck_start.add(1, "days");
					}
					
					evt.category = (evt.apt_cate == '10' && evt.system_code != 'task' ? "vac" : "meeting");
					evt.type = _self.getEventType(evt);
					events.push(evt);
				});
				
				_self.event_type_1 = _self.makeEventList(evt_list);
				_self.event_type_2 = events;
				
				inst.setEvents(_self.event_type_2);
				
				// 만약에 내 일정을 보는 경우 공유 캘린더와 구독 캘린더 정보 가져오기
			/*	if (is_my_event) {
					// 캘린더 로딩이 완료되어야 처리 가능
					_self.cal_load_complete.then(function(){
						_self.checkEtcCalendar();
					});
				} else {
					_self.gotoScrollToday();
				}*/
			},
			error: function(){
				inst.setEvents([]);
			}
		});		
	},
	
	"addEventCount" : function(evt_list, dt, evt){
		
		if (!evt_list[dt]) {evt_list[dt] = {};}
		
		// 기존에 해당 날짜에 값이 있는 경우
		var type = this.getEventType(evt);	//work, private
		
		if ( evt_list[dt][type] ) {
			evt_list[dt][type] = evt_list[dt][type] + 1;
		} else {
			evt_list[dt][type] = 1;
		}
	},
	
	"makeEventList" : function(data){
		var _self = this;
		var events = [];
		$.each(data, function(key, val){
			if (val["work"]) {
				events.push({
					type: 'work',
					start: moment(key+"T000000"),
					title: gap.lang.work_schedule + ' (' + val["work"] + ')',
					color: _self.color_work 
					
				});
			}
			
			if (val["private"]) {
				events.push({
					type: 'private',
					start: moment(key+"T000001"),
					title: gap.lang.private_schedule + ' (' + val["private"] + ')',
					color: _self.color_private
				});
			}
		});
		return events;
	},
	
	"getEventType" : function(evt){
		// 비공개 일정인 경우 개인으로 등록
		if (evt.ShowPS == "1" || evt.ShowPS == "2") {
			var type = "private";
		} else {
			var type = "work";
		}
		
		return type;
	},	
	
	//오른쪽 영역 그리는 함수
    "area_right_draw": function(flag){
	
		if(flag === "init"){
			//메인화면 html
			var main_html = '';
			main_html += '<div id="personal_area" class="overflow"></div>';
			main_html += '<div id="area_right">';
			main_html += '	<div class="inner">';
			main_html += '		<div class="ceo_mail_wrap">';
			main_html += '			<div id="btn_to_ceo_mail" class="ceo_mail_bg">';
			main_html += '				<div class="ceo_mail_line"></div>';
			main_html += '				<div id="ceo_mail">';
			main_html += '					<div class="txt_wrap">';
			main_html += '						<div class="ceo_mail_title">CEO MESSAGE</div>';
			main_html += '						<div class="vertical_bar"></div>';
			main_html += '						<div class="ceo_mail_desc" id="ceo_contents"></div>';
			main_html += '					</div>';
			main_html += '					<span class="arrow_right_ico"></span>';
			main_html += '				</div>';
			main_html += '			</div>';
			main_html += '		</div>';
			main_html += '		<div id="user_folder_content" class="content_wrap"></div>';
			main_html += '		<div id="content_container" class="grid-stack"><div id="portlet_loading"><span class="icon"></span>'+gap.lang.va166+'</div></div>';
			main_html += '	</div>';
			main_html += '</div>';
	
			$("#area_content").empty();
			$("#area_content").append(main_html);
			
			$("#right_menu").hide();
			
			//로그인 데이터를 불러온다.
			gcom.login_data_load();
			
			// CEO 메시지
			gport.ceo_data_load();
			
			// 일정화면 초기화
			this.calendar = null;	
		}
		
		gport.main_portlet_load();
		
	},
	
	//즐겨찾기한 사원에 마우스 올렸을 때 팝업창 띄우는 함수
	"bookmark_emp_popup_draw": function(target){
		var user_info = target.data("info");
		var html = '';
		
		html += "<div id='emp_work_popup' class='emp_work_popup'>";
		html += "	<div class='popup_inner'>";
		html += "		<div class='popup_title_wrap'>";
		html += "			<div class='emp_info'>";
		html += "				<span class='emp_name'>" + user_info.name + "</span>";
		html += "				<span style='margin: 0 1px;'>|</span>";
		html += "				<span class='emp_duty'>" + user_info.jt + "</span>";
		html += "			</div>";
		html += "			<span class='emp_dept'>" + user_info.dept + "</span>";
		html += "		</div>"; // popup_title_wrap
		html += "		<div class='work_btn_wrap'>";
		html += "			<div class='work_btn_box'><button type='button' class='popup_btn btn_emp_call'><span class='btn_img'></span></button><span class='btn_name'>"+gap.lang.tel+"</span></div>";
		html += "			<div class='work_btn_box'><button type='button' class='popup_btn btn_emp_chat'><span class='btn_img'></span></button><span class='btn_name'>"+gap.lang.chatting+"</span></div>";
		html += "			<div class='work_btn_box'><button type='button' class='popup_btn btn_emp_mail'><span class='btn_img'></span></button><span class='btn_name'>"+gap.lang.lnb_mail+"</span></div>";
		html += "			<div class='work_btn_box'><button type='button' class='popup_btn btn_emp_info'><span class='btn_img'></span></button><span class='btn_name'>"+gap.lang.va167+"</span></div>";
		html += "		</div>"; // work_btn_wrap
		html += "	</div>"; // popup_inner
		html += "</div>";
		
		//target.append(html);
		$(html).appendTo(target);
			
		$("#emp_work_popup").css({
			"top": target.offset().top + 60,
			"left": target.offset().left - 88
		});
		
		$("#emp_work_popup .btn_emp_mail").on("click", function(){
			var tmp_email = encodeURIComponent(user_info.em);
			var mail_domain = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + window.maildbpath;
			var url = mail_domain + "/memo?openform&opentype=popup&authorsend=" + tmp_email;
			gap.open_subwin(url, "1200","900", "yes" , "", "yes");
		});
		
		$("#emp_work_popup .btn_emp_chat").on("click", function(){
			//var tmp_email = encodeURIComponent(user_info.em);
			var list = [];
			list.push({
				ky: user_info.ky,
				nm: user_info.nm
			});
			gap.cur_chat_user = user_info.ky;
			gap.cur_chat_name = user_info.nm;
			gap.chatroom_create(list);
		});
		
		$("#emp_work_popup .btn_emp_info").on("click", function(){
			gap.showUserDetailLayer(user_info.ky);
		});		
	},
	
	//현재 시각을 이전시간대 또는 현재시각의 정각으로 변환해주는 함수
	"getCurrentHour": function() {
	    let now = new Date();
	    let hour;
	    
	    if (now.getMinutes() < 30) {
	        // 현재 시간이 30분 이전이면 이전 시간대 (예: 현재가 11시 19분이면 10시 30분)
	        hour = now.getHours() - 1;
	        if (hour < 0) {
	            hour = 23; // 자정 이전의 경우, 23시로 설정
	        }
	    } else {
	        // 현재 시간이 30분 이후면 현재 시간의 정각 (예: 현재가 11시 31분이면 11시 00분)
	        hour = now.getHours();
	    }
	    
	    // 시간을 API 요청 형식에 맞게 변환 (예: 11시 -> '1100')
	    let hourStr = `${hour.toString().padStart(2, '0')}00`;
	    
	    return hourStr;
	},
	
	// data와 가장 가까운 시간을 찾는 함수.
    "findClosestTime": function(data, currentTime) {
        let closest = null;
        let closestTimeDifference = Infinity;

        data.forEach(item => {
            const itemTime = item.fcstTime; // 예측 시간을 가져옵니다.
            const timeDifference = Math.abs(parseInt(itemTime) - parseInt(currentTime));

            if (timeDifference < closestTimeDifference) {
                closestTimeDifference = timeDifference;
                closest = item;
            }
        });

        return closest;
    },
/*
	//폴더 개인화
	"folder_personalize_backup": function(){
		
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

            gport.app_area_data_load();

            $(".user_folder_title_wrap").prepend(title_html);
			
			// 뉴스를 제외한 나머지 폴더아이템에 마스크를 씌운다
			for(var i = 0; i < $(".content_item").length; i++){
				if(!$(".content_item").eq(i).hasClass("stamp")){
					$(".content_item").eq(i).append(mask_html);
				}
			}
			
			//드래그 활성화
			gport.main_content_draggable();
			
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
				
	            gport.main_layout_save(); //위치좌표 저장
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
		
	},*/
	
	/*
	//사용자 개인영역(왼쪽영역)에 앱 목록 데이터 불러오는 함수
	"app_area_data_load_backup": function(){
		
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
		
            //    console.log(">>>>>>앱 목록 데이터 로드 성공");                

            },
            error: function(xhr, error){
                console.log(error);
            }
        });
		
	},*/
	
	//알림 팝업창 그리는 함수
	"notification_popup_draw": function(category){
		
		$.ajax({
			type: "GET",
			url: root_path +  "/resource/data/notify_category_data.txt",
			dataType: "json",
			success: function(data){
				
				var html = '';
				
				var all = 0;
				var mail = 0;
				var approval = 0;
				var workplace = 0;
				
				html += "<div id='notify_popup'>";
				html += "	<div class='box_top'><h4 class='box_title'>알림</h4></div>";
				html += "	<div class='box_mid'>";
				html += "		<div class='category_box'>";
				html += "			<div class='category_wrap'>";
				for(var i = 0; i < data.length; i++){
					if(i === 0){ 
						html += "		<li class='category active' key='"+ data[i].category + "'><div class='category_inner'><span class='category_name'> " + data[i].category_ko + "</span><span class='category_count_wrap'><span class='category_count'>" + data[i].length + "</span></span></div></li>";
					} else {
						html += "		<li class='category' key='"+ data[i].category + "'><div class='category_inner'><span class='category_name'> " + data[i].category_ko + "</span><span class='category_count_wrap'><span class='category_count'>" + data[i].length + "</span></span></div></li>";	
					}										
				}
				html += "				<span class='indicator_bar'></span>";
				html += "			</div>";
				html += "			<button type='button' class='btn_notify_setting'><span class='notify_setting_img'></span></button>";
				html += "		</div>";
				html += "		<div id='notify_ul'>";
				html += "			<div class='notify_ul_inner'></div>";
				html += "		</div>";
				html += "	</div>";
				html += "	<div class='box_bot'>";
				html += "		<div class='bot_btn_wrap'>";
				html += "			<button type='button' class='btn_all_remove'><span class='all_remove_img'></span><span>전체삭제</span></button>";
				html += "			<button type='button' class='btn_all_read'><span class='all_read_img'></span><span>전체읽기</span></button>";
				html += "		</div>";
				html += "	</div>";
				html += "</div>";
				
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
				
			//	console.log(">>>>>>>알림팝업 그리기");
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
			url: root_path +  "/resource/data/notify_data.txt",
			dataType: "json",
			success: function(data){
				
				var html = '';
				
				$("#notify_popup .notify_ul_inner").empty();

				for(var i = 0; i < data.length; i++){
					//글 작성시간
					var uptime = gcom.time_transform(new Date() - new Date(data[i].head.time));
					var detail_uptime = gcom.time_transform(new Date() - new Date(data[i].detail.time));
				
					if(data[i].category === key || key === 'all'){
						html += "<li class='notify_li unread'>";
						html += "	<div class='profile_img_wrap'>";
						html += "		<div class='profile_img' style='background-image: url(" + data[i].head.img + ")'></div>";
	
							if(data[i].head.status === 'on'){ //접속중인 유저일때
								html +="<span class='user_status on'><span class='status_circle'></span></span>";
							} else { //접속중이지 않은 유저일때
								html +="<span class='user_status offline'><span class='status_circle'></span></span>";
							}
						
						html += "	</div>";
						html += "	<div class='notify_desc_wrap'>";
						html += "		<div class='notify_desc'>";
						html += "			<div class='notify_desc_inner'>";
						html += "				<div class='notify_desc_inner_wrap'>";
						if(data[i].category === 'approval'){
							html += "				<span class='notify_title_wrap'><strong>" + data[i].head.name + "</strong>님이 <strong class='notify_title'>" + data[i].head.to + "</strong> 승인을 요청했습니다.</span>";
							html += "				<span class='read_status'></span>";
							html += "			</div>";
							html += "			<span class='notify_time'>" + uptime + " 전 · 전자결재</span>";
						}
						if(data[i].category === 'workplace'){
							if(data[i].head.type === 'reply_regist'){
								html += "			<span class='notify_title_wrap'><strong>" + data[i].head.name + "</strong>님이 <strong class='notify_title'>" + data[i].head.to + "</strong> 댓글을 등록했습니다.</span>";
								html += "			<span class='read_status'></span>";
								html += "		</div>";
								html += "		<span class='notify_time'>" + uptime + " 전 · 업무방</span>";
							}
							if(data[i].head.type === 'post_regist'){
								html += "			<span class='notify_title_wrap'><strong>" + data[i].head.name + "</strong>님이 <strong class='notify_title'>" + data[i].head.to + "</strong>에 글을 등록했습니다.</span>";
								html += "			<span class='read_status'></span>";
								html += "		</div>";
								html += "		<span class='notify_time'>" + uptime + " 전 · 업무방</span>";								
							}
						}
						
						html += "			</div>";
						html += "		</div>"; // notify_desc
						html += "		<div id='notify_detail'>";
						html += "			<div class='detail_title_wrap'>";
						html += "				<div class='detail_title_box'>";
						
						if(data[i].head.type_img !== ''){
							html += "				<div class='notify_type'><span class='notify_type_img' style='background-image: url(" + data[i].head.type_img + ")'></span></div>";
						}
						
						html += "					<div class='detail_title_txt'>";
						html +=	"						<div class='detail_title'>" + data[i].detail.title + "</div>";
							
						if(data[i].category === 'workplace' && data[i].head.type === 'reply_regist'){
							//댓글등록일때는 비움
						} else {
							html += "					<div class='detail_time_wrap'><span>" + detail_uptime + " 전 · " + data[i].detail.writer + " 제작</span></div>";
						}
						
						html += "					</div>";
						html += "				</div>";
						
						//해당 글로 이동하기 버튼은 결재알림을 제외하고 모두 표시
						if(data[i].category !== 'approval'){
							html += "			<button type='button' class='btn_to_post'></button>";
						}
						html += "			</div>"; // detail_title_wrap
						
						if(data[i].category === 'approval'){
							html += "		<div class='detail_btn_wrap'>";
							html += "			<button type='button' class='detail_btn btn_doc_view'><span>문서보기</span></button>";
							html += "			<button type='button' class='detail_btn btn_approve'><span>승인</span></button>";
							html += "		</div>";
						}
						html += "		</div>";
						html += "	</div>";
						html += "</li>";
					}
				
				}
				if(html === ''){
					html += "<li class='notify_li none_notify'><strong>알림이 없습니다.</strong></li>";
				}

				$("#notify_popup .notify_ul_inner").append(html);
					
			//	console.log(">>>>>>>>>>알림 팝업창 데이터 로드 성공");
			},
			error: function(xhr, error){
				console.log(error);
			}
		});
		
	},
	
	///// /TO-DO 세부업무항목 네비게이션 그리는 함수
	"todo_detail_work_nav_draw": function(checklist){

		var html = "";
		
		console.log(checklist);
		root_dom = $("#work_detail_list");
		
		var html = "";
		html += "<div class='workroom_title_wrap' id='work_top_dis'></div>";
		root_dom.append(html);
		for (var i = 0; i < checklist.length; i++){
			var item = checklist[i];
			var len = $("#work_top_dis").find("#ul_"+item.project_code).length;
			if (len == 0){
				var html2 = "	<div class='workroom_title' id='ul_"+item.project_code+"'><span class='title_ico'></span><span class='title_txt' >"+item.project_name+"</span></div>";
				$("#work_top_dis").append(html2);
			}
			
			var id = item._id.$oid;
			var html3 = "<div class='todo_depth1' id='depth_"+id+"'>";
			html3 +=	"						<div class='todo_title_wrap'>";
			html3 +=	"							<div class='todo_title' id='todo_sub_"+id+"'>";
			html3 +=	"								<div>";
		//	html3 +=	"									<input type='checkbox' id='todo_" + id + "' class='input_all_chk'>";
		//	html3 +=	"									<label for='todo_" + id + "' class='label_all_chk'></label>";
			html3 +=	"								</div>";
			html3 +=	"								<span class='todo_title_txt' title='"+item.title+"'>"+item.title+"</span>";
			html3 +=	"							</div>";
			html3 += 	"							<div class='arrow_ico'></div>";
			html3 +=	"						</div>";
			html3 +=   	"</div>";
		
			
			$("#ul_" + item.project_code).parent().append(html3);
			var html4 = "<ul class='detail_work_ul'>";
			for (var k = 0; k < item.checklist.length; k++){
				var citem = item.checklist[k];
				
				if ((citem.asign) && (citem.asign.ky == gap.userinfo.rinfo.ky)){
					var tid = citem.tid;
					var complete_date = citem.complete_date ? gap.convertGMTLocalDateTime_only_day(citem.complete_date) : "No Date";
					html4 += "<li class='detail_work_li'>";
					html4 += "	<div><span class='detail_li_ico'></span></div>"
					html4 += "	<div class='txt_wrap'>";
					if (citem.complete == "T"){
						html4 += "		<input type='checkbox' id='detail_todo_" + tid +"' checked data-id='"+tid+"' data-pid='"+item.project_code+"' data-sid='"+id+"'><label for='detail_todo_" + tid + "'></label>";
					}else{
						html4 += "		<input type='checkbox' id='detail_todo_" + tid +"' data-id='"+tid+"' data-pid='"+item.project_code+"' data-sid='"+id+"'><label for='detail_todo_" + tid + "'></label>";
					}
					
					html4 += "		<span class='detail_work_txt'>";
					html4 += "			<span class='detail_work_desc'>";
					if (citem.complete == "T"){
						html4 += "				<span class='detail_work_title done' title='"+citem.txt+"' data-sid='"+id+"'>" + citem.txt + "</span>";
						html4 += "				<span class='detail_work_success_date done'>["+complete_date+"]</span>";
					}else{
						html4 += "				<span class='detail_work_title' title='"+citem.txt+"' data-sid='"+id+"'>" + citem.txt + "</span>";
						html4 += "				<span class='detail_work_success_date'>["+complete_date+"]</span>";
					}					
					html4 += "			</span>";
					html4 += "		</span>";
					html4 += "	</div>";
					html4 += "</li>";
				}
			}

			html4 += "</ul>";
			$("#depth_" + id).append(html4);
			
		}
		
		
		return html;
	},
	
	//TO-DO 그래프 전체보기 레이어 그리는 함수
	"todo_work_layer_draw": async function(type, empno){
		//type이 list일때는 목록을 표시, calendar일 경우는 달력으로 표시
		var _self = this;
		
		var calltype = "";
		var cp = $("#tab_todo_mine").attr("class");
		if (cp.indexOf("active") > -1){
			calltype = "receive";
		}else{
			calltype = "asign";
		}
		
		var mask = "";
		var layer = ""; // 레이어
		var html = ""; // 레이어 내용, type에 따라 다르게 표시
		var html2 = ""; ///// type = list 일때만 사용
		
		mask += "<div class='mask_top'></div><div class='mask_bot'></div>";
		
		/*layer += "<div class='arc_top'></div><div class='arc_bot'></div><div class='border_hide_bar'></div>"*/
		html += 	"<div class='box_top'>"
		
		if(type === "calendar"){
			html +=		"<div class='emp_top'>";
			
			html +=			"<div id='user_item_wrap' class='user_wrap'>";
			html +=				"<h4 class='emp_wrap_title'>나</h4>";
			html +=			"</div>";
			
			html +=			"<div class='emp_wrap'>";
			html +=				"<h4 class='emp_wrap_title'>"+gap.lang.favorite+"</h4>";
			html +=				"<div id='emp_item_wrap' class='emp_item_wrap'></div>";
			html +=			"</div>";
			
			html +=			"<div class='emp_search_box_wrap'>";
			html +=				"<h4 class='emp_wrap_title' style='opacity: 0; transition: 0.2s;'>"+gap.lang.search+"</h4>";
			html +=				"<div class='emp_search_box'>";
			
			/////임시 즐겨찾기 목록///////
			html +=					"<div id='temporary_emp_wrap' class='temporary_emp_wrap'></div>";
			/////임시 즐겨찾기 목록///////
			
			html +=					"<button type='button' class='btn_search_open'><span class='btn_ico'></span></button>";
			html +=					"<div class='emp_search_box_btn_wrap'>";
			html +=						"<input type='text' class='input_emp_search' id='cal_search_user' placeholder='" + gap.lang.placeholder_name + "'>";
			html +=						"<button type='button' class='btn_org_open'><span class='btn_ico'></span></button>";
			html +=					"</div>";
			html +=				"</div>";
			html +=			"</div>";
			html +=		"</div>";
		}
		if(type === "list"){
			html += 	"<div class='tab_box'>";
			html +=			"<li id='tab_todo_state' class='tab_li state active'><span class='btn_img'></span><span class='tab_txt'>"+gap.lang.status+"</span></li>";

			if (calltype == "receive"){
				html += 	 	"<li id='tab_todo_manager' class='tab_li manager'><span class='btn_img'></span><span class='tab_txt'>"+gap.lang.req_user+"</span></li>";
			}else{
				html += 	 	"<li id='tab_todo_manager' class='tab_li manager'><span class='btn_img'></span><span class='tab_txt'>"+gap.lang.users+"</span></li>";
			}
			
			html +=		"</div>";
		}
		
		html += 		"<button type='button' id='btn_work_area_close' class='close_btn'></button>";
		html  += 	"</div>";
		
		html += 	"<div class='box_content'>";
		
		if(type === "calendar"){
			html +=	"<div id='emp_schedule_cal' class='main_todo_cal'></div>";
		}
		
		html += 	"</div>"; //box_content
		
		if(type === "calendar"){
		layer += "<div id='todo_work_area' class='bookmark'>" + html + "</div>";
		}
		if(type === "list"){
		
		html2 += "<div id='todo_container' class='todo_container'>";
		/*html2 += "<button type='button' id='btn_nav_toggle' class='btn_nav_toggle'><span class='btn_ico'></span></button>";*/
		html2 += html + "</div>";
	//	html2 += gcom.todo_detail_work_nav_draw(); /////// 세부업무항목 네비게이션 추가
		
		
		
		html2 += "<div id='todo_detail_work_nav' class='todo_detail_work_nav'>";
		html2 += "	<button type='button' id='btn_nav_toggle' class='btn_nav_toggle'><span class='btn_ico'></span></button>";
		html2 +="	<div class='nav_inner'>";
		html2 +="		<h4 class='nav_title'>"+gap.lang.checklist+"</h4>";
		html2 +="		<div class='work_list_container' id='work_detail_list'>";
		
		html2 += "		</div>";
		html2 += "	</div>";
		html2 += "</div>";
		
		
		
		layer += "<div id='todo_work_area' class='graph'>" + html2 + "</div>";	
		}
		//layer += "</div>";
		
		$("#personal_area").addClass("no_scroll");
		
		///레이어가 모두 열리는데 걸리는 시간 0.2초
		var layer_open_time = 200;

		//레이어 열려있지 않은 상태일 때
		if($("#todo_work_area").length === 0){
			$("#personal_area").append(mask);
			$("#area_right").append(layer);
			
			if(type === "list"){
				/*setTimeout(function(){
					$("#todo_work_area.graph .box_content").addClass("overflow_auto");
				}, layer_open_time);*/
			}
			
		} else {
			$("#todo_work_area").empty();
			if(type === "list"){
				$("#todo_work_area").append(html2);
			} else {
				this.calendar = null;
				$("#todo_work_area").append(html);			
			}
		}
		
		if(type === "calendar"){
			$("#btn_todo_work_all_view").removeClass("disable");
			$("#todo_graph_wrap").removeClass("work_view");
			$("#emp_bookmark").addClass("work_view");
			
			/*
			// 레이어 테두리 css
			$("#personal_area .mask_top").css({
				"top" : $("#area_top").outerHeight(),
				"height": $("#emp_bookmark").position().top + 1
			});
			$("#personal_area .mask_bot").css({
				"top": $("#area_top").outerHeight() + $("#emp_bookmark").position().top + $("#emp_bookmark").outerHeight() - 1,
				"height": "100%"
			});
			*/
			
			gcom.draw_personal_area_border("calendar");
			
			$("#todo_work_area").removeClass("graph");
			$("#todo_work_area").addClass("bookmark");
			
			$("#todo_work_area .btn_search_open").on("click", function(){
				$(this).hide();
				$(this).siblings(".emp_search_box_btn_wrap").find(".input_emp_search, .btn_org_open").addClass("block");
				$(this).closest(".emp_search_box_wrap").find(".emp_wrap_title").css({"opacity" : "1"});
				
				setTimeout(function(){
					$("#todo_work_area .input_emp_search").focus();					
				}, 250);
			});
			
			$("#cal_search_user").on("keydown", function(e){
				var keyword = $.trim($(this).val());
				
				if(e.keyCode === 13){
					if(keyword.length === 0){
						mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
						return false;
					} else {
 						gsn.requestSearch('', $(this).val(), function(sel_data){
							gcom.temporary_bookmark_draw(sel_data);
							$("#temporary_emp_wrap").css({"margin-right" : "8px"});
							$("#cal_search_user").val("");					
						});						
						
					//	gcom.temporary_bookmark_draw(keyword);
					//	$("#temporary_emp_wrap").css({"margin-right" : "8px"});
					//	$(this).val("");
					}
				}
			});
			
			$("#todo_work_area .btn_org_open").on("click", function(){
				gap.showBlock();
				window.ORG.show(
					{
						'title': gap.lang.mt_trans_title,
						'single': false,
						'show_ext' : false, // 외부 사용자 표시 여부
						'select': 'person' // [all, team, person]
					}, 
					{
						getItems:function() { return []; },
						setItems:function(items) { /* 반환되는 Items */
							if (items.length == 0) return;
							
							var _list = [];
							for (var i = 0; i < items.length; i++){
								if (i < 5){	// 5명까지만 저장 가능
									var _res = gap.convert_org_data(items[i]);
									_list.push(_res);				
								}
							}
							gcom.temporary_bookmark_draw(_list);
							$("#temporary_emp_wrap").css({"margin-right" : "8px"});
						},
						onClose: function(){
							gap.hideBlock();
						}
					}
				);					
			});			
			
			//즐겨찾기한 사원 목록 그린다.
			gcom.bookmark_emp_list_draw(empno);
			//달력 활성화
			gcom.emp_schedule_cal_draw();
		}
		
		if(type === "list"){
			$("#emp_bookmark").removeClass("work_view");
			$("#todo_graph_wrap").addClass("work_view");
			
			/*
			$("#personal_area .mask_top").css({
				"top" : $("#area_top").outerHeight(),
				"height": $("#todo_graph_wrap").position().top + 1
			});
			$("#personal_area .mask_bot").css({
				"top": $("#area_top").outerHeight() + $("#todo_graph_wrap").position().top + $("#todo_graph_wrap").outerHeight() - 1,
				"height": $("#todo_list_wrap").outerHeight() + parseInt($("#todo_list_wrap").css("padding")) * 2
			});
			*/
			
			gcom.draw_personal_area_border("list");
			
			$("#todo_work_area").removeClass("bookmark");
			$("#todo_work_area").addClass("graph");
			
			// 업무콘텐츠 그리기
			gcom.todo_work_list_draw('by_state');
				
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
			
			//////// 세부업무항목 열기 버튼 ////////////
			$("#btn_nav_toggle").on("click", function(e){

				$(this).toggleClass("expand");
				$(this).parent().siblings(".todo_container").toggleClass("expand");
			
				if ($(e.currentTarget).attr("class").indexOf("expand") == -1){
					$("#todo_work_area .todo_container").css("margin-right", "400px");				
				}else{
					$("#todo_work_area .todo_container").css("margin-right", "16px");
				}
				//$("#todo_work_area .todo_container").css("margin-right", "0px");
				
				//넓이에 따라 자동 재계산하기 
				setTimeout(function(){
					var cat = gap.cur_todo_category;
					gcom.todo_work_list_draw(cat);
				}, 200);

			});
			
			///////// 업무 목록 열기 버튼 ///////
			$("#todo_detail_work_nav .todo_title_wrap").off().on("click", function(e){
				if (e.target.className === 'input_all_chk' || e.target.className === 'label_all_chk') {
	                return;
	            }
				$(this).toggleClass("open");
				$(this).closest(".todo_depth1").find(".detail_work_ul").slideToggle(150);
			});
			
			//////// 세부업무항목 모두 체크하는 체크박스////////////
			$("#todo_detail_work_nav .todo_title_wrap input:checkbox").off().on("change", function(){
				
				$(this).parent().siblings(".todo_title_txt").toggleClass("check");
				
				if($(this).prop("checked") === true){
					$(this).closest(".todo_depth1").find(".detail_work_ul").find("input:checkbox").prop("checked", true);
					$(this).closest(".todo_depth1").find(".detail_work_ul").find(".detail_work_txt").addClass("check");
				} else {
					$(this).closest(".todo_depth1").find(".detail_work_ul").find("input:checkbox").prop("checked", false);
					$(this).closest(".todo_depth1").find(".detail_work_ul").find(".detail_work_txt").removeClass("check");
				}
			});
			//////// 세부업무항목 각각의 체크박스 ////////////
			$("#todo_detail_work_nav .detail_work_ul input:checkbox").on("change", function(){
				
				$(this).siblings(".detail_work_txt").toggleClass("check");
				
				// 해당 업무의 모든 세부업무항목 체크박스 갯수
				var total_count = $(this).closest(".detail_work_ul").find("input:checkbox").length;
				// 해당 업무의 현재 체크된 세부업무항목 체크박스 갯수
				var chk_count = $(this).closest(".detail_work_ul").find("input:checkbox:checked").length;

				// 세부업무항목이 모두 체크됐을 때
				if(chk_count === total_count){
					$(this).closest(".todo_depth1").find(".todo_title_wrap").find("input:checkbox").prop("checked", true);
					$(this).closest(".todo_depth1").find(".todo_title_wrap").find(".todo_title_txt").addClass("check");
				} else {
					// 세부업무항목이 하나라도 체크되지 않았을 때
					$(this).closest(".todo_depth1").find(".todo_title_wrap").find("input:checkbox").prop("checked", false);
					$(this).closest(".todo_depth1").find(".todo_title_wrap").find(".todo_title_txt").removeClass("check");
				}
	
				
			});
		}
		
		//레이어 닫기 버튼
		$("#btn_work_area_close").on("click", function(){
			gcom.todo_work_area_close();
		});
		
		//todo 업무 전체보기 닫기
		$("#todo_graph_close").on("click", function(){
			if($("#todo_work_area").hasClass("graph")){
				gcom.todo_work_area_close();
			}
			
			if(type === "calendar"){
				
			}
			if(type === "list"){
				$("#btn_todo_work_all_view").removeClass("disable");
				$("#todo_graph_wrap").removeClass("work_view");
				
				var graph_tab_id = $(".todo_tab_li.active").attr("id");
				var graph_type = "";
				
				if( graph_tab_id === "tab_todo_mine" ){
					graph_type = "mine";
				}
				if( graph_tab_id === "tab_todo_others" ){
					graph_type = "others";
				}
				
				gcom.todo_graph_draw(graph_type, "by_state");
			}
			
		});
		
		// ESC키로 업무창 닫기
		$(document).on("keydown", function(e){
			if(e.keyCode === 27){
				//TO DO 창이 띄워지고 ESC클릭시 같이 닫히기 때문에 일단 주석처리한다.
				//$("#btn_work_area_close").click();
			}
		});
	},
	
	//// 즐겨찾기, TO-DO 그래프 레이어 열었을 때 둥근 테두리 그리는 함수
	"draw_personal_area_border": function(layer_type){
		
		if(layer_type === "calendar"){
			///// 즐겨찾기 사원 클릭 ////////
			
			var borderTop = parseFloat($("#emp_bookmark").css("border-top-width")) || 0;
			
			var msk_top_height = "";
			
			if($(window).outerWidth() >=  2048){
				msk_top_height = $("#area_top").outerHeight();
			} else {
				msk_top_height = $("#area_top").outerHeight() + 1;
			}
			
			$("#personal_area .mask_top").css({
			    "top": msk_top_height,
			    "height": $("#emp_bookmark").offset().top - borderTop + 1 - $("#area_top").outerHeight()
			});

			
			var borderBottom = parseFloat($("#emp_bookmark").css("border-bottom-width")) || 0;
			
			$("#personal_area .mask_bot").css({
				"top": $("#emp_bookmark").offset().top + 
				$("#emp_bookmark").outerHeight() - borderBottom,
				"height": "100%"
			});
		}
		if(layer_type === "list"){
			////// TO-DO 그래프 전체보기 //////
			
			$("#personal_area .mask_top").css({
				"top" : $("#area_top").outerHeight(),
				"height": $("#todo_graph_wrap").offset().top - $("#area_top").outerHeight() +
              	parseFloat($("#personal_area .mask_top").css("border-bottom-width"))
			});

			$("#personal_area .mask_bot").css({
				"top": $("#todo_graph_wrap").offset().top + $("#todo_graph_wrap").outerHeight() - 
				parseFloat($("#personal_area .mask_bot").css("border-top-width")),
				"height": "100%" 
				//"height": $("#todo_list_wrap").outerHeight() + parseInt($("#todo_list_wrap").css("padding")) * 2
			});
		}
		
	},
	
	//즐겨찾기한 직원 목록 그리는 함수
	"bookmark_emp_list_draw": function(empno){
		var _self = this;
		var surl = gap.channelserver + "/portal_favorite_info.km";
		var postData = JSON.stringify({});

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			async: false,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
            success: function(res){
				if (res.result == "OK"){
					var user_info = gap.user_check(gap.userinfo.rinfo);
					var user = "";

					user += "<div class='user_status_wrap emp_item' id='user_bookmark_" + user_info.ky +"'>";
					user += "	<div class='user_img' data-empno='" + user_info.emp + "' style='background-image: url(" + user_info.user_img_url +"), url("+gap.none_img+")' ></div>";
					user += "</div>";
					$("#user_item_wrap").append(user);
					$("#user_bookmark_" + user_info.ky).data("info", user_info);
				
					if (res.data != null){
						for (var i = 0; i < res.data.list.length; i++) {
							var emp_info = gap.user_check(res.data.list[i]);
							var emp = "";
							
			            	emp += "<div class='user_status_wrap emp_item' id='user_bookmark_" + emp_info.ky +"'>";
			                emp += "	<div class='user_img' data-empno='" + emp_info.emp + "' style='background-image: url(" + emp_info.user_img_url +"), url("+gap.none_img+")'></div>";
			                emp +="</div>";
							$("#emp_item_wrap").append(emp);
							$("#user_bookmark_" + emp_info.ky).data("info", emp_info);
						}
					}					
				}

				var cal = $("#emp_schedule_cal").mobiscroll("getInst");
				
				$("#todo_work_area .emp_item").on("mouseenter", function(e){
					gcom.emp_mask_draw($(this));
					if(!$(this).hasClass("select")){
						$(this).find(".btn_del_bookmark_emp").show();
					}
					///나를 제외한 다른 사원의 이미지에만 삭제버튼 표시
					if($(this).closest("#user_item_wrap").length === 0){
						//현재 마우스를 올린 인물에 팝업창을 표시한다.
						gcom.bookmark_emp_popup_draw($(this));
					}
				});
				
				$("#todo_work_area .emp_item").on("mouseleave", function(){
					
					if(!$(this).hasClass("select")){
						$(this).find(".emp_mask").remove();
					}
					
					$(this).find(".btn_del_bookmark_emp").hide();						
					
					$(this).find(".emp_work_popup").remove();
				});
				$("#todo_work_area .emp_item").on("mousewheel", function(e){
					e.preventDefault();
				});
				
				//사원 이미지 클릭 이벤트
				$("#todo_work_area .emp_item").on("click", function(e){
					
					$(this).closest(".emp_top").find(".emp_item ").removeClass("select");
					$(this).addClass("select");
					
					gcom.emp_mask_draw($(this));
					
					//즐겨찾기에서 선택한 사원에 클래스 
					$(this).closest(".emp_item ").addClass("select");
		
					var empno = $(e.currentTarget).children(".user_img")[0].dataset.empno;
					var cal = $("#emp_schedule_cal").mobiscroll("getInst");
					cal.setEvents(null);
					//gcom.emp_schedule_data_load(cal, empno);
					_self.emp_schedule_cal_draw(moment(_self.calendar._selected))
					
				});
				
				gcom.emp_mask_draw($("[data-empno=" + empno + "]"));
				$("[data-empno=" + empno + "]").closest(".emp_item").addClass("select");

			},
			error: function(xhr, error){
				console.log(error);
			}
		});
	},
	
	/////////todo_work_area 닫는 함수
	"todo_work_area_close": function(){
		$("#personal_area .personal_box").removeClass("work_view");
		$("#personal_area").removeClass("no_scroll");
		$("#todo_work_area").remove();
		$("#personal_area .mask_top, #personal_area .mask_bot").remove();
		$("#btn_todo_work_all_view").removeClass("disable");
		this.calendar = null;
	},
	
	
	"todo_work_list_draw": function(category){
		
		gap.cur_todo_category = category;
		var calltype = "";
		var cp = $("#tab_todo_mine").attr("class");
		if (cp.indexOf("active") > -1){
			calltype = "receive";
			$("#tab_todo_manager .tab_txt").text(gap.lang.req_user);
		}else{
			calltype = "asign";
			$("#tab_todo_manager .tab_txt").text(gap.lang.users);
		}
		
		
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
		
	//	if (work_type == "by_state" || category == "by_manager"){
	//	console.log("calltype : " + calltype);
		gap.calltype = calltype;
		if (calltype == "receive"){
			url = gap.channelserver + "/my_receive_work.km";
			
			
			var inp = $("#btn_nav_toggle").attr("class");
			if (inp.indexOf("expand") == -1){
				$("#todo_work_area .todo_container").css("margin-right", "400px");
			}
			
			
		//	if (typeof($("#todo_work_area .todo_container") != "undefined")) {
		//		$("#todo_work_area .todo_container").get(0).classList.remove("margin-right");
		//	}
			
			$("#todo_detail_work_nav").show();
		}else{
			url = gap.channelserver + "/my_asign_work.km";
			
			$("#todo_work_area .todo_container").css("margin-right", "0px");
			$("#todo_detail_work_nav").hide();
		}
		
		$.ajax({
			type: "POST",
			url: url,
			dataType: "json",
			contentType : "application/json; charset=utf-8",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success: function(data){
				//console.log(data);
				var checklist = data.data.checklist;
				var itemlist = data.data.list;
				
				var screen_size = "normal";
				if ($(".box_top").width() < 1000){
					screen_size = "small";
				}
				
				console.log("screen_size : " + $(".box_top").width())
				var html = "";
				
				//html += "<div class='box_content'>";
				html += "	<div class='work_wrap'>";
				if (calltype == "receive"){
					html += "		<div class='work_title'>"+gap.lang.ingwork+"</div>";
				}else{
					html += "		<div class='work_title'>"+gap.lang.ingwork2+"</div>";
					
				}
				
				html += "		<div class='work_list_box_wrap' id='work_list_box_wrap'>";
				
				html += "		</div>";
				html += "	</div>";
				
				$("#todo_work_area .box_content").empty();
				$("#todo_work_area .box_content").append(html);
				
				
				if (gap.cur_todo_category == "by_state"){
					//1번째 테이블 그리기
					var html_header1 = "";
					html_header1 += "			<div class='work_list_box progress_work' id='todo_waiting_state' style='display:none; margin-top: 13px;'>";
					html_header1 += "				<div class='work_list_title_wrap'>";
					html_header1 += "					<div class='work_list_title'>";
					html_header1 += "						<div class='work_list_title_txt_wrap'><span>"+gap.lang.wait+"</span><span class='waiting_list_count' id='w_l_c'></span></div>";
					html_header1 += "						<button type='button' class='btn_work_list_fold'>"
					html_header1 += "					</div>";
					html_header1 += "					<div class='work_btn_wrap'>";
				//	html += "						<button type='button' class='work_btn filter_btn'><span class='btn_img'></span><span>필터</span></button>";
					html_header1 += "						<button type='button' class='work_btn work_regist_btn'><span class='btn_img'></span><span>"+gap.lang.tab_reg_work+"</span></button>"
					html_header1 += "					</div>";
					html_header1 += "				</div>";
					html_header1 += "				<div class='work_table'>";
					html_header1 += 					gcom.todo_table_thread_draw(screen_size);
					html_header1 += "					<div class='list_ul' id='waiting_list'>";				
					html_header1 += "					</div>";
					html_header1 += "				</div>"
					html_header1 += "			</div>";
					//2번째 테이블 그리기
					html_header1 += "			<div class='work_list_box progress_work' id='todo_processing_state' style='display:none'>";
					html_header1 += "				<div class='work_list_title_wrap'>";
					html_header1 += "					<div class='work_list_title'>";
					html_header1 += "						<div class='work_list_title_txt_wrap'><span>"+gap.lang.doing+"</span><span class='processing_list_count' id='p_l_c'></span></div>";
					html_header1 += "						<button type='button' class='btn_work_list_fold'>"
					html_header1 += "					</div>";
					html_header1 += "				</div>";
					html_header1 += "				<div class='work_table'>";
					html_header1 += 					gcom.todo_table_thread_draw(screen_size);
					html_header1 += "					<div class='list_ul' id='processing_list'>";				
					html_header1 += "					</div>";
					html_header1 += "				</div>"
					html_header1 += "			</div>";
					
					$("#work_list_box_wrap").append(html_header1);
				}else if (gap.cur_todo_category == "by_manager"){
					
					for (var i = 0; i < itemlist.length; i++){
						var html_header1 = "";
						var itm = itemlist[i];						
						var id = itm.owner.ky;
						var user_info = gap.user_check(itm.owner);
						var len = $("#work_list_box_wrap").find("#todo_processing_state_"+id).length;
						if (len == 0){
							if (i == 0){
								html_header1 += "			<div class='work_list_box progress_work' id='todo_processing_state_"+id+"' style='margin-top:15px'>";
							}else{
								html_header1 += "			<div class='work_list_box progress_work' id='todo_processing_state_"+id+"'>";
							}
							
							html_header1 += "				<div class='work_list_title_wrap'>";
							html_header1 += "					<div class='work_list_title'>";
							html_header1 += "						<div class='work_list_title_txt_wrap'><span>"+user_info.disp_user_info+"</span><span class='processing_list_count' id='"+id+"_l_c'></span></div>";
							html_header1 += "						<button type='button' class='btn_work_list_fold'>"
							html_header1 += "					</div>";
							html_header1 += "				</div>";
							html_header1 += "				<div class='work_table'>";
							html_header1 += 					gcom.todo_table_thread_draw(screen_size);
							html_header1 += "					<div class='list_ul' id='"+id+"_list'>";				
							html_header1 += "					</div>";
							html_header1 += "				</div>"
							html_header1 += "			</div>";
							
							$("#work_list_box_wrap").append(html_header1);
						}
						
						var html2 = gcom.todo_table_draw(itm, screen_size);
						$("#" + id + "_list").append(html2);
						
					}
					
					
				}
				
				//체크 리스트 표시하기
				$("#work_detail_list").empty();
				if (calltype == "receive"){
					gcom.todo_detail_work_nav_draw(checklist); 
				}
				
				//$("#work_detail_list").html(html2);
							
				var html2 = "";
				var html3 = "";
				var wait_count = 0;
				var progress_count = 0;
				//TO DO 목록 표시하기
				
				if (gap.cur_todo_category == "by_state"){
					for (var i = 0; i < itemlist.length; i++){
						//console.log(itemlist[i])
						var itm = itemlist[i];
						if (itm.status == "1"){
							//대기
							html2 += gcom.todo_table_draw(itm, screen_size);
							wait_count++;
						}else{
							//진행
							html3 += gcom.todo_table_draw(itm, screen_size);
							progress_count++;
						}
					}
					
					if (html2 != ""){
						$("#todo_waiting_state").show();					
						$("#waiting_list").html(html2);
						$("#w_l_c").html("("+wait_count+")");
						
					}
					if (html3 != ""){
						$("#todo_processing_state").show();					
						$("#processing_list").html(html3);
						$("#p_l_c").text("("+progress_count+")");
					}
				}else if (gap.cur_todo_category == "by_manager"){
					
				}
				
				
				$(".work_wrap").mCustomScrollbar({
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
					autoHideScrollbar : true
				});
				
				$("#work_detail_list").mCustomScrollbar({
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
					autoHideScrollbar : true
				});
				
				
				
				
				//업무 진행률 바 애니메이션	
				for(var i = 0; i < $("#todo_work_area .progress_rate").length; i++){
					$("#todo_work_area .progress_rate").eq(i).animate({
						"width": parseInt($("#todo_work_area .progress_rate_txt").eq(i).text()) + "%"
					});
				}
				
				//업무창 펼치기/접기
				$("#todo_work_area .btn_work_list_fold").on("click", function(){
					$(this).toggleClass("fold");
					$(this).closest(".work_list_box").find(".work_table").toggle();
				});
				
				//오늘날짜(YYYY-MM-DD형식)				
				var today = new Date().getFullYear() +gcom.addZero(new Date().getMonth()+1) + gcom.addZero(new Date().getDate());
				
				//업무 마감일 체크
				for(var i = 0; i < $(".work_list_box .list_tr").length; i++){						
					if( $(".work_list_box .deadline_date").eq(i).text().replace(/-/gi,"") < today){						
						$(".work_list_box .deadline_date").eq(i).closest(".list_tr").addClass("deadline_work");
					}
				}
				
				// ESC키로 업무창 닫기
				$(document).on("keydown", function(e){
					if(e.keyCode === 27){
					//	$("#btn_work_area_close").click();
					}
				});
				
				
				$(".detail_work_desc .detail_work_title").off().on("click", function(e){
					var id = $(e.currentTarget).data("sid");
					gTodo.compose_layer(id);
				});
				
				//세부업무항목 클릭시 열고 닫기
				$(".todo_title_wrap").off().on("click", function(e){					
					$(e.currentTarget).toggleClass("open");
					$(e.currentTarget).parent().find(".detail_work_ul").toggle();
				});
				
				//업무 클릭시 TO Do 원본 띄워주기
				$(".work_table .list_tr").off().on("click", function(e){					
					var id = $(e.currentTarget).data("id");
					gTodo.compose_layer(id);
				});
				
				//세부업무항목 체크박스 클릭시
				$(".txt_wrap input[type='checkbox']").off().on("click", function(e){
					
					var id = $(e.currentTarget).data("id");
					var projgect_code = $(e.currentTarget).data("pid");
					var sid = $(e.currentTarget).data("sid");
					
					var is_complete = "F";
					if ($(e.currentTarget).is(":checked")){
						is_complete = "T";
						//취소선을 적용한다.
						$(this).parent().find(".detail_work_title").addClass("done");
						$(this).parent().find(".detail_work_success_date").addClass("done");
					}else{
						//취소선을 제거한다.
						$(this).parent().find(".detail_work_title").removeClass("done");
						$(this).parent().find(".detail_work_success_date").removeClass("done");
					}
					//체크를 해지 하는 경우 is_complete = "F"로 설정해야 한다.
					
					var data = JSON.stringify({
						project_code : projgect_code,
						update_key : "checklist.$.complete",
						update_data : is_complete,
						select_key : "checklist.tid",
						select_id : id,
						sid : sid
					});					
					var url = gap.channelserver + "/update_todo_item_sub.km";
					$.ajax({
						type : "POST",
						dataType : "json",
						contentType : "application/json; charset=utf-8",
						data : data,
						url : url,
						success : function(res){},
						error : function(e){
							gap.error_alert();
						}
					});
				});
				
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"todo_table_thread_draw" : function(screen_size){
		
		var html = "";
		html += "<div class='thead'>";
		
		
		if (screen_size == "small"){
			html += "<div class='thead_td'>"+gap.lang.ws_title+"</div>";		
			if (gap.cur_todo_category != "by_manager"){
				if (gap.calltype == "asign"){
					html += "<div class='thead_td'>"+gap.lang.users+"</div>";	
				}else{
					html += "<div class='thead_td'>"+gap.lang.req_user+"</div>";					
				}
				
			}
			html += "<div class='thead_td'>"+gap.lang.startdate+"</div>";
			html += "<div class='thead_td'>"+gap.lang.enddate+"</div>";
			html += "<div class='thead_td'>"+gap.lang.priority+"</div>";
			html += "<div class='thead_td'>"+gap.lang.todo_rate+"</div>";
		}else{
			html += "<div class='thead_td'>"+gap.lang.ws_title+"</div>";
			html += "<div class='thead_td'>"+gap.lang.va168+"</div>";
			if (gap.cur_todo_category != "by_manager"){
				if (gap.calltype == "asign"){
					html += "<div class='thead_td'>"+gap.lang.users+"</div>";	
				}else{
					html += "<div class='thead_td'>"+gap.lang.req_user+"</div>";					
				}	
			}
				
			html += "<div class='thead_td'>"+gap.lang.startdate+"</div>";
			html += "<div class='thead_td'>"+gap.lang.enddate+"</div>";
			html += "<div class='thead_td'>"+gap.lang.priority+"</div>";
			html += "<div class='thead_td'>"+gap.lang.todo_rate+"</div>";
			html += "<div class='thead_td'>"+gap.lang.file+"</div>";
		}

		html += "</div>";	
		return html;
	},
	
	"todo_table_draw" : function(itm, screen_size){
		
		var html2 = "";
		var status_msg = "";
		var status_color = "";
		if (itm.status == "1"){
			status_msg = gap.lang.wait;
			status_color = "wait";
		}else{
			status_msg = gap.lang.doing;
			status_color = "progress";
		}
		var startdate = "";
		if (itm.startdate && itm.startdate != ""){
			startdate = gap.convertGMTLocalDateTime_only_day(itm.startdate);
		}
		var enddate = "";	
		if (itm.enddate && itm.enddate != ""){
			enddate = gap.convertGMTLocalDateTime_only_day(itm.enddate);		
		}
		
		var user_info = "";
		if (gap.calltype == "asign"){
			user_info = gap.user_check(itm.asignee);	
		}else{
			user_info = gap.user_check(itm.owner);	
		}
		var priority = "";
		var pmsg = "";
		if (itm.priority == "1"){
			priority = "emergency";
			pmsg = gap.lang.priority1;
		}else if (itm.priority == "2"){
			priority = "high";
			pmsg = gap.lang.priority2;
		}else if (itm.priority == "3"){
			priority = "medium";
			pmsg = gap.lang.priority3;
		}else if (itm.priority == "4"){
			priority = "low";
			pmsg = gap.lang.priority4;
		}		
		var process_percent = 0;
		var totalcount = itm.checklist.length;
		var completecount = 0;
		if (itm.checklist.length > 0){
			for (var k = 0; k < itm.checklist.length; k++){
				if (itm.checklist[k].complete == "T"){
					completecount++;
				}
			}
			process_percent = parseInt((completecount / totalcount) * 100, 10);
		}		
		
		html2 += "<div class='list_tr' data-id='"+itm._id.$oid+"'>";
		
		if (screen_size == "small"){
			html2 += "	<div class='list_td' title='" + itm.title + "'>";
			html2 += "		<div class='td_inner'>";
			html2 += "			<span class='work_name'>" + itm.title + "</span>";
			html2 += "		</div>"
			html2 += "	</div>";
			
			if (gap.cur_todo_category != "by_manager"){
				html2 += "	<div class='list_td'>";
				html2 += "		<div class='td_inner'>";
				html2 += "			<span class='profile_img' style='background-image:url("+user_info.user_img_url+")'></span>";
				html2 += "		</div>";
				html2 += "	</div>";
			}

			html2 += "	<div class='list_td'>";
			html2 += "		<div class='td_inner'>";
			html2 += "			<span class='start_date'>"+startdate+"</span>";
			html2 += "		</div>";
			html2 += "	</div>";
			html2 += "	<div class='list_td'>";
			html2 += "		<div class='td_inner'>";
			html2 += "			<span class='deadline_date'>"+enddate+"</span>";
			html2 += "		</div>";
			html2 += "	</div>";
			html2 += "	<div class='list_td'>";
			html2 += "		<div class='td_inner'>";
			html2 += "			<span class='work_priority "+priority+"'></span>";
			html2 += "			<span>"+pmsg+"</span>";
			html2 += "		</div>";
			html2 += "	</div>";
			html2 += "	<div class='list_td'>";
			html2 += "		<div class='td_inner progress_rate_wrap'>";
			html2 += "			<span class='progress_rate_bar'>";
			/*html2 += "				<span class='progress_rate' style='width: "+process_percent+"%;'></span>";*/
			html2 += "				<span class='progress_rate' style='width: 0%;'></span>";						
			html2 += "			</span>";
			html2 += "				<span class='progress_rate_txt'>"+process_percent+"%</span>";
			html2 += "		</div>";
			html2 += "	</div>";

		}else{
			html2 += "	<div class='list_td' title='" + itm.title + "'>";
			html2 += "		<div class='td_inner'>";
			html2 += "			<span class='work_name'>" + itm.title + "</span>";
			html2 += "		</div>"
			html2 += "	</div>";
			html2 += "	<div class='list_td'>";
			html2 += "		<div class='td_inner comment_wrap'>";
			html2 += "			<span class='comment_img'></span>";
			html2 += "			<span>"+itm.reply_count+"</span>";
			html2 += "		</div>";
			html2 += "	</div>";
		//	html2 += "	<div class='list_td'>";
		//	html2 += "		<div class='td_inner'>";
		//	html2 += "			<span class='work_state "+status_color+"'>"+status_msg+"</span>";
		//	html2 += "		</div>";
		//	html2 += "	</div>";
			if (gap.cur_todo_category != "by_manager"){
				html2 += "	<div class='list_td'>";
				html2 += "		<div class='td_inner'>";
				html2 += "			<span class='profile_img' style='background-image:url("+user_info.user_img_url+")'></span>";
				html2 += "		</div>";
				html2 += "	</div>";
			}

			html2 += "	<div class='list_td'>";
			html2 += "		<div class='td_inner'>";
			html2 += "			<span class='start_date'>"+startdate+"</span>";
			html2 += "		</div>";
			html2 += "	</div>";
			html2 += "	<div class='list_td'>";
			html2 += "		<div class='td_inner'>";
			html2 += "			<span class='deadline_date'>"+enddate+"</span>";
			html2 += "		</div>";
			html2 += "	</div>";
			html2 += "	<div class='list_td'>";
			html2 += "		<div class='td_inner'>";
			html2 += "			<span class='work_priority "+priority+"'></span>";
			html2 += "			<span>"+pmsg+"</span>";
			html2 += "		</div>";
			html2 += "	</div>";
			html2 += "	<div class='list_td'>";
			html2 += "		<div class='td_inner progress_rate_wrap'>";
			html2 += "			<span class='progress_rate_bar'>";
			html2 += "				<span class='progress_rate' style='width: "+process_percent+"%;'></span>";						
			html2 += "			</span>";
			html2 += "				<span class='progress_rate_txt'>"+process_percent+"%</span>";
			html2 += "		</div>";
			html2 += "	</div>";
			html2 += "	<div class='list_td'>";
			html2 += "		<div class='td_inner'>";
			html2 += "			<span class='file_img'></span>";
			html2 += "			<span class='count_file'>"+itm.file_count+"</span>"
			html2 += "		</div>";
			html2 += "	</div>";
		}
		
		html2 += "</div>";
		
		return html2;
	},
	
	
	
	//통합검색 레이어 그리는 함수
	"search_layer_draw": function(){
		
		var html = "";
		
		
		html += "<div id='search_layer'>";
		html += "	<div class='inner'>";
		html += "		<button type='button' id='btn_search_layer_close'><span class='layer_close_img'></span></button>";
		html += "		<div class='layer_content'>";
		html += "			<div class='logo'></div>";
		html += "			<div id='searchBox' class='search_box'>";
		html += "				<select name='search_selectmenu' id='search_selectmenu'>";
		html += "					<option>통합검색</option>";
		html += "					<option>제목</option>";
		html += "					<option>제목+내용</option>";
		html += "				</select>";
		html += "				<input type='text' id='input_search' class='search_input' placeholder='검색어를 입력해주세요'></input>";
		html += "				<div class='btn_wrap'>";
		html += "					<button type='button' class='mic_search_btn'></button>";
		html += "					<button type='button' id='btn_search' class='search_btn'><span>검색</span></button>";
		html += "				</div>";
		html += "			</div>";
		html += "			<div class='recent_search_list_box'>";
		html += "				<h4 class='recent_search_list_title'>최근검색</h4>";
		html += "				<div id='recent_search_list_ul'>";
		html += "					<li class='search_list'><span>경영지원</span><button type='button' class='btn_del_search_li'></button></li>";
		html += "					<li class='search_list'><span>경영</span><button type='button' class='btn_del_search_li'></button></li>";
		html += "					<li class='search_list'><span>경비</span><button type='button' class='btn_del_search_li'></button></li>";
		html += "					<li class='search_list'><span>5월 이벤트</span><button type='button' class='btn_del_search_li'></button></li>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";
		
		$("#area_top").append(html);
		
		$("#area_top .btn_top_menu").fadeOut(250);
		$("#main_logo").fadeOut(250);
		
		var inx = parseInt(gap.maxZindex()) + 1;
		
		/// 최상단으로 끌어올린다.
		$("#search_layer").css("zIndex", inx);
		$("#search_layer").fadeIn(200);
		
		$("#search_selectmenu").selectmenu();
		$("#input_search").focus();
		
		//통합검색 버튼
		$("#btn_search").on("click", function(){

			var keyword = $("#input_search").val();
			
			if( keyword !== '' ){
				gps.search_result_draw(keyword, "", "first");
				
				/*$("#search_layer").hide(); // 통합검색 레이어 숨김
				$("#input_search").val(""); // 검색어 입력창 비우기*/
				
			} else {
			//	alert("검색어를 입력해주세요.");
				mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
				return false;				
			}
		});
		
		//통합검색 입력창
		$("#input_search").on("keydown", function(e){
			
			if( e.keyCode === 13 ){
				
				var keyword = $(this).val();
				
				if( keyword !== '' ) {
					gps.search_result_draw(keyword, "", "first");
					
					/*$("#search_layer").hide(); // 통합검색 레이어 숨김
					$("#input_search").val(""); // 검색어 입력창 비우기*/
				} else {
				//	alert("검색어를 입력해주세요.");
					mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
					return false;				
				}
				
			}
			
		});
		
		//통합검색 레이어 닫기
		$("#btn_search_layer_close").on("click", function(){
			$("#search_layer").fadeOut(250, function(){
				///레이어가 닫힌 후 레이어 제거
	        	$(this).remove();
	    	});
			
			$("#area_top .btn_top_menu").fadeIn(250);
			$("#main_logo").fadeIn(250);
		});
		
		$(document).on("keydown", function(e){
			if(e.keyCode === 27){
				$("#btn_search_layer_close").click();
			}
		});
	},
	
	"event_bind": function(){
		
		$(document).on("click", function(e){
			
			//알림창 바깥영역 클릭시 알림창 닫기/ 알림버튼 비활성화
			/*if(!$(e.target).closest('#notify_popup').length && !$(e.target).is('#btn_notification')){
				$("#btn_notification").removeClass("active");
				$("#notify_popup").remove();
			}*/
			
		});
		
		$("#dark_layer").on("keydown", function(e){
			if(e.keyCode === 27){
				$(this).fadeOut(150);
				$(this).empty();
			}
		});
		
		//전체메뉴 레이어 열기
		$("#btn_all_menu_open").on("click", function(){
			
			$(this).toggleClass("close_btn");
			
			if($(this).hasClass("close_btn")){
				//레이어 열기
				$("#all_menu_layer").fadeIn(200);
				gcom.all_menu_data_load();	
			} else {
				$("#btn_all_menu_layer_close").click();
			}
			
			$(document).on("keydown", function(e){
				if(e.keyCode === 27){
					$("#btn_all_menu_open").removeClass("close_btn");
					$("#btn_all_menu_layer_close").click();
				}
			});
			
		});
		
		//통합검색 버튼
		$("#btn_search").on("click", function(){
			
			var keyword = $("#input_search").val();
			
			if( keyword !== '' ){
				gps.search_result_draw(keyword, "", "first");
				
				//$("#search_layer").hide(); // 통합검색 레이어 숨김
				//$("#input_search").val(""); // 검색어 입력창 비우기
				
			} else {
			//	alert("검색어를 입력해주세요.");
				mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
				return false;				
			}
		});
		//통합검색 입력창
		$("#input_search").on("keydown", function(e){
			
			if( e.keyCode === 13 ){
				
				var keyword = $(this).val();
				
				if( keyword !== '' ) {
					gps.search_result_draw(keyword, "", "first");
					
					//$("#search_layer").hide(); // 통합검색 레이어 숨김
					//$("#input_search").val(""); // 검색어 입력창 비우기*/
				} else {
				//	alert("검색어를 입력해주세요.");
					mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
					return false;				
				}
				
			}
			
		});
		
		//통합검색 레이어 열기
		$("#btn_search_layer_open").on("click", function(){
			
			gcom.search_layer_draw();
			
			/*$("#search_layer").fadeIn(100);
			$("#search_selectmenu").selectmenu();
			$("#input_search").focus();
			
			$(document).on("keydown", function(e){
				if(e.keyCode === 27){
					$("#btn_search_layer_close").click();
				}
			});*/
			
		});
		/*//통합검색 레이어 닫기
		$("#btn_search_layer_close").on("click", function(){
			$("#search_layer").fadeOut(100);
		});*/
		
		//알림 버튼
		$("#btn_notification").off();
		$("#btn_notification").off().on("click", function(e){
			e.stopPropagation();
			
			var inx = parseInt(gap.maxZindex()) + 1;
			
			if($(this).hasClass("active")){
				// 팝업이 켜져있을 때
				$(this).removeClass("active");
				$("#alarm_center_layer").fadeOut(function(){
					$("#alarm_center_layer").empty();
				});
				return;		
			} else {
				$(this).addClass("active");

				$("#alarm_center_layer").css("zIndex", inx);
				$("#alarm_center_layer").fadeIn();
				//gcom.notification_popup_draw("all");
				
			}
			
			/*
			// 알림포탈 호출
			var inx = parseInt(gap.maxZindex()) + 1;
			$("#alarm_center_layer").css("zIndex", inx);
			$("#alarm_center_layer").fadeIn();
			*/
			
			// 알림포탈 호출
			gAct.init();
			
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
					
					if (op == "setting"){
						gcom.show_user_config();
					}else if (op == "admin"){
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
				name : gap.lang.online,
				className: 'online',
				items : ""
			},
			"empty" : {
				name : gap.lang.empty,
				items : ""
			},
			"donottouch" : {
				name : gap.lang.donottouch,
				items : ""
			},
			"emptystatus" : {
				name : gap.lang.emptystatus
			}		
		}	

		var setting ={
			"sepa00" : "-------------",
			"setting" : {
				name : gap.lang.userConfig
			}
		}
		_items = $.extend(_items, setting);		

		if (role_admin == "T"){
			var admin ={
				"sepa02" : "-------------",
				"admin" : {
					name : "Admin"
				}
			}
			_items = $.extend(_items, admin);
		}

		var logout ={
			"sepa01" : "-------------",
			"logout" : {
				name : "Logout"
			}
		}
		_items = $.extend(_items, logout);
			
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
	
	"show_user_config": function(){
		var html = "";
		
		html +=	"<div id='user_preference_layer'>";
		//////layer_inner/////
		html +=		"<div class='layer_inner'>";
		html +=			"<button type='button' class='btn_layer_close'><span class='btn_img'></span></button>"
		html +=			"<div class='layer_title'>환경설정</div>";
		//////layer_content/////
		html +=			"<div class='layer_content'>";
		html +=				"<div class='content_left'>";
		html +=					"<div class='item_wrap'>";
		html +=						"<div class='item_title'>" + gap.lang.displaymenu + "</div>";
		html +=						"<div class='radio_group'>";
      	html +=							"<input type='radio' id='kolang' value='1' name='group' checked>";
		html +=							"<label for='kolang'>" + gap.lang.kor + "</label>";
      	html +=							"<input type='radio' id='enlang' value='2' name='group'>";
		html +=							"<label for='enlang'>" + gap.lang.eng + "</label>";
		html +=							"<input type='radio' id='zhlang' value='3' name='group'>";
		html +=							"<label for='zhlang'>" + gap.lang.cn + "</label>";
		html +=							"<input type='radio' id='jalang' value='4' name='group'>";
		html +=							"<label for='jalang'>" + gap.lang.jpn + "</label>";
	//	html +=							"<input type='radio' id='vilang' value='5' name='group'>";
	//	html +=							"<label for='vilang'>" + gap.lang.vietnamese + "</label>";
	//	html +=							"<input type='radio' id='idlang' value='6' name='group'>";
	//	html +=							"<label for='idlang'>" + gap.lang.ind + "</label>";
		html +=						"</div>";
		html +=					"</div>";
		html +=					"<div class='item_wrap'>";
		html +=						"<div class='item_title'>" + gap.lang.alramsound + "</div>";
		html +=						"<div class='radio_group'>";
      	html +=							"<input type='radio' id='alramon' value='11' name='group2' checked>";
		html +=							"<label for='alramon'>On</label>";
      	html +=							"<input type='radio' id='alramoff' value='22' name='group2'>";
		html +=							"<label for='alramoff'>Off</label>";
		html +=						"</div>";
		html +=					"</div>";
		html +=					"<div class='item_wrap'>";
		html +=						"<div class='item_title'>" + gap.lang.alramsound2 + "</div>";
		html +=						"<div class='radio_group'>";
		html +=							"<input type='radio' id='alramon2' value='111' name='group3' checked>";
		html +=							"<label for='alramon2'>On</label>";
      	html +=							"<input type='radio' id='alramoff2' value='222' name='group3'>";
		html +=							"<label for='alramoff2'>Off</label>";
		html +=						"</div>";
		html +=					"</div>";
		html +=					"<div class='item_wrap'>";
		html +=						"<div class='item_title'>" + gap.lang.ba1 + "</div>";
		html +=						"<select id='browser_seletmenu' class='browser_seletmenu'>";
		html +=							"<option value='0'>" + gap.lang.se1 + "</option>";
		html +=							"<option value='1'>" + gap.lang.se2 + "</option>";
		html +=							"<option value='2'>" + gap.lang.se3 + "</option>";
		html +=						"</select>";
		html +=						"<button type='button' id='btn_change_pw' class='btn_blue'><span>" + gap.lang.ba2 + "</span></button>";
		html +=					"</div>";
		html +=				"</div>";
		html +=				"<div class='content_right'>";
		html +=					"<div class='item_wrap'>";
		html +=						"<div class='item_title'>" + gap.lang.status_title + "</div>";
		html +=						"<div class='radio_group'>";
		html +=							"<input type='radio' id='status_title1' value='1' name='group1' checked>";
		html +=							"<label for='status_title1'>" + gap.lang.online + "</label>";
      	html +=							"<input type='radio' id='status_title2' value='2' name='group1'>";
		html +=							"<label for='status_title2'>" + gap.lang.empty + "</label>";
		html +=							"<input type='radio' id='status_title3' value='3' name='group1'>";
		html +=							"<label for='status_title3'>" + gap.lang.donottouch + "</label>";
		html +=						"</div>";
		html +=						"<div class='input_group' id='dis_om'>";
		html +=							"<input type='text' id='om1' placeholder='" + gap.lang.status_msg1 + "'>";
		html +=							"<input type='text' id='om2' placeholder='" + gap.lang.status_msg2 + "'>";
		html +=							"<input type='text' id='om3' placeholder='" + gap.lang.status_msg3 + "'>";
		html +=							"<input type='text' id='om4' placeholder='" + gap.lang.status_msg4 + "'>";
		html +=							"<input type='text' id='om5' placeholder='" + gap.lang.status_msg5 + "'>";
		html +=						"</div>";
		html +=						"<div class='input_group' id='dis_am' style='display:none;'>";
		html +=							"<input type='text' id='am1' placeholder='" + gap.lang.status_msg1 + "'>";
		html +=							"<input type='text' id='am2' placeholder='" + gap.lang.status_msg2 + "'>";
		html +=							"<input type='text' id='am3' placeholder='" + gap.lang.status_msg3 + "'>";
		html +=							"<input type='text' id='am4' placeholder='" + gap.lang.status_msg4 + "'>";
		html +=							"<input type='text' id='am5' placeholder='" + gap.lang.status_msg5 + "'>";
		html +=						"</div>";
		html +=						"<div class='input_group' id='dis_dm' style='display:none;'>";
		html +=							"<input type='text' id='dm1' placeholder='" + gap.lang.status_msg1 + "'>";
		html +=							"<input type='text' id='dm2' placeholder='" + gap.lang.status_msg2 + "'>";
		html +=							"<input type='text' id='dm3' placeholder='" + gap.lang.status_msg3 + "'>";
		html +=							"<input type='text' id='dm4' placeholder='" + gap.lang.status_msg4 + "'>";
		html +=							"<input type='text' id='dm5' placeholder='" + gap.lang.status_msg5 + "'>";
		html +=						"</div>";			
		html +=						"<div class='desc_txt'>" + gap.lang.max5 + "</div>";
		html +=					"</div>";
		html +=				"</div>";
		html +=			"</div>";
		//////layer_content/////
		html +=			"<div class='btn_wrap'><button type='button' class='btn_save'><span>" + gap.lang.basic_save + "</span></button></div>";
		html +=		"</div>";
		//////layer_inner/////
		html +=	"</div>";

		var inx = parseInt(gap.maxZindex()) + 1;
		
		$("#dark_layer").css("z-index", inx);

		$("#dark_layer").fadeIn(200);
		$("#dark_layer").append(html);
		
		var $layer = $('#user_preference_layer');
		
		// 메뉴 표시 언어
		var userid = gap.userinfo.userid;		
		var lang = localStorage.getItem(userid + "_lang");
		console.log("lang >>> " + lang);
		$layer.find('#' + lang + 'lang').prop('checked', true); 
		
		//기본 브라우저 설정하기
		var dsel = "0";	//gap.etc_info.ct.ei;
		$('#browser_seletmenu').val(dsel);
		$('#browser_seletmenu').selectmenu();  //셀렉트 스타일을 지정한다.
		$('#browser_seletmenu').on('change',function() {			
	        var selectedid = $(this).val();
	        //var selectedText = $(".set_access_browser .active.selected").text();	       
	        _wsocket.change_app_browser(selectedid);
	    });

		// 언어 항목 클릭
		$("input[name='group']").off().on('change', function(){
			var _val = $("input[name='group']:checked").val();
			
			var lan = "";
			if (_val == "1"){
				lan = "ko"
					
			}else if (_val == "2"){
				lan = "en";
				
			}else if (_val == "3"){
				lan = "zh";	//"zh";
				
			}else if (_val == "4"){
				lan = "ja";
				
			}else if (_val == "5"){
				lan = "vi";
		
			}else if (_val == "6"){
				lan = "id";				
			}
			
			gap.setCookie("language", lan);
			try{
				localStorage.setItem(userid+"_locale", 'ko'	);
				localStorage.setItem(userid+"_lang", lan);
			}catch(e){}			
						
			_wsocket.change_locale_languse('ko', lan);
		});	
		
		// 상태 메시지
		gcom.temp_status_list = new Object();
		if (gap.etc_info.ct){
			var etc_list = gap.etc_info.ct;
			gcom.temp_status_list = etc_list;
			
			for (var i = 1; i <= 5; i++){
				$layer.find("#om" + i).val(etc_list["om" + i]);			
				gcom.temp_status_list["om" + i] = etc_list["om" + i];
				
				$layer.find("#am" + i).val(etc_list["am" + i]);			
				gcom.temp_status_list["am" + i] = etc_list["am" + i];
				
				$layer.find("#dm" + i).val(etc_list["dm" + i]);			
				gcom.temp_status_list["dm" + i] = etc_list["dm" + i];
			}
		}
		
		$layer.find("[name=group1]").off().on("click", function(){
			if (gcom.curtab == 1){
				for (var i = 1; i <= 5; i++){
					gcom.temp_status_list["om" + i] = $layer.find("#om" + i).val();
				}
				
			}else if (gcom.curtab == 2){		
				for (var i = 1; i <= 5; i++){
					gcom.temp_status_list["am" + i] = $layer.find("#am" + i).val();
				}
				
			}else if (gcom.curtab == 3){
				for (var i = 1; i <= 5; i++){
					gcom.temp_status_list["dm" + i] = $layer.find("#dm" + i).val();
				}
			}

			var opt = $(this).val();
			if (opt == "1"){
				gcom.curtab = 1;
				$layer.find("#dis_om").show();
				$layer.find("#dis_am").hide();
				$layer.find("#dis_dm").hide();
				
				for (var i = 1; i <= 5; i++){
					$layer.find("#om" + i).val(gcom.temp_status_list["om" + i]);
				}
				
			}else if (opt == "2"){
				gcom.curtab = 2;
				$layer.find("#dis_om").hide();
				$layer.find("#dis_am").show();
				$layer.find("#dis_dm").hide();
				
				for (var i = 1; i <= 5; i++){
					$layer.find("#am" + i).val(gcom.temp_status_list["am" + i]);
				}
			}else if (opt == "3"){
				gcom.curtab = 3;
				$layer.find("#dis_om").hide();
				$layer.find("#dis_am").hide();
				$layer.find("#dis_dm").show();
				
				for (var i = 1; i <= 5; i++){
					$layer.find("#dm" + i).val(gcom.temp_status_list["dm" + i]);
				}
			}
		});
		
		// 신규 메시지 소리 알림
		try{
			var alramopt = localStorage.getItem("alramon");
			if (alramopt == "off"){
				$layer.find('#alramoff').prop('checked', true);
				
			}else{
				$layer.find('#alramon').prop('checked', true);
			}
		}catch(e){}
		

		// 신규 메시지 팝업 알림
		try{
			var alramopt = localStorage.getItem("alramon2");
			if (alramopt == "off"){
				$layer.find('#alramoff2').prop('checked', true);
				
			}else{
				$layer.find('#alramon2').prop('checked', true);
			}
		}catch(e){}		

		// 닫기		
		$layer.find('.btn_layer_close').on("click", function(){
			$("#dark_layer").fadeOut(200);
			$("#dark_layer").empty();			
		});
		
		//비밀번호 초기화
		$("#btn_change_pw").off().on("click", function(e){
			
			var url = '';
			//if('idSearch' == name) url = "\/daesang\/search\/id";
			//if('passwordSearch' == name) url = "\/daesang\/search\/password";
			if (gap.isDev){
				url = "http://dsso2.daesang.com/sso/change/pw?";
			}else{
				url = "http://dsin.daesang.com/sso/change/pw?";
			}
			
//			var popupOptions = "width=370, height=270, left=400, top=100, status=no, scrollbars=yes, resizable=no, menubar=no";
			window.open(url,null);
//			var _url = gap.root_path + "/service/addSearch.jsp";
			//gap.open_subwin(url , '370', '270', 'yes', '', 'yes')
			return false;
		});
		
		// 저장
		$layer.find('.btn_save').off().on('click', function(){
			// 신규 메시지 소리 알림
			var sound_alarm;
			$("input[name=group2]:checked").each(function() {
				sound_alarm = $(this).attr("id");
			});
			
			try{
				if (sound_alarm == "alramon"){
					//알림을 울리는 것으로 설정한다.
					localStorage.setItem("alramon", "on");
					
				}else{
					//알림 소리를 제거한다.
					localStorage.setItem("alramon", "off");
				}
			}catch(e){}

			
			// 신규 메시지 팝업 알림
			var popup_alarm;
			$("input[name=group3]:checked").each(function() {
				popup_alarm = $(this).attr("id");
			});
			
			try{
				if (popup_alarm == "alramon2"){
					//알림을 울리는 것으로 설정한다.
					localStorage.setItem("alramon2", "on");
					
				}else{
					//알림 소리를 제거한다.
					localStorage.setItem("alramon2", "off");
				}
			}catch(e){}
			
			//상태 메시지 값을 설정하고 보낸다...
			if (gcom.curtab == 1){
				for (var i = 1 ; i <=5 ; i++){
					gcom.temp_status_list["om" + i] = $layer.find("#om" + i).val();
				}
			}else if (gcom.curtab == 2){
				for (var i = 1 ; i <=5 ; i++){
					gcom.temp_status_list["am" + i] = $layer.find("#am" + i).val();
				}
			}else if (gcom.curtab == 3){
				for (var i = 1 ; i <=5 ; i++){
					gcom.temp_status_list["dm" + i] = $layer.find("#dm" + i).val();
				}
			}
			_wsocket.change_status_setting();
			$layer.find('.btn_layer_close').click();
		});
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
				var url = root_path + "/v/kpadmin";
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
		
		// 통합알림 미확인 시스템 업로드 버튼
		$layer.find("#alarm_sys_upload_btn").off().on('click', function(){
			gcom.show_alarm_sys_upload();
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
			'					<div class="menu-title">메뉴표시</div>' +
			'					<div style="display:flex">' +
			'						<label style="margin-right:20px;"><input type="checkbox" id="disp_menu" value="T">메뉴</label>' +
			'						<label style="margin-right:20px;"><input type="checkbox" id="disp_portlet" value="T">포틀릿</label>' +
			'						<label><input type="checkbox" id="disp_mobile" value="T">모바일</label>' +
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

			// 메뉴 표시
			if (info.disp_menu == 'T') {
				$('#disp_menu').prop('checked', true);
			}
			if (info.disp_portlet == 'T') {
				$('#disp_portlet').prop('checked', true);
			}
			if (info.disp_mobile == 'T') {
				$('#disp_mobile').prop('checked', true);
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
		
		var _disp_menu = $('#disp_menu').is(':checked') ? 'T' : 'F';
		var _disp_portlet = $('#disp_portlet').is(':checked') ? 'T' : 'F';
		var _disp_mobile = $('#disp_mobile').is(':checked') ? 'T' : 'F';
		
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
			disp_menu: _disp_menu,
			disp_portlet: _disp_portlet,
			disp_mobile: _disp_mobile,
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
				'					<li id="alarm_sys_mng">통합알림 시스템 관리</li>' +
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
			'							<button id="alarm_sys_upload_btn" style="display: none; width: auto;border-radius: 10px;text-align: center;padding: 0 27px;margin-right: 0;margin-left: 10px;height: 38px;font-size: 13.5px;font-weight: bold;border: none;color: rgba(255, 255, 255, 0.8);background-color: #71368d;">업로드</button>' +	
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
				
		}else if (_type == "alarm_sys_mng"){
			html +=
				'<thead>' +
				'	<tr>' +
				'		<th style="width: 100px" class="inb">아이콘</th>' +
				'		<th style="width: 100px" class="inb">시스템코드</th>' +
				'		<th style="width: 200px" class="inb">시스템명</th>' +
				'		<th style="width: 200px" class="inb">시스템구분</th>' +
				'		<th style="width: 100px" class="inb">im표시안함</th>' +
				'		<th style="width: 80px" class="inb">삭제</th>' +
				'		<th style="width: auto;" class="inb"></th>' +
				'	</tr>' +
				'</thead>' +
				'<tbody id="admin_log_list" class="menu-list-table">' +
				'</tbody>';
			
			select_html =
				'<option value="title">시스템명</option>';				
				
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
		$('#alarm_sys_upload_btn').hide();
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
		} else if (_type == "alarm_sys_mng"){
			$('#alarm_sys_upload_btn').show();			
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
	
	"show_alarm_sys_upload" : function(info){
		var _self = this;
		
		var html = 
			'<div id="alarm_sys_upload_layer" class="reg-menu-ly" style="width:870px;">' +
			'	<div class="layer-inner" style="padding:0;">' +
			'		<div class="btn-close pop_btn_close"></div>' +
			'		<h4>통합알림 시스템 등록</h4>' +
			'		<div class="layer-cont">' +
			'			<div class="left-cont">' + // 왼쪾 메뉴 S
			'				<div class="each" style="display:flex;">' +
			'					<div style="margin-right:7px;width:50%;">' +
			'						<div class="menu-title">시스템코드</div>' +
			'						<input id="reg_alarm_sys_code" placeholder="시스템코드를 입력하세요">' +
			'					</div>' +
			'					<div style="width:50%;">' +
			'						<div class="menu-title">시스템 아이콘 이미지</div>' +
			'						<div style="display:flex;">' +
			'							<div id="reg_alarm_icon" class="reg-menu-preview dropzone-previews"></div>' +
			'							<button id="reg_alarm_add_file" class="btn-menu">이미지 선택</button>' +
			'						</div>' +
			'					</div>' +
			'				</div>' +				
			'				<div class="each" style="display:flex;">' +
			'					<div style="margin-right:7px;width:50%;">' +
			'						<div class="menu-title">시스템명(한글)</div>' +
			'						<input id="reg_alarm_sys_title_kr" placeholder="시스템명(한글)을 입력하세요">' +
			'					</div>' +
			'					<div style="width:50%;">' +
			'						<div class="menu-title">시스템명(영문)</div>' +
			'						<input id="reg_alarm_sys_title_en" placeholder="시스템명(영문)을 입력하세요">' +
			'					</div>' +
			'				</div>' +			
			'				<div class="each">' +
			'					<div class="menu-title">시스템구분</div>' +
			'					<div style="display:flex;gap:30px;">' +
			'						<label><input type="checkbox" id="reg_alarm_sys" value="T" checked>미확인</label>' +
			'						<label><input type="checkbox" id="reg_unprocessed_sys" value="T">미처리</label>' +			
			'					</div>' +
			'				</div>' +				
			'				<div id="alarm_sys_wrap">' +
			'					<div class="each">' +
			'						<div class="menu-title">필터 타입</div>' +
			'						<div class="radio-wr">' +
			'							<label><input type="radio" name="alarm_sys_filter_type" class="with-gap" value="M" checked><span>발신자 메일 주소</span></label>' +
			'							<label><input type="radio" name="alarm_sys_filter_type" class="with-gap" value="T"><span>메일 제목</span></label>' +
			'							<label><input type="radio" name="alarm_sys_filter_type" class="with-gap" value="X"><span>없음</span></label>' +				
			'						</div>' +			
			'					</div>' +	
			'					<div class="each" id="filter_data">' +
			'						<div class="menu-title">필터 데이터</div>' +
			'						<div style="display:flex;">' +
			'							<input id="reg_filter_type_data" placeholder="발신자 메일 주소를 입력하세요">' +
			'							<button id="reg_filter_type_data_add" class="btn-menu">입력</button>' +
			'						</div>' +
			'						<div id="alarm_filter_type_data_wrap" style="display:none;">' +
			'							<ul id="alarm_filter_type_data_list" class="menu-usermng-wrap"></ul>' +
			'						</div>' +
			'					</div>' +
			'				</div>' +		
			'				<div id="unprocessed_sys_wrap" style="display:none;">' +
			'					<div class="each">' +
			'						<div class="menu-title">미처리 링크 URL</div>' +
			'						<input id="reg_unprocessed_link" placeholder="URL이 없으면 -none- 입력하세요">' +
			'					</div>' +
			'					<div class="each">' +
			'						<div class="menu-title">미처리 카운트 URL</div>' +
			'						<input id="reg_unprocessed_cntlink" placeholder="URL이 없으면 -none- 입력하세요">' +
			'					</div>' +
			'					<div class="each" style="display:none;">' +
			'						<div class="menu-title">미처리 응답 데이터 유형</div>' +
			'						<div class="radio-wr">' +
			'							<label><input type="radio" name="unprocessed_response_type" class="with-gap" value="json" checked><span>JSON</span></label>' +
			'							<label><input type="radio" name="unprocessed_response_type" class="with-gap" value="xml"><span>XML</span></label>' +
			'							<label><input type="radio" name="unprocessed_response_type" class="with-gap" value="text"><span>TEXT</span></label>' +				
			'						</div>' +			
			'					</div>' +				
			'				</div>' +					
			'			</div>' +	// 왼쪽 메뉴 E
			'			<div class="right-cont">' + // 오른쪽 메뉴 S
			'				<div class="each">' +
			'					<div class="menu-title">권한 (회사)</div>' +
			'					<div class="grant-com-sel-wrap"><span id="grant_com_allsel">전체선택</span> | <span id="grant_com_desel">선택해제</span></div>' +
			'					<div id="alarm_grant_com_wrap">' +
			'						<ul id="alarm_grant_com_list" class="menu-usermng-wrap grant-com-list" style="height:198px;"></ul>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">권한 (부서,개인)</div>' +
			'					<div style="display:flex;">' +
			'						<input id="reg_alarm_grant">' +
			'						<div class="btn-menu-grant-org"></div>' +
			'					</div>' +
			'					<div id="alarm_grant_wrap" style="display:none;">' +
			'						<ul id="alarm_grant_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<label><input type="checkbox" id="menu_disable_im" value="T">im사번 표시 안함</label>' +
			'				</div>' +			
			'				<div class="each">' +
			'					<div class="menu-title">담당자</div>' +
			'					<div style="display:flex;">' +
			'						<input id="reg_alarm_mng">' +
			'						<div class="btn-menu-mng-org"></div>' +
			'					</div>' +
			'					<div id="alarm_mng_user_wrap" style="display:none;">' +
			'						<ul id="alarm_mng_user_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +
			'				</div>' +			
			'				<div class="each">' +
			'					<div class="menu-title">설명</div>' +
			'					<textarea id="reg_alarm_sys_desc"></textarea>' +
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
		$('#alarm_sys_upload_layer').css('z-index', block_idx + 1);
		
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
				$('#alarm_grant_com_list').html(_company);
			}
		});		

		var is_edit = (info ? true : false);
		var is_mobile = false;
		this.alarm_sys_upload_event(is_edit, is_mobile);
		
		// 편집으로 여는 경우
		if (is_edit) {
			$('#reg_alarm_sys_code').val(info.noti_id).prop('readonly', true);
			$('#reg_alarm_sys_code').data('cdt', info.cdt);
			$('#reg_alarm_sys_title_kr').val(gap.textToHtml(info.nm));
			$('#reg_alarm_sys_title_en').val(gap.textToHtml(info.enm));
			$('#reg_unprocessed_link').val(info.link);
			$('#reg_unprocessed_cntlink').val(info.cntlink);			
			$('#reg_alarm_sys_desc').val(gap.textToHtml(info.desc));
			
			// 시스템 구분
			if (info.alarm_sys == 'T'){
				$('#reg_alarm_sys').prop('checked', true);
				$('#alarm_sys_wrap').show();
			}else{
				$('#reg_alarm_sys').prop('checked', false);
				$('#alarm_sys_wrap').hide();
			}
			
			if (info.unprocessed_sys == 'T'){
				$('#reg_unprocessed_sys').prop('checked', true);
				$('#unprocessed_sys_wrap').show();
			}else{
				$('#reg_unprocessed_sys').prop('checked', false);
				$('#unprocessed_sys_wrap').hide();
			}
			
			// 아이콘
			var icon_src = gap.channelserver + "/alarmcenter_icon.do?code=" + info.noti_id + '&ver=' + info.udt;
			var preview_icon = '<div class="menu-preview-icon" style="background-image:url(' + icon_src + ')"></div>';
			$('#reg_alarm_icon').append(preview_icon);
			
			// 타입
			if (info.sel){
				$('input[name="alarm_sys_filter_type"][value="' + info.sel + '"]').prop('checked', true);
				if (info.sel == "X"){
					$('#filter_data').hide();
				}
			}else{
				$('input[name="alarm_sys_filter_type"][value="X"]').prop('checked', true);
				$('#filter_data').hide();
			}

			// 타입 데이터
			if (info.sel == "M"){
				if (info.em){
					$.each(info.em, function(idx, val){
						_self.add_alarm_type_data(val);
					});
				}
			}else if (info.sel == "T"){
				if (info.txt){
					$.each(info.txt, function(idx, val){
						_self.add_alarm_type_data(val);
					});
				}				
			}
			
			// 미처리 응답 타입
			if (info.res_sel){
				$('input[name="unprocessed_response_type"][value="' + info.res_sel + '"]').prop('checked', true);
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
					_self.add_alarm_grant(this);
				});
			}
			
			// 담당자 정보 입력
			if (info.manager) {
				$.each(info.manager, function(){
					_self.add_alarm_mnguser(this);					
				});
			}			
			
			// im사번 표시
			if (info.im_disable == 'T') {
				$('#menu_disable_im').prop('checked', true);
			}			
		}
	},

	"hide_alarm_sys_upload" : function(){
		$('#alarm_sys_upload_layer').remove();
		
		var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
		var block_idx = parseInt($('#blockui').css('z-index'));
		
		// Admin 페이지가 열려있는 상황인 경우 처리
		if (admin_menu_idx && block_idx) {
			$('#admin_log_layer').css('z-index', block_idx+1);
		}
	},
	
	"alarm_sys_remove" : function(code, sys_nm, sys_sel){
		var _self = this;
		var _url = gap.channelserver + "/alarmcenter_delete.km";
		
		gap.showConfirm({
			title: '메뉴삭제',
			//iconClass: 'remove',
			contents: '<span>' + sys_nm + '</span><br>시스템을 정말 삭제할까요?',
			callback: function(){
				gap.show_loading('처리 중');
				
				$.ajax({
					type: 'POST',
					url: _url,
					dataType: 'json',
					data: JSON.stringify({noti_id: code}),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success: function(res){
					//	mobiscroll.toast({message:'삭제되었습니다', color:'info'});
						
						$('#show_loading_layer').remove();
						var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
						var block_idx = parseInt($('#blockui').css('z-index'));
						
						// Admin 페이지가 열려있는 상황인 경우 처리
						if (admin_menu_idx && block_idx) {
							$('#admin_log_layer').css('z-index', block_idx+1);
						}
						
						_self.draw_admin_log_list(_self.cur_page);
						
						// 노츠 문서 삭제
						var surl = location.protocol + "//" + window.mailserver + "/" + window.profiledbpath + "/sendAlarmProfileMng?OpenForm";
						var postData = {
								"__Click":"0",
								"%%PostCharset":"UTF-8",
								"SaveOptions":"0",
								"Action": "Delete",
								"Code": code,
								"Select": (sys_sel == "X" ? "M" : sys_sel)
							};
						$.ajax({
							type : "POST",
							url : surl,
							dataType : "json",
							data : postData,
							success : function(__res){
								var res = __res;	//JSON.parse(__res);
								if (res.success){
									mobiscroll.toast({message:'삭제되었습니다', color:'info'});
									return false;
								}else{
									// do nothing...
								}
							},
							error : function(e){
								gap.gAlert(gap.lang.errormsg);
								return false;
							}
						});
						
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
	
	"alarm_sys_upload_event" : function(is_edit, is_mobile){
		var _self = this;
		
		// 이벤트 처리
		var $menu_ly = $('#alarm_sys_upload_layer');
		$menu_ly.find('.btn-close').on('click', function(){
			_self.hide_alarm_sys_upload();
		});
		
		// 시스템 구분 - 미확인 체크 시
		$("#reg_alarm_sys").on("change", function(){
			if (this.checked){
				$('#alarm_sys_wrap').show()
			}else{
				$('#reg_filter_type_data').val('');
				$('#alarm_filter_type_data_list').empty();
				$('#alarm_sys_wrap').hide()
			}
		});
		
		// 시스템 구분 - 미처리 체크 시
		$("#reg_unprocessed_sys").on("change", function(){
			if (this.checked){
				$('#unprocessed_sys_wrap').show()
			}else{
				$('#reg_unprocessed_link').val('');
				$('#reg_unprocessed_cntlink').val('');					
				$('#unprocessed_sys_wrap').hide()
			}
		});		
		
		// 필터 타입 변경 시
		$("input[name='alarm_sys_filter_type']").on("change", function(){
			$('#alarm_filter_type_data_list').empty();
			$('#alarm_filter_type_data_wrap').hide();
			
			if ($(this).val() == 'X'){
				$('#filter_data').hide();
			}else{
				$('#filter_data').show();
				if ($(this).val() == 'M'){
					$("#reg_filter_type_data").attr("placeholder", "발신자 메일 주소를 입력하세요");
					
				}else if ($(this).val() == 'T'){
					$("#reg_filter_type_data").attr("placeholder", "메일 제목을 입력하세요");
				}
			}
		});		
		
		// 타입 데이터 입력
		$('#reg_filter_type_data').on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			var terms = $.trim($(this).val());
			if (terms == '') return;
			
			_self.add_alarm_type_data(terms);
			$('#reg_filter_type_data').focus();		
			$(this).val('');
		});
		
		// 타입 데이터 입력- 버튼 이용
		$('#reg_filter_type_data_add').on('click', function(){
			var terms = $.trim($('#reg_filter_type_data').val());
			if (terms == '') return;
			
			_self.add_alarm_type_data(terms);
			$('#reg_filter_type_data').focus();		
			$('#reg_filter_type_data').val('');			
		});		
		
		if (window.myDropzone_alarmico) {
			myDropzone_alarmico.destroy();
			myDropzone_alarmico = null;
		}
		
		var _url = gap.channelserver + "/FileControl_alarmcenter.do";
		var selectid = 'reg_alarm_icon';
		window.myDropzone_alarmico = new Dropzone("#" + selectid, { // Make the whole body a dropzone
			url: _url,
			autoProcessQueue: false, 
			parallelUploads: 100, 
			maxFiles: 1,
			maxFilesize: 1024,
			timeout: 180000,
			uploadMultiple: true,
			acceptedFiles: 'image/png',
			withCredentials: false,
			previewsContainer: "#reg_alarm_icon",
			clickable: "#" + selectid,
			renameFile: function(file){		
				return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			},
			init: function() {
				myDropzone_alarmico = this;
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
				_self.reg_alarm_sys_save();
			},
			error: function(){
				
			}
		});
		
		myDropzone_alarmico.is_edit = is_edit;
		
		myDropzone_alarmico.on("totaluploadprogress", function(progress) {	
			//$("#show_loading_progress").text(parseInt(progress) + "%");
		});
		
		myDropzone_alarmico.on("addedfiles", function (file) {
			// 파일은 하나만 저장되도록 처리함
			if (myDropzone_alarmico.files.length >= 2) {
				myDropzone_alarmico.removeFile(myDropzone_alarmico.files[0]);
			}
			
			// 편집상태인 경우 기존 등록한 미리보기 엘리먼트 삭제
			$('#reg_alarm_icon .menu-preview-icon').remove();
		});
		
		myDropzone_alarmico.on("sending", function (file, xhr, formData) {
			gap.show_loading(gap.lang.saving);
			
			//$("#"+selectid).css("border", "");
			
			var _code = $.trim($('#reg_alarm_sys_code').val());
			formData.append("noti_id",_code);
		});
		
		// 파일추가
		$('#reg_alarm_add_file').on('click', function(){
			$('#reg_alarm_icon').click();
		});
		
		// 담당자 입력
		$('#reg_alarm_mng').on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			var terms = $.trim($(this).val());
			if (terms == '') return;
			
			var users = terms.split(',');
			
			gsn.requestSearch('', terms, function(res){
				$.each(res, function(){
					_self.add_alarm_mnguser(this);
				});
				$('#reg_alarm_mng').focus();				
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
							_self.add_alarm_mnguser(_res);
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
			$('#alarm_grant_com_list input[type="checkbox"]').prop('checked', true);
		});
		$('#grant_com_desel').on('click', function(){
			$('#alarm_grant_com_list input[type="checkbox"]').prop('checked', false);
		});
		
		// 권한 등록
		$('#reg_alarm_grant').on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			var terms = $.trim($(this).val());
			if (terms == '') return;
			
			var users = terms.split(',');
			
			gsn.requestSearch('', terms, function(res){
				$.each(res, function(){
					_self.add_alarm_grant(this);
				});
				$('#reg_alarm_grant').focus();				
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
							_self.add_alarm_grant(_res);
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

			var valid = _self.reg_alarm_sys_valid();
			
			if (!valid) {
				$this.removeClass('process');
				return false;
			}
			
			if (is_edit) {

				_save_alarm_sys();
				
			} else {
				var _code = $.trim($('#reg_alarm_sys_code').val());
				var check_url = gap.channelserver + "/alarmcenter_dual_check.km";
				$.ajax({
					type: "POST",
					async: false,
					url: check_url,
					dataType : "json",
					data : JSON.stringify({noti_id:_code}),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success: function(res){
						if (res.data.data.exist == 'T') {
							mobiscroll.toast({message:"중복된 시스템코드가 있습니다.", color:"danger"});
							$('#reg_alarm_sys_code').focus();
							$this.removeClass('process');
						} else {
							
							// 시스템코드 중복 체크 후 최종 저장하는 부분
							_save_alarm_sys();							
						}
					},
					error: function(){
						mobiscroll.toast({message:"시스템코드 중복 체크 수행중 오류가 발생했습니다", color:"danger"});
						$this.removeClass('process');
					}
				});
			}			
		});
		
		function _save_alarm_sys(){
			if (myDropzone_alarmico.files.length == 0){
				_self.reg_alarm_sys_save();
			}else{
				myDropzone_alarmico.processQueue();
			}
		}		
	},	
	
	"reg_alarm_sys_valid" : function(){
		var _code = $.trim($('#reg_alarm_sys_code').val());
		if (_code == '') {
			alert('시스템코드를 입력해주세요');
			$('#reg_alarm_sys_code').focus();
			return false;
		}
		
		var _title_kr = $.trim($('#reg_alarm_sys_title_kr').val());
		if (_title_kr == '') {
			alert('시스템명(한글)을 입력해주세요');
			$('#reg_alarm_sys_title_kr').focus();
			return false;
		}
		
		var _title_en = $.trim($('#reg_alarm_sys_title_en').val());
		if (_title_en == '') {
			alert('시스템명(영문)을 입력해주세요');
			$('#reg_alarm_sys_title_en').focus();
			return false;
		}		
		
		// 이미지 선택 여부
		// 신규 등록인데 이미지가 없으면 안됨
		if (!myDropzone_alarmico.is_edit && myDropzone_alarmico.files.length == 0) {
			alert('시스템 아이콘 이미지를 선택해주세요');
			$('#reg_alarm_add_file').click();
			return false;
		}
		
		var _alarm_sys = $('#reg_alarm_sys').is(':checked');
		var _unprocessed_sys = $('#reg_unprocessed_sys').is(':checked');
		if (!_alarm_sys && !_unprocessed_sys){
			alert('시스템 구분을 선택해주세요');
			return false;
		}
		
		// 필터 타입 데이터
		if (_alarm_sys){
			var _type = $('input[name="alarm_sys_filter_type"]:checked').val();
			if (_type != 'X'){
				var _type_data = $('#alarm_filter_type_data_list').find('.file_remove_btn').length;
				if (_type_data == 0){
					alert('필터 데이터를 입력해주세요');
					$('#reg_filter_type_data').focus();
					return false;
				}			
			}			
		}
		
		if (_unprocessed_sys){
			var _link_url = $.trim($('#reg_unprocessed_link').val());
			if (_link_url == '') {
				alert('미처리 링크 URL을 입력해주세요');
				$('#reg_unprocessed_link').focus();
				return false;
			}
			
			var _cntlink_url = $.trim($('#reg_unprocessed_cntlink').val());
			if (_cntlink_url == '') {
				alert('미처리 카운트 URL을 입력해주세요');
				$('#reg_unprocessed_cntlink').focus();
				return false;
			}
		}

		return true;
	},
	
	"reg_alarm_sys_save" : function(is_edit){
		// 최종 완료 처리
		var _self = this;
		
		gap.show_loading('');
		
		var _code = $.trim($('#reg_alarm_sys_code').val());
		var _title_kr = $.trim($('#reg_alarm_sys_title_kr').val());
		var _title_en = $.trim($('#reg_alarm_sys_title_en').val());
		var _cdt = $('#reg_alarm_sys_code').data('cdt');
		var _type = $('input[name="alarm_sys_filter_type"]:checked').val();
		var _res_type = $('input[name="unprocessed_response_type"]:checked').val();
		var _link = $.trim($('#reg_unprocessed_link').val());
		var _cntlink = $.trim($('#reg_unprocessed_cntlink').val());	
		var _desc = $.trim($('#reg_alarm_sys_desc').val());
		var _type_data = [];		
		var _mng_user = [];
		var _readers_all = [];
		var _readers_company = [];
		var _readers_deptuser = [];
		var _im_disable = $('#menu_disable_im').is(':checked') ? 'T' : 'F';
		var _alarm_sys = $('#reg_alarm_sys').is(':checked') ? 'T' : 'F';
		var _unprocessed_sys = $('#reg_unprocessed_sys').is(':checked') ? 'T' : 'F';
		
		if (_type == "X"){
			_type_data.push(this.dummy_email);
		}else{
			$.each($("#alarm_filter_type_data_list").children(), function(idx, val){
				var _info = $(val).data("info");
				_type_data.push(_info);
			});			
		}
		
		// 담당자
		$('#alarm_mng_user_list li').each(function(){
			_mng_user.push($(this).data('info'));
		});
		
		// 권한 (회사)
		$('#alarm_grant_com_list input[type="checkbox"]:checked').each(function(){
			_readers_all.push($(this).val() + "");
			_readers_company.push($(this).val() + "");
		});
		// 권한 (부서,개인)
		$('#alarm_grant_list li').each(function(){
			_readers_all.push($(this).data('key') + "");
			_readers_deptuser.push($(this).data('info'));
		});
		// 권한 설정 안한경우 전체 권한 부여
		if (_readers_all.length == 0) {
			_readers_all.push('all');
		}		
		
		var obj = {
			noti_id: _code,
			nm: _title_kr,
			enm: _title_en,
			sel: _type,
			em: (_type == "M" || _type == "X" ? _type_data : []),
			txt: (_type == "T" ? _type_data : []),
			res_sel: _res_type,
			link: _link,
			cntlink: _cntlink,			
			desc: _desc,
			manager: _mng_user,
			readers: _readers_all,
			readers_company: _readers_company,
			readers_deptuser: _readers_deptuser,
			im_disable: _im_disable,
			alarm_sys: _alarm_sys,
			unprocessed_sys: _unprocessed_sys,
			cdt: _cdt ? _cdt : moment().format('YYYYMMDDHHmmss'),
			udt: moment().format('YYYYMMDDHHmmss')
		};
		
		var _url = gap.channelserver + "/alarmcenter_save.km";
		
		// 프로파일 문서 관리용 데이터(메일 도착전 에이전트에서 사용하는 프로파일 문서) ///////////
		var surl = location.protocol + "//" + window.mailserver + "/" + window.profiledbpath + "/sendAlarmProfileMng?OpenForm";
		var postData = {
				"__Click":"0",
				"%%PostCharset":"UTF-8",
				"SaveOptions":"0",
				"Action": "Save",
				"Code": obj.noti_id,
				"Name": obj.nm,
				"Select": (obj.sel == "X" ? "M" : obj.sel),
				"Mail": (obj.em != "" ? obj.em.join("-spl-") : ""),
				"Title": (obj.txt != "" ? obj.txt.join("-spl-") : ""),
				"Desc": obj.desc
			};
		/////////////////////////////////////////////////////////

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
			//	mobiscroll.toast({message:'저장되었습니다', color:'info'});
				$('#show_loading_layer').remove();
				$('#alarm_sys_upload_layer .btn-close').click();

				// 리스트를 새로고침해야 함
				_self.draw_admin_log_list(_self.cur_page);
				
				// 시스템 구분 - 미확인이 케크된 경우 실행
				if (_alarm_sys == "T"){
					$.ajax({
						type : "POST",
						url : surl,
						dataType : "json",
						data : postData,
						success : function(__res){
							var res = __res;	//JSON.parse(__res);
							if (res.success){
								mobiscroll.toast({message:'저장되었습니다', color:'info'});
								return false;
							}else{
								// do nothing...
							}
						},
						error : function(e){
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					});
				}else{
					mobiscroll.toast({message:'저장되었습니다', color:'info'});
					return false;
				}
			},
			error: function(){
				
			}
		});
	},
	
	"add_alarm_type_data" : function(txt){	// 필터 추가
		var $list = $('#alarm_filter_type_data_list');
		var ck = $list.find('li[data-key="' + encodeURIComponent(txt) + '"]');
		if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
		
		var _type = $('input[name="alarm_sys_filter_type"]:checked').val();
		if (_type == 'M'){
			if (!gap.isValidEmail(txt)){
				alert('정확한 이메일 주소를 입력해주세요');
				return false;
			}			
		}
		
		var html =
			'<li class="f_between" data-key="' + encodeURIComponent(txt) + '">' +
			'	<span class="txt ko" style="width: calc(100% - 20px);"><a style="text-decoration:none;cursor:text;">' + txt + '</a></span>' +
			'	<button class="file_remove_btn"></button>' +
			'</li>';
		
		var $li = $(html);
		
		$li.data('info', txt);
		$li.find('.file_remove_btn').on('click', function(){
			$(this).closest('li').remove();

			if ($list.find('li').length == 0) {
				$('#alarm_filter_type_data_wrap').hide();
			}
		});
		
		$list.append($li);
		$('#alarm_filter_type_data_wrap').show();
	},
	
	"add_alarm_mnguser" : function(user_info){	// 담당자 추가
		var $list = $('#alarm_mng_user_list');
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
				$('#alarm_mng_user_wrap').hide();
			}
		});
		
		$list.append($li);
		$('#alarm_mng_user_wrap').show();
	},	
	
	"add_alarm_grant" : function(user_info){	// 권한 추가
		var $list = $('#alarm_grant_list');
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
				$('#alarm_grant_wrap').hide();
			}
		});
		
		$list.append($li);
		$('#alarm_grant_wrap').show();
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
		}else if (gcom.admin_log_menu == "alarm_sys_mng"){
			var surl = gap.channelserver + "/alarmcenter_list.km";
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
						var _key = _info.noti_id;
						var _icon_src = gap.channelserver + "/alarmcenter_icon.do?code=" + _key + '&ver=' + _info.udt;
						var _icon_img = '<div class="menu-list-icon-preview" style="background-image:url(' + _icon_src + ');"></div>';
						_icon_img = '<div class="menu-list-icon-preview-wrap" style="background-color:' + (_info.bg ? _info.bg : _default_bg) + '">' + _icon_img + '</div>';
						var sys_kind = [];
						if (_info.alarm_sys == 'T'){
							sys_kind.push("미확인");
						}
						if (_info.unprocessed_sys == 'T'){
							sys_kind.push("미처리");
						}
						
						var _html = "";					
						_html += '<tr id="' + _info._id.$oid + '" class="menu-list-tr">';
						_html += '	<td>' + _icon_img + '</td>';
						_html += '	<td>' + _key + '</td>';
						_html += '	<td>' + _info.nm + '</td>';
						_html += '	<td>' + sys_kind.join(', ') + '</td>';
						_html += '	<td>' + (_info.im_disable == 'T' ? '✔' : '') + '</td>';
						_html += '	<td><button type="button" class="btn-menu-remove" data-key="' + _key + '" data-sel="' + _info.sel + '" data-name="' + _info.nm + '">삭제</button></td>';
						_html += '	<td><span></span></td>';
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
				url: gcom.gptserver + '/folder/intent_list',
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
						var _key = _info._id;
						var _code = _info.code;
						var _html = "";					
						_html += '<tr id="' + _info._id + '" class="menu-list-tr">';
						_html += '	<td>' + _code + '</td>';
						_html += '	<td>' + _info.menu + '</td>';
						_html += '	<td style="text-align:left;">' + _info.msg + '</td>';
						_html += '	<td>' + (_info.use_brief == "T" ? "사용" : "사용 안함") + '</td>';
						_html += '	<td><button type="button" class="btn-menu-remove" data-key="' + _key + '" data-code="' + _code + '" data-name="' + _info.menu + '">삭제</button></td>';
						_html += '</tr>';
						
						$layer.find("#admin_log_list").append(_html);
						$layer.find("#" + _info._id).data('info', _info);
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
			} else if (gcom.admin_log_menu == "alarm_sys_mng") {
				_self.show_alarm_sys_upload(_info);				
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
	
	"getUserMailPath" : function(){
		var sel_user = $('#todo_work_area').find('.user_status_wrap.emp_item.select');

		// 선택된 사용자가 없는 경우 내 mailfile정보를 리턴
		if (sel_user.length == 0) { return window.mailfile; }
		
		var info = sel_user.data('info');
		if (!info) { return; }
		
		return info.mf;
	},
	
	"getValueByName" : function(dest, name){
		var res = '';
		if (dest.entrydata) {
			$.each(dest.entrydata, function(idx, val) {
				if (val['@name'] == name) {
					//복수값인 경우 첫번째 배열값만 가져오기
					if (val['datetimelist']) {
						res = val['datetimelist']['datetime'][0]['0'];
					} else if (val['textlist']) {
						res = val['textlist']['text'][0]['0'];
					} else if (val['numberlist']) {
						res = val['numberlist']['number'][0]['0'];
					} else {
						var _temp = val['datetime'] || val['number'] || val['text'] || {'0' : ''};
						res = _temp['0'];
					}
					return false;
				}
			});
		}
		return res;
	},
	
	"getEventJson" : function(val){
		var _self = this;
		var data = {};
		data.id				= val['@unid'];
		data.start 			= _self.getValueByName(val, '$144');
		data.start 			= (data.start == '' ? _self.getValueByName(val, '$134') : data.start);

		data.date_type 		= _self.getValueByName(val, '_DateType');
		data.date_type 		= data.date_type == undefined || data.date_type == "undefined" ? "" : data.date_type;
		
		var _allday	 		= _self.getValueByName(val, '_AllDay');
		data.allday			= data.apt_type == '1' || (data.apt_type == '2' && data.date_type != '2') || _allday == '1' ? true : false;
		
		data.end			= _self.getValueByName(val, '$146');
		data.title 			= _self.getValueByName(val, '$147').replace(/\[\$NOSUBJECT\$\]/g, gap.lang.no_subject); // TODO(lang)
		
		data.type 			= _self.getValueByName(val, '$Type');
		data.apt_type 		= _self.getValueByName(val, '$152');
		data.colorinfo 		= _self.getValueByName(val, '$Color').split('|');
		data.chair			= _self.getValueByName(val, 'Chair_id');
		data.owner			= _self.getValueByName(val, 'Owner_id');
		data.attendee		= _self.getValueByName(val, '$Custom').split('|')[0];
		data.location		= _self.getValueByName(val, '$Custom').split('|')[1];
		data.notice_type	= _self.getValueByName(val, '$Custom').split('|')[2];
		data.org_confideltial = _self.getValueByName(val, '$154');
		data.ShowPS 		= _self.getValueByName(val, '_ShowPS');			
		data.chair_notesid 	= _self.getValueByName(val, '_ChairNotesID');
		data.sd				= _self.getValueByName(val, '$StartDate');
		data.ed				= _self.getValueByName(val, '$EndDate');
		data.apt_cate		= _self.getValueByName(val, '_ApptCategory');
		
		
		data.completed		= _self.getValueByName(val, '_Completion');
		data.priority		= _self.getValueByName(val, '_Priority');
		data.system_code	= _self.getValueByName(val, '_SystemCode');
		data.system_key		= _self.getValueByName(val, '_SystemKeyCode');
		
		
		data.allDay			= data.allday;
		
		// 변환처리
		data.title = gap.HtmlToText(data.title);
		
		
		//시작일이 없으면 가져오지 않음
		if (data.start == '') {
			return false;
		}
		
		//iNotes 일정에 저장된 휴일 정보는 가져오지 않음
		if (data.type == 'Holiday') {
			return false;
		}				
		
		var _ori_start = moment(data.start).utc().format("YYYYMMDDTHHmmss")+",00Z"
		var _ori_end = moment(data.end).utc().format("YYYYMMDDTHHmmss")+",00Z"
		
		data.start = moment(_ori_start.split(',')[0] +'Z');
		data.end = data.end == '' ? '' : moment(_ori_end.split(',')[0] + 'Z');

		
		
		if (data.allday) {
			// 종일 일정은 타임존 계산안되도록 예외 처리 (사용자가 설정한 날짜 그대로 표시)
			if (data.sd) {
				if (data.sd.indexOf('T') > 0) data.sd = data.sd.substring(0, data.sd.indexOf('T'));
				data.start = moment(data.sd);
			}
			if (data.ed) {
				if (data.ed.indexOf('T') > 0) data.ed = data.ed.substring(0, data.ed.indexOf('T'));
				data.end = moment(data.ed);
			}
		} 
		
		// 다른 사람의 일정을 표시할 때는 시간만 공개인지 확인
		if (window.mailfile != this.getUserMailPath()) {
			if (data.ShowPS == '2') {
				data.title = gap.lang.private_schedule2;
			}
		}
		
		return data;
	},
	
	"getTaskJson" : function(val){
		var _self = this;
		var data = {};
		
		data.start 			= _self.getValueByName(val, '$StartDateTime');
		data.end			= _self.getValueByName(val, '$EndDateTime');
		data.allday			= _self.getValueByName(val, '_AllDay') == '1' ? true : false;
		data.title 			= _self.getValueByName(val, '$Subject').replace(/\[\$NOSUBJECT\$\]/g, gap.lang.no_subject);
		data.work			= _self.getValueByName(val, '_ShowPS') != '2' ? true : false;
		data.key			= _self.getValueByName(val, '$KeyCode');
		
		return data;
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
			'				<div class="each">' +
			'					<div class="menu-title">메뉴표시</div>' +
			'					<div style="display:flex">' +
			'						<label style="margin-right:20px;"><input type="checkbox" id="disp_mobile" value="T">모바일</label>' +
			'						<label><input type="checkbox" id="disp_pc" value="T">PC</label>' +
			'					</div>' +
			'				</div>' +					
			'			</div>' +	// 왼쪽 메뉴 E
			'			<div class="right-cont" id="set_auth">' + // 오른쪽 메뉴 S
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
			'			<div class="right-cont" id="llm_prompt" style="display:none;">' + // 오른쪽 메뉴 S
			'				<div class="each">' +
			'					<div class="menu-title">LLM 1</div>' +
			'					<div style="display:flex">' +
			'						<div class="input-field selectbox t_sec_sel" style="width:100%;">' +
			'							<select id="reg_category_field">' +
			'							</select>' +
			'						</div>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">LLM 2</div>' +
			'					<div style="display:flex">' +
			'						<div class="input-field selectbox t_sec_sel" style="width:100%;">' +
			'							<select id="reg_category_field2">' +
			'							</select>' +
			'						</div>' +
			'					</div>' +
			'				</div>' +			
			'				<div class="each">' +
			'					<div class="menu-title">프롬프트</div>' +
			'					<textarea id="reg_intent_prompt_desc"></textarea>' +
			'				</div>' +	
			'			</div>' +	//오른쪽 메뉴 E			
			'		</div>' +
			'		<div style="margin-top:20px;text-align:center;">' +
			'			<button class="btn-ok">확인</button>' +
			'			<button class="btn-etc" id="btn_prompt">프롬프트</button>' +			
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
		
		// LLM 가져오기
		var surl = root_path + "/llm_list.km";
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
				
				_html += '<option value="none">없음</option>';
				
				for (var i = 0; i < _list.length; i++){
					var _info = _list[i];						
									
					_html += '<option value="' + _info.model + '">' + _info.model + '</option>';
				}
				$("#reg_category_field").html(_html);
				$("#reg_category_field2").html(_html);
				$("#reg_category_field").material_select();
				$("#reg_category_field2").material_select();
					
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
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
			$('#reg_menu_code').data('key', info._id);
			$('#reg_menu_name_kr').val(gap.textToHtml(info.menu));
			$('#reg_menu_name_en').val(gap.textToHtml(info.menu_en));
			$('#reg_msg_kr').val(info.msg);
			$('#reg_msg_en').val(info.msg_en);
			$('#reg_category_field').val(info.model).material_select();
			$('#reg_category_field2').val(info.model2).material_select();
			$('#reg_intent_prompt_desc').val(info.content);
			
			if (info.disp_mobile == 'T') {
				$('#disp_mobile').prop('checked', true);
			}
			
			if (info.disp_pc == 'T') {
				$('#disp_pc').prop('checked', true);
			}			
			
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
					url: gcom.gptserver + '/folder/intent_delete',
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
		
		// 프롬프트 클릭
		$intent_ly.find('.btn-etc').on('click', function(){
			var $this = $(this);
			
			if ($('#set_auth').css('display') !== 'none'){
				$this.text('프롬프트 닫기');
				$('#set_auth').hide();
				$('#llm_prompt').show();
			}else{
				$this.text('프롬프트');
				$('#set_auth').show();
				$('#llm_prompt').hide();				
			}	

		});		
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
		var _disp_mobile = $('#disp_mobile').is(':checked') ? 'T' : 'F';
		var _disp_pc = $('#disp_pc').is(':checked') ? 'T' : 'F';
		var _sort = $('#reg_menu_code').data('sort');
		var _msg_kr = $.trim($('#reg_msg_kr').val());
		var _msg_en = $.trim($('#reg_msg_en').val());
		var _refer = [];
		var _mng_user = [];
		var _readers_all = [];
		var _readers_company = [];
		var _readers_deptuser = [];
		var _im_disable = $('#menu_disable_im').is(':checked') ? 'T' : 'F';
		var _llm_code = $.trim($('#reg_category_field').val());
		var _llm_code2 = $.trim($('#reg_category_field2').val());
		var _prompt = $.trim($('#reg_intent_prompt_desc').val());
		
		var $intent_ly = $('#intent_upload_layer');
		var $sel_type = $intent_ly.find('.type_list.on');
		var _use_brief = $sel_type.data('value');
		
		// Refer
		$('#menu_mng_user_list li').each(function(){
			_refer.push($(this).data('txt') + "");
		});

		// 담당자 <== Refer랑 겹쳐서 주석처리한다. 2025년 2월 3일
	//	$('#menu_mng_user_list li').each(function(){
	//		_mng_user.push($(this).data('info'));
	//	});
		
		// 권한 (회사)
		$('#menu_grant_com_list input[type="checkbox"]:checked').each(function(){
			_readers_all.push($(this).val() + "");
			_readers_company.push($(this).val() + "");
		});
		// 권한 (부서,개인)
		$('#menu_grant_list li').each(function(){
			_readers_all.push($(this).data('key') + "");
			delete $(this).data('info')["_id"]
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
			disp_mobile: _disp_mobile,
			disp_pc: _disp_pc,
			msg: _msg_kr,
			msg_en: _msg_en,
			ref: _refer,		
			use_brief: _use_brief,
			readers: _readers_all,
			readers_company: _readers_company,
			readers_deptuser: _readers_deptuser,
			train: "F",
			model: _llm_code,
			model2: _llm_code2,
			content: _prompt,
			update: (is_edit ? "T" : "F"),
			im_disable: _im_disable,
			sort: _sort ? _sort : moment().format('YYYYMMDDHHmmss'),	// 소트는 처음 생성시 만들어지고 업데이트 안함
			//sort: moment().format('YYYYMMDDHHmmss'),
			last_update: moment().format('YYYYMMDDHHmmss')
		};

		$.ajax({
			type: 'POST',
			url: gcom.gptserver + '/folder/intent_save',
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
	
	//섭씨기온과 풍속을 활용해 체감온도를 리턴해주는 함수
	"calculateWindChill": function(temperature, windSpeed) {
		// 온도와 풍속을 기준으로 체감온도를 계산합니다.
	    if (temperature > 10 || windSpeed <= 4.8) {
	        // 체감 온도 공식은 기온이 10도 이하, 풍속이 4.8 km/h 이상일 때 적용됩니다.
	        return temperature;
	    }
	
	    const windChill = 13.12 + 0.6215 * temperature - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temperature * Math.pow(windSpeed, 0.16);

	    return windChill.toFixed(1);
	},
	
	//통합검색 결과 그리는 함수
	"search_result_draw": function(keyWord){
		
		$.ajax({
			type: "GET",
			url: root_path +  "/resource/data/search_res_data.txt",
			dataType: "json",
			success: function(data){
				
				//url에 검색키워드 파라미터 붙이기
				/*history.pushState(null, null, location.href + "search?keyword=" + keyWord);*/
				
				$("#search_res_box").remove();
				
				$("#search_layer").hide(); // 통합검색 레이어 숨김
				$("#input_search").val(""); // 검색어 입력창 비우기
				
				console.log(">>>>>>>검색키워드: " + keyWord);
					
				var html = '';
				
				html += "<div id='search_res_box'>";
				html += "	<div class='inner'>";
				html += "		<div id='search_res_area'>";
				html += "			<div class='search_res_area_inner'>";
				html += "				<button type='button' id='btn_ai_sidebar_toggle'><span class='arrow_img'></span></button>";
				html += "				<div class='res_content_container_wrap'>";
				
				html += "					<div id='search_res_input_wrap'>";
				html += "						<div id='res_box_inputBox' class='search_box'>";
				html += "							<select name='res_search_selectmenu' id='res_box_selectmenu'>";
				html += "								<option>통합검색</option>";
				html += "								<option>제목</option>";
				html += "								<option>제목+내용</option>";
				html += "							</select>";
				html += "							<input type='text' id='input_res_box_search' class='search_input' placeholder='검색어를 입력해주세요' value='K-GPT 서버 사양은 어떻게 되나'></input>";
				html += "							<div class='btn_wrap'>";
				html += "								<button type='button' class='mic_search_btn'></button>";
				html += "								<button type='button' id='btn_res_box_search' class='search_btn'><span>검색</span></button>";
				html += "							</div>";
				html += "						</div>";
				html += "					</div>";
				
				html += "					<div id='res_content_container'>";
				html += "						<div class='search_res_length_box'>";
				html += "							<span class='search_img'></span><div class='search_res_length_txt'><strong class='search_keyword'>" + keyWord + "</strong>에 대한 <strong class='search_res_length'>" + data.length + "</strong>건의 검색결과가 있습니다.</div>";
				html += "						</div>";
				html += "						<div class='res_content_wrap'>";
				html += "							<div id='res_category_ul'>";
				html += "								<li class='res_category active'><span>전체(23)</span></li>";
				html += "								<li class='res_category'><span>직원(15)</span></li>";
				html += "								<li class='res_category'><span>게시판(13)</span></li>";
				html += "								<span class='indicator_bar'></span>";
				html += "							</div>";
				
				html += "							<div id='ai_search_result' class='ai_search_result'>";
				html += "							</div>"
				
				html += "							<div id='emp_res_wrap' class='result_wrap'>";
				
				html += "								<div class='res_title_box'>";
				html += "									<div class='res_title_wrap'>";
				html += "										<h4 class='res_title'>직원</h4>";
				html += "										<span class='res_length'>15</span>";
				html += "									</div>";
				html += "									<button type='button' class='btn_more'><span class='more_img'></span><span>더보기</span></button>";
				html += "								</div>"
				
				html += "								<div id='emp_card_box'>";
				
				html += "									<div class='emp_card'>";
				html += "										<div class='card_top_btn_wrap'>";
				html += "											<button type='button' class='btn_emp_card_bookmark active'></button>";
				html += "											<button type='button' class='btn_emp_card_more'></button>";
				html += "										</div>";
				html += "										<div class='emp_card_inner'>";
				html += "											<div class='emp_card_profile'>";
				html += "												<div class='emp_img' style='background-image: url(../resource/images/emp05_img.jpg)'></div>";
				html += "												<div class='emp_info'>";
				html += "													<div class='emp_name_wrap'>";
				html += "														<span class='emp_name'>김가영</span><span class='emp_duty'>과장</span>";
				html += "													</div>";
				html += "													<span class='emp_dept'>경영지원팀</span>";
				html += "												</div>";
				html += "											</div>";
				html += "											<div class='card_btn_wrap'>";
				html += "												<div class='card_btn_box'><button type='button' class='card_btn call'><span class='btn_img'></span></button><span>통화</span></div>";
				html += "												<div class='card_btn_box'><button type='button' class='card_btn chat'><span class='btn_img'></span></button><span>채팅</span></div>";
				html += "												<div class='card_btn_box'><button type='button' class='card_btn mail'><span class='btn_img'></span></button><span>메일</span></div>";
				html += "											</div>";
				html += "										</div>";
				html += "									</div>";
				
				html += "									<div class='emp_card'>";
				html += "										<div class='card_top_btn_wrap'>";
				html += "											<button type='button' class='btn_emp_card_bookmark'></button>";
				html += "											<button type='button' class='btn_emp_card_more'></button>";
				html += "										</div>";
				html += "										<div class='emp_card_inner'>";
				html += "											<div class='emp_card_profile'>";
				html += "												<div class='emp_img' style='background-image: url(../resource/images/emp02_img.jpg)'></div>";
				html += "												<div class='emp_info'>";
				html += "													<div class='emp_name_wrap'>";
				html += "														<span class='emp_name'>김민규</span><span class='emp_duty'>과장</span>";
				html += "													</div>";
				html += "													<span class='emp_dept'>경영지원팀</span>";
				html += "												</div>";
				html += "											</div>";
				html += "											<div class='card_btn_wrap'>";
				html += "												<div class='card_btn_box'><button type='button' class='card_btn call'><span class='btn_img'></span></button><span>통화</span></div>";
				html += "												<div class='card_btn_box'><button type='button' class='card_btn chat'><span class='btn_img'></span></button><span>채팅</span></div>";
				html += "												<div class='card_btn_box'><button type='button' class='card_btn mail'><span class='btn_img'></span></button><span>메일</span></div>";
				html += "											</div>";
				html += "										</div>";
				html += "									</div>";
				
				html += "									<div class='emp_card'>";
				html += "										<div class='card_top_btn_wrap'>";
				html += "											<button type='button' class='btn_emp_card_bookmark'></button>";
				html += "											<button type='button' class='btn_emp_card_more'></button>";
				html += "										</div>";
				html += "										<div class='emp_card_inner'>";
				html += "											<div class='emp_card_profile'>";
				html += "												<div class='emp_img' style='background-image: url(../resource/images/emp01_img.jpg)'></div>";
				html += "												<div class='emp_info'>";
				html += "													<div class='emp_name_wrap'>";
				html += "														<span class='emp_name'>김소영</span><span class='emp_duty'>과장</span>";
				html += "													</div>";
				html += "													<span class='emp_dept'>경영지원팀</span>";
				html += "												</div>";
				html += "											</div>";
				html += "											<div class='card_btn_wrap'>";
				html += "												<div class='card_btn_box'><button type='button' class='card_btn call'><span class='btn_img'></span></button><span>통화</span></div>";
				html += "												<div class='card_btn_box'><button type='button' class='card_btn chat'><span class='btn_img'></span></button><span>채팅</span></div>";
				html += "												<div class='card_btn_box'><button type='button' class='card_btn mail'><span class='btn_img'></span></button><span>메일</span></div>";
				html += "											</div>";
				html += "										</div>";
				html += "									</div>";
				
				html += "									<div class='emp_card'>";
				html += "										<div class='card_top_btn_wrap'>";
				html += "											<button type='button' class='btn_emp_card_bookmark'></button>";
				html += "											<button type='button' class='btn_emp_card_more'></button>";
				html += "										</div>";
				html += "										<div class='emp_card_inner'>";
				html += "											<div class='emp_card_profile'>";
				html += "												<div class='emp_img' style='background-image: url(../resource/images/emp03_img.jpg)'></div>";
				html += "												<div class='emp_info'>";
				html += "													<div class='emp_name_wrap'>";
				html += "														<span class='emp_name'>김하나</span><span class='emp_duty'>사원</span>";
				html += "													</div>";
				html += "													<span class='emp_dept'>경영지원팀</span>";
				html += "												</div>";
				html += "											</div>";
				html += "											<div class='card_btn_wrap'>";
				html += "												<div class='card_btn_box'><button type='button' class='card_btn call'><span class='btn_img'></span></button><span>통화</span></div>";
				html += "												<div class='card_btn_box'><button type='button' class='card_btn chat'><span class='btn_img'></span></button><span>채팅</span></div>";
				html += "												<div class='card_btn_box'><button type='button' class='card_btn mail'><span class='btn_img'></span></button><span>메일</span></div>";
				html += "											</div>";
				html += "										</div>";
				html += "									</div>";
				html += "								</div>";
				html += "							</div>"; // emp_res_wrap
				
				html += "							<div id='board_res_wrap' class='result_wrap'>";
				html += "								<div class='res_title_box'>";
				html += "									<div class='res_title_wrap'>";
				html += "										<h4 class='res_title'>게시판</h4>";
				html += "										<span class='res_length'>13</span>";
				html += "									</div>";
				html += "									<button type='button' class='btn_more'><span class='more_img'></span><span>더보기</span></button>";
				html += "								</div>";
				
				html += "								<div id='board_res_post_ul'>";
				html += "									<div class='post_li'>";
				html += "										<div class='post_li_inner'>";
				html += "											<div class='post_top_wrap'>";
				html += "												<div class='post_top_category_wrap'>";
				html += "													<div class='post_category'>공지</div>";
				html += "													<div class='post_date'>2024년 5월 10일</div>";
				html += "												</div>";
				html += "												<button type='button' class='btn_more'></button>";
				html += "											</div>";
				html += "											<div class='post_info_wrap'>";
				html += "												<h4 class='post_title'>인사발령 제 2024-8호</h4>";
				html += "												<div class='post_desc'>경영지원팀에서 아래와 같이 인사발령을 공지합니다. 1. 시행일자 : 2024년 5월 13일부</div>";
				html += "											</div>";
				html += "										</div>";
				html += "									</div>";
				html += "									<div class='post_li'>";
				html += "										<div class='post_li_inner'>";
				html += "											<div class='post_top_wrap'>";
				html += "												<div class='post_top_category_wrap'>";
				html += "													<div class='post_category'>공지</div>";
				html += "													<div class='post_date'>2022년 4월 12일</div>";
				html += "												</div>";
				html += "												<button type='button' class='btn_more'></button>";
				html += "											</div>";
				html += "											<div class='post_info_wrap'>";
				html += "												<h4 class='post_title'>5월 가정의 달 이벤트</h4>";
				html += "												<div class='post_desc'>어느덧 4월이 지나고 5월 가정의 달이 돌아왔습니다. 5월에는 어린이날과  어버이날, 스승의날까지 행사가 많은 달인데요! 여러분은 주변 사람에게 사랑의 표현을 잘 하고...</div>";
				html += "											</div>";
				html += "										</div>";
				html += "									</div>";
				html += "									<div class='post_li'>";
				html += "										<div class='post_li_inner'>";
				html += "											<div class='post_top_wrap'>";
				html += "												<div class='post_top_category_wrap'>";
				html += "													<div class='post_category'>매뉴얼</div>";
				html += "													<div class='post_date'>2022년 4월 12일</div>";
				html += "												</div>";
				html += "												<button type='button' class='btn_more'></button>";
				html += "											</div>";
				html += "											<div class='post_info_wrap'>";
				html += "												<h4 class='post_title'>[경영지원] 회의실 대여 관련의 건</h4>";
				html += "												<div class='post_desc'>안녕하세요. 경영지원팀입니다. 회의실 대여 관련 안내 드립니다.</div>";
				html += "											</div>";
				html += "										</div>";
				html += "									</div>";
				html += "									<div class='post_li'>";
				html += "										<div class='post_li_inner'>";
				html += "											<div class='post_top_wrap'>";
				html += "												<div class='post_top_category_wrap'>";
				html += "													<div class='post_category'>공지</div>";
				html += "													<div class='post_date'>2024년 5월 10일</div>";
				html += "												</div>";
				html += "												<button type='button' class='btn_more'></button>";
				html += "											</div>";
				html += "											<div class='post_info_wrap'>";
				html += "												<h4 class='post_title'>인사발령 제 2024-8호</h4>";
				html += "												<div class='post_desc'>경영지원팀에서 아래와 같이 인사발령을 공지합니다. 1. 시행일자 : 2024년 5월 13일부</div>";
				html += "											</div>";
				html += "										</div>";
				html += "									</div>";
				html += "									<div class='post_li'>";
				html += "										<div class='post_li_inner'>";
				html += "											<div class='post_top_wrap'>";
				html += "												<div class='post_top_category_wrap'>";
				html += "													<div class='post_category'>공지</div>";
				html += "													<div class='post_date'>2022년 4월 12일</div>";
				html += "												</div>";
				html += "												<button type='button' class='btn_more'></button>";
				html += "											</div>";
				html += "											<div class='post_info_wrap'>";
				html += "												<h4 class='post_title'>5월 가정의 달 이벤트</h4>";
				html += "												<div class='post_desc'>어느덧 4월이 지나고 5월 가정의 달이 돌아왔습니다. 5월에는 어린이날과  어버이날, 스승의날까지 행사가 많은 달인데요! 여러분은 주변 사람에게 사랑의 표현을 잘 하고...</div>";
				html += "											</div>";
				html += "										</div>";
				html += "									</div>";
				html += "									<div class='post_li'>";
				html += "										<div class='post_li_inner'>";
				html += "											<div class='post_top_wrap'>";
				html += "												<div class='post_top_category_wrap'>";
				html += "													<div class='post_category'>매뉴얼</div>";
				html += "													<div class='post_date'>2022년 4월 12일</div>";
				html += "												</div>";
				html += "												<button type='button' class='btn_more'></button>";
				html += "											</div>";
				html += "											<div class='post_info_wrap'>";
				html += "												<h4 class='post_title'>[경영지원] 회의실 대여 관련의 건</h4>";
				html += "												<div class='post_desc'>안녕하세요. 경영지원팀입니다. 회의실 대여 관련 안내 드립니다.</div>";
				html += "											</div>";
				html += "										</div>";
				html += "									</div>";
				
				html += "								</div>"; ///// board_res_post_ul
				html += "							</div>"; ///// board_res_wrap
				html += "						</div>"; ///// res_content_wrap
				
				html += "					</div>"; //// res_content_container
				html += "				</div>"; //// res_content_container_wrap
				html += "			</div>"; //// search_res_area_inner
				html += "		</div>"; //// search_res_area
				
				
				///////  AI 사이드 바
				html += "		<div id='ai_sidebar'>";
				
				html += "			<div class='box_top'>";
				html += "				<div class='ai_info_wrap'>";
				html += "					<div class='ai_img'></div>";
				html += "					<div class='ai_info_txt'>";
				html += "						<span class='user_name'>홍길동</span>님!<br><strong>경영지원</strong> 관련하여 문서를 작성할 수 있습니다.";
				html += "						<br>아래버튼을 눌러 확인해주세요!";
				html += "					</div>";
				html += "				</div>";
				html += "				<div class='ai_req_btn_wrap'>";
				html += "					<button type='button' class='ai_req_btn'><div class='ai_req_btn_txt_wrap'><span class='chk_img'></span><span>경비청구/지불요청서</span></div><span class='arrow_right_blue'></span></button>";
				html += "					<button type='button' class='ai_req_btn'><div class='ai_req_btn_txt_wrap'><span class='chk_img'></span><span>경조금 지급 신청서</span></div><span class='arrow_right_blue'></span></button>";
				html += "				</div>";
				html += "			</div>";
				
				html += "			<div class='box_mid'>";
				html += "				<div id='ai_qna_box'>";
				html += "					<div class='qna_box user_que_box'>";
				html += "						<div class='user_que_txt'>연차 신청해줘</div>";
				html += "					</div>";
				html += "					<div class='qna_box ai_answer_box'>";
				html += "						<div class='ai_answer_txt'>"; 
				html += "							알겠습니다. 휴가 등록 방법은 아래와 같습니다.<br>";
				html += "							제가 사용자님의 정보를 활용하여 <strong>연차 휴가를 등록</strong>해드리겠습니다.<br>";
				html += "							아래 '<strong>휴가 등록하기</strong>'버튼을 클릭해주세요.<br><br>";
				html += "							<strong>홍길동</strong>님 연차 정보: 잔여 연차 <strong>15</strong>개 (총 20개)";
				html += "						</div>";
				html += "						<button type='button' class='btn_regist_holidays'><span>휴가 등록하기</span></button>";
				html += "					</div>";
				
				html += "					<div class='qna_box user_que_box'>";
				html += "						<div class='user_que_txt'>오후 반차로 신청할거야</div>";
				html += "					</div>";
				
				html += "					<div class='qna_box ai_answer_box'>";
				html += "						<div class='ai_answer_txt'>";
				html += "							알겠습니다. <strong>오후 반차로 등록</strong>해 드리겠습니다.<br>";
				html += "							아래 '<strong>휴가 등록하기</strong>'버튼을 클릭해주세요.<br><br>";
				html += "							<strong>홍길동</strong>님 연차 정보: 잔여 연차 <strong>15</strong>개 (총 20개)";
				html += "						</div>";
				html += "						<button type='button' class='btn_regist_holidays'><span>휴가 등록하기</span></button>";
				html += "					</div>";
				html += "				</div>";
				html += "			</div>";
				
				html += "			<div class='box_bot'>";
				html += "				<div class='que_textarea_wrap'>";
				html += "					<textarea class='ai_que_textarea' placeholder='더 필요하신 게 있으신가요?'></textarea>";
				html += "					<button type='button' class='btn_send_que'><span>보내기</span></button>";
				html += "				</div>";
				html += "			</div>";
				
				html += "		</div>"; // ai_sidebar
				html += "	</div>"; // inner
				html += "</div>"; // search_res_box
				
				$("#btn_all_menu_open").show();
				$("#main_logo").show();
				
				$("#area_left").find("button").removeClass("active");
				
				$("#area_content").empty();
				$("#area_content").append(html);
				
				$("#res_box_selectmenu").selectmenu();
			
				$("#btn_ai_sidebar_toggle").on("click", function(){
					$("#search_res_box").toggleClass("expand");
				});

				$("#input_res_box_search").off().on("keypress", function(e){
					if (e.keyCode == 13){
						$("#emp_res_wrap").hide();
						$("#board_res_wrap").hide();
						var query = $(e.currentTarget).val();
						gcom.portal_search_func(query)
						
					}
				});
				
				//console.log(">>>>>>>>>>>>검색결과 로드 성공");
			},
			error: function(xhr, error){
				console.log(error);
			}
		});	
		
	},
	
	"portal_search_func" : function(query){
	
		$("#ai_search_result").empty();
	
		//통합 검색 호출 소스
		var cc = "normal_chat_" + new Date().getTime();		
		var htm = "<div id='pre_"+cc+"'></div>";
		htm += "<div id='"+cc+"'></div>";
		$("#ai_search_result").append(htm);
		
		var readers = []
		var uinfo = gap.userinfo.rinfo;
		
		readers.push(uinfo.emp);
		readers.push("all")
		for (var i = 0 ; i < uinfo.adc.split("^").length; i++){
			readers.push(uinfo.adc.split("^")[i])
		}		
		 var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : query,			
			readers : readers,
			lang : gap.curLang,
			code : "portal_search"
		});			

		var ssp = new SSE(gcom.gptserver + "/apps/portal_search", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	           method: 'POST'});	
		var accumulatedMarkdown = "";
		$("#" + cc).addClass("markdown-body");
		$("#" + cc).parent().css("white-space", "inherit");			
		ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");		
			ssp.close();	
		});		
		var loading_bar = true;	
		var is_text_write = false;
		var pre_text = "";
	   	ssp.addEventListener('message', function(e) {	
			//console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n"); //.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");			
			//console.log(pph);
			if (e.data == "[DONE]"){				
				///// 답변이 끝나면 질문버튼 CSS 초기화			
				//gap.scroll_move_to_bottom_time_gpt(200);	
				
				gcom.search_rel_user(query);
				ssp.close();
        		return;			
        	}else if (e.data == "[START]"){        		
        		var pre_sum = JSON.parse(pre_text);
        		var html = "";
        		html += "<div>";
        		html += "	<div>검색 범위 : " + pre_sum.sources+ "</div>";
        		html += "	<div>검색 범위 선정 이유 : " + pre_sum.reasoning+ "</div>";        		
        		html += "	<div>최적의 검색어 : " + pre_sum.refined_query+ "</div>";
        		html += "</div>";
        		$("#pre_"+cc).html(html);
        	}else if (e.data == "[SEARCH_END_SOURCES]"){
        		is_text_write = true;
			}else{			
				if (e.data.indexOf("_SEARCH_END]") > -1){
					console.log(e.data);
					var pk = e.data;
					var xxp = "";
					//검색 항목들이 검색이 완료되었을때 호출되는 부분, 검색 진행중 상태를 완료 상태로 변경해야 한다.
					if (pk == "[BULLETIN_SEARCH_END]"){
						//게시판 검색이 완료된 경우
						xxp = "게시판 검색이 완료되었습니다.<br>"
					}else if (pk == "[DOC_SEARCH_END]"){
					 	//문서 중앙화가 완료된 경우
						xxp = "문서 중앙화 검색이 완료되었습니다.<br>"
					}else if (pk == "[EMAIL_SEARCH_END]"){
						//메일 검색이 완료된 경우
						xxp = "메일 검색이 완료되었습니다.<br>"
					}else if (pk == "[APPROVAL_SEARCH_END]"){
						//결재 검색이 완료된 경우
						xxp = "결재 검색이 완료되었습니다.<br>"
					}else if (pk == "[INTERNET_SEARCH_END]"){
						//인터넷 검색이 완료된 경우
						xxp = "인터넷 검색이 완료되었습니다.<br>"
					}
					
					$("#pre_"+cc).append(xxp);
				}
				if (pph != "" && is_text_write){
					accumulatedMarkdown += pph;
                	const html = marked.parse(accumulatedMarkdown);
                	$("#"+cc).html(html);
				}else{
					pre_text += pph;
				}						
			}		
		});
		ssp.stream();		
		gptpt.source.push(ssp);		
	 
	 
	},
	
	"search_rel_user" : function(query){
		
		var url = gcom.gptserver + "/apps/portal_search_user";
		var data = JSON.stringify({
			"query" : query
		});
		
		gap.ajaxCall(url, data, function(res){
			
		});
	},
	
	"statusBuddyList" : function(list){
		//포털 즐겨찾기 사용자 온라인 체크하기
		for (var i = 0 ; i < list.length; i++){
			var info = list[i];
			var key = info.ky;
			
			//온라인 오프라인 상태 정보를 변경한다.
			var st = info.st;
			$("[data-status='pstatus_"+key+"']").removeClass();					
			if (st == 1){						
				$("[data-status='pstatus_"+key+"']").addClass("user_status online");
			}else if (st == 2){
				$("[data-status='pstatus_"+key+"']").addClass("user_status away");
			}else if (st == 3){
				$("[data-status='pstatus_"+key+"']").addClass("user_status deny");	
			}else{
				$("[data-status='pstatus_"+key+"']").addClass("user_status offline");
			}
			
			//모바일 접속 여부를 변경한다.
			/*
			var mst = info.mst;
			if (typeof(mst) != "undefined"){
				if (mst == 0){
					$("[data-phone='phone_"+key+"']").removeClass();
				}else{
					$("[data-phone='phone_"+key+"']").removeClass();
					$("[data-phone='phone_"+key+"']").addClass("phone_icon abs");
				}
			}	
			*/
		}						
	},
	
	"check_hasScroll" : function ($el) {
		
		return $el.get(0).scrollHeight > $el.innerHeight() ||
			   $el.get(0).scrollWidth > $el.innerWidth();
	}
	

}