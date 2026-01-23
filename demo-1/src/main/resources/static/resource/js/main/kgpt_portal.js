/**
 * KGPT-Portal 설계관련 함수 
 * 값을 초기화 시키는 함수 : close_project_open
 * save_person_log, search_work
 * 기본 요청을 보내는 영역 : $("#search_work").off().on("keyup keypress focus input", function(e){
 * 공통으로 닫기를 처리할 부분이 있는 경우 : close_project_open 함수에 추가한다.
 */

function kgptportal(){
	this.plugin_domain = "https://kgpt.kmslab.com:5004/";	
 	this.plugin_domain_fast = "https://kgpt.kmslab.com:5005/";	
 	
	this.plugin_domain_fast_sllm = "https://kgpt.kmslab.com:5006/";	
	this.plugin_domain_fast_mcp = "https://kgpt.kmslab.com:5007/";	
	this.plugin_domain_fast_podcast = "https://kgpt.kmslab.com:5008/";
	this.kgpt_file_download_server = "https://one.kmslab.com/";
	this.current_code = "";
	this.isDev = false;
	this.mail_domain = "";
    this.approval_server = "";
	this.isSave = false;
	this.cur_roomkey = "";
	this.disdate = "";
	this.brief_data = "";
	this.is_complete = "F";
	this.stop_click = true;
	this.voice_ok = false;
	this.source = new Array();
	this.use_sllm = "F";
	this.cur_image_file = "";   //이미지 분석 히스토리를 활용해서 바로 이미지에 대한 질문을 하는 경우 사용한다.
	this.chat_log_save_event = ["it12", "", "it13", "it19", "it17", "it20", "normal_code", "deepresearch", "files", "hr2", "finance02", "multiagent"];  //로그를 남겨야 하는 경우
	this.meeting_title = ""; 
	this.meeting_dt = "";
	this.meeting_member = "";
	this.meeting_link = "";
	this.cur_project_code = "";
	this.front_project_count = 3;
	this.real_max_count = 10;
	
	this.isGenerating = false;
 	this.normal_chat_Dropzone; // Dropzone 인스턴스

    // Dropzone 자동 탐색 비활성화 (수동 제어를 위해 필수)
    Dropzone.autoDiscover = false;
    
    this.HORIZONTAL_GAP = 280;
    this.NODE_PADDING_Y = 40;
    this.treeData = "";
  
} 

 kgptportal.prototype ={
	 "init" : function(){
		 //개발서버인지 운영서버인지 판단한다.		
		 gptpt.mail_domain = "https://" + mailserver + "/" + maildbpath;	
		 gptpt.approval_server = "https://"+mailserver+"/work/2002.nsf";
		 gptpt.approval_form_server = "https://mail2.kmslab.com/work/2002.nsf";
		 gptpt.set_roomkey(gptpt.cur_roomkey, "cur_roomkey");
		 gptpt.voice_server = "https://kgpt.kmslab.com:5005/voice/";
		 if (location.href.indexOf("dev.kmslab.com") > -1){
			gptpt.isDev = true;
		//	gptpt.mail_domain = gptpt.mail_domain.replace("https://","http://");
		//	gptpt.approval_server = gptpt.approval_server.replace("https://","http://");
		
			gptpt.plugin_domain_fast = "https://kgpt.kmslab.com:5100/";
		 }		
		 gptpt.voice_end();		 
		 gptpt.kgpt_init();
		 if (gptpt.use_sllm == "T"){
			gptpt.plugin_domain_fast = gptpt.plugin_domain_fast_sllm;
		}	
		
		// --- 1. Dropzone 초기화 ---
        gptpt.initDropzone();	
	 },
	 
	 "initDropzone" : function(){
	 
	 	var dropzone = $("#search_work_wrap .search_work_box textarea");
	 	var dropzone_wrap = $("#search_work_wrap .search_work_box");
	 	dropzone.on("dragenter dragover", function () {
	        dropzone_wrap.css("border", "1px solid #4A90E2");   // 파란색으로 변경
	        dropzone_wrap.css("background-color", "#eef7ff"); // 약한 배경색
	        dropzone.css("background-color", "#eef7ff"); // 약한 배경색
	    });
	    
	    dropzone.on("dragleave drop", function () {
	        dropzone_wrap.css("border", "1px solid #E7E7E7");   // 파란색으로 변경
	        dropzone_wrap.css("background-color", "#fff"); // 약한 배경색
	        dropzone.css("background-color", "#fff"); // 약한 배경색
	    });

		// 커스텀 프리뷰 템플릿 (이전 디자인과 동일하게 구성)
            const previewTemplate = `
                <div class="dz-preview file-card-preview">
                    <div class="file-icon-box">
                        <i data-lucide="file" width="20" height="20"></i>
                    </div>
                    <div class="file-info">
                        <div class="file-name" data-dz-name></div>
                        <div class="file-size" data-dz-size></div>
                    </div>
                    <!-- Dropzone 기본 제거 기능 연결 (data-dz-remove) -->
                    <button class="dz-remove" data-dz-remove title="제거">
                        <i data-lucide="x" width="16" height="16"></i>
                    </button>
                    <div class="dz-progress">
                        <span class="dz-upload" data-dz-uploadprogress></span>
                    </div>
                </div>
            `;
           
           gptpt.normal_chat_Dropzone = new Dropzone("#search_work_wrap", {
                url: gptpt.plugin_domain_fast_podcast + "file_upload_normal", // Dropzone 필수 항목 (실제 전송 X)
                autoProcessQueue: true,  // 중요: 파일을 즉시 서버로 보내지 않음
                clickable: "#attach-btn", // 클립 버튼을 눌렀을 때만 파일창 열기 (박스 클릭은 텍스트 입력 위해 제외)
                previewsContainer: "#file-preview-zone",
                previewTemplate: previewTemplate,
                maxFilesize: 50, // MB
                acceptedFiles: "image/*,application/pdf,.txt,.pptx,.xlsx,.docx",
                
                init: function() {
                    // 파일 추가됨
                    this.on("addedfile", function(file) {
                    	if (!file.customId) {
                            file.customId = 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                        }

                        // [신규] DOM 요소(Preview Card)에 식별자(Key) 심기
                        // 이제 $(".file-card-preview[data-file-id='...']") 등으로 선택 가능
                        if (file.previewElement) {
                            file.previewElement.setAttribute('data-file-id', file.customId);
                        }
                        
                        var obj = $("#file-preview-zone [data-file-id='"+file.customId+"']");
                        $(obj).find(".dz-upload").css("background", "#3b82f6");
                                      	
                        // 아이콘 동적 변경 로직
                        gptpt.updateFileIcon(file);
                        
                        // 가짜 로딩바 애니메이션 (UI 피드백용)
                       	
                      	
                        let progress = 0;
						// interval ID를 파일 객체에 저장하여 나중에 제어 가능하게 함
                        file.simInterval = setInterval(() => {
                       		//file.status = gptpt.normal_chat_Dropzone.UPLOADING;
                            // 파일이 에러로 인해 삭제되었거나 상태가 변경된 경우 중단
                            if (!file.previewElement || file.status === Dropzone.ERROR) {
                                clearInterval(file.simInterval);
                                return;
                            }

                            progress += Math.random() * 5; // 속도 조절
                          //  console.log("progress : ", progress);
                            
                            // [수정됨] 90%까지만 진행하고 대기 (전송 버튼 클릭 시 100% 도달)
                            if (progress >= 80) {
                                progress = 80; 
                            }
                            
                            // Dropzone 진행바 업데이트
                           	 this.emit("uploadprogress", file, progress);
							$(obj).find(".dz-upload").css("width", progress + "%");							
                        }, 100);
                       

						gptpt.updateClearButtonState();
                     //   updateSendButtonState();
                     //   updateSmartActions();
                    });
                    
                    
                    this.on("sending", function(file, xhr, formData){
                    	formData.append("id", gptpt.cur_roomkey);
                    	formData.append("cid", file.customId);
                    	formData.append("ky", gap.userinfo.rinfo.ky);                   	
                    });
                    
                    this.on("success", function(file, response){                    
                     	if (file.status === this.SUCCESS) return;            
			            // 인터벌 종료
			            if (file.simInterval) clearInterval(file.simInterval);			
			            // 강제 100% 처리
			            this.emit("uploadprogress", file, 100);
			            file.status = this.SUCCESS;
			            this.emit("success", file);
			            this.emit("complete", file);  
			            
			            var obj = $("#file-preview-zone [data-file-id='"+file.customId+"']");
                        $(obj).find(".dz-upload").css("background", "green");                   
                    });

                    // 파일 제거됨
                    this.on("removedfile", function(file) {
                      //  updateSendButtonState();
                       // updateSmartActions();
                       gptpt.delete_normal_file(file.customId);
                       gptpt.updateClearButtonState();
                    });

                    // 에러 발생 시
                    this.on("error", function(file, errorMessage) {
                    	clearInterval(file.simInterval);
                    	
                        // 에러 메시지 포맷팅
                        let msg = typeof errorMessage === 'string' ? errorMessage : "업로드할 수 없는 파일입니다.";
                        
                        // UI에서 즉시 제거
                        this.removeFile(file);
                        
                        // 사용자에게 알림
                        // (setTimeout을 사용하여 UI 제거 처리가 끝난 후 알림이 뜨도록 함)
                        setTimeout(() => {
                            mobiscroll.toast({message:"⚠️ 파일 업로드 오류 '" + file.name + "' " +  msg, color:'danger'});
							return false;
                        }, 10);
                    });
                    
                }
            }); 
            
	 },
	 
	 "delete_normal_file" : function(id){
	 	//일반 채팅에 참고하는 파일을 업로드 하고 나서 삭제하는 경우
	 	var url = gptpt.plugin_domain_fast_podcast + "delete_normal_file";
	 	var postData = JSON.stringify({
	 		"id" : id
	 	});
	 	$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){					
				if (res.result == "OK"){	
					
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});
	 	
	 },
	 
	 "updateFileIcon" : function(file){
		// 방금 추가된 프리뷰 요소 찾기
        const previewEl = file.previewElement;
        if (!previewEl) return;

        const iconContainer = previewEl.querySelector('.file-icon-box i');
        const ext = file.name.split('.').pop().toLowerCase();
        let iconName = 'file';

        if (['ppt', 'pptx'].includes(ext)) iconName = 'presentation';
        else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) iconName = 'image';
        else if (['pdf'].includes(ext)) iconName = 'file-text';
        else if (['xls', 'xlsx', 'csv'].includes(ext)) iconName = 'table';
        
        // data-lucide 속성 변경 후 리렌더링
        iconContainer.setAttribute('data-lucide', iconName);
        lucide.createIcons({ root: previewEl });
	 },
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 "init_mobile" : function(){
		 //개발서버인지 운영서버인지 판단한다.
		 gptpt.mail_domain = "https://" + mailserver + "/" + maildbpath;	
		 gptpt.approval_server = "https://"+mailserver+"/work/2002.nsf";
		 gptpt.approval_form_server = "https://mail2.kmslab.com/work/2002.nsf";
		 gptpt.set_roomkey(gptpt.cur_roomkey, "cur_roomkey");
		 gptpt.voice_server = "https://kgpt.kmslab.com:5005/voice/";
		 if (location.href.indexOf("dev.kmslab.com") > -1){
			gptpt.isDev = true;
		//	gptpt.mail_domain = gptpt.mail_domain.replace("https://","http://");
		//	gptpt.approval_server = gptpt.approval_server.replace("https://","http://");
		 } 
	 },
	 
	 "check_brief" : function(){
		//오늘 한번이라도 띄워 졌다면 중지한다.		
		var brief_key = gap.userinfo.rinfo.ky + "_bref_" + gap.search_today_only();
		var today_check = localStorage.getItem(brief_key)
		if (today_check && today_check == "T"){			
		}else{
			gptpt.brief_init("start");
			localStorage.setItem(brief_key, "T")
		}
		gptpt.brief_key_delete(gap.search_today_only());		
	 },
	 
	 "brief_key_delete" : function(val){
		let keysToDelete = [];
		for (let i = 0; i < localStorage.length; i++) {
		    let key = localStorage.key(i);		    
		    if (key.includes('bref')) {
		        let value = localStorage.getItem(key);
		        if (!key.includes(val)) {
		            keysToDelete.push(key);
		        }
		    }
		}
		// 삭제 실행
		keysToDelete.forEach(key => {
		    localStorage.removeItem(key);
		    console.log(`삭제됨: ${key}`);
		});
	 },	 
	 
	"brief_show" : function(opt){
		if (gptpt.brief_auto_show){
			var brief_key = gap.userinfo.rinfo.ky + "_bref_" + gap.search_today_only();	
			//다른 날짜에 등록된 로컬스토리지 정보를 삭제한다.
			gptpt.brief_process(brief_key);	
		}		
	},
	
	"brief_process" : function(key){
		$("#btn_briefing_view").addClass("active");		
		//메인 페이지를 제거한다.
		gptpt.first_msg_remove();		
		var blist = gptpt.brief_list;
		if (!blist){
			return false;
		}	
		for (var i = 0; i < blist.length; i++){				
			if (i == 0){
				var txt = blist[0].split("-spl-")[0];
				var ty = blist[0].split("-spl-")[1];
				gptpt.call_brief(txt, ty);							
			}else if (i == 1){
				setTimeout(function(){
					var txt = blist[1].split("-spl-")[0];
					var ty = blist[1].split("-spl-")[1];
					gptpt.call_brief(txt, ty);	
				}, 2000);
			}else if (i == 2){
				setTimeout(function(){
					var txt = blist[2].split("-spl-")[0];
					var ty = blist[2].split("-spl-")[1];
					gptpt.call_brief(txt, ty);						
				}, 3000);
			}							
		}	
		localStorage.setItem(key, "T");		
	},
	
	"call_brief" : function(txt, ty){
		if (ty == "etc"){
			gptapps.summary_news(txt);
		}else{
			gptpt.send_ai_request(txt);
			gap.hide_loading();	
		}
	},
	
	"brief_init" : function(opt){				
		var surl = gap.channelserver + "/api/kgpt/ai_brief_data.km";
		var postData = JSON.stringify({
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
					var limit = gptpt.temp_count_limit;
					var list = res.data.data.data.split("-=spl=-");
					gptpt.brief_list = list;
					var checked = res.data.data.checked;
					if (opt == "click"){
						checked = true;
					}
					gptpt.brief_auto_show = checked;					
					//개인의 brief정보를 가져와서 설정해준다.	
					if (checked){
						if (opt != "init"){
							gap.show_loading("Make Today's' Breiefing......");
						}
					}					
					if (opt == "init" || opt == "click"){						
						if (checked){
							$("#briefing_auto").prop("checked", true);
						}
						for (var i = 0 ; i < list.length; i++){
							var item = list[i].split("-spl-");
							var category = item[1];
							var text = item[0];
							
							var category_ko = gptpt.code_change_text(category);
							
							//템플릿 html
							var temp = '';
							var key = gptpt.generate_uniqueKey();
							temp += "<div id='" + key + "' class='work_temp_li " + category + " active'>";
				                temp += "<div class='temp_title_wrap'>";
									temp += "<div class='drag_guide_img'></div>";
									temp += "<div class='temp_title_box'>";
									temp += "<div class='temp_category_wrap'>";
											temp += "<div class='temp_category_img'></div>";
											temp += "<div class='temp_category_name'>" + category_ko + "</div>";
										temp += "</div>";
										temp += "<div class='arrow_right'></div>";									
										temp += "<div class='temp_title_txt' data-code='"+category+"'>" + text + "</div>";								
									temp += "</div>";
				                temp += "</div>";
								temp += "<button type='button' class='btn_del_temp'></button>";
				            temp += "</div>";							
							temp = $(temp);							
							//현재 템플릿 개수
							var count = $("#ai_work_temp_ul .work_temp_li").length + 1;						
							$("#temp_current_count").text(count);
							$("#guide_work_temp").hide();
							$("#ai_work_temp_ul").append(temp).packery( 'appended', temp );							
						}						
						//추가한 템플릿 draggable 활성화
						/*var drag_item = temp.draggable({
							containment: "#ai_work_temp_ul"
						});*/
						
						/** 드래그 안되는 오류 수정 20250403 박대민 **/
						var drag_item = $("#ai_work_temp_ul .work_temp_li").draggable({
							containment: "#ai_work_temp_ul"
						});
						
						$("#ai_work_temp_ul").packery( 'bindUIDraggableEvents', drag_item ).packery();
						
						$("#ai_work_temp_ul").on("layoutComplete", function(){
							//템플릿 개수가 최대 개수에 도달하면 드래그 비활성화
							if($("#ai_work_temp_ul .work_temp_li").filter('.ui-draggable').length >= limit) {
								$("#ai_briefing_set_box .depth_txt").not('.ui-draggable-disabled').draggable('disable');
							}
						});
						
						//브리핑 목록이 최대 개수에 도달했을 때
						if($("#ai_work_temp_ul .work_temp_li").length >= limit) {
							$("#ai_briefing_set_box .depth_txt").addClass('disable');
							//console.log(">>>>>>>>>>>브리핑이 최대 개수에 도달했습니다.");
						}
						
						//템플릿 지우기 버튼
						$(".btn_del_temp").on("click", function(){
							//지우려는 템플릿목록
							var li = $(this).closest(".work_temp_li");
							
							var count = $("#ai_work_temp_ul .work_temp_li").length - 1;
							$("#temp_current_count").text(count);
							
							//템플릿이 0개일 때
							if(count === 0){
								$("#guide_work_temp").show();
							}							
							$("#ai_work_temp_ul").packery( 'remove', li ).packery('layout');
							
							//브리핑이 최대 개수 미만이 되면 다시 활성화							
							if($("#ai_work_temp_ul .work_temp_li").filter('.ui-draggable').length <= limit) {
								$("#ai_briefing_set_box .depth_txt").draggable('enable').removeClass('disable');
								$("#temp_count_box").removeClass("full");
								//console.log(">>>>>>>>>>>브리핑을 다시 추가할 수 있습니다..");
							}							
						});
						
						if (opt == "click"){
							gptpt.brief_show("T");
						}
					}else if (opt == "start"){
						gptpt.brief_show("T");						
					}
					
				}
			},
			error : function(e){				
			}
		});
	},
	
	 
	 "set_roomkey" : function(roomkey, type){
		if (roomkey != ""){
			gptpt.delete_roomkey(roomkey);
		}
		gptpt[type] = gap.userinfo.rinfo.emp + "_" + new Date().getTime();	
	 },
	 
	 "delete_roomkey" : function(roomkey){
	 	var url = gptpt.plugin_domain_fast + "base/deleteRoomkey";
		var data = JSON.stringify({
			"roomkey" : roomkey
		})
		$.ajax({
			crossDomain : true,
			type : "POST",
			data : data,
			url : url,
			dataType: "json",
			beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
			success : function(res){				
			},
			error : function(e){
				gap.error_alert();
			}
		})
	 },
	 
	 "kgpt_init" : function(){
		var html = '';
		html += "<div id='ai_portal_box'>";		
		html += "	<div id='ai_portal_left_content' class='main_content'>";		
		html += "		<div class='create_menu_box'>";
		html += "			<button type='button' class='btn_create_menu'><span class='btn_img'></span><span>"+gap.lang.rq3+"</span></button>";
		html += "			<button type='button' id='btn_open_ai_notebook' class='btn_open_ai_notebook'><span class='btn_img'></span><span class='btn_txt'>AI Note</span></button>";		
		html += "		</div>";
		
		html += "		<div id='kgpt_work_container' class='work_menu_box'>"
		/////// 고정업무 /////
		/*
		html += "			<div class='work_menu fixed_work_menu'>";
		html += "				<h4 class='work_title'>"+gap.lang.fix_app+"</h4>";
		html += "				<div id='fixed_menu_wrap' class='menu_wrap'>";
		html += "				</div>";
		html += "			</div>";
		*/
		/////// 프로젝트 /////
		var cid = gap.userinfo.rinfo.ky;

		html += "			<div id='kgpt_project_menu' class='work_menu project_work_menu'>";
		html += "				<div class='work_title_wrap'>";
		html += "					<h4 class='work_title' style='margin: 0;'>"+gap.lang.va178+"</h4>";
		html += "					<button type='button' id='btn_create_project' class='create_btn'></button>";
		html += "				</div>";
		html += "				<div id='project_work_menu' class='menu_wrap'>";
		html += "				</div>";
		html += "			</div>";
		
		
		/////// AI Builder /////
		html += "			<div id='kgpt_builder_menu' class='work_menu builder_work_menu'>";
		html += "				<div class='work_title_wrap'>";
		html += "					<h4 class='work_title' style='margin: 0;'>AI Builder</h4>";
		html += "				</div>";
		html += "				<div id='builder_work_menu' class='menu_wrap builder'>";
		
		html += "					<div class='menu_li builder'>";
		html += "						<div class='title_wrap'>";
		html += "							<span class='folder_ico_agent'></span>";
		html += "							<span class='menu_title' title='Report' data-code='agent'>Agents</span>";
		html += "						</div>";
		html += "					</div>";
		
		html += "					<div class='menu_li builder'>";
		html += "						<div class='title_wrap'>";
		html += "							<span class='folder_ico_automation'></span>";
		html += "							<span class='menu_title' title='Report' data-code='automation'>Automation</span>";
		html += "						</div>";
		html += "					</div>";
		
		html += "					<div class='menu_li builder'>";
		html += "						<div class='title_wrap'>";
		html += "							<span class='folder_ico_report'></span>";
		html += "							<span class='menu_title' title='Report' data-code='report'>Report</span>";
		html += "						</div>";
		html += "					</div>";
		
		html += "				</div>";
		html += "			</div>";


		
		/////// 요청된 업무 /////
		html += "			<div id='kgpt_req_work_menu' class='work_menu req_work_menu'>";
		html += "				<h4 class='work_title'>"+gap.lang.req_app+"</h4>";
		html += "				<div id='req_work_menu' class='menu_wrap'>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";			
		html += "	<div id='ai_portal_center_content' class='main_content'>";
		html += "		<button type='button' id='btn_ai_portal_sidebar_toggle'><span class='arrow_img'></span></button>";			
		html += "		<div class='ai_briefing_btn_wrap'>";
		html += "			<button type='button' id='btn_briefing_view' class='briefing_btn btn_briefing_view'><span class='btn_img'></span><span>" + gap.lang.va67 + "</span></button>";
		html += "			<button type='button' id='btn_briefing_setting' class='briefing_btn btn_briefing_setting'><span class='btn_img'></span><span>" + gap.lang.va68 + "</span></button>";
		html += "			<button type='button' id='btn_share_chat_history' class='button_share_chat_history' style='display:none'>";
		html += "				<span class='btn_img'></span>";
		html += "				<span>"+gap.lang.share+"</span>";
		html += "			</button>";
		html += "		</div>";
		html += "		<div class='ai_result_area' id='ai_first_msg'>";
		html += "			<div class='logo_wrap' style='align-items:baseline'><span class='logo_txt'>K-GPT</span><span class='logo_txt blue'>AI Communication</span></div>";
	//	html += "			<div style='font-size:20px'><span class=''><span style='color:#316094'>A</span>rtificial <span style='color:#316094'>I</span>ntelligence Communication</span></div>";
		html += "			<div class='template_wrap'>";		
		html += "				<div class='template_box mail'>";
		html += "					<div class='temp_inner'>";
		html += "						<div class='temp_name_wrap'>";
		html += "							<div class='temp_img'></div>";
		if (gap.curLang == "ko"){
			html += "							<div class='temp_name' data-code='mail4'>미확인 메일 요약해줘</div>";
		}else{
			html += "							<div class='temp_name' data-code='mail4'>Summarize unread emails</div>";
		}		
		html += "						</div>";
		html += "						<button type='button' class='btn_temp'></button>";
		html += "					</div>";
		html += "				</div>";
		html += "				<div class='template_box calendar'>";
		html += "					<div class='temp_inner'>";
		html += "						<div class='temp_name_wrap'>";
		html += "							<div class='temp_img'></div>";
		if (gap.curLang == "ko"){
			html += "							<div class='temp_name' data-code='it8'>이번주 일정 알려줘</div>";
		}else{
			html += "							<div class='temp_name' data-code='it8'>Tell me this weeks's schedule.</div>";
		}		
		html += "						</div>";
		html += "						<button type='button' class='btn_temp'></button>";
		html += "					</div>";
		html += "				</div>";
		html += "				<div class='template_box approval'>";
		html += "					<div class='temp_inner'>";
		html += "						<div class='temp_name_wrap'>";
		html += "							<div class='temp_img'></div>";
		if (gap.curLang == "ko"){
			html += "							<div class='temp_name' data-code='it4'>연차 휴가 등록해줘</div>";
		}else{
			html += "							<div class='temp_name' data-code='it4'>Register my annual leave.</div>";
		}		
		html += "						</div>";
		html += "						<button type='button' class='btn_temp'></button>";
		html += "					</div>";
		html += "				</div>";
		html += "				<div class='template_box meetingroom'>";
		html += "					<div class='temp_inner'>";
		html += "						<div class='temp_name_wrap'>";
		html += "							<div class='temp_img'></div>";
		if (gap.curLang == "ko"){
			html += "							<div class='temp_name' data-code='it7'>회의실 예약 해줘</div>";
		}else{
			html += "							<div class='temp_name' data-code='it7'>Book a meeting room.</div>";
		}		
		html += "						</div>";
		html += "						<button type='button' class='btn_temp'></button>";
		html += "					</div>";
		html += "				</div>";
		html += "				<div class='template_box webresearch'>";
		html += "					<div class='temp_inner'>";
		html += "						<div class='temp_name_wrap'>";
		html += "							<div class='temp_img'></div>";
		if (gap.curLang == "ko"){
			html += "							<div class='temp_name' data-code='it12'>인공지능 퀵 리서치</div>";
		}else{
			html += "							<div class='temp_name' data-code='it12'>AI Web Reserch</div>";
		}
		html += "						</div>";
		html += "						<button type='button' class='btn_temp'></button>";
		html += "					</div>";
		html += "				</div>";
		html += "				<div class='template_box hr'>";
		html += "					<div class='temp_inner'>";
		html += "						<div class='temp_name_wrap'>";
		html += "							<div class='temp_img'></div>";
		if (gap.curLang == "ko"){
			html += "							<div class='temp_name' data-code='it11'>인사평가 할래</div>";
		}else{
			html += "							<div class='temp_name' data-code='it11'>performance evaluation.</div>";
		}		
		html += "						</div>";
		html += "						<button type='button' class='btn_temp'></button>";
		html += "					</div>";
		html += "				</div>";
		/*
				html += "				<div class='template_box hr'>";
		html += "					<div class='temp_inner'>";
		html += "						<div class='temp_name_wrap'>";
		html += "							<div class='temp_img'></div>";
		if (gap.curLang == "ko"){
			html += "							<div class='temp_name'>마케팅 자료 생성</div>";
		}else{
			html += "							<div class='temp_name'>Make marketing data</div>";
		}		
		html += "						</div>";
		html += "						<button type='button' class='btn_temp'></button>";
		html += "					</div>";
		html += "				</div>";
				html += "				<div class='template_box hr'>";
		html += "					<div class='temp_inner'>";
		html += "						<div class='temp_name_wrap'>";
		html += "							<div class='temp_img'></div>";
		if (gap.curLang == "ko"){
			html += "							<div class='temp_name'>내부 자료 질의응답</div>";
		}else{
			html += "							<div class='temp_name'>Internal data Q&A</div>";
		}		
		html += "						</div>";
		html += "						<button type='button' class='btn_temp'></button>";
		html += "					</div>";
		html += "				</div>";
		*/
		html += "			</div>";
		html += "		</div>";		
		html += "		<div style='display:none; height:calc(100% - 172px);' id='ai_result_dis_top'>";
		html += "			<div class='ai_result_dis' id='ai_result_dis' style='width:100%; height:100%; padding-right:10px'></div>";
		html += "		</div>";		
		html += "		<div id='search_work_wrap' class='search_work_wrap'>";
		html += "			<div class='search_work_box'>";
		
		html += "			<div id='preview-header'>";
		html += "				<button id='clear-all-btn' type='button' title='모든 파일 제거'>";
		html += "	               <i data-lucide='trash-2' width='14' height='14'></i>";
		html += "		               <span>전체 삭제</span>";
		html += "		        </button>";
		html += "           </div>";
		
		
		html += "				<div id='file-preview-zone'></div>";
		
		html += "				<div class='input-controls' style='width:100%;display:flex;gap:10px'>";
		
		
		html += "					<button id='attach-btn' title='File Upload'>";
		html += "                        <i data-lucide='paperclip' width='18' height='18'></i>";
		html += "                    </button>";
		html += "                    <input type='file' id='file-input' multiple style='display: none;'>";
		

		
		
		//html += "				<textarea  oninput='gap.auto_height_check_popup(this)' style='height:40px' name='searchWork' id='search_work' class='input_search_work' autocomplete='off' placeholder='"+gap.lang.va23+"' spellcheck='false'></textarea>";
		html += "					<textarea style='height:20px; width:90%' name='searchWork' id='search_work' class='input_search_work' autocomplete='off' placeholder='"+gap.lang.va23+"' spellcheck='false'></textarea>";
		
		html += "				</div>";
		
		html += "				<div class='btn_box_wrap'>";
		html += "					<div class='search_detail_btn_box'>";
		/*
		html += "						<button type='button' id='btn_web_research' class='btn_web_research'>";
		html +=	"							<span class='btn_ico'></span>";
		html += "							<span id='select_engine_wrap' class='select_engine_wrap'>";
		html += "								<span id='select_engine_name' class='btn_txt'></span>";
		html += "								<span id='btn_deselect_engine' class='btn_deselect_engine'></span>";
		html += "							</span>";
		html +=	"						</button>";
		*/
		
		//var cid = gap.userinfo.rinfo.ky;
/*
		html += "						<button id='btn_toggle_deepthink' class='btn_deepthink'>";
		html += "							<span class='btn_inner'>";
		html += "								<span class='btn_ico'></span>";
		html += "								<span class='btn_name'>"+gap.lang.va294+"</span>";
		html += "							</span>";
		html += "						</button>";
*/		
		
		
		html += "						<button id='btn_toggle_deepthink' class='btn_deepresearch_option_select'>";
		html += "							<span class='btn_inner'>";
		html += "								<span class='btn_ico'></span>";
		html += "								<span class='btn_name'>"+gap.lang.va294+"</span>";
		html += "							</span>";
		html += "						</button>";
		html += "						<div id='btn_deepthink_option_drowndown' class='drowdown_btn_box'>";
		html += "							<div class='inner'>";
		html += "								<button type='button' id='btn_cancel_deepthink_option_select' class='btn_search_cancel_option_select'>";
		html += "									<span class='btn_inner'>";
		html += "										<span class='btn_ico middle'></span>";
		html += "										<span class='btn_name'>Medium</span>";
		html += "									</span>";
		html += "								</button>";
		html += "								<button type='button' id='btn_open_dropdown_select_middle_option' class='select_middle_option'>";
		html += "									<span class='btn_inner'>";
		html += "										<span class='btn_ico'></span>";
		html += "									</span>";
		html += "								</button>";
		html += "							</div>";
		html += "						</div>";
		
		
		html += "						<button id='btn_select_search_option' class='btn_search_option_select'>";
		html += "							<span class='btn_inner'>";
		html += "								<span class='btn_ico'></span>";
		html += "								<span class='btn_name'>"+gap.lang.va295+"</span>";
		html += "							</span>";
		html += "						</button>";
		html += "						<div id='btn_search_option_drowndown' class='drowdown_btn_box'>";
		html += "							<div class='inner'>";
		html += "								<button type='button' id='btn_cancel_search_option_select' class='btn_search_cancel_option_select'>";
		html += "									<span class='btn_inner'>";
		html += "										<span class='btn_ico websearch'></span>";
		html += "										<span class='btn_name'>"+gap.lang.va287+"</span>";
		html += "									</span>";
		html += "								</button>";
		html += "								<button type='button' id='btn_open_dropdown_select_websearch_option' class='select_websearch_option'>";
		html += "									<span class='btn_inner'>";
		html += "										<span class='btn_ico'></span>";
		html += "									</span>";
		html += "								</button>";
		html += "							</div>";
		html += "						</div>";
		
		
		//if (gap.userinfo.rinfo.emp == "KM0035"){
			html += "						<button id='btn_select_multiagent_option' class='btn_multiagent_option_select'>";
			html += "							<span class='btn_inner'>";
			html += "								<span class='btn_ico'></span>";
			html += "								<span class='btn_name'>"+gap.lang.va288+"</span>";
			html += "							</span>";
			html += "						</button>";
			html += "						<div id='btn_multiagent_option_drowndown' class='drowdown_btn_box'>";
			html += "							<div class='inner'>";
			html += "								<button type='button' id='btn_cancel_multiagent_option_select' class='btn_multiagent_cancel_option_select'>";
			html += "									<span class='btn_inner'>";
			html += "										<span class='btn_ico multiagent'></span>";
			html += "										<span class='btn_name'>"+gap.lang.va288+"</span>";
			html += "									</span>";
			html += "								</button>";
			html += "								<button type='button' id='btn_open_dropdown_select_multiagent_option' class='select_multiagent_option'>";
			html += "									<span class='btn_inner'>";
			html += "										<span class='btn_ico'></span>";
			html += "									</span>";
			html += "								</button>";
			html += "							</div>";
			html += "						</div>";
		//}
			

		html += "					</div>";
		html += "					<div class='req_btn_box'>";
		html += "						<button type='button' id='btn_mike' class=''><span></span></button><button type='button' id='btn_work_req'><span></span></button>";
		html += "					</div>";		
		html += "				</div>";
		
		html += "			</div>";		
		
		html += "<div id='web_research_popup' class='web_research_popup' style='display:none'>";
		html += "	<div class='inner'>";
		html += "		<div class='select_engine_box'>";
		html += "			<button type='button' class='btn_search_engine kgpt active' data-id='Google'>";
		html += "				<span class='btn_inner'>";
		html += "					<span class='btn_ico'></span><span class='btn_txt'>Google</span>";
		html += "				</span>";
		html += "			</button>";
		html += "			<button type='button' class='btn_search_engine perplextiy' data-id='Perplexity'>";
		html += "				<span class='btn_inner'>";
		html += "					<span class='btn_ico'></span><span class='btn_txt'>Perplextiy</span>";
		html += "				</span>";
		html += "			</button>";
		html += "			<button type='button' class='btn_search_engine naver' data-id='Naver'>";
		html += "				<span class='btn_inner'>";
		html += "					<span class='btn_ico'></span><span class='btn_txt'>Naver</span>";
		html += "				</span>";
		html += "			</button>";
		/*
		html += "			<button type='button' class='btn_search_engine bing' data-id='Bing'>";
		html += "				<span class='btn_inner'>";
		html += "					<span class='btn_ico'></span><span class='btn_txt'>Bing</span>";
		html += "				</span>";
		html += "			</button>";		
		*/
		html += "		</div>";
		html += "	</div>";
		html +=	"</div>";	
		
		html += "		</div>";
		html += "	</div>";		
		html += "	<div id='ai_folder_content' class='main_content'>";
		html += "		<div class='title_box'>";
		html += "				<div class='title_wrap'>";
		html += "				<div id='title_template' class='content_title active'><span>Template</span></div>";
		html += "				<div id='title_mydata' class='content_title'><span>MY DATA</span></div>";
		html += "			</div>";
		html += "		</div>";
		html += "		<div id='folder_list'></div>";
		html += "	</div>";		
		html += "</div>";    
		
		//AI포탈 왼쪽, 중앙 컨텐츠 그린다.
		$("#kgpt_dis").empty();
		$("#kgpt_dis").append(html);				
		$("#kgpt_work_container").hide();
		
		// 아이콘 초기화
        lucide.createIcons();
        
       
        
        $('#clear-all-btn').off().on('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Dropzone 클릭 트리거 방지
                      
            if (gptpt.normal_chat_Dropzone) {
                gptpt.normal_chat_Dropzone.removeAllFiles(true); // true: 업로드 중인 파일도 취소
            }
        });
               

		$("#alarm_kgpt_top").css("background-color", "white");
		$("#ai_result_dis_top").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable: true
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
		
		//프로젝트 리스트 가져와서 표시하기
		gptpt.project_list_draw();
				
		//AI포탈 오른쪽 폴더목록 그린다(기본값: 템플릿 목록).
		gptpt.ai_portal_folder_list_draw('template');
			
		//브리핑 체크
		gptpt.check_brief();
		
		
		/// K-GPT 질문 입력창 좌측 버튼들 이벤트
		gptpt.event_kgpt_search_detail_btn_box();
		
		//템플릿 폴더 탭버튼
		$("#title_template").off().on("click", function(){
			$(this).siblings().removeClass("active");
			$(this).addClass("active");
			gptpt.ai_portal_folder_list_draw('template');
		});
		//MYDATA 폴더 탭버튼
		$("#title_mydata").off().on("click", function(){
			$(this).siblings().removeClass("active");
			$(this).addClass("active");
			gptpt.ai_portal_folder_list_draw('mydata');
		});
		
		//AI포탈 폴더목록 show/hide 토글버튼
		$("#btn_ai_portal_sidebar_toggle").on("click", function(){
			$("#ai_portal_center_content").toggleClass("expand");
		});
		
		$("#btn_work_req").off().on("click", function(e){		
			var cls = $(e.currentTarget).attr("class");
			if (cls == "stop"){
				//스트림을 중지 시킨다.
				gptpt.chatgpt_all_close();
				return false;
			}			
			var msg = $("#search_work").val();
			if (msg == ""){
				mobiscroll.toast({message:gap.lang.req_msg, color:'danger'});
				return false;
			}			
			var msg = $("#search_work").val();
			//딥리서치일 경우 별도 처리한다.			
			if ($("#btn_deepthink_option_drowndown").css("display") != "none") {
				gptapps.deepresearch(msg);
			}else{
				//gptpt.send_ai_request(msg);
				var checked_list = $("#ai_mydata_dis").find("input:checked");
				if (checked_list.length > 0){
					gptpt.send_ai_request_mydata(msg, checked_list);
				}else{
					gptpt.send_ai_request(msg);
				}
			}
			$("#btn_work_req").removeClass("active");
			$(e.currentTarget).addClass("stop");				
		});
		
		$(".temp_inner").off().on("click", function(e){
			gptpt.current_code = "";
			var msg = $(e.currentTarget).find(".temp_name").text();
			var code = $(e.currentTarget).find(".temp_name").data("code");
			gptpt.send_ai_request(msg, code);
		});		
		
		//브리핑버튼
		$("#btn_briefing_view").on("click", function(){			
			gptapps.dis_id = "ai_result_dis";	
			gptapps.dis_scroll = "ai_result_dis_top";
			var cls = $(this).attr("class");
			if (cls.indexOf("active") > -1){
				$(this).removeClass("active");
			}else{
				gptpt.current_code = "";
				$(this).addClass("active");
				
				var brief_key = gap.userinfo.rinfo.ky + "_bref_" + gap.search_today_only();
				localStorage.removeItem(brief_key);
						
				//gptpt.brief_process(brief_key);	
				gptpt.brief_init("click");
				
				//gptpt.brief_show("T")
			}			
		});
		
		$("#btn_briefing_setting").on("click", function(){
			$("#btn_briefing_view").removeClass("active");
			gptpt.briefing_setting_layer_draw();
		});
		
		//// 공유하기 버튼 추가 2025-04-23
		$("#btn_share_chat_history").off().on("click", function(e){
			//var url = $(e.currentTarget).data("url"); <= 이렇게 하면 처음 지정한 값만 가져와서 아래 형태로 변경한다.
			var url = $(e.currentTarget).attr("data-url");
			gptpt.draw_layer_share_chat_history(url);
		});
		
		//음성 버튼을 클릭한 경우			
		$("#btn_mike").off().on("click", function(e){	
			gptpt.voice_ok = true;
			gptpt.recognition = new webkitSpeechRecognition(); //클릭할 때 초기화 하지 않으면	클릭 한만큼 응답이 추가되어 여기서 초기화 해야 한다.
			
			var rr = $(this).attr("class");
			if (rr == "going"){
				//음성을 제거한다.
			//	console.log("제거한다....")
				$("#btn_mike").removeClass("going");
				if (gptpt.recognition){
					gptpt.stop_click = true;
					gptpt.recognition.stop();
					return;
				}				
			}
			$(this).toggleClass("going");			
			gptpt.recognition.lang = window.navigator.language;
			gptpt.recognition.interimResults = false;
			gptpt.recognition.continuous = true;			
			gptpt.recognition.start();			
			gptpt.recognition.addEventListener('result', (event) =>{
			//	console.log("gptpt.voice_ok : " + gptpt.voice_ok)
				const result = event.results[event.results.length - 1][0].transcript;	
				
				gptpt.stop_click = false;
					
		//		console.log(result.trim())
				if (result.trim() == "마이크 꺼"){
					gptpt.stop_click=true;
					gptpt.recognition.stop(); 
					gptpt.stop_click=true;
					return false;
				}else if (gptpt.isValueInArray2(result.trim())){
		//			console.log("새글 작성합니다.");
					$("#ai_portal_left_content .btn_create_menu").click();
				}else if (gptpt.isValueInArray(result.trim())){
		//			console.log("보이스 실행하기")
					gptpt.voice_ok = true;
					if (gptapps.dis_id == "alarm_kgpt_sub"){
						$("#alarm_kgpt_mic").removeClass("going");
						$("#alarm_kgpt_mic").addClass("going");
					}else{
						$("#btn_mike").removeClass("going");
						$("#btn_mike").addClass("going");
					}

				}else{
					if (gptpt.voice_ok || gptpt.current_code != ""){
					//	$("#search_work").val(result.trim());
					//	$("#btn_work_req").click();
						var msg = result.trim();
						var checked_list = $("#ai_mydata_dis").find("input:checked");
						if (checked_list.length > 0){
							gptpt.send_ai_request_mydata(msg, checked_list);
						}else{
							gptpt.send_ai_request(msg);
						}			
						//gptpt.send_ai_request(result.trim());
					}else{
						mobiscroll.toast({message:"'HI GPT'를 불러주세요", color:'danger'});
						return false;
					}

				}				
			});		
			
			gptpt.recognition.addEventListener("end", () => {				
				if (!gptpt.voice_ok){
			//		$("#btn_mike").removeClass("going");
				}			  	
			  	console.log("Speech recognition service disconnected");
			  //	console.log("stop_click : ", stop_click);
				  gptpt.voice_ok = false;
				  if (!gptpt.stop_click){
					//	setTimeout(function(){
					//		gptpt.voice_ok = true;
					//		gptpt.stop_click = false;
					//		gptpt.recognition.start();
					//	}, 3000)
				 }else{
					 if (gptpt.recognition){
						gptpt.recognition.stop();
					}
					
				}		
				if (gptpt.recognition){
						gptpt.recognition.stop();
					}
			//  gptpt.stop_click = false;
			});
		});
		
		//새글 작성하기
		$("#ai_portal_left_content .btn_create_menu").off().on("click", function(e){
			gptpt.dropzone_file_delete();
			gptpt.close_project_open();	
			gptpt.cur_project_code = "";
			//기존 스트림을 모두 정지 시킨다.
			gptpt.chatgpt_all_close();
			gptpt.close_project_open2();
			gptpt.show_attach_btn();	
			
			gptpt.set_roomkey(gptpt.cur_roomkey, "cur_roomkey");
			
			var cls = $("#btn_open_ai_notebook").attr("class");
			if (cls.indexOf("active") > -1){
				gptpt.ai_notebook_hide();
			}
			
			$(".menu_li").removeClass("active");
			$("#ai_first_msg").show();
			$("#"+gptapps.dis_id).empty();
			$("#search_work").val("");
			$("#ai_result_dis_top").hide();
			gptapps.dis_id = "ai_result_dis";	
			gptapps.dis_scroll = "ai_result_dis_top";
			gptpt.current_code = "";	
			gptpt.cur_project_code = "";
			$("#btn_share_chat_history").hide() //공유 버튼 숨긴다.
			
			//mydata의 체크된 값을 모두 제거한다.
			$('#ai_mydata_dis input[type="checkbox"]').prop('checked', false);	
			$("#btn_briefing_view").removeClass("active");
			gptpt.voice_end();
		});
		
		/////// AI Notebook 진입버튼 ////////////
		$("#btn_open_ai_notebook").on("click", function(){	
			gptpt.close_project_open();
			gptpt.cur_project_code = "";
			gptpt.close_project_open2();
			gptpt.current_code = "";	
			gptpt.cur_project_code = "";
		////////////////// ai 노트북 레이어를 그린다. ////////////		
			$("#btn_open_ai_notebook").addClass("active");
			$(".mask_top").show();
			$(".mask_bot").show();
			$("#ai_notebook_layer").show();
			$("#ai_portal_left_content").addClass("ai_note");
			gnote.ai_notebook_layer_draw();
		});
		
		
		/******* 웹 리서치 버튼 ******/
		$("#btn_web_research").on("mouseenter", function(e){			
			var name = e.currentTarget.className.replace("btn_", ""); // 버튼의 이름
			if(name === "web_research") {
				name_ko = gap.lang.va74;
			}		
			var html = "<div id='btn_bubble_box'>" + name_ko + "</div>";			
			$(this).append(html);			
		});
		
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
				
				///웹 리서치 팝업창이 웹리서치 버튼을 가리지 않도록 위치 조정
				if( parseInt($("#search_work_wrap").css("height")) > 113){
					//$("#web_research_popup").css("bottom", "63%");
				} else {
					$("#web_research_popup").css("bottom", "108px");
				}
				
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
		
		//입력창에 이벤트 추가하기
		gptpt.search_work_action_add_event();		

	},
	
	// 전체 삭제 버튼 표시/숨김 관리
	"updateClearButtonState" : function(){
		if (gptpt.normal_chat_Dropzone &&  gptpt.normal_chat_Dropzone.files.length > 0) {
            $('#preview-header').css('display', 'flex');
        } else {
            $('#preview-header').hide();
        }		
	},


