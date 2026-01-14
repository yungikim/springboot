/**
 * 
 */



$("#btn_login").on("click", function(e){
	
	var id = $("#input_login_id").val();
	var pw = $("#input_login_pw").val();
	
	var url = root_path + "/sso.do";
	var data = JSON.stringify({
		"id" : id,
		"pw" : pw
	})
	$.ajax({
		"type" : "POST",
		"url" : url,
		"data" : data,
		"contentType" : "application/json; charset=utf-8",
		"success" : function(res){
			console.log(res);
			if (res.result == "OK"){
			//	location.href = root_path + "/index.jsp";
				
				//도미노 인증 쿠키를 설정한다.
				//debugger;
				//서버에서 쿠키를 넣고 리턴해서 여기서는 설정햘 필요없
				var exdays = 1;
				var exdate=new Date();
				exdate.setDate(exdate.getDate() + exdays);
				//var c_value= escape(res.token.replace("LtpaToken=","")) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
				//var c_value= escape(res.token.replace("LtpaToken=",""));
				//document.cookie= "LtpaToken=" + c_value;
				//document.cookie= res.token;
				

				gap.setCookie("language", $("#language_selectmenu").val());
				gap.setCookie("userid", id);

		
				localStorage.setItem('auth', res.auth);
				localStorage.setItem('auth_create_time', gap.get_current_datetime());
				
				//메인 페이지로 이동한다.
				location.href = root_path + "/v/portal";
			}else{
				alert("아이디 또는 비밀번호가 잘못되었습니다.");
			}
		},
		"error" : function(e){
			alert(e);
		}
	})
});

$("#input_login_pw").on("keypress", function(e){
	if (e.keyCode == 13){
		$("#btn_login").click();
	}
});

$("#auth").on("click", function(e){
	var url = "../auth.do";
	$.ajax({
		"url" : url,
		"success" : function(res){
			alert(res.result + "/" + res.auth)
		}
	})
});

