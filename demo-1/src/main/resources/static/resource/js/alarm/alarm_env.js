function gAlarmEnv() {
	this.is_init = false;
	
	/**** 순서편집에 사용되는 변수 ****/
	this.is_sys_change = false;	/// 시스템 알림 설정값 변경 여부 체크 변수
	this.sys_order = "";
	this.order_change_chk = false;	/// 미처리 건 수 순서편집에서 순서가 바뀌었는지 체크 변수(false면 저장 X)
	/**** 순서편집에 사용되는 변수 ****/
}

gAlarmEnv.prototype = {
	"init" : function(){

	},
	
////// 미처리 건 수 편집 레이어 그리는 함수
	"draw_edit_unprocessed_order_layer": function(){
		
		if( $("#popup_edit_unprocessed_layer").length !== 0 ){
			return false;
		}
		
		var html = "";
		
		html += "<div id='popup_edit_unprocessed_layer'>";
		html += "	<div class='layer_inner'>";
		
		html += "		<div class='layer_top'>";
		html += "			<div class='layer_title_wrap'>";
		html += "				<button type='button' id='btn_close_layer' class='btn_close_layer'>";
		html += "					<span class='btn_ico_wrap'>";
		html += "						<span class='btn_ico'></span>";
		html += "					</span>";
		html += "				</button>";
		html += "				<h2 class='layer_title_txt'>" + gap.lang.edit_order + "</h2>";
		html += "			</div>";
		html += "			<button type='button' id='btn_edit_unprocessed_position' class='btn_edit_unprocessed_position'>";
		html += "				<span>" + gap.lang.apply + "</span>";
		html += "			</button>";
		html += "		</div>";
		
		html += "		<div class='layer_content'>";
		
		/// 편집할 목록 ////
		html += "			<div id='edit_unprocessed_list_ul' class='edit_unprocessed_list_ul'></div>";
		/// 편집할 목록 ////
		
		/*html += "			<div class='edit_guide'>";
		html += "				<span class='guide_txt'>※ 드래그 앤 드롭으로 순서를 변경할 수 있습니다.</span>";
		html += "				<span class='guide_txt'>※ 메뉴 설정은 <span class='bold'>환경설정 > 시스템알림설정(PC)</span>에서 가능합니다.</span>";
		html += "			</div>";*/
		html +=	"		</div>";
		
		html += "	</div>";
		html += "</div>";
		
		gAct.open_modal_layer(html);
		
		/// 시스템 알림 목록 가져오기
		gAenv.draw_to_edit_order_list();
		
		$("#btn_edit_unprocessed_position").off().on("click", function(){
			
			/// 바뀌었을 때만 저장
			if(gAenv.order_change_chk){
				// 선택한 요소를 top 값 기준으로 정렬
				var elements = $("#edit_unprocessed_list_ul .list_li").get(); // 선택한 요소들을 배열로 가져오기

				elements.sort(function(a, b) {
					var topA = parseInt($(a).css("top"), 10) || 0; // 요소 A의 top 값
					var topB = parseInt($(b).css("top"), 10) || 0; // 요소 B의 top 값

					return topA - topB; // 높은 top 값이 앞에 오도록 내림차순 정렬
				});

				/// 시스템을 드래그하여 배치한 순서대로 noti_id를 담을 배열 
				var arr = [];
				
				for( var i = 0; i < elements.length; i++){
					arr.push($(elements[i]).data("code"));
				}
				
				//console.log(" 배치된대로 시스템 순서대로 나열 : " + arr);
				
				gAenv.sys_order = arr;
				postData = JSON.stringify({
					sys: arr
				});

				//현재 배치된 순서대로 시스템의 noti_id를 저장한다.
				// 미처리 건 수 업데이트
				gAenv.save_alarm_preferences(postData, "refresh");
			}
			
			gAct.close_modal_layer(html);
			
			///적용하기 버튼을 누르면 저장방지(아무것도 변경하지 않고 적용하기 버튼을 눌렀을 때)
			gAenv.order_change_chk = false;
		});
		
		/// 닫기 버튼
		$("#btn_close_layer").off().on("click", function(){
			$("#alarm_ul .alarm_box").removeClass("no_scroll");
			gAct.close_modal_layer();
			
			///	닫기 버튼을 누르면 저장방지(아무것도 변경하지 않고 적용하기 버튼을 눌렀을 때)
			gAenv.order_change_chk = false;
		});
		
	},
	
	///순서를 편집할 미처리 건 수 시스템 알림 목록 그리는 함수
	"draw_to_edit_order_list": function(){

		var url = gap.rp + "/noti/config/user";

		$.ajax({
			type : "GET",
			url : url,
			xhrFields : {
				withCredentials : true
			},
			dataType : "json",
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
			},
			success : async function(res){

	        	 var data = res.ct.sys;
	        	 if (gAct.sys_list == ""){
	        		 gAct.sys_list = await gAenv.load_preferences_list_data();
	        	 }
	        	 
	        	 var arr = [];
	        	 
	        	 data.filter(function(item){
	        		 /// 전체 시스템 알림 목록에서 사용자가 활성화한 알림 목록만 뽑아낸다.
	        		 return gAct.sys_list.data.response.some(function (sysItem) {
       		        if(sysItem.noti_id === item){
       		        	arr.push(sysItem);
       		        }
	        		 });
	        	 });
	        	 
	        	 var $li = "";	/// 목록 html
	        	 var guide = ""; /// 안내문구 html
	        	 
	        	 //// 사용자가 활성화한 시스템이 없을 때  
	        	 if( arr.length === 0 ) {
	        		 
	        		 guide += "<div class='empty_guide'>";
	        		 guide += "	<div class='empty_txt_wrap'>";
	        		 guide += "		<div class='empty_ico'></div>";
	        		 guide += "		<div class='empty_txt'>";
	        		 guide += "			<span>" + gap.lang.not_found_sys + "</span>";
	        		 guide += "			<span>" + gap.lang.guid_edit_order + "</span>";
	        		 guide += "		</div>";
	        		 guide += "	</div>";
	        		 
	        		///// 환경설정 바로가기 버튼 /////
	        		 guide += "	<button type='button' id='btn_go_to_env' class='btn_go_to_env'>";
	        		 guide += "		<span>" + gap.lang.shortcut + "</span>";
	        		 guide += "	</button>";
	        		///// 환경설정 바로가기 버튼 /////
	        		 
	        		 guide += "</div>";
	        		 
	        		 $("#edit_unprocessed_list_ul").addClass("flex1").append(guide);
	        		 
	        		 ///// 환경설정 바로가기 버튼 /////
	        		 $("#btn_go_to_env").off().on("click", function(){
	        			 $("#btn_close_layer").click();
	        			 
	        			 /***
	        			  * 1. 순서편집 창을 닫는다. ( 150ms )
	        			  * 2. 환경설정 창을 연다. ( 300ms )
	        			  * 3. 시스템 알림 목록을 연다.
	        			  ***/
	        			 
	        			 setTimeout(function(){
	        				 $("#btn_alarm_preferences").click();
	        			 }, 150);
	        			 // 환경설정 창이 열리는데 걸리는 시간 300ms
	        			 setTimeout(function(){
	        				 $("#alarm_setting_box_wrap").find(".alarm_set_box:not(.taskbar)").find(".set_box_ul").slideUp(0);
	        				 $("#alarm_setting_box_wrap").find(".alarm_set_box:not(.taskbar)").removeClass("slide");
	        				 $("#alarm_set_box_system").addClass("slide");
	        				 $("#alarm_setting_box_wrap").find(".alarm_set_box:not(.taskbar)").find(".btn_toggle_alarm_set_box").removeClass("open");
	        				 $("#alarm_set_box_system").find(".btn_toggle_alarm_set_box").toggleClass("open");
	        				 $("#alarm_set_box_system").find(".set_box_ul").slideDown(0);
	        			 }, 150);
	        		 });
	        		 
	        	 } else {
	        	//// 사용자가 활성화한 시스템이 있을 때  
	        		 for(var i = 0; i < arr.length; i++){
	        			 var code = arr[i].noti_id;
	        			 
	        			 var sys_name = "";
	        			 
	        			/// 언어가 한국어 일 때
	        			 if(gap.curLang === "ko"){
	        				 sys_name = arr[i].nm;
	        			 } else {
	        				 sys_name = arr[i].enm;
	        			 }
	        			 
	        			 var icon_src = gap.channelserver + "/alarmcenter_icon.do?code=" + arr[i].noti_id + '&ver=' + arr[i].udt;
	        			 
	        			 $li += "<div class='list_li' data-code='" + code + "'>";
	        			 $li += "	<div class='list_title_wrap'>";
	        			 $li += "		<div class='list_title_box'>";
	        			 $li += "			<div class='list_category_wrap'>";
	        			 $li += "				<div class='list_category_img' style='background-image: url(" + icon_src + ")'></div>";
	        			 $li += "				<div class='list_category_name'>" + sys_name + "</div>";
	        			 $li += "			</div>";
	        			 $li += "		</div>";
	        			 $li += "	</div>";
	        			 $li += "	<div class='drag_guide_img'></div>";
	        			 //html += "	<button type='button' class='btn_del_temp'></button>";
	        			 $li += "</div>";
	        		 }
	        		 
	        		 $li = $($li);
	        		 
	        		 guide += "<div class='edit_guide'>";
	        		 guide += "	<span class='guide_txt'>※ " + gap.lang.guide_edit_order_2 + "</span>";
	        		 
//	        		 guide += "	<span class='guide_txt'>";
//	        		 guide += "		※ " + gap.lang.guide_edit_order_3;
//	        		 guide += "		<span class='bold'>" + gap.lang.guide_edit_order_4 + "</span>";
//	        		 guide += 		gap.lang.guide_edit_order_5;
//	        		 guide += "	</span>";
	        		 
	        		 guide += "	<span class='guide_txt'>"+gap.lang.guide_edit_order_6.replace("$1", "<span class='bold'>" + gap.lang.guide_edit_order_4 + "</span>")+"</span>";
	        		 guide += "</div>";
	        		 /// 가이드
	        		 
	        		 var $ul = $("#edit_unprocessed_list_ul").packery({
	        			 itemSelector: '.list_li',
	        			 rowHeight: 44,
	        			 gutter: 12,
	        			 transitionDuration: '0.2s',
	        			 percentPosition: true
	        		 });
	        		 
	        		 /// 리스트를 그린다.
	        		 $ul.append($li).packery( 'appended', $li );
	        		 
	        		 /// 그려진 리스트 다음에 가이드 표시
	        		 $("#edit_unprocessed_list_ul").after(guide);
	        		 
	        		 // 현재 요소 중에서 top 값이 가장 높은 요소 찾기
	        		 var highestTopElement = null;
	        		 var highestTopValue = -Infinity; // 초기값은 매우 작은 값으로 설정
	        		 
	        		 $("#edit_unprocessed_list_ul .list_li").each(function() {
	        			 var topValue = parseInt($(this).css("top"), 10) || 0; // "top" 값을 정수로 변환
	        			 if (topValue > highestTopValue) {
	        				 highestTopValue = topValue;
	        				 highestTopElement = $(this);
	        			 }
	        		 });
	        		 
	        		 /*
       		 if (highestTopElement) {
       		     //console.log("가장 높은 top 값을 가진 요소:", highestTopElement);
       		     console.log("가장 높은 top 값:", highestTopValue);
       		 }
	        		  */
	        		 
	        		 var scrollHeight = $("#edit_unprocessed_list_ul")[0].scrollHeight;
	        		 
	        		 var $items = $li.draggable({
	        			 containment: $ul,
	        			 start: function(event, ui){
	        			 $("#edit_unprocessed_list_ul")[0].scrollHeight = scrollHeight;
	        		 	 },
	        			 drag: function(event, ui){
	        		 		 
	        		 		 $("#edit_unprocessed_list_ul")[0].scrollHeight = scrollHeight;
		        			 
	        		 		 if(ui.position.left > 0){
		        				 //// 드래그 중인 요소가 좌우 바깥으로 벝어나지 않도록 방지
		        				 ui.position.left = 0;
		        			 }
		        			 if(highestTopValue < ui.position.top){
		        				 //// 드래그 중인 요소가 컨테이너 바깥으로 벝어나지 않도록 방지
		        				 ui.position.top = highestTopValue;
		        			 }
		        			 //$ul.packery("layout");
		        			 //console.log(ui.position.left);
		        			 //console.log(ui.position.top);
		        			 $ul.on('dragstart', function () {
			        		        // 높이를 고정
			        		        $(this).css('height', $(this).height());
			        		    });

			        		    $ul.on('dragend', function () {
			        		        // 높이 고정 해제
			        		        $(this).css('height', '');
			        		    });
		        			 //console.log($("#edit_unprocessed_list_ul")[0].scrollHeight);
		        		 },
		        		 stop: function(event, ui){
		        			 // order_change_chk이 true일 때만 저장
		        			 gAenv.order_change_chk = true;
		        			 //$(".packery-drop-placeholder").remove();
		        		 }
	        		 });

	        		 //// 드래그 활성화
	        		 $ul.packery( 'bindUIDraggableEvents', $items );
	        	 }
			},
			error : function(e){
				//gap.error_alert();
			}
		});
	},
	
