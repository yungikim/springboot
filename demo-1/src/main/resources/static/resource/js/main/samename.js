function gSameName(){
	this.search_user = [];
	this.nth_cnt = 0;	// 현재 표시중인 레이어가 몇 번째 사용자인지 체크
	this.search_result = [];	// 검색 결과
	this.selected_user = [];	// 선택된 사용자의 정보
	this.callback;
	this.is_before_block = false;
	this.top_layer_element = null;
}

gSameName.prototype = {
		
	"init" : function(){
		this.search_user = [];
		this.nth_cnt = 0;
		this.selected_user = [];
		this.search_result = [];
		this.callback = null;
		this.is_before_block = false;	// 동명이인창이 뜨기 전 blockui 상태값
		this.top_layer_element = null;	// 동명이인창이 뜨기 전 blockui 상태인 경우 최상위 레이어 엘리먼트
	},
	
	/**
	 * @param cp : 회사코드, 전체회사에서 검색하는 경우 '' 빈 값
	 * @param terms : 검색어를 입력하여 요청함(콤마로 구분하여 검색 처리)
	 * @param callback : 검색이 완료된 후 호출되는 callback 함수, callback인자는 사용자가 선택한 사용자 정보
	 */
	"requestSearch" : function(cp, terms, callback){
		var _self = this;
		
		// 값 초기화
		this.init();
		
		if (!terms) {console.error('검색어  누락');return;}
		if (typeof(callback) != 'function') {console.error('Callback 함수 누락');return;}
		this.callback = callback;
		
		// 기존에 blockui가 표시되어 있는지 확인
		if ($('#blockui').is(':visible')) {
			this.is_before_block = true;
			var ck_z = parseInt($('#blockui').css('z-index')) + 1;
			
			// 최상위 레이어 가져오기
			$("header, div, article, section, nav, aside").not("[class*='mbsc-']").each(function(){
				if (!$(this).is(':visible')) return true;
				var z = parseInt($(this).css("z-index"));
				if (ck_z == z) {
					_self.top_layer_element = $(this);
					return false;
				}
			});
		}
		
		var search_nm = [];
		var arr = terms.split(',');
		
		$.each(arr, function(){
			var term = $.trim(this);
			if (term == '') return true;
			if (term.length == 1) {console.warn('검색어 1개인 경우는 처리 안함 : ' + term);return true;}	// 검색어가 1글자인 경우 처리 안함
			search_nm.push(term);
		});
		
		this.searchReq(cp, search_nm);
	},
	
	"searchReq" : function(cp, nm_arr){
		var _self = this;
		this.search_user = nm_arr;
		
		var data = {
			name: nm_arr.join(','),
			companycode: cp
		}
		$.ajax({
			type: 'POST',
			url: gap.channelserver + "/api/user/search_user_multi.km",
			beforeSend: function(){
				_self.search_req = setTimeout(function(){gap.showBlock();}, 200);
				//gap.showBlock();
			},
			data: JSON.stringify(data),
			success: function(data){
				
				clearTimeout(_self.search_req);
				_self.search_result = data;
				_self.reqSameNameLayer();
			},
			error: function(){
				clearTimeout(_self.search_req);
				_self.hideSameNameLayer();
				mobiscroll.toast({message:gap.lang.error_search_req, color:'danger'});
			}
		});
	},
	
	"reqSameNameLayer" : function(){
		var _self = this;
		
		var users = this.search_result.data;
		var term = this.search_user[this.nth_cnt];
	
		if (users.length == 0) {
			// 검색된 사용자가 없는 경우
			this.selectUser(false);
		} else if (users.length == 1) {
			// 검색된 사용자가 1명인 경우 바로 정보 저장
			this.selectUser(users[0]);
		} else {
			// 검색된 사용자가 2명 이상인 경우 팝업창 표시
			this.showSameNameLayer(users, term);
		}
		
	},
	
	"selectUser" : function(userinfo){
		if (userinfo) { this.selected_user.push(userinfo); }
		
		this.nth_cnt = this.nth_cnt + 1;
		
		if (this.nth_cnt == this.search_user.length) {
			this.hideSameNameLayer();
			this.callback(this.selected_user);
		} else {
			this.reqSameNameLayer();
		}
	},
	
	"showSameNameLayer" : function(users, term){
		var _self = this;
		
		gap.showBlock();
		
		var html =
		'<div id="same_name_layer" class="same-name-layer">' +
		'	<div class="title-wrap">' +
		'		<div class="title">'+gap.lang.mt_trans_title+'</div><div class="btn-close"><span></span><span></span></div>' +
		'	</div>' +
		'	<div class="user-term"><b>"' + term + '"</b> : '+gap.lang.dname+'. (' + users.length + ')</div>' +
		'	<div class="user-list">' +
		'		<ul id="same_name_popup_list"></ul>' +
		'	</div>' +
		'	<div class="btn-wrap">' +
		'		<button class="btn-ok">'+gap.lang.OK+'</button>' +
		'		<button class="btn-skip">'+gap.lang.skip+'</button>' +
		'		<button class="btn-cancel">'+gap.lang.Cancel+'</button>' +
		'	</div>' +
		'</div>';
		
		$('#same_name_layer').remove();
		$('body').append(html);
		
		// 사용자 리스트 표시
		var $list = $('#same_name_popup_list');
		$.each(users, function(){
			var info = [];
			var userdata = gap.user_check(this);
			
			var fld = ['name',  'jt', 'emp', 'dept', 'company'];			
			$.each(fld, function(){
				if (userdata[this]) info.push(userdata[this]);
			});
			
			var $user_li = $('<li>' + info.join(' / ') + '</li>');
			$user_li.data('info', userdata);
			$user_li.on('click', function(){
				if ($(this).hasClass('on')) return;
				$list.find('.on').removeClass('on');
				$(this).addClass('on');
			});
			
			$user_li.on('dblclick', function(){
				_self.selectUser( $(this).data('info') );
			});
			
			$list.append($user_li);
		});
		
		// 레이어 표시
		var inx = parseInt(gap.maxZindex()) + 1;
		$('#same_name_layer').css('z-index', inx).addClass('show-layer');
		
		
		//레이어 이벤트 처리
		this.layerEventBind();
	},
	
	"hideSameNameLayer" : function(){
		if (this.is_before_block) {
			var z = parseInt($('#blockui').css('z-index')) + 1;
			this.top_layer_element.css('z-index', z);
		} else {
			gap.hideBlock();
		}
		$('#same_name_layer').remove();
		//mobiscroll.toast({message:'', duration:1});	// 레이어 닫힐 때 toast 메세지가 남아있는 경우 닫아주기
	},
	
	"layerEventBind" : function(){
		var _self = this;
		var $layer = $('#same_name_layer'),
			$list = $('#same_name_popup_list'); 
		
		// 닫기
		$layer.find('.btn-close').on('click', function(){
			_self.hideSameNameLayer();
		});
		
		// 확인
		$layer.find('.btn-ok').on('click', function(){
			var $sel_li = $list.find('.on');
			if ($sel_li.length == 0) {
				mobiscroll.toast({message:'사용자를 선택해 주세요'});
				return false;
			}
			
			_self.selectUser( $sel_li.data('info') );
			
		});
		
		// 스킵
		$layer.find('.btn-skip').on('click', function(){
			_self.selectUser();
		});
		
		// 취소
		$layer.find('.btn-cancel').on('click', function(){
			_self.hideSameNameLayer();
		});
	}
}













