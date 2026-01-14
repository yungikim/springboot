function gTemp(){

	
	if (location.href.indexOf("dev.kmslab.com") > -1){
		this.plugin_domain_fast = "https://kgpt.kmslab.com:5100/";
	}else{
		this.plugin_domain_fast = "https://kgpt.kmslab.com:5005/";	
	}
	this.plugin_domain_iframe = "https://one.kmslab.com/";
	this.cur_id = "";
	this.start = 0;
	this.perpage = 20;
	
}

gTemp.prototype = {
	
	"init" : function(){
		gTemp.set_lang();
		gTemp.draw_template_layout();

		if (call_id != ""){
			//윈도우 하단에 call_id가 id인 div의 내용을 가져와서 본문에 디폴트로 세팅해준다.
			
			var parentDocument = window.opener.document;
		    //var targetElement = $('#'+call_id+' #research_report_container', parentDocument);	
		    var url = gTemp.plugin_domain_fast + "apps/check_msg/"+call_id;
		    $.ajax({
				"method" : "GET",
				"url" : url,
				"Content-type" : "application/json; charset=utf-8",
				"success" : function(res){
					if (res.result == "OK"){
						var content = res.data.data;
						$("#template_txtarea").val(content);
					}
					
				},
				"erroor" : function(e){
					
				}				
			})
		    
		    
		    	
		    // 3. 찾은 요소의 내용을 가져옵니다.
		    /*
		    if (targetElement.length > 0) {
		        var content = targetElement.text(); // 또는 .text()를 사용하여 텍스트만 가져올 수 있습니다.
				$("#template_txtarea").val(content);
		    } else {
		        console.log("부모 창에서 해당 요소를 찾을 수 없습니다.");
		    }
		    */
		}
	},
	
	"draw_template_layout" : function(){
		var html = "";		
		html += "<div id='container' class=''>";
		html += "	<div class='title_box_wrap'>";
		html += "		<h2 class='title_txt'>AI Reporting</h2>";		
		html += "		<div class='btn_wrap'>";
		html += "			<button type='button' id='btn_save_generate_result' class='btn_save'>";
		html += "				<span class='btn_inner'>";
		html += "					<span class='btn_ico'></span>";
		html += "					<span class='btn_name'>"+gap.lang.basic_save+"</span>";
		html += "				</span>";
		html += "			</button>";
		html += "			<button type='button' id='btn_edit_generate_result' class='btn_edit'>";
		html += "				<span class='btn_inner'>";
		html += "					<span class='btn_ico'></span>";
		html += "					<span class='btn_name'>"+gap.lang.va84+"</span>";
		html += "				</span>";
		html += "			</button>";
		
		html += "			<button type='button' id='btn_pdf_generate_result' class='btn_pdf'>";
		html += "				<span class='btn_inner'>";
		html += "					<span class='btn_ico'></span>";
		html += "					<span class='btn_name'>PDF Download</span>";
		html += "				</span>";
		html += "			</button>";
		
		html += "			<button type='button' id='btn_share_generate_result' class='btn_share'>";
		html += "				<span class='btn_inner'>";
		html += "					<span class='btn_ico'></span>";
		html += "					<span class='btn_name'>"+gap.lang.do_share+"</span>";
		html += "				</span>";
		html += "			</button>";
		html += "		</div>";
		html += "	</div>";
		html += "	<div id='content_box_container'>";
		html += "		<div class='content_box_wrap_left' style='width:600px'>";
		html += "			<div class='template_box'>";
		html += "				<div class='title_box'>";
		html += "					<h4 class='title_txt'>Template</h2>";
		/// 추후 추가 예정
		//html += "					<button type='button'></button>";
		html += "				</div>";
		html += "				<div id='template_item_wrap' class='item_box' >";
		html += "					<div>"
		html += "						<div class='item active' data-key='1' style='background-image:url(/resource/images/Template/template1.svg);background-repeat: no-repeat;'></div>";
		html += "						<div class='text_caption' data-key='1'><span>"+gap.lang.va231+"</span><span class='zoom-icon'></span></div>";
		html += "					</div>";
		html += "					<div>"
		html += "						<div class='item' data-key='2' style='background-image:url(/resource/images/Template/template2.svg);background-repeat: no-repeat;'></div>";
		html += "						<div class='text_caption' data-key='2'><span>"+gap.lang.va232+"</span><span class='zoom-icon'></span></div>";
		html += "					</div>";
		html += "					<div>"
		html += "						<div class='item' data-key='3' style='background-image:url(/resource/images/Template/template3.svg);background-repeat: no-repeat;'></div>";
		html += "						<div class='text_caption' data-key='3'><span>"+gap.lang.va233+"</span><span class='zoom-icon'></span></div>";
		html += "					</div>";
		html += "					<div>"
		html += "						<div class='item' data-key='4' style='background-image:url(/resource/images/Template/template4.svg);background-repeat: no-repeat;'></div>";
		html += "						<div class='text_caption' data-key='4'><span>"+gap.lang.va234+"</span><span class='zoom-icon'></span></div>";
		html += "					</div>";
		html += "				</div>";
		html += "			</div>";
		html += "			<div class='detail_box2'>";
		html += "				<div class='tab-container'>";
		html += "					<ul class='tabs'>";
		html += "						<li class='tab active' data-target='#tab1'>"+gap.lang.va235+"</li>";
		html += "						<li class='tab' data-target='#tab2'>"+gap.lang.va236+"</li>";
		html += "					</ul>";
		html += "					<div class='tab-content'>";
		html += "						<div id='tab1' class='content active'>";
		html += "							<textarea id='template_txtarea_commit' style='height:90px' class='template_txtarea' spellcheck='false'></textarea>";		
		html += "							<textarea id='template_txtarea' class='template_txtarea' spellcheck='false'></textarea>";		
		html += "						</div>";
		html += "						<div id='tab2' class='content' style='overflow:hidden; position:relative; height:calc(100vh - 423px)'>";

		html += "						</div>";
		html += "					</div>";
		html += "				</div>";
		html += "			</div>";		
		html += "			<div class='btn_wrap'>";
		html += "				<button type='button' id='btn_generating' class='btn_generate'>";
		html += "					<span class='btn_inner'>";
		html += "						<span class='btn_ico'></span>";
		html += "						<span class='btn_name'>"+gap.lang.va237+"</span>";
		html += "					</span>";
		html += "				</button>";
		html += "			</div>";		
		html += "		</div>";
		html += "		<div class='content_box_wrap' style='width:100%'>";
		html += "			<div id='generate_box'>";
		html += "				<textarea id='dis_html' class='template_txtarea_dis' spellcheck='false' style='display:none; width:100%; height:100%; border:0px' disabled></textarea>";
	//	html += "				<div id='dis_html' class='template_txtarea_dis' spellcheck='false' style='display:none; width:100%; height:100%; border:0px; white-space: pre-wrap;'></div>";
		html += "				<iframe id='boxiframe' style='width:100%; height:100%; border:0; display:none; '></iframe>";
		html += "				<div id='please_generate' class='please_generate'>";
		html += "					<div class='ico'></div>";
		html += "					<span style='text-align:center'>‘"+gap.lang.va237+"’ "+gap.lang.va238+" <br>"+gap.lang.va239+"</span>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";		
		$("#wrap").append(html);
		
		
		var txtarea_placeholder = "※ "+gap.lang.va242+"\n";
		txtarea_placeholder += " \n 📌 " + gap.lang.va243;
		txtarea_placeholder += " \n Date: 2025.06.17";
		txtarea_placeholder += " \n " + gap.lang.va244;
		txtarea_placeholder += " \n 1. " + gap.lang.va245;
		txtarea_placeholder += " \n · " + gap.lang.va246;
		txtarea_placeholder += " \n · " + gap.lang.va247;
		
		$("#template_txtarea").attr("placeholder", txtarea_placeholder);
		
		var txtarea_placeholder_new = gap.lang.va248
		txtarea_placeholder_new += " \n ex) " + gap.lang.va249;
	
		$("#template_txtarea_commit").attr("placeholder", txtarea_placeholder_new);
		gTemp.event_bind();
	},
	/*
	"draw_generate_result" : function(){		
		var html = "";		
		html += "<div id='generated_result'>";
		html += "	<div class='summary_wrap'>";
		html += "		<h4 class='title_txt'>요약</h4>";
		html += "		<ul class='summary_ul'>";
		html += "			<li>메인 페이지는 정보 중심 구조로 개편하고 사용자 진입 동선을 개선하기로 함.</li>";
		html += "			<li>UI/UX 측면에선 접근성 강화와 모바일 대응 기준 재조정이 논의됨.</li>";
		html += "			<li>관리자 기능 자동화 및 이미지 최적화 등 관리 효율 향상 방안 제안.</li>";
		html += "			<li>디자인 시스템 통합과 부서 간 UI 가이드 공유 필요성 공유.</li>";
		html += "			<li>6/21까지 1차 시안 공유 후, 6/24 피드백 받아 순차 적용 예정.</li>";
		html += "		</ul>";
		html += "	</div>";
		html += "	<button type='button' class='show_origin_btn'>";
		html += "		<span class='btn_inner'>";
		html += "			<span class='btn_ico'></span>";
		html += "			<span class='btn_name'>원본보기</span>";
		html += "		</span>";
		html += "	</button>";
		html += "</div>";
		html += "<textarea id='edit_generate_result' class='edit_generate_result'></textarea>";		
		$("#generate_box").empty();
		$("#generate_box").append(html);		
	},
	*/
	
	"channel_addContent" : function(obj){
		var start = gTemp.start;
     	var perpage = gTemp.perpage;
     	var url = gTemp.plugin_domain_fast + "apps/content_list";
     	var data = JSON.stringify({
     		"start" : start, 
     		"perpage" : perpage,
     		"ky" : gap.userinfo.rinfo.em
     	});
     	$.ajax({
     		method : "POST",
     		url : url,
     		data : data,
     		contentType : "application/json, charset=utf-8",
     		success : function(res){	     			
     			var html = "";
     			if (res.length > 0){
     				for (var i = 0; i < res.length; i++){
	     				var item = res[i];
	     				html += gTemp.draw_item(item);
	     			}
	     			$("#dis_content_req .mCSB_container").append(html);
	     			gTemp.bind_btn_action();
     			}
     		},
     		error : function(e){
     			alert(e);
     		}
     	});		
	},
	
	"convertGMTLocalDateTime" : function(val){
		var _date = moment(val, 'YYYYMMDDHHmmss').utc().local().format('YYYY-MM-DD[T]HH:mm:00[Z]')
		var ret = moment.utc(_date).local().format('YYYY.MM.DD') + " " +  moment.utc(_date).local().format('HH:mm');
		return ret;
	},
	
	"draw_item" : function(item){
		var html = "";
 		html += "<div class='item' id='c_"+item._id+"'>";
		html += "	<div class='title' data-key='"+item._id+"'>" + item.subject + "</div>";
		html += "	<div class='date'>" + gTemp.convertGMTLocalDateTime(item.GMT) + "</div>";
		html += " 	<div class='icons'>";
		html += "		<span class='icon1' data-key='"+item._id+"'></span>";
		html += "		<span class='icon2' data-key='"+item._id+"'></span>";
		html += "	</div>";
		html += "</div>";
		return html;
	},
	
	"draw_iframe_html" : function(key){
		var url = gTemp.plugin_domain_fast + "apps/content_info/" + key;
		$.ajax({
			method : "GET",
			url : url,
			contentType : "application/json; charset=utf-8",
			success : function(res){
				console.log(res);
				var path = res.path;
				var filename = res.filename;
				$("#please_generate").fadeOut();
				
				$("#btn_save_generate_result").hide();
				$("#btn_edit_generate_result").show();
				$("#btn_pdf_generate_result").show();
				$("#btn_share_generate_result").addClass("active");
				
				//$("#generate_box").css("border", "none");
				
				
				$("#template_txtarea_commit").val(res.prompt);
				$("#template_txtarea").val(res.word);
				var first = $(".tabs .tab").get(0);
				$(first).click();
				
				var uu = gTemp.plugin_domain_iframe +  "mk/" + path + "/" + filename ;				
	        	$('#boxiframe').attr("src", uu);	
	        	$("#boxiframe").show();
	        	
			},
			error : function(e){
				alert(e);
			}
		});
	},
	
	"draw_iframe_html_only" : function(key){
		var url = gTemp.plugin_domain_fast + "apps/content_info/" + key;
		$.ajax({
			method : "GET",
			url : url,
			contentType : "application/json; charset=utf-8",
			success : function(res){
				console.log(res);
				var path = res.path;
				var filename = res.filename;
				$("#please_generate").fadeOut();
				
				$("#btn_save_generate_result").hide();
				$("#btn_edit_generate_result").show();
				$("#btn_pdf_generate_result").show();
				$("#btn_share_generate_result").addClass("active");
				
								
				var uu = gTemp.plugin_domain_iframe +  "mk/" + path + "/" + filename ;				
	        	$('#boxiframe').attr("src", uu);	
	        	$("#boxiframe").show();
	        	
			},
			error : function(e){
				alert(e);
			}
		});
	},
	
	"new_window_site" : function(key){
		var url = gTemp.plugin_domain_fast + "apps/content_info/" + key;
		$.ajax({
			method : "GET",
			url : url,
			contentType : "application/json; charset=utf-8",
			success : function(res){
				var path = res.path;
				var filename = res.filename;				
				var url = gTemp.plugin_domain_iframe +  "mk/" + path + "/" + filename ;	
				window.open(url, null);			
	        	//gap.open_subwin(url, "1510","850", "yes" , "", "yes");
			},
			error : function(e){
				alert(e);
			}
		});
	},
	
	"content_delete" : function(key){
		var url = gTemp.plugin_domain_fast + "apps/content_delete/" + key;
		$.ajax({
			method : "GET",
			url : url,
			contentType : "application/json; charset=utf-8",
			success : function(res){
				$("#c_"+key).remove();
			},
			error : function(e){
				alert(e);
			}
		})	
	},
	
	"bind_btn_action" : function(){
		$("#dis_content_req .title").off().on("click", function(e){
			var key = $(e.currentTarget).data("key");
			gTemp.cur_id = key;
			gTemp.draw_iframe_html(key);
			
		});	  

		$("#dis_content_req .icon1").off().on("click", function(e){
			//내용 보기
			var key = $(e.currentTarget).data("key");
		//	gTemp.new_window_site(key);
			//현재 클릭한 위치 표시하기
			$("#top_content .title").css("color", "black");
			$(e.currentTarget).parent().prev().prev().css("color", "blue");
			gTemp.cur_id = key;
			gTemp.draw_iframe_html_only(key);
		});	  
		
		$("#dis_content_req .icon2").off().on("click", function(e){
			//삭제 하기 
			var key = $(e.currentTarget).data("key");
			gTemp.content_delete(key);
		});	  
	},
	
	"event_bind" : function(){
	
	
	
		$("#htmlc").off().on("click", function(e){
			 $('#c').on('input', function() {
                // 1. 현재 캔버스의 전체 HTML 내용을 가져옵니다.
                const updatedHtml = $(this).html();

                // 2. 변경된 HTML 내용을 콘솔에 출력합니다.
                // Date.now()를 사용하여 각 로그가 고유하게 보이도록 합니다.
                console.log("🔄 HTML 내용 변경됨 (" + Date.now() + "):", updatedHtml.trim());
            });
			
		   
		});
	
		$('.tabs .tab').off().on('click', function(e){
		    var $this = $(this),
		        target = $this.data('target');		
		    // 1) 탭 버튼 활성화 토글
		    $this
		      .addClass('active')
		      .siblings().removeClass('active');		
		    // 2) 콘텐츠 전환
		    $(target)
		      .addClass('active')
		      .siblings('.content').removeClass('active');
		      
		      gTemp.start = 0;
		      
		     var select_tab = $(e.currentTarget).data("target");
		     if (select_tab == "#tab2"){
		     	//리스트를 가져와서 표시한다.
		     	var start = gTemp.start;
		     	var perpage = gTemp.perpage;
		   //  	var url = gTemp.plugin_domain_fast + "apps/content_list/"+start+"/" + perpage;	
		  		 var url = gTemp.plugin_domain_fast + "apps/content_list";
		     	var data = JSON.stringify({
		     		"start" : start,
		     		"perpage" : perpage,
		     		"ky" : gap.userinfo.rinfo.em
		     	});
		     	$.ajax({
		     		method : "POST",
		     		data : data,
		     		contentType : "application/json, charset=utf-8",
		     		url : url,
		     		success : function(res){
		     			//console.log(res);
		     			var html = "";
		     			html += "<div id='top_content' style='position: relative; min-height:100%; height:100%'>";
		     			html += "<div class='xcontainer' id='dis_content_req' style='max-height:calc(100vh - 480px);min-height:calc(100vh - 439px); height:100%'>";
		     			for (var i = 0 ; i < res.length; i++){
		     				var item = res[i];
		     				html += gTemp.draw_item(item);		     				
		     			}
		     			html += "</div>";
		     			html += "</div>";
		     			$("#tab2").html(html);
		     			
		     			gTemp.bind_btn_action();
		     			
		     			//스크롤 설정
		     			$("#dis_content_req").mCustomScrollbar({
							theme:"dark",
							autoExpandScrollbar: true,
							scrollButtons:{
								enable: true
							},
							mouseWheelPixels : 200, // 마우스휠 속도
							scrollInertia : 400, // 부드러운 스크롤 효과 적용
							mouseWheel:{ preventDefault: false },
							advanced:{
						//		updateOnContentResize: true
							},
							autoHideScrollbar : true,
							scrollbarPosition: "inside", 
						//	setTop : ($("#top_content").height()) + "px",
							callbacks : {
								onTotalScroll: function(){					
									var new_start = parseFloat(gTemp.start) + parseFloat(gTemp.perpage);
									gTemp.start = new_start;
									gTemp.channel_addContent(this);					
								},
								onTotalScrollBackOffset: 10,
								alwaysTriggerOffsets:true
							}
						});
					},		     			
		     		
		     		error : function(e){
		     			alert(e);
		     		}
		     	});
		     }
	  	});
	
		$("#template_item_wrap .item").off().on("click", function(e){	
			$('#boxiframe').hide();
			$("#please_generate .ico").css("background-image", "url('/resource/images/Template/main1.svg')");
			$("#please_generate span").html("‘"+gap.lang.va237+"’ "+gap.lang.va238+" <br>"+gap.lang.va239);						
			$("#template_item_wrap .item").removeClass("active");
			$(this).addClass("active");		
			$('#boxiframe').hide();
			$("#please_generate").show();
		});
		
		$("#template_item_wrap .text_caption").off().on("click", function(e){
			$("#please_generate .ico").css("background-image", "url('/resource/images/Template/main1.svg')");
			$("#please_generate span").html("‘"+gap.lang.va237+"’ "+gap.lang.va238+" <br>"+gap.lang.va239);			
			var bun = $(e.currentTarget).data("key");			
			$("#template_item_wrap .item").removeClass("active");
			$(e.currentTarget).prev().addClass("active");		
			$("#please_generate").hide();
			$("#boxiframe").show();
			var uu = gTemp.plugin_domain_iframe +  "mk/template/" + bun + ".html" ;				
	        $('#boxiframe').attr("src", uu);	
		});
		
		$("#btn_edit_generate_result").off().on("click", function(){
		
			//편집하기
			$("#edit_generate_result").css({
				"left" : "calc(0% - 1px)"
			});		
			$(this).hide();
			$("#btn_save_generate_result").show();
		//	$("#boxiframe").hide();
		//	$("#dis_html").fadeIn();
		//	$("#dis_html").removeAttr("disabled");
			
			var iframebody = $("#boxiframe")[0].contentDocument
 		 	$(iframebody).find("div").attr('contenteditable', 'true');
 		 	$(iframebody).find("body").css("border", "2px dashed grey");
			
		});
		$("#btn_save_generate_result").off().on("click", function(){
			//저장하기
			$("#edit_generate_result").css({
				"left" : "120%"
			});			
			var obj = $(this);			
		//	var html = $("#dis_html").val();
		
			var iframebody = $("#boxiframe")[0].contentDocument
 		 	$(iframebody).find("div").removeAttr('contenteditable');
 		 	$(iframebody).find("body").css("border", "none");			
				
			var opp = iframeDoc = $('#boxiframe').contents();
			var html = fullHtml = iframeDoc.find('html').html();
			html = "<!DOCTYPE html><html lang='ko'>" + html + "</html>";
			
			var url = gTemp.plugin_domain_fast + "apps/modify_content";		
			var postData = JSON.stringify({
				"id" : gTemp.cur_id,
				"html" : html
			});
			$.ajax({
				method : "POST",
				url : url,
				data : postData,
				contentType : "application/json; charset=utf-8",
				success : function(res){
					obj.hide();
					$("#btn_edit_generate_result").show();
					var $ifr = $('#boxiframe');
					// 현재 src 값을 그대로 다시 할당 → 브라우저가 강제 reload 수행
					
					$ifr.attr('src', $ifr.attr('src'));
				//	setTimeout(function(){
				//		var iframebody = $("#boxiframe")[0].contentDocument
				//		$(iframebody).find("body").css("border", "none");
				//		$(iframebody).find("div").attr('contenteditable', 'false');
				//	}, 2000);

				//	$("#dis_html").hide();
				//	$('#boxiframe').fadeIn();
				},
				error : function(e){
					alert(e);
				}	
			});
		});
		$("#btn_generating").off().on("click", function(){		
			$("#btn_save_generate_result").hide();
			$("#btn_edit_generate_result").hide();
			$("#btn_share_generate_result").removeClass("active");	
		
			$("#please_generate").show();	
			$("#btn_generating").addClass("noclick");		
			$("#boxiframe").hide();			
			$("#please_generate .ico").css("background-image", "url('/resource/images/Template/main2.gif')");
			$("#please_generate span").html(gap.lang.va240);			
			setTimeout(function(){
				$("#please_generate .ico").css("background-image", "url('/resource/images/Template/main3.gif')");
				$("#please_generate span").html(gap.lang.va241);
			}, 40000);			
			var sel = $("#template_item_wrap").find(".active");
			var pn = $(sel).data("key");
			var txt = $("#template_txtarea").val();			
			var prompt = $("#template_txtarea_commit").val();	
			if (txt == ""){
				mobiscroll.toast({message: gap.lang.input_content, color:'danger'});
				return false;
			}						
	//		$("#please_generate").fadeOut();	
	//		$("#please_generate2").fadeIn();			
			var url = gTemp.plugin_domain_fast + "apps/make_content";			
			var postData = JSON.stringify({
				"word" : txt,
				"opt" : pn,
				"prompt" : prompt,
				"ky" : ky,
				"lang" : gap.curLang,
				"call_code" : "make_content"
			});		
			var ssp = new SSE(url, {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:postData,
	            method: 'POST'});                   
            ssp.addEventListener('open', function(e) {
				$("#dis_html").empty();					
			});	            
            var isEnd = false;
			var accumulatedMarkdown = "";
			var $ta = $('#dis_html');
			var bun = 0;
			var tx = "";
			ssp.addEventListener('message', function(e) {	
				console.log(e.data);				
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
						gTemp.cur_id = json.id;					
						uu = gTemp.plugin_domain_iframe +  "mk/" + path + "/" + filename ;				
	            		$('#boxiframe').attr("src", uu);			            		
	            		//setTimeout(function(){
	            			$('#boxiframe').fadeIn();		
	            		//}, 1000);							
						$("#btn_save_generate_result").hide();
						$("#btn_edit_generate_result").show();
						$("#btn_share_generate_result").addClass("active");						
					}else{
					    bun ++;
					    tx = tx + pph;
					    if (bun == 200){
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
		$("#btn_share_generate_result").off().on("click", function(){
			if ($(this).hasClass("active")){
				var url = $("#boxiframe").attr("src");
				gptpt.draw_layer_share_chat_history(url);
			}
		});
		
		$("#btn_pdf_generate_result").off().on("click", function(){
			var surl = $("#boxiframe").attr("src");
			
			var url = gTemp.plugin_domain_fast + "apps/pdf_download";		
			var postData = JSON.stringify({
				"url" : surl
			});
			$.ajax({
				method : "POST",
				url : url,
				data : postData,
				contentType : "application/json; charset=utf-8",
				success : function(res){
					debugger;
					if (res.result == "OK"){
						location.href = gTemp.plugin_domain_fast + "apps/pdf_down/" + res.fname;	
					}
				},
				error : function(e){
					alert(e);
				}	
			});
			
			
		});

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
}