//////환경설정 팝업 그리는 함수
	"draw_popup_preferences": function(){
		
		if( $("#popup_alarm_preferences").length !== 0 ) {
			return false;
		}
		
		var html = "";
		
		html += "<div id='popup_alarm_preferences'>";
		html += "	<div class='inner'>";
		////////// 타이틀 ////////////////
		html += "		<div id='alarm_title_box' class='alarm_title_box'>";
		html +=	"			<div class='title_wrap'>";
		html +=	"				<button type='button' id='btn_close_preferences' class='btn_close_preferences'>";
		html += "					<span class='btn_ico_wrap'>";
		html += "						<span class='btn_ico'></span>";
		html += "					</span>";
		html += "				</button>";
		html +=	"				<h2 class='title_txt'>" + gap.lang.preferences + "</h2>";
		html +=	"			</div>";
		/*html += "			<div class='btn_wrap'>";
		html +=	"				<button type='button' id='btn_close_preferences_x' class='btn_alarm_close'></button>";
		html +=	"			</div>";*/
		html += "		</div>";
		
		////////////// 알림 설정 ///////////////////
		html += "		<div id='alarm_setting_box_wrap' class='alarm_setting_box_wrap'>";
		
		if(!is_mobile){
		/**** PC 에서만 표시 ****/	
			//////////// 작업표시줄 영역 알림 설정 ////////////
			html += "			<div class='alarm_set_box taskbar'>";
			html += "				<div class='title_wrap'>";
			html += "					<div class='title'>" + gap.lang.alarm_setting + "</div>";
			html += "					<button type='button' class='btn_toggle_alarm_set_box open'></button>";
			html += "				</div>";
			html += "				<div class='set_box_ul'>";
			html += "					<div class='set_box_li'>";
			html += "						<div class='set_box_title_wrap btn_tooltip' data-tooltip='alarm_popup'>";
			
			if(gap.curLang !== "ko"){
				html += "							<div class='set_box_title_txt' title='" + gap.lang.set_popup_cycle + "'>" + gap.lang.set_popup_cycle + "</div>";	
			} else {
				html += "							<div class='set_box_title_txt'>" + gap.lang.set_popup_cycle + "</div>";
			}
			console.log(gap.lang.set_popup_cycle)
			
			html += "							<div class='set_box_tooltip'></div>";
			html += "						</div>";
			html += "						<select id='selectbox_alarm_popup_period' class='set_box_selectbox'>";
			/*html += "							<option value='30'>30분</option>";
		html += "							<option value='60'>1시간</option>";
		html += "							<option value='120'>2시간</option>";
		html += "							<option value='180'>3시간</option>";*/
			html += "						</select>";
			html += "					</div>";
			html += "					<div class='set_box_li'>";
			html += "						<div class='set_box_title_wrap btn_tooltip' data-tooltip='alarm_noti'>";
			
			if(gap.curLang !== "ko"){
				html += "							<div class='set_box_title_txt' title='" + gap.lang.set_noti_cycle + "'>" + gap.lang.set_noti_cycle + "</div>";
			} else {
				html += "							<div class='set_box_title_txt'>" + gap.lang.set_noti_cycle + "</div>";
			}
			html += "							<div class='set_box_tooltip'></div>";
			html += "						</div>";
			html += "						<select id='selectbox_alarm_chk_use'class='set_box_selectbox'>";
			/*html += "							<option>미선택</option>";
		html += "							<option>선택</option>";*/
			html += "						</select>";
			html += "					</div>";
			html += "				</div>";
			html +=	"			</div>";
		/**** PC 에서만 표시 ****/	
		}
		
		//////////// 메뉴별 알림 설정 ///////////////
		html += "			<div id='alarm_set_box_bymenu' class='alarm_set_box bymenu slide'>";
		html += "				<div class='title_wrap'>";
		html += "					<div class='title'>" + gap.lang.set_alarm_bymenu + "</div>";
		html += "					<button type='button' class='btn_toggle_alarm_set_box open'></button>";
		html += "				</div>";
		html += "				<div class='set_box_ul'>";
		html += "					<div id='for_pc_set_box_li_wrap' class='set_box_li_wrap'>";
		
		if(!is_mobile){
			html += "						<div class='set_box_hd_wrap for_pc'>";
			html += "								<div class='set_box_hd_title'>" + gap.lang.menu_name + "</div>";
			html += "								<div class='set_box_hd_detail_wrap'>";
			html += "									<div class='set_box_hd_detail_title_box btn_tooltip' data-tooltip='taskbar'><span class='tooltip_name'>" + gap.lang.taskbar +"</span><div class='set_box_tooltip'></div></div>";
			html += "									<div class='set_box_hd_detail_title_box btn_tooltip' data-tooltip='popup'><span class='tooltip_name'>" + gap.lang.noti + "</span><div class='set_box_tooltip'></div></div>";
			html += "									<div class='set_box_hd_detail_title_box btn_tooltip' data-tooltip='mobile'><span class='tooltip_name'>" + gap.lang.mobile + "</span><div class='set_box_tooltip'></div></div>";
			html += "								</div>";
			html += "						</div>";
		}
		
		html += "						<div class='set_box_hd_li'>";
		html += "							<div class='set_box_title_wrap' data-tooltip='bymenu_all'>";
		html += "								<div class='set_box_title_txt' title='" + gap.lang.all_alarm + "'>" + gap.lang.all_alarm + "</div>";
		//html += "								<div class='set_box_tooltip'></div>";
		html += "							</div>";
		
		if(!is_mobile){
			html += "							<div id='set_all_pc' class='set_box_all_mng_toggle_box for_pc'>";
			/*html += "								<div class='all_mng_toggle_wrap taskbar on' data-code='all_aprv_taskbar'>";
			html += "									<span class='toggle'></span>";
			html += "								</div>";
			html += "								<div class='vertical_bar'></div>";
			html += "								<div class='all_mng_toggle_wrap popup on' data-code='all_aprv_noti'>";
			html += "									<span class='toggle'></span>";
			html += "								</div>";
			html += "								<div class='vertical_bar'></div>";
			html += "								<div class='all_mng_toggle_wrap mobile on' data-code='all_aprv_mobile'>";
			html += "									<span class='toggle'></span>";
			html += "								</div>";*/
			html += "							</div>";
		} else {
			html += "							<div id='set_all_mobile' class='set_box_all_mng_toggle_box for_mobile'>";
			/*html += "								<div class='all_mng_toggle_wrap mobile'>";
			html += "									<span class='toggle'></span>";
			html += "								</div>";*/
			html += "							</div>";
		}
		
		html += "						</div>";
		html += "					</div>";
		
		if(!is_mobile){
			html += "					<div id='pc_bymenu_alarm_list' class='set_box_ul_depth2'></div>";
		} else {
			html += "					<div id='mobile_bymenu_alarm_list' class='set_box_ul_depth2'></div>";
		}

		html += "				</div>";
		html +=	"			</div>";
		
		if(!is_mobile){
			
		
			//////////// 시스템 알림 설정 ///////////////
			html += "			<div id='alarm_set_box_system' class='alarm_set_box system'>";
			html += "				<div class='title_wrap'>";
			html += "					<div class='title'>" + gap.lang.set_alarm_system + "</div>";
			html += "					<button type='button' class='btn_toggle_alarm_set_box'></button>";
			html += "				</div>";
			html += "				<div class='set_box_ul'>";
			
			/*html += "					<div class='set_box_hd_li'>";
			html += "						<div class='set_box_title_wrap' data-tooltip='system_all'>";
			html += "							<div class='set_box_title_txt'>전체 알림</div>";
			//html += "							<div class='set_box_tooltip'></div>";
			html += "						</div>";
			html += "						<div class='all_mng_toggle_wrap system_all on' data-code='sys_all_alarm'>";
			html += "							<span class='toggle'></span>";
			html += "						</div>";
			html += "					</div>";*/
			
			html += "					<div id='pc_system_menu_list' class='set_box_ul_depth2'></div>";

			html += "				</div>";
			html +=	"			</div>";
			
			//////////// 메일 알림 차단 설정 ///////////////
/*			// K-Portal ONE 에서는 사용 안함 - 2025.04.25
			html += "			<div id='alarm_set_box_mail' class='alarm_set_box mail'>";
			html += "				<div class='title_wrap'>";
			html += "					<div class='title'>" + gap.lang.set_block_mail_alarm + "</div>";
			html += "					<button type='button' class='btn_toggle_alarm_set_box'></button>";
			html += "				</div>";
			html += "				<div class='set_box_ul'>";
			html += "					<div class='set_box_content'>";
			html += "						<div class='set_box_top flex_end'>";
		//	html += "							<select class='set_box_selectbox'>";
		//	html += "								<option>" + gap.lang.all + "</option>";
		//	html += "							</select>";
			html += "							<button type='button' id='btn_alarm_unblock' class='btn_unblock'>" + gap.lang.unblock + "</button>";
			html += "						</div>";
			
			////////////// 메일 알림 차단 테이블 /////////////
			html += "						<div id='alarm_blocked_list' class='alarm_blocked_table'>";
			html += "							<div class='tr'>";
			html += "								<div class='th'></div>";
			html += "								<div class='th date'>" + gap.lang.block_date + "</div>";
			html += "								<div class='th type'>" + gap.lang.type + "</div>";
			html += "								<div class='th'>" + gap.lang.desc + "</div>";
			html += "							</div>";
			html += "						</div>";
			////////////// 메일 알림 차단 테이블 /////////////
			
			html += "					</div>";
			html += "				</div>";
			html +=	"			</div>";*/
		
		}
		
		html +=	"		</div>";
		html += "	</div>";
		html += "</div>";
		
		html = $(html);
		
		$("#popup_alarm_preferences").remove();
		$("#wrap_alarm").append(html);
		
		// 알림차단 데이터 가져오기
		var url = gap.rp + "/" + mailfile + "/JSON_AlarmBlock?readviewentries&collapseview&count=1000&outputformat=json&" + (new Date()).getTime().toString(16);
		$.ajax({
			type: "GET",
			url: url,
			success: function(data){
				try {
					var _created, _target, _content, _opt;
					
					if(data["@toplevelentries"] == "0") {
						$("#alarm_blocked_list").hide();
						var html = "";
						html += "<div id='empty_alarm_block_box'>";
						html += "	<span class='guide_ico'></span>";
						html += "	<span class='msg_txt'>" + gap.lang.not_found_blocked_mail + "</span>";
						html += "</div>";
						$("#btn_alarm_unblock").hide();
						$("#alarm_set_box_mail .set_box_top").after(html);
						return;
					}
					
					$.each(data.viewentry, function(i,item){
						_created = item.entrydata[0].text["0"].replace(/\n|\r|\n\r/g, "");
						_target = item.entrydata[1].text["0"].replace(/\n|\r|\n\r/g, "");
						_content = item.entrydata[2].text["0"].replace(/\n|\r|\n\r/g, "");
						_opt = item.entrydata[3].text["0"].replace(/\n|\r|\n\r/g, "");

						if (_target == "email"){
							_target = gap.lang.sender_email;
						}else if (_target == "domain"){
							_target =  gap.lang.sender_domain;
						}else if (_target == "title"){
							_target =  gap.lang.title;
						}

						var html = "";
						
						html += "<div class='tr' id='alarm_block_" + item["@unid"] + "'>";
						html += "	<div class='td'><input type='checkbox' id='chk_box_" + i + "'name='ckAlarmBlock' value='" + item["@unid"] + "'>";
						html += "		<label for='chk_box_" + i + "'></label>";
						html += "	</div>";
						html += "	<div class='td date'>" + _created + "</div>";
						html += "	<div class='td type'>" + _target + "</div>";
						html += "	<div class='td content'>" + _content + "</div>";
						html += "</div>";						

						$("#alarm_blocked_list").append(html);
					});

				}catch(e) {}
			},
			error: function(data){
				console.log(data);
			}
		});

		/// 환경설정 저장값 불러오기
		gAenv.load_alarm_preferences();
		
		/// 차단해제 버튼 처리
		$("#btn_alarm_unblock").off().on("click", function(){
			var check_url = root_path + "/kwa01/sso.nsf/check.txt?open&ver="+new Date().getTime();
			$.ajax({
				type : "GET",
				url : check_url,
				success : function(res){
					if (res == "OK"){
						var checkItem = [];
						$("input[name=ckAlarmBlock]:checked").each(function() {
							checkItem.push($(this).val());
						});

						if (checkItem.length == 0){
							mobiscroll.toast({message:gap.lang.select_release_doc, color:'danger'});
							return false;	
						}

						var inputdata = {
							"__Click" : "0"
							,"Action" : "deletealarmblock"
							,"OrgUnid" : checkItem.join(",")
						};

						// 알림차단설정 저장
						var _url = gap.rp + "/" + mailfile +'/process_action?OpenForm';
						$.ajax({
							type : "POST",
							cache: false,
							async : true,
							url : _url,
							data : inputdata,
							dataType: 'html',
							success : function(data){
								var json_data = eval("("+data+")");
								if (json_data.status == "true"){
									$.each(checkItem, function(idx, unid){
										$("#alarm_block_" + unid).remove();
									});

									// 데이터가 없을 때
									if ($("#alarm_blocked_list").find(".tr").length == 1){
										/*var html = "";
										$("#alarm_blocked_list").append(html);*/
										
										$("#alarm_blocked_list").hide();
										
										var html = "";
										html += "<div id='empty_alarm_block_box'>";
										html += "	<span class='guide_ico'></span>";
										html += "	<span class='msg_txt'>" + gap.lang.not_found_blocked_mail + "</span>";
										html += "</div>";
										
										$("#alarm_set_box_mail .set_box_top").after(html);
										$("#btn_alarm_unblock").hide();
									}
								}
							},
							error: function (x) {
								 //gap.error_alert();
							}
						});						
					}else{
						// 세션이 끝났을 때 dsw.exe로 세션 갱신 요청
						window.chrome.webview.postMessage('{"type":"session", "stype":"refresh"}');
					}
				},
				error : function(e){
				}
			});
		});
	},
	
	//// 환경설정 이벤트 함수 //////
	"alarm_preferences_event_bind": function(){
		
		///// 환경설정 표시 /////////
		$("#popup_alarm_preferences").animate({
			"left": 0
		},300);

		
		/// 메일 알람 차단 설정에 스크롤이 없는 경우 패딩을 없앤다.
/*		if ( !is_mobile && $("#alarm_set_box_mail .alarm_blocked_table")[0].scrollHeight <= 
		$("#alarm_set_box_mail .alarm_blocked_table")[0].clientHeight.clientHeight) {
			$("#alarm_set_box_mail .alarm_blocked_table").css({
				"padding-right": 0
			});
        }*/
		
		/*	
		$("#popup_alarm_preferences .alarm_set_box.bymenu .set_box_ul," +
			"#popup_alarm_preferences .alarm_set_box.system .set_box_ul," +
			"#popup_alarm_preferences .alarm_set_box.mail .alarm_blocked_table").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable: false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : true,
			callbacks : {
			}
		});
		*/
		///// 환경설정 닫기 /////////
		$("#btn_close_preferences").off().on("click", function(){

			var search_key = ["fst", "nst", "pst"];

			/** 전체 알림 ON/OFF 여부 **/
			// 작업표시줄
			var fsh = gAct.env_data.fsh;
			// 알림창
			var noti = gAct.env_data.noti;
			/// 모바일
			var psh = gAct.env_data.psh;
			
			/** 각 알림 ON/OFF 여부 **/
			// 작업표시줄
			var fst = gAct.env_data.fst;
			// 알림창
			var nst = gAct.env_data.nst;
			// 모바일
			var pst = gAct.env_data.pst;
			
			/// 미확인 건 수 종모양 아이콘 업데이트
			for(var i = 0; i < $("#unread_alarm_list").find(".alarm_li_wrap").length; i++){
				
				var alarm_btn = $("#unread_alarm_list").find(".alarm_li_wrap").eq(i).find(".btn_alarm_toggle");
				var nid = $("#unread_alarm_list").find(".alarm_li").eq(i).data("nid");

				if (fsh === 'N' && noti === 'N' && psh === 'N') {
					if ( fst.includes(nid) && nst.includes(nid) && pst.includes(nid)) {
						/// 해당 알림이 fst, nst, pst 전체에 있을 경우 OFF 해야 함.
						alarm_btn.addClass("off");
					} else {
						if (fst.length === 0 && nst.length === 0 && pst.length === 0) {
						//// 배열 데이터가 []이고, 전체 ON/OFF 데이터가 N인 경우도 OFF (사용자 설정값이 최초에는 배열 데이터가 비어있기 때문)
							alarm_btn.addClass("off");
						} else if ( fst.includes(nid) || nst.includes(nid) || pst.includes(nid) ){
							if (
								    (fst.includes(nid) && nst.length === 0 && pst.length === 0) ||
								    (nst.includes(nid) && fst.length === 0 && pst.length === 0) ||
								    (pst.includes(nid) && fst.length === 0 && nst.length === 0)
								) {
									alarm_btn.addClass("off");
								} else {
									alarm_btn.removeClass("off");
								}
						} else {
							alarm_btn.removeClass("off");
						}
					}
				} else {
					alarm_btn.removeClass("off");
				}
	
			}

			
			///// 사용자가 환경설정을 변경했을 때만 미처리 건 수 새로고침
			if(gAenv.is_sys_change){
				gAct.draw_system_menu_list("refresh");
				gAenv.is_sys_change = false;
			}
			
			$("#popup_alarm_preferences").animate({
				"left": "-100%"
			}, 400, function(){
				$("#popup_alarm_preferences").remove();
			});
		});
		
		/// 환경설정이 있을 때 X버튼 클릭 시 환경설정만 닫는다. 
		if($("#popup_alarm_preferences").length !== 0){
			/*$("#btn_alarm_close").on("click", function(){
				$("#btn_close_preferences").click();
			});*/
		}
		
		/// 메일 알림 차단 설정 안에 리스트, 빈 리스트 아이콘 접어놓기
		$("#alarm_setting_box_wrap .set_box_content").slideUp(0);
		
		///// 각 알림설정 접고펴기 //////
		$("#alarm_setting_box_wrap .alarm_set_box").off().on("click", function(e){
			if($(this).hasClass("taskbar")){
				$(this).find(".set_box_ul").slideToggle(200);
				$(this).find(".btn_toggle_alarm_set_box").toggleClass("open");
			} else {
				$(this).siblings(".alarm_set_box:not(.taskbar)").find(".set_box_ul").slideUp(0);
				$(this).siblings(".alarm_set_box:not(.taskbar)").find(".btn_toggle_alarm_set_box").removeClass("open");
				$(this).find(".set_box_ul").slideToggle(200);
				
				
				if($(this).find(".set_box_ul").is(":visible")){
					$(this).toggleClass("slide");
					$(this).siblings().removeClass("slide");
				}
				
				/// 메일 알림 차단 설정
				if($(this).attr("id") === "alarm_set_box_mail"){
					if($(this).hasClass("slide")){
						// 열었을 때
						$("#alarm_setting_box_wrap .set_box_content").slideDown(200);
					} else {
						// 닫았을 때
						$("#alarm_setting_box_wrap .set_box_content").slideUp(200);
					}
				}
				
				$(this).find(".btn_toggle_alarm_set_box").toggleClass("open");
			}
		});
		$("#alarm_setting_box_wrap .set_box_ul").on("click", function(e){
			e.stopPropagation();
		});
		///// 각 알림설정 접고펴기 //////
		
		$("#alarm_setting_box_wrap .set_box_selectbox").selectmenu({
			change: function( event, ui ) {
			
				var postData = "";
				var value = ui.item.value;
				
				$(this).toggleClass("on");
				
				//// 팝업 알림 주기 설정
				if($(this).attr("id") === "selectbox_alarm_popup_period"){
					
					postData = JSON.stringify({
						chk: parseInt(value)
					});
				}
				//// 알림 창 주기 설정
				if($(this).attr("id") === "selectbox_alarm_chk_use"){
					if(value === "on"){
						postData = JSON.stringify({
							sch: "Y"
						});
						gAct.env_data.sch = "Y";
						
						//일정 10분 전 알림창 체크 함수 호출 - 시작
						gAcal.init();
					} else {
						postData = JSON.stringify({
							sch: "N"
						});
						gAct.env_data.sch = "N";
						
						//일정 10분 전 알림창 체크 함수 호출 - 중지
						clearInterval(gAcal.check_interval);
					}
				}

				gAenv.save_alarm_preferences(postData);
				
			}
		});
		
		////// 메뉴별 알림 전체 토글버튼 /////////
		$("#alarm_set_box_bymenu .all_mng_toggle_wrap").off().on("click", function(e){

			var code = e.currentTarget.dataset.code;
			var postData = "";
			
			var save_data = [];
			var not_select_menu = "";
			
			$(this).toggleClass("on");
			
			/////작업표시줄 
			if($(this).hasClass("taskbar")){
				if($(this).hasClass("on")){
					$(".alarm_set_box.bymenu").find(".set_box_btn.taskbar").html("ON").addClass("active");
				} else {
					$(".alarm_set_box.bymenu").find(".set_box_btn.taskbar").html("OFF").removeClass("active");
				}
			}
			/////알림창
			if($(this).hasClass("popup")){
				if($(this).hasClass("on")){
					$(".alarm_set_box.bymenu").find(".set_box_btn.popup").html("ON").addClass("active");
				} else {
					$(".alarm_set_box.bymenu").find(".set_box_btn.popup").html("OFF").removeClass("active");
				}
			}
			/////모바일
			if($(this).hasClass("mobile")){
				if($(this).hasClass("on")){
					$(".alarm_set_box.bymenu").find(".set_box_btn.mobile").html("ON").addClass("active");
				} else {
					$(".alarm_set_box.bymenu").find(".set_box_btn.mobile").html("OFF").removeClass("active");
				}
			}
			
			if(!$(this).hasClass("on")){
				if($(this).hasClass("taskbar")){
					not_select_menu = $(this).closest(".set_box_ul").find(".set_box_btn.taskbar:not(.active)");
				}
				if($(this).hasClass("popup")){
					not_select_menu = $(this).closest(".set_box_ul").find(".set_box_btn.popup:not(.active)");
				}
				if($(this).hasClass("mobile")){
					not_select_menu = $(this).closest(".set_box_ul").find(".set_box_btn.mobile:not(.active)");
				}
				
				for( var i = 0; i < not_select_menu.length; i++){
					save_data.push(not_select_menu[i].dataset.code);
				}
			}
			

			/** 전체 토글 버튼을 키고 끄면 배열 데이터는 비우는게 개발하는데 편할 것 같아서 배열을 비움. **/
			
			///////// PC 작업표시줄 알림 표시 여부
			if(code === "all_mng_taskbar"){
				if($(this).hasClass("on")){
					postData = JSON.stringify({
						fsh: "Y",
						fst: []
					});
					
					gAct.env_data.fsh = "Y";
					gAct.env_data.fst = [];
				} else {
					postData = JSON.stringify({
						fsh: "N",
						fst: save_data
					});
					
					gAct.env_data.fsh = "N";
					//gAct.env_data.fst = [];
					gAct.env_data.fst = save_data;
				}
			}
			///////// PC 노티 알림 표시 여부
			if(code === "all_mng_noti"){
				if($(this).hasClass("on")){
					postData = JSON.stringify({
						noti: "Y",
						nst: []
					});
					
					gAct.env_data.noti = "Y";
					gAct.env_data.nst = [];
					
				} else {
					postData = JSON.stringify({
						noti: "N",
						nst: save_data
					});
					
					gAct.env_data.noti = "N";
					//gAct.env_data.nst = [];
					gAct.env_data.nst = save_data;
				}
			}
			///////// 모바일 알림 표시 여부
			if(code === "all_mng_mobile"){
				if($(this).hasClass("on")){
					postData = JSON.stringify({
						psh: "Y",
						pst: []
					});	
					
					gAct.env_data.psh = "Y";
					//gAct.env_data.pst = [];
					gAct.env_data.pst = [];
					
				} else {
					postData = JSON.stringify({
						psh: "N",
						pst: save_data
					});
					
					gAct.env_data.psh = "N";
					//gAct.env_data.pst = [];
					gAct.env_data.pst = save_data;
				}
			}
			
			gAenv.save_alarm_preferences(postData);
			
		});
		
		////// 메뉴별 알림 단일 토글 버튼 /////////
		$("#alarm_set_box_bymenu .set_box_btn").off().on("click", function(e){
			
			$(this).toggleClass("active");
			
			var save_data = [];
			var not_select_menu = "";
			
			if($(this).hasClass("taskbar")){
				not_select_menu = $(this).closest(".set_box_ul_depth2").find(".set_box_btn.taskbar:not(.active)");
			}
			if($(this).hasClass("popup")){
				not_select_menu = $(this).closest(".set_box_ul_depth2").find(".set_box_btn.popup:not(.active)");
			}
			if($(this).hasClass("mobile")){
				not_select_menu = $(this).closest(".set_box_ul_depth2").find(".set_box_btn.mobile:not(.active)");
			}
			
			for( var i = 0; i < not_select_menu.length; i++){
				save_data.push(not_select_menu[i].dataset.code);
			}
			
			var postData = "";
			
			if($(this).hasClass("taskbar")){
				var postData = "";
				
				/// 전체선택이 아닐 때
				if(not_select_menu.length !== 0){
					postData = JSON.stringify({
						fst: save_data,
						fsh: "N"
					});
					gAct.env_data.fsh = "N";
					gAct.env_data.fst = save_data;
				} else {
					// 단일 토근 버튼이 모두 켜졌을 때는 전체알림을 ON 시킨다
					postData = JSON.stringify({
						fst: [],
						fsh: "Y"
					});
					gAct.env_data.fsh = "Y";
					gAct.env_data.fst = [];
				}

			}
			if($(this).hasClass("popup")){
				var postData = "";
				
				/// 전체선택이 아닐 때
				if(not_select_menu.length !== 0){
					postData = JSON.stringify({
						nst: save_data,
						noti: "N"
					});
					gAct.env_data.noti = "N";
					gAct.env_data.nst = save_data;
				} else {
					// 단일 토근 버튼이 모두 켜졌을 때는 전체알림을 ON 시킨다
					postData = JSON.stringify({
						nst: save_data,
						noti: "Y"
					});
					gAct.env_data.noti = "Y";
					gAct.env_data.nst = [];
				}
				
			}
			if($(this).hasClass("mobile")){
				var postData = "";
				/// 전체선택이 아닐 때
				if(not_select_menu.length !== 0){
					postData = JSON.stringify({
						pst: save_data,
						psh: "N"
					});
					gAct.env_data.psh = "N";
					gAct.env_data.pst = save_data;
				} else {
					// 단일 토근 버튼이 모두 켜졌을 때는 전체알림을 ON 시킨다
					postData = JSON.stringify({
						pst: save_data,
						psh: "Y"
					});
					gAct.env_data.psh = "Y";
					gAct.env_data.pst = [];
				}
			}

			
			gAenv.save_alarm_preferences(postData);
			
			/////작업표시줄
			if($(this).hasClass("taskbar")){
				if($(".set_box_btn.taskbar").length === $(".set_box_btn.taskbar.active").length){
					//전체가 켜졌을 때
					$(this).html("ON");
					$(this).closest(".set_box_ul").find(".all_mng_toggle_wrap.taskbar").addClass("on");
				} else {
					///전체가 켜진 것은 아닐 때
					if($(this).hasClass("active")){
						$(this).html("ON");
					} else {
						$(this).html("OFF");
					}
					$(this).closest(".set_box_ul").find(".all_mng_toggle_wrap.taskbar").removeClass("on");
				}
				return;
			}
			/////알림창
			if($(this).hasClass("popup")){
				if($(".set_box_btn.popup").length === $(".set_box_btn.popup.active").length){
					//전체가 켜졌을 때
					$(this).html("ON");
					$(this).closest(".set_box_ul").find(".all_mng_toggle_wrap.popup").addClass("on");
				} else {
					///전체가 켜진 것은 아닐 때
					if($(this).hasClass("active")){
						$(this).html("ON");
					} else {
						$(this).html("OFF");
					}
					$(this).closest(".set_box_ul").find(".all_mng_toggle_wrap.popup").removeClass("on");
				}
				return;
			}
			/////모바일
			if($(this).hasClass("mobile")){
				if($(".set_box_btn.mobile").length === $(".set_box_btn.mobile.active").length){
					//전체가 켜졌을 때
					$(this).html("ON");
					$(this).closest(".set_box_ul").find(".all_mng_toggle_wrap.mobile").addClass("on");
				} else {
					///전체가 켜진 것은 아닐 때
					if($(this).hasClass("active")){
						$(this).html("ON");
					} else {
						$(this).html("OFF");
					}
					$(this).closest(".set_box_ul").find(".all_mng_toggle_wrap.mobile").removeClass("on");
				}
				return;
			}
		});
		
/*********** 모바일 메뉴별 알림설정 *********/
		if(is_mobile){
			
			$("#alarm_set_box_bymenu .all_mng_toggle_wrap").off().on("click", function(){
				
				$(this).toggleClass("on");
				
				/// ON/OFF 시스템을 담을 배열
				var save_data = [];
				var not_select_menu = "";
				
				/// 실제로 서버에 전송할 데이터
				var postData = "";
				
				
				if($(this).hasClass("on")){
					
					////// 전체 알림이 켜지면 모든 알림 on
					$(this).closest(".set_box_li_wrap").siblings(".set_box_ul_depth2").find(".set_box_toggle_wrap").addClass("on");
					
					postData = JSON.stringify({
						psh: "Y",
						pst: []
					});
					
					gAct.env_data.psh = "Y";
					gAct.env_data.pst = [];
					
				} else {
					////// 전체 알림이 꺼지면 모든 알림 off
					$(this).closest(".set_box_li_wrap").siblings(".set_box_ul_depth2").find(".set_box_toggle_wrap").removeClass("on");
					
					if($(this).hasClass("mobile")){
						not_select_menu = $(this).closest(".set_box_li_wrap").siblings(".set_box_ul_depth2").find(".set_box_toggle_wrap[data-type=mobile]");
					}
					
					for( var i = 0; i < not_select_menu.length; i++){
						save_data.push(not_select_menu.eq(i)[0].dataset["code"]);
					}
					
					postData = JSON.stringify({
						psh: "N",
						pst: save_data
					});
					
					gAct.env_data.psh = "N";
					gAct.env_data.pst = save_data;
				}
				
				gAenv.save_alarm_preferences(postData);
				
			});
			
			$("#alarm_set_box_bymenu .set_box_toggle_wrap").off().on("click", function(){
				$(this).toggleClass("on");
				
				if($("#alarm_set_box_bymenu .set_box_toggle_wrap").length === $("#alarm_set_box_bymenu .set_box_toggle_wrap.on").length){
					//// 토글의 전체 갯수와 켜진 토글의 갯수가 같으면 전체토글 on
					$("#alarm_set_box_bymenu .all_mng_toggle_wrap").addClass("on");
				} else {
					//// 토글의 전체 갯수와 켜진 토글의 갯수가 다르면 전체토글 off
					$("#alarm_set_box_bymenu .all_mng_toggle_wrap").removeClass("on");
				}
				
				var not_select_menu = $(this).closest(".set_box_ul_depth2").find("[data-type='mobile']:not(.on)");
				
				var save_data = [];
				var postData = "";
				/// 전체선택이 아닐 때
				
				for( var i = 0; i < not_select_menu.length; i++){
					save_data.push(not_select_menu[i].dataset.code);
				}
				
				if(not_select_menu.length !== 0){
					postData = JSON.stringify({
						pst: save_data,
						psh: "N"
					});
					gAct.env_data.pst = save_data;
					gAct.env_data.psh = "N";
				} else {
					// 단일 토근 버튼이 모두 켜졌을 때는 전체알림을 ON 시킨다
					postData = JSON.stringify({
						pst: [],
						psh: "Y"
					});
					gAct.env_data.pst = [];
					gAct.env_data.psh = "Y";
				}
				
				gAenv.save_alarm_preferences(postData);
				
			});
			
		}
/*********** 모바일 메뉴별 알림설정 *********/
		
		//////////// 시스템 알림 설정 전체 토글 ///////////
		$("#alarm_set_box_system .all_mng_toggle_wrap").off().on("click", function(e){
			
			var code = e.currentTarget.dataset.code;
			var postData = "";

			/// 현재 켜져있지 않은 시스템 알림을 찾는다.
			var arr = [];
			
			var unactive_sys = $("#pc_system_menu_list .set_box_toggle_wrap:not(.on)");
			
			for(var i = 0; i < unactive_sys.length; i++){
				arr.push(unactive_sys.eq(i).data('code'));
			}

			$(this).toggleClass("on");

			if($(this).hasClass("on")){
				////// 전체 알림이 켜지면 모든 알림 on
				$("#pc_system_menu_list").find(".set_box_toggle_wrap").addClass("on");
				
				//$(this).closest(".set_box_hd_li").siblings(".set_box_li").find(".set_box_toggle_wrap").addClass("on");
				/*for(var i = 0; i < $("#pc_system_menu_list").find(".set_box_toggle_wrap").length; i++){
					arr.push($("#pc_system_menu_list").find(".set_box_toggle_wrap.on").eq(i).data("code"));

				}*/


				/// 현재 켜져 있는 시스템 목록 배열과 나머지 시스템 배열을 합친다.
				gAenv.sys_order = gAenv.sys_order.concat(arr);
				
				postData = JSON.stringify({
					sys: gAenv.sys_order
				});
				
			} else {
				////// 전체 알림이 꺼지면 모든 알림 off
				//$(this).closest(".set_box_hd_li").siblings(".set_box_li").find(".set_box_toggle_wrap").removeClass("on");
				$("#pc_system_menu_list").find(".set_box_toggle_wrap").removeClass("on");
				
				gAenv.sys_order = [];
				
				postData = JSON.stringify({
					sys: []
				});
			}
			
			// 환경설정 시스템 메뉴 설정이 변경되었으므로 미처리 건 수 새로고침이 필요함
			gAenv.is_sys_change = true;
			gAenv.save_alarm_preferences(postData);
		});
		
		////////////시스템 알림 설정 단일 토글  ///////////
		$("#alarm_set_box_system .set_box_toggle_wrap").off().on("click", function(e){
			var code = e.currentTarget.dataset.code;
			
//			console.log(code);
			
			$(this).toggleClass("on");
			if($("#alarm_set_box_system .set_box_toggle_wrap").length === $("#alarm_set_box_system .set_box_toggle_wrap.on").length){
				////토글의 전체 갯수와 켜진 토글의 갯수가 같으면 전체토글 on
				$("#alarm_set_box_system .all_mng_toggle_wrap").addClass("on");
			} else {
				////토글의 전체 갯수와 켜진 토글의 갯수가 다르면 전체토글 off
				$("#alarm_set_box_system .all_mng_toggle_wrap").removeClass("on");
			}
			
			if($(this).hasClass("on")){
				/// 활성화했을 때는 배열의 끝에 추가
				gAenv.sys_order.push(code);
			} else {
				/// 비활성화했을 때는 원래의 시스템 순서배열에서 해당 시스템만 찾아서 제거
				gAenv.sys_order = gAenv.sys_order.filter(item => item !== code);
			}
			
			/// 
			
			/*			
			var arr = [];
			for(var i = 0; i < $("#pc_system_menu_list").find(".set_box_toggle_wrap.on").length; i++){
				arr.push($("#pc_system_menu_list").find(".set_box_toggle_wrap.on").eq(i).data("code"));
			}
			*/

			postData = JSON.stringify({
				sys: gAenv.sys_order
			});
			
			// 환경설정 시스템 메뉴 설정이 변경되었으므로 미처리 건 수 새로고침이 필요함
			gAenv.is_sys_change = true;
			gAenv.save_alarm_preferences(postData);
		});
		
		
/***************** 툴팁 이벤트 *****************/
		$("#alarm_setting_box_wrap .btn_tooltip").on("mouseenter", function(e){
			if($(e.target)[0].classList[0] === "set_box_tooltip" ||
				$(e.target)[0].classList[0] === "set_box_title_txt"){
//////////// 마우스를 올린 대상이 툴팁의 이름 또는 아이콘이더라도 항상 감싸는 영역을 target으로 잡는다. ////
				e.target = $(this)[0];
			}
			
			var rect = e.target.getBoundingClientRect();
			// 요소의 중앙 좌표 계산
			var centerX = rect.left + rect.width / 2;
			var centerY = rect.top + rect.height / 2;
			var pos = [centerX, centerY];

			var type = $(this).data("tooltip");
			
			var $this = $(this);
			gAenv.draw_tooltip(type, $this, pos);
		
		});
		$("#alarm_setting_box_wrap .btn_tooltip").on("mouseleave", function(){
			$("#alarm_preferences_tooltip").remove();
		});
		
	},
	
	////알림센터 환경설정 저장 API 호출하는 함수
	"save_alarm_preferences": function(postData, refreshChk, bell_data){

		var url = "";
		
		// 종모양으로 저장했는지 여부 -> true일때
		var is_bell = "";
		// 종모양 클릭한 알림
		var bell_target = "";
		
		/// 종의 ON/OFF 여부
		var bell_on = "";
		
		///	벨을 눌렀을 때
		if(bell_data !== undefined){
			is_bell = bell_data[0];
			bell_target = bell_data[1];
			bell_on = !bell_target.hasClass("off");
		}
		
		if(is_bell){
			// 메인에서 종모양 버튼으로 저장할 때 
			url = gap.rp + "/noti/config/user/alarm-set";
		} else {
			// 환경설정 사용자 설정값 호출
			url = gap.rp + "/noti/config/user";
		}
		
		//console.log("body: " + postData);
		//console.log("url: " + url);
		//console.log("jwt: " + gap.get_auth());
		
		var check_url = root_path + "/kwa01/sso.nsf/check.txt?open&ver="+new Date().getTime();
		$.ajax({
			type : "GET",
			url : check_url,
			success : function(res){
				if (res == "OK"){
					$.ajax({
						type : "POST",
						url : url,
						xhrFields : {
							withCredentials : true
						},
						data : postData,
						dataType : "json",
						beforeSend : function(xhr){
							xhr.setRequestHeader("auth", gap.get_auth());
							xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
						},
						success : function(res){
							var data = res.ct;
							
							//순서편집에서 저장하면 미처리 건 수 업데이트
							if(refreshChk === "refresh"){
								gAct.draw_system_menu_list("refresh");
							}
							
							//console.log(res);
							/** 메인 종모양 아이콘으로 알림을 설정했을 때 **/
							/// 툴팁 표시에 필요한 데이터 업데이트
							if(is_bell){
								gAct.env_data.fsh = data.fsh;
								gAct.env_data.fst = data.fst;
								gAct.env_data.noti = data.noti;
								gAct.env_data.nst = data.nst;
								gAct.env_data.psh = data.psh;
								gAct.env_data.pst = data.pst;
								
								if(bell_on){
									/// 이때는 아이콘 스케일이 변하기 때문에 우측으로 2px 움직여야 종모양 아래 중앙에 배치됨. 
									gAct.draw_main_alarm_bell_tooltip(bell_target);
								} else {
									$("#alarm_li_bell_tooltip").remove();
									// OFF 일때는 기존 데이터에서 해당 알림만 추가한다.
								}
							}
						},
						error : function(e){
						}
					});					
				}else{
					// 세션이 끝났을 때 dsw.exe로 세션 갱신 요청
					window.chrome.webview.postMessage('{"type":"session", "stype":"refresh"}');
				}
			},
			error : function(e){
			}
		});
	},
	
	//// 환경설정 목록 리스트 데이터 불러오는 함수
	"load_preferences_list_data": function(){
		
		var dfd = $.Deferred();
		
		var surl = gap.channelserver + "/api/portal/alarmcenter_list.km";
		var postData = {
		      "start" : 0,
		      "perpage" : 100,
		      "query" : "",
		      "admin" : ""
		   };

		$.ajax({
		   type : "POST",
		   url : surl,
			xhrFields : {
				withCredentials : true
			},
		   dataType : "text",   //"json",
		   data : JSON.stringify(postData),
		   //async: false,
		   beforeSend : function(xhr){
		      xhr.setRequestHeader("auth", gap.get_auth());
		      xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
		   },
		   success : function(__res){
			   var res = __res;
			   dfd.resolve(res);
			  
		      /*var _list = res.data.response;
		      
		      for (var i = 0; i < _list.length; i++){
		         // 여기에 리스트를 처리
		      }*/
		   },
		   error : function(e){
			  dfd.reject(e);
		      return false;
		   }
		});
		
		return dfd.promise();
	},
	
