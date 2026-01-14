// 서비스 정의
//		const	SVC_TYPE_LOGIN			= 1;    // 로그인 관련
//	    const	SVC_TYPE_LOGOUT			= 2;	// 로그아웃 관련
//	    const	SVC_TYPE_STATUS			= 3;	// 상태 관련
//	    const	SVC_TYPE_ROUTEXGW		= 4;	// 타IMGW 전달 관련
//	    const	SVC_TYPE_COMMUNICATION  = 5;    // 대화 관련(TEXT채팅, 다자간 TEXT채팅, 화상회의 등)
//	    const	SVC_TYPE_FILETRANS		= 6;	// 파일전송 관련
//	    const	SVC_TYPE_ANNOUNCE		= 7;	// 공지사항 관련
//	    const	SVC_TYPE_SEARCH			= 8;	// 검색 관련
//	    const	SVC_TYPE_STORAGE		= 9;	// 스토리지 관련
//	    const	SVC_TYPE_COMMUNITYLOG   = 10;	// Community로그 관련
//	    const	SVC_TYPE_INNERPROTOCOL  = 1000;	// 서비스 프로토콜과는 다르게 내부적으로 사용되어지는 프로토콜
//		const	SVC_TYPE_TEST   		= 9999;	// 테스트용
//		
//		// 서비스 상세정의
//		// 로그인 관련
//		const 	SSVC_TYPE_LOGIN_REQ		= 1;    // 로그인 요청(user -> service)
//	    const 	SSVC_TYPE_LOGIN_RES		= 2;	// 로그인 결과(service -> user)
//		
//		// 로그아웃 관련
//	    const 	SSVC_TYPE_LOGOUT_REQ	= 1;    // 로그아웃 요청(user -> service)
//	    const 	SSVC_TYPE_LOGOUT_NOTI	= 2;	// 로그아웃 알림(service -> user)
//	    const 	SSVC_TYPE_DISCONN_NOTI	= 3;	// 연결비정상종료 보고(IMMX -> service)
//	    const 	SSVC_TYPE_LOGOUT_REP	= 4;	// 로그아웃 보고(service-> imgw -> service)
//		// 상태관련
//	    const 	SSVC_TYPE_STATUSCHG_REQ = 1;    // 상태변경 요청(user -> service)
//
//	    // 구독관련
//	    const 	SSVC_TYPE_SUBREG_REQ	= 100;  // 구독 요청(user -> service)
//	    const 	SSVC_TYPE_SUBDEL_REQ	= 101;	// 구독종료 요청(user -> service)
//
//	    // 상태 노티관련
//	    const 	SSVC_TYPE_STATUSCHG_NOTI= 200;  // 상태변경 알림(service -> user)
//	    const 	SSVC_TYPE_STATUSCUR_RES = 201;  // 현재상태 알림(service -> user)


function _websocket(){		
	this._ws = null;
	this._time = null;
}


