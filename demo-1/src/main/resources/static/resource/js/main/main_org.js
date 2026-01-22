function gBodyOrg() {
	this.nm_prop = ''; // 조직도에 저장된 이름 매핑 정보
//	this.my_company_code = gap.userinfo.rinfo.cpc; // 내 회사 정보
	this.my_company_code = window.companycode; // 내 회사 정보 
	this.company_list = [];
	this.cur_company = '';	// 현재 조직도에 선택된 회사
	this.tree_id = 'org_tree';
	this.search_select_userinfo = null;	// 검색 결과 화면에서 사용자의 부서 선택시 해당 사용자 정보가 저장됨
	//this.sel_user = {}; // 우측 사이드에 선택된 사용자 정보
	this.select_limit = 100;	// 선택 가능한 사용자 수
	this.draw_list = [];
	this.draw_list_status = {};	//draw_list에 표시된 사용자들의 status값을 저장한다
	this.filter_init = false;	// 필터 이벤트 바인딩 됐는지 여부
	this.org_server = "http://one.kmslab.com";
}

gBodyOrg.prototype = {
	"init" : function() {
		this.nm_prop = gap.curLang == 'ko' ? '_name' : '_ename';
	},

	"showMainOrg" : function(pass_disp_user) {
		var _self = this;
		
		this.cur_company = '';
		this.centerInit();
		
		var html = 
			'<div id="container" class="mu_container mu_work mu_group mu_g_pop">' +
			'	<div class="contents scroll">' +
			'		<nav id="org_left"></nav>' +
			'		<section id="org_center"></section>' +
			'		<div id="org_right" class="work-aside office right_slide group_right_pop mem" style="display:none;"></div>' +
			'	</div>' +
			'</div>';
			
		$('#center_content').append(html);
		
		this.initLeft();
		this.initCenter();
		this.initRight();
		

		if (pass_disp_user) {
			// 포털에서 검색하는 경우 여기로 옴
			$('#top_header_layer').removeClass('show-quick');
			this.viewAllCompany(true);
			this.cur_company = 'all';
			this.active_key = window.fulldeptcode.split('^').pop();
			
			// 채팅 모아보기 아이콘 위치 새로고침
			gma.refreshPos();
		} else {
			$('#company_list').change();
		}
		
		gap.hideBlock();
	},
	
	"centerInit" : function(is_direct) {
		$("#left_main").html('').css({"width": "0", "border":"none"});
		$("#main_body").css("left", "81px");
		$("#main_body").css("right", "0");
		$("#main_body").css("background", "#fff");
		
		$("#center_content").css("width", "100%");
		$("#user_profile").css("width", "0px");
		$(".left-area").hide();
		$("#center_content").show();
		$("#center_content").off();
		$("#center_content").removeAttr("class");
		
		// 가운데 화면, 우측 화면 처리
		$('#center_content').html('').css('width', '100%');
		$('#user_profile').html('').hide();		
	},	

	"initLeft" : function() {
		var _self = this;

		// 통합검색창이 떠 있으면 숨긴다.
		$("#ext_body").hide();

		$('#nav_left_menu').empty();
		
		
		var html =
			'<div class="nav-wide">' +
			'	<div class="wrap-nav org-nav">' +

			'		<div class="nav-tab">' +
			'			<ul class="tabs">' +
			'				<li class="tab org on"><a href="#"><p>' + gap.lang.tab_org + '</p></a></li>' +
			'				<li class="tab group"><a href="#"><p>' + gap.lang.tab_group + '</p></a></li>' +
			'				<li class="indicator" style="min-width: 132px; max-width: 132px; right: 132px; left: 0px;"></li>' +
			'			</ul>' +
			'		</div>' +

			'		<div id="org_search" class="nav-channel">' +
			'			<div class="group_nav">' +
			'				<div class="group_sel">' +
		//	'					<span class="group_sel_txt">' + gap.lang.company + '</span>' +
			'					<div class="input-field selectbox org-company">' +
			'					</div>' +
			'				</div>' +
			'				<div class="aside-inner">' +
			'					<div class="input-field search-field">' +
			'						<span class="ico ico-search btn-search-ico"></span>' +
			'						<input type="text" id="org_search_txt" autocomplete="off" class="formInput" placeholder="' + gap.lang.input_search_query + '">' +
			'						<button type="button" class="ico-close btn-search-close" style="display:none;"></button>' +'' +
			'					</div>' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			
			'		<div class="folder-area" id="' + this.tree_id + '">' +
			'		</div>' +
			
			'		<div class="fold-group-area" id="org_group" style="display:none;">' +
			'			<div class="aside-inner">' +
			'				<div class="input-field search-field">' +
			'					<span class="ico ico-search btn-search-ico"></span>' +
			'					<input type="text" id="group_search_txt" autocomplete="off" class="formInput" placeholder="' + gap.lang.input_search_query + '">' +
			'					<button type="button" class="ico-close btn-search-close"></button>' +
			'				</div>' +
			'			</div>' +
			'			<div class="create-btn-wrap"><button type="button" id="btn_create_group" class="craete-group">' + gap.lang.btn_create_group + '</button></div>' +
			'			<div id="create_group_wrap" class="folder-input" style="display:none;">' +
			'				<input type="text" id="create_group_txt" class="formInput" placeholder="' + gap.lang.placeholder_group + '">' +
			'			</div>' +
			'			<div id="org_group_list" class="fold_group rel">' +
			'			</div>' +
			'		</div>' +

			'	</div>' +
			'</div>';
		
		$('#org_left').html(html);
		
		// 내 회사를 선택하도록 해야 함
		this.setCompanyHtml();

		this.leftEventBind();
	},

	"leftEventBind" : function() {
		var _self = this;
		
		// 탭 기능
		$('#org_left').find('.tabs').tabs();
		
		$('#org_left').find('.tab').on('click', function(){
			if ($(this).hasClass('on')) return;
			$('#org_left').find('.tab').removeClass('on');	
			$(this).addClass('on');
			
			if ($(this).hasClass('org')) {
				// 조직도
				$('#org_search_txt').val('');
				$('#org_search').show();
				$('#org_search .btn-search-close').hide();
				$('#org_tree').show();
				$('#org_group').hide();
				
				var $wrap = $('#org_tree');
				var select_node = _self.getTree().activeNode;
				
				if (select_node == null && _self.active_key) {
					// 검색 후, 개인그룹 갔다가 조직도 클릭한 경우
					_self.getTree().activateKey(_self.active_key);
				} else {
					var $sel_li = $(select_node.li);
					var st = $sel_li.offset().top + $wrap.scrollTop() - $wrap.offset().top - 5;
					$wrap.scrollTop(st);
					_self.getTree().activeNode = null;
					$sel_li.click();					
				}
				
				// 개입그룹에서 삭제 버튼 숨김
				$('#btn_remove_ingroup').hide();
			} else {
				// 그룹
				$('#create_group_wrap').val('').hide();
				$('#group_search_txt').val('');
				$('#org_group .btn-search-close').hide();
				$('#org_search').hide();
				$('#org_tree').hide();
				$('#org_group').show();
				
				_self.getGroupList().then(function(data){
					_self.drawGroupList(data);
				});
				_self.draw_list = [];
				_self.draw_list_status = {};
				_self.drawUserList([]);
				
				// 개입그룹에서 삭제 버튼 숨김
				$('#btn_remove_ingroup').show();
			}
		});
	
		
		// 검색 기능
		$('#org_search_txt').on('keydown', function(e) {
			if (e.keyCode == 13) {
				if (_self.running_search) {
					return false; // 검색 수행중인 경우 중복 요청 안되도록 처리					
				}

				// validation 체크
				var qry = $.trim($(this).val());
				//qry.replace(/\[\]\*/g, '');				
				$(this).val(qry);
				qry = qry.replace("(","\\(").replace(")","\\)");

				if (qry.length < 2) {
					mobiscroll.toast({message:gap.lang.valid_search_keyword, color:'danger'});
					return false;
				}

				_self.running_search = true;
				
				var dfd = $.Deferred();
				dfd.then(function(res){
					$('#org_search .btn-search-close').show();
					
					if (_self.getTree().activeNode != null) {
						_self.active_key = _self.getTree().activeNode.key; 						
					}
					
					// 트리를 선택하지 않은 상태로 처리
					$('#org_tree').find('.fancytree-active').removeClass('fancytree-active');
					_self.getTree().activeNode = null
					
					_self.draw_list = res;
					_self.draw_list_status = {};
					_self.drawUserList(res);
					
					clearTimeout(_self.loading_req);
					gap.hide_loading();
					
					_self.running_search = false;
				}, function(){
					clearTimeout(_self.loading_req);
					gap.hide_loading();
					
					mobiscroll.toast({message:gap.lang.error_search_req, color:'danger'});
					_self.running_search = false;
				});
				
				// Domino 조직도 검색
				//var query_res = _self.orgMakeQuery(qry);
				//_self.requestSearch(query_res, dfd);
				
				// KM서버에서 검색
				_self.requestSearchKM(qry, dfd);

			}
		}).on('paste', function(e){
			gap.change_paste_text(e, this);
		});
		
		// 조직도검색 초기화
		$('#org_search .btn-search-close').on('click', function(){
			$('#org_search_txt').val('');
			$('#org_search .btn-search-close').hide();
			_self.getTree().activateKey(_self.active_key);
		});
		
		// 개인그룹 생성 버튼
		$('#btn_create_group').on('click', function(){
			if ($('#create_group_wrap').is(':visible')) {
				$('#create_group_wrap').hide();
			} else {
				$('#create_group_wrap').show();
				$('#create_group_txt').focus();
			}
		});
		
		// 개인그룹 생성하기
		$('#create_group_txt').on('keydown', function(e){
			if (e.keyCode == 27) {
				$('#create_group_wrap').hide();
				$(this).val('');
				return;
			}
			if (e.keyCode != 13) return;
			
			var foldername_val = $.trim($(this).val());
			$(this).val(foldername_val);
			
			if (foldername_val == '') {
				mobiscroll.toast({message:gap.lang.error_groupnm, color:'danger'});
				return;
			}
			
			var nodeID = 'newNode' + Math.round(Math.random() * 100000000);
			
			_self.createGroup(foldername_val, nodeID).then(function(){
				gTop.groupListRefresh();
			});
		});
		
		$('#create_group_txt').on('blur', function(e){
			if ($.trim($(this).val()) == '') {
				$('#create_group_wrap').hide();
				$(this).val('');				
			}
		});
		
		$('#org_group_list').on('click', function(e){
			var $this = $(e.target);
						
			// 그룹명
			if ($this.hasClass('folder-name')) {
				var $folder = $this.closest('.folder_list');
				if ($folder.hasClass('active')) return;
				
				$('#org_group_list').find('.active').removeClass('active');
				$folder.addClass('active');
				_self.getUserListByGroup();
			}
		});
		
		// 그룹수정, 그룹삭제
		$.contextMenu({
			selector : "#org_group_list .ico.btn-more",
			className: 'group-context',
			autoHide : false,
			trigger : "left",
			events : {
				show: function (opt) {
					$(this).parent().addClass("on");
        		},
				hide: function (opt) {
					$(this).parent().removeClass("on");
            	}
			},
			items: {
				modify: {
					name: gap.lang.btn_group_mod,
					callback: function(key, opt){
						_self.modifyGroup();
					}
				},
				remove: {
					name: gap.lang.btn_group_del,
					callback: function(key, opt){
						_self.removeGroup();
					}
				}
			}
		});
		
		
		// 그룹검색 기능
		$('#group_search_txt').on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			// validation 체크
			var qry = $.trim($(this).val());
			qry.replace(/\[\]\*/g, '');
			$(this).val(qry);

			if (qry.length < 2) {
				mobiscroll.toast({message:gap.lang.valid_search_keyword, color:'danger'});
				return false;
			}
			
			_self.getSearchGroupList(qry).then(function(list){
				$('#org_group .btn-search-close').show();
				//_self.drawGroupUserList([]);	// 목록 초기화
				_self.drawGroupList(list);
			});
		});
		
		// 그룹검색 초기화
		$('#org_group .btn-search-close').on('click', function(){
			$('#group_search_txt').val('');
			$('#org_group .btn-search-close').hide();
			_self.getGroupList().then(function(data){
				_self.drawGroupList(data);
			});
			_self.draw_list = [];
			_self.draw_list_status = {};
			_self.drawUserList([]);
		});
	},

	"orgMakeQuery" : function(word) {
		// 회사정보가 있는 경우 회사정보 추가해야 함
		var com_qry = '';
		if (this.cur_company != 'all') {
			com_qry = '[companycode]="' + this.cur_company + '" AND ';
		}
		var search_fld = [ "korname", "engname", "groupname", "groupengname",
				"teamname_1", "teamname_2", "teamname_3", "eteamname_1",
				"eteamname_2", "eteamname_3" ];

		var qry = '';
		$.each(search_fld, function(idx, fld) {
			qry += (qry != '' ? ' OR ' : '');
			qry += '[' + fld + ']="' + word + '" OR [' + fld + ']="' + word	+ '*"';
		});

		qry = com_qry + '(' + qry + ')';

		return qry;
	},

	"requestSearch" : function(qry, dfd) {
		var _self = this;

		var req_data = {
			search : qry,
			ps : 1500,
			sortcolumn : "_name",
			sortorder : "ascending"
		};

		return $.ajax( {
			cache: false,
			url : _self.org_server + '/app/org.nsf/api/data/collections/name/byorgan_tree_all?restapi&' + $.param(req_data),
			xhrFields : {
				withCredentials : true
			},			
			beforeSend: function(){
				_self.loading_req = setTimeout(function(){gap.show_loading('Loading...');}, 200);
			},
			success : function(res) {
				var src = [];
				$.each(res, function() {
					// 사용자 데이터만 취합
					if (this._type != 'P') return true;
					src.push(_self.userInfoJson(this));
				});
				dfd.resolve(src);
			},
			error: function(){
				dfd.reject();
			}
		});
	},
	
	"requestSearchKM" : function(qry, dfd) {
		var _self = this;

		var req_data = {
			query : qry,
			companycode: this.cur_company == 'all' ? '' : this.cur_company 
		};

		return $.ajax( {
			type: 'POST',
			url : gap.channelserver + "/search_user_org.km",
			dataType : "json",
			data : JSON.stringify(req_data),
			beforeSend: function(){
				_self.loading_req = setTimeout(function(){gap.show_loading('Loading...');}, 200);
			},
			success : function(res) {
				var src = [];
				var dupl_check = {};
				if (res && res.user) {
					$.each(res.user, function(idx, val){
						$.each(val, function(){
							var user = _self.userInfoJsonKM(this);
							if (dupl_check[user.key]) {
								if (user.user_multi) {
									// 겸직인 경우
									user.disp_multi = true;
								} else {
									// 중복 사용자는 건너뜀
									return true;									
								}
							}
							src.push(user);
							dupl_check[user.key] = true;
						});
					});			
				}
				dupl_check = null;
				dfd.resolve(src);
			},
			error: function(){
				dfd.reject();
			}
		});
	},
	
	"selectFullDept" : function(fullcode){
		var _self = this;
		var fulldept = fullcode.split('^');
		this.getTree().expandAll(false);
		setTimeout( function() {
			_self.expandKey(fulldept);
		}, 50);
	},

	"initCenter" : function() {		
		var _self = this;
		
		var html = 
		'<div class="group_main">' +
		'	<div class="group_cate flex">' +
		'		<div class="flex">' +
		'			<div class="input-field selectbox">' +
		'				<div class="select-wrapper" id="org_filter_company">' +
		'					<span class="filter-txt" data-default="' + gap.lang.company + '">' + gap.lang.company + '</span>' +
		'					<span class="caret">▼</span>' +
		'				</div>' +
		'			</div>' +
		'			<div class="input-field selectbox">' +
		'				<div class="select-wrapper" id="org_filter_duty">' +
		'					<span class="filter-txt" data-default="' + gap.lang.duty + '">' + gap.lang.duty + '</span>' +
		'					<span class="caret">▼</span>' +
		'				</div>' +
		'			</div>' +
		'			<div class="input-field selectbox">' +
		'				<div class="select-wrapper" id="org_filter_location">' +
		'					<span class="filter-txt" data-default="' + gap.lang.location + '">' + gap.lang.location + '</span>' +
		'					<span class="caret">▼</span>' +
		'				</div>' +
		'			</div>' +
		'			<div class="input-field selectbox">' +
		'				<div class="select-wrapper" id="org_filter_status">' +
		'					<span class="filter-txt" data-default="' + gap.lang.status + '">' + gap.lang.status + '</span>' +
		'					<span class="caret">▼</span>' +
		'				</div>' +
		'			</div>' +
		'		</div>' +
		'		<div class="flex" style="align-items:end;">' +
		'			<button type="button" id="btn_remove_ingroup" class="btn-remove-ingroup" style="display:none;">' + gap.lang.remove_ingroup + '</button>' +
		'		</div>' +
		'	</div>' +
		'	<div class="group_tb_head">' +
		'		<div class="tab_cont_wr">' +
		'			<table class="table_type_a">' +
		'				<colgroup>' +
		'					<col style="width: 8%;">' +
		'					<col style="width: 5%;">' +
		'					<col style="width: auto;">' +
		'					<col style="width: auto;">' +
		'					<col style="width: auto;">' +
		'					<col style="width: auto;">' +
		'					<col style="width: auto;">' +
		'					<col style="width: 18%;">' +
		'				</colgroup>' +
		'				<thead>' +
		'					<tr>' +
		'						<th>' +
		'							<span class="chk_box">' +
		'								<input type="checkbox" id="org_all_check"/>' +
		'								<label for="org_all_check"></label>' +
		'							</span>' +
		'						</th>' +
		'						<th>' + gap.lang.profile + '</th>' +
		'						<th>' + gap.lang.name + '/' + gap.lang.empno + '</th>' +
		'						<th>' + gap.lang.company + '/' + gap.lang.location + '</th>	' +
		'						<th>' + gap.lang.duty + '/' + gap.lang.dept + '</th>' +
		'						<th>' + gap.lang.jd + '</th>' +
		'						<th>' + gap.lang.phone_num + '</th>' +
		'						<th>' + gap.lang.email + '</th>' +
		'					</tr>' +
		'				</thead>' +
		'			</table>' +
		'		</div>' +
		'	</div>' +
		'	<div class="group_tb_wr">   ' +
		'		<div class="group_tb_body scroll">' +
		'			<div class="tab_cont_wr">' +
		'				<table class="table_type_a">' +
		'					<colgroup>' +
		'						<col style="width: 8%;">' +
		'						<col style="width: 5%;">' +
		'						<col style="width: 13.8%;">' +
		'						<col style="width: 13.8%;">' +
		'						<col style="width: 13.8%;">' +
		'						<col style="width: 13.8%;">' +
		'						<col style="width: 13.8%;">' +
		'						<col style="width: 18%;">' +
		'					</colgroup>' +
		'					<tbody id="user_list_tb">' +
		'					</tbody>' +
		'				</table>' +
		'			</div>' +
		'		</div>' +
		'	</div>' +
		'</div>';

		$('#org_center').html(html);
		
	},
	
	"initRight" : function(){
		var html =
		'<div class="aside-wide">' +
		'	<div class="office_part">' +
		'		<h2 class="pop_tit">' + gap.lang.btn_sel_member + ' (<span id="org_select_cnt"></span>)<div class="sel-all-remove">' + gap.lang.all_deselect + '</div></h2>' +
		'		<div id="org_select_list" class="o_p_list">' +
		'		</div>' +
		'		<div class="group_btn_box abs">' +
		'			<button type="button" class="grouping_btn">' + gap.lang.btn_set_group + '</button>' +
		'			<button type="button" class="create_g_btn">' + gap.lang.sharechannel + '</button>' +
		'			<button type="button" class="more_g_btn">' + gap.lang.btn_more + '</button>' +
		'		</div>' +
		
		
		// 더보기 팝업
		'		<div id="org_action_more" class="chat-foot">' +
		'			<div class="plus-cont">' +
		'				<div class="pad28">' +
		'					<h2>' + gap.lang.comunication + '</h2>' +
		'					<div>' +
		'						<ul class="f_between">' +
		'							<li class="plus-list">' +
		'								<div class="div-talk"><span class="ico ico-talk"></span></div>' +
		'								<span>' + gap.lang.chatting + '</span>' +
		'							</li>' +
		'							<li class="plus-list">' +
		'								<div class="div-mail"><span class="ico ico-mail"></span></div>' +
		'								<span>' + gap.lang.mail + '</span>' +
		'							</li>' +
		/*
		'							<li class="plus-list">' +
		'								<div class="div-dm"><span class="ico ico-dm"></span></div>' +
		'								<span>' + gap.lang.noti + '</span>' +
		'							</li>' +
		*/
		'							<li class="plus-list one-select">' +
		'								<div class="div-sms"><span class="ico ico-sms"></span></div>' +
		'								<span>SMS</span>' +
		'							</li>' +
		'							<li class="plus-list one-select">' +
		'								<div class="div-phone"><span class="ico ico-phone"></span></div>' +
		'								<span>' + gap.lang.tel + '</span>' +
		'							</li>' +
		'						</ul>' +
		'					</div>' +
		'				</div>' +
		'				<div class="flex plus-top">' +
		'					<div>' +
		'						<h2>' + gap.lang.meeting + '</h2>' +
		'						<div class="">' +
		'							<ul class="f_evenly">' +
		/*
		'								<li class="plus-list">' +
		'									<div><span class="ico ico-room-inv"></span></div>' +
		'									<span>회의실 초대</span>' +
		'								</li>' +
		*/
		'								<li class="plus-list">' +
		'									<div><span class="ico ico-room-res"></span></div>' +
		'									<span>' + gap.lang.res_meet_room + '</span>' +
		'								</li>' +
		'								<li class="plus-list">' +
		'									<div><span class="ico ico-cam"></span></div>' +
		'									<span>' + gap.lang.make_video + '</span>' +
		'								</li>' +
		'							</ul>' +
		'						</div>' +
		'					</div>' +
		'					<div>' +
		'						<h2>' + gap.lang.etc + '</h2>' +
		'						<div class="">' +
		'							<ul class="f_evenly">' +
		'								<li class="plus-list one-select">' +
		'									<div><span class="ico ico-sche"></span></div>' +
		'									<span>' + gap.lang.schedule_check + '</span>' +
		'								</li>' +
		'								<li class="plus-list one-select" id="user_right_ele" style="display:none;">' +
		'									<div><span class="ico ico-ele"></span></div>' +
		'									<span>' + gap.lang.elephant + '</span>' +
		'								</li>' +
		'								<li class="plus-list one-select">' +
		'									<div><span class="ico ico-remote"></span></div>' +
		'									<span>' + gap.lang.remote + '</span>' +
		'								</li>' +
		'							</ul>' +
		'						</div>' +
		'					</div>' +
		'				</div>' +
		'			</div>' +
		'		</div>' +
		
		
		'	</div>' +
		'</div>';
		
		$('#org_right').html(html);
		
		this.actionEventBind();
	},
	
	"actionEventBind" : function(){
		var _self = this;
		var $side = $('#org_right');
		
		// 선택된 사용자 정렬이 가능하도록 처리
		$('#org_select_list').sortable({
			distance: 10	
		});
		
		// 선택 사용자 전체삭제
		$side.find('.sel-all-remove').on('click', function(){
			//_self.sel_user = {};
			$('#org_center .group_tb_head input[type="checkbox"]').prop('checked', false);
			$('#org_center .group_tb_wr input[type="checkbox"]:checked').prop('checked', false);
			$('#org_select_list').empty();
			_self.setSelectUserCount()
		});
		
		// 개인그룹 지정
		$side.find('.grouping_btn').on('click', function(){
			var sel_user = _self.getSelectUserList();
			_self.showGroupSelectLayer(sel_user, 'org');
		});
		
		// 업무방 생성
		$side.find('.create_g_btn').on('click', function(){
			var user_list = [];
			var sel_user = _self.getSelectUserList();
			$.each(sel_user, function(){
				if (gap.userinfo.rinfo.ky != this.key) {
					user_list.push(this.key);				
				}
			});
			
			_self.showCreateWorkLayer(user_list);
		});
		
		
		// 더보기
		$side.find('.more_g_btn').on('click', function(){			
			var $more_layer = $side.find('.chat-foot');
			if ($more_layer.hasClass('show')) {
				$more_layer.removeClass('show');
				$(document).off('click.org.more');
			} else {
				
				// 선택 사용자가 1명일 때 체크
				if (parseInt($('#org_select_cnt').text()) > 1) {
					$more_layer.find('.plus-list.one-select').addClass('off');
				} else {
					// 나와 상대방이 대상직원이고, im사번이 아니면 코끼리 표시
					var tmp_userinfo = $('#org_select_list .office_mem_card:eq(0)').data('info');
					if (gap.userinfo.rinfo.cpc == '10' && (gap.userinfo.rinfo.ky.indexOf('im') == -1) &&
						tmp_userinfo.companycode == '10' && (tmp_userinfo.key.indexOf('im') == -1)) {
						$('#user_right_ele').show();
					}
					
					$more_layer.find('.plus-list.one-select').removeClass('off');
				}
				
				// SMS 사용/사용안함
				if (window.use_sms != '1') {
					$more_layer.find('.ico-sms').closest('.plus-list').addClass('off');
				}
				// 전화 사용/사용안함 
				if (window.use_tel != '1') {
					$more_layer.find('.ico-phone').closest('.plus-list').addClass('off');
				}
				
				
				$more_layer.addClass('show');
				$(document).on('click.org.more', function(e){
					if ($(e.target).hasClass('more_g_btn')) return false;
					var temp = $(e.target).closest('.chat-foot');
					if (temp.length == 0 && !$(e.target).hasClass('chat-foot')) {
						$more_layer.removeClass('show');
						$(document).off('click.org.more');
					}
				});
			}
		});
		
		// 쪽지
		$side.find('.ico-dm').closest('.plus-list').on('click', function(){
			var list = [];
			var sel_user = _self.getSelectUserList(); 
			$.each(sel_user, function(){
				/*
				list.push({
					ky: this.key,
					nm: this.name,
					em: this.email
				});
				*/
				var convert_info = _self.userInfoJsonConvert(this);
				convert_info.el = '1';
				list.push(convert_info);
			});
			//gap.memo_create_show(list);
			gRM.create_memo(list);
		});
		
		// 대화
		$side.find('.ico-talk').closest('.plus-list').on('click', function(){
			var list = [];
			var sel_user = _self.getSelectUserList();
			$.each(sel_user, function(){
				list.push({
					ky: this.key,
					nm: this.name
				});
			});
			gap.chatroom_create(list);
		});
		
		// 메일
		$side.find('.ico-mail').closest('.plus-list').on('click', function(){
			var list = [];
			var sel_user = _self.getSelectUserList();
			$.each(sel_user, function(){
				list.push(this.email);
			});
			
			if (list.length > 200) {
				mobiscroll.toast({message:gap.lang.error_exceed_user, color:'danger'});
				return;
			} else {
				var param = {opentype: 'popup',	callfrom: 'address', authorsend: list.join(';')};			
				var memo_url = location.protocol + '//' + window.mailserver + '/' + window.mailfile + '/Memo?openform&' + $.param(param);
				
				var swidth = Math.ceil(screen.availWidth * 0.8);
				var sheight = Math.ceil(screen.availHeight * 0.8);
				if (swidth > 1140) {
					swidth = 1140;				
				}
				gap.open_subwin(memo_url, swidth, sheight);
			}
		});
		
		// SMS
		$side.find('.ico-sms').closest('.plus-list').on('click', function(){
			if ($(this).hasClass('off')) {return false;}
			
			var user = {};
			var sel_user = _self.getSelectUserList();
			$.each(sel_user, function(){ user = this;	return false; });
			
			gap.sms_call(user.key);			
		});
		
		// 전화
		$side.find('.ico-phone').closest('.plus-list').on('click', function(){
			if ($(this).hasClass('off')) {return false;}
			
			var user = {};
			var sel_user = _self.getSelectUserList();
			$.each(sel_user, function(){ user = this;	return false; });

			if (!user.officephonenumber) {
				mobiscroll.toast({message:gap.lang.error_tel_info, color:'danger'});
				return;
			}
			
			gap.phone_call(user.key, '');
		});
		
		// 회의실 예약
		$side.find('.ico-room-res').closest('.plus-list').on('click', function(){
			if ($(this).hasClass('off')) {return false;}
			
			var user_list = [];
			var sel_user = _self.getSelectUserList();
			$.each(sel_user, function(){
				user_list.push(this.key);
			});
			gMet.reserveMeeting('2', user_list); 
		});
		
		
		// 화상회의
		$side.find('.ico-cam').closest('.plus-list').on('click', function(){
			if ($(this).hasClass('off')) {return false;}
			
			var user_list = [];
			var sel_user = _self.getSelectUserList();
			$.each(sel_user, function(){
				user_list.push(this.key);
			});
			gMet.reserveMeeting('1', user_list); 
		});
		
		
		
		// 일정 확인
		$side.find('.ico-sche').closest('.plus-list').on('click', function(){
			if ($(this).hasClass('off')) {return false;}
			
			var user = {};
			var sel_user = _self.getSelectUserList();
			$.each(sel_user, function(){ user = this;	return false; });
			
			gBody.calendar_view(null, user.key);
		});
		
		
		// 칭찬코끼리
		$side.find('.ico-ele').closest('.plus-list').on('click', function(){
			if ($(this).hasClass('off')) {return false;}
			
			var user = {};
			var sel_user = _self.getSelectUserList();
			$.each(sel_user, function(){ user = this;	return false; });
			
			gap.elephant_call(user.key);
		});
		
		
		// 원격제어
		$side.find('.ico-remote').closest('.plus-list').on('click', function(){
			if ($(this).hasClass('off')) {return false;}
			
			var user = {};
			var sel_user = _self.getSelectUserList();
			$.each(sel_user, function(){ user = this;	return false; });
			
			gap.remote_call(user.key);
		});
	},
	
	"getSelectUserList" : function(){
		var list = [];
		
		var $userlist = $('#org_select_list .office_mem_card');
		$userlist.each(function(){
			var userinfo = $(this).data('info');
			list.push(userinfo);
		});
		
		return list;
	},

	"setCompanyHtml" : function() {
		var _self = this;

		// 그룹사 회사 전체 정보 가져오기
		var com_list = this.getCompanyList();
		this.company_list = com_list;

		var html = '';
		html += '<select id="company_list">';
		html += '<option value="all" selected>' + (gap.curLang == 'ko' ? '케이엠에스랩(주)' : 'KMSLab') + '</option>';
		$.each(com_list, function() {
			var my_com = (_self.my_company_code == this.company_code ? true
					: false);
			html += '<option value="' + this.company_code + '"'
					+ /*(my_com ? ' selected' : '') + */ '>' + this.company_name
					+ '</option>';
		});
		html += '</select>';
		$('.org-company').html(html);
		$('#company_list').material_select();

		// select 이벤트 바인딩
		$('#company_list').on('change', function() {
			var sel_code = this.value;
			if (_self.cur_company == sel_code) return;

			// 검색 관련 레이어 처리
//			$('.org-left-cont').removeClass('show-search');
//			$('.org-search-result').removeClass('show');

			if (sel_code == 'all') {
				_self.viewAllCompany();
			} else {
				_self.getDeptByCompany(sel_code);
			}
			_self.cur_company = sel_code;
		});
		
	},

	"getCompanyList" : function() {
		var _self = this;
		var com_list = [];

		// 회사정보 가져오기
		$.ajax({
			url: gap.channelserver + "/api/user/search_company.km",
			cache: false,
			async: false,
			success: function(res){
				$.each(res.data, function(){
					var c_name = (gap.curLang == "ko" ? this.cp : this.ecp);
					var c_code = this.cpc;
				//	var sub = _self.getValueByName(this, '_subdept');
					var sub = "T";		//몽고DB 회사정보 - sub_dept 필드값 참조
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
	"viewAllCompany" : function(pass_disp_user) {
		var src = [];
		$.each(this.company_list, function() {
			src.push( {
				title : this.company_name,
				key : this.company_code,
				folder : true,
				lazy : this.sub_dept == 'T'
			});
		});

		this.initTree(src);
		this.gotoMyDept(pass_disp_user);
	},

	"initTree" : function(src) {
		var _self = this;

		// 기존에 tree가 있는 경우 초기화
		try {
			$('#' + _self.tree_id).fancytree('destroy');
		} catch (e) {
		}

		$('#' + _self.tree_id).fancytree( {
			icons : false,
			toggleEffect : {
				effect : 'slideToggle',
				duration : 0
			},
			source : src,
			clickFolderMode : 3,
			lazyLoad : function(e, data) {
				var dfd = new $.Deferred();
				data.result = dfd.promise();
				_self.getChildDeptByCode(dfd, data.node.key);
			},
			activate : function(e, data) {
				_self.selectDept(data.node.key);
			},
			expand : function(e, data) {

			}
		});
	},

	// 회사의 최상위 부서만 가져옴
	"getDeptByCompany" : function(code) {
		var _self = this;
		var postData = {
			"companycode" : code
		}

		$.ajax({
			type: "post",
			url: gap.channelserver + "/search_company_to_dept.km",
			async: false,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success: function(res){
				var src = [];
				
				$.each(res, function(){
					src.push( {
						title : (gap.curLang == "ko" ? this.dp : this.edp),
						key : this.dpc,
						folder : true,
						lazy : this.subdept == 'T'
					});					
				});
				
				// 최상위에 회사정보가 들어가야 회사 하위에 포함된 사용자를 선택할 수 있음

				var root_src = [];
				root_src.push( {
					title : $('#company_list option:selected').text(),
					key : code,
					folder : true,
					children : src
				});
	
				_self.initTree(root_src);

				// 표시되는 조직도가 나의 회의가 포함된 경우 내 부서 찾아가기
				if (_self.my_company_code == code) {
					_self.gotoMyDept();
				} else {
					_self.expandKey( [ code ]);
				}				
			}
		});

/*		$.ajax({
			url : _self.org_server + '/app/org.nsf/api/data/collections/name/byorgan_tree_all?category=' + code + '&ps=1500',
			xhrFields : {
				withCredentials : true
			},
			cache: false,
			success : function(res) {
				var src = [];

				$.each(res, function() {
					// 부서 데이터만 취합
					if (this._type != 'D') return true;
					
					var _prop = '';
					if (gap.curLang == "ko") {
						_prop = '_name';
					} else {
						var _lang = _self.getValueByName(this, '_lang');
						if (gap.curLang == _lang) {
							_prop = '_oname';
						} else {
							_prop = '_ename';
						}
					}
					
					src.push( {
						title : this[_prop],
						key : this._code,
						folder : true,
						lazy : this._subdept == 'T'
					});
				});

				// 최상위에 회사정보가 들어가야 회사 하위에 포함된 사용자를 선택할 수 있음

				var root_src = [];
				root_src.push( {
					title : $('#company_list option:selected').text(),
					key : code,
					folder : true,
					children : src
				});
	
				_self.initTree(root_src);
	
				// 표시되는 조직도가 나의 회의가 포함된 경우 내 부서 찾아가기
				if (_self.my_company_code == code) {
					_self.gotoMyDept();
				} else {
					_self.expandKey( [ code ]);
				}
			}
		});*/
	},

	// 상위부서 정보로 정보를 가져옴
	"getChildDeptByCode" : function(dfd, code) {
		var _self = this;
		var postData = {
				"deptcode" : code
			}

		$.ajax({
			type: "post",
			url: gap.channelserver + "/api/user/search_dept_to_sub.km",
			async: false,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res) {
				var src = [];
				$.each(res.data, function() {
					if (this.dpc != '000000'){
						src.push( {
							title : (gap.curLang == 'ko' ? this.dp : this.edp),
							key : this.dpc,
							folder : true,
							lazy : this.subdept == 'T'
						});						
					}
				});
				dfd.resolve(src);
			},
			error : function() {
				dfd.resolve( []);
			}
		});
				
		
/*		$.ajax( {
			url : _self.org_server + '/app/org.nsf/api/data/collections/name/byorgan_tree_all?category=' + code + '&ps=1500',
			xhrFields : {
				withCredentials : true
			},			
			cache: false,
			success : function(res) {
				var src = [];
				$.each(res, function() {
					// 부서 데이터만 취합
						if (this._type != 'D')
							return true;

						src.push( {
							title : this[_self.nm_prop],
							key : this._code,
							folder : true,
							lazy : this._subdept == 'T'
						});
					});
				dfd.resolve(src);
			},
			error : function() {
				dfd.resolve( []);
			}
		});*/
	},

	// 내 부서 찾아가기
	"gotoMyDept" : function(pass_disp_user) {
		var _self = this;

		var fulldept = window.fulldeptcode.split('^');
	//	var com = [ _self.my_company_code ];
		var com = [];
		
		if (window.fulldeptcode == '') {
			fulldept = com;
		} else {
			fulldept = com.concat(fulldept);
		}
		this.expandKey(fulldept, pass_disp_user);
	},

	"expandKey" : function(keyarr, pass_disp_user) {
		// 트리만 열어주고 부서원은 볼 필요 없는 경우 : pass_disp_user를 true로 넘김
		var _self = this, node = null, _keyarr = keyarr.reverse(), _val = _keyarr.pop();
		var tree = this.getTree();
		node = tree.getNodeByKey(_val);
		if (!node) {
			return;
		}
		node.setExpanded(true).done( function() {
			if (_keyarr.length > 0) {
				_self.expandKey.call(_self, _keyarr.reverse(), pass_disp_user);
			} else {
				if (!node) {return;}
				if (!pass_disp_user) {_self.getTree().activateKey(_val);}
				_self.scrollMove(node.li);
			}
		});
	},

	"scrollMove" : function(li) {
		if (!li) return;
		var $wrap = $('#' + this.tree_id);
		var st = $(li).offset().top + $wrap.scrollTop() - $wrap.offset().top - 5;
		$wrap.stop().animate( {
			scrollTop : st
		}, 200);
	},
	
	"scrollMoveUser" : function(key){
		var _self = this;
		
		_self.search_select_userinfo = null;
		clearTimeout(this.check_user);
		
		var user_obj = $('#user_list_tb').find('tr[data-key="' + key + '"]');
		if (!user_obj.length) return;
		
		var $wrap = $('.group_tb_body');
		
		// 스크롤
		$wrap.stop();
		var st = $wrap.scrollTop() + user_obj.position().top;
		$wrap.animate({scrollTop:user_obj.position().top, duration: 200});
		user_obj.addClass('select-user');

		this.check_user = setTimeout(function(){
			_self.search_select_userinfo = null;
			$('#user_list_tb').find('tr[data-key="' + key + '"]').removeClass('select-user');
		}, 2000);
	},

	"selectDept" : function(code) {
		var _self = this;

		var dfd = $.Deferred();
		dfd.done( function(data) {
			_self.draw_list = data;
			_self.draw_list_status = {};
			_self.drawUserList(data);
			$('#org_search_txt').val('');
			$('#org_search .btn-search-close').hide();
		});

		this.getUserByDeptCode(dfd, code);
	},

	"userInfoJson" : function(userinfo) {
		var _name = userinfo.nm;
	//	var _duty = (userinfo._dispgrade == 'DUTY' ? userinfo._duty : userinfo._post);
		var _duty = userinfo.jt;
		var _orgname = userinfo.dp;
		var _company = userinfo.cp;
		
		if (gap.curLang == "ko"){
			// 1. 한국어 사용이면 무조건 한국어 필드로 표시
			
		} else {
			if (gap.curLang == userinfo.el){
				// 2. 나와 같은 언어를 사용하면 로컬언어로 표시
				_name = userinfo.onm;
				_orgname = userinfo.odp;
			//	_duty = (userinfo._dispgrade == 'DUTY' ? userinfo._oduty : userinfo._opost);
				_duty = userinfo.ojt;
			}else{
				// 3. 나와 다른 언어를 사용하면 영문으로 표시
				_name = userinfo.enm;
				_orgname = userinfo.edp;
			//	_duty = (userinfo._dispgrade == 'DUTY' ? userinfo._eduty : userinfo._epost);
				_duty = userinfo.ejt;
			}
			
			_company = userinfo.ecp;
		}
		
		
		return {
			name : _name,
			duty : _duty,
			post : userinfo.jt,
			orgname : _orgname,
			company : _company,

			ename : userinfo.enm,
			eduty : userinfo.edu,
			epost : userinfo.ejt,
			eorgname : userinfo.edp,
			ecompany : userinfo.ecp,

			key : userinfo.emp,
			location: $.trim(userinfo.wl),
			work: "",	//$.trim(userinfo._profile),
			companycode : userinfo.cpc,
			empno : userinfo.emp,
			email : userinfo.em,
			photo : userinfo.pu,
			cellphonenumber : userinfo.mop,
			officephonenumber : userinfo.op,
			fulldeptcode : userinfo.adc
		}

	},
	
	"userInfoJson_bak" : function(userinfo) {
		return {
			name : userinfo._name,
			duty : userinfo._duty,
			post : userinfo._post,
			orgname : userinfo._orgname,
			company : userinfo._company,

			ename : userinfo._ename,
			eduty : userinfo._eduty,
			epost : userinfo._epost,
			eorgname : userinfo._eorgname,
			ecompany : userinfo._ecompany,

			key : userinfo._orgnumber,
			location: $.trim(userinfo._workloc),
			work: $.trim(userinfo._profile),
			companycode : userinfo._companycode,
			empno : userinfo._empno,
			email : userinfo._email,
			cellphonenumber : userinfo._cellphonenumber,
			officephonenumber : userinfo._officephonenumber,
			fulldeptcode : userinfo._fulldeptcode
		}

	},
	
	"userInfoJsonKM" : function(userinfo) {
		userinfo = gap.user_check(userinfo);
		return {
			name : userinfo.name,
			duty : userinfo.jt,
			post : userinfo.jt,
			orgname : userinfo.dept,
			company : userinfo.company,

			ename : userinfo.enm,
			eduty : userinfo.edu,
			epost : userinfo.ejt,
			eorgname : userinfo.edp,
			ecompany : userinfo.ecp,

			key : userinfo.ky,
			location: $.trim(userinfo.wl),
			work: $.trim(userinfo.mm),
			companycode : userinfo.cpc,
			empno : userinfo.emp,
			email : userinfo.em,
			cellphonenumber : userinfo.mobile,
			officephonenumber : userinfo.op,
			fulldeptcode : userinfo.adc || '',
			user_multi : userinfo.usermulti && userinfo.usermulti == 'T' ? true : false // 겸직 여부 
		}

	},
	
	"userInfoJsonKM_bak" : function(userinfo) {
		return {
			name : userinfo.nm,
			duty : userinfo.du,
			post : userinfo.jt,
			orgname : userinfo.dp,
			company : userinfo.cp,

			ename : userinfo.enm,
			eduty : userinfo.edu,
			epost : userinfo.ejt,
			eorgname : userinfo.edp,
			ecompany : userinfo.ecp,

			key : userinfo.ky,
			location: $.trim(userinfo.wl),
			work: $.trim(userinfo.mm),
			companycode : userinfo.cpc,
			empno : userinfo.emp,
			email : userinfo.em,
			cellphonenumber : userinfo.mop,
			officephonenumber : userinfo.op,
			fulldeptcode : userinfo.adc || ''
		}

	},
	
	"userInfoJsonConvert" : function(userinfo) {
		return {
			nm : userinfo.name,
			du : userinfo.duty,
			jt : userinfo.post,
			dp : userinfo.orgname,
			cp : userinfo.company,

			enm : userinfo.ename,
			edu : userinfo.eduty,
			ejt : userinfo.epost,
			edp : userinfo.eorgname,
			ecp : userinfo.ecompany,

			ky : userinfo.key,
			wl : userinfo.location,
			mm : userinfo.work,
			cpc : userinfo.companycode,
			emp : userinfo.empno,
			em : userinfo.email,
			mop : userinfo.cellphonenumber,
			op : userinfo.officephonenumber,
			adc : userinfo.fulldeptcode
		}

	},
	
	"groupUserInfoJson" : function(data) {
		// 개인주소록에 저장된 정보 기준으로 가져온다
		var userinfo = {
			_name : this.getValueByName(data, "xname"),
			_cellphonenumber : this.getValueByName(data, "CellPhoneNumber"),
			_officephonenumber : this.getValueByName(data, "xofficephone"),
			_email : this.getValueByName(data, "xemail"),
			_company : this.getValueByName(data, "xcompanyname"),
			_companycode : this.getValueByName(data, "xcc"),
			_orgname : this.getValueByName(data, "xdepartment"),
			_empno : this.getValueByName(data, "xempno"),
			_duty : this.getValueByName(data, "xjobtitle"),
			_workloc: this.getValueByName(data, "xofficeaddress"),
			_profile: this.getValueByName(data, "xcomment")	//담당업무
		}
		
		if (userinfo._empno.indexOf('im') >= 0) {
			userinfo._orgnumber = userinfo._empno;
		} else {
			userinfo._orgnumber = userinfo._companycode + userinfo._empno;
		}
		
		return {
			docid : data['@noteid'],
			name : userinfo._name,
			duty : userinfo._duty,
			post : userinfo._duty,
			orgname : userinfo._orgname,
			company : userinfo._company,

			ename : userinfo._name,
			eduty : userinfo._duty,
			epost : userinfo._duty,
			eorgname : userinfo._orgname,
			ecompany : userinfo._company,

			key : userinfo._orgnumber,
			location: $.trim(userinfo._workloc),
			work: $.trim(userinfo._profile),
			companycode : userinfo._companycode,
			empno : userinfo._empno,
			email : userinfo._email,
			cellphonenumber : userinfo._cellphonenumber,
			officephonenumber : userinfo._officephonenumber,
			fulldeptcode : ''
		}

	},

	"getUserByDeptCode" : function(dfd, code) {
		var _self = this;
		var src = [];
		var postData = {
				"deptcode" : code
			}

		$.ajax({
			type: "post",
			url: gap.channelserver + "/api/user/search_dept_to_person.km",
			async: false,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res) {
				var src = [];
				$.each(res.data, function() {
					// 사용자 데이터만 데이터만 취합
					src.push(_self.userInfoJson(this));
				});
				dfd.resolve(src);
			},
			error : function() {
				dfd.resolve( []);
			}
		});		
		
/*		$.ajax( {
			url : _self.org_server + '/app/org.nsf/api/data/collections/name/byorgan_tree_all?category=' + code + '&ps=1500',
			xhrFields : {
				withCredentials : true
			},			
			cache: false,
			success : function(res) {
				var src = [];
				$.each(res, function() {
					// 사용자 데이터만 데이터만 취합
					if (this._type != 'P') return true;
					src.push(_self.userInfoJson(this));
				});
				dfd.resolve(src);
			},
			error : function() {
				dfd.resolve( []);
			}
		});*/
	},
	

	"drawUserList" : function(list, is_filter) {
		var _self = this;
		var html = '';
		var is_empty = true;
		
		$('#org_all_check').prop('checked', false);
		var $list = $('#user_list_tb');
		$list.empty();
		
		var user_ky = [];
		$.each(list, function() {
			var _info = {
				cpc : this.companycode,
				emp : this.empno,
				ky : this.key
			};
			
			//var sel = _self.sel_user[this.key] ? ' checked' : '';
			var sel = $('.office_mem_card[data-key="' + this.key + '"]').length > 0 ? ' checked' : '';
			var user_tr = 
			'<tr data-key="' + this.key + '"' + (this.docid ? ' data-docid="' + this.docid + '"' : '') + '>' +
			'	<td>' +
			
			(this.disp_multi == true ? '' :	//겸직자가 동시에 표시되는 상황에서는 체크박스를 표시하지 않음
			'		<span class="chk_box"><input type="checkbox" id="ck_' + this.key + '" value="' + this.key + '"' + sel + '><label for="ck_' + this.key + '"></label></span>') +
			
			'	</td>' +
			'	<td>' +
			'		<div class="user">' +
			'			<div class="photo-wrap" style="background-image:url(' + gap.person_photo_url(_info) + '),url('+gap.none_img+');"></div>' +
		//	'			<div class="photo-wrap" style="background-image:url(' + this.photo + '),url(resource/images/none.jpg);"></div>' +
			'			<span class="status"></span>' +
			'		</div>' +
			'	</td>	' +
			'	<td class="ta_left name-link">' +
			'		<div class="biz_name">' + this.name + '</div>' +
			'		<span class="biz_num">' + this.empno + '</span>' +
			'	</td>' +
			'	<td class="ta_left">' + this.company +
			'		<span class="biz_num">' + this.location + '</span></td>' +
			'	<td class="ta_left">' + this.duty +
			'		<span class="biz_num user-dept">' + this.orgname + '</span></td>' +
			'	<td>' + this.work + '</td>' +
			
			'	<td>';
			
			if (this.officephonenumber) {
				user_tr += '<div class="phone">' + this.officephonenumber;
				if (window.use_tel == '1') {
					user_tr += ' <span class="ico-phone" data-number="' + this.officephonenumber + '"></span>';
				}
				user_tr += '</div>';
			}
			
			if (this.cellphonenumber) {
				user_tr += '<div class="phone">' + this.cellphonenumber;
				if (window.use_tel == '1') {					
					user_tr += ' <span class="ico-mobile" data-number="' + this.cellphonenumber + '"></span>';
				}
				user_tr += '</div>';
			}
			
			user_tr +=
			'	</td>' +

			'	<td class="email">' + this.email + '</td>' +
			'</tr>';
			
			var $tr = $(user_tr);
			$tr.data('info', this);
			$list.append($tr);
			
			is_empty = false;
			
			user_ky.push(this.key);
		});
		
		// 최상단으로 스크롤 이동
		$('.group_tb_body').scrollTop(0);
		

		if (!is_filter) {
			var filter = {company: [], duty: [], location: [], status: []};
			
			// 필터링 기능
			$.each(list, function() {
				_self.addFilterValue(this, filter);
			});

			
			// 상태값
			filter.status = [gap.lang.online, gap.lang.offline];
						
			
			// 필터값 셋팅
			$('#org_filter_company').data('filter', filter.company.sort());
			$('#org_filter_duty').data('filter', filter.duty.sort());
			$('#org_filter_location').data('filter', filter.location.sort());
			$('#org_filter_status').data('filter', filter.status);
			
			
			// 필터값 초기화
			$('#org_filter_company .filter-txt').text($('#org_filter_company .filter-txt').data('default'));
			$('#org_filter_duty .filter-txt').text($('#org_filter_duty .filter-txt').data('default'));
			$('#org_filter_location .filter-txt').text($('#org_filter_location .filter-txt').data('default'));
			$('#org_filter_status .filter-txt').text($('#org_filter_status .filter-txt').data('default'));
			
			$('#org_filter_company').data('select', []);
			$('#org_filter_duty').data('select', []);
			$('#org_filter_location').data('select', []);
			$('#org_filter_status').data('select', []);
			
			// 사용자의 상태값 가져오기
			this.getUserStatus(user_ky);
		} else {
			this.updateStatus();
		}	

		if (is_empty) {
			var empty_tr = '<tr><td colspan="8">' + gap.lang.no_disp_data + '</td></tr>';
			$list.append(empty_tr);
		} else {			
			// 전체 체크박스 선택/해제 처리
			var uncheck = $('#user_list_tb').find('.chk_box input:not(:checked)');
			if (uncheck.length == 0) {
				$('#org_all_check').prop('checked', true);
			} else {
				$('#org_all_check').prop('checked', false);
			}
		}
		
		// 검색 결과 > 사용자의 부서 선택한 경우 > 리스트에서 사용자의 위치로 스크롤 이동
		if (_self.search_select_userinfo) {
			_self.scrollMoveUser(_self.search_select_userinfo);
		}

		_self.userListEventBind();
	},
	
	"addFilterValue" : function(info, filter){
		var company = info.company == '대상주식회사' ? '대상' : info.company;
		if (company) {
			if ($.inArray(company, filter.company) == -1) {
				filter.company.push(company);
			} 
		}
		
		if (info.duty) {
			if ($.inArray(info.duty, filter.duty) == -1) {
				filter.duty.push(info.duty);
			} 
		}
		
		if (info.location) {
			if ($.inArray(info.location, filter.location) == -1) {
				filter.location.push(info.location);
			} 
		}
	},
	
	"userListEventBind" : function(){
		var _self = this;
		var $list = $('#user_list_tb');
		
		// 사용자 선택
		$list.find('.chk_box input').on('click', function(){
			_self.checkUser(this);
		});
		
		// 전체 선택
		$('#org_all_check').off().on('click', function(){
			var checked = $(this).is(':checked');
			var $target = null;
			if (checked) {
				$target = $list.find('.chk_box input:not(:checked)');
			} else {
				$target = $list.find('.chk_box input:checked');
			}
			$target.each(function(){
				$(this).prop('checked', checked);
				_self.checkUser(this, true);
			});
			
			_self.setSelectUserCount();
		});
		
		// 사용자 상세보기
		$list.find('.user').on('click', function(){
			var info = $(this).closest('tr').data('info');
			gap.showUserDetailLayer(info.key);
		});
		$list.find('.name-link').on('click', function(){
			var info = $(this).closest('tr').data('info');
			gap.showUserDetailLayer(info.key);
		});
		$list.find('.name-link').on('mouseenter', function(){
			$(this).closest('tr').find('.user').addClass('on');
		});
		$list.find('.name-link').on('mouseleave', function(){
			$(this).closest('tr').find('.user').removeClass('on');
		});
		
		// 전화하기 기능
		if (window.use_tel == '1') {
			// 회사
			$list.find('.ico-phone').on('click', function(){
				return false;	//2025.05.20
				var info = $(this).closest('tr').data('info');
				var number = $(this).data('number');
				gap.phone_call(info.key, 1);
			});
			
			// 핸드폰
			$list.find('.ico-mobile').on('click', function(){
				return false;	//2025.05.20
				var info = $(this).closest('tr').data('info');
				var number = $(this).data('number');
				gap.phone_call(info.key, 2);
			});
		}
		
		// 이메일 발송
		$list.find('.email').on('click', function(){
			var info = $(this).closest('tr').data('info');
			var param = {opentype: 'popup',	callfrom: 'address', authorsend: info.email};			
			var memo_url = location.protocol + '//' + window.mailserver + '/' + window.mailfile + '/Memo?openform&' + $.param(param);
			
			var swidth = Math.ceil(screen.availWidth * 0.8);
			var sheight = Math.ceil(screen.availHeight * 0.8);
			if (swidth > 1140) {
				swidth = 1140;				
			}
			gap.open_subwin(memo_url, swidth, sheight);
		});
		
		
		// 검색 결과 화면에서 부서 클릭시 해당 부서로 이동, 개인 그룹에서 클릭 시 부서 찾기
		if (_self.getTree().activeNode == null || $('#org_left .tab.group').hasClass('on')) {
			$list.find('.user-dept').on('click', function(){
				var sel_info = $(this).closest('tr').data('info');
				_self.search_select_userinfo = sel_info.key;
				
				if ($('#org_left .tab.group').hasClass('on')) {
										
					// 그룹정보에는 사용자의 fulldeptcode 코드가 없으므로 검색해서 가져온다
					var param = {
						search: '[OrgNumber]="' + sel_info.key + '"'
					};
					$.ajax({
						url: _self.org_server + '/app/org.nsf/api/data/collections/name/byorgan_tree_all?restapi&' + $.param(param),
						xhrFields : {
							withCredentials : true
						},						
						cache: false,
						success: function(res){
							var data = res[0];
							if (data._orgnumber == sel_info.key) {
								// 개인 그룹을 보고 있는 경우
								$('#org_search_txt').val('');				
								$('#org_search').show();
								$('#org_tree').show();
								$('#org_group').hide();
								
								$('#org_left .tab.org').addClass('on');
								$('#org_left .tab.group').removeClass('on');
								$('#org_left .indicator').css({
									right: '132px',
									left: '0px'
								});
								
								_self.getTree().activeNode = null;
								
								var fulldeptcode = data._fulldeptcode;
								_self.selectFullDept(fulldeptcode);
							}
						}
					});
				} else {
					// 조직도를 보고 있는 경우
					var fulldeptcode = sel_info.fulldeptcode;
					_self.selectFullDept(fulldeptcode);
				}
				
			});
		}
			
		
		// 필터링 기능
		this.filterEventBind();
		
		// 그룹에서 삭제 기능
		$('#btn_remove_ingroup').off().on('click', function(){
			// 사용자 정보 가져고오기
			var $sel_list = $('#user_list_tb').find('.chk_box input:checked');
			if ($sel_list.length == 0) {
				// 선택된 사용자가 없습니다
				return false;
			}
			
			var group_nm = $('#org_group_list .folder_list.active').find('.folder-name').text();
			gap.showConfirm({
				title: gap.lang.basic_delete,
				contents: gap.lang.remove_ingroup_confirm.replace("$1", group_nm),
				iconClass: 'remove',
				callback: function(){
					_self.removeGroupUser();
				}
			});
		});
	},
	
	"filterEventBind" : function(){
		var _self = this;
		
		if (this.filter_init == true) return;
		
		// 필터 기능 적용
		$('#org_center .select-wrapper').on('click', function(){
			
			var $target = $(this);
			var filter = $(this).data('filter');
			var select = $(this).data('select') || [];
			var select_txt = '|' + select.join('|') + '|'
			var html = '';

			// 표시되고 있는 데이터가 있는 경우
			if ($target.qtip().destroyed == false) {
				$target.qtip('hide');
				return;
			}
			
			if (filter.length == 0) return;
			
			$.each(filter, function(){
				var _checked = select_txt.indexOf('|' + this + '|') != -1;
				html += '<div class="filter-each"><label><input type="checkbox" value="' + this + '"' + (_checked ? ' checked' : '') + '>' + this + '</label></div>';
			});
						
			$target.qtip({
				style: {
					classes: 'filter-qtip'
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
					viewport: $('#org_center'),
	                my: 'top center',
	                at: 'bottom center',
	                adjust: {
						y: 5
					}
	            },
	            events: {
	            	render: function(e, api){
	            	
	            	},
	            	
	            	show: function(e, api){
	            		// 스크롤이 생겨 긴 경우 첫 번째 선택된 체크 박스를 스크롤 이동
	            		var $sel = $(api.elements.content).find('input:checked:eq(0)');
	            		if ($sel.length) {
	            			setTimeout(function(){
	            				var st = $sel.position().top;
	            				$(api.elements.content).animate({
	            					scrollTop:$sel.position().top, duration: 200
	            				});
	            			}, 300);
	            		}
	            	},
	            	
	            	hide: function(e, api){
	            		var $sel = $(api.elements.content).find('input:checked');
	            		var cur_sel = [];
	            		$sel.each(function(){
	            			cur_sel.push($(this).val());
	            		});
	            		
	            		var is_change_sel = select.join() != cur_sel.join();
	            		
	            		$target.data('select', cur_sel);
	            		
	            		// 값이 변경된 경우 새로 그려줘야 함
	            		if (is_change_sel) {
	            			var filter_txt = '';
	            			if (cur_sel.length == 0) {
	            				// 선택한게 없을 때 기본값을 뿌려야 함
	            				filter_txt = $target.find('.filter-txt').data('default');
	            				$target.find('.filter-txt').attr('title', '');
	            			} else if (cur_sel.length == 1) {
	            				filter_txt = cur_sel[0];
	            				$target.find('.filter-txt').attr('title', '');
	            			} else {
	            				filter_txt = cur_sel[0] + ' (+외 ' + (cur_sel.length - 1) + '건)'
	            				$target.find('.filter-txt').attr('title', cur_sel.join());
	            			}
	            			$target.find('.filter-txt').text(filter_txt);

	            			var filter_list = _self.listFilter(_self.draw_list);
	            			_self.drawUserList(filter_list, true);
	            		}
	            		
	            		$(api.elements.tooltip).qtip('destroy');
	            	}
	            }
			});
			
			this.filter_init = true;
		});
	},
	
	"listFilter" : function(list){
		var _self = this;
		var filter_company = $('#org_filter_company').data('filter') || [];
		var filter_duty = $('#org_filter_duty').data('filter') || [];
		var filter_location = $('#org_filter_location').data('filter') || [];
		var filter_status = $('#org_filter_status').data('filter') || [];
		
		var sel_company = $('#org_filter_company').data('select') || [];
		var sel_duty = $('#org_filter_duty').data('select') || [];
		var sel_location = $('#org_filter_location').data('select') || [];
		var sel_status = $('#org_filter_status').data('select') || [];
		
		var txt_company = ('|' + sel_company.join('|') + '|');
		txt_company = txt_company.replace(/\|대상\|/g, '|대상주식회사|');
		var txt_duty = '|' + sel_duty.join('|') + '|';
		var txt_location = '|' + sel_location.join('|') + '|';
		var txt_status = '|' + sel_status.join('|') + '|';		
		
		var filtering = [];
		
		$.each(list, function(){
			
			if (sel_company.length > 0) {
				if (txt_company.indexOf('|' + this.company + '|') == -1) {
					return true;
				}
			}
			if (sel_duty.length > 0) {
				if (txt_duty.indexOf('|' + this.duty + '|') == -1) {
					return true;
				}
			}
			if (sel_location.length > 0) {
				if (txt_location.indexOf('|' + this.location + '|') == -1) {
					return true;
				}
			}
			
			// 상태값에 대한 정보 표시
			if (sel_status.length > 0) {
				var sts = _self.draw_list_status[this.key];
				if (sts) {
					var st_txt = (sts.status == 0 ? gap.lang.offline : gap.lang.online);
					if (txt_status.indexOf(st_txt) == -1) {
						return true;
					}					
				}
			}
			
			filtering.push(this);
			
		});
		
		return filtering;
	},
	
	"getTree" : function() {
		return $('#' + this.tree_id).fancytree('getTree');
	},
	
	"checkUser" : function(el, is_all) {
		var _self = this;
		var $el = $(el);
		var info = $el.closest('tr').data('info');
		var checked = $el.is(':checked');
		
		// 전체 체크박스 선택/해제 처리
		var uncheck = $('#user_list_tb').find('.chk_box input:not(:checked)');
		if (uncheck.length == 0) {
			$('#org_all_check').prop('checked', true);
		} else {
			$('#org_all_check').prop('checked', false);
		}
		
		// 변수에 선택된 사용자 정보 담기
		if (checked) {
			this.selectUser(info);
		} else {
			this.removeUser(info);
		}
		
		// 전체 선택으로 넘어온게 아니면 사용자 수 체크하기
		if (!is_all) {
			this.setSelectUserCount();
		}

	},
	
	"selectUser" : function(info){
		var _self = this;
		//this.sel_user[info.key] = info;
		
		var $list = $('#org_select_list');
		
		var $user = $list.find('[data-key="' + info.key + '"]');
		if ($user.length) return;
		
		var html =
		'<div class="office_mem_card" data-key="' + info.key + '">' +
		'	<div class="office_prof user">' +
		'		<div class="photo-wrap"></div>' +
		'		<span class="status"></span>' +
		'		<span class="mobile abs"></span>' +
		'	</div>' +
		'	<div class="office_right" style="width: 64%;">' +
		'		<div class="office_mem_name"></div>' +
		'		<div class="office_mem_info">' +
		'			<p class="work"></p>' +
		'			<p class="company"></p>' +
		'		</div>' +
		'	</div>' +
		'	<div class="abs hover-box">' +
		'		<div class="inner f_between f_middle">' +
		'			<span class="ico ico-chat">채팅</span>';
		
		if (info.cellphonenumber && window.use_tel == '1') {
			html += '<span class="ico ico-phone" data-num="' + info.cellphonenumber + '">전화</span>';
		}
		
		html +=
		'			<span class="ico ico-profile">프로필</span>' +
		'			<div class="user-remove"><span></span></div>' +
		'		</div>' +
		'	</div>' +
		'</div>';
		
		var img_src = 'url(' + gap.person_photo_url({cpc:info.companycode, emp:info.empno, ky:info.key}) + '), url('+gap.none_img+')';
		$user = $(html);
		$user.find('.photo-wrap').css('background-image', img_src);
		$user.find('.office_mem_name').text(info.name + ' ' + info.duty);
		$user.find('.office_mem_info .work').text(info.orgname);
		$user.find('.office_mem_info .company').text(info.company);		
		$list.append($user);
		
		/*
		// 온라인 정보
		if (info.status == '1') {
			$user.find('.status').addClass('online');
		} else if (info.status == '2') {
			$user.find('.status').addClass('away');
		} else if (info.status == '2') {
			$user.find('.status').addClass('deny');
		} else {
			$user.find('.status').addClass('offline');
		}
		*/
		
		// 온라인 정보
		this.setUserStatusClass($user.find('.status'), info.status);
		
		// 모바일
		if (info.mobile) {
			$user.find('.mobile').addClass('phone_icon');
		} else {
			$user.find('.mobile').removeClass('phone_icon');
		}
		
		// 연차 정보
		if (info.day != '') {
			$user.find('.office_mem_name').prepend('<span class="biz_check day_' + info.day + '">' + _self.userDayText(info.day) + '</span>');
		}
		
		
		/*
		 * 액션버튼 이벤트
		 */ 

		// 1:1 채팅
		$user.find('.ico-chat').on('click', function(){
			var req = {ky: info.key, nm: info.name};
			gap.chatroom_create([req]);
		});
		
		// 전화걸기
		$user.find('.ico-phone').on('click', function(){
			gap.phone_call(info.key, '');
		});
		
		// 사용자 프로필 보기
		$user.find('.ico-profile').on('click', function(){
			gap.showUserDetailLayer(info.key);
		});
		
		// 사용자 삭제
		$user.find('.user-remove').on('click', function(){
			// 좌측에 뿌려지는게 있는지 체크
			var $user_list_ck = $('#ck_' + info.key);
			if ($user_list_ck.length > 0) {
				$('#org_all_check').prop('checked', false);
				$user_list_ck.prop('checked', false);
			}
			_self.removeUser(info);
			_self.setSelectUserCount();
		});
		
		$user.data('info', info);
	},
	
	"removeUser" : function(info){
		//delete this.sel_user[info.key];
		var $list = $('#org_select_list');
		var $user = $list.find('[data-key="' + info.key + '"]');
		$user.remove();
	},
	
	"setSelectUserCount" : function(){
		var user_cnt = $('#org_select_list .office_mem_card').length;
		/*
		$.each(this.sel_user, function(){
			user_cnt++;
		});
		*/
		$('#org_select_cnt').text(user_cnt);
		
		var before = $('#org_right').is(':visible');
		
		if (user_cnt == 0) {
			$('#org_right').hide();
		} else {
			$('#org_right').show();
		}
		
		var after = $('#org_right').is(':visible');
		
		// 변경 사항이 있는 경우 채팅 버튼 위치 변경
		if (before != after) {
			gma.refreshPos();			
		}
	},
	
	"getGroupList" : function(){
		var _self = this;
		var url = location.protocol + '//' + window.mailserver + '/' + window.mailfile + '/group_list?readviewentries&outputformat=json&count=10000';
		return $.ajax({
			url: url,
			xhrFields : {
				withCredentials : true
			},
			cache: false,
			dataType: 'json'
		}).then(function(data){
			if (!data.viewentry) return [];
			
			// 데이터 sort처리
			var sort_list = [];
			
			// 폴더명 오름차순으로 정렬
			$.each(data.viewentry, function(idx, val){
				var obj = {
					id :_self.getValueByName(val, "$12"),
					folder_name : _self.getValueByName(val, "$11") 
				};
				sort_list.push(obj);
			});

			sort_list.sort(function(a,b){
				if (a.folder_name > b.folder_name) {
					return 1;	
				} else {
					return -1;
				}
			});
			
			return sort_list;
		}, function(){
			return [];
		});
	},
	
	// 사용자 이름을 검색하면 해당 사용자가 포함된 그룹명을 리턴해줘야 함
	"getSearchGroupList" : function(qry){
		var _self = this;
		var param = {
			page : 1,
			count : 1000,
			menuname : 'address',
			sf : 'all',
			sq : qry
		};
		var url = location.protocol + '//' + window.mailserver + '/' + window.mailfile + '/search_view_new?openAgent&' + $.param(param);
		return $.ajax({
			url: url,
			xhrFields : {
				withCredentials : true
			},			
			cache: false,
			dataType: 'json'
		}).then(function(res){
			var sort_list = [];
			var check_group = {};
			
			$.each(res.data, function(){
				if (this.group == '') return true;	// 그룹이 지정되지 않은 사용자는 표시 안함
				
				// 최초 검색된 사용자 선택 표시
				if (!_self.search_select_userinfo) {
					if (this.xempno.indexOf('im') >= 0) {
						_self.search_select_userinfo = this.xempno;
					} else {
						_self.search_select_userinfo = this.xcc + this.xempno;
					}
				}
				
				var user_group = this.group.split(', ');
				var user_group_key = this.groupkey.split(', ');
				
				$.each(user_group, function(idx, val){
					if (check_group[val]) return true;
					check_group[val] = true;
					sort_list.push({
						id: user_group_key[idx],
						folder_name: this
					});
				});
			});
			
			sort_list.sort(function(a,b){
				if (a.folder_name > b.folder_name) {
					return 1;	
				} else {
					return -1;
				}
			});
			
			return sort_list;
			
		}, function(){
			return [];
		});
	},
	
	"drawGroupList" : function(list){
		var _self = this;
		var $list = $('#org_group_list');		
		var html = '';
		
		$.each(list, function(){
			var $tmp = $('<div></div>').text(this.folder_name);
			html +=
			'<div class="folder_list" data-id="' + this.id + '">' +
			'	<span class="ico ico-filefolder"></span>' +
			'	<em class="folder-name" title="' + $tmp.html() + '">' + $tmp.html() + '</em>' +
			'	<button type="button" class="ico btn-more">' + gap.lang.btn_more +'</button>' +
			'</div>';
		});
		
		$list.html(html);
		
		if (html == ''){
			// 그룹 결과가 없는 경우
			var empty_str = '<tr><td colspan="8">' + gap.lang.no_disp_data + '</td></tr>';
			$('#user_list_tb').html(empty_str);
		}

		$list.find('.folder_list:eq(0) .folder-name').click();		
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
	
	"modifyGroup" : function(){
		var _self = this;
		var $list = $('#org_group_list');
		var $folder = $list.find('.folder_list.on');
		var before_nm = $folder.find('em').text();
		$folder.find('em').hide();
		
		var $input = $('<input type="text">');
		$input.data('before', before_nm);
		$input.val(before_nm);
		$folder.find('em').before($input);
		$input.focus();
		
		function _reqGroupChange(el) {
			var before = $(el).data('before');
			var after = $.trim($(el).val());
			if (after == '') return;
			$(el).val(after);
			
			_self.groupNameChange(el, before, after);
		}
		
		
		$input.on('keydown', function(e){
			if (e.keyCode == 13) {
				_reqGroupChange(this);
			} else if (e.keyCode == 27) {
				$folder.find('em').show();
				$(this).remove();
			}
		});
		$input.on('blur', function(e){
			_reqGroupChange(this);
		});
	},
	
	"groupNameChange" : function(el, before, after){
		var _self = this;
		var $el = $(el);
		var $folder = $el.closest('.folder_list');
		var id = $folder.data('id');

		if (before == after) {
			$folder.find('em').show();
			$el.remove();
			return;
		}
		
		var appURL = location.protocol + '//' + window.mailserver + '/' + window.mailfile + '/POSTGroup?OpenForm';
		$.ajax({
			type: 'POST',
			url: appURL,
			xhrFields : {
				withCredentials : true
			},
			beforeSend: function(){
				_self.loading_req = setTimeout(function(){gap.show_loading('');}, 200);
			},
			data: ({
				__Click: '0',
				Action: 'edit',
				GroupName: before,
				New_groupName: after,
				NodeID: id
			}),
			dataType: 'text',
			success: function (data) {
				clearTimeout(_self.loading_req);
				gap.hide_loading();
				if (data.toLowerCase().replace(/\n|\r|/g, '') == 'ok') {
					$folder.find('em').text(after).attr('title', after).show();
					$el.remove();
					gTop.groupListRefresh();
				} else if (data.toLowerCase().replace(/\n|\r|/g, '') == 'groupy') {
					mobiscroll.toast({message:gap.lang.error_group_dupl, color:'danger'});
				} else {
					mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				}
			},
			error: function(){
				clearTimeout(_self.loading_req);
				gap.hide_loading();
				
				mobiscroll.toast({message:mt_err_1, color:'danger'});
			}
		});
	},
	
	"createGroup" : function(foldername_val, nodeID){
		var _self = this;
		
		// 특수문자 입력 불가능
		var reg_name = /[\\"'|_,&]/gi;
		if(reg_name.test(foldername_val)){
			mobiscroll.toast({message:gap.lang.error_special_char, color:'danger'});
			return;
		}
		
		// 시스템 폴더명으로 생성안되도록 처리
		var sys_fname = "inbox|sent|draft|drafts|trash|junk".split("|");
		var trgt_fname = foldername_val.toLowerCase();
		for (var i=0; i<sys_fname.length; i++) {
			var tmpsfn1_1 = "imap"+sys_fname[i];
			var tmpsfn1_2 = "("+tmpsfn1_1+")";
			var tmpsfn2_1 = "$"+sys_fname[i];
			var tmpsfn2_2 = "("+tmpsfn2_1+")";
			var tmpsfn3 = "("+sys_fname[i]+")";
			if (trgt_fname == sys_fname[i] || trgt_fname == tmpsfn1_1 || trgt_fname == tmpsfn1_2 || trgt_fname == tmpsfn2_1 || trgt_fname == tmpsfn2_2 || trgt_fname == tmpsfn3){
				mobiscroll.toast({message:gap.lang.error_invalid_group, color:'danger'});
				return;
			}
		}
		
		var appURL = location.protocol + '//' + window.mailserver + '/' + window.mailfile + '/POSTGroup?OpenForm&amp;Seq=1';
		return $.ajax({
			type: 'POST',
			url: appURL,
			xhrFields : {
				withCredentials : true
			},
			data: ({
				__Click: '0',
				Action: 'create',
				GroupName: foldername_val,
				NodeID: nodeID
			}),
			beforeSend: function(){
				_self.loading_req = setTimeout(function(){gap.show_loading('');}, 200);
			},
			dataType: 'text',
			complete: function(){
				clearTimeout(_self.loading_req);
				gap.hide_loading();
			}
		}).then(function(data){
			if (data.toLowerCase().replace(/\n|\r|/g, '') == 'ok') {
				var $tmp = $('<div></div>');
				$tmp.text(foldername_val);
				var $el = $(
					'<div class="folder_list" data-id="' + nodeID + '">' +
					'	<span class="ico ico-filefolder"></span>' +
					'	<em class="folder-name" title="' + $tmp.html() + '">' + $tmp.html() + '</em>' +
					'	<button type="button" class="ico btn-more">' + gap.lang.btn_more + '</button>' +
					'</div>'		
				);
				$('#org_group_list').prepend($el);
				$('#create_group_wrap').hide();
				$('#create_group_txt').val('');
				
				mobiscroll.toast({message:gap.lang.group_craete_compl, color:'info'});
				return 'OK';
			} else if (data.toLowerCase().replace(/\n|\r|/g, '') == 'groupy') {
				mobiscroll.toast({message:gap.lang.error_group_dupl, color:'danger'});
				return 'ERROR';
			} else {
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				return 'ERROR';
			}
		}, function(){
			return 'ERROR';
		});
	},
	
	"removeGroup" : function(el){
		var _self = this;
		var $list = $('#org_group_list');
		var $folder = $list.find('.folder_list.on');
		var nm = $folder.find('em').text();
		var id = $folder.data('id');
		
		gap.showConfirm({
			title: gap.lang.btn_group_del,
			contents: '<span>' + $folder.find('em').html() + '</span><br>' + gap.lang.confirm_group_del,
			callback: function(){
				var appURL = location.protocol + '//' + window.mailserver + '/' + window.mailfile + '/POSTGroup?OpenForm';
				$.ajax({
					type: 'POST',
					url: appURL,
					xhrFields : {
						withCredentials : true
					},
					beforeSend: function(){
						_self.loading_req = setTimeout(function(){gap.show_loading('');}, 200);
					},
					data: ({
						__Click: '0',
						Action: 'delete',
						GroupName: nm,
						NodeID: id
					}),
					dataType: 'text',
					success: function (data) {
						clearTimeout(_self.loading_req);
						gap.hide_loading();
						
						if (data.toLowerCase().replace(/\n|\r|/g, '') == 'ok') {
							$folder.remove();
							if ($folder.hasClass('active')) {
								_self.draw_list = [];
								_self.draw_list_status = {};
								_self.drawUserList([]);
							}
							//업무 시작하기 패널 리로드
							gTop.groupListRefresh();
						} else {
							mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
						}
					},
					error: function(){
						clearTimeout(_self.loading_req);
						gap.hide_loading();
						
						mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
					}
				});
			}
		});		
	},
	
	"getUserListByGroup" : function(){
		var _self = this;
		var $folder = $('#org_group_list .folder_list.active');
		var folder_nm = $folder.find('em').text();
		
		var param = {
			RestrictToCategory: '-spl-' + folder_nm + '-spl-',
			outputformat: 'json',
			start: 1,
			count: 1000,
			charset: 'utf-8'
		}
		
		$.ajax({
			url: location.protocol + '//' + window.mailserver + '/' + window.mailfile + '/address_box_org?ReadViewEntries&' + $.param(param),
			xhrFields : {
				withCredentials : true
			},
			beforeSend: function(){
				_self.loading_req = setTimeout(function(){gap.show_loading('Loading...');}, 200);
			},
			cache: false,
			success: function(res){
				_self.drawGroupUserList(res);
			},
			complete: function(){
				clearTimeout(_self.loading_req);
				gap.hide_loading();
			}
		});
		
	},
	
	"drawGroupUserList" : function(data){
		var _self = this;
		var res = [];
		
		// 내부 사용자만 추가해야 함 (ucc값으로 체크)
		if (data.viewentry) {
			$.each(data.viewentry, function(){
				var user = _self.groupUserInfoJson(this);
				
				// 회사코드 값이 있으면 조직도에서 등록된 개인주소록임
				if (user.companycode) {
					res.push(user);
				}
			});
		}
		this.draw_list = res;
		this.draw_list_status = {};
		this.drawUserList(res);
	},
	
	"getUserStatus" : function(lists){
		if (lists.length == 0) return;
		//opt : 1:구독  2:종료 3:상태값 한번 만보기
		_wsocket.temp_list_status(lists, 3, 'org');
		
		// 웹소켓 처리 완료되면 statusCheckResult를 호출함
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
	
	"showGroupSelectLayer" : function(sel_user, call_from){
		var _self = this;
		
		$('#group_select_layer').remove();
		
		var html =
			'<div id="group_select_layer" class="mu_container">' +
			'	<div id="layerDimDark"></div>' +
			'	<div class="layer_wrap center" style="width:306px;position:fixed;">' +
			'		<div class="layer_inner">' +
			'			<div class="pop_btn_close"></div>' +
			'			<h4>' + gap.lang.sel_group + '</h4>' +
			'			<div class="layer_cont left">' +
			'				<div class="cont_wr rel new_group">' +
			'					<span class="radio_box">' +
			'						<input type="radio" id="group_sel_new" name="group_select" checked>' +
			'						<label for="group_sel_new">' + gap.lang.new_group + '</label>' +
			'					</span>' +
			'					<div class="before_select">' +
			'						<input type="text" id="group_new_txt" class="input" placeholder="' + gap.lang.placeholder_group + '">' +
			'					</div>' +
			'				</div>' +
			'				<div class="cont_wr rel b_group" style="display:none;">' +
			'					<span class="radio_box">' +
			'						<input type="radio" id="group_sel_add" name="group_select">' +
			'						<label for="group_sel_add">' + gap.lang.ex_group + '</label>' +
			'					</span>' +
			'					<div class="input-field selectbox">' +
			'						<select id="group_select_list">' +
			'						</select>' +
			'					</div>' +
			'				</div>' +
			'			</div>' +
			'			<div class="btn_wr">' +
			'				<button type="button" class="btn_layer confirm">' + gap.lang.basic_save + '</button>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		
		var $layer = $(html);
		//$('#container').append($layer);
		$('body').append($layer);
		$('#group_new_txt').focus();
		
		// 레이어 표시
		var inx = gap.maxZindex();
		$layer.find(".layer_wrap").css("z-index", parseInt(inx) + 1);
		
		// 폴더 정보 뿌리기
		_self.getGroupList().then(function(sort_list){
			var html = '';
			
			if (sort_list.length == 0) return;
			$.each(sort_list, function(){
				var $tmp = $('<div></div>').text(this.folder_name);
				html += '<option value="' + this.id + '">' + $tmp.text() + '</option>';
			});
			
			$layer.find('.b_group').show();
			$('#group_select_list').append(html).material_select();
		});
		
		$layer.find('#group_select_list').on('change', function(){
			$('#group_sel_add').prop('checked', true);
		});
		
		// 이벤트 처리
		$layer.find('.pop_btn_close').on('click', function(){
			$layer.remove();
		});
		
		// 저장
		$layer.find('.confirm').on('click', function(){
			var is_new = $('#group_sel_new').is(':checked');
			
			if (is_new) {
				// 신규 그룹
				var foldername_val = $.trim($('#group_new_txt').val());
				$('#group_new_txt').val(foldername_val);
				
				if (foldername_val == '') {
					mobiscroll.toast({message:gap.lang.error_groupnm, color:'danger'});
					$('#group_new_txt').focus();
					return;
				}
				
				var nodeID = 'newNode' + Math.round(Math.random() * 100000000);
				
				_self.createGroup(foldername_val, nodeID).then(function(data){
					if (data == 'OK') {
						_self.reqContactSave(sel_user, nodeID, foldername_val, call_from);						
					}
				});
			} else {
				// 기존 그룹
				var $sel = $('#group_select_list option:selected');
				var sel_id = $sel.val();
				var sel_nm = $sel.text();
				_self.reqContactSave(sel_user, sel_id, sel_nm, call_from);
			}
		});
		
		// 바깥영역 클릭시 닫기 처리
		$('#layerDimDark').on('click', function(){
			$layer.find('.pop_btn_close').click();
		});
	},
	
	"reqContactSave" : function(sel_user, cate_id, cate_nm, call_from){
		var _self = this;
		
		var lastname = [];
		var emailaddress = [];
		var companyname = [];
		var mobile = [];
		var department = [];
		var jobtitle = [];
		var notesid = [];
		var addr_type = [];
		var ucc = [];
		var uempno = [];
		var photopath = [];
		var officetel =[];
		var officeadd = [];	// 근무지
		var comment = [];	// 담당업무
		
		$.each(sel_user, function(){
			lastname.push(this.name);
			emailaddress.push(this.email);
			companyname.push(this.company);
			mobile.push(this.cellphonenumber);
			department.push(this.orgname);
			jobtitle.push(this.duty);
			notesid.push('CN=' + this.name +'/OU=' + this.key + '/O=daesang');
			addr_type.push('P');
			ucc.push(this.companycode);
			uempno.push(this.empno);
			photopath.push(this.companycode + '/' + this.key + '.jpg');
			officetel.push(this.officephonenumber);
			officeadd.push(this.location);
			comment.push(this.work);
		});
		
		var fd = {
			__Click: '0',
			Action: "create",
			lastname: lastname.join(";"),
			emailaddress: emailaddress.join(";"),
			companyname: companyname.join(";"),
			mobile: mobile.join(";"),
			department: department.join(";"),
			jobtitle: jobtitle.join(";"),
			notesid: notesid.join(";"),
			addr_type: addr_type.join(";"),
			category: cate_nm,
			categorykey: cate_id,
			ucc: ucc.join(";"),
			uempno: uempno.join(";"),
			photopath: photopath.join(";"),
			officetel: officetel.join(";"),
			officeadd: officeadd.join(";"),
			comment: comment.join(";")
		}

		var url = location.protocol + '//' + window.mailserver + '/' + window.mailfile + '/PostContacts?OpenForm&amp;Seq=1';
		$.ajax({
			type: 'POST',
			url: url,
			xhrFields : {
				withCredentials : true
			},			
			beforeSend: function(){
				_self.loading_req = setTimeout(function(){gap.show_loading('');}, 200);
			},
			data: fd,
			dataType: 'text',
			success: function (data) {
				clearTimeout(_self.loading_req);
				gap.hide_loading();
				
				if (data.toLowerCase().replace(/\r|\n/gi, '') == 'ok') {
					$('#group_select_layer').remove();
				
					mobiscroll.toast({message:gap.lang.group_reg_compl, color:'info'});
					
					// 개인그룹 페이지를 보고있는 경우 페이지를 새로 뿌려야 함
					if ($('#org_left .tab.group').hasClass('on')) {
						var cur_id = $('#org_group_list .folder_list.active').data('id');
						if (cur_id == cate_id) {
							var $el = $('#org_group_list .folder_list.active');
							$el.removeClass('active');
							$el.find('.folder-name').click();
						}
					}

					// 좌측 업무 시작하기 패널에 그룹 갱신
					gTop.groupListRefresh(cate_id);
				} else {
					mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				}
			},
			error: function (x) {
				clearTimeout(_self.loading_req);
				gap.hide_loading();
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
			}
		});
	},
	
	"showCreateWorkLayer" : function(user_list){
		var _self = this;
		
		$('#create_work_layer').remove();
		
		var html =
			'<div id="create_work_layer"  class="mu_container">' +
			'	<div id="layerDimDark"></div>' +
			'	<div class="layer_wrap center" style="width:306px;position:fixed;">' +
			'		<div class="layer_inner">' +
			'			<div class="pop_btn_close"></div>' +
			'			<h4>업무방</h4>' +
			'			<div class="layer_cont left">' +
			'				<div class="cont_wr rel new_group">' +
			'					<span class="radio_box">' +
			'						<input type="radio" id="work_sel_new" name="group_select" checked>' +
			'						<label for="work_sel_new">' + gap.lang.create_new_work + '</label>' +
			'					</span>' +
			'					<div class="before_select">' +
			'						<input type="text" id="work_new_txt" class="input" placeholder="' + gap.lang.input_channel_name + '">' +
			'					</div>' +
			'				</div>' +
			'				<div class="cont_wr rel b_group" style="display:none;">' +
			'					<span class="radio_box">' +
			'						<input type="radio" id="work_sel_add" name="group_select">' +
			'						<label for="work_sel_add">' + gap.lang.move_ex_work + '</label>' +
			'					</span>' +
			'					<div class="input-field selectbox">' +
			'						<select id="work_select_list">' +
			'						</select>' +
			'					</div>' +
			'				</div>' +
			'			</div>' +
			'			<div class="btn_wr">' +
			'				<button type="button" class="btn_layer confirm">' + gap.lang.Confirm + '</button>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		
		var $layer = $(html);
		//$('#container').append($layer);
		$('body').append($layer);
		$('#work_new_txt').focus();
		
		// 레이어 표시
		var inx = gap.maxZindex();
		$layer.find(".layer_wrap").css("z-index", parseInt(inx) + 1);

		
		// 폴더 정보 뿌리기
		_self.getWorkList(user_list).then(function(sort_list){
			var html = '';
			
			$.each(sort_list, function(){
				if (!this.ch_name) return true;
				var $tmp = $('<div></div>').text(this.ch_name);
				html += '<option value="' + this.ch_code + '">' + $tmp.text() + ' (' + this.members_count + '명)</option>';
			});
			
			if (html != '') {
				$layer.find('.b_group').show();
				$('#work_select_list').append(html).material_select();				
			}
		});
		
		$layer.find('#work_select_list').on('change', function(){
			$('#work_sel_add').prop('checked', true);
		});
		
		// 이벤트 처리
		$layer.find('.pop_btn_close').on('click', function(){
			$layer.remove();
		});
		
		// 저장
		$layer.find('.confirm').on('click', function(){
			var is_new = $('#work_sel_new').is(':checked');
			
			if (is_new) {
				// 신규 그룹
				var work_nm = $.trim($('#work_new_txt').val());
				$('#work_new_txt').val(work_nm);
				
				if (work_nm == '') {
					mobiscroll.toast({message:gap.lang.input_channel_name, color:'danger'});
					return;
				}
				
				
				// 중복 등록 방지
				//채널 정보를 가져와서 등록한다.		
				gap.pre_workroom_set();
				if (gap.workroom_name_doulble_check(work_nm)){
					mobiscroll.toast({message:gap.lang.d_room_no, color:'danger'});
					gap.hide_loading();
					return;
				}
				
				_self.loading_req = setTimeout(function(){gap.show_loading('');}, 200);
				
				
				// 사용자 정보를 먼저 검색해온다
				//var kys = [];
				//var sel_user = _self.getSelectUserList();
				//$.each(sel_user, function(){kys.push(this.key);});
				
				//var user_list = [];
				var surl = gap.channelserver + "/search_user_empno.km";
				//var postData = {"empno" : kys.join(",")};
				var postData = {"empno" : user_list.join(",")};
				
				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(postData),
					success: function(data){
						user_list = data[0];
						
						gap.workroom_create(work_nm, user_list).then(function(res){
							$('#create_work_layer').remove();
							mobiscroll.toast({message:gap.lang.craete_work_compl, color:'info'});
							clearTimeout(_self.loading_req);
							gap.hide_loading();
						}, function(){
							mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
							clearTimeout(_self.loading_req);
							gap.hide_loading();
						});
					},
					error: function(){
						mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
						clearTimeout(_self.loading_req);
						gap.hide_loading();
					}
				});
			} else {
				var $sel = $('#work_select_list option:selected');
				var ch_code = $sel.val();
				var url = location.protocol + "//" +location.host + "/" + opath  + "/dsw/wm.nsf/chat?readform&channel&" + ch_code;
				window.open(url, "webchat");
				
				// 기존 업무방 선택시 이동 처리
				$layer.remove();
			}
		});
		
		// 바깥영역 클릭시 닫기 처리
		$('#layerDimDark').on('click', function(){
			$layer.find('.pop_btn_close').click();
		});
	},
	
	"getWorkList" : function(list){
		var _self = this;
		var surl = gap.channelserver + "/channel_search_together.km";
		
		/*
		// 사용자 정보를 먼저 검색해온다
		var kys = [];
		var sel_user = _self.getSelectUserList();
		$.each(sel_user, function(){
			if (gap.userinfo.rinfo.ky != this.key) {
				kys.push(this.key);				
			}
		});
		*/
		
		return $.ajax({
			type : "POST",
			url: surl,
			dataType : "json",
			data : JSON.stringify({members:list.join('-')}),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
			},
			success: function(data){
				
			}
		}).then(function(res){
			if (res.result == 'OK') {
				return res.data.data;
			} else {
				return [];
			}
		}, function(){
			return [];
		});
	},
	
	"orgSearchCall" : function(search_word){
		var _self = this;
		
		if ($('#org').hasClass('act')) {
						
			if ($('#org_left').find('.tab.on').hasClass('org')) {
				// 현재 조직도 탭 화면을 보고 있는 경우 할 거 없음
				
			} else {
				// 그룹을 보고 있으면 조직도 탭으로 전환해야 함
				$('#org_search_txt').val('');				
				$('#org_search').show();
				$('#org_tree').show();
				$('#org_group').hide();
				
				$('#org_left .tab.org').addClass('on');
				$('#org_left .tab.group').removeClass('on');
				$('#org_left .indicator').css({
					right: '132px',
					left: '0px'
				});
				
				_self.getTree().activeNode = null;				
			}

		} else {
			
			// 화면 처리
			$("#portal_search").hide();
			$("#left_main").show();
			$("#main_body").show();
			
			$("#right_menu").show();
			$("#main_center").show();
			$("#main_right_wrap").show();			
			$('.meet-block-layer').remove();
			
			$("#main_content").hide();
			$("#left_main").show();
			$("#main_body").show();
			$("#right_menu").hide();
			$(".left-menu li").removeClass("act");
			
			var url = location.pathname + "?readform&org";
			history.pushState('org', null, url);
			

			gBody.cur_tab = "";
				
			var cls = $("#left_frame_collapse_sub_btn").attr("class");
			if (cls == "ico btn-left-fold on"){
				$("#left_frame_collapse_sub_btn").click();				
			}
			
				
			$("#ext_body_search").hide(); //통합검색창이 열려 있는 경우 닫아 준다.
			gBody.channel_right_frame_close();
			gap.cur_window = "org";
			
			$('#org').addClass('act');
			// 화면 처리 끝
			
			
			// 다른 화면에서 넘어온 경우
			_self.showMainOrg(true);
		}
		
		// 검색처리
		$('#org_search_txt').val($.trim(search_word));
		var e = $.Event('keydown');
		e.keyCode = 13;
		$('#org_search_txt').trigger(e);
	},
	
	"removeGroupUser" : function(){
		var _self = this;
		
		// 사용자 정보 가져고오기
		var $sel_list = $('#user_list_tb').find('.chk_box input:checked');
		
		// docid 정보 가져오기
		var ids = [];
		$sel_list.each(function(){
			var info = $(this).closest('tr').data('info');
			ids.push(info.docid);
		});
		
		// 그룹명 가져오기
		var group_nm = $('#org_group_list .folder_list.active').find('.folder-name').text();
		
		var param = {
			docid: ids.join(','),
			groupname: group_nm
		}
		
		$.ajax({
			url: location.protocol + '//' + window.mailserver + '/' + window.mailfile + '/agUserRemoveFromGroup?OpenAgent&' + $.param(param),
			xhrFields : {
				withCredentials : true
			},
			cache: false,
			beforeSend: function(){
				_self.loading_req = setTimeout(function(){gap.show_loading('');}, 200);
			},
			success: function(data){
				// 목록 갱신
				clearTimeout(_self.loading_req);
				gap.hide_loading();
				var $el = $('#org_group_list .folder_list.active');
				$el.removeClass('active');
				$el.find('.folder-name').click();
			},
			error: function(){
				clearTimeout(_self.loading_req);
				gap.hide_loading();
				
			}
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