//// 알림센터 환경설정 설정값 데이터 불러오는 함수
	"load_alarm_preferences": function(){
		var dfd = $.Deferred();		
		var url = gap.rp + "/noti/config/user";
		
		 $.ajax({
	         type : "GET",
	         url : url,
			 xhrFields : {
				withCredentials : true
			 },
	         dataType : "json",
	         beforeSend : function(xhr){
	            xhr.setRequestHeader("auth", gap.get_auth());
	        //    xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
	         },
	         success : async function(res){

	        	 gAct.env_data = res.ct;
	        	 
	       // 	 console.log(res);
	        	 
	        	 var data = res.ct;

	        	 if(gAenv.sys_order === ""){
	        		 gAenv.sys_order = data.sys;
	        	 }
	        	 
	        	 var chk_html = "";
	        	 var sch_html = "";
	        	 
	        	 /**** PC 에서만 표시 ****/
	        	 if(!is_mobile){
	        		 /// 팝업 알림 주기 설정
	        		 
	        		 /**** 사용 안함 ****/
	        		 if(data.chk === 0){
		        		 chk_html += "<option value='0' selected>" + gap.lang.not_use + "</option>";
		        	 } else {
		        		 chk_html += "<option value='0'>" + gap.lang.not_use + "</option>";
		        	 }
	        		 /**** 사용 안함 ****/
	        		 
	        		 /**** 테스트 용 ****/
	        		 /*if(data.chk === 3){
	        			 chk_html += "<option value='3' selected>3분(테스트용)</option>";
	        		 } else {
	        			 chk_html += "<option value='3'>3분(테스트용)</option>";
	        		 }*/
	        		 /**** 테스트 용 ****/
	        		 
	        		 if(data.chk === 30){
	        			 chk_html += "<option value='30' selected>" + gap.lang.thirty_min + "</option>";
	        		 } else {
	        			 chk_html += "<option value='30'>" + gap.lang.thirty_min + "</option>";
	        		 }
	        		 if(data.chk === 60){
	        			 chk_html += "<option value='60' selected>" + gap.lang.one_hour + "</option>";
	        		 } else {
	        			 chk_html += "<option value='60'>" + gap.lang.one_hour + "</option>";
	        		 }
	        		 if(data.chk === 120){
	        			 chk_html += "<option value='120' selected>" + gap.lang.two_hour + "</option>";
	        		 } else {
	        			 chk_html += "<option value='120'>" + gap.lang.two_hour + "</option>";
	        		 }
	        		 if(data.chk === 180){
	        			 chk_html += "<option value='180' selected>" + gap.lang.three_hour + "</option>";
	        		 } else {
	        			 chk_html += "<option value='180'>" + gap.lang.three_hour + "</option>";
	        		 }
	        		 
	        		 $("#selectbox_alarm_popup_period").append(chk_html);
	        		 
	        		 /// 알림창 주기 설정
	        		 if(data.sch === "N"){
	        			 sch_html += "<option value='off' selected>" + gap.lang.not_selected + "</option>";
	        			 sch_html += "<option value='on'>" + gap.lang.selected + "</option>";
	        		 } else {
	        			 sch_html += "<option value='off'>" + gap.lang.not_selected + "</option>";
	        			 sch_html += "<option value='on' selected>" + gap.lang.selected + "</option>";
	        		 }
	        		 
	        		 $("#selectbox_alarm_chk_use").append(sch_html);
	        		 
	        	 }
	        	 /**** PC 에서만 표시 ****/
	        	 
	        	 
	        	 /// 환경설정 목록 리스트 불러온다.
	        	 var list = await gAenv.load_preferences_list_data();

	        	 //메뉴별 알림
	        	 var bymenu_arr = list.data.response.filter(function(data) {
	        		    return data.alarm_sys === "T";
	        	 });
	        	 
	        	 ///시스템 알림
	        	 var sys_arr = list.data.response.filter(function(data) {
	        		    return data.unprocessed_sys === "T"; // 3이 아닌 값만 유지
	        	 });

/*************************** 메뉴별 알림 설정 ***************************/
/**************** PC ********************/
//////// 전체 알림 ///////////
	        	 if(!is_mobile){
	        		var html = "";
	        		
	        		if(data.fsh === "Y"){
	        			html += "<div class='all_mng_toggle_wrap taskbar on' data-code='all_mng_taskbar'>";
		        	} else if(data.fsh === "N"){
		        		html += "<div class='all_mng_toggle_wrap taskbar' data-code='all_mng_taskbar'>";
		        	}
	     			html += "	<span class='toggle'></span>";
	     			html += "</div>";
	     			html += "<div class='vertical_bar'></div>";
	     			
	     			if(data.noti === "Y"){
	     				html += "<div class='all_mng_toggle_wrap popup on' data-code='all_mng_noti'>";
	     			} else if(data.noti === "N"){
	     				html += "<div class='all_mng_toggle_wrap popup' data-code='all_mng_noti'>";
	     			}
	     			html += "		<span class='toggle'></span>";
	     			html += "	</div>";
	     			html += "	<div class='vertical_bar'></div>";
	     			
	     			if(data.psh === "Y"){
	     				html += "<div class='all_mng_toggle_wrap mobile on' data-code='all_mng_mobile'>";
	     			} else if(data.psh === "N"){
	     				html += "<div class='all_mng_toggle_wrap mobile' data-code='all_mng_mobile'>";
	     			}
	     			html += "		<span class='toggle'></span>";
	     			html += "	</div>";
	     			
	     			$("#set_all_pc").empty();
	     			$("#set_all_pc").append(html);

	     		} else {
/**************** 모바일 ********************/
	     			var html = "";
	     			
	     			if(data.psh === "Y"){
	     				html += "<div class='all_mng_toggle_wrap mobile on'>";
	     			} else if(data.psh === "N"){
	     				html += "<div class='all_mng_toggle_wrap mobile'>";
	     			}
	     			html += "	<span class='toggle'></span>";
	     			html += "</div>";
	     			
	     			$("#set_all_mobile").empty();
	     			$("#set_all_mobile").append(html);

	     		}
/////////// 전체 알림 ///////////
	        	 
//////// 개별 알림 ///////////
	        	 var bymenu = "";
	        	 
	        	 var sys_name = "";
	        	 
	        	 for(var i = 0; i < bymenu_arr.length; i++){
	        		 
	        		 
	        		 bymenu += "					<div class='set_box_li'>";
	        		 bymenu += "						<div class='set_box_title_wrap'>";
	        		 
	        		 
	        		 if(gap.curLang === "ko"){
	        			 sys_name = bymenu_arr[i].nm;
	        		 } else {
	        			 sys_name = bymenu_arr[i].enm;
	        		 }
	        		 
	        		 bymenu += "							<div class='set_box_title_txt' title='" + sys_name + "'>" + sys_name + "</div>";
	        		 bymenu += "						</div>";
	        		 bymenu += "						<div class='set_box_btn_wrap'>";
	        		 
	        		 if(!is_mobile){
/**************** PC ********************/
	        			 
	        			 //// 작업표시줄 ////
	        			 if(data.fsh === "Y"){
	        				 //전체 ON
	        				 //bymenu += "<button type='button' class='set_box_btn active taskbar for_pc' data-type='taskbar' data-code='" + bymenu_arr[i].noti_id + "'>" + gap.lang.taskbar + "</button>";
	        				 bymenu += "<button type='button' class='set_box_btn active taskbar for_pc' data-type='taskbar' data-code='" + bymenu_arr[i].noti_id + "'>ON</button>";
	        			 } else if(data.fsh === "N"){
	        				 // 일부만 ON
	        				 
	        				 /// 겹치는 알림 판별
	        				 var chk_arr = data.fst.filter(function(value) {
	        					 return bymenu_arr[i].noti_id.includes(value);
        					 });
	        				 
	        				 //if(chk_arr.length > 0 || data.fst.length === 0){
	        				 if(chk_arr.length > 0 || data.fst.length === 0){
	        					 /// 비활성화할 알림
	        					 bymenu += "<button type='button' class='set_box_btn taskbar for_pc' data-type='taskbar' data-code='" + bymenu_arr[i].noti_id + "'>OFF</button>";
	        					 //bymenu += "<button type='button' class='set_box_btn taskbar for_pc' data-type='taskbar' data-code='" + bymenu_arr[i].noti_id + "'>" + gap.lang.taskbar + "</button>";
	        				 } else {
	        					 bymenu += "<button type='button' class='set_box_btn taskbar active for_pc' data-type='taskbar' data-code='" + bymenu_arr[i].noti_id + "'>ON</button>";
	        					 //bymenu += "<button type='button' class='set_box_btn taskbar active for_pc' data-type='taskbar' data-code='" + bymenu_arr[i].noti_id + "'>" + gap.lang.taskbar + "</button>";
	        				 }
	        			 }
	        			 
	        			 //// 알림창 ////
	        			 if(data.noti === "Y"){
	        				//전체 ON
	        				 //bymenu += "<button type='button' class='set_box_btn active popup for_pc' data-type='noti' data-code='" + bymenu_arr[i].noti_id + "'>" + gap.lang.noti + "</button>";
	        				 bymenu += "<button type='button' class='set_box_btn active popup for_pc' data-type='noti' data-code='" + bymenu_arr[i].noti_id + "'>ON</button>";
	        			 } else if(data.noti === "N"){
	        				// 일부만 ON
	        				 
	        				/// 겹치는 알림 판별
	        				 var chk_arr = data.nst.filter(function(value) {
	        					    return bymenu_arr[i].noti_id.includes(value);
	        					});

	        				 /// 비활성화할 알림이 있다면 chk_arr의 length는 0이 아니다.
	        				 //if(chk_arr.length > 0 || data.nst.length === 0){
	        				 if(chk_arr.length > 0 || data.nst.length === 0){
	        					 //bymenu += "<button type='button' class='set_box_btn popup for_pc' data-type='noti' data-code='" + bymenu_arr[i].noti_id + "'>" + gap.lang.noti + "</button>";
	        					 bymenu += "<button type='button' class='set_box_btn popup for_pc' data-type='noti' data-code='" + bymenu_arr[i].noti_id + "'>OFF</button>";
	        				 } else {
	        					 //bymenu += "<button type='button' class='set_box_btn popup active for_pc' data-type='noti' data-code='" + bymenu_arr[i].noti_id + "'>" + gap.lang.noti + "</button>";
	        					 bymenu += "<button type='button' class='set_box_btn popup active for_pc' data-type='noti' data-code='" + bymenu_arr[i].noti_id + "'>ON</button>";
	        				 }
	        			 }
	        			 
	        			 //// 모바일 ////
	        			 if(data.psh === "Y"){
	        				//전체 ON
	        				 //bymenu += "<button type='button' class='set_box_btn active mobile for_pc' data-type='mobile' data-code='" + bymenu_arr[i].noti_id + "'>" + gap.lang.mobile + "</button>";
	        				 bymenu += "<button type='button' class='set_box_btn active mobile for_pc' data-type='mobile' data-code='" + bymenu_arr[i].noti_id + "'>ON</button>";
	        			 } else if(data.psh === "N"){
	        				// 일부만 ON
	        				 
	        				/// 겹치는 알림 판별
	        				 var chk_arr = data.pst.filter(function(value) {
	        					    return bymenu_arr[i].noti_id.includes(value);
	        					});

	        				 /// 비활성화할 알림이 있다면 chk_arr의 length는 0이 아니다.
	        				 //if(chk_arr.length > 0 || data.pst.length === 0){
	        				 if(chk_arr.length > 0 || data.pst.length === 0){
	        					 //bymenu += "<button type='button' class='set_box_btn mobile for_pc' data-type='mobile' data-code='" + bymenu_arr[i].noti_id + "'>" + gap.lang.mobile + "</button>";
	        					 bymenu += "<button type='button' class='set_box_btn mobile for_pc' data-type='mobile' data-code='" + bymenu_arr[i].noti_id + "'>OFF</button>";
	        				 } else {
	        					 //bymenu += "<button type='button' class='set_box_btn mobile active for_pc' data-type='mobile' data-code='" + bymenu_arr[i].noti_id + "'>" + gap.lang.mobile + "</button>";
	        					 bymenu += "<button type='button' class='set_box_btn mobile active for_pc' data-type='mobile' data-code='" + bymenu_arr[i].noti_id + "'>ON</button>";
	        				 }
	        				 
	        			 }
	        			 
	        		 } else {
/**************** 모바일 ********************/
	        			 if(data.psh === "Y"){
	        				 bymenu += "<div class='set_box_toggle_wrap on' data-type='mobile' data-code='" + bymenu_arr[i].noti_id + "'>";
	        			 } else if(data.psh === "N"){
	        				/// 겹치는 알림 판별
	        				 var chk_arr = data.pst.filter(function(value) {
	        					 return bymenu_arr[i].noti_id.includes(value);
	        				 });

	        				 /// 비활성화할 알림이 있다면 chk_arr의 length는 0이 아니다.
	        				 if(chk_arr.length > 0 || data.pst.length === 0){
	        					 bymenu += "<div class='set_box_toggle_wrap' data-type='mobile' data-code='" + bymenu_arr[i].noti_id + "'>";
	        				 } else {
	        					 bymenu += "<div class='set_box_toggle_wrap on' data-type='mobile' data-code='" + bymenu_arr[i].noti_id + "'>";
	        				 }
	        			 }
	        			 bymenu += "		<span class='toggle'></span>";
	        			 bymenu += "	</div>";
	        			 
	        		 }
	        		 
	        		 bymenu += "						</div>";
	        		 bymenu += "					</div>";
	        	 }
/*************************** 메뉴별 알림 설정 ***************************/

	        	 
/*************************** 시스템 알림 설정 ***************************/
	        	 var sys_menu = "";
	        	 
	        	 // 전체알림
	        	 sys_menu += "					<div class='set_box_hd_li'>";
	        	 sys_menu += "						<div class='set_box_title_wrap' data-tooltip='system_all'>";
	        	 sys_menu += "							<div class='set_box_title_txt' title='" + gap.lang.all_alarm + "'>" + gap.lang.all_alarm + "</div>";
	        	 //sys_menu += "							<div class='set_box_tooltip'></div>";
	        	 sys_menu += "						</div>";
	        	 
	        	 /// ON상태의 시스템 수와 총 시스템 수의 수가 같으면 전체 활성화
	        	 if(data.sys.length === sys_arr.length){
	        		 sys_menu += "						<div class='all_mng_toggle_wrap system_all on' data-code='sys_all_alarm'>";
	        	 } else {
	        		 sys_menu += "						<div class='all_mng_toggle_wrap system_all' data-code='sys_all_alarm'>";
	        	 }

	        	 sys_menu += "							<span class='toggle'></span>";
	        	 sys_menu += "						</div>";
	        	 sys_menu += "					</div>";
	        	 
	        	 for(var i = 0; i < sys_arr.length; i++){
	        		 
	        		 if(gap.curLang === "ko"){
	        			 sys_name = sys_arr[i].nm;
	        		 } else {
	        			 sys_name = sys_arr[i].enm;
	        		 }
	        		 
	        		 sys_menu += "					<div class='set_box_li'>";
	        		 sys_menu += "						<div class='set_box_title_wrap'>";
	        		 sys_menu += "							<div class='set_box_title_txt'>" + sys_name + "</div>";
	        		 sys_menu += "						</div>";
	        		 
	        		 /// 겹치는 알림 판별
    				 var chk_arr = data.sys.filter(function(value) {
    					 return sys_arr[i].noti_id.includes(value);
    				 });
    				 
    				 /// chk_arr에 들어가는 알림은 활성화
    				 if(chk_arr.length > 0){
    					 sys_menu += "<div class='set_box_toggle_wrap on' data-code='" + sys_arr[i].noti_id + "'>";
    				 } else {
    					 sys_menu += "<div class='set_box_toggle_wrap' data-code='" + sys_arr[i].noti_id + "'>";
    				 }

	        		 sys_menu += "							<span class='toggle'></span>";
	        		 sys_menu += "						</div>";
	        		 sys_menu += "					</div>";
	        	 }
	        	 
//////// 개별 알림 ///////////
	        	 
	        	 /// PC
	        	 if(!is_mobile){
	/**************** PC ********************/
	        		 /// 메뉴별 알림 설정 리스트
	        		 $("#pc_bymenu_alarm_list").append(bymenu);
	        		 $("#pc_system_menu_list").append(sys_menu);
	        		 
	        	 } else {
	/**************** 모바일 ********************/	        		
	        		 $("#mobile_bymenu_alarm_list").append(bymenu);
	        	 }

	        	 gAenv.alarm_preferences_event_bind();
	        	 
	         },
	         error : function(e){
	            //gap.error_alert();
	            if(gAenv.sys_order === ""){
	     			 dfd.reject(e);
	        	 }
	         }
	     });
	},
	
	//// 환경설정 툴팁 그리는 함수
	"draw_tooltip": function(type, $this, pos){		
		
		var html = "";
		var content = "";
		
		//// 툴팁 위치 변수
		var tooltip_posX = "";
		var tooltip_posY = "";
		
		//툴팁 꼬리 위치
		var tail_pos = "";
		
		//////// type → content 변환

		if(type === "alarm_popup"){
			tooltip_posX = "left";
			tooltip_posY = "";
			
			tail_pos = "top";
			
			content += "<div class='tooltip_desc'>" + gap.lang.set_popup_cycle_tooltip + "</div>";
			content += "<div class='tooltip_content' style='";
			content += "	background-image: url(" + root_path + "/resource/images/alarm_center/tooltip_alarm_popup2.png);";
			if(is_mobile){
				content += "	width: 242px;";
			} else {
				content += "	width: 242px;";
			}
			content += "	height: 120px;";
			content += "'>";
			content	+= "</div>";
		}
		if(type === "alarm_noti"){
			tooltip_posX = "left";
			tooltip_posY = "";
			
			tail_pos = "top";
			
			content += "<div class='tooltip_desc'>";
			content +=		gap.lang.set_noti_cycle_tooltip_1 + "<br>" + gap.lang.set_noti_cycle_tooltip_2 
			content += "</div>";
			content += "<div class='tooltip_content' style='";
			content += "	background-image: url(" + root_path + "/resource/images/alarm_center/tooltip_noti2.png);";
			content += "	width: 206px;";
			content += "	height: 120px;";
			content += "'></div>";
		}

		if(type === "taskbar"){
			tooltip_posX = "center";
			
			tail_pos = "bot";
			
			content += "<div class='tooltip_desc'>" + gap.lang.taskbar + "</div>";
			content += "<div class='tooltip_content' style='";
			content += "	background-image: url(" + root_path + "/resource/images/alarm_center/tooltip_taskbar2.png);";
			content += "	width: 208px;";
			content += "	height: 120px;";
			content += "'></div>";
			content += "<div class='tooltip_desc'>" + gap.lang.taskbar_tooltip + "</div>";
		}
		if(type === "popup"){
			tooltip_posX = "center";
			
			tail_pos = "bot";
			
			content += "<div class='tooltip_desc'>" + gap.lang.noti + "</div>";
			content += "<div class='tooltip_content' style='";
			content += "	background-image: url(" + root_path + "/resource/images/alarm_center/tooltip_noti_window2.png);";
			content += "	width: 206px;";
			content += "	height: 120px;";
			content += "'></div>";
			content += "<div class='tooltip_desc'>" + gap.lang.noti_tooltip + "</div>";
		}
		if(type === "mobile"){
			tooltip_posX = "center";
			
			tail_pos = "bot";
			
			content += "<div class='tooltip_desc'>" + gap.lang.mobile + "</div>";
			content += "<div class='tooltip_content' style='";
			content += "	background-image: url(" + root_path + "/resource/images/alarm_center/tooltip_mobile2.png);";
			content += "	width: 100px;";
			content += "	height: 128px;";
			content += "'></div>";
			content += "<div class='tooltip_desc'>" + gap.lang.mobile_tooltip + "</div>";
		}

		html += "<div id='alarm_preferences_tooltip' class='tail_" + tail_pos + "'>";
		html += 	content;
		html += "</div>";
		
		//////// 콤보박스가 열린상태에서 툴팁을 띄웠을 경우 /////
		//////// body에 append해야 툴팁이 콤보박스 위에 위치 ////////
		$("body").append(html);

		if(tooltip_posX === "left"){
			if(type !== "alarm_noti"){
				if(type === "alarm_popup"){
					/// 팝업 알림 주기 설정
					tooltip_posX = pos[0] * 2 + 29;
					tooltip_posY = pos[1] - $("#alarm_preferences_tooltip").outerHeight() + 30;	
				}
			} else {
				/// 알림창 주기 설정
				tooltip_posX = pos[0] * 2 + 22;
				tooltip_posY = pos[1] - $("#alarm_preferences_tooltip").outerHeight() + 25;
			}
			tooltip_posX = pos[0] * 2 + 30;
			tooltip_posY = pos[1] - $("#alarm_preferences_tooltip").outerHeight() + 20;
		}
		if(tooltip_posX === "center"){
			tooltip_posX = pos[0] - 5;
			
			if(type !== "mobile"){
				tooltip_posY = pos[1] - $("#alarm_preferences_tooltip").outerHeight() - 16;
			} else {
				tooltip_posY = pos[1] - $("#alarm_preferences_tooltip").outerHeight() - 8;
			}
		}

		//마우스 커서가 위치한 태그의 중앙지점에 툴팁을 위치시킨다.
		$("#alarm_preferences_tooltip").css({
			"left": tooltip_posX,
			//// 콘텐츠의 높이에 따라 위치 조정
			"top": tooltip_posY
		});
		
		/// 모바일
		if(is_mobile){
			
			/// 팝업 알림 주기 설정
			if(type === "alarm_popup"){
				$("#alarm_preferences_tooltip").css({
					"left": "194px",
					"top": "4px",
					"max-width": "262px"
				});
			}
			/// 알림창 주기 설정
			if(type === "alarm_noti"){
				$("#alarm_preferences_tooltip").css({
					"left": "170px",
					"top": "60px",
					"width": "226px",
					"max-width": "226px"
				});
			}
			
		} else {
			/// PC
			/// 팝업 알림 주기 설정
			//if(type === "alarm_popup" || type === "alarm_noti"){
			if(type === "alarm_popup"){
				$("#alarm_preferences_tooltip").css({
					"top": "4px",
					"max-width": "262px"
				});
			}
			/// 알림창 주기 설정
			if(type === "alarm_noti"){
				$("#alarm_preferences_tooltip").css({
					//"left": "171px",
					"left": tooltip_posX - 8,
					"top": "60px",
					"max-width": "226px"
				});
			}

			/// 작업표시줄
			if(type === "taskbar"){
				$("#alarm_preferences_tooltip").css({
					"top": tooltip_posY + 25,
					"width": "228px",
					"max-width": "228px"
				});
			}
			/// 알림창
			if(type === "popup"){
				$("#alarm_preferences_tooltip").css({
					"top": tooltip_posY + 25,
					"width": "226px",
					"max-width": "226px"
				});
			}
			/// 모바일
			if(type === "mobile"){
				$("#alarm_preferences_tooltip").css({
					"top": tooltip_posY + 25,
					"width": "120px",
					"max-width": "120px"
				});
			}
			
		}
		
	}
	
}