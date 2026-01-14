function gsharing(){
	
}

gsharing.prototype = {
	
	"init": function(){
		//gs.gpt_view_draw();

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

				
				gptpt.draw_room_history(key);
			},
			error : function(e){
				gap.error_alert();
			}
		});				
	}
	
}