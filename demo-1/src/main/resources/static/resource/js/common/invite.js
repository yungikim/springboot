$(document).ready(function(){
	
});


function gVI(){
	_this = this;	
	
}

gVI.prototype = {
	
	"init" : function(){
		this._eventHandler();
	},
	
	"_eventHandler" : function(){	
		
		$("#tclose").on("click", function(){			
			top.close();
		});
		
		$("#usersearch").on("click", function(){
			gVI.user_search($("#input_user").val());
		});
		
/*		$("#input_user").keypress(function(evt){
			
			if (evt.keyCode == 13){
				gVI.user_search($("#input_user").val());
			}		
		});	*/
		
		$("#input_user").keydown(function(evt){
			
			if (evt.keyCode == 13){
				$("#slayer").empty();
				$("#slayer").hide();				
				gVI.user_search($("#input_user").val());
				
			}else{
				$("#slayer").empty();
				$("#slayer").hide();
			}	
		}).on("change", function(){
			if($(this).val() == ""){
				$(this).parent().find("label").removeClass("on");
			} else {
				$(this).parent().find("label").addClass("on");
			}
		});		
				
		
		$("#send_invite").on("click", function(){
			gVI.invite_send();
		});
		
		$("#cancel_invite").on("click", function(){
			top.close();
		});
	},
	
	"person_profile_uid" : function(uid){
		var profile_url = "../../photo/" + encodeURIComponent(uid);
		var empty_url = "../../photo/no_profile";		
		var img_tag = "<img src='" + profile_url + "' onError='this.src=\"" + empty_url + "\";' alt='' />";
		return img_tag;
	},	
	
	"user_search" : function(str){
		
		$("#input_user").val("");
		
		var url = "/" + orgpath + "/org_search?openagent&search_type=193&query=" + encodeURIComponent(str);
		
		$.ajax({
			type : "GET",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : url,
			success : function(res){
				
				var info = res[0].result;
				if (info.length > 1){
					//동명이인이 있는 경우
					
					//<li><a href="#">김소현 / 솔루션개발팀 / 대리</a></li>
					
					var html = "";
					for (var i = 0 ; i < info.length; i++){
						var user = info[i];
						var name = user.user_name;
						var dept = user.dept_name;
						var pos = user.position;
						var notesid = user.notes_id;
												
						var empno = user.user_id;
						var photourl = user.potourl;
						
						var oob = new Object();
						oob.emp_no = "kkk";
						html += "<li style='cursor:pointer' onclick=\"gVI.list_user('"+name+"','"+dept+"','"+pos+"','"+notesid+"','"+empno+"')\"><a>" + name + " / " + dept + " / " + pos + "</a></li>"
					}
					
					$("#slayer").show();
					$("#slayer").html(html);
					
				}else{
					//결과가 1명인 경우				
					gVI.add_user(info[0]);
				}
			}, 
			error : function(res){
				alert(res);
			}
		})
		//https://files.kmslab.com/ep/common/orgall.nsf/org_search?openagent&search_type=193&query=%EC%A1%B0%EC%9D%80&1729cd3c018
	},
	
	"list_user" : function(name, dept, pos, notesid, empno){
		var obj = new Object();
		obj.emp_no = empno;
		obj.notes_id =  notesid;
		obj.user_id =  empno;
		obj.user_name = name;
		obj.dept_name = dept;
		obj.position = pos;
		
		gVI.add_user(obj);
		
		$("#slayer").hide();
	},
	
	"add_user" : function(obj){
	
		
		//var id = obj.notes_id.replace(/\//gi, ",");
		var id = obj.user_id;
		var len = $("#invite_member #invite_"+obj.emp_no).length
		if (len > 0){
			alert("user already exists");
			return false;
		}
		
		//PhotoURL
		var person_img = gVI.person_profile_uid(obj.notes_id.replace(/\//g, ","));
		var html = "";
		
		var uid = obj.notes_id.replace(/\//g, ",");
		html = "<li id='invite_"+obj.emp_no+"' data='"+id+"' data2='"+uid+"'>";
		html += "<div class='thumb'>";
		html += person_img;
		html += "</div>";
		html += "<span>";
		html += "	<strong>"+obj.user_name+"님</strong>"+obj.dept_name+" / "+obj.position+"</span>";
		html += "	<button class='btn_trash ico' onClick=\"gVI.delete_user('invite_"+obj.emp_no+"')\">삭제</button>";
		html += "</li>";
		
		$("#invite_member").append($(html));
	},
	
	"delete_user" : function(obj_id){
		$("#"+obj_id).remove();
	},
	
	
	"invite_send" : function(target_uid, msg){
		
		var msg = $("#subject").val();
		if (msg == ""){
			msg = "화상회의에 참석해 주시기 바랍니다.";
		}
		
		$("#invite_member li").each(function (index, obj){
			
			var inx = index;
			var obx = obj;
			
			var target_uid = $(obx).attr("data2");
			
			
			_wsocket.make_chatroom_11(target_uid);
			
					
			setTimeout(function(){
				
				var msgid = _wsocket.make_msg_id();
				var roomkey = _wsocket.make_room_id(target_uid);
				roomkey = roomkey.replace(/-lpl-/gi,"_"); // + "^" + companycode;
				var obj = new Object();		
				obj.type = "msg";
				obj.mid = msgid;
				obj.msg = msg + "-spl-" + room_code;
				obj.cid = roomkey;
				obj.ty = 21;
				obj.name = kor_name;
				obj.name_eng = eng_name;
				obj.el = userlang;
			
				
				_wsocket.send_chat_msg(obj);
				
			}, 500);		
			
		});
		
		setTimeout(function(){
			top.close();
		}, 1000);
		
		//alert("초대가 완료되었습니다.");
		//top.close();
				
	},
	
	"check_locale" : function(){
		var mserver = mailserver.toLowerCase();
		
		if (mserver.indexOf("devap") > -1){
			loc = "dev";		
		}else if (mserver.indexOf("aphq") > -1){
			loc = "ko";
		}else if (mserver.indexOf("apcn") > -1){
			loc = "cn";
		}else if (mserver.indexOf("apus") > -1){
			loc = "us";
		}else if (mserver.indexOf("apag") > -1){
			loc = "ag";
		}else if (mserver.indexOf("apfr") > -1){
			loc = "fr";
		}

		return loc;
	},
	
	"set_locale" : function(loc){
		var channelserver = "";
		if (loc == "ko"){
			channelserver = "apwwebchatv01.amorepacific.com:16180";

		}else if (loc == "cn"){
			channelserver = "apwcnchatmux01.amorepacific.com:16180";

		}else if (loc == "us"){
			channelserver = "apwuschatmux01.amorepacific.com:16180";

		}else if (loc == "ag"){
			channelserver = "apwagchatmux01.amorepacific.com:16180";

		}else if (loc == "fr"){
			channelserver = "apwfrchatmux01.amorepacific.com:16180";

		}else if (loc == "dev"){
			channelserver = "10.155.8.205:16180";
		}	
		return channelserver;
	}	
	
}
