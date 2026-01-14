

function gMainM(){
	this.per_page = "10";
	this.all_page = "1";
	this.start_skp = "";
	this.start_page = "1";
	this.cur_page = "1";
	this.total_page_count = "";
	this.total_data_count = "";
	this.qna_count = 0;
	this.qna_total_count = 0;
	this.search_collection_type = "";
	this.search_collection_opt = "1";
	this.collect_key = "";	
	this.scroll_bottom = false;
	this.previousY = 0;	
	this.islast = "F";
	this.cur_tab = "unread";

} 

$(document).ready(function(){

});

gMainM.prototype = {
	"init" : function(){
	//	gColM.user_lang_set();
	//	gColM.all_close_layer();
		gap.cur_window = "main";
	},
	
	"user_lang_set" : function(){
		var lan = "";
		if (typeof(gap.etc_info.ct) != "undefined"){
			lan = gap.etc_info.ct.lg;
		}else{
			lan = userlang;
		}
		if ((lan == "") || (typeof(lan) == "undefined")){
			lan = gap.curLang;
		}else{
			gap.curLang = lan;
		}
		
		if (typeof(mobile_lang) != "undefined"){
			lan = mobile_lang;
			gap.curLang = lan;
		}

		$.ajax({
			method : "get",
			url : cdbpath + "/lang/m_" + lan + ".json?open&ver="+jsversion,
			dataType : "json",			
			contentType : "application/json; charset=utf-8",
			async : false,
			success : function(data){	
				gap.lang = data;					
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"changePage" : function(){

		$("#alram_layer").fadeIn();		
		var html = gap.lang.info; //+ "<span class='read-st' id='alram_all_read'>"+gap.lang.allread+"</span>";			
		$("#alram_title").html(html);
		$("#qsearch").attr("placeholder", gap.lang.input_search_query);
		$("#unread_count_title").html(gap.lang.ur);
		$("#all_count_title").html(gap.lang.All);
		$("#allread").html(gap.lang.allread);
		$("#back_title").html(gap.lang.back);
		
		
		$("#sel_tabs li").off().on("click", function(e){
			var clicktab = $(e.target).attr("id");
			$("#sel_tabs li").removeClass("on");
			$(e.target).addClass("on");
			
			gMainM.skip = 0;
		
			if (gap.cur_window == "main"){
				if (clicktab == "all_count_title"){
					gMainM.cur_tab = "all";
				}else{
					gMainM.cur_tab = "unread";
				}
				gMainM.alram();
				return false;
			}else{
				//서브로 들어왔을때 
				if (clicktab == "all_count_title"){
					gMainM.cur_tab = "all";
				}else{
					gMainM.cur_tab = "unread";
				}
				$("#alram_list_ul2").empty();
				gMainM.alram_addContent();
				return false;
			}
			
		});
		
		$("#allread").off().on("click", function(e){
			gMainM.all_read();
		});
	
		gMainM.alram();
		
		
		
	},
	
//	"add" : function(){
//		$("#alram_scroll").mCustomScrollbar('destroy');
//		$("#alram_scroll").mCustomScrollbar({
////			$("#alram_list_ul2").mCustomScrollbar({
//			theme:"dark",
//			autoExpandScrollbar: true,
//			scrollButtons:{
//				enable: false
//			},
//			mouseWheelPixels : 200, // 마우스휠 속도
//			scrollInertia : 400, // 부드러운 스크롤 효과 적용
//			mouseWheel:{ preventDefault: false },
//			advanced:{
//		//		updateOnContentResize: true
//			},
//			autoHideScrollbar : false,
//		//	setTop : ($("#alram_scroll").height()) + "px",
//			callbacks : {
//				onTotalScroll: function(){
//			
//				//	gBody3.scrollP = $("#channel_list").find(".mCSB_container").height();
//					gMainM.skip += 20;
//					gMainM.alram_addContent()
//					
//				},
//				onTotalScrollBackOffset: 100,
//				alwaysTriggerOffsets:true
//			}
//		});
//	},
	
	
	
	"alram" : function(){
		
		gap.cur_window = "main";
		
		
		
		$("#qsearch_layer").hide();
		$("#alram_list_main").removeClass("alarm-cont");		
		
		gMainM.nid = "";
		gMainM.sty = "";
		gMainM.skip = 0;
		gMainM.alramsearch = "F";
	
		
		var url = location.protocol + "//" + location.host + "/noti/notisum";
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				var list = res.content;
				var html = "";
				
				for (var i = 0  ; i < list.length; i++){
					var info = list[i];
					var title = "";
					var cnt = info.total;
					var unread = info.unread;
					if (info.nid == "dsw_mail"){
						title = info.sty;
					}else{
					//	title = info.nid;
						title = info.nm;
					}
					
					html += "<li data-nid='"+info.nid+"' data-sty='"+info.sty+"'>";
					html += "	<p class='alarm-type' style='width:150px; text-align:center'>"+title+"</p>";
				//	html += "	<p><span class='alarm-num'>"+cnt+""+gap.lang.total_attach_count_txt+"</span></p>";
				//	html += "	<p><span class='alarm-num'>"+ unread + " / " + cnt+""+gap.lang.total_attach_count_txt+"</span></p>";
					if (gMainM.cur_tab == "all"){
						html += "	<p><span class='alarm-num'>"+ unread + "/" +  cnt + "</span> " + gap.lang.total_attach_count_txt + "</p>";
					//	html += "	<p><span class='alarm-num'>"+ unread + "/" +  cnt + "</span> </p>";
					}else{
						html += "	<p><span class='alarm-num'>"+ unread + "</span> " + gap.lang.total_attach_count_txt + "</p>";
					//	html += "	<p><span class='alarm-num'>"+ unread + "</span></p>";
					}
					
					html += "</li>";
				}
				
				$("#alram_list_ul").html(html);
								
				$("#alram_list_ul li").off().on("click", function(e){
					
					
					gap.cur_window = "sub";
					$(".alram .close_box").show();
					$("#alram_list_main").addClass("alarm-cont");					
					$("#qsearch_layer").show();
					$("#top1").hide();
					$("#top2").show();
					$("#back_title2").html($(e.currentTarget).data("sty"));
								
					$("#alram_list_ul").empty();
					
					var info = $(e.currentTarget);
					gMainM.nid = info.data("nid");
					gMainM.sty = info.data("sty");
					gMainM.skip = 0;
					
					var html = "";
//					html += "<div class='btn_return' id='alram_back' style='margin-bottom:15px; margin-left:15px'>";
//					html += "	<button class='arrow_wr'>";
//					html += "	<span class='prev arrow icon' style='margin-right:6px'></span>"+gap.lang.back+"</button>";
//					html += "</div>";
					
					html += "<div id='alram_scroll' style=' height: calc(100% - 80px); overflow-y:auto'>";
					html += "<ul id='alram_list_ul2' style='padding : 10px 13px 0 0; height:100%; '>";
					
					html += "</ul> ";
					html += "</div>";
					
					$("#alram_list_ul").show();
					$("#alram_list_ul").html(html);
					
					$("#alram_ul_top").removeAttr("class");
					$("#alram_ul_top").addClass("alarm-list alarm-cont alar_list");
					
				//	gMainM.add();
					
//					element.addEventListener('scroll', function(event){
//					    var element = event.target;
//					    if (element.scrollHeight - element.scrollTop === element.clientHeight)
//					    {
//					        console.log('scrolled');
//					    }
//					});
					
					$('#alram_scroll').on('scroll', function() {
				        if($(this).scrollTop() + $(this).innerHeight() >= ($(this)[0].scrollHeight - 100)) {
				        	
							if (!gMainM.scroll_bottom) {
								gMainM.scroll_bottom = true;
								gMainM.skip += 20;
								gMainM.alram_addContent()
								
							}else{
								gMainM.scroll_bottom = false;
							}
				        }
				    })
					
					
					gMainM.alram_addContent()
					
					
				});	
				
				
				$("#alram_close_btn").on("click", function(e){
					$("#alram_layer").fadeOut();
					
				});
			},
			error : function(e){
				gap.error_alert();
			}
		});	
	},
	
	

	"alram_addContent" : function(){

		gMainM.scroll_bottom = false;
		
		if (gMainM.alramsearch == "T"){
			return false;
		}
		
		var postdata = JSON.stringify({
			nid : gMainM.nid,
			sty : gMainM.sty,
			skip : gMainM.skip,
			limit : 20,
			unread : ((gMainM.cur_tab == "unread") ? "T" : "F")
		})
		var url = location.protocol + "//" + location.host + "/noti/notilist";
		$.ajax({
			type : "POST",
			url : url,
			data : postdata,
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){				
//				var list = res.content;				
//				var html = "";					
//				for (var i = 0 ; i < list.length ; i++){
//					var info = list[i];
//					var title = info.tit;
//					var date = moment(info.dt).utc().format("YYYY-MM-DD hh:mm");
//					var name = info.send.nm;
//					var read = info.read;
//					var id = info.id;
//					
//					html += "<li style='margin-left:20px' data-lnk='"+info.lnk+"' data-key='"+id+"'>";
//					if (read == "1"){
//						//읽지 않은 상태
//						html += "	<p class='text-elips' style='font-weight:bold'>"+title+"</p>";
//					}else{
//						//읽음
//						html += "	<p class='text-elips'>"+title+"</p>";
//					}
//					
//					html += "	 <div class='f_between'>";
//					html += "	 	<span>"+date+"</span>";
//					html += "		<span>"+name+"</span>";
//					html += "	</div>";
//					html += "</li>";
//				}	
				
				var html = gMainM.alram_draw_list(res);
				
				$("#alram_list_ul2").append(html);			
				
				
				$("#alram_back").off().on("click", function(e){
					$("#alram_ul_top").removeAttr("class");
					$("#alram_ul_top").addClass("alarm-list alar_list");
				//	$("#top1").show();
					$("#top2").hide();
					
					$("#alram_list_ul").empty();
				
					gMainM.alram();
				});		
				
				$("#query_btn_close").off().on("click", function(e){
					//탭에 on되어 있는 탭을 클릭해준다.
					var id = $("#unread_count_title").hasClass("on");
					if (id){
						$("#unread_count_title").click();
					}else{
						$("#all_count_title").click();
					}
					$("#query_btn_close").hide();
					$("#qsearch_btn").show();
					
				});
				
				$("#qsearch_btn").off();
				$("#qsearch_btn").on("click", function(e){
					
					$("#query_btn_close").show();
					$("#qsearch_btn").hide();
					
					$("#alram_query_btn_close").show();
					$("#alram_query_btn_close").off().on("click", function(e){
						$("#alram_query_btn_close").hide();
					//	$("#alram_list_ul").empty();
						gMainM.alramsearch = "F";
						gMainM.skip = 0;
					
						
						
						$("#alram_list_main").addClass("alarm-cont");					
						$("#qsearch_layer").show();
						
									
						$("#alram_list_ul").empty();
					
						
						var html = "";
						html += "<div class='btn_return' id='alram_back' style='margin-bottom:15px; margin-left:15px'>";
						html += "	<button class='arrow_wr'>";
						html += "	<span class='prev arrow icon' style='margin-right:6px'></span>"+gap.lang.back+"</button>";
						html += "</div>";
						
						html += "<div id='alram_scroll' style=' height: calc(100% - 0px)'>";
						html += "<ul id='alram_list_ul2' style='padding : 10px 0px 0 0; height:100%; overflow-y:auto'>";
						
						html += "</ul> ";
						html += "</div>";
						
						$("#alram_list_ul").show();
						$("#alram_list_ul").html(html);
						
						
						gMainM.alram_addContent()
						
						
						
						
					});
					gMainM.skip = 0;
					
					var query = $("#qsearch").val();
					$("#qsearch").val("");
					var postdata = JSON.stringify({
						nid : gMainM.nid,
						sty : gMainM.sty,
						skip : gMainM.skip,
						keyword : query,
						limit : 1000,
						unread : ((gMainM.cur_tab == "unread") ? "T" : "F")
					})
					
					var url = location.protocol + "//" + location.host + "/noti/notilist";
					$.ajax({
						type : "POST",
						url : url,
						data : postdata,
						dataType : "json",
						beforeSend : function(xhr){
							xhr.setRequestHeader("auth", gap.get_auth());
							xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
						},
						success : function(res){	
						
							var html = gMainM.alram_draw_list(res);
							
							$("#alram_list_ul2").html(html);
							gMainM.alram_event();
							
						},
						error : function(e){
							gap.error_alert();
						}
					});
				});
				
				$("#qsearch").off();
				$("#qsearch").keypress(function(e){
					if (e.keyCode == 13){
						$("#qsearch_btn").click();						
					}
				});
				
				gMainM.alram_event();
				
//				$("#alram_list_ul2").bind("scrollstop", function(e){
//					
////					console.log("-----------------------------");
////					console.log($("#alram_list_ul2").scrollTop() + $("#alram_list_ul2").height());
////					console.log($(document).height() + 700)
////					console.log("-----------------------------");
//					if($("#alram_list_ul2").scrollTop() + $("#alram_list_ul2").height() >= $(document).height() + 700) {
//						console.log("신규 데이러틀 가져온다....");
//						gMainM.skip += 20;
//						gMainM.alram_addContent()
//					}
//					
////					var currentY = $("#alram_list_ul2").scrollTop();
////					console.log("-----------------------------");
////					console.log("currentY : " + currentY);
////					console.log("gMainM.previousY : " + gMainM.previousY);
////					
////					console.log("-----------------------------");
////				//    if (currentY > gMainM.previousY && currentY < 150 ) {	 
////				   	if (currentY > 150 ) {	 
////				    	
////				    	if (gBodyM.islast == "F"){
////				    		
////				    	}
////				    }
////				    gMainM.previousY = currentY;	
//				});
				
				
				
				
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"all_read" : function(){
		
		var postdata = "";
		if (gap.cur_window == "main"){
			var postdata = JSON.stringify({
				all : "T"    //T 전체, P 부분
			});
		}else{
			var postdata = JSON.stringify({
				all : "P",    //T 전체, P 부분
				nid : gMainM.nid,
				sty : gMainM.sty
			})
		}
		
		var url = location.protocol + "//" + location.host + "/noti/noticonfirm";
		
		$.ajax({
			type : "POST",
			url : url,
			data : postdata,
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){	
				
				if (gap.cur_window == "main"){
					$("#alram_list_ul").empty();
					gMainM.alram();
				}else{
					$("#alram_list_ul2").empty();
					
					gMainM.alramsearch = "F";
					gMainM.skip = 0;
					
					gMainM.alram_addContent();
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});			
	},
	
	"alram_event" : function(){
		
		$("#alram_list_ul2 li").off().on("click", function(e){
			//클릭한 목록을 읽은 처리한다.
			
			var tid = $(e.currentTarget).data("key");
			var id = $(e.currentTarget).data("id");
			var pcode = $(e.currentTarget).data("pcode");
			var ty = $(e.currentTarget).data("ty");
			var ms = $(e.currentTarget).data("ms");
			var mf = $(e.currentTarget).data("mf");
			var ex = $(e.currentTarget).data("ex");
			
			var url = location.protocol + "//" + location.host + "/noti/noticonfirm";
			var postdata = JSON.stringify({
				nid : gMainM.nid,
				tid : tid
			})
			$.ajax({
				type : "POST",
				url : url,
				data : postdata,
				dataType : "json",
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){	
					
					if (res.result == "success"){
						
						if (gMainM.cur_tab == "unread"){
							$(e.currentTarget).remove();
						}else{
							$(e.currentTarget).find("p").removeAttr("style");
							$(e.currentTarget).removeClass("on");
						}
						
						
						if (pcode != ""){
							if (gMainM.mail_id == ""){
								mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
							}else{
								
								var _url = location.protocol + "//"+location.host+"/mobile/m.nsf/calMFunc?readform&pmode="+pcode;
								if (pcode == "8"){
									_url += "&menuhidden=F";
								}else{
									_url += "&menuhidden=T";
								}				
								_url += "&type="+ty+"&ms="+ms+"&mf="+mf+"&lang="+userlang+"&unid="+id;											
								var _title = gap.lang.alview;
								
								if (ex == "F"){
									var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(_url) + "&title=" + encodeURIComponent(_title);
									gBodyM.connectApp(url_link);
								}else{
									var url_link = "kPortalMeet://NativeCall/callUrl?url=" + encodeURIComponent(ms);
									gBodyM.connectApp(url_link);
								}

							}
						}else{
							var url = $(e.currentTarget).data("lnk");
							if (typeof(url) != "undefined" && url != ""){
								var url_link = "kPortalMeet://NativeCall/callUrl?url=" + encodeURIComponent(url);
								gBodyM.connectApp(url_link);
							}
						}
						
						
									
					}else{
						gap.error_alert();
					}

				},
				error : function(e){
					gap.error_alert();
				}
			});			
		});
	},
	
	"alram_draw_list" : function(res){
		var list = res.content;				
		var html = "";					
		for (var i = 0 ; i < list.length ; i++){
			var info = list[i];
			var title = info.tit;
			//var date = moment(info.dt).utc().format("YYYY-MM-DD hh:mm");
			//var date = moment.utc(info.dt).local().format("YYYY-MM-DD hh:mm");
			var date = gMainM.convertGMTLocalDateTime(info.dt);
					
			var name = info.send.nm;
			var read = info.read;
			var id = info.id;
			var link = info.lnk;
			
			var body = "";
			var isPopup = "T";
			if (typeof(info.body) != "undefined" && info.body != ""){
				body = info.body;
				isPopup = "F";
			}
			
			var mail_id = "";
			var ms = "";
			var mf = "";
			var ex = "";
			
	//		if (link != ""){
				
				var pcode = "";
				var ty = "";
				if (info.ex == "F"){
					ex = "F";
					//내부 시스템에서 메일로 발송된 알림 메일이다.
					if (link.indexOf("/mail/") > -1){
						var inx1 = link.indexOf("XML_Inbox/");
						var inx2 = link.indexOf("?Opendocument");
						mail_id = link.substring(inx1+10, inx2);
						pcode = "1";
						ty = "mail";
						ms = mailserver;
						mf = maildbpath;
					}else if (link.indexOf("/appro.nsf/") > -1){
						var plist = link.split("/");
						var pt = plist[6];
						var ppt = pt.indexOf("?");
						var mail_id = pt.substring(0, ppt);
						pcode = "8";
						ty = "aprv";
						if (gap.isDev){
							ms = plist[2];
						}else{
							//운영환경일 경우 변경한다.
							ms = plist[2].replace("dspsec","app2")
						}						
						mf = plist[3] + "/" + plist[4];
					}else if (link.indexOf("/apprbox/") > -1) {
						var plist = link.split("/");
						var pt = plist[9];
						var ppt = pt.indexOf("?");
						var mail_id = pt.substring(0, ppt);
						pcode = "8";
						ty = "aprv";
						if (gap.isDev){
							ms = plist[2];
						}else{
							//운영환경일 경우 변경한다.
							ms = plist[2].replace("dspsec","app2")
						}						
						mf = plist[3] + "/" + plist[4]+ "/" + plist[5]+ "/" + plist[6]+ "/" + plist[7]
					}
				}else{
					//아예 외부시스템이 메일이 아니라 HTTP로 알림서버로 바로 호출한 경우로 해당 링크 값을 그대로 뜨워줘야 한다.
					ms = info.link;
				}
				
				
							
				if (read == "1"){
					//읽지 않은 상태
					html += "<li class='on' data-lnk='"+info.lnk+"' data-key='"+id+"' data-id='"+mail_id+"' data-pcode='"+pcode+"' data-ty='"+ty+"'  data-ms='"+ms+"' data-mf='"+mf+"' data-ex='"+ex+"' data-check='"+isPopup+"'>";
					html += "	<p class='text-elips' style='font-weight:bold'>"+title+"</p>";
				}else{
					//읽음
					html += "<li style='' data-lnk='"+info.lnk+"' data-key='"+id+"' data-id='"+mail_id+"'  data-pcode='"+pcode+"' data-ty='"+ty+"'  data-ms='"+ms+"' data-mf='"+mf+"' data-ex='"+ex+"' data-check='"+isPopup+"'>";
					html += "	<p class='text-elips'>"+title+"</p>";
				}
				
				html += "	 <div class='f_between'>";
				html += "	 	<span>"+date+"</span>";
				html += "		<span>"+name+"</span>";
				html += "	</div>";
				
				if (body != ""){
					html += "<div class='alram_body'>"+body+"</div>"
				}
				html += "</li>";
			}
			
			
	//	}	
	
		return html;
	},
	
	"alram_unread_count_check" : function(){
		
		var url = location.protocol + "//" + location.host + "/noti/notiunread";		
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){	
				if (res.count > 0){
					$("#new_alram_menu").addClass("act");
				}else{
					$("#new_alram_menu").removeClass("act");
				}

			},
			error : function(e){
				//gap.error_alert();
			}
		});
	},
	
	
	
	"convertGMTLocalDateTime" : function(val){
		var _date = moment(val, 'YYYYMMDDHHmmss').utc().local().format('YYYY-MM-DD[T]HH:mm:00[Z]')
		var ret = moment.utc(_date).local().format('YYYY.MM.DD') + '(' + moment.utc(_date).local().format('ddd') + ') ' + moment.utc(_date).local().format('HH:mm');
		return ret;
	}
	
	
}

//$(document).on('pagecontainershow', function () {
//	$("#alram_list_ul2").scroll(function () {
//   
//        if ($("#alram_list_ul2").scrollTop() + $(window).height() == $(document).height() - 100) {
//            alert("Bottom reached!");
//        }
//    });
//});


//$(document).on("scrollstop", checkScroll);

//$(document).ready(function(){
//	var previousY = 0;	
//	
//	window.addEventListener('scroll', function(e) {
//		
//		
//		var currentY = window.scrollY;
//	    if (currentY < previousY && currentY < 150 ) {	 
//	    	if (gBodyM.islast == "F"){
//	    		gBodyM.channel_addContent();
//	    	}
//	    }
//	    previousY = currentY;		
//	    
//	    return false;
//		//if ( (gBodyM.cur_opt == "allcontent") || (gBodyM.cur_opt == "mycontent") || (gBodyM.cur_opt == "sharecontent") || (gBodyM.cur_opt == "channel")){
//
//		if (gBodyM.cur_opt != ""){
//			if (!gBodyM.select_files_tab){
//				// 채널이 호출된 경우 (Conversation 클릭 포함)
//				var currentY = window.scrollY;
//			    if (currentY < previousY && currentY < 150 ) {	 
//			    	if (gBodyM.islast == "F"){
//			    		gBodyM.channel_addContent();
//			    	}
//			    }
//			    previousY = currentY;				
//			    //$("#channel_list").css({opacity:1})
//			    
//			}else{
//				// 채널에서 Files 클릭된 경우
//				if($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
//					if (!gBodyM2.scroll_bottom) {
//						gBodyM2.scroll_bottom = true;
//						gBodyM2.files_page_no++;
//						gBodyM2.add_files_data_list(gBodyM2.files_page_no);
//						
//					}else{
//						gBodyM2.scroll_bottom = false;
//					}
//				}				
//			}
//
//		}	    
//	});
//});
