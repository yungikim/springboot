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
	this.connect = true;
	this.version = "2.0.1";
	this.log = true;
}


_websocket.prototype ={

	"init_websocket" : function(){			
		_self = this;

		gap.check_locale();
		console.log("WebSocket Connect : " + gap._ws_cur_sever);		
		var mserver = mailserver.toLowerCase();		
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
		if (this.connect){
			_self.login();
		}else{
			location.reload();
		}				
	},
	
	"onClose" : function(evt){
		this.connect = false;
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

			if (_self.log){
				console.log("========== Receive data ==============");
				console.log("service type: " + svType);
				console.log("sub service type: " + ssvType);
				console.log(jsonInfo);
				console.log("======================================");
			}
			
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
				gup.showUserDetailLayer(call_key);
			}else if (svType == "3" && ssvType == "104"){				
			//	console.log("템플리스트 상태 등록 완료");			
				gup.userStatusDisp(jsonInfo);
			}else if (svType == "5" && ssvType == "2"){
				gap.chatroom_create_after(jsonInfo);
			}
		}
	},
	
	"sendMsg" : function(obj, st, sst){
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
		
		if (_self.log){
			console.log("========== Send Message ==========")
			console.log(obj);
//			console.log("st : " + st)
//			console.log("sst : " + sst)
			console.log("==================================")	
		}
	
		var buffer2 = _self.encodeUTF8(str);		
		var buffer3 = _self.mergeBuffer(buffer, buffer2);
		_wsocket._ws.send(buffer3);		
	},
	
	"login" : function(){			
		var loginObj = new Object();
		loginObj.v = _self.version;	
		if (typeof(localStorage.getItem("auth")) != "undefined" && localStorage.getItem("auth") != null){
			if (localStorage.getItem("auth") != ""){
				loginObj.au = localStorage.getItem("auth");
			}
		}else{
			loginObj.id = gap.userinfo.userid;
		}		
		loginObj.p = "";
		loginObj.ft = 20;
		loginObj.mv = "3.0.0.0";
		loginObj.lg = gap.curLang;
		loginObj.ei = "";	
		_self.sendMsg(loginObj, 1, 1);				
	},
	
//	"logout" : function(){

//		var loginObj = new Object();
//		loginObj.v = "2.0.0";
//		loginObj.id = gap.userinfo.userid;
//		loginObj.cz = 0;
//		_self.sendMsg(loginObj, 2, 1);	
//	},
	"temp_list_status" : function(lists, opt, ty){		
		//lists 등록할 상용자 ky값, opt : 1:구독  2:종료 3:상태값 한번 만보기
		//ty값에 따라 어디서 요청한 것인지 판단한다.
		if (lists.length == 0){
			return false;
		}
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = 2;
		sendObj.op = opt;
		sendObj.sb = lists;
		sendObj.ek = ty;
		_self.sendMsg(sendObj, 3, 103);	
	},
	
	// 웹 소켃
	"make_chatroom_11_only_make_org" : function(uid, name){
		var tuid = String(uid);
		var cuid = gap.search_cur_ky();
		
		var tuname = name;
		var cuname = gap.userinfo.rinfo.nm;
		var id = _self.make_room_id(uid);
		
		//기존에  uid 채팅방이 있는지 검색한다.
		id = id.replace(/-lpl-/gi,"_");
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = cuid;
		sendObj.cid = id ;				//s^사용자ID^사용자ID
		sendObj.cty = 1;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = [{"ky": tuid,"nm": tuname},{"ky": cuid,"nm": cuname} ];
		sendObj.ek = "make_chatroom_11_only_make_org";
		_self.sendMsg(sendObj, 5, 1);
	},
	
	"make_room_id" : function(uid){
		//1:1일때만 룸키를 이렇게 생성한다.		
		if (uid == ""){
			return false;
		}
		var tuid = uid;
		var cuid = gap.search_cur_ky();
	
		var tuidc = tuid;
		var cuidc = cuid;
		var id = "";		
		if ( (cuidc == "") || (tuidc=="")){
			//gap.error_alert();
			return false;
		}	
		if (tuidc > cuidc) {
			id = "s^" + cuidc + "^" + tuidc;
		}else{
			id = "s^" + tuidc + "^" + cuidc;
		}
		return id;		
	}
	
}
