/**
 * KGPT-Portal 설계관련 함수 
   통합검색 관련 소스
 */

 function kgptsearch(){
 }
 
 kgptsearch.prototype ={
	 "init" : function(){		
	 	
	 },
	 
	 "search_result_draw" : function(query, checked, opt){
	 	//채팅창에서 검색한 경우 아래 내용을 제거해야 한다.
	 	$("#right_menu").hide();
	 	/////////////////////////////////////////////////
	 	gap.cur_window = "portal_search";
	 	gps.cur_query = query;
	 	gma.refreshPos();	 
	 	$("#search_res_box").remove();					
		$("#ps_left_sub_search_area_inner_search_input").val("");
	 	
	 	if (opt == "first"){
	 		//최초 검색화면 표시할때만 처리한다.	 		
	 		$("#search_layer").hide(); // 통합검색 레이어 숨김
			$("#input_search").val(""); // 검색어 입력창 비우기	 		
		 	var html = "";
		 	html += "<div id='ps_search_area'>";
		 	html += "	<div id='ps_left' class='ps_left'>";
		 	html +=			gps.draw_psearch_left();
		 	html += "	</div>";
		 	html += "	<div id='ps_right' class='ps_right'>";
			html +=			gps.draw_psearch_right();
		 	html += "	</div>";
		 	html += "</div>";		 	
			$("#btn_all_menu_open").show();
			$("#main_logo").show();			
			$("#area_left").find("button").removeClass("active");			
			$("#area_content").empty();
			$("#area_content").append(html);
	 	}			
		var cc = "portal_search_" + new Date().getTime();
		///검색내용을 출력한다.
		var search_result = gps.portal_search_process(query, cc, checked);
		$("#ps_left_sub_content_content").append(search_result);		
		//실제 검색을 진행한다.
		gps.portal_search_func(query, cc, checked);		
		gps.__ps_evnet();
	 },
	 
	 "portal_search_process" : function(query, cc, checked){
	 	var html = "";
	 	html += "<div class='portal_search_result_wrap' id='ps_search_"+cc+"'>";
	 	
	 	//검색 제목 영역
	 	html += "	<div class='portal_search_result_wrap_top'>";
	 	html += "		<div class='portal_search_result_wrap_left'>";
	 	html += "			<div class='portal_search_result_wrap_left_icon'></div>";
	 	html += "			<div class='portal_search_result_wrap_left_title'>"+query+"</div>";
	 	html += "		</div>";
	 	html += "		<div class='portal_search_result_wrap_right'></div>";
	 	html += "	</div>";
	 	
	 	//검색어 추출 영역
	 	html += "<div class='portal_search_body'>";
	 	html += "	<div class='portal_search_body_loading'>";
	 	html += "		<div class='portal_search_body_loading_img'></div><div class='portal_search_body_loading_title'>요청한 검색내용을 분석하고 있습니다.</div>";
	 	html += "	</div>";
	 	html += "	<div id='portal_search_result_header' class='portal_search_result_header' style='display:none'>";	 	
	 	html += "		<div class='portal_search_result_header_btn'>";
	 	html += "			<div class='portal_search_result_header_btn_item' data-code='mail'>"
	 	html += "				<div class='portal_search_result_header_btn_email'></div>";
	 	html += "				<div class='portal_search_result_header_btn_title'>메일</div>";
	 	html += "			</div>";
	 	html += "			<div class='portal_search_result_header_btn_item' data-code='doc_center'>"
	 	html += "				<div class='portal_search_result_header_btn_files' ></div>";
	 	html += "				<div class='portal_search_result_header_btn_title'>문서 중앙화</div>";
	 	html += "			</div>";
	 	html += "			<div class='portal_search_result_header_btn_item' data-code='approval'>"
	 	html += "				<div class='portal_search_result_header_btn_approval' ></div>";
	 	html += "				<div class='portal_search_result_header_btn_title'>결재</div>";
	 	html += "			</div>";
	 	html += "			<div class='portal_search_result_header_btn_item' data-code='bulletin'>"
	 	html += "				<div class='portal_search_result_header_btn_bbs' ></div>";
	 	html += "				<div class='portal_search_result_header_btn_title'>게시판</div>";
	 	html += "			</div>";
	 	html += "			<div class='portal_search_result_header_btn_item' data-code='internet'>"
	 	html += "				<div class='portal_search_result_header_btn_internet' ></div>";
	 	html += "				<div class='portal_search_result_header_btn_title'>웹(인터넷)</div>";
	 	html += "			</div>";
	 	html += "		</div>";	 	
	 	
	 	html += "		<div class='portal_search_result_header_reason'>";
	 	html += "			<div class='portal_search_result_header_reason_title'>검색 범위 선정 이유</div>";
	 	html += "			<div class='portal_search_result_header_reason_content'></div>";
	 	html += "		</div>";
	 	html += "		<div class='portal_search_result_header_word'>";
	 	html += "			<div class='portal_search_result_header_reason_title'>최적의 검색어</div>";
	 	html += "			<div class='portal_search_result_header_word_content'>";
	 	html += "			</div>";
	 	html += "		</div>";
	 	html += "	</div>";
	 	
	 	//검색어 내용 표시 영역 / 검색 내용, 설명 버튼, 곤련 담당자, 관련 질문 
	 	html += "	<div class='portal_search_result_content' >";
	 	html += "		<div id='ai_search_result_"+cc+"' class='ai_search_result' style='display:none'>";
		html += "		</div>"
	 	
	 	html += "		<div class='portal_search_result_content_btns' style='display:none'>";
	 	html += "			<div class='item ps_share' title='공유'></div>";
	 	html += "			<div class='item ps_copy' title='복사'></div>";
	 	html += "			<div class='item ps_research' title='재검색' data-code='"+cc+"'></div>";
	 	html += "		</div>"; 	
	 	html += "	</div>";
	 	
	 	//재검색을 위한 영역
	 	html += "	<div class='portal_search_result_research_wrap' id='portal_research_"+cc+"'>";
	 	html += "		<div class='portal_search_result_research_head'>";
	 	html += "			<div class='portal_search_result_research_head_title'>검색 범위</div><div class='portal_search_result_research_head_close'></div>";
	 	html += "		</div>";
	 	html += "		<div class='portal_search_result_header_btn_wrap'>";
	 	html += "			<div class='portal_search_result_header_btn'>";
	 	html += "				<div class='portal_search_result_header_btn_item research' data-code='mail'>"
	 	html += "					<div class='portal_search_result_header_btn_email'></div>";
	 	html += "					<div class='portal_search_result_header_btn_title'>메일</div>";
	 	html += "				</div>";
	 	html += "				<div class='portal_search_result_header_btn_item research' data-code='doc_center'>"
	 	html += "					<div class='portal_search_result_header_btn_files' ></div>";
	 	html += "					<div class='portal_search_result_header_btn_title'>문서 중앙화</div>";
	 	html += "				</div>";
	 	html += "				<div class='portal_search_result_header_btn_item research' data-code='approval'>"
	 	html += "					<div class='portal_search_result_header_btn_approval' ></div>";
	 	html += "					<div class='portal_search_result_header_btn_title'>결재</div>";
	 	html += "				</div>";
	 	html += "				<div class='portal_search_result_header_btn_item research' data-code='bulletin'>"
	 	html += "					<div class='portal_search_result_header_btn_bbs' ></div>";
	 	html += "					<div class='portal_search_result_header_btn_title'>게시판</div>";
	 	html += "				</div>";
	 	html += "				<div class='portal_search_result_header_btn_item research' data-code='internet'>"
	 	html += "					<div class='portal_search_result_header_btn_internet' ></div>";
	 	html += "					<div class='portal_search_result_header_btn_title'>웹(인터넷)</div>";
	 	html += "				</div>";
	 	html += "			</div>";
	 	html += "			<div class='portal_search_result_research_btn_icon_sepa'></div>";
	 	html += "			<div class='portal_search_result_research_btn' data-query='"+query+"' data-code='"+cc+"'>";
	 	html += "				<div class='portal_search_result_research_btn_icon'></div>";
	 	html += "				<div class='portal_search_result_research_btn_title' >재검색</div>";
	 	html += "			</div>";
	 	html += "		</div>";
	 	html += "		<div class='portal_search_result_research_info'>";
	 	html += "			<div class='portal_search_result_research_info_icon'></div><div>검색 범위를 변경 후 재검색 버튼을 누르면 검색 결과를 새로 생성할 수 있습니다. </div>";
	 	html += "		</div>";	 	
	 	html += "	</div>";	
	 	
	 	//관련 담당자 영역
	 	html += "	<div class='portal_search_result_person_wrap' style='display:none'>";
	 	html += "		<div class='person_wrap_title'>관련 담당자</div>";
	 	html += "		<div class='portal_search_result_person'>";
	 	html += "		</div>";
	 	html += "	</div>";
	 	
	 	//관련 질문 영역
	 	html += "	<div class='portal_search_result_rel' style='display:none'>";
	 	html += "		<div class='person_wrap_title'>관련 질문 영역</div>";
	 	html += "		<div class='portal_search_result_rel_lists'>";
	  	html += "		</div>";
	 	html += "	</div>";
	 	
	 	html += "</div>";
	 	html += "</div>";
	 	return html;
	 },
	 
	 "draw_psearch_right" : function(){
	 	var html = "";
	 	html += "<div id='ps_right_sub'>";
	 	html +=  "	<div id='ps_right_sub_top' class='ps_right_sub_top'>";
	 	html += "		<div id = 'ps_right_sub_top_slider' class='ps_right_sub_top_slider'><div class='ps_right_sub_top_slider_btn'></div><div class='ps_right_sub_top_slider_title'>AI Assistant</div></div>";
	 	html += "		<div id = 'ps_right_sub_top_close' class='ps_right_sub_top_close'></div>";
	 	html += "	</div>";
	 	html +=  "	<div id='ps_right_sub_center' class='ps_right_sub_center'>";
	 	html += "		<div id='ps_right_sub_center_area' class='ps_right_sub_center_area'>";
	 	html += "			<div class='ps_right_sub_center_area_title'><span>"+gap.userinfo.rinfo.nm+"</span>님의 업무를<br>스마트하게 도와드립니다.</div>";
	 	html += "			<div class='ps_right_sub_center_area_item_wrap'>";
	 	html += "				<div class='ps_right_sub_center_area_item_column'>";
	 	html += "					<div class='ps_right_sub_center_area_item'><div class='btn_item1'></div><div class='btn_item_title'>브리핑보기</div></div>";
	 	html += "					<div class='ps_right_sub_center_area_item'><div class='btn_item2'></div><div class='btn_item_title'>미확인 메일 요약</div></div>";
	 	html += "					<div class='ps_right_sub_center_area_item'><div class='btn_item3'></div><div class='btn_item_title'>이번주 일정 확인</div></div>";
	 	html += "				</div>";
	 	html += "				<div class='ps_right_sub_center_area_item_column'>";
	 	html += "					<div class='ps_right_sub_center_area_item'><div class='btn_item4'></div><div class='btn_item_title'>연차 휴가 등록</div></div>";
	 	html += "					<div class='ps_right_sub_center_area_item'><div class='btn_item5'></div><div class='btn_item_title'>회의실 예약</div></div>";
	 	html += "					<div class='ps_right_sub_center_area_item'><div class='btn_item6'></div><div class='btn_item_title'>회의록 작성</div></div>";
	 	html += "				</div>";
	 	html += "			</div>";
	 	html += "		</div>";
	 	html += "	</div>";
	 	html +=  "	<div id='ps_right_sub_bottom' class='ps_right_sub_bottom'>";
	 	html += "		<div class='ps_right_sub_bottom_inner'>";
	 	html += "			<div class='ps_right_sub_bottom_inner_left'>";
	 	html += "				<div class='ps_right_sub_bottom_inner_left_icon'></div>";
	 	html += "				<div style='width:100%; display:flex;align-items:center'><textarea id='ps_right_sub_bottom_inner_left_textarea' class='ps_right_sub_bottom_inner_left_textarea' placeholder='"+gap.lang.req_msg+"'></textarea>  </div>";
	 	html += "			</div>";
	 	html += "			<div class='ps_right_sub_bottom_inner_right'>";
	 	html += "				<div class='ps_right_sub_bottom_inner_right_mic'></div>";
	 	html += "				<div class='ps_right_sub_bottom_inner_right_send'></div>";
	 	html += "			</div>";
	 	html += "		</div>";
	 	html += "	</div>";
	 	html += "</div>";
	 	
	 	return html;
	 },
	 
	 "draw_psearch_left" : function(){
	 	var html = "";
	 	html += "<div id='ps_left_sub' class='ps_left_sub'>";
	 	html += "	<div id='ps_left_sub_top' class='ps_left_sub_top'>";
	 	html += "		<div id='ps_left_sub_search_area' class='ps_left_sub_search_area'>";
	 	html += "			<div id='ps_left_sub_search_area_inner' class='inner'>";
	 	html += "				<div class='ps_left_sub_search_area_inner_left'>";
	 	html += "					<div class='ps_left_sub_search_area_inner_search_ico'></div>";
	 	html += "					<div style='width:100%'><input type='text' id='ps_left_sub_search_area_inner_search_input' class='ps_left_sub_search_area_inner_search_input' placeholder='검색어를 입력해주세요' autocomplete='off'></div>";
	 	html += "				</div>";
	 	html += "				<div class='ps_left_sub_search_area_inner_right'>";
	 	html += "					<div class='ps_left_sub_search_area_inner_mic'></div>";
	 	html += "				</div>";
	 	html += "			</div>";
	 	html += "		</div>";
	 	html += "	</div>";
	 	html += "	<div id='ps_left_sub_content' class='ps_left_sub_content'>";
	 	html += "		<div class='ps_left_sub_content_tab'>";
	 	html += "			<div class='ps_left_sub_content_tab_item selected' data-mode='ai'>AI 모드</div>";
	 	html += "			<div class='ps_left_sub_content_tab_item' data-mode='normal'>일반 모드</div>";
	 	html += "		</div>";
	 	html += "		<div id='ps_left_sub_content_content' class='ps_left_sub_content_content'>";
	 	html += "		</div>";
	 	html += "		<div id='ps_left_sub_content_content_noraml' class='ps_left_sub_content_content_normal' style='display:none'>";
	 	html += "		</div>";
	 	html += "	</div>";
	 	html += "</div>";
	 	
	 	return html;
	 },
	 
	 "portal_search_func" : function(query, cc, checked){
	
		$("#ai_search_result_"+cc).empty();
	
		//통합 검색 호출 소스
				
		var htm = "<div id='pre_"+cc+"'></div>";
		htm += "<div id='"+cc+"'></div>";
		$("#ai_search_result_"+ cc).append(htm);
		
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
			code : "portal_search",
			checked : checked,
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
			console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", " ").replaceAll("#@creturn#@","\n"); //.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");			
			//console.log(pph);
			
			var isREF = false;
			if (e.data == "[DONE]"){				
				///// 답변이 끝나면 질문버튼 CSS 초기화			
				//gap.scroll_move_to_bottom_time_gpt(200);	
				
				//결과 관련 버튼 영역을 표시한다.
				$("#ps_search_" + cc +" .portal_search_result_content_btns").show();
								
				//관련 담당자 영역을 표시한다.
				var ppx = $("#ps_search_" + cc +" .portal_search_result_person").html();
				if (ppx != ""){
					$("#ps_search_" + cc +" .portal_search_result_person_wrap").show();
				}						
				
				//관련 질의 영역을 표시한다.
        		$("#ps_search_" + cc +" .portal_search_result_rel").show();	
        		
        			
				ssp.close();
        		return;			
        	}else if (e.data == "[START]"){    
				
				//검토 로딩 내역 숨기기 
				$("#ps_search_" + cc +" .portal_search_body_loading").hide();
 		
        		var pre_sum = JSON.parse(pre_text);

        		var resources = pre_sum.sources;
        		if (checked != ""){
        			resources = checked;
        		}
        		for (var i = 0 ; i < resources.length; i++){
        			var itm = resources[i];
        			var opx =$("#ps_search_" + cc + " #portal_search_result_header .portal_search_result_header_btn [data-code='"+itm+"']");
        			$(opx).addClass("think");
        		}        		
        		      		
        		//검색 조건 영역 표시하기
        		$("#ps_search_" + cc +" .portal_search_result_header").show();
        		
        		//검색결과 표시 영역 표시하기
        		$("#ps_search_" + cc +" .ai_search_result").show();
        		
        		//검색 소스 추천 사유 내용 등록
        		if (checked != ""){
        			$("#ps_search_" + cc +" .portal_search_result_header_reason_content").html("사용자가 직접 선택하였습니다.");
        		}else{
        			$("#ps_search_" + cc +" .portal_search_result_header_reason_content").html(pre_sum.reasoning);
        		}
        		
        		
        		        				
        		//최적 검색어 등록하기
        		var sp = $("#ps_search_" + cc +" .portal_search_result_header_word_content");        		
        		var ppx = pre_sum.refined_query.split(",");
        		for (var k = 0 ; k < ppx.length; k++){
        			var qu = ppx[k];
        			var html = "<div class='portal_search_result_header_word_content_item'>"+qu+"</div>";
        			sp.append(html);
        		}
				gps.search_rel_user(query, cc);
        		gps.make_query_rel(query, pre_sum.refined_query, cc);
        		
        	}else if (e.data == "[SEARCH_END_SOURCES]"){
        		is_text_write = true;
        		
        	}else if (e.data.indexOf("[REF]") > -1){
				isREF = true;
				
				var rrx = "<div id='"+cc+"_reference'></div>";						
				$("#"+cc).append(rrx);	
				
				console.log(pph);
	
				gps.draw_ref_count(pph, cc);		
			}else{			
				if (e.data.indexOf("_SEARCH_END]") > -1){
					var pk = e.data;
					var xxp = "";
					//검색 항목들이 검색이 완료되었을때 호출되는 부분, 검색 진행중 상태를 완료 상태로 변경해야 한다.
					if (pk == "[BULLETIN_SEARCH_END]"){
						//게시판 검색이 완료된 경우
						xxp = "게시판 검색이 완료되었습니다.<br>"
						$("#ps_search_" + cc +" #portal_search_result_header .portal_search_result_header_btn [data-code='bulletin']").removeClass("think").addClass("checked");
						
					}else if (pk == "[DOC_SEARCH_END]"){
					 	//문서 중앙화가 완료된 경우
						$("#ps_search_" + cc +" #portal_search_result_header .portal_search_result_header_btn [data-code='doc_center']").removeClass("think").addClass("checked");
					}else if (pk == "[EMAIL_SEARCH_END]"){
						//메일 검색이 완료된 경우
						$("#ps_search_" + cc +" #portal_search_result_header .portal_search_result_header_btn [data-code='mail']").removeClass("think").addClass("checked");
					}else if (pk == "[APPROVAL_SEARCH_END]"){
						//결재 검색이 완료된 경우
						$("#ps_search_" + cc +" #portal_search_result_header .portal_search_result_header_btn [data-code='approval']").removeClass("think").addClass("checked");
					}else if (pk == "[INTENET_SEARCH_END]"){
						//인터넷 검색이 완료된 경우
						$("#ps_search_" + cc +" #portal_search_result_header .portal_search_result_header_btn [data-code='internet']").removeClass("think").addClass("checked");
					}
				}				
				
				if (!isREF){
					if (pph != "" && is_text_write){
						accumulatedMarkdown += pph;
	                	const html = marked.parse(accumulatedMarkdown);
	                	$("#"+cc).html(html);
					}else{
						pre_text += pph;
					}	
				}
				
									
			}		
		});
		ssp.stream();		
		gptpt.source.push(ssp);		 
	},
	
	"draw_ref_count" : function(arr, cc){
		var pp = arr.replace("[REF]:","")
		var list = eval(pp);		
		if (list[0] == ""){
			return false;
		}	
		var count = list.length;
		if (count > 0){
			var html = "";
			html += "<div class='ps_cite'>";
	 		html += "	<div class='ps_link'></div><div class='ps_link_title'>출처 " + count + "건</div>";
	 		html += "</div>";
		
			$("#ps_search_" + cc +" .portal_search_result_content_btns").append(html);
			
			$("#ps_search_" + cc +" .portal_search_result_content_btns .ps_cite").off().on("click", function(e){
				gps.draw_ref_list(cc);
			});
			
			var obj = $("#ps_search_" + cc +" .portal_search_result_content_btns .ps_cite");
			obj.data("source", arr);
		}		
	},
	
	"draw_ref_list" : function(cc){
		$("#ps_right_sub .ps_right_sub_center").css("display", "block");
		
		var itms = $("#ps_search_" + cc +" .portal_search_result_content_btns .ps_cite").data("source");
		//var lists = itms.split(":")[1];
		var pp = itms.replace("[REF]:","")
		var lists = eval(pp);
		console.log(lists);
		var url = gcom.gptserver + "/apps/portal_ref_info";
		var data = JSON.stringify({
			"query" : lists
		});
		
		gap.ajaxCall(url, data, function(res){
			if (res.result == "OK"){
				var items = res.data;
				
				var html = "";
				html += "<div class='ref_list_wrap'>";
				html += "	<div class='ref_list_title'>출처 "+items.length+"건</div>";	
				
						
				for (var  i = 0 ; i < items.length; i++){
					var item = items[i];
					var title = item.title;
					var date = item.GMT;
					sdate = moment(date, "YYYYMMDDHHmmss").format("YYYY-MM-DD (dd) A h:mm");
					var owner = item.owner;
					var category = item.category;
										
					html += "	<div class='ref_list_items_wrap'>";		
					html += "		<div class='ref_item'>";
					html += "			<div class='ref_item_top'>";
					html += "				<div class='ref_item_top_content'>";
					html += "					<div class='ref_list_check'></div>";
					html += "					<div class='ref_item_mail_icon_wrap'><div class='ref_item_"+category+"'></div><div class='ref_icon_title'>"+category+"</div></div>"
					html += "					<div class='ref_item_title'>"+owner+" · "+ sdate +"</div>";
					html += "				</div>";
					html += "			</div>";	
					html += "			<div class='ref_item_bottom'>"+title+"</div>";	
					html += "		</div>";	
					html += "	</div>";				
				}				
						
				html += "	<div class='ref_list_bottom'>";
				html += "		<div class='ref_list_bottom_btn'>선택 출처 요약</div><div class='ref_list_bottom_btn'>차이점 확인</div>"
				html += "	</div>";		
				html += "</div>";
				
						
				$("#ps_right_sub_center").html(html);	
				
				$("#ps_right_sub .ref_item_top_content .ref_list_check").off().on("click", function(e){
					var cls = $(this).attr("class");
					if (cls.indexOf("checked") > -1){
						$(this).removeClass("checked");
						$(this).closest(".ref_list_items_wrap").first().removeClass("checked");
					}else{
						$(this).addClass("checked");
						$(this).closest(".ref_list_items_wrap").first().addClass("checked");
					}
				});
				
			}
		});
		
		
	},
	
	"search_rel_user" : function(query, cc){
		var url = gcom.gptserver + "/apps/portal_search_user";
		var data = JSON.stringify({
			"query" : query
		});
		
		gap.ajaxCall(url, data, function(res){
			console.log(res);			
			if (res.result == "OK"){				
				var draw = $("#ps_search_" + cc +" .portal_search_result_person");
				var items = res.data;				
				var html = "";
				for (var i = 0 ; i < items.length; i++){
					var item = items[i];
					var name = item.name;
					var empno = item.empno;
					var dept = item.dept;
					var type = item.type;					
					html += "			<div class='person_item'>";
				 	html += "				<div class='person_top_btn'>";
				 	html += "					<div class='ps_btn_star'></div>";				 	
				 	html += "				</div>";
				 	html += "				<div class='person_top_btn_right'>";
				 	html += "					<div class='ps_btn_role'>"+type+"</div>";				 	
				 	html += "				</div>";				 	
				 	html += "				<div class='person_detail'>";
				 	html += "					<div class='ps_person_image'><img src='/photo/"+empno+".jpg'></div>";
				 	html += "					<div class='ps_pseron_info'><div class='ps_person_info_nm'>"+name+"</div><div class='ps_person_info_dept'>"+dept+"</div></div>";
				 	html += "					<div class='ps_person_bts'>";
				 	html += "						<div class='ps_person_bts_item'>";
				 	html += "							<div class='bts_item'><div class='bts_item_phone'></div></div>";
				 	html += "							<div class='bts_title'>통화</div>";
				 	html += "						</div>";
				 	html += "						<div class='ps_person_bts_item'>";
				 	html += "							<div class='bts_item'><div class='bts_item_chat'></div></div>";
				 	html += "							<div class='bts_title'>채팅</div>";
				 	html += "						</div>";
				 	html += "						<div class='ps_person_bts_item'>";
				 	html += "							<div class='bts_item'><div class='bts_item_email'></div></div>";
				 	html += "							<div class='bts_title'>메일</div>";
				 	html += "						</div>";
				 	html += "					</div>";
				 	html += "				</div>";
				 	html += "			</div>";
				}				
				$(draw).html(html);
				if (items.length > 0){
					//$("#ps_search_" + cc +" .portal_search_result_person_wrap").show();					
				}
			}		
		});
	},
	
	"make_query_rel" : function(query, qlist, cc){
		var url = gcom.gptserver + "/apps/make_query2";
		var data = JSON.stringify({
			"query" : query,
			"qlist" : qlist,
			"lang" : gap.curLang
		});
		
		gap.ajaxCall(url, data, function(res){				
			var draw = $("#ps_search_" + cc +" .portal_search_result_rel_lists");
			var items = res.result;				
			var html = "";
			for (var i = 0 ; i < items.length; i++){
				var item = items[i];
				html += "<div class='portal_search_result_rel_item'>";
				html += "	<div class='rel_search_icon'></div>";
				html += "	<div class='portal_search_result_rel_title'>"+item+"</div>";
				html += "</div>";
			}				
			$(draw).html(html);
			
			$("#ps_left_sub .portal_search_result_rel_lists .portal_search_result_rel_title").off().on("click", function(e){
				var query = $(this).text();
				gps.search_result_draw(query, "", "research");
				var $box = $('#ps_left_sub_content_content');
	            $box.animate({
	                scrollTop: $box.prop('scrollHeight')
	            }, 1000); // 500ms(0.5초) 동안 이동	
			});
			
			if (items.length > 0){
				//$("#ps_search_" + cc +" .portal_search_result_rel").show();					
			}
				
		});
	},
	
	"__ps_evnet" : function(){
		//검색어 입력후 엔터 전송
		$("#ps_left_sub_search_area_inner_search_input").off().on("keypress", function(e){
			if (e.keyCode == 13){
				var query = $(e.currentTarget).val();
				gps.search_result_draw(query, "", "first");
				$(e.currentTarget).focus();
			}
		});
		
		$("#ps_left_sub .portal_search_result_research_wrap .portal_search_result_header_btn_item").off().on("click", function(e){
			if ($(this).attr("class").indexOf("checked") > -1){
				$(this).removeClass("checked");
			}else{
				$(this).addClass("checked");
			}
		});
		
		$("#ps_left_sub .portal_search_result_research_wrap .portal_search_result_research_btn").off().on("click", function(e){
			var query = $(this).data("query");
			var list = $(this).parent().find(".checked");
			var selected = [];
			for (var i = 0 ; i < list.length ; i++){
				var code = $(list[i]).data("code");
				selected.push(code);
			}
			gps.search_result_draw(query, selected, "research");
			//재검색창을 닫는다.
			var cur_code = $(this).data("code");
			$("#portal_research_" + cur_code).hide();
			//창을 최하단으로 이동한다.
			var $box = $('#ps_left_sub_content_content');
            $box.animate({
                scrollTop: $box.prop('scrollHeight')
            }, 1000); // 500ms(0.5초) 동안 이동			
		});
		
		$("#ps_left_sub .portal_search_result_research_wrap .portal_search_result_research_head_close").off().on("click", function(e){
			//기존 선택되어 있던 값을 초기화 하고 재검색 창을 닫는다
			$("#ps_left_sub .portal_search_result_research_wrap .portal_search_result_header_btn_item").removeClass("checked");
			$(this).parent().parent().hide();
		});
		
		$("#ps_left_sub .portal_search_result_content_btns .item.ps_research").off().on("click", function(e){
			var code = $(this).data("code");
			$("#portal_research_" + code).css("display", "flex");
			$("#portal_research_" + code).fadeIn();
			
		});
		
	 	$("#ps_left_sub .ps_left_sub_content_tab .ps_left_sub_content_tab_item").off().on("click", function(e){
	 		$("#ps_left_sub .ps_left_sub_content_tab .ps_left_sub_content_tab_item").removeClass("selected");
	 		var mode = $(e.currentTarget).data("mode");
	 		if (mode == "ai"){
	 			$("#ps_left_sub .ps_left_sub_content_tab [data-mode='ai']").addClass("selected");
	 			$("#ps_left_sub .ps_left_sub_content_content").show();
	 			$("#ps_left_sub .ps_left_sub_content_content_normal").hide();
	 			$("#ps_left_sub_content_content_noraml").hide();
	 		}else{
	 			$("#ps_left_sub .ps_left_sub_content_tab [data-mode='normal']").addClass("selected");
	 			$("#ps_left_sub .ps_left_sub_content_content_normal").show();
	 			$("#ps_left_sub .ps_left_sub_content_content").hide();
	 			
	 			gps.draw_normal_search();
	 		}
	 	});		
		
	},
	
	"draw_normal_search" : function(){
		var html = "";
		html += "<div class='draw_noraml_search_dis'>";
		html += "</div>";
		
		target = $("#ps_left_sub_content_content_noraml");
		target.show();
		//target.html(html);
		
		var query = gps.cur_query;
		
		var searchTasks =[
			gps.draw_normal_search_mail(query),
			gps.draw_normal_search_doc(query),
			gps.draw_normal_search_person(query),
	//		gps.draw_normal_search_bulletin(query),
	//		gps.draw_normal_search_approval(query),
	//		gps.draw_normal_search_internet(query),
			
		]
		
		Promise.all(searchTasks)
			.then(function(res){
				var finalHTML = "";
				res.forEach(function(rex){
					finalHTML += "<div>" + rex + "</div>";
				});
				target.html(finalHTML);
			})
			.catch(function(error){
				console.log(error);
			});
	},
	
	"draw_normal_search_mail" : function(query){
		var html = "";
		html += "<div class='search_draw_email_wrap'>";
		html += "	<div class='search_draw_header'>";
		html += "		<span>메일</span><span class='search_draw_count'>13</span>";
		html += "	</div>";
		
		html += "	<div class='search_draw_items_wrap'>"
		html += "		<div class='search_draw_items'>";
		html += "			<div>";
		html += "				<div class='search_item_person'></div>";
		html += "			</div>";
		html += "			<div>";
		html += "				<div class='search_item_info'>박소라ㆍ11-04 (화) 오후 1:30</div>";
		html += "				<div class='search_item_title'>[공지] 재택근무 신청 기준 및 승인 절차 안내</div>";
		html += "			</div>";
		html += "		</div>";
		html +=	"		<div class='search_item_sepa_line'></div>";
		html += "	</div>";
		
		html += "	<div class='search_draw_items_wrap'>"
		html += "		<div class='search_draw_items'>";
		html += "			<div>";
		html += "				<div class='search_item_person'></div>";
		html += "			</div>";
		html += "			<div>";
		html += "				<div class='search_item_info'>박소라ㆍ11-04 (화) 오후 1:30</div>";
		html += "				<div class='search_item_title'>재택근무 신청 반려 사례 및 보완 작성 예시 공유</div>";
		html += "			</div>";
		html += "		</div>";
		html +=	"		<div class='search_item_sepa_line'></div>";
		html += "	</div>";
		
		html += "	<div class='search_draw_items_wrap'>"
		html += "		<div class='search_draw_items'>";
		html += "			<div>";
		html += "				<div class='search_item_person2'></div>";
		html += "			</div>";
		html += "			<div>";
		html += "				<div class='search_item_info'>박소라ㆍ11-04 (화) 오후 1:30</div>";
		html += "				<div class='search_item_title'>재택근무 근태 처리(출퇴근/휴게) 기록 기준 안내</div>";
		html += "			</div>";
		html += "		</div>";
		html +=	"		<div class='search_item_sepa_line'></div>";
		html += "	</div>";
		
		html += "	<div class='search_draw_items_wrap'>"
		html += "		<div class='search_draw_items'>";
		html += "			<div>";
		html += "				<div class='search_item_person'></div>";
		html += "			</div>";
		html += "			<div>";
		html += "				<div class='search_item_info'>박소라ㆍ11-04 (화) 오후 1:30</div>";
		html += "				<div class='search_item_title'>재택근무 근태 처리(출퇴근/휴게) 기록 기준 안내</div>";
		html += "			</div>";
		html += "		</div>";
		html +=	"		<div class='search_item_sepa_line'></div>";
		html += "	</div>";
		
		html += "	<div class='search_draw_items_wrap'>"
		html += "		<div class='search_draw_items'>";
		html += "			<div>";
		html += "				<div class='search_item_person2'></div>";
		html += "			</div>";
		html += "			<div>";
		html += "				<div class='search_item_info'>박소라ㆍ11-04 (화) 오후 1:30</div>";
		html += "				<div class='search_item_title'>재택근무 근태 처리(출퇴근/휴게) 기록 기준 안내</div>";
		html += "			</div>";
		html += "		</div>";
		html +=	"		<div class='search_item_sepa_line'></div>";
		html += "	</div>";
		
		html += "	<div class='search_draw_bottom_more'>";
		html += "		<div class='search_draw_bottom_more_txt'>검색 결과 더보기</div>";
		html += "		<div class='search_draw_bottom_more_icon'></div>";
		html += "	</div>";
		html += "</div>";
		
		return html;
	},
	
	"draw_normal_search_doc" : function(query){
		var html = "";
		html += "<div class='search_draw_doc_wrap'>";
		html += "	<div class='search_draw_header'>";
		html += "		<span>문서 중앙화</span><span class='search_draw_count'>7</span>";
		html += "	</div>";
		
		html += "	<div class='search_draw_items_wrap'>"
		html += "		<div class='search_draw_items'>";
		html += "			<div class='search_draw_items_icon_wrap'>";
		html += "				<div class='search_item_word'></div>";
		html += "			</div>";
		html += "			<div>";
		html += "				<div class='search_item_info'>경영 지원 업무ㆍ01-01</div>";
		html += "				<div class='search_item_title'>재택근무 신청서 양식(전일/반일/기간).docx</div>";
		html += "			</div>";
		html += "		</div>";
		html +=	"		<div class='search_item_sepa_line'></div>";
		html += "	</div>";
		
		html += "	<div class='search_draw_items_wrap'>"
		html += "		<div class='search_draw_items'>";
		html += "			<div class='search_draw_items_icon_wrap'>";
		html += "				<div class='search_item_excel'></div>";
		html += "			</div>";
		html += "			<div>";
		html += "				<div class='search_item_info'>2026년01월ㆍ01-01</div>";
		html += "				<div class='search_item_title'>재택 근무 신청 현황.xlsx</div>";
		html += "			</div>";
		html += "		</div>";
		html +=	"		<div class='search_item_sepa_line'></div>";
		html += "	</div>";
		
		html += "	<div class='search_draw_items_wrap'>"
		html += "		<div class='search_draw_items'>";
		html += "			<div class='search_draw_items_icon_wrap'>";
		html += "				<div class='search_item_pptx'></div>";
		html += "			</div>";
		html += "			<div>";
		html += "				<div class='search_item_info'>경영 지원 업무ㆍ2022-09-24</div>";
		html += "				<div class='search_item_title'>재택근무 v2.3.pptx</div>";
		html += "			</div>";
		html += "		</div>";
		html +=	"		<div class='search_item_sepa_line'></div>";
		html += "	</div>";
		
		html += "	<div class='search_draw_items_wrap'>"
		html += "		<div class='search_draw_items'>";
		html += "			<div class='search_draw_items_icon_wrap'>";
		html += "				<div class='search_item_pdf'></div>";
		html += "			</div>";
		html += "			<div>";
		html += "				<div class='search_item_info'>경영 지원 업무ㆍ2022-09-24</div>";
		html += "				<div class='search_item_title'>재택 근무 신청 안내.pdf</div>";
		html += "			</div>";
		html += "		</div>";
		html +=	"		<div class='search_item_sepa_line'></div>";
		html += "	</div>";
		
		html += "	<div class='search_draw_items_wrap'>"
		html += "		<div class='search_draw_items'>";
		html += "			<div class='search_draw_items_icon_wrap'>";
		html += "				<div class='search_item_pptx'></div>";
		html += "			</div>";
		html += "			<div>";
		html += "				<div class='search_item_info'>경영 지원 업무ㆍ2022-09-28</div>";
		html += "				<div class='search_item_title'>재택 근무 신청 반려 사유.pptx</div>";
		html += "			</div>";
		html += "		</div>";
		html +=	"		<div class='search_item_sepa_line'></div>";
		html += "	</div>";
		
		html += "	<div class='search_draw_bottom_more'>";
		html += "		<div class='search_draw_bottom_more_txt'>검색 결과 더보기</div>";
		html += "		<div class='search_draw_bottom_more_icon'></div>";
		html += "	</div>";
		html += "</div>";
		
		return html;
	},
	
	"draw_normal_search_bulletin" : function(query){

	},
	
	"draw_normal_search_approval" : function(query){

	},
	
	"draw_normal_search_internet" : function(query){
	},
	
	"draw_normal_search_person" : function(query){
		var html = "";
		html += "	<div class='portal_search_result_person_wrap' style='margin-top:15px; border: 1px solid #E5E7EB; border-radius: 16px; padding : 15px 20px 5px 15px'>";
	 	html += "		<div class='person_wrap_title'>관련 담당자</div>";
	 	html += "		<div class='portal_search_result_person' style='padding:5px 15px;'>";
	 	
	 	
	 	
	 	html += "			<div class='person_item'>";
	 	html += "				<div class='person_top_btn'>";
	 	html += "					<div class='ps_btn_star'></div>";				 	
	 	html += "				</div>";
	 	html += "				<div class='person_top_btn_right'>";
	 	html += "					<div class='ps_btn_role'>업무</div>";				 	
	 	html += "				</div>";				 	
	 	html += "				<div class='person_detail'>";
	 	html += "					<div class='ps_person_image' style='width:60px;height:60px'><img src='/resource/images/portal_search/image1.svg'></div>";
	 	html += "					<div class='ps_pseron_info'><div class='ps_person_info_nm'>이지선</div><div class='ps_person_info_dept'>경영지원팀</div></div>";
	 	html += "					<div class='ps_person_bts'>";
	 	html += "						<div class='ps_person_bts_item'>";
	 	html += "							<div class='bts_item'><div class='bts_item_phone'></div></div>";
	 	html += "							<div class='bts_title'>통화</div>";
	 	html += "						</div>";
	 	html += "						<div class='ps_person_bts_item'>";
	 	html += "							<div class='bts_item'><div class='bts_item_chat'></div></div>";
	 	html += "							<div class='bts_title'>채팅</div>";
	 	html += "						</div>";
	 	html += "						<div class='ps_person_bts_item'>";
	 	html += "							<div class='bts_item'><div class='bts_item_email'></div></div>";
	 	html += "							<div class='bts_title'>메일</div>";
	 	html += "						</div>";
	 	html += "					</div>";
	 	html += "				</div>";
	 	html += "			</div>";
	 	
	 	html += "			<div class='person_item'>";
	 	html += "				<div class='person_top_btn'>";
	 	html += "					<div class='ps_btn_star'></div>";				 	
	 	html += "				</div>";
	 	html += "				<div class='person_top_btn_right'>";
	 	html += "					<div class='ps_btn_role'>업무</div>";				 	
	 	html += "				</div>";				 	
	 	html += "				<div class='person_detail'>";
	 	html += "					<div class='ps_person_image' style='width:60px;height:60px'><img src='/resource/images/portal_search/image2.svg'></div>";
	 	html += "					<div class='ps_pseron_info'><div class='ps_person_info_nm'>윤지영</div><div class='ps_person_info_dept'>기술 전략팀</div></div>";
	 	html += "					<div class='ps_person_bts'>";
	 	html += "						<div class='ps_person_bts_item'>";
	 	html += "							<div class='bts_item'><div class='bts_item_phone'></div></div>";
	 	html += "							<div class='bts_title'>통화</div>";
	 	html += "						</div>";
	 	html += "						<div class='ps_person_bts_item'>";
	 	html += "							<div class='bts_item'><div class='bts_item_chat'></div></div>";
	 	html += "							<div class='bts_title'>채팅</div>";
	 	html += "						</div>";
	 	html += "						<div class='ps_person_bts_item'>";
	 	html += "							<div class='bts_item'><div class='bts_item_email'></div></div>";
	 	html += "							<div class='bts_title'>메일</div>";
	 	html += "						</div>";
	 	html += "					</div>";
	 	html += "				</div>";
	 	html += "			</div>";
	 	
	 	
	 	html += "			<div class='person_item'>";
	 	html += "				<div class='person_top_btn'>";
	 	html += "					<div class='ps_btn_star'></div>";				 	
	 	html += "				</div>";
	 	html += "				<div class='person_top_btn_right'>";
	 	html += "					<div class='ps_btn_role'>업무</div>";				 	
	 	html += "				</div>";				 	
	 	html += "				<div class='person_detail'>";
	 	html += "					<div class='ps_person_image' style='width:60px;height:60px'><img src='/resource/images/portal_search/image3.svg'></div>";
	 	html += "					<div class='ps_pseron_info'><div class='ps_person_info_nm'>박소라</div><div class='ps_person_info_dept'>경영지원팀</div></div>";
	 	html += "					<div class='ps_person_bts'>";
	 	html += "						<div class='ps_person_bts_item'>";
	 	html += "							<div class='bts_item'><div class='bts_item_phone'></div></div>";
	 	html += "							<div class='bts_title'>통화</div>";
	 	html += "						</div>";
	 	html += "						<div class='ps_person_bts_item'>";
	 	html += "							<div class='bts_item'><div class='bts_item_chat'></div></div>";
	 	html += "							<div class='bts_title'>채팅</div>";
	 	html += "						</div>";
	 	html += "						<div class='ps_person_bts_item'>";
	 	html += "							<div class='bts_item'><div class='bts_item_email'></div></div>";
	 	html += "							<div class='bts_title'>메일</div>";
	 	html += "						</div>";
	 	html += "					</div>";
	 	html += "				</div>";
	 	html += "			</div>";
	 	
	 	
	 	
	 	html += "		</div>";
	 	html += "	</div>";
		
		return html;
		
	},
	
}