///// K-GPT 하단 질문 입력창 좌측 버튼 이벤트 함수
	"event_kgpt_search_detail_btn_box" : function(){
		
		////// 딥싱크 토클 버튼
	//	$("#btn_toggle_deepthink").off().on("click", function(){
	//		$(this).toggleClass("active");
	//	});
		
		////// 
		$("#btn_select_search_option").off().on("click", function(){
			$("#btn_cancel_deepthink_option_select").click();
			$("#btn_select_multiagent_option").removeClass("select");
		
			$(this).hide();
			$("#btn_search_option_drowndown").show();
		});
		
		$("#btn_select_multiagent_option").off().on("click", function(){
		
			$("#btn_cancel_deepthink_option_select").click();
			$("#btn_cancel_search_option_select").click();
		
			if ($(this).attr("class").indexOf(" select") > -1){
				$(this).removeClass("select");
			}else{
				$(this).addClass("select");
			}
		});
		
		$("#btn_cancel_search_option_select").off().on("click", function(){
			$("#btn_search_option_drowndown").hide();
			$("#btn_select_search_option").show();
			$("#btn_cancel_search_option_select").data("code", null);
			$("#btn_cancel_search_option_select").find(".btn_ico").removeClass().addClass("btn_ico websearch");
			$("#btn_cancel_search_option_select").find(".btn_name").html(gap.lang.va287);
		});	
		
		
		
		//// 검색 옵션 드롭다운 펼치기
		$("#btn_open_dropdown_select_websearch_option").off().on("click", function(e){
			if($(e.target).closest("#dropdown_kgpt_search_option").length !== 0){
				e.stopPropagation();
				return false;
			} else {				
				gptpt.open_kgpt_search_option_dropdown_menu();
			}
		});
		
		///////////////////////////////////////////////////////////////////////////////////////////
		
		
		
		///////////////////////////////////////////////////////////////////////////////////////////
		
		$("#btn_toggle_deepthink").off().on("click", function(){
			$("#btn_select_multiagent_option").removeClass("select");
			$("#btn_cancel_search_option_select").click();
			
			$(this).hide();
			$("#btn_deepthink_option_drowndown").show();
		});
		
		
		$("#btn_cancel_deepthink_option_select").off().on("click", function(){
			$("#btn_deepthink_option_drowndown").hide();
			$("#btn_toggle_deepthink").show();
			$("#btn_cancel_deepthink_option_select").data("code", null);
			$("#btn_cancel_deepthink_option_select").find(".btn_ico").removeClass().addClass("btn_ico middle");
			$("#btn_cancel_deepthink_option_select").find(".btn_name").html("Medium");
		});
		
		
		
		
		//// DeepResearch버튼 드롭다운 펼치기
		$("#btn_open_dropdown_select_middle_option").off().on("click", function(e){
			if($(e.target).closest("#dropdown_kgpt_deepthink_option").length !== 0){
				e.stopPropagation();
				return false;
			} else {				
				gptpt.open_kgpt_deepthink_option_dropdown_menu();
			}
		});
		
		
	},
	
	"open_kgpt_deepthink_option_dropdown_menu" : function(){
		
		var html = "";
		
		html += "<div id='dropdown_kgpt_deepthink_option' class='dropdown_menu'>";
		html += "	<div class='dropdown_li' data-code='high'>";
		html += "		<div class='title_wrap'>";
		html += "			<span class='title_ico high'></span>";
		html += "			<span class='title_name'>High</span>";
		html += "		</div>";
		html += "		<div class='li_checked'></div>";
		html += "	</div>";
		html += "	<div class='dropdown_li' data-code='middle'>";
		html += "		<div class='title_wrap'>";
		html += "			<span class='title_ico middle'></span>";
		html += "			<span class='title_name'>Medium</span>";
		html += "		</div>";
		html += "		<div class='li_checked'></div>";
		html += "	</div>";
		html += "	<div class='dropdown_li' data-code='low'>";
		html += "		<div class='title_wrap'>";
		html += "			<span class='title_ico low'></span>";
		html += "			<span class='title_name'>Low</span>";
		html += "		</div>";
		html += "		<div class='li_checked'></div>";
		html += "	</div>";	
		html += "</div>";
		
		if( $("#btn_open_dropdown_select_middle_option .dropdown_menu").length === 0 ){
			$("#btn_open_dropdown_select_middle_option").append(html);
			
			/// 현재 선택된 메
			var select = $("#btn_cancel_deepthink_option_select").data("code");
			
			if( select === undefined || select === null ){
				/// 처음엔 중간 단계
				$("#dropdown_kgpt_deepthink_option").find("[data-code=middle]").addClass("select");
			} else {
				$("#dropdown_kgpt_deepthink_option .dropdown_li").removeClass("select");
				$("#dropdown_kgpt_deepthink_option").find("[data-code="+select + "]").addClass("select");	
			}
			
			/// 팝업메뉴 위치 조정
			$("#dropdown_kgpt_deepthink_option").css({
				"top" : - ($("#dropdown_kgpt_deepthink_option").outerHeight() + 8)
			});
			
			/// 열기 (펼쳐지는 애니메이션)
			requestAnimationFrame(function(){
				$("#dropdown_kgpt_deepthink_option").addClass("show");
			});
			
			//// 클릭영역 바깥 클릭 시 메뉴 닫기
			$(document).on("click", function(e){
				if( e.target.closest("#btn_deepthink_option_drowndown") === null ){
					$("#dropdown_kgpt_deepthink_option").remove();
				}
			});
			
		} else {
			
			/// 닫기
			$("#dropdown_kgpt_deepthink_option").removeClass("show");
			setTimeout(function(){				
				$("#dropdown_kgpt_deepthink_option").remove();
			}, 200);
			
		}
		
		$("#dropdown_kgpt_deepthink_option .dropdown_li").off().on("click", function(e){
			var code =  $(e.currentTarget).data("code");
			var name = $.trim($(e.currentTarget).find(".title_name").html());
			
			$(this).siblings(".dropdown_li").removeClass("select");
			$(this).addClass("select");
			
			$("#btn_cancel_deepthink_option_select").data("code", code);
			$("#btn_cancel_deepthink_option_select .btn_ico").removeClass().addClass("btn_ico " + code);
			$("#btn_cancel_deepthink_option_select .btn_name").html(name);
			
			$("#dropdown_kgpt_deepthink_option").remove();
		});
		
	},
	
	"open_kgpt_search_option_dropdown_menu" : function(){
		
		var html = "";
		
		html += "<div id='dropdown_kgpt_search_option' class='dropdown_menu'>";
		html += "	<div class='dropdown_li' data-code='websearch'>";
		html += "		<div class='title_wrap'>";
		html += "			<span class='title_ico websearch'></span>";
		html += "			<span class='title_name'>WebSearch</span>";
		html += "		</div>";
		html += "		<div class='li_checked'></div>";
		html += "	</div>";
		
		html += "	<div class='dropdown_li' data-code='perplexity'>";
		html += "		<div class='title_wrap'>";
		html += "			<span class='title_ico perplexity'></span>";
		html += "			<span class='title_name'>Perplexity</span>";
		html += "		</div>";
		html += "		<div class='li_checked'></div>";
		html += "	</div>";
		
		html += "	<div class='dropdown_li' data-code='file'>";
		html += "		<div class='title_wrap'>";
		html += "			<span class='title_ico file'></span>";
		html += "			<span class='title_name'>Files</span>";
		html += "		</div>";
		html += "		<div class='li_checked'></div>";
		html += "	</div>";
		html += "	<div class='dropdown_li' data-code='mail'>";
		html += "		<div class='title_wrap'>";
		html += "			<span class='title_ico mail'></span>";
		html += "			<span class='title_name'>EMail</span>";
		html += "		</div>";
		html += "		<div class='li_checked'></div>";
		html += "	</div>";
		html += "	<div class='dropdown_li' data-code='calendar'>";
		html += "		<div class='title_wrap'>";
		html += "			<span class='title_ico calendar'></span>";
		html += "			<span class='title_name'>Calendar</span>";
		html += "		</div>";
		html += "		<div class='li_checked'></div>";
		html += "	</div>";
		html += "	<div class='dropdown_li' data-code='template'>";
		html += "		<div class='title_wrap'>";
		html += "			<span class='title_ico template'></span>";
		html += "			<span class='title_name'>Company Data</span>";
		html += "		</div>";
		html += "		<div class='li_checked'></div>";
		html += "	</div>";
		html += "	<div class='dropdown_li' data-code='data'>";
		html += "		<div class='title_wrap'>";
		html += "			<span class='title_ico data'></span>";
		html += "			<span class='title_name'>My Data</span>";
		html += "		</div>";
		html += "		<div class='li_checked'></div>";
		html += "	</div>";
		html += "	<div class='dropdown_li' data-code='ai_notebook'>";
		html += "		<div class='title_wrap'>";
		html += "			<span class='title_ico ai_notebook'></span>";
		html += "			<span class='title_name'>AI Note</span>";
		html += "		</div>";
		html += "		<div class='li_checked'></div>";
		html += "	</div>";
		html += "</div>";
		
		if( $("#btn_open_dropdown_select_websearch_option .dropdown_menu").length === 0 ){
			$("#btn_open_dropdown_select_websearch_option").append(html);
			
			/// 현재 선택된 메
			var select = $("#btn_cancel_search_option_select").data("code");
			
			if( select === undefined || select === null ){
				/// 처음엔 웹검색을 선택
				$("#dropdown_kgpt_search_option").find("[data-code=websearch]").addClass("select");
			} else {
				$("#dropdown_kgpt_search_option .dropdown_li").removeClass("select");
				$("#dropdown_kgpt_search_option").find("[data-code="+select + "]").addClass("select");	
			}
			
			/// 팝업메뉴 위치 조정
			$("#dropdown_kgpt_search_option").css({
				"top" : - ($("#dropdown_kgpt_search_option").outerHeight() + 8)
			});
			
			/// 열기 (펼쳐지는 애니메이션)
			requestAnimationFrame(function(){
				$("#dropdown_kgpt_search_option").addClass("show");
			});
			
			//// 클릭영역 바깥 클릭 시 메뉴 닫기
			$(document).on("click", function(e){
				if( e.target.closest("#btn_search_option_drowndown") === null ){
					$("#dropdown_kgpt_search_option").remove();
				}
			});
			
		} else {
			
			/// 닫기
			$("#dropdown_kgpt_search_option").removeClass("show");
			setTimeout(function(){				
				$("#dropdown_kgpt_search_option").remove();
			}, 200);
			
		}
		
		$("#dropdown_kgpt_search_option .dropdown_li").off().on("click", function(e){
			var code =  $(e.currentTarget).data("code");
			var name = $.trim($(e.currentTarget).find(".title_name").html());
			
			$(this).siblings(".dropdown_li").removeClass("select");
			$(this).addClass("select");
			
			$("#btn_cancel_search_option_select").data("code", code);
			$("#btn_cancel_search_option_select .btn_ico").removeClass().addClass("btn_ico " + code);
			$("#btn_cancel_search_option_select .btn_name").html(name);
			
			$("#dropdown_kgpt_search_option").remove();
		});
		
	},

	"textarea_height_set" : function(){
		$("#search_work").html("");
		/*$("#search_work").css("height", "40px");*/
		$("#search_work").css("height", "20px");
	},

	"web_research_pop_draw": function(){		
		var html = "";
		
		html += "<div id='web_research_popup' class='web_research_popup' style='display:none'>";
		html += "	<div class='inner'>";
		html += "		<div class='select_engine_box'>";
		html += "			<button type='button' class='btn_search_engine kgpt active'>";
		html += "				<span class='btn_inner'>";
		html += "					<span class='btn_ico'></span><span class='btn_txt'>K-GPT</span>";
		html += "				</span>";
		html += "			</button>";
		html += "			<button type='button' class='btn_search_engine perplextiy'>";
		html += "				<span class='btn_inner'>";
		html += "					<span class='btn_ico'></span><span class='btn_txt'>Perplextiy</span>";
		html += "				</span>";
		html += "			</button>";
		html += "			<button type='button' class='btn_search_engine naver'>";
		html += "				<span class='btn_inner'>";
		html += "					<span class='btn_ico'></span><span class='btn_txt'>Naver</span>";
		html += "				</span>";
		html += "			</button>";
		html += "			<button type='button' class='btn_search_engine bing'>";
		html += "				<span class='btn_inner'>";
		html += "					<span class='btn_ico'></span><span class='btn_txt'>Bing</span>";
		html += "				</span>";
		html += "			</button>";		
		html += "		</div>";
		html += "	</div>";
		html +=	"</div>";
		
		$("#search_work_wrap").append(html);
		var inx = gap.maxZindex();
		$("#web_research_popup").css("z-index", parseInt(inx) + 1);
		
		setTimeout(function(){
			$("#web_research_popup").addClass("slide");
		}, 0);
		
		$("#web_research_popup .btn_search_engine").on("click", function(){
			var select_engine = $(this).find(".btn_txt").text();
			$(this).addClass("active");
			$(this).siblings().removeClass("active");
			$("#btn_web_research").removeClass("active").addClass("select");
			$("#web_research_popup").removeClass('slide');
			
			$("#select_engine_wrap").addClass("select");
			$("#select_engine_name").text(select_engine);
		});
		
		$("#btn_deselect_engine").on("click", function(e){
			e.stopPropagation();
			$("#btn_web_research").removeClass("active select");
			$("#web_research_popup .btn_search_engine").removeClass("active");
			$("#select_engine_wrap").removeClass("select");
			$("#select_engine_name").text("");
		});
	},
	
	//// 공유하기 레이어 수정본 2025-04-28
	"draw_layer_share_chat_history" : function(link_url){
		var _self = this;
		var html = "";
		var modal = "<div id='modal'></div>";
		
		gptpt.meeting_link = link_url;
		
		html += "<div id='layer_share_chat_history' class='reg-category-ly' style='width: 560px;'>";
		html += "	<div class='layer_inner' style='display: flex; flex-direction: column;'>";
		html += "		<div class='pop_btn_close' stlye='right:33px;'></div>";
		html += "		<h2 class='layer_title'>" + gap.lang.do_share + "</h2>";		
		
		/// 레이어 상단 버튼
		//html += "		<div style='display: flex; justify-content: center; align-items: center; gap: 16px; margin-top:20px; text-align:center;'>";
		html += "		<div style='display: grid; grid-template-columns: repeat(5, calc(20% - 13px)); justify-content: center; align-items: center; gap: 16px; margin-top:20px; text-align:center;'>";
		html += "			<button id='btn_mail_forward' class='bottom_btn mail'>";
		html += "				<span class='icon_wrap'><span class='ico'></span></span>";
		html += "				<span>Mail</span>";
		html += "			</button>";
		html += "			<button id='btn_chat_forward' class='bottom_btn chat'>";
		html += "				<span class='icon_wrap'><span class='ico'></span></span>";
		html += "				<span>Chat</span>";
		html += "			</button>";
		html += "			<button id='btn_workroom_forward' class='bottom_btn workroom'>";
		html += "				<span class='icon_wrap'><span class='ico'></span></span>";
		html += "				<span>Workroom</span>";
		html += "			</button>";
		html += "			<button id='btn_note_forward' class='bottom_btn ai_note'>";
		html += "				<span class='icon_wrap'><span class='ico'></span></span>";
		html += "				<span>AI Notebook</span>";
		html += "			</button>";
		html += "			<button id='btn_link_forward' class='bottom_btn link'>";
		html += "				<span class='icon_wrap'><span class='ico'></span></span>";
		html += "				<span>Link</span>";
		html += "			</button>";
		html += "		</div>";
		/// 레이어 하단 버튼
		
		html += "		<div id='share_content_wrap' class='layer-cont' style='display: none;'>";
		html += "				<div id='input_content' class='left-cont' style='display: flex; flex-direction: column; '>";
		html += "				</div>";
		html += "				<div style='display: flex; justify-content: center; margin-top: 40px;'><button type='button' id='btn_share_content' class='btn_share'>공유하기</button></div>";
		html += "		</div>";
		
		html += "	</div>";
		html += "</div>";
				
		$(modal).appendTo('body');
		$(html).appendTo("#modal");
		
		var $layer = $('#layer_share_chat_history');
		
		var inx = parseInt(gap.maxZindex()) + 1;
		$("#modal").css('z-index', inx);
		
		$("#modal").fadeIn(150);
		
		// 이벤트 처리
		this.shareChatHistoryEvent();
	},
	
	
	// 공유하기 버튼에 따라 다르게 입력창 그리는 함수
	"draw_input_content" : function(opt){
		var _self = this;
		var html = "";
		
		html += "					<div class='each'>";
		html += "						<div class='menu-title'>" + gap.lang.basic_title + "<sup>*</sup></div>";
		html += "						<div class='meet_work_input_box' style='display:flex'>";
		html += "							<input id='reg_meet_title' class='input' placeholder='" + gap.lang.input_title + "' autocomplete='off'>";
		html += "						</div>";
		html += "					</div>";
		
		///업무방일 때
		if(opt === "workroom"){
			html += "					<div class='each'>";
			html += "						<div class='menu-title'>" + gap.lang.channel + "<sup>*</sup></div>";
			html += "						<div class='meet_work_input_box' style='display:flex;'>";
			html += "							<select id='workroom_list'>";
			html += "							</select>";
			html += "						</div>";
			html += "					</div>";
		} else {
			html += "					<div class='each'>";
			html += "						<div class='menu-title'>" + gap.lang.recipient + "<sup>*</sup></div>";
			html += "						<div class='meet_work_input_box' style='display:flex;'>";
			html += "							<input id='reg_mail_sendto' class='input' placeholder='" + gap.lang.select_recipient_msg + "' autocomplete='off'>";
			html += "							<div class='btn-menu-mng-org'></div>";
			html += "						</div>";
			html += "					</div>";
		}
		
		html += "					<div id='menu_mng_user_wrap' style='display:none;'>";
		html += "						<ul id='menu_mng_user_list' class='menu-usermng-wrap'></ul>";
		html += "					</div>";
		
		$("#input_content").empty();
		$("#input_content").append(html);
		
		if(opt === "workroom"){
			var data = JSON.stringify({});
			var url = gap.channelserver + "/api/channel/channel_info_list.km";
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				url : url,
				data : data,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){
					gap.cur_channel_list_info = res;
					var list = res;
					var html = "";

					for (var i = 0 ; i < list.length; i++){
						var item = list[i];
						if (item.type != "folder"){
							html += "		<option value='" + item.ch_code + "'>" + item.ch_name + "</option>";
						}						
					}
					
					$("#workroom_list").append(html);
					$("#workroom_list").selectmenu();
					
					// 이벤트 처리
					_self.shareChatHistoryEvent();					
				},
				error : function(e){
					gap.error_alert();
				}
			});
			
		}else{
			// 이벤트 처리
			this.shareChatHistoryEvent();
		}
		

	},

	"add_mail_forward_mnguser" : function(_info){	// 메일 수신자 추가
		var $list = $('#menu_mng_user_list');
		var ck = $list.find('li[data-key="' + _info.em + '"]');
		if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함		
				
		var disp_txt = '';
		var user_info = new Object();
		
		if (gap.isValidEmail(_info.ky)){
			user_info.em = _info.ky;
			disp_txt = _info.ky;
			
		}else{
			user_info = gap.user_check(_info);
			disp_txt = user_info.disp_user_info;
		}
				
		var html =
			'<li class="f_between" data-key="' + user_info.em + '" data-ky="' + user_info.ky + '">' +
			'	<span class="txt ko">' + disp_txt + '</span>' +
			'	<button class="file_remove_btn"></button>' +
			'</li>';
		
		var $li = $(html);

		$li.find('.file_remove_btn').off().on('click', function(){
			$(this).closest('li').remove();
			
			if ($list.find('li').length == 0) {
				$('#menu_mng_user_wrap').hide();
			}
		});
		
		$list.append($li);
		$('#menu_mng_user_wrap').show();
	},					
	
	"shareChatHistoryEvent" : function(){
		var _self = this;
		var $layer = $('#layer_share_chat_history');
		
		// 레이어 닫기
		$layer.find('.pop_btn_close').off().on('click', function(){
			$("#modal").fadeOut(150, function(){
				$("#modal").remove();
			});
		});
		
		// 수신 대상자 입력
		$('#reg_mail_sendto').off().on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			var terms = $.trim($(this).val());
			if (terms == '') return;
			
			var users = terms.split(',');
			var em_list = [];
			var nm_list = [];
			$.each(users, function(){
				var _d = $.trim(this);
				if (gap.isValidEmail(_d)){
					em_list.push(_d);
				}else{
					nm_list.push(_d);
				}
			});
			if (em_list.length > 0){
				$.each(em_list, function(){
					var email = new Object();
					email.ky = this;
					email.em = this;
					
					_self.add_mail_forward_mnguser(email);
				});				
			}		
			if (nm_list.length > 0){
				gsn.requestSearch('', nm_list.join(","), function(res){
					$.each(res, function(){
						_self.add_mail_forward_mnguser(this);
					});
					$('#reg_mail_sendto').focus();				
				});					
			}
			$(this).val('');
		});					
		
		// 수신자 입력 (조직도 선택)
		$layer.find('.btn-menu-mng-org').off().on('click', function(){
			var block_idx = parseInt($('#modal').css('z-index'));
			$layer.css('z-index', block_idx-1);
			window.ORG.show(
				{
					'title': gap.lang.select_recipient,
					'isadmin': true,	// 창혜원 관리자
					'single': false,
					'show_ext' : false, // 외부 사용자 표시 여부
					'select': 'person' // [all, team, person]
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length > 0){
							for (var i = 0; i < items.length; i++){
								var _res = gap.convert_org_data(items[i]);
								_self.add_mail_forward_mnguser(_res);
							}
						}
					},
					onClose: function(){
						$layer.css('z-index', block_idx+1);
					}
				}
			);
		});
		
	
		// 메일 공유
		$('#btn_mail_forward').off().on('click', function(){
			$(this).siblings().removeClass("active");
			$(this).toggleClass("active");
			
			gptpt.draw_input_content("mail");
		});
		
		// 채팅 공유
		$('#btn_chat_forward').off().on('click', function(){
			$(this).siblings().removeClass("active");
			$(this).toggleClass("active");
			
			gptpt.draw_input_content("chat");
		});
		
		/// 업무방 공유
		$("#btn_workroom_forward").off().on("click", function(){
			$(this).siblings().removeClass("active");
			$(this).toggleClass("active");
			
			gptpt.draw_input_content("workroom");
		});
		
		// 노트 공유
		$('#btn_note_forward').off().on('click', function(){
			$(this).siblings().removeClass("active");
			$(this).toggleClass("active");
			
			gptpt.draw_input_content("note");
		});
		
		// 링크 복사
		$('#btn_link_forward').off().on('click', function(){
			$(this).siblings().removeClass("active");
			$(this).toggleClass("active");
			
			if ($(this).hasClass("active")){
				navigator.clipboard.writeText(gptpt.meeting_link)
				.then(() => {
					mobiscroll.toast({message:gap.lang.copied, color:'info'});
					return false;
				});
			}
		});		
		
		// 공유하기 버튼 클릭
		$("#btn_share_content").off().on("click", function(){
			var _selected = $(".bottom_btn.active");
			var share_id = _selected.attr("id");
			
			if (share_id == "btn_mail_forward"){
				var $this = $(this);
				// 중복 수행 방지
				if ($this.hasClass('process')) return;
				
				$this.addClass('process');
	
				var valid = _self.reg_comm_forward_valid(share_id);
				if (!valid) {
					$this.removeClass('process');
					return false;
				}			
				
				gap.showConfirm({
					title: gap.lang.Confirm,
					//iconClass: 'remove',
					contents: gap.lang.q_share,
					callback: function(){
						var _sinfo = gap.user_check(gap.userinfo.rinfo);
						var _receiver = [];
						var $list = $('#menu_mng_user_list li');
						$.each($list, function(){
							_receiver.push( $(this).data('key') );
						});
						var _title = $.trim($('#reg_meet_title').val());
			
						var surl = location.protocol + "//" + window.mailserver + "/kwa01/mail/sendMail.nsf/frmSendMail?OpenForm";
						var postData = {
								"__Click" : "0",
								"%%PostCharset" : "UTF-8",
								"SaveOptions" : "0",
								"Type" : 'meeting',
								"Title" : _title,
								"Sender" : _sinfo.nm + ' <' + _sinfo.em + '>',
								"Receiver" : _receiver.join('-spl-'),
								"Ext_1" : gptpt.meeting_title,
								"Ext_2" : gptpt.meeting_dt,
								"Ext_3" : gptpt.meeting_member,
								"Ext_4" : gptpt.meeting_link
							};
				
						$.ajax({
							type : "POST",
							url : surl,
							dataType : "json",
							data : postData,
							success : function(__res){
								var res = __res;
								if (res.success){
									$layer.find('.pop_btn_close').click();
				
								}else{
									// do nothing...
								}
							},
							error : function(e){
							}
						});					
					}
				});
				
			}else if (share_id == "btn_chat_forward"){
				var $this = $(this);
				// 중복 수행 방지
				if ($this.hasClass('process')) return;
				
				$this.addClass('process');
	
				var valid = _self.reg_comm_forward_valid(share_id);
				if (!valid) {
					$this.removeClass('process');
					return false;
				}
							
				gap.showConfirm({
					title: gap.lang.Confirm,
					//iconClass: 'remove',
					contents: gap.lang.q_share,
					callback: function(){
						var _sinfo = gap.user_check(gap.userinfo.rinfo);
						var _receiver = [];
						var $list = $('#menu_mng_user_list li');
						$.each($list, function(){
							_receiver.push( $(this).data('ky') );
						});
						var _title = $.trim($('#reg_meet_title').val());
			
						var msg = _title + " : " + gptpt.meeting_link;
						var receivers = _receiver;
						gBody.send_msg_etc(msg, receivers);
						$layer.find('.pop_btn_close').click();					
					}
				});
				
			}else if (share_id == "btn_workroom_forward"){
				var $this = $(this);
				// 중복 수행 방지
				if ($this.hasClass('process')) return;
				
				$this.addClass('process');
	
				var valid = _self.reg_comm_forward_valid(share_id);
				if (!valid) {
					$this.removeClass('process');
					return false;
				}
				
				gap.showConfirm({
					title: gap.lang.Confirm,
					//iconClass: 'remove',
					contents: gap.lang.q_share,
					callback: function(){
						var _ch_code = $("#workroom_list").val();
						var _ch_name = $("#workroom_list option:checked").text();
						var _title = $.trim($('#reg_meet_title').val());
						var _content = _title + " : " + gptpt.meeting_link;
						
						//아래 설정을 해야 gBody3에서 인식한다. send_socket에서
						gBody3.select_channel_code = _ch_code;
						gBody3.select_channel_code2 = _ch_code;
						gBody3.select_channel_name = gap.textToHtml(_ch_name);
						
						var xdata = JSON.stringify({
							"type" : "msg",
							"channel_code" : _ch_code,
							"channel_name" : _ch_name,
							"email" : gap.userinfo.rinfo.em,
							"ky" : gap.userinfo.rinfo.ky,
							"owner" : gap.userinfo.rinfo,
							"content" : _content,
							"edit" : "",
							"msg_edit" : "",
							"id" : "",
							"fserver" : gap.channelserver
						});
						
						gBody3.send_msg_to_server(xdata);
						$layer.find('.pop_btn_close').click();					
					}
				});								

				
			}else if (share_id == "btn_note_forward"){
				var $this = $(this);
				// 중복 수행 방지
				if ($this.hasClass('process')) return;
				
				$this.addClass('process');
	
				var valid = _self.reg_comm_forward_valid(share_id);
				if (!valid) {
					$this.removeClass('process');
					return false;
				}
				
				gap.showConfirm({
					title: gap.lang.Confirm,
					//iconClass: 'remove',
					contents: gap.lang.q_share,
					callback: function(){
						var _sinfo = gap.user_check(gap.userinfo.rinfo);
						var _receiver = [];
						var $list = $('#menu_mng_user_list li');
						$.each($list, function(){
							_receiver.push( $(this).data('ky') );
						});
						var _title = $.trim($('#reg_meet_title').val());			
					
						var url = gptpt.plugin_domain_fast + "notebook/ai_note_save_share";
						var data = JSON.stringify({
							"receive" : _receiver,
							"title" : _title,
							"content" : gptpt.meeting_link,
							"owner" : gap.userinfo.rinfo
						});			
						gap.ajaxCall(url, data, 
							function(res){
								if (res.result == "OK"){
									$layer.find('.pop_btn_close').click();
								}else{
									gap.error_alert();
								}
							}
						);
					}
				});
			}
			
		});
		
		/// 버튼을 클릭했을 때 입력창이 펼쳐져있을 때는 고정
		$(".bottom_btn").on("click", function(){
			// 공유하기 버튼 표시
			if ($(this).attr("id") == "btn_link_forward"){
				$("#btn_share_content").hide();
				$("#share_content_wrap").slideUp(150);
				return;
			}else{
				$("#btn_share_content").show();
			}
			///////////////////////////////////////////////
						
			if ($(this).hasClass("active")){			
				$("#share_content_wrap").slideDown(150);
			} else {
				$("#share_content_wrap").slideUp(150);
			}
		});
		
	},
	
	"reg_comm_forward_valid" : function(share_id){
		var _title = $.trim($('#reg_meet_title').val());
		if (_title == '') {
			$('#reg_meet_title').focus();
			mobiscroll.toast({message:gap.lang.input_title, color:'danger'});
			return false;
		}
		
		if (share_id != "btn_workroom_forward"){
			var _sendto = $('#menu_mng_user_list li').length;
			if  (_sendto == 0){
				$('#reg_mail_sendto').focus();
				mobiscroll.toast({message:gap.lang.select_recipient_msg, color:'danger'});
				return false;
			}			
		}			
		return true;
	},	

	"ai_notebook_hide" : function(){
		$("#btn_open_ai_notebook").removeClass("active");
		$(".mask_top").hide();
		$(".mask_bot").hide();
		$("#ai_notebook_layer").hide();
		$("#ai_portal_left_content").removeClass("ai_note");
	},

	"isValueInArray2" : function(value){
		value = value.replace(/\s+/gi, "");
		var array = ["새글작성","세글작성","색을작성","다시"];	
		return array.includes(value.toLowerCase());
	},
	
	"isValueInArray" : function(value){
		value = value.replace(/\s+/gi, "");
		var array = ["하이gpt", "하이지피티", "하이cpt", "higpt", "아이지피티"]
		return array.includes(value.toLowerCase());
	},

 	"voice_end" : function(){
		 if (gptpt.recognition){
			gptpt.voice_ok = false;
			$("#btn_mike").removeClass("going");
			gptpt.recognition.stop();
			return;
		}
	 },
	 	 
	 //브리핑 설정 레이어 그리는 함수
	"briefing_setting_layer_draw": function(){		
        var html = '';		
		gptpt.temp_count_limit = 3; // 추가할 수 있는 브리핑 최대 개수		
		html += "<div id='ai_briefing_set_box'>";
		html += "<div class='box_left'>";
		html += "	<div class='box_left_top'>";
		html += "		<div class='briefing_work_input_box'>";
		html += "			<input type='text' id='input_briefing_work' class='briefing_work_input' placeholder='"+gap.lang.va39+"'>";
		html += "			<button type='button' id='btn_briefing_add' class='btn_work_add'><span>"+gap.lang.va109+"</span></button>";
		html += "		</div>";
		html += "	</div>";
		html += "	 <div id='work_temp_layout' class='temp_layout'>";
		html += "		<div class='temp_layout_top'>";
		html += "			<div class='chkbox_wrap'>";
		html += "				<label for='briefing_auto' class='chkbox_label'>";
		html += "					<input id='briefing_auto' class='briefing_auto_chkbox' type='checkbox'>";
		html += "					<span class='chkbox'></span><span class='label_txt'>"+gap.lang.va41+"</span>";
		html += "				</label>";
		html += "			</div>";
		html += "			<div id='temp_count_box' class='temp_count_box'>";
		html += "				<div class='temp_count_title'>"+gap.lang.va42+"</div>";
		html += "					<div class='temp_count_wrap'>";
		html += "						<span id='temp_current_count' class='temp_current_count'>0</span>";
		html += "						<span>/</span>";
		html += "						<span id='temp_count_limit' class='temp_count_limit'>"+gptpt.temp_count_limit+"</span>";
		html += "					</div>";
		html += "				</div>";
		html += "			</div>";
		html += "			<div id='ai_work_temp_ul' class='work_temp_ul'>";
		html += "			</div>";
		html += "			<div id='guide_work_temp' class='work_temp_empty'>";
		html += "				<div class='briefing_guide_txt'>"+gap.lang.va43+"</div>";
		html += "			 </div>";
		html += "		</div>";
		html += "		<div class='btn_wrap'>";
		html += "			 <button type='button' id='btn_briefing_work_save' class='layer_bot_btn'><span>"+gap.lang.basic_save+"</span></button>";
		html += "			 <button type='button' id='btn_briefing_work_cancel' class='layer_bot_btn'><span class=>"+gap.lang.Cancel+"</span></button>";
		html += "	</div>";
		html += "</div>";
		html += " <div class='box_right'>";
		html += "	<div class='right_title'>"+gap.lang.va44+"</div>";
		html += "	<div class='temp_folder_list' id='ai_breif_template'>";		
		html += "	</div>";
		html += "</div>";
		
		$("#dark_layer").append(html);
    	$("#dark_layer").fadeIn(200);
		
		tlist = gptpt.template_list;
		for (var i = 0 ; i < tlist.length; i++){
			var item = tlist[i];
			if (item.use_brief && item.use_brief == "T"){
				if (gap.curLang == "ko"){
					gptpt.ai_portal_brief_folder_make(item.menu, item.menu_code);
					gptpt.ai_portal_brief_sub_menu_add(item.menu_code, item.msg);
				}else{
					gptpt.ai_portal_brief_folder_make(item.menu_en, item.menu_code);
					gptpt.ai_portal_brief_sub_menu_add(item.menu_code, item.msg_en);
				}
			}			
		}				
		
		$("#btn_briefing_work_save").off().on("click", function(e){			
			var select_list = $("#ai_work_temp_ul").find(".temp_title_txt");
			var stext = [];
			if (select_list.length > 0){
				for (var i = 0 ; i < select_list.length; i++){
					var item = $(select_list[i]);
					var stxt = item.text() + "-spl-" + item.data("code");
					stext.push(stxt);
				}				
			}
			
			var ischecked = false;
			if ($("#briefing_auto").is(":checked")){
				ischecked = true;
			}
			gptpt.brief_auto_show = ischecked;
			
			var data = "";
			if (stext.length > 0){
				data = stext.join("-=spl=-");
			}
			
			var surl = gap.channelserver + "/api/kgpt/ai_brief_save.km";
			var postData = JSON.stringify({
				"data" : data,
				"checked" : ischecked
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
					$("#btn_briefing_work_cancel").click();
					
					//gptpt.brief_init("start");
				},
				error : function(e){
					
				}
			});
			
		});

		//브리프 설정 화면 닫기
		$("#btn_briefing_work_cancel").on("click", function(){
			$("#dark_layer").fadeOut(200);
			$("#dark_layer").empty();
		});
		

		$("#ai_briefing_set_box .temp_li").on("click", function(){
			$(this).parent().toggleClass("slide");
			$(this).siblings(".depth1_wrap").slideToggle(150);
		});
		
		$(".btn_del_temp").on("click", function(){
			$(this).closest(".work_temp_li").remove();
			$("#ai_work_temp_ul").packery("layout");
		});
		
		$("#ai_work_temp_ul").packery({
		    itemSelector: '#ai_work_temp_ul .work_temp_li',
			gutter: 16,
			transitionDuration: '0.2s',
			percentPosition: true
		});
		var $items = $("#ai_work_temp_ul .work_temp_li").draggable({
			containment: "#ai_work_temp_ul",
		});
		$("#ai_work_temp_ul").packery( 'bindUIDraggableEvents', $items ).packery();
		
		//템플릿 클릭을 통한 브리핑 추가
		$("#ai_briefing_set_box .depth_txt").on("click", function(){
			if($("#temp_current_count").text() < gptpt.temp_count_limit){
				gptpt.briefing_item_add(gptpt.temp_count_limit, 'click', $(this));				
			}			
		});
		
		$("#btn_briefing_add").on("click", function(){			
			var val = $("#input_briefing_work").val();
			var count = parseInt($("#temp_current_count").text()); //현재 브리핑 개수			
			if( count === gptpt.temp_count_limit ) {
				gap.gAlert(gap.lang.va69);
				return;
			}
			if( val.length === 0 ){
				gap.gAlert(gap.lang.va70);
				return;
			}
			if( val.length !== 0 && count < gptpt.temp_count_limit ){
				gptpt.briefing_item_add(gptpt.temp_count_limit, 'chat', $("#input_briefing_work"));
			}
			$("#input_briefing_work").val("");
		});
		
		//텍스트 입력을 통한 브리핑 추가
		$("#input_briefing_work").on("keypress", function(e){			
			if( e.keyCode === 13 ){
				$("#btn_briefing_add").click();
			}				
		});		
		// 템플릿 드래그를 통한 브리핑 추가 활성화
		gptpt.briefing_item_add(gptpt.temp_count_limit, 'drag');
		gptpt.brief_init("init");
		
	},
	
	
	"code_change_text" : function(category){
		var category_ko = "";		
		if (gap.curLang == "ko"){
			if(category === 'mail'){
				category_ko = '메일';
			}else if(category === 'approval'){
				category_ko = '결재';
			}else if(category === 'etc'){
				category_ko = '뉴스';
			}else if(category === 'schedule'){
				category_ko = '일정';
			}else if(category === 'it'){
				category_ko = '정보서비스';
			}else if(category === 'finance'){
				category_ko = '재경';
			}else if(category === 'hr'){
				category_ko = '인사';
			}else if(category === 'sales'){
				category_ko = '영업';
			}else if(category === 'general_affairs'){
				category_ko = '총무';
			}
		}else{			
			category_ko = category;			
		}
		
		return category_ko;
	},
	
	// flag에 따라 브리핑 추가하는 함수
	"briefing_item_add": function(limit, flag, $this){ //(limit = 추가할 수 있는 최대 개수, flag = 클릭 or 드래그, $this = 클릭한 대상)
		
		if(flag === 'click' || flag === 'chat'){			
			var category = '';
			//드래그한 템플릿의 카테고리 이름
			if(flag === 'click'){
				category = $this.parent().attr("key");
			}
			if(flag === 'chat'){
				category = 'etc';
			}
			var category_ko = gptpt.code_change_text(category);
			
			//임의의 랜덤키
			var key = gptpt.generate_uniqueKey();
			
			//템플릿 html
			var temp = '';
			
			temp += "<div id='" + key + "' class='work_temp_li " + category + " active'>";
                temp += "<div class='temp_title_wrap'>";
					temp += "<div class='drag_guide_img'></div>";
					temp += "<div class='temp_title_box'>";
					temp += "<div class='temp_category_wrap'>";
							temp += "<div class='temp_category_img'></div>";
							temp += "<div class='temp_category_name'>" + category_ko + "</div>";
						temp += "</div>";
						temp += "<div class='arrow_right'></div>";
						if(flag === 'click'){ //클릭했을 때는 클릭한 대상의 템플릿 이름
							temp += "<div class='temp_title_txt' data-code='"+category+"'>" + $this.text() + "</div>";						
						}
						if(flag === 'chat'){ //
							temp += "<div class='temp_title_txt' data-code='"+category+"'>" + $this.val() + "</div>";
						}
					temp += "</div>";
                temp += "</div>";
				temp += "<button type='button' class='btn_del_temp'></button>";
            temp += "</div>";			
			temp = $(temp);			
			//현재 템플릿 개수
			var count = $("#ai_work_temp_ul .work_temp_li").filter('.ui-draggable').length + 1;			
			$("#temp_current_count").text(count);
			$("#guide_work_temp").hide();			
			if(count === limit){
				$("#temp_count_box").addClass("full");
			}			
			$("#ai_work_temp_ul").append(temp).packery( 'appended', temp );
			//console.log(">>>>>>>>>>>브리핑이 추가되었습니다.");			
			//추가한 템플릿 draggable 활성화
			var drag_item = temp.draggable({
				containment: "#ai_work_temp_ul"
			});
			
			$("#ai_work_temp_ul").packery( 'bindUIDraggableEvents', drag_item ).packery();
			
			$("#ai_work_temp_ul").on("layoutComplete", function(){
				//템플릿 개수가 최대 개수에 도달하면 드래그 비활성화
				if($("#ai_work_temp_ul .work_temp_li").filter('.ui-draggable').length >= limit) {
					$("#ai_briefing_set_box .depth_txt").not('.ui-draggable-disabled').draggable('disable');
				}
			});
			
			//브리핑 목록이 최대 개수에 도달했을 때
			if($("#ai_work_temp_ul .work_temp_li").filter('.ui-draggable').length >= limit) {
				$("#ai_briefing_set_box .depth_txt").addClass('disable');
				console.log(">>>>>>>>>>>브리핑이 최대 개수에 도달했습니다.");
			}
			
			//템플릿 지우기 버튼
			$(".btn_del_temp").on("click", function(){
				//지우려는 템플릿목록
				var li = $(this).closest(".work_temp_li");				
				var count = $("#ai_work_temp_ul .work_temp_li").filter('.ui-draggable').length - 1;
				$("#temp_current_count").text(count);
				
				//템플릿이 0개일 때
				if(count === 0){
					$("#guide_work_temp").show();
				}
				
				$("#ai_work_temp_ul").packery( 'remove', li ).packery('layout');
				
				//브리핑이 최대 개수 미만이 되면 다시 활성화
				if($("#ai_work_temp_ul .work_temp_li").filter('.ui-draggable').length <= limit) {
					$("#ai_briefing_set_box .depth_txt").draggable('enable').removeClass('disable');
					$("#temp_count_box").removeClass("full");
					console.log(">>>>>>>>>>>브리핑을 다시 추가할 수 있습니다..");
				}
				
			});
			
		}
		
		if(flag === 'drag'){			
			//템플릿 드래그
			$("#ai_briefing_set_box .depth_txt").draggable({
				helper: "clone", // 원래 요소를 복제하여 드래그함
	            start: function(event, ui) {					
	                $(ui.helper).addClass("dragging").appendTo('#ai_briefing_set_box');
	            },
	            drag: function(event, ui) {
	                // 드래그 중 추가 스타일 변경 가능
	            },
	            stop: function(event, ui) {					
	                $(ui.helper).removeClass("dragging");
	                // 드래그가 끝나면 원래 요소로 복사된 위치를 업데이트할 수 있습니다.
	
					//드롭한 위치의 좌표
					var droppedPosition = ui.position;
		
					//드롭한 위치에 놓인 태그들	
		            var droppedElement = document.elementsFromPoint(event.pageX, event.pageY);
					//드래그한 대상을 드롭하고싶은 태그
		            var $droppedOnItem = $(droppedElement).closest('#work_temp_layout');
					
					//드래그한 템플릿의 카테고리 이름
					var category = $(this).parent().attr("key");
					
					var category_ko = gptpt.code_change_text(category);
					
					//임의의 랜덤키
					var key = gptpt.generate_uniqueKey();
					
					//템플릿 html
					var temp = '';
					
					temp += "<div id='" + key + "' class='work_temp_li " + category + " active'>";
		                temp += "<div class='temp_title_wrap'>";
							temp += "<div class='drag_guide_img'></div>";
							temp += "<div class='temp_title_box'>";
							temp += "<div class='temp_category_wrap'>";
									temp += "<div class='temp_category_img'></div>";
									temp += "<div class='temp_category_name'>" + category_ko + "</div>";
								temp += "</div>";
								temp += "<div class='arrow_right'></div>";
								temp += "<div class='temp_title_txt' data-code='"+category+"'>" + $(this).text() + "</div>";
							temp += "</div>";
		                temp += "</div>";
						temp += "<button type='button' class='btn_del_temp'></button>";
		            temp += "</div>";
					
					temp = $(temp);
					
		            //드래그 한 템플릿을 브리핑목록에 드롭했을 때
		            if ($droppedOnItem.length && !$droppedOnItem.is(ui.helper) && $droppedOnItem.attr("id") === 'work_temp_layout') {						
						//현재 템플릿 개수
						var count = $("#ai_work_temp_ul .work_temp_li").filter('.ui-draggable').length + 1;						
						$("#temp_current_count").text(count);
						$("#guide_work_temp").hide();						
						if(count === limit){
							$("#temp_count_box").addClass("full");
						}						
						$("#ai_work_temp_ul").append(temp).packery( 'appended', temp );
						//console.log(">>>>>>>>>>>브리핑이 추가되었습니다.");						
						//추가한 템플릿 draggable 활성화
						var drag_item = temp.draggable({
							containment: "#ai_work_temp_ul"
						});						
						$("#ai_work_temp_ul").packery( 'bindUIDraggableEvents', drag_item ).packery();
						
						$("#ai_work_temp_ul").on("layoutComplete", function(){
							//템플릿 개수가 최대 개수에 도달하면 드래그 비활성화
							if($("#ai_work_temp_ul .work_temp_li").filter('.ui-draggable').length >= limit) {
								$("#ai_briefing_set_box .depth_txt").not('.ui-draggable-disabled').draggable('disable');
							}
						});
						
						//브리핑 목록이 최대 개수에 도달했을 때
						if($("#ai_work_temp_ul .work_temp_li").filter('.ui-draggable').length >= limit) {
							$("#ai_briefing_set_box .depth_txt").addClass('disable');
							//console.log(">>>>>>>>>>>브리핑이 최대 개수에 도달했습니다.");
						}
	
						//템플릿 지우기 버튼
						$(".btn_del_temp").on("click", function(){
							//지우려는 템플릿목록
							var li = $(this).closest(".work_temp_li");
							
							var count = $("#ai_work_temp_ul .work_temp_li").filter('.ui-draggable').length - 1;
							$("#temp_current_count").text(count);
							
							//템플릿이 0개일 때
							if(count === 0){
								$("#guide_work_temp").show();
							}
							
							$("#ai_work_temp_ul").packery( 'remove', li ).packery('layout');
							
							//브리핑이 최대 개수 미만이 되면 다시 활성화
							if($("#ai_work_temp_ul .work_temp_li").filter('.ui-draggable').length <= limit) {
								$("#ai_briefing_set_box .depth_txt").draggable('enable').removeClass('disable');
								$("#temp_count_box").removeClass("full");
								//console.log(">>>>>>>>>>>브리핑을 다시 추가할 수 있습니다..");
							}
							
						});						
		            }	
	            }				
			});			
		}		
	}, 
	
	"generate_uniqueKey": function(){
		const timestamp = Date.now().toString(36); // 현재 시간을 36진수 문자열로 변환
	    const randomStr = Math.random().toString(36).substr(2, 5); // 랜덤 문자열 생성
	    return `${timestamp}${randomStr}`;
	},
	 
	"ai_portal_template_folder_make" : function(name, code){
		var len = $("#ai_portal_template_" + code).length;
		if (len == 0){
			var html = "";
			html += "<div class='temp_ul slide "+code+"_temp_ul' id='ai_portal_template_"+code+"'>";
			html += "	<div class='temp_title_box temp_li'>";
			html += "		<div class='temp_title_wrap'>";
			html += "			<div class='temp_img'></div>"
			html += "			<div class='li_title'>"+name+"</div>";
			html += "		</div>";
			html += "		<div class='li_arrow_img'></div>";
			html += "	</div>";
			html += "	<div class='depth1_wrap' id='"+code+"_sub'>";
			html += "	</div>";
			html == "</div>";
			$("#folder_list").append(html);
		}
	 },
	 
	 "ai_portal_template_sub_menu_add" : function(code, msg, id){
		 $("#" + code + "_sub").append("<li class='depth1' ><div class='depth_txt' title='"+msg+"' data-id='"+id+"'>"+msg+"</div></li>");
	 },	 
	 
	 "ai_portal_brief_folder_make" : function(name, code){
		var len = $("#ai_portal_brief_" + code).length;
		if (len == 0){
			var html = "";
			html += "<div class='temp_ul slide "+code+"_temp_ul' id='ai_portal_brief_"+code+"'>";
			html += "	<div class='temp_title_box temp_li'>";
			html += "		<div class='temp_title_wrap'>";
			html += "			<div class='temp_img'></div>"
			html += "			<div class='li_title'>"+name+"</div>";
			html += "		</div>";
			html += "		<div class='li_arrow_img'></div>";
			html += "	</div>";
			html += "	<div class='depth1_wrap' id='brief_"+code+"_sub'>";
			html += "	</div>";
			html == "</div>";
			$("#ai_breif_template").append(html);
		}
	 },
	 
	 "ai_portal_brief_sub_menu_add" : function(code, msg){
		 $("#brief_" + code + "_sub").append("<li class='depth1' key='"+code+"'><div class='depth_txt' title='"+msg+"'>"+msg+"</div></li>");
	 },
	 
	 "ai_portal_mydata_folder_make" : function(name, code, bun){		
		 var len = $("#ai_mydata_" + code).length;
		if (len == 0){
			var html = "";			
			if (code == "share"){
				html += "		<div class='data_ul slide' id='ul_"+code+"' style='display:none'>";
			}else{
				html += "		<div class='data_ul slide' id='ul_"+code+"' >";
			}
					
			html += "<div class='data_li' id='ai_mydata_"+code+"'>";
			html += "	<div class='data_title_wrap'>";
			html += "		<input type='checkbox' id='data"+bun+"' class='all_chkbox_input'><label class='all_chk all_chkbox_label' id='all_box_"+code+"' for='data"+bun+"'></label>";
			html += "		<div class='data_img'></div>";
			html += "		<div class='data_title'>"+name+"</div>";
			html += "	</div>";
			html += "	<div class='li_arrow_img'></div>";
			html += "</div>";
			html += "<div class='data_files_wrap' id='"+code+"_sub'>";
			html += "</div>";				
			html += "		</div>";
			$("#ai_mydata_dis").append(html);
		}
	 },
	 
	 "ai_portal_mydata_sub_menu_add" : function(fcode, title, code){	
		 
		 var html = "";
		 html = "<li class='file_li'><input type='checkbox' id='"+code+"' class='chkbox_input'><label class='chkbox_label' for='"+code+"'></label>";
		 html += "	<div class='file_depth'>ㄴ</div><div class='file_name' title='"+title+"'>"+title+"</div>";
		 html += "</li>"   ;
		 if ($("#" + fcode + "_sub").length == 0){
			 //폴더가 없는 경우 sharev폴더 하위에 표시한다.
			 $("#ul_share").show();
			 $("#share_sub").append(html);   
		 }else{
			$("#" + fcode + "_sub").append(html);     
		 }
		                				
	 },
	 
	 "ai_portal_folder_list_draw" : function(opt){
	 	 var postData = JSON.stringify({
	 	 	"category" : "pc"
	 	 });
		 var url = root_path + "/api/kgpt/" + (opt == "template" ? "ai_list_template.km" : "ai_list_mydata.km");
		 $.ajax({
			type : "POST",
			url : url,
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type", "application/json; charset=utf-8")
			},
			success : function(res){				
				$("#folder_list").empty();				
				var html = "";
				if (opt == "template"){		
					gptpt.template_list = res.data.data;			
					for (var i = 0 ; i < res.data.data.length; i++){
						var item = res.data.data[i];
						
						if (gap.curLang == "ko"){
							gptpt.ai_portal_template_folder_make(item.menu, item.menu_code);
							gptpt.ai_portal_template_sub_menu_add(item.menu_code, item.msg, item.code);
						}else{
							gptpt.ai_portal_template_folder_make(item.menu_en, item.menu_code);
							gptpt.ai_portal_template_sub_menu_add(item.menu_code, item.msg_en, item.code);
						}						
					}					
					//메뉴 클릭시 AI에게 요청한다.
					$(".depth_txt").on("click", function(e){
						gptpt.close_project_open2();
						gptpt.old_code = gptpt.current_code;
						gptpt.current_code = "";
						gptapps.dis_id = "ai_result_dis";
						gptapps.dis_scroll = "ai_result_dis_top";
						var msg = $(e.target).text();
						var code = $(e.target).data("id");
						
						gptpt.send_ai_request(msg, code);
					});		
					$("#folder_list .temp_li").on("click", function(e){						
						var cl = $(e.currentTarget).parent().attr("id");
						var cl_id = $.trim(cl.replace("ai_portal_template_", ""));
					//	var cls = $(e.currentTarget).parent().attr("class");
						var is_slide = 1;						
						var sub = $("#"+cl_id + "_sub").css("display");
						if (sub != "none"){
							is_slide = "-1";
						}						
						localStorage.setItem(cl_id + "_slide", is_slide);
						$(this).parent().toggleClass("slide");
						$(this).siblings(".depth1_wrap").slideToggle(150);
					});
					//폴더를 마지막 접어 놓는 상태로 유지한다.
					const keys = Object.keys(localStorage);
    				const matchingKeys = keys.filter(key => key.includes("slide"));
					for (var k = 0; k < matchingKeys.length; k++){
						var key = matchingKeys[k];
						var rid = key.replace("_slide","");
						val = localStorage.getItem(key);
						if (val == -1){
							$("#ai_portal_template_"+rid).toggleClass("slide");
							/// 2025.06.07 박대민 수정
							$("#ai_portal_template_"+rid).children().siblings(".depth1_wrap").slideToggle(0);
						}
					}								
				}else{			
					//mydata 표시하기	
					gptpt.mydata_list = res.data.data;			
					var html = "";
					html += "<div class='mydata_list_wrap'>";
					html += "	<button type='button' id='btn_my_data_setting'>";
					html += "		<div class='mydata_set_btn_wrap' id='my_data_btn'><div class='setting_img'></div><span>DATA Manage</span></div>";
					html += "	</button>";
					html += "	<div class='my_data_list' id='ai_mydata_dis'>";
					html += "	</div>";
					html += "</div>";
					$("#folder_list").append(html);
					for (var i = 0 ; i < res.data.data.length; i++){
						var item = res.data.data[i];
						gptpt.ai_portal_mydata_folder_make(item.folder_name, item.folder_code, i);											
					}	
					gptpt.ai_portal_mydata_folder_make("Share Folder", "share", 100);
					for (var j = 0 ; j < res.data.data2.length; j++){
						var item2 = res.data.data2[j];
						gptpt.ai_portal_mydata_sub_menu_add(item2.folder_code, item2.title, item2.key);	
					}
				}				
				
				$(".data_li").off().on("click", function (e) {										
		            if (e.target.className === 'all_chk all_chkbox_label' || e.target.className === 'all_chkbox_input') {
		                return;
		            } else {
		                if ($(this).siblings(".data_files_wrap").length > 0) {
		                    $(this).closest(".data_ul").toggleClass("slide");		                 
		                    $(this).siblings(".data_files_wrap").slideToggle(200);
		                }
		            }		
		        });				
				
				/* MY DATA 체크박스 이벤트 */				
				// 해당 데이터 내 파일들 체크박스 모두 체크
		        $(".all_chk").off().on("click", function (e) {							
					var folder_code = $(e.target).attr("id").replace("all_box_","");
					var sobj = $("#" + folder_code + "_sub").children();					
					var total = sobj.find(".chkbox_input");
					var checked = sobj.find($(".chkbox_input:checked"));					
		 			for (var i = 0; i < total.length; i++) {
		                if (checked.length < total.length) { //전체체크되어있지 않을 때
		                    total.eq(i).prop("checked", true);		
		                }else if (total.eq(i).prop("checked") === true) {
		                    total.eq(i).prop("checked", false);
		                }
		            }		           
		        });
				
				//데이터 내 단일 파일의 체크박스 체크
		        $(".chkbox_input").off().on("change", function (e) {							
					var folder_code = $(e.target).parent().parent().attr("id").replace("_sub","");				
					var sobj = $(e.target).parent().parent().children();
					var total = sobj.find(".chkbox_input");
					var checked = sobj.find($(".chkbox_input:checked"));	
					var allchk_box = $("#all_box_"+folder_code).prev();		
		            if (total.length === checked.length) {
		        	       allchk_box.prop("checked", true);
		            } else {
		      	          allchk_box.prop("checked", false);
		            }		
		        });		
		        
		        $("#my_data_btn").off().on("click", function(e){
					gptmd.callFrom = "kgpt";
					gptmd.myDataInit();
				});
				
				
			},
			error : function(e){
				gap.error_alert();
			}
		 });
	 },
	 
	 "load_my_request" : function(count){
	 	 if (typeof(count) == "undefined"){
	 	 	count = gptpt.real_max_count;
	 	 }
	 	 
		 var url = root_path + "/api/kgpt/ai_list_person_request.km";
		 var data = JSON.stringify({
		 	"count" : count
		 });
		 $.ajax({
			 type : "POST",
			 url : url,
			 data : data,
			 contentType : "application/json; charset=utf-8",
			 beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			 },
			 success : function(res){				 
				 var fix_html = "";
				 var req_html = "";	
				 //고정 업무 리스트 그리기	
					 
				 if (fix_html != ""){
					 $("#fixed_menu_wrap").empty();
					 $("#fixed_menu_wrap").append(fix_html);
				 }			
				 
				 //요청한 업무 리스트 그리기	 
				 for (var j = 0 ; j < res.data.data2.length; j++){
					 var item = res.data.data2[j];
					 var id = item._id
					 req_html += gptpt.draw_req_html(item.msg, id, item.code, item.roomkey);
					/*
					// 최대 갯수까지만 요청한 업무를 표시한다.
					if( j === gptpt.real_max_count ){
						break;
					}*/
					
				 }				 
				 if (req_html != ""){
					 $("#req_work_menu").empty();
					 $("#req_work_menu").append(req_html);
				 }
				
				gptpt.draggable_kgpt_work_list("more_pjt");
				 
				 //고정 업무 + 요청한 업무가 15개 이상을 경우 ...more 버튼 추가하기
			//	 totalcount = res.data.totalcount;
			//	 var rx = totalcount + i;
				 
				 var rx = res.data.data2.length;
				
				if (rx >= count){
					//...more를 추가한다.
					var html = "";
					html += "	<div class='work_menu_more_btn_wrap'>";
					html += "		<button type='button' id='btn_open_sidebar_more_work_list' class='button_show_more_work_list'>";
					html += "			<span class='btn_inner'>";
					html +=	"				<span class='btn_ico'></span>";
					html += "				<span class='btn_txt'>MORE</span>";
					html += "			</span>";
					html += "		</button>";
					html += "	</div>";
					
					$("#req_work_menu").append(html);
				}
				
				gptpt._event_menu_title_click();	 				 
			 },
			 error : function(e){
				 gap.error_alert();
			 }	 
		 });
	 },
	 
	 
	 //// K-GPT 좌측 업무리스트 더보기 사이드바 그리는 함수
	"draw_sidebar_more_work_list" : function(opt){
		//// opt === pjt : 프로젝트 업무 더보기
		//// opt === req : 요청한 업무 더보기
		
		var html = "";
		
		if( opt === "pjt" ){
			html += "<div id='sidebar_more_work_list' class='pjt'>";
		}
		if( opt === "req" ){
			html += "<div id='sidebar_more_work_list' class='req'>";
		}
		html += "	<div class='inner'>";
		html += "		<div class='title_box_wrap'>";
		html += "			<div class='title_box'>";
		
		if( opt === "pjt" ){
			html += "				<h4 class='title_txt'>"+gap.lang.va184+"</h4>";
		}
		if( opt === "req" ){
			html += "				<h4 class='title_txt'>"+gap.lang.va185+"</h4>";
		}
		html += "				<button type='button' id='btn_close_sidebar_more_work_list' class='btn_close_sidebar'>";
		html += "					<span class='btn_ico'></span>";
		html += "				</button>";
		html += "			</div>";
		
		if( opt === "req" ){
			html += "			<div class='search_box'>";
			html += "				<input type='text' id='input_search_work_list' class='search_work_list_input' placeholder='"+gap.lang.va186+"' spellcheck='false' autocomplete='off'>";
			html += "				<span class='search_ico'></span>";
			html += "				<button type='button' id='btn_cancel_work_list_search' class='search_cancel_ico'></span>";
			html += "			</div>";
		
		}
		html += "		</div>";
		
		html += "		<div class='more_work_list_wrap'>";
		html += "			<div id='more_work_list_ul' class='more_work_list'>";		
		html += "			</div>";
		html += "		</div>";
		html +=	"	</div>";
		html += "</div>";
		
		html = $(html);
		
		if($("#sidebar_more_work_list").length !== 0){
			
			if( opt === "pjt" ){
				if( $("#sidebar_more_work_list").hasClass("req") ){
					$("#sidebar_more_work_list").remove();
					$("#ai_portal_box").append(html);
				}
			} else if( opt === "req" ){
				if( $("#sidebar_more_work_list").hasClass("pjt") ){
					$("#sidebar_more_work_list").remove();
					$("#ai_portal_box").append(html);
				}
			} else {
				return false;
			}
		} else {
			$("#ai_portal_box").append(html);
		}
		
		if( opt === "pjt"){
			
			/// 프로젝트 더보기 리스트 그리기
			gptpt.draw_more_project_list();
			
			

		}
		if( opt === "req"){
			/// 목록 그리기
			gptpt.draw_more_work_list();
		}
		
		/******** 사이드바 열기 ********/ 
		
		/// z-index 조정
		$("#ai_portal_left_content").css({
			///$("#ai_portal_left_content")의 z-index가 $("#sidebar_more_work_list") 보다 높아야함
			"z-index" : 2
		});
		$("#sidebar_more_work_list").css({
			"width" : $("#ai_portal_left_content").outerWidth(),
			"z-index" : 1
		});
		
		html.css({
			"left" : $("#ai_portal_left_content").outerWidth()
		});
		
		html.find(".inner").css({
			"visibility" : "visible",
			"opacity" : 1
		});
		
		// 검색창
		$("#input_search_work_list").on("keypress focus blur", function(e){
			var val = $(this).val();
			
			if(e.type === "focus"){
				$(this).siblings(".search_ico").css({
					"filter" : "brightness(0)"
				});
			}
			if(e.type === "blur"){
				$(this).siblings(".search_ico").css({
					"filter" : "brightness(1)"
				});
			}
			
			if(e.type === "keypress"){
				if(e.keyCode === 13){
				
					if( val.length !== 0 ){					
						/// 돋보기 아이콘 숨김
						$(this).siblings(".search_ico").hide();
						$("#btn_cancel_work_list_search").show();
						$("#more_work_list_ul").empty();
						
						var url = gap.channelserver + "/api/kgpt/gpt_over_list.km";
						var data = JSON.stringify({
							"ky" : gap.userinfo.rinfo.ky,
							"query" : val
						});
						
						gap.ajaxCall(url, data, function(res){
							
							var html = "";
							var items = res.data.data;
							if (items.length == 0){
								empty_list();
							}else{
								for (var i = 0 ; i < items.length; i++){
									var item = items[i];
									html += gptpt.draw_req_html(item.msg, item._id, item.code, item.roomkey);
								}					
								$("#more_work_list_ul").empty();		
								$("#more_work_list_ul").append(html);
								gptpt._event_menu_title_click();
								
								gptpt.draggable_kgpt_work_list("more_work");
							}						
						});				
						
						/// 검색 취소 버튼 클릭 시
						$("#btn_cancel_work_list_search").off().on("click", function(){
							$("#input_search_work_list").val("");
							$("#btn_cancel_work_list_search").hide();
							$(this).siblings(".search_ico").show();
							
							$("#more_work_list_ul").empty();
							gptpt.draw_more_work_list();
						});
					} else {
						// 검색어를 입력하지 않았을 때
						mobiscroll.toast({message:"검색어를 입력해 주세요", color:'danger'});
						return false;
					}
					
				}
			}
			
		});
		
		/******** 사이드바 닫기 ********/
		$("#btn_close_sidebar_more_work_list").off().on("click", function(){

			/// 사이드바의 transition 속도
			var sidebar_transition_duration = parseFloat(html.css("transition-duration")) * 1000;
			
			html.css({
				"left" : "3%",
				"opacity": 0,
				"transition-duration" : "0.75s"
			});
			
			//// 프로젝트 더보기 닫을 때
			if( $("#sidebar_more_work_list").hasClass("pjt") ){
				$("#btn_open_sidebar_pjt_more_work_list").removeClass("active");
			}
			
			//// 요청한 업무 더보기 닫을 때
			if( $("#sidebar_more_work_list").hasClass("req") ){
				$("#btn_open_sidebar_more_work_list").removeClass("active");
			}			
			
			/// 사이드바가 숨겨진 후 제거
			setTimeout(function(){
				$("#sidebar_more_work_list").remove();
			}, sidebar_transition_duration);			
		});
		
		// 검색결과가 없을 때
		function empty_list(){			
			var html = "";			
			html += "<div class='no_result_work_list'>";
			html += "	<div class='empty_ico'></div>";
			html +=	"	<span>일치하는 검색 결과가 없습니다.</span>";
			html += "</div>";			
			$("#more_work_list_ul").append(html);
			gptpt.draggable_kgpt_work_list("more_work");
		}		
	},
	//// K-GPT 좌측 업무리스트 더보기 창 그리는 함수	
	
	/// 프로젝트 더보기 리스트 그리는 함수
	"draw_more_project_list" : function(pjt){
		var url = gptpt.plugin_domain_fast + "project/project_list";
		var data = JSON.stringify({
			"ky" : gap.userinfo.rinfo.ky			
		});	
		
		gap.ajaxCall(url, data, function(res){			
			var items = res[0];			
			var del_pjt_code = "";			
			$("#more_work_list_ul").empty();			
			gptpt.project_list = items;			
			// 표시할 목록이 없을 떄
			if( gptpt.project_list.length === gptpt.front_project_count ){
				del_pjt_code = pjt.children(".menu_li").data("code");				
				$("#btn_close_sidebar_more_work_list").click();
				$("#btn_open_sidebar_pjt_more_work_list").parent(".work_menu_more_btn_wrap").remove();				
				/// 현재 이 프로젝트가 열려 있다면 삭제 시 프로젝트를 닫는다.
				$("#layer_gpt_project[data-key=" + del_pjt_code + "]").remove();				
				return false;
			}
			//프로젝트 정보 표시하기 
			for (var i = gptpt.front_project_count ; i < items.length; i++){				
				var item = items[i];
				/// 목록 그리기
				var pjt_html = gptpt.project_left_menu_item_draw(item);
				$("#more_work_list_ul").append(pjt_html);			
			}			
			gptpt.draggable_kgpt_work_list("more_pjt");			
			$("#more_work_list_ul .title_wrap").off().on("click", function(e){	
				gptpt.close_project_open2();	
				var $this = $(this).parent();
				$("#project_work_menu .menu_li").removeClass("open");
				$("#project_work_menu .menu_li").removeClass("active");
				$("#more_work_list_ul .menu_li").removeClass("open");
				$("#more_work_list_ul .menu_li").removeClass("active");
				$("#req_work_menu .menu_li").removeClass("active");		
				
				gptpt.left_menu_active_disable();		
				$this.addClass("open");
				$this.addClass("active");				
				if ($("#paudio").length > 0){
					$("#paudio")[0].pause();
				}				
				gptpt.draw_layer_gpt_project($this);							
				var chk_children = $(this).siblings(".sub_work_ul").html() !== "";				
				if(chk_children){
					$(this).toggleClass("open");
					$(this).siblings(".sub_work_ul").slideToggle(200);
				}
			});
			
			
			/// 프로젝트 더보기 리스트에 있는 contextmenu
			$("#more_work_list_ul .btn_work_more").off().on("click", function(e){
				$.contextMenu('destroy', "#more_work_list_ul .btn_work_more");
				$.contextMenu({
					selector : "#more_work_list_ul .btn_work_more",
					className: "project_contextmenu",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){						
						if(key === "edit_name"){
							var input = $(this).siblings().find(".input_work_menu_pjt_edit");
							var title = $(this).siblings().find(".menu_title");
							var pjt_id = $(this).closest(".menu_li").data("code");							
							title.hide();							
							input.val( $.trim(title.html()) );
							input.show();
							input.focus();	
						}
						if(key === "delete"){							
							var pjt_html = $(this).closest(".pjt_menu_li_wrap");							
							gptpt.draw_layer_remove_project(pjt_html);							
						}
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
		            	}
					},
					items: {
						"edit_name" : {
							name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_edit'></div><span>"+gap.lang.va228+"</span></div></div>",
							isHtmlName: true
						},
						"delete" : {
							name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_remove'></div><span>"+gap.lang.basic_delete+"</span></div></div>",
							isHtmlName: true
						}
					},
				});
			});
			
			$("#more_work_list_ul .pjt_menu_li_wrap").children(".menu_li").find(".input_work_menu_pjt_edit").off().on("keyup blur", function(e){
			if(e.type === "keyup"){
				if(e.keyCode === 13){
					var title = $(this).siblings(".menu_title");
					var edit_pjt_name = $.trim($(this).val());
					var id = $(this).closest(".menu_li").data("code");					
					var url = gptpt.plugin_domain_fast + "project/rename";
					var data = JSON.stringify({
						"id" : id,
						"name" : edit_pjt_name
					});					
					gap.ajaxCall(url, data, function(res){
						if (res.result == "OK"){
							$(this).hide();
							title.html(edit_pjt_name);
							$("[data-key=" + id + "] #pjt_name").html(edit_pjt_name);						
							title.show();
							$("#search_work").focus();
							
							$("#pjt_name").html(edit_pjt_name);
						}
					});
				}
			}
			if(e.type === "blur"){
				var title = $(this).siblings(".menu_title");
				var edit_pjt_name = $.trim($(this).val());
				var id = $(this).closest(".menu_li").data("code");				
				$(this).hide();
				title.html(edit_pjt_name);
				$("[data-key=" + id + "] #pjt_name").html(edit_pjt_name);				
				title.show();				
				var url = gptpt.plugin_domain_fast + "project/rename";
				var data = JSON.stringify({
					"id" : id,
					"name" : edit_pjt_name
				});					
				gap.ajaxCall(url, data, function(res){
					if (res.result == "OK"){
						$(this).hide();
						title.html(edit_pjt_name);
						$("[data-key=" + id + "] #pjt_name").html(edit_pjt_name);						
						title.show();
						$("#search_work").focus();
						
						$("#pjt_name").html(edit_pjt_name);
					}
				});
			}
		});			
			
		});
	},
		
	//// K-GPT 좌측 업무리스트 더보기 목록 그리는 함수
	"draw_more_work_list" : function(){		
		var url = gap.channelserver + "/api/kgpt/gpt_over_list.km";
		var data = JSON.stringify({
			"ky" : gap.userinfo.rinfo.ky,
			"query" : "",
			"count" : gptpt.real_max_count
		});		
		gap.ajaxCall(url, data, function(res){
			var html = "";
			var items = res.data.data;
			for (var i = 0 ; i < items.length; i++){
				var item = items[i];
				html += gptpt.draw_req_html(item.msg, item._id, item.code, item.roomkey);
			}			
			$("#more_work_list_ul").empty();
			$("#more_work_list_ul").append(html);
			gptpt.draggable_kgpt_work_list("more_work");			
			gptpt._event_menu_title_click();
		});
		
	},
	 
	 "_event_menu_title_click" : function(){	

	 	$("#builder_work_menu .menu_li.builder").off().on("click", function(e){
	 		var gubun = $(e.currentTarget).find(".menu_title").data("code");
	 		
	 		gptpt.left_menu_active_disable();
	 		$(e.currentTarget).addClass("active");
	 		
	 		if (gubun == "report"){
	 			gptpt.close_project_open();
				gptpt.cur_project_code = "";
				gptpt.close_project_open2();
				gptpt.current_code = "";	
				gptpt.cur_project_code = "";
			////////////////// ai 노트북 레이어를 그린다. ////////////	
				
				gbuilder.report_layer_draw(e);
	 		}else if (gubun == "automation"){
	 			mobiscroll.toast({message:gap.lang.sv, color:'info'});
				return false;
	 		}else if (gubun == "agent"){
	 			mobiscroll.toast({message:gap.lang.sv, color:'info'});
				return false;
	 		}
	 	});
	 	
		// 프로젝트 업무 생성버튼
		$("#btn_create_project").off().on("click", function(){
			gptpt.draw_layer_project_create();
		});
		
		/// 요청한 업무 더보기
		 $("#btn_open_sidebar_more_work_list").off().on("click", function(){
			
			$("#btn_open_sidebar_more_work_list").addClass("active");
			$("#btn_open_sidebar_pjt_more_work_list").removeClass("active");			
			//if( $("#sidebar_more_work_list").length === 0 ){				
				gptpt.draw_sidebar_more_work_list("req");
			//}
		});
		
		 $(".req_work_menu .menu_title, .more_work_list .menu_title").off().on("click", function(e){	
		 	gptpt.dropzone_file_delete();			
		 	gptpt.close_project_open2();	
		 	gptpt.show_attach_btn();
			var opp = $(e.currentTarget).next().attr("class");
			if (opp != "btn_work_more"){
				return false;
			}			
			gptpt.close_project_open();
			gptpt.cur_project_code = "";
			var cls = $("#btn_open_ai_notebook").attr("class");
			if (cls.indexOf("active") > -1){
				gptpt.ai_notebook_hide();
			}			
			gptapps.dis_id = "ai_result_dis";		
			gptapps.dis_scroll = "ai_result_dis_top";
			$(".menu_li").removeClass("active");				
			var msg = $(e.currentTarget).text();
			var code = $(e.currentTarget).data("code");			
			var roomkey = $(e.currentTarget).data("roomkey");		
			
			if (roomkey != ""){
				//기존의 데이터를 가져와서 히스토리를 그려준다.
				gptpt.cur_roomkey = roomkey;
				gptpt.current_code = code;
				gptpt.draw_room_history(roomkey);		
				
				gptpt.show_share_btn(roomkey);		
			}else{
				if (code == "it12"){
					gptpt.current_code = code;
				}			
				var checked_list = $("#ai_mydata_dis").find("input:checked");
				if (checked_list.length > 0){
					gptpt.send_ai_request_mydata(msg, checked_list);
				}else{
					gptpt.send_ai_request(msg);
				}	
			}	
			$(e.target).parent().toggleClass("active");
		});

		//고정 업무에서 more버튼 클릭시
		$("#fixed_menu_wrap .btn_work_more").off().on("click", function(e){		
			$.contextMenu('destroy', "#fixed_menu_wrap .btn_work_more");	
			$.contextMenu({
				selector : "#fixed_menu_wrap .btn_work_more",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){					
					gptpt.context_menu_call_req_mng(key, options, $(this).parent().find(".menu_title"));						
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
                	}
				},			
				build : function($trigger, options){
					return {
						items: gptpt.req_info_menu_content("T")
					}
				}
			});			
		});
		
		//요청 업무에서 more버튼 클릭시
		/*$("#req_work_menu .btn_work_more").off().on("click", function(e){
			$.contextMenu('destroy', "#req_work_menu .btn_work_more");	
			$.contextMenu({
				selector : "#req_work_menu .btn_work_more",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){						
					gptpt.context_menu_call_req_mng(key, options, $(this).parent().find(".menu_title"));						
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
                	}
				},			
				build : function($trigger, options){
					return {
						items: gptpt.req_info_menu_content("F")
					}
				}
			});
		});*/
		
		//요청 업무에서 more버튼 클릭시
		$("#req_work_menu .btn_work_more").off().on("click", function(e){		
			let dynamicProjectItems = {};
		//	var list = $("#project_work_menu .menu_li");
			var list = gptpt.project_list;
			for (var i = 0; i < list.length; i++){
				var item = list[i];				
				project_name = item.project_name;
				id =  item._id;
				roomkey = $(e.currentTarget).prev().data("roomkey");				
				dynamicProjectItems["pjt_" + i] = {
					name: "<div class='menu_wrap'><div class='title_wrap'><div class='ico_folder'></div><span>"+project_name+"</span></div></div>",
					isHtmlName: true,
					callback: function() {							
						var target_project_id = this.id;	
						var select_roomkey = this.roomkey;
						if (select_roomkey == ""){
							mobiscroll.toast({message:"프로젝트에 추가할 수 없는 항목입니다.", color:'danger'});
							return false;
						}												
						var url = gptpt.plugin_domain_fast + "project/move_project";
						var data = JSON.stringify({
							"target_project_id" : target_project_id,
							"cur_roomkey" : select_roomkey
						});   
						gap.ajaxCall(url, data, function(res){
							if (res.result == "OK"){								
							//	$(_self).closest(".work_list_li").remove();	 								
								$("#req_work_menu").find("[data-roomkey="+select_roomkey +"]").parent().remove();								  
								gptpt.event_project_work_li();								
								gptpt.project_list_draw();
								gptpt.load_my_request();
							}
						});             	
										 
					}.bind({ "id": id, "roomkey" : roomkey })
				};
			}
		
			$.contextMenu('destroy', "#req_work_menu .btn_work_more");	
			$.contextMenu({
				selector : "#req_work_menu .btn_work_more",
				className: "project_contextmenu",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){						
					gptpt.context_menu_call_req_mng(key, options, $(this).parent().find(".menu_title"));						
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
                	}
				},
				items: {
				//	"move_fix" : {
				//		name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_folder'></div><span>" + gap.lang.rq2 + "</span></div><span class='ico_arrow_right'></span></div>",
				//		isHtmlName: true,
				//	},
					
					"move_to_pjt" : {
						name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_folder'></div><span>"+gap.lang.va230+"</span></div><span class='ico_arrow_right'></span></div>",
						isHtmlName: true,
						items : dynamicProjectItems
						
					},
					
					"delete" : {
						name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_remove'></div><span>"+gap.lang.basic_delete+"</span></div></div>",
						isHtmlName: true
					}
				},
				/*build : function($trigger, options){
					return {
						items: gptpt.req_info_menu_content("F")
					}
				}*/
			});
		});

		
		//more 업무에서 more버튼 클릭시
		/*$("#more_work_list_ul").off().on("click", ".btn_work_more", function(e){
			$.contextMenu({
				selector : "#more_work_list_ul .btn_work_more",
				className: "project_contextmenu",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){						
					gptpt.context_menu_call_req_mng(key, options, $(this).parent().find(".menu_title"));						
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
                	}
				},			
				build : function($trigger, options){
					return {
						items: gptpt.req_info_menu_content("F")
					}
				}
			});
		});*/
		
		/// 요청한 업무 더보기 목록일 때만
		if ( $("#more_work_list_ul").find(".pjt_menu_li_wrap").length === 0 ){			
			$("#more_work_list_ul").off().on("click", ".btn_work_more", function(e){				
				let dynamicProjectItems = {};
			//	var list = $("#project_work_menu .menu_li");
				var list = gptpt.project_list;
				for (var i = 0; i < list.length; i++){
					var item = list[i];					
					project_name = item.project_name;
					id =  item._id;
					roomkey = $(e.currentTarget).prev().data("roomkey");					
					dynamicProjectItems["pjt_" + i] = {
						name: "<div class='menu_wrap'><div class='title_wrap'><div class='ico_folder'></div><span>"+project_name+"</span></div></div>",
						isHtmlName: true,
						callback: function() {	       								
							var target_project_id = this.id;	
							var select_roomkey = this.roomkey;
							if (select_roomkey == ""){
								mobiscroll.toast({message:"프로젝트에 추가할 수 없는 항목입니다.", color:'danger'});
								return false;
							}													
							var url = gptpt.plugin_domain_fast + "project/move_project";
							var data = JSON.stringify({
								"target_project_id" : target_project_id,
								"cur_roomkey" : select_roomkey
							});   	
							gap.ajaxCall(url, data, function(res){
								if (res.result == "OK"){									
								//	$(_self).closest(".work_list_li").remove();	 									
									$("#req_work_menu").find("[data-roomkey="+select_roomkey +"]").parent().remove();									  
									gptpt.event_project_work_li();									
									gptpt.project_list_draw();
									gptpt.load_my_request();
								}
							});             	
											 
						}.bind({ "id": id, "roomkey" : roomkey })
					};
				}
				
				$.contextMenu('destroy', "#more_work_list_ul .btn_work_more");
				$.contextMenu({
					selector : "#more_work_list_ul .btn_work_more",
					className: "project_contextmenu",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){						
						gptpt.context_menu_call_req_mng(key, options, $(this).parent().find(".menu_title"));						
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
	                	}
					},
					items: {
						"move_to_pjt" : {
							name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_folder'></div><span>"+gap.lang.va230+"</span></div><span class='ico_arrow_right'></span></div>",
							isHtmlName: true,
			                items: dynamicProjectItems
						},
						"delete" : {
							name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_remove'></div><span>"+gap.lang.basic_delete+"</span></div></div>",
							isHtmlName: true
						}
					},
					/*build : function($trigger, options){
						return {
							items: gptpt.req_info_menu_content("F")
						}
					}*/
				});
			});		
		}		
	 },	 

	//// 프로젝트 추가하는 레이어 그리는 함수
	"project_list_draw" : function(pjt){
		
		var url = gptpt.plugin_domain_fast + "project/project_list";
		var data = JSON.stringify({
			"ky" : gap.userinfo.rinfo.ky
		});
		
		gap.ajaxCall(url, data, function(res){
			
			var del_pjt_code = "";
			
			if(pjt !== undefined ){
				del_pjt_code = pjt.children(".menu_li").data("code");
				
				/// 프로젝트 삭제 시에도 이 함수가 호출되는데, 만약 삭제하려는 프로젝트 메인이 보여지고 있다면 삭제 시 프로젝트 메인을 닫는다.
				$("#layer_gpt_project[data-key=" + del_pjt_code + "]").remove();
			}

			$("#project_work_menu").empty();
						
			var items = res[0];
			gptpt.project_list = items;
					
			//프로젝트 정보 표시하기
			for (var i = 0; i < items.length; i++){
				/// 최대 3개까지만 표시
				if(i === gptpt.front_project_count){
					gptpt.draw_project_more_btn();
					break;
				}
				var item = items[i];
				var li = gptpt.project_left_menu_item_draw(item);
				$("#project_work_menu").append(li);
			}
			
			//프로젝트 정보 하단에 등록된 아이템 표시하기
			/*
			var items2 = res[1];
			for (var k = 0 ; k < items2.length; k++){
				var item2 = items2[k];
				console.log(item2);
				pc = item2.project_code;
				title = item2.messages1;
				roomkey = item2.roomkey;				
				var html = "<div class='menu_li ui-draggable ui-draggable-handle' style='border-color: transparent; background:#f5f5f5'>";
				html += "<input type='text' class='input_work_menu_pjt_edit' style='display: none;'	spellcheck='false'></input>";
				html += "\t<span class='menu_title' title='"+title+"' id='"+pc+"' data-roomkey='"+roomkey+"'>"+title+"</span>";
				html += "\t<button type='button' class='btn_work_more'><span class='more_img'></span></button>";
				html += "</div>";				
				var obj = $("#project_work_menu").find("[data-code='"+pc+"']");
				if (obj.length > 0){
					//obj.append($(html));
					//var to_ul = obj.children(".sub_work_ul");
					var to_ul = obj.next();
					to_ul.css("display", "none");
					to_ul.append($(html));
					
					if(to_ul.is(":visible")){
					//	obj.addClass("open");
					}
				}
			}			
			gptpt.event_project_sub_work_li();
			*/			
			
			$("#project_work_menu").find(".menu_li").removeClass("active");
			gptpt.event_project_main();
			$("#kgpt_work_container").show();
			
			/**** 현재 해상도에서 스크롤이 생기지 않는 요청한 업무 최대 갯수 계산 *****/
			//var max_height = ( $("#kgpt_work_container").outerHeight() - $("#kgpt_project_menu").outerHeight() - 20 - $("#kgpt_req_work_menu .work_title").outerHeight() - 38 );
	//		var max_height = ( $("#kgpt_work_container").outerHeight() - $("#kgpt_builder_menu").outerHeight() - 20 - $("#kgpt_req_work_menu .work_title").outerHeight() - 38 );
	//		var max_count = Math.round( ( max_height / 42 ) );
			/// 현재 해상도에서 스크롤이 생기지 않는 요청한 업무 최대 갯수
	//		var real_max_count =  Math.floor( (max_height - ( 4 * max_count ) ) / 42);
			/**** 현재 해상도에서 스크롤이 생기지 않는 요청한 업무 최대 갯수 계산 *****/
	//		gptpt.real_max_count = real_max_count;
			
			
			const listContainer = document.querySelector('#kgpt_req_work_menu');
		    const viewportHeight = window.innerHeight;		    
		    // 리스트가 시작되는 위치 (상단 요소들의 높이 합)
		    const topOffset = listContainer.getBoundingClientRect().top;
		    
		    // 하단 안전 마진 (예: 20px)
		    const bottomMargin = 20;		    
		    // 가용 높이 계산
		    const availableHeight = viewportHeight - topOffset - bottomMargin - 130;		    
		    // 표시 가능한 개수 (아이템 높이 40px 기준)
		    const count = Math.floor(availableHeight / 40);
			gptpt.real_max_count = count;
			real_max_count = count;			
						
			//요청한 업무 가져오기
			gptpt.load_my_request(real_max_count);
			
		});		
			
	},
	
	//// 프로젝트 더보기 버튼 그리는 함수
	"draw_project_more_btn" : function(){
		
		/// more 버튼 html		
		var html = "";	
		html += "	<div class='work_menu_more_btn_wrap'>";
		html += "		<button type='button' id='btn_open_sidebar_pjt_more_work_list' class='button_show_more_work_list'>";
		html += "			<span class='btn_inner'>";
		html +=	"				<span class='btn_ico'></span>";
		html += "				<span class='btn_txt'>MORE</span>";
		html += "			</span>";
		html += "		</button>";
		html += "	</div>";							
		$("#project_work_menu").append(html);		
		/// 프로젝트 업무 더보기
		$("#btn_open_sidebar_pjt_more_work_list").off().on("click", function(){
			$("#btn_open_sidebar_more_work_list").removeClass("active");
			$("#btn_open_sidebar_pjt_more_work_list").addClass("active");			
			gptpt.draw_sidebar_more_work_list("pjt");			
		});
		
	},
	
	"project_left_menu_item_draw" : function(item){
		var li = "";
		var pjt_key = item._id;
		var pjt_name = item.project_name;			
		li += "<div class='pjt_menu_li_wrap'>";
		li += "		<div class='menu_li' data-code='" + pjt_key + "' data-name='"+pjt_name+"'>";
		li += "			<div class='title_wrap'>";
		li += "				<span class='folder_ico'></span>";
		li += "			<input type='text' class='input_work_menu_pjt_edit' style='display: none;'	spellcheck='false'></input>";
		li += "				<span class='menu_title' title='" + pjt_name + "' id='' data-roomkey='' data-code='' >" + pjt_name + "</span>";
		li += "			</div>";
		li += "			<button type='button' class='btn_work_more'><span class='more_img'></span></button>";
		li += "		</div>";
		li += "		<div class='sub_work_ul'></div>";
		li += "</div>";		
		li = $(li);		
		return li;		
	},
	
	
	"draw_layer_project_create" : function(){		
		var html = "";		
		html += "<div id='layer_project_create'>";
		html += "	<div class='layer_inner'>";
		html += "		<div class='layer_top'>";
		html += "			<h4 class='layer_title'>"+gap.lang.va179+"</h4>";
		html += "			<button type='button' id='btn_close_layer' class='close_btn'><span class='btn_ico'></span></button>";
		html += "		</div>";
		html += "		<div class=''><input type='text' id='input_project_name' class='project_name_input' placeholder='"+gap.lang.va180+"' autocomplete='off' spellcheck='false'></div>";
		html += "		<div class='guide_wrap'>";
		html +=	"			<span class='guide_ico'></span>";
		html += "			<p>"+gap.lang.va181+" <br><br> "+gap.lang.va182+"</p>";
		html += "		</div>";
		html += "		<div class='btn_wrap'>";
		html += "			<button type='button' id='btn_add_project' class='create_btn'>"+gap.lang.va183+"</button>";
		html += "			<button type='button' class='cancel_btn'>"+gap.lang.Cancel+"</button>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";		
		$("#dark_layer").append(html);		
		var inx = parseInt(gap.maxZindex()) + 1;		
		/// 최상단으로 끌어올린다. (업무방, 채팅 메뉴에서 help 열었을 때 가려지는 문제)
		$("#dark_layer").css("zIndex", inx);
		$("#dark_layer").fadeIn(200);		
		$("#input_project_name").focus();		
		$("#btn_close_layer").off().on("click", function(){
			$("#dark_layer").fadeOut(200, function(){
				$("#dark_layer").empty();
			});	
		});
		
		$("#input_project_name").off().on("keyup", function(e){
			var val = $(this).val();			
			if(val !== ""){
				$("#btn_add_project").addClass("active");				
				if(e.keyCode === 13){
					$("#btn_add_project").click();
				}
			} else {
				$("#btn_add_project").removeClass("active");
			}
		});
		
		///프로젝트 만들기 버튼
		$("#btn_add_project").off().on("click", function(e){
			var self = $(e.currentTarget);
			var pjt_name = $.trim($("#input_project_name").val());			
			var url = gptpt.plugin_domain_fast + "project/project_save";
			var data = JSON.stringify({
				"project_name" : pjt_name,
				"ky" : gap.userinfo.rinfo.ky				
			});			
			gap.ajaxCall(url, data, function(res){
				if(self.hasClass("active")){
					$("#dark_layer").fadeOut(0, function(){
						$("#dark_layer").empty();
					});										
					if (res.result == "OK"){
						var id = res.id;
						//gptpt.draw_layer_gpt_project(id, "add");						
						gptpt.project_list_draw();
					}					
				}				
			});			
		});
		
		$("#layer_project_create .cancel_btn").off().on("click", function(){
			$("#btn_close_layer").click();
		});
		
	},
	
	"draw_layer_gpt_project" : function($this, opt){
		/// 프로젝트를 생성할 때 : opt가 add			
		var project_id = $($this).data("code");
		if (opt == "add"){
			project_id = $this;
		}
		var url = gptpt.plugin_domain_fast + "project/project_info";
		var data = JSON.stringify({
			"code" : project_id
		});
		gap.ajaxCall(url, data, function(res){	
		
			if (res[0].result == "OK"){
				var project_info = res[0].data;
				var project_items = res[1];				
				var pjt_key = project_info._id;
				var pjt_name = project_info.project_name;				
				var html = "";		
				html += "<div id='layer_gpt_project' data-key='" + pjt_key + "'>";
				html += "	<div class='inner' style='height:calc(100% - 130px)'>";				
				/// 레이어 상단
				html += "		<div class='layer_title'>";
				html += "			<h4 id='pjt_name' class='pjt_name'>" + pjt_name + "</h4>";
				html += "			<button type='button' id='edit_pjt_name' class='edit_ico'></button>";
				html += "			<input type='text' id='input_pjt_edit_name' class='edit_pjt_name_input' spellcheck='false' style='display: none;'>";
				html += "		</div>";				
				/// 프로젝트 자료 추가
				html += "		<div id='pjt_info_group_box' class='upload_data_box'>";
				html += "			<div id='open_add_data_layer' class='guide_box_wrap' data-key='"+pjt_key+"'>";
				html += "				<div class='guide_box'>";
				html += "					<div class='guide_title'>"+gap.lang.va191+"</div>";
				html += "					<div class='divide'></div>";
				html += "					<div class='guide_desc'>"+gap.lang.va192+"</div>";
				html += "				</div>";
				html += "				<button type='button' class='upload_data_btn' id='sel_"+pjt_key+"_btn' ><span class='btn_ico'></span></button>";
				html += "				<div id='project_file_upload_pre_"+pjt_key+"' style='display:none'></div>";
				html += "			</div>";
				html += "			<div id='pjt_info_group_card_wrap' class='pjt_info_card_wrap'></div>";
				html += "		</div>";				
				//// 업무 드래그 영역 
				html += "		<div id='work_drag_zone'>";
				html += "			<div id='project_work_drag_guide' class='guide_wrap'>";
				html += "				<span class='guide_ico'></span>";
				html += "				<span class='guide_txt'>"+gap.lang.va193+"</span>";
				html += "			</div>";
				html += "			<div id='work_list_ul' class='work_li_ul show-scrollbar' data-code='"+pjt_key+"'></div>";
				html += "		</div>";				
				html += "	</div>";
				html += "</div>";				
				html = $(html);
				
				$("#layer_gpt_project").remove();
				$("#ai_portal_center_content").append(html);		
				
				//if (typeof(project_info.filelist) != "undefined"){
					gptapps.draw_pjt_data_card(project_info.filelist, project_info.urls, project_info.msg);
				//}							
							
				if (project_items.length > 0){
					$("#project_work_drag_guide").hide();
				}
				
				for (var i = 0; i < project_items.length; i++){				
					var item = project_items[i];
					var work_title = item.messages1;
					var work_sub = item.messages2;
					var work_id = item.project_code;
					var work_roomkey = item.roomkey;					
					var html = gptpt.draw_project_work_li(work_title, work_id, work_sub, work_roomkey);					
				//	$("#kgpt_project_drag_guide").remove();
					$("#work_list_ul").prepend(html);					
				}				
				
				if (opt == "add"){
					var li = "";					
					li += "<div class='pjt_menu_li_wrap'>";
					li += "		<div class='menu_li' data-code='" + pjt_key + "'>";
					li += "			<div class='title_wrap'>";
					li += "				<span class='folder_ico'></span>";
					li += "			<input type='text' class='input_work_menu_pjt_edit' style='display: none;'	spellcheck='false'></input>";
					li += "				<span class='menu_title' title='" + pjt_name + "' id='' data-roomkey='' data-code='' >" + pjt_name + "</span>";
					li += "			</div>";
					li += "			<button type='button' class='btn_work_more'><span class='more_img'></span></button>";
					li += "		</div>";
					li += "		<div class='sub_work_ul'></div>";
					li += "</div>";					
					li = $(li);					
					/// 추가했을 때 3개를 넘어갈 경우
					/// 목록에서 마지막 프로젝트를 제거
					if( $("#project_work_menu .pjt_menu_li_wrap").length === 3 ){
						$("#project_work_menu .pjt_menu_li_wrap").last().remove();
					}
					$("#project_work_menu").prepend(li);
				}
				
				/*
				$("#project_work_menu").find(".menu_li").removeClass("active");
				
				if(opt === "add"){
					$("#project_work_menu").prepend(li);
					li.find(".menu_li").addClass("active");
				} else {
					$this.addClass("active");
				}				
				
				html.children(".inner").css({
					"visibility" : "visible"
				});
				requestAnimationFrame(function(){
					html.children(".inner").css({
						"opacity" : "1"
					});
				});
				*/
				
				$("#layer_gpt_project .inner").css("visibility", "visible");
				requestAnimationFrame(function(){
					$("#layer_gpt_project .inner").css({
						"opacity" : "1"
					});
				});
				
				gptpt.event_project_main();
				gptpt.event_project_work_li();				
			}
			
		});
		
	},
	
	"event_project_main" : function(){		
		$("#work_list_ul .list_title_wrap").off().on("click", function(e){
			var roomkey = $(e.currentTarget).data("roomkey");
			var code = $(e.currentTarget).data("id");			
			/// 클릭한 업무의 타이틀
			var pjt_name = $("#pjt_name").html();		
			gptpt.cur_project_code = code;
			gptpt.first_msg_remove();			
			gptpt.close_project_open("view_work");			
			gptapps.dis_id = "ai_result_dis";		
			gptapps.dis_scroll = "ai_result_dis_top";			
			gptpt.cur_roomkey = roomkey;
			gptpt.current_code = code;		
			gptpt.draw_room_history(roomkey, "pjt", pjt_name);				
			gptpt.show_share_btn(roomkey);						
		});
		
		$("#work_list_ul .btn_more").off().on("click", function(e){
			
		});
	
		
		$("#project_work_menu .btn_work_more").off().on("click", function(e){
			$.contextMenu('destroy', "#project_work_menu .btn_work_more");
			$.contextMenu({
				selector : "#project_work_menu .btn_work_more",
				className: "project_contextmenu",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){						
					if(key === "edit_name"){
						var input = $(this).siblings().find(".input_work_menu_pjt_edit");
						var title = $(this).siblings().find(".menu_title");
						var pjt_id = $(this).closest(".menu_li").data("code");						
						title.hide();						
						input.val( $.trim(title.html()) );
						input.show();
						input.focus();
					}
					if(key === "delete"){							
						var pjt_html = $(this).closest(".pjt_menu_li_wrap");							
						gptpt.draw_layer_remove_project(pjt_html);							
					}
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
	            	}
				},
				items: {
					"edit_name" : {
						name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_edit'></div><span>"+gap.lang.va228+"</span></div></div>",
						isHtmlName: true
					},
					"delete" : {
						name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_remove'></div><span>"+gap.lang.basic_delete+"</span></div></div>",
						isHtmlName: true
					}
				},
			});
		});
		
		$("#project_work_menu .title_wrap").off().on("click", function(e){			
			gptpt.close_project_open2();
			var roomkey = gap.userinfo.rinfo.emp + "_" + new Date().getTime();
			gptpt.set_roomkey(roomkey, "cur_roomkey");
			gptpt.cur_project_code = $(e.currentTarget).parent().data("code");
			$("#ai_result_dis").empty();
			gptpt.hide_attach_btn();
			var $this = $(this).parent();
		
			
			gptpt.left_menu_active_disable();	
			$this.addClass("open");
			$this.addClass("active");			
			if ($("#paudio").length > 0){
				$("#paudio")[0].pause();
			}			
			gptpt.draw_layer_gpt_project($this);						
			var chk_children = $(this).siblings(".sub_work_ul").html() !== "";			
			if(chk_children){
				$(this).toggleClass("open");
				$(this).siblings(".sub_work_ul").slideToggle(200);
			}
		});
		
		
		$("#project_work_menu .pjt_menu_li_wrap").children(".menu_li").find(".input_work_menu_pjt_edit").off().on("keyup blur", function(e){
			var $this = $(this);			
			if(e.type === "keyup"){
				if(e.keyCode === 13){
					var title = $(this).siblings(".menu_title");
					var edit_pjt_name = $.trim($(this).val());
					var id = $(this).closest(".menu_li").data("code");					
					var url = gptpt.plugin_domain_fast + "project/rename";
					var data = JSON.stringify({
						"id" : id,
						"name" : edit_pjt_name
					});					
					
					gap.ajaxCall(url, data, function(res){
						if (res.result == "OK"){
							$this.hide();
							title.html(edit_pjt_name);
							title.attr("title", edit_pjt_name);
							$("[data-key=" + id + "] #pjt_name").html(edit_pjt_name);						
							title.show();
							$("#search_work").focus();							
							$("#pjt_name").html(edit_pjt_name);
						}
					});
				}
			}
			if(e.type === "blur"){
				var title = $(this).siblings(".menu_title");
				var edit_pjt_name = $.trim($(this).val());
				var id = $(this).closest(".menu_li").data("code");				
				var url = gptpt.plugin_domain_fast + "project/rename";
				var data = JSON.stringify({
					"id" : id,
					"name" : edit_pjt_name
				});
				
				gap.ajaxCall(url, data, function(res){
					if (res.result == "OK"){
						$this.hide();
						title.html(edit_pjt_name);
						title.attr("title", edit_pjt_name);
						$("[data-key=" + id + "] #pjt_name").html(edit_pjt_name);						
						title.show();
						$("#search_work").focus();						
						$("#pjt_name").html(edit_pjt_name);
					}
				});
				
				/*$(this).hide();
				title.html(edit_pjt_name);
				$("[data-key=" + id + "] #pjt_name").html(edit_pjt_name);				
				title.show();*/
			}
		});
		
		$("#edit_pjt_name").off().on("click", function(){			
			var val = $("#pjt_name").html();			
			$("#pjt_name").hide();
			$("#edit_pjt_name").hide();			
			$("#input_pjt_edit_name").val(val);
			$("#input_pjt_edit_name").show();
			$("#input_pjt_edit_name").focus();
		});
		
		$("#input_pjt_edit_name").off().on("keyup blur", function(e){			
			var pjt_key = $("#layer_gpt_project").data("key");			
			if(e.type === "keyup"){
				if(e.keyCode === 13){
					var edit_pjt_name = $.trim($("#input_pjt_edit_name").val());
					var menu_work = $("#project_work_menu [data-code=" + pjt_key + "]").find(".menu_title");					
					var url = gptpt.plugin_domain_fast + "project/rename";
					var data = JSON.stringify({
						"id" : pjt_key,
						"name" : edit_pjt_name
					});					
					gap.ajaxCall(url, data, function(res){
						if (res.result == "OK"){							
							$("#input_pjt_edit_name").hide();
							$("#pjt_name").html(edit_pjt_name);
							menu_work.html(edit_pjt_name);
							menu_work.attr("title", edit_pjt_name);
							$("#pjt_name").show();
							$("#edit_pjt_name").show();	
							$("[data-key=" + pjt_key + "] #pjt_name").html(edit_pjt_name);							
							$("#search_work").focus();
						}
					});				
				}
			}
			if(e.type === "blur"){
				var edit_pjt_name = $.trim($("#input_pjt_edit_name").val());
				var menu_work = $("#project_work_menu [data-code=" + pjt_key + "]").find(".menu_title");				
				var url = gptpt.plugin_domain_fast + "project/rename";
				var data = JSON.stringify({
					"id" : pjt_key,
					"name" : edit_pjt_name
				});				
				gap.ajaxCall(url, data, function(res){
					if (res.result == "OK"){						
						$("#input_pjt_edit_name").hide();
						$("#pjt_name").html(edit_pjt_name);
						menu_work.html(edit_pjt_name);
						menu_work.attr("title", edit_pjt_name);
						$("#pjt_name").show();
						$("#edit_pjt_name").show();	
						$("[data-key=" + pjt_key + "] #pjt_name").html(edit_pjt_name);							
						$("#search_work").focus();
					}
				});
			}
		});
		
		$("#open_add_data_layer").off().on("click", function(e){		
			var key = $(e.currentTarget).data("key");
			gptapps.project_file_upload(key);
			gptapps.draw_layer_file_upload("project", key);
		});
		
	},
	
	"draw_layer_remove_project" : function(pjt){		
		var html = "";		
		html += "<div id='layer_remove_project'>";
		html += "	<div class='layer_inner'>";
		html += "		<div class='layer_top'>";
		html += "			<h4 class='layer_title'>"+gap.lang.va194+"</h4>";
		html += "			<button type='button' id='btn_close_layer' class='close_btn'><span class='btn_ico'></span></button>";
		html += "		</div>";
		html += "		<div class='layer_content'><p>"+gap.lang.va195+"</p></div>";
		html += "		<div class='btn_wrap'>";
		html += "			<button type='button' id='btn_remove_pjt' class='btn_red'>"+gap.lang.va196+"</button>";
		html += "			<button type='button' id='btn_cancel' class='cancel_btn'>"+gap.lang.Cancel+"</button>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";		
		$("#dark_layer").append(html);		
		var inx = parseInt(gap.maxZindex()) + 1;		
		/// 최상단으로 끌어올린다. (업무방, 채팅 메뉴에서 help 열었을 때 가려지는 문제)
		$("#dark_layer").css("zIndex", inx);
		$("#dark_layer").fadeIn(200);
				
		$("#btn_close_layer").off().on("click", function(){
			$("#dark_layer").fadeOut(200, function(){
				$("#dark_layer").empty();
			});
		});
		
		$("#btn_remove_pjt").off().on("click", function(){
			$("#btn_close_layer").click();			
			var project_code = $(pjt).find(".menu_li").data("code");			
			var url = gptpt.plugin_domain_fast + "project/project_delete";
			var data = JSON.stringify({
				"code" : project_code
			});
			gap.ajaxCall(url, data, function(res){				
				if (res.result == "OK"){					
				//	pjt.closest(".pjt_menu_li_wrap").remove();				
					if( pjt.closest("#sidebar_more_work_list.pjt").length === 0 ){						
						/// 왼쪽 메뉴에서 프로젝트를 삭제 했을 때
						gptpt.project_list_draw(pjt);						
						/// 더보기가 열려 있을 때 더보가 목록도 업데이트한다.
						if( $("#sidebar_more_work_list.pjt").length !== 0 ){
							gptpt.draw_more_project_list(pjt);
						}
					} else {
						/// 더보기 목록에서 프로젝트를 삭제 했을 때
						gptpt.project_list_draw(pjt);
						gptpt.draw_more_project_list(pjt);
					}
				}
			});			
		});
		$("#btn_cancel").off().on("click", function(){
			$("#btn_close_layer").click();
		});
	},
	
	/// K-GPT 업무리스트 draggable
	"draggable_kgpt_work_list" : function(opt){		
		var dragCounter = 0;		
		var target = "";		
		/// 초기화
		if(opt === "init" || opt === "more_pjt"){
			target = $("#req_work_menu .menu_li");
		}
		/// 드래그하여 프로젝트에 추가한 하위 업무
		if(opt === "pjt_sub"){
			target = $("#project_work_menu .sub_work_ul .menu_li");
		}		
		/// 요청업무 more에 있는 리스트
		if(opt === "more_work"){
			target = $("#more_work_list_ul .menu_li");
		}		
		var $items = target.draggable({
			helper: "clone",
			start: function(event, ui) {
                // 드래그 시작 시 요소를 body의 자식으로 이동
                ui.helper.appendTo('#area_content');
				ui.helper.addClass("dragging");				
            },
			drag: function(event, ui) {				
				//드롭한 위치에 놓인 태그들
	            var droppedElement = document.elementsFromPoint(event.pageX, event.pageY);				
				/*var excludeIds = ["sidebar_more_work_list", "more_work_list_ul"];				
				droppedElement = droppedElement.filter(el => {
					return !excludeIds.includes(el.id);
				});*/
				
				var drag_zone = "";				
				if(opt !== "more_pjt"){
					drag_zone =  $(droppedElement).closest('#project_work_menu .pjt_menu_li_wrap');
				} else {
				/// 프로젝트 더보기 리스트가 열렸을 때
					drag_zone =  $(droppedElement).closest('#project_work_menu .pjt_menu_li_wrap, #more_work_list_ul .pjt_menu_li_wrap');
				}

				/// 프로젝트 메인
	            var project_main_list = $(droppedElement).closest('#layer_gpt_project');

				ui.helper.css({
					"width" : $(this).width()	
				});
				
                // 드래그 중일 때 커서 위치에 맞게 요소 위치 조정
                var offsetParent = ui.helper.offsetParent().offset();
				ui.position.left = event.pageX - offsetParent.left - ui.helper.outerWidth() / 2;
				ui.position.top = event.pageY - offsetParent.top - ui.helper.outerHeight() / 2;				
				
				if (drag_zone.length && !drag_zone.is(ui.helper)) {
					//드래그 한 요소가 프로젝트 업무목록에 드롭되었을 때
					dragCounter = 1;
    				if (dragCounter === 1) {
						drag_zone.children(".menu_li").addClass("before_drop");
					}
				} else {
					dragCounter = 0;
		    		if (dragCounter === 0) {
						$("#project_work_menu .menu_li").removeClass("before_drop");
						
						/// 프로젝트 더보기 리스트 열렸을 때
						if(opt === "more_pjt"){							
							$("#more_work_list_ul .menu_li").removeClass("before_drop");
						}						
					}
				}
				const x = event.clientX;
				const y = event.clientY;				
				const elementsUnderCursor = document.elementsFromPoint(x, y);				
				// 요청한 업무 더보기 목록에 드래그했을 때 추가 방지
				var chk_moresidebar = $(elementsUnderCursor).closest("#sidebar_more_work_list");				
	            if (project_main_list.length && !project_main_list.is(ui.helper) && project_main_list.attr("id") === 'layer_gpt_project' && chk_moresidebar.length === 0) {
					//드래그 중인 요소가 드래그 영역에 도달했을 때					
					if($("#kgpt_project_drag_guide").length === 0){						
						gptpt.draw_project_drag_guide();
					}
				} else {
					//드래그 중인 요소가 드래그 영역에 도달하지 않았을 때
					$("#kgpt_project_drag_guide").remove();
				}				
            },
			stop: function(event, ui){				
				//드롭한 위치에 놓인 태그들
	            var droppedElement = document.elementsFromPoint(event.pageX, event.pageY);
				/** 드래그한 대상을 드롭하고싶은 태그 **/				
				//var drag_zone =  $(droppedElement).closest('#project_work_menu .pjt_menu_li_wrap');				
				var drag_zone = "";				
				if(opt !== "more_pjt"){
					drag_zone =  $(droppedElement).closest('#project_work_menu .pjt_menu_li_wrap');
				} else {
				/// 프로젝트 더보기 리스트가 열렸을 때
					drag_zone =  $(droppedElement).closest('#project_work_menu .pjt_menu_li_wrap, #more_work_list_ul .pjt_menu_li_wrap');
				}				
				/// 프로젝트 메인
	            var project_main_list = $(droppedElement).closest('#layer_gpt_project');
				if (drag_zone.length && !drag_zone.is(ui.helper)) {
					dragCounter = 0;
					//드래그 한 요소가 프로젝트 업무목록에 드롭되었을 때
					$("#project_work_menu .menu_li").removeClass("before_drop");					
					/// 프로젝트 더보기 리스트에 드롭됐을 때
					if(opt === "more_pjt"){							
						$("#more_work_list_ul .menu_li").removeClass("before_drop");
					}					
					var from_li = $(ui.helper.prevObject[0]).removeClass("active");
					var to_ul = drag_zone.children(".sub_work_ul");					
					/// 프로젝트 이름 수정 입력창
					var input = "<input type='text' class='input_work_menu_pjt_edit' style='display: none;'	spellcheck='false'></input>";					
				//	to_ul.prepend(from_li);					
					//드래그하는 오프젝트의 roomkey를 가져와서 해당 값이 없으면 프로젝트에 추가 할 수 없다.
					var rk = $(from_li).find(".menu_title").data("roomkey");					
					if (rk == ""){
						$(ui.helper).remove();
						mobiscroll.toast({message:"프로젝트에 추가할 수 없는 항목입니다.", color:'danger'});
						return false;
					}					
					from_li.remove();
					from_li.prepend(input);			
					
					if(to_ul.is(":visible")){
						drag_zone.children(".menu_li").addClass("open");
					}					
					// K-GPT 메인 좌측 프로젝트 하위의 업무리스트 more 버튼 이벤트
					gptpt.event_project_sub_work_li();					
					requestAnimationFrame(function(){
						gptpt.draggable_kgpt_work_list("pjt_sub");
					});
					
					$("#project_work_drag_guide").css({
						"background" : "#fff"
					});
					
					$("#project_work_drag_guide").hide();
					
					var work_title = ui.helper.find(".menu_title").html();
					var work_id = ui.helper.find(".menu_title").attr("id");
					var work_roomkey = ui.helper.find(".menu_title").data("roomkey");
					var target_id = drag_zone.children(".menu_li").data("code");			
					
					drag_zone.children(".menu_li").click();					
					var html = gptpt.draw_project_work_li(work_title, work_id);					
					$("#kgpt_project_drag_guide").remove();
					$("#work_list_ul").prepend(html);					
					
					//이동한 함목을 해당 프로젝트의 Sub로 등록한다.					
					drag_id = $(ui.helper).children(0).attr("id");
					var url = gptpt.plugin_domain_fast + "project/add_project";
					var data = JSON.stringify({
						"id" : work_roomkey,
						"target" : target_id
					});					
					gap.ajaxCall(url, data, function(res){						
						$("#project_work_menu [data-code=" + target_id + "] .title_wrap").click();						
						if(opt === "more_pjt"){							
							$("#more_work_list_ul [data-code=" + target_id + "] .title_wrap").click();
						}
						gptpt.load_my_request();
					});					
					// 프로젝트 메인 업무리스트 more 버튼 이벤트
					gptpt.event_project_work_li();
				}					
				const x = event.clientX;
				const y = event.clientY;				
				const elementsUnderCursor = document.elementsFromPoint(x, y);				
				// 요청한 업무 더보기 목록에 드래그했을 때 추가 방지
				var chk_moresidebar = $(elementsUnderCursor).closest("#sidebar_more_work_list");				
	            if (project_main_list.length && !project_main_list.is(ui.helper) && project_main_list.attr("id") === 'layer_gpt_project' && chk_moresidebar.length === 0) {
					//드래그 한 요소가 프로젝트 메인 드래그 영역에 드롭되었을 때					
					/// 생성한 프로젝트의 고유 키					
					var pjt_key = $("#layer_gpt_project").data("key");					
					var input = "";
					input += "<input type='text' class='input_work_menu_pjt_edit' style='display: none;'	spellcheck='false'></input>";					
					var from_li = $(ui.helper.prevObject[0]).removeClass("active");
					var to_ul = $("#project_work_menu").find("[data-code=" + pjt_key + "]").siblings(".sub_work_ul");					
					//드래그하는 오프젝트의 roomkey를 가져와서 해당 값이 없으면 프로젝트에 추가 할 수 없다.
					var rk = $(from_li).find(".menu_title").data("roomkey");					
					if (rk == ""){					
						$(ui.helper).remove();
						//$("#project_work_drag_guide").hide();
						$("#kgpt_project_drag_guide").remove();
						mobiscroll.toast({message:"프로젝트에 추가할 수 없는 항목입니다.", color:'danger'});
						return false;
					}					
					from_li.remove();
				//	to_ul.prepend(from_li);
					
				//	from_li.prepend(input);
					
				//	if(to_ul.is(":visible")){
				//		$("#project_work_menu").find("[data-code=" + pjt_key + "]").addClass("open");
				//	}
				//	requestAnimationFrame(function(){
				//		gptpt.draggable_kgpt_work_list("pjt_sub");
				//	});
					
					// K-GPT 메인 좌측 프로젝트 하위의 업무리스트 more 버튼 이벤트
					//gptpt.event_project_sub_work_li();
					
					$("#project_work_drag_guide").hide();
					
				//	var work_title = ui.helper.find(".menu_title").html();
				//	var work_id = ui.helper.find(".menu_title").attr("id");
					
				//	var html = gptpt.draw_project_work_li(work_title, work_id);
					
					$("#kgpt_project_drag_guide").remove();
				//	$("#work_list_ul").prepend(html);				
					
					//이동한 함목을 해당 프로젝트의 Sub로 등록한다.					
					var work_title = ui.helper.find(".menu_title").html();
					var work_id = ui.helper.find(".menu_title").attr("id");
					var work_roomkey = ui.helper.find(".menu_title").data("roomkey");
					var target_id = pjt_key;					
					drag_id = $(ui.helper).children(0).attr("id");
					var url = gptpt.plugin_domain_fast + "project/add_project";
					var data = JSON.stringify({
						"id" : work_roomkey,
						"target" : target_id
					});					
					gap.ajaxCall(url, data, function(res){
						
						if( $("#project_work_menu [data-code=" + pjt_key + "] .title_wrap").length !== 0 ){							
							$("#project_work_menu [data-code=" + pjt_key + "] .title_wrap").click();
						} else {
							$("#more_work_list_ul [data-code=" + pjt_key + "] .title_wrap").click();
						}
						gptpt.load_my_request();
					});					
					// more 버튼 이벤트
					gptpt.event_project_work_li();					
				}				
				gptpt.event_project_main();
			}
		});
		
	},
	
	"event_project_sub_work_li" : function(){		
		$("#project_work_menu .sub_work_ul .input_work_menu_pjt_edit").off().on("keyup blur", function(e){
			if(e.type === "keyup"){
				if(e.keyCode === 13){
					var input = $(this);
					var title = $(this).siblings(".menu_title");					
					var id = $(this).siblings(".menu_title").attr("id");					
					input.hide();
					title.html( $.trim(input.val()) );
					title.attr("title", $.trim(input.val()) );
					title.show();
					$("#work_list_ul .work_list_li[data-id=" + id + "]").find(".detail_title").html( $.trim(input.val()) );
					$("#work_list_ul .work_list_li[data-id=" + id + "]").find(".detail_title").attr("title", $.trim(input.val()) );
				}
			}
			if(e.type === "blur"){
				var input = $(this);
				var title = $(this).siblings(".menu_title");				
				var id = $(this).siblings(".menu_title").attr("id");				
				input.hide();
				title.html( $.trim(input.val()) );
				title.attr("title", $.trim(input.val()) );
				title.show();
				$("#work_list_ul .work_list_li[data-id=" + id + "]").find(".detail_title").html( $.trim(input.val()) );
				$("#work_list_ul .work_list_li[data-id=" + id + "]").find(".detail_title").attr("title", $.trim(input.val()) );
			}
		});
		
		
		$("#project_work_menu .sub_work_ul .btn_work_more").off().on("click", function(){		
			$.contextMenu('destroy', "#project_work_menu .sub_work_ul .btn_work_more");
			$.contextMenu({
				selector : "#project_work_menu .sub_work_ul .btn_work_more",
				className: "project_contextmenu",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){
					if(key === "move_req"){
						var li = $(this).closest(".menu_li");
						var id = li.find(".menu_title").attr("id");						
						li.remove();
						$("#work_list_ul .work_list_li[data-id=" + id + "]").remove();						
						// 요청한 업무로 이동 후 draggable 초기화
						$("#req_work_menu").prepend(li);
						gptpt.draggable_kgpt_work_list("init");						
					}
					if(key === "edit_name"){
						var title = $(this).siblings(".menu_title"); 
						var input = $(this).siblings(".input_work_menu_pjt_edit");						
						title.hide();
						input.val( $.trim(title.html()) );
						input.show().focus();
					}
					if(key === "delete"){
						var ul = $(this).closest(".pjt_menu_li_wrap");						
						//현재 지우려는 업무의 id
						var id = $(this).siblings(".menu_title").attr("id");						
						$(this).closest(".menu_li").remove();
						$("#work_list_ul [data-id=" + id + "]").remove();						
						if( ul.children(".sub_work_ul").children(".menu_li").length === 0 ){
							/// 모든 하위업무가 제거됐을 때 아이콘을 수정한다.
							ul.children(".menu_li").removeClass("open");
							$("#project_work_drag_guide").show();
						}						
					}
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
	            	}
				},
				items: {
					"move_to_pjt" : {
						name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_folder'></div><span>"+gap.lang.va230+"</span></div><span class='ico_arrow_right'></span></div>",
						isHtmlName: true,
						items: dynamicProjectItems
						
					},
					"move_req" : {
						name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_move'></div><span>'" + gptpt.project_name + "' "  + gap.lang.va229+"</span></div></div>",
						isHtmlName: true
					},
					"edit_name" : {
						name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_edit'></div><span>"+gap.lang.va228+"</span></div></div>",
						isHtmlName: true
					},
					"delete" : {
						name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_remove'></div><span>"+gap.lang.basic_delete+"</span></div></div>",
						isHtmlName: true
					}
				},
				/*build : function($trigger, options){
					return {
						
					}
				}*/
			});
		});		
	},
	
	"draw_project_work_li" : function(title, id, sub, roomkey){		
		var html = "";		
		html += "<div class='work_list_li' data-id='" + id + "' data-roomkey='"+roomkey+"'>";
		html += "	<div class='list_title_wrap' data-id='" + id + "' data-roomkey='"+roomkey+"'>";
		html += "		<span class='li_ico'></span>";
		html += "		<div class='work_detail_wrap'>";
		/// 첫 질문 (업무 제목)
		html += "			<div class='detail_title' title='" + title + "'>" + title +"</div>";
		html += "			<input type='text' class='edit_pjt_name_input' style='display: none;' spellcheck='false'>";
		/// 마지막 질문
		html += "			<div class='detail_desc'>"+sub+"</div>";
		html += "		</div>";
		html += "	</div>";
		html += "	<button type='button' class='btn_more'></button>";
		html += "</div>";
		return html;
	},
	
	"event_project_work_li" : function(){	
		$("#work_drag_zone .btn_more").off().on("click", function(e){
			$.contextMenu('destroy', "#work_drag_zone .btn_more");
			let dynamicProjectItems = {};
			gptpt.project_name = $("#pjt_name").text();
			var cur_project_code = $("#layer_gpt_project").data("key");
			var _self = $(e.currentTarget);
			var roomkey = "";
			var id = "";			
			//var list = $("#project_work_menu .menu_li");
			var list = gptpt.project_list;
			for (var i = 0; i < list.length; i++){
				var item = list[i];				
				project_name = item.project_name;
				id =  item._id;
				roomkey = $(e.currentTarget).parent().data("roomkey");
				if (id != cur_project_code){							
					dynamicProjectItems["pjt_" + i] = {
		                name: "<div class='menu_wrap'><div class='title_wrap'><div class='ico_folder'></div><span>"+project_name+"</span></div></div>",
		                isHtmlName: true,
		                callback: function() {	              	
		                	var target_project_id = this.id;	
		                	var select_roomkey = $(_self).closest(".work_list_li").find(".list_title_wrap").data("roomkey");
		                	select_roomkey = this.roomkey;		                	
		                	var url = gptpt.plugin_domain_fast + "project/move_project";
		                	var data = JSON.stringify({
		                		"target_project_id" : target_project_id,
		                		"cur_roomkey" : select_roomkey
		                	});   
		                	gap.ajaxCall(url, data, function(res){
		                		if (res.result == "OK"){									
									gptpt.project_list_draw();									
		                			$(_self).closest(".work_list_li").remove();	   
		                			gptpt.event_project_work_li();     					                			
									if($("#work_list_ul").find(".work_list_li").length === 0){
										$("#project_work_drag_guide").show();
									}
		                		}
		                	});   	
		                                     
		                }.bind({ "id": id, "roomkey" : roomkey })
		            };					 
				}	           
			}	      
		
			$.contextMenu({
				selector : "#work_drag_zone .btn_more",
				className: "project_contextmenu",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){
					if(key === "move_req"){						
						var li = $(this).closest(".work_list_li");
						var id = $(this).closest(".work_list_li").data("id");
						var roomkey = $(this).closest(".work_list_li").data("roomkey");				
						var url = gptpt.plugin_domain_fast + "project/remove_sub_in_project";
						var data = JSON.stringify({
							"cur_roomkey" : roomkey
						});
						gap.ajaxCall(url, data, function(res){
							if (res.result == "OK"){
								li.remove();						
								if($("#work_list_ul").find(".work_list_li").length === 0){
									$("#project_work_drag_guide").show();
								}								
								var menu_li = $("#" + id + "").closest(".menu_li"); 
								menu_li.remove();								
								/*
								///요청한 업무가 그려지지 않은 상태에서 draggable함수가 작동하지않음. 
								
								// 요청한 업무로 이동 후 draggable 초기화

								$("#req_work_menu").prepend(menu_li);
								gptpt.draggable_kgpt_work_list("init");								
								gptpt.load_my_request();								


								//$("#req_work_menu").prepend(menu_li);
								//gptpt.draggable_kgpt_work_list("more_pjt");
								 */
								
								gptpt.load_my_request();
								

							}
						});
					}
					if(key === "edit_name"){
						var input = $(this).closest(".work_list_li").find(".edit_pjt_name_input");
						var title = $(this).closest(".work_list_li").find(".detail_title");
						title.hide();						
						input.val( $.trim(title.html()) );
						input.show();
						input.focus();
					}
					if(key === "delete"){						
						var id = $(this).closest(".work_list_li").data("id");
						var roomkey = $(this).closest(".work_list_li").data("roomkey");
						var ul = $("#" + id).parent(".menu_li").parent(".sub_work_ul");						
						var url = gptpt.plugin_domain_fast + "project/project_sub_delete";
						var data = JSON.stringify({
							"code" : roomkey
						});						
						var obb = this;						
						gap.ajaxCall(url, data, function(res){
							if (res.result == "OK"){
								$("#" + id).parent(".menu_li").remove();
								$(obb).closest(".work_list_li").remove();								
								if( ul.children(".menu_li").length === 0 ){
									/// 모든 하위업무가 제거됐을 때 아이콘을 수정한다.
									ul.siblings(".menu_li").removeClass("open");
								}
								if($("#work_list_ul").find(".work_list_li").length === 0){
									$("#project_work_drag_guide").show();
								}
							}
						});				
					}
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
	            	}
				},
				items: {
					"move_to_pjt" : {
						name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_folder'></div><span>"+gap.lang.va230+"</span></div><span class='ico_arrow_right'></span></div>",
						isHtmlName: true,
						items : dynamicProjectItems,
						
					},
					"move_req" : {
						name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_move'></div><span>'"+gptpt.project_name + "' " +  gap.lang.va229+"</span></div></div>",
						isHtmlName: true
					},
				//	"edit_name" : {
				//		name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_edit'></div><span>이름 바꾸기</span></div></div>",
				//		isHtmlName: true
				//	},
					"delete" : {
						name : "<div class='menu_wrap'><div class='title_wrap'><div class='ico_remove'></div><span>"+gap.lang.basic_delete+"</span></div></div>",
						isHtmlName: true
					}
				},
				/*build : function($trigger, options){
					return {
						
					}
				}*/
			});
		});
		
		$("#work_list_ul .edit_pjt_name_input").off().on("keyup blur", function(e){
			if(e.type === "keyup"){
				if(e.keyCode === 13){
					var title = $(this).siblings(".detail_title");
					var edit_pjt_name = $.trim($(this).val());
					var id = $(this).closest(".work_list_li").data("id");
					
					$(this).hide();
					title.html(edit_pjt_name);
					$("#" + id).html(edit_pjt_name);
					
					title.show();
				}
			}
			if(e.type === "blur"){
				var title = $(this).siblings(".detail_title");
				var edit_pjt_name = $.trim($(this).val());
				var id = $(this).closest(".work_list_li").data("id");
				
				$(this).hide();
				title.html(edit_pjt_name);
				$("#" + id).html(edit_pjt_name);
				title.show();
			}
		});
		
	},
		
	// 프로젝트 메인에 업무 드래그할 때 안내문구 html 그리는 함수
	"draw_project_drag_guide" : function(){		
		var html = "";		
		html += "<div id='kgpt_project_drag_guide'>";
		html += "	<span class='guide_icon'></span>";
		html += "	<div class='guide_txt_wrap'>";
		html += "		<span class='guide_title'>"+gap.lang.va197+"</span>";
		html += "		<span class='guide_desc'>"+gap.lang.va198+"</span>";
		html += "	</div>";
		html += "</div>";		
		$("#layer_gpt_project").append(html);
	},
	
	 "req_info_menu_content" : function(is_fix){
		if (is_fix == "T"){
			var items = {
				"move_req" : {name : gap.lang.rq1},
				"sep01" : "-------------",
				"delete" : {name : gap.lang.basic_delete}
			}			
		}else{
			var items = {
				"move_fix" : {name : gap.lang.rq2},
				"sep01" : "-------------",
				"delete" : {name : gap.lang.basic_delete}
			}
		}
		return items;
	},		
	
	"context_menu_call_req_mng" : function(opt, options, obj){		
		var id = $(obj).attr("id");
		var msg = $(obj).text();
		var roomkey = $(obj).data("roomkey");
		$("#"+ id).parent().remove();
		
		if (typeof(roomkey) == "undefined"){
			roomkey = "";
		}
		
		gptpt.change_task(opt, id, roomkey);
		var rx = gptpt.draw_req_html(msg, id, "", roomkey);		
		if (opt == "move_req"){
			//요청 목록으로 이동하기						
			$("#req_work_menu").prepend(rx).fadeIn('slow');	
			var len = $("#req_work_menu").children().length;
			if (len > 10){
				$("#req_work_menu").children().last().remove();
			}
			gptpt._event_menu_title_click();			
		}else if (opt == "move_fix"){
			//고정 목록으로 이동하기
			$("#fixed_menu_wrap").prepend(rx).fadeIn('slow');	
			var len = $("#fixed_menu_wrap").children().length;
			if (len > 5){
				$("#fixed_menu_wrap").children().last().remove();
			}
			gptpt._event_menu_title_click();			
		}else if (opt == "delete"){
			//항목 삭제
			$("#"+id).parent().remove();
		}
	},
	
	//회의록에서 메뉴 클릭 한 경우
	 "req_info_menu_meeting" : function(is_fix){	
		var items = {
			"delete" : {name : gap.lang.basic_delete},
			"sep01" : "-------------",
			"send_mail" : {name : gap.lang.va199},
			"send_chat" : {name : gap.lang.va200}
		}
		return items;
	},	
	
	//회의록에서 메뉴 선택한 경우
	"meeting_menu_call_req_mng" : function(opt, options, obj){		
		var id = $(obj).data("id");	
		if (opt == "delete"){
			//삭제요청한 경우			
			var url = root_path + "/meeting_content_delete.km";
			var data = JSON.stringify({
				key : id
			});
			$.ajax({
				type : "POST",
				url : url,
				data : data,
				contentType : "application/json; charset=utf-8",
				success : function(res){
					$("#proceeding_list_wrap").find("[data-key='"+id+"']").remove();
				},
				error : function(e){
					gap.error_alert();
				}
			})	
		}else if (opt == "send_mail"){
			//회의록 메일 발송하기
					
		}else if (opt == "send_chat"){
			//회의록 채팅 발송하기

		}
	},
	
	
	"change_task" : function(opt, id, roomkey){	
		var data = JSON.stringify({
			"opt" : opt,
			"id" : id,
			"roomkey" : roomkey
		});
		var url = root_path + "/change_person_ai_request.km";
		$.ajax({
			type : "POST",
			url : url,
			data : data,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				//업무를 고정 /요청 / 삭제 하고난 이후 후처리 없
				if (opt == "delete"){
					gptpt.load_my_request();
				}
			},
			error : function(e){
				gap.error_alert();
			}
		})
	},
	 
	 "draw_req_html" : function(msg, id, code, roomkey){
		 var req_html = "";
	//	 if (roomkey != ""){
	//		req_html += "<div class='menu_li' style='border-color: transparent; background:#f5f5f5'>";
	//	 }else{
			req_html += "<div class='menu_li'>";
	//	 }		 
		 req_html += "	<span class='menu_title' title='"+msg+"' id='"+id+"' data-roomkey='"+roomkey+"' data-code='"+code+"' >" + msg + "</span>";
		 req_html += "	<button type='button' class='btn_work_more'><span class='more_img'></span></button>";
		 req_html += "</div>"; 
		 return req_html;
	 },
	 
	 "draw_request_msg" : function(msg){
		 var mg = gap.textToHtml(msg);
		 var html = "<div class='my_que_wrap'><div class='my_que_txt'>" + mg + "</div></div>";		 
		 if (gptapps.dis_id == "ai_result_dis"){
			gptpt.first_msg_remove();		
		 }		  
		// $("#ai_result_dis").append(html);
		$("#" + gptapps.dis_id).append(html);
		$("#search_work").val("");
	 },
	 
	 "draw_request_msg_with_file" : function(msg, filename){
		 var mg = gap.textToHtml(msg);
		
		 var html = "<div class='my_que_wrap'>";
		 
		 html += "<div style='display:flex; gap:10px'>";
		 for (var i = 0 ; i < filename.length; i++){
		 	html += "<div class='msg_file'><i data-lucide='file' width='14' height='14' style='margin-right:6px;'></i>" + filename[i] + "</div>";
		 }
		 html += "</div>";
		 
		 
		 html += "<div class='my_que_txt'>" + mg + "</div></div>";		 
		 if (gptapps.dis_id == "ai_result_dis"){
			gptpt.first_msg_remove();		
		 }		  
		// $("#ai_result_dis").append(html);
		$("#" + gptapps.dis_id).append(html);
		$("#search_work").val("");
		
		$("#clear-all-btn").hide();
		$("#file-preview-zone").empty();
		lucide.createIcons();
	 },
	 
	 "draw_request_msg_reservation" : function(msg){
		var html = "<div class='my_que_wrap'><div class='my_que_txt'><span class='reservation_meeting_cls'>" + msg + "</span></div></div>";			 
		 gptpt.first_msg_remove();		 
		 $("#"+ gptapps.dis_id).append(html);
		 $("#search_work").val("");
	 },
	 
	  "draw_request_msg_search_schedule" : function(msg){
		var html = "<div class='my_que_wrap'><div class='my_que_txt'><span class='reservation_meeting_cls'>" + msg + "</span></div></div>";		 
		 gptpt.first_msg_remove();		 
		 $("#"+gptapps.dis_id).append(html);
		 $("#search_work").val("");
	 },
	 
	 "first_msg_remove" : function(){		
		if (gptapps.dis_id != "alarm_kgpt_sub"){
			$("#ai_first_msg").hide();
			$("#ai_result_dis_top").show();		
		}
	 },	 
	 
	 "save_person_log" : function(msg, roomkey){	    
		 if (msg == ""){
			 return false;
		 }
		//현재 등록되어 있는 리스트에 동일한 문구가 있는 경우 패스한다.
		/*
		$("#ai_portal_left_content .menu_li").removeClass("active");
		var check_list = $("#ai_portal_left_content .menu_title");
		for (var i = 0 ; i < check_list.length; i++){
			var itm = check_list[i];
			if ($(itm).text() == msg){
				return false;
			}
		}
		*/
		
		//현재 등록된 방정보가 리스트에 있으면 연속해서 입력하는 형태로 추가하지 않는다.	
		var exist = $("#req_work_menu").find("[data-roomkey="+gptpt.cur_roomkey+"]");
		var exist2 = $("#fixed_menu_wrap").find("[data-roomkey="+gptpt.cur_roomkey+"]");
		if (exist.length > 0 || exist2.length > 0){
			return false;
		}	
		
		var url = root_path + "/save_person_ai_request_log.km";	
		var room = "";
		
		if (gap.containString(gptpt.chat_log_save_event, gptpt.current_code)){
			//히스토리를 저장해서 메뉴 클릭시 이전 데이터를 표시한다.
			if (typeof(roomkey) != "undefined"){
				room = roomkey;
			}else{
				room = gptpt.cur_roomkey;
			}			
			gptpt.show_share_btn(room);
		}else{
			gptpt.hide_share_btn();
			return false;
		}		
		var code = gptpt.current_code;
		if (gptpt.current_code != "normal_code" && gptpt.current_code != "" && gptpt.current_code != "it12" && gptpt.current_code != "it20" ){
			//위의 코드로 전송되는 항목만 current_code를 등록한다. 
			//gptpt.current_code = "";
			code = "";
		}		
		
		data = JSON.stringify({
			"ky" : gap.userinfo.rinfo.ky,
			"type" : "",
			"msg" : msg,
			"code" : code,
			"roomkey" : room,
			"project_code" : gptpt.cur_project_code
		});
		$.ajax({
			type : "POST",
			url : url,
			data : data,
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){					
					var id = res.data.id;
					if (gptpt.cur_project_code != ""){						
						return false;
					}
					var rx = gptpt.draw_req_html(msg, id, gptpt.current_code, room);
					$("#req_work_menu").prepend(rx).fadeIn('slow');	
					$("#req_work_menu").children().first().addClass("active");
					var len = $("#req_work_menu").children().length;

					if (len > gptpt.real_max_count){
						$("#req_work_menu").children().last().prev().remove();
					}
					gptpt._event_menu_title_click();					
					gptpt.draggable_kgpt_work_list("init");
				}				
			},
			error : function(e){
				gap.error_alert();
			}
		});			
	 },
	 
	 "show_share_btn" : function(roomkey){
		$("#btn_share_chat_history").fadeIn(2000);
		var url = "https://one.kmslab.com/gptview/" + roomkey;
		$("#btn_share_chat_history").attr("data-url", url);
	 },
	 
	 "hide_share_btn" : function(){
		$("#btn_share_chat_history").hide();
	 },
	 
	 "send_ai_request_mydata_backup" : function(msg, checked_list){				
		$("#search_work").val("");
		 gptpt.current_code = "";			 
		 gptpt.draw_request_msg(msg);			
		var clist = [];
		if (checked_list == "all"){
			var clist_text = "all";
		}else{
			for (var i = 0 ; i < checked_list.length; i++){
				clist.push(checked_list[i].id)
			}
			var clist_text = clist.join(" ");	
		}
					
		var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : msg,
			keys : clist_text,
			call_code : "mydata",
			roomkey : gptpt.cur_roomkey,
			lang : gap.curLang,
			ky : gap.userinfo.rinfo.ky
		});						
		gptpt.first_msg_remove();	
		gptpt.save_person_log(msg);
		gptpt.current_code = "";							
		var cc = "mydata_chat_" + new Date().getTime();		
		gptapps.ai_mydata_response(cc);					
	//	$("#" + cc).parent().remove();
		gap.scroll_move_to_bottom_time("ai_result_dis_top", 1000);		
		/*
		var ssp = new SSE(gptpt.plugin_domain_fast + "apps/pluginMyData", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	            method: 'POST'});
		ssp.addEventListener('open', function(e) {
			$("#" + cc + "_typed").remove();
		});
		
	   	ssp.addEventListener('message', function(e) {	
			//console.log(e.data);
			var pph = e.data.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");			
			if (e.data == "[DONE]"){
				gap.scroll_move_to_bottom_time("ai_result_dis_top", 200);
			}else{
				$("#"+cc).append(pph);
				gap.scroll_move_to_bottom_time("ai_result_dis_top", 1000);
			}	
			///// 답변이 끝나면 질문버튼 CSS 초기화
			$("#btn_work_req").removeClass("stop");		
		});
		ssp.stream();
		
		*/
		
		
		var url = gptpt.plugin_domain_fast + "apps/pluginMyData";
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
			//	$("#" + cc + "_typed").remove();
			console.log(res);
				var ref = "";
				if (res == "ERROR"){
				//	res = gap.lang.va45;
					res = gptapps.add_question(cc, "no");
				}else{
					ref = res.split("-$$$-")[1];
					res = res.split("-$$$-")[0];
					res = res.replace(/[\n\r]/gi, "<br>");					
					gap.scroll_move_to_bottom_time_gpt(1000);						
					res = gptpt.special_change(res);
					res = gptpt.change_markdown_html(res);									
					res += gptapps.add_question(cc, "");
					res += "<div id='"+cc+"_reference'></div>";					
				}				
				var options = {
					strings : [res],
					typeSpeed : 1,
					contentType: 'html',
					onComplete: function(){
						gap.scroll_move_to_bottom_time_gpt(100);
						$("#no_answer_"+cc + " span").off().on("click", function(e){
							var key = $(e.currentTarget).data("key");
							var msg = $("#"+cc).parent().prev().find(".my_que_txt").text();
							if (key == "r1"){
								//인공지능에게 바로 물어보기
								gptpt.draw_ai_response("normal_code", msg);
							}else if (key == "r2"){
								//인터넷 검색후 정리된 답변을 보여주기
								gap.show_loading(gap.lang.va48);
								gptapps.webquery(msg);
							}
						});
						
						//참고 문서를 겁색해서 하단에 표시해 준다.
						var _refurl = root_path + "/refer_search_person.km";
						var _data = JSON.stringify({
							key : ref
						});
						$.ajax({
							type : "POST",
							url : _refurl,
							data : _data,
							contentType : "application/json; charset=utf-8",
							success : function(res){

								if (res.result == "OK"){
									//츨처 정보 표시하기									
									gptpt.reference_draw(res.data.data, cc, "person");
									gap.scroll_move_to_bottom_time_gpt(100);
								}							
							},
							error : function(e){
								gap.error_alert();
							}
						})
					}
				}
				var typed = new Typed("#"+cc, options);				
			},
			error : function(e){
				gap.error_alert();
			}
		});			
	 },
	 
	 
	 "send_ai_request_mydata" : function(msg, checked_list){				
		$("#search_work").val("");
		 gptpt.current_code = "";			 
		 gptpt.draw_request_msg(msg);			
		var clist = [];
		if (checked_list == "all"){
			var clist_text = "all";
		}else{
			for (var i = 0 ; i < checked_list.length; i++){
				clist.push(checked_list[i].id)
			}
			var clist_text = clist.join(" ");	
		}
					
		var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : msg,
			keys : clist_text,
			call_code : "mydata",
			roomkey : gptpt.cur_roomkey,
			lang : gap.curLang,
			ky : gap.userinfo.rinfo.ky
		});						
		gptpt.first_msg_remove();	
		gptpt.save_person_log(msg);
		gptpt.current_code = "";							
		var cc = "mydata_chat_" + new Date().getTime();		
		gptapps.ai_mydata_response(cc);					

		gap.scroll_move_to_bottom_time("ai_result_dis_top", 1000);		
		
		var accumulatedMarkdown = "";
		$("#" + cc).addClass("markdown-body");
		$("#" + cc).parent().css("white-space", "inherit");	
		
		
		
		var ssp = new SSE(gptpt.plugin_domain_fast + "apps/pluginMyData_new", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	            method: 'POST'});
	            
	    ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");	
			ssp.close();		
		});
		
		ssp.addEventListener('open', function(e) {
			//$("#" + cc + "_typed").remove();
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
		gptpt.source.push(ssp);
				
	 },
	 
	 
	 "reference_draw_person" : function(arr, cc){

		var pp = arr.replace("[REF]:","")
		var list = eval(pp);
		
		if (list[0] == ""){
			return false;
		}
		
		var html = "";
		html += "<div class='source_content_wrap'>";
		html += "	<div class='title_wrap'>";
		html += "		<span class='title_ico source'></span>";
		html += "		<span>출처</span>";
		html += "	</div>";
		html += "	<div class='item_wrap'>";
		var url = "";
		for (var i = 0; i < list.length; i++){
			var item = list[i];
			var id = item.split("-ssp-")[0];
			var filename = item.split("-ssp-")[1];	
			var type = item.split("-ssp-")[2];			
			var path = item.split("-ssp-")[3];	
			var ky = item.split("-ssp-")[4];	
			
			var icon_cls = "";
						
			var title = "";
			if (type == "1"){
				icon_cls = "doc"
				title = "Doc";
			}else if (type == "2"){
				icon_cls = "txt"
				title = "TEXT";
			}else{
				icon_cls = "url";
				title = "URL";
				url = path;
			}
		
		
			
			html += "		<div class='item' data-type='"+icon_cls+"' data-filename='"+filename+"' data-ky='"+id+"' data-path='"+path+"' data-emp='"+ky+"'>";
			html += "			<div class='item_title_wrap'>";
			html += "				<span class='item_title_ico "+icon_cls+"'></span>";
			html += "				<span>"+title+"</span>";
			html += "			</div>";
			html += "			<a class='item_link' href='#' style='color:#000000'>"+filename+"</a>";
			html += "		</div>";
			
		}
		html += "	</div>";
		html += "</div>";
		
		$("#" + cc + "_reference").html(html);
		
		$(".source_content_wrap .item").off().on("click", function(e){		
		
			var key = $(e.currentTarget).data("ky");			
			var filename = $(e.currentTarget).data("filename");	
			var type = $(e.currentTarget).data("type");
			var path = $(e.currentTarget).data("path");
			var ky = $(e.currentTarget).data("emp");

			if (type == "url"){
				window.open(path);
			}else if (type == "txt"){
				var __url = root_path + "/refer_info.km";
				var data = JSON.stringify({key:key, type: "person"});
				$.ajax({
					type : "POST",
					url : __url,
					data : data,
					contentType : "application/json; charset=utf-8",
					success : function(res){						
						if (res.result == "OK"){
							var msg = res.data.content;
							gptapps.reference_list_layer_draw(msg);
						}
					},
					error : function(e){
						gap.error_alert();
					}
				})				
			}else if (type == "doc"){
				//파일을 다운로드 받는다.
				
				var down_url = gptpt.kgpt_file_download_server + "dataconfig/file_download_mydata/"+filename+"/"+path + "/" + ky;
				
				//var surl = gap.channelserver + "officeview/ov.jsp?url=" + down_url + "&filename="+filename + "&dockey=" + key + "_" + new Date().getTime();
				var surl = gap.channelserver + "officeview/ov.jsp?url=" + down_url + "&filename="+filename + "&dockey=" + key;
				gap.popup_url_office(surl);	
				
			}
			
			
			/*
			var param = {
				filename: filename,
				key: key
			}
			
			var down_url = gptpt.plugin_domain + 'file_download?' + $.param(param); 
			
			var surl = gap.channelserver + "officeview/ov.jsp?url=" +down_url; // + "&filename="+filename + "&dockey=" + id;
			gap.popup_url_office(surl);	
			*/
			
			//var url = gap.channelserver + "office/" + key + "/admin";
			//gap.popup_url_office(url);	
			return false;
		});		
	},
	 
	 
	 "handleStreamChunk" : function(str, id){
	 	// 일단 본문 영역에 출력
	    $("#chat-output").append(chunk.replace(/\[REF\][\s\S]*/g, "")); // REF 부분은 본문에서 제거
	
	    // REF 블록이 있는지 확인
	    const refMatch = chunk.match(/\[REF\]:\s*\[(.*?)\]/s);
	    if (refMatch) {
	      const refBlock = refMatch[1]; // 내부 값만 추출
	      // 콤마 단위로 분리 후 정리
	      const refs = refBlock.split(",").map(r => r.replace(/['"\s]/g, "").trim());
	
	      // UI에 추가
	      refs.forEach(ref => {
	        // ID-파일명 분리
	        const parts = ref.split("-", 2);
	        let filename = ref;
	        if (parts.length === 2) {
	          filename = parts[1]; // 뒤쪽이 파일명
	        }
	
	        // 중복 방지
	        if ($("#ref-list li[data-ref='" + ref + "']").length === 0) {
	          $("#ref-list").append(
	            `<li data-ref="${ref}">
	               <a href="/files/${ref}" target="_blank">${filename}</a>
	             </li>`
	          );
	        }
	      });
	    }
	 },
	 
	 "send_ai_request_files" : function(msg, opt){				
		$("#search_work").val("");
		gptpt.current_code = opt;			 
		gptpt.draw_request_msg(msg);			
		
		var empno = gap.userinfo.rinfo.emp;
		var arr = [];
		arr.push(empno);
	
		
		var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : msg,
			readers : arr,
			call_code : opt,
			roomkey : gptpt.cur_roomkey,
			lang : gap.curLang,
			ky : gap.userinfo.rinfo.ky
		});						
		gptpt.first_msg_remove();	
		gptpt.save_person_log(msg);
		gptpt.current_code = "";							
		var cc = "files_chat_" + new Date().getTime();		
		gptapps.ai_mydata_response(cc);					
		gap.scroll_move_to_bottom_time("ai_result_dis_top", 1000);		
		
		var accumulatedMarkdown = "";
		$("#" + cc).addClass("markdown-body");
		$("#" + cc).parent().css("white-space", "inherit");	
		
		var ssp = new SSE(gptpt.plugin_domain_fast + "apps/files_search", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	            method: 'POST'});
		
		ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");		
			ssp.close();	
		});
		
		var isREF = false;
	   	ssp.addEventListener('message', function(e) {	
						
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n");	
			//console.log(pph);
			if (e.data == "[DONE]"){
				///// 답변이 끝나면 질문버튼 CSS 초기화
				$("#btn_work_req").removeClass("stop");	
				ssp.close();
				//gap.scroll_move_to_bottom_time("ai_result_dis_top", 200);
			}else if (e.data.indexOf("[REF]") > -1){
				isREF = true;
				
				var rrx = "<div id='"+cc+"_reference'></div>";		
				$("#"+cc).append(rrx);	

				gptpt.reference_draw_files(pph, cc);
			}else{
				if (!isREF){
					if (pph != ""){
						accumulatedMarkdown += pph;
	                	const html = marked.parse(accumulatedMarkdown);
	                	$("#"+cc).html(html);		               
					}
				}			
				//gap.scroll_move_to_bottom_time("ai_result_dis_top", 1000);
			}		
		});
		ssp.stream();
		gptpt.source.push(ssp);
		return false;
			
	 },
	 
	 
	 
	 "reference_draw_files" : function(arr, cc){
		var pp = arr.replace("[REF]:","")
		var list = eval(pp);
		
		if (list[0] == ""){
			return false;
		}
		
		var html = "";
		html += "<div class='source_content_wrap'>";
		html += "	<div class='title_wrap'>";
		html += "		<span class='title_ico source'></span>";
		html += "		<span>출처</span>";
		html += "	</div>";
		html += "	<div class='item_wrap'>";
		var url = "";
		for (var i = 0; i < list.length; i++){
			var item = list[i];
			var id = item.split("-ssp-")[0];
			var filename = item.split("-ssp-")[1];			

			var type = "1";
			if (filename.indexOf(".txt") > -1){
				type = "2";
			}
			var icon_cls = "";

			var title = "";
			if (type == "1"){
				icon_cls = "doc"
				title = "문서";
			}else if (type == "2"){
				icon_cls = "txt"
				title = "TEXT";
			}	
		
		
			
			html += "		<div class='item' data-type='"+icon_cls+"' data-filename='"+filename+"' data-ky='"+id+"'>";
			html += "			<div class='item_title_wrap'>";
			html += "				<span class='item_title_ico "+icon_cls+"'></span>";
			html += "				<span>"+title+"</span>";
			html += "			</div>";
			html += "			<a class='item_link' href='#' style='color:#000000'>"+filename+"</a>";
			html += "		</div>";
			
		}
		html += "	</div>";
		html += "</div>";
		
		$("#" + cc + "_reference").html(html);
		
		$(".source_content_wrap .item").off().on("click", function(e){			
			var key = $(e.currentTarget).data("ky");			
			var url = gap.channelserver + "office/" + key + "/files";
			gap.popup_url_office(url);	
			return false;
		});		
	},
	 
	 
	 "send_ai_request_mydata_mobile" : function(msg, checked_list){			
		 gptpt.current_code = "";			 
		 gptpt.draw_request_msg(msg);	
						
		var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : msg,
			keys : checked_list,
			call_code : "mydata"
		});						
		gptpt.first_msg_remove();	
		gptpt.save_person_log(msg);
		gptpt.current_code = "";			 
				
		var cc = "mydata_chat_" + new Date().getTime();		
		gptapps.ai_mydata_response(cc);				
		
		var url = gptpt.plugin_domain_fast + "apps/pluginMyData";
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
			//	$("#" + cc + "_typed").remove();
			console.log(res);
				var ref = "";
				if (res == "ERROR"){
				//	res = gap.lang.va45;
					res = gptapps.add_question(cc, "no");
				}else{
					ref = res.split("-$$$-")[1];
					res = res.split("-$$$-")[0];
					res = res.replace(/[\n\r]/gi, "<br>");					
					gap.scroll_move_to_bottom_time_gpt(1000);						
					res = gptpt.special_change(res);
					res = gptpt.change_markdown_html(res);									
					res += gptapps.add_question(cc, "");
					res += "<div id='"+cc+"_reference'></div>";					
				}				
				var options = {
					strings : [res],
					typeSpeed : 1,
					contentType: 'html',
					onComplete: function(){
						gap.scroll_move_to_bottom_time_gpt(100);
						$("#no_answer_"+cc + " span").off().on("click", function(e){
							var key = $(e.currentTarget).data("key");
							var msg = $("#"+cc).parent().prev().find(".my_que_txt").text();
							if (key == "r1"){
								//인공지능에게 바로 물어보기
								gptpt.draw_ai_response("normal_code", msg);
							}else if (key == "r2"){
								//인터넷 검색후 정리된 답변을 보여주기
								gap.show_loading(gap.lang.va48);
								gptapps.webquery(msg);
							}
						});
						
						//참고 문서를 겁색해서 하단에 표시해 준다.
						var _refurl = root_path + "/refer_search_person.km";
						var _data = JSON.stringify({
							key : ref
						});
						$.ajax({
							type : "POST",
							url : _refurl,
							data : _data,
							contentType : "application/json; charset=utf-8",
							success : function(res){

								if (res.result == "OK"){
									//츨처 정보 표시하기									
									gptpt.reference_draw(res.data.data, cc, "person");
									gap.scroll_move_to_bottom_time_gpt(100);
								}							
							},
							error : function(e){
								gap.error_alert();
							}
						})
					}
				}
				var typed = new Typed("#"+cc, options);				
			},
			error : function(e){
				gap.error_alert();
			}
		});		
		
	 },

	"reference_draw" : function(list, cc, calltype){

		var html = "";
		html += "<div class='source_content_wrap'>";
		html += "	<div class='title_wrap'>";
		html += "		<span class='title_ico source'></span>";
		html += "		<span>출처</span>";
		html += "	</div>";
		html += "	<div class='item_wrap'>";
		var url = "";
		for (var i = 0; i < list.length; i++){
			var item = list[i];
			var icon_cls = "";
			var type = item.type;
			var title = "";
			if (type == "1"){
				icon_cls = "doc"
				title = "문서";
			}else if (type == "2"){
				icon_cls = "txt"
				title = "TEXT";
			}else if (type == "3"){
				icon_cls = "url";
				title = "URL";
				url = item.url;
			}		
		
			html += "		<div class='item' data-type='"+icon_cls+"' data-url='"+ url+"' data-folder='"+item.upload_path+"' data-key='"+item.key+"' data-filename='"+item.filename+"' data-ky='"+item.ky+"'>";
			html += "			<div class='item_title_wrap'>";
			html += "				<span class='item_title_ico "+icon_cls+"'></span>";
			html += "				<span>"+title+"</span>";
			html += "			</div>";
			html += "			<a class='item_link' href='#'>"+item.filename+"</a>";
	
		//	html += "			<div class='item_desc'>"+gap.HtmlToText(item.summary.replace(/<[^>]*>/g, '').replace(/[\n]/gi,""))+"</div>";
			html += "		</div>";
			
		}
		html += "	</div>";
		html += "</div>";
		
		$("#" + cc + "_reference").html(html);
		
		$(".source_content_wrap .item").off().on("click", function(e){
			
			var type = $(e.currentTarget).data("type");
			var folder = $(e.currentTarget).data("folder");
			var key = $(e.currentTarget).data("key");
			var url = $(e.currentTarget).data("url");
			var ky =  $(e.currentTarget).data("ky");
			var filename  = $(e.currentTarget).data("filename");
			if (type == "url"){
				window.open(url);
			}else if (type == "txt"){
				var __url = root_path + "/refer_info.km";
				var data = JSON.stringify({key:key, type: calltype});
				$.ajax({
					type : "POST",
					url : __url,
					data : data,
					contentType : "application/json; charset=utf-8",
					success : function(res){						
						if (res.result == "OK"){
							var msg = res.data.content;
							gptapps.reference_list_layer_draw(msg);
						}
					},
					error : function(e){
						gap.error_alert();
					}
				})				
			}else if (type == "doc"){
				//파일을 다운로드 받는다.
				if (calltype == "admin"){
					var url = gptpt.plugin_domain_fast + "file_download_admindata?filename="+filename+"&key="+folder;
					location.href = url;
				}else{
					var url = gptpt.plugin_domain_fast + "file_download_mydata?filename="+filename+"&ky="+ky+"&key="+folder;
					location.href = url;
				}			
			}
		});		
	},
	 
	 "special_change" : function(res){
		return res.replace(/&/gi,"&amp;");
	 },
	 
	 "close_project_open" : function(opt){		
		if( opt !== "view_work" ){
			$("#project_work_menu .menu_li").removeClass("open");	
			$("#project_work_menu .menu_li").removeClass("active");
		}		
		$("#layer_gpt_project").hide();		
		$("#btn_go_back_project_main").remove();	
		//gptpt.cur_project_code = "";
		
		
	 },
	 
	 "dropzone_file_delete" : function(){
	 	//입력창에 파일을 추가한 부분을 일괄 제거한다.
		$("#clear-all-btn").hide();
		$("#file-preview-zone").empty();
	 },
	 
	 "close_project_open2" : function(opt){		
		gptpt.cur_project_code = "";
		$("#btn_cancel_deepthink_option_select").click();
		$("#btn_cancel_search_option_select").click();
		$("#btn_select_multiagent_option").removeClass("select");
		//입력창에 파일을 추가한 부분을 일괄 제거한다.
		gptpt.dropzone_file_delete();
		
		if ($("#ai_builder_layer").length > 0){
			$("#ai_builder_layer").remove();
		}
		
	 },
	 
	 "send_ai_request" : async function(msg, code, project_code){	
	 	//현재 이전 전송된 내용이 진행중이면 추가 진행 못하게 막는다.
	 	if ($("#btn_work_req").attr("class") == "stop"){
	 		mobiscroll.toast({message: gap.lang.va301, color:'danger'});
	 		return false;
	 	}
	 	
 
		//웹 검색 조건이 생성되어 있으면 첫번째로 처리한다.
		//gptpt.save_person_log(msg);
		
		gptpt.voice_end();				
		gptpt.close_project_open();		
		gptpt.textarea_height_set();		
		var select_engine_name = $("#select_engine_name").text();
		
		/*
		if (select_engine_name != ""){
			if (select_engine_name == "preplexity"){
				gptapps.search_type = "perplexity";
				gptapps.webquery_stream(msg);
			}else{
				gptapps.search_type = "";
				gptpt.current_code = "it12";			 
				gptpt.draw_request_msg(msg);
				gptapps.query_make(msg);			
				gptpt.save_person_log(msg);
			}
			return false;
		}	
		*/
		
		if ($("#file-preview-zone .dz-processing").length > 0){
			//채팅창에 파일을 선택하고 전송을 클릭한 경우
			$("#search_work").val("");		 
			
			var filename = []
			$("#file-preview-zone .dz-processing .file-name").each(function(index, e){
    			filename.push($(e).text());
			});
			
			gptpt.draw_request_msg_with_file(msg, filename);	
			gptpt.draw_ai_response("normal_code", msg);
					
			gptpt.textarea_height_set();
			
			gptpt.save_person_log(msg);
			return false;
		}

		if ($("#btn_search_option_drowndown").length > 0){
			var isSearch = $("#btn_search_option_drowndown").css("display");
			if (isSearch != "none"){
				//search를 클리한 상태로 이를 우선으로 고려하여 검색을 진행 한다.
			
				var stype = $('#btn_cancel_search_option_select .btn_ico').attr("class").split(" ")[1];
				console.log("stype : " + stype);
				if (stype == "perplexity"){
					gptapps.search_type = "perplexity";
					gptpt.draw_request_msg(msg);	
					gap.scroll_move_to_bottom_time_gpt(200);
					gptapps.webquery_stream(msg);					
					gptpt.textarea_height_set();						
					gptpt.save_person_log(msg);					
				}else if (stype == "websearch"){
					gptapps.search_type = "";	
					//웹 리서치에서 Ai Agent웹 검색으로 전환한다.
					gptpt.current_code = "";								 
					gptpt.draw_request_msg(msg);	
					gap.scroll_move_to_bottom_time_gpt(200);				
					gptapps.normal_chat(msg, "search");			
					gptpt.save_person_log(msg);					
				}else if (stype == "template"){
					//회사 내부 자료 검색하기
					gptapps.search_type = "";
					gptpt.current_code = "it13";			 				
					gptpt.draw_request_msg(msg);			
					gptapps.company_data_chat(msg);	
					gptpt.save_person_log(msg);
					gap.scroll_move_to_bottom_time_gpt(200);	
				}else if (stype == "data"){
					//MyData전체를 대상으로 검색한다.
					gptpt.send_ai_request_mydata(msg, "all");	
					gap.scroll_move_to_bottom_time_gpt(200);	
				//	gptpt.save_person_log(msg);
				}else if (stype == "file"){
					//Files 전체를 대상으로 검색한다.
					gptpt.current_code = "files";
					gptpt.send_ai_request_files(msg, "files");		
				//	gptpt.save_person_log(msg);
					gap.scroll_move_to_bottom_time_gpt(200);
				}else if (stype == "ai_notebook"){
					//ai notebook 통합 검색시
					gptapps.search_type = "";
					gptpt.current_code = "notebook";			 				
					gptpt.draw_request_msg(msg);			
					gptapps.notebook_data_chat(msg);
					
				}else{
					//gap.gAlert(gap.lang.sv);
					mobiscroll.toast({message: gap.lang.sv, color:'info'});
					/*
					gptapps.search_type = "";
					gptpt.current_code = "notebook";			 				
					gptpt.draw_request_msg(msg);			
					gptapps.notebook_data_chat(msg);
					*/
					gap.scroll_move_to_bottom_time_gpt(200);	
				}				
	
				return false;
			}
			
			if ($("#btn_select_multiagent_option").attr("class").indexOf(" select") > -1){
				gptapps.search_type = "";
				gptpt.current_code = "multiagent";			 				
				gptpt.draw_request_msg(msg);	
				gptpt.save_person_log(msg);
				gptapps.multiagnet_options_draw(msg);
				return false;
			}
			
			
		}
		
		//프로젝트가 선택된 상태에서 전송을 요청하면 Filtering없이 해당 Query를 바로 전송한다.
		if (gptpt.cur_project_code != ""){		
			gptpt.draw_request_msg(msg);	
			gptpt.draw_ai_response("normal_code", msg);
			return false;
		}
	
	
		//아래 소스는 특정 업무를 진행하다가 바로 다른 템플릿 업무로 전환하기 위해서 추가로 체크하는 로직이다.
		if (typeof(code) == "undefined" || code == ""){
			var readers = []
			var uinfo = gap.userinfo.rinfo;
			readers.push(uinfo.emp);
			for (var i = 0 ; i < uinfo.adc.split("^").length; i++){
				readers.push(uinfo.adc.split("^")[i])
			}
			var postData = {
				"msg" : msg,
				"readers" : readers
			};					
			if (gptpt.current_code == "mcp"){
			//	gptpt.draw_request_msg(msg);							
			//	gptpt.draw_ai_response("mcp", msg);		
			//	gptpt.textarea_height_set();	
			/*
			}else{
				var r = await $.ajax({
					crossDomain: true,
					type: "POST",
					url : gptpt.plugin_domain_fast + "base/search_code",
					dataType : "json",
					data : JSON.stringify(postData),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success : function(res){							
						if (res.res.length > 0){		
							gptpt.old_code = gptpt.current_code;					
							gptpt.current_code = "";			 
						 	gptpt.draw_request_msg(msg);		
							if (res.res == "mail_search_auto"){
								//메일 검색 바로가기 실행 (사용자 메일 검색 요청을 다이렉트로 했다고 판단되는 경우 처리)
								$("#btn_work_req").removeClass("stop");									
								gptpt.current_code = "mail5";									
								gptapps.search_email_query(msg, gptpt.current_code);			
								gptpt.save_person_log(msg);		
								gap.scroll_move_to_bottom_time_gpt(200);
							}else{
								gptpt.draw_ai_response(res.res, msg);	
								gptpt.textarea_height_set();
							}										
							$("#btn_work_req").removeClass("stop");	
											
						}else{
							
							return "";		
						}							
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				});	
				if (r.res != ""){
					return false;
				}
			*/	
			}	
			
		}else{
			//gptpt.old_code = gptpt.current_code;
			gptpt.current_code = "";				 
		 	gptpt.draw_request_msg(msg);							
			gptpt.draw_ai_response(code, msg);
			
			return false;
		}		
		////////////////////////////////////////////////////////////////////////////////////
		
		 if (gptpt.current_code == "it7"){
			gap.show_loading(gap.lang.va27);
			 //회의실 에약인 경우 추가 정보를 입력해야 한다.
			var today = moment().format("YYYY-MM-DD");
			gptpt.draw_request_msg_reservation(msg);						
			gptapps.reservation_meeting_room(msg, gptpt.current_code);			
			gap.scroll_move_to_bottom_time_gpt(200);	
		 }else if (gptpt.current_code == "it10"){
			//일정 검색 하기 - 사용자가 정보를 입력한 경우			
			gap.show_loading(gap.lang.va38);
			gptpt.draw_request_msg_search_schedule(msg);		
			gptapps.search_schedule(msg, gptpt.current_code);	
			gptpt.save_person_log(msg);		
			gap.scroll_move_to_bottom_time_gpt(200);	
		 }else if (gptpt.current_code == "it12"){
			//웹 사이트 검색 후 요약
			gptpt.draw_request_msg(msg);				
		//	gap.show_loading(gap.lang.va71);
			//gptapps.webquery(msg);	
			//gptapps.webquery_stream(msg);
		//	gptapps.query_make(msg);	
			gptapps.query_make_pl(msg);  //preplx search 활용		
			gptpt.save_person_log(msg);
			gap.scroll_move_to_bottom_time_gpt(200);				
		}else if (gptpt.current_code == "it13"){
			//내부 데이터 검색하는 경우
			gptpt.draw_request_msg(msg);			
			//gptapps.innteraldata_search(msg, gptpt.current_code);		
			gptapps.company_data_chat(msg);	
			gptpt.save_person_log(msg);
			gap.scroll_move_to_bottom_time_gpt(200);	
		}else if (gptpt.current_code == "it14"){
			//마케팅 자료 생
			gptpt.draw_request_msg(msg);			
			//gptapps.innteraldata_search(msg, gptpt.current_code);		
			gptapps.make_marking(msg);	
			gptpt.save_person_log(msg);
			gap.scroll_move_to_bottom_time_gpt(200);	
		}else if (gptpt.current_code == "it14"){
			//리뷰 분석기
			gptpt.draw_request_msg(msg);	
			gptpt.save_person_log(msg);
			gap.scroll_move_to_bottom_time_gpt(200);		
		}else if (gptpt.current_code == "it16"){
			//회의록 작성해줘
			gptpt.draw_request_msg(msg);	
			gptpt.save_person_log(msg);
			gap.scroll_move_to_bottom_time_gpt(200);	
			//gptpt.current_code = "";	
		}else if (gptpt.current_code == "it17"){
			//업로드한 이미지에 대한 질의 내용 전달
			gptpt.draw_request_msg(msg);				
			gptapps.send_image_analyzer(msg);
			//gptpt.current_code = "";	
			gptpt.save_person_log(msg);
			gap.scroll_move_to_bottom_time_gpt(200);	
		}else if (gptpt.current_code == "it19"){
			//URL 요약
			gptpt.draw_request_msg(msg);			
			var cc = "url_summary_chat_" + new Date().getTime();
			gptapps.send_url_summary(msg, cc, true);
			gptpt.save_person_log(msg);
			gap.scroll_move_to_bottom_time_gpt(200);
		}else if (gptpt.current_code == "it20"){
			//podcast 업로드
			mobiscroll.toast({message:gap.lang.va201, color:'danger'});
			return false;
		}else if (gptpt.current_code == "mail5"){			
			gptpt.draw_request_msg_reservation(msg);						
			gptapps.search_email_query(msg, gptpt.current_code);			
			gptpt.save_person_log(msg);		
			gap.scroll_move_to_bottom_time_gpt(200);			
		}else if (gptpt.current_code == "ms01"){
			//M365 메일 검색				
			gap.show_loading(gap.lang.va279);
			gptpt.draw_request_msg_reservation(msg);						
			gptapps.search_email_query(msg, gptpt.current_code);	
			gptpt.save_person_log(msg);		
			gap.scroll_move_to_bottom_time_gpt(200);
		}else if (gptpt.current_code == "ms02"){
			//M365 일정 검색			
			gap.show_loading(gap.lang.va38);
			gptpt.draw_request_msg_search_schedule(msg);		
			gptapps.search_schedule(msg, gptpt.current_code);	
			gptpt.save_person_log(msg);		
			gap.scroll_move_to_bottom_time_gpt(200);	
		}else if (gptpt.current_code == "ms03"){
			//M365 ONE 드라이브 검색		
			gap.show_loading(gap.lang.va153);
			gptpt.draw_request_msg_search_schedule(msg);		
			gptapps.search_onedrive(msg, gptpt.current_code);		
			gptpt.save_person_log(msg);	
			gap.scroll_move_to_bottom_time_gpt(200);
		}else if (gptpt.current_code == "mcp"){
			//MCP 호출시
			gap.show_loading("AI Agent 서버가 응답을 생성하고 있습니다. 잠시 기다려 주시기 바랍니다. ");
			gptpt.draw_request_msg_search_schedule(msg);		
			gptapps.search_mcp(msg, gptpt.current_code);			
			gap.scroll_move_to_bottom_time_gpt(200);
		}else if (gptpt.current_code == "finance02"){
			//영업 실적 분석 			
			gptpt.draw_request_msg(msg);	
			gptapps.salse_analyzer_send(msg);
			gap.scroll_move_to_bottom_time_gpt(200);
		}else if (gptpt.current_code == "hr2"){
			//업무 실적 검색하기			
			gptpt.draw_request_msg(msg);	
			gptapps.search_work_list_prameter(msg);					
			gptpt.gpt_input_focus();
		}else if (gptpt.current_code == "teams"){
			//M365 Teams 데이터 검색하는 경우
			gptpt.draw_request_msg(msg);			
			//gptapps.innteraldata_search(msg, gptpt.current_code);		
			//gptapps.company_data_chat(msg);	
			//gptpt.save_person_log(msg);
			gap.scroll_move_to_bottom_time_gpt(200);
    	}else{
			 //호출한 내용을 개인화 저장한다.			
			 if (msg != ""){	
				 $("#search_work").val("");
				 //gptpt.current_code = "";			 
				 gptpt.draw_request_msg(msg);			 
				//인텐트 필터기로 전송해서 값을 가져온다.
	
				if (gptpt.current_code == "normal_code"){
					//사전 점검에서 이미 체크 했다...
					gptpt.draw_ai_response("normal_code", msg);
					gptpt.textarea_height_set();							
					gptpt.save_person_log(msg);
				}else{
					var readers = []
					var uinfo = gap.userinfo.rinfo;
					readers.push(uinfo.emp);
					for (var i = 0 ; i < uinfo.adc.split("^").length; i++){
						readers.push(uinfo.adc.split("^")[i])
					}
					var postData = {
						"msg" : msg,
						"readers" : readers
					};		
					
					$.ajax({
						crossDomain: true,
						type: "POST",
						url : gptpt.plugin_domain_fast + "base/search_code",
						dataType : "json",
						data : JSON.stringify(postData),
						beforeSend : function(xhr){
							xhr.setRequestHeader("auth", gap.get_auth());
							xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
						},
						success : function(res){
							if (res.res.length > 0){						
								gptpt.draw_ai_response(res.res, msg);
							}else{
								gptpt.draw_ai_response("normal_code", msg);
							}			
							gptpt.textarea_height_set();
							
							gptpt.save_person_log(msg);
						},
						error : function(e){
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					});		
				}
				
					 
			 }else{
				gap.gAlert(gap.lang.va23);
		 	}
		}		 
	 },
	 
	 "draw_ai_response" : function(code, msg){	

		console.log("code : " + code);
		 //인텐트 필터기에서 구해준 코드값을 활용하여 결과 데이터를 표시한다.		
		gptpt.current_code = code; 		
		if (gptpt.old_code == "it20"){
			if (gptpt.current_code != "it20"){
				gptpt.cur_roomkey = gap.userinfo.rinfo.emp + "_" + new Date().getTime();
			}
		}		
		if (code == "mail1"){
			//어제메일 요약해줘
			var st = moment().subtract(1, 'days').startOf('day').format("YYYY.MM.DD");
			var et = moment().subtract(1, 'days').endOf('day').format("YYYY.MM.DD");
			gptapps.summary_email(st, et, code);
		}else if (code == "mail2"){
			//메일 작성
			url = gptpt.mail_domain + "/Memo?openform&opentype=popup";		
			gap.open_subwin(url, "1600", "950", "yes" , "", "yes");
		}else if (code == "mail3"){
			//오늘 메일 요약해줘
			var st = moment().subtract(0, 'days').startOf('day').format("YYYY.MM.DD");
			var et = moment().subtract(0, 'days').endOf('day').format("YYYY.MM.DD");
			gptapps.summary_email(st, et, code);
		}else if (code == "mail4"){
			//읽지 않은 메일 보기
			var st = moment().subtract(0, 'days').startOf('day').format("YYYY.MM.DD");
			var et = moment().subtract(0, 'days').endOf('day').format("YYYY.MM.DD");
			gptapps.summary_email(st, et, code);
		}else if (code == "mail5"){
			//메일 검색 하기
			gptpt.current_code = code;
			gptapps.search_email(code);
		}else if (code == "ms01"){
			//M365 메일 검색 하기
			gptpt.current_code = code;
			gptapps.search_email(code);
		}else if (code == "ms02"){
			//M365 일정 검색 하기
			gptpt.current_code = code;
			gptapps.search_schedule_draw();
		}else if (code == "ms03"){
			//M365 ONE 드라이브 검색
			gptpt.current_code = code;
			gptapps.search_onedrive_draw();
		}else if (code == "mcp"){
			//mcp 호출시
			gptpt.current_code = code;
			gptapps.search_mcp_draw();
		}else if (code == "it2"){
			//오늘의 일정 가져오기		
			var st = moment().subtract(0, 'days').format('YYYYMMDD[T000000Z]');
			var et = moment().subtract(0, 'days').format('YYYYMMDD[T235959Z]');
			gptapps.summary_schedule(st, et, code);
		}else if (code == "it3"){
			//결재 문서 작성
			gptapps.approval_write();
		}else if (code == "it5"){
			//내일 일정 알려줘
			var st = moment().subtract(-1, 'days').format('YYYYMMDD[T000000Z]');
			var et = moment().subtract(-1, 'days').format('YYYYMMDD[T235959Z]');
			gptpt.current_code = code;
			gptapps.summary_schedule(st, et, code);
		}else if (code == "it6"){
			gptapps.approval_wait_list();
		}else if (code == "it4"){
			//연차 등록하기
			gptapps.vacation_year();
		}else if (code == "it7"){
			//회의실 예약 하기
			gptpt.current_code = code;
			gptapps.reservartion_room();			
			//$("#search_work").focus();		
			gptpt.gpt_input_focus();
		}else if (code == "it8"){
			//이번주 일정 보여주기
			var st = moment().startOf('week').format('YYYYMMDD[T000000Z]');
			var et = moment().endOf('week').format('YYYYMMDD[T235959Z]');
			gptapps.summary_schedule(st, et, code);
		}else if (code == "it9"){
			//다주 일정 보여주기
			var st = moment().add(1, 'weeks').startOf('week').format('YYYYMMDD[T000000Z]');
			var et = moment().add(1, 'weeks').endOf('week').format('YYYYMMDD[T235959Z]');
			gptapps.summary_schedule(st, et, code);
		}else if (code == "it10"){
			//일정 검색
			gptpt.current_code = code;
			gptapps.search_schedule_draw();
		}else if (code == "it11"){
			//인사 평가를 실행한다.	
			gptapps.insa_eval();
		}else if (code == "it12"){
			//웹 검색 후 요약
			gptapps.websearch_express();
			//$("#search_work").focus();	
			gptpt.gpt_input_focus();
		}else if (code == "it13"){
			//학습된 회사 자료 검색
			gptpt.current_code = code;
			gptapps.innteraldata_search();
			//$("#search_work").focus();	
			gptpt.gpt_input_focus();
		}else if (code == "it14"){
			//마케팅 자료 만들
			gptpt.current_code = code;
			gptapps.make_marking_dis();
			//$("#search_work").focus();	
			gptpt.gpt_input_focus();		
		}else if (code == "it15"){
			//리뷰 분석기
			//gptpt.current_code = code;
			gptpt.current_code = "";
			gptapps.review_marking_dis();
			//$("#search_work").focus();
			gptpt.gpt_input_focus();
		}else if (code == "it16"){
			//회의록 작성하기
			gptpt.current_code = code;
			gptapps.mark_meeting_summary();
			//$("#search_work").focus();
			gptpt.gpt_input_focus();
		}else if (code == "it17"){
			//이미지 분석하기
			gptpt.current_code = code;
			gptapps.image_analyzer();
			//$("#search_work").focus();
			gptpt.gpt_input_focus();
		}else if (code == "it18"){
			gptapps.start = 0;
			gptapps.query = "";
			gptapps.proceedings_list_layer_draw();
			gptapps.meeting_left_list_draw();
		}else if (code == "it19"){
			gptpt.current_code = code;
			gptapps.mark_url_summary();
		}else if (code == "it20"){
			//podcast
			gptpt.cur_roomkey = gap.userinfo.rinfo.emp + "_" + new Date().getTime();
			gptpt.current_code = code;
			gptapps.podcast_upload();
		}else if (code == "it21"){
			//AI Report
			url = "/v/make";		
			gap.open_subwin(url, "1600", "950", "yes" , "", "yes");
		}else if (gptpt.current_code == "finance02"){
			//영업 실적 분석
			gptpt.current_code = code;
			gptapps.sales_analyze_draw();			
			//$("#search_work").focus();		
			gptpt.gpt_input_focus();
		}else if (code == "hr2"){
			//업무 실적 검색하기
			gptpt.current_code = code;
			gptapps.search_work_list();					
			gptpt.gpt_input_focus();
		}else if (code == "teams"){
			//M365 Teams 채널 데이 검색
			gptpt.current_code = code;
			gptapps.teams_channel_search();
			//$("#search_work").focus();	
			gptpt.gpt_input_focus();
			
		}else{
			if (code == "normal_code"){
				//외부 GPT에 문의하기
				gptapps.normal_chat(msg, "");			
			}else if (code != ""){
				//서비스 준비 중이라고 표시한다.
				gptapps.ai_response_write(gap.lang.va22);				
			}			
		}		
		gap.scroll_move_to_bottom_time_gpt(200);
		gptpt.voice_end();
	 },

	"change_markdown_html" : function(msg){
		if (typeof(msg) == "undefined"){
			return false;
		}
	//	return msg;
		var mm = msg;	
		mm = mm.replace(/###&nbsp;/gi, "### ");
		mm = mm.replace(/####\s(.*?)(?:<br>|$)/g, '<span class="result_title0">$1</span><br>');
		mm = mm.replace(/###\s(.*?)(?:<br>|$)/g, '<span class="result_title1">$1</span><br>');
		mm = mm.replace(/##\s(.*?)(?:<br>|$)/g, '<span class="result_title3">$1</span><br>');
		mm = mm.replace(/#\s(.*?)(?:<br>|$)/g, '<span class="result_title4">$1</span><br>');		
		mm = mm.replace(/\*\*(.*?)\*\*/g, '<span class="result_title2">$1</span>');
		//mm = mm.replace(/#\s(.*?)(?:<br>|$)/g, '<span class="result_title4">$1</span><br>')
		return mm
	},
	
	"change_markdown_html_webgenai" : function(msg){
		if (typeof(msg) == "undefined"){
			return false;
		}
		var mm = msg;				
		mm = mm.replace(/###&nbsp;/gi, "### ");
		mm = mm.replace(/#####\s(.*?)(?:<br>|$)/g, '<span class="result_title3">$1</span><br>');
		mm = mm.replace(/####\s(.*?)(?:<br>|$)/g, '<div class="result_title0">$1</div><br>');
		mm = mm.replace(/###\s(.*?)(?:<br>|$)/g, '<div class="result_title1">$1</div>');
		mm = mm.replace(/##\s(.*?)(?:<br>|$)/g, '<span class="result_title3">$1</span><br>');
		mm = mm.replace(/##&nbsp;(.*?)(?:\n|$)/g, '<span class="result_title3">$1</span>');		
		mm = mm.replace(/#\s(.*?)(?:<br>|$)/g, '<span class="result_title4">$1</span><br>');
		mm = mm.replace(/\*\*(.*?)\*\*/g, '<span class="result_title2">$1</span>');	
		mm = mm.replace(/&lt;/gi, "<").replace(/&gt;/gi,">");
		return mm
	},
	
	"change_markdown_html_webgenai_perplexity" : function(msg){
		if (typeof(msg) == "undefined"){
			return false;
		}
		var mm = msg;		
		mm = mm.replace(/###&nbsp;/gi, "### ");
		mm = mm.replace(/####\s(.*?)(?:<br>|$)/g, '<span class="result_title0">$1</span>');
		mm = mm.replace(/###\s(.*?)(?:<br>|$)/g, '&nbsp;&nbsp;<span class="result_title1">$1</span><br>');
		mm = mm.replace(/##\s(.*?)(?:<br>|$)/g, '<span class="result_title3">$1</span><br>');
		mm = mm.replace(/#\s(.*?)(?:<br>|$)/g, '<span class="result_title4">$1</span><br>');
		mm = mm.replace(/\*\*(.*?)\*\*/g, '<span class="result_title2">$1</span>');				
		mm = mm.replace(/(<div class="result_title1">([\s\S]*?)<\/div>)(\s*<br>\s*){2}/g,'$1');
		return mm
	},
	
	"change_markdown_html_for_meeting_record" : function(msg){
		if (typeof(msg) == "undefined"){
			return false;
		}
		//console.log(msg);
		//msg = msg.replace(/[\n]/gi, "^^")
		var mm = msg;	
		mm = mm.replace(/### /gi, "### ");
		mm = mm.replace(/####\s(.*?)(?:<br>|\n|$)/g, '<span class="result_title0">$1</span><br>');
		mm = mm.replace(/###\s(.*?)(?:<br>|\n|$)/g, '<span class="result_title1">$1</span><br>');
		mm = mm.replace(/##\s(.*?)(?:<br>|\n|$)/g, '<span class="result_title3">$1</span><br>');
		mm = mm.replace(/#\s(.*?)(?:<br>|\n|$)/g, '<span class="result_title4">$1</span><br>');
		mm = mm.replace(/\*\*(.*?)\*\*/g, '<span class="result_title2">$1</span>');		
		return mm
	},	
	
	"textToHtml" : function(str){
		if (!str) return '';
		str = str.replace(/&lt;/gi,"<").replace(/&gt;/gi,">");
		str = str.replace(/&#40;/gi,"(").replace(/&#41;/gi,")");
		str = str.replace(/&#39;/gi,"'");
		str = str.replace(/&amp;/gi,"&");
		str = str.replace(/" "/gi,"&nbsp;");
		return str;
	},
	
	"HtmlToText" : function(str){
		if (!str) return '';
		str = str.replace(/\</gi,"&lt;").replace(/\#/gi,"&#35").replace(/\>/gi,"&gt;");
		str = str.replace(/\(/gi,"&#40;").replace(/\)/gi,"&#41;");
		str = str.replace(/\'/gi,"&\#39;"); //.replace(/\#/gi,"&#35");
		str = str.replace(/&nbsp;/gi, " ");
		return str;
	},
	
	"change_coding_style" : function(cc){
		var tmsg2 = $("#" + cc).html();
		var reg = /```(?:\w+\n)?([\s\S]*?)```/g;
		var match = tmsg2.match(reg);
		
		if (match){
			for (var i = 0 ; i < match.length; i++){					
				var ma = match[i];
				var splitArray = ma.split(/<br>/);
				var p1 = splitArray[0];
				console.log(p1);
				if (splitArray.length > 2) {
		            splitArray = [splitArray[0], splitArray.slice(1).join('<br>')];
		        }
		        var p2 = splitArray[1];
		        var code_html = "<div class='code_style'>";
		        code_html += "	<div class='code_flex'>";
		        code_html += "		<div class='code_title'>" + p1.replace(/^```/, "") + "</div>";
		        code_html += "		<div class='code_copy' data-key='"+cc+"'>copy</div>";
		        code_html += "	</div>";
		        code_html += "	<div class='code_body' id='code_body_"+cc+"'>"
				var mtmp = tmsg2.replace(p1, code_html);
				var pp = p2.replace("```", "</div></div>");
				mtmp = mtmp.replace(p2, pp);
				$("#" + cc).html(mtmp);					
				tmsg2 = mtmp;
			}
		}
	},
	
	"convert_table" : function(cc){		
		var tmsg2 = $("#" + cc).html();
		var reg = /-t-<br>\|&nbsp;[\s\S]*?\|<br>-e-/g;
		var match = tmsg2.match(reg);		
		if (match){
			for (var i = 0 ; i < match.length; i++){
				var tmsg3 = $("#" + cc).html();
				var item = match[i];
				var mp = gptpt.ck_table(item.replace("-t-","").replace("-e-", "").replace(/&nbsp;/gi," ").replace(/\<br\>/gi,"\n"));
			//	var modifiedText = tmsg3.replace("<br>" + item + "<br>", "<span class='markdown_table_css'><table>" + gptpt.textToHtml(mp.html()).replace(/-/gi," ") + "</table></span>");
				var modifiedText = tmsg3.replace(item , "<span class='markdown_table_css'><table>" + gptpt.textToHtml(mp.html()).replace(/-/gi," ") + "</table></span><br>```");
				$("#" + cc).html(modifiedText);	
			}
		}		
	},
	
	"convert_table2" : function(cc){
		//WEB stream에서 호출
		var tmsg2 = $("#" + cc).html();
	//	var reg = /(\|[\s\S]*\|)/g;
		var reg = /<br>\|[\s\S]*?\|<br><br>/g;
		var match = tmsg2.match(reg);
		
		if (match){
			for (var i = 0 ; i < match.length; i++){
				var tmsg3 = $("#" + cc).html();
				var item = match[i];
				var mp = gptpt.ck_table(item.replace(/&nbsp;/gi," ").replace(/\<br\>/gi,"\n"));
			//	var modifiedText = tmsg3.replace("<br>" + item + "<br>", "<span class='markdown_table_css'><table>" + gptpt.textToHtml(mp.html()).replace(/-/gi," ") + "</table></span>");
				var modifiedText = tmsg3.replace(item , "<span class='markdown_table_css'><table>" + gptpt.textToHtml(mp.html()).replace(/-/gi," ") + "</table></span><br>");
				$("#" + cc).html(modifiedText);	
			}
		}			
	},
	
	"convert_table3" : function(cc){
		//WEB stream에서 호출 perplexity //
		var tmsg2 = $("#" + cc).html();
	//	var reg = /(\|[\s\S]*\|)/g;
		var reg = /\|[\s\S]*?\|\<br\>\<br\>/g;
		var match = tmsg2.match(reg);
		
		if (match){
			for (var i = 0 ; i < match.length; i++){
				var tmsg3 = $("#" + cc).html();
				var item = match[i];
				var mp = gptpt.ck_table(item.replace(/&nbsp;/gi," ").replace(/\<br\>/gi,"\n"));
				var modifiedText = tmsg3.replace("<br>" + item + "<br>", "<span class='markdown_table_css'><table>" + gptpt.textToHtml(mp.html()).replace(/-/gi," ") + "</table></span>");
				$("#" + cc).html(modifiedText);	
			}
		}			
	},
	
	"ck_table" : function(markdownTable){
		// Trim whitespace
      markdownTable = markdownTable.trim();

      // Split into lines
      var lines = markdownTable.split('\n').filter(function (line) {
        // Filter out any empty lines (in case of blank lines in the input)
        return line.trim().length > 0;
      });

      if (lines.length < 2) {
        // At minimum, we need header row + separator
        console.warn("Markdown table does not appear to be valid.");
        return $("<div>No valid table found.</div>");
      }

      // First line is the header row
      var headerLine = lines[0];
      // Second line often shows the alignment (e.g., "---|---"), but we won't parse alignment here
      // We'll just skip it if it exists.
      var separatorLine = lines[1];

      // We'll assume the table data starts at line 2 if the second line is the separator
      var dataLinesStartIndex = 2;
      // If the second line isn't a standard separator, treat the second line as a data line
      if (!separatorLine.match(/^(\|\s*[-:]+\s*)+$/)) {
        dataLinesStartIndex = 1;
      }

      // Parse header cells
      var headerCells = headerLine
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);

      // Create table elements
      var $table = $("<table></table>");
      var $thead = $("<thead></thead>");
      var $tbody = $("<tbody></tbody>");
      $table.append($thead).append($tbody);

      // Build the header row
      var $headerRow = $("<tr></tr>");
      headerCells.forEach(function (cell) {
        $headerRow.append($("<th></th>").text(cell));
      });
      $thead.append($headerRow);

      // Build the data rows
      for (var i = dataLinesStartIndex; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line.includes("|--")){
			line = false;
		}
        if (!line) continue; // skip empty lines

/*
        var rowCells = line
          .split('|')
          .map(cell => cell.trim())
          .filter(cell => cell.length > 0);


        var $row = $("<tr></tr>");
        rowCells.forEach(function (cell) {
        	  $row.append($("<td></td>").text(cell));      
          
        });
        
        $tbody.append($row);
  */
          var html = "<tr>";
           var rowCells = line.split('|')
           for (var k = 1 ; k < rowCells.length-1; k++){
				html += "<td>" + rowCells[k] + "</td>";
		   }
		   html += "</tr>";        
        $tbody.append($(html));        
      }
      return $table;
	},
	
	
	"autolink" : function(element){
		var urlPattern = /(https?:\/\/[^\s]+)/g;
		var isCase = false;
		var hm = $(element).html();
		
		if (hm){
			if (hm.indexOf("(http") > -1){
				urlPattern = /\(\s*(https?:\/\/[^\s()]+)\s*\)/g;
				isCase = true;
			}
			//var urlPattern = /\(\s*(https?:\/\/[^\s()]+)\s*\)/g;
	        $(element).html($(element).html().replace(urlPattern, function(url) {
				
				var ourl = url;
				var inx = url.indexOf(")");			
				var turl = "";
				var afterurl = "";
				if (inx > -1){
					turl = url.substring(0,inx);
					afterurl = ourl.substring(inx, ourl.lenght)
				}else if (url.indexOf("<br>") >-1){
					var inx2 = url.indexOf("<br>");
					turl = url.substring(0,inx2);
					afterurl = ourl.substring(inx2, ourl.lenght)
				}else{
					turl = url;
					afterurl = "";
				}
				
				if (isCase){
					turl = turl.substring(1, turl.length);
				}
				//var afterurl = ourl.substring(inx, ourl.lenght)
	            return '<a href="' + turl + '" target="_blank" style="color:#315edd">' + turl + '</a>' + afterurl;
	        }));
		}
		
	},	
	"gpt_input_focus" : function(){
		//하단일 경우와 quick chat 모드일 경우 체크
		if (gptapps.dis_id == "ai_result_dis"){
			$("#search_work").focus();	
		}else{
			$("#alarm_kgpt_msg").focus();	
		}
	},
	
	"main_refresh" : function(){
		$("#"+gptapps.dis_id).empty();		
	},
	
	"chatgpt_stream_start" : function(){
		$("#btn_work_req").addClass("stop");
	},
	
	"chatgpt_stream_end" : function(){
		$("#btn_work_req").removeClass("stop");
	},
	
	"chatgpt_all_close" : function(){		
		$("#btn_work_req").removeClass("stop");
		
		if (gptpt.source.length > 0){
			for (var i = 0 ; i < gptpt.source.length; i++){
				gptpt.source[i].close();
			}
		}
	},
	
	"process_display" : function(msg, id){
		var options = {
			strings : [msg],
			typeSpeed : 50,
			backSpeed : 30,
			loop : true,
			contentType: 'html',
			onComplete: function(){
			}
		}
	 	gptpt.typed = new Typed("#"+id + "_typed", options);
	},
	
	"process_display_object" : function(msg, id){
		var options = {
			strings : [msg],
			typeSpeed : 50,
			backSpeed : 30,
			loop : true,
			contentType: 'html',
			onComplete: function(){
			}
		}
	 	gptpt.typed = new Typed("#" + id, options);
	},
	
	"process_display_remove" : function(id){
		$("#" + id + "_typed").remove();
	},
	
	"sllm" : function(){
		gptpt.use_sllm = "T";
	},
	
	//// 프로젝트 메인으로 되돌아가는 html을 반환하는 함수
	"return_html_btn_show_current_project" : function(pjt_name, pjt_code){		
		var html = "";		
		html += "<button type='button' id='btn_go_back_project_main' class='button_go_back_project_main' data-key='" + pjt_code + "'>";
		html += "	<span class='btn_ico'></span>";
		html += "	<span class='btn_txt'>" + pjt_name + "</span>";
		html += "</button>";		
		return html;
		
	},
	
	"draw_room_history" : function(roomkey, opt, room_name){		
		var url = gap.channelserver + "/api/kgpt/room_history.km";
		var data = JSON.stringify({
			"roomkey" : roomkey
		});
		gap.ajaxCall(url, data, function(res){
			if (res.result == "OK"){		
				if( opt === "pjt" ){
					/// 프로젝트에 있는 업무를 열었을 때					
					var cur_pjt_btn = gptpt.return_html_btn_show_current_project(room_name, gptpt.cur_project_code);					
					$("#btn_go_back_project_main").remove();
					// 프로젝트 메인 화면으로 돌아가는 버튼 추가
					$("#ai_portal_center_content .ai_briefing_btn_wrap").prepend(cur_pjt_btn);					
					$("#btn_go_back_project_main").off().on("click", function(){
						$("#layer_gpt_project").show();
						$(this).remove();
					});					
				}				
				if (res.data == null){
					mobiscroll.toast({message:gap.lang.va177, color:'danger'});
					return false;
				}				
				if (res.data != null && res.data.call_code == "it20"){
					//팟캐스트의 경우 별도 처리한다.					
					var item = res.data.msg;
					var filelist = item.filelist.split("-spl-");
					var urls = item.urls.split("-spl-");
					var filename = item.filename;
					var pd_id = item.pd_id;
					var msg = item.msg;					
					$("#ai_result_dis").empty();
					gptpt.first_msg_remove();	
					gptapps.draw_generating_podcast(filelist, urls, pd_id);					
					$("#dis_"+pd_id+" #podcast_loading_box").remove();					
					var audiohtml = "<audio id='paudio' src='"+gptpt.plugin_domain_fast_podcast + "podcast/data/audio/" + filename+"' preload='auto' controls></audio>";
					$("#dis_"+pd_id+" #paudio_div").append(audiohtml);
					$("#dis_"+pd_id+" #paudio_div").show();
					$("#dis_"+pd_id+" #paudio").audioPlayer();		
				}else{
				
					var msgs = res.data.messages;				 
			 		$("#ai_result_dis").empty();
					for (var i = 0 ; i < msgs.length; i++){
						var item = msgs[i];
						var msg = item.content;						
						if (item.role == "user"){
							if (item.code == "it17"){
								//이미지 분석의 경우 예외처리 한다.
								//상위에 동일한 이미지가 없는 경우만 이미지를 표시한다.						
								var exist = $("#" + gptapps.dis_id).find("[data-image='"+item.filename+"']");							
								if (exist.length == 0){
									var img_url = gptpt.plugin_domain_fast + "apps/file_download_image_analyzer?filename="+item.filename;
									var hm = "<img src='"+img_url+"' style='width:auto; max-width:500px;border-radius:10px;'><br><br>";								
									var cc = "history_chat_image_" + new Date().getTime();
									var pp = "<div id='"+cc+"_image' style='border-top:1px dashed #d3d0d0; padding-top:15px' data-image='"+item.filename+"'></div>"
									$("#" + gptapps.dis_id).append(pp);
									$("#" + cc + "_image").append(hm);
								}					
								//이미지에 대해서 지속적인 질문을 하기 위해서 아래 내용을 설정해서 이미지 질의 요청시 추가로 업로드 하지 않고 이전 이미지를 그대로 사용한다.
							    gptpt.cur_image_file = item.filename;
							}
							
							if (item.file){
								//파일이 포한된 질의 경우 별도 처리하낟.
								gptpt.draw_request_msg_with_file(msg, item.file);
							}else{
								gptpt.draw_request_msg(msg);
							}
													
						}else{
						
							if (item.code == "finance02"){
							
								var cc = "history_chat_" + new Date().getTime() + "_" + i;								
								var date = res.data.created_at.$date;		
							      // 문자열을 정수로 변환 후 moment에 전달
							    var m = moment(parseInt(date, 10)).local();						     
							    var formatted = m.format("YYYY-MM-DD HH:mm");   
							    gptapps.ai_normal_response(cc, formatted);	
							    
							    $("#" + cc + "_typed").remove();
							   
							    $("#"+cc).append("<iframe id='myIframe_"+cc+"' src='' border=0 frameborder=0 style='width:100%;'></iframe>");
							    
							    var html2 = "<div class='btn_wrap' id='dis_html_btn_"+cc+"' >";
								html2 += "	<button type='button' id='btn_save_generate_result_"+cc+"' class='btn_save active'>";
								html2 += "		<span class='btn_inner'>";
								html2 += "			<span class='btn_ico'></span>";
								html2 += "			<span class='btn_name'>"+gap.lang.basic_save+"</span>";
								html2 += "		</span>";
								html2 += "	</button>";
								html2 += "	<button type='button' id='btn_edit_generate_result_"+cc+"' class='btn_edit active' style='display: inline-block;'>";
								html2 += "		<span class='btn_inner'>";
								html2 += "			<span class='btn_ico'></span>";
								html2 += "			<span class='btn_name'>"+gap.lang.va84+"</span>	";
								html2 += "		</span>	";
								html2 += "	</button>";
								html2 += "	<button type='button' id='btn_share_generate_result_"+cc+"' class='btn_share active'>";
								html2 += "		<span class='btn_inner'>";
								html2 += "			<span class='btn_ico'></span>";
								html2 += "			<span class='btn_name'>"+gap.lang.do_share+"</span>";
								html2 += "		</span>";
								html2 += "	</button>";
								html2 += "</div>";			
								$("#"+cc).append(html2);
							    
							    $('#myIframe_' + cc).attr("src", "https://one.kmslab.com/mk/sales/"+ msg);
								$('#myIframe_' + cc).show();							
								$('#myIframe_' + cc).on("load", function() {						
								  var iframe = this;
								  try {
								    var innerDoc = iframe.contentWindow.document;
								    var newHeight = innerDoc.body.scrollHeight || innerDoc.documentElement.scrollHeight;
								   
								    newHeight = newHeight + 90;
								    $(iframe).height(newHeight + "px");
								    
								  } catch (e) {
								  }
								});	
							    
							   $("#"+cc +" .btn_edit").off().on("click", function(e){							   		
									$(e.currentTarget).css({
									"left" : "calc(0% - 1px)"
									});	
									$(this).hide();
									
									var cid = $(e.currentTarget).attr("id").replace("btn_edit_generate_result_","");
									$("#dis_html_btn_" + cid +" #btn_save_generate_result_"+cid).show();
								
									var iframebody = $("#myIframe_"+cid)[0].contentDocument
					 		 		$(iframebody).find("div").attr('contenteditable', 'true');
					 		 		$(iframebody).find("body").css("border", "2px dashed grey");
					 		 				
								});
								$("#"+cc +" .btn_share").off().on("click", function(e){
									var cid = $(e.currentTarget).attr("id").replace("btn_share_generate_result_","");
									var url = $("#myIframe_"+cid)[0].src;
									gptpt.draw_layer_share_chat_history(url);
								});			
								
							//$('#dis_html_btn_' + cc).show();						
								$("#"+cc +" .btn_save").off().on("click", function(e){
									var cid = $(e.currentTarget).attr("id").replace("btn_save_generate_result_","");
									$("#dis_html_btn_" + cid +" #btn_edit_generate_result").css({
										"left" : "120%"
									});	
									var obj = $(this);
									var iframebody = $("#myIframe_"+cid)[0].contentDocument
						 		 	$(iframebody).find("div").removeAttr('contenteditable');
						 		 	$(iframebody).find("body").css("border", "none");
						 		 					 		 	
						 		 	var opp = iframeDoc = $("#myIframe_"+cid).contents();
									var html = fullHtml = iframeDoc.find('html').html();
									html = "<!DOCTYPE html><html lang='ko'>" + html + "</html>";
									
									var px =  $("#myIframe_"+cid)[0].src;
						 		 	var plist = px.split("/");		
						 		 	var path = plist[5] + "/" + plist[6] + "/" + plist[7];
										
									var url = gptpt.plugin_domain_fast + "apps/modify_content_sales";		
									var postData = JSON.stringify({
										"path" : path,
										"html" : html
									});
									$.ajax({
										method : "POST",
										url : url,
										data : postData,
										contentType : "application/json; charset=utf-8",
										success : function(res){
											obj.hide();
											$("#dis_html_btn_" + cid +" #btn_edit_generate_result_"+cid).show();
											var $ifr = $("#myIframe_"+cid)[0];
											
											// 현재 src 값을 그대로 다시 할당 → 브라우저가 강제 reload 수행									
											$ifr.src = $ifr.src;
										},
										error : function(e){
											alert(e);
										}	
									});			
								});	 
							   
							}else{
								if (item.code == "it12"){
									//인공지능 퀵리서치의 경우 별도로 처리한다. 출처 표기 문제
									var cc = "history_chat_" + new Date().getTime() + "_" + i;								
									var date = res.data.created_at.$date;		
								     // 문자열을 정수로 변환 후 moment에 전달
								    var m = moment(parseInt(date, 10)).local();						     
								    var formatted = m.format("YYYY-MM-DD HH:mm");   							
									gptapps.ai_normal_response(cc, formatted);		
									$("#" + cc).addClass("markdown-body");
									$("#" + cc).parent().css("white-space", "inherit");								
									const html = marked.parse(msg);
									$("#"+cc).css("font-size", "1em");							
									$("#"+cc).html(html);
									//debugger;
									//$("#" + cc).append(item.urls.join(" "));
									var htm = "";
									htm = "<div>";
									
									htm += "</div>";
								}else{
									var cc = "history_chat_" + new Date().getTime() + "_" + i;								
									var date = res.data.created_at.$date;		
								      // 문자열을 정수로 변환 후 moment에 전달
								    var m = moment(parseInt(date, 10)).local();						     
								    var formatted = m.format("YYYY-MM-DD HH:mm");   							
									gptapps.ai_normal_response(cc, formatted);		
									$("#" + cc).addClass("markdown-body");
									$("#" + cc).parent().css("white-space", "inherit");								
									const html = marked.parse(msg);
									$("#"+cc).css("font-size", "1em");							
									$("#"+cc).html(html);
								}

							}
							
							if (typeof(item.id) != "undefined" && item.id != ""){
								var id = item.id;
								
								var html = "";
								html += "		<div class='ai_report_box'  >";	
								html += "			<div class='gpt_btn_wrap'>";
								html += "				<button type='button' class='make_ai_graph_btn' data-id='"+id+"'>";
								html += "					<span class='btn_inner'><span class='btn_ico'></span><span>"+gap.lang.va303+"</span></span>";
								html += "				</button>";
								
								html += "				<button type='button' class='make_ai_mindmap_btn' data-id='"+id+"'>";
								html += "					<span class='btn_inner'><span class='btn_ico'></span><span>"+gap.lang.va304+"</span></span>";
								html += "				</button>";
								
								html += "				<button type='button' class='make_ai_report_btn' data-id='"+id+"'>";
								html += "					<span class='btn_inner'><span class='btn_ico'></span><span>"+gap.lang.va259+"</span></span>";
								html += "				</button>";
								html += "			</div>";				
								html += "		</div>";
								
								$("#"+cc).append(html);
								
								$(".ai_report_box .make_ai_report_btn").off().on("click", function(e){
									//리서치 완료된 내용을 보고서 생성하기 창을 띄운다.
									var id = $(e.currentTarget).data("id");
									url = "/v/make/"+id;		
									gap.open_subwin(url, "1600", "950", "yes" , "", "yes");
								});
								
								 $(".ai_report_box .make_ai_graph_btn").off().on("click", function(e){
								 	
									//리서치 완료된 내용을 지식 그래프  창을 띄운다.
									var id = $(e.currentTarget).data("id");					
									gptpt.open_layer("graph", id);
								});
								
								 $(".ai_report_box .make_ai_mindmap_btn").off().on("click", function(e){
								 	
									//리서치 완료된 내용을 마인드 맵 창을 띄운다.
									var id = $(e.currentTarget).data("id");							
									gptpt.open_layer("mindmap", id);
								});
							}
       
						}							
					}					
					$('#ai_result_dis ol > li').css('list-style', 'auto');
					$(".markdown-body").css("padding-left", "10px");					
				//	gap.scroll_move_to_bottom_time_gpt(1000);
				}				
			}
		});
	},
	
	"set_layer_title" : function(title){
		$("#graph_title_text").html(title);
	},

	"open_layer" : function(type, id){
		//type : "mindmap"or "graph", id : 기존 데이터 확인 키, 기존 데이터가 없는 경우 text로 즉석해서 생성하기
		//마인드앱 또는 지식 그래프를 표시하는 레이어 띄우기
	
		var html = "";
		html += "<div id='show_graph_wrap'>";
		html += "	<div id='show_graph_top'>";	
		html += "		<div class='show_graph_top_title' id='graph_title_text'></div>";	
		html += "		<div class='show_graph_top_btn_close'><button type='button' class='button_layer_close'></button></div>";	
		html += "	</div>";
		html += "	<div id='show_graph_content_wrap'>";		
		html += "		<div id='show_graph_content_left'>";
		
		if (type == "graph"){
			html += "			<div id='mindmap_processing'>";
			html += "				<div><img src = '../resource/images/graph.gif'></div>";
			html += "				<div>"+gap.lang.va305+"</div>";
			html += "			</div>";
			
			html += "			<iframe id='graph_iframe' src='../page/map/graph.html?id="+id+"&lang="+gap.curLang+"' style='dispaly:none; width:100%; height:887px !important; border: none'></iframe>";
		}else{
			html += "			<div id='mindmap_processing'>";
			html += "				<div><img src = '../resource/images/mindmap.gif'></div>";
			html += "				<div>"+gap.lang.va306+"</div>";
			html += "			</div>";
			
			html += "			<iframe id='graph_iframe' src='../page/map/map.html?id="+id+"&lang="+gap.curLang+"' style='display:none; width:100%; height:887px !important; border: none'></iframe>";
		}	
		
		html += "		</div>"
		html += "		<div id='show_graph_content_right'>";
		html += "			<button type='button' id='btn_ai_graph_sidebar_toggle'><span class='arrow_img'></span></button>";
		html += "			<div class='graph_content' id='graph_text_draw'></div>";
		html += "			<div class='graph_content_input' id='graph_content_input_textarea_wrap'>";
		
	//	html += "				<textarea class='graph_content_input_textarea'></textarea>";
		html += "				<div class='editable-div' id='editable_div_graph' contenteditable='true' data-placeholder='"+gap.lang.va307+"'></div>";
		
		html += "				<div class='req_btn_box'><button type='button' id='btn_graph_req' class=''><span></span></button></div>";
		html += "			</div>";
			
		html += "		</div>"
		html += "	</div>";
		html += "</div>";
		
		$("#dark_layer_graph").fadeIn(200);
		$("#dark_layer_graph").html(html);
		
		gptpt.right_layer_close($("#btn_ai_graph_sidebar_toggle"));
		
		var iframeHeight = $("#show_graph_content_left").height();
		$("#graph_iframe").css("height", iframeHeight);
		
		var inx = parseInt(gap.maxZindex()) + 1;
		$("#dark_layer_graph").css('z-index', inx).addClass('show-layer');	
		
		$("#show_graph_top .show_graph_top_btn_close").off().on("click", function(e){
			$("#dark_layer_graph").hide();
		});
		
		$("#btn_ai_graph_sidebar_toggle").on("click", function(){
			if ($(this).css("right") == "482px"){
				gptpt.right_layer_close(this);
			}else{
				gptpt.right_layer_open(this);
			}

		});
		
		$("#editable_div_graph").off().on("keypress", function(e){
			if (e.keyCode == 13){				
				$("#btn_graph_req").click();	
			}
		});
		
		$("#btn_graph_req").off().on("click", function(e){
			gptpt.chatgpt_all_close();
			var obj = $("#editable_div_graph");
			var msg = obj.text();
			gptpt.write_response(msg, id, "call");
			obj.text("");
			obj.focus();
		});
	},
	
	"show_mind_map" : function(){
		$("#mindmap_processing").hide();
		$("#graph_iframe").show();
	},
	
	"write_response" : function(str, id, type){

		$("#graph_text_draw").empty();
		var obj = $("#btn_ai_graph_sidebar_toggle");
		gptpt.right_layer_open(obj);
		$("#show_graph_content_right").show();
		$("#graph_text_draw").show();
		$("#graph_content_input_textarea_wrap").show();
		
		var msg = "";
		if (type == "call"){
			var msg = str;
		}else{
			var msg = str+ gap.lang.va308;
		}
		
		var html = "<div class='graph_question_wrap'><div class='graph_question'>"+msg+"</div></div>";
		$("#graph_text_draw").append(html);
		
		gptpt.write_llm_reponse(msg, id);
	},
	
	"write_llm_reponse" : function(msg, id){
		var cc = "normal_chat_" + new Date().getTime();		
		
		//var cc = "graph_text_draw";
		
		 var postData = JSON.stringify({
			word : msg,			
			lang : gap.curLang,
			id : id
		});			
				
		$("#" + cc).parent().remove();
				
		//내부 자료에서 검색이 되지 않아 LLM에 질문한다.
		gptapps.ai_normal_response_graph(cc);				
		var method = "pluginNormal_Graph";			
		var ssp = new SSE(gptpt.plugin_domain_fast + "apps/"+method, {headers: {'Content-Type': 'application/json; charset=utf-8'},
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
	   	ssp.addEventListener('message', function(e) {	
			//console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n"); //.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");			
			if (e.data == "[DONE]"){				
				///// 답변이 끝나면 질문버튼 CSS 초기화
				$("#"+cc).find("img").show();
				$("#btn_work_req").removeClass("stop");				
				//gptapps.write_btns_event(cc);		

				ssp.close();
        		return;							
			}else{						
				if (e.data != "" && loading_bar){				
					loading_bar = false;
					$("#" + cc + "_typed").remove();	
				}		
				if (pph != ""){
					accumulatedMarkdown += pph;
                	const html = marked.parse(accumulatedMarkdown);
                	$("#"+cc).html(html);	                	
                	$("#"+cc).find("img").hide();
				}						
			}		
		});
		ssp.stream();		
		gptpt.source.push(ssp);	
	},
	
	"right_layer_open" : function(obj){
		$("#show_graph_content_right").css("width", "500px");
		$("#graph_text_draw").show();
		$("#graph_content_input_textarea_wrap").show();		
		$(obj).css("right", "482px");
		$(obj).find(".arrow_img").css("transform", "rotate(0deg)");
		
		var $iframe = $('#graph_iframe');
        var iframeElement = $iframe.get(0); 
        var iframeWindow = iframeElement.contentWindow;
        // 4. 함수 존재 여부 확인 후 호출
        if (iframeWindow && iframeWindow.open_controls) {
        	iframeWindow.open_controls();
        }
	},
	
	"right_layer_close" : function(obj){
	
		$("#show_graph_content_right").css("width", "18px");
		$("#graph_text_draw").hide();
		$("#graph_content_input_textarea_wrap").hide();		
		$(obj).css("right", "0px");
		$(obj).find(".arrow_img").css("transform", "rotate(180deg)");
		
		var $iframe = $('#graph_iframe');
        var iframeElement = $iframe.get(0); 
        var iframeWindow = iframeElement.contentWindow;
        // 4. 함수 존재 여부 확인 후 호출
        if (iframeWindow && iframeWindow.close_controls) {
        	iframeWindow.close_controls();
        }
	},
	
	"hide_attach_btn" : function(){
		$("#attach-btn").hide();
		//$('#search_work').off();
	},
	
	"show_attach_btn" : function(){
		$("#attach-btn").show();
		var e = $('#search_work');
		const clipboardData = (e.originalEvent || e).clipboardData;
		if (clipboardData && clipboardData.files.length > 0) {
			e.preventDefault();
			Array.from(clipboardData.files).forEach(file => {					
				gptpt.normal_chat_Dropzone.addFile(file);
			});
		}
	},
	
	"search_work_action_add_event" : function(){
		
		$("#attach-btn").show();
		var ex = $('#search_work');
		const clipboardData = (ex.originalEvent || ex).clipboardData;
		if (clipboardData && clipboardData.files.length > 0) {
			ex.preventDefault();
			Array.from(clipboardData.files).forEach(file => {					
				gptpt.normal_chat_Dropzone.addFile(file);
			});
		}

		ex.on("keyup keypress focus input", function(e){
			if (e.shiftKey && e.key === 'Enter') {				
			} else if (e.type == "keypress"){
				if (e.keyCode == 13){					
					if ($("#layer_gpt_project").is(":visible")){
						//프로젝트에서 연속해서 질문을 할 수 있기 때문에 현재 cur_project_code가 있으면 연결해서 계속 사용하고 없으면 체크한다.
						if (gptpt.cur_project_code == ""){
							gptpt.cur_project_code = $("#layer_gpt_project").data("key");							
						}						
					}					
					gptpt.first_msg_remove();					
					var msg = $(e.target).val();
					if (msg == ""){
						mobiscroll.toast({message:gap.lang.req_msg, color:'danger'});
						return false;
					}					
					$("#btn_work_req").removeClass("active");					
					gptapps.dis_id = "ai_result_dis";
					gptapps.dis_scroll = "ai_result_dis_top";
					
					//딥러서치가 설정되어 있으면 해당 항목을 먼저 처리한다.
					if ($("#btn_deepthink_option_drowndown").css("display") != "none") {
						gptapps.deepresearch(msg);					
					}else{
						//만약에 MyData가 선택되어 있으면 mydata query로 전송한다.
						var checked_list = $("#ai_mydata_dis").find("input:checked");
						if (checked_list.length > 0){
							gptpt.send_ai_request_mydata(msg, checked_list);
						}else{
							gptpt.send_ai_request(msg);
						}								
					}					
					
					//실행 버튼을 중지 버튼으로 변경한다.
					gptpt.chatgpt_stream_start();						
					return false;
				}			
			} else if (e.type == "focus"){
				$("#web_research_popup").fadeOut(100);
			} else if (e.type === "input"){
			///////////////// 입력창 높이 자동 조절
				let maxHeight = 126; // 최대 높이 설정
		    	$(this).height(0).height(Math.min(this.scrollHeight, maxHeight));
			} else if (e.type === "keyup"){
				var val = $.trim($(this).val());
				if(val.length > 0){
					if(!$("#btn_work_req").hasClass("stop")){
						$("#btn_work_req").addClass("active");						
					}
				} else {
					$("#btn_work_req").removeClass("active");
				}
			}
		});
		
		
	},
	
	"left_menu_active_disable" : function(){
		//좌측 메뉴 클릭시 나머지 선택된 항목 일괄 제거하는 함수
		var cls = $("#btn_open_ai_notebook").attr("class");
		if (cls.indexOf("active") > -1){
			gptpt.ai_notebook_hide();
		}	
		
		$(".menu_li").removeClass("active");	 	
	 	$("#project_work_menu .menu_li").removeClass("open");
		$("#more_work_list_ul .menu_li").removeClass("open");
	
	}
		
 }