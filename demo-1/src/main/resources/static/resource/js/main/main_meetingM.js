function gBodyMeetingM() {
	this.show_loading = null;
	this.avail_color = '#0000ff';
	this.unavail_color = '#ff0000';
	this.edit_scheduleid = null;
	this.cur_tab = '';
	this.room_check = false;
}

gBodyMeetingM.prototype = {
	"init": function(){
		this.userLangSet();
		
		if (gap.curLang == 'ko') {
			moment.locale('ko');
		} else {
			moment.locale('en');
		}
	},
	
	"changePage" : function(){
		var page = gap.param1;
		if (!page || page == 'tab1') {
			// 오늘 회의
			this.tab1();
		} else if (page == 'tab2') {
			// 예정된 회의
			this.tab2();
		} else if (page == 'new') {
			this.createMeet();
		} else if (page == 'modify'){
			var info = {
				type: gap.param2,
				scheduleid : gap.param3
			};
			this.initEditHeader(info);
		} else if (page == 'room_check') {
			this.roomCheck();
		}
	},
	
	
	"userLangSet" : function(){
		var lan = "";
		if (typeof(gap.etc_info.ct) != "undefined"){
			lan = gap.etc_info.ct.lg;
		}else{
			lan = userlang;
		}
		if ((lan == "") || (typeof(lan) == "undefined")){
			lan = gap.curLang;
		}else{
			gap.curLang = lan;
		}
		
		if (typeof(mobile_lang) != "undefined"){
			lan = mobile_lang;
			gap.curLang = lan;
		}

		$.ajax({
			method : "get",
			url : cdbpath + "/lang/m_" + lan + ".json?open&ver="+jsversion,
			dataType : "json",			
			contentType : "application/json; charset=utf-8",
			async : false,
			success : function(data){	
				gap.lang = data;					
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"tab1" : function(){
		// 오늘 회의
		this.cur_tab = 'tab1';
		
		var _main = this.drawMeetingMain();
		$('#dis').html(_main);
		
		this.getAllMeetingList(true);
		
		this.mainEventBind();
	},
	
	"tab2" : function(){
		// 예정된 회의
		this.cur_tab = 'tab2';
		
		var _main = this.drawMeetingMain();
		$('#dis').html(_main);
		
		this.getAllMeetingList(false);
		
		this.mainEventBind();
	},
	
	"roomCheck" : function(){
		// 회의실 확인
		this.showPlaceLayer();
	},
	
	"createMeet" : function(){
		// 신규 회의 생성
		
		this.initHeader();
	},
	
	"drawMeetingMain" : function(){
		var html = 
			'<div class="wrap">' +
			'	<div id="container" class="mu_mobile">' +
			'		<section class="gathering">' +
			'			<div>' +
			'				<div class="f-right">' +                      
			'					<div class="input-field selectbox meeting">' +
			'						<select id="meet_filter_type">' +
			'							<option value="all">' + gap.lang.mt_filter_all + '</option>' +
            '							<option value="2">' + gap.lang.mt_type_2 + '</option>' +
            '							<option value="1">' + gap.lang.mt_type_1 + '</option>' +
            '							<option value="3">' + gap.lang.mt_type_3 + '</option>' +
			'						</select>' +
			'					</div>' +
			'				</div>' +
			'				<div class="gather-list-wr meeting" id="meeting_list">' +
			'				</div>' +
			'			</div>' +
			'		</section>' +
			'	</div>' +
			'</div>';
		
		return html;
	},
	
	"mainEventBind" : function(){
		var _self = this;
		$('#meet_filter_type').material_select();
		
		$('#meet_filter_type').on('change', function(){
			_self.getAllMeetingList(_self.cur_tab == 'tab1');
		});
	},
	
	/*
	 * 다른 시스템에서 회의 예약을 요청하는 경우
	 * param
	 * meeting_type: 회의 타입
	 * user_list: 사용자 정보
	 * call_func: 콜백 함수 
	 */
	"reserveMeeting": function(meeting_type, user_list, call_func){
		// 
		
		var _self = this;

		if (Array.isArray(user_list)) {
			user_list = user_list.filter(function(val){
				return gap.userinfo.rinfo.ky != val;
			});
		}
		
		gap.showConfirm({
			title: gap.lang.meeting_res,
			contents: gap.lang.meeting_res_msg,
			callback: function(){
				var id = 'meeting';
				var url = location.pathname + "?readform&" + id;
				if (history.state != id){
					history.pushState(id, null, url);
				}else{
					history.replaceState(id, null, url);
				}
				
				if (typeof(call_func) == 'function') {
					call_func();
				}
				_self.showMainMeeting();
				_self.setDataInfo(meeting_type, user_list);
				
				// 기본으로 2번째 장소선택 레이어를 띄워준다
				$('.step.n2').click();
			}
		});
	},
	
	"showMainMeeting": function(){
		
		// 왼쪽에 선택이 안되어 있는 경우 선택되도록 처리
		if (!$('#meeting').hasClass('act')){
			$('#left_menu_list').find('ul .act').removeClass('act');
			$('#meeting').addClass('act');
		}
		
		$("#main_content").hide();
		$("#left_main").html('').css({"width": "0", "border":"none"});
		$("#main_body").css({
			left: '63px',
			right: '0',
			background: '#fff',
			width: ''			
		}).show();		
		
		$("#center_content").css("width", "100%");
		$("#user_profile").css("width", "0px");
		$(".left-area").hide();
		$("#center_content").show();
		$("#center_content").off();
		$("#center_content").removeAttr("class");
		
		// 가운데 화면, 우측 화면 처리
		$('#center_content').html('').css('width', '100%');
		$('#user_profile').html('').hide();
		
		var html = 
			'<div id="container" class="mu_container meeting">' +
			'	<div id="meet_contents_scroll" class="contents scroll" style="overflow-y:auto;">' +
			'		<section id="meeting_head" class="section sec01"></section>' +
			'		<section id="meeting_body" class="section sec02"></section>' +
			'	</div>' +
			'</div>';
			
		
		$('#center_content').append(html);
		
		this.timeline = null;
		this.initHeader();
		this.initBody();
	},
	
	"initHeader" : function(is_edit){
		var html = '';
		
		// 헤더 영역
		html += 
			'<div class="wrap">' +
			'	<div id="container" class="mu_mobile">' +
			'		<section class="gathering mo_gathering">' +
			'			<div class="mo_topbox meeting">' +
			'				<h2 style="padding-top:15px;"><span class="ico ico-tit meeting"></span>' + gap.lang.mt_new_create + '</h2>' +
			'			</div>' +
			'			<div>' +
			'				<div class="f_between meeting-pro">' +
			'					<div class="step n1">' +
			'						<div class="inner">' +
			'							<div class="tit">' + gap.lang.mt_type + '</div>' +
			'							<div class="desc" data-txt="' + gap.lang.mt_type_msg + '"></div>' +
			'						</div>' +
			'					</div>' +
			'					<div class="step n2">' +
			'						<div class="inner">' +
			'							<div class="tit">' + gap.lang.mt_place + '</div>' +
			'							<div class="desc" data-txt="' + gap.lang.mt_place_msg + '"></div>' +
			'						</div>' +
			'					</div>' +
			'					<div class="step n3">' +
			'						<div class="inner">' +
			'							<div class="tit">' + gap.lang.mt_att + '</div>' +
			'							<div class="desc" data-txt="' + gap.lang.mt_att_msg + '"></div>' +
			'						</div>' +
			'					</div>' +
			'					<div class="step n4">' +
			'						<div class="inner">' +
			'							<div class="tit">' + gap.lang.mt_title + '</div>' +
			'							<div class="desc" data-txt="' + gap.lang.mt_title_msg + '"></div>' +
			'						</div>' +
			'					</div>' +
			'				</div>' +
			'			</div>' +
			'			<button id="btn_meet_create" class="mo-btn act_btn ' + (is_edit ? 'save' : 'hide') + '">' + (is_edit ? gap.lang.basic_save : gap.lang.mt_create) + '</button>' +
			'		</section>' +
			'	</div>' +
			'</div>';

		
		$('#dis').html(html);
		$('#dis .desc').each(function(){
			$(this).html($(this).data('txt'));
		});
		
		this.writeEventBind();
	},
	
	"writeEventBind" : function(){
		var _self = this;

		// 1단계 유형
		$('.step.n1').on('click', function(){
			if ( $(this).hasClass('popup') ) return false;
			
			// 편집 상태에서는 타입 변경이 불가능
			if ( $('#btn_meet_create').hasClass('save') ) {
				mobiscroll.toast({message:gap.lang.mt_alert_12, color:'danger'});
				return false;
			}
			
			_self.showTypeLayer(this);
		});
		
		// 2단계 장소,일시
		$('.step.n2').on('click', function(){
			if ( $(this).hasClass('popup') ) return false;
			var res_meet_type = _self.getResMeetingType();
			if (res_meet_type == '') {
				mobiscroll.toast({message:gap.lang.mt_invalid_1, color:'danger'});
				return false;
			}
			_self.showPlaceLayer(this);
		});

		// 3단계 참여 인원
		$('.step.n3').on('click', function(){
			if ( $(this).hasClass('popup') ) return false;
			_self.showAttendeeLayer(this);
		});
		
		
		// 4단계 제목,내용
		$('.step.n4').on('click', function(){
			if ( $(this).hasClass('popup') ) return false;
			_self.showTitleLayer(this);
		});
		
		
		// 회의생성
		$('#btn_meet_create').on('click', function(){
			// 중복 클릭 방지
			if ($('#btn_meet_create').hasClass('processing')) return false;
			
			if (!$('.step.n1').hasClass('end')) {
				mobiscroll.toast({message:gap.lang.mt_type_msg, color:'danger'});
				return false;
			}
			if (!$('.step.n2').hasClass('end')) {
				mobiscroll.toast({message:gap.lang.mt_place_msg, color:'danger'});
				return false;
			}
			// 참여 인원없이 예약 잡을 수 있도록 수정
			/*
			if (!$('.step.n3').hasClass('end')) {
				mobiscroll.toast({message:gap.lang.mt_att_msg, color:'danger'});
				return false;
			}
			*/
			
			// 회의 시작시간이 현재 시간보다 작은지 검사
			var meet_start = _self.getResMeetingStart();
			var now = moment();
			if (meet_start.diff(now) < 0) {
				mobiscroll.toast({message:gap.lang.mt_invalid_4, color:'danger'});
				return false;
			}
			
			if (!$('.step.n4').hasClass('end')) {
				mobiscroll.toast({message:gap.lang.mt_invalid_2, color:'danger'});
				return false;
			}
			
			
			
			$('#btn_meet_create').addClass('processing');
			
			if ($(this).hasClass('save')) {
				_self.createMeeting(true);
			} else {				
				_self.createMeeting();
			}
		});
						
	},
	
	"initEditHeader" : function(info){
		var _self = this;
		this.showLoading();
		
		var detail_def = $.Deferred();
		
		// 상세 정보를 불러와서 뿌려줘보자
		if (info.type == '2') {
			// 대면회의
			detail_def = this.getMeetingDetail(info.scheduleid);
		} else {
			// 화상회의,  온라인 미팅
			detail_def = this.getOnlineDetail(info.scheduleid);
		}
		
		detail_def.then(function(data){
			if (data.error) {
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				_self.hideLoading();
				return;
			}
			
			_self.initHeader(true);
			
			$('#meeting_body').hide();
			
			// 값을 읽어서 넣어준다 
			_self.setLayerInfo(data);
			_self.hideLoading();
		}, function(){
			mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
			_self.hideLoading();
		});
	},
	
	"setLayerInfo" : function(info){
		var html = '';
		var $layer = $('#dis');
		var $el;
		var el_data;
		
		this.edit_scheduleid = info.scheduleid;
		
		// 1.회의 유형 레이어
		el_data = info.type;
		
		if (info.type == '1'){
			html = gap.lang.mt_type_1;
		} else if (info.type == '2'){
			html = gap.lang.mt_type_2;
		} else {
			html = gap.lang.mt_type_3;
		}
		
		$el = $layer.find('.step.n1');
		$el.addClass('on end').data('info', el_data);
		$el.find('.desc').html(html);
		
		// 2.장소일시 레이어
		if (info.type == '3'){
			el_data = {
				start: moment(info.newevent.start),
				end: moment(info.newevent.end)
			}
			html = el_data.start.format('M.D[(]ddd[)]');
			html += ' ' + el_data.start.format('h:mmA') + ' - ' + el_data.end.format('h:mmA');
		} else {
			el_data = {
				id: info.endpoint.id,
				name: info.endpoint.name,
				company: info.endpoint.company,
				place: info.endpoint.place,
				floor: info.endpoint.floor,
				newevent: info.newevent,
				start: moment(info.newevent.start),
				end: moment(info.newevent.end)
			}
			html = el_data.name + '<br>' + el_data.start.format('M.D[(]ddd[)]');
			html += ' ' + el_data.start.format('h:mmA') + ' - ' + el_data.end.format('h:mmA');
		}
		
		$el = $layer.find('.step.n2');
		$el.addClass('on end').data('info', el_data);
		$el.find('.desc').html(html);
		
		// 3.참여 인원 레이어
		if (info.partylist) {
			el_data = info.partylist;
			
			var user_nm = [];
			$.each(info.partylist, function(){
				if (this.ky.indexOf('@') != -1) {
					// 외부 사용자
					user_nm.push(this.ky);
				} else {
					user_nm.push(this.nm);
				}
			});
			
			html = info.partylist.length + gap.lang.mt_person + '<br><span>' + user_nm.join(', ') + '</span>';
			$el = $layer.find('.step.n3');
			$el.addClass('on end').data('info', el_data);
			$el.find('.desc').html(html);
		}
		
		// 4.회의명/회의 내용 레이어
		if (info.title || info.body) {
			el_data = {
				title: info.title || '',
				body: info.body || ''
			}
			html = '<span>' + info.title + '</span><br><span>' + info.body + '</span>';
			$el = $layer.find('.step.n4');
			$el.addClass('on end').data('info', el_data);
			$el.find('.desc').html(html);
		}
		
		// 저장 버튼 활성화
		
	},
	
	"setDataInfo" : function(meet_type, kys){
		// 다른 시스템에서 호출해서 셋팅하는 경우
		var $layer = $('#dis');
		var $el;
		var el_data;
		
		// 타입 설정
		el_data = meet_type;
		if (meet_type == '1'){
			html = gap.lang.mt_type_1;
		} else if (meet_type == '2'){
			html = gap.lang.mt_type_2;
		} else {
			html = gap.lang.mt_type_3;
		}
		
		$el = $layer.find('.step.n1');
		$el.addClass('on').data('info', el_data);
		$el.find('.cont').html(html);
		
		
		//사용자 설정
		var surl = gap.channelserver + "/search_user_empno.km";
		var postData = {"empno" : Array.isArray(kys) ? kys.join(",") : kys};
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success: function(data){
				var tmp = data[0];
				el_data = [];
				var names = [];
				
				$.each(tmp, function(){
					el_data.push(this);
					names.push(this.nm);
				});
				
				var html = '<span>' + el_data.length + gap.lang.mt_person + '</span><span>' + names.join(', ') + '</span>';
				$el = $layer.find('.step.n3');
				$el.addClass('on').data('info', el_data);
				$el.find('.cont').html(html);
			},
			error: function(){
				//mobiscroll.toast({message:'처리 중 오류가 발생했습니다', color:'danger'});
				//clearTimeout(_self.loading_req);
				//gap.hide_loading();
			}
		});
		
	},
	
	"initBody" : function(){
		var _self = this;
		var $cont = $('#meeting_body');
		$cont.empty();
		
		var _title = '<h2>' + gap.lang.mt_meeting_list + '</h2>';
		$cont.append(_title);
		
		var _tab = 
			'<div class="f_between">' +
			'	<ul class="tab_wr inb">' +
			'		<li id="btn_meeting_today" class="on">' + gap.lang.mt_meeting_today + ' <span id="cnt_today_meet" class="num en"></span></li>' +
            '		<li id="btn_meeting_reserve">' + gap.lang.mt_meeting_all + ' <span id="cnt_reserve_meet" class="num en"></span></li>' +
			'	</ul>' +
			'	<div class="input-field selectbox sel_box">' +
            '		<select id="meet_filter_type">' +
            '			<option value="all">' + gap.lang.mt_filter_all + '</option>' +
            '			<option value="1">' + gap.lang.mt_type_1 + '</option>' +
            '			<option value="2">' + gap.lang.mt_type_2 + '</option>' +
            '			<option value="3">' + gap.lang.mt_type_3 + '</option>' +
            '		</select>' +
            '	</div>' +
			
			'</div>';
		$cont.append(_tab);
		
		$('#meet_filter_type').material_select();
		
		// 오늘 회의
		$cont.find('#btn_meeting_today').on('click', function(){
			if ($(this).hasClass('on')) return;
			$('.tab_wr li').removeClass('on');
			$(this).addClass('on');
			_self.getAllMeetingList(true);
		});
		
		// 예정된 회의
		$cont.find('#btn_meeting_reserve').on('click', function(){
			if ($(this).hasClass('on')) return;
			$('.tab_wr li').removeClass('on');
			$(this).addClass('on');
			_self.getAllMeetingList(false);
		});
		
		// 유형 필터
		$cont.find('#meet_filter_type').on('change', function(){
			var is_today = $('#btn_meeting_today').hasClass('on');
			if (is_today) {
				_self.getAllMeetingList(true);				
				_self.getAllMeetingList(false, true);
			} else {
				_self.getAllMeetingList(true, true);				
				_self.getAllMeetingList(false);
			}
		});
		
		this.getAllMeetingList(true);
		this.getAllMeetingList(false, true);
	},
	
	"getAllMeetingList" : function(is_today){
		var _self = this;
		
		this.showLoading();
		var list_1 = this.getOnlineList(is_today);
		var list_2 = this.getMeetingList(is_today);
		
		return $.when(list_1, list_2).then(function(res_1, res_2){
			// 2개 데이터를 통합해서 하나로 합쳐줘야 함
			var list = res_1.concat(res_2);
			list.sort(function(a,b){
				if (a.starttime > b.starttime) {
					return 1;
				} else {
					return -1;
				}
			});
			
			var filter = $('#meet_filter_type').val();
			if (filter != 'all') {
				list = list.filter(function(e){
					return e.type == filter;
				});
			}
			
			/*
			// 카운트 표시
			if (is_today) {
				$('#cnt_today_meet').html(list.length);
				// LNB영역에 카운트 표시
				gap.unread_count_check(6, list.length);
			} else {
				$('#cnt_reserve_meet').html(list.length);
			}
			*/
			
			_self.drawList(list);
			
			_self.hideLoading();
			
		}, function(err_1, err_2){
			console.log('회의 데이터 로드 중 오류 발생');
			_self.hideLoading();
		});
	},
	
	"setTodayMeetingCount" : function(){
		var _self = this;
		var list_1 = this.getOnlineList(true);
		var list_2 = this.getMeetingList(true);
		
		$.when(list_1, list_2).then(function(res_1, res_2){
			// 2개 데이터를 통합해서 하나로 합쳐줘야 함
			var list = res_1.concat(res_2);
			list.sort(function(a,b){
				if (a.starttime > b.starttime) {
					return 1;
				} else {
					return -1;
				}
			});

			// 카운트 표시
			gap.unread_count_check(6, list.length);
			
		}, function(err_1, err_2){
			console.log('회의 데이터 로드 중 오류 발생');
			_self.hideLoading();
		});
	},
	
	
	"drawList" : function(list){
		
		var _self = this;
		var $tbody = $('#meeting_list');
		$tbody.empty();
		
		if (list.length == 0) {
			
			var $no_wrap = $('<div id="no_data" class="no-box-wrap"></div>');
			$no_wrap.append('<div class="no-box-img"></div>');
			$no_wrap.append('<span class="no-box-txt">' + gap.lang.mt_no_list + '</span>');
			$tbody.append($no_wrap);
			
			//$tbody.append(gap.lang.mt_no_list);
			return;
		}
		
		$.each(list, function(){
			var _type = this.type == '1' ? gap.lang.mt_type_1 : this.type == '2' ? gap.lang.mt_type_2 : gap.lang.mt_type_3;
			var _title = this.title;
			var _date = moment(this.starttime).format('M/D[(]ddd[)] H:mm') + ' ~ ' + moment(this.endtime).format('H:mm');
			var _place = '', _btn_online = '';
			var $btn;

			if (this.endpoint_nm) {
				if (this.type == '3') {
					//_place = '<span class="place">online</span>';
				} else {
					//_place = '<span class="place">' + this.floor_nm + ' ' + this.endpoint_nm + '</span>';					
					_place = '<span class="place">' + this.endpoint_nm + '</span>';
				}
			}
			
			
			var _owner = this.owner_nm + '/' + this.owner_dept;
			
			var is_owner = (this.owner_id == gap.userinfo.rinfo.ky);
			
			/*
			if (is_owner) {
				_owner += '<b class="host">' + gap.lang.mt_owner_disp + '</b>';
			}
			
			
			if (this.online_url) {
				_btn_online = '<button class="btn-meeting-online">' + gap.lang.mt_online_enter + '</button>';
			}
			*/
			
			var _person = gap.lang.member + ' : ' + (this.partylist.length + 1) + gap.lang.mt_person; // 주최자 포함
			
			var html = 
				'<div class="gather-list meet">' +
				'	<div class="rel">' +
				(is_owner ? '<button class="abs ico ico-more">More</button>':'')+
				'		<div class="abs ico ico-meeing' + (this.type == '1' ? ' meet' : this.type == '3' ? ' cam' : '') + '"></div>' +
				'		<span class="gather desc">' + _type + '</span>' +
				'		<span class="gather tit text-elips">' + _title + '</span>' +
				'		<div style="display:flex;margin-top:7px;">' +
				'			<div class="gather line-box" style="margin-top:0;">' +
				'				<p class="txt">' + _date + '</p>' + _place +
				'			</div>' + //_btn_online +
				'		</div>' +
				'		<div class="gather sub_desc f_between">' +
				'			<span>' + _owner + '</span>' +
				'			<span>' + _person + '</span>' +
				'		</div>' +
				'		<div class="btn-wr">' +
				'		</div>' +
				'	</div>' +
				'</div>';
			
			var $li = $(html);
			$li.data('info', this);

			// 화상 참여
			if (this.online_url) {
				$btn = $('<button class="btn-meeting-online">' + gap.lang.mt_online_enter + '</button>'); 
				$li.find('.btn-wr').append($btn);
			}
			
			// 참석자 확인
			$btn = $('<button class="btn-att-info">' + gap.lang.member_check + '</button>'); 
			$li.find('.btn-wr').append($btn);
			
			
			// 위치 확인
			if (this.endpoint_nm) {
				$btn = $('<button class="place btn-place-info">' + gap.lang.loc_check + '</button>'); 
				$li.find('.btn-wr').append($btn);
			}
			

			
			
			$tbody.append($li);
			
			
			/*
			// 수정
			data = '<button type="button" class="ico btn_circle cor_btn' + (is_owner ? '' : ' disabled') + '">' + gap.lang.mt_th_modify + '</span>';
			$tr.append('<td>' + data + '</td>');
			
			// 삭제
			data = '<button type="button" class="ico btn_circle del_btn' + (is_owner ? '' : ' disabled') + '">' + gap.lang.mt_th_remove + '</button>';
			$tr.append('<td>' + data + '</td>');
			
			// 복사
			data = '<button class="ico btn_circle copy_btn' + (this.online_url ? '' : ' disabled') + '">' + gap.lang.mt_th_copy + '</button>';
			$tr.append('<td>' + data + '</td>');
			
			// 양도
			data = '<button type="button" class="ico btn_circle tran_btn' + (is_owner ? '' : ' disabled') + '">' + gap.lang.mt_th_trans + '</span>';
			$tr.append('<td>' + data + '</td>');
			*/
			
			
		});
		
		// 회의실 장소
		$('.place').on('click', function(){
			var info = $(this).closest('.gather-list').data('info');
			_self.openRoomDetailInfo(info.endpoint_key);
		});
		
		// 참석자 확인
		$('.btn-att-info').on('click', function(){
			// 해당 정보를 뽑아와야 함함
			var info = $(this).closest('.gather-list').data('info');
			var user_arr = [];
			user_arr.push(info.owner_id);
			user_arr = user_arr.concat(info.partylist);
			user_arr = user_arr.filter(function(v, i){return user_arr.indexOf(v) === i;});	// 배열중복 제거
			
			// 외부 사용자는 별도 분리
			var ext_user_arr = [];
			ext_user_arr = user_arr.filter(function(v, i){return v.indexOf('@') != -1;});	// 외부사용자 추출
			
			// 외부 사용자 추출
			user_arr = user_arr.filter(function(v, i){return v.indexOf('@') == -1;});	// 외부사용자 제거
			
			var surl = gap.channelserver + "/search_user_empno.km";
			var postData = {"empno" : user_arr.join(",")};
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : JSON.stringify(postData),
				success: function(data){
					var res = data[0];
					var res_data = {
							owner: [],
							member: [],
							exmember: []
						}
					
					// 내부 사용자 정보
					$.each(res, function(){
						if (this.ky == info.owner_id){
							res_data.owner.push(this);
						}else{
							res_data.member.push(this);
						}
					});
					
					// 외부 사용자 정보
					$.each(ext_user_arr, function(){
						res_data.exmember.push({ky:this+''});
					})
					
					console.log(res_data);
					
					var url_link = "kPortalMeet://NativeCall/callMeetInfo?info=" + encodeURIComponent(JSON.stringify(res_data));
					gBodyM.connectApp(url_link);
				}
			});			
		});
		
		// 화상참여하기 버튼
		$('.btn-meeting-online').on('click', function(){
			var info = $(this).closest('.gather-list').data('info');
			var check = _self.onlineTimeCheck({start:info.starttime, end:info.endtime});
			
			if (check == 'before') {
				// 15분전에만 입장 가능
				mobiscroll.toast({message:gap.lang.meeting_time_limit, color:'danger'});
				return false;
			} else if (check == 'over') {
				// 종료시간 지난 경우 입장 불가
				mobiscroll.toast({message:gap.lang.mt_over_time, color:'danger'});
				return false;
			} 
			
			//auth키를 한번 더 감싸야 함
			//mobiscroll.toast({message:info.online_url + encodeURIComponent('&auth=' + gap.get_auth()), color:'danger'});
			//window.open(info.online_url + encodeURIComponent('&auth=' + gap.get_auth()));
			
			//var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(info.online_url + encodeURIComponent('&auth=' + gap.get_auth()));
			console.log(info.online_url + encodeURIComponent('&auth=' + gap.get_auth()));
			var url_link = "kPortalMeet://NativeCall/callUrl?url=" + encodeURIComponent(info.online_url + encodeURIComponent('&auth=' + gap.get_auth()));
			gBodyM.connectApp(url_link);
		});
		
		// more 버튼
		$('.gather-list .ico-more').on('click', function(e){
			var html = 
				'<div class="more-layer">' +
				'	<div class="more-menu btn-modify">' + gap.lang.mt_th_modify + '</div>' +
				'	<div class="more-menu btn-remove">' + gap.lang.mt_th_remove + '</div>' +
				'</div>';
			
			$(e.target).qtip({
				//overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생				
				style: {
					classes: 'more-qtip',
					tip: {
						corner: false
					}
				},
				content : {
					text : html
				},
				show : {
					event: 'click',
					ready: true
				},
				hide : {
					event : 'unfocus click',
					fixed: true
				},
	            position: {
					viewport: $('#container'),
	                my: 'right top',
	                at: 'right top',
	                adjust: {
						y: 0
					}
	            },
	            events: {
	            	render: function(e, api){
	            		var info = $(api.elements.target).closest('.gather-list').data('info');
	            		var $tip = $(api.elements.tooltip);
	            		
	            		// 수정
	            		$tip.find('.btn-modify').on('click', function(){
	            			var param = {
	            				t: 'modify',
	            				k1: info.type,
	            				k2: info.scheduleid
	            			}
	            			
	            			var url = location.protocol + '//' + location.host + window.cdbpath + '/meet?readform&' + $.param(param);
	            			console.log(url);
	            			var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(url);
	            			gBodyM.connectApp(url_link);
	            			
	            			//var url = cdbpath + '/meet?readform&' + $.param(param);
	            			//var url_link = "kPortalMeet://NativeCall/callNewLayer?url=meet"
	            			//window.open(url);
	            		});
	            		                		
	            		// 삭제
	            		$tip.find('.btn-remove').on('click', function(){
	            			var target = $(api.elements.target);
	            			gap.showConfirm({
	        					title: gap.lang.mt_remove_title,
	        					contents: '"' + info.title + '"' + '<br><span>' + gap.lang.mt_remove_msg + '</span>',
	        					callback: function(){
	            					gMetM.showLoading();
	            					
	            					gMetM.cancel_done = '';
	        						
	        						var cancel_promise;
	        						if (info.type == "2") {
	        							// 회의실 예약인 경우
	        							cancel_promise = gMetM.meetingCancel(info.scheduleid);
	        						} else {
	        							// 화상회의인 경우
	        							cancel_promise = gMetM.onlineCancel(info.scheduleid);
	        						}
	        						
	        						cancel_promise.then(function(){
	        							if (gMetM.cancel_done) {
	        								$(target).closest('.gather-list').remove();	        								
	        							}
	        							gMetM.hideLoading();	        							
	        						}, function(){
	        							mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
	        							gMetM.hideLoading();
	        						});
	        					}
	        				});
	            			$tip.qtip('destroy');
	            		});
	            	},
	            	show: function(e, api){
	            		$(api.elements.target).addClass('on');
	            	},
	            	hide: function(e, api){
	            		$(api.elements.target).removeClass('on');
	            		$(api.elements.tooltip).qtip('destroy');
	            	}
	            }
	            
			});
		});
		
		
		
		//this.tableEvent();
	},
	
	"tableEvent": function(){
		var _self = this;
		
		$('#meeting_list_table').tablesorter({
			sortList: [[4,0]],
			textExtraction: {
				//0: function(node, table, cell_idx) {return $(node).parent('tr').data('info').type;},	// 타입
				3: function(node, table, cell_idx) {
					var start = moment($(node).closest('tr').data('info').starttime).toDate().getTime();
					return start;
				},
				4: function(node, table, cell_idx) {
					var start = moment($(node).closest('tr').data('info').starttime).toDate().getTime();
					return start;
				}
			}
		});
		
		// Button Events
		$('#meeting_list_table').on('click', function(e){
			var $tr = $(e.target).closest('tr');
			var info = $tr.data('info');
			
			// 화상회의 링크 참여
			if ($(e.target).hasClass('btn-meeting-online')) {
				window.open(info.online_url);
				return false;
			}
			
			// 회의명(회의내용)
			if ($(e.target).hasClass('body')) {
				_self.showMeetingContents(e.target);
				return false;
			}
			if ($(e.target).hasClass('icon-cont')) {
				_self.showMeetingContents($(e.target).parent());
				return false;
			}
			
			// 주최자
			if ($(e.target).hasClass('owner')) {
				gOrg.showUserDetailLayer($(e.target).data('key'));
				return false;
			}
			
			// 찹석자
			if ($(e.target).hasClass('partylist')) {
				_self.showMeetingPartylist(e.target);
				return false;
			}
			
			// 회의실
			if ($(e.target).hasClass('endpoint')) {
				var room_url = '/rezmanager/uss/mtg/selectMtgPlacePopup.do?trgetId=' + info.endpoint_key;
				gap.open_subwin(room_url, 700, 800);
				return false;
			}
			
			// 수정
			if ($(e.target).hasClass('cor_btn')) {
				if ( $(e.target).hasClass('disabled') ) return false;
				if (info.endpoint_length >= 2) {
					_self.showConfirm({
						title: gap.lang.info,
						contents: gap.lang.mt_go_site,
						callback: function(){
							$('#btn_go_online').click();
						}
					});
					return false;
				}
				_self.initEditHeader(info);
				return false;
			}
			
			// 삭제
			if ($(e.target).hasClass('del_btn')) {
				if ( $(e.target).hasClass('disabled') ) return false;
				
				if (info.owner_id != gap.userinfo.rinfo.ky) {
					mobiscroll.toast({message:gap.lang.mt_alert_1, color:'danger'});
					return false;
				}
				
				_self.showConfirm({
					title: gap.lang.mt_remove_title,
					contents: '"' + info.title + '"' + '<br><span>' + gap.lang.mt_remove_msg + '</span>',
					callback: function(){
						_self.showLoading();
						
						var cancel_promise;
						if (info.type == "2") {
							// 회의실 예약인 경우
							cancel_promise = _self.meetingCancel(info.scheduleid);
						} else {
							// 화상회의인 경우
							cancel_promise = _self.onlineCancel(info.scheduleid);
						}
						
						cancel_promise.then(function(){
							_self.getAllMeetingList($('#btn_meeting_today').hasClass('on')).then(function(){
								_self.hideLoading();						
							});
						}, function(){
							mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
							_self.hideLoading();
						});
					}
				});
				
				return false;
			}
			
			// 복사
			if ($(e.target).hasClass('copy_btn')) {
				if ( $(e.target).hasClass('disabled') ) return false;
				var $copy_input = $('<input type="text" style="">');
				$copy_input.val(info.online_url);
				$('body').append($copy_input);
				$copy_input.get(0).select();
				document.execCommand("copy");
				$copy_input.remove();
				mobiscroll.toast({message:gap.lang.mt_url_copy, color:'info'});
				return false;
			}
			
			// 양도
			if ($(e.target).hasClass('tran_btn')) {
				if ( $(e.target).hasClass('disabled') ) return false;
				gap.showBlock();
				window.ORG.show({
					'title': gap.lang.mt_trans_title,
					'single': true,
					'select': 'person'
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items){
						var item = items[0];
						if (gap.userinfo.rinfo.ky == item.orgnumber) {
							mobiscroll.toast({message:gap.lang.mt_alert_2, color:'danger'});
							return false;
						}
						
						// 컨펌창을 띄워서 양도 여부를 결정한다
						gap.showConfirm({
							title: '회의실 양도',
							contents: item.name + gap.lang.mt_trans_msg,
							callback: function(){
								//alert('가지가라');
							}
						});
					},
					onClose: function(){
						gap.hideBlock();
					}
				});
				return false;
			}
			
		})
	},
	
	"showMeetBlock" : function(){
		$('.meet-block-layer').remove();
		var html = '<div class="meet-block-layer"></div>';
		var $block = $(html);
		$block.on('click', function(){
			$('.mo_popup .m_close_btn').click();
		});
		
		$('#container').append($block);
		
	},
	
	"hideMeetBlock" : function(){
		$('.meet-block-layer').remove();
	},
	
	"setLayer" : function(el, html){
		var _self = this;
		this.showMeetBlock();
		
		var $target = $(el);
		$target.addClass('on');
				
		//$('.meet-make-layer').remove();
		
		var $layer = $(html);
		
		$('#container').append($layer);
		setTimeout(function(){
			$layer.removeClass('hide');
		}, 10);
	},
	
	// 타입 레이어 표시
	"showTypeLayer" : function(el){
		var _self = this;
		var $el = $(el);
		var html =
			'<div id="meeting_type" class="mo_popup hide">' +
			'	<div class="pop_tit">' +
			'		<h1>1.' + gap.lang.mt_type + '</h1>' +
			'		<button type="button" class="m_close_btn"></button>' +
			'	</div>' +
			'	<div class="pop_cont">' +
			'		<div class="m_count" data-value="2">' +
			'			<h2>' + gap.lang.mt_type_2 + '</h2>' +
			'			<span class="txt">' + gap.lang.mt_type_2_cont + '</span>' +
			'			<span class="mo_ico m2"></span>' +
			'		</div>' +
			'		<div class="m_count" data-value="1">' +
			'			<h2>' + gap.lang.mt_type_1 + '</h2>' +
			'			<span class="txt">' + gap.lang.mt_type_1_cont + '</span>' +
			'			<span class="mo_ico m1"></span>' +
			'		</div>' +
			'		<div class="m_count" data-value="3">' +
			'			<h2>' + gap.lang.mt_type_3 + '</h2>' +
			'			<span class="txt">' + gap.lang.mt_type_3_cont + '</span>' +
			'			<span class="mo_ico m3"></span>' +
			'		</div>' +
			'	</div>' +
			'	<div class="btn_sec">' +
			'		<button type="button" class="m_confirm">' + gap.lang.OK + '</button>' +
			'	</div>' +
			'</div>';
		
		this.setLayer(el, html);
		
		var $layer = $('#meeting_type');
		
		var info = $el.data('info');
		if (info) {
			$layer.find('.m_count[data-value="' + info + '"]').addClass('on end');
		}
		
		// 이벤트 처리
		$layer.find('.m_close_btn').on('click', function(){
			var $parent = $('.step.n1');
			$parent.removeClass('popup');
			if (!$parent.hasClass('end')) $parent.removeClass('on');
			$layer.remove();
			_self.hideMeetBlock();
			return false;
		});
		
		// 타입선택
		$layer.find('.m_count').on('click', function(){
			if ($(this).hasClass('on')) return false;
			$layer.find('.m_count').removeClass('on');
			$(this).addClass('on');
		});
		
		// 확인
		$layer.find('.m_confirm').on('click', function(){
			var $sel_type = $layer.find('.m_count.on');
			if ($sel_type.length == 0) {
				mobiscroll.toast({message:gap.lang.mt_invalid_3, color:'danger'});
				return false;
			}
			
			var txt = $sel_type.find('h2').text();
			var sel_type = $sel_type.data('value');			
			var before_info = $el.data('info');
			if (before_info && before_info != sel_type && $('.step.n2').hasClass('end')) {
				_self.showConfirm({
					title: gap.lang.info,
					contents: gap.lang.mt_alert_3,
					callback: function(){
						$el.find('.desc').html(txt);
						$el.data('info', $sel_type.data('value')).addClass('end');
						
						// 장소/일시 초기화
						$('.step.n2').removeClass('end');
						$('.step.n2').removeData('info');
						$('.step.n2 .desc').html($('.step.n2 .desc').data('txt'));					
						$('#btn_meet_create').addClass('hide');
						$layer.find('.m_close_btn').click();
						$('.step.n2').click();
					}
				});
				
				return false;
			} else {
				$el.find('.desc').html(txt);
				$el.data('info', $sel_type.data('value')).addClass('end');
				$layer.find('.m_close_btn').click();
				$('.step.n2').click();
			}
			
			return false;
		});
	},
	
	// 타입정보 가져오기
	"getResMeetingType" : function(){
		var res = "";
		
		var $el = $('#dis').find('.step.n1');
		var info = $el.data('info');
		if (info) {
			res = info;			
		}
		
		
		return res;
	},
	
	// 회의실 or 화상장비 코드 정보
	"getResMeetingCode" : function(){
		var res = "";
		
		var $el = $('#dis').find('.step.n2');
		var info = $el.data('info');
		if (info) {
			res = info.id;
		}		
		
		return res;
	},
	
	// 회의 시작일시
	"getResMeetingStart" : function(){
		var res = "";
		
		var $el = $('#dis').find('.step.n2');
		var info = $el.data('info');
		if (info) {
			res = info.start;
		}
		
		return res;
	},
	
	// 회의 종료일시
	"getResMeetingEnd" : function(){
		var res = "";
		
		var $el = $('#dis').find('.step.n2');
		var info = $el.data('info');
		if (info) {
			res = info.end;
		}
		
		return res;
	},
	
	// 참석자
	"getResMeetingUser" : function(){
		var res = [];
		
		var $el = $('#dis').find('.step.n3');
		var info = $el.data('info');
		if (info) {
			$.each(info, function(){
				res.push(this.ky);
			});
		}
		
		return res;
	},
	
	// 제목
	"getResMeetingTitle" : function(){
		var res = "";
		
		var $el = $('#dis').find('.step.n4');
		var info = $el.data('info');
		if (info) {
			res = info.title;
		}
		
		if (res == "") {
			res = gap.lang.mt_new_meeting;
		}
		return res;
	},
	
	// 내용
	"getResMeetingBody" : function(){
		var res = "";
		
		var $el = $('#dis').find('.step.n4');		
		var info = $el.data('info');
		if (info) {
			res = info.body;
		}
		
		return res;
	},
	
	
	
	// 레이어 표시
	"showPlaceLayer" : function(el){
		// 회의실 확인으로 띄우는 경우에는 el값이 안넘어옴
		var is_res = false;
		if (el) {
			is_res = true;
			this.room_check = false;
		} else {
			// 회의실 확인에서 띄운 경우
			this.room_check = true;
		}

		function _getTimeHtml() {
			var html_time = '';
			var now = moment();
			now.set({'hour':0, 'minute':0, 'second':0, 'millisecond':0});
			
			var ckdate = now.clone();
			ckdate.add(1, 'day');
			
			while (now.format() != ckdate.format()) {
				html_time += '<option value="' + now.format('HH:mm') + '">' + now.format('h:mmA') + '</option>';;
				now.add(10, 'minutes');
			}
			return html_time;
		}
		
		function _initSearch(){
			$('#btn_place_search').addClass('on');
			$('.sel_list').empty();
			$('#btn_place_select').removeClass('on');
		}
		
		var _self = this;
		
		$('#meeting_time').remove();
		
		if (this.room_check) {
			$('#dis').append('<div id="container" class="mu_mobile"></div>');
		}
		var html =
			'<div id="meeting_time" class="mo_popup' + (is_res ? ' hide' : '') + '">' +
			'	<div id="room_check_title" class="mo_topbox meeting" style="display:none;">' + 
            '		<h2><span class="ico ico-tit meeting"></span>' + gap.lang.mt_room_check + '</h2>' +                   
            '	</div>' +
			'	<div class="pop_tit">' +
			'		<h1>2.' + gap.lang.mt_place + '</h1>' +
			'		<button type="button" class="m_close_btn"></button>' +
			'	</div>' +
			
			'	<div class="mo_table_box">' +
			'		<table class="nothover">' +
			'			<tbody>' +
			'				<tr id="place_wrap">' +
			'					<th><span>' + gap.lang.mt_ly_place + '</span></th>' +
			'					<td class="sch_place">' +
			'						<div class="input-field selectbox" style="margin-right: 8px;">' +
			'							<select id="meet_res_company"></select>' +
			'						</div>' +
			'						<div class="input-field selectbox">' +
			'							<select id="meet_res_place"></select>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			
			'				<tr id="floor_wrap">' +
			'					<th><span>' + gap.lang.mt_ly_floor + '</span></th>' +
			'					<td class="sch_place">' +
			'						<div class="input-field selectbox" style="margin-right: 8px;">' +
			'							<select id="meet_res_floor"></select>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			
			'				<tr>' +
			'					<th><span>' + gap.lang.mt_th_date + '</span></th>' +
			'					<td>' +
			'						<div class="sch_day_box">' +
			'							<input type="text" id="meet_res_date" class="input day">' +
			'							<button type="button" class=mo_ico></button>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th style="border-radius: 0 0 10px 10px; "><span>' + gap.lang.mt_th_time + '</span></th>' +
			'					<td class="time" style="height:44px;">' +
			'						<input type="text" id="meet_res_stime" class="meet-time">' +
			'						<span class="time_mid">~</span>' +
			'						<input type="text" id="meet_res_etime" class="meet-time">' +
			'					</td>' +
			'				</tr>' +
			'			</tbody>' +
			'		</table>' +
			'	</div>' +
			
			'	<div class="btn_sec b_c">' +
			'		<button type="button" class="m_confirm on" id="btn_place_search" style="margin-bottom: 30px;">' + gap.lang.search + '</button>' +
			'	</div>' +
			
			'	<div class="place_sec">' +
			'		<div id="place_search_result" class="mo_table_box">' +
			'			<table class="nothover">' +
			'				<tbody>' +
			'					<tr>' +
			'						<th><span></span></th>' +
			'						<td>' +
			'							<div class="sel_list" style="display:none;"></div>' +
			'						</td>' +
			'					</tr>' +
			'				</tbody>' +
			'			</table>' +
			'		</div>' +
			'		<div class="btn_sec b_c">' +
			'			<button type="button" class="m_confirm on" id="btn_place_' + (is_res ? 'select' : 'close') + '" style="display:none;">' + (is_res ? gap.lang.OK : gap.lang.basic_close) + '</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		this.setLayer(el, html);

		var $layer = $('#meeting_time');
		if (this.room_check) {
			$('#room_check_title').show();
			$layer.addClass('room-check');
			$layer.find('.pop_tit').remove();			
		}
				
		var info = (is_res ? $(el).data('info') : '');
		var sel_date;
		if (info) {
			sel_date = moment(info.start).format('YYYY-MM-DD');		
		} else {
			sel_date = moment().format('YYYY-MM-DD');
		}
		$('#meet_res_date').val(sel_date);
		
		// 날짜
		var $date = $('#meet_res_date');
		var $s_time = $('#meet_res_stime');
		var $e_time = $('#meet_res_etime');
		var time_html = _getTimeHtml();		
		$date.mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			defaultSelection: moment(sel_date),
			anchor: $date.get(0),
			display: 'anchored',
			theme: 'ios',
			themeVariant : 'light',
			controls: ['calendar'],
			dateFormat: 'YYYY-MM-DD',
			calendarType: 'month',
			touchUi: true,
			buttons: [],
			min: moment().format('YYYY-MM-DD'),
			onChange: function(event, inst){
				$('#meet_res_date').val(event.valueText);
				
				// 회의실 목록이 표시되어 있는 상태면 바로 뿌려주기
				if ($('.sel_list').is(':visible')) {
					_self.drawPlaceTimeline();					
				}
			}
		});
		
		$layer.find('.mo_ico').on('click', function(){
			$date.mobiscroll('getInst').open();
		});
		
		/*
		// 시간 (기본은 현재 시간 +1)
		var s_time, e_time;
		
		if (info) {
			s_time = info.start.format('HH:mm');
			e_time = info.end.format('HH:mm');
		} else {
			var now = moment();
			var add_hour = now.get('h') < 23 ? 1 : 0; // 11시가 넘으면 +1 하지 않음
			s_time = now.startOf('h').add(add_hour, 'h').format('HH:mm');
			e_time = now.add(1, 'h').format('HH:mm');			
		}
		
		$s_time.append(time_html).val(s_time);
		$e_time.append(time_html).val(e_time);
		*/
		
		$s_time.mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			defaultSelection: '',
			theme: 'ios',
			themeVariant : 'light',
			controls: ['time'],
			stepMinute: 10,
			timeFormat: 'hh:mm A',
            onInit: function (event, inst) {
				var s_time;
				if (info) {
					s_time = info.start.format('HH:mm');
				} else {
					var now = moment();
					var add_hour = now.get('h') < 23 ? 1 : 0; // 11시가 넘으면 +1 하지 않음
					s_time = now.startOf('h').add(add_hour, 'h').format('HH:mm');					
				}
				inst.setVal(s_time, true);
			},
			onChange: function (event, inst) {
				_initSearch();
				
				var s_time = moment(event.value);
				var e_time = moment($e_time.mobiscroll('getInst').getVal());
				// 시작 시간이 종료시간보다 크면 종료시간에 +1을 함다
				if (s_time.diff(e_time) > 0) {
					$e_time.mobiscroll('getInst').setVal(s_time.add(1, 'h').format('HH:mm'));
				}
			}
		});
		
		$e_time.mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			defaultSelection: '',
			theme: 'ios',
			themeVariant : 'light',
			controls: ['time'],
			stepMinute: 10,
			timeFormat: 'hh:mm A',
            onInit: function (event, inst) {
				var e_time;
				if (info) {
					e_time = info.end.format('HH:mm');
				} else {
					var now = moment();
					var add_hour = now.get('h') < 23 ? 1 : 0; // 11시가 넘으면 +1 하지 않음
					e_time = now.startOf('h').add(add_hour, 'h').add(1, 'h').format('HH:mm');					
				}
				inst.setVal(e_time, true);
			},
			onChange: function (event, inst) {
				_initSearch();
				
				var s_time = moment($s_time.mobiscroll('getInst').getVal());
				var e_time = moment(event.value);
				// 종료 시간이 시작시간보다 작으면 시작시간에 -1을 함다
				if (s_time.diff(e_time) > 0) {
					$s_time.mobiscroll('getInst').setVal(e_time.add(-1, 'h').format('HH:mm'));
				}
			}
		});
		
		
		var res_meet_type = (is_res ? _self.getResMeetingType() : '2');
		
		
		// 회사정보 가져오기
		// 타입에 따라 API 정보 요청
		var com_opt = '';
		if (res_meet_type == '1') {
			//전체 회사 정보를 가져와야 함
			var com_list = _self.getCompanyList();
			var disp_com_code = gap.userinfo.rinfo.cpc;
			if (info) {
				disp_com_code = info.company;
			}
			$.each(com_list, function(){
				if (this.company_code == disp_com_code) {
					com_opt += '<option selected value="' + this.company_code + '">' + this.company_name + '</option>';
				} else {
					com_opt += '<option value="' + this.company_code + '">' + this.company_name + '</option>';
				}
			});
			$('#meet_res_company').html(com_opt);
		} else {			
			com_opt = '<option selected value="' + gap.userinfo.rinfo.cpc + '">' + gap.userinfo.rinfo.cp + '</option>';
			$('#meet_res_company').html(com_opt);
			$('#meet_res_company').prop('disabled', true);
		}
						
		
		// 위치 정보 가져오기
		var $def = $.Deferred();
		var com_code = $('#meet_res_company').val();			
		
		if (res_meet_type == '1') {
			// 화상회의 예약
			this.onlineAPI("getSubDept.do", {deptcd:com_code}).then(function(data){
				var html = '<option value="all" selected>' + gap.lang.All + '</option>';
				$('#meet_res_floor').html(html);
				
				$.each(data.subdeptlist, function(){
					html += '<option value="' + this.deptcd + '">' + this.deptnm + '</option>';
				});
				
				$('#meet_res_place').html(html);
				
				if (info) {
					_self.onlineAPI("getSubDept.do", {deptcd:info.place}).then(function(data){
						var html = '<option value="all" selected>' + gap.lang.All + '</option>';
						
						$.each(data.subdeptlist, function(){
							html += '<option value="' + this.deptcd + '">' + this.deptnm + '</option>';
						});
						
						$('#meet_res_floor').html(html);
						$('#meet_res_place').val(info.place);
						$('#meet_res_floor').val(info.floor);
						
						$def.resolve();
					});
				} else {
					$def.resolve();					
				}
			}, function(){
				$def.resolve();
			});
		} else if (res_meet_type == '2') {
			// 회의실 예약
			this.meetingAPI("floor_list.open", {placeCode:com_code}).then(function(data){
				var html = '<option value="all" selected>' + gap.lang.All + '</option>';
				$('#meet_res_floor').html(html);
				
				$.each(data.result, function(){
					html += '<option value="' + this.floorCode + '">' + this.floor + '</option>';
				});
				
				$('#meet_res_place').html(html);
				
				if (info) {
					_self.meetingAPI("sub_list.open", {floorCode:info.place}).then(function(data){
						var html = '<option value="all" selected>' + gap.lang.All + '</option>';
						
						$.each(data.result, function(){
							html += '<option value="' + this.subCode + '">' + this.sub + '</option>';
						});
						
						$('#meet_res_floor').html(html);
						$('#meet_res_place').val(info.place);
						$('#meet_res_floor').val(info.floor);
						
						$def.resolve();
					});
				} else {
					$def.resolve();					
				}
			}, function(){
				$def.resolve();
			});
		} else {
			//var html = '<div class="timeline none_meet f_center">' + gap.lang.mt_ly_online_msg + '</div>';
			//$('#meet_res_timeline').html(html);
			//$('#meet_res_company').prop('disabled', true);
			//$('#meet_res_place').html('<option value="all" selected>' + gap.lang.All + '</option>').prop('disabled', true);
			//$('.meeting-place-wrap').hide();
			$('.btn_sec b_c').hide();
			$('#place_wrap').hide();
			$('#floor_wrap').hide();
			$('#place_search_result').hide();
			$('#btn_place_search').hide();
			$('#btn_place_select').show();
			
			$def.resolve();
		}
		
		$def.then(function(){
			// 장소 정보 가져오기
			//_self.drawPlaceTimeline();
			
			// 이벤트 바인드
			_self.placeLayerEventBind();
		});
	},
	
	"placeLayerEventBind" : function(){
		var _self = this;
		var $layer = $('#meeting_time');
		
		$layer.find('select').material_select();
		
		// 레이어 닫기
		$layer.find('.m_close_btn').on('click', function(){
			var $parent = $('.step.n2');
			$parent.removeClass('popup');
			if (!$parent.hasClass('end')) $parent.removeClass('on');
			$layer.remove();
			_self.hideMeetBlock();
			return false;
		});
		
		// 회사 변경
		$layer.find('#meet_res_company').on('change', function(){
			var res_meet_type = _self.getResMeetingType();
			var com_code = $(this).val();
			if (res_meet_type == '1') {
				_self.onlineAPI("getSubDept.do", {deptcd:com_code}).then(function(data){
					var html = '<option value="all" selected>' + gap.lang.All + '</option>';
					$('#meet_res_floor').html(html).material_select();
					$('#meet_res_floor_wrap').hide();
					$.each(data.subdeptlist, function(){
						html += '<option value="' + this.deptcd + '">' + this.deptnm + '</option>';
					});
					
					$('#meet_res_place').html(html).material_select();
					
					_self.drawPlaceTimeline();
				}, function(){
					
				});
			}
		});
		
		
		// 장소 변경
		$layer.find('#meet_res_place').on('change', function(){
			var res_meet_type = _self.getResMeetingType();
			var code = $(this).val();
			if (res_meet_type == '2') {
				if (code == 'all') {
					var html = '<option value="all" selected>' + gap.lang.All + '</option>';
					$('#meet_res_floor').html(html).material_select();
					_self.drawPlaceTimeline();
				} else {
					_self.meetingAPI("sub_list.open", {floorCode:$(this).val()}).then(function(data){
						var html = '<option value="all" selected>' + gap.lang.All + '</option>';
						
						$.each(data.result, function(){
							html += '<option value="' + this.subCode + '">' + this.sub + '</option>';
						});
						
						$('#meet_res_floor').html(html).material_select();
						
						// 회의실 목록이 표시되어 있는 상태면 바로 뿌려주기
						if ($('.sel_list').is(':visible')) {
							_self.drawPlaceTimeline();					
						}
					});
				}
			} else {
				if (code == 'all') {
					var html = '<option value="all" selected>' + gap.lang.All + '</option>';
					$('#meet_res_floor').html(html).material_select();
					_self.drawPlaceTimeline();
				} else {
					_self.onlineAPI("getSubDept.do", {deptcd:$(this).val()}).then(function(data){
						var html = '<option value="all" selected>' + gap.lang.All + '</option>';
						
						$.each(data.subdeptlist, function(){
							html += '<option value="' + this.deptcd + '">' + this.deptnm + '</option>';
						});
						
						$('#meet_res_floor').html(html).material_select();
						
						// 회의실 목록이 표시되어 있는 상태면 바로 뿌려주기
						if ($('.sel_list').is(':visible')) {
							_self.drawPlaceTimeline();					
						}
					});
				}
			}
		});
		
		// 층 변경
		$layer.find('#meet_res_floor').on('change', function(){
			_self.drawPlaceTimeline();
		});
		
		/*
		// 시작시간
		$layer.find('#meet_res_stime').on('change', function(){			
			var is_avail = _self.changeTime(true);
			if (!is_avail) {
				mobiscroll.toast({message:gap.lang.mt_alert_4, color:'danger'});
			} else {
				$layer.find('.sel_list').empty();
				$layer.find('#btn_place_search').addClass('on');
				$layer.find('#btn_place_select').removeClass('on');
			}				
		});
		
		// 종료시간
		$layer.find('#meet_res_etime').on('change', function(){
			var is_avail = _self.changeTime(false);
			if (!is_avail) {
				mobiscroll.toast({message:gap.lang.mt_alert_4, color:'danger'});
			} else {
				$layer.find('.sel_list').empty();
				$layer.find('#btn_place_search').addClass('on');
				$layer.find('#btn_place_select').removeClass('on');
			}
		});
		*/
		
		// 장소 조회하기 버튼 
		$layer.find('#btn_place_search').on('click', function(){
			if (!$(this).hasClass('on')) return false;
			_self.drawPlaceTimeline();
		});
		
		// 확인버튼
		$layer.find('#btn_place_select').on('click', function(){
			var _start = $('#meet_res_date').val() + 'T' + moment($('#meet_res_stime').mobiscroll('getVal')).format('HH:mm');
			var _end = $('#meet_res_date').val() + 'T' + moment($('#meet_res_etime').mobiscroll('getVal')).format('HH:mm');
			var res_meet_type = _self.getResMeetingType();
			var res_html = '';
			
			if (res_meet_type == '3') {
				var res_data = {
					start: moment(_start),
					end: moment(_end)
				}
				
				res_html = res_data.start.format('M.D[(]ddd[)]');
				res_html += ' ' + res_data.start.format('h:mmA') + ' - ' + res_data.end.format('h:mmA');
			} else {
				
				var $place = $layer.find('.sel_count.on');
				var resource = $place.data('place');

				var res_data = {
					id: resource.id,
					name: resource.name,
					company: resource.company,
					//place: resource.place,
					//floor: resource.floor,
					place: $('#meet_res_place').val(),	// 현재 선택된 값으로 표시
					floor: $('#meet_res_floor').val(),
					start: moment(_start),
					end: moment(_end)
				}
				
				res_html = res_data.name + '<br>' + res_data.start.format('M.D[(]ddd[)]');
				res_html += ' ' + res_data.start.format('h:mmA') + ' - ' + res_data.end.format('h:mmA');
			}
			
			
			var $el = $('.step.n2');
			$el.data('info', res_data).addClass('on end');
			$el.find('.desc').html(res_html);
			$layer.find('.m_close_btn').click();
			
			if (!$('.step.n3').hasClass('end')) {
				$('.step.n3').click();
			} else if (!$('.step.n4').hasClass('end')) {
				$('.step.n4').click();
			}
			
			_self.finishCheck();
			
			return false;
		});
		
	},
	
	"getNewEvent" : function(){
		var new_event = this.timeline.getEvents().filter(function (e) { return e.temp })[0];
		return new_event;
	},
	"changeTime" : function(is_start_change){
		var _self = this;
		
		var $s_time = $('#meet_res_stime');
		var $e_time = $('#meet_res_etime');
		var s_time = $s_time.val();
		var e_time = $e_time.val();
		if (s_time >= e_time) {
			if (is_start_change) {
				var temp = moment($('#meet_res_date').val() + 'T' + s_time);
				var e_time = temp.add(1, 'h').format('HH:mm');
				$e_time.val(e_time).material_select();				
			} else {
				var temp = moment($('#meet_res_date').val() + 'T' + e_time);
				var s_time = temp.add(-1, 'h').format('HH:mm');
				$s_time.val(s_time).material_select();
			}
		}
		
		var res_meet_type = _self.getResMeetingType();
		if (res_meet_type == '3') {
			return true;
		}
		
		
		var res = true;
/*		
		// 현재 시간 이전으로 잡는 경우
        var start = moment(new_event.start).toDate();
        var today = moment().toDate();
        if (start && start < today) {
        	new_event.color = this.unavail_color;
        	res = false;
        }
*/

		return res;
	},
	
	"drawPlaceTimeline" : function(){
				
		var _self = this;
		var meeting_type = this.getResMeetingType();
		var $def;
		
		
		$('.m_confirm').removeClass('on');
		
		
		if (meeting_type == "1") {
			$def = this.getOnlinePlaceList();
		} else if (meeting_type == "2" || this.room_check) {
			$def = this.getMeetingPlaceList();
		} else {
			return;
		}
		
		$('.sel_list').empty().show();
		$('#btn_place_select').show();
		
		$def.then(function(place_list){
			var resources = [];
			//var info = $('.step.n2').data('info');
			var $list = $('.sel_list');
			
			if (place_list.length == 0) {
				$list.append('<span style="text-align:center;font-size:14px;">' + gap.lang.mt_no_place + '</span>');
				return;
			}
			
			// 회의실 리소스 셋팅 
			$.each(place_list, function(){
				
				var html = 
				'<div class="sel_count">' +
				'	<span>' + this.name + '</span>' + (this.video ? '<div class="mo_ico"></div>' : '') + 
				'</div>';
				var $li = $(html);
				
				$list.append($li);
				
				resource = {
					id: this.key,
					name: this.name,
					company: this.company,
					place: this.place,
					floor: this.floor,
					number: this.number || '0',
					video: this.video
				};
				
				$li.data('place', resource);
			});
			
			$list.find('.sel_count').on('click', function(){
				$list.find('.sel_count.on').removeClass('on');
				$(this).addClass('on');
				$('#btn_place_select').addClass('on');
			});
		});
	},
	
	"showAttendeeLayer" : function(el){
		function validateEmail(email) {
			const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(String(email).toLowerCase());
		}
		function _orgSearch(){
			var $el = $('#txt_attendee');
			var terms = $.trim($el.val());
			if (terms == '') return;
			
			var users = terms.split(',');
			  
			if (terms.indexOf('@') != -1 && users.length == 1 && validateEmail(terms)) {
				// 외부 사용자 입력
				_self.addAttendee({ky:terms});
			} else {
				gBodyM.org_search(true, terms, 'gMetM', 'addAttendeeOrg');
				/*
				gsn.requestSearch(gap.userinfo.rinfo.cpc, terms, function(res){
					$.each(res, function(){
						_self.addAttendee(this);
					});
					
					$('#txt_attendee').focus();
				});
				*/
			}
			
			$el.val('');
		}
		
		var _self = this;
		var $el = $(el);
		var html =
			'<div id="meeting_attendee" class="mo_popup pers hide">' +
			'	<div class="pop_tit">' +
			'		<h1>3.' + gap.lang.mt_att + '</h1>' +
			'		<button type="button" class="m_close_btn"></button>' +
			'	</div>' +
			'	<div class="mo_table_box">' +
			'		<div class="search_sec">' +
			'			<input type="text" id="txt_attendee" placeholder="' + gap.lang.mt_ly_att_msg + '">' +
			'			<button type="button" class="mo_ico ico-org-search">' + gap.lang.search + '</button>' +
			'			<button type="button" class="mo_ico ico-org" style="display:none;"></button>' +
			'		</div>' +
			'		<div class="after_select search-result-wrap" style="display:none;">' +
			'			<ul id="meet_res_user_list" class="search-result-list"></ul>' +
			'		</div>' +
			'	</div>' +
			'	<div class="btn_sec">' +
			'		<button type="button" class="m_confirm">' + gap.lang.OK + '</button>' +
			'	</div>' +
			'</div>';
		
		this.setLayer(el, html);
		
		// 정규직 사원은 조직도 표시
		if (gap.is_show_org(gap.userinfo.rinfo.ky)) {
			$('.ico-org').show();
		}
		
		var $layer = $('#meeting_attendee');
		
		var info = $el.data('info');
		if (info) {
			$.each(info, function(){
				_self.addAttendee(this);
			});
		}
		
		// 이벤트 처리
		$layer.find('.m_close_btn').on('click', function(){		
			var $parent = $('.step.n3');
			$parent.removeClass('popup');
			if (!$parent.hasClass('end')) $parent.removeClass('on');
			$layer.remove();
			_self.hideMeetBlock();
			return false;
		});
		
		// 사용자 입력
		$('#txt_attendee').on('keydown', function(e){
			if (e.keyCode == 13) {
				_orgSearch();
			}
		});
		
		// 검색 클릭
		$layer.find('.ico-org-search').on('click', function(){
			_orgSearch();
		});
		
		// 조직도 선택
		$layer.find('.ico-org').on('click', function(){
			gBodyM.org_open(true, 'gMetM', 'addAttendeeOrg');
		});
		
		
		// 확인
		$layer.find('.m_confirm').on('click', function(){
			if ($('#meet_res_user_list li').length == 0) {
				mobiscroll.toast({message:gap.lang.mt_alert_7, color:'danger'});
				return false;
			}
			
			_self.selectAttendee();
			$layer.find('.m_close_btn').click();
			if (!$('.step.n4').hasClass('end')) {
				$('.step.n4').click();
			}
			_self.finishCheck();
			return false;
		});
	},
	
	"addAttendee" : function(user_info){
		var $list = $('#meet_res_user_list');
		var ck = $list.find('li[data-key="' + user_info.ky + '"]');
		if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
		
		if (user_info.ky == gap.userinfo.rinfo.ky) {
			mobiscroll.toast({message:gap.lang.mt_alert_2, color:'danger'});
			return;
		}
		
		if (user_info.ky.indexOf('@') != -1){
			var disp_txt = user_info.ky;
		} else {
			var disp_txt = user_info.nm + ' / ' + user_info.dp;			
		}
		
		var html =
			'<li class="f_between" data-key="' + user_info.ky + '">' +
			'	<span class="txt ko">' + disp_txt + '</span>' +
			'	<button class="file_remove_btn"></button>' +
			'</li>';
		
		var $li = $(html);
		
		$li.data('info', user_info);
		$li.find('.file_remove_btn').on('click', function(){
			$(this).closest('li').remove();
			
			if ($list.find('li').length == 0) {
				$('.after_select').hide();
			}
		});
		
		$list.append($li);
		$('.after_select').show();
		
	},
	
	"addAttendeeOrg" : function(list){
		var _self = this;
		$.each(list, function(){
			if (typeof(this) == 'object') {
				var user_info = this;
			} else {
				var user_info = JSON.parse(this);				
			}
			_self.addAttendee(user_info);
		});
	},
	
	"selectAttendee" : function(){
		var $el = $('.step.n3');
		var $list = $('#meet_res_user_list');
		
		if ($list.find('li').length == 0) {
			// 참여인원이 없는 경우
			$el.removeData('info');
			$el.removeClass('on end');
			$el.find('.desc').html($el.find('.desc').data('txt'));
		} else {
			var user_list = [];
			var names = [];
			var cnt = 0;
			$list.find('li').each(function(){
				cnt++;
				var _info = $(this).data('info');
				user_list.push(_info);
				
				if (_info.ky.indexOf('@') != -1) {
					// 외부 사용자인 경우
					names.push(_info.ky);
				} else {
					names.push(_info.nm);
				}
			});
			
			var html = cnt + gap.lang.mt_person + '<br><span>' + names.join(', ') + '</span>';
			$el.addClass('on end');
			$el.data('info', user_list);
			$el.find('.desc').html(html);
			
		}
	},
	
	"showTitleLayer" : function(el){
		var _self = this;
		var $el = $(el);
		var html =
			'<div id="meeting_title" class="mo_popup hide">' +
			'	<div class="pop_tit">' +
			'		<h1>4.' + gap.lang.mt_title + '</h1>' +
			'		<button type="button" class="m_close_btn"></button>' +
			'	</div>' +
			'	<div class="search_sec m_w_tit">' +
			'		<input type="text" id="meet_res_title" placeholder="' + gap.lang.mt_ly_title_ph + '">' +
			'	</div>' +
			'	<div class="m_w">' +
			'		<textarea id="meet_res_body" placeholder="' + gap.lang.mt_ly_body_ph + '"></textarea>' +
			'	</div>' +
			'	<div class="btn_sec">' +
			'		<button type="button" class="m_confirm">' + gap.lang.OK + '</button>' +
			'	</div>' +
			'</div>';
		
		this.setLayer(el, html);
		
		var $layer = $('#meeting_title');
		
		var info = $el.data('info');
		if (info) {
			$('#meet_res_title').val(info.title);
			$('#meet_res_body').val(info.body);
		}
		
		//$('#meet_res_title').focus();
		
		// 이벤트 처리
		$layer.find('.m_close_btn').on('click', function(){
			var $parent = $('.step.n4');
			$parent.removeClass('popup');
			if (!$parent.hasClass('end')) $parent.removeClass('on');
			$layer.remove();
			_self.hideMeetBlock();
			return false;
		});
		
		$layer.find('.m_confirm').on('click', function(){
			var _title = $.trim($('#meet_res_title').val());			
			var _body = $.trim($('#meet_res_body').val());
			
			$('#meet_res_title').val(_title);
			$('#meet_res_body').val(_body);
			
			// 제목은 필수 값으로 처리
			if (_title == '') {
				mobiscroll.toast({message:gap.lang.mt_alert_8, color:'danger'});
				return false;
			} 
			
			
			var obj = {
				title: _title,
				body: _body
			}
			$el.data('info', obj);
			
			var res_html = '<span>' + _title + '</span><br><span>' + _body + '</span>';
			$el.find('.desc').html(res_html);
			$el.addClass('on end');
			
			$layer.find('.m_close_btn').click();
			
			_self.finishCheck();
			
			return false;
		});
	},
	
	"createMeeting" : function(is_update){
		var _self = this;
		
		_self.showLoading();
		
		var _title = this.getResMeetingTitle();
		var _code = this.getResMeetingCode();		
		var _start = this.getResMeetingStart();
		var _end = this.getResMeetingEnd();
		var _user = this.getResMeetingUser();
		var _body = this.getResMeetingBody();
		
		var is_today = moment(_start).format('YYYYMMDD') == moment().format('YYYYMMDD'); 
		
		var res_meet_type = this.getResMeetingType();
		if (res_meet_type == '2') {
			var req_nm = '';
			if (is_update) {
				req_nm = 'update.open'; 
			} else {
				req_nm = 'reserve.open';
			}
			
			// 회의실 예약
			var req_data = {
				title: _title,
				roomCode: _code,
				//date: moment(_start).format('YYYYMMDD'),
				//startTime: moment(_start).format('HHmm'),
				//endTime: moment(_end).format('HHmm'),
				startGmt: moment(_start).utc().format('YYYY-MM-DD[T]HH:mm:00[Z]'),
				endGmt: moment(_end).utc().format('YYYY-MM-DD[T]HH:mm:00[Z]'),
				timezone: moment().format('Z'),
				secretAt: 'N',
				emailAt: 'Y',
				attendeeId: _user.join(','),
				referId: '',
				contents: _body
			};
			
			if (is_update) {
				req_data.reserveId = this.edit_scheduleid;
			}
			
			this.meetingAPI(req_nm, req_data).then(function(data){
				if (data.code == '1') {
					mobiscroll.toast({message:gap.lang.mt_alert_9, color:'info'});
					_self.createMeetingComplete(is_today, is_update);
				} else {
					$('#btn_meet_create').removeClass('processing');
					mobiscroll.toast({message:gap.lang.message, color:'danger'});
					console.log(data);
				}
				_self.hideLoading();
			}, function failFucn(){
				$('#btn_meet_create').removeClass('processing');
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				_self.hideLoading();
			});
			
		} else {
			var users = [];
			
			$.each(_user, function(){
				users.push({id:this+''});
			});
			// 화상회의 예약
			var req_data = {
				type: (is_update ? 'U' : 'C'),
				scheduletype: (res_meet_type == '1' ? '1' : '0'),
				scheduleid: (is_update ? this.edit_scheduleid : ''), 
				title: _title,
				starttime: moment(_start).utc().format('YYYY-MM-DD[T]HH:mm:00[Z]'),
				endtime: moment(_end).utc().format('YYYY-MM-DD[T]HH:mm:00[Z]'),
				recordingyn: 'N',
				timezone: moment().format('Z'),
				partylist : users,
				dswid: '',
				contents: _body
			};
			
			if (res_meet_type == '1') {
				req_data.endpointlist = [{endpointkey:_code}];
			}
			
			this.onlineAPI("scheduleinterface.do", req_data).then(function(data){
				if (data.code == '00') {
					mobiscroll.toast({message:gap.lang.mt_alert_9, color:'info'});
					_self.createMeetingComplete(is_today, is_update);
				} else {
					$('#btn_meet_create').removeClass('processing');
					mobiscroll.toast({message:gap.lang.message, color:'danger'});
					console.log(data);
				}
				_self.hideLoading();
			}, function failFucn(){
				$('#btn_meet_create').removeClass('processing');
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				_self.hideLoading();
			});
			
		}
	},
	
	"createMeetingComplete" : function(is_today, is_update){
		// 모바일에서는 완료되면 창 닫고 리프레쉬
		gBodyM.go_home_refresh();
		return;
		
		var $today = $('#btn_meeting_today');
		
		if ($today.hasClass('on')) {
			// 오늘회의를 보고 있는 경우
			if (is_today) {
				this.getAllMeetingList(true);
			} else {
				this.getAllMeetingList(false, true);
			}
		} else {
			// 예정된 회의를 보고 있는 경우
			if (is_today) {
				this.getAllMeetingList(true, true);
			} else {
				this.getAllMeetingList(false);
			}
		}
		
		this.initHeader();
		
		if (is_update) {
			$('#meeting_body').show();
		}
	},
	
	"meetingCancel" : function(schedule_id){
		var _self = this;
		var req_nm = "cancel.open";
		var req = {
			reserveId: schedule_id
		};
		
		return this.meetingAPI(req_nm, req).then(function(data){
			if (data.code == '1') {
				mobiscroll.toast({message:gap.lang.mt_alert_10, color:'info'});
				_self.cancel_done = true;
			} else {
				mobiscroll.toast({message:data.message, color:'danger'});
			}
		});
	},
	
	// 화상회의 지점정보 가져오기
	"getOnlinePlaceList" : function(){
		
		var dt = moment();
		
		var req_nm = "getAvailableEndpointList.do";
		var s_date_str = $('#meet_res_date').val() + 'T' + moment($('#meet_res_stime').mobiscroll('getVal')).format('HH:mm');
		var e_date_str = $('#meet_res_date').val() + 'T' + moment($('#meet_res_etime').mobiscroll('getVal')).format('HH:mm');
		
		var s_date = moment(s_date_str).utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]');
		var e_date = moment(e_date_str).utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]');
		
		var place_code = $('#meet_res_place').val();
		var floor_code = $('#meet_res_floor').val();
		
		var req = {
			starttime: s_date,
			endtime: e_date,
			compcd: $('#meet_res_company').val(),
			placecd: place_code == 'all' ? '' : place_code,
			floorcd: floor_code == 'all' ? '' : floor_code
		};
		
		return this.onlineAPI(req_nm, req).then(function(data){			
			if (data.code != '00') {
				console.log('화상회의 API 호출 오류 : ' + req_nm, data);
				return;
			}
			
			var list = [];
			$.each(data.endpointlist, function(){
				list.push({
					key: this.endpointkey,
					name: this.placenm + ' ' + this.floornm + ' ' + this.endpointnm,
					number: this.number || '0',
					company: this.compcd,
					place: this.placecd,
					floor: this.floorcd,
					resdata: this.resdata,
					video: true
				});
			});
			return list;
		});
	},

	// 화상회의 상세 정보 가져오기
	"getOnlineDetail" : function(scheduleid){
		var _self = this;
		var req_nm = "getMeetingDetailList.do";
		var req = {
			scheduleid: scheduleid
		};
		
		return this.onlineAPI(req_nm, req).then(function(data){
			if (data.code == '00'){
				var info = data.meetinglist[0];
				
				var res = {
					scheduleid: info.scheduleid,
					type: info.scheduletype == '0' || info.scheduletype == '3' ? '3' : '1',
					newevent: {
						scheduleid: info.scheduleid,
						allDay: false,
						color: _self.avail_color,
						start: moment(info.starttime).toDate(),
						end: moment(info.endtime).toDate(),
						temp: true,
						title: gap.lang.mt_new_meeting
					},
					title: info.title,
					body: info.contents,
					meetingurl: info.meetingurl,
					hostkey: info.hostkey,
					meetingkey: info.meetingkey,
					partylist: []
				}
				
				// 장비 정보가 있으면 설정
				if (info.endpointlist && info.endpointlist[0]) {
					var ep = info.endpointlist[0];
					res.endpoint = {
						id: ep.endpointkey,
						name: ep.compnm + ' ' + ep.placenm + ' ' + ep.floornm + ' ' + ep.endpointnm,
						company: ep.compcd,
						place: ep.placecd,
						floor: ep.floorcd,
						start: moment(info.starttime),
						end: moment(info.endtime)
					};
					res.newevent.resource = ep.endpointkey; 
				}
				
				// 인원관련 설정
				if (info.partylist) {
					var kys = [];
					var out_user = [];
					$.each(info.partylist, function(){
						if (this.id.indexOf('@') != -1) {
							// 외부 사용자
							out_user.push({ky:this.id});
						} else {
							kys.push(this.id);							
						}
					});
					
					if (kys.length > 0) {
						// Box에서 사용하는 검색 기능으로 검색 처리
						var surl = gap.channelserver + "/search_user_empno.km";
						var postData = {"empno" : kys.join(",")};
						$.ajax({
							type : "POST",
							async: false,
							url : surl,
							dataType : "json",
							data : JSON.stringify(postData),
							success: function(data){
								res.partylist = data[0];
							}
						});	
					}
					
					if (out_user.length > 0) {
						res.partylist = res.partylist.concat(out_user); 
					}
					
					res.owner_id = info.schedulerid;
					res.owner_nm = info.schedulernm;
					res.owner_dept = info.schedulerdept;
				}
				
				return res;
			} else {
				return {error: true};
			}
		});
	},
	
	// 화상회의 목록 가져오기
	"getOnlineList" : function(is_today){
		// 화상회의 요청
		var req_nm = "getMeetingList.do";
		var req = {
			cntperpage: 1000,
			pageno: 1,
			scheduletype: ""
		};
		
		if (is_today) {
			// 오늘
			req.starttime = moment().startOf('day').utc().format();
			req.endtime = moment(req.starttime).add(1, 'day').utc().format();
		} else {
			// 예정
			req.starttime = moment().add(1,'day').startOf('day').utc().format();
			req.endtime = moment(req.starttime).add(1,'year').utc().format();
		}
		
		return this.onlineAPI(req_nm, req).then(function(data){
			// 데이터를 가공해야 함
			if (data.code != '00') {
				console.log('화상회의 API 호출 오류 : ' + req_nm, data);
				return [];
			}
			
			var list = [];
			$.each(data.meetinglist, function(){
				var pt_ky = [];
				
				// 회의실은 대표로 1개만 표시한다
				var ep = '';
				if (this.endpointlist.length > 0) {
					ep = this.endpointlist[0];
				}
				
				$.each(this.partylist, function(){
					pt_ky.push(this.id);
				});
				
				// 장소표시
				var p_arr = [], place = '';
				if (ep.compnm) p_arr.push(ep.compnm);
				if (ep.placenm) p_arr.push(ep.placenm);
				if (ep.floornm) p_arr.push(ep.floornm);
				if (ep.endpointnm) p_arr.push(ep.endpointnm);
				place = p_arr.join(' ');
				
				list.push({
					scheduleid	: this.scheduleid, 
					type		: this.scheduletype == '0' || this.scheduletype == '3' ? '3' : '1',
					realtime	: this.scheduletype == '3' ? true : false,	// 즉석회의 여부
					title		: this.title,
					contents	: this.contents,
					owner_id	: this.schedulerid,
					owner_nm	: this.schedulernm,
					owner_dept	: this.schedulerdept,
					starttime	: this.starttime,
					endtime		: this.endtime,
					endpoint_nm	: place,
					endpoint_key: ep.endpointkey || '',
					floor_nm	: ep.floornm || '',
					endpoint_length: this.endpointlist.length,
					partylist	: pt_ky,
					online_url	: this.meetingurl
				});
			});
			return list;
		}, function(){
			return [];
		});
	},
	
	// 화상회의 취소
	"onlineCancel" : function(schedule_id){
		var _self = this;
		var req_nm = "scheduleinterface.do";
		var req = {
			type: "D",
			scheduleid: schedule_id
		};
		
		return this.onlineAPI(req_nm, req).then(function(data){
			if (data.code == '00') {
				mobiscroll.toast({message:gap.lang.mt_alert_11, color:'info'});
				_self.cancel_done = true;
			} else {
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'info'});
				console.log('화상회의 API 호출 오류 : ' + req_nm, data);
			}
		});
	},
	
	
	// 화상회의 API
	"onlineAPI" : function(req_name, req){
		
		/**
		 * 1) 위치정보 : getSubDept.do
		 * deptcd
		 *
		 * 
		 * 2) 가용단말목록 : getEndpointList.do
		 * starttime
		 * endtine
		 * deptcd
		 * 
		 * 
		 * 3) 회의목록 : getMeetingList.do
		 * starttime
		 * endtime
		 * cntperpage
		 * pageno
		 * schedulerid
		 * 
		 * 
		 * 4) 회의예약 : scheduleinterface.do
		 * type 		: C/U/D
		 * scheduletype : 0(온라인회의)/1(화상회의)
		 * title 		: 
		 * starttime 	: 2022-07-12T01:00:00Z (회의 시작일시 GMT)
		 * endtime 		: 2022-07-12T02:00:00Z (회의 종료일시 GMT)
		 * scheduleid 	: C일때는 빈 값, U,D일 때는 scheduleid
		 * schedulerid 	: 10im0966(요청자 사번)
		 * recordingyn 	: Y/N (녹화여부)
		 * timezone 	: +09:00 (요청자의 로컬타임)
		 * partylist 	: [{id:""}] (참석자 정보)
		 * endpointlist : [{endpointkey:""}] (회상장비 key)
		 */
		
		return $.ajax({
			type: 'POST',
			headers: {
	        	'auth': gap.get_auth() 
	    	},
			url: '/vemanager/' + req_name,
			data: JSON.stringify(req),
			contentType: 'application/json',
			dataType: 'json',
			success: function(res){
				
			},
			error: function(err){
				console.log(err);
			}
		});
	},
	
	
	// 빈 회의실 찾기
	"getMeetingPlaceList" : function(){
		
		function _addReserveData(ori, data){
			$.each(ori, function(){
				if (this.key == data.roomCode) {
					this.resdata.push({
						scheduleid: data.reserveId,
						//starttime: moment(data.date + 'T' + data.startTime).format(),
						//endtime: moment(data.date + 'T' + data.endTime).format(),
						starttime: moment(data.startGmt).format(),
						endtime: moment(data.endGmt).format(),
						title: data.title,
						resource: data.roomCode
					});
					return false;
				}
			});
		}
		
		function _roleCheck(data){
			var has_role = false;	// 회의실에 권한이 설정되었는지 여부
			var user_role = true;	// 접속한 사용자에게 회의실 권한이 있는지 체크
			
			// 회의실에 권한부여되어 있는지 체크
			if (data.roleDept || data.roleUser) {
				has_role = true;
				user_role = false;
			}
			
			if (has_role){
				// 부서 권한 체크
				var fulldeptcode = '^' + window.companycode + '^' + window.fulldeptcode + '^';
				if (data.roleDept) {
					var check_dept = data.roleDept.split(',');
					$.each(check_dept, function(idx, val){
						if (fulldeptcode.indexOf('^' + val + '^') != -1) {
							user_role = true;
						}
					});
				}
				
				// 사용자 권한 체크
				if (data.roleUser) {
					var check_user = data.roleUser.split(',');
					$.each(check_user, function(idx, val){
						if (gap.userinfo.rinfo.ky.indexOf(val) != -1) {
							user_role = true;
						}
					});
				}
			}
			
			return user_role;
		}
		
		var _self = this;
		var place_code = $('#meet_res_place').val();
		var floor_code = $('#meet_res_floor').val();
	
		var s_date_str = $('#meet_res_date').val() + 'T' + moment($('#meet_res_stime').mobiscroll('getVal')).format('HH:mm');
		var e_date_str = $('#meet_res_date').val() + 'T' + moment($('#meet_res_etime').mobiscroll('getVal')).format('HH:mm');
		
		var req = {
			//date: moment(dt).format('YYYYMMDD'),
			//gmtDate: moment(moment(dt).format('YYYY-MM-DDT00:00:00Z')).utc().format(),
			startGmt: moment(s_date_str).utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
			endGmt: moment(e_date_str).utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
			placeCode: $('#meet_res_company').val(),
			floorCode: place_code == 'all' ? '' : place_code,
			subCode: floor_code == 'all' ? '' : floor_code
		};
		
		var $def = $.Deferred();
		this.meetingAPI("time_search.open", req).then(function(data){
			// 1.전체 회의실 목록 가져오기
			var resources = [];
			$.each(data.result, function(){
				var role_check = _roleCheck(this);
				if (role_check) {
					resources.push({
						key: this.roomCode,
						name: this.floor + ' ' + this.sub + ' ' + this.room,
						number: this.number || '0',
						company: gap.userinfo.rinfo.cpc, 
						place: this.floorCode,
						floor: this.subCode,
						video: this.vedioAt == 'Y' ? true : false,
						resdata: []
					});
				}
			});
			
			$def.resolve(resources);
		});
		
		return $def; 				
	},
	
	// 회의실 상세 정보
	"getMeetingDetail" : function(scheduleid){
		var _self = this;
		var req_nm = "reserve_detail.open";
		var req = {
			reserveId: scheduleid
		};
		
		return this.meetingAPI(req_nm, req).then(function(data){
			if (data.code == '1'){
				var info = data.result;
				var res = {
					scheduleid: info.reserveId,
					type: '2',
					newevent: {
						scheduleid: info.reserveId,
						allDay: false,
						color: _self.avail_color,
						start: moment(info.startGmt).toDate(),
						end: moment(info.endGmt).toDate(),
						temp: true,
						title: gap.lang.mt_new_meeting
					},
					title: info.title,
					body: info.contents.replace(/<br>/g, '\n')
				}
				
				// 장비 정보가 있으면 설정
				
				res.endpoint = {
					id: info.roomCode,
					name: info.place + ' ' + info.floor + ' ' + info.sub + ' ' + info.room,
					company: info.placeCode,
					place: info.floorCode,
					floor: info.subCode,
					start: moment(info.startGmt),
					end: moment(info.endGmt)
				};
				res.newevent.resource = info.roomCode; 
				
				
				// 인원관련 설정
				if (info.attendeeId) {
					// Box에서 사용하는 검색 기능으로 검색 처리
					var surl = gap.channelserver + "/search_user_empno.km";
					var postData = {"empno" : info.attendeeId};
					$.ajax({
						type : "POST",
						async: false,
						url : surl,
						dataType : "json",
						data : JSON.stringify(postData),
						success: function(data){
							res.partylist = data[0];
						}
					});	
				}
				
				// 외부사용자
				if (info.extrlpsn) {
					var out_user = info.extrlpsn.split(','); 
					$.each(out_user, function(){
						res.partylist.push({ky:this});
					});
				}
				
				res.owner_id = info.writerId;
				res.owner_nm = info.writer;
				res.owner_dept = info.dept;
				
				return res;
			} else {
				return {error:true};
			}
		});
	},
	
	// 회의실 목록 가져오기
	"getMeetingList" : function(is_today){
		var req = {
			firstNo: 1,
			lastNo: 1000,
			resveTy: 'D'
		};
		var req_nm = "my_reserve_list.open";

		/*
		// 회의
		if (is_today) {
			// 오늘
			req.startDate = moment().startOf('day').format('YYYYMMDD');
			req.endDate = req.startDate;
		} else {
			// 예정
			req.startDate = moment().add(1,'day').format('YYYYMMDD');
			req.endDate = moment().add(1,'year').format('YYYYMMDD');
		}
		*/
			
		// GMT 시간으로 요청
		if (is_today) {
			// 오늘
			req.startGmt = moment().startOf('day').utc().format();
			req.endGmt = moment(req.startGmt).add(1, 'day').utc().format();
		} else {
			// 예정
			req.startGmt = moment().add(1,'day').startOf('day').utc().format();
			req.endGmt = moment(req.startGmt).add(1,'year').utc().format();
		}
		
		return this.meetingAPI(req_nm, req).then(function(data){
			// 데이터를 가공해야 함
			if (data.code != '1') {
				console.log('회의실예약 API 호출 오류 : ' + req_nm, data);
				return [];
			}
			
			var list = [];
			$.each(data.result, function(){
				var pt_ky = [];
				
				// 내부 참석자
				if (this.attendeeId) {
					pt_ky = this.attendeeId.split(',');
				}
				
				// 외부 참석자
				if (this.extrlpsn) {
					pt_ky = pt_ky.concat(this.extrlpsn.split(','));
				}
				
				// 장소 표시
				var p_arr = [], place = '';
				if (this.place) p_arr.push(this.place);
				if (this.floor) p_arr.push(this.floor);
				if (this.sub) p_arr.push(this.sub);
				if (this.room) p_arr.push(this.room);
				place = p_arr.join(' ');

				
				list.push({
					scheduleid	: this.reserveId, 
					type		: '2',	// 1: 회의+화상, 2:회의, 3:온라인화상
					title		: this.title,
					contents	: this.mtgCn,
					owner_id	: this.writerId,
					owner_nm	: this.writer,
					owner_dept	: this.dept,
					starttime	: this.startGmt,
					endtime		: this.endGmt,
					//endpoint_nm	: this.room,
					endpoint_nm	: place,
					endpoint_key: this.roomCode,
					floor_nm	: this.sub,
					endpoint_length : 1,	// 회의실 예약은 무조건 1개
					partylist	: pt_ky
				});
			});
			return list;
		}, function(data){
			console.log('회의실예약 API 호출 오류 : ' + req_nm, data);
			return [];
		});
	},
	
	// 회의실예약 API
	"meetingAPI" : function(req_name, req){
		var url = '/rezmanager/openapi/meeting/' + req_name;
		var token = gap.get_auth();
		
		var method = '';
		if (req_name == 'reserve.open'){
			method = 'POST';
		} else if (req_name == 'update.open'){
			method = 'POST';
		} else if (req_name == 'cancel.open'){
			method = 'POST';
		} else {
			method = 'GET';
		}
		
		// 호의실 예약, 업데이트는 Body 데이터로 전송하고 나머지 요청들은 GET파라메터로 연동
		var req_data = {};
		if (req_name == 'reserve.open' || req_name == 'update.open') {
			req_data = JSON.stringify(req);
		} else {
			url += '?' + $.param(req);
		}
		
		
		var ajax_opt = {
			headers: {
	        	'Authorization': 'Bearer ' + token 
	    	},
			type: method,
			url: url,
			dataType: 'json',
			success: function(res){
				
			},
			error: function(err){
				console.log(err);
			}
		};
		
		if (method == 'POST' || method == 'PUT'){
			ajax_opt.data = req_data;
			ajax_opt.contentType = 'application/json';
		}
		
		return $.ajax(ajax_opt);
	},
	
	"showConfirm" : function(opt){
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
		 * 	}
		 * }
		 */
		var html =
			'<div id="meeting_pop_up" class="layer_wrap" style="height:auto;">' + 
			'	<div class="layer_inner">' + 
			'		<div class="pop_btn_close"></div>' + 
			'		<h4>' + (opt.title || '') +'</h4>' + 
			'		<div class="layer_cont left">' +
			/*
			'		<div class="pop_icon">' + 
			'			<div></div>' + 
			'		</div>' +
			*/
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
		
		var $layer = $('<div id="layerDimHard"></div>');
		$layer.append(html);
		
		// 닫기 
		$layer.find('.pop_btn_close').on('click', function(){
			$(document).off('keydown.confirmesc');
			$layer.remove();
		});
		
		// 취소
		$layer.find('.cancel').on('click', function(){
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
					$layer.find('.pop_btn_close').click();
				}
			})
		}
		
		$('#container').append($layer);
	},
	
	"showLoading" : function(){
		this.hideLoading();
		this.show_loading = setTimeout(function(){
			// 모바일 로딩바 호출
			gBodyM.mobile_start();
		}, 200);
	},
	
	"hideLoading" : function(){
		clearTimeout(this.show_loading);
		gBodyM.mobile_finish();
	},
		
	"showMeetingDetail" : function(args){
		// 회의 예약된 내역 클릭시 미리보기
		var event = args.event;
		if (event.temp) return;
		
		var _self = this;
		
		var detail_def = $.Deferred();
		
		// 상세 정보를 불러와서 뿌려줘보자
		if (this.getResMeetingType() == '2') {
			// 대면회의
			detail_def = this.getMeetingDetail(event.scheduleid);
		} else {
			// 화상회의,  온라인 미팅
			detail_def = this.getOnlineDetail(event.scheduleid);
		}
		
		detail_def.then(function(data){
			if (data.error) {
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				return;
			}
			
			var $target = $(args.domEvent.target);
			if (!$target.hasClass('mbsc-schedule-event')) {
				$target = $target.closest('.mbsc-schedule-event');
			}
			
			var _title = $('<div></div>').text(data.title).html();
			var _owner = data.owner_nm + ' / ' + data.owner_dept;
			var _date = moment(data.newevent.start).format('M.D(ddd) HH:mm') + ' ~ ' + moment(data.newevent.end).format('HH:mm');
			var _body = $('<div></div>').text(data.body).html();
			
			
			var html =
				'<div class="layer_inner">' +
				'	<button class="ico btn_close"></button>' +
	            '	<h4>' + _title + '</h4>' +
	            '	<div class="layer_cont left">' +
	            '		<div class="info-bx">' +
	            '			<span class="tit">' + gap.lang.mt_th_owner + '</span>' +
	            '			<span class="cont owner" data-id="' + data.owner_id + '">' + _owner + '</span>' +
	            '		</div' +
	            '		<div class="info-bx">' +
	            '			<span class="tit">' + gap.lang.mt_th_time + '</span>' +
	            '			<span class="cont">' + _date + '</span>' +
	            '		</div>' +
	            '	</div>' +
	            '	<div class="mini-scroll">' +
	            '	</div>' +
	            '</div>';
			
			$target.qtip({
				style: {
					classes: 'meeting-qtip meeting_info',
					tip: {
						corner: false
					}
				},
				content : {
					text : html
				},
				show : {
					event: 'click',
					ready: true
				},
				hide : {
					event : 'unfocus',
					fixed: true
				},
	            position: {
					viewport: $('#container'),
	                my: 'left center',
	                at: 'right center',
	                adjust: {
						y: 0
					}
	            },
	            events: {
	            	render: function(e, api){
	            		$(api.elements.tooltip).find('.btn_close').on('click', function(){
	            			$(api.elements.tooltip).qtip('destroy');
	            		});
	            		$(api.elements.tooltip).find('.owner').on('click', function(){
	            			var user_id = $(this).data('id');
	            			gOrg.showUserDetailLayer(user_id);
	            		});
	            	},
	            	show: function(e, api){

	            	},
	            	hide: function(e, api){
	            		$(api.elements.tooltip).qtip('destroy');
	            	}
	            }
			});
			
		}, function(){
			mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
		});
	},
	
	"showMeetingContents" : function(el){
		var $target = $(el);
		var html =
			'<div class="help_modal">' +
			'	<div class="rel">' +
			'		<button class="ico btn_close"></button>' +
            '		<h2>' + gap.lang.mt_ly_body + '</h2>' +
            '		<div class="mini-scroll">' +
            $target.closest('tr').data('info').contents.replace(/\n/g,'<br>') +
            '		</div>' +
            '	</div>' +
            '</div>';
		
		$target.qtip({
			style: {
				classes: 'meeting-qtip',
				tip: {
					corner: false
				}
			},
			content : {
				text : html
			},
			show : {
				event: 'click',
				ready: true
			},
			hide : {
				event : 'unfocus',
				fixed: true
			},
            position: {
				viewport: $('#container'),
                my: 'left center',
                at: 'right center',
                adjust: {
					y: 0
				}
            },
            events: {
            	render: function(e, api){
            		$(api.elements.tooltip).find('.btn_close').on('click', function(){
            			$(api.elements.tooltip).qtip('destroy');
            		});
            	},
            	show: function(e, api){

            	},
            	hide: function(e, api){
            		$(api.elements.tooltip).qtip('destroy');
            	}
            }
		});		
	},
	
	"showMeetingPartylist" : function(el){
		
		function _drawLayer(disp_list){
			var user_list = '';
			$.each(disp_list, function(idx, val){
				user_list += this;
			});
			
			var html =
				'<div class="help_modal">' +
				'	<div class="rel">' +
				'		<button class="ico btn_close"></button>' +
	            '		<h2>' + gap.lang.mt_th_att + '</h2>' +
	            '		<div class="mini-scroll">' + user_list + '</div>' +
	            '	</div>' +
	            '</div>';
			
			$target.qtip({
				style: {
					classes: 'meeting-qtip user-list',
					tip: {
						corner: false
					}
				},
				content : {
					text : html
				},
				show : {
					event: 'click',
					ready: true
				},
				hide : {
					event : 'unfocus',
					fixed: true
				},
	            position: {
					viewport: $('#container'),
	                my: 'left center',
	                at: 'right center',
	                adjust: {
						y: 0
					}
	            },
	            events: {
	            	render: function(e, api){
	            		$(api.elements.tooltip).find('.btn_close').on('click', function(){
	            			$(api.elements.tooltip).qtip('destroy');
	            		});
	            		
	            		$(api.elements.tooltip).find('.user-name').on('click', function(){
	            			gOrg.showUserDetailLayer($(this).data('key'));
	            		});
	            	},
	            	show: function(e, api){

	            	},
	            	hide: function(e, api){
	            		$(api.elements.tooltip).qtip('destroy');
	            	}
	            }
			});
		}
		
		var $target = $(el);
		var info = $target.closest('tr').data('info');
		var list = info.partylist;
		var cont = '';
		var in_list = [];
		var out_list = [];
		
		// 주최자
		in_list.push(info.owner_id);
		
		// 참석자
		$.each(list, function(){
			if ( this.indexOf('@') != -1 ) {
				// 외부 사용자
				out_list.push('<span>' + this + '</span>');
			} else {
				// 내부 사용자
				in_list.push(this);
			}
		});
		
		
		if (in_list.length > 0) {
			//사용자 설정
			var surl = gap.channelserver + "/search_user_empno.km";
			var postData = {"empno" : in_list.join(",")};
			
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : JSON.stringify(postData),
				success: function(data){
					var tmp = data[0];
					var disp = [];
					
					$.each(tmp, function(){
						var disp_text = '';
						if (this.nm) {
							disp_text = '<b>' + this.nm + (this.du ? ' ' + this.du : '') + '</b>' + (this.dp ? ' ' + this.dp : '');
						} else {
							disp_text = '<b>' + this.ky + '</b>';
						}
						disp.push('<span class="user-name" data-key="' + this.ky + '">' + disp_text + '</span>');
					});
					
					if (out_list.length) {
						disp = disp.concat(out_list);
					}
					
					_drawLayer(disp);
				},
				error: function(){

				}
			});
		} else {
			// 내부 사용자가 없으면 외부 사용자만 뿌린다
			_drawLayer(out_list);
		}		
		
	},
	
	"openRoomDetailInfo" : function(roomkey){
		if (!roomkey) return;
		var lang = window.userlang == 'ko' ? 'ko' : 'en';
		var room_url = location.protocol + '//' + location.host +'/rezmanager/uss/mtg/selectMtgPlacePopup.do?trgetId=' + roomkey + '&lang=' + lang;
		
		var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(room_url);
		gBodyM.connectApp(url_link);
	},
	
	"onlineTimeCheck" : function(event){
		var meet_sdate = moment(event.start);
		var meet_edate = moment(event.end);
		var now_date = moment();
		
		if (now_date.diff(meet_edate) > 0) {
			// 종료시간 지난 경우
			return 'over';
		} else {
			if (now_date.diff(meet_sdate, 'm') < -15) {
				// 시작 15분전에 입장하는 경우
				return 'before';
			} else {
				// 입장 가능한 경우
				return 'ok';
			}
		}
	},
	
	"finishCheck" : function(){
		var _self = this;
		//var $btn_wrap = $('#btn_meet_create').parent();
		
		/*
		// 입력 값을 다 채우지 않은 경우 return 처리
		if ($('.step.on').length != 4) {
			return;
		}
		*/
		
		// 참여 인원은 설정하지 않아도 예약 잡히도록 예외처리
		if (!$('.step.n1').hasClass('end') || 
			!$('.step.n2').hasClass('end') ||
			!$('.step.n4').hasClass('end')) {
			return;
		}
		
		/*
		// 처음으로 4개 등록한 경우
		if (!$btn_wrap.hasClass('finish')) {
			$btn_wrap.addClass('finish');
			
			// 수정이 아닌 경우만 자동 컨펑창 표시
			if (!$btn_wrap.hasClass('save')) {
				this.saveConfirm();
			}
		}
		*/
		
		
		$('#btn_meet_create').removeClass('hide');		
	},
	
	"getCompanyList" : function() {
		var _self = this;
		var com_list = [];

		$.ajax( {
			url : '/app/org.nsf/byorgan_tree_all?readviewentries&restricttocategory=company&outputformat=json&count=9999',
			cache: false,
			async : false,
			success : function(res) {
				$.each(res.viewentry, function() {
					var c_name = _self.getValueByName(this, '_name');
					var c_code = _self.getValueByName(this, '_code');
					var sub = _self.getValueByName(this, '_subdept');
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
	
	"getValueByName" : function(dest, name){
		var res = '';
		if (dest.entrydata) {
			$.each(dest.entrydata, function(idx, val) {
				if (val['@name'] == name) {
					//복수값인 경우 첫번째 배열값만 가져오기
					if (val['datetimelist']) {
						res = val['datetimelist']['datetime'][0]['0'];
					} else if (val['textlist']) {
						res = val['textlist']['text'][0]['0'];
					} else if (val['numberlist']) {
						res = val['numberlist']['number'][0]['0'];
					} else {
						var _temp = val['datetime'] || val['number'] || val['text'] || {'0' : ''};
						res = _temp['0'];
					}
					return false;
				}
			});
		}
		return res;
	}
	
	
}