_websocket.prototype ={

	"init_websocket" : function(){	
		
		_self = this;
		gap.check_locale();
		console.log("WebSocket Connect : " + gap._ws_cur_sever);
		this._ws = new WebSocket("wss://"+ gap._ws_cur_sever);
		this._ws.binaryType = "arraybuffer"; 
		
		this._ws.onopen = function(evt){
			_wsocket.onOpen(evt);
		},
		this._ws.onclose = function(evt){			
			_wsocket.onClose(evt);
		},
		this._ws.onmessage = function(evt){
			_wsocket.onMessage(evt);
		},
		this._ws.onerror = function(evt){
			_wsocket.onError(evt);
		}	
	},
	
	"onOpen" : function(evt){
		_self.login();		
	},
	
	"onClose" : function(evt){
		gap.gAlert("네트워크 끊어짐...");
		setTimeout(function(){
			_wsocket._time = _wsocket.init_websocket();
		}, 5000);
	},
	
	"onError" : function(evt){
		//console.log("에러 : "  + evt.data);
	},
		
	"encodeUTF8" : function(s){
		var i = 0, bytes = new Uint8Array(s.length * 4);
		for (var ci = 0; ci != s.length; ci++) {
			var c = s.charCodeAt(ci);
			if (c < 128) {
				bytes[i++] = c;
				continue;
			}
			if (c < 2048) {
				bytes[i++] = c >> 6 | 192;
			} else {
				if (c > 0xd7ff && c < 0xdc00) {
					if (++ci >= s.length)
						throw new Error('UTF-8 encode: incomplete surrogate pair');
					var c2 = s.charCodeAt(ci);
					if (c2 < 0xdc00 || c2 > 0xdfff)
						throw new Error('UTF-8 encode: second surrogate character 0x' + c2.toString(16) + ' at index ' + ci + ' out of range');
					c = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
					bytes[i++] = c >> 18 | 240;
					bytes[i++] = c >> 12 & 63 | 128;
				} else bytes[i++] = c >> 12 | 224;
				bytes[i++] = c >> 6 & 63 | 128;
			}
			bytes[i++] = c & 63 | 128;
		}
		return bytes.subarray(0, i);
	},
	
	"decodeUTF8" : function(bytes){
		var i = 0, s = '';
		while (i < bytes.length) {
			var c = bytes[i++];
			if (c > 127) {
				if (c > 191 && c < 224) {
					if (i >= bytes.length)
						throw new Error('UTF-8 decode: incomplete 2-byte sequence');
					c = (c & 31) << 6 | bytes[i++] & 63;
				} else if (c > 223 && c < 240) {
					if (i + 1 >= bytes.length)
						throw new Error('UTF-8 decode: incomplete 3-byte sequence');
					c = (c & 15) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63;
				} else if (c > 239 && c < 248) {
					if (i + 2 >= bytes.length)
						throw new Error('UTF-8 decode: incomplete 4-byte sequence');
					c = (c & 7) << 18 | (bytes[i++] & 63) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63;
				} else throw new Error('UTF-8 decode: unknown multibyte start 0x' + c.toString(16) + ' at index ' + (i - 1));
			}
			if (c <= 0xffff) s += String.fromCharCode(c);
			else if (c <= 0x10ffff) {
				c -= 0x10000;
				s += String.fromCharCode(c >> 10 | 0xd800);
				s += String.fromCharCode(c & 0x3FF | 0xdc00);
			} else throw new Error('UTF-8 decode: code point 0x' + c.toString(16) + ' exceeds UTF-16 reach');
		}
		return s;
	},
	
	"mergeBuffer" : function(buffer1, buffer2){
		var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
		tmp.set(new Uint8Array(buffer1), 0);
		tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
		return tmp.buffer;
	},
	
	"onMessage" : function(e){	
	
		if (e.data instanceof ArrayBuffer) { 
			// string received instead of a buffer 
			var data = e.data;
			var dv = new DataView(data);
			var svType = dv.getInt16(0, true);
			var ssvType = dv.getInt16(2, true);
			
			// json 추출
			var buffer = new Uint8Array(e.data, 20);
			var disp = _self.decodeUTF8(buffer);
				
			var jsonInfo = JSON.parse(disp);
			
			
			console.log("========== Receive data ==============");
			console.log("service type: " + svType);
			console.log("sub service type: " + ssvType);
			console.log(jsonInfo);
			
			
			
			if (svType == "1" && ssvType == "2"){
				//로그인 할때 채팅 서버에 정보를 한번만 등록해 놓는다.
				gap.sgwxid = dv.getInt8(4, true);
				gap.smxid = dv.getInt8(5, true);
				gap.sft = dv.getInt8(6, true);
				gap.sr1 = dv.getInt8(7, true);
				gap.suid = dv.getInt16(8, true);
				gap.scid = dv.getInt16(10, true);
				
				gap.dgwxid = dv.getInt8(12, true);
				gap.dmxid = dv.getInt8(13, true);
				gap.dft = dv.getInt8(14, true);
				gap.dr1 = dv.getInt8(15, true);
				gap.duid = dv.getInt16(16, true);
				gap.dcid = dv.getInt16(18, true);
				
				//로그인 이후에 최초 수행 되어야 하는 함수들 호출 한다.
				
				gap.userinfo.rinfo = jsonInfo.ct;				
				_wsocket.load_etc_info();
				
				
				
		

			}else if (svType == "9" && ssvType == "32"){
				//기타 정보 로딩시 호출되는 경우		
				
				
				if (jsonInfo.ek == "favorite_list"){					
					gBody.favorite_draw(jsonInfo);
				}else{
					
					gap.etc_info = jsonInfo;				
					gap.load_init_mobile2();			
					//내상태 변경하기
					
					
				//	gap.my_profile_status(jsonInfo.ct.st, "");
						
					
					///////// 상태 등록한다. /////////////////////////////
					var obj = new Object();
					obj.id = gap.search_cur_ky();
					obj.st = gap.userinfo.rinfo.st;
					gap.status_change(obj);
					/////////////////////////////////////////////////	
				}

			}else if (svType == "9" && ssvType == "34"){
				//기타 정보 저장하고 난 이후 호출되는 경우			
			//	console.log("기타 정보 저장하고 난 이후 호출되는 함수")
				if (jsonInfo.ek == "Favorite"){
					_wsocket.load_favorite_list();
				}else if (jsonInfo.ek == "change_locale_languse"){
					
					location.reload();
				}
				
			}else if (svType == "9" && ssvType == "35"){
				//기타 정보 변경 사항 알림의 경우
			//	console.log("기타 정보 변경 사항 알림의 경우")
				
				//상태변경 내용만 저장한다.
				gap.etc_info.ct.om1 = jsonInfo.om1;
				gap.etc_info.ct.om2 = jsonInfo.om2;
				gap.etc_info.ct.om3 = jsonInfo.om3;
				gap.etc_info.ct.om4 = jsonInfo.om4;
				gap.etc_info.ct.om5 = jsonInfo.om5;
				gap.etc_info.ct.am1 = jsonInfo.am1;
				gap.etc_info.ct.am2 = jsonInfo.am2;
				gap.etc_info.ct.am3 = jsonInfo.am3;
				gap.etc_info.ct.am4 = jsonInfo.am4;
				gap.etc_info.ct.am5 = jsonInfo.am5;
				gap.etc_info.ct.dm1 = jsonInfo.dm1;
				gap.etc_info.ct.dm2 = jsonInfo.dm2;
				gap.etc_info.ct.dm3 = jsonInfo.dm3;
				gap.etc_info.ct.dm4 = jsonInfo.dm4;
				gap.etc_info.ct.dm5 = jsonInfo.dm5;
								
		
			}else if (svType == "9" && ssvType == "9"){
				//그룹 추가에 대한 응답		
				if (jsonInfo.ek == "no_load"){				
				}else{
					_wsocket.load_buddy_list();
				}
			}else if (svType == "100" && ssvType == "3"){

				gBodyM.receive_box_msg(jsonInfo);
			}
		}
	},
	
	"disabled_remove" : function(id, mx){
		
		$("#"+id).removeClass("disabled");
		$("#"+id).attr("mid",mx);
		$("#" + id).find(".btn-chat-resend").remove();
		
		$("#" + id).attr("mdata",mx);
	
		$("#br_" + id).attr("id", "br_" + mx);
		
		//time 부분에 있는 data값을 실제 서버에 저장된 sq값으로 전환해 준다. 상대방이 읽었을 경우 읽음 처리해 주기 위해서 key값을 sq로 통일한다.
		$(".time[data="+id+"]").attr("data",mx);
		
		if ($("#" + id).next().attr("class") == "time"){
			$("#" + id).next().attr("data", mx);
		}
		
		
		$("#ico-new_"+id).attr("data", "ico-new_" + mx);
		
		if ($("#"+id).next().attr("class") == "time"){
			var xxo = $("#"+id).next();
			var oobx = $(xxo).find(".ico-new");
			$(oobx).attr("data",mx);
			$(oobx).attr("id","ico-new_"+mx);
		}	
		
		//////////////////////////////////////////////////////////////////////////////////
	},
	
	"sendMsg" : function(obj, st, sst){
		
		
		/*
		cid: "s^KM0035^KM9999"
		ek: "KM0035_1591771972966_61636"
		el: "kor"
		enm: "Kim Yun Ki"
		ky: "CN=KM0035 김윤기,O=Kmslab,C=kr"
		msg: "잘하자"
		nm: "김윤기"
		ty: 1
		v: "2.0.0"
		 */
		
		var buffer = new ArrayBuffer(20);
		var dataview = new DataView(buffer);
		

		
		//웹소케 서비스 호출 Code를 잘 지정해 줘야 한다.
		dataview.setInt16(0, st, true);	 // Service Type
		dataview.setInt16(2, sst, true);   // Sub Service Type
		/////////////////////////////////////////////////////////
				
		// src iuid
		dataview.setInt8(4, gap.dgwxid, true);
		dataview.setInt8(5, gap.dmxid, true);
		dataview.setInt8(6, gap.dft, true);
		dataview.setInt8(7, gap.dr1, true);
		dataview.setInt16(8, gap.duid, true);
		dataview.setInt16(10, gap.dcid, true);
		
		
		
						
		var str = JSON.stringify(obj);		
		
		var buffer2 = _self.encodeUTF8(str);		
		var buffer3 = _self.mergeBuffer(buffer, buffer2);
		
		_wsocket._ws.send(buffer3);
		
	},
	
	"login" : function(){	
		
		var loginObj = new Object();
		loginObj.v = "2.0.0";
		loginObj.id = gap.userinfo.userid;
		//loginObj.id = gap.userinfo.email;
		loginObj.p = "";
		loginObj.ft = 20;
		loginObj.mv = "3.0.0.0";
		loginObj.lg = gap.curLang;
		loginObj.ei = "";	
	
		_self.sendMsg(loginObj, 1, 1);	
			
	},
	
	"logout" : function(){

		var loginObj = new Object();
		loginObj.v = "2.0.0";
		loginObj.id = gap.userinfo.userid;
		loginObj.cz = 0;
		_self.sendMsg(loginObj, 2, 1);	
	},
	
	"load_buddy_list" : function(opt){	
		//버디리스트 가져오기
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		if (opt == "no_load"){
			sendObj.ek = "no_load";
		}
		_self.sendMsg(sendObj, 9, 1);	
		
	},
	
	"load_chatroom_list" : function(opt){	
		//채팅룸 리스트 가져오기
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		if (opt == "popup"){
			sendObj.ek = "popup";
		}else{
			sendObj.ek = "default";
		}		
		_self.sendMsg(sendObj, 5, 41);	
	},
	
	
	"save_chatroom_title" : function(opt){	
		//채팅룸 리스트 가져오기
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = opt.cid;
		sendObj.tle = opt.title;
		sendObj.ek = "save_chatroom_title";
				
		_self.sendMsg(sendObj, 5, 101);	
	},
	
	
	"load_etc_info" : function(){	
		//일반 정보 가져오기
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.sg = ['om1', 'om2', 'om3', 'om4', 'om5', 'am1', 'am2','am3', 'am4', 'am5', 'dm1','dm2','dm3', 'dm4', 'dm5','enter','fav','loc','lg'];
		_self.sendMsg(sendObj, 9, 31);			
	},
	
	"load_favorite_list" : function(){
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.sg = ['fav'];
		sendObj.ek = "favorite_list";
		_self.sendMsg(sendObj, 9, 31);	
	},

	"add_group" : function(name){
		
		var sendObj = new Object();
		var sendname = new Object();
		sendname.nm = name;
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "a";
		sendObj.src = sendname;
		_self.sendMsg(sendObj, 9, 8);	
	},
	
	"delete_group" : function(name){
		var sendObj = new Object();
		var sendname = new Object();
		sendname.nm = name;
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "d";
		sendObj.src = sendname;
		_self.sendMsg(sendObj, 9, 8);
	},
	
	"close_group" : function(name){
		//{"v": "2.0.0","ky": "CN=김도영,OU=softk2019,O=APG","ty": "o","src": {"o": ["testcase1","testcase2"],"c": ["testcase3"]}}
		var sendObj = new Object();
		var close_group = new Object();
		close_group.c = [name];
		close_group.o = [""];
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "o";
		sendObj.src = close_group;
		sendObj.ek = "no_load";

		_self.sendMsg(sendObj, 9, 8);
	},
	
	"open_group" : function(name){
		//{"v": "2.0.0","ky": "CN=김도영,OU=softk2019,O=APG","ty": "o","src": {"o": ["testcase1","testcase2"],"c": ["testcase3"]}}
		var sendObj = new Object();
		var open_group = new Object();
		open_group.o = [name];
		open_group.c = [""];
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "o";
		sendObj.src = open_group;
		sendObj.ek = "no_load";

		_self.sendMsg(sendObj, 9, 8);
	},
	
	"close_group_all" : function(){
	
		var sendObj = new Object();
		var close_group = new Object();
		
		var oob = gap.buddy_list_info.ct.bl;
		var arr = new Array();
		for (var i = 0 ; i < oob.length; i++){
			var spl = oob[i];
			arr.push(spl.nm)
		}
		
		close_group.c = arr;
		close_group.o = [""];
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "o";
		sendObj.src = close_group;
		sendObj.ek = "no_load";

		_self.sendMsg(sendObj, 9, 8);
	},
	
	"open_group_all" : function(){
		var sendObj = new Object();
		var open_group = new Object();
		var oob = gap.buddy_list_info.ct.bl;
		var arr = new Array();
		for (var i = 0 ; i < oob.length; i++){
			var spl = oob[i];
			arr.push(spl.nm)
		}
		open_group.o = arr;
		open_group.c = [""];
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "o";
		sendObj.src = open_group;
		sendObj.ek = "no_load";
	
		_self.sendMsg(sendObj, 9, 8);
	},
	
	"change_group" : function (srcname, changename){
		//{"v": "2.0.0","ky": "CN=김도영,OU=softk2019,O=APG", "ty": "r","src": {"nm": "testcase1"}, "dest":"testcase2"}
		var sendObj = new Object();
		var opt = new Object();
		opt.nm = srcname;

		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "r";
		sendObj.src = opt;
		sendObj.dest = changename;

		_self.sendMsg(sendObj, 9, 8);
	},
	
	"move_person" : function(srcname, user, targetname){
		//{"v": "2.0.0","ky": "CN=김도영,OU=softk2019,O=APG","ty": "m","src": {"nm": "testcase1","usr": [{"ky": "CN=백성호,OU=dune22,O=APG","nm": "백성호"}]},"dest": "testcase2"}
		var sendObj = new Object();
		var opt = new Object();
		var username = gap.search_username(user);
	
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "m";
		sendObj.src = {"nm": srcname,"usr": [{"ky": user,"nm": username}]};;
		sendObj.dest = targetname;
	
		_self.sendMsg(sendObj, 9, 8);
	},
	
	"copy_person" : function(user, targetname){
		//Copy는 추가와 동일한 로직을 태운다... copy와 Add가 동일한 함수를 호출한다.
		//{"v": "2.0.0","ky": "CN=김도영,OU=softk2019,O=APG","ty": "a","src": {"nm": "testcase1","usr": [{"ky": "CN=김윤기,OU=ygkim2019,O=APG","nm": "김윤기"}]}}
		var sendObj = new Object();
		var opt = new Object();
		var username = gap.search_username(user);
	
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "a";
		sendObj.src = {"nm": targetname,"usr": [{"ky": user,"nm": username}]};;
		_self.sendMsg(sendObj, 9, 8);
	},
	
	"delete_person_all_group" : function(user){
		//{"v": "2.0.0","ky": "CN=김도영,OU=softk2019,O=APG", "ty": "d","src": {"usr":[{"ky": "CN=백성호,OU=dune22,O=APG","nm": "백성호"}]}}
		var sendObj = new Object();
		var opt = new Object();
		var username = gap.search_username(user);
	
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "d";
		sendObj.src = {"usr": [{"ky": user,"nm": username}]};;
		_self.sendMsg(sendObj, 9, 8);
	},
	
	"delete_person_only_this_group" : function(srcname, user){
		//{"v": "2.0.0","ky": "CN=김도영,OU=softk2019,O=APG", "ty": "d","src": {"nm": "testcase1", "usr":[{"ky": "CN=백성호,OU=dune22,O=APG","nm": "백성호"}]}}
		var sendObj = new Object();
		var opt = new Object();
		var username = gap.search_username(user);
	
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "d";
		sendObj.src = {"nm": srcname,"usr": [{"ky": user,"nm": username}]};;
		_self.sendMsg(sendObj, 9, 8);
	},
	
	"search_user_one_for_popup" : function(uid){
		//{"v": "2.0.0","ty": "ky", "ky": ["CN=김도영,OU=softk2019,O=APG","CN=김윤기,OU=ygkim2019,O=APG"]}
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ty = "ky";
		sendObj.lg = gap.curLang;
		sendObj.cpc = gap.search_cur_cpc();
		sendObj.ky = [uid];
		_self.sendMsg(sendObj, 8, 1);
	},
	
	"search_user_one_for_profile" : function(uid){
		
		//{"v": "2.0.0","ty": "ky", "ky": ["CN=김도영,OU=softk2019,O=APG","CN=김윤기,OU=ygkim2019,O=APG"]}
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ty = "ky";
		sendObj.lg = gap.curLang;
		sendObj.cpc = gap.search_cur_cpc();
		sendObj.ky = [uid];
		sendObj.ek = "profile";
		_self.sendMsg(sendObj, 8, 1);
	},
	
	"search_user_one_for_popup_layer" : function(uid){
	
		//{"v": "2.0.0","ty": "ky", "ky": ["CN=김도영,OU=softk2019,O=APG","CN=김윤기,OU=ygkim2019,O=APG"]}
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ty = "ky";
		sendObj.lg = gap.curLang;
		sendObj.cpc = gap.search_cur_cpc();
		sendObj.ky = [uid];
		sendObj.ek = "userpopup";
		_self.sendMsg(sendObj, 8, 1);
	},
	
	"search_user_top_frame" : function(str, start){
		
		//{"v": "2.0.0","ky": "CN=김도영,OU=softk2019,O=APG","ty": "kw",  "cra": {"kw": "길동","skp": "50","lmt": "50"}}
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ty = "kw";
		sendObj.lg = gap.curLang;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cpc = gap.search_cur_cpc();
		sendObj.cra = {"kw": str ,"skp": start,"lmt": 20, "ep" : true}
		sendObj.ek = "topsearch";
		
		_self.sendMsg(sendObj, 8, 1);
	},
	
	"search_user_make_chat" : function(str, start){
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ty = "kw";
		sendObj.lg = gap.curLang;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cpc = gap.search_cur_cpc();
		sendObj.cra = {"kw": str ,"skp": start,"lmt": 20, "ep" : true}
		sendObj.ek = "makechat";
		_self.sendMsg(sendObj, 8, 1);
	},
		
	"search_user_memo_sendto" : function(str, start){
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ty = "kw";
		sendObj.lg = gap.curLang;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cpc = gap.search_cur_cpc();
		sendObj.cra = {"kw": str ,"skp": start,"lmt": 20, "ep" : true}
		sendObj.ek = "memosendto";
		_self.sendMsg(sendObj, 8, 1);
	},
	
	"search_user_addmember" : function(list){
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ty = "ky";
		sendObj.ky = list;
		sendObj.lg = gap.curLang;
		sendObj.cpc = gap.search_cur_cpc();
	//	sendObj.cra = {"kw": str ,"skp": start,"lmt": 20, "ep" : true}
		sendObj.ek = "addmember";
		_self.sendMsg(sendObj, 8, 1);
	},
	
	
	"search_user_makeroom" : function(list){
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ty = "ky";
		sendObj.ky = list;
		sendObj.lg = gap.curLang;
		sendObj.cpc = gap.search_cur_cpc();
	//	sendObj.cra = {"kw": str ,"skp": start,"lmt": 20, "ep" : true}
		sendObj.ek = "makeroom";
		_self.sendMsg(sendObj, 8, 1);
	},
	
	
	
	
	
	
	"change_enter_opt" : function(opt){
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		
		sendObj.enter = String(opt);
		sendObj.ek = "change_ennter_opt";
		_self.sendMsg(sendObj, 9, 33);
	},
	
	"change_locale_languse" : function(locale, language){
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();		
		sendObj.loc = locale;
		sendObj.lg = language;
					
		sendObj.ek = "change_locale_languse";
		_self.sendMsg(sendObj, 9, 33);
	},
	
	
	
	"change_status_setting" : function(){
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();		
		
		
		var om_exist = false;
		var am_exist = false;
		var dm_exist = false;
		for (var  i = 1 ; i <=5 ; i++){
			var lx1 =  gTop.temp_status_list["om" + i];
			sendObj["om" + i] = lx1;
			if (lx1 != ""){
				om_exist = true;				
			}
		}
		for (var  i = 1 ; i <=5 ; i++){
			var lx2 = gTop.temp_status_list["am" + i];
			sendObj["am" + i] = lx2;
			if (lx2 != ""){
				am_exist = true;				
			}
		}
		for (var  i = 1 ; i <=5 ; i++){
			var lx3 = gTop.temp_status_list["dm" + i];
			sendObj["dm" + i] = lx3;
			if (lx3 != ""){
				dm_exist = true;				
			}
		}

		sendObj.ek = "change_status_setting";
		_self.sendMsg(sendObj, 9, 33);
		
		var cur_status = gap.userinfo.rinfo.st;
		var cur_status_msg = gap.userinfo.rinfo.msg;
		var cur_index = gap.cur_status_index;
		//동일 상태에 상태값이 하나도 없으면 공백으로 변경해 주고 , 해당 index에 값이 변경되었으면 변경된 값으로 바꿔준다.
		if (cur_status == "1"){
			if (om_exist == false){
				if (cur_status_msg != ""){	
					_wsocket.change_status_new(cur_status, "");
				}				
			}else{
				if (cur_index != ""){
					if (cur_status_msg != gap.etc_info.ct[cur_index]){
						_wsocket.change_status_new(cur_status, gap.etc_info.ct[cur_index]);
					}
				}
			}
		}else if (cur_status == "2"){
			if (am_exist == false){
				if (cur_status_msg != ""){	
					_wsocket.change_status_new(cur_status, "");
				}				
			}else{
				if (cur_index != ""){
					if (cur_status_msg != gap.etc_info.ct[cur_index]){
						_wsocket.change_status_new(cur_status, gap.etc_info.ct[cur_index]);
					}
				}
			}
		}else if (cur_status == "3"){
			if (dm_exist == false){
				if (cur_status_msg != ""){
					_wsocket.change_status_new(cur_status, "");
				}				
			}else{
				if (cur_index != ""){
					if (cur_status_msg != gap.etc_info.ct[cur_index]){					
						_wsocket.change_status_new(cur_status, gap.etc_info.ct[cur_index]);
					}
				}

			}
		}		
	},
	
	

	
	
	
	
	
	
	
	
	
	"add_favorite" : function(uid, opt){
		//opt : add 추가 , del 삭제
		
		
		var name = gap.search_username(uid);
		var list = gap.favorite_list;
			
		//기존에 즐겨찾기 사용자가 5명일 경우 추가가 들어오면 첫사용자를 제거하고 마지막에 추가한다.
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();

		if (opt == "a"){
			if (typeof(list) != "undefined" && list.length > 4){				
				//즐겨찾기 사용자가 5명일 경우 하나를 지우고 추가해야 한다.
				gap.gAlert(gap.lang.favoriteAlert);
			}else{
				sendObj.fav = {"ty": opt ,"ky": uid, "vl" : name}
				sendObj.ek = "Favorite";
				_self.sendMsg(sendObj, 9, 33);
			}
		}else if (opt == "d"){
			var name = "";
			for (var i = 0 ; i < list.length; i++){
				var llx = list[i];
				if (llx.ky == uid){
					if (gap.curLang == "ko"){
						name = llx.nm;
					}else{
						name = llx.enm;
					}
				}
			}
			
			
			var msg = name + gap.lang.hoching + gap.lang.isDelete;
 			$.confirm({
 				title : "Confirm",
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
					text : gap.lang.OK,
					btnClass : "btn-default",
					action : function(){
						//확인을 클릭한 경우
					sendObj.fav = {"ty": opt ,"ky": uid, "vl" : name}
					sendObj.ek = "Favorite";
					_self.sendMsg(sendObj, 9, 33);
						
					}
				},
				cancel : {
					keys: ['esc'],
					text : gap.lang.Cancel,
					btnClass : "btn-default",
					action : function(){
						
					}
				}
 				}
 			});
		}
			
	},
	
