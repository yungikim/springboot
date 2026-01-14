function gmeeting(){
	
}

gmeeting.prototype = {
	
	"init": function(){
		gmeet.meeting_view_draw();
	},
	
	"meeting_view_draw": function(){
		
		var url = root_path + "/load_meeting_recording_info.km";
		var data = JSON.stringify({
			"key" : key
		});
		
		$.ajax({
	        url: url,
	        type: "POST", // GET, POST, PUT, DELETE 등
	        data: data,   // 요청에 전달할 데이터
	        dataType: 'json', // 응답 데이터 타입 (json, text, html 등)
			beforeSend : function(xhr){
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
	        success: function(res) {
	            if (res.result == "OK"){
				var item = res.data;
				var sitem = JSON.parse(item.data);

				var html = "";
			
				html += "<div class='inner'>";
				
				html +=	"	<div class='title_wrap'>";
				html +=	"		<h4 class='title_txt'>"+item.title+"</h4>";
		//		html += "		<div class='title_desc' id='meeting_day'>작성일 : <span>"+sitem.day+" | 본사 3층 대회의실<span></div>";
				html +=	"	</div>";
				
				html += "	<div class='meeting_txt_wrap' >";
				html +=	"		<div class='meeting_info_wrap'>";
				
				
				html += "			<div class='meeting_summary_wrap'>";
		//		html +=	"				<div class='meeting_summary'>";
		//		html +=	"					<span>회의제목: </span><span id='meeting_title'></span>";
		//		html +=	"				</div>";
				html +=	"				<div class='meeting_summary'>";
				html +=	"					<span>일시: </span><span id='meeting_day'></span>";
				html +=	"				</div>";
				html +=	"				<div class='meeting_summary'>";
				html +=	"					<span>참석자: </span><span id='meeting_members'></span>";
				html +=	"				</div>";
				html +=	"			</div>";
				
				
		//		html += "			<div class='meeting_attend_wrap'>";
		//		html +=	"				<div>참석자: </div>";
		//		html += "				<ul>";
		//		html +=	"					<li>"+sitem.member+"</li>";

		//		html +=	"				</ul>";
		//		html += "			</div>";
				
				html +=	"		</div>";
				
				html += "       <div id='id='meeting_list_layer'>";
				html += "			<div class='meeting_detail_wrap' id='meeting_content' >";
				html +=	"			</div>";
				html +=	"		</div>";
				
				html +=	"	</div>";
				html +=	"</div>";
				$("#meeting_view").append(html);
								
				$("#meeting_content").addClass("markdown-body");
				$("#meeting_content").parent().css("white-space", "inherit");				
			

				if (item.edit && item.edit == "T"){
					$("#meeting_content").html(gmeet.textToHtml(item.content));
				}else{							
           			var xx = gmeet.change_markdown_html_for_meeting_record(item.content);
					xx = xx.replace(/\n/gi, "<br>");
					$("#meeting_content").html(xx);					
				}
							
				
				$("#meeting_title").text(item.title);
				
				var data = JSON.parse(item.data);
				$("#meeting_members").text(data.member);
				
				
				if (data.start_time == ""){
					$("#meeting_day").text(data.day);
					
				}else{
					$("#meeting_day").text(data.day + " " + data.start_time + "~" + data.end_time);
					
				}
				
			}
	        },
	        error: function(xhr, status, error) {
	          gap.error_alert();
	        }
	    });
		
		
		
	},
	
	"change_markdown_html_for_meeting_record" : function(msg){
		
		console.log(msg);
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
		str = str.replace(/&\#39;/gi,"'");
	//	str = str.replace(/ /gi, "&nbsp;");
		str = str.replace(/[\n\r]/gi,"<br>");
	//	str = str.replace(/\<span&nbsp;/gi, "<span ");
		return str;
	}
}