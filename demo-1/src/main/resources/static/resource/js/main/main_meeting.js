function gBodyMeeting() {
	this.show_loading = null;
	this.timeline = null;
	this.avail_color = '#0000ff';
	this.unavail_color = '#ff0000';
	this.edit_scheduleid = null;
	this.work_info = null;
}

gBodyMeeting.prototype = {
	"init": function(){
	
	},
	
	"reserveMeeting": function(meeting_type, user_list, ch_code, ch_name, call_func){
		var _self = this;
		
		

		if (Array.isArray(user_list)) {
			user_list = user_list.filter(function(val){
				return gap.userinfo.rinfo.ky != val;
			});
		}
		
		// work방에서 호출된 경우
		if (ch_code && ch_name) {
			this.work_info = {
				channel_code: ch_code,
				channel_name: ch_name
			}
		}
		
		if (gap.cur_window != 'meeting') {
			gap.showConfirm({
				title: gap.lang.mt_res,
				contents: gap.lang.mt_res_msg,
				callback: function(){
					gap.cur_window = 'meeting';
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
					
					gTop.hideWorkStart();
					gma.refreshPos();
				}
			});
		} else {
			_self.showMainMeeting();
			_self.setDataInfo(meeting_type, user_list);
			
			if (typeof(call_func) == 'function') {
				call_func();
			}
			
			// 기본으로 2번째 장소선택 레이어를 띄워준다
			$('.step.n2').click();
			
			gTop.hideWorkStart();
		}
		
	},
	
	"editMeeting" : function(info){
		// 메인에서 회의 수정을 위해 호출된 경우
		var id = 'meeting';
		var url = location.pathname + "?readform&" + id;
		if (history.state != id){
			history.pushState(id, null, url);
		}else{
			history.replaceState(id, null, url);
		}
		
		this.showMainMeeting(true);
		this.initEditHeader(info);
	},
	
	"showMainMeeting": function(is_edit){
		
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
		
		if (!is_edit) {
			this.initHeader();
			this.initBody();
		} 
	},
	
	"initHeader" : function(is_edit){
		this.edit_shceduleid = null;
		
		var html = '';
		// 헤더 영역
		if (is_edit) {
			html +=
			'<div class="before_box">' +
			'	<a href="#" class="before_btn fw800"><span class="before_btn_icon"></span>' + gap.lang.back + '</a>' +
			'</div>';
		}
		html += 
			'<section class="section sec01">'+
			'	<h2>' + (is_edit ? gap.lang.mt_mod : gap.lang.mt_new_create) + '</h2>'+
			'	<div class="f_between">'+
			'		<div class="step_wr f_between">'+
			'			<div class="step n1">'+
			'				<div><span class="sub">' + gap.lang.mt_type + '</span></div>'+
			'				<p class="cont" data-txt="' + gap.lang.mt_type_msg + '"></p>'+
			'			</div>'+
			'			<div class="step n2">'+
			'				<div><span class="sub">' + gap.lang.mt_place + '</span></div>'+
			'				<p class="cont" data-txt="' + gap.lang.mt_place_msg + '"></p>'+
			'			</div>'+
			'			<div class="step n3">'+
			'				<div><span class="sub">' + gap.lang.mt_att + '</span></div>'+
			'				<p class="cont" data-txt="' + gap.lang.mt_att_msg + '"></p>'+
			'			</div>'+
			'			<div class="step n4">'+
			'				<div><span class="sub">' + gap.lang.mt_title + '</span></div>'+
			'				<p class="cont" data-txt="' + gap.lang.mt_title_msg + '"></p>'+
			'			</div>'+
			'		</div>'+

			'		<div class="btn_wr' + (is_edit ? ' save act' : '') + '">'+
			'			<button id="btn_meet_create" class="complete_btn"><span>' + (is_edit ? gap.lang.basic_save : gap.lang.mt_create) + '</span></button>'+
			'		</div>'+
			'	</div>';
		
		if (!is_edit) {
			html +=
			'	<div class="sub_info_wr inb">'+
			'		<p class="info_txt">' + gap.lang.mt_go_msg + '</p>'+
			'		<button id="btn_go_meeting" class="n1">' + gap.lang.mt_go_meeting + '</button>'+
			'		<button id="btn_go_online" class="n2">' + gap.lang.mt_go_online + '</button>'+
			'	</div>';
		}
			
		html += '</section>';
		
		
		$('#meeting_head').html(html);
		$('#meeting_head .cont').each(function(){
			$(this).html($(this).data('txt'));
		});
		
		this.writeEventBind();
	},
	
	"writeEventBind" : function(){
		var _self = this;
		
		// 이전
		$('#meeting_head .before_btn').on('click', function(){
			_self.initHeader();
			$('#meeting_body').show();
			if ($('#meeting_body').html() == '') {
				_self.initBody();
			}
			_self.edit_scheduleid = '';
		});
		
		// 1단계 유형
		$('.step.n1').on('click', function(){
			if ( $(this).hasClass('popup') ) return;
			var $btn_wrap = $('#btn_meet_create').parent();
			var is_save = $btn_wrap.hasClass('save');
			
			if (is_save) {
				mobiscroll.toast({message:gap.lang.mt_alert_12, color:'danger'});
				return false;
			}
			
			_self.showTypeLayer(this);
		});
		
		// 2단계 장소,일시
		$('.step.n2').on('click', function(){
			if ( $(this).hasClass('popup') ) return;
			var res_meet_type = _self.getResMeetingType();
			if (res_meet_type == '') {
				mobiscroll.toast({message:gap.lang.mt_invalid_1, color:'danger'});
				return false;
			}
			_self.showPlaceLayer(this);
		});
		
		// 3단계 참여 인원
		$('.step.n3').on('click', function(){
			if ( $(this).hasClass('popup') ) return;
			_self.showAttendeeLayer(this);
		});
		
		
		// 4단계 제목,내용
		$('.step.n4').on('click', function(){
			if ( $(this).hasClass('popup') ) return;
			_self.showTitleLayer(this);
		});
		
		
		// 회의생성
		$('#btn_meet_create').on('click', function(){
			if (!$('.step.n1').hasClass('on')) {
				mobiscroll.toast({message:gap.lang.mt_type_msg, color:'danger'});
				return false;
			}
			if (!$('.step.n2').hasClass('on')) {
				mobiscroll.toast({message:gap.lang.mt_place_msg, color:'danger'});
				return false;
			}
			
			// 회의 시작시간이 현재 시간보다 작은지 검사
			var meet_start = _self.getResMeetingStart();
			var now = moment();
			if (meet_start.diff(now) < 0) {
				mobiscroll.toast({message:gap.lang.mt_invalid_4, color:'danger'});
				return false;
			}
			
			
			/*
			 * 0명으로도 예약 가능하도록 제한 해제
			if (!$('.step.n3').hasClass('on')) {
				mobiscroll.toast({message:gap.lang.mt_att_msg, color:'danger'});
				return false;
			}
			*/
			
			if (!$('.step.n4').hasClass('on')) {
				mobiscroll.toast({message:gap.lang.mt_invalid_2, color:'danger'});
				return false;
			}
			
			/*
			if ($(this).parent().hasClass('save')) {
				_self.createMeeting(true);
			} else {				
				_self.createMeeting();
			}
			*/
			_self.saveConfirm();
		});
		
		
		
		// 회의실 예약 바로가기
		$('#btn_go_meeting').on('click', function(){
			window.open('/rezmanager');
		});
		
		// 화상 회의 바로가기
		$('#btn_go_online').on('click', function(){
			window.open('/vemanager');
		});
				
	},
	
	"initEditHeader" : function(info){
		var _self = this;
		this.showLoading();
		
		// 편집인 경우 업무방 정보 리셋
		this.work_info = null;
		
		var detail_def = $.Deferred();
		
		// 상세 정보를 불러와서 뿌려준다다
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
		var $layer = $('#meeting_head');
		var $el;
		var el_data;
		
		this.edit_scheduleid = info.scheduleid;
		
		// 1.회의 유형 레이어
		el_data = {
			type: info.type,
			record: info.record,
			mail_noti: info.mail_noti
		}
		
		if (info.type == '1'){
			html = gap.lang.mt_type_1;
		} else if (info.type == '2'){
			html = gap.lang.mt_type_2;
		} else {
			html = gap.lang.mt_type_3;
		}
		
		var add_txt = '';
		if (info.record) {
			add_txt = '<br>' + gap.lang.mt_record;
			
		} else {
			
		}

		if (info.mail_noti) {
			if (add_txt == '') {
				add_txt += '<br>' + info.mail_noti + gap.lang.beforeminute + ' ' + gap.lang.mt_mail_noti;
			} else {
				add_txt += ', ' + info.mail_noti + gap.lang.beforeminute + ' ' + gap.lang.mt_mail_noti;
			}
		} else {
			
		}
		
		html += add_txt;
		
		$el = $layer.find('.step.n1');
		$el.addClass('on').data('info', el_data);
		$el.data('realtime', info.realtime == true ? 'T': 'F');
		$el.find('.cont').html(html);
		
		
		// 2.장소일시 레이어
		if (info.type == '3'){
			el_data = {
				start: moment(info.newevent.start),
				end: moment(info.newevent.end)
			}
			html = el_data.start.format('YYYY.MM.DD[(]ddd[)]');
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
				end: moment(info.newevent.end),
				roomlist: info.roomlist
			}
			var room_nm = el_data.name;
			// 다중으로 회의실을 잡은 경우
			if (el_data.roomlist && el_data.roomlist.length > 1) {
				room_nm += ' ' + gap.lang.other + ' ' + (el_data.roomlist.length - 1) + gap.lang.total_attach_count_txt; 
			}
			html = room_nm + '<br>' + el_data.start.format('YYYY.MM.DD[(]ddd[)]');
			html += ' ' + el_data.start.format('h:mmA') + ' - ' + el_data.end.format('h:mmA');
		}
		
		$el = $layer.find('.step.n2');
		$el.addClass('on').data('info', el_data);
		$el.find('.cont').html(html);
		
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
			
			html = '<span>' + info.partylist.length + '명</span><span>' + user_nm.join(', ') + '</span>';
			$el = $layer.find('.step.n3');
			$el.addClass('on').data('info', el_data);
			$el.find('.cont').html(html);
		}
		
		// 4.회의명/회의 내용 레이어
		if (info.title || info.body) {
			el_data = {
				title: info.title || '',
				body: info.body || ''
			}
			html = '<span>' + info.title + '</span><span>' + info.body + '</span>';
			$el = $layer.find('.step.n4');
			$el.addClass('on').data('info', el_data);
			$el.find('.cont').html(html);
		}
		
		// 저장 버튼 활성화
		
	},
	
	"setDataInfo" : function(meet_type, kys){
		// 다른 시스템에서 호출해서 셋팅하는 경우
		var $layer = $('#meeting_head');
		var $el;

		// 타입 설정
		var el_data = {
			type: meet_type,
			record: false,
			mail_noti: '10'	// 기본 값 10분
		}
		
		if (meet_type == '1'){
			html = gap.lang.mt_type_1;
		} else if (meet_type == '2'){
			html = gap.lang.mt_type_2;
		} else {
			html = gap.lang.mt_type_3;
		}
		
		
		html += '<br>' + el_data.mail_noti + gap.lang.beforeminute + ' ' + gap.lang.mt_mail_noti;			
		
		
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
            //'		<li>전체 회의 <span class="num en">16</span></li>' +
            //'		<li>녹화된 회의 <span class="num en">03</span></li>' +
			'	</ul>' +
			'	<div class="input-field selectbox sel_box">' +
            '		<select id="meet_filter_type">' +
            '			<option value="all">' + gap.lang.mt_filter_all + '</option>' +
            '			<option value="2">' + gap.lang.mt_type_2 + '</option>' +            
            '			<option value="1">' + gap.lang.mt_type_1 + '</option>' +
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
	
	"getAllMeetingList" : function(is_today, draw_pass){
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
			
			
			// 카운트 표시
			if (is_today) {
				$('#cnt_today_meet').html(list.length);
				
				// 현재 시간 이전 미팅건은 카운트하지 않음
				var now = moment();			
				var filter_list = list.filter(function(data){
					var meet_et = moment(data.endtime);
					return now.diff(meet_et) < 0;
				});

				// LNB영역에 카운트 표시
				gap.unread_count_check(6, filter_list.length);
			} else {
				$('#cnt_reserve_meet').html(list.length);
			}
			
			// 
			if (!draw_pass) {_self.drawList(list);}
			
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
			
			// 현재 시간 이전 미팅건은 카운트하지 않음
			var now = moment();			
			var filter_list = list.filter(function(data){
				var meet_et = moment(data.endtime);
				return now.diff(meet_et) < 0;
			}); 

			// 카운트 표시
			gap.unread_count_check(6, filter_list.length);
			
		}, function(err_1, err_2){
			console.log('회의 데이터 로드 중 오류 발생');
			_self.hideLoading();
		});
	},
	
	
	"drawList" : function(list){
		$('#meeting_list_table').parent().remove();
		
		var now = moment();
		
		var html = 
			'<div class="tab_cont_wr">' +
			'<table id="meeting_list_table" class="tablesorter">' +
			'	<thead>' +
			'		<tr>' +
			'			<th style="width: 12px;" class="inb" data-sorter="false" data-parser="false"></th>' +
			'			<th style="width: 160px;" class="inb">유형</th>' +
			'			<th style="width: auto;">' + gap.lang.mt_th_title + '</th>' +
			'			<th style="width: auto;">' + gap.lang.mt_th_owner + '</th>' +
			'			<th style="width: 10%;">' + gap.lang.mt_th_date + '</th>' +
			'			<th style="width: 10%;">' + gap.lang.mt_th_time + '</th>' +
			'			<th style="width: auto;">' + gap.lang.mt_th_place + '</th>' +
			'			<th style="width: 6%;">' + gap.lang.mt_th_att + '</th>' +
			'			<th style="width: 130px; height: auto;" data-sorter="false" data-parser="false">' + gap.lang.mt_th_online + '</th>' +
			'			<th style="width: 4%;" data-sorter="false" data-parser="false">' + gap.lang.mt_th_modify + '</th>' +
			'			<th style="width: 4%;" data-sorter="false" data-parser="false">' + gap.lang.mt_th_remove + '</th>' +
			'			<th style="width: 5%;padding-right: 1.5%;" data-sorter="false" data-parser="false">' + gap.lang.mt_th_copy + '</th>' +
			//'			<th style="width: 5%;padding-right: 1.5%;" data-sorter="false" data-parser="false">' + gap.lang.mt_th_trans + '</th>' +
			'		</tr>' +
			'	</thead>' +
			'	<tbody id="meeting_list">' +
			'	</tbody>' +
			'</table>' +
			'</div>';
		
		$('#meeting_body').append(html);
		var $tbody = $('#meeting_list');
		
		if (list.length == 0) {
			$tbody.append('<td colspan="12">' + gap.lang.mt_no_list + '</td>');
			return;
		}
				
		$.each(list, function(){
			var meet_et = moment(this.endtime);
			var is_exp = now.diff(meet_et, 'm') > 0;
			
			var $tr = $('<tr data-id="' + this.scheduleid + '"' + (is_exp ? ' class="expired-date"' : '') + '></tr>');
			var data = '';

			// Blank (border 둥글리기 용도)
			$tr.append('<td></td>');
			
			// 유형
			data = this.type == '1' ? gap.lang.mt_type_1 : this.type == '2' ? gap.lang.mt_type_2 : gap.lang.mt_type_3; 
			$tr.append('<td class="color fw800"><span class="meeting-type middot">' + data + '</span></td>');
			
			// 회의명
			$tr.append('<td class="fw800' + (this.contents ? ' body' : '') + '">' + this.title + (this.contents ? '<span class="icon-cont"></span>' : '') + '</td>');
			
			// 주최자
			data = this.owner_nm + '/' + this.owner_dept;
			$tr.append('<td class="normal"><span class="owner" data-key="' + this.owner_id + '">' + data + '</span></td>');
			
			// 날짜
			data = moment(this.starttime).format('YYYY.MM.DD[(]ddd[)]');
			$tr.append('<td>' + data + '</td>');
			
			// 시간
			data = moment(this.starttime).format('H:mm') + '~' + moment(this.endtime).format('H:mm');
			$tr.append('<td class="en fz15">' + data + '</td>');
			
			// 회의실명
			if (this.endpoint_nm) {
				if (this.type == '3') {
					data = '-';
				} else {
					if (this.endpoint_length > 1) {
						data = this.place_nm + ' ' + this.floor_nm + ' ' + this.endpoint_nm;
						data += ' ' + gap.lang.other + ' ' + (this.endpoint_length - 1) + gap.lang.total_attach_count_txt;
					} else {
						console.log(this);
						data = this.place_nm + ' ' + this.floor_nm + ' ' + this.endpoint_nm;
						data = '<span class="btn-endpoint">' + data + '</span>';
					}
					
					//data = this.endpoint_nm;
				}
			} else {
				data = '-';
			}
			$tr.append('<td class="' + (data != '-' ? 'endpoint' : '') + '" data-code="' + this.endpoint_key + '">' + data + '</td>');
			
			// 참여인원		
			data = (this.partylist.length + 1) + gap.lang.mt_person; // 주최자 포함
			$tr.append('<td class="partylist">' + data + '</td>');
			
			// 온라인회의 URL			
			var overtime = now.diff(moment(this.endtime)) > 0;
			data = this.online_url ? '<span class="cam btn-meeting-online' + (overtime ? ' disabled' : '') + '">' + gap.lang.mt_online_enter + '</span>' : ''; 
			$tr.append('<td class="color atte">' + data + '</td>');
			
			
			var is_owner = (this.owner_id == gap.userinfo.rinfo.ky);
			
			// 수정
			data = '<button type="button" class="ico btn_circle cor_btn' + (is_owner ? '' : ' disabled') + '">' + gap.lang.mt_th_modify + '</span>';
			$tr.append('<td>' + data + '</td>');
			
			// 삭제
			data = '<button type="button" class="ico btn_circle del_btn' + (is_owner ? '' : ' disabled') + '">' + gap.lang.mt_th_remove + '</button>';
			$tr.append('<td>' + data + '</td>');
			
			// 복사
			data = '<button type="button" class="ico btn_circle copy_btn' + (this.online_url ? '' : ' disabled') + '">' + gap.lang.mt_th_copy + '</button>';
			$tr.append('<td>' + data + '</td>');
			
			/*
			// 양도
			data = '<button type="button" class="ico btn_circle tran_btn' + (is_owner ? '' : ' disabled') + '">' + gap.lang.mt_th_trans + '</span>';
			$tr.append('<td>' + data + '</td>');
			*/
			
			$tr.data('info', this);
			$tbody.append($tr);
		});
		
		this.tableEvent();
	},
	
	"tableEvent": function(){
		var _self = this;
		
		var $table = $('#meeting_list_table');
		$table.tablesorter({
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
		
		
		// 주최자
		$table.find('.owner').on('click', function() {
			gap.showUserDetailLayer($(this).data('key'));
			return false;
		});
		
		$table.find('.btn-endpoint').on('click', function(){
			var roomkey = $(this).parent().data('code');
			_self.openRoomDetailInfo(roomkey);
			return false;
		});
		
		
		// 화상 참여 링크 참여
		$table.find('.btn-meeting-online').on('click', function() {
			if ($(this).hasClass('disabled')) return false;
			var info = $(this).closest('tr').data('info');
			
			var now = moment();
			var meet_stime = moment(info.starttime);
			var meet_etime = moment(info.endtime);
			
			// 현재 시간이 시작시간보다 이전인 경우만 화상 참석 가능
			if (now.diff(meet_etime) > 0) {
				mobiscroll.toast({message:gap.lang.mt_over_time, color:'danger'});
				//$(this).addClass('disabled');
			} else {
				if (now.diff(meet_stime, 'm') < -15) {
					mobiscroll.toast({message:gap.lang.meeting_time_limit, color:'danger'});
				} else {
					window.open(info.online_url);					
				}
			}
			return false;
		});
		
		
		// 수정
		$table.find('.cor_btn').on('click', function() {
			if ( $(this).hasClass('disabled') ) return false;
			var info = $(this).closest('tr').data('info');
			
			// 시작시간이 현재시간 이후인 경우는 수정 안되도록 처리
			var now_date = moment();
			
			var end_time = moment(info.endtime);
			if (now_date.diff(end_time) > 0) {
				alert('종료된 회의는 수정할 수 없습니다');
				return false;
			}				
			
			var start_time = moment(info.starttime);
			if (now_date.diff(start_time) > 0) {
				alert('진행중인 회의는 수정할 수 없습니다');
				return false;
			}
			
			// 회의실 예약 반복인 경우 수정 안됨
			if (info.repeat) {
				gap.showConfirm({
					title: gap.lang.info,
					contents: gap.lang.mt_repeat_go_site,
					callback: function(){
						$('#btn_go_meeting').click();
					}
				});
				return false;
			}
			
			/*
			// 화상회의 장비 2개 이상 예약된 경우 수정 안됨 , 2개 이상 선택 가능하도록 수정함
			if (info.endpoint_length >= 2) {
				gap.showConfirm({
					title: gap.lang.info,
					contents: gap.lang.mt_go_site,
					callback: function(){
						$('#btn_go_online').click();
					}
				});
				return false;
			}
			*/
			
			_self.initEditHeader(info);
			return false;
		});
		
		
		// 삭제
		$table.find('.del_btn').on('click', function() {
			if ( $(this).hasClass('disabled') ) return false;
			var info = $(this).closest('tr').data('info');
			
			if (info.owner_id != gap.userinfo.rinfo.ky) {
				mobiscroll.toast({message:gap.lang.mt_alert_1, color:'danger'});
				return false;
			}
			
			gap.showConfirm({
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
					
					cancel_promise.then(function(data){
						_self.getAllMeetingList($('#btn_meeting_today').hasClass('on')).then(function(){
							_self.hideLoading();
						}).then(function(){
							// 업무방에서 잡은 회의일 수 있으므로 업무방 데이터를 삭제 요청한다
							gap.delete_channel_data_from_meet(info.scheduleid);
						});
					}, function(){
						mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
						_self.hideLoading();
					});
				}
			});
			return false;
		});
		
		
		// 복사
		$table.find('.copy_btn').on('click', function() {
			if ( $(this).hasClass('disabled') ) return false;
			var info = $(this).closest('tr').data('info');
			
			var $copy_input = $('<input type="text" style="">');
			$copy_input.val(info.online_url);
			$('body').append($copy_input);
			$copy_input.get(0).select();
			document.execCommand("copy");
			$copy_input.remove();
			mobiscroll.toast({message:gap.lang.mt_url_copy, color:'info'});
			return false;
		});
		
		
		// 회의 상세
		$table.find('#meeting_list tr').on('click', function(e){
			var info = $(this).data('info');
			_self.showMeetingDetailLayer(info.type, info.scheduleid);
		})
		
		
			/*	
		// Button Events
		$('#meeting_list_table').on('click', function(e){
			var $tr = $(e.target).closest('tr');
			var info = $tr.data('info');
			
			// 화상회의 링크 참여
			if ($(e.target).hasClass('btn-meeting-online')) {
				if ($(e.target).hasClass('disabled')) return false;

				var now = moment();
				var meet_etime = moment(info.endtime);
				
				// 현재 시간이 시작시간보다 이전인 경우만 화상 참석 가능
				if (now.diff(meet_etime) < 0) {
					window.open(info.online_url);
				} else {
					mobiscroll.toast({message:gap.lang.mt_over_time, color:'danger'});
					$(e.target).addClass('disabled');
				}
				
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
				gap.showUserDetailLayer($(e.target).data('key'));
				return false;
			}
			
			// 찹석자
			if ($(e.target).hasClass('partylist')) {
				_self.showMeetingPartylist(e.target);
				return false;
			}
			
			// 회의실
			if ($(e.target).hasClass('endpoint')) {
				_self.openRoomDetailInfo(info.endpoint_key);
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
		*/
	},
	
	"showMeetBlock" : function(){
		$('.meet-block-layer').remove();
		var html = '<div class="meet-block-layer"></div>';
		var $block = $(html);
		$('#body_content').append($block);
	},
	
	"hideMeetBlock" : function(){
		$('.meet-block-layer').remove();
	},
	
	"setLayer" : function(el, html){
		var _self = this;
		this.showMeetBlock();
		
		var $target = $(el);
		$target.addClass('popup');
				
		$('.meet-make-layer').remove();
		
		var $layer = $(html);
		/*
		$layer.css({
			top: $target.outerHeight() + 15,
			left: 0
		});
		*/
		$target.append($layer);
	},
	
	// 타입 레이어 표시
	"showTypeLayer" : function(el){
		var _self = this;
		var $el = $(el);
		var html =
			'<div id="meeting_type" class="layer_wrap">' +
            '	<div class="layer_inner">' +
            '		<div class="pop_btn_close"></div>' +
            '		<h4>' + gap.lang.mt_type + '</h4>' +
            '		<div class="layer_cont left">' +
            '			<div class="type_list_wr rel">' +
            '				<div class="type_list flex" data-value="2">' +
            '					<div class="chk_wr"><div class="chk_point"></div></div>' +
            '					<div class="txt_wr">' +
            '						<strong>' + gap.lang.mt_type_2 + '</strong>' +
            '						<span>' + gap.lang.mt_type_2_cont + '</span>' +
            '					</div>' +
            '					<div class="abs type_icon type_icon_meet"></div>' +
            '				</div>' +
            '				<div class="type_list flex" data-value="1">' +
            '					<div class="chk_wr"><div class="chk_point"></div></div>' +
            '					<div class="txt_wr">' +
            '						<strong>' + gap.lang.mt_type_1 + '</strong>' +
            '						<span>' + gap.lang.mt_type_1_cont + '</span>' +
            '					</div>' +
            '					<div class="abs type_icon"></div>' +
            '				</div>' +
            '				<div class="type_list flex" data-value="3">' +                                                    
            '					<div class="chk_wr"><div class="chk_point"></div></div>' +
            '					<div class="txt_wr">' +
            '						<strong>' + gap.lang.mt_type_3 + '</strong>' +
            '						<span>' + gap.lang.mt_type_3_cont + '</span>' +
            '					</div>' +
            '					<div class="abs type_icon type_icon_off"></div>' +
            '				</div>' +
            '			</div>' +
            '		</div>' +
            '		<div class="layer_cont online-type-opt">' +
            '			<label class="disabled"><input id="mt_record" type="checkbox" disabled>' + gap.lang.mt_record + '</label>' +
            '			<div>' +
            '				<label class="disabled"><input id="mt_mail_noti" type="checkbox" disabled checked>' + gap.lang.mt_mail_noti + '</label>' +
            '				<div class="selectbox" style="display:inline-block;margin-left:5px;">' +
            '					<select id="mt_noti_time" disabled>' +
            '						<option value="5">5' + gap.lang.beforeminute + '</option>' +
            '						<option value="10" selected>10' + gap.lang.beforeminute + '</option>' +
            '						<option value="20">20' + gap.lang.beforeminute + '</option>' +
            '						<option value="30">30' + gap.lang.beforeminute + '</option>' +
            '						<option value="60">1' + gap.lang.beforehours + '</option>' +
            '					</select>' +
            '				</div>' +
            '			</div>' +
            '		</div>' +
            '		<div class="btn_wr">' +
            '			<button class="btn_layer confirm">' + gap.lang.OK + '</button>' +
            '		</div>' +                                        
            '	</div>' +
            '</div>';
		
		this.setLayer(el, html);
				
		$('#mt_noti_time').material_select();
		
		var $layer = $('#meeting_type');
		
		var info = $el.data('info');
		if (info) {
			$layer.find('.type_list[data-value="' + info.type + '"]').addClass('on');
			
			// 화상회의인 경우 녹화,메일알림 기능 enable
			if (info.type != '2') {
				$layer.find('.online-type-opt input').prop('disabled', false);
				$layer.find('.online-type-opt input').parent().removeClass('disabled');
				
				// 녹화여부 셋팅
				if (info.record) {
					$('#mt_record').prop('checked', true);
				} else {
					$('#mt_record').prop('checked', false);
				}
				
				// 메일알림 여부 셋팅
				if (info.mail_noti) {
					$('#mt_mail_noti').prop('checked', true);
					$('#mt_noti_time').val(info.mail_noti);
					$('#mt_noti_time').prop('disabled', false).material_select();
				} else {
					$('#mt_mail_noti').prop('checked', false);
					$('#mt_noti_time').prop('disabled', true).material_select();
				}
			}
		}
		
		// 이벤트 처리
		$layer.find('.pop_btn_close').on('click', function(){
			$(this).closest('.step').removeClass('popup');
			$layer.remove();
			_self.hideMeetBlock();
			return false;
		});
		
		// 타입선택
		$layer.find('.type_list').on('click', function(){
			if ($(this).hasClass('on')) return false;
			$layer.find('.type_list').removeClass('on');
			$(this).addClass('on');
			
			var meet_type = $(this).data('value');
			
			if (meet_type == '2') {
				$layer.find('.online-type-opt input').prop('disabled', true);
				$layer.find('.online-type-opt input').parent().addClass('disabled');
				$('#mt_noti_time').prop('disabled', true).material_select();
			} else {
				// 화상회의인 경우 녹화,메일알림 기능 enable
				$layer.find('.online-type-opt input').prop('disabled', false);
				$layer.find('.online-type-opt input').parent().removeClass('disabled');
				if ($('#mt_mail_noti').is(':checked')) {
					$('#mt_noti_time').prop('disabled', false).material_select();
				} else {
					$('#mt_noti_time').prop('disabled', true).material_select();
				}
			}
		});
		
		// 메일알림
		$layer.find('#mt_mail_noti').on('click', function(){
			if ($('#mt_mail_noti').is(':checked')) {
				$('#mt_noti_time').prop('disabled', false).material_select();
			} else {
				$('#mt_noti_time').prop('disabled', true).material_select();
			}
		});
		
		
		// 확인
		$layer.find('.confirm').on('click', function(){
			var $sel_type = $layer.find('.type_list.on');
			if ($sel_type.length == 0) {
				mobiscroll.toast({message:gap.lang.mt_invalid_3, color:'danger'});
				return false;
			}
			
			var txt = $sel_type.find('strong').text();
			var sel_type = $sel_type.data('value');			
			var before_info = $el.data('info');
			if (before_info && before_info.type != sel_type && $('.step.n2').hasClass('on')) {
				gap.showConfirm({
					title: gap.lang.info,
					contents: gap.lang.mt_alert_3,
					callback: function(){
						var el_info = {
							type: sel_type,
							record: false,
							mail_noti: false
						}
						$el.find('.cont').html(txt);
						$el.data('info', el_info).addClass('on');
						
						// 장소/일시 초기화
						$('.step.n2').removeClass('on');
						$('.step.n2').removeData('info');
						$('.step.n2 .cont').html($('.step.n2 .cont').data('txt'));					
						$('#btn_meet_create').parent().removeClass('finish');
						$layer.find('.pop_btn_close').click();
						$('.step.n2').click();
					}
				});
				
				return false;
			} else {
				var el_info = {
					type: sel_type,
					record: (sel_type != 2 && $('#mt_record').is(':checked') ? true : false),
					mail_noti: (sel_type != 2 && $('#mt_mail_noti').is(':checked') ? $('#mt_noti_time').val() : '')
				}
				
				var add_txt = '';
				if (el_info.record) {
					add_txt = '<br>' + gap.lang.mt_record; 
				}
				if (el_info.mail_noti) {
					if (add_txt == '') {
						add_txt = '<br>' + el_info.mail_noti + gap.lang.beforeminute + ' ' + gap.lang.mt_mail_noti;
					} else {
						add_txt += ', ' + el_info.mail_noti + gap.lang.beforeminute + ' ' + gap.lang.mt_mail_noti;
					}
				}
				$el.find('.cont').html(txt + add_txt);
				$el.data('info', el_info).addClass('on');
				$layer.find('.pop_btn_close').click();
				$('.step.n2').click();
			}
			
			return false;
		});
	},
	
	// 타입정보 가져오기
	"getResMeetingType" : function(){
		var res = "";
		
		var $el = $('#meeting_head').find('.step.n1');
		if ($el.hasClass('on')) {
			res = $el.data('info').type;
		}
		
		return res;
	},
	
	// 녹화여부
	"getResMeetingRecord" : function(){
		var res = 'N';
		
		var $el = $('#meeting_head').find('.step.n1');
		if ($el.hasClass('on')) {
			res = $el.data('info').record == true ? 'Y' : 'N';
		}
		
		return res;
	},
	
	// 메일알림
	"getResMeetingMailNoti" : function(){
		var res = '';
		
		var $el = $('#meeting_head').find('.step.n1');
		if ($el.hasClass('on')) {
			res = $el.data('info').mail_noti;
		}
		
		return res;
	},
	
	// 회의실 or 화상장비 코드 정보
	"getResMeetingCode" : function(){
		var res = "";
		
		var $el = $('#meeting_head').find('.step.n2');
		if ($el.hasClass('on')) {
			var info = $el.data('info');
			if (info) {
				res = info.id;
			}
		}
		
		return res;
	},
	
	"getResMeetingCodeList" : function(){
		var res = [];
		
		var $el = $('#meeting_head').find('.step.n2');
		if ($el.hasClass('on')) {
			var info = $el.data('info');
			if (info) {
				res = info.roomlist;
			}
		}
		
		return res;
	},
	
	// 회의 시작일시
	"getResMeetingStart" : function(){
		var res = "";
		
		var $el = $('#meeting_head').find('.step.n2');
		if ($el.hasClass('on')) {
			var info = $el.data('info');
			if (info) {
				res = info.start;
			}
		}
		
		return res;
	},
	
	// 회의 종료일시
	"getResMeetingEnd" : function(){
		var res = "";
		
		var $el = $('#meeting_head').find('.step.n2');
		if ($el.hasClass('on')) {
			var info = $el.data('info');
			if (info) {
				res = info.end;
			}
		}
		
		return res;
	},
	
	// 참석자
	"getResMeetingUser" : function(){
		var res = [];
		
		var $el = $('#meeting_head').find('.step.n3');
		if ($el.hasClass('on')) {
			var info = $el.data('info');
			if (info) {
				$.each(info, function(){
					res.push(this.ky);
				});
			}
		}
		
		return res;
	},
	
	// 제목
	"getResMeetingTitle" : function(){
		var res = "";
		
		var $el = $('#meeting_head').find('.step.n4');
		if ($el.hasClass('on')) {
			var info = $el.data('info');
			if (info) {
				res = info.title;
			}
		}
		
		if (res == "") {
			res = gap.lang.mt_new_meeting;
		}
		return res;
	},
	
	// 내용
	"getResMeetingBody" : function(){
	var res = "";
		
		var $el = $('#meeting_head').find('.step.n4');
		if ($el.hasClass('on')) {
			var info = $el.data('info');
			if (info) {
				res = info.body;
			}
		}
		
		return res;
	},
	
	
	
	// 레이어 표시
	"showPlaceLayer" : function(el){
		
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
		
		var _self = this;
		var $el = $(el);
		
		/*
		if (this.place_init) {
			this.showMeetBlock();
			
			var $target = $(el);
			$target.addClass('popup');
			$('#meeting_time').show();
			return;
		}
		*/
		
		this.timeline = null;
		$('#meeting_time').remove();
		
		var html =
			'<div id="meeting_time" class="layer_wrap" style="width: 1223px; height: 557px;">' + 
			'	<div class="layer_inner ">' + 
			'		<div class="pop_btn_close"></div>' + 
			'		<h4>' + gap.lang.mt_place + '</h4>' + 
			'		<div class="layer_cont left">' + 
			'			<div class="f_middle rel" style="margin-bottom:20px; justify-content:space-between;">' + 
			'				<div class="f_middle">' + 
			'					<span class="tit">' + gap.lang.mt_ly_place + '</span>' + 
			'					<div class="input-field selectbox" style="width: 210px;">' + 
			'						<select id="meet_res_company"></select>' + 
			'					</div>' + 
			'					<div class="input-field selectbox" style="width: 160px;">' + 
			'						<select id="meet_res_place"></select>' + 
			'					</div>' + 
			'					<div id="meet_res_floor_wrap" class="input-field selectbox" style="width: 140px;display:none;">' + 
			'						<select id="meet_res_floor"></select>' + 
			'					</div>' +
			'				</div>' +
			'				<div>' +
			'					<div class="f_middle" style="display:inline-flex;margin-right:20px;">' + 
			'						<span class="tit">' + gap.lang.mt_th_date + '</span>' + 
			'						<div class="selectbox mu_calendar rel" style="width: 130px; text-indent:0;">' +					
			'							<input type="text" id="meet_res_date" style="box-shadow:none !important;border:none !important; cursor:default;">' +
			'							<div class="abs type_icon"></div>' +
			'						</div>' + 
			'					</div>' + 
			'					<div class="f_middle time" style="display:inline-flex;">' + 
			'						<span class="tit">' + gap.lang.mt_th_time + '</span>' + 
			'						<div class="input-field selectbox" style="width: 100px;">' + 
			'							<select id="meet_res_stime">' + 
			'							</select>' + 
			'						</div>' + 
			'						<div class="during">~</div>' + 
			'						<div class="input-field selectbox" style="width: 100px;">' + 
			'							<select id="meet_res_etime">' + 
			'							</select>' + 
			'						</div>' + 
			'					</div>' +
			'				</div>' +
			'			</div>' +
			'			<div id="mt_sel_room_wrap" class="f_middle rel" style="margin-bottom:20px;justify-content:space-between;min-height:25px;">' +
			'				<div class="f_middle">' + 
			'					<span class="tit" style="margin-bottom:5px;flex:0 0 auto;">' + gap.lang.mt_sel_room + '</span>' +
			'					<button id="btn_add_room" class="btn-add-room">' + gap.lang.mt_add_room + '</button>' +
			'					<div id="mt_sel_room_list" class="sel-room-list"></div>' +
			'				</div>' +
			'			</div>' +
			'			<div id="meet_res_timeline" class="timeline">' + 
			'			</div>' + 
			'			<div id="meet_res_no_place" style="font-size:15px;text-align:center;padding:50px 0;display:none;">' + 
			'				<span>' + gap.lang.mt_no_place + '</span>' +
			'			</div>' +
			'		</div>' + 
			'		<div class="btn_wr">' + 
			'			<button class="btn_layer confirm">' + gap.lang.OK + '</button>' + 
			'		</div>' + 
			'	</div>' + 
			'</div>';
		
		this.setLayer(el, html);
		
		var $layer = $('#meeting_time');
		
		// 바깥 스크롤 막기
		$('#meet_contents_scroll').scrollTop(0);
		$('#meet_contents_scroll').css('overflow-y', 'hidden');
		
		// info가 넘어오면 값을 셋팅해야 함
		var info = $el.data('info');
		var sel_date;
		
		
		if (info) {
			sel_date = moment(info.start).format('YYYY-MM-DD');
			var room_info = {
				company: info.company,
				floor: info.floor,
				id: info.id,
				name: info.name,
				place: info.place
			}
			
			if (info.roomlist) {
				// 장비 여러개 선택된 경우
				$.each(info.roomlist, function(){
					_self.addRoom(this.id, this.name, this);
				});
			} else {
				_self.addRoom(info.id, info.name, room_info);				
			}
		} else {
			sel_date = moment().format('YYYY-MM-DD');
			_self.addRoom('empty');
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
				var $sel_room = $('#mt_sel_room_list .sel-room');
				if ($sel_room.length > 0) {
					// 기존에 회의실이 잡혀있을 때, 날짜 변경하면 초기화 된다는 컨펌창 표시
					gap.showConfirm({
						title: gap.lang.mt_change_date_title,
						contents: gap.lang.mt_change_date,
						callback: function(){
							$('#mt_sel_room_list').empty();
							_self.addRoom('empty');
							
							$('#meet_res_date').val(event.valueText);
							inst.setVal(event.valueText);
							_self.drawPlaceTimeline();
						}
					});
					$('#meet_res_date').val(inst._oldValueText);
					inst.setVal(inst._oldValueText);
				} else {
					$('#meet_res_date').val(event.valueText);
					inst.setVal(event.valueText);
					_self.drawPlaceTimeline();
				}
			}
		});
		
		$layer.find('.type_icon').on('click', function(){
			$date.mobiscroll('getInst').open();
		});
		
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

		var res_meet_type = _self.getResMeetingType();
		
		// 회사정보 가져오기
		// 타입에 따라 API 정보 요청
		var com_opt = '';
		if (res_meet_type == '1') {
			//전체 회사 정보를 가져와야 함
			var com_list = gap.getCompanyList();
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
			this.onlineOneAPI("getSubDept.do", {deptcd:com_code}).then(function(data){
				var html = '<option value="all" selected>' + gap.lang.All + '</option>';
				$('#meet_res_floor').html(html);
				
				$.each(data.subdeptlist, function(){
					html += '<option value="' + this.deptcd + '">' + this.deptnm + '</option>';
				});
				
				$('#meet_res_place').html(html);
				
				if (info) {
					_self.onlineOneAPI("getSubDept.do", {deptcd:info.sel_place ? info.sel_place : info.place}).then(function(data){
						var html = '<option value="all" selected>' + gap.lang.All + '</option>';
						
						$.each(data.subdeptlist, function(){
							html += '<option value="' + this.deptcd + '">' + this.deptnm + '</option>';
						});
						
						$('#meet_res_floor').html(html);
						$('#meet_res_place').val(info.sel_place ? info.sel_place : info.place);
						$('#meet_res_floor').val(info.sel_floor ? info.sel_floor : info.floor);
						
						if ($('#meet_res_place').val() != 'all') {
							$('#meet_res_floor_wrap').show();							
						}
						
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
			this.meetingOneAPI("floor_list.open", {placeCode:com_code}).then(function(data){
				var html = '<option value="all" selected>' + gap.lang.All + '</option>';
				$('#meet_res_floor').html(html);
				
				$.each(data.result, function(){
					html += '<option value="' + this.floorCode + '">' + this.floor + '</option>';
				});
				
				$('#meet_res_place').html(html);
				
				if (info) {
					_self.meetingOneAPI("sub_list.open", {floorCode:info.sel_place ? info.sel_place : info.place}).then(function(data){
						var html = '<option value="all" selected>' + gap.lang.All + '</option>';
						
						$.each(data.result, function(){
							html += '<option value="' + this.subCode + '">' + this.sub + '</option>';
						});
						
						$('#meet_res_floor').html(html);
						$('#meet_res_place').val(info.sel_place ? info.sel_place : info.place);
						$('#meet_res_floor').val(info.sel_floor ? info.sel_floor : info.floor);
						
						if ($('#meet_res_place').val() != 'all') {
							$('#meet_res_floor_wrap').show();							
						}
						
						$def.resolve();
					});
				} else {
					$def.resolve();
				}
			}, function(){
				$def.resolve();
			});
		} else {
			var html = '<div class="timeline none_meet f_center">' + gap.lang.mt_ly_online_msg + '</div>';
			$('#meet_res_timeline').html(html);
			$('#meet_res_company').prop('disabled', true);
			$('#meet_res_place').html('<option value="all" selected>' + gap.lang.All + '</option>').prop('disabled', true);
			$('.meeting-place-wrap').hide();
			$('#mt_sel_room_wrap').hide();
			$def.resolve();
		}
		
		$def.then(function(){
			// 장소 정보 가져오기
			_self.drawPlaceTimeline();
			
			// 이벤트 바인드
			_self.placeLayerEventBind();
		});
	},
	
	"placeLayerEventBind" : function(){
		var _self = this;
		var $layer = $('#meeting_time');
		
		$layer.find('select').material_select();
		
		// 레이어 닫기
		$layer.find('.pop_btn_close').on('click', function(){
			$(this).closest('.step').removeClass('popup');
			$layer.remove();
			_self.hideMeetBlock();
			$('#meet_contents_scroll').css('overflow-y', 'auto');
			return false;
		});
		
		// 회사 변경
		$layer.find('#meet_res_company').on('change', function(){
			var res_meet_type = _self.getResMeetingType();
			var com_code = $(this).val();
			if (res_meet_type == '1') {				
				_self.onlineOneAPI("getSubDept.do", {deptcd:com_code}).then(function(data){
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
					$('#meet_res_floor_wrap').hide();
					_self.drawPlaceTimeline();
				} else {
					_self.meetingOneAPI("sub_list.open", {floorCode:$(this).val()}).then(function(data){
						var html = '<option value="all" selected>' + gap.lang.All + '</option>';
						
						$.each(data.result, function(){
							html += '<option value="' + this.subCode + '">' + this.sub + '</option>';
						});
						
						$('#meet_res_floor').html(html).material_select();
						$('#meet_res_floor_wrap').show();
						_self.drawPlaceTimeline();
					});
				}
			} else {
				if (code == 'all') {
					var html = '<option value="all" selected>' + gap.lang.All + '</option>';
					$('#meet_res_floor').html(html).material_select();
					$('#meet_res_floor_wrap').hide();
					_self.drawPlaceTimeline();
				} else {
					_self.onlineOneAPI("getSubDept.do", {deptcd:$(this).val()}).then(function(data){
						var html = '<option value="all" selected>' + gap.lang.All + '</option>';
						
						$.each(data.subdeptlist, function(){
							html += '<option value="' + this.deptcd + '">' + this.deptnm + '</option>';
						});
						
						$('#meet_res_floor').html(html).material_select();
						$('#meet_res_floor_wrap').show();
						
						_self.drawPlaceTimeline();
					});
				}
			}
		});
		
		// 층 변경
		$layer.find('#meet_res_floor').on('change', function(){
			_self.drawPlaceTimeline();
		});
		
		// 시작시간
		$layer.find('#meet_res_stime').on('change', function(){
			var is_avail = _self.changeTime(true);
			if (!is_avail) {
				mobiscroll.toast({message:gap.lang.mt_alert_4, color:'danger'});
			}				
		});
		
		// 종료시간
		$layer.find('#meet_res_etime').on('change', function(){
			var is_avail = _self.changeTime(false);
			if (!is_avail) {
				mobiscroll.toast({message:gap.lang.mt_alert_4, color:'danger'});
			}				
		});
		
		// 회의실 추가
		$layer.find('.btn-add-room').on('click', function(){
			_self.showAddRoomList();
		});
		
		// 확인버튼
		$layer.find('.confirm').on('click', function(){
			var _start = $('#meet_res_date').val() + 'T' + $('#meet_res_stime').val();
			var _end = $('#meet_res_date').val() + 'T' + $('#meet_res_etime').val();
			var res_meet_type = _self.getResMeetingType();
			var res_html = '';
			
			if (res_meet_type == '3') {
				var res_data = {
					start: moment(_start),
					end: moment(_end)
				}
				
				res_html = res_data.start.format('YYYY.MM.DD[(]ddd[)]');
				res_html += ' ' + res_data.start.format('h:mmA') + ' - ' + res_data.end.format('h:mmA');
			} else {
				// 선택된 회의실 값을 리스트에서 가져오도록 변경
				var roomlist = $('#mt_sel_room_list').find('.sel-room');
				var roomel = roomlist.eq(0);
				var resource = roomel.data('roominfo');
				
				var room_infos = [];
				roomlist.each(function(){room_infos.push($(this).data('roominfo'));});
				
				
				if (!resource) {
					mobiscroll.toast({message:gap.lang.mt_alert_5, color:'danger'});
					return;
				}

				var new_event = _self.getNewEvent();
				if (new_event) {
					if (new_event.color == _self.unavail_color) {
						mobiscroll.toast({message:gap.lang.mt_alert_6, color:'danger'});
						return;
					}					
				} else {
					// 앞단에서 설정하고, 회사를 바꾸거나 하면 화면엔 new_event가 표시되지 않음
					new_event = {
						resource: resource.id,
						allDay: false,
						color: _self.avail_color,
						start: moment(_start).toDate(),
						end: moment(_end).toDate(),
						temp: true,
						title: gap.lang.mt_new_meeting
					}
				}
				
				/*			
				var new_event = _self.getNewEvent();
				if (!new_event) {
					mobiscroll.toast({message:gap.lang.mt_alert_5, color:'danger'});
					return;
				}
				
				if (new_event.color == _self.unavail_color) {
					mobiscroll.toast({message:gap.lang.mt_alert_6, color:'danger'});
					return;
				}
				var resource = _self.timeline._resourcesMap[new_event.resource];
				*/

				var res_data = {
					roomlist: room_infos,	// 복수개의 장비 정보가 들어감
					id: resource.id,
					name: resource.name,
					company: resource.company,
					place: resource.place,
					floor: resource.floor,
					sel_place: $('#meet_res_place').val(),	// 현재 선택된 값으로 표시
					sel_floor: $('#meet_res_floor').val(),
					start: moment(_start),
					end: moment(_end),
					newevent: new_event
				}
				
				var room_nm = res_data.name;
				// 다중으로 회의실을 잡은 경우
				if (roomlist.length > 1) {
					room_nm += ' ' + gap.lang.other + ' ' + (roomlist.length - 1) + gap.lang.total_attach_count_txt; 
				}
				res_html = room_nm + '<br>' + res_data.start.format('YYYY.MM.DD[(]ddd[)]');
				res_html += ' ' + res_data.start.format('h:mmA') + ' - ' + res_data.end.format('h:mmA');
			}
			
			var $el = $('.step.n2');
			$el.data('info', res_data).addClass('on');
			$el.find('.cont').html(res_html);
			$layer.find('.pop_btn_close').click();
			if (!$('.step.n3').hasClass('on')) {
				$('.step.n3').click();
			} else if (!$('.step.n4').hasClass('on')) {
				$('.step.n4').click();
			}
			
			_self.finishCheck();
			
			return false;
		});
		
	},
	"showAddRoomList" : function(){
		var _self = this;
		
		// 표시되고 있는 데이터가 있는 경우
		var $target = $('#btn_add_room');
		if ($target.qtip().destroyed == false) {
			$target.qtip('hide');
			return;
		}
		
		// 회의실 추가하기 누르면 qtip레이어가 나와야 함
		var s_date = moment($('#meet_res_date').val() + 'T' + $('#meet_res_stime').val()).utc().format();
		var e_date = moment($('#meet_res_date').val() + 'T' + $('#meet_res_etime').val()).utc().format();
		var req_data = {
			compcd: $('#meet_res_company').val(),
			placecd: $('#meet_res_place').val() != 'all' ? $('#meet_res_place').val() : '',
			floorcd: $('#meet_res_floor').val() != 'all' ? $('#meet_res_floor').val() : '',
			starttime: s_date,
			endtime: e_date
		}
		
		this.onlineOneAPI("getAvailableEndpointList.do", req_data).then(function(data){
			if (data.code == '00') {
				_self.dispAvailRoomList(data.endpointlist);
			} else {
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				console.log(data);
			}
		}, function failFucn(){
			mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
		});
	},
	"dispAvailRoomList" : function(room_list){
		var html = '';
		var disp_cnt = 0;
		var _self = this;
		_self.room_info = {};
		
		html += '<ul>';
		
		$.each(room_list, function(){
			_self.room_info[this.endpointkey] = this;
			// 이미 선택된 회의실은 표시 안함
			var $search = $('#mt_sel_room_list').find('[data-roomkey="' + this.endpointkey + '"]');
			if ($search.length) return true;
			var room_name = this.placenm + ' ' + this.floornm + ' ' + this.endpointnm;
			html += '<li class="room-each" data-roomkey="' + this.endpointkey + '">' + room_name + '</li>';
			disp_cnt++;
		});
		html += '</ul>';
		
		// 예약 가능한 회의실이 없는 경우
		if (disp_cnt == 0) {
			html += '<li class="no-room">' + gap.lang.mt_no_place + '</li>';
		} else {
			html = '<span style="color:#0000ff;font-size:12px;">※ ' + gap.lang.avail_meet_disp + '</span>' + html; 
		}
		
		var $target = $('#btn_add_room');
		$target.qtip({
			style: {
				classes: 'add-room-qtip'
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
                my: 'top center',
                at: 'bottom center',
                adjust: {
					y: 5
				}
            },
            events: {
            	show: function(e, api){
            	
            		// 회의실 선택시 on 클래스 처리
            		$(api.elements.tooltip).find('.room-each').on('click', function(){
            			var roomkey = $(this).data('roomkey');
            			var $search = $('#mt_sel_room_list').find('[data-roomkey="' + roomkey + '"]');
            			
            			if ($(this).hasClass('on')) {
            				// 삭제
            				$search.remove();
            				$(this).removeClass('on');
            			} else {
            				// 추가
            				if ($search.length) {
            					// 이미 추가된 회의실
            				} else {
            					var sel_info = _self.room_info[roomkey];
            					
            					// 방 정보 키를 맞춰서 넘긴다
            					var info = {
            						company: sel_info.compcd,
            						floor: sel_info.floorcd,
            						id: sel_info.endpointkey,
            						name: sel_info.placenm + ' ' + sel_info.floornm + ' ' + sel_info.endpointnm,
            						place: sel_info.placecd
            					};
            					_self.addRoom(sel_info.endpointkey, info.name, info);
            				}
            				$(this).addClass('on');
            			}
            		});
            	},
            	
            	hide: function(e, api){
            		_self.room_info = null;
            		$(api.elements.tooltip).qtip('destroy');
            	}
            }
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
		
		var new_event = this.getNewEvent();
		var $sel_room = $('#mt_sel_room_list .sel-room');
		// 회의실이 여러개 선택된 경우는 전체 회의실 삭제 처리 (해당 시간에 예약이 안될수 있기 때문에 초기화 함)
		if ($sel_room.length > 1) {
			alert(gap.lang.mt_change_time);
			$('#mt_sel_room_list').empty();
			_self.addRoom('empty');

			// 기존에 잡은 데이터 삭제 처리
			if (new_event) {
				this.timeline.removeEvent(new_event);
				return true;
			}
		}
		
		if (!new_event) {
			return true;
		}
		

		
		new_event.start = moment($('#meet_res_date').val() + 'T' + $s_time.val());
		new_event.end = moment($('#meet_res_date').val() + 'T' + $e_time.val());
		this.timeline.updateEvent(new_event);
		
		
		
		var events = this.timeline.getEvents(new_event.start, new_event.end).filter(function (e) { 
			return (e.resource == new_event.resource && e.id !== new_event.id);
		});
		
		var res = true;
		// 겹치는 이벤트가 존재하는지 체크
		if (events.length > 0) {
			new_event.color = this.unavail_color;
			res = false;
		} else {
			new_event.color = this.avail_color;
		}
		
		// 현재 시간 이전으로 잡는 경우
        var start = moment(new_event.start).toDate();
        var today = moment().toDate();
        if (start && start < today) {
        	new_event.color = this.unavail_color;
        	res = false;
        }
		
		this.timeline.updateEvent(new_event);

		return res;
	},
	
	"addRoom" : function(id, text, room_info) {
		var _self = this;
		var html = '';
		
		
		
		
		if (id == 'empty') {
			// 선택된 회의실이 하나도 없을 때 처리
			$('#mt_sel_room_list').empty();
			html = '<span class="room-drag-info">' + gap.lang.mt_alert_5 + '</span>';
			var $room = $(html);
			
			$('#btn_add_room').hide();
		} else {
			
			//중복 체크
			if ($('#mt_sel_room_list').find('[data-roomkey="' + id + '"]').length > 0) {
				return;
			}
			
			if (this.getResMeetingType() == '1') {
				$('#btn_add_room').show();
			}
			
			html = 
				'<span class="sel-room" data-roomkey="' + id + '">' +
					text + '<button class="btn-remove"></button>'
				'</span>';
			var $room = $(html);
			
			$room.on('click', function(){
				var room_key = $(this).data('roomkey');
				_self.openRoomDetailInfo(room_key);
			});
			
			// 정보 셋팅
			$room.data('roominfo', room_info);
			
			// 삭제 버튼 클릭
			$room.find('.btn-remove').on('click', function(){
				var $el = $(this).parent();
				var roomkey = $el.data('roomkey');
				// 기존에 생성해놓은 데이터가 있는 경우 삭제 처리 
        		var events = _self.timeline._events;
        		$.each(events, function(){
        			if (this.temp && this.resource == roomkey) {
        				_self.timeline.removeEvent(this.id);
        			}
        		});
        		
				$el.remove();
				if ($('#mt_sel_room_list span').length == 0) {
					_self.addRoom('empty');
				}
				return false;
			});
		}
		
		$('#mt_sel_room_list').append($room);
		// 스크롤 최하단으로 내리기
		$('#mt_sel_room_list').scrollTop($('#mt_sel_room_list')[0].scrollHeight);
	},
	
	"drawPlaceTimeline" : function(){
		
		function _hasOverlap(args, inst) {
		    var ev = args.event;
		    var events = inst.getEvents(ev.start, ev.end).filter(function (e) { return (!e.temp && e.resource == ev.resource && e.id !== ev.id) });

		    return events.length > 0;
		}
		
		var _self = this;
		var dt = $('#meet_res_date').val();
		var meeting_type = this.getResMeetingType();
		var $def;
		
		if (meeting_type == "1") {
			$def = this.getOnlinePlaceList(dt);
		} else if (meeting_type == "2") {
			$def = this.getMeetingPlaceList(dt);
		} else {
			return;
		}
		
		
		$def.then(function(place_list){
			var resources = [];
			var info = $('.step.n2').data('info');

			// 회의실 리소스 셋팅 
			$.each(place_list, function(){
				resources.push({
					id: this.key,
					name: this.name,
					company: this.company,
					place: this.place,
					floor: this.floor,
					number: this.number || '0',
					video: this.video
				});
			});
			
			// 이벤트 셋팅
			var data = [];
			$.each(place_list, function(){
				var place_key = this.key;
				$.each(this.resdata, function(){
					// 편집 모드인 경우 편집관련된 이벤트 처리
					if (_self.edit_scheduleid == this.scheduleid) { return true; }
					data.push({
						scheduleid: this.scheduleid,
						start: moment(this.starttime).format(),
						end: moment(this.endtime).format(),
						color: (this.confirm == 'A' ? '#eaf722' : ''),	// 승인대기(A)는 노랑색으로 표시
						title: this.title,
						resource: place_key,
						editable: false
					});					
				});
			});
			
			
			// 기존에 선택된 항목이 있는 경우
			if (info) {
				/*
				if (info.roomlist && info.roomlist.length > 1) {
					info.newevent.resource = [];
					$.each(info.roomlist, function(){
						info.newevent.resource.push(this.id);
					});
				}
				*/
				// 현재 표시되는 리스트와 일치하는지 확인한다
				if (info.roomlist && info.roomlist.length > 1) {
					
				} else {
					var $sel_room = $('#mt_sel_room_list').find('.sel-room');
					if ($sel_room.length == 1) {
						// 화면에 표시된 데이터로 뿌려줘야 함
						var roominfo = $sel_room.data('roominfo');
						
						var reserve_data = $.extend({}, info.newevent);
						reserve_data.resource = roominfo.id;
						reserve_data.start = $('#meet_res_date').val() + 'T' + $('#meet_res_stime').val();
						reserve_data.end = $('#meet_res_date').val() + 'T' + $('#meet_res_etime').val();
						data.push(reserve_data);
					}
				}
			}
			
			
			
			
			
			// 예약 가능한 회의실이 없는 경우
			if (resources.length > 0) {
				$('#meet_res_no_place').hide();
			} else {
				$('#meet_res_no_place').show();
			}
			
			if (_self.timeline) {
				_self.timeline.setOptions({resources:resources});
				_self.timeline.setEvents(data);
				_self.timeline.navigate(dt);
				
				// 기존에 선택한 값이 있으면 스크롤 이동 처리
				var $layer = $('#meeting_time');
				var $wrap = $layer.find('.mbsc-timeline-grid-scroll');
				$wrap.scrollTop(0);
    			if (info) {
    				var $r_obj = $layer.find('.f_middle[data-code="' + info.id +'"]').closest('.mbsc-timeline-resource');
    				if ($r_obj.length) {
    					$wrap.scrollTop($r_obj.position().top - 50);    					
    				}
    			}
    			return;
			}
			
			var yesterday = moment().add(-1, 'day');
		    
			// 타임라인 표시
			_self.timeline = $('#meet_res_timeline').mobiscroll().eventcalendar({
				theme: 'ios',
				themeVariant : 'light',
				selectedDate: dt,
				locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
				view : {
					timeline: {
						type: 'day',
						timeCellStep: 30,
						rowHeight: 'equal',
						startTime: '08:00',
				        endTime: '20:00'
					}
				},
				timeFormat: 'h:mmA',
				renderResourceHeader: function () {
		            return '<div class="md-resource-header-template-title">' +
		                '<div class="md-resource-header-template-name">' + gap.lang.mt_th_place + '</div>' +
		                '</div>';
		        },
		        invalid:[{
		            recurring: {
		            	repeat: 'daily',
		            	until: yesterday
		            }
		        },{
		           	start: yesterday,
		           	end: moment()
		        }],
		        
		        renderResource: function(resource){
		        	var html = 
						'<div class="info f_middle rel" data-code="' + resource.id + '">' +
						(resource.video ? 
		        		'	<div class="abs meet_type"></div>' : '') +
		        		'	<span class="room_num">' + resource.name + '</span>' +
		        		'	<div class="room_icon room_map"></div>' +
		        		'	<div class="room_icon room_mem">' + resource.number + gap.lang.mt_seat + '</div>' +
		        		'</div>';
		        	return html;
		        },
		        
		        dragTimeStep: 10,
	        	dragToCreate: true,
	        	dragToMove: true,
		        dragToResize: true,
		        eventDelete: true,
	        	extendDefaultEvent: function(){
	        		return {
	        			color: _self.avail_color,
	        			temp: true,
	        			title: gap.lang.mt_new_meeting
	        		}
	        	},
	        	onEventCreate: function(args, inst){
	        		if (_hasOverlap(args, inst)) {
	        	        mobiscroll.toast({message: gap.lang.mt_alert_4, color: 'danger'});
	        	        return false;
	        	    }
	        		
	        		// 현재 시간 이전으로 잡는 경우
	                var start = moment(args.event.start).toDate();
	                var today = moment().toDate();
	                if (start && start < today) {
	                	mobiscroll.toast({message: gap.lang.mt_alert_4, color: 'danger'});
	                    return false;
	                }
	                
	        		// 기존에 생성해놓은 데이터가 있는 경우 삭제 처리 
	        		var events = inst._events;
	        		$.each(events, function(){
	        			if (this.temp) {
	        				inst.removeEvent(this.id);
	        			}
	        		});
	        		
	        		// 이벤트 만들면 기존 이벤트 삭제하고 새로 생성
	        		$('#mt_sel_room_list').empty();
	        		var resource = inst._resourcesMap[args.event.resource];
	        		_self.addRoom(resource.id, resource.name, resource);
	        		
	        		
	        		var s_time = moment(args.event.start).format('HH:mm');
	        		var e_time = moment(args.event.end).format('HH:mm');
	        		$('#meet_res_stime').val(s_time).material_select();
	        		$('#meet_res_etime').val(e_time).material_select();
	        	},
	        	onEventUpdate: function (args, inst) {
	        	    if (_hasOverlap(args, inst)) {
	        	    	mobiscroll.toast({message: gap.lang.mt_alert_4, color: 'danger'});
	        	        return false;
	        	    }
	        	    
	        	    // 현재 시간 이전으로 잡는 경우
	                var start = moment(args.event.start).toDate();
	                var today = moment().toDate();
	                if (start && start < today) {
	                	mobiscroll.toast({message: gap.lang.mt_alert_4, color: 'danger'});
	                    return false;
	                }

	        	    if (args.event.color != _self.avail_color) {
	        	    	args.event.color = _self.avail_color;
	        	    	inst.updateEvent(args.event);
	        	    }
	        	    var s_time = moment(args.event.start).format('HH:mm');
	        		var e_time = moment(args.event.end).format('HH:mm');
	        		$('#meet_res_stime').val(s_time).material_select();
	        		$('#meet_res_etime').val(e_time).material_select();

	        		// 회의실을 이동한 경우
	        		if (args.event.resource != args.oldEvent.resource) {
	        			$('#mt_sel_room_list').find('[data-roomkey="' + args.oldEvent.resource + '"]').remove();
	        			var resource = inst._resourcesMap[args.event.resource];
	        			_self.addRoom(resource.id, resource.name, resource);
	        		}
	        	},
	        	onEventDelete: function(event, inst){	        		
	        		$('#mt_sel_room_list').find('[data-roomkey="' + event.event.resource + '"]').remove();
	        		if ($('#mt_sel_room_list').find('.sel-room').length == 0){
	        			_self.addRoom('empty');
	        		}
	        	},
	        	onEventClick: function(args, inst){
	        		_self.showMeetingDetail(args);
	        	},
	        	
	        	onInit: function(){
	    			// 기존에 선택된 값이 있으면 스크롤 이동 처리
	        		try {
	        			var info = $('.step.n2').data('info');
	        			if (info) {
	        				var $layer = $('#meeting_time');
	        				var $r_obj = $layer.find('.f_middle[data-code="' + info.id +'"]').closest('.mbsc-timeline-resource');
	        				var $wrap = $layer.find('.mbsc-timeline-grid-scroll');
	        				$wrap.scrollTop($r_obj.position().top - 50);
	        			}	        			
	        		} catch(e){}

	        	},
	        	
	        	onPageLoaded: function(args, inst){
	        		$(inst.base).find('.room_num').on('click', function(){
	        			var room_key = $(this).parent().data('code');
	    				_self.openRoomDetailInfo(room_key);
	        		});
	        	},
	        	
				resources: resources,
				data: data
			}).mobiscroll('getInst');
			

		});
	},
	
	"showAttendeeLayer" : function(el){
		function _validateEmail(email) {
			const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(String(email).toLowerCase());
		}
		
		function _searchUser(is_blur){
			var terms = $.trim($('#txt_attendee').val());
			if (terms == '') return;
			
			var users = terms.split(',');
			  
			if (terms.indexOf('@') != -1 && users.length == 1 && _validateEmail(terms)) {
				// 외부 사용자 입력
				_self.addAttendee({ky:terms});
			} else {
				gsn.requestSearch('', terms, function(res){
					$.each(res, function(){
						_self.addAttendee(this);
					});
					
					if (!is_blur) {
						$('#txt_attendee').focus();						
					}
				});					
			}
			
			$('#txt_attendee').val('');
		}
		
		var _self = this;
		var $el = $(el);
		var html =
			'<div id="meeting_attendee" class="layer_wrap" style="height: 150px;">' +
			'	<div class="layer_inner">' +
			'		<div class="pop_btn_close"></div>' +
			'		<h4>' + gap.lang.mt_att + '</h4>' +
			'		<div class="layer_cont left">' +
			'			<div class="before_select rel">' +
			'				<input type="text" id="txt_attendee" class="input" placeholder="' + gap.lang.mt_ly_att_msg + '">' +
			'				<div class="abs type_icon"></div>' +
			'			</div>' +
			'			<div class="after_select g_w_pop_file_box" style="display:none;">' +
			'				<ul id="meet_res_user_list" class="scroll until p10" style="overflow-y:auto;"></ul>' +
			'			</div>' +
			'		</div>' +
			'		<div class="btn_wr">' +
			'			<button class="btn_layer confirm">' + gap.lang.OK + '</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		this.setLayer(el, html);
		$('#txt_attendee').focus();
		
		var $layer = $('#meeting_attendee');
		
		var info = $el.data('info');
		if (info) {
			$.each(info, function(){
				_self.addAttendee(this);
			});
		}
		
		// 이벤트 처리
		$layer.find('.pop_btn_close').on('click', function(){
			$(this).closest('.step').removeClass('popup');
			$layer.remove();
			_self.hideMeetBlock();
			return false;
		});
		
		// 사용자 입력
		$('#txt_attendee').on('keydown', function(e){
			if (e.keyCode == 13) {
				_searchUser();
			}
		})
		.bind('paste', function(e){
			gap.change_paste_text(e, this);
		});
		
		/*
		// 사용자 입력
		$('#txt_attendee').on('blur', function(e){
			_searchUser(true);
		});
		*/
		
		// 조직도 선택
		$layer.find('.type_icon').on('click', function(){
			gap.showBlock();
			window.ORG.show(
				{
					'title': gap.lang.mt_ly_att_title,
					'single': false,
					'show_ext' : true, // 외부 사용자 표시 여부
					'select': 'person' // [all, team, person]
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length == 0) return;
						for (var i = 0; i < items.length; i++){
							if(typeof items[i] == "undefined" || items[i] == null){
							} else {
								var _res = gap.convert_org_data(items[i]);
								_self.addAttendee(_res);
							}
						}
					},
					onClose: function(){
						gap.hideBlock();
					}
				}
			);
		});
		
		
		// 확인
		$layer.find('.confirm').on('click', function(){
			if ($('#txt_attendee').val().trim() != ""){
				_searchUser();
				return false;
			}
			if ($('#meet_res_user_list li').length == 0) {
				mobiscroll.toast({message:gap.lang.mt_alert_7, color:'danger'});
				return false;
			}
			
			_self.selectAttendee();
			$layer.find('.pop_btn_close').click();
			if (!$('.step.n4').hasClass('on')) {
				$('.step.n4').click();
			}
			
			_self.finishCheck();
			return false;
		});
	},
	
	"addAttendee" : function(user_info, is_external){
		var $list = $('#meet_res_user_list');
		var ck = $list.find('li[data-key="' + user_info.ky + '"]');
		if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
		
		if (user_info.ky == gap.userinfo.rinfo.ky) {
			mobiscroll.toast({message:gap.lang.mt_alert_2, color:'danger'});
			return;
		}
		
		var disp_txt = '';
		if (user_info.ky.indexOf('@') != -1){
			disp_txt = user_info.ky;
		} else {
			user_info = gap.user_check(user_info);
			disp_txt = '<a onclick="gap.showUserDetailLayer(\'' + user_info.ky + '\')">' + user_info.name + ' ' + user_info.jt + ' | ' + user_info.dept + '</a>';
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
	
	"selectAttendee" : function(){
		var $el = $('.step.n3');
		var $list = $('#meet_res_user_list');
		
		if ($list.find('li').length == 0) {
			// 참여인원이 없는 경우
			$el.removeData('info');
			$el.removeClass('on');
			$el.find('.cont').html($el.find('.cont').data('txt'));
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
			$el.addClass('on');
			$el.data('info', user_list);
			$el.find('.cont').html(html);
			
		}
	},
	
	"showTitleLayer" : function(el){
		var _self = this;
		var $el = $(el);
		var html =
			'<div id="meeting_title" class="layer_wrap" style="height: 438px;">' +
			'	<div class="layer_inner">' +
			'		<div class="pop_btn_close"></div>' +
			'		<h4>' + gap.lang.mt_title + '</h4>' +
			'		<div class="layer_cont meet_tit">' +
			'			<div>' +
			'				<span class="item_tit">' + gap.lang.mt_th_title + '</span>' +
			'				<div class="type_list_wr rel">' +
			'					<input type="text" id="meet_res_title" placeholder="' + gap.lang.mt_ly_title_ph + '">' +
			'				</div>' +
			'			</div>' +
			'			<div>' +
			'				<span class="item_tit">' + gap.lang.mt_ly_body + '</span>' +
			'				<div class="type_list_wr rel">' +
			'					<textarea id="meet_res_body" placeholder="' + gap.lang.mt_ly_body_ph + '"></textarea>' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'		<div class="btn_wr">' +
			'			<button class="btn_layer confirm">' + gap.lang.OK + '</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		this.setLayer(el, html);
		
		var $layer = $('#meeting_title');
		
		var info = $el.data('info');
		if (info) {
			$('#meet_res_title').val(info.title);
			$('#meet_res_body').val(info.body);
		}
		
		$('#meet_res_title').focus();
		
		// 이벤트 처리
		$layer.find('.pop_btn_close').on('click', function(){
			$(this).closest('.step').removeClass('popup');
			$layer.remove();
			_self.hideMeetBlock();
			return false;
		});
		
		$layer.find('.confirm').on('click', function(){
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
			
			var res_html = '<span>' + _title + '</span><span>' + _body + '</span>';
			$el.find('.cont').html(res_html);
			$el.addClass('on');
			
			$layer.find('.pop_btn_close').click();
			
			_self.finishCheck();
			
			return false;
		});
	},
	
	"createMeeting" : function(is_update){
		var _self = this;
		
		_self.showLoading();
		
		var _record = this.getResMeetingRecord();
		var _mailnoti = this.getResMeetingMailNoti();
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
			
			this.meetingOneAPI(req_nm, req_data).then(function(data){
				if (data.code == '1') {
					mobiscroll.toast({message:gap.lang.mt_alert_9, color:'info'});
					_self.createMeetingComplete(is_today, is_update, data.reserveId);
				} else {
					//mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
					mobiscroll.toast({message:data.message, color:'danger'});
					console.log(data);
				}
				_self.hideLoading();
			}, function failFucn(){
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				_self.hideLoading();
			});
			
		} else {
			var users = [];
			var realtime = 'F';
			$.each(_user, function(){
				users.push({id:this+''});
			});
			
			var $el = $('#meeting_head').find('.step.n1');
			if ($el.hasClass('on')) {
				realtime = $el.data('realtime'); 
			}
			
			
			// 화상회의 예약
			var req_data = {
				type: (is_update ? 'U' : 'C'),
				scheduletype: (res_meet_type == '1' ? '1' : '0'),
				scheduleid: (is_update ? this.edit_scheduleid : ''), 
				title: _title,
				starttime: moment(_start).utc().format('YYYY-MM-DD[T]HH:mm:00[Z]'),
				endtime: moment(_end).utc().format('YYYY-MM-DD[T]HH:mm:00[Z]'),
				recordingyn: _record,
				//remindyn: _mailnoti ? 'Y' : 'N',
				remindtime: (_mailnoti == false ? '' : _mailnoti),
				timezone: moment().format('Z'),
				partylist : users,
				dswid: '',
				contents: _body
			};
			
			if (realtime == 'T') {
				req_data.scheduletype = '3'; // 즉시 미팅으로 회의가 잡힌 경우 scheduletype을 3으로 넘김
			}
			if (res_meet_type == '1') {
				
				// 복수로 선택되었는지 확인한다다
				var _roomlist = _self.getResMeetingCodeList();
				var req_list = [];
				$.each(_roomlist, function(){
					req_list.push({
						endpointkey:this.id
					});
				});
				
				//req_data.endpointlist = [{endpointkey:_code}];
				req_data.endpointlist = req_list;
				
			}
			
			this.onlineOneAPI("scheduleinterface.do", req_data).then(function(data){
				if (data.code == '00') {
					mobiscroll.toast({message:gap.lang.mt_alert_9, color:'info'});
					_self.createMeetingComplete(is_today, is_update, data.scheduleid);
				} else {
					//mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
					mobiscroll.toast({message:data.message, color:'danger'});
				}
				_self.hideLoading();
			}, function failFucn(){
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				_self.hideLoading();
			});
			
		}
	},
	
	"createMeetingComplete" : function(is_today, is_update, scheduleid){
		var _self = this;
		
		// 워크방에서 넘어온 경우 업무대화방 호출
		if (this.work_info) {
			var meet_type = this.getResMeetingType();
			var title = this.getResMeetingTitle();
			var content = '"' + title + '" ' + gap.lang.req_meeting;
			
			var work_nm = this.work_info.channel_name;
			gap.send_work_msg(this.work_info.channel_code, this.work_info.channel_name, content, meet_type, scheduleid);

			var ch_key = this.work_info.channel_code;
			
			this.work_info = null;

			// 작성중이던 워크방으로 다시 이동할지 물어본다
			gap.showConfirm({
				title: gap.lang.move_channel,
				contents: '<span>' + work_nm + '</span><br>' + gap.lang.move_workroom,
				callback: function(){
					gap.move_channel_list(ch_key);
				}
			});
		}		
		
		this.initHeader();
		
		if ($('#meeting_body').html() == '') {
			this.initBody();
		} else {
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
		}
		
		if (is_update) {
			$('#meeting_body').show();
			_self.edit_scheduleid = '';
		}
	},
	
	"meetingCancel" : function(schedule_id, callfrom){
		var req_nm = "cancel.open";
		var req = {
			reserveId: schedule_id
		};
		
		return this.meetingOneAPI(req_nm, req).then(function(data){
			if (data.code == '1') {
				data.req_result = 'ok';
				if (callfrom != 'work') {
					mobiscroll.toast({message:gap.lang.mt_alert_10, color:'info'});					
				}
			} else {
				data.req_result = 'error';
				if (callfrom != 'work') {
					mobiscroll.toast({message:data.message, color:'danger'});					
				}
			}
			return data;
		});
	},
	
	// 화상회의 지점정보 가져오기
	"getOnlinePlaceList" : function(dt){
		if (!dt) dt = moment().format('YYYY-MM-DD');
		var req_nm = "getEndpointList.do";
		var s_date_str = dt + 'T00:00:00';
		var e_date_str = moment(s_date_str).add(1, 'day');
		
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
		return this.onlineOneAPI(req_nm, req).then(function(data){			
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
		
		return this.onlineOneAPI(req_nm, req).then(function(data){
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
					record: info.recordingyn == 'Y' ? true : false,
					//mail_noti: info.remindyn =='Y' ? info.remindtime : false,
					mail_noti: info.remindtime ? info.remindtime : false,
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
						floor: ep.floorcd
					};
					res.newevent.resource = ep.endpointkey;
					
					// 장비여러대인 경우 roomlist 셋팅
					var room_info = [];
					$.each(info.endpointlist, function(){
						room_info.push({
							id: this.endpointkey,
							name: this.compnm + ' ' + this.placenm + ' ' + this.floornm + ' ' + this.endpointnm,
							company: this.compcd,
							place: this.placecd,
							floor: this.floorcd
						});
					});
					res.roomlist = room_info;
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
				}
				
				res.realtime = info.scheduletype == '3' ? true : false;
				res.owner_id = info.schedulerid;
				res.owner_nm = info.schedulernm;
				res.owner_dept = info.schedulerdept;
				
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
		
		return this.onlineOneAPI(req_nm, req).then(function(data){
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
					repeat		: false,
					endpoint_nm	: ep.endpointnm || '',
					endpoint_key: ep.endpointkey || '',
					floor_nm	: ep.floornm || '',
					place_nm	: ep.placenm || '',
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
	"onlineCancel" : function(schedule_id, callfrom){
		var req_nm = "scheduleinterface.do";
		var req = {
			type: "D",
			scheduleid: schedule_id
		};
		
		return this.onlineOneAPI(req_nm, req).then(function(data){
			if (data.code == '00') {
				data.req_result = 'ok';
				if (callfrom != 'work') {
					mobiscroll.toast({message:gap.lang.mt_alert_10, color:'info'});					
				}
			} else {
				data.req_result = 'error';
				//mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				if (callfrom != 'work') {
					mobiscroll.toast({message:data.message, color:'danger'});
					console.log('화상회의 API 호출 오류 : ' + req_nm, data);		
				}
			}
			return data;
		});
	},
	

	// 화상회의 API - for KMSLab
	"onlineOneAPI" : function(req_name, req){
		
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
			type: 'GET',
			url: root_path + '/json/' + req_name + '.json',
	//		data: JSON.stringify(req),
	//		contentType: 'application/json',
	//		dataType: 'json',
			success: function(res){
				
			},
			error: function(err){
				console.log(err);
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
	"getMeetingPlaceList" : function(dt){
		
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
						secret: (data.secretAt == 'Y' ? true : false),
						confirm: data.confirm,
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
	
		var req = {
			//date: moment(dt).format('YYYYMMDD'),
			gmtDate: moment(moment(dt).format('YYYY-MM-DDT00:00:00Z')).utc().format(),
			placeCode: $('#meet_res_company').val(),
			floorCode: place_code == 'all' ? '' : place_code,
			subCode: floor_code == 'all' ? '' : floor_code
		};
		
		var $def = $.Deferred();
		this.meetingOneAPI("room_list.open", req).then(function(data){
			// 1.전체 회의실 목록 가져오기
			var resources = [];
			$.each(data.result, function(){
				// 권한 있는 경우만 리소스 표시
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
			
			// 2.예약된 회의 일정 가져오기
			_self.meetingOneAPI("reserve_list.open", req).then(function(data2){
				$.each(data2.result, function(){
					_addReserveData(resources, this);
				});
				$def.resolve(resources);
			});
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
		
		return this.meetingOneAPI(req_nm, req).then(function(data){
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
					record: false,
					mail_noti: false,
					title: info.title,
					partylist: [],
					body: info.contents.replace(/<br>/g, '\n')
				}
				
				// 장비 정보가 있으면 설정
				res.endpoint = {
					id: info.roomCode,
					name: info.place + ' ' + info.floor + ' ' + info.sub + ' ' + info.room,
					company: info.placeCode,
					place: info.floorCode,
					floor: info.subCode
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
		
		return this.meetingOneAPI(req_nm, req).then(function(data){
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
				
				list.push({
					scheduleid	: this.reserveId, 
					type		: '2',	// 1: 회의+화상, 2:회의, 3:온라인화상
					realtime	: false,
					title		: this.title,
					contents	: this.mtgCn,
					owner_id	: this.writerId,
					owner_nm	: this.writer,
					owner_dept	: this.dept,
					starttime	: this.startGmt,
					endtime		: this.endGmt,
					endpoint_nm	: this.room,
					endpoint_key: this.roomCode,
					floor_nm	: this.sub,
					place_nm	: this.floor,
					repeat		: this.repetitionAt == 'Y' ? true : false,
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
	
	// 회의실예약 API - for KMSLab
	"meetingOneAPI" : function(req_name, req){
		var url = root_path + '/json/' + req_name + '.json';
		var token = gap.get_auth();
		
		// 회의예약 PUT, DELETE를 POST로 변경하기로 함 (외부에서 요청들어노는 문제 때문에)
		var method = '';
		if (req_name == 'reserve.open'){
			method = 'POST';
		} else if (req_name == 'update.open'){
			//method = 'PUT';
			method = 'POST';
		} else if (req_name == 'cancel.open'){
			//method = 'DELETE';
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
	
	// 회의실예약 API
	"meetingAPI" : function(req_name, req){
		var url = '/rezmanager/openapi/meeting/' + req_name;
		var token = gap.get_auth();
		
		// 회의예약 PUT, DELETE를 POST로 변경하기로 함 (외부에서 요청들어노는 문제 때문에)
		var method = '';
		if (req_name == 'reserve.open'){
			method = 'POST';
		} else if (req_name == 'update.open'){
			//method = 'PUT';
			method = 'POST';
		} else if (req_name == 'cancel.open'){
			//method = 'DELETE';
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
	
	"showLoading" : function(){
		this.hideLoading();
		this.show_loading = setTimeout(function(){
			gap.show_loading(gap.lang.processing);
		}, 200);
	},
	
	"hideLoading" : function(){
		clearTimeout(this.show_loading);
		gap.hide_loading();
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
	            '	<h4 title="' + _title + '">' + _title + '</h4>' +
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
	            			gap.showUserDetailLayer(user_id);
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
	            			gap.showUserDetailLayer($(this).data('key'));
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
		var lang = window.userlang == 'ko' ? 'ko' : 'en';
		var room_url = '/rezmanager/uss/mtg/selectMtgPlacePopup.do?trgetId=' + roomkey + '&lang=' + lang;
		gap.open_subwin(room_url, 1000, 800);
	},
	
	"finishCheck" : function(){
		var _self = this;
		var $btn_wrap = $('#btn_meet_create').parent();
		
		/*
		// 입력 값을 다 채우지 않은 경우 return 처리
		if ($('.step.on').length != 4) {
			return;
		}
		*/
		
		// 참여 인원은 설정하지 않아도 예약 잡히도록 예외처리
		if (!$('.step.n1').hasClass('on') || 
			!$('.step.n2').hasClass('on') ||
			!$('.step.n4').hasClass('on')) {
			return;
		}
	
		
		// 처음으로 4개 등록한 경우
		if (!$btn_wrap.hasClass('finish')) {
			$btn_wrap.addClass('finish');
			
			// 수정이 아닌 경우만 자동 컨펑창 표시
			if (!$btn_wrap.hasClass('save')) {
				this.saveConfirm();
			}
		}
	},
	
	"saveConfirm" : function(){
		var _self = this;
		var $btn_wrap = $('#btn_meet_create').parent();
		var is_save = $btn_wrap.hasClass('save');
		
		// 사용자 정보
		var userdata = $('.step.n3').data('info');
		var user_html = '';
		if (userdata) {
			if (userdata.length > 1) {
				if (userdata[0].nm) {
					user_html = userdata[0].nm;
				} else {
					user_html = userdata[0].ky;
				}
				user_html += ' ' + gap.lang.other + ' ' + (userdata.length - 1) + gap.lang.myung;
			} else if (userdata.length == 1) {
				if (userdata[0].nm) {
					user_html = userdata[0].nm;
				} else {
					user_html = userdata[0].ky;
				}
			} else {
				user_html = '-';
			}
		} else {
			user_html = '-';
		}
		
		// 회의명
		var title_html = gMet.getResMeetingTitle();
		
		//var html = (is_save ? '회의를 수정 하시겠습니까?' : '신규 회의를 생성 하시겠습니까?') + '<br>';
		var html = '';
		html += gap.lang.mt_type + '<br>' + $('.step.n1 .cont').html() + '<br><br>';
		html += gap.lang.mt_place + '<br>' + $('.step.n2 .cont').html() + '<br><br>';
		html += gap.lang.mt_att + '<br>' + user_html + '<br><br>';
		html += gap.lang.mt_th_title + '<br>' + title_html;
					
		gap.showConfirm({
			title: gap.lang.mt_new_create,
			contents: html,
			callback: function(){
				_self.createMeeting(is_save);
			}
		});
	},
	
	"showMeetingDetailLayer" : function(meeting_type, scheduleid){
		
		var _self = this;
		
		var detail_def = $.Deferred();
		
		gap.showBlock();
		
		scheduleid = scheduleid + '';
		// 상세 정보를 불러와서 뿌려준다다
		if (meeting_type == '2') {
			// 대면회의
			detail_def = this.getMeetingDetail(scheduleid);
		} else {
			// 화상회의,  온라인 미팅
			detail_def = this.getOnlineDetail(scheduleid);
		}
		
		detail_def.then(function(data){
			if (data.error) {
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				gap.hideBlock();
				return;
			}
			
			_self.genMeetingDetailHtml(data);
		}, function(){
			mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
			gap.hideBlock();
		});
	},
	
	"genMeetingDetailHtml" : function(data){
		var sche_type;
		if (data.type == '1'){
			sche_type = gap.lang.mt_type_1;
		} else if (data.type == '2'){
			sche_type = gap.lang.mt_type_2;
		} else {
			sche_type = gap.lang.mt_type_3;
		}		
		
		$('#meeting_detail_layer').remove();
		
		
		var html = 
			'<div id="meeting_detail_layer" class="meeting-detail-layer">' +
			'	<div class="header-area">' +
			'		<div class="title">' + data.title + '</div>' +
			'		<div class="btn-close"><span></span><span></span></div>' +
			'	</div>' +
			'	<div class="content">' +
			'		<div class="label-background"></div>' +
			'		<div class="table-wrap">' +
			'			<table>' +
			'				<tbody>' +
			'					<tr><td>' + gap.lang.type + '</td><td>' + sche_type + '</td></tr>';

		// 주최자
		var owner_info = data.owner_nm + '/' + data.owner_dept; 
		html += '<tr><td>' + gap.lang.mt_th_owner + '</td><td><span class="owner-info" data-key="' + data.owner_id + '">' + owner_info + '</span></td></tr>';
		
		// 날짜
		var s_date = moment(data.newevent.start);
		var e_date = moment(data.newevent.end);
		var date_info;
		if (s_date.format('YYYYMMDD') == e_date.format('YYYYMMDD')) {
			date_info = s_date.format('YYYY.MM.DD[(]ddd[)]') + ' ' + s_date.format('HH:mm') + ' ~ ' + e_date.format('HH:mm'); 
		} else {
			date_info = s_date.format('YYYY.MM.DD[(]ddd[)]') + ' ' + s_date.format('HH:mm');
			date_info += '~' + e_date.format('YYYY.MM.DD[(]ddd[)]') + ' ' + e_date.format('HH:mm');
		}
		html += '<tr><td>' + gap.lang.notice_period + '</td><td>' + date_info + '</td></tr>';
		
		//회의실		
		if (data.roomlist) {
			html += 
			'<tr>' +
			'	<td>' + gap.lang.mt_th_place + '</td>' +
			'	<td style="padding-left:15px;">' +
			'		<ul class="place-contents">';
			
			$.each(data.roomlist, function(){
				html += '<li class="place-info" data-key="' + this.id + '">' + this.name + '</li>';
			});
			
			html +=
			'		</ul>' +
			'	</td>' +
			'</tr>';
		} else if (data.endpoint) {
			// endpoint
			html += 
				'<tr>' +
				'	<td>' + gap.lang.mt_th_place + '</td>' +
				'	<td style="padding-left:15px;">' +
				'		<ul class="place-contents">' +
				'			<li class="place-info" data-key="' + data.endpoint.id + '">' + data.endpoint.name + '</li>' +
				'		</ul>' +
				'	</td>' +
				'</tr>';
		}
		
		
		// 참여인원
		if (data.partylist.length > 0) {
			html += 
			'<tr>' +
			'	<td>' + gap.lang.mt_att + '</td>' +
			'	<td style="padding-left:15px;">' +
			'		<ul class="attendee-contents">';
			
			$.each(data.partylist, function(){
				var userinfo;
				var is_ext = false;
				if (this.ky.indexOf('@') != -1) {
					// 외부
					is_ext = true;
					userinfo = '<span class="external-user">' + this.ky + '</span>';
				} else {
					// 내부
					var trans_info = gap.user_check(this);
					userinfo = '<span class="user-name">' + trans_info.name + '</span>' + ' ' + trans_info.jt + '/' + trans_info.dept + '/' + trans_info.company;
				}
				html += '<li class="attendee-info' + (is_ext ? ' external' : '') + '" data-key="' + this.ky + '">' + userinfo + '</li>';
			});
			
			html +=
			'		</ul>' +
			'	</td>' +
			'</tr>';
		}
		
		
		var body = '';
		var is_owner = (data.owner_id == gap.userinfo.rinfo.ky);
		// if (is_owner && data.hostkey) {
		if (data.hostkey) {	// 주최자 여부 상관없이 모두 표시
			body += '미팅 번호 (Meeting Number) : <b>' + data.meetingkey + '</b><br>';
			body += '호스트 키 (Host Key) : <b>' + data.hostkey + '</b>';
		}
		if (data.body) {
			if (body != '') body += '<hr style="margin:10px 0;">';
			body += $.trim(data.body).replace(/\n/g, '<br>');
		}
		
		// 내용
		if (body != '') {
			html += '<tr><td>' + gap.lang.basic_content + '</td><td style="padding:15px 0 0 15px;"><div class="table-contents">' + body + '</div></td></tr>';			
		}
		
		
		
		// 버튼 영역
		//html += '<tr><td>' + gap.lang.mt_th_online + '</td><td style="padding:15px 0 0 15px;">';
		html += '<tr><td></td><td style="padding:15px 0 10px 15px;">';
		// 화상회의 (화상참여)
		if (data.type == '1' || data.type == '3') {
			html += '<button class="btn-online-enter">' + gap.lang.mt_online_enter + '</button>';
		}
		// 업무협의
		html += '<button class="btn-work-start">' + gap.lang.start_work + '</button></td></tr>';
		
			
		html +=
			'				</tbody>' +
			'			</table>' +
		
			'		</div>'	+	// table-wrap
			'	</div>'	+ // content
			'</div>';
		
		
		var $layer = $(html);		
		$layer.find('.btn-close').on('click', function(){
			$('#meeting_detail_layer').remove();
			gap.hideBlock();
		});
		
		var z_idx = gap.maxZindex() + 1;
		$layer.css('z-index', z_idx);
		
		$('body').append($layer);
		
		this.meetingDetailEvent(data);
	},
	
	"meetingDetailEvent" : function(data){
		var _self = this;
		var $layer = $('#meeting_detail_layer');
				
		// 주최자
		$layer.find('.owner-info').on('click', function(){
			var userkey = $(this).data('key');
			gap.showUserDetailLayer(userkey);
		});
		
		// 참석자
		$layer.find('.attendee-info').on('click', function(){
			if ($(this).hasClass('external')) return false;
			var userkey = $(this).data('key');
			gap.showUserDetailLayer(userkey);
		});
		
		// 회의실
		$layer.find('.place-info').on('click', function(){
			var roomkey = $(this).data('key');
			_self.openRoomDetailInfo(roomkey);
		});

		// 화상참여
		if (this.onlineTimeCheck(data.newevent) == 'before') {
			$layer.find('.btn-online-enter').prop('disabled', true);
			$layer.find('.btn-online-enter').parent().append('<span class="online-enter-info">※ ' + gap.lang.meeting_time_limit + '</span>');
		}		
		$layer.find('.btn-online-enter').on('click', function(){
			var status = _self.onlineTimeCheck(data.newevent);
			if (status == 'over') {
				mobiscroll.toast({message:gap.lang.mt_over_time, color:'danger'});
			} else {
				window.open(data.meetingurl);
			}
		});
		
		// 업무 협의
		$layer.find('.btn-work-start').on('click', function(){
			var userlist = [];
			
			// 주최자 정보
			userlist.push($layer.find('.owner-info').data('key'));
			
			// 참석자 정보
			$.each($layer.find('.attendee-info'), function(){
				if ($(this).hasClass('external')) return true;
				userlist.push($(this).data('key'));
			});
			
			gHome.quickWorkStart(userlist);			
			$layer.find('.btn-close').click();
		});
		
		
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
	
	"callMeetingRemove" : function(scheduleid){
		// 다른 화면에서 지우는 경우
		var _self = this;
		
		var cancel_promise;
		if (scheduleid.indexOf('RESVE') != -1) {
			// 회의실 예약
			cancel_promise = _self.meetingCancel(scheduleid, 'work');
		} else {
			// 온라인 예약
			cancel_promise = _self.onlineCancel(scheduleid, 'work');
		}
		
		return cancel_promise;
	}
	
}

































