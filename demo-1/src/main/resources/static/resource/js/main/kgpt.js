
function gKGPT(){
	this.source = new Array();	
	this.kgpt_url = "https://kgpt.kmslab.com:5002/completion2";
	this.trans_url = "https://kgpt.kmslab.com:5001/trans";
	this.plugin_url = "https://kgpt.kmslab.com:5003/plugin";	
	
	this.assistant = [];
	this.msgs = [];
	this.chat_history = [];
	this.my_plugin_list_temp = [];
}

gKGPT.prototype = {		
	"init" : function(){
		//내가 기존에 저장한 plugin정보를 가져와서 등록한다.
		gkgpt.my_install_plugin_list();
	},
	
	"search_code" : function(msg){

		var postData = {"msg" : msg};		
		$.ajax({
			crossDomain: true,
			type: "POST",
			url : gkgpt.plugin_domain_fast + "base/search_code",
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.res.length > 0){
					alert(res.res);
				}else{
					alert("등록된 플러그인이 없어 그냥 호출해야 한다.");
				}					
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},
	
	
	
	
	"chatgpt_call" : function(msg){		
		var pre_msgs = $(".me .xgptcls");
		var pre_msg = "";
		if (pre_msgs.length > 0){
			for (var k = 0 ; k < pre_msgs.length; k++){
				if (pre_msg == ""){
					pre_msg = $(pre_msgs[k]).text().replaceAll("\t", "");
				}else{
					pre_msg += "-spl-" + $(pre_msgs[k]).text().replaceAll("\t","");
				}
			}
		}
		msg = msg.trim();
		if (msg.trim() == ""){
			gap.gAlert(gap.lang.input_message);
			return false;
		}
		$("#message_txt").css("height", "38px");
		var date = gap.search_today_only2();
		var time = gap.search_time_only();	
		var bun = date + time.replace(":","");			
		var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.
		var opt = "me";
		var name = gap.userinfo.rinfo.nm;
		var key = gap.userinfo.rinfo.ky;		
		//나의 메시지를 화면에서 표시한다.
		if (gma.chat_position == "popup_chat"){
			gBody.chat_draw(opt, name, msg, date, time, "msg", bun, key, msgid, "", "D", "1", "" , "", "", "popup", gma.cur_cid_popup, "");	
		}else{
			gBody.chat_draw(opt, name, msg, date, time, "msg", bun, key, msgid, "", "D", "1", "" , "", "", "chat", gBody.cur_cid, "");	
		}
				
		//번역이 필요한 경우 텍스트를 번역한다.		
		if (gBody.trans_lang != ""){
			gBody.ori_msg = msg;
			var surl = gkgpt.trans_url;
			var postData = JSON.stringify({
					"word" : msg,
					"lang" : gBody.trans_lang
				});			
			gap.show_loading(gap.lang.gpt4);
			$.ajax({
				type : "POST",
				url : surl,
			//	dataType : "json",
				contentType : "application/json; charset=utf-8",
				data : postData,
				success : function(res){
					var obb = $("#msg_"+msgid);
					var cnn = obb.find(".trans_gap").length;
					if (cnn == 0){	
						var tmsg = "";
						var tx = "";	
						if (typeof(res.result) != "undefined"){									
								tmsg = res.result;
								tx = gBody.trans_lang;								
								var html = "<span class='trans_gap'><span class='trans_me2'>"+ tx + "</span> " + tmsg+"</span>";
								obb.append(html);								
								gap.scroll_move_to_bottom_time("chat_msg", 1);
								gap.hide_loading();								
								tmsg = gBody.ori_msg + "^^translate^^" + tmsg;								
								gkgpt.chatgpt_call_draw(tmsg, pre_msg);							
						}		
					}
				},
				error : function(e){
					gap.gAlert("연결중 오류가 발생하였습니다.");
					gap.hide_loading();
					return false;					
				}
			});				
		}else{
			gkgpt.chatgpt_call_draw(msg, pre_msg);
		}	
	},	
	
	"delete_plugin_view" : function(){
		gkgpt.plugin = false;
		$("#chat_msg_dis").empty();
		gkgpt.chat_history = [];
		gkgpt.chatgpt_greeting();
	},
	
	"chatgpt_call_draw" : function(msg, xpre_msg){		
		if (gkgpt.plugin){
			//plugin 일 경우 여기로 호출된다.			
				var dis= moment.utc(new Date()).local().format('YYYY-MM-DD');
				var nextMonday = moment().day(8).format("YYYY-MM-DD");
				if (gkgpt.disdate != "T"){
					msg = "오늘은 " + dis + "입니다." + msg;
					//msg = "오늘은 " + dis + "입니다." + "다음주 월요일은 " + nextMonday +"입니다 " + msg;
				}				
				
				gkgpt.chat_history.push(msg);	
				if (gkgpt.chat_history > 10){
					console.log("10개 이상 배열이라 앞에 2개 정리한다.")
					gkgpt.chat_history.slice(2);
				}
				var data = JSON.stringify({
					"user" : gap.userinfo.rinfo.nm,
					"word" : msg,
					"chat_history" : gkgpt.chat_history.join("-=spl=-")
				});				
				var pre_msg = gap.lang.gpt3 + ".....";
				gap.show_loading(pre_msg);								
				$.ajax({
					type : "POST",
					contentType : "application/json; charset=utf-8",
					crossDomain: true,
					url : gkgpt.plugin_url,
					data : data,
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success : function(res){
						gap.hide_loading();						
						console.log(res);
						var datedis = res.status["수집한정보"]["예약일자"];
						var info_date = "";
						if (typeof(datedis) != "undefined"){
							gkgpt.disdate = "T";
							info_date = datedis;
						}
						var info_time = "";
						var distime = res.status["수집한정보"]["예약시간"];
						if (typeof(distime) != "undefined"){
							info_time = distime;
						}
						var info_att = "";
					
						var att = res.status["수집한정보"]["회의참석자이름"];
						if (typeof(att) != "undefined"){
							info_att = att;
							if (!$.isArray(att)){
								info_att = [att];
							}
						}
						gkgpt.chat_history.push(JSON.stringify(res));						
						var date = gap.search_today_only2();
						var time = gap.search_time_only();	
						var bun = date + time.replace(":","");							
						var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.
						var opt = "you";
						var name = gap.lang.gptname;
						var key = "chatgpt";						
						pre_msg = res.speak;
						
						if (info_date != "" && info_time != "" && info_att != ""){
							//pre_msg = pre_msg + "<br><br>" + info_date + "/" + info_time + "/" + info_att;
							var msg = "<div style='text-align:left'>";
							msg += "<div >에약날짜 : " + info_date + "</div>";
							msg += "<div style='text-align:left'>에약시간 : " + info_time + "</div>";
							msg += "<div style='text-align:left'>참석자 : " + info_att + "</div>";
							msg += "<div style='text-align:left'>에약 진행 하시겠습니까?</div>";
							msg += "</div>";
														
							gap.showConfirm({
								title: "Confirm",
								contents: msg,
								callback: function(){										
									 gsn.requestSearch('', info_att.join(","), function(sel_data){
							             var obj = new Array();
							             for (var i = 0 ; i < sel_data.length; i++){
							            	 obj.push(sel_data[i]);
							             }							             
							             //gap.gAlert("정상적으로 에약이 처리 되었습니다.");	
							             
										var dmsg = "<span style='padding:0px;'>";
										dmsg += "<span >에약날짜 : " + info_date + "</span>";
										dmsg += "<span style='padding-left:10px'>에약시간 : " + info_time + "</span>";
										dmsg += "<span style='padding-left:10px'>참석자 : " + info_att + "</span>";
										dmsg += "<span style='padding-left:10px'>2층 회의실1에 에약이 등록되었습니다.</span>";
										dmsg += "</span>";
											
							            gkgpt.room_reservation(dmsg);							             
							         });							
								}
							});						
						}else{							
							if (gma.chat_position == "popup_chat"){
								gBody.chat_draw(opt, name, pre_msg, date, time, "msg", bun, key, msgid, "", "D", "1", "" , "", "", "popup", gma.cur_cid_popup, "");
							}else{
								gBody.chat_draw(opt, name, pre_msg, date, time, "msg", bun, key, msgid, "", "D", "1", "" , "", "", "chat", gBody.cur_cid,"");
							}
						}						
					},
					error : function(e){
						gap.hide_loading();
						gap.gAlert(gap.lang.errormsg);
					}
				});
		}else{			
			$("#show_chatgpt_stop").off().on("click", function(e){
				gkgpt.chatgpt_all_close();
				$("#show_chatgpt_stop").fadeOut();
			});			
			var pre_msg = gap.lang.gpt3 + ".....";
			gap.show_loading(pre_msg);			
			var date = gap.search_today_only2();
			var time = gap.search_time_only();	
			var bun = date + time.replace(":","");				
			var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.
			var opt = "you";
			var name = gap.lang.gptname;
			var key = "chatgpt";			
			if (gma.chat_position == "popup_chat"){
				gBody.chat_draw(opt, name, pre_msg, date, time, "msg", bun, key, msgid, "", "D", "1", "" , "", "", "popup", gma.cur_cid_popup, "");
			}else{
				gBody.chat_draw(opt, name, pre_msg, date, time, "msg", bun, key, msgid, "", "D", "1", "" , "", "", "chat", gBody.cur_cid,"");
			}		
			var tm = msg.replaceAll("\n", " ").replaceAll("\\n", " ").trim();
			var word = encodeURIComponent(tm);
			word = tm;
	
			//코드관련된 Case의 경우 마지막 코드로 표시된 데이터가 있으면 instruction으로 넘긴다.
			var last_code_text = "";
			if ($(".xgptcls").length > 3){
				var len = $(".xgptcls").length - 3;		

				last_code_text = $($(".xgptcls")[len]).find(".code_top_body").text();	
				if (last_code_text == ""){
					last_code_text = $($(".xgptcls")[len]).text();	
				}
			}			
			var cuser = gap.userinfo.rinfo;			
			var data = JSON.stringify({
				"word" : word,
				"user" : cuser.nm + "/" + cuser.dp + "/" + cuser.du,
				"trans" : gBody.trans_lang,
				"readers" : "all-spl-" + gap.userinfo.rinfo.ky + "-spl-" + gap.full_dept_codes(),
				"assistant" : last_code_text
			});			
			word = word.replaceAll("\n"," ").replace("\t", " ");			
			var ssp = new SSE(gkgpt.kgpt_url, {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload: data,
	            method: 'POST'});
				var cnt = 0;
				var is_complete = false;
				var is_function = false;
				var is_added = false;
				var is_writing = true;
				var is_coding = false;
				var address_complete = false;
				var address_empno = "<";
				var code = "";
				var code_start = false;
				var code_end = false;
				var code_title = "";
				var code_title_end = false;
				var title_catch = false;
				var is_jukuk = false;
				var jukuk_bun = 1;
				var is_empty = false;
				var rnr_first_char = "";
				
				var code_bun = 0;
	
				ssp.addEventListener('message', function(e) {		
					if (code == "rnr" && rnr_first_char == ""){
						if (e.data == "<"){
							e.source.close();							
							$("#show_chatgpt_stop").hide();							
							$("#msg_"+msgid).html("서비스 되지 않는 질문입니다.");							
							return false;
						}
					}					
					gap.hide_loading();					
					if (e.data.indexOf("<code_body>") > -1){
						//프로그램 언어
						var inx1 = e.data.indexOf("<language>") + 10;
						var inx2 = e.data.indexOf("</language>");
						var tpx_header = e.data.substring(inx1, inx2);						
						//프로그램 샘플
						var inx1 = e.data.indexOf("<code_body>") + 11;
						var inx2 = e.data.indexOf("</code_body>");
						var tpx = e.data.substring(inx1, inx2);
						tpx = tpx.replace(/\\n/gi, "\n").replace(/\\t/gi, "\t");						
						//프로그램 설명
						var inx1 = e.data.indexOf("<footer>") + 8;
						var inx2 = e.data.indexOf("</footer>");
						var tpx_footer =  e.data.substring(inx1, inx2);
						tpx_footer = tpx_footer.replace(/\\n/gi, "<br>").replace(/\\t/gi, "&nbsp;&nbsp;&nbsp;");
						$("#msg_"+msgid).text("");									
						$("#msg_"+msgid).append("<div id='msg_code_"+msgid+"' class='gpt_code' style='padding:0px'><div>");									
						$("#msg_code_"+msgid).html("");
						var htm = "<div id='msg_code_top_"+msgid+"' class='code_top_title'>";
						htm += "	<div class='code_top'>";
						htm += "		<div class='code_top_sub' id='code_top_title_"+msgid+"'>"+tpx_header+"</div>";
						htm += "		<div class='code_top_sub' style='cursor:pointer' onClick=\"gkgpt.copytext('"+msgid+"')\">Copy code</div>";
						htm += "	</div>";
						htm += "</div>";
						$("#msg_code_"+msgid).append(htm);
						$("#msg_code_"+msgid).append("<div id='msg_code_body_"+msgid+"' class='code_top_body'></div>");						
						$("#msg_"+msgid).append("<div id='msg_code_footer_"+msgid+"'></div>");
						$("#msg_code_body_"+msgid).typed({
							 strings: [tpx],
							 typeSpeed:-100,
							 contentType: 'null',							 
							 callback : function(){
								$("#msg_code_footer_"+msgid).typed({
									 strings: [tpx_footer],
									 typeSpeed:-100,
									 contentType: 'html',
									 callback : function(){
										if (gma.chat_position == "popup_chat"){
											gap.scroll_move_to_bottom_time(gBody.chat_show_popup, 100);
										}else{
											gap.scroll_move_to_bottom_time(gBody.chat_show, 100);
										}
										
									}
							    });
							}
					    });
						if (gma.chat_position == "popup_chat"){
							gap.scroll_move_to_bottom_time(gBody.chat_show_popup, 100);
						}else{
							gap.scroll_move_to_bottom_time(gBody.chat_show, 100);
						}						
						return false;
					}					
					$("#show_chatgpt_stop").show();					
					cnt++;					
					if (cnt == 1){
						$("#msg_"+msgid).text("");
					}				
					
			
					
					if (e.data.indexOf("code=") > -1){						
						code = e.data.replace("code=", "");
						is_writing = false;
					}else{
						if ((e.data == "-spl-<" || e.data == "-spl-(") && (code=="address" || code=="rnr")){								
							is_writing = false;
							address_complete = true;
						}else{						
							if (address_complete){
								if (!is_complete){
									address_empno += e.data;
								}								
							}else{
								is_writing = true;			
							}						
						}					
					}
					if (e.data == "[DONE]"){							
						$("#show_chatgpt_stop").fadeOut();						
						is_complete = true;
						if (gBody.trans_lang != ""){
							$("#msg_" + msgid).append("<span class='trantmp' data-key='"+"msg_"+msgid+"' onClick='gkgpt.changetrans(this, event)'>"+gap.lang.trn+"</span>");						
						}						
						var hx = $("#msg_" + msgid).html().replace(/&nbsp;/gi," ").replace(/http:/gi, " http:").replace(/https:/gi, " https:");
						var mch = gap.aLink(hx);    //http자동 링크 걸기	
						if (mch.indexOf("a href=") > -1){
							$("#msg_" + msgid).html(mch);
						}
						if (gma.chat_position == "popup_chat"){
							gap.scroll_move_to_bottom_time(gBody.chat_show_popup, 100);
						}else{
							gap.scroll_move_to_bottom_time(gBody.chat_show, 100);
						}						
					}else{
						if (is_complete){				
							if (code.indexOf("vacation_") > -1){
								var html = "";
								html += gkgpt.vacation_check(code);
								html += " <br><div style='margin-top:1px; padding-bottom:0px' >";
								html += "<input type='button' value='휴가 등록 하기' class='gpt_btn' data-key='"+msgid+"' data-code='"+code+"' onclick='gkgpt.reg_vaction(this)'/>";
								html += "<span id='vocation_result_"+msgid+"'></span>";
								html += "</div>";
								$("#msg_" + msgid).append(html);
								is_function = true;
							}else if (code == "calendar"){
								var html = " <br><div style='margin-top:1px' ><input type='button' value='일정 확인 하기' class='gpt_btn' onclick='gkgpt.check_calendar()'/></div>";
								$("#msg_" + msgid).append(html);
								is_function = true;
							}else if (code == "address" || code == "rnr"){
								//시스템 담당자 질문하기						
								var empno = address_empno.replace("<empno>","");
								empno = empno.substring(0, empno.indexOf("</empno"));								
								if (empno != ""){
									var html = " <br><div style='margin-top:1px' ><input type='button' value='담당자와 1:1채팅 하기' class='gpt_btn' onclick=\"gkgpt.call_chat('"+empno+"')\"/>";
									html += "<input type='button' value='담당자 프로필' class='gpt_btn' onclick=\"gOrg.showUserDetailLayer('"+empno+"')\"/>"
									html += "</div>";
									$("#msg_" + msgid).append(html);
								}								
								is_function = true;
							}else{
								if (!is_function && !is_added && code == ""){	
									//resource data	
									var content = e.data.replace(/\\ufeff/gi,"-spl-");									
									if (content == "[]"){
										return false;
									}									
									$("#msg_" + msgid).append("<br><br><span class='trantmp'  data-key='"+"msg_"+msgid+"' onClick='gkgpt.reply_adv(this, event)'>답변 개선 요청</span>");
									
									var oop = $("<span class='trantmp' data-key='"+"gpt_msg_"+msgid+"' onClick='gkgpt.check_resource(this, event)'>출처확인</span>").data("content",content)
									$("#msg_" + msgid).append(oop);
									is_added = true;								
								}
							}						
						}else{
							if (is_writing){
								var pph = e.data.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");								
								if (code_title_end){
									$("#code_top_title_" + msgid + "_" + code_bun).html(code_title);
									code_title_end = "T";
								}								
								if (pph == "```"){											
									code_bun += 1;
									pph = pph.replace("```","");		
									$("#msg_"+msgid).append("<div id='msg_code_"+msgid+"_"+code_bun+"' class='gpt_code' style='padding:0px'><div>");
									is_coding = true;									
									$("#msg_code_"+msgid+"_"+code_bun).html("");
									var htm = "<div id='msg_code_top_"+msgid+"_"+code_bun+"' class='code_top_title'>";
									htm += "	<div class='code_top'>";
									htm += "		<div class='code_top_sub' id='code_top_title_"+msgid+"_"+code_bun+"'></div>";
									htm += "		<div class='code_top_sub' style='cursor:pointer' onClick=\"gkgpt.copytext('"+msgid+"_"+code_bun+"')\">Copy code</div>";
									htm += "	</div>";
									htm += "</div>";
									$("#msg_code_"+msgid + "_" + code_bun).append(htm);
									$("#msg_code_"+msgid + "_" + code_bun).append("<div id='msg_code_body_"+msgid+"_"+code_bun+"' class='code_top_body'></div>");
									code_start = true;
								}else{									
								}
								if (code_start && code_title_end != "T"){
									if (pph == "<br>"){									
										code_title_end = true;	
										is_empty = false;
									}else{
										is_empty = true;
										code_title += pph;								
									}
								}								
								if (pph == "``"){
									is_coding = false;
									pph = "";									
								}
								if (!is_coding){
									if (pph == "`<br><br>"){
										pph = "<br><br>";
									}
								}							
								var wtext = pph;								
								if (!is_empty){									
									if (is_coding){			
										$("#msg_code_body_"+msgid +"_"+code_bun).text($("#msg_code_body_"+msgid + "_"+code_bun).text().replace(/<br><br>/gi, "\n") + wtext.replace(/<br>/gi, "\n").replace(/&nbsp;/gi," ") );
									}else{
										$("#msg_"+msgid).html($("#msg_"+msgid).html() + wtext );
									}									
									var mtx = document.getElementById("msg_"+msgid).innerText;
									if (mtx == "\n" || mtx == "."){
										document.getElementById("msg_"+msgid).innerText = "";
									}										
									gap.scroll_move_to_bottom_time("chat_msg", 500);
								}								
							}							
						}				
					}			
				});
				ssp.stream();			
				gkgpt.source.push(ssp);
			}	
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
		var html = "<br><div style='margin-top:1px;padding-bottom:0px' >"+username + "님의 휴가 정보 (" +vacation_name +" 총 : 20개 중에 현재 12개가 남아 있습니다.)"+"</div>";
		return html;
	},
	
	"check_calendar" : function(){
		alert("일정을 확인 합니다.");
	},	
	
	"reg_vaction" : function(obj){
		//alert("휴가 등록 API와 연동하여 휴가를 등록해 주는 화면을 구성하면 됩니다.");
		gkgpt.date_set_dis(obj);
	},
	
	"reg_room" : function(){
		alert("각 기업별 간편 회의실 예약 창이 띄워지면 됩니다.");
	},
	
	"copytext" : function(id){		
		var tid = "msg_code_body_" + id;
		var r = document.createRange();
		r.selectNode(document.getElementById(tid));
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(r);		
		document.execCommand('copy');
		window.getSelection().removeAllRanges();
		
	},
	
	"call_chat" : function(key){
		gBody.cur_room_att_info_list = [];		
		var ky = key;		
		var surl = gap.channelserver + "/search_user_empno.km";
		var postData = {"empno" : ky};		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.length > 0){
					var name = res[0][0].nm;					
					var room_key = _wsocket.make_room_id(ky); // + "^" + gap.userinfo.rinfo.cpc;
					//대상자 정보를 넣어주서야 새창에서 기존에 채팅방이 없는 경우 해당 사용자와 1:1 방을 만들고 들어간다.						
					gBody.cur_chat_user = ky;
					gBody.cur_chat_name = name;	
					gap.chatroom_create_after2(room_key);
				}else{
					alert("담당자가 존재하지 않습니다.");
				}					
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},
	
	"reply_adv" : function(e, obj){		
		var request = $(e).parent().parent().parent().parent().parent().parent().prev().find(".xgptcls").text().trim();
		var msg = "질문내용 <br>'" + request + "'<br> 대한 답변 개선요청 하시겠습니까?";		
		gap.showConfirm({
			title: "Confirm",
			contents: msg,
			callback: function(){					
				var cuser = gap.userinfo.rinfo;				
				var surl = gap.gpt_admin_server + "/complain_save";
				var postData = {
						"user" : cuser.nm + "/" + cuser.dp + "/" + cuser.du,
						"msg" : request
						};		
				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(postData),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success : function(res){						
						if (res.result == "OK"){
							gap.gAlert("개선 요청이 등록되었습니다.");
						}else{
							gap.gAlert(gap.lang.errormsg);
						}					
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				});		
			}
		});
	},
	
	"check_resource" : function(e, obj){		
		var key = $(e).data("content");
		var resource = eval(key);		
		var html = "";
		html += "<div class='layer-member' >";
		html += "	<h2>출처</h2>";
		html += "	<button class='ico btn-member-close'>닫기</button>";		
		html += "	<ul class='list-member' id='member_dis' style='overflow:hidden'>";							
		html += "출처1<br>" + resource[0].replace(/\n/gi,'<br>').replace("-spl-","") + ""	
		if (typeof(resource[1]) != "undefined"){
			html += "<br><br>출처2<br>" + resource[1].replace(/\n/gi,'<br>').replace("-spl-"," ") + ""	
		}		
		html += "	</ul>";
		html += "</div>";						
		$(obj.target).qtip({
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			content : {
				text : html
			},
			show : {
				event: 'click',
				ready: true
			},
			hide : {
				event : 'unfocus',
				//event : 'mouseout',
				fixed : true
			},
			style : {
				classes : 'qtip-bootstrap',
				tip : true
			},
			position: {
		         viewport: $('#main_body')
		    },
			events : {
				show : function(event, api){		
			    	$("#member_dis").mCustomScrollbar({
						theme:"dark",
						autoExpandScrollbar: true,
						scrollButtons:{
							enable:false
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
			    	
			    	$(".btn-member-close").on("click", function(e){
			    		api.destroy(true);
			    	});
		    	},
				hidden : function(event, api){
					api.destroy(true);
				}
			}
		});	
		return false;		
	},
	
	"changetrans" : function(e, obj){
		var key = $(e).data("key");
		var kh = $("#" + key).html();
		var inx = kh.indexOf('<span class="trantmp"');
		var tranT = kh.substring(0, inx);
		var language = gap.getCookie("language");
		if (typeof(language) == "undefined"){
			language = "ko";
		}		
		var surl = gkgpt.trans_url;
		var postData = JSON.stringify({
				"word" : tranT,
				"lang" : language
			});		
		gap.show_loading(gap.lang.gpt4);
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : postData,
			success : function(res){
				//if (res.result){	
				gap.hide_loading();				
				if (typeof(res.result) != "undefined"){
					var html = "";
					html += "<div class='layer-member' >";
					html += "	<h2>"+gap.lang.trn+"</h2>";
					html += "	<button class='ico btn-member-close'>닫기</button>";		
					html += "	<ul class='list-member' id='member_dis' style='overflow:hidden'>";							
					html += "" + res.result + ""		
					html += "	</ul>";
					html += "</div>";
									
					$(obj.target).qtip({
						overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
						content : {
							text : html
						},
						show : {
							event: 'click',
							ready: true
						},
						hide : {
							event : 'unfocus',
							//event : 'mouseout',
							fixed : true
						},
						style : {
							classes : 'qtip-bootstrap',
							tip : true
						},
						position: {
					         viewport: $('#main_home')
					    },
						events : {
							show : function(event, api){		
						    	$("#member_dis").mCustomScrollbar({
									theme:"dark",
									autoExpandScrollbar: true,
									scrollButtons:{
										enable:false
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
						    	
						    	$(".btn-member-close").on("click", function(e){
						    		api.destroy(true);
						    	});
					    	},
							hidden : function(event, api){
								api.destroy(true);
							}
						}
					});	
					return false;
				}			
			},
			error : function(e){
				gap.gAlert("연결중 오류가 발생하였습니다.");
				gap.hide_loading();
				return false;					
			}
		});		
	},
	
	"chatgpt_greeting" : function(){	

//		if (gkgpt.plugin){
//			gkgpt.room_reservation();
//			return false;
//		}		
		
		gkgpt.select_plugin = "";
		
		gkgpt.source = new Array();		
		var msg = gap.lang.gpt2;		
		msg += "<dt class='call_kgpt_wrap'>";
		msg += "<span class='call_kgpt'>메일 담당자는 누구인가요?</span>";
		msg += "<span class='call_kgpt'>연차 휴가 등록해 주세요</span>";
		msg += "<span class='call_kgpt'>본인 결혼시 경조비는 어떻게 되나요?</span>";	
		
		msg += "</dt>";
		
		var date = gap.search_today_only2();
		var time = gap.search_time_only();	
		time = "";
		var bun = date + time.replace(":","");			
		var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.
		var opt = "you";
		var name = gap.lang.gptname;
		var key = "chatgpt";
		
		gBody.chat_draw(opt, name, msg, date, time, "msg", bun, key,     msgid, "", "D", "1", "" , "", "", "", gBody.cur_cid,"");
		
		//내가 등록한 Plugin이 있는지 확인 한다.
		gkgpt.search_my_plugin();
		
		$(".call_kgpt").off().on("click", function(e){
			if ($(e.currentTarget).attr("id") == "plugin_store"){
				//디자인 없어 일단 회의실 에약으로 설정한다.
				//gkgpt.room_reservation();
				//gkgpt.plugin_store_show("all", "");
			}else{
				var msg = $(e.currentTarget).text();
				gkgpt.chatgpt_call(msg);
			}		
		});
	},
	
	"chatgpt_all_close" : function(){
		if (gkgpt.source.length > 0){
			for (var i = 0 ; i < gkgpt.source.length; i++){
				gkgpt.source[i].close();
			}
		}
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
				var vacation_type = gkgpt.vacation_check(code);
				var id = $(obj).data("key");			
				
				if (typeof(et) != "undefined"){
					$(obj).val(st + "~" + et + " 까지 휴가가 등록 되었습니다.");
					var msg = st + "~" + et + " 까지<br>휴가를 등록 하시겠습니까?";					
					gap.showConfirm({
						title: "Confirm",
						contents: msg,
						callback: function(){									
						}
					});				
				}else{					
				}				
				$(obj).val("휴가 등록 하기");				
			}		
		}).mobiscroll('getInst');
		picker.open();
	},
	
	"plugin_store_show" : function(type, query){
		var url = gap.channelserver + "/plugin_list_gpt.km";
		var data = JSON.stringify({
			"admin" : "F",
			"perpage" : 10,
			"query" : query,
			"start" : 0,
			"type" : type
		});
		$.ajax({
			type : "POST",
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},	
			contentType : "application/json; charset=utf-8",
			data : data,
			url : url,
			success : function(res){				
				if (res.result == "OK"){
					var items = res.data.response;
					var html = '';
					html += '<div id="new_plugin_layer" class="layer_wrap center" style="width : 80%;  min-height:calc(100% - 150px)">';
					html += "<div class='plugin-box'>";
					html += "	<div class='plugin-box-title-wrap'>";
					html += "		<h4 class='plugin-box-title'>Plugin store</h4>";
					html += "		<div class='plugin-box-close' id='close_plugin_layer'></div>";
					html += "	</div>";
					html += "	<div class='plugin-box-content'>";
					html += "		<div class='plugin-box-top'>";
					html += "			<div class='plugin-li-wrap'>";
				//	html += "				<div class='plugin-li'>Popular</div>";
				//	html += "				<div class='plugin-li'>New</div>";
					if (type == "Installed"){
						html += "				<div class='plugin-li'>All</div>";
						html += "				<div class='plugin-li current'>Installed</div>";
					}else{
						html += "				<div class='plugin-li current'>All</div>";
						html += "				<div class='plugin-li'>Installed</div>";
					}
					html += "			</div>";
					html += "			<div class='search-wrap'>";
					html += "				<button class='search-btn'></button>";
					html += "				 <input type='text' placeholder='Search plugins'value='"+query+"' id='search-plugin'>";
					html += "			</div>";
					html += "		</div>";
					html += "			<div class='plugin-box-mid'>";
					html += "				<div class='plugin-item-wrap'>";
					for (var i = 0 ; i < items.length; i++){						
						var item = items[i];
						var menu_name = item.menu_kr;
						var express = item.content;
						var code = item.code;
						var img_url = gap.channelserver + "/plugin_download_gpt.do?code=" + code + '&ver=' + item.last_update;
						html += "					<div class='plugin-item plugin-item1'>";
						html += "						<div class='item-content'>";
						html += "							<div class='item-content-wrap'>";
						html += "								<div class='item-img item-img'><img src='"+img_url+"'></div>";
						html += "								<div class='plugin-tit-wrap'>";
						html += "									<div class='plugin-items-title'>"+menu_name+"</div>";
						html += "                                   <div id='btn_"+code+"' class='xxpp'>"
						html += "										<div class='install-wrap' id='"+code+"'>";
						html += "											<span class='install'>Install</span>";
						html += "											<div class='install-img'></div>";
						html += "										</div>";
						html += "                                   </div>"
						html += "								</div>";
						html += "							</div>";
						html += "							<div class='item-desc'>"+express+"</div>";
						html += "						 </div>";
						html += "					 </div>";
					}				
					html += "				</div>";
					html += "			</div>";					
					html += "	<div class='plugin-box-bottom'>";
					html += "		<div class='prev-wrap'>";
					html += "			<div class='prev-btn arrow-btn'></div>";
					html += "			<div class='prev'>Prev</div>";
					html += "		</div>";
					html += "		<ul class='plugin-list'>";
					html += "			<li><span class='list-num current'>1</span></li>";
					html += "		</ul>";
					html += "		<div class='next-wrap'>";
					html += "			<div class='next'>Next</div>";
					html += "			<div class='next-btn arrow-btn'></div>";
					html += "		</div>";
					html += "	</div>";
					html += "</div>";
					html += "</div>";	
					
					gap.showBlock();
					$("#common_plugin_layer").show();
					$("#common_plugin_layer").html(html);
					
					gkgpt.auto_update_uninstall_state();
					
					var $layer = $('#new_plugin_layer');
					var inx = parseInt(gap.maxZindex()) + 1;
					$layer.css('z-index', inx).addClass('show-layer');
					
					$("#close_plugin_layer").on("click", function(){
						gap.remove_layer('new_plugin_layer');
					});
					
					$(".plugin-li-wrap .plugin-li").off().on("click", function(e){
						$(".plugin-li-wrap .plugin-li").removeClass("current");
						var cobj = $(e.currentTarget);
						cobj.addClass("current");
						var type = cobj.text();
						gkgpt.plugin_store_show(type, "");
					});
					
					$("#search-plugin").keypress(function(e){
						if (e.keyCode == 13){
							var query = $(e.target).val();
							gkgpt.plugin_store_show(type, query);
						}
					});
					
					gkgpt.plugin_event();
				}
				
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}			
		})	
	},
	
	"plugin_event" : function(){
		$(".plugin-item-wrap .install-wrap").off().on("click", function(e){
			var code = $(e.currentTarget).attr("id");
			gkgpt.local_plugin_setting_update("T", code);
			gkgpt.btn_change("F", code);
			gkgpt.install_plugin();
			gkgpt.plugin_event();
		});
		
		$(".plugin-item-wrap .uninstall-wrap").off().on("click", function(e){
			var code = $(e.currentTarget).attr("id");
			gkgpt.local_plugin_setting_update("F", code);
			gkgpt.btn_change("T", code);
			gkgpt.install_plugin();
			gkgpt.plugin_event();
		});
	},
	
	"local_plugin_setting_update" : function(opt, code){
		//gkgpt.my_plugin_list[] 정보를 추가하고 제거하고를 처리한다.
		var list = gkgpt.my_plugin_list;
		var tlist = list.split("-spl-");
		if (opt == "T"){
			tlist.push(code);
		}else{
			var sitem = tlist.indexOf(code);
			tlist.splice(sitem,1);
		}
		gkgpt.my_plugin_list = tlist.join("-spl-");
	},
	
	"auto_update_uninstall_state" : function(){
		//현재 화면에 보이는 데이터 중에 내가 설치한 Plugin은 Uninstall로 변경해야 한다.
		var my_plugin_list = gkgpt.my_plugin_list;
		$(".plugin-item-wrap .xxpp").each(function(inx, item){
			var scode = $(item).attr("id").replace("btn_","");
			if (my_plugin_list.indexOf(scode) > -1){
				gkgpt.btn_change("F", scode);
			}
		});
		gkgpt.plugin_event();
	},
	
	"btn_change" : function(opt, code){
		//Install, Uninstall 버튼으로 변경해준다. opt : T(Install), F(Uninstall)
		var html = "";
		if (opt == "T"){
			html += "<div class='install-wrap' id='"+code+"'>";
			html += "	<span class='install'>Install</span>";
			html += "	<div class='install-img'></div>";
			html += "</div>";
		}else{
			html += "<div class='uninstall-wrap blind' id='"+code+"'>";
			html += "	<span class='uninstall'>Uninstall</span>";
			html += "	<div class='uninstall-img'></div>";
			html += "</div>";
		}
		$("#btn_"+code).html(html);		
	},
	
	"install_plugin" : function(){
		//install : "T" 이면 설치하는 것이고 "F" 이면 Uninstall 이다.

		var mlist = gkgpt.my_plugin_list.split("-spl-");
		filtered  = mlist.filter(function(item) {
			return item !== null && item !== undefined && item !== '';
		});
		var clist = filtered.join("-spl-");
		gkgpt.my_plugin_list = clist;
		
		var url = gap.channelserver + "/plugin_save_person.km";
		var data = JSON.stringify({
			"code" : clist
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
			contentType : "application/json; charset=utf-8",
			success : function(res){
				gkgpt.search_my_plugin();
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		})
	},
	
	"my_install_plugin_list" : function(){
		var url = gap.channelserver + "/plugin_person_list.km";
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			contentType : "application/json; charset=utf-8",
			success : function(res){
				
				if (res.result == "OK"){
					if (typeof(res.data.response) == "undefined"){
						gkgpt.my_plugin_list = "";
					}else{
						gkgpt.my_plugin_list = res.data.response.code;
					}					
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		})
	},
	
	"search_my_plugin" : function(){		
		
		var url = channelserver + "/search_my_plugin_gpt.km";
		$.ajax({
			type : "POST",
			url : url,
			contentType : "applicaion/json; charset=utf-8",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
			},
			success : function(res){
				if (res.result == "OK"){
					var items = res.data.response;
					//gkgpt.my_plugin_list = items;
					var html = "";
					gkgpt.my_plugin_list_temp = [];
					for (var i = 0 ; i < items.length ; i++){
						var item = items[i];
						gkgpt.my_plugin_list_temp.push(item.code);
						var title = item.menu_kr;
						if (gap.curLang != "ko"){
							title = item.menu_en;
						}
						html += "<span class='plugin_select_box' data-code='"+item.code+"' data-content='"+item.content+"'>"+title+"</span>&nbsp;"
					}
					gkgpt.my_plugin_list = gkgpt.my_plugin_list_temp.join("-spl-");
					html += "<span class='plugin_select_express'>플러그인 사용시 선택하세요</span>";
					html += "<span class='plugin_select_box_btn' id='plugin_store'>Plugin store</span>";	
					$("#gpt_plugin_dis").show();
					$("#gpt_plugin_dis").html(html);
					
					$(".plugin_select_box").off().on("click", function(e){						
						var code = $(e.currentTarget).data("code");
						
						$(".plugin_select_box").removeClass("selected");
						if (gkgpt.select_plugin != code){
							$(e.target).addClass("selected");
							gkgpt.select_plugin = code;
							gkgpt.plugin = true;
							var content = $(e.currentTarget).data("content");
							gkgpt.run_plugin(code, content);
						}else{
							gkgpt.plugin = false;
							gkgpt.select_plugin = "";
							gkgpt.delete_plugin_view();				
						}						
					});
					
					$("#plugin_store").off().on("click", function(e){
						gkgpt.plugin_store_show("all", "");
					});					
				}
			}
		})
	},
	
	"run_plugin" : function(code, content){
		//gkgpt[code](content);
		gkgpt.show_plugin_content(content);
		$("#message_txt").focus();
	},
	
	"show_plugin_content" : function(content){
		//플러그인 시나리오를 공통으로 진행하는 함수
		gkgpt.plugin = true;
		
		$("#chat_msg_dis").empty();
		gkgpt.assistant = [];
		gkgpt.msgs = [];
		gkgpt.chat_history = [];
		gkgpt.disdate = "";		
		var date = gap.search_today_only2();		
		var msg = content //<br><span class='del_plugin'>Delete Plugin</span>;		
		var date = gap.search_today_only2();
		var time = gap.search_time_only();	
		time = "";
		var bun = date + time.replace(":","");			
		var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.
		var opt = "you";
		var name = gap.lang.gptname;
		var key = "chatgpt";		
		if (gma.chat_position == "popup_chat"){
			gBody.chat_draw(opt, name, msg, date, time, "msg", bun, key, msgid, "", "D", "1", "" , "", "", "popup", gma.cur_cid_popup, "");
		}else{
			gBody.chat_draw(opt, name, msg, date, time, "msg", bun, key, msgid, "", "D", "1", "" , "", "", "chat", gBody.cur_cid, "");
		}		
		$(".del_plugin").off().on("click", function(e){
			gkgpt.delete_plugin_view();
		});		
	},
	
	"room_reservation" : function(content){
		//개별 함수가 필요한 경우 별도로 만든다.
		gkgpt.plugin = true;
		
		//$("#chat_msg_dis").empty();
		gkgpt.assistant = [];
		gkgpt.msgs = [];
		gkgpt.chat_history = [];
		gkgpt.disdate = "";		
		var date = gap.search_today_only2();		
		var msg = content //<br><span class='del_plugin'>Delete Plugin</span>;		
		var date = gap.search_today_only2();
		var time = gap.search_time_only();	
		time = "";
		var bun = date + time.replace(":","");			
		var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.
		var opt = "you";
		var name = gap.lang.gptname;
		var key = "chatgpt";		
		if (gma.chat_position == "popup_chat"){
			gBody.chat_draw(opt, name, msg, date, time, "msg", bun, key, msgid, "", "D", "1", "" , "", "", "popup", gma.cur_cid_popup, "");
		}else{
			gBody.chat_draw(opt, name, msg, date, time, "msg", bun, key, msgid, "", "D", "1", "" , "", "", "chat", gBody.cur_cid, "");
		}		
		$(".del_plugin").off().on("click", function(e){
			gkgpt.delete_plugin_view();
		});		
	},
	
	"gpt_test" : function(){
		var word = "뉴진스 멤버에 대해서 설명해줘"
		var data = JSON.stringify({
			"word" : word,
			"user" : "kmslab",
			"trans" : "",
			"readers" : "all",
			"assistant" : ""
		});			
			
		var ssp = new SSE("https://kgpt.kmslab.com:5002/completion2", {headers: {'Content-Type': 'application/json; charset=utf-8'}, 	payload: data, 	method: 'POST'});	
		ssp.addEventListener('message', function(e) {		
			console.log(e.data);
			var wtext = e.data;
			//$("#dis").html($("#dis").html() + wtext );				
		});
		ssp.stream();		
	}
	
}

