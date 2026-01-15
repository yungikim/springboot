/**
 * 
 */


var swiper = new Swiper('#login_bg_swiper', {
	loop: true,
	spaceBetween: 20,
	autoplay:{
		  delay: 5000, // 시간 설정
          disableOnInteraction: false, // false-스와이프 후 자동 재생
	},
	speed: 400,
 	pagination: {
		el: ".swiper-pagination",
		clickable: true,
    },
   /* navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    }*/
});

/// 자동완성으로 아이디, 패스워드 입력창에 입력된 경우
$('#login_box_wrap .login_input').on('animationstart', function (e) {
    if (e.originalEvent.animationName === 'autofillStart') {
		$("#btn_id_empty").show();
		$("#toggle_pw_visible").show();
		$("#btn_pw_empty").show();
    	$("#btn_login").addClass("active");
    }
});

$("#btn_login").on("click", function(e){
	
	var id = $("#input_login_id").val();
	var pw = $("#input_login_pw").val();
	
	var html = "";
	
	if(id === "" && pw === "" || id === ""){
		html += "<div id='guide_login_fail' class='login_fail'>아이디를 입력해주세요.</div>";
		$("#guide_login_fail").remove();
		$("#login_util_wrap").append(html);
		return false;	
	}
	if(pw === "" ){
		html += "<div id='guide_login_fail' class='login_fail'>비밀번호를 입력해주세요.</div>";
		$("#guide_login_fail").remove();
		$("#login_util_wrap").append(html);
		return false;
	}
	
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
				gap.setCookie("userid", res.id);
				gap.setCookie("Authorization", res.auth);
		
				localStorage.setItem('auth', res.auth);
				localStorage.setItem('auth_create_time', gap.get_current_datetime());
				
				
				
				if($("#guide_login_fail").is(":visible")){
					$("#guide_login_fail").addClass("success").html("로그인에 성공하였습니다.");
				}
				
				//메인 페이지로 이동한다.
				location.href = root_path + "/v/portal";
			}else{
				//alert("아이디 또는 비밀번호가 잘못되었습니다.");
				var html = "";
				
				html += "<div id='guide_login_fail' class='login_fail'>입력한 계정이나 비밀번호가 잘못되었습니다.\n확인한 후 다시 시도해 주세요.</div>";
				/// 로그인 실패 안내 문구 표시
				
				$("#guide_login_fail").remove();
				$("#login_util_wrap").append(html);
			}
		},
		"error" : function(e){
			alert(e);
		}
	})
});

///// 아이디 입력창 ////
$("#input_login_id").on("keyup", function(e){
	var val = $.trim($(this).val());
	
	if(val.length > 0){
		$("#btn_id_empty").fadeIn(100);
	} else {
		$("#btn_id_empty").fadeOut(100);
	}
	
	var pw_val = $.trim($("#input_login_pw").val());
	
	if( val.length > 0 && pw_val.length > 0 ){
		$("#btn_login").addClass("active");
	} else {
		$("#btn_login").removeClass("active");
	}
});

/**** 아이디 입력창 비우기 ***/
$("#btn_id_empty").off().on("click", function(){
	$(this).hide();
	$("#input_login_id").val("");
	$("#btn_login").removeClass("active");
});

/**** 패스워드 입력창 비우기 ***/
$("#btn_pw_empty").off().on("click", function(){
	$(this).hide();
	$("#toggle_pw_visible").hide();
	$("#input_login_pw").val("");
	$("#btn_login").removeClass("active");
});

$("#toggle_pw_visible").off().on("click", function(e){
	$(this).toggleClass("on");
	
	/// 비밀번호 노출 시키기
	if($(this).hasClass("on")){
		$("#input_login_pw").prop("type", "text");
	} else {
		/// 비밀번호 숨기기
		$("#input_login_pw").prop("type", "password");
	}
	
});

///// 패스워드 입력창 ////
$("#input_login_pw").on("keyup", function(e){
	var val = $.trim($(this).val());
	
	if(val.length > 0){
		$("#toggle_pw_visible").fadeIn(100);
		$("#btn_pw_empty").fadeIn(100);
	} else {
		$("#toggle_pw_visible").fadeOut(100);
		$("#btn_pw_empty").fadeOut(100);
	}
	
	var id_val = $.trim($("#input_login_id").val());
	
	if( val.length > 0 && id_val.length > 0 ){
		$("#btn_login").addClass("active");
	} else {
		$("#btn_login").removeClass("active");
	}
});

$("#input_login_id, #input_login_pw").on("keypress", function(e){

	if (e.keyCode == 13){
		$("#btn_login").click();
	}
});
$("#input_login_pw").on("keypress", function(e){
	if (e.keyCode == 13){
		$("#btn_login").click();
	}
});
$("#input_login_id").on("focus blur", function(e){
	if(e.type === "focus"){
		$(this).siblings(".login_id_ico").css({
			"filter" : "brightness(0.5)"
		});
	}
	if(e.type === "blur"){
		$(this).siblings(".login_id_ico").css({
			"filter" : "brightness(1)"
		});
	}
});
$("#input_login_pw").on("focus blur", function(e){
	if(e.type === "focus"){
		$(this).siblings(".login_pw_ico").css({
			"filter" : "brightness(0.5)"
		});
	}
	if(e.type === "blur"){
		$(this).siblings(".login_pw_ico").css({
			"filter" : "brightness(1)"
		});
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

