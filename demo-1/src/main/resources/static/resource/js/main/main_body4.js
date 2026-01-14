$(document).keyup(function(e) {
    if (e.keyCode === 27) {
    	
    	$("#rmclose").click();
    	$("#todo_compose_close").click();
    	$("#open_mail").empty();
    	$("#open_mail").fadeOut();
    	gap.close_preview_img();
    }
});

function gBodyFN4(){
	this.listcount = 10;
	this.mail_domain = "";
	this.mail_select_mode = "1";  //1이면 메일함 선택, 2면 카테고리
	this.mail_box_value = "inbox"   //선택된 메일함
	this.s_idx = 1;
	this.is_searched = "0"
} 

gBodyFN4.prototype = {
	"init" : function(){
		gBody4.mail_domain = "https://" + mailserver + "/" + maildbpath;	
		if (location.href.indexOf("dev.kmslab.com") > -1){
			gBody4.isDev = true;
			gBody4.mail_domain = gBody4.mail_domain.replace("https://","http://");
		 }

	},
	
	// 메일 목록 그리기
	"get_mail_list" : function(search_val, mailbox, start_idx) {
		
		var current_user_mailserver = mailserver;
//		var mail_box_value = "inbox";	// 선택된 메일함
//		var s_idx = 1;	// 메일 시작 번호
		var current_user_mailpath = mailfile;
		var current_user_mailbox = mailbox;
		
		if (mailbox == "inbox") {
			current_user_mailbox = "XML_Inbox";
			gBody4.mail_select_mode = "";
		} else {
			current_user_mailbox = "XML_Sent";
			gBody4.mail_select_mode = "";
		}		
		
		var xdate = new Date();
		var ranNum = xdate.YYYYMMDDHHMMSS();
		
		if (start_idx==0) {
			start_idx = 1;
			e_idx = endcount;
		} else {
			e_idx = start_idx+gBody4.listcount-1;
			endcount = e_idx;
		}
		
		// 1이면 목록, 2면 검색
//		if (search_val == "") {
//			var get_mail_url = cdbpath + '/(agtGetMailListJson)?openAgent&ms=' + current_user_mailserver + '&mf=' + current_user_mailpath + '&language=' + userlang + '&vn=' + current_user_mailbox +'&start='+start_idx+'&xend='+e_idx + "&" + ranNum;
//		} else {
//			var get_mail_url = cdbpath + '/(agtSearchMailJson)?openAgent&ms=' + current_user_mailserver + '&mf=' + current_user_mailpath + '&language=' + userlang + '&vn=' + current_user_mailbox +'&start='+start_idx+'&xend='+e_idx + '&qr=' + search_val + "&listcount=" + listcount + "&" + ranNum;
//		}

		//https://one.kmslab.com/kwa01/mail/KM0035.nsf/XML_Inbox_unread?readviewentries&collapseview&count=1000&outputformat=json&charset=utf-8
		
		var ms = "https://one.kmslab.com/wnsf"
		current_user_mailserver = "mail2/Kmslab/kr"
		// 1이면 목록, 2면 검색
		if (search_val == "") {
			var get_mail_url = ms + '/(agtGetMailListJson)?openAgent&ms=' + current_user_mailserver + '&mf=' + current_user_mailpath + '&language=' + userlang + '&vn=' + current_user_mailbox +'&start='+start_idx+'&xend='+e_idx + "&" + ranNum;
		} else {
			var get_mail_url = ms + '/(agtSearchMailJson)?openAgent&ms=' + current_user_mailserver + '&mf=' + current_user_mailpath + '&language=' + userlang + '&vn=' + current_user_mailbox +'&start='+start_idx+'&xend='+e_idx + '&qr=' + search_val + "&listcount=" + gBody4.listcount + "&" + ranNum;
		}	
	
		//var get_mail_url = gBody4.mail_domain + "/" + current_user_mailbox + "?readviewentries&collapseview&start="+start_idx+"&count="+gBody4.listcount+"&outputformat=json&charset=utf-8";
		
		
		$.ajax({
			type : "GET",
			url : get_mail_url,
		//	dataType : "json",
			xhrFields: {
				withCredentials: true	
			},
			dataType: "json",
			contentType : "applicatino/json; charset=utf-8",
		//	contentType : "text/plain; charset=utf-8",
			success : function(data){
				gBody4.draw_mail_list(data);
			},
			error : function(e){
				mail_data = "ERROR";
			}
		})

	},
	
	// 메일 목록 만들기
	"draw_mail_list" : function(mail_data) {

		if (mail_data == "ERROR") {
			return false;
		} else {

			var li_item = []; 
			if (is_more_action == "1") {
			} else {
				$("#left_mail_sub").empty();
			}
			
		//	var default_image = "../' + cdbpath + '/images/none.jpg";
			var default_image = gap.none_img;
			var list_number;
			
			if (mail_data.entrydata.length==0) {
			} else {
				
				start_idx = e_idx+1;
				
				li_item.push('<div class="group"">');
				
				var pre_mail_date = "";
				var mail_date = "";
				
				$.each(mail_data.entrydata, function(i,item){
					
					/*
					item.date_only = gap.change_date_default(item.entrydata[4].datetime[0]);
					item.unid = item["@unid"];
					item.isread = item.entrydata[11].text[0];
					item.title = item.entrydata[3].text[0];
					item.user = item.entrydata[2].text[0].split("-=spl=-")[0];
					item.att = item.entrydata[9].text[0];
					item.time_only = gap.convertTimeOnly(item.entrydata[4].datetime[0]);
					if (item.entrydata[15].text[0] != ""){
						frominfo = JSON.parse(item.entrydata[15].text[0]);
						var empno = "";
						if (frominfo.empno){
							empno = frominfo.empno;
							item.photo = "https://one.kmslab.com/photo/" + empno + ".jpg";
						}else{
							item.photo = "";
						}
					}else{
						item.photo = "";
					}		
					*/
					
					mail_date = item.date_only;
					list_number = item.unid + "-new";
					
					if (pre_mail_date != mail_date) {
						li_item.push('<h3><span>' + mail_date + '</span></h3>');
						li_item.push('<ul style="list-style:none">');
					}
							
					if (item.private == "1"){
						li_item.push('<li style="list-style:none" id="' + item.unid + '" data-isaprv="'+item.isaprv+'" data-isread="'+item.isread+'" data-aprvunid="'+item.aprv_unid+'" data1="'+mailserver+'" data2="'+mailfile+'" data3="no" onclick="gBody4.openMail(\''+item.unid+'\')" class="tmail2">');
					}else{
						li_item.push('<li style="list-style:none" id="' + item.unid + '" data-isaprv="'+item.isaprv+'" data-isread="'+item.isread+'" data-aprvunid="'+item.aprv_unid+'" data1="'+mailserver+'" data2="'+mailfile+'" data3="forward" onclick="gBody4.openMail(\''+item.unid+'\')" class="tmail">');
					}
					
										
					li_item.push('<div class="user">');
					
					
					if (item.photo == "") {
						li_item.push('<div class="user-thumb"><img src="' + gap.none_img +'" alt="" /></div>');
					} else {
						li_item.push('<div class="user-thumb"><img src="' + item.photo + '" alt="" onError="this.src=\'' + default_image + '\'" /></div>');
					}
					
					if(item.isread == "0") {
						li_item.push('<span class="ico-new" id="'+ list_number +'"></span>');
					} else {
						li_item.push('<span id="'+ list_number +'"></span>');
					}
					
					li_item.push('<dl>');
					li_item.push('<dt>'+item.user+'</dt>');
					if (item.att == "") {
						li_item.push('<dd>'+item.title+'</dd>');
					} else {
						li_item.push('<dd class="nav-attach"><span class="ico ico-attach clip"></span>'+item.title+'</dd>');
					}
					li_item.push('</dl>');
					li_item.push('<span class="time">' + item.time_only + '</span>');
					li_item.push('</div>');
					li_item.push('</li>');
					
					if (pre_mail_date != mail_date) {
						li_item.push('</ul>');
					}

					pre_mail_date = mail_date;
				});
				
				li_item.push('</div>');
				
				$("#left_mail_sub").append(li_item.join(''));
				li_item = [];
			}
		}
		// 스크롤 적용
		$("#left_mail_list").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable: false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : true,
			callbacks : {
				onTotalScrollBackOffset: 100,
				onTotalScroll: function(){
					gBody4.get_mail_list_more();
				},
				onTotalScrollOffset: 100,
				alwaysTriggerOffsets:true
			}
		});		
		
		
		gBody4.__drag_event();
	},	
	
	// 메일 목록 추가 가져오기
	"get_mail_list_more" : function() {
		is_more_action = "1";
		
		var select_item = $("#mailbox_select option:selected").val(); 
		if (gBody4.mail_select_mode == "1") {
			if (select_item == "1"){
				gBody4.mail_box_value = "inbox";
			}else{
				gBody4.mail_box_value = "sent";
			}
			
		// 카테고리 선택
		} else {
			if (select_item == "1"){
				gBody4.mail_box_value = "inbox";
			}else{
				gBody4.mail_box_value = "sent";
			}
		}
		
		var search_val = $("#mail_search_query_field").val();
		gBody4.get_mail_list(search_val, gBody4.mail_box_value, start_idx);
		
	},
	
	// Drag&Drop 이벤트 처리
	"__drag_event" : function(){
		
		//$("#left_mail_list .group li").draggable({
		$("#left_mail_list .tmail").draggable({
			revert : "invalid",
			stack: "draggable",
			opacity : 1,
			scroll : false,
			helper : function(){
				var inx = gap.maxZindex()+1;
				return $(this).clone().appendTo("#nav_left_menu").css("zIndex", inx).show();
			},
			cursor: "move",
			start : function(event, ui){
				
				$(this).draggable("option", "revet", false);
				var inx = gap.maxZindex()+1;
				
				var person_img = $(this).find("img").attr("src");
				var name = $(this).find("dt").text();
				var title = $(this).find("dd").text();
				var time = $(this).find(".time").text();
				var html = "";
				html += "<div style='width:"+gap.right_page_width+";  padding:10px 5px 10px 15px; background:#fff;border:1px solid #999;border-radius:3px;box-shadow:0px 2px 8px 0 rgba(217,217,217,1);overflow:hidden;display:inline-block;;z-index:"+inx+";'>";
				html += "	<div class='user' style='position:relative; text-align:left; overflow:hidden'>";
				html += "		<div class='user-thumb' style=' margin-right:15px'><img src='"+person_img+"' /></div>";
				html += "			<dl style='overflow:hidden; '>";
				html += "				<dt style='font-weight:normal; color:#333333; font-size:14px; margin-bottom:1px; margin-top:2px;'>"+name+"</dt>";
				html += "               <dd style='width:100%; white-space:normal; overflow:hidden; max-height:34px; font-size:12px ; color:#666; word-break:break-all'>" + title + "</dd>";
				html += "			</dl>";
				html += "           <span style='font-size:11px; position:absolute; right:0px; top:3px; color:#999'>" + time + "</span>";
				html += "		</div>";
				html += "	</div>";
				html += "</div>";	
				
				ui.helper.html(html);
			},
			stop : function(event, ui){
				
			}
		});
	},
	
	// 메일 조회 창 열기
	"openMail" : function(unid, type, param, svr) {
		if (type == undefined && param == undefined && svr == undefined){
			var mail_domain = "https://" + mailserver + "/" + maildbpath;
			var url = mail_domain + "/0/"+unid+"?Opendocument&viewname=XML_Inbox&folderkey=&opentype=popup&relatedyn=Y";
			gap.open_subwin(url, "1100", "950", "yes" , "", "yes");
			
		}else{
			var max_idx = gap.maxZindex();
			$('#open_mail').css({'zIndex': parseInt(max_idx) + 1}).fadeIn();
			
			if (type == undefined) {
				type = "list";
			}
			
			if (param == undefined) {
				param = "";
			}
			
			var cid = unid + "-new";
			var isunread = $("#" + cid + "").hasClass("ico-new");	
			gBody.unread_check = "F";
			if (isunread){
				//읽지 않은 메일 건수 재정리
				gBody.unread_check = "T";
				
			}

			$("#" + cid + "").removeClass("ico-new");
			
			gBody4.draw_mail_content(unid, type, param, svr);
		}
	}, 
	
	"openMail_layer" : function(unid, type, param, svr) {
		
		
		var max_idx = gap.maxZindex();
		$('#open_mail').css({'zIndex': parseInt(max_idx) + 1}).fadeIn();
		
		if (type == undefined) {
			type = "list";
		}
		
		if (param == undefined) {
			param = "";
		}
		
		var cid = unid + "-new";
		var isunread = $("#" + cid + "").hasClass("ico-new");	
		gBody.unread_check = "F";
		if (isunread){
			//읽지 않은 메일 건수 재정리
			gBody.unread_check = "T";
			
		}
		
		
		$("#" + cid + "").removeClass("ico-new");
		
		gBody4.draw_mail_content(unid, type, param, svr);
		
	}, 
	
	// 메일 조회 화면 그리기
	"draw_mail_content" : function(unid, type, param, svr) {

		
		$("#open_mail").empty();	
		var width = $(window).width();
		var height = parseInt($(window).height() * 0.9);
		$("#open_mail").css("height", height);
		height = height - 40;
		if (width < 1200){
			$("#open_mail").css("max-width", width * 0.7 + "px");
		}else{
			$("#open_mail").css("max-width", "1000px");
		}
		
	//	var content_html = '<iframe src="' + cdbpath + '/fmViewMail?open&mail_unid=' + unid + '&type=' + type + '&svr=' + svr+ '&param=' + param + '" style="width:100%; height:780px; border: none"></iframe>'; 
		var content_html = '<iframe src="https://one.kmslab.com/wnsf/fmViewOneMail?open&mail_unid=' + unid + '&type=' + type + '&svr=' + svr+ '&param=' + param + '" style="width:100%; height:'+height+'px !important; border: none"></iframe>'; 
		
	//	var content_html = '<iframe src="page/fmViewMail.jsp?mail_unid=' + unid + '&type=' + type + '&svr=' + svr+ '&param=' + param + '" style="width:100%; height:'+height+'px !important; border: none"></iframe>'; 
		
		$("#open_mail").html(content_html);

	},
	
	
	"close_layer" : function(){
		$("#notice_content").empty();
		$("#sub_notice_content").hide();
		
	}
}
