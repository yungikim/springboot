/**
 * KGPT-Portal 설계관련 함수 
 */

 function kgptportal(){
	 
 }
 
 kgptportal.prototype ={
	 "init" : function(){
		 gptpt.kgpt_init();
	 },
	 
	 "kgpt_init" : function(){
		var html = '';
		html += "<div id='ai_portal_box'>";
		html += "	<div id='ai_portal_left_content' class='main_content'>";
		html += "		<div class='work_menu fixed_work_menu'>";
		html += "			<h4 class='work_title'>고정 업무</h4>";
		html += "				<div id='fixed_menu_wrap' class='menu_wrap'>";
		html += "				</div>";
		html += "		<div class='work_menu req_work_menu'>";
		html += "			<h4 class='work_title'>요청한 업무</h4>";
		html += "			<div id='req_work_menu' class='menu_wrap'>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		
		html += "	<div id='ai_portal_center_content' class='main_content'>";
		html += "		<button type='button' id='btn_ai_portal_sidebar_toggle'><span class='arrow_img'></span></button>";
		html += "		<div class='ai_result_area'>";
		html += "			<div class='logo_wrap'><span class='logo_txt'>K-GPT</span><span class='logo_txt blue'>AI</span></div>"
		
		html += "			<div class='template_wrap'>";		
		html += "				<div class='template_box mail'>";
		html += "					<div class='temp_inner'>";
		html += "						<div class='temp_name_wrap'>";
		html += "							<div class='temp_img'></div>";
		html += "							<div class='temp_name'>어제 메일 요약해줘</div>";
		html += "						</div>";
		html += "						<button type='button' class='btn_temp'></button>";
		html += "					</div>";
		html += "				</div>";
		html += "				<div class='template_box calendar'>";
		html += "					<div class='temp_inner'>";
		html += "						<div class='temp_name_wrap'>";
		html += "							<div class='temp_img'></div>";
		html += "							<div class='temp_name'>오늘 일정 알려줘</div>";
		html += "						</div>";
		html += "						<button type='button' class='btn_temp'></button>";
		html += "					</div>";
		html += "				</div>";
		html += "				<div class='template_box approval'>";
		html += "					<div class='temp_inner'>";
		html += "						<div class='temp_name_wrap'>";
		html += "							<div class='temp_img'></div>";
		html += "							<div class='temp_name'>미결재 문서 보여</div>";
		html += "						</div>";
		html += "						<button type='button' class='btn_temp'></button>";
		html += "					</div>";
		html += "				</div>";
		html += "				<div class='template_box hr'>";
		html += "					<div class='temp_inner'>";
		html += "						<div class='temp_name_wrap'>";
		html += "							<div class='temp_img'></div>";
		html += "							<div class='temp_name'>인사평가 데이터 확인 할</div>";
		html += "						</div>";
		html += "						<button type='button' class='btn_temp'></button>";
		html += "					</div>";
		html += "				</div>";
		html += "			</div>";

		
		html += "			<div class=search_work_wrap'>";
		html += "				<div id='file-preview-zone'></div>";
		
		html += "				<div class='search_work_box'>";
		
		html += "					<button id='attach-btn' title='파일 첨부'>";
		html += "                        <i data-lucide='plus' width='24' height='24'></i>";
		html += "                    </button>";
		html += "                    <input type='file' id='file-input' multiple style='display: none;'>";
		
		html += "					<input type='text' name='searchWork' id='search_work' class='input_search_work' autocomplete='true' placeholder='원하시는 업무를 입력해주세요' spellcheck='false'>";
		html += "					<button type='button' id='btn_mike'><span></span></button><button type='button' id='btn_work_req'><span></span></button>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		
		html += "		<div id='ai_folder_content' class='main_content'>";
		html += "			<div class='title_box'>";
		html += "				 <div class='title_wrap'>";
		html += "					<div id='title_template' class='content_title active'><span>Template</span></div>";
		html += "					<div id='title_mydata' class='content_title'><span>MY DATA</span></div>";
		html += "				</div>";
		html += "			</div>";
		html += "			<div id='folder_list'></div>";
		html += "		</div>";
		
		html += "</div>";
		
        
        debugger;
		
		//AI포탈 왼쪽, 중앙 컨텐츠 그린다.
		$("#kgpt_dis").empty();
		$("#kgpt_dis").append(html);

		
		//AI포탈 오른쪽 폴더목록 그린다(기본값: 템플릿 목록).
		gcom.ai_portal_folder_list_draw('template');
		
		//템플릿 폴더 탭버튼
		$("#title_template").on("click", function(){
			$(this).siblings().removeClass("active");
			$(this).addClass("active");
			gcom.ai_portal_folder_list_draw('template');
		});
		//MYDATA 폴더 탭버튼
		$("#title_mydata").on("click", function(){
			$(this).siblings().removeClass("active");
			$(this).addClass("active");
			gcom.ai_portal_folder_list_draw('mydata');
		});
		
		//AI포탈 폴더목록 show/hide 토글버튼
		$("#btn_ai_portal_sidebar_toggle").on("click", function(){
			$("#ai_portal_center_content").toggleClass("expand");
		});
	 }
 }