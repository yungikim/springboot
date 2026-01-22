function gPtl(){
	this.rp = "https://dsw.daesang.com";
	if (gap.isDev){
		this.rp = "https://dswdv.daesang.com";
	}		
	this.item_list = "";
	this.unread_background_color = "#feeae6";
}

gPtl.prototype = {		
	"init" : function(){		
	},
	
	"load_portlet" : function(code, layer){
		gptl[code](layer);
	},
	
	"portlet_msg" : function(layer){
		//읽지 않은 건수 가져오기 메시지 센턴
		//내가 등록해 놓은 항목 리스트를 가져와야 한다.
		var url = gptl.rp + "/portalmng/agMSGCenterList?openagent";		
		var data = {			
			"empno" : gap.userinfo.rinfo.ky
		};
		$.ajax({
			"type" : "POST",
			"data" : data,
			"dataType" : "json",
			"url" : url,
			"contentType" : "application/json; charset=utf-8",
			success : function(res){		
			   	gptl.item_list = gap.sortResults(res.list, "sort", true);		   				   	
				var html = gptl.show_portlet_message_center();
				$("#" + layer).html(html);				
				
				gptl.set_scroll(layer, "portlet_mcenter");
				
				gptl.search_unread_count(layer);
				
				$("#" + layer + " .content_list li").off().on("click", function(e){
					var link_url = $(e.currentTarget).data("linkurl");
					var code = $(e.currentTarget).data("code");
					gap.openOnce(link_url, code);
				});				
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
	},
	
	"portlet_new" : function(layer){
		//최근 컨텐츠 가져오기
		
		var html = "";	
		html += "<div class='tab_content' id='p_"+layer+"'>";
		html += "	<ul style='list-style:none'>";
		html += "		<li class='on' id='channel_portlet_tab'>";
		html += "			<span>"+gap.lang.channel+"</span>";
		html += "		</li>";
		html += "		<li id='mail'>";
		html += "			<span>"+gap.lang.mail+"</span>";
		html += "		</li>";
		html += "	</ul>";
		html += "</div>";		
		html += "<div class='list_wr scroll' style='height:calc(100vh - 300px)'>";
		html += "	<div class='' style='height:100%'>";
		html += "		<div class='content_list_wr' id='portlet_news'>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";		
		$("#" + layer).html(html);		
		gptl.show_portlet_channel(layer);	
		
		$("#p_"+layer+" .tabs").tabs();
		$("#p_" + layer + " ul li").off().on("click", function(e){
			$("#p_" + layer + " ul li").removeClass("on");
			$(e.currentTarget).addClass("on");
			$(e.currentTarget).focusout();			
			var code = $(e.currentTarget).attr("id");			
			if (code == "mail"){
				gptl.show_portlet_mail(layer);
			}else{
				gptl.show_portlet_channel(layer);
			}			
		});			
	},
	
	"portlet_work" : function(layer){
		var html = gptl.show_portlet_workroom(layer);		
	},
	
	"portlet_menu" : function(layer){
		//메뉴 표시하기		
		gptl.show_portlet_menu(layer);			
	},
	
	"search_unread_count" : function(layer){
		//19개의 시스템의 읽지 않은 건수를 가져와야 한다.
		//받은편지함 (unreadmail) / 전자결재 (appno) / 경비결재 (costappno) / 이슈관리 (issue) / 두드림콜 (dudurim) / PLM(plmcount)
		//VOC통합관리 (voccount) / MDM결재 (mdmcount1) / 시장조사 (marketingresearch) / 상상제작소 (coDoctor) / 영양정보 (foodeffect)
		//웹하드관리결재 (webhardappno) / PC관리결재 (pcappno) / DRM 결재 (drmcount) / 범무미결 사항 (lawcount)
		//SAP쪽 연동 사항
		//법인카드미처리(cardcount) / 세금계산서및리 (taxcount) / HR결제 (hrapprocount) / DECO (decocount) / 전자계약 (ec_count)		
		var ukey = gap.userinfo.rinfo.ky;
		for (var i = 0 ; i < gptl.item_list.length; i++){
			var item = gptl.item_list[i];
			var code = item.menukey;
			var ckurl = item.cnturl;
			var ckurl_org = ckurl;
			var linkurl = item.linkurl;			
			var menu_name = item.menu_name;	
			if (item.menukey == "unreadmail"){
				ckurl = gptl.rp + "/"+maildbpath+"/XML_Inbox_unread?ReadViewEntries&outputformat=json&start=1&count=1&charset=utf-8&"+new Date().getTime();
			}
			if (ckurl != ""){
				if (ckurl.indexOf("dbconnector.nsf") >-1){
					gptl.count_check_sap(code, layer);
				}else{
					//var ckurl = ckurl.toLowerCase();
					if (ckurl.indexOf("readviewentries") > -1){
						ckurl = ckurl.replace("readviewentries","readviewentries&outputformat=json");
					}		
					if (ckurl.indexOf("loginid") > -1){
						ckurl = ckurl.replace("loginid", gap.userinfo.rinfo.id);
					}
					ckurl = gptl.change_rp_server(ckurl);						
					gptl.count_check_new(code, ckurl, linkurl, layer);
				}
			}
		}		
	},
	
	"count_check_new" : function(code, ckurl, linkurl, layer){
		var url = ckurl;
		if (typeof(url) != "undefined"){
			$.ajax({
				type : "GET",
				url : url,		
				contentType : "applicaion/json; charset=utf-8",
			//	contentType : "text/html; charset=utf-8",
			//	contentType : "text/plain; charset=utf-8",
				success : function(res){						
					var unread_count = 0;				
					unread_count = res["@toplevelentries"];
					if (typeof(unread_count) == "undefined"){
						unread_count = 0;
					}								
					if (code == "mdmcount1" || code == "plmcount" || code == "coDoctor" || code == "foodeffect" || code == "dps_count"){
						res = res.trim().replace(/\r\n/gi, "");
						res = res.replace(/\n/gi, "");
						res = res.replace("\<ES_CNT\>", "");
						res = res.replace("\<\/ES_CNT\>", "");
						unread_count = res;
					}else if (code == "drmcount"){
						unread_count = res.appCount;
					}else if (code == "voccount"){
						var in1 = res.indexOf("_CNT>");
						var in2 = res.indexOf("</ES_CNT");
						unread_count = res.substring(in1+5, in2);
					}
					$("#" + layer + " #msg_count_"+code).html(unread_count);
					var pobj = $("#" + layer + " #msg_count_"+code).parent().parent();
					if (unread_count == 0){
						gptl.nocount_style(layer, code);
					}
				},
				error : function(e){
					console.log("-------------------------");
					console.log(code + "/" + ckurl);
					console.log(e.responseText);	
					
					gptl.nocount_style(layer, code);
				}
			});
		}		
	},
	
	"nocount_style" : function(layer, code){
		var pobj = $("#" + layer + " #msg_count_"+code).parent().parent();					
		pobj.removeClass();
		pobj.addClass("msgcenter_ban nocount");
	},
	
	"count_check_sap" : function(code, layer){
		
//		if (gap.userinfo.rinfo.ky.indexOf("im") > -1){
//			return false;
//		}
		var url = gap.channelserver + "/sapcount_check.km";
		var info = gap.userinfo.rinfo;
		var cp = info.cpc;
		if (cp == "10"){
			cp = "1000";
		}else if (cp == "L0"){
			cp = "5000";
		}
		var empno = info.emp;
		var email = info.em;

		if (code == "hrapprocount"){
			empno = info.ky;
		}
		var decoid = "";
		if (code == "decocount"){
			decoid = DecoID;
			if (decoid == ""){
				$("#" + layer + " #msg_count_"+code).html("0");
				gptl.nocount_style(layer, code);
				return false;
			}
		}
		
		var data = JSON.stringify({
			"code" : code,
			"companycode" : cp,
			"empno" : empno,
			"email" : email,
			"decoid" : decoid
		})
		$.ajax({
			type : "POST",
			url : url,		
			data : data,
			dataType : "json",
			contentType : "applicaion/json; charset=utf-8",
			success : function(res){			
				if (res.result == "OK"){
					
					var count = parseInt(res.data.count);
					$("#" + layer + " #msg_count_"+code).html(count);
					if (count == 0){
						gptl.nocount_style(layer, code);
					}
				}				
			}
		});
	},
	
	"change_rp_server" : function(ckurl){
		if (gap.isDev){
			ckurl = ckurl.replace("http://dapp2.daesang.com", gptl.rp);
			ckurl = ckurl.replace("http://dapp1.daesang.com", gptl.rp);
			ckurl = ckurl.replace("http://dst.daesang.com", gptl.rp);
			ckurl = ckurl.replace("http://mdmdev.daesang.com:7777", gptl.rp);
			ckurl = ckurl.replace("http://mdm0.daesang.com:8686", gptl.rp);
			ckurl = ckurl.replace("http://192.168.14.152:8801", gptl.rp);
			ckurl = ckurl.replace("http://devplm.daesang.com", gptl.rp);
			ckurl = ckurl.replace("http://192.168.14.121:8503", gptl.rp);
			ckurl = ckurl.replace("http://192.168.9.19:8080", gptl.rp);
			ckurl = ckurl.replace("http://192.168.15.250:8080", gptl.rp + "/count01");
			ckurl = ckurl.replace("http://192.168.14.153:8080", gptl.rp + "/count02");
		}else{
			ckurl = ckurl.replace("http://dspsec.daesang.com", gptl.rp);
			ckurl = ckurl.replace("http://dsp.daesang.com", gptl.rp);
			ckurl = ckurl.replace("http://dst.daesang.com", gptl.rp);
			ckurl = ckurl.replace("http://plm.daesang.com", gptl.rp);
			ckurl = ckurl.replace("http://vocweb.daesang.com", gptl.rp);
			ckurl = ckurl.replace("http://dsmdm.daesang.com", gptl.rp);
			ckurl = ckurl.replace("http://mdm0.daesang.com:8686", gptl.rp);
			ckurl = ckurl.replace("http://sangsang.daesang.com:9000", gptl.rp);
			ckurl = ckurl.replace("http://dsdrm.daesang.com:8080", gptl.rp + "/count02");
			ckurl = ckurl.replace("http://dsin.daesang.com", gptl.rp +"/dsin");
			ckurl = ckurl.replace("http://192.168.15.138:8081", gptl.rp + "/count01");
			ckurl = ckurl.replace("http://dps.daesang.com", gptl.rp +"/count03");
		}
		
		//ckurl = ckurl.replace("10051077", gap.userinfo.rinfo.ky);
		return ckurl;
	},
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////// 포틀릿을 구성하는 개별 함수 ///////////////////////////////////////////////////////////////////
	"show_portlet_message_center" : function(){
		var html = "";
		html += "<div class='list_wr h120 scroll' id='portlet_mcenter' style='padding:0px 10px 0px 10px; overflow-y:auto; height:calc(100vh - 265px)' >";
		html += "<div style='height: calc(100% - 30px);'>";
		html += "	<div class='content_list_wr'>";
		html += "		<div class='content_list' style='height: 100%'>";
		html += "			<ul class='flex' style='list-style:none'>";		
		var item_list = gptl.item_list;
		for (var i = 0 ; i < item_list.length; i++){
			var item = item_list[i];
			var cnturl = item.cnturl;
			var code = item.menukey;
			if (cnturl != "" || code == "unreadmail"){				
				var name = item.menuname;
				var link = item.linkurl;
				if (code == "unreadmail"){
					link = location.protocol + "//" + location.host + "/" + mailfile + "/FrameMail?openform";
				}
				html += "				<li class='msgcenter_ban "+code+"' data-linkurl='"+link+"' data-code='"+code+"'>";
				html += "					<div class='msg_txt'>";
				html += "						<p class='msg_tit'>"+name+"</p>";
				if (code == "unreadmail"){
					html += "						<p class='msg_num ptlmailcount' id='msg_count_"+code+"'></p>";
				}else{
					html += "						<p class='msg_num' id='msg_count_"+code+"'></p>";
				}				
				html += "					</div>";
				html += "					<div class='ico_msg'>";
				html += "						<span class='ico "+code+"'></span>";
				html += "					</div>";
				html += "				</li>";
			}			
		}		
		html += "			</ul>";			
		html += "		</div>";
		html += "	</div>";
		html += "</div>";
		html += "</div>";		
		return html;
	},
	
	"show_portlet_menu" : function(layer){
		var menu_list = gBody.folder_menu_info;
		
		var menu_setting = $('#'+layer).closest('.portlet-wrap').data('app_info');
		if (menu_setting) {
			menu_list = menu_setting.folder;
		}
			
		var html = "";
		html += "<div class='list_wr h90 scroll' style='padding:0px 0px 0px 15px'>";
		html += "<div class='main_split' style='height:calc(100vh - 270px)'>";
		html += "	<div class='content_list_wr' id='portlet_menu' style='height:calc(100% - 1px)'>";		
		var m_list = new Object();
		for (var i = 0 ; i < menu_list.length; i++){
			var item = menu_list[i];			
			var fname = item.folder_name
			html += "		<div class='q_folder_list'>";
			html += "			<div class='q_tit'>";
			html += "				<h2 class='f_between'>";
			html += "					"+fname+"";
			html += "				</h2>";
			html += "			</div>";
			html += "			<ul class='flex'>";			
			for (var j = 0 ; j < item.list.length; j++){
				var info = item.list[j];
				var mname = info.menu_kr;
				var code = info.code;
				var bg = info.bg;
				m_list[code] = info;
				if (gap.curLang != "ko"){
					mname = info.menu_en;
				}
				html += "				<li data-code='"+info.code+"'>";
				html += "					<div class='ico_box' style='background-color:"+bg+"'>";
				html += "						<span class='ico menu' style='background:url("+gptl.rp+"/WMeet/menuicon.do?code="+code+"&ver="+new Date().getTime()+")'></span>";
				html += "					</div>";
				html += "					<span class='tit' title='"+mname+"'>"+mname+"</span>";
				html += "				</li>";
			}
			html += "			</ul>";
			html += "		</div>";
		}
		html += "	</div>";
		html += "</div>";
		html += "</div>";		
		$("#"+layer).html(html);
		
		gptl.set_scroll(layer, "portlet_menu");
		
		$("#"+layer + " li").off().on("click", function(e){
			var code = $(this).data("code");
			var info = m_list[code];
			gBody.go_app_url(info);
		});
	},
	
	"show_portlet_workroom" : function(layer){
		var channel_list = gBody.select_channel_code_portlet;
		if (typeof(channel_list) == "undefined" || channel_list == ""){
			gptl.load_channel_list_info();
		}
		var channel_list = gap.cur_channel_list_info;
		var f_list = [];
		var c_list = [];
		var etc_list = [];
		var fav_list = [];
		for (var i = 0 ; i < channel_list.length; i++){
			var item = channel_list[i];
			if (item.type == "folder"){
				f_list.push(item);
			}else{
				c_list.push(item);
			}
			
			// 기타 업무방 계산
			if (typeof(item.folder_info) == "undefined"){
				etc_list.push(item);
			} else {
				// folder_info가 있을 때, 기타 업무방인지 확인
				var isFolder = false;
			    for (var k = 0 ; k < item.folder_info.length; k++){
			        var fitem = item.folder_info[k];
			        if (fitem.email == gap.userinfo.rinfo.ky){
			            isFolder = true;
			            if ($("#" + layer + " #folder_"+fitem.fk).length > 0){
			            }else{
			                isFolder = false;
			            }			
			        }
			    }	
			    if (!isFolder){
			    	etc_list.push(item);
			    }
			}
			
			if (typeof(item.favorite) != "undefined"){
				for (u = 0 ; u < item.favorite.length; u++){
					var uitem = item.favorite[u];
					if (uitem == gap.userinfo.rinfo.ky){
						fav_list.push(item);
					}
				}
			}
		}
		var html = "";
		html += "<div class='request_folder' >";
		html += "<div id='channel_top_carosel'>"
		html += "<ul id='channel_sub_ul'>";
		html += "	<li data-code='first'>"+gap.lang.gofirst+"</li>";
		if (fav_list.length > 0){
			html += "	<li data-code='favorite'>"+gap.lang.favorite+"</li>";
		}
		for (var j = 0 ; j < f_list.length; j++){
			var folder_item = f_list[j];
			var name = folder_item.name;
			var f_id = folder_item._id.$oid;
			html += "	<li data-code='"+f_id+"'>";
			html += "		<img src='img/icon/layout/ico_folder.png' />"+name;
			html += "	</li>";
		}
		if (etc_list.length > 0){
			html += "	<li data-code='etc'>"+gap.lang.nofolder +"</li>";
		}
		html += "</ul>";
		html += "</div>";
		html += "<button class='btn_f_pv'>";
		html += "	<img src='img/icon/ico_arrow_prev_b.png' onClick='gptl.prev()'>";
		html += "</button>";
		html += "<button class='btn_f_nt'>";
		html += "	<img src='img/icon/ico_arrow_next_b.png' onClick='gptl.next()'>";
		html += "</button>";
		html += "</div>";		
		html += "<div id='portlet_channel_list' class='list_wr scroll' style='height:calc(100vh - 320px); overflow-y:hidden; padding:0px 0px 0px 15px ;margin-top:20px'>";
		html += "<div class=''>";
		html += "	<div class='content_list_wr'>";		
		if (fav_list.length > 0){
			html += "<div class='content_list'>";
			html += "<h5 class='folder_name' data-linktag='favorite'>"+gap.lang.favorite+"</h5>";
			html += "<ul class='flex' style='list-style:none' id='favorite_portlet_ul'>";		
			html += "</ul>";
			html += "</div>";
		}		
		for (var p = 0 ; p < f_list.length; p++){
			var folder_item = f_list[p];
			var name = folder_item.name;
			var f_id = folder_item._id.$oid;
			html += "<div class='content_list' >";
			html += "<h5 class='folder_name' data-linktag='"+f_id+"'>"+name+"</h5>";
			html += "<ul class='flex' style='list-style:none' id='folder_"+f_id+"'>";			
			html += "</ul>";
			html += "</div>";
		}		
		if (etc_list.length > 0){
			html += "<div class='content_list'>";
			html += "<h5 class='folder_name' data-linktag='etc'>"+gap.lang.nofolder +"</h5>";
			html += "<ul class='flex' style='list-style:none' id='etc_portlet_ul'>";		
			html += "</ul>";
			html += "</div>";
		}	
		html += "    </div>";
		html += "</div>";
		html += "</div>";		
		$("#" + layer).html(html);		
		gptl.set_scroll(layer, "portlet_channel_list");
		
		for (var h = 0 ; h < c_list.length; h++){
			var channel_item = c_list[h];
			var c_name = channel_item.ch_name;
			var c_code = channel_item.ch_code;
			var folder_info = channel_item.folder_info;
			var favorite = channel_item.favorite;
			var dis_date = gap.change_date_default(gap.change_date_localTime_only_date(channel_item.lastupdate));				
			dis_date = dis_date.replace(/-/gi,".");
			var is_unread = false;			
			if (channel_item.ch_share == "Y"){
				if (typeof(channel_item.lastupdate) != "undefined"){					
					if (gBody.readTime_check(channel_item)){
						is_unread = true;
						//unread_count += 1;
					}
				}						
			}			
			var html2 = "";			
			if (is_unread){
				html2 += "	<li class='request_card "+c_code+"' data-code='"+c_code+"' style='border:2px solid #ee7158; background-color:"+gptl.unread_background_color+"'>";
				html2 += "		<div class='top' style='border-bottom:1px solid #edc0a1'>";
			}else{
				html2 += "	<li class='request_card "+c_code+"' data-code='"+c_code+"'>";
				html2 += "		<div class='top'>";
			}						
			html2 += "			<div>";
			html2 += "				<p class='tit' id='portlet_channel_"+c_code+"'>"+ c_name+"</p>";			
			html2 += "			</div>";
			html2 += "		</div>";
			html2 += "		<div class='bot' style='display:flex; flex-wrap:wrap; justify-content:space-between'>";
			html2 += "			<div class='work_staus' style='display:flex'>";
			html2 += "				<span>Date:</span>"+dis_date;			
			html2 += "			</div>";			
			if (typeof(channel_item.member) != "undefined"){
				var members = channel_item.member;				
				var mcnt = members.length;
				var len = 0;
				if (mcnt > 3){
					len = 3;
					html2 += "		<div class='team_mem_wr' style='text-align:right;'>";
				}else{
					len = mcnt;
					html2 += "		<div class='team_mem_wr' style='text-align:right;padding-right:10px'>";
				}				
				for (var k = 0 ; k < len; k++){
					var mm = members[k];
					html2 += "				<div class='mem_img' style='background-image:url("+gap.person_photo_url(mm)+"),url("+gap.none_img+"); background-size:cover; background-position: top;'></div>";
					html += "		</div>";
				}
				if (mcnt > 3){
					var bnt = mcnt - 3;			
					html2 += "			<div class='mem_num'>";
					html2 += "				<span>+"+bnt+"</span>";
					html2 += "			</div>";
				}				
				html2 += "			</div>";
			}else{
				html2 += "		<div class='team-img user' style='width:35px; height:35px'>";
				html2 += "		</div>";
			}		
			html2 += "		</div>";
			html2 += "	</li>";			
			
			if (typeof(folder_info) != "undefined"){
				var isFolder = false;
				for (k = 0 ; k < folder_info.length; k++){
					var fitem = folder_info[k];
					if (fitem.email == gap.userinfo.rinfo.ky){
						isFolder = true;
						if ($("#" + layer + " #folder_"+fitem.fk).length > 0){
							$("#" + layer + " #folder_"+fitem.fk).append(html2);
						}else{
							isFolder = false;
						}			
					}
				}	
				if (!isFolder){
					$("#" + layer + " #etc_portlet_ul").append(html2);
				}
			}else{
				$("#" + layer + " #etc_portlet_ul").append(html2);
			}
			
			if (typeof(favorite) != "undefined"){
				for (u = 0 ; u < favorite.length; u++){
					var uitem = favorite[u];
					if (uitem == gap.userinfo.rinfo.ky){
						$("#" + layer + " #favorite_portlet_ul").append(html2);
					}
				}
			}	
		}
		
		$("#" + layer + " .request_card").off().on("click", function(e){
			var code = $(e.currentTarget).data("code");
			gptl.goto_channel(code);
		});
		
		$("#" + layer + " #channel_top_carosel li").off().on("click", function(e){
			e.preventDefault();			
		
			$("#" + layer + " #channel_top_carosel li").removeClass("on");
			$(e.currentTarget).addClass("on");			
			var code = $(e.currentTarget).data("code");
			if (code == "first" || code == "favorite"){
				$("#" + layer + " #portlet_channel_list").mCustomScrollbar("scrollTo", 0); 
			}else if (code == 'etc'){
				var code_position = $("#" + layer + " [data-linktag='etc']");
				var point = code_position.offset().top-$("#portlet_channel_list .mCSB_container").offset().top;
				$("#" + layer + " #portlet_channel_list").mCustomScrollbar("scrollTo", point); 
			}else{
				var code_position = $("#" + layer + " [data-linktag='"+code+"']");				
				var point = code_position.offset().top-$("#" + layer + " #portlet_channel_list .mCSB_container").offset().top;
				$("#" + layer + " #portlet_channel_list").mCustomScrollbar("scrollTo", point); 
			}
		});		
		
		//폴더명이 있는 ul의 width를 계산해서 추가해야 딱 맞게 이동 할 수 있다. 아니면 계속이동시 빈 화면이 표시 될 수 있다. /////////////////
		var sumWidth = 0;
		$("#" + layer + " #channel_top_carosel ul li").each(function() {
			sumWidth +=  $(this).outerWidth(true);
		});
		var licnt = $("#" + layer + " #channel_top_carosel ul li").length
		var addwidth = licnt * 20;
		$("#" + layer + " #channel_sub_ul").css("width", (sumWidth + addwidth) + "px");		
		//////////////////////////////////////////////////////////////////////////////////////
	},	
	
	"load_channel_list_info" : function(){		
		var url = gap.channelserver + "/api/channel/channel_info_list.km";
		var data = JSON.stringify({});
		$.ajax({
			type : "POST",
			dataType : "text",
			async : false,
			data : data,
			url : url,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(ress){
				var res = JSON.parse(ress);
				gap.cur_channel_list_info = res;
				
				var list = "";
				for (var i = 0 ; i < res.length; i++){
					var info = res[i];					
					if (typeof(info.type) != "undefined" && info.type == "folder"){
					}else{
						if (list == ""){
							list = info.ch_code;
						}else{
							list += "-spl-" + info.ch_code;
						}	
					}
				}
				gBody.select_channel_code_portlet = list;
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"show_portlet_channel" : function(layer){
		//현재 gap.cur_channel_list_info가 있으면 바로 사용하고 없으면 새로 로드해야 한다.
		$("#" + layer + " #portlet_news").empty();
		var channel_list = gBody.select_channel_code_portlet;
		if (typeof(channel_list) == "undefined" || channel_list == ""){
			gptl.load_channel_list_info();
		}
		
		var query = JSON.stringify({
			"channel_code" : gBody.select_channel_code_portlet,
			"query_type" : "allcontent",
			"start" : 0,
			"perpage" : 30,
			"q_str" : "",
			"dtype" : "",
			"type" : "1",
			"sort" : "1" //최신 수정일 순 : 1일 경우 컨텐츠 작성일 순
		});		
		
		var url = gap.channelserver + "/channel_list.km";
		$.ajax({
			type : "POST",
			dataType : "text",
			//async : false,
			data : query,
			url : url,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(ress){				
				$("#" + layer + " #channel_list").css({opacity:0})
				var res = JSON.parse(ress);
				gptl.draw_channel_data(res, layer);					
				gptl.set_scroll(layer, "portlet_news");			
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});			 
	},	
	
	"draw_channel_data" : function(res, layer){
		var html = "";		
		if (res.data == null){
			if (query_str != ""){							
			}
		}else{
			var list = res.data.data;							
			if (list.length == 0){
				var htm = "";
				htm += "<div style='text-align: center;color: #666;font-size: 13px;padding-top: 100px;'>";
				htm += '	<img style="display: block; margin: 0 auto;margin-bottom: 20px; width: auto;" src="' + cdbpath + '/img/empty.png" alt="" />';
				htm += gap.lang.nocontent;
				htm += "</div>";				
				$("#" + layer + " #portlet_news").html(htm);
				return false;
			}else{						
				for (var i = 0 ; i < list.length  ; i++){
					var item = list[i];
					var date = gap.change_date_localTime_only_date(item.GMT);
					var dis_date = gap.change_date_default(gap.change_date_localTime_only_date(item.GMT));
					var cnt = $("#" + layer + " #portlet_news #web_channel_dis_portlet_" + date).length;												
					var dis_id = "date_" + date;								
					var datehtml = "";
					if (cnt == 0){			
						datehtml += "<div class='content_list'>";
						datehtml += "	<div class='date_wrap'>";
						datehtml += "		<div class='date' id='web_channel_dis_portlet_"+date+"' data='"+date+"'>"+dis_date+"</div>";
						datehtml += "		</div>";
						datehtml += "   </div>";
						datehtml += "</div>";					
						var cnt = $("#" + layer + " #portlet_news .wrap-channel").length;
					//	if (cnt > 0){
							//기존에 날짜가 있는 경우
					//		$($("#portlet_news").children().first()).before(datehtml);
					//	}else{
							//기존에 날짜가 없는 경우
							$("#" + layer + " #portlet_news").append(datehtml);
					//	}
					}				
					var html = "";							
					var user_info = gap.user_check(item.owner);
					var name = user_info.name;
					var deptname = user_info.dept;
					var time = gap.change_date_localTime_only_time(item.GMT);
					var messagex = item.content;
					var message = gBody3.message_check(messagex);
					var is_editor = false;
					var editor_html = "";
					var channel_name = gap.textToHtml(item.channel_name);
					var channel_code = item.channel_code;
					if ( (typeof(item.editor) != "undefined") &&  (item.editor != "")){
						is_editor = true;
						editor_html = item.editor.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
						//message = message + editor_html;
						message = item.title;
					}	
					if (message.indexOf("&lt;/mention&gt;") > -1){
						//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
						message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
					}
					var dis_time = time;
					if (typeof(item.GMT2) == "undefined"){
						item.GMT2 = item.GMT;
					}
					if (item.GMT != item.GMT2){
						var GMT2 = gap.change_date_localTime_full2(item.GMT2);
						dis_time = time + " " + "(Created : " + GMT2 + ")";
					}							
					
					var docid = "";		
					if (item.direct == "T"){
						docid = item._id;
					}else{
						docid = item._id.$oid;
					}		
					
					var show_more = true;						
					html += "		<div class='talk'>";
					html += "			<div class='msg_wrap'>";
					html += "				<div class='balloon on' id='ball_"+docid+"' style='border:1px solid #d8d8d8'>";
					html += "					<div class='top'>";
					html += "						<span class='name'>";
					html += "							"+name+"";
					html += "							<em class='team'>"+deptname+"</em>";
					html += "							<em class='time'>"+time+"</em>";
					html += "						</span>";
					html += "						<span class='channel-name' data-code='"+channel_code+"'>"+channel_name+" ></span>";
					
					
					if (typeof(item.ex) != "undefined" && (item.ex.type == "meet")){	
						scheduleid = item.ex.scheduleid;
						html += "					<p style='line-height:25px;height:auto'>"+message+"<span class='meet_invite' data-id='"+item.ex.scheduleid+"' data-type='"+item.ex.meet_type+"'>"+gap.lang.meetdetail+"</span></p>" + "";
					}else{
						if (message != ""){
							if (is_editor){
								html += "						<p id='pclass_"+docid+"' style='font-weight:bold'>"+message+"";
								html += "						</p>";
							}else{
								html += "						<p id='pclass_"+docid+"'>"+message+"";
								html += "						</p>";
							}

						}
					}							
					if (is_editor){
						html += "						<div style='display:none' class='editor_dis'>" + editor_html + "</div>";
					}		
					
					
					if ((typeof(item.og) != "undefined") && (typeof(item.og.msg) != "undefined") ){		
						//og tag그리기
						var og = item.og.ex;
						show_more = false;
						if (typeof(og) != "undefined"){
							var imgurl = og.img;
							var title = og.tle;
							var url = og.lnk;
							var desc = og.desc;
							var dmn = og.dmn;
							if (typeof(og.dmn) == "undefined"){
								dmn = url;
							}										
							html += "<div class='link-content'>";
							html += "	<a href='"+url+"' target='_blank'>";									
							var im = gap.og_url_check(imgurl);										
							html += "	<div class='link-thumb'>"+im+"</div>";
							html += "	<ul style='list-style:none; margin-left:10px'>";
							html += "		<li class='link-title'>"+title+"</li>";
							html += "		<li class='link-summary'>"+desc+"</li>";
							html += "		<li class='link-site'>"+dmn+"</li>";
							html += "	</ul>";
							html += "	</a>";
							html += "</div>";
						}
					}												
					if (item.type == "file"){
//						if (!is_editor){
//							show_more = false;
//						}						
						var files = item.info;		
						var images = new Array();
						var normalfiles = new Array();									
						for (var j = 0 ; j < files.length; j++){
							var file = files[j];
							var isImage = gap.check_image_file(file.filename);
							if (isImage){
								images.push(file);
							}else{
								normalfiles.push(file);
							}
						}								
						
						var like_count = 0;							
						if (item.direct == "T"){
							docid = item._id;
						}else{
							docid = item._id.$oid;
							if (typeof(item.like_count.$numberLong) != "undefined"){
								like_count = item.like_count.$numberLong;
							}else{
								like_count = item.like_count;
							}
						}								
						if (images.length > 0){
							//이미지 파일인 경우
							html += "<div id='mfile_"+docid+"' class='tmpimagelist' >";
							for (var k = 0 ; k < images.length; k++){
								var image = images[k];
								var size = gap.file_size_setting(parseInt(image.file_size.$numberLong));
								var image_url = gap.search_file_convert_server(item.fserver) + "/FDownload_thumb.do?id=" + docid + "&md5="+image.md5+"&ty=2";									
								html += "			<div class='img-content' id='msg_file_"+ docid + "_" + image.md5.replace(".","_")+"'>";		
								html += "				<div class='img_thumb' data-filename='"+image.filename+"' style='background-image:url("+image_url+")'>";
								html += "				</div>";
								html += "			</div>";
							}
							html += "</div>";									
						}
						if (normalfiles.length > 0){
							//일반 파일일 경우 표시하기
							html += "			<ul class='message-file' style='list-style:none; justify-content:space-between'>";
							for (var p = 0 ; p < normalfiles.length; p++){
								var file = normalfiles[p];
								var ftype = gap.file_icon_check(file.filename);
								var size = gap.file_size_setting(parseInt(file.file_size.$numberLong));										
								var show_video = gap.file_show_video(file.filename);									
								html += "					<li class='portlet_file_li' id='msg_file_"+ docid + "_" + file.md5.replace(".","_")+"'>";
								html += "						<div class='chat-attach' style='display:flex; width: 100%'>";
								html += "							<div style='display:flex; padding : 8px; width:100%; max-width:100%'>";
								html += "								<span style='width:30px;height:30px;min-width:30px' class='ico ico-file "+ftype+"'></span>";
								html += "								<dl style='margin-left:20px; width:100%; max-width:calc(100% - 100px)'>";
								html += "									<dt data1='"+item.fserver+"' data2='"+item.upload_path+"' data3='"+file.md5+"' data4='"+item.ky+"' data5='"+file.file_type+"' data6='"+docid+"' data7='"+item.channel_code+"' data8='"+item.channel_name+"' title='"+file.filename+"'>"+file.filename+"</dt>";
								html += "									<dd>"+size+"</dd>";
								html += "								</dl>";										
								if (gBody3.check_preview_file(file.filename) || show_video){
									html += "								<button class='ico btn-file-view' title='"+gap.lang.preview+"'>미리보기</button>";
								}										
								html += "								<button class='ico btn-file-download' title='"+gap.lang.download+"'>다운로드</button>";
								html += "							</div>";
								html += "						</div>";
								html += "					</li>";
							}
							html += "				</ul>";
						}						
					}else if (item.type == "emoticon"){
						var epath = item.epath.replace("/mobile/dsw/wm.nsf",".");
						html += "                   <div class='img-thumb2'><img style='width:150px' src='" +epath+"'></div>";
					}else if (typeof(item.ex) != "undefined"){					
						if (item.ex.type == "channel_meeting"){
							var _meet = item.ex;							
							scheduleid = item.ex.scheduleid;							
							html += '<div class="top" style="margin-top:15px">';
							html += '   <div class="req_box" style="display:flex" data-url=\'' + _meet.meetingurl + '\'>';
							html += '   		<div class="req_left" style="width:500px; display:flex">';
							html += '   			<div class="req_icon" style="background-position:-439px -389px; width:62px; border-radius:20px"></div>';
							html += '           		<div class="req_info" style="padding:0px; max-width:350px">';							
							html += " 							<h3>"+ gap.lang.call_attend +"</h3>";
							html += '           			<h3>미팅 번호 (Meeting Number) : ' + _meet.meetingkey + '<br> 호스트 키 (Host Key) : '+_meet.hostkey+' </h3>';							
							html += '           		</div>';
							html += '   		</div>';
							html += '   		<button type="button" class="req_btn" data-type="channel_meeting" style="margin-right:10px;position:relative;left:calc(50% - 60px)">'+gap.lang.notice_attend+'</button>';
							html += '   </div>';
							html += '</div>';
						}else if (item.ex.type == "aprv"){
							var _aprv = item.ex;
							var adate = _aprv.pubdate;							
							html += '<div class="top" style="margin-top:15px">';
							html += '   <div class="req_box" style="display:flex" data-url=\'' + _aprv.link + '\'>';
							html += '   		<div class="req_left" style="width:500px; display:flex">';
							html += '   			<div class="req_icon" style="background-position: -60px -414px; width:62px; border-radius:20px"></div>';
							html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
							html += '           			<h3>' + _aprv.title + '</h3>';
							html += '						<span class="req_txt">Date : '+adate+'</span>';
						//	html += '           			<span class="req_txt">' + _aprv.comment + '</span>';
						//	html += '           			<time>' + _vote.end_date + ' ' + _vote.end_time + ' 까지</time>';
							html += '           		</div>';
							html += '   		</div>';
							html += '   		<button type="button" class="req_btn" data-type="aprv" style="margin-right:10px;position:relative;left:calc(50% - 60px)">'+gap.lang.openNewWin+'</button>';
							html += '   </div>';
							html += '</div>';
						}else if (item.ex.type == "bbs"){
							var _bbs = item.ex;							
							//대상정보에서 GMT값 사용하지 않는다고 해서 그냥 예외처리 한다.
							//var date = moment(_bbs.pubdate).utc().format("YYYY-MM-DD hh:mm");
							var bdate = _bbs.pubdate;
							
							html += '<div class="top" style="margin-top:15px">';
							html += '   <div class="req_box" style="display:flex" data-url=\'' + _bbs.link + '\'>';
							html += '   		<div class="req_left" style="width:500px; display:flex">';
							html += '   			<div class="req_icon" style="background-position: -340px -388px; width:62px; border-radius:20px"></div>';
							html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
							html += '           			<h3>' + _bbs.title + '</h3>';
							html += '						<span class="req_txt">Date : '+bdate+'</span>';
							html += '           		</div>';
							html += '   		</div>';
							html += '   		<button type="button" class="req_btn" data-type="bbs" style="margin-right:10px;position:relative;left:calc(50% - 60px)">'+gap.lang.openNewWin+'</button>';
							html += '   </div>';
							html += '</div>';
						}else if (item.ex.type == "vote"){
							var _vote = item.ex;
							var _info = {
									"key" : _vote.key,
									"title" : _vote.title,
									"comment" : _vote.comment,
									"endtime" : _vote.end_date + ' ' + _vote.end_time,
									"anonymous" : _vote.anonymous_vote,
									"multi" : _vote.multi_choice,
									"owner" : item.ky
							};
							
							html += '<div class="top" style="margin-top:15px">';
							html += '   <div class="req_box" style="display:flex" data-vote=\'' + JSON.stringify(JSON.stringify(_info)) + '\'>';
							html += '   		<div class="req_left" style="width:500px; display:flex">';
							html += '   			<div class="req_icon" style="width:62px; border-radius:20px"></div>';
							html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
							html += '           			<h3>' + _vote.title + '</h3>';
							html += '           			<span class="req_txt">' + _vote.comment + '</span>';
							html += '           			<time>' + _vote.end_date + ' ' + _vote.end_time + ' 까지</time>';
							html += '           		</div>';
							html += '   		</div>';
							html += '   		<button type="button" class="req_btn" data-type="vote" style="margin-right:10px;position:relative;left:calc(50% - 60px)">'+gap.lang.vote+'</button>';
							html += '   </div>';
							html += '</div>';
						}else if (item.ex.type == "todo"){
							var xinfo = item.ex;							
							var ux = gap.user_check(xinfo.owner);  //나중에 asign.pu로 변경해야 한다.
							var asign_img = gap.person_profile_photo(ux);							
							var member_name = ux.name;
							var dept = ux.dept;
							var email = ux.email;
							var jt = ux.jt;							
							var todo_item_id = xinfo._id.$oid;						
					//		html += gap.lang.newtodo;							
							html += '<div class="top" style="margin-top:15px">';
							html += '   <div class="req_box"  style="display:flex" data-url=\'' + todo_item_id + '\'>';
							html += '   		<div class="req_left" style="width:500px; display:flex">';
							html += '   			<div class="req_icon" style="background-position: -111px -414px; width:62px; border-radius:20px"></div>';
							html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
							html += '           			<h3>['+xinfo.project_name+'] '+xinfo.title+'</h3>';
							html += "						<div class='user-chat f_middle' style='padding:0px'>";
							html += "							<div clss='p_file_info' style='margin-left:0px'>";
							html += "								<span class='p_file_name'>"+member_name+ gap.lang.hoching + "</span>";
							html += "								<span class='p_file_time'>"+jt+" / "+dept+"</span>";
							html += "							</div>";						
							html += '           			</div>';
							html += '           		</div>';
							html += '   		</div>';
							html += '   		<button type="button" class="req_btn xtodo" data-type="todo" style="margin-right:10px;position:relative;left:calc(50% - 60px)">'+gap.lang.openNewWin+'</button>';
							html += '   </div>';
							html += '</div>';						
						}else if (item.ex.type == "mail"){
							var from = item.ex.sender;
							if (from == ""){
								from = "None";
							}
							var title = item.ex.title;							
							var tunid = item.ex.target_unid;
							var tdb = item.ex.target_db;
							var mdate = "";							
							if (typeof(item.ex.date) != "undefined"){
								mdate = item.ex.date;
							}							
							if (typeof(item.ex.attach) != "undefined"){
								var attach_list = item.ex.attach.split("*?*");
								var attach_size = item.ex.attachsize.split("*?*");
								var target_server = item.ex.target_server;
								var acount = 0;
								if (item.ex.attach != ""){
									acount = attach_list.length;
								}							
								html += "<div class='chat-mail' style='margin-top:15px'>";
								html += '<div class="top" style="width:100%">';
								html += '   <div class="req_box" style="display:flex; border:0px">';
								html += '   		<div class="req_left" style="width:500px; display:flex">';
								html += '   			<div class="req_icon" style="background-position: -9px -413px; width:62px; min-width:63px; border-radius:20px"></div>';
								html += '           		<div class="req_info" style="padding:0px;  max-width:350px">';
								html += '           			<h3>' + title + '</h3>';
								if (mdate != ""){
									html += '						<span class="req_txt">'+from+ ' / ' + mdate +'</span>';
								}else{
									html += '						<span class="req_txt">'+from +'</span>';
								}
								
								html += '           		</div>';
								html += '   		</div>';
								html += '   		<button type="button" class="req_btn" data-type="mail" data-t1="'+tunid+'" data-t2="'+tdb+'" data-t3="'+target_server+'" style="margin-right:10px;position:relative;left:calc(50% - 60px)">'+gap.lang.openNewWin+'</button>';
								
								if (acount > 0){
									html += "	<div class='mail-attach-list' style='border-radius:0px'>";
									html += "		<button class='ico btn-fold' style='width:14px; height:14px'>접기</button> <!-- 클릭 시 .on 클래스 토글 -->";
									html += "		<h4>"+gap.lang.attachment+" <span>"+acount+"</span></h4>";
									html += "		<ul style='list-style:none'>";									
									for (var ii = 0 ; ii < attach_list.length ; ii++){
										var attname = gap.textToHtml(attach_list[ii]);
										var attsize = attach_size[ii];
										var icon = gap.file_icon_check(attname);
										var target_server = item.ex.target_server;										
										html += "			<li data-target='"+target_server+"' data-tunid='"+tunid+"' data-attname='"+attname+"' data-tdb='"+tdb+"' onclick=\"gBody3.mail_file_down2(this)\">";
										html += "				<span class='ico ico-attach "+icon+"' style='width:14px; height:14px;border-radius:0px;position:absolute'></span>";
										html += "				<span style='padding-top:4px'>"+attname+"</span> <em style='padding-top:4px'>("+gap.file_size_setting(attsize)+")</em>";
										html += "			</li>";
									}
									html += "		</ul>";
									html += "	</div>";
								}				
								html += '   </div>';							
								html += '</div>';									
								html += '</div>';							
							}
						}
					}					
					var reply_count = 0;					
					if (typeof(item.reply) != "undefined" && item.reply.length > 0){
						reply_count = item.reply.length;
					}
					var like_count = 0;				
					if (typeof(item.like_count) != "undefined" && parseInt(item.like_count.$numberLong) > 0){
						like_count = item.like_count.$numberLong;
					}
					html += "					</div>";
					html += "					<div class='bot f_between' style='padding:10px 5px 2px 5px'>";
					html += "						<div style='display:inline-block;'>";
					html += "							<span style='margin-right:5px'>";
					html += "								<span class='ico ico-textball'></span>";
					html += "								<span>"+reply_count+"</span>";
					html += "							</span>";
					html += "							<span>";
					html += "								<span class='ico ico-like' onclick=\"gBody3.like_channel_data('"+docid+"','"+item.email.toLowerCase()+"')\"></span>";
					html += "								<span class='like-btn' id='like_"+docid+"'>"+like_count+"</span>";
					html += "							</span>";
					html += "						</div>";
					if (show_more){
						html += "						<button class='more' data-position='up' data-editor='"+is_editor+"' id='exp_"+docid+"'>";
						html += "							<span>"+gap.lang.ex+"</span><img src='img/icon/ico_arrow_prev_b.png'>";
						html += "						</button>";
					}
					html += "					</div>";				
					var replylists = item.reply;
					if (typeof(replylists) != "undefined"){
						if (item.reply.length > 0){
							html += "<span class='fold-btns repdis'>";
							html += "	<button class='btn-reply-expand' data='"+docid+"'><span>"+gap.lang.reply + " " + gap.lang.ex+"</span> (<span id='rcount_"+docid+"'>"+replylists.length+"</span>)</button>";
							html += "</span>";						
						}
					}	
					html += gptl.draw_reply(item);						
					html += "				</div>";					
					html += "			</div>";		
					html += "		</div>";					
					$("#" + layer + " #portlet_news #web_channel_dis_portlet_"+date).append(html);					
					if (is_editor){
						$("#" + layer + " #portlet_news table").css("width", "auto");
					}	
					
					//펼치기 버튼 숨김 처리 하기
					var pheight = $("#" + layer + " #pclass_" + docid).height();
					if (pheight > 25){						
						$("#" + layer + " #ball_"+docid).removeClass("on");
						$("#" + layer + " #exp_" + docid).show();
					}else{
						var ix = $("#" + layer + " #exp_" + docid).parent().prev().find(".editor_dis");
						if (ix.length > 0){
							$("#" + layer + " #ball_"+docid).removeClass("on");
						}else{
							$("#" + layer + " #exp_" + docid).hide();
						}						
					}							
				}		
				//이벤트 등록하기
				gptl.event_and_option(layer);
			}					
		}
	},
	
	
	"draw_reply" : function(item){		
		var html = "";
		var uinfo = gap.userinfo.rinfo;	
		var replylists = item.reply;
		if (typeof(replylists) != "undefined"){
			if (replylists.length > 0){				
				var docid = "";
				
				if (item.direct == "T"){
					docid = item._id;
				}else{
					docid = item._id.$oid;
				}					
				html += "<div class='wrap-channel'>";
				html += "<div class='message-reply' id='reply_group_"+docid+"' style='display:none;'>";								
				for (var k = 0 ; k < replylists.length; k++){
					var info = replylists[k];
				//	var user_photo = info.owner.pu;
					var user_photo = gap.person_profile_photo(info.owner);
					var user_info = gap.user_check(info.owner);
					var name = user_info.name;
					var content = info.content;					
					var time = gap.change_date_localTime_full2(info.GMT);
					var message = gBody3.message_check(info.content);					
					if (message.indexOf("&lt;/mention&gt;") > -1){
						//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
						message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
					}					
					if (message == ""){
						message = "&nbsp;";
					}				
					html += "<dl id='mreplay_"+info.rid+"' >";
					html += "	<dt>";
					html += "		<div class='user' style='left:10px;'>";
					html += "			<div class='user-thumb showorg' data='"+info.owner.ky+"'>"+user_photo+"</div>";
					html += "		</div>";
					html += "	</dt>";
					html += "	<dd style='padding-left:5px'>";
					html += "		<span>"+user_info.disp_user_info+"<em>"+time+"</em></span>";				
					html += "		<p style='font-weight:400'>"+message+"</p>";
					html += "	</dd>";					
					var ppinfo = info;
					ppinfo.upload_path = item.upload_path;
					ppinfo.fserver = item.fserver;
					ppinfo.owner_ky = item.owner.ky;			
					html += gptl.file_infos_draw(ppinfo);					
					/////////////////////////////////////////////////////////					
					html += "</dl>";			
				}
				html += "</div>";
				html += "</div>";
			}
		}		
		return html;
	},
	
	"file_infos_draw" : function(info){
		var html = "";
		if (typeof(info.file_infos) != "undefined"){
			html += "<div class='reply-filelist' style='padding-top:0px;padding-bottom:0px;margin-left:35px'>";
			html += "	<div class='chat-attach' id='reply_att_"+info.rid+"' style='padding-top:0px; padding-bottom:0px'>";
			for (var p = 0 ; p < info.file_infos.length; p++){
				var finfo = info.file_infos[p];			
				var fname = finfo.filename;
				var ext = gap.file_icon_check(fname);						
				var size = gap.file_size_setting(finfo.file_size);
				if (typeof(finfo.file_size.$numberLong) != "undefined"){
					size = gap.file_size_setting(finfo.file_size.$numberLong);
				}
				var title = fname + "(" + size + ")";				
				var rpath = info.rid.split("_");
				var rpath2 = rpath[1] + "_" + rpath[2];				
				var upload_path = info.upload_path + "/reply/" + rpath2;
				var md5 = finfo.md5;
				var ty = finfo.file_type;				
				var email = "";
				if (typeof(info.owner_ky) != "undefined"){
					email = info.owner_ky;
				}				
				var id = info.rid;
				var fserver = info.fserver;			
				html += "		<div class='reply-file' style='width:100% !important; padding:0px 0px 0px 5px' data1='"+fserver+"' data2='"+upload_path+"' data3='"+md5+"' data4='"+email+"' data5='"+ty+"' data6='"+id+"' data7='"+fname+"'>";
				html += "			<span class='ico ico-file "+ext+"' style='scale:75%;width:30px;height:30px'></span>";
				html += "			<p style='padding-left:40px;padding-right:70px;position:absolute;top:11px;left:10px;' title='"+title+"'>"+fname+ " (" +  size +")" +"</p>";
				html += "			<button class='ico btn-file-view' title='미리보기'>미리보기</button>";
				html += "			<button class='ico btn-file-download' title='다운로드'>다운로드</button>";
				html += "		</div>";
			}	
			html += "	</div>";
			html += "</div>";		
		}				
		return html;
	},

	
	"event_and_option" : function(layer){		
		// 댓글 UI를 제외한 에디터 상에서 사용하는 Div는 일괄적으로 width를 auto 처리 (웹에디터에서 div width가 강제로 지정된 경우는 Div 안의 이미지에 대한 자동 너비 처리가 안됨)
		// 즉 div를 800px로 하고 그 안의 이미지를 max-width : 100%하면 800px의 100%가 되기 때문에 모바일에서 이미지 너비가 잘려보임
	//	$("#portlet_news.editor div:not([class])").width("auto"); 
		$("#" + layer + " #portlet_news img").css("max-width", "98%");
		$("#" + layer + " #portlet_news img").css("height", "auto"); // height auto를 주지 않으면 이미지 너비만 줄이므로 이미지가 깨져보임		
		$("#" + layer + " #portlet_news .fold-btns.repdis").off().on("click", function(e){
			var target = $(this).children().first();
			var tid = target.attr("data");
			var rcount = $("#" + layer + " #portlet_news #reply_group_" + tid + " dl").length;
			if (target.hasClass("btn-reply-fold")){	
				target.removeClass("btn-reply-fold");
				target.addClass("btn-reply-expand");	
				target.find("span").first().text(gap.lang.reply + " " + gap.lang.ex);
				target.find("span").first().next().text(rcount);
				$("#" + layer + " #portlet_news #reply_group_"+tid).fadeOut();				
			}else{
				target.removeClass("btn-reply-expand");
				target.addClass("btn-reply-fold");
				target.find("span").first().text(gap.lang.reply + " " + gap.lang.fold);
				target.find("span").first().next().text(rcount);
				$("#" + layer + " #portlet_news #reply_group_"+tid).fadeIn();
			}
		});		
		
		$("#" + layer + " .user .user-thumb.showorg").off().on("click", function(e){	
			gBody.click_img_obj = this;	  
			var uid = $(this).attr("data");
			gap.showUserDetailLayer(uid);
		});
		
		$("#" + layer + " #portlet_news .like-btn").off().on("click", function(e){	
			gBody3.popup_like_person(e);			
		})
		
		$("#" + layer + " #portlet_news .more").off().on("click", function(e){			
			var tobj = $(e.currentTarget);
			var pos = tobj.data("position");
			var obj = tobj.parent().parent();
			var is_editor = tobj.data("editor");
			if (pos == "up"){				
				var objcls = obj.attr("class");
				if (objcls == "balloon"){
					//펼치기 할때 호출
					$(obj).addClass("on");
					tobj.find("span").text(gap.lang.fold);
					if (is_editor){
						tobj.parent().prev().find(".editor_dis").fadeIn();
					}
				}else{
					var objcls = obj.attr("class");				
					$(obj).removeClass("on");
					tobj.find("span").text(gap.lang.ex);					
					if (is_editor){
						//에디터로 작성된 항목은 별도로 열고 닫고 처리한다.
						tobj.parent().prev().find(".editor_dis").fadeOut();
					}
				}
			}
		});
		
		$("#" + layer + " #portlet_news .img_thumb").off().on("click", function(e){
			//이미지 직접 클릭해서 미리보기 전체 창으로 띄우기
			var url = $(this).css("background-image").replace(/^url\(['"](.+)['"]\)/, '$1');
			url = url.replace("_thumb.do",".do");			
			var title = $(this).data("filename");	
			//이미지 리스트를 등록한다.			
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;
			var image_list = $(this).parent().parent().find("img");
			if (image_list.length > 0){				
				var k = 1;
				for (var i = 0 ; i < image_list.length; i++){
					var image_object = new Object();
					var image_info = image_list[i];
					var turl = $(image_info).attr("src").replace("_thumb.do",".do");
					image_object.title = $(image_info).attr("data");
					image_object.url = turl;
					image_object.sort = k;
					
					gap.image_gallery.push(image_object);
					if (turl == url){
						gap.image_gallery_current = k;
					}
					k++;
				}
			}			
			gap.show_image(url, title);
		});
		
		$("#" + layer + " #portlet_news .btn-file-view").off().on("click", function(e){
			e.preventDefault();			
			//일반 파일 미리 보기 클릭 한  경우				
			var citem =  "";			
			var filename = "";
			var fserver ="";
			var upload_path = "";
			var md5 = "";
			var email = "";
			var ty = "";
			var id = "";		
			var is_reply_att = false;			
			if ($(e.currentTarget).parent().attr("class") == "reply-file"){
				is_reply_att = true;
				var citem =  $(this).parent();		
				filename = citem.attr("data7");
				fserver = citem.attr("data1");
				upload_path = citem.attr("data2");
				md5 = citem.attr("data3");
				email = citem.attr("data4");
				ty = citem.attr("data5");
				id = citem.attr("data6");				
			}else{
				//일반 파일 미리 보기 클릭 한  경우				
				var citem =  $(this).parent().find("dt");			
				filename = citem.text();
				fserver = citem.attr("data1");
				upload_path = citem.attr("data2");
				md5 = citem.attr("data3");
				email = citem.attr("data4");
				ty = citem.attr("data5");
				id = citem.attr("data6");
			}
			var ext = gap.is_file_type_filter(filename);
			if (ext == "movie"){				
				//PC에서 재생되는 확장자 인지  확인 한다.
				if (gap.is_file_preview_mobile(filename)){
					gap.gAlert(gap.lang.not_support);
					return false;		
				}			
				var url = gap.search_file_convert_server(fserver) + "/FDownload.do?id=" + id + "&ty=2&md5=" + md5;							
				gap.show_video(url, filename);	
				return false;							
			}else{
				var id = "";
				var ft = "";
				var px = "2";
				if (is_reply_att){
					id = id;
					ft = ty;
					px = "reply"
				}else{
					id = $(this).parent().find("dl dt").attr("data6");
					ft = $(this).parent().find("dl dt").attr("data5");
					
				}		
				var obj = new Object();
				obj.id = id;
				obj.md5 = md5;
				obj.ty = "2";
				obj.filename = filename;
				obj.fserver = fserver;
				gBody3.click_file_info =  obj;				
				var fs = gap.server_check(fserver);				
				gBody3.file_convert(fs, filename, md5, id, px, ft, email, upload_path);						
			}		
			return false;
			
		});
		
		$("#" + layer + " #portlet_news .btn-file-download").off().on("click", function(e){
			//일반 파일 다운로드 클릭한 경우			
			var is_reply_att = false;			
			var citem = "";
			var filename = "";
			var pty = "2";
			var email = "";
			if ($(e.currentTarget).parent().attr("class") == "reply-file"){
				citem =  $(e.currentTarget).parent();	
				filename = citem.attr("data7");
				email = citem.attr("data4");
				pty = "reply";
			}else{
				citem =  $(this).parent().find("dt");				
				filename = citem.text();				
				email = citem.attr("data4");
			}
			var fserver = citem.attr("data1");
			var upload_path = citem.attr("data2");
			var md5 = citem.attr("data3");			
			var ty = citem.attr("data5");
			var id = citem.attr("data6");				
			var ky = gap.userinfo.rinfo.ky;		
			var download_url = gap.search_file_convert_server(fserver) + "/FDownload.do?id=" + id + "&ty="+pty+"&md5=" + md5 + "&ky="+ky;				
			gap.file_download_normal(download_url, filename);			
			return false;
		});
		
		$("#" + layer + " #portlet_news .channel-name").off().on("click", function(e){
			var channel_code = $(e.currentTarget).data("code");			
			gptl.goto_channel(channel_code);
		});
		
		$("#" + layer + " #portlet_news .meet_invite").off().on("click", function(e){
			//채널에서 화의실 연동해서 자동 넘어온 회의실 정보를 표시하는 함수
			var key = $(e.currentTarget).data("id");
			var type = $(e.currentTarget).data("type");
			gMet.showMeetingDetailLayer(type, key);
		});
		
		$("#" + layer + " #portlet_news .req_box .req_btn").off().on("click", function(){			
			var _vote = $(this).parent().data("vote");
			var type = $(this).data("type");			
			if (type == "vote"){
				gBody3.response_vote(_vote);
			}else if (type == "aprv"){
				var link = $(this).parent().data("url");
				gap.open_subwin(link, "1240","760", "yes" , "", "yes");	
			}else if (type == "bbs"){
				var link = $(this).parent().data("url");
				gap.open_subwin(link, "1240","760", "yes" , "", "yes");	
			}else if (type == "channel_meeting"){
				var auth = gap.get_auth();
				var link = $(this).parent().data("url");
				link = link + "&auth=" + auth;
				window.open(link, null);
			}else if (type == "todo"){
				var id = $(this).parent().data("url");
				gTodo.todo_show_other_app(id);
			}else if (type == "mail"){
				var id = $(this).data("t1");
				var tdb = $(this).data("t2");
				var tserver = $(this).data("t3");
				gBody4.openMail(id,'body', tdb, tserver);
			}			
		});
	},
	
	"show_portlet_mail" : function(layer){
		
		var url = "/"+maildbpath+"/XML_Inbox?ReadViewEntries&start=1&count=30&ResortDescending=4&KeyType=time&outputformat=json&TZType=GMT&charset=utf-8&"+new Date().getTime()
		$.ajax({
			type : "GET",
			url : url,
			contentType : "application/json; charset=utf-8",
			success : function(res){
				var items = res.viewentry;
				var html = "";
				html += "<div class='content_list' style='padding-right:10px'>";
				html += "	<ul class='mail_wrap'>";
				
				for (var i = 0 ; i < items.length ; i++){					
					var item = items[i];
					var unid = item["@unid"];
					var data = item.entrydata;
					var read = item.entrydata[11].text[0];
					var att = item.entrydata[9].text[0];
					var subject = item.entrydata[3].text[0];
					//스타일이 flex로 잘못 되어 어쩔수 없다.
					if (subject.length > 40){
						subject = subject.substring(0,35) + "...";
					}
					var size = gap.file_size_setting(item.entrydata[5].number[0] * 1024);
					
					var date = gap.convertGMTLocalDateTime_new(item.entrydata[4].datetime[0]);
					var name = item.entrydata[2].text[0].split("-=spl=-")[0];					
				
					if (read == "1"){
						html += "		<li data-unid='"+unid+"' data-read='"+read+"'>";
					}else{
						html += "		<li class='unread' data-unid='"+unid+"' data-read='"+read+"'>";
					}					
					html += "			<div class='text_wrap' >";				
					html += "				<div class='title_wr'>";					
					html += "					<div class='ico_wr'>";					
					if (read == "1"){						
						html += "						<img src='img/icon/mail/ico_read.png' />";
					}else{
						html += "						<img src='img/icon/mail/ico_unread.png' />";
					}
					if (att != ""){
						html += "						<img src='img/icon/mail/ico_attach.png' />";
					}					
					html += "					</div>";
					
					html += "					<div class='subject_wr'>";
					html += "						<p class='name'>"+name+"</p>";
					html += "						<p class='subject'>"+subject+"</p>";
					html += "					</div>";
					html += "				</div>";
					html += "				<div class='date_wr'>";
					html += "					<p class='date'>"+date+"</p>";
					html += "					<p class='size'>"+size+"</p>";
					html += "				</div>";
					html += "			</div>";
					html += "		</li> ";
				}				
				html += "	</ul>";
				html += "</div>";
				
				$("#" + layer + " #portlet_news").html(html);  
				gptl.set_scroll(layer, "portlet_news");
								
				$("#" + layer + " #portlet_news li").off().on("click", function(e){
					var unid = $(e.currentTarget).data("unid");
					var read = $(e.currentTarget).data("read");
					if (read == ""){
						//읽음 처리한다.
						$(e.currentTarget).removeClass("unread");
						$(e.currentTarget).find("img").attr('src', "img/icon/mail/ico_read.png");
						//읽음 건수 처리한다.
						gptl.mail_read_event_send();
					}
					var max_idx = gap.maxZindex();
					$('#' + layer + ' #open_mail').css({'zIndex': parseInt(max_idx) + 1}).fadeIn();	
					//gBody4.draw_mail_content(unid, "list", "", "");	
					gBody4.openMail(unid,"list","","");
				});				
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});	     
	},
	
	"mail_read_event_send" : function(){
		var url = location.protocol + '//' + location.host + "/noti/sendnoti";		
    	var obb = new Array();
		obb.push(gap.userinfo.rinfo.ky);			
		var data = JSON.stringify({		
			"id" : "unread_mail_check",
			"ty" : "",
			"r" : obb,
			"ft" : [10,15,20],
			"body" : ""
		});	
		$.ajax({
			type : "POST",
			dataType : "json",
			url : url,
			data : data,
			beforeSend : function(xhr){
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
			},
			error : function(e){
				
			}
		});		
	},	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////// Util성 함수 ///////////////////
	"goto_channel" : function(code){
		gap.move_channel_list(code);		
	},	
	
	"prev" : function(){
		var left = $("#channel_top_carosel").scrollLeft() - 300;
		$("#channel_top_carosel").animate({
			scrollLeft: left
		}, 500);
	},
	
	"next" : function(){
	
		var right = $("#channel_top_carosel").scrollLeft() + 300;
		$("#channel_top_carosel").animate({
			scrollLeft: right
		}, 500);	
	},
	
	"set_scroll" : function(parent, layer){		
		try{
			!!$("#" + parent + " #"+layer).data("mCS") && $("#" + parent + " #"+layer).mCustomScrollbar("destroy"); //Destroy
		}catch (e){
			$("#" + parent + " #"+layer).data("mCS",''); //수동제거
		}
		$("#" + parent + " #" + layer).mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable:false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : true
		});			
	},
	
	// 포틀릿에 연결된 버튼 이벤트 처리
	"call_portlet_config" : function(p_id, el){
		if (p_id == 'portlet_menu') {
			gBody.show_app_setting('portlet', el);
		}
	},
	
	"call_portlet_refresh" : function(p_id, el_id){
		gptl[p_id](el_id);
	},
	
	"mainGuideView" : function(opt){
		var fserver = gap.channelserver;
		var fname = "";
		var md5 = "";
		var upload_path = "";
		if (opt == "ko"){
			if (gap.isDev){			
				fname = "1-3. DSW 메인 사용설명서_230904.pdf";
				md5 = "c2740bcd2de83b881b482bcd310c60ac.1593213";
				upload_path = "6360a15ef024c328015a8585";
			}else{
				fname = "1-3. DSW 메인 사용설명서.pdf";
				md5 = "219711fb16abfb8912d943f0e2d36136.1593879";
				upload_path = "6360a2610e1bf27e3b62e18e";
			}
		}else{
			if (gap.isDev){			
				fname = "1-3. How to use DSW Main.pdf";
				md5 = "81626f4ecea6f38b4ae2ad42e45f8c12.1446667";
				upload_path = "6360a15ef024c328015a8585";
			}else{
				fname = "1-3. How to use DSW Main.pdf";
				md5 = "81626f4ecea6f38b4ae2ad42e45f8c12.1446667";
				upload_path = "6360a2610e1bf27e3b62e18e";
			}
		}
		
		gBody3.file_convert(fserver, fname, md5, '', 'manual', '', '', upload_path);
	}
}