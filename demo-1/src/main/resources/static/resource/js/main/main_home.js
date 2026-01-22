function gBodyHome(){
	this.minical = null;
	this.maincal = null;
	this.sidecal = null;
	this.daycal = null;
	this.minical_req_month = null;
	this.minical_req_day = null;
	
	this.req_status = null;	// 상태값 받아오는 ajax 요청
	this.res_status = {}; // 날짜별 상태값 저장
	
	this.side_req_status = null;
	
	this.color_work = '#fdf5d9';
	this.color_private = '#ffeae7';
	this.preview_qtip = null;
	this.preview_req = null;	// 미리보기 요청
	this.task_dragging = false;
	this.hover_date = null;
	this.caldbpath = "/" + mailfile.split('/')[0] + "/cal/calendar.nsf";
	this.share_cal = []; // 공유 캘린더
	this.sub_cal = [];	// 구독 캘린더
	this.cal_defs = [];	// 공유, 구독 캘린더 가져올 때 Deferred 배열
	this.cal_data = []; // 공유, 구독 캘린더의 데이터
	this.cal_config = {};	// 캘린더 환경설정
	this.portlet_info = {type: 'calendar', data: []};
	
	this.delete_file_list = [];
	this.select_doc_info = "";
	//여기서 달력들이 초기화 되야 함
	if ($('#mini_cal').mobiscroll('getInst').destroy) {
		$('#mini_cal').mobiscroll('getInst').destroy();
	}
	if ($('#main_cal').mobiscroll('getInst').destroy) {
		$('#main_cal').mobiscroll('getInst').destroy();
	}
	if ($('#day_cal').mobiscroll('getInst').destroy) {
		$('#day_cal').mobiscroll('getInst').destroy();
	}
} 

