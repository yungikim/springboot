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
	//	gap.check_locale();

		var locale = gVI.check_locale();
		var server = gVI.set_locale(locale);
		var is_dev = false;
//		try{
//			is_dev = document.location.host.search(/devportal/i) != -1;
//		}catch(e){}
//		
//		//운영서버
//		var socket_server = "im.k-portal.co.kr:16180";
//		if (is_dev){
//			//개발서버
//			socket_server = "10.155.8.205:16180";
//		}
		socket_server = server;
		console.log("WebSocket Connect : " + socket_server);
		this._ws = new WebSocket("wss://"+ socket_server);
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
	//	setTimeout(function(){
	//		_wsocket._time = _wsocket.init_websocket();
	//	}, 5000);
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
		
			
			
			_self.sgwxid = dv.getInt8(4, true);
			_self.smxid = dv.getInt8(5, true);
			_self.sft = dv.getInt8(6, true);
			_self.sr1 = dv.getInt8(7, true);
			_self.suid = dv.getInt16(8, true);
			_self.scid = dv.getInt16(10, true);
			
			_self.dgwxid = dv.getInt8(12, true);
			_self.dmxid = dv.getInt8(13, true);
			_self.dft = dv.getInt8(14, true);
			_self.dr1 = dv.getInt8(15, true);
			_self.duid = dv.getInt16(16, true);
			_self.dcid = dv.getInt16(18, true);
					
			
		}
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
		dataview.setInt8(4, _self.dgwxid, true);
		dataview.setInt8(5, _self.dmxid, true);
		dataview.setInt8(6, _self.dft, true);
		dataview.setInt8(7, _self.dr1, true);
		dataview.setInt16(8, _self.duid, true);
		dataview.setInt16(10, _self.dcid, true);
		
		
		
						
		var str = JSON.stringify(obj);		
		
		var buffer2 = _self.encodeUTF8(str);		
		var buffer3 = _self.mergeBuffer(buffer, buffer2);
		
		_wsocket._ws.send(buffer3);
		
	},
	
	"login" : function(){	

		var loginObj = new Object();
		loginObj.v = "2.0.0";
		loginObj.id = _self.search_cur_ky();
		loginObj.p = "";
		loginObj.ft = 20;
		loginObj.mv = "3.0.0.0";
		loginObj.lg = userlang;
		loginObj.ei = "";	
	
		_self.sendMsg(loginObj, 1, 1);	
			
	},
	
	
	"send_chat_msg" : function(obj){
	
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = _self.search_cur_ky();
		
		
		sendObj.nm = obj.name;
		sendObj.enm = obj.name_eng;
		sendObj.el = obj.el;
		
		sendObj.cid = obj.cid;
		var msg = obj.msg.replace(/[\n]/gi,"\r\n");
		sendObj.msg = msg;
		sendObj.ek = obj.ek;
		sendObj.ty = obj.ty;
		
		_self.sendMsg(sendObj, 5, 21);	
	},
	
	"make_msg_id" : function(){
	
		var uid = _self.search_cur_ky();
		var id = _self.seach_canonical_id(uid);		
		id = id.replace(/\./gi,"-spl-");		
		var ran = new Date().getTime() + "_" + _self.makeRandom(5);		
		return id + "_" + ran;		
	},
	
	"makeRandom" : function(length){
		return Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
	},
	
	"make_room_id" : function(uid){
		
		//1:1일때만 룸키를 이렇게 생성한다. kmslab 적용시 신규 작성
		
		var tuid = uid;
		var cuid = _self.search_cur_ky();
		var tuidc = _self.seach_canonical_id(tuid);
		var cuidc = _self.seach_canonical_id(cuid);
		
		tuidc = tuidc.replace(/_/gi,"-lpl-");
		cuidc = cuidc.replace(/_/gi,"-lpl-");
		
		var id = "";
		
		if ( (cuidc == "") || (tuidc=="")){
		
			return false;
		}
	
		if (tuidc > cuidc) {
			id = "s^" + cuidc + "^" + tuidc;
		}else{
			id = "s^" + tuidc + "^" + cuidc;
		}
		return id;
		
	},
	
		
	"make_chatroom_11" : function(uid){
		
		var tuid = uid;
		var cuid = _self.search_cur_ky();
		var tuidc = _self.seach_canonical_id(tuid);
		var cuidc = _self.seach_canonical_id(cuid);
		
		var tuname = _self.search_username(tuid);
		var cuname = _self.search_username(cuid);
		var id = "";
	
		var id = _self.make_room_id(uid);
		//기존에  uid 채팅방이 있는지 검색한다.
		id = id.replace(/-lpl-/gi,"_");
		
		var sendObj = new Object();
		sendObj.v = "2.0.0";
		sendObj.ky = _self.search_cur_ky();
		sendObj.cid = id ;				//s^사용자ID^사용자ID
		sendObj.cty = 1;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = [{"ky": tuid,"nm": tuname},{"ky": cuid,"nm": cuname} ];
		sendObj.ek = "make_chatroom_11";
		
		console.log(sendObj);
		_self.sendMsg(sendObj, 5, 1);
	},
	
	
	"seach_canonical_id" : function(str){
		//notesid 에서 아이디 값만 가져오기
		if (typeof(str) == "undefined"){
			return false;
		}
		var inx1 = str.indexOf("OU=");
		var inx2 = str.indexOf(",O=");
		var res = str.substring(inx1+3, inx2);
	//	res = res.replace(".","_");
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

	"search_cur_ky" : function(){
		var cky = userid.replace(/\//gi,",");
		return cky;
	}
}
