
function gBuilder(){
	this.per_page = 10;
	this.all_page = 1;
	this.total_page_count = "";
	this.total_data_count = "";
	this.start_page = 1;
}

gBuilder.prototype = {
	
	"init": function(){

	},
	
	"report_layer_draw" : function(e){	
		var html = "";					
		html += "<div id='ai_builder_layer' class='ai_builder_layer'>";
		html += "	<div class='layer_inner'>";
		html += "		<div id='ai_builder_content_area' class='layer_content_wrap'>";		
		html += "			<div id='ai_builder_top' class='ai_builder_top'>";
		html += "			</div>";		
		html += "			<div id='ai_builder_body' class='ai_builder_body'>";
		html += "			</div>";		
		html += "		</div>"; // layer_content_wrap		
		html += "		<div id='ai_builder_make_form' class='ai_builder_make_form'>";
		html += "		</div>";		
		html += "	</div>";
		html += "</div>";
			
		//기존에 있는 레이어는 제거한다.	
		$("#ai_builder_layer").remove();
		//신규 레이어를 생성한다.
		$("#ai_portal_box").append(html);
		
		//상단 Top 부분 처리하기
		gbuilder.top_draw();
		
		//템플릿 리스트 그리기
		gbuilder.template_draw();
		
		//기능 이벤트 정리
		gbuilder.__builder_event();
	},
	
	"top_draw" : function(){
		var html = "";
		html += "<div class='ai_builder_top_wrap'>";
		html += "	<div>";
		html += "		<div class='ai_builder_title'>Report Builder</div>";
		html += "		<div class='ai_builder_sub_title'>"+gap.lang.va310+"</div>";
		html += "	</div>";
		html += "	<div class='btn_layer_close'><span class='btn_ico_builder'></span></div>";
		html += "</div>";
		
		$("#ai_builder_top").html(html);
	},
	
	"template_draw" : function(){
		var data = JSON.stringify({
			"ky" : gap.userinfo.rinfo.ky
		})
		var _url = gptpt.plugin_domain_fast + "apps/report_template_list_all"		
		gap.ajaxCall(_url, data, function(res){
						
			var html = "";
			html += "<div class='ai_builder_body_wrap'>";
			//상단 탭
			html += "	<div class='ai_builder_report_main_top'>";
			html += "	<div class='ai_builder_report_tab_top'>";
			html += "		<div id='ai_builder_report_template_tab' class='ai_builder_report_tab left selected'>"+gap.lang.template+"</div>";
			html += "		<div  class='ai_builder_report_tab right'>"+gap.lang.va236+"</div>";
			html += "	</div>";
			html += "	</div>";
			
			html += "	<div class='ai_builder_content' id='ai_builder_content'>";
			//내가 만든 템플릿 그리기
			html += " 		<div class='ai_builder_body_my_template'>";
			html += "			<div class='ai_builder_body_title_wrap'>";
			html += "				<div class='ai_builder_body_title'>"+gap.lang.va311+"</div>";
			html += "				<div class='ai_builder_body_title_btn_t1'><div class='builder_make_ico'></div><div>"+gap.lang.va312+"</div></div>";
			html += "			</div>";
			html += "			<div class='ai_builder_body_line_card' id='ai_builder_my_list'>";
			html += "				<div class='ai_report_empty'>";
			html += "					<div class='no_template'></div>";
			html += "					<div class='no_template_text'>"+gap.lang.va327+"</div>";
			html += "				</div>";
			html += "			</div>";
			html += "		</div>";
			//회사 표준 템플릿
			html += " 		<div class='ai_builder_body_standard_template'>";
			html += "			<div class='ai_builder_body_title_wrap'>";
			html += "				<div class='ai_builder_body_title'>"+gap.lang.va313+"</div>";
			if (role_admin == "T"){
				html += "				<div class='ai_builder_body_title_btn_t2'><div class='builder_make_ico'></div><div>"+gap.lang.va312+"</div></div>";
			}
			html += "			</div>";
			
			html += "			<div class='ai_builder_body_line_card' id='ai_builder_admin_list'>";
			html += "				<div class='ai_report_empty'>";
			html += "					<div class='no_template'></div>";
			html += "					<div class='no_template_text'>"+gap.lang.va327+"</div>";
			html += "				</div>";
			html += "			</div>";
			html += "		</div>";
			//타인이 공유한 템플릿
			html += " 		<div class='ai_builder_body_share_template'>";
			html += "			<div class='ai_builder_body_title'>"+gap.lang.va314+"</div>";
			html += "			<div class='ai_builder_body_line_card'  id='ai_builder_share_list'>";
			html += "				<div class='ai_report_empty'>";
			html += "					<div class='no_template'></div>";
			html += "					<div class='no_template_text'>"+gap.lang.va327+"</div>";
			html += "				</div>";
			html += "			</div>";
			html += "		</div>";			
			html += "	</div>";
			
			//저장된 보고서 리스트 보기 
			html += "<div id='ai_builder_report_list_view' class='ai_builder_report_list_view'>";		
			html += "	<div id='ai_builder_report_list_dis' class='ai_builder_report_list_dis'>";
			html += "		<div id='ai_report_list_body_left' class='ai_report_list_body_left'>";    
			html += "			<div class='ai_report_body_right_title'>"+gap.lang.va328+"</div>";
			html += "			<div class='ai_report_list_body_left_wrap' id='ai_report_list_body_left_wrap'>";
			html += "			</div>";  
			html += "			<div class='pagination_ai_builder' id='ai_report_paging' style='display:none'></div>";      
			html += "		</div>";
			html += "		<div id='ai_report_list_body_right' class='ai_report_list_body_right'>";			
			html += "			<div class='ai_report_body_right_wrap'>";
			html += "				<div class='ai_report_body_right_title'>"+gap.lang.preview+"</div>";			
			html += "				<div class='ai_report_title_right'>";
			html += "					<span id='ai_report_save_btn_main' class='ai_report_btn save' style='display:none'><span class='btn_ico'></span><span>"+gap.lang.basic_save+"</span></span>";
			html += "					<span id='ai_report_edit_btn_main' class='ai_report_btn edit disabled' style='display:none'><span class='btn_ico'></span><span>"+gap.lang.va84+"</span></span>";
			html += "					<span id='ai_report_pdf_btn_main' class='ai_report_btn pdf disabled' style='display:none'><span class='btn_ico'></span><span>PDF Download</span></span>";
			html += "					<span id='ai_report_share_btn_main' class='ai_report_btn share disabled'><span class='btn_ico'></span><span>"+gap.lang.do_share+"</span></span>";
			html += "				</div>";			
			html += "			</div>";			
			html += "			<div class='ai_report_list_body_right_sub'>";			
			html += "				<div id='ai_report_empty_view_main'>";
			html += "					<div class='ai_report_show_empty_image'></div>";
			html += "					<div class='ai_body_right_comment'>"+gap.lang.va329+"</div>";
			html += "				</div>"			
			html += "				<div class='ai_report_iframe_wrap' id='ai_report_iframe_wrap_main'>";
			html += "					<iframe id='ai_report_preview_html_main' style='border : 0; width : 100%; height : 100%'></iframe>";
			html += "				</div>";
			html += "			</div>";
			html += "		</div>";
			html += "	</div>";   
			html += "</div>";		
			
			html += "</div>";
			
			$("#ai_builder_body").html(html);
			
			for (var i = 0 ; i < res.length; i++){
				var item = res[i];
				var imagesrc = gptpt.kgpt_file_download_server +  "mk/report/thumb/" + item.filekey.replace(".html", ".png") ;				
				var html = "";
				html += "<div class='ai_report_card_wrap' data-key='"+item.filekey+"' data-title='"+item.title+"'>";
				html += "	<div class='ai_builder_template_image' style='background: url("+imagesrc+") center top / cover no-repeat'></div>";
				
				html += "	<div class='ai_builder_body_line_card_bottom_wrap'>";
				html += "		<div class='ai_builder_body_line_card_bottom_wrap_title'>";
				html += "			<div class='ai_builder_body_line_card_bottom_wrap_title_sub'><span class='ai_builder_body_line_card_count'></span><span>"+item.count+"</span></div>";
				html += "			<div class='ai_builder_body_line_card_box'><span title='"+item.title+"'>"+item.title+"</span>";
				html += "		</div>";
				if (item.share){
					//공유된 템플릿만 정보를 볼수 있다.
					html += "	<span class='ai_report_info'></span>";
				}				
				html += "		</div>";				
				if (item.ky == gap.userinfo.rinfo.ky){
					//템플릿 more버튼 구성하기
					html += "		<div><span class='ico btn-more' data-code='"+item.filekey+"'></span>";
					html += "		</div>";
				}

				html += "	</div>";
				
				html += "</div>";				
				if (item.type == "my"){
					$("#ai_builder_my_list .ai_report_empty").remove();
					$("#ai_builder_my_list").append(html);
				}else if (item.type == "admin"){
					$("#ai_builder_admin_list .ai_report_empty").remove();
					$("#ai_builder_admin_list").append(html);
				}				
				if (item.share){
					$("#ai_builder_share_list .ai_report_empty").remove();
					$("#ai_builder_share_list").append(html);
				}			
			}			
			gbuilder.__builder_event();		
		
		});	
	},
	
	////////////////////////////////// 페이징 처리 시작 //////////////////////////////////////////////
	"initializePage" : function(id){
		var alldocuments = gbuilder.total_data_count;
		if (alldocuments % gbuilder.per_page > 0 & alldocuments % gbuilder.per_page < gbuilder.per_page/2 ){
			gbuilder.all_page = Number(Math.round(alldocuments/gbuilder.per_page)) + 1
		}else{
			gbuilder.all_page = Number(Math.round(alldocuments/gbuilder.per_page))
		}	
		if (gbuilder.start_page % gbuilder.per_page > 0 & gbuilder.start_page % gbuilder.per_page < gbuilder.per_page/2 ){
			gbuilder.cur_page = Number(Math.round(gbuilder.start_page/gbuilder.per_page)) + 1
		}else{
			gbuilder.cur_page = Number(Math.round(gbuilder.start_page/gbuilder.per_page))
		}
		gbuilder.initializeNavigator(id);		
	},
	
	"initializeNavigator" : function(id){
		var alldocuments = gbuilder.total_data_count;
		if (gbuilder.total_page_count == 0){
			gbuilder.total_page_count = 1;
		}
		if (alldocuments == 0){
			alldocuments = 1;
			gbuilder.total_page_count = 1;
			gbuilder.cur_page = 1;
		}

		if (alldocuments != 0) {
			if (gbuilder.total_page_count % 10 > 0 & gbuilder.total_page_count % 10 < 5 ){
				var all_frame = Number(Math.round(gbuilder.total_page_count / 10)) + 1
			}else{
				var all_frame = Number(Math.round(gbuilder.total_page_count / 10))	
			}
			if (gbuilder.cur_page % 10 > 0 & gbuilder.cur_page % 10 < 5 ){
				var c_frame = Number(Math.round(gbuilder.cur_page / 10)) + 1
			}else{
				var c_frame = Number(Math.round(gbuilder.cur_page / 10))
			}
			var nav = new Array();
			if (c_frame == 1){
				nav[0] = '<ul class="pagination inb">';
			}else{
				nav[0] = '<div class="arrow prev" onclick="gbuilder.gotoPage(' + ((((c_frame-1) * 10) - 1)*gbuilder.per_page + 1) + ',' + ((c_frame - 1) * 10) + ');"></div><ul class="pagination inb">';
			}				
			var pIndex = 1;
			var start_page = ((c_frame-1) * 10) + 1;
			for (var i = start_page; i < start_page + 10; i++){
				if (i == gbuilder.cur_page){
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
						nav[pIndex] = '<li onclick="gbuilder.gotoPage(' + (((i-1) * gbuilder.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
					}else{
						if (i % 10 == '1' ){
							nav[pIndex] = '<li onclick="gbuilder.gotoPage(' + (((i-1) * gbuilder.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}else{
							nav[pIndex] = '<li onclick="gbuilder.gotoPage(' + (((i-1) * gbuilder.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}
					}
				}
				if (i == gbuilder.total_page_count) {
					break;
				}
				pIndex++;				
			}
			if (c_frame < all_frame){
				nav[nav.length] = '</ul><div class="arrow next" onclick="gbuilder.gotoPage(' + ((c_frame * gbuilder.per_page * 10) + 1) + ',' + ((c_frame * 10) + 1) + ');"></div>';				
			}else{
				nav[nav.length] = '</ul>';
			}		
			var nav_html = '';
			if (c_frame != 1 ){
			//	nav_html = '<li class="p-first" onclick="gbuilder.gotoPage(1,1);"><span>처음</span></li>';
			}		    
			for( var i = 0 ; i < nav.length ; i++){	
				nav_html += nav[i];
			}
			if (c_frame < all_frame){
			//	nav_html += '<li class="p-last" onclick="gbuilder.gotoPage(' + ((gbuilder.all_page - 1) * gbuilder.per_page + 1) + ',' + gbuilder.all_page + ')"><span>마지막</span></li>';
			}
			$("#" + id).html(nav_html);
		}		
	},
	
	"gotoPage" : function(idx, page_num){
		if (gbuilder.total_data_count < idx) {
			gbuilder.start_page = idx - 10;
			if ( gbuilder.start_page < 1 ) {
				return;
			}
		}else{
			gbuilder.start_page = idx;
		}
		cur_page = page_num;
		gbuilder.draw_ai_builder_report_list(page_num);
	},
	
	"convertGMTLocalDateTime" : function(val){
		var _date = moment(val, 'YYYYMMDDHHmmss').utc().local().format('YYYY-MM-DD[T]HH:mm:00[Z]')
		var ret = moment.utc(_date).local().format('YYYY.MM.DD') + '(' + moment.utc(_date).local().format('ddd') + ') ' + moment.utc(_date).local().format('HH:mm');
		return ret;
	},
	
	"getPageCount" : function(doc_count, rows){
		return ret_page_count = Math.floor(gbuilder.total_data_count / rows) + (((gbuilder.total_data_count % rows) > 0) ? 1 : 0);
	},
	////////////////////////////////// 페이징 처리 종료 //////////////////////////////////////////////
	
	
	"__builder_event" : function(){	
		//more를 클릭하는 경우
		$(".ai_builder_body_line_card_bottom_wrap .ico.btn-more").off().on("click", function(e){
			$.contextMenu( 'destroy', ".ai_builder_body_line_card_bottom_wrap .ico.btn-more" );				
			$.contextMenu({
				selector : ".ai_builder_body_line_card_bottom_wrap .ico.btn-more",
				autoHide : true,
				trigger : "left",
				callback : function(key, options){
					var id = $(this).data("code");
					gbuilder.status = "my";
					var obj = $(this).parent().parent().parent().parent().attr("id");
					if (obj.indexOf("_admin_") > -1){
						gbuilder.status = "admin";
					}
					gbuilder.context_menu_call(key, id);						
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
					}				
				},					
				build : function($trigger, e){		
					//var id = $trigger.prev().attr("data");
					return {
						items : gbuilder.menu_content()
					}
				}
			});
		});
		
		//탭 클릭하는 경우
		$(".ai_builder_body_wrap .ai_builder_report_tab").off().on("click", function(e){
			var obj = $(e.currentTarget).attr("class");
			$(".ai_builder_body_wrap .ai_builder_report_tab").removeClass("selected");
			$(e.currentTarget).addClass("selected");
			if (obj.indexOf("left") > -1){
				//템프릿 탭을 클릭하는 경우
				$("#ai_builder_report_list_view").hide();
				$("#ai_builder_content").show();							
			}else{
				//저장된 보고서 리스트를 클릭하는 경우
				$("#ai_builder_content").hide();
				$("#ai_builder_report_list_view").show();
				gbuilder.draw_ai_builder_report_list();
			}
		});
		
		//레이어 닫기 버튼
		$("#ai_builder_top .btn_layer_close").off().on("click", function(e){
			//새글 작성 버튼을 클릭한다.
			$("#ai_portal_left_content .btn_create_menu").click();
		});
		
		//템플릿 만들기
		$("#ai_builder_content_area .ai_builder_body_title_btn_t1").off().on("click", function(e){
			$("#ai_builder_content_area").hide();
			$("#ai_builder_make_form").show();
			gbuilder.status = "my";
			gbuilder.draw_report_form();
		});		
		
		//템플릿 만들기 관리자
		$("#ai_builder_content_area .ai_builder_body_title_btn_t2").off().on("click", function(e){
			$("#ai_builder_content_area").hide();
			$("#ai_builder_make_form").show();
			gbuilder.status = "admin";
			gbuilder.draw_report_form();
		});
		
		//리포트를 클릭해서 사용하러 가능 기능
		$("#ai_builder_content_area .ai_builder_template_image").off().on("click", function(e){
			var code = $(e.currentTarget).parent().data("key");
			var title = $(e.currentTarget).parent().data("title");
			gbuilder.cur_code = code;
			gbuilder.cur_title = title;
			
			$("#ai_builder_content_area").hide();
			$("#ai_builder_make_form").show();
			gbuilder.draw_report_form_use();
		});
		
		$("#ai_builder_content").mCustomScrollbar({
			theme:"dark",
			scrollbarPosition: "inside",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable: false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
			//	updateOnContentResize: true
			},
			autoHideScrollbar : false,
			callbacks : {
				
			}
		});			
	},
	
	"menu_content" : function(){
		var xitems = {};
		xitems["edit"] = {name : gap.lang.basic_modify};
		xitems["sep11"] = "-------------";
		xitems["delete"] = {name : gap.lang.basic_delete};
		return xitems;
	},
	
	"context_menu_call" : function(key, code){
		//템플릿 편집 및 삭제 클릭시 호출
		if (key == "edit"){
			$("#ai_builder_content_area").hide();
			$("#ai_builder_make_form").show();
			gbuilder.draw_report_form("edit", code);
		}else if (key == "delete"){
			gap.showConfirm({
				title: "Confirm",
				contents: gap.lang.confirm_delete,
				callback: function(){	
					var data = JSON.stringify({
						"code" : code
					});
					var url = gptpt.plugin_domain_fast + "apps/ai_builder_delete_report_template";		
					gap.ajaxCall(url, data, function(res){
						if (res.result == "OK"){	
							gbuilder.template_draw();				
						}else{
							gap.error_alert();
						}
					});		
				}
			});						
		}
		
	},
	
	
	
	"draw_ai_builder_report_list" : function(bun){
		var _url = gptpt.plugin_domain_fast + "apps/ai_builder_report_list"	
		var data = JSON.stringify({
			"ky" : gap.userinfo.rinfo.ky,
			"start" : (gbuilder.start_page -1),
			"perpage" : gbuilder.per_page
		});	
		gap.ajaxCall(_url, data, function(res){
			var html = "";
			var list = res.doc[1];
			var totalcount = res.doc[0].totalcount;
			
			for (var i = 0 ; i < list.length; i++){
				var item = list[i];
				html += "<div class='ai_report_list_item' data-code='"+item.filename+"' data-path='"+item.path+"'>";
				html += "	<div class='ai_report_list_item_title'>"+item.subject+"</div>";
				html += "	<div class='ai_report_list_item_right'><span>"+gbuilder.convertGMTLocalDateTime(item.GMT)+"</span><span class='btn_share'></span><span class='btn_delete'></span></div>";
				html += "</div>";
			}

			$("#ai_report_list_body_left_wrap").html(html);
			
			$("#ai_report_list_body_left_wrap .ai_report_list_item_title").off().on("click", function(e){
				var code = $(e.currentTarget).parent().data("code");
				var path = $(e.currentTarget).parent().data("path");
				$("#ai_report_list_body_left_wrap .ai_report_list_item").removeClass("selected");
				$(e.currentTarget).parent().addClass("selected");
				$("#ai_report_empty_view_main").hide();
				$("#ai_report_iframe_wrap_main").show();				
				$("#ai_report_edit_btn_main").show();
				$("#ai_report_pdf_btn_main").show();
				$("#ai_report_share_btn_main").removeClass("disabled");				
				var uu = gptpt.kgpt_file_download_server +  "mk/report/" + path + "/" + code ;
				$("#ai_report_preview_html_main").attr("src", uu);					
				gbuilder._event_btn();		
			});
			
			//목록에서 공유 버튼 클릭하는 경우
			$("#ai_report_list_body_left_wrap .btn_share").off().on("click", function(e){
				var code = $(e.currentTarget).parent().parent().data("code");
				var path = $(e.currentTarget).parent().parent().data("path");
				var uu = gptpt.kgpt_file_download_server +  "mk/report/" + path + "/" + code ;
				gptpt.draw_layer_share_chat_history(uu);
			});
			
			//목록에서 삭제를 클릭하는 경우
			$("#ai_report_list_body_left_wrap .btn_delete").off().on("click", function(e){			
				gap.showConfirm({
					title: "Confirm",
					contents: gap.lang.confirm_delete,
					callback: function(){	
						var code = $(e.currentTarget).parent().parent().data("code");
						var data = JSON.stringify({
							"code" : code
						});
						var url = gptpt.plugin_domain_fast + "apps/ai_builder_delete_report";		
						gap.ajaxCall(url, data, function(res){
							if (res.result == "OK"){
								gbuilder.draw_ai_builder_report_list(gbuilder.start_page);						
							}else{
								gap.error_alert();
							}
						});		
					}
				});								
			});

			gbuilder.total_data_count = totalcount;
			if (totalcount > 0){
				$("#ai_report_paging").show();
			}
			gbuilder.total_page_count = gbuilder.getPageCount(gbuilder.total_data_count, gbuilder.per_page);
			//페이징 처리하기
			gbuilder.initializePage("ai_report_paging");	
		});		
	},
	
	"_event_btn" : function(){

		$("#ai_report_edit_btn_main").off().on("click", function(e){
			//편집하기	
			$(this).hide();
			$("#ai_report_save_btn_main").show();			
			var iframebody = $("#ai_report_preview_html_main")[0].contentDocument
 		 	$(iframebody).find("div").attr('contenteditable', 'true');
 		 	$(iframebody).find("body").css("border", "2px dashed grey");
		});
		
		$("#ai_report_save_btn_main").off().on("click", function(e){
			//저장하기
			var obj = $(this);
			var iframebody = $("#ai_report_preview_html_main")[0].contentDocument
			$(iframebody).find("div").removeAttr('contenteditable');
			$(iframebody).find("body").css("border", "none");			
			var opp = iframeDoc = $('#ai_report_preview_html_main').contents();
			var src = $("#ai_report_preview_html_main").attr("src");
			var fileName = src.replace(/^.*[\\\/]/, '').split('?')[0];
			var html = fullHtml = iframeDoc.find('html').html();
			html = "<!DOCTYPE html><html lang='ko'>" + html + "</html>";
			var url = gptpt.plugin_domain_fast + "apps/modify_content_ai_builder_report";		
			var postData = JSON.stringify({
				"id" : fileName,
				"html" : html
			});
			gap.ajaxCall(url, postData, function(e){
				obj.hide();
				$("#ai_report_edit_btn_main").show();
				var $ifr = $('#ai_report_preview_html_main');
				$ifr.attr('src', $ifr.attr('src'));
			});			
		});
		
		$("#ai_report_pdf_btn_main").off().on("click", function(e){
			gap.show_loading(gap.lang.va326);
			var surl = $("#ai_report_preview_html_main").attr("src");			
			var url = gptpt.plugin_domain_fast + "apps/pdf_download";		
			var postData = JSON.stringify({
				"url" : surl
			});
			$.ajax({
				method : "POST",
				url : url,
				data : postData,
				contentType : "application/json; charset=utf-8",
				success : function(res){
					gap.hide_loading();
					if (res.result == "OK"){					
						location.href = gptpt.plugin_domain_fast + "apps/pdf_down/" + res.fname;	
					}
				},
				error : function(e){
					alert(e);
				}	
			});
		});		
		$("#ai_report_share_btn_main").off().on("click", function(e){
			var url = $("#ai_report_preview_html_main").attr("src");
			gptpt.draw_layer_share_chat_history(url);
		});
	},
	
	"draw_report_form" : function(opt, form_code){
		var html = "";
		html += "<div id='ai_report_make_wrap' class='ai_report_make_wrap'>";
		html += "	<div id='ai_report_make_top' class='ai_report_make_top'>";
		html += "		<div class='ai_report_title'>";
		html += "			<div class='ai_report_make_back_ico'></div>";
		html += "			<div id='ai_report_form_title' class='ai_report_form_title'>"+gap.lang.va312+"</div>";
		html += "		</div>";
		html += "		<div class='ai_report_title_right'>";
	//	html += "			<span id='ai_report_test_btn' class='ai_report_test_btn'>"+gap.lang.va315+"</span>";
		html += "			<span id='ai_report_save_btn' class='ai_report_class_btn'>"+gap.lang.basic_save+"</span>";
		html += "		</div>";
		html += "	</div>";   
		html += "	<div id='ai_report_make_body' class='ai_report_make_body'>";
		html += "		<div id='ai_report_make_body_left' class='ai_report_make_body_left'>";    
		html += "			<div class='ai_report_make_body_left_wrap'>";
		html += "				<div class='body_left_1'>"; //파일 업로드 영역
		html += "					<div class='body_left_title'>"+gap.lang.va316+"</div>";
		
		html += "					<div class='ai_report_file_preview_wrap_flex'>";
		html += "						<div class='ai_report_file_preview_wrap'>";
		html += "							<div class='ai_report_body_upload_wrap' id='ai_report_body_upload_wrap'>";
		html += "								<div id='body_left_upload' class='body_left_upload'><span class='body_upload_ico'></span></div>";
		html += "								<div id='body_left_upload2' style='display:none'></div>";
		html += "								<div style='font-size:14px'>HTML Upload</div>";
		html += "							</div>";
		html += "						</div>";
		
		html += "						<div class='ai_report_file_preview_wrap'>";
		html += "							<div class='ai_report_body_upload_wrap' id='ai_report_body_upload_wrap_image'>";
		html += "								<div id='body_left_upload_image' class='body_left_upload'><span class='body_upload_ico'></span></div>";
		html += "								<div id='body_left_upload2_image' style='display:none'></div>";
		html += "								<div style='font-size:14px'>Image Upload</div>";
		html += "							</div>";
		html += "						</div>";
		html += "					</div>";
		
		
		html += "				</div>";
		html += "				<div class='body_left_2'>"; //타이틀 영역
		html += "					<div class='body_left_title'>"+gap.lang.va319+"</div>";
		html += "					<div><input type='text' id='ai_report_title_text' class='body_text' /></div>";
		html += "				</div>";
		html += "				<div class='body_left_3'>"; //설명문구 영역
		html += "					<div class='body_left_title'>"+gap.lang.va320+"</div>";
		html += "					<div><textarea class='body_textarea' id='ai_report_title_textarea1'></textarea></div>";
		html += "				</div>";
		html += "				<div class='body_left_4'>"; //지침 영역
		html += "					<div class='body_left_title'>"+gap.lang.va321+"</div>";
		html += "					<div><textarea class='body_textarea2' id='ai_report_title_textarea2'></textarea></div>";
		html += "				</div>";
		html += "				<div class='body_left_5'>"; //공유 옵션 영역
		html += "					<div>";
		html += "						<div class='body_left_title'>"+gap.lang.va322+"</div>";
		html += "						<div class='body_left_title_sub'>"+gap.lang.va323+"</div>";
		html += "					</div>";
		html += "					<div><label class='switch'><input type='checkbox' id='toggle-event'><span class='slider round'></span></label></div>";
		html += "				</div>";
		html += "			</div>";        
		html += "		</div>";
		html += "		<div id='ai_report_make_body_right' class='ai_report_make_body_right'>";
		html += "			<div class='ai_report_body_right_title'>"+gap.lang.preview+"</div>";
		html += "			<div class='ai_report_make_body_right_sub'>";
		html += "				<div id='ai_report_empty_view'>";
		html += "					<div class='ai_report_show_empty_image'></div>";
		html += "					<div class='ai_body_right_comment'>"+gap.lang.va324 +"</div>";
		html += "				</div>";
		html += "				<div class='ai_report_iframe_wrap' id='ai_report_iframe_wrap'>";
		html += "					<iframe id='ai_report_preview_html' style='border : 0; width : 100%; height : 100%'></iframe>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";   
		html += "</div>";		
		$("#ai_builder_make_form").html(html);		
		gbuilder.__builder_event_form();
		if (opt == "edit"){
			//편집 모드로 오픈 한 경우 기존 데이터 내용을 채워 넣고 저장하면 업데이트 되어야 한다.
			//form_code
			var data = JSON.stringify({
				"code" : form_code
			});
			var url =  gptpt.plugin_domain_fast + "apps/ai_builder_report_info_template"		
			gap.ajaxCall(url, data, function(res){
				if (res.result == "OK"){
					var item = res.doc;
					$("#ai_report_title_text").val(item.title)
					$("#ai_report_title_textarea1").val(item.content);
					$("#ai_report_title_textarea2").val(item.guide);
					if (item.share){
						$("#toggle-event").prop("checked", true);
					}
					var uu = gptpt.kgpt_file_download_server +  "mk/report/" + item.filekey ;
					$("#ai_report_preview_html").attr("src", uu);	
					$("#ai_report_empty_view").hide();	
					$("#ai_report_iframe_wrap").show();
					myDropzone_report.uploaded_filename = item.filekey;
					myDropzone_report.count = item.count;
				}
			});
		}
	},
	
	"__builder_event_form" : function(){
		$("#ai_report_make_wrap .ai_report_title").off().on("click", function(){
			$("#ai_builder_content_area").show();
			$("#ai_builder_make_form").hide();
			gbuilder.report_layer_draw();
		});
		
		$("#ai_report_save_btn").off().on("click", function(e){
			
			//리포트 생성을 위한 저장 기존에 있으면 업데이트 하고 없으면 저장하는 방식으로 설정됨
			var title = $("#ai_report_title_text").val();
			var content = $("#ai_report_title_textarea1").val();
			var guide = $("#ai_report_title_textarea2").val();
			var filekey = myDropzone_report.uploaded_filename;
			var share = $("#toggle-event").is(':checked');
			
			if (typeof(myDropzone_report.uploaded_filename) == "undefined"){
				mobiscroll.toast({message: gap.lang.no_upload_file, color:'danger'});
				return false;
			}
			if (title == ""){
				mobiscroll.toast({message: gap.lang.va218, color:'danger'});
				return false;
			}
			
			var data = JSON.stringify({
				"title" : title,
				"content" : content,
				"guide" : guide,
				"filekey" : filekey,
				"share" : share,
				"ky" : gap.userinfo.rinfo.ky,
				"owner" : gap.userinfo.rinfo,
				"type" : gbuilder.status,
				"count" : (typeof(myDropzone_report.count) == "undefined" ? 0 : myDropzone_report.count)
			});
			var _url = gptpt.plugin_domain_fast + "apps/report_template_save"		
			gap.ajaxCall(_url, data, function(res){
				$("#ai_builder_content_area").show();
				$("#ai_builder_make_form").hide();
				gbuilder.report_layer_draw();		
			});
		});
		
		$("#ai_report_test_btn").off().on("click", function(e){
		});
		
		//파일 업로드 세팅
		var _url = gptpt.plugin_domain_fast + "apps/ai_report_file_upload"		
		var selectid = "body_left_upload";
		window.myDropzone_report = new Dropzone("#" + selectid, { // Make the whole body a dropzone
			url: _url,
			autoProcessQueue: true, 
			parallelUploads: 1, 
			maxFiles: 1,
			maxFilesize: 1024,
			timeout: 180000,
			uploadMultiple: false,
			acceptedFiles: '.html',
			withCredentials: false,
			previewsContainer: "#body_left_upload2",
			dictInvalidFileType: gap.lang.va190,
    		dictFileTooBig: gap.lang.va309 + "(Max : {{maxFilesize}}MB)",
			clickable: true,
			renameFile: function(file){		
				return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			},
			success : function(file, json){
				if (json.success){
					this.uploaded_filename = json.res;
					//미리보기 화면에 해당 HTML을 표시한다.
					$("#ai_report_empty_view").hide(); //설명 문구 화면을 숨긴다.
					$("#ai_report_iframe_wrap").show();  //html 파일 미리보기를 연다.
					//$("#ai_report_preview_html").show();
					
					var uu = gptpt.kgpt_file_download_server +  "mk/report/" + json.res ;
					$("#ai_report_preview_html").attr("src", uu);										
				}
				setTimeout(function(){
					//업로드한 파일을 제거해야 계속해서 업로드 할 수 있다. maxFiles가 1일 경우 하나 올리고 하나 지우고
					myDropzone_report.removeAllFiles();
				}, 1000);
			},
			error: function(file, message){	
				mobiscroll.toast({message: message, color:'danger'});		
			},			
		});			
		
		myDropzone_report.on("addedfile", function (file) {	
			//업로드와 썸네일 생성중 레이어 표시
			gap.show_loading(gap.lang.va325);
		});
		
		myDropzone_report.on("complete", function (file) {	
			gap.hide_loading();
		});		
		
		//이미지 파일 업로드 세팅
		var _url = gptpt.plugin_domain_fast + "apps/ai_report_image_file_upload"		
		var selectid = "body_left_upload_image";
		window.myDropzone_report_image = new Dropzone("#" + selectid, { // Make the whole body a dropzone
			url: _url,
			autoProcessQueue: true, 
			parallelUploads: 1, 
			maxFiles: 1,
			maxFilesize: 1024,
			timeout: 180000,
			uploadMultiple: false,
			acceptedFiles: '.jpg,.png,.jpeg',
			withCredentials: false,
			previewsContainer: "#body_left_upload2_image",
			dictInvalidFileType: gap.lang.va190,
    		dictFileTooBig: gap.lang.va309 + "(Max : {{maxFilesize}}MB)",
			clickable: true,
			renameFile: function(file){		
				return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			},
			success : function(file, json){
				if (json.success){
					myDropzone_report.uploaded_filename = json.res;
					//미리보기 화면에 해당 HTML을 표시한다.
					$("#ai_report_empty_view").hide(); //설명 문구 화면을 숨긴다.
					$("#ai_report_iframe_wrap").show();  //html 파일 미리보기를 연다.
					//$("#ai_report_preview_html").show();
					
					var uu = gptpt.kgpt_file_download_server +  "mk/report/" + json.res ;
					$("#ai_report_preview_html").attr("src", uu);										
				}
				setTimeout(function(){
					//업로드한 파일을 제거해야 계속해서 업로드 할 수 있다. maxFiles가 1일 경우 하나 올리고 하나 지우고
					myDropzone_report_image.removeAllFiles();
				}, 1000);
			},
			error: function(file, message){	
				mobiscroll.toast({message: message, color:'danger'});		
			},			
		});			
		
		myDropzone_report_image.on("addedfile", function (file) {	
			//업로드와 썸네일 생성중 레이어 표시
			gap.show_loading("이미지 파일을 분석해서 HTML 파일로 변환하고 있습니다.");
		});
		
		myDropzone_report_image.on("complete", function (file) {	
			gap.hide_loading();
		});				
	},		
	
	"draw_report_form_use" : function(){
		var html = "";
		html += "<div id='ai_report_make_wrap' class='ai_report_make_wrap'>";
		html += "	<div id='ai_report_make_top' class='ai_report_make_top'>";
		html += "		<div class='ai_report_title'>";
		html += "			<div class='ai_report_make_back_ico'></div>";
		html += "			<div id='ai_report_form_title' class='ai_report_form_title'>"+gbuilder.cur_title+"</div>";
		html += "		</div>";
		html += "		<div class='ai_report_title_right'>";
		html += "			<span id='ai_report_save_btn_use' class='ai_report_btn save' style='display:none'><span class='btn_ico'></span><span>"+gap.lang.basic_save+"</span></span>";
		html += "			<span id='ai_report_edit_btn_use' class='ai_report_btn edit disabled' style='display:none'><span class='btn_ico'></span><span>"+gap.lang.va84+"</span></span>";
		html += "			<span id='ai_report_pdf_btn_use' class='ai_report_btn pdf disabled' style='display:none'><span class='btn_ico'></span><span>PDF Download</span></span>";
		html += "			<span id='ai_report_share_btn_use' class='ai_report_btn share disabled'><span class='btn_ico'></span><span>"+gap.lang.do_share+"</span></span>";
		html += "		</div>";
		html += "	</div>";   
		html += "	<div id='ai_report_make_body' class='ai_report_make_body'>";
		html += "		<div id='ai_report_make_body_left' class='ai_report_make_body_left'>";    
		html += "			<div class='ai_report_make_body_left_wrap'>";
		html += "				<div class='body_left_2'>"; //타이틀 영역
		html += "					<div class='body_left_title'>"+gap.lang.va319+"</div>";
		html += "					<div><input type='text' id='ai_report_title_text' class='body_text' autocomplete='off'/></div>";
		html += "				</div>";
		html += "				<div class='body_left_4' style='height:100%'>"; //내용 영역
		html += "					<div class='body_left_title'>"+gap.lang.notice_body+"</div>";
		html += "					<div style='height:100%;'><textarea class='body_textarea3' id='ai_report_title_textarea2'></textarea></div>";
		html += "				</div>";
		html += "				<div class='body_left_6'>"; //공유 옵션 영역
		html += "					<div class='body_left_6_sub'><span class='ai_replort_make_doc'></span><span>생성하기</span></div>";
		html += "				</div>";
		html += "			</div>";        
		html += "		</div>";
		html += "		<div id='ai_report_make_body_right' class='ai_report_make_body_right'>";
		html += "			<div class='ai_report_body_right_title'>"+gap.lang.preview+"</div>";
		html += "			<div class='ai_report_make_body_right_sub'>";
		html += "				<textarea id='dis_html' class='template_txtarea_dis' spellcheck='false' style='display:none; width:100%; height:100%; border:0px;padding-left:10px' disabled></textarea>";
		html += "				<div class='ai_report_iframe_wrap' id='ai_report_iframe_wrap'>";
		html += "					<iframe id='ai_report_preview_html' style='border : 0; width : 100%; height : 100%'></iframe>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";   
		html += "</div>";		
		$("#ai_builder_make_form").html(html);		
		gbuilder.__builder_event_form_use();		
		gbuilder.show_template_html_in_iframe();
	},		
	
	"__builder_event_form_use" : function(){				
		//템플릿을 사용하는 화면의 이벤트 처리
		$("#ai_report_make_wrap .ai_report_title").off().on("click", function(e){
			$("#ai_builder_content_area").show();
			$("#ai_builder_make_form_use").hide();
			gbuilder.report_layer_draw();
		});
		
		$("#ai_report_edit_btn_use").off().on("click", function(e){
			//편집하기	
			$(this).hide();
			$("#ai_report_save_btn_use").show();			
			var iframebody = $("#ai_report_preview_html")[0].contentDocument
 		 	$(iframebody).find("div").attr('contenteditable', 'true');
 		 	$(iframebody).find("body").css("border", "2px dashed grey");
		});
		
		$("#ai_report_save_btn_use").off().on("click", function(e){
			//저장하기
			//$("#ai_report_edit_btn").show();
			var obj = $(this);
			var iframebody = $("#ai_report_preview_html")[0].contentDocument
			$(iframebody).find("div").removeAttr('contenteditable');
			$(iframebody).find("body").css("border", "none");
			
			var opp = iframeDoc = $('#ai_report_preview_html').contents();
			var src = $("#ai_report_preview_html").attr("src");
			var fileName = src.replace(/^.*[\\\/]/, '').split('?')[0];
			var html = fullHtml = iframeDoc.find('html').html();
			html = "<!DOCTYPE html><html lang='ko'>" + html + "</html>";
			var url = gptpt.plugin_domain_fast + "apps/modify_content_ai_builder_report";		
			var postData = JSON.stringify({
				"id" : fileName,
				"html" : html
			});
			gap.ajaxCall(url, postData, function(e){
				obj.hide();
				$("#ai_report_edit_btn_use").show();
				var $ifr = $('#ai_report_preview_html');
				$ifr.attr('src', $ifr.attr('src'));
			});			
		});
		
		$("#ai_report_pdf_btn_use").off().on("click", function(e){
			gap.show_loading(gap.lang.va326);
			var surl = $("#ai_report_preview_html").attr("src");			
			var url = gptpt.plugin_domain_fast + "apps/pdf_download";		
			var postData = JSON.stringify({
				"url" : surl
			});
			$.ajax({
				method : "POST",
				url : url,
				data : postData,
				contentType : "application/json; charset=utf-8",
				success : function(res){
					gap.hide_loading();
					if (res.result == "OK"){					
						location.href = gptpt.plugin_domain_fast + "apps/pdf_down/" + res.fname;	
					}
				},
				error : function(e){
					alert(e);
				}	
			});
		});
		
		$("#ai_report_share_btn_use").off().on("click", function(e){
			var url = $("#ai_report_preview_html").attr("src");
			gptpt.draw_layer_share_chat_history(url);
		});

		$("#ai_builder_layer .body_left_6_sub").off().on("click", function(e){
			$("#ai_report_empty_view").hide();		
			$("#ai_report_iframe_wrap").hide();					
			var code = gbuilder.cur_code;
			var title = $("#ai_report_title_text").val();
			var content = $("#ai_report_title_textarea2").val();			
			var postData = JSON.stringify({
				user : gap.userinfo.rinfo.nm,
				ky : gap.userinfo.rinfo.ky,
				txt : content,
				word : title,
				call_code : code,
				lang : gap.curLang
			});						
			var url = gptpt.plugin_domain_fast + "apps/ai_builder_report";
			var ssp = new SSE(url, {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	            method: 'POST'});                   
            ssp.addEventListener('open', function(e) {
				$("#dis_html").empty();			
			});	            
            var isEnd = false;
			var accumulatedMarkdown = "";
			var $ta = $('#dis_html');
			$ta.show();
			var bun = 0;
			var tx = "";
			ssp.addEventListener('message', function(e) {	
			
				$("#dis_html").show();				
				var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n"); //.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");
				if (e.data == "[DONE]"){										
					$("#dis_html").hide();
					isEnd = true;					
				}else{
					if (isEnd == true){
						var pp = pph.replace(/'/g,'"');
						var json = $.parseJSON(pp);						
						$("#dis_html").hide();						
						var path = json.path;
						var filename = json.filename;	
						gbuilder.cur_id = json.id;					
						var uu = gptpt.kgpt_file_download_server +  "mk/report/" + path ;				
	            		$('#ai_report_preview_html').attr("src", uu);			            		
	            		//setTimeout(function(){
	            			$('#ai_report_iframe_wrap').fadeIn();		
	            		//}, 1000);							
						$("#ai_report_edit_btn_use").show();
						$("#ai_report_pdf_btn_use").show();
						$("#ai_report_share_btn_use").removeClass("disabled");						
					}else{
					    bun ++;
					    tx = tx + pph;
					    if (bun == 100){
					    	// $ta.val($ta.val() + pph);			
					    	 $ta.val(tx);	        	
			       	 		// 스크롤 자동 하단으로
			      	 	 	$ta.scrollTop($ta[0].scrollHeight);	
			      	 	 	bun = 0;
					    }			       	 	
					}
				}			
			});
			ssp.stream();			
			return false;			
		});
	},
	
	"show_template_html_in_iframe" : function(){
		$("#ai_report_iframe_wrap").show();
		var uu = gptpt.kgpt_file_download_server +  "mk/report/" + gbuilder.cur_code ;
		$("#ai_report_preview_html").attr("src", uu);	
	},
	
	
	
}