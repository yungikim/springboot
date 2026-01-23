

function gRegM(){
	this.per_page = "10";
	this.all_page = "1";
	this.start_skp = "";
	this.start_page = "1";
	this.cur_page = "1";
	this.total_page_count = "";
	this.total_data_count = "";
	this.qna_count = 0;
	this.qna_total_count = 0;
	this.aleady_select_user_count = 0;
} 

$(document).ready(function(){

});

gRegM.prototype = {
	"init" : function(){

	},
	
	"showRegLayer" : function(s_dt, e_dt){
		var html =
			'<div class="wrap">' +
			'	<div id="container" class="mu_mobile mo_popup cal" style="padding:0;position:relative;min-height:100vh;">' +
			'		<section class="work" style="height:100vh;">' +
			'			<div id="work_simple_write_layer">' +
			'				<div class="mo_tab_wr">' +
			'					<ul class="flex">' +
			'						<li data-menu="cal" class="on">' + gap.lang.tab_reg_cal + '</li>' +
			'						<li data-menu="work">' + gap.lang.tab_reg_work + '</li>' +
			'					</ul>' +
			'				</div>' +
			'			</div>' +
			'		</section>' +
			'	</div>' +
			'</div>';
		
		var $layer = $(html);
		$('#dis').append($layer);
		
		gRegM.genCalLayer();
		gRegM.genWorkLayer();
		
		// 버튼 등록
		html =
			'<div class="btn_sec b_c">' +
			'	<button id="btn_simple_ok" class="m_confirm on">' + gap.lang.btn_reg + '</button>' +
			'</div>';
		
		var $btn_area = $(html);
		$('#work_simple_write_layer').append($btn_area);
		
		
		gRegM.regEventBind(s_dt, e_dt);
	},
	
	"genCalLayer" : function(){
		var html =
			'<div class="content-cal mo_table_box">' +
			'	<table class="nothover">' +
			'		<tbody>' +
			'			<tr>' +
			'				<th><span>' + gap.lang.ws_title + '</span></th>' +
			'				<td class="sch_place">' +
			'					<div class="input_box">' +
			'						<input type="text" id="cs_title" placeholder="' + gap.lang.placeholder_title + '"/>' +
			'					</div>' +
			'				</td>' +
			'			</tr>' +
			'			<tr>' +
			'				<th style="border-radius: 0 0 10px 10px; "><span>' + gap.lang.mt_th_time + '</span></th>' +
			'				<td class="time">' +
			'					<div class="input-field selectbox">' +
			'						<div class="sch_day_box" style="width: calc(100% + 40%);">' +
			'							<input type="text" id="cs_s_date" class="input day">' +
			'							<button type="button" id="cs_s_date_ico" class=mo_ico></button>' +
			'						</div>' +
	//		'						<div class="t_sel_box">' +
	//		'							<select id="cs_s_time"></select>' +
	//		'						</div>' +
			'						<div class="sch_day_box">' +
			'							<input type="text" id="cs_s_time" class="input day" disabled>' +
			'						</div>' +			
			'					</div>' +
			'					<div class="input-field selectbox selectbox02">' +
			'						<span class="time_mid">~</span>' +
			'						<div class="sch_day_box" style="width: calc(100% + 40%);">' +
			'							<input type="text" id="cs_e_date" class="input day">' +
			'							<button type="button" id="cs_e_date_ico" class=mo_ico></button>' +
			'						</div>' +
	//		'						<div class="t_sel_box">' +
	//		'							<select id="cs_e_time"></select>' +
	//		'						</div>' +
			'						<div class="sch_day_box">' +
			'							<input type="text" id="cs_e_time" class="input day" disabled>' +
			'						</div>' +	
			'					</div>' +
			'					<div class="input-field selectbox c_box">' +
			'						<div id="cs_allday" class="chk_box ico on"></div>' +
			'						<span>' + gap.lang.allday + '</span>' +
			'					</div>' +
			'				</td>' +
			'			</tr>' +
			'			<tr>' +
			'				<th>' + gap.lang.share_user + '</th>' +
			'				<td>' +
			
			'					<div class="search_sec" style="margin: 5px 0 8px 0;">' +
			'						<input type="text" id="cs_attendee" placeholder="' + gap.lang.share_user_ph + '">' +
			'						<button type="button" id="search_user" class="mo_ico ico-org-search">' + gap.lang.search + '</button>'
		
			if (gap.is_show_org(gap.userinfo.rinfo.ky)) {
				html +=	
					'						<button type="button" id="search_org" class="mo_ico ico-org"></button>';				
			}
		
		html +=
			'					</div>' +
			'					<div class="after_select search-result-wrap" style="display:none;margin-bottom:8px;">' +
			'						<ul id="cs_attendee_list" class="search-result-list"></ul>' +
			'					</div>' +			
			'				</td>' +
			'			</tr>' +			
			'			<tr>' +
			'				<th><span>' + gap.lang.ws_type + '</span></th>' +
			'				<td class="sch_place">' +
			'					<div class="input-field selectbox" style="margin-right: 8px;">' +
			'						<select id="cs_type">' +
			'							<option value="" selected>' + gap.lang.ws_type_1 + '</option>' +
			'							<option value="5">' + gap.lang.ws_type_2 + '</option>' +
			'							<option value="7">' + gap.lang.ws_type_3 + '</option>' +
			'							<option value="10">' + gap.lang.ws_type_4 + '</option>' +
			'						</select>' +
			'					</div>' +
			'				</td>' +
			'			</tr>' +			
			'			<tr>' +
			'				<th><span>' + gap.lang.priority + '</span></th>' +
			'				<td class="sch_place">' +
			'					<div class="input-field selectbox" style="margin-right: 8px;">' +
			'						<select id="cs_priority">' +
			'							<option value="1">' + gap.lang.ws_priority_1 + '</option>' +
			'							<option value="2">' + gap.lang.ws_priority_2 + '</option>' +
			'							<option value="3" selected>' + gap.lang.ws_priority_3 + '</option>' +
			'							<option value="4">' + gap.lang.ws_priority_4 + '</option>' +
			'						</select>' +
			'					</div>' +
			'				</td>' +
			'			</tr>' +
			'			<tr >' +
			'				<th><span>' + gap.lang.ws_public + '</span></th>' +
			'				<td>' +
			'					<div class="sch_place" style="height:52px;">' +
			'						<div class="radio-wrap" style="padding-top:10px;">' +
			'							<input type="radio" id="cs_public_y" name="cs_public" value="Y" checked>' +
			'							<label for="cs_public_y">' + gap.lang.disclosure + '</label>' +
			'							<input type="radio" id="cs_public_n" value="N" name="cs_public">' +
			'							<label for="cs_public_n" style="margin-left:15px;">' + gap.lang.nondisclosure + '</label>' +
			'						</div>' +
			'					</div>' +
			'				</td>' +
			'			</tr>' +			
			
			'			<tr class="con_wr">' +
			'				<th><span>' + gap.lang.notice_body + '</span></th>' +
			'				<td class="contents_box">' +
			'					<textarea id="cs_content" placeholder="' + gap.lang.input_content + '"></textarea>' +
			'				</td>' +
			'			</tr>' +
			'		</tbody>' +
			'	</table>' +
			'</div>';
		
		var $content = $(html);
		$('#work_simple_write_layer').append($content);
		$('#cs_type').material_select();
		$('#cs_priority').material_select();
	},
	
	"genWorkLayer" : function(){
		var html =
			'<div class="content-work mo_table_box" style="display:none;">' +
			'	<table class="nothover">' +
			'		<tbody>' +
			'			<tr>' +
			'				<th><span>' + gap.lang.ws_channel + '</span></th>' +
			'				<td class="sch_place">' +
			'					<div class="input-field selectbox" style="margin-right: 8px;">' +
			'						<select id="ws_category"></select>' +
			'					</div>' +
			'				</td>' +
			'			</tr>' +
			'			<tr>' +
			'				<th><span>' + gap.lang.ws_title + '</span></th>' +
			'				<td class="sch_place">' +
			'					<div class="input_box">' +
			'						<input type="text" id="ws_title" placeholder="' + gap.lang.placeholder_title + '"/>' +
			'					</div>' +
			'				</td>' +
			'			</tr>' +
			'			<tr>' +
			'				<th style="border-radius: 0 0 10px 10px; "><span>' + gap.lang.ws_period + '</span></th>' +
			'				<td class="time">' +
			'					<div class="sch_day_box">' +
			'						<input type="text" id="ws_s_date" class="input day">' +
			'						<button type="button" id="ws_s_date_ico" class=mo_ico></button>' +
			'					</div>' +
			'					<span class="time_mid">~</span>' +
			'					<div class="sch_day_box">' +
			'						<input type="text" id="ws_e_date" class="input day">' +
			'						<button type="button" id="ws_e_date_ico" class=mo_ico></button>' +
			'					</div>' +
			'				</td>' +
			'			</tr>' +
			'			<tr>' +
			'				<th><span>' + gap.lang.priority + '</span></th>' +
			'				<td class="sch_place">' +
			'				    <div class="input-field selectbox" style="margin-right: 8px;">' +
			'				        <select id="ws_priority">' +
			'				            <option value="1">' + gap.lang.ws_priority_1 + '</option>' +
			'				            <option value="2">' + gap.lang.ws_priority_2 + '</option>' +
			'				            <option value="3" selected>' + gap.lang.ws_priority_3 + '</option>' +
			'				            <option value="4">' + gap.lang.ws_priority_4 + '</option>' +
			'				        </select>' +
			'				    </div>' +
			'				</td>' +
			'			</tr>' +
			'			<tr>' +
			'				<th><span>' + gap.lang.asign + '</span></th>' +
			'				<td class="sch_place">' +
			'					<div class="input-field selectbox" style="margin-right: 8px;">' +
			'						<select id="ws_asignee"></select>' +
			'					</div>' +
			'				</td>' +
			'			</tr>' +
			'		</tbody>' +
			'	</table>' +
			'</div>';
		
		var $content = $(html);
		$('#work_simple_write_layer').append($content);
		$('#ws_priority').material_select();
	},
	
	"regEventBind" : function(s_dt, e_dt){
		var $layer = $('#work_simple_write_layer');
		
		
		function _getTimeHtml() {
			var html_time = '';
			var now = moment();
			now.set({'hour':0, 'minute':0, 'second':0, 'millisecond':0});
			
			var ckdate = now.clone();
			ckdate.add(1, 'day');
			
			while (now.format() != ckdate.format()) {
				html_time += '<option value="' + now.format('HH:mm') + '">' + now.format('h:mm A') + '</option>';;
				now.add(30, 'minutes');
			}
			return html_time;
		}
		
		function _changeEndDate(event) {
			var diff = $('#cs_s_date').data('diff_hour');
			var s_txt = (event ? event.valueText : $('#cs_s_date').val()) + 'T' + $('#cs_s_time').val();
			
			if (diff > 0) {
				var e_dt = moment(s_txt).add(diff, 'h');
				$('#cs_e_date').val(e_dt.format('YYYY-MM-DD'));
				$('#cs_e_time').val(e_dt.format('HH:mm')).material_select();				
			}
		}
		
		function _checkEndDate(s_val, e_val) {
			if ($('#cs_allday').hasClass('on')) {
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
				var s_date = moment((s_val ? s_val : $('#cs_s_date').val()) + 'T' + moment($('#cs_s_time').mobiscroll('getVal')).format('HH:mm')); 
				var e_date = moment((e_val ? e_val : $('#cs_e_date').val()) + 'T' + moment($('#cs_e_time').mobiscroll('getVal')).format('HH:mm'));
				if (e_date.diff(s_date) <= 0) {
					// 종료일을 시작일보다 이전으로 설정하는 경우
					$('#cs_e_date').addClass('invalid');
					$('#cs_e_time').addClass('invalid');
				} else {
					$('#cs_e_date').removeClass('invalid');
					$('#cs_e_time').removeClass('invalid');
				}
			}
		}
		
		// 탭 이벤트
		$layer.find('.mo_tab_wr li').on('click', function(){
			if ($(this).hasClass('on')) return;
			
			$layer.find('.mo_tab_wr li.on').removeClass('on');
			$(this).addClass('on');
			
			var disp_menu = $(this).data('menu');
			$layer.find('.mo_table_box').hide();
			$layer.find('.content-' + disp_menu).show();
			
			if ($(this).data('menu') == 'cal') {
				
			} else {
				
			}
		});
		
		
		
		// 일정 관련
		// 기간 선택
		var sel_date = moment().format('YYYY-MM-DD');
		$('#cs_s_date').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			defaultSelection: moment(sel_date),
			theme: 'ios',
			themeVariant : 'light',
			controls: ['calendar'],			
			dateFormat: 'YYYY-MM-DD',	
		//	display: 'anchored',
			animation: 'pop',
			calendarType: 'month',	
			startInput: '#cs_s_date',
			pages : 1,
		//	touchUi: false,
			onChange: function(event, inst){
				_checkEndDate(event.valueText, $('#cs_e_date').val());
			}
		});
		
		$('#cs_e_date').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			defaultSelection: moment(sel_date),
			theme: 'ios',
			themeVariant : 'light',
			controls: ['calendar'],				
			dateFormat: 'YYYY-MM-DD',	
		//	display: 'anchored',
			animation: 'pop',
			calendarType: 'month',	
			startInput: '#cs_e_date',
			pages : 1,
		//	touchUi: false,
			onChange: function(event, inst){
				_checkEndDate($('#cs_s_date').val(), event.valueText);
			}
		});
		
		
		// 현재 시간 정보 셋팅
		var time_html = _getTimeHtml();
		var s_date = moment().startOf('h').add(1, 'h');
		var e_date = moment().startOf('h').add(2, 'h');
		
		if (s_dt && e_dt) {
			// 메인에서 드래그하여 넘어온 경우
			$('#cs_s_date').val(s_dt);
			$('#cs_e_date').val(e_dt);
			$('#cs_allday').addClass('on');
			
			$('#cs_s_time').mobiscroll().datepicker({
				locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
				defaultSelection: '',
				theme: 'ios',
				themeVariant : 'light',
				controls: ['time'],
				stepMinute: 10,
				timeFormat: 'hh:mm A',
                onInit: function (event, inst) {
					inst.setVal(s_date.format('HH:mm'), true);
				},
				onChange: function (event, inst) {
					_checkEndDate();
				}
			});
			$('#cs_e_time').mobiscroll().datepicker({
				locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
				theme: 'ios',
				themeVariant : 'light',
				controls: ['time'],
				stepMinute: 10,
				timeFormat: 'hh:mm A',
                onInit: function (event, inst) {
					inst.setVal(e_date.format('HH:mm'), true);
				},
				onChange: function (event, inst) {
					_checkEndDate();
				}
			});
			
			$('#cs_s_time').prop('disabled', true);
			$('#cs_e_time').prop('disabled', true);

		} else {
			$('#cs_s_date').val(s_date.format('YYYY-MM-DD'));
			$('#cs_e_date').val(e_date.format('YYYY-MM-DD'));
			
			$('#cs_s_time').mobiscroll().datepicker({
				locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
				defaultSelection: '',
				theme: 'ios',
				themeVariant : 'light',
				controls: ['time'],
				stepMinute: 10,
				timeFormat: 'hh:mm A',
                onInit: function (event, inst) {
					inst.setVal(s_date.format('HH:mm'), true);
				},
				onChange: function (event, inst) {
					_checkEndDate();
				}
			});
			$('#cs_e_time').mobiscroll().datepicker({
				locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
				theme: 'ios',
				themeVariant : 'light',
				controls: ['time'],
				stepMinute: 10,
				timeFormat: 'hh:mm A',
                onInit: function (event, inst) {
					inst.setVal(e_date.format('HH:mm'), true);
				},
				onChange: function (event, inst) {
					_checkEndDate();
				}
			});
		}
		
		
		// 종일 이벤트
		$('#cs_allday').on('click', function(){
			if (!$(this).hasClass('on')) {
				$(this).addClass('on');
				$('#cs_s_time').prop('disabled', true);
				$('#cs_e_time').prop('disabled', true);
				
			} else {
				$(this).removeClass('on');
				$('#cs_s_time').prop('disabled', false);
				$('#cs_e_time').prop('disabled', false);
			}
			_checkEndDate();
		});
		
		$('#cs_s_time').on('change', function(){
			_checkEndDate();
		});
		
		$('#cs_e_time').on('change', function(){
			_checkEndDate();
		});
		
		// 종료일과의 시간을 계산해서 처리
		//$('#cs_s_date').data('diff_hour', e_date.diff(s_date, 'h'));
		
		// 시작 시간과 종료시간과의 차이를 꼐산해서 시작 시간이나 날짜가 변경되면 거기에 맞춰 종료일 셋팅
		
		
		//////////////  일정 등록 이벤트 끝   ////////////// 
		
		// 채널 정보 가져오기
		gRegM.getChannelList();
		
		
		// 기간 선택
	//	$('#ws_s_date,#ws_s_date_ico,#ws_e_date_ico').mobiscroll().datepicker({
		$('#ws_s_date').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			theme: 'ios',
			themeVariant : 'light',
			controls: ['calendar'],
			select: 'range',				
			dateFormat: 'YYYY-MM-DD',	
		//	display: 'anchored',
			animation: 'pop',
			calendarType: 'month',	
			startInput: '#ws_s_date',
		    endInput: '#ws_e_date'
		//	pages : 2
		//	touchUi: false
		});
		
		if (s_dt && e_dt) {
			$('#ws_s_date').val(s_dt);
			$('#ws_e_date').val(e_dt);
			
		}else{
			$('#ws_s_date').val(sel_date);
			$('#ws_e_date').val(sel_date);
		}
				
		// 저장
		$('#btn_simple_ok').off().on('click', function(){
			var menu = $layer.find('.mo_tab_wr li.on').data('menu');
			if (menu == 'cal') {
				gRegM.simpleCalendarSave();
			} else {
				gRegM.simpleWorkSave();
			}
		});
		
		$("#search_user").on("click", function(){
			if ($.trim($("#cs_attendee").val()) == ""){
				return false;
			}
			gBodyM.org_search(true, $("#cs_attendee").val(), 'gRegM', 'meet_org_user');
			$("#cs_attendee").val('');
		});
		
		$("#cs_attendee").keydown(function(evt){
			if (evt.keyCode == 13){
				if ($.trim($("#cs_attendee").val()) == ""){
					return false;
				}
				gBodyM.org_search(true, $("#cs_attendee").val(), 'gRegM', 'meet_org_user');
				$("#cs_attendee").val('');
			}

		});
		
		$("#search_org").on("click", function(){
			gBodyM.org_open(true, 'gRegM', 'meet_org_user');
		});
		
		$layer.find('.sch_day_box .mo_ico').on('click', function(){
			$(this).parent().find('input').click();
			return false;
		});
	},
	
	"meet_org_user" : function(obj){
		//App 조직도에서 검색 결과를 내려줌
		gRegM.aleady_select_user_count = 0;
		for (var i = 0; i < obj.length; i++){
			var _res = obj[i];
			if (_res.ky.toLowerCase()!= gap.userinfo.rinfo.ky.toLowerCase()){
				gRegM.meet_add_user(_res);
				
			}else{
				mobiscroll.toast({message:gap.lang.mt_alert_2, color:'danger'});
				return false;
			}
		}
	},
	
	"meet_add_user" : function(obj){
		/*
		 * 검색된 사용자 화면에 추가
		 */
		if (obj == undefined){
			return false;
		}
		var id = obj.ky;
		var len = $("#cs_attendee_list #member_" + id).length;

		if (len > 0){
			return false;
		}

		var user_info = gap.user_check(obj);
		var html = "";
		
		html += '<li class="f_between" id="member_' + id + '">';
		html += '	<span class="txt ko">' + user_info.disp_user_info + '</span>';
		html += '	<button class="file_remove_btn" onClick="gRegM.meet_delete_user(this)"></button>';	
		html += '</li>';

		$("#cs_attendee_list").append($(html));

		if ($("#cs_attendee_list").children().length > 0){
			$("#cs_attendee_list").parent().show();
		}
				
		delete obj['_id'];
		$("#member_" + id).data('key', id);
	},
	
	"meet_delete_user" : function(obj){
		/*
		 * 모바일 일정 생성화면에서 추가된 사용자 삭제
		 */
		var id = $(obj).parent().data("key");
		$("#member_" + id).remove();
		
		if ($("#cs_attendee_list").children().length == 0){
			$("#cs_attendee_list").parent().hide();
		}
	},
	
	"getChannelList" : function(sel_code){
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
				
			//	모바일에서는 사용 안함. 	
			//	html += '<option value="make_channel">+ ' + gap.lang.select_create_channel + '</option>';
				
				if (html) {
					$('#ws_category').html(html);
					$('#ws_category').material_select();
					
					// 셀렉트 박스 변경될 때, 담당자 정보 가져와야 함
					$('#ws_category').off().on('change', function(){
						gRegM.getChannelMember(this.value);
					});
				} else {
					// 생성된 프로젝트가 1개도 없는 경우 (관련 도움말 표시)
				}
			},
			error : function(){
				
			}
		});
	},
	
	"getChannelMember" : function(ch_code){
		var $user_list = $('#ws_asignee');
		$user_list.empty();
		
		if (ch_code == 'none') {
			$user_list.material_select();
			return;
		} else if (ch_code == 'make_channel') {
			gBodyM2.create_channel(undefined, undefined, undefined, function(data){
				gRegM.createChannelComplete(data);
			});
			return;
		}
		
		
		
		var surl = gap.channelserver + "/api/channel/search_info.km";
		var postData = {
			"type" : "C",
			"ch_code" : ch_code
		};			
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result != "OK"){
					mobiscroll.toast({message:gap.lang.error_get_data, color:'danger'});
					return;
				}
				
			/*	
			 * 전체 사용자 소트를 위해 사용하지 않음 - 2022.10.21
			 * 
			 	var html = '';
				var owner = res.data.owner;
				
				// 채널 작성자 정보
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
				
				var owner = res.data.owner;
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
		var res = JSON.parse(data);
		if (res.result == 'OK') {
			gap.add_todo_plugin("add", res.ch_code);	// 방금 생성한 채널방에 TODO 플러그인 등록
			gRegM.getChannelList(res.ch_code);
			gRegM.getChannelMember(res.ch_code);
		}
		
	},
	
	"simpleCalendarSave" : function(){
		// Validation 체크
		var _title = $.trim($('#cs_title').val()),
			_s_dt = $('#cs_s_date').val(),
			_e_dt = $('#cs_e_date').val(),
			_s_time = moment($('#cs_s_time').mobiscroll('getVal')).format('HH:mm');	//$('#cs_s_time').val(),
			_e_time = moment($('#cs_e_time').mobiscroll('getVal')).format('HH:mm');	//$('#cs_e_time').val(),
			_allday = $('#cs_allday').hasClass('on');
			_priority = parseInt($('#cs_priority').find('option:selected').val()),
			_category = $('#cs_type').val(),
			_public = $(':radio[name="cs_public"]:checked').val();
			_express = $.trim($('#cs_content').val()),
			_attendee = '';
			
		$('#cs_title').val(_title);
		
		
		// 업무명 선택
		if (_title == '') {
			mobiscroll.toast({message:gap.lang.error_ws_title, color:'danger'});
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
		} else {
			obj.start = moment(_s_dt + 'T' + _s_time).format();
			obj.end = moment(_e_dt + 'T' + _e_time).format();
			
			if (obj.start >= obj.end) {
				mobiscroll.toast({message:gap.lang.invalid_period, color:'danger'});
				return;
			}
		}

		gRegM.calendarAPI(obj).then(function(data){
			if (data == 'SUCCESS') {
				mobiscroll.toast({message:gap.lang.reg_complete, color:'info'});
				var url_link = "kPortalMeet://NativeCall/callCloseLayer?done=yes&reload=yes";
				gBodyM.connectApp(url_link);
				return false;
				
			} else {
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});	
			}
		});
	},
	
	"simpleWorkSave" : function(){
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
						var url_link = "kPortalMeet://NativeCall/callCloseLayer?done=yes&reload=yes";
						gBodyM.connectApp(url_link);
						return false;
					});
					
				} else {
					mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				}
			}
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
            'SystemCode': obj.system ? obj.system : 'task'	//연동 시스템 코드 (예 : 화상회의 예약)
        };
		
		var url = location.protocol + "//" + location.host + "/" + maildbpath.split("/")[0] + "/cal/calendar.nsf/fmmeeting?openform";
		return $.ajax({
			type: 'POST',
            url: url,
            data: _form_data,
            dataType: "text",
            success: function(data) {
                
            }
		}).then(function(data){
			var res = '';
			if (data != '') {
				res = data.split('^')[0];
			}
			return res;
		}, function(){
			return 'ERROR';
		});
	},	
	
	"changePage" : function(){
		gRegM.showRegLayer(s_dt, s_dt);	
	},
	
	"convertGMTLocalDateTime" : function(val){
		var _date = moment(val, 'YYYYMMDDHHmmss').utc().local().format('YYYY-MM-DD[T]HH:mm:00[Z]')
		var ret = moment.utc(_date).local().format('YYYY.MM.DD') + '(' + moment.utc(_date).local().format('ddd') + ') ' + moment.utc(_date).local().format('HH:mm');
		return ret;
	}
}
