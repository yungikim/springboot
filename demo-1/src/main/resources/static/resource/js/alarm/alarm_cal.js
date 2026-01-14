function gAlarmCal() {
	this.is_init = false;
	this.alarm_done_list = [];
	this.check_interval;
}

gAlarmCal.prototype = {
	"init" : function(){
		if (is_mobile){
			// 모바일은 실행하지 않음
			return;
		}
		if (gAct.env_data.sch == "Y"){
			try{
				clearInterval(gAcal.check_interval);
			}catch(e){}
			gAcal.alarm_done_list = [];
			gAcal.check_today_cal();
			gAcal.check_interval = setInterval(gAcal.check_today_cal, 300000);	// 5분마다 실행
		}
	},
	
	"check_today_cal" : function(){
		var _self = this;
		var dt = moment();
		
		console.log("======================================================")
		console.log("일정 10분전 알림 체크 - 시작 >>>>>", dt.format('YYYY-MM-DD HH:mm'))
		
		function _eventTemplate(event) {
			// 제목에 유형을 추가 (한글은 2글자로 맞춤)
			if (event.cal_type == 'share') {
			} else if (event.cal_type == 'subscribe') {
			} else if (event.system_code == 'todo' || event.system_code == 'checklist') {
		//	} else if (event.system_code == 'task') {	// task 제외 - 2025.03.13
			} else if (event.system_code == 'collection') {
		//	} else if (event.system_code == 'mtg') {	// mtg 제외 - 2025.03.17
		//	} else if (event.system_code == 'vc') {		// vc 제외 - 2025.03.17
			} else {
				// 종일일정이 아닌 일정만 처리
				if (!event.allday){
				//	var _now = moment();
				//	var _start = moment(event.start);
					var t1 = moment(event.start).utc().local().format('YYYY-MM-DD HH:mm');
					var t2 = moment(); 
					var dif = moment.duration(t2.diff(t1)).asMinutes();
					console.log("dif >>>", dif);
					// 10분(600,000ms) 이내인지 확인
					if (dif >= -10 && dif <= 0){
					    console.log("event >>>", event);
					    console.log("두 시간은 10분 이내입니다.");
					    
					    if (gAcal.isValueInArray(event.id, gAcal.alarm_done_list)){
					    	// 이미 알림이 실행된 일정이면 중지
					    	console.log("이미 실생된 일정입니다. !!!");
					    	return;
					    	
					    }else{
					    	console.log("처음 실행되는 일정입니다. !!!");
						    gAcal.alarm_done_list.push(event.id);					    	
					    }
					    
					    var url = gap.rp + "/noti/alarm/send";
						var s = new Object();
						var r = new Object();
						var r_ky = [];
						r_ky.push(gap.userinfo.rinfo.ky);
						
						s.nm = gap.lang.sch_reminder;
						r.ky = r_ky;  //Array
						var data = JSON.stringify({
							"nid" : "calendar",
							"s" : s,
							"r" : r,
							"msg" : event.title,
							"cmd" : "schedule",
							"link" : "-=server-host=-/" + mailfile_prefix + "/cal/calendar.nsf/main?open&unid=" + event.id + "&ThisStartDate=" + moment(event.start).utc().local().format('YYYY-MM-DD') + "&callfrom=boxmain",
							"push" : {
								"tle" : gap.lang.sch_reminder
							}
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
					}
				}
			}
		}			
		
		var promises = [];
		promises.push(gAcal.getDayEvent(dt));
		
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
			
			// 정렬
			gAcal.eventSort(events);
			
			$.each(events, function(){
				_eventTemplate(this);
			});			
		});
	},
	
	"setTodayWorkCount" : function(code){
		var _self = this;
		var dt = moment();
		var promises = [];
		promises.push(gAcal.getDayEvent(dt));
		
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
			
			// 카운트 표시
			var count = events.length;
			$("#unprocessed_count_" + code).html(count);
			
			gAct.show_unprocessed_sys(count, code);
			
			/*if (count > 0){
				gAct.show_unprocessed_sys(code);
			}*/
			
		});
	},	
	
	"isValueInArray" : function(value, array){
		return $.inArray(value, array) !== -1;
	},
	
	"getDayEvent" : function(dt, etc_info){
		var _self = this;
		var sel_day = moment(dt).format('YYYYMMDD');
		var s_key = moment(sel_day + 'T000000').add(-1, 'days').utc().format('YYYYMMDDTHHmmss[Z]'); // 로컬타임존에서 -1일 한 후 UTC로 변환
		var e_key = moment(sel_day + 'T235959').add(1, 'days').utc().format('YYYYMMDDTHHmmss[Z]'); // 로컬타임존에서 +1일 한 후 UTC로 변환
		
		
		var is_my_event = true;
		
		var url = gap.rp + '/' + window.mailfile + '/CustomEventList?ReadViewEntries&count=9999&StartKey=' + s_key + '&UntilKey=' + e_key + '&KeyType=time&outputformat=json';
		return $.ajax({
			url: url
		}).then(function(res){
			var evt_list = [];
			var dupl_doc = {};	//중복체크
			
			if (res.viewentry) {
				$.each(res.viewentry, function(idx, val){
					var evt = gAcal.getEventJson(val);
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
		data.start 			= gAcal.getValueByName(val, '$144');
		data.start 			= (data.start == '' ? gAcal.getValueByName(val, '$134') : data.start);

		data.date_type 		= gAcal.getValueByName(val, '_DateType');
		data.date_type 		= data.date_type == undefined || data.date_type == "undefined" ? "" : data.date_type;
		
		var _allday	 		= gAcal.getValueByName(val, '_AllDay');
		data.allday			= data.apt_type == '1' || (data.apt_type == '2' && data.date_type != '2') || _allday == '1' ? true : false;
		
		data.end			= gAcal.getValueByName(val, '$146');
		data.title 			= gAcal.getValueByName(val, '$147').replace(/\[\$NOSUBJECT\$\]/g, gap.lang.no_subject); // TODO(lang)
		
		data.type 			= gAcal.getValueByName(val, '$Type');
		data.apt_type 		= gAcal.getValueByName(val, '$152');
		data.colorinfo 		= gAcal.getValueByName(val, '$Color').split('|');
		data.chair			= gAcal.getValueByName(val, 'Chair_id');
		data.owner			= gAcal.getValueByName(val, 'Owner_id');
		data.attendee		= gAcal.getValueByName(val, '$Custom').split('|')[0];
		data.location		= gAcal.getValueByName(val, '$Custom').split('|')[1];
		data.notice_type	= gAcal.getValueByName(val, '$Custom').split('|')[2];
		data.org_confideltial = gAcal.getValueByName(val, '$154');
		data.ShowPS 		= gAcal.getValueByName(val, '_ShowPS');			
		data.chair_notesid 	= gAcal.getValueByName(val, '_ChairNotesID');
		data.sd				= gAcal.getValueByName(val, '$StartDate');
		data.ed				= gAcal.getValueByName(val, '$EndDate');
		data.apt_cate		= gAcal.getValueByName(val, '_ApptCategory');
		
		
		data.completed		= gAcal.getValueByName(val, '_Completion');
		data.priority		= gAcal.getValueByName(val, '_Priority');
		data.system_code	= gAcal.getValueByName(val, '_SystemCode');
		data.system_key		= gAcal.getValueByName(val, '_SystemKeyCode');
		
		
		data.allDay			= data.allday;
		
		// 변환처리
		//data.title = gap.HtmlToText(data.title);
		
		
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
		
		return data;
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
	}	
}