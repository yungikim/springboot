$(document).ready(function(){
	//gnote.init();
});

function gnotebook(){
	this.query = "";
	this.sort = "1";
	this.select_id = "";
}

gnotebook.prototype = {
	
	"init": function(){
		
	},
	
	"ai_notebook_layer_draw": function(){		
		var html = "";		
		var border = "<div class='mask_top'></div><div class='mask_bot'></div>";				
		html += "<div id='ai_notebook_layer' class='ai_notebook_layer'>";
		html += "	<div class='layer_inner'>";
		html += "		<div id='ai_notebook_content_area' class='layer_content_wrap'></div>"; // layer_content_wrap
		html += "	</div>";
		html += "</div>";
		
		$("#btn_open_ai_notebook").addClass("active");
		
		///////////// 애니메이션 끝났을 때 ////////////
		$("#ai_portal_left_content .btn_open_ai_notebook").on("animationend", function(){			
			var duplicate_chk = $("#ai_notebook_layer").length === 0;			
			//// 레이어 한번만 열음, 이미 열려있는 경우에는 레이어를 열지 않는다. /////// 
			if(duplicate_chk){				
				//// AI 노트북 레이어 표시////
				$("#ai_portal_box").append(border);
				$("#ai_portal_left_content").addClass("ai_note");
				$("#ai_portal_box").append(html);				
				$("#ai_notebook_layer").on("animationend", function(){
					$("#ai_notebook_layer .layer_inner").fadeIn(150);
				});
				//// AI 노트북 레이어 표시////				
				//// 메인을 그린다.
				gnote.ai_notebook_main_draw();				
				//// AI 노트북 상단 이벤트 함수 /////////
				gnote.ai_notebook_main_top_section_event();				
				///노트북 목록을 그린다.
				gnote.query = "";
				gnote.ai_notebook_list_draw();
				//// AI 노트북 하단 채팅 이벤트 함수 /////////
				gnote.ai_notebook_chat_section_event();				
				/////////// ESC 키 누르면 레이어 닫음 //////////
			//	$(document).on("keyup", function(e){
			//		if(e.keyCode === 27 && $("#create_notebook_layer").length === 0){
			//			$("#btn_ai_notebook_layer_close").click();
			//		}
			//	});				
			}			
		});	
	},
	
	///AI 노트북 메인 콘텐츠 그리는 함수
	"ai_notebook_main_draw": function(){
		
		var html = "";		
		html += "			<div class='layer_top'>";
		html += "				<div class='layer_title_wrap'>";
		html +=	"					<span class='layer_title_ico'></span><h4 class='layer_title_txt'>AI Notebook</h4>";
		html +=	"				</div>";
		html +=	"				<button type='button' id='btn_ai_notebook_layer_close' class='btn_layer_close'><span class='btn_ico'></span></button>";
		html += "			</div>";		
		html += "			<div class='layer_content'>";		
		html += "				<div class='content_header'>";
		html += "					<div class='notebook_action_box'>";
		html +=	"						<button type='button' id='btn_create_new_notebook' class='create_new_notebook'>";
		html += "							<span class='btn_ico'></span><span class='btn_txt'>"+gap.lang.va96+"</span>";
		html +=	"						</button>";
		html += "						<div id='notebook_action_btn_wrap_main' class='notebook_action_btn_wrap'>";
		html += "							<button type='button' id='btn_select_all_item' class='btn_select_all_notebook hide' title='"+gap.lang.selectall+"'>";
		html += "								<span class='btn_ico'></span><span class='btn_txt'>"+gap.lang.selectall+"</span>";
		html += "							</button>";
		html += "							<span class='vertical_bar'></span>";
		html += "							<button type='button' id='btn_deselect_all_item' class='btn_deselect_all_notebook hide' title='"+gap.lang.deselection+"'>";
		html += "								<span class='btn_ico'></span><span class='btn_txt'>"+gap.lang.deselection+"</span>";
		html += "							</button>";
		html += "							<span class='vertical_bar'></span>";
		html += "							<button type='button' id='btn_remove_item' class='btn_remove_notebook hide' title='"+gap.lang.va97+"'>";
		html += "								<span class='btn_ico'></span><span class='btn_txt'>"+gap.lang.va97+"</span>";
		html += "							</button>";
		html +=	"						</div>";
		html += "					</div>";		
		html += "					<div class='notebook_search_box'>";
		html += "						<div class='notebook_search_wrap' style='width:330px'>";
		html += "							<input type='text' id='input_notebook_search' autocomplete='off' class='input_notebook_search' placeholder='"+gap.lang.va98+"'>";
		html += "							<span class='search_ico'></span>";
		html += "							<button type='button' class='ico-close btn-search-close' style='display:none;'></button>"
		html += "						</div>";		
		///////////////// 셀렉트 메뉴
		html += "						<select id='ai_notebook_view_cate_selectmenu'>";
		html += "							<option value='1'>"+gap.lang.va99+"</option>";
		html += "							<option value='2'>"+gap.lang.basic_title+"</option>";
	//	html += "							<option>공유 문서함</option>";
		html += "						</select>";
		html += "					</div>";		
		html += "				</div>"; ///// content_header		
		html += "				<div class='item_list_wrap'><div id='item_list_ul'></div></div>";		
		html += "				<div id='ai_notebook_chat_area' class='ai_notebook_chat_area'>";
		html += "					<button type='button' id='btn_chat_area_close' class='btn_chat_area_close'><span class='btn_ico'></span></button>";
		html += "					<div class='inner'>";
		html += "						<div id='chat_container' class='chat_content'></div>"
		html += "					</div>";
		html +=	"				</div>";		
		html += "		<div id='ai_notebook_main_chat_box'>";
		html += "			<div class='inner'>";
		html += "				<button type='button' id='btn_view_chat' class='btn_view_chat show'><span class='btn_ico'></span><span>"+gap.lang.va100+"</span></button>";
		html += "				<button type='button' id='btn_close_chat' class='btn_close_chat'><span class='btn_ico'></span><span>"+gap.lang.va101+"</span></button>";
		html += "				<div class='chat_input_box'>";
		html += "					<div class='notebook_sel_count_box'><span class='notebook_count_txt'></div>";
		html += "					<div class='chat_textarea_wrap'>";
		html += "						<textarea id='notebook_question_textarea' class='notebook_question_textarea' placeholder='"+gap.lang.va102+"' rows='1' spellcheck='false'></textarea>";
		html += "						<div class='btn_wrap'>";
		html += "							<button type='button' class='btn_mike' id='btn_mike_main'></button>";
		html += "							<button type='button' id='btn_notebook_question' class='btn_notebook_question'></button>";
		html += "						</div>";
		html += "					</div>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";		
		html += "	</div>"; /////// #ai_notebook_content_area
		$("#ai_notebook_content_area").empty();
		$("#ai_notebook_content_area").append(html);		
		$("#btn_chat_area_close").on("click", function(){
			$("#ai_notebook_chat_area").removeClass("open");
			$("#btn_close_chat").removeClass("show");
			$("#btn_view_chat").addClass("show");
		});		
		//검색어 한 상태에서 노트북 들어갔다 나오면 그대로 검색어를 유지시켜서 결과를 인지하게 한다.
		$("#input_notebook_search").val(gnote.query);		
		
		$("#btn_mike_main").off().on("click", function(e){
			gnote.voice_ok = true;
			gnote.recognition = new webkitSpeechRecognition(); //클릭할 때 초기화 하지 않으면	클릭 한만큼 응답이 추가되어 여기서 초기화 해야 한다.
			
			var rr = $(this).attr("class");
			if (rr == "going"){
				//음성을 제거한다.
				console.log("제거한다....")
				$("#btn_mike_main").removeClass("going");
				if (gnote.recognition){
					gnote.stop_click = true;
					gnote.recognition.stop();
					return;
				}				
			}
			$(this).toggleClass("going");			
			gnote.recognition.lang = window.navigator.language;
			gnote.recognition.interimResults = false;
			gnote.recognition.continuous = true;			
			gnote.recognition.start();			
			gnote.recognition.addEventListener('result', (event) =>{
				console.log("gnote.voice_ok : " + gnote.voice_ok)
				const result = event.results[event.results.length - 1][0].transcript;	
				
				gnote.stop_click = false;
					
				var msg = result.trim();				
				gnote.send_ai_request(msg);
											
			});		
			
			gnote.recognition.addEventListener("end", () => {		
				if (gnote.recognition){
						gnote.recognition.stop();
					}
			//  gptpt.stop_click = false;
			});
		});

		gnote.scrollbar_setting();
	},
	
	
	
	"scrollbar_setting" : function(){
		$("#ai_notebook_content_area .item_list_wrap").mCustomScrollbar({
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
				onTotalScroll: function(){					
					//gptapps.meeting_addContent(this);						
				},
				onTotalScrollOffset: 50,
				alwaysTriggerOffsets:false,						
				whileScrolling : function(){
					//gBody3.scroll_bottom = this.mcs.topPct;						
				}
			}
		});		
		
		$("#ai_notebook_chat_area .inner").mCustomScrollbar({
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
				onTotalScroll: function(){					
					//gptapps.meeting_addContent(this);						
				},
				onTotalScrollOffset: 50,
				alwaysTriggerOffsets:false,						
				whileScrolling : function(){
					//gBody3.scroll_bottom = this.mcs.topPct;						
				}
			}
		});		
	},
	
	///////// AI 노트북 메인 상단 이벤트 함수 ///////////////
	"ai_notebook_main_top_section_event": function(){		
		///// 새로 만들기 버튼 //////////
		$("#btn_create_new_notebook").on("click", function(){
			gnote.create_notebook_layer_draw("new","");
		});
		
		/// 전체선택 ///
		$("#btn_select_all_item").on("click", function(){
			$("#item_list_ul .item_border .item_chkbox").prop("checked", true);
			$("#item_list_ul .item_border").addClass("select");			
			$(this).addClass("hide");
			$("#btn_deselect_all_item").removeClass("hide");
			$("#btn_remove_item").removeClass("hide");
			///첫번쨰 수직선을 숨긴다.
			$("#notebook_action_btn_wrap_main .vertical_bar").eq(0).hide();
			$("#notebook_action_btn_wrap_main .vertical_bar").eq(1).show();			
			gnote.select_count_check("notebook");
		});
		/// 전체선택 해제 ///
		$("#btn_deselect_all_item").on("click", function(){
			$("#item_list_ul .item_border .item_chkbox").prop("checked", false);
			$("#item_list_ul .item_border").removeClass("select");			
			$("#notebook_action_btn_wrap_main .vertical_bar").hide();
			$("#btn_select_all_item").removeClass("hide");
			$(this).addClass("hide");
			$("#btn_remove_item").addClass("hide");			
			gnote.select_count_check("notebook");
		});
		
		///////// 노트북 삭제
		$("#notebook_action_btn_wrap_main #btn_remove_item").on("click", function(e){	
			var ids = [];
			var items = $("#item_list_ul .item_chkbox:checked");
			for (var i = 0 ; i < items.length; i++){
				var sid = $(items[i]).data("id");
				if (sid.indexOf("_share") == -1){
					ids.push(sid);		
				}	
			}
			gnote.delete_notebook(ids, "");
		});
		
		//////////////// 메인 노트북 검색창 ///////////////
		$("#input_notebook_search").on("focus", function(){
			$("#ai_notebook_layer .search_ico").addClass("focus");
		});
		$("#input_notebook_search").on("blur", function(){
			$("#ai_notebook_layer .search_ico").removeClass("focus");
		});
		
		$("#ai_notebook_view_cate_selectmenu").selectmenu({
			 change: function(event, ui) {
				gnote.sort = ui.item.value;
				$("#item_list_ul").empty();
				gnote.ai_notebook_list_draw();
  			}
		});		
	
		$("#btn_ai_notebook_layer_close").on("click", function(){	
			$("#ai_notebook_layer .layer_inner").fadeOut(150, function(){
				$("#ai_notebook_layer").addClass("layer_close");				
				$("#ai_portal_box .mask_top, #ai_portal_box .mask_bot").remove();				
				$("#ai_portal_left_content").removeClass("ai_note");
				$("#btn_open_ai_notebook").removeClass("active");
				$("#ai_notebook_layer").remove();
			});			
		});		
	},
	
	"delete_notebook" : function(ids, op){		
		var msg = gap.lang.confirm_delete;
		gap.showConfirm({
			title: "Confrim",
			contents: msg,
			callback: function(){
				var url = gptpt.plugin_domain_fast + "notebook/ai_notebook_delete";
				var data = JSON.stringify({
					id : ids.join(",")
				});				
				gap.ajaxCall(url, data, 
					function(res){
					//	$(e.currentTarget).addClass("hide");
						$("[data-id='"+op+"']").remove();	
						$("#btn_deselect_all_item").addClass("hide");
						$("#notebook_action_btn_wrap_main .vertical_bar").hide();						
						$("#item_list_ul .item_border .item_chkbox:checked").each(function(i, obj){
							var itm = $(obj).data("id");
							if (itm.indexOf("_share") == -1){
								$(obj).closest(".item_border").remove();
							}
						});
											
						if($("#item_list_ul .item_border .item_chkbox").length === 0){
							/// 노트북을 삭제하고 목록에 노트북이 존재하지 않을 때
							$("#btn_select_all_item").addClass("hide");							
							var html = "";
							html += "<div class='empty_note'><span class='note_img'></span><span>"+gap.lang.va103+"</span></div>";
							$("#item_list_ul").append(html);
						}					
						gnote.select_count_check("notebook");
					}
				)	
			}
		});	
	},
	
	///////////////// AI 노트북 채팅창 이벤트 ////////////////
	"ai_notebook_main_chat_section_event": function(){		
		$("#notebook_question_textarea").on("keyup", function(){
			var val = $.trim($(this).val());			
			if(val.length > 0){
				$("#ai_notebook_main_chat_box .btn_notebook_question").addClass("active");
			} else {
				$("#ai_notebook_main_chat_box .btn_notebook_question").removeClass("active");
			}
		});		
	},
	
	////////// AI 노트북 새로만들기 레이어 //////////	
	"create_notebook_layer_draw": function(opt, id){		
		gnote.select_id = "";
		var html = "";		
		html += "<div id='create_notebook_layer'>";
		html += "	<div class='layer_inner'>";
		html += "		<div class='layer_top'>";
		html += "			<h4 class='layer_title'>"+gap.lang.va96+"</h4>";
		html += "			<button type='button' class='btn_layer_close'></button>"
		html += "		</div>";
		html += "		<div class='layer_content'>";
		html += "			<div class='input_wrap_box'>";
		html += "				<div class='input_wrap'>";
		html += "					<div class='input_title_wrap'>";
		html += "						<h4 class='input_title'><span>"+gap.lang.va117+"</span><sup>＊</sup></h4>";
		html += "					</div>";
		html += "					<input type='text' placeholder='"+gap.lang.input_title+"' id='ai_notebook_name' autocomplete='off'>";
		html += "				</div>";
		html += "				<div class='input_wrap'>";
		html += "					<div class='input_title_wrap'>";
		html += "						<h4 class='input_title'><span>"+gap.lang.va118+"</span><sup>＊</sup></h4>";
		html += "					</div>";
		html += "					<textarea placeholder='"+gap.lang.va119+"' id='ai_notebook_desc'></textarea>";
		html += "				</div>";
		html += "				<div class='input_wrap'>";
		html += "					<div class='input_title_wrap'>";
		html += "						<h4 class='input_title'>"+gap.lang.va120+"</h4><span class='input_title_desc'>※ "+gap.lang.va121+"</span>";
		html += "					</div>";
		html += "					<textarea id='ai_notebook_prompt' placeholder='"+gap.lang.va122+"'></textarea>";
		html += "				</div>";
		html += "			</div>";
		html += "			<div class='btn_wrap'>";
		html += "				<button type='button' class='btn_save' id='ai_notebook_create'>"+gap.lang.basic_save+"</button>";
		html += "				<button type='button' class='btn_cancel'>"+gap.lang.Cancel+"</button>";
		html += "			</div>"
		html +=	"		</div>";
		html += "	</div>"
		html +=	"</div>";		
		$("#dark_layer").append(html);		
		$("#dark_layer").fadeIn(150);		
		if (opt == "modify"){
			var url = gap.channelserver + "/api/kgpt/ai_notebook_info.km";
			var data = JSON.stringify({
				"id" : 	id	
			});
			gap.ajaxCall(url, data, 
				function(res){
					if (res.result == "OK"){
						var item = res.data.info;
						$("#ai_notebook_name").val(item.notebook_name);
						$("#ai_notebook_desc").val(item.notebook_desc);
						$("#ai_notebook_prompt").val(item.notebook_prompt);
						gnote.select_id = item._id;
					}
				}
			)
		}		
		//////// 레이어 닫기 ///////////
		$("#create_notebook_layer .btn_layer_close, #create_notebook_layer .btn_cancel").on("click", function(){
			$("#dark_layer").fadeOut(150);
			$("#dark_layer").empty();
		});		
		$("#ai_notebook_create").off().on("click", function(e){
			//노트북 생성 하기
			var notebook_name = $("#ai_notebook_name").val();
			var notebook_desc = $("#ai_notebook_desc").val();
			var notebook_prompt = $("#ai_notebook_prompt").val();
			gnote.ai_notebook_save(notebook_name, notebook_desc, notebook_prompt, opt);			
		});
	},
	
	"ai_notebook_save" : function(notebook_name, notebook_desc, notebook_prompt, opt){
		var data = JSON.stringify({
			"notebook_name" : notebook_name,
			"notebook_desc" : notebook_desc,
			"notebook_prompt" : notebook_prompt,
			"source_count" : 0,
			"opt" : opt,
			"id" : gnote.select_id
		});
		var url = gap.channelserver + "/ai_notebook_save.km";
		gap.ajaxCall(url, data, 
			function(res){
				$("#item_list_ul").empty();
				gnote.ai_notebook_list_draw();
				$("#dark_layer").fadeOut(150);
				$("#dark_layer").empty();
			}
		)
	},
	
	//////////// AI 노트북 메인에 노트북 그리는 함수 ///////////
	"ai_notebook_list_draw": function(){
		var data = JSON.stringify({
			"query" : gnote.query,
			"start" : 0,
			"perpage" : 30,
			"sort" : gnote.sort
		});
		var url = gap.channelserver + "/api/kgpt/ai_notebook_list.km";
		gap.ajaxCall(url, data, 
			function(res){
				var html = "";				
				var data = res.data.data;
				var share_count = res.data.share;
				if( data.length > 0 && data !== undefined ){
				///////////// 노트북이 존재할 때 //////////////

					var share_key = gap.userinfo.rinfo.ky + "_share";
					html += "<div class='item_border shared' data-id='"+share_key+"'>";
					html += "	<div class='item_inner'>";					
					html += "		<div class='item_top_wrap'>";	
					html += "			<div class='item_top'>";
					html += "				<div class='item_top_forward'>";
					html += "					<div class='item_chkbox_wrap'>";
					html += "						<input type='checkbox' id='item_0' class='item_chkbox' data-id='"+share_key+"'>";
					html += "						<label for='item_0' class='item_label'></label>";
					html += "					</div>";
					html += "					<div class='item_info_wrap'>";
				//	html += "						<span>2024.11.11</span>	";
				//	html += "						<span>·</span>";
					html += "						<span>"+gap.lang.va130+" <span class='source_count'>"+share_count+"</span>"+gap.lang.va105+"</span>";
					html += "					</div>";
					html += "				</div>";
				//	html += "				<button type='button' class='btn_more' data-key='"+share_key+"'></button>";					
					html += "			</div>";
					html += "			<div class='item_title'>"+gap.lang.va128+"</div>";					
					html += "		</div>";		
					html += "		<div class='item_bot_wrap'>";
					html += "			<span class='share_ico' data-placement='right'></span>";
					html += "		</div>";					
					html += "	</div>";
					html += "</div>";									
					for (var i = 0; i < data.length; i++){						
						var itm = data[i];
						var id = itm._id;
						var flen = 0;
						if (itm.data){
							flen = itm.data.length;
						}
						html += "<div class='item_border' data-id='"+id+"'>";
						html += "	<div class='item_inner'>";
						html += "	<div class='item_top_wrap'>";
						html += "		<div class='item_top'>";
						html += "			<div class='item_top_forward'>";
						html += "				<div class='item_chkbox_wrap'>";
						html += "					<input type='checkbox' id='item_" + (i+1) + "' class='item_chkbox' data-id='"+id+"'><label for='item_" + (i+1) + "' class='item_label' ></label>";
						html += "				</div>";
						html += "				<div class='item_info_wrap'>";
						html += "					<span>" + gap.convertGMTLocalDateTime_new_day(itm.GMT) + "</span>";
						html += "					<span>·</span>";
						html += "					<span>"+gap.lang.va108+" <span class='source_count'>" + flen+ "</span>"+gap.lang.va105+"</span>";
						html += "				</div>";
						html += "			</div>";
						html += "			<button type='button' class='btn_more' data-key='"+id+"'></button>";
						html += "		</div>";
						html += "		<div class='item_title'>" + itm.notebook_name + "</div>";
						html +=	"	</div>";
						html += "	<div class='item_desc'>" + itm.notebook_desc + "</div>";
						html += "	</div>";
						html +=	"</div>";
					}					
					$("#item_list_ul").append(html);
					$("#btn_select_all_item").removeClass("hide");						
					
					$("#item_list_ul .share_ico").on("mouseenter", function(){
						var msg = gap.lang.va129;
						var html = "<div id='btn_bubble_box'>" + msg + "</div>";
						$(this).append(html);
					});
					$("#item_list_ul .share_ico").on("mouseleave", function(){
						$(this).find("#btn_bubble_box").remove();
					});							
				} else {
				///////////// 노트북이 존재하지 않을 때 //////////////
					html += "<div class='empty_notebook'><span class='notebook_img'></span><span>"+gap.lang.va103+"</span></div>";
					$("#item_list_ul").append(html);
				}				
				gnote.set_notebook_count(data.length+1);			
				gnote.ai_notebook_event("notebook");						
			}
		);
	},
	
	"set_notebook_count" : function(count){
		var is_notebook_window = $("#btn_add_note").is(":visible");
		var html = "";		
		html += "<span class='notebook_count_txt'>" + gap.lang.va104;	
		html += " <span class='notebook_sel_count'>" + count + "</span> ";			
		html += gap.lang.va105+"</span>";	
		$("#ai_notebook_layer .notebook_count_txt").html(html);
	},
	
	"set_note_count" : function(){
		count = $("#item_list_ul .item_chkbox:checked").length;		
		var html = "";
		if (count > 0){			
			html += "<span class='notebook_count_txt'>Note";	
			html += " <span class='notebook_sel_count'>" + count + "</span> ";		
		}else{
			var cnt = $('#source_list_ul .source_chkbox:checked').length;
			html += "<span class='notebook_count_txt'>" + gap.lang.va108;
			html += " <span class='notebook_sel_count'>" + cnt + "</span> ";		
		}	
		html += gap.lang.va105+"</span>";
		$("#ai_notebook_layer .notebook_count_txt").html(html);
	},
	
	"search_icon_open" : function(){
		$(".notebook_search_wrap .search_ico").show();
		$(".notebook_search_wrap .btn-search-close").hide();
	},
	
	"search_icon_close" : function(){
		$(".notebook_search_wrap .search_ico").hide();
		$(".notebook_search_wrap .btn-search-close").show();
	},
	
	"select_count_check" : function(type){
		/// 노트북을 선택하는 체크박스 클릭했을 때 / 한번 클릭시 두번 실행되는 문제 해결 필요
		if (type == "notebook"){
			var sel_count = $("#item_list_ul .item_chkbox:checked").length;
			var total_sel_count = $("#item_list_ul .item_chkbox").length;
			if (sel_count == 0){
				gnote.set_notebook_count(total_sel_count);
			}else{
				gnote.set_notebook_count(sel_count);
			}
		}else if (type == "note"){		
			gnote.set_note_count();			
		}		
	},
	
	/// 메인 노트북 클릭 & 체크박스 이벤트 ///
	"ai_notebook_event": function(type){		
		$("#input_notebook_search").off().on("keypress", function(e){
			if (e.keyCode == 13){
				//검색을 진행한다.				
				var query = $(e.currentTarget).val();
				gnote.query = query;				
				$("#item_list_ul").empty();		
				gnote.ai_notebook_list_draw();		
				gnote.search_icon_close();				
			}
		});
		
		$(".notebook_search_wrap .btn-search-close").off().on("click", function(){
			$("#item_list_ul").empty();
			gnote.query = "";
			$("#input_notebook_search").val("");
			gnote.ai_notebook_list_draw();
			gnote.search_icon_open();			
		});		
		
		$("#item_list_ul .item_border").off().on("click", function(e){			
			if(e.target.className === 'item_label' || e.target.className === 'item_chkbox'){				
				// 노트북을 선택하는 체크박스 클릭했을 때
				var bol = $(e.currentTarget).find(".item_chkbox").is(":checked");
				if (bol){
					$(e.currentTarget).find(".item_chkbox").prop("checked", false);
				}else{
					$(e.currentTarget).find(".item_chkbox").prop("checked", true);
				}				
				gnote.select_count_check(type);
				
			}else if (e.target.className == "btn_more"){
				//more 버튼 클릭시
				$.contextMenu({
					selector : "#item_list_ul .btn_more",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){					
						gnote.context_menu_call_req_mng_notebook(key, options, $(this).data("key"));						
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
	                	}
					},			
					build : function($trigger, options){
						return {
							items: gnote.req_info_menu_notebook("T")
						}
					}
				});		
			} else {
				if(type === "notebook"){
					///노트북 클릭했을 때
					var title = ""; // 노트북 제목
					var source = 0; // 노트북 소스 갯수					
					title = $(this).find(".item_title").text();
					source = $(this).find(".source_count").text();					
					$("#ai_notebook_content_area").empty();					
					gnote.current_notebook = $(e.currentTarget).data("id");
					gnote.notebook_inside_draw(title, source);					
				}
				if(type === "note"){
					var title = ""; // 노트 제목
					title = $(this).find(".item_title").text();
					var id = $(e.currentTarget).data("id");
					gnote.note_view_layer_draw(id);
				}
			}
		});
		
		$("#item_list_ul .item_border .item_chkbox").off().on("change", function(){
			if($(this).prop("checked") === true){
				$(this).closest(".item_border").addClass("select");
			} else {
				$(this).closest(".item_border").removeClass("select");
			}			
			if($("#item_list_ul .item_border .item_chkbox:checked").length > 0){
				$("#notebook_action_btn_wrap_main .vertical_bar").show();
				$("#btn_deselect_all_item").removeClass("hide");
				$("#btn_remove_item").removeClass("hide");
			}			
			if($("#item_list_ul .item_border .item_chkbox:checked").length === $("#item_list_ul .item_border .item_chkbox").length) {
				///////체크한 것과 총 갯수가 같을 때
				$("#btn_select_all_item").addClass("hide");
				$("#notebook_action_btn_wrap_main .vertical_bar").eq(0).hide();
			} else {
				if($("#item_list_ul .item_border .item_chkbox:checked").length > 0){
					$("#btn_select_all_item").removeClass("hide");
				} else {
					$("#btn_deselect_all_item, #btn_remove_item").addClass("hide");
					$("#notebook_action_btn_wrap_main .vertical_bar").hide();
				}
			}			
		});
	},
	
	"context_menu_call_req_mng_notebook" : function(opt, options, obj){		
		 if (opt == "delete"){
			//항목 삭제			
			var id = obj;
			var ids = [];
			ids.push(id);			
			gnote.delete_notebook(ids, obj);					
		}else if (opt == "modify"){
			gnote.create_notebook_layer_draw("modify", obj);
		}
	},
	
	 "req_info_menu_notebook" : function(){	
		var items = {
			"delete" : {name : gap.lang.basic_delete},
			"sep01" : "-------------",
			"modify" : {name : gap.lang.basic_modify}
		}
		return items;
	},	
		
	///////////// 노트북 내부화면 그리는 함수 (노트북 클릭했을 때 표시되는 화면) //////////
	"notebook_inside_draw": function(title, source){			
		var is_share = false;
		if (gnote.current_notebook.indexOf("_share") > -1){
			is_share = true;
		}
		var html = "";		
		html += "		<div class='layer_top'>";
		html += "			<div class='layer_title_wrap'>";
		html +=	"				<button type='button' id='btn_go_ai_notebook_main' class='btn_go_back'></button>";
		html += "				<div class='notebook_title_box'>";
		html += "					<div class='title_wrap'>";
		html +=	"						<h4 id='notebook_title_txt' class='notebook_title_txt'>" + title + "</h4>";
		html += "						<input type='text' id='input_edit_title' spellcheck='false'>";
		html += "					</div>";
		html += "					<button type='button' id='btn_edit_title' class='btn_edit_title'></button>";
		html += "					<div class='edit_btn_box'>";
		html += "						<div class='edit_btn_wrap'>";
		html += "							<button type='button' id='btn_edit_title_ok' class='btn_edit_title_ok'>"+gap.lang.OK+"</button>";
		html += "							<button type='button' id='btn_edit_title_cancel' class='btn_edit_title_cancel'>"+gap.lang.Cancel+"</button>";
		html += "						</div>";
		html += "					</div>";
		html += "				</div>";
		html +=	"			</div>";
		html +=	"			<button type='button' id='btn_ai_notebook_layer_close' class='btn_layer_close'><span class='btn_ico'></span></button>";
		html += "		</div>";		
		html += "		<div class='layer_content_box'>";
		if (is_share){
			html += "			<div class='layer_content share'>";
		}else{
			html += "			<div class='layer_content note'>";
		}		
		html += "				<div class='content_header'>";
		html += "					<div class='notebook_action_box'>";
		html +=	"						<button type='button' id='btn_add_note' class='btn_add_note'>";
		html += "							<span class='btn_ico'></span><span class='btn_txt'>"+gap.lang.va106+"</span>";
		html +=	"						</button>";
		html += "						<div id='notebook_action_btn_wrap' class='notebook_action_btn_wrap'>";
		html += "							<button type='button' id='btn_select_all_item' class='btn_select_all_notebook hide' title='"+gap.lang.selectall+"'>";
		html += "								<span class='btn_ico'></span><span class='btn_txt'>"+gap.lang.selectall+"</span>";
		html += "							</button>";
		html += "							<span class='vertical_bar'></span>";
		html += "							<button type='button' id='btn_deselect_all_item' class='btn_deselect_all_notebook hide' title='"+gap.lang.deselection+"'>";
		html += "								<span class='btn_ico'></span><span class='btn_txt'>"+gap.lang.deselection+"</span>";
		html += "							</button>";
		html += "							<span class='vertical_bar'></span>";
		html += "							<button type='button' id='btn_remove_item' class='btn_remove_notebook hide' title='"+gap.lang.va107+"'>";
		html += "								<span class='btn_ico'></span><span class='btn_txt'>"+gap.lang.va107+"</span>";
		html += "							</button>";
		html +=	"						</div>";
		html += "					</div>";
		html += "				</div>"; ///// content_header
		html += "				<div class='item_list_wrap'><div id='item_list_ul'></div></div>";		
		html += "				<div id='ai_notebook_chat_area' class='ai_notebook_chat_area'>";
		html += "					<button type='button' id='btn_chat_area_close' class='btn_chat_area_close'><span class='btn_ico'></span></button>";
		html += "					<div class='inner'>";
		html += "						<div id='chat_container' class='chat_content'></div>"
		html += "					</div>";
		html +=	"				</div>";			
		html += "		<div id='ai_notebook_main_chat_box' >";		
		html += "			<div class='inner'>";
		html += "				<button type='button' id='btn_view_chat' class='btn_view_chat show'><span class='btn_ico'></span><span>"+gap.lang.va100+"</span></button>";
		html += "				<button type='button' id='btn_close_chat' class='btn_close_chat'><span class='btn_ico'></span><span>"+gap.lang.va101+"</span></button>";
		html += "				<div class='chat_input_box'>";
		html += "					<div class='notebook_sel_count_box'><span class='notebook_count_txt'></div>";
		html += "					<div class='chat_textarea_wrap'>";
		html += "						<textarea id='notebook_question_textarea' class='notebook_question_textarea' placeholder='"+gap.lang.va102+"' rows='1' spellcheck='false'></textarea>";
		html += "						<div class='btn_wrap'>";
		html += "							<button type='button' class='btn_mike' id='btn_mike_notebook'></button>";
		html += "							<button type='button' id='btn_notebook_question' class='btn_notebook_question'></button>";
		html += "						</div>";
		html += "					</div>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";		
		html += "	</div>";		
		
		if (!is_share){
			html += "			<div id='source_nav' class='source_nav'>";
			html += "				<button type='button' id='btn_source_nav_toggle' class='btn_source_nav_toggle'><span class='btn_ico'></span></button>"
			html += "				<div class='inner'>";
			html += "					<div class='nav_top'>";
			html += "						<div class='title_box'>";
			html +=	"							<span class='source_ico'></span>";
			html += "							<h4 class='title_txt'>"+gap.lang.va108+"</h4>";
			html +=	"						</div>"
			html += "						<button type='button' id='btn_add_source' class='btn_add_source'>";
			html += "							<span class='btn_ico'></span><span>"+gap.lang.va109+"</span>";
			html += "						</button>";
			html +=	"					</div>";		
			html += "					<div class='source_list_box'>";
			html += "						<div id='all_chkbox_wrap_box'>";
			html += "							<div class='all_chkbox_wrap'>";
			html += "								<input type='checkbox' id='source_all_chk' checked><label for='source_all_chk' class='source_chkbox_label'></label>";
			html += "									<h6 class='all_chkbox_title'>"+gap.lang.va110+"</h6>";
			html += "							</div>";
			html += "						</div>";
			html += "						<div id='source_list_ul' class='source_list_ul'></div>";
			html += "					</div>";	
			html += "				</div>";
			html += "			</div>";		
			html += "		</div>";	
		}	
		$("#ai_notebook_content_area").html(html);				
		gnote.note_list_draw();		
		/////////////// 소스 목록을 그린다.		
		gnote.scrollbar_setting();			
		gnote.ai_notebook_chat_section_event();		
		
		$("#btn_add_source").off().on("click", function(e){
			gptmd.callFrom = "ai_notebook";
			gptmd.myDataInit();
		});
		
		$("#btn_go_ai_notebook_main").on("click", function(){
				//// AI 노트북 메인을 그린다. //////
				gnote.ai_notebook_main_draw();
				//// AI 노트북 상단 이벤트 함수 /////////
				gnote.ai_notebook_main_top_section_event();
				///노트북 목록을 그린다.
				//뒤로가기의 경우 query값을 초기화 하지 않고 기존 값을 유지한다.
				gnote.ai_notebook_list_draw();
				//// AI 노트북 하단 채팅 이벤트 함수 /////////				
				gnote.ai_notebook_chat_section_event();
		});
		
		$("#btn_edit_title").on("click", function(){
			$(this).hide();
			gnote.notebook_title_edit();
		});
		
		$("#btn_add_note").on("click", function(){
			gnote.add_note_layer_draw();
		});
		
		$("#btn_chat_area_close").on("click", function(){
			$("#ai_notebook_chat_area").removeClass("open");
			$("#btn_close_chat").removeClass("show");
			$("#btn_view_chat").addClass("show");
		});
		
		//// 소스목록 확장 토클버튼 //////
		$("#btn_source_nav_toggle").on("click", function(){
			$(this).toggleClass("expand");
			$("#ai_notebook_layer .layer_content.note").toggleClass("expand");
			$("#item_list_ul .item_border.note").toggleClass("expand");
		});
		
		$("#btn_ai_notebook_layer_close").on("click", function(){
			$("#btn_go_ai_notebook_main").click();
		});
	},
	
	//////////// 노트북에 노트 그리는 함수 ///////////
	"note_list_draw": function(){		
		var data = JSON.stringify({
			"notebook_code" : gnote.current_notebook
		});
		var url = gap.channelserver + "/api/kgpt/ai_note_list.km";
		gap.ajaxCall(url, data,
			function(res){
				var html = "";
				var data = res.data.data;
				var file_info =  [];
				if (res.data.file){
					if (res.data.file.file_info.data){
						file_info = res.data.file.file_info.data;
					}
				}

				if( data.length > 0 && data !== undefined ){
				///////////// 노트가 존재할 때 //////////////
					for (var i = 0; i < data.length; i++){
						var item = data[i];
						var id = item.key;
						var type = "";
						var type_color = "";						
						if(item.type === "me"){
							type = gap.lang.va111;
							type_color = "green";
						}else if (item.type === "answer"){
							type = gap.lang.va112;
							type_color = "blue";
						}else if (item.type == "share"){
							type = gap.lang.share;
							type_color = "grey";
						}
						html += "<div class='item_border note' data-id='"+id+"'>";
						html += "	<div class='item_inner'>";
						html += "	<div class='item_top_wrap'>";
						html += "		<div class='item_top'>";
						html += "			<div class='item_top_forward'>";
						html += "				<div class='item_chkbox_wrap'>";
						html += "					<input type='checkbox' id='item_" + i + "' class='item_chkbox'  data-id='"+id+"'><label for='item_" + i + "' class='item_label'></label>";
						html += "				</div>";
						html += "				<div class='item_info_wrap note_ " + type_color + "'>";
						html += "					<span>" + type + "</span>";
						
						if (item.source_count !== 0 && item.source_count !== "0"){
							html += "					<span class='vertical_bar'></span>";
							html += "					<span>소스 <span class='source_count'>" + item.source_count+ "</span>개</span>";							
						}
						html += "				</div>";
						html += "			</div>";
						/*html += "			<button type='button' class='btn_more'></button>";*/
						html += "		</div>";
						html += "		<div class='item_title'>" + item.title + "</div>";
						html +=	"	</div>";
						html += "	<div class='item_desc'>" + item.express.replace(/<\/?[^>]+(>|$)/g, "") + "</div>";
						html += "	</div>";
						html +=	"</div>";
					}					
					$("#item_list_ul").html(html);
					$("#btn_select_all_item").removeClass("hide");				
				} else {
				///////////// 노트가 존재하지 않을 때 //////////////
					html += "<div class='empty_note'><span class='note_img'></span><span>"+gap.lang.va113+"</span></div>";
					$("#item_list_ul").html(html);
				}
				//파일 리스트를 그린다.
				gnote.note_source_list_draw(file_info);									
				gnote.ai_notebook_event("note");				
				/// 전체선택 ///
				$("#btn_select_all_item").on("click", function(){
				
					$("#item_list_ul .item_border .item_chkbox").prop("checked", true);
					$("#item_list_ul .item_border").addClass("select");
					
					$(this).addClass("hide");
					$("#btn_deselect_all_item").removeClass("hide");
					$("#btn_remove_item").removeClass("hide");
					///첫번쨰 수직선을 숨긴다.
					$("#notebook_action_btn_wrap .vertical_bar").eq(0).hide();
					$("#notebook_action_btn_wrap .vertical_bar").eq(1).show();		
					gnote.set_note_count();		
				});
				/// 전체선택 해제 ///
				$("#btn_deselect_all_item").on("click", function(){					
					$("#item_list_ul .item_border .item_chkbox").prop("checked", false);
					$("#item_list_ul .item_border").removeClass("select");					
					$("#notebook_action_btn_wrap .vertical_bar").hide();
					$("#btn_select_all_item").removeClass("hide");
					$(this).addClass("hide");
					$("#btn_remove_item").addClass("hide");		
					gnote.set_note_count();		
				});
			
				///////// 노트 삭제
				$("#notebook_action_btn_wrap #btn_remove_item").on("click", function(e){	
					var msg = gap.lang.confirm_delete;
					gap.showConfirm({
						title: "Confrim",
						contents: msg,
						callback: function(){
							var ids = [];
							$("#item_list_ul .item_chkbox:checked").each(function(i, obj){
								ids.push($(obj).data("id"));				
							});				
							var data = JSON.stringify({
								"key" : ids.join(",")
							});
							var url = gptpt.plugin_domain_fast + "notebook/ai_note_delete";
							gap.ajaxCall(url, data, 
								function(res){
									$(e.currentTarget).addClass("hide");
									$("#btn_deselect_all_item").addClass("hide");
									$("#notebook_action_btn_wrap .vertical_bar").hide();
									$("#item_list_ul .item_border .item_chkbox:checked").closest(".item_border").remove();							
									if($("#item_list_ul .item_border .item_chkbox").length === 0){
										/// 노트북을 삭제하고 목록에 노트북이 존재하지 않을 때
										$("#btn_select_all_item").addClass("hide");								
										var html = "";
										html += "<div class='empty_note'><span class='note_img'></span><span>"+gap.lang.va113+"</span></div>";
										$("#item_list_ul").append(html);
									}
								}
							);			
						}			
					});				
					
				});				
			}
		);		
	},
	
	///////// 노트북 제목 수정하는 함수 ////////
	"notebook_title_edit": function(){		
		var title = $("#notebook_title_txt").text();		
		$("#notebook_title_txt").hide();
		$("#input_edit_title").show().val(title);		
		$("#input_edit_title").outerWidth($("#notebook_title_txt").outerWidth()+3);
		$("#ai_notebook_layer .notebook_title_box").css("gap", "12px");		
		$("#ai_notebook_layer .edit_btn_box").show();
		
		///// 확인버튼 /////////
		$("#btn_edit_title_ok").off().on("click", function(){			
			var change_title = $("#input_edit_title").val();			
			var url = gap.channelserver + "/api/kgpt/ai_notebook_title_update.km";
			var data = JSON.stringify({
				"id" : gnote.current_notebook,
				"notebook_name" : change_title
			});			
			gap.ajaxCall(url, data,
				function(res){
					//성공시
					$("#notebook_title_txt").text($("#input_edit_title").val());					
					$("#notebook_title_txt").show();
					$("#btn_edit_title").show();
					$("#input_edit_title").hide().val("");
					$("#ai_notebook_layer .edit_btn_box").hide();
				}
			);			
		});
		
		////// 취소버튼 ///////
		$("#btn_edit_title_cancel").off().on("click", function(){
			$("#notebook_title_txt").text(title);			
			$("#notebook_title_txt").show();
			$("#btn_edit_title").show();
			$("#input_edit_title").hide().val("");
			$("#ai_notebook_layer .edit_btn_box").hide();
		});
		
		/// 입력창에서 엔터키로 저장하기
		$("#input_edit_title").off().on("keydown", function(e){
			if(e.keyCode === 13){
				$("#btn_edit_title_ok").click();
			}
		});
	},
	
	////////// AI 노트북에 노트 추가 레이어 //////////
	"add_note_layer_draw": function(){		
		var html = "";		
		html += "<div id='add_note_layer'>";
		html += "	<div class='layer_inner'>";
		html += "		<div class='layer_top'>";
		html += "			<h4 class='layer_title'>"+gap.lang.va106+"</h4>";
		html += "			<button type='button' class='btn_layer_close'></button>"
		html += "		</div>";
		html += "		<div class='layer_content_wrap'>";
		html += "		<div class='layer_content' style='flex: 1;'>";
		html += "			<div class='input_wrap'>";
		html += "				<h5 class='content_title'>"+gap.lang.basic_title+"</h5>";
		html += "				<input type='text' autocomplete='off' class='input_note_title' placeholder='"+gap.lang.input_title+"' id='ai_note_title')'>";
		html += "			</div>";
		html += "			<div class='textarea_wrap'>";
		html += "				<h5 class='content_title'>"+gap.lang.basic_content+"</h5>";
		html += "				<textarea class='textarea_note_desc' placeholder='"+gap.lang.input_content+"' spellcheck='false' id='ai_note_content'></textarea>";
		html +=	"			</div>";
		html +=	"		</div>";
		html += "		<div class='btn_wrap'>";
		html += "			<button type='button' class='btn_save' id='ai_note_save'>"+gap.lang.basic_save+"</button>";
		html += "			<button type='button' class='btn_cancel'>"+gap.lang.Cancel+"</button>";
		html += "		</div>"
		html += "		</div>";
		html += "	</div>"
		html +=	"</div>";		
		$("#dark_layer").append(html);
		$("#dark_layer").fadeIn(150);		
		//////// 레이어 닫기 ///////////
		$("#add_note_layer .btn_layer_close, #add_note_layer .btn_cancel").on("click", function(){
			$("#dark_layer").fadeOut(150);
			$("#dark_layer").empty();
		});
		
		$("#ai_note_save").on("click", function(e){			
			var title = $("#ai_note_title").val();
			var content = $("#ai_note_content").val();
			if (title == ""){
				gap.gAlert(gap.lang.input_title);
				return false;
			}
			if (content == ""){
				gap.gAlert(gap.lang.input_content);
				return false;
			}			
			gnote.ai_note_save_fn(title, content, gnote.current_notebook, "me", "note");		
		});		
	},
	
	"ai_note_save_fn" : function(title, content, notebook_code, type, callfrom){
		//type : me, answer
		//정보를 받아서 노트를 저장합니다.
		var msg = gap.lang.va127;
		gap.showConfirm({
			title: "Confrim",
			contents: msg,
			callback: function(){		
				gap.show_loading(gap.lang.va286);					
				var url = gptpt.plugin_domain_fast + "notebook/ai_note_save";
				var data = JSON.stringify({
					"title" : title,
					"content" : content,
					"ky" : gap.userinfo.rinfo.ky,
					"notebook_code" : notebook_code,
					"source_count" : 0,
					"type" : type
				});			
				gap.ajaxCall(url, data,
					function(res){
						if (callfrom == "note"){
							$("#item_list_ul").empty();
							gnote.note_list_draw();
						}else{
							
						}							
						gap.hide_loading();
						$("#dark_layer").fadeOut(150);
						$("#dark_layer").empty();
					}
				);
			}
		});
	},
	
	//// 노트 자세히 보기 레이어 //////////
	"note_view_layer_draw": function(id){		
		var url = gap.channelserver + "/ai_note_info.km";
		var data = JSON.stringify({
			"uid" : id
		});		
		gap.ajaxCall(url, data, 
			function(res){				
				var item = res.data;				
				var html = "";				
				var is_edit = typeof(item.edit);
				
				//var content = item.content.replace(/\n/g, '<br>').replace(/ {2,}/g, match => '&nbsp;'.repeat(match.length)); // 여러 공백을 &nbsp;로 변환			
  				var content = item.content;	
				
				html += "<div id='note_view_layer' class='note_view_layer'>";
				html += "	<div class='layer_inner' style='width:100%'>";
				html += "		<div class='layer_top'>";
				html += "			<div class='title_box'>";
				html += "				<h4 class='layer_title'>" + item.title + "</h4>";
				html += "			</div>";				
				html += "			<div class='layer_top_btn_box_wrap'>";
				html += "				<div class='util_btn_box'>";				
				html += "					<button type='button' class='btn_util share' id='note_share_btn'>";
				html += "						<span class='btn_inner'>";
				html += "							<span class='btn_ico'></span>";
				html += "							<span class='btn_txt'>공유</span>";
				html += "						</span>";
				html += "					</button>";				
				html += "					<button type='button' class='btn_util edit' id='note_edit_btn'>";
				html += "						<span class='btn_inner'>";
				html += "							<span class='btn_ico'></span>";
				html += "							<span class='btn_txt'>편집</span>";
				html += "						</span>";
				html += "					</button>";				
				html += "					<button type='button' class='btn_util save' id='note_update_btn' style='display:none'>";
				html += "						<span class='btn_inner'>";
				html += "							<span class='btn_ico'></span>";
				html += "							<span class='btn_txt'>저장</span>";
				html += "						</span>";
				html += "					</button>";				
				html += "					<button type='button' class='btn_util delete' id='note_delete_btn'>";
				html += "						<span class='btn_inner'>";
				html += "							<span class='btn_ico'></span>";
				html += "							<span class='btn_txt'>삭제</span>";
				html += "						</span>";
				html += "					</button>";
				html += "				</div>";				
				html += "				<button type='button' class='btn_layer_close'><span class='btn_ico'></span></button>";			
				html += "			</div>";			
				html += "		</div>";
			//	html += "		<div class='layer_content'><div class='note_desc' id='note_content_dis'>" + gap.aLink(content) + "</div></div>";
				html += "		<div class='layer_content'><div class='note_desc' id='note_content_dis'></div></div>";
				html +=	"	</div>";
				html += "</div>";				
				
				
	
				html = marked.parse(html);
				
				$("#dark_layer").append(html);			
				
				if (item.type == "me"){							
					var content = gap.textToHtml(content);
					content = content.replace(/ /gi, "&nbsp;");			
					$("#note_content_dis").html(content);
				}else{
					$("#dark_layer").addClass("markdown-body");
					$("#dark_layer").parent().css("white-space", "inherit");
					$("#note_content_dis").html(content);
				}
									
				
				$("#dark_layer").fadeIn(150);								
				//////// 레이어 닫기 ///////////
				$("#note_view_layer .btn_layer_close").on("click", function(){
					$("#dark_layer").fadeOut(150);
					$("#dark_layer").empty();
				});
				
				//////// 노트 공유하기 ////////
				$("#note_share_btn").on("click", function(){
					gptapps.showNoteShare("note_content_dis");
				});
				
				//////// 노트 편집 //////////
				$("#note_edit_btn").on("click", function(){
					$("#note_content_dis").attr("contenteditable", true);
					$("#note_edit_btn").hide();
					$("#note_update_btn").show();
					$("#note_content_dis").css("background-color", "#F5F5F5");
					$("#note_content_dis").css("border", "1px solid grey");					
				});
				
				//////// 저장하기 //////////
				$("#note_update_btn").on("click", function(e){					
					$("#note_edit_btn").show();
					$("#note_update_btn").hide();
					$("#note_content_dis").attr("contenteditable", false);
					$("#note_content_dis").css("background-color", "#fff");
					var content = $("#note_content_dis").html();
					var url = gptpt.plugin_domain_fast + "notebook/ai_note_update";
					var data = JSON.stringify({
						"key" : id,
						"content" : content
					});					
					gap.ajaxCall(url, data, function(res){
						if (res.result == "OK"){
							gnote.note_list_draw();
							$("#note_view_layer .btn_layer_close").click();
						}else{
							gap.error_alert();
						}
					});					
				});				
				///////// 노트 삭제 ////////
				$("#note_delete_btn").on("click", function(){
					var msg = gap.lang.confirm_delete;
					gap.showConfirm({
						title: "Confrim",
						contents: msg,
						callback: function(){
							var ids = [];
							ids.push(id);				
							var data = JSON.stringify({
								"key" : ids.join(",")
							});
							var url = gptpt.plugin_domain_fast + "notebook/ai_note_delete";
							gap.ajaxCall(url, data, 
								function(res){
									$("[data-id='"+id+"']").remove();
									$("#note_view_layer .btn_layer_close").click();
								}
							);
						}
					});
				});
				//location태그 링크 처리				
				$("#dark_layer location").off().on("click", function(e){
					var loc = $(e.currentTarget).text();
					gptapps.location_search(loc);
				});
			}
		);		
	},	
	
	///////////////// AI 노트북 채팅창 이벤트 ////////////////
	"ai_notebook_chat_section_event": function(){		
		/// 채팅 보기 버튼 ////
		$("#btn_view_chat").on("click", function(){
			$("#ai_notebook_chat_area").addClass("open");
			$(this).removeClass("show");
			$("#btn_close_chat").addClass("show");
		});
		
		/// 채팅 닫기 버튼 ////
		$("#btn_close_chat").on("click", function(){
			$("#ai_notebook_chat_area").removeClass("open");
			$(this).removeClass("show");
			$("#btn_view_chat").addClass("show");
		});
		
		//// 채팅창 textarea ///
		$("#notebook_question_textarea").on("keyup", function(e){
			var val = $.trim($(this).val());
			if(val.length > 0){
				$("#ai_notebook_main_chat_box .btn_notebook_question").addClass("active");
			} else {
				$("#ai_notebook_main_chat_box .btn_notebook_question").removeClass("active");
			}			
		});
		
		$("#notebook_question_textarea").on("keydown", function(e){		
			var val = $.trim($(this).val());			
			if(val.length > 0){				
				if(e.type === "keydown" && e.keyCode === 13 && !e.shiftKey){
					$("#btn_notebook_question").click();	
					$(this).val("");
					$(this).css("height", "21px");
					$("#ai_notebook_chat_area .inner").mCustomScrollbar("scrollTo", "bottom");
					return false;
				}				
			}			
		});
		
		$("#notebook_question_textarea").on("input", function(){
			let maxHeight = 126; // 최대 높이 설정
		    $(this).height(0).height(Math.min(this.scrollHeight, maxHeight));
		});
		
		//// 채팅창 textarea ///
		
		//// 채팅창 질문 전송버튼 //////
		$("#btn_notebook_question").on("click", function(){
			
			var val = $.trim( $("#notebook_question_textarea").val() );
			
			if($("#notebook_question_textarea").val().length !== 0){
				gnote.notebook_chat_question_draw(val);				
			} else {
				gap.gAlert(gap.lang.va102)
			}
		});		
	},
	
	/// 채팅창 나의 질문 그리는 함수
	"notebook_chat_question_draw": function(question){				
		var html = "";		
		html += "<div class='question_box'>";
		html += "	<div class='question'>" + question + "</div>";
		html +=	"</div>";		
		$("#ai_notebook_chat_area").addClass("open");
		$("#btn_view_chat").removeClass("show");
		$("#btn_close_chat").addClass("show");		
		$("#chat_container").append(html);		
		gnote.notebook_chat_answer_draw(question);
	},
	
	"notebook_chat_answer_draw" : function(msg){

		var isFolder = $("#btn_create_new_notebook").is(":visible");		
		var lists = $('#source_list_ul .source_chkbox:checked');
		var sel_count = $("#item_list_ul .item_chkbox:checked");		
		var callType = "apps/pluginMyData_new";		
		var fs = "F";
		if (isFolder){
			fs = "T";
			var all_folder = $("#item_list_ul .item_chkbox").length;
			if (all_folder != 0 && sel_count.length == 0){
				sel_count = $("#item_list_ul .item_chkbox");
			}
		}		
		if(sel_count.length > 0){
			callType = "apps/notesData";
			var ids = [];
			for (var i = 0 ; i < sel_count.length; i++){
				var item = sel_count[i];
				ids.push($(item).data("id"));
			}
		}else{			
			//source에서 자료를 참고한다.
			var ids = [];
			for (var i = 0 ; i < lists.length; i++){
				var item = lists[i];
				ids.push($(item).attr("id"));
			}
		}			
		var clist_text = ids.join(" ");				
		var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : msg,
			keys : clist_text,
			fs : fs,
			ky : gap.userinfo.rinfo.ky,
			lang : gap.curLang
		});				
		
		
		if (callType == "apps/pluginMyData_new"){
			postData = JSON.stringify({
				user : gap.userinfo.rinfo.nm,
				word : msg,
				keys : clist_text,
				fs : fs,
				ky : gap.userinfo.rinfo.ky,
				lang : gap.curLang,
				call_code : "mydata"
			});		
		}
		
		var dis_id = "notebook_chat_" + new Date().getTime();
		
		var html = "";
		html += "<div class='answer_box'>";		
		html += "<div class='answer'>";
		html += "	<div class='answer_txt' id='"+dis_id+"'>";
		html +=	"	</div>";			
		html += "	<div class='answer_btn_wrap_box' id='"+dis_id+"_btn' style='display:none'>";
		html +=	"		<div class='answer_btn_wrap' >";
		html +=	"			<button type='button' class='btn_ai_answer copy'><span class='btn_ico'></span></button>";
	//	html +=	"			<button type='button' class='btn_ai_answer like'><span class='btn_ico'></span></button>";
	//	html +=	"			<button type='button' class='btn_ai_answer dislike'><span class='btn_ico'></span></button>";
		html +=	"			<button type='button' class='btn_ai_answer share'><span class='btn_ico'></span></button>";
		html +=	"		</div>";
		html +=	"		<button type='button' class='btn_save_to_note' id='"+dis_id+"_save_note'>";
		html += "			<span class='btn_inner'>";
		html += "				<span class='btn_ico'></span><span>"+gap.lang.va114+"</span>";
		html += "			</span>";
		html += "		</button>";
		html += "	</div>";		
		html +=	"</div>";					
		html += "</div>";			
		$("#chat_container").append(html);		
		//AI 답변 아이콘버튼
		$("#ai_notebook_chat_area .answer_btn_wrap .btn_ai_answer").off().on("mouseenter", function(e){
			var name_ko = "";
			var type = e.currentTarget.className.replace("btn_ai_answer ", "");			
			if(type === "copy"){
				name_ko = gap.lang.copy;
			}
			if(type === "like"){
				name_ko = gap.lang.va115;
			}
			if(type === "dislike"){
				name_ko = gap.lang.va116;
			}
			if(type === "share"){
				name_ko = gap.lang.share;
			}			
			var html = "<div id='btn_bubble_box'>" + name_ko + "</div>";			
			$(this).append(html);
		});
		$("#ai_notebook_chat_area .answer_btn_wrap .btn_ai_answer").on("mouseleave", function(e){
			$("#btn_bubble_box").remove();
		});		
		var tp = ".........";
		var options = {
					strings : [tp],
					typeSpeed : 5,
					contentType: 'html',
					loop: true
				}		
		var typed2 = new Typed("#"+dis_id, options);
		
		var url = "";
		
		if (callType == "notesData"){
			url = gptpt.plugin_domain_fast + "notebook/" + callType;
		}else{
			url = gptpt.plugin_domain_fast + "apps/" + callType;
		}
			
		
		var cc = dis_id;
		var accumulatedMarkdown = "";
		$("#" + cc).addClass("markdown-body");
		$("#" + cc).parent().css("white-space", "inherit");	
		
		
		
		var ssp = new SSE(gptpt.plugin_domain_fast + callType, {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	            method: 'POST'});
	            
	    ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");	
			ssp.close();		
		});
		
		ssp.addEventListener('open', function(e) {
			//$("#" + cc + "_typed").remove();
			typed2.destroy();
			typed2 = null;			
		});
		
		var isREF = false;
	   	ssp.addEventListener('message', function(e) {	
			console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n"); 		
			if (e.data == "[DONE]"){				
				///// 답변이 끝나면 질문버튼 CSS 초기화
				$("#btn_work_req").removeClass("stop");				
				gptapps.write_btns_event(cc);		
				gap.scroll_move_to_bottom_time_gpt(200);	
				ssp.close();
				
				
				$("#" + dis_id + "_btn").fadeIn();
				setTimeout(function(){
					$("#ai_notebook_chat_area .inner").mCustomScrollbar("scrollTo", "bottom");
				}, 1000);								
				//버튼에 이벤트를 추가한다.			
				$("#ai_notebook_chat_area .answer_btn_wrap .btn_ai_answer").on("click", function(e){
									
					var id = $(e.currentTarget).parent().parent().attr("id").replace("_btn","");
					var cls = $(e.currentTarget).attr("class");
					if (cls.indexOf("copy") > -1){
						//텍스트 복
						gnote.range_text_copy(id);
					}else if (cls.indexOf("like") > -1){
						
					}else if (cls.indexOf("dislike") > -1){
						
					}else if (cls.indexOf("share") > -1){
						//공우 버튼 클릭
						gptapps.showNoteShare(id);
					}								
				});
			
		
				//노트에 저장하기 버튼 클릭시 이벤트
				$("#ai_notebook_chat_area .btn_save_to_note").off().on("click", function(e){	
						
					var id = $(e.currentTarget).attr("id").replace("_save_note","");
					var content = $("#" + id).html();
					var title = $("#" + id).parent().parent().prev().find(".question").text();									
					gnote.ai_note_save_fn(title, content, gnote.current_notebook, "answer", "note");
				
				});
				
        		return;	
        	}else if (e.data.indexOf("[REF]") > -1){
				isREF = true;
				
				var rrx = "<div id='"+cc+"_reference'></div>";		
				$("#"+cc).append(rrx);	
	
				gptpt.reference_draw_person(pph, cc);						
			}else{			
				if (!isREF){
					if (pph != ""){
						accumulatedMarkdown += pph;
	                	const html = marked.parse(accumulatedMarkdown);
	                	$("#"+cc).html(html);
					}		
	            }					
			}		
		});
		ssp.stream();	
		
		return false;		
	
		$.ajax({
			type : "POST",
			url : url,
			data : postData,
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){			
				typed2.destroy();
				typed2 = null;				
				
				var ref = "";
				if (res == "ERROR"){
					$("#"+dis_id).html("<div>"+gap.lang.va47 + "</div>");
				}else{
					ref = res.split("-$$$-")[1];
					res = res.split("-$$$-")[0];
					res = res.replace(/[\n\r]/gi, "<br>");										
					res = gptpt.special_change(res);
					res = gptpt.change_markdown_html(res);				
					var options = {
						strings : [res],
						typeSpeed : 1,
						contentType: 'html',
						onComplete: function(){														
							$("#" + dis_id + "_btn").fadeIn();
							setTimeout(function(){
								$("#ai_notebook_chat_area .inner").mCustomScrollbar("scrollTo", "bottom");
							}, 1000);								
							//버튼에 이벤트를 추가한다.			
							$("#ai_notebook_chat_area .answer_btn_wrap .btn_ai_answer").on("click", function(e){						
								var id = $(e.currentTarget).parent().parent().attr("id").replace("_btn","");
								var cls = $(e.currentTarget).attr("class");
								if (cls.indexOf("copy") > -1){
									//텍스트 복
									gnote.range_text_copy(id);
								}else if (cls.indexOf("like") > -1){
									
								}else if (cls.indexOf("dislike") > -1){
									
								}else if (cls.indexOf("share") > -1){
									//공우 버튼 클릭
									gptapps.showNoteShare(id);
								}								
							});
						
					
							//노트에 저장하기 버튼 클릭시 이벤트
							$("#ai_notebook_chat_area .btn_save_to_note").off().on("click", function(e){								
								var id = $(e.currentTarget).attr("id").replace("_save_note","");
								var content = $("#" + id).html();
								var title = $("#" + id).parent().parent().prev().find(".question").text();									
								gnote.ai_note_save_fn(title, content, gnote.current_notebook, "answer", "note");
							
							});
								
						}
					}
					var typed = new Typed("#"+dis_id, options);
				}			
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"range_text_copy" : function(id){     
        // Div의 HTML 내용을 가져옵니다.

        var htmlToCopy = $('#'+id).html();
        
        // 임시 <textarea> 생성
        var tempTextarea = $('<textarea>');
        $('body').append(tempTextarea);
        // HTML을 텍스트로 변환하며 줄바꿈과 공백 유지
        var formattedText = htmlToCopy
            .replace(/<br\s*\/?>/gi, '\n') // <br>을 줄바꿈으로 변환
            .replace(/&nbsp;/g, ' ') // HTML 비공백을 일반 공백으로 변환
       //     .replace(/<div class=\'gpt_btn_wrap_box\s*\/?>/gi, " ");
        tempTextarea.val(formattedText).css('white-space', 'pre-wrap').select();
        // 클립보드에 복사
        try {
            var successful = document.execCommand('copy');
            if (successful) {
               	gap.gAlert(gap.lang.ba3);
            } else {
                gap.error_alert();
            }
        } catch (err) {
            gap.error_alert();
        }
        // 임시 textarea 제거
        tempTextarea.remove();
	},	
	
	"range_text_copy_url_summary" : function(id){     
        // Div의 HTML 내용을 가져옵니다.

        
        var cloned = $('#'+id).clone();
        cloned.find(".answer_link_box").remove();
		cloned.find('.gpt_btn_wrap_box').remove();
		cloned.find('.summary_box').remove();
		cloned.find('.related_info_wrap').remove();
		var htmlToCopy = cloned.html();
        
        // 임시 <textarea> 생성
        var tempTextarea = $('<textarea>');
        $('body').append(tempTextarea);
        // HTML을 텍스트로 변환하며 줄바꿈과 공백 유지
        var formattedText = htmlToCopy
            .replace(/<br\s*\/?>/gi, '\n') // <br>을 줄바꿈으로 변환
            .replace(/&nbsp;/g, ' ') // HTML 비공백을 일반 공백으로 변환
       //     .replace(/<div class=\'gpt_btn_wrap_box\s*\/?>/gi, " ");
        tempTextarea.val(formattedText).css('white-space', 'pre-wrap').select();
        // 클립보드에 복사
        try {
            var successful = document.execCommand('copy');
            if (successful) {
               	gap.gAlert(gap.lang.ba3);
            } else {
                gap.error_alert();
            }
        } catch (err) {
            gap.error_alert();
        }
        // 임시 textarea 제거
        tempTextarea.remove();
	},	
	
	////// 영문+숫자 조합하여 무작위로 12자리 반환하는 함수 ////////
	"generateUniqueId": function() {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	    let uniqueId = '';
		for (let i = 0; i < 12; i++) {
			const randomIndex = Math.floor(Math.random() * chars.length);
			uniqueId += chars[randomIndex];
		}
		return uniqueId;
	},
	
	//////// 노트 소스 목록 그리는 함수 ////////////////
	"note_source_list_draw": function(file_info){	
		$("#source_list_ul").empty();	
		var html = "";		
		if( file_info.length > 0 ){			
			for (var i = 0; i < file_info.length; i++){
				var file = file_info[i];
				gnote.insert_note_file(file.type, file.filename, file.filekey);
			}			
		} else {			
			/// 전체선택 체크박스 숨김
			$("#all_chkbox_wrap_box").hide();
			html += "<div id='empty_notbook_source' class='please_add_source'>소스를 추가해주세요</div>";
			
			$("#source_list_ul").append(html);
		}		
		//소스 카운드를 처리한다. ///////////////////////////////////////////////		
		gnote.set_note_count();
		///////////////////////////////////////////////////////////////////		
		gnote.note_source_list_draw_event(file_info.length);	
	},
	
	"insert_note_file" : function(type, filename, filekey){
		
		/// 파일 중복등록 방지
		if($("#" + filekey).length !== 0){
			alert("이미 등록되어 있는 파일입니다.");
			return false;
		}
		
		if(!$("#all_chkbox_wrap_box").is(":visible")){
			$("#all_chkbox_wrap_box").show();
		}
		
		//실제 파일을 노트북에 추가하는 행위는 이전에 처리하고 여기는 파일을 표시만 한다.
		var html = "";
		html += "<div class='source_li' title='" + filename + "'>";
		html += "	<input type='checkbox' id='" + filekey + "' class='source_chkbox' checked><label for='" + filekey + "' class='source_chkbox_label'></label>";
		html += "	<div class='source_title_box_wrap'>";
		html += "		<div class='source_title_box'>";
		html += "			<div class='source_type_wrap " + type.toLowerCase() + "'>";
		html += "				<span class='source_type'>" + type + "</span>";
		html +=	"			</div>";
		html += "			<span class='source_title_txt'>" + filename + "</span>";
		html += "		</div>";
		html += "		<button type='button' class='btn_more' data-key='"+filekey+"'></button>";
		html += "	</div>";
		html += "</div>";
		
		$("#empty_notbook_source").remove();
		$("#source_list_ul").append(html);
		
		/*** 소스 체크박스 이벤트 ***/
		$("#source_nav .source_chkbox").on("change", function(){
			
			if($("#source_nav .source_chkbox:checked").length === $("#source_nav .source_chkbox").length){
				/// 소스 전체 선택일 때
				$("#source_all_chk").prop("checked", true);
			} else {
				/// 소스 전체 선택이 아닐 때
				$("#source_all_chk").prop("checked", false);
			}	
			gnote.set_note_count();
		});
		
		$("#source_list_ul .btn_more").off().on("click", function(e){
			$.contextMenu({
				selector : "#source_list_ul .btn_more",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){					
					gnote.context_menu_call_req_mng(key, options, $(this).data("key"));						
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
                	}
				},			
				build : function($trigger, options){
					return {
						items: gnote.req_info_menu_note("T")
					}
				}
			});			
		});
	},	
	
	"context_menu_call_req_mng" : function(opt, options, obj){		
		 if (opt == "delete"){
			//항목 삭제
			var id = gnote.current_notebook;
			var filekey = obj;			
			var url = gap.channelserver + "/ai_note_file_remove.km";
			var data = JSON.stringify({
				"uid" : id,
				"filekey" : filekey
			});			
			gap.ajaxCall(url, data, 
				function(res){
					if (res.result == "OK"){
						$("#"+obj).parent().remove();
						
						/// 소스가 전체 삭제됐을 경우
						if($(".source_li").length === 0){
							
							html = "<div id='empty_notbook_source' class='please_add_source'>소스를 추가해주세요</div>";
							
							$("#all_chkbox_wrap_box").hide();
							$("#source_list_ul").append(html);
							
						}
					}else{
						gap.error_alert();
					}					
				}
			);		
		}
	},
	
	 "req_info_menu_note" : function(){	
		var items = {
			"delete" : {name : gap.lang.basic_delete}
		}
		return items;
	},	
	
	"note_source_list_draw_event" : function(count){
		$("#ai_notebook_main_chat_box .source_count_txt").html(gap.lang.va108 + " <span class='source_sel_count'>" + count + "</span>" + gap.lang.va105);		
		$("#source_all_chk").on("change", function(){
			if($(this).prop("checked") === true){
				$("#source_nav .source_chkbox").prop("checked", true);
			} else {
				$("#source_nav .source_chkbox").prop("checked", false);
			}					
			gnote.set_note_count();
		});
		
		$("#source_nav .source_chkbox").on("change", function(){
			if($("#source_nav .source_chkbox:checked").length === $("#source_nav .source_chkbox").length){
				$("#source_all_chk").prop("checked", true);
			} else {
				$("#source_all_chk").prop("checked", false);
			}	
			gnote.set_note_count();
		});		
	},
	
	"save_as_note_layer_draw": function(title, content){		
		var data = JSON.stringify({
			"query" : "",
			"start" : 0,
			"perpage" : 10000,
			"sort" : "1"
		});
		var url = gap.channelserver + "/api/kgpt/ai_notebook_list.km";
		gap.ajaxCall(url, data, 
			function(res){
				var html = "";				
				var data = res.data.data;
				if( data.length > 0 && data !== undefined ){
				///////////// 노트북이 존재할 때 //////////////					
					var html = "";		
					html += "<div id='popup_save_as_note_layer' class='popup_save_as_note_layer'>";
					html += "	<div class='layer_inner'>";					
					html += "		<div class='layer_top'>";
					html += "			<h2 class='layer_title'>노트로 저장하기</h2>";
					html += "			<button type='button' id='btn_layer_close' class='btn_layer_close'>";
					html += "				<span class='btn_ico'></span>";
					html += "			</button>";
					html += "		</div>";					
					html += "		<div class='layer_content'>";
					html += "			<div id='saved_notebook_item_list_ul' class='notebook_item_list_ul'>";				
					for (var i = 0; i < data.length; i++){						
						var itm = data[i];
						var id = itm._id;
						///// 공유 노트북일 때 //////
						html += "<div class='item_border shared' data-id='"+id+"'>";
						html += "	<div class='item_inner'>";
						html += "		<div class='item_top_wrap'>";
						html += "			<div class='item_title'>" + data[i].notebook_name + "</div>";
						html +=	"		</div>";
						html += "	</div>";						
						html +=	"</div>";					
					}				
					html +=	"			</div>";				
					html += "		</div>";
					html += "	</div>";
					html += "</div>";					
					html = $(html);
					
					$("#dark_layer").fadeIn(150, function(){
						$(this).append(html);
						
						$("#saved_notebook_item_list_ul .item_border").off().on("click", function(e){
							var id = $(e.currentTarget).data("id");
							gptapps.notebook_save(title, content, id);
						});
						
						$("#btn_layer_close").on("click", function(){
							$("#dark_layer").fadeOut(150, function(){
								$(this).empty();
							});
						});
						$("#popup_save_as_note_layer .btn_cancel").on("click", function(){
							$("#btn_layer_close").click();
						});
						
					});
				}
			}
		);
	}		
	
}