gBodyHome.prototype = {
	"init" : function(){
		moment.defineLocale('ko-kr', {parentLocale:'ko'});
		moment.updateLocale('ko-kr', {
		    meridiem: function(h, m){
				return (h < 12 ? '오전' : '오후');
	    	}
		});
		
		// 언어에 따라 moment locale 설정
		if (window.userlang == 'ko') {
			moment.locale('ko-kr');			
		} else {
			moment.locale('en');			
		}
		
		gap.cur_window = 'boxmain';
		
		$("#main_content").show();
		
		$("#left_main").hide();
		$("#main_body").hide();
		$("#right_menu").hide();
		
		this.drawMain();
		
	},
	
	"drawMain" : function(){
		var _self = this;
				
		// 메인 타입 설정
		if (localStorage.getItem('main_type') == '1') {
			// Type2 없애고 강제로 Type1로 전환 (23.5.25)
			gap.write_log_box('main_type_change', 'Type2에서 1로 강제변경한 사용자', 'button', 'pc');
			localStorage.setItem('main_type', '2');
			$('#main_content').addClass('type-detail');
		} else {
			$('#main_content').addClass('type-detail');
		}
		
		
		// 사용자의 정보를 먼저 가져오고..
		var is_first = false;
		
		$.ajax({
			async: false,
			type: "POST",
			url: gap.channelserver + "/portlet_person_list.km",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
			},
			success: function(res){
				var data = res.data.data;
				var my_data = data;
				
				if (!my_data.type) {
					// 기본값 셋팅
					my_data = {type: 'calendar', data: []};
					is_first = true;
				}
				
				_self.portlet_info = my_data;
			},
			error: function(){
				// 에러 발생시 기본값
				var my_data = {type: 'calendar', data: []};
				_self.portlet_info = my_data;
				
				console.error('portlet_person_list.km 데이터 호출 오류');
			}
		});
		
		
		// 버튼 이벤트 처리		
		this.initBtnFloating();

		this.cal_load_complete = $.Deferred();
		this.initOtherCal();
		this.initPopup(null, null, 'main');
		this.initMain();
		this.initTask();
		
		
		
		this.loadPortlet();
		this.initSideCal();
		

		
		// 첫 접속시에는 사용방법을 뿌려준다 
		if (is_first) {
			// 1. 매뉴얼 표시
			var is_saw = localStorage.getItem('saw_main_help_real');
			if (is_saw != 'T') {
				gap.write_log_box('main_set_help', '메인설정 도움말', 'layer', 'pc');
				this.showMainSettingManual();				
			}
		}
		
		/*
		f (_self.portlet_info.type == 'calendar') {
			this.cal_load_complete = $.Deferred();
			this.initOtherCal();
			this.initPopup(null, null, 'main');
			this.initMain();
			this.initTask();
		} else {
			this.loadPortlet();
		}
		*/
	
	},
	
	"popupRefresh" : function(){
		var _self = this;
		if (!$('#main_popup').is(':visible')) return;
		this.initPopup(_self.popup_obj, _self.popup_dt);
	},
	
	/**
	 * @param req_obj : 확인하려는 사용자의 메일파일 정보
	 * - key : 사용자의 ky값
	 * - id : 사용자의 notesid
	 * - dept : 사용자의 부서
	 * - duty : 사용자 직책
	 * - name : 사용자 이름
	 * - mailFile : 확인하려는 사용자의 mailfilepath
	 * @param req_dt : 표시할 일자 빈 값이면 오늘로 표시
	 * @param callfrom : 호출하는 화면 main: 메인 화면, 
	 * @return
	 */
	"initPopup" : function(req_obj, req_dt, callfrom){
		var _self = this;
		var img_html = '';
		
		_self.popup_obj = req_obj;
		_self.popup_dt = req_dt;

		if (req_obj) {
			// 다른 사용자 정보
			var photo_src = gap.person_photo_url({cpc:req_obj.key.substring(0,2), ky:req_obj.key});
			img_html = 
				'<div class="user-info-wrap" onclick="gap.showUserDetailLayer(\'' + req_obj.key + '\')">' +
				'	<div class="user-thumb">' +
				'		<img src="' + photo_src + '" onerror="this.onerror=null; this.src=\'../resource/images/none.jpg\'">' +
				'	</div>' +
				'	<div class="user-dept-wrap">' +
				'		<span class="user-dept">' + req_obj.dept + '</span>' +
				'		<span class="user-name">' + req_obj.name + ' ' + req_obj.duty + '</span>' +
				'	</div>' +
				'</div>';
		} else {
			// 내 정보
			var photo_src = gap.person_photo_url({cpc:gap.userinfo.rinfo.cpc, ky:gap.userinfo.rinfo.ky});
			img_html = 
				'<div class="user-info-wrap" onclick="gap.showUserDetailLayer(\'' + gap.userinfo.rinfo.ky + '\')">' +
				'	<div class="user-thumb">' +
				'		<img src="' + photo_src + '" onerror="this.onerror=null; this.src=\'../resource/images/none.jpg\'">' +
				'	</div>' +
				'	<div class="user-dept-wrap">' +
				'		<span class="user-dept">Me</span>' +
				'		<span class="user-name">' + gap.userinfo.rinfo.nm + '</span>' +
				'	</div>' +
				'</div>';
		}
		
		if (callfrom == 'main') {
			var disp_date = localStorage.getItem('main_popup');
			if (moment().format('YYYY-MM-DD') == disp_date) return;
			
			// 레이아웃 변경 도움말이 떠있을 수 있기 때문에 예외처리
			if ($('#blockui').is(':visible')) return;
			if (_self.portlet_info && _self.portlet_info.type != 'calendar')  return;
		}
		
		// HTML 생성
		var html = 
			'<div id="main_popup" class="main-popup">' +
			'	<div class="inner">' +
			'		<div class="title-wrap">' + img_html +
			'			<div class="title-right">' +
			'				<h3 id="main_popup_title"></h3>' +
			'				<div class="priority-info-wrap">' +
			'					<ul class="priority-info">' +
			'						<li class="first"><span class="circle"></span>1st</li>' +
			'						<li class="second"><span class="circle"></span>2nd</li>' +
			'						<li class="third"><span class="circle"></span>3rd</li>' +
			'						<li class="fourth"><span class="circle"></span>4th</li>' +
			'					</ul>' +
			'				</div>' +
			'			</div>' +
			//'			<div class="btn-close"><span></span><span></span></div>' +
			'		</div>' +
			'		<div class="content-wrap">' +
			'			<div class="content-work-wrap"></div>' +
			'			<div class="content-private-wrap"></div>' +
			'		</div>' +
			'		<div class="btn-wrap">' +
			'			<button id="btn_main_popup_close" class="btn-popup">' + gap.lang.OK + '</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		
		$('#main_popup').remove();
		var $layer = $(html);
		$('body').append($layer);
				
		function _eventTemplate($list, event) {
			var disp_dt = '';
			
			// 메인 팝업에서 호출된걸 표시
			event.source = 'popup';
			
			if (event.allday) {
				if (dt.format('YYYYMMDD') != moment(event.start).format('YYYYMMDD') ||
					dt.format('YYYYMMDD') != moment(event.end).format('YYYYMMDD')) {
					disp_dt = moment(event.start).format('M.D[(]ddd[)]') + ' ~ ' + moment(event.end).format('M.D[(]ddd[)]') + ' ' + gap.lang.allday;
				} else {
					//disp_dt = 'All day';
					disp_dt = moment(event.start).format('M.D[(]ddd[)]') + ' ' + gap.lang.allday;
				}
			} else {
				if (dt.format('YYYYMMDD') != moment(event.start).format('YYYYMMDD') ||
					dt.format('YYYYMMDD') != moment(event.end).format('YYYYMMDD')) {
					disp_dt = moment(event.start).format('M.D LT') + ' ~ ' + moment(event.end).format('M.D LT');
				} else {
					disp_dt = moment(event.start).format('LT') + ' ~ ' + moment(event.end).format('LT');
				}
			}
			
			/*
			var priority = '';
			if (event.priority == '1') {
				priority = '<span class="priority first"></span>';
			} else if (event.priority == '2') {
				priority = '<span class="priority second"></span>';
			} else if (event.priority == '3') {
				priority = '<span class="priority third"></span>';
			} else if (event.priority == '4') {
				priority = '<span class="priority fourth"></span>';
			}
			*/
			var priority = '';
			if (event.priority == '1') {
				priority = 'first';
			} else if (event.priority == '2') {
				priority = 'second';
			} else if (event.priority == '4') {
				priority = 'fourth';
			} else {
				// 디폴트는 3순위
				priority = 'third';
			}
			
			var btn_quick = '';
			
			var work_user_list = [];
			// todo이고, owner와 나의 정보가 맞지 않으면 업무 시작하기 표시
			if (event.system_code == 'todo') {
				var user_info = new NotesName(event.owner);
				if (gap.userinfo.rinfo.ky != user_info.orgUnit1) {
					work_user_list.push(event.owner);		
				}
			}

			// 주최자 정보가 있으면 업무 협의 버튼 표시
			if (event.chair != '') {
				var user_info = new NotesName(event.chair);
				if (gap.userinfo.rinfo.ky != user_info.orgUnit1) {
					work_user_list.push(event.chair);					
				}
			}
			
			// 참석자 정보가 있으면 업무 협의 버튼 표시
			if (event.attendee != '') {
				var userlist = event.attendee.split(',');
				$.each(userlist, function(){
					var user_info = new NotesName(this);
					if (gap.userinfo.rinfo.ky != user_info.orgUnit1) {
						work_user_list.push(this + '');
					}	
				});
			}
			
			if (work_user_list.length > 0) {
				btn_quick = '<span class="btn-quick">' + gap.lang.start_work + '</span>';
			} 
			
			
			// 제목에 유형을 추가 (한글은 2글자로 맞춤)
			var sche_type = '';
			var sche_type_cls = 'popup-title-type';
			
			if (event.cal_type == 'share') {
				sche_type = gap.lang.share_header;
				sche_type_cls += ' share';
			} else if (event.cal_type == 'subscribe') {
				sche_type = gap.lang.subscribe_header;
				sche_type_cls += ' subscribe';
			} else if (event.system_code == 'todo' || event.system_code == 'checklist') {
				sche_type = gap.lang.todo;
			} else if (event.system_code == 'task') {
				sche_type = gap.lang.popup_type_task;
			} else if (event.system_code == 'collection') {
				sche_type = gap.lang.collection;
			} else if (event.system_code == 'mtg') {
				sche_type = gap.lang.meeting;
			} else if (event.system_code == 'vc') {
				sche_type = gap.lang.meeting;
			} else {
				sche_type = gap.lang.popup_type_cal;
			}
			
			sche_type = '<span class="' + sche_type_cls + '">' + sche_type + '</span>';
			
			
			var html = '<li' + (event.completed == 'T' ? ' class="complete"' : '') + '>' +
			/*
			'<div class="check-wrap">' +
			'	<div class="check"><span></span><span></span></div>' +
			'</div>' +
			*/
			'<div class="priority-wrap">' +
			'	<div class="priority ' + priority + '"></div>' +
			'</div>' +
			'<div class="event">' +
			'	<div class="complete-line"></div>' +
			//'	<span class="title" title="' + event.title + '">' + event.title + btn_quick + '</span>' +
			'	<span class="title" title="' + event.title + '">' + sche_type + ' ' + event.title + '</span>' +
			'	<span class="date">' + disp_dt + '</span>' +
			'</div>' +
			'</li>';
			
			var $li = $(html);
			$li.data('info', event);

			// 업무 시작하기 버튼에 사용자 정보 저장
			$li.find('.btn-quick').data('userlist', work_user_list);
			
			$li.on('click', function(){
				// 미리보기 레이어 표시해야 함
				event.event = event;
				var user_info = $layer.data('userinfo');
				_self.showEventPreview(event, 'popup', user_info);
				event.target = this;
			});
			
			$list.append($li);
			
		}
		
		
		gap.showBlock();

		
		// 확인할 사용자의 mailfile정보
		var mf = (req_obj ? req_obj.mailFile : window.mailfile);
		
		// 확인할 날짜
		var dt = (req_dt ? moment(req_dt) : moment());
		
		if (window.userlang == 'ko') {
			$('#main_popup_title').html(dt.format("M월 D일 dddd"));			
		} else {
			$('#main_popup_title').html(dt.format("M.D dddd"));
		}
		var z_idx = $('#blockui').css('z-index');
		$layer.css('z-index', parseInt(z_idx)+1).show();
		
		
		// 레이어 정보 셋하기
		var sel_info = {
			is_own: (req_obj ? false : true),
			mailFile: (req_obj ? req_obj.mailFile : window.mailfile),
			mailServer: (req_obj ? req_obj.mailServer : window.mailserver),
			id: (req_obj ? req_obj.id : window.notes_id)
		};
		$layer.data('userinfo', sel_info);
		
		var promises = [];
		promises.push(this.getDayEvent(mf, dt));
		
		// 내 일정인 경우 선택된 공유/구독 캘린더의 정보를 함께 가져와야 함
		if (sel_info.is_own) {
			// 공유 캘린더 처리
			$.each(_self.share_cal, function(){
				if (this.disable != '1') {
					promises.push(_self.getDayEvent(this.mailFile, dt, this));				
				}
			});
			
			// 구독 캘린더 처리
			$.each(_self.sub_cal, function(){
				if (this.disable != '1') {
					promises.push(_self.getDayEvent(this.mailFile, dt, this));
				}
			});
		}
		
		
		$.when.apply($, promises).then(function(){
			
			// 몇 개가 넘어올지 모르기 때문에 arguments객체에서 정보 가져오기
			var events = [];
			$.each(arguments, function(){
				if (this.length) {
					$.each(this, function(){
						events.push(this);						
					});
				}
			});
			
			
			var cnt_work = 0;
			var cnt_private = 0;
			var $work_list = $('<ul class="event-list"></ul>');
			var $private_list = $('<ul class="event-list"></ul>');
			
			// 정렬
			_self.eventSort(events);
			
			$.each(events, function(){
				if (_self.getEventType(this) == 'work') {
					cnt_work++;					
					_eventTemplate($work_list, this);
				} else {
					cnt_private++;
					_eventTemplate($private_list, this); 
				}
			});
			
			$layer.find('.content-work-wrap').empty().hide();
			$layer.find('.content-private-wrap').empty().hide();
			if (cnt_work > 0) {
				var $work_wrap = $('<div><div class="event-title">' + gap.lang.work_schedule + '<span class="event-cnt">' + cnt_work + gap.lang.total_attach_count_txt + '</span></div></div>');
				$work_wrap.append($work_list);
				$layer.find('.content-work-wrap').append($work_wrap);
				$layer.find('.content-work-wrap').show();
			}
			
			if (cnt_private > 0) {
				var $private_wrap = $('<div><div class="event-title">' + gap.lang.private_schedule + '<span class="event-cnt">' + cnt_private + gap.lang.total_attach_count_txt + '</span></div></div>');
				$private_wrap.append($private_list);
				$layer.find('.content-private-wrap').append($private_wrap);
				$layer.find('.content-private-wrap').show();
			}
			
			$layer.find('.content-wrap').scrollTop(0);
			
			var cnt_all = cnt_work + cnt_private;
			if (cnt_all == 0) {
				var empty_html = '<div class="nothing-event"><div><div class="bg-img"></div><div>' + gap.lang.nothing_schedule + '</div></div></div>';
				$layer.find('.content-wrap').html(empty_html);
			}
			
			$layer.addClass('show-popup');
			
			/*
			// 완료 처리
			$layer.find('.check-wrap').on('click', function(){
				var $li = $(this).closest('li');
				var com_req = $li.hasClass('complete') ? false : true;
				
				_self.popupEventChange($li, com_req);
			});
			*/
			
			// 업무 바로가기 > 사용안함
			$layer.find('.btn-quick').on('click', function(){
				var _list = $(this).data('userlist');
				
				_self.quickWorkStart(_list, function(){
					$layer.find('.btn-close').click();
				});
			});
		});
				
		// 버튼 이벤트
		$('#main_popup .btn-close, #btn_main_popup_close').off().on('click', function(){
			
			$('#main_popup').removeClass('show-popup');
			//$('#main_right_wrap').addClass('show-right');
			
			// 메인 팝업이 닫힐 때 Task init처리
			//_self.initTask();
			
			$('#main_popup .btn-close, #btn_main_popup_close').off();
			
			//setTimeout(function(){
				$('#main_popup').hide();
				gap.hideBlock();
			//}, 300);
		});
		
		
		if (callfrom == 'main') {
			localStorage.setItem('main_popup', moment().format('YYYY-MM-DD'));
		}
		
	},
	
	"show_today_popup" : function(){
		var _self = this;
		
		if ($('#main_popup').hasClass('show-popup')) {
			$('#btn_main_popup_close').click();
		} else {
			// 메인페이지를 보고 있는 경우 현재 선택된 날짜로 표시
			if (gap.cur_window == 'boxmain' || gap.cur_window == 'home') {
				var info = this.getUserInfo();
				var userinfo = null;
				if (info && window.notes_id != info.id) {
					var notes_nm = new NotesName(info.id);
					userinfo = {
						key: notes_nm.orgUnit1 || info.id,
						id: info.id,
						dept: info.dept,
						name: info.name,
						duty: info.duty,
						mailFile: info.mailFile,
						mailServer: info.mailServer
					}	
				}
				
				var cal_type = this.getMainLayoutType();
				var sel_dt = (cal_type == 'calendar' ? this.maincal._selected : this.sidecal._selected);
				
				var dt = moment(sel_dt).format('YYYY-MM-DD');
				this.initPopup(userinfo, dt);
			} else {
				this.initPopup();
			}
		}
	},
	
	"quickWorkStart" : function(list, callback){
		// 업무 바로가기 선택
		var user_id = [];
		
		$.each(list, function(){
			var userky = this + '';
			// 외부 사용자가 아닌 경우만 처리함
			var nn = new NotesName(userky);
			if (nn.isHierarchical) {
				// ID값만 빼오기
				user_id.push(nn.orgUnit1);	
			} else {
				user_id.push(userky);
			}
		});
		
		
		$('#top_header_layer').addClass('show-quick');
		$('#top_header_layer').find('.btn-remove').click();
		$('#quick_group').val('none').material_select();
		
		var surl = gap.channelserver + "/search_user_empno.km";
		var postData = {"empno" : user_id.join(',')};
		$.ajax({
			type : "POST",
			async: false,
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success: function(data){
				if (!Array.isArray(data)) return;
				$.each(data[0], function(){
					var user_info = gOrg.userInfoJsonKM(this);
					gTop.quickWorkAddUser(user_info);
				});
			},
			complete: function(){
				if (typeof(callback) == 'function') {
					callback();
				}
			}
		});
		
		
	},
	
	"popupEventChange" : function($li, com_req){
		var _self = this;
		var info = $li.data('info');
		
		if (info.type.indexOf('Repeat') != -1) {
			mobiscroll.toast({message:gap.lang.repeat_cannot_complete, color: 'danger'});
			return;
		}

		// 일정 완료 처리
		this.calendarCompletion(info.id, com_req);
		
		// TODO는 추가로 완료 처리를 해야 함
		if (info.system_code == 'todo' || info.system_code == 'checklist') {
			this.todoCompletion(info, com_req);
		}

		// DOM 처리
		$li[com_req ? 'addClass' : 'removeClass']('complete');
		
		// 메인 Type2인 경우 처리
		if (this.getMainType() == '2') {
			$('[data-id="' + info.id + '"] .event-text')[com_req ? 'addClass' : 'removeClass']('complete');	
		}
		
		// 타임라인 영역 완료 처리
		this.timelineEventChange(info.id, com_req);
	},
	
	"timelineEventChange" : function(key, com_req){
		var $timeline_evt = $('#main_right .mbsc-schedule-event[data-id="' + key + '"]').find('.timeline-event-title');
		if (com_req) {
			$timeline_evt.addClass('complete');
		} else {
			$timeline_evt.removeClass('complete');
		}
		
	},
	
	"eventSort" : function(events){
		if (!events) return;
		
		events.sort(function(a,b){
			// 1차 정렬 : 1.업무, 2.개인
			if (a.ShowPS > b.ShowPS) {
				return 1;
			} else if (a.ShowPS < b.ShowPS) {
				return -1;
			}
			
			// 2차 정렬 : 완료처리
			if (a.completed > b.completed) {
				return 1;
			} else if (a.completed < b.completed) {
				return -1;
			}
			
			// 3차 정렬 : 종일 일정
			var allday_a = a.allday == true ? 1 : 0;
			var allday_b = b.allday == true ? 1 : 0;
			if (allday_a < allday_b) {
				return 1;
			} else if (allday_a > allday_b) {
				return -1;
			} 

			// Allday인 경우는 3차 4차 정렬
			if (allday_a && allday_b) {			
				// 4차 정렬 : 시작일
				var sdate_a = moment(a.start).format();
				var sdate_b = moment(b.start).format();
				if (sdate_a > sdate_b) {
					return 1;
				} else if (sdate_a < sdate_b) {
					return -1;
				}
				
				// 5차 정렬 : 우선 순위
				var pri_a = a.priority == '' ? '5' : a.priority;
				var pri_b = b.priority == '' ? '5' : b.priority;
				if (pri_a > pri_b) {
					return 1;
				} else if (pri_a < pri_b) {
					return -1;
				}
			} else {
				// 종일 일정이 아니면 시작일로 계싼
				var sdate_a = moment(a.start).format();
				var sdate_b = moment(b.start).format();
				if (sdate_a > sdate_b) {
					return 1;
				} else if (sdate_a < sdate_b) {
					return -1;
				}
			}
			
			return 0;
		});
		
	},
	
	"initMain" : function(dt, pass_status){
		var _self = this;
		
		if (this.maincal) {
			// 페이지가 전환되었다가 표시된 경우
			if (!dt) dt = new Date();
			
			// 오늘 날짜로 이동
			this.maincal.navigate(dt);

			// 상태값 초기화
			if (!pass_status) {
				$('#main_cal .main-cal-status').removeClass('day_1 day_2 day_3 day_4 day_5 day_6 day_7 day_8 day_9 day_10 day_11').html('');
			}
			
			// 신규로 데이터 불러오기
			var first_day = this.maincal._calendarView._firstPageDay;
			var last_day = this.maincal._calendarView._lastPageDay;
			//var first_day = this.maincal._firstDay;
			//var last_day = this.maincal._lastDay;
			var s_key = moment(first_day).add(-1, 'days').format('YYYYMMDD[T000000Z]');
			var e_key = moment(last_day).add(1, 'days').format('YYYYMMDD[T235959Z]');
			_self.getUserEvent(s_key, e_key, pass_status, this.maincal);
		} else {
			// 캘린더 펼쳐보기 옵션
			var fullscreen_opt = (localStorage.getItem('main_cal_fullscreen') == 'T' ? 'all' : true);
			
			this.maincal = $('#main_cal').mobiscroll().eventcalendar({
				//theme: 'material',
				//locale: mobiscroll.locale['ko'],
				theme: 'ios',
				themeVariant : 'light',
				clickToCreate: 'double',	// 더블클릭으로 신규 작성
				view: {
					calendar: {
						type: 'month',
						popover: false,
						weekNumbers: true,
						labels: fullscreen_opt
					}
				},
				onInit: function(event, inst){
					_self.setMainCalTodayBg();
					var s_moment = moment(event.value).date(1).startOf('week'); // 해당월 주차의 첫째날로 셋팅
					var s_key = s_moment.add(-1, 'days').format('YYYYMMDD[T000000Z]'); // 타임존 때문에 데이터 안나오는 경우 없도록 시작일 -1
					var e_key = s_moment.add(43, 'days').format('YYYYMMDD[T235959Z]'); // Mini캘린더에 뿌려지는 날짜수 +1
					_self.getUserEvent(s_key, e_key, null, inst);
					
					// 캘린더 펼쳐보기 버튼 셋팅
					_self.initBtnFullscreen();
				},
				onPageChange: function(event, inst){
					// 월을 변경할 때 호출
					//if (_self.minical_req_month) { _self.minical_req_month.abort(); }
					var s_key = moment(event.firstDay).add(-1, 'days').format('YYYYMMDD[T000000Z]');
					var e_key = moment(event.lastDay).add(1, 'days').format('YYYYMMDD[T235959Z]');
					_self.getUserEvent(s_key, e_key, null, inst);
					//_self.minical_req_month = _self.getMonthEvent(s_key, e_key);
				},
				onPageLoaded: function(event, inst) {
					// 여러번 호출되는 현상 방지
					var call_start = moment(event.firstDay).format();
					if (_self.loaded_view == call_start) {
						return;
					}
					
					var $sun = $('#main_cal div[aria-label*="Sunday"]');
					var $sat = $('#main_cal div[aria-label*="Saturday"]');
					$sun.find('.mbsc-calendar-day-text').addClass('sunday');
					$sat.find('.mbsc-calendar-day-text').addClass('saturday');
					$sun.find('.mbsc-calendar-cell-inner').addClass('sunday-cell');
					$sat.find('.mbsc-calendar-cell-inner').addClass('saturday-cell');
					
					_self.loaded_view = call_start;
					
					_self.setMainCalTodayBg();
					_self.displayHoliday();
				},
				renderLabel: function(data){
					var cls = (data.original.type == 'private' ? 'event-private' : 'event-work');
					
					var pri_cls = 'priority_';
					if (data.original.priority) {
						pri_cls += data.original.priority;
					} else {
						pri_cls += '3';
					}
					
					if (window.userlang == 'ko') {
						data.start = data.start.replace(/^AM/g, '오전');
						data.start = data.start.replace(/^PM/g, '오후');
					}

					var _title = '';
					if (_self.getMainType() == '2') {
						_title = (data.start ? '<span>' + data.start + '</span> ' + data.title : data.title);
					} else {
						_title = data.title;
					}
					
					var html = 
						'<div class="mbsc-calendar-label-background ' + cls + '"></div>' +
						'<div class="main-cal-event ' + pri_cls + '">' +
						'	<span class="marker"></span>' +
						'	<span class="event-text' + (data.original.completed == 'T' ? ' complete' : '') + '">' + _title + '</span>' +
						'</div>';
					
					return html;
				},
				
				renderDay: function(day){
					var date = day.date;
				    var formatDate = mobiscroll.util.datetime.formatDate;
				    var tmp = moment(day.date).format('YYYYMMDD');
				    var now = moment().format('YYYYMMDD');
				    var today_cls = '';
				    
				    // 오늘인 경우
				    //if ('20230430' == tmp) {
				    if (now == tmp) {
				    	today_cls = ' mbsc-calendar-today';
				    }
					
				    var html =
				    	'<div class="main-day-wrap' + today_cls + '" data-date="' + tmp + '">' +
				    	'	<div class="mbsc-calendar-cell-text mbsc-calendar-day-text mbsc-ios">'+ formatDate('D', date) +'</div>' +
				    	'	<div class="main-holi-wrap">' +
				    	'		<div class="main-holi"></div>' +
				    	'		<div class="maincal_status_' + tmp + ' main-cal-status biz_check"></div>' +
				    	'	</div>' +
				    	'</div>';
				    	
				    return html;
				},
				/*
				renderDayContent: function(day){
					// 미리 자리 잡아놓고 추후 데이터 넣어주면 됨
					//$('.maincal_status_20220801').addClass('day_1').html('휴직');
					
					var tmp = moment(day.date).format('YYYYMMDD');
					
					return '<div><div class="main-holi"></div><div class="maincal_status_' + tmp + ' main-cal-status biz_check"></div></div>';
				},
				*/
				onSelectedDateChange: function(event, inst){
					// 날짜 변경되면 Right 패널에 일정 표시
					_self.drawDayEvent(event.date);
				},

				onCellHoverIn: function(event, inst){					
					// Task Drag & Drop 처리
					if (_self.task_dragging) {
						_self.hover_date = event.date;
					}
				},
				onCellHoverOut: function(event, inst){					
					// Task Drag & Drop 처리
					if (_self.task_dragging) {
						_self.hover_date = null;						
					}
				},
				onLabelClick: function(event, inst){
					var info = _self.getUserInfo();
					var userinfo = null;
					if (info && window.notes_id != info.id) {
						var notes_nm = new NotesName(info.id);
						userinfo = {
							key: notes_nm.isHierarchical ? notes_nm.orgUnit1 : info.key,
							id: info.id,
							dept: info.dept,
							name: info.name,
							duty: info.duty,
							mailFile: info.mailFile,
							mailServer: info.mailServer
						}	
					}
					
					var dt = moment(event.date).format('YYYY-MM-DD');
					if (!event.label) {
						// more 클릭시
						_self.initPopup(userinfo, dt);
					}
				},
				onEventClick: function(event, inst){
					// Type2일 때만 이벤트 클릭했을 때 상세보기 레이어 표시
					if (_self.getMainType() == '2') {
						_self.showEventPreview(event);
						return false;
					}
				},
				
				dateFormat: 'YYYY/MM/DD',
				timeFormat: window.userlang == 'ko' ? 'A h:mm' : 'h:mm A',
				
				// Drag로 일정이 잡히도록 처리
				dragToCreate: true,
				onEventCreate: function(args, inst){
					var s_dt = moment(args.event.start).format('YYYY-MM-DD');
					var e_dt = moment(args.event.end).format('YYYY-MM-DD');
					
					// 더블클릭해서 들어올 때, 날짜를 더블클릭하면 하루전으로 들어오는 현상있음 예외처리
					var sel_dt = moment(inst._selected).format('YYYY-MM-DD');
					if (s_dt == e_dt) {
						// 기간 일정이 아니면 현재 선택된 날짜로 넣어주기
						s_dt = sel_dt;
						e_dt = sel_dt;
					}
	        		_self.showRegLayer(s_dt, e_dt);
	        		return false;
	        	}
			}).mobiscroll('getInst');
			
			if (window.userlang == 'ko'){
				this.maincal.setOptions({                            
					monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월', ],
					monthNamesShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
					yearSuffix: '년',
					todayText: '오늘'
				});
			}
		}
	},
	
	"initOtherCal" : function(){
		var _self = this;
		
		var show_limit_cnt = 6;
		
		// 초기화
		this.share_cal = [];
		this.sub_cal = [];
		
		var $own = $('#main_own_cal');
		var $sepa = $('.main-cal-user-sepa');
		var $user_list = $('#main_oth_cal_list');	// 캘린더 - 즐겨찾기 리스트
		var $user_list_tmp = $('#main_oth_cal_tmp'); // 캘린더 - 검색 결과 리스트
		var $search_wrap = $('#main_cal_search_wrap');
		var $user_layer = $('<div id="main_oth_user_layer" class="main-oth-user-layer" style="display:none;"></div>');	// 사용자 더보기 레이어
		
		
		
		var $side_own = $('#side_own_cal');
		var $side_user_list = $('#side_oth_cal_list');
		var $side_user_list_tmp = $('#side_oth_cal_tmp'); // 캘린더 - 검색 결과 리스트
		var $side_search_wrap = $('#side_cal_search_wrap');
		var $side_user_layer = $('<div id="side_oth_user_layer" class="main-oth-user-layer" style="display:none;"></div>');	// 사용자 더보기 레이어
		
		
		// 사용자 목록 초기화
		$user_list.empty().hide();
		$user_list_tmp.empty();
		$sepa.hide();
		$search_wrap.removeClass('search-mode');
		$('#cal_search_user').val('');
		$user_list.append($user_layer);
		
		
		// 사이드 사용자 목록 초기화
		$side_user_list.empty();
		$side_user_list.removeClass('hide');
		$side_search_wrap.removeClass('search-mode');
		$('#side_cal_search_user').val('');
		$side_user_list.append($side_user_layer);
		

		// 사용자 정보를 캘린더 상단 Dom에 표시하는 함수
		function _addUser(obj, is_temp, is_side) {
			var is_own = window.notes_id == obj.id;
			
			// 공유 캘린더
			if (obj.id.indexOf('~') != -1) {
				_self.share_cal.push(obj);
				return;
			}
			
			// 구독 캘린더
			if (obj.id.indexOf('!') != -1) {
				_self.sub_cal.push(obj);
				return;
			}
			
			if (obj.id == 'my_calendar') return;
			if (is_temp) {
				var empno = obj.id;
			} else {
				var empno = gap.seach_canonical_id(obj.id.replace(/\//g, ','));
			}
			var cpc = empno.substr(0, 2);
			var ky = empno;
			/*
			if (empno.indexOf("im") == -1) {
				empno = empno.substr(2);
			}
			*/
			
			var img_html = gap.person_profile_photo({
				cpc: cpc,
				ky: ky,
				emp: empno
			});
			
			var $thumb = $('<div class="user' + (is_temp ? ' temp-user' : '') + '"><div class="user-thumb">' + img_html + '</div></div>');
			$thumb.data('info', obj);
			
			// 이벤트 걸어주기
			_eventBindUser($thumb);

			

			if (is_own) {
				
				// 캘린더 설정하기
				var $setting_icon = $('<div class="icon-wrap cal-set"><div class="icon"></div><div class="back"></div></div>');
				$thumb.append($setting_icon);
				
				//_self.setCalendarSetting($setting_icon);
				
				/*
				$setting_icon.on('click', function(){
					_self.showCalendarSetting();
				});
				*/
				
			}else  {
				
				if (is_temp) {
					// 즐겨찾기 추가하는 버튼
					var $add_icon = $('<div class="icon-wrap add"><div class="icon"></div><div class="back"></div></div>');
					$add_icon.on('click', function(){
						var user_el = $(this).parent();
						_regUser(user_el);
						return false;
					});
					$thumb.append($add_icon);
				} else {
					// 즐겨찾기에서 삭제하는 버튼
					var $remove_icon = $('<div class="icon-wrap remove"><div class="icon"></div><div class="back"></div></div>');
					$remove_icon.on('click', function(){
						var user_el = $(this).parent();
						_removeUser(user_el);
						return false;
					});
					$thumb.append($remove_icon);
				}

				/*
				// 이름 표시
				var $nm = $('<div class="user-name" title="' + obj.name + '">' + obj.name + '</div>');
				$thumb.append($nm);
				*/
			}

			var $side_thumb = $thumb.clone(true);
			
			
			// DOM 처리
			if (is_own) {
				
				$own.html($thumb);
				
				// 사이드 영역
				$side_thumb.find('.cal-set').remove();
				$side_own.html($side_thumb);
				
			} else if (is_temp) {

				// 검색 영역 (검색은 사이드와 메인 별도로 처리)
				if (is_side) {
					$side_user_list_tmp.append($side_thumb);											
				} else {
					$user_list_tmp.append($thumb);					
				}
				
			} else {
				
				// 사용자 리스트 영역
				$user_list.append($thumb);
				$user_list.show();
				$sepa.show();
				
				// 사이드 달력
				$side_user_list.append($side_thumb);
				
			}
			
		}
		
		// 이벤트 걸어주기
		function _eventBindUser(target){
			$(target).off('click').on('click', function(){
				if ($(this).hasClass('on')) return;
				
				var obj = $(this).data('info');				
				var is_own = window.notes_id == obj.id;
				
				// 열려있는 툴팁이 있으면 삭제 처리
				if (_self.show_user_tooltip && _self.show_user_tooltip.destroy) {
					_self.show_user_tooltip.destroy(true);
				}
				
				var cal_type = $('input[name="main_lay_type"]:checked').val();

				if (cal_type == 'calendar') {
					
					// 메인 캘린더 타입인 경우
					$('#main_oth_cal_wrap .user').removeClass('on');
					$(this).addClass('on');
					
					// 캘린더 셋팅
					_self.initMain(moment(_self.maincal._selected));
					
					// 더 보기 레이어에 있는 사용자 선택 시 사용자 이름을 더보기 아이콘 아래 표시 
					if ($(this).closest('.main-oth-user-layer').length > 0) {
						$user_list.find('.user-more .user-name').remove();
						var $nm = $(this).find('.user-name');
						$user_list.find('.user-more').append($nm.clone());
						$user_list.find('.user-more').addClass('select');
					} else {
						$user_list.find('.user-more').removeClass('select');
					}
					
					// Task Drag & Drop enable/disable					
					$('#task_list .task-each').draggable((is_own ? 'enable' : 'disable'));
					
				} else {
					
					// 메인 포틀릿 타입인 경우
					$('#main_right .side-favo .user').removeClass('on');
					$(this).addClass('on');
					
					// 캘린더 셋팅
					_self.initSideCal(moment(_self.sidecal._selected));
					
					// 더 보기 레이어에 있는 사용자 선택 시 사용자 이름을 더보기 아이콘 아래 표시 
					if ($(this).closest('.main-oth-user-layer').length > 0) {
						$side_user_list.find('.user-more .user-name').remove();
						var $nm = $(this).find('.user-name');
						$side_user_list.find('.user-more').append($nm.clone());
						$side_user_list.find('.user-more').addClass('select');
					} else {
						$side_user_list.find('.user-more').removeClass('select');
					}
					
				}

			});
			
			
			
			// 마우스 오버시 사용자 연결 레이어 표시
			$(target).off('mouseenter').on('mouseenter', function(e){
				var obj = $(this).data('info');
				
				// 나 자신은 툴팁 표시하지 않음
				if (window.notes_id == obj.id) return false;
				
				if ( $(this).parent().attr('id') == 'side_oth_cal_list' ) {
					//return false;
				}
				
				_self.showUserTooltip($(this), obj);
			});
		}
		
		// 등록된 사용자 삭제
		function _removeUser(el){
			var _info = $(el).data('info');
			
			gap.showConfirm({
				title: gap.lang.rm_favo,
				contents: _info.name + gap.lang.rm_favo_confirm,
				callback: function(){
					var _url = _self.caldbpath + "/(ag_calendar_remove)?OpenAgent";
					_url += '&' + $.param({mailfile: window.mailfile, notesid: _info.id.replace(/\,/g, '/')});
					
					$.ajax({
						url : _url,
						dataType : "json",
						success : function(res){
							if (res.result == "ok"){
								var cal_type = _self.getMainLayoutType();
								var go_mycal = false;
								var is_layer = false;	// 더 보기 레이어에 있는 사용자인지 체크
								if (el.parent().hasClass('main-oth-user-layer')){
									is_layer = true;
								}
								
								// 메인과 사이드 두 군데서 지워야 함
								var _key = el.find('.user-thumb img').data('key');
								var main_el = $user_list.find('img[data-key="' + _key + '"]').closest('.user');
								var side_el = $side_user_list.find('img[data-key="' + _key + '"]').closest('.user');
								
								// 메인 삭제 처리
								if (main_el.hasClass('on')){
									go_mycal = true;
								}
								main_el.remove();
								if (go_mycal){
									if (cal_type == 'calendar') {
										$('#main_own_cal').find('.user').click();										
									}
									$('#main_own_cal').find('.user').addClass('on');
								}
								
								// 사이드 삭제 처리
								go_mycal = false;
								if (side_el.hasClass('on')){
									go_mycal = true;
								}
								side_el.remove();
								if (go_mycal){
									if (cal_type == 'portlet') {
										$('#side_own_cal').find('.user').click();										
									}
									$('#side_own_cal').find('.user').addClass('on');
								}
								
								
								
								if (is_layer) {
									// 메인 처리
									if ($user_layer.find('.user').length == 1) {
										$user_list.append($user_layer.find('.user'));
										$user_list.find('.user-more').remove();
										$user_layer.slideUp(200, 'linear');
									} else {
										$user_list.find('.user-more .user-thumb').text('+' + $user_layer.find('.user').length);
									}
									
									// 사이드 처리
									if ($side_user_layer.find('.user').length == 1) {
										$side_user_list.append($side_user_layer.find('.user'));
										$side_user_list.find('.user-more').remove();
										$side_user_layer.slideUp(200, 'linear');
									} else {
										$side_user_list.find('.user-more .user-thumb').text('+' + $side_user_layer.find('.user').length);
									}
								} else {
									// 즐겨찾기가 전체 삭제되는 경우 숨김처리
									if ($user_list.find('.user').length == 0) {
										$user_list.hide();
										$sepa.hide();
									}
								}
							}
						},
						error : function(e){
							mobiscroll.toast({message:gap.lang.error_rm, color:'danger'});
						}
					});
				}
			});
			
		}
		
		// 사용자 등록
		function _regUser(el){
			var _info = $(el).data('info');
			if (gap.userinfo.rinfo.ky == _info.id) {
				mobiscroll.toast({message:gap.lang.error_own, color:'danger'}); //TODO
				return;
			}
			
			var _url = _self.caldbpath + "/(ag_calendar_add)?OpenAgent";
			var _param = {
				mailfile: window.mailfile ,
				color: "#" + Math.floor(Math.random() * 16777215).toString(16),	// 랜덤색상
				notesid: _info.id.replace(/\,/g, '/'),
				name: _info.name,
				disable: "1"	// 캘린더에 표시되지 않도록 옵션 추가
			};
			
			// AJAX success에서 참조하기 위해 전역으로 저장해 놓음
			window.reg_el = el;
			
			$.ajax({
				url: _url + '&' + $.param(_param),
				dataType: 'json',
				success: function(res){
					if (res.result == 'duplicate') {
						mobiscroll.toast({message:gap.lang.error_dupl, color:'danger'}); //TODO
					} else if (res.result == 'ok') {
						
						// 열려있는 툴팁이 있으면 삭제 처리
						if (_self.show_user_tooltip && _self.show_user_tooltip.destroy) {
							_self.show_user_tooltip.destroy(true);
						}
						
						
						var el = $(window.reg_el).clone(true);
						_eventBindUser(el);
						
												
						$(el).removeClass('temp-user');
						$(el).find('.icon-wrap').removeClass('add').addClass('remove');
						
						if (_self.getMainLayoutType() != 'calendar') {
							el.removeClass('on');
						}
						
						// 이벤트 초기화
						$(el).find('.remove').off().on('click', function(){
							var user_el = $(this).parent();
							_removeUser(user_el);
							return false;
						});
						
						// 더 보기 관련 수행여부 결정 플래그
						var run_more_proc = false;
						
						// 더 보기 표시되어 있는 경우 더 보기 레이어에 추가
						if ($user_list.find('.user-more').length > 0) {
							$user_layer.append(el);
							var user_cnt = $user_layer.find('.user').length;
							$user_list.find('.user-more .user-thumb').text('+' + user_cnt);
							if (el.hasClass('on')) {
								$user_list.find('.user-more .user-name').remove();
								var $nm = el.find('.user-name');
								$user_list.find('.user-more').append($nm.clone());
								$user_list.find('.user-more').addClass('select');
							}
						} else {
							run_more_proc = true;
							$user_list.append(el).show();
						}

						
						/* -----------------------사이드 처리----------------------------*/
						
						var el = $(el).clone(true);
						_eventBindUser(el);
						
						el.removeClass('on');
						if (_self.getMainLayoutType() != 'calendar') {
							$('#side_own_cal .user').click();							
						}
						
												
						if ($side_user_list.find('.user-more').length > 0) {
							$side_user_layer.append(el);
							var user_cnt = $side_user_layer.find('.user').length;
							$side_user_list.find('.user-more .user-thumb').text('+' + user_cnt);
							if (el.hasClass('on')) {
								$side_user_list.find('.user-more .user-name').remove();
								var $nm = el.find('.user-name');
								$side_user_list.find('.user-more').append($nm.clone());
								$side_user_list.find('.user-more').addClass('select');
							}
						} else {
							run_more_proc = true;
							$side_user_list.append(el);
						}
						
						if (run_more_proc) {
							_userMoreProc();							
						}
						
						window.reg_el.remove();
						window.reg_el = null;
						
						$sepa.show();
						mobiscroll.toast({message:gap.lang.ok_add_favo, color:'info'});

					} else if (res.result == 'error') {
						mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
					}
				}
			});
		}

		
		// 사용자 검색
		function _otherCalSearch(data, is_side) {
			if (data.length == 0) {
				mobiscroll.toast({message:gap.lang.no_result_user, color:'danger'});
				// 선택된 사용자가 없는 경우 내 캘린더 선택
				if ($('#main_oth_cal_list').find('.user.on').length == 0) {
					//$('#main_own_cal').find('.user').click();
				}
				return;
			}
						
			if (is_side) {
				$side_user_list_tmp.empty();
			} else {
				$user_list_tmp.empty();				
			}
			
			$.each(data, function(idx, val){
				
				if (idx >= 3) {
					mobiscroll.toast({message:gap.lang.error_max_user, color:'danger'});
					return false;
				}
				
				var info = gap.user_check(this);
				info = $.extend(true, info, {
					key: info.ky,
					id: info.ky,
					dept: info.dept,
					duty: info.jt,
					name: info.nm,
					mailFile: info.mf,
					mailServer: info.ms
				});
				_addUser(info, true, is_side);
			});
			
			// 검색된 사용자가 1명인 경우 자동 선택되도록 처리
			//if (data.length == 1) {
			if (is_side) {
				$side_user_list_tmp.find('.user:first-child').click();
			} else {
				$user_list_tmp.find('.user:first-child').click();				
			}
			//}
		}
		
		
		// 사용자 더 보기 처리
		function _userMoreProc() {

			// 캘린더 타입 즐겨찾기 더보기
			var $users = $user_list.find('.user');
			if ($users.length > show_limit_cnt) {
				var more_cnt = 0;
				$users.each(function(idx, el){
					var nth = idx + 1;
					if (nth >= show_limit_cnt) {
						$user_layer.append(el);
						more_cnt++;
					} 
				});
				
				var $more_btn = $('<div class="user-more"><div class="user-thumb">+' + more_cnt + '</div></div>');
				$more_btn.on('click', function(){
					if ($more_btn.hasClass('on')) {
						$more_btn.removeClass('on');
						$user_layer.slideUp(200, 'linear');
					} else {
						$more_btn.addClass('on');
						$user_layer.slideDown(200, 'linear');
					}
					
				});
				$user_list.append($more_btn);
			}
			
			
			// 사이드 캘린더 즐겨찾기 더보기
			var $side_users = $side_user_list.find('.user');
			if ($side_users.length > show_limit_cnt) {
				var more_cnt = 0;
				$side_users.each(function(idx, el){
					var nth = idx + 1;
					if (nth >= show_limit_cnt) {
						$side_user_layer.append(el);
						more_cnt++;
					} 
				});
				
				var $side_more_btn = $('<div class="user-more"><div class="user-thumb">+' + more_cnt + '</div></div>');
				$side_more_btn.on('click', function(){
					if ($side_more_btn.hasClass('on')) {
						$side_more_btn.removeClass('on');
						$side_user_layer.slideUp(200, 'linear');
					} else {
						$side_more_btn.addClass('on');
						$side_user_layer.slideDown(200, 'linear');
					}
					
				});
				$side_user_list.append($side_more_btn);
			}
				
		}
		
		// 내 정보
		var own_obj = {
			id: window.notes_id,
			mailFile: window.mailfile,
			mailServer: window.mailserver
		};		
		_addUser(own_obj, false);
		
		// 메인에 표시
		$own.find('.user').addClass('on');
		var _du = gap.userinfo.rinfo.du || gap.userinfo.rinfo.jt || '';
		$('.main-own-name').text(gap.userinfo.rinfo.nm + (_du ? ' ' + _du : ''));
		
		// 사이드에 표시
		$side_own.find('.user').addClass('on');
		
		
		// 내 일정에 등록된 타인 캘린더 리스트를 가져와서 뿌려줌
		var url = _self.caldbpath + "/(ag_get_userconfig)?OpenAgent";
		var param = {
			mf: mailfile,
			ms: mailserver,
			owner_notesid: window.notes_id
		}
		$.ajax({
			url: url + '&' + $.param(param),
			success: function(res){
				_self.cal_config = res;
			
				$.each(res.calendar_list, function(){
					_addUser(this);
				});
				
				// 여러명인 경우 view more를 뿌려줘야 함
				_userMoreProc();
				
				// 캘린더 설정 관련 셋팅
				_self.setCalendarSetting();
				
				// 휴일정보 표시하기
				var sel_holi = (res.dispHolidayGroup ? res.dispHolidayGroup : _self.getDefaultHoliday());
				
				// 내 회사 추가
				if (localStorage.getItem('my_company_holi_nodisp') != 'T') {
					if (sel_holi.indexOf(gap.userinfo.rinfo.cp) == -1) {
						sel_holi = gap.userinfo.rinfo.cp + (sel_holi ? ',' + sel_holi : '');
					}
				}
				
				_self.getHolidayData(sel_holi);
				
				// 로딩 완료
				_self.cal_load_complete.resolve();
			},
			error: function(){
				
			}
		});
		
		
		// 검색어 입력
		$('#cal_search_user').attr('placeholder', gap.lang.placeholder_name);
		$('#cal_search_user').off().on('keydown', function(e){
			if (e.keyCode == 13) {
				gsn.requestSearch('', $(this).val(), function(sel_data){
					_otherCalSearch(sel_data);
					$('#cal_search_user').val('');					
				});
			}
		});
		
		
		// 사이드 검색어 입력
		//$('#side_cal_search_user').attr('placeholder', gap.lang.placeholder_name);
		$('#side_cal_search_user').off().on('keydown', function(e){
			if (e.keyCode == 13) {
				gsn.requestSearch('', $(this).val(), function(sel_data){
					_otherCalSearch(sel_data, true);
					$('#side_cal_search_user').val('');					
				});
			}
		});
		
		
		// 검색 버튼
		$('#btn_user_cal_search').off().on('click', function(){
			
			if ($search_wrap.hasClass('search-mode')) {
				gap.showBlock();
				
				//$search_wrap.removeClass('search-mode');
				// 조직도 표시
				window.ORG.show(
					{
						'title': gap.lang.manu3, // 사용자 검색
						'single': false,
						'select': 'person' // [all, team, person]
					}, 
					{
						getItems:function() { return []; },
						setItems:function(items) { /* 반환되는 Items */
							if (items.length == 0) return;
							
							$user_list_tmp.empty();
							
							for (var i = 0; i < items.length; i++){
								if (i >= 3) {
									mobiscroll.toast({message:gap.lang.error_max_user, color:'danger'});
									break;
								}
								var _res = gap.convert_org_data(items[i]);
								_res = $.extend(true,  _res, {
									id: _res.ky,
									name: _res.nm,
									mailFile: _res.mf
								});
								_addUser(_res, true);
							}
							
						},
						onClose: function(){
							gap.hideBlock();
						}
					}
				);
			} else {
				$search_wrap.addClass('search-mode');
				$('#cal_search_user').focus();
			}
		});
		
		
		// 사이드 검색 버튼
		$('#btn_side_user_cal_search').off().on('click', function(){
			
			if ($side_search_wrap.hasClass('search-mode')) {
				gap.showBlock();
				
				// 조직도 표시
				window.ORG.show(
					{
						'title': gap.lang.manu3, // 사용자 검색
						'single': false,
						'select': 'person' // [all, team, person]
					}, 
					{
						getItems:function() { return []; },
						setItems:function(items) { /* 반환되는 Items */
							if (items.length == 0) return;
							
							$side_user_list_tmp.empty();
							
							for (var i = 0; i < items.length; i++){
								if (i >= 3) {
									mobiscroll.toast({message:gap.lang.error_max_user, color:'danger'});
									break;
								}
								var _res = gap.convert_org_data(items[i]);
								_res = $.extend(true,  _res, {
									id: _res.ky,
									name: _res.nm,
									mailFile: _res.mf
								});
								_addUser(_res, true, true);
							}
							
						},
						onClose: function(){
							gap.hideBlock();
						}
					}
				);
			} else {
				$side_user_list.addClass('hide');
				$side_search_wrap.addClass('search-mode');
				$('#side_cal_search_user').focus();
			}
		});
		
		// 사이드 검색 닫기 버튼
		$('#btn_side_search_close').off().on('click', function(){
			$side_user_list.removeClass('hide');
			$side_search_wrap.removeClass('search-mode');
			$side_user_list_tmp.empty();
			$('#side_cal_search_user').val('');
			
			// 내 일정 클릭
			$('#side_own_cal .user').click();
		});
		
		// 내 이름 클릭시 내 프로필 띄우기
		$('.main-own-name-wrap').off().on('click', function(){
			gap.showUserDetailLayer(gap.userinfo.rinfo.ky);
		});
		
	},
	
	"initTask" : function(){
		var _self = this;
		
		$('#main_task_title').html('My Task (<span id="task_ing_cnt"></span>)');
		$('.ma-r-bt-title').html(gap.lang.task_title);
		
		$('#main_task_title').parent().off().on('click', function(){
			/*
			if (_self.getMainType() == '1') {
				$('#main_right_wrap').toggleClass('show-task');				
			}
			*/
			
			if (!$('#main_content').hasClass('show-maincal')) {
				$('#main_right_wrap').toggleClass('show-task');
			}
			
		});
		
		// Task 작성하기 UI 적용
		$('#task_new_input').attr('placeholder', gap.lang.mytask_placeholder);
		$('#task_new_input').off().on('keydown', function(e){
			if (e.keyCode == 13) {
				var subj = $.trim($(this).val());
				
				if (subj == '') return false;
				
				// 진행중인 경우 리턴 처리
				if ($(this).hasClass('process')) return false;
				
				_self.createTaskReq(subj);
			}
		}).on('blur', function(){
			
		});
		
		
		// 완료된 할 일 보기
		$('.ma-r-bt-title-wrap').off().on('click', function(){
			$('.ma-r-bt-wrap').toggleClass('show');
		});
		
		// 진행중인 Task Event 처리
		$('#task_list, #task_list_complete').off().on('click', function(e){
			var $li = $(e.target).closest('li');
			var is_completed = $li.parent().hasClass('complete');
			
			// 체크 박스 클릭
			if ($(e.target).hasClass('task-check')) {
				// 이미 클릭된 상태면 예외처리
				if ($li.find('.task-wrap').hasClass('proc')) return false;
				_self.changeTaskStatus($li, !is_completed);
			}
			
			// 액션 버튼
			if ($(e.target).hasClass('btn-action')) {
				
				if (is_completed) {
					var html = 
						'<div class="task-action-layer">' +
						'	<div class="btn-task-remove">' + gap.lang.basic_delete + '</div>' +
						'</div>';
				} else {
					var html = 
						'<div class="task-action-layer">' +
						'	<div class="btn-task-modify">' + gap.lang.basic_modify + '</div>' +
						'	<div class="btn-task-remove">' + gap.lang.basic_delete + '</div>' +
						'</div>';
				}
				$(e.target).qtip({
					//overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
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
						viewport: $('#main_center'),
	                    my: 'left top',
	                    at: 'right top',
	                    adjust: {
							y: 5
						}
	                },
	                events: {
	                	render: function(e, api){
	                		var $tip = $(api.elements.tooltip);
	                		
	                		// 수정
	                		$tip.find('.btn-task-modify').on('click', function(){
	                			_self.changeTaskEditMode($li);	
	                		});
	                		                		
	                		// 삭제
	                		$tip.find('.btn-task-remove').on('click', function(){
	                			var key = $li.data('key');
	                			_self.removeTask(key).then(function(res){
	                				_self.refreshPage(true);
	                				
	                				// 삭제 완료
	                				$li.slideUp(200, 'linear', function(){
	                					var $parent = $li.closest('.task-category-wrap');
	                					var is_last = ($li.closest('.task-category-wrap').find('.task-each').length <= 1);
	                					$li.remove();
	                					if (is_last) {
	                						$parent.remove();
	                					}
	                					_self.taskCountCheck();
	                					_self.emptyTaskCheck();
	                				});
	                				
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
			}
			if ($(e.target).parent().hasClass('btn-action')) {$(e.target).parent().click();}
			
			
			
			
			
		});
		
		/*
		 * 소트 기능은 추후 구현
		// Task 순서 변경
		$('#task_list').sortable({
			placeholder: 'task-placeholder',
			distance: 10
		});
		*/
		// 완료된 항목 숨기기
		$('.ma-r-bt-wrap').removeClass('show');
		
		// Task 리스트 가져오기
		$('#task_list').empty();
		$('#task_list_complete').empty();
		_self.getTaskList();
		_self.getCompleteTaskList();
		
	},
	
	"drawDayEvent" : function(dt){
		var _self = this;
		if (this.getMainType() == '2') return;
		
		$('#main_right_wrap').removeClass('show-task');
		
		if (!dt) dt = new Date();

		// 타이틀 셋팅
		var req_dt = moment(dt).format("YYYY-MM-DD");
		var now_dt = moment().format("YYYY-MM-DD");
		
		if (req_dt == now_dt) {
			$('#main_right_title').html("Today");
		} else {
			//$('#main_right_title').html(moment(dt).format("YYYY-MM-DD"));
			if (window.userlang == 'ko') {
				var txt_dt = moment(dt).format("M월 D일 dddd");
			} else {
				var txt_dt = moment(dt).format("M.D dddd");
			}
			
			$('#main_right_title').html(txt_dt);
		}
		
		var mf = this.getUserMailPath();
		
		_self.getDayEvent(mf, dt).then(function(events){
			/*
			_self.daycal.setEvents(events);
			
			// 오늘은 현재시각으로 스크롤 되도록 처리
			if (req_dt == now_dt) {
				_self.daycal.navigate(moment());
			} else {
				// 다른 날은 07:00시로 스크롤되도록 처리
				_self.daycal.navigate(moment(req_dt+'T07:00:00'));				
			}
			*/
			
			// 타임라인 왼쪽에 색상 표시
			setTimeout(function(){
				var $objs = $('#main_right').find('.mbsc-schedule-event:not(.mbsc-schedule-event-all-day)');
				$objs.each(function(){
					var $bar = $(this).find('.mbsc-schedule-event-bar');
					var $title = $(this).find('.timeline-event-title');
					if ($title.hasClass('work')){
						$bar.css('background', '#f39562');
					} else if ($title.hasClass('private')){
						$bar.css('background', '#ec5f78');
					} else {
						// 상태
						$bar.css('background', '#ec5f78');
					}
					$bar.show();
				});				
			}, 100);
		});
	},
	
	"completedEventCheck" : function(events){
		var evt_ing = [];
		var evt_com = [];
		
		$.each(events, function(){
			if (this.completed == 'T') {
				evt_com.push(this);
			} else {
				evt_ing.push(this);
			}
		});
		
		return {
			ing: evt_ing,
			completed: evt_com
		}
	},
	
	"changeTaskEditMode" : function($li){
		var _self = this;
		
		var $subj = $li.find('.subj-wrap');
		
		/*
		 * 제목
		 */
		var $subj_edit = $('<input type="text" class="subj-edit">');
		$subj_edit.val($subj.find('.task-subj').text());
		$subj_edit.on('blur', function(){
			//_changeSubject();
		});
		$subj_edit.on('keydown', function(evt){
			 if (evt.keyCode == 13) {
				 _changeSubject();
			 } 
		});
		function _changeSubject(){
			var chg_subj = $.trim($subj_edit.val());
			if (chg_subj == '') {
				$li.removeClass('edit');
				$li.find('.edit-wrap').empty();
				$subj.show();
				return; 
			}
			_self.updateTaskCheck($li);
			/*
			if (chg_subj != $subj.text()) {
				_self.changeTaskSubject($li.data('key'), chg_subj);
			}
			$li.removeClass('edit');
			$li.find('.edit-wrap').empty();
			$subj.text(chg_subj).show();
			*/
		}
		
		
		
		
		/*
		 * 날짜
		 */
		var $date_wrap = $('<div class="date-edit-wrap"></div>');
		var $dt_wrap = $('<div class="date-wrap"></div>');
		var $date = $('<input type="text" class="date-edit" placeholder="' + gap.lang.set_enddate + '">');
		var $all_check = $('<label class="time-label" style="display:none;"><input type="checkbox" class="all-day-check" checked>' + gap.lang.allday + '</label>');
		$dt_wrap.append($date);
		$dt_wrap.append('<div class="icon"></div>');
		
		var $btn_sel_time = $('<div class="btn-sel-time">' + gap.lang.select_time + '</div>');
		var $btn_allday = $('<div class="btn-allday" style="display:none;">' + gap.lang.allday + '</div>');
		
		//$date_wrap.append($date);
		//$date_wrap.append('<div class="icon"></div>');
		$date_wrap.append($dt_wrap);
		$date_wrap.append($all_check);
		$date_wrap.append($btn_sel_time);
		$date_wrap.append($btn_allday);
		
		$date.mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			anchor: $date.get(0),
			display: 'anchored',
			theme: 'ios',
			themeVariant : 'light',
			controls: ['calendar'],
			select: 'date',
			dateFormat: 'YYYY-MM-DD',
			//animation: 'slide-down',
			calendarType: 'month',
			touchUi: true,
			buttons: []
			/*
			// 날짜 선택시 컴포넌트 닫아지도록 처리 (buttons에 빈 배열을 넣으면 자동 선택으로 처리됨 / 아래 주석 처리)
			onOpen: function(event, inst){
				if ($date.val() != '') {
					inst.setTempVal($date.val());					
				}
			},
			onCellClick: function(event, inst){
				$date.val(moment(event.date).format('YYYY-MM-DD'));
				inst.close();
			}
			*/
		});
		$date_wrap.find('.icon').on('click', function(){
			$date.click();
			return false;
		});
		
		
		// 시간선택 버튼 클릭
		$btn_sel_time.on('click', function(){
			$(this).parent().siblings('.time-edit-wrap').show();
			$all_check.find('.all-day-check').click();
			$('#task_s_time').parent().find('input').trigger('focus').trigger('focus');
			
			// 날짜 입력이 안된 경우 오늘 날짜 입력
			if ($date.val() == '') {
				$date.mobiscroll('getInst').setVal(moment().format('YYYY-MM-DD'));
			}
		});
		
		$btn_allday.on('click', function(){
			$(this).parent().siblings('.time-edit-wrap').hide();
			$all_check.find('.all-day-check').click();
		});
		
		
		
		/*
		 * 시간
		 */
		var $time_wrap = $('<div class="time-edit-wrap" style="display:none;"></div>');
		var $s_time = $('<select id="task_s_time" class="time-edit" disabled></select>');
		var $e_time = $('<select id="task_e_time" class="time-edit" disabled></select>');
		var time_html = _getTimeHtml();
		$time_wrap.append($s_time, '<span class="tild">~</span>', $e_time);
		
		
		/*
		 * 업무로 등록
		 */
		var $work_check = $('<div class="work-check"></div>');
		$work_check.append('<label><input type="checkbox" class="task-work-check"> ' + gap.lang.reg_work + '</label>');		
		
		
		// 현재 시간 정보 셋팅
		var s_time, e_time;
		var now = moment();
        var add_hour = now.get('h') < 23 ? 1 : 0; // 11시가 넘으면 +1 하지 않음
        s_time = now.startOf('h').add(add_hour, 'h').format('HH:mm');
        e_time = now.add(1, 'h').format('HH:mm');
		$s_time.append(time_html).val(s_time).material_select();
		$e_time.append(time_html).val(e_time).material_select();
		
		$s_time.data('diff_min', 60);
		$s_time.on('change', function(){
			_changeEndDate();
		});
		
		$e_time.on('change', function(){
			_setDiffDate();
			_checkEndDate();
		});
		
		
		// 종일 이벤트
		$all_check.find('.all-day-check').on('click', function(){
			if ($(this).is(':checked')) {
				$s_time.prop('disabled', true).material_select();
				$e_time.prop('disabled', true).material_select();
				$time_wrap.hide();
				$btn_sel_time.show();
				$btn_allday.hide();
			} else {
				$s_time.prop('disabled', false).material_select();
				$e_time.prop('disabled', false).material_select();
				$time_wrap.show();
				$btn_sel_time.hide();
				$btn_allday.show();
			}
		});
		
		
		// 업무로 등록
		$work_check.find('.task-work-check').on('click', function(){
			if ($(this).is(':checked')) {
				$(this).closest('li').addClass('work');
			} else {
				$(this).closest('li').removeClass('work');
			}
		});
		
		function _setDiffDate() {
			var s_date = moment($date.val() + 'T' + $s_time.val()); 
			var e_date = moment($date.val() + 'T' + $e_time.val());
			
			var diff = e_date.diff(s_date, 'm');
			if (diff >= 0) {
				$s_time.data('diff_min', diff);
			}
		}
		
		function _changeEndDate(event) {
			var diff = $s_time.data('diff_min');
			var s_dt = moment($date.val() + 'T' + $s_time.val());
			
			if (diff >= 0) {
				var e_dt = moment(s_dt).add(diff, 'm');
				if (s_dt.format('YYYY-MM-DD') == e_dt.format('YYYY-MM-DD')) {
					$e_time.val(e_dt.format('HH:mm')).material_select();
				} else {
					// 하루를 넘기는 경우 종료시간을 23:30분으로 보정
					$e_time.val('23:30').material_select();
				}
			}
		}
		
		function _checkEndDate() {
			var s_date = moment($date.val() + 'T' + $s_time.val()); 
			var e_date = moment($date.val() + 'T' + $e_time.val());
			if (e_date.diff(s_date) < 0) {
				// 종료일을 시작일보다 이전으로 설정하는 경우
				$e_time.parent().find('input').addClass('invalid');
			} else {
				$e_time.parent().find('input').removeClass('invalid');
			}
		}
		
		function _getTimeHtml() {
			var html_time = '';
			var now = moment();
			now.set({'hour':0, 'minute':0, 'second':0, 'millisecond':0});
			
			var ckdate = now.clone();
			ckdate.add(1, 'day');
			
			while (now.format() != ckdate.format()) {
				html_time += '<option value="' + now.format('HH:mm') + '">' + now.format('LT') + '</option>';
				now.add(30, 'minutes');
			}
			return html_time;
		}
		
		// 
		$(document).off('click.taskedit').on('click.taskedit', function(e){
			if ($(e.target).closest('.qtip').length) return;	// 
			if ($('.mbsc-popup-overlay').length) return; // 달력 표시된 경우
			
			var $current = $(e.target).closest('.task-each').get(0);
			
			var $check = $('.task-each.edit');
			$check.each(function(){
				var $this = $(this);
				if ($this.get(0) == $current) {
				} else {
					_self.updateTaskCheck($this);
				}
			});
			
			// 편집중인 창이 없으면 이벤트 제거
			if ($('.task-each.edit').length == 0) {
				$(document).off('click.taskedit');
			}
		});
		
		// 기존에 저장된 값이 있는 경우 처리
		var info = $li.data('info');
		if (info.start) {
			if (info.allday) {
				var sdt = moment(info.start.substr(0, info.start.indexOf('T')));
				$all_check.find('.all-day-check').attr('checked', true);
			} else {
				var sdt = moment(info.start);
				var edt = moment(info.end);
				
				$s_time.val(sdt.format('HH:mm')).prop('disabled', false);
				$e_time.val(edt.format('HH:mm')).prop('disabled', false);
				
				//$all_check.find('.all-day-check').attr('checked', false);
				
				$all_check.find('.all-day-check').click();
				
				
				
			}
			$date.mobiscroll('getInst').setVal(sdt.format('YYYY-MM-DD'));
		}
		if (info.work) {
			$work_check.find('.task-work-check').attr('checked', true);
		}
		
		// DOM 추가
		$li.find('.edit-wrap').append($subj_edit)
								.append($date_wrap)
								.append($time_wrap)
								.append($work_check);
		$li.addClass('edit');
		
		$s_time.material_select();
		$e_time.material_select();
		$subj_edit.focus();
	},
	
	"createTaskWrap" : function(cate){
		var $list = $('#task_list');
		if (!cate) cate = 'no_date';
		
		var $wrap = $list.find('.task-category-wrap[data-category="' + cate + '"]');
		if ($wrap.length == 0) {
			var cate_txt = '';
			var html = 
				'<div data-category="' + cate + '" class="task-category-wrap">' +
				'	<div class="task-category-title"></div>' +
				'	<ul class="task-list"></ul>' +
				'</div>';
			$wrap = $(html);			
			
			if (cate == 'no_date') {
				
				// 마감일이 제일 위에 등록되어 야 함
				cate_txt = gap.lang.no_deadline;		
				$list.prepend($wrap);
				
			} else if (cate== 'over_date') {
				$wrap.addClass('over-date');
				
				// 마감일 없음 다음으로 들어가야 함
				cate_txt = gap.lang.exceed_deadline;
				var $target = $list.find('.task-category-wrap[data-category="no_date"]');
				if ($target.length) {
					$target.after($wrap);
				} else {
					$list.prepend($wrap);
				}
				
			} else {
				
				var $target = '';
				$list.find('.task-category-wrap').each(function(){
					if (!isNaN($(this).data('category'))) {
						if ($(this).data('category') < cate) {
							$target = $(this);
						}
					} else {
						// no_date, over_date
						$target = $(this);
					}
				});
				if ($target) {
					$target.after($wrap);
				} else {
					$list.prepend($wrap);
				}
				cate_txt = moment(cate).format('YYYY-MM-DD');
				
			}
			$wrap.find('.task-category-title').text(cate_txt);
			
			
			
		}
	},
	
	// Task 작성하기
	"createTask" : function(){
		var _self = this;
		
		// 기존에 생성해놓은 Input 태그가 있는 경우
		if ( $('#task_new_input').length ) { $('#task_new_input').parent().remove(); }
		
		// Task 작성하기 UI 적용
		var $input_new = $('<div class="task-new-input-wrap"></div>');
		$input_new.append('<input type="text" id="task_new_input" class="task-input formInput" placeholder="제목">');
		$input_new.append('<span class="bar"></span>');
		
		$('#main_task .ma-r-btn-wrap').append($input_new);

		
		$('#task_new_input').on('keydown', function(e){
			if (e.keyCode == 13) {
				var subj = $.trim($(this).val());
				
				if (subj == '') return false;
				
				// 진행중인 경우 리턴 처리
				if ($(this).hasClass('process')) return false;

				/*
				// 저장할지 말지 정의해야 함
				$(this).parent().remove();
				*/
				
				// 일단 등록되었다고 가정
				_self.createTaskReq(subj);
			}
		});
		

		$('#task_new_input').on('blur', function(e){
			$(this).parent().remove();
		});

	},

	"createTaskScheduleDrag" : function(event){
		// 타임라인에서 시간 Drag해서 Task를 생성하는 경우
		var _self = this;
		var evt = event.event;
		var obj = {
			opt: 'C',
			unid: 'temp',
			title: evt.title,
			start: moment(evt.start).utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
			end: moment(evt.end).utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
			allday: false,
			system: 'task'
		};
		_self.calendarAPI(obj).then(function(res){
			var ret = $.trim(res).split('^');
			if (ret[0] == 'SUCCESS' && ret.length >= 4) {
				evt.id = ret[3];
				
				// Task에 등록해주고, 편집상태로 열어준다
				var task = {
					key: evt.id,
					title: evt.title,
					allday: false,
					start: moment(evt.start).format(),
					end: moment(evt.end).format()
				};
				var $li = _self.createTaskDone(task);
				$('#main_right_wrap').addClass('show-task');
				setTimeout(function(){
					$li.find('.subj-wrap').click();
				}, 300);
			}
		});
	},
	"createTaskReq" : function(subj){
		var _self = this;
		$('#task_new_input').addClass('process');
		
		var _param = {
			subject: subj,
			ms: mailserver
		};
		
		$.ajax({
			url: "/" + mailfile + "/(agt_task_create)?OpenAgent&" + $.param(_param),
			dataType: 'json',
			success: function(res){
				if (res.result == 'OK') {
					var task = {title: subj, key: res.unid, allday: true, work: false};
					_self.createTaskDone(task, true);
				}
				$('#task_new_input').val('').removeClass('process');
			},
			error: function(){
				$('#task_new_input').removeClass('process');
			}
		});
		
	},
	
	"createTaskDone" : function(task, is_new){
		var _self = this;
		var $li = $('<li class="task-each' + (task.work ? ' work' : '')  + '" data-key="' + task.key + '"></li>');
		var html = 
			'<div class="task-wrap">' +
			'	<span class="task-check"></span>' +
			'	<div class="edit-wrap"></div>' +
			'	<div class="subj-wrap"><span class="task-subj" title="' + task.title + '">' + gap.HtmlToText(task.title) + '</span><span class="task-date"></span></div>' +
			'	<div class="btn-action"><span></span><span></span><span></span></div>' +
			'</div>';
		$li.data('info', task);
		$li.append(html);

		// 제목 클릭 시 편집되도록 처리
		$li.find('.subj-wrap').on('click', function(){
			// 완료된 항목에서는 편집 안되도록 수정
			if ($li.parent().hasClass('complete')) return;
			_self.changeTaskEditMode($li);
		});
		
		var cate = 'no_date';
		
		if (is_new) {
			$li.data('info').cate = cate;
			this.createTaskWrap();
			$('#task_list_wrap').animate({scrollTop:0}, 100);
			$('#task_list').find('.task-category-wrap[data-category="no_date"] .task-list').prepend($li);
			$li.hide().delay(100).slideDown();
			this.taskCountCheck();
		} else {
			// 기존에 저장된 데이터는 날짜별 카테고리로 만들어서 넣어야 함
			var date_info = '';
			if (task.start) {
				if (task.allday) {
					cate = task.start.substr(0, task.start.indexOf('T'));
				} else {
					cate = moment(task.start).format('YYYYMMDD');
					
					var date_info = moment(task.start).format('LT');
					//$li.append('<div class="date-info">' + date_info + '</div>');
					$li.find('.subj-wrap .task-date').text(date_info);
				}
				var now = moment().format('YYYYMMDD');				
				if (cate < now) {
					cate = 'over_date'
				}
			}
			$li.data('info').cate = cate;
			this.createTaskWrap(cate);
			$('#task_list').find('.task-category-wrap[data-category="' + cate + '"] .task-list').append($li);
		}
		
		this.taskDragEvent($li);
		this.emptyTaskCheck();
		
		return $li;
	},
	
	"taskDragEvent" : function($li){
		var _self = this;
		
		// Draggable 이벤트
		$li.draggable({
			appendTo: 'body',
			scroll: false,
			cursor: 'move',
			cursorAt: { top: -12, left: -20 },
			distance: 30,
			helper: function( event ) {
				var info = $(event.currentTarget).data('info');
				var _cls = info.work ? 'work' : 'private';	// work | private
				return $( "<div class='task-drag-helper " + _cls + "'>" + info.title + "</div>" );
			},
			start: function( event, ui ){
				// 내 캘린더를 보고 있을때만 작동해야 함
				if (!$('#main_own_cal .user').hasClass('on')) {
					return false;
				}
				
				_self.task_dragging = true;
				$('#main_cal .mbsc-calendar-day-labels').droppable({
					tolerance: 'pointer',
					drop: function(drop_event, drop_ui){
						_self.changeTaskDate(drop_ui.draggable);
					}
				});
			},
			stop: function() {
				$('#main_cal .mbsc-calendar-day-labels').droppable('destroy');
			}
		});
	},
	
	"createCompleteTask" : function(task){
		var _self = this;
		var $li = $('<li class="task-each' + (task.work ? ' work' : '') + '" data-key="' + task.key + '"></li>');
		var html = 
			'<div class="task-wrap complete">' +
			'	<span class="task-check"></span>' +
			'	<div class="edit-wrap"></div>' +
			'	<div class="subj-wrap"><span class="task-subj" title="' + task.title + '">' + task.title + '</span><span class="task-date"></span></div>' +
			'	<div class="btn-action"><span></span><span></span><span></span></div>' +
			'</div>';
		$li.data('info', task);
		$li.append(html);
		
		// 제목 클릭 시 편집되도록 처리
		$li.find('.subj-wrap').on('click', function(){
			// 완료된 항목에서는 편집 안되도록 수정
			if ($li.parent().hasClass('complete')) return;
			_self.changeTaskEditMode($li);
		});
		
		var cate = 'no_date';
		// 기존에 저장된 데이터는 날짜별 카테고리로 만들어서 넣어야 함
		if (task.start) {
			if (task.allday) {
				cate = task.start.substr(0, task.start.indexOf('T'));
			} else {
				cate = moment(task.start).format('YYYYMMDD');
			}
			var now = moment().format('YYYYMMDD');
			if (cate < now) {
				cate = 'over_date'
			}
		}
		$li.data('info').cate = cate;
		$('#task_list_complete').append($li);
		
	},
	
	// 하루의 이벤트 데이터 가져오기
	"getDayEvent" : function(mf, dt, etc_info){
		var _self = this;
		var sel_day = moment(dt).format('YYYYMMDD');
		var s_key = moment(sel_day + 'T000000').add(-1, 'days').utc().format('YYYYMMDDTHHmmss[Z]'); // 로컬타임존에서 -1일 한 후 UTC로 변환
		var e_key = moment(sel_day + 'T235959').add(1, 'days').utc().format('YYYYMMDDTHHmmss[Z]'); // 로컬타임존에서 +1일 한 후 UTC로 변환
		
		
		var is_my_event = window.mailfile == mf;
		
		var url = '/' + mf + '/CustomEventList?ReadViewEntries&count=9999&StartKey=' + s_key + '&UntilKey=' + e_key + '&KeyType=time&outputformat=json';
		return $.ajax({
			url: url
		}).then(function(res){
			var evt_list = [];
			var dupl_doc = {};	//중복체크
			
			if (res.viewentry) {
				$.each(res.viewentry, function(idx, val){
					var evt = _self.getEventJson(val);
					if (!evt) return true;
					
					// 초대 양식은 표시 안함
					if (evt.type == 'Notice') return true;
					
					if (!evt.start || !evt.end) {
						return true;
					}
					if (evt.start.format("YYYYMMDD") > sel_day) return true;
					if (evt.end.format("YYYYMMDD") < sel_day) return true;
					
					// 중복 여부 체크 : 중복이 존재하는 경우
					// 1. 반복 문서
					// 2. 하루이상 기간 문서
					if (dupl_doc[evt.id]) {
						if (evt.type.indexOf('Repeat') == -1) {
							return true;
						}
					} else {
						dupl_doc[evt.id] = true;
					}
					
					// 다른 사람의 비공개 일정은 표시하지 않음
					if (!is_my_event && evt.ShowPS == '1') return true;
					
					// 색상 정보 셋팅
					if (_self.getEventType(evt) == "work") {
						evt.color = _self.color_work;
					} else {
						evt.color = _self.color_private;
					}
					
					// 공유/구독 캘린더는 etc_info가 넘어옴
					if (etc_info) {
						if (etc_info.caltype == 'SharedCalendar') {
							evt.cal_type = 'share';
						} else if (etc_info.caltype == 'SubscribeCalendar') {
							evt.cal_type = 'subscribe';
						}
						evt.mailServer = etc_info.mailServer;
						evt.mailFile = etc_info.mailFile;
					} else {
						evt.cal_type = 'calendar';
					}

					evt_list.push(evt);
					
				}); // end each
			}	
			return evt_list;
			
		}, function(){
			return [];
		});
		
	},
	
	"getEventType" : function(evt){
		// 비공개 일정인 경우 개인으로 등록
		if (evt.ShowPS == "1" || evt.ShowPS == "2") {
			var type = "private";
		} else {
			var type = "work";
		}
		
		return type;
	},
	
	"addLeftEventList" : function(evt){
		var $list = $('#event_list');
		var dt = '';
		var chair = '';
		var title = evt.title;
		
		// 날짜
		if (evt.allday) {
			dt = gap.lang.allday;
		} else {
			dt = evt.start.format('HH:mm')+ ' ~ ' + evt.end.format('HH:mm');
		}
		
		html = 
			'<li class="evt-li">' +
			'	<div class="ty-wrap"></div>' +
			'	<div class="cont-wrap">' +
			'		<div class="date">' + dt + '</div>' +
			//'		<div class="chair">주최자 : 길동이</div>' +
			'		<div class="title">' + title + '</div>' +
			'	</div>' +
			'</li>';
		
		$list.append(html);
	},
	
	"getMonthEvent" : function(s_key, e_key){
		var _self = this;
		var mf = this.getUserMailPath();
		var url = '/' + mf + '/CustomEventList?ReadViewEntries&count=9999&StartKey=' + s_key + '&UntilKey=' + e_key + '&KeyType=time&outputformat=json';
		return $.ajax({
			url: url,
			success: function(res){
				if (!res.viewentry) return;
				var dupl_doc = {};	//중복체크
				var dupl_date = {};	//중복체크
				var marked = [];
				
				$.each(res.viewentry, function(idx, val){
					
					var evt = _self.getEventJson(val);
					if (!evt) return true;
					
					
					// 중복 여부 체크 : 중복이 존재하는 경우
					// 1. 반복 문서
					// 2. 하루이상 기간 문서
					if (dupl_doc[evt.id]) {
						if (evt.type.indexOf('Repeat') == -1) {
							return true;
						}
					} else {
						dupl_doc[evt.id] = true;
					}
									
					/*
					var ck_date = '';
					// 시작일과 종료일이 다른 경우 여러날에 걸쳐 마킹해야 함
					
					if (start.format("YYYYMMDD") != end.format("YYYYMMDD")) {
						var ck_start = moment(start);
						var ck_end = moment(end);
						var limit_cnt = 30; // 최대 30개까지 카운트
						var cnt = 0;
						while (ck_start.format("YYYYMMDD") <= ck_end.format("YYYYMMDD")) {
							cnt++;
							if (cnt >= limit_cnt) break;
							
							// 날짜 중복 체크 (이벤트가 여러개여도 마킹을 하나만 하기 위해 날짜 중복 체크함)
							ck_date = ck_start.format("YYYYMMDD");
							if (dupl_date[ck_date]) {
								// 중복이면 추가로 안넣음
							} else {
								dupl_date[ck_date] = true;
								marked.push({date: moment(ck_start), color: '#7e56bd'});
							}
							ck_start.add(1, "days");
						}
						
					} else {
						// 날짜 중복 체크 (이벤트가 여러개여도 마킹을 하나만 하기 위해 날짜 중복 체크함)
						ck_date = start.format("YYYYMMDD");
						if (dupl_date[ck_date]) {
							// 중복이면 추가로 안넣음
						} else {
							dupl_date[ck_date] = true;
							marked.push({date: moment(start), color: '#7e56bd'});
						}
					}
					*/
					
					var ck_date = '';
					var ck_start = moment(evt.start);
					var ck_end = moment(evt.end);
					var limit_cnt = 30; // 최대 30개까지 카운트 (무한루프 방지)
					var ck_cnt = 0;
					while (ck_start.format("YYYYMMDD") <= ck_end.format("YYYYMMDD")) {
						ck_cnt++;
						if (ck_cnt >= limit_cnt) break;
						
						// 날짜 중복 체크 (이벤트가 여러개여도 마킹을 하나만 하기 위해 날짜 중복 체크)
						ck_date = ck_start.format("YYYYMMDD");
						if (dupl_date[ck_date]) {
							// 중복이면 추가 안함
						} else {
							dupl_date[ck_date] = true;
							marked.push({date: moment(ck_start), color: '#7e56bd'});
						}
						ck_start.add(1, "days");
					}

					

				}); // end each
				
				_self.minical.setOptions({'marked': marked});				
				
			}
		});
	},
	
	
	"getUserEvent" : function(s_key, e_key, pass_status, inst){
		var _self = this;
				
		// 사용자에 따라 mailfile을 계산해줘야 함
		var mf = this.getUserMailPath();
		
		// 등록되고 체크된 전체 사용자의 데이터를 가져옴
		var url = '/' + mf + '/CustomEventList?ReadViewEntries&count=9999&StartKey=' + s_key + '&UntilKey=' + e_key + '&KeyType=time&outputformat=json';
		
		_self.setMainCalEvent(url, inst);
		
		if (!pass_status) {
			if (_self.req_status) {
				_self.req_status.abort();
			}
			_self.req_status = _self.setUserStatus(s_key, e_key);
		}
	},
	"getMainType" : function(){
		return $('[name="main_type"]:checked').val();
	},
	"setMainType" : function(type){
		var $radio = $('[name="main_type"][value="' + type + '"]');
		$radio.prop('checked', true).click();
	},
	"setUserStatus" : function(sdate, edate, cal_type){
		// km으로 가져오는 방식		
		var _self = this;
		
		// 캘린더 타입에 맞게 사용자 정보 가져오기
		if (cal_type == 'side') {
			user_id = $('#side_oth_cal_wrap .user.on').data('info').id;
		} else {
			user_id = $('#main_oth_cal_wrap .user.on').data('info').id;
		}
		
		var user = new NotesName(user_id);
		if (user.isHierarchical) {
			// NotesName인 경우 사번만 추출
			user_id = user.orgUnit1;
		}
		var postData = {
			ky: user_id,
			st: sdate,
			et: edate
		};
		
		var url = gap.channelserver + '/search_vacation.km';
		return $.ajax({
			type: 'post',
			url: url,
			dataType : "json",
			data : JSON.stringify(postData),
			success: function(res){
				if (res.result == 'OK') {
					if (res.data && Array.isArray(res.data.response) && res.data.response[0].id) {

						if (cal_type == 'side') {
							var disp_id = $('#side_oth_cal_wrap .user.on').data('info').id;
						} else {
							var disp_id = $('#main_oth_cal_wrap .user.on').data('info').id;
						}
						
						var user = new NotesName(disp_id);
						if (user.isHierarchical) {
							disp_id = user.orgUnit1; 
						}
						
						var user_id = res.data.response[0].id;
						user = new NotesName(user_id);
						if (user.isHierarchical) {
							user_id = user.orgUnit1; 
						}
						
						if (user_id == disp_id) {
							_self.showVacation(res.data.response[0].Data, cal_type);
						}
					}
				}
			}
		});
	},
	
	"showVacation" : function(data, cal_type){
		var _self = this;
		$.each(data, function(){
			if (this.st != this.et && this.st < this.et) {
				var s_date = moment(this.st);
				var e_date = moment(this.et);
				
				while (s_date.format('YYYYMMDD') <= e_date.format('YYYYMMDD')) {
					var dt = s_date.format('YYYYMMDD');
					_self.checkStatus(dt, this.Vaca_Type, cal_type);
					s_date.add(1, 'day');
				}
				// 시작일과 종료일이 다른 경우
			} else {
				_self.checkStatus(this.st, this.Vaca_Type, cal_type);
			}
		});
	},
	"checkStatus" : function(dt, vaca_type, cal_type){
		var txt = gOrg.userDayText(vaca_type);

		
		// 기존에 표시하고 있는 값이 있으면 조건에 따라 표시할지 말지 처리한다
		if (cal_type == 'side') {
			var $el = $('#side_cal .maincal_status_' + dt).closest('.mbsc-calendar-cell-inner');
		} else {
			var $el = $('#main_cal .maincal_status_' + dt);
		}
		
		if ($el.length == 0) return;
		
		var flag = true;
		var cls = $el.attr('class').split(/\s+/);
		$.each(cls, function(){
			// 기존에 먼저 뿌려진 상태값이 있는 경우
			if (this.indexOf('day_') != -1) {
				var a_stat = parseInt(this.split('_')[1]);
				var b_stat = parseInt(vaca_type);
				
				// 값이 더 큰 경우 표시하지 않음
				if (a_stat < b_stat) {
					flag = false;
					return false;
				}
			}
		});
		
		if (flag) {
			if (cal_type == 'side') {
				$el.removeClass('day_1 day_2 day_3 day_4 day_5 day_6 day_7 day_8 day_9 day_10 day_11');
				$el.addClass('biz_check day_' + vaca_type).data('type', vaca_type);
				
				// 사이드 달력은 하단 날짜에 맞춰 상태값 표시해야 함
				var sel_dt = moment(this.sidecal._selected);
				if (sel_dt == dt) {
					var $side_stat = $('#day_event_layer .status');
					$side_stat.removeClass('day_1 day_2 day_3 day_4 day_5 day_6 day_7 day_8 day_9 day_10 day_11');
					$side_stat.text(txt);
				}
				
			} else {
				$el.removeClass('day_1 day_2 day_3 day_4 day_5 day_6 day_7 day_8 day_9 day_10 day_11');
				$el.addClass('day_' + vaca_type);
				$el.html('<span>' + txt + '</span>');
			}
		}
	},
	"showVacation_bak" : function(data){
		/*
		// 이전에 표시되던 사항을 안보이게 처리한다
		$('.main-cal-status').each(function(){
			// 출장, 교육, 휴무는 캘린더에서 연동되서 저장되므로 예외처리 (day_7, day_8, day_10)
			$(this).removeClass('day_1 day_2 day_3 day_4 day_5 day_6 day_9').text('');
		});
		*/
		
		$.each(data, function(){
			var txt = gOrg.userDayText(this.VacaType);
			var dt = moment(this.VacaDate).format('YYYYMMDD');
			$('.maincal_status_' + dt).text(txt).addClass('day_' + this.VacaType);
		});
	},
	"setMainCalEvent" : function(url, inst){
		var is_my_event = mailfile == this.getUserMailPath();
		var _self = this;
		$.ajax({
			url: url,
			success: function(res){
				var dupl_doc = {};	//중복체크
				var evt_list = {};	// {20220518:{"work":1, "}}
				var events = [];				
				
				$.each(res.viewentry, function(idx, val){
					
					var evt = _self.getEventJson(val);
					if (!evt) return true;
					
					// 초대 양식은 표시 안함
					if (evt.type == 'Notice') return true;
					
					// 완료된 일정은 표시 안함
					//if (evt.completed == 'T') return true;
					
					// 중복 여부 체크 : 중복이 존재하는 경우
					// 1. 반복 문서
					// 2. 하루이상 기간 문서
					if (dupl_doc[evt.id]) {
						if (evt.type.indexOf('Repeat') == -1) {
							return true;
						}
					} else {
						dupl_doc[evt.id] = true;
					}
					
					// 다른 사람의 비공개 일정은 카운트하면 안됨
					if (!is_my_event && evt.ShowPS == "1") {
						return true;
					}
					
					if (!evt.start || !evt.end) {
						return true;
					}
					
					var ck_start = moment(evt.start);
					var ck_end = moment(evt.end);
					var limit_cnt = 45; // 최대 45개까지 카운트 (1개월 달력에 표시가능한 개수만큼만 체크)
					var ck_cnt = 0;
					while (ck_start.format("YYYYMMDD") <= ck_end.format("YYYYMMDD")) {
						ck_cnt++;
						if (ck_cnt >= limit_cnt) break;
						
						// 날짜 중복 체크 (이벤트가 여러개여도 마킹을 하나만 하기 위해 날짜 중복 체크)
						ck_date = ck_start.format("YYYYMMDD");
						_self.addEventCount(evt_list, ck_date, evt);
						
						
						// 상태 셋팅  (5:출장, 7:교육, 10:휴무)
						if (evt.apt_cate == '5') { // 출장
							_self.checkStatus(ck_date, '7');
						} else if (evt.apt_cate == '7') { // 교육
							_self.checkStatus(ck_date, '8');
						} else if (evt.apt_cate == '10' && evt.system_code != 'task') { // 휴무 (d)
							_self.checkStatus(ck_date, '10');
						}
						
						
						ck_start.add(1, "days");
					}
					
					
					evt.type = _self.getEventType(evt);
					events.push(evt);
				});
				
				_self.event_type_1 = _self.makeEventList(evt_list);
				_self.event_type_2 = events;
				
				if (_self.getMainType() == '1') {
					inst.setEvents(_self.event_type_1);
				} else {
					inst.setEvents(_self.event_type_2);
				}
				
				// 만약에 내 일정을 보는 경우 공유 캘린더와 구독 캘린더 정보 가져오기
				if (is_my_event) {
					// 캘린더 로딩이 완료되어야 처리 가능
					_self.cal_load_complete.then(function(){
						_self.checkEtcCalendar();
					});
				} else {
					_self.gotoScrollToday();
				}
			},
			error: function(){
				inst.setEvents([]);
			}
		});
	},
	"addEventCount" : function(evt_list, dt, evt){
		
		if (!evt_list[dt]) {evt_list[dt] = {};}
		
		// 기존에 해당 날짜에 값이 있는 경우
		var type = this.getEventType(evt);	//work, private
		
		if ( evt_list[dt][type] ) {
			evt_list[dt][type] = evt_list[dt][type] + 1;
		} else {
			evt_list[dt][type] = 1;
		}
	},
	
	"makeEventList" : function(data){
		var _self = this;
		var events = [];
		$.each(data, function(key, val){
			if (val["work"]) {
				events.push({
					type: 'work',
					start: moment(key+"T000000"),
					title: gap.lang.work_schedule + ' (' + val["work"] + ')',
					color: _self.color_work 
					
				});
			}
			
			if (val["private"]) {
				events.push({
					type: 'private',
					start: moment(key+"T000001"),
					title: gap.lang.private_schedule + ' (' + val["private"] + ')',
					color: _self.color_private
				});
			}
		});
		return events;
	},
	
	"checkEtcCalendar" : function(){
		// 공유 캘린더와 구독 캘린더 정보 가져오기
		
		var _self = this;
		
		// 요청중인 건이 있으면 취소 처리
		if (this.cal_defs) {
			$.each(this.cal_defs, function(idx, val){
				val.reject();
			});
		}
		
		this.cal_defs = [];
		this.cal_data = [];
		
		// 공유 캘린더 처리
		$.each(_self.share_cal, function(){
			if (this.disable != '1') {
				_self.cal_defs.push(_self.getEtcCalendarData(this));				
			}
		});
		
		// 구독 캘린더 처리
		$.each(_self.sub_cal, function(){
			if (this.disable != '1') {
				_self.cal_defs.push(_self.getEtcCalendarData(this));				
			}
		});
		
		// 모든 데이터 취합 후 
		$.when.apply($, this.cal_defs).always(function(){
			if (_self.cal_data.length > 0) {
				_self.maincal.addEvent(_self.cal_data);
			}
			
			// 오늘날짜인 경우 스크롤 처리
			_self.gotoScrollToday();
		});
	},
	
	"getEtcCalendarData" : function(info){
		var _self = this;
		var def = $.Deferred();
	
		
		var first_day = moment(_self.maincal._calendarView._firstPageDay).format();
		var last_day = moment(_self.maincal._calendarView._lastPageDay).format();
		var s_key = moment(first_day).add(-1, 'days').format('YYYYMMDD[T000000Z]');
		var e_key = moment(last_day).add(1, 'days').format('YYYYMMDD[T235959Z]');

		var url = '/' + info.mailFile + '/CustomEventList?ReadViewEntries&count=9999&StartKey=' + s_key + '&UntilKey=' + e_key + '&KeyType=time&outputformat=json';
		
		$.ajax({
			url: url,
			dataType: 'json',
			success: function(res){
				var dupl_doc = {};	//중복체크
				var evt_list = {};	// {20220518:{"work":1, "}}
				var events = [];
				
				$.each(res.viewentry, function(idx, val){
					
					var evt = _self.getEventJson(val);
					if (!evt) return true;
					
					// 초대 양식은 표시 안함
					if (evt.type == 'Notice') return true;
					
					// 완료된 일정은 표시 안함
					//if (evt.completed == 'T') return true;
					
					// 중복 여부 체크 : 중복이 존재하는 경우
					// 1. 반복 문서
					// 2. 하루이상 기간 문서
					if (dupl_doc[evt.id]) {
						if (evt.type.indexOf('Repeat') == -1) {
							return true;
						}
					} else {
						dupl_doc[evt.id] = true;
					}
					
					if (!evt.start || !evt.end) {
						return true;
					}
					
					var ck_start = moment(evt.start);
					var ck_end = moment(evt.end);
					var limit_cnt = 45; // 최대 45개까지 카운트 (1개월 달력에 표시가능한 개수만큼만 체크)
					var ck_cnt = 0;
					while (ck_start.format("YYYYMMDD") <= ck_end.format("YYYYMMDD")) {
						ck_cnt++;
						if (ck_cnt >= limit_cnt) break;
						
						// 날짜 중복 체크 (이벤트가 여러개여도 마킹을 하나만 하기 위해 날짜 중복 체크)
						ck_date = ck_start.format("YYYYMMDD");
						//_self.addEventCount(evt_list, ck_date, evt);
						
						
						/*
						// 상태 셋팅  (5:출장, 7:교육, 10:휴무)
						if (evt.apt_cate == '5') { // 출장
							var txt = gOrg.userDayText('7');
							$('.maincal_status_' + ck_date).removeClass('day_1 day_2 day_3 day_4 day_5 day_6 day_7 day_8 day_9 day_10').html('<span>' + txt + '</span>').addClass('day_7');
						} else if (evt.apt_cate == '7') { // 교육
							var txt = gOrg.userDayText('8');
							$('.maincal_status_' + ck_date).removeClass('day_1 day_2 day_3 day_4 day_5 day_6 day_7 day_8 day_9 day_10').html('<span>' + txt + '</span>').addClass('day_8');
						} else if (evt.apt_cate == '10' && evt.system_code != 'task') { // 휴무 (d)
							var txt = gOrg.userDayText('10');
							$('.maincal_status_' + ck_date).removeClass('day_1 day_2 day_3 day_4 day_5 day_6 day_7 day_8 day_9 day_10').html('<span>' + txt + '</span>').addClass('day_10');
						}
						*/
						
						ck_start.add(1, "days");
					}
					
					
					evt.type = _self.getEventType(evt);
					
					// 제목에 말머리 추가
					if (info.id.indexOf('~') != -1) {
						evt.title = '[' + gap.lang.share_header + '] ' + evt.title;
					} else if (info.id.indexOf('!') != -1) {
						evt.title = '[' + gap.lang.subscribe_header + '] ' + evt.title;
					}
					
					evt.mailServer = info.mailServer;
					evt.mailFile = info.mailFile;
					
					_self.cal_data.push(evt);
					_self.event_type_2.push(evt); // 타입변경시 event_type_2 데이터를 가지고 하기 때문에 여기서 처리
				});
				
				/*
				_self.event_type_1 = _self.makeEventList(evt_list);
				_self.event_type_2 = events;
				
				if (_self.getMainType() == '1') {
					_self.maincal.setEvents(_self.event_type_1);
				} else {
					_self.maincal.setEvents(_self.event_type_2);
				}
				*/
			}
		}).always(function(){
			def.resolve();	// 성공이든 실패든 완료처리
		});
		
		
		return def;
	},
	
	"setMainCalEvent_bak" : function(url){
		var _self = this;
		var events = [];
		$.ajax({
			url: url,
			success: function(res){
				if (!res.viewentry) return;
				var dupl_doc = {};	//중복체크
				var marked = [];
				
				$.each(res.viewentry, function(idx, val){
					
					var evt = _self.getEventJson(val);
					if (!evt) return true;
					
					
					// 중복 여부 체크 : 중복이 존재하는 경우
					// 1. 반복 문서
					// 2. 하루이상 기간 문서
					if (dupl_doc[val['@unid']]) {
						if (evt.type.indexOf('Repeat') == -1) {
							return true;
						}
					} else {
						dupl_doc[val['@unid']] = true;
					}
					
					
					events.push({
						id: val['@unid'],
						allDay: evt.allday,
					    start: evt.start,
					    end: evt.end,
						title: evt.title
					});	
					
	
				}); // end each
				_self.maincal.setEvents(events);
			}
		});
	},
	
	"getUserMailPath" : function(){
		var cal_type = $('input[name="main_lay_type"]:checked').val();
		
		
		// 현재 선택된 사용자의 MailPath 정보를 맅넌
		if (cal_type == 'calendar') {
			var sel_user = $('#main_oth_cal_wrap').find('.user.on');			
		} else {
			var sel_user = $('#side_oth_cal_wrap').find('.user.on');
		}
		
		// 선택된 사용자가 없는 경우 내 mailfile정보를 리턴
		if (sel_user.length == 0) { return window.mailfile; }
		
		var info = sel_user.data('info');
		if (!info) { return; }
		
		return info.mailFile;
	},
	
	"getUserInfo" : function(){
		// 현재 선택된 사용자의 MailPath 정보를 맅넌
		var wrap_id = this.getMainLayoutType() == 'calendar' ? 'main_oth_cal_wrap' : 'side_oth_cal_wrap';
		var sel_user = $('#' + wrap_id).find('.user.on');
		
		// 선택된 사용자가 없는 경우 내 mailfile정보를 리턴
		if (sel_user.length == 0) { return; }
		
		var info = sel_user.data('info');
		if (!info) { return; }
		
		return info;
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
	},
	
	"getEventJson" : function(val){
		var _self = this;
		var data = {};
		data.id				= val['@unid'];
		data.start 			= _self.getValueByName(val, '$144');
		data.start 			= (data.start == '' ? _self.getValueByName(val, '$134') : data.start);

		data.date_type 		= _self.getValueByName(val, '_DateType');
		data.date_type 		= data.date_type == undefined || data.date_type == "undefined" ? "" : data.date_type;
		
		var _allday	 		= _self.getValueByName(val, '_AllDay');
		data.allday			= data.apt_type == '1' || (data.apt_type == '2' && data.date_type != '2') || _allday == '1' ? true : false;
		
		data.end			= _self.getValueByName(val, '$146');
		data.title 			= _self.getValueByName(val, '$147').replace(/\[\$NOSUBJECT\$\]/g, gap.lang.no_subject); // TODO(lang)
		
		data.type 			= _self.getValueByName(val, '$Type');
		data.apt_type 		= _self.getValueByName(val, '$152');
		data.colorinfo 		= _self.getValueByName(val, '$Color').split('|');
		data.chair			= _self.getValueByName(val, 'Chair_id');
		data.owner			= _self.getValueByName(val, 'Owner_id');
		data.attendee		= _self.getValueByName(val, '$Custom').split('|')[0];
		data.location		= _self.getValueByName(val, '$Custom').split('|')[1];
		data.notice_type	= _self.getValueByName(val, '$Custom').split('|')[2];
		data.org_confideltial = _self.getValueByName(val, '$154');
		data.ShowPS 		= _self.getValueByName(val, '_ShowPS');			
		data.chair_notesid 	= _self.getValueByName(val, '_ChairNotesID');
		data.sd				= _self.getValueByName(val, '$StartDate');
		data.ed				= _self.getValueByName(val, '$EndDate');
		data.apt_cate		= _self.getValueByName(val, '_ApptCategory');
		
		
		data.completed		= _self.getValueByName(val, '_Completion');
		data.priority		= _self.getValueByName(val, '_Priority');
		data.system_code	= _self.getValueByName(val, '_SystemCode');
		data.system_key		= _self.getValueByName(val, '_SystemKeyCode');
		
		
		data.allDay			= data.allday;
		
		// 변환처리
		data.title = gap.HtmlToText(data.title);
		
		
		//시작일이 없으면 가져오지 않음
		if (data.start == '') {
			return false;
		}
		
		//iNotes 일정에 저장된 휴일 정보는 가져오지 않음
		if (data.type == 'Holiday') {
			return false;
		}				
		
		var _ori_start = moment(data.start).utc().format("YYYYMMDDTHHmmss")+",00Z"
		var _ori_end = moment(data.end).utc().format("YYYYMMDDTHHmmss")+",00Z"
		
		data.start = moment(_ori_start.split(',')[0] +'Z');
		data.end = data.end == '' ? '' : moment(_ori_end.split(',')[0] + 'Z');

		
		
		if (data.allday) {
			// 종일 일정은 타임존 계산안되도록 예외 처리 (사용자가 설정한 날짜 그대로 표시)
			if (data.sd) {
				if (data.sd.indexOf('T') > 0) data.sd = data.sd.substring(0, data.sd.indexOf('T'));
				data.start = moment(data.sd);
			}
			if (data.ed) {
				if (data.ed.indexOf('T') > 0) data.ed = data.ed.substring(0, data.ed.indexOf('T'));
				data.end = moment(data.ed);
			}
		} 
		
		// 다른 사람의 일정을 표시할 때는 시간만 공개인지 확인
		if (window.mailfile != this.getUserMailPath()) {
			if (data.ShowPS == '2') {
				data.title = gap.lang.private_schedule2;
			}
		}
		
		return data;
	},
	
	"getTaskJson" : function(val){
		var _self = this;
		var data = {};
		
		data.start 			= _self.getValueByName(val, '$StartDateTime');
		data.end			= _self.getValueByName(val, '$EndDateTime');
		data.allday			= _self.getValueByName(val, '_AllDay') == '1' ? true : false;
		data.title 			= _self.getValueByName(val, '$Subject').replace(/\[\$NOSUBJECT\$\]/g, gap.lang.no_subject);
		data.work			= _self.getValueByName(val, '_ShowPS') != '2' ? true : false;
		data.key			= _self.getValueByName(val, '$KeyCode');
		
		return data;
	},
	
	"setMainCalTodayBg" : function(){
		var $today = $('#main_cal .mbsc-calendar-today');
		var $parent = $today.parent().parent();
		if ($today.length > 0 && !$parent.hasClass('mbsc-calendar-today-bg')) {
			$parent.addClass('mbsc-calendar-today-bg');
		}
	},
	
	"initBtnFloating" : function(){
		var _self = this;
		
		// 메인 우측 하단 플로팅 버튼 초기화 작업 (업무 작성 레이어)
		$('#btn_main_floating').off().on('click', function(){
			var sel_dt = '';
			if (_self.getMainLayoutType() == 'calendar') {
				sel_dt = _self.maincal._selected;
			} else {
				sel_dt = _self.sidecal._selected;
			}
			var s_dt = moment(sel_dt).format('YYYY-MM-DD');
			
			_self.showRegLayer(s_dt, s_dt);
			
			// 메인 플로팅 버튼 클릭시 로그 저장
			gap.write_log_box('btn_main_simple', '메인화면 간편작성 버튼 클릭', 'button', 'pc');
		});
		
		
		
		// 포틀릿 편집 버튼 이벤트
		$('#btn_portlet_layout span').text(gap.lang.btn_main_config);
		$('#btn_portlet_layout').off().on('click', function(){
			_self.showPortletLayer();
		});

				
		// 캘린더 펼침/접기 버튼
		$('#btn_main_change').remove();
		var html = 
			'<div id="btn_main_change" class="mbsc-form-group">' +
			'	<label>' + gap.lang.calendar + '<input mbsc-segmented type="radio" name="main_lay_type" value="calendar"></label>' +
			'	<label>' + gap.lang.btn_lay_change + '<input mbsc-segmented type="radio" name="main_lay_type" value="portlet"></label>' +
			'</div>';
		var $btn_toggle = $(html);
		$('#main_right_wrap').prepend($btn_toggle);
		
		mobiscroll.enhance($btn_toggle[0]);
		
		$('#btn_main_change input[name="main_lay_type"][value="' + _self.portlet_info.type + '"]').prop('checked', true).click();
		$('#btn_main_change input[name="main_lay_type"]').off().on('change', function(){
			var ty = $(this).val();
			
			
			
			// 최초 설정인 경우
			if (gHome.portlet_info.data.length == 0) {
				if (ty == 'portlet') {
					_self.showPortletLayer();
				}
				return;
			}
						
			_self.portlet_info.type = ty;
			
			$.ajax({
				type: "POST",
				url: gap.channelserver + "/api/portal/save_person_portlet.km",
				dataType : "text",	//"json",
				data : JSON.stringify(_self.portlet_info),
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success: function(__res){
					if (ty == 'calendar') {
						$('#main_content').addClass('show-maincal');
						$('#main_right_wrap').addClass('show-task');
						_self.portlet_info.type = 'calendar';
						
						_self.initMain(_self.maincal._selected);
					} else {
						$('#main_content').removeClass('show-maincal');
						$('#main_right_wrap').removeClass('show-task');
						_self.portlet_info.type = 'portlet';
						
						_self.initSideCal(_self.sidecal._selected);
						_self.loadPortlet();
					}
					
					// 퀵채팅 아이콘 리프레쉬
					gma.refreshPos();
				},
				error: function(){
					
				}
			});
			
		});
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
	
	"hideWorkLayer" : function(){
		var _self = this;
		var $layer = $('#work_simple_write_layer');
		$layer.removeClass('show-layer');
		
		gap.hideBlock();
		
		//setTimeout(function(){
			$layer.hide().remove();
		//}, 300);
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
	
	"getChannelList" : function(sel_code){
		var _self = this;
		
		// 업무 카테고리
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : gap.channelserver + "/api/channel/channel_info_list.km",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
			},
			success : function(res){
				var html = '';
				html = '<option value="none">' + gap.lang.select_basic_channel + '</option>';

				$.each(res, function(){
					if (this.type != "folder"){
						html += '<option value="'+this.ch_code+'"' + (sel_code == this.ch_code ? ' selected' : '') + '>'+this.ch_name+'</option>';
					}
				});
				
				html += '<option value="make_channel">+ ' + gap.lang.select_create_channel + '</option>';
				
				
				$('#ws_category').html(html);
				$('#ws_category').material_select();
				
				// 셀렉트 박스 변경될 때, 담당자 정보 가져와야 함
				$('#ws_category').off().on('change', function(){
					_self.getChannelMember(this.value);
				});
			},
			error : function(){
				
			}
		});
	},
	"getChannelMember" : function(ch_code){
		var _self = this;
		var $user_list = $('#ws_asignee');
		$user_list.empty();
		
		if (ch_code == 'none') {
			$user_list.material_select();
			return;
		} else if (ch_code == 'make_channel') {
			$('#ws_category').val('none').material_select();
			gBody2.create_channel(undefined, undefined, undefined, function(data){
				_self.createChannelComplete(data);
			});
			return;
		}
		
		
		
		var surl = gap.channelserver + "/search_info.km";
		var postData = {
			"type" : "C",
			"ch_code" : ch_code
		};			
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result != "OK"){
					mobiscroll.toast({message:gap.lang.error_get_data, color:'danger'});
					return;
				}
				
				var html = '';
				var owner = res.data.owner;
				
			/*	
			 * 전체 사용자 소트를 위해 사용하지 않음 - 2022.10.21
			 * // 채널 작성자 정보
				var $user = $('<option value="' + owner.ky + '">' + owner.nm + ' ' + owner.jt + '</option>');
				$user.data('info', owner);
				$user_list.append($user);
				
				$.each(res.data.member, function(){
					member = this;
					if (owner.ky == member.ky) return true;					
					$user = $('<option value="' + member.ky + '">' + member.nm + ' ' + member.jt + '</option>');
					$user.data('info', member);
					$user_list.append($user);
				});*/
				
				var members = res.data.member;
				members.push(owner);
				
				members = sorted=$(members).sort(gap.sortNameDesc);	
				
				$.each(members, function(){
					member = this;
					var user_info = gap.user_check(this);
				//	if (owner.ky == member.ky) return true;					
					$user = $('<option value="' + user_info.ky + '">' + user_info.disp_user_info + '</option>');
					$user.data('info', member);
					$user_list.append($user);
				});
				
				// 현재 선택된 캘린더에 따라 사용자 선택 처리
				$user_list.find('option[value="' + gap.userinfo.rinfo.ky + '"]').prop('selected', true);
				
				$user_list.material_select();
			},
			error : function(e){
				mobiscroll.toast({message:gap.lang.error_get_userdata, color:'danger'});
			}
		});
	},
	
	"createChannelComplete" : function(data){
		var _self = this;
		var res = JSON.parse(data);
		if (res.result == 'OK') {
			gBody2.update_channel_info();	// 채널방에 대한 정보를 업데이트 해야 함
			gap.add_todo_plugin("add", res.ch_code);	// 방금 생성한 채널방에 TODO 플러그인 등록
			_self.getChannelList(res.ch_code);
			_self.getChannelMember(res.ch_code);
		}
		
	},
	
	"simpleWorkSave" : function(){
		var _self = this;
		
		// Validation 체크
		var _priority = parseInt($('#ws_priority').find('option:selected').val()),
			_code = $('#ws_category').find('option:selected').val(),
			_name = $('#ws_category').find('option:selected').text(),
			_title = $.trim($('#ws_title').val()),
			_content = $.trim($('#ws_content').val()),
			_s_dt = $('#ws_s_date').val(),
			_e_dt = $('#ws_e_date').val(),
			_asignee = $('#ws_asignee').find('option:selected').data('info');
		
		$('#ws_title').val(_title);
		$('#ws_content').val(_content);
		
		// 채널 선택
		if (_code == 'none') {
			mobiscroll.toast({message:gap.lang.error_ws_channel, color:'danger'});
			return;
		}
		
		// 업무명 선택
		if (_title == '') {
			mobiscroll.toast({message:gap.lang.error_ws_title, color:'danger'});
			return;
		}
		
		// 기간 선택
		if (_s_dt == '' || _e_dt == '') {
			mobiscroll.toast({message:gap.lang.error_ws_period, color:'danger'});
			return;
		}

		var data = {
			priority: _priority,
			project_code: _code,
			project_name: _name,
			status: "1",
			title: _title,
			express: _content,
			sort : 0,
			startdate : _s_dt + 'T00:00:00Z',
			enddate : _e_dt + 'T00:00:00Z',
			asignee : _asignee,
			owner : gap.userinfo.rinfo,
			checklist : [],
			file : [],
			reply: []
		};
		
		var url = gap.channelserver + "/make_item_todo.km";
		$.ajax({
			type : "POST",
			datatype : "json",
			contentType : "application/json; charset=utf-8",
			url : url,
			data : JSON.stringify(data),
			success : function(res){
				if (res.result == 'OK') {
					mobiscroll.toast({message:gap.lang.reg_complete, color:'info'});
					
					data._id = {$oid:res.data.id}; 
					gap.schedule_update(data, 'asignee', 'U').then(function(){
						_self.refreshPage(true);
						_self.hideWorkLayer();
					});
				} else {
					mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				}
			}
		});
	},
	
	"simpleCalendarSave" : function(){
		var _self = this;
		
		// Validation 체크
		var _title = $.trim($('#cs_title').val()),
			_s_dt = $('#cs_s_date').val(),
			_e_dt = $('#cs_e_date').val(),
			_s_time = $('#cs_s_time').val(),
			_e_time = $('#cs_e_time').val(),
			_allday = $('#cs_allday').is(':checked');
			_priority = parseInt($('#cs_priority').find('option:selected').val()),
			_category = $('#cs_type').val(),
			_public = $(':radio[name="cs_public"]:checked').val(),
			_express = $.trim($('#cs_content').val()),
			_attendee = '';
		
		$('#cs_title').val(_title);

		
		// 업무명 선택
		if (_title == '') {
			mobiscroll.toast({message:gap.lang.error_ws_title, color:'danger'});
			$('#cs_title').focus();
			return;
		}
		
		// 공유 대상자(참석자) 셋팅
		var att_users = [];
		$('#cs_attendee_list li').each(function(){
			att_users.push($(this).data('key'));
		});
		if (att_users.length) _attendee = att_users.join(',');
		
		
		var obj = {
			opt: 'C',
			title: _title,
			attendee: _attendee,
			category: _category,
			priority: _priority,
			express: _express,
			allday: _allday,
			ShowPS: _public == "Y" ? '' : '2', 
			unid: 'boxmain_' + moment().format('YYYYMMDDHHmmss'),
			system:'cal'
		};
		
		
		// 기간 선택
		if (_allday) {
			obj.start = moment(_s_dt).format('YYYY-MM-DD') + 'T' + '00:00:00Z';
			obj.end = moment(_e_dt).format('YYYY-MM-DD') + 'T' + '00:00:00Z';
			
			if (obj.start > obj.end) {
				mobiscroll.toast({message:gap.lang.invalid_period, color:'danger'});
				return;
			}
		} else {
			obj.start = moment(_s_dt + 'T' + _s_time).format();
			obj.end = moment(_e_dt + 'T' + _e_time).format();
			
			if (obj.start >= obj.end) {
				mobiscroll.toast({message:gap.lang.invalid_period, color:'danger'});
				return;
			}
		}

		this.calendarAPI(obj).then(function(data){
			var res = data.split('^');
			if (res[0] == 'SUCCESS') {
				mobiscroll.toast({message:gap.lang.reg_complete, color:'info'});
				_self.refreshPage();
				_self.hideWorkLayer();				
			} else {
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				
			}
		});
		
	},
	
	"refreshPage" : function(pass_status){
		
		var cal_type = this.getMainLayoutType();
		
		if (cal_type == 'calendar') {
			// 메인 캘린더
			var sel_date = moment(this.maincal._selected);
			this.initMain(sel_date, pass_status);
		} else {
			// 사이드 캘린더
			var sel_date = moment(this.sidecal._selected);
			this.initSideCal(sel_date, pass_status);
		}
		this.popupRefresh();	// 팝업에서 작업된  경우 팝업 새로고침
	},
	
	"showEventPreview" : function(event, callfrom, userinfo){
		var _self = this;
		var is_own = false;
		var main_type = this.getMainLayoutType(); 
		
		if (main_type == 'calendar') {
			if ($('#main_own_cal .user').hasClass('on')) {
				is_own = true;
			}			
		} else {
			if ($('#side_own_cal .user').hasClass('on')) {
				is_own = true;
			}
		}
		
		
		// 기존에 요청 중인 사항이 있으면 취소 처리
		if (this.preview_req) this.preview_req.abort(); 
		
		// 내 일정이 아닌데 비공개 일정인 경우
		if (!is_own && event.event.ShowPS == '2') {
			return false;			
		}
		
		// 사용자 정보가 안넘어오면 즐겨찾기에 선택된 대상자를 기준으로 표시
		if (!userinfo) {
			if (main_type == 'calendar') {
				var sel_user = $('#main_oth_cal_wrap').find('.user.on');				
			} else {
				var sel_user = $('#side_oth_cal_wrap').find('.user.on');
			}
			userinfo = sel_user.data('info');
			userinfo.is_own = (userinfo.id == window.notes_id ? true : false);
		}
		
		var param = {
			unid : event.event.id,
			mailServer : event.event.mailServer ? event.event.mailServer : userinfo.mailServer,
			mailFile : event.event.mailFile ? event.event.mailFile : userinfo.mailFile,
			notesid : userinfo.id.replace(/\,/g, '/')
		};
		
		
		if (_self.preview_qtip) {
			_self.preview_qtip.qtip('destroy');
		}
		$('.preview-qtip').remove();
		
		var url = this.caldbpath + "/(ag_schedule_preview)?OpenAgent&" + $.param(param);
		this.preview_req = $.ajax({
			url : url,
			success: function(data){
				var disp_pos = {};
				var target;
				var _cls = 'preview-qtip';
				
				if (event.source == 'calendar' || event.source == 'popover') {
					if ($(event.domEvent.target).hasClass('main-cal-event')){
						target = $(event.domEvent.target);						
					} else {
						target = $(event.domEvent.target).closest('.main-cal-event');						
					}
					
					if (target.length == 0) {
						target = $(event.domEvent.target).closest('.mbsc-calendar-text');
					}
					
					
					
					if (event.source == 'popover') {
						if (!target.hasClass('mbsc-list-item')) {
							target = target.closest('.mbsc-list-item');
						}
					} else {
						/*
						if (!target.hasClass('main-cal-event')) {
							target = target.closest('.main-cal-event');
						}
						*/
					}
					
					// Type2일 때 메인에서 이벤트 클릭한 경우
					disp_pos = {
						my: 'left top',
						at: 'right top',
						x: 0,
						y: 0
					};
				} else if (event.source == 'popup') {
					// 메인 팝업에서 호출된 경우
					_cls = 'preview-qtip popup';
					target = event.target;
					disp_pos = {
						my: 'right top',
						at: 'left top',
						x: -28,
						y: 0
					};
				} else if (event.source == 'side') {
					// 사이드 일정 리스트에서 호출된 경우
					_cls = 'preview-qtip popup side';
					target = event.target;
					disp_pos = {
						my: 'right top',
						at: 'left top',
						x: 0,
						y: 0
					};
					
				} else {
					// Type1일 때 우측 타임라인 이벤트 클릭한 경우
					target = $(event.domEvent.target).closest('.mbsc-schedule-event').find('.timeline-event-title');
					disp_pos = {
						my: 'right top',
						at: 'left top',
						x: -10,
						y: 15
					};
				}
				
				var html = _self.getPreviewHtml(data, event, userinfo, callfrom);
				if (!html) return;

				
				_self.preview_qtip = $(target).qtip({
					//overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
					style: {
						classes: _cls,
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
						fixed : true
					},
	                position: {
						viewport: $('#main_content'),
	                    my: disp_pos.my,
	                    at: disp_pos.at,
	                    adjust: {
	                		x: disp_pos.x, 
	                		y: disp_pos.y,
	                		scroll: false,
	                		method: 'shift'
	                	}
	                },
	                events: {
	                	show: function(e, api){
		                	if (callfrom == 'popup' || callfrom == 'side'){
		                		$(api.elements.target).addClass('on');
	                		}
		                	
		                	setTimeout(function(){
		                		// 최상위로 띄워준다
		                		var inx = gap.maxZindex();
		                		$(api.tooltip).css('z-index', inx+1);		                		
		                	}, 100);
	                	},
	                	hide: function(e, api){
	                		if (callfrom == 'popup'){
	                			$('#main_popup .event-list li').removeClass('on');
	                		} else if (callfrom == 'side'){
	                			$('#day_event_layer .event-list li').removeClass('on');
	                		}
	                	},
	                	render: function(e, api){
	                		var $tip = $(api.elements.tooltip);
	                		
	                		$tip.find('.preview-user-info:not(.external-user)').on('click', function(){
	                			var ky = $(this).data('key');
	                			_self.preview_qtip.qtip('option', 'hide.event', false);
	                			gap.showUserDetailLayer(ky, {onClose: function(){
	                				_self.preview_qtip.qtip('option', 'hide.event', 'unfocus');
	                			}});
	                		});
	                		
	                		// 회의실 장소
	                		$tip.find('.meeting-loc').on('click', function(){
	                			var roomkey = $(this).data('key');
	                			gMet.openRoomDetailInfo(roomkey);
	                		});
	                		
	                		// 첨부파일 (다운로드 처리)
	                		$tip.find('.preview-attach').on('click', function(){
	                			var file_nm = $(this).find('.file-name').text();
	                			file_nm = encodeURIComponent(file_nm);
	                			var file_url = '/' + param.mailFile + '/0/' + event.event.id + '/$File/' + file_nm;
	                			$tip.find('.preview-attach').removeClass('on');
	                			$(this).addClass('on');
	                			window.open(file_url);
	                		});
	                		
	                		// 닫기
	                		$tip.find('.btn-close').on('click', function(){
	                			$tip.qtip('destroy').remove();
	                		});
	                		
	                		// 삭제
	                		$tip.find('.btn-remove').on('click', function(){
	                			$tip.qtip('destroy').remove();
	                			
	                			var type = $(this).data('type');
	                			if (type == 'meeting') {
	                				// 회의 삭제
	                				gap.showConfirm({
	                					title: gap.lang.basic_delete,
	                					iconClass: 'remove',
	                					contents: gap.lang.confirm_delete,
	                					callback: function(){
	                						gap.show_loading('');
	                						var promise;
	                						if (data.system_code == 'vc') {
	                							// 화상회의
	                							promise = gMet.onlineCancel(data.scheduleid);
	                						} else if (data.system_code == 'mtg') {
	                							// 회의실 예약
	                							promise = gMet.meetingCancel(data.scheduleid);
	                						} else {
	                							if (data.meeting_type == '1') {
	                								// 일정에서 생성한 화상회의
	                								promise = gMet.onlineCancel(data.scheduleid);
	                							} else {
	                								// 일정에서 생성한 회의실 예약
	                								promise = gMet.meetingCancel(data.scheduleid);
	                							}
	                						}
	                						promise.then(function(data){
	                							if (data.req_result == 'ok') {
	                								// 이벤트 삭제 처리
	                								//_self.maincal.removeEvent([event.event.id]);
	                								//_self.popupRefresh();
	                								_self.refreshPage(true);
	                							}
	                							
	                							gap.hide_loading('');
	                						}, function(){
	                							mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
	                							gap.hide_loading('');
	                						});
	                						
	                					}
	                				});	
	                			} else if (type == 'cal') {
	                				gap.showConfirm({
	                					title: gap.lang.basic_delete,
	                					iconClass: 'remove',
	                					contents: gap.lang.confirm_delete,
	                					callback: function(){
		                					// 일정 문서 삭제
			                				var obj = {
			                					opt: 'D',
			                					system: 'cal',
			                					unid: data.apptunid
			                				}
			                				
			                				gap.show_loading('');
			                				_self.calendarAPI(obj).then(function(res){
			                					var ret = $.trim(res).split('^');
			                					if (ret[0] == 'SUCCESS') {
			                						// 만약에 교육, 출장, 휴무인 경우 상태값 삭제 필요
			                						var evt_cate = event.event.apt_cate; 
			                						if (evt_cate == '5' || evt_cate == '7' || evt_cate == '10') {
			                							// 상태값 붙은 이벤트를 지운 경우 페이지 리프레쉬
			                							_self.refreshPage();
			                						} else {
			                							//_self.maincal.removeEvent([event.event.id]);
			                							//_self.popupRefresh();			                							
			                							_self.refreshPage(true);
			                						}
			                					} else {
			                						mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
			                					}
			                					gap.hide_loading('');
			                				}, function(){
			                					mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
			                					gap.hide_loading('');
			                				});
	                					}
	                				});
	                			} else {
	                				// Task 삭제
	                				gap.showConfirm({
	                					title: gap.lang.basic_delete,
	                					iconClass: 'remove',
	                					contents: gap.lang.confirm_delete,
	                					callback: function(){
	                						_self.removeTimelineEvent(event);
	                						_self.popupRefresh();
	                					}
	                				});
	                			}
	                			
	                		});
	                		
	                		// 수정
	                		$tip.find('.btn-modify').on('click', function(){
	                			$tip.qtip('destroy');
	                			var type = $(this).data('type');
	                			
	                			if (type == 'meeting') {
	                				if ($('#main_popup').hasClass('show-popup')) {
	                					$('#btn_main_popup_close').click();
	                				}
	                				
	                				// 회의실 예약 반복인 경우 사이트 이동 안내 컨펌창 표시
	                				if (data.scheduleid.indexOf('RESVE_') != -1){
	                					if (data.scheduleid.split('_').length > 2) { // _ 언더바 2개 이상이면 반복예약된 회의임
	                						gap.showConfirm({
	                							title: gap.lang.info,
	                							contents: gap.lang.mt_repeat_go_site,
	                							callback: function(){
	                								window.open('/rezmanager');
	                							}
	                						});
	                						return false;
	                					}
	                				}
	                				
	                				var info = {
	                					type: data.scheduleid.indexOf('RESVE_') != -1 ? '2' : '1',
	                					scheduleid: data.scheduleid
	                				};
	                				gMet.editMeeting(info);
	                			}
	                		});
	                		
	                		// 일정 상세보기
	                		$tip.find('.btn-detail').on('click', function(){
	                			if (data.system_code == 'todo' || data.system_code == 'checklist') {
	                				
	                				// To-Do는 바로 레이어 표시
	                				var arr = data.system_key.split('^');
	                				var todo_key = arr[1];
	                				gTodo.compose_layer(todo_key);
	                				
	                			} else if (data.system_code == 'task') {
	                				
	                				// 해당 키로 값 찾기
	                				var $li = $('#task_list .task-each[data-key="' + data.system_key + '"]');
	                				if ($li.length > 0) {
	                					$('#main_right_wrap').addClass('show-task');
	                					var scroll = $li.position().top + $li.parent().position().top;
	        							scroll += $('#task_list_wrap').scrollTop() - 45;
	        							
	                					setTimeout(function(){
	                						$('#task_list_wrap').scrollTop(scroll);
	                						$li.find('.subj-wrap').click();
	                					}, 300);
	                				}
	                				
	                			} else if (data.system_code == 'collection') {
	                				
	                				// 취합 상세 > 취합응답을 상세처럼 동작하도록 변경함
	                				if ($('#main_popup').hasClass('show-popup')) {
	                					$('#btn_main_popup_close').click();
	                				}
	                				
	                				gCol.directCollectDetailView(data.system_key);
	                				
	                			} else {
	                				
	                				// 일반 일정은 IFrame으로 내용 표시
	                				var sel_event_date = moment(event.event.sd).format('YYYY-MM-DD');
	                				_self.showDetailCalApp(event.event.id, sel_event_date, event.event);
	                				
	                			}
	                			$tip.qtip('destroy').remove();
	                		});
	                		
	                		// 업무방 이동
	                		$tip.find('.btn-movework').on('click', function(){
	                			var ch_key = $tip.find('.work-name').data('key');
	                			gap.move_channel_list(ch_key);
	                			$tip.qtip('destroy').remove();
	                		});
	                		
	                		// 취합 응답
	                		$tip.find('.btn-collect').on('click', function(){
	                			// 취합응답화면으로 화면 전환할 것
	                			$tip.qtip('destroy').remove();
	                			
	                			// 바로 응답 기능이 아닌 취합 상세로 넘어가야 함
	                			//gCol.createCollectResponse(data.system_key);
	                			
	                			// 취합 상세 > 취합응답을 상세처럼 동작하도록 변경함
                				if ($('#main_popup').hasClass('show-popup')) {
                					$('#btn_main_popup_close').click();
                				}
	                			gCol.directCollectDetailView(data.system_key);
	                			
	                		});
	                		
	                		
	                		// 화상참여
	                		$tip.find('.btn-online').on('click', function(){
	                			// 취합응답화면으로 화면 전환할 것
	                			_self.goOnlineMeeting(event.event, data);
	                			$tip.qtip('destroy').remove();
	                		});
	                		if ($tip.find('.btn-online').is(':disabled')) {
	                			// 15분전 입장가능하다는 문구 추가
	                			$tip.find('.btn-area').before('<div class="meeting-info">※' + gap.lang.meeting_time_limit + '</div>');
	                			
	                		}
	                		
	                		// 내 일정인 경우만 업무 시작 버튼 표시
	                		if (userinfo.is_own) {
	                			// 업무 시작 버튼
		            			var work_user_list = [];
		            			// todo이고, owner와 나의 정보가 맞지 않으면 업무 시작하기 표시
		            			if (data.system_code == 'todo') {
		            				var user_info = new NotesName(data.owner);
		            				if (gap.userinfo.rinfo.ky != user_info.orgUnit1) {
		            					work_user_list.push(data.owner);		
		            				}
		            			}
		            			// 주최자 정보가 있으면 업무 시작 버튼 표시
		            			if (data.chair != '') {
		            				var user_info = new NotesName(data.chair);
		            				if (gap.userinfo.rinfo.ky != user_info.orgUnit1) {
		            					work_user_list.push(data.chair);					
		            				}
		            			}
		            			// 참석자 정보가 있으면 업무 시작 버튼 표시
		            			if (data.required.length > 0) {
		            				$.each(data.required, function(){
		            					var user_info = new NotesName(this);
		            					if (gap.userinfo.rinfo.ky != user_info.orgUnit1) {
		            						work_user_list.push(this + '');
		            					}	
		            				});
		            			}
		            			if (work_user_list.length > 0) {
		            				var $btn_quick = $('<button class="btn-workstart">' + gap.lang.start_work + '</button>');
		            				$btn_quick.on('click', function(){
		            					if ($('#main_popup').length) {
		            						$('#btn_main_popup_close').click();
		            					}
		            					_self.quickWorkStart(work_user_list);
		            					$tip.qtip('destroy').remove();
		            				});
		            				$tip.find('.btn-area').append($btn_quick);
		            			}
	                		}

	                	}
	                }
	                
				});
			},
			error : function(){
				
			}
		});
	},
	
	"removeTimelineEvent" : function(event){
		var _self = this;
		var key = event.event.system_key;
		var $li = $('.task-each[data-key="' + key + '"]');

		_self.removeTask(key).then(function(res){
			var sel_date = moment(_self.maincal._selected);
			_self.initMain(sel_date);
			//_self.daycal.removeEvent([event.event.id]);
			
			// 삭제 완료
			var $parent = $li.closest('.task-category-wrap');
			var is_last = ($parent.find('.task-each').length <= 1);
			$li.remove();
			if (is_last) {
				$parent.remove();
			}
			_self.taskCountCheck();
			_self.emptyTaskCheck();
		});		
	},
	
	"showDetailCalApp" : function(unid, this_date, event){
		var user_info = $('#main_oth_cal_wrap').find('.user.on').data('info');
		
		// 일정 데이터 상세 페이지 연결
		var param = {
			unid: unid,
			ThisStartDate: this_date,
			callfrom: 'boxmain'
		};
		
		// 내 캘린더가 아닌 경우 사용자의 메일서버, 파일 정보 추가
		if (user_info.id !=  window.notes_id) {
			param['opencalinfo'] = btoa(encodeURIComponent(user_info.id));
		}
		
		var cal_url = this.caldbpath + "/main?open&" + $.param(param);
		$('.calapp-detail-layer').remove();
		
		var $layer = $('<div class="calapp-detail-layer iframe"></div>');
		var $ifm = $('<iframe class="calapp-iframe"></iframe>');
		$ifm.attr('src', cal_url);
		$layer.append($ifm);
		
		gap.showBlock();
		
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx);
		
		$('body').append($layer);
	},
	"hideDetailCalApp" : function(is_refresh){
		$('.calapp-detail-layer').remove();
		gap.hideBlock();
		if (is_refresh) {
			this.refreshPage();
		}
	},
	"getPreviewHtml" : function(data, event, userinfo, callfrom){
		var evt = event.event;
		if (!evt) return;
		
		var attendee_list = [];
		var work_info = null;

		// 메뉴
		var is_disp_chair = false;	// 주최자 표시 여부
		var is_cal = false;
		var is_etc_cal = false;
		
		var sche_type = '';
		if (data.system_code == 'todo' || data.system_code == 'checklist') {
			sche_type = gap.lang.ch_tab3;
			// To-Do는 바로 레이어 표시
			var todo_key = data.system_key.split('^')[0];
			
			$.ajax({
				type: 'POST',
				async: false,
				contentType : "application/json; charset=utf-8",
				url: gap.channelserver + "/search_todo_info.km",
				dataType : "json",
				data : JSON.stringify({key:todo_key}),
				success: function(res){
					if (res.result == 'OK') {
						work_info = {
							name: res.data.name,
							key: res.data._id.$oid
						}
					}
				}
			});			
		} else if (data.system_code == 'task') {
			sche_type = 'My Task';
		} else if (data.system_code == 'collection') {
			is_disp_chair = true;
			sche_type = gap.lang.collection;
		} else if (data.system_code == 'mtg') {
			is_disp_chair = true;
			sche_type = gap.lang.mt_res + ' (' + gap.lang.mt_type_2 + ')';
		} else if (data.system_code == 'vc') {
			is_disp_chair = true;
			if (data.location) {				
				sche_type = gap.lang.mt_res + ' (' + gap.lang.mt_type_1 + ')';
			} else {
				sche_type = gap.lang.mt_res + ' (' + gap.lang.mt_type_3 + ')';
			}
		} else {
			is_disp_chair = true;
			is_cal = true;
			sche_type = gap.lang.calendar;
		}
		
		// 공유, 구독 캘린더
		if (event.event.mailServer) {
			is_etc_cal = true;
		}
		
		// 일시
		var dt = '';
		if (evt.allDay) {
			dt = moment(evt.sd).format('YYYY-MM-DD[(]ddd[)]');
			if (evt.sd != evt.ed) {
				dt += ' ~ ' + moment(evt.ed).format('YYYY-MM-DD[(]ddd[)]');
			}
			dt += ' ' + gap.lang.allday;
		} else {
			var s_dt = moment(evt.start);
			var e_dt = moment(evt.end);
			dt = s_dt.format('YYYY-MM-DD[(]ddd[)] LT') + ' ~ ';
			if (s_dt.format('YYYY-MM-DD') != e_dt.format('YYYY-MM-DD')) {
				dt += e_dt.format('YYYY-MM-DD[(]ddd[)]') + ' ';
			} 
			dt += e_dt.format('LT');
		}
		
		var html = 
		'<div class="main-preview-layer">' +
		'	<div class="header-area">' +
		'		<div class="title">' + evt.title + '</div>' +
		'		<div class="btn-close"><span></span><span></span></div>' +
		'	</div>' +
		'	<div class="content">' +
		'		<div class="label-background"></div>' +
		'		<div class="table-wrap">' +
		'			<table>' +
		'				<tbody>' +
		'					<tr><td>' + gap.lang.menu + '</td><td>' + sche_type + '</td></tr>';
		
		// 업무방명
		if (work_info) {
			html += '<tr><td>' + gap.lang.sharechannel + '</td><td><span class="work-name" data-key="' + work_info.key + '">' + work_info.name + '</span></td></tr>';
		}
		
		// 업무일 or 일시
		html += '<tr><td>' + (work_info ? gap.lang.work_date : gap.lang.notice_period) + '</td><td>' + dt + '</td></tr>';
		
		// 유형 (캘린더인 경우에만 표시)
		if (is_cal) {
			if (data.apptcat && data.apptcat != '' && gap.lang['ws_type_' + data.apptcat]) {
				var txt = gap.lang['ws_type_' + data.apptcat];				
			} else {
				var txt = gap.lang['ws_type_0'];				
			}
			if (txt) {
				// 언어가 정의된 경우만 뿌려줌
				html += '<tr><td>' + gap.lang.ws_type + '</td><td>' + txt + '</td></tr>';				
			}
		}
		
		// 요청자
		if (data.system_code == 'todo' || data.system_code == 'checklist') {
			if (data.owner) {
				var owner_info = new NotesName(data.owner);
				//내가 나 자신에게 지시한건지 체크
				//if (gap.userinfo.rinfo.ky != owner_info.orgUnit1) {
				html += '<tr><td>' + gap.lang.req_user + '</td><td><span class="preview-user-info" data-key="' + owner_info.orgUnit1 + '">' + owner_info.common + '</span></td></tr>';					
				//}
			}
		}
		
		// 장소        
		if (data.location) {
			html += '<tr><td>' + gap.lang.notice_location + '</td><td>';
			
			if (data.MeetingData){
				var m_info = JSON.parse(data.MeetingData);
				var placenm = m_info.placenm.split(',');
    			var floornm = m_info.floornm.split(',');
    			var locnm = m_info.name.split(',');
    			var loc_key = m_info.key.split(',');
    			
				$.each(locnm, function(idx, val){
					var loc = placenm[idx] + ' ' + floornm[idx] + ' ' + locnm[idx];
					html += '<span class="meeting-loc" data-key="' + loc_key[idx] + '">' + loc + '</span>';
				});
			} else {
				html += '<span>' + data.location + '</span>';
			}
			
			html += '</td></tr>';
		}
		
		// 주최자 (참석자 여부 상관없이 표시)
		if (is_disp_chair) {
			var chair_info = new NotesName(data.chair);
			var chair_label;
			if (data.system_code == 'collection') {
				// 요청자로 표시
				chair_label = gap.lang.req_user;
			} else {
				// 주최자로 표시
				chair_label = gap.lang.mt_th_owner;
			}
			html +=	'<tr><td>' + chair_label + '</td><td><span class="preview-user-info" data-key="' + chair_info.orgUnit1 + '">' + chair_info.common + '</span></td></tr>';			
		}
		
		// 참석자 정보
		if (data.required.length > 0) {
			// 참석자가 있을 때만 주최자 정보 표시
			
			/*
			if (chair_info.orgUnit1 != gap.userinfo.rinfo.ky){
				attendee_list.push(data.chair);
			}
			
			html +=	'<tr><td>' + gap.lang.mt_th_owner + '</td><td><span class="preview-user-info" data-key="' + chair_info.orgUnit1 + '">' + chair_info.common + '</span></td></tr>';
			*/
			var member_label;
			if (data.system_code == 'collection') {
				// 담당자로 표시
				member_label = gap.lang.asign;
			} else {
				// 참석자로 표시
				member_label = gap.lang.member;
			}
			html += '<tr><td>' + member_label + '</td><td><div class="preview-user-wrap">';
			
			data.required.sort();
			$.each(data.required, function(){
				var user_info = new NotesName(this);
				
				// 부서코드인 경우 표시 안함
				if (!user_info.isHierarchical && !user_info.isInternetAddress) {
					return true;
				} 
				
				var is_ext = (this.indexOf('@') != -1);
				//if (!is_ext) attendee_list.push(this);
				html += '<span class="preview-user-info' + (is_ext ? ' external-user' : '') + '" data-key="' + user_info.orgUnit1 + '">' +  (is_ext ? user_info.origin : user_info.common) + '</span>'
			});
			html += '</div></td></tr>';
		}
		
		// 참조자 정보
		if (data.optional.length > 0) {
			html += '<tr><td>' + gap.lang.mt_optional + '</td><td><div class="preview-user-wrap">';
			
			data.optional.sort();
			$.each(data.optional, function(){
				var user_info = new NotesName(this);
				
				// 부서코드인 경우 표시 안함
				if (!user_info.isHierarchical && !user_info.isInternetAddress) {
					return true;
				} 
				
				var is_ext = (this.indexOf('@') != -1);
				html += '<span class="preview-user-info' + (is_ext ? ' external-user' : '') + '" data-key="' + user_info.orgUnit1 + '">' +  (is_ext ? user_info.origin : user_info.common) + '</span>'
			});
			html += '</div></td></tr>';
		}
		
		
		
		// 내용이 있는 경우
		if (data.body) {
			html += '<tr><td>' + gap.lang.basic_content + '</td><td style="padding: 10px 0 0 10px;"><div class="table-contents">' + gap.HtmlToText($.trim(data.body)).replace(/\n/g, '<br>') + '</div></td></tr>';
		}
		
		// 첨부 있는 경우
		if (data.AttachmentNames && data.AttachmentNames.length > 0 ) {
			html += '<tr>' +
					'	<td>' + gap.lang.attachment + '</td>' +
					'	<td style="padding: 10px 0 0 10px;">' +
					'		<div class="table-contents" style="max-height:80px;padding:5px 8px;"><ul>';
			
			$.each(data.AttachmentNames, function(idx){
				html += '<li class="preview-attach">' +
						'	<span class="file-name" title="' + this + '">' + this + '</span>' +
						'	<span>' + gap.formatBytes(data.AttachmentSize[idx]) + '</span>' +
						'</li>';
			});
			
			html +=	'		</ul></div>' +
					'	</td>' +
					'</tr>';
		}
		
		
		
		html +=
		'			</tbody>' +
		'		</table>' +
		'	</div>' +
		'</div>';
		
		
		// 버튼 관련 처리 시작
		html += '	<div class="btn-area">';
		
		var is_meeting_event = false;
		var is_chair = false;
		// 회의실이 연동되고 내가 주최인 경우 수정/삭제 버튼 표시
		if (data.scheduleid != '') {
			var is_meeting_event = true;
			if (data.chair ==  window.notes_id) {
				is_chair = true;
			}
		}
		
		if (userinfo.is_own && !is_etc_cal) {
			// 삭제 기능
			if (is_chair) {
				html += '<button class="btn-remove" data-type="meeting">' + gap.lang.basic_delete + '</button>';
				html += '<button class="btn-modify" data-type="meeting">' + gap.lang.basic_modify + '</button>';
			} else {
				if (data.system_code == 'task') {
					if (userinfo.id ==  window.notes_id) {
						// 나의 Task인 경우 삭제 처리
						html += '<button class="btn-remove" data-type="task">' + gap.lang.basic_delete + '</button>';
					}
				} else if (data.system_code == '' || data.system_code == 'cal') {
					// 반복 문서가 아닌 경우만 삭제 기능 추가
					if (data.repeats != 'Y') {
						html += '<button class="btn-remove" data-type="cal">' + gap.lang.basic_delete + '</button>';					
					}
				} 
			}
			
			// 상세
			if (data.system_code == 'task' && data.completion == 'T') {
				// 완료된 task는 상세 없음
			} else if (data.system_code == 'task' && callfrom == 'popup') {
				// 메인 팝업에서 띄우는 task도 상세 없음 (Main이 아닌 다른곳에서도 접근이 가능하기 때문에)
			} else if (data.system_code == 'collection') {
				// 취합 상세 없애고, 취합응답을 상세처럼 동작하도록 변경함				
			} else {
				if (!is_meeting_event) {
					html += '<button class="btn-detail">' + gap.lang.btn_detail + '</button>';
				}
			}
			
			// 업무방 이동
			if (data.system_code == 'todo' || data.system_code == 'checklist'){
				html += '<button class="btn-movework">' + gap.lang.move_channel + '</button>';
			}
			
			
			// 취합응답
			if (data.system_code == 'collection') {
				// 내가 담당자에 포함되어야만 취합 응답을 표시한다
				var is_contains = false;
				$.each(data.required, function(){
					var notes_nm = new NotesName(this);
					if (notes_nm.isHierarchical) {
						if (notes_nm.orgUnit1 == gap.userinfo.rinfo.ky) {
							is_contains = true;
						}
					}
				});
				if (is_contains) {
					html += '<button class="btn-collect">' + gap.lang.collect_reply + '</button>';
				}
			}
			
			// 화상참여
			if (is_meeting_event && (data.system_code == 'vc' || (data.system_code == '' && data.meeting_type == '1'))) {

				// 시작 시간 체크해서 disable 처리할지 표시
				var meet_sdate = moment(evt.start);
				var meet_edate = moment(evt.end);
				var now_date = moment();
				
				if (now_date.diff(meet_edate) > 0) {
					// 종료시간 지난 경우는 표시하면 안됨
				} else {
					if (now_date.diff(meet_sdate, 'm') < -15) {
						html += '<button class="btn-online" disabled>' + gap.lang.mt_online_enter + '</button>';
					} else {
						// 오늘 날짜의 일정이고, 종료시간이 지나지 않은것만 화상참여하기 버튼 표시
						html += '<button class="btn-online">' + gap.lang.mt_online_enter + '</button>';									
					}
				}
			}
		}
		

		
		html += '</div>';	// btn-area
		
		html += '</div>';	// main-preview-layer
		
		return html;
	},
	
	"getTaskList" : function(){
		var _self = this;
		
		// 진행중인 Task
		var url = "/" + mailfile + "/vwEventTaskList?readviewentries&RestrictToCategory=Ing&outputformat=json";
		$.ajax({
			url: url,
			cache: false,
			success: function(data){
				if (!data.viewentry) {
					_self.taskCountCheck();
					_self.emptyTaskCheck();
					return;
				}
				
				$.each(data.viewentry, function(idx, val){
					var task = _self.getTaskJson(val);
					_self.createTaskDone(task);
				});

				_self.taskCountCheck();
			}
		});
	},
	
	"getCompleteTaskList" : function(){
		var _self = this;

		// 완료된 Task
		var url = "/" + mailfile + "/vwEventTaskList?readviewentries&RestrictToCategory=Complete&outputformat=json&start=1&count=100";
		$.ajax({
			url: url,
			cache: false,
			success: function(data){
				if (!data.viewentry) {
					return;
				}
				
				$.each(data.viewentry, function(idx, val){
					//var subj = _self.getValueByName(val, '$Subject');
					//var unid = _self.getValueByName(val, '$KeyCode');
					//_self.createCompleteTask(subj, unid);
					var task = _self.getTaskJson(val);
					_self.createCompleteTask(task);	
				});
			}
		});
	},
	
	"emptyTaskCheck" : function(){
		if ($('#task_list .task-each').length == 0) {
			$('#task_list .task-category-wrap').remove();
			
			if ($('#task_list_wrap .empty-task-wrap').length == 0) {
				var $empty = $('<div class="empty-task-wrap">' + gap.lang.empty_task + '</div>');
				$('#task_list_wrap').append($empty);
			}
		} else {
			$('#task_list_wrap .empty-task-wrap').remove();
		}
	},
	"taskCountCheck" : function(){
		$('#task_ing_cnt').text($('#task_list .task-each').length);
	},
	"changeTaskStatus" : function($li, is_complete){
		var _self = this;
		if (is_complete) {
			// 완료처리
			var obj = {opt: 'T', unid: $li.data('key'), system: 'task'};
			// 요청 전에 complete으로 바꿔놔야 중복 클릭 방지 가능
			$li.find('.task-wrap').addClass('complete proc');
			this.calendarAPI(obj).then(function(res){
				var res = res.split('^');
				if (res[0] == 'SUCCESS') {
					setTimeout(function(){
						$li.slideUp(200, 'linear', function(){
							$li.draggable('destroy');
							var cate = $li.closest('.task-category-wrap');
							$li.removeClass('edit');
							$li.find('.edit-wrap').empty();
							$li.find('.task-wrap').removeClass('proc');
							
							$li.prependTo('#task_list_complete').slideDown(200, 'linear');
							
							// 카테고리에 더 이상 내용이 없으면 삭제 처리
							if (cate.find('.task-each').length == 0) {
								cate.remove();
							}
							
							_self.taskCountCheck();
							_self.emptyTaskCheck();
							_self.refreshPage(true);
							
							// Type2로 보고 있는 경우 바로바로 적용
							if (_self.getMainType() == '2') {
								$('[data-id="' + obj.unid.substring(0,32) + '"] .event-text').addClass('complete');
							}
						});
					}, 300);
				} else {
					$li.find('.task-wrap').removeClass('complete proc');
					mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				}
			});
		} else {		
			// 미완료로 처리
			var obj = {opt: 'P', unid: $li.data('key'), system: 'task'};
			$li.find('.task-wrap').addClass('proc');
			$li.find('.task-wrap').removeClass('complete');
			this.calendarAPI(obj).then(function(res){
				var res = res.split('^');
				if (res[0] == 'SUCCESS') {
					setTimeout(function(){
						$li.slideUp(200, 'linear', function(){
							_self.taskDragEvent($li);
							$li.find('.task-wrap').removeClass('proc');
							
							// 돌아갈 카테고리를 찾아야 함....
							var info = $li.data('info');
							var cate = info.cate;
							_self.createTaskWrap(cate);
							var $wrap = $('#task_list').find('.task-category-wrap[data-category="' + cate + '"]');
							$wrap.find('.task-list').prepend($li);
							
							// 스크롤 처리
							var scroll = $li.position().top + $li.parent().position().top;
							scroll += $('#task_list_wrap').scrollTop() - 45;
							$('#task_list_wrap').animate({scrollTop:scroll}, 200, function(){
								$li.removeClass('edit');
								$li.find('.edit-wrap').empty();
								$li.slideDown();
								
								_self.taskCountCheck();
								_self.emptyTaskCheck();
								_self.refreshPage(true);
								
								// Type2로 보고 있는 경우 바로바로 적용
								if (_self.getMainType() == '2') {
									$('[data-id="' + obj.unid.substring(0,32) + '"] .event-text').removeClass('complete');
								}
							});

							/*
							$li.prependTo('#task_list').slideDown(200, 'linear');
							_self.taskCountCheck();
							_self.emptyTaskCheck();
							*/
						});
					}, 300);
				} else {
					$li.find('.task-wrap').removeClass('proc');
					$li.find('.task-wrap').addClass('complete');
					mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				}
			});
		}
	},
	"updateTaskCheck" : function($li){
		var _self = this;
		var $list = $('#task_list');
		var info = $li.data('info');
		
		var obj = {
			opt: 'U',
			unid: info.key 
		};
		var subj = $.trim($li.find('.subj-edit').val());
		var allday = $li.find('.all-day-check').is(':checked');
		var dt = $li.find('.date-edit').val();
		var s_time = $li.find('#task_s_time').val();
		var e_time = $li.find('#task_e_time').val();
		var is_work = $li.find('.task-work-check').is(':checked');

		obj.title = subj;
		obj.allday = allday;
		obj.system = 'task';
		
		if (is_work == false) {
			obj.ShowPS = "2";
		}
		
		
		if (dt != '') {
			if (allday) {
				obj.start = moment(dt).format('YYYY-MM-DD') + 'T' + '00:00:00Z';
				obj.end = moment(dt).format('YYYY-MM-DD') + 'T' + '00:00:00Z';
			} else {
				obj.start = moment(dt + 'T' + s_time).format();
				obj.end = moment(dt + 'T' + e_time).format();
				
				if (obj.start > obj.end) {
					console.log('시작시간이 종료시간보다 큰 경우 저장안함');
					$li.removeClass('edit');
					$li.find('.edit-wrap').empty();
					return;
				}
			}			
		} else {
			obj.start = "";
			obj.end = "";
		}
				
		
		// 날짜가 변경된 경우 카테고리 분류
		var new_cate = 'no_date';
		if (dt != '') {
			new_cate = moment(dt).format('YYYYMMDD');
			var now = moment().format('YYYYMMDD');
			if (now > new_cate) {
				new_cate = 'over_date';
			}
			
			// 서버 요청시 GMT 값으로 변경
			if (!obj.allday) {
				obj.start = moment(obj.start).utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]');
				obj.end = moment(obj.end).utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]');			
			}
		}
		
		
		this.calendarAPI(obj).then(function(){
			$li.find('.subj-wrap .task-date').text('');
			$li.find('.subj-wrap .task-subj').text(subj);
			$li.find('.subj-wrap .task-subj').attr('title', subj);
			if (dt != '' && !allday) {
				var date_info = moment(obj.start).format('LT');
				$li.find('.subj-wrap .task-date').text(date_info);
			}
			
			// 변경된 값으로 li 데이터셋 셋팅
			info.title = obj.title;
			info.start = obj.start;
			info.end = obj.end;
			info.allday = allday;
			info.work = is_work;
			
			if (info.work) {
				$li.addClass('work');
			} else {
				$li.removeClass('work');
			}
			
			if (info.cate != new_cate) {
				// 날짜 업데이트
				_self.createTaskWrap(new_cate);
				var $wrap = $list.find('.task-category-wrap[data-category="' + new_cate + '"]');
				var $before = $li.closest('.task-category-wrap');
				$li.slideUp(200, 'linear', function(){
					$wrap.find('.task-list').prepend($li);
					
					if ($before.find('.task-each').length == 0) {
						$before.remove();
					}
					
					// 스크롤 처리
					var scroll = $li.position().top + $li.parent().position().top;
					scroll += $('#task_list_wrap').scrollTop() - 45;
					$('#task_list_wrap').animate({scrollTop:scroll}, 200, function(){
						$li.removeClass('edit');
						$li.find('.edit-wrap').empty();
						$li.slideDown();
					});
					
				});
				info.cate = new_cate;
			} else {
				$li.removeClass('edit');
				$li.find('.edit-wrap').empty();		
			}
			
			// 내 캘린더를 보고 있는 경우 페이지 리프레쉬
			if ($('#main_own_cal .user').hasClass('on')) {
				_self.refreshPage(true);
			}
		}, function(){
			mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
		});
	},
	"removeTask" : function(key){
		var obj = {
			opt: 'D',
			unid: key,
			system: 'task'
		};
			
		return this.calendarAPI(obj);
	},
	"changeTaskSubject" : function(key, txt){
		var obj = {
			opt: 'U',
			unid: key,
			title: txt,
			system: 'task'
		};
		
		return this.calendarAPI(obj);
	},
	"changeTaskDate" : function($li){
		
		// Drag & Drop으로 캘린더에 끌어다 놓기 하는 경우
		var _self = this;
		var info = $li.data('info');
				
		if (!_self.hover_date) return;
		if (moment(_self.hover_date).format('YYYYMMDD') == info.cate) return;
		
		var obj = {
			opt: 'U',
			unid: info.key,
			title: info.title,
			allday: info.allday == true ? true : false,
			ShowPS: info.work == true ? '' : '2',
			system: 'task'
		};
		
		// 기존정보가 allday가 아니고, start값이 있으면 TIME부분 처리
		if (info.allday == false && info.start != '') {
			var move_date_s = moment(_self.hover_date).format('YYYYMMDD') + info.start.substr(info.start.indexOf('T')).replace(/:/g,'');
			var move_date_e = moment(_self.hover_date).format('YYYYMMDD') + info.end.substr(info.end.indexOf('T')).replace(/:/g,'');
			
			var start = moment(move_date_s).utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]');
			var end = moment(move_date_e).utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]');
			//var start = moment(_self.hover_date).format('YYYY-MM-DD') + info.start.substr(info.start.indexOf('T'));
			//var end = moment(_self.hover_date).format('YYYY-MM-DD') + info.end.substr(info.end.indexOf('T'));
		} else {
			var start = moment(_self.hover_date).format('YYYY-MM-DD') + 'T00:00:00Z';
			var end = moment(_self.hover_date).format('YYYY-MM-DD') + 'T00:00:00Z';
		}
		obj.start = start;
		obj.end = end;
		
		
		// 날짜가 변경된 경우 카테고리 분류
		var $list = $('#task_list');
		var new_cate = moment(_self.hover_date).format('YYYYMMDD');
		var now = moment().format('YYYYMMDD');
		if (now > new_cate) {
			new_cate = 'over_date';			
		}
		
		
		this.calendarAPI(obj).then(function(){
			info.allday = obj.allday;
			info.start = moment(obj.start).format();	//GMT -> Local 변환
			info.end = moment(obj.end).format();
			
			if (info.cate != new_cate) {
				// 날짜 업데이트
				_self.createTaskWrap(new_cate);
				var $wrap = $list.find('.task-category-wrap[data-category="' + new_cate + '"]');
				var $before = $li.closest('.task-category-wrap');
				$li.slideUp(200, 'linear', function(){
					$wrap.find('.task-list').prepend($li);
					
					if ($before.find('.task-each').length == 0) {
						$before.remove();
					}
					
					// 스크롤 처리
					var scroll = $li.position().top + $li.parent().position().top;
					scroll += $('#task_list_wrap').scrollTop() - 45;
					$('#task_list_wrap').animate({scrollTop:scroll}, 200, function(){
						$li.removeClass('edit');
						$li.find('.edit-wrap').empty();
						$li.slideDown();
					});
					
				});
				info.cate = new_cate;
			}
			
			// 화면 새로고침
			_self.refreshPage(true);
		}, function(){
			mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
		});
	},
	
	"calendarAPI" : function(obj){
		//opt : 추가 또는 업데이트 : "M", 삭제는 "D", 있으면 업데이트 없으면 추가 "U", 완료 처리 "T", 완료취소 "P"
		
		var _form_data = {
            '__Click': '0',
            '%%PostCharset': 'UTF-8',
            'SaveOptions': '0',
            'UserID' : gap.userinfo.rinfo.ky,
            'Mode': obj.opt,
            'Title': obj.title,
            'Attendee': obj.attendee || '',
            'Room': '',
            "AllDay": (obj.allday == true ? "1" : ""),
            'Startdatetime': obj.start || '',
            'Enddatetime': obj.end || '',
            'ShowPS' : obj.ShowPS || '',
            'Body': obj.express ? obj.express : '',
            //"Completion": "",
            'ApptCategory': obj.category || '',
            'Priority': obj.priority ? obj.priority : '3',
            'Link_info' : '',
            //"owner" : obj.owner.emp
            'CalKeyCode': obj.unid,	//일정 key 값
            'SystemCode': obj.system ? obj.system : 'task',	//연동 시스템 코드 (예 : 화상회의 예약)
            'ms': window.cur_mailserver	// 현재 접속한 메일서버 정보를 넘김
        };
		
		var url = this.caldbpath + "/fmmeeting?openform";
		return $.ajax({
			type: 'POST',
            url: url,
            data: _form_data,
            dataType: "text",
            success: function(data) {
                
            }
		}).then(function(data){
			return data;
		}, function(){
			return 'ERROR';
		});
	},
	
	// 일정 문서 완료 처리하기
	"calendarCompletion" : function(unid, compl){
		var url = this.caldbpath + "/(ag_completion)?OpenAgent";
		var param = {
			mailServer: window.mailserver, 
			mailFile: window.mailfile,
			unid: unid,
			completion: compl == true ? 'T' : 'P'
		}
		url = url + '&' + $.param(param);
		$.ajax({
			url: url,
			success: function(res){
			
			},
			error: function(){
				
			}
		});
	},
	
	// To-Do 완료처리
	"todoCompletion" : function(info, com_req){
		var arr_key = info.system_key.split('^');		
		var req_data = {};
		if (info.system_code == 'todo') {
			// To-Do
			req_data = {
				project_code 	: arr_key[0],
				select_id 		: arr_key[1],
				update_key 		: "status",
				update_data 	: com_req == true ? '3' : '2',
				select_key 		: "_id"
			};
		} else {
			// 체크리스트
			req_data = {
				project_code 	: arr_key[0],
				sid 			: arr_key[1],
				select_id 		: arr_key[2],
				update_key 		: "checklist.$.complete",
				update_data 	: com_req == true ? 'T' : 'F',
				select_key 		: "checklist.tid"
			};
		}
		
		
		var data = JSON.stringify(req_data);
		var url = gap.channelserver + "/update_todo_item_sub.km";
		
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : data,
			url : url,
			success : function(res){
				if (res.result == "OK"){
					
				}
			}
		});
	},
	
	"goOnlineMeeting" : function(event, data){
		// 종료일이 지났으면 참석 안됨
		var meet_sdate = moment(event.start);
		var meet_edate = moment(event.end);
		var now_date = moment();
		
		if (now_date.diff(meet_edate) > 0) {
			// 지난 회의는 참석 안됨
			mobiscroll.toast({message:gap.lang.mt_over_time, color:'danger'});		
		} else {
			if (now_date.diff(meet_sdate, 'm') < -15) {
				mobiscroll.toast({message:gap.lang.meeting_time_limit, color:'danger'});
			} else {
				// meeting_url을 가져와서 열어줘야 함
				var detail_def = gMet.getOnlineDetail(data.scheduleid);
				detail_def.then(function(res){
					if (res.error) {
						mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
						return;
					}
					
					// 화상회의 페이지 연결
					window.open(res.meetingurl);
				}, function(){
					mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				});
				
			}
		}
	},
	
	"replaceFilter" : function(str){
		return str
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	},
	
	"showUserTooltip" : function($target, info){
		/*
		 * 아래 데이터들이 모두 다르기 때문에 동일한 포맷으로 맞춰야 함
		 * 1. 캘린더에 저장된 사용자 정보
		 * 2. 검색창에서 검색한 결과
		 * 3. 조직도에서 선택한 결과
		 */
		
		// 여러군데서 넘어온 데이터들의 타입을 맞추기 위해 처리
		
		info.type = 'P';
		if (info.dept) info.orgname = info.dept;
		if (info.edept) info.eorgname = info.edept;
		if (info.odept) info.oorgname = info.odept;
		
		// 사용자 키 값 가져오기
		var target_ky = '';
		if (info.ky) {
			target_ky = info.ky;
		} else if (info.id){
			var notes_nm = new NotesName(info.id);
			if (notes_nm.isHierarchical) {
				target_ky = notes_nm.orgUnit1;
			}
		}
		
		// 키 값을 뽑아올 수 없는 경우
		if (!target_ky) {
			console.log("사용자의 키 값을 뽑아올 수 없음");
			return;	
		}
		
		// 변환이 안된 경우 변환처리
		if (!info.dp) {
			info = gap.convert_org_data(info);
		} 
		
		var userinfo = gap.user_check(info);
		
		var _self = this;
		var html = 
			'<div class="user-favo-layer">' +
			'	<div class="user-favo-title">' + userinfo.disp_user_info + '</div>' +
			'	<div class="user-favo-cont">' +
			'		<ul class="ico-cont">' +
			'			<li class="favo-ico tel"><div class="border-line"></div><span>' + gap.lang.tel + '</span></li>' +
			'			<li class="favo-ico chat"><div class="border-line"></div><span>' + gap.lang.chatting + '</span></li>' +
			'			<li class="favo-ico mail"><div class="border-line"></div><span>' + gap.lang.mail +'</span></li>' +
			'			<li class="favo-ico profile"><div class="border-line"></div><span>' + gap.lang.profile + '</span></li>' +
			'		</ul>' +
			'		<div class="workroom-cont" style="display:none;">' +
			'			<div class="workroom-title">' + gap.lang.rel_workroom + '</div>' +
			'			<ul class="workroom-list"></ul>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		var loader =
			'<svg class="ani-load" viewBox="0 0 100 100">' +
			'	<foreignObject class="logoBack"  x="0" y="0" width="100" height="100"><div class="logoGradient" xmlns="http://www.w3.org/1999/xhtml"></div></foreignObject>' +
			'	<g class="logoBlend"><rect x="0" y="0" width="100" height="100" /><path d="M 50 96 a 46 46 0 0 1 0 -92 46 46 0 0 1 0 92" /></g>' +
			'</svg>';
		
		$target.qtip({
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			content : {
				text : function(event, api){
					// 대상자와 연관된 연관 업무방
					var workroom = $target.data('work');
					var $res = $(html);
					
					
					
					
					// 이벤트 처리
					// 전화
					$res.find('.tel').on('click', function(){
						gap.phone_call(target_ky, '');
					});
					
					// 채팅
					$res.find('.chat').on('click', function(){
						var list = [];
						list.push({
							ky: target_ky,
							nm: userinfo.nm
						});
						gap.chatroom_create(list);
					});
					
					// 메일
					$res.find('.mail').on('click', function(){
						if ($(this).hasClass('process')) return;
						
						$(this).addClass('process');
						
						// 이메일정보가 없어 다시 쿼리해야 하기 때문에 연관 업무방 가져오는 로직에서 사용자 정보를 따로 저장해준다 
						var userdata = $(_self.show_user_tooltip.target).data('userinfo');
						if (!userdata) {
							$(this).removeClass('process');
							return;
						}

						var param = {opentype: 'popup',	callfrom: 'address', authorsend: userdata.em};			
						var memo_url = '/' + window.mailfile + '/Memo?openform&' + $.param(param);
						
						var swidth = Math.ceil(screen.availWidth * 0.8);
						var sheight = Math.ceil(screen.availHeight * 0.8);
						if (swidth > 1140) {
							swidth = 1140;				
						}
						gap.open_subwin(memo_url, swidth, sheight);
						
						$(this).removeClass('process');
					});
					
					// 메일
					$res.find('.profile').on('click', function(){
						gap.showUserDetailLayer(target_ky);
					});
					
					if (workroom) {
						_self.setUserWorkroom($res.find('.workroom-list'), workroom);
					} else {
						$.ajax({
							type: 'POST',
							url: gap.channelserver + "/channel_search_together.km",
							dataType : "json",
							data : JSON.stringify({
								email: gap.userinfo.rinfo.ky,
								members: target_ky
							}),
							success: function(res){
							
								if (res.result == 'OK') {
									var data = res.data.data;
									_self.setUserWorkroom($res.find('.workroom-list'), data);
									$target.data('work', data);
								} else {
									$res.find('.workroom-list').html('<div>Error</div>');
								}
							},
							error: function(){
								$res.find('.workroom-list').html('<div>Error</div>');
							}
						});
						
						$res.find('.workroom-list').html(loader);
					}
					
					return $res;
				}
			},
			show : {
				event: 'mouseover',
				ready: true
			},
			hide : {
				event : 'mouseout',
				//event: 'click',
				fixed : true,
				delay: 300
			},
			style : {
				classes : 'qtip-bootstrap qtip-user-more',
				tip : true
			},
			position : {
				my : 'top center',
				at : 'bottom center',
				viewport: $('#main_home'),
				adjust: {
					y: 20
				},
				effect: function(api, pos, viewport){
					pos.top -= 15;
					$(this).animate(pos,{duration: 200, queue: false, complete: function(){						
						//(gsap.timeline()).fromTo($('.user-favo-title'), {x:-20, opacity: 0}, {x:0, opacity:1, duration:0.2});
					}});
				}
			},
			events : {
				show : function(event, api){
					if (_self.show_user_tooltip) {
						if (_self.show_user_tooltip.target != api.target) {
							_self.show_user_tooltip.destroy(true);							
						}
					}
					_self.show_user_tooltip = api;
				},
				hidden : function(event, api){
					//api.destroy(true);
				},
				
				render: function(event, api){
					
				}
			}
			
		});
	},
	
	"setUserWorkroom" : function($list, data){
		var _self = this;
		
		if (data.length == 1) {
			//$list.append('<div class="no-workroom">연관된 업무방이 없습니다</div>');
			$(_self.show_user_tooltip.target).data('userinfo', data[0].userinfo);
			return;
		}
		
		$list.empty();
		$list.parent().show();
		
		$.each(data, function(){
			
			// 사용자 정보를 셋해준다
			if (this.userinfo) {
				$(_self.show_user_tooltip.target).data('userinfo', this.userinfo);
				return true;
			}
			
			if (!this.ch_code) return true;			
			var li = 
				'<li class="workroom-item" data-key="' + this.ch_code + '">' +
				'	<span class="room-title" title="' + this.ch_name + '">' + this.ch_name + '</span>' +
				'	<span class="ico-user"></span>' +
				'	<span class="user-cnt">' + this.members_count + '</span>' +
				'</li>';
			
			$list.append(li);
		});
		
		// 스크롤 나올 상황이면 스크롤 표시
		if (data.length > 8) {
			$list.css('overflow-y', 'auto');
		} 
		// 연관 업무방 애니메이션 효과 적용
		var tl = gsap.timeline();
		tl.from($list.find('.workroom-item'), {opacity: 0, y:10, stagger: 0.05, duration: 0.2});
		
		
		
		// 업무방 바로가기
		$list.find('.workroom-item').on('click', function(){
			var ch_code = $(this).data('key');
			var url = location.protocol + "//" +location.host + cdbpath + "/chat?readform&channel&" + ch_code;
			window.open(url, "webchat");
		});
	},
	
	// 휴일 정보 데이터 가져오기
	"getHolidayData" : function(sel_holi){
		
		var _self = this;
		//var sel_holi = "대상주식회사,Korea";
		
		var _url = this.caldbpath + '/(ag_get_holiday)?OpenAgent&ct=' + encodeURIComponent(sel_holi);
		$.ajax({
			url: _url,
			dataType: 'json',
			success: function(data){
				if (data.result.length == 0) return;
				window.holiday_source = data.result;
				_self.displayHoliday();
			},
			error: function(data) {
				console.log('휴일 가져오기 실패', data);
			}
		});
	},
	
	"displayHoliday" : function(){
		var _self = this;
				
		function _holidayDisplay(obj) {
			var source = [];
			var country = obj.country;
			var days = obj.holidays;
			
			var cal_ty = _self.getMainLayoutType();
			
			if (cal_ty == 'portlet') {
				var cal_obj = _self.sidecal;
			} else {
				var cal_obj = _self.maincal;
			}
			
			var m = moment(cal_obj._calendarView._active);
			var first_day = moment(cal_obj._calendarView._firstPageDay).format();
			var last_day = moment(cal_obj._calendarView._lastPageDay).add(-1, 'd').format();	// 종료일에 하루가 더해지므로 하루빼고 처리
			
			var m_min = moment(first_day);
			var m_max = moment(last_day);
			var m_min2 = moment(m_min).add(-1, 'days');
			var m_max2 = moment(m_max).add(1, 'days');
			
			$.each(days, function(idx, val) {
				
				// 반복 타입에 따라 다르게 설정 필요
				if (val.RepeatUnit == 'Y') {	// 매년
					
					var holi = moment(val.RepeatStartDate);
					
					
					// 해가 바뀌는 경우 있으므로 작년과 내년에 표시해야 할 상황이면 표시해야 함
					if (m_min.year() != m.year()) {
						if (m_min.month() == holi.month()) {
							var holi_dt = holi.year(m_min.year()).format('YYYYMMDD');
							_self.setHoliday(holi_dt, val);
							return true;
						}
					}
					
					// 해가 바뀌는 경우 있으므로 작년과 내년에 표시해야 할 상황이면 표시해야 함
					if (m_max.year() != m.year()) {
						if (m_max.month() == holi.month()) {
							var holi_dt = holi.year(m_max.year()).format('YYYYMMDD');
							_self.setHoliday(holi_dt, val);
							return true;
						}
					}
					
					var holi_dt = holi.year(m.year()).format('YYYYMMDD');
					_self.setHoliday(holi_dt, val);
					
				}else if (val.RepeatUnit == 'C') {	//커스텀
					
					var dates = val.RepeatCustom.split(',');
					$.each(dates, function(idx, dt) {
						var day = moment(dt);
						if (day.isSameOrAfter(m_min) && day.isSameOrBefore(m_max)) {
							var holi_dt = moment(day).format('YYYYMMDD');
							_self.setHoliday(holi_dt, val);
						}
					});
					
				}else if (val.RepeatUnit == 'MP') {	//Monthly By Day
					
					var day = moment(val.RepeatStartDate).year(m.year());
					day.date(1);
					if (day.isSameOrAfter(m_min2) && day.isSameOrBefore(m_max2)) {

						var c_month = day.month();
						var n = parseInt(val.RepeatAdjust.split('.')[0], 10);	// 몇 째주
						var d = parseInt(val.RepeatAdjust.split('.')[1], 10);	// 몇 요일, 0:일, 1:월, 6:토

						// 요일 먼저 이동
						day.day(d);
						if (c_month != day.month()) {
							day.add(1, 'week');
						}

						day.add(n-1, 'week');
						if (c_month != day.month()) {
							day.add(-1, 'week');
						}

						
						var holi_dt = moment(day).format('YYYYMMDD');
						_self.setHoliday(holi_dt, val);
						
					}
					
				}
				
			});

		}

		/*
		// 삭제 먼저 수행
		$.each(holiday_source, function(idx, val) {
			if (val.source) {
				$cal.fullCalendar('removeEventSource', val.source);
			}
		});
		*/

		if (window.holiday_source) {
			$.each(holiday_source, function(idx, val){
				_holidayDisplay(val);
			});			
		}
	},
	
	"removeAllHoliday" : function(){
		var $holicell = $('.holiday-cell');
		$holicell.removeClass('holiday-cell');
		$holicell.find('.holiday-line').removeClass('holiday-line');
		$holicell.find('.main-holi').html('').removeAttr('title');
		
		var $notholicell = $('.not-holi');
		$notholicell.removeClass('holiday-line');
		$notholicell.find('.main-holi').html('').removeAttr('title');
		
		
	},
	"getDefaultHoliday" : function(){
		// 언어에 맞게 나라 휴일 정보 셋팅
		var my_country;

		switch (gap.userinfo.userLang) {
			case 'ko':
				my_country = 'Korea';
				break;
			case 'zh':
				my_country = 'PRC';
				break;
			case 'ja':
				my_country = 'Japan';
				break;
			case 'en':
				my_country = 'United States';
				break;
			default:
				// 기본값은 없음
				my_country = '';
				break;
		}
		
		return my_country;
	},
	"setHoliday" : function(dt, obj){
		var cls = 'holiday-line';
		if (obj.NotHoliday == 'T') {
			cls += ' not-holi';
		}

		var $holi = $('.maincal_status_' + dt).parent().find('.main-holi');
		
		$holi.each(function(){
			var subj = $(this).text();
			
			if (subj.indexOf(obj.Subject) == -1) {
				subj = subj ? subj + ', ' + obj.Subject : obj.Subject;
				$(this).html(subj).attr('title', subj).closest('.main-day-wrap').addClass(cls);
				
				if (obj.NotHoliday != 'T') {
					$(this).closest('.mbsc-calendar-cell-inner').addClass('holiday-cell');
				}
			}
		});
		
		
	},
	
	"setCalendarSetting" : function(){
		var _self = this;
		
		$('.qtip-cal-set').remove();
		
		var html = 
			'<div class="cal-set-layer">' +
			'	<div class="cal-set-title"><span>' + gap.lang.cal_settings + '</span><div class="icon-wrap btn-close"><span></span><span></span></div></div>' +
			'	<div class="cal-set-cont">' +
			'		<svg class="ani-load" viewBox="0 0 100 100">' +
			'			<foreignObject class="logoBack"  x="0" y="0" width="100" height="100"><div class="logoGradient" xmlns="http://www.w3.org/1999/xhtml"></div></foreignObject>' +
			'			<g class="logoBlend"><rect x="0" y="0" width="100" height="100" /><path d="M 50 96 a 46 46 0 0 1 0 -92 46 46 0 0 1 0 92" /></g>' +
			'		</svg>' +
			'		<div class="cal-cont" style="display:none;">' +
			'			<div class="list-title">' + gap.lang.shared_cal + '</div>' +
			'			<ul id="cal_share_list"></ul>' +
			'			<div class="list-title">' + gap.lang.subscribe_cal + '</div>' +
			'			<ul id="cal_sub_list"></ul>' +
			'		</div>' +
			'		<div class="holi-cont" style="display:none;">' +
			'			<div class="list-title">' + gap.lang.select_holi_cal + '</div>' +
			'			<ul id="holiday_list"></ul>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		var $cal_set_layer = $(html);
		
		
		var $target = $('.cal-set');
		$target.qtip({
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			content : {
				text : function(event, api){
					// 그려줄 때 한번만 쵸시한다
					$.ajax({
						url: '/names.nsf/Holidays?ReadViewEntries&Collapse=1&Count=-1&outputformat=json',
						dataType: 'text',
						success: function(data) {						
							$cal_set_layer.find('.ani-load').hide();
							$cal_set_layer.find('.cal-cont').show();
							$cal_set_layer.find('.holi-cont').show();
						
							var $holi_list = $('#holiday_list');
							
							// 캘린더에 설정한 휴일정보
							if (_self.cal_config.dispHolidayGroup && _self.cal_config.dispHolidayGroup != '') {
								var holiday_group = _self.cal_config.dispHolidayGroup;
							} else {
								// 설정한 정보가 없으면 기본 값을 뿌려줘야 함
								var holiday_group = _self.getDefaultHoliday();
							}
							
							// 내 회사 체크
							if (localStorage.getItem('my_company_holi_nodisp') != 'T') {
								if (holiday_group.indexOf(gap.userinfo.rinfo.cp) == -1) {
									holiday_group = gap.userinfo.rinfo.cp + (holiday_group ? ',' + holiday_group : '');
								}
							}
							
							holiday_group = holiday_group.split(',');
							
							// 휴일 캘린더
							$holi_list.empty();
							data = eval('(' +data + ')');
							$.each(data.viewentry, function(idx, val) {
								var country = val.entrydata[0].text[0];
								
								// 선택된 국가 체크
								var checked = ($.inArray(country, holiday_group) != -1 ? ' checked="checked"' : '');
								
								var html = '<label><input type="checkbox" class="filled-in"' + checked + ' value="' + country + '">' + country + '</label>'; 											 
								var $li = $('<li>' + html + '</li>');
								$holi_list.append($li);
							});
							// 휴일 이벤트 처리
							$($holi_list).find('input').on('change', function(){
								var sel_holi = [];
								// 캘린더에 저장해줘야 함
								$($holi_list).find('input:checked').each(function(){
									sel_holi.push($(this).val());
								});
								
								// 내 회사의 휴일을 체크해제했는지 확인
								var ck = $(this).val();
								if (gap.userinfo.rinfo.cp == ck) {
									if (!$(this).is(':checked')) {
										localStorage.setItem('my_company_holi_nodisp', 'T');
									}
								}
								
								_self.removeAllHoliday();
								_self.getHolidayData(sel_holi);
								_self.calendarConfigUpdate('dispHolidayGroup', sel_holi.join(','));
							});
							
		
							// 공유 캘린더
							$('#cal_share_list').empty();
							if (_self.share_cal.length == 0) {
								$('#cal_share_list').append('<li>' + gap.lang.no_shared_cal + '</li>');
							}
							$.each(_self.share_cal, function(){
								var checked = (this.disable != '1' ? ' checked="checked"' : '');
								var html = '<label><input type="checkbox" class="filled-in"' + checked + ' value="' + this.id + '">' + this.name + '</label>'; 											 
								var $li = $('<li>' + html + '</li>');
								$('#cal_share_list').append($li);
							});
							// 공유 캘린더 이벤트 처리
							$('#cal_share_list').find('input').on('change', function(){
								var req_id = $(this).val();
								var req_disable = $(this).is(':checked') ? '0' : '1';
								$.each(_self.share_cal, function(){
									if (this.id == req_id) {
										this.disable = req_disable;
										return false;
									}
								});
								_self.calendarDisable(req_id, req_disable);
							});
							
							
							
							// 구독 캘린더
							$('#cal_sub_list').empty();
							if (_self.sub_cal.length == 0) {
								$('#cal_sub_list').append('<li>' + gap.lang.no_subscribe_cal + '</li>');
							}
							$.each(_self.sub_cal, function(){
								var checked = (this.disable != '1' ? ' checked="checked"' : '');
								var html = '<label><input type="checkbox" class="filled-in"' + checked + ' value="' + this.id + '">' + this.name + '</label>'; 											 
								var $li = $('<li>' + html + '</li>');
								$('#cal_sub_list').append($li);
							});
							// 구독 캘린더 이벤트
							$('#cal_sub_list').find('input').on('change', function(){
								var req_id = $(this).val();
								var req_disable = $(this).is(':checked') ? '0' : '1';
								$.each(_self.sub_cal, function(){
									if (this.id == req_id) {
										this.disable = req_disable;
										return false;
									}
								});
								_self.calendarDisable(req_id, req_disable);
							});
							
							
						},
						error: function() {
		
						}
					});
					
					return $cal_set_layer;
				}
			},
			show : {
				event: 'click',
				ready: false
			},
			hide : {
				//event : 'mouseout',
				event: 'unfocus',
				fixed : true,
				delay: 300
			},
			style : {
				classes : 'qtip-bootstrap qtip-cal-set',
				tip : false
			},
			position : {
				my : 'top left',
				at : 'bottom center',
				adjust: {
					x: -50,
					y: 15
				}
			},
			events : {
				show : function(event, api){
					$target.addClass('ico-show');
					setTimeout(function(){
						// 닫기
						$('.cal-set-layer').find('.btn-close').off().on('click', function(){
							$('.cal-set').qtip('hide');
						});
					}, 100);
				},
				hidden : function(event, api){
					$target.removeClass('ico-show');
				},
				render: function(event, api){
					
				}
			}
			
		});
	},
	
	"initBtnFullscreen" : function(){
		// 메인 하단에 캘린더 펼쳐보기 기능
		var _self = this;
		var $btn = $('#btn_main_fullscreen');
		
		
		var is_full = localStorage.getItem('main_cal_fullscreen') == 'T';
		if (is_full) {
			// 접어보기
			$btn.html('<span class="txt">' + gap.lang.cal_collapse + '</span><span class="arrow fold"></span>');
		} else {
			$btn.html('<span class="txt">' + gap.lang.cal_expand + '</span><span class="arrow"></span>');
		}
		
		$('#btn_main_fullscreen').on('click', function(){
			if ($btn.hasClass('process')) return false;
			
			$btn.addClass('process');
			var cur_opt = gHome.maincal.props.view.calendar.labels;
			var set_opt = $.extend(true, {}, gHome.maincal.props.view);
			if (cur_opt == 'all') {
				// 접는 액션
				set_opt.calendar.labels = true;
				localStorage.setItem('main_cal_fullscreen', 'F');
				$btn.find('.arrow').removeClass('fold');
				$btn.find('.txt').text(gap.lang.cal_expand);
			} else {
				// 펴는 액션
				set_opt.calendar.labels = 'all';
				localStorage.setItem('main_cal_fullscreen', 'T');
				$btn.find('.arrow').addClass('fold');
				$btn.find('.txt').text(gap.lang.cal_collapse);
			}
			
			gHome.maincal.setOptions({view:set_opt});

			

			// view를 새로 그리기 때문에 관련된 정보를 새로 그려줘야 함
			setTimeout(function(){
				$btn.removeClass('process');
				
				gHome.refreshPage(false);
				
				var $sun = $('div[aria-label*="Sunday"]');
				var $sat = $('div[aria-label*="Saturday"]');
				$sun.find('.mbsc-calendar-day-text').addClass('sunday');
				$sat.find('.mbsc-calendar-day-text').addClass('saturday');
				$sun.find('.mbsc-calendar-cell-inner').addClass('sunday-cell');
				$sat.find('.mbsc-calendar-cell-inner').addClass('saturday-cell');
				
				gHome.displayHoliday();
				gHome.setMainCalTodayBg();
				
				
				// 상태값 새로 셋팅
				var first_day = gHome.maincal._calendarView._firstPageDay;
				var last_day = gHome.maincal._calendarView._lastPageDay;
				var s_key = moment(first_day).add(-1, 'days').format('YYYYMMDD[T000000Z]');
				var e_key = moment(last_day).add(1, 'days').format('YYYYMMDD[T235959Z]');
				if (gHome.req_status) {
					gHome.req_status.abort();
				}
				gHome.req_status = gHome.setUserStatus(s_key, e_key);
			}, 300);
			
		});
		
		// 1초후에 표시되도록 처리
		setTimeout(function(){
			$btn.addClass('btn-show');
		}, 2000);
	},
	
	"calendarConfigUpdate" : function(_key, _val){
		var _self = this;
		var param = {
			mf: gap.userinfo.rinfo.mf,
			key: _key,
			value: _val
		}
		
		$.ajax({
            url: _self.caldbpath + '/(ag_config_mod)?OpenAgent&' + $.param(param),
            dataType: 'json',
            success: function(data) {
				_self.cal_config[_key] = _val;
            }
		});
	},
	
	"calendarDisable" : function(req_id, req_disable){
		var _self = this;
		var param = {
			mailfile: gap.userinfo.rinfo.mf,
			notesid: req_id,
			disable: req_disable
		}
		
		$.ajax({
            url: _self.caldbpath + '/(ag_calendar_mod)?OpenAgent&' + $.param(param),
            dataType: 'json',
            success: function(data) {
				_self.refreshPage(true);
            }
		});
	},
	
	"gotoScrollToday" : function(delay){
		// 캘린더 스크롤 나오는 상황에서는 오늘 날짜로 스크롤 처리
		if (localStorage.getItem('main_cal_fullscreen') == 'T') {
			var $today = $('.mbsc-calendar-today');
			if ($today.length == 0) return;
			
			// 오늘 날짜로 스크롤 처리
			setTimeout(function(){
				var padding = $('.mbsc-calendar-body-inner').offset().top + 20;
				var cal_top = $today.closest('.mbsc-calendar-row').offset().top - padding;
				$('.mbsc-calendar-body-inner-variable').stop().animate({scrollTop:cal_top}, 500);	
			}, (delay || 300));				
		}
	},
	
	"initMainPortlet" : function(){
		// 일단 하드코딩해보고
		if (!this.init_portlet) {
			this.loadPortlet();			
		}
	},
	
	"showPortletLayer" : function(){
		var _self = this;
		
		
		
		var html =
			'<div id="set_main_layout" class="layer_wrap main_set_popup center" style="width: 1380px;">' +
			'	<div class="layer_inner">' +
			'		<div class="pop_btn_close"></div>' +
			'		<div class="top-tit">' +
			'			<h4>' + gap.lang.main_setting + '</h4>' +
			'			<button class="guide">?</button>' +
			'		</div>	' +
			
			// 상단 레이아웃 설정
			'		<div class="top-ui-set">' +
			'			<ul id="sel_portlet_layout">' +
			'				<li data-layout="1">' +
			'					<img src="./img/layout/ico_layout_1.png">' +
			'					<img src="./img/layout/ico_layout_1_on.png">' +
			'					<p>' + gap.lang.calendar + '</p>' +
			'				</li>' +
			'				<li data-layout="2">' +
			'					<img src="./img/layout/ico_layout_2.png">' +
			'					<img src="./img/layout/ico_layout_2_on.png">' +
			'					<p>' + gap.lang.layout_2 + '</p>' +
			'				</li>' +
			'				<li data-layout="3">' +
			'					<img src="./img/layout/ico_layout_3.png">' +
			'					<img src="./img/layout/ico_layout_3_on.png">' +
			'					<p>' + gap.lang.layout_3 + '</p>' +
			'				</li>' +
			'				<li data-layout="4">' +
			'					<img src="./img/layout/ico_layout_4.png">' +
			'					<img src="./img/layout/ico_layout_4_on.png">' +
			'					<p>' + gap.lang.layout_4 + '</p>' +
			'				</li>' +
			'			</ul>' +
			'		</div>					' +
			
			
			'		<div class="bot-main flex">' +
			
			// 레이아웃 미리보기
			'			<div class="left_set">' +
			'				<div class="set_wrap">' +
			'					<div class="layout_set">' +
			'						<div class="tit_bar">' +
			'							<h2 class="f_between">' +
			'								<span id="layout_pre_tit"></span>' +
			//'								<span class="tit_noti">* 우측 메뉴 클릭 후 드래그 하시면 적용 됩니다.</span>' +
			'							</h2>' +
			'							<div class="mbsc-form-group">' +
			'								<label>' + gap.lang.calendar + '<input mbsc-segmented type="radio" name="main_view_type" value="calendar"></label>' +
			'								<label>' + gap.lang.btn_lay_change + '<input mbsc-segmented type="radio" name="main_view_type" value="portlet"></label>' +
			'							</div>' +
			'						</div>' +
			'						<div class="layout_preview">' +
			'							<div id="layout_pre_def" style="display:none;"><div class="ui_layout ui1"></div></div>' +
			'							<div id="layout_pre_list" style="display:none;"></div>' +
			'						</div>' +
			'						<p id="layout_pre_cnt" style="display:none;">' +
			'							<span class="cur_cnt">-</span> / <span class="total_cnt"></span>' +
			'						</p>' +
			'					</div>' +
			'				</div>' +
			'			</div>' +
			
			// 적용 메뉴 선택
			'			<div class="right_set">' +
			'				<div id="layout_menu_dim"></div>' +
			'				<div class="set_wrap">' +
			'					<div class="scroll">' +
			'						<div class="layout_set">' +
			'							<div class="tit_bar">' +
			'								<h2 class="f_between">' + gap.lang.lay_menu_title + '</h2>' +
			'							</div>' +
			'							<div class="ui_setting">' +
			'								<ul id="portlet_list" class="ui_menu">' +
			'								</ul>' +
			'							</div>' +
			'						</div>' +
			'					</div>' +
			'				</div>' +
			'			</div>' +
			
			'		</div>' +
			
			// 하단 버튼 영역
			'		<div class="bot-btn">' +
			'			<div class="btn-wr">' +
			'				<button class="confirm">' + gap.lang.basic_save + '</button>' +
			'				<button class="cancel">' + gap.lang.Cancel + '</button>' +
			'			</div> ' +
			'		</div>' +
			
			'	</div>' +	// end layer_inner
			
			'</div>';
		
		
		gap.showBlock();
		
		var $layer = $(html);
		$('Body').append($layer);

		gsap.from('#set_main_layout', {x:500, duration:0.3});
		
		// 토글 버튼 처리
		mobiscroll.enhance($layer[0]);
		
		// 이벤트 처리
		this.portletEventBind();
		
		// 포틀릿 메뉴 리스트 가져오기
		this.getPortletMenuList();
		
		// 내가 설정한 내용 가지고 와야 함
		this.getMyPortletList();

		
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx);

	},
	
	
	"getPortletMenuList" : function(){
		var _self = this;
	
		var surl = gap.channelserver + "/portlet_list.km";
		var postData = {
				"start" : "0",
				"perpage" : "1000",
				"query" : "",
				"admin" : ""
			};
		
		$('#portlet_list').empty();
		
		return $.ajax({
			type : "POST",
			url : surl,
			dataType : "text",	//"json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},	
			success : function(__res){
				var res = JSON.parse(__res);
				var _list = res.data.response;

				
				$.each(_list, function(){
					var _key = this.code;
					var _menu_nm = gap.userinfo.userLang == 'ko' ? this.menu_kr : this.menu_en;
					var _icon_src = gap.channelserver + "/portletpreview.do?code=" + _key + '&ver=' + this.last_update;
					
					var html = 
						'<li class="portlet-menu" data-key="' + _key + '">' +
						'	<label>' +
						'		<input name="sel_portlet" type="radio">' +
						'		<span>' + _menu_nm + '</span>' +
						'		<div class="menu_thumb_wr">' +
						'			<div class="menu_thumb" style="background-image:url(' + _icon_src + ');"></div>' +
						'		</div>' +
						'	</label>' +
						'</li>';
					
					var $li = $(html);
					$li.data('info', this);
					
					$('#portlet_list').append($li);
				});
				
				// 리스트 이벤트
				$('#portlet_list .portlet-menu').on('click', function(){
					if ($(this).hasClass('on')) return false;
					
					// 좌측에 선택된 레이아웃
					var $el = $('#layout_pre_list .ui_layout.on');
					var info = $(this).data('info');
					_self.setPortletPreviewMenu(info, $el);
					
					return false;
				});
				
				// 내가 설정한 데이터를 먼저가져오면 라디오 버튼 설정이 늦을 수 있으므로 별도 처리한다
				var $sel_lay = $('#layout_pre_list .ui_layout.on');
				if ($sel_lay.hasClass('set')) {
					var sel_key = $sel_lay.data('info').code;
					var $sel_li = $('#portlet_list .portlet-menu[data-key="' + sel_key + '"]');
					$sel_li.addClass('on');
					$sel_li.find('input[type=radio]').prop('checked', true);
				}
			}
		});
	},
	
	"getMyPortletList" : function(){
		var _self = this;
		
		$.ajax({
			async: false,
			type: "POST",
			url: gap.channelserver + "/portlet_person_list.km",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success: function(res){
				var data = res.data.data;
				var my_data = data;
				
				if (!my_data.type || my_data.data.length == 0) {
					// 저장된 데이터가 없으면 기본값을 불러온다
					_defaultLayout();
					return;
				}
				
				var $layer = $('#set_main_layout');
				var lay_idx = my_data.data.length - 1;
				$('#sel_portlet_layout li:eq(' + lay_idx + ')').addClass('on');
				
				if (lay_idx == 0) {
					// 기본
					$('#layout_pre_def').show();
					$('#layout_pre_list').hide();
					$('#layout_pre_cnt').hide();
					$layer.find('input[value="calendar"]').prop('checked', true).click();
				} else {
					// 레이아웃
					$('#layout_pre_def').hide();
					$('#layout_pre_list').show();
					$('#layout_pre_cnt').show();
					_self.addPreviewLayout(my_data.data.length);
					
					$.each(my_data.data, function(idx, val){
						var $el = $('#layout_pre_list .ui_layout:eq(' + idx + ')');
						_self.setPortletPreviewMenu(this, $el);
					});
					
					$layer.find('input[value="portlet"]').prop('checked', true).click();

				}				
			},
			error: function(){
				_defaultLayout();
			}
		});
		
		

		function _defaultLayout(){
			$('#set_main_layout input[value="portlet"]').prop('checked', true).click();
			
			$('#sel_portlet_layout li:eq(1)').addClass('on');
			$('#layout_pre_list').show();
			$('#layout_pre_cnt').show();
			
			_self.addPreviewLayout(2);
			$('#layout_pre_list .ui_layout:first-child').click();			
		}
	},
	
	
	"portletEventBind" : function(){
		var _self = this;
		
		var $layer = $('#set_main_layout');
		
		// 닫기
		$layer.find('.pop_btn_close').on('click', function(){
			$layer.remove();
			gap.hideBlock();
			
			// 닫힐 때, 설정된 값이 없으면 캘린더 화면으로 이동시킨다.
			if (_self.portlet_info.data.length == 0) {
				_self.setMainLayoutType('calendar');
				return;
			}
		});
		
		
		// 도움말
		$layer.find('.guide').on('click', function(){
			gptl.mainGuideView(gap.userinfo.userLang);
		});
		
		/*
		// 상단 레이아웃 선택 기능
		$('#sel_portlet_layout li').on('click', function(){
			var $this = $(this);
			
			if ($this.hasClass('on')) return false;
			
			// 기존에 선택된 메뉴가 있는 경우 컨펌창 표시
			var b_opt = $('#sel_portlet_layout li.on').data('layout');
			if (b_opt != 1) {
				if ($('#layout_pre_list .ui_layout.set').length > 0) {
					gap.showConfirm({
						title: '레이아웃 변경',
						contents: '선택하신 메뉴가 초기화됩니다<br><span>레이아웃을 변경할까요?</span>',
						callback: function(){
							_changeLayout();
						}
					});
					return;
				}
			}
			
			_changeLayout();
			
			function _changeLayout(){
				$('#sel_portlet_layout li').removeClass('on');
				$this.addClass('on');
				
				// 타이틀
				var tit = $this.find('p').text() + ' 선택';
				$('#layout_pre_tit').text(tit);
				
				$('#layout_menu_dim').show();
				
				// 리스트 처리
				var opt = $this.data('layout');
				
				// 카운트 표시
				$('#layout_pre_cnt .cur_cnt').text('-');
				$('#layout_pre_cnt .total_cnt').text(opt);
				
				
				if (opt == '1') {
					// 기본 설정
					$('#layout_pre_def').show();
					$('#layout_pre_list').hide();
					$('#layout_pre_cnt').hide();
				} else {
					$('#layout_pre_def').hide();
					$('#layout_pre_list').show();
					$('#layout_pre_cnt').show();
					
					// 캐러셀 적용
					_self.layoutCarousel(opt);
				}				
			}
		});
		*/
		
		// 라디오 버튼
		$layer.find('input[name="main_view_type"]').on('change', function(){
			var ty = $(this).val();
			if (ty == 'calendar') {
				$('#layout_pre_def').show();
				$('#layout_pre_list').hide();
				$('#layout_pre_cnt').hide();
				
				$('#sel_portlet_layout li').removeClass('on');
				$('#sel_portlet_layout li:eq(0)').addClass('on');
				$('#layout_menu_dim').show();
				$('#portlet_list .portlet-menu').removeClass('on');
				$('#portlet_list input[type=radio]').prop('checked', false);
			} else {
				$('#layout_pre_def').hide();
				$('#layout_pre_list').show();
				$('#layout_pre_cnt').show();
								
				$('#sel_portlet_layout li').removeClass('on');
				
				var ck = $('#layout_pre_list .ui_layout.set').length;
				var idx = 1;
				if (ck >= 2) {
					idx = ck - 1;
				}
				$('#sel_portlet_layout li:eq(' + idx + ')').addClass('on');
				$('#layout_menu_dim').hide();
				
				// 선택된 체크박스 표시
				if ($('#layout_pre_list').find('.ui_layout.set.on')) {
					var _info = $('#layout_pre_list').find('.ui_layout.set.on').data('info');
					var $sel_menu = $('#portlet_list .portlet-menu[data-key="' +  _info.code + '"]');
					$sel_menu.find('input[type=radio]').prop('checked', true);
					$sel_menu.addClass('on');
				}
			}
			
			var title = $('#sel_portlet_layout li.on p').text();
			$('#layout_pre_tit').text(title);
		});
		
		// 레이아웃 Drag & Drop
		$('#layout_pre_list').sortablejs({
			animation: 150,
			ghostClass: 'menu-ghost',
//			filter: '.add-menu-wrap,.color-change-wrap',
			onStart: function(evt){
				$(evt.from).addClass('dragging');
			},
			onEnd: function(evt){
				$(evt.from).removeClass('dragging');
				_self.checkPortletLayout();
			},
			onMove: function (evt) {
/*
				if (evt.related.className.indexOf('add-menu-wrap') >= 0) {
					return false;
				} else if (evt.related.className.indexOf('color-change-wrap') >= 0) {
					return false;
				} else {
					return true;
				}
*/
			}
		});
		
		
		// 설정 완료
		$layer.find('.confirm').on('click', function(){
			var ty = $('#set_main_layout input[name="main_view_type"]:checked').val();
			
			// 메인 토글 변경
			$('#btn_main_change input[name="main_lay_type"][value="' + ty + '"]').prop('checked', true).click();
			
			
			var $list = $('#layout_pre_list');
			
			// 포틀릿 설정인 경우 Valid 체크
			if (ty == 'portlet') {
				var set_len = $list.find('.ui_layout.set').length;
				if (set_len < 2) {
					mobiscroll.toast({message:gap.lang.layout_alert_2, color:'danger'});
					return;
				}				
			}
			
			_self.savePortletInfo().then(function(){
				$layer.find('.pop_btn_close').click();
				
				_self.init_portlet = false;
				
				// 메인을 맞춰서 새로 그려준다
				_self.loadPortlet();
			});
		});
		
		
		// 취소
		$layer.find('.cancel').on('click', function(){
			$layer.find('.pop_btn_close').click();
		});
		
	},
	
	"layoutCarousel" : function(opt){
		var $list = $('#layout_pre_list');
		$list.empty();
		
		var len = parseInt(opt);
		
		var $wrap = $('<div id="portlet_pre_owl" class="owl-carousel"></div>');
		$list.append($wrap);
		
		for (var i=1; i<=len ; i++) {
			var html =
				'<div id="portlet_preview_' + i +'" class="ui_layout">'+
				'	<div class="plus"></div>' +
				'	<span class="sel_menu_txt">' + gap.lang.select_menu + '</span>' +
				'</div>';
			
			$wrap.append(html);
		}
		
		$wrap.owlCarousel({
			stagePadding: 30,
			items: 2,
			margin: 10,
			nav: true,
			navText: '',
			mouseDrag: false,
			slideBy: 1
		});
		
		
		// 레이아웃 클릭시 메뉴 선택 가능해야 함
		$list.find('.ui_layout').on('click', function(){
			if ($(this).hasClass('on')) return;
			
			// 메뉴 선택 초기화
			$('#portlet_list .portlet-menu').removeClass('on');
			$('#portlet_list input[type=radio]').prop('checked', false);
			
			var page = $(this).parent().index() + 1;
			$('#layout_pre_cnt .cur_cnt').text(page);

			// 설정된 메뉴가 있을 경우
			if ($(this).hasClass('set')) {
				var _sel_info = $(this).data('info');
				var $sel_menu = $('#portlet_list .portlet-menu[data-key="' + _sel_info.code + '"]');
				$sel_menu.addClass('on');
				$sel_menu.find('input[type=radio]').prop('checked', true);
			}
			
			$list.find('.ui_layout').removeClass('on');
			$(this).addClass('on');
			
			$('#layout_menu_dim').hide();
		});
		
		// 자동으로 첫번째 선택
		$list.find('.owl-item:first-child .ui_layout').click();
	},
	
	"setPortletPreviewMenu" : function(info, $el){
		var _self = this;
		
		if ($el.hasClass('set')) {
			var b_info = $el.data('info');
			
			// 기존에 설정된 값이 있으면 컨펌창 확인후 변경
			if (b_info.code != info.code) {
				gap.showConfirm({
					title: gap.lang.menu_change,
					contents: gap.lang.layout_alert_1,
					callback: function(){
						_setMenu();
					}
				});
			}
			return;
		}
		
		_setMenu();
		
		function _setMenu(){
			var menu_nm = gap.userinfo.userLang == 'ko' ? info.menu_kr : info.menu_en;
			var btn_config = (info.btn_config == 'T' ? '<button class="mn_set">편집</button>' : '');
			var img_src = gap.channelserver + "/portletpreview.do?code=" + info.code + '&ver=' + info.last_update;
			
			var html = 
				'<div class="ui_dropmn">' +
				'	<div class="mn_tit">' +
				'		<span>' + menu_nm + '</span>' + 
	            '		<div class="layout-remove"><span></span></div>' +
	            '	</div>' +
	            '	<div class="menu_pre_thumb_wr">' +
	            '		<div class="menu_pre_thumb" style="background-image:url(' + img_src + ')"></div>' +
	            '	</div>' +
	            '</div>';
			
			var $pre = $(html);
			
			// 레이아웃 삭제
			$pre.find('.layout-remove').on('click', function(){
				_self.removePreviewLayout(this);
				return false;
			});

			$el.empty();
			$el.append($pre);
			$el.addClass('set');
			$el.data('info', info);
			
			
			var $sel_li = $('#portlet_list .portlet-menu[data-key="' + info.code + '"]');
			
			$('#portlet_list .portlet-menu').removeClass('on');
			$sel_li.addClass('on');
			$sel_li.find('input[type=radio]').prop('checked', true);
			

			var $next = $('#layout_pre_list .ui_layout:not(.set):not(.on):eq(0)');
			if ($next.length > 0) {
				// 선택되지 않은 레이어 자동선택
				/*
				var next_idx = $next.parent().index();
				$('#portlet_pre_owl').trigger('to.owl.carousel', [next_idx, 500, true]);
				*/
				$next.click();
			} else {
				var layout_len = $('#layout_pre_list .ui_layout').length;
				if (layout_len < 4) {
					// 모두 선택한 경우 자동으로 레이어 추가
					_self.addPreviewLayout(1);
					$('#layout_pre_list .ui_layout:last-child').click();					
				}
			}
			
			_self.checkPortletLayout();
		}
		
	},
	
	"checkPortletLayout" : function(){
		var $list = $('#layout_pre_list');
		var len = $list.find('.ui_layout.set').length;
		var idx = len - 1;
		
		if (idx < 1) idx = 1; // default 2단
		
		// 레이아웃 선택
		$('#sel_portlet_layout li').removeClass('on');
		var $sel_li = $('#sel_portlet_layout li:eq(' + idx + ')');
		$sel_li.addClass('on');
		$('#layout_pre_tit').text($sel_li.find('p').text());
		
		// 현재 페이지 표시
		var cur_cnt = $list.find('.ui_layout.on').index();
		cur_cnt = (cur_cnt < 0 ? '-' : cur_cnt+1);
		$('#layout_pre_cnt .cur_cnt').text(cur_cnt);
		
		// 총 페이지 표시
		var total_cnt = $list.find('.ui_layout').length;
		$('#layout_pre_cnt .total_cnt').text(total_cnt);
	},
	
	"addPreviewLayout" : function(cnt){
		var _self = this;
		var $list = $('#layout_pre_list');
		
		for (var i=1; i<=cnt ; i++) {
			
			var html = this.defaultPreviewHtml();
			var $li = $(html);			
			
			$li.on('click', function(){
				if ($(this).hasClass('on')) return;
				
				// 메뉴 선택 초기화
				$('#portlet_list .portlet-menu').removeClass('on');
				$('#portlet_list input[type=radio]').prop('checked', false);
				
				var page = $(this).index() + 1;
				$('#layout_pre_cnt .cur_cnt').text(page);

				// 설정된 메뉴가 있을 경우
				if ($(this).hasClass('set')) {
					var _sel_info = $(this).data('info');
					var $sel_menu = $('#portlet_list .portlet-menu[data-key="' + _sel_info.code + '"]');
					$sel_menu.addClass('on');
					$sel_menu.find('input[type=radio]').prop('checked', true);
				}
				
				$list.find('.ui_layout').removeClass('on');
				$(this).addClass('on');
				
				$('#layout_menu_dim').hide();
			});
			

			$list.append($li);
			
		}
		
		_self.checkPortletLayout();
	},
	
	"removePreviewLayout" : function(el){
		var _self = this;
		var $list = $('#layout_pre_list');
		var $pre = $(el).closest('.ui_layout');
		
		var cur_len = $list.find('.ui_layout').length;
		var set_len = $list.find('.ui_layout.set').length;
		
		var is_empty_menu = false;
		
		if (cur_len == 2) {
			is_empty_menu = true;
		} else {
			if (set_len == cur_len) {
				is_empty_menu = true;
			} 
		} 
		
		// 레이어를 삭제하지 않고 비우기만 해야 하는 경우
		if (is_empty_menu) {
			var html = this.defaultPreviewHtml(true);
			$pre.empty().removeClass('set');
			$pre.html(html);
			
			$('#portlet_list .portlet-menu').removeClass('on');
			$('#portlet_list input[type=radio]').prop('checked', false);
			
			if (cur_len != 2) {
				$list.append($pre);	//제일 끝으로 이동				
			}
			$pre.removeClass('on');
			$pre.click();
		} else {
			$pre.remove();
			$list.find('.ui_layout:not(.set):eq(0)').click();
		}
		
		this.checkPortletLayout();
	},
	
	"defaultPreviewHtml" : function(is_inner){
		if (is_inner) {
			var html =
				'	<div class="plus"></div>' +
				'	<span class="sel_menu_txt">' + gap.lang.select_menu + '</span>';
		} else {
			var html =
				'<div class="ui_layout ui-draggable">'+
				'	<div class="plus"></div>' +
				'	<span class="sel_menu_txt">' + gap.lang.select_menu + '</span>' +
				'</div>';
		}
		return html;
	},
	
	"savePortletInfo" : function(callfrom){
		if (callfrom == 'portlet') {
			// 각 포틀릿 메뉴의 config를 통해 수정한 경우
			var $list = $('#portlet_cont .portlet-wrap');
			var ty = this.getMainLayoutType();
		} else {
			// 포틀릿 셋팅하는 화면에서 호출한 경우
			var $list = $('#layout_pre_list .ui_layout.set');
			var ty = $('#set_main_layout input[name="main_view_type"]:checked').val();
		}
		
		// 레이아웃 정보 생성
		var postData = [];
		$list.each(function(){
			var info = $(this).data('info');
			var menuinfo = {
				code: info.code,
				btn_config: info.btn_config,
				btn_refresh: info.btn_refresh,
				menu_kr: info.menu_kr,
				menu_en: info.menu_en,
				last_update: info.last_update,
				config: (info.config ? info.config : '')	// 포틀릿에 대한 환경설정 값이 있으면 저장해준다
			}
			if (info.app_info) {
				menuinfo.app_info = info.app_info;
			}
			postData.push(menuinfo);
		});

		this.portlet_info = {type:ty, data:postData};
		
		// 포틀릿 정보 저장
		return $.ajax({
			type: "POST",
			url: gap.channelserver + "/api/portal/save_person_portlet.km",
			dataType : "text",	//"json",
			data : JSON.stringify(this.portlet_info),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success: function(__res){
				
			},
			error: function(){
				
			}
		});
	},
	
	"loadPortlet" : function(){
		var _self = this;
		
		// 포틀릿 설정을 하지 않은 경우
		if (_self.portlet_info.type == 'calendar'){
			$('#main_content').addClass('show-maincal');
			$('#main_right_wrap').addClass('show-task');
			
			// 퀵채팅 아이콘 리프레쉬
			gma.refreshPos();
			return;
		}
		
		_drawPortlet();
			
		
		function _drawPortlet(){
			$('#main_content').removeClass('show-maincal');
			$('#main_right_wrap').removeClass('show-task');
			
			// 퀵채팅 아이콘 리프레쉬
			gma.refreshPos();
						
			$('#portlet_cont').remove();
			var $wrap = $('<div id="portlet_cont" class="owl-carousel"></div>');
			$('#main_portlet').append($wrap);

			
			$.each(_self.portlet_info.data, function(idx, val){
				var menu_nm = gap.userinfo.userLang == 'ko' ? val.menu_kr : val.menu_en;
				
				var btn = '<div class="btn-wrap">';
				
				// 환경설정 버튼
				if (val.btn_config == 'T') {
					btn += '<button type="button" data-btn="config" class="btn_config"><img src="./img/layout/btn_setting.png"></button>';
				}
				
				// 새로고침 버튼
				if (val.btn_refresh == 'T') {
					btn += '<button type="button" data-btn="refresh" class="btn_refresh"><img src="./img/layout/btn_refresh.png"></button>';
				}

				btn += '</div>';
				
				
				var _id = 'portlet_' + (idx+1);
				var html = 
					'<div class="portlet-wrap">' +
					'	<div class="portlet-tit-wr">' +
					'		<div class="portlet-tit">' + menu_nm + '</div>' + btn +
					'	</div>' +
					'	<div id="' + _id + '_cont" class="portlet-content"></div>' +
					'</div>';
				var $portlet = $(html);
				$portlet.data('info', val);
				
				
				// 메뉴 포틀릿인 경우 메뉴에 대한 최신화된 정보를 별도 데이터셋에 저장한다(TODO)
				if (val.code == 'portlet_menu' && val.app_info && val.app_info.data) {
					$portlet.data('app_info', {folder:val.app_info.data});
				}
				
				
				$('#portlet_cont').append($portlet);
			});

			
			
			$('#portlet_cont').owlCarousel({
				autoWidth: false,
				stagePadding: 10,
				items: 2,
				margin: 30,
				nav: true,
				mouseDrag: false,
				slideBy: 2
			});
			
			
			// 포틀릿 데이터 로딩
			$wrap.find('.portlet-wrap').each(function(){
				var $portlet = $(this);
				var data = $portlet.data('info');
				var el_id = $portlet.find('.portlet-content').attr('id'); 
				gptl.load_portlet(data.code, el_id);
				
				// 버튼에 이벤트 걸기
				$(this).find('button').each(function(){
					var ty = $(this).data('btn');
					var fun_nm = 'call_portlet_' + ty;
					
					$(this).on('click', function(){
						if (gptl[fun_nm]) {
							if (ty == 'config') {
								gptl[fun_nm](data.code, $portlet);								
							} else {
								gptl[fun_nm](data.code, el_id);
							}
						}
					});
				});
				
				
			});
			
			_self.init_portlet = true;
		}
	},
	
	"initSideCal" : function(dt, pass_status){
		var _self = this;
		
		if (this.sidecal) {
			// 페이지가 전환되었다가 표시된 경우
			if (!dt) dt = new Date();
			
			// 오늘 날짜로 이동
			this.sidecal.navigate(dt);

			// 상태값 초기화
			if (!pass_status) {
				$('#side_cal .mbsc-calendar-cell-inner').removeClass('day_1 day_2 day_3 day_4 day_5 day_6 day_7 day_8 day_9 day_10 day_11').data('type', '');
			}
			
			// 신규로 데이터 불러오기
			var first_day = this.sidecal._calendarView._firstPageDay;
			var last_day = this.sidecal._calendarView._lastPageDay;
			var s_key = moment(first_day).add(-1, 'days').format('YYYYMMDD[T000000Z]');
			var e_key = moment(last_day).add(1, 'days').format('YYYYMMDD[T235959Z]');
			
			_self.getUserEventBySide(s_key, e_key, pass_status, this.sidecal);
		} else {
			
			this.sidecal = $('#side_cal').mobiscroll().eventcalendar({
				theme: 'ios',
				themeVariant : 'light',
				clickToCreate: 'double',	// 더블클릭으로 신규 작성
				view: {
					calendar: {
						type: 'month',
						popover: false,
						weekNumbers: true,
						labels: false
					}
				},
				onInit: function(event, inst){
					var s_moment = moment(event.value).date(1).startOf('week'); // 해당월 주차의 첫째날로 셋팅
					var s_key = s_moment.add(-1, 'days').format('YYYYMMDD[T000000Z]'); // 타임존 때문에 데이터 안나오는 경우 없도록 시작일 -1
					var e_key = s_moment.add(43, 'days').format('YYYYMMDD[T235959Z]'); // Mini캘린더에 뿌려지는 날짜수 +1
					_self.getUserEventBySide(s_key, e_key, null, inst);
				},
				onPageChange: function(event, inst){
					// 월을 변경할 때 호출
					var s_key = moment(event.firstDay).add(-1, 'days').format('YYYYMMDD[T000000Z]');
					var e_key = moment(event.lastDay).add(1, 'days').format('YYYYMMDD[T235959Z]');
					_self.getUserEventBySide(s_key, e_key, null, inst);
				},
				onPageLoaded: function(event, inst) {
					// 여러번 호출되는 현상 방지
					var call_start = moment(event.firstDay).format();
					if (_self.side_loaded_view == call_start) {
						return;
					}
					
					var $sun = $('#side_cal div[aria-label*="Sunday"]');
					var $sat = $('#side_cal div[aria-label*="Saturday"]');
					$sun.find('.mbsc-calendar-day-text').addClass('sunday');
					$sat.find('.mbsc-calendar-day-text').addClass('saturday');
					$sun.find('.mbsc-calendar-cell-inner').addClass('sunday-cell');
					$sat.find('.mbsc-calendar-cell-inner').addClass('saturday-cell');
					
					_self.side_loaded_view = call_start;
					
					_self.displayHoliday();
				},
				renderLabel: function(data){
					var cls = (data.original.type == 'private' ? 'event-private' : 'event-work');
					
					var pri_cls = 'priority_';
					if (data.original.priority) {
						pri_cls += data.original.priority;
					} else {
						pri_cls += '3';
					}
					
					if (window.userlang == 'ko') {
						data.start = data.start.replace(/^AM/g, '오전');
						data.start = data.start.replace(/^PM/g, '오후');
					}

					var _title = '';
					if (_self.getMainType() == '2') {
						_title = (data.start ? '<span>' + data.start + '</span> ' + data.title : data.title);
					} else {
						_title = data.title;
					}
					
					var html = 
						'<div class="mbsc-calendar-label-background ' + cls + '"></div>' +
						'<div class="main-cal-event ' + pri_cls + '">' +
						'	<span class="marker"></span>' +
						'	<span class="event-text' + (data.original.completed == 'T' ? ' complete' : '') + '">' + _title + '</span>' +
						'</div>';
					
					return html;
				},
				
				renderDay: function(day){
					var date = day.date;
				    var formatDate = mobiscroll.util.datetime.formatDate;
				    var tmp = moment(day.date).format('YYYYMMDD');
				    var now = moment().format('YYYYMMDD');
				    var today_cls = '';
				    
				    // 오늘인 경우
				    //if ('20230430' == tmp) {
				    if (now == tmp) {
				    	today_cls = ' mbsc-calendar-today';
				    }
					
				    var html =
				    	'<div class="main-day-wrap' + today_cls + '" data-date="' + tmp + '">' +
				    	'	<div class="mbsc-calendar-cell-text mbsc-calendar-day-text mbsc-ios">'+ formatDate('D', date) +'</div>' +
				    	'	<div class="main-holi-wrap">' +
				    	'		<div class="main-holi"></div>' +
				    	'		<div class="maincal_status_' + tmp + ' main-cal-status biz_check"></div>' +
				    	'	</div>' +
				    	'	<div class="side-cal-info">' +
				    	'		<div class="info work"></div>' +
				    	'		<div class="info private"></div>' +
				    	'	</div>' +
				    	'</div>';
				    	
				    return html;
				},
				
				onCellClic: function(event, inst){
					//console.log('=========> onCellClick');
				},
				
				onSelectedDateChange: function(event, inst){
					var dt = moment(event.date).format('YYYY-MM-DD');
					var events = inst._eventMap[dt];
					_self.showDayLayer(dt, events);
				},
				
				
				dateFormat: 'YYYY/MM/DD',
				timeFormat: window.userlang == 'ko' ? 'A h:mm' : 'h:mm A',
				onEventCreate: function(args, inst){
					var s_dt = moment(args.event.start).format('YYYY-MM-DD');
					var e_dt = moment(args.event.end).format('YYYY-MM-DD');
					
					// 더블클릭해서 들어올 때, 날짜를 더블클릭하면 하루전으로 들어오는 현상있음 예외처리
					var sel_dt = moment(inst._selected).format('YYYY-MM-DD');
					if (s_dt == e_dt) {
						// 기간 일정이 아니면 현재 선택된 날짜로 넣어주기
						s_dt = sel_dt;
						e_dt = sel_dt;
					}
	        		_self.showRegLayer(s_dt, e_dt);
	        		return false;
	        	}
			}).mobiscroll('getInst');
			
			
			if (window.userlang == 'ko'){
				this.sidecal.setOptions({                            
					monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월', ],
					monthNamesShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
					yearSuffix: '년',
					todayText: '오늘'
				});
			}
		}
	},
	
	"getUserEventBySide" : function(s_key, e_key, pass_status, inst){
		var _self = this;
				
		// 사용자에 따라 mailfile을 계산해줘야 함
		var mf = this.getUserMailPath();
		
		// 등록되고 체크된 전체 사용자의 데이터를 가져옴
		var url = '/' + mf + '/CustomEventList?ReadViewEntries&count=9999&StartKey=' + s_key + '&UntilKey=' + e_key + '&KeyType=time&outputformat=json';
		
		_self.setSideCalEvent(url, inst);

		if (!pass_status) {
			if (_self.side_req_status) {
				_self.side_req_status.abort();
			}
			_self.side_req_status = _self.setUserStatus(s_key, e_key, 'side');
		}
	},
	
	"setSideCalEvent" : function(url, inst){
		var is_my_event = mailfile == this.getUserMailPath();
		var _self = this;
		$.ajax({
			url: url,
			success: function(res){
				var dupl_doc = {};	//중복체크
				var evt_list = {};	// {20220518:{"work":1, "}}
				var events = [];
				var side_events = {};
				
				$.each(res.viewentry, function(idx, val){
					
					var evt = _self.getEventJson(val);
					if (!evt) return true;
					
					// 초대 양식은 표시 안함
					if (evt.type == 'Notice') return true;
									
					// 중복 여부 체크 : 중복이 존재하는 경우
					// 1. 반복 문서
					// 2. 하루이상 기간 문서
					if (dupl_doc[evt.id]) {
						if (evt.type.indexOf('Repeat') == -1) {
							return true;
						}
					} else {
						dupl_doc[evt.id] = true;
					}
					
					// 다른 사람의 비공개 일정은 카운트하면 안됨
					if (!is_my_event && evt.ShowPS == "1") {
						return true;
					}
					
					if (!evt.start || !evt.end) {
						return true;
					}
					
					var ck_start = moment(evt.start);
					var ck_end = moment(evt.end);
					var limit_cnt = 45; // 최대 45개까지 카운트 (1개월 달력에 표시가능한 개수만큼만 체크)
					var ck_cnt = 0;
					while (ck_start.format("YYYYMMDD") <= ck_end.format("YYYYMMDD")) {
						ck_cnt++;
						if (ck_cnt >= limit_cnt) break;
						
						// 날짜 중복 체크 (이벤트가 여러개여도 마킹을 하나만 하기 위해 날짜 중복 체크)
						ck_date = ck_start.format("YYYYMMDD");
						_self.addEventCount(evt_list, ck_date, evt);
						
						
						// 상태 셋팅  (5:출장, 7:교육, 10:휴무)
						if (evt.apt_cate == '5') { // 출장
							_self.checkStatus(ck_date, '7', 'side');
						} else if (evt.apt_cate == '7') { // 교육
							_self.checkStatus(ck_date, '8', 'side');
						} else if (evt.apt_cate == '10' && evt.system_code != 'task') { // 휴무 (d)
							_self.checkStatus(ck_date, '10', 'side');
						}

						
						// 사이드에 이벤트 점 찍기 위해 임시로 만든 배열						
						var ev_ky = moment(ck_start).format('YYYYMMDD');
						var ev_ty = _self.getEventType(evt);
						if (!side_events[ev_ky]) {
							side_events[ev_ky] = {};
						}
						side_events[ev_ky][ev_ty] = 'T';
						

						ck_start.add(1, "days");
					}
					

					
					
					
					
					evt.type = _self.getEventType(evt);
					events.push(evt);
				});
				
				
				//_self.sidecal.setEvents(_self.makeEventList(evt_list));
				inst.setEvents(events);
				

				setTimeout(function(){
					// 캘린더 하단에 하루 일정 표시
					var dt = moment(inst._selected).format('YYYY-MM-DD');
					var day_events = inst._eventMap[dt];
					_self.showDayLayer(dt, day_events);					
				}, 100);
				
				
				// 이벤트가 있는 날짜에 점찍어주기
				_self.drawSideCalEvent(side_events);
				
				
				
				_
				/*
				// 만약에 내 일정을 보는 경우 공유 캘린더와 구독 캘린더 정보 가져오기
				if (is_my_event) {
					// 캘린더 로딩이 완료되어야 처리 가능
					_self.cal_load_complete.then(function(){
						_self.checkEtcCalendar();
					});
				} else {
					_self.gotoScrollToday();
				}
				*/
			},
			error: function(){
				_self.sidecal.setEvents([]);
			}
		});
	},
	
	"drawSideCalEvent" : function(events){
		var _self = this;
		var $cal = $('#side_cal');
		$cal.find('.side-cal-info').removeClass('has-work has-private');

		$.each(events, function(key, val){			
			var $cell = $cal.find('.main-day-wrap[data-date=' + key + ']');

			if (val['work'] == 'T') {
				$cell.find('.side-cal-info').addClass('has-work');
			} 
			if (val['private'] == 'T') {
				$cell.find('.side-cal-info').addClass('has-private');
			}
			
			
		});
	},
	
	"showDayLayer" : function(dt, events){
		// 사이드 캘린더에서 일정 목록 뿌려주는 함수
		
		var _self = this;
		//if (this.show_day == dt) return;
		this.show_day = dt;
		var check_dt = moment(dt).format("YYYYMMDD");
		//var stat_key = this.res_status[check_dt];
		var stat_key = null;
		var holi_text = '';
		var not_holi = '';
		var day = '';
		
		
		// 휴일 처리
		var $check_el = $('#side_cal .maincal_status_' + check_dt).eq(0).parent().find('.main-holi');
		holi_text = $check_el.text();		
		if ($check_el.closest('.holiday-line').hasClass('not-holi')) {
			not_holi = 'T';
		}

		
		var title = (gap.curLang == 'ko' ? moment(dt).format("M월 D일 dddd") : moment(dt).format("M.D dddd"));
		
		
		var $work_list = $('<ul class="event-list"></ul>');
		var $private_list = $('<ul class="event-list"></ul>');
		
		$('#day_event_layer').remove();
		var html =
			'<div id="day_event_layer" class="day-layer">' +
			'	<div class="layer-inner">' +
			'		<div class="day-layer-title"><div class="day-layer-status status"></div><span>' + title + '</span></div>' +
			'		<div class="holiday-text"></div>' +
			'		<div class="day-layer-content">' +
			'			<div class="event-content-wrap content-work-wrap">' +
			'				<div class="event-title">' + gap.lang.work_schedule + '<span id="cnt_work" class="event-cnt"></span></div>' +
			'				<ul id="list_work" class="event-list"></ul>' +
			'			</div>' +
			'			<div class="event-content-wrap content-private-wrap">' +
			'				<div class="event-title">' + gap.lang.private_schedule + '<span id="cnt_private" class="event-cnt"></span></div>' +
			'				<ul id="list_private" class="event-list"></ul>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		var $layer = $(html);
		$('#side_list').append($layer);
		
		
		
		if (moment(dt).days() == 6) {
			$layer.find('.day-layer-title').addClass('saturday');
		}
		if (moment(dt).days() == 0) {
			$layer.find('.day-layer-title').addClass('sunday');
		}
		
		// 달력에 표시된 상태 데이터가 있으면 표시
		var stat_key = $('#side_cal .maincal_status_' + check_dt).closest('.mbsc-calendar-day-inner').data('type');
		if (stat_key) {
			var vaca_txt = gOrg.userDayText(stat_key);
			$('#day_event_layer .status').text(vaca_txt).addClass('biz_check day_' + stat_key);
		} 
		
		if (holi_text) {
			if (not_holi == 'T') {
				$layer.find('.day-layer-title').addClass('not-holi');
				$layer.find('.holiday-text').addClass('not-holi');
			} else {
				$layer.find('.day-layer-title').addClass('holiday');				
			}
			
			var el_txt = $layer.find('.holiday-text').text();
			if (el_txt.indexOf(holi_text) == -1) {
				$layer.find('.holiday-text').text(holi_text);				
			}
		}
		
		
		var cnt_work = 0;
		var cnt_private = 0;
		
		_self.eventSort(events);
		$.each(events, function(){
			var _ty = _self.getEventType(this);
			if (_ty == 'work') {
				cnt_work++;
			} else if (_ty == 'private') {
				cnt_private++;
			} else {
				// 상태값인 경우
				// $('.day-layer-status').text(this.title).show();
			}
			
			_self.sideEventTemplate(_ty, this);
		});

		$('#cnt_work').text(cnt_work + (gap.curLang == 'ko' ? '' : ' ') + gap.lang.total_attach_count_txt);
		$('#cnt_private').text(cnt_private + ' ' + gap.lang.total_attach_count_txt);
		
		if (cnt_work == 0) {
			$layer.find('.content-work-wrap').hide();
		}
		if (cnt_private == 0) {
			$layer.find('.content-private-wrap').hide();
		}
		
		// 표시할 데이터가 없는 경우
		if (cnt_work == 0 && cnt_private == 0) {
			var empty_html = 
				'<div class="no-data"><div class="bg-img"></div><span>' + gap.lang.nothing_schedule + '</span></div>';
			$('#day_event_layer .day-layer-content').append(empty_html);
		}
		
		
		this.dayLayerEvent();
		
	},
	
	"sideEventTemplate" : function(ty, event){
		var _self = this;
		var today = moment();
		var disp_dt = '';
		var is_own = $('#side_own_cal .user').hasClass('on');
		
		// 현재 보고 있는 날짜를 셋해줘야 함
		var dt = moment(this.show_day);
		if (event.allday) {
			if (dt.format('YYYYMMDD') != moment(event.start).format('YYYYMMDD') ||
				dt.format('YYYYMMDD') != moment(event.end).format('YYYYMMDD')) {
				disp_dt = moment(event.start).format('M.D[(]ddd[)]') + ' ~ ' + moment(event.end).format('M.D[(]ddd[)]') + ' ' + gap.lang.allday;
			} else {
				//disp_dt = 'All day';
				disp_dt = moment(event.start).format('M.D[(]ddd[)]') + ' ' + gap.lang.allday;
			}
		} else {
			if (dt.format('YYYYMMDD') != moment(event.start).format('YYYYMMDD') ||
				dt.format('YYYYMMDD') != moment(event.end).format('YYYYMMDD')) {
				disp_dt = moment(event.start).format('M.D H:mm') + ' ~ ' + moment(event.end).format('M.D H:mm');
			} else {
				disp_dt = moment(event.start).format('H:mm') + ' ~ ' + moment(event.end).format('H:mm');
			}
		}
		
		var priority = '';
		if (event.priority == '1') {
			priority = '<span class="priority first"></span>';
		} else if (event.priority == '2') {
			priority = '<span class="priority second"></span>';
		} else if (event.priority == '3') {
			priority = '<span class="priority third"></span>';
		} else if (event.priority == '4') {
			priority = '<span class="priority fourth"></span>';
		} else {
			// 기본값은 3순위
			priority = '<span class="priority third"></span>';
		}
		
		
		var is_meeting = false;
		// 화상회의 구분코드
		if ( event.system_code == 'vc') {
			is_meeting = true;
		}
		// 일정에서 화상회의 잡은 경우
		if (event.system_code == '' && event.system_key != '' && event.system_key.indexOf('RESVE') == -1) {
			is_meeting = true;
		}
		
		// 화상참여 버튼
		var btn_online = '';
		if (is_own && is_meeting) {
			var mt_check = _self.onlineTimeCheck(event);
			btn_online = '<button type="button" class="btn-meeting-online' + (mt_check != 'ok' ? ' disabled' : '') + '" data-key="' + event.system_key + '">' + gap.lang.mt_online_enter + '</button>';
		}
		
		// 취합응답 버튼
		var btn_reply = '';
		if (is_own && event.system_code == 'collection') {
			// 주최자는 표시하면 안되지만, 주최자가 담당자에 포함된 경우는 표시해야 함
			var chair = new NotesName(event.chair_notesid);
			if (chair.orgUnit1 == gap.userinfo.rinfo.ky) {
				// 접속한 사용자가 요청자인 경우 담당자가 포함되어 있으면 버튼 표시
				if (event.is_collection_chair == 'Y') {
					btn_reply = '<button type="button" class="btn-reply" data-key="' + event.system_key + '">' + gap.lang.collect_reply + '</button>';					
				}
			} else {
				btn_reply = '<button type="button" class="btn-reply" data-key="' + event.system_key + '">' + gap.lang.collect_reply + '</button>';
			}
		}
				
		var sys_code = event.system_code || 'cal';
		
		// 제목에 유형을 추가 (한글은 2글자로 맞춤)
		var sche_type = '';
		var sche_type_cls = 'popup-title-type';
		
		if (event.cal_type == 'share') {
			sche_type = gap.lang.share_header;
			sche_type_cls += ' share';
		} else if (event.cal_type == 'subscribe') {
			sche_type = gap.lang.subscribe_header;
			sche_type_cls += ' subscribe';
		} else if (event.system_code == 'todo' || event.system_code == 'checklist') {
			sche_type = gap.lang.todo;
		} else if (event.system_code == 'task') {
			sche_type = gap.lang.popup_type_task;
		} else if (event.system_code == 'collection') {
			sche_type = gap.lang.popup_type_col;
		} else if (event.system_code == 'mtg') {
			//sche_type = gap.lang.mt_res + ' (' + gap.lang.mt_type_2 + ')';
			sche_type = gap.lang.popup_type_met;
		} else if (event.system_code == 'vc') {
			if (event.location) {				
				//sche_type = gap.lang.mt_res + ' (' + gap.lang.mt_type_1 + ')';
				sche_type = gap.lang.popup_type_met;
			} else {
				//sche_type = gap.lang.mt_res + ' (' + gap.lang.mt_type_3 + ')';
				sche_type = gap.lang.popup_type_met;
			}
		} else {
			sche_type = gap.lang.popup_type_cal;
		}
		
		sche_type = '<span class="' + sche_type_cls + '">' + sche_type + '</span>';
		
		
		
		
		var html = 
		'<li' + (event.completed == 'T' ? ' class="complete"' : '') + ' data-type="' + sys_code + '">' +
		/*
		'<div class="check-wrap">' +
		'	<div class="check"><span></span><span></span></div>' +
		'</div>' +
		*/
		'	<div class="event">' + priority +
		'		<div class="subject-wrap">' +
		'			<div class="subject" title="' + event.title + '">' + sche_type + ' ' + event.title + '</div>' +
		'			<span class="date">' + disp_dt + '</span>' +
		'		</div>' + btn_reply + btn_online +
		(is_own ? '<div class="system-code ' + sys_code + '"></div>' : '') +
		'	</div>' +
		'</li>';
		
		var $li = $(html);
		$li.data('info', event);
		$('#list_' + ty).append($li);
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
	
	"dayLayerEvent" : function(){ 
		var _self = this;
		
		var $layer = $('#day_event_layer');
		
		// 화상 참여
		$layer.find('.btn-meeting-online').on('click', function(){
			var _info = $(this).closest('li').data('info');
			var check = _self.onlineTimeCheck(_info);
			if (check == 'before') {
				// 15분전에만 입장 가능
				mobiscroll.toast({message:gap.lang.meeting_time_limit, color:'danger'});
				return false;
			} else if (check == 'over') {
				// 종료시간 지난 경우 입장 불가
				mobiscroll.toast({message:gap.lang.mt_over_time, color:'danger'});
				return false;
			}
			
			// 미팅 URL을 뽑아화야 함
			var meeting_key = $(this).data('key') + "";
			var detail_def = gMet.getOnlineDetail(meeting_key);
			detail_def.then(function(res){
				if (res.error) {
					mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
					return false;
				}
				
				// 화상회의 페이지 연결
				window.open(res.meetingurl);
			}, function(){
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
			});
			return false;
		});
		
		// 취합 응답
		$layer.find('.btn-reply').on('click', function(){
			var data = $(this).closest('li').data('info');
			gCol.directCollectDetailView(data.system_key);
			return false;
		});
		
		// 각 메뉴를 클릭하면 미리보기 레이어가 표시되어야 함
		$layer.find('li').on('click', function(){
			var obj = {
				event: $(this).data('info'),
				source: 'side',
				target: $(this)
			};
			
			_self.showEventPreview(obj, 'side');
		});
	},	
	
	"getMainLayoutType" : function(){
		return $('input[name="main_lay_type"]:checked').val();
	},
	"setMainLayoutType" : function(type){
		var $radio = $('[name="main_lay_type"][value="' + type + '"]');
		$radio.prop('checked', true).click();
	},
	
	"showMainSettingManual" : function(){
		var _self = this;
		
		localStorage.setItem('saw_main_help_real', 'T');
		
		var html = 
			'<div class="main-set-manual-ly">' +
			'	<div class="main-set-manual-tit">' + gap.lang.main_config_help_title + '</div>' +
			'	<div class="owl-carousel">' +
			'		<div class="manual-item manual-1"></div>' +
			'		<div class="manual-item manual-2"></div>' +
			'	</div>' +
			'</div>';
		
		var $layer = $(html);
		$('body').append($layer);
		
		if (gap.userinfo.userLang != 'ko'){
			$layer.addClass('en');
		}
		
		gap.showBlock();
		$('#blockui').addClass('hide-lnb dark');
		
		var inx = parseInt(gap.maxZindex()) + 1;
		gsap.set('.main-set-manual-ly', {
			'opacity': 0,
			'y': 300,
			'z-index': inx
		});
		
		
		
				
		// 이벤트 처리
		var $btn_close = $('<div class="btn-close manual"><span></span><span></span></div>');
		$btn_close.on('click', function(){
			/*
			// 한번이라도 닫으면 다음부터 표시 안되도록 처리
			gsap.to('.main-set-manual-ly', {
				x: -500,
				opacity: 0,
				duration: 0.3,
				onComplete: function(){
					$layer.remove();
					gap.hideBlock();
					_self.showPortletLayer();
				}
				
			});
			*/
			
			$layer.remove();
			gap.hideBlock();
			_self.showPortletLayer();
			
			$btn_close.remove();
			$('#blockui').removeClass('hide-lnb dark');
		});
		$('body').append($btn_close);

		inx = parseInt(gap.maxZindex()) + 1;
		$btn_close.css('z-index', inx);
		gsap.set('.btn-close.manual', {autoAlpha:0, y:100});
		
	
		
		// 도움말 캐러셀 처리
		$layer.find('.owl-carousel').owlCarousel({
			items: 1,
			nav: true,
			navText: ['<span></span><span></span>', '<span></span><span></span>'],
			dots: true,
			mouseDrag: false,
			slideBy: 1,
			onInitialized: function(){
				//레이어 표시
				gsap.to('.main-set-manual-ly', {opacity:1, y:0, delay:1});	
			},
			onTranslated: function(){
				//페이지를 모두 보면 닫는 버튼 표시
				if ($layer.data('init_btn') != 'T') {
					$layer.data('init_btn', 'T');
					gsap.to('.btn-close.manual', {autoAlpha:1, y:0, duration:0.2});
				}
			}
		});

	},
	
	"replyChatBottom" : function(obj, type){
		var _self = this;
		
		/*
		 * obj.imgurl : 이미지 URL
		 * obj.title : 김윤기님에게 답장
		 * obj.msg : 메세지 내용
		 * 
		 * type : alarm에서 호출했는지 여부
		 */
		
		if (type == 'alarm') {
			var $chat_box = $('#alarm_chat .bot');
		} else {
			var $chat_box = $('#chat_content .chat-bottom');
		}
		
		// DOM 삭제
		$chat_box.find('.reply-chat-wrap').remove();
				
		var html =
			'<div class="reply-chat-wrap">' +
			'	<div class="reply-chat-inner">' +
			'		<div class="cont-wrap">' +
			'			<div class="tit">' + obj.title + '</div>' +
			'			<div class="cont">' + obj.dis_msg + '</div>' +
			'		</div>' +
			'		<div class="btn-wrap">' +
			'			<div class="btn-close">' +
			'				<span></span>' +
			'				<span></span>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'</div>';		
		var $wrap = $(html);
		$chat_box.append($wrap);

		// 이미지url이 있는 경우 이미지 표시
		if (obj.imgurl) {
			var $img = $('<div class="img-wrap"></div>');
			$img.css('background-image', 'url(' + obj.imgurl + ')');
			$wrap.find('.reply-chat-inner').prepend($img);
		}


		$chat_box.addClass('show-reply');
		
		/*
		 * 이벤트 처리
		 */
		$chat_box.find('textarea').focus();
		$chat_box.find('textarea').attr('placeholder', gap.lang.replymsg);
		
		// 답장 취소
		$wrap.find('.btn-close').on('click', function(){
			_self.replyChatBottomHide(type);
		});
	},
	
	"replyChatBottomHide" : function(type){
		
		if (type == 'alarm') {
			var $chat_box = $('#alarm_chat .bot');
		} else {
			var $chat_box = $('#chat_content .chat-bottom');
		}
		
		$chat_box.removeClass('show-reply');
		
		$chat_box.find('.reply-chat-wrap').remove();
		$chat_box.find('textarea').attr('placeholder', gap.lang.input_message);
	},
	
	"noticeWrite" : function(data){
		gHome.delete_file_list = [];
		
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
		this.noticeAddFile_already(gHome.notice_data.data.info);
		
				
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
	
	"real_upload_process" : function(){
		
		gHome.isTempSave = "F";
		
		
		var drop_file_count = myDropzone_notice.files.length;			
		myDropzone_notice.title = $("#notice_title").val();
		var html = $("#notice_editor").get(0).contentWindow._form.keditor.getBodyValue();
		myDropzone_notice.editor_body = html;
		
		
		if (drop_file_count > 0){				
			
			var exist_files = $("#notice_file_list_editor_edit li").length;
			if (exist_files > 0){
				gHome.edit_editor = "T";
				//gHome.isTempSave = "T";
			}
			
			//원본 문서에서 파일을 삭제하는 경우 삭제된 파일을 먼저 정리한다.
			if (gHome.delete_file_list.length > 0){
				gHome.sub_file_delete_send_server();
			}else{
				myDropzone_notice.processQueue();
			}				
		}else{
			//기존 에디터 문서를 편집하는 경우 기존에 파일이 있는 경우가 있을 수 있다.			
			
			
			var exist_files = $("#notice_file_list_editor_edit li").length;
			if (exist_files > 0){
				gHome.edit_editor = "T";
				//gHome.isTempSave = "T";
			}
			
			if (gHome.edit_editor == "T"){					
				//원본 문서에 첨부가 있는 경우 편집해서 특정 파일을 삭제한 경우 해당 파일을 먼저 삭제하고 진행해야 한다.
				if (gHome.delete_file_list.length > 0){
					gHome.sub_file_delete_send_server2(html);
				}else{
					var type = "";
					if (typeof(gHome.select_doc_info.info) != "undefined"){
						var original_doc_filecount = gHome.select_doc_info.info.length;
						var cur_editor_delete_filecount = gHome.delete_file_list.length;
												
						if (original_doc_filecount != cur_editor_delete_filecount){
							//파일 업로드 형식으로 처리한다... 파일이 하나라도 남아있다는 이야기다
							type = "file";
						}else{
							type = "msg";
						}
					}else{
						type = "msg";
					}						
					
					//기존 파일을 모두 삭제한경우 일반 메시지 처럼 저장한다.
					var data = {
						"type" : type,
						"channel_code" : gBody.select_channel_code,
						"channel_name" : gBody.select_channel_name,
						"email" : gap.userinfo.rinfo.em,
						"ky" : gap.userinfo.rinfo.ky,
						"owner" : gap.userinfo.rinfo,
						"content" : "",
						"editor" : html,
						"title" : myDropzone_notice.title
//						"id" : gBody3.select_channel_id,
//						"msg_edit" : gHome.edit_mode,
//						"edit" : gHome.edit_editor							
					};					
//					gBody3.send_msg_to_server(data);
//					$("#editor_close").click();						
//					gap.scroll_move_to_bottom_time("channel_list", 200);
					//공지사항 제목, 본문 내용만 업데이트 하는 경우
					gBody.reg_notice_update(data, "editor");			
				}					
			}else{
				//기존에도 파일이 없는 경우
			
				if (gHome.delete_file_list.length > 0){
					gHome.sub_file_delete_send_server2(html);
				}else{
					var type = "";
					var ty = "";
					if (typeof(gHome.select_doc_info.info) != "undefined"){
						var original_doc_filecount = gHome.select_doc_info.info.length;
						var cur_editor_delete_filecount = gHome.delete_file_list.length;												
						if (original_doc_filecount != cur_editor_delete_filecount){
							//파일 업로드 형식으로 처리한다... 파일이 하나라도 남아있다는 이야기다
							type = "file";
						}else{
							type = "msg";
						}
					}else if (myDropzone_notice.save_type == "notice"){
						ty = "notice";
						type = "msg";
					}else{
						type = "msg";
					}			
					
					var datx = {
							"type" : type,
							"ty" : ty,
							"channel_code" : gBody.select_channel_code,
							"channel_name" : gBody.select_channel_name,
							"email" : gap.userinfo.rinfo.em,
							"ky" : gap.userinfo.rinfo.ky,
							"owner" : gap.userinfo.rinfo,
							"content" : "",
							"editor" : html,
							"title" : myDropzone_notice.title,
							"msg" : ""
//							"id" : gBody3.select_channel_id,
//							"msg_edit" : gBody3.edit_mode,
//							"edit" : gBody3.edit_editor
					}
					
					if (type == "file"){
						datx.info = gHome.select_doc_info.info;
						datx.upload_path = gHome.select_doc_info.upload_path;
					}
					
//					var data = JSON.stringify(datx);				
//					gBody3.send_msg_to_server(data);
//					$("#editor_close").click();					
//					gap.scroll_move_to_bottom_time("channel_list", 200);
					
				//	gBody.reg_notice(datx, "editor", "");		
					gBody.reg_notice_update(datx, "editor");
				}			
			}	
			
			var info = $('#notice_ly').data('info');
			if (info) {
				if (info.callfrom == 'quick_chat') {
					gap.read_notice(gma.cur_cid_popup);
				} else {
					gap.read_notice(gBody.cur_cid);
				}
			}
			
		//	$("#btn_notice_close").click();
		}	
	},
	
	
	"sub_file_delete_send_server" : function(){
		
		//gBody3.delete_file_list 배열안에 있는 md5값을 과 gBody3.select_channel_id 값을 활용해서 저장된 파일을 삭제합니다.
		var data = JSON.stringify({
			"id" : gHome.notice_data._id.$oid,
			"md5" : gHome.delete_file_list
		});			
		url = gap.channelserver + "/delete_sub_file_list_notice.km";
		$.ajax({
			type : "POST",
			dataType : "json",
			url : url,
			data : data,
			success : function (res){
				if (res.result == "OK"){
										
					myDropzone_notice.processQueue();
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
		
	},
	
	"sub_file_delete_send_server2" : function(html){
		
		//gBody3.delete_file_list 배열안에 있는 md5값을 과 gBody3.select_channel_id 값을 활용해서 저장된 파일을 삭제합니다.
		//에디터에서 기존에 파일이 있는 경우에 삭제하는 경우 호출되는 함수
		
		var data = JSON.stringify({
			"id" : gHome.notice_data._id.$oid,
			"md5" : gHome.delete_file_list
		});			
		url = gap.channelserver + "/delete_sub_file_list_notice.km";
		$.ajax({
			type : "POST",
			dataType : "json",
			url : url,
			data : data,
			success : function (res){
				if (res.result == "OK"){
								
					var type = "";
					if (typeof(gHome.select_doc_info.info) != "undefined"){
						var original_doc_filecount = gHome.select_doc_info.info.length;
						var cur_editor_delete_filecount = gHome.delete_file_list.length;
												
						if (original_doc_filecount != cur_editor_delete_filecount){
							//파일 업로드 형식으로 처리한다... 파일이 하나라도 남아있다는 이야기다
							type = "file";
						}else{
							type = "msg";
						}
					}else{
						type = "msg";
					}
					
					

					
					//기존 파일을 모두 삭제한경우 일반 메시지 처럼 저장한다.
					var data = {
						"type" : type,
						"ty" : "notice",
						"channel_code" : gBody.select_channel_code,
						"channel_name" : gBody.select_channel_name,
						"email" : gap.userinfo.rinfo.em,
						"ky" : gap.userinfo.rinfo.ky,
						"owner" : gap.userinfo.rinfo,
						"content" : "",
						"editor" : html,
						"title" : myDropzone_notice.title,
						"id" : "",
						"msg_edit" : "T",
						"edit" : ""
						
					};
					
				//	gBody3.send_msg_to_server(data);
					$("#editor_close").click();
					gBody.reg_notice_update(data, "editor");
					
					
				//	gap.scroll_move_to_bottom_time("channel_list", 200);
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});
		
	},
	
	
	"noticeEditorLoadComplete" : function(adapter){
		var _self = this;
		// 편집인 경우 값을 넣어준다
		//adapter.setHtml('<p>이거 넣어주세요</p>');
		
		
		this.noticeEditorHeight();
		
		// 창 사이즈 변할 때 재계산하기 
		$(window).on('resize.notice', function(){
			setTimeout(function(){
				_self.noticeEditorHeight();
			}, 100);
		});
		
		// 에디터 로딩 완료되면 본문 삽입하기
		
		
		if (this.notice_data) {
			var data = this.notice_data.data;
			var ty = data.ty;
			var body;
			
			if (data.editor) {
				body = gap.textToHtml(data.editor);
				if (data.title) {
					$('#notice_title').val(gap.textToHtml(data.title));
				}
			} else {
				if (ty == 5) {
					// 파일인 경우
				} else if (ty == 6) {
					// 이미지인 경우
				} else {		
					if (data.content) {
						body = '<p>' + data.content.replace(/\r\n|\n/g, '<br/>') + '</p>';
					} else if (data.msg) {
						body = '<p>' + data.msg.replace(/\r\n|\n/g, '<br/>') + '</p>';
					}
				}
			}
			
			if (body) {
				adapter.setHtml(body);				
			}
		}
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
		
		var person_img = gap.person_profile_photo_by_ky2(res.owner.ky);				
		var userinfo = gap.user_check(res.owner);
		var reply_date = gap.convertGMTLocalDateTime(res.GMT);
		var message = gBody3.message_check(res.content);
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
			gap.showUserDetailLayer(ky);
		});
		$li.find('.writer-info').on('click', function(){
			$li.find('.writer-img').click();
		});
		
		// 삭제버튼
		$li.find('.reply-remove').on('click', function(){
			var rinfo = $(this).data('info');
			gBody2.removeNoticeReply(rinfo);
		});
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
			gBody2.removeNotice(docid, info.callfrom);
		});
		
		// 닫기
		$layer.find('.btn-close').on('click', function(){
			$layer.remove();
			gap.hideBlock();
		});
		
		// 작성자 프로필
		$layer.find('.owner-info .writer-img').on('click', function(){
			var ky = $(this).find('img').data('key');
			gap.showUserDetailLayer(ky);
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
				
			gBody2.saveNoticeReply();
		});
		
	},
	
	"noticeEditorHeight" : function(height){
		var _h = parseInt($('#notice_editor').outerHeight()) - 8;
		if (height) {
			_h = height;
		}
		
		$('#notice_editor').get(0).contentWindow._form.keditor.setHeight(_h);
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
				gBody2.hideNoticeWork();
				gBody2.drawNoticeWork(gBody3.cur_opt);
				
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
	}
	
}






























