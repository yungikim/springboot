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
	
	// 재접속 간격 설정 (ms)
    this.initialReconnectInterval = 1000;    // 첫 시도: 1초
    this.maxReconnectInterval     = 30000;   // 최대: 30초
    this.reconnectInterval        = this.initialReconnectInterval;
    this.reconnectTimer           = null;
}


_websocket.prototype ={

	"init_websocket" : function(){			
		_self = this;
		
		gap.get_auth();
		gap.check_locale();
		
		if (this._ws){
			this._ws.onopen = null;
			this._ws.onclose = null;
			this._ws.onmessage = null;
			this._ws.onerror = null;
			this._ws.close();
		}
		
				
		var mserver = mailserver.toLowerCase();		
		this._ws = new WebSocket("wss://"+ gap._ws_cur_sever);		
		this._ws.binaryType = "arraybuffer"; 		
		this._ws.onopen = function(evt){
			_wsocket.onOpen(evt);
			console.log("WebSocket Connect : " + gap._ws_cur_sever);
			
			_self.reconnectInterval = _self.initialReconnectInterval;
		},
		this._ws.onclose = function(evt){		
			console.log("WebSocket Close");
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
		
		try{
			portal_init();
		}catch(e){}
	},
	
	"onClose" : function(evt){
		this.connect = false;
		
		this._scheduleReconnect();
		
		setTimeout(function(){
		//	_wsocket._time = _wsocket.init_websocket();
		}, 5000);
	},
	
	_scheduleReconnect: function(){
		console.log("_scheduleReconnect");
		
        // 이미 예약된 타이머가 있으면 무시
        if (this.reconnectTimer) return;

        console.log(`[WebSocket] Reconnect in ${this.reconnectInterval/1000}s…`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.init_websocket();
            // 지수 백오프: 점점 늘리되 max 이하로
            this.reconnectInterval = Math.min(
                this.reconnectInterval * 2,
                this.maxReconnectInterval
            );
        }, this.reconnectInterval);
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
			
	//		if (svType == "5" && ssvType == "47"){
	
			if (_self.log){
				console.log("========== Receive data ==============");
				console.log("service type: " + svType);
				console.log("sub service type: " + ssvType);
				console.log(jsonInfo);
				console.log("======================================");
			}

	//		}			
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
				//gap.userinfo.rinfo = jsonInfo.ct;	
			//	gap.userinfo.rinfo.sec = gap.chnage_sec(jsonInfo.ct.em);				
				_wsocket.load_etc_info();				
				_wsocket.load_chatroom_list_only();
			}else if (svType == "3" && ssvType == "2"){
			//	console.log("내 상태 변경했을 경우");						
				gTop.my_status_dis(jsonInfo);
			}else if (svType == "3" && ssvType == "102"){				
			//	console.log("버디리스트 상태 등록");
				gBody.buddy_list_status_dis(jsonInfo);
			}else if (svType == "3" && ssvType == "104"){				
				
			//	console.log("템플리스트 상태 등록 완료");			
				gap.temp_list_status_dis(jsonInfo);
			}else if (svType == "3" && ssvType == "201"){				
			//	console.log("특정 사용자 상태 변경 알림 도착");				
				if (jsonInfo.ky == gap.search_cur_ky()){
					//나의 상태 메시지가 변경된 경우			
					if (typeof(jsonInfo.st) != "undefined"){
						gap.userinfo.rinfo.st = jsonInfo.st;
					}
					if (typeof(jsonInfo.msg) != "undefined"){
						gap.search_status_index(jsonInfo.msg);
						gap.userinfo.rinfo.msg = jsonInfo.msg;						
						try{
							var g_status = sessionStorage.getItem("status");
							if (g_status == null){
								_wsocket.session_msg(jsonInfo.st, jsonInfo.msg);
							}else{
								if (typeof(jsonInfo.msg) != "undefined" ){
									_wsocket.session_msg(jsonInfo.st, jsonInfo.msg);
								}
							}
						}catch(e){}						
					}			
				}				
				try{
					if (typeof(gBody) != "string"){
						gBody.receive_change_status(jsonInfo);
					}					
				}catch(e){}				
			}else if (svType == "5" && ssvType == "2"){		
				if (jsonInfo.rc != 0){
					return false;
				}			
				var cid = jsonInfo.ct.cid;		
				if (jsonInfo.ek == "make_chatroom_11"){						
					_wsocket.load_chatlog_list(cid);		
					gBody.chat_start(cid);					
				}else if (jsonInfo.ek == "make_chatroom_11_only_make"){														
					_wsocket.load_chatroom_list();					
				}else if (jsonInfo.ek == "make_chatroom_1N"){					
					_wsocket.load_chatlog_list(cid);
					gBody.chat_start(cid);
				}else if (jsonInfo.ek == "make_chatroom_1N_popup"){			
					gBody.makeroom_after_search_popup_after(cid);
				}else if (jsonInfo.ek == "make_chatroom_1N_with_cid"){					
					_wsocket.load_chatlog_list(cid);									
				}else if (jsonInfo.ek == "make_chatroom_1N_only_make_org" || jsonInfo.ek == "make_chatroom_11_only_make_org"){			
					gap.chatroom_create_after(jsonInfo);					
				}else if (jsonInfo.ek == "make_chatroom_11_invite"){		
					_wsocket.load_chatlog_list(cid);					
					cid = cid.replace(/_/gi, "-lpl-");
					gBody.enter_chatroom_for_chatroomlist(cid, "");	
				}
			}else if (svType == "5" && ssvType == "6"){
				//채팅방에 사용자 초대한 경우					
			//	console.log("채팅방 사용자 초대")
				if (jsonInfo.ek == "attend_chatroom"){			
					gBody.draw_chat_room_members(jsonInfo);
				}
			}else if (svType == "5" && ssvType == "7"){
				//1:N에서 내가 초대된 경우				
				//채팅방 정보를 다시 가져와서 그린다.				
				var username = gap.search_username(jsonInfo.ky);						
				var person_img = gap.person_profile_uid(jsonInfo.ky);
				gap.change_title("3",username + gap.lang.invite_alram);				
				var mmx = username + gap.lang.invite_alram;				
				var id = jsonInfo.cid.replace(/\^/gi,"_").replace(/\./gi,"-spl-");
				var html = "<div class='webchat-alarm info-alarm' style='cursor:pointer' onclick=\"gBody.receive_enter_room('"+jsonInfo.cid+"', '"+id+"', event)\">";
				html += "	<h2><span class='ico'></span>"+gap.lang.info+"</h2>";
				html += "		<div class='user'  style='padding-top:8px'>";
				html += "			<div class='user-thumb'>"+person_img+"</div>";
				html += "			<dl>";
				html += "				<dt>"+ username + gap.lang.hoching +"</dt>";
				html += "				<dd>"+mmx +"</dd>";
				html += "			</dl>";
				html += "	</div>";
				html += "</div>";
				mmx = html;														
				gap.tost_receive(mmx, 10000, "info", "");	 //info, error, warning, success							
				_wsocket.load_chatroom_list();				
			}else if (svType == "5" && ssvType == "14"){
				//1:N방에서 특정인이 방에 초대되었을 경우 호출함
				gBody.enter_chatroom_dis(jsonInfo);				
			}else if (svType == "5" && ssvType == "22"){
				//메시지를 전송했을때 리턴되는 부분				
				var id = jsonInfo.ek;								
				if (typeof(jsonInfo.ct.sq) != "undefined"){									
					var mx = jsonInfo.ct.sq;	
					var cid = jsonInfo.ct.cid;					
					gBody.chatroom_info_change_last_msg(mx, cid, jsonInfo.ct);					
					setTimeout(function(){
						_self.disabled_remove(id, mx, jsonInfo);
					}, 500);
				}
			}else if (svType == "5" && ssvType == "23"){
				//상대방이 채팅을 보낸 경우				
				gap.receive_new_msg(jsonInfo);
			}else if (svType == "5" && ssvType == "32"){
				//채팅방 나가기 했을 경우 이후 이벤트
				//채팅방 정보를 다시 가져와서 그린다.				
				if (jsonInfo.ek == "chat_room_out_event_all"){					
					_wsocket.load_chatroom_list();
				}else{					
					var key = jsonInfo.ek.replace("chat_room_out_event_","");
					gap.chatroom_set_out(key);
				}				
			}else if (svType == "5" && ssvType == "33"){				
				gBody.exit_chatroom_dis(jsonInfo);
			}else if (svType == "5" && ssvType == "43"){				
				//load_chatroom_list 채팅방 리스트 정보
			//	console.log("---------- 채팅방 리스트 정보 ----------------------");		

				if (jsonInfo.ek == "search"){					
					gBody.draw_search_chatroom_list_after(jsonInfo);
				}else if (jsonInfo.ek == "search_popup"){
					gma.draw_search_chatroom_list_after(jsonInfo);
				}else if (jsonInfo.ek == "only"){
					
					gap.chat_room_info = jsonInfo;
					if (typeof(gBody) != "undefined"){
						gBody.unread_chat_count_check();
					}
					if (typeof(gport) != "undefined"){
						$(".category_chat.chat_unread").click();
					}
					
				}else{
					gBody.searchMode = "F";
					gap.chat_room_info = jsonInfo;
					gBody.unread_chat_count_check();					
					if (gma.chat_position == "popup_chat"){
						gBody.chatroom_draw();	
					}					
					if (gap.cur_window == "org" || gap.cur_window == "boxmain" || gap.cur_window == "meeting"  || gap.cur_window == "collect" || gap.cur_window == "home"){
						//아래를 실행시키면 화면이 깨지기 때문에 예외 처리한다.
						return false;
					}					
					$("#left_roomlist_sub").empty();
					gBody.chatroom_draw();	
					$("#center_content_main").empty();
					gBody.chatroom_last_draw();					
					if (jsonInfo.ek == "popup"){			
						
						//채팅방에서 새창을 클릭하면 채팅방 정보를 로딩하고 나서 표시되어야 해서 여기서 처리한다.
						window.opener.gap.chat_room_info = jsonInfo;
						var callkey = $.base64.decode(call_key);
						callkey = gap.decodeid(callkey);
						if (gap.chatroom_exist_check(callkey)){	
							gBody.enter_chatroom_for_chatroomlist(callkey);
						}else{
							gBody.enter_chatroom_for_chatroomlist_popup_empty(callkey);		
						}											
						$("#center_content_main li").each(function(inx, obj){
							var id = $(obj).attr("id");
							if (id == "make_new_chat_room"){
								$(obj).addClass("spread");
							}else{							
								id = id.replace("li_main_","");
								if (gap.search_is_onetoone_id(id)){
									$(obj).addClass("spread");
								}else{
									$(obj).addClass("spread n-chat");
								}								
							}
						});
					}
				}			
			}else if (svType == "5" && ssvType == "46"){
				//내가 여러 창으로 띄워저 있을때 특정 메시지를 읽었을때 호출되는 함수 					
				gap.search_cur_chatroom_change_rsq(jsonInfo.ct.cid, jsonInfo.ct.sq);
			}else if (svType == "5" && ssvType == "47"){
				//채팅을 누군가가 읽었다고 이벤트가 도착한 경우		
				setTimeout(function(){
					gBody.chatroom_read_msg(JSON.stringify(jsonInfo));
				}, 1000);				
			}else if (svType == "5" && ssvType == "53"){				
				//채팅로그 불러오기
				if (jsonInfo.ek == "chat_room_file_list"){
					gBody.chat_profile_file_draw(jsonInfo.ct);	
				}else if (jsonInfo.ek.indexOf("chat_room_image_all") > -1){
					//전체 이미지 내러주기
					gBody.show_chat_images(jsonInfo);
				}else if (jsonInfo.ek == "chat_room_image_list"){
					gBody.chat_profile_image_draw(jsonInfo.ct);					
				}else if (jsonInfo.ek == "chat_room_file_list_right_frame"){
					gRM.draw_chat_room_file(jsonInfo.ct);					
				}else if (jsonInfo.ek == "chat_room_image_list_right_frame"){
					gRM.draw_chat_room_image(jsonInfo.ct);					
				}else if (jsonInfo.ek == "load_chatlog_list_continue"){					
					gBody.write_chat_log_continue(jsonInfo);
				}else if (jsonInfo.ek == "load_chatlog_list_channel"){
					gBody.write_chat_log_channel(jsonInfo);
				}else if (jsonInfo.ek == "load_chatlog_list_channel_continue"){
					gBody.write_chat_log_channel_continue(jsonInfo);					
				}else if (jsonInfo.ek == "load_chatlog_list_popup"){
					gBody.write_chat_log_popup(jsonInfo);
				}else if (jsonInfo.ek == "load_chatlog_list_popup_continue"){
					gBody.write_chat_log_popup_continue(jsonInfo);	
				}else if (jsonInfo.ek == "load_chatlog_sq"){
					//특정 sq를 넘겨서 해당 데이터의 상세 정보만 가져오는 경우
					gBody.search_chat_sq(jsonInfo);
				}else if (jsonInfo.ek == "load_chatlog_sq_notice"){
					//특정 sq를 넘겨서 해당 데이터의 상세 정보만 가져오는 경우
					gBody.search_chat_sq_notice(jsonInfo);
				}else{
					gBody.chatroom_dis(jsonInfo);
				}
			}else if (svType == "5" && ssvType == "56"){
				//load_chatlog_list 특정방 채팅 기록 정보				
			}else if (svType == "5" && ssvType == "62"){
				//메시지 삭제 후 이벤트		
				setTimeout(function() {
					gBody.delete_msg(jsonInfo, "");
				}, 100);				
			}else if (svType == "5" && ssvType == "63"){
				//누군가가 메시지를 삭제하는 경우		
				setTimeout(function() {
					gBody.delete_msg(jsonInfo, "r");
				//	gBody.receive_delete_msg(jsonInfo);
				}, 100);			
			}else if (svType == "5" && ssvType == "92"){
				//상단 고정 및 해제를 클릭 했을때 리턴되는 함수
				_wsocket.load_chatroom_list();
			}else if (svType == "5" && ssvType == "93"){
				//상단 고정 및 해제를 클릭 했을때 리턴되는 함수
				_wsocket.load_chatroom_list();			
			 }else if (svType == "5" && ssvType == "102"){
					//	gBody.refresh_chatroom();
						//채팅방 정보를 다시 불러온다.
					_wsocket.load_chatroom_list();
			 }else if (svType == "5" && ssvType == "103"){
					//	gBody.refresh_chatroom();
						//채팅방 정보를 다시 불러온다.
					_wsocket.load_chatroom_list();
			 }else if (svType == "5" && ssvType == "105"){					
					//채팅방 내부 검색결과 리턴
					gBody.search_chatroom_content_after(jsonInfo);
			}else if (svType == "7" && ssvType == "2"){
				if (jsonInfo.ek == "send_memo_noti"){
					//쪽지 전송 시 알림 결과
					//console.log("쪽지전송 알림 결과 >>> " + jsonInfo.rc
				}				
			}else if (svType == "7" && ssvType == "3"){				
				//쪽지 수신 알림 이벤트			
				var name = jsonInfo.nm + gap.lang.rmemo;
				var msg = jsonInfo.tle;
				var person_img = gap.person_profile_img(jsonInfo.ky);				
				var content_info = "";
				var memo_attach_info = "";
				var mmx = "";				
				gap.change_title("2", jsonInfo.tle);
				content_info = jsonInfo.msg;
				memo_attach_info = jsonInfo.att;								
				if (memo_attach_info){
					var file = "";
					for (var i = 1; i < memo_attach_info.length; i++){
						var fname = memo_attach_info[i].nm;
						if (i == 1){
							file += '"' + fname + '"';
						}else{
							file += '<br>' + '"' + fname + '"';
						}
					}					
					mmx = msg + "<br>" + file;
				}else{
					mmx = msg;
				}				
				var id = jsonInfo.sq;				
				var html = "<div class='webchat-alarm message-alarm' id='memo_noti_alarm' data='"+id+"' style='cursor:pointer'>";
				html += "	<h2><span class='ico'></span>" + gap.lang.noti +"</h2>";
				html += "		<div class='user' style='padding-top:8px'>";
				html += "			<div class='user-thumb'>" + person_img + "</div>";
				html += "			<dl>";
				html += "				<dt>" + jsonInfo.nm + "</dt>";
				html += "				<dd>" + mmx + "</dd>";
				html += "			</dl>";
				html += "	</div>";
				html += "</div>";
				mmx = html;														
				gap.tost_receive(mmx, 10000, "info", "");	 //info, error, warning, success				
				$("#memo_noti_alarm").off();
				$("#memo_noti_alarm").on("click", function(){
					gRM.show_memo_noti_body(jsonInfo);
				});				
			}else if (svType == "7" && ssvType == "5"){
				// 쪽지 목록 그리기
				gRM.draw_memo_list(jsonInfo);				
			}else if (svType == "7" && ssvType == "7"){
				// 쪽지 상세 정보 반환
				gRM.show_memo_body(jsonInfo);				
			}else if (svType == "7" && ssvType == "12"){
				// 쪽지 삭제 처리
				if (jsonInfo.ek == "normal"){
					gRM.after_remove_memo(jsonInfo);					
				}else{
					$('#chat_history_dialog').empty();
					$('#chat_history_dialog').hide();
					gap.hideBlock();
				}				
			}else if (svType == "7" && ssvType == "15"){		
				// 쪽지 읽음 처리				
				gRM.set_memo_read(jsonInfo);				
			}else if (svType == "8" && ssvType == "3"){				
				if (jsonInfo.ek == "topsearch"){
					gTop.chat_user_search(jsonInfo);
				}else if (jsonInfo.ek == "makechat"){
					gBody.search_result_add_member(jsonInfo);
				}else if (jsonInfo.ek == "memosendto"){
					gBody.search_result_add_member_memo(jsonInfo);
				}else if (jsonInfo.ek == "userpopup"){
					gBody.popup_user_layer(jsonInfo);
				}else if (jsonInfo.ek == "profile"){	
					gBody.chat_profile_init(jsonInfo.ct);
				}else if (jsonInfo.ek == "addmember"){
					//사용자 검색하고 추가하는 경우
					gBody.addmember_chatroom_after_search(jsonInfo);
				}else if (jsonInfo.ek == "makeroom"){
					gBody.makeroom_after_search(jsonInfo);					
					try{
						gap.remove_layer('hew_chat_layer');					
					}catch(e){}
				}else if (jsonInfo.ek == "makeroom_popup"){
					gBody.makeroom_after_search_popup(jsonInfo);
				}else if (jsonInfo.ek == "makeroom_org"){
					gap.chatroom_create_after(jsonInfo);
				}else{
					//사용자 이미지 클릭해서 개인정보 표시하는 부분
					gap.show_user_profile(jsonInfo.ct.rt[0]);
				}
			}else if (svType == "8" && ssvType == "6"){
				//대화방 에서 파일 검색 후 리턴시 호출
				if (jsonInfo.ek == "chat_room_image_attach_search_right_frame"){
			    	gRM.draw_chat_room_file_search_result(jsonInfo.ct, 'image');			    	
			    }else if (jsonInfo.ek == "chat_room_file_attach_search_right_frame"){
			    	gRM.draw_chat_room_file_search_result(jsonInfo.ct, 'file');			    	
			    }else if (jsonInfo.ek == "image_attach_search_right_frame"){
			    	gRM.draw_all_attach_search_result(jsonInfo.ct, 'image', false, false);			    	
			    }else if (jsonInfo.ek == "file_attach_search_right_frame"){
			    	gRM.draw_all_attach_search_result(jsonInfo.ct, 'file', false, false);			    	
			    }else if (jsonInfo.ek == "image_attach_search_result_right_frame"){
			    	gRM.draw_all_attach_search_result(jsonInfo.ct, 'image', true, false);			    	
			    }else if (jsonInfo.ek == "file_attach_search_result_right_frame"){
			    	gRM.draw_all_attach_search_result(jsonInfo.ct, 'file', true, false);			    	
			    }else if (jsonInfo.ek == "image_attach_ext_search_result_right_frame"){
			    	gRM.draw_all_attach_search_result(jsonInfo.ct, 'image', true, true);			    	
			    }else if (jsonInfo.ek == "file_attach_ext_search_result_right_frame"){
			    	gRM.draw_all_attach_search_result(jsonInfo.ct, 'file', true, true);			    	
			    }else if (jsonInfo.ek == "channel_files_result"){
			    	gBody2.draw_files_result(jsonInfo.ct);			    	
			    }else if (jsonInfo.ek == "chat_room_all_files"){
			    	gBody.draw_chat_all_files(jsonInfo.ct);
			    }				
			}else if (svType == "8" && ssvType == "9"){
				//og tag 링크 검색 결과
				if (jsonInfo.ek == "chat_room_link_search_right_frame"){
					gRM.draw_all_link_search_result(jsonInfo.ct, false);					
				}else if (jsonInfo.ek == "chat_room_link_search_result_right_frame"){
					gRM.draw_all_link_search_result(jsonInfo.ct, true);
				}
			}else if (svType == "9" && ssvType == "2"){			
				//load_buddy_list 개인 기타 정보	

				gap.buddy_list_info = jsonInfo;
				if (!gBody.is_buddylist_search){			
					gBody.buddy_draw();
	
				}
						
				//gBody.set_etc_info(gap.etc_info);	
			}else if (svType == "9" && ssvType == "9"){
				//그룹 추가에 대한 응답		
				if (jsonInfo.ek == "no_load"){				
				}else{
					_wsocket.load_buddy_list('etc');
				}	
			}else if (svType == "9" && ssvType == "10"){
				//대화상대가 삭제되었다는 이벤트가 호출된 경우
				//다른 기기에서 버디리스트를 변경한 경우
				_wsocket.load_buddy_list("etc");
//				var ty = jsonInfo.ty;	
//				
//				if (ty == "u"){
//					_wsocket.load_buddy_list("etc");
//				}else{
//					var srcname = jsonInfo.src.nm;
//					var user = jsonInfo.src.usr[0].ky;						
//					if (ty == "d"){
//						gBody.delete_user_from_group(srcname, user);
//					}else if (ty == "a"){
//						_wsocket.load_buddy_list("etc");
//					}
//				}
				
			}else if (svType == "9" && ssvType == "32"){
				//기타 정보 로딩시 호출되는 경우
				if (jsonInfo.ek == "favorite_list"){					
					gBody.favorite_draw(jsonInfo);
				}else{					
					gap.etc_info = jsonInfo;				
					gap.load_init();			
					//내상태 변경하기				
					if (jsonInfo.ct){
						gap.my_profile_status(jsonInfo.ct.st, "");	
					}
									
					///////// 상태 등록한다. /////////////////////////////
					var obj = new Object();
					obj.id = gap.search_cur_ky();
					obj.st = gap.userinfo.rinfo.st;
					gap.status_change(obj);
					/////////////////////////////////////////////////					
				}
			}else if (svType == "9" && ssvType == "34"){
				//기타 정보 저장하고 난 이후 호출되는 경우			
				if (jsonInfo.ek == "Favorite"){
					_wsocket.load_favorite_list();
				}else if (jsonInfo.ek == "change_locale_languse"){					
					location.reload();
				}				
			}else if (svType == "9" && ssvType == "35"){
				//기타 정보 변경 사항 알림의 경우				
				//상태변경 내용만 저장한다.
				if (typeof(jsonInfo.om1) != "undefined"){
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
				}					
			
			}else if (svType == "100" && ssvType == "3"){				
				gap.receive_box_msg(jsonInfo);				
			}else if (svType == "100" && ssvType == "5"){				
				gap.receive_box_msg(jsonInfo);
			}else if (svType == "100" && ssvType == "9"){			
				//알림센터 프로젝트에서 추가한 함수
				gap.receive_box_msg_alarm(jsonInfo);						
			}else if (svType == "11" && ssvType == "112"){
				//번역 리스트를 돌려준다.			
				gBody.translate_list_popup(jsonInfo);				
			}else if (svType == "100" && ssvType == "6"){
				//http로 소켓을 호출하면 도착하는 이벤트
				gap.receive_http_socket(jsonInfo);
			}else if (svType == "1000" && ssvType == "3"){				
				_wsocket.error_check(jsonInfo);
			}
		}
	},
	
	"disabled_remove" : function(id, mx, obj){
		//하단에 있는 채팅방과 Popup 채팅창 2군데 모두 처리해야 한다.	
		
		if (gBody.cur_cid == obj.ct.cid){
			//하단에 채팅방에 채팅키가 같은 경우
			$("#chat_msg_dis #"+id).removeClass("disabled");
			$("#chat_msg_dis #"+id).attr("mid",mx);
			$("#chat_msg_dis #" + id).find(".btn-chat-resend").remove();		
			$("#chat_msg_dis #" + id).attr("mdata",mx);	
			$("#chat_msg_dis #br_" + id).attr("id", "br_" + mx);			
			//time 부분에 있는 data값을 실제 서버에 저장된 sq값으로 전환해 준다. 상대방이 읽었을 경우 읽음 처리해 주기 위해서 key값을 sq로 통일한다.
			$("#chat_msg_dis .time[data="+id+"]").attr("data",mx);			
			if ($("#chat_msg_dis #" + id).next().attr("class") == "time"){
				$("#chat_msg_dis #" + id).next().attr("data", mx);
			}					
			$("#chat_msg_dis #ico-new_"+id).attr("data", "ico-new_" + mx);			
			if ($("#chat_msg_dis #"+id).next().attr("class") == "time"){
				var xxo = $("#chat_msg_dis #"+id).next();
				var oobx = $(xxo).find(".ico-new");
				$(oobx).attr("data",mx);
				$(oobx).attr("id","ico-new_"+mx);
			}			
			//번역으로 들어온 경우 번역 영역을 삽입한다.		
			var obb = $("#chat_msg_dis #msg_"+id);
			var cnn = obb.find("#chat_msg_dis .trans_gap").length;
			if (cnn == 0){			
				var tmsg = "";
				var tx = "";	
				if (typeof(obj.ct.ex) != "undefined"){
					if (typeof(obj.ct.ex.ct) != "undefined"){					
						tmsg = obj.ct.ex.ct.msg;
						tmsg = tmsg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
						tmsg = tmsg.replace(/[\n]/gi, "<br>");
						tmsg = tmsg.replace(/\s/gi, "&nbsp;");
						tx = obj.ct.ex.ct.lang;					
						var html = "<span class='trans_gap'><span class='trans_me2'>"+ tx + "</span> " + tmsg+"</span>";
						obb.append(html);
						gap.scroll_move_to_bottom_time("chat_msg", 100);
					}
				}				
			}
		}		
		if (gma.cur_cid_popup == obj.ct.cid){
			//팝업창 채팅방키 값이 같은 경우 처리한다.
			$("#alarm_chat_sub #"+id).removeClass("disabled");
			$("#alarm_chat_sub #"+id).attr("mid",mx);
			$("#alarm_chat_sub #" + id).find(".btn-chat-resend").remove();		
			$("#alarm_chat_sub #" + id).attr("mdata",mx);	
			$("#alarm_chat_sub #br_" + id).attr("id", "br_" + mx);			
			//time 부분에 있는 data값을 실제 서버에 저장된 sq값으로 전환해 준다. 상대방이 읽었을 경우 읽음 처리해 주기 위해서 key값을 sq로 통일한다.
			$("#alarm_chat_sub .time[data="+id+"]").attr("data",mx);			
			if ($("#alarm_chat_sub #" + id).next().attr("class") == "time"){
				$("#alarm_chat_sub #" + id).next().attr("data", mx);
			}					
			$("#alarm_chat_sub #ico-new_"+id).attr("data", "ico-new_" + mx);			
			if ($("#alarm_chat_sub #"+id).next().attr("class") == "time"){
				var xxo = $("#alarm_chat_sub #"+id).next();
				var oobx = $(xxo).find(".ico-new");
				$(oobx).attr("data",mx);
				$(oobx).attr("id","ico-new_"+mx);
			}			
			//번역으로 들어온 경우 번역 영역을 삽입한다.		
			var obb = $("#alarm_chat_sub #msg_"+id);
			var cnn = obb.find("#alarm_chat_sub .trans_gap").length;
			if (cnn == 0){			
				var tmsg = "";
				var tx = "";	
				if (typeof(obj.ct.ex) != "undefined"){
					if (typeof(obj.ct.ex.ct) != "undefined"){					
						tmsg = obj.ct.ex.ct.msg;
						tmsg = tmsg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
						tmsg = tmsg.replace(/[\n]/gi, "<br>");
						tmsg = tmsg.replace(/\s/gi, "&nbsp;");
						tx = obj.ct.ex.ct.lang;					
						var html = "<span class='trans_gap'><span class='trans_me2'>"+ tx + "</span> " + tmsg+"</span>";
						obb.append(html);
						gap.scroll_move_to_bottom_time("alarm_chat_sub", 100);
					}
				}				
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
			console.log("st : " + st)
			console.log("sst : " + sst)
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
	
	"load_buddy_list" : function(opt){	
		//버디리스트 가져오기  opt가 etc일 경우만 무조건 가져온다.
		if (opt != "etc"){
			if (gap.buddy_list_info != ""){
				if ($("#buddy_list_dis").text() == ""){
					gBody.buddy_draw();
				}				
				return false;
			}
		}		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		if (opt == "no_load"){
			sendObj.ek = "no_load";
		}
		_self.sendMsg(sendObj, 9, 1);			
	},
	
	"load_chatroom_list" : function(opt){	
		//채팅룸 리스트 가져오기

		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		if (opt == "popup"){
			sendObj.ek = "popup";
		}else{
			sendObj.ek = "default";
		}		
		sendObj.ty = "pt";		
		//RPA사용자 채팀방이 2700개라 일단 해당 사용자만 채팅방 개수를 100개로 조정한다.
	//	if (gap.userinfo.rinfo.ky == "90A60023" || gap.userinfo.rinfo.ky == "10220292"){
			sendObj.lmt = 100;
	//	}
		_self.sendMsg(sendObj, 5, 41);	
	},	
	
	"load_chatroom_list_only" : function(opt){	
		//채팅룸 리스트 정보를 가져와서 데이터만 변경한다.

		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();		
		sendObj.ek = "only";			
		sendObj.ty = "pt";		
		_self.sendMsg(sendObj, 5, 41);	
	},
	
	"load_chatroom_list_search" : function(opt, word){	
		//채팅룸 리스트 가져오기
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.ek = "search";				
		sendObj.kw = word;
		sendObj.ty = "nf";		
		_self.sendMsg(sendObj, 5, 41);	
	},
	
	"save_chatroom_title" : function(opt){	
		//채팅룸 리스트 가져오기		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = opt.cid;
		sendObj.tle = opt.title;
		sendObj.ek = "save_chatroom_title";				
		_self.sendMsg(sendObj, 5, 101);	
	},	
	
	"load_etc_info" : function(){	
		//일반 정보 가져오기		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.sg = ['om1', 'om2', 'om3', 'om4', 'om5', 'am1', 'am2','am3', 'am4', 'am5', 'dm1','dm2','dm3', 'dm4', 'dm5','enter','fav','loc','lg','ei'];
		_self.sendMsg(sendObj, 9, 31);			
	},
	
	"load_favorite_list" : function(){
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.sg = ['fav'];
		sendObj.ek = "favorite_list";
		_self.sendMsg(sendObj, 9, 31);	
	},

	"add_group" : function(name){		
		var sendObj = new Object();
		var sendname = new Object();
		sendname.nm = name;
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "a";
		sendObj.src = sendname;
		_self.sendMsg(sendObj, 9, 8);	
	},
	
	"update_group" : function(name, dest, usr){	
		
		var sendObj = new Object();
		var sendname = new Object();
		if (dest == ""){
			//신규 생성할때
			sendname.nm = name;
			sendname.usr = usr;
		}else{
			//업데이트 할때
			sendname.nm = name;
			sendObj.dest = dest;
			sendObj.usr = usr;
		}		
		
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "u";
		sendObj.src = sendname;
		_self.sendMsg(sendObj, 9, 8);	
	},
	
	"delete_group" : function(name){
		var sendObj = new Object();
		var sendname = new Object();
		sendname.nm = name;
		sendObj.v = _self.version;
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
		sendObj.v = _self.version;
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
		sendObj.v = _self.version;
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
		sendObj.v = _self.version;
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
		sendObj.v = _self.version;
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
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "r";
		sendObj.src = opt;
		sendObj.dest = changename;
		_self.sendMsg(sendObj, 9, 8);
	},
	
	"move_person" : function(srcname, user, targetname, name){
	
		//{"v": "2.0.0","ky": "CN=김도영,OU=softk2019,O=APG","ty": "m","src": {"nm": "testcase1","usr": [{"ky": "CN=백성호,OU=dune22,O=APG","nm": "백성호"}]},"dest": "testcase2"}
		var sendObj = new Object();
		var opt = new Object();
	//	var username = gap.search_username(user);
		var username = name;	
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "m";
		sendObj.src = {"nm": srcname,"usr": [{"ky": user,"nm": username}]};;
		sendObj.dest = targetname;	
		_self.sendMsg(sendObj, 9, 8);
	},
	
	"copy_person" : function(user, targetname, name){	
		//Copy는 추가와 동일한 로직을 태운다... copy와 Add가 동일한 함수를 호출한다.
		//{"v": "2.0.0","ky": "CN=김도영,OU=softk2019,O=APG","ty": "a","src": {"nm": "testcase1","usr": [{"ky": "CN=김윤기,OU=ygkim2019,O=APG","nm": "김윤기"}]}}
		var sendObj = new Object();
		var opt = new Object();
		var username = name;	
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "a";
		sendObj.src = {"nm": targetname,"usr": [{"ky": user,"nm": username}]};;
		_self.sendMsg(sendObj, 9, 8);
	},
	
	"copy_person_multi" : function(targetname, userlist){	
		//Copy는 추가와 동일한 로직을 태운다... copy와 Add가 동일한 함수를 호출한다.
		//{"v": "2.0.0","ky": "CN=김도영,OU=softk2019,O=APG","ty": "a","src": {"nm": "testcase1","usr": [{"ky": "CN=김윤기,OU=ygkim2019,O=APG","nm": "김윤기"}]}}
		var sendObj = new Object();
		var opt = new Object();

		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "a";
		sendObj.src = {"nm": targetname,"usr": userlist};;
		_self.sendMsg(sendObj, 9, 8);
	},
	
	"delete_person_all_group" : function(user){
		//{"v": "2.0.0","ky": "CN=김도영,OU=softk2019,O=APG", "ty": "d","src": {"usr":[{"ky": "CN=백성호,OU=dune22,O=APG","nm": "백성호"}]}}
		var sendObj = new Object();
		var opt = new Object();
		var username = gap.search_username(user);	
		sendObj.v = _self.version;
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
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = "d";
		sendObj.src = {"nm": srcname,"usr": [{"ky": user,"nm": username}]};;
		_self.sendMsg(sendObj, 9, 8);
	},
	
	"search_user_one_for_popup" : function(uid){		
		//{"v": "2.0.0","ty": "ky", "ky": ["CN=김도영,OU=softk2019,O=APG","CN=김윤기,OU=ygkim2019,O=APG"]}
		uid = uid+"";
		var mem = [];
		mem.push(uid);
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ty = "ky";
		sendObj.lg = gap.curLang;
		sendObj.ky = mem;
		_self.sendMsg(sendObj, 8, 1);
	},
	
	"search_user_one_for_profile" : function(uid){		
		uid = uid+"";
		var mem = [];
		mem.push(uid);
		//{"v": "2.0.0","ty": "ky", "ky": ["CN=김도영,OU=softk2019,O=APG","CN=김윤기,OU=ygkim2019,O=APG"]}
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ty = "ky";
		sendObj.lg = gap.curLang;
		sendObj.ky = mem;
		sendObj.ek = "profile";
		_self.sendMsg(sendObj, 8, 1);
	},
	
	"search_user_one_for_popup_layer" : function(uid){		
		uid = uid+"";
		var mem = [];
		mem.push(uid);
		//{"v": "2.0.0","ty": "ky", "ky": ["CN=김도영,OU=softk2019,O=APG","CN=김윤기,OU=ygkim2019,O=APG"]}
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ty = "ky";
		sendObj.lg = gap.curLang;
		sendObj.ky = mem;
		sendObj.ek = "userpopup";
		_self.sendMsg(sendObj, 8, 1);
	},
	
	"search_user_top_frame" : function(str, start){
		var mem = [];
		mem.push(gap.search_cur_ky());
		//{"v": "2.0.0","ky": "CN=김도영,OU=softk2019,O=APG","ty": "kw",  "cra": {"kw": "길동","skp": "50","lmt": "50"}}
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ty = "kw";
		sendObj.lg = gap.curLang;
		sendObj.ky = mem;
		sendObj.cra = {"kw": str ,"skp": start,"lmt": 20, "ep" : true}
		sendObj.ek = "topsearch";
		_self.sendMsg(sendObj, 8, 1);
	},
	
	"search_user_make_chat" : function(str, start){
		var mem = [];
		mem.push(gap.search_cur_ky());
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ty = "kw";
		sendObj.lg = gap.curLang;
		sendObj.ky = mem;
		sendObj.cra = {"kw": str ,"skp": start,"lmt": 20, "ep" : true}
		sendObj.ek = "makechat";
		_self.sendMsg(sendObj, 8, 1);
	},
		
	"search_user_memo_sendto" : function(str, start){
		var mem = [];
		mem.push(gap.search_cur_ky());
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ty = "kw";
		sendObj.lg = gap.curLang;
		sendObj.ky = mem;
		sendObj.cra = {"kw": str ,"skp": start,"lmt": 20, "ep" : true}
		sendObj.ek = "memosendto";
		_self.sendMsg(sendObj, 8, 1);
	},
	
	"search_user_addmember" : function(list){		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ty = "ky";
		sendObj.ky = list;
		sendObj.lg = gap.curLang;
	//	sendObj.cra = {"kw": str ,"skp": start,"lmt": 20, "ep" : true}
		sendObj.ek = "addmember";
		_self.sendMsg(sendObj, 8, 1);
	},
	
	
	"search_user_makeroom" : function(list){		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ty = "ky";
		sendObj.ky = list;
		sendObj.lg = gap.curLang;
	//	sendObj.cra = {"kw": str ,"skp": start,"lmt": 20, "ep" : true}
		sendObj.ek = "makeroom";
		_self.sendMsg(sendObj, 8, 1);
	},
	
	"search_user_makeroom_popup" : function(list){		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ty = "ky";
		sendObj.ky = list;
		sendObj.lg = gap.curLang;
	//	sendObj.cra = {"kw": str ,"skp": start,"lmt": 20, "ep" : true}
		sendObj.ek = "makeroom_popup";
		_self.sendMsg(sendObj, 8, 1);
	},
	
	"search_user_makeroom_org" : function(list){
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ty = "ky";
		sendObj.ky = list;
		sendObj.lg = gap.curLang;
	//	sendObj.cra = {"kw": str ,"skp": start,"lmt": 20, "ep" : true}
		sendObj.ek = "makeroom_org";
		_self.sendMsg(sendObj, 8, 1);
	},
	
	"change_enter_opt" : function(opt){
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();		
		sendObj.enter = String(opt);
		sendObj.ek = "change_ennter_opt";
		_self.sendMsg(sendObj, 9, 33);
	},
	
	"change_locale_languse" : function(locale, language){
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();		
		sendObj.loc = locale;
		sendObj.lg = language;					
		sendObj.ek = "change_locale_languse";
		_self.sendMsg(sendObj, 9, 33);
	},
	
	"change_app_browser" : function(opt){
		//대상의 설치 App에서 기본 브라우저를 웹에서 변경할 수 있게 한다.
		//opt : 0 : 엣지, ,1 : 크롬 , 2 : default
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();	
		sendObj.ei = opt;
		sendObj.ek = "change_status_setting_browser";
		_self.sendMsg(sendObj, 9, 33);
	},
	
	"change_status_setting" : function(){		
		var sendObj = new Object();
		sendObj.v = _self.version;
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
		sendObj.v = _self.version;
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
	
	"make_room_id" : function(uid){
		//1:1일때만 룸키를 이렇게 생성한다.		
		if (uid == ""){
			return false;
		}
		var tuid = uid;
		var cuid = gap.search_cur_ky();
	//	var tuidc = gap.seach_canonical_id(tuid);
	//	var cuidc = gap.seach_canonical_id(cuid);		
//		tuidc = tuidc.replace(/_/gi,"-lpl-");
//		cuidc = cuidc.replace(/_/gi,"-lpl-");		
		var tuidc = tuid;
		var cuidc = cuid;		
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
	
	"make_chatroom_11" : function(uid, name){	
		
		if (uid == ""){
			return false;
		}	
		var tuid = String(uid);
		var cuid = gap.search_cur_ky();
		var tuidc = tuid;
		var cuidc = String(cuid);		
		var tuname = name;
		var cuname = gap.userinfo.rinfo.nm;
		var id = "";	
		var id = _self.make_room_id(uid);
		//기존에  uid 채팅방이 있는지 검색한다.
		id = id.replace(/-lpl-/gi,"_");		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = id ;				//s^사용자ID^사용자ID
		sendObj.cty = 1;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = [{"ky": tuid,"nm": tuname},{"ky": cuid,"nm": cuname} ];
		sendObj.ek = "make_chatroom_11";		
		_self.sendMsg(sendObj, 5, 1);
	},	
	
	"make_chatroom_11_invite" : function(uid){	
		var tuid = String(uid);
		var cuid = gap.search_cur_ky();	
		var tuidc = tuid;
		var cuidc = String(cuid);		
		var tuname = gap.search_username(tuid);
		var cuname = gap.search_username(cuid);
		var id = "";	
		var id = _self.make_room_id(uid);
		//기존에  uid 채팅방이 있는지 검색한다.
		id = id.replace(/-lpl-/gi,"_");		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = id ;				//s^사용자ID^사용자ID
		sendObj.cty = 1;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = [{"ky": tuid,"nm": tuname},{"ky": cuid,"nm": cuname} ];
		sendObj.ek = "make_chatroom_11_invite";
		_self.sendMsg(sendObj, 5, 1);
	},
	
	"make_chatroom_11_only_make" : function(uid, name){	
		var tuid = String(uid);
		var cuid = gap.search_cur_ky();
		var tuidc = tuid;
		var cuidc = String(cuid);		
		var tuname = name;
		var cuname = gap.userinfo.rinfo.nm;
		var id = "";	
		var id = _self.make_room_id(uid);
		//기존에  uid 채팅방이 있는지 검색한다.
		id = id.replace(/-lpl-/gi,"_");		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = id ;				//s^사용자ID^사용자ID
		sendObj.cty = 1;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = [{"ky": tuid,"nm": tuname},{"ky": cuid,"nm": cuname} ];
		sendObj.ek = "make_chatroom_11_only_make";
		_self.sendMsg(sendObj, 5, 1);
	},	
	
	"make_chatroom_11_only_make_with_cid" : function(uid, name, cid){		
		var tuid = String(uid);
		var cuid = gap.search_cur_ky();
		var tuidc = tuid;
		var cuidc = String(cuid);		
		var tuname = name;
		var cuname = gap.userinfo.rinfo.nm;				
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid ;				//s^사용자ID^사용자ID
		sendObj.cty = 1;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = [{"ky": tuid,"nm": tuname},{"ky": cuid,"nm": cuname} ];
		sendObj.ek = "make_chatroom_11_only_make";
		_self.sendMsg(sendObj, 5, 1);
	},
		
	"make_chatroom_11_only_make_org" : function(uid, name){		
		var tuid = String(uid);
		var cuid = gap.search_cur_ky();
		var tuidc = tuid;
		var cuidc = String(cuid);		
		var tuname = name;
		var cuname = gap.userinfo.rinfo.nm;
		var id = "";	
		var id = _self.make_room_id(uid);
		//기존에  uid 채팅방이 있는지 검색한다.
		id = id.replace(/-lpl-/gi,"_");		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = id ;				//s^사용자ID^사용자ID
		sendObj.cty = 1;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = [{"ky": tuid,"nm": tuname},{"ky": cuid,"nm": cuname} ];
		sendObj.ek = "make_chatroom_11_only_make_org";
		_self.sendMsg(sendObj, 5, 1);
	},
	
	"make_chatroom_1N" : function(att){		
	//	var tuid = uid;
		var cuid = gap.search_cur_ky();		
	//	var cuidc = gap.seach_canonical_id(cuid);
		var cuidc = String(cuid);		
		var d = new Date();
        var ckey = d.YYYYMMDDHHMMSS();
		var id = "n^" + cuidc + "^" + ckey;
		id = id.replace(/-lpl-/gi,"_");		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = cuid;
		sendObj.cid = id ;				//s^사용자ID^사용자ID
		sendObj.cty = 100;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = att;
		sendObj.ek = "make_chatroom_1N";
		_self.sendMsg(sendObj, 5, 1);
	},
	
	"make_chatroom_1N_popup" : function(att){		
	//	var tuid = uid;
		var cuid = gap.search_cur_ky();		
	//	var cuidc = gap.seach_canonical_id(cuid);
		var cuidc = String(cuid);		
		var d = new Date();
        var ckey = d.YYYYMMDDHHMMSS();
		var id = "n^" + cuidc + "^" + ckey;
		id = id.replace(/-lpl-/gi,"_");		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = cuid;
		sendObj.cid = id ;				//s^사용자ID^사용자ID
		sendObj.cty = 100;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = att;
		sendObj.ek = "make_chatroom_1N_popup";
		_self.sendMsg(sendObj, 5, 1);
	},
	
	"make_chatroom_1N_with_cid" : function(att, cid){
		var cuid = gap.search_cur_ky();			
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = String(cuid);
		sendObj.cid = cid ;				//s^사용자ID^사용자ID
		sendObj.cty = 100;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = att;
		sendObj.ek = "make_chatroom_1N_with_cid";
		_self.sendMsg(sendObj, 5, 1);
	},	
	
	"make_chatroom_1N_only_make_org" : function(att){		
	//	var tuid = uid;
		var cuid = gap.search_cur_ky();		
	//	var cuidc = gap.seach_canonical_id(cuid);
		var cuidc = String(cuid);		
		var d = new Date();
        var ckey = d.YYYYMMDDHHMMSS();
		var id = "n^" + cuidc + "^" + ckey;
		id = id.replace(/-lpl-/gi,"_");		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = cuid;
		sendObj.cid = id ;				//s^사용자ID^사용자ID
		sendObj.cty = 100;               //1:1 이면 1 - 1:N 이면 100을 입력한다.
		sendObj.att = att;
		sendObj.ek = "make_chatroom_1N_only_make_org";
		_self.sendMsg(sendObj, 5, 1);
	},
	
	"load_chatlog_list" : function(cid){	
		//채팅대화내역 가져오기		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.lmt = 20;
		sendObj.ek = "load_chatlog_list";		
		_self.sendMsg(sendObj, 5, 51);		
	}, 
	
	"load_chatlog_sq" : function(cid, sq){
		//채팅대화내역 가져오기		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.lmt = 1;
		sendObj.sq = sq;
		sendObj.ek = "load_chatlog_sq";		
		console.log(sendObj)
		_self.sendMsg(sendObj, 5, 51);	
	},
	
	"load_chatlog_sq_notice" : function(cid, sq, obj){
		//채팅대화내역 가져오기		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.lmt = 1;
		sendObj.sq = sq;
		sendObj.ek = "load_chatlog_sq_notice";		
		console.log(sendObj)
		_self.sendMsg(sendObj, 5, 51);	
	},
	
	"load_chatlog_list_continue" : function(cid, lastid){	
		//채팅대화내역 가져오기		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.sq = lastid;  //int
		sendObj.dr = false;
		sendObj.lmt = 30;
		sendObj.ek = "load_chatlog_list_continue";
		_self.sendMsg(sendObj, 5, 51);			
	}, 	
	
	"load_chatlog_list_channel" : function(cid){	
		//채널에서 대화 목록 가져 올때		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.lmt = 20;
		sendObj.ek = "load_chatlog_list_channel";		
		_self.sendMsg(sendObj, 5, 51);		
	}, 
	
	"load_chatlog_list_continue_channel" : function(cid, lastid){
		//채팅대화내역 가져오기		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.sq = lastid;  //int
		sendObj.dr = false;
		sendObj.lmt = 30;
		sendObj.ek = "load_chatlog_list_channel_continue";
		_self.sendMsg(sendObj, 5, 51);			
	}, 	
	
	"load_chatlog_list_popup" : function(cid){	
		//Quick 팝업 채팅에서 에서 대화 목록 가져 올때		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.lmt = 20;
		sendObj.ek = "load_chatlog_list_popup";		
		_self.sendMsg(sendObj, 5, 51);		
	}, 
	
	"load_chatlog_list_continue_popup" : function(cid, lastid){	
		//Quick 팝업 채팅에서 에서 대화 목록 추가로 가져올때	
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.sq = lastid;  //int
		sendObj.dr = false;
		sendObj.lmt = 30;
		sendObj.ek = "load_chatlog_list_popup_continue";
		_self.sendMsg(sendObj, 5, 51);	
	}, 
	
	"send_chat_msg" : function(obj){		
		var sendObj = new Object();
		sendObj.v = _self.version;
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
		if (typeof(obj.lang) != "undefined"){
			sendObj.lang = obj.lang;
		}		
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
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();		
		sendObj.cid = obj.cid;
		sendObj.att = obj.att;
		sendObj.ek = "attend_chatroom";		
		_self.sendMsg(sendObj, 5, 5);
	},
	
	"chat_room_file_list" : function(cid){		
		if (cid != ""){			
			var sendObj = new Object();
			sendObj.v = _self.version;
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
			sendObj.v = _self.version;
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
		sendObj.v = _self.version;
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
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.ty = 6;
		sendObj.lmt = 30;
		sendObj.skp = skp_idx;
		sendObj.dr = false;
		sendObj.ek = "chat_room_image_list_right_frame";
		_self.sendMsg(sendObj, 5, 51);	
	},
	
	"chat_room_image_all" : function(cid, url){		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.ty = 6;
		sendObj.dr = false;
		sendObj.ek = "chat_room_image_all_" + url;
		_self.sendMsg(sendObj, 5, 51);	
	},
	
	"chat_room_link_list_search_right_frame" : function(kw, skp_idx){
		//og tag 링크 검색
		var sendObj = new Object();
		sendObj.v = _self.version;
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
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.sq = sq;
		sendObj.ek = "chat_room_read_event";
		_self.sendMsg(sendObj, 5, 45);	
	},
	
	"chat_room_file_search_right_frame" : function(cid, ty_arr, ext_arr, kw, lmt_cnt, skp_idx){
		var sendObj = new Object();
		sendObj.v = _self.version;
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
			}		}
		_self.sendMsg(sendObj, 8, 4); 
	},
	
	"chat_room_all_files" : function(cid, ty_arr, ext_arr, kw, lmt_cnt, skp_idx){
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = (cid == "ext_filter" ? "" : cid);
		sendObj.ty = ty_arr;
		sendObj.tr = "a";
		sendObj.ext = ext_arr;
		sendObj.kw = kw;
		sendObj.lmt = lmt_cnt;
		sendObj.skp = skp_idx;
		sendObj.ek = "chat_room_all_files";
		_self.sendMsg(sendObj, 8, 4); 
	},
	 
	"channel_files_list" : function(lmt_cnt, skp_idx){
		var ty_arr = [5, 6];
		var sendObj = new Object();
		sendObj.v = _self.version;
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
		sendObj.v = _self.version;
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
		sendObj.v = _self.version;
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
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = cid;
		sendObj.sq = sq;
		sendObj.ek = "delete_msg";
		_self.sendMsg(sendObj, 5, 61);	
	},
	
	"buddy_list_status" : function(){		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = 1;
		sendObj.op = 1;
		sendObj.ek = "buddy_list_status";
		_self.sendMsg(sendObj, 3, 101);	
	},
	
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
	
	"change_status" : function (st){		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.st = st;
		sendObj.ek = "change_status";
		_self.sendMsg(sendObj, 3, 1);		
		_wsocket.session_msg(st, "");
	},
	
	"change_status_new" : function (st, msg){		
		var sendObj = new Object();
		sendObj.v = _self.version;
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
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.cid = opt.cid;
		sendObj.tle = opt.title;
		sendObj.ek = "save_chatroom_title";				
		_self.sendMsg(sendObj, 5, 101);	
	},
	
	"fix_top_layer" : function(opt, id){
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.ty = opt;
		sendObj.cid = id;
		sendObj.ek = opt;		
		_self.sendMsg(sendObj, 5, 91);
	},	
	
	"send_box_msg" : function(obj, id){		
		if (obj.sender != ""){			
			var list = obj.sender;
			var pulist = [];
			for (var i = 0 ; i < list.length; i++){
				pulist.push(""+list[i]);
			}
			var sendObj = new Object();
			sendObj.v = _self.version;
			sendObj.id = id;
			sendObj.ky = pulist;
			sendObj.ty = gap.search_cur_ky(); 
			sendObj.ft = [10, 20, 15];  //10모바일, 15, 태블릿, 20 웹
			sendObj.f1 = JSON.stringify(obj);
			sendObj.f4 = "webview_";			
			_self.sendMsg(sendObj, 100, 1);			
		}		
	},
	
	"send_todo_msg" : function(obj){		
		if (obj.sender != ""){
			var list = obj.sender;
			var pulist = [];
			for (var i = 0 ; i < list.length; i++){
				pulist.push(""+list[i]);
			}			
			var sendObj = new Object();
			sendObj.v = _self.version;
			sendObj.id = "todo";
		//	sendObj.ky = obj.sender;
			sendObj.ky = pulist;
			sendObj.ty = gap.search_cur_ky();
			sendObj.ft = [10, 20, 15];
			sendObj.f1 = JSON.stringify(obj);
			sendObj.f4 = "webview_";
			_self.sendMsg(sendObj, 100, 1);
		}		
	},
	
	"send_drive_msg" : function(obj){	
		if (obj.sender != ""){			
			var list = obj.sender;
			var pulist = [];
			for (var i = 0 ; i < list.length; i++){
				pulist.push(""+list[i]);
			}			
			var sendObj = new Object();
			sendObj.v = _self.version;
			sendObj.id = "drive";
		//	sendObj.ky = obj.sender;
			sendObj.ky = pulist;
			sendObj.ty = gap.search_cur_ky();
			sendObj.ft = [10, 20, 15];
			sendObj.f1 = JSON.stringify(obj);
			sendObj.f4 = "webview_";
			_self.sendMsg(sendObj, 100, 1);
		}
	},
	
	"send_msg_other" : function(obj, id){
		
		if (obj.sender != ""){			
			var list = obj.sender;
			var pulist = [];
			for (var i = 0 ; i < list.length; i++){
				pulist.push(""+list[i]);
			}			
			var sendObj = new Object();
			sendObj.v = _self.version;
			sendObj.id = id;
		//	sendObj.ky = obj.sender;
			sendObj.ky = pulist;
			sendObj.ty = gap.search_cur_ky();
			sendObj.ft = [10, 20, 15];
			sendObj.f1 = JSON.stringify(obj);
			sendObj.f4 = "webview_";
			_self.sendMsg(sendObj, 100, 1);
		}
	},
	
	
	"send_error_log" : function(obj){					
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.sty = 5;  //: 잘못수신된 service type (integer)
		sendObj.ssty = 21;  //잘못수신된 상세 service type (integer)
		sendObj.ky = obj.ky;   //수신 받은 사용자 key (string)
		sendObj.cid = obj.cid;   //5,21인 경우 필수 (string)
		sendObj.iuid = "" //(이것을 표현이 가능한지는 확인 필요) (64bit integer)
		_self.sendMsg(sendObj, 51, 7);
		// ex) {"v":"2.0.1", "sty":5, "ssty":21, "ky":"10im0967", "cid":"s^xxx^yyy", "iuid":268293859519496705}
	},	
	
	"search_chatroom_inner" : function(kw, id){
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();
		sendObj.kw = kw;
		sendObj.cid = id;
		sendObj.ek = kw;		
		_self.sendMsg(sendObj, 5, 104);
	},
	
	"search_chatroom_list" : function(kw, type){
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();		
		sendObj.ek = type;			
		sendObj.ty = "nf";	
		sendObj.kw = kw;
	//	sendObj.ek = type;
		_self.sendMsg(sendObj, 5, 41);
	},
	
	"get_memo_list" : function(ty){
		// 쪽지 목록 가져오기
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();		
		sendObj.ty = ty;	
		_self.sendMsg(sendObj, 7, 4);
	},
	
	"set_memo_read" : function(sq){
		// 쪽지 읽음 처리	
		var sq_arr = [];
		sq_arr.push(sq);		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();		
		sendObj.all = false;
		sendObj.sq = sq_arr;
		console.log(sendObj);
		_self.sendMsg(sendObj, 7, 14);
	},
	
	"get_memo_body" : function(ty, sq){
		// 쪽지 상세 정보 가져오기
		var sq_arr = [];
		sq_arr.push(parseInt(sq));		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();		
		sendObj.sq = sq_arr;
		sendObj.ty = ty;
		_self.sendMsg(sendObj, 7, 6);
	},
	
	"send_memo" : function(obj){
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = obj.ky;
		sendObj.rsv	= obj.rsv;
		if (obj.rsv){
			sendObj.dt = obj.dt;
		}
		sendObj.nm = obj.nm;
		sendObj.enm = obj.enm;
		sendObj.el = obj.el;
		sendObj.tle = obj.tle;
		sendObj.msg = obj.msg;
		sendObj.usr = obj.usr;
		sendObj.att = obj.att;
		_self.sendMsg(sendObj, 7, 1);
	},
	
	"remove_memo" : function(ty, sq, is_noti){
		// 쪽지삭제
		var sq_arr = [];
		sq_arr.push(parseInt(sq));		
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();	
		sendObj.all = false;
		sendObj.sq = sq_arr;
		sendObj.ty = ty;
		sendObj.ek = (is_noti ? "noti" : "normal");
		_self.sendMsg(sendObj, 7, 11);
	},
	
	"translate_list" : function(){				
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.ky = gap.search_cur_ky();			
		_self.sendMsg(sendObj, 11, 111);
	},
	
	"error_check" : function(obj){
		var sendObj = new Object();
		sendObj.v = _self.version;
		sendObj.id = gap.userinfo.rinfo.id;
		sendObj.tck = obj.tck;
		sendObj.iuid = obj.iuid;		
		_self.sendMsg(sendObj, 1000, 4);
	},
	
	"make_msg_id" : function(){		
		var id = _self.search_cur_ky();	
		var ran = new Date().getTime() + "_" + _self.makeRandom(5);		
		return id + "_" + ran;		
	},
	
	"makeRandom" : function(length){
		return Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
	},
	
	"search_cur_ky" : function(){
		var cky = gap.userinfo.rinfo.ky;
		return cky;
	}
}