//	"make_room_id" : function(uid){
//		//1:1일때만 룸키를 이렇게 생성한다.
//		debugger;
//		var tuid = uid;
//		var cuid = gap.search_cur_ky();
//		var tuidc = gap.seach_canonical_id(tuid);
//		var cuidc = gap.seach_canonical_id(cuid);
//		
//		tuidc = tuidc.replace(/_/gi,"-lpl-");
//		cuidc = cuidc.replace(/_/gi,"-lpl-");
//		
//		var id = "";
//		
//		if ( (cuidc == "") || (tuidc=="")){
//			gap.error_alert();
//			return false;
//		}
//	
//		if (tuidc > cuidc) {
//			id = "s^" + cuidc + "^" + tuidc;
//		}else{
//			id = "s^" + tuidc + "^" + cuidc;
//		}
//		return id;
//		
//	},
	
	
	
	"make_room_id" : function(uid){
		
		//1:1일때만 룸키를 이렇게 생성한다. kmslab 적용시 신규 작성
		
		var tuid = uid;
		var cuid = gap.search_cur_ky();
		var tuidc = gap.seach_canonical_id(tuid);
		var cuidc = gap.seach_canonical_id(cuid);
		
		tuidc = tuidc.replace(/_/gi,"-lpl-");
		cuidc = cuidc.replace(/_/gi,"-lpl-");
		
		var id = "";
		
		if ( (cuidc == "") || (tuidc=="")){
			gap.error_alert();
			return false;
		}
	
		if (tuidc > cuidc) {
			id = "s^" + cuidc + "^" + tuidc;
		}else{
			id = "s^" + tuidc + "^" + cuidc;
		}
		return id;
		
	},
	
	"chatroom_exist_check" : function (uid){
		
	},
	
	"make_chatroom_11" : function(uid){
		
		var tuid = uid;
		var cuid = gap.search_cur_ky();
		var tuidc = gap.seach_canonical_id(tuid);
		var cuidc = gap.seach_canonical_id(cuid);
		
		var tuname = gap.search_username(tuid);
		var cuname = gap.search_username(cuid);
		var id = "";
	
		var id = _self.make_room_id(uid);
		//기존에  uid 채팅방이 있는지 검색한다.
		id = id.replace(/-lpl-/gi,"_");
		
		id = id + "^" + gap.userinfo.rinfo.cpc;
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = id ;				//s^사용자ID^사용자ID
		sendObj.cty = 1;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = [{"ky": tuid,"nm": tuname},{"ky": cuid,"nm": cuname} ];
		sendObj.ek = "make_chatroom_11";
		
		//console.log(sendObj);
		_self.sendMsg(sendObj, 5, 1);
	},
	
	
	"make_chatroom_11_invite" : function(uid){
		
		var tuid = uid;
		var cuid = gap.search_cur_ky();
		var tuidc = gap.seach_canonical_id(tuid);
		var cuidc = gap.seach_canonical_id(cuid);
		
		var tuname = gap.search_username(tuid);
		var cuname = gap.search_username(cuid);
		var id = "";
	
		var id = _self.make_room_id(uid);
		//기존에  uid 채팅방이 있는지 검색한다.
		id = id.replace(/-lpl-/gi,"_");
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = id ;				//s^사용자ID^사용자ID
		sendObj.cty = 1;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = [{"ky": tuid,"nm": tuname},{"ky": cuid,"nm": cuname} ];
		sendObj.ek = "make_chatroom_11_invite";
		
		console.log(sendObj);
		_self.sendMsg(sendObj, 5, 1);
	},
	
	"make_chatroom_11_only_make" : function(uid){
		var tuid = uid;
		var cuid = gap.search_cur_ky();
		var tuidc = gap.seach_canonical_id(tuid);
		var cuidc = gap.seach_canonical_id(cuid);
		
		var tuname = gap.search_username(tuid);
		var cuname = gap.search_username(cuid);
		var id = "";
	
		var id = _self.make_room_id(uid);
		//기존에  uid 채팅방이 있는지 검색한다.
		id = id.replace(/-lpl-/gi,"_");		
		id = id + "^" + gap.userinfo.rinfo.cpc;
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = id ;				//s^사용자ID^사용자ID
		sendObj.cty = 1;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = [{"ky": tuid,"nm": tuname},{"ky": cuid,"nm": cuname} ];
		sendObj.ek = "make_chatroom_11_only_make";
		_self.sendMsg(sendObj, 5, 1);
	},
	
	
	
	"make_chatroom_1N" : function(att){
	
	//	var tuid = uid;
		var cuid = gap.search_cur_ky();		
		var cuidc = gap.seach_canonical_id(cuid);
		
		var d = new Date();
        var ckey = d.YYYYMMDDHHMMSS();
		var id = "n^" + cuidc + "^" + ckey;
		id = id.replace(/-lpl-/gi,"_");
		
		id = id + "^" + gap.userinfo.rinfo.cpc;
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = cuid;
		sendObj.cid = id ;				//s^사용자ID^사용자ID
		sendObj.cty = 100;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = att;
		sendObj.ek = "make_chatroom_1N";
		_self.sendMsg(sendObj, 5, 1);
	},
	
	"load_chatlog_list" : function(cid){	
		//채팅대화내역 가져오기
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.lmt = 20;
		sendObj.ek = "load_chatlog_list";
		
		_self.sendMsg(sendObj, 5, 51);	
		
	}, 
	
	"load_chatlog_list_continue" : function(cid, lastid){	
		//채팅대화내역 가져오기
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.sq = lastid;  //int
		sendObj.dr = false;
		sendObj.lmt = 30;
	//	console.log(sendObj);
		sendObj.ek = "load_chatlog_list_continue";
		_self.sendMsg(sendObj, 5, 51);	
		
	}, 
	
	"send_chat_msg" : function(obj){
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		
//		0	:	구분 없음(검색 전용)																																																																														
//		1	:	일반 메시지																																																																														
//		2	:	시스템 메시지																																																																														
//			- 사용자입장 : "e 사용자key:사용자명:직급"																																																																															
//			- 사용자퇴장 : "l 사용자key:사용자명:직급"																																																																															
//		3	:	url 포함 메시지 (ogtag)																																																																														
//		4	:	일반 파일 정보 메시지																																																																														
//		5	:	이미지 파일 정보 메시지																																																																														
//		6	:	동영상 파일 정보 메시지																																																																														
//		7	:	음원 파일 정보 메시지																																																																														
//		8	:	그외 지원불가 형식
		
		sendObj.nm = gap.userinfo.rinfo.nm;
		sendObj.enm = gap.userinfo.rinfo.enm;
		sendObj.el = gap.userinfo.rinfo.el;
		
		sendObj.cid = obj.cid;
		var msg = obj.msg.replace(/[\n]/gi,"\r\n");
		sendObj.msg = msg;
		sendObj.ek = obj.mid;
		sendObj.ty = obj.ty;
		
		if (typeof(obj.ex) != "undefined"){
			sendObj.ex = obj.ex;
		}
		
		if (obj.cid.indexOf("person^") > -1){
			alert("개발자가 찾고 있던 버그 상황입니다. 어떤 파일을 어떻게 전송할려고 한것인지 웹메신저 개발자에게 알려주세요");
		}
		_self.sendMsg(sendObj, 5, 21);	
	},
	
	"attend_chatroom" : function(obj){		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		
		sendObj.cid = obj.cid;
		sendObj.att = obj.att;
		sendObj.ek = "attend_chatroom";
		
		_self.sendMsg(sendObj, 5, 5);
	},
	
	"chat_room_file_list" : function(cid){
		
		if (cid != ""){			
			var sendObj = new Object();
			sendObj.v = "2.0.0";
			sendObj.ky = gap.search_cur_ky();
			sendObj.cid = cid;
			sendObj.ty = 5;
			sendObj.lmt = 6;
			sendObj.skp = 0;
			sendObj.dr = false;
			sendObj.ek = "chat_room_file_list";
			_self.sendMsg(sendObj, 5, 51);	
		}
	},
	
	"chat_room_image_list" : function(cid){
		
		if (cid != ""){		
			var sendObj = new Object();
			sendObj.v = "2.0.0";
			sendObj.ky = gap.search_cur_ky();
			sendObj.cid = cid;
			sendObj.ty = 6;
			sendObj.lmt = 6;
			sendObj.skp = 0;
			sendObj.dr = false;
			sendObj.ek = "chat_room_image_list";
			_self.sendMsg(sendObj, 5, 51);	
		}	
	},
		
	"chat_room_file_list_right_frame" : function(cid, skp_idx){
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.ty = 5;
		sendObj.lmt = 30;
		sendObj.skp = skp_idx;
		sendObj.dr = false;
		sendObj.ek = "chat_room_file_list_right_frame";
		_self.sendMsg(sendObj, 5, 51);	
	},
	
	"chat_room_image_list_right_frame" : function(cid, skp_idx){
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.ty = 6;
		sendObj.lmt = 30;
		sendObj.skp = skp_idx;
		sendObj.dr = false;
		sendObj.ek = "chat_room_image_list_right_frame";
		_self.sendMsg(sendObj, 5, 51);	
	},
	
	"chat_room_link_list_search_right_frame" : function(kw, skp_idx){
		//og tag 링크 검색
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
	//	sendObj.cid = cid;
	//	sendObj.tr = "a";
		sendObj.ty = [4];
		sendObj.kw = kw;
		sendObj.skp = skp_idx;
		sendObj.lmt = 10;
		if (kw == ""){
			sendObj.ek = "chat_room_link_search_right_frame";
		}else{
			sendObj.ek = "chat_room_link_search_result_right_frame";
		}
		_self.sendMsg(sendObj, 8, 7);	
	},	
	
	"chat_room_read_event" : function(cid, sq){
		//채팅방에 
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.sq = sq;
		sendObj.ek = "chat_room_read_event";
		_self.sendMsg(sendObj, 5, 45);	
	},
	
	"chat_room_file_search_right_frame" : function(cid, ty_arr, ext_arr, kw, lmt_cnt, skp_idx){
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = (cid == "ext_filter" ? "" : cid);
		sendObj.ty = ty_arr;
		sendObj.tr = "a";
		sendObj.ext = ext_arr;
		sendObj.kw = kw;
		sendObj.lmt = lmt_cnt;
		sendObj.skp = skp_idx;
		if (cid == ""){
			// 전체 파일 검색
			if (kw == ""){
				if (ty_arr == 6){	//photo
					sendObj.ek = "image_attach_search_right_frame";
					
				}else if (ty_arr == 5){	//file
					sendObj.ek = "file_attach_search_right_frame";
				}
				
			}else{
				if (ty_arr == 6){	//photo
					sendObj.ek = "image_attach_search_result_right_frame";
					
				}else if (ty_arr == 5){	//file
					sendObj.ek = "file_attach_search_result_right_frame";
				}
			}
			
		}else if (cid == "ext_filter"){
			// 확장자 검색용
			if (ty_arr == 6){	//photo
				sendObj.ek = "image_attach_ext_search_result_right_frame";
				
			}else if (ty_arr == 5){	//file
				sendObj.ek = "file_attach_ext_search_result_right_frame";
			}
			
		}else{
			// 채팅방 파일 더보기
			if (ty_arr == 6){	//photo
				sendObj.ek = "chat_room_image_attach_search_right_frame";
				
			}else if (ty_arr == 5){	//file
				sendObj.ek = "chat_room_file_attach_search_right_frame";
			}
		}
		_self.sendMsg(sendObj, 8, 4); 
	},
	
	"channel_files_list" : function(lmt_cnt, skp_idx){
		var ty_arr = [5, 6];
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = "";
		sendObj.ty = ty_arr;
		sendObj.tr = "a";
		sendObj.ext = "";
		sendObj.kw = "";
		sendObj.lmt = lmt_cnt;
		sendObj.skp = skp_idx;
		sendObj.ek = "channel_files_result";
		_self.sendMsg(sendObj, 8, 4); 
	},	
	 
	"chat_room_out_event" : function(cid){
		//채팅방 나가기 이벤트
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		if (cid == "all"){
			sendObj.ty = "all";
		}else{
			sendObj.ty = "ch";
			cid = cid.replace("-spl-",".");
			sendObj.cid = [cid];
		}
		sendObj.ek = "chat_room_out_event_" + cid;
		_self.sendMsg(sendObj, 5, 31);	
	},
	
	"send_memo_noti" : function(memo_id, key, name, email, rcv_arr, title, content, file_info){
		//쪽지 발송 시 수신자에게 보내는 알림
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.id = memo_id;
		sendObj.ky = key;
		sendObj.nm = name;
		sendObj.em = email;
		sendObj.usr = rcv_arr;
		sendObj.tle = title;
		sendObj.ct = content;
		sendObj.fd = file_info;
		sendObj.ek = "send_memo_noti";
		_self.sendMsg(sendObj, 7, 1); 		
	},
	
	"delete_msg" : function(cid, sq){
		//메시지 삭제
		
		
		if (sq == ""){
			return false;
		}
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.sq = sq;
		sendObj.ek = "delete_msg";
		_self.sendMsg(sendObj, 5, 61);	
	},
	
	"buddy_list_status" : function(){
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = 1;
		sendObj.op = 1
		sendObj.ek = "buddy_list_status";
		_self.sendMsg(sendObj, 3, 101);	
	},
	
	"temp_list_status" : function(lists, opt, ty){
		
		//lists 등록할 상용자 ky값, opt : 1:구독  2:종료
		//ty값에 따라 어디서 요청한 것인지 판단한다.
		if (lists.length == 0){
			return false;
		}
		
	
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = 2;
		sendObj.op = opt;
		sendObj.sb = lists;
		sendObj.ek = ty;
		_self.sendMsg(sendObj, 3, 103);	
	},
	
	"change_status" : function (st){
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.st = st;
		sendObj.ek = "change_status";
		_self.sendMsg(sendObj, 3, 1);	
		
		_wsocket.session_msg(st, "");
	},
	
	"change_status_new" : function (st, msg){
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();		
		sendObj.st = st;				
		sendObj.msg = msg;
		sendObj.ek = "change_status";		
		_self.sendMsg(sendObj, 3, 1);
		
		_wsocket.session_msg(st, msg);
	},
	
	"session_msg" : function(opt1, opt2){
		//일단 사용하지 않는다.
		
		try{
			sessionStorage.setItem("status", opt1);
			sessionStorage.setItem("msg", opt2);
					
			
			gap.userinfo.rinfo.st = opt1;
			gap.userinfo.rinfo.msg = opt2;
			
			gap.search_status_index(opt2);
			
			
			$("#my_status").text(opt2);
			
		}catch(e){}		
	},
	
	"save_chatroom_title" : function(opt){	
		//채팅룸 리스트 가져오기
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = opt.cid;
		sendObj.tle = opt.title;
		sendObj.ek = "save_chatroom_title";
				
		_self.sendMsg(sendObj, 5, 101);	
	},
	
	"send_box_msg" : function(obj, id){		
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.id = id;
		sendObj.ky = obj.sender;
		sendObj.ty = gap.search_cur_ky();
		sendObj.ft = [20];
		sendObj.f1 = JSON.stringify(obj);
		_self.sendMsg(sendObj, 100, 1);
	},

	"send_todo_msg" : function(obj){		
		if (obj.sender != ""){
			var sendObj = new Object();
			sendObj.v = "2.0.0";
			sendObj.id = "todo";
			sendObj.ky = obj.sender;
			sendObj.ty = gap.search_cur_ky();
			sendObj.ft = [20];
			sendObj.f1 = JSON.stringify(obj);
			_self.sendMsg(sendObj, 100, 1);
		}
		
	},
	
	"send_drive_msg" : function(obj){		
		if (obj.sender != ""){
			var sendObj = new Object();
			sendObj.v = "2.0.0";
			sendObj.id = "drive";
			sendObj.ky = obj.sender;
			sendObj.ty = gap.search_cur_ky();
			sendObj.ft = [20];
			sendObj.f1 = JSON.stringify(obj);
			_self.sendMsg(sendObj, 100, 1);
		}

	}
	

}
