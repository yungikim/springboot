/**
 * KGPT-Portal 설계관련 함수 
 */

 function kgptapps(){
	this.isDev = false;
	this.isSave = false;
	this.dis_id = "ai_result_dis";
	this.dis_scroll = "ai_result_dis_top";
	this.start = 0;
	this.perpage = 10;
	this.query = "";
	this.current_key = "";
	this.meeting_title = "";
	this.meeting_dt = "";
	this.meeting_member = "";
	this.meeting_link = "";
 }
 
 kgptapps.prototype ={
	 "init" : function(){		
	 }, 
	 
	 "event_deepresearch" : function(){	 
 		$('#research_body .accordion-header').off().on("click", function() {
	        var item = $(this).parent('.accordion-item');	        
	        // Toggle the 'open' class on the clicked item
	        item.toggleClass('open');	        
	        // Slide toggle the content
	        item.children('.accordion-content').slideToggle();	        
	        // Optional: Close other items when one is opened
	        $('.accordion-item').not(item).removeClass('open').children('.accordion-content').slideUp();
	    });
	
	    $('#research_body .sub-section-header').off().on("click", function() {
	        $(this).siblings('.sub-section-content').slideToggle();
	        $(this).find('.arrow').toggleClass('open');
	    });
	    
	    $('#research_body button').off().on("click", function(e) {
	    	var url = $(e.currentTarget).data("url");
	    	window.open(url, null);
	    });
		    
	    $(".ai_report_box .make_ai_report_btn").off().on("click", function(e){
			//리서치 완료된 내용을 보고서 생성하기 창을 띄운다.
			var id = $(e.currentTarget).data("id");
			url = "/v/make/"+id;		
			gap.open_subwin(url, "1600", "950", "yes" , "", "yes");
		});
		
		 $(".ai_report_box .make_ai_graph_btn").off().on("click", function(e){
		 	debugger;
			//리서치 완료된 내용을 지식 그래프  창을 띄운다.
			var id = $(e.currentTarget).data("id");
			url = "/v/make/"+id;		
			gap.open_subwin(url, "1600", "950", "yes" , "", "yes");
		});
		
		 $(".ai_report_box .make_ai_mindmap_btn").off().on("click", function(e){
		 	debugger;
			//리서치 완료된 내용을 마인드 맵 창을 띄운다.
			var id = $(e.currentTarget).data("id");
			url = "/v/make/"+id;		
			gptpt.open_layer("mindmap", id, text);
		});
	 },
	 
	 "sub_section_query" : function(id, bun, sub_bun, txt){
 		var hm = "";
 		hm +=  "<div class='content-item' id='sub_content_"+id +"_" + bun +"_"+sub_bun+"'>";
	//	hm +=  "	<span class='sparkle-icon'>*</span>";
		hm +=  "	<span class='loading_img'></span>";
		hm +=  "	<div>";
		hm +=  "		<p>"+txt+"</p>";
		hm +=  "		<div class='button-group'>";
		hm +=  "		</div>";
		hm +=  "	</div>";
		hm +=  "</div>";
		return hm;
	 },
	 
	 "section_query" : function(id, bun,  sub_bun){
	 	var hm = "";
	 	hm +=  "<div class='sub-section-content' id='section_content_"+ id +"_" + bun + "_" + sub_bun+"'>";
		hm +=  "	<div class='content-item active'>";
	//	hm +=  "		<span class='check-icon'>✓</span>";
		hm +=  "		<div style='padding-left:20px'>";
		hm +=  "			<p id='sub_title_"+id + "_" + bun + "_" + sub_bun + "'></p>";
		hm +=  "		</div>";
		hm +=  "	</div>";	
		hm +=  "</div>";
		return hm;
	 },
	 
	 "search_result_div" : function(id, bun){
	 	var hm = "";
	 	hm +=  "	<div class='accordion-item open'>";
		hm +=  "		<div class='accordion-header'>";
		hm +=  "			<span class='loading_img' style='width:20px'></span>";
		hm +=  "			<span class='search_query_title' id='title_"+id+"_"+bun+"'></span>";
		hm +=  "			<span class='arrow' id='arrow_"+id+"_"+bun+"'></span>";
		hm +=  "		</div>";
		hm +=  "		<div class='accordion-content' >";
		hm +=  "			<div class='button-group top' id='button_"+id+"_"+bun+"'>";
		hm +=  "			</div>";				
		hm +=  "			<div class='sub-section' id='sub_section_"+id+"_"+bun+"' style='display:none'>";
		hm +=  "				<div class='sub-section-header'>";
		hm +=  "					<span>"+gap.lang.va250+"</span>";
		hm +=  "					<span class='arrow'></span>";
		hm +=  "				</div>";				
		hm +=  "			</div>";	
		hm +=  "		</div>";
		hm +=  "	</div>";		
		return hm;
	 },
	 
	 "deepresearch_start" : function(cc, user_msg, opt){			
		var obj = $("#" + cc);
		var section = obj.find(".section");
		var txt = ""
		txt = gap.lang.va251 + " : " + user_msg + "\n";
		txt += gap.lang.va252 + "\n";
		for (var i = 0; i < section.length; i++){
			var item = section[i];
			var question = $(item).find("h3").text();
			if (txt == ""){
				txt = (i+1) + gap.lang.va253 + " : " + question;
			}else{
				txt += (i+1) + gap.lang.va253 + " : " +question;	
			}			
			var anx = "";
		    var ans = $(item).find(".option-item.selected");
		    for(var k = 0; k < ans.length; k++){
				var ix = ans[k];
				var answer = $(ix).find("label").text();
				if (anx == ""){
					anx = answer;
				}else{
					anx += "," + answer;
				}
			}
			if (anx == ""){
				anx = gap.lang.va254;
			}
			txt = txt +  "\n" + (i+1) + gap.lang.va255 + " : " + anx + "\n";
			//console.log(txt);
		}	
		txt = txt + "\n "+gap.lang.va256+" : " +  $("#textarea_" + cc).val();	
		
	//	txt = $("#textarea_" + cc).val();	
			
		var msg = txt;
		var cc = "deepresearch_chat_" + new Date().getTime();			
		html = "<div id='"+cc+"' class='deepresearch-div'></div>";			
		$("#"+gptapps.dis_id).append(html);				
		var html = "";			 
		html += "<div class='container'>";
		html += "	 <div class='header'>";
		html += "		<div>";
		html += "			<h2>"+gap.lang.va257+"</h2>";
		html += "		</div>";
		html += "		 <svg class='toggle-icon2' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>";
		html += "			 <path d='M18 15L12 9L6 15' stroke='#666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>";
		html += "		</svg>";
		html += "	</div>";				 
		//분석 주제 목록 표시 영역
		html += " 	<div id='research_top' style='display:none'>";
		html += " 	</div>";
		html += gptapps.loading_skeleton2();
		html += "</div>";
		html += "<div>";
		//검색 내용 분석 표시 영역
		html += "	<div id='research_body' >";
		html +=  "		<div class='container' id='research_body_container' style='display:none'>";
		html += "		</div>";
		html += "	</div>";		 		 
		//최종 보고서 영역
		html += "	<div id='research_report' style='display:none'>";
		html +=  "		<div class='container' id='research_report_box'>";		 
		html += "	 	<div class='header'>";
		html += "			<div>";
		html += "				<h2>"+gap.lang.va258+"</h2>";
		html += "			</div>";
		html += "		 	<svg class='toggle-icon3' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>";
		html += "			 	<path d='M18 15L12 9L6 15' stroke='#666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>";
		html += "			</svg>";
		html += "		</div>";			 
		html += "		<div class='container' id='research_report_container' style='width:100%'>";
		html += "      	<div id='"+cc+"_typed'></div>";
		html += "		</div>";			 
		html += "		<div class='ai_report_box' style='display:none' >";
		html += "			<div class='gpt_btn_wrap'>";
	//	html += "				<button type='button' class='btn_ai_answer copy' data-id='"+id+"'><span class='btn_ico'></span></button>";	
	//	html += "				<button type='button' class='btn_ai_answer share' data-id='"+id+"'><span class='btn_ico'></span></button>";	
		html += "			</div>";		
		
		html += "			<div class='gpt_btn_wrap'>";
		html += "				<button type='button' class='make_ai_graph_btn' data-id='"+cc+"'>";
		html += "					<span class='btn_inner'><span class='btn_ico'></span><span>"+gap.lang.va303+"</span></span>";
		html += "				</button>";
		
		html += "				<button type='button' class='make_ai_mindmap_btn' data-id='"+cc+"'>";
		html += "					<span class='btn_inner'><span class='btn_ico'></span><span>"+gap.lang.va304+"</span></span>";
		html += "				</button>";
		
		html += "				<button type='button' class='make_ai_report_btn' data-id='"+cc+"'>";
		html += "					<span class='btn_inner'><span class='btn_ico'></span><span>"+gap.lang.va259+"</span></span>";
		html += "				</button>";
		html += "			</div>";
		
		html += "		</div>";		 	 
		html += "		</div>";
		html += "	</div>";
		html += "</div>"		
		$("#"+cc).html(html);	
		
		$('.deepresearch-div .toggle-icon2').off().on("click", function(e){
           $('#research_top').slideToggle();
           $('.toggle-icon2').toggleClass('collapsed');                			
        });   
         
        $('.deepresearch-div .toggle-icon3').off().on("click", function(e){
           $('#research_report_container').slideToggle();
           $('.toggle-icon3').toggleClass('collapsed');                			
        });        
         
        $("#" + cc + " #research_report_container").addClass("markdown-body");
		$("#" + cc + " #research_report_container").parent().css("white-space", "inherit");		
		
		var status = "";
		var accumulatedMarkdown = "";
		var bun = 1;
		var sub_bun = 0;
		var postData = JSON.stringify({
			"msg" : msg,
			"opt" : opt,
			"user" : gap.userinfo.rinfo.nm,
			"code" : "deepresearch",
			"roomkey" : gptpt.cur_roomkey,
			"lang" : gap.curLang,
			"id" : cc + "_" + gap.userinfo.rinfo.ky
		});		
		
		var search_start = performance.now();
		console.log("데이터 검토를 시작합니다.... : " + search_start)
		var search_end = "";		
		var report_start = "";
		var report_end = "";		
		 var ssp = new SSE(gptpt.plugin_domain_fast + "apps/stream-deepresearch-start", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	           method: 'POST'});	     	           
	     ssp.addEventListener('open', function(e) {		     	
	     	//최종 보고서 작성이라는 애니메이션 추가
	     	var msg = gap.lang.va260;
			var options = {
				strings : [msg],
				typeSpeed : 50,
				backSpeed : 30,
				loop : true,
				contentType: 'html',
				onComplete: function(){
				}
			}		
		 	gptpt.typed = new Typed("#"+cc+"_typed", options);		 	
		 });	
		 
		 ssp.addEventListener('error', function(e) {		 	
			$("#btn_work_req").removeClass("stop");	
			ssp.close();		
		 });
	   
	     ssp.addEventListener('message', function(e) {		     		
			if (e.data.indexOf("#@creturn#@") > -1){
				//gap.scroll_move_to_bottom_time_gpt(500);
			}			
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n"); //.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");	
			//console.log(pph);						
			if (e.data == "[DONE]"){								
				$(".ai_report_box").fadeIn();
				gptapps.event_deepresearch();						
				let diffMs2 =search_end - search_start;
			    // ms → 분, 초 변환
			    let minutes2 = Math.floor(diffMs2 / 60000);
			    let seconds2 = Math.floor((diffMs2 % 60000) / 1000);			
			    // 두 자리수 맞추기
			    let result2 = `${minutes2}분 ${seconds2}초`;			
			    console.log("데이터 검토 시간 : " + result2); // 예: "0분 2초";				
				report_end = performance.now();	
				
				///// 답변이 끝나면 질문버튼 CSS 초기화
				$("#btn_work_req").removeClass("stop");	
				console.log("보고서 작성을 종료 합니다.... : " + report_end);
				let diffMs = report_end - report_start;
			    // ms → 분, 초 변환
			    let minutes = Math.floor(diffMs / 60000);
			    let seconds = Math.floor((diffMs % 60000) / 1000);			
			    // 두 자리수 맞추기
			    let result = `${minutes}분 ${seconds}초`;			
			    console.log("보고서 작성 시간 : " + result); // 예: "0분 2초";			    
			    ssp.close();				
			}else{					
				if (pph.startsWith("=firstsearch=")){	
					status = "firstsearch";		
					var tp = pph.replace("=firstsearch=", "").split("=spl=");
					var html2 = "";
					for (var y = 0 ; y < tp.length; y++){
						html2 += "<div class='research_top_title'>" + (y+1) + ". " + tp[y] + "</div>";
					}					
					$(".skeleton_loadingxxx").hide();				
					$("#"+cc + " #research_top").fadeIn(2000).append(html2);					
					gap.scroll_move_to_bottom_time_gpt(500);
					status = "secondsearch";				
				}else{
					if (status == "reporting"){						
						if ($("#" + cc + "_typed")){
							$("#" + cc + "_typed").remove();
						}	
						accumulatedMarkdown += pph;
                		const html = marked.parse(accumulatedMarkdown);
               	 		$("#"+cc + " #research_report_container").html(html);	               	 	
					}else{	
						if (pph.startsWith("-searchquery-")){							
							//console.log("status : " + status);
							var len = $("#"+cc + " #research_body .accordion-item").length;
							if (len < bun){
								var pppp = gptapps.search_result_div(cc, bun);
								$("#"+cc + " #research_body_container").append(pppp);		
							}							
							var que = pph.replace("-searchquery-", "");					
							if (status != "sub"){							
								$("#title_" + cc + "_" + bun).text(que);
								status = "sub";
								$("#"+cc + " #research_body_container").show();								
							}else{								
								var ppm = gptapps.sub_section_query(cc, bun, sub_bun, gap.lang.va268 + " : " + que);
								var par = $("#section_content_" + cc +"_" + bun + "_" + sub_bun);
								$(par).append(ppm);			
							}							
							gap.scroll_move_to_bottom_time_gpt(200);								
						}else if (pph.startsWith("-searchurls-")){
							var px = pph.replace("-searchurls-","");
							var items = px.split("=sss=");
							var htx = "";
							for (var x = 0 ; x < items.length; x++){
								var sp = items[x].split("=sp=");
								var title = sp[0];
								var url = sp[1];
								htx += "<button data-url='"+url+"'>"+title+"</button>";
							}									
							if (sub_bun == 0){
								//항목 최상단 queryurl이다.
								$("#button_" + cc + "_" + bun).append(htx);
								status = "sub";
								sub_bun ++;								
								$("#arrow_" + cc + "_" + bun).click();
							}else{								
								var xxp = $("#sub_content_" + cc + "_" + bun + "_" + sub_bun);
								var sxxp = $(xxp).find(".button-group");
								$(sxxp).append(htx);
								sub_bun ++;	
							}
							setTimeout(function(){
								gap.scroll_move_to_bottom_time_gpt(200);	
							}, 500);						
						}else if (pph.startsWith("-query-")){
							if (status == "sub"){								
								var ppm = gptapps.section_query(cc, bun , sub_bun);
								var par = $("#sub_section_" + cc + "_"+ bun);											
								$(par).append(ppm);									
								var qp = pph.replace("-query-", "");
								$("#sub_title_" + cc + "_" + bun + "_" + sub_bun).append(qp);								
								$("#sub_section_" + cc +"_"+ bun).show();							
							}							
						}else if (pph.startsWith("-sub_end-")){
							bun = bun  + 1;
							sub_bun = 0;
							status = "secondsearch";
						}else if (pph.startsWith("-analysis_end-")){
							$("#" + cc + " .loading_img").addClass("check");							
						}else if (pph.startsWith("-reporting-")){
							status = "reporting";
							$("#research_report").show();
							gap.scroll_move_to_bottom_time_gpt(500);	
							
							search_end = performance.now();
							console.log("데이터 검토를 종료 합니다.... : " + search_end)
							report_start = performance.now();	
							console.log("보고서 작성을 시작합니다.... : " + report_start)		
						}							
					}
					//gap.scroll_move_to_bottom_time_gpt(200);	
					gptapps.event_deepresearch();
				}							
				//console.log(status);
			}		
		});
		ssp.stream();	
		gptpt.source.push(ssp);
	 },	 
	 
	 "deepresearch_question" : function(txt){
	    var deepresearch_id = "deepresearch_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+deepresearch_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);					
		var ans_li2 = gap.lang.va261;
		ans_li2 += gap.lang.va262;	
	   	ans_li2 = gptpt.special_change(ans_li2);
		var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){							
				gap.scroll_move_to_bottom_time_gpt(200);				
				gptpt.voice_end();				
				gptapps.deepresearch_second(txt);				
				gptapps.loading_skeleton(gap.lang.va263, "dis_" + deepresearch_id);
			}
		}
		var typed = new Typed("#dis_"+deepresearch_id, options);		
	},
	
	"loading_skeleton" : function(msg, id){
		var html = "";
		html += "<div id='skeleton_"+id+"' class='skeleton_loadingxxx' style='height: 150px;width: 98%;'>";
		html += "	<div class='gpt_emphasis_box'>";
		html += "		<div class='gpt_emphasis_txt_wrap'>";
		html += "			<span class='gpt_emphasis_img'></span>";
		html += "			<span style='font-weight:500; font-size:15px'>"+msg+"</span>";
		html += "		</div>";
		html += "	</div>";
		html += "   <div style='display:flex; gap: 8px; flex-direction: column'>";
		html += "		<div class='skeleton_loading' style='width:100%; height:20px; position:relative'>";
		html += "			<div class='skeleton_txt'></div>";
		html += "		</div>";
		html += "		<div class='skeleton_loading' style='width:50%; height:20px; position:relative'>";
		html += "			<div class='skeleton_txt'></div>";
		html += "		</div>";
		html += "		<div class='skeleton_loading' style='width:70%; height:20px; position:relative'>";
		html += "			<div class='skeleton_txt'></div>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";		
		$("#" + id).append(html);
	},
	
	"loading_skeleton2" : function(msg){
		var html = "";
		html += "<div class='skeleton_loadingxxx' style='height: 55px;width: 98%;'>";
		/*
		html += "	<div class='gpt_emphasis_box'>";
		html += "		<div class='gpt_emphasis_txt_wrap'>";
		html += "			<span class='gpt_emphasis_img'></span>";
		html += "			<span style='font-weight:500; font-size:15px'>"+msg+"</span>";
		html += "		</div>";
		html += "	</div>";
		*/
		html += "   <div style='display:flex; gap: 8px; flex-direction: column'>";
		html += "		<div class='skeleton_loading' style='width:100%; height:20px; position:relative'>";
		html += "			<div class='skeleton_txt'></div>";
		html += "		</div>";
		html += "		<div class='skeleton_loading' style='width:50%; height:20px; position:relative'>";
		html += "			<div class='skeleton_txt'></div>";
		html += "		</div>";
	
		html += "	</div>";
		html += "</div>";		
		return html;
	},
	
	"deepresearch" : function(txt){
		gptpt.first_msg_remove();		
		gptpt.draw_request_msg(txt);			
		gptapps.search_type = "";
		gptpt.current_code = "deepresearch";			 		
		gptpt.save_person_log(txt);			
		gptapps.deepresearch_question(txt);
		gptpt.textarea_height_set();
	},
	
	"deepresearch_second" : function(txt){		
		//딥러서치할 질문을 넘겨서 추가 질의 값을 받아 온다.
		var postData = JSON.stringify({
			word : txt,
			lang : gap.curLang
		});		
		var cc = "deepresearch_chat_" + new Date().getTime();	
		html = "<div id='"+cc+"' class='deepresearch-div' style='display:none'></div>";		
		$("#"+gptapps.dis_id).append(html);			
		var ssp = new SSE(gptpt.plugin_domain_fast + "apps/stream-deepresearch", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	   	        method: 'POST'});	   	
	   	ssp.addEventListener('error', function(e) {
		    console.error("SSE Error:", e);
		    $("#btn_work_req").removeClass("stop");
		    ssp.close();
		});
	   	ssp.addEventListener('message', function(e) {		   		
	   		//로딩중 스켈레톤을 제거한다.
	   		$(".skeleton_loadingxxx").hide();	   	
			 var html = "";			 
			 html += "<div class='container'>";
			 html += "	 <div class='header'>";
			 html += "		<div>";
			 html += "			<h2>"+gap.lang.va264+"</h2>";
			 html += "			<p class='subtitle'>"+gap.lang.va265+"</p>";
			 html += "		</div>";
			 html += "		 <svg class='toggle-icon' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>";
			 html += "			 <path d='M18 15L12 9L6 15' stroke='#666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>";
			 html += "		</svg>";
			 html += "	</div>";						 
			 if (e.data == "[DONE]"){
			 	 $("#btn_work_req").removeClass("stop");
			 	ssp.close();
        		return;
			 } 
			 var spl = e.data.split("-=spl=-");
			 for (var i = 0 ; i < spl.length; i++){
			 	var item = spl[i].split("-spl-");
			 	var question = item[0];
			 	var answers = item[1].replace(/[\[\]]/g, '').split(',');			 	
			 	 html += "	<div class='collapsible-content'>";			 	 
			 	 html += "		 <div class='section'>";
				 html += "			 <h3>"+ (i+1) + "." + " " + question+"</h3>";				 
				 html += "			 <div class='options-grid'>";
			 	 for (var k = 0; k < answers.length; k++){
			 	    var ix = "item_" + i + "_" +  k;
			 	 	var answer = answers[k];
			 	 	answer = answer.replace("(", " ").replace(")"," ");
			 	 	html += "				<div class='option-item'>";
				 	html += "					<input type='checkbox' id='"+ix+"'>";
				 	html += "					<label for='"+ix+"'>"+answer+"</label>";
				 	html += "				</div>";
			 	 }
			 	 html += "			</div>";
			 	 html += "		</div>";
				 html += "	</div>";		 	
			 }			 
			 html += "<textarea id='textarea_"+cc+"' class='request_textarea' placeholder='"+gap.lang.va266+"' spellcheck='false'></textarea>";			 
			 html += "	 <div class='footer'>";
			 html += "		<button class='submit-btn'>"+gap.lang.va267+"</button>"; 
			 html += "	 </div>";					 
			 html += "	 </div>"; 
			 html += "</div>";   
			 $("#"+cc).fadeIn(2000).append(html);
			 gap.scroll_move_to_bottom_time_gpt(200);			 
			 $('.deepresearch-div .toggle-icon').off().on("click", function(e){
                $('.collapsible-content').slideToggle();
                $('.toggle-icon').toggleClass('collapsed');                
                var cls = $(e.currentTarget).attr("class");
               	if (cls == "toggle-icon collapsed"){
               		$(".deepresearch-div .request_textarea").hide();
					$(".deepresearch-div .submit-btn").hide();
				}else{
					$(".deepresearch-div .request_textarea").hide();
					$(".deepresearch-div .submit-btn").show();
				}			
            });
            
            $(".deepresearch-div .submit-btn").off().on("click", function(e){            	
            	//코드 체크		
				var stype = $('#btn_deepthink_option_drowndown .btn_ico').attr("class").split(" ")[1];	
				gptapps.deepresearch_start(cc,txt, stype);
				var cls = $('.deepresearch-div .toggle-icon').attr("class");
				if (cls == "toggle-icon"){
					$('.deepresearch-div .toggle-icon').click();
				}				
			});
            
             $('.deepresearch-div .option-item label').off().on("click", function(e) {				
             	e.preventDefault();
             	e.stopPropagation();             
                var $input = $(this).parent().find('input');                
                // Prevent loop if click is on the input itself
                if (!$(e.target).parent().is('input')) {
                    if ($input.is(':checkbox')) {
                        $input.prop('checked', !$input.prop('checked'));
                    } else if ($input.is(':radio')) {
                        $input.prop('checked', true);
                    }                    
                    if ($(e.currentTarget).parent().attr("class").indexOf("selected") > 0){
	                	$(e.currentTarget).parent().removeClass("selected");
	                }else{
	                	$(e.currentTarget).parent().addClass("selected");
	                }
                }  
            });           
            
             $('.option-item input[type=checkbox]').on('change', function(e){
			      var $item = $(this).closest('.option-item');
			      // 체크되면 selected 클래스 추가, 해제되면 제거
			      $item.toggleClass('checked', this.checked);
			      if ($(e.currentTarget).parent().attr("class").indexOf("selected") > 0){
	                	$(e.currentTarget).parent().removeClass("selected");
	              }else{ 
	                	$(e.currentTarget).parent().addClass("selected");
	              }
			 });			 
		});
		ssp.stream();	
		gptpt.source.push(ssp);	
	},
	
	"notebook_data_chat" : function(txt){		
		var cc = "normal_chat_" + new Date().getTime();				
		$("#" + cc).parent().remove();
		gptapps.ai_normal_response(cc);		
		var __url = root_path + "/ai_notebook_list_for_access.km";
		var data = JSON.stringify({		
		});
		gap.ajaxCall(__url, data, function(res){			
			if (res.result == "OK"){
				var list = res.data.data;
				var emp = gap.userinfo.rinfo.emp + "_share";
				var items = [emp];
				for (var i = 0 ; i < list.length; i++){
					items.push(list[i]._id.$oid);
				}
			}
			var qq = items.join(" ");
			var accumulatedMarkdown = "";
			$("#" + cc).addClass("markdown-body");
			$("#" + cc).parent().css("white-space", "inherit");				
			var postData = JSON.stringify({
				user : gap.userinfo.rinfo.nm,
				word : txt,
				keys : qq,
				fs : "T",
				ky : gap.userinfo.rinfo.ky,
				lang : gap.curLang
			});				
			var ssp = new SSE(gptpt.plugin_domain_fast + "apps/notesData", {headers: {'Content-Type': 'application/json; charset=utf-8'},
		            payload:postData,
		            method: 'POST'});		            
		    ssp.addEventListener('error', function(e) {
				$("#btn_work_req").removeClass("stop");	
				ssp.close();		
			});			
			ssp.addEventListener('open', function(e) {	
			});			
		   	ssp.addEventListener('message', function(e) {	
				console.log(e.data);			
				var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n"); 		
				if (e.data == "[DONE]"){				
					///// 답변이 끝나면 질문버튼 CSS 초기화
					$("#btn_work_req").removeClass("stop");				
					gptapps.write_btns_event(cc);		
					gap.scroll_move_to_bottom_time_gpt(200);	
					ssp.close();
										
					setTimeout(function(){
						$("#ai_notebook_chat_area .inner").mCustomScrollbar("scrollTo", "bottom");
					}, 1000);		        					
				}else{							
					if (pph != ""){
						accumulatedMarkdown += pph;
	                	const html = marked.parse(accumulatedMarkdown);
	                	$("#"+cc).html(html);
					}		           				
				}		
			});
			ssp.stream();	
			gptpt.source.push(ssp);		
		});
	},
	
	"normal_chat" : function(txt, opt){		
		var readers = []
		var uinfo = gap.userinfo.rinfo;
		
		readers.push(uinfo.emp);
		readers.push("all")
		for (var i = 0 ; i < uinfo.adc.split("^").length; i++){
			readers.push(uinfo.adc.split("^")[i])
		}		
		var deepthink = "F";
		if ($('#btn_toggle_deepthink').hasClass('active')) {
			deepthink = "T";
		}
		
		var cc = "normal_chat_" + new Date().getTime();		

		 var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : txt,
	//		chat_history : "",
			code : (opt == "search" ? "normal_chat_websearch" : "normal_chat"), 
			roomkey : gptpt.cur_roomkey,
			readers : readers,
			call_code : gptpt.current_code,
			lang : gap.curLang,
			project_code : gptpt.cur_project_code,
			deepthink : deepthink,
			opt : opt,
			id : cc + "_" + gap.userinfo.rinfo.ky
		});			
				
		$("#" + cc).parent().remove();
				
		//내부 자료에서 검색이 되지 않아 LLM에 질문한다.
		gptapps.ai_normal_response(cc);				
		var method = "pluginNormal";
		if (opt == "search"){
			method = "pluginNormal_websearch";
		}		
		
		//$("#search_work").val("");	
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
				gptapps.write_btns_event(cc);		
				//gap.scroll_move_to_bottom_time_gpt(200);	
				ssp.close();
        		return;							
			}else{			
			//	console.log(pph);
			//	var tmsg = $("#" + cc).html(); 
			//	$("#" + cc).html(marked.parse(tmsg + pph))	
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
	 
	 
	 "make_marking_stream" : function(postdata, cc){
		var ssp = new SSE(gptpt.plugin_domain_fast + "apps/pluginMarkingData", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postdata,
	            method: 'POST'});  
		ssp.addEventListener('open', function(e) {
		//	gap.hide_loading();
			$("#" + cc + "_typed").remove();			
		});		
		
		ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");			
			ssp.close();
		});			
		
		var accumulatedMarkdown = "";
		$("#" + cc).addClass("markdown-body");
		$("#" + cc).parent().css("white-space", "inherit");	
		
	   	ssp.addEventListener('message', function(e) {				
			//var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","<br>");	
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n");
			if (e.data.startsWith("#@creturn#@") || e.data.startsWith(".#@creturn#@")){
				//줄바꿈을 할때 마크다운을 적용해야 다음 줄로 내려가는 오류를 방지할 수 있다.							
				gap.scroll_move_to_bottom_time_gpt(3000);	
			}								
			if (e.data == "[DONE]"){
				$("#btn_work_req").removeClass("stop");	
				gptapps.make_marking_file(cc, postdata);			
			//	var tmsg = $("#" + cc).html();
			//	tmsg = gptpt.change_markdown_html(tmsg);
			//	$("#" + cc).html(tmsg);				
			//	gptpt.autolink("#"+cc);				
				gap.scroll_move_to_bottom_time_gpt(1000);				
				if ($("#" + cc + "_image").html() == ""){
					$("#" + cc + "_image").html("<div style='border:1px solid grey; width:400px; height:400px; display:flex; justify-content:center;align-items:center' id='"+cc+"_temp'></div>")
					msg = "Generating related images......";
					var options = {
						strings : [msg],
						typeSpeed : 50,
						backSpeed : 30,
						loop : true,
						contentType: 'html',
						onComplete: function(){
						}
					}
				 	gptpt.typed = new Typed("#"+cc + "_temp", options);
				}	
				ssp.close();
        		return;								
			}else{			
				accumulatedMarkdown += pph;
            	const html = marked.parse(accumulatedMarkdown);
            	$("#"+cc).html(html);
			}					
			//ssp.close();
		});
		ssp.stream();
		gptpt.source.push(ssp);
	},
	 
	 "make_marking" : function(txt){		
		 var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : txt,
			roomkey : gptpt.cur_roomkey,
			empno : gap.userinfo.rinfo.ky,
			call_code : gptpt.current_code,
			lang : gap.curLang
		});			
		var cc = "marking_data_chat_" + new Date().getTime();		
		gptapps.ai_mydata_response_marking(cc);		
		gptapps.make_marking_stream(postData, cc);	
	 },

	"make_marking_file" : function(cc, postData){
		var url = gptpt.plugin_domain_fast + "apps/pluginMarkingData_image";
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
				if (res == "ERROR"){
					res = gptapps.add_question(cc, "no");
				}else{
					var image_file = res;				
					var img_url = gptpt.plugin_domain_fast + "apps/file_download_marking?filename="+image_file;
					$("#"+cc + "_image").html("<img src='"+img_url+"' style='width:500px;border-radius:10px;'>");				
					gap.scroll_move_to_bottom_time_gpt(1000);	
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	},
	  
	 "company_data_chat" : function(txt){		
		//아직 개발되지 않
		var lln = $(".data_folder_wrap").last().find(".active");  //선택된 폴더의 건수 0일경우 전체선택으로 간주한다.	
		var fs = [];		
		if (lln.length != 0){
			for (var k = 0 ; k < lln.length; k++){
				var item = lln[k];
				fs.push($(item).data("foldercode"));
			}
		}
		if ($(".data_folder_wrap").last().find(".data_folder").length == fs.length){
			fs = [];
		}		
		var readers = []
		var uinfo = gap.userinfo.rinfo;
		readers.push(uinfo.emp);
		readers.push("all")
		for (var i = 0 ; i < uinfo.adc.split("^").length; i++){
			readers.push(uinfo.adc.split("^")[i])
		}
		 var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : txt,
			chat_history : "",
			code : "normal_chat",
			roomkey : gptpt.cur_roomkey,
			fs : fs,
			readers : readers,
			call_code : gptpt.current_code,
			lang : gap.curLang
		});			
		var cc = "company_data_chat_" + new Date().getTime();		
		gptapps.ai_mydata_response(cc);				
		var url = gptpt.plugin_domain_fast + "apps/pluginAdminData_new";
		
		var ssp = new SSE(url, {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	           method: 'POST'});	    
	
		var accumulatedMarkdown = "";
		$("#" + cc).addClass("markdown-body");
		$("#" + cc).parent().css("white-space", "inherit");		
		
		ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");	
			ssp.close();		
		});
		
		var isREF = false;
	   	ssp.addEventListener('message', function(e) {	
			//console.log(e.data);			
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
	
				gptapps.reference_draw_admin(pph, cc);						
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
	 
	 "reference_draw_admin" : function(arr, cc){
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
			var rate = "";			
			if (item.split("-ssp-").length == 5){
				rate = item.split("-ssp-")[4];	
			}			
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
				url = item.url;
			}			
			html += "		<div class='item' data-type='"+icon_cls+"' data-filename='"+filename+"' data-ky='"+id+"' data-path='"+path+"'>";
			html += "			<div class='item_title_wrap'>";
			html += "				<span class='item_title_ico "+icon_cls+"'></span>";
			html += "				<span>"+title+  (rate == "" ? "" : " [" + rate + "]") +"</span>";
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
			if (type == "url"){
				window.open(path);
			}else if (type == "txt"){
				var __url = root_path + "/refer_info.km";
				var data = JSON.stringify({key:key, type: "admin"});
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
				/*
				if (calltype == "admin"){
					var url = gptpt.plugin_domain_fast + "file_download_admindata?filename="+filename+"&key="+folder;
					location.href = url;
				}else{
					var url = gptpt.plugin_domain_fast + "file_download_mydata?filename="+filename+"&ky="+ky+"&key="+folder;
					location.href = url;
				}		
				*/						
				var down_url = gptpt.kgpt_file_download_server + "dataconfig/file_download_admindata/"+filename+"/"+path;				
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
	 
	"company_data_chat_backup" : function(txt){		
		//선택한 폴더의 folder_code를 가져온다.
		var lln = $(".data_folder_wrap").last().find(".active");  //선택된 폴더의 건수 0일경우 전체선택으로 간주한다.	
		var fs = [];		
		if (lln.length != 0){
			for (var k = 0 ; k < lln.length; k++){
				var item = lln[k];
				fs.push($(item).data("foldercode"));
			}
		}
		if ($(".data_folder_wrap").last().find(".data_folder").length == fs.length){
			fs = [];
		}		
		var readers = []
		var uinfo = gap.userinfo.rinfo;
		readers.push(uinfo.emp);
		readers.push("all")
		for (var i = 0 ; i < uinfo.adc.split("^").length; i++){
			readers.push(uinfo.adc.split("^")[i])
		}
		 var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : txt,
			chat_history : "",
			code : "normal_chat",
			roomkey : gptpt.cur_roomkey,
			fs : fs,
			readers : readers,
			call_code : gptpt.current_code,
			lang : gap.curLang
		});			
		var cc = "company_data_chat_" + new Date().getTime();								
		gptapps.ai_mydata_response(cc);				
	//	$("#" + cc).addClass("markdown-body");
	//	$("#" + cc).parent().css("white-space", "inherit");			
		var url = gptpt.plugin_domain_fast + "apps/pluginAdminData";
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
				gptpt.voice_end();
				var ref = "";
				if (res == "ERROR"){
					res = gptapps.add_question(cc, "no");
				}else{
					ref = res.split("-$$$-")[1];
					res = res.split("-$$$-")[0];
				//	res = marked.parse(res.replace(/<br>/gi, ""));
					res = res.replace(/[\n\r]/gi, "<br>")
					gap.scroll_move_to_bottom_time_gpt(1000);	
				//	res += gptpt.special_change(res);
				//	res += gptpt.change_markdown_html(res);
					res += gptapps.add_question(cc, "");	
					res += "<div id='"+cc+"_reference'></div>";									        
				//	console.log(res);					
				}								
				var options = {
					strings : [res],
					typeSpeed : 1,
					contentType: 'html',
					onComplete: function(){
						gap.scroll_move_to_bottom_time_gpt(200);	
						$("#no_answer_"+cc + " span").off().on("click", function(e){
							var key = $(e.currentTarget).data("key");
							var msg = $("#"+cc).parent().prev().find(".my_que_txt").text();
							if (key == "r1"){
								//인공지능에게 바로 물어보기
								gptpt.draw_ai_response("normal_code", msg);
							}else if (key == "r2"){
								//인터넷 검색후 정리된 답변을 보여주기
							//	gap.show_loading(gap.lang.va48);
							//	gptapps.webquery(msg);
								
								gptpt.current_code = "it12";											
								gptpt.draw_request_msg(msg);	
								gptapps.query_make(msg);
							}
						});					
						//참고 문서를 겁색해서 하단에 표시해 준다.
						var _refurl = root_path + "/refer_search.km";
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
									gptpt.reference_draw(res.data.data, cc, "admin");
									gap.scroll_move_to_bottom_time_gpt(100);
								}	
							},
							error : function(e){
								gap.error_alert();
							}
						});						
					}
				}
				var typed = new Typed("#"+cc, options);			
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	 },
	 
	 "add_question" : function(cc, opt){
		var res = "";
		res += "<div style='padding:0 0 10px 0;' id='no_answer_"+cc+"' class='no_answer'>";
		if (opt == "no"){
			res += "<div>"+gap.lang.va47 + "</div>";
		}
		res += "<div style='margin-top:10px'>";
		res += "<span class='btn_blue2' data-key='r1'>"+gap.lang.va49+"</span>";
		res += " <span class='btn_blue2' data-key='r2'>"+gap.lang.va50+"</span>";
		res += "</div>"
		res += "</div>";
		return res;
	 },
	 
	 "ai_normal_response" : function(id, date){	
		var	html = "<div class='gpt_emphasis_box'>";
		if (typeof(date) != "undefined"){
			html += "<div class='gpt_emphasis_txt_wrap'><span class='gpt_emphasis_img'></span><span>"+gap.lang.va24+" (" + date + ")</span></div>";
		}else{
			html += "<div class='gpt_emphasis_txt_wrap'><span class='gpt_emphasis_img'></span><span>"+gap.lang.va24+"</span></div>";
		}		
		html += "</div>";		 
		var ans_li = "<div class='ai_answer_wrap mail'>";
		ans_li += "		<div class='ans_title'>";
		ans_li += "			<div><div class='ai_img'></div></div>";   //gpt_img		
		ans_li += "		<span id='"+id+"' class='and_title_txt'><span class='ai_answer_box' id='"+id+"_typed'></span></span>";		
	//	ans_li += "			<span  id='"+id+"' class='and_title_txt'></span>";		
		ans_li += "		</div>";				
		ans_li += "		<div class='gpt_btn_wrap_box' id='"+id+"_btns' style='display:none'>";
		ans_li += "			<div class='gpt_btn_wrap'>";
		ans_li += "				<button type='button' class='btn_ai_answer copy' data-id='"+id+"'><span class='btn_ico'></span></button>";	
		ans_li += "				<button type='button' class='btn_ai_answer share' data-id='"+id+"'><span class='btn_ico'></span></button>";	
		ans_li += "			</div>";		
		ans_li += "				<button type='button' class='btn_save_to_note' data-id='"+id+"'>";
		ans_li += "					<span class='btn_inner'><span class='btn_ico'></span><span>"+gap.lang.va141+"</span></span>";
		ans_li += "				</button>";
		ans_li += "		</div>";				
		ans_li += "		<div  id='"+id+"_sub' class='ans_title' style='display:none; margin-left:40px'></div>";		
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(html + ans_li);			
		
		var msg = "Generating a response to your request................";
		var options = {
			strings : [msg],
			typeSpeed : 50,
			backSpeed : 10,
			loop : true,
			contentType: 'html',
			onComplete: function(){
				//console.log("ai_mydata_response....")
				//gap.scroll_move_to_bottom_time("ai_result_dis_top", 100);
			}
		}		
		if ($("#"+id + "_typed")){
			gptpt.typed = new Typed("#"+id + "_typed", options);	
		}	 	
	 },
	 
	 "ai_normal_response_graph" : function(id, date){	
		var	html = "<div class='gpt_emphasis_box'>";
		
	//	html += "<div class='gpt_emphasis_txt_wrap'><span class='gpt_emphasis_img'></span><span>"+gap.lang.va24+"</span></div>";
				
		html += "</div>";		 
		var ans_li = "<div class='ai_answer_wrap mail' style='padding:20px;'>";
		ans_li += "		<div class='ans_title'>";
		ans_li += "			<div><div class='ai_img'></div></div>";   //gpt_img		
		ans_li += "		<span id='"+id+"' class='and_title_txt'><span class='ai_answer_box' id='"+id+"_typed'></span></span>";		
	//	ans_li += "			<span  id='"+id+"' class='and_title_txt'></span>";		
		ans_li += "		</div>";				
			
		ans_li += "		<div  id='"+id+"_sub' class='ans_title' style='display:none; margin-left:40px; padding:20px'></div>";		
		ans_li += "</div>";
		$("#graph_text_draw").append(html + ans_li);			
		
		var msg = "Generating a response to your request................";
		var options = {
			strings : [msg],
			typeSpeed : 50,
			backSpeed : 10,
			loop : true,
			contentType: 'html',
			onComplete: function(){
				//console.log("ai_mydata_response....")
				//gap.scroll_move_to_bottom_time("ai_result_dis_top", 100);
			}
		}		
		if ($("#"+id + "_typed")){
			gptpt.typed = new Typed("#"+id + "_typed", options);	
		}	 	
	 },

	"ai_normal_response_url_summary" : function(id){	
		var	html = "<div class='gpt_emphasis_box'>";
		html += "<div class='gpt_emphasis_txt_wrap'><span class='gpt_emphasis_img'></span><span>"+gap.lang.va24+"</span></div>";
		html += "</div>";		 
		var ans_li = "<div class='ai_answer_wrap mail'>";
		ans_li += "		<div class='ans_title'>";
		ans_li += "			<div><div class='ai_img'></div></div>";   //gpt_img
		ans_li += "			<span  id='"+id+"' class='and_title_txt'></span>";
		ans_li += "		</div>";				
		ans_li += "		<div class='gpt_btn_wrap_box' id='"+id+"_btns' style='display:none'>";
		ans_li += "			<div class='gpt_btn_wrap'>";
		ans_li += "				<button type='button' class='btn_ai_answer copy' data-id='"+id+"'><span class='btn_ico'></span></button>";	
		ans_li += "				<button type='button' class='btn_ai_answer share' data-id='"+id+"'><span class='btn_ico'></span></button>";	
		ans_li += "			</div>";		
		ans_li += "				<button type='button' class='btn_save_to_note' data-id='"+id+"'>";
		ans_li += "					<span class='btn_inner'><span class='btn_ico'></span><span>"+gap.lang.va141+"</span></span>";
		ans_li += "				</button>";
		ans_li += "		</div>";		
		ans_li += "		<div  id='"+id+"_sub' class='ans_title' style='display:none; margin-left:40px'></div>";		
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(html + ans_li);		
	 },

	"ai_normal_response_stream" : function(id){		
		var	html = "<div class='gpt_emphasis_box'>";
		html += "<div class='gpt_emphasis_txt_wrap'><span class='gpt_emphasis_img'></span><span>"+gap.lang.va24+"</span></div>";
		html += "</div>";		 
		var ans_li = "<div class='ai_answer_wrap mail'>";
		ans_li += "		<div class='ans_title'>";
		ans_li += "			<div><div class='ai_img'></div></div>";
		ans_li += "			<span  id='"+id+"' class='and_title_txt'></span>";
		ans_li += "		</div>";				
		ans_li += "		<div class='gpt_btn_wrap_box' id='"+id+"_btns' style='display:none'>";
		ans_li += "			<div class='gpt_btn_wrap'>";
		ans_li += "				<button type='button' class='btn_ai_answer copy' data-id='"+id+"'><span class='btn_ico'></span></button>";	
		ans_li += "				<button type='button' class='btn_ai_answer share' data-id='"+id+"'><span class='btn_ico'></span></button>";	
		ans_li += "			</div>";		
		ans_li += "				<button type='button' class='btn_save_to_note' data-id='"+id+"'>";
		ans_li += "					<span class='btn_inner'><span class='btn_ico'></span><span>"+gap.lang.va141+"</span></span>";
		ans_li += "				</button>";
		ans_li += "		</div>";		
		ans_li += "		<div  id='"+id+"_sub' class='ans_title' style='display:none; margin-left:40px'></div>";		
		ans_li += "</div>";
		
		var thtml = "<div id='tx_"+id+"' style='display:none'>" + html + ans_li + "</div>";
	//	$("#"+gptapps.dis_id).append(html + ans_li);
		$("#"+gptapps.dis_id).append(thtml);		
	 },

	"gpt_summary_by_code" : function(id, txt, code){
		//id자리에 txt를 요약한 내용을 작성한다.			
		var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : txt,
			chat_history : "",
			code : code,
			call_code : gptpt.current_code,
			lang : gap.curLang
		});						
		var ssp = new SSE(gptpt.plugin_domain_fast + "apps/pluginMail", {headers: {'Content-Type': 'application/json; charset=utf-8'},
            payload:postData,
            method: 'POST'});            
        ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");	
			ssp.close();		
		});		
	   	ssp.addEventListener('message', function(e) {	
			//console.log(e.data);
			var pph = e.data.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");
			//gap.scroll_move_to_bottom_time_gpt(200);	
			if (e.data == "[DONE]"){
				$("#btn_work_req").removeClass("stop");
				//gap.scroll_move_to_bottom_time_gpt(200);	
				ssp.close();
        		return;				
			}else{
				$("#"+id).append(pph);
			}			
		});
		ssp.stream();
		gptpt.source.push(ssp);	
		
		//DominoIQ적용
		/*
		var url = "https://one.kmslab.com/dominoiq/LLM.nsf/llm?openform";
		var data = {
			"__Click" : "0",
			"%%PostCharset" : "UTF-8",
			"SaveOptions" : "0",
			"msg" : txt			
		}			
		$.ajax({
			type : "POST",
			url : url,
			dataType : "text",
			data : data,
			success : function(res){
				var mmx = res.replace(/[\n]/gi, "<br>")
				$("#"+id).append(mmx);
			},
			error : function(e){
				alert(e);
			}
		});	
		*/	
	 },

	"ai_mydata_response" : function(id){	
		//var id = "response_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap' style='margin-top:15px'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<span class='ai_answer_box' id='"+id+"'><span class='ai_answer_box' id='"+id+"_typed'></span></span>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);		
		var msg = "Generating a response to your request................";
		var options = {
			strings : [msg],
			typeSpeed : 50,
			backSpeed : 10,
			loop : true,
			contentType: 'html',
			onComplete: function(){
				//console.log("ai_mydata_response....")
				//gap.scroll_move_to_bottom_time("ai_result_dis_top", 100);
			}
		}
	 	gptpt.typed = new Typed("#"+id + "_typed", options);
	 },
	 
	 "ai_mydata_response_marking" : function(id){
		//var id = "response_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap' style='margin-top:15px'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<span class='ai_answer_box' id='"+id+"'><span class='ai_answer_box' id='"+id+"_typed'></span></span>";	
		ans_li += "</div>";		
		ans_li += "		<div id='"+id+"_image' style='padding-left:45px'></div>";	
		$("#"+gptapps.dis_id).append(ans_li);		
		var msg = "Generating a response to your request................";
		var options = {
			strings : [msg],
			typeSpeed : 50,
			backSpeed : 10,
			loop : true,
			contentType: 'html',
			onComplete: function(){
				//console.log("ai_mydata_response....")
				//gap.scroll_move_to_bottom_time("ai_result_dis_top", 100);
			}
		}
	 	gptpt.typed = new Typed("#"+id + "_typed", options);
	 },
	 
	 "ai_response_write" : function(msg){
		var id = "response_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap' style='margin-top:15px'>";
		//ans_li += "	<div class='ans_title'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<span class='ai_answer_box' id='"+id+"'></span>";
		//ans_li += "	</div>"
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);				
	   	msg = gptpt.special_change(msg);
	   	var options = {
			strings : [msg],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
			}
		}
		var typed = new Typed("#"+id, options);
	 },
	 
	//어 메일 요약해줘 코드 : mail1
	 "summary_email" : function(startdate, enddate, runcode){	 	
	 	gptapps.email_body_list = new Object();	
		var url = gptpt.mail_domain +"/ag_detail_search_mailbox?open&page=1&subject=&subject_opt=and&from=&from_opt=and&sendto=&sendto_opt=and&copyto=&copyto_opt=and&blindto=&blindto_opt=and&body=&body_opt=and&attachname=&attachname_opt=and&attachbody=&attachbody_opt=and&period_opt=and&sd="+startdate+"&ed="+enddate+"&mbox=inbox&count=50&month=6";
	 	if (runcode == "mail4"){
			url = gptpt.mail_domain +"/XML_Inbox_unread?readviewentries&collapseview&count=1000&outputformat=json&charset=utf-8";
		}
	 	$.ajax({
			method : "get",
			url : url,
			xhrFields: {
				withCredentials: true	
			},
			contentType : "text/plain; charset=utf-8",
			success : function(data){					
				if (runcode == "mail4"){
					//읽지 않은 메일 리스트
					var itemlist = new Array();				
					if (data.viewentry){						
						var ans_li = "<div class='ai_answer_wrap mail'>";
						ans_li += "		<div class='ans_title'>";
						ans_li += "			<div><div class='ai_img'></div></div>";
						ans_li += "			<span class='and_title_txt'>"+ data.viewentry.length + "" +gap.lang.va20+"</span>";
						ans_li += "		</div>"				
					    ans_li += "		<div class='ai_answer_box'>";
						ans_li += "			<div class='ans_ul' >";										
						for (var i = 0 ; i < data.viewentry.length; i++){
							var item = data.viewentry[i];							
							var unid = item["@unid"];
							var dis_code = new Date().getTime() + "_" + unid;
							var date = gap.convertGMTLocalDateTime_new(item.entrydata[4].datetime[0]);
							var subject = item.entrydata[3].text[0];
							var empno = item.entrydata[15].text[0];
							var from = item.entrydata[2].text[0].split("-=spl=-")[0];
						//	if (userlang != "ko"){
						//		from = item.entrydata[2].text[0].split("-ENG-")[1];
						//	}							
							ans_li += "		<div class='mail-container' id='mail_"+unid+"'>";
							ans_li += "			<div class='mail-header'>";
							ans_li += "				<div class='mail-title'>";
							if (empno.startsWith("KM")){
								ans_li += "					<div class='profile1' style='background-image:url(/photo/"+empno+".jpg)', url(../resource/images/none.jpg)></div>"
							}else{
								var fstr = from.substring(0,1);
								ans_li += "					<div class='profile2'>"+fstr+"</div>"
							}						    
							ans_li += "					<div class='mail-title-text'>";
							ans_li += "						<h2>"+subject+"</h2>";
							ans_li += "						<span>"+from+" / "+date+"</span>";
							ans_li += "					</div>";
							ans_li += "				</div>";
							ans_li += "				<div class='mail-actions' data-key='"+dis_code+"'>";
							ans_li += "					<div class='button icon_eamil_open' data-id='"+unid+"' data-action='open' data-txt='"+gap.lang.va21+"'></div>";
							ans_li += "					<div class='button icon_eamil_reply' data-id='"+unid+"' data-action='Reply_withattach' data-txt='"+gap.lang.mail_reply+"'></div>";
							ans_li += "					<div class='button icon_eamil_forward' data-id='"+unid+"' data-action='Forward_withattach' data-txt='"+gap.lang.mail_forward+"'></div>";
							ans_li += "					<div class='button icon_eamil_ai' data-id='"+unid+"' data-action='ai' data-txt='"+gap.lang.va269+"'></div>";
							ans_li += "					<div class='button icon_eamil_expand' data-action='expand'></div>";
							ans_li += "				</div>";
							ans_li += "			</div>";
							ans_li += "			<div class='mail-body' id='"+dis_code+"'>";
							ans_li += "			</div>";														
							ans_li += "		</div>";																								
							itemlist.push(dis_code);
						}				
						ans_li += "</div>";
						ans_li += "</div>";				
						ans_li += "</div>";					
					}else{
						var ans_li = "<div class='ai_answer_wrap mail'>";
						ans_li += "	<div class='ans_title'>";
						ans_li += "		<div class='ai_img'></div>";
						ans_li += "		<span class='and_title_txt'>"+gap.lang.va19+"</span>";
						ans_li += "	</div>"
						ans_li += "</div>";
					}
				}else{
					data = eval("(" + data + ")");
					var list = data.data;
					var itemlist = new Array();				
					if (list.length == 0){
						var ans_li = "<div class='ai_answer_wrap mail'>";
						ans_li += "	<div class='ans_title'>";
						ans_li += "		<div class='ai_img'></div>";
						ans_li += "		<span class='and_title_txt'>"+gap.lang.va19+"</span>";
						ans_li += "	</div>"
						ans_li += "</div>";
					}else{	
						var ans_li = "<div class='ai_answer_wrap mail'>";
						ans_li += "		<div class='ans_title'>";
						ans_li += "			<div><div class='ai_img'></div></div>";
						ans_li += "			<span class='and_title_txt'>"+ list.length + "" + gap.lang.va20+"</span>";
						ans_li += "		</div>"				
					    ans_li += "		<div class='ai_answer_box'>";
						ans_li += "			<div class='ans_ul' >";
						for (var i = 0 ; i < list.length; i++){
							var item = list[i];
							var dis_code = new Date().getTime() + "_" + item.unid;
							var from = item.from.split("-ENG-")[0] //한글명 [1] 영문
							var date = gap.convertGMTLocalDateTime_new(item.date);
							var subject = item.subject;
							var unid = item.unid;
							var empno = item.fromempno;							
							ans_li += "		<div class='mail-container' id='mail_"+unid+"'>";
							ans_li += "			<div class='mail-header'>";
							ans_li += "				<div class='mail-title'>";
							if (empno.startsWith("KM")){
								ans_li += "					<div class='profile1' style='background-image:url(/photo/"+empno+".jpg)', url(../resource/images/none.jpg)></div>"
							}else{
								var fstr = from.substring(0,1);
								ans_li += "					<div class='profile2'>"+fstr+"</div>"
							}						    
							ans_li += "					<div class='mail-title-text'>";
							ans_li += "						<h2>"+subject+"</h2>";
							ans_li += "						<span>"+from+" / "+date+"</span>";
							ans_li += "					</div>";
							ans_li += "				</div>";
							ans_li += "				<div class='mail-actions' data-key='"+dis_code+"'>";
							ans_li += "					<div class='button icon_eamil_open' data-id='"+unid+"' data-action='open' data-txt='"+gap.lang.va21+"'></div>";
							ans_li += "					<div class='button icon_eamil_reply' data-id='"+unid+"' data-action='Reply_withattach' data-txt='"+gap.lang.mail_reply+"'></div>";
							ans_li += "					<div class='button icon_eamil_forward' data-id='"+unid+"' data-action='Forward_withattach' data-txt='"+gap.lang.mail_forward+"'></div>";
							ans_li += "					<div class='button icon_eamil_ai' data-id='"+unid+"' data-action='ai' data-txt='"+gap.lang.va269+"'></div>";
							ans_li += "					<div class='button icon_eamil_expand' data-action='expand'></div>";
							ans_li += "				</div>";
							ans_li += "			</div>";
							ans_li += "			<div class='mail-body' id='"+dis_code+"'>";
							ans_li += "			</div>";
							ans_li += "		</div>";																							
							itemlist.push(dis_code);
						}				
						ans_li += "</div>";
						ans_li += "</div>";				
						ans_li += "</div>";
					}
				}				
				
				$("#"+gptapps.dis_id).append(ans_li);				
				$(".mail-actions .button").on("mouseenter", function(e){
					var txt = $(e.currentTarget).data("txt");
					var action = $(e.currentTarget).data("action");
					//tooltip 적용하기
					var rect = e.target.getBoundingClientRect();
					// 요소의 중앙 좌표 계산
					var centerX = rect.left + rect.width / 2;
					var centerY = rect.top + rect.height / 2;
					var pos = [centerX, centerY];		
					var type = $(this).data("tooltip");					
					var $this = $(this);					
					if (action != "expand"){
						gptapps.draw_tooltip(pos, txt);
					}					
				});				
				$(".mail-actions .button").on("mouseleave", function(e){
					$("#alarm_preferences_tooltip").remove();
				});						
				$(".btn_ans_li_fold").on("click", function(){
					var li = $(this).closest(".ans_li");					
					$(this).toggleClass("fold");					
					li.find(".ans_li_info_wrap, .ans_detail_li").toggle();					
				});				
				//메일 조회, 답장, 전달 버튼 클릭
				$(".mail-container .mail-actions .button").on("click", function(e){
					gptapps.mail_content = "";
					var obj = $(e.currentTarget);
					var unid = $(obj).data("id");
					var action = $(obj).data("action");
					var url = "";
					if (action == "open"){		
						if (gptpt.current_code == "mail4"){
							$("#mail_"+unid).remove();
						}						
						url = gptpt.mail_domain + "/0/"+unid+"?Opendocument&viewname=XML_Inbox&folderkey=&opentype=popup&relatedyn=Y";
						gap.open_subwin(url, "1100", "950", "yes" , "", "yes");
					}else{				
						//답장을 할 경우 해당 메일의 답장내용을 생성해서 gptapps.mail_content에 등록하고 메일을 띄우면 자동으로 본문에 입력된다.
						var id = $(e.currentTarget).parent().data("key");
						if (action == "ai"){						
							var ans_li = "";
							ans_li += "			<div class='overlay' id='overlay_"+id+"'>";
							ans_li += "   			<img src='/resource/images/kgpt_portal/loading.gif'>";
							ans_li += "				<p>"+gap.lang.va270+"</p>";
							ans_li += "			<div>";							
							$("#" + id).append(ans_li);							
							var body = gptapps.email_body_list[id];
							body = body.replace(/\{/gi, "").replace(/\}/gi,"");														
							var postData = JSON.stringify({
								"user" : gap.userinfo.rinfo.nm,
								"body" : body,
								"code" : "email_reply",
								"lang" : gap.curLang
							});							
							var url = gptpt.plugin_domain_fast + "apps/email_reply";
							$.ajax({
								type : "POST",
								url : url,
								data : postData,
								dataType : "json",
								beforeSend : function(xhr){
									xhr.setRequestHeader("auth", gap.get_auth());
									xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
								},
								success : function(rx){
									$("#overlay_" + id).fadeOut();									
									rx = "<p></p><br>" + rx;		
									gptapps.mail_content = rx.replaceAll("-%spl%-", " ").replaceAll("#@creturn#@","<br>"); 						
									url = gptpt.mail_domain + "/process_doc?openagent&action=Reply_withattach&unid="+unid+"&opentype=popup";		
								 	gap.open_subwin(url, "1600", "950", "yes" , "", "yes");
								},
								error : function(e){
									alert(e);
								}
							});
						}else if (action == "Forward_withattach" || action == "Reply_withattach"){
							url = gptpt.mail_domain + "/process_doc?openagent&action="+action+"&unid="+unid+"&opentype=popup";		
						 	gap.open_subwin(url, "1600", "950", "yes" , "", "yes");
						}else{
							//접고 펼치기
							var cls =obj.hasClass("on");
							if (cls){
								obj.removeClass("on");
								obj.parent().parent().removeClass("on");
								$("#" + id).fadeIn();
							}else{
								obj.addClass("on");
								obj.parent().parent().addClass("on");
								$("#" + id).fadeOut();
							}							
						}				
					}					
				});				

				//각각의 메일에 대해서 요약한 내용을 적용한다.				
				for (var j = 0; j < itemlist.length ; j++){
					var code = itemlist[j];
					var url = gptpt.mail_domain + "/0/" + itemlist[j].split("_")[1] + "/Body?OpenField&OutputFormat=text/plain";
					$.ajax({
						type : "GET",
						async : false,
						xhrFields: {
							withCredentials : true	
						},
						url : url,
						dataType : "text",
						success : function(res){
							gptapps.email_body_list[code] = res;
							$("#" + code).fadeIn();
							//console.log("code : ", code);
							res = res.replace(/<style[^>]*>.*?<\/style>/g, '');
							res = res.replace(/<\/?[^>]+(>|$)/g, '');
							gptapps.gpt_summary_by_code(code, res, runcode);
							gap.scroll_move_to_bottom_time_gpt(200);
						},
						error : function(e){
							gap.error_alert();
						}
					});
				}			
			},
			error : function(e){
				gap.error_alert();
			}
		});
	 },

	 "search_email_summary" : function(startdate, enddate, opt, query, search_msg){				
		var sq = "from";
		if (opt == "sent"){
			sq = "sendto"
		}		
	//	var url = gptpt.mail_domain + "/ag_detail_search_mailbox?open&page=1&subject_opt=or&"+sq+"_opt=or&subject="+encodeURIComponent(query)+"&" + sq +"="+encodeURIComponent(query)+"&period_opt=and&sd="+startdate+"&ed="+enddate+"&mbox="+opt+"&count=50";
		var url = gptpt.mail_domain + "/ag_detail_search_mailbox?open&page=1&" + sq +"="+encodeURIComponent(query)+"&period_opt=and&sd="+startdate+"&ed="+enddate+"&mbox="+opt+"&count=50";
		console.log(url);
		$.ajax({
			method : "get",
			url : url,
			xhrFields: {
				withCredentials: true	
			},
			contentType : "text/plain; charset=utf-8",
			success : function(data){		
				data = eval("(" + data + ")");				
				var list = data.data;				
				if (list.length == 0){
					alert("검색된 메일이 존재하지 않습니다.")
				}				
				/*		
				if (list.length == 0){
					var ans_li = "<div class='ai_answer_wrap mail'>";
					ans_li += "	<div class='ans_title'>";
					ans_li += "		<div class='ai_img'></div>";
					ans_li += "		<span class='and_title_txt'>"+gap.lang.va19+"</span>";
					ans_li += "	</div>"
					ans_li += "</div>";
				}else{	
					var ans_li = "<div class='ai_answer_wrap mail'>";
					ans_li += "		<div class='ans_title'>";
					ans_li += "			<div><div class='ai_img'></div></div>";
					ans_li += "			<span class='and_title_txt'>"+ list.length + "" + gap.lang.va20+"</span>";
					ans_li += "		</div>"				
				    ans_li += "		<div class='ai_answer_box'>";
					ans_li += "			<div class='ans_ul' >";
					for (var i = 0 ; i < list.length; i++){
						var item = list[i];
						var dis_code = new Date().getTime() + "_" + item.unid;
						var from = item.from.split("-ENG-")[0] //한글명 [1] 영문
						var date = gap.convertGMTLocalDateTime_new(item.date);
						ans_li += "<li class='ans_li'>";	
									
						ans_li += "		<div class='ans_li_title_box'>";						
						ans_li += "			<div class='ans_li_title_wrap'>";
						ans_li += "				<div class='ans_li_title_txt_wrap'>";						
						ans_li += "					<h4 class='ans_li_title_txt'>"+item.subject+"</h4>";						
						if (item.attach == "T"){
							ans_li += "					<button type='button' class='btn_mail_file_download'><span class='btn_img'></span>";
							ans_li += "						<span class='mail_file_count'></span></button>";
						//	ans_li += "			</div>";
						}
						ans_li += "				</div>";
						ans_li += "				<div class='ans_btn_wrap'>";
						ans_li += "					<div class='ans_li_btn_wrap'>";
						ans_li += "						<button type='button' class='ans_li_btn original' data-id='"+item.unid+"' data-action='open'><span class='btn_img'></span><span>"+gap.lang.va21+"</span></button>";
						ans_li += "						<button type='button' class='ans_li_btn answer' data-id='"+item.unid+"' data-action='Reply_withattach'><span class='btn_img'></span><span>"+gap.lang.mail_reply+"</span></button>";
						ans_li += "						<button type='button' class='ans_li_btn delivery' data-id='"+item.unid+"' data-action='Forward_withattach'><span class='btn_img'></span><span>"+gap.lang.mail_forward+"</span></button>";
						ans_li += "					</div>";
						ans_li += "					<button type='button' class='btn_ans_li_fold'></button>";
						ans_li += "				</div>";
						ans_li += "			</div>";						
						ans_li += "		</div>";							
						ans_li += "		<div class='ans_li_info_wrap'>";
						ans_li += "			<span class='ans_li_date'>"+date+"</span><span class='slash'> / </span><span class='ans_li_writer'>"+from+"</span>"
						ans_li += "		</div>"				
						ans_li += "		<div class='ans_detail_li_mail' id='"+dis_code+"' style='display:none; border:1px dashed rgb(199 197 197); border-radius:10px; padding:10px 20px;margin-top:7px'></div>";						
											
						ans_li += "</li>";												
						itemlist.push(dis_code);
					}				
					ans_li += "</div>";
					ans_li += "</div>";				
					ans_li += "</div>";
				}
					
				$("#"+gptapps.dis_id).append(ans_li);					
				
				for (var i = 0 ; i < list.length; i++){
					var item = list[i];
					var dis_code = new Date().getTime() + "_" + item.unid;
					itemlist.push(dis_code);
				}			
			*/				
				//각각의 메일에 대해서 요약한 내용을 적용한다.		
				var msg_total = [];						
				for (var j = list.length -1 ; j >= 0 ; j--){
					var item = list[j];
					var date = gap.convertGMTLocalDateTime_new(item.date);
					var subject = item.subject;
					var url = gptpt.mail_domain + "/0/" + item.unid + "/Body?OpenField&OutputFormat=text/plain";
					$.ajax({
						type : "GET",
						async : false,
						xhrFields: {
							withCredentials : true	
						},
						url : url,
						dataType : "text",
						success : function(res){
							
							//$("#" + code).fadeIn();
							//console.log("code : ", code);
							res = res.replace(/<style[^>]*>.*?<\/style>/g, '');
							res = res.replace(/<\/?[^>]+(>|$)/g, '');
							res = res.replace(/[\n\r]/gi, "");
							res = res.replace(/&nbsp;/gi, " ");						
							res = res.split("----- 원본 메시지")[0];							
						//	console.log("=======================================================");
						//	console.log(res);
							msg_total.push((j+1) + "번재 메일 \n subject : " + subject + "\n Date : " + date + "\n link : " + item.unid +"\n" + res + "\n=========================================");
							
							//gptapps.gpt_summary_by_code(code, res, runcode);
							//gap.scroll_move_to_bottom_time_gpt(200);
						},
						error : function(e){
							gap.error_alert();
						}
					});
				}					
				//수집된 메일 내용을 전송한다.
				
				gptapps.summary_email_result(msg_total.join(" "), search_msg);
					
			},
			error : function(e){
				gap.error_alert();
			}
		});
	 },


	"summary_email_result" : function(msg, query){
		//메일 내용을 전송하고 요약된 내용을 수신한다.	
		var code = gptpt.current_code + "_summary";	
		var id = code + "_" + new Date().getTime();
		gptapps.ai_normal_response_url_summary(id);			
		var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : query,
			msg : msg,
			call_code : code,
			lang : gap.curLang
		});					
		var ssp = new SSE(gptpt.plugin_domain_fast + "apps/pluginMail_Summary", {headers: {'Content-Type': 'application/json; charset=utf-8'},
            payload:postData,
            method: 'POST'});
            
       	ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");		
			ssp.close();	
		});		
	   	ssp.addEventListener('message', function(e) {	
			//console.log(e.data);
			var pph = e.data.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","").replaceAll("---", "<hr style='border:1px dashed #bfbebe'>");
			//gap.scroll_move_to_bottom_time_gpt(200);	
			if (e.data == "[DONE]"){
				$("#btn_work_req").removeClass("stop");
				//gap.scroll_move_to_bottom_time_gpt(200);								
				var tmsg = $("#" + id).html().replace(/&lt;/gi, "<").replace(/&gt;/gi,">");
				let matches = tmsg.match(/<mailview>(.*?)<\/mailview>/g);				
				$("#" + id).html(tmsg);
			    // 결과 출력
			    if (matches) {
			        matches.forEach(function(match) {
			            $("mailview").off().on("click", function(e){
							var unid = $(e.currentTarget).text();							
							//gptapps.location_search(loc);							
							var url = gptpt.mail_domain + "/0/"+unid+"?Opendocument&viewname=XML_Inbox&folderkey=&opentype=popup&relatedyn=Y";
							gap.open_subwin(url, "1100", "750", "yes" , "", "yes");
						});
			        });
			    } else {
			        console.log("No matches found");
			    }				
				ssp.close();
        		return;
			}else{				
				$("#"+id).append(pph);
			}			
		});
		ssp.stream();
		gptpt.source.push(ssp);
	},

	 //일정 요약하기
	 "summary_schedule" : function(sdate, edate, runcode){		 
		 var url = gptpt.mail_domain + "/CustomEventList?readviewentries&outputformat=json&count=99999&StartKey="+sdate+"&UntilKey="+edate+"&KeyType=time"
		 $.ajax({
			method : "get",
			url : url,
			xhrFields: {
				withCredentials: true	
			},
			contentType: "application/json; charset=utf-8",
			success : function(res){
				gptapps.draw_schedule(res);			
			},		
			error : function(e){
				 gap.error_alert();
			}
		 });		
	 },

	 "draw_schedule" : function(res){
		if (res.viewentry){
			var sid = "schedule_result_dis_" + new Date().getTime();			
			var ans_li = "<div class='ai_answer_wrap mail'>";
			ans_li += "		<div class='ans_title'>";
			ans_li += "			<div><div class='ai_img'></div></div>";
			ans_li += "			<span class='and_title_txt'>"+gap.lang.va26.replace("$1", res.viewentry.length)+"</span>";
			ans_li += "		</div>"				
		    ans_li += "		<div class='ai_answer_box'>";
			ans_li += "			<div class='ans_ul'>";			
			//한줄씩 표시하기 위해 별도로 처리한다.
			for (var i = 0 ; i < res.viewentry.length; i++){
				var item = res.viewentry[i];
				var unid = item["@unid"];					
				var subject = item.entrydata[4].text[0];
				var startday = "";
				if (item.entrydata[11].datetimelist){
					startday = moment(item.entrydata[11].datetimelist.datetime[0]).format("YYYY-MM-DD");
				}else{
					startday = moment(item.entrydata[11].datetime[0]).format("YYYY-MM-DD");
				}
				var endday = "";
				if (item.entrydata[12].datetimelist){
					endday = moment(item.entrydata[12].datetimelist.datetime[0]).format("YYYY-MM-DD");
				}else{
					endday = moment(item.entrydata[12].datetime[0]).format("YYYY-MM-DD");
				}
				var starttime = "";
				if (item.entrydata[1].datetimelist){
					starttime = moment(item.entrydata[1].datetimelist.datetime[0]).format("HH:MM");
				}else{
					//starttime = moment(item.entrydata[1].datetime[0]).format("HH:MM");
					starttime = moment(item.entrydata[1].datetime[0]).format("LT");
				}
				var endtime = "";
				if (item.entrydata[3].datetimelist){
					endtime = moment(item.entrydata[3].datetimelist.datetime[0]).format("HH:MM");
				}else{
					//endtime = moment(item.entrydata[3].datetime[0]).format("HH:MM");
					endtime = moment(item.entrydata[3].datetime[0]).format("LT");
				}				
				var location = item.entrydata[24].text[0];
				var owner = item.entrydata[5].text[0].split(" ")[1];
				var attee = [];				
				if (item.entrydata[23].textlist){
					var alist = item.entrydata[23].textlist.text;
					for (var j = 0 ; j < alist.length; j++){
						var aitem = alist[j];
						var itm = aitem[0].split(" ");
						var uname = itm[1].replace("/Kmslab/kr","");
						var emp = itm[0];
						attee.push("<span data-emp='"+emp+"'>"+uname+"</span>");
					}
				}					
				var disdate = moment(startday).format("dddd");								
				ans_li += "<li class='ans_li' >";									
				ans_li += "		<div class='ans_li_title_box'>";	
				ans_li += "			<div class='ans_li_num'>1.</div>";					
				ans_li += "			<div class='ans_li_title_wrap'>";
				ans_li += "				<div class='ans_li_title_txt_wrap' style='width:100%'>";						
				ans_li += "					<h4 class='ans_li_title_txt' style='width:100%'>"+subject+"</h4>";		
				if (ismobile == "F"){
					ans_li += "					<div class='ans_btn_wrap'>";
					ans_li += "						<div class='ans_li_btn_wrap schedule_li'>";
					ans_li += "							<button type='button' class='ans_li_btn original .schedule_li' data-id='"+unid+"' data-action='open'><span class='btn_img'></span><span>"+gap.lang.va21+"</span></button>";
					ans_li += "						</div>";
					ans_li += "						<button type='button' class='btn_ans_li_fold'></button>";
					ans_li += "					</div>";
				}
				ans_li += "				</div>";						
				ans_li += "			</div>";	
				ans_li += "		</div>";	
				ans_li += "		<div class='ans_detail_ul'>";						
				ans_li += "			<div class='ans_detail_li_schedule'>"+gap.lang.mt_th_owner+" : "+ owner + "</div>";										
				ans_li += "			<div class='ans_detail_li_schedule'>"+gap.lang.mt_th_date+" : "+ startday + "("+disdate+")"+ " | " + gap.lang.mt_th_time + " : " +starttime+"~"+endtime  +"</div>";	
				if (location != ""){
					ans_li += "			<div class='ans_detail_li_schedule'>"+gap.lang.mt_th_place+": "+location+"</div>";
				}	
				if (attee.length > 0){
					ans_li += "			<div class='ans_detail_li_schedule'>"+gap.lang.mt_th_att+" : "+attee.join(",")+"</div>";
				}						
			//	ans_li += "				<div class='ans_detail_li_schedule' id='"+sid+"_memo'>111111</div>";	
				ans_li == "		</div>";					
				ans_li += "</li>";							
			}				
			ans_li += "			</div>";
			ans_li += "		</div>";	
			ans_li += "</div>";					
			var pk = "<div id='"+sid+"'></div>";
			$("#"+gptapps.dis_id).append(pk);		
		    ans_li = gptpt.special_change(ans_li);
			//일관 표시하는 걸로 변경함 ////////////////////////////////////////////////////////////
			$("#" + sid).html(ans_li);			
			gap.scroll_move_to_bottom_time_gpt(200);				
			$(".btn_ans_li_fold").on("click", function(){
				var li = $(this).closest(".ans_li");					
				$(this).toggleClass("fold");					
				li.find(".ans_detail_li_schedule").toggle();					
			});					
			//일정 새창 조
			$(".ans_li_btn_wrap.schedule_li button").on("click", function(e){						
				var obj = $(e.currentTarget);
				var unid = $(obj).data("id");
				var junction = maildbpath.split("/")[0];												
				var url = "https://" + mailserver + "/" + junction + "/cal/calendar.nsf/main?open&unid="+unid+"&startDate=&callfrom=kgpt";
				gap.open_subwin(url, "1100", "950", "yes" , "", "yes");										
			});				
			$(".ans_detail_li_schedule span").off().on("click", function(e){
				var emp = $(e.target).data("emp");
				//프로필 띄우는 함수 호
			});				
			///////////////////////////////////////////////////////////////////////////////////
					
			return false;
		    var options = {
				strings : [ans_li],
				typeSpeed : 1,
				contentType: 'html',
				onComplete: function(){	
					gap.scroll_move_to_bottom_time_gpt(200);				
					$(".btn_ans_li_fold").on("click", function(){
						var li = $(this).closest(".ans_li");					
						$(this).toggleClass("fold");					
						li.find(".ans_detail_li_schedule").toggle();					
					});					
					//일정 새창 조
					$(".ans_li_btn_wrap.schedule_li button").on("click", function(e){						
						var obj = $(e.currentTarget);
						var unid = $(obj).data("id");
						var junction = maildbpath.split("/")[0];												
						var url = "https://" + mailserver + "/" + junction + "/cal/calendar.nsf/main?open&unid="+unid+"&startDate=&callfrom=kgpt";
						gap.open_subwin(url, "1100", "950", "yes" , "", "yes");										
					});	
					
					$(".ans_detail_li_schedule span").off().on("click", function(e){
						var emp = $(e.target).data("emp");
						//프로필 띄우는 함수 호
					});				
				}
			}
			var typed = new Typed("#"+sid, options);		
		}else{
			var ans_li = "<div class='ai_answer_wrap mail'>";
			ans_li += "	<div class='ans_title'>";
			ans_li += "		<div class='ai_img'></div>";
			ans_li += "		<span class='and_title_txt'>"+gap.lang.va25+"</span>";
			ans_li += "	</div>"
			ans_li += "</div>";
			$("#"+gptapps.dis_id).append(ans_li);
		}
	},
	 
	 "schedule_detail_memo" : function(unid, id){
		 var url = gptpt.mail_domain + "/vw_date_list_byABC2/" + unid + "/Body?openfield&charset=utf-8";
		 $.ajax({
			method : "get",
			url : url,
			aysnc: false,
			xhrFields: {
				withCredentials: true	
			},
			contentType: "application/json; charset=utf-8",
			success : function(res){				
			   res = gptpt.special_change(res);
			    var options = {
					strings : [res],
					typeSpeed : 1,
					contentType: 'html',
					onComplete: function(){
						gap.scroll_move_to_bottom_time_gpt(200);
					}
				}
				var typed = new Typed("#"+id, options);
			},
			error : function(e){
				gap.error_alert();
			}
		});
	 },	 
	 
	 "reservation_meeting_room" : function(txt, code, history){
		var today = moment().format("YYYY-MM-DD");
		var todaymsg = "오늘 날짜는 " + today + " 입니다";   //한글을 유지해야 한다.
		var postData = {
			user : gap.userinfo.rinfo.nm,
			word : txt + " " +todaymsg,
			chat_history : history,
			code : code,
			roomkey : gptpt.cur_roomkey + "_reservation",
			call_code : gptpt.current_code,
			lang : gap.curLang
		};		
		gptpt.voice_end();
		$.ajax({
			crossDomain: true,
			type: "POST",
			//url : gptpt.plugin_domain + "pluginONE",
			url : gptpt.plugin_domain_fast + "apps/pluginReservation",
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){			
			//	console.log(res);
			//	var jj = JSON.parse(res);	
				var jj = res;			
				var datedis = jj.status["수집한정보"]["예약일자"];
				var info_date = "";
				if (typeof(datedis) != "undefined"){
					gptpt.disdate = "T";
					info_date = datedis;
				}
				var info_time = "";
				var distime = jj.status["수집한정보"]["예약시간"];
				if (typeof(distime) != "undefined"){
					info_time = distime;
				}
				var info_att = "";			
				var att = jj.status["수집한정보"]["회의참석자이름"];
				if (typeof(att) != "undefined"){
					info_att = att;
					if (!$.isArray(att)){
						info_att = [att];
					}
				}				
				var pre_msg = jj.speak;				
				if (info_date != "해당사항 없음" && info_time != "해당사항 없음" && info_att != "해당사항 없음"){
					//모든 정보가 세팅되어 실제 회의실을 에약하러 간다.											
					var dmsg = "";					
					dmsg += "<div style='padding:0px;'>";					
					dmsg += "<div> "+gap.lang.va16+" : " + info_date + "</div>";
					dmsg += "<div>"+gap.lang.va17+" : " + info_time + "</div>";
					dmsg += "<div>"+gap.lang.member+" : " + info_att + "</div>";					
					var mms = dmsg;
					mms += "<div>"+gap.lang.va15+"</div>";
					mms += "</div>";					
					gap.showConfirm({
						title: "Confirm",
						contents: mms,
						callback: function(){	
							var tm = dmsg;
							var room_txt = "In Meeting Room 1 on the 2nd floor"; //2층 회의실1에";
							var room_txt = "2층 회의실 1 "
							if (gap.curLang != "ko"){
								var room_txt = "Second-floor conference room 1. ";								
							}							
							tm += "<div>"+room_txt + " " +gap.lang.va18+"</div>";
							tm += "</div>";	
							gptapps.ai_response_write(tm);
							gptpt.current_code = "";		
						//	gptpt.voice_end();										
							gptpt.delete_roomkey(gptpt.cur_roomkey + "_reservation")			
						}
					});					
				}else{
					// 몇가지 정보가 설정되지 않아 추가로 질문한다.					
					var html = "<div class='reservation_meeting_cls'>";
					html += "<span >" +  pre_msg + "</span>";		
					html += "</div>";					
					gptapps.ai_response_write(html);			
				}				
				gap.scroll_move_to_bottom_time_gpt(200);		
				
				///// 답변이 끝나면 질문버튼 CSS 초기화
				$("#btn_work_req").removeClass("stop");
								
				gap.hide_loading();				
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	 },  
	 
	  "search_email_query" : function(txt, code){	
		gptpt.current_code = code;
		var postData = {
			user : gap.userinfo.rinfo.nm,
			word : txt,
			code : code,
			roomkey : gptpt.cur_roomkey + "_searchemail",
			m365 : gap.userinfo.rinfo.m365,
			lang : gap.curLang
		};				
		gptpt.voice_end();
		$.ajax({
			crossDomain: true,
			type: "POST",
			url : gptpt.plugin_domain_fast + "apps/SearchEmailQuery",
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){			
				//	
				gap.hide_loading();			
				console.log(res);				
				//var jj = res;
				var jj = JSON.parse(res);					
				var txt1 = jj.status["수집한정보"]["검색내용"];
				var search_msg = "";
				if (typeof(txt1) != "undefined"){
					gptpt.search_msg = "T";
					search_msg = txt1;
				}
				var search_users = "";
				var txt2 = jj.status["수집한정보"]["검색대상"];
				if (typeof(txt2) != "undefined"){
					search_users = txt2;
				}
				var search_folder = "";
				var txt3 = jj.status["수집한정보"]["검색폴더"];
				if (typeof(txt3) != "undefined"){
					search_folder = txt3;
				}
				
				var search_term = "";			
				var txt4 = jj.status["수집한정보"]["검색일자"];
				if (typeof(txt4) != "undefined"){
					search_term = txt4;
				//	if (!$.isArray(att)){
				//		info_att = [att];
				//	}
				}				
					
				var pre_msg = jj.speak;				
				if (search_msg != "" && search_users != "" && search_folder != "" && search_term != ""){
					//모든 정보가 세팅되어 실제 회의실을 에약하러 간다.								
					var st = search_term.split("~");
					var start = st[0].replaceAll("-",".");
					var end = "";
					if (st.length == 1){
						end = start
					}else{
						end = st[1].replaceAll("-",".")
					}					
					var folder = search_folder;
				//	if (search_folder == "보낸메일" || search_folder == "보낸편지함" || search_folder == "발신메일" || search_folder == "발송한 메일" || search_folder == "sent"){
				//		folder = "sent";
				//	}
				//	gptapps.search_email_summary(start, end, folder, search_users, search_msg);
					var sq = "from";
					if (folder == "sent"){
						sq = "sendto";
					}					
					if (code == "ms01"){
						gptapps.search_email_summary_direct_m365(start, end, folder, search_users, search_msg, sq);
					}else{
						gptapps.search_email_summary_direct(start, end, folder, search_users, search_msg, sq);
					}							
				}else{
					// 몇가지 정보가 설정되지 않아 추가로 질문한다.						
					var html = "<div class='reservation_meeting_cls'>";
					html += "<span >" +  pre_msg + "</span>";		
					html += "</div>";					
					gptapps.ai_response_write(html);			
				}				
				gap.scroll_move_to_bottom_time_gpt(200);	
				///// 답변이 끝나면 질문버튼 CSS 초기화
				$("#btn_work_req").removeClass("stop");				
				gap.hide_loading();	
					
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	 },  

 	"search_email_summary_direct_m365" : function(start, end, folder, search_users, search_msg, sq){
		//메일 내용을 전송하고 요약된 내용을 수신한다.	
		var code = gptpt.current_code + "_summary";	
		var id = code + "_" + new Date().getTime();
		gptapps.ai_normal_response_url_summary(id);		
		var sq = sq;
		var query = search_users;
		var startdate = start;
		var enddate = end;
		var opt = folder;
		var question = search_msg;		
		startdate = moment(startdate).startOf('day').toISOString();
		enddate = moment(enddate).endOf('day').toISOString();		
		var data = JSON.stringify({
			"sq" : sq,
			"mail_domain" : gptpt.mail_domain,
			"query" : query,
			"startdate" : startdate,
			"enddate" : enddate,
			"opt" : opt,
			"call_code" : code,
			"user" : gap.userinfo.rinfo.nm,
			"question" : question,
			"lang": gap.curLang,
			"m365" : gap.userinfo.rinfo.m365
		});		
		var ssp = new SSE(gptpt.plugin_domain_fast + "m365/email_search", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:data,
				withCredentials: true,
	            method: 'POST'});	            
	   	ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");			
			ssp.close();
		});		
	   	ssp.addEventListener('message', function(e) {	
			//console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", "&nbsp;").replace("<","&lt;").replace(">", "&gt;").replaceAll("#@creturn#@","<br>").replaceAll("**","").replaceAll("---", "<hr style='border:1px dashed #CCCCCC; height:1px'>");
			//gap.scroll_move_to_bottom_time_gpt(200);	
			if (e.data == "[DONE]"){		
				$("#btn_work_req").removeClass("stop");				
				//gap.scroll_move_to_bottom_time_gpt(200);	
				var tmsg = $("#" + id).html(); //.replace(/&lt;mailview/gi, "<mailview").replace(/mailview&gt;/gi,"mailview>");				
				tmsg = tmsg.replace(/&lt;mailview&gt;/g, "<mailview>");
                tmsg = tmsg.replace(/&lt;\/mailview&gt;/g, "</mailview>");				
				let matches = tmsg.match(/<mailview>(.*?)<\/mailview>/g);				
				msg = gptpt.change_markdown_html(tmsg);					
				$("#" + id).html(msg);		
				var items = $("#" + id + " mailview");
				for (var k = 0 ; k < items.length; k++){
					var item = items[k];
					var sid = $(item).text();
					$(item).attr("data-id", sid);
					$(item).text(gap.lang.va149);					
				}
 				$("mailview").off().on("click", function(e){
					var unid = $(e.currentTarget).data("id");				
					unid = unid.split("=")[0]+ "=";		
					var url = "https://outlook.office365.com/owa/?ItemID="+ encodeURIComponent(unid) + "&exvsurl=1&viewmodel=ReadMessageItem";
					gap.open_subwin(url, "1100", "750", "yes" , "", "yes");
				});							
				ssp.close();
        		return;
			}else{
				$("#"+id).append(pph);
			}				
		});
		ssp.stream();
		gptpt.source.push(ssp);
		
	},

	 "search_email_summary_direct" : function(start, end, folder, search_users, search_msg, sq){
		//메일 내용을 전송하고 요약된 내용을 수신한다.	
		var code = gptpt.current_code + "_summary";	
		var id = code + "_" + new Date().getTime();
		gptapps.ai_normal_response_url_summary(id);		
		var sq = sq;
		var query = search_users;
		var startdate = start;
		var enddate = end;
		var opt = folder;
		var question = search_msg;		
		var data = JSON.stringify({
			"sq" : sq,
			"mail_domain" : gptpt.mail_domain,
			"query" : query,
			"startdate" : startdate,
			"enddate" : enddate,
			"opt" : opt,
			"call_code" : code,
			"user" : gap.userinfo.rinfo.nm,
			"question" : question,
			"lang": gap.curLang,
		});		
		var ssp = new SSE(gptpt.plugin_domain_fast + "domino/email_search", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:data,
				withCredentials: true,
	            method: 'POST'});	            
	   	ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");			
			ssp.close();
		});		
	   	ssp.addEventListener('message', function(e) {	
			//console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","").replaceAll("---", "<hr style='border:1px dashed #CCCCCC; height:1px'>");
			//gap.scroll_move_to_bottom_time_gpt(200);	
			if (e.data == "[DONE]"){	
				$("#btn_work_req").removeClass("stop");			
				//gap.scroll_move_to_bottom_time_gpt(200);					
				var tmsg = $("#" + id).html().replace(/&lt;/gi, "<").replace(/&gt;/gi,">");
				let matches = tmsg.match(/<mailview>(.*?)<\/mailview>/g);				
				msg = gptpt.change_markdown_html(tmsg);					
				$("#" + id).html(msg);		
				var items = $("#" + id + " mailview");
				for (var k = 0 ; k < items.length; k++){
					var item = items[k];
					var sid = $(item).text();
					$(item).attr("data-id", sid);
					$(item).text(gap.lang.va149);					
				}
 				$("mailview").off().on("click", function(e){
					var unid = $(e.currentTarget).data("id");				
					var url = gptpt.mail_domain + "/0/"+unid+"?Opendocument&viewname=XML_Inbox&folderkey=&opentype=popup&relatedyn=Y";
					gap.open_subwin(url, "1100", "750", "yes" , "", "yes");
				});				
				ssp.close();
        		return;
			}else{
				$("#"+id).append(pph);
			}			
		});
		ssp.stream();
		gptpt.source.push(ssp);		
	},
	 
	 "vacation_year" : function(){
		//연차 휴가 등록하기
	    var year_id = "vaction_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+year_id+"'>";
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);		
		var username = gap.userinfo.rinfo.enm;
		if (gap.curLang == "ko"){
			username = gap.userinfo.rinfo.nm;
		}
		var ans_li2 = "			"+gap.lang.va1+"<br>";
		ans_li2 += "			"+gap.lang.va2+"<br>";
		ans_li2 += "			"+gap.lang.va3+"<br><br>";
		ans_li2 += gap.lang.va4.replace("$1", username).replace("$2","15").replace("$3","20") + "<br>";
		ans_li2 += "			<button type='button' class='btn_blue'><span id='"+year_id+"'>"+gap.lang.va5+"</span></button>";	
	   ans_li2 = gptpt.special_change(ans_li2);
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				$("#" + year_id).on("click", function(e){
					gptapps.date_set_dis(e.target);
				});
			}
		}
		var typed = new Typed("#dis_"+year_id, options);
	 },	 
	 
	 "search_email" : function(){
		//메일 검색하기
	    var year_id = "search_email_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+year_id+"'>";
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);				
		var ans_li2 = "			"+ "<div>"+gap.lang.va142+"</div>";
		ans_li2 += "			<button type='button' class='btn_blue' id='"+year_id+"_btn'>"+gap.lang.va143+"</button>";	
	    ans_li2 = gptpt.special_change(ans_li2);
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				$("#" + year_id + "_btn").off().on("click", function(e){
					
					var msg = $(e.currentTarget).text();
					gptpt.draw_request_msg_reservation(msg);						
					gptapps.search_email_query(msg, gptpt.current_code);			
					gap.scroll_move_to_bottom_time_gpt(200);
				});
			}
		}
		var typed = new Typed("#dis_"+year_id, options);
	 },	 
	
	 "date_set_dis" : function(obj){	
		var picker = $(obj).mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			theme: 'ios',
			themeVariant : 'light',
			display: 'anchored',
			controls: ['calendar'],
			select: 'range',	
			dateFormat: 'YYYY-MM-DD',	
			calendarType: 'month',	
	//		buttons: ['cancel'],
			pages : 1,
			touchUi : false,
			onInit: function (event, inst) {
				//하단에서 처리함 'setVal'
			},
			onChange : function (event, inst){				
				var spl = event.valueText.split(" - ");
				var st = spl[0];
				var et = spl[1];				
				var code = $(obj).data("key");
				var vacation_type = gptapps.vacation_check(code);
				var id = $(obj).data("key");							
				if (typeof(et) != "undefined"){				
					var msg = st + "~" + et + " <br>" + gap.lang.va7;					
					gap.showConfirm({
						title: "Confirm",
						contents: msg,
						callback: function(){				
							gptapps.ai_response_write(st + "~" + et + " " + gap.lang.va8);				
						}
					});				
				}else{					
				}				
				$(obj).val(gap.lang.va5);				
			}		
		}).mobiscroll('getInst');
		picker.open();
	},
	
	"vacation_check" : function(code){
		//code값을 가지고 월차 (vacation_1), 연차 (vacation_2), 여름휴가(vacation_3), 반차(vacation_4)를 넘겨서 총 기간과 남아 있는 기간 정보를 가져온다.
		var vacation_name = "";		
		var username = gap.userinfo.rinfo.nm;
		if (code == "vacation_1"){
			vacation_name = "월차"
		}else if (code == "vacation_2"){
			vacation_name = "연차"
		}else if (code == "vacation_3"){
			vacation_name = "여름휴가"
		}else if (code == "vacation_4"){
			vacation_name = "반차"
		}		
		var html = "<br><div style='margin-top:1px;padding-bottom:0px' >"+username + " " +gap.lang.va202+ " (" +vacation_name +" "+gap.lang.va203+")"+"</div>";
		return html;
	},
	 
	"reservartion_room" : function(){
		//회의실 등록하기
	    var rservation_id = "reservation_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+rservation_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);	
		var ans_li2 = "			"+gap.lang.va9+"<br>";
		ans_li2 += "			"+gap.lang.va10+"<br>";
		ans_li2 += "			ex) "+gap.lang.va11+"<br>";
		if (ismobile == "T"){
			ans_li2 += "			<div class='btn_wrap' style='display:inline-grid'>";
		}else{
			ans_li2 += "			<div class='btn_wrap'>";
		}		
		ans_li2 += "				<button type='button' class='btn_blue'><span>"+gap.lang.va12+"</span></button>";
		ans_li2 += "				<button type='button' class='btn_blue'><span>"+gap.lang.va13+"</span></button>";
		ans_li2 += "				<button type='button' class='btn_blue'><span>"+gap.lang.va14+"</span></button>";
		ans_li2 += "			</div>";
	   	ans_li2 = gptpt.special_change(ans_li2);
		var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);				
				gptpt.voice_end();
			}
		}
		var typed = new Typed("#dis_"+rservation_id, options);
	},
	
	
	"websearch_express" : function(){
		//웹 검색 후 요약하기 설명	
	    var web_id = "webscraping_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+web_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);	
		var ans_li2 = "			"+gap.lang.va52+"<br>";
		ans_li2 += "			"+gap.lang.va53+"<br>";
	//	ans_li2 += "			ex) "+gap.lang.va11+"<br>";
		if (ismobile == "T"){
			ans_li2 += "			<div class='btn_wrap' id='"+web_id+"_btn' style='display:inline-grid'>";
		}else{
			ans_li2 += "			<div class='btn_wrap' id='"+web_id+"_btn'>";
		}		
		ans_li2 += "				<button type='button' class='btn_blue'><span>"+gap.lang.va54+"</span></button>";
		ans_li2 += "				<button type='button' class='btn_blue'><span>"+gap.lang.va55+"</span></button>";
		ans_li2 += "				<button type='button' class='btn_blue'><span>"+gap.lang.va56+"</span></button>";
		ans_li2 += "			</div>";		
	   	ans_li2 = gptpt.special_change(ans_li2);
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				$("#" + web_id + "_btn button").on("click", function(e){
					gptpt.current_code = "it12";					
					var msg = $(e.currentTarget).find("span").text();
					gptpt.draw_request_msg(msg);	
					gptapps.query_make_pl(msg);
					//gptapps.query_make(msg);
				});
			}
		}
		var typed = new Typed("#dis_"+web_id, options);
	},
	
	"approval_write" : function(){
		//나의 결재 작성 할 수 있는 리스트를 표시해 준다.				
		var url = gptpt.approval_server + "/vwAprvList_Form?ReadViewEntries&start=1&count=50&ResortDescending=0&KeyType=time&TZType=GMT&outputformat=json&charset=utf-8";		
		$.ajax({
			type : "GET",
			url : url,
			contentType : "application/json; charset=utf-8",
			xhrFields : {
				withCredentials : true
			},
			success : function(data){			
				var cnt = data.viewentry.length-1;
				var answer_title = gap.lang.va28.replace("$$",cnt);
				var approval_list_id = "approval_list_" + new Date().getTime();
				var approval_li = "";
			 	approval_li += "<div id='ai_approval_box'>";
		        approval_li += "<div class='latest_approval_form_list'>";
		        approval_li += 		"<div class='list_title_wrap'>";
				approval_li += 			"<div class='list_title'>"+gap.lang.va95+"</div>"
				approval_li += 			"<div class='ai_approval_search_box'>";
		        approval_li +=				"<div class='ai_approval_input_wrap'><input type='text' class='ai_approval_input' placeholder='"+gap.lang.va57+"'><div class='btn_input_search'></div></div>";
		        approval_li += 			"</div>";
				approval_li += 		"</div>";
		    	approval_li +=		"<div class='list_box_wrap' id='"+approval_list_id+"'>";
				for (var i = 0 ; i < cnt; i++){
					var item = data.viewentry[i];
					var txt = item.entrydata[0].text[0];
					var form_key = item.entrydata[4].text[0];
					if (txt != ""){
						approval_li += "<div class='list_box' id='"+form_key+"'><div class='box_title_wrap'>";
						approval_li += "<div class='approval_img'></div>"+txt+"</div>";
						approval_li += "<button type='button' class='arrow_circle_right'></button>"
						approval_li += "</div>";
					}					
				}				
				approval_li += 		"</div>";
		        approval_li += 	"</div>"
		        approval_li += "</div>";
		        approval_li += "</div>";				
				var html = "";
				html += "<div class='ai_answer_wrap mail'><div class='ans_title'><div class='ai_img'></div><span class='ans_title_txt'>" + answer_title + "</span></div>";
				html += "<div class='ai_answer_box'>";
				html += approval_li + "</div>";
				html += "</div>";
				
				var approval_id = "approval_form_" + new Date().getTime();
				var hx = "<div id='"+approval_id+"'></div>";
				$("#"+gptapps.dis_id).append(hx);
				
			   html = gptpt.special_change(html);
			    var options = {
					strings : [html],
					typeSpeed : 1,
					contentType: 'html',
					onComplete: function(){
						gap.scroll_move_to_bottom_time_gpt(200);	
						//결재 버튼 관련 이베튼						
					    $("#ai_approval_box .list_box").off().on("click", function(e){
							var formkey = $(e.currentTarget).attr("id");
							var url = gptpt.approval_form_server + "/" + formkey + "?Openform&opentype=popup&tabtitle=new";
							gap.open_subwin(url, "1100", "850", "yes" , "", "yes");							
						});
						
						$("#ai_approval_box .ai_approval_input").off().on("keypress", function(e){
							if (e.keyCode == 13){
								var query = $(e.currentTarget).val();
								gptapps.search_approval_form(query, approval_list_id);
							}
						});
					}
				}
				var typed = new Typed("#"+approval_id, options);			   
			},
			error : function(e){
				gap.error_alert();
			}
		});    
	},
	
	"search_approval_form" : function(query, approval_list_id){
		//https://mail2.kmslab.com/work/2002.nsf/agFTSearchFormTitle?openagent&query=%EC%8B%A0%EC%B2%AD%EC%84%9C
		var url = gptpt.approval_server + "/agFTSearchFormTitle?openagent&query="+encodeURIComponent(query);
		$.ajax({
			type : "GET",
			url : url,
			dataType : "json",
			xhrFields : {
				withCredentials : true
			},
			success : function(res){
				var list = res.data;
				if (list){
					var approval_li = "";
					for (var i = 0; i < list.length; i++){
						var item = list[i];						
						approval_li += "<div class='list_box' id='"+item.Key+"'><div class='box_title_wrap'>";
						approval_li += "<div class='approval_img'></div>"+item.Name+"</div>";
						approval_li += "<button type='button' class='arrow_circle_right'></button>"
						approval_li += "</div>";
					}					
					$("#"+approval_list_id).html(approval_li);					
					//결재 버튼 관련 이베튼						
				    $("#ai_approval_box .list_box").off().on("click", function(e){
						var formkey = $(e.currentTarget).attr("id");
						var url = gptpt.approval_form_server + "/" + formkey + "?Openform&opentype=popup&tabtitle=new";
						gap.open_subwin(url, "1100", "850", "yes" , "", "yes");							
					});
				}
			},
			error : function(e){
				gap.error_alert();
			}
		})		
	},
	
	"approval_wait_list" : function(){
		//https://one.kmslab.com/work/2002.nsf/vwAprvList_Wait?ReadViewEntries&RestrictToCategory=CN%3DKM0035%20%EA%B9%80%EC%9C%A4%EA%B8%B0%2FO%3DKmslab%2FC%3Dkr&start=1&count=50&KeyType=time&TZType=GMT&charset=utf-8&1718463920116
		var url = gptpt.approval_server + "/vwAprvList_Wait_EmpNo?ReadViewEntries&RestrictToCategory="+gap.userinfo.rinfo.emp+"&start=1&count=50&KeyType=time&TZType=GMT&charset=utf-8&outputformat=json";
		$.ajax({
			type : "GET",
			url : url,
			contentType : "application/json; charset=utf-8",
			xhrFields : {
				withCredentials : true
			},
			success : function(data){				
				if (data.viewentry){
					var cnt = data.viewentry.length-1;
					answer_title = cnt + gap.lang.va58;			
					var ans_li = "";
					var html = "";				
					var approval_list = [];	
					for (var i = 0 ; i < cnt; i++){
						var item = data.viewentry[i];
						var title = item.entrydata[1].text[0];	
						var from = item.entrydata[5].text[0];
						var date = item.entrydata[4].datetime[0];
						date = moment(date, "YYYYMMDDTHHmmssZ");
						date = date.local().format("YYYY-MM-DD");
						var attach = item.entrydata[0].text[0];
						var key = item.entrydata[7].text[0];
						var unid = item["@unid"];						
						ans_li += "<div class='ans_ul'>";					
						ans_li += "		<li class='ans_li'>";					
						ans_li += "			<div class='ans_li_title_box'>";
						ans_li += "			<div class='ans_li_num'>"+(i+1)+".</div><div class='ans_li_title'>";
						ans_li += "			<div class='ans_li_title_wrap'>";
						ans_li += "				<div class='ans_li_title_txt_wrap'>";
						ans_li += "					<h4 class='ans_li_title_txt'>"+title+"</h4>";						
						if (attach == "T"){
							ans_li += "<button type='button' class='btn_mail_file_download'><span class='btn_img'></span><span class='mail_file_count'></span></button>";
						}					
						ans_li += "				</div>";
						ans_li += "				<div class='ans_btn_wrap'>";
						ans_li += "					<div class='ans_li_btn_wrap approval'>";
						ans_li += "						<button type='button' class='ans_li_btn original' data-id='"+unid+"'><span class='btn_img'></span><span>"+gap.lang.va59+"</span></button>";
						ans_li += "						<button type='button' class='ans_li_btn check' data-id='"+unid+"'><span class='btn_img'></span><span>"+gap.lang.va60+"</span></button>";
						ans_li += "						<button type='button' class='ans_li_btn reject' data-id='"+unid+"'><span class='btn_img'></span><span>"+gap.lang.va61+"</span></button>";
						ans_li += "					</div>";
						ans_li += "					<button type='button' class='btn_ans_li_fold'></button>";
						ans_li += "				</div>";
						ans_li += "			</div>";			
						ans_li += "		</div>";
						ans_li += "</div>";						
						ans_li += "<div class='ans_detail_ul'>";
						ans_li += "		<div class='ans_detail_li'>"+gap.lang.req_user+" : "+from+"</div>";
						ans_li += "		<div class='ans_detail_li'>"+gap.lang.va62+" : "+date+"</div>";
						if (key="F10"){
							var cid = "approval_detail_" + unid;
							approval_list.push(cid)
							ans_li += "		<div class='ans_detail_li' style='display:none; border:1px dashed rgb(199 197 197); border-radius:10px; padding:10px 20px;margin-top:7px' id='"+cid+"'></div>";
						}	
						ans_li += "</div>";						
						ans_li += "</li>";
					}					
					ans_li += "</div>";					
					html += "<div class='ai_answer_wrap mail'><div class='ans_title'><div class='ai_img'></div><span class='ans_title_txt'>" + answer_title + "</span></div>";
					html += "<div class='ai_answer_box'>";
					html += ans_li + "</div>";
					html += "</div>";			
					
					var approval_id = "approval_wait" + new Date().getTime();
					var hx = "<div id='"+approval_id+"'></div>";
					$("#"+gptapps.dis_id).append(html);					
					gap.scroll_move_to_bottom_time_gpt(200);	
							
					//결재 버튼 관련 이베튼						
				    $("#ai_approval_box .list_box").off().on("click", function(e){
						var formkey = $(e.target).attr("id");
						var url = gptpt.approval_form_server + "/" + formkey + "?Openform&opentype=popup&tabtitle=new";
						gap.open_subwin(url, "1400", "950", "yes" , "", "yes");							
					});
					
					$(".btn_ans_li_fold").off().on("click", function(){			
						var li = $(this).closest(".ans_li"); //요약된 메일 목록								
						$(this).toggleClass("fold");			
						li.find(".ans_li_info_wrap, .ans_detail_li").toggle();								
					});
					
					//결재 원문보기, 승인 , 반려 버튼 처리
					$(".ans_li_btn_wrap.approval .ans_li_btn").off().on("click", function(e){
						
						var cls = $(e.currentTarget).attr("class");
						var id = $(e.currentTarget).data("id");
						if (cls.indexOf("original") > -1){
							//원본 문서 보기
							var url = gptpt.approval_form_server + "/0/" + id + "?Opendocument&viewname=vwAprvList_Wait&opentype=popup&calloption=search";
							gap.open_subwin(url, "1100", "850", "yes" , "", "yes");	
						}else if (cls.indexOf("check") > -1){
							//승인하기
							var mms = "<div>"+gap.lang.va34+"</div>";				
							gap.showConfirm({
								title: "Confirm",
								contents: mms,
								callback: function(){	
									var aurl = gptpt.approval_server + "/ApprovalProcess?OpenAgent&PUNID="+id+"&Action=2";
									$.ajax({
										type : "GET",
										url : aurl,
										xhrFields : {
											withCredentials : true
										},
										success : function(data){
											if (data.indexOf("true") > -1){
												var tm = gap.lang.va35;
												gptapps.ai_response_write(tm);
											}
										},
										error : function(e){
											
										}
									})
									gptpt.current_code = "";		
									gptpt.voice_end();			
								}
							});					
							
						}else if (cls.indexOf("reject") > -1){
							//반려하기
							var mms = "<div>"+gap.lang.va36+"</div>";			
							gap.showConfirm({
								title: "Confirm",
								contents: mms,
								callback: function(){	
									var aurl = gptpt.approval_server + "/ApprovalProcess?OpenAgent&PUNID="+id+"&Action=4";
									$.ajax({
										type : "GET",
										url : aurl,
										xhrFields : {
											withCredentials : true
										},
										success : function(data){
											if (data.indexOf("true") > -1){
												var tm = gap.lang.va37;
												gptapps.ai_response_write(tm);
											}
										},
										error : function(e){
											
										}
									});									
									gptpt.current_code = "";		
									gptpt.voice_end();					
								}
							});								
						}
					});					
					
					//품의서의 경우 요약을 돌린다.
					for (var k = 0 ; k < approval_list.length; k++){
						var itm = approval_list[k];
						var url = gptpt.approval_server + "/0/" + itm.split("_")[2] + "/Body?OpenField&OutputFormat=text/plain";
						$.ajax({
							type : "GET",
							async : false,
							xhrFields: {
								withCredentials : true	
							},
							url : url,
							dataType : "text",
							success : function(res){								
								//console.log("code : ", code);
								res = res.replace(/<style[^>]*>.*?<\/style>/g, '');
								res = res.replace(/<\/?[^>]+(>|$)/g, '');
								$("#"+itm).fadeIn();
								if (res.length > 10){
									gptapps.gpt_summary_by_code(itm, res, gptpt.current_code);
								}else{
									$("#" + itm).append(gap.lang.va156);
								}								
							},
							error : function(e){
								//gap.error_alert();
							}
						});
					}
				}else{
					gptapps.ai_response_write(gap.lang.va29);
				}				
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"search_schedule_draw" : function(){
		//일정 검색하기
	    var rservation_id = "search_schedule_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+rservation_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);	
		var ans_li2 = "			"+gap.lang.va30+" ";
		ans_li2 += "			"+gap.lang.va10+"<br>";
		ans_li2 += "			ex) "+gap.lang.va33+"<br>";
		if (ismobile == "T"){
			ans_li2 += "			<div class='btn_wrap' style='display:inline-grid'>";
		}else{
			ans_li2 += "			<div class='btn_wrap'>";
		}		
		ans_li2 += "				<button type='button' class='btn_blue'><span>"+gap.lang.va31+"</span></button>";
		ans_li2 += "				<button type='button' class='btn_blue'><span>"+gap.lang.va32+"</span></button>";
		ans_li2 += "			</div>";
	    ans_li2 = gptpt.special_change(ans_li2);
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				//$("#search_work").focus();			
				gptpt.gpt_input_focus();	
				gptpt.voice_end();				
			}
		}
		var typed = new Typed("#dis_"+rservation_id, options);
	},
	
	"search_onedrive_draw" : function(){
		//ONE 드라이브 검색
	    var rservation_id = "search_onedrive_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+rservation_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);	
		var ans_li2 = "			"+gap.lang.va152+" ";
	    ans_li2 = gptpt.special_change(ans_li2);
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				//$("#search_work").focus();			
				gptpt.gpt_input_focus();	
				gptpt.voice_end();				
			}
		}
		var typed = new Typed("#dis_"+rservation_id, options);
	},
	
	"search_mcp_draw" : function(){
		//mcp 호출
	    var rservation_id = "search_mcp_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+rservation_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);	
		var ans_li2 = gap.lang.va204;		
	    ans_li2 = gptpt.special_change(ans_li2);
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				//$("#search_work").focus();			
				gptpt.gpt_input_focus();	
				gptpt.voice_end();				
			}
		}
		var typed = new Typed("#dis_"+rservation_id, options);
	},
	
	"innteraldata_search" : function(){
		//내부 자료 검색하
	    var rservation_id = "innteraldata_search_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+rservation_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);		
		var ans_li2 = "			"+gap.lang.va46+" ";
	    ans_li2 = gptpt.special_change(ans_li2);	    
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				//$("#search_work").focus();		
				gptpt.gpt_input_focus();		
				gptpt.voice_end();				
				gptapps.draw_internal_folder_list(rservation_id);			
			}
		}
		var typed = new Typed("#dis_"+rservation_id, options);
	},
	
	
	
	"draw_internal_folder_list" : function(rservation_id){		
		var url = gptpt.plugin_domain_fast + "folder/folder_list";
		var data = JSON.stringify({});
		$.ajax({
			url : url,
			data : data,
			method : "POST",
			crossDomain: true,
			contentType : "application/json; charset=utf-8",
			success : function(res){				
				var item = res[1];
				var html = "";
				html += "<div id='data_folder_wrap' class='data_folder_wrap'>";
				html += "	<div class='data_folder all_chk'>";
				html += "		<input type='checkbox' id='folder_0'>";
				html += "		<label for='folder_0'></label>";
				if (gap.curLang == "ko"){
					html += "		<span class='folder_name'>전체</span>";
					html += "	</div>";				
					for (var i = 0; i < item.length; i++){
						var info = item[i];
						var k = i+1;				
						html += "	<div class='data_folder' data-foldercode='"+info.folder_code+"'>";
						html += "		<input type='checkbox' id='folder_"+k+"'>";
						html += "		<label for='folder_"+k+"'></label>";
						html += "		<span class='folder_name'>"+info.folder_name+"</span>";
						html += "	</div>";
					}
				}else{
					html += "		<span class='folder_name'>All</span>";
					html += "	</div>";				
					for (var i = 0; i < item.length; i++){
						var info = item[i];
						var k = i+1;				
						html += "	<div class='data_folder' data-foldercode='"+info.folder_code+"'>";
						html += "		<input type='checkbox' id='folder_"+k+"'>";
						html += "		<label for='folder_"+k+"'></label>";
						html += "		<span class='folder_name'>"+info.folder_name_eng+"</span>";
						html += "	</div>";
					}
				}
				
				html += "</div>";				
				$("#dis_" + rservation_id).append(html);				
				$("#dis_" + rservation_id + " .data_folder").on("click", function(){	
					//선택할 수 있는 폴더의 총 갯수
					var total = $(this).siblings().length - 1;					
					//현재 선택한 폴더의 갯수
					var chk_count = $(this).parent().find(".regular_chkbox:checked").length;
					
					//전체선택 체크 시 모두 체크/ 체크해제시 모두 체크해제
					if($(this).hasClass("all_chk")){
						if($(this).find("input:checkbox").is(":checked") === false){
							$(this).addClass("active");
							$(this).siblings().addClass("active");
							$(this).find("input:checkbox").prop("checked", true);
							$(this).siblings().find("input:checkbox").prop("checked", true);
						} else {
							$(this).removeClass("active");
							$(this).siblings().removeClass("active");
							$(this).find("input:checkbox").prop("checked", false);
							$(this).siblings().find("input:checkbox").prop("checked", false);
						}
					} else {
						//각각의 폴더 체크 시 해당 폴더만 체크, 모두 체크 시 전체선택 체크 / 하나라도 체크해제 되면 전체선택 해제
						if($(this).find("input:checkbox").is(":checked") === false){
							if(total === chk_count){
								$(this).siblings(".all_chk").addClass("active");
								$(this).siblings(".all_chk").find("input:checkbox").prop("checked", true);
							}							
							$(this).addClass("active");
							$(this).find("input:checkbox").prop("checked", true);
						} else {
							$(this).siblings(".all_chk").removeClass("active");
							$(this).siblings(".all_chk").find("input:checkbox").prop("checked", false);
							$(this).removeClass("active");
							$(this).find("input:checkbox").prop("checked", false);
						}
					}					
				});								
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	},
	
	"draw_teams_list" : function(teams_id, list){
		var item = list;
		var html = "";				
		html += "<div id='teams_channel_list_"+teams_id+"' class='teams_channel_list'>";
		html += "	<div class='teams_wrap'>";
		html += " 		<div class='teams_chips' role='group'>";		
		for (var i = 0; i < item.data.length; i++){
			var info = item.data[i];
			html += "<button class='teams_chip' data-teamsid='"+info.team_id+"' data-teamsname='"+info.team+"' data-channelid='"+info.channel_id+"' data-channelname='"+info.channel_name+"'>";   //is-selected
			html += "	<span class='check_img'>"
			html += "	</span>";
			html += "	"+info.team+" > "+ info.channel_name
			html += "</button>"
		}		
		html += "		</div>";
		html += "	</div>";
		html += "</div>";		
		html += "<div class='btn_wrap' id='dis_html_"+teams_id+"'  style='justify-content: flex-end;'>	";
		html += "	<button type='button' id='btn_update_"+teams_id+"' class='btn_channel_update active' style='display: inline-block;'>";
		html += "		<span class='btn_inner'>";
		html += "			<span class='btn_ico'></span>";
		html += "			<span class='btn_name'>"+gap.lang.va282+"</span>";
		html += "		</span>";
		html += "	</button>";
		html += "	<button type='button' id='btn_summary_"+teams_id+"' class='btn_channel_summary active'>";
		html += "		<span class='btn_inner'>";
		html += "			<span class='btn_ico'></span>";
		html += "			<span class='btn_name'>"+gap.lang.va283+"</span>";
		html += "		</span>";
		html += "	</button>";
		html += "</div>";		
		$("#dis_" + teams_id).append(html);		
	},
	
	"draw_my_teams_channel_list" : function(teams_id){		
		var url = gptpt.plugin_domain_fast + "m365/my_teams_channel_list";
		var data = JSON.stringify({
			"m365" : gap.userinfo.rinfo.m365
		});
		$.ajax({
			url : url,
			data : data,
			method : "POST",
			crossDomain: true,
			contentType : "application/json; charset=utf-8",
			success : function(res){						
				var item = res[0];				
				gptapps.draw_teams_list(teams_id, item);		
				_self.teams_id = teams_id;						
				$("#dis_" + teams_id + " .teams_chip").off().on("click", function(e){
					_this = $(e.currentTarget);
					if (_this.attr("class").includes("is-selected")){
						_this.removeClass("is-selected");
					}else{
						_this.addClass("is-selected");
					}					
				});				
				$("#dis_" + teams_id + " .btn_channel_update").off().on("click", function(e){
					//채널 업데이트 	
					var data = JSON.stringify({
						"m365" : gap.userinfo.rinfo.m365
					});
					var url = gptpt.plugin_domain_fast + "m365/my_teams_channel_update";
					gap.ajaxCall(url, data, function(res){
						var item = res[0];
						gptapps.draw_teams_list(teams_id, item);				
					});	
				});				
				$("#dis_" + teams_id + " .btn_channel_summary").off().on("click", function(e){
					//선택 채널 요약하기					
					_this = $("#teams_channel_list_" + _self.teams_id);
					sub = _this.find(".is-selected");					
					var rservation_id = "teams_channel_search_" + new Date().getTime();
					var ans_li = "<div class='ai_answer_wrap'>";
					ans_li += "		<div><div class='ai_img'></div></div>";
					ans_li += "		<div class='ai_answer_box' id='dis_"+rservation_id+"'>";	
					ans_li += "		</div>";
					ans_li += "</div>";
					$("#"+gptapps.dis_id).append(ans_li);		
					var ans_li2 = "			" +gap.lang.va284.replace("$s$", sub.length);
				    ans_li2 = gptpt.special_change(ans_li2);	    
				    var options = {
						strings : [ans_li2],
						typeSpeed : 1,
						contentType: 'html',
						onComplete: function(){
							gap.scroll_move_to_bottom_time_gpt(200);	
							//$("#search_work").focus();							
							for (var i = 0 ; i < sub.length; i++){
								item = $(sub[i]);
								var teams_id = item.data("teamsid");
								var teams_name = item.data("teamsname");
								var channel_id = item.data("channelid");
								var channel_name = item.data("channelname");							
								var c_rservation_id = rservation_id + "_" + i;
								gptapps.draw_sub_channel_summary_dis(channel_name, teams_id, channel_id, teams_name, rservation_id, c_rservation_id);
								gptapps.teams_channel_summary(teams_id, channel_id, c_rservation_id)
							}								
							$(".channel_link").off().on("click", function(e){	
								var self = $(e.currentTarget)
								var teams_id = self.data("t1");
								var channel_id = self.data("t2");
								var channel_name = self.data("t3");
								var ten_id = "974a4117-4e78-49ed-9dec-30ffa9abac75";
								var url = "https://teams.microsoft.com/l/channel/"+channel_id+"/"+channel_name+"?groupId="+teams_id+"&tenantId="+ten_id
								gptapps.openweb(url);								
							});							
						}
					}
					var typed = new Typed("#dis_"+rservation_id, options);				
				});			
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	},	
	
	"draw_sub_channel_summary_dis" : function(channel_name, team_id, channel_id, teams_name, rservation_id, c_rservation_id){
		var html = "";
		html += "<div class='ans_ul'>";
		html += "	<div class='mail-container' id='channel_"+channel_id+"'>";
		html += "		<div class='mail-header'>";
		html += "			<div class='mail-title'>"
		html += "				<div class='mail-title-text'><h2>" + teams_name + " > ";
		html += "					<span class='channel_link' style='font-size:18px; color:#007bff' data-t1='"+team_id+"' data-t2='"+channel_id+"' data-t3='"+channel_name+"'>" + channel_name + "</span></h2></div>";
		html += "			</div>";
		html += "			<div class='mail-actions' data-key='"+channel_id+"'>";
		html += "				<div class='button icon_eamil_expand' data-action='expand'></div>"
		html += "			</div>"
		html += "		</div>";
		html += "		<div class='mail-body' id='channel_body_"+c_rservation_id+"' style='min-height:150px'>";
		html += "			<div class='processing_dis'>";
		html += "				<div class='item'>";
		html += "					<div><img src='/resource/images/Template/main3.gif' style='width:60px'></div>";
		html += "				</div>";
		html += "				<div class='item'>";
		html += "					<div>"+gap.lang.va285+"</div>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";		
		$("#dis_"+rservation_id).append(html);			

		$(".mail-actions .icon_eamil_expand").off().on("click", function(e){
			var cls = $(e.currentTarget).attr("class");
			if (cls.indexOf("pand on") > -1){
				$(e.currentTarget).removeClass("on");
				$(e.currentTarget).parent().parent().next().fadeIn();		
				$(e.currentTarget).parent().parent().removeClass("on");		
			}else{
				$(e.currentTarget).addClass("on");
				$(e.currentTarget).parent().parent().next().fadeOut();				
				$(e.currentTarget).parent().parent().addClass("on");
			}
		});
	},
	
	"teams_channel_summary" : function(teams_id, channel_id, rservation_id){
		var postData = JSON.stringify({
			"channel_id" : channel_id,
			"teams_id" : teams_id
		});
		var ssp = new SSE(gptpt.plugin_domain_fast + "m365/teams_channel_summary", {headers: {'Content-Type': 'application/json; charset=utf-8'},
			   payload:postData,
	           method: 'POST'}
	    );		    
	    var cc = "channel_body_"+rservation_id;
	    var accumulatedMarkdown = "";
		$("#" + cc).addClass("markdown-body");
		$("#" + cc).parent().css("white-space", "inherit");			
		ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");		
			ssp.close();	
		});		
		
		var is_end = false;
		ssp.addEventListener('message', function(e) {	
			//console.log(e.data);			
			
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n"); //.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");			
			if (e.data == "[DONE]"){
				is_end = true;				
				///// 답변이 끝나면 질문버튼 CSS 초기화
				$("#btn_work_req").removeClass("stop");	
				///// 답변이 끝나면 질문버튼 CSS 초기화
				//ssp.close();
        		//return;							
			}else{		
				if (is_end){
					
					let fixed = pph
					    .replace(/'/g, '"')   // 따옴표 변환
					    .replace(/\bNone\b/g, 'null');
					
					let arr = JSON.parse(fixed);
					
					var html = "";
					html += "<div class='ai-file-list'>";					
					for (var k = 0 ; k < arr.length; k++){
						
						var item = arr[k][0];
						//var item = xitem[0];
						console.log(item)
						if (arr[k].length > 1){
							for (var y = 0 ; y < arr[0].length; y++){
								item = arr[0][y];
								var extension = item.name.split('.').pop();
								var img_file = "";
								if (extension == "pptx" || extension == "ppt"){
									img_file = "ic-ppt-fill.svg";
								}else if (extension == "xlsx" || extension == "xls"){
									img_file = "ic-excel-fill.svg";
								}else if (extension == "docx" || extension == "doc"){
									img_file = "ic-word-fill.svg";
								}else if (extension == "pdf"){
									img_file = "ic-pdf-fill.svg";
								}else{
									ty = gap.is_file_type(item.name);
									if (ty == "img"){
										img_file = "ic-img-fill.svg";
									}
								}					
								html += "<div class='ai-file-card' data-id='"+item.id+"' data-url='"+item.contentUrl+"' data-name='"+item.name+"'>";
								html += "	<img src='../resource/images/ai/"+img_file+"' class='ai-file-icon' style='width:32px'>";
								html += "	<div class='ai-file-info'>";
								html += "		<div class='ai-file-name' title='"+item.name+"'>"+item.name+"</div>";
								html += "		<div class='ai-file-time'>"+gap.convertGMTLocalDateTime_new(item.time)+"</div>";
								html += "	</div>";
								html += "</div>";		
							}
						}else{
							var extension = item.name.split('.').pop();
							var img_file = "";
							if (extension == "pptx" || extension == "ppt"){
								img_file = "ic-ppt-fill.svg";
							}else if (extension == "xlsx" || extension == "xls"){
								img_file = "ic-excel-fill.svg";
							}else if (extension == "docx" || extension == "doc"){
								img_file = "ic-word-fill.svg";
							}else if (extension == "pdf"){
								img_file = "ic-pdf-fill.svg";
							}else{
								ty = gap.is_file_type(item.name);
								if (ty == "img"){
									img_file = "ic-img-fill.svg";
								}
							}					
							html += "<div class='ai-file-card' data-id='"+item.id+"' data-url='"+item.contentUrl+"' data-name='"+item.name+"'>";
							html += "	<img src='../resource/images/ai/"+img_file+"' class='ai-file-icon' style='width:32px'>";
							html += "	<div class='ai-file-info'>";
							html += "		<div class='ai-file-name' title='"+item.name+"'>"+item.name+"</div>";
							html += "		<div class='ai-file-time'>"+gap.convertGMTLocalDateTime_new(item.time)+"</div>";
							html += "	</div>";
							html += "</div>";		
						}
					
										
					}
					html += "</div>";
					$("#channel_body_"+rservation_id).append(html);
					
					$(".ai-file-list .ai-file-card").off().on("click", function(e){						
						var item = $(e.currentTarget);
						var id = item.data("id");
						var url = item.data("url");
						var name = item.data("name");
						var team_code = url.split("/")[4];						
						var is_personal = url.split("/")[3];
						
						
						var extension = name.split('.').pop();
						var pre_url = "";
						if (extension == "pptx" || extension == "ppt"){
							pre_url = "p";
						}else if (extension == "xlsx" || extension == "xls"){
							pre_url = "x";
						}else if (extension == "docx" || extension == "doc"){
							pre_url = "w";
						}
						
						var turl = "";
						if (is_personal == "personal"){
							turl = "https://kmslab-my.sharepoint.com/:"+pre_url+":/r/personal/"+team_code+"/_layouts/15/Doc2.aspx?sourcedoc="+id+"&file="+name+"&action=default"
						}else if (pre_url != ""){
							turl = "https://kmslab.sharepoint.com/:"+pre_url+":/r/sites/"+team_code+"/_layouts/15/Doc.aspx?sourcedoc="+id+"&file="+name+"&action=default"
						}else{
							turl = url;
						}
						
						gptapps.openweb(turl);	
						
					});
					
					//https://{tenant}.sharepoint.com/:p:/r/sites/{TeamName}/_layouts/15/Doc.aspx?sourcedoc={file-id}&file={FileName}.pptx&action=default
					//https://kmslab.sharepoint.com/:p:/r/sites/msteams_bb6bd4/_layouts/15/Doc.aspx?sourcedoc=670ca9d0-c32b-4af2-937c-58825a1b57d1&file=K-GPT 제품 소개 자료_Ver4.0.pptx&action=default

				}else if (pph != ""){
					accumulatedMarkdown += pph;
                	const html = marked.parse(accumulatedMarkdown);
                	$("#"+cc).html(html);	                	
                	//$("#"+cc).find("img").hide();
				}					
			}		
		});
		ssp.stream();    
		gptpt.source.push(ssp);    
	},	
	
	"teams_channel_search" : function(){
		//Teams에 내 채널 정보 가져오기
	    var rservation_id = "teams_channel_search_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+rservation_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);		
		var ans_li2 = "			"+gap.lang.va281+" ";
	    ans_li2 = gptpt.special_change(ans_li2);	    
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				//$("#search_work").focus();		
				gptpt.gpt_input_focus();		
				gptpt.voice_end();				
				gptapps.draw_my_teams_channel_list(rservation_id);			
			}
		}
		var typed = new Typed("#dis_"+rservation_id, options);
	},
	
	"make_marking_dis" : function(){
		//내부 자료 검색하
	    var rservation_id = "make_marking_dis_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+rservation_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);			
		var ans_li2 = "			"+ gap.lang.va51;
	    ans_li2 = gptpt.special_change(ans_li2);	    
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				//$("#search_work").focus();		
				gptpt.gpt_input_focus();		
				gptpt.voice_end();				
			}
		}
		var typed = new Typed("#dis_"+rservation_id, options);
	},
	
	
	"review_marking_dis" : function(){		
		//리뷰 분석기 
	    var review_id = "review_marking_dis_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+review_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);			
		var ans_li2 = "			"+ gap.lang.va63;
		ans_li2 += "			<div class='btn_wrap' >";
		ans_li2 += "				<button type='button' class='btn_blue' ><span id='review_file_upload_"+review_id+"'>"+gap.lang.va64+"</span></button>";
		ans_li2 += "				<div style='display:none' id='review_file_upload_pre_"+review_id+"'></div>";
		ans_li2 += "			</div>";
	    ans_li2 = gptpt.special_change(ans_li2);	    
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				//$("#search_work").focus();	
				gptpt.gpt_input_focus();			
				gptpt.voice_end();		
				//// 파일 업로드
				var _url = gptpt.plugin_domain_fast + "apps/review_file_upload"		
				var selectid = "review_file_upload_"+review_id;
				window.myDropzone_review = new Dropzone("#" + selectid, { // Make the whole body a dropzone
					url: _url,
					autoProcessQueue: true, 
					parallelUploads: 1, 
					maxFiles: 1,
					maxFilesize: 1024,
					timeout: 180000,
					uploadMultiple: false,
					acceptedFiles: '.txt',
					withCredentials: false,
					previewsContainer: "#review_file_upload_pre_"+review_id,
					clickable: "#" + selectid,
					renameFile: function(file){		
						return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
					},
					success : function(file, json){
						//alert('이미지 등록 성공');
						
						//gptapps.draw_review_anlayzer(json.res.replace(/\n/gi,"<br>"));
						gptapps.draw_review_anlayzer_stream(json.res);
					},
					error: function(){						
					}
				});				
				myDropzone_review.on("sending", function (file, xhr, formData) {
					var cc = "review_response_chat_" + new Date().getTime();	
					myDropzone_review.cc = cc;	
					gptapps.ai_mydata_response(cc);						
				});				
			}
		}
		var typed = new Typed("#dis_"+review_id, options);	
	},
	
	"draw_review_anlayzer" : function(msg){
		//gap.hide_loading();
		cc = myDropzone_review.cc;		
		msg = gptpt.change_markdown_html(msg);		
		var options = {
			strings : [msg],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);					
			}
		}
		var typed = new Typed("#"+cc, options);
	},	
	
	"draw_review_anlayzer_stream" : function(filepath){
		var cc = myDropzone_review.cc;
		var postData = JSON.stringify({
			"fp" : filepath,
			"lang" : gap.curLang,
			"code" : "review_file"
		})
		var ssp = new SSE(gptpt.plugin_domain_fast + "apps/review_file_analyzer", {headers: {'Content-Type': 'application/json; charset=utf-8'},
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
				$("#btn_work_req").removeClass("stop");				
				gptapps.write_btns_event(cc);		
				//gap.scroll_move_to_bottom_time_gpt(200);	
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
				}
						
			}		
		});
		ssp.stream();
		gptpt.source.push(ssp);	
	},
	
	"search_schedule" : function(txt, code){	
		var today = moment().format("YYYY-MM-DD");
		var todaymsg = "오늘 날짜는 " + today + " 입니다";    //한글로 남겨놔야 한다.
		var postData = {
			user : gap.userinfo.rinfo.nm,
			word : txt + " " + todaymsg,
			chat_history : history,
			code : code,
			roomkey : gptpt.cur_roomkey + "_search_schedule",
			call_code : gptpt.current_code
		};		
		gptpt.voice_end();
		$.ajax({
			crossDomain: true,
			type: "POST",
			//url : gptpt.plugin_domain + "pluginONE",
			url : gptpt.plugin_domain_fast + "apps/pluginReservation",
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){				
				//var jj = JSON.parse(res);	
				var jj = res;			
				var datedis = jj.status["수집한정보"]["검색일자"];
				var info_date = "";
				if (typeof(datedis) != "undefined"){
					gptpt.disdate = "T";
					info_date = datedis;
				}
				var info_att = "";			
				var att = jj.status["수집한정보"]["일정검색대상자"];
				if (typeof(att) != "undefined"){
					info_att = att;
					if (!$.isArray(att)){
						info_att = [att];
					}
				}				
				var pre_msg = jj.speak;			
				
				if (code == "ms02"){
					//M365 일정 검색일 경우
					gptapps.search_calendar_m365(info_att, info_date)
				}else{
					if (info_date != "" && info_att == ""){
						//검색 대상자를 지정하지 않는 경우 본인 일정을 검색한다.
						var me = gap.userinfo.rinfo;
						var emp = me.emp;
						var name = me.nm;
					    var mi = me.ms + "/" + me.mf
						gptapps.search_result_schedule(name, emp, info_date, mi);
						gap.hide_loading();      						
					}else if (info_date != "" && info_att != ""){
						//모든 정보가 세팅되어 일정 검색 진행 합니다.		
						gsn.requestSearch('', info_att.join(","), function(sel_data){
				             var obj = new Array();
				           //  let functionQ = [];
				             for (var i = 0 ; i < sel_data.length; i++){
				            	 obj.push(sel_data[i]);
				            	 var emp = sel_data[i].emp;
								 var name = sel_data[i].nm;
							     var mi = sel_data[i].ms + "/" + sel_data[i].mf
				            	 gptapps.search_result_schedule(name, emp, info_date, mi);
				             }		 
							 gap.hide_loading();         
				         });					
					}else{
						// 몇가지 정보가 설정되지 않아 추가로 질문한다.					
						var html = "<div class='reservation_meeting_cls'>";
						html += "<span >" +  pre_msg + "</span>";		
						html += "</div>";					
						gptapps.ai_response_write(html);			
					}	
				}							
				gap.scroll_move_to_bottom_time_gpt(200);				
				gap.hide_loading();						
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	 },
	 
	 "search_calendar_m365" : function(name, date){
		//일정 내용을 전송하고 요약된 내용을 수신한다.			
		var code = gptpt.current_code + "_summary";	
		var id = code + "_" + new Date().getTime();
		gptapps.ai_normal_response_url_summary(id);			
		var sq = sq;
		var query = name;
		var startdate = date.split("~")[0];
		var enddate = date.split("~")[1];		
		startdate = moment($.trim(startdate)).startOf('day').toISOString();
		enddate = moment($.trim(enddate)).endOf('day').toISOString();		
		var data = JSON.stringify({
			"sq" : sq,
			"query" : query,
			"startdate" : startdate,
			"enddate" : enddate,
			"call_code" : code,
			"user" : gap.userinfo.rinfo.nm,
			"lang": gap.curLang,
			"m365" : gap.userinfo.rinfo.m365
		});		
		

		var ssp = new SSE(gptpt.plugin_domain_fast + "m365/calendar_search", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:data,
				withCredentials: true,
	            method: 'POST'});
	            
	   	ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");		
			ssp.close();	
		});
		
		
	   	ssp.addEventListener('message', function(e) {	
			//console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", "&nbsp;").replace("<","&lt;").replace(">", "&gt;").replaceAll("#@creturn#@","<br>").replaceAll("**","").replaceAll("---", "<hr style='border:1px dashed #CCCCCC; height:1px'>");
			//gap.scroll_move_to_bottom_time_gpt(200);	
			if (e.data == "[DONE]"){		
				$("#btn_work_req").removeClass("stop");			
				//gap.scroll_move_to_bottom_time_gpt(200);	
				var tmsg = $("#" + id).html(); //.replace(/&lt;mailview/gi, "<mailview").replace(/mailview&gt;/gi,"mailview>");				
				tmsg = tmsg.replace(/&lt;scheduleview&gt;/g, "<scheduleview>");
                tmsg = tmsg.replace(/&lt;\/scheduleview&gt;/g, "</scheduleview>");				
				let matches = tmsg.match(/<scheduleview>(.*?)<\/scheduleview>/g);				
				msg = gptpt.change_markdown_html(tmsg);					
				$("#" + id).html(msg);		
				var items = $("#" + id + " scheduleview");
				for (var k = 0 ; k < items.length; k++){
					var item = items[k];
					var sid = $(item).text();
					$(item).attr("data-id", sid);
					$(item).text(gap.lang.vc);					
				}
 				$("scheduleview").off().on("click", function(e){
					var unid = $(e.currentTarget).data("id");		
					unid = unid.split("=")[0]+ "=";		
					var url = "https://outlook.office365.com/owa/?ItemID="+ encodeURIComponent(unid) + "&exvsurl=1&path=/calendar/item";
					console.log(url);
					gap.open_subwin(url, "1100", "750", "yes" , "", "yes");
				});				
				ssp.close();
        		return;
			}else{
				$("#"+id).append(pph);
			}				
		});
		ssp.stream();
		gptpt.source.push(ssp);		
	},
	
	"search_onedrive" : function(query){
		//onedrive를 검색한다.		
		var code = gptpt.current_code + "_summary";	
		var id = code + "_" + new Date().getTime();
		gptapps.ai_normal_response_url_summary(id);					
		var data = JSON.stringify({
			"query" : query,			
			"call_code" : code,
			"user" : gap.userinfo.rinfo.nm,
			"lang": gap.curLang,
			"m365" : gap.userinfo.rinfo.m365
		});		
		var url = gptpt.plugin_domain_fast + "m365/onedrive_search";
		gap.ajaxCall(url, data, function(res){			
			gap.hide_loading();			
			var html = "";		
			if (res.length > 0){				
				html += "		<div class='drive_file_table'>";		
				///// thead /////
				html += "			<div class='table_tr hd'>";
				html += "				<div class='table_td hd first'>"+gap.lang.filename+"</div>";
				html += "				<div class='table_td hd'>"+gap.lang.date+"</div>";
				html += "				<div class='table_td hd '>"+gap.lang.va2505+"</div>";
				html += "				<div class='table_td hd'>"+gap.lang.va206+"</div>";
				html += "			</div>";
				///// thead /////				
				/** ul **/
				html += "			<div class='table_tr_wrap'>";				
				for (var i = 0 ; i < res.length; i ++){
					var item = res[i];
					//html += "<div>" + item["name"] + "</div>";
					var is_folder = false;
					if (item["folder"]){
						is_folder = true;
					}					
					var webUrl = item["webUrl"];					
					/*** li ***/
					html += "				<div class='table_tr li'>";
					///// 파일명 ////
					html += "					<div class='table_td first'>";
					html += "						<div class='td_name_wrap'>";
			//		html += "							<div class='td_chkbox_wrap'>";
			//		html += "								<input type='checkbox' id='td_0' class='td_chkbox'><label for='td_0' class='td_label'></label>";
			//		html += "							</div>";
					if (is_folder){
						html += "							<div class='td_ico folder'></div>";
					}else{
						var file_ext = gap.file_icon_check(item["name"]);
						html += "							<div class='td_ico "+file_ext+"'></div>";
					}					
					html += "							<div class='td_name' data-id='"+webUrl+"'>"+item["name"]+"</div>";
					html += "						</div>";
					html += "						<button type='button' class='btn_td_more'></button>";
					html += "					</div>";
					// 날짜
					html += "					<div class='table_td'>"+gap.convertGMTLocalDateTime_new(item["createdDateTime"])+"</div>";
					// 만든이
					html += "					<div class='table_td'>"+item["createdBy"]["user"]["displayName"]+"</div>";
					//// 크기 ///
					html += "					<div class='table_td last'>";
					if (is_folder){
						var ccnt = item["folder"]["childCount"];
						html += "						<div class='size'>"+ccnt+ gap.lang.va207 +"</div>";
					}else{
						var size = gap.file_size_setting(item["size"]);
						html += "						<div class='size'>"+size+"</div>";
					}
					
		//			html += "						<button type='button' class='btn_go_to'></button>";
					html += "					</div>";
					html += "				</div>";
					/*** li ***/
				}
				
				html += 			"</div>";
				/** ul **/
				
				html += "		</div>";
				html +=	"</div>";
			}	
			
			$("#"+id).append(html);
			
			gap.scroll_move_to_bottom_time_gpt(500);
			
			$(".td_name").off().on("click", function(e){
				var url = $(e.currentTarget).data("id");	
				gap.popup_url(url);			
			//	var url = "https://outlook.office365.com/owa/?ItemID="+ encodeURIComponent(unid) + "&exvsurl=1&path=/calendar/item";
			//	gap.open_subwin(url, "1100", "750", "yes" , "", "yes");
			});
		});
		
		return false;
		/*
		var ssp = new SSE(gptpt.plugin_domain_fast + "m365/onedrive_search", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:data,
				withCredentials: true,
	            method: 'POST'});

	   	ssp.addEventListener('message', function(e) {	
			//console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", "&nbsp;").replace("<","&lt;").replace(">", "&gt;").replaceAll("#@creturn#@","<br>").replaceAll("**","").replaceAll("---", "<hr style='border:1px dashed #CCCCCC; height:1px'>");
			//gap.scroll_move_to_bottom_time_gpt(200);	
			if (e.data == "[DONE]"){		
				///// 답변이 끝나면 질문버튼 CSS 초기화
				$("#btn_work_req").removeClass("stop");			
				//gap.scroll_move_to_bottom_time_gpt(200);	
				var tmsg = $("#" + id).html(); //.replace(/&lt;mailview/gi, "<mailview").replace(/mailview&gt;/gi,"mailview>");				
				tmsg = tmsg.replace(/&lt;scheduleview&gt;/g, "<scheduleview>");
                tmsg = tmsg.replace(/&lt;\/scheduleview&gt;/g, "</scheduleview>");				
				let matches = tmsg.match(/<scheduleview>(.*?)<\/scheduleview>/g);				
				msg = gptpt.change_markdown_html(tmsg);					
				$("#" + id).html(msg);		
				var items = $("#" + id + " scheduleview");
				for (var k = 0 ; k < items.length; k++){
					var item = items[k];
					var sid = $(item).text();
					$(item).attr("data-id", sid);
					$(item).text(gap.lang.vc);					
				}
 				$("scheduleview").off().on("click", function(e){
					var unid = $(e.currentTarget).data("id");				
					var url = "https://outlook.office365.com/owa/?ItemID="+ encodeURIComponent(unid) + "&exvsurl=1&path=/calendar/item";
					gap.open_subwin(url, "1100", "750", "yes" , "", "yes");
				});				
				ssp.close();
        		return;
			}else{
				$("#"+id).append(pph);
			}				
		});
		ssp.stream();
		gptpt.source.push(ssp);
		*/		
	},
	
	
	"search_mcp" : function(query){
		//mcp를 검색한다.		
		var code = gptpt.current_code + "_summary";	
		var id = code + "_" + new Date().getTime();
		gptapps.ai_normal_response_url_summary(id);					
		var data = JSON.stringify({
			"query" : query,			
			"call_code" : code,
			"user" : gap.userinfo.rinfo.nm,
			"lang": gap.curLang,
			"roomkey" : gptpt.cur_roomkey
		});
		
		var accumulatedMarkdown = "";
		$("#" + id).addClass("markdown-body");
		$("#" + id).parent().css("white-space", "inherit");
		var ssp = new SSE(gptpt.plugin_domain_fast_mcp + "chat/stream", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:data,
				withCredentials: true,
	            method: 'POST'});
		ssp.addEventListener('open', function(e){
			gap.hide_loading();
		});

		
		ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");			
			ssp.close();
		});

	   	ssp.addEventListener('message', function(e) {	
			//console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n");
			if (e.data == "[DONE]"){	
				$("#btn_work_req").removeClass("stop");								
				ssp.close();
        		return;
			}else{
				//$("#"+id).append(pph);
				accumulatedMarkdown += pph;
				const html = marked.parse(accumulatedMarkdown);
				$("#"+id).html(html);
			}				
		});
		ssp.stream();
		gptpt.source.push(ssp);		
	},
	 
	 
	 "search_result_schedule" : function(name, emp, term, mi) {		
		var html = "";
		html += "<div class='gpt_emphasis_box'>";
		html += "<div class='gpt_emphasis_txt_wrap'>";
		html += "	<span class='gpt_emphasis_img'></span>";
		html +=  name + " "+term+ " " + gap.lang.va65 +". </span>";
		html += "</div>";
		html += "</div>";		
		$("#"+gptapps.dis_id).append(html);		
		var tm = term.split("~");
		var start = tm[0];
		var end = tm[1];		
		if (typeof(end) == "undefined"){
			end = start;
		}
		var sdate = moment(start).subtract(+1, 'days').format('YYYYMMDD[T000000Z]');
		var edate = moment(end).subtract(0, 'days').format('YYYYMMDD[T235959Z]');		
		var url = "https://" + mi+  "/CustomEventList?readviewentries&outputformat=json&count=99999&StartKey="+sdate+"&UntilKey="+edate+"&KeyType=time"
		if (gptpt.isDev){
			//url = url.replace("https:", "http:")
		}				
		$.ajax({
			method : "get",
			url : url,
			async: false,			
			xhrFields: {
				withCredentials: true	
			},
			contentType: "application/json; charset=utf-8",
			success : function(res){
				gptapps.draw_schedule(res);		
				//deferred.resolve();
			},		
			error : function(e){
				//deferred.reject();
				gap.error_alert();
			}
		});	
	 },	 	 
	 
	 "question_process" : function(list, question_id){

		//웹 검색색에서 생성된 질문 리스트 표시하기		
		var ans_li = "";
		ans_li += "<div class='ai_answer_chk'>";
		ans_li += "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_chk_txt' style='min-width:95%'>";
		ans_li += "			<div class='ai_answer_box' id='dis_"+question_id+"'>";	
		ans_li += "			</div>";
		ans_li += "		</div>";
		ans_li += "</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);	
		var ans_li2 = "<span class='ai_answer_txt' id='"+question_id+"_express'>" + gap.lang.va124 + "</span> <span class='ai_answer_desc' id='"+question_id+"_count'></span>";
		
	//	if (ismobile == "T"){
	//		ans_li2 += "<div id='ai_content_chk_box_wrap' class='ai_content_chk_box_wrap' style=' margin-top:5px; width:calc(100% - 20px)'>";
	//	}else{
			ans_li2 += "<div id='ai_content_chk_box_wrap' class='ai_content_chk_box_wrap' style=' margin-top:5px'>";
	//	}		
		for (var i = 0; i < list.length; i++){			
			ans_li2 += "<div class='content_box'>";
			ans_li2 += "	<div class='loading_img'></div>";
			ans_li2 += "	<div class='content_list_wrap'>";
			ans_li2 += "		<div class='content_title_box_wrap'>";
			ans_li2 += "			<span class='content_title'>"+list[i]+"</span>";
			ans_li2 += "			<button type='button' class='btn_chk_list_toggle'></button>";
			ans_li2 += "		</div>";
			ans_li2 += "		<div class='ai_chk_list_wrap' id='"+question_id+"_sub_" + i + "'>";
			ans_li2 += "		</div>";
			ans_li2 += "	</div>";
			ans_li2 += "</div>";			
		}		
		ans_li2 += "</div>";
		$("#dis_"+question_id).html(ans_li2);		
		
		$("#ai_content_chk_box_wrap .content_title_box_wrap").off().on("click", function(){
			if($(this).siblings(".ai_chk_list_wrap").children().length === 0){
				return;
			}
			$(this).children(".btn_chk_list_toggle").toggleClass("fold");
			$(this).siblings(".ai_chk_list_wrap").slideToggle(200);
		});	
		return false;
	},
	
	
	 "question_process_pl_start" : function(list, question_id){

		//웹 검색색에서 생성된 질문 리스트 표시하기		
		var ans_li = "";
		ans_li += "<div class='ai_answer_chk'>";
		ans_li += "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_chk_txt' style='min-width:95%'>";
		ans_li += "			<div class='ai_answer_box' id='dis_"+question_id+"'>";	
		ans_li += "			</div>";
		ans_li += "		</div>";
		ans_li += "</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);	
		var ans_li2 = "<span class='ai_answer_txt' id='"+question_id+"_express'>" + gap.lang.va124 + "</span> <span class='ai_answer_desc' id='"+question_id+"_count'></span>";
		
	//	if (ismobile == "T"){
	//		ans_li2 += "<div id='ai_content_chk_box_wrap' class='ai_content_chk_box_wrap' style=' margin-top:5px; width:calc(100% - 20px)'>";
	//	}else{
			ans_li2 += "<div id='ai_content_chk_box_wrap' class='ai_content_chk_box_wrap' style=' margin-top:5px'>";
	//	}		
		for (var i = 0; i < list.length; i++){			
			ans_li2 += "<div class='content_box'>";
			ans_li2 += "	<div class='loading_img'></div>";
			ans_li2 += "	<div class='content_list_wrap'>";
			ans_li2 += "		<div class='content_title_box_wrap'>";
			ans_li2 += "			<span class='content_title'>"+list[i]+"</span>";
			ans_li2 += "			<button type='button' class='btn_chk_list_toggle'></button>";
			ans_li2 += "		</div>";
			ans_li2 += "		<div class='ai_chk_list_wrap' ><div id='"+question_id+"_sub_" + i + "'></div>";
			ans_li2 += "		</div>";
			ans_li2 += "	</div>";
			ans_li2 += "</div>";			
		}		
		ans_li2 += "</div>";
		$("#dis_"+question_id).html(ans_li2);		
		
		$("#ai_content_chk_box_wrap .content_title_box_wrap").off().on("click", function(){
			if($(this).siblings(".ai_chk_list_wrap").children().length === 0){
				return;
			}
			$(this).children(".btn_chk_list_toggle").toggleClass("fold");
			$(this).siblings(".ai_chk_list_wrap").slideToggle(200);
		});	
		return false;
	},
	
	"draw_loading_layer_show" : function(question_id){
		var html = "";		
		html += "<div id='"+question_id+"_loading' style='height:200px; width:100%; margin-top:5px'>";		
		html += "	<div class='gpt_emphasis_box'>";
		html += "		<div class='gpt_emphasis_txt_wrap'><span class='gpt_emphasis_img'></span><span style='font-weight:500; font-size:15px'>"+gap.lang.va126+"</span></div>";
		html += "	</div>";
		html += "	<div class='skeleton_loading' style='width:100%; height:20px; position:relative'>";
		html += "		<div class='skeleton_txt'></div>";
		html += "	</div>";
		html += "	<div class='skeleton_loading' style='margin-top:10px; width:80%; height:20px; position:relative'>";
		html += "		<div class='skeleton_txt'></div>";
		html += "	</div>";
		html += "	<div class='skeleton_loading' style='margin-top:10px; width:30%; height:20px; position:relative'>";
		html += "		<div class='skeleton_txt'></div>";
		html += "	</div>";		
		html += "	<div class='skeleton_loading' style='margin-top:10px; width:60%; height:20px; position:relative'>";
		html += "		<div class='skeleton_txt'></div>";
		html += "	</div>";
		html += "	<div class='skeleton_loading' style='margin-top:10px; width:70%; height:20px; position:relative'>";
		html += "		<div class='skeleton_txt'></div>";
		html += "	</div>";
		html += "	<div class='skeleton_loading' style='margin-top:10px; width:80%; height:20px; position:relative'>";
		html += "		<div class='skeleton_txt'></div>";
		html += "	</div>";
		html += "</div>";
		$("#dis_"+question_id).append(html);
	},
	
	"draw_loading_layer_hide" : function(question_id){
		$("#" + question_id + "_loading").fadeOut();		
		$("#dis_" + question_id).find(".loading_img").addClass("check");		
		$("#dis_" + question_id).find(".btn_chk_list_toggle").click();
	},
	
	"question_process_urls" : function(list, question_id){	
		//질문별 검색하는 URL 리스트 표시하기
		var url_count = 0;
		for (var i = 0; i < list.length; i++){
			var item = list[i];			
			var ans_li2 = "";
			ans_li2 += "<div>";
			for (var k = 0 ; k < item.urls.length; k++){
				url_count++;
				var kitem = item.urls[k];			
			//	if (ismobile == "T"){
			//		ans_li2 += "<span class='chk_list' style='margin-left:10px;margin-top:5px'>" + kitem.title + "</span>";
			//	}else{
					ans_li2 += "<span class='chk_list' style='margin-left:10px;margin-top:5px'><a href='"+kitem.url+"' target='_blank'>" + kitem.title + "</a></span>";
			//	}				
			}		
			ans_li2 += "</div>";			
			ans_li2 = gptpt.special_change(ans_li2);
			var options = {
				strings : [ans_li2],
				typeSpeed : 20,
				contentType: 'html',
				onComplete: function(){
				//	gap.scroll_move_to_bottom_time_gpt(200);				
				//	gptpt.voice_end();						
				}
			}
			var typed = new Typed("#" + question_id + "_sub_" + i, options);			
		} 
		
		//setTimeout(function(){
			gptapps.draw_loading_layer_show(question_id);
			gap.scroll_move_to_bottom_time_gpt(200);
		//}, 10);
			
		$("#" + question_id + "_count").html("("+gap.lang.va125.replace("$n$", url_count)+")") 
	},	 
	
	"query_make" : function(question){		
		var ty = $("#select_engine_name").text();
		var type = ty.toLowerCase().replace("-","");
		if (type == "perplexity"){
			gptapps.search_type = "perplexity";
			gptapps.webquery_stream(question);
			return false;
		}	
		var question_id = "question_" + new Date().getTime();
		var url = gptpt.plugin_domain_fast + "apps/make_query"
		var data = JSON.stringify({
			"query" : question,
			"lang" : gap.curLang
		});	
		gap.ajaxCall(url, data,
			function(res){
				var querys = res.result;
				let start = Date.now();
				gptapps.start_time = start;
				gptapps.question_process(querys, question_id);
				gptapps.search_urls(question, querys, question_id);
				
				gap.scroll_move_to_bottom_time_gpt(200);
			}
		);		
	 },

	"query_make2" : function(question, id){			
		var questions = $("#tx_"+id).prev().find(".content_title");
		var qlist = [];
		for (var k = 0; k < questions.length; k++){
			qlist.push(questions[k].textContent)
		}		
		var ty = $("#select_engine_name").text();
		var type = ty.toLowerCase().replace("-","");		
		var question_id = "question_" + new Date().getTime();
		var url = gptpt.plugin_domain_fast + "apps/make_query2"
		var data = JSON.stringify({
			"query" : question,
			"qlist" : qlist.join(","),
			"lang" : gap.curLang
		});	
		gap.ajaxCall(url, data,
			function(res){
				var querys = res.result;				
				/***** 20250116 출처 관련 *****/
				var html = "<div class='related_content_box rel_info_content_box'>";				
				html += "	<div class='related_content_title_box'>";
				html += "		<div class='related_content_title_wrap'>";
				html += "			<div class='content_title_img rel_info'></div>";
				html += "			<div class='content_title'>"+gap.lang.va147+"</div>";
				html += "		</div>";
				html += "		<button type='button' class='btn_content_fold'>";
				html += "	</div>"; //related_content_title_box				
				html += "	<div class='related_content_list_wrap rel_info_wrap'>";
				//추천콘텐츠 이미지
				for(var i = 0; i <  querys.length; i++){
					var item = querys[i];
					html += "	<div class='related_content_li'>";
					html += "		<div class='related_content_li_title'>"+item+"</div>";
					html += "		<button type='button' class='btn_li_folder'></button>";
					html += "	</div>"; //related_content_item
				}
				html += "	</div>"; //related_content_item_wrap				
				html += "</div>"; //related_content_box
				/***** 20250116 출처 관련 *****/				
				$("#"+ id + "_btns").parent().append(html);				
				$(".related_content_li").off().on("click", function(e){
					var obj = $(e.currentTarget);
					var msg = $(obj).find(".related_content_li_title").text();					
					gptpt.current_code = "it12";					
					gptpt.draw_request_msg(msg);	
					gptapps.query_make(msg);
				});				
			}
		);		
	 },
	 
	 
	 "query_make_pl" : function(question){		

		var ty = $("#select_engine_name").text();
		var type = ty.toLowerCase().replace("-","");
		if (type == "perplexity"){
			gptapps.search_type = "perplexity";
			gptapps.webquery_stream(question);
			return false;
		}	
		var question_id = "question_" + new Date().getTime();
		var url = gptpt.plugin_domain_fast + "apps/make_query"
		var data = JSON.stringify({
			"query" : question,
			"lang" : gap.curLang
		});	
		gap.ajaxCall(url, data,
			function(res){
				var querys = res.result;
				
				
				gptapps.question_process_pl_start(querys, question_id);
				gptapps.webquery_stream_pl(question, querys, question_id);
				gap.scroll_move_to_bottom_time_gpt(200);
			}
		);		
	 },

	"search_urls" : function(query, querys, question_id){				
		var ty = $("#select_engine_name").text();
		var type = ty.toLowerCase().replace("-","");
		gptapps.search_type = "";
		if (type == "kgpt"){
			type = "google";
		}		
		var url = gptpt.plugin_domain_fast + "apps/search_urls_async"
		var data = JSON.stringify({
			"query" : querys,
			"type" : type
		});		
		gap.ajaxCall(url, data,
			function(res){
				var querys = res.result;
				gptapps.question_process_urls(querys, question_id);				
				var urls = [];
				for (var i = 0 ; i < querys.length; i++){
					var item = querys[i];
					for (var k = 0; k < item.urls.length; k++){
						var item2 = item.urls[k];
						urls.push(item2.url);
					}
				}
				gap.scroll_move_to_bottom_time_gpt(200);			
				gptapps.webquery_stream(query, urls, question_id);				
			}
		)
	},
	

	
	"draw_webquery_express_change" : function(id){
		//검토가 진행중이라는 표현을==>검토가 완료되었다고 변경해 준다.
		$("#" + id + "_express").html(gap.lang.va140);
		$("#" + id + "_count").hide();
	},
	 
	 "webquery_stream" : function(txt, querys, question_id){		
		gptpt.chatgpt_stream_start();		
		var deepthink = "F";
		if ($('#btn_toggle_deepthink').hasClass('active')) {
			deepthink = "T";
		}
		var id = "web_" + new Date().getTime();		
		
		var postData = JSON.stringify({
			"user" : gap.userinfo.rinfo.nm,
			"query" : txt,
			"querys" : querys,
			"call_code" : gptpt.current_code,
			"lang" : gap.curLang,
			"roomkey" : gptpt.cur_roomkey,
			"project_code" : gptpt.cur_project_code,
			"deepthink" : deepthink,
			"id" : id + "_" + gap.userinfo.rinfo.ky
		});	
		
	   	var query_url = "apps/genai_stream";

		if ($('#btn_cancel_search_option_select .btn_ico').length > 0){
			var stype = $('#btn_cancel_search_option_select .btn_ico').attr("class").split(" ")[1];
		  	if (stype == "perplexity"){
				query_url = "apps/perplexity_stream";
			}else if (stype == "websearch"){
				query_url = "apps/genai_stream";
			}
		}
	   	
		var ssp = new SSE(gptpt.plugin_domain_fast + query_url, {headers: {'Content-Type': 'application/json; charset=utf-8'},
		        payload:postData,
		        method: 'POST'});	     
        
	//	$("#" + id).show();		
		
		//gap.show_loading(gap.lang.va48);
		gptpt.voice_end();		
		
		//yisearch가 스트림 안에 있으면 멈추는 현상이 있어 별도로 분리한다.		
		gptapps.ai_normal_response_stream(id);			
	//	gptapps.yisearch(txt, id + "_sub");	
		
		ssp.addEventListener('open', function(e) {
			//gap.hide_loading();
			//gptapps.ai_normal_response(id);				
			//유트브와 이미지 검색을 실행한다.
			$("#tx_" + id).fadeIn();
			gptapps.draw_loading_layer_hide(question_id);			
			gptapps.draw_webquery_express_change(question_id);	
			
			gap.scroll_move_to_bottom_time_gpt(200);	
		});				
		var accumulatedMarkdown = "";		
		$("#" + id).addClass("markdown-body");
		$("#" + id).parent().css("white-space", "inherit");
		
		
		ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");		
			ssp.close();	
		});
		
		var is_code = false;
	   	ssp.addEventListener('message', function(e) {		
			//console.log(e.data)		
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n");											
			if (e.data == "[DONE]"){			
				$("#btn_work_req").removeClass("stop");		
				gptpt.chatgpt_stream_end();			
			//	gptpt.autolink("#"+id);
			//	gap.scroll_move_to_bottom_time_gpt(200);					
				//유트브와 이미지 검색을 실행한다.
				gptapps.yisearch(txt, id);		
			//	gptapps.query_make2(txt, id);							
				gptapps.write_btns_event(id);				
				$("#" + id + "_sub").show();
				
				ssp.close();
        		return;
			}else{				
				accumulatedMarkdown += pph;
                const html = marked.parse(accumulatedMarkdown);
                $("#"+id).html(html);
  			}		
		});		
		ssp.stream();
		gptpt.source.push(ssp);
	},
	
	
	"webquery_stream_pl" : function(txt, querys, question_id){		
		gptpt.chatgpt_stream_start();		
		var deepthink = "F";	
		
		var id = "web_" + new Date().getTime();		
			
		var postData = JSON.stringify({
			"user" : gap.userinfo.rinfo.nm,
			"query" : txt,
			"querys" : querys,
			"call_code" : gptpt.current_code,
			"lang" : gap.curLang,
			"roomkey" : gptpt.cur_roomkey,
			"project_code" : gptpt.cur_project_code,
			"deepthink" : deepthink,
			"id" : id + "_" + gap.userinfo.rinfo.ky
		});	
		
	   	var query_url = "apps/genai_stream_pl";

		if ($('#btn_cancel_search_option_select .btn_ico').length > 0){
			var stype = $('#btn_cancel_search_option_select .btn_ico').attr("class").split(" ")[1];
		  	if (stype == "perplexity"){
				query_url = "apps/perplexity_stream";
			}else if (stype == "websearch"){
				query_url = "apps/genai_stream_pl";
			}
		}
	   	
		var ssp = new SSE(gptpt.plugin_domain_fast + query_url, {headers: {'Content-Type': 'application/json; charset=utf-8'},
		        payload:postData,
		        method: 'POST'});	     
        

		
		gptpt.voice_end();		
		
		//yisearch가 스트림 안에 있으면 멈추는 현상이 있어 별도로 분리한다.		
		gptapps.ai_normal_response_stream(id);			
		
		ssp.addEventListener('open', function(e) {			
			//유트브와 이미지 검색을 실행한다.
			$("#tx_" + id).fadeIn();
			gptapps.draw_loading_layer_hide(question_id);			
			gptapps.draw_webquery_express_change(question_id);	
			
			gap.scroll_move_to_bottom_time_gpt(200);	
		});				
		var accumulatedMarkdown = "";		
		$("#" + id).addClass("markdown-body");
		$("#" + id).parent().css("white-space", "inherit");
		
		
		ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");		
			ssp.close();	
		});
		
		var is_code = false;
		var is_text_start = false;
		var is_rel_draw = false;
		var is_end = false;
	   	ssp.addEventListener('message', function(e) {		
			//console.log(e.data)		
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n");	
													
			if (e.data == "[DONE]"){			
				$("#btn_work_req").removeClass("stop");		
				gptpt.chatgpt_stream_end();					
				//유트브와 이미지 검색을 실행한다.
				gptapps.yisearch(txt, id);									
				gptapps.write_btns_event(id);				
				$("#" + id + "_sub").show();				
				
				$("#" + id).html(function(_, html) {
				  return html.replace(/\[(\d+)\]/g, '<sup class="ref" data-key="'+id+'">[$1]</sup>');
				});
				
				$("#" + id + " .ref").off().on("click", function(e){
					var im = $(e.currentTarget).text().replace("[","").replace("]","");
					var pid = $(e.currentTarget).data("key");
					var xurl = $("#tx_" + pid).prev().find("[data-index='"+im+"']").attr("href");
					window.open(xurl, null);
							
				});
				
			//	$("#" + id).html().match(/\[\d+\]/g).off().on("click", function(e){
			//		var itm = $(e.currentTarget).data("data-index");
			//		alert(itm);
			//	});
				
				is_end = true;
				ssp.close();
        		return;
			}else{
				if (is_text_start){
				
					//var refs = pph.match(/\[\d+\]/g);
					//console.log(refs);
						
						
					accumulatedMarkdown += pph;
                	const html = marked.parse(accumulatedMarkdown);
                	$("#"+id).html(html);
				}else{
					//URL 정보를 받아서 그린다.
					
					if (!is_rel_draw){					
						var list = eval(pph);
						gptapps.question_process_pl(list, question_id);
						is_rel_draw = true;
					}				
				}
				if (e.data == "[URLS_END]"){
					is_text_start = true;
				}
				

  			}		
		});		
		ssp.stream();
		gptpt.source.push(ssp);
	},
	
	 "question_process_pl" : function(list, question_id){
		//웹 검색색에서 생성된 질문 리스트 표시하기
		for (var k = 0 ; k < list.length; k++){
			var item = list[k];					
			var ans_li2 = "";
			ans_li2 += "<span class='chk_list' style='margin-left:10px;margin-top:5px'><a href='"+item.url+"' target='_blank' data-index='"+(k+1)+"'>" + item.title + "</a></span>";
			var id = k % 5;			
			$("#" + question_id + "_sub_" + id).append(ans_li2);
		}				
	},	
		
	"write_btns_event" : function(id){
		if (ismobile != "T"){
			$("#" + id + "_btns").show().fadeIn();
		}		
		//AI 답변 아이콘버튼
		$("#" + gptapps.dis_id + " .gpt_btn_wrap .btn_ai_answer").off().on("mouseenter", function(e){						
			var name = e.currentTarget.classList[1]; //버튼의 이름
			var $this = $(this);
			var rect = e.target.getBoundingClientRect();			
			// 요소의 중앙 좌표 계산
  			var centerX = rect.left + rect.width / 2;
  			var centerY = rect.top + rect.height / 2;			
			var pos = [centerX, centerY];			
			gptapps.ai_answer_btn_bubble_box(name, $this, pos);			
		});
		$("#" + gptapps.dis_id + " .gpt_btn_wrap .btn_ai_answer").on("mouseleave", function(e){
			$("#btn_bubble_box").remove();
		});
		
		$("#" + gptapps.dis_id + " .gpt_btn_wrap .btn_ai_answer.copy").on("click", function(e){	
			var id = $(e.currentTarget).data("id");
			gnote.range_text_copy(id);
		});
		
		$("#" + gptapps.dis_id + " .gpt_btn_wrap .btn_ai_answer.share").on("click", function(e){	
			var id = $(e.currentTarget).data("id");
			gptapps.showNoteShare(id);
		});
		
		$("#" + gptapps.dis_id + " .btn_save_to_note").on("click", function(e){	
			var id = $(e.currentTarget).data("id");			
			var content = $("#" + id).html();
			var title = $("#" + id).parent().parent().prevUntil(".my_que_wrap").last().prev().text();	
			//팝업창을 띄워서 어떤 노트북에 등록 할 것인지 선택하면 notebook_code가 리턴되고 해당 값을 활용하여 아래 함수를 수행한다.		
			
			gnote.save_as_note_layer_draw(title, content);					
		});
	},
	
	"notebook_save" : function(title, content, notebook_code){
		gnote.ai_note_save_fn(title, content, notebook_code, "answer", "kgpt");			
	},
	
	"ai_answer_btn_bubble_box": function(name, $this, pos){		
		var name_ko = "";
		if(name === "copy") {
			name_ko = gap.lang.copy;
		}
		if(name === "share") {
			name_ko = gap.lang.share;
		}		
		var html = "";		
		html += "<div id='btn_bubble_box'>" + name_ko + "</div>";		
		$this.append(html);
		
		//마우스를 올린 버튼의 중앙지점에 말풍선을 위치시킨다.
		$("#btn_bubble_box").css({
			"left": pos[0],
			"top": pos[1] + 10
		});		
	},
		
	"yisearch" : function(msg, id){		
		var ht = "";
		/*
		$("#" + id + "_btns").parent().append("<div class='relate_div' id='relate_div_"+id+"'></div>").fadeIn();
		var xmsg = gap.lang.va208;
		var options = {
			strings : [xmsg],
			typeSpeed : 50,
			backSpeed : 30,
			loop : true,
			contentType: 'html',
			onComplete: function(){
							
			}
		}
		var typed = new Typed("#relate_div_"+id, options);			
		*/
		
		var postData = JSON.stringify({
			"query" : msg
		});
		gptpt.voice_end();		
		$.ajax({
			//crossDomain: true,
			type: "POST",
			url : gptpt.plugin_domain_fast + "apps/yisearch",
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){		
				if (res.result == "ERROR"){
					gptapps.ai_response_write(gap.lang.va66);
					return false;
				}else{					
					var html = "";					
					//GPT 추천콘텐츠
					html += "<div class='related_content_wrap'>";					
					//관련된 유튜브 영상
					html += "<div class='related_content_box yotube_content_box'>";					
					html += "<div class='related_content_title_box'>";
					html += "<div class='related_content_title_wrap'><div class='content_title_img youtube_img'></div><div class='content_title'>"+gap.lang.va72+"</div></div>";
					html += "<button type='button' class='btn_content_fold'>";
					html += "</div>"; //related_content_title_box					
					//추천콘텐츠 표시할 개수
					//추천콘텐츠 영상
					html += "<div class='related_content_item_wrap youtube_video_wrap'>";
					var video_array = res.result.video_array;
					for(var i = 0; i < video_array.length; i++){
						var item = video_array[i];
						html += "<div class='related_content_item youtube_video_box' data-url='"+item.link+"'>";
						html += "<div class='related_content_thumb youtube_video_thumb'  style='background-image:url("+item.thumbnail+")'></div>";
						html += "<div class='related_content_item_title' title='"+item.title+"'>"+item.title+"</div>";
						html += "</div>"; //related_content_item
						if (ismobile == "T"){
							if (i == 2){
								break;
							}
						}
					}					
					html += "</div>"; //related_content_wrap					
					html += "</div>"; //related_content_box					
					//관련된 이미지
					html += "<div class='related_content_box rel_img_content_box'>";					
					html += "<div class='related_content_title_box'>";
					html += "<div class='related_content_title_wrap'><div class='content_title_img rel_img'></div><div class='content_title'>"+gap.lang.va73+"</div></div>";
					html += "<button type='button' class='btn_content_fold'>";
					html += "</div>"; //related_content_title_box					
					html += "<div class='related_content_item_wrap rel_img_wrap'>";
					//추천콘텐츠 이미지
					var image_array = res.result.image_array;
					for(var k = 0; k < image_array.length; k++){
						var item = image_array[k];
						html += "<div class='related_content_item rel_img_box' data-url='"+item.link+"'>";
						html += "<div class='related_content_thumb rel_img_box_thumb'  style='background-image:url("+item.thumbnail+")'></div>";
						html += "<div class='related_content_item_title'>"+item.title+"</div>";
						html += "</div>"; //related_content_item
						if (ismobile == "T"){
							if (k == 2){
								break;
							}
						}
					}
					html += "</div>"; //related_content_wrap					
					html += "</div>"; //related_content_box					
					html += "</div>";		
					$("#relate_div_"+id).remove();					
					$("#" + id + "_btns").parent().append(html);					
					$(".youtube_video_box").off().on("click", function(e){
						var url = $(e.currentTarget).data("url");
						gptapps.openweb(url);
					});					
					$(".rel_img_box").off().on("click", function(e){
						var url = $(e.currentTarget).data("url");
						gptapps.openweb(url);
					});					
					//gap.scroll_move_to_bottom_time_gpt(1000);							
					gptapps.query_make2(msg, id);
				}			
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	},	
	
	"openweb" : function(url){
		window.open(url, null);	
	},
	 
	 "webquery": function(msg){		
		var postData = JSON.stringify({
			"user" : gap.userinfo.rinfo.nm,
			"query" : msg
		});
		gptpt.voice_end();		
		$.ajax({
			//crossDomain: true,
			type: "POST",
			url : gptpt.plugin_domain_fast + "apps/genai",
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){		
				if (res.result == "ERROR"){
					gptapps.ai_response_write(gap.lang.va66);
					return false;
				}				
				gap.hide_loading();				
				var isOne = false;				
				var msg = res.result;
				msg = msg.replace(/[\n\r]/gi,"<br>");
				msg = gptpt.change_markdown_html(msg);		
			//	msg = marked.parse(msg);		
				var id = "web_" + new Date().getTime();				
				gptapps.ai_normal_response(id);				
				if (res.result.indexOf("comp.fnguide.com") > -1){
					//해당 정보가 포함된 경우 타이핑 하면 브라우저가 멈춘다.
					$("#" + id).html(msg);
					gap.scroll_move_to_bottom_time_gpt(200);						
					//$("#search_work").focus();			
					gptpt.gpt_input_focus();			
					gptpt.autolink("#"+id);
				}else{					
					var intervalId = setInterval(function(){
					//	console.log("interval")
                   		gap.scroll_move_to_bottom_time_gpt(200);		
                 	}, 2000);
				   msg = gptpt.special_change(msg);
				    var options = {
						strings : [msg],
						typeSpeed : 1,
						contentType: 'html',
						onComplete: function(){
							gap.scroll_move_to_bottom_time_gpt(200);	
							//$("#search_work").focus();			
							gptpt.gpt_input_focus();			
							gptpt.autolink("#"+id);
							clearInterval(intervalId);						
						}
					}
					var typed = new Typed("#"+id, options);				    
				}			
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	},
	
	"insa_eval" : function(){
		var insa_result_dis = "insa_result_" + new Date().getTime();
		answer_title = "<strong id='"+insa_result_dis+"_name'>솔루션개발팀 김아름</strong>님의 인사평가는 다음과 같습니다.";
		var answer_content = "";
		var html = "";
	 	var total_member = 13; // 보여지는 멤버이미지의 최대 갯수
		var hide_length = total_member - 10;		
		var hr_data = [
		    {
		        "name": "김아름",
		        "dept": "솔루션개발 1팀",
		        "job": "대리",
		        "ev_score": [
		            {
		                "item": "업무이해도",
		                "score": 4.9
		            },
		            {
		                "item": "적극성",
		                "score": 4.7
		            },
		            {
		                "item": "책임감",
		                "score": 4.4
		            },
		            {
		                "item": "독창성",
		                "score": 4
		            },
		            {
		                "item": "노력도",
		                "score": 4.7
		            },
		            {
		                "item": "근면성",
		                "score": 4.7
		            }
		        ]
		    }
		];
		
		answer_content += "<td class='qna_cell info'>";
		answer_content += "<div class='team_info_wrap'>";
		answer_content += "<h3 class='team_info_title'>" + hr_data[0].dept + "</h3>";
		answer_content += "<div class='member_profile_wrap'>";
		answer_content += "<div class='profile_img_wrap'>";
		
		for (var i = 0; i < total_member - 2; i++) {
		if (i < total_member - 3) {
			answer_content += "<div class='member_img' style='transform: translate(" + 40 * i + "px, -50%); background-image: url(../resource/images/emp0" + i + "_img.jpg);'></div>";
		} else {// 보여지는 멤버이미지의 최대 갯수보다 멤버가 많을 경우
			answer_content += "<div class='member_more' style='transform: translate(" + 40 * (total_member - 3) + "px, -50%);'><span>+" + hide_length + "</span></div>";
		}
		}
		
		answer_content += "</div>";
		answer_content += "<div class='member_search_wrap'>";
		answer_content += "<input type='text' id='input_member_search' class='member_search_input' placeholder='사용자 검색'>";
		answer_content += "<button type='button' id='btn_member_search' class='member_search_img'></button></div>";
		
		answer_content += "</div>";
		answer_content += "<div class='person_info_wrap'>";
		answer_content += "<div class='info_wrap'><h3 class='info_title'>정보</h3>";
		answer_content += "<div class='info_box'>";
		answer_content += "<div class='info_box_top'><div class='info_person_img' style='border-radius:7px; background-image: url(../resource/images/emp09_img.jpg);'></div>";
		
		answer_content += "<div class='info_txt_wrap'><ul class='info_ul'>";
		answer_content += "<li class='info_li'><h4 class='info_title'>이름</h4><span class='info_span'>" + hr_data[0].name + "</span></li>"
		answer_content += "<li class='info_li'><h4 class='info_title'>부서</h4><span class='info_span'>" + hr_data[0].dept + "</span></li>"
		answer_content += "<li class='info_li'><h4 class='info_title'>직급</h4><span class='info_span' id='"+insa_result_dis+"_jobtitle'>" + hr_data[0].job + "</span></li>"
		answer_content += "<li class='info_li'><h4 class='info_title'>등급</h4><span class='info_rank'>A</span class='info_span'></li>"
		answer_content += "</ul></div>";
		
		answer_content += "</div>";
		answer_content += "<div class='info_doc_file_wrap'>";
		answer_content += "<div class='info_doc_box'><h3 class='info_title info_doc_title'>이력서</h3><div class='file_wrap'><div class='file_txt_wrap'><div class='file_img'></div><span class='file_name'>김아름_이력서.pdf</span></div><button type='button' id='btn_resume_file_download' class='download_img_wrap'><span class='download_img'></span></button></div></div>";
		answer_content += "<div class='info_doc_box'><h3 class='info_title info_doc_title'>인사평가지</h3><div class='file_wrap'><div class='file_txt_wrap'><div class='file_img'></div><span class='file_name'>김아름_2024_인사평가지_최종.pdf</span></div><button type='button' id='btn_ev_file_download' class='download_img_wrap'><span class='download_img'></span></button></div></div>";
		
		answer_content += "</div>";
		answer_content += "</div>";
		answer_content += "</div>";
		
		answer_content += "<div class='ev_wrap'><h3 class='info_title'>평가</h3>";
		answer_content += "<div class='ev_box'>";
		answer_content += "<div class='ev_table'>";
		answer_content += "<div class='ev_tr'><div class='ev_th'>평가 항목</div><div class='ev_th'>점수(5점 만점)</div></div>";
		
		var total_ev_score = 0; //평가항목 점수 합계
		
		for (var i = 0; i < hr_data[0].ev_score.length; i++) {
			answer_content += "<div class='ev_tr'>";
			answer_content += "		<div class='ev_td ev_title'>";
			answer_content += "			<sup class='ev_num'>" + (i + 1) + ")</sup>";
			answer_content += "			<span>" + hr_data[0].ev_score[i].item + "</span>";
			answer_content += "		</div>";
			answer_content += "		<div class='ev_td ev_score'>" + hr_data[0].ev_score[i].score + "</div>";
			answer_content += "</div>";
			total_ev_score += hr_data[0].ev_score[i].score;
		}
		
		answer_content += "<div class='ev_tr'><div class='ev_td last'>최종점수</div><div class='ev_td last'>" + total_ev_score + "</div></div>";
		answer_content += "</div><div id='chart_wrap'><canvas id='hr_rador_chart'></canvas></div>";
		
		answer_content += "</div>"; //ev_box
		answer_content += "</div>"; //ev_wrap
		answer_content += "</div>"; //person_info_wrap
		
		answer_content += "<div class='ai_opinion_box_wrap'>";
		answer_content += "<div class='ai_title_wrap'><h3 class='ai_opinion_title'>AI 종합 의견</h3><span class='update_wrap'>최종 업데이트 : <span class='update_date'>2024년 6월 14일</span></span></div>";
		
		answer_content += "<div  id='"+insa_result_dis+"' style='padding:20px; border:1px dashed gray; border-radius:10px;display:none' ></div>";
		answer_content += "<div class='ai_opinion_box'>";
		answer_content += "		<div class='ai_opinion_textarea_wrap'><textarea class='ai_opinion_textarea' placeholder='인사평가 내용을 등록 해주세요'></textarea>";
		answer_content += "			<button type='button' class='btn_ai_opinion_save'><span>저장하기</span></button>";
		answer_content += "		</div>";
		answer_content += "</div>";
		answer_content += "</div>";
		answer_content += "</div>";
		answer_content += "</div>";
		answer_content += "</div>";
		
		html += "<div class='ai_answer_wrap mail'><div class='ans_title'><div class='ai_img'></div><span class='ans_title_txt'>" + answer_title + "</span></div>";
		html += "<div class='ai_answer_box'>"; 
		html += answer_content + "</div>";
		html += "</div>";
		
		$("#"+gptapps.dis_id).append(html);
		
		gptapps.ai_graph_draw();
			
		//사원 이미지 클릭 시 테두리 표시
		$("#area_ai_result .member_img").on("click", function(){

			var mask_html = '';
			mask_html = "<div class='emp_mask'><div class='emp_mask_inner'></div><button type='button' class='btn_del_bookmark_emp'></button></div>";

			$(this).toggleClass("select");
			
			if($(this).hasClass("select")){
				$(this).siblings().removeClass("select").find(".emp_mask").remove();
				$(this).append(mask_html);
			} else {
				$(".emp_mask").remove();
			}
		});
			
		var name = $("#"+insa_result_dis + "_name").text();
		var jobtitle = $("#"+insa_result_dis + "_jobtitle").text();
		var txt = name + " " + jobtitle + "의 인사 평가 정수는 업무이해도 4.9점, 적극성 4.7점, 책임감 4.4점, 독창성 4점, 노력도 4.7점, 근면성 4.7점입니다.";
		txt += "프로젝트 이력과 코멘트 입니다."
		txt += "프로젝트명 : 상반기 UI & UX 프로젝트 (2024.01 ~ 2024.05)";
		txt += "코멘트 :프로젝트 잘 진행했고 기술적으로 뛰어나고 잘 정리된 표준안 채택에 높은 점수를 받음"
		txt += "프로젝트 명 : 하반기 인사 시스템 고도 (2024.08 ~ 2024.12)"
		txt += "코멘트 : 모바일 부분에 다소 아쉬움이 있지만 웹 파트는 세련된 UI와 뛰어난 기능 구현으로 사용자들에게 높은 점수를 받음"
		gptapps.insa_eval_ai(txt, insa_result_dis);
			
		$(".btn_ai_opinion_save").off().on("click", function(e){					
			
		});		
		return false;
	},
	
	"insa_eval_ai" : function(txt, id){
		var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : txt,
			chat_history : "",
			code : "it11",
			call_code : "it11",
			lang : gap.curLang
		});					
		var ssp = new SSE(gptpt.plugin_domain_fast + "apps/pluginMail", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	            method: 'POST'});
	           
		$("#" + id).show();
		
		ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");			
			ssp.close();
		});
		
	   	ssp.addEventListener('message', function(e) {				
			var pph = e.data.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");			
			if (e.data == "[DONE]"){
				$("#btn_work_req").removeClass("stop");			
				var tmsg = $("#" + id).html();
				tmsg = gptpt.change_markdown_html(tmsg);
				$("#" + id).html(tmsg);
				gptpt.autolink("#"+id);
				gap.scroll_move_to_bottom_time_gpt(500);
				ssp.close();
        		return;		
			}else{
				$("#"+id).append(pph);
				gap.scroll_move_to_bottom_time_gpt(500);	
			}		
		});
		ssp.stream();
		gptpt.source.push(ssp);	
	},
	
	//ai 답변에 차트 그래프 그리는 함수
	"ai_graph_draw": function(){		
		//인사평가
		var rador_chart = $("#hr_rador_chart");
        // 인사평가
        new Chart(rador_chart, {
            type: 'radar',
            data: {
                datasets: [{
                    label: '능력 분포 그래프',
                    data: [4.9, 4.7, 4.4, 4, 4.7, 4.7],
                    backgroundColor: "#31609440",
                    pointBackgroundColor: "transparent",
                    pointBorderColor: "transparent",
                    borderColor: "transparent",
                    pointLabels: false,
                }],
                labels: [1, 2, 3, 4, 5, 6],
            },
            options: {
                scales: {
                    r: {
                        pointLabels: {
                            font: {
								padding: -1,
                                size: 16,
								weight: "800",
                            },
                            color: "#999"
                        },
                        angleLines: false,
						grid: {
							color: "#ddd"
						},
                        ticks: {
							display: false,
			                stepSize: 1
                        },
                        min: 1,
                        max: 5
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            boxWidth: 0,
                            font: {
								family: "Pretendard",
                                weight: "700",
                                size: "16px"
                            },
							color: "#000",
                        },
                        onClick: null
                    }
                }
            },
            plugins: []
        });
	},
	
	
	"mark_meeting_summary" : function(){
		//회의록 작성하기
	    var review_id = "marke_meeting_summary_dis_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		
		if (ismobile == "T"){
			ans_li += "		<div class='ai_answer_box' id='dis_"+review_id+"'>";	
		}else{
			ans_li += "		<div class='ai_answer_box' id='dis_"+review_id+"' style='display:inline'>";	
		}
		
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);			
		var ans_li2 = "			"+ "1. "+gap.lang.va75+"<br>2. "+gap.lang.va76+" <b>'"+gap.lang.va77+"'</b> "+gap.lang.va78+" <b>'"+gap.lang.va79+"'</b> " + gap.lang.va80;
		ans_li2 += "			<div class='btn_wrap' >";
		ans_li2 += "				<button type='button' class='btn_blue' ><span id='meeting_file_upload_"+review_id+"'>"+gap.lang.va81+"(.mp3, .webm, .m4a)</span></button>";
		ans_li2 += "				<button type='button' class='btn_blue' ><span id='meeting_file_record_start_"+review_id+"'>"+gap.lang.va77+"</span></button>";
		ans_li2 += "				<button type='button' class='btn_blue' style='display:none' id='meeting_file_record_end_"+review_id+"_btn'><span id='meeting_file_record_end_"+review_id+"'>"+gap.lang.va79+"</span></button>";
		ans_li2 += "				<button type='button' class='btn_blue' style='display:none' id='meeting_file_record_download_"+review_id+"_btn'><a id='meeting_file_record_download_"+review_id+"' download='recording.webm'>"+gap.lang.download+"</a><button>";
		ans_li2 += "				<audio id='meeting_file_record_end_"+review_id+"_audio' controls style='display:none'></audio>";		
		ans_li2 += "				<div style='display:none' id='meeting_file_upload_pre_"+review_id+"'></div>";
		ans_li2 += "			</div>";		
		ans_li2 += "		<div>";
	//	ans_li2 += "		<button type='button' class='btn_blue' style='display:none' id='meeting_file_record_download_"+review_id+"_btn'><a id='meeting_file_record_download_"+review_id+"' download='recording.webm'>다운로드</a><button>			<audio id='meeting_file_record_end_"+review_id+"_audio' controls style='display:none'></audio> </div>";
	    ans_li2 = gptpt.special_change(ans_li2);	    
	    gptapps.mediaRecorder;
      	gptapps.recordedChunks = [];	        
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				//$("#search_work").focus();		
				gptpt.gpt_input_focus();		
				gptpt.voice_end();		
				
				$("#meeting_file_record_start_" + review_id).off().on("click", async function(e){
					$("#meeting_file_record_end_"+review_id+"_btn").show();
					try {
			          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			          gptapps.mediaRecorder = new MediaRecorder(stream);
			
			          gptapps.mediaRecorder.ondataavailable = function(event) {
			            if (event.data.size > 0) {
			              gptapps.recordedChunks.push(event.data);
			            }
			          };
			
			          gptapps.mediaRecorder.onstop = function() {						
			            const blob = new Blob(gptapps.recordedChunks, { type: 'audio/webm; codecs=opus' });
			            const audioURL = URL.createObjectURL(blob);
			           	$("#meeting_file_record_end_"+review_id+"_audio").attr('src', audioURL);
			
			            // 다운로드 링크 생성 및 표시
			            const downloadLink = $('#meeting_file_record_download_'+review_id);
			            downloadLink.attr('href', audioURL);
			            //downloadLink.show();			
			            gptapps.recordedChunks = [];			            
			            
			            gap.showConfirm({
							title: "Confirm",
							contents: gap.lang.va209,
							callback: function(){									
								gptapps.proceedings_write_layer_draw("record", blob);							
							}
						});		            
			          };			
			          gptapps.mediaRecorder.start();
			        } catch (err) {
			          console.error('Error accessing media devices.', err);
			        }					
				});	
				
				$("#meeting_file_record_end_" + review_id).off().on("click", function(e){					
					$("#meeting_file_record_download_"+review_id + "_btn").show();
					$("#meeting_file_record_end_"+review_id+"_audio").show();
					gptapps.mediaRecorder.stop();
				});	
			
				//// 파일 업로드
				var _url = gptpt.plugin_domain_fast + "apps/meeting_file_upload";
				var selectid = "meeting_file_upload_"+review_id;
				window.myDropzone_review = new Dropzone("#" + selectid, { // Make the whole body a dropzone
					url: _url,
					autoProcessQueue: false, 
					parallelUploads: 1, 
					maxFiles: 1,
					maxFilesize: 1024,
					timeout: 180000000,
					uploadMultiple: false,
					acceptedFiles: '.mp3, .webm, .m4a',
					withCredentials: false,
					previewsContainer: "#meeting_file_upload_pre_"+review_id,
					clickable: "#" + selectid,
					renameFile: function(file){		
						return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
					},
					success : function(file, json){
						//alert('이미지 등록 성공');				
						gptapps.draw_review_anlayzer(json.res.replace(/\n/gi,"<br>"));						
						//한번 업로드 하면 못하게 막는데 다시 실행해서 해야 한다.
						var dropzoneControl = $("#meeting_file_upload_"+review_id)[0].dropzone;
						if (dropzoneControl){
							dropzoneControl.destroy();
						}
					},
					error: function(){
						gptapps.draw_review_anlayzer(gap.lang.va210);
					}
				});				
				myDropzone_review.on("addedfiles", function (file) {
					gptapps.proceedings_write_layer_draw("file");
			    });
				myDropzone_review.on("sending", function (file, xhr, formData) {				
					formData.append("ky", gap.userinfo.rinfo.ky);		
					formData.append("title", myDropzone_review.title);					
					formData.append("data", myDropzone_review.data);					
					formData.append("user", gap.userinfo.rinfo.nm);
					formData.append("call_code", gptpt.current_code);			
					formData.append("lang", gap.curLang);		
					var cc = "meeting_response_chat_" + new Date().getTime();	
					myDropzone_review.cc = cc;	
					gptapps.ai_mydata_response(cc);						
				});				
			}
		}
		var typed = new Typed("#dis_"+review_id, options);	
	},
	
	
	"image_analyzer" : function(){	
		//이미지 분석하기
	    var review_id = "image_anayzer_dis_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+review_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);			
		var ans_li2 = "			"+ gap.lang.va91;
		ans_li2 += "			<div class='btn_wrap' >";
		ans_li2 += "				<button type='button' class='btn_blue' ><span id='image_analyzer_file_upload_"+review_id+"'>"+gap.lang.va92+"(.png, .jpg)</span></button>";		
		ans_li2 += "				<div style='display:none' id='image_analyzer_file_upload_pre_"+review_id+"'></div>";
		ans_li2 += "			</div>";		
		ans_li2 += "		<div>";	
	    ans_li2 = gptpt.special_change(ans_li2);		    
	        
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				//$("#search_work").focus();		
				gptpt.gpt_input_focus();		
				gptpt.voice_end();					
				//// 파일 업로드
				var _url = gptpt.plugin_domain_fast + "apps/image_analyzer_file_upload";
				var selectid = "image_analyzer_file_upload_"+review_id;
				window.myDropzone_image_analyzer = new Dropzone("#" + selectid, { // Make the whole body a dropzone
					url: _url,
					autoProcessQueue: true, 
					parallelUploads: 1, 
					maxFiles: 1,
					maxFilesize: 1024,
					timeout: 180000000,
					uploadMultiple: false,
					acceptedFiles: '.png, .jpg',
					withCredentials: false,
					previewsContainer: "#image_analyzer_file_upload_pre_"+review_id,
					clickable: "#" + selectid,
					renameFile: function(file){		
						return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
					},
					success : function(file, json){
						//alert('이미지 등록 성공');						
						var cc = myDropzone_image_analyzer.cc;						
						msg = gap.lang.va93 +"<br><div id='"+cc+"_image'></div>";						
						var options = {
							strings : [msg],
							typeSpeed : 1,
							contentType: 'html',
							onComplete: function(){
								//var filename = gptpt.cur_roomkey + "." + myDropzone_image_analyzer.ext;
								var filename = myDropzone_image_analyzer.image_path + "." + myDropzone_image_analyzer.ext;
								var img_url = gptpt.plugin_domain_fast + "apps/file_download_image_analyzer?filename="+filename;
								$("#"+cc + "_image").html("<img src='"+img_url+"' style='width:auto; max-width:500px;border-radius:10px;'>");								
								gap.scroll_move_to_bottom_time_gpt(200);		
								//$("#search_work").focus();	
								gptpt.gpt_input_focus();									
							}
						}
						var typed = new Typed("#"+cc, options);								
						//한번 업로드 하면 못하게 막는데 다시 실행해서 해야 한다.
						var dropzoneControl = $("#image_analyzer_file_upload_"+review_id)[0].dropzone;
						if (dropzoneControl){
							dropzoneControl.destroy();
						}
					},
					error: function(){
						gptapps.draw_review_anlayzer(gap.lang.va94);
					}
				});				
				myDropzone_image_analyzer.on("sending", function (file, xhr, formData) {
					//formData.append("ky", gap.userinfo.rinfo.ky);
					var image_path = gptpt.cur_roomkey + "_" + + new Date().getTime();
					formData.append("roomkey", image_path);					
					myDropzone_image_analyzer.image_path = image_path;					
					var cc = "image_analyzer_response_chat_" + new Date().getTime();	
					myDropzone_image_analyzer.cc = cc;						
					var extension = file.name.split('.').pop().toLowerCase();
					myDropzone_image_analyzer.ext = extension;						
					gptapps.ai_mydata_response(cc);	
				});				
			}
		}
		var typed = new Typed("#dis_"+review_id, options);	
	},
	
	
	"podcast_upload" : function(){
		//podcast 분석하기
	    var podcast_id = "podcast_upload_dis_" + new Date().getTime();
	    var selectid = "podcast_file_upload_"+podcast_id;
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+podcast_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);			
		var ans_li2 = "			"+ gap.lang.va169;
		ans_li2 += "			<div class='btn_wrap' >";
		ans_li2 += "				<button type='button' class='btn_blue' ><span id='podcast_file_upload_"+podcast_id+"'>"+gap.lang.file_upload+"(.pdf, .pptx, .docx, .txt, .hwp, url)</span></button>";		
		ans_li2 += "				<div style='display:none' id='podcast_file_upload_pre_"+podcast_id+"'></div><div style='display:none' id='"+selectid+"_btn'></div>";
		ans_li2 += "			</div>";		
		ans_li2 += "		<div>";	
	    ans_li2 = gptpt.special_change(ans_li2);		   
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				//$("#search_work").focus();		
				gptpt.gpt_input_focus();		
				gptpt.voice_end();					
				$("#"+selectid).off().on("click", function(e){
					gptapps.draw_layer_file_upload();
				});		
			
				//// 파일 업로드
				var _url = gptpt.plugin_domain_fast_podcast + "file_upload";				
				window.myDropzone_podcast = new Dropzone("#" + selectid + "_btn", { // Make the whole body a dropzone
					url: _url,
					autoProcessQueue: false, 
					parallelUploads: 10, 
					maxFiles: 10,
					maxFilesize: 1024,
					timeout: 180000000,
					uploadMultiple: false,
					acceptedFiles: '.pdf, .pptx, .docx, .txt, .hwp',
					withCredentials: true,
					previewsContainer: "#podcast_file_upload_pre_"+podcast_id,
			//		clickable: "#" + selectid,
					renameFile: function(file){		
						return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
					},
					success : function(file, json){
						//alert('이미지 등록 성공');						
						var filename = file.name;
						var md5 = json.res.md5;
						gptapps.insert_file_md5_div(filename, md5);						
					},
					error: function(){
						alert("ERROR");
						//gptapps.draw_review_anlayzer(gap.lang.va94);
					}
				});							
				myDropzone_podcast.id = podcast_id;
				myDropzone_podcast.on("sending", function (file, xhr, formData) {				
					//formData.append("ky", gap.userinfo.rinfo.ky);
					var image_path = gptpt.cur_roomkey + "_" + + new Date().getTime();
					formData.append("roomkey", image_path);
					formData.append("urls", "kkk");									
					var extension = file.name.split('.').pop().toLowerCase();
					myDropzone_podcast.ext = extension;						
				//	gptapps.ai_mydata_response(cc);	
				});		
				
				myDropzone_podcast.on("queuecomplete", function (file) {									
					var filelist = [];
					if ($("#file_list_ul .upload_file_li").length > 0){
						$("#file_list_ul .upload_file_li").each(function(index, val){
							var fileinfo = new Object();
							fileinfo.filename = $(val).data("fn");
							fileinfo.md5 = $(val).data("md5");
							filelist.push(fileinfo);
						});
					}
					
					var urls = [];
					if ($("#link_ul .insert_link_li").length > 0){
						var list = $("#link_ul .insert_link_li").find(".link_name");					
						for (var i = 0 ; i < list.length; i++){
							urls.push($(list[i]).text());
						}
					}				
					
					$("#btn_layer_close").click();
					gptapps.draw_generating_podcast(filelist, urls, myDropzone_podcast.id);
					var md5s = []
					for (var k = 0; k < filelist.length; k++){
						md5s.push(filelist[k].md5);
					}					
					var combined = md5s.concat(urls);
					var info = combined.join("-spl-");				
					var id = myDropzone_podcast.id;
					gptapps.loading_file_check(id);					
					//gptapps.make_podcast(id, info);					
				});		
			}
		}
		var typed = new Typed("#dis_"+podcast_id, options);		
	},
	
	"insert_file_md5_div" : function(filename, md5){
	
		$("#file_list_ul .upload_file_li").each(function(index, val){
			if ($(val).data("fn") == filename){
				$(val).attr("data-md5", md5);
				$(val).find(".file_ico").removeClass("loading");
			}
		});
	},
	
	"project_file_upload" : function(pjt_key){		
		//// 파일 업로드
	 	var project_id = "project_upload_dis_" + pjt_key;
	    var selectid = pjt_key;
		var _url = gptpt.plugin_domain_fast_podcast + "file_upload_project";	
		var dropzoneControl = $("#sel_" + pjt_key + "_btn")[0].dropzone;
		if (dropzoneControl){
			dropzoneControl.destroy();
		}		
		window.myDropzone_project = new Dropzone("#sel_" + pjt_key + "_btn", { // Make the whole body a dropzone
			url: _url,
			autoProcessQueue: false, 
			parallelUploads: 10, 
			maxFiles: 10,
			maxFilesize: 1024,
			timeout: 180000000,
			uploadMultiple: false,
			acceptedFiles: '.pdf, .pptx, .ppt, .doc .docx, .txt, .hwp',
			withCredentials: true,
			previewsContainer: "#project_file_upload_pre_"+selectid,
	//		clickable: "#" + selectid,
			renameFile: function(file){		
				return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			},
			success : function(file, json){
				//alert('이미지 등록 성공');			
				var filename = file.name;
				var md5 = json.res.md5;
				gptapps.insert_file_md5_div(filename, md5);				
			},
			
			error: function(file, message, xhr){			
			    //alert("추가할 수 없는 파일 타입입니다.");
				//gptapps.draw_review_anlayzer(gap.lang.va94);
			}
		});			
		
		myDropzone_project.id = project_id;
		myDropzone_project.on("sending", function (file, xhr, formData) {			
			formData.append("id", myDropzone_project.id.replace("project_upload_dis_", ""));							
			var extension = file.name.split('.').pop().toLowerCase();
			myDropzone_project.ext = extension;	
		});		
		
		myDropzone_project.on("queuecomplete", function (file) {		
			var filelist = [];
			var md5s = []
			if ($("#file_list_ul .upload_file_li").length > 0){
				$("#file_list_ul .upload_file_li").each(function(index, val){
					var fileinfo = new Object();
					var md5 = $(val).data("md5");					
					if ($.inArray(md5, md5s) == -1){
						if (typeof(md5) == "undefined"){
							gap.error_alert();
							return false;
						}
						md5s.push(md5);						
						fileinfo.filename = $(val).data("fn");
						fileinfo.md5 = $(val).data("md5");
						filelist.push(fileinfo);
					}	
				});
			}			
			var urls = [];
			if ($("#link_ul .insert_link_li").length > 0){
				var list = $("#link_ul .insert_link_li").find(".link_name");					
				for (var i = 0 ; i < list.length; i++){
					var url = $(list[i]).text();
					if ($.inArray(url, urls) == -1){
						urls.push($(list[i]).text());
					}					
				}
			}								
			var combined = md5s.concat(urls);
			var info = combined.join("-spl-");			
			var id = myDropzone_project.id;			
			var msg = myDropzone_project.msg;
			gptapps.loading_file_check_project(filelist, urls, msg);		
			
		//	if (typeof(file) != "undefined"){
				//업로드가 완료되면 해당 정보를 프로젝트 info에 등록해서 관리한다.
				var project_code = myDropzone_project.id.replace("project_upload_dis_", "");
				var url = gptpt.plugin_domain_fast + "project/project_info_add"
				var data = JSON.stringify({
					"filelist" : filelist,
					"urls" : urls,
					"msg" : msg,
					"project_code" : project_code
				});
				
				gap.ajaxCall(url, data, function(res){
					if (res.result == "OK"){
						$("#btn_layer_close").click();	
					}
				});
		//	}			
		});	
	},
	
	
	///// 20250514 파일 업로드 레이어 ///
	"draw_layer_file_upload" : function(type, project_key){	
	
		var html = "";		
		// gap.maxZindex로 수정필요
		var inx = parseInt(gcom.maxZindex()) + 1;		
		if(type === "project"){
			html += "<div id='layer_file_upload' class='pjt'>";
		} else {
			html += "<div id='layer_file_upload'>";
		}
		html += "	<div class='layer_inner'>";
		html += "		<div class='layer_top'>";		
		if(type === "project"){
			html += "			<h4 class='layer_title'>"+gap.lang.va191+"</h4>";
		} else {			
			html += "			<h4 class='layer_title'>"+gap.lang.file_upload+"</h4>";
		}
		html += "			<button type='button' id='btn_layer_close' class='btn_layer_close'>";
		html += "				<span class='btn_ico'></span>";
		html += "			</button>";
		html += "		</div>";

		html += "		<div class='content_wrap'>";
		html += "			<div class='content_title'>";
		html += "				<span>File</span>";
		html += "				<span>(</span>";
		html += "				<span id='upload_file_count'>0</span>";
		html += "				<span>)</span>";
		html += "			</div>";
		html += "			<div class='file_list_wrap'>";
		html += "				<div class='file_guide_wrap'>";
		html += "					<input type='file' id='input_file' multiple>";
		html += "					<div id='file_drop_zone' class='file_drag_guide'>";
		html += "						<span class='guide_ico'></span>";
		html += "						<span class='guide_txt'>"+gap.lang.va172+"</span>";
		html += "					</div>";
		html += "					<button type='button' id='btn_file_add' class='btn_add_file'>";
		html += "						<span class='btn_inner'>";
		html += "							<span class='btn_ico'></span>";
		html += "							<span class='btn_txt'>"+gap.lang.addFile+"</span>";
		html += "						</span>";
		html += "					</button>";
		html += "				</div>";
		html += "				<div id='file_list_ul' class='ul_file_list'></div>";
		html += "			</div>";
		html += "		</div>";
		html += "		<div class='content_wrap'>";
		html += "			<div class='content_title'>";
		html += "				<span>Link</span>";
		html += "				<span>(</span>";
		html += "				<span id='inser_link_count'>0</span>";
		html += "				<span>)</span>";
		html += "			</div>";
		html += "			<div class='link_input_box_wrap'>";
		html += "				<div class='link_input_box'>";
		html += "					<span class='link_ico'></span>";
		html += "					<input type='text' id='input_insert_link' class='input_link' placeholder='"+gap.lang.va174+"' autocomplete='off' spellcheck='false'>";		
		html += "				</div>";
		html += "				<div id='link_ul' class='link_li_wrap'></div>";
		html += "			</div>";
		html += "		</div>";
		html += "		<div class='content_wrap'>";
		html += "			<div class='content_title'>"+gap.lang.va170+"</div>";
		html += "			<textarea id='textarea_request' class='request_textarea' placeholder='"+gap.lang.va171+"' spellcheck='false'></textarea>";	
		html += "		</div>";
		html += "		<div class='btn_wrap'>";
		html += "			<button type='button' id='btn_save' class='create_btn'>"+gap.lang.basic_save+"</button>";
		html += "			<button type='button' id='btn_cancel' class='cancel_btn'>"+gap.lang.Cancel+"</button>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";		
		$("#dark_layer").append(html);		
		$("#dark_layer").css("zIndex", inx);
		$("#dark_layer").fadeIn(200);
		
		if (type == "project"){
			//프로젝트일 경우 기존에 있는 파일 정보를 가져와서 표시한다.
			var url = gptpt.plugin_domain_fast + "project/project_info";
			var data = JSON.stringify({
				"code" : project_key
			});
			
			gap.ajaxCall(url, data, function(res){			
				var item = res[0].data;
				
				//if (typeof(item.filelist) != "undefined"){
					var filelist = item.filelist;
					var urls = item.urls;
					var msg = item.msg;					
					var project_code = $("#layer_gpt_project").data('key');										
					var html = "";
					if (typeof(filelist) != "undefined"){
						for (var k = 0 ; k < filelist.length; k++){
							var fitem = filelist[k];
							var fileName = fitem.filename;						
							// file의 타입에 따라 다르게 아이콘 표시 
							var type_ico = gap.is_file_type_filter(fileName);						
							html += "<div class='upload_file_li now_insert' data-fn='"+fileName+"' data-md5='"+fitem.md5+"'>";
							html += "	<span class='file_ico " + type_ico + "'></span>";
							html += "	<span class='file_name'>" + fileName + "</span>";
							html += "	<button type='button' class='btn_clear' data-code='"+fitem.md5+"' data-opt='file' data-id='"+project_code+"'></button>";
							html +=	"</div>";
						}
						$("#upload_file_count").html(filelist.length);
						$("#file_list_ul").append(html);			
					}								
					var html = "";
					if (typeof(urls) != "undefined"){
						for (var j = 0 ; j < urls.length; j++){
							var val = urls[j];
							html += "<div class='insert_link_li now_insert'>";
							html += "	<span class='li_ico'></span>";
							html += "	<span class='link_name'>" + val + "</span>";
							html += "	<button type='button' class='btn_clear'  data-code='"+val+"' data-opt='url' data-id='"+project_code+"'></button>";
							html +=	"</div>";					
						}
						$("#inser_link_count").html(urls.length);
						$("#link_ul").append(html);	
					}									
					$("#textarea_request").val(msg);					
					$(".upload_file_li .btn_clear").off().on("click", function(e){					
						var item = $(e.currentTarget);
						var parent = item.parent();
						var opt = item.data("opt");
						var code = item.data("id");
						var md5 = item.data("code");						
						var url = gptpt.plugin_domain_fast + "project/remove_sub_file_in_project";
						var data = JSON.stringify({
							"opt" : opt,
							"code" : code,
							"md5" : md5
						});
						gap.ajaxCall(url, data, function(re){
							parent.remove();
							var fcnt = $("#file_list_ul .upload_file_li").length;
							$("#fcnt").html(fcnt);
						})
					});					
					$("#link_ul .btn_clear").off().on("click", function(e){
						var item = $(e.currentTarget);
						var parent = item.parent();
						var opt = item.data("opt");
						var code = item.data("id");
						var md5 = item.data("code");						
						var url = gptpt.plugin_domain_fast + "project/remove_sub_file_in_project";
						var data = JSON.stringify({
							"opt" : opt,
							"code" : code,
							"md5" : md5
						});
						gap.ajaxCall(url, data, function(re){
							parent.remove();
							var ucnt = $("#link_ul .insert_link_li").length;
							$("#ucnt").html(ucnt);
						})	
					});
						
			});
		}
		
		// 닫기 버튼
		$("#btn_layer_close").off().on("click", function(){
			$("#dark_layer").fadeOut(200, function(){
				$("#dark_layer").empty();
			});
		});		
		gptapps.event_layer_file_upload(type);		
	},
	
	"draw_upload_guide" : function(){
		var html = "";		
		html += "<div id='file_upload_guide' class=''>";
		html += "	<span class='guide_icon'></span>";
		html += "	<div class='guide_txt_wrap'>";
		html += "		<span class='guide_title'>파일을 추가하세요</span>";
		html += "		<span class='guide_desc'>프로젝트에 파일을 추가하려면 여기로 파일을 드래그앤드롭 해주세요</span>";
		html += "	</div>";
		html +=	"</div>";		
		$("#layer_file_upload").append(html);
	},
	
	"event_layer_file_upload" : function(opt){		
		$("#textarea_request").off().on("keyup", function(){
			var val = $(this).val();
			if(opt === "project"){
				/// 프로젝트 자료 추가할 때
				
				if( $("#file_list_ul .upload_file_li").length !== 0 || $("#link_ul .insert_link_li").length !== 0 || $("#textarea_request").val().length !== 0){
					$("#btn_save").addClass("active");
				} else {
					$("#btn_save").removeClass("active");
				}
			} else {
				// 팟캐스트 만들 때
				if(val !== "" && ($("#file_list_ul .upload_file_li").length !== 0 || $("#link_ul .insert_link_li").length !== 0) ){
					$("#btn_save").addClass("active");
				} else {
					$("#btn_save").removeClass("active");
				}
			}
		});		
		
		// 파일 추가
		var dragCounter = 0;		
	    $("#layer_file_upload").on("dragenter", function(e){
	        e.preventDefault();
	        e.stopPropagation();			
			dragCounter++;
    		if (dragCounter === 1) {
				gptapps.draw_upload_guide();
			}
	    }).on("dragleave", function(e){
	        e.preventDefault();
	        e.stopPropagation();	
			dragCounter--;
		    if (dragCounter === 0) {
		        // 드래그가 완전히 나갔을 때만 배경색 변경
		        $("#file_upload_guide").remove();
		    }			
	    }).on("dragover", function(e){
	        e.preventDefault();
	        e.stopPropagation();
	    }).on("drop", function(e){
			e.preventDefault();			
			/** 드롭 후 **/			
			// 1. 카운트 초기화
			dragCounter = 0;
			// 2. 스크롤을 최상단으로 끌어올려야함. 
			$("#file_list_ul").scrollTop(0);
			$("#file_upload_guide").remove();			
	        var files = e.originalEvent.dataTransfer.files;
	        if(files != null && files != undefined){	        	
	        	const allowedExtensions = ['pdf', 'pptx', 'docx', 'txt', 'hwp']; 
	        	newfiles = gptapps.upload_file_check(allowedExtensions, files);	        	
	        	if (newfiles.length > 0){
					gptapps.draw_upload_files(newfiles, opt);
				}	            
	        }
	    });
		
		$("#btn_file_add").off().on("click", function(){
			$("#input_file").click();
		});
		
		$("#input_file").off().on("change", function(){
			var files = document.getElementById("input_file").files;		
			const allowedExtensions = ['pdf', 'pptx', 'docx', 'txt', 'hwp']; 			
			newfiles = gptapps.upload_file_check(allowedExtensions, files);			
			if (newfiles.length > 0){
				gptapps.draw_upload_files(newfiles, opt);
			}   
		});
		
		$("#input_insert_link").off().on("focus blur keypress", function(e){
			if(e.type === "focus"){
				$(this).siblings(".link_ico").css({
					"filter" : "brightness(0.5)"
				});
			} else if(e.type === "blur"){
				$(this).siblings(".link_ico").css({
					"filter" : "brightness(1)"
				});
			}			
			if(e.type === "keypress"){
				if(e.keyCode === 13){
					var val = $.trim($(this).val());
					gptapps.draw_insert_link_list(val);					
					$(this).val("");
				}
			}
		});		
		// 파일 추가		
		//취소버튼
		$("#btn_cancel").off().on("click", function(){
			$("#btn_layer_close").click();
		});		
		// 저장 버튼
		$("#btn_save").off().on("click", function(){
			if($(this).hasClass("active")){
				if(opt === "project"){
					gptapps.loading_file_icon();					
					var msg = $("#textarea_request").val();						
					if (myDropzone_project.files.length > 0){
						//등록된 파일이 없는 경우 스크립트만 업데이트 한다.
						myDropzone_project.msg = msg;
						var id = myDropzone_project.id;						
						var filelist = [];
						myDropzone_project.filelist = [];
						var fns = [];						
						if ($("#file_list_ul .upload_file_li").length > 0){
							$("#file_list_ul .upload_file_li").each(function(index, val){
								var fileinfo = new Object();
								fileinfo.filename = $(val).data("fn");
								fns.push(fileinfo.filename);
								fileinfo.md5 = $(val).data("md5");
								filelist.push(fileinfo);
							});
							myDropzone_project.filelist = fns;
							myDropzone_project.processQueue();
						}						
					}						
					var urls = [];
					myDropzone_project.urls = [];
					if ($("#link_ul .insert_link_li").length > 0){
						var list = $("#link_ul .insert_link_li").find(".link_name");					
						for (var i = 0 ; i < list.length; i++){
							urls.push($(list[i]).text());
						}
						myDropzone_project.urls = urls;
						var xx = urls.join("-spl-");
						gptapps.url_content_extractor(xx, id);
					}					
					if ((myDropzone_project.files.length == 0) && ($("#link_ul .insert_link_li").length == 0)) {
						//추가된 파일도 없고 URL도 업는 경우 스크립트만 업데이트 한다.
						var url = gptpt.plugin_domain_fast + "project/project_msg_update";
						var id = myDropzone_project.id.replace("project_upload_dis_", "");
						var data = JSON.stringify({
							"msg" : msg,
							"project_code" : id
						});
						gap.ajaxCall(url, data, function(res){
							if (res[0].result == "OK"){
								var doc = res[1];
								var filelist = doc.filelist;
								var urls = doc.urls;
								var msg = doc.msg;
								
								gptapps.loading_file_check_project(filelist, urls, msg);
							}
						});
					}
				} else {
					gptapps.loading_file_icon();						
					var msg = $("#textarea_request").val();		
					myDropzone_podcast.msg = msg;
					var id = myDropzone_podcast.id;				
					var filelist = [];
					myDropzone_podcast.filelist = [];
					var fns = [];
					if ($("#file_list_ul .upload_file_li").length > 0){
						$("#file_list_ul .upload_file_li").each(function(index, val){
							var fileinfo = new Object();
							fileinfo.filename = $(val).data("fn");
							fns.push(fileinfo.filename);
							fileinfo.md5 = $(val).data("md5");
							filelist.push(fileinfo);
						});
						myDropzone_podcast.filelist = fns;
						myDropzone_podcast.processQueue();
					}					
					var urls = [];
					myDropzone_podcast.urls = [];
					if ($("#link_ul .insert_link_li").length > 0){
						var list = $("#link_ul .insert_link_li").find(".link_name");					
						for (var i = 0 ; i < list.length; i++){
							urls.push($(list[i]).text());
						}
						myDropzone_podcast.urls = urls;
						var xx = urls.join("-spl-");
						gptapps.url_content_extractor(xx, id);
					}					
					if ($("#file_list_ul .upload_file_li").length == 0){
						//업로드한 파일이 없으면 여기서 바로 처리하고 파일이 있는 경우 파일을 MD5값을 등록하고 처리해야 해서 파일 업로드 완료후 처리한다.
						//$("#btn_layer_close").click();							
						gptapps.draw_generating_podcast(filelist, urls, myDropzone_podcast.id);					
						var info = urls.join("-spl-");
					//	gptapps.make_podcast(id, info);						
					//	gptapps.loading_file_check();
					}
				}
			}
		});
	},
	
	"upload_file_check" : function(allowedExtensions, files){
		var is_ok = false;
		var newfiles = [];
		for (var i = 0; i < files.length; i++){
			var item = files[i];
			var filename = item.name;
			 let extension = "";
	      	if (filename.lastIndexOf('.') !== -1) {
	        	extension = filename.split('.').pop().toLowerCase();
	      	}	
	      	// 5-2. 허용된 확장자인지 확인
	      	if (!allowedExtensions.includes(extension)) {
	        	// 확장자가 맞지 않을 경우 done 에러 콜백 호출
	        	//done("허용되지 않는 파일 형식입니다: ." + extension);
	        	mobiscroll.toast({message: "'" + filename + "'" + " " + gap.lang.va190, color:'danger'});
	      	}else{
				newfiles.push(item);
			}
		}	
		return newfiles
	},
	
	// 프로젝트 메인 상단 자료추가 완료 시 자료 카드 그리는 함수
	"draw_pjt_data_card" : function(filesinfo, urls, info){
		var html = "";		
		var fcnt = (typeof(filesinfo) == "undefined") ? 0 : filesinfo.length;
		var ucnt = (typeof(urls) == "undefined") ? 0 : urls.length;
		var msg = (typeof(info) == "undefined") ? "" : info;		
		/// 프로젝트 파일
		html += "<div class='pjt_info_card'>";
		html += "	<div class='card_info_box'>";
		html += "		<div class='info_title' title='"+gap.lang.va187+"'>"+gap.lang.va187+"</div>";
		html += "		<div class='info_desc'>";
		html += "			<span id='fcnt'>"+fcnt+"</span>";
		html += "			<span>개</span>";
		html += "		</div>";
		html += "	</div>";
		html += "	<button type='button' id='btn_pjt_data_file' class='pjt_info_btn'>";
		html += "		<span class='btn_ico file'></span>";
		html += "	</button>";
		html += "</div>";		
		/// 링크
		html += "<div class='pjt_info_card'>";
		html += "	<div class='card_info_box'>";
		html += "		<div class='info_title' title='"+gap.lang.va189+"'>"+gap.lang.va188+"</div>";
		html += "		<div class='info_desc'>";
		html += "			<span id='ucnt'>"+ucnt+"</span>";
		html += "			<span>개</span>";
		html += "		</div>";
		html += "	</div>";
		html += "	<button type='button' id='btn_pjt_data_link' class='pjt_info_btn'>";
		html += "		<span class='btn_ico link'></span>";
		html += "	</button>";
		html += "</div>";		
		/// 프로젝트 가이드라인
		html += "<div class='pjt_info_card'>";
		html += "	<div class='card_info_box'>";
		html += "		<div class='info_title' title='"+gap.lang.va190+"'>"+gap.lang.va170+"</div>";
		html += "		<div class='info_desc' title='"+msg+"'>"+msg+"</div>";
		html += "	</div>";
		html += "	<button type='button' id='btn_pjt_data_guideline' class='pjt_info_btn'>";
		html += "		<span class='btn_ico guideline'></span>";
		html += "	</button>";
		html += "</div>";		
		$("#open_add_data_layer").hide();		
		$("#pjt_info_group_card_wrap").empty();
		$("#pjt_info_group_card_wrap").append(html);	
		
		$("#btn_pjt_data_file").off().on("click", function(){
			var project_key = $("#layer_gpt_project").data("key");
			gptapps.project_file_upload(project_key);
			gptapps.draw_layer_file_upload("project", project_key);				
		});
		$("#btn_pjt_data_link").off().on("click", function(){
			var project_key = $("#layer_gpt_project").data("key");
			gptapps.project_file_upload(project_key);
			gptapps.draw_layer_file_upload("project", project_key);				
		});
		$("#btn_pjt_data_guideline").off().on("click", function(){
			var project_key = $("#layer_gpt_project").data("key");
			gptapps.project_file_upload(project_key);
			gptapps.draw_layer_file_upload("project", project_key);				
		});
	},
	
	"loading_file_icon" : function(){
		//파일과 URL앞의 아이콘을 로딩아이콘으로 변경한다.
		$("#file_list_ul .file_ico").addClass("loading");
		$("#link_ul .li_ico").addClass("loading");
	},
	
	"loading_file_check" : function(id){
		var filecount = $("#file_list_ul .file_ico loading").length;
		var urlcount = $("#link_ul .li_ico loading").length;
		if (filecount + urlcount == 0){
			$("#btn_layer_close").click();			
			var info = [];
			if ($("#file_list_ul .upload_file_li").length > 0){
				$("#file_list_ul .upload_file_li").each(function(index, val){
					info.push($(val).data("md5"));
				});
			}			
			if ($("#link_ul .insert_link_li").length > 0){
				var list = $("#link_ul .insert_link_li").find(".link_name");					
				for (var i = 0 ; i < list.length; i++){
					info.push($(list[i]).text());
				}				
			}
			var xx = info.join("-spl-");
			gptapps.make_podcast(id, xx);
		}		
	},
	
	"loading_file_check_project" : function(filesinfo, urls, msg){
		var filecount = $("#file_list_ul .file_ico loading").length;
		var urlcount = $("#link_ul .li_ico loading").length;
		if (filecount + urlcount == 0){
			$("#btn_layer_close").click();		
			var info = [];
			if ($("#file_list_ul .upload_file_li").length > 0){
				$("#file_list_ul .upload_file_li").each(function(index, val){
					info.push($(val).data("md5"));
				});
			}			
			if ($("#link_ul .insert_link_li").length > 0){
				var list = $("#link_ul .insert_link_li").find(".link_name");					
				for (var i = 0 ; i < list.length; i++){
					info.push($(list[i]).text());
				}				
			}
			var xx = info.join("-spl-");
			gptapps.draw_pjt_data_card(filesinfo, urls, msg);
		}
		
	},
	
	"url_content_extractor" : function(urls, id){		
		var is_project = id.indexOf("project");
		var project_id = id.replace("project_upload_dis_", "");
		var _url = gptpt.plugin_domain_fast_podcast + "urls_upload";		
		var data = JSON.stringify({
			"urls" : urls
		});
		gap.ajaxCall(_url, data, function(res){
			$("#link_ul .li_ico").removeClass("loading");				
			var msg = $("#textarea_request").val();			
			if (is_project > -1){				
				urls = urls.split("-spl-");				
				//업로드가 완료되면 해당 정보를 프로젝트 info에 등록해서 관리한다.				
				var url = gptpt.plugin_domain_fast + "project/project_info_add_urls"
				var data = JSON.stringify({
					"urls" : urls,
					"msg" : msg,
					"project_code" : project_id
				});				
				gap.ajaxCall(url, data, function(res){
					if (res[0].result == "OK"){
						var doc = res[1];
						var filelist = doc.filelist;
						var urls = doc.urls;
						var msg = doc.msg;						
						gptapps.loading_file_check_project(filelist, urls, msg);
					}
				});			
			}else{
				gptapps.loading_file_check(id);
			}			
		});
	},
	
	"make_podcast" : function(id, info){		
		var pd_id = myDropzone_podcast.id;	
		var msg = myDropzone_podcast.msg;		
		//입력 데이터를 미리 만들어 놓는다.
		gptpt.save_person_log("[Podcast] " + msg);		
		var filelist = myDropzone_podcast.filelist;
		var urls = myDropzone_podcast.urls;		
		var _url = gptpt.plugin_domain_fast_podcast + "make_podcast";
		var data = JSON.stringify({
			"info" : info,
			"msg" : msg,
			"filelist" : filelist.join("-spl-"),
			"urls" : urls.join("-spl-"),
			"roomkey" : gptpt.cur_roomkey,
			"user" : gap.userinfo.rinfo.ky,
			"code" : gptpt.current_code,
			"pd_id" : pd_id,
			"language" :gap.curLang
		});
		gap.ajaxCall(_url, data, function(res){						
			$("#dis_"+pd_id+" #podcast_loading_box").remove();
			var filename = res.res.id;
			console.log(gptpt.plugin_domain_fast_podcast + "podcast/data/audio/" + filename);			
			var audiohtml = "<audio id='paudio' src='"+gptpt.plugin_domain_fast_podcast + "podcast/data/audio/" + filename+"' preload='auto' controls></audio>";
			$("#dis_"+pd_id+" #paudio_div").append(audiohtml);
			$("#dis_"+pd_id+" #paudio_div").show();
			$("#dis_"+pd_id+" #paudio").audioPlayer();			
			$("#upload_list_box_podcast .ico_btn").click();			
			if (msg == ""){
				msg = gap.lang.va176
			}			
		});
	},	
	
	"draw_generating_podcast" : function(filelist, urls, id){		
		var pd_id = id;
		var html = "";		
		if (filelist == ""){
			filelist = [];
		}
		if (urls == ""){
			urls = [];
		}		
		html += "<div class='ai_answer_wrap' id='dis_"+pd_id+"'>";
		html += "	<div class='ans_title' style='width: 100%;'>";
		html += "		<div class='ai_img'></div>";
		html += "		<div class='ai_answer_box' style='flex: none; width: calc(100% - 7%);'>";
		html += "			<div class='and_title_txt' style='white-space: pre-line;'>"+gap.lang.va174+"</div>";		
		html += "			<div id='upload_list_box_podcast' class='podcast_upload_list_box'>";		
		html += "				<div class='upload_list_ul_wrap'>";
		html += "					<div class='title_box_wrap'>";
		html += "						<div class='title_box'>";
		html += "							<span>File</span>";
		html += "							<span>(</span>";
		html += "							<span id='upload_file_count'>"+filelist.length+"</span>";
		html += "							<span>)</span>";
		html += "						</div>";
		html += "						<span class='ico_btn open'></span>";
		html += "					</div>";		
		html += "					<div class='upload_list_ul'>";		
		for (var i = 0 ; i < filelist.length; i++){
			var fileinfo = filelist[i];
			var fn = fileinfo.filename;
			if (typeof(fn) == "undefined"){
				fn = fileinfo;
			}
			var ext = gap.file_icon_check(fn);
			html += "						<div class='upload_list'>";
			html += "							<div class='list_icon "+ext+"'></div>";
			html += "							<div class='list_title'>"+fn+"</div>";
			html += "						</div>";
		}
		html += "					</div>";		
		html += "";
		html += "				</div>";		
		html += "				<div class='upload_list_ul_wrap'>";
		html += "					<div class='title_box_wrap'>";
		html += "						<div class='title_box'>";
		html += "							<span>Link</span>";
		html += "							<span>(</span>";
		html += "							<span id='upload_file_count'>"+urls.length+"</span>";
		html += "							<span>)</span>";
		html += "						</div>";
		html += "						<span class='ico_btn open'></span>";
		html += "					</div>";		
		html += "					<div class='upload_list_ul link'>";		
		for (var k = 0 ; k < urls.length; k++){
			var url = urls[k];
			html += "						<div class='upload_list'>";
			html += "							<div class='list_icon link'></div>";
			html += "							<div class='list_title' style='cursor:pointer'>"+url+"</div>";
			html += "						</div>";
		}
		html += "					</div>";		
		/** list_icon의 loading 클래스를 제거하면 원래 아이콘이 표시됨. **/		
		html += "";
		html += "				</div>";		
		html += "			</div>";		
		html += "			<div id='podcast_loading_box' class='podcast_loading_box' style='display:none'>";
		html += "				<span class='loading_icon'></span>";
		html += "				<span id='podcast_loading'></span>";
		html += "			</div>";		
		html += "			<div style='display:none; width:100%' id='paudio_div'></div>";		
		html += "		</div>";
		html += "	</div>";
		html += "</div>";		
		$("#ai_result_dis").append(html);		
		$(".upload_list .list_title").off().on("click", function(e){
			var url = $(e.currentTarget).text();
			window.open(url, null);
		});		
		$("#dis_"+pd_id+" #podcast_loading_box").hide();
		$("#dis_"+pd_id+" #upload_list_box_podcast .upload_list_ul").hide();		
		$("#dis_"+pd_id+" #upload_list_box_podcast .ico_btn").addClass("open");		
		$("#dis_"+pd_id+" #upload_list_box_podcast .upload_list_ul").slideDown(300);
		$("#dis_"+pd_id+" #upload_list_box_podcast .upload_list_ul").css({
			"max-height" : $("#dis_"+pd_id+" #upload_list_box_podcast .upload_list").outerHeight() * 5
		});
		$("#dis_"+pd_id+" #upload_list_box_podcast .ico_btn").off().on("click", function(){
			$(this).toggleClass("open");
			$(this).closest(".upload_list_ul_wrap").find(".upload_list_ul").stop().slideToggle(300);
		});	
		
		/// 로딩 애니메이션
		var maxDots = 3;
        var currentDots = 0;
        var loadingText = gap.lang.va175;
        var dot_interval = setInterval(function() {
            currentDots = (currentDots + 1) % (maxDots + 1);
            var dots = "..".repeat(currentDots);
            $("#dis_"+pd_id+" #podcast_loading").text(loadingText + dots);
        }, 500); // 500ms 간격으로 업데이트
		/// 로딩 애니메이션		
		setTimeout(function(){
			$("#dis_"+pd_id+" #podcast_loading_box").fadeIn();
		}, 1000);		
		gap.scroll_move_to_bottom_time_gpt(1500);
	
	},
	
	"draw_upload_files" : function(files, opt){		
		//파일 업로드 드래그
		var fileList = [];		
		var html = "";			
		var is_type = "";

		for(i=0; i < files.length; i++){
			var f = files[i];			
			/// 팟캐스트
			if( !$("#layer_file_upload").hasClass("pjt") ){					
				myDropzone_podcast.addFile(f);			
				is_type = "podcast";						
			}else{
				myDropzone_project.addFile(f);	
				is_type = "project";
			}			
			fileList.push(f);			
            var fileName = f.name;
            /*
			var fileSize = f.size / 1024 / 1024;
            fileSize = fileSize < 1 ? fileSize.toFixed(3) : fileSize.toFixed(1);
			*/
			// file의 타입에 따라 다르게 아이콘 표시 
			var type_ico = gap.is_file_type_filter(fileName);			
			html += "<div class='upload_file_li now_insert' data-fn='"+fileName+"'>";
			html += "	<span class='file_ico " + type_ico + "'></span>";
			html += "	<span class='file_name'>" + fileName + "</span>";
			html += "	<button type='button' class='btn_clear'></button>";
			html +=	"</div>";			
        }		
		html = $(html);
        $("#file_list_ul").prepend(html);		
		if($("#layer_file_upload").hasClass("pjt")){
			if( $("#file_list_ul .upload_file_li").length !== 0 ){
				$("#btn_save").addClass("active");
			} else {
				$("#btn_save").removeClass("active");
			}
		} else {
			if( $("#file_list_ul .upload_file_li").length !== 0 && $("#textarea_request").val() !== "" ){
				$("#btn_save").addClass("active");
			} else {
				$("#btn_save").removeClass("active");
			}
		}

		//// 목록에 있는 총 파일 갯수
		var total_file_length = $("#file_list_ul").find(".upload_file_li").length;
		$("#upload_file_count").html(total_file_length);
		/// 지금 업로드한 파일목록만 강조 표시
		html.siblings(".upload_file_li").removeClass("now_insert");
		html.addClass("now_insert");		
		$("#file_list_ul .btn_clear").off().on("click", function(){			
			var li = $(this).closest(".upload_file_li");		
			gptapps.remove_list_animation(li, is_type, "file");			
			$("#upload_file_count").html( $("#upload_file_count").html() - 1);
		});		
	},
	
	"draw_insert_link_list" : function(val){	
		var is_type = "";
		if( !$("#layer_file_upload").hasClass("pjt") ){							
			is_type = "podcast";						
		}else{
			is_type = "project";
		}			
	
		var html = "";		
		html += "<div class='insert_link_li now_insert'>";
		html += "	<span class='li_ico'></span>";
		html += "	<span class='link_name'>" + val + "</span>";
		html += "	<button type='button' class='btn_clear'></button>";
		html +=	"</div>";		
		html = $(html);		
		$("#link_ul").prepend(html);		
		if($("#layer_file_upload").hasClass("pjt")){
			if( $("#link_ul .insert_link_li").length !== 0 ){
				$("#btn_save").addClass("active");
			} else {
				$("#btn_save").removeClass("active");
			}
		} else {
			if( $("#link_ul .insert_link_li").length !== 0 && $("#textarea_request").val() !== "" ){
				$("#btn_save").addClass("active");
			} else {
				$("#btn_save").removeClass("active");
			}
		}				
		var total_link_length = $("#link_ul").find(".insert_link_li").length;
		$("#inser_link_count").html(total_link_length);		
		html.siblings(".insert_link_li").removeClass("now_insert");		
		$("#link_ul .btn_clear").off().on("click", function(){			
			var li = $(this).closest(".insert_link_li");			
			gptapps.remove_list_animation(li, is_type, "url");			
			$("#inser_link_count").html( $("#inser_link_count").html() - 1);
		});
	},
	
	"remove_list_animation" : function(li, is_type, opt){		
		var filename = $(li).data('fn');		
		// Dropzone.files 배열에서 이름으로 검색

	    var fileObj = "";
	    var fo = "";
	    if (is_type == "podcast"){
	    	fo = myDropzone_podcast;
	    }else if (is_type == "project"){
	    	fo = myDropzone_project;
	    }
	    
	    if (opt == "file"){
		     var fileObj = fo.files.find(function(f) {
		      return f.name === filename;
		    });
		    if (fileObj) {
		      	fo.removeFile(fileObj);	      	
		      	var li_transition_time = parseFloat(li.css("transition-duration")) * 1000;		
				li.css({
					"transform" : "translate(20%)",
					"opacity" : "0"
				});			
				setTimeout(function(){
					li.remove();				
					/// 저장 버튼 활성화/비활성화				
					if($("#layer_file_upload").hasClass("pjt")){				
						if( $(".upload_file_li").length === 0 || $(".insert_link_li").length === 0 ){
							$("#btn_save").removeClass("active");
						}					
					} else {					
						/// 업로드된 파일을 지웠을 때
						if(li.hasClass("upload_file_li")){
							if( $(".upload_file_li").length === 0 || $("#textarea_request").val() === "" ){
								$("#btn_save").removeClass("active");
							}
						}					
										
					}			
				}, li_transition_time);				
		    } else {
		      	//alert("해당 이름의 파일을 찾을 수 없습니다: " + filename);
		    }		
	    }else if (opt == "url"){
	    	var li_transition_time = parseFloat(li.css("transition-duration")) * 1000;		
			li.css({
				"transform" : "translate(20%)",
				"opacity" : "0"
			});			
			setTimeout(function(){
				li.remove();				
				/// 저장 버튼 활성화/비활성화				
				if($("#layer_file_upload").hasClass("pjt")){				
					if( $(".upload_file_li").length === 0 || $(".insert_link_li").length === 0 ){
						$("#btn_save").removeClass("active");
					}					
				} else {					
					/// 추가한 링크를 지웠을 때
					if(li.hasClass("insert_link_li")){
						if( $(".insert_link_li").length === 0 || $("#textarea_request").val() === "" ){
							$("#btn_save").removeClass("active");
						}
					}					
				}			
			}, li_transition_time);				
	    }
	   
	},	
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	
	"send_image_analyzer" : function(msg){	
		var id = "image_analyzer_response_chat_" + new Date().getTime();	
		gptapps.ai_mydata_response(id);			
		//var filename = gptpt.cur_roomkey + "." + myDropzone_image_analyzer.ext;		
		var filename = "";
		if (typeof(myDropzone_image_analyzer) != "undefined"){			
			filename = myDropzone_image_analyzer.image_path + "." + myDropzone_image_analyzer.ext;
		}else{
			filename = gptpt.cur_image_file;
		}		
		var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : msg,
			filename : filename,
			call_code : gptpt.current_code,
			roomkey : gptpt.cur_roomkey,
			lang : gap.curLang
		});					
		

		
		var ssp = new SSE(gptpt.plugin_domain_fast + "apps/image_analyzer_question", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	            method: 'POST'});
	            
	   	ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");		
			ssp.close();	
		});
	           
		$("#" + id).show();
	   	ssp.addEventListener('message', function(e) {				
			var pph = e.data.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");			
			if (e.data == "[DONE]"){
				$("#btn_work_req").removeClass("stop");
				var tmsg = $("#" + id).html();
				tmsg = gptpt.change_markdown_html(tmsg);
				$("#" + id).html(tmsg);
				gptpt.autolink("#"+id);
				gap.scroll_move_to_bottom_time_gpt(200);	
				ssp.close();
        		return;			
			}else{
				$("#"+id).append(pph);
				gap.scroll_move_to_bottom_time_gpt(200);	
			}		
		});		
		ssp.addEventListener('open', function(e) {
		//	gap.hide_loading();
			$("#" + id + "_typed").remove();
		//	gptapps.ai_normal_response(id);	
		});
		ssp.stream();
		gptpt.source.push(ssp);	
		
	},
		
	////////////// 회의록 리스트 그리는 함수 ///////////////	
	"meeting_left_list_draw" : async function(opt){
		/////// 회의록 갯수		
		var url = root_path + "/search_meeting_list.km";
		var data = JSON.stringify({
			"start" : gptapps.start,
			"perpage" : gptapps.perpage,
			"query" : gptapps.query
		});		
		var listitem = "";
		await $.ajax({
			type : "POST",
			url : url,
			data : data,
			contentType : "application/json; charset=utf-8",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					listitem = res;
				}
			},
			error : function(e){
				alert(e);
			}			
		});		

		var html = "";
		var tid = "";
		for(var i = 0; i < listitem.data.data.length; i++){
			var item = listitem.data.data[i];
			var data = JSON.parse(item.data);
			var members = data.member;
			var id = item._id.$oid;
			if(i === 0){
				tid = id;
				html +=	"						<li class='list_item active' data-key='"+id+"'>";
			} else {
				html +=	"						<li class='list_item' data-key='"+id+"'>";
			}
			html +=	"								<div class='item_top'>";
			html +=	"									<div class='item_top_title'>"+item.title+"</div>";
			html +=	"									<button type='button' class='button_meeting_info' data-id='"+id+"'></button>";
			html +=	"								</div>";
			html +=	"								<div class='item_bot'>";
	//		html +=	"									<div class='item_bot_title' style='min-width:140px'>"+gap.change_date_localTime_full2(item.GMT)+"</div>";
			if ( data.start_time == ""){
				html +=	"									<div class='item_bot_title' style='min-width:178px'>"+ data.day +"</div>";
			}else{
				html +=	"									<div class='item_bot_title' style='min-width:178px'>"+ data.day + " " + data.start_time + "~" +  data.end_time+"</div>";
			}			
			html +=	"									<div class='members_wrap'>";			
			/*
			var total_member = 9; // 총 인원
			var show_member = 4; // 보여질 인원											
			for(var j = 0; j < total_member; j++){
				if (total_member <= show_member) {
						html += "<div class='member_img' style='transform: translateX(" + (4 * (total_member-j)) + "px); background-image: url(./resource/images/emp0" + j + "_img.jpg);'></div>";
				}
				if (total_member > show_member) { // 보여지는 멤버이미지의 최대 개수보다 멤버가 많을 경우
					if(j < show_member){
							html += "<div class='member_img' style='transform: translateX(" + ( (4 * (9-j)) - 16 )+ "px); background-image: url(./resource/images/emp0" + j + "_img.jpg);'></div>";
					}
					if(j === show_member){
							html += "<div class='member_more' style='transform: translateX(" + ( (4 * (9-j)) - 16 ) + "px);'>+" + (total_member - show_member) + "</div>";
							break;
					}
				}
			}
			*/			
			html += "<div class='item_bot_title'>"+gap.lang.member+":"+members.split(",").length+gap.lang.myung +"</div>";			
			html += "									</div>";
			html +=	"								</div>";
			html +=	"							</li>";			
		}

		$("#proceeding_list_wrap").append(html);		
		//처음 호출하는 경우 첫번째 회의록을 자동으로 표시해 준다.
		if(gptapps.start == 0){
			gptapps.show_detail_meeting_recording(tid);
		}
		
		$(".list_item").off().on("click", function(e){
			if ($(e.target).attr("class") == "button_meeting_info"){
				$.contextMenu({
					selector : "#proceeding_list_wrap .button_meeting_info",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){		
						gptpt.meeting_menu_call_req_mng(key, options, $(this).parent().find(".button_meeting_info"));						
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
	                	}
					},			
					build : function($trigger, options){
						return {
							items: gptpt.req_info_menu_meeting("F")
						}
					}
				});
				
			}else{
				var key = $(e.currentTarget).data("key");
				$(".list_item").removeClass("active");
				$(e.currentTarget).addClass("active");				
				//특정 키값을 활용하여 해당 회의록내용을 가져와서 우측영역에 표시해 준다.
				gptapps.show_detail_meeting_recording(key);
			}					
		});		
		if (opt == "T"){
			setTimeout(function(){
				$("#meeting_list_wrap").mCustomScrollbar("scrollTo", "top");
			}, 500);			
		}	
	},
	
	"show_detail_meeting_recording" : function(key){
		gptapps.current_key = key;
		gptpt.meeting_link = gap.rp + root_path + "/linkview/" + key;
		var url = root_path + "/load_meeting_recording_info.km";
		var data = JSON.stringify({
			"key" : key
		});		
		
		
		var accumulatedMarkdown = "";
		//$("#meeting_content").addClass("markdown-body");
		//$("#meeting_content").parent().css("white-space", "inherit");	
			
		$.ajax({
			type : "POST",
			url : url,
			data : data,
			contentType : "application/json; charset=utf-8",
			success : function(res){
				if (res.result == "OK"){
					if (res.data != null){
						var item = res.data;
					//	console.log(item.content)
						if (item.edit && item.edit == "T"){
							$("#proceedings_textarea").html(gap.textToHtml(item.content));
						}else{									
							$("#meeting_content").html(gptpt.change_markdown_html_for_meeting_record(item.content));	
							
							//var cont = item.content.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n");
							//var html = marked.parse(cont);
                			//$("#meeting_content").html(html);	
							
												
						}
						
						$("#meeting_title").text(item.title);
						gptpt.meeting_title = item.title;
						
						var data = JSON.parse(item.data);
						$("#meeting_members").text(data.member);
						gptpt.meeting_member = data.member;
						
						if (data.start_time == ""){
							$("#meeting_day").text(data.day);
							gptpt.meeting_dt = data.day;
						}else{
							$("#meeting_day").text(data.day + " " + data.start_time + "~" + data.end_time);
							gptpt.meeting_dt = data.day + " " + data.start_time + "~" + data.end_time;
						}						
					
						$("#btn_listen_voice").attr("data-uid", item.uid);
						$("#btn_listen_voice").data("uid", item.uid);
	
						$("#proceedings_textarea").attr("contenteditable", false );
						$("#proceedings_textarea").css("background-color", "#fff");
					}
				}
			},
			error : function(e){
				alert(e);
			}
		})
	},
	
	"proceedings_list_layer_draw": function(){
		var html = "";
		
		html += "<div id='meeting_list_layer'>";
		html +=	"	<div class='layer_inner'>";
		html += "		<div class='layer_content'>";
		html += "			<div class='left_content'>";
		html +=	"				<h4 class='content_title'>"+gap.lang.va82+"</h4>";
		
		///// 회의록 검색창 /////////
		html +=	"				<div class='input_wrap'>";
		html +=	"					<input id='meeting_search_query' class='input_meeting_search' type='text' placeholder='"+gap.lang.va83+"'>";
		html +=	"					<button type='button' class='button_meeting_search' id='meeting_search'></button>";
		html +=	"				</div>";
		
		//////// 회의록 목록 영역 /////////
		html +=	"				<div class='list_wrap_box'>";
		html +=	"					<div class='list_wrap' id='meeting_list_wrap'>";
		html +=	"						<ul id='proceeding_list_wrap' class='list_item_wrap'>";						
		html +=	"						</ul>";
		html +=	"					</div>";
		html +=	"				</div>";	
		html +=	"				</div>";
		
		//////// 회의록 목록 영역 ////////
		html +=	"			<div class='right_content'>";
		html +=	"				<div class='button_box_wrap'>";
		html +=	"					<div class='button_box'>";
		html +=	"						<div class='button_box_inner_wrap'>";
		html +=	"							<button type='button' id='btn_proceeding_edit' class='btn_edit'><span class='btn_ico'></span><span class='btn_name'>"+gap.lang.va84+"</span></button>";
		html +=	"						</div>";
		html +=	"						<div class='vertical_bar'></div>";
		html +=	"						<div class='button_box_inner_wrap'>";		/*
		html +=	"							<button type='button' id='btn_forward_mail' class='btn_share_mail'><span class='btn_ico'></span><span>"+gap.lang.va85+"</span></button>";
		html +=	"							<button type='button' id='btn_forward_chat' class='btn_share_chat'><span class='btn_ico'></span><span>"+gap.lang.va86+"</span></button>";
		*/
		html += "							<button type='button' id='btn_gpt_share' class='button_share_chat_history'>";
		html += "								<span class='btn_ico'></span>";
		html += "								<span>" + gap.lang.do_share + "</span>";
		html += "							</button>";
		html +=	"						</div>";	
		html +=	"					</div>";	
		html +=	"					<button type='button' id='btn_layer_close' class='button_layer_close'></button>";
		html +=	"			</div>";
		
		//회의록 내용
		var proceeding_txt = "";
		proceeding_txt +="	<h4>"+gap.lang.va87+" : </h4><p id='meeting_title'></p><br><h4>"+gap.lang.va88+": </h4><p id='meeting_day'></p><br>";
		proceeding_txt +="	<h4>"+gap.lang.va89+" : </h4><p id='meeting_members'></p><br>";
		proceeding_txt +="	<hr><br><p id='meeting_content'></p>";
		
		html +=	"				<div id='proceedings_wrap' class='proceedings_wrap'>";
		html +=	"					<div id='proceedings_tool' class='proceedings_tool'>";
		html += "						<button type='button' id='btn_listen_voice' class='btn_listen_voice'>";
		html += "							<span class='btn_inner'><span class='btn_ico'></span><span>"+gap.lang.va90+"</span></span>";
		html += "						</button></div>";
		html +=	"					<div id='proceedings_textarea' class='proceedings_textarea' contenteditable='false' spellcheck='false'>";			
		html += proceeding_txt;		
		html +=	"					</div>";
		html +=	"				</div>";		
		html +=	"			</div>";	
		html +=	"		</div>";
		html +=	"	</div>";
		html +=	"</div>";		
		$("#dark_layer").fadeIn(200);
		$("#dark_layer").html(html);		
		
		$("#meeting_list_wrap").mCustomScrollbar({
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
		//	setTop : ($("#channel_list").height()) + "px",
			callbacks : {
				onTotalScroll: function(){							
				//	gBody3.scrollP = $("#channel_list").find(".mCSB_container").height();							 
					gptapps.meeting_addContent(this);						
				},
				onTotalScrollOffset: 50,
				alwaysTriggerOffsets:false,						
				whileScrolling : function(){
					//gBody3.scroll_bottom = this.mcs.topPct;						
				}
			}
		});		
			
		$("#btn_layer_close").on("click", function(){
			$("#dark_layer").fadeOut(200);	
			$("#dark_layer").empty();
		});
		
		//회의록 리스트
		$("#proceeding_list_wrap .list_item").on("click", function(e){
			$(this).siblings().removeClass("active");
			$(this).addClass("active");
			$("#btn_proceeding_edit .btn_name").html(gap.lang.va84);			
			//회의록 편집기능 비활성화
			$("#proceedings_textarea").attr("contenteditable", false );			
			$("#btn_proceeding_show_origin").attr("disabled", true);
			$("#btn_proceeding_show_origin .btn_name").html(gap.lang.va59);			
			$("#origin_proceeding").remove();
		});
		
		///////회의록 편집하기
		$("#btn_proceeding_edit").on("click", function(){			
			var mtext = gap.lang.va84;	
			var stext = gap.lang.basic_save;	
			if($("#btn_proceeding_edit .btn_name").text() === mtext){					
				//회의록 편집기능 활성화
				$("#proceedings_textarea").attr("contenteditable", true);	
				$("#btn_proceeding_edit .btn_name").html(stext);				
				$("#proceedings_textarea").css("background-color", "#F5F5F5");
			} else {
				/////////////저장했을 때 				
				$("#btn_proceeding_edit .btn_name").html(mtext);				
				$("#proceedings_wrap").removeClass("edit");				
				//원본보기 버튼 활성화
				$("#btn_proceeding_show_origin").attr("disabled", false);				
				//회의록 편집기능 비활성화
				$("#proceedings_textarea").attr("contenteditable", false );	
				$("#proceedings_textarea").css("background-color", "#fff");
				//편집된 내용을 저장합니다.
				gptapps.meeting_content_modify();				
			}			
		});
		
		//메일전달
		$("#btn_forward_mail").on("click", function(){
			gptapps.showMeetMailForward();
		});
		
		//채팅전달
		$("#btn_forward_chat").on("click", function(){
			gptapps.showMeetChatForward();
		});	
		
		// 공유하기
		$("#btn_gpt_share").on("click", function(){
			gptpt.draw_layer_share_chat_history(gptpt.meeting_link);
		});	
		
		//원본보기
		/*
		$("#btn_proceeding_show_origin").on("click", function(){
			var origin = "<div id='origin_proceeding' class='origin_proceeding'></div>";
			origin = $(origin).append(proceeding_txt);
			
			if($("#btn_proceeding_show_origin .btn_name").text() === '원본보기'){
				$("#proceedings_wrap").append($(origin));
				//음성듣기 버튼 숨기기
				$("#btn_listen_voice").hide();
				//$("#proceedings_wrap").addClass("edit");
				
				//원본보기 버튼 비활성화
				$("#btn_proceeding_show_origin").attr("disabled", false)
				$("#btn_proceeding_show_origin .btn_name").html("원본닫기");
				
			} else {
				$("#origin_proceeding").remove();
				//음성듣기 버튼 숨기기
				$("#btn_listen_voice").show();
				//$("#proceedings_wrap").removeClass("edit");
				$("#btn_proceeding_show_origin .btn_name").html("원본보기");
			}
		});
		*/
		
		$("#btn_listen_voice").on("click", function(e){
			$(this).hide();			
			var uid = $(e.currentTarget).data("uid");
			var url =  gptpt.voice_server + uid;			
			var html = "<div class='audio_wrap'>";
			html += "	<audio class='audio' id='audio_meeting' controls src='"+url+"' ></audio>";
			html += "	<button id='proceeding_audio_close' type='button' class='audio_close'></button>";
			html += "</div>";
			$("#proceedings_tool").append(html);			
			$("#audio_meeting").get(0).play();			
			$("#proceeding_audio_close").on("click", function(){
				$("#proceedings_tool .audio_wrap").remove();
				$("#btn_listen_voice").show();
			});
		});
		
		$("#meeting_search").off().on("click", function(e){
			$("#proceeding_list_wrap").empty();
			var cls = $(e.currentTarget).attr("class");
			if (cls.indexOf("button")){
				//검색결과를 닫는 기능을 수행한다.				
				gptapps.start = 0;
				gptapps.query = "";
				gptapps.meeting_left_list_draw();

				$("#meeting_search").removeClass();
				$("#meeting_search").addClass("button_meeting_search");
			}else{
				//검색을 수행한다.
				gptapps.start = 0;
				gptapps.query = $("#meeting_search_query").val();
				gptapps.meeting_left_list_draw("T");
			}
			$("#meeting_search_query").val("");
		});
		
		$("#meeting_search_query").off().keypress("click", function(e){
			if (e.keyCode == 13){
				$("#proceeding_list_wrap").empty();
				$("#meeting_search").removeClass();
				$("#meeting_search").addClass("search_close");
				var query = $(e.currentTarget).val();
				gptapps.query = $("#meeting_search_query").val();
				gptapps.start = 0;
				gptapps.meeting_left_list_draw("T");
				$("#meeting_search_query").val("");
			}
		});
	},

	"meeting_addContent" : function(obj){
		if (gBody3.islast == "T"){
			return false;
		}			
		var new_start = parseFloat(gptapps.start) + parseFloat(gptapps.perpage);
		gptapps.start = new_start;
		gptapps.meeting_left_list_draw();		
		return false;		
	},
	
	"meeting_content_modify" : function(){
		var url = root_path + "/meeting_content_modify.km";
	
		var content = $("#proceedings_textarea #meeting_content").html();
		var data = JSON.stringify({
			"content" : content,
			"key" : gptapps.current_key
		});		
		$.ajax({
			type : "POST",
			data : data,
			url : url,
			contentType : "application/json; charset=utf-8",
			success : function(res){				
			},
			error : function(e){
				alert(e);
			}			
		})
	},
	
	
	//////////////회의록 작성 레이어 그리는 함수 //////////////////
	"proceedings_write_layer_draw": function(opt, blob){		
		var html = "";		
		var meeting_time_arr = 
		["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00","11:30", "12:00",
		"12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
		"18:00", "18:30", "19:00"
		];
		
		html += "<div id='proceedings_write_layer'>";
		html += 	"<div class='layer_inner'>";
		html +=			"<div class='layer_title_wrap'><h4>"+gap.lang.va211+"</h4></div>";
		html +=			"<div class='input_content_wrap_box'>";
		html +=				"<div class='input_content_wrap'>";
		html +=					"<div class='input_content_title'>"+gap.lang.va87+"<sup>＊</sup></div>";
		html +=					"<div class='input_wrap'><input type='text' class='' placeholder='"+gap.lang.va212+"' id='meeting_title' autocomplete='off'></div>";
		html +=				"</div>";
		html +=				"<div class='input_content_wrap'>";
		html +=					"<div class='input_content_title'>"+gap.lang.va213+"<sup>＊</sup></div>";
		html +=					"<div class='input_wrap'><input type='text' class='meeting_date_selector' placeholder='"+gap.lang.va214+"' id='meeting_day'><div class='cal_icon'></div></div>";
		html +=				"</div>";
		html +=				"<div class='input_content_wrap'>";
		html +=					"<div class='input_content_title'>"+gap.lang.va215+"</div>";
		html +=					"<div class='input_item_wrap'>";
		html +=						"<div class='input_wrap'>";
		html +=							"<select class='meeting_time_selectmenu' id='select_time_start'>";
		html +=								"<option class='disabled' selected>"+gap.lang.va216+"</option>";
										for(var i = 0; i < meeting_time_arr.length; i++){
		html +=								"<option>"+ meeting_time_arr[i] + "</option>";
										}
		html +=							"</select>";
		html +=						"</div>";
		html +=						"<span>~</span>";
		html +=						"<div class='input_wrap'>";
		html +=							"<select class='meeting_time_selectmenu' id='select_time_end'>";
		html +=								"<option class='disabled' selected>"+gap.lang.va216+"</option>";
										for(var i = 0; i < meeting_time_arr.length; i++){
		html +=								"<option>"+ meeting_time_arr[i] + "</option>";
										}
		html +=							"</select>";
		html +=						"</div>";
		html +=					"</div>";
		html +=				"</div>";
		html +=				"<div class='input_content_wrap'>";
		html +=					"<div class='input_content_title'>"+gap.lang.member+"<sup>＊</sup></div>";
		html +=					"<div class='input_wrap'><input type='text' class='' placeholder='"+gap.lang.va217+"' id='meeting_member' autocomplete='off'></div>";
		html +=				"</div>";
		html +=				"<div class='btn_wrap'>";
		html +=					"<button type='button' id='btn_layer_ok_meeting' class='btn_save'>"+gap.lang.basic_save+"</button><button id='btn_layer_close' type='button' class='btn_cancel'>"+gap.lang.Cancel+"</button>";
		html +=				"</div>";
		html +=			"</div>";
		html +=		"</div>";
		html += "</div>";		
		$("#dark_layer").fadeIn(200);
		$("#dark_layer").append(html);		
		
		//////// 회의 날짜 선택 데이트피커 ////////
		$('#proceedings_write_layer .meeting_date_selector').mobiscroll().datepicker({
		    controls: ['calendar'],
			dateFormat: 'YYYY-MM-DD'
		});		
		//////////// 회의 시간 선택 셀렉트메뉴 /////////////
		$("#proceedings_write_layer .meeting_time_selectmenu").selectmenu({
			select: function(event, ui){
				$(this).siblings().addClass("select");
			},
			open: function( event, ui ) {
				$("#" + event.target.id + "-menu").children().eq(0).hide();
			}
		});
		
		//////////취소버튼 (닫기)/////////
		$("#btn_layer_close").on("click", function(){
			$("#dark_layer").fadeOut(200);
			$("#dark_layer").empty();
		});
		
		$("#btn_layer_ok_meeting").on("click", function(){
			if ($("#meeting_title").val().trim() == ""){
				mobiscroll.toast({message:gap.lang.va218, color:'danger'});
				return false;
			}
			if ($("#meeting_day").val().trim() == ""){
				mobiscroll.toast({message:gap.lang.va219, color:'danger'});
				return false;
			}			
			if ($("#meeting_member").val().trim() == ""){
				mobiscroll.toast({message:gap.lang.va220, color:'danger'});
				return false;
			}			
			var select_time_start = "";
			var select_time_end = "";
			if ($("#select_time_start option:first").text() != $("#select_time_start").val()){
				select_time_start = $("#select_time_start").val();
			}
			if ($("#select_time_end option:first").text() != $("#select_time_end").val()){
				select_time_end = $("#select_time_end").val();
			}
			var data = JSON.stringify({
				day : $("#meeting_day").val(),
				start_time :select_time_start,
				end_time : select_time_end,
				member : $("#meeting_member").val(),
			});		
			if (opt == "file"){
				myDropzone_review.data = data;
				myDropzone_review.title = $("#meeting_title").val();			
				myDropzone_review.processQueue();
			}else if (opt == "record"){
				//서버로 전송해서 회의록 작성 요청하기
	            var _url = gptpt.plugin_domain_fast + "apps/meeting_file_upload";
	           	const formData = new FormData();
	           	formData.append("file", blob, "recorded_audio.webm");
	          	formData.append("ky", gap.userinfo.rinfo.ky);    
				formData.append("title", $("#meeting_title").val());    
				formData.append("user", gap.userinfo.rinfo.nm);
				formData.append("call_code", gptpt.current_code);
				formData.append("lang", gap.curLang);
				formData.append("data", data);    	          	
	          	var cc = "meeting_response_chat_" + new Date().getTime();	
				myDropzone_review.cc = cc;	
				gptapps.ai_mydata_response(cc);			           	
	           	$.ajax({
					url : _url,
					type : "POST",
					data : formData,
					processData: false,
					contentType: false,
					success : function(res){							
						gptapps.draw_review_anlayzer(res.res.replace(/\n/gi,"<br>"));
					},
					error : function(e){								
					}
				});		            
			}

			$("#dark_layer").fadeOut(200);
			$("#dark_layer").empty();
		});
	},
	
	"showMeetMailForward" : function(){
		var _self = this;
		var html = 
			'<div id="meet_forward_layer" class="reg-category-ly" style="width: 560px;">' +			
			'	<div class="layer_inner" >' +
			'		<div class="pop_btn_close" style="right:33px;"></div>' +
			'		<h2>'+gap.lang.va224+'</h2>' +
			'		<div class="layer-cont">' +
			'			<div class="left-cont">' +
			'				<div class="each">' +
			'					<div class="menu-title">'+gap.lang.va221+'<sup>*</sup></div>' +
			'					<div class="meet_work_input_box" style="display:flex">' +
			'						<input id="reg_meet_title" placeholder="'+gap.lang.va222+'">' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">'+gap.lang.recipient+'<sup>*</sup></div>' +
			'					<div class="meet_work_input_box" style="display:flex">' +
			'						<input id="reg_mail_sendto" placeholder="'+gap.lang.select_recipient_msg+'">' +
			'						<div class="btn-menu-mng-org"></div>' +			
			'					</div>' +
			'					<div id="menu_mng_user_wrap" style="display:none;">' +
			'						<ul id="menu_mng_user_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +			
			'				</div>' +
			'			</div>' +			
			'		</div>' +
			'		<div style="margin-top:20px;text-align:center;display:flex;">' +
			'			<button id="btn_mail_forward_ok" class="btn-ok">'+gap.lang.va223+'</button>' +
			'			<button id="btn_mail_forward_cancel" class="btn-ok">'+gap.lang.Cancel+'</button>' +			
			'		</div>' +					
			'	</div>' +
			'</div>';		
		
		gap.showBlock();
		$(html).appendTo('body');
		var $layer = $('#meet_forward_layer');
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
		$layer.wrap('<div id="common_work_layer" class="mu_container mu_work mu_group" style="top:-50%;"></div>');		
		// 메일 제목 세팅
		$("#reg_meet_title").val(gptapps.meeting_title);		
		// 이벤트 처리
		this.meetMailForwardEvent();
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
		$li.find('.file_remove_btn').on('click', function(){
			$(this).closest('li').remove();			
			if ($list.find('li').length == 0) {
				$('#menu_mng_user_wrap').hide();
			}
		});		
		$list.append($li);
		$('#menu_mng_user_wrap').show();
	},				
	
	"meetMailForwardEvent" : function(){
		var _self = this;		
		// 이벤트 처리
		var $menu_ly = $('#meet_forward_layer');		
		// 닫기
		$menu_ly.find('.pop_btn_close').on('click', function(){
			$('#meet_forward_layer').remove();
			gap.hideBlock();
		});				
		// 대상자 입력
		$('#reg_mail_sendto').on('keydown', function(e){
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
		$menu_ly.find('.btn-menu-mng-org').on('click', function(){
			var block_idx = parseInt($('#blockui').css('z-index'));
			$menu_ly.css('z-index', block_idx-1);
			window.ORG.show(
				{
					'title': gap.lang.select_recipient_msg,
					'isadmin': true,	// 
					'single': true,
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
						$menu_ly.css('z-index', block_idx+1);
					}
				}
			);
		});
		
		// 회의록 공유
		$('#btn_mail_forward_ok').on('click', function(){
			var $this = $(this);
			// 중복 수행 방지
			if ($this.hasClass('process')) return;			
			$this.addClass('process');
			var valid = _self.reg_mail_forward_valid();			
			if (!valid) {
				$this.removeClass('process');
				return false;
			}			
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
					"Ext_1" : gptapps.meeting_title,
					"Ext_2" : gptapps.meeting_dt,
					"Ext_3" : gptapps.meeting_member,
					"Ext_4" : gptapps.meeting_link
				};	
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : postData,
				success : function(__res){
					var res = __res;
					if (res.success){
						$menu_ly.find('.pop_btn_close').click();
	
					}else{
						// do nothing...
					}
				},
				error : function(e){
				}
			});	
		});
		
		//취소
		$('#btn_mail_forward_cancel').on('click', function(){
			$menu_ly.find('.pop_btn_close').click();
		});
	},
	
	"reg_mail_forward_valid" : function(){
		var _title = $.trim($('#reg_meet_title').val());
		if (_title == '') {
			$('#reg_meet_title').focus();
			mobiscroll.toast({message:gap.lang.va212, color:'danger'});
			return false;
		}
		
		var _sendto = $('#menu_mng_user_list li').length;
		if  (_sendto == 0){
			$('#reg_mail_sendto').focus();
			mobiscroll.toast({message:gap.lang.select_recipient_msg, color:'danger'});
			return false;			
			
		}
		return true;
	},
	
	"showMeetChatForward" : function(){
		var _self = this;
		var html = 
			'<div id="meet_forward_layer" class="reg-category-ly" style="width: 560px;">' +			
			'	<div class="layer_inner" >' +
			'		<div class="pop_btn_close" style="right:33px;"></div>' +
			'		<h2>'+gap.lang.va225+'</h2>' +
			'		<div class="layer-cont">' +
			'			<div class="left-cont">' +
			'				<div class="each">' +
			'					<div class="menu-title">'+gap.lang.recipient+'<sup>*</sup></div>' +
			'					<div class="meet_work_input_box" style="display:flex">' +
			'						<input id="reg_mail_sendto" placeholder="'+gap.lang.select_recipient_msg+'">' +
			'						<div class="btn-menu-mng-org"></div>' +			
			'					</div>' +
			'					<div id="menu_mng_user_wrap" style="display:none;">' +
			'						<ul id="menu_mng_user_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +			
			'				</div>' +
			'			</div>' +			
			'		</div>' +
			'		<div style="margin-top:20px;text-align:center;display:flex;">' +
			'			<button id="btn_mail_forward_ok" class="btn-ok">'+gap.lang.va223+'</button>' +
			'			<button id="btn_mail_forward_cancel" class="btn-ok">'+gap.lang.Cancel+'</button>' +			
			'		</div>' +					
			'	</div>' +
			'</div>';		
		
		gap.showBlock();
		$(html).appendTo('body');
		var $layer = $('#meet_forward_layer');
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
		$layer.wrap('<div id="common_work_layer" class="mu_container mu_work mu_group" style="top:-50%;"></div>');
		
		// 메일 제목 세팅
		$("#reg_meet_title").val(gptapps.meeting_title);
		
		// 이벤트 처리
		this.meetChatForwardEvent();
	},
	
	"meetChatForwardEvent" : function(){
		var _self = this;		
		// 이벤트 처리
		var $menu_ly = $('#meet_forward_layer');		
		// 닫기
		$menu_ly.find('.pop_btn_close').on('click', function(){
			$('#meet_forward_layer').remove();
			gap.hideBlock();
		});				
		// 페널티 대상자 입력
		$('#reg_mail_sendto').on('keydown', function(e){
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
		$menu_ly.find('.btn-menu-mng-org').on('click', function(){
			var block_idx = parseInt($('#blockui').css('z-index'));
			$menu_ly.css('z-index', block_idx-1);
			window.ORG.show(
				{
					'title': '수신자 선택',
					'isadmin': true,	// 창혜원 관리자
					'single': true,
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
						$menu_ly.css('z-index', block_idx+1);
					}
				}
			);
		});
		
		// 회의록 공유
		$('#btn_mail_forward_ok').on('click', function(){
			var $this = $(this);
			// 중복 수행 방지
			if ($this.hasClass('process')) return;			
			$this.addClass('process');
			var valid = _self.reg_chat_forward_valid();			
			if (!valid) {
				$this.removeClass('process');
				return false;
			}			
			var _sinfo = gap.user_check(gap.userinfo.rinfo);
			var _receiver = [];
			var $list = $('#menu_mng_user_list li');
			$.each($list, function(){
				_receiver.push( $(this).data('ky') );
			});
			var msg = gap.lang.va226 + " : " + gptapps.meeting_link;
			var receivers = _receiver;
			gBody.send_msg_etc(msg, receivers);
			$menu_ly.find('.pop_btn_close').click();
		});
		
		//취소
		$('#btn_mail_forward_cancel').on('click', function(){
			$menu_ly.find('.pop_btn_close').click();
		});
	},
	
	"reg_chat_forward_valid" : function(){
		var _sendto = $('#menu_mng_user_list li').length;
		if  (_sendto == 0){
			$('#reg_mail_sendto').focus();
			mobiscroll.toast({message:gap.lang.select_recipient_msg, color:'danger'});
			return false;						
		}
		return true;
	},	
	
	"showNoteShare" : function(id){
		var _self = this;
		var html = 
			'<div id="meet_forward_layer" class="reg-category-ly" style="width: 560px;">' +			
			'	<div class="layer_inner" >' +
			'		<div class="pop_btn_close" style="right:33px;"></div>' +
			'		<h2>'+gap.lang.share+'</h2>' +
			'		<div class="layer-cont">' +
			'			<div class="left-cont">' +
			'				<div class="each">' +
			'					<div class="menu-title">'+gap.lang.basic_title+'<sup>*</sup></div>' +
			'					<div class="meet_work_input_box" style="display:flex">' +
			'						<input id="reg_meet_title" placeholder="'+gap.lang.va218+'">' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">'+gap.lang.recipient+'<sup>*</sup></div>' +
			'					<div class="meet_work_input_box" style="display:flex">' +
			'						<input id="reg_mail_sendto" placeholder="'+gap.lang.select_recipient_msg+'">' +
			'						<div class="btn-menu-mng-org"></div>' +			
			'					</div>' +
			'					<div id="menu_mng_user_wrap" style="display:none;">' +
			'						<ul id="menu_mng_user_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +			
			'				</div>' +
			'			</div>' +			
			'		</div>' +
			'		<div style="margin-top:20px;text-align:center;display:flex;">' +
			'			<button id="btn_mail_forward_ok" class="btn-ok">'+gap.lang.share+'</button>' +
			'			<button id="btn_mail_forward_cancel" class="btn-ok">'+gap.lang.Cancel+'</button>' +			
			'		</div>' +					
			'	</div>' +
			'</div>';		
		
		gap.showBlock();
		$(html).appendTo('body');
		var $layer = $('#meet_forward_layer');
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
		$layer.wrap('<div id="common_work_layer" class="mu_container mu_work mu_group" style="top:-50%;"></div>');		
		// 이벤트 처리
		this.meetNoteShareEvent(id);
	},
	
	"add_note_share_mnguser" : function(_info){	// 노트 공유 수신자 추가
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
			'<li class="f_between" data-ky="' + user_info.ky + '">' +
			'	<span class="txt ko">' + disp_txt + '</span>' +
			'	<button class="file_remove_btn"></button>' +
			'</li>';		
		var $li = $(html);
		$li.find('.file_remove_btn').on('click', function(){
			$(this).closest('li').remove();			
			if ($list.find('li').length == 0) {
				$('#menu_mng_user_wrap').hide();
			}
		});		
		$list.append($li);
		$('#menu_mng_user_wrap').show();
	},				
	
	"meetNoteShareEvent" : function(id){
		var _self = this;
		_self.id = id;		
		// 이벤트 처리
		var $menu_ly = $('#meet_forward_layer');		
		// 닫기
		$menu_ly.find('.pop_btn_close').on('click', function(){
			$('#meet_forward_layer').remove();
			gap.hideBlock();
		});			
		$('#reg_mail_sendto').on('keydown', function(e){
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
					
					_self.add_note_share_mnguser(email);
				});				
			}		
			if (nm_list.length > 0){
				gsn.requestSearch('', nm_list.join(","), function(res){
					$.each(res, function(){
						_self.add_note_share_mnguser(this);
					});
					$('#reg_mail_sendto').focus();				
				});					
			}
			$(this).val('');
		});					
		
		// 수신자 입력 (조직도 선택)
		$menu_ly.find('.btn-menu-mng-org').on('click', function(){
			var block_idx = parseInt($('#blockui').css('z-index'));
			$menu_ly.css('z-index', block_idx-1);
			window.ORG.show(
				{
					'title': gap.lang.select_recipient_msg,
					'isadmin': true,	// 창혜원 관리자
					'single': true,
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
						$menu_ly.css('z-index', block_idx+1);
					}
				}
			);
		});
		
		// 회의록 공유
		$('#btn_mail_forward_ok').on('click', function(){			
			var id = _self.id;			
			var $this = $(this);
			// 중복 수행 방지
			if ($this.hasClass('process')) return;			
			$this.addClass('process');
			var valid = _self.reg_mail_forward_valid();			
			if (!valid) {
				$this.removeClass('process');
				return false;
			}			
			var _sinfo = gap.user_check(gap.userinfo.rinfo);
			var _receiver = [];
			var $list = $('#menu_mng_user_list li');
			$.each($list, function(){
				_receiver.push( $(this).data('ky') );
			});
			var _title = $.trim($('#reg_meet_title').val());
			var content = $("#" + id).html();			

			var url = gptpt.plugin_domain_fast + "notebook/ai_note_save_share";
			var data = JSON.stringify({
				"receive" : _receiver,
				"title" : _title,
				"content" : content,
				"owner" : gap.userinfo.rinfo
			});			
			gap.ajaxCall(url, data, 
				function(res){
					if (res.result == "OK"){
						$('#btn_mail_forward_cancel').click();
					}else{
						gap.error_alert();
					}
				}
			);
		});
		
		//취소
		$('#btn_mail_forward_cancel').on('click', function(){
			$menu_ly.find('.pop_btn_close').click();
		});
	},	
	
	
	////////////// 출처 텍스트 레이어 그리는 함수 //////////////////
	"reference_list_layer_draw": function(msg){
		var html = "";
		
		html += "<div id='meeting_list_layer' style='width:50%'>";
		html +=	"	<div class='layer_inner'>";
		html += "		<div class='layer_content'>";
		html += "			<div class='left_content'  style='width:100%; border-radius:20px'>";		
		html += "				<div style='display:flex; flex-direction:row; justify-content:space-between'>";
		html +=	"					<h4 class='content_title'>"+gap.lang.va227+"</h4>";		
		html +=	"					<button type='button' id='btn_layer_close' class='button_layer_close'></button>";
		html += "				</div>";		
		html +=	"				<div id='proceedings_wrap' class='proceedings_wrap' style='height:100%'>";
		html +=	"					<div id='refer_textarea' style='position:relative; height:calc(100% - 40px);overflow:auto;padding: 10px 10px 20px 10px;'>";		
		html +=	"					</div>";
		html +=	"				</div>";		
		html +=	"			</div>";	
		html +=	"		</div>";
		html +=	"	</div>";
		html +=	"</div>";		
		$("#dark_layer").fadeIn(200);
		$("#dark_layer").html(html);		
		$("#refer_textarea").html(msg.replace(/[\n]/gi,"<br>"));
		$("#refer_textarea").mCustomScrollbar({
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
			autoHideScrollbar : false	
		});				
			
		$("#btn_layer_close").on("click", function(){
			$("#dark_layer").fadeOut(200);	
			$("#dark_layer").empty();
		});
		
	},
	
	"location_search" : function(query){
		var url = gptpt.plugin_domain_fast + "apps/location_search";
		var data = JSON.stringify({
			"query" : query
		});
		
		gap.ajaxCall(url, data, function(res){			
			if (res.result.place_results){
				var p1 = res.result.place_results.gps_coordinates.latitude;
				var p2 = res.result.place_results.gps_coordinates.longitude;				
				var html = "<div id='map-popup'>";
				html += "	<span id='close-popup'>X</span>";
				html += "   <iframe id='google-map' width='400px' height='400px' frameborder='0' style='border:0;' allowfullscreen></iframe>";
				html += "</div>";				
				$("body").append(html);				
				// $('.building').on('click', function () {
			        const lat = p1;
			        const lng = p2;			
			        // Google Maps URL
			        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=ko&z=16&output=embed`;			
			        // Set the iframe src to Google Maps URL
			        $('#google-map').attr('src', mapUrl);
			
			        // Show the popup
			        $('#map-popup').fadeIn();
			   // });
			
			    // Close the popup
			    $('#close-popup').on('click', function () {
			        $('#map-popup').fadeOut();
			        $('#google-map').attr('src', ''); // Clear iframe to stop loading
			    });
			}else{
				gap.gAlert("위치 정보가 존재하지 않습니다.")
			}			
		});
	},
	
	"tavily" : function(){
		var url = gptpt.plugin_domain + "ssp";
		var data = JSON.stringify({})
		gap.ajaxCall(url, data, function(res){
			console.log(res);
	
		});
		
	},
		
	"mark_url_summary" : function(){		
		//URL 요약하기
	    var url_id = "url_summary_dis_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+url_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);			
		var ans_li2 = "			"+ gap.lang.va148;
		ans_li2 += "			<div class='btn_wrap' >";
		ans_li2 += "				<button type='button' class='btn_blue' id='link_"+url_id+"'>https://www.newsis.com/view/NISX20250205_0003053662</button>";
		ans_li2 += "		</div>";		
	//	ans_li2 += "		<div>";
	//	ans_li2 += "		<button type='button' class='btn_blue' style='display:none' id='meeting_file_record_download_"+review_id+"_btn'><a id='meeting_file_record_download_"+review_id+"' download='recording.webm'>다운로드</a><button>			<audio id='meeting_file_record_end_"+review_id+"_audio' controls style='display:none'></audio> </div>";
	    ans_li2 = gptpt.special_change(ans_li2);	    
	    gptapps.mediaRecorder;
      	gptapps.recordedChunks = [];	        
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				//$("#search_work").focus();		
				gptpt.gpt_input_focus();		
				gptpt.voice_end();		
				
				$("#link_" + url_id).off().on("click", function(e){
					var url = $(e.target).text();			
					var cc = "url_summary_chat_" + new Date().getTime();		
					gptapps.send_url_summary(url, cc, true);
				});					
			}
		}
		var typed = new Typed("#dis_"+url_id, options);	
	},
	
	"send_url_summary" : function(url, cc, is_related_process){		
		var youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([^&?\/]+)/;
        var match = url.match(youtubeRegex);
        var yutube_key = ""
        if (match) {
			yutube_key = (match[1]);
        } 		

		var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			url : url,
			code : "normal_chat",
			lang : gap.curLang,
			call_code : (gptpt.current_code == ""  ? "it19" : gptpt.current_code),
			roomkey : gptpt.cur_roomkey
		});							
	//	gptapps.ai_mydata_response(cc);		
	//	$("#" + cc).parent().remove();			
		//내부 자료에서 검색이 되지 않아 LLM에 질문한다.
		gptapps.is_related_process = is_related_process;		
		if (gptapps.is_related_process){
			gptapps.ai_normal_response_url_summary(cc);	
		}		
		var ssp = new SSE(gptpt.plugin_domain_fast + "apps/webpage_summary", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	            method: 'POST'});
		var is_start = true;
		var is_dis = false;
		var pre_text = ""
		var url_title = "";	
	
		ssp.addEventListener('open', function(e) {
			$("#" + cc + "_typed").remove();				
			if (gptapps.is_related_process){
				gap.scroll_move_to_bottom_time_gpt(500);
			}			
		});
		
		ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");		
			ssp.close();	
		});
				
	   	ssp.addEventListener('message', function(e, is_related_process) {	
			//console.log(e.data);
			if (e.data == "ERROR"){
				alert("ERROR")
			}
			_self = this;		
			var pph = e.data.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");			
			if (e.data == "[DONE]"){
				$("#btn_work_req").removeClass("stop");
			
				var tmsg = $("#" + cc).html();		
				$("#" + cc).html(tmsg);		
				if (gptapps.is_related_process){
					gptapps.releated_url(url_title, cc);
				}							
				var html = "";
				/*html += "	<div class='gpt_btn_wrap_box' style='margin-top: 8px; padding-left:0px'>";*/
				html += "	<div class='gpt_btn_wrap_box' style='margin: 8px 0 16px; padding-left:0px'>";
				html +=	"		<div class='gpt_btn_wrap' style='padding-left: 4px;'>";
				html +=	"			<button type='button' class='btn_ai_answer copy' data-id='"+cc+"'><span class='btn_ico'></span></button>";
				html +=	"			<button type='button' class='btn_ai_answer share' data-id='"+cc+"'><span class='btn_ico'></span></button>";				
			//	if (yutube_key != ""){
			//		html +=	"		<button type='button' class='btn_yutube_summary' data-id='"+cc+"' data-key='"+yutube_key+"'>";
			//		html += "			<span class='btn_inner'>";
			//		html += "				<span>"+gap.lang.va150+"</span>";
			//		html += "			</span>";
			//		html += "		</button>";
			//	}								
				html +=	"		</div>";
				html +=	"		<button type='button' class='btn_save_to_note' data-id='"+cc+"' data-title='"+_self.title+"' title='" + gap.lang.va114 + "'>";
				html += "			<span class='btn_inner'>";
				html += "				<span class='btn_ico'></span><span class='btn_txt' >"+gap.lang.va114+"</span>";
				html += "			</span>";
				html += "		</button>";
				html += "	</div>";				
				if (yutube_key != ""){					
					html += "				<div class='summary_box' style='margin-top:10px'>";
					html += "					<div class='inner flex_col'>";
					html += "						<div class='summary_txt_wrap' id='yutube_"+cc+"'><span id='yutube_"+cc+"_typed' style='height:30px'></span>";						
					html += "						</div>";						
					html +=	"					</div>";
					html += "				</div>";
					html += ""
				}								
				$("#"+cc).append(html);					
				$(".btn_yutube_summary").off().on("click", function(e){					
					var key = $(e.currentTarget).data("key");					
					$("#yutube_"+cc).parent().parent().fadeIn();
					gptpt.process_display("Downloading YouTube videos and Analyzing..........", "yutube_"+cc);							
					gptapps.yutube_video_summary(key, cc);
				});				
				
				$(".gpt_btn_wrap_box .btn_ai_answer.copy").off().on("click", function(e){
					var id = $(e.currentTarget).data("id");
					gnote.range_text_copy_url_summary(id);
				});
				
				$(".gpt_btn_wrap_box .btn_ai_answer.share").off().on("click", function(e){
					var id = $(e.currentTarget).data("id");
					gptapps.showNoteShare(id);
				});
				
				$(".gpt_btn_wrap_box .btn_save_to_note").off().on("click", function(e){					
					var id = $(e.currentTarget).data("id");			
					//var content = $("#" + id).html();
					 var cloned = $('#'+id).clone();
			        cloned.find(".answer_link_box").remove();
					cloned.find('.gpt_btn_wrap_box').remove();
					cloned.find('.summary_box').remove();
					cloned.find('.related_info_wrap').remove();
					var content = cloned.html();					
					var title = $(e.currentTarget).data("title");			
					//팝업창을 띄워서 어떤 노트북에 등록 할 것인지 선택하면 notebook_code가 리턴되고 해당 값을 활용하여 아래 함수를 수행한다.							
					gnote.save_as_note_layer_draw(title, content);
				});
				
				ssp.close();
        		return;
			}else{			
				//console.log(e.data);
				if (is_start){					
					var obj = pph.split("-sp-");					
					var title = obj[0];
					_self.title = title;
					url_title = title;
					var description  = obj[1];
					var image = obj[2];
					var ogurl = obj[3];						
					if (image && !image.includes("http") && image != ""){						
						var domain = ogurl.match(/^(https?:\/\/[^/]+)/)[1];
						image = domain + image;
					}
					var empty_url = "resource/images/ai_answer_icon/empty_thumb.svg";
					if (image != ""){
						var html = "";
						html += "<div class='ai_answer_wrap flex_col'>";						
						html += "		<div class='answer_link_box' onclick=\"window.open('" + ogurl + "', '_blank')\">";
						html += "			<img class='answer_link_img' src='"+image+"' onError='this.onerror=null; this.src=\""+empty_url+"\";'>";
						html += "			<div class='link_info_box_wrap flex_col'>";
						html += "				<div class='link_info_box flex_col'>";
						html += "					<div class='link_info_title_box'>";
					//	html += "						<img class='link_icon' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAY1BMVEX////lsK/sxcXtysn89vb67+/pubjfnZ3DKyjhp6bBHRjAFhDRa2nQaGfgoqHOYF7CJiLYhoXYiondmJfTdnXqv763AADw09P25uW7AAD14eHENDHOYmDRcG/bkZDy2NjLU1FdgO/7AAAAnklEQVR4AeWQBQKAIAwAR4PdXf//pMIw3yDNbg2/GoQyypmQSkkBwOy4kdDcniYACO2GyHIeX1AneKUAmQbIC/cpK8/qpsWbIRRNjZ+mQ2HUD3gDwqTHeG1fomTsuxesLjj5kB/L+Qunvn1BdcEFJbKXeK/Cwe5K6HQ3+qJmhFChiZo8A545T6QRvgkbd8erfUaathukMa59sq4l/GkcMuwIBg9W17cAAAAASUVORK5CYII='>";
						html += "						<div class='link_info_title'>"+title+"</div>";
						html += "					</div>";
						html += "					<a class='answer_link'>"+decodeURIComponent(ogurl)+"</a>";
						html += "				</div>";
						html += "			</div>";
						html += "		</div>";									
						html += "</div>";						
						$("#"+cc).append(html);							
					}				
					is_start = false;			
				}else{										
					$("#"+cc).append(pph);	
				}		
			}		
		});
		ssp.stream();	
		gptpt.source.push(ssp);	
		return false;		
	},
	
	"yutube_video_summary" : function(key, cc){
		var data = JSON.stringify({
			"key" : key,
			"lang" : gap.curLang
		});			
		var ssp = new SSE(gptpt.plugin_domain_fast + "yutube/yutube_summary", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:data,
	            method: 'POST'});	            
	    ssp.addEventListener('open', function(e) {				
			gptpt.process_display_remove("yutube_"+cc);
		});
		ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");		
			ssp.close();	
		});
	   	ssp.addEventListener('message', function(e) {	
			//console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");				
			if (e.data == "[DONE]"){
				$("#btn_work_req").removeClass("stop");		
				var tmsg = $("#yutube_"+cc).html();
				tmsg = gptpt.change_markdown_html_webgenai(tmsg);
				$("#yutube_"+cc).html(tmsg);			
				var html = "";
				html += "	<div class='gpt_btn_wrap_box' style='margin-top: 8px; padding-left:0px'>";
				html +=	"		<div class='gpt_btn_wrap' style='padding-left: 4px;'>";
				html +=	"			<button type='button' class='btn_ai_answer copy' data-id='yutube_"+cc+"'><span class='btn_ico'></span></button>";
				html +=	"			<button type='button' class='btn_ai_answer share' data-id='yutube_"+cc+"'><span class='btn_ico'></span></button>";			
				html +=	"		</div>";
				html +=	"		<button type='button' class='btn_save_to_note' data-id='yutube_"+cc+"' data-title='"+_self.title+"'>";
				html += "			<span class='btn_inner'>";
				html += "				<span class='btn_ico'></span><span>"+gap.lang.va114+"</span>";
				html += "			</span>";
				html += "		</button>";
				html += "	</div>";				
				$("#yutube_"+cc).append(html);					
				
				$(".gpt_btn_wrap_box .btn_ai_answer.copy").off().on("click", function(e){
					var id = $(e.currentTarget).data("id");
					gnote.range_text_copy_url_summary(id);
				});				
				$(".gpt_btn_wrap_box .btn_ai_answer.share").off().on("click", function(e){
					var id = $(e.currentTarget).data("id");
					gptapps.showNoteShare(id);
				});				
				$(".gpt_btn_wrap_box .btn_save_to_note").off().on("click", function(e){					
					var id = $(e.currentTarget).data("id");			
				//	var content = $("#" + id).html();					
					 var cloned = $('#'+id).clone();
			        cloned.find(".answer_link_box").remove();
					cloned.find('.gpt_btn_wrap_box').remove();
					cloned.find('.summary_box').remove();
					cloned.find('.related_info_wrap').remove();
					var content = cloned.html();					
					var title = $(e.currentTarget).data("title");			
					//팝업창을 띄워서 어떤 노트북에 등록 할 것인지 선택하면 notebook_code가 리턴되고 해당 값을 활용하여 아래 함수를 수행한다.						
					gnote.save_as_note_layer_draw(title, content);
				});	
				ssp.close();
        		return;			
			}else{				
				$("#yutube_"+cc).append(pph);	
			}	
			
		});
		ssp.stream();
		gptpt.source.push(ssp);	
	},
	
	"releated_url" : function(title, id){		
		var url = gptpt.plugin_domain_fast + "apps/make_query"
		var data = JSON.stringify({
			"query" : title,
			"lang" : gap.curLang
		});	
		gap.ajaxCall(url, data,
			function(res){
				var querys = res.result;
				gptapps.search_urls_releated(querys, id, "");
				//gap.scroll_move_to_bottom_time_gpt(200);
			}
		);		
	},
	
	"search_urls_releated" : function(querys, id, opt){		
		var	type = "google";				
		//var url = gptpt.plugin_domain_fast + "apps/search_urls_async_with_pl"
		var url = gptpt.plugin_domain_fast + "apps/search_urls_async"
		var data = JSON.stringify({
			"query" : querys,
			"type" : type,
			"opt" : (opt == "new" ? "today" : "")
		});		
		gap.ajaxCall(url, data,
			function(res){
				gap.hide_loading();	
				
				var querys = res.result;					
				var html = "";			
				html += "	<div class='related_info_wrap'>";			
				html += "		<div class='related_info_title_wrap' data-id='sub_desc_"+id+"'>";
				html += "			<div class='related_info_title_box'>";
				html += "				<div class='rel_info_ico'></div>";
				if (opt == "new"){
					html += "				<div class='rel_info_title'>"+gap.lang.va151+"</div>";
				}else{
					html += "				<div class='rel_info_title'>"+gap.lang.va147+"</div>";
				}				
				html += "			</div>";
				html += "			<button type='button' class='btn_info_fold fold' >";
				html += "		</div>"; //related_info_title_wrap				
				html += "		<div class='related_info_ul flex_col' style='display:none' id='sub_desc_"+id+"'>";								
				for (var i = 0; i < querys.length; i++){
					var item = querys[i];
					if (item.urls.length > 0){
						html += "	<div class='related_info_li'>";
					html += "		<div class='related_info_li_title_box'>";
					html += "			<div class='related_info_li_title'>"+item.question+"</div>";
					html += "			<button type='button' class='btn_li_folder'></button>";
					html += "		</div>";
					html += "		<div class='rel_info_li_depth2_ul flex_col'>";						
					for (var k = 0; k < item.urls.length; k++){
						var sitem = item.urls[k];
						var title = sitem.title;
						var snap = sitem.snap;
						var url = sitem.url;
						var date = sitem.date;
					//	var favicon = sitem.favicon;					
						var cc = "url_summary_chat_sub_" + new Date().getTime();
						var dis_id = cc + "_" + i + "_" + k;						
						html += "			<div class='rel_info_li_depth2_li flex_col'>";						
						html += "				<div class='inner'>";
						html += "					<div class='rel_info_li_depth2_li_title_wrap flex_col' data-url='"+url+"'>";
						html += "						<div class='rel_info_li_depth2_li_txt_wrap flex_col'>";
						html += "							<div class='rel_info_li_depth2_li_title' title='"+title+"'>"+title+"</div>"; //<img src='"+favicon+"' style='width:15px; margin-right:5px;'>
						html += "							<div class='rel_info_li_depth2_li_desc'>"+ snap+"</div>";
						html += "							<div class='rel_info_li_depth2_li_desc' style='font-size:15px;color:#2d2c2c'>Date : "+ date+"</div>";
						html += "						</div>";						
						//// 요약하기 버튼
						html += "						<button type='button' class='btn_summarize' data-url='"+url+"' data-id='"+dis_id+"'>";
						html += "							<span class='btn_inner'>";
						html += "								<span class='btn_ico'></span>";
						html += "								<span class='btn_txt'>"+gap.lang.va146+"</span>";
						html += "							</span>";
						html += "						</button>";	
						html += "					</div>";
				//		html += "					<img class='rel_info_li_depth2_li_img' src='7-0-92679700-1737512870-shutterstock_2136489299.jpg?resize=1024%2C576&quality=50&strip=all'>";
						html += "				</div>";
						/// 요약문
						html += "				<div class='summary_box'>";
						html += "					<div class='inner flex_col'>";
						html += "						<div class='summary_txt_wrap' id='"+dis_id+"'>";						
						html += "						</div>";						
						html +=	"					</div>";
						html += "				</div>";
						html += "			</div>";	
					}
					html += "		</div>";
					html += "	</div>"; //related_info_li
					}				
				}
				
				html += "		</div>"; //related_info_ul				
				html += "	</div>"; //related_info_wrap							
				$("#" + id).append(html);				
				$("#" + id +" .rel_info_li_depth2_li_txt_wrap.flex_col").off().on("click", function(e){
					var url = $(e.currentTarget).parent().data("url");
					window.open(url, "", null);
				});							
				if (opt == "new"){
					setTimeout(function(){
						$(".related_info_title_wrap").click();
					}, 1000);					
				}				
				/// 모든 관련된 정보 접고펴기
				$("#" + id +" .related_info_title_wrap").off().on("click", function(e){						
					$(this).find("#" + id +" .btn_info_fold").toggleClass("fold");					
					if($(this).find("#" + id +" .btn_info_fold").hasClass("fold")){
						$(this).siblings("#" + id +" .related_info_ul").find(".btn_li_folder").addClass("fold");
						$(this).siblings("#" + id +" .related_info_ul").find(".btn_summarize.fold").removeClass("fold").find(".btn_txt").html("요약하기");
						$(this).siblings("#" + id +" .related_info_ul").find(".summary_box").slideUp(300);
						$(this).siblings("#" + id +" .related_info_ul").find(".rel_info_li_depth2_ul").slideUp(300);
					} else {
						var id = $(e.currentTarget).data("id");
						$("#" + id).fadeIn();
						$(this).siblings("#" + id +" .related_info_ul").find(".btn_li_folder").removeClass("fold");
						$(this).siblings("#" + id +" .related_info_ul").find(".rel_info_li_depth2_ul").slideDown(300);
					}					
				});				
				/// 각각의 관련된 정보 접고펴기
				$(".related_info_li_title_box").off().on("click", function(){					
					$(this).find(".btn_li_folder").toggleClass("fold");
					$(this).siblings(".rel_info_li_depth2_ul").slideToggle(300);					
					if($(this).closest(".related_info_ul").find(".related_info_li").length ===
					$(this).closest(".related_info_ul").find(".btn_li_folder.fold").length){
						/// 접힌 갯수와 총 갯수가 같을 때 화살표 아이콘 아래로 rotate
						$(this).closest(".related_info_wrap").find(".btn_info_fold").addClass("fold");
					} else {
						/// 하나라도 펼쳐져 있으면 화살표 아이콘 위로 rotate
						$(this).closest(".related_info_wrap").find(".btn_info_fold").removeClass("fold");						
					}
				});
				
				$(".btn_summarize").off().on("click", function(e){					
					$(this).toggleClass("fold");					
					if($(this).hasClass("fold")){						
						var url = $(e.currentTarget).data("url");	
						var id = $(e.currentTarget).data("id");							
						var mm = $("#" + id).html().trim();
						if (mm == ""){
							gptapps.send_url_summary(url, id, false);
						}						
						$(this).find(".btn_txt").html(gap.lang.va144);						
						//$(this).closest(".rel_info_li_depth2_li").find(".summary_box").slideDown(300);
						$(this).closest(".rel_info_li_depth2_li").find(".summary_box").css({
							    "display" : "flex",
								"flex-direction" : "column"
							}).slideDown(300);						
						$("#" + id).append("<span id='"+id+"_typed' style='display:block;height:30px'></span>");						
						gptpt.process_display("WebSite Analyzing......",  id);
					} else {
						$(this).find(".btn_txt").html(gap.lang.va145);
						$(this).closest(".rel_info_li_depth2_li").find(".summary_box").slideUp(300);
					}
				});			
			}
		)
	},
	
	"summary_news" : function(txt){
		var question_id = "question_" + new Date().getTime();
		var html = "<div id='"+question_id+"'></div>";
		$("#"+gptapps.dis_id).append(html);		
		var url = gptpt.plugin_domain_fast + "apps/make_query"
		var data = JSON.stringify({
			"query" : txt,
			"lang" : gap.curLang
		});	
		gap.ajaxCall(url, data,
			function(res){
				var querys = res.result;
				//gptapps.question_process(querys, question_id);
				gptapps.search_urls_releated(querys, question_id, "new");
				//gap.scroll_move_to_bottom_time_gpt(200);				
				
			}
		);		
	},	
	
	"createNewPPTX_m365" : function(accessToken){
		const url = "https://graph.microsoft.com/v1.0/me/drive/root/ygkim/children?%40microsoft.graph.conflictBehavior=rename";
        const fileName = "NewPresentation.pptx";
        const requestBody = {
          "name": fileName,
          "file": {}  // 빈 file 객체: 콘텐츠 없이 빈 PPTX 파일 생성 (Office Online에서 기본 템플릿 사용)
        };
        $.ajax({
          url: url,
          type: "POST",
          contentType: "application/json",
          headers: {
            "Authorization": "Bearer " + accessToken
          },
          data: JSON.stringify(requestBody),
          success: function(response) {        	 
            console.log("파일 생성 성공:", response);
            // 생성된 파일의 webUrl을 통해 Office Online 편집 모드로 열기
            if (response && response.webUrl) {
              var url = response.webUrl;
			  gap.popup_url(url);
            } else {
              console.error("webUrl을 찾을 수 없습니다.");
            }
          },
          error: function(error) {
            console.error("파일 생성 오류:", error);
          }
        });
	},
	
	
	"make_content" : function(){		
		var url = gptpt.plugin_domain_fast + "apps/make_content"
		var data = JSON.stringify({
			"word" : "111",
			"opt" : "1"
		});	
		gap.ajaxCall(url, data,
			function(res){
				console.log(res);
			}
		);		
	},	
	
	"draw_tooltip" : function(pos, txt){
		var html = "";
		var content = "";		
		//// 툴팁 위치 변수
		var tooltip_posX = "";
		var tooltip_posY = "";		
		//툴팁 꼬리 위치
		var tail_pos = "bot";
		tooltip_posX = "center";
		tooltip_posY = "";
		html += "<div id='alarm_preferences_tooltip' class='tail_" + tail_pos + "'>";
		html += 	"<div style='color:#ffffff'>"+txt+"</div>";
		html += "</div>";		
		type = "popup";		
		$("body").append(html);		
		if(tooltip_posX === "left"){
			if(type !== "alarm_noti"){
				if(type === "alarm_popup"){
					/// 팝업 알림 주기 설정
					tooltip_posX = pos[0] * 2 + 29;
					tooltip_posY = pos[1] - $("#alarm_preferences_tooltip").outerHeight() + 30;	
				}
			} else {
				/// 알림창 주기 설정
				tooltip_posX = pos[0] * 2 + 22;
				tooltip_posY = pos[1] - $("#alarm_preferences_tooltip").outerHeight() + 25;
			}
			tooltip_posX = pos[0] * 2 + 30;
			tooltip_posY = pos[1] - $("#alarm_preferences_tooltip").outerHeight() + 20;
		}
		if(tooltip_posX === "center"){
			tooltip_posX = pos[0] - 5;			
			tooltip_posY = pos[1] - $("#alarm_preferences_tooltip").outerHeight() - 138;			
		}
		//마우스 커서가 위치한 태그의 중앙지점에 툴팁을 위치시킨다.
		$("#alarm_preferences_tooltip").css({
			"left": tooltip_posX,
			//// 콘텐츠의 높이에 따라 위치 조정
			"top": tooltip_posY,
		});		
	},
	
	"sales_analyze_draw" : function(){
		//영업 실적 분석
	    var sales_id = "reservation_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+sales_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);	
		var ans_li2 = "			"+ gap.lang.va275 + gap.lang.va276;
	//	ans_li2 += "			"+gap.lang.va10+"<br>";
	//	ans_li2 += "			ex) "+gap.lang.va11+"<br>";		
		ans_li2 += "			<div class='btn_wrap'>";			
		ans_li2 += "				<button type='button' class='btn_blue'><span>"+gap.lang.va277+"</span></button>";
		ans_li2 += "				<button type='button' class='btn_blue'><span>"+gap.lang.va278+"</span></button>";
		ans_li2 += "			</div>";
	   	ans_li2 = gptpt.special_change(ans_li2);
		var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);				
				gptpt.voice_end();
			}
		}
		var typed = new Typed("#dis_"+sales_id, options);
	},
	
	"salse_analyzer_send" : function(query){			
		var url = gptpt.plugin_domain_fast + "apps/sales_report_data_search";
		var data = JSON.stringify({
			"query" : query
		});		
		gap.ajaxCall(url, data, function(res){			
			var txt = res.result;			
		 	var postData = JSON.stringify({
				user : gap.userinfo.rinfo.nm,
				txt : txt,
				word : query,
				call_code : gptpt.current_code,
				lang : gap.curLang,
				roomkey : gptpt.cur_roomkey
			});			
			var cc = "normal_chat_" + new Date().getTime();				
			$("#" + cc).parent().remove();
			
			gptpt.save_person_log(query);
					
			//내부 자료에서 검색이 되지 않아 LLM에 질문한다.
			gptapps.ai_normal_response(cc);							
			var ssp = new SSE(gptpt.plugin_domain_fast + "apps/sales_report", {headers: {'Content-Type': 'application/json; charset=utf-8'},
		            payload:postData,
		           method: 'POST'});	    
		
			var accumulatedMarkdown = "";
			$("#" + cc).addClass("markdown-body");
			$("#" + cc).parent().css("white-space", "inherit");	
			
			var html = "<div id='dis_html_top_"+cc+"' style='height:200px'>";	
			html += " 	<div class='iframe_top_title' id='iframe_top_title_"+cc+"' style='display:none'>"+query+" " + gap.lang.va280 + "</div>";	
			html += "	<textarea id='dis_html_"+cc+"' border=0 frameborder=0 class='template_txtarea_dis' spellcheck='false' style='padding:0px 10px; width:100%; height:200px; overflow:hidden; border:0px' disabled'></textarea>";
			html += " 	<div id='report_loading_"+cc+"' class='report_loading' style='display:none'>";
			
			html += "	</div>";			
			html += "</div>";			
			$("#"+cc).append(html);
			
			
			$("#"+cc).append("<iframe id='myIframe_"+cc+"' src='' border=0 frameborder=0 style='width:100%;'></iframe>");
			
			var html2 = "<div class='btn_wrap' id='dis_html_btn_"+cc+"' style='display:none'>";
			html2 += "	<button type='button' id='btn_save_generate_result_"+cc+"' class='btn_save active' style='display: none;'>";
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
			
			ssp.addEventListener('error', function(e) {
				$("#btn_work_req").removeClass("stop");		
				ssp.close();	
			});
			
			var loading_bar = true;	
			var isEnd = false;
		   	ssp.addEventListener('message', function(e) {	
				//console.log(e.data);			
				var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n"); //.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");			
				if (e.data == "[DONE]"){				
					///// 답변이 끝나면 질문버튼 CSS 초기화
					$("#btn_work_req").removeClass("stop");	
					setTimeout(function(){
						$('#dis_html_btn_' + cc).show();						
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
					}, 1000);
						
					isEnd = true;	
				}else{						
					if (e.data != "" && loading_bar){				
						loading_bar = false;
						$("#" + cc + "_typed").remove();	
						$('#dis_html_' + cc).show();
						$('#report_loading_' + cc).show();
						$('#iframe_top_title_' + cc).show();
					}		
					
					if (isEnd == true){
						var pp = pph.replace(/'/g,'"');
						var json = $.parseJSON(pp);							
						var path = json.path;
						$('#report_loading_' + cc).hide();
						$('#iframe_top_title_' + cc).hide();
						$('#dis_html_' + cc).css("height", "0px");
						$('#dis_html_top_' + cc).css("height", "0px");
						$('#dis_html_' + cc).fadeOut();					
						$('#myIframe_' + cc).attr("src", "https://one.kmslab.com/mk/sales/"+ path);
						$('#myIframe_' + cc).show();							
						$('#myIframe_' + cc).on("load", function() {						
						  var iframe = this;
						  try {
						    var innerDoc = iframe.contentWindow.document;
						    var newHeight = innerDoc.body.scrollHeight || innerDoc.documentElement.scrollHeight;
						    newHeight = newHeight + 80;
						    $(iframe).height(newHeight + "px");
						    
						  } catch (e) {
						  }
						});					
						
						ssp.close();
	        			return;	
					}else{
						if (pph != ""){							
		                	var $ta = $('#dis_html_' + cc);
					        $ta.val($ta.val() + pph);
					        $ta.scrollTop($ta[0].scrollHeight);		                	
						}
					}	
				}		
			});
			ssp.stream();	
			gptpt.source.push(ssp);			
		});					
	 },
	 
	 "search_work_list" : function(){
		//개인별 진행 업무 검색
	    var work_id = "work_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+work_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);	
		var ans_li2 = gap.lang.va271;
		ans_li2 += gap.lang.va272;
		ans_li2 += "			<div class='btn_wrap'>";	
		ans_li2 += "				<button type='button' class='btn_blue'><span>"+gap.lang.va273+"</span></button>";
		ans_li2 += "				<button type='button' class='btn_blue'><span>"+gap.lang.va274+"</span></button>";
		ans_li2 += "			</div>";
	   	ans_li2 = gptpt.special_change(ans_li2);
		var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);				
				gptpt.voice_end();
			}
		}
		var typed = new Typed("#dis_"+work_id, options);
	},
	
	"search_work_list_prameter" : function(msg){
		//입력된 정보에 분석해서 파라메터 생성이 완료되면 결과를 요청한다.
		var postData = {
			user : gap.userinfo.rinfo.nm,
			word : msg,
			code : gptpt.current_code,
			roomkey : gptpt.cur_roomkey + "_search_work_list"
		};		
		
		gptpt.voice_end();
		$.ajax({
			crossDomain: true,
			type: "POST",
			url : gptpt.plugin_domain_fast + "apps/SearchEmailQuery",
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){			
				var jj = JSON.parse(res);					
				var search_users = "";
				var txt2 = jj.status["수집한정보"]["검색대상"];
				if (typeof(txt2) != "undefined"){
					search_users = txt2;
				}				
				var search_term = "";			
				var txt4 = jj.status["수집한정보"]["검색일자"];
				if (typeof(txt4) != "undefined"){
					search_term = txt4;
				}				
					
				var pre_msg = jj.speak;				
				if (search_users != "" && search_term != ""){
					//모든 정보가 세팅되어 실제 회의실을 에약하러 간다.								
					var st = search_term.split("~");
					var start = st[0].replaceAll("-",".");
					var end = "";
					if (st.length == 1){
						end = start
					}else{
						end = st[1].replaceAll("-",".")
					}				
					
					//동명이인 체크하고 넘어간다.
					var surl = gap.channelserver + "/api/user/search_user_multi.km";
					var nameParam = Array.isArray(search_users) 
				    ? search_users.join(',') 
				    : search_users;
					var postData = {
							"name" : nameParam,
							"companycode" : ""
						};			
					var _res = [];
					$.ajax({
						type : "POST",
						url : surl,
						dataType : "json",
						async : false,
						data : JSON.stringify(postData),
						success : function(res){							
							$(res).each(function(idx, val){
								//_res.push(val[0]);
								_res.push(val[0].ky);								
							});
							gptapps.report_work_users(search_term, _res);
						},
						error : function(e){
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					});				
					
				}else{
					// 몇가지 정보가 설정되지 않아 추가로 질문한다.						
					var html = "<div class='reservation_meeting_cls'>";
					html += "<span >" +  pre_msg + "</span>";		
					html += "</div>";					
					gptapps.ai_response_write(html);			
				}				
				gap.scroll_move_to_bottom_time_gpt(200);					
				gap.hide_loading();	
					
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});	
		
	},
	
	"report_work_users" : function(search_term, list){
		//특정 기간에 특정인의 업무내역을 응답한다.
		var url = gptpt.plugin_domain_fast + "apps/work_report_data_search";
		var data = JSON.stringify({
			"search_term" : search_term,
			"users" : list.join(","),
			"lang" : gap.curLang
		});	
		
		gap.ajaxCall(url, data, function(res){			
			var txt = res.result;			
			var cc = "normal_chat_" + new Date().getTime();				
			$("#" + cc).parent().remove();			
			var query = "대상자 별로 업무내역을 정리해주세요";
			var postData = JSON.stringify({
				user : gap.userinfo.rinfo.nm,
				txt : txt,
				word : query,
				call_code : "hr2_result",
				lang : gap.curLang
			});						
			//내부 자료에서 검색이 되지 않아 LLM에 질문한다.
			gptapps.ai_normal_response(cc);							
			var ssp = new SSE(gptpt.plugin_domain_fast + "apps/work_report", {headers: {'Content-Type': 'application/json; charset=utf-8'},
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
			var isEnd = false;
		   	ssp.addEventListener('message', function(e) {	
				//console.log(e.data);			
				var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n"); //.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");			
				if (e.data == "[DONE]"){				
					///// 답변이 끝나면 질문버튼 CSS 초기화
					$("#btn_work_req").removeClass("stop");					
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
					}			
				}		
			});
			ssp.stream();	
			gptpt.source.push(ssp);				
		});		
	},
	
	
	
	
	"multiagnet_options_draw" : function(msg){
		//멀티 에이전트에 옵션을 표시합니다.
	    var rservation_id = "multiagent_search_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+rservation_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);		
		var ans_li2 = "			"+gap.lang.va289+" ";
	    ans_li2 = gptpt.special_change(ans_li2);	    
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				//$("#search_work").focus();		
				gptpt.gpt_input_focus();		
				gptpt.voice_end();				
				//gptapps.draw_multiagnet_options_list(rservation_id);	
				
				
				/////////////////////////////////////////////////////////
				var item_list = [];
				var item = new Object();
				item.name = "Web Search";
				item.code = "websearch";
				item_list.push(item);
				var item = new Object();
				item.name = "Files";
				item.code = "files";
				item_list.push(item);
				
				var item = new Object();
				item.name = "Company Data";
				item.code = "companydata";
				item_list.push(item);
				
				
				var item = new Object();
				item.name = "My Data";
				item.code = "mydata";
				item_list.push(item);
				var item = new Object();
				item.name = "Ai Note";
				item.code = "ainote";
				item_list.push(item);
				
				////////////////////////////////////////////////////////
				
				gptapps.draw_multiagent_list(rservation_id, item_list, msg);		
			}
		}
		var typed = new Typed("#dis_"+rservation_id, options);
	},
	
	
	"draw_multiagent_list" : function(teams_id, list, msg){
		var item = list;
		var html = "";				
		html += "<div id='teams_channel_list_"+teams_id+"' class='teams_channel_list'>";
		html += "	<div class='teams_wrap'>";
		html += " 		<div class='teams_chips' role='group'>";		
		for (var i = 0; i < item.length; i++){
			var info = item[i];
			html += "<button class='teams_chip is-selected' data-name='"+info.name+"' data-code='"+info.code+"'>";  
			html += "	<span class='check_img'>"
			html += "	</span>";
			html += "	" + info.name;
			html += "</button>"
		}		
		html += "		</div>";
		html += "	</div>";
		html += "</div>";		
		html += "<div class='btn_wrap' id='dis_html_"+teams_id+"'  style='justify-content: flex-end;'>	";
		html += "	<button type='button' id='btn_summary_"+teams_id+"' class='btn_channel_summary active'>";
		html += "		<span class='btn_inner'>";
		html += "			<span class='btn_ico'></span>";
		html += "			<span class='btn_name'>"+gap.lang.va290+"</span>";
		html += "		</span>";
		html += "	</button>";
		html += "</div>";		
		$("#dis_" + teams_id).append(html);		
		
		$(".ai_answer_box .teams_channel_list .teams_chip").off().on("click", function(e){
			//리소스 선택 / 선택 취소하기
			if ($(this).attr("class").indexOf("is-selected") > -1){
				$(this).removeClass("is-selected");
			}else{
				$(this).addClass("is-selected");
			}
		});
		
		$(".ai_answer_box .btn_wrap .btn_channel_summary").off().on("click", function(e){
			//보고서 생성하기
			if ($(this).attr("class").indexOf("active") > -1){
				var id = $(this).attr("id").replace("btn_summary_", "");				
				var target_obj = $("#teams_channel_list_" + id);
				var list = $(target_obj).find(".teams_chip.is-selected");
				if (list.length == 0){
					mobiscroll.toast({message: gap.lang.va299 , color:'danger'});
					return false;
				}						
				$(this).removeClass("active");
				gptapps.draw_multiagent_report_draw(id, msg);
			}
			
		});
	},
	
	"draw_multiagent_report_draw" : function(id, msg){
		var rservation_id = "multiagent_search_" + new Date().getTime();
		var ans_li = "<div class='ai_answer_wrap'>";
		ans_li += "		<div><div class='ai_img'></div></div>";
		ans_li += "		<div class='ai_answer_box' id='dis_"+rservation_id+"'>";	
		ans_li += "		</div>";
		ans_li += "</div>";
		$("#"+gptapps.dis_id).append(ans_li);
		var ans_li2 = "			"+gap.lang.va291+" ";
	    ans_li2 = gptpt.special_change(ans_li2);	    
	    var options = {
			strings : [ans_li2],
			typeSpeed : 1,
			contentType: 'html',
			onComplete: function(){
				gap.scroll_move_to_bottom_time_gpt(200);	
				
				var html = "";
				// 탭용 버튼을 표시합니다.
				html += "<div class='multiagent_tap_wrap' id='multiagent_tap_wrap_"+id+"'>";
				html += "	<div class='multiagent_tap_wrap_top'>";
				html += "		<div class='multiagent_tap'>";
				html += "			<button class='multiagent_btn_report'>";
				html += "				<span class='btn_img'></span><span>"+gap.lang.va258+"</span>";
				html += "			</button>";
				html += "		</div>";
				html += "		<div class='multiagent_tap active'>";
				html += "			<button class='multiagent_btn_analyzer'>";
				html += "				<span class='btn_img'></span><span>"+gap.lang.va293+"</span>";
				html += "			</button>";
				html += "		</div>";
				html += "	</div>";
				
				html += "	<div id='multiagent_sub_body_"+rservation_id+"'>";
				html += "	</div>";
				
				html += "</div>";				
				$("#"+gptapps.dis_id).append(html);	
				
				$(".multiagent_tap .multiagent_btn_report").off().on("click", function(e){
					var parent = $(e.currentTarget).parent();
					
					if ($(parent).attr("class").indexOf("active") > -1){						
					}else{						
						if (gptapps.check_multiagent_complete(id)){
							$(".multiagent_tap .multiagent_btn_analyzer").parent().removeClass("active");
							$(parent).addClass("active");							
							$("#multiagent_div_title_" + id).html("최종 보고서");
							$("#channel_body_final_report_" + id).show();
							$("#channel_body_processing_" + id).hide();
						}else{
							mobiscroll.toast({message: gap.lang.va298, color:'danger'});
							return false;
						}						
					}
				});
				
				$(".multiagent_tap .multiagent_btn_analyzer").off().on("click", function(e){
					var parent = $(e.currentTarget).parent();
					$(".multiagent_tap .multiagent_btn_report").parent().removeClass("active");
					if ($(parent).attr("class").indexOf("active") > -1){						
					}else{
						$(parent).addClass("active");
						$("#channel_body_final_report_" + id).hide();
						$("#channel_body_processing_" + id).show();										
						var target_obj = $("#teams_channel_list_" + id);
						var list = $(target_obj).find(".teams_chip.is-selected");
						$("#multiagent_div_title_" + id).html(gap.lang.va292.replace("$1", list.length));
					}
				});				
				gptapps.draw_sub_multiagent_summary_dis(rservation_id, id, msg);			
			}
		}
		var typed = new Typed("#dis_"+rservation_id, options);		
	},
	
	"check_multiagent_complete" : function(id){
		var totalcount = $("#channel_body_processing_"+id).find(".multiagent_body_sub_content_left").length;
		var completecount = $("#channel_body_processing_"+id).find(".left.complete").length;		
		if (totalcount == completecount){
			return true;
		}else{
			return false;
		}
	},
	
	"check_multiagent_complete2" : function(id){
		var totalcount = $("#channel_body_"+id).find(".multiagent_body_sub_content_left").length;
		var completecount = $("#channel_body_"+id).find(".left.complete").length;		
		if (totalcount == completecount){
			return true;
		}else{
			return false;
		}
	},
	
	"draw_sub_multiagent_summary_dis" : function(id, target_id, msg){

		var target_obj = $("#teams_channel_list_" + target_id);
		var list = $(target_obj).find(".teams_chip.is-selected");			
		var html = "";
		html += "<div class='ans_ul'>";
		html += "	<div class='mail-container' id='channel_"+id+"'>";
		html += "		<div class='mail-header'>";
		html += "			<div class='mail-title'>"
		html += "				<div class='mail-title-text'><h2 id='multiagent_div_title_"+target_id+"'>" + gap.lang.va292.replace("$1", list.length) + "</h2></div>";
		html += "			</div>";
		html += "			<div class='mail-actions' data-key='"+id+"'>";
		html += "				<div class='button icon_eamil_expand' data-action='expand'></div>"
		html += "			</div>"
		html += "		</div>";
		html += "		<div class='mail-body' id='channel_body_"+id+"' style='min-height:150px'>";			
		html += "		<div id='channel_body_final_report_"+target_id+"' class='multiagent_body_final_report' style='display:none'>";
		html += "			<div id='multiagent_final_report_dis_"+id+"'></div>";
		html += "		</div>";		
		html += "		<div id='channel_body_processing_"+target_id+"' class='multiagent_body_sub_content'>";
		html += "			<div class='multiagent_body_menu' id='multiagent_menu_"+id+"'>";		
		html += "			</div>";		
		html += "			<div class='right' id='multiagent_menu_content_"+id+"'>";
		html += "			</div>";
		html += "		</div>";	
		html += "		</div>";
		html += "	</div>";
		html += "</div>";		
		$("#multiagent_sub_body_"+id).append(html);				
		
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];
			var name = $(item).data("name");
			var code = $(item).data("code");			
			var html = "";
			if (i == 0){
				html += "<div id='multiagent_body_sub_content_"+target_id+"' class='multiagent_body_sub_content_left active'  data-code='"+code+"' data-id='"+id+"'>";
			}else{
				html += "<div id='multiagent_body_sub_content_"+target_id+"' class='multiagent_body_sub_content_left'  data-code='"+code+"' data-id='"+id+"'>";
			}			
			html += "	<div class='left'>";
			html += "		<div class='multiagent_menu'>";
			html += "			<div class='multiagent_menu1'>";
			html += "				<span class='loading_img' style='margin:0px;'></span>";
			html += "				<span class='status_txt'>"+gap.lang.va296+"</span>";
			html += "			</div>";
			html += "			<div class='multiagent_menu2'><span class='btn_"+code+"_img'></span></div>";
			html += "			<div class='multiagent_menu3'>"+name+"</div>";
			html += "		</div>";
			html += "	</div>";
			if (i == 0){
				html += "	<div class='left_dash active'></div>";
				html += "	<div class='dot active'></div>";
			}else{
				html += "	<div class='left_dash'></div>";
				html += "	<div class='dot'></div>";
			}
			html += "</div>";				
			$("#multiagent_menu_" + id).append(html);
			
			var html = "";
			html += "<div class='multiagent_sub_wrap_summary' id='menu_dis_summary_websearch_"+id+"' style='display:none'>";
			html += "</div>";
			html += "<div class='multiagent_sub_wrap' id='menu_dis_"+code+"_"+id+"' style='display:"+(i == 0 ? "block" : "none")+"'>";
			
			html += "		<div class='menu_dis_content_result_wrap' style='display:none'>"; //개별 검색 결과 표시
			html += "			<div id='menu_dis_content_result_"+code+"_"+id+"'>";			
			html += "			<div class='processing_dis'>";
			html += "				<div class='item'>";
			html += "					<div><img src='/resource/images/Template/main3.gif' style='width:60px'></div>";
			html += "				</div>";
			html += "				<div class='item'>";
			html += "					<div>"+gap.lang.va250+"</div>";
			html += "				</div>";
			html += "			</div>";			
			html += "			</div>";
			html += "		</div>";			
			html += "	<div>";
			html += "		<div class='multiagent_sub_title'>";
			html += "			<span class='btn_"+code+"_img'></span><span>"+name+"</span>";
			html += "		</div>";
			html += "	</div>";
			html += "	<div id='multiagent_sub_body_"+id+"' class='multiagent_sub_body'>";
			html += "		<div>";  //개별 검색 항목 표시
			html += "			<div id='menu_dis_content_list_"+code+"_"+id+"'>";			
			//skeleton 호면 표시, 데이터가 나오면 제거한다.
			html += "				<div class='skeleton_loadingxxx' style='height: 55px;width: 98%;'>";
			html += "					<div style='display:flex; gap: 8px; flex-direction: column'>";
			html += "						<div class='skeleton_loading' style='width:100%; height:20px; position:relative'>";
			html += "							<div class='skeleton_txt'></div>";
			html += "						</div>";
			html += "						<div class='skeleton_loading' style='width:50%; height:20px; position:relative'>";
			html += "							<div class='skeleton_txt'></div>";
			html += "						</div>";
			html += "						<div class='skeleton_loading' style='width:70%; height:20px; position:relative'>";
			html += "							<div class='skeleton_txt'></div>";
			html += "						</div>";		
			html += "					</div>";
			html += "				</div>";				
			html += "			</div>";
			html += "		</div>";
			html += "	</div>";
			html += "</div>";						
			
			$("#multiagent_menu_content_" + id).append(html);			
		}
		
		$(".multiagent_body_sub_content_left").off().on("click", function(e){			
			var code = $(this).data("code");
			var id = $(this).data("id");							
			//기존에 선택된 전체 active 제거하기
			$("#multiagent_menu_" + id + " " + ".multiagent_body_sub_content_left").removeClass("active");
			$("#multiagent_menu_" + id + " " + ".left_dash").removeClass("active");
			$("#multiagent_menu_" + id + " " + ".dot").removeClass("active");			
			//현재 클릭한 영역을 active로 전환하기
			$(this).addClass("active");
			$(this).find(".left_dash").addClass("active");
			$(this).find(".dot").addClass("active");			
			//우측 컨텍츠 영역을 제거하고 클릭한 항목을 표시하기
			$("#multiagent_menu_content_" + id + " " + ".multiagent_sub_wrap").css("display","none");
			$("#menu_dis_"+code+"_"+id).show();
		});	

		$(".mail-actions .icon_eamil_expand").off().on("click", function(e){
			var cls = $(e.currentTarget).attr("class");
			if (cls.indexOf("pand on") > -1){
				$(e.currentTarget).removeClass("on");
				$(e.currentTarget).parent().parent().next().fadeIn();		
				$(e.currentTarget).parent().parent().removeClass("on");		
			}else{
				$(e.currentTarget).addClass("on");
				$(e.currentTarget).parent().parent().next().fadeOut();				
				$(e.currentTarget).parent().parent().addClass("on");
			}
		});		
		gptapps.multiagent_search_start(id, target_id, msg, list);
	},
	
	"multiagent_search_start" : function(id, target_id, msg, list){
		gptapps.multiagent_search_intent(id, target_id, msg, list);		
	},	

	"multiagent_search_intent" : function(id, target_id, msg, list){
		//질의문에 대한 주요 검토 내역을 정리하고 에이전트에게 업무를 전달한다.
		var postData = JSON.stringify({
			"msg" : msg,
			"id" : id,
			"lang" : gap.curLang,
			"code" : "multiagent"
		});				
		var url = gptpt.plugin_domain_fast + "apps/multiagent_search_intent";
		$.ajax({
			type : "POST",
			url : url,
			data : postData,
			dataType : "json",
			success : function(res){		
				if (res.result == "OK"){					
					//분석 의도를 먼저 표시한다.
					var mx = res.res.join(", ");
					var html2 = "";
					html2 += "<div class='multiagent_summary_content'>";
					html2 += "	<div class='multiagent_summary_content_wrap'>";
					html2 += "		<div class='multiagent_summary_content_title'><span class='ico_title'></span><span>"+gap.lang.va302+"</span></div>";
					html2 += "		<div class='multiagent_summary_content_body'>"+mx+"</div>";
					html2 += "	</div>";
					html2 += "</div>";			
					
					$("#menu_dis_summary_websearch_" + id).html(html2).fadeIn(2000);
					
					var plist = [];
					for (var i = 0 ; i < list.length; i++){
						var item = list[i];
						var name = $(item).data("name");
						var code = $(item).data("code");
						plist.push(code);
						
					//	gptapps["multiagent_search_"+code](name, code, id, msg);
						gptapps["multiagent_search"](name, code, id, msg, target_id);						
						$("#menu_dis_content_result_"+code+"_" + id).parent().fadeIn(2000);
					}
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});	
	},
	
	"multiagent_search" : function(name, code, id, msg, target_id){
		//웹검색, files, company data, my data, ai note 검색을 통합관리한다.
		console.log(name + "/" + code + "/" + id);				
		var readers = []
		var uinfo = gap.userinfo.rinfo;
		readers.push(uinfo.emp);
		readers.push("all")
		for (var i = 0 ; i < uinfo.adc.split("^").length; i++){
			readers.push(uinfo.adc.split("^")[i])
		}		
		var postData = JSON.stringify({
			"msg" : msg,
			"id" : id,
			"lang" : gap.curLang,
			"code" : code,
			"readers" : readers,
			"ky" : gap.userinfo.rinfo.ky
		});				
		var url = gptpt.plugin_domain_fast + "apps/multiagent_search";
		$.ajax({
			type : "POST",
			url : url,
			data : postData,
			dataType : "json",
			success : function(res){		
				if (res.result == "OK"){					
					$("#menu_dis_content_list_"+code+"_"+id).empty();
					if (code == "websearch"){
						var list = res.res.urls;
						for (var i = 0 ; i < list.length; i++){
							var item = list[i];
							var html = "";
							html += "<div class='multiagent_websearch_wrap' data-url='"+item.url+"'>";
							html += "	<div class='multiagent_websearch_wrap_sub'>";
							html += "		<span class='multiagent_websearch_title'>"+item.title+"</span>";
							html += "		<span class='multiagent_websearch_date'>"+item.date+"</span>";
							html += "	</div>";
							html += "	<div class='multiagent_websearch_sub_body'>"+item.snippet+"</div>";
							html += "</div>";		
							
							$("#menu_dis_content_list_"+code+"_"+id).append(html);
						}				
						$("#multiagent_menu_" + id + " div[data-code='"+code+"']").find(".status_txt").html(gap.lang.va297);
						//목록을 클릭하면 해당 사이트로 이동한다.
						$("#menu_dis_content_list_"+code+"_" + id + " .multiagent_websearch_wrap").off().on("click", function(e){
							var url = $(e.currentTarget).data("url");
							window.open(url, null);
						});				
					}else if (code == "companydata" || code == "mydata"){
						var list = res.res.urls;
						for (var i = 0 ; i < list.length; i++){
							var item = list[i];
 							var html = "";
							html += "<div class='multiagent_websearch_wrap' data-url='"+item.key+"' data-path='"+item.path+"'>";
							html += "	<div class='multiagent_websearch_wrap_sub'>";
							html += "		<span class='multiagent_websearch_title'>"+item.filename+"</span>";
						//	html += "		<span class='multiagent_websearch_date'>"+item.date+"</span>";
							html += "	</div>";
							html += "	<div class='multiagent_websearch_sub_body'>"+item.snippet+"</div>";
							html += "</div>";		
							
							$("#menu_dis_content_list_"+code+"_"+id).append(html);
						}				
						$("#multiagent_menu_" + id + " div[data-code='"+code+"']").find(".status_txt").html(gap.lang.va297);
					}else if (code == "files"){
						var list = res.res.urls;
						for (var i = 0 ; i < list.length; i++){
							var item = list[i];
 							var html = "";
							html += "<div class='multiagent_websearch_wrap' data-url='"+item.key+"' data-path='"+item.path+"'>";
							html += "	<div class='multiagent_websearch_wrap_sub'>";
							html += "		<span class='multiagent_websearch_title'>"+item.filename+"</span>";
						//	html += "		<span class='multiagent_websearch_date'>"+item.date+"</span>";
							html += "	</div>";
							html += "	<div class='multiagent_websearch_sub_body'>"+item.snippet+"</div>";
							html += "</div>";		
							
							$("#menu_dis_content_list_"+code+"_"+id).append(html);
						}				
						$("#multiagent_menu_" + id + " div[data-code='"+code+"']").find(".status_txt").html(gap.lang.va297);
					}else if (code == "ainote"){
						var list = res.res.urls;
						for (var i = 0 ; i < list.length; i++){
							var item = list[i];
 							var html = "";
							html += "<div class='multiagent_websearch_wrap' data-url='"+item.key+"' data-path='"+item.path+"'>";
							html += "	<div class='multiagent_websearch_wrap_sub'>";
							html += "		<span class='multiagent_websearch_title'>"+item.filename+"</span>";
						//	html += "		<span class='multiagent_websearch_date'>"+item.date+"</span>";
							html += "	</div>";
							html += "	<div class='multiagent_websearch_sub_body'>"+item.snippet+"</div>";
							html += "</div>";		
							
							$("#menu_dis_content_list_"+code+"_"+id).append(html);
						}				
						$("#multiagent_menu_" + id + " div[data-code='"+code+"']").find(".status_txt").html(gap.lang.va297);
					}
					
					
					//web검색 결과를 활용해서 요청에 대한 응답 보고서를 작성한다.
					gptapps.multiagent_search_report(id, msg, code, target_id);
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});			
	},	
	
	
	
	"multiagent_search_report" : function(id, msg, code, target_id){
		//웹 굼색에게 가져온 내용을 바탕으로 질의 내용과 주요 검토 사항을 확인해서 요약 정리한다.		
		var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : msg,
			id : id,
			call_code : "multiagent_sub_report",
			roomkey : gptpt.cur_roomkey,
			lang : gap.curLang,
			ky : gap.userinfo.rinfo.ky,
			code : code
		});				
		//gptpt.save_person_log(msg);

		var cc = "menu_dis_content_result_"+code+"_" + id;				
		var accumulatedMarkdown = "";
		$("#" + cc).addClass("markdown-body");
		$("#" + cc).parent().css("white-space", "inherit");			
		
		var ssp = new SSE(gptpt.plugin_domain_fast + "apps/multiagent_sub_report", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	            method: 'POST'});	            
	    ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");	
			ssp.close();		
		});		
		ssp.addEventListener('open', function(e) {
		});		
	    var isREF = false;
	   	ssp.addEventListener('message', function(e) {	
			//console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n"); 		
			if (e.data == "[DONE]"){				
				///// 답변이 끝나면 질문버튼 CSS 초기화
				$("#btn_work_req").removeClass("stop");		
	
				$("#multiagent_menu_" + id + " div[data-code='"+code+"']").find(".status_txt").html(gap.lang.va300);
				$("#multiagent_menu_" + id + " div[data-code='"+code+"']").find(".loading_img").addClass("check");				
				$("#multiagent_menu_" + id + " div[data-code='"+code+"']").find(".left").addClass("complete");

				if (gptapps.check_multiagent_complete2(id)){					
					//전체 완료되면 최종 보고서를 작성하도록 자동 설정한다.
					$("#multiagent_tap_wrap_"+target_id).find(".multiagent_btn_report").click();
					gptapps.multiagent_final_report_start(id, msg, target_id);
				}
				ssp.close();
        		return;						
			}else{						
				if (pph != ""){
					accumulatedMarkdown += pph;
                	const html = marked.parse(accumulatedMarkdown);
                	$("#"+cc).html(html);
				}		           					
			}		
		});
		ssp.stream();
		gptpt.source.push(ssp);	
	},
	
	"multiagent_final_report_start" : function(id, msg, target_id){

		var cc = "channel_body_final_report_" + target_id;
		var accumulatedMarkdown = "";
		$("#" + cc).addClass("markdown-body");
		$("#" + cc).parent().css("white-space", "inherit");		
		
		var postData = JSON.stringify({
			user : gap.userinfo.rinfo.nm,
			word : msg,
			id : id + "_" + gap.userinfo.rinfo.ky,
			call_code : "multiagent_final_report",
			roomkey : gptpt.cur_roomkey,
			lang : gap.curLang,
			ky : gap.userinfo.rinfo.ky,
			code : "multiagent_final_report"
		});	
		
		var ssp = new SSE(gptpt.plugin_domain_fast + "apps/multiagent_final_report", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	            method: 'POST'});	            
	    ssp.addEventListener('error', function(e) {
			$("#btn_work_req").removeClass("stop");	
			ssp.close();		
		});		
		ssp.addEventListener('open', function(e) {
		});		
	    var isREF = false;
	   	ssp.addEventListener('message', function(e) {	
			//console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n"); 		
			if (e.data == "[DONE]"){				
				///// 답변이 끝나면 질문버튼 CSS 초기화
				$("#btn_work_req").removeClass("stop");	
				
				
				var html = "";
				html += "		<div class='ai_report_box'  >";	
				html += "			<div class='gpt_btn_wrap'>";
				html += "				<button type='button' class='make_ai_graph_btn' data-id='"+cc+"'>";
				html += "					<span class='btn_inner'><span class='btn_ico'></span><span>"+gap.lang.va303+"</span></span>";
				html += "				</button>";
				
				html += "				<button type='button' class='make_ai_mindmap_btn' data-id='"+cc+"'>";
				html += "					<span class='btn_inner'><span class='btn_ico'></span><span>"+gap.lang.va304+"</span></span>";
				html += "				</button>";
				
				html += "				<button type='button' class='make_ai_report_btn' data-id='"+cc+"'>";
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
					url = "/v/make/"+id;		
					gap.open_subwin(url, "1600", "950", "yes" , "", "yes");
				});
				
				 $(".ai_report_box .make_ai_mindmap_btn").off().on("click", function(e){
				 	
					//리서치 완료된 내용을 마인드 맵 창을 띄운다.
					var id = $(e.currentTarget).data("id") + "_" + gap.userinfo.rinfo.ky;		
					gptpt.open_layer("mindmap", id);
				});
		
				
				
	
				ssp.close();
        		return;						
			}else{						
				if (pph != ""){
					accumulatedMarkdown += pph;
                	const html = marked.parse(accumulatedMarkdown);
                	$("#"+cc).html(html);
				}		           					
			}		
		});
		ssp.stream();
		gptpt.source.push(ssp);	
	}
	
}