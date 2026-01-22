/*
	gap.move_channel_list : 특정 채널에 바로 등러가기
 */

$(document).ready(function(){
	
});

window.addEventListener('popstate', function (event) {
    // 사용자가 뒤로가기를 눌렀을 때 처리할 내용
    if (event.state && event.state.path) {
        location.href = event.state.path; // 예: 실제 페이지 이동
    }
});

function gapcommon(){
	this.userinfo = new Object();
	this.lang = "";           //언어 데이터 json을 가지고 있는 변수
	this.curLang = "";       //현재 사용중인 언어가 ko 인지 en 인지 변수	
	this.buddy_list_info = "";   // 버디리스트 정보를 메모리에 가지고 있는다.
	this.chat_room_info = "";    //채팅방 정보 리스트 가지고 있기	
	this.favorite_list = ""; 		//즐겨찾기 리스트 정보
	this.etc_info = "";				//기타 개인정보	
	this.passphrase = "kmslabbox";
	this.cur_window = "";
	////////////////////// 참조 서버 리스트 정의 ////////////////////////////////
	var loc = "ko";	
	var sel_dns = "";	
	var fileserver = "";
	var ogtagserver = "";
	var channelserver = "";
	var sid = "";	
	this._ws_cur_sever = "";	
	this.fileupload_server_url = "";
	this.ogtag_search_url = "";
	this.sid = "";
	////////////////////////////////////////////////////////////////////	
	this.right_page_width = "315px";
	this.right_box_page_width = "60%";	//"640px";	
	this.curpage = "";   //현재 오픈되어 있는 body영역에 컨텐츠
	this.tmppage = "";   //사용자 검색(usearch) 이냐 또는 이전 대와 검색(history) 이냐   
	this.backpage = "";  //창을 열었다가 돌아가야 하는 페이지 영역 저장
	this.cur_room_key = "";  //현재 대화창이 열려 있었다면 해당 방의 Uniquekey값		
	//파일서버 정보는 대화방 표시할때 참조하기 때문에 별도로 정의해서 변수로 처리하고 나머지 서버는 하드코딩한다.
	this.fileserver_ko = "https://one.kmslab.com/fud";
	this.fileserver_dev = "https://one.kmslab.com/fud";
	this.fileserver_mobile = "https://one.kmslab.com/fud";	
	this.gpt_admin_server = "https://files.kmslab.com:13430";
	this.cur_user_status = new Array();	
	this.isDev = false;
	this.focus = true;
	this.cur_status_index = "";	
	this.ext_user = "F";   //load_init 함수에서 체크함
	this.auth_check_time = 900;		// auth 확인을 위한 유효시간 (도미노 세션타임아웃 시간은 15시간을 분으로 세팅 - 15 * 60)
	this.is_mention = "";			// 화면 우측 상단 멘션 아이콘의 클릭 여부	
	this.nasfolder = "";
	this.synapserver = "";	
	this.systemname = "K-Portal ONE";
	///아래 텍스트는 top.js에서 다국어로 별도 설정합니다.
	this.channel_push_title = "ONE[업무방]";
	this.drive_push_title = "ONE[Files]";
	this.todo_push_title = "ONE[업무요청]";	
	//////////////////////목록 페이징 관련 전역변수 ////////////////////////////////
	this.per_page = "10";
	this.all_page = "1";
	this.start_skp = "";
	this.start_page = "1";
	this.cur_page = "1";
	this.start_nav = "1";	
	this.total_page_count = "";
	this.total_data_count = "";
	this.query_str = "";
	////////////////////////////////////////////////////////////////////	
	this.filesepa = "/";	
	this.file_max_upload_size_chat = 1000;    //40M (53000000)
	this.file_max_upload_size_box = 1000;    //40M (53000000)
	this.is_mobile_connect = false;
	this.flasher = "";
	this.image_gallery = new Array();
	this.image_gallery_current = 1;
	this.panzoom = '';		
	this.source = new Array();
	this.log_save = "T";
	this.chat_room_info_ori = new Object();
	
	this.cur_channel_list_info = ""; //현재 가입된 채널의 정보 배열
	this.enter_opt = "";			//엔터값에 대한 설정
	
	this.draw_list = [];
	this.draw_list_status = {};	//draw_list에 표시된 사용자들의 status값을 저장한다
	this.rp = "";
	
	this.none_img = "../resource/images/none.jpg";
}

gapcommon.prototype = {		
	"check_locale" : function(){		
		//userLang: "ko"
		//userid: "AC912747"
		//로컬 스토리지에 정보가 있으면 먼저 가져온다.	
		var lang = gap.userinfo.userLang;
		var userid = gap.userinfo.rinfo.id;
		var loc = "";	
		var mserver = mailserver.toLowerCase();		
		
		if (location.href.indexOf("dev") > -1){
			loc = "dev";				
		}else{
			loc = "ko";
		}		
		if (loc != "dev"){
			gap.isDev = false;
			try{
				//localStorage를 지원하는 체크한다.
				var local_locale = localStorage.getItem(userid + "_locale");				
				if (local_locale == null || local_locale == ""){		
					//로컬스토리지에 정보가 없으면 메일 서버로 계산해야 한다.				
					localStorage.setItem(userid+"_locale", loc);					
				}else{
					loc = local_locale;				
				}				
			}catch(e){
				//localStorage를 지원하지 않는 경우 메일서버로 판단한다.
				//loc = local_locale;
			}		
		}else{
			gap.isDev = true;
		}				
		gap.set_locale(loc);
		
	},
	
	"set_locale" : function(loc){
		
		//var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ? true : false;
		var isMobile = (typeof(is_mobile) != "undefined" ? is_mobile : false);	
		if (loc == "dev"){
			//	sel_dns = "dswdv.daesang.com/dst";
				sel_dns = "webchat.kmslab.com:16181";
			//	sel_dns = "dswdv.daesang.com/dst";
				fileserver = gap.fileserver_dev;
				ogtagserver = "https://one.kmslab.com/ogtag";
				channelserver = "https://dev.kmslab.com";
				gap.filesepa = "\\";
				sid = "dev";
				gap.nasfolder = "Y:";
				gap.synapserver = "\\\\192.168.14.47\\talkdev";
				gap.rp = "https://one.kmslab.com";	
		}else{
			if (isMobile){
				gap.is_mobile_connect = true;
				sel_dns = "dswext.daesang.com/dst";
				fileserver = gap.fileserver_mobile;
				ogtagserver = "https://one.kmslab.com/ogtag/";
				channelserver = "https://one.kmslab.com/";
				gap.filesepa = "\\";
				sid = "ko_1";
				gap.nasfolder = "/dsw-synap/";
				//	gap.synapserver = "/dsw-bxfs";	
				//	gap.synapserver = "/dsw-synap";			
				gap.synapserver = "\\\\192.168.14.48\\dswsynap"
				gap.rp = "https://one.kmslab.com";	
			}else{
				sel_dns = "webchat.kmslab.com:16181";
				fileserver = gap.fileserver_ko;
				ogtagserver = "https://one.kmslab.com/ogtag/";
				channelserver = "https://one.kmslab.com/";
				gap.filesepa = "\\";
				sid = "ko_1";
				gap.nasfolder = "/dsw-synap/";
				//	gap.synapserver = "/dsw-bxfs";	
				//	gap.synapserver = "/dsw-synap";			
				gap.synapserver = "\\\\192.168.14.48\\dswsynap"
				gap.rp = "https://one.kmslab.com";	
			}			
		}	
		gap._ws_cur_sever = sel_dns;	
		gap.fileupload_server_url = fileserver;
		gap.ogtag_search_url = ogtagserver;
		gap.channelserver = channelserver;
		gap.sid = sid;
	},
	
	"search_fileserver" : function(sid){
		var fserver = "";
		if (sid == "ko_1"){
			fserver = gap.fileserver_ko;
		}else if (sid == "dev"){
			fserver = gap.fileserver_dev;
		}		
		return fserver;
	},
	
	"search_file_convert_server" : function(sid){
		var fserver = "";
		sid = sid.replace("http:", "https:");		
	//	if (sid.indexOf("apwepbxws00") > -1 || sid.indexOf("apwepbxws01") > -1 || sid.indexOf("apwepbxws02") > -1){
			// 국내
	//		fserver = "https://ap-on.amorepacific.com/WMeet";
			
	//	}else{
			fserver = sid;
	//	}		
		return fserver;
	},	
	
	"search_video_server" : function(sid){
		var fserver = "";				
//		if (sid == "https://ap-on.amorepacific.com/WMeet"){
//			fserver = "https://ap-on.amorepacific.com/vstream";
//		}else if (sid == "https://cnap-on.amorepacific.com/WMeet"){
//			fserver = "https://cnap-on.amorepacific.com/vstream";
//		}else if (sid == "https://agap-on.amorepacific.com/WMeet"){
//			fserver = "https://agap-on.amorepacific.com/vstream";
//		}else if (sid == "https://usap-on.amorepacific.com/WMeet"){
//			fserver = "https://usap-on.amorepacific.com/vstream";
//		}else if (sid == "https://frap-on.amorepacific.com/WMeet"){
//			fserver = "https://frap-on.amorepacific.com/vstream";
//		}		
		//본사에서는 이걸로 통일한다.
		return fserver;
	},	
	
	"server_check" : function(server){
		//ReverseProxy가 적용되지 않은 서버의 경우 정션명으로 적용될 수 있게 수정한다.
		//서버 지역별로 처리해야 할듯
		var res = server;
//		if (server.indexOf("http://apwepbxws00.amorepacific.com:8080") > -1){
//			res = "https://ap-on.amorepacific.com/WMeet";
//		}else if (server.indexOf("http://apwepbxws01.amorepacific.com:8080") > -1){
//			res = "https://ap-on.amorepacific.com/WMeet";
//		}else if (server.indexOf("http://apwepbxws02.amorepacific.com:8080") > -1){
//			res = "https://ap-on.amorepacific.com/WMeet";
//		}		
		res = res.replace("http://", "https://");		
		var isMobile = (typeof(is_mobile) != "undefined" ? is_mobile : false);
		if (isMobile){
			res = res.replace("dsw.daesang.com", "dswext.daesang.com");
		}		
		return res;
	},
	
	"getBaseUrl" : function(){
		var re = new RegExp(/^.*\//);
		return re.exec(window.location.href);
	},
	
	"getHostUrl" : function(){
		var url = location.protocol + '//' + location.host;
		return url;
	},	
	
	"load_init" : function(){
		//외부 사용자인지 체크한다.				
		gap.history_record("main");		
		gap.goHome();		
//		$("#addSearch").bind("keypress", function(e){
//			if (e.keyCode == 13){
//				gap.cPage = 1;
//				gap.getAddr(1);
//				return false;
//			}
//		});			
	},
	
	"load_init_mobile" : function(opt){
		if (opt){
			if (opt == "collect"){
				gap.goHome_collect_mobile();
				
			} else if (opt == "meet"){
				gap.goHome_meet_mobile();
				
			}else if (opt == "main"){
				gap.goHome_main_mobile();
				
			}else if (opt == "reg"){
				gap.goHome_reg_mobile();
			}			
		}else{
			gap.goHome_mobile();			
		}	
	},
	
	"load_init_mobile2" : function(){
		gap.goHome_mobile2();	
	},
	
	"home_refresh" : function(){
		//gap.goHome();		
		gap = new gapcommon();
		//////////////////////로그인 상태를 하고 언어 정보를 가져온다.    //////////////////////////////////////////////
		if (!gap.logincheck()) {
			gap.gAlert("Login Error !");
			return false;
		}else{
		//	gap.gAlert("로그인 아이디는 : " + gap.userinfo.userid + "/" + gap.userinfo.userLang);
		}
		////////////////////////////////////////////////////////////////////////////////////////////
		_wsocket = new _websocket();
		_wsocket.init_websocket();		
		//_wsocket.init_websocket();	
	},
	
	"goHome" : function(){
		try{
			gap.LoadPage_main("top_content", "main_top.html?open&ver="+jsversion);	
		}catch(e){}
	},

	"goHome_mobile" : function(){
		//gap.LoadPage("body_content", cdbpath+"/main_body_mobile.html");		
		var url = root_path + "/resource/html/main_body_mobile.html?open&ver=1.0";
		var id = "body_content";
		$("#"+id).load(url, function(response, status, xhr){
			if (status == "error"){
				var msg = "Site Error : "; 
				gap.gAlert(msg + xhr.status + " " + xhr.statusText);
				
			}else if (status == "success"){
				$("#"+id).show();
			}
		});
	},
	
	"goHome_mobile2" : function(){
		//gap.LoadPage("body_content", cdbpath+"/main_body_mobile.html");		
		var url = "main_body_mobile2.html";
		var id = "body_content";
		$("#"+id).load(url, function(response, status, xhr){
			if (status == "error"){
				var msg = "Site Error : "; 
				gap.gAlert(msg + xhr.status + " " + xhr.statusText);
				
			}else if (status == "success"){
				$("#"+id).show();
			}
		});
	},
	
	"goHome_collect_mobile" : function(){
		//gap.LoadPage("body_content", cdbpath+"/main_body_mobile.html");		
		var url = root_path + "/resource/html/main_collect_mobile.html?open&ver=1.0";
		var id = "body_content";
		$("#"+id).load(url, function(response, status, xhr){
			if (status == "error"){
				var msg = "Site Error : "; 
				gap.gAlert(msg + xhr.status + " " + xhr.statusText);
				
			}else if (status == "success"){
				$("#"+id).show();
			}
		});
	},
	
	"goHome_meet_mobile" : function(){
		var url = root_path + "/resource/html/main_meet_mobile.html?open&ver=1.0";
		var id = "body_content";
		$("#"+id).load(url, function(response, status, xhr){
			if (status == "error"){
				var msg = "Site Error : "; 
				gap.gAlert(msg + xhr.status + " " + xhr.statusText);				
			}else if (status == "success"){
				$("#"+id).show();
			}
		});
	},
	
	
	"goHome_main_mobile" : function(){
		var url = root_path + "/resource/html/main_main_mobile.html?open&ver=1.0";
		var id = "body_content";
		$("#"+id).load(url, function(response, status, xhr){
			if (status == "error"){
				var msg = "Site Error : "; 
				gap.gAlert(msg + xhr.status + " " + xhr.statusText);				
			}else if (status == "success"){
				$("#"+id).show();
			}
		});
	},
	
	"goHome_reg_mobile" : function(){
		var url = "main_reg_mobile.html?open&ver=1.0";
		var id = "body_content";
		$("#"+id).load(url, function(response, status, xhr){
			if (status == "error"){
				var msg = "Site Error : "; 
				gap.gAlert(msg + xhr.status + " " + xhr.statusText);				
			}else if (status == "success"){
				$("#"+id).show();
			}
		});
	},
	
	"load_init_sample" : function(){
	//	gap.LoadPage("top_content", "main_top.html");
		gap.LoadPage("body_content", "main_content.html");  //최초 로딩시만 이 함수를 사용하고 GNB클릭시는 그냥 LoadPage를 호출해야 한다.

	},
	
	"LoadPage_main" : function(id, url){		
		$("#bottom_content").hide();
		$("#"+id).load(url, function(response, status, xhr){			
			if (status == "error"){
				var msg = "Site Error : "; 
				gap.gAlert(msg + xhr.status + " " + xhr.statusText);
			}else if (status == "success"){			
				gap.LoadPage("body_content", "main_body.html?open&ver="+jsversion);  //최초 로딩시만 이 함수를 사용하고 GNB클릭시는 그냥 LoadPage를 호출해야 한다.
			}
		});
	},
	
	"LoadPage" : function(id, url){
		//$("#"+id).contents().remove();
		$("#bottom_content").hide();
		$("#"+id).load(url, function(response, status, xhr){
			if (status == "error"){
				var msg = "Site Error : "; 
				gap.gAlert(msg + xhr.status + " " + xhr.statusText);
			}else if (status == "success"){
				$("#"+id).show();
				$("#bottom_content").show();
			}
		});
	},
	
	"logincheck" : function(){
		var userid = gap.getCookie("userid");
		if (typeof(userid) == "undefined"){
			userid = mailid;
		}		
		var _lang = navigator.language || navigator.userLanguage;
		var browser_lang = ((_lang == "ko" || _lang == "ko-KR") ? "ko" : "en");		
		var lang = gap.getCookie("language");
		if (typeof(lang) == "undefined" || lang == "" || lang == "undefined" || lang == "lang"){
			userlang = browser_lang;	//"ko";
			gap.setCookie("language", userlang);			
		}else{
			if (lang == "vn"){
				lang = "vi";
				gap.setCookie("language", lang);
			}
			userlang = lang;
		}		
		var LtpaToken = gap.getCookie("LtpaToken");		
		if (typeof(userid) != "undefined" && typeof(LtpaToken) != "undefined"){
			gap.userinfo.userid = userid;
			gap.userinfo.userLang = userlang;			
			var lan = gap.userinfo.userLang;
			localStorage.setItem(userid + "_lang", lan);
			gap.curLang = lan;			
//			$.ajax({
//				method : "get",
//				url : "lang/" + lan + ".json",
//				dataType : "json",			
//				contentType : "application/json; charset=utf-8",
//				async : false,
//				success : function(data){	
//					gap.lang = data;					
//					//$("#dis").html("사용자 계정 : " + gap.userinfo.userid + " / 접속한 사용자 언어 : " + gap.userinfo.userLang + " / loading Title : " + gap.lang.title);
//				},
//				error : function(e){
//					gap.error_alert();
//				}
//			})		
			return true;
		}else{
			return false;
		}
	},	
	
	"logincheck_mobile" : function(){
		var userid = gap.getCookie("userid");
		if (typeof(userid) == "undefined"){
			userid = sabun;
		}		
		var LtpaToken = gap.getCookie("LtpaToken");		
		if (typeof(userid) != "undefined" && typeof(LtpaToken) != "undefined"){
			gap.userinfo.userid = userid;
			gap.userinfo.userLang = userlang;				
			if (userlang != "ko"){
				userlang = "en";
			}		
			gap.curLang = userlang;	
			return true;
		}else{
			return false;
		}
	},
	
	"change_text_title" : function(txt){
		if (call_key != ""){
			return false;
		}
	    document.title = txt;
	    var xtim5 = setTimeout(function () {
	    	gap.change_text_title(txt.substr(1) + txt.substr(0, 1));
	    	clearTimeout(xtim5);
	    }, 300);		
	},	
	
	"change_text_title_new" : function(txt){
		if (call_key != ""){
			return false;
		}
	    document.title = txt;	   	
	},
	
	"browser_title_set" : function(id){
		var tp = $("#"+id).find("span").text();
		if (id == "home"){
			tp = "Daesang Smart Work";
		}
		gap.change_text_title_new(gap.systemname + " " + tp);
	},	
	
	"error_alert" : function(){
	//	gap.gAlert("An error occurred during the request.<br>Please contact your administrator.");
		gap.gAlert(gap.lang.errormsg);		
	},
	
	"body_scroll_show" : function(){
		//$("body").removeClass("hidden-scroll");
		this.showBodyScroll();
	},
	
	"body_scroll_hide" : function(){
		$("body").addClass("hidden-scroll");
	},	
	
	"setCookie" : function(c_name, value, exdays){
		gap.removeCookie(c_name);
		var exdate=new Date();
		exdate.setDate(exdate.getDate() + exdays);
		
		var domain = "";
		if (location.hostname !== "localhost"){
			domain = "; domain=kmslab.com";
		}
		//var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString()) + "; path=/; domain=kmslab.com;";		
		
		var c_value = escape(value) + 
		                  ((exdays==null) ? "" : "; expires="+exdate.toUTCString()) + 
		                  "; path=/" + domain + ";"; // domain 변수 적용
		
		document.cookie=c_name + "=" + c_value;
	},	
	
	"getCookie" : function(c_name){
		var i,x,y,ARRcookies=document.cookie.split(";");
		for (i=0;i<ARRcookies.length;i++){
		  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		  x=x.replace(/^\s+|\s+$/g,"");
		  if (x==c_name){
			  return unescape(y);
		  }
		}
	},	
	
	"removeCookie" : function(c_name){
		document.cookie = c_name +'=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=daesang.com;';
	},
	
	"iso_date_convert" : function(dx){
		var date = new Date(dx);
		var year = date.getFullYear();
		var month = date.getMonth()+1;
		var dt = date.getDate();
		if (dt < 10) {
		  dt = '0' + dt;
		}
		if (month < 10) {
		  month = '0' + month;
		}		
		return year + "-" + month + "-" + dt ;	
	},		
	
	"textToHtml" : function(str){
		if (!str) return '';
		//if (str.length > 0) return str;
		str = str.replace(/&lt;/gi,"<").replace(/&gt;/gi,">");
		str = str.replace(/&#40;/gi,"(").replace(/&#41;/gi,")");
		str = str.replace(/&\#39;/gi,"'");
		str = str.replace(/&nbsp;/gi, " ");
		str = str.replace(/&amp;/gi, "");
		str = str.replace(/[\n\r]/gi,"<br>");
		return str;
	},
	
	"textToHtml2" : function(str){
		if (!str) return '';
		str = str.replace(/&lt;/gi,"<").replace(/&gt;/gi,">");
		str = str.replace(/&#40;/gi,"(").replace(/&#41;/gi,")");
		str = str.replace(/&\#39;/gi,"'");
		str = str.replace(/[\n\r]/gi,"<br>");
		str = str.replace(/\t/gi, "&nbsp;&nbsp;&nbsp;");
		str = str.replace(/ /gi, "&nbsp;");
		return str;
	},
	
	"textToHtmlBox" : function(str){
		if (!str) return '';
		//2025.03.31 &도 치환. a link걸기 전에 변경.
		str = str.replace(/&nbsp;/gi, " ");
		str = str.replace(/&amp;/gi, "");
		str = str.replace(/&lt;/gi,"<").replace(/&gt;/gi,">");
		str = str.replace(/&#40;/gi,"(").replace(/&#41;/gi,")");
		str = str.replace(/&\#39;/gi,"'");
		return str;
	},
	
	"textToHtmlEditor" : function(str){
		if (!str) return '';
		str = str.replace(/&lt;/gi,"<").replace(/&gt;/gi,">");
		str = str.replace(/&#40;/gi,"(").replace(/&#41;/gi,")");
		str = str.replace(/&\#39;/gi,"'");
		str = str.replace(/[\n\r]/gi,"<br>");
		return str;
	},	
	
	"HtmlToText" : function(str){
		if (!str) return '';
		str = str.replace(/\</gi,"&lt;").replace(/\#/gi,"&#35").replace(/\>/gi,"&gt;");
		str = str.replace(/\(/gi,"&#40;").replace(/\)/gi,"&#41;");
		str = str.replace(/\'/gi,"&\#39;"); //.replace(/\#/gi,"&#35");
		str = str.replace(/&nbsp;/gi, " ");
		return str;
	},

	"dateDiff3" : function(check_in, check_out){
	    var firstDate = new Date(check_in.replace('-' , '/'));
	    var secondDate = new Date(check_out.replace('-' , '/'));    
	    var diffDays = Math.abs((firstDate.getTime() - secondDate.getTime()) / 86400000);
	    return diffDays;
	},
	
	"dateDiff" : function(_date1, _date2){		
	    var diffDate_1 = _date1 instanceof Date ? _date1 : new Date(_date1);
	    var diffDate_2 = _date2 instanceof Date ? _date2 : new Date(_date2);	 
	    diffDate_1 = new Date(diffDate_1.getFullYear(), diffDate_1.getMonth()+1, diffDate_1.getDate());
	    diffDate_2 = new Date(diffDate_2.getFullYear(), diffDate_2.getMonth()+1, diffDate_2.getDate());	 
	    var diff = Math.abs(diffDate_2.getTime() - diffDate_1.getTime());
	    diff = Math.ceil(diff / (1000 * 3600 * 24));	 
	    return diff;
	},		
			
	"filedownload" : function(){
		var mod = gap.filedownload_mod;
		var email = gap.filedownload_email;
		var filename = gap.filedownload_filename;
		filename = encodeURIComponent(filename);		
		var url = gap.root_path + "/DownloadFile?mod="+mod+"&file="+filename+"&email="+email;
		location.href = url;
	},	
	
	"preview_img" : function(filename, email, mod){		
		$("#image_title").text("Image Viewer");		
		gap.body_scroll_hide();
		var url = "";
		if (filename.substring(0,3) == "ai_"){
			//AI페인터로 요청한 경우
			filename = filename.substring(3, filename.length);
			url = "/artimage/" + email + "/artRequest_AI/result/"+filename+"_out.jpg";
		}else{
			url = "/artimage/" + email + "/"+mod+"/" + filename;
		}	
		$("#popup_file_download").show();
		gap.filedownload_mod = mod;
		gap.filedownload_email = email;
		gap.filedownload_filename = filename;		
		$("#preview_image_src").attr("src",url);
		$("#preview_image_src").css("max-height", "750px");		
	//	gap.body_scroll_hide();
		$("#image_preview").show();			
		////////////////////////////////////////////////////////////////////
		$("#image_preview").popup({
			onclose: function(){		
				gap.body_scroll_show();
			}
		});		
		var inx = gap.maxZindex();
		$("#image_preview").css("z-index", parseInt(inx) + 1);		
		$("#image_preview").popup('show');		
		$('#image_preview').position({
		    of: $(window)
		});	
	},	
	
	"login_window_max" : function(){
		var inx = gap.maxZindex();				
		$("#exampleModalCenter").css("z-index", parseInt(inx) + 1);
	},
	
	"file_extension_check" : function(filename){
		if ($.isArray(filename)){
			filename = filename[0];
		}
		if (typeof(filename) == "undefined"){
			return false;
		}
		var extension = filename.replace(/^.*\./, '');
		return extension.toLowerCase();
	},	
	
	"no_upload_file_type_check" : function(filename){
		var extension = filename.replace(/^.*\./, '').toLocaleLowerCase();
		if (extension == "exe" || 
				extension == "msi" || 
				extension == "php" || 
				extension == "jsp" || 	
				extension == "asp" || 
				extension == "cgi" || 
				extension == "js" || 
				extension == "py" || 
				extension == "java" || 
				extension == "aspx" || 
				extension == "cfm") {
			return true;
		}
		return false;
	},
	
	"file_icon_check" : function(filename){
		if (typeof(filename) == "undefined"){
			return false;
		}
		var ext = gap.file_extension_check(filename);
		ext = ext.toLowerCase();
		var disext = "";
		if (ext == "ppt" || ext == "pptx"){
			disext = "ppt";
		}else if (ext == "xls" || ext == "xlsx"){
			disext = "excel";
		}else if (ext == "doc" || ext == "docx"){
			disext = "word";
		}else if (ext == "pdf"){
			disext = "pdf";
		}else if (ext == "txt"){
			disext = "txt";
		}else if (ext == "hwp"){
			disext = "hwp";
		}else if (ext == "zip" || ext == "jar" || ext == "gzip"){
			disext = "zip";
		}else if (ext == "mp4" || ext == "avi" || ext == "mkv" || ext == "mov" || ext == "wmv" || ext == "3gp" || ext == "flv"){
			disext = "video";
		}else if (ext == "hwp"){
			disext = "hwp";
		}else if (ext == "jpg" || ext == "jpeg" || ext == "gif" || ext == "png"){
			disext = "img";
		}else{
			disext = "etc";
		}		
		return disext;
	},	
	
	"file_icon_check_mu" : function(filename){
		
		if (typeof(filename) == "undefined"){
			return false;
		}
		var ext = gap.file_extension_check(filename);
		ext = ext.toLowerCase();
		var disext = "";
		if (ext == "ppt" || ext == "pptx"){
			disext = "power";
		}else if (ext == "xls" || ext == "xlsx"){
			disext = "exel";
		}else if (ext == "doc" || ext == "docx"){
			disext = "word";
		}else if (ext == "pdf"){
			disext = "pdf";
		}else if (ext == "hwp"){
			disext = "hwp";
		}else if (ext == "txt"){
			disext = "txt";
		}else if (ext == "zip" || ext == "jar" || ext == "gzip"){
			disext = "zip";
		}else if (ext == "mp4" || ext == "avi" || ext == "mkv" || ext == "mov" || ext == "wmv" || ext == "3gp" || ext == "flv"){
			disext = "video";
		}else if (ext == "jpg" || ext == "jpeg" || ext == "gif" || ext == "png"){
			disext = "img";
		}else{
		//	disext = "unknown";
			disext = "etc";
		}		

		return disext;
	},		
	
	"file_size_setting" : function(fileSize){	
		var fixed = true;		
	    var str
	    //MB 단위 이상일때 MB 단위로 환산
	    if (fileSize >= 1024 * 1024 * 1024) {
	        fileSize = fileSize / (1024 * 1024 * 1024);
	        fileSize = (fixed === undefined) ? fileSize : fileSize.toFixed(fixed);
	        str = gap.numberComma(fileSize) + ' G';
	        
	    }else if (fileSize >= 1024 * 1024) {
	        fileSize = fileSize / (1024 * 1024);
	        fileSize = (fixed === undefined) ? fileSize : fileSize.toFixed(fixed);
	        str = gap.numberComma(fileSize) + ' MB';
	    }
	    //KB 단위 이상일때 KB 단위로 환산
	    else if (fileSize >= 1024) {
	        fileSize = fileSize / 1024;
	        fileSize = (fixed === undefined) ? fileSize : fileSize.toFixed(fixed);
	        str = gap.numberComma(fileSize) + ' KB';
	    }
	    //KB 단위보다 작을때 byte 단위로 환산
	    else {
	        fileSize = (fixed === undefined) ? fileSize : fileSize;
	        str = gap.numberComma(fileSize) + ' byte';
	    }
	    return str;		
	},
	
	"comma" : function(num){		
		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");	    
	},
	
	"numberComma" : function(x) {
		return (x == null || isNaN(x)) ? '' : x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	},
	
	"removeComma" : function(str){
		return str.replace(/\,/gi, "");
	},	
	
	"open_search_address" : function(){
		var _url = gap.root_path + "/service/addSearch.jsp";
		gap.open_subwin(_url , '800', '600', 'yes', '', 'yes')
	},
	
	
	
	"date_term" : function(dat, disdate){
		var old = new Date (dat);
		var now = new Date();			
		var gapt = now.getTime() - old.getTime();
		var min_gap = gapt / 1000 /60;		
		if (min_gap < 0){
			min_gap = 0;
		}
		if (parseInt(min_gap) > 60){
			var hour_gap = gapt / 1000 /60 / 60;

			if (parseInt(hour_gap) > 60){
				return gap.iso_date_convert(dat);
			}else{
				return parseInt(hour_gap) + ""  + gap.lan.beforehours;
			}
			
		}else{
			return parseInt(min_gap) + ""  + gap.lan.beforeminute;
		}
	}, 	
	
	"iso_date_convert" : function(dx){
		var date = new Date(dx);
		var year = date.getFullYear();
		var month = date.getMonth()+1;
		var dt = date.getDate();
		if (dt < 10) {
		  dt = '0' + dt;
		}
		if (month < 10) {
		  month = '0' + month;
		}
		var hour = "0" + date.getHours();
		var minute = "0" + date.getMinutes();
		var second = "0" + date.getSeconds();		
		return year + "-" + month + "-" + dt + " " + hour.substring(hour.length-2, hour.length) + ":" + minute.substring(minute.length-2, minute.length) + ":" + second.substring(second.length-2, second.length);
	},
	
	"userinfo_sepa" : function(user, contacts){
		var res = "";
		var spl = contacts.split(" ");
		for (var i = 0 ; i < spl.length; i++){
			if (spl[i] != user){				
				var info = spl[i].split("/");
				res = info[0].replace("cn=","") + "^" + info[1].replace("ou=","");
				break;
			}
		}
		return res;
	},
	
	"no_photo_draw" : function(image){
		//   onerror=\"gap.no_photo_draw(this)\"  <== 이미지 소스 다음에 이 소스를 추가한다.
		image.onerror = "";
		image.src = gap.root_path + "/img/noperson.png";
		return true;
	},
		
	"open_subwin" : function(url, width, height, scrollbars, win_name, resizable){
		var opt_scrollbars = (scrollbars == null)?"yes":scrollbars;
		var opt_resizable = (resizable == null)?"yes":resizable;
		var window_name = (win_name == null)?"subwin":win_name;
		//var winFeature = set_center(width, height) + ",menubar=no,resizable=no ,scrollbars="+opt_scrollbars;		
		var winFeature = gap.set_center(width, height) + ",menubar=no,resizable="+opt_resizable+",scrollbars="+opt_scrollbars;
		var subwin = window.open(url, window_name, winFeature);
		return subwin;
	},
	
	"set_center" : function(win_width, win_height){
		winx = Math.ceil((screen.availWidth - win_width) / 2);
		winy = Math.ceil((screen.availHeight - win_height) / 2);
		return "left=" + winx + ",top=" + winy + ",width=" + win_width + ",height=" + win_height;
	},
	
	"open_null" : function(url){
		window.open(url, "", null);
	},
	
	/////////////////////////// 리스트 페이징 시작 //////////////////////////////////////////////////////////////
	"search_paging" : function(page){
		var alldocuments = gap.totalcount;
		if (alldocuments % gap.perpage > 0 & alldocuments % gap.perpage < gap.perpage/2 ){
			allPage = Number(Math.round(alldocuments/gap.perpage)) + 1;
		}else{
			allPage = Number(Math.round(alldocuments/gap.perpage));
		}	
		gap.search_navigator(page);
	},
	
	"search_navigator" : function(page){
		var nav_cpage = page;
		var alldocuments = gap.totalcount;
		if (alldocuments == 0){
			alldocuments = 1;
			nav_cpage=1;
			allPage = 1;
	    }
		if (alldocuments != 0) {
			if (allPage % 10 > 0 & allPage % 10 < 5 ) {
				var allFrame = Number(Math.round(allPage/10)) + 1;
			}else{
				var allFrame = Number(Math.round(allPage/10))	;
			}
			if (nav_cpage % 10 > 0 & nav_cpage % 10 < 5 ){
				var cFrame = Number(Math.round(nav_cpage/10)) + 1;
			}else{
				var cFrame = Number(Math.round(nav_cpage/10));
			}
			var nav = new Array();		
			if (cFrame == 1 ){
				nav[0] = '';
			}else{
				nav[0] = '<li class="p_prev"><a href="#" class="xico" onclick="javascript:gap.gotoPage(' + ((((cFrame-1)*10)-1)*gap.perpage+1) + ',' + ((cFrame-1)*10) + ');">&lt;</a></li>';
			}
			var pIndex = 1;
			var startPage = ((cFrame-1) * 10) + 1;			
			for (var i = startPage; i < startPage + 10; i++){
				if (i == nav_cpage){
					if (i == '1'){
						nav[pIndex] = '<li class="on"><a href="#">' + i + '</a></li>';
					}else{
						if (i%10 == '1' ){
							nav[pIndex] = '<li class="on"><a href="#">' + i + '</a></li>';
						}else{
							nav[pIndex] = '<li class="on"><a href="#">' + i + '</a></li>';
						}						
					}
				}else{
					if (i == '1'){
						nav[pIndex] = "<li><a href=# onclick='gap.gotoPage("+ (((i-1) * gap.perpage) + 1 ) + ", "+ i + ", this)'>" + i + "</a></li>";
						
					}else{
						if (i%10 == '1' ){
							nav[pIndex] = "<li><a href=# onclick='gap.gotoPage("+ (((i-1) * gap.perpage) + 1 ) + "," + i + ", this)'>" + i + "</a></li>";	
						}else{
							nav[pIndex] = "<li><a href=# onclick='gap.gotoPage("+ (((i-1) * gap.perpage) + 1 ) + "," + i + ", this)'>" + i + "</a></li>";
						}
					}
				}
				if (i == allPage) {
					//nav[pIndex + 1] = '<td width="30" height="15" align="right"></td>';
					break;
				}
				pIndex++;				
			}
			
			if (cFrame < allFrame){
				nav[nav.length] = '<li class="p_next"><a href="#" class="xico" onclick="javascript:gap.gotoPage(' + ((cFrame*gap.perpage*10) + 1) + ',' + ((cFrame*10)+1) + ');">&gt;</a></li>';
			}					
	        var navHTML = "";
			if (cFrame == 1 ){
				navHTML = '';
	          }else{
				navHTML = '<li class="p_first"><a href="#" class="xico" onclick="javascript:gap.gotoPage(1,1);">&lt;&lt;</a></li>';
	          }		    
			for( var i = 0 ; i < nav.length ; i++){	
	          	navHTML = navHTML + nav[i];
			}					
			if (cFrame < allFrame){
				navHTML = navHTML + '<li class="p_last"><a href="#" class="xico" onclick="javascript:gap.gotoPage(' + ((allPage - 1)*gap.perpage + 1) +','+ allPage +')">&gt;&gt;</a></li>';
	        }else{
				navHTML = navHTML;
	        }	    
			$("#zipcode_NAVIGATE").html('<div class="paging"><ul>' + navHTML + '</ul></div>');
		}
	},
	
	"gotoPage" : function(Index, PageNum, obj){
		var nav_cpage = PageNum;
		oldpage = nav_cpage;		
		gap.getAddr(PageNum);
	},
	//////////////////////////////////////// 리스트 페이징 종료    /////////////////////////////////////////////
	"makeRandom" : function(length){
		return Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
	},
		
	"history_record" : function(before){
		try{
			if (gap.history == false){
				var stateObj = {before : before};
				history.pushState(stateObj, "", "/");
			}
		}catch(e){}		
	},		
	
	"isMobile": function(){
		var md=new MobileDetect(window.navigator.userAgent);
		return md.mobile();
	},	
		
	"gAlert" : function(content, callback){	
		type = "default";
		title = "Alert";
		animation = "top";
		$.alert({
			title : title,
			content : content + "<hr>",
			closeIcon : true,
			closeIconClass : "fa fa-close",
			columnClass : "small",    //xsmall, small, medium, large, xlarge
			backgroundDismiss: true,
			animation : animation,
			animateFromElement : false,
			escapeKey : true,
		//	useBootstrap: false,    //userBootstrap : false로 하면 boxWidth를 지정할 수 있다.
		//	boxWidth : "100%",
			animationBounce : 2,
			buttons : {
				OK : {
					keys: ['enter'],
					text : "확인",		
					btnClass : "btn-"+type,
					action : function(){
						if (callback) callback();
					}
				}				
			}
		});
	},	
	
	"gConfirm":function(msg, callback){
		$.confirm({
			title : " ",
			content : msg +"<hr>",
			type : "default",  
			closeIcon : true,
			closeIconClass : "fa fa-close",
			columnClass : "small",  
			animation : "top", 
			animateFromElement : false,
			closeAnimation : "scale",
			animationBounce : 1,	
			backgroundDismiss: false,
			escapeKey : false,
			buttons : {		
				confirm : {
					keys: ['enter'],
					text : "확인",
					btnClass : "btn-default",
					action : function(){
						if (callback) callback();
					}
				},
				cancel : {
					keys: ['esc'],
					text : "취소",
					btnClass : "btn-default",
					action : function(){
						
					}
				}
			}
		});			
	},	
	
	"draw_qtip" : function(targetid, html){
		$(targetid).qtip({
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			content : {
				text : html
			},
			show : {
				event: 'click',
				ready: true
			},
			hide : {
				event : 'click mouseleave',
				//event : 'mouseout',
				fixed : true
			},
		
			style : {
				classes : 'qtip-bootstrap',
				tip : false
			},
			position : {
				my : 'top center',
				at : 'bottom center',
				target : $(this)
			}
		});
	},	
	
	"draw_qtip_left" : function(targetid, html){
		html = "<div style='padding:10px'>" + html + "</div>";
		var inx = gap.maxZindex() + 1;	
		$(targetid).qtip({
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			zIndex : inx,
			content : {
				text : html
			},
			show : {
				event: 'mouseover'
			//	ready: true
			},
			hide : {
				event : 'click mouseleave'
				//event : 'mouseout'
				//fixed : true
			},
			style : {
				
			},
			position : {
				my : 'top right',
				at : 'bottom left',
				adjust : {
			        method : 'shift'
			    }
			},
			events : {
//				hidden : function(event, api){				
//					api.destroy(true);
//				},
//				open : function(event, api){
//					
//				}
			}
		});					
	},
	
	"draw_qtip_left_top" : function(targetid, html){
		html = "<div style='padding:10px'>" + html + "</div>";
		$(targetid).qtip({
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			content : {
				text : html
			},
			show : {
				event: 'mouseover'
			//	ready: true
			},
			hide : {
				//event : 'click unfocus',
				event : 'mouseout'
				//fixed : true
			},
			style : {
				
			},
			position : {
				my : 'bottom right',
				at : 'top left',
				adjust : {
			        method : 'shift'
			    }
			}
		});					
	},
	
	"draw_qtip_right" : function(targetid, html){
		html = "<div style='padding:10px'>" + html + "</div>";
		$(targetid).qtip({
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			content : {
				text : html
			},
			show : {
				event: 'mouseover'
			//	ready: true
			},
			hide : {
				//event : 'click unfocus',
				event : 'mouseout'
				//fixed : true
			},
			style : {
				
			},
			position : {
				my : 'top left',
				at : 'bottom right',
				adjust : {
			        method : 'shift'
			    }
			}
		});					
	},
	
	
	"draw_qtip_right_bottom" : function(targetid, html){
		html = "<div style='padding:10px'>" + html + "</div>";
		$(targetid).qtip({
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			content : {
				text : html
			},
			show : {
				event: 'mouseover'
			//	ready: true
			},
			hide : {
				//event : 'click unfocus',
				event : 'mouseout'
				//fixed : true
			},
			style : {
				
			},
			position : {
				my : 'bottom left',
				at : 'top left',
				adjust : {
			        method : 'shift'
			    }
			}
		});					
	},
	
	
	"show_content" : function(opt){		
	
		$("#sub_notice_list").hide();
		$("#sub_notice_content").hide();		
		if (gBody.cur_tab != "tab3" && gBody.cur_tab != "tab4"){
			$("#sub_channel_content").hide();
		}	
		if (opt != "ext"){
			$("#ext_body_search").hide();
		}else{
			$("#ext_body").css("width", "300px");
		}
		if (opt == "main"){
			//메인을 오픈하는 경우			
			$("#user_profile").removeAttr("class");
			$("#user_profile").addClass("right-area my-profile");
			gBody.myinfo_draw();
			$("#center_content").removeAttr("class");
			$("#center_content").addClass("left-area room-list mCustomScrollbar _mCS_13 mCS-autoHide mCS_no_scrollbar");			
			$("#center_content").show();
			$("#user_profile").show();			
			$("#chat_content").hide();
			$("#chat_profile").hide();			
			$("#user_search_content").hide();			
			$("#sub_search_content").hide();
			$("#sub_search_profile").hide();			
			$("#ext_body").hide();
			$("#ext_body_more").hide();			
		}else if (opt == "chat"){
			//채팅방을 오픈하는 경우		
			$("#center_content").hide();
			$("#user_profile").hide();			
			$("#chat_content").show();
			$("#chat_content").css("overflow", "hidden");			
			$("#chat_profile").show();
			$("#chat_profile").css("overflow", "hidden");			
			$("#user_search_content").hide();			
			$("#sub_search_content").hide();
			$("#sub_search_profile").hide();			
			$("#ext_body").hide();
			$("#ext_body_search").hide();
			$("#ext_body_more").hide();			
			$("#sub_channel_content").hide();
			$("#box_search_content").hide();			
			
			// 채팅창만 새창으로 별도로 띄운경우는 화상회의 버튼 숨김처리
			if (window.call_key != '') {
				$('#realtime_video2').hide();
			} else {
				$('#realtime_video2').show();
			}
				
		}else if (opt == "usearch"){	
			//사용자 검색을 오픈하는 경우 / 이전대화 검색하는 경우
			$("#center_content").hide();
			$("#user_profile").hide();		
			$("#chat_content").hide();		
			$("#user_search_content").show();
			if (gap.curpage == "chat"){
				if ($("#right_menu_collpase_btn").hasClass("on")){					
				}else{
					$("#user_search_content").css("width","calc(100%-"+gap.right_page_width+")");
					$("#chat_profile").show();
				}
			}else{
				$("#chat_profile").hide();
			}			
			$("#sub_search_content").hide();
			$("#sub_search_profile").hide();			
		}else if (opt == "subsearch"){
			//사용자 초대를 오픈하는 경우
			$("#center_content").hide();
			$("#user_profile").hide();			
			$("#chat_content").hide();
			$("#chat_profile").hide();			
			$("#user_search_content").hide();			
			$("#sub_search_content").show();
			$("#sub_search_content").css("overflow", "hidden");
			$("#sub_search_content").css("width", "99%");			
			$("#sub_search_profile").hide();
			$("#sub_search_profile").css("overflow", "hidden");			
			$("#channel_right").hide();			
			$("#ext_body").hide();
			$("#ext_body_more").hide();			
		}else if (opt == "subsearch_memo"){
			//사용자 초대를 오픈하는 경우
			$("#center_content").hide();
			$("#user_profile").hide();			
			$("#chat_content").hide();
			$("#chat_profile").hide();		
			$("#user_search_content").hide();			
			$("#sub_search_content").show();
			$("#sub_search_content").css("overflow", "hidden");
			$("#sub_search_profile").show();
			$("#sub_search_profile").css("overflow", "hidden");			
		}else if (opt == "ext"){
			//우측메뉴에 기타 기능  오픈하는 경우			
			$("#ext_body_more").empty();
			$("#ext_body_more").hide();			
			$("#ext_body").fadeIn();			
		}else if (opt == "ext_more"){
			//우측메뉴에 기타 기능  오픈하는 경우
			$("#ext_body_more").fadeIn();
			$("#ext_body_more").css("overflow", "hidden");
		}else if (opt == "notice_list"){
			//공지사항을 오픈하는 경우
			$("#sub_notice_list").show();
			$("#sub_notice_list").css("overflow", "hidden");			
		}else if (opt == "notice_content"){
			//공지사항 내용을 오픈하는 경우
			$("#sub_notice_content").show();
			$("#sub_notice_content").css("overflow", "hidden");
		}else if (opt == "channel"){
			$("#sub_channel_content").show();
			$("#sub_channel_content").css("overflow", "hidden");
			$("#box_search_content").empty();	//Box 통합검색결과 클리어			
		}else if (opt == "box_search"){
			$("#center_content").hide();
			$("#user_profile").hide();
			$("#chat_content").hide();
			$("#chat_profile").hide();
			$("#user_search_content").hide();
			$("#sub_channel_content").hide();			
			$("#box_search_content").show();
			$("#box_search_content").css("overflow", "hidden");
		}else if (opt == "todo_main"){
			$("#center_content").show();
			$("#center_content").removeAttr("class");
			$("#center_content").addClass("left-area todo fold-temp");			
			$("#chat_content").hide();
			$("#chat_profile").hide();			
			$("#user_search_content").hide();			
			$("#sub_search_content").hide();
			$("#sub_search_profile").hide();			
			$("#ext_body").hide();
			$("#ext_body_more").hide();
		}else if (opt == "todo_status"){			
			$("#center_content").show();
			$("#user_profile").show();
			$("#center_content").removeAttr("class");
			$("#center_content").addClass("left-area todo fold-temp");			
			$("#chat_content").hide();
			$("#chat_profile").hide();			
			$("#user_search_content").hide();			
			$("#sub_search_content").hide();
			$("#sub_search_profile").hide();			
			$("#ext_body").hide();
			$("#ext_body_more").hide();
		}else if (opt == "drive"){			
			$("#sub_channel_content").show();			
			$("#sub_channel_content").removeAttr("class");
			$("#sub_channel_content").addClass("left-area chatting channel drive");			
			$("#chat_content").hide();
			$("#chat_profile").hide();			
			$("#user_search_content").hide();			
			$("#sub_search_content").hide();
			$("#sub_search_profile").hide();			
			$("#ext_body").hide();
			$("#ext_body_more").hide();
		}else if (opt == "org"){			
			$("#sub_channel_content").show();			
			$("#sub_channel_content").removeAttr("class");
			$("#sub_channel_content").addClass("left-area chatting channel drive");			
			$("#chat_content").hide();
			$("#chat_profile").hide();			
			$("#user_search_content").hide();			
			$("#sub_search_content").hide();
			$("#sub_search_profile").hide();			
			$("#ext_body").hide();
			$("#ext_body_more").hide();
		}		
		gma.refreshPos();
	},
	
	"show_chat_room" : function(){		
		$(".left-area").css("width", "calc(100% - "+gap.right_page_width+")");		
		$("#chat_msg").mCustomScrollbar('destroy');
		$("#file_wrap").mCustomScrollbar('destroy');
		gap.show_content("chat");
		gap.curpage = "chat";
		gap.backpage = "";		
		gBody.chatroom_dis();
	},
	
	"clearSelection" : function(){
		try{
			if(document.selection && document.selection.empty) {
		        document.selection.empty();
		    } else if(window.getSelection) {
		        var sel = window.getSelection();
		        sel.removeAllRanges();
		    }
		}catch(e){}		
	},	
	
	"tost" : function(txt, tim, type){
		if (tim == ""){
			tim = 3000;
		}
		$.toast({
			heading : "Infomation",
			text : txt,
			icon : type,                    //info, error, warning, success
			loader : true,			
			showHideTransition : "slide",       //slide, fade, plain
			hideAfter : tim,                   //기본 5초 , false, 2000 적용 가능
		//	allowToastClose: true,
		//	stack : 3,							//연속으로 호출시 몇층까지 적용할 것인지 기본 5층 , false 일경우 하나씩 표시됨
			position : "top-center",			//bottom-left,right,center, top-left,right,center, mid-center {top: 100, left:200}
			bgColor : '#92b4e2',
			textColor : 'white',
			textAlign : 'left',
			loaderBg : "#3f51b5",    //#9EC600			
			beforeShow : function(){
				$(".jq-toast-wrap").css("top", "12px");
			},
			afterShow : function(){},
			beforeHide : function(){},
			afterHidden : function() {}			
		});
	},	
	
	"tost_receive" : function(txt, tim, type, header){		
		if (tim == ""){
			tim = 3000;
		}
		$.toast({
			heading : header,
			text : txt,
			icon : type,                    //info, error, warning, success
			loader : true,			
			position : "bottom-right",			//bottom-left,right,center, top-left,right,center, mid-center {top: 100, left:200}						
			showHideTransition : "slide",       //slide, fade, plain
			hideAfter : tim,                   //기본 5초 , false, 2000 적용 가능
			allowToastClose: true,
			stack : 5,						//연속으로 호출시 몇층까지 적용할 것인지 기본 5층 , false 일경우 하나씩 표시됨			
			bgColor : '#ffffff',			
			textColor : 'black',
			textAlign : 'left',
			loaderBg : "#929292",    //#9EC600			
//			beforeShow : function(){
//				$(".jq-toast-wrap").css("top", "12px");
//			}
			afterShow : function(){},
			beforeHide : function(){},
			afterHidden : function() {}			
		});
	},	
	
	"clear_toast_alram" : function(cid){
		//cid 형태는 s_nhm_... encodeid 함수를 	
	//	var cid = gap.encodeid(cid);
		var list = $(".jq-toast-single");				
		for (var i = 0 ; i < list.length; i++){
			//동일한 채팅창에서 온 메시지는 모두 사라지게 처리한다.			
			var oob = list[i];			
			if ($(oob).find(".webchat-alarm ").attr("data") == cid){
				$(oob).find(".close-jq-toast-single").click();
			}			
		}
	},
	
	"change_title" : function(opt, title){		
		if (call_key != ""){
			//새창을 띄울때는 창의 윈도우 타이틀을 채팅방명으로 설정하기 위해서 예외처리한다.
			return false;
		}	
		var msg = title;		
		if (opt == "1"){
			//초기값을 세팅한다.	
			//msg = "AP-ON " + gap.lang.title;
			//msg = "Daesang Smart Work"
			//document.title = msg;
			//$.titleAlert.stop();
		}else if (opt == "2"){
			//HTTPS적용 후 크롬 알림으로 변경하고 해당 기능은 제거한다.
			msg = gap.lang.newmemo;
		}else if (opt == "3"){
			msg = title;
		}else{
			msg = gap.lang.newmsg;
			$.titleAlert(msg, {interval:700});			 
		}
		if (msg != ""){
			document.title = msg;
		}		
	},
	
	"check_image_file" : function(file){
		var reg = /(.*?)\.(jpg|jpeg|png|gif)$/;
	  	if(file.toLowerCase().match(reg)) {
			return true;
		} else {
			return false;
		}
	},
		
	"show_user_profile" : function(obj){
		var info = obj;
		if (typeof(info) == "undefined"){
			return false;
		}		       
		var dept = "";
		if (typeof(info.dp) != "undefined"){
			dept = info.dp.replace("#","");
		}		
		var mobile = "";
		if (typeof(info.mp) != "undefined"){
			mobile = info.mp;
		}	
		var person_img = gap.person_profile_img(info.em);
		var person_img = gap.person_profile_photo(info);		
		var html = "";
		html += "<div class='user-info' style='display:block;left:0;top:0;'>";
		html += "	<div class='user'>";
		html += "		<div class='user-info-thumb'>"+person_img+"</div>";
		html += "		<ul style='list-style:none'>";
		html += "			<li class='kname'>"+info.nm+"</li>";
		html += "			<li class='ename'>"+info.enm+"</li>";
		html += "			<li class='email'>"+info.em+"</li>";
		html += "			<li>"+mobile+"</li>";
		html += "			<li>"+dept+" / "+info.cp+"</li>";
		html += "		</ul>";
		html += "	</div>";
		html += "</div>";		
		var oob = gBody.click_img_obj;	
		$(oob).qtip({
			prerender : false,
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			content : {
				text : html
			},
			show : {
				event: 'click',
				ready: true
			},
			hide : {
				//event : 'click unfocus',
				event : 'mouseout',
				fixed : true
			},
			style : {
				classes : 'qtip  qtip-rounded qtip-shadow'
			//	tip : false
			},
			position : {
				my : 'top left',
				at : 'bottom center',
			//	target : $(this)
				adjust: {
					method: 'none shift'
	         //     x: 1,
	         //     y: 1
				}
			},
			events : {
				hidden : function(event, api){
					api.destroy(true);
				}
			}		
		});				
	},	
	
	"maxZindex" : function(){
		var zIndexMax = 0;
		$("header, div, article, section, nav, aside, #alram_layer").not("[class*='mbsc-']").each(function(){
			if (!$(this).is(':visible')) return true;
			var z = parseInt($(this).css("z-index"));
			if (z > zIndexMax) zIndexMax = z;
		});
		return parseInt(zIndexMax);
	},	
	
	"close_preview_img" : function(){
		$("#preview_img_src").attr("src","");
		$("#preview_img").hide();
	},
	
	"close_preview_download" : function(){		
		
		var url = $("#preview_img_src").attr("data");		
		var inx = url.indexOf("?OpenElement");
		if (inx > -1){
			url = url.substring(0, inx + 12);
		}		
		gap.file_download(url);
		return false;
	},
	
	"hide_favorite_layer" : function(){		
		//즐겨찾기 내용이 없을 경우 스타일 정리 ///////////////////////////////////////////////////////////////////////////////////////
		$("#left_favorite").hide();
		$("#add_group_btn").css("top", "35px");   //그룹 추가 버튼을 위로 올린다.
		$(".nav-list").css("height", "calc(100% - 45px)");		
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	},
	
	"show_favorite_layer" : function(){
		$("#left_favorite").show();
		$("#add_group_btn").css("top", "126px");   //그룹 추가 버튼을 위로 올린다.
		$(".nav-list").css("height", "calc(100%-70px)");
	},
	
	"search_room_first_user" : function(obj){
		
	},	
	
	"scroll_move_to_bottom" : function(id){		
		$("#" + id).mCustomScrollbar("scrollTo","bottom");
	},
	
	"scroll_move_to_bottom_time" : function(id, tim){		

		var xtim6 = setTimeout(function(){
			try{
				$("#" + id).mCustomScrollbar("scrollTo","bottom");
			}catch(e){}			
			clearTimeout(xtim6);
		},tim);
		
	},
	
	"scroll_move_to_bottom_time_gpt" : function(tim){		

		var xtim6 = setTimeout(function(){
			try{
				$("#" + gptapps.dis_scroll).mCustomScrollbar("scrollTo","bottom");
			}catch(e){}			
			clearTimeout(xtim6);
		},tim);
		
	},
	
	"scroll_move_to_bottom_time_auto_pos" : function(id, tim){
		//밑으로 내리고 다시 읽지 않은 표시 부분을 이동한다.
		var xtim6 = setTimeout(function(){
			try{			
				//setTimeout(function(){
					$("#channel_list").mCustomScrollbar("scrollTo", $("#read_time_check").position().top - 10); 
				//}, 500);
				
			}catch(e){}			
			clearTimeout(xtim6);
		},tim);
		//clearTimeout(xtim6);
	},
	
	"scroll_move_to_top_time" : function(id, tim){
		var xtim6 = setTimeout(function(){
			try{
				$("#" + id).mCustomScrollbar("scrollTo","top");
			}catch(e){}
			
			clearTimeout(xtim6);
		},tim);
	},
	
	"goP" : function(url){
		window.open(url, null);		
		if (typeof(event) != "undefined"){
			event.stopPropagation();
		}
	},
	
	"goP2" : function(url, event){
		window.open(url, null);		
		if (typeof(event) != "undefined"){
			event.stopPropagation();
		}		
	},	
	
	"aLink" : function(str){		
		return str.autoLink({target:"_blank"});
	},
	
	"search_mailid" : function (str){
		//이메일에서 아이디 값만 골라 내기
		if (typeof(str) == "undefined"){
			return false;
		}
		var inx = str.indexOf("@");
		var id = str.substring(0,inx);
		return id;
	},
	
	"seach_canonical_id" : function(str){
		//notesid 에서 아이디 값만 가져오기		
		if (typeof(str) == "undefined"){
			return false;
		}
		var inx1 = str.indexOf("OU=");
		var inx2 = str.indexOf(",O=");
		var res = str.substring(inx1+3, inx2);
		res = res.replace(".","_");			
		return res;
	},
	
	"search_username" : function(str){		
		if (typeof(str) == "undefined"){
			return false;
		}
		var inx1 = str.indexOf(",OU=");
		var res = str.substring(3, inx1);
		return res;
	},	
	
	"buddy_set_status" : function(){
		
		var blist = $("#buddylist_main .groupClass").children();
		for (var i = 0 ; i < blist.length; i++){
			xbun = i;
			var offcount = $("#group_ul_"+xbun).children().find(".offline").length;
			var rcount = $("#group_ul_"+xbun).children().length;
			var tcount = parseInt(rcount) - parseInt(offcount);
			$("#group_"+xbun+"_online_cnt").text(tcount);
		}
	},	
	
	"buddy_change_status" : function(id, val, msg, opt, exst){
		//버디리스트에 사용자별 상태 변경이 호출될때 처리되는 함수
		//- 사용자 상태 변경 : 0(offline), 1(online), 2(부재중), 3(방해금지), (사용자 정의 : 151~255)
		
		// 퀵채팅 상태값 업데이트 추가
		gma.updateStatus(id, val, msg, exst);
					
		id = id.replace(/\./gi,"_");
		//id = id.replace(/\./gi,"-spl-");
		var tkey = "person_" + id + "_status";		
			
		var list = $("#buddylist_main").find("[data-status="+id+"]");		
		var xbun = "";
		list.removeClass();
		
		
		//휴가 정보가 있을 경우 설정해준다.
		if (exst != ""){
			var list2 = $("#buddylist_main").find("[data="+id+"]").find("dt");
			list2.prepend('<span class="biz_check day_' + exst + '">' + gOrg.userDayText(exst) + '</span>');
		}	
		
		for (var i = 0 ; i < list.length; i++){
			var info = list[i];
			var bun = $(info).attr("data2");
			xbun = bun;			
			var msgobject = $(info).parent().find(".status-message");
			if ( (typeof(msg) != "undefined") && (msg != "")){				
				$(msgobject).attr("title", msg);
				$(msgobject).text(msg);
				$(info).parent().parent().addClass("type1");				
			}else{
				$(msgobject).attr("title", "");
				$(msgobject).text("");
				$(info).parent().parent().removeClass("type1");
			}			
			if (val == 1){
				$(info).addClass("status online");			
				//온라인 카운트 +1 처리함
			//	var ocount = $("#group_"+bun+"_online_cnt").text();
			//	$("#group_"+bun+"_online_cnt").text(parseInt(ocount) + 1);				
			}else if (val == 2){
				$(info).addClass("status away");				
				//온라인 카운트 +1 처리함
			//	var ocount = $("#group_"+bun+"_online_cnt").text();
			//	$("#group_"+bun+"_online_cnt").text(parseInt(ocount) + 1);			
			}else if (val == 3){
				$(info).addClass("status deny");				
				//온라인 카운트 +1 처리함
			//	var ocount = $("#group_"+bun+"_online_cnt").text();
			//	$("#group_"+bun+"_online_cnt").text(parseInt(ocount) + 1);			
			}else if (val == 0){				
				$(info).addClass("status offline");									
			}				
		}				
		return false;
	},
	
	"my_profile_status" : function(val, msg){
		var tkey = "my_profile_status";
		$("#" + tkey).removeClass();			
		switch (val){
			case 1:
				$("#" + tkey).addClass("status online");
				break;
			case 2:
				$("#" + tkey).addClass("status away");	
				break;
			case 3:
				$("#" + tkey).addClass("status deny");
				break;
			case 0:
				$("#" + tkey).addClass("status offline");	
				break;
		}		
		if (typeof(msg) != "undefined"){
			$("#my_status").text(msg);
		}
	},
	
	"temp_change_status" : function(id, val, ty){
		//버디리스트에 사용자별 상태 변경이 호출될때 처리되는 함수
		//- 사용자 상태 변경 : 0(offline), 1(online), 2(부재중), 3(방해금지), (사용자 정의 : 151~255)
		return false; //버디리스트를 표시하지 않는다.
		id = id.replace(/\./gi,"_");
		var group = gap.buddy_list_info.ct.bl;
		var isOff = false;
		for (var j = 0 ; j < group.length; j++){
			//var tkey = "person_"+j+"_"+id ;
			var tkey = "";
			if (ty == "favorite"){
				tkey = "favorite_" + id;				
		//	}else if (ty == "chatroom"){
		//		tkey = "chatroom_" + id;
		//	}else if (ty == "multimember"){
				//멀티 대화방에서 사용자를 전체 펼쳤을 경우
		//		tkey = "schatroom_" + id;
			}			
			if (val == 0){
				isOff = true;
			}			
			/*
			$("#" + tkey).removeClass();			
			switch (val){
				case 1:
					$("#" + tkey).addClass("online status");
					break;
				case 2:
					$("#" + tkey).addClass("away status");	
					break;
				case 3:
					$("#" + tkey).addClass("deny status");
					break;
				case 0:
					$("#" + tkey).addClass("offline status");	
					break;
			}
			*/
			
		//	gap.display_status_real(tkey, val);
			
		//	if (ty == "favorite"){
		//		tkey = "sfavorite_" + id;
				
		//		gap.display_status_real(tkey, val);
				
				/*
				$("#" + tkey).removeClass();			
				switch (val){
					case 1:
						$("#" + tkey).addClass("online status");
						break;
					case 2:
						$("#" + tkey).addClass("away status");	
						break;
					case 3:
						$("#" + tkey).addClass("deny status");
						break;
					case 0:
						$("#" + tkey).addClass("offline status");	
						break;
				}
				*/
		//	}
			//채팅방의 상태 정보를 표시하고 특정인이 오프라인일 경우 오프라인 상태바를 표시해 준다.
			//1:1 일 경우 "박상훈 is Offline status" / 1:N일 경우 "Some users Offline status" 형태로 상태바를 표시한다.					
		}					
		if (ty == "chatroom"){
			tkey = "chatroom_" + id;
			gap.display_status_real(tkey, val);
		}else if (ty == "multimember"){
			//멀티 대화방에서 사용자를 전체 펼쳤을 경우
			tkey = "schatroom_" + id;
			gap.display_status_real(tkey, val);
		}else if (ty == "favorite"){
			tkey = "favorite_" + id;	
			gap.display_status_real(tkey, val);
			
			tkey = "sfavorite_" + id;
			gap.display_status_real(tkey, val);
		}
	},
	
	"temp_change_status_search" : function(id, val, msg, ty){		
		id = id.replace(/\./gi,"-spl-");		
		if (ty == "topsearch"){
			//사용자 검색한 결과에 상태 표시
			tkey = "sresult_status_" + id;
			gap.display_status_real(tkey, val);			
			$("#sresult_msg_" + id).text(msg);			
		}else if (ty == "useraddsearch"){
			//사용자 추가 할때 검색은 _을 -lpl-로 변경해서 넘겨준다.
			id = id.replace(/\_/gi,"-lpl-");			
			tkey = "result_status_" + id;
			gap.display_status_real(tkey, val);			
			$("#result_msg_" + id).text(msg);
		}
	},
	
	"display_status_real" : function(tkey, val){
		$("#" + tkey).removeClass();			
		switch (val){
			case 1:
				$("#" + tkey).addClass("online status");
				break;
			case 2:
				$("#" + tkey).addClass("away status");	
				break;
			case 3:
				$("#" + tkey).addClass("deny status");
				break;
			case 0:
				$("#" + tkey).addClass("offline status");	
				break;
		}
	},
		
	"person_profile_img" : function(empno){
		///devaphqapp/photo/ko1@amorepacific.com			
		var profile_url = location.protocol + "//" + location.host + "/photo/" + empno + ".jpg";
		var empty_url = "../../photo/no_profile";		
		var img_tag = "<img src='"+profile_url+"' onError='this.onerror=null; this.src=\""+empty_url+"\";' alt='' />";		
		return img_tag;
	},	
	
	"person_profile_img2" : function(empno, companycode){
		///devaphqapp/photo/ko1@amorepacific.com			
	//	var profile_url = location.protocol + "//" + location.host + "/photo/" + companycode + "/" + companycode + empno + ".jpg";
		var profile_url = location.protocol + "//" + location.host + "/photo/" + empno + ".jpg";
		var empty_url = "../../photo/no_profile";		
		var img_tag = "<img src='"+profile_url+"' onError='this.onerror=null; this.src=\""+empty_url+"\";' alt='' />";		
		return img_tag;
	},	
	
	"person_profile_photo" : function(obj){
		var profile_url = "";
		var img_tag = "";		
		if (typeof(obj) == "undefined" || typeof(obj.emp) == "undefined"){
			img_tag = "<img src='"+gap.none_img+"' onError='this.onerror=null;' alt='' />";	
		}else{			
			var key = "";
			if (obj.emp.indexOf("im") > -1){
				key = obj.emp
				var profile_url = location.protocol + "//" + location.host + "/" + root_path + "/photo/" + obj.emp + ".jpg";
			}else{
				key = obj.ky;
				var profile_url = "";
				if (obj.dsize == "group"){
					profile_url = "../resource/images/team.jpg";
				}else{
					profile_url = location.protocol + "//" + location.host + "/" + root_path + "/photo/" + obj.ky + ".jpg";
				}
			}			
			var empty_url = gap.none_img;		
			img_tag = "<img data-key='"+key+"' src='"+profile_url+"' onError='this.onerror=null; this.src=\""+empty_url+"\";' alt='' />";	
		}							
		return img_tag;
	},
	
	"person_profile_photo_by_ky" : function(obj){
		var profile_url = "";
		var img_tag = "";		
		if (typeof(obj) == "undefined"){
			img_tag = "<img src='"+gap.none_img+"' onError='this.onerror=null;' alt='' />";	
		}else{					
			var key = obj.ky;
			var cpc = key.substring(0,2);
		//	var profile_url = location.protocol + "//" + location.host + "/photo/" + cpc + "/" + obj.ky + ".jpg";
			var profile_url = location.protocol + "//" + location.host + "/photo/" + obj.ky + ".jpg";
			var empty_url = gap.none_img;		
			img_tag = "<img data-key='"+key+"' src='"+profile_url+"' onError='this.onerror=null; this.src=\""+empty_url+"\";' alt='' />";	
		}							
		return img_tag;
	},	
	
	"person_profile_photo_by_ky2" : function(ky){
		var profile_url = "";
		var img_tag = "";		
		if (typeof(ky) == "undefined"){
			img_tag = "<img src='"+gap.none_img+"' onError='this.onerror=null;' alt='' />";	
		}else{					
			var key = ky;
			var cpc = key.substring(0,2);
		//	var profile_url = location.protocol + "//" + location.host + "/photo/" + cpc + "/" + ky + ".jpg";
			var profile_url = location.protocol + "//" + location.host + "/photo/" + ky + ".jpg";
			var empty_url = gap.none_img;		
			img_tag = "<img data-key='"+ky+"' src='"+profile_url+"' onError='this.onerror=null; this.src=\""+empty_url+"\";' alt='' />";	
		}							
		return img_tag;
	},	
	
	"team_photo" : function(){
		var profile_url = "<img src='../resource/images/team.jpg' onError='this.onerror=null;' alt='' />";		
		return  profile_url;
	},
	
	"team_photo_url" : function(){
		var profile_url = "../resource/images/team.jpg";		
		return  profile_url;
	},	
	
	"chat_photo" : function(){
		var profile_url = "<img src='img/bot.jpg' onError='this.onerror=null;' alt='' />";		
		return  profile_url;
	},
	
	"chat_photo_url" : function(){
		var profile_url = "img/bot.jpg";		
		return  profile_url;
	},
	
	"person_photo_url" : function(obj){		
		var profile_url = "";			
		if (obj && obj.cpc && obj.emp) {
			if (obj.dsize == "group"){
				profile_url = "../resource/images/team.jpg";
			}else{
				if (obj.emp.indexOf("im") > -1){
				//	profile_url = location.protocol + "//" + location.host + "/photo/" + obj.cpc + "/" + obj.emp + ".jpg";
					profile_url = window.root_path + "/photo/" + obj.emp + ".jpg";
				}else{
				//	profile_url = location.protocol + "//" + location.host + "/photo/" + obj.cpc + "/" + obj.cpc + obj.emp + ".jpg";
					profile_url = window.root_path + "/photo/" + obj.emp + ".jpg";
				}
			}
		}		
		// ky가 있는 경우 ky 사용
		if (obj && obj.cpc && obj.ky) {
			if (obj.dsize == "group"){
				profile_url = "../resource/images/team.jpg";
			}else{
			//	profile_url = location.protocol + "//" + location.host + "/photo/" + obj.cpc + "/" + obj.ky + ".jpg";
				profile_url = window.root_path + "/photo/" + obj.emp + ".jpg";
			}			
		}		
		return profile_url;
	},	
	
	"person_profile_photo_mention" : function(obj){
		var profile_url = "";
		var img_tag = "";
		if (typeof(obj) == "undefined"){
			img_tag = "<img src='"+gap.none_img+"' onError='this.onerror=null;' alt='' />";	
		}else{
			if (obj.emp.indexOf("im") > -1){
				//profile_url = location.protocol + "//" + location.host + "/photo/" + obj.cpc + "/" + obj.emp + ".jpg";
				profile_url = location.protocol + "//" + location.host + "/photo/" + obj.emp + ".jpg";
			}else{
				//profile_url = location.protocol + "//" + location.host + "/photo/" + obj.cpc + "/" + obj.cpc + obj.emp + ".jpg";
				profile_url = location.protocol + "//" + location.host + "/photo/" + obj.emp + ".jpg";
			}
			img_tag = profile_url;
		}	
		return img_tag;
	},	
	
	"person_profile_uid" : function(uid){
		///devaphqapp/photo/ko1@amorepacific.com	
		var today = gap.search_today_only();
		var profile_url = "../../photo/" + encodeURIComponent(uid) + "?open&ver=" + today;
	//	var profile_url = "../../photo/" + encodeURIComponent(uid);
		var empty_url = "../../photo/no_profile";		
	//	var img_tag = "<img src='"+profile_url+"' onError='this.src=\""+empty_url+"\";' alt='' />";
		var img_tag = "<img src='"+profile_url+"' onError='this.onerror=null; this.src=\""+empty_url+"\";' alt='' />";
		return img_tag;
	},
	
	"person_profile_box_uid" : function(info){
		var uid = info.ky
		var today = gap.search_today_only();
	//	var profile_url = "../../photo/" + encodeURIComponent(uid) + "?open&ver=" + today;
		var profile_url = location.protocol + "//" + location.host + "/photo/" + info.emp + ".jpg&ver=" + today;
		if (info.dsize != undefined && info.dsize == "group"){
			var empty_url = "../resource/images/team.jpg";			
		}else{
			var empty_url = "../../photo/no_profile";
		}
		var img_tag = "<img src='"+profile_url+"' onError='this.onerror=null; this.src=\""+empty_url+"\";' alt='' />";
		return img_tag;
	},
	
	"person_profile_box_mention_uid" : function(info){		
		var uid = info.ky
		var today = gap.search_today_only();
		var profile_url = "../../photo/" + encodeURIComponent(uid) + "?open&ver=" + today;
		if (info.dsize != undefined && info.dsize == "group"){
			var empty_url = cdbpath + "../resource/images/team.jpg";			
		}else{
			var empty_url = "../../photo/no_profile";
		}
		var img_url = "<img src='"+profile_url+"' onError='this.onerror=null; this.src=\""+empty_url+"\";' alt='' />";
		return profile_url;
	},		
	
	"person_photo" : function(url){		
		///devaphqapp/photo/ko1@amorepacific.com		
	//	var profile_url = "../../photo/" + encodeURIComponent(uid);
		var profile_url = url;
		var empty_url = cdbpath + gap.none_img;		
		var img_tag = "<img src='"+profile_url+"' onError='this.onerror=null; this.src=\""+empty_url+"\";' alt='' />";
		return img_tag;
	},	
	
	"person_photo2" : function(url){		
		///devaphqapp/photo/ko1@amorepacific.com		
	//	var profile_url = "../../photo/" + encodeURIComponent(uid);
		var profile_url = url;
		var empty_url = cdbpath + "/img/nouser.jpg";		
		var img_tag = "<img src='"+profile_url+"' onError='this.onerror=null; this.src=\""+empty_url+"\";' alt='' />";
		return img_tag;
	},	
	
	"person_profile_uid2" : function(uid){
		///이미지 다운로드 에러시 추가 호출함수를 넣은 경우		
		var profile_url = "../../photo/" + encodeURIComponent(uid);
		var empty_url = "../../photo/no_profile";		
		var img_tag = "<img src='"+profile_url+"' onError='this.onerror=null; this.src=\""+empty_url+"\";' alt='' />";		
		return img_tag;
	},
	
	"search_full_date" : function(){		
		var todayDate = new Date().toISOString().slice(0,10);
		var txp = todayDate.substr(0,4) + todayDate.substr(5,2) + todayDate.substr(8,2);
		return txp;
	},	
	
	"search_today_only" : function(){		
		var txp = new Date().YYYYMMDD();
		return txp;
	},	
	
	"search_today_only2" : function(){
		//오늘 날짜에 대해서 YYYYMMDD값을 가져오는 것인데 toISOString()로 가져오면 오전 9시 이전 값이 어제 로 표시되는 버그가 있었음
	//	var todayDate = new Date().toISOString().slice(0,10);
	//	var txp = todayDate.substr(0,4) +  todayDate.substr(5,2) +  todayDate.substr(8,2)		
		//이걸로 써야 된다.
		var txp = new Date().YYYYMMDD();
		return txp;
	},	
	
	"search_today_only3" : function(str){
		var str = String(str);
		var txp = str.substr(0,4) + str.substr(4,2) + str.substr(6,2);
		return txp;
	},
	
	"search_time_only2" : function(str){
		var str = String(str);
		var txp = str.substr(8,2) + ":" +  str.substr(10,2);
		return txp;
	},	
	
	"search_time_only" : function(){
		var now = new Date(Date.now());		
		var hh = "0" + now.getHours();
		if (hh.length > 2){
			hh = now.getHours();
		}else{
			hh = "0" + now.getHours();
		}
		var mm = "0" + now.getMinutes();
		if (mm.length > 2){
			mm = now.getMinutes();
		}else{
			mm = "0" + now.getMinutes();
		}		
		var formatted = hh + ":" + mm;
		return formatted;
	},	
	
	"search_chatserver_domain" : function(id){		
		var res = "";
		if (typeof(id) == "undefined"){
			res = gap.fileserver_ko;
		}else{
			var id = id.replace("_1","");
			if (id == "ko"){
				res = gap.fileserver_ko;
			}else if (id == "cn"){
				res = gap.fileserver_cn;
			}else if (id == "us"){
				res = gap.fileserver_us;
			}else if (id == "ag"){
				res = gap.fileserver_ag;
			}else if (id == "fr"){
				res = gap.fileserver_fr;
			}else if (id == "dev"){
				res = gap.fileserver_dev;
			}					
		}		
		return res;
	},	
	
	"search_exist_chatroom_nn" : function(member){
		//특정사용자가들이 포함된 채팅방이 있는지 찾아서 있을 경우 해당 방으로 들어갈수 있게 해준다.		
		var res = "";
		var comp2 = member.sort().join("-");
		var list = gap.chat_room_info.ct;		
		for (var i = 0 ; i < list.length; i++){
			var arr =[];
			var info = list[i];
			var cid = info.cid;			
			for (var k = 0 ; k < info.att.length; k++){
				var item = info.att[k];				
				arr.push(item.ky);
			}
			var comp1 = arr.sort().join("-");
			if (comp1 == comp2){
				return cid;
			}		
		}			
		return res;
	},
	
	"search_cur_chatroom_att" : function(){
		var cid = gBody.cur_cid;
		var list = gap.chat_room_info.ct;
		var attlist = "";
		for (var i = 0 ; i < list.length; i++){
			var info = list[i];
			if (cid == info.cid){
				attlist = info.att;
			}
		}		
		return attlist;		
	},
	
	
	"search_user_to_favorite_and_buddylist" : function(ky){
		var suserinfo = "";
		//버디리스트에 있는 지 찾는다.
		var fav = gap.favorite_list;
		for (var i = 0 ; i < fav.length; i++){
			var info = fav[i];
			if (ky == info.ky){
				suserinfo = info;
				return suserinfo;
				break;
			}
		}		
		//버디리스트에 있는 지 찾는다.
		var bud = gap.buddy_list_info.ct.bl;
		for (var j = 0 ; j < bud.length; j++){			
			var blist = bud[j].usr;			
			for (k = 0 ; k < blist.length; k++){
				var inn = blist[k];
				if (ky == inn.ky){
					suserinfo = inn;
					return suserinfo;
					break;
				}
			}			
		}		
	},
	
	"search_buddylist_change_expand_info" : function(groupname, expand){
		var bud = gap.buddy_list_info.ct.bl;
		for (var j = 0 ; j < bud.length; j++){			
			var gname = bud[j].nm;			
			if (gname == groupname){
				bud[j].o = expand;
				break;
			}		
		}		
	},
	
	"search_att_list_in_chat_info" : function(cid){		
		var chat_list = gap.chat_room_info.ct;
		for (var i = 0 ; i < chat_list.length; i++){
			var info = chat_list[i];
			if (info.cid == cid){
				return info.att;
				break;
			}
		}		
		//기본에 없을 경우 검색한 결과의 멤버 정보에서 찾는다.
		var chat_list_search = gap.chat_room_info_search;
		//2024.03.27 없는 경우 채팅방 정보를 받아오지 못하는 오류를 수정함. chat_list_search.length -> chat_list_search.ct.length
		for (var i = 0 ; i < chat_list_search.ct.length; i++){
			var info = chat_list_search.ct[i];
			if (info.cid == cid){
				return info.att;
				break;
			}
		}		
	},
	
	"search_last_bun_chat_info" : function(cid){		
		var chat_list = gap.chat_room_info.ct;
		for (var i = 0 ; i < chat_list.length; i++){
			var info = chat_list[i];
			if (info.cid == cid){
				return info.wsq;
				break;
			}
		}
	},
	
	
	"search_chat_info_cur_chatroom" : function(cid){
		//전체 채팅방리스트에서 현재 cid의 채팅방 정보를 Return 해주는 함수		
		var chat_list = gap.chat_room_info.ct;
		if (typeof(chat_list) != "undefined"){
			for (var i = 0 ; i < chat_list.length; i++){
				var info = chat_list[i];
				if (info.cid == cid){
					return info;
					break;
				}
			}
		}
		return "";		
	},
	
	"search_cur_chatroom_change_rsq" : function (cid, rsq){
		//마지막 읽은 위치를 gap.chat_room_info에서 해당 cid 방의 정보를 수정한다.
		var chat_list = gap.chat_room_info.ct;
		for (var i = 0 ; i < chat_list.length; i++){
			var info = chat_list[i];
			if (info.cid == cid){
				info.rsq = rsq;
				break;
			}
		}
	},	
	
	
	"search_cur_chatroom_change_ucnt" : function (cid, ucnt){
		//cid에 채팅방을 찾아서 ucnt 데이터를 업데이트 한다.
		var chat_list = gap.chat_room_info.ct;
		for (var i = 0 ; i < chat_list.length; i++){
			var info = chat_list[i];
			if (info.cid == cid){
				info.ucnt = ucnt;				
				//팝업창에 채팅 리스트가 표시되고 있는 경우 건수를 바로 표시해 준다.
				//"[data-status='status_"+key+"']"
				if (ucnt == 0){
					$("#alarm_list_sub").find("[data-key='"+gap.encodeid(cid)+"']").find(".alarm-num").remove();
				}else{
					var obb = $("#alarm_list_sub").find("[data-key='"+gap.encodeid(cid)+"']").find(".alarm-num");					
					if (obb.length == 1){
						//var tcnt = $(obb).find(".alarm-num").text();
						//$(obb).find(".alarm-num").text((parseInt(tcnt)+1));
						$(obb).text(ucnt);
					}else{
						$("#alarm_list_sub").find("[data-key='"+gap.encodeid(cid)+"']").append("<div class='alarm-num'>"+ucnt+"</div>");
					}
				}				
				break;
			}
		}
	},	
	
	"search_all_chatroom_ucnt" : function (){
		//전체 채팅방 리스트에서 읽지 않은 건수를 계산하는 함수
		var chat_list = gap.chat_room_info.ct;
		var total_ucnt = 0;
		for (var i = 0 ; i < chat_list.length; i++){
			var info = chat_list[i];
			if (typeof(info.ucnt) != "undefined"){
				total_ucnt = total_ucnt + info.ucnt;
			}			
		}
		return total_ucnt;
	},	
	
	"search_user_in_cur_chatroom" : function (key){		
		//cur_room_att_info_list가 없으면 로겈 채팅방 정보를 활용해서 다시 설정해야 한다.
		if (gBody.cur_room_att_info_list.length == 0){
			gBody.cur_room_att_info_list = gap.search_cur_chatroom_attx(gBody.cur_cid);
		}		
		var lists = gBody.cur_room_att_info_list;
		for (var i = 0; i < lists.length; i++){
			var info = lists[i];
			if (info.ky == key){
				return true;
				break;
			}
		}
		return false;
	},	
	
	"chatroom_exist_check" : function(id){	
		var roomlist = gap.chat_room_info.ct;
		var exist = false;
		for(var i = 0 ; i < roomlist.length; i++){
			var roominfo = roomlist[i];
			if (id == roominfo.cid){
				exist = true;
				break;				
			}
		}
		return exist;
	},
		
	"chatroom_position_check" : function(id){
		var roomlist = gap.chat_room_info.ct;
		var exist = "";
		for(var i = 0 ; i < roomlist.length; i++){
			var roominfo = roomlist[i];
			if (id == roominfo.cid){
				exist = i;
				break;				
			}
		}
		return exist;
	},	
		
	"change_date_localTime_only_date" : function(tm){		
		var year = tm.substring(0,4);
		var month = tm.substring(4,6);
		var day = tm.substring(6,8);		
		var hour  = tm.substring(8,10);
		var minute = tm.substring(10,12);
		var second = tm.substring(12,14);
		var mi = tm.substring(14,17);		
	    var utcTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
		var dis= moment.utc(utcTime ).local().format('YYYYMMDD');
		return dis;
	},	
	
	"change_date_localTime" : function(tm){		
		var year = tm.substring(0,4);
		var month = tm.substring(4,6);
		var day = tm.substring(6,8);		
		var hour  = tm.substring(8,10);
		var minute = tm.substring(10,12);
		var second = tm.substring(12,14);
		var mi = tm.substring(14,17);		
		var d2 = new Date();
		d2.setUTCFullYear(year);
		d2.setUTCMonth(month);
		d2.setUTCDate(day);
		d2.setUTCHours(hour);
		d2.setUTCMinutes(minute);
		d2.setUTCSeconds(second);
		d2.setUTCMilliseconds(mi);		
		return d2;
	},
	
	"search_iso_date" : function(dt){		
		var todayDate = new Date(dt).toISOString();
		return todayDate;
	},	
	
	"change_date_localTime_only_time" : function(tm){		
		var year = tm.substring(0,4);
		var month = tm.substring(4,6);
		var day = tm.substring(6,8);		
		var hour  = tm.substring(8,10);
		var minute = tm.substring(10,12);
		var second = tm.substring(12,14);
		var mi = tm.substring(14,17);		
		var d2 = new Date();
		d2.setUTCFullYear(year);
		d2.setUTCMonth(month);
		d2.setUTCDate(day);
		d2.setUTCHours(hour);
		d2.setUTCMinutes(minute);
		d2.setUTCSeconds(second);
		d2.setUTCMilliseconds(mi);		
		var hour = "0" + d2.getHours();
		var minute = "0" + d2.getMinutes();		
		var dis = hour.substring(hour.length-2, hour.length) + ":" + minute.substring(minute.length-2, minute.length);
		return dis;
	},	
	
	"change_date_localTime_full" : function(tm){		
		var year = tm.substring(0,4);
		var month = tm.substring(4,6);
		var day = tm.substring(6,8);		
		var hour  = tm.substring(8,10);
		var minute = tm.substring(10,12);
		var second = tm.substring(12,14);
		var mi = tm.substring(14,17);
		if (second > 59){
			second = 59;
		}		
		var utcTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
		var dis= moment.utc(utcTime ).local().format('YYYYMMDD');	
		return dis;	
	},	
	
	"search_iso_date" : function(dt){		
		var todayDate = new Date(dt).toISOString();
		return todayDate;
	},	
	
	"change_date_localTime_full2" : function(tm){		
		var year = tm.substring(0,4);
		var month = tm.substring(4,6);
		var day = tm.substring(6,8);		
		var hour  = tm.substring(8,10);
		var minute = tm.substring(10,12);
		var second = tm.substring(12,14);
		var mi = tm.substring(14,17);			
	    var utcTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
		var dis= moment.utc(utcTime).local().format('YYYY.MM.DD HH:mm');
		return dis;
	},	
	
	"change_date_localTime_full" : function(tm){		
		var year = tm.substring(0,4);
		var month = tm.substring(4,6);
		var day = tm.substring(6,8);		
		var hour  = tm.substring(8,10);
		var minute = tm.substring(10,12);
		var second = tm.substring(12,14);
		var mi = tm.substring(14,17);
		if (second > 59){
			second = 59;
		}		
	    var utcTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
		var dis= moment.utc(utcTime).local().format('YYYYMMDDHHmmss');
		return dis;
	},
	
	"change_date_localTime_only_time" : function(tm){		
		var year = tm.substring(0,4);
		var month = tm.substring(4,6);
		var day = tm.substring(6,8);		
		var hour  = tm.substring(8,10);
		var minute = tm.substring(10,12);
		var second = tm.substring(12,14);
		var mi = tm.substring(14,17);		
		var d2 = new Date();
		d2.setUTCFullYear(year);
		d2.setUTCMonth(month);
		d2.setUTCDate(day);
		d2.setUTCHours(hour);
		d2.setUTCMinutes(minute);
		d2.setUTCSeconds(second);
		d2.setUTCMilliseconds(mi);		
		var hour = "0" + d2.getHours();
		var minute = "0" + d2.getMinutes();		
		var dis = hour.substring(hour.length-2, hour.length) + ":" + minute.substring(minute.length-2, minute.length);
		return dis;
	},
		
	"change_date_default" : function (xstr){	
		var date = new Date();		
		var today = date.YYYYMMDD();		
		var yesterday = moment().subtract(1, "days").format("YYYYMMDD");		
		var tdate = xstr.toString();
		var sdate = tdate.substring(0,8);		
		var res = "";		
		if (sdate == today ){
			res = gap.lang.today;
		}else if (sdate == yesterday){
			res = gap.lang.yesterday;
		}else{
			var year = tdate.substring(0,4);
			var month = tdate.substring(4,6);
			var day = tdate.substring(6,8);
			res = year + "-" + month + "-" + day;
		}		
		return res;
	},
	
	"change_date_default2" : function (xstr){		
		var date = new Date();		
		var today = date.YYYYMMDD();		
		var yesterday = moment().subtract(1, "days").format("YYYYMMDD");		
		var tdate = xstr.toString();
		var sdate = tdate.substring(0,8);		
		var res = "";		
		if (sdate == today ){
			res = gap.lang.today;
		}else if (sdate == yesterday){
			res = gap.lang.yesterday;
		}else{
			var year = tdate.substring(0,4);
			var month = tdate.substring(4,6);
			var day = tdate.substring(6,8);
			res = year + "." + month + "." + day;
		}		
		return res;
	},
	
	"change_date_default_for_popupchat" : function (xstr){		
		var date = new Date();		
		var today = date.YYYYMMDD();		
		var yesterday = moment().subtract(1, "days").format("YYYYMMDD");		
		var tdate = xstr.toString();
		var sdate = tdate.substring(0,8);
		var sdate2 = gap.change_date_localTime_full(String(xstr))
		var sdate = sdate2.substring(0,8);		
		var res = "";		
		if (sdate == today ){
			res = gap.change_date_localTime_only_time(xstr.toString());
		}else if (sdate == yesterday){
			res = gap.lang.yesterday;
		}else{
			var year = tdate.substring(0,4);
			var month = tdate.substring(4,6);
			var day = tdate.substring(6,8);
			res = year + ". " + month + ". " + day;
		}		
		return res;
	},
	
	"convertGMTLocalDateTime" : function(val){
		var _date = moment(val, 'YYYYMMDDHHmmss').utc().local().format('YYYY-MM-DD[T]HH:mm:00[Z]')
		var ret = moment.utc(_date).local().format('YYYY.MM.DD') + '(' + moment.utc(_date).local().format('ddd') + ') ' + moment.utc(_date).local().format('HH:mm');
		return ret;
	},
	
	"convertGMTLocalDateTime_only_day" : function(val){
		var _date = moment(val, 'YYYYMMDDHHmmss').utc().local().format('YYYY-MM-DD[T]HH:mm:00[Z]')
		var ret = moment.utc(_date).local().format('YYYY-MM-DD'); // + '(' + moment.utc(_date).local().format('ddd') + ')';
		return ret;
	},
	
	"convertGMTLocalDateTime_new" : function(val){
		var _date = moment(val, 'YYYYMMDDHHmmss').utc().local().format('YYYY-MM-DD[T]HH:mm:00[Z]')
		var _date = moment(val);
		var ret = _date.format('YYYY.MM.DD') + '(' + _date.format('ddd') + ') ' + _date.format('HH:mm');
		return ret;
	},	
	
	"convertGMTLocalOnlyDate" : function(val){
		var _date = moment(val);
		var ret = _date.format('YYYYMMDD')
		return ret;
	},		
	
	"convertGMTLocalDateTime_new_day" : function(val){
		
		var _date = moment(val, 'YYYYMMDDHHmmss').utc().local().format('YYYY-MM-DD[T]HH:mm:00[Z]')
		var _date = moment(val);
		var ret = _date.format('YYYY.MM.DD');
		return ret;
	},	
	
	"convertGMTLocalDateTime_new_day2" : function(val){		
		var _date = moment(val, 'YYYYMMDDHHmmss').utc().local().format('YYYY-MM-DD');		
		return _date;
	},
	
	"convertTimeOnly" : function(val){
		var _date = moment(val, 'YYYYMMDDHHmmss').utc().local().format('YYYY-MM-DD[T]HH:mm:00[Z]')
		var _date = moment(val);
		var ret =  _date.format('hh:mm A');
		return ret;
	},	
	
	"delay_check" : function(val){
		var today = moment().startOf("day");
		var dat = moment(val);
		return dat.isBefore(today);
	},
	
	"id_extract_name" : function(id){		
		var inx = id.indexOf(",OU=");
		return id.substring(3, inx);
	},
		
	"sortNameDesc" : function(a, b){
		 return gap.sortName(a,b) * -1;  
	},
	
	"sortName" : function(a, b){
		if (a.nm == b.nm){
			return 0;
	    }
		return a.nm < b.nm ? 1 : -1;  
	},
	
	"sortResults" : function(result, prop, asc){
		SortedResult = result.sort(function(a, b) {
	        if (asc) {
	            return (parseInt(a[prop]) > parseInt(b[prop])) ? 1 : ((parseInt(a[prop]) < parseInt(b[prop])) ? -1 : 0);
	        } else {
	            return (parseInt(b[prop]) > parseInt(a[prop])) ? 1 : ((parseInt(b[prop]) < parseInt(a[prop])) ? -1 : 0);
	        }
	    });
	  return SortedResult
	},
	
	"make_msg_id" : function(){
		var uid = gap.search_cur_ky();	
		var id = uid;
		id = id.replace(/\./gi,"-spl-");		
		var ran = new Date().getTime() + "_" + gap.makeRandom(5);		
		return id + "_" + ran;		
	},
	
	"pad" : function(number, length){
		var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
	},
	
	"browser_check" : function(){
		var res = "";
		if (navigator.userAgent.match(/msie/i) || navigator.userAgent.match(/trident/i) ){
		    res = "msie";
		}
		return res;
	},	
	
	"file_download" : function(urlToSend){		
		var fname = "";
		if (urlToSend.indexOf("?OpenElement") >-1){
			fname = "Editor_Image.png";
		}else{		
			fname = urlToSend.split("/")[7];			
			if (typeof(fname) == "undefined"){
				fname =  $("#preview_title").text();
			}
		}		
		var ext = gap.file_extension_check(fname);
		var bc = gap.browser_check();
		if (bc == "msie" || ext == "html" || ext == "htm"){
			gap.file_download2(urlToSend);
		}else{
			 fname = decodeURIComponent(fname);
			 var req = new XMLHttpRequest();
		     req.open("GET", urlToSend, true);
		     req.responseType = "blob";
		     req.onload = function (event) {
		         var blob = req.response;		         
		         if (req.status != 404){
		        	  var link=document.createElement('a');
		 	         link.href=window.URL.createObjectURL(blob);
		 	         link.download=fname;
		 	         link.click();
		         }else{
		        	 gap.gAlert(gap.lang.failmsg);
		         }       
		     };		     
		     req.send();
		}		
	 }, 
	 
	 "file_download_mail" : function(urlToSend, filename){			
			var fname = filename;		
			var ext = gap.file_extension_check(filename);						 
			var bc = gap.browser_check();
			if (bc == "msie" || ext == "html" || ext == "htm"){
				gap.file_download2(urlToSend);
			}else{
				 fname = decodeURIComponent(fname);
				 var req = new XMLHttpRequest();
			     req.open("GET", urlToSend, true);
			     req.responseType = "blob";
			     req.onload = function (event) {
			         var blob = req.response;			         
			         if (req.status != 404){
			        	  var link=document.createElement('a');
			 	         link.href=window.URL.createObjectURL(blob);
			 	         link.download=fname;
			 	         link.click();
			         }else{
			        	 gap.gAlert(gap.lang.failmsg);
			         }       
			     };		     
			     req.send();
			}		
		 },
	 	 
	 "file_download_video" : function(urlToSend, event){
		event.stopPropagation();		
		var fname = "";
		var fname = urlToSend.split("/")[7];	 
		var bc = gap.browser_check();
		if (bc == "msie"){
			gap.file_download2(urlToSend);
		}else{
			 fname = decodeURIComponent(fname);
			 var req = new XMLHttpRequest();
		     req.open("GET", urlToSend, true);
		     req.responseType = "blob";
		     req.onload = function (event) {
		         var blob = req.response;		         
		         if (req.status != 404){
		        	  var link=document.createElement('a');
		 	         link.href=window.URL.createObjectURL(blob);
		 	         link.download=fname;
		 	         link.click();
		         }else{
		        	 gap.gAlert(gap.lang.failmsg);
		         }		       
		     };			     
		     req.send();
		}			
	 },	 
	 
	 "file_download_memo" : function(urlToSend){		 
		 var bc = gap.browser_check();
		 if (bc == "msie"){
			 gap.file_download2(urlToSend);
		 }else{
			 var fname = urlToSend.split("/")[7];
			 fname = decodeURIComponent(fname);
			 var req = new XMLHttpRequest();
			 req.open("GET", urlToSend, true);
		     req.responseType = "blob";
		     req.onload = function (event) {
		    	 var blob = req.response;		         
		         if (req.status != 404){
		        	 var link = document.createElement('a');
		 	         link.href = window.URL.createObjectURL(blob);
		 	         link.download = fname;
		 	         link.click();
		         }else{
		        	 gap.gAlert(gap.lang.failmsg);
		         }
		     };
		     req.send();				
		 }
	},

	 "file_download_normal_backup" : function(urlToSend, filename){
		event.stopPropagation();	
		fname = filename;		 
		var bc = gap.browser_check();
		if (bc == "msie"){
			gap.file_download2(urlToSend);
		}else{
			 fname = decodeURIComponent(fname);
			 var req = new XMLHttpRequest();
		     req.open("GET", urlToSend, true);
		     req.responseType = "blob";
		     req.onload = function (event) {
		         var blob = req.response;		         
		         if (req.status != 404){
		        	  var link=document.createElement('a');
		 	         link.href=window.URL.createObjectURL(blob);
		 	         link.download=fname;
		 	         link.click();
		         }else{
		        	 gap.gAlert(gap.lang.failmsg);
		         }		       
		     };			     
		     req.send();
		}			
	 },	 
	  
	 "file_download_normal" : function(urlToSend, filename){			
			fname = filename;
			var ext = gap.file_extension_check(filename);			 
			var bc = gap.browser_check();
			var block_idx = 0;
			
			if (bc == "msie" || ext == "html" || ext == "htm"){
				gap.file_download2(urlToSend);
			}else{
				 fname = decodeURIComponent(fname);				 
				 $.ajax({
					url : urlToSend,
					type : "get",
					xhrFields : {
					 	responseType : "blob"
				 	},
				 	beforeSend : function(){		 		
				 		$("#show_loading_layer").remove();	
				 		var text = 0;
				 		
				 		// BlockUI가 떠 있는 경우 z-index값을 복사해둔다
				 		if ($('#blockui').is(':visible')) {
				 			block_idx = $('#blockui').css('z-index'); 
				 		}
				 		gap.showBlock();
						var inx = parseInt(gap.maxZindex()) + 1;
						var html = "";
						html += "<div class='loader' id='show_loading_layer' style='display:none; z-index:"+inx+"'>";
						html += "	<div class='sk-circle'>";
						html += "		<div class='sk-circle1 sk-child'></div>";
						html += "		<div class='sk-circle2 sk-child'></div>";
						html += "		<div class='sk-circle3 sk-child'></div>";
						html += "		<div class='sk-circle4 sk-child'></div>";
						html += "		<div class='sk-circle5 sk-child'></div>";
						html += "		<div class='sk-circle6 sk-child'></div>";
						html += "		<div class='sk-circle7 sk-child'></div>";
						html += "		<div class='sk-circle8 sk-child'></div>";
						html += "		<div class='sk-circle9 sk-child'></div>";
						html += "		<div class='sk-circle10 sk-child'></div>";
						html += "		<div class='sk-circle11 sk-child'></div>";
						html += "		<div class='sk-circle12 sk-child'></div>";
						html += "	</div>";
						html += "	<p id='show_loading_text'>"+text+"</p>";
						html += "	<div id='show_loading_progress' ></div>";
						html += "</div>";					
						$("body").append(html);		 		
				 	},
				 	xhr: function(){
				 		var xhr = $.ajaxSettings.xhr();
				 		xhr.onprogress = function(e){
				 			//퍼센트가 100이 되었을때 다운로드 완료
				 			if (e.total > 2000000){								
				 				var cx = $("#show_loading_layer").css("display");
				 				if (cx == "none"){
				 					$("#show_loading_layer").show();
				 				}			 				
				 			}				 			
				 			$("#show_loading_text").text(Math.floor(e.loaded / e.total * 100) + "% downloading");
				 		};
				 		return xhr;
				 	},
				 	success : function(data){
				 		var blob = new Blob([data]);
				 		//파일 저장
				 		if (navigator.msSaveBlob){
				 			return navigator.msSaveBlob(blob, urlToSend);
				 		}else{
				 			var link = document.createElement("a");
				 			link.href = window.URL.createObjectURL(blob);
				 			link.download = fname;
				 			link.click();
				 		}
				 	},
				 	complete : function(){
				 		if (block_idx > 0) {
				 			$('#blockui').css('z-index', block_idx);
				 		} else {				 			
				 			gap.hideBlock();
				 		}
						$("#show_loading_layer").fadeOut();
						$(".loader").remove();				 	
					}
				 })
			}			
		 },

	 "file_download_normal_todo" : function(urlToSend, filename){			
		event.stopPropagation();				
		fname = filename;
		var ext = gap.file_extension_check(filename);			 
		var bc = gap.browser_check();
		if (bc == "msie" || ext == "html" || ext == "htm"){
			gap.file_download2(urlToSend);
		}else{
			 fname = decodeURIComponent(fname);				 
			 $.ajax({
				url : urlToSend,
				type : "get",
				xhrFields : {
				 	responseType : "blob"
			 	},
			 	beforeSend : function(){
			 		var text = 0;
			 		$("#show_loading_layer").remove();					
					gap.showBlock_todo();					
					var inx = parseInt(gap.maxZindex()) + 1;					
					var html = "";
					html += "<div class='loader' id='show_loading_layer' style='display:none; z-index:"+inx+"'>";
					html += "	<div class='sk-circle'>";
					html += "		<div class='sk-circle1 sk-child'></div>";
					html += "		<div class='sk-circle2 sk-child'></div>";
					html += "		<div class='sk-circle3 sk-child'></div>";
					html += "		<div class='sk-circle4 sk-child'></div>";
					html += "		<div class='sk-circle5 sk-child'></div>";
					html += "		<div class='sk-circle6 sk-child'></div>";
					html += "		<div class='sk-circle7 sk-child'></div>";
					html += "		<div class='sk-circle8 sk-child'></div>";
					html += "		<div class='sk-circle9 sk-child'></div>";
					html += "		<div class='sk-circle10 sk-child'></div>";
					html += "		<div class='sk-circle11 sk-child'></div>";
					html += "		<div class='sk-circle12 sk-child'></div>";
					html += "	</div>";
					html += "	<p id='show_loading_text'>"+text+"</p>";
					html += "	<div id='show_loading_progress' ></div>";
					html += "</div>";					
					$("body").append(html);			 		
			 	},
			 	xhr: function(){
			 		var xhr = $.ajaxSettings.xhr();
			 		xhr.onprogress = function(e){
			 			//퍼센트가 100이 되었을때 다운로드 완료				 			
			 			if (e.total > 2000000){				 				
			 				var cx = $("#show_loading_layer").css("display");
			 				if (cx == "none"){
			 					$("#show_loading_layer").show();
			 				}			 				
			 			}				 			
			 			$("#show_loading_text").text(Math.floor(e.loaded / e.total * 100) + "% downloading");
			 		};
			 		return xhr;
			 	},
			 	success : function(data){
			 		var blob = new Blob([data]);
			 		//파일 저장
			 		if (navigator.msSaveBlob){
			 			return navigator.msSaveBlob(blob, urlToSend);
			 		}else{
			 			var link = document.createElement("a");
			 			link.href = window.URL.createObjectURL(blob);
			 			link.download = fname;
			 			link.click();
			 		}
			 	},
			 	complete : function(){					 		
			 		gap.hideBlock_todo();
					$("#show_loading_layer").fadeOut();
					$(".loader").remove();
			 	}
			 })
		}			
	},	 
		 
	"file_download2" : function(url){
		var link = document.createElement("a");
		$(link).click(function(e) {
			e.preventDefault();
			window.location.href = url;
		});
		$(link).click();
	},
		
	"file_download_option" : function(_fileList){
		if (_fileList.length  > 1){
        	var msg = gap.lang.optional;
        	gap.showConfirm_new({
        		title: gap.lang.download,
        		text1 : gap.lang.per + " " + gap.lang.download,
        		text2 : gap.lang.zip + " " + gap.lang.download,
        		contents: msg,
        		callback: function(e){
    				//압축 다운로드
    				saveZip.zipStart(_fileList, gBody2.drive_deselect_item);
        		},
        		callback2 : function(){
        			//개별파일 다운로드
          		  	for (var i = 0 ; i < _fileList.length ; i++){
          	        	var item = _fileList[i];        	                     
          	            gap.file_download_mail(item.fileDownUrl, item.filename);
          	        }       
        		}
        	});
        }else{
        	saveZip.zipStart(_fileList, gBody2.drive_deselect_item);
        }      
	},	
	
	"search_my_photo" : function(){
		var pu = gap.userinfo.rinfo.pu;
		return pu;
	},	
	
	"search_cur_cpc" : function(){
		var cky = gap.userinfo.rinfo.cpc;
		return cky;
	},
	
	"search_cur_ky" : function(){
		var cky = gap.userinfo.rinfo.ky;
		return cky;
	},
		
	"search_cur_ky2" : function(){
		//kmslab 적용을 위해서 새로 지정한다.		
		var cky =  gap.seach_canonical_id_email(gap.userinfo.rinfo.em);
		return cky;
	},
	
	"search_cur_em" : function(){
		var cky = gap.userinfo.rinfo.em;
		return cky;
	},	
	
	"search_cur_em_sec" : function(){
	//	var cky = gap.userinfo.rinfo.sec;
		var cky = gap.userinfo.rinfo.em;
		return cky;
	},	
	
	"search_cur_ky" : function(){
	//	var cky = gap.userinfo.rinfo.sec;
		var cky = gap.userinfo.rinfo.ky;
		return cky;
	},
		
	"search_is_onetoone" : function(){
		//1:1방인지 체크하는 함수
		var cid = gBody.cur_cid;
		if (gma.chat_position == "popup_chat"){
			cid = gma.cur_cid_popup;
		}
		if (cid.toString().substring(0,1) == "s"){
			return true;
		}
		return false;
	},
		
	"search_is_onetoone_id" : function(id){
		if (id.toString().substring(0,1) == "s"){
			return true;
		}
		return false;
	},
	
	"search_webpush_receive_check" : function(ch_code){
		//특정 업무방에 특정 사용자가 푸쉬를 받을것인에 대한 옵션 확인		
		//채널 정보가 없을 경우 가져와서 등록한다.		
		gap.pre_workroom_set();		
		var list = gap.cur_channel_list_info;
		var push = false;
		var ky = gap.userinfo.rinfo.ky;
		for (var i = 0 ; i < list.length; i++){
			var info = list[i];
		//	if (info.ch_code == ch_code){
			if (info._id.$oid == ch_code){
				if (typeof(info.push) != "undefined"){
					var plist = info.push;
					for (var k = 0 ; k < plist.length ; k++){
						if (plist[k] == ky){
							push = true;
							break;
						}
					}
				}
				return push;
				break;
			}			
		}		
		return push;
	},	
	
	"search_webpush_receive_check_drive" : function(code){
		gap.pre_drive_set();
		var push = false;
		var list = gBody.cur_drive_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_code == code){
    			push = true;
    			break;
    		}
    	}    	
    	return push;		
	},
	
	"status_search" : function (ky){
		var myArray = gap.cur_user_status;
		for (var i = myArray.length - 1; i >= 0; --i) {
		    if (myArray[i].id == ky) {
		        return myArray[i].st;
		    }
		}
	},
	
	"status_remove" : function (ky){
		var myArray = gap.cur_user_status;
		for (var i = myArray.length - 1; i >= 0; --i) {
		    if (myArray[i].id == ky) {
		        myArray.splice(i,1);
		    }
		}
	},
	
	"status_add" : function (obj){
		gap.cur_user_status.push(obj);
	},
	
	"status_change" : function(obj){		
		gap.status_remove(obj.id);
		gap.status_add(obj);
	},
		
	"chatroom_set_out" : function (key){	
		var myArray = gap.chat_room_info.ct;
		for (var i = myArray.length - 1; i >= 0; --i) {
		    if (myArray[i].cid == key) {
		        myArray.splice(i,1);
		        break;
		    }
		}		
		//var ckey = key.replace(/\^/gi,"_").replace(".","-spl-");
		var ckey = gap.encodeid(key);		
		var p1 = $("#" + ckey).parent();
		var p2 = $("#li_main_" + ckey).parent();		
		$("#li_main_" + ckey).remove();
		$("#" + ckey).remove();		
		var cnt = $(p1).children().length;
		if (cnt == 0){		
			//채팅방 리스트에서 채팅룸을 제거한다. 날짜 그룹까지
			var xid = $(p1).attr("id").replace("_ul_","_");
			$("#" + xid).remove();			
			
			//메인 채팅방을 재정리한다.
			if ($("#" + p2.attr("id")).children().attr("id") == "make_new_chat_room"){			
				$("#center_content_main").empty();
				gBody.chatroom_last_draw();
			}else{
				var xid2 = $(p2).attr("id").replace("_ul_","_");
				$("#" + xid2).remove();	
			}			
		}	
	},
	
    "showBlock" : function(){
		if (gap.blockall){
			//전체를 다 덮어야 하는 경우 gap.blockall을 true값으로 변경하고 호출한다..
			$('#blockui').css("left", "0px");
		}
		var inx = parseInt(gap.maxZindex()) + 1;
		$('#blockui').css("z-index", inx);
		$('#blockui').show();
    },
    
    "hideBlock": function(){
    	// 메인 팝업을 열어놓고 작업하는 경우 blockui가 없어지면 안됨
    	if ($('#main_popup').length && $('#main_popup').is(':visible')) {
    		var inx = parseInt($('#main_popup').css("z-index")) - 1;
    		$('#blockui').css("z-index", inx);
    	} else {
    		$('#blockui').hide();    		
    	}
    },    
    
    "showBlock_todo" : function(){
		var inx = parseInt(gap.maxZindex()) + 1;
		$('#blockui_todo').css("z-index", inx);
		$('#blockui_todo').show();
    },
    
    "hideBlock_todo": function(){
    	$('#blockui_todo').hide();
    },    
    
    "showBlock_org" : function(){
		var inx = parseInt(gap.maxZindex()) + 1;
		$('#blockui_org').css("z-index", inx);
		$('#blockui_org').show();
    },
    
    "hideBlock_org": function(){
    	$('#blockui_org').hide();
    },    
    
    "cur_room_att_info_list_search" : function(ky){
    	//현재 채팅방 정보에서 ky값 데이터를 리턴해주는 함수    	
    	//cur_room_att_info_list가 없으면 로겈 채팅방 정보를 활용해서 다시 설정해야 한다.
    	
    	var attlist = "";
    	if (gma.chat_position == "popup_chat"){
    		attlist = gBody.cur_room_att_info_list_popup;
    	}else{
    		attlist = gBody.cur_room_att_info_list;
    	}
    	
    	if (typeof(attlist) == "undefined" || attlist.length == 0){
    		attlist = gap.search_cur_chatroom_attx(gBody.cur_cid);
    	}    	
    	var list = attlist;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ky == ky){
    			return info;
    			break;
    		}
    	}
    },    
    
    "cur_room_att_person_img_info_search" : function(ky){
    	//현재 채팅방 정보에서 ky값 데이터를 리턴해주는 함수    	    	
    	//cur_room_att_info_list가 없으면 로겈 채팅방 정보를 활용해서 다시 설정해야 한다.
    	if (gBody.cur_room_att_info_list.length == 0){
    		gBody.cur_room_att_info_list = gap.search_cur_chatroom_attx(gBody.cur_cid);
    	}    	
    	var list = gBody.cur_room_att_info_list;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ky == ky){
    			return info.pu;
    			break;
    		}
    	}
    },
    
    "cur_room_att_person_dept_search" : function(ky, type){    	
    	//cur_room_att_info_list가 없으면 로겈 채팅방 정보를 활용해서 다시 설정해야 한다.
    	if (gBody.cur_room_att_info_list.length == 0){
    		gBody.cur_room_att_info_list = gap.search_cur_chatroom_attx(gBody.cur_cid);
    	}    	
    	//현재 채팅방 정보에서 ky값 데이터를 리턴해주는 함수    	   	
    	var list = gBody.cur_room_att_info_list;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ky == ky){
    			if (type == "ko"){
    				return info.dp;
    			}else{
    				return info.edp;
    			}
    			break;
    		}
    	}    	
    },    
    
    "cur_room_is_owner_search" : function(ky, room_key){
    	//현재 채팅방 정보에서 ky값 데이터를 리턴해주는 함수    	    	
    	//채널 정보가 없을 경우 가져와서 등록한다.		
    	gap.pre_workroom_set();    	
    	var list = gap.cur_channel_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_code == room_key){
    			if (info.owner.ky == ky){
    				return true;
    			}else{
    				return false;
    			}    			
    			break;
    		}
    	}
    	return false;
    },   
    
    "cur_room_exist_plugin" : function(room_key){
    	//현재 채팅방 정보에서 ky값 데이터를 리턴해주는 함수          	
    	//채널 정보가 없을 경우 가져와서 등록한다.		
    	gap.pre_workroom_set();    	
    	var list = gap.cur_channel_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_code == room_key){
    			return info.plugin;		
    			break;
    		}
    	}
    	return "";
    },    
    
    "cur_room_search_info" : function(room_key){
    	//현재 채팅방 정보에서 ky값 데이터를 리턴해주는 함수    	    	
    	//채널 정보가 없을 경우 가져와서 등록한다.		
    	gap.pre_workroom_set();    	
    	var list = gap.cur_channel_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_code == room_key){
    			return info;
    			break;
    		}
    	}
    	return "";
    },    
    
    "cur_room_search_info_member_ids" : function(room_key){
    	//현재 업무방에 멤버의 ky값만 추출해서 준다.	
    	gap.pre_workroom_set();    	
    	var list = gap.cur_channel_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_code == room_key){
    			
    			var members = info.member;
    			//members.push(info.owner);
    			
    			var mlist = [];
    			for (var k = 0 ; k < members.length; k++){
    				//if (gap.userinfo.rinfo.ky != members[k].ky){
    				//웹에서 삭제할 경우 본인의 모바일에도 전송되어야 하기 때문에 전체에게 발송한다.
    					mlist.push(members[k].ky);
    				//}
    				
    			}
    			
    			mlist.push(info.owner.ky);
    			
    			return mlist;
    			break;
    		}
    	}
    	return "";
    },    
    
    "cur_drive_search_info" : function(room_key){
    	//현재 채팅방 정보에서 ky값 데이터를 리턴해주는 함수    	    	
    	//채널 정보가 없을 경우 가져와서 등록한다.		
    	gap.pre_drive_set();    	
    	var list = gBody.cur_drive_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_code == room_key){
    			return info;
    			break;
    		}
    	}
    	return "";
    },
    
    "cur_room_members_key" : function(room_key){    	
    	var res = "";
    	gBody.search_resources = [];    	
    	//채널 정보가 없을 경우 가져와서 등록한다.		
    	gap.pre_workroom_set();    	
    	var list = gap.cur_channel_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_code == room_key){
    			var owner = info.owner;
    			var resource_data = new Object();
        		resource_data.cp = owner.cp;
        		resource_data.cpc = owner.cpc;
        		resource_data.dp = owner.dp;
        		resource_data.id = owner.ky;
        		resource_data.emp = owner.emp;
        		resource_data.nm = owner.nm;
        		gBody.search_resources.push(resource_data);
    			res = owner.ky;
    			var members = info.member;
    			for (var j = 0 ; j < members.length ; j++){
    				var sinfo = members[j];           		
            		res += "-" + sinfo.ky;           		
            		var resource_data = new Object();
            		resource_data.cp = sinfo.cp;
            		resource_data.cpc = sinfo.cpc;
            		resource_data.dp = sinfo.dp;
            		resource_data.id = sinfo.ky;
            		resource_data.emp = sinfo.emp;
            		resource_data.nm = sinfo.nm;
            		gBody.search_resources.push(resource_data);
    			}   			
    		}    		
    	}
    	return res;;
    },
    
    "cur_room_exist_plugin_setting" : function(room_key, plugin, type){
    	//현재 채팅방 정보에서 ky값 데이터를 리턴해주는 함수        	
    	//채널 정보가 없을 경우 가져와서 등록한다.		
    	gap.pre_workroom_set();    	
    	var list = gap.cur_channel_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_code == room_key){    			
    			if (type == "add"){
    				if (typeof(info.plugin) == "undefined"){
    					info.plugin = new Array();
    				}
    				var oob = new Object();
        			oob.list = plugin;
        			info.plugin.push(oob);
    			}else{    			
        			var ar = info.plugin;        			
        			for (var i =0; i < ar.length; i++){
        				if (ar[i].list === plugin) {
        				      ar.splice(i,1);
        				      break;
        				}             			
        			}
        		}    			
    			break;
    		}
    	}
    	return "";
    },    
    
    "cur_room_att_person_img_info_search2" : function(ky, info){
    	//사용자 key와 참석자 리스트를 줄수 있는 경우   	
    	var list = info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ky == ky){
    			return info.pu;
    			break;
    		}
    	}
    },
        
    "cur_room_att_person_img_info_search3" : function(ky, room_key){
    	//사용자 key를 전체  채팅방에서 room_key로 방 정보를 가져오고 해당 방의 참석자 정보를 활용해서 ky의 정보를 가져옵니다.   	
    	var list = gap.search_cur_chatroom_attx(room_key);
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ky == ky){
    			return info.pu;
    			break;
    		}
    	}
    },
    
    "cur_room_att_person_img_info_search4" : function(ky, room_key){
    	//사용자 key를 전체  채팅방에서 room_key로 방 정보를 가져오고 해당 방의 참석자 정보를 활용해서 ky의 정보를 가져옵니다.   	
    	var list = gap.search_cur_chatroom_attx(room_key);
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ky == ky){
    			return info;
    			break;
    		}
    	}
    },    
    
	"search_cur_chatroom_attx" : function(room_key){
		var cid = room_key;
		var list = gap.chat_room_info.ct;
		var attlist = "";
		for (var i = 0 ; i < list.length; i++){
			var info = list[i];
			if (cid == info.cid){
				attlist = info.att;
				break;
			}
		}	
		return attlist;		
	},
	
	"last_msg_file_change" : function(room_key, ex){
		var cid = room_key;
		var list = gap.chat_room_info.ct;
		var attlist = "";
		for (var i = 0 ; i < list.length; i++){
			var info = list[i];
			if (cid == info.cid){
				
				info.ex = ex.ex;
				info.wmsg = ex.msg;
				break;
			}
		}	
		return attlist;		
	},
	
	"search_cur_channel_remove_member" : function(room_key, removeky){
		var res = 0;
		gap.pre_workroom_set();    	
    	var list = gap.cur_channel_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_code == room_key){    			
    			var lp = [];
    			for (var k = 0; k < info.member.length; k++){
    				if (removeky != info.member[k].ky){
    					lp.push(info.member[k]);
    					res++;
    				}
    			}
    			info.member = lp;
    			break;
    		}
    	}
    	return res;
	},
	
	"search_cur_drive_remove_member" : function(room_key, removeky){
		var res = 0;		
		gap.pre_drive_set();    	
    	var list = gBody.cur_drive_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_code == room_key){    			
    			var lp = [];
    			for (var k = 0; k < info.member.length; k++){
    				if (removeky != info.member[k].ky){
    					lp.push(info.member[k]);
    					res++;
    				}
    			}
    			info.member = lp;
    			break;
    		}
    	}
    	return res;
	},
	
	"search_cur_drive_chnage_member" : function(room_key, members){
		//특정 드라이브의 멤버를 변경합니다.	
		var res = 0;		
		gap.pre_drive_set();    	
    	var list = gBody.cur_drive_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_code == room_key){    			
    			info.member = members;
    			break;
    		}
    	}
    	return res;
	},	
	
	"search_cur_channel_chnage_member" : function(room_key, members){		
		var res = 0;
		gap.pre_workroom_set();    	
    	var list = gap.cur_channel_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_code == room_key){    			
    			info.member = members;
    			break;
    		}
    	}
    	return res;
	},
		
	"delete_all_read_time" : function(){		
		for (var key in gBody3){			
			if (key.indexOf("last_read_time_") > -1){
				delete gBody3[key];
			}	                  
		}
	},
	
	"change_cur_channel_read_time" : function(room_key, read_time){
		//해당 채널에 내가 마지막으로 읽은 시간을 다시 기록 한다.
		//gBody3. channel_read_update 함수 호출 결과를 받아서 여기에 업데이트 한다.
		//방마다 내가 읽지 않은 위치로 이동하기 위해서 처리한다.
		var res = "";
		gap.pre_workroom_set();    	
    	var list = gap.cur_channel_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_code == room_key){    			
    			gBody3["last_read_time_" + room_key] = info.read_time;    			
    			info.read_time = read_time;
    			break;
    		}
    	}
    	return res;
	},    
	
	"check_cur_channel_read_time" : function(room_key){
		//해당 채널에 내가 마지막으로 읽은 시간을 다시 기록 한다.
		//gBody3. channel_read_update 함수 호출 결과를 받아서 여기에 업데이트 한다.
		//방마다 내가 읽지 않은 위치로 이동하기 위해서 처리한다.
		var res = "";
		gap.pre_workroom_set();    	
    	var list = gap.cur_channel_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_code == room_key){      			
    			res = info.read_time;
    			break;
    		}
    	}
    	return res;
	},    
    
    "encodeid" : function (id){
    	id = id.replace(/_/gi,"-lpl-");
    	return id.replace(/\^/gi,"_").replace(/\./gi,"-spl-");
    },
    
    "decodeid" : function (id){
    	//id = id.replace(/-lpl-/gi,"_");
    	var kkk = id.replace(/\_/gi,"^").replace(/-spl-/gi,".").replace(/-lpl-/gi,"_");
    	return kkk;
    },
       
    "show_image" : function(url, title, callfrom){    	
    	//show_image를 하기 전에 이전 / 다음 이미지를 등록해야 이전 다음 버튼이 표시됩니다.
    	//gap.image_gallery에 배열 Json으로 이미지명과 url을 등록하고 show_image 함수를 호출해야한다.   	
    	var img_list = gap.image_gallery;
    	var cur_image = gap.image_gallery_current;
    	$("#img_next_btn").hide();
		$("#img_prev_btn").hide();		
    	if (img_list.length > 1){
    		//이미지가 배열로 들어온 경우 이동 버튼을 표시한다.
    		if (img_list.length == cur_image){
    			$("#img_next_btn").hide();
    			$("#img_prev_btn").show();
    		}else if (cur_image == 1){
    			$("#img_prev_btn").hide();
    			$("#img_next_btn").show();
    		}else{
    			$("#img_next_btn").show();
    			$("#img_prev_btn").show();
    		}    		
    		$("#img_next_btn").off().on("click", function(e){        		
    			gap.panzoom.reset();
        		var cimage = gap.image_gallery_current;
        		$("#preview_img_src").attr("src", gap.image_gallery[cimage].url);
        		$("#preview_img_src").attr("data", gap.image_gallery[cimage].url);
        		
        		var nm = gap.image_gallery[cimage].nm
        		var dt = gap.image_gallery[cimage].dt;
        		var sz = gap.image_gallery[cimage].sz;
        		var dis_date;
        		var disadd;
        		
        		//2024.04.17 업무방에서 이미지 슬라이드 사용시에는 다음 값이 없으므로 그리지 않음.
       			if (typeof nm == "undefined" || typeof dt == "undefined" || typeof sz == "undefined") {
        			disadd = "&nbsp; <span style='font-size:15px'></span>"
        		} else {
        			dis_date = gap.change_date_localTime_full2(""+dt);
            		disadd = "&nbsp; <span style='font-size:15px'>["+nm+" | "+dis_date+" | "+gap.file_size_setting(sz)+"]</span>"
        		}
        		
        		$("#preview_title").html(gap.image_gallery[cimage].title + disadd);
        		gap.image_gallery_current++;
        		if (gap.image_gallery_current == img_list.length){
        			$(this).hide();
        		}
        		if (gap.image_gallery_current < img_list.length){
        			$("#img_prev_btn").show();
        		}
        	});
        	$("#img_prev_btn").off().on("click", function(e){        	
        		gap.panzoom.reset();
        		var cimage = gap.image_gallery_current - 2;
        		$("#preview_img_src").attr("src", gap.image_gallery[cimage].url);
        		$("#preview_img_src").attr("data", gap.image_gallery[cimage].url);
        		
        		var nm = gap.image_gallery[cimage].nm
        		var dt = gap.image_gallery[cimage].dt;
        		var sz = gap.image_gallery[cimage].sz;
        		var dis_date;
        		var disadd;
        		
        		//2024.04.17 업무방에서 이미지 슬라이드 사용시에는 다음 값이 없으므로 그리지 않음.
       			if (typeof nm == "undefined" || typeof dt == "undefined" || typeof sz == "undefined") {
        			disadd = "&nbsp; <span style='font-size:15px'></span>"
        		} else {
        			dis_date = gap.change_date_localTime_full2(""+dt);
            		disadd = "&nbsp; <span style='font-size:15px'>["+nm+" | "+dis_date+" | "+gap.file_size_setting(sz)+"]</span>"
        		}
        		
        		
        		$("#preview_title").html(gap.image_gallery[cimage].title + disadd);
        		gap.image_gallery_current--;
        		if (gap.image_gallery_current == 1){
        			$(this).hide();
        		}
        		if (gap.image_gallery_current < img_list.length){
        			$("#img_next_btn").show();
        		}        		
        	});
    	}
    	/////////////////////////////////////////////////////////////////////    	
    	$("#preview_title").html(title);    	
		$("#preview_img_src").attr("src", url);			
		$("#preview_img_src").attr("data", url);		
		var int = gap.maxZindex();
		$("#preview_img").css("zIndex", parseInt(int) + 1);
		$("#preview_img").fadeIn();		
		//이미지 줌 처리하기 ///////////////////////////////////////////////////////////////
		var elem = document.getElementById('img_preview_layer')
		gap.panzoom = Panzoom(elem, {
		  startScale: 1,
		  minScale: 0.5,
		  maxScale : 3,
		  disablePan: false,
		  disableZoom: false,
		  overflow: 'hidden',
		  step: 0.5
		});
		elem.parentElement.addEventListener('wheel', gap.panzoom.zoomWithWheel);
		////////////////////////////////////////////////////////////////////////////
		// 조직도에서 띄운 경우 다운로드 기능 disable 처리
		if (callfrom == 'org') {
			$("#preview_download").hide();
			// 우측 버튼 막기
			$('#preview_img').on('contextmenu', function(){	return false;});
		} else {
			$('#preview_img').off('contextmenu');
			$("#preview_download").show();
			$("#preview_download").off();
			$("#preview_download").on("click", function(e){
				e.preventDefault();
				gap.close_preview_download();
				return false;
			});
		}
    },    
    
    "show_video" : function(url, title){    	
		$("#video_title").text(title);			
		var int = gap.maxZindex();		
		$("#preview_video").css("zIndex", parseInt(int)+1);
		$("#preview_video").show();		
		$("#video_play_div_mp4").attr("src", url);
		var video = $("#video_play_div_mp4");
		video[0].play();		
		$("#manual_close_btn2").on("click", function(){
		    video[0].src = "";
		    video[0].pause();
			$("#preview_video").hide();
		});
	},
    
    "file_show_video" : function(filename){    	
    	if (typeof(filename) == "undefined"){
    		return false;
    	}
		var ext = gap.file_extension_check(filename);
		ext = ext.toLowerCase();				
	//	if ( ext == "mp4" || ext == "avi" || ext == "mov" || ext == "wmv" || ext == "mkv" || ext == "3gp" || ext == "flv"){
		if ( ext == "mp4" || ext == "mov" ||  ext == "3gp" ){
			return true;		
		}else{
			return false;
		}	
	},
	
	"remove_status_user" : function(){		
		var lists = gBody.remove_user_status;		
		if (lists.length > 0){			
			var lix = new Array();
			for (var i = 0 ; i < lists.length; i++){
				var cuser = lists[i];
				if (cuser != ""){
					if (!gap.check_exist_favorite(cuser)){
						lix.push(""+cuser); //string convert
					}
				}
			}			
			try{
				var pp = [...new Set(lix)];
				 _wsocket.temp_list_status(pp, 2, "remove");
			}catch(e){}
			//_wsocket.temp_list_status(lix, 2, "remove");
		}		
		gBody.remove_user_status = new Array();		
	},
	
	"check_exist_favorite" : function(id){		
		if (typeof(gap.favorite_list) != "undefined"){
			var fav = gap.favorite_list;			
			for (var i = 0 ; i < fav.length; i++){
				var info = fav[i];
				if (id == info.ky){
					return true;
					break;
				}
			}	
		}		
		if ((id == gap.search_cur_ky())){
			return true;
		}			
		return false;
	},
	
	"search_status_index" : function(msg){	
		gap.cur_status_index = "";		
		for (var i = 1 ; i <=5; i++){
			if (msg == gap.etc_info.ct["om" + i]){
				gap.cur_status_index = "om" + i;
				break;
			}
			if (msg == gap.etc_info.ct["am" + i]){
				gap.cur_status_index = "am" + i;
				break;
			}
			if (msg == gap.etc_info.ct["dm" + i]){
				gap.cur_status_index = "dm" + i;
				break;
			}
		}	
	},
	
	"hide_layer" : function(selector){
		$('#' + selector).fadeOut();
		try{
			gap.hideBlock();
		}catch(e){}
	},
	
	"close_layer" : function(selector){
		$('#' + selector).empty();
		$('#' + selector).fadeOut();
		try{
			gap.hideBlock();
		}catch(e){}
	},
	
	"close_layer_todo" : function(selector){
		$('#' + selector).empty();
		$('#' + selector).fadeOut();
		
	},
	
	"remove_layer" : function(selector){
		$('#' + selector).remove();
		try{
			gap.hideBlock();
		}catch(e){}
	},
	
	"sound_newmsg" : function(){
		
	},
	
	"IE_Check" : function(){
		var agent = navigator.userAgent.toLowerCase();
		if ( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) {
			return true;
		}else {
		  return false;
		}
	},	
	
	"is_file_preview_mobile" : function(att_names){		
		var ext = "";
		att_names = att_names.toString();
		if(att_names.lastIndexOf(".") != -1){
			ext = att_names.substring(att_names.lastIndexOf(".") + 1);
			if(ext.search(/[^A-Za-z0-9]/) != -1){
				ext = ext.substring(0, ext.search(/[^A-Za-z0-9]/));
			}
		}		
		if ( (ext.toLowerCase() != "mp4") && (ext.toLowerCase() != "mov") && (ext.toLowerCase() != "3gp")){
			return true;
		}
		return false;
	},
	
	"is_file_preview_pc" : function(att_names){
		var ext = "";
		att_names = att_names.toString();
		if(att_names.lastIndexOf(".") != -1){
			ext = att_names.substring(att_names.lastIndexOf(".") + 1);
			if(ext.search(/[^A-Za-z0-9]/) != -1){
				ext = ext.substring(0, ext.search(/[^A-Za-z0-9]/));
			}
		}		
		if ( (ext.toLowerCase() != "mp4") && (ext.toLowerCase() != "mov") && (ext.toLowerCase() != "3gp")){
			return true;
		}
		return false;
	},
		
	"is_file_type" : function(att_names){
		var ext = "";
		att_names = att_names.toString();
		if(att_names.lastIndexOf(".") != -1){
			ext = att_names.substring(att_names.lastIndexOf(".") + 1);
			if(ext.search(/[^A-Za-z0-9]/) != -1){
				ext = ext.substring(0, ext.search(/[^A-Za-z0-9]/));
			}
		}	
		switch (ext.toLowerCase()){
			case "gif" :
			case "bmp" :
			case "jpg" :
			case "jpeg" :
			case "png" :
				return "img"
				break;
			case "avi" :
			case "mov" :
			case "wmv" :
			case "mp4" :
			case "mkv" :
			case "flv" :
			case "3gp" :
				return "movie";
				break;
			case "doc" :
			case "docx" :
			case "ppt" :
			case "pptx" :
			case "xls" :
			case "xlsx" :
			case "pdf" :
			case "txt" : 
			case "hwp" : 
			case "pdf" :
				return "doc";
				break;
			default :
				return "etc";
				break;
		}
	},
	
	
	"is_file_type_filter" : function(att_names){		
		var ext = "";
		att_names = att_names.toString();
		if(att_names.lastIndexOf(".") != -1){
			ext = att_names.substring(att_names.lastIndexOf(".") + 1);
			if(ext.search(/[^A-Za-z0-9]/) != -1){
				ext = ext.substring(0, ext.search(/[^A-Za-z0-9]/));
			}
		}	
		switch (ext.toLowerCase()){
			case "gif" :
			case "bmp" :
			case "jpg" :
			case "jpeg" :
			case "png" :
				return "img"
				break;
			case "zip" :
			case "rar" :
			case "tar" :
			case "7z" :
				return "zip"
				break;
			case "avi" :
			case "mov" :
			case "wmv" :
			case "mp4" :
			case "mkv" :
			case "flv" :
			case "3gp" :
				return "movie";
				break;
			case "doc" :
			case "docx" :
				return "doc";
				break;
			case "ppt" :
			case "pptx" :
				return "ppt";
				break;
			case "xls" :
			case "xlsx" :
				return "xls";
				break;
			case "pdf" :
				return "pdf";
				break;
			case "txt" : 
				return "txt";
				break;
			case "hwp" : 
				return "hwp";
				break;
			default :
				return "etc";
				break;
		}
	},
	
	"get_bun_filename" : function(file_info){
		if (typeof(file_info) != "undefined" && typeof(file_info.bun) == "undefined"){
			return file_info.filename;
			
		}else{
			var filename = file_info.filename;
			var name = filename.substr(0, filename.lastIndexOf('.'));
			var ext = "";
			filename = filename.toString();
			if(filename.lastIndexOf(".") != -1){
				ext = filename.substring(filename.lastIndexOf(".") + 1);
				if(ext.search(/[^A-Za-z0-9]/) != -1){
					ext = ext.substring(0, ext.search(/[^A-Za-z0-9]/));
				}
			}
			return name + " (" + (typeof(file_info.bun.$numberLong) == "undefined" ? file_info.bun : file_info.bun.$numberLong) + ")." + ext;
		}
	},
	
	
	"draw_file_info" : function(data, file_type, size){
		var thtml = "";
		switch (file_type){
			case "doc" :
				if (data.author){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.maker+"</th>";
						thtml += "<td>" + data.author + "</td>";
						thtml += "</tr>";
				}
				if (data.lastauthor){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.luu+"</th>";
						thtml += "<td>" + data.lastauthor + "</td>";
						thtml += "</tr>";
				}
				if (data.applicationname){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.ap + "</th>";
						thtml += "<td>" + data.applicationname + "</td>";
						thtml += "</tr>";
				}
				if (data.creationdate){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.created+"</th>";
						thtml += "<td>" + gap.makeDateTime(data.creationdate) + "</td>";
						thtml += "</tr>";

				}
				if (data.modifydate){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.lud+"</th>";
						thtml += "<td>" + gap.makeDateTime(data.modifydate) + "</td>";
						thtml += "</tr>";
				}
				if (data.revisionnumber){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.luc+"</th>";
						thtml += "<td>" + data.revisionnumber + "</td>";
						thtml += "</tr>";
				}
				if (data.slidecount){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.slc+"</th>";
						thtml += "<td>" + data.slidecount + "</td>";
						thtml += "</tr>";
				}
				if (data.wordcount){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.ttc+"</th>";
						thtml += "<td>" + data.wordcount + "</td>";
						thtml += "</tr>";
				}
				break;
			case "img" :
				if (data.EQUIPMENT_MODEL){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.mname+"</th>";
						thtml += "<td>" + data.EQUIPMENT_MODEL + "</td>";
						thtml += "</tr>";
				}
				if (data.EQUIPMENT_MAKE){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.mfn+"</th>";
						thtml += "<td>" + data.EQUIPMENT_MAKE + "</td>";
						thtml += "</tr>";
				}
				if (data.FOCAL_LENGTH){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.f1+"</th>";
						thtml += "<td>" + data.FOCAL_LENGTH + "</td>";
						thtml += "</tr>";
				}
				if (data.F_NUMBER){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.f2+"</th>";
						thtml += "<td>" + data.F_NUMBER + "</td>";
						thtml += "</tr>";
				}
				if (data.creationdate){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.created+"</th>";
						thtml += "<td>" + gap.makeDateTime(data.creationdate) + "</td>";
						thtml += "</tr>";
				}
				if (data.width){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.width+"</th>";
						thtml += "<td>" + data.width + "</td>";
						thtml += "</tr>";
				}
				if (data.height){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.height+"</th>";
						thtml += "<td>" + data.height + "</td>";
						thtml += "</tr>";
				}
				break;
			case "movie" :
				if (data.General_File_size){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.mfs+"</th>";
					//	thtml += "<td>" + data.General_File_size + "</td>";
						thtml += "<td>" + data.size + "</td>";
						thtml += "</tr>";
				}
				if (data.General_Duration){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.mft+"</th>";
						thtml += "<td>" + data.General_Duration + "</td>";
						thtml += "</tr>";				
				}
				if (data.Video_Width){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.mw+"</th>";
						thtml += "<td>" + data.Video_Width + "</td>";
						thtml += "</tr>";
				}
				if (data.Video_Height){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.mh+"</th>";
						thtml += "<td>" + data.Video_Height + "</td>";
						thtml += "</tr>";
				}
				if (data.Video_Codec_ID){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.ci+"</th>";
						thtml += "<td>" + data.Video_Codec_ID + "</td>";
						thtml += "</tr>";
				}
				if (data.Video_Display_aspect_ratio){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.msr+"</th>";
						thtml += "<td>" + data.Video_Display_aspect_ratio + "</td>";
						thtml += "</tr>";
				}
				if (data.General_Format){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.format+"</th>";
						thtml += "<td>" + data.General_Format + "</td>";
						thtml += "</tr>";
				}
				if (data.Video_Bit_rate){
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.br+"</th>";
						thtml += "<td>" + data.Video_Bit_rate + "</td>";
						thtml += "</tr>";
				}
				if (data.Video_Frame_rate){				
						thtml += "<tr>";
						thtml += "<th>"+gap.lang.fr+"</th>";
						thtml += "<td>" + data.Video_Frame_rate + "</td>";
						thtml += "</tr>";
				}
				break;
			default :
				thtml += "<tr>";
				thtml += "</tr>";
				break;
		}
		return thtml;
	},	
	
	"makeDateTime" : function(data){
		var DateTime = new Date(data);
		return DateTime.getFullYear()+"-"+gap.makeTwoDigit(DateTime.getMonth()+1)+"-"+gap.makeTwoDigit(DateTime.getDate())+" "
			+gap.makeTwoDigit(DateTime.getHours())+":"+gap.makeTwoDigit(DateTime.getMinutes())+":"+gap.makeTwoDigit(DateTime.getSeconds())
	},
	
	"makeTwoDigit" : function(x){
		if(x.toString().length==1)return "0"+x;else return x;
	},
	
	"show_loading" : function(text){		
		$("#show_loading_layer").remove();		
		gap.showBlock();		
		var inx = parseInt(gap.maxZindex()) + 1;		
		var html = "";
		html += "<div class='loader' id='show_loading_layer' style='z-index:"+inx+"'>";
		html += "	<div class='sk-circle'>";
		html += "		<div class='sk-circle1 sk-child'></div>";
		html += "		<div class='sk-circle2 sk-child'></div>";
		html += "		<div class='sk-circle3 sk-child'></div>";
		html += "		<div class='sk-circle4 sk-child'></div>";
		html += "		<div class='sk-circle5 sk-child'></div>";
		html += "		<div class='sk-circle6 sk-child'></div>";
		html += "		<div class='sk-circle7 sk-child'></div>";
		html += "		<div class='sk-circle8 sk-child'></div>";
		html += "		<div class='sk-circle9 sk-child'></div>";
		html += "		<div class='sk-circle10 sk-child'></div>";
		html += "		<div class='sk-circle11 sk-child'></div>";
		html += "		<div class='sk-circle12 sk-child'></div>";
		html += "	</div>";
		html += "	<p id='show_loading_text'>"+text+"</p>";
		html += "	<div id='show_loading_progress'></div>";
		html += "</div>";		
		$("body").append(html);
	},
	
	"hide_loading" : function(){
		gap.hideBlock();
		$("#show_loading_layer").fadeOut();
		$(".loader").remove();
	},
	
	"show_loading2" : function(text){		
		$("#show_loading_layer").remove();		
		var maskHeight = $(document).height(); 
		var maskWidth = window.document.body.clientWidth; 		
		var inx = parseInt(gap.maxZindex()) + 1;
		var mask = "<div id='mask' style='position:absolute; z-index:"+inx+"; background-color:#000000; display:none; left:0; top:0;'></div>"; 	
		var inx2 = parseInt(gap.maxZindex()) + 2;
		var html = "";
		html += "<div class='loader' id='show_loading_layer' style='z-index:"+inx2+"'>";
		html += "	<div class='sk-circle'>";
		html += "		<div class='sk-circle1 sk-child'></div>";
		html += "		<div class='sk-circle2 sk-child'></div>";
		html += "		<div class='sk-circle3 sk-child'></div>";
		html += "		<div class='sk-circle4 sk-child'></div>";
		html += "		<div class='sk-circle5 sk-child'></div>";
		html += "		<div class='sk-circle6 sk-child'></div>";
		html += "		<div class='sk-circle7 sk-child'></div>";
		html += "		<div class='sk-circle8 sk-child'></div>";
		html += "		<div class='sk-circle9 sk-child'></div>";
		html += "		<div class='sk-circle10 sk-child'></div>";
		html += "		<div class='sk-circle11 sk-child'></div>";
		html += "		<div class='sk-circle12 sk-child'></div>";
		html += "	</div>";
		html += "	<p id='show_loading_text'>"+text+"</p>";
		html += "	<div id='show_loading_progress' ></div>";
		html += "</div>";
		$('body').append(mask).append(html);		
		$('#mask').css({ 'width' : maskWidth , 'height': maskHeight , 'opacity' : '0.5' }); 
		$('#mask').show(); 
		$('#loadingImg').show();
	},
	
	"hide_loading2" : function(){
		$("#show_loading_layer").fadeOut();
		$('#mask, #loadingImg').hide(); 
		$('#mask, #loadingImg').remove();
	},
	
	"hide_loading3" : function(){	
		$("#show_loading_layer").fadeOut();
		$('#mask, #loadingImg').hide(); 
		$('#mask, #loadingImg').remove();
	},
	
	"check_preview_file" : function(file){
		if ($.isArray(file)){
			file = file[0];
		}
		var reg = /(.*?)\.(ppt|pptx|xls|xlsx|doc|docx|pdf|hwp|txt)$/;
	  	if(file.toLowerCase().match(reg)) {
			return true;
		} else {
			return false;
		}
	},
	
	"full_dept_codes" : function(){
		if (location.href.indexOf('kmslab.com') > -1){
			var _ret = fulldeptcode.replace(/\^/gi, "-spl-");
			
		}else{
			var _ret = companycode + '-spl-' + fulldeptcode.replace(/\^/gi, "-spl-");
		}
		return _ret;
	},
	
	"og_url_check" : function(imgurl){	
		var isSSL = false;
		if (location.protocol == "https:"){
			isSSL = true;
		}
		//현재 URL이 SSL이 True이면 ogtag image가 http일 경우 표시할 수 없다.
		var emppath =  "resource/images/thm_link.png";
		var im = "";		
		if (typeof(imgurl) == "undefined"){
			im = "<img src='" + emppath + "' />"
		}else{
			if (isSSL){
				imgurl = imgurl.replace("http://", "https://");
			}			  
			if (imgurl == ""){
				im = "<img src='" + emppath + "' />"
			}else{
				im = "<img src='" + imgurl + "' onerror='this.onerror=null; this.src="+emppath+"' />"
			}
		}
		return im;		  
	},
		
	
	
	"user_check" : function(info){		
		// 언어에 따른 셋
		var member_name = info.nm;
		var company = info.cp;
		var dept = info.dp;
		var jt = (info.dg == 'DUTY' ? info.du : info.jt);		
		var jtc = info.jtc;	// 직무레벨
		var du = info.du;	// 직책				
		var email = info.em;
		var mobile = "";		
		if (typeof(info.mp) != "undefined"){
			mobile = info.mp;
		}else{
			mobile = info.mop;
		}		
		if (gap.curLang == "ko"){
			// 1. 한국어 사용이면 무조건 한국어 필드로 표시
		} else {
			if (gap.curLang == info.el){
				// 2. 나와 같은 언어를 사용하면 로컬언어로 표시
				member_name = info.onm;
				dept = info.odp;
				jt = (info.dg == 'DUTY' ? info.odu : info.ojt);
			}else{
				// 3. 나와 다른 언어를 사용하면 영문으로 표시
				member_name = info.enm;				
				dept = info.edp;
				jt = (info.dg == 'DUTY' ? info.edu : info.ejt);
			}			
			company = info.ecp;
		}		
		var is_dept = false;
		if (typeof(info.dsize) != "undefined" && info.dsize == "group"){
			is_dept = true;
		}	
		var select_user_img = gap.person_profile_photo(info);
		var select_user_img_url = gap.person_photo_url(info);
		/*
		var ob = {
			name	: member_name,
			company : company,
			dept 	: dept,
			email 	: email,
			mobile 	: mobile,
			jt 		: jt,
			jtc 	: info.jtc,
			du 		: info.du,
			cpc 	: info.cpc,
			emp 	: info.emp,
			ky 		: info.ky,
			nm 		: info.nm,
			enm 	: info.enm,
			el 		: info.el,
			lid		: info.lid,
			mf		: info.mf,
			ms		: info.ms,
			mm		: info.mm,
			op		: info.op,
			op2		: info.op2,
			op_new	: info.op_new,
			uac		: info.uac,
			wl		: info.wl,
			dg		: info.dg,
			user_img : select_user_img,
			disp_user_info : (is_dept ? member_name : member_name + "/" + dept)
		}
		*/		
		var ob = $.extend({}, info);
		ob.name	= member_name;
		ob.company = company;
		ob.dept 	= dept;
		ob.email 	= email;
		ob.mobile 	= mobile;
		ob.ky 		= info.emp;
		ob.jt 		= jt;
		ob.user_img = select_user_img;
		ob.user_img_url = select_user_img_url;
		ob.disp_name_info = (is_dept ? member_name : member_name + " " + jt);
		ob.disp_user_info = (is_dept ? member_name : member_name + " " + jt + " | "  + dept);		
		return ob;
	},
	
	"user_check_none" : function(info){
		var ob = new Object();
		ob.name = "None";
		ob.company = "";
		ob.dept = "";
		ob.email = "";
		ob.mobile = "";
		ob.jt = "";
		ob.user_img = gap.person_photo(cdbpath + gap.none_img);
		ob.ky = "";
		ob.disp_user_info = "" + "/" + "";		
		return ob;
	},
	
	"check_alert" : function(msg){
		if (gap.userinfo.rinfo.em == "kmslab_sh.baek@amorepacific.com" || gap.userinfo.rinfo.em == "kmslab_yk.kim@amorepacific.com"){
			gap.gAlert(msg);
		}
	},
	
	"check_debugger" : function(){
		if (gap.userinfo.rinfo.em == "kmslab_sh.baek@amorepacific.com" || gap.userinfo.rinfo.em == "kmslab_yk.kim@amorepacific.com"){			
		}
	},
	
	"getParam2" : function(sname){		
		var params = location.search.substr(location.search.indexOf("?") + 1);
		var sval = "";
		params = params.split("&");
		for (var i = 0 ; i < params.length; i++){
			if (params[i].indexOf(sname) > -1){
				return params[i].split("=")[1];
			}
		}
	},

	"getParam" : function(sname){		
		var params = location.search.substr(location.search.indexOf("?") + 1);
		var sval = "";
		params = params.split("&");
		sval = params[1];		
		gap.param2 = params[2];
		gap.param3 = params[3];		
		return sval;
	},
	
	"getParam_mobile" : function(sname){
		gap.param1 = "";
		gap.param2 = "";
		gap.param3 = "";
		gap.param4 = "";		
		var params = location.search.substr(location.search.indexOf("?") + 1);
		var sval = "";
		params = params.split("&");	
		if (params.length > 2){
			sval = params[1];	
			if (params[1]) gap.param1 = sval.replace("t=","");
			if (params[2]) gap.param2 = params[2].replace("k1=","");
			if (params[3]) gap.param3 = params[3].replace("k2=","");
			if (params[4]) gap.param4 = params[4].replace("k3=","");			
		}else{
			sval = params[1];
			if (params[1]) gap.param1 = sval;
		}		
		return sval;
	},
	
	"change_location" : function(pa){	
		return false;
		var url = location.pathname + "?readform&"+pa;
		if (history.state != pa){
			history.pushState(pa, null, url);
		}else{
			history.replaceState(pa, null, url);
		}
	},
	
	"push_noti_mobile" : function(obj){	
		return false; //사용안함 2025.05.21
		if (obj.sender == ""){
			return false;
		}		
		var mention_log = "";
		var emails = "";
		var content = "";
		var project_name = "";
		if (typeof(obj.mention_log) != "undefined"){
			mention_log = obj.mention_log;
		}
		if (typeof(obj.emails) != "undefined"){
			emails = obj.emails;
		}
		if (typeof(obj.content) != "undefined"){
			content = obj.content;
		}
		if (typeof(obj.project_name) != "undefined"){
			project_name = obj.project_name;
		}
		var url = gap.channelserver + "/push.do";		
		var data = JSON.stringify({
			"msg" :  obj.msg,
			"title" : obj.title,
			"type" : obj.type,
			"key1" : obj.key1,
			"key2" : obj.key2,
			"key3" : obj.key3,
			"fr" : obj.fr,
			"sender" : obj.sender,
			"dbg" : "F",
			"mention_log" : mention_log,
			"emails" : emails,
			"content" : content,
			"project_name" : project_name
		});	
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			data : data,
			success : function(res){
				
			},
			error : function(e){
				gap.error_alert();
			}
		})
	},
	
	"ext_user_setting" : function(){
		$("#todo").hide();
		$("#mail").hide();
		$("#cal").hide();
		$("#help").hide();		
		$("#left_favorite").hide();
		$(".nav-tab").hide();
	},
	
	// 조직도창에서 선택된 데이터 convert
	"convert_org_data" : function(data){
		var info = new Object();
		if (typeof(data.type) != "undefined" && (data.type == "P" || data.type == "D")){
			info.cp = data.company;
			info.cpc = data.companycode;
			info.dg = data.dispgrade;
			info.dp =  data.orgname;
			info.dpc = (data.type == "D" ? data.code : data.orgcode);
			info.du = data.duty;
			info.ecp = data.ecompany;
			info.edp = data.eorgname;
			info.edu = data.eduty;
			info.ejt = data.epost;
			info.el = data.lang;
			info.em = (data.type == "D" ? data.empno : data.email);
			info.emp = data.empno;
			info.enm = data.ename;
			info.mf = data.mailfile;
			info.fx = '';
			info.id = data.userid;
			info.iptno = data.phonenumber;	//'==========>';
			info.jt = data.post;
			info.jtc = data.postcode;
			info.ky = (data.type == "D" ? data.empno : data.orgnumber);
			info.mp = data.cellphonenumber;
			info.nm = data.name;
			info.ocp = data.ocompany;
			info.odp = data.oorgname;
			info.odu = data.oduty;
			info.ojt = data.opost;
			info.onm = data.oname;			
			info.op = data.officephonenumber;
			info.dsize = (data.type == "D" ? 'group' : '');
			info.ms = "mail2/kmslab/kr";		//메일서버	
			info.nid = data.authid;				//노츠ID
			
		}else{
			info = data;
		}
		return info;
	},
	
	// 조직도창에서 사용될 데이터로 convert
	"convert_org_data_reverse" : function(_data){
		var _d = new Object();

		_d.type = _data.dsize == "group" ? "D" : "P";
		_d.company = _data.cp ? gap.textToHtml(_data.cp) : "";
		_d.notesid = _data.emp ? gap.textToHtml(_data.emp) : "";
		_d.companycode = _data.cpc ? gap.textToHtml(_data.cpc) : "";
		_d.dispgrade = _data.dg ? gap.textToHtml(_data.dg) : "";
		_d.orgname = _data.dp ? gap.textToHtml(_data.dp) : "";
		_d.code = _data.dpc ? gap.textToHtml(_data.dpc) : (_data.cpc ? gap.textToHtml(_data.cpc) : "");
		_d.orgcode = _data.dpc ? gap.textToHtml(_data.dpc) : "";
		_d.duty = _data.du ? gap.textToHtml(_data.du) : "";
		_d.ecompany = _data.ecp ? gap.textToHtml(_data.ecp) : "";
		_d.eorgname = _data.edp ? gap.textToHtml(_data.ecp) : "";
		_d.eduty = _data.edu ? gap.textToHtml(_data.edu) : "";
		_d.epost = _data.ejt ? gap.textToHtml(_data.ejt) : "";
		_d.lang = _data.el ? gap.textToHtml(_data.el) : "";
		_d.email = _data.em ? gap.textToHtml(_data.em) : "";
		_d.mailfile = _data.mf ? gap.textToHtml(_data.mf) : "";
		_d.empno = _data.emp ? gap.textToHtml(_data.emp) : "";
		_d.orgnumber = _data.emp ? gap.textToHtml(_data.emp) : "";
		_d.ename = _data.enm ? gap.textToHtml(_data.enm) : "";
		_d.userid = _data.id ? gap.textToHtml(_data.id) : "";
		_d.phonenumber = _data.iptno ? gap.textToHtml(_data.iptno) : "";
		_d.post = _data.jt ? gap.textToHtml(_data.jt) : "";
		_d.postcode = _data.jtc ? gap.textToHtml(_data.jtc) : "";
		_d.cellphonenumber = _data.mp ? gap.textToHtml(_data.mp) : "";
		_d.name = _data.nm ? gap.textToHtml(_data.nm) :"";
		_d.ocompany = _data.ocp ? gap.textToHtml(_data.ocp) :"";
		_d.oorgname = _data.odp ? gap.textToHtml(_data.odp) : "";
		_d.oduty = _data.odu ? gap.textToHtml(_data.odu) : "";
		_d.opost = _data.ojt ? gap.textToHtml(_data.ojt) : "";
		_d.oname = _data.onm ? gap.textToHtml(_data.onm) : "";
		_d.officephonenumber = _data.op ? gap.textToHtml(_data.op) : "";
		_d.subdept = _data.subdept ? gap.textToHtml(_data.subdept) : "";
		_d.authid = _data.nid ? gap.textToHtml(_data.nid) : "";
				
		_d.fulldeptcode = "";
		_d.fulldeptname = "";
			
		if (_d.type == "D"){
			_d.name = _data.dp ? gap.textToHtml(_data.dp) : (_data.cp ? gap.textToHtml(_data.cp) : "");
			_d.ename = _data.edp ? gap.textToHtml(_data.edp) : (_data.ecp ? gap.textToHtml(_data.ecp) : "");
			_d.oname = _data.odp ? gap.textToHtml(_data.odp) : (_data.ocp ? gap.textToHtml(_data.ocp) : "");
		}
			
		return _d;
	},	
	
	"check_cur_todo_members" : function(){
		//현재 보여지는 Todo에 지정된 사용자 리스트 가져오기 / 자신은 제외한다 / push를 전달하기 위함		
		var mlist = [];
		var me = gap.userinfo.rinfo.ky;
		var owner = $(".group.g-owner").data("ky");
		if (owner != me){
			mlist.push(owner);
		}
		var asignee = $("#asignee_btn").data("ky");
		if (asignee != ""){
			if (asignee != me){
				mlist.push(asignee);
			}
		}
		var list = $("#todo_compose_checklist .user-thumb");
		for (var i = 0 ; i < list.length; i++){
			var as = $(list[i]).data("ky");
			if (as != me){
				mlist.push(as);
			}
		}
		return mlist;
	},
	
	"check_cur_todo_members_mobile" : function(){
		//현재 보여지는 Todo에 지정된 사용자 리스트 가져오기 / 자신은 제외한다 / push를 전달하기 위함
		var mlist = [];
		var me = gap.userinfo.rinfo.ky;
		var owner = $("#m_todo_owner").data("ky");
		if (owner != me){
			mlist.push(owner);
		}
		var asignee = $("#asignee_btn").data("ky");
		if (asignee != ""){
			if (asignee != me){
				mlist.push(asignee);
			}
		}
		var list = $("#todo_compose_checklist .user-thumb");
		for (var i = 0 ; i < list.length; i++){
			var as = $(list[i]).data("ky");
			if (as != me){
				mlist.push(as);
			}
		}
		return mlist;
	},
	
	"connectApp" : function(url){
		try{
			if (window.name=='kPortalMeet') {
				gap.openInWebView(url);					
			}else{
				gap.openInWebView(url);	
			}
		}catch(e){}
		
	},
	
	"openInWebView" : function(url){
		if (typeof androidHandler === 'undefined') {
			var appFrame = '<iframe id="appFrame" class="appFrame" src="'+url+'" width="0" height="0" style="display:none"></iframe>';
			$('body').append(appFrame);
			setTimeout(function(){
				$(".appFrame").remove();
			}, 1000);
			
		} else {
			androidHandler.openurl(url);
		}
	},
	
	"chnage_sec" : function(txt){		
		var sec = CryptoJS.AES.encrypt(txt, gap.passphrase);
		return sec.toString();
	},
	
	"delete_user_set" : function(list){
		//퇴사자 처리를 위해서 채팅방의 멤버리스트를 넘기고 퇴사자의 경우 (em값이 없는 경우) 빼고 보내준다
		var rlist = new Array();
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];
			if (typeof(item.em) != "undefined"){
		//	if (item.ky != "CN=백성호,OU=dune22,O=APG"){
				rlist.push(item);
			}
		}
		return rlist;
	},
	
	"get_current_datetime" : function(){
		var today = new Date();
		var date = today.getFullYear() + '-' + gap.makeTwoDigit((today.getMonth()+1)) + '-' + gap.makeTwoDigit(today.getDate());
		var time = gap.makeTwoDigit(today.getHours()) + ":" + gap.makeTwoDigit(today.getMinutes()) + ":" + gap.makeTwoDigit(today.getSeconds());
		var dateTime = date + ' ' + time;		
		return dateTime;
	},
	
	"init_auth" : function(){
		var postData = {
			"email" : gap.userinfo.rinfo.emp,
			"depts" : depts,
			"userid" : gap.userinfo.rinfo.id
		}
		var url = root_path + "/auth.do";
		
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			data : JSON.stringify(postData),
			async : false,
			success : function(res){
				
				if (res.result == "OK"){
					localStorage.setItem('auth', res.auth);
					localStorage.setItem('auth_create_time', gap.get_current_datetime());
					
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e, res, x, t){
				gap.gAlert(gap.lang.errormsg);	
			}
		})
	},
	
	"get_auth" : function(){
		var auth_time = localStorage.getItem('auth_create_time');
		var auth_token = localStorage.getItem('auth');
		
		if (auth_time && auth_token){
			var t1 = moment(auth_time, 'YYYY-MM-DD HH:mm'); 
			var t2 = moment(); 
			var dif = moment.duration(t2.diff(t1)).asMinutes();
			if (dif > gap.auth_check_time || dif == 0){
				// auth 유효시간이 지난 경우 재호출
				gap.init_auth();
			}
		}else{
			gap.init_auth();
		}
		
		return localStorage.getItem('auth')
	},
	
	"convert_mention_userdata" : function(data){		
		var list = [];
		if (data.member){
			for (var i = 0; i < data.member.length; i++){
				var user_info = gap.user_check(data.member[i]);
				var member_info = data.member[i];
				var member_obj = new Object();
				
			//	member_obj = member_info;
			//	member_obj.name = member_info.nm + '/' + member_info.jt + '/' + member_info.dp;
				member_obj.name = '@' + member_info.nm;
			//	member_obj.display = member_info.nm + ' / ' + member_info.jt + ' / ' + member_info.dp;	//member_info.nm + " [" + member_info.jt + "]";
				member_obj.display = user_info.disp_user_info;
				member_obj.dept = member_info.dp;
			//	member_obj.avatar = gap.person_profile_box_mention_uid(member_info);
				member_obj.avatar = gap.person_profile_photo_mention(member_info);
				member_obj.id = member_info.ky;
				member_obj.nm = member_info.nm;
				member_obj.em = member_info.em;
				member_obj.type = "contact";
				if (member_info.dsize && member_info.dsize == "group"){
					//nothing
				}else{
					list.push(member_obj);
				}
			}
		}		
		if (data.owner){
			var user_info = gap.user_check(data.owner);
			var owner_info = data.owner;
			var owner_obj = new Object();			
		//	owner_obj = owner_info;
		//	owner_obj.name = owner_info.nm + '/' + owner_info.jt + '/' + owner_info.dp;
			owner_obj.name = '@' + owner_info.nm;
		//	owner_obj.display = owner_info.nm + ' / ' + owner_info.jt + ' / ' + owner_info.dp;	//owner_info.nm + " [" + owner_info.jt + "]";
			owner_obj.display = user_info.disp_user_info;
			owner_obj.dept = owner_info.dp;
		//	owner_obj.avatar = gap.person_profile_box_mention_uid(owner_info);
			owner_obj.avatar = gap.person_profile_photo_mention(owner_info);
			owner_obj.id = owner_info.ky;
			owner_obj.nm = owner_info.nm;
			owner_obj.em = owner_info.em;
			owner_obj.type = "contact";			
			list.push(owner_obj);
		}
		
		return JSON.stringify(list);
	},
	
	"convert_mention_content" : function(str){		
		var mx = gap.message_check_reverse(str);
		if (mx.indexOf("<mention") > -1){
			var mk = $("<span>" + mx + "</span>");
			var ctext = "";
			var lk = $(mk).find("mention");
			for (var i = 0 ; i < lk.length; i++){
				var item = lk[i];
				var cn = $(item).attr("data");
				var na = $(item).text();
				var txt = "@[" + na + "](contact:" + cn + ")";						
				mx = mx.replace($(item).get(0).outerHTML.replace(/"/gi, "'"), txt);				
			}
		}
		return mx;
	},
	
	"reset_mentions_div" : function(){
		$(".mentions div").empty();
	},
	
	"message_check_20241025" : function(msg){
		var message = msg;		
		message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');		
		message = message.replace(/[\n]/gi, "<br>");
		message = message.replace(/\s/gi, "&nbsp;");		
		return message;
	},
	
	"message_check" : function(msg){
		var message = msg;
		if (typeof(msg) != "undefined"){
			message = gap.aLink(msg);   //http자동 링크 걸기	
			if (message.indexOf("<a href=") > -1){
				message = message.replace(/[\n]/gi, "<br>");
			}else{
				message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');		
				message = message.replace(/[\n]/gi, "<br>");
				message = message.replace(/\s/gi, "&nbsp;");
			}
		}else{
			message = "";
		}	
		return message;
	},	
	
	"message_check_reverse" : function(msg){
		var message = msg;
		message = message.replace(/&lt;/g, '<').replace(/&gt;/g, '>');		
		message = message.replace(/<br>/gi, "\n");
		message = message.replace(/&nbsp;/gi, " ");	
		return message;
	},
	
	"message_check_alarm_center" : function(msg){
		var message = msg;		
		message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');		
	//	message = message.replace(/[\n]/gi, "<br>");
		message = message.replace(/[\n]/gi, "-=spl=-");
		message = message.replace(/\s/gi, "&nbsp;");
		message = message.split("-=spl=-")[0];
		return message;
	},	
	
	"textMentionToHtml" : function(str){
		if (!str) return '';
		str = str.replace(/-=otag=-/gi,"<").replace(/-=ctag=-/gi,">");
		str = str.replace(/-=quot=-/gi,"'");
		return str;
	},
	
	"add_todo_plugin" : function(opt, channel_code){		
		//채널을 생성할때 자동으로 생성 시켜줘야 하고 삭제할때 자동으로 삭제해 주어야 한다.
		var oob = new Object();
		oob.id = channel_code;
		oob.item = "TO-DO";
		var c_info = gap.cur_room_search_info(channel_code);					
		oob.name = c_info.ch_name;
		oob.owner = c_info.owner;	
	//	oob.readers = c_info.readers;		
		var ssp1 = c_info.readers;
		var treaders = [];
		for (var i = 0 ; i < ssp1.length; i++){
		//	if (ssp1[i].indexOf("@") > -1){
				treaders.push(ssp1[i]);
		//	}
		}
		oob.readers = treaders;		
		if (typeof(c_info.member) == "undefined"){
			oob.member = [];	
		}else{
		//	oob.member = c_info.member;		
			var ssp2 = c_info.member;
			var tmember = [];
			for (var k = 0 ; k < ssp2.length; k++){
				if (ssp2[k].dsize != "group"){				
					tmember.push(ssp2[k]);
				}
			}
			oob.member = tmember;
		}		
		var url = gap.channelserver + "/plugin.km";		
		//플러그인 설치하기				
		oob.ty = opt;   //add or del
		var data = JSON.stringify(oob);				
		$.ajax({
			type : "POST",
			dataType : "json",
			data : data,
			url : url,
			success : function(res){
				
			},
			error : function(e){
				gap.error_alert();
			}
		});	
	},
	
	"checklist_update_schedule" : function(id, doc, type){
		//체크리스트가 변경될때 해당 사용자에 일정에 등록해 준다.		
		var list = doc.checklist;
		for (var i = 0 ; i < list.length; i++){
			var info = list[i];
			if (info.tid == id){				
				var obj = new Object();
				obj.title = info.txt;
			//	obj.startdate = doc.startdate;
				obj.startdate = info.start_date;
				obj.enddate = info.complete_date;
				obj.project_name = doc.project_name;
				obj.priority = doc.priority;
				obj._id = doc.project_code + "^" + doc._id.$oid + "^" + id;
				obj.owner = {ky : doc.owner.ky};
				
				if (typeof(info.asign) == "undefined"){
					return false;
				}
				if (typeof(info.complete_date) == "undefined"){
					return false;
				}
				obj.attendee = info.asign.ky;

				gap.schedule_update(obj, "checklist", "U");	
								
				break;
			}
		}
	},
	
	"checklist_all_update_schedule" : function(doc){
		//특정 할일의 전체 체크리스트를 일정에 등록해 준다.		
		var list = doc.checklist;
		for (var i = 0 ; i < list.length; i++){
			var info = list[i];
			//if (info.tid == id){				
				var obj = new Object();
				obj.title = info.txt;
				obj.startdate = doc.startdate;
				obj.enddate = info.complete_date;
				obj.project_name = doc.project_name;
				obj.priority = doc.priority;
				obj._id = doc.project_code + "^" + doc._id.$oid + "^" + info.tid;
				obj.owner = {ky : doc.owner.ky};				
				if (typeof(info.asign) == "undefined"){
					return false;
				}
				if (typeof(info.complete_date) == "undefined"){
					return false;
				}
				obj.attendee = info.asign.ky;
				gap.schedule_update(obj, "checklist", "U");									
		//		break;
		//	}
		}
	},	
	
	"todo_connect_schedule_update" : function(obj, type, ty){
		//type : "D" - 삭제, "T" - 완료, "P" - 완료 취소		
		if (typeof(obj.asignee) != "undefined"){
			var obb = new Object();						
			obb.del_id = obj.project_code + "^" + obj._id.$oid;
			obb.del_emp = obj.asignee.ky;			
			gap.schedule_update(obb, "asignee", type);		
		}
		
		if (typeof(obj.checklist) != "undefined"){
			for (var i = 0 ; i < obj.checklist.length; i++){
				var cinfo = obj.checklist[i];
				var obb = new Object();						
			//	obb.del_id = cinfo.tid;
				obb.del_id = obj.project_code + "^" + obj._id.$oid + "^" + cinfo.tid;
				if (typeof(cinfo.asign) == "undefined"){
					return false;
				}
				obb.del_emp = cinfo.asign.ky;				
				gap.schedule_update(obb, "checklist", type);			
			}
		}		
	},
	
	"todo_complete_one" : function(obj, type, sid, ty){
		for (var i = 0 ; i < obj.checklist.length; i++){
			var cinfo = obj.checklist[i];
			if (cinfo.tid == sid){
				var obb = new Object();						
				obb.del_id = obj.project_code + "^" + obj._id.$oid + "^" + sid;
				if (typeof(cinfo.asign) == "undefined"){
					return false;
				}
				obb.del_emp = cinfo.asign.ky;				
				gap.schedule_update(obb, "asignee", type);			
				break;
			}			
		}		
	},
	
	"schedule_update" : function(obj, type, opt){		
		try{
			gTodo.isupdate = true;	
		}catch(e){
			gTodoM.isupdate = true;	
		}
		var ty = "";
		if (type == "checklist"){
			ty = "checklist";
		}else{
			ty = "todo";
		}		
		var _form_data = "";
		if (opt == "D" || opt == "T" || opt == "P"){
		  _form_data = {
	            '__Click': '0',
	            '%%PostCharset': 'UTF-8',
	            'SaveOptions': '0',
	            'UserID' : obj.del_emp,	           
	            'Mode': opt,    	     
	            "CalKeyCode": obj.del_id,	//일정 key 값
	            "SystemCode": ty
	        };
		}else{
			var attendee = "";
			var calkey = "";
			if (type == "asignee"){
				calkey = obj.project_code + "^" + obj._id.$oid;
				if (typeof(obj.enddate) != "undefined" || obj.enddate != ""){				
				}else{
					//날짜를 지정한 경우만 일정에 업데이트 한다.
					return false;
				}		
				if (typeof(obj.asignee) != "undefined"){
					attendee = obj.asignee.ky;	
				}			
			}else if (type == "checklist"){
				calkey = obj._id;
				if (typeof(obj.enddate) != "undefined" || obj.enddate != ""){				
				}else{
					//날짜를 지정한 경우만 일정에 업데이트 한다.
					return false;
				}		
				if (typeof(obj.attendee) != "undefined"){
					attendee = obj.attendee;	
				}		
			}			
			if (typeof(obj.startdate) == "undefined"){
				return false;
			}			
			var body = "";
			if (typeof(obj.express) != "undefined"){
				body = obj.express;
			}			
			if (attendee == ""){
				return false;
			}			
		    _form_data = {
	            '__Click': '0',
	            '%%PostCharset': 'UTF-8',
	            'SaveOptions': '0',
	            'UserID' : attendee,
	            'Attendee': "",
	            'Mode': opt,    
	            'Room': '',
	            'Title': obj.title,
	            'Startdatetime': obj.startdate,
	            'Enddatetime': obj.enddate, 
	            "Body": body,
	            "AllDay": "1",
	            "Completion": "",
	            "Priority": obj.priority,
	            "CalKeyCode": calkey,	//일정 key 값
	            "SystemCode": ty,	//연동 시스템 코드 (예 : 화상회의 예약)
	            "Link_info" : '',
	            "owner" : obj.owner.ky,
	            "ms" : cur_mailserver 
	        };
		}	    
		
    //    var url = location.protocol + "//" + location.host + "/" + (gap.is_mobile_connect ? maildbpath.split("/")[0] : opath) + "/cal/calendar.nsf/fmmeeting?openform";
 		var url = gap.rp + "/kwa01/cal/calendar.nsf/fmmeeting?openform";
        return $.ajax({
            type: 'POST',
            url: url,
            async : false, //2023.11.09 추가. 동기식으로 하지 않으면 간혹 업데이트가 수정보다 늦게 요청들어감.
            data: _form_data,
            dataType: "text",
            success: function(data) {
        		
                if (data.replace(/\s/g, '') == 'OK') {
                   alert('success');
                }
            },
            error: function(data) {
                    alert('error');
            }
        })
	},
	
	"schedule_update_collection" : function(obj, opt, is_mobile){
		//취합 내용을 일정에 연동하는 함수
		is_mobile = (is_mobile == undefined ? false : is_mobile);		
		var _form_data = "";		
		var ty = "collection";		
		if (opt == "D"){
			_form_data = {
					'__Click': '0',
					'%%PostCharset': 'UTF-8',
					'SaveOptions': '0',
					'UserID' : obj.owner.ky,	 
					'Attendee': obj.attendee,
					'Mode': opt,    	     
					"CalKeyCode": obj.key,	//일정 key 값
					"SystemCode": ty
				};		  
		}else if (opt == "T"){
			_form_data = {
					'__Click': '0',
					'%%PostCharset': 'UTF-8',
					'SaveOptions': '0',
					'UserID' : obj.writer.ky,	 
					'Mode': opt,    	     
					"CalKeyCode": obj.file_info.folder,	//일정 key 값
					"SystemCode": ty
				};			
		}else{			
			var calkey = obj.key;			
		    _form_data = {
	            '__Click': '0',
	            '%%PostCharset': 'UTF-8',
	            'SaveOptions': '0',
	            'UserID' : obj.owner.ky,
	            'Attendee': obj.attendee,
	            'Mode': opt,    
	            'Room': '',
	            'Title': obj.name,
	            'Startdatetime': obj.startdate,
	            'Enddatetime': obj.enddate, 
	            "Body": obj.content,
	            "AllDay": "1",
	            "Completion": "",
	            "Priority": 3,
	            "CalKeyCode": calkey,	//일정 key 값
	            "SystemCode": ty,	//연동 시스템 코드 (예 : 화상회의 예약)
	            "Link_info" : '',
	            "ms" : cur_mailserver ,
	            "owner" : obj.owner.ky/*,
	            "ad" : "T"*/
	        };
		}    
        //var url = location.protocol + "//" + location.host + "/" + (is_mobile ? maildbpath.split("/")[0] : opath) + "/cal/calendar.nsf/fmmeeting?openform";
		var url = gap.rp + "/kwa01/cal/calendar.nsf/fmmeeting?openform";
        return $.ajax({
            type: 'POST',
            url: url,
            data: _form_data,
            dataType: "text",
            success: function(data) {        		
                if (data.replace(/\s/g, '') == 'OK') {
                   alert('success');
                }
            },
            error: function(data) {
                    alert('error');
            }
        })
	},	
	
	"write_log" : function(data){		
		var url = gap.channelserver + "/wlog.km";	
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			data : data,
			success : function(res){				
			},
			error : function(e){
				gap.error_alert();
			}
		})
	},
	
		
	"write_log_box" : function(code, express, category, system){ 
		//code 시스템 구분값
		//express 통계 화면에서 표현되는 정보 (ex : code가 channel일 경우 express는 업무방)
		//category : 통계 구분시 메뉴 클릭과 버튼 클릭을 나누거나 특정 영역에 대한 통계를 구분하기 위한 정보
		//system : PC, iOS, iPAD, Android, Tab		
		//설정을 거는 경우만 로그를 처리한다.
		if (gap.log_save == "F"){
			return false;
		}	
		var userinfo = gap.userinfo.rinfo;		
		if (code == "abc2"){
			code = "chat";
			express = "채팅";
		}else if (code == "home"){
			express = "홈";
		}else if (code == "channel"){
			express = "업무방";
		}else if (code == "drive"){
			express = "Files";
		}else if (code == "mail"){
			express = "메일";
		}else if (code == "cal"){
			express = "일정";
		}else if (code == "collect"){
			express = "취합";
		}else if (code == "meet"){
			express = "회의실예약";
		}else if (code == "channel_tab"){
			express = "업무방탭";
		}else if (code == "chat_tab"){
			express = "채팅탭";
		}else if (code == "mail_tab"){
			express = "메일탭";
		}else if (code == "org"){
			express = "조직도";
		}
		//검색데이터에 저장될때 공백이 있으면 key값으로 사용할 수 없다.
		express = express.replace(" ", "");	
		var data = JSON.stringify({
			"code" : code,
			"express" : express,
			"category" : category,
			"sub" : "",
			"system" : system,
			"nm" : userinfo.nm,
			"cp" : userinfo.cp,
			"dp" : userinfo.dp,
			"dpc" : userinfo.dpc,
			"du" : userinfo.du,
			"ky" : userinfo.ky,
			"jt" : userinfo.jt,
			"jtc" : userinfo.jtc			
		});		
		var url = gap.channelserver + "/wlog_box.km";	
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			data : data,
			success : function(res){
				
			},
			error : function(e){
				//gap.error_alert();
			}
		})
	},
	
	"makeTwoDigit" : function(x){
		if(x.toString().length == 1){
			return (x.toString() == "0" ? "0" : "0" + x);
			
		}else{
			return x;
		}
	},	
	
	"showConfirm" : function(opt){
		var _self = this;		
		$('#layerDimHard').remove();
		/*
		 * opt parameter
		 * escClose : ESC 키로 닫기 가능 여부 (true, false)
		 * title : 제목
		 * contents : 내용 (html로 입력)
		 * callback : 확인 클릭 시 콜백 함수
		 * 
		 * opt 예시)
		 * {
		 * 	escClose: true,
		 * 	title: '알림',
		 * 	contents: '내용입니다',
		 * 	callback: function(){
		 * 		console.log('확인 누름');
		 * 	},
		 *  onClose: function(){
		 *  	console.log('닫힐 때');
		 *  }
		 * }
		 */
		var html =
			'<div id="common_confirm" class="layer_wrap" style="height:auto;">' + 
			'	<div class="layer_inner">' + 
			'		<div class="pop_btn_close"></div>' + 
			'		<h4>' + (opt.title || '') +'</h4>' + 
			'		<div class="layer_cont left">';
		
		if (opt.iconClass) {
			html +=
			'		<div class="pop_icon">' + 
			'			<div class="ico-img ' + opt.iconClass + '"></div>' + 
			'		</div>';
		}

			html +=
			'		<div class="pop_alert">' + 
			'			<p>' + (opt.contents || '') + '</p>' + 
			'		</div>' + 
			'		</div>' + 
			'		<div class="btn_wr">' +
			'			<button class="btn_layer confirm">' + gap.lang.OK + '</button>' +
			'			<button class="btn_layer cancel">' + gap.lang.Cancel + '</button>' + 
			'		</div>' + 
			'	</div>' + 
			'</div>';
		
		var z_idx = this.maxZindex() + 1;
		var $layer = $('<div id="layerDimHard"></div>');
		$layer.append(html).css('z-index', z_idx);
		
		// 닫기 
		$layer.find('.pop_btn_close').on('click', function(){
			_self.hideConfirm();
			if (typeof(opt.onClose) == 'function') opt.onClose();
		});
		
		// 취소
		$layer.find('.cancel').on('click', function(){
			_self.hideConfirm();
			if (typeof(opt.onClose) == 'function') opt.onClose();
		});
		
		// 확인
		$layer.find('.confirm').off().on('click', function(e){
			if (typeof(opt.callback) == 'function') opt.callback();
			if (opt.pass_close != true) {
				$layer.find('.pop_btn_close').click(); 	
			}
		});
		
		if (opt.escClose != false) {
			$(document).on('keydown.confirmesc', function(e){
				// ESC
				if (e.keyCode == 27) {
					_self.hideConfirm();
					if (typeof(opt.onClose) == 'function') opt.onClose();
				}
			})
		}		
		$('body').append($layer);
	},
	
	"hideConfirm" : function(){
		$(document).off('keydown.confirmesc');
		$('#layerDimHard').remove();
	},
	
	"showConfirm_new" : function(opt){
		var _self = this;		
		$('#layerDimHard').remove();
		/*
		 * opt parameter
		 * escClose : ESC 키로 닫기 가능 여부 (true, false)
		 * title : 제목
		 * contents : 내용 (html로 입력)
		 * callback : 확인 클릭 시 콜백 함수
		 * 
		 * opt 예시)
		 * {
		 * 	escClose: true,
		 * 	title: '알림',
		 * 	contents: '내용입니다',
		 * 	callback: function(){
		 * 		console.log('확인 누름');
		 * 	},
		 *  onClose: function(){
		 *  	console.log('닫힐 때');
		 *  }
		 * }
		 */
		var html =
			'<div id="common_confirm" class="layer_wrap" style="height:auto;">' + 
			'	<div class="layer_inner">' + 
			'		<div class="pop_btn_close"></div>' + 
			'		<h4>' + (opt.title || '') +'</h4>' + 
			'		<div class="layer_cont left">';
		
		if (opt.iconClass) {
			html +=
			'		<div class="pop_icon">' + 
			'			<div class="ico-img ' + opt.iconClass + '"></div>' + 
			'		</div>';
		}

			html +=
			'		<div class="pop_alert">' + 
			'			<p>' + (opt.contents || '') + '</p>' + 
			'		</div>' + 
			'		</div>' + 
			'		<div class="btn_wr">' + 
			'			<button class="btn_layer cancel">'+opt.text1+'</button>' + 
			'			<button class="btn_layer confirm">'+opt.text2+'</button>' + 
			'		</div>' + 
			'	</div>' + 
			'</div>';
		
		var z_idx = this.maxZindex() + 1;
		var $layer = $('<div id="layerDimHard"></div>');
		$layer.append(html).css('z-index', z_idx);
		
		// 닫기 
		$layer.find('.pop_btn_close').on('click', function(){
			_self.hideConfirm();
			if (typeof(opt.onClose) == 'function') opt.onClose();
		});
		
		// 취소
		$layer.find('.cancel').on('click', function(){
			if (typeof(opt.callback) == 'function') opt.callback2();
			$layer.find('.pop_btn_close').click();
		});
		
		// 확인
		$layer.find('.confirm').on('click', function(){
			if (typeof(opt.callback) == 'function') opt.callback();
			$layer.find('.pop_btn_close').click();
		});
		
		if (opt.escClose != false) {
			$(document).on('keydown.confirmesc', function(e){
				// ESC
				if (e.keyCode == 27) {
					_self.hideConfirm();
					if (typeof(opt.onClose) == 'function') opt.onClose();
				}
			})
		}
		
		$('body').append($layer);
	},
		
	"status_check" : function(lists, opt, ty){	
		//상태값을 메신저 서버에 호출하는 함수
		//이 함수를 호출하면 gBody.temp_list_status_dis(jsonInfo) <== 호출해서 리턴값을 알려준다.
		//list : 대상자 ky값
		//opt : 1:구독  2:종료 3:상태값 한번 만보기
		//ty : 어디서 호출했는지 참고값
		_wsocket.temp_list_status(lists, opt, ty);
	},
	
	"invite_video_chat" : function(){
		//WebX 화상회의를 호출한다.
		//업무방에서 등록한다.		
		//참석자 정보를 수집힌다.
		var channel_id = gBody3.cur_opt;
//		var list = gBody3.search_channel_members(channel_id);		
//		var participants = [];
//		if (typeof(list.member) == "undefined"){			
//		}else{
//			if ( (typeof(list.member) != "undefined") && (list.member.length > 0)){
//				for (var i = 0 ; i < list.member.length; i++){
//					var info = list.member[i];
//					var member = new Object();
//					member.id = info.ky;
//				//	member.name = info.nm;
//					participants.push(member);
//				}
//			}
//		}
		
		var list = gBody3.search_cur_channel_member(channel_id);
		var participants = [];
		for (var i = 0 ; i < list.length; i++){
			var info = list[i];
			var member = new Object();
			member.id = info;
			participants.push(member);
		}	
		var owner = gap.userinfo.rinfo;		
		//예야 식간 
		var date = moment.utc().format();
		var start = moment().utc().add(10, "m").format('YYYY-MM-DD[T]HH:mm:00[Z]');
		var end = moment().utc().add(1, "h").format('YYYY-MM-DD[T]HH:mm:00[Z]'); 
		var timezone = moment().format('Z');		
//		var start = moment().add(1, "d").utc(date).local().format('YYYYMMDDHHmmss');
//		var end = moment().add(1, "d").format('YYYYMMDDHHmmss'); 
		var appservice = {
		 		type : "C",  // 일정 구분 -> 신규: C, 수정 : U, 삭제 : D
		 		scheduletype : "3",
				title : gBody.select_channel_name2 + " Meeting",
				starttime : start, //utc 0
				endtime : end,   //utc 0
				//passcode : ""  , 
				scheduleid : "",
				dswid : channel_id,
				recordingyn : "N",
				//scheduleremail : owner.em,  // 예약자 이메일 
				//schedulernm : owner.nm,  // 예약자 이름 
				//memberid : owner.emp,  // 예약자 아이디
				partylist : participants,   // 참석자 정보 ,
				timezone : timezone,
				contents : ""
        };
		var aaa = JSON.stringify(appservice);	
		gap.show_loading(gap.lang.lex);		
		var auth = gap.get_auth();
		var url = location.protocol + "//" + location.host + "/vemanager/scheduleinterface.do";
		 $.ajax({
	            url: url,
	            type: "POST",
	            dataType: 'json',
	            data: JSON.stringify(appservice),
	            beforeSend : function(xhr){
					xhr.setRequestHeader("auth", auth);
				},		
	            contentType: 'application/json',
	            async: true,
	            success: function (data) {
					gap.hide_loading();					
			 		if (data.result == "true"){
			 			$("#resultVaule").text(JSON.stringify(data));
			 		//	alert(data.meetingurl)
			 		//	window.open(data.meetingurl, "meeting", null);
			 			var res = data;
			 			res.type = "channel_meeting";													
						var data = JSON.stringify({
							"type" : "msg",
							"channel_code" : gBody.select_channel_code,
							"channel_name" : gBody.select_channel_name,
							"email" : gap.userinfo.rinfo.em,
							"ky" : gap.userinfo.rinfo.ky,
							"owner" : gap.userinfo.rinfo,
							"content" : "",
							"edit" : "",
							"msg_edit" : "",
							"id" : gBody3.select_channel_id,
							"ex" : res,
							"fserver" : gap.channelserver
						});
						gBody3.send_msg_to_server(data);			 			
			 		}else{
			 			gap.hide_loading();
			 			gap.gAlert(data.message);		 			
			 		}	            	   	    
	            },
	            error: function(XMLHttpRequest, textStatus, errorThrown) {
	            	gap.hide_loading();
	            	alert(textStatus);
	             }	            
	        });		
	},
	
	"invite_video_chat2" : function(){
		//채팅에서 화상회의 하기	
		//참석자 정보를 수집힌다.		
		//cur_room_att_info_list가 없으면 로겈 채팅방 정보를 활용해서 다시 설정해야 한다.
    	if (gBody.cur_room_att_info_list.length == 0){
    		gBody.cur_room_att_info_list = gap.search_cur_chatroom_attx(gBody.cur_cid);
    	}
	
		var room_id = gBody.cur_cid;
		var list = gBody.cur_room_att_info_list;
		var participants = [];
		if (typeof(list) == "undefined"){			
		}else{
			
			for (var i = 0 ; i < list.length; i++){					
				var info = list[i];
				var member = new Object();
				if (info.ky != gap.userinfo.rinfo.ky){
					member.id = info.ky;
					//	member.name = info.nm;
					participants.push(member);
				}					
			}
			
		}
		
		var owner = gap.userinfo.rinfo;
		//예야 식간 		
		var date = moment.utc().format();
		var start = moment().utc().add(10, "m").format('YYYY-MM-DD[T]HH:mm:00[Z]');
		var end = moment().utc().add(1, "h").format('YYYY-MM-DD[T]HH:mm:00[Z]'); 
		var timezone = moment().format('Z');		
//		var start = moment().add(1, "d").utc(date).local().format('YYYYMMDDHHmmss');
//		var end = moment().add(1, "d").format('YYYYMMDDHHmmss'); 
		var appservice = {
	 		type : "C",  // 일정 구분 -> 신규: C, 수정 : U, 삭제 : D
	 		scheduletype : "3",
			title : "ChatRoom Meeting",
			starttime : start, //utc 0
			endtime : end,   //utc 0
			//passcode : ""  , 
			scheduleid : "",
			type : "C",
			dswid : "",
			recordingyn : "N",
			//scheduleremail : owner.em,  // 예약자 이메일 
			//schedulernm : owner.nm,  // 예약자 이름 
			//memberid : owner.emp,  // 예약자 아이디
			partylist : participants,   // 참석자 정보 ,
			timezone : timezone,
			contents : ""
        };
		var aaa = JSON.stringify(appservice);
		gap.show_loading(gap.lang.lex);		
		var auth = gap.get_auth();
		var url = location.protocol + "//" + location.host + "/vemanager/scheduleinterface.do";
		 $.ajax({
            url: url,
            type: "POST",
            dataType: 'json',
            data: JSON.stringify(appservice),
            beforeSend : function(xhr){
				xhr.setRequestHeader("auth", auth);
			//	xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},		
            contentType: 'application/json',
          //  mimeType: 'application/json',
          //  async: true,
            success: function (data) {
				gap.hide_loading();				
		 		if (data.result == "true"){
		 			$("#resultVaule").text(JSON.stringify(data));
		 			var res = data;		 			
		 			var room_url = data.meetingurl;
		 			var room_key = data.meetingkey;
		 			var host_key = data.hostkey;
		 			var caller = gap.userinfo.rinfo.ky;			 			
		 			////////////////////////////////////////////////////////////////////
		 			var msgid = _wsocket.make_msg_id();
		 			var roomkey = room_id;
		 			var msg = gap.lang.call_attend;
		 			roomkey = roomkey.replace(/-lpl-/gi,"_"); // + "^" + companycode;
		 			///////////////////////////////////////////////////////////////////			 			
		 			//현재 창에 등록해야 한다.  현재창에 먼제 표시해야 전송 완료를 처리할 수 있다. 아니면 disable형태로 전송이 완료되지 않은 상태로 남아 있는다.
		 			var opt = "me";
		 			var type = "msg";
		 			var name = gap.userinfo.rinfo.nm;
		 			var date = gap.search_today_only2();
					var time = gap.search_time_only();	
					var bun = date + time.replace(":","");			
					var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.	
					var msg = msg + "-spl-" + room_url + "-spl-" + room_key + "-spl-" + host_key + "-spl-" + caller + "-spl-" + encodeURIComponent("&auth=" + auth);
					var key = gap.search_cur_ky();						
					var ucnt = gBody.cur_room_att_info_list.length - 1;
					gBody.chat_draw(opt, name, msg, date, time, type, bun, key, msgid, "", "D", "21", "", ucnt, "", "chat", gBody.cur_cid );								 			
		 			///////////////////// 채팅 화상회의 전송하기 ////////////////////////////		
		 			var obj = new Object();		
		 			obj.type = "msg";
		 			obj.mid = msgid;
		 			obj.msg = msg;
		 			obj.cid = roomkey;
		 			obj.ty = 21;
		 			obj.name = gap.userinfo.rinfo.nm;
		 			obj.name_eng = gap.userinfo.rinfo.enm;
		 			obj.el = userlang;
		 			obj.ex = data;			 			
		 			_wsocket.send_chat_msg(obj);		 			
		 		}else{
		 			gap.hide_loading();
		 			gap.gAlert(data.message);		 			
		 		}	            	   	    
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
            	gap.hide_loading();
            	alert(textStatus);
             }	            
        });		
	},
	
	"invite_video_chat_mobile" : function(){
		//WebX 화상회의를 호출한다.
		//모바일 업무방에서 등록한다.		
		//참석자 정보를 수집힌다.	
		var channel_id = gBodyM.cur_opt;		
		var surl = gap.channelserver + "/search_info.km";
		var postData = {
			"type" : "C",
			"ch_code" : channel_id
		};		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){					
					var cinfo = res.data;					
					var participants = [];
					if ( (typeof(cinfo.member) != "undefined") && (cinfo.member.length > 0)){
						for (var i = 0 ; i < cinfo.member.length; i++){
							var info = cinfo.member[i];
							var member = new Object();
							member.id = info.ky;
							participants.push(member);
						}
					}					
					var owner = gap.userinfo.rinfo;
					//예야 식간 
					var date = moment.utc().format();
					var start = moment().utc().add(10, "m").format('YYYY-MM-DD[T]HH:mm:00[Z]');
					var end = moment().utc().add(1, "h").format('YYYY-MM-DD[T]HH:mm:00[Z]'); 
					var timezone = moment().format('Z');					
//					var start = moment().add(1, "d").utc(date).local().format('YYYYMMDDHHmmss');
//					var end = moment().add(1, "d").format('YYYYMMDDHHmmss');
					var appservice = {
				 		type : "C",  // 일정 구분 -> 신규: C, 수정 : U, 삭제 : D
				 		scheduletype : "3",
						title : cinfo.ch_name + " Meeting",
						starttime : start, //utc 0
						endtime : end,   //utc 0
						//passcode : ""  , 
						scheduleid : "",
						dswid : channel_id,
						recordingyn : "N",
						//scheduleremail : owner.em,  // 예약자 이메일 
						//schedulernm : owner.nm,  // 예약자 이름 
						//memberid : owner.emp,  // 예약자 아이디
						partylist : participants,   // 참석자 정보 ,
						timezone : timezone,
						contents : ""
			        };
					var aaa = JSON.stringify(appservice);					
					var auth = gap.get_auth();
					var url = location.protocol + "//" + location.host + "/vemanager/scheduleinterface.do";
					 $.ajax({
				            url: url,
				            type: "POST",
				            dataType: 'json',
				            data: JSON.stringify(appservice),
				            beforeSend : function(xhr){
								xhr.setRequestHeader("auth", auth);
							//	xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
							},		
				            contentType: 'application/json',
				         //   mimeType: 'application/json',
				            async: true,
				            success: function (data) {
								//gap.hide_loading();								
								gBodyM.mobile_finish();								
						 		if (data.result == "true"){
						 			$("#resultVaule").text(JSON.stringify(data));					 			
						 			var res = data;
						 			res.type = "channel_meeting";													
									var data = {
										"type" : "msg",
										"channel_code" : cinfo.ch_code,
										"channel_name" : cinfo.ch_name,
										"email" : gap.userinfo.rinfo.em,
										"ky" : gap.userinfo.rinfo.ky,
										"owner" : gap.userinfo.rinfo,
										"content" : "",
										"edit" : "",
										"msg_edit" : "",
										"id" : gBodyM.cur_opt,
										"ex" : res,
										"fserver" : gap.channelserver
									};									
									gap.send_msg_to_server_mobile(data);					 			
						 		}else{
						 			gap.hide_loading();
						 			gBodyM.mobile_finish();
						 			gap.gAlert(data.message);		 			
						 		}				            	   	    
				            },
				            error: function(XMLHttpRequest, textStatus, errorThrown) {
				            	gap.hide_loading();
				            	gBodyM.mobile_finish();
				            	alert(textStatus);
				             }
				            
				        });
				}
			},
			error : function(e){
				gBodyM.mobile_finish();
			}
		});		
		//현재 채널의 기본 정보를 내려 받는다.
	},	
	
	"send_msg_to_server_mobile" : function(data){
		data = JSON.stringify(data);
		var url = gap.channelserver + "/send_msg.km";
		$.ajax({
			type : "POST",
			dataType : "text",   //<<== "json"을  text로 변경한 것은 입력 내용에 ?? 가 2개 이상 있을 경우 JQuery오류가 발생해서 변경함 // 대신 리턴값을 JSON.parse로 처리해야 함
		//	contentType : "application/json; charset=utf-8",
			data : data,
			url : url,
			success : function(ress){
				var resx= JSON.parse(ress);			
				if (resx.result == "OK"){
					var res = resx.data.docinfo;					
					var GMT = resx.GMT;
					var GMT2 = res.GMT2;
					var doc = new Object();
					doc.GMT = GMT;
					doc.GMT2 = res.GMT2;									
					doc.channel_code = res.channel_code;
					doc.channel_name = res.channel_name;					
					doc.email = gap.userinfo.rinfo.em;
					doc.ky = gap.userinfo.rinfo.ky;
					var jj = JSON.parse(data);
					doc.content = jj.content;
					doc.owner = gap.userinfo.rinfo;
					doc.type = jj.type;												
					if (jj.edit == "T"){
						doc._id = jj.id;
					}else{
						doc._id = res._id.$oid;
					}									
					doc.direct = "T";		
					doc.editor = jj.editor;
					doc.title = jj.title;										
					if (typeof(res.ex) != "undefined"){
						//메일 처럼 다른 시스템에서 호출되는 경우 처리한다.
						doc.ex = res.ex;
					}			
					var date = "";
					date = gap.change_date_localTime_only_date(GMT);				
					var html = "";				
					var sGMT = "";					
					sGMT = res.GMT;					
					doc.date = date;
					doc.edit = "";
					doc.res = res;
					doc.doctype = doc.type;						
					gBodyM.send_socket(doc, "ms");				   
				  //모바일  Push를 날린다. ///////////////////////////////////
					var smsg = new Object();
					smsg.msg = "[" + res.channel_name + "] " + gap.lang.nmsg;
					smsg.title = gap.systemname + "["+gap.lang.channel+"]";		
					smsg.type = "ms";
					smsg.key1 = res.channel_code;
					smsg.key2 = "";
					smsg.key3 = res.channel_name;
					smsg.fr = gap.userinfo.rinfo.nm;
					//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
					var mlist = JSON.parse(data);									
					smsg.sender = gBodyM.search_cur_channel_member(res.channel_code).join("-spl-");																			
					//gap.push_noti_mobile(smsg);		
					
					//알림센터에 푸쉬 보내기
					var rid = res.channel_code;
					var receivers = smsg.sender.split("-spl-");
					var msg2 = "[" + gap.textToHtml(res.channel_name) + "] " + gap.lang.nmsg;
					var sendername = "["+gap.lang.channel+" : "+ gap.textToHtml(res.channel_name) +"]"
					gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);	
					////////////////////////////////////////////////////				
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
	},
		
	"sms_call" : function(key){
		//var url = "http://sso.daesang.com/dispatcher.do?eMateApps=WIN_91&ruser=" + key;
		var url = "http://dsin.daesang.com/sso/auth?client_id=SMS_01&response_type=code&rd_c_p=" + key;		
		window.open(url,null);
	},
	
	"elephant_call" : function(ky){
		var param = '';
		if (ky) {
			param = '?receiver=' + ky;	
		}
		//var url = "http://sso.daesang.com/dispatcher.do?eMateApps=SBH_47&redURL=http://sabo.daesang.com/elephant/send.jsp" + param;
		// URL변경됨 (23.01.13)
		var url = "http://dsin.daesang.com/sso/auth?client_id=SBH_01&response_type=code&rd_c_p=http://sabo.daesang.com/elephant/send.jsp" + param;
		window.open(url, null);
	},
	
	"workroom_create" : function(channel_name, user_list){		
		//채널 정보를 가져와서 등록한다.		
		gap.pre_workroom_set();		
		if (gap.workroom_name_doulble_check(channel_name)){
			mobiscroll.toast({message:gap.lang.d_room_no, color:'danger'});
			return false;
		}				
		var readers = [];
		for (var i = 0 ; i < user_list.length; i ++){
			var uinfo = user_list[i];
			readers.push(uinfo.ky);
		}
		readers.push(gap.userinfo.rinfo.ky);		
		var postData = {
			"ch_name" : channel_name,
			"ch_share" : "Y",
			"folderkey" : "",
			"owner" : gap.userinfo.rinfo,
			"readers" : readers,	//readers.join(" "),
			"member" : user_list
		};		
		var surl = gap.channelserver + "/create_channel.km";
		return $.ajax({
			type : "POST",
			url : surl,
			dataType : "text",
			data : JSON.stringify(postData),
			success : function(ress){
				var res = JSON.parse(ress);
				if (res.result == "OK"){
					var ch_code = res.ch_code;		
					gBody2.update_channel_info();
					gap.add_todo_plugin("add", ch_code);				
					var url = location.protocol + "//" +location.host + "/" + opath  + "/dsw/wm.nsf/chat?readform&channel&" + ch_code;
					window.open(url, "webchat");
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
	},
	
	"workroom_name_doulble_check" : function(name){
		//현재 채팅방 정보에서 ky값 데이터를 리턴해주는 함수  		
		//채널 정보가 없을 경우 가져와서 등록한다.		
		gap.pre_workroom_set();    	
    	var list = gap.cur_channel_list_info;
    	for (var i = 0 ; i < list.length; i++){
    		var info = list[i];
    		if (info.ch_name == name){
    			return true;
    			break;
    		}
    	}
    	return false;
	},
	
	"chatroom_create" : function(user_list){
		
		if (user_list.length > 1){			
			//1:N을 생성한 경우
			var newChatroom_list = [];
			var lists = [];
			var cky = gap.search_cur_ky();
			var otherman = "";		
			for (var i = 0 ; i < user_list.length; i++){
				var user = user_list[i];								
				if (gap.search_cur_ky() != user.ky){
					if (name == ""){
						name = user.nm;
					}else{
						name += "-spl-" + user.nm;
					}
					lists.push(user.ky);
					var nobj = {"ky" : user.ky, "nm" : user.nm};				
					newChatroom_list.push(nobj);
				}
			}				
			var nobj = {"ky" : cky, "nm" : gap.userinfo.rinfo.nm};
			lists.push(cky);
			var res = gap.search_exist_chatroom_nn(lists);
			if (res != ""){
				//기존에 참석자가 포함된 방이 있다는 이야기임				
				gap.chatroom_create_after2(res);				 
				return false;
			}		
			newChatroom_list.push(nobj);			
			var llx = lists.join(",");
			var data = JSON.stringify({
				"empno" : llx
			})
			var url = gap.channelserver + "/search_user_empno.km";;
			$.ajax({
				type : "POST",
				url : url,
				dataType : "json",
				data : data,
				contentType : "application/json; charset=utf-8",
				success : function(res){				
					gBody.cur_room_att_info_list = res[0];				
					_wsocket.make_chatroom_1N_only_make_org(newChatroom_list);	
				},
				error : function(e){
					gap.error_alert();
				}
			})			
		}else{
			//1:1을 생성한 경우
			var user = user_list[0];
			var uid = user.ky;
			var name = user.nm;			
			var llx = user;
			var data = JSON.stringify({
				"empno" : llx.ky
			})			
			//이렇제 하지 않으면 새창에 기존에 대화방에 없는 경우 에러발생한다.
			var url = gap.channelserver + "/search_user_empno.km";;
			$.ajax({
				type : "POST",
				url : url,
				dataType : "json",
				data : data,
				contentType : "application/json; charset=utf-8",
				success : function(res){
				
					gBody.cur_room_att_info_list = res[0];
				
					_wsocket.make_chatroom_11_only_make_org(uid, name);
				},
				error : function(e){
					gap.error_alert();
				}
			})
		}	
	},
	
	"chatroom_create_after" : function(obj){
		var cid = obj.ct.cid;		
		gap.chatroom_create_after2(cid);		
	},
	
	"chatroom_create_after2" : function(cid){		
		//var url = "./chat?readform&key=" + $.base64.encode(cid);
		//var url = root_path + "/index.jsp?key=" + $.base64.encode(cid);
		//var url = root_path + "/page/chat_popup.jsp?key=" + $.base64.encode(cid);
		
		var url = root_path + "/v/chat_popup_" + $.base64.encode(cid);
		gap.open_subwin(url, "1210","850", "yes" , "", "yes");
	},
	
	"channel_enter_popup" : function(cid){		
		//var url = "./chat?readform&key=" + $.base64.encode(cid);
		//var url = root_path + "/index.jsp?key=" + $.base64.encode(cid);
		//var url = root_path + "/page/chat_popup.jsp?key=" + $.base64.encode(cid);
		
		var url = root_path + "/v/channel_popup_" + cid;
		gap.open_subwin(url, "1210","850", "yes" , "", "yes");
	},
	
	"memo_create_show" : function(lists){
		var keys = new Array();
		var emails = new Array();
		var names = new Array();		
		for (var i = 0 ; i < lists.length; i++){
			var info = lists[i];
			keys.push(info.ky);
			emails.push(info.em);
			names.push(info.nm);
		}		
		localStorage.setItem("memo_ky", keys);
		localStorage.setItem("memo_emails", emails);
		localStorage.setItem("memo_names", names);	
		var url = location.protocol + "//" +location.host + "/" + opath  + "/dsw/wm.nsf/chat?readform&abc2&openmemo";
		window.open(url, "webchat");		
	},
	
	"phone_call" : function(ky, type){		
		//ky : 받는사람 ky값, type : 1 회사전화로 전화걸기 , 2 핸드폰으로 전화 걸기		
		if (type != ""){
			gap.call_real(ky, type);
		}else{
			var msg = gap.lang.optional;
			gap.showConfirm_new({
				title: gap.lang.call_p,
				text1 : gap.lang.OP,
				text2 : gap.lang.mobile,
				contents: msg,
				callback: function(e){
					//핸드폰 전화걸기
					gap.call_real(ky, "2");
				},
				callback2 : function(){
					//사무실 전화걸기
					gap.call_real(ky, "1");
				}
			});
		}
	},
	
	"call_real" : function(ky, type){	
		gap.show_loading("Phone Calling......");
		var url = "ClickToDial?openagent&gubun="+type+"&ky="+ky;
		$.ajax({
			type : "GET",
			url : url,
			success : function(res){
				gap.hide_loading();
			},
			error : function(e, res, x, t){
				gap.gAlert(gap.lang.errormsg);
			}
		});
	},
	
	"unread_count_check" : function(opt, count){
		var obj = $("#btn_menu_" + opt);
		var noti = "";
		noti += "<span class='noti_count_wrap'>";
		noti += "	<span class='noti_count'>" + count + "</span>";
		noti += "</span>";
		
		obj.find(".noti_count_wrap").remove();
				
		if (count == 0 || count == '0') {
		} else {
			obj.append(noti);
		}		
		// 채팅 플로팅 아이콘 카운트 셋팅
		if (opt == 'chat') {
			gma.setCount(count);
		}
	},
	
	"unread_count_check_20250522" : function(opt, count){
		var obj = $("#menu_id_"+opt);
		obj.text(count);
		if (count == 0 || count == '0') {
			obj.hide();
		} else {
			obj.show();
		}		
		// 채팅 플로팅 아이콘 카운트 셋팅
		if (opt == '3') {
			gma.setCount(count);
		}
	},	
	
	"remote_call" : function(ky){
		var my = gap.userinfo.rinfo;
		var data = JSON.stringify({
			ky : my.ky,
			nm : my.nm,
			enm : my.enm,
			el : my.el,
			usr : ky
			
		});
		var url = "http://localhost:9414/tool/remotecontrol&ky="+my.ky+"&nm="+encodeURIComponent(my.nm)+"&enm="+encodeURIComponent(my.enm)+"&el="+my.el+"&usr="+ky;	
		$.ajax({
			url:url,
			type:"GET",
			dataType:"jsonp",
			timeout: 15000,
			cache: false,
			async: true
		}).fail(function(xhr, txt, msg){
			gap.gAlert(gap.lang.remoteerror);
		}).done(function(data, txt, msg){

		});	
	},
	
	"call_synap" : function(md5, filepath, filename, isMobile, call, obj){
		gap.gAlert("지원하지 않습니다!!!?");return;
		
		var fid = "CONVERTTEST_" + md5 + "_" + new Date().getTime();	 // UNID 입력
		var _lan = 'ko_KR';
		if (isMobile == "T" || isMobile == "TT"){
			if (mobile_lang == "ko") {
				_lan = 'ko_KR';
			} else if (mobile_lang == "zh") {
				_lan = 'zh_CN';
			} else if (mobile_lang == "ja") {
				_lan = 'ja_JP';
			} else if (mobile_lang == "vi") {
				_lan = 'ko_KR';
			} else if (mobile_lang == "id") {
				_lan = 'ko_KR';
			} else if (mobile_lang == "en") {
				_lan = 'en_US';		
			}
		}else{
			if (userlang == "ko") {
				_lan = 'ko_KR';
			} else if (userlang == "zh") {
				_lan = 'zh_CN';
			} else if (userlang == "ja") {
				_lan = 'ja_JP';
			} else if (userlang == "vi") {
				_lan = 'ko_KR';
			} else if (userlang == "id") {
				_lan = 'ko_KR';
			} else if (userlang == "en") {
				_lan = 'en_US';		
			}
		}	
		var server = "";
		if (gap.isDev){			
			server = "dswdv.daesang.com";
		}else{
			if (gap.is_mobile_connect){
				server = "dswext.daesang.com";
			}else{
				server = "dsw.daesang.com";
			}			
		}
		$.ajax({
			type: "POST",
			url: "https://"+server+"/SynapDocViewServer/jobJson", // Server Address Setting
			data: {
//				"fid":fid, 
				"filePath": filepath, 
				"convertType": "1",
				"fileType": "Local",
//				"convertLocale": _lan, 
				"sync": true
			},
	//		contentType: "application/json;charset=utf-8",
			dataType: 'json',
			async: false,
		//	cache: false,
			success: function (data) {		
				if (isMobile == "T" || isMobile == "TT"){
					var _title = filename;
					var _url = "https://"+server+"/SynapDocViewServer/" + data.viewUrlPath;
					if (location.pathname.indexOf('synap') > -1){
						location.href = _url;
					}else{
						var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(_url) + "&title=" + encodeURIComponent(_title);
						gBodyM.connectApp(url_link);
					}					
				}else{
					window.open("https://"+server+"/SynapDocViewServer/" + data.viewUrlPath);
				}
			},
			error: function (error) {
				alert(error.status + " : " + error.statusText);
			}
		});
		
		if (isMobile == "T" || isMobile == "TT"){
			//모바일은 여기로 별도로 로그를 남긴다.
			var log = new Object();
			if (call == "todo"){
				log.fserver = obj.channel_name;
				log.upload_path = obj.upload_path;
				
			}else{
				log.fserver = "";
				log.upload_path = filepath;
			}			
			log.filename = filename;
			log.md5 = md5;
			log.item_id = "";
			log.ty = "";
			log.ft = "";
			log.email = "";			
			log.actor = gap.userinfo.rinfo;
			log.action_os = "Mobile";
			log.action = call;			
			var surl = gap.channelserver + "/preivew_log.km";			
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : JSON.stringify(log),
				success : function(res){
				},
				error : function(e){}
			});
		}		
		return false;		
	},
	
	"change_paste_text" : function(e, obj){
		e.preventDefault();
		var clipboard_text;
		var change_text;
		var change_list;
		var re_list = [];
		event.returnValue = false;
		if (window.clipboardData) {
			clipboard_text = window.clipboardData.getData("Text");
		} else {
			clipboard_text = (e.originalEvent || e).clipboardData.getData('text/plain');
		}
		change_text = clipboard_text.replace(/\n|\r|\n\r/g, ',').replace(/,,/g, ',');
		change_list = change_text.split(',');
		for (i=0; i<change_list.length; i++) {		
			if (change_list[i] != '') {
				re_list.push(change_list[i]);						
			}
		}		
		var p_txt = $.trim($(obj).val() + re_list.join(','));
		$(obj).val(p_txt);
		jQuery.Event('keypress', { keyCode: 13 })
		clipboard_text = null;
		change_text = null;
		change_list = null;
		re_list = null;		
	},
	
	"send_work_msg" : function(channel_code, channel_name, content, meet_type, scheduleid){
		var res = new Object();
		res.type = "meet";
		res.meet_type = meet_type;
		res.scheduleid = scheduleid;
		var data = JSON.stringify({
			"type" : "msg",
			"channel_code" : channel_code,
			"channel_name" : channel_name,
			"email" : gap.userinfo.rinfo.em,
			"ky" : gap.userinfo.rinfo.ky,
			"owner" : gap.userinfo.rinfo,
			"content" : content,
			"edit" : "",
			"msg_edit" : "",
			"id" : channel_code,
			"ex" : res
		});	
		var url = gap.channelserver + "/send_msg.km";
		$.ajax({
			type : "POST",
			dataType : "text",   //<<== "json"을  text로 변경한 것은 입력 내용에 ?? 가 2개 이상 있을 경우 JQuery오류가 발생해서 변경함 // 대신 리턴값을 JSON.parse로 처리해야 함
		//	contentType : "application/json; charset=utf-8",
			data : data,
			url : url,
			success : function(ress){
				var resx= JSON.parse(ress);				
				if (resx.result == "OK"){
					if (resx.result == "OK"){
						var res = resx.data.docinfo;						
						var GMT = resx.GMT;
						var GMT2 = res.GMT2;
						var doc = new Object();
						doc.GMT = GMT;
						doc.GMT2 = res.GMT2;						
						doc.channel_code = channel_code;
						doc.channel_name = channel_name;						
						doc.email = gap.userinfo.rinfo.em;
						var jj = JSON.parse(data);
						doc.content = jj.content;
						doc.owner = gap.userinfo.rinfo;
						doc.type = jj.type;					
						if (jj.edit == "T"){
							doc._id = jj.id;
						}else{
							doc._id = res._id.$oid;
						}						
						doc.direct = "T";					
						doc.editor = jj.editor;
						doc.title = jj.title;										
						if (typeof(res.ex) != "undefined"){
							//메일 처럼 다른 시스템에서 호출되는 경우 처리한다.
							doc.ex = res.ex;
						}				
						var date = "";
						date = gap.change_date_localTime_only_date(GMT);											
						doc.date = date;
						doc.edit = gBody3.edit_mode;
						doc.res = res;
						doc.doctype = doc.type;							
						gBody3.send_socket(doc, "ms"); 				   
					  //모바일  Push를 날린다. ///////////////////////////////////
						var smsg = new Object();
						smsg.msg = "[" + channel_name + "] " + gap.lang.nmsg;
						smsg.title = gap.systemname + "["+gap.lang.channel+"]";				
						smsg.type = "ms";
						smsg.key1 = channel_code;
						smsg.key2 = "";
						smsg.key3 = channel_name;
						smsg.fr = gap.userinfo.rinfo.nm;
						//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
						var mlist = JSON.parse(data);												
						smsg.sender = gBody3.search_cur_channel_member(channel_code).join("-spl-");																						
					//gap.push_noti_mobile(smsg);			
						
						//알림센터에 푸쉬 보내기
						var rid = channel_code;
						var receivers = smsg.sender.split("-spl-");
					//	var msg2 = "[" + gap.textToHtml(channel_name) + "] " + gap.lang.nmsg;
						var msg2 = gap.lang.nmsg;
						var sendername = "["+gap.lang.channel+" : "+ gap.textToHtml(channel_name) +"]"
					//	gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
						////////////////////////////////////////////////////						
					}else{
						gap.gAlert(gap.lang.errormsg);
					}
				}
			},
			error : function(e){
			
			}
		});
	},
	
	"pre_workroom_set" : function(){
		if (gap.cur_channel_list_info == ""){
			var url = gap.channelserver + "/channel_info_list.km";
			$.ajax({
				type : "POST",
				url : url,
				dataType : "json",
				async : false,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){
					gap.cur_channel_list_info = res;
					
				}
			});
		}	
	},	
	
	"pre_drive_set" : function(){
		if (gBody.cur_drive_folder_list_info == ""){
			var url = gap.channelserver + "/api/files/drive_list_all.km";
			$.ajax({
				type : "POST",
				url : url,
				dataType : "json",
				async : false,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){
					gBody.cur_drive_list_info = res.drive;
					
				}
			});
		}	
	},
	
	"move_channel_list" : function(channel_id){
		//특정 업무방으로 바로 들어가기
		//채널 정보를 가져와서 등록한다.		
		gap.pre_workroom_set();		
		var cinfo = gap.cur_room_search_info(channel_id);
		if (cinfo == ""){		
			mobiscroll.toast({message:gap.lang.noch, color:'danger'});
			return false;
		}	
		//조직도와 팝업창을 제거한다.
		$("iframe").remove();
		$("#common_work_layer").find("div").remove();
		$('#main_popup').remove();	// 오늘의 할 일 팝업 제거
		gap.hide_loading();
		gap.hideBlock();
		$(".ui-button-text").click();
		////////////////////////////////////////////
		// 업무 시작하기 레이어 닫기
		$('#top_header_layer').removeClass('show-quick');
		gTop.hideUserSchedule();
		//통합검색창이 떠 있을 경우 제거한다. /////////////////////
		$("#portal_search").hide();
		$("#alram_layer").fadeOut();
		$("#left_main").show();
		$("#main_body").show();		
		$("#right_menu").show();
	//	$("#main_center").show();
		$("#main_right_wrap").show();
		////////////////////////////////////////////
		$('.meet-block-layer').remove();
		gap.hide_layer();
		$("#main_content").hide();
		$(".left-menu li").removeClass("act");
		$("#channel").addClass("act");
		var id = "channel";
		var url = location.pathname + "?readform&" + id;
		if (history.state != id){
			history.pushState(id, null, url);
		}else{
			history.replaceState(id, null, url);
		}
		$("#ext_body_search").hide();
		$("#box_search_content").hide();
		$("#user_profile").hide();
		$("#left_main").empty();
		$("#channel_main").css("width","100%");
		gap.cur_window = "channel";				
		gBody.chat_right_menu_close();
		$("#left_roomlist").hide();
		$("#left_buddylist").hide();
		$("#group_add_layer").hide();			
		$("#add_group_btn").hide();
		$("#add_group2").hide();
		$("#left_mail").hide();
		$("#sub_channel_content").hide();
		$("#left_main").show();				
		$("#left_channel").show();				
		gap.change_location("channel");				
		//신규 메시지 붉은 점을 제거한다.
		gap.change_title("1","");
		$("#tab3_sub").text(gap.lang.channel);					
		gap.param = "channel";				
		$("#left_main").css("width","312px;");
		//초기화 이벤트 핸들러 정의한다.		
		gBody.init();
		gBody.show_channel(channel_id);	//init함수 호출 후에 호출해야 한다.
		$("#channel_right").css("display","none");
		$("#center_content").css("display","none");
		$("#main_body").removeAttr("style");
		$("#main_body").css("right", "0px");
	},
	
	"hide_new_layer" : function(){
		//조직도와 팝업창을 제거한다.
		$("iframe").remove();
		$(".iframe").remove();
		$("#common_work_layer").find("div").remove();
		$('#main_popup').remove();	// 오늘의 할 일 팝업 제거
		$('#meeting_detail_layer').remove();	// 회의상세 레이어
		$('#work_simple_write_layer').remove();	// 간편업무등록 레이어
		$('#notice_ly').remove();	// 공지상세 레이어
		//숨김처리		
		if (gBody.cur_tab != "tab2"){
			$('#chat_content').hide();
		}		
		$('#ext_body').hide();	//오른쪽 extend 레이어
		$('#channel_aside_right').hide();
		$('#open_mail').hide();		
		var di = $("#compose_todo").css("display");
		if (di == "block"){
			$("#todo_compose_close").click();
		}		
		gap.hide_loading();
		gap.hideBlock();
		$(".ui-button-text").click();
		$(".pop_btn_close").click();
		$("#trans_close_btn").click();
		////////////////////////////////////////////
	},
	
	"chatroom_push_set" : function(type, id){
		//id로 들어오는 채팅방의 푸쉬여부를 업데이트 한다.
		var roomlist = gap.chat_room_info.ct;
		for (var i = 0 ; i < roomlist.length ; i++){
			var room = roomlist[i];
			if (room.cid == id){
				if (type == 1){
					room.pu = true;
				}else{
					room.pu = false;
				}
			}
		}		
	},
	
	"chatroom_push_get" : function(id){
		if (typeof(gap.chat_room_info.ct) == "undefined"){
			return false;
		}
		var roomlist = gap.chat_room_info.ct;
		for (var i = 0 ; i < roomlist.length ; i++){
			var room = roomlist[i];
			if (room.cid == id){
				return room.pu;				
			}
		}	
		return true;
	},
	
	
	"chatroom_push_att" : function(id, memberinfo){		
		if (typeof(gap.chat_room_info.ct) == "undefined"){
			return false;
		}
		var roomlist = gap.chat_room_info.ct;
		for (var i = 0 ; i < roomlist.length ; i++){
			var room = roomlist[i];
			if (room.cid == id){
				//해당 채팅방 정봉에 참석자 정보를 추가해야 한다.
				var lp = room.att;
				lp.push(memberinfo);
				room.att = lp;				
				if (gBody.cur_cid == id){
					gBody.cur_room_att_info_list = room.att;
					gBody.draw_chat_room_members();
					_wsocket.load_chatroom_list();
				}
			}
		}		
		return true;
	},
		
	"check_scroll_chat" : function(id){		
		var key = localStorage.getItem(id + "_scroll");
		if (typeof(key) == "undefined" || key == null){
			return "1";
		}else{
			return key;
		}
	},
	
	"delete_channel_data_from_meet" : function(scheduleid){
		//통합 회의실에서 예약 을 삭제할 경우 업무방의 내용도 삭제한다.
		var url = gap.channelserver + "/delete_channel_data_from_meet.km";
			var data = JSON.stringify({
				"scheduleid" : scheduleid
			});		
			$.ajax({
				type : "POST",
				dataType : "json",
				url : url,
				data : data,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){					
					if (res.result == "OK"){
						//멤버들의 창에 컨텐츠가 삭제됨을 전달 한다.						
						if (res.data.count == "0"){
							console.log("삭제할 문서가 없습니다.");
						}else{
							var obj = new Object();
							var info = res.data;
							obj.id = info._id.$oid;
							obj.channel_code = info.channel_code;
							obj.channel_name = info.channel_name;					
							gBody3.send_socket(obj, "del_msg");
						}						
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});						
	},
	
	"dropzone_upload_limit" : function(dropzone, file, type){
		 //type에 따라 max파일 사이즈를 조정한다.		
		
		var max_file_upload_size = gap["file_max_upload_size_" + type];
		if (gap.no_upload_file_type_check(file.name)){
    	// $("#total-progress").hide();
    		gap.gAlert(file.name + " " + gap.lang.nofileup);
    		dropzone.removeFile(file);
    		dropzone.sendOK = false;
    		return;
    	}else{
    		dropzone.sendOK = true;
    	}		 
		var is_image = gap.check_image_file(file.name);			
		if (file.size > (max_file_upload_size * 1024 * 1024)){
			gap.gAlert("'" + file.name + "'" + "" + gap.lang.file_ex + "<br>(MaxSize : " + max_file_upload_size + "M)");				   
			dropzone.removeFile(file);
			dropzone.sendOK = false;
		}else{
			dropzone.sendOK = true;
		}			
	},
	
	"dropzone_upload_limit_only_check" : function(file, type){		
		 //체크만 해서 리턴 준다.
		var res = true;
		var max_file_upload_size = gap["file_max_upload_size_" + type];
		if (gap.no_upload_file_type_check(file.name)){
			res = false;
	   	}else{
	   		res = true;
	   	}		 
		var is_image = gap.check_image_file(file.name);
		if (res){
			if (file.size > (max_file_upload_size * 1024 * 1024)){
				res = false;
			}else{
				res = true;
			}	
		}			
		return res;
	},
	
	"goto_channel_mobile" : function(ch_code, ch_name){
		var url_link = "kPortalMeet://NativeCall/callOpenWorkRoom?ch_code=" + ch_code + "&ch_name=" + encodeURIComponent(ch_name);
		gBodyM.connectApp(url_link);
	},
	
	"is_show_org" : function(empno){
		// 조직도 표시여부 결정
		if (empno.indexOf('im') == -1) {
			// 정규직은 조직도를 표시해야 함
			return true;
		} else {
			return false;
		}
	},
	
	"is_sc_user" : function(info){
		// SC사용자 중 팀장이 아닌 사용자 리턴		
		var res = false;
		if (info && info.du && info.jtc) {
			if (info.jtc == 'SC1' || info.jtc == 'SC2' || info.jtc == 'SC3') {
				if (info.du == 'SC팀장') {
					// SC팀장인 경우
				} else {
					res = true;
				}
			}
		}		
		return res;
	},
	
	"recall_msg" : function(){
		return message = '<span class="tool_ico_chat"></span> <span class="re_msg_cls mea">' +  gap.lang.re_msg + "<span>";
	},
	
	"make_resize_body" : function(){
		//채팅창을 새창으로 띄울때 스타일이 틀어지는 부분을 정리한다..
		var width = $(window).width();
		$("#right_menu").css("top", "0px");
	//	$("#right_menu_collpase_btn").hide();
		$("#right_menu").css("height", "calc(100% - 0px)");
		$("#right_menu").show();
		$("#chat_profile").show();		
		$("#chatroomtitle").css("padding-left","20px");
		var cp = width - 356;
		$("#ext_body").css("left", cp + "px");		
		if (width < 800){
			$("#right_menu").hide();
			$("#chat_profile").hide();
			$("#right_menu .ico").removeClass("on");
			$("#ext_body").hide();
			var cp = width - 5;
		//	$("#chat_content").css("width", "calc(100% - 470px)");
			$("#chat_content").css("width", cp + "px");			
		}else if (width < 1200){					
			var cp = width - 360;					
			$("#chat_content").css("width", cp + "px");
			$("#right_menu").css("left", cp + 316 + "px");		
		}else{		
			$("#right_menu").css("left", "auto");
			$("#chat_content").css("width", "calc(100% - 315px)");
		}
	},
	
	"remove_localstorage_chat_noti" : function(){		
		for(key in localStorage) {
			if (key.indexOf("_chat_noti") > -1){
				delete localStorage[key];
			}
	    }
	},
	
	"send_noti_http" : function(receive, opt){	
		//10im0959, unread_mail_check
		//http를 활용해서 소켓으로 데이터를 전송함, 여러가지 상황에 맞게 사용할 수 있는 기능임
		var url = gap.getHostUrl() + "/noti/sendnoti";		
		var obb = new Array();
		obb.push(receive);			
		var data = JSON.stringify({		
			"id" : opt,
			"ty" : "",
			"r" : obb,
			"ft" : [20],
			"body" : ""
		});	
		$.ajax({
			type : "POST",
			dataType : "json",
			url : url,
			data : data,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	},
	
	"total_count_alarm" : function(){	
		//http를 활용해서 소켓으로 데이터를 전송함, 여러가지 상황에 맞게 사용할 수 있는 기능임
		var url = gap.rp + "/noti/alarm/unread";			
		$.ajax({
			type : "GET",
			url : url,
			xhrFields : {
			//	withCredentials : true
			},
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				//웹 알림창 건수 표시하기
				var count = 0;
				if (res.unread > 99){
					count = "99+";
				}else{
					count = res.unread;
				}
				if (count > 0 || count == "99+"){
					$("#btn_notification .noti_count_wrap").remove();
					var html = "";
					html += "<span class='noti_count_wrap'>";
					html += "	<span class='noti_count'>" + count + "</span>";
					html += "</span>";
					$("#btn_notification").append(html);
				}else{
					$("#btn_notification .noti_count_wrap").remove();
				}
			},
			error : function(e){
			//	gap.error_alert();
			}
		});		
	},	
	
	"receive_http_socket" : function(obj){		
		if (obj.id == "unread_mail_check"){
			gBody.unread_mail_count_check();
		} else if (obj.id == "metting_count_check"){
			gMet.setTodayMeetingCount();
		//알림센터 프로젝트 이후 하단의 형태로 수신되는 것으로 변경됨
		} else if (obj.id == "kp_mail"){
			gBody.unread_mail_count_check();
		} else if (obj.id == "meetingroom"){
			gMet.setTodayMeetingCount();
		}else if (obj.id == "kp_channel"){
			gBody.unread_channel_count_check_realtime(obj.rid);			
		}
		
		gap.total_count_alarm();
	},
	
	"receive_box_msg_alarm" : function(obj){
		//알림센터 프로젝트 이후에 소켓으로 100/9로 수신되는 경우 여기로 온다.
		//기존 기능을 적용하기 위해서 아래 함수로 전달한다.
		gap.receive_http_socket(obj);		
	},	
	
	"cal_manger_check" : function(){
		cal_admin = "F";
		var url = "";
		if (gap.isDev){
			url = gap.getHostUrl() + "/dswdvmail01/cal/calendar.nsf/mm?readviewentries&outputformat=json";
		}else{
			url = gap.getHostUrl() + "/mng/HolidayMng.nsf/mm?readviewentries&outputformat=json";
		}
		$.ajax({
			url : url,
			dataType : "json",
			cache: false,
			contentType : "application/json; charset=utf-8",
			success : function(res){
				var me = gap.userinfo.rinfo.ky;
				if (typeof(res.viewentry[0].entrydata[0].textlist) != "undefined"){
					var key1 = res.viewentry[0].entrydata[0].textlist.text;
					for (var i = 0 ; i < key1.length; i++){
						var item = key1[i][0];
						if (me == item){
							cal_admin = "T";
							break;
						}
					}
				}else{
					if (res.viewentry[0].entrydata[0].text[0] == me){
						cal_admin = "T";
						return false;
					}
				}
				
				if (typeof(res.viewentry[0].entrydata[1].textlist) != "undefined"){
					var key2 = res.viewentry[0].entrydata[1].textlist.text;					
					for (var j = 0 ; j < key2.length; j++){
						var item = key2[j][0];
						if (me == item){
							cal_admin = "T";
							break;
						}
					}
				}else{
					if (res.viewentry[0].entrydata[1].text[0] == me){
						cal_admin = "T";
						return false;
					}
				}			
			} 
		})		
	},
	
	"mlogout" : function(){	
		var url = "";
		url = gap.getHostUrl() + "/names.nsf?logout";		
		$.ajax({
			method : "GET",
			url : url,
			success : function(res){
				gap.gAlert("로그아웃");
			},
			error : function(e){				
			}		
		});			
	},
	
	"openOnce" : function(url, target){
	    // open a blank "target" window
	    // or get the reference to the existing "target" window
	    var winref = window.open('', target, '');
	    // if the "target" window was just opened, change its url
	    try{
	    	if(winref.location.href === 'about:blank'){
		        winref.location.href = url;
		    }
	    }catch(e){
	    	winref.location.href = 'about:blank'
	    	winref.location.href = url;
	    }	    
	    return winref;
	},	
	
	"formatBytes" : function(bytes, decimals) {
		//if (bytes === 0) return '0 Bytes';
		if (bytes < 1024) return '1KB';	// 제일 작은 단위로 1KB로 셋팅
		if (typeof(decimals) == 'undefined') {decimals = 0;}
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
	},
	
	"auto_height_check" : function(textarea){	
		//textarea.style.height = "auto"; // 높이를 잠시 초기화
		var hh = textarea.scrollHeight;
		if (hh < 30){
			hh = 39;
		}
		textarea.style.height = hh + "px"; // 스크롤 높이만큼 textarea 높이를 설정
	},

	"auto_height_check_popup" : function(textarea){		
		
		//textarea.style.height = "auto"; // 높이를 잠시 초기화
		var hh = textarea.scrollHeight - 10;
		if (hh < 40){
			hh = 39;
		}
		textarea.style.height = hh + "px"; // 스크롤 높이만큼 textarea 높이를 설정
	},
	
	
	
	"auto_height_check_new" : function(textarea, el_min_height){
		// 해당 엘리먼트에 맞게 높이 값 조절하도록 변경
		
		var min_height = el_min_height || 38;
		textarea.style.height = min_height + 'px'; // 높이를 먼저 초기화
		
		var height = textarea.scrollHeight;
		
		if (height < min_height) height = min_height;
		textarea.style.height = height + 'px'; // 내용에 맞게 높이 조정
	    
	    // 만약 scrollHeight가 max-height보다 크다면 스크롤을 허용
		var max_height = parseInt(window.getComputedStyle(textarea).maxHeight);
		if (height > max_height) {
			textarea.style.overflowY = 'auto'; // 스크롤 표시
		} else {
			textarea.style.overflowY = 'hidden'; // 스크롤 숨김
		}
	},
	
	"checkEditor" : function(callback){
		var _self = this;
		var editor_el = $('#editor_iframe').get(0);
		var edit_mode = $('#sub_channel_content').hasClass('show-edit');
		// 업무방 에디터가 작성중인 경우 알림 표시
		if (edit_mode &&
			editor_el && 
			editor_el.contentWindow && 
			editor_el.contentWindow._form && 
			editor_el.contentWindow._form.keditor) {
			var title = $.trim($('#editor_title').val());
			var body = editor_el.contentWindow._form.keditor.getBodyValue();
			if (title || body != '<p><br></p>') {
				// 저장 안내 메세지 표시
				
				// 숨겨져 있는 경우
				$('#btn_editor_show').click();
				gap.gAlert(gap.lang.temp_alert);
				return false;
			}			
		}		
		return true;
	},
	
	"read_notice" : function(key){		
		//채팅방과 업무방에 공지사항 데이터를 가져온다.
		var url = gap.channelserver + "/read_notice.km";
		var data = JSON.stringify({
			"key" : key
		});
		$.ajax({
			type : "POST",
			contentType : "application/json, charset=utf-8",
			url : url,
			data : data,
			success : function(res){
				if (res.result == "OK"){
					
					var call_room = res.data.response.key;
					if (gBody.cur_cid == call_room){
						gBody.drawNoticeChat();
					}
					if (gma.cur_cid_popup == call_room){
						gBody.drawNoticeChat(true);
					}
				}				
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"delete_notice" : function(key, opt){
		//채팅방과 업무방의 공지사항을 제거한다.
		var url = gap.channelserver + "/delete_notice.km";
		var data = JSON.stringify({
			"key" : key
		});
		$.ajax({
			type : "POST",
			contentType : "application/json, charset=utf-8",
			url : url,
			data : data,
			success : function(res){				
				var obj = new Object();
				obj.sender = [];
	
				// 상세보기 열려있는 경우 닫아주기
				$('#notice_ly .btn-close').click();
				
				if (res.isLast == "T"){
					if (opt == "chat" || opt == "quick_chat"){
						
						var list = gBody.cur_room_att_info_list;
						if (opt == "quick_chat") {
							gBody.hideNoticeQuickChat();
							list = gBody.cur_room_att_info_list_popup;
						} else {
							gBody.hideNoticeChat();									
						}					
						
						for (var i = 0 ; i < list.length; i++){
							//if (list[i].ky != gap.userinfo.rinfo.ky){
								obj.sender.push(list[i].ky);
							//}						
						}
						obj.room_key = gBody.cur_cid;
						_wsocket.send_msg_other(obj, "delete_notice_chat");			
						
						
					}else{
						
						gap.hideNoticeWork();

						var xinfo = new Object();
						//업무방에서 삭제한 경우				
						var list = gap.cur_room_search_info_member_ids(gBody3.cur_opt);
						xinfo.type = "delete_notice_channel";
						xinfo.channel_code = gBody3.cur_opt;
						xinfo.sender = list;
						xinfo.room_key = gBody3.cur_opt;
						_wsocket.send_msg_other(xinfo, "delete_notice_channel");	 //obj.sender에 참석자를 추가해야 함
					}			
				}
				
				
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"truncateString" : function(str, maxLength){
		if (str.length > maxLength) { 
	        return str.slice(0, maxLength - 3) + '...'; 
	    } 
	    return str; 
	},	
	
	"isPopup" : function(obj){
		if ($(obj).closest("#alarm_chat_sub").length == 1){
			return true;
		}	
		return false;
	},
	
	"isValidEmail" : function(email){
		if(email.length <=6 || email.indexOf('@',0)==-1 || email.indexOf('.',0)==-1 || email.indexOf(".")==email.length-1)return false;
		else return true;		
	},	
	
	"search_user_emp" : function(ky){
		var data = JSON.stringify({
			"empno" : ky
		})
		var url = gap.channelserver + "/search_user_empno.km";
		
		return $.ajax({
			type : "POST",
			async : false,
			url : url,
			dataType : "json",
			data : data,
			contentType : "application/json; charset=utf-8",
			success : function(res){	
			
				return res[0];
			},
			error : function(e){
				gap.error_alert();
			}
		})			
	},
	
	"checkAuth" : function(){
		//현재 오픈되어 있는 채널에 작성 권한을 체크한다.
		var is_write_auth = false;		
		//내가 Owner인 경우는 무조건 작성할 수 있게 한다.
		if (gap.cur_channel_info){
			if (gap.userinfo.rinfo.ky == gap.cur_channel_info.owner.ky){
				is_write_auth = true;
			}else{
				if (gap.cur_channel_info.opt_reg && gap.cur_channel_info.opt_reg == "all"){
					//작성 권한이 있는 경우
					is_write_auth = true;
				}else{
					//작성 권한이 특정 사용자 또는 부서일 경우
					var auth_list = gap.cur_channel_info.opt_reg_list;
					var my_full_dept_codes = gap.full_dept_codes().split("-spl-");
					if (auth_list){
						for (var i = 0 ; i < auth_list.length; i++){
							var aky = auth_list[i].ky;
							if ((aky == gap.userinfo.rinfo.ky) || (my_full_dept_codes.indexOf(aky) > -1)){
								is_write_auth = true;
								break;
							}		
						}	
					}else{
						is_write_auth = true;
					}					
				}
			}		
		}else{
			is_write_auth = false;
		}		
		return is_write_auth;
	},
	
	"checkAuth2" : function(channel_code){
		//특정 채널에 내가 문서를 작성 할 수 있는 권한이 있는지 체크한다.
		
		//1. channel_code를 활용해서 해당 코드의 채널 정보를 가져온다.		
		var info = gap.search_channel_info(channel_code);
		var sel_ch = JSON.parse(info.responseText).data;
		
		var is_write_auth = false;	
		if (sel_ch){
			if (gap.userinfo.rinfo.ky == sel_ch.owner.ky){
				is_write_auth = true;
			}else{
				if (sel_ch.opt_reg && sel_ch.opt_reg == "all"){
					//작성 권한이 있는 경우
					is_write_auth = true;
				}else{
					//작성 권한이 특정 사용자 또는 부서일 경우
					var auth_list = sel_ch.opt_reg_list;
					var my_full_dept_codes = gap.full_dept_codes().split("-spl-");
					if (auth_list){
						for (var i = 0 ; i < auth_list.length; i++){
							var aky = auth_list[i].ky;
							if ((aky == gap.userinfo.rinfo.ky) || (my_full_dept_codes.indexOf(aky) > -1)){
								is_write_auth = true;
								break;
							}		
						}	
					}else{
						is_write_auth = true;
					}					
				}
			}		
		}
		return is_write_auth;
	},
	
	"search_channel_info" : function(channel_code){		
		var surl = gap.channelserver + "/search_info.km";
		var postData = {
			"type" : "C",
			"ch_code" : channel_code
		};		
		return $.ajax({
			type : "POST",
			url : surl,
			async : false,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					return res.data;
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	"owner_delete_msg" : function(info, time){
		var pinfo = gap.user_check(info);
		var day = gap.change_date_localTime_full2(time);
		return gap.lang.del_content + " [" +  day + " - " + pinfo.disp_user_info +"]";
	},
	"remove_owner_delete_obj" : function(id){
		
		$("#p_" + id).html(gap.owner_delete_msg(gap.userinfo.rinfo, moment().utc().format('YYYYMMDDHHmmss')));
		var dpa = $("#p_" + id).parent();
		dpa.find(".tmpimagelist").remove();
		dpa.find(".message-file").remove();
		dpa.find(".bot").remove();
		dpa.find(".req_box").remove();
		dpa.find(".img-thumb2").remove();
		dpa.find(".channel_reply_top").remove();
		dpa.find(".top").remove();
		dpa.find(".xnewtodo").remove();
		//모바일
		$("#cc_" + id).html(gap.owner_delete_msg(gap.userinfo.rinfo, moment().utc().format('YYYYMMDDHHmmss')));
		var dpa2 = $("#cc_" + id).parent();
		dpa2.find("ul").remove();
		dpa2.find("span").remove();
		dpa2.find("div").remove();
		dpa2.append("<div style='height:10px'>&nbsp;</div>");
		
		//투표, 전자결재 형태 삭제
		var dpa3 = $("#req_" + id).parent().parent();
		
		$("#req_" + id).parent().append("<p>" + gap.owner_delete_msg(gap.userinfo.rinfo, moment().utc().format('YYYYMMDDHHmmss') + "</p>"));
		$("#req_" + id).remove();
		dpa3.find(".bot").remove();
		dpa3.find(".channel_reply_top").remove();
		
		//모바일용
		dpa3.find(".message-btns").remove();
		dpa3.find(".message-reply").remove();
		$("#btn_more_" + id).remove();
		
	},
	
	"check_top_menu_new" : function(){		
		if ( (gBodyM.cur_opt=="allcontent") || (gBodyM.cur_opt=="mycontent") || (gBodyM.cur_opt=="sharecontent") || (gBodyM.cur_opt=="favoritecontent") || (gBodyM.cur_opt=="allmention")){
			return true;			
		}
		return false;
	},
	
	"mobile_write_auth_check" : function(){
		var is_write_auth = "T";
		if (!gap.check_top_menu_new()){
			//일반 채널일 경우'
			var write_auth = gap.checkAuth2(gBodyM.cur_opt);
			if (!write_auth){
				is_write_auth = "F";
			}
		}
		return is_write_auth;
	},
	
	"alarm_content_popup" : function(nid, rid, info){
		if (is_mobile){
			// 모바일일때
			var url_link = "kPortalMeet://NativeCall/callAlarmClick";
			var link = (typeof(info.lnk) != "undefined" ? info.lnk : info.data.lnk);
			
			if (nid == "kp_chat"){
				url_link += "?type=chat" 
					+ "&cid=" + rid;
				
			}else if (nid == "kp_channel"){
				if (info.ex && info.ex.key2 != ""){
					// 업무관리
					url_link += "?type=work_todo"
						+ "&titleName=" + (typeof(info.ex) != "undefined" ? (typeof(info.ex.key3) != "undefined" ? encodeURIComponent(info.ex.key3) : "") : "")		//(info.ex ? encodeURIComponent(info.ex.key3) : "")
						+ "&code=" + (typeof(info.ex) != "undefined" ? (typeof(info.ex.key1) != "undefined" ? info.ex.key1 : "") : "")								//(info.ex ? info.ex.key1 : "")
						+ "&job_id=" + (typeof(info.ex) != "undefined" ? (typeof(info.ex.key2) != "undefined" ? info.ex.key2 : "") : "")							//(info.ex ? info.ex.key2 : "")
						+ "&per_key=" + (typeof(info.ex) != "undefined" ? (typeof(info.ex.per_key) != "undefined" ? info.ex.per_key : "") : "");					//(info.ex ? info.ex.per_key : "");					
					
				}else{
					// 업무대화
					url_link += "?type=work_conv"
						+ "&titleName=" + (typeof(info.ex) != "undefined" ? (typeof(info.ex.key3) != "undefined" ? encodeURIComponent(info.ex.key3) : "") : "")		//(info.ex ? encodeURIComponent(info.ex.key3) : "")
						+ "&code=" + (typeof(info.ex) != "undefined" ? (typeof(info.ex.key1) != "undefined" ? info.ex.key1 : "") : "")								//(info.ex ? info.ex.key1 : "")
						+ "&per_key=" + (typeof(info.ex) != "undefined" ? (typeof(info.ex.per_key) != "undefined" ? info.ex.per_key : "") : "");					//(info.ex ? info.ex.per_key : "");					
				}
				
			}else if (nid == "kp_files"){
				url_link += "?type=files" 
					+ "&titleName=" + (typeof(info.ex) != "undefined" ? (typeof(info.ex.key3) != "undefined" ? encodeURIComponent(info.ex.key3) : "") : "")		//(info.ex ? encodeURIComponent(info.ex.key3) : "")
					+ "&drive_key=" + (typeof(info.ex) != "undefined" ? (typeof(info.ex.key1) != "undefined" ? info.ex.key1 : "") : "")							//(info.ex ? info.ex.key1 : "")
					+ "&folder_key=" + (typeof(info.ex) != "undefined" ? (typeof(info.ex.key2) != "undefined" ? info.ex.key2 : "") : "");						//(info.ex ? info.ex.key2 : "");
				
			}else if (nid == "approval"){
				var plist = link.split("/");
				
				if (link.indexOf("/appro.nsf/") > -1){
					var pt = plist[6];
					var ppt = pt.indexOf("?");
					var mail_id = pt.substring(0, ppt);
					
					if (gap.isDev){
						ms = plist[2];
					}else{
						//운영환경일 경우 변경한다.
						ms = plist[2].replace("dspsec","app2")
					}						
					mf = plist[3] + "/" + plist[4];
					
				}else if (link.indexOf("/emate_app/appro_reject.nsf/") > -1) {
					var pt = plist[6];
					var ppt = pt.indexOf("?");
					var mail_id = pt.substring(0, ppt);

					if (gap.isDev){
						ms = plist[2];
					}else{
						//운영환경일 경우 변경한다.
						ms = plist[2].replace("dspsec","app2")
					}						
					mf = plist[3] + "/" + plist[4];										
					
				}else if (link.indexOf("/apprbox/") > -1) {
					var pt = plist[9];
					var ppt = pt.indexOf("?");
					var mail_id = pt.substring(0, ppt);

					if (gap.isDev){
						ms = plist[2];
					}else{
						//운영환경일 경우 변경한다.
						ms = plist[2].replace("dspsec","app2")
					}						
					mf = plist[3] + "/" + plist[4]+ "/" + plist[5]+ "/" + plist[6]+ "/" + plist[7];
					
				}else if (link.indexOf("/emate_app/dudurim.nsf/") > -1) {
					var pt = plist[6];
					var ppt = pt.indexOf("?");
					var mail_id = pt.substring(0, ppt);

					if (gap.isDev){
						ms = plist[2];
					}else{
						//운영환경일 경우 변경한다.
						ms = plist[2].replace("dspsec","app2")
					}						
					mf = plist[3] + "/" + plist[4];
					
				}else if (link.indexOf("/emate_app/pcmng.nsf/") > -1) {
					var pt = plist[7];
					var ppt = pt.indexOf("?");
					var mail_id = pt.substring(0, ppt);

					if (gap.isDev){
						ms = plist[2];
					}else{
						//운영환경일 경우 변경한다.
						ms = plist[2].replace("dspsec","app2")
					}						
					mf = plist[3] + "/" + plist[4];
					
				}else if (link.indexOf("/emate_app/bbs/b2101015_2.nsf/") > -1) {
					var pt = plist[8];
					var ppt = pt.indexOf("?");
					var mail_id = pt.substring(0, ppt);

					if (gap.isDev){
						ms = plist[2];
					}else{
						//운영환경일 경우 변경한다.
						ms = plist[2].replace("dspsec","app2")
					}						
					mf = plist[3] + "/" + plist[4] + "/" + plist[5];
				}				

				url_link += "?type=aprv"
					+ "&unid=" + mail_id
					+ "&ms=" + ms
					+ "&mf=" + mf;
				
			}else if (nid == "calendar"){
				var param = {
						pmode: '7',
						type: 'schedule',
						menuhidden: 'T',
						ms: mailserver,
						mf: mailfile,
						lang: gap.curLang,
						unid: info.rid,
						nid: window.notes_id,
						com: gap.userinfo.rinfo.cpc,
						comnm: gap.userinfo.rinfo.cp,
						cdt: ''
					};
				var url = encodeURIComponent(gap.getHostUrl() + "/mobile/m.nsf/calMFunc?readform&" + $.param(param));
				
				url_link += "?type=url"
					+ "&url=" + url
					+ "&title=N";
				
			}else{
				if (nid != "kp_mail" && link != ""){		// 메일이 아니고 link가 있는 경우
					if (link.indexOf("/kwa01/mail/") > -1) {
						// nid가 메일은 아니지만 실제 링크는 메일인 경우 (거의 대부분 알림 시스템 해당)
						url_link += "?type=mail"
							+ "&unid=" + rid;
						
					} else {
						// 그 외 link 처리
						url_link += "?type=url"
							+ "&url=" + link;
					}
					
				}else{
					url_link += "?type=mail"
						+ "&unid=" + rid;
					}
			}
			gap.connectApp(url_link);
			return false;	
			
		}else{
			// PC일때 세션 체크 후 팝업 표시
			var check_url = root_path + "/kwa01/sso.nsf/check.txt?open&ver="+new Date().getTime();
			$.ajax({
				type : "GET",
				url : check_url,
				success : function(res){
					if (res == "OK"){
						var url = "";
						var link = (typeof(info.lnk) != "undefined" ? info.lnk : info.data.lnk);
						var exJson = (typeof(info.ex) != "undefined" ? info.ex : {});

						if (nid == "kp_chat"){
						//	url = location.protocol + '//' + location.host + "/" + mailfile_prefix + "/dsw/wm.nsf/chat?readform&key=" + $.base64.encode(rid) + "&callfrom=alarm";
							gap.chatroom_create_after2(rid);
							return;							
							
						}else if (nid == "kp_channel"){
						//	url = location.protocol + '//' + location.host + "/" + mailfile_prefix + "/dsw/wm.nsf/chat?readform&channel&" + rid + "&alarm&" + (exJson.per_key ? exJson.per_key : "");
							gap.channel_enter_popup(rid);
							return;
							
						}else if (nid == "kp_files"){
						//	url = location.protocol + '//' + location.host + "/v/files&" + rid;
							url = location.protocol + '//' + location.host + "/v/files";
							
						}else if (nid == "approval" && link != ""){
						//	url = link + "&callFrom=alarm";
							if (link.indexOf("-=server-host=-") > -1){
								url = link.replace("-=server-host=-", location.protocol + '//' + location.host);
							}else{
								url = location.protocol + '//' + location.host + link;
							}
							url = url + "&callFrom=alarm";
							
						}else if (nid == "calendar" && link != ""){
							if (link.indexOf("-=server-host=-") > -1){
								url = link.replace("-=server-host=-", location.protocol + '//' + location.host);
							}else{
								url = location.protocol + '//' + location.host + link;
							}
							url = url + "&alarmportal=T";
							
						}else{
							
							if (link.indexOf("/XML_Inbox/") > -1 || link == ""){
								var mail_host = (gap.isDev ? location.host.replace("dev.", "one.") : location.host);
								url = location.protocol + '//' + mail_host + "/" + maildbpath + "/XML_Inbox/" + rid + "?Opendocument&viewname=XML_Inbox&folderkey=&opentype=popup&relatedyn=N&readtype=alarm_popup";
										
							}else{
								url = link;	//gAct.change_rp_server(link);
							}
						}
						if (window.chrome.webview){
							if (nid == "kp_files"){
								// 특정 시스템은 탭으로 열어준다.
								window.chrome.webview.postMessage('{"type":"openurl", "stype":"' + url + '"}');	
							}else{
								// 팝업으로 열어준다. (width / height는 문자열로)
								//window.chrome.webview.postMessage('{"type":"notiurl", "stype":"' + url + '", "width":"1210", "height":"850"}');
								gap.open_subwin(url, "1210","850", "yes" , "", "yes");
								return;
							}
							
						}else{
							gap.open_subwin(url, "1210","850", "yes" , "", "yes");
							return;
						}
						
					}else{
						// 세션이 끝났을 때 dsw.exe로 세션 갱신 요청
						window.chrome.webview.postMessage('{"type":"session", "stype":"refresh"}');
					}
				},
				error : function(e){
				//	gap.error_alert();
				}
			});			
		}
	},	
	
	"open_email_send" : function(email){	
		localStorage.setItem("authorsend", email);
	//	var url = location.protocol + "//" + location.host + "/" + window.mailfile + "/Memo?openform&opentype=popup&callfrom=address&";
		var url = location.protocol + "//" + window.mailserver + "/" + window.mailfile + "/Memo?openform&opentype=popup&callfrom=address&";
		gap.open_subwin(url, "900", "850", false, "", true);
	},	
	
	"open_onetoonechat" : function(cid, name){		
		var room_key = _wsocket.make_room_id(cid);
		gBody.enter_chatroom_for_chatroomlist(room_key, cid, name);
	},
	
	
	"temp_list_status_dis" : function(obj){
		var _self = this;
		if (typeof(obj.ct) != "undefined"){		
			if (obj.ek == "remove"){
				return false;
			}			
			var lists = obj.ct.usr;
			var ty = obj.ek;			
			var isOff = false;
			var offcount = 0;			
			if (ty == "topsearch"){				
				for (var i = 0 ; i < lists.length; i++){
					var info = lists[i];
					gap.temp_change_status_search(info.ky, info.st, info.msg, ty);
				}				
			}else if (ty == "buddylist_search"){
				for (var i = 0 ; i < lists.length; i++){
					var info = lists[i];
					gBody.buddylist_search_status(info.ky, info.st, info.msg, ty, info.exst);
				}	
			}else if (ty == "useraddsearch"){				
				for (var i = 0 ; i < lists.length; i++){
					var info = lists[i];
					gap.temp_change_status_search(info.ky, info.st, info.msg, ty);
				}
			}else if (ty == "channel"){				
				for (var i = 0 ; i < lists.length; i++){
					var info = lists[i];
					var key = info.ky;
					//온라인 오프라인 상태 정보를 변경한다.
					var st = info.st;
					$("[data-status='status_"+key+"']").removeClass();					
					if (st == 1){						
						$("[data-status='status_"+key+"']").addClass("status online");
					}else if (st == 2){
						$("[data-status='status_"+key+"']").addClass("status away");
					}else if (st == 3){
						$("[data-status='status_"+key+"']").addClass("status deny");	
					}else{
						$("[data-status='status_"+key+"']").addClass("status offline");
					}
					//모바일 접속 여부를 변경한다.
					var mst = info.mst;
					if (typeof(mst) != "undefined"){
						if (mst == 0){
							$("[data-phone='phone_"+key+"']").removeClass();
						}else{
							$("[data-phone='phone_"+key+"']").removeClass();
							$("[data-phone='phone_"+key+"']").addClass("phone_icon abs");
						}
					}					
					//휴가 정보관련 상태를 변경한다.					
					var exst = info.exst;
					if (typeof(exst) != "undefined"){
						//1: 휴가, 2: 휴직, 3: 오전반차, 4: 오후반차, 5: 장기휴가, 6: 해외출장, 7: 국내출장, 8: 교육, 9: 재택 , 10 :휴무
						if (exst != ""){			
							$("[data-day='day_"+key+"']").show();
							$("[data-day='day_"+key+"']").removeClass().addClass("biz_check day_"+exst+"");
							$("[data-day='day_"+key+"']").text(gap.lang["v"+exst]);
						//	$("[data-day='day_"+key+"']").text(gap.lang["ws_type_"+exst]);							
						}
					}
				}
			}else if (ty == "org"){				
				this.statusCheckResult(lists);				
			}else if (ty == "org_detail"){				
				this.detailLayerStatus(lists);
			}else if (ty == "popup_chat_member"){
				gma.statusCheckResult(lists);
			}else if (ty == "quick_chat_buddy"){
				gma.statusBuddyList(lists);
			}else if (ty == "portal_favorite"){
				gcom.statusBuddyList(lists);
			}else{
				for (var i = 0 ; i < lists.length; i++){
					var info = lists[i];
					//상태 이미지를 변경 시킨다.			
			//		gap.temp_change_status(info.ky, info.st, ty);
					var key = info.ky;
					var st = info.st;				
					$("[data-status='status_"+key+"']").removeClass();					
					if (st == 1){						
						$("[data-status='status_"+key+"']").addClass("status online");
					}else if (st == 2){
						$("[data-status='status_"+key+"']").addClass("status away");
					}else if (st == 3){
						$("[data-status='status_"+key+"']").addClass("status deny");	
					}else{
						$("[data-status='status_"+key+"']").addClass("status offline");
					}					
					var obj = new Object();
					obj.id = info.ky;
					obj.st = info.st;
					gap.status_change(obj);					
					if (info.st == 0){
						isOff = true;					
						offcount ++;
					}				
					//모바일 접속 여부를 변경한다.
					var mst = info.mst;
					if (typeof(mst) != "undefined"){
						if (mst == 0){
							$("[data-phone='phone_"+key+"']").removeClass();
						}else{
							$("[data-phone='phone_"+key+"']").removeClass();
							$("[data-phone='phone_"+key+"']").addClass("phone_icon abs");
						}
					}					
					//휴가 정보관련 상태를 변경한다.					
					var exst = info.exst;
					if (typeof(exst) != "undefined"){
						//1: 휴가, 2: 휴직, 3: 오전반차, 4: 오후반차, 5: 장기휴가, 6: 해외출장, 7: 국내출장, 8: 교육, 9: 재택 , 10 :휴무
						if (exst != ""){			
							$("[data-day='day_"+key+"']").show();
							$("[data-day='day_"+key+"']").removeClass().addClass("biz_check day_"+exst+"");
							$("[data-day='day_"+key+"']").text(gap.lang["v"+exst]);
						//	$("[data-day='day_"+key+"']").text(gap.lang["ws_type_"+exst]);							
						}
					}				
				}		
				if (ty == "chatroom"){					
					if (isOff){
						if (gap.search_is_onetoone()){
							//1:1일 경우							
							var chatname = "";
							var uinfo = gap.cur_room_att_info_list_search(obj.id);							
							if (typeof(uinfo) == "undefined"){
								chatname = gBody.cur_room_att_info_list[0].nm;
							}else{
								if (gap.cur_el == uinfo.el){
									chatname = gBody.cur_room_att_info_list[0].nm;
								}else{
									chatname = gBody.cur_room_att_info_list[0].enm;
								}
							}						
							$("#chatroom_all_status").text(chatname +gap.lang.offline_one);							
						}else{
							//1:N일 경우
							if (offcount == (lists.length)){
								$("#chatroom_all_status").text(gap.lang.all_off_chat);
							}else{
								$("#chatroom_all_status").text(gap.lang.offline_status);
							}						
						}
						//$("#chatroom_all_status").show();
						if (gBody.cur_cid.indexOf("10139992") > -1){							
						}else{
							$("#chatroom_all_status").fadeIn(1000);
						}					
					}
					
					gBody.chatroom_dis_height();
				}
			}
		}		
	},
	
	"showRegLayer" : function(s_dt, e_dt){
		var _self = this;
		
		gap.showBlock();
		
		$('#work_simple_write_layer').remove();
		
		var html = 
			'<div id="work_simple_write_layer" class="work-simple-layer">' +
			'	<div class="title-wrap">' +
			'		<ul>' +
			'			<li data-menu="cal" class="on"><span>' + gap.lang.tab_reg_cal + '</span></li>' +
			'			<li data-menu="work"><span>' + gap.lang.tab_reg_work + '</span></li>' +
			'		</ul>' +
			'		<div class="btn-close"><span></span><span></span></div>' +
			'	</div>' +
			'</div>';
		
		var $layer = $(html);
		$('body').append($layer);
		
		this.genCalLayer();
		this.genWorkLayer();
		
		
		// 버튼 등록
		html = 
			'<div class="btn-wrap">' +
			'	<button id="btn_simple_ok" class="btn-popup">' + gap.lang.btn_reg + '</button>' +
			'</div>';
		var $btn_area = $(html);
		$('#work_simple_write_layer').append($btn_area);
		
		$layer.find('#ws_title').attr('placeholder', gap.lang.placeholder_title);
		
		
		this.regEventBind(s_dt, e_dt);
		
		// 레이어 표시
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
		
		$('#cs_title').focus();
	},
	
	"genWorkLayer" : function(){
		var html = 
			'<div class="content-work content-wrap" style="display:none;">' +
			'	<div class="label-background"></div>' +
			'	<div class="table-wrap">' +
			'		<table>' +
			'			<tbody>' +
			'				<tr>' +
			'					<th>' + gap.lang.ws_channel + '</th>' +
			'					<td><div class="td-inner ws-ch-content"><select id="ws_category"></select></div></td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.ws_title + '</th>' +
			'					<td><div class="td-inner"><input type="text" id="ws_title" autocomplete="off" placeholder="' + gap.lang.placeholder_title + '"></div></td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.todo_name + '</th>' +
			'					<td><textarea id="ws_content" class="ws-content"></textarea></td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.ws_period + '</th>' +
			'					<td>' +
			'						<div class="td-inner">' +
			'							<div class="date-wrap">' +
			'								<input type="text" id="ws_s_date" class="ws-date">' +
			'								<div class="icon"></div>' +
			'							</div>' +
			'							<span>~</span>' +
			'							<div class="date-wrap">' +
			'								<input type="text" id="ws_e_date" class="ws-date">' +
			'								<div class="icon"></div>' +
			'							</div>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.priority + '</th>' +
			'					<td>' +
			'						<div class="td-inner">' +
			'							<select id="ws_priority">' +
			'								<option value="1">' + gap.lang.ws_priority_1 + '</option>' +
			'								<option value="2">' + gap.lang.ws_priority_2 + '</option>' +
			'								<option value="3" selected>' + gap.lang.ws_priority_3 + '</option>' +
			'								<option value="4">' + gap.lang.ws_priority_4 + '</option>' +
			'							</select>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.asign + '</th>' +
			'					<td style="padding-bottom:10px;">' +
			'						<div class="td-inner">' +
			'							<select id="ws_asignee">' +
			'							</select>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'			</tbody>' +
			'		</table>' +
			'	</div>' +
			'</div>';
			
		var $content = $(html);
		$('#work_simple_write_layer').append($content);
		$('#ws_priority').material_select();
	},	
	
	"addEventRegist" : function(list){
		var _self = this;
		this.showRegLayer();
		
		$.each(list, function(){
			if (gap.userinfo.rinfo.ky == this.ky){
				// 자기자신은 추가하지 않음
			} else if (this.dsize == 'group'){
				// 그룹은 등록 안됨
			} else {
				_addAttendee(this);								
			}
		})
		
		function _addAttendee(user_info){
			var $list = $('#cs_attendee_list');
			var ck = $list.find('li[data-key="' + user_info.ky + '"]');
			if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
			
			if (user_info.ky == gap.userinfo.rinfo.ky) {
				mobiscroll.toast({message:gap.lang.mt_alert_2, color:'danger'});
				return;
			}
			
			var disp_txt = '';
			if (user_info.ky.indexOf('@') != -1){
				return;				
			} else {
				user_info = gap.user_check(user_info);
				disp_txt = '<a onclick="gap.showUserDetailLayer(\'' + user_info.ky + '\')">' + user_info.disp_user_info + '</a>';
			}
			
			var html =
				'<li class="cs-attendee" data-key="' + user_info.ky + '">' +
				'	<span class="txt ko">' + disp_txt + '</span>' +
				'	<button class="btn-user-remove"></button>' +
				'</li>';
			
			var $li = $(html);
			
			$li.data('info', user_info);
			$li.find('.btn-user-remove').on('click', function(){
				$(this).closest('li').remove();
				
				if ($list.find('li').length == 0) {
					$('.cs-user-info').hide();
					$('#cs_content').addClass('long');
				}
			});
			
			$list.append($li);
			
			var $scroll_wrap = $('.cs-user-info');
			$scroll_wrap.show();
			$scroll_wrap.scrollLeft($scroll_wrap[0].scrollWidth);
			$('#cs_content').removeClass('long');
		}
	},	
	
	"genCalLayer" : function(){
		var html = 
			'<div class="content-cal content-wrap">' +
			'	<div class="label-background"></div>' +
			'	<div class="table-wrap">' +
			'		<table>' +
			'			<tbody>' +
			'				<tr>' +
			'					<th>' + gap.lang.basic_title + '</th>' +
			'					<td><div class="td-inner"><input type="text" id="cs_title" autocomplete="off" placeholder="' + gap.lang.placeholder_title + '"></div></td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.ws_period + '</th>' +
			'					<td>' +
			'						<div class="td-inner">' +
			'							<div class="date-wrap">' +
			'								<input type="text" id="cs_s_date" class="cs-date" readonly>' +
			'								<div class="icon"></div>' +
			'							</div>' +
			'							<div class="time-wrap" style="display:none;">' +
			'								<select id="cs_s_time"></select>' +
			'							</div>' +
			'							<span>~</span>' +
			'							<div class="date-wrap">' +
			'								<input type="text" id="cs_e_date" class="cs-date" readonly>' +
			'								<div class="icon"></div>' +
			'							</div>' +
			'							<div class="time-wrap" style="display:none;">' +
			'								<select id="cs_e_time"></select>' +
			'							</div>' +
			'							<label class="cs-allday" style="display:none;"><input type="checkbox" id="cs_allday">' + gap.lang.allday + '</label>' +
			'							<div class="btn" id="sel_time">' + gap.lang.select_time + '</div>' +
			'							<div class="btn" id="sel_allday" style="display:none;">' + gap.lang.allday + '</div>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.share_user + '</th>' +
			'					<td>' +
			'						<div style="position:relative;">' +
			'							<input type="text" id="cs_attendee" class="cs-user" autocomplete="off" placeholder="' + gap.lang.share_user_ph + '">' +
			'							<div class="org-icon"></div>' +
			'							<div class="cs-user-info" style="display:none;">' +
			'								<ul id="cs_attendee_list" class="cs-attendee-wrap"></ul>' +
			'							</div>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.ws_type + '</th>' +
			'					<td>' +
			'						<div class="td-inner">' +
			'							<select id="cs_type">' +
			'								<option value="" selected>' + gap.lang.ws_type_0 + '</option>' +
			'								<option value="5">' + gap.lang.ws_type_5 + '</option>' +
			'								<option value="7">' + gap.lang.ws_type_7 + '</option>' +
			//'								<option value="10">' + gap.lang.ws_type_10 + '</option>' +
			'							</select>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.priority + '</th>' +
			'					<td>' +
			'						<div class="td-inner">' +
			'							<select id="cs_priority">' +
			'								<option value="1">' + gap.lang.ws_priority_1 + '</option>' +
			'								<option value="2">' + gap.lang.ws_priority_2 + '</option>' +
			'								<option value="3" selected>' + gap.lang.ws_priority_3 + '</option>' +
			'								<option value="4">' + gap.lang.ws_priority_4 + '</option>' +
			'							</select>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.ws_public + '</th>' +
			'					<td>' +
			'						<div class="td-inner">' +
			'							<div class="radio-wrap">' +
			'								<input type="radio" id="cs_public_y" name="cs_public" value="Y" checked>' +
			'								<label for="cs_public_y">' + gap.lang.disclosure + '</label>' +
			'								<input type="radio" id="cs_public_n" value="N" name="cs_public">' +
			'								<label for="cs_public_n" style="margin-left:15px;">' + gap.lang.nondisclosure + '</label>' +
			'							</div>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.notice_body + '</th>' +
			'					<td>' +
			'						<textarea id="cs_content" class="cs-content long"></textarea>' +
			'					</td>' +
			'				</tr>' +
			'			</tbody>' +
			'		</table>' +
			'	</div>' +
			'</div>';
		
		var $content = $(html);
		$('#work_simple_write_layer').append($content);
		$('#cs_type').material_select();
		$('#cs_priority').material_select();
	},
	
	"regEventBind" : function(s_dt, e_dt){
		var _self = this;
		var $layer = $('#work_simple_write_layer');
		
		
		function _getTimeHtml() {
			var html_time = '';
			var now = moment();
			
			// 한글 사용자는 오전/오후로 표시
			if (gap.userinfo.userLang == 'ko') {
				now.locale('ko-kr');
			}
			
			now.set({'hour':0, 'minute':0, 'second':0, 'millisecond':0});
			
			var ckdate = now.clone();
			ckdate.add(1, 'day');
			
			while (now.format() != ckdate.format()) {
				html_time += '<option value="' + now.format('HH:mm') + '">' + now.format('LT') + '</option>';
				now.add(30, 'minutes');
			}
			return html_time;
		}
		
		function _setDiffDate(e_val) {
			var s_date = moment($('#cs_s_date').val() + 'T' + $('#cs_s_time').val()); 
			var e_date = moment((e_val ? e_val : $('#cs_e_date').val()) + 'T' + $('#cs_e_time').val());
			
			
			var diff = e_date.diff(s_date, 'm');
			if (diff >= 0) {
				$('#cs_s_date').data('diff_min', diff);
			}
			 
		}
		
		function _changeEndDate(event) {
			var diff = $('#cs_s_date').data('diff_min');
			var s_txt = (event ? event.valueText : $('#cs_s_date').val()) + 'T' + $('#cs_s_time').val();
			
			if (diff >= 0) {
				var e_dt = moment(s_txt).add(diff, 'm');
				$('#cs_e_date').val(e_dt.format('YYYY-MM-DD'));
				$('#cs_e_time').val(e_dt.format('HH:mm')).material_select();				
			}
		}
		
		function _checkEndDate(s_val, e_val) {
			if ($('#cs_allday').is(':checked')) {
				var s_date = moment(s_val ? s_val : $('#cs_s_date').val() + 'T00:00:00'); 
				var e_date = moment(e_val ? e_val : $('#cs_e_date').val() + 'T00:00:00');
				if (e_date.diff(s_date) < 0) {
					// 종료일을 시작일보다 이전으로 설정하는 경우
					$('#cs_e_date').addClass('invalid');
				} else {
					$('#cs_e_date').removeClass('invalid');
				}
				$('#cs_e_time').parent().find('input').removeClass('invalid');
			} else {
				var s_date = moment((s_val ? s_val : $('#cs_s_date').val()) + 'T' + $('#cs_s_time').val()); 
				var e_date = moment((e_val ? e_val : $('#cs_e_date').val()) + 'T' + $('#cs_e_time').val());
				if (e_date.diff(s_date) <= 0) {
					// 종료일을 시작일보다 이전으로 설정하는 경우
					$('#cs_e_date').addClass('invalid');
					$('#cs_e_time').parent().find('input').addClass('invalid');
				} else {
					$('#cs_e_date').removeClass('invalid');
					$('#cs_e_time').parent().find('input').removeClass('invalid');
				}
			}
		}
		
		function _searchUser(){
			var terms = $.trim($('#cs_attendee').val());
			if (terms == '') return;
			
			var users = terms.split(',');

			gsn.requestSearch('', terms, function(res){
				$.each(res, function(){
					_addAttendee(this);
				});
			});			
			
			$('#cs_attendee').val('');
		}
		
		function _addAttendee(user_info){
			var $list = $('#cs_attendee_list');
			var ck = $list.find('li[data-key="' + user_info.ky + '"]');
			if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
			
			if (user_info.ky == gap.userinfo.rinfo.ky) {
				mobiscroll.toast({message:gap.lang.mt_alert_2, color:'danger'});
				return;
			}
			
			var disp_txt = '';
			if (user_info.ky.indexOf('@') != -1){
				return;				
			} else {
				user_info = gap.user_check(user_info);
				disp_txt = '<a onclick="gap.showUserDetailLayer(\'' + user_info.ky + '\')">' + user_info.disp_user_info + '</a>';
			}
			
			var html =
				'<li class="cs-attendee" data-key="' + user_info.ky + '">' +
				'	<span class="txt ko">' + disp_txt + '</span>' +
				'	<button class="btn-user-remove"></button>' +
				'</li>';
			
			var $li = $(html);
			
			$li.data('info', user_info);
			$li.find('.btn-user-remove').on('click', function(){
				$(this).closest('li').remove();
				
				if ($list.find('li').length == 0) {
					$('.cs-user-info').hide();
					$('#cs_content').addClass('long');
				}
			});
			
			$list.append($li);
			
			var $scroll_wrap = $('.cs-user-info');
			$scroll_wrap.show();
			$scroll_wrap.scrollLeft($scroll_wrap[0].scrollWidth);
			$('#cs_content').removeClass('long');
		}
		
		
		// 탭 이벤트
		$layer.find('.title-wrap li').on('click', function(){
			if ($(this).hasClass('on')) return;
			
			$layer.find('.title-wrap li.on').removeClass('on');
			$(this).addClass('on');
			
			var disp_menu = $(this).data('menu');
			$layer.find('.content-wrap').hide();
			$layer.find('.content-' + disp_menu).show();
			
			if ($(this).data('menu') == 'cal') {
				
			} else {
				
			}
		});
		
		
		
		// 일정 관련
		// 현재 시간 정보 셋팅
		var time_html = _getTimeHtml();
		var s_date = moment().startOf('h').add(1, 'h');
		var e_date = moment().startOf('h').add(2, 'h');
		
		if (s_dt && e_dt) {
			// 메인에서 드래그하여 넘어온 경우
			$('#cs_s_date').val(s_dt);
			$('#cs_e_date').val(e_dt);
			$('#cs_allday').prop('checked', true);
			$('#cs_s_time').append(time_html).val(s_date.format('HH:mm')).prop('disabled', true).material_select();
			$('#cs_e_time').append(time_html).val(e_date.format('HH:mm')).prop('disabled', true).material_select();
			s_date = moment($('#cs_s_date').val() + 'T' + s_date.format('HH:mm'));
			e_date = moment($('#cs_e_date').val() + 'T' + e_date.format('HH:mm'));
		} else {
			$('#cs_s_date').val(s_date.format('YYYY-MM-DD'));
			$('#cs_e_date').val(e_date.format('YYYY-MM-DD'));
			$('#cs_s_time').append(time_html).val(s_date.format('HH:mm')).material_select();
			$('#cs_e_time').append(time_html).val(e_date.format('HH:mm')).material_select();
		}
		
		// 기간 선택
		$('#cs_s_date').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			theme: 'ios',
			defaultSelection: $('#cs_s_date').val(),
			themeVariant : 'light',
			controls: ['calendar'],			
			dateFormat: 'YYYY-MM-DD',	
			display: 'anchored',
			animation: 'pop',
			calendarType: 'month',	
			startInput: '#cs_s_date',
			pages : 1,
			touchUi: false,
			onChange: function(event, inst){
				_checkEndDate(event.valueText, $('#cs_e_date').val());
				
				// 시작일을 종료일보다 이후로 선택했는지 체크
				if ($('#cs_e_date').hasClass('invalid')) {
					$('#cs_e_date').val(event.valueText);
					_checkEndDate(event.valueText, $('#cs_e_date').val());
				}
			}
		});
		
		$('#cs_e_date').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			theme: 'ios',
			themeVariant : 'light',
			controls: ['calendar'],				
			dateFormat: 'YYYY-MM-DD',	
			display: 'anchored',
			animation: 'pop',
			calendarType: 'month',	
			startInput: '#cs_e_date',
			pages : 1,
			touchUi: false,
			onChange: function(event, inst){
				_setDiffDate(event.valueText);
				_checkEndDate($('#cs_s_date').val(), event.valueText);
			}
		});
		
		
		// 종일 이벤트
		$('#cs_allday').on('click', function(){
			if ($(this).is(':checked')) {
				$('#cs_s_time').prop('disabled', true).material_select();
				$('#cs_e_time').prop('disabled', true).material_select();
				$layer.find('.time-wrap').hide();
				$('#sel_time').show();
				$('#sel_allday').hide();
			} else {
				$('#cs_s_time').prop('disabled', false).material_select();
				$('#cs_e_time').prop('disabled', false).material_select();
				$layer.find('.time-wrap').show();
				$('#sel_time').hide();
				$('#sel_allday').show();
			}
			_checkEndDate();
		});
		
		$('#cs_s_time').on('change', function(){
			_changeEndDate();
			_checkEndDate();
		});
		
		$('#cs_e_time').on('change', function(){
			// 종료시간을 시작시간 이후로 설정하면 시간 차이만큼 셋팅
			_setDiffDate();
			_checkEndDate();
		});
		
		// 종료일과의 시간을 계산해서 처리
		$('#cs_s_date').data('diff_min', e_date.diff(s_date, 'm'));
		
		
		//////////////  일정 등록 이벤트 끝   ////////////// 
		
		// 채널 정보 가져오기
		_self.getChannelList();
		
		
		// 기간 선택
		$('#ws_s_date').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			theme: 'ios',
			controls: ['calendar'],
			select: 'range',				
			dateFormat: 'YYYY-MM-DD',	
			//display: 'anchored',
			animation: 'pop',
			calendarType: 'month',	
			startInput: '#ws_s_date',
		    endInput: '#ws_e_date',
			pages : 2,
			touchUi: false
		});
		
		if (s_dt && e_dt) {
			$('#ws_s_date').val(s_dt);
			$('#ws_e_date').val(e_dt);
		}
		
		// 시간 설정 기능 변경 (2023.5.3)
		$('#sel_time').on('click', function(){
			$('#cs_allday').click();
			
			// 자동으로 열렬다 닫히는 오류로 인해 setTimeout 설정
			$('#work_simple_write_layer').click(); //다른 열려있는 레이어들을 닫기 위해 호출
			setTimeout(function(){
				$('#cs_s_time').parent().find('input').trigger('mousedown').trigger('focus');			
			}, 200);
		});
		$('#sel_allday').on('click', function(){
			$('#cs_allday').click();
		});
		
		
		
		// 공유 대상자 입력
		$('#cs_attendee').on('keydown', function(e){
			if (e.keyCode == 13) {
				_searchUser();
			}
		}).on('blur', function(e){
			var temp = $.trim($(this).val());
			if (temp != '') {
				_searchUser();
			}
		}).on('paste', function(e){
			gap.change_paste_text(e, this);
		});
		
		// 공유 대상자 조직도
		$layer.find('.org-icon').on('click', function(){
			window.ORG.show(
				{
					'title': gap.lang.share_user,
					'single': false,
					'select': 'person' // [all, team, person]
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length == 0) return;
						for (var i = 0; i < items.length; i++){
							var _res = gap.convert_org_data(items[i]);
							//_res = gap.user_check(_res);
							_addAttendee(_res);
						}
					}
				}
			);
		});
				
		// 저장
		$('#btn_simple_ok').on('click', function(){
			var menu = $layer.find('.title-wrap li.on').data('menu');
			if (menu == 'cal') {
				_self.simpleCalendarSave();
			} else {
				_self.simpleWorkSave();
			}
		});
		
		// 닫기
		$layer.find('.btn-close').on('click', function(){
			_self.hideWorkLayer();
		});
		
		
		$layer.find('.date-wrap .icon').on('click', function(){
			$(this).parent().find('input').click();
			//$('#ws_s_date').click();
			return false;
		});
		
	},		
	
	"noticeOpen" : function(key, callfrom){
		var _self = this;
		$.ajax({
			type : "POST",
			url : gap.channelserver + "/read_notice_by_key.km",
			dataType : "json",
			data : JSON.stringify({id:key}),
			success : function(res){
				if (res.result == 'NO') {
					gap.gAlert(gap.lang.del_notice);
					return;
				}
				if (res.result == 'ERROR') {
					gap.gAlert(gap.lang.mt_err_1);
					return;
				}
				
				var res = res.data.response;
				var title = (res.data.title ? res.data.title : gap.lang.notice);
				
				$('#notice_ly').remove();
				
				var html =
					'<div id="notice_ly" class="read">' +
					
					'	<div class="notice-ly-inner">' +
					'		<div class="title-inner">' +
					'			<h4>' + title + '</h4>' +
					'			<div class="btn-wr">' +
					'				<button class="btn-notice-modify" style="display:none;">' + gap.lang.basic_modify + '</button>' +
					'				<button class="btn-notice-remove" style="display:none;">' + gap.lang.basic_delete + '</button>' +
					'				<div class="btn-close" style="display:inline-flex"><span></span><span></span></div>' +
					'			</div>' +
					'		</div>' +
					
					'		<div class="owner-info writer-inner">' +
					'			<div class="writer-img user-thumb"></div>' +
					'			<div class="writer-info-wr">' +
					'				<div>' +
					'					<span class="writer-info"></span>' +
					'					<button type="button"></button>' +
					'				</div>' +
					'				<span class="notice-date"></span>' +
					'			</div>' +
					'		</div>' +
					
					'		<div class="cont-inner">' +
					'			<div class="notice-body-wr">' +
					'				<ul class="notice-file-list" style="display:none;"></ul>' +
					'				<div class="notice-body"></div>' +
					'			</div>' +
					'			<div class="reply-list" style="display:none;"></div>' +
					'		</div>' +
					'	</div>' +
					
					'	<div class="bot-inner">' +
					'		<textarea class="txt-notice-reply" rows="1" placeholder="' + gap.lang.input_replay + '"></textarea>' +
					'		<textarea class="hidden-textarea" rows="1"></textarea>' +
					'		<button type="button" class="btn-notice-reply-reg">' + gap.lang.registration + '</button>' +
					'	</div>' +
					
					'</div>';
				

				var $layer = $(html);
				
				$('body').append($layer);
				
				gap.showBlock();
				var inx = gap.maxZindex() + 1;
				$layer.css('z-index', inx);
				res.callfrom = callfrom;	// 어디서 호출됐는지 정보 저장  ex) quick_chat, chat
				$layer.data('info', res);
				
				// 사용자 정보 표시
				
			//	var person_img = gap.person_profile_photo_by_ky2(res.owner.ky);		
				var person_img = gap.person_profile_photo(res.owner);		
				var userinfo = gap.user_check(res.owner);
				var notice_date = gap.convertGMTLocalDateTime(res.GMT);
				
				$layer.find('.writer-img').append(person_img);
				$layer.find('.writer-info').text(userinfo.disp_user_info);
				$layer.find('.notice-date').text(notice_date);
				
				
				// 내가 올린 공지인 경우
				if (userinfo.ky == gap.userinfo.rinfo.ky) {
					$layer.find('.btn-notice-modify').show();
					$layer.find('.btn-notice-remove').show();
				}
				
				// 본문 내용 표시
				_self.drawNoticeDetailBody();
				
				// 댓글 표시
				_self.drawNoticeDetailReply();
				
				// 이벤트 처리
				_self.eventNoticeRead();

			}
		});
	},
	
	
	"noticeWrite" : function(data){
		gap.delete_file_list = [];
		
		var html =
			'<div id="notice_ly">' +
			'	<div class="title-inner">' +
			'		<h4>' + gap.lang.notice + '</h4>' +
			'		<div>' +
			'			<button type="button" id="btn_notice_save">' + gap.lang.basic_save + '</button>' +
			'			<button type="button" id="btn_notice_close" class="btn-notice-close">' + gap.lang.Cancel + '</button>' +
			'		</div>' +
			'	</div>' +
			
			'	<div class="cont-inner">' +
			'		<div class="input-field">' +
			'			<span class="input-label">' + gap.lang.basic_title + '</span>' +
			'			<input type="text" id="notice_title" placeholder="' + gap.lang.placeholder_title + '" class="input" autocomplete="off">' +
			'			<button type="button" class="btn-attach-add" id="notice_add_file">' + gap.lang.addFile + '</button>' +
			'		</div>' +
			//'		<div style="text-align:right;">' +
			
			//'		</div>' +
			'		<ul class="attach-list" id="notice_file_list_editor_edit" style="list-style:none"></ul>' +
			'		<ul class="attach-list" id="notice_file_list_editor" style="list-style:none"></ul>' +
			
			'		<div class="editor-area">' +
			'			<iframe id="notice_editor" border="0" frameborder="0"></iframe>' +
			'		</div>' +
			'	</div>' +
			'	<div id="notice_upload_dis" style="display:none;"></div>' +
			'	<div id="previews_notice_file" style="display:none;"></div>' +
			'</div>';
		
		if ($('#notice_ly').length > 0) {
			$('#notice_ly').remove();
		}
		
		var $layer = $(html);
		$layer.data('info', data);		
		$('body').append($layer);
		
		gap.showBlock();
		var inx = gap.maxZindex() + 1;
		$layer.css('z-index', inx);
		
		// 파일 기능 초기화
		this.noticeFileInit();
		
		
		if (data) {
			this.notice_data = data;
		} else {
			this.notice_data = null;
		}
		
		// 기존 파일 그리기
		this.noticeAddFile_already(gap.notice_data.data.info);
		
				
		// 에디터 로딩
		$('#notice_editor').attr('src', root_path+"/page/kEditor.jsp?callfrom=notice");
		
		
		$('#notice_title').focus();
		
		
		$('#btn_notice_close').on('click', function(){
			$(window).off('resize.notice');
			gap.hideBlock();
			$layer.remove();
		});
		
		
		// 저장하기
		$('#btn_notice_save').on('click', function(){
			myDropzone_notice.save_type = "notice";
			gHome.real_upload_process();
		});		
	},
	
	
	"drawNoticeDetailBody" : function(){
		var info = $('#notice_ly').data('info');
		var data = info.data;
		
		function _insertATag(str){
			var res = '';
			res = str.replace(/([^"])(http[s]?:\/\/)/gi, "$1 $2");
			res = gap.aLink(res);
			return res;
		}
		
		function _fileDraw(finfos){
			if (!finfos) return;
			if (finfos.length == 0) return;
			
			var $file_list = $('#notice_ly .notice-file-list');
			
			$.each(finfos, function(){
				var finfo = this;
				var file_ext = finfo.filename.substr(finfo.filename.lastIndexOf('.') + 1);
				var upload_path = info.data.upload_path;
				var upload_ky = info.owner.ky;
				var upload_file = finfo.md5 + '.' + file_ext;
				
				var fname = gap.textToHtml(finfo.filename);
				var icon_kind = gap.file_icon_check(fname);
				var file_url = upload_ky + '/' + upload_path + '/' + upload_file;
				
				var html = 
					'<li class="notice-file-wr" title="' + finfo.filename + '">' +
					'	<div class="ico ico-file ' + icon_kind + '"></div>' +
					'	<div class="filename-wr">' +
					'		<span class="notice-filename">' + finfo.filename + '</span>' +
					'		<span class="notice-filesize">' + gap.file_size_setting(finfo.file_size['$numberLong']) + '</span>' +
					'	</div>' +
					'	<button type="button" class="btn-notice-filedown" title="Download"></button>' +
					'</li>';
				
				var $file_el = $(html);
				$file_el.data('url', file_url);
				$file_el.data('filename', fname);
				$file_el.data('fileinfo', finfo);
				$file_list.append($file_el);
			});
			
			$file_list.show();
		}
		
		// 이미지가 아니고 파일이 있으면 표시
		if (data.ty != 6 && data.info) {
			_fileDraw(data.info);
		}
		
		var body;
		if (data.editor) {
			// 에디터
			body = gap.textToHtml(data.editor);
			body = _insertATag(body);
		} else {
			if (data.ty == 5) {
				
			} else if (data.ty == 6) {
				// 이미지
				var finfo = data.info[0];
				var file_ext = finfo.filename.substr(finfo.filename.lastIndexOf('.') + 1);
				var upload_path = info.data.upload_path;
				var upload_ky = info.owner.ky;
				var upload_file = finfo.md5 + '.' + file_ext;
				
				var fname = gap.textToHtml(finfo.filename);
				var img_path = upload_ky + '/' + upload_path + '/' + upload_file;
				var img_url = gap.channelserver + '/FDownload_noticefile.do?path=' + img_path + '&fn=' + encodeURIComponent(fname);
				var $img = $('<img class="notice-img">');
				$img.attr('src', img_url);
				
				$('#notice_ly .notice-body').append($img);
			} else {
				// 일반 메세지
				if (data.content) {
					// 링크 처리
					body = _insertATag(data.content);
					body = body.replace(/\r\n|\n/g, '<br/>');
					body = '<p>' + body + '</p>';
				} else if (data.msg) {
					body = _insertATag(data.msg);	
					body = body.replace(/\r\n|\n/g, '<br/>');
					body = '<p>' + body + '</p>';
				} else {
					// 표시할 데이터가 없음
				}
			}
		}
		
		if (body) {
			$('#notice_ly .notice-body').append(body);
		} else {
			$('#notice_ly .notice-body').hide();
			$('#notice_ly .reply-list').css('border', 'none');
			
		}
		
	},
	
	"drawNoticeDetailReply" : function(){
		var _self = this;
		var $layer = $('#notice_ly');
		var info = $layer.data('info');
		
		var top_id = (info.callfrom == 'work' ? 'notice_top_work' : 'notice_top_chat');
		if (!info.reply) {
			$('#' + top_id).find('.reply-cnt').text(0);
			return;	
		}

		$('#' + top_id).find('.reply-cnt').text(info.reply.length);
		
		var $reply_list = $layer.find('.reply-list');
		$reply_list.empty();
		
		var nkey = info._id.$oid;
		$.each(info.reply, function(){
			_self.noticeAddReply(nkey, this);
		});
	},
	
	"noticeAddReply" : function(notice_key, res){
		var $list = $('#notice_ly').find('.reply-list');
		
	//	var person_img = gap.person_profile_photo_by_ky2(res.owner.ky);		
		var person_img = gap.person_profile_photo(res.owner);		
		var userinfo = gap.user_check(res.owner);
		var reply_date = gap.convertGMTLocalDateTime(res.GMT);
		var message = gap.message_check(res.content);
		var html =
			'<div class="writer-inner" id="notice_reply_' + res.rid + '">' +
			'	<div class="writer-img user-thumb"></div>' +
			'	<div class="writer-info-wr">' +
			'		<div>' +
			'			<span class="writer-info"></span>' +
			'		</div>' +
			'		<span class="notice-date"></span>' +
			'		<p class="reply-msg"></p>' +
			'	</div>' +
			'</div>';
	
		var $li = $(html);
		
		if (res.owner.ky == gap.userinfo.rinfo.ky) {
			html = '<button type="button" class="reply-remove"></button>'; 
			var $btn_remove = $(html);
			$li.append($btn_remove);
		}
		
		$list.append($li);
		$list.show();
	
		var $reply = $('#notice_reply_' + res.rid);
		$reply.find('.writer-img').append(person_img);
		$reply.find('.writer-info').text(userinfo.disp_user_info);
		$reply.find('.notice-date').text(reply_date);
		$reply.find('.reply-msg').html(message);
		
		var reply_info = {
				"key" : notice_key,
				"rid" : res.rid
			};
		
		$reply.find('.reply-remove').data('info', reply_info);
		
		
		// 이벤트 처리
		$li.find('.writer-img').on('click', function(){
			var ky = $(this).find('img').data('key');
			gOrg.showUserDetailLayer(ky);
		});
		$li.find('.writer-info').on('click', function(){
			$li.find('.writer-img').click();
		});
		
		// 삭제버튼
		$li.find('.reply-remove').on('click', function(){
			var rinfo = $(this).data('info');
			gap.removeNoticeReply(rinfo);
		});
	},
	
	
	"drawNoticeWork" : function(){
		var _self = this;
		var cur_cid = gBody3.cur_opt;
		$.ajax({
			type : "POST",
			url : gap.channelserver + "/read_notice.km",
			dataType : "json",
			data : JSON.stringify({key:cur_cid}),
			success : function(res){
				
				// 공지가 없을 경우 예외처리
				if (!res.data) {
					_self.hideNoticeWork();
					return;
				}
				
				var $el = $('#notice_top_work');
				res.data.response.callfrom = 'work';
				$el.data('info', res.data.response);
				
				var data = res.data.response.data;
				var title = _self.getNoticeTitle(data);
				
				// 공지 타입에 맞게 표시
				$el.removeClass().addClass('notice-top');
				$el.find('.notice-filelist').remove();
				$el.find('.notice-img').remove();
				
				
				_self.dispNoticeFile($el);
				
				if (data.editor){
					
				} else if (data.type == 'file') {
					$el.addClass('type-file');
				} else if (data.ex) {
					// vote, aprv, bbs
					$el.addClass('type-' + data.ex.type);
					$el.addClass('special-type');
				}
				
				
				
				////////////// 데이터 확인 후 뿌릴 것 //////////////
				
				// 제목 & 본문
				$el.find('.notice-head').html(title);
				
				// 작성자 정보
				var owner = gap.user_check(res.data.response.owner);
				var writer = owner.disp_user_info + " | ";
				var notice_date = res.data.response.GMT;
				var html = '<span class="userinfo">' + owner.disp_user_info + '</span>';
				html += '<span class="dt">' + gap.convertGMTLocalDateTime(notice_date) + '</span>';
				$el.find('.notice-writer').html(html);

				
				// 디스플레이 초기화
				$el.find('.notice-btn-wr').show();
				$el.find('.btn-notice-detail').show();
				$el.find('.reply-cnt').show();
				
				// 수정, 삭제 버튼 표시
				if (gap.userinfo.rinfo.ky == owner.ky) {
					$el.find('.btn-notice-modify').show();
					$el.find('.btn-notice-remove').show();
				} else {
					$el.find('.btn-notice-modify').hide();
					$el.find('.btn-notice-remove').hide();
					if (data.ex) {
						$el.find('.notice-btn-wr').hide();
					}
				}
				
				// 업무방 투표, 게시판, 결재 등은 상세보기, 수정 버튼 숨김
				if (data.ex) {
					$el.find('.btn-notice-detail').hide();
					$el.find('.btn-notice-modify').hide();
					$el.find('.reply-cnt').hide();
				} 
				
				// 이벤트 처리
				_self.eventNotice($el, 'work');
				
				
				// 공지 표시
				$('#sub_channel_content').addClass('show-notice');
				
				
				// 댓글 개수 표시
				if (res.data.response.reply && res.data.response.reply.length > 0) {
					$el.find('.reply-cnt').text(res.data.response.reply.length);
				} else {
					$el.find('.reply-cnt').text(0);
				}
				
				_self.workRefreshHeight();
			}
		});
	},
	
	"hideNoticeWork" : function(){
		$('#sub_channel_content').removeClass('show-notice');
		$('#notice_top_work').removeClass('expand');
		this.workRefreshHeight();
	},
	
	"eventNoticeRead" : function(){
		var _self = this;
		var $layer = $('#notice_ly');
		
		// 수정
		$layer.find('.btn-notice-modify').on('click', function(){
			_self.noticeWrite($layer.data('info'));
		});
		
		// 삭제
		$layer.find('.btn-notice-remove').on('click', function(){
			var info = $layer.data('info');
			var docid = info._id.$oid;
			gap.removeNotice(docid, info.callfrom);
		});
		
		// 닫기
		$layer.find('.btn-close').on('click', function(){
			$layer.remove();
			gap.hideBlock();
		});
		
		// 작성자 프로필
		$layer.find('.owner-info .writer-img').on('click', function(){
			var ky = $(this).find('img').data('key');
			gOrg.showUserDetailLayer(ky);
		});
		$layer.find('.owner-info .writer-info').on('click', function(){
			$layer.find('.owner-info .writer-img').click();
		});
		
		
		
		// 파일 미리보기
		$layer.find('.notice-file-wr').on('click', function(){
			var info = $layer.data('info');
			var path = $(this).data('url');
			var fn =  $(this).data('filename');
			var ext = gap.is_file_type_filter(fn);
			
			if (ext == 'movie') {
				//PC에서 재생되는 확장자 인지  확인 한다.
				if (gap.is_file_preview_mobile(fn)){
					gap.gAlert(gap.lang.not_support);
					return false;		
				}
				
				
				var download_url = gap.channelserver + '/FDownload_noticefile.do?path=' + path + '&fn=' + encodeURIComponent(fn);
				
				gap.show_video(download_url, fn);	
			} else {
				var f_info = $(this).data('fileinfo');
				var fs = gap.channelserver;
				var md5 = f_info.md5;
				var id = info._id['$oid'];
				var ft = f_info.file_type;
				var ky = info.data.ky;
				var upload_path = info.data.upload_path;
				
				gBody3.file_convert(fs, fn, md5, id, "notice", ft, ky, upload_path);
				
			}
			
			return false;
		});
		
		// 파일 다운로드
		$layer.find('.btn-notice-filedown').on('click', function(){
			var $wr = $(this).parent();
			var path = $wr.data('url');
			var fn =  $wr.data('filename');
			var download_url = gap.channelserver + '/FDownload_noticefile.do?path=' + path + '&fn=' + encodeURIComponent(fn);
			
			gap.file_download_normal(download_url, fn);
			return false;
		});
		
		
		
		$layer.find('.txt-notice-reply').on('keyup', function(){
			// 댓글 입력 높이값 계산
			var hidden = $layer.find('.hidden-textarea').get(0);			
			var value = this.value;
			hidden.value = value;
			this.style.height = hidden.scrollHeight + "px";

			// 버튼 색상 표시
			var val = $.trim(this.value);
			if (val == '') {
				$layer.find('.btn-notice-reply-reg').removeClass('enable');
			} else {
				$layer.find('.btn-notice-reply-reg').addClass('enable');
			}
		});
		
		// 댓글 저장
		$layer.find('.btn-notice-reply-reg').on('click', function(){
			var value = $.trim($layer.find('.txt-notice-reply').val());
			if (value == '') return;
			
			// 높이값 수정
			var hidden = $layer.find('.hidden-textarea').get(0);			
			hidden.value = '';
			$layer.find('.txt-notice-reply').get(0).style.height = hidden.scrollHeight + "px";
				
			gap.saveNoticeReply();
		});
		
	},
	
	"noticeEditorHeight" : function(height){
		var _h = parseInt($('#notice_editor').outerHeight()) - 8;
		if (height) {
			_h = height;
		}
		
		$('#notice_editor').get(0).contentWindow._form.kEditor.setHeight(_h);
	},
	
	"noticeFileInit" : function(){
		var _self = this;
		var isdropzone = $("#notice_upload_dis")[0].dropzone;
		if (isdropzone) {
			isdropzone.destroy();
			//return false;
		}
		
		myDropzone_notice = new Dropzone("#notice_upload_dis", { // Make the whole body a dropzone
		      url: gap.channelserver + "/FileControl.do", // Set the url
		      autoProcessQueue : false, 
			  parallelUploads : 100,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
			  maxFilesize: 1000,
			  timeout: 180000,
		  	  uploadMultiple: true,
		  	  withCredentials: false,
		  	  previewsContainer: "#previews_notice_file", // Define the container to display the previews
		  	  clickable: "#notice_add_file", // Define the element that should be used as click trigger to select files.
		  	  renameFile: function(file){	
				return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			  },
		  	  init: function() {	
					myDropzone_notice = this;
		      },
		      success : function(file, json){
		    	
		    	  var jj = JSON.parse(json);	    	  
		    	  if (jj.result == "OK"){		    		 
		    		  myDropzone_notice.files_info = jj;
		    	  }		    	 		
		      }
		});
		myDropzone_notice.on("totaluploadprogress", function(progress) {
			
			//document.querySelector("#total-progress_channel .progress-bar").style.width = progress + "%";
		});
		myDropzone_notice.on("queuecomplete", function (file) {	
			
			
			var isPopup = false;
			var callfrom = $('#notice_ly').data('info').callfrom;
			if (callfrom == "chat"){
				room_key = gBody.cur_cid;
			}else{
				isPopup = true;
				room_key = gma.cur_cid_popup;
			}
			
			gap.hide_loading();
			
			$("#btn_notice_close").click();
			
			var xinfo = new Object();
			if (callfrom == "work"){
				gap.hideNoticeWork();
				gap.drawNoticeWork(gBody3.cur_opt);
				
				//멤버들에게 전송한다.
				var list = gap.cur_room_search_info_member_ids(gBody3.cur_opt);
				xinfo.type = "update_notice_channel";
				xinfo.channel_code = gBody3.cur_opt;
				xinfo.sender = list;
				xinfo.room_key = gBody3.cur_opt;
				_wsocket.send_msg_other(xinfo, "update_notice_channel");	 //obj.sender에 참석자를 추가해야 함
			}else{
				gBody2.hideNoticeChat();
				gap.read_notice(gBody.cur_cid);
				//멤버들에게 전송한다.
				//채팅에서 수정한 경우
				var member_list = "";
				if (isPopup){
					member_list = gBody.cur_room_att_info_list_popup;
				}else{
					member_list = gBody.cur_room_att_info_list;
				}
				var sender = [];
				for (var k = 0 ; k < member_list.length; k++){
					var info = member_list[k];
					if (info.ky != gap.userinfo.rinfo.ky){
						sender.push(info.ky);
					}
				}
				xinfo.room_key = room_key;
				xinfo.sender = sender;
				_wsocket.send_msg_other(xinfo, "update_notice_chat");	 //obj.sender에 참석자를 추가해야 함
			}			
		});
		myDropzone_notice.on("addedfiles", function (file) {				
			for (var i = 0 ; i < file.length; i++){				
				var fx = file[i];				
				if (fx.size > (this.options.maxFilesize * 1024 * 1024)){
				   myDropzone_notice.removeFile(fx);
				   alert("'" + fx.name + "'" + "" + gap.lang.file_ex + "\n(MaxSize : " + this.options.maxFilesize + "M)");				  
				}
				if (gap.no_upload_file_type_check(fx.name)){
					$("#total-progress_channel").hide();
					myDropzone_notice.removeFile(fx);				
					gap.gAlert(fx.name + " " + gap.lang.nofileup);							
				}				
			}			
			var files = myDropzone_notice.files;
			if (files.length > 0){
				_self.noticeAddFile(files, "file");	
			}
		});		
		myDropzone_notice.on("sending", function (file, xhr, formData) {
			
			gap.show_loading(gap.lang.saving);			
			
			
			var title = myDropzone_notice.title;
			var xcontent = myDropzone_notice.editor_body;
			formData.append("email", gap.userinfo.rinfo.ky);
			formData.append("ky", gap.userinfo.rinfo.ky);
			formData.append("content", "");
			formData.append("editor", xcontent);
//			formData.append("channel_code", gBody.select_channel_code);
//			formData.append("channel_name", gBody.select_channel_name);
			formData.append("owner", JSON.stringify(gap.userinfo.rinfo));
			formData.append("fserver", gap.channelserver);
			formData.append("type", "notice");
			
			formData.append("edit", "T");
			
			formData.append("title", title);
			formData.append("id", gHome.notice_data._id.$oid);
			formData.append("upload_path", gHome.notice_data.data.upload_path);			
			myDropzone_notice.files_info = "";
			//$("#total-progress_channel").show();	
	        //document.querySelector("#total-progress_channel .progress-bar").style.display = "";
		});
	},
	
	"noticeAddFile_already" : function(info){
		var _self = this;
		if (typeof(info) != "undefined"){
			$("#notice_file_list_editor_edit").empty();
			var html = "";
			for (var i = 0 ; i < info.length; i++){
				var fx = info[i];			
				var ext = gap.file_icon_check(fx.filename);
				var size = gap.file_size_setting(fx.file_size.$numberLong);					
				var fn = fx.filename;				
				html += "<li>";
				html += "	<span class='ico ico-file "+ext+"'></span>";
				html += "	<div class='attach-name'><span>"+fn+"</span><em>("+size+")</em></div>";
				html += "	<button class='ico btn-delete' data='"+fn+"' data2='"+fx.file_size.$numberLong+"' data3='"+fx.md5+"' data3='"+fx.file_type+"' onClick=\"gHome.removeF_editor_edit(this)\">삭제</button>";
				html += "</li>";				
			}			
			$("#notice_file_list_editor_edit").append(html);
		}	
	},
	
	"removeF_editor_edit" : function(obj){
		var _self = this;
		var del_md5 = $(obj).attr("data3");
		gHome.delete_file_list.push(del_md5);
		$(obj).parent().remove();
		
		setTimeout(function(){
			_self.noticeEditorHeight();
		}, 100);
	},
	
	"noticeAddFile" : function(file){
		var _self = this;
		$("#notice_file_list_editor").empty();
		var html = "";
		for (var i = 0 ; i < file.length; i++){
			var fx = file[i];			
			var ext = gap.file_icon_check(fx.name);
			var size = gap.file_size_setting(fx.size);
			html += "<li>";
			html += "	<span class='ico ico-file "+ext+"'></span>";
			html += "	<div class='attach-name'><span>"+fx.name+"</span><em>("+size+")</em></div>";
			html += "	<button class='ico btn-delete' data='"+fx.name+"' data2='"+fx.size+"' onClick=\"gHome.noticeRemoveFile(this)\">삭제</button>";
			html += "</li>";
				
		}	
		
		$("#notice_file_list_editor").append(html);

		setTimeout(function(){
			_self.noticeEditorHeight();
		}, 100);
	},
	
	"noticeRemoveFile" : function(obj){
		var _self = this;
		$(obj).parent().remove();
		
		var filename = $(obj).attr("data");
		var size = $(obj).attr("data2");
				
		var list = myDropzone_notice.files;
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];
			if ( (filename == item.name) && (size == item.size)){
				//$("#total-progress_channel").hide();
				myDropzone_notice.removeFile(item);
				break;
			}
		}
		
		setTimeout(function(){
			_self.noticeEditorHeight();
		}, 100);
	},
	
	"addEventRegist" : function(list){
		var _self = this;
		//var today = moment().format('YYYY-MM-DD');
		this.showRegLayer();
		
		$.each(list, function(){
			if (gap.userinfo.rinfo.ky == this.ky){
				// 자기자신은 추가하지 않음
			} else if (this.dsize == 'group'){
				// 그룹은 등록 안됨
			} else {
				_self.addAttendee(this);								
			}
		});
	},
	
	
	"saveNoticeReply" : function(){
		var _self = this;
		var $layer = $('#notice_ly');
		var info = $layer.data('info');
		var txt = $layer.find('.txt-notice-reply').val();
		var $list = $layer.find('.reply-list');
		
		var postData = {
				"key" : info._id.$oid,
				"owner" : gap.userinfo.rinfo,
				"content" : txt
			};
		
		$.ajax({
			type : "POST",
			url : gap.channelserver + "/save_notice_reply.km",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == 'ERROR') {
					gap.gAlert(gap.lang.mt_err_1);
					return;
				}
			
				var res = res.data;
				
				gap.noticeAddReply(info._id.$oid, res);
				
				// 스크롤 최상단
				var reply_body = $layer.find('.cont-inner').get(0); 
				reply_body.scroll({left:0, top:reply_body.scrollHeight, behavior:'smooth'});
				
				// 값 비우기
				$layer.find('.txt-notice-reply').val('');
				$layer.find('.btn-notice-reply-reg').removeClass('enable');
				
				var p_id = '';
				if (info.callfrom == 'quick_chat') {
					p_id = 'alarm_chat';
				} else if (info.callfrom == 'chat') {
					p_id = 'notice_top_chat';
				} else {
					p_id = 'notice_top_work';
				}
				
				var reply_cnt = parseInt($('#' + p_id).find('.reply-cnt').text()) + 1;
				$('#' + p_id).find('.reply-cnt').text(reply_cnt);
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"removeNotice" : function(docid, type){
		var _self = this;
		gap.showConfirm({
			title: gap.lang.basic_delete,
			iconClass: 'remove',
			contents: gap.lang.confirm_delete,
			callback: function(){
				gap.delete_notice(docid, type);
			}
		});
	},
	
	"removeNoticeReply" : function(rinfo){
		var _self = this;
		var postData = {
				"key" : rinfo.key,
				"rid" : rinfo.rid
			};
		
		$.ajax({
			type : "POST",
			url : gap.channelserver + "/delete_notice_reply.km",
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == 'ERROR') {
					gap.gAlert(gap.lang.mt_err_1);
					return;
				}
				
				var info = $('#notice_ly').data('info');
				$('#notice_reply_' + rinfo.rid).remove();
				
				// 메인 공지 댓글 수 조정
				var p_id = '';
				if (info.callfrom == 'quick_chat') {
					p_id = 'alarm_chat';
				} else if (info.callfrom == 'chat') {
					p_id = 'notice_top_chat';
				} else {
					p_id = 'notice_top_work';
				}
				
				var reply_cnt = parseInt($('#'+p_id).find('.reply-cnt').text()) - 1;
				if (reply_cnt < 0) reply_cnt = 0;
				$('#'+p_id).find('.reply-cnt').text(reply_cnt);
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	},
	
	
	
	
	
	
	
	
	
	
	"getCompanyList" : function() {
		var _self = this;
		var com_list = [];

		// 회사정보 가져오기
		$.ajax({
			url: gap.channelserver + "/api/user/search_company.km",
			cache: false,
			async: false,
			success: function(res){
				$.each(res, function(){
					var c_name = (gap.curLang == "ko" ? this.cp : this.ecp);
					var c_code = this.cpc;
				//	var sub = _self.getValueByName(this, '_subdept');
					var sub = "T";		//몽고DB 회사정보 - sub_dept 필드값 참조
					com_list.push( {
						company_name : c_name,
						company_code : c_code,
						sub_dept : sub
					});
				});
			}
		});

		return com_list;
	},	
	"showUserDetailLayer" : function(ky, opt){
		var _self = this;

		var req_user = $.ajax({
			type: 'POST',
			url: gap.channelserver + "/search_user_empno.km",
			beforeSend: function(){
				_self.loading_req = setTimeout(function(){/*gap.show_loading('Loading...');*/ gap.showBlock_org();}, 200);
			},
			data: JSON.stringify({empno:ky}),
			success: function(data){
				clearTimeout(_self.loading_req);
			//	gap.hide_loading();
				gap.hideBlock_org();
				
				if (!Array.isArray(data) || data.length == 0) {
					mobiscroll.toast({message:gap.lang.error_get_data, color:'danger'});
					return;
				}

				// 여기서 기본적으로 사용자 정보를 표시한다
				_self.drawUserDetailLayer(data, opt);
			},
			error: function(){
				clearTimeout(_self.loading_req);
				gap.hideBlock_org();
				mobiscroll.toast({message:gap.lang.error_get_data, color:'danger'});
			}
		});
	},
	
	"drawUserDetailLayer" : function(data, opt){
		var _self = this;
		
		$('#user_detail_container').remove();
		
		var info = data[0][0];
		
		if (!info || !info.nm) {
			mobiscroll.toast({message:gap.lang.not_found_userinfo, color:'danger'});
			return;
		}
		
		info = gap.user_check(info);
		
		var office_num = '';
		if (info.op) {
			office_num = info.op;
			if (info.ipt) {
				office_num += '(' + info.ipt + ')';
			}
		} else {
			office_num = '-';
		}
		
		
		var html = 
			'<div id="user_detail_container">' +
			'	<div class="user-detail-dim"></div>' +
			'	<div class="layer-wrap">' +
			'		<div class="layer-inner">' +
			'			<div class="btn-close"><span></span><span></span></div>' +

			'			<div class="cont-left">' +
			'				<div class="img-box-wrap">' +
			'					<div class="img-box">' +
			'						<div class="photo-wrap"></div>' +
			'						<span class="status"></span>' +
			'						<span class="mobile"></span>' +
			'					</div>' +
			'				</div>' +
			'				<div class="mem-info-wrap">' +
			'					<h4>' + info.name + '</h4>' +
			'					<span class="empno">' + info.emp + '</span>' +
			'				</div>' +
			'				<div class="team-info-wrap">' +
			'					<span>' + info.company + '</span>';
		if (info.cpc != info.dpc){
			html += '					<span>' + info.dept + '</span>';			
		}
		html +=
			'					<span class="user-duty"></span>' +
			'				</div>' +
			'				<button type="button" class="btn-add-buddy">' + gap.lang.addGroup + '</button>' +
			'				<div id="ud_comment" class="user-comment" style="display:none;">' +
			'					<span></span>' +
			'				</div>' +
			'			</div>' +

			'			<div class="cont-right">' +
			'				<table>' +
			'					<tbody>' +
			'						<tr><th><span>' + gap.lang.company + '</span></th><td><span>' + info.company + '</span></td></tr>' +
			'						<tr><th><span>' + gap.lang.empno + '</span></th><td><span>' + info.emp + '</span></td></tr>' +
			'						<tr><th><span>' + gap.lang.duty + '</span></th><td><span class="user-duty"></span></td></tr>' +
			'						<tr><th><span>' + gap.lang.jd + '</span></th><td><span>' + (info.mm||'-') + '</span></td></tr>' +
			'						<tr><th><span>' + gap.lang.location + '</span></th><td><span>' + (info.wl||'-') + '</span></td></tr>' +
			'						<tr class="user-jn" style="display:none"><th><span>' + gap.lang.jn + '</span></th><td><span>' + info.jn + '</span></td></tr>' +
			'						<tr class="user-cn" style="display:none"><th><span>' + gap.lang.client + '</span></th><td><span>' + info.cn + '</span></td></tr>' +
			'						<tr><th><span>' + gap.lang.email + '</span></th><td><span>' + (info.em||'-') + '</span></td></tr>' +
			'						<tr><th><span>' + gap.lang.office + '</span></th><td class="user-op call"><span>' + office_num + '</span></td></tr>' +
			'						<tr><th><span>' + gap.lang.mobile + '</span></th><td class="user-mop call"><span>' + (info.mobile||'-') + '</span></td></tr>' +
			'					</tbody>' +
			'				</table>' +
			'				<div class="quick_btn_box">' +
			'					<ul>' +
			'						<li><button type="button" class="q_talk"></button><span class="q_btn_tit">' + gap.lang.chatting + '</span></li>' +
			'						<li><button type="button" class="q_mail"></button><span class="q_btn_tit">' + gap.lang.email + '</span></li>' +
			'						<li><button type="button" class="q_sms"></button><span class="q_btn_tit">SMS</span></li>' +
			//'						<li><button type="button" class="q_note"></button><span class="q_btn_tit">' + gap.lang.noti + '</span></li>' +
			'						<li><button type="button" class="cal_chk"></button><span class="q_btn_tit">' + gap.lang.schedule_check + '</span></li>' +
			'						<li><button type="button" class="q_more"></button><span class="q_btn_tit">' + gap.lang.btn_more + '</span></li>' +
			'					</ul>' +
			'					<div class="quick_more_box">' +
			'						<div class="q_m_btn_box q_meeting_btn_box">' +
			'							<h4>' + gap.lang.meeting + '</h4>' +
			'							<ul>' +
			'								<!--<li><button type="button" class="met_invit"></button><span class="q_btn_tit">회의초대</span></li>-->' +
			'								<li><button type="button" class="con_reser"></button><span class="q_btn_tit">' + gap.lang.res_meet_room + '</span></li>' +
			'								<li><button type="button" class="video_met"></button><span class="q_btn_tit">' + gap.lang.make_video + '</span></li>' +
			'							</ul>' +
			'						</div>' +
			'						<div class="q_m_btn_box q_etc_btn_box">' +
			'							<h4>' + gap.lang.etc + '</h4>' +
			'							<ul>' +
			'								<li id="user_detail_ele" style="display:none;"><button type="button" class="ele"></button><span class="q_btn_tit">' + gap.lang.elephant + '</span></li>' +
			'								<li><button type="button" class="remote_sup"></button><span class="q_btn_tit">' + gap.lang.remote + '</span></li>' +
			'							</ul>' +
			'						</div>' +
			'					</div>' +
			'				</div>' +
			'			</div>' +
			
			'		</div>' +
			'	</div>' +
			'</div>';
		
		var $layer = $(html);
		$('body').append($layer);
		$layer.data('info', info);
		
		// 내 프로필인 경우 채팅 멤버 추가 버튼 숨김
		if (info.ky == gap.userinfo.rinfo.ky) {
			$layer.find('.btn-add-buddy').hide();
		} 
		
		// 직위 표시
		/*
		var disp_duty = '';
		if (info.dg == 'DUTY') {
			disp_duty = info.du;
		} else {
			disp_duty = info.jt;
		}
		*/
		var disp_duty = info.jt;
		
		// 직무레벨이 SC1, SC2, SC3인 경우 표시
		if (info.jtc == 'SC1' || info.jtc == 'SC2' || info.jtc == 'SC3') {
			if (info.du == 'SC팀장') {
				// SC팀장은 직위레벨 표시 안함
				
			} else {
				disp_duty += ' (' + info.jtc + ')';
			}
		}
		$layer.find('.user-duty').text(disp_duty);
		
		// 직무 표시
		if (info.jn && info.jn != 'null') { // null이 스트링으로 들어오는 케이스가 있음
			$layer.find('.user-jn').show();
		}
		
		// 거래처 표시
		if (info.cn && info.cn != 'null') { // null이 스트링으로 들어오는 케이스가 있음
			$layer.find('.user-cn').show();
		}
		
		// 코끼리 표시
		if (gap.userinfo.rinfo.cpc == '10' && (gap.userinfo.rinfo.ky.indexOf('im') == -1) &&
			info.cpc == '10' &&	(info.ky.indexOf('im') == -1)) {
			$('#user_detail_ele').show();
		}
		
		// 사용자 사진 표시
		var img_src = gap.person_photo_url(info);
		$layer.find('.photo-wrap').css('background-image', 'url(' + img_src + '), url("+gap.none_img+")')
		.on('click', function(){
			
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;
			
			gap.show_image(img_src, info.nm, 'org');
		});

		if (window.use_tel == '1') {
			// 전화
			if (info.op) {
				$layer.find('.user-op').append('<button type="button" class="call_num" data-num="' + info.op + '"></button>');
			}			
			// 휴대전화
			if (info.mop) {
				$layer.find('.user-mop').append('<button type="button" class="call_phone" data-num="' + info.mop + '"></button>');
			}
		}
		
		if (window.use_sms != '1') {
			$layer.find('.q_sms').closest('li').remove();
		}
		
		
		setTimeout(function(){$layer.find('.layer-wrap').addClass('show');}, 20);
		
		
		// 닫기
		$layer.find('.btn-close').on('click', function(){
			$layer.find('.layer-wrap').removeClass('show');
			//setTimeout(function(){
				$layer.remove();				
			//}, 200);
			$(document).off('keydown.userdetail.layer');
			
			
			// 콜백 설정한 경우
			if (opt && opt.onClose) {
				opt.onClose();
			}
		});
		// Dim 클릭시 닫기
		$layer.find('.user-detail-dim').on('click', function(){
			$layer.find('.btn-close').click();
		});
		// ESC 닫기
		$(document).on('keydown.userdetail.layer', function(e){
			if (e.keyCode == 27) {
				if ($('#preview_img').is(':visible')) {
					// 사용자 사진 확대보기 중인 경우
					gap.close_preview_img();
				} else if ($('#add_buddy_layer').is(':visible')) {
					// 그룹 추가중인 경우
					$('#add_buddy_layer').find('.pop_btn_close').click();
				} else {
					$layer.find('.btn-close').click();					
				}
			}
		});
		
		// qtip 어딘가에서 띄운경우 레이어 닫을 때 qtip이 안닫히도록 처리
		//$layer.on('mousedown', function(){return false;});
		
		// 온라인, 모바일 접속 여부, 상태(휴가,출장 등)값 표시
		_wsocket.temp_list_status([info.ky], 3, 'org_detail');
		
		/*
		 * 버튼 이벤트
		 */
		
		$layer.find('.call_num').on('click', function(){
			gap.phone_call(info.ky, 1);
		});
		$layer.find('.call_phone').on('click', function(){
			gap.phone_call(info.ky, 2);
		});
		
		$layer.find('.q_more').on('click', function(){
			$layer.find('.quick_btn_box').toggleClass('show-more');
		});
		
		// 쪽지 (상세프로필)
		$layer.find('.q_note').on('click', function(){
			var list = [];
			list.push(info);
			gRM.create_memo(list);
		});
		
		// 대화 (상세프로필)
		$layer.find('.q_talk').on('click', function(){
			var list = [];
			list.push({
				ky: info.ky,
				nm: info.nm
			});
			gap.cur_chat_user = info.ky;
			gap.cur_chat_name = info.nm;
			gap.chatroom_create(list);
		});
		
		// 메일 (상세프로필)
		$layer.find('.q_mail').on('click', function(){
			var param = {opentype: 'popup',	callfrom: 'address', authorsend: info.em};			
			var memo_url = location.protocol + '//' + window.mailserver + '/' + window.mailfile + '/Memo?openform&' + $.param(param);
			
			var swidth = Math.ceil(screen.availWidth * 0.8);
			var sheight = Math.ceil(screen.availHeight * 0.8);
			if (swidth > 1140) {
				swidth = 1140;				
			}
			gap.open_subwin(memo_url, swidth, sheight);
		});
		
		// SMS (상세프로필)
		$layer.find('.q_sms').on('click', function(){
			gap.sms_call(info.ky);
		});
		
		// 회의실 예약 (상세프로필)
		$layer.find('.con_reser').on('click', function(){
			gMet.reserveMeeting('2', [info.ky], null, null, function(){
				$layer.find('.btn-close').click();
			}); 
		});
		
		// 화상회의 (상세프로필)
		$layer.find('.video_met').on('click', function(){
			gMet.reserveMeeting('1', [info.ky], null, null, function(){
				$layer.find('.btn-close').click();
			}); 
		});
		
		// 일정 (상세프로필)
		$layer.find('.cal_chk').on('click', function(){
			gap.calendar_view(null, info.ky);
		});
		
		// 코끼리 (상세프로필)
		$layer.find('.ele').on('click', function(){
			gap.elephant_call(info.ky);
		});
		
		// 원격제어
		$layer.find('.remote_sup').on('click', function(){
			gap.remote_call(info.ky);
		});
		
		// 채팅 멤버 추가
		$layer.find('.btn-add-buddy').on('click', function(){			
			gap.showAddBuddyLayer(info);
		});
	},
	
	"setUserStatusClass" : function(dom, status){
		// 상태
		if (status == 1) {
			dom.addClass('online');
		} else if (status == 2) {
			dom.addClass('away');
		} else if (status == 3) {
			dom.addClass('deny');
		} else {
			dom.addClass('offline');
		}
	},
	
	"detailLayerStatus" : function(list){
		var $layer = $('#user_detail_container');
		if ($layer.length == 0) return;
		if (!Array.isArray(list)) return;
		
		var l_info = $layer.data('info'); 
		var info = list[0];
		if (info.ky != l_info.ky) return;
		
		// 상태
		this.setUserStatusClass($layer.find('.status'), info.st);
		
		// 모바일
		if (info.mst && info.mst != 0) {
			$layer.find('.mobile').addClass('phone_icon');
		}
		
		// 연차정보
		if (info.exst && info.exst != '') {
			$layer.find('.mem-info-wrap').prepend('<span class="biz_check day_' + info.exst + '">' + this.userDayText(info.exst) + '</span>');
		}
		
		/*
		// 상태메세지
		if (info.msg && info.msg != '') {
			$('#ud_comment').show().find('span').html(info.msg);
		}
		*/
	},
	
	"statusCheckResult" : function(lists){
		var _self = this;
		if (!Array.isArray(lists)) return;

		// status : 0: 오프라인, 1: 온라인
		// mobile : 모바일 폰 접속 여부 
		// day : 1: 휴가, 2: 휴직, 3: 오전반차, 4: 오후반차, 5: 장기휴가, 6: 해외출장, 7: 국내출장, 8: 교육, 9: 재택, 10: 휴무
		$.each(lists, function(){
			_self.draw_list_status[this.ky] = {
				status: this.st,
				mobile: this.mst && this.mst != 0 ? true : false,
				day: this.exst 
			};
		});
		
		this.updateStatus();
	},
	
	"updateStatus" : function(){
		var _self = this;
		var $list = $('#user_list_tb');
		$list.find('tr').each(function(){
			var _key = $(this).data('key');
			var stat_info = _self.draw_list_status[_key];
			
			// 스탯 정보가 있으면 정보 업데이트
			if (stat_info) {
				var info = $(this).data('info');
				info.status = stat_info.status;
				info.mobile = stat_info.mobile;
				info.day = stat_info.day;
				
				var $status = $(this).find('.user .status');
				var $mobile = $(this).find('.user .mobile');
				var $check = $(this).find('.name-link');				
				
				/*
				// 온라인, 오프라인 정보
				if (info.status == '1') {
					$status.addClass('online');
				} else if (info.status == '2') {
					$status.addClass('away');
				} else if (info.status == '3') {
					$status.addClass('deny');
				} else {
					$status.addClass('offline');
				}
				*/

				// 온라인 정보
				_self.setUserStatusClass($status, info.status);
				
				// 모바일 접속 정보
				if (info.mobile) {
					$mobile.addClass('phone_icon');
				} else {
					$mobile.removeClass('phone_icon');
				}
				
				// 연차 정보
				if (info.day != '') {
					$check.prepend('<span class="biz_check day_' + info.day + '">' + _self.userDayText(info.day) + '</span>');
				}
				
			}
		});
	},
	
	"showAddBuddyLayer" : function(info){
		var _self = this;
		
		$('#add_buddy_layer').remove();
		
		var html =
			'<div id="add_buddy_layer" class="mu_container">' +
			'	<div id="layerDimDark"></div>' +
			'	<div class="layer_wrap center" style="width:306px;position:fixed;z-index:1004;">' +
			'		<div class="layer_inner">' +
			'			<div class="pop_btn_close"></div>' +
			'			<h4>' + gap.lang.addGroup + '</h4>' +
			'			<div class="layer_cont left">' +
			'				<div class="cont_wr rel new_group">' +
			'					<span class="radio_box">' +
			'						<input type="radio" id="group_sel_new" name="group_select" checked>' +
			'						<label for="group_sel_new">' + gap.lang.newchatgroup + '</label>' +
			'					</span>' +
			'					<div class="before_select">' +
			'						<input type="text" id="group_new_txt" class="input" placeholder="' + gap.lang.inputgroupname + '">' +
			'					</div>' +
			'				</div>' +
			'				<div class="cont_wr rel b_group" style="display:none;">' +
			'					<span class="radio_box">' +
			'						<input type="radio" id="group_sel_add" name="group_select">' +
			'						<label for="group_sel_add">' + gap.lang.oldchatgroup + '</label>' +
			'					</span>' +
			'					<div class="input-field selectbox">' +
			'						<select id="group_select_list">' +
			'						</select>' +
			'					</div>' +
			'				</div>' +
			'			</div>' +
			'			<div class="btn_wr">' +
			'				<button type="button" class="btn_layer confirm">' + gap.lang.basic_save + '</button>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		
		var $layer = $(html);
		$('body').append($layer);
		$('#group_new_txt').focus();
		
		// 레이어 표시
		var inx = gap.maxZindex();
		$layer.css("z-index", parseInt(inx) + 1);
		
		
		var bl = gap.buddy_list_info.ct.bl;
		if (bl.length > 0) {
			bl.sort(gap.sortNameDesc);
			
			var html = '';

			$.each(bl, function(){
				var $tmp = $('<div></div>').text(this.nm);
				html += '<option>' + $tmp.text() + '</option>';
			});
			
			$layer.find('.b_group').show();
			$('#group_select_list').append(html).material_select();
			
			$layer.find('.b_group').show();
		}
		
		$layer.find('#group_select_list').on('change', function(){
			$('#group_sel_add').prop('checked', true);
		});
		
		
		// 저장
		$layer.find('.confirm').on('click', function(){
			var is_new = $('#group_sel_new').is(':checked');
			
			if (is_new) {
				// 신규 그룹
				var group_name = $.trim($('#group_new_txt').val());
				if (group_name == '') {
					$('#group_new_txt').focus();
					
					// toast엘리먼트가 뒤로 숨겨져서 index값을 계산해서 처리
					mobiscroll.toast({message:gap.lang.inputgroupname, color:'danger'});
					setTimeout(function(){
						var inx = gap.maxZindex();
						$('.mbsc-toast:last-child').css('z-index', parseInt(inx) + 1);						
					}, 200);
					
					return;
				}
				$('#group_new_txt').val(group_name);
				
				var usrs = [];
				var userinfo = {nm:info.nm, ky:info.ky};				
				usrs.push(userinfo);
				
				_wsocket.update_group(group_name, "" , usrs);
			} else {
				// 기존 그룹
				var $sel = $('#group_select_list option:selected');
				var sel_group = $sel.text();
				_wsocket.copy_person(info.ky, sel_group, info.nm);
			}
			$layer.find('.pop_btn_close').click();
		});
		
		// 닫기
		$layer.find('.pop_btn_close').on('click', function(){
			$layer.remove();
		});
		
		// 바깥영역 클릭시 닫기 처리
		$('#layerDimDark').on('click', function(){
			$layer.find('.pop_btn_close').click();
		});
	},	
	
	"calendar_view" : function(jun, uid){
		var url = location.protocol + '//' + window.mailserver + '/ngw/core/lib.nsf/redirect_mail?readform&action=calview&uname=' + uid + '&viewname=F';
		gap.open_subwin(url, "1240","660", "yes" , "", "yes");	
	},
	
	
	"receive_box_msg" : function(obj){
		//공지사항 삭제하기
		
		if (obj.id == "delete_notice_chat"){
			if (obj.f4 == gBody3.cur_cid){
				gBody.hideNoticeChat();
			}			
			if (obj.f4 == gma.cur_cid_popup){
				gBody.hideNoticeQuickChat();
			}
			return false;
		}
		
		if (obj.id == "update_notice_chat"){
			var obb = JSON.parse(obj.f1);
			if (obb.room_key == gBody3.cur_cid){
				gBody.drawNoticeChat();
			}			
			if (obb.room_key == gma.cur_cid_popup){
				gBody.drawNoticeQuickChat();
			}
			return false;
		}
		
		
		if (obj.id == "update_notice_channel"){
			var obb = JSON.parse(obj.f1);
			if (gBody3.cur_opt == obb.channel_code){				
				gap.drawNoticeWork(obb.channel_code);
			}
			return false;
		}
		
		if (obj.id == "delete_notice_channel"){
			var obb = JSON.parse(obj.f1);
			if (gBody3.cur_opt == obb.channel_code){				
				gap.hideNoticeWork();
			}
			return false;
		}
		
		if (obj.ty == "box_noti"){
			$("#new_alram_menu").removeClass("act");
			$("#new_alram_menu").addClass("act");
			return false;
		}
		
		if (obj.id == "todo"){
			gap.receive_todo_msg(obj);
			return false;
			
		}else if (obj.id == "drive" || obj.id == "chmng"){
			gap.receive_drive_msg(obj);
			return false;
		}
		
		if (obj.id == "member_exit_channel"){
			//멤버가 삭제된 내용이 수신되었을 경우			
			//로컬 채널 정보에서 멤버를 제거한다.
			var obb = JSON.parse(obj.f1);
			var res = gap.search_cur_channel_remove_member(obb.p_code, obj.ty);			
			//채널방에 있는 경우 멤버 정보를 제거하고 숫자를 재정리한다.
			$("#member_list_" + obj.ty).remove();
			$(".office_part h2").text("Member ("+res+")");			
			//메인창에 있는 경우 이미지를 제거해 준다.
			$("[data-pky='"+obb.p_code+"_"+obj.ty+"']").remove();			
			return false;
		}else if (obj.id == "member_exit_drive"){			
			//로컬 채널 정보에서 멤버를 제거한다.
			var obb = JSON.parse(obj.f1);
			var res = gap.search_cur_drive_remove_member(obb.p_code, obj.ty);			
			//채널방에 있는 경우 멤버 정보를 제거하고 숫자를 재정리한다.
			$("#member_list_" + obj.ty).remove();
			$(".office_part h2").text("Member ("+res+")");			
			return false;
		}else if (obj.id == "member_enter_channel"){			
			var obb = JSON.parse(obj.f1);
			gap.search_cur_channel_chnage_member(obb.p_code, obb.members);
			if (obj.ty != gap.userinfo.rinfo.ky){
				if ($("#channel_right").css("display") != "none"){
					gBody3.draw_channel_members(obb.p_code);
				}				
			}
			return false;
		}else if (obj.id == "member_enter_drive"){			
			var obb = JSON.parse(obj.f1);
			gap.search_cur_drive_chnage_member(obb.p_code, obb.members);
			if (obj.ty != gap.userinfo.rinfo.ky){
				if ($("#channel_right").css("display") != "none"){
					gBody3.draw_drive_members(obb.p_code);
				}				
			}
			return false;
		}		
		if (gBody3.select_files_tab){
			//현재 Files탭을 보고 있을 경우 처리하지 않는다.
			return false;
		}
		var cur_channel = gBody3.cur_opt;
		var jj = JSON.parse(obj.f1);
		if ( ((cur_channel == jj.channel_code) || (cur_channel == "allcontent") || (cur_channel == "sharecontent"))  ){			
			var chat_key = "channel_" + jj._id + "_chat_noti";		
			localStorage.setItem(chat_key, "T");					
			var is_update = true;
			if (typeof(jj.owner) != "undefined"){
				if (jj.owner.em == gap.userinfo.rinfo.em){
					//내가 업로드할 경우는 업로드 하는 서버 함수에서 나의 최종 읽음 시간을 업데이트 하기 때문에 여기서 업데이트 하지 않는다.
					is_update = false;
				}
			}			
			if (jj.type == "ms"){
				//상대방이 메시지를 입력한 경우				
				if (jj.owner.em == gap.userinfo.rinfo.em){
					if (jj.callfrom == "pc"){
						return false;
					}
				}			
				var jinfo = JSON.parse(obj.f1);				
				if (jinfo.edit == "T"){
					var doc = jinfo;
					var date = gap.change_date_localTime_only_date(jinfo.GMT);
					var html = "";					
					//편집일 경우 기존에 있는 응답데이터를 gBody3.select_doc_info.reply에 넣어줘야 Direct_draw함수에서 응답을 그려 줄 수 있다.
					gBody3.select_doc_info = jinfo.res;					
					if (jinfo.doctype == "file"){
						//에디터에서 작성한 첨부가 있는 파일을 편집해서 재 저장한 경우 여기를 타지만 파일로 인식해야 한다.
						doc.fserver = jinfo.res.fserver;
						doc.info = jinfo.res.info;
						doc.upload_path = jinfo.res.upload_path;
						html = gBody3.draw_file(doc, jj.doctype, date);
					}else{
						html = gBody3.draw_msg(doc, jj.doctype, date);
					}					
					var mx = "[" + jj.owner.nm + "] " + jj.content;
					gBody3.direct_draw(html, jinfo.GMT, doc._id, "receive", mx);
					
				}else{
					var html = gBody3.draw_msg(jj, jj.doctype, jj.date);					
					var mx = "[" + jj.owner.nm + "] " + jj.content;
					if (jj.tyx == "notice"){
						gBody3.direct_draw(html, jj.GMT, jj._id.$oid, "receive", mx);
						gap.drawNoticeWork(jj.channel_code);
					}else{
						gBody3.direct_draw(html, jj.GMT, jj._id, "receive", mx);
					}
					
				}
			}else if(jj.type == "fs"){
				//상대방이 파일을 업로드한  경우				
				var html = gBody3.draw_file(jj, jj.date);				
				if ((jj.owner.ky == gap.userinfo.rinfo.ky) && (jj.callfrom == "pc")){					
				}else{
					if (gBody3.post_view_type == "2"){
						//"direct_change_msg" : function (id, html, type){
						var plen = $("#ms_" + id).length;
						if (plen == 0){
							//기준에 표시되지 않은 파일 메시지기 때문에 바로 표시한다.
							var mx = "[" + jj.owner.nm + "] " +  jj.info[0].filename;
							gBody3.direct_draw(html, jj.GMT, jj._id, "receive", mx);
						}else{
							//파일로 수신된 부분의 내용만 변경되는 경우 아래 함수를 탄다
							gBody3.direct_change_msg(jj._id, html, "file");
						}						
					}else{
						var mx = "";
						if (jj.info.length > 1){
							mx = "[" + jj.owner.nm + "] " + jj.content + " (Files : " + jj.info.length + ")";
						}else{
							mx = "[" + jj.owner.nm + "] " + jj.content + " (" + jj.info[0].filename + ")";
						}
						if (jj.tyx == "notice"){
							gBody3.direct_draw(html, jj.GMT, jj._id, "receive", mx);
							gap.drawNoticeWork(jj.channel_code);
						}else{
							gBody3.direct_draw(html, jj.GMT, jj._id, "receive", mx);
						}
						
					}
				}
			}else if (jj.type == "del_msg"){
				//msg타입을 전체 삭제한 경우				
				is_update = false;				
				var id = jj.id;
				var ddx = $("#ms_" + id).attr("data");
				$("#ms_" + id).fadeOut().remove();				
				//date항목을 삭제해야 할지 체크하는 로직입니다.
				var last_className = $("#web_channel_dis_" + ddx).next().attr("class");
				if (last_className != "xman"){
					$("#web_channel_dis_" + ddx).fadeOut().remove();
				}				
			}else if (jj.type == "sr"){
				//상대방이 응답을 저장한 경우				
				if (jj.owner.em == gap.userinfo.rinfo.em){
					if (jj.callfrom == "pc"){
				//		return false;
					}
					var cn = $("#mreplay_" + jj.rid).length;
					if (cn > 0){
						return false;
					}
				}				
				gBody3.tempData = JSON.parse(obj.f1).tempData;				
				var json = JSON.parse(gBody3.tempData);			
				//타켓 문서를 현재 창에서 제거하고 오늘의 마지막으로 이동시킨다... 댓글을 달면 최근 데이터로 업데이트 한다.
				var klen = $("#ms_" + json.channel_data_id).length;
				var date = $("#ms_" + json.channel_data_id).attr("data");			
				if (klen > 0){
					var ccn = $("#web_channel_dis_"+date).parent().find('.xman').length;
					if (ccn > 1){
						var html = $("#ms_" + json.channel_data_id).get(0).outerHTML;					
						if (gBody3.post_view_type == 2){							
						}else{							
							var tmptxt = $("#reply_compose_" + json.channel_data_id).val();							
							$("#ms_" + json.channel_data_id).remove();							
							var len = $("#web_channel_dis_"+date).length;
							if (len > 0){
								//오늘 날짜가 있는 것이다.
								//$(html).insertAfter($("#web_channel_dis_"+date).parent().find('.xman').last());
								$("#web_channel_dis_"+date).parent().append($(html));
							}else{
								//오늘 날짜 항목이 없다.
								var GMT = res.data.GMT;
								var dis_date = gap.change_date_default(gap.change_date_localTime_only_date(GMT));
								var datehtml = "";															
								datehtml += "<div class='date' id='web_channel_dis_"+date+"'><span>"+dis_date+"</span></div>";								
								var hx = $("#channel_list .user-thumb").length;
								if (hx == 0){
									$("#channel_list").html(datehtml);				
								}else{
									$(datehtml).insertAfter($("#channel_list .xman").children().last().parent());
								}								
								$(html).insertAfter($("#web_channel_dis_"+date).last());
							}						
							var otime = gap.change_date_localTime_only_time(json.GMT);
							$("#update_time_" + json.channel_data_id).text(otime);							
							//댓글을 쓰고 있는데 다른 사람이 댓글을 저장한 경우 작성하고 있던 텍스트를 다시 등록해 줘야 한다.							
							gBody3.init_mention_userdata("reply_compose_"+ json.channel_data_id);	
							$("#reply_compose_" + json.channel_data_id).val(tmptxt);
							$("#reply_compose_" + json.channel_data_id).focus();						
							if (gBody3.prevent_auto_scrolling == 2){
								//자동 스크롤을 사용한 경우 최하단으로 내려간다.
								gap.scroll_move_to_bottom_time("channel_list", 200);
							}
						}					
					}
					//Dom객체를 짤라서 마지막에 추가했기 때문에 이벤트를 다시 정리해 줘야 한다.				
					gBody3.__event_init_load();				
				}		
				gBody3.update_reply_list(JSON.parse(obj.f1).data);				
			}else if (jj.type == "dr"){
				//상대방이 응답을 삭제한 경우				
				is_update = false;			
				var reply_id = JSON.parse(obj.f1).reply_id;
				$("#mreplay_" + reply_id).remove();
				$("#reply_" + reply_id).remove();			
				var id = JSON.parse(obj.f1).id;				
				var cnt = $("#ms_"+id).find(".message-reply").children().length;				
				if (cnt == 0 ){
					$("#ms_"+id).find(".message-reply").remove();
				}		
				//응답 건수가 0일 경우 접고 펼치는 부분을 제거해 준다.
				if (cnt == 0){
					$("#r_"+id).parent().parent().find(".fold-btns.repdis").remove();
				}				
				$("#rdis_"+id).text(cnt);
				$("#rcount_" + id).text(cnt);
				$(".comment").parent().find("h2 span").text("(" + cnt + ")");					
				//응답 개수를 다시 계산해야 한다.				
			}else if (jj.type == "mr"){
				//댓글을 수정했을 경우				
				if (jj.owner.em == gap.userinfo.rinfo.em){
					if (jj.callfrom == "pc"){
						return false;
					}
				}				
				var jinfo = JSON.parse(obj.f1);
				var reply_id = jinfo.reply_id;
				$("#mreplay_" + reply_id).remove();
				$("#reply_" + reply_id).remove();
				var id = jinfo.id;				
				var channel_id = id;
				//타켓 문서를 현재 창에서 제거하고 오늘의 마지막으로 이동시킨다... 댓글을 달면 최근 데이터로 업데이트 한다.
				var klen = $("#ms_" + channel_id).length;
				var date = $("#ms_" + channel_id).attr("data");
				if (klen > 0){
					var ccn = $("#web_channel_dis_"+date).parent().find('.xman').length;
					if (ccn > 1){
						var html = $("#ms_" + channel_id).get(0).outerHTML;		
						if (gBody3.post_view_type == 2){								
						}else{
							$("#ms_" + channel_id).remove();							
							var len = $("#web_channel_dis_"+date).length;
							if (len > 0){
								//오늘 날짜가 있는 것이다.
								if ($("#web_channel_dis_"+date).next().length == 0){
									$(html).insertAfter($("#web_channel_dis_"+date));
								}else{
									$(html).insertAfter($("#web_channel_dis_"+date).parent().find('.xman').last());
								}
							}else{
								//오늘 날짜 항목이 없다.
								var GMT = res.data.GMT;
								var dis_date = gap.change_date_default(gap.change_date_localTime_only_date(GMT));
								var datehtml = "";															
								datehtml += "<div class='date' id='web_channel_dis_"+date+"'><span>"+dis_date+"</span></div>";								
								var hx = $("#channel_list .user-thumb").length;
								if (hx == 0){
									$("#channel_list").html(datehtml);				
								}else{
									$(datehtml).insertAfter($("#channel_list .xman").children().last().parent());
								}							
								$(html).insertAfter($("#web_channel_dis_"+date).last());
							}
						}					
						var otime = gap.change_date_localTime_only_time(jj.resdata.GMT);
						$("#update_time_" + jj.id).text(otime);						
						if (gBody3.prevent_auto_scrolling == 2){
							gap.scroll_move_to_bottom_time("channel_list", 200);
						}						
					}
					//Dom객체를 짤라서 마지막에 추가했기 때문에 이벤트를 다시 정리해 줘야 한다.
					gBody3.__event_init_load();
				}			
				jinfo.resdata.edit = "T";
				jinfo.resdata.tempdata = JSON.parse(jinfo.tempdata);			
				gBody3.update_reply_list(jinfo.resdata);				
			}else if (jj.type == "dcf"){
				//상대방이 채널 데이터중에 특정 파일을 삭제한 경우
				var jj = JSON.parse(obj.f1);
				var md5 = jj.del_id;
				var id = jj.id;
				$("#msg_file_" + id + "_" + md5.replace(".","_")).fadeOut().remove();
			}		
			if (gap.focus == false){
				gap.send_alram(jj);
			}		
			//is_update 가 true인 경우는 내가 지금 채널에 신규 메시지가 도착했을때 마지막 읽음 시간을 업데이트 해야 하는 경우이다.
			if (is_update){
				if ( ((cur_channel == jj.channel_code) || (cur_channel == "allcontent") || (cur_channel == "sharecontent"))  ){
					gBody3.channel_read_update(jj.channel_code);
				}			
			}
			if (cur_channel == jj.channel_code){				
			}else{
				if (is_update){
					$("#clist_" + jj.channel_code).html("<span class='ico-new'></span>");
					$("#tab3_sub").html(gap.lang.channel + "<span class='ico-new'></span>");
				}
			}			
		}else{
			//Box 탭 메뉴에 신규 메시지 도착 표시흘 한다.			
			gap.send_alram(jj);				
			var json = JSON.parse(obj.f1);
			var ch_code = json.channel_code;						
			if ((jj.type == "ms" || jj.type == "sr" || jj.type == "fs") && (jj.edit == "F" || jj.edit == "" || typeof(jj.edit) == "undefined")){				
				$("#favorite_channel_list #clist_" + ch_code).html("<span class='ico-new'></span>");
				$("#share_channel_list #clist_" + ch_code).html("<span class='ico-new'></span>");
				if (gBody3){
					gBody3.unread_channel_count_check_realtime(ch_code);
				}
								
				//실시간 수신된 데이터의 업무방에 마지막 등록 시간을 로컬 변수에 업데이트 해야 한다. (안할 경우 메인에 있는 업무방 리스트 보기에서 Refresh버튼 클릭시 읽지 않음 체크가 사라진다.
				var plist = gap.cur_channel_list_info;
				for (var p = 0 ; p < plist.length; p++){
					var itm = plist[p];
					if (itm.type != "folder"){
						if (itm.ch_code == jj.channel_code){
							itm.lastupdate = jj.GMT;
						}
					}					
				}
			}						
			if (obj.id != "del_msg"){
				gap.change_title("","");
				$("#tab3_sub").html(gap.lang.channel + "<span class='ico-new'></span>");
			}
		}
	},
	
	"send_alram" : function(jj){
		return false; //알림센터로 통일한다.
		var alramopt = localStorage.getItem("alramon2");
		if (alramopt == "off"){
			return false;
		}		
		//push를 받지 않는 경우만 True값이 내려온다.
		if (gap.search_webpush_receive_check(jj.channel_code)){
			return false;
		}		
		var title = "";
		if (jj.type == "ms"){
		//	title = "메시지가 등록 되었습니다.";
			title = gap.lang.nmsg;
		}else if (jj.type == "fs"){
			title = gap.lang.reg_file;
		}else if (jj.type == "del_msg"){
		//	title = "컨텐츠가 삭제 되었습니다.";
			title = gap.lang.del_content;
		}else if (jj.type == "sr"){
		//	title = "댓글이 등록 되었습니다.";
			title = gap.lang.reg_reply;
		}else if (jj.type == "dr"){
		//	title = "댓글이 삭제 되었습니다.";
			title = gap.lang.del_reply;
		}else if (jj.type == "mr"){
		//	title = "댓글이 수정 되었습니다.";
			title = gap.lang.modify_reply;
		}else if (jj.type == "dcf"){
		//	title = "파일이 삭제 되었습니다.";
			title = gap.lang.del_file;
		}else if (jj.type == "cc"){
			title = gap.lang.miv;
		}		
		if (typeof(jj.ex) != "undefined"){
			if (jj.ex.type == "channel_meeting"){
				title = gap.lang.video_meet_request;				
			}
		}		
		var body = "";
		if (jj.type == "ms" || jj.type == "fs" || jj.type == "sr" || jj.type == "mr" || jj.type == "cc"){
			//댓글 삭제는 굳이 알리지 않는다.
			var tx = "[" + gap.lang.sharechannel + " : " + jj.channel_name + "]";
			body = title;
		//	var person_img = "";
			var person_img = gap.person_profile_photo(jj.owner)
			var nam = "";	
			if (typeof(jj.owner) != "undefined"){
		//		person_img = "<img src='"+jj.owner.pu+"'>";	
				nam = gap.user_check(jj.owner).name;	
			}					
			var mmx = name + gap.lang.invite_alram;			
			var html = "<div class='webchat-alarm info-alarm' style='cursor:pointer' onclick=\"gBody2.show_channel_data('"+jj.channel_code+"', 'T')\">";
			html += "	<h2><span class='ico'></span>"+gap.lang.info+"</h2>";
			html += "		<div class='user' style='padding-top:8px'>";
			if (typeof(jj.owner) != "undefined"){
				html += "			<div class='user-thumb'>"+person_img+"</div>";
			}			
			html += "			<dl>";
			html += "				<dt>"+tx +"</dt>";
			html += "			</dl>";
			html += "	</div>";
			html += "</div>";
			mmx = html;			
			var isNotificationSupported = "Notification" in window;
			if (isNotificationSupported){
				Notification.requestPermission().then(function(result){
					if (result === "granted"){						
						//gBody3.notification_alram(title, "", "box");
						gap.play_sound();	
						tx = gap.textToHtml(tx);						
						gap.notification_alram_new(tx, body, "channel", jj.channel_code, "", "box", jj);					
					}else{
						//gap.tost_receive(mmx, 10000, "info", nam);	 //info, error, warning, success
					}
				});				
			}else{
				//gap.tost_receive(mmx, 10000, "info", nam);	 //info, error, warning, success
			}
			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		}
	},	
	
	"receive_drive_msg" : function(obj){		
		if (obj.id == "chmng"){
			// 드라이브/채널 html 업데이트
			gBody2.update_drive_channel_html(obj);
			return false;
		}else{			
			var info = JSON.parse(obj.f1);	
			if (info.type == "drive_member"){
				//드라이버에 멤버 추가됨
				gap.send_alram_drive(info);
				gBody2.update_drive_info();				
			}else if (info.type == "drive_upload"){
				//폴더에 파일이 등록된 경우
				gap.send_alram_drive(info);		
			}
		}
	},
	
	"send_alram_drive" : function(jj){	
		if (!gap.search_webpush_receive_check_drive(jj.p_code)){
			//내가 참석자로 등록된 드라이브에 없는 경우 알림을 표시하지 않는다.
			return false;
		}	
		var title = "";
		var body = "";
		if (jj.type == "drive_member"){
			if (jj.title == ""){
				//타이틀 값이 없으면 드라이브에 초대된 경우
				title = "["+gap.lang.mydrive+" : " + jj.p_name + "]" ;
				body = gap.lang.miv;
			}else{
				//특정 폴더에 초대된 경우
				title = "["+gap.lang.mydrive+" : " + jj.p_name + "]";
				body = jj.title + "' " + gap.lang.miv;
			}			
		}else if (jj.type == "drive_upload"){
			if (jj.title == ""){
				title = "["+gap.lang.mydrive+" : " + jj.p_name + "]";
				body = gap.lang.reg_file;
			}else{
				title = "["+gap.lang.mydrive+" : " + jj.p_name + "]";
				body = jj.title + "' " + gap.lang.reg_file;
			}		
		}	
			var person_img = "";
			var nam = "";	
			if (typeof(jj.owner) != "undefined"){
				person_img = "<img src='"+jj.owner.pu+"'>";	
				nam = gap.user_check(jj.owner).name;	
			}					
			var mmx = name + gap.lang.invite_alram;				
			var html = "<div class='webchat-alarm info-alarm' style='cursor:pointer'>";
			html += "	<h2><span class='ico'></span>"+gap.lang.info+"</h2>";
			html += "		<div class='user' style='padding-top:8px'>";
			if (typeof(jj.owner) != "undefined"){
				html += "			<div class='user-thumb'>"+person_img+"</div>";
			}			
			html += "			<dl>";
			html += "				<dt>"+title +"</dt>";
			html += "			</dl>";
			html += "	</div>";
			html += "</div>";
			mmx = html;			
			var isNotificationSupported = "Notification" in window;
			if (isNotificationSupported){
				Notification.requestPermission().then(function(result){
					if (result === "granted"){						
						title = gap.textToHtml(title);
						gap.notification_alram_new(title, body,  "drive", "", "", "box", jj);
					}else{
						//gap.tost_receive(mmx, 10000, "info", nam);	 //info, error, warning, success
					}
				});				
			}else{
				//gap.tost_receive(mmx, 10000, "info", nam);	 //info, error, warning, success
			}
			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//		}
	},	


	
	
	"receive_new_msg" : function(msg){	
			
		gma.click_left_menu = false;
		var xid = gap.encodeid(msg.cid);
		gBody.receive_msg_id = msg.cid;
		
		
		if ((msg.ex) && (msg.ex.notice)){
			//공지가 등록되었음이 수신된 경우 현재 창의 정보와 같으면 업데이트 한다.
			if (msg.cid == gBody.cur_cid){
				gap.read_notice(msg.cid);
			}
			//return false;
		}
		
		if (typeof(msg.ch) != "undefined"){
			//1:N방을 또는 1:1 처음 만들고 첫번째 메시지가 도착했을때 내가 초대되었다고 알려줘야 한다.
			if (gBody.cur_cid != msg.cid){
				var lists = msg.ch.att;
				var senderinfo = "";				
				for (var i = 0 ; i < lists.length; i++){
					var lix = lists[i];
					if (lix.ky == msg.ky){
						senderinfo = lix;
						break;
					}					
				}							
				var name = "";				
				if (gap.cur_el == msg.el){
					name = senderinfo.nm;
				}else{
					name = senderinfo.enm;
					if (name == ""){
						name = senderinfo.nm;
					}
				}				
				if (msg.ky != gap.search_cur_ky()){				
					var nam = name;										
					var person_img = gap.person_profile_photo_by_ky(msg);
					var mmx = name + gap.lang.invite_alram;
					var tx = "[" + gap.lang.chat + " : " + msg.msg + "]";					
					if (!gap.search_is_onetoone_id(msg.cid)){
						//var id = msg.cid.replace(/\^/gi,"_").replace(/\./gi,"-spl-");
						var id = gap.encodeid(msg.cid);
						var html = "<div class='webchat-alarm info-alarm' style='cursor:pointer' onclick=\"gBody.receive_enter_room('"+msg.cid+"', '"+id+"', event)\">";
						html += "	<h2><span class='ico'></span>"+gap.lang.info+"</h2>";
						html += "		<div class='user' style='padding-top:8px'>";
						html += "			<div class='user-thumb'>"+person_img+"</div>";
						html += "			<dl>";
						html += "				<dt>"+tx +"</dt>";
						html += "			</dl>";
						html += "	</div>";
						html += "</div>";
						mmx = html;	
						var isNotificationSupported = "Notification" in window;
						if (isNotificationSupported){
							Notification.requestPermission().then(function(result){
								if (result === "granted"){									
									var pmsg = msg.msg;
									if (msg.cid.indexOf("10139992") > -1){
										pmsg = gBody.receive_elephant;
									}									
									gap.notification_alram("[" + gap.lang.chat + "] " + gap.lang.newmsg, pmsg, "messenger", xid, msg);
								}else{
								//	gap.tost_receive(mmx, 10000, "info", nam);	 //info, error, warning, success
								}
							});							
						}else{
						//	gap.tost_receive(mmx, 10000, "info", nam);	 //info, error, warning, success
						}						
					}						
				}			
			}
		}	
		var mmx = msg.msg;		
		mmx = gap.HtmlToText(mmx);		
		if (msg.ty == "21"){
			//화상회의 초대 메시지 별도 처리
			var lx = mmx.split("-spl-");
			var tpx = lx[0];			
			if (tpx == "mail_link"){
				var mxg =  lx[1];
				mmx = mxg;
			}else{
				mmx = mmx.split("-spl-")[0];
			}		
		}else{
			if (mmx.length > 40){
				mmx = mmx.substring(0,40) + "...";
			}	
		}		
		if (msg.ky != gap.search_cur_ky()){
			if (gap.focus){
				if (gap.curpage == "chat" && gBody.cur_cid == msg.cid){				
				}else{
					gap.change_title("","");
				}	
			}else{
				if (gap.cur_window == "chat" && gBody.cur_cid != msg.cid){
					gap.change_title("","");
				}				
			}			
		}	
		mmx = gap.textToHtml(mmx);
		//현재 오픈된 채팅방의 id와 동일한 방 id로 들어온 메시지의 경우 채팅방에 바로 표시한다.		
		if ( (gap.cur_window == "chat" && gBody.cur_cid == msg.cid) || gma.cur_cid_popup == msg.cid){			
			var chat_key = msg.cid + "_" + msg.sq + "_chat_noti";			
			localStorage.setItem(chat_key, "T");			
			var list = new Array();
			list.push(msg);			
			if (msg.ty == 6){
				//이미지 파일일 경우 썸네일 만드는 시간이 있어 약간의 딜레이를 준다.
				gBody.write_chat_log(list, 'T', "");				
			}else{
				gBody.write_chat_log(list, "T", "");				
			}		
			var key = gap.check_scroll_chat(msg.cid);
			if (key == "2"){
				gap.scroll_move_to_bottom_time(gBody.chat_show, 500);
			}else{
				//스크롤이 마지막 부분이면 토스트를 띄워준다.
				if (gBody.scroll_bottom < 100){					
					var from = msg.nm;
					var msg2 = msg.msg;				
					if (msg.cid.indexOf("10139992") > -1){
						msg2 = gBody.receive_elephant;
					}
					var mx = "[" + from + "] " + msg2;
					mobiscroll.toast({message:mx, color:'info'});				
				}else{
					gap.scroll_move_to_bottom_time(gBody.chat_show, 500);
				}				
			}			
			//해당 메시지를 읽었다는 리턴을 보내준다...
			//다른 기기에서 내가 보낸 메시지는 읽음을 보내지 마라
			if (gap.userinfo.rinfo.ky != msg.ky){
				if (gma.chat_position == "popup_chat"){
					_wsocket.chat_room_read_event(gma.cur_cid_popup, msg.sq);
				}else{
					_wsocket.chat_room_read_event(gBody.cur_cid, msg.sq);
				}				
				//내가 발송한 것이 아니경우 내 화면에 있는 건수를 하나 줄어야 한다.				
				var obj = $("#chat_msg .talk").find("[data-bun='"+msg.sq+"']"); 
				if (obj != null){					
					var count = parseInt($(obj).text());
					var tcount = count - 1;
					if (tcount == 0){
						$(obj).css("display","none");
					}else{
						$(obj).text(tcount);
					}
				}				
				//팝업창의 건수 표시 정리
				var obj = $("#alarm_chat_sub .talk").find("[data-bun='"+msg.sq+"']"); 
				if (obj != null){					
					var count = parseInt($(obj).text());
					var tcount = count - 1;
					if (tcount == 0){
						$(obj).css("display","none");
					}else{
						$(obj).text(tcount);
					}
				}
			}			
			if (msg.ty == 5){
				//일반 파일이 들어왔다.
				var xtim1 = setTimeout(function() {			
					 _wsocket.chat_room_file_list(gBody.cur_cid);
					 clearTimeout(xtim1);
	 			}, 2000);
			}else if (msg.ty == 6){
				//이미지 파일이 신규로 들어왔다.
				var xtim2 = setTimeout(function() {			
					 _wsocket.chat_room_image_list(gBody.cur_cid);
					 clearTimeout(xtim2);
	 			}, 2000);
			}			
		}else{
			//채팅메시지가 신규로 들어왔다는 표시를 해줘야 한다.			
			if (msg.ky != gap.search_cur_ky()){	
				if (gBody){
					gBody.chatroom_new_msg_icon("new");
				}						
				
				
				/*
				var len = $("#unread_count_" + xid).length;
				var ucnt = 1;
				if (len > 0){
					ucnt = parseInt($("#unread_count_" + xid).html()) + 1;
					$("#unread_count_" + xid).html(ucnt);
				}else{
					var xhtml = "<span class='cnt' id='unread_count_"+xid+"'>1</span>";
					$("#chat_new_"+xid).parent().append(xhtml);
				}
				*/
				
				
				// 검색한 후 카운트 표시할 때 안맞는 현상 처리를 위해 전역 변수에서 안읽은 카운트를 가져오도록 변경함
				var $ucnt = $("#unread_count_" + xid);
				var ucnt = 1;
				var chat_info = gap.search_chat_info_cur_chatroom(msg.cid);
				if (chat_info){
					chat_info.ucnt++;
					ucnt = chat_info.ucnt; 
				}else{
					ucnt = 1;
				}
				if ($ucnt.length == 0){
					$ucnt = $("<span class='cnt' id='unread_count_"+xid+"'></span>");
					$("#chat_new_"+xid).parent().append($ucnt);
				}
				$ucnt.html(ucnt);
				

				
				gap.search_cur_chatroom_change_ucnt(msg.cid, ucnt);								
				var nam = msg.nm;
				if (msg.el == ""){
					
				}else if (gap.cur_el != msg.el){
					nam = msg.enm;
				}				
				var id = gap.encodeid(msg.cid);								
				var roomkey = "";
				if (msg.ty == "21"){
					//영상회의 입창요청 메시지의 경우 팝업에서 바로 입장 할 수 있게 처리한다.
					var lx = msg.msg.split("-spl-");
					var tpx = lx[0];
					
					if (tpx == "mail_link"){						
					}else{
						roomkey = msg.msg.split("-spl-")[1];
					}
				}				
				var tx = "[" + gap.lang.chat + " : " + msg.msg + "]";
				var nam = name;										
				var person_img = gap.person_profile_photo_by_ky(msg);
				var id = gap.encodeid(msg.cid);
				var html = "<div class='webchat-alarm info-alarm' style='cursor:pointer' onclick=\"gBody.receive_enter_room('"+msg.cid+"', '"+id+"', event)\">";
				html += "	<h2><span class='ico'></span>"+gap.lang.info+"</h2>";
				html += "		<div class='user' style='padding-top:8px'>";
				html += "			<div class='user-thumb'>"+person_img+"</div>";
				html += "			<dl>";
				html += "				<dt>"+tx +"</dt>";
				html += "			</dl>";
				html += "	</div>";
				html += "</div>";
				var mmx2 = html;				
				var isNotificationSupported = "Notification" in window;
				if (isNotificationSupported){					
					Notification.requestPermission().then(function(result){
						if (result === "granted"){	
							var pmsg = mmx;
							if (msg.cid.indexOf("10139992") > -1){
								pmsg = gBody.receive_elephant;
							}	
							gap.notification_alram("[" + gap.lang.chat + "] " + gap.lang.newmsg, pmsg, "messenger", xid, msg);
						}else{
						//	gap.tost_receive(mmx2, 10000, "info", nam);	 //info, error, warning, success
						}
					});					
				}else{
				//	gap.tost_receive(mmx2, 10000, "info", nam);	 //info, error, warning, success
				}
			}else{				
//				//내가 모바일에서 보낸것도 PC에 읽지 않으면 
//				if (gBody.cur_cid != msg.cid){
//					var len = $("#unread_count_" + xid).length;
//					if (len > 0){
//						$("#unread_count_" + xid).html(parseInt($("#unread_count_" + xid).html()) + 1);
//					}else{
//						var xhtml = "<span class='cnt' id='unread_count_"+xid+"'>1</span>";
//						$("#chat_new_"+xid).parent().append(xhtml);
//					}
//				}			
			}		
			if (msg.ky != gap.userinfo.rinfo.ky){
				//발신자가 내가 아닐 경우만 카운드를 체크한다.
				if (gap.cur_window == "chat" || gap.cur_window == "channel"){
					gBody.unread_chat_count_check_realtime();
				}else{
					//채팅리스를 계산할 수 없는 상황인 경우는 +1해준다.					
					//채팅에서 다른 채팅방의 메시지가 나에게 전송되는 부분을 방어하기 위한 코드를 추가한다. 2022.12.27
					if (gap.chatroom_exist_check(xid.replace(/_/gi,"^"))){
						var chat_cnt = $("#menu_id_3").text();
						if (chat_cnt == ""){
							gap.unread_count_check("3", 1);
						}else{
							gap.unread_count_check("3", parseInt(chat_cnt) + 1);
						}
					}
					////////////////////////////////////////////////////////////									
				}
			}							
		}
		//채팅방 정보를 최적화 시키기 위해 사전작업을 처리한다.
		if (gBody){
			if (msg.ty == 1){
				gBody.last_msg.ty = "msg";
				var xxx = gap.HtmlToText(msg.msg);
				gBody.last_msg.msg = xxx;
				//gBody.last_msg.msg = msg.msg;
			}else if (msg.ty == 21){
				var lx = msg.msg.split("-spl-");
				var tpx = lx[0];			
				if (tpx == "mail_link"){
					var mxg =  lx[1];
					gBody.last_msg.msg = mxg;
				}else{				
					gBody.last_msg.msg = msg.msg.split("-spl-")[0];
				}			
				gBody.last_msg.ty = "msg";
			}else{
				gBody.last_msg.ty = msg.ty;			
				if (msg.ty == 5 || msg.ty == 6){
					 gBody.last_msg.ex = msg;
					 var info = msg.ex;
					 if (typeof(msg.ex.files) != "undefined"){
						 info = msg.ex.files[0];
					 }
					 
					 var fname = info.nm;
					 var url = gap.search_fileserver(info.nid);					
					 var downloadurl = url+ "/filedown" + info.sf + "/" + info.sn + "/" + encodeURIComponent(fname);
			    	 gBody.last_msg.downloadurl = downloadurl;
				}else{
					//gBody.last_msg.msg = msg.msg;
					if (msg.ty == 3){
						//이모티콘
						gBody.last_msg.msg = msg;	
					}else{
						gBody.last_msg.msg = msg.msg;
					}				
				}			
			}	
			gBody.chatroom_info_change_last_msg(msg.sq, msg.cid, msg);	
		}
			
		//gBody.chatroom_draw('main_alarm');	//TODO		
	},

	"notification_alram" : function(title, body, icon, xid, msg){	
		return false;	
		var chat_key = msg.cid + "_" + msg.sq + "_chat_noti";
		var search_key = localStorage.getItem(chat_key);
		//Push 정보 조회
		//채팅에서 다른 채팅방의 메시지가 나에게 전송되는 부분을 방어하기 위한 코드를 추가한다. 2022.12.27
		var is_exist_me = false;
		if (typeof(msg.ch) != "undefined"){
			//최조 생성되고 바로 알림이 오는 경우에 멤버에 포함되어 있는지 체크한다.
			var xlist = msg.ch.att;			
			for (var i = 0 ; i < xlist.length; i++){
				var inp = xlist[i];
				if (inp.ky == gap.userinfo.rinfo.ky){
					is_exist_me = true;
					break;
				}
			}		
		}			
		if (!gap.chatroom_exist_check(xid.replace(/_/gi,"^"))){
			//메시지가 최초 전송된 메시지일 경우 참석자에 본인이 포함되어 있는지 체크한다.	
			if(!is_exist_me){
				//채팅룸이 없고 내가 해당 메시지의 참석자로 등록되어 있지도 않은 경우 
				//채팅서버 쪽에 로그를 남겨야 한다.
				var obj = new Object();				
				//
				obj.ky = gap.userinfo.rinfo.ky;   //수신 받은 사용자 key (string)
				obj.cid = msg.cid;   //5,21인 경우 필수 (string)
				_wsocket.send_error_log(obj);
				return false;
			}			
		}
		////////////////////////////////////////////////////////////		
		var alramopt = localStorage.getItem("alramon2");
		if (alramopt == "off"){
			return false;
		}	
		if (gap.chatroom_push_get(xid.replace(/_/gi,"^"))){
			var title = gap.textToHtml(title); 
		    var body = body;	    
		    var options = {
		   		body: body,
		   	//	icon: 'https://meet.kmslab.com/w.nsf/alram2.png',
		   		icon: cdbpath + '/images/icon/'+icon + ".png",
		   		tag:chat_key,
		   		renotify: false,
		   		requireInteraction: false
		    };		    
		    if (Notification.permission !== 'granted'){
		    	Notification.requestPermission();
		    }else{
		    	 var notification = new Notification(title , options);	
				gap.play_sound();	    	 
		    	notification.onclick = function() {
			      // window.open('http://www.naver.com');
		    		
		    		var url = "";	    		
		    		url = location.protocol + "//" + location.host + location.pathname + "?readform&abc2&" + encodeURIComponent(xid);
		    			    		
		    		window.open(url, "webchat");
			    };
		    }    
		}   
	},	
	
	"notification_alram_new" : function(title, body, type, code1, code2, icon, jj){
		//채널, 드라이브 , To Do에서 알림으 오는 경우		
		//내가 포함된 채널과 업무방이 아닌경우 알림을 표시하지 않는다.		
		return false;
		if (type == "channel" || type == "todo"){
			if (gap.cur_room_search_info(code1) == ""){
				return false;
			}
		}		
		var chat_key = "";
		if (type != "drive"){
			if (typeof(jj._id) == "undefined"){
				chat_key = type + "_" + jj.id + "_chat_noti";
			}else{
				chat_key = type + "_" + jj._id + "_chat_noti";
			}
			
		}
		var alramopt = localStorage.getItem("alramon2");
		if (alramopt == "off"){
			return false;
		}		
	    var title = title 
	    var body = body;    
	    var options = {
	   		body: body,
	   	//	icon: 'https://meet.kmslab.com/w.nsf/alram2.png',
	   		icon: cdbpath + '/images/icon/'+icon + ".png",
	   //		tag:chat_key,   //동일한 알림은 안띄게 할려면 주석을 제거해야 한다.
	   		renotify: false, 
	   		requireInteraction: false
	    };	    
	    if (Notification.permission !== 'granted'){
	    	Notification.requestPermission();
	    }else{
	    	 var notification = new Notification(title , options);	    	 
	    	notification.onclick = function() {	    		
	    		var url = "";
	    		if (code2 == ""){
	    			url = location.protocol + "//" + location.host + location.pathname + "?readform&"+type+"&" + code1;
	    		}else{
	    			url = location.protocol + "//" + location.host + location.pathname + "?readform&"+type+"&" + code1 + "&"  + code2;
	    		}	    		
	    		window.open(url, "webchat");
		    };
	    }    
	},
	
	
	"play_sound" : function(){
		try{			
			var alramopt = localStorage.getItem("alramon");
			if (alramopt == "off"){
				return false;
			}						
			var agent = navigator.userAgent.toLowerCase();
			if ((navigator.appName == "Netscape" && navigator.userAgent.search("Trident") != -1) || (agent.indexOf("msie") != -1)){
				//IE인 경우
				var audio = new Audio('https://t1.daumcdn.net/cfile/tistory/99C850485CDEB1111A?original');
				var playPromise = audio.play();
			}else{
				//IE가 아닌 경우
				$("body").append("<iframe src='https://t1.daumcdn.net/cfile/tistory/99C850485CDEB1111A?original' allow='autoplay' style='dispaly:none' class='ifclass'></iframe>");
				setTimeout(function(){
					$(".ifclass").remove();
				}, 10000);
			}		    			
		}catch(e){}		
	},
	
	"receive_todo_msg" : function(obj){

		var info = JSON.parse(obj.f1);
	
		
		if (info.type == "cs"){
			//cs : Change Status
			if (typeof(gTodo) != "undefined"){
				if (info.p_code != gTodo.cur_todo_code){
					//수신된 프로젝트와 현재 보고 있는 프로젝트가 다르기 때문에 알림 메시지를 띄워준다.
					gap.send_alram_todo(info);
				}else{				
					//현재 화면을 변경해 준다.
					//id값으로 전체 정보를 가져와서 local data를 변경해 주고 리스트 보기 인가 card보기인가 판단해서 뿌려준다.
					if (gTodo){
						gTodo.cur_display_refresh(info.id);		
					}								
				}
			}else{
				gap.send_alram_todo(info);
			}
			
		}else if (info.type == "as"){
			//TODO에 담당자로 지정됨을 알려줍니다.
			if (typeof(gTodo) != "undefined"){
				if (info.p_code != gTodo.cur_todo_code){
					//수신된 프로젝트와 현재 보고 있는 프로젝트가 다르기 때문에 알림 메시지를 띄워준다.
					gap.send_alram_todo(info);
				}else{				
					//현재 화면을 변경해 준다.
					//id값으로 전체 정보를 가져와서 local data를 변경해 주고 리스트 보기 인가 card보기인가 판단해서 뿌려준다.
					gTodo.cur_display_refresh(info.id);					
				}
			}else{
				gap.send_alram_todo(info);
			}

		}else if (info.type == "checklist"){
			//체크리스트에 담당자가 지정될 경우
			gap.send_alram_todo(info);			
		}else if (info.type == "reply"){
			//댓글이 달렸을 경우 수신된다.
			gap.send_alram_todo(info);		
		}else if (info.type == "attach"){
			//첨부파일이 추가되었을 경우 알린다.
			gap.send_alram_todo(info);		
		}else if (info.type == "invite"){
			gap.send_alram_todo(info);	
		}
		
	},
	
	"send_alram_todo" : function(jj){
					
		if (gap.search_webpush_receive_check(jj.p_code)){
			return false;
		}
		
		var title = "";
		var body = "";
		if (jj.type == "cs"){
			//title = "메시지가 등록 되었습니다.";
			var rx = gTodo.code_change_status(jj.status);
			title = "[To Do : " + jj.title + "]"
			body = gap.lang.cs.replace("$s", "'" + rx.txt + "'");
		}else if (jj.type == "as"){
			title = "[To Do : " + jj.p_name + "]";
			body =  jj.title + " - " + gap.lang.csm;
		}else if (jj.type == "checklist"){
			title = "[To Do : " + jj.p_name + "]";
			body =  jj.title + " - " + gap.lang.checklist + " " + gap.lang.csm;
		}else if (jj.type == "reply"){
			title = "[To Do : " + jj.p_name + "]";
			body = jj.title + " - " + gap.lang.reg_reply;
		}else if (jj.type == "attach"){
			title = "[To Do : " + jj.p_name + "]"
			body = jj.title + " - " + gap.lang.reg_file;
		}else if (jj.type == "invite"){
			title = "[To Do : " + jj.title + "]";
			body = gap.lang.miv;
		}
		

	//	if (jj.type != "dr" && jj.type != "del_msg" && jj.type != "dcf"){
			//댓글 삭제는 굳이 알리지 않는다.
	//		title = "[" + jj.p_name + "] \n" + title;
			
			var person_img = "";
			var nam = "";	
			if (typeof(jj.owner) != "undefined"){
				person_img = "<img src='"+jj.owner.pu+"'>";	
				nam = jj.owner.nm;	
			}
					
			var mmx = name + gap.lang.invite_alram;	
			
			var html = "<div class='webchat-alarm info-alarm' style='cursor:pointer'>";
			html += "	<h2><span class='ico'></span>"+gap.lang.info+"</h2>";
			html += "		<div class='user' style='padding-top:8px'>";
			if (typeof(jj.owner) != "undefined"){
				html += "			<div class='user-thumb'>"+person_img+"</div>";
			}
			
			html += "			<dl>";
			html += "				<dt>"+title +"</dt>";
			html += "			</dl>";
			html += "	</div>";
			html += "</div>";
			mmx = html;
			
			var isNotificationSupported = "Notification" in window;
			if (isNotificationSupported){
				Notification.requestPermission().then(function(result){
					if (result === "granted"){
						gap.play_sound();
						
					//	gTodo.notification_alram(title, "", "box");
						title = gap.textToHtml(title);
						gap.notification_alram_new(title, body, "todo", jj.p_code, jj.id, "box", jj);
					}else{
					//	gap.tost_receive(mmx, 10000, "info", nam);	 //info, error, warning, success
					}
				});
				
			}else{
			//	gap.tost_receive(mmx, 10000, "info", nam);	 //info, error, warning, success
			}
			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//		}
	},
	
	"make_mail_url" : function(ms, mf, unid, empno, lan){
		var ms = "mail2/Kmslab/kr"
		var empno = gap.userinfo.rinfo.emp;
		var lan = gap.curLang;
		return "https://one.kmslab.com/wnsf"+ "/(agtCopyDoc)?openAgent&ms="+ms+"&mf="+mf+"&unid="+unid+"&empno=" + empno + "&lan=" + lan;
	},
	
	"todo_filter" : function(opt){
		var url = gap.channelserver + "/todo_filter.km";		
		var data = JSON.stringify({
			"opt" :  opt
		});	
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			data : data,
			success : function(res){
				console.log(res);
			},
			error : function(e){
				gap.error_alert();
			}
		})
	},
	
	"isValidEmail" : function(email){
		if (email.length <= 6 || email.indexOf('@', 0) == -1 || email.indexOf('.',0) == -1 || email.indexOf(".") == email.length-1){
			return false;
		}else{
			return true;
		}
	},
		
	"ajaxCall" : function(url, data, successCallback){
		$.ajax({
	        url: url,
	        type: "POST", // GET, POST, PUT, DELETE 등
	        data: data,   // 요청에 전달할 데이터
	        dataType: 'json', // 응답 데이터 타입 (json, text, html 등)
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
	        success: function(response) {
	            // 성공 시 콜백 호출
	            if (successCallback && typeof successCallback === 'function') {
	                successCallback(response);
	            }
	        },
	        error: function(xhr, status, error) {
	          gap.error_alert();
	        }
	    });
	},
	
	
	"test_call" : function(){
		
		var unids = []
		unids.push("33DD00E1ED36351349258C2F002EA1E7")
		unids.push("D0E58F39D1BB4D1249258C2A002CDA15")
		
		var data = JSON.stringify({
			"unid" : unids,
			"mail_domain" : gptpt.mail_domain
		})
		$.ajax({
		  url: gptpt.plugin_domain_fast + "test/test1", // FastAPI 엔드포인트 주소
		  type: 'POST',
		  data : data,
		  xhrFields: {
		    withCredentials: true // 쿠키를 함께 전송하려면 필요합니다.
		  },
		  success: function(data) {
		    console.log("응답 데이터:", data);
		  },
		  error: function(error) {
		    console.error("에러:", error);
		  }
		});
	},
	
	"test_call2" : function(){
		
		var sq = "from";
		var query = "배희정";
		var startdate = "2025.02.08";
		var enddate = "2025.02.10";
		var opt = "inbox";
		
		var data = JSON.stringify({
			"sq" : sq,
			"mail_domain" : gptpt.mail_domain,
			"query" : query,
			"startdate" : startdate,
			"enddate" : enddate,
			"opt" : opt,
			"call_code" : gptpt.current_code
		});
		
		
		
		
		
		$.ajax({
		  url: gptpt.plugin_domain_fast + "domino/email_search", // FastAPI 엔드포인트 주소
		  type: 'POST',
		  data : data,
		  xhrFields: {
		    withCredentials: true // 쿠키를 함께 전송하려면 필요합니다.
		  },
		  success: function(data) {
		    console.log("응답 데이터:", data);
		  },
		  error: function(error) {
		    console.error("에러:", error);
		  }
		});
	},
	
	
	"test_domino" : function(){
		
		var sq = "from";
		var query = "배희정";
		var startdate = "2025.02.08";
		var enddate = "2025.02.10";
		var opt = "inbox";
		
		var data = JSON.stringify({
			"sq" : sq,
			"mail_domain" : gptpt.mail_domain,
			"query" : query,
			"startdate" : startdate,
			"enddate" : enddate,
			"opt" : opt,
			"call_code" : gptpt.current_code
		});
		
		
		var ssp = new SSE(gptpt.plugin_domain_fast + "domino/email_search", {headers: {'Content-Type': 'application/json; charset=utf-8'},
	            payload:data,
				withCredentials: true,
	            method: 'POST'});

	   	ssp.addEventListener('message', function(e) {	
			console.log(e.data);			
			var pph = e.data.replaceAll("-spl-", "&nbsp;").replaceAll("#@creturn#@","<br>").replaceAll("**","");			
		
		});
		ssp.stream();
		

	},
	
	"test_yutube" : function(){
		
		var key = "ld4TreyuBc4";
		
		var data = JSON.stringify({
			"key" : key
		});
		
		
		$.ajax({
		  url: gptpt.plugin_domain_fast + "yutube/yutube_summary2", // FastAPI 엔드포인트 주소
		  type: 'POST',
		  data : data,
		  xhrFields: {
		    withCredentials: true // 쿠키를 함께 전송하려면 필요합니다.
		  },
		  success: function(data) {
		    console.log("응답 데이터:", data);
		  },
		  error: function(error) {
		    console.error("에러:", error);
		  }
		});
	},
	
	"test_tool" : function(){
		
		var data = JSON.stringify({
			"query" : query
		});
		
		
		$.ajax({
		  url: gptpt.plugin_domain_fast + "apps/select_tool", // FastAPI 엔드포인트 주소
		  type: 'POST',
		  data : data,
		  xhrFields: {
		    withCredentials: true // 쿠키를 함께 전송하려면 필요합니다.
		  },
		  success: function(data) {
		    console.log("응답 데이터:", data);
		  },
		  error: function(error) {
		    console.error("에러:", error);
		  }
		});
	},
	
	"popup_url" : function(url){
		var screenWidth = window.screen.width;
	    var screenHeight = window.screen.height;
	
	    // 팝업 위치 계산 (가운데 정렬)
	    var left = (screenWidth - width) / 2;
	    var top = (screenHeight - height) / 2;
	
		var width = screenWidth;
		var height = screenHeight;
	    // 팝업 창 옵션 설정
	    var options = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
	
	    // 팝업 열기
	    window.open(url, "", options);
	},
	
	"popup_url_office" : function(url){
		var screenWidth = window.screen.width;
	    var screenHeight = window.screen.height;
	
	    // 팝업 위치 계산 (가운데 정렬)
	    var left = (screenWidth - width) / 2;
	    var top = (screenHeight - height) / 2;
	
		var width = screenWidth;
		var height = screenHeight;
	    // 팝업 창 옵션 설정
	    var options = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
	
	    // 팝업 열기
	    window.open(url, "", options);
	},
	
	"containString" : function(arr, searchString){
		return arr.some(function(element){
			return element.includes(searchString);
		});
	},
	
	"history_save" : function(menu){
		var newUrl= root_path + "/v/" + menu;
		window.history.pushState({ path: newUrl }, '', newUrl);
	},
	
	"alarm_center_count_update" : function(receivers, nid){
	//	var url = location.protocol + '//' + location.host + "/noti/alarm/send";
		var url = "https://one.kmslab.com/noti/alarm/send";
		var r = new Object();
		r.ky = receivers;  //Array
		
		var data = JSON.stringify({
			"nid" : nid,
			"r" : r,
			"unrd" : "0",
			"cmd" : "count"
		});	
		$.ajax({
			type : "POST",
			dataType : "json",
			url : url,
			contentType : "application/json; charset=utf-8",
			data : data,
			beforeSend : function(xhr){
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){},
			error : function(e){}
		});
	},	
	
	"alarm_center_msg_save" : function(receivers, nid, sendername, msg, rid, sdata){
		//receivers : array, sendername : str
		
		var url = "https://one.kmslab.com/noti/alarm/send";
		var s = new Object();
		s.nm = sendername;
		s.enm = sendername;
		s.ky = ""; //gap.search_cur_ky();
		var r = new Object();
		r.ky = receivers;  //Array
		
		var _msg = gap.textToHtmlBox(msg);
		_msg = _msg.replace(/<mention[^>]*>|<\/mention>/g, '');
		
		var pdata = sdata;
		var push = new Object();
		push.tle = gap.textToHtml(sdata.title);
		push.msg = _msg;	//gap.textToHtml(msg);
	//	push.ac = sdata.type;
	//	push.type = "box";
		delete sdata.title;
		delete sdata.msg;
		delete sdata.sender;
		sdata.ac = sdata.type;
		sdata.type = "box";
		push.data = sdata;	
		
		var data = JSON.stringify({
			"nid" : nid,
			"s" : s,
			"r" : r,
			"msg" : _msg,	//gap.textToHtml(msg),
			"rid" : rid,
			"push" : push,
			"ex" : pdata
		});	
		$.ajax({
			type : "POST",
			dataType : "json",
			url : url,
			contentType : "application/json; charset=utf-8",
			data : data,
			beforeSend : function(xhr){
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){},
			error : function(e){}
		});
	},
	
	"showDetailUserInfo" : function(userid){
		var _w = 740;
		var _h = 510;
		var _t = window.screen.height /2 - _h/2;
		var _l = window.screen.width /2 - _w/2;
		var url = root_path + "/page/user_profile.jsp?userid=" + userid;

		window.open(url, '', 'top='+_t+',left='+_l+',width='+_w+',height='+_h);
		return;
	},
	
	"checkFileExtension" : function(filename){
		
		var arr = ["doc", "docm", "docx", "dot", "dotm", "dotx", "epub", "fb2", "fodt", "htm", "html", "hwp", "hwpx", "mht", "mhtml", "odt", "ott", "pages", "rtf", "stw", "sxw", "txt", "wps", "wpt", "xml",
		          "csv", "et", "ett", "fods", "numbers", "ods", "ots", "sxc", "xls", "xlsb", "xlsm", "xlsx", "xlt", "xltm", "xltx",
		           "dps", "dpt", "fodp", "key", "odp", "otp", "pot", "potm", "potx", "pps", "ppsm", "ppsx", "ppt", "pptm", "pptx", "sxi",
		           "djvu", "docxf", "oform", "oxps", "pdf", "xps"
		]
		 var hasExtension = false;
		
		  $.each(arr, function(index, extension) {
		    if (filename.toLowerCase().indexOf(extension) > -1) {
		      hasExtension = true;
		      return false; // Found a match, exit the loop
		    }
		  });
		
		  return hasExtension;
	},
	
	"create_office_file" : function(opt, file_info){
		//opt : ppt, word, excel, pdf 4개중 하나여야 한다.
		//file_info 에는 folder 정보와 drive 정보 filename이 포한되어야 한다.
		
		var url = gap.channelserver + "/office_create.km";
		var filename = file_info.filename;
		var dtype = gap.file_icon_check(filename);
		var file_type = filename.split(".").reverse()[0];
		
		var data = JSON.stringify({
			"owner" : gap.userinfo.rinfo,
			"email" : gap.userinfo.rinfo.ky,
			"ky" : gap.userinfo.rinfo.ky,
			"drive_code" : file_info.drive_code,
			"drive_name" : file_info.drive_name,
			"folder_code" : file_info.folder_code,
			"folder_name" : file_info.folder_name,
			"fserver" : gap.channelserver,
			"filename" : filename,
			"file_type" : file_type,
			"dtype" : dtype
		});
		
		gap.ajaxCall(url, data, function(res){
			
			if (res.result == "OK"){
				// Files 리스트 갱신
				gFiles.draw_drive_data(gFiles.cur_page);
				
				// 오피스 파일 팝업으로 띄우기
				var id = res.data.id;
				var url = gap.channelserver + "/office/" + id + "/files";
				gap.popup_url_office(url);
				
			}
		});
		
	},
	
	"create_ppt" : function(){
		var file_info = new Object();
		file_info.drive_code = "680c93ea34817d2fd191387f";
		file_info.drive_name = "onlyoffice";
		file_info.folder_code = "root";
		file_info.folder_name = "";
		file_info.filename = "new.pptx";
		
		gap.create_office_file("ppt", file_info);
	},
	
	"getUserStatus" : function(lists, opt){
		//온라인 상태 표시 - 임시로 체크하는 함수
		if (typeof(lists) == "undefined"){
			return;
		}
		if (lists.length == 0) return;
		//opt : 1:구독  2:종료 3:상태값 한번 만보기
		_wsocket.temp_list_status(lists, 3, opt);		
		// 웹소켓 처리 완료되면 statusCheckResult를 호출함
	},
	
	"speakText" : function(text){
		// 브라우저가 SpeechSynthesis API를 지원하는지 확인
	    if (!window.speechSynthesis) {
	        alert("이 브라우저는 음성 합성을 지원하지 않습니다.");
	        return;
	    }
	
	    const utter = new SpeechSynthesisUtterance(text);
	
	    // 한국어 예시
	    utter.lang = "ko-KR";
	    utter.rate = 1;   // 속도
	    utter.pitch = 1;  // 음높이
	    utter.volume = 1; // 볼륨
	
	    speechSynthesis.speak(utter);
	},
	
	"speakLongText" : function(text){
		 const sentences = text.match(/[^.!?]+[.!?]?/g) || [text];

	    let index = 0;
	
	    function speakNext() {
	        if (index >= sentences.length) return;
	
	        const utter = new SpeechSynthesisUtterance(sentences[index]);
	        utter.lang = "ko-KR";
	
	        utter.onend = () => {
	            index++;
	            speakNext();
	        };
	
	        speechSynthesis.speak(utter);
	    }
	
	    speakNext();
	}
	
	
}





function Flasher(speed) {
  var elem = document.getElementById('changeMe');
  timer = setTimeout(function() {
    elem.href = elem.href ==  'on.png' ? 'off.png' : 'on.png';
  }, speed);
  this.stop = function() { clearTimeout(timer); }
}

jQuery.fn.sort = function() {  
    return this.pushStack( [].sort.apply( this, arguments ), []);  
};  


Date.prototype.today = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();
  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};

Date.prototype.yesterday = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate()-1;

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};
		
 Date.prototype.YYYYMMDDHHMMSS = function () {
    var yyyy = this.getFullYear().toString();
    var MM = gap.pad(this.getMonth() + 1,2);
    var dd = gap.pad(this.getDate(), 2);
    var hh = gap.pad(this.getHours(), 2);
    var mm = gap.pad(this.getMinutes(), 2);
    var ss = gap.pad(this.getSeconds(), 2);
    return yyyy + MM + dd+  hh + mm + ss;
};	
	
Date.prototype.YYYYMMDD = function () {
    var yyyy = this.getFullYear().toString();
    var MM = gap.pad(this.getMonth() + 1,2);
    var dd = gap.pad(this.getDate(), 2);
    return yyyy + MM + dd;
};		
	
Date.prototype.HHMM = function () {   
    var hh = gap.pad(this.getHours(), 2);
    var mm = gap.pad(this.getMinutes(), 2);
    return hh + ":" +  mm ;
};		

window.onpopstate  = function(event){	
	if (event.state != null){		
		if (event.state == "channel"){			
			if (gap.cur_window != "chat"){
				$("#abc2").click();				
				gap.change_location("channel");								
				setTimeout(function(){
					$("#tab3_sub").click();
				}, 1000);
			}else{
				$("#tab3_sub").click();
			}
			
		}else{
			//$("#" + event.state).click();
			gBody.lnb_menu_click(event.state);
		}
		
	}
};


/*
event.preventDefault() : 현재 이벤트의 기본 동작을 중단한다.
event.stopPropagation() : 현재 이벤트가 상위로 전파되지 않도록 중단한다.
event.stopImmediatePropagation() : 현재 이벤트가 상위뿐 아니라 현재 레벨에 걸린 다른 이벤트도 동작하지 않도록 중단한다.
return false : jquery를 사용할 경우 위의 두개 모두를 수행한 것과 같고,
                jquery를 사용하지 않을 경우 event.preventDefault()와 같다.

*/

/* bootstrap-datepicker & gantt init */
/*
!function($) {
	//jQUery UI와 충돌되는 datepicker 명칭 변경
	if($.fn.datepicker.Constructor){
		var dp = $.fn.datepicker.noConflict();
		$.fn.bsdatepicker = dp;
		
		dp.dates.ko = {
			days: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
			daysShort: ["일", "월", "화", "수", "목", "금", "토"],
			daysMin: ["일", "월", "화", "수", "목", "금", "토"],
			months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
			monthsShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
			today: "오늘",
			format: "yyyy-mm-dd",
			titleFormat: "yyyy.mm",
			weekStart: 0
		};
		dp.dates.zh = {
			days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
			daysShort: ["日", "一", "二", "三", "四", "五", "六"],
			daysMin: ["日", "一", "二", "三", "四", "五", "六"],
			months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
			monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
			today: "今天",
			format: "yyyy-mm-dd",
			titleFormat: "yyyy.mm",
			weekStart: 1
		};
		dp.dates.ja = {
			days: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
			daysShort: ["日", "月", "火", "水", "木", "金", "土"],
			daysMin: ["日", "月", "火", "水", "木", "金", "土"],
			months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
			monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
			today: "今日",
			format: "yyyy-mm-dd",
			titleFormat: "yyyy.mm",
			weekStart: 0
		};
		dp.dates.en.titleFormat = "yyyy.mm";

		if(typeof gantt != "undefined"){
			var lang = _i18n.language;
			if(lang == "ko"){
			    gantt.locale = {
			    	date: {
			    	    month_full: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
			    	    month_short: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
			    	    day_full: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
			    	    day_short: ["일", "월", "화", "수", "목", "금", "토"]
		     	    	}
			    }
			}else if(lang == "zh"){
			    gantt.locale = {
				    date: {
			            month_full: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
			            month_short: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
			            day_full: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
			            day_short: ["日", "一", "二", "三", "四", "五", "六"]
			        }
			    }
			}else{
			    gantt.locale = {
				    date: {
				        month_full: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
				        month_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
				        day_full: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
				        day_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
			        }
			    }
			}
			gantt.locale.lang = _i18n.language;
			gantt.date_format = 'h:mmA';
			gantt.type = "mail";
		}

	}	


}(jQuery);
*/

/**
 * NotesName, NamesInfo
 */


(function(){
	if(!window.NotesName){
		window.NotesName = function (name){
			this.keyword = this.origin = name;this.addr821 = "";this.addr822LocalPart = "";this.addr822Phrase = "";this.addr822Phrase2 = "";
			this.addr822Comment1 = "";this.addr822Comment2 = "";this.addr822Comment3 = "";
			this.abbreviated = "";this.canonical = "";this.common = "";this.country = "";
			this.abbreviated2 = "";this.canonical2 = "";
			this.isHierarchical = false;this.isInternetAddress = false;
			this.organization = "";this.orgUnit1 = "";this.orgUnit2 = "";this.orgUnit3 = "";this.orgUnit4 = "";
			this.domain = "";
			if(NotesName.REGEXP_RFC822.test(this.origin)){ /* rfc822 */
				var match = this.origin.match(NotesName.REGEXP_RFC822);
				this.addr822Phrase2 = this.addr822Phrase = match[1].trim();
				if(NotesName.REGEXP_RFC822Phrase.test(this.addr822Phrase2)){
					var mt = this.addr822Phrase2.match(NotesName.REGEXP_RFC822Phrase);
					this.addr822Phrase2 = mt[1];
				}
				this.addr821 = match[2].trim();
				this.addr822LocalPart = match[3].trim();
				this.domain = match[4].trim();
				this.canonical2 = this.abbreviated2 = this.canonical = this.abbreviated = this.origin.trim();
				this.common = this.addr822Phrase;
				this.addr822Comment1 = (match[5]||"").trim();
				this.addr822Comment2 = (match[6]||"").trim();
				this.addr822Comment3 = (match[7]||"").trim();
				this.isInternetAddress = true;
			}else{ /* rfc821 or hierarchical or flat */
				var localpart = this.origin;
				if(this.origin.indexOf("@") != -1){
					localpart = this.addr822LocalPart = this.origin.substring(0, this.origin.indexOf("@")).trim();
					this.domain = this.origin.substring(this.origin.indexOf("@") + 1).trim();
				}
				if(this.origin.indexOf("@") != -1 && localpart.indexOf("/") == -1){/* rfc821 */
					this.canonical2 = this.canonical = this.abbreviated2 = this.abbreviated = this.addr821 = this.origin.trim();
					this.common = localpart;
					this.isInternetAddress = true;
				}else if(localpart.indexOf("/") == -1){ /* flat */
					this.common = this.canonical2 = this.canonical = this.abbreviated2 = this.abbreviated = this.origin.trim();
				}else{ /* hierarchical */
					this.isHierarchical = true;
					isAbbreviated = true;
					if(this.origin.indexOf("@") != -1) this.addr821 = this.origin.trim();
					var hierarch = localpart.split("/");
					var hierarchType = [];		
					for(var i = 0; i < hierarch.length; i++){
						if(hierarch[i].indexOf("=") != -1){
							isAbbreviated = false;
							hierarchType.push(hierarch[i].substring(0, hierarch[i].indexOf("=")).trim().toUpperCase());
							hierarch[i] = hierarch[i].substring(hierarch[i].indexOf("=") + 1).trim();
						}else{
							hierarchType.push("");
						}
					}
					/* 泥섏쓬��臾댁“嫄�CN�쇰줈 �몄떇. */
					this.common = hierarch.shift();
					hierarchType.shift();
					hierarch = hierarch.reverse();
					hierarchType = hierarchType.reverse();
					if(!isAbbreviated) this.keyword = hierarch.join("\\");
					if(hierarch.length > 1 && (hierarchType[0] == "C" || hierarch[0].length == 2)){ /* C */
						this.country = hierarch.shift();
						hierarchType.shift();
					}
					this.organization = hierarch.shift();
					var orgUnitsA = [], orgUnits = [];
					if(hierarch.length >= 1){
						for(var i = 1; i <= 4; i++){
							if(hierarch[i - 1]){
								orgUnits.push("OU=" + hierarch[i - 1]);
								orgUnitsA.push(hierarch[i - 1]);
								this["orgUnit" + i] = hierarch[i - 1];
							}
						}
					}
					orgUnitsA = orgUnitsA.reverse();orgUnits = orgUnits.reverse();
					this.canonical2 = this.canonical = "CN=" + this.common + (orgUnits.length != 0?"/" + orgUnits.join("/"):"") + "/O=" + this.organization + (this.country?"/C=" + this.country:"");
					this.abbreviated2 = this.abbreviated = this.common + (orgUnits.length != 0?"/" + orgUnitsA.join("/"):"") + "/" + this.organization + (this.country?"/" + this.country:"");
					if(this.domain){
						this.canonical += "@" + this.domain;
						this.abbreviated += "@" + this.domain;
					}
				}
			}
		}
		NotesName.REGEXP_RFC822 = /("[\S\s]*"|[^<]*)?\s*<(([^@]+)@([^>]+))>(?:\s*\(([^\)]*)\))?(?:\s*\(([^\)]*)\))?(?:\s*\(([^\)]*)\))?/;
		NotesName.REGEXP_RFC822Phrase = /"([\S\s]*)"/;
	}
    if (!window.NamesInfo) {
        window.NamesInfo = function(info, lang) {
            info = !info ? [] : info;
            info = typeof info == "string" ? $.parseJSON(info) : info;
            this.map = {};
            this.arr = [];
            this.lang = lang;
            this.init(info);
        };
        window.NamesInfo.prototype = {
            'init': function(info, saved) {
                for (var i = 0; i < info.length; i++) {
                    var item = info[i];
                    delete item.saved;
                    if (saved) item.saved = true;
                    this._addItem(item);
                }
            },
            '_addItem': function(item, override) {
                var flag = false,
                    hasItem = false,
                    ext = false;
                var oldItem = this.getItem(item);
                var insertItem = item;
                if (oldItem && override) {
                    $.extend(oldItem, item);
                }
                if (oldItem) {
                    insertItem = oldItem;
                    hasItem = true;
                }
                if (item.notesid) {
                    var nm = new NotesName(item.notesid);
                    if (nm.addr821 && !nm.isHierarchical) {
                        if (!this.map[nm.addr821.toLowerCase()]) {
                            this.map[nm.addr821.toLowerCase()] = insertItem;
                            flag = true;
                        }
                    } else {
                        if (!this.map[nm.abbreviated2.toLowerCase()]) {
                            this.map[nm.abbreviated2.toLowerCase()] = insertItem;
                            flag = true;
                        }
                    }
                }
                if (item.email) {
                    var nm = new NotesName(item.email);
                    if (nm.addr821) {
                        if (!this.map[nm.addr821.toLowerCase()]) {
                            this.map[nm.addr821.toLowerCase()] = insertItem;
                            flag = true;
                        }
                    }
                }
                if (flag && !hasItem) this.arr.push(insertItem);
                return insertItem;
            },
            'getItem': function(data) {
                var nm = data instanceof NotesName ? data : new NotesName(typeof data == 'string' ? data : (data.notesid || data.email || data._notesid || data._email));
                return this.map[((nm.addr821 && !nm.isHierarchical ? nm.addr821 : nm.abbreviated2) || '-').toLowerCase()];
            },
            'add': function(data, override, saved) {
                var item = null;
                if (data.notesid || data.email) {
                    item = {
                        type: data.type || '',
                        notesid: data.notesid || '',
                        name: data.name || '',
                        ename: data.ename || '',
                        email: data.email || '',
                        lang: data.lang || ''
                    };
                    if (saved) item.saved = true;
                    return this._addItem(item, override);
                } else if (data._notesid && data._email) {
                    item = {
                        type: data._type || '',
                        notesid: data._notesid || '',
                        name: data._name || '',
                        ename: data._ename || '',
                        email: data._email || '',
                        lang: data._lang || ''
                    };
                    if (saved) item.saved = true;
                    return this._addItem(item, override);
                }
            },
            'add_fullinfo': function(item, override) {
                return this._addItem({
                    'type': item.type || item._type || '',
                    'notesid': item.notesid || item._notesid || '',
                    'name': item.name || item._name || '',
                    'ename': item.ename || item._ename || '',
                    'post': item.post || item._post || '',
                    'epost': item.epost || item._epost || '',
                    'duty': item.duty || item._duty || '',
                    'eduty': item.eduty || item._eduty || '',
                    'orgname': item.orgname || item._orgname || '',
                    'eorgname': item.eorgname || item._eorgname || '',
                    'company': item.company || item._company || '',
                    'ecompany': item.ecompany || item._ecompany || '',
                    'email': item.email || item._email || '',
                    'lang': item.lang || item._lang || ''
                }, override);
            },
            'getRFC822': function(key) {
                var item = this.getItem(key);
                if (!item) return null;
                var nm = new NotesName(item.email || item.notesid || item.name);
                var name = item.name;
                if (item.ename && item.lang && item.lang != this.lang) name = item.ename;
                if (nm.addr821 && !nm.isHierarchical)
                    if (name)
                        return '"' + name.replace(/\"/g, '').replace(/\s*,\s*/g, " ") + '" <' + nm.addr821 + '>';
                    else return nm.addr821;
                else
                    return nm.abbreviated2;
            },
            'getName': function(keys) {
                var self = this;

                function _getName(key) {
                    var nm = new NotesName(key);
                    var item = self.getItem(nm);
                    if (item) {
                        var name = item.name;
                        if (item.ename && item.lang && item.lang != self.lang) name = item.ename;
                        return name || nm.common;
                    } else {
                        return nm.common;
                    }
                }
                if (typeof keys == 'string') {
                    return _getName(keys);
                } else {
                    var arr = [];
                    for (var i = 0; i < keys.length; i++) arr.push(_getName(keys[i]));
                    return arr;
                }
            },
            'getDispName': function(keys) {
                var self = this;

                function _getDispName(key) {
                    var disp = '';
                    var nm = new NotesName(key);
                    var _item = self.getItem(nm);
                    if (!_item) return nm.abbreviated2;
                    if (nm.addr821 && !nm.isHierarchical) {
                        return self.gerRFC822(nm);
                    } else if (_item.lang && _item.lang != info.lang) {
                        disp = (_item.ename || (new NotesName(_item.notesid || _item.email)).common || '-') +
                            (_item.epost ? ' - ' + _item.epost : '') +
                            (_item.eduty ? ' [' + _item.eduty + ']' : '') +
                            (_item.eorgname ? '/' + _item.eorgname : '') +
                            (_item.ecompany ? '/' + _item.ecompany : '')
                    } else {
                        disp = (_item.name || (new NotesName(_item.notesid || _item.email)).common || '-') +
                            (_item.post ? ' - ' + _item.post : '') +
                            (_item.duty ? ' [' + _item.duty + ']' : '') +
                            (_item.orgname ? '/' + _item.orgname : '') +
                            (_item.company ? '/' + _item.company : '')
                    }
                    return disp;
                }
                if (typeof keys == 'string') {
                    return _getDispName(keys);
                } else {
                    var arr = [];
                    for (var i = 0; i < keys.length; i++) arr.push(_getDispName(keys[i]));
                    return arr;
                }
            },
            'toString': function() {
                var arr = [];
                for (var i = 0; i < this.arr.length; i++) {
                    var item = $.extend({}, this.arr[i]);
                    delete item.saved;
                    if (item.notesid || item.email) arr.push(item);
                }
                return JSON.stringify(arr);
            },
            'saveString': function(_names) {
                var arr = [];
                var addeditem = {};

                for (var i = 0; i < this.arr.length; i++) {
                    if (this.arr[i].saved) {
                        var item = $.extend({}, this.arr[i]);
                        if (item.notesid || item.email) {
                            delete item.saved;
                            if (!addeditem[item.notesid]) arr.push(item);
                            addeditem[item.notesid] = true;
                        }
                    }
                }
                for (var i = 0; i < _names.length; i++) {
                    var nm = _names[i].trim();
                    if (nm) {
                        var item = this.getItem(_names[i]);
                        if (item) {
                            if (!addeditem[item.notesid]) arr.push(item);
                            addeditem[item.notesid] = true;
                        }
                    }
                }
                return JSON.stringify(arr);
            },
            'clear': function() {
                this.destroy();
                this.map = {};
                this.arr = [];
            },
            'destroy': function() {
                delete this.map;
                delete this.arr;
            }
        };
    }
})();

/**
 * 조직도 Popup
 */
(function(){
	var _Org = function(){
		this.isInit = false;
	};
	var _OrgActionCount = 0;
	function _init(self){
		self.blockEl = $('#blockui');
		self.layer = $('<div class="card-panel layer-popup iframe org" style="display:none;z-index:1510">');
		self.layer.appendTo(document.body);
		self.isInit = true;
	}
	_Org.prototype = {
		show:function(_opt, _actions){
			var self = this;
			if(!this.isInit) _init(this);
			if ($('.layer-popup.iframe.org').length == 0) _init(this);
			if(!_actions) _actions = {};
			var actionId = "ACT_" + (_OrgActionCount++);
			_actions.hide = (function(actid){
				var _actid = actid;
				return function(){
					//gap.hideBlock();
					self.layer.hide();
					self.layer.empty();
					delete window.ORG_ACTION[_actid];
				}
			})(actionId);
			window.ORG_ACTION[actionId] = {
				options: _opt, 
				action: _actions,
				lang: gap.curLang,//info.lang,
				companycode: window.companycode,//info.companycode,
				mailpath: window.mailfile,//info.mail_file,
				fulldept: gap.full_dept_codes().replace(/-spl-/gi, "^"),	//info.fulldept,
				server: window.mailfile.split('/')[0],      //info.mail_file.split('/')[0]
				org_type : (_opt.show_ext == true ? "etc_all" : "etc")   
			};
			self.layer.append('<iframe src="' + window.root_path + '/page/org_popup.jsp?org_type=' + window.ORG_ACTION[actionId].org_type + '&act=' + actionId + '&lang=' + gap.curLang + '" style="width:100%;height:100%;"></iframe>');
			//self.layer.append('<iframe src="' + cdbpath + '/org?readform&org_type=etc&act=' + actionId + '&lang=' + gap.curLang + '" style="width:100%;height:100%;"></iframe>');
			//self.layer.append('<iframe src="/dswdvmail01/mail/resource/lib.nsf/org_etc?readform&act=' + actionId + '&lang=' + gap.curLang + '" style="width:100%;height:100%;"></iframe>');
            //gap.showBlock();
			var max_idx = gap.maxZindex();
			this.layer
			.css(_opt.single?{'width':'400px','max-width':'400px','height':'550px','zIndex': parseInt(max_idx) + 1}:{'width':'870px','max-width':'870px','height':'550px','zIndex': parseInt(max_idx) + 1})
			.show()
			.position({
				my: 'center',
				at: 'center',
				of: window
			});
		}
	};
	window.ORG_ACTION = {};
	window.ORG = new _Org();
})();


jQuery.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
  return this.each(function(){
    var clicks = 0, self = this;
    jQuery(this).click(function(event){
      clicks++;
      if (clicks == 1) {
        var xtim8 = setTimeout(function(){
          if(clicks == 1) {
            single_click_callback.call(self, event);
          } else {
            double_click_callback.call(self, event);
          }
          clicks = 0;
          clearTimeout(xtim8);
        }, timeout || 300);
      }
    });
  });
}