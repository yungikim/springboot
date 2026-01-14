function gUserProfile(){
	
}
gUserProfile.prototype = {
	"showUserDetailLayer" : function(ky){
		var _self = this;
		
		var req_user = $.ajax({
			type: 'POST',
			url: gap.channelserver + "/search_user_empno.km",
			beforeSend: function(){
				_self.loading_req = setTimeout(function(){/*gap.show_loading('Loading...');*/ gap.showBlock_org();}, 200);
			},
			data: JSON.stringify({empno:ky}),
			success: function(data){
				clearTimeout(_self.loading_req);
				gap.hideBlock_org();
				
				if (!Array.isArray(data) || data.length == 0) {
					mobiscroll.toast({message:gap.lang.error_get_data, color:'danger'});
					return;
				}
	
				// 여기서 기본적으로 사용자 정보를 표시한다
				_self.drawUserDetailLayer(data);
			},
			error: function(){
				clearTimeout(_self.loading_req);
				gap.hideBlock_org();
				mobiscroll.toast({message:gap.lang.error_get_data, color:'danger'});
			}
		});
	},
	"drawUserDetailLayer" : function(data){
		var _self = this;
		
		$('#user_detail_container').remove();
		
		var info = data[0][0];
		
		if (!info || !info.nm) {
			mobiscroll.toast({message:gap.lang.not_found_userinfo, color:'danger'});
			return;
		}
		
		info = gap.user_check(info);
		
		var office_num = '';
		if (info.op) {
			office_num = info.op;
			if (info.ipt) {
				office_num += '(' + info.ipt + ')';
			}
		} else {
			office_num = '-';
		}
		
		
		var html = 
			'<div id="user_detail_container" class="profile-window">' +
			'	<div class="user-detail-dim"></div>' +
			'	<div class="layer-wrap">' +
			'		<div class="layer-inner">' +
			//'			<div class="btn-close"><span></span><span></span></div>' +

			'			<div class="cont-left">' +
			'				<div class="img-box-wrap">' +
			'					<div class="img-box">' +
			'						<div class="photo-wrap" style="cursor:default;"></div>' +
			'						<span class="status"></span>' +
			'						<span class="mobile"></span>' +
			'					</div>' +
			'				</div>' +
			'				<div class="mem-info-wrap">' +
			'					<h4>' + info.name + '</h4>' +
			'					<span class="empno">' + info.emp + '</span>' +
			'				</div>' +
			'				<div class="team-info-wrap">' +
			'					<span>' + info.company + '</span>' +
			'					<span>' + info.dept + '</span>' +
			'					<span class="user-duty"></span>' +
			'				</div>' +
			'				<div id="ud_comment" class="user-comment" style="display:none;">' +
			'					<span></span>' +
			'				</div>' +
			'			</div>' +

			'			<div class="cont-right">' +
			'				<table>' +
			'					<tbody>' +
			'						<tr><th><span>' + gap.lang.company + '</span></th><td><span>' + info.company + '</span></td></tr>' +
			'						<tr><th><span>' + gap.lang.empno + '</span></th><td><span>' + info.emp + '</span></td></tr>' +
			'						<tr><th><span>' + gap.lang.duty + '</span></th><td><span class="user-duty"></span></td></tr>' +
			'						<tr><th><span>' + gap.lang.jd + '</span></th><td><span>' + (info.mm||'-') + '</span></td></tr>' +
			'						<tr><th><span>' + gap.lang.location + '</span></th><td><span>' + (info.wl||'-') + '</span></td></tr>' +
			'						<tr class="user-jn" style="display:none"><th><span>' + gap.lang.jn + '</span></th><td><span>' + info.jn + '</span></td></tr>' +
			'						<tr class="user-cn" style="display:none"><th><span>' + gap.lang.client + '</span></th><td><span>' + info.cn + '</span></td></tr>' +
			'						<tr><th><span>' + gap.lang.email + '</span></th><td><span>' + (info.em||'-') + '</span></td></tr>' +
			'						<tr><th><span>' + gap.lang.office + '</span></th><td class="user-op call"><span>' + office_num + '</span></td></tr>' +
			'						<tr><th><span>' + gap.lang.mobile + '</span></th><td class="user-mop call"><span>' + (info.mobile||'-') + '</span></td></tr>' +
			'					</tbody>' +
			'				</table>' +
			'				<div class="quick_btn_box">' +
			'					<ul>' +
			'						<li><button type="button" class="q_talk"></button><span class="q_btn_tit">' + gap.lang.chatting + '</span></li>' +
			'						<li><button type="button" class="q_mail"></button><span class="q_btn_tit">' + gap.lang.email + '</span></li>' +
			'						<li><button type="button" class="q_sms"></button><span class="q_btn_tit">SMS</span></li>' +
			'						<li><button type="button" class="cal_chk"></button><span class="q_btn_tit">' + gap.lang.schedule_check + '</span></li>' +
			//'						<li><button type="button" class="remote_sup"></button><span class="q_btn_tit">' + gap.lang.remote + '</span></li>' +
			'					</ul>' +
			'				</div>' +
			'			</div>' +
			
			'		</div>' +
			'	</div>' +
			'</div>';
		
		var $layer = $(html);
		$('body').append($layer);
		$layer.data('info', info);
		
		// 내 프로필인 경우 채팅 멤버 추가 버튼 숨김
		if (info.ky == gap.userinfo.rinfo.ky) {
			$layer.find('.btn-add-buddy').hide();
		} 
		
		// 직위 표시
		/*
		var disp_duty = '';
		if (info.dg == 'DUTY') {
			disp_duty = info.du;
		} else {
			disp_duty = info.jt;
		}
		*/
		var disp_duty = info.jt;
		
		// 직무레벨이 SC1, SC2, SC3인 경우 표시
		if (info.jtc == 'SC1' || info.jtc == 'SC2' || info.jtc == 'SC3') {
			if (info.du == 'SC팀장') {
				// SC팀장은 직위레벨 표시 안함
				
			} else {
				disp_duty += ' (' + info.jtc + ')';
			}
		}
		$layer.find('.user-duty').text(disp_duty);
		
		// 직무 표시
		if (info.jn && info.jn != 'null') { // null이 스트링으로 들어오는 케이스가 있음
			$layer.find('.user-jn').show();
		}
		
		// 거래처 표시
		if (info.cn && info.cn != 'null') { // null이 스트링으로 들어오는 케이스가 있음
			$layer.find('.user-cn').show();
		}
		
		// 코끼리 표시
		if (gap.userinfo.rinfo.cpc == '10' && (gap.userinfo.rinfo.ky.indexOf('im') == -1) &&
			info.cpc == '10' &&	(info.ky.indexOf('im') == -1)) {
			$('#user_detail_ele').show();
		}
		
		// 사용자 사진 표시
		var img_src = gap.person_photo_url(info);
		$layer.find('.photo-wrap').css('background-image', 'url(' + img_src + '), url(../resource/images/none.jpg)');
		/*
		.on('click', function(){
			
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;
			
			gap.show_image(img_src, info.nm, 'org');
		});
		*/

		if (window.use_tel == '1') {
			// 전화
			if (info.op) {
				$layer.find('.user-op').append('<button type="button" class="call_num" data-num="' + info.op + '"></button>');
			}			
			// 휴대전화
			if (info.mop) {
				$layer.find('.user-mop').append('<button type="button" class="call_phone" data-num="' + info.mop + '"></button>');
			}
		}
		
		if (window.use_sms != '1') {
			$layer.find('.q_sms').closest('li').remove();
		}
		
		
		
		
		$layer.find('.layer-wrap').addClass('show');
		$layer.find('.layer-wrap').css('opacity', 0);
		
		_popupResize();
		setTimeout(function(){
			_popupResize();
			$layer.find('.layer-wrap').css('opacity', 1);
		}, 50);
		
		function _popupResize(){
			// 창 사이즈 조절 및 가운데 이동
			var $wrap = $('.layer-wrap');
			var zoom = window.devicePixelRatio || 1;

			// UI 요소 크기 보정 (DPI 고려)
			var extraWidth = Math.floor(window.outerWidth - (window.innerWidth * zoom));
			var extraHeight = Math.floor(window.outerHeight - (window.innerHeight * zoom));

			// 실제 컨텐츠 크기 가져오기 (DPI 배율 적용하지 않음)
			var contentWidth = Math.floor($wrap.outerWidth(true) * zoom);
			var contentHeight = Math.floor($wrap.outerHeight(true) * zoom);
			
			
			//var check = contentWidth + "," + extraWidth;
			//$('.cont-right').find('tr:eq(0) td span').html(check);
			
			
			if (window.chrome.webview){
				// 알림포탈 팝업용
				//window.chrome.webview.postMessage('{"type":"popup", "stype":"resize", "width":"' + (contentWidth + extraWidth) + '", "height":"' + (contentHeight + extraHeight) + '"}');				
				window.chrome.webview.postMessage('{"type":"popup", "stype":"resize", "width":"' + (contentWidth) + '", "height":"' + (contentHeight) + '"}');
			}else{
				// 창 크기 조정 (DPI 변경 시에도 정상 동작)
				window.resizeTo(contentWidth + extraWidth, contentHeight + extraHeight);
			}
			
			// 다중 모니터용 현재 모니터의 작업 영역 정보를 사용
			var availLeft = (typeof screen.availLeft === 'number') ? screen.availLeft : 0;
			var availTop = (typeof screen.availTop === 'number') ? screen.availTop : 0;
			var availWidth = screen.availWidth;
			var availHeight = screen.availHeight;

			// 중앙 위치 계산 (작업영역 기준)
			var left = availLeft + (availWidth - (contentWidth + extraWidth)) / 2;
			var top = availTop + (availHeight - (contentHeight + extraHeight)) / 2;

			if (window.chrome.webview){
				// 알림포탈 팝업용
				availWidth = availWidth * zoom;
				availHeight = availHeight * zoom;
				left = (availWidth - contentWidth) / 2;
				top = (availHeight - contentHeight) / 2;
				
				window.chrome.webview.postMessage('{"type":"popup", "stype":"move", "left":"' + left + '", "top":"' + top + '"}');				
			}else{
				// 일반 Web 팝업용
				window.moveTo(left, top);			
			}
		}
	
		
		
		// 닫기
		$layer.find('.btn-close').on('click', function(){
			window.close();
		});
		/*
		// Dim 클릭시 닫기
		$layer.find('.user-detail-dim').on('click', function(){
			$layer.find('.btn-close').click();
		});
		// ESC 닫기
		$(document).on('keydown.userdetail.layer', function(e){
			if (e.keyCode == 27) {
				if ($('#preview_img').is(':visible')) {
					// 사용자 사진 확대보기 중인 경우
					gap.close_preview_img();
				} else if ($('#add_buddy_layer').is(':visible')) {
					// 그룹 추가중인 경우
					$('#add_buddy_layer').find('.pop_btn_close').click();
				} else {
					$layer.find('.btn-close').click();					
				}
			}
		});
		*/
				
		// 온라인, 모바일 접속 여부, 상태(휴가,출장 등)값 표시
		_wsocket.temp_list_status([info.ky], 3, 'org_detail');
		
		/*
		 * 버튼 이벤트
		 */
		
		$layer.find('.call_num').on('click', function(){
			gap.phone_call(info.ky, 1);
		});
		$layer.find('.call_phone').on('click', function(){
			gap.phone_call(info.ky, 2);
		});
		
		// 쪽지 (상세프로필)
		$layer.find('.q_note').on('click', function(){
			var list = [];
			list.push(info);
			gRM.create_memo(list);
		});
		
		// 대화 (상세프로필)
		$layer.find('.q_talk').on('click', function(){
			var data = JSON.stringify({
				"empno" : info.ky
			})			
			//이렇제 하지 않으면 새창에 기존에 대화방에 없는 경우 에러발생한다.
			var url = gap.channelserver + "/search_user_empno.km";;
			$.ajax({
				type : "POST",
				url : url,
				dataType : "json",
				data : data,
				contentType : "application/json; charset=utf-8",
				success : function(res){
					gBody.cur_room_att_info_list = res[0];
				
					_wsocket.make_chatroom_11_only_make_org(info.ky, info.nm);
				},
				error : function(e){
					gap.error_alert();
				}
			})
			
			//_wsocket.make_chatroom_11_only_make_org(info.ky, info.nm);
		});
		
		// 메일 (상세프로필)
		$layer.find('.q_mail').on('click', function(){
			var param = {opentype: 'popup',	callfrom: 'address', authorsend: info.em};			
			var memo_url = '/' + window.mailfile + '/Memo?openform&' + $.param(param);
			
			var swidth = Math.ceil(screen.availWidth * 0.8);
			var sheight = Math.ceil(screen.availHeight * 0.8);
			if (swidth > 1140) {
				swidth = 1140;				
			}
			gap.open_subwin(memo_url, swidth, sheight);
		});
		
		// SMS (상세프로필)
		$layer.find('.q_sms').on('click', function(){
			gap.sms_call(info.ky);
		});
				
		// 일정 (상세프로필)
		$layer.find('.cal_chk').on('click', function(){
			var url = "/ngw/core/lib.nsf/redirect_mail?readform&action=calview&uname="+info.ky+"&viewname=F";
			gap.open_subwin(url, "1240","660", "yes" , "", "yes");
		});
		
		// 코끼리 (상세프로필)
		$layer.find('.ele').on('click', function(){
			gap.elephant_call(info.ky);
		});
		
		// 원격제어
		$layer.find('.remote_sup').on('click', function(){
			gap.remote_call(info.ky);
		});

	},
	
	"setUserStatusClass" : function(dom, status){
		// 상태
		if (status == 1) {
			dom.addClass('online');
		} else if (status == 2) {
			dom.addClass('away');
		} else if (status == 3) {
			dom.addClass('deny');
		} else {
			dom.addClass('offline');
		}
	},
	
	"userDayText" : function(key){
		// 1: 휴가, 2: 휴직, 3: 오전반차, 4: 오후반차, 5: 장기휴가, 6: 해외출장, 7: 국내출장, 8: 교육, 9: 재택
		var res = '';
		if (key == '1') {
			res = gap.lang.v1;
		} else if (key == '2') {
			res = gap.lang.v2;
		} else if (key == '3') {
			res = gap.lang.v3;
		} else if (key == '4') {
			res = gap.lang.v4;
		} else if (key == '5') {
			res = gap.lang.v5;
		} else if (key == '6') {
			res = gap.lang.v6;
		} else if (key == '7') {
			res = gap.lang.v7;
		} else if (key == '8') {
			res = gap.lang.v8;
		} else if (key == '9') {
			res = gap.lang.v9;
		} else if (key == '10') {
			res = gap.lang.ws_type_10;
		} else if (key == '11') {
			res = gap.lang.v11;
		}
		
		return res;
	},
	
	"userStatusDisp" : function(obj){
		if (typeof(obj.ct) != "undefined"){		
			if (obj.ek == "remove"){
				return false;
			}			
			var lists = obj.ct.usr;
			this.detailLayerStatus(lists);
		}
	},
	
	"detailLayerStatus" : function(list){
		var $layer = $('#user_detail_container');
		if ($layer.length == 0) return;
		if (!Array.isArray(list)) return;
		
		var l_info = $layer.data('info'); 
		var info = list[0];
		if (info.ky != l_info.ky) return;
		
		// 상태
		this.setUserStatusClass($layer.find('.status'), info.st);
		
		// 모바일
		if (info.mst && info.mst != 0) {
			$layer.find('.mobile').addClass('phone_icon');
		}
		
		// 연차정보
		if (info.exst && info.exst != '') {
			$layer.find('.mem-info-wrap').prepend('<span class="biz_check day_' + info.exst + '">' + this.userDayText(info.exst) + '</span>');
		}
		
		/*
		// 상태메세지
		if (info.msg && info.msg != '') {
			$('#ud_comment').show().find('span').html(info.msg);
		}
		*/
	}
}
