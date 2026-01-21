 $(document).ready(function(){
	$('select').material_select();
});


function gTop(){
	_this = this;	
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
	_this.use_dsp = "";
	_this.use_erp = "";
	_this.use_sms = "";
	_this.use_elephant = "";
	_this.use_ep = "";
	_this.use_video = "";
	_this.use_it = "";
	_this.use_sabo = "";
	_this.cur_window = "main";
	_this.cur_tab = "unread";	
}

gTop.prototype = {
	
	"init" : function(){
	
		var userid = gap.getCookie("userid");
		if (typeof(userid) == "undefined"){
			//	userid = sabun;
			userid = mailid;
		}
			
		var lan = localStorage.getItem(userid + "_lang");//gap.etc_info.ct.lg;
		if ((lan == "") || lan == "undefined" || (typeof(lan) == "undefined")){
		//if (!lan) {
			lan = gap.curLang;
		}else{
			gap.curLang = lan;
		}
				
		$.ajax({
			method : "get",
			url : "lang/" + lan + ".json?open&ver=" + window.jsversion,
			dataType : "json",			
			contentType : "application/json; charset=utf-8",
			async : false,
			success : function(data){	
				gap.lang = data;	
				
				$("#username_display").html(gap.user_check(gap.userinfo.rinfo).name + gap.lang.hoching);
				//$("#dis").html("사용자 계정 : " + gap.userinfo.userid + " / 접속한 사용자 언어 : " + gap.userinfo.userLang + " / loading Title : " + gap.lang.title);
							
				
				gap.channel_push_title = "DSW["+gap.lang.channel+"]";
				gap.drive_push_title = "DSW[Files]";
				gap.todo_push_title = "DSW["+gap.lang.ch_tab3+"]";
			},
			error : function(e){
				gap.error_alert();
			}
		});

		this._eventHandler();
		
		//읽지 않은 알림 건수가 있는지 체크한다.
		gTop.alram_unread_count_check();
		
		//메뉴 표시할지 말지 프로파일 검색하기
		gTop.menu_set();
		
		/*
		//GNB 표시/숨김 버튼
		var $btn_head = $('<div class="btn-show-head">▲</div>');
		$('header').prepend($btn_head);
		setTimeout(function(){
			$('.btn-show-head').off().on('click', function(){
				if ($('#main_home').hasClass('hide-gnb')) {
					// 펼칠 때
					$(this).text('▲');
					gHome.maincal.setOptions({view:{calendar:{labels:true}}});
				} else {
					// 숨김 때
					$(this).text('▼');
					$('#top_header_layer').removeClass('show-quick');
					$('#alram_layer').hide();
					gHome.maincal.setOptions({view:{calendar:{labels:'all'}}});
				}
				$('#main_home').toggleClass('hide-gnb');
			});
			$('.btn-show-head').addClass('btn-show');
		}, 2000);
		*/
	},
	
	"menu_set" : function(){
		var url = '/ngw/core/profile.nsf/(ag_get_menu_info)?OpenAgent&CompanyCode='+companycode+'&empno=';

        $.ajax({
            type: 'GET',
            url: url,
            dataType: "json",
            contentType:"application/json; charset=utf-8",
            success: function(data) {
            	var list = data.menu_info;    // 보기 좋게 줄바꿈을 위한 것            	            	
            	
            	for (var i = 0 ; i < list.length; i++){
            		var item = list[i];
            		if (item.code == "M001"){
            			gTop.use_dsp = "1";
            		}
            		if (item.code == "M002"){
            			gTop.use_erp = "1";
            		}
            		if (item.code == "M003"){
            			gTop.use_sms = "1";
            			use_sms = "1";
            		}
            		if (item.code == "M004"){
            			gTop.use_ep = "1";
            		}
            		if (item.code == "M005"){
            			gTop.use_elephant = "1";
            		}
            		if (item.code == "M006"){
            			gTop.use_video = "1";
            		}
            		if (item.code == "M007"){
            			gTop.use_it = "1";
            		}
            		if (item.code == "M008"){
            			gTop.use_sabo = "1";
            		}
            	}
        	},
        error : function(e){
        	}
        });
	
	},
	
	"_eventHandler" : function(){	
			
		gTop.my_profile_draw();		
		//나의 상태를 표시한다.		
		$("#unck").text(gap.lang.ur);
		$("#allck").text(gap.lang.All);		
		try{
			var g_status = sessionStorage.getItem("status");					
			if (g_status != null){						
				gap.my_profile_status(parseInt(g_status, 10), gap.userinfo.rinfo.msg);
			}else{
				gap.my_profile_status(gap.userinfo.rinfo.st, "");
			}
		}catch(e){
			if (typeof(gap.userinfo.rinfo.msg) != "undefined"){
				gap.my_profile_status(gap.userinfo.rinfo.st, gap.userinfo.rinfo.msg);		
			}else{
				gap.my_profile_status(gap.userinfo.rinfo.st, "");		
			}			
		}		
		var _html = "";
		_html += "<option value='1' selected id='top_sel_1'>대화상대</option>";
	//	_html += "<option value='2' id='top_sel_2'>이전대화</option>";
		if (role == "T"){
			_html += "<option value='3' id='top_sel_3'>"+gap.lang.channel + "+" + gap.lang.drive+"</option>";
		}
		$("#top_select").html(_html);		
		$("#new_alram_menu").off().on("click", function(e){			
			var inx = parseInt(gap.maxZindex()) + 1;
			$("#alram_layer").css("zIndex", inx);
			$("#alram_layer").fadeIn();			
			var html = gap.lang.info + " <span class='read-st' id='alram_all_read' style='cursor:pointer'>"+gap.lang.allread+"</span>";		
			$("#alram_title").html(html);
			
			$("#qsearch").attr("placeholder", gap.lang.input_search_query);	
			
			$("#alram_all_read").off().on("click", function(e){
				gTop.all_read();
			});
			
			$("#sel_tabs_main .tab").off().on("click", function(e){				
				var clicktab = $(e.currentTarget).attr("id");
				$("#sel_tabs_main .tab").removeClass("on");
				$(e.currentTarget).addClass("on");				
				gTop.skip = 0;			
				if (gTop.cur_window == "main"){
					if (clicktab == "all_count_title_main"){
						gTop.cur_tab = "all";
					}else{
						gTop.cur_tab = "unread";
					}
					gTop.draw_alram_main();
					return false;
				}else{
					//서브로 들어왔을때 
					if (clicktab == "all_count_title_main"){
						gTop.cur_tab = "all";
					}else{
						gTop.cur_tab = "unread";
					}
					$("#alram_list_ul2").empty();
					gTop.alram_addContent();
					return false;
				}
				
			});			
			gTop.draw_alram_main();		
		});		
		
		$("#messenger_download").off().on("click", function(){
			location.href = cdbpath + "/dsw.zip";
		});		
		
		//임시적으로 사용하는 버튼임 나중에는 메인으로 가는 걸로 변경해야 함
		$("#msgicon").off().on("click", function(){			
			//gap.load_init();
			location.reload();		
		});
		
		//help창 tip처리하기
		gap.draw_qtip_left("#user_help",  gap.lang.openHelp);
		//gap.draw_qtip_left("#user_profile_btn", gap.lang.userConfig);
		//gap.draw_qtip_left("#new_alram_menu", "Alram");
		
		$("#new_alram_menu").attr("title","Alram");
		$("#user_profile_btn").attr("title",gap.lang.userConfig);
		$("#new_menu_drop").attr("title", "Link");	
		
		//언어에 따른 설정값
		$("#search_query_field").attr("placeholder", gap.lang.input_search_query);
		$("#top_sel_1").text(gap.lang.search_user);
		$("#top_sel_2").text(gap.lang.pasthistory);	
		
		$("#messager_txt").text(gap.lang.md);
		
		$("#user_help").on("click", function(){
			gTop.Open_Manual();
		});			
		
		$("#user_profile_btn").on("click", function(){
		//	gTop.open_setting_layer();
		//	gBody.right_side_open_layer = "config";
			gTop.show_user_config();
		});	
		
		$("#detail_search_btn").on("click", function(event){
			var select = $("#top_select option:selected").val(); 
			var html = "";
			html += "<div id='top_detail_search_layer' class='layer layer-search'>";
			html += "	<h2>"+gap.lang.detail_search+"</h2>";
			html += "	<button class='ico btn-layer-close' id='search_popup_close'>닫기</button>";
			html += "	<div class='input-field selectbox'>";
			html += "		<select name='sel_detail_search'>";

			if (select == "2"){
				// 이전대화 검색
				html += "			<option value='total' selected>"+gap.lang.All+"</option>";
				html += "			<option value='contacts'>"+gap.lang.chatuser+"</option>";
				html += "			<option value='message'>"+gap.lang.chatbody+"</option>";
				
			}else if (select == "3"){
				/*
				 * Box 통합 검색시 상세 검색 조건 : 1.전체, 2.메시지, 3.댓글, 4.메시지 + 댓글 , 5.파일명, 6. 파일내용, 7. 파일명 + 내용
				 */
				var selected_tab = ""
				$("#ts_result_tabs li a").each(function(idx, item){
					if ($(item).hasClass("active")){
						selected_tab = $(item).parent().attr("id")
					}
				});
				
				html += "			<option value='1' selected>"+gap.lang.All+"</option>";
				if (selected_tab == "" || selected_tab == "ts_all" || selected_tab == "ts_channel"){
					html += "			<option value='2'>"+gap.lang.message+"</option>";
					html += "			<option value='3'>"+gap.lang.reply+"</option>";
					html += "			<option value='4'>"+gap.lang.message+" + "+gap.lang.reply+"</option>";					
				}
				html += "			<option value='5'>"+gap.lang.filename+"</option>";
			//	html += "			<option value='6'>"+gap.lang.filecontent+"</option>";
			//	html += "			<option value='7'>"+gap.lang.filename+" + "+gap.lang.filecontent+"</option>";
			}

			html += "		</select>";
			html += "	</div>";
			html += "	<div class='input-field'> ";
			html += "		<input type='text' class='formInput' id='search_detail_query' placeholder='" + gap.lang.input_search_query + "' />";
			html += "		<span class='bar'></span>";
			html += "	</div>";
			html += "	<button class='btn-layer-search' id='search_detail_search_btn'><span class='ico'></span><span id='search_detail_search'>검색</span></button>";
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
					fixed : false
				},
				style : {
					classes : 'qtip-bootstrap',
					tip : false
				},
				position : {
					my : 'top left',
					at : 'bottom left',
					adjust: {
			              x: -200,
			              y: 12
						}					
				},
				events: {
                    show: function () {
						if (select == "3"){
							$("#top_detail_search_layer").css("height", "346px");
						}
						//$('select').material_select();
						$("#search_popup_close").on("click", function(){
							$("#detail_search_btn").qtip("destroy");
						});
						
						$("#search_detail_query").attr("placeholder",gap.lang.input_search_query);
						$("#search_detail_search").text(gap.lang.search);
						
						$("#search_detail_query").keypress(function(e) { 
				            if (e.keyCode == 13){
				            	$("#search_detail_search_btn").click();
				            }    
				        });
						$("#search_detail_search_btn").on("click", function(){
							if (select == "2"){
								gTop.chat_history_detail_search();
								
							}else if (select == "3"){
								gTop.box_total_detail_search();
							}
							return;
						});
                	},
                    hidden: function(event, api) {
                		// Destroy it immediately
                		api.destroy(true);
                	}
				}
			});						
		});		
		
		$("#search_query_field").keypress(function(e) { 
            if (e.keyCode == 13){
            	// 업무방 컨텐츠 작성중인지 확인
    			var res = gap.checkEditor();
    			if (!res) return false;
    			
            	$("#top_search_btn").click();
            	$("#search_query_field").val('');
            }    
        }).bind('paste', function(e){
        	gap.change_paste_text(e, this);
        });
		
		$("#top_select").change(function(){
			var select = $("#top_select option:selected").val(); 
			if (select == "1"){
				$("#detail_search_btn").hide();
			}else{
				$("#detail_search_btn").show();
			}
			
			$("#search_query_field").val("");
			$("#search_query_field").focus();
		});		
		
		$("#top_search_btn").on("click", function(){			
			// 업무방 컨텐츠 작성중인지 확인
			var res = gap.checkEditor();
			if (!res) return false;
					
			$("#alram_layer").fadeOut();
			
			var len = $("#search_query_field").val();
			if (len == 0){
				gap.gAlert(gap.lang.input_search_query);
				$("#search_query_field").focus();
				return false;
			}			
			
			if (len.trim().length == 1){
				gap.gAlert(gap.lang.valid_search_keyword);
				$("#search_query_field").focus();
				return false;
			}
			
			var st = $(".right-area").css("display");
			st = $("#ext_body").css("display");
			if (st == "none"){
				$(".left-area").css("width","100%");
				gBody.rigth_btn_change_empty();
			}else{
				$("#user_search_content").css("width", "calc(100% - " + gap.right_page_width + ")");
			}				
			$("#right_menu_collpase_btn").addClass("on");
			
			var select = $("#top_select option:selected").val(); 
			if (select == "1"){				
				//상단에서 검색하면 조직도가 검색되게 수정한다. 
				var query = $("#search_query_field").val();
				gOrg.orgSearchCall(query);							
			}else if (select == "2"){
				//이전대화 검색
				gTop.searchcnt = 1;
				gTop.topsearch_curcount = 0;
				gTop.chat_history_search('total');				
			}else if (select == "3"){
				//Box 통합검색
				gTop.searchcnt = 1;
				gTop.topsearch_curcount = 0;
				
				gBody3.cur_window = "top_total_search";
				gTop.box_total_search('1');
			}
		});	
	//	gap.draw_qtip_left("#new_menu_drop", "Link");
		
	//	$("#new_menu_drop").off();
		$("#new_menu_drop").on("click", function(e){		
			var inx = gap.maxZindex() + 1;			
			var html = "";          	
        	html += "<div class='layer_wrap home-more' style='width: 197px;'>";
			html += "<div class='layer_inner' id='layer-wrap-inner'>";
			html += "	<ul class='f_between f_column' id='pop_main_layer'>";
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

			if (gTop.use_video == "1"){
    			html += "		<li>";
    			html += "			<div class='img-bx bx06' data-key='6'>";
    			html += "				<span class='ico'></span>";
    			html += "			</div>";
    			html += "			<span class='tit'>"+gap.lang.make_video+"</span>";
    			html += "		</li>";
			}

			if (gTop.use_it == "1"){
    			html += "		<li>";
    			html += "			<div class='img-bx bx07' data-key='7'>";
    			html += "				<span class='ico'></span>";
    			html += "			</div>";
    			html += "			<span class='tit'>IT</span>";
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

			html += "	</ul>";
			html += "</div>";
			html += "</div>";			
				
			$("#new_menu_drop").qtip({
				selector : "#new_menu_drop",
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
					my : 'top left',
					at : 'bottom left',
					//target : $(this)
					adjust: {
		              x: -80,
		              y: 10
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
								url = "http://sso.daesang.com/dispatcher.do?eMateApps=SBH_47&redURL=http://sabo.daesang.com/elephant/list.jsp";
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
		});
			
		$("#person_status").off();
		$("#person_status").on("click", function(event){				
			var inx = gap.maxZindex() + 1;
			$.contextMenu( 'destroy', "#person_status" );
			$.contextMenu({
				selector : "#person_status",
				zIndex : inx,
				position: function(opt, x, y){
			    //    opt.$menu.css({my: "center top", at: "center bottom" });
			        opt.$menu.css({right: 15, top: 58 });
			    },
				autoHide : false,
				trigger : "left",
				callback : function(key, options){						
					//var id = $(this).parent().find(".person_dis").attr("id");		
					//gBody.context_menu_call_person(key, options, id);	
					var opt = key.split("-spl-");
					var op = opt[0];
					var msg = opt[1];			
					
					if (op == "emptystatus"){
						var cur_status = gap.userinfo.rinfo.st;
						_wsocket.change_status_new(cur_status, "");	
					}else if (op == "om"){
						_wsocket.change_status_new(1, msg);						
					}else if (op == "am"){
						_wsocket.change_status_new(2, msg);	
					}else if (op == "dm"){
						_wsocket.change_status_new(3, msg);	
					}else if (op == "logout"){
						//http://dapp1.daesang.com/
						
//						if (gap.isDev){
//							location.href = "?logout&redirectto=http://dapp1.daesang.com/portal.nsf/main2";
//							var url = "?logout";
//						}else{
//							location.href = "?logout&redirectto=" + location.protocol + "//" + location.host + location.pathname + "?readform";
//						}
						var url = "?logout";
						$("body").append('<div style="display:none;"><iframe id="ifr_logout"></ifrmae></div>')
						$("#ifr_logout").attr("src", url);
						if (gap.isDev){
			        		top.location.href = "http://dsso2.daesang.com/sso/logout?client_id=D_DSW_01&redirect_uri=https://dswdv.daesang.com/bridge/sso.nsf/sso?readform";
			        	}else{
			        		top.location.href = "http://dsin.daesang.com/sso/logout?client_id=DSW_01&redirect_uri=https://dsw.daesang.com/bridge/sso.nsf/sso?readform";
			        	}
//						$.ajax({
//					        url : url,
//					        type : 'GET',
//					        async : 'true',
//					        cache : 'false',	
//					        dataType : 'HTML',
//					        error : function () {
//					            alert('Error loading XML document');
//					        },
//					        complete : function (XMLHttpRequest, textStatus) {
////					        	var spath = ssoServer + "/logout.do";
////					            $("body").append('<div style="display:none;"><iframe id="ifr_logout"></ifrmae></div>')
////					            $("#ifr_logout").attr("src", spath);
//					            //반디 SSO Logout;
//					        	
//					        	if (gap.isDev){
//					        		top.location.href = "http://dsso2.daesang.com/sso/logout?client_id=D_DSW_01";
//					        	}else{
//					        		top.location.href = "http://dsso.daesang.com/sso/logout?client_id=D_DSW_01";
//					        	}
//					            
//					        }
//						});
						return false;
					}else if (op == "admin"){
						gTop.draw_admin();
					//	return false;
					}else if (op == "cal"){
						var url = "";
						if (gap.isDev){
							url = "/dswdvmail01/cal/calendar.nsf/holidaymain?openform";
							
						}else{
							url = "https://dsw.daesang.com/mng/HolidayMng.nsf/holidaymain?openform";
						}
						gap.open_subwin(url, "1190","850", "yes" , "", "yes");
						
					}else if (op == "stat"){
						var url = "";						
						url = cdbpath + "/apm?readform";					
						window.open(url, null);
					}else{
						if (key == "online"){
							_wsocket.change_status(1);	
						}else if (key == "empty"){
							_wsocket.change_status(2);	
						}else if (key == "donottouch"){
							_wsocket.change_status(3);	
						}else if (key == "Logout"){
							//_wsocket.logout();
							location.href = cdbpath + "?logout";
							return false;
						}								
					}
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
					}				
				},				
				items: gTop.status_menu_content()
			});
			
			
			/*
			var html = "";
			html += "<div class='layer layer-menu' style='width:96px'>";
			html += "<ul >";
			html += "	<li class='online' style='10px !important' onclick=\"gTop.status_ch('online')\">"+gap.lang.online+"</li>";
			html += "	<li class='away'  onclick=\"gTop.status_ch('away')\">"+gap.lang.empty+"</li>";
			html += "	<li class='deny'  onclick=\"gTop.status_ch('deny')\">"+gap.lang.donottouch+"</li>";
		//	html += "	<li class='meeting'>미팅중</li>";
		//	html += "	<li class='line'>"+gap.lang.displaylock+"</li>";
		//	html += "	<li class='line'  onclick=\"gTop.exit()\">"+gap.lang.quit+"</li>";
			html += "</ul>";
			html += "</div>";				
				
			$("#person_status").qtip({
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
					my : 'top left',
					at : 'bottom left',
					//target : $(this)
					adjust: {
		              x: -80,
		              y: 2
					}
				}
			});	
			*/
			
			
			
		});
		

		var $quick = $('#quick_work_layer');
		
		// 업무 시작하기 관련 언어처리
		$quick.find('.quick-top-title').html(gap.lang.quick_start_title);
		$quick.find('.btn-group').html(gap.lang.reg_group);
		$quick.find('.btn-remove').html(gap.lang.all_deselect);
		$quick.find('.btn-talk').next('.btn-txt').html(gap.lang.chatting); // 대화
		$quick.find('.btn-mail').next('.btn-txt').html(gap.lang.mail); // 메일
		$quick.find('.btn-note').next('.btn-txt').html(gap.lang.noti); // 쪽지
		$quick.find('.btn-file').next('.btn-txt').html(gap.lang.file); // 파일
		$quick.find('.btn-meet').next('.btn-txt').html(gap.lang.res_meet_room); // 회의실 예약
		$quick.find('.btn-online').next('.btn-txt').html(gap.lang.make_video); // 화상회의
		$quick.find('.btn-work').next('.btn-txt').html(gap.lang.sharechannel); // 업무방
		$quick.find('.btn-schedule').next('.btn-txt').html(gap.lang.work_and_cal); // 업무/일정
		
		// 그룹 정보 셋팅
		this.groupListRefresh();
		
		// 그룹 선택
		$('#quick_group').on('change', function(){
			gTop.getUserListByGroup();
			gTop.quickWorkUserCount();
		});
		
		// 빠른 연결 버튼 텍스트
		$('#btn_work_start span').text(gap.lang.quick_connect);
		
		// 업무 바로가기 레이어
		$('#btn_work_start').on('click', function(){
			if ($('#top_header_layer').hasClass('show-quick')) {
				$('#top_header_layer').removeClass('show-quick');
				gTop.hideUserSchedule();					
			} else {
				$('#top_header_layer').addClass('show-quick');
				
				// 로그 저장
				gap.write_log_box('quick', '빠른 연결', 'button', 'pc');
			}
			
			gTop.quickWorkUserCount();
		});
		
		
		// 업무 시작하기 (사용자 검색)
		$('#quick_search_txt').on('keydown', function(e){
			if (e.keyCode == 13) {
				var terms = $.trim($(this).val());
				if (terms == '') return;
				
				if (terms.length == 1) {
					mobiscroll.toast({message:gap.lang.valid_search_keyword, color:'danger'});
					return;
				}
				
				var users = terms.split(',');				
				gsn.requestSearch('', terms, function(res){
					$.each(res, function(){
						var user_info = gOrg.userInfoJsonKM(this);
						gTop.quickWorkAddUser(user_info);
						
						// 스케줄 확인 레이어가 열려있으면 사용자 추가
						if ($('#quick_schedule_layer').is(':visible')) {
							gBody2.add_user_schedule(user_info.key);
						}
					});
					
					$('#quick_search_txt').focus();
				});
				
				$(this).val('');
			}
		}).bind('paste', function(e){
			gap.change_paste_text(e, this);
		});
		
		
		// 조직도 선택
		$quick.find('.btn-quick-org').on('click', function(){
			gap.showBlock();
			window.ORG.show(
				{
					'title': gap.lang.manu3,
					'single': false,
					'select': 'person' // [all, team, person]
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length == 0) return;
						for (var i = 0; i < items.length; i++){
							var _res = gOrg.userInfoJsonKM(gap.convert_org_data(items[i]));
							
							gTop.quickWorkAddUser(_res);
							
							// 스케줄 확인 레이어가 열려있으면 사용자 추가
							if ($('#quick_schedule_layer').is(':visible')) {
								gBody2.add_user_schedule(_res.key);
							}
						}
					},
					onClose: function(){
						gap.hideBlock();
					}
				}
			);
		});
		
		
		
		// 그룹등록
		$quick.find('.btn-group').on('click', function(){
			if ($(this).hasClass('disable')) return;
			var sel_user = gTop.getQuickWorkUserList();
			
			gOrg.showGroupSelectLayer(sel_user, 'quick');
		});
		
		// 선택해제
		$quick.find('.btn-remove').on('click', function(){
			if ($(this).hasClass('disable')) return;
			$('#quick_userlist').empty();
			gTop.quickWorkUserCount();
		});
		
		$('.btn-quick-close, .quick-schedule-dim').on('click', function(){
			gTop.hideUserSchedule();
		});
		
		
		/************* 업무 시작하기 액션 버튼 S *************/
		// 대화
		$quick.find('.btn-talk').on('click', function(){
			if ($(this).parent().hasClass('disable')) return;
			var sel_user = gTop.getQuickWorkUserList(true);
			gap.chatroom_create(sel_user);
		});
		
		// 메일
		$quick.find('.btn-mail').on('click', function(){
			if ($(this).parent().hasClass('disable')) return;

			var list = [];
			var sel_user = gTop.getQuickWorkUserList();
			$.each(sel_user, function(){
				list.push(this.email);
			});
			
			if (list.length > 200) {
				mobiscroll.toast({message:'200명이 초과되되어 메일 발송이 불가능합니다', color:'danger'});
				return;
			} else {
				var param = {opentype: 'popup',	callfrom: 'address', authorsend: list.join(';')};			
				var memo_url = '/' + window.mailfile + '/Memo?openform&' + $.param(param);
				
				var swidth = Math.ceil(screen.availWidth * 0.8);
				var sheight = Math.ceil(screen.availHeight * 0.8);
				if (swidth > 1140) {
					swidth = 1140;				
				}
				gap.open_subwin(memo_url, swidth, sheight);
			}
		});
		
		// 쪽지
		$quick.find('.btn-note').on('click', function(){
			if ($(this).parent().hasClass('disable')) return;
			var sel_user = gTop.getQuickWorkUserList(true);
			gRM.create_memo(sel_user);
		});
		
		// 파일
		$quick.find('.btn-file').on('click', function(){
			if ($(this).parent().hasClass('disable')) return;
			var sel_user = gTop.getQuickWorkUserList(true);
			gBody2.show_all_files(sel_user);
		});
		
		// 회의실 예약
		$quick.find('.btn-meet').on('click', function(){
			if ($(this).parent().hasClass('disable')) return;
			var user_list = [];
			var sel_user = gTop.getQuickWorkUserList();
			$.each(sel_user, function(){
				user_list.push(this.key);
			});
			gMet.reserveMeeting('2', user_list);
		});
		
		// 화상회의
		$quick.find('.btn-online').on('click', function(){
			if ($(this).parent().hasClass('disable')) return;
			var user_list = [];
			var sel_user = gTop.getQuickWorkUserList();
			$.each(sel_user, function(){
				user_list.push(this.key);
			});
			gMet.reserveMeeting('1', user_list);
		});
		
		// 업무방
		$quick.find('.btn-work').on('click', function(){
			if ($(this).parent().hasClass('disable')) return;
			var user_list = [];
			var sel_user = gTop.getQuickWorkUserList();
			$.each(sel_user, function(){
				if (gap.userinfo.rinfo.ky != this.key) {
					user_list.push(this.key);				
				}
			});
			
			gOrg.showCreateWorkLayer(user_list);
		});

				
		// 업무/일정 확인
		$quick.find('.btn-schedule').on('click', function(){
			if ($(this).parent().hasClass('disable')) return;
			if ($('#quick_schedule_layer').hasClass('show')) return;
			gTop.showUserSchedule();
			
			/*
			if ($('#quick_schedule_layer').hasClass('show')){
				gTop.hideUserSchedule();
			} else {
				gTop.showUserSchedule();
			}
			*/
		});
		
		/************* 업무 시작하기 액션 버튼 E *************/
		
		// 메인 조직도
		$('#top_org').on('click', function(){
			$('#org').click();
		});
	},
	
	"showUserSchedule" : function(sel_user){
		// 백그라운드 레이어 표시
		$('#quick_schedule_layer').addClass('show');
		$('#quick_schedule_dim').addClass('show');
		var sel_user = gTop.getQuickWorkUserList(true);
		gBody2.draw_user_schedule(sel_user);
	},
	
	"hideUserSchedule" : function(){
		$('#quick_schedule_layer').removeClass('show');
		$('#quick_schedule_dim').removeClass('show');
	},
	
	"getQuickWorkUserList" : function(is_convert){
		var sel_user = [];
		
		$('#quick_userlist li').each(function(){
			var user_info = $(this).data('info');
			if (is_convert) {
				var convert_info = gOrg.userInfoJsonConvert(user_info);
				convert_info.el = '1'
				sel_user.push(convert_info);
			} else {
				sel_user.push(user_info);
			}
			
		});
		
		return sel_user;
	},
	
	"getGroupList" : function(){
		var url = '/' + window.mailfile + '/group_list?readviewentries&outputformat=json&count=10000';
		return $.ajax({
			url: url,
			dataType: 'json'
		}).then(function(data){
			if (!data.viewentry) return [];
			
			// 데이터 sort처리
			var sort_list = [];
			
			// 폴더명 오름차순으로 정렬
			$.each(data.viewentry, function(idx, val){
				var obj = {
					id :gTop.getValueByName(val, "$12"),
					folder_name : gTop.getValueByName(val, "$11") 
				};
				sort_list.push(obj);
			});

			sort_list.sort(function(a,b){
				if (a.folder_name > b.folder_name) {
					return 1;	
				} else {
					return -1;
				}
			});
			
			return sort_list;
		}, function(){
			return [];
		});
	},
	
	"groupListRefresh" : function(group_id){
		// 그룹 C/U/D 발생하면 호출해줘야 함
		var _self = this;		
		var sel_group = $('#quick_group').val();
		
		// 그룹 아이디를 넘기면 해당 그룹으로 선택되도록 처리한다
		if (group_id) {
			sel_group = group_id;
		}
		
		this.getGroupList().then(function(sort_list){
			var html = '';
			var none_txt = (sort_list.length == 0 ? gap.lang.reg_no_group : gap.lang.select_group);
			html += '<option value="none">' + none_txt + '</option>';
			
			$.each(sort_list, function(){
				var $tmp = $('<div></div>').text(this.folder_name);
				html += '<option value="' + this.id + '"' + (this.id == sel_group ? ' selected' : '') + '>' + $tmp.text() + '</option>';
			});
			
			$('#quick_group').html(html).material_select();
		});
	},
	
	"getUserListByGroup" : function(){
		var _self = this;
		$('#quick_userlist').empty();
		
		var folder_nm = $('#quick_group :selected').text();
		
		var param = {
			RestrictToCategory: '-spl-' + folder_nm + '-spl-',
			outputformat: 'json',
			start: 1,
			count: 1000,
			charset: 'utf-8'
		}
		
		$.ajax({
			url: '/' + window.mailfile + '/address_box_org?ReadViewEntries&' + $.param(param),
			beforeSend: function(){
				_self.loading_req = setTimeout(function(){gap.show_loading('Loading...');}, 200);
			},
			cache: false,
			success: function(res){
				_self.drawGroupUserList(res);
			},
			complete: function(){
				clearTimeout(_self.loading_req);
				gap.hide_loading();
			}
		});
		
	},
	
	"drawGroupUserList" : function(data){
		var _self = this;

		// 내부 사용자만 추가해야 함 (ucc값으로 체크)
		if (data.viewentry) {
			$.each(data.viewentry, function(){
				var user = _self.groupUserInfoJson(this);
				
				// 회사코드 값이 있으면 조직도에서 등록된 개인주소록임
				if (user.companycode) {
					gTop.quickWorkAddUser(user);
					//res.push(user);
				}
			});
		}
		
		// 스케줄 확인 레이어가 열려있으면 사용자 추가
		if ($('#quick_schedule_layer').hasClass('show')) {
			var sel_user = gTop.getQuickWorkUserList(true);
			gBody2.draw_user_schedule(sel_user);
		}
	},
	
	"groupUserInfoJson" : function(data) {
		
		// 개인주소록에 저장된 정보 기준으로 가져온다
		var userinfo = {
			_name : this.getValueByName(data, "xname"),
			_cellphonenumber : this.getValueByName(data, "CellPhoneNumber"),
			_officephonenumber : this.getValueByName(data, "xofficephone"),
			_email : this.getValueByName(data, "xemail"),
			_company : this.getValueByName(data, "xcompanyname"),
			_companycode : this.getValueByName(data, "xcc"),
			_orgname : this.getValueByName(data, "xdepartment"),
			_empno : this.getValueByName(data, "xempno"),
			_duty : this.getValueByName(data, "xjobtitle"),
			_workloc: this.getValueByName(data, "xofficeaddress"),
			_profile: this.getValueByName(data, "xcomment")	//담당업무
		}
		
		if (userinfo._empno.indexOf('im') >= 0) {
			userinfo._orgnumber = userinfo._empno;
		} else {
			userinfo._orgnumber = userinfo._companycode + userinfo._empno;
		}
		
		/*
		return {
			nm : userinfo._name,
			du : userinfo._duty,
			jt : userinfo._duty,
			dp : userinfo._orgname,
			cp : userinfo._company,

			enm : userinfo._name,
			edu : userinfo._duty,
			ejt : userinfo._duty,
			edp : userinfo._orgname,
			ecp : userinfo._company,

			ky : userinfo._orgnumber,
			wl: $.trim(userinfo._workloc),
			mm: $.trim(userinfo._profile),
			cpc : userinfo._companycode,
			emp : userinfo._empno,
			em : userinfo._email,
			mop : userinfo._cellphonenumber,
			op : userinfo._officephonenumber,
			odc : ''
		}
		*/
		
		return {
			name : userinfo._name,
			duty : userinfo._duty,
			post : userinfo._duty,
			orgname : userinfo._orgname,
			company : userinfo._company,

			ename : userinfo._name,
			eduty : userinfo._duty,
			epost : userinfo._duty,
			eorgname : userinfo._orgname,
			ecompany : userinfo._company,

			key : userinfo._orgnumber,
			location: $.trim(userinfo._workloc),
			work: $.trim(userinfo._profile),
			companycode : userinfo._companycode,
			empno : userinfo._empno,
			email : userinfo._email,
			cellphonenumber : userinfo._cellphonenumber,
			officephonenumber : userinfo._officephonenumber,
			fulldeptcode : ''
		}

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
	
	"quickWorkAddUser" : function(info){
		var _self = this;
		var $list = $('#quick_userlist');
		
		var $li = $list.find('[data-key="' + info.key + '"]');
		if ($li.length > 0) return;
		
		var css_img = 'url(' + gap.person_photo_url({cpc:info.companycode, emp:info.empno}) + '),url(../resource/images/none.jpg)';
		var html =
			'<li class="user-li" data-key="' + info.key + '">' +
			'	<div class="user-wrap">' +
			'		<div class="btn-user-remove"><span></span></div>' +
			'		<div class="user-photo" style="background-image:' + css_img + '"></div>' +
			'		<div class="info-wrap">' +
			'			<div class="user-name" title="' + info.name + '">' + info.name + '</div>' +
			'			<div class="user-dept" title="' + info.orgname + '">' + info.orgname + '</div>' +
			'		</div>' +
			'	</div>' +
			'</li>';
		
		$li = $(html);
		$li.data('info', info);		
		$list.append($li);
		
		_self.quickWorkUserCount();
		
		$li.on('click', function(){
			gOrg.showUserDetailLayer($(this).data('key'));
		});
		
		$li.find('.btn-user-remove').on('click', function(){
			
			if ($('#quick_schedule_layer').is(':visible')) {
				gBody2.remove_user_schedule(info.key);
			}

			$li.remove();
			_self.quickWorkUserCount();
			return false;
		});
	},
	
	"quickWorkUserCount" : function(){
		var $quick = $('#quick_work_layer');
		var $list = $('#quick_userlist');
		var cnt = $list.find('li').length;
		$('#quick_user_cnt').text('Total ' + cnt + '');
		
		if (cnt == 0) {
			$quick.find('.btn-group, .btn-remove, .btn-wrap').addClass('disable');
		} else {
			$quick.find('.btn-group, .btn-remove, .btn-wrap').removeClass('disable');
		}
		
	},
	
	"status_menu_content" : function(){		
		
		
		var xitems = {
			"online" : {
				name : gap.lang.online,
				className: 'online',
				items : gTop.item_list('om')
			},
			"empty" : {
				name : gap.lang.empty,
				items : gTop.item_list('am')
			},
			"donottouch" : {
				name : gap.lang.donottouch,
				items : gTop.item_list('dm')
			},
			"emptystatus" : {
				name : gap.lang.emptystatus
			}		
		}	
		
	//	if (gap.ext_user == "T"){
			var logout ={
				"sepa01" : "-------------",
				"logout" : {
					name : "Logout"
				}
			}
			xitems = $.extend(xitems, logout);
	
			if (role_admin == "T"){
				var admin ={
					"sepa02" : "-------------",
					"admin" : {
						name : "Admin"
					}
				}
				xitems = $.extend(xitems, admin);
			}
			
			if (cal_admin == "T"){
				var admin ={
					"sepa03" : "-------------",
					"cal" : {
						name : "휴일관리"
					}
				}
				xitems = $.extend(xitems, admin);
			}
			if (stat_admin == "T"){
				var admin ={
					"sepa04" : "-------------",
					"stat" : {
						name : "DSW통계"
					}
				}
				xitems = $.extend(xitems, admin);
			}
	//	}
		
		return xitems;
	},
	
	
	
	
	"item_list" : function(opt){
	
	//	opt = "om";
		if (gap.etc_info.ct){
			var oob = gap.etc_info.ct;
			//om1 ~ om5 , am1 ~ am5, dm1 ~ dm5
			
			var lists = new Array();
			var obb2 = new Object();
			var exist = false;
			for (var i = 1 ; i <=5; i++){
				var tx = oob[opt + i];
				if (tx != ""){
					var obb = new Object();
					obb.name = tx;			
					obb2[opt + "-spl-" + tx] = obb;
					exist = true;
				}
			}	
					
			if (exist){
				var subItems = obb2;		
				return subItems;
			}else{
				return null;
			}
		}
		

	},
	
	
	
	"my_status_dis" : function (info){
		
		///////// 상태 등록한다. /////////////////////////////
		var obj = new Object();
		obj.id = gap.search_cur_ky();
		obj.st = info.ct.st;
		gap.status_change(obj);
		/////////////////////////////////////////////////
		
		//나의 상태를 표시한다.
		if (typeof(info.ct.msg) != "undefined" && info.ct.msg != ""){
			gap.my_profile_status(info.ct.st, info.ct.msg);
		}else{
			gap.my_profile_status(info.ct.st, "");
		}
		
		
	},
	
	"status_ch" : function (st){
		var ch = "";
		switch (st){
			case 'online':
				ch = 1;
				break;
			case 'away':
				ch = 2;
				break;
			case 'deny':
				ch = 3;
				break;
		}
		
		_wsocket.change_status(ch);
	
	},
	
	"exit" : function(){
		
		self.opener = self;
		window.close();
		return false;
		top.window.opener = top;
		top.window.open('','_parent', '');
		top.window.close();
	},
	
	
	"chat_history_detail_search" : function(){
		var select_val = $("select[name=sel_detail_search]").val();
		$("#search_query_field").val($("#search_detail_query").val())
		$("select[name=sel_detail_search]").val('total');
		$("#search_detail_query").val('');
		$("#detail_search_btn").qtip("destroy");
		
	//	gBody.rigth_btn_change_empty();
	//	$("#ext_body").fadeOut();
		gTop.searchcnt = 1;
		gTop.topsearch_curcount = 0;
		gTop.chat_history_search(select_val);	
	},
	
	"chat_history_search" : function(_search_type){
		gap.show_content("usearch");		
		gap.backpage = gap.curpage;
		gap.tmppage = "history";
		gTop.select_search_type = _search_type;
		
	
		var query = $("#search_query_field").val();
		if (query == 0){
			gap.gAlert(gap.lang.input_search_query);
			$("#search_query_field").focus();
			return false;
		}
		
	//	var url = "http://ap-on.amorepacific.com/aphqappv01/app/abc2/abc3_archive.nsf/agt_essearch_abc2?openagent&ty=list&cpage=1&perpage=12&page=0&ps=12&userkey=CN%3D%EA%B9%80%EC%9C%A4%EA%B8%B0%2FOU%3Dygkim2019%2FO%3DAPG&category=all&title=All%20conversation&search=*%ED%85%8C%EC%8A%A4%ED%8A%B8*&searchtxt=%ED%85%8C%EC%8A%A4%ED%8A%B8&searchkey=Total&tmp=1568766332368";
	//	url = "history_search_result.json?open&ver="+new Date().getTime();
		
		var cur_user_ky = gap.search_cur_ky().replace(/,/gi, "/");
		var add_param = "&ty=list"
					+ "&cpage=" + gTop.searchcnt
					+ "&perpage=" + gTop.perpage
					+ "&ps=" + gTop.perpage
					+ "&userkey=" + encodeURIComponent(cur_user_ky)
					+ "&category=all"
					+ "&search=" + (_search_type != "total" ? _search_type + "-spl-" : "") + "*" + encodeURIComponent(query) + "*"
					+ "&ver=" + new Date().getTime();

		if (gap.isDev){
		//	var url = "http://devportal01.amorepacific.com/devaphqapp/app/abc2/abc2_archive.nsf/agt_essearch_abc2?openagent" + add_param;
			var url = "searchChat?openagent"
					+ "&cpage=" + gTop.searchcnt
					+ "&perpage=" + gTop.perpage
					+ "&userkey=" + encodeURIComponent(cur_user_ky)
					+ "&search=" + (_search_type != "total" ? _search_type + "-spl-" : "") + "*" + encodeURIComponent(query) + "*"
		}else{
			var url = "/aphqappv01/app/abc2/abc2_archive.nsf/agt_essearch_abc2?openagent" + add_param;
		}
		
		$.ajax({
			type : "GET",
			url : url,
			crossOrigin : true,
			dataType : "json",
			contentType : "application/json, charset=utf-8",
			success : function(res){

				var cur_user_ky = gap.search_cur_ky().replace(/,/gi, "/");
				var data = res.hits.hits;
				var totalcount = res.hits.total;
				
				gTop.topsearch_totalcount = totalcount
				gTop.topsearch_curcount += data.length;

				if (gTop.searchcnt == 1){
					var html = "";
					html += "<h2>"+gap.lang.pasthistory + " " + gap.lang.search +" (<span id='cur_cnt_history'></span>/<span id='tcnt_history'></span>)</h2>";
					html += "<button class='ico btn-article-close' id='close_history_search'>닫기</button>";
					html += "<div id='wrap-chat-dis' style='height:calc(100% - 70px);overflow-y:auto;'>";
					html += "	<div id='chat_history_result'></div>";
					html += "</div>";
					
					$("#user_search_content").html(html);
				}

				
				for (var i = 0 ; i < data.length; i++){
					var info = data[i]._source;
					
					var dat = gap.iso_date_convert(info.timez);
					var uinfo = gap.userinfo_sepa(cur_user_ky.toLowerCase(), info.origin_contacts);
					if (uinfo == ""){
						uinfo = gap.userinfo_sepa("", info.user.toLowerCase());
					}
					var uinfo_spl = uinfo.split("^");			
					var img_tag = gap.user_photo_url_tag(uinfo_spl[1]);
					var _html = "";
					var _ym = dat.slice(0,7);	// yyyy-mm
					var el_cnt = $("#chat_history_" + _ym).length;
					
					if (el_cnt == 0){
						var wrap_html = "";
						wrap_html += "		<div class='wrap-result' id='wrap_ym_" + _ym + "'>";
						wrap_html += "		</div>";
						
						$("#chat_history_result").append(wrap_html);
						
						var ym_html = "			<div class='date' id='chat_history_" + _ym + "'><span>" + _ym.replace("-", ". ") + "</span></div>";
						$("#wrap_ym_" + _ym).append(ym_html);
					}
					
					_html += "			<div class='result-chat' onclick=\"gTop.chat_history_search_result('" + info.message_key + "', '" + query + "')\">";
					_html += "				<div class='user'>";
					_html += "					<div class='user-thumb'>" + img_tag + "</div>";
					_html += "					<dl>";
					_html += "						<dt>" + uinfo_spl[0] + gap.lang.hoching + "</dt>";
			//		_html += "						<dd>대리 / 크리에이티브팀</dd>";
					_html += "					</dl>";
					_html += "				</div>";
					_html += "				<div class='chat-comment chat-" + gTop.topsearch_curcount.toString() + "'>";
					_html += "					" + info.message;
					_html += "				</div>";
					_html += "				<div class='time'>" + dat + "</div>";
					_html += "			</div>";

					$("#wrap_ym_" + _ym).append(_html);
				}

			//	$("#chat_history_result").append(_html);
				$("#tcnt_history").text(totalcount);
				$("#cur_cnt_history").text(gTop.topsearch_curcount);
				
				//검색결과 하일라이트 처리하기
				$(".chat-" + gTop.topsearch_curcount.toString()).highlight(query);
				//////////////////////////////////////////////////////////////

				if (gTop.searchcnt == 1){
					$("#wrap-chat-dis").mCustomScrollbar('destroy');
					$("#wrap-chat-dis").mCustomScrollbar({
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
					//	setTop : ($("#chat_msg").height() + 100) + "px"
						callbacks:{
							//	onTotalScrollBack: function(){addContent2(this)},
								onTotalScrollBackOffset: 100,
								onTotalScroll:function(){ gTop.addContent_history(this) },
								onTotalScrollOffset:100,
								alwaysTriggerOffsets:true
						}
					});
				}

					
				$("#close_history_search").on("click", function(){
					if (gap.backpage == "chat"){
						gap.show_chat_room();
					}else{
						$(".left-area").css("width", "calc(100% - "+gap.right_page_width+")");
						gap.show_content(gap.backpage);
					}					
					
					gBody.rigth_btn_change_empty();
					$("#right_menu_collpase_btn").removeClass("on");
					gap.tmppage = "";
				});
				
			},
			error : function(e){
				gap.error_alert();
			}
		})		
	},
	
	
	"addContent_history" : function(){
	
		if (gTop.topsearch_totalcount > gTop.topsearch_curcount){
			gTop.searchcnt ++;
			gTop.chat_history_search(gTop.select_search_type);
		}
	},
	
	"chat_history_search_result" : function(msg_key, highlight_txt){
		var cur_user_ky = gap.search_cur_ky().replace(/,/gi, "/");
		var add_param = "&messagekey=" + msg_key
			+ "&userkey=" + encodeURIComponent(cur_user_ky)
			+ "&ver=" + new Date().getTime();

		if (gap.isDev){
			var url = "searchChat?openagent"
					+ "&messagekey=" + msg_key
					+ "&userkey=" + encodeURIComponent(cur_user_ky);
		}else{
			var url = "/aphqappv01/app/abc2/abc2_archive.nsf/agt_archive_restore_abc2?openagent" + add_param;
		}

		$.ajax({
			type : "GET",
			url : url,
			crossOrigin : true,
			dataType : "json",
			contentType : "application/json, charset=utf-8",
			success : function(res){
				// 대화내용 그리기
				gTop.chat_history_content_draw(res, highlight_txt);
			},
			error : function(e){
				gap.error_alert();
			}
		})
	},
	
	"chat_history_content_draw" : function(res, highlight_txt){
		try{
        	$('#chat_history_dialog').empty();
        	gap.hideBlock();
        	$('#chat_history_dialog').hide();			
		}catch(e){}
		
		var cur_user_ky = gap.search_cur_ky().replace(/,/gi, "/");
		var contacts = res.hits.contacts.split("^");
		var one_to_one = (contacts.length == 1 ? true : false);
		var data = res.hits.hits;
		var html = "";

		html += "<div class='layer-result' id='chat_history_content' style='left:50%;top:50%;transform:translate(-50%,-50%);'>";
		html += "	<h2>대화검색 - " + highlight_txt + "</h2>";
		html += "	<button class='ico btn-article-close'>닫기</button>";
		
		if (one_to_one){
			// 1:1 채팅일때 
			var comma_contacts_ky = contacts[0].replace(/\//gi, ",");
			html += "	<div class='user'>";
			html += "		<div class='user-thumb userinfo' id='" + comma_contacts_ky + "'>" + gap.person_profile_uid(comma_contacts_ky) + "</div>";
			html += "		<dl>";
			html += "			<dt>" + gap.search_username(comma_contacts_ky) + gap.lang.hoching + "</dt>";
		//	html += "			<dd>대리 / 크리에이티브팀</dd>";
			html += "		</dl>";
			html += "	</div>";
			
		}else{
			// 1:N 채팅일때 
			html += "	<div class='member'>";
			for (var k = 0; k < contacts.length; k++){
				var comma_contacts_ky = contacts[k].replace(/\//gi, ",");
				html += "		<div class='user-thumb userinfo' id='" + comma_contacts_ky + "' title='" + gap.search_username(comma_contacts_ky) + gap.lang.hoching + "'>" + gap.person_profile_uid(comma_contacts_ky) + "</div>";
			}
			html += "	</div>";			
		}
		
		html += "	<section id='wrap_chat_history_list' class='chat-result'>";
		html += "		<div class='chat-area chatting' id='chat_history_list'>";
		html += "		</div>";
		html += "	</section";
		html += "</div>";

		$("#chat_history_dialog").append(html);
		
		$("#wrap_chat_history_list").mCustomScrollbar("destroy");
		$("#wrap_chat_history_list").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable:true
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
		
		
		for (var i = 0; i < data.length; i++){
			var rdata = data[i]._source;
			var comma_user_ky = rdata.user.replace(/\//gi, ",");
			var dat = gap.iso_date_convert(rdata.timez);
			var _html = "";
			var _ymd = dat.slice(0,10);	// yyyy-mm-dd
			var _dis_time = dat.slice(11,16);	// hh:nn
			var el_cnt = $("#chat_history_content_" + _ymd).length;
			
			if (el_cnt == 0){
				var wrap_html = "";
				wrap_html += "		<div class='wrap-chat' id='wrap_ymd_" + _ymd + "'>";
				wrap_html += "		</div>";
				
				$("#chat_history_list").append(wrap_html);
				
				var ymd_html = "			<div class='date' id='chat_history_content_" + _ymd + "'><span>" + _ymd + "</span></div>";
				$("#wrap_ymd_" + _ymd).append(ymd_html);
			}			
			
			if (rdata.type == "2"){
				var sys_msg_spl = rdata.message.split(" ");
				var sys_msg_kind = sys_msg_spl[0];
				var sys_msg_username = gap.search_username(sys_msg_spl[1]);
				var sys_msg = "";
				
				if (sys_msg_spl[0] == "e" || sys_msg_spl[0] == "l"){
					if (sys_msg_spl[0] == "e"){
						sys_msg = sys_msg_username + gap.lang.enter_chat;
					}else if (sys_msg_spl[0] == "l"){
						sys_msg = sys_msg_username + gap.lang.exit_chat;
					}
					var _html = "			<div class='alarm-user'><span>" + sys_msg + " [" + _dis_time +"]</span></div>";					
				}

			}else{
				if (cur_user_ky.toLowerCase() == rdata.user.toLowerCase()){
					_html += "			<div class='me'>";
				}else{
					_html += "			<div class='you'>";
				}
				_html += "				<div class='user'>";
				_html += "					<div class='user-thumb'>" + gap.person_profile_uid(comma_user_ky) + "</div>";
				_html += "				</div>";
				_html += "				<div class='name'>" + gap.search_username(comma_user_ky) + gap.lang.hoching + "</div>";
				_html += "				<div class='talk'>";
				_html += "					<br />";
				_html += "					<div class='wrap-message chat-history-content-body'>";
				_html += "						<div class='balloon'><div><span class='tail ico'></span>" + rdata.message + "</div></div>";
				_html += "					</div>";
				_html += "					<div class='time'>" + _dis_time + "</div>";
				
				_html += "				</div>";
				_html += "			</div>";				
			}

			$("#wrap_ymd_" + _ymd).append(_html);
		}
		
		$(".wrap-message.chat-history-content-body").highlight(highlight_txt);
	
        $('#chat_history_dialog').find('.btn-article-close').on('click', function() {
        	$('#chat_history_dialog').empty();
        	gap.hideBlock();
        	$('#chat_history_dialog').hide();
        });
        
        $('#chat_history_dialog').find('.userinfo').on('click', function() {
        	gBody.click_img_obj = this;
        	var uid = $(this).attr("id");
        	_wsocket.search_user_one_for_popup(uid);
        });
		
        gap.showBlock();
        var max_idx = gap.maxZindex();
		$('#chat_history_dialog')
        .css({'width':'900px','height':'600px','zIndex': parseInt(max_idx) + 1})
        .show()
        .position({
            my: 'center',
            at: 'center',
            of: window
        });
 //       gap.showBlock();
	},
	
	"chat_user_search" : function(obj){
	
		gap.show_content("usearch");		
		gap.backpage = gap.curpage;
		gap.tmppage = "usearch";
						
		if (gTop.searchcnt == 1){
			if (typeof(obj.ct) != "undefined"){
				gTop.topsearch_totalcount = obj.ct.cnt;
			}else{
				gTop.topsearch_totalcount = obj.length;
			}
			
			var html = "";		
			html += "<h2>"+gap.lang.chatuser + " " + gap.lang.search +" (<span id='stotal_cur'></span> / <span id='stotal_total'></span>)</h2>";
			html += "<button class='ico btn-article-close' id='close_user_search'>닫기</button>";			
			html += "<div class='wrap-result' id='wrap-usearch-dis' style='height:calc(100% - 70px);overflow-y:hidden;'>";
			html += "<div id='w-usearch'></div>";
			html += "</div>";		
			$("#user_search_content").html(html);
			
			$("#stotal_total").text(gTop.topsearch_totalcount);
		}
		
		
		var infos = "";		
		if (typeof(obj.ct) != "undefined"){
			infos = obj.ct.rt;	
		}else{
			infos = obj;
		}
		gTop.topsearch_curcount += infos.length;
		$("#stotal_cur").text(gTop.topsearch_curcount);
		
		var html2 = "";
		var lists = new Array();
		
		
		for (var i = 0 ; i < infos.length; i++){
			var info = infos[i];
			
			lists.push(info.ky);
			gBody.remove_user_status.push(info.ky);
			
			var dept = "";			
			
			var name = info.nm;
			
			var ename = "";			
			if (typeof(info.enm) != "undefined"){
				ename = info.enm;
			}
			
			var email = "";
			if (typeof(info.em) != "undefined"){
				email = info.em;
			}
		//	var id = gap.seach_canonical_id(info.ky);
			
			var id = info.ky;
		//	var person_img = gap.person_profile_img(info.em);
			var person_img = gap.person_profile_photo(info);
			
			var disname = name;
			var cp = "";			
			if (typeof(info.cp) != "undefined"){
				cp = info.cp;
			}
			
			
			if (gap.cur_el != info.el){
				disname = ename;
				name = info.enm;
				
				ename = info.nm;
											
				if (typeof(info.ecp) != "undefined"){
					cp = info.ecp;
				}
				
				if (typeof(info.edp) != "undefined"){
					dept = info.edp.replace("#","");
				}
			}else{
				if (typeof(info.dp) != "undefined"){
					dept = info.dp.replace("#","");
				}
			}
			
			id = id.replace(/\./gi,"-spl-");
			
			html2 += "	<div class='result-profile' style='padding-top:10px' id='sresult_"+id+"' data='"+name+"/"+dept+"' data2='"+info.ky+"' data3='"+info.em+"' data4='"+disname+"'>";
	//		html2 += "		<button class='ico btn-check'>체크</button>";
			html2 += "		<button class='ico btn-more usearch'>더보기</button>";
			html2 += "       <div class='usearch_person' id='usearch_person_"+id+"' data='"+info.ky+"'>";
			html2 += "			<div class='user-result-thumb'>"+person_img+"</div>";
			
			html2 += "			<span class='' id='sresult_status_"+id+"'></span>";
			
			html2 += "			<dl>";
			html2 += "				<dt><span class='status online'></span>"+name+"</dt><dd title='"+ename+"'>"+ename+"</dd>";
			
			html2 += "              <dd class='status-message' id='sresult_msg_"+id+"'></dd>";
			
			html2 += "			</dl>";
			html2 += "			<ul class='result-info'>";
			html2 += "				<li>"+email+"</li>";
			html2 += "				<li>"+((typeof(info.op) == "undefined") ? "" : info.op + " / ")+ ((typeof(info.mp) == "undefined") ? "" : info.mp) +"</li>";
			//html2 += "				<li>"+((typeof(info.op) == "undefined") ? "" : info.op)+" / " +((typeof(info.mp) == "undefined") ? "" : info.mp) +"</li>";
			html2 += "				<li>"+dept+"</li>";
			html2 += "				<li>"+cp+"</li>";
			html2 += "			</ul>";
		//	html2 += "			<div class='result-btns'>";
		//	html2 += "				<div><button class='ico btn-user-chat'>채팅하기</button></div>";
		//	html2 += "				<div><button class='ico btn-user-add' id='groupadd_"+i+"'>그룹에추가</button></div>";
		//	html2 += "				<div><button class='ico btn-user-favorite'>즐겨찾기</button></div>";
		//	html2 += "			</div>";	
		//	html2 += "			<div class='progress-bar'><span style='width:50%;'></span></div>";		
			html2 += "      	</div>";
			html2 += "	</div>";
			
			
		}	
		$("#w-usearch").append(html2);
		
		
		$("#wrap-usearch-dis .ico.btn-check").on("click", function(){
			if ($(this).hasClass("on")){
        		//현재 선택되어 있으면 선택을 제거한다.
        		$(this).removeClass("on");
        	}else{
        		$(this).addClass("on");
        	}
		});
		
		$("#wrap-usearch-dis .usearch_person").single_double_click(function (e) {  
			//click일 경우
        
        	if ($(this).parent().find(".ico.btn-check").hasClass("on")){
        		//현재 선택되어 있으면 선택을 제거한다.
        		$(this).parent().find(".ico.btn-check").removeClass("on");
        	}else{
        		$(this).parent().find(".ico.btn-check").addClass("on");
        	}
        }, function (e) {
        	//double click일 경우
        	
        	var cid = $(this).attr("data");			
			if (cid == gap.search_cur_ky()){				
			}else{
				var room_key = _wsocket.make_room_id(cid);
				var name = $(this).parent().attr("data4");
				gBody.enter_chatroom_for_chatroomlist(room_key, cid, name);
				//gBody.enter_onetoone_chatroom(cid);
			}			
			return false;
    	});		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		_wsocket.temp_list_status(lists, 1, "topsearch");

		
		if (gTop.searchcnt == 1){
			$("#wrap-usearch-dis").mCustomScrollbar('destroy');
			$("#wrap-usearch-dis").mCustomScrollbar({
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
			//	setTop : ($("#wrap-usearch-dis").height() - 100) + "px",
				callbacks:{
				//	onTotalScrollBack: function(){addContent2(this)},
				//	onTotalScrollBackOffset: 100,
					onTotalScroll:function(){ gTop.addContent(this) },
					onTotalScrollOffset:100,
					alwaysTriggerOffsets:true
				}
			});
		}

		gTop._eventHandler_user_search();
	
		return false;
			
	},
	
	"addContent" : function(){
		
		if (gTop.topsearch_totalcount > gTop.topsearch_curcount){
			var query = $("#search_query_field").val();
			gTop.searchcnt ++;
			_wsocket.search_user_top_frame(query, gTop.topsearch_curcount);
		}
		
	},
	
	"_eventHandler_user_search" : function(){
		
		gap.draw_qtip_right(".ico.btn-user-chat", gap.lang.startChat);
		gap.draw_qtip_right(".ico.btn-user-add", gap.lang.addGroup);
		gap.draw_qtip_right(".ico.btn-user-favorite", gap.lang.addFavorite);
				
		$(".ico.btn-user-chat").on("click", function(){
			var cid = $(this).parent().parent().parent().attr("data");
			
			if (cid != gap.search_cur_ky()){
				var room_key = _wsocket.make_room_id(cid);
				var name = $(this).parent().parent().parent().parent().attr("data4");
				gBody.enter_chatroom_for_chatroomlist(room_key, cid, name);
				//gBody.enter_onetoone_chatroom(cid);
			}		
			return false;
		});
		
		$(".ico.btn-user-add").on("click", function(){	
			var cid = $(this).parent().parent().parent().attr("data");
			if (cid != gap.search_cur_ky()){
				gBody.dragg_user = $(this).parent().parent().parent().parent().attr("data2");	
				gBody.dragg_user_name = $(this).parent().parent().parent().parent().attr("data4");	
				gTop.change_left_frame_to_addGroup();
			}
			return false;

		});

		$(".ico.btn-user-favorite").on("click", function(){
			var cid = $(this).parent().parent().parent().attr("data");
			if (cid != gap.search_cur_ky()){
				var user = $(this).parent().parent().parent().parent().attr("data2");
				gBody.add_favorite_member(user);
			}
			return false;
		});		

		
		$("#wrap-usearch-dis .usearch_person").on("dblclick", function(){
			
			var cid = $(this).attr("data");	
			var name = $(this).parent().attr("data4");
			if (cid == gap.search_cur_ky()){				
			}else{
				var room_key = _wsocket.make_room_id(cid);
				gBody.enter_chatroom_for_chatroomlist(room_key, cid, name);
				//gBody.enter_onetoone_chatroom(cid);
			}			
			return false;
		});
		
		
		$("#close_user_search").on("click", function(){			

			$("#search_query_field").val("");
			
			if (gap.backpage == "chat"){
				gap.show_chat_room();
			}else{
				
				
				if (gBody.cur_tab == "tab3" || gBody.cur_tab == "tab4" ){
					if (gBody.cur_todo != ""){
						//채널내에 To Do가 열려 있는 상태일 경우
						$(".left-area").css("width", "calc(100% - "+gap.right_page_width+")");
						$("#user_profile").show();
						$("#channel_list").removeAttr("class");
						$("#channel_list").addClass("left-area todo fold-temp");
						$("#channel_list").css("width", "100%");
						$("#user_search_content").hide();
					}else{
						if (!gBody3.check_top_menu_new()){							
							$(".left-area").css("width", "calc(100% - "+gap.right_page_width+")");
						}
					//	
						$("#user_search_content").hide();
					}
					

				}else{
					if (gBody3.cur_window == "todo" && gBody.cur_todo == "main"){
						gap.show_content("todo_main");
					}else if (gBody3.cur_window == "todo" && gBody.cur_todo != "main"){
						$(".left-area").css("width", "calc(100% - "+gap.right_page_width+")");
						gap.show_content("todo_status");
					}else if (gBody3.cur_window == "drive"){
						gap.show_content("drive");
					}else{
						$(".left-area").css("width", "calc(100% - "+gap.right_page_width+")");
						gap.show_content(gap.backpage);
						
					}
					
					
				}
				
			}
			
			gBody.rigth_btn_change_empty();
			$("#right_menu_collpase_btn").removeClass("on");
			gap.tmppage = "";
			
			
			var group_select_layer_css = $("#group_add_layer").css("display");
			if (group_select_layer_css == "block"){
				$("#group_add_layer_close").click();
			}
			
			gap.remove_status_user();
		});
		
		$(".ico.btn-more.usearch").on("click", function(){
			
			$(this).addClass("on");
			$.contextMenu({
				selector : ".ico.btn-more.usearch",
				autoHide : true,
				trigger : "left",
				callback : function(key, options){			
				
				//	var id = "usearch_person_" + $(this).parent().attr("id").split("_")[1];			
					
					var id = "usearch_person_" + $(this).parent().attr("id").replace("sresult_","");
					gBody.context_menu_call_person_top_search(key, options, id);
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
                	}				
				},				
				items: gBody.person_menu_content_top_search()
			});
		});		
		
		$.contextMenu({
			selector : ".usearch_person",
			autoHide : true,
			callback : function(key, options){		
				
				gBody.context_menu_call_person_top_search(key, options, $(this).attr("id"));
			},
			events : {
				hide: function (options) {					
            	}				
			},	
			items: gBody.person_menu_content_top_search()
		});		
		
		$(".result-profile").draggable({
			 revert: "invalid",
			 stack: ".draggable",     //가장위에 설정해 준다.
			 opacity: 1,
		//	 containment: "window",
			 scroll: false,
		//	 helper: 'clone',
			 cursorAt: { top: 5, left:5},
			 helper: function (e) { 
				//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.										
					return $(this).clone().removeClass("result-profile").appendTo("#top_content").css("zIndex",3000).show();
		     },			 
		     
		     cursor: 'move',			 		     
		     
			 start : function(event, ui){		    	
		    	
		    	gTop.change_left_frame_to_addGroup();
		    	
				$(this).draggable("option", "revert", false);			
				
				var imgsrc = ui.helper.find("img").attr("src");
				var pinfo = ui.helper.attr("data");
				var uid = ui.helper.attr("data2");
				var spl = pinfo.split("/")[0];
			
				var html = "";
				html += "<div class='user-drag drag' style=''> ";
				html += "	<div class='user-result-thumb' data='"+uid+"'><img src='"+imgsrc+"' alt=''></div>";
				html += "		<dl>";
				html += "			<dt>"+spl+"</dt>";
				html += "		</dl>";
				html += "	</div>";
				html += "</div>";
					
				ui.helper.html(html);
			
			},
			stop : function(event, ui){						
			}
		});
		
			
		$(".result-profile").droppable({
			drop : function(event, ui){
				try{
					var droppable = $(this);
			 		var draggable = ui.draggable;
			 		var dragid = ui.draggable.attr("id");
						 	
			 		
						 	
			 		if (draggable.hasClass("chat_img") || draggable.hasClass("chat_file") || draggable.hasClass("tmail")){
			 			//파일을 드래그해서 이동하면 업로드하는 프로그레스바 효과를 추가해 준다.			 			
			 			var msg = gap.lang.dragandadd;
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
			 							//확인을 클릭한 경우							
			 							
					 					var uid = $(droppable).attr("data2");
					 					var name = $(droppable).attr("data4");
						 				var room_key = _wsocket.make_room_id(uid);
						 				var exist_room = gap.chatroom_exist_check(room_key);
						 				if (exist_room == false){
						 					//기존에 채팅방이 없을 경우 방을 만들고 메시지를 보내야 한다.
						 					_wsocket.make_chatroom_11_only_make(uid, name);
						 				}		
						 				var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.
			 				
						 				if (draggable.hasClass("tmail")){
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
													
												},
												error : function(e){
													gap.gAlert(gap.lang.errormsg);
													return false;
												}
											})
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
										//우측 프레임에서 파일또는 이미지를 드래그 한 경우
																			
										if (draggable.hasClass("chat_img") ){
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
										 
										 //"http://10.160.44.236:16080/filedown/20191118/upload_4317225ba6ebe6f754c37ecd425907c5.JPG/5.JPG"
										 //http://10.160.44.236:16080/20191118/upload_4317225ba6ebe6f754c37ecd425907c5.JPG
										 var spl = downloadurl.split("/");		
										 
										 if (gap.isDev){
		 									exobj.sn = spl[5];
			 								exobj.sf = "/" + spl[4];
		 								 }else{
		 									exobj.sn = spl[6];
			 								exobj.sf = "/" + spl[5];
		 								 }
		
										 exobj.sz = parseFloat(size);
										 exobj.nm = filename;
		
										 obj.ex = exobj;		    	 
		
										 _wsocket.send_chat_msg(obj);
										//////////////////////////////////////////////////////////////////////////////////////////////////////////////
										 					 								
										//파일 전송 처리하기 그래프
										var id = $(droppable).attr("id");
										id = id.replace("sresult_","usearch_person_");
										var oob = $("#" + id);
										gBody.process_display(oob);
									
										//채팅방 리스트 Refresh해 준다.
										var xxtm1 =  setTimeout(function(){
											 _wsocket.load_chatroom_list();
											 clearTimeout(xxtm1);
										 }, 500);								 		
			 						}
			 				
						 											 		
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
			 			
			 			var x = ui.helper.clone();					 		
				 		var top = ui.helper.position().top;
				 		var left = ui.helper.position().left;				 		
				 		top = "10px";
				 		left = "50px";				 		
				 		x.css({ 'top': top, 'left': left }).appendTo(droppable).fadeOut(1000)
			 			
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

	
	"change_left_frame_to_addGroup" : function(){
		//등록된 그룹들을 버튼 형태로 변경시킨다.
		$("#group_add_layer").fadeIn();
	},
	
	
	"open_setting_layer" : function(){
			
		gap.show_content("ext");			
		gBody.rigth_btn_change_empty();
		
		var html = "";
		
	
		html += "<div class='setting'>";
		
		html += "<h2>"+gap.lang.userConfig+"</h2>";
		html += "<button class='ico btn-right-close' id='user_profile_close'>닫기</button>";
		html += "<div class='set-language'>";
		html += "<h4>"+gap.lang.displaymenu+"</h4>";
		
		//한국어
		html += "<div class='radio'>";
		html += "	<label>";
		html += "		<input name='group' class='with-gap' type='radio' value='1' id='kolang'>";
		html += "		<span>"+gap.lang.kor+"</span>";
		html += "	</label>";
		html += "</div>";
		
		//영어
		html += "<div class='radio'>";
		html += "	<label>";
		html += "		<input name='group' class='with-gap' type='radio' value='2' id='enlang'>";
		html += "		<span>"+gap.lang.eng+"</span>";
		html += "	</label>";
		html += "</div>";
				
		//중국어
//		html += "<div class='radio'>";
//		html += "	<label>";
//		html += "		<input name='group' class='with-gap' type='radio' value='3' id='cnlang'>";
//		html += "		<span>"+gap.lang.cn+"</span>";
//		html += "	</label>";
//		html += "</div>";
		
		html += "<div class='set-country' style='margin-top:10px'>";
		html += "	<h4>"+gap.lang.location+"</h4>";
		html += "	<div class='input-field selectbox'>";
		html += "		<select id='locale_sel'>";
		html += "			<option value='ko'>"+gap.lang.korea+"</option>";
		html += "			<option value='cn'>"+gap.lang.china+"</option>";
		html += "			<option value='ag'>"+gap.lang.asean+"</option>";
		html += "			<option value='us'>"+gap.lang.usa+"</option>";
		html += "			<option value='fr'>"+gap.lang.france+"</option>";
		html += "		</select>";
		html += "	</div>";
		
		html += "	<div class='right-bottom-btns' style='margin-top:10px'>";
		html += "		<button id='locale_ok'><span>"+gap.lang.OK+"</span></button>";
		html += "		<button id='locale_cancel'><span>"+gap.lang.Cancel+"</span></button>";
		html += "	</div>";
		
		
		
		html += "<!-- 상태메세지 시작-->";
		html += "<div class='set-message' style='margin-top:20px'>";
		html += "	<h4>"+gap.lang.status_title+"</h4>";
		html += "	<div class='radio'>	";
		html += "		<label><input name='group1' class='with-gap' type='radio' value='1' id='' checked><span>"+gap.lang.online+"</span></label>";
		html += "	</div>";
		html += "	<div class='radio'>";
		html += "		<label><input name='group1' class='with-gap' type='radio' value='2' id=''><span>"+gap.lang.empty+"</span></label>";
		html += "	</div>";
		html += "	<div class='radio'>";
		html += "		<label><input name='group1' class='with-gap' type='radio' value='3' id=''><span>"+gap.lang.donottouch+"</span></label>";
		html += "	</div>";
		
		html += "<div id='dis_om'>"
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='om1' placeholder='"+gap.lang.status_msg1+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='om2' placeholder='"+gap.lang.status_msg2+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='om3' placeholder='"+gap.lang.status_msg3+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='om4' placeholder='"+gap.lang.status_msg4+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='om5' placeholder='"+gap.lang.status_msg5+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "</div>";
		
		html += "<div id='dis_am' style='display:none'>"
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='am1' placeholder='"+gap.lang.status_msg1+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='am2' placeholder='"+gap.lang.status_msg2+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='am3' placeholder='"+gap.lang.status_msg3+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='am4' placeholder='"+gap.lang.status_msg4+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='am5' placeholder='"+gap.lang.status_msg5+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "</div>";
		
		html += "<div id='dis_dm' style='display:none'>"
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='dm1' placeholder='"+gap.lang.status_msg1+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='dm2' placeholder='"+gap.lang.status_msg2+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='dm3' placeholder='"+gap.lang.status_msg3+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='dm4' placeholder='"+gap.lang.status_msg4+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput' id='dm5' placeholder='"+gap.lang.status_msg5+"'>";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "</div>";
			
		
		html += "		<div class='info-msg'>* "+gap.lang.max5+"</div>";
		html += "	</div>";
			
		
		
		html += "<!-- 상태메세지 끝 -->";
	
		
		html += "	<div class='right-bottom-btns' style='margin-top:10px'>";
		html += "		<button id='status_ok'><span>"+gap.lang.OK+"</span></button>";
		html += "		<button id='status_cancel'><span>"+gap.lang.Cancel+"</span></button>";
		html += "	</div>";
		
		
		//////////////////////////////////////////////////////////////////////////////////////////////
		html += "<div class='set-alramsound' style='margin-top:20px'>";
		html += "<h4>"+gap.lang.alramsound+"</h4>";
		
		//한국어
		html += "<div class='radio'>";
		html += "	<label>";
		html += "		<input name='group2' class='with-gap' type='radio' value='11' id='alramon'>";
		html += "		<span>On</span>";
		html += "	</label>";
		html += "</div>";
		
		//영어
		html += "<div class='radio'>";
		html += "	<label>";
		html += "		<input name='group2' class='with-gap' type='radio' value='22' id='alramoff'>";
		html += "		<span>Off</span>";
		html += "	</label>";
		html += "</div>";
		
		html += "</div>";
		
		
		//////////////////////////////////////////////////////////////////////////////////////
		html += "<div class='set-alramsound2' style='margin-top:20px'>";
		html += "<h4>"+gap.lang.alramsound2+"</h4>";
		
		//한국어
		html += "<div class='radio'>";
		html += "	<label>";
		html += "		<input name='group3' class='with-gap' type='radio' value='111' id='alramon2'>";
		html += "		<span>On</span>";
		html += "	</label>";
		html += "</div>";
		
		//영어
		html += "<div class='radio'>";
		html += "	<label>";
		html += "		<input name='group3' class='with-gap' type='radio' value='222' id='alramoff2'>";
		html += "		<span>Off</span>";
		html += "	</label>";
		html += "</div>";
		
		html += "</div>";
		//////////////////////////////////////////////////////////////////////////////////////
		
		
		
		
		
		html += "</div>";
		
	
		$("#ext_body").html(html);		
		
			
		gTop.temp_status_list = new Object();
		
		if (gap.etc_info.ct){
			var etc_list = gap.etc_info.ct;
			
			gTop.temp_status_list = etc_list;
			
			for (var i = 1 ; i <=5 ; i++){
				$("#om" + i).val(etc_list["om" + i]);			
				gTop.temp_status_list["om" + i] = etc_list["om" + i];
				
				$("#am" + i).val(etc_list["am" + i]);			
				gTop.temp_status_list["am" + i] = etc_list["am" + i];
				
				$("#dm" + i).val(etc_list["dm" + i]);			
				gTop.temp_status_list["dm" + i] = etc_list["dm" + i];
			}
		}
		
		
		
		
		$("[name=group1]").on("click", function(){
	
			if (gTop.curtab == 1){
				for (var i = 1 ; i <=5 ; i++){
					gTop.temp_status_list["om" + i] = $("#om" + i).val();
				}				
			}else if (gTop.curtab == 2){		
				for (var i = 1 ; i <=5 ; i++){
					gTop.temp_status_list["am" + i] = $("#am" + i).val();
				}
			}else if (gTop.curtab == 3){
				for (var i = 1 ; i <=5 ; i++){
					gTop.temp_status_list["dm" + i] = $("#dm" + i).val();
				}
			}
			
			
			var opt = $(this).val();
			if (opt == "1"){
				gTop.curtab = 1;
				$("#dis_om").show();
				$("#dis_am").hide();
				$("#dis_dm").hide();
				
				for (var i = 1 ; i <=5 ; i++){
				//	$("#om" + i).val(etc_list["om" + i]);
					$("#om" + i).val(gTop.temp_status_list["om" + i]);
				}
			}else if (opt == "2"){
				gTop.curtab = 2;
				$("#dis_om").hide();
				$("#dis_am").show();
				$("#dis_dm").hide();
				
				for (var i = 1 ; i <=5 ; i++){
				//	$("#am" + i).val(etc_list["am" + i]);
					$("#am" + i).val(gTop.temp_status_list["am" + i]);
				}
			}else if (opt == "3"){
				gTop.curtab = 3;
				$("#dis_om").hide();
				$("#dis_am").hide();
				$("#dis_dm").show();
				
				for (var i = 1 ; i <=5 ; i++){
				//	$("#dm" + i).val(etc_list["dm" + i]);
					$("#dm" + i).val(gTop.temp_status_list["dm" + i]);
				}
			}
			
		});
		

		var userid = gap.userinfo.userid;		
		
		var loc = gap.sid.replace("_1","");
		$("#locale_sel").val(loc);
		
			
		var lang = localStorage.getItem(userid + "_lang");
		$('#'+lang+'lang').prop('checked',true); 
		if (lang == "en"){
			$('#enlang').prop('checked',true); 
		}else{
			$('#kolang').prop('checked',true); 
		}
			
		
		$("#locale_ok").on("click", function(){
			
			var lo = $("#locale_sel").val();
			var ck = $( "input:checked" ).val();
			var lan = "";
			if (ck == "1"){
				lan = "ko"
			}else if (ck == "2"){
				lan = "en";
			}else if (ck == "3"){
				lan = "cn";
			}
			try{
				
				localStorage.setItem(userid+"_locale", lo);
				localStorage.setItem(userid+"_lang", lan);
			}catch(e){
				
			}			
			
			
			
			
			_wsocket.change_locale_languse(lo, lan);
			
		});
		
		$("#status_ok").on("click", function(){
			
			//상태 메시지 값을 설정하고 보낸다...
			if (gTop.curtab == 1){
				for (var i = 1 ; i <=5 ; i++){
					gTop.temp_status_list["om" + i] = $("#om" + i).val();
				}
			}else if (gTop.curtab == 2){
				for (var i = 1 ; i <=5 ; i++){
					gTop.temp_status_list["am" + i] = $("#am" + i).val();
				}
			}else if (gTop.curtab == 3){
				for (var i = 1 ; i <=5 ; i++){
					gTop.temp_status_list["dm" + i] = $("#dm" + i).val();
				}
			}
			_wsocket.change_status_setting();
			$("#user_profile_close").click();
			
			
		});
		
		$("#locale_cancel").on("click", function(){		
			$("#user_profile_close").click();
		});
		
		
		$("#status_cancel").on("click", function(){			
			$("#user_profile_close").click();
		});
		
		$("#user_profile_close").on("click", function(){
			
			if (gap.curpage == ""){
				$(".left-area").css("width", "100%");
			}
			gBody.rigth_btn_change_empty();
			$("#ext_body").fadeOut();
		});
		
		
		
		try{
			var alramopt = localStorage.getItem("alramon");
			if (alramopt == "off"){
				$('#alramoff').prop('checked',true);
			}else{
				$('#alramon').prop('checked',true);
			}
			
		}catch(e){}
		
		
		$(".set-alramsound input").on("click", function(){
			
			var opt = $(this).attr("id");
			try{
				if (opt == "alramon"){
					//알림을 울리는 것으로 설정한다.
					localStorage.setItem("alramon", "on");
				}else{
					//알림 소리를 제거한다.
					localStorage.setItem("alramon", "off");
				}
			}catch(e){}
			
		});
		
		
		//////////////////////////////////////////////////////
		try{
			var alramopt = localStorage.getItem("alramon2");
			if (alramopt == "off"){
				$('#alramoff2').prop('checked',true);
			}else{
				$('#alramon2').prop('checked',true);
			}
			
		}catch(e){}
		
		
		$(".set-alramsound2 input").on("click", function(){
			
			var opt = $(this).attr("id");
			try{
				if (opt == "alramon2"){
					//알림을 울리는 것으로 설정한다.
					localStorage.setItem("alramon2", "on");
				}else{
					//알림 소리를 제거한다.
					localStorage.setItem("alramon2", "off");
				}
			}catch(e){}
			
		});
	},
	
	"show_user_config" : function(){
		var html =
			'<div id="wrap_config_layer" class="mu_container mu_work layer_wrap gathering_write_pop center" style="width:720px;border-radius:25px;">' +
			'	<div class="layer_inner set_pop">' +
			'		<div class="pop_btn_close"></div>' +
			'		<h4>' + gap.lang.userConfig + '</h4>' +
			'		<div class="pop_top">' +
			'			<div class="inner left">' +
			'				<div class="set_sec set_lang">' +
			'					<h3>' + gap.lang.displaymenu + '</h3>' +
			'					<span class="radio_box">' +
			'						<input type="radio" name="group" value="1" id="kolang">' +
			'						<label for="kolang">' + gap.lang.kor + '</label>' +
			'					</span>' +
			'					<span class="radio_box">' +
			'						<input type="radio" name="group" value="2" id="enlang">' +
			'						<label for="enlang">' + gap.lang.eng + '</label>' +
			'					</span>' +
			'					<span class="radio_box">' +
			'						<input type="radio" name="group" value="3" id="zhlang">' +
			'						<label for="zhlang">' + gap.lang.cn + '</label>' +
			'					</span>' +
			'					<span class="radio_box">' +
			'						<input type="radio" name="group" value="4" id="jalang">' +
			'						<label for="jalang">' + gap.lang.jpn + '</label>' +
			'					</span>' +		
//			'					<span class="radio_box">' +
//			'						<input type="radio" name="group" value="5" id="vilang">' +
//			'						<label for="vilang">' + gap.lang.vietnamese + '</label>' +
//			'					</span>' +		
//			'					<span class="radio_box">' +
//			'						<input type="radio" name="group" value="6" id="idlang">' +
//			'						<label for="idlang">' + gap.lang.ind + '</label>' +
//			'					</span>' +			
			'				</div>' +
//			'				<div class="set_access_area">' +
//			'					<h3>접속지역</h3>' +
//			'					<div class="input-field selectbox">' +
//			'						<select>' +
//			'							<option value="">한국</option>' +
//			'						</select>' +
//			'					</div>' +
//			'				</div>' +
			'				<div class="set_sec set_sound">' +
			'					<h3>' + gap.lang.alramsound + '</h3>' +
			'					<span class="radio_box">' +
			'						<input type="radio" name="group2" value="11" id="alramon">' +
			'						<label for="alramon">On</label>' +
			'					</span>' +
			'					<span class="radio_box">' +
			'						<input type="radio" name="group2" value="22" id="alramoff">' +
			'						<label for="alramoff">Off</label>' +
			'					</span>' +
			'				</div>' +
			'				<div class="set_sec set_pop">' +
			'					<h3>' + gap.lang.alramsound2 + '</h3>' +
			'					<span class="radio_box">' +
			'						<input type="radio" name="group3" value="111" id="alramon2">' +
			'						<label for="alramon2">On</label>' +
			'					</span>' +
			'					<span class="radio_box">' +
			'						<input type="radio" name="group3" value="222" id="alramoff2">' +
			'						<label for="alramoff2">Off</label>' +
			'					</span>' +
			'				</div>' +
			
			'				<div class="set_access_browser">' +
			'					<h3>'+gap.lang.ba1+'</h3>' +
			'					<div class="input-field selectbox">' +
			'						<select id="default_browser_set">' +
			'							<option value="0">'+gap.lang.se1+'</option>' +
			'							<option value="1">'+gap.lang.se2+'</option>' +
			'							<option value="2">'+gap.lang.se3+'</option>' +
			'						</select>' +
			'					</div>' +
			'				</div>' +
			
			'				<div class="set_sec" style="margin-top:10px">' +
			'					<div class="g_w_pop_btn btn-password-change" >'+gap.lang.ba2+'</div>' +
			'				</div>' +
			
			'			</div>' +
			'			<div class="inner right">' +
			'				<div class="set_status_mes">' +
			'					<h3>' + gap.lang.status_title + '</h3>' +
			'					<span class="radio_box">' +
			'						<input type="radio" name="group1" value="1" id="status_title1" checked>' +
			'						<label for="status_title1">' + gap.lang.online + '</label>' +
			'					</span>' +
			'					<span class="radio_box">' +
			'						<input type="radio" name="group1" value="2" id="status_title2">' +
			'						<label for="status_title2">' + gap.lang.empty + '</label>' +
			'					</span>' +
			'					<span class="radio_box">' +
			'						<input type="radio" name="group1" value="3" id="status_title3">' +
			'						<label for="status_title3">' + gap.lang.donottouch + '</label>' +
			'					</span>' +
			'					<div id="dis_om">' +
			'						<input type="text" id="om1" placeholder="' + gap.lang.status_msg1 + '"/>' +
			'						<input type="text" id="om2" placeholder="' + gap.lang.status_msg2 + '"/>' +
			'						<input type="text" id="om3" placeholder="' + gap.lang.status_msg3 + '"/>' +
			'						<input type="text" id="om4" placeholder="' + gap.lang.status_msg4 + '"/>' +
			'						<input type="text" id="om5" placeholder="' + gap.lang.status_msg5 + '"/>' +
			'					</div>' +
			'					<div id="dis_am" style="display:none;">' +
			'						<input type="text" id="am1" placeholder="' + gap.lang.status_msg1 + '"/>' +
			'						<input type="text" id="am2" placeholder="' + gap.lang.status_msg2 + '"/>' +
			'						<input type="text" id="am3" placeholder="' + gap.lang.status_msg3 + '"/>' +
			'						<input type="text" id="am4" placeholder="' + gap.lang.status_msg4 + '"/>' +
			'						<input type="text" id="am5" placeholder="' + gap.lang.status_msg5 + '"/>' +
			'					</div>' +
			'					<div id="dis_dm" style="display:none;">' +
			'						<input type="text" id="dm1" placeholder="' + gap.lang.status_msg1 + '"/>' +
			'						<input type="text" id="dm2" placeholder="' + gap.lang.status_msg2 + '"/>' +
			'						<input type="text" id="dm3" placeholder="' + gap.lang.status_msg3 + '"/>' +
			'						<input type="text" id="dm4" placeholder="' + gap.lang.status_msg4 + '"/>' +
			'						<input type="text" id="dm5" placeholder="' + gap.lang.status_msg5 + '"/>' +
			'					</div>' +
			'					<span class="sub_txt">' + gap.lang.max5 + '</span>' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'		<div class="g_w_pop_btn_box">' +
			'			<div class="g_w_pop_btn s_w_submit">' + gap.lang.basic_save + '</div>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		gap.showBlock();
		
		$(html).appendTo('body');
		var $layer = $('#wrap_config_layer');
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
		
		// 메뉴 표시 언어
		var userid = gap.userinfo.userid;		
		var lang = localStorage.getItem(userid + "_lang");
		console.log("lang >>> " + lang);
		$layer.find('#' + lang + 'lang').prop('checked', true); 
		
		//기본 브라우저 설정하기
		
		var dsel = gap.etc_info.ct.ei;
		$('#default_browser_set').val(dsel);
		$('#default_browser_set').material_select();  //셀렉트 스타일을 지정한다.
		$('#default_browser_set').on('change',function() {			
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
		gTop.temp_status_list = new Object();
		if (gap.etc_info.ct){
			var etc_list = gap.etc_info.ct;
			gTop.temp_status_list = etc_list;
			
			for (var i = 1; i <= 5; i++){
				$layer.find("#om" + i).val(etc_list["om" + i]);			
				gTop.temp_status_list["om" + i] = etc_list["om" + i];
				
				$layer.find("#am" + i).val(etc_list["am" + i]);			
				gTop.temp_status_list["am" + i] = etc_list["am" + i];
				
				$layer.find("#dm" + i).val(etc_list["dm" + i]);			
				gTop.temp_status_list["dm" + i] = etc_list["dm" + i];
			}
		}
		
		
		$layer.find("[name=group1]").off().on("click", function(){
			if (gTop.curtab == 1){
				for (var i = 1; i <= 5; i++){
					gTop.temp_status_list["om" + i] = $layer.find("#om" + i).val();
				}
				
			}else if (gTop.curtab == 2){		
				for (var i = 1; i <= 5; i++){
					gTop.temp_status_list["am" + i] = $layer.find("#am" + i).val();
				}
				
			}else if (gTop.curtab == 3){
				for (var i = 1; i <= 5; i++){
					gTop.temp_status_list["dm" + i] = $layer.find("#dm" + i).val();
				}
			}

			var opt = $(this).val();
			if (opt == "1"){
				gTop.curtab = 1;
				$layer.find("#dis_om").show();
				$layer.find("#dis_am").hide();
				$layer.find("#dis_dm").hide();
				
				for (var i = 1; i <= 5; i++){
					$layer.find("#om" + i).val(gTop.temp_status_list["om" + i]);
				}
				
			}else if (opt == "2"){
				gTop.curtab = 2;
				$layer.find("#dis_om").hide();
				$layer.find("#dis_am").show();
				$layer.find("#dis_dm").hide();
				
				for (var i = 1; i <= 5; i++){
					$layer.find("#am" + i).val(gTop.temp_status_list["am" + i]);
				}
			}else if (opt == "3"){
				gTop.curtab = 3;
				$layer.find("#dis_om").hide();
				$layer.find("#dis_am").hide();
				$layer.find("#dis_dm").show();
				
				for (var i = 1; i <= 5; i++){
					$layer.find("#dm" + i).val(gTop.temp_status_list["dm" + i]);
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
		$layer.find('.pop_btn_close').off().on('click', function(){
			$layer.remove();
			gap.hideBlock();
			return false;
		});
		
		//비밀번호 초기화
		$layer.find('.btn-password-change').off().on("click", function(e){
			
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
		$layer.find('.s_w_submit').off().on('click', function(){
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
			if (gTop.curtab == 1){
				for (var i = 1 ; i <=5 ; i++){
					gTop.temp_status_list["om" + i] = $layer.find("#om" + i).val();
				}
			}else if (gTop.curtab == 2){
				for (var i = 1 ; i <=5 ; i++){
					gTop.temp_status_list["am" + i] = $layer.find("#am" + i).val();
				}
			}else if (gTop.curtab == 3){
				for (var i = 1 ; i <=5 ; i++){
					gTop.temp_status_list["dm" + i] = $layer.find("#dm" + i).val();
				}
			}
			_wsocket.change_status_setting();
			$layer.find('.pop_btn_close').click();
		});
		
	},
	
	"Open_Manual" : function(){
		$("#manual_title").text(gap.lang.videomanual);
		
		$("#manual_t1").text(gap.lang.manu1);
		$("#manual_t2").text(gap.lang.manu2);
		$("#manual_t3").text(gap.lang.manu3);
		$("#manual_t4").text(gap.lang.manu4);
		$("#manual_t5").text(gap.lang.manu5);
		$("#manual_t6").text(gap.lang.manu6);
		$("#manual_t7").text(gap.lang.manu7);
		$("#manual_t8").text(gap.lang.manu8);
		$("#manual_t9").text(gap.lang.manu9);
		
		
		var int = gap.maxZindex();
		$("#preview_manual").css("zIndex", parseInt(int)+1);
		$("#preview_manual").show();
		
		$("#manual_1").click();
		return false;
	},
	
	"my_profile_draw" : function(){
	
		var userinfo = gap.userinfo.rinfo;
		
		if (typeof(userinfo) != "undefined"){
	
			var person_img = gap.person_profile_photo(userinfo);
			var html = person_img;
			$("#my_profile_img").html(html);
		
		
			var disname = userinfo.nm + gap.lang.hoching;
		//	if (gap.userinfo.rinfo.el != userinfo.el){
		//		disname = userinfo.enm + gap.lang.hoching;
		//	}
			if (gap.curLang != "ko"){
				disname = userinfo.enm + gap.lang.hoching;
			}
			
			$("#user_profile_name").html(disname);
		}
		
				
	},
	
	"box_total_detail_search" : function(){
		var select_val = $("select[name=sel_detail_search]").val();
		$("#search_query_field").val($("#search_detail_query").val())
		$("select[name=sel_detail_search]").val('1');
		$("#search_detail_query").val('');
		$("#detail_search_btn").qtip("destroy");

		gTop.searchcnt = 1;
		gTop.topsearch_curcount = 0;
		gTop.box_total_search(select_val);	
	},
	
	"box_total_search" : function(_search_type){

		$("#left_main").hide();
		$("#main_body").hide();
		$("#right_menu").hide();
		$("#main_center").hide();
		$("#main_right_wrap").hide();
		
		$("#left_menu_list ul li").removeClass("act");
		
		$("#portal_search").show();
		
		
			
		
		
		gTop.select_search_type = _search_type;
		
		var query = $("#search_query_field").val();
		if (query == 0){
			gap.gAlert(gap.lang.input_search_query);
			$("#search_query_field").focus();
			return false;
		}
		
		if (query.trim().length == 1){
			gap.gAlert(gap.lang.valid_search_keyword);
			$("#search_query_field").focus();
			return false;
		}
		
		// 석새어가 1글자인 단어는 제외 (검색서버에서 검색 못함)
		var ret_qry = "";
		var qry_array = new Array();
		var qry_list = query.trim().split(" ");
		
		for (var i = 0; i < qry_list.length; i++){
			if (qry_list[i].length > 1){
				qry_array.push(qry_list[i]);
			}
		}
		ret_qry = qry_array.join(" ");
		
		var selected_tab = ""
		$("#ts_result_tabs li a").each(function(idx, item){
			if ($(item).hasClass("active")){
				selected_tab = $(item).parent().attr("id")
			}
		});
		
		if (selected_tab == "" || selected_tab == "ts_all"){
			var surl = gap.channelserver + "/mybox.km";
			var postData = JSON.stringify({
					"email" : gap.search_cur_ky(),
					"depts" : gap.full_dept_codes()
				});			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : postData,
				success : function(res){
					if (res.result == "OK"){
						gBody2.my_channel_info = $.map(res.data.channel, function(ret, key){
							return ret.ch_code
						}).join("-");
						
						gBody2.my_drive_info = $.map(res.data.drive, function(ret, key){
							return ret.ch_code
						}).join("-");
						
						gBody2.my_folder_info = $.map(res.data.folderlist, function(ret, key){
							return ret.ch_code
						}).join("-");
						
						
						gap.show_content("box_search");
						
						if ($("#ext_body_search").attr('class') == "right-area view-info"){
							$("#ext_body_search").removeClass("view-info");
						}
						$("#ext_body_search").addClass("channel view-info chat-area");
					//	$("#ext_body_search").addClass("view-info chat-area");
						$("#ext_body_search").css("overflow", "hidden");
						$("#ext_body_search").css("width", gap.right_box_page_width);
						$("#ext_body_search").show();
						$(".left-area").css("width", "calc(100% - " + gap.right_box_page_width + ")");
						gBody2.box_search(ret_qry, 'all', 1);
						gBody.cur_tab = "";
						gRM.is_box_layer_open = true;					

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
			var ts_categry = selected_tab.replace("ts_", "");
			gBody2.box_search_data(ret_qry, ts_categry, 1);
		}
	},
	
	"show_manual" : function(){
		var html =
			'<div id="wrap_manual_layer" class="layer_wrap manual-popup center" style="width:1370px;height:730px;">' +
			'	<div class="layer_inner" style="height:100%;">' +
			'		<div id="manual_close" class="pop_btn_close"></div>' +
			'		<div class="top-menu">' +
			'			<ul class="flex">' +
			'				<li class="on" id="dsw_manual"><span>' + gap.lang.dsw_manual + '</span></li>' +
			'				<li id="dsw_faq"><span>' + gap.lang.faq + '</span></li>' +
			'				<li id="dsw_qna"><span>' + gap.lang.qna + '</span></li>' +			
			'			</ul>' +
			'		</div>' +
			'		<div id="wrap_manual" class="bot-main flex">' +
			'			<div class="left-folder">' +
			'				<h2 class="f_between" style="line-height:1.6;">' + gap.lang.manual_folder + (manual_admin == 'T' ? ' <span id="add_folder_btn" class="add-btn">' + gap.lang.reg_folder + '</span>' : '') + '</h2>' +
			'				<div class="scroll" id="manual_folder_list">' +
			'					<ul class="flex">' +
			'					</ul>' +
			'				</div>' +
			'			</div>' +
			'			<div class="right-file">' +                           
			'				<h2 class="f_between" style="line-height:1.6;">' + gap.lang.manual_file + (manual_admin == 'T' ? ' <span id="add_file_btn" class="add-btn">' + gap.lang.reg_file + '</span>' : '') + '</h2>' +                               
			'				<div class="scroll" id="manual_file_list">' +
			'					<ul>' +
			'					</ul>' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'		<div id="wrap_faq" class="bot-main faq_pop" style="display:none;">' +
			'			<div class="aside-inner faq_search">' +
			'				<div class="input-field">' +
			'					<span id="search_faq_btn" class="ico ico-search"></span>' +
			'					<input type="text" id="input_faq_search" class="formInput" placeholder="' + gap.lang.input_search_query + '">';
		
		if (manual_admin == 'T'){
			html +=
				'					<button id="add_faq_btn" class="faq_btn">' + gap.lang.reg_faq + '</button>';			
		}

		html +=
			'				</div>' +
			'			</div>' +
			'			<div id="faq_data_list" class="faq_list">' +
			'			</div>' +
			'		</div>'			
			'	</div>' +
			'</div>';

		gap.showBlock();
		$(html).appendTo('body');
		var $layer = $('#wrap_manual_layer');
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
		$layer.wrap('<div id="common_work_layer" class="mu_container mu_work mu_group" style="top:-50%;"></div>');
		
		// dropzone 설정
		gTop.manual_upload_init('wrap_manual_layer');
		myDropzone_manual.removeAllFiles(true);
		
		// 폴더 목록 스크롤
		$("#manual_folder_list").mCustomScrollbar({
			theme:"dark",
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
		
		// 파일 목록 스크롤
		$("#manual_file_list").mCustomScrollbar({
			theme:"dark",
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
		
		// faq 목록 스크롤
		$("#faq_data_list").mCustomScrollbar({
			theme:"dark",
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
		
		
		// 폴더 리스트 호출
		gTop.draw_manual_folder($layer);
		
		// faq 리스트 호출
		gTop.draw_manual_faq($layer);
		
		// 이벤트 처리
		gTop.event_manual($layer);
	},
	
	
	
	
	
	
	
	"event_manual" : function($layer){
		// 매뉴얼 탭
		$layer.find('#dsw_manual').off().on('click', function(){
			if ($(this).hasClass('on')) return;
			$('.top-menu li').removeClass('on');
			$layer.find('#wrap_faq').hide();
			$layer.find('#wrap_manual').show();
			$(this).addClass('on');
		});
		
		// FAQ 탭
		$layer.find('#dsw_faq').off().on('click', function(){
			if ($(this).hasClass('on')) return;
			$('.top-menu li').removeClass('on');
			$layer.find('#wrap_manual').hide();
			$layer.find('#wrap_faq').show();
			$(this).addClass('on');
		});
		
		// Q&A 탭
		$layer.find('#dsw_qna').off().on('click', function(){
			var _url = "";
			if (gap.isDev){
				_url = "/DS_10/emate_app/bbs/b2211003.nsf/view01?openview";
				
			}else{
				_url = "http://dsp.daesang.com/DS_10/emate_app/bbs/b2211003.nsf/view01?openview";
			}
			gap.open_subwin(_url, '900', '700', 'yes', 'Q&A', 'yes');
		});
		
		// 닫기
		$layer.find('#manual_close').off().on('click', function(){
			$layer.parent().remove();
			gap.hideBlock();
			return false;
		});
		
		// 폴더 등록
		$layer.find('#add_folder_btn').off().on('click', function(){
			var html = 
				'<div id="add-folder" class="layer_wrap">' +
				'	<div class="layer_inner">' +
				'		<div id="add_folder_close" class="pop_btn_close"></div>' +
				'		<h4>' + gap.lang.reg_folder + '</h4>' +
				'		<div class="layer_cont">' +
				'			<div class="inner-wr">' +
				'				<span>' + gap.lang.folder_name + '</span>' +
				'				<div>' +
				'					<input type="text" id="folder_name" class="" placeholder="' + gap.lang.input_folder_name + '">' +
				'				</div>' +
				'			</div>' +
				'		</div>' +
				'		<div class="btn_wr">' +
				'			<button class="btn_layer confirm">' + gap.lang.basic_save + '</button>' +
				'		</div>' +
				'	</div>' +
				'</div>';
			
			if ($layer.find('#add-folder').length == 0){
				$layer.find('#manual_folder_list').addClass('rel');
				$layer.find('.left-folder .scroll').append(html);
				
				var $folder_layer = $('#add-folder');
				
				// 폴더 등록 레이어 닫기
				$folder_layer.find('#add_folder_close').off().on('click', function(){
					$folder_layer.remove();
					$layer.find('#manual_folder_list').removeClass('rel');
					return false;
				});
				
				// 폴더 저장
				$folder_layer.find('.confirm').off().on('click', function(){
					var folder_name = $folder_layer.find('#folder_name').val();
					
					if (folder_name == ""){
						mobiscroll.toast({message:gap.lang.input_folder_name, color:'danger'});
						return false;
					}
					
					
					var surl = gap.channelserver + "/folder_save_manual.km";
					var postData = {
							"folder_name" : folder_name,
							"owner" : gap.userinfo.rinfo
						};
					
					$.ajax({
						type : "POST",
						url : surl,
						dataType : "json",
						data : JSON.stringify(postData),
						success : function(res){
							if (res.result == "OK"){
								gTop.draw_manual_folder($layer);
								
								// 폴더등록 레이어 닫기
								$layer.find('#add-folder').remove();
								$layer.find('#manual_folder_list').removeClass('rel');
								
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
			}
		});
		
		// 파일 등록
		$layer.find('#add_file_btn').off().on('click', function(){
			if ($layer.find('#manual_folder_list li').hasClass('on')){
				$('#upload_manual_add_file').click();
				
			}else{
				mobiscroll.toast({message:gap.lang.select_reg_folder, color:'danger'});
				return false;
			}
		})
		
		// faq 검색 아이콘
		$layer.find('#search_faq_btn').off().on('click', function(){
			gTop.search_faq($layer, $layer.find('#input_faq_search').val());
		});
		
		// faq 검색 엔터
		$layer.find('#input_faq_search').keypress(function(e){
			if (e.keyCode == 13){
				gTop.search_faq($layer, $(this).val());
			}
		});
		
		// faq 등록
		$layer.find('#add_faq_btn').off().on('click', function(){
			var html = gTop.add_faq_html();
			
			if ($layer.find('#add_faq_layer').length == 0){
				$layer.prepend(html);
			}
			
			var $faq_layer = $('#add_faq_layer');
			
			// faq 등록 닫기
			$faq_layer.find('.pop_btn_close').off().on('click', function(){
				$faq_layer.remove();
				return false;
			});
			
			// faq 저장
			$faq_layer.find('.confirm').off().on('click', function(){
				var faq_name = $faq_layer.find('#faq_name').val();
				var faq_answer = $faq_layer.find('#faq_answer').val();
				
				if (faq_name == ""){
					mobiscroll.toast({message:gap.lang.input_subject_faq, color:'danger'});
					return false;
				}
				
				if (faq_answer == ""){
					mobiscroll.toast({message:gap.lang.input_answer, color:'danger'});
					return false;
				}
				
				
				var surl = gap.channelserver + "/faq_save_manual.km";
				var postData = {
						"title" : faq_name,
						"content" : faq_answer,
						"owner" : gap.userinfo.rinfo
					};
				
				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(postData),
					success : function(res){
						if (res.result == "OK"){
							gTop.draw_manual_faq($layer);
							
							// faq등록 레이어 닫기
							$layer.find('#add_faq_layer').remove();
							
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
			
		});
	},
	
	"draw_manual_folder" : function($layer){
		var surl = gap.channelserver + "/folder_list_manual.km";
		var postData = {};
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
		//	data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					$layer.find('#manual_folder_list ul').empty();
					
					var info = res.data.data;
					$(info).each(function(idx, val){
						var html =
							'<li id="' + val._id.$oid + '">' + val.folder_name +
							'<div class="abs ico ico-trash" style="display:none;">' + 
							'    삭제' +
							'</div>';
							'</li>';
						
						$layer.find('#manual_folder_list ul').append(html);
					});
					
					// 폴더 클릭
					$layer.find('#manual_folder_list li').off().on('click', function(e){
						var folder_id = $(this).attr('id');
						if (e.target.className == 'abs ico ico-trash'){
							gap.showConfirm({
								title: gap.lang.Confirm,
								iconClass: 'remove',
								contents: gap.lang.confirm_delete,
								callback: function(){
									var surl = gap.channelserver + "/folder_delete_manual.km";
									var postData = {
											"id" : folder_id
										};
									
									$.ajax({
										type : "POST",
										url : surl,
										dataType : "json",
										data : JSON.stringify(postData),
										success : function(res){
											if (res.result == "OK"){
												$layer.find('#' + folder_id).remove();
												$layer.find('#manual_file_list ul').empty();
												
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
							
						}else{
							$layer.find('#manual_folder_list li').removeClass('on');
							$(this).addClass('on');
							gTop.manual_folder_id = $(this).attr('id');
							gTop.draw_manual_file($layer);
						}
					});
					
					
					$layer.find('#manual_folder_list li').mouseover(function(){
						if (manual_admin == 'T'){
							$(this).find('.abs.ico.ico-trash').show();	
						}
					});
					
					$layer.find('#manual_folder_list li').mouseout(function(){
						$(this).find('.abs.ico.ico-trash').hide();
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
	
	"draw_manual_file" : function($layer){
		var surl = gap.channelserver + "/data_list_manual.km";
		var postData = {
				"folder" : gTop.manual_folder_id
			};
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					$layer.find('#manual_file_list ul').empty();
					
					var info = res.data.data;
					$(info).each(function(idx, val){
						var html = '';
						html +=	'<li id="' + val._id.$oid + '">';
						html +=	'	<div class="f_between file-li">';
						html +=	'		<span title="' + val.filename + '">' + val.filename + '</span>';
						html +=	'		<div>';
						html +=	'			<button class="ico ico-view">보기</button>';
						html +=	'			<button class="ico ico-down">다운로드</button>';
						if (manual_admin == 'T'){
							html +=	'			<button class="ico ico-del">삭제</button>';							
						}
						html +=	'		</div>';
						html +=	'	</div>';
						html +=	'</li>';

						$layer.find('#manual_file_list ul').append(html);
						$('#' + val._id.$oid).data('finfo', val);
					});
					
					// 버튼 클릭
					$layer.find('#manual_file_list button').off().on('click', function(e){
						var li_id = $(this).closest('li').attr('id');
						var finfo = $('#' + li_id).data('finfo');
						
						if (e.target.className == "ico ico-view"){
							// 미리보기
							var fserver = gap.channelserver;
							var fname = finfo.filename;
							var md5 = finfo.md5;
							var	upload_path = finfo.folder;
							
							gBody3.file_convert(fserver, fname, md5, '', 'manual', '', '', upload_path);
							
						}else if (e.target.className == "ico ico-down"){
							// 다운로드
							gTop.downloadManualFile(finfo._id.$oid);
							
						}else if (e.target.className == "ico ico-del"){
							// 삭제
                			gap.showConfirm({
                				title: gap.lang.basic_delete,
                				iconClass: 'remove',
                				contents: gap.lang.confirm_delete,
                				callback: function(){
                					var surl = gap.channelserver + "/data_delete_manual.km";
                					var postData = {
                							"id" : finfo._id.$oid
                						};
    							
                					$.ajax({
                						type : "POST",
                						url : surl,
                						dataType : "json",
                						data : JSON.stringify(postData),
                						success : function(res){
                							if (res.result == "OK"){
                								$('#' + finfo._id.$oid).remove();
    										
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
						}
					})
					
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
	
	"draw_manual_faq" : function($layer, qry, is_search){
		if (is_search){
			var surl = gap.channelserver + "/faq_search_manual.km";
			var postData = {
					"query" : qry
			};		
			
		}else{
			var surl = gap.channelserver + "/faq_list_manual.km";
			var postData = {};			
		}
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					$layer.find('#faq_data_list').empty();
					
					var info = res.data.data;
					$(info).each(function(idx, val){
						var html = '';
						html += '<div id="' + val._id.$oid + '" class="faq_count">';
						html += '	<div class="faq_tit">';
						html += '		<span class="num">' + (idx + 1) + '</span>';
						html += '		<span class="faq_q">' + val.title + '</span>';
						if (manual_admin == 'T'){
							html += '		<div class="faq_btn_box">';
							html += '			<button type="button" class="re"></button>';
							html += '			<button type="button" class="del"></button>';
							html += '		</div>';							
						}
						html += '		<span class="ico"></span>';
						html += '	</div>';
						html += '	<div class="faq_txt">';
						html += '		<div class="faq_a">';
						html += gap.message_check(val.content);
						html += '		</div>';
						html += '	</div>';
						html += '</div>';

						$layer.find('#faq_data_list').append(html);
						$('#' + val._id.$oid).data('info', val);
					});
					
					// 접기/펼치기 클릭
					$layer.find('.faq_tit').off().on('click', function(e){
						var $el;
						var _class = e.target.className;
						
						if (_class == "faq_tit" || _class == "faq_q" || _class == "ico"){
							// 제목 클릭
							$('#faq_data_list .faq_count').removeClass('on');
							
							$el = $(this).parent();
							$el.addClass('on');
							
						}else if (_class == "re"){
							// 수정
							$el = $(this).parent();
							var re_id = $el.attr('id');
							var info = $el.data('info');
							var html = gTop.add_faq_html(true);
							
							if ($layer.find('#add_faq_layer').length == 0){
								$layer.prepend(html);
							}
							
							var $faq_layer = $('#add_faq_layer');
							
							$faq_layer.find('#faq_name').val(info.title);
							$faq_layer.find('#faq_answer').val(info.content);
							
							// faq 수정 닫기
							$faq_layer.find('.pop_btn_close').off().on('click', function(){
								$faq_layer.remove();
								return false;
							});
							
							// faq 수정 저장
							$faq_layer.find('.confirm').off().on('click', function(){
								var faq_name = $faq_layer.find('#faq_name').val();
								var faq_answer = $faq_layer.find('#faq_answer').val();
								
								if (faq_name == ""){
									mobiscroll.toast({message:gap.lang.input_subject_faq, color:'danger'});
									return false;
								}
								
								if (faq_answer == ""){
									mobiscroll.toast({message:gap.lang.input_answer, color:'danger'});
									return false;
								}
								
								
								var surl = gap.channelserver + "/faq_update_manual.km";
								var postData = {
										"id" : re_id,
										"title" : faq_name,
										"content" : faq_answer,
										"owner" : gap.userinfo.rinfo
									};
								
								$.ajax({
									type : "POST",
									url : surl,
									dataType : "json",
									data : JSON.stringify(postData),
									success : function(res){
										if (res.result == "OK"){
											gTop.draw_manual_faq($layer);
											
											// faq등록 레이어 닫기
											$layer.find('#add_faq_layer').remove();
											
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
							
							
							
						}else if (_class == "del"){
							$el = $(this).parent();
							var del_id = $el.attr('id');
							
							// 삭제
							gap.showConfirm({
								title: gap.lang.basic_delete,
								iconClass: 'remove',
								contents: gap.lang.confirm_delete,
								callback: function(){
									var surl = gap.channelserver + "/faq_delete_manual.km";
									var postData = {
											"id" : del_id
										};
									
									$.ajax({
										type : "POST",
										url : surl,
										dataType : "json",
										data : JSON.stringify(postData),
										success : function(res){
											if (res.result == "OK"){
												gTop.draw_manual_faq($layer);
												
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
						}
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
	
	"add_faq_html" : function(is_edit){
		var html =
			'<div id="add_faq_layer" class="faq_reg" style="width: 592px; border: 1px solid #cfcdcd;">' +
			'	<div class="layer_inner">' +
			'		<div class="pop_btn_close"></div>' +
			'		<h4>' + (is_edit ? gap.lang.edit_faq : gap.lang.reg_faq) + '</h4>' +
			'		<div class="layer_cont left">' +
			'			<div class="cont_wr">' +
			'				<h5>' + gap.lang.question + '</h5>' +
			'				<input type="text" id="faq_name" class="input" placeholder="' + gap.lang.input_subject_faq + '">' +
			'			</div>' +
			'			<div class="cont_wr">' +
			'				<div class="rel">' +
			'					<h5>' + gap.lang.answer + '</h5>' +
			'				</div>' +
			'				<textarea id="faq_answer" class="input textarea" cols="30" rows="10" placeholder="' + gap.lang.input_answer + '"></textarea>' +
			'			</div>' +
			'		</div>' +
			'		<div class="btn_wr one">' +
			'			<button class="btn_layer confirm">' + gap.lang.basic_save + '</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		return html;
	},
		
	"manual_upload_init" : function(selectid){
		var dropzoneControl = $("#" + selectid)[0].dropzone;
		if (dropzoneControl) {
			dropzoneControl.destroy();
		}
		
		myDropzone_manual = new Dropzone("#"+selectid, { // Make the whole body a dropzone
			url: gap.channelserver + "/FileControl_manual.do", // Set the url
			autoProcessQueue : true, 
			parallelUploads : 100,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
			maxFilesize: 1000,
			timeout: 180000,
			uploadMultiple: true,
			withCredentials: false,
			previewsContainer: "#previews_channel", // Define the container to display the previews
			clickable: "#upload_manual_add_file", // Define the element that should be used as click trigger to select files.
			renameFile: function(file){		
				return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			},
			init: function() {		
				myDropzone_manual = this;
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
		    addedfile: function (file) {
				if (file.size > (this.options.maxFilesize * 1024 * 1024)){
					this.removeFile(file);
					gap.gAlert("'" + file.name + "'" + "" + gap.lang.file_ex + "\n(MaxSize : " + this.options.maxFilesize + "M)");
					return false;
				}
			},
			success : function(file, json){
				var jj = JSON.parse(json);	    	  
			}
		});
		
		myDropzone_manual.on("totaluploadprogress", function(progress) {	
		//	$("#show_loading_progress").text(parseInt(progress) + "%");
		//	document.querySelector("#total-progress_channel .progress-bar").style.width = progress + "%";
		});
		
		myDropzone_manual.on("sending", function (file, xhr, formData) {	
		//	gap.show_loading(gap.lang.saving);
			
			$("#"+selectid).css("border", "");
			
			formData.append("folder", gTop.manual_folder_id);
			formData.append("owner", JSON.stringify(gap.userinfo.rinfo));
			formData.append("fserver", gap.channelserver);
			formData.append("saveFolder", "manual");
			
			myDropzone_manual.files_info = "";
		});
		
		myDropzone_manual.on("queuecomplete", function (file) {
			// 파일 업로드 후 실행
			//gap.hide_loading();
			var $layer = $('#wrap_manual_layer');
			gTop.draw_manual_file($layer);
			gTop.clearDropzone();
			
		});
	},
	
	"clearDropzone" : function(){
		if (typeof(myDropzone_manual) != "undefined"){
			myDropzone_manual.removeAllFiles(true);	
		}
	},
	
	"downloadManualFile" : function(_key){
		var downloadurl = gap.channelserver + "/FDownload_manual.do?key=" + _key;
		
		var link = document.createElement("a");
		$(link).click(function(e) {
			e.preventDefault();
			window.location.href = downloadurl;
		});
		$(link).click();
	},
	
	"search_faq" : function($layer, qry){
		if (qry == ""){
			mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
			return false;
		}
		
		gTop.draw_manual_faq($layer, qry, true);
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
				'					<li id="menu_mng">메뉴 관리</li>' +
				'					<li id="m_menu_mng">모바일 메뉴 관리</li>' +
				'					<li id="portlet_mng">포틀릿 관리</li>';
		}
		
		if (filelog_admin == 'T'){
			html += '					<li id="file_log">File 로그</li>';
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
			'						<div class="input-field selectbox t_sec_sel">' +
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
			'							<button id="menu_upload_btn" style="display: none; width: auto;border-radius: 10px;text-align: center;padding: 0 27px;margin-right: 0;margin-left: 10px;height: 38px;font-size: 13.5px;font-weight: bold;border: none;color: rgba(255, 255, 255, 0.8);background-color: #71368d;">업로드</button>' +
			'							<button id="m_menu_upload_btn" style="display: none; width: auto;border-radius: 10px;text-align: center;padding: 0 27px;margin-right: 0;margin-left: 10px;height: 38px;font-size: 13.5px;font-weight: bold;border: none;color: rgba(255, 255, 255, 0.8);background-color: #71368d;">업로드</button>' +
			'							<button id="portlet_upload_btn" style="display: none; width: auto;border-radius: 10px;text-align: center;padding: 0 27px;margin-right: 0;margin-left: 10px;height: 38px;font-size: 13.5px;font-weight: bold;border: none;color: rgba(255, 255, 255, 0.8);background-color: #71368d;">업로드</button>' +
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
		}else if (_type == "menu_mng"){
			html +=
				'<thead>' +
				'	<tr>' +
				'		<th style="width: 100px" class="inb">아이콘</th>' +
				'		<th style="width: 100px" class="inb">Key</th>' +
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
				
		}
		

		$('#admin_log_layer .t_sec .cal').hide();
		$('#log_download_btn').hide();
		$('#menu_upload_btn').hide();
		$('#m_menu_upload_btn').hide();
		$('#portlet_upload_btn').hide();
		
		
		if (_type == "menu_mng"){
			$('#menu_upload_btn').show();
		} else if (_type == "m_menu_mng"){
			$('#m_menu_upload_btn').show();
		} else if (_type == "portlet_mng"){
			$('#portlet_upload_btn').show();
		} else {
			$('#admin_log_layer .t_sec .cal').show();
			$('#log_download_btn').show();
		}
		
		
		$('#admin_log_head').html(html);
		$('#search_field').html(select_html);
		$('#search_field').material_select();
	},
	
	"show_admin_log" : function(){
		var html = gTop.admin_log_main_html();	
		
		gap.showBlock();
		$(html).appendTo('body');
		var $layer = $('#admin_log_layer');
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
		$layer.wrap('<div id="common_work_layer" class="mu_container mu_work mu_group" style="top:-50%;"></div>');
		
		if (menu_admin == 'T') {
			gTop.admin_log_menu = "menu_mng";	
		} else {
			gTop.admin_log_menu = "file_log";
		}
		$('#' + gTop.admin_log_menu).addClass('on');
		
		gTop.admin_log_head_html(gTop.admin_log_menu);
		
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
		gTop.draw_admin_log_list(1);
		
		// 왼쪽 메뉴 클릭
		$layer.find(".left-nav ul li").on("click", function(){
			$layer.find(".left-nav ul li").removeClass("on");
			$(this).addClass("on");
			gTop.admin_log_menu = $(this).attr("id")
			
			if (gTop.admin_log_menu == "arch_search"){
				// 아카이빙 검색 새창
				var url = "";
				if (gap.isDev){
					url = "http://dswdvarmc01.daesang.com";
				}else{
					url = "https://dsw.daesang.com";
				}
				url += "/arch/KPortal.nsf/arch_admin?openform";
			//	window.open(url, gTop.admin_log_menu, null);
				gap.open_subwin(url, "1590", "850", "yes" , gTop.admin_log_menu, "yes");
				
			}else{
				// 그 외
				var s_date = moment().add(-1, 'y');
				var e_date = moment();
				
				$('#ws_s_date').val(s_date.format('YYYY-MM-DD'));
				$('#ws_e_date').val(e_date.format('YYYY-MM-DD'));
				gTop.admin_log_query = "";
				$layer.find("#log_search_txt").val("");
				$layer.find(".btn-search-close").hide();
				
				gTop.admin_log_head_html(gTop.admin_log_menu);
				gTop.draw_admin_log_list(1);
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
				
				gTop.admin_log_query = $(this).val();
				gTop.draw_admin_log_list(1);
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
			
			gTop.admin_log_query = $layer.find('#log_search_txt').val();
			gTop.draw_admin_log_list(1);
		});
		
		// 검색 초기화
		$layer.find(".btn-search-close").on("click", function(){
			var s_date = moment().add(-1, 'y');
			var e_date = moment();
			
			$('#ws_s_date').val(s_date.format('YYYY-MM-DD'));
			$('#ws_e_date').val(e_date.format('YYYY-MM-DD'));
			gTop.admin_log_query = "";
			$layer.find("#log_search_txt").val("");
			$layer.find(".btn-search-close").hide();
			gTop.draw_admin_log_list(1);
		});
		
		// 다운로드 버튼
		$layer.find("#log_download_btn").off().on('click', function(){
			gTop.download_log_file();
		});
		
		// 메뉴 업로드 버튼
		$layer.find("#menu_upload_btn").off().on('click', function(){
			gTop.show_menu_upload();
		});
		
		// 모바일 메뉴 업로드 버튼
		$layer.find("#m_menu_upload_btn").off().on('click', function(){
			gTop.show_mobile_menu_upload();
		});
		
		// 포틀릿 업로드 버튼
		$layer.find("#portlet_upload_btn").off().on('click', function(){
			gTop.show_portlet_upload();
		});
		
		// 닫기
		$layer.find(".pop_btn_close").on("click", function(){
			$('#admin_log_layer').parent().remove();
			gap.remove_layer('admin_log_layer');
			//gap.remove_layer('common_work_layer');
		});
	},
	
	"download_log_file" : function(_fserver, _type, _key, _md5, _dkind){
		var s_date = moment($('#ws_s_date').val()).utc().local().format('YYYYMMDD') + '000000';
		var e_date = moment($('#ws_e_date').val()).utc().local().format('YYYYMMDD') + '999999';
		var opt = "";
		
		if (gTop.admin_log_menu == "file_log"){
			opt = "preview";
			
		}else if (gTop.admin_log_menu == "arch_search_log"){
			opt = "archive";
			
		}else if (gTop.admin_log_menu == "dsw_login_log"){
			opt = "login";
			s_date += '000';
			e_date += '999';
		}
		
		var downloadurl = gap.channelserver + "/FDownload_admin_preview.do?"
			+ "from=" + s_date 
			+ "&to=" + e_date 
			+ "&category=" + (gTop.admin_log_query != "" ? $('#search_field').val() : "")
			+ "&query=" + gTop.admin_log_query
			+ "&opt=" + opt;
		
		var link = document.createElement("a");
		$(link).click(function(e) {
			e.preventDefault();
			window.location.href = downloadurl;
		});
		$(link).click();
	},
	
	"show_menu_upload" : function(info){
		var _self = this;
		
		var html = 
			'<div id="menu_upload_layer" class="reg-menu-ly">' +
			'	<div class="layer-inner">' +
			'		<div class="btn-close pop_btn_close"></div>' +
			'		<h4>메뉴 등록</h4>' +
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
		var is_mobile = false;
		this.menu_upload_event(is_edit, is_mobile);
		
		// 편집으로 여는 경우
		if (is_edit) {
			$('#reg_menu_code').val(info.code).prop('readonly', true);
			$('#reg_menu_code').data('sort', info.sort);
			$('#reg_menu_bgcolor').val(info.bg);
			$('#reg_menu_name_kr').val(gap.textToHtml(info.menu_kr));
			$('#reg_menu_name_en').val(gap.textToHtml(info.menu_en));
			$('#reg_menu_link').val(info.link);
			
			$('#reg_menu_key_check').hide();
			
			// 아이콘
			var icon_src = gap.channelserver + "/menuicon.do?code=" + info.code + '&ver=' + info.last_update;
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
			'	<div class="layer-inner">' +
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
	
	"menu_remove" : function(code, menu_nm, is_mobile){
		var _self = this;
		var _url = gap.channelserver;
		_url += (is_mobile ? "/appstore_mobile_delete.km" : "/appstore_delete.km");
		
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
		
		var _url = gap.channelserver;
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
				check_url += (is_mobile ? "//appstore_mobile_dual_check.km" : "/appstore_dual_check.km");
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
			alert('Key를 입력해주세요');
			$('#reg_menu_code').focus();
			return false;
		}
		
		// 이미지 선택 여부
		// 신규 등록인데 이미지가 없으면 안됨
		if (!myDropzone_menuico.is_edit && myDropzone_menuico.files.length == 0) {
			alert('이미지를 선택해주세요');
			$('#reg_menu_add_file').click();
			return false;
		}
		
		// 메뉴명 (한글, 영문)
		var _menu_kr = $.trim($('#reg_menu_name_kr').val());
		var _menu_en = $.trim($('#reg_menu_name_en').val());
		if (!_menu_kr) {
			alert('메뉴명(한글)을 입력해주세요.');
			$('#reg_menu_name_kr').focus();
			return false;
		}
		if (!_menu_en) {
			alert('메뉴명(영문)을 입력해주세요.');
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
						alert('링크 URL을 입력해주세요.');
						$('#reg_menu_link').focus();
						return false;
					}
				}else{
					var _and_link = $.trim($('#txt_deeplink_android').val());
					var _ios_link = $.trim($('#txt_deeplink_ios').val());
					if (!_and_link) {
						alert('딥링크 (안드로이드) URL을 입력하세요.');
						$('#txt_deeplink_android').focus();
						return false;
					}
					if (!_ios_link) {
						alert('딥링크 (iOS) URL을 입력하세요.');
						$('#txt_deeplink_ios').focus();
						return false;
					}
					
				}
			}
		} else {
			// 링크 URL
			var _url_link = $.trim($('#reg_menu_link').val());
			if (!_url_link) {
				alert('링크 URL을 입력해주세요.');
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
		_url += (is_mobile ? "/appstore_mobile_save.km" : "/appstore_save.km");

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
	
	"add_menu_mnguser" : function(user_info){	// 담당자 추가
		var $list = $('#menu_mng_user_list');
		var ck = $list.find('li[data-key="' + user_info.ky + '"]');
		if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
		
				
		var disp_txt = '';
		user_info = gap.user_check(user_info);
		disp_txt = '<a onclick="gap.showUserDetailLayer(\'' + user_info.ky + '\')">' + user_info.name + ' ' + user_info.jt + ' | ' + user_info.dept + '</a>';
				
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
			disp_txt = '<a onclick="gap.showUserDetailLayer(\'' + user_info.ky + '\')">' + user_info.name + ' ' + user_info.jt + ' | ' + user_info.dept + '</a>';			
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
			gTop.start_page = "1";
			gTop.cur_page = "1";
		}

		var s_date = moment($('#ws_s_date').val()).utc().local().format('YYYYMMDD') + '000000';
		var e_date = moment($('#ws_e_date').val()).utc().local().format('YYYYMMDD') + '999999';
		
		gTop.start_skp = (parseInt(gTop.per_page) * (parseInt(page_no))) - (parseInt(gTop.per_page) - 1);
		
		if (gTop.admin_log_menu == "file_log"){
			var surl = gap.channelserver + "/admin_log_search.km";
			var postData = {
					"start" : (gTop.start_skp - 1).toString(),
					"perpage" : gTop.per_page,
					"from" : s_date,
					"to" : e_date,
					"category" : (gTop.admin_log_query != "" ? $('#search_field').val() : ""),
					"query" : gTop.admin_log_query
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
					
					if (gTop.admin_log_query != ""){
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
								_action_txt = "즐겨찾기(업무방)";
								
							}else{
								_action_txt = "즐겨찾기(Files)";
							}
							
						}
						
						_html += '<tr id="' + _info._id.$oid + '">';
						_html += '	<td>' + _device_txt + '</td>';
						_html += '	<td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + _action_txt + '">' + _action_txt + '</td>';
						_html += '	<td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + _filename + '">' + _filename + '</td>';
						_html += '	<td>' + _actor_info.disp_user_info + '</td>';
						_html += '	<td>' + gTop.convertGMTLocalDateTime(_info.action_time) + '</td>';
						_html += '	<td style="text-align: center !important;"><button class="ico ico-view">보기</button></td>';
					//	_html += '	<td><button class="ico ico-down">다운로드</button></td>';
						_html += '</tr>';
						
						$layer.find("#admin_log_list").append(_html);
						$layer.find("#" + _info._id.$oid).data('info', _info);
					}
					
					//페이징
					gTop.total_data_count = res.data.total;
					gTop.total_page_count = gTop.getPageCount(gTop.total_data_count, gTop.per_page);
					gTop.initializePage('log_paging_area');
					
					// 이벤츠 처리
					gTop.event_admin_log_list($layer);
					
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});			
			
		}else if (gTop.admin_log_menu == "arch_search_log"){
			var surl = gap.channelserver + "/admin_log_archive_search.km";
			var postData = {
					"start" : (gTop.start_skp - 1).toString(),
					"perpage" : gTop.per_page,
					"from" : s_date,
					"to" : e_date,
					"category" : (gTop.admin_log_query != "" ? $('#search_field').val() : ""),
					"query" : gTop.admin_log_query
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
					
					if (gTop.admin_log_query != ""){
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
						_html += '	<td>' + gTop.convertGMTLocalDateTime(_info.action_time) + '</td>';
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
					gTop.total_data_count = res.data.total;
					gTop.total_page_count = gTop.getPageCount(gTop.total_data_count, gTop.per_page);
					gTop.initializePage('log_paging_area');
					
					// 이벤츠 처리
					gTop.event_admin_log_list($layer);
					
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});			
			
		}else if (gTop.admin_log_menu == "dsw_login_log"){
			var surl = gap.channelserver + "/admin_log_login_search.km";
			var postData = {
					"start" : (gTop.start_skp - 1).toString(),
					"perpage" : gTop.per_page,
					"from" : s_date + '000',
					"to" : e_date + '999',
					"category" : (gTop.admin_log_query != "" ? $('#search_field').val() : ""),
					"query" : gTop.admin_log_query
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
					
					if (gTop.admin_log_query != ""){
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
						_html += '	<td>' + gTop.convertGMTLocalDateTime(_info.dt.$numberLong) + '</td>';
						_html += '	<td>' + _info.lid + '</td>';
						_html += '	<td>' + _device_txt + '</td>';
						_html += '	<td style="text-align: center !important;">' + _mobile_device_txt + '</td>';
						_html += '</tr>';
						
						$layer.find("#admin_log_list").append(_html);
						$layer.find("#" + _info._id.$oid).data('info', _info);
					}
					
					//페이징
					gTop.total_data_count = res.data.total;
					gTop.total_page_count = gTop.getPageCount(gTop.total_data_count, gTop.per_page);
					gTop.initializePage('log_paging_area');
					
					// 이벤츠 처리
					gTop.event_admin_log_list($layer);
					
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
			
		}else if (gTop.admin_log_menu == "menu_mng"){
			var surl = gap.channelserver + "/api/portal/appstore_list.km";
			var postData = {
					"start" : (gTop.start_skp - 1).toString(),
					"perpage" : gTop.per_page,
					"query" : gTop.admin_log_query,
					"admin" : "T"
				};
			
			if (gTop.admin_log_query) {
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
					
					if (gTop.admin_log_query != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find("#admin_log_list").empty();
					
					var _default_bg = '#fde6d9';	// 기본 백그라운드 색상
					
					for (var i = 0; i < _list.length; i++){
						var _info = _list[i];						
						var _key = _info.code;
						var _icon_src = gap.channelserver + "/menuicon.do?code=" + _key + '&ver=' + _info.last_update;
						var _icon_img = '<div class="menu-list-icon-preview" style="background-image:url(' + _icon_src + ');"></div>';
						_icon_img = '<div class="menu-list-icon-preview-wrap" style="background-color:' + (_info.bg ? _info.bg : _default_bg) + '">' + _icon_img + '</div>';
						
						var _html = "";					
						_html += '<tr id="' + _info._id.$oid + '" class="menu-list-tr">';
						_html += '	<td>' + _icon_img + '</td>';
						_html += '	<td>' + _key + '</td>';
						_html += '	<td>' + _info.menu_kr + '</td>';
						_html += '	<td>' + (_info.im_disable == 'T' ? '✔' : '') + '</td>';
						_html += '	<td><button type="button" class="btn-menu-remove" data-key="' + _key + '" data-name="' + _info.menu_kr + '">삭제</button></td>';
						_html += '	<td><span class="menu-link">' + _info.link + '</span></td>';
						_html += '</tr>';
						
						$layer.find("#admin_log_list").append(_html);
						$layer.find("#" + _info._id.$oid).data('info', _info);
					}
					
					//페이징
					gTop.total_data_count = res.data.total;
					gTop.total_page_count = gTop.getPageCount(gTop.total_data_count, gTop.per_page);
					gTop.initializePage('log_paging_area');
					
					// 이벤츠 처리
					gTop.event_admin_log_list($layer);
					
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
		}else if (gTop.admin_log_menu == "m_menu_mng"){
			var surl = gap.channelserver + "/appstore_mobile_list.km";
			var postData = {
					"start" : (gTop.start_skp - 1).toString(),
					"perpage" : gTop.per_page,
					"query" : gTop.admin_log_query,
					"admin" : "T"
				};
			
			// 페이지 초기화
			$('#log_paging_area').empty();
			
			if (gTop.admin_log_query) {
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
					
					if (gTop.admin_log_query != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find("#admin_log_list").empty();
					
					var _default_bg = '#fde6d9';	// 기본 백그라운드 색상
					
					for (var i = 0; i < _list.length; i++){
						var _info = _list[i];						
						var _key = _info.code;
						var _icon_src = gap.channelserver + "/menuicon_mobile.do?code=" + _key + '&ver=' + _info.last_update;
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
					gTop.total_data_count = res.data.total;
					gTop.total_page_count = gTop.getPageCount(gTop.total_data_count, gTop.per_page);
					gTop.initializePage('log_paging_area');
					
					// 이벤츠 처리
					gTop.event_admin_log_list($layer);
					
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
		}else if (gTop.admin_log_menu == "portlet_mng"){
			var surl = gap.channelserver + "/portlet_list.km";
			var postData = {
					"start" : (gTop.start_skp - 1).toString(),
					"perpage" : gTop.per_page,
					"query" : gTop.admin_log_query,
					"admin" : "T"
				};
			
			if (gTop.admin_log_query) {
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
					
					if (gTop.admin_log_query != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find("#admin_log_list").empty();
					
					for (var i = 0; i < _list.length; i++){
						var _info = _list[i];						
						var _key = _info.code;
						
						var _icon_src = gap.channelserver + "/portletpreview.do?code=" + _key + '&ver=' + _info.last_update;
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
					gTop.total_data_count = res.data.total;
					gTop.total_page_count = gTop.getPageCount(gTop.total_data_count, gTop.per_page);
					gTop.initializePage('log_paging_area');
					
					// 이벤츠 처리
					gTop.event_admin_log_list($layer);
					
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
			
			if (gTop.admin_log_menu == "portlet_mng") {
				_self.show_portlet_upload(_info);
			} else if (gTop.admin_log_menu == "m_menu_mng") {
				_self.show_mobile_menu_upload(_info);
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
			var _code = $(this).data('key');
			var _name = $(this).data('name');
			
			if (gTop.admin_log_menu == "portlet_mng") {
				_self.portlet_remove(_code, _name);
			} else if (gTop.admin_log_menu == "m_menu_mng") {
				_self.menu_remove(_code, _name, true);
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
		return ret_page_count = Math.floor(gTop.total_data_count / rows) + (((gTop.total_data_count % rows) > 0) ? 1 : 0);
	},
	
	"initializePage" : function(id){
		var alldocuments = gTop.total_data_count;
		if (alldocuments % gTop.per_page > 0 & alldocuments % gTop.per_page < gTop.per_page/2 ){
			gTop.all_page = Number(Math.round(alldocuments/gTop.per_page)) + 1
		}else{
			gTop.all_page = Number(Math.round(alldocuments/gTop.per_page))
		}	

		if (gTop.start_page % gTop.per_page > 0 & gTop.start_page % gTop.per_page < gTop.per_page/2 ){
			gTop.cur_page = Number(Math.round(gTop.start_page/gTop.per_page)) + 1
		}else{
			gTop.cur_page = Number(Math.round(gTop.start_page/gTop.per_page))
		}

		gTop.initializeNavigator(id);		
	},
	
	"initializeNavigator" : function(id){
		var alldocuments = gTop.total_data_count;

		if (gTop.total_page_count == 0){
			gTop.total_page_count = 1;
		}

		if (alldocuments == 0){
			alldocuments = 1;
			gTop.total_page_count = 1;
			gTop.cur_page = 1;
		}

		if (alldocuments != 0) {
			if (gTop.total_page_count % 10 > 0 & gTop.total_page_count % 10 < 5 ){
				var all_frame = Number(Math.round(gTop.total_page_count / 10)) + 1
			}else{
				var all_frame = Number(Math.round(gTop.total_page_count / 10))	
			}

			if (gTop.cur_page % 10 > 0 & gTop.cur_page % 10 < 5 ){
				var c_frame = Number(Math.round(gTop.cur_page / 10)) + 1
			}else{
				var c_frame = Number(Math.round(gTop.cur_page / 10))
			}

			var nav = new Array();
			if (c_frame == 1){
				nav[0] = '<ul class="pagination inb">';
			}else{
				nav[0] = '<div class="arrow prev" onclick="gTop.gotoPage(' + ((((c_frame-1) * 10) - 1)*gTop.per_page + 1) + ',' + ((c_frame - 1) * 10) + ');"></div><ul class="pagination inb">';
			}			
			
			var pIndex = 1;
			var start_page = ((c_frame-1) * 10) + 1;

			for (var i = start_page; i < start_page + 10; i++){
				if (i == gTop.cur_page){
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
						nav[pIndex] = '<li onclick="gTop.gotoPage(' + (((i-1) * gTop.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
					}else{
						if (i % 10 == '1' ){
							nav[pIndex] = '<li onclick="gTop.gotoPage(' + (((i-1) * gTop.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}else{
							nav[pIndex] = '<li onclick="gTop.gotoPage(' + (((i-1) * gTop.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}
					}
				}				

				if (i == gTop.total_page_count) {
					break;
				}
				pIndex++;				
			}

			if (c_frame < all_frame){
				nav[nav.length] = '</ul><div class="arrow next" onclick="gTop.gotoPage(' + ((c_frame * gTop.per_page * 10) + 1) + ',' + ((c_frame * 10) + 1) + ');"></div>';
				
			}else{
				nav[nav.length] = '</ul>';
			}
			
		
			var nav_html = '';

			if (c_frame != 1 ){
			//	nav_html = '<li class="p-first" onclick="gTop.gotoPage(1,1);"><span>처음</span></li>';
			}		    
			for( var i = 0 ; i < nav.length ; i++){	
				nav_html += nav[i];
			}
					

			if (c_frame < all_frame){
			//	nav_html += '<li class="p-last" onclick="gTop.gotoPage(' + ((gTop.all_page - 1) * gTop.per_page + 1) + ',' + gTop.all_page + ')"><span>마지막</span></li>';
			}
			$("#" + id).html(nav_html);
		}		
	},
	
	"gotoPage" : function(idx, page_num){
		if (gTop.total_data_count < idx) {
			gTop.start_page = idx - 10;
			if ( gTop.start_page < 1 ) {
				return;
			}
		}else{
			gTop.start_page = idx;
		}
		cur_page = page_num;
		gTop.draw_admin_log_list(page_num);
	},
	
	
	
	"count_check_noti" : function(){
		var url = location.protocol + "//" + location.host + "/noti/notisum";
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content","application/json; charset=utf-8");
			},
			success : function(res){
				var list = res.content;
				var unread_count = 0;
				for (var i = 0 ; i < list.length; i++){
					var info = list[i];
					unread_count += info.unread;					
				}
				
				
				if (unread_count > 1){		
					$("#new_alram_menu").removeClass("act");
					$("#new_alram_menu").addClass("act");
				}else{
					$("#new_alram_menu").removeClass("act");
				}
			}
		});
	},
	
	
	"draw_alram_main" : function(){
		
		$("#unck").text(gap.lang.ur);
		$("#allck").text(gap.lang.All);
		
		gTop.cur_window = "main";
		
		$("#qsearch_layer").hide();
		$("#alram_list_main").removeClass("alarm-cont");		
		
		$("#unread_count_title").html(gap.lang.ur);
		$("#all_count_title").html(gap.lang.All);
		$("#allread").html(gap.lang.allread);
		
		gTop.nid = "";
		gTop.sty = "";
		gTop.skip = 0;
		gTop.alramsearch = "F";
	
		
		var url = location.protocol + "//" + location.host + "/noti/notisum";
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				var list = res.content;
				var html = "";
				
				
				
				for (var i = 0  ; i < list.length; i++){
					var info = list[i];
					var title = "";
					var cnt = info.total;
					var unread = info.unread;
					if (info.nid == "dsw_mail"){
						title = info.sty;
					}else{
					//	title = info.nid;
						title = info.nm;
					}
					
					
					html += "<li data-nid='"+info.nid+"' data-sty='"+info.sty+"'>";
					html += "	<p class='alarm-type' style='width:170px; height:35px; line-height:35px; text-align:center'>"+title+"</p>";
				//	html += "	<p><span class='alarm-num'>"+cnt+""+gap.lang.total_attach_count_txt+"</span></p>";
					
					
					if (gTop.cur_tab == "unread"){
						html += "	<p><span class='alarm-num'>"+ unread + "" + gap.lang.total_attach_count_txt+"</span></p>";
					}else{
						html += "	<p><span class='alarm-num'>"+ unread + " / " + cnt+""+gap.lang.total_attach_count_txt+"</span></p>";
					}
					
					html += "</li>";
					
					//cnt가 0일 경우 상단 항모에 불은점을 제거해야 한다.
					if (cnt == 0){
						$("#new_alram_menu").removeClass("act");
					}
					
				}
				
				
				
				
				$("#alram_list_ul").html(html);
								
				$("#alram_list_ul li").off().on("click", function(e){
					
					$("#alram_list_main").addClass("alarm-cont");					
					$("#qsearch_layer").show();
					
								
					$("#alram_list_ul").empty();
					
					var info = $(e.currentTarget);
					gTop.nid = info.data("nid");
					gTop.sty = info.data("sty");
					gTop.skip = 0;
					
					var html = "";
					html += "<div class='btn_return' id='alram_back' style='margin-bottom:15px; margin-left:15px'>";
					html += "	<button class='arrow_wr'>";
					html += "	<span class='prev arrow icon' style='margin-right:6px'></span>"+gap.lang.back+"</button>";
					html += "</div>";
					
					html += "<div id='alram_scroll' style=' height: 100%'>";
					html += "<ul id='alram_list_ul2' style='width:94%; padding : 10px 10px 0 0 ; height: calc(100% - 40px)'>";
					
					html += "</ul> ";
					html += "</div>";
					
					$("#alram_list_ul").show();
					$("#alram_list_ul").html(html);
					
					gTop.alram_addContent()
					
					
				});	
				
				
				$("#alram_close_btn").on("click", function(e){
					$("#alram_layer").fadeOut();
				});
				
				
			},
			error : function(e){
				gap.error_alert();
			}
		});	
		
	},
	
	"alram_addContent" : function(){
		
		gTop.cur_window = "sub";

		if (gTop.alramsearch == "T"){
			return false;
		}
		var postdata = JSON.stringify({
			nid : gTop.nid,
			sty : gTop.sty,
			skip : gTop.skip,
			limit : 20,
			unread : ((gTop.cur_tab == "unread") ? "T" : "F")
		})
	
		var url = location.protocol + "//" + location.host + "/noti/notilist";
		$.ajax({
			type : "POST",
			url : url,
			data : postdata,
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){				
//				var list = res.content;				
//				var html = "";					
//				for (var i = 0 ; i < list.length ; i++){
//					var info = list[i];
//					var title = info.tit;
//					var date = moment(info.dt).utc().format("YYYY-MM-DD hh:mm");
//					var name = info.send.nm;
//					var read = info.read;
//					var id = info.id;
//					
//					html += "<li style='margin-left:20px' data-lnk='"+info.lnk+"' data-key='"+id+"'>";
//					if (read == "1"){
//						//읽지 않은 상태
//						html += "	<p class='text-elips' style='font-weight:bold'>"+title+"</p>";
//					}else{
//						//읽음
//						html += "	<p class='text-elips'>"+title+"</p>";
//					}
//					
//					html += "	 <div class='f_between'>";
//					html += "	 	<span>"+date+"</span>";
//					html += "		<span>"+name+"</span>";
//					html += "	</div>";
//					html += "</li>";
//				}	
				
				var html = gTop.alram_draw_list(res);
				
				$("#alram_list_ul2").append(html);			
				
				
				$("#alram_back").off().on("click", function(e){
					$("#alram_list_ul2").empty();
					gTop.draw_alram_main();
				});		
				
				$("#qsearch").off();
				$("#qsearch").keypress(function(e){
					if (e.keyCode == 13){
						
						$("#alram_query_btn_close").show();
						$("#alram_query_btn_close").off().on("click", function(e){
							$("#alram_query_btn_close").hide();
						//	$("#alram_list_ul").empty();
							gTop.alramsearch = "F";
							gTop.skip = 0;
						
							
							
							$("#alram_list_main").addClass("alarm-cont");					
							$("#qsearch_layer").show();
							
										
							$("#alram_list_ul").empty();
						
							
							var html = "";
							html += "<div class='btn_return' id='alram_back' style='margin-bottom:15px; margin-left:15px'>";
							html += "	<button class='arrow_wr'>";
							html += "	<span class='prev arrow icon' style='margin-right:6px'></span>"+gap.lang.back+"</button>";
							html += "</div>";
							
							html += "<div id='alram_scroll' style=' height: calc(100% - 20px)'>";
							html += "<ul id='alram_list_ul2' style='width:94%; padding : 10px 10px 0 0 ; height: calc(100% - 40px)'>";
							
							html += "</ul> ";
							html += "</div>";
							
							$("#alram_list_ul").show();
							$("#alram_list_ul").html(html);
							
							gTop.alram_addContent()
							
							
							
							
						});
						gTop.skip = 0;
						
						var query = $(this).val();
						$(this).val("");
						var postdata = JSON.stringify({
							nid : gTop.nid,
							sty : gTop.sty,
							skip : gTop.skip,
							keyword : query,
							limit : 1000
						})
						
						var url = location.protocol + "//" + location.host + "/noti/notilist";
						$.ajax({
							type : "POST",
							url : url,
							data : postdata,
							dataType : "json",
							beforeSend : function(xhr){
								xhr.setRequestHeader("auth", gap.get_auth());
								xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
							},
							success : function(res){	
							
								var html = gTop.alram_draw_list(res);
								
								$("#alram_list_ul2").html(html);
								gTop.alram_event();
								
							},
							error : function(e){
								gap.error_alert();
							}
						});
					}
				});
				
				gTop.alram_event();
				
				
				$("#alram_scroll").mCustomScrollbar({
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
				//	setTop : ($("#alram_scroll").height()) + "px",
					callbacks : {
						onTotalScroll: function(){
							
						//	gBody3.scrollP = $("#channel_list").find(".mCSB_container").height();
							gTop.skip += 20;
							gTop.alram_addContent(this)
							
						},
						onTotalScrollBackOffset: 10,
						alwaysTriggerOffsets:true
					}
				});
				
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"alram_event" : function(){
		
		$("#alram_list_ul2 li").off().on("click", function(e){
			//클릭한 목록을 읽은 처리한다.
			
			
			
			var tid = $(e.currentTarget).data("key");
			var url = location.protocol + "//" + location.host + "/noti/noticonfirm";
			var postdata = JSON.stringify({
				nid : gTop.nid,
				tid : tid
			})
			$.ajax({
				type : "POST",
				url : url,
				data : postdata,
				dataType : "json",
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){	
					
					if (res.result == "success"){			
						
						$(e.currentTarget).find("p").removeAttr("style");
						
						if (gTop.cur_tab == "unread"){
							$(e.currentTarget).remove();
						}
						
//						var ispopup = $(e.currentTarget).data("check");
//						if (ispopup == "F"){
//							return false;
//						}else{
//							var _url = $(e.currentTarget).data("lnk");
//							$(e.currentTarget).removeClass("on");
//							gap.open_subwin(_url , '1000', '800', 'yes', '', 'yes');
//						}
						
						var _url = $(e.currentTarget).data("lnk");
						if (_url == ""){
							return false;
						}else{
							var _url = $(e.currentTarget).data("lnk");
							$(e.currentTarget).removeClass("on");
							gap.open_subwin(_url , '1000', '800', 'yes', '', 'yes');
						}
						
						
						gTop.count_check_noti();
												

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
	
	"alram_draw_list" : function(res){
		
	
		var list = res.content;				
		var html = "";					
		for (var i = 0 ; i < list.length ; i++){
			var info = list[i];
			var title = info.tit;
		//	var date = moment(info.dt).utc().format("YYYY-MM-DD hh:mm");
		//	var date = moment.utc(info.dt).local().format("YYYY-MM-DD hh:mm");
			var date = gTop.convertGMTLocalDateTime(info.dt);
			var name = info.send.nm;
			var read = info.read;
			var id = info.id;
			
			var body = "";
			var isPopup = "T";
			if (typeof(info.body) != "undefined" && info.body != ""){
				body = info.body;
				isPopup = "F";
			}
			
//			if (typeof(info.lnk) == "undefined" && info.lnk != ""){
//				body = info.body;
//				isPopup = "F";
//			}
			
			if (read == "1"){
				html += "<li style='margin-left:20px' data-lnk='"+info.lnk+"' data-key='"+id+"' class='on' data-check='"+isPopup+"'>";
			}else{
				html += "<li style='margin-left:20px' data-lnk='"+info.lnk+"' data-key='"+id+"' data-check='"+isPopup+"'>";
			}
			html += "	<p class='text-elips' title='" + title + "'>" + title + "</p>";
			
//			if (read == "1"){
//				//읽지 않은 상태
//				html += "	<p class='text-elips' style='font-weight:bold'>"+title+"</p>";
//			}else{
//				//읽음
//				html += "	<p class='text-elips'>"+title+"</p>";
//			}
			
			html += "	 <div class='f_between'>";
			html += "	 	<span>"+date+"</span>";
			html += "		<span>"+name+"</span>";
			html += "	</div>";
			
			if (body != ""){
				html += "<div class='alram_body'>"+body+"</div>"
			}
			html += "</li>";
		}	
	
		return html;
	},
	
	"alram_unread_count_check" : function(){
		
		var url = location.protocol + "//" + location.host + "/noti/notiunread";		
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){	
				if (res.count > 0){
					$("#new_alram_menu").addClass("act");
				}else{
					$("#new_alram_menu").removeClass("act");
				}

			},
			error : function(e){
				//gap.error_alert();
			}
		});
	},
	
	
	"draw_admin" : function(){
		gTop.show_admin_log();
	},
	
	"all_read" : function(){
		var postdata = "";
		if (gTop.cur_window == "main"){
			var postdata = JSON.stringify({
				all : "T"    //T 전체, P 부분
			});
		}else{
			var postdata = JSON.stringify({
				all : "P",    //T 전체, P 부분
				nid : gTop.nid,
				sty : gTop.sty
			})
		}
		
		var url = location.protocol + "//" + location.host + "/noti/noticonfirm";
		
		$.ajax({
			type : "POST",
			url : url,
			data : postdata,
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){	
				
				if (gTop.cur_window == "main"){
					$("#new_alram_menu").removeClass("act");
					$("#alram_list_ul").empty();
					gTop.draw_alram_main();
				}else{
					$("#alram_list_ul2").empty();
					
					gTop.alramsearch = "F";
					gTop.skip = 0;
					
					gTop.alram_addContent();
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	},
	
	"hideWorkStart" : function(){
		// 업무 바로가기 닫아주기
		if ($('#top_header_layer').hasClass('show-quick')){
			$('#btn_work_start').click();
		}
	},
	


	"show_portlet_upload" : function(info){
		var _self = this;
		
		var html = 
			'<div id="portlet_upload_layer" class="reg-menu-ly">' +
			'	<div class="layer-inner">' +
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
			var icon_src = gap.channelserver + "/portletpreview.do?code=" + info.code + '&ver=' + info.last_update;
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
			url: gap.channelserver + "/FileControl_portlet.do",
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
			alert('호출 함수명을 입력해주세요');
			$('#reg_portlet_code').focus();
			return false;
		}
		
		
		// 이미지 선택 여부
		// 신규 등록인데 이미지가 없으면 안됨
		if (!myDropzone_portletico.is_edit && myDropzone_portletico.files.length == 0) {
			alert('미리보기 이미지를 선택해주세요');
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
			alert('포틀릿명(한글)을 입력해주세요.');
			$('#reg_portlet_name_kr').focus();
			return false;
		}
		if (!_menu_en) {
			alert('포틀릿명(영문)을 입력해주세요.');
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
		disp_txt = '<a onclick="gap.showUserDetailLayer(\'' + user_info.ky + '\')">' + user_info.name + ' ' + user_info.jt + ' | ' + user_info.dept + '</a>';
				
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
			disp_txt = '<a onclick="gap.showUserDetailLayer(\'' + user_info.ky + '\')">' + user_info.name + ' ' + user_info.jt + ' | ' + user_info.dept + '</a>';			
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
	}
	
	
}

