function gMainAlarm() {
	this.btn_chat_show = null;
	this.main_btn = null;
	this.main_btn_wrap = null;
	this.main_btn_cnt = null;
	this.layer;
	this.is_init = false;
	this.is_init_buddy = false;
	this.click_left_menu = false;
}

gMainAlarm.prototype = {
	"init" : function(){
		if (this.is_init) return;
	
		var _self = this;
		var html = 
			'<div class="btn-quick-alarm-wrap">' +
			'	<button type="button" class="btn-quick-alarm">알림창</button>' +
			'	<div id="quick_alarm_cnt" class="quick-alarm-cnt"></div>' +
			'</div>';
		
		this.main_btn_wrap = $(html);
		this.main_btn = this.main_btn_wrap.find('.btn-quick-alarm');
		this.main_btn_cnt = this.main_btn_wrap.find('.quick-alarm-cnt');
		
		$('body').prepend(this.main_btn_wrap);
		
		// 레이어 셋팅
		this.initLayer();
		
		// 버튼 클릭시 이벤트 처리
		this.main_btn.on('click', function(){
		
			_self.cur_cid_popup = '';
			
			
			if ($(_self.main_btn_wrap).hasClass('show-layer')) {
				// 기존에 레이어가 열려있을 경우 닫아줘야 함
				_self.hideLayer();
				_self.hideMember();
				_self.chat_position = "chat";
				gptpt.voice_end();
			} else {
				_self.showLayer();
			//	gap.write_log_box('btn_quick_chat', '퀵채팅 버튼 클릭', 'button', 'pc');
			}
			var ppl = $("#quick_alarm_wrap").attr("class");
			if (ppl.indexOf("expand") > -1){
				$("#quick_alarm_wrap .scale").click();
			}
		});
		
		this.is_init = true;
	},
	"showChatButton" : function(){
		if (!this.is_init) return;
		
		var _self = this;
		
		clearTimeout(this.btn_chat_show);
		
		if (gap.cur_window == 'boxmain') {
			//_self.main_btn_wrap.addClass('home');
			var delay = 1500;
		} else {
			//_self.main_btn_wrap.removeClass('home');
			var delay = 500;
		}
		
		this.refreshPos();
		
		this.btn_chat_show = setTimeout(function(){
			_self.main_btn_wrap.addClass('show');			
		}, delay);
	},
	
	"hideChatButton" : function(){
		if (!this.is_init) return;
		
		var _self = this;
		clearTimeout(this.btn_chat_show);
		_self.main_btn_wrap.removeClass('show');
	},
	
	"setCount" : function(cnt){
		cnt = isNaN(cnt) ? 0 : parseInt(cnt);
		if (this.main_btn_wrap){
			if (cnt > 0) {
				if (cnt > 99) cnt = '99+';
				this.main_btn_cnt.text(cnt);
				this.main_btn_wrap.addClass('has-cnt');
			} else {
				this.main_btn_wrap.removeClass('has-cnt');
			}
		}

	},
	
	"initLayer" : function(){
		var _self = this;
		var html = 
			'<div id="quick_alarm_wrap" class="quick_alarm_wr list-page">' +
			'	<div class="quick_alarm">' +
			
			// 타이틀
			'		<div class="top-tit">' +
			'			<p><span id="quick_menu_title" class="menutit">' + gap.lang.chatroom + '</span></p>' +
			'			<div class="l_btn_wr">' +
			'				<button type="button" id="btn_alarm_golist" class="ico-tit left"></button>' +
			'			</div>' +
			'			<div class="r_btn_wr">' +
			'				<button type="button" class="ico-tit scale"></button>' +
			'				<button type="button" id="btn_alarm_buddysearch" class="ico-tit buddy_search"></button>' +
			'				<button type="button" id="btn_alarm_chatsearch" class="ico-tit chat_search"></button>' +
			'				<button type="button" id="btn_alarm_member" class="ico-tit mem_list"></button>' +
			'			</div>' +
			'			<div class="txt-search-wr txt-buddy-search">' +
			'				<input type="text" id="txt_alarm_buddysearch" class="txt-search" placeholder="' + gap.lang.input_search_query2 + '">' +
			'				<div id="btn_buddy_org" class="org-ico"></div>' +
			'			</div>' +
			'			<div class="txt-search-wr txt-chat-search">' +
			'				<input type="text" id="txt_alarm_chatsearch" class="txt-search" placeholder="' + gap.lang.inpuser + '">' +
			'				<div class="search-ico"></div>' +
			'			</div>' +
			'		</div>' +
			
			// 버디 리스트
			'		<div id="qbd_list" class="qbd_wr quick-pannel">' +
			'			<div id="qbd_list_sub" class="qbd-page" style="height:100%;"></div>' +
			'		</div>' +
			
			// 채팅 리스트
			'		<div id="alarm_list" class="alarmlist_wr quick-pannel">' +
			'			<div id="alarm_list_sub" style="height:100%;"></div>' +
			'		</div>' +
			
			// 채팅
			'		<div id="alarm_chat" class="alarmchat_wr">' +
			
			'			<div id="alarm_notice" class="notice-top">' +
			'				<div class="notice-detail-wr">' +
			'					<div class="notice-detail-inner">' +
			'						<div class="notice-head-wr">' +
			'							<div class="ico-notice"></div>' +
			'							<div class="notice-head"></div>' +
			'						</div>' +
			'						<div class="reply-cnt">0</div>' +
			'						<div class="ico-expand"></div>		' +
			'					</div>' +
			'					' +
			'					<div class="notice-writer"></div>' +
			'					<div class="notice-btn-wr">' +
			'						<button type="button" class="btn-notice-detail">' + gap.lang.view_detail + '</button>' +
			'						<button type="button" class="btn-notice-modify">' + gap.lang.basic_modify + '</button>' +
			'						<button type="button" class="btn-notice-remove">' + gap.lang.basic_delete + '</button>' +
			'					</div>' +
			'				</div>' +
			'			</div>' +
			
			'			<div id="alarm_chat_top" class="chat-area">' +		
			'				<div id="alarm_chat_sub"></div>' +
			'			</div>' +			
			'			<div class="bot">' +
			'				<div class="quick_inputarea">' +
			
			'					<div id="total-progress-popup-chat" class="" style="height:1px;width: calc(100% - 20px); margin-left:10px">' +
			'						<div class="progress-bar" style="width:0%;background:#337ab7" data-dz-uploadprogress></div>' +
			'					</div>' +
			
			'					<textarea id="alarm_chat_msg" oninput="gap.auto_height_check_popup(this)" placeholder="' + gap.lang.input_message + '"></textarea>' +
			'					<button type="button" id="alarm_chat_file" class="ico-input-file"></button>' +
			'					<button type="button" id="alarm_chat_send" class="ico-input-send"></button>' +
			'					<img class="ico-reply" src="' + root_path + '/resource/images/icon/ic_reply_gr.png"/>' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			
			// K-GPT
			'		<div id="alarm_kgpt" class="alarmchat_wr" style="display: none;">' +
			'			<div id="alarm_kgpt_top" class="chat-area" style="background-color:#fff; padding-right:5px">' +		
			'				<div id="alarm_kgpt_sub" style="padding:0px 10px"></div>' +
			'			</div>' +			
			'			<div class="bot">' +
			'				<div class="quick_kgpt_inputarea">' +
			'					<textarea id="alarm_kgpt_msg" oninput="gap.auto_height_check_popup(this)" placeholder="' + gap.lang.va23 + '"></textarea>' +
			'					<button type="button" id="alarm_kgpt_mic" class="ico-input-mic"></button>' +			
			'					<button type="button" id="alarm_kgpt_send" class="ico-input-send"></button>' +
			'				</div>' +
			'			</div>' +			
			'		</div>' +
						
			// 햄버거 메뉴
			//'		<div id="alarm_chat_menu" class="alarmmenu_wr"></div>' +
			'		<div id="alarm_dim" class="alarm-dim"></div>' +
			
			
			//'		</div>' +
			
			// 하단 메뉴
			'		<div class="bot bot-menu">' +
			'			<div class="quick_alarm_menu">' +
			'				<ul>' +
			'					<li id="btn_quick_buddy" class="q_buddy">' + gap.lang.buddylist + '</li>' +
			'					<li id="btn_quick_chat" class="q_chat">' + gap.lang.chatroom + '</li>' +
			'					<li id="btn_quick_kgpt" class="q_kgpt">K-GPT</li>' +			
			'				</ul>' +
			'			</div>' +
			'		</div>' +
			
			
			'	</div>' +
			'</div>';
		
		this.layer = $(html);
		
		this.main_btn_wrap.prepend(this.layer);
		

		// 하단 대화상대 버튼
		$('#btn_quick_buddy').on('click', function(){
			//if ($(this).hasClass('on')) return false;			
			$('.quick_alarm_menu li').removeClass('on');
			$(this).addClass('on');
			
			
			
			$('#quick_alarm_wrap').addClass('buddylist');
			
			
			$('#quick_menu_title').text(gap.lang.buddylist);
			
			$('.quick-pannel').hide();
			$('#qbd_list').show();
			
			
			// 버디리스트를 표시 한적이 없으면 표시해준다
			if (!_self.is_init_buddy) {
				_self.setBuddyListPage();
			}
		});
		
		// 하단 채팅 버튼
		$('#btn_quick_chat').on('click', function(){
			if ($(this).hasClass('on')) return false;
			$('.quick_alarm_menu li').removeClass('on');
			$(this).addClass('on');
			
			$('#quick_alarm_wrap').removeClass('buddylist');
			
			$('#quick_menu_title').text(gap.lang.chatroom);
			
			$('#btn_alarm_chatsearch').show();
			$('.quick-pannel').hide();
			$('#alarm_list').show();
			
			gBody.chatroom_draw('main_alarm');
		});
		
		
		//$('#btn_quick_chat').click();
		
		// 하단 K-GPT 버튼
		$('#btn_quick_kgpt').on('click', function(){
			if ($(this).hasClass('on')) return false;
			$('.quick_alarm_menu li').removeClass('on');
			$(this).addClass('on');
			
			$('#quick_alarm_wrap').removeClass('buddylist');
			$('#quick_alarm_wrap').removeClass('list-page');
			
			$('#quick_menu_title').text('K-GPT');
			
			$('#btn_alarm_chatsearch').hide();
			$('#btn_alarm_member').hide();
			$('.quick-pannel').hide();
			$('#alarm_chat').hide();						
			$('#alarm_kgpt').show();
			
			
			//신규 추가

			var ppl = $("#quick_alarm_wrap").attr("class");
			if (ppl.indexOf("expand") > -1){				
			}else{
				$("#quick_alarm_wrap .scale").click();
			}
			$("#alarm_kgpt_sub").empty();
			$("#alarm_kgpt_msg").focus();
			$("#alarm_kgpt_top").mCustomScrollbar({
				theme:"dark",
				autoExpandScrollbar: true,
				scrollButtons:{
					enable: true
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
	
			
		//	gBody.chatroom_draw('main_alarm');
		});				
		
		// 확대보기
		this.layer.find('.scale').on('click', function(){
			$(_self.layer).toggleClass('expand');
		});
		
		// 리스트로 돌아가기
		$('#btn_alarm_golist').on('click', function(){
			_self.chat_position = "chat";
			_self.changePage('list');
			
			var ppl = $("#quick_alarm_wrap").attr("class");
			if (ppl.indexOf("expand") > -1){
				$("#quick_alarm_wrap .scale").click();
			}
			
			// 채팅방 상태인 경우 새로 그려줘야 함
			if ($('#btn_quick_chat').hasClass('on')) {
				gBody.chatroom_draw('main_alarm');
			}
			
			// K-GPT 상태인 경우 채팅방 클릭
			if ($('#btn_quick_kgpt').hasClass('on')) {
				$('#alarm_kgpt').hide();
				$('#btn_quick_chat').click();
			}
		});
		
		// 멤버보기
		$('#btn_alarm_member').on('click', function(){
			if (_self.layer.hasClass('chat-menu')) {
				_self.hideMember();
			} else {
				_self.showMember();
			}
		});
		
		// 검색하기 (대화상대)
		$('#btn_alarm_buddysearch').on('click', function(){
			$('#quick_alarm_wrap').toggleClass('buddy-search');

			// 검색 기능 관련
			if ($('#quick_alarm_wrap').hasClass('buddy-search')){
				// 검색하기 클릭
				$('#txt_alarm_buddysearch').val('');
				setTimeout(function(){
					$('#txt_alarm_buddysearch').focus();
				}, 200);
			} else {
				// 닫기 클릭
				if (_self.main_btn_wrap.find('.qbuddy-search-list').length > 0) {
					// 검색 결과가 뿌려지고 있으면 검색 클로징
					_self.setBuddyListPage();
				}
			}
		});
		
		// 검색하기 (대화상대 검색)
		$('#txt_alarm_buddysearch').on('keydown', function(e){
			var txt = $.trim($(this).val());
			if (txt == '') return;
			
			if (e.keyCode == 13) {
				if (txt.length == 1) {
					mobiscroll.toast({message:gap.lang.valid_search_keyword, color:'danger'});
					return;
				}
				
				_self.buddySearch(txt);
				$(this).val('');
			}
		});
		
		// 검색하기 (대화상대 조직도)
		$('#btn_buddy_org').on('click', function(){
			gap.showBlock();
			window.ORG.show(
				{
					'title': gap.lang.tab_org,
					'single': false,
					'show_ext' : false, // 외부 사용자 표시 여부
					'select': 'person' // [all, team, person]
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length == 0) return;
						var infos = [];
						for (var i = 0; i < items.length; i++){
							if(typeof items[i] == "undefined" || items[i] == null){
							} else {
								var _res = gap.convert_org_data(items[i]);
								infos.push(_res);
							}
						}
						_self.buddySearchResult(infos);
					},
					onClose: function(){
						gap.hideBlock();
					}
				}
			);			
		});
		
		
		
		// 검색하기 (채팅)
		$('#btn_alarm_chatsearch').on('click', function(){
			$('#quick_alarm_wrap').toggleClass('chat-search');

			// 검색 기능 관련
			if ($('#quick_alarm_wrap').hasClass('chat-search')){
				// 검색하기 클릭
				$('#txt_alarm_chatsearch').val('');
				setTimeout(function(){
					$('#txt_alarm_chatsearch').focus();
				}, 200);
			} else {
				// 닫기 클릭
				if (gBody.searchMode_draw_popup == 'T') {
					gBody.searchMode_draw_popup = 'F';
					gBody.chatroom_draw('main_alarm');					
				}
			}
		});
		
		// 검색하기 (채팅 검색)
		$('#txt_alarm_chatsearch').on('keydown', function(e){
			var txt = $.trim($(this).val());
			if (txt == '') return;
			
			if (e.keyCode == 13) {
				_self.chatSearch(txt);
			}
		});
		$('#txt_alarm_chatsearch').siblings('.search-ico').on('click', function(){
			var txt = $.trim($('#txt_alarm_chatsearch').val());
			if (txt == '') return;
			_self.chatSearch(txt);
		});
		
		
		// Dim 클릭시 멤버 보기 닫기
		$('#alarm_dim').on('click', function(){
			_self.hideMember();
		});
		
		// 텍스트 박스에 포커싱 들어가면 멤버보기 닫기
		$('#alarm_chat_msg').on('focus', function(){
			_self.hideMember();
		});
		
		
		
		// 채팅방에 메세지 입력 포커스
		$('#alarm_chat_msg').on('keypress', function(evt){
			_self.chat_position = "popup_chat";
			
			var enter_opt = gBody.enter_opt;
			if (enter_opt == ""){
				enter_opt = "1";
			}				
			
			if (evt.keyCode == 13 && !evt.shiftKey){          	
				
				if (enter_opt == "1"){
					gBody.send_msg(evt);                
				}else if (enter_opt == "2"){
					//다음줄로 내려간다.    
					gBody.enter_next_line(evt);
				}
			}           
			if (evt.keyCode == 13 && evt.shiftKey) {
				
				if (enter_opt == "1"){
					//다음줄로 내려간다.
					gBody.enter_next_line(evt);
				}else{
					gBody.send_msg(evt);     
				}       	
			}			
		});
		
		// 메세지 발송
		$("#alarm_chat_send").on("click", function(e){
			gBody.send_msg(e)
		});
		
		// 메세지 첨부
		$("#alarm_chat_file").on("click", function(e){
			_self.chat_position = "popup_chat";		
			
			$("#open_attach_window").click();		
		});
		
		$(".quick_alarm").on('keydown.confirmback', function(e){
			// backspace
			if (e.keyCode == 8) {
				
				var tar = $(e.target).is("input");
				var tar2 = $(e.target).is("textarea");	
				var foc = $(':focus');
				if (tar || tar2){					
				}else{
					$('#btn_alarm_golist').click();
				}
				
			}
		})
		
		// K-GPT 질문 입력 포커스
		$('#alarm_kgpt_msg').on('keypress', function(evt){
			_self.chat_position = "popup_chat";
			
			if (evt.keyCode == 13){			
				$("#alarm_kgpt_send").click();
			//	evt.stopPropagation();
        		evt.preventDefault();
			//	return false;
			}           
		});		
		
		// K-GPT 질문
		$("#alarm_kgpt_send").on("click", function(e){
			
			gptapps.dis_id = "alarm_kgpt_sub";
			gptapps.dis_scroll = "alarm_kgpt_top";
			var msg =$('#alarm_kgpt_msg').val();
			gptpt.send_ai_request(msg);
			$('#alarm_kgpt_msg').val("");
			$('#alarm_kgpt_msg').focus();
			
		//	$("#alarm_kgpt_msg").attr("rows", 0);
		//	$("#alarm_kgpt_msg").css("height", "34px");
       	// 	$("#alarm_kgpt_msg").attr("placeholder",gap.lang.input_message);
       // 	e.stopPropagation();
        //	e.preventDefault();
        	//return false;
		});	
		
		//보이스 버튼 클릭시
		$("#alarm_kgpt_mic").off().on("click", function(e){
			
			gptapps.dis_id = "alarm_kgpt_sub";
			gptapps.dis_scroll = "alarm_kgpt_top";
			gptpt.voice_ok = true;
			gptpt.recognition = new webkitSpeechRecognition(); //클릭할 때 초기화 하지 않으면	클릭 한만큼 응답이 추가되어 여기서 초기화 해야 한다.
			
			var rr = $(this).attr("class");
			if (rr == "going"){
				//음성을 제거한다.
				console.log("제거한다....")
				$(this).removeClass("going");
				if (gptpt.recognition){
					gptpt.stop_click = true;
					gptpt.recognition.stop();
					return;
				}				
			}
			$(this).toggleClass("going");			
			gptpt.recognition.lang = window.navigator.language;
			gptpt.recognition.interimResults = false;
			gptpt.recognition.continuous = false;			
			gptpt.recognition.start();			
			gptpt.recognition.addEventListener('result', (event) =>{
				
				console.log("gptpt.voice_ok : " + gptpt.voice_ok)
				const result = event.results[event.results.length - 1][0].transcript;	
				
				gptpt.stop_click = false;
					
				console.log(result.trim())
				if (result.trim() == "마이크 꺼"){
					gptpt.stop_click=true;
					gptpt.recognition.stop(); 
					gptpt.stop_click=true;
					return false;
				}else if (gptpt.isValueInArray2(result.trim())){
				//	console.log("새글 작성합니다.");
					$("#ai_portal_left_content .btn_create_menu").click();
				}else if (gptpt.isValueInArray(result.trim())){
				//	console.log("보이스 실행하기")
					gptpt.voice_ok = true;
				//	$("#btn_mike").removeClass("going");
				//	$("#btn_mike").addClass("going");
				}else{
					if (gptpt.voice_ok || gptpt.current_code != ""){
					//	$("#search_work").val(result.trim());
					//	$("#btn_work_req").click();
						var msg = result.trim();
						var checked_list = $("#ai_mydata_dis").find("input:checked");
						if (checked_list.length > 0){
							gptpt.send_ai_request_mydata(msg, checked_list);
						}else{
							gptpt.send_ai_request(msg);
						}			
						//gptpt.send_ai_request(result.trim());
					}else{
						mobiscroll.toast({message:"'HI GPT'를 불러주세요", color:'danger'});
						return false;
					}

				}				
			});		
			gptpt.recognition.addEventListener("end", () => {
				
				if (!gptpt.voice_ok){
			//		$("#btn_mike").removeClass("going");
				}
			  	
			  	console.log("Speech recognition service disconnected");
			  //	console.log("stop_click : ", stop_click);
			  gptpt.voice_ok = false;
			  $("#alarm_kgpt_mic").removeClass("going");
			  if (!gptpt.stop_click){
				//	setTimeout(function(){
				//		gptpt.voice_ok = true;
				//		gptpt.stop_click = false;
				//		gptpt.recognition.start();
				//	}, 3000)
				 }else{
					 if (gptpt.recognition){
						gptpt.recognition.stop();
					}
					
				}
			//  gptpt.stop_click = false;
			});
		});
		
		//새글 작성하기
		$("#ai_portal_left_content .btn_create_menu").off().on("click", function(e){
			gptpt.set_roomkey(gptpt.cur_roomkey, "cur_roomkey");
			
			$(".menu_li").removeClass("active");
			$("#ai_first_msg").show();
			$("#"+gptapps.dis_id).empty();
			$("#search_work").val("");
			$("#ai_result_dis_top").hide();
			gptapps.dis_id = "alarm_kgpt_sub";
			gptapps.dis_scroll = "alarm_kgpt_top";
			gptpt.current_code = "";	

			gptpt.voice_end();
		});
		
		
	},
	
	"showLayer" : function(){
		gBody.searchMode_draw_popup = "F";
		gBody.chatroom_draw('main_alarm');
	//	this.chatroomDraw();
		
		this.changePage('list');
		this.main_btn_wrap.addClass('show-layer');
		this.layer.addClass('show');
		
		/*
		// 안읽은 건수가 있으면 채팅창을 띄우고 그렇지 않으면 대화상대를 표시
		var has_cnt = this.main_btn_wrap.hasClass('has-cnt');
		if (has_cnt) {
			$('#btn_quick_chat').click();
		} else {
			$('#btn_quick_buddy').click();
			
			// 버디리스트 셋팅
			this.setBuddyListPage();
		}
		*/
		
		// 무조건 채팅방이 열리도록 변경
		$('#btn_quick_chat').click();
	},
	
	"hideLayer" : function(){
		this.main_btn_wrap.removeClass('show-layer');
		this.layer.removeClass('show');
		
		/*
		 * 아래 기능 적용 안하기로 함
		// 채팅방을 열어놓고 닫는 경우 리스트 페이지로 이동한다
		if (!this.main_btn_wrap.hasClass('list-page')) {
			$('#btn_alarm_golist').click();
		}
		*/
		
		$('#quick_alarm_wrap').removeClass('buddy-search');
		$('#quick_alarm_wrap').removeClass('chat-search');
		
		this.is_init_buddy = false;
	},
	
	"refreshPos" : function(){
		/*
		 * 채팅 버튼의 위치는 크게 4가지로 나뉨
		 * 1. boxmain (홈)
		 *   : calenar
		 *   : portlet
		 * 2. channel (업무방)
		 *   : main - side open
		 *   : main - side close
		 *   : chat - side open
		 *   : chat - side close
		 * 3. chat (채팅)
		 *   : main - side open
		 *   : main - side close
		 *   : chat - side open
		 *   : chat - side close
		 * 4. etc (기타)
		 */
		
		var cur_page = gap.cur_window;
		var pos = {
			bottom: '30px',
			right: '30px'
		}
		
		var is_opacity = false;
		
		// 1. 홈
		if (cur_page == 'boxmain') {
			
			var is_cal = $('#main_content').hasClass('show-maincal');
			if (is_cal) {
				pos.bottom = '100px';
				pos.right = '383px';
			} else {
				pos.bottom = '100px';
				pos.right = '30px';
			}
			
//			console.log('위치:홈');
			
		// 2. 업무방
		} else if (cur_page == 'channel') {
			var is_main = $('#channel_main').is(':visible');
			// 업무방 메인
			if (is_main) {
				if ($('#channel_main_right_folder').hasClass('on')) {
					// 업무방 메인 - side open
					pos.bottom = '30px';
					pos.right = '335px';
//					console.log('위치:업무방 메인-side open');
				} else {
					// 업무방 메인 - side close
					pos.bottom = '30px';
					pos.right = '53px';
//					console.log('위치:업무방 메인-side close');
				}
			// 업무방 대화
			} else {
				if ($('#channel_right').is(':visible')){
					// 업무방 대화 - side open
					pos.bottom = '30px';
					pos.right = '30px';
//					console.log('위치:업무방 대화-side open');
				} else {
					// 업무방 대화 - side close
					pos.bottom = '66px';
					pos.right = '40px';
					is_opacity = true;
//					console.log('위치:업무방 대화-side close');
				}
			}
			
		// 3. 채팅
		} else if (cur_page == 'chat') {
			var is_main = $('#center_content').is(':visible');
			// 채팅 메인
			if (is_main) {
				if ($('#user_profile').is(':visible') && $('#user_profile').position().top == 0){
					// 채팅 메인 - side open
					pos.bottom = '30px';
					pos.right = '30px';
//					console.log('위치:채팅 메인-side open');
				} else {
					// 채팅 메인 - side close
					pos.bottom = '30px';
					pos.right = '55px';
//					console.log('위치:채팅 메인-side close');
				}
			// 채팅 대화
			} else {
				if ($('#chat_profile').is(':visible')){
					// 채팅 대화 - side open
					pos.bottom = '30px';
					pos.right = '30px';
//					console.log('위치:채팅 대화-side open');
				} else {
					// 채팅 대화 - side close
					pos.bottom = '75px';
					pos.right = '85px';
					is_opacity = true;
//					console.log('위치:채팅 대화-side close');
				}
			}
			
		} else if (cur_page == 'org') {
			if ($('#org_right').is(':visible')) {
				// 조직도 - side open
				pos.bottom = '30px';
				pos.right = '345px';
//				console.log('위치:조직도-side open');
			} else {
				// 조직도 - side close
				pos.bottom = '30px';
				pos.right = '30px';
//				console.log('위치:조직도-side close');
			}
			
		} else if (cur_page == 'collect') {
			if ($('#qna_list').is(':visible')) {
				// 취합 - side open
				pos.bottom = '30px';
				pos.right = '345px';
//				console.log('위치:취합-side open');
			} else {
				// 취합 - side close
				pos.bottom = '30px';
				pos.right = '30px';
//				console.log('위치:취합-side close');
			}
		} else if (cur_page == "portal_search"){
			this.main_btn.hide();
			$("#quick_alarm_cnt").hide();
			
		// 그 외 기타
		} else {
			pos.bottom = '30px';
			pos.right = '30px';
//			console.log('위치:공통');
		}
		
		if (this.main_btn_wrap){
			this.main_btn_wrap.css(pos);
		
			// 업무방 대화, 채팅방 대화창은 투명하게 조절
			if (is_opacity) {
				this.main_btn.addClass('opacity');
			} else {
				this.main_btn.removeClass('opacity');
			}
		}
		
	},
	
	"setEmpty" : function(){
		var html;
		if (gBody.searchMode_draw_popup == 'T') {
			// 검색인 경우
			html = 
				'<div class="alarmlist_bg">' +
				'	<div class="chat">' +
				'		<p class="tit">' + gap.lang.searchnoresult +
				//'			<span>' + gap.lang.chat_disp + '</span>' +
				'		</p>' +
				'	</div>' +
				'</div>';
		} else {
			html = 
				'<div class="alarmlist_bg">' +
				'	<div class="chat">' +
				'		<p class="tit">' + gap.lang.chat_empty +
				'			<span>' + gap.lang.chat_disp + '</span>' +
				'		</p>' +
				'	</div>' +
				'</div>';
		}
		
		$('#alarm_list_sub').empty();
		$('#alarm_list_sub').append(html);
	},
	
	"changePage" : function(page){
		var _self = this;

		// 답장 관련 UI 초기화
		gBody.replyChatBottomHide('alarm');
		
		if (page == 'chat') {
			
			// 표시할 때 깨지는 오류 처리
			clearTimeout(this.fix_chat);
			$('#alarm_chat').show();
			
			this.layer.removeClass('list-page');
			this.chat_focus = setTimeout(function(){
				$('#alarm_chat_msg').focus();
			}, 300);
			
			// 공지 체크
			gBody.drawNoticeChat(true);
			
		} else if (page == 'list') {
			// 아이디값 초기화
			this.cur_cid_popup = '';
			
			if ($('#quick_alarm_wrap').hasClass('buddylist')) {
				this.setTitle(gap.lang.buddylist);
			} else {
				this.setTitle(gap.lang.chatroom);
			}
			
			clearTimeout(this.chat_focus);
			this.layer.addClass('list-page');
			this.hideMember();

			// 채팅창 애니메이션이 끝나면 숨겨줘야 깨지지 않음
			this.fix_chat = setTimeout(function(){
				$('#alarm_chat').hide();
			}, 200);
			
		}
	},
	
	"chatroomDraw" : function(){
		var _self = this;
		var obj = gap.chat_room_info;
		var sbj = obj.ct;
		var fix_count = 0;	
		var unread_count = 0;		
		//팝업 채팅에서 사용할 대화방 리스트 묶음 함수
		var alarm_infos = [];
		for (var i = 0; i < sbj.length; i++){
			//팝업 채팅에 표시할 각 방의 정보 변수
			var alarm_data = new Object();
			var info = sbj[i];			
			var rlist = gap.delete_user_set(info.att);
			var wd = info.wdt;
			var wdfull = wd;
			info.att = rlist;
			alarm_data.wd = wd;					
			wd = gap.change_date_localTime_only_date(wd.toString());			
			var rdate = gap.change_date_default(wd);
			var ddx = String(wd).substring(0,8);
			
			var temail = "";
			var tuid = "";
			var nam = "";
			var last_sq = "";		
			if (info.cty == 10){				
				last_sq = info.rsq;
				tuid = info.att[0];			
				if (gap.cur_el == tuid.el){
					nam = tuid.nm;
				}else{
					nam = tuid.enm;
				}
			}else{
				for (var j = 0 ; j < info.att.length; j++){
					var spl = info.att[j];				
					if (gap.search_cur_ky() == spl.ky){
						last_sq = spl.rsq;
					}else{
						tuid = spl;
						//내가 한국어면 무조건 한국어 ==> 같은 언어 타입이면 자국어 다른 언어 타입이면 영어로 표시
						if (gap.cur_el == "ko"){
							nam = spl.nm;
						}else{
							if (gap.cur_el == spl.el){
								nam = spl.onm;
							}else{
								nam = spl.enm;
							}
						}						
						break;
					}
				}
			}
			
			var person_img = gap.person_profile_photo(tuid);	
			if (info.att.length > 2){
				person_img = gap.team_photo();
			}			
			var html = "";
			var time = gap.change_date_localTime_only_time(wdfull.toString());					
			var bun = 0;
			var disname = "";
			var gubun = info.cid.substring(0,1);
			if (info.tle != ""){
				disname = info.tle;
			}else if (gubun == "n"){
				var rex = [];
				for (var ii = 0 ; ii < info.att.length; ii++){
					var xin = info.att[ii];
					if (xin.ky != gap.userinfo.rinfo.ky){
						if (typeof(xin.dpc) != "undefined"){
							rex.push(xin.nm);
						}						
					}
				}
				if (rex.length == 0){
					disname = gap.lang.no_chatroom;
					person_img = gap.team_photo();
				}else{
					disname = rex.join(",");
				}				
			}else if (gubun == "s"){
				if (nam == ""){
					disname = gap.lang.no_chatroom;
				}else{
					disname = nam + gap.lang.hoching;
				}				
			}			
			bun = info.att.length;
			var xid = gap.encodeid(info.cid);			
			alarm_data.xid = xid;			
			html += "	<li class='chatroom_list_li' id='"+xid+"' data='"+tuid+"'>";
			html += "		<div class='user' data='"+info.wdt+"'>";
			html += "			<div class='user-thumb'>"+person_img+"</div>";			
			var ch = info.cid.toString().substring(0,1);
			if (last_sq == ""){
				html += "			<span class='' id='chat_new_"+xid+"'></span>";    //신규로 들어오면 class='ico-new' 추가해야 한다.
			}else{
				html += "			<span class='' id='chat_new_"+xid+"'></span>";    //신규로 들어오면 class='ico-new' 추가해야 한다.
			}			
			html += "				<dl>";			
			if (info.tle != ""){
				html += "					<dt class='chg-name' style='font-weight:bold'>"+disname+"</dt>";
			}else{
				html += "					<dt>"+disname+"</dt>";
			}			
			if (info.wty == 5 || info.wty == 6){		
				var xhtml = info.wmsg;
				//if ((info.wty == 6) && (typeof(info.ex.files) != "undefined")){
				if ((info.wty == 6) && info.ex && info.ex.files){
					info.ex = info.ex.files[0];
				}
				if (typeof(info.ex) != "undefined"){	
					if (typeof(info.ex.nm) != "undefined"){						
						var fname = info.ex.nm;
						fname = fname.replace("'","`");
						var url = gap.search_fileserver(info.ex.nid);	
						var downloadurl = url+ "/filedown" + info.ex.sf + "/" + info.ex.sn + "/" + encodeURIComponent(fname);						
						if (typeof(info.ex.caller) != "undefined"){
							if (info.ex.caller == "1" || info.ex.caller == "3"){
								var spl = downloadurl.split("/");
								var id = spl[6];
								var path = spl[5];
								var filename = spl[7];
								var fserver = "https://" + spl[2] + "/WMeet"
								downloadurl = gap.search_file_convert_server(fserver) + "/FDownload.do?id=" + path + "&ty=chat&md5=" + id + "&fn=" + filename + "&ky="+gap.search_cur_ky();
							}
						}						
						var xhtml = gBody.chatroom_last_msg_file_dis(fname, downloadurl);		
						alarm_data.wmsg = fname;						
						html += "					<dd id='chat_msg_"+xid+"'>"+xhtml+"</dd>";
					}else{
						html += "					<dd id='chat_msg_"+xid+"'>"+info.wmsg+"</dd>";
						alarm_data.wmsg = info.wmsg;
					}					
				}else{
					html += "					<dd id='chat_msg_"+xid+"'>"+info.wmsg+"</dd>";
					alarm_data.wmsg = info.wmsg;
				}
			}else if (info.wty == 4){				
				html += "			<dd id='chat_msg_"+xid+"'>"+gap.HtmlToText(info.wmsg)+"</dd>";
				alarm_data.wmsg = gap.HtmlToText(info.wmsg);
			}else if (info.wty == 3){	
				
				var emoticon_img = "<img style=' height:35px' src='/resource/images/emoticons/"+info.wmsg+"' alt=''>";				
				html += "					<dd id='chat_msg_"+xid+"'>"+emoticon_img+"</dd>";		
				
				if (typeof(info.wmsg.msg) == "undefined"){
					alarm_data.wmsg =  "<img style=' height:35px' src='/resource/images/emoticons/"+info.wmsg+"' alt=''>";
				}else{
					alarm_data.wmsg =  "<img style=' height:35px' src='/resource/images/emoticons/"+info.wmsg.msg+"' alt=''>";
				}
				
				//alarm_data.wmsg = info.wmsg;
			}else if (info.wty == 2){	
				//시스템 메시지 입장과 퇴장
				var spl = info.wmsg.split(" ");
				var opt = spl[0];					
				var lastr = info.wmsg.substring(2, info.wmsg.length); //영문명에 공백이 들어갈 수 있기 때문에 " "으로 split하면 잘못 계산되어 index로 짤라야 한다.
				var name = "";			
				var cel = lastr.split(":")[3];
				if (gap.cur_el == cel){
					name = lastr.split(":")[1];
				}else{
					name = lastr.split(":")[2];
					if (typeof(name) == "undefined"){
						name = lastr.split(":")[1];
					}
				}				
				var dis = "";
				if (opt == "e"){
					dis = name + gap.lang.enter_chat;
				}else{
					dis = name + gap.lang.exit_chat;
				}				
				html += "			<dd id='chat_msg_"+xid+"'>"+dis+"</dd>";				
				alarm_data.wmsg = dis;
			}else if (info.wty == 3){	
				//이모티콘이 마지막 메시지일 경우 표시하지 않는다.
			}else if (info.wty == 21){				
				var lx = info.wmsg.split("-spl-");
				var tpx = lx[0];				
				if (tpx == "mail_link"){
					var mxg =  lx[1];
					html += "					<dd id='chat_msg_"+xid+"'>"+mxg+"</dd>";
				}else{
					var mxg = info.wmsg.split("-spl-")[0];
					html += "					<dd id='chat_msg_"+xid+"'>"+mxg+"</dd>";
				}				
				alarm_data.wmsg = mxg;
			}else{				
				if (info.wty == 100){
					//회수된 메세지인 경우
					html += "					<dd id='chat_msg_"+xid+"'>"+gap.lang.re_msg+"</dd>";
					alarm_data.wmsg = gap.lang.re_msg;
				}else if (info.wky == "10139992"){
					//칭찬코끼리에서 수신된 경우
					html += "					<dd id='chat_msg_"+xid+"'>"+gBody.receive_elephant+"</dd>";				
				}else{
					var xxx = gap.HtmlToText(info.wmsg);
					alarm_data.wmsg = xxx;
					html += "					<dd id='chat_msg_"+xid+"'>"+xxx+"</dd>";
				}
			}			
			html += "				</dl>";
			alarm_data.bun = 0;
			if (gubun == "n"){
				alarm_data.bun = bun;
				html += "			<span class='time_count'>"+bun+gap.lang.myung+"</span>";
			}			
			html += "			<span class='time' id='chat_time_"+xid+"' data='"+xid+"'>"+time+"</span>";			
			alarm_data.ucnt = 0;
			if (info.ucnt > 0){
				unread_count = unread_count + info.ucnt;
				html += "			<span class='cnt' id='unread_count_"+xid+"'>"+info.ucnt+"</span>";
				alarm_data.ucnt = info.ucnt;
			}			
			html += "		</div>";
			html += "	</li>";			
			
			//팝업 채팅창의 데이터를 수집한다.
			alarm_data.nam = nam;
			alarm_data.person_img = person_img;
			alarm_data.time = time;
			alarm_data.disname = disname;
			alarm_data.wty = info.wty;						
			alarm_infos.push(alarm_data);						
		}
		
		//팝업 채팅방 리스트 표시하기 ////////////////////////////////////////////			
		$("#alarm_list_sub .q_chatroom_list").remove();
		$("#alarm_list_sub .alarmlist_bg").remove();
		try{
			$("#alarm_list_sub").mCustomScrollbar('destroy');
		}catch(e){}
			
		if (alarm_infos.length == 0){
			gma.setEmpty();
		}else{
			gBody.chat_alarm_draw(alarm_infos);
			$("#alarm_list_sub").mCustomScrollbar({
				theme:"dark-2",
				autoExpandScrollbar: false,
				scrollButtons:{
					enable:false
				},
				mouseWheelPixels : 200, // 마우스휠 속도
				scrollInertia : 400, // 부드러운 스크롤 효과 적용
				autoHideScrollbar : false
			});
		}
		/////////////////////////////////////////////////////////////
		
		if (unread_count > 0){
			gBody.chatroom_new_msg_icon("new");
		}	
		if (fix_count > 0){
			$("#chatroom_fix").show();
		}	
		$("#left_roomlist").mCustomScrollbar({
			theme:"dark-2",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable:false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
		//	mouseWheel:{ preventDefault: false },
		//	advanced:{
		//		updateOnContentResize: true
		//	},
			autoHideScrollbar : true
			//setTop : $(this).height() + "px"
		});		
	},
	
	"setBuddyListPage" : function(){
		// 퀵채팅을 띄워놓은 상태가 아니면 예외처리
		if (!$('#quick_alarm_wrap').hasClass('show')) return;
		
		// 검색 결과 화면이면 다시 그리지 않음
		if (this.is_init_buddy) {
			if ($('#quick_alarm_wrap').hasClass('buddy-search')) return;			
		}
		
		// 대화상대 페이지가 아니면 예외처리
		if (!$('#qbd_list').is(':visible')) return;
		
		
		$('#qbd_list_sub').empty();
		
		// 상태값 체크할 사용자 정보
		var lists = [];
		var html = '';
		
		/*
		// 즐겨찾기
		if (gap.favorite_list && gap.favorite_list.length) {
			var $favo_list = $('<div class="qfavo-list"></div>')
			
			$.each(gap.favorite_list, function(){
				var img_src = gap.person_photo_url(this);
				var bg_img = 'url(' + img_src + '), url(../resource/images/none.jpg)';
				
				html +=
				'<div class="qbd-mem-img" style="background-image:' + bg_img + ';" data-ky="' + this.ky + '">' +
				'	<div class="qbd-mem-stat status"></div>' +
				'</div>';
				
				// 상태 체크용
				if ($.inArray(this.ky, lists) == -1) {
					lists.push(this.ky);					
				}
			});
						
			var $favo = $(html);
			$favo_list.append($favo);
			$('#qbd_list_sub').append($favo_list);
		}
		*/
		
		// 버디리스트
		var $bd_list = $('<div class="qbuddy-list"></div>');
		var bl = gap.buddy_list_info.ct.bl;
		bl.sort(gap.sortNameDesc);
		console.log("root_path >>",root_path);
		if (bl.length == 0) {
			html =
				'<div class="buddy-empty-wr">' +
				'	<img src="' + root_path + '/resource/images/message/ico_buddy_empty.png">' +
				'	<span>' + gap.lang.exbtn + '</span>' +
				'	<button id="qbuddy_mem_mng">' + gap.lang.addGroup + '</button>' +
				'</div>';
			var $empty = $(html);
			$('#qbd_list_sub').append($empty);
			
			$('#qbuddy_mem_mng').on('click', function(){
				gBody.create_buddy_group();
			});
			return;
		}
		
		$.each(bl, function(){
			var total_cnt = (this.usr ? this.usr.length : 0);
			
			// 채팅 그룹 열림/닫힘 여부 판단하기  
			var collapse_cls = this.o == false ? ' qbd-collapse' : '';
			
			html = 
			'<div class="qbuddy-section' + collapse_cls + '">' +
			'	<div class="qbuddy-tit-wr">' +
			'		<div class="qbuddy-tit-inner">' +
			'			<div class="qbuddy-group-fold"></div>' +
			'			<div class="qbuddy-group-tit">' +
			'				<span>' + this.nm + '</span>' +
			'				(<span class="online-cnt">0</span>/' + total_cnt + ')' +
			'			</div>' +
			'		</div>' +
			'		<button type="button" class="btn-search-chat" style="display:none;">' + gap.lang.allchat + '</button>' +
			'	</div>' +
			'	<ul>' +
			'	</ul>' +
			' </div>';
			
			var $group = $(html);
			$bd_list.append($group);
			
			// 사용자 정보 소트하기
			if (total_cnt > 0) {				
				var sinfo = this.usr.sort(gap.sortNameDesc);
				var $ul = $group.find('ul');
				$.each(sinfo, function(){
					var user_info = gap.user_check(this);
					var img_src = gap.person_photo_url(user_info);
					var bg_img = 'url(' + img_src + '), url(../resource/images/none.jpg)';
					var nm = user_info.name.replace(/'/g,'′');
					
					html =
						'<li class="qbd-mem-wr" data-ky="' + user_info.ky + '" data-nm="' + nm + '">' +
						'	<div class="qbd-mem-img" style="background-image:' + bg_img + ';">' +
						'		<div class="qbd-mem-stat status"></div>' +
						'	</div>' +
						'	<div class="qbd-mem-name-wr">' +
						'		<div class="qbd-mem-name">' + user_info.disp_name_info + '</div>' +
						'		<div class="qbd-mem-dept">' + user_info.dept + ' / ' + user_info.company + '</div>' +
						'	</div>' +
						'</li>';
					
					// 상태 체크용
					if ($.inArray(user_info.ky, lists) == -1) {
						lists.push(user_info.ky);
					}
					
					var $li = $(html);
					$li.data('info', user_info);
					$ul.append($li);
				});
			}
		});
		
		
		$('#qbd_list_sub').append($bd_list);
		

		// 온/오프라인 체크 ==> statusBuddyList 콜백으로 호출됨
		_wsocket.temp_list_status(lists, 3, 'quick_chat_buddy');
		
		
		this.buddyEventBind();

		this.is_init_buddy = true;		
	},
	
	"buddyEventBind" : function(){
		var $layer = $('#quick_alarm_wrap'); 
		var _self = this;
		
		// 그룹 접기/펼치기
		$layer.find('.qbuddy-tit-wr').off().on('click', function(){
			var $section = $(this).closest('.qbuddy-section');
			if ($section.hasClass('search')) return;
			$section.toggleClass('qbd-collapse');
		});
		
		// 사용자 프로필 표시
		$layer.find('.qbd-mem-img').off().on('click', function(){
			var ky = $(this).parent().data('ky');
			if (ky) {
				gap.showUserDetailLayer(ky);
			}
			return false;
		});
		
		// 1:1 채팅하기
		$layer.find('.qbd-mem-wr').off().on('click', function(){			
			var user_info = $(this).data('info');
			_self.chatOnlyOne(user_info);
		});
		
		// 전체 채팅하기
		$layer.find('.btn-search-chat').off().on('click', function(){
			var list = [];
			var exist_me = false;
			var user_info;
			var user_cnt = 0;
			
			var $users = $(this).closest('.qbuddy-section').find('.qbd-mem-wr');
			
			// 대화상대 없는 경우 예외처리
			if ($users.length == 0) {
				mobiscroll.toast({message:gap.lang.no_chatroom, color:'danger'});
				return false;
			}
			
			
			$users.each(function(){
				var item = $(this).data('info');
				list.push(item.ky);
				if (item.ky == gap.userinfo.rinfo.ky) {
					exist_me = true;
				} else {
					user_info = item;
					user_cnt++;
				}
			});
			
			
			if (user_cnt == 1) {
				// 1:1 채팅
				_self.chatOnlyOne(user_info);
			} else {
				// 1:N 채팅
				// 내가 포함되어 있지 않으면 나를 추가해줌
				if (!exist_me) {
					list.push(gap.userinfo.rinfo.ky);
				}
				
				// 기존에 생성된 채팅방이 있는지 검색
				var res = gap.search_exist_chatroom_nn(list);
				if (res != '') {
					var $chat_li = $layer.find('.q_chatroom_list[data-key="' + res + '"]');
					
					// 신규건수가 표시되어 있는 경우 지워야 함
					$chat_li.find(".alarm-num").remove();
					
					_wsocket.load_chatlog_list_popup(res);
				} else {
					// 신규방 생성
					_wsocket.search_user_makeroom_popup(list);
				}
			}
			
			return false;
		});
		
		// 검색결과에서 사용자 제거
		$layer.find('.qbd-mem-remove').off().on('click', function(){
			$(this).closest('li').remove();
			
			// 건수 표시
			var search_cnt = $layer.find('.qbd-mem-wr').length;
			$layer.find('.total-cnt').text(search_cnt);
			
			if (search_cnt > 1) {
				$layer.find('.btn-search-chat').show();
			} else {
				$layer.find('.btn-search-chat').hide();
			}
			
			return false;
		});
		
	},
	
	"setKGPTPage" : function(){
		// 퀵채팅을 띄워놓은 상태가 아니면 예외처리
		if (!$('#quick_alarm_wrap').hasClass('show')) return;
		
		// 대화상대 페이지가 아니면 예외처리
		if (!$('#qkgpt_list').is(':visible')) return;
		
		
		$('#qkgpt_list_sub').empty();
		
		// 상태값 체크할 사용자 정보
		var lists = [];
		var html = '';
		
		/*
		// 즐겨찾기
		if (gap.favorite_list && gap.favorite_list.length) {
			var $favo_list = $('<div class="qfavo-list"></div>')
			
			$.each(gap.favorite_list, function(){
				var img_src = gap.person_photo_url(this);
				var bg_img = 'url(' + img_src + '), url(../resource/images/none.jpg)';
				
				html +=
				'<div class="qbd-mem-img" style="background-image:' + bg_img + ';" data-ky="' + this.ky + '">' +
				'	<div class="qbd-mem-stat status"></div>' +
				'</div>';
				
				// 상태 체크용
				if ($.inArray(this.ky, lists) == -1) {
					lists.push(this.ky);					
				}
			});
						
			var $favo = $(html);
			$favo_list.append($favo);
			$('#qbd_list_sub').append($favo_list);
		}
		*/
		
		// 버디리스트
		var $bd_list = $('<div class="qbuddy-list"></div>');
		var bl = gap.buddy_list_info.ct.bl;
		bl.sort(gap.sortNameDesc);

		if (bl.length == 0) {
			html =
				'<div class="buddy-empty-wr">' +
				'	<img src="' + root_path + '/resource/images/message/ico_buddy_empty.png">' +
				'	<span>' + gap.lang.exbtn + '</span>' +
				'	<button id="qbuddy_mem_mng">' + gap.lang.addGroup + '</button>' +
				'</div>';
			var $empty = $(html);
			$('#qbd_list_sub').append($empty);
			
			$('#qbuddy_mem_mng').on('click', function(){
				gBody.create_buddy_group();
			});
			return;
		}
		
		$.each(bl, function(){
			var total_cnt = (this.usr ? this.usr.length : 0);
			
			// 채팅 그룹 열림/닫힘 여부 판단하기  
			var collapse_cls = this.o == false ? ' qbd-collapse' : '';
			
			html = 
			'<div class="qbuddy-section' + collapse_cls + '">' +
			'	<div class="qbuddy-tit-wr">' +
			'		<div class="qbuddy-tit-inner">' +
			'			<div class="qbuddy-group-fold"></div>' +
			'			<div class="qbuddy-group-tit">' +
			'				<span>' + this.nm + '</span>' +
			'				(<span class="online-cnt">0</span>/' + total_cnt + ')' +
			'			</div>' +
			'		</div>' +
			'		<button type="button" class="btn-search-chat" style="display:none;">' + gap.lang.allchat + '</button>' +
			'	</div>' +
			'	<ul>' +
			'	</ul>' +
			' </div>';
			
			var $group = $(html);
			$bd_list.append($group);
			
			// 사용자 정보 소트하기
			if (total_cnt > 0) {				
				var sinfo = this.usr.sort(gap.sortNameDesc);
				var $ul = $group.find('ul');
				$.each(sinfo, function(){
					var user_info = gap.user_check(this);
					var img_src = gap.person_photo_url(user_info);
					var bg_img = 'url(' + img_src + '), url(../resource/images/none.jpg)';
					var nm = user_info.name.replace(/'/g,'′');
					
					html =
						'<li class="qbd-mem-wr" data-ky="' + user_info.ky + '" data-nm="' + nm + '">' +
						'	<div class="qbd-mem-img" style="background-image:' + bg_img + ';">' +
						'		<div class="qbd-mem-stat status"></div>' +
						'	</div>' +
						'	<div class="qbd-mem-name-wr">' +
						'		<div class="qbd-mem-name">' + user_info.disp_name_info + '</div>' +
						'		<div class="qbd-mem-dept">' + user_info.dept + ' / ' + user_info.company + '</div>' +
						'	</div>' +
						'</li>';
					
					// 상태 체크용
					if ($.inArray(user_info.ky, lists) == -1) {
						lists.push(user_info.ky);
					}
					
					var $li = $(html);
					$li.data('info', user_info);
					$ul.append($li);
				});
			}
		});
		
		
		$('#qbd_list_sub').append($bd_list);
		

		// 온/오프라인 체크 ==> statusBuddyList 콜백으로 호출됨
		_wsocket.temp_list_status(lists, 3, 'quick_chat_buddy');
		
		
		this.buddyEventBind();

		this.is_init_buddy = true;		
	},	
	
	"chatOnlyOne" : function(user_info){
		// 1:1 채팅하기
		
		var ky = user_info.ky;
		var nm = user_info.nm;
		
		// 채팅방을 생성
		_wsocket.make_chatroom_11_only_make(ky, nm);
		
		// 사용자 정보 셋팅
		var room_key = _wsocket.make_room_id(ky);			
		
		var att = [];
		att.push(gap.userinfo.rinfo);
		att.push(user_info);
		
		gBody.cur_room_att_info_list_popup = att;
		gBody2.select_name = nm;
									
		_wsocket.load_chatlog_list_popup(room_key);
	},
	
	"statusCheckResult" : function(lists){
		
		
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
//			var mst = info.mst;
//			if (typeof(mst) != "undefined"){
//				if (mst == 0){
//					$("[data-phone='phone_"+key+"']").removeClass();
//				}else{
//					$("[data-phone='phone_"+key+"']").removeClass();
//					$("[data-phone='phone_"+key+"']").addClass("phone_icon abs");
//				}
//			}
			
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
	},
	
	"showMember" : function(){
		
		//var memberlist = gBody.cur_room_att_info_list;
		//var memberlist = gap.search_att_list_in_chat_info(this.cur_cid_popup);
		var memberlist = gBody.cur_room_att_info_list_popup;
		memberlist.sort(gap.sortNameDesc);
		
		var member_total = memberlist.length;
		
		
		/*
		$('#alarm_chat_menu').empty();
		var html = 
			'<div class="chat-menu-wr">' +
			'	<div class="chat-menu-title">' + gap.lang.chatm + ' <span id="alarm_chat_member_cnt">('+member_total+''+gap.lang.myung+')</span></div>' +
			'	<ul id="alarm_chat_member_list" class="chat-member-list">' +
			'	</ul>' +
			'</div>';
			
		$('#alarm_chat_menu').append(html);
		*/
		
		clearTimeout(this.fix_mem);
		$('#alarm_chat_menu').remove();
		
		var html = 
			'<div id="alarm_chat_menu" class="alarmmenu_wr">' +
			'	<div class="chat-menu-wr">' +
			'		<div class="chat-menu-title">' + gap.lang.chatm + ' <span id="alarm_chat_member_cnt">('+member_total+''+gap.lang.myung+')</span></div>' +
			'		<ul id="alarm_chat_member_list" class="chat-member-list"></ul>' +
			'	</div>' +
			'</div>';
		
		$('#alarm_dim').before(html);
		
		
		// 채팅 참석자 표시
		// 사용자의 휴가 정보와 온라인 상태 정보도 가져와야 함
		

		//owner값 표시하기
		var list = new Array();
		var user_info = gap.user_check(gap.userinfo.rinfo);
		list.push(gap.userinfo.rinfo.ky);
		var key = gap.userinfo.rinfo.ky;
		var li = 
			'<li onclick="gap.showUserDetailLayer(\''+user_info.ky+'\');">' +
			// 사진 정보
			'	<div class="photo-wrap">' +
			'		<div class="user">' +
			'			<div class="user-thumb">' +
			'				'+user_info.user_img+'' + 
	//		'				<img data-key="10im0959" src="https://dswdv.daesang.com/photo/10/10im0959.jpg" onerror="this.onerror=null; this.src=&quot;img/none.jpg&quot;;" alt="">' +
			'			</div>' +
			'			<span data-status="status_'+key+'" class="status online"></span>' +
			'		</div>' +
			'	</div>' +

			// 이름, 부서
			'	<div class="q_name_wr">' +
			'		<p class="mem-name">' +
			'			<span data-day="day_'+key+'"></span>' +
			'			<span class="name">'+user_info.disp_name_info+'</span>' +
			'		</p>' +
			'		<div class="q_user-info">'+user_info.dept+' | '+user_info.company+'</div>' +
			'	</div>' +
			'</li>';
		
		var $list = $('#alarm_chat_member_list');
		$list.append(li);
		
		
		//멤버 리스트 표시하기
		for (var i = 0 ; i < member_total; i++){
			var item = memberlist[i];
			var user_info = gap.user_check(item);
			if (user_info.ky != gap.userinfo.rinfo.ky){
				list.push(user_info.ky);
				key = user_info.ky;
				var li = 
					'<li onclick="gap.showUserDetailLayer(\''+user_info.ky+'\');">' +
					// 사진 정보
					'	<div class="photo-wrap">' +
					'		<div class="user">' +
					'			<div class="user-thumb">' +
					'				'+user_info.user_img+'' + 
			//		'				<img data-key="10im0959" src="https://dswdv.daesang.com/photo/10/10im0959.jpg" onerror="this.onerror=null; this.src=&quot;img/none.jpg&quot;;" alt="">' +
					'			</div>' +
					'			<span data-status="status_'+key+'" class="status offline"></span>' +
					'		</div>' +
					'	</div>' +

					// 이름, 부서
					'	<div class="q_name_wr">' +
					'		<p class="mem-name">' +
					'			<span data-day="day_'+key+'" ></span>' +
					'			<span class="name">'+user_info.disp_name_info+'</span>' +
					'		</p>' +
					'		<div class="q_user-info">'+user_info.dept+' | '+user_info.company+'</div>' +
					'	</div>' +
					'</li>';
				
				var $list = $('#alarm_chat_member_list');
				$list.append(li);
			}

		}

		_wsocket.temp_list_status(list, 1, "popup_chat_member");
				
		this.layer.find('.alarm-dim').addClass('show');
		this.layer.addClass('chat-menu');
	},
	"hideMember" : function(){
		this.layer.find('.alarm-dim').removeClass('show');
		this.layer.removeClass('chat-menu');
		this.fix_mem = setTimeout(function(){
			$('#alarm_chat_menu').remove();
		}, 200);
	},
	
	"setTitle" : function(txt){
		$('#quick_menu_title').text(txt);
	},
	
	"chatSearch" : function(txt){
		// 채팅방 검색하기 ==> draw_search_chatroom_list_after 콜백 수행됨
		_wsocket.search_chatroom_list(txt, 'search_popup');
	},
	
	"draw_search_chatroom_list_after" : function(list){
		gBody.searchMode_draw_popup = 'T';
		gap.chat_room_info_search_popup = list;
		gBody.chatroom_draw('main_alarm');
	},
	
	"buddySearch" : function(txt){
		var _self = this;
		gsn.requestSearch('', txt, function(sel_data){
			var infos = [];
			for (var i = 0 ; i < sel_data.length; i++){
				var info = sel_data[i];
				infos.push(info);
			}
			_self.buddySearchResult(infos);
		});
	},
	
	"buddySearchResult" : function(list){
		var _self = this;
		var $wrap = $('#qbd_list_sub');		
		var stat_list = [];
		
		
		var $bd_list = $('.qbuddy-search-list');
		
		if ($bd_list.length == 0) {
			var html = 
				'<div class="qbuddy-list qbuddy-search-list">' +
				'	<div class="qbuddy-section search">' +
				'		<div class="qbuddy-tit-wr">' +
				'			<div class="qbuddy-group-tit">' + gap.lang.search + ' (<span class="total-cnt"></span>)</div>' +
				'			<button type="button" class="btn-search-chat" style="display:none;">' + gap.lang.allchat + '</button>' +
				'		</div>' +
				'		<ul>' +
				'		</ul>' +
				'	</div>' +
				'</div>';
			
			$bd_list = $(html);
			$wrap.empty();
			$wrap.append($bd_list);
		}

		
		var $search = $bd_list.find('ul');
		
		$.each(list, function(){
			var user_info = gap.user_check(this);
			var img_src = gap.person_photo_url(user_info);
			var bg_img = 'url(' + img_src + '), url(../resource/images/none.jpg)';
			var nm = user_info.name.replace(/'/g,'′');
			
			// 기존 선택된 사용자가 있는 경우 예외처리
			if ($search.find('li[data-ky="' + user_info.ky + '"]').length > 0) {
				return true;
			}
			
			html =
				'<li class="qbd-mem-wr" data-ky="' + user_info.ky + '" data-nm="' + nm + '">' +
				'	<div class="qbd-mem-img" style="background-image:' + bg_img + ';">' +
				'		<div class="qbd-mem-stat status"></div>' +
				'	</div>' +
				'	<div class="qbd-mem-name-wr">' +
				'		<div class="qbd-mem-name">' + user_info.disp_name_info + '</div>' +
				'		<div class="qbd-mem-dept">' + user_info.dept + ' / ' + user_info.company + '</div>' +
				'	</div>' +
				'	<div class="qbd-mem-remove">' +
				'		<span></span>' +
				'	</div>' +
				'</li>';
			
			
			var $user = $(html);
			$user.data('info', user_info);
			$search.append($user);
			
			
			// 상태 체크용
			stat_list.push(user_info.ky);
		});
		
		
		// 건수 표시
		var search_cnt = $wrap.find('.qbd-mem-wr').length;
		$bd_list.find('.total-cnt').text(search_cnt);
		
		if (search_cnt > 1) {
			$bd_list.find('.btn-search-chat').show();
		} else {
			$bd_list.find('.btn-search-chat').hide();
		}
		
		

		// 상태값 체크
		// 온/오프라인 체크 ==> statusBuddyList 콜백으로 호출됨
		_wsocket.temp_list_status(stat_list, 3, 'quick_chat_buddy');
		
		// 이벤트 처리
		this.buddyEventBind();
	},
	
	"statusBuddyList" : function(lists){
		// 버디리스트의 사용자의 상태값을 가져와서 셋팅하는 함수
		var $wrap = $('#qbd_list');
		
		$.each(lists, function(){
			var $user = $wrap.find('[data-ky="' + this.ky + '"]');
			var $stat = $user.find('.status');
			$stat.removeClass('online offline away deny');
			
			if (this.st == 1){						
				$stat.addClass("online");
			}else if (this.st == 2){
				$stat.addClass("away");
			}else if (this.st == 3){
				$stat.addClass("deny");	
			}else{
				$stat.addClass("offline");
			}
			
			// 상태값 표시 (휴가 등)
			if (this.exst != '') {
				var $exst = $('<span class="biz_check day_' + this.exst + '">' + gOrg.userDayText(this.exst) + '</span>');
				$user.find('.biz_check').remove();
				$user.find('.qbd-mem-name').prepend($exst);
			}
		});
		
		// 온라인 사용자 명수 표시
		$('.qbuddy-section').each(function(){
			if ($(this).hasClass('search')) return true;
			var cnt = $(this).find('.status.online').length;
			$(this).find('.online-cnt').text(cnt);
		});
				
	},
	
	"updateStatus" : function(id, val, msg, ext){
		// 사용자의 상태값 실시간 업데이트 
		if (!$('#quick_alarm_wrap').hasClass('show')) return;
		
		var $wrap = $('#qbd_list');
		var $el = $wrap.find('[data-ky="' + id + '"] .status');
		$el.removeClass('online offline away deny');
		
		if (val == 1){						
			$el.addClass("online");
		}else if (val == 2){
			$el.addClass("away");
		}else if (val == 3){
			$el.addClass("deny");	
		}else{
			$el.addClass("offline");
		}
	}	
}










































