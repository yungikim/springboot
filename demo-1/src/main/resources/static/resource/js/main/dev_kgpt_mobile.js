
 function kgptmobile(){
	 gap.curLang = "ko"
 } 

 kgptmobile.prototype ={
	"init" : function(){
		gptmo.draw_gpt_main();
	},
	"draw_gpt_main": function(){
		var html = "";
		
		/**** 상단 타이틀 ****/
		html += "<div id='kgpt_main_title_box'>";
		html += "	<div class='title_wrap'>";
		html += "		<button type='button' class='title_btn'>";
		html += "			<span class='arrow_back_ico'></span>";
		html += "		</button>";
		html += "		<span class='title_txt'>K-GPT</span>";
		html += "	</div>";
		html += "	<div class='util_btn_wrap'>";
		
		html += "		<button type='button' id='btn_go_to_gpt_main' class='title_btn'>";
		html += "			<span class='new_ico'></span>";
		html += "		</button>";
		/*
		html += "		<button type='button' id='btn_open_history' class='title_btn'>";
		html += "			<span class='history_ico'></span>";
		html += "		</button>";
		html += "		<button type='button' class='title_btn'>";
		html += "			<span class='template_ico'></span>";
		html += "		</button>";
		*/
		
		html += "	</div>";
		html += "</div>";
		/**** 상단 타이틀 ****/
		
		/**** 메인 영역 ****/		
		html += "<div id='kgpt_mobile_main' class=''>";
		
		html += "	<div class='ai_result_area' id='ai_first_msg' >";
		html += "		<div class='logo_wrap'><span class='logo_txt'>K-GPT AI</span><span class='logo_txt blue'>AI Communication</span></div>";
		html += "		<div class='template_wrap'>";		
		html += "			<div class='template_box mail'>";
		html += "				<div class='temp_inner'>";
		html += "					<div class='temp_name_wrap'>";
		html += "						<div class='temp_img'></div>";
		html += "						<div class='temp_name' data-code='mail4'>미확인 메일 요약해줘</div>";
		html += "					</div>";
		html += "					<button type='button' class='btn_temp'></button>";
		html += "				</div>";
		html += "			</div>";
		html += "			<div class='template_box calendar'>";
		html += "				<div class='temp_inner'>";
		html += "					<div class='temp_name_wrap'>";
		html += "						<div class='temp_img'></div>";
		html += "						<div class='temp_name' data-code='it8'>이번주 일정 알려줘</div>";
		html += "					</div>";
		html += "					<button type='button' class='btn_temp'></button>";
		html += "				</div>";
		html += "			</div>";
		html += "			<div class='template_box approval'>";
		html += "				<div class='temp_inner'>";
		html += "					<div class='temp_name_wrap'>";
		html += "						<div class='temp_img'></div>";
		html += "						<div class='temp_name' data-code='it4'>연차 휴가 등록해줘</div>";
		html += "					</div>";
		html += "					<button type='button' class='btn_temp'></button>";
		html += "				</div>";
		html += "			</div>";
		html += "			<div class='template_box hr'>";
		html += "				<div class='temp_inner'>";
		html += "					<div class='temp_name_wrap'>";
		html += "						<div class='temp_img'></div>";
		html += "						<div class='temp_name' data-code='it7'>회의실 예약 해줘</div>";
		html += "					</div>";
		html += "					<button type='button' class='btn_temp'></button>";
		html += "				</div>";
		html += "			</div>";
		html += "			<div class='template_box webresearch'>";
		html += "				<div class='temp_inner'>";
		html += "					<div class='temp_name_wrap'>";
		html += "						<div class='temp_img'></div>";
		html += "						<div class='temp_name' data-code='it12'>인공지능 웹 리서치</div>";
		html += "					</div>";
		html += "					<button type='button' class='btn_temp'></button>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		
		html += "	<div style='style='display:none'; height:calc(100% - 125px); overflow-y:auto' id='alarm_kgpt_sub'>";
	//	html += "		<div class='ai_result_dis' id='alarm_kgpt_top' style='width:100%; height:100%; overflow-y:auto; padding-right:10px'>1111111111</div>";
		html += "	</div>";		
		
		html += "	<div id='search_work_wrap' class='search_work_wrap'>";
		html += "		<div class='search_work_box'>";
		html += "			<button type='button' id='btn_web_research' class='btn_web_research'>";
		html +=	"				<span class='btn_ico'></span>";
		html += "				<span id='select_engine_wrap' class='select_engine_wrap'>";
		html += "					<span id='select_engine_name' class='btn_txt'></span>";
		html += "					<span id='btn_deselect_engine' class='btn_deselect_engine'></span>";
		html += "				</span>";
		html +=	"			</button>";
		html += "			<textarea name='searchWork' id='kgpt_txtarea' class='input_search_work' autocomplete='off' placeholder='원하시는 업무를 입력해주세요' spellcheck='false'></textarea>";
		html += "			<button type='button' id='btn_work_req'><span></span></button>";
		html += "		</div>";
		
		html += "		<div id='web_research_popup' class='web_research_popup' style='display:none'>";
		html += "			<div class='inner'>";
		html += "				<div class='select_engine_box'>";
		html += "					<button type='button' class='btn_search_engine kgpt active' data-id='Google'>";
		html += "						<span class='btn_inner'>";
		html += "							<span class='btn_ico'></span><span class='btn_txt'>Google</span>";
		html += "						</span>";
		html += "					</button>";
		html += "					<button type='button' class='btn_search_engine perplextiy' data-id='Perplexity'>";
		html += "						<span class='btn_inner'>";
		html += "							<span class='btn_ico'></span><span class='btn_txt'>Perplextiy</span>";
		html += "						</span>";
		html += "					</button>";
		html += "					<button type='button' class='btn_search_engine naver' data-id='Naver'>";
		html += "						<span class='btn_inner'>";
		html += "							<span class='btn_ico'></span><span class='btn_txt'>Naver</span>";
		html += "						</span>";
		html += "					</button>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		
		html += "	</div>";
		
		html += "</div>";
		/**** 메인 영역 ****/
		
		$("#kgpt_mobile").append(html);
		
		$(".title_btn").off().on("click", function(e){
			gptmo.init_dis();
		});
		
		$(".title_txt").off().on("click", function(e){
			gptmo.init_dis();
		});
		
		$(".template_box").off().on("click" , function(e){			
			var code = $(e.currentTarget).find(".temp_name").data("code");
			var query = $(e.currentTarget).find(".temp_name").text();
			gptmo.start_msg_send();
			gptpt.send_ai_request(query, code);
		});	
		
		
		$("#btn_open_history").off().on("click", function(){
			gptmo.draw_history_layer();
		});
		
		$("#btn_go_to_gpt_main").off().on("click", function(e){
			gptmo.init_dis();
		});
		
		
		/****** 질문 입력창 ******/
		/*
		$("#kgpt_txtarea").off().on("keypress input", function(e){			
			if (e.shiftKey && e.key === 'Enter') {				
			} else if (e.type == "keypress"){				
				if (e.keyCode == 13){
					$("#btn_work_req").click();					
					return false;
				}				
			} else if (e.type === "input"){
				var maxHeight = 244; // 최대 높이 설정				
				$(this).height(0).height(Math.min(this.scrollHeight, maxHeight));
			}
		});

		
		$("#kgpt_txtarea").off().on("keyup", function(e){	
			console.log(e)	
			var val = $(this).val();			
			if(val !== ""){
				$("#btn_work_req").addClass("active");
			} else {
				$("#btn_work_req").removeClass("active");
			}			
		});
		*/
		
		/****** 질문 입력창 ******/
		$("#kgpt_txtarea").off().on("keypress input keyup focus", function(e) {

		    var $this = $(this);
		    var val = $this.val();
		    var maxHeight = 244;

			$('#web_research_popup').fadeOut(500);
		
		    // 입력 감지 시 텍스트 영역 높이 자동 조절
		    if (e.type === "input") {
		        $this.height(0).height(Math.min(this.scrollHeight, maxHeight));
		    }
		
		    // Enter 키 입력 시 처리
		    if (e.type === "keypress" && e.keyCode === 13 && !e.shiftKey) {
		        $("#btn_work_req").click();
		        e.preventDefault();
		        return false;
		    }
		
		    // 입력값 유무에 따른 버튼 활성화
		    if (e.type === "keyup") {
		        if (val !== "") {
		            $("#btn_work_req").addClass("active");
		        } else {
		            $("#btn_work_req").removeClass("active");
		        }
		    }
		});
		
		$("#btn_work_req").off().on("click", function(){			
			var query = $("#kgpt_txtarea").val();
			gptmo.start_msg_send();
			gptpt.send_ai_request(query)
			$("#kgpt_txtarea").val("");
			$("#kgpt_txtarea").css({
				"height" : 20
			});
		});
		
		
		/****** 웹 리서치 이벤트 ****/
		/*
		$("#btn_web_research").on("mouseenter", function(e){			
			var name = e.currentTarget.className.replace("btn_", ""); // 버튼의 이름
			if(name === "web_research") {
				name_ko = gap.lang.va74;
			}		
			var html = "<div id='btn_bubble_box'>" + name_ko + "</div>";			
			$(this).append(html);			
		});
		*/
		
		$("#btn_web_research").on("mouseleave", function(e){
			$("#btn_bubble_box").remove();
		});
		$("#btn_web_research").on("click", function(){		
			var select_engine = localStorage.getItem("select_engine");
			if (select_engine != null){
				$("#btn_web_research").removeClass("active").addClass("select");
				$("#select_engine_wrap").addClass("select");
				$("#select_engine_name").text(select_engine);		
				
				var se = select_engine.toLocaleLowerCase().replace("-", "");
				$('.btn_search_engine.active').removeClass('active');
				$(".btn_search_engine." + se).addClass("active");
			}
			var bol = $('#web_research_popup').is(':visible');
			if (!bol){
				$('#web_research_popup').fadeIn();
				var inx = gap.maxZindex();
				$("#web_research_popup").css("z-index", parseInt(inx) + 1);
			}else{
				$('#web_research_popup').fadeOut(500);
			}			
		});
		
		$("#web_research_popup .btn_search_engine").on("click", function(){
			var select_engine = $(this).data("id");
			localStorage.setItem("select_engine", select_engine);
			$(this).addClass("active");
			$(this).siblings().removeClass("active");
			$("#btn_web_research").removeClass("active").addClass("select");
		//	$("#web_research_popup").removeClass('slide');
			$("#web_research_popup").fadeOut(500);
			
			$("#select_engine_wrap").addClass("select");
			$("#select_engine_name").text(select_engine);
			
			$("#search_work").focus();
		});
		
		$("#btn_deselect_engine").on("click", function(e){
			e.stopPropagation();
			$("#btn_web_research").removeClass("active select");
			$("#web_research_popup .btn_search_engine").removeClass("active");
			$("#select_engine_wrap").removeClass("select");
			$("#select_engine_name").text("");
		});
		/****** 웹 리서치 이벤트 ****/
		
	},
	
	"init_dis" : function(){
	//	debugger;
		$("#ai_first_msg").show();			
		$("#kgpt_mobile_main").css("padding-top", "60px");
		$("#alarm_kgpt_sub").hide();
		$("#alarm_kgpt_sub").empty();
	//	gptmo.draw_gpt_main();
		$("#btn_work_req").removeClass("active");
		
	},
	
	"start_msg_send" : function(){
		$("#ai_first_msg").hide();			
		$("#kgpt_mobile_main").css("padding-top", "0px");
		$("#alarm_kgpt_sub").show();
		
		$("#btn_work_req").addClass("active");
	},
	

	
	"draw_history_layer": function(){
		
		var html = "";
		
		html += "<div id='modal'>";
		html += "	<div id='layer_gpt_history'>";
		html += "		<div class='layer_inner'>";
		/** 상단버튼 **/
		html += "			<div class='title_box'>";
		html += "				<div class='top_btn_wrap'>";
		html += "					<button type='button'>";
		html += "						<span class='btn_inner go_to_gpt_btn'>";
		html += "							<span class='btn_ico new_ico_blue'></span>";
		html += "							<span>새글작성</span>";
		html += "						</span>";
		html += "					</button>";
		html += "					<button type='button'>";
		html += "						<span class='btn_inner ai_note_btn'>";
		html += "							<span class='ai_note_ico'></span>";
		html += "							<span>AI Note</span>";
		html += "						</span>";
		html += "					</button>";
		html += "				</div>";
		html += "				<button type='button' id='btn_layer_close' class='title_btn'>";
		html += "					<span class='close_ico'></span>";
		html += "				</button>";
		html += "			</div>";
		/** 상단버튼 **/
		
		/** 업무목록 **/
		html += "			<div class='work_list_box_wrap'>"
		html += "				<div class='work_list_box'>";
		html += "					<h4 class='work_title'>고정된 업무</h4>";
		html += "					<div id='fixed_list_ul' class='work_ul'>";
		html += "						<div class='work_li'>";
		html += "							<span class='work_li_title' title='인공지능 웹서치' id='' data-code=''>인공지능 웹서치</span>";
		html += "							<button type='button' class='btn_more'><span class='more_img'></span></button>";
		html += "						</div>";
		html += "					</div>";
		html += "				</div>";
		/*** 구분선 ***/
		html += "				<div class='divider'></div>";
		/*** 구분선 ***/
		html += "				<div class='work_list_box'>";
		html += "					<h4 class='work_title'>요청한 업무</h4>";
		html += "					<div id='req_list_ul' class='work_ul'>";
		html += "					</div>";
		html += "				</div>";
		html += "			</div>";
		/** 업무목록 **/
		
		html += "		</div>";
		html += "	</div>";
		html += "</div>";
		
		$("body").append(html);
		
		
		
		/**** 레이어 열기 ****/
		$("#modal").show();
		
		$("#layer_gpt_history").animate({
			"left" : "0%",
			"opacity" : 1
		}, 200);
		/**** 레이어 열기 ****/
		
		/**** 레이어 닫기 ****/
		$("#btn_layer_close").off().on("click", function(){
			
			$("#layer_gpt_history").animate({
				"left" : "-105%",
			}, 200);
			
			setTimeout(function(){
				$("#modal").fadeOut(100, function(){
					$("#modal").remove();
				});
			}, 200);
			
		});
		/**** 레이어 닫기 ****/
		
	},
	
}