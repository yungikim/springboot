/**
 * KGPT My Data 설계관련 함수 
 */

 function kgptmydata(){
	this.plugin_domain = "https://kgpt.kmslab.com:5004/";	
	this.gptserver = 'https://kgpt.kmslab.com:5004';
	this.gptserver_fast = 'https://kgpt.kmslab.com:5005/';
	this.page_type = '';
	
	this.cur_page = 1;
	this.start_page = 1;
	this.per_page = 10;
	this.total_cnt = 0;
	
	this.admin_log_query = "";
 }
 
 kgptmydata.prototype ={
	"init" : function(){
		//gptmd.mydata_init();
	},
	
	"myDataMainHtml" : function(){
		var html =
			'<div id="my_data_layer" class="layer_wrap admin-popup new_work_pop center" style="width: 1500px;">' +
			'	<div class="container" style="min-height:833px">' +
			'		<div id="md_btn_close" class="pop-btn-close"></div>' +
			'		<div class="main-cont">' +
			'			<div id="main_left_cont" class="left-cont">' +
			'				<div class="left-wrap">' +
			'					<div class="tit-wrap">' +
			'						<h2 class="tit">' + gap.lang.folder + '</h2>' +
			'						<div>' +
			'							<button type="button" id="btn_realtime_train" class="my-data-btn" style="margin-right:5px;">' + gap.lang.real_time_learning + '</button>' +
			'							<button type="button" id="btn_add_folder" class="my-data-btn">' + gap.lang.create_folder + '</button>' +
			'						</div>' +
			'					</div>' +
			'					<ul id="md_folder_list" class="folder-list">' +
			'					</ul>' +
			'				</div>' +
			'			</div>' +
			'			<div id="main_right_cont" class="right-cont">' +
			'				<div class="right-wrap">' +
			'					<div class="tit-wrap"><h2 id="filelist_title" class="tit"></h2><button type="button" id="btn_add_file" class="my-data-btn">' + gap.lang.addFile + '</button></div>' +
			'					<ul id="md_file_list" class="file-list"></ul>' +				
			'					<div class="paging"><ul id="paging_area"></ul></div>' +
			'				</div>' +
			'			</div>' +
			'			<div id="main_plugin_cont" class="right-cont" style="display:none;">' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'</div>';

		return html;
	},	
	 
	"myDataInit" : function(){
		var _self = this;
		var html = this.myDataMainHtml();	
		
		gap.showBlock();
		$(html).appendTo('body');
		var $layer = $('#my_data_layer');
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
		$layer.wrap('<div id="common_work_layer" class="mu_container mu_work mu_group" style="top:-50%;"></div>');	

		// 뒷단 로직 오류 안나도록 gBody3 변수 셋팅
		window.gBody3 = '';
		
		// 첫 번째 전체 추가함
		this.addFolder('all', gap.lang.All);
		this.eventBind();
		$('#md_folder_list li:first-child').addClass('on');
		
		this.drawFolderList();
		this.drawUploadList(1, true);
	},
	
	"eventBind" : function(){
		var _self = this;
		
		// 닫기 버튼
		$('#md_btn_close').on('click', function(){
			$('#my_data_layer').parent().remove();
			gap.remove_layer('my_data_layer');
		});
		
		// LNB 메뉴
		$('.lnb-menu').on('click', function(){
			
			//if ($(this).hasClass('on')) return;
			$('.lnb-menu').removeClass('on');
			$(this).addClass('on');
			
			
			_self.showLoading('Loading');
			
			// 데이터 초기화
			$('#md_file_list').empty();
			$('#main_plugin_cont').empty();
			
			// 레이어 초기화
			$('#main_left_cont').hide();
			$('#main_right_cont').hide();
			$('#main_plugin_cont').hide();
			$('#btn_add_file').hide();
			
			
			if ($(this).hasClass('menu-train')) {

				$('#main_left_cont').show();
				$('#main_right_cont').show();
				$('#btn_add_file').show();
				
				$('#md_folder_list li').removeClass('on');
				$('#md_folder_list li:first-child').addClass('on');
				_self.drawUploadList(1, true).then(function(){
					
				});
				
			} else if ($(this).hasClass('menu-log1')) {

				$('#main_right_cont').show();
				
				// 요청 로그
				_self.drawQuestionList(1, true).then(function(){
					_self.hideBlock();
				});
				
			} else if ($(this).hasClass('menu-log2')) {
				
				$('#main_right_cont').show();
				
				// 컴플레인 로그
				_self.drawComplainList(1, true).then(function(){
					_self.hideBlock();
				});
				
			} else if ($(this).hasClass('menu-plugin')) {
				
				$('#main_plugin_cont').show();
				$('#main_right_cont').hide();
				
				_self.admin_log_query = "";
				
				_self.drawPluginHead();
				
				_self.eventPluginHead();
				
				// 플러그인
				_self.drawPluginList(1, true).then(function(){
					_self.hideBlock();
				});
				
			}
		});
		
		// 실시간 학습
		$('#btn_realtime_train').on('click', function(){
			_self.callRealtimeTraining();
		});
		
		// 폴더 생성
		$('#btn_add_folder').on('click', function(){
			_self.showCreateFolderLayer();
		});
		
		// 파일 생성
		$('#btn_add_file').on('click', function(){
			_self.showAddFileLayer();
		});
		
	},

	"showCreateFolderLayer" : function(){
		var _self = this;
		
		var html = 
			'<div class="pop-layer add-folder-layer">' +
			'	<div class="layer-inner">' +
			'		<div class="btn-close"></div>' +
			'		<h4>' + gap.lang.reg_folder + '</h4>' +
			'		<div class="layer-cont">' + 
			'			<div class="inner-wr">' +
			'				<span>' + gap.lang.folder_name + '</span>' +
			'				<div>' +
			'					<input type="text" id="folder_name" autocomplete="off" placeholder="' + gap.lang.input_folder_name + '">' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'		<div class="btn-wr">' +
			'			<button class="confirm">' + gap.lang.basic_save + '</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		var $layer = $(html);
		// 폴더등록창 표시하기
		$('#my_data_layer').parent().append($layer);
		
		// index 값 조정
		var block_idx = parseInt($('#blockui').css('z-index'));
		$('#my_data_layer').css('z-index', block_idx - 1);
		$layer.css('z-index', block_idx + 1);	
		
		// 이벤트 처리
		$layer.find('.btn-close').on('click', function(){
			$layer.remove();
		
			var my_data_idx = parseInt($('#my_data_layer').css('z-index'));
			var block_idx = parseInt($('#blockui').css('z-index'));
		
			// My Data 페이지가 열려있는 상황인 경우 처리
			if (my_data_idx && block_idx) {
				$('#my_data_layer').css('z-index', block_idx+1);
			}
		});
		
		// 폴더 입력
		$layer.find('.confirm').on('click', function(){
			_self.createFolder();			
		});
		$layer.find('#folder_name').on('keydown', function(e){
			if (e.keyCode == 13) {
				_self.createFolder();
			}
		});
			
		$('#folder_name').focus();
		$layer.addClass('show');
	},
	
	"showRemoveFolderLayer" : function(folder_code, folder_name){
		var _self = this;
		
		var html = 
			'<div class="pop-layer remove-file-layer">' +
			'	<div class="layer-inner">' +
			'		<div class="btn-close"></div>' +
			'		<h4>' + gap.lang.delete_folder + '</h4>' +
			'		<div class="layer-cont">' + 
			'			<div class="inner-wr">' +
			'				<div style="padding:10px 0;">"' + folder_name+ '" ' + gap.lang.folder_del_confirm + '</div>' +
			'				<span style="color:#ff0000;font-size:13px">' + gap.lang.del_all_files_folder + '</span>' +
			'			</div>' +
			'		</div>' +
			'		<div class="btn-wr">' +
			'			<button class="confirm">' + gap.lang.Confirm + '</button>' +
			'			<button class="cancel">' + gap.lang.Cancel + '</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		var $layer = $(html);
		// 폴더삭제창 표시하기
		$('#my_data_layer').parent().append($layer);
		
		// index 값 조정
		var block_idx = parseInt($('#blockui').css('z-index'));
		$('#my_data_layer').css('z-index', block_idx - 1);
		$layer.css('z-index', block_idx + 1);		
		
		// 이벤트 처리
		$layer.find('.btn-close').on('click', function(){
			$layer.remove();
			
			var my_data_idx = parseInt($('#my_data_layer').css('z-index'));
			var block_idx = parseInt($('#blockui').css('z-index'));
		
			// My Data 페이지가 열려있는 상황인 경우 처리
			if (my_data_idx && block_idx) {
				$('#my_data_layer').css('z-index', block_idx+1);
			}
		});
		
		// 확인 버튼
		$layer.find('.confirm').on('click', function(){
			_self.removeFolder(folder_code).then(function(){
				$layer.find('.btn-close').click();
				// 전체 폴더로 선택되도록 처리
				$('#md_folder_list li:eq(0)').click();
			});
		});
		
		// 취소 버튼
		$layer.find('.cancel').on('click', function(){
			$layer.find('.btn-close').click();
		});
		
		$layer.addClass('show');
	},
	
	"showAddFileLayer" : function(info){
		var _self = this;
		var is_edit = (info ? true : false);
		
		var html = 
			'<div class="pop-layer add-file-layer">' +
			'	<div class="layer-inner">' +
			'		<div class="btn-close"></div>' +
			'		<h4>' + gap.lang.addFile + '</h4>' +
			'		<div class="layer-cont">' + 
			'			<div class="left">' +	// 왼쪽 메뉴 S
			'				<div class="tab-wrap">' +
			'					<div class="upload-tab type-1 on" id="tab_share" data-type="1">' + gap.lang.file_contents + '</div>' +
			'					<div class="upload-tab type-2" id="tab_api" data-type="2">' + gap.lang.text_contents + '</div>' +
			'					<div class="upload-tab type-3" id="tab_url" data-type="3">' + gap.lang.web_url + '</div>' +
			'				</div>' +
			
			// 공용 콘텐츠
			'				<div id="tab_share_cont" class="tab-cont on">' +
			'					<div class="each">' +
			'						<div class="menu-title">' + gap.lang.basic_title + '</div>' +
			'						<input class="upload-title" autocomplete="off">' +
			'					</div>' +
		//	'					<div class="each">' +
		//	'						<div class="menu-title">' + gap.lang.code + '</div>' +
		//	'						<input class="upload-code" autocomplete="off">' +
		//	'					</div>' +
			'					<div class="each">' +
			'						<div class="menu-title">' + gap.lang.file + '</div>' +
			'						<input class="upload-file-name" autocomplete="off" placeholder=".docx, .pptx, .pdf, .txt ' + gap.lang.only_can_uploded + '" readonly>' +
			'						<label for="upload_file" class="upload-file-btn">' + gap.lang.find_files + '</label>' +
			'						<input type="file" id="upload_file" class="upload-file" accept=".docx,.pptx,.pdf,.txt">' +
			'					</div>' +
			'				</div>' +
			
			// API 연계
			'				<div id="tab_api_cont" class="tab-cont" style="display:none;">' +
			'					<div class="each">' +
			'						<div class="menu-title">' + gap.lang.basic_title + '</div>' +
			'						<input class="upload-title" autocomplete="off">' +
			'					</div>' +
		//	'					<div class="each">' +
		//	'						<div class="menu-title">' + gap.lang.code + '</div>' +
		//	'						<input class="upload-code" autocomplete="off">' +
		//	'					</div>' +
			'					<div class="each">' +
			'						<div class="menu-title">' + gap.lang.learning_contents + '</div>' +
			'						<textarea class="upload-cont"></textarea>' +
			'					</div>' +
			'				</div>' +
			
			// Web URL
			'				<div id="tab_url_cont" class="tab-cont" style="display:none;">' +
			'					<div class="each">' +
			'						<div class="menu-title">' + gap.lang.basic_title + '</div>' +
			'						<input class="upload-title" autocomplete="off">' +
			'					</div>' +
		//	'					<div class="each">' +
		//	'						<div class="menu-title">' + gap.lang.code + '</div>' +
		//	'						<input class="upload-code" autocomplete="off">' +
		//	'					</div>' +
			'					<div class="each">' +
			'						<div class="menu-title">URL</div>' +
			'						<input class="upload-url" autocomplete="off">' +
			'					</div>' +
			'				</div>' +
			
			'			</div>' +	// 왼쪽 메뉴 E
			'			<div class="right">' + // 오른쪽 메뉴 S
			'				<div class="each">' +
			'					<div class="menu-title">' + gap.lang.access_company + '</div>' +
			'					<div class="grant-com-sel-wrap"><span id="grant_com_allsel">' + gap.lang.selectall + '</span> | <span id="grant_com_desel">' + gap.lang.deselection + '</span></div>' +
			'					<div id="menu_grant_com_wrap">' +
			'						<ul id="menu_grant_com_list" class="menu-usermng-wrap grant-com-list"></ul>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">' + gap.lang.access_dept_person + '</div>' +
			'					<div style="display:flex;">' +
			'						<input id="reg_menu_grant" autocomplete="off">' +
			'						<div id="btn_org" class="btn-menu-grant-org"></div>' +
			'					</div>' +
			'					<div id="menu_grant_wrap" style="display:none;">' +
			'						<ul id="menu_grant_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +
			'				</div>' +
			'			</div>' +	//오른쪽 메뉴 E
			'		</div>' +
			'		<div class="btn-wr">' +
			'			<button class="confirm">' + gap.lang.basic_save + '</button>' +
			'			<button class="cancel">' + gap.lang.Cancel + '</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		var $layer = $(html);
		// 파일등록창 표시하기
		$('#my_data_layer').parent().append($layer);
		
		// index 값 조정
		var block_idx = parseInt($('#blockui').css('z-index'));
		$('#my_data_layer').css('z-index', block_idx - 1);
		$layer.css('z-index', block_idx + 1);		
		
		$layer.find('.btn-close').on('click', function(){
			$layer.remove();
			
			var my_data_idx = parseInt($('#my_data_layer').css('z-index'));
			var block_idx = parseInt($('#blockui').css('z-index'));
		
			// My Data 페이지가 열려있는 상황인 경우 처리
			if (my_data_idx && block_idx) {
				$('#my_data_layer').css('z-index', block_idx+1);
			}			
		});
		
		// 탭
		$('.upload-tab').on('click', function(){
			if ($(this).hasClass('on')) return;
			
			$('.upload-tab').removeClass('on');
			$(this).addClass('on');
			
			var cont_id = $(this).attr('id') + '_cont';
			$('.tab-cont').hide().removeClass('on');
			$('#'+cont_id).show().addClass('on');
		});
		
		
		// 파일찾기
		$("#upload_file").on('change',function(){
			var file_nm = $(this).val();
			var idx = file_nm.lastIndexOf('\\');
			if (idx >= 0) {				
				file_nm = file_nm.substr(idx + 1);
			}
			
			$('.upload-file-name').val(file_nm);
		});
		
		$('#upload_file').on('click', function(){
			if ($layer.hasClass('edit')) {
				mobiscroll.toast({message:gap.lang.cannot_change_file, color:'danger'});
				return false;
			}
		});
		
		// 회사 전채선택
		$('#grant_com_allsel').on('click', function(){
			$('#menu_grant_com_list input[type="checkbox"]').prop('checked', true);
		});
		$('#grant_com_desel').on('click', function(){
			$('#menu_grant_com_list input[type="checkbox"]').prop('checked', false);
		});
		
		// 권한 등록
		$('#reg_menu_grant').on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			var terms = $.trim($(this).val());
			if (terms == '') return;
			
			var users = terms.split(',');
			
			gsn.requestSearch('', terms, function(res){
				$.each(res, function(){
					_self.add_menu_grant(this);
				});
				$('#reg_menu_grant').focus();				
			});					
						
			$(this).val('');
		});
		
		// 조직도
		$('#btn_org').on('click', function(){
			var block_idx = parseInt($('#blockui').css('z-index'));
			$layer.css('z-index', block_idx-1);
			window.ORG.show(
				{
					'title': gap.lang.set_permission,
					'single': false,
					'show_ext' : false // 외부 사용자 표시 여부
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length == 0) return;
						for (var i = 0; i < items.length; i++){
							var _res = gap.convert_org_data(items[i]);
							_self.add_menu_grant(_res);
						}
					},
					onClose: function(){
						$layer.css('z-index', block_idx+1);
					}
				}
			);
		});
		
		
		// 저장
		$layer.find('.confirm').on('click', function(){
			var $cont = $layer.find('.tab-cont.on');
			
			var _type = $layer.find('.upload-tab.on').data('type');
			var _subj = $.trim($cont.find('.upload-title').val());
			var _code = $.trim($cont.find('.upload-code').val());
			
			if (_subj == '') {
				mobiscroll.toast({message:gap.lang.input_title, color:'danger'});
				$cont.find('.upload-title').focus();
				return;
			}

			// folder_code
			if (is_edit) {
				// 편집일 때는 기존 폴더 코드로 셋팅
				_folder_code = info.folder_code;
			} else {
				var _folder_code = $('#md_folder_list li.on').data('key');
				if (_folder_code == 'all') {
					_folder_code = '';
				}
			}
			
			// Readers (권한 관리)
			var _readers_all = [];
			var _readers_company = [];
			var _readers_deptuser = [];
			var _readers = gap.userinfo.rinfo.ky;
			var ck_com = $('#menu_grant_com_list').find(':checked');

			//작성자 본인
			_readers_all.push(gap.userinfo.rinfo.ky + "");

			// 회사
			$.each(ck_com, function(){
				_readers_all.push($(this).val() + "");
				_readers_company.push($(this).val() + "");
			});
			
			// 부서,개인
			$('#menu_grant_list li').each(function(){
				_readers_all.push($(this).data('key') + "");
				_readers_deptuser.push(JSON.stringify($(this).data('info')));
			});
						
			if (_readers_all.length > 0) {
				_readers = _readers_all.join(',');
			}
			
			
			var fd = new FormData();
			fd.append('ky', gap.userinfo.rinfo.ky);
			fd.append('category', "person");
			fd.append('type', _type);
			fd.append('code', _code);
			fd.append('title', _subj);
			fd.append('folder_code', _folder_code);
			fd.append('readers', _readers);
			fd.append('readers_company', _readers_company);
			fd.append('readers_deptuser', _readers_deptuser);
			
			// 편집인 경우 key값가 플래그 설정
			if (is_edit) {
				fd.append('key', info.key);
				fd.append('update', 'T');
			}

			if (_type == '1') {
				// 공용 콘첸츠
				var _file = $('#upload_file')[0].files[0];
				if (!_file) {
					mobiscroll.toast({message:gap.lang.select_file, color:'danger'});
					$('#upload_file').click();
					return;
				}
				
				fd.append('file', _file);
				
				_self.fileUpload(fd);
			} else if (_type == '2') {
				// API 연계
				var _cont = $.trim($layer.find('.upload-cont').val());
				if (_cont == '') {
					mobiscroll.toast({message:gap.lang.input_learn_content, color:'danger'});
					$layer.find('.upload-cont').focus();
					return;
				}
				fd.append('content', _cont);
				
				_self.apiSave(fd);
			} else {
				// Web URL
				var _url = $.trim($layer.find('.upload-url').val());
				if (_url == '') {
					mobiscroll.toast({message:gap.lang.input_url, color:'danger'});
					$layer.find('.upload-url').focus();
					return;
				}
				fd.append('url', _url);
				
				_self.urlSave(fd);
			}
		});
		
		// 취소 버튼
		$layer.find('.cancel').on('click', function(){
			$layer.find('.btn-close').click();
		});
		
		// 회사 정보 가져와서 뿌려주기
		_self.getCompanyList();
		
		// 편집인 경우 셋팅하기
		if (is_edit) {
			$layer.addClass('edit');
			_self.setEditInfo(info);
		} else {
			setTimeout(function(){
				$layer.addClass('show');	
			}, 50);
		}
	},
	
	"setEditInfo" : function(info){
		var _self = this;
		var $layer = $('.add-file-layer');
		
		// 편집인 경우 데이터 셋팅
		var cls_nm = 'type-' + info.type;
		$layer.find('.' + cls_nm).click();
		
		// 탭 이벤트 변경
		$layer.find('.upload-tab').off().on('click', function(){
			if ($(this).hasClass('on')) return false;
			mobiscroll.toast({message:gap.lang.cannot_change_another_ty, color:'danger'});
		});
		
		// 회사 선택
		if (info.readers_company) {
			var sel_com = info.readers_company.split(',');
			var $comlist = $('#menu_grant_com_list');
			$.each(sel_com, function(){
				$comlist.find('input[value="' + this + '"]').prop('checked', true);
			});
		}
		
		// 개인선택
		if (info.readers_deptuser) {
			var sel_user = eval('([' + info.readers_deptuser + '])');
			$.each(sel_user, function(){
				_self.add_menu_grant(this);
			});
		}
		
		
		
		if (info.type == '1') {
			
			var $cont = $('#tab_share_cont');
			$cont.find('.upload-file-name').val(info.filename);
			$layer.addClass('show');
			
		} else if (info.type == '2') {
			
			var $cont = $('#tab_api_cont');
			
			// 본문 텍스트를 가져오기 위해 ajax호출
			var data = {key: info.key, category : "person"};
			$.ajax({
				type: 'POST',
				url: this.gptserver_fast + 'folder/search_index',
				crossDomain: true,
				contentType : "application/json; charset=utf-8",
				data: JSON.stringify(data),
				success: function(res){
					$cont.find('.upload-cont').val(res.content);
					$layer.addClass('show');
				},
				error: function(){
					$layer.addClass('show');
				}
			});
			
		} else if (info.type == '3') {
			
			var $cont = $('#tab_url_cont');
			$cont.find('.upload-url').val(info.url);
			$layer.addClass('show');
			_self.hideLoading();
		}
		
		$cont.find('.upload-title').val(info.title);
		$cont.find('.upload-code').val(info.code);
		
		$layer.data('info', info);
		
	},
	
	"add_menu_grant" : function(user_info){	// 권한 추가
		var $list = $('#menu_grant_list');
		var ck = $list.find('li[data-key="' + user_info.ky + '"]');
		if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
		
				
		var disp_txt = '';
		user_info = gap.user_check(user_info);
		
		
		
		if (user_info.dsize == 'group'){
			disp_txt = '<a class="grant-group">' + user_info.name + ' | ' + user_info.cp + '</a>';
		} else {
			//disp_txt = '<a onclick="gOrg.showUserDetailLayer(\'' + user_info.ky + '\')">' + user_info.name + ' ' + user_info.jt + ' | ' + user_info.dept + '</a>';			
			disp_txt = '<a>' + user_info.name + ' ' + user_info.jt + ' | ' + user_info.dept + '</a>';
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
				$('#menu_grant_wrap').hide();
			}
		});
		
		$list.append($li);
		$('#menu_grant_wrap').show();
	},
	
	"getCompanyList" : function(){
		var _company = '';
		// 회사정보 가져오기
		$.ajax({
			url: root_path + "/api/user/search_company.km",
			async: false,
			success: function(res){
				$.each(res, function(){
					_company += 
						'<li data-key="' + this.cpc + '">' +
						'	<label>' +
						'		<input type="checkbox" value="' + this.cpc + '">' +
						'		<span>' + this.cp + '</span>' +
						'	</label>' +
						'</li>';
				});
				$('#menu_grant_com_list').html(_company);
			}
		});
	},
	
	"fileUpload" : function(fd){
		var _self = this;
		
		return $.ajax({
			type: 'POST',
			url: this.gptserver_fast + "apps/file_upload",
			crossDomain: true,
			data: fd,
			contentType: false,
			processData: false,
			success: function(res){
				mobiscroll.toast({message:gap.lang.reg_done_file, color:'info'});
				$('.add-file-layer').remove();
				
				var my_data_idx = parseInt($('#my_data_layer').css('z-index'));
				var block_idx = parseInt($('#blockui').css('z-index'));
		
				// My Data 페이지가 열려있는 상황인 경우 처리
				if (my_data_idx && block_idx) {
					$('#my_data_layer').css('z-index', block_idx+1);
				}
				
				_self.drawUploadList(1, true);
			}
		});
	},
	
	"apiSave" : function(fd){
		var _self = this;
		
		
		var _json = {};
		fd.forEach(function(value, key){
			_json[key] = value;
		});
		
		return $.ajax({
			type: 'POST',
			url: this.gptserver_fast + "folder/api_save",
			crossDomain: true,
			data: JSON.stringify(_json),
			contentType: 'application/json;charset=utf-8',
			success: function(res){
				mobiscroll.toast({message:gap.lang.reg_complete, color:'info'});
				$('.add-file-layer').remove();
				
				var my_data_idx = parseInt($('#my_data_layer').css('z-index'));
				var block_idx = parseInt($('#blockui').css('z-index'));
		
				// My Data 페이지가 열려있는 상황인 경우 처리
				if (my_data_idx && block_idx) {
					$('#my_data_layer').css('z-index', block_idx+1);
				}
								
				_self.drawUploadList(1, true);
			},
			error: function(){
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
			}
		});
		
	},
	
	"urlSave" : function(fd){
		var _self = this;
		
		
		var _json = {};
		fd.forEach(function(value, key){
			_json[key] = value;
		});
		
		return $.ajax({
			type: 'POST',
			url: this.gptserver_fast + "folder/url_save",
			crossDomain: true,
			data: JSON.stringify(_json),
			contentType: 'application/json;charset=utf-8',
			success: function(res){
				mobiscroll.toast({message:gap.lang.reg_success, color:'info'});
				$('.add-file-layer').remove();
				
				var my_data_idx = parseInt($('#my_data_layer').css('z-index'));
				var block_idx = parseInt($('#blockui').css('z-index'));
		
				// My Data 페이지가 열려있는 상황인 경우 처리
				if (my_data_idx && block_idx) {
					$('#my_data_layer').css('z-index', block_idx+1);
				}
								
				_self.drawUploadList(1, true);
			},
			error: function(){
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
			}
		});
		
	},
	
	"createFolder" : function(){
		var _self = this;
		var folder_nm = $('#folder_name').val();
		if ($.trim(folder_nm) == '') {
			mobiscroll.toast({message:gap.lang.input_folder_name, color:'danger'});
			return false;
		}
		
		var fd = {
			folder_name: $.trim(folder_nm),
			folder_code: _self.createFolderKey(),
			ky: gap.userinfo.rinfo.ky
		};
		
		
		$.ajax({
			type: 'POST',
			url: this.gptserver_fast + 'folder/folder_save',
			crossDomain: true,
			contentType : "application/json; charset=utf-8",
			data: JSON.stringify(fd),
			success: function(res){
				if (res.result == 'OK') {
					mobiscroll.toast({message:gap.lang.folder_created, color:'info'});
					$('.add-folder-layer .btn-close').click();
					
					_self.addFolder(fd.folder_code, fd.folder_name);
				}
			}
		});
	},
	
	// DOM에 폴더리스트 추가하기
	"addFolder" : function(code, name){
		var _self = this;
		
		var $list = $('#md_folder_list');
		
		// 폴더리스트에 붙이기
		var $li = $('<li data-key="' + code + '">' + name + '</li>');
		
		if (code != 'all') {
			$li.append('<div class="ico-trash"></div>');
			$li.find('.ico-trash').on('click', function(){
				_self.showRemoveFolderLayer(code, name);
			}); 
		}
		
		$li.on('click', function(){
			//if ($(this).hasClass('on')) return false;
			
			$list.find('.on').removeClass('on');
			$(this).addClass('on');

			// 해당 폴더의 업로드 리스트를 가져온다
			_self.drawUploadList(1, true);
		});
		$list.append($li);
	},
	
	"removeFolder" : function(key){
		var _self = this;
		var fd = {folder_code: key};
		return $.ajax({
			type: 'POST',
			url: this.gptserver_fast + 'folder/folder_delete',
			crossDomain: true,
			contentType : "application/json; charset=utf-8",
			data: JSON.stringify(fd),
			success: function(res){
				if (res.result == 'OK') {
					mobiscroll.toast({message:'삭제되었습니다.', color:'info'});
					$('#md_folder_list').find('li[data-key="' + key + '"]').remove();					
				}
			}
		});
	},
	"createFolderKey" : function(){
		var randomNum = Math.floor(Math.random() * 100000000);
		var ran_key = ('00000000' + randomNum).slice(-8);
		
		var now = new Date();
		var y = now.getFullYear();
		var m = ('0' + (now.getMonth() + 1)).slice(-2);
		var d = ('0' + now.getDate()).slice(-2);
		var hh = ('0' + now.getHours()).slice(-2);
		var mm = ('0' + now.getMinutes()).slice(-2);
		var ss = ('0' + now.getSeconds()).slice(-2);
		var now_str = y + m + d + hh + mm + ss;
		
		return now_str + '_' + ran_key;
	},
	
	"drawFolderList" : function(){
		var _self = this;

/*		return $.ajax({
			type: 'POST',
			url: this.gptserver + '/folder_list',
			contentType : "application/json; charset=utf-8",
			data: '{}',
			success: function(res){
				$.each(res[1], function(){
					_self.addFolder(this.folder_code, this.folder_name)
				});
			}
		});*/
		
		var postData = {"ky":gap.userinfo.rinfo.ky};	
		return $.ajax({
			crossDomain: true,
			type: "POST",
			url : this.gptserver_fast + "folder/folder_list",
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				$.each(res[1], function(){
					_self.addFolder(this.folder_code, this.folder_name)
				});			
			}
		});	
	},
	
	"drawUploadList" : function(page_no, is_init){
		var _self = this;
		
		var $sel_li = $('#md_folder_list li.on');
		if ($sel_li.length == 0) {
			mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
			return;
		}
		
		var code = $sel_li.data('key');
		var name = $sel_li.text();
		
		if (isNaN(page_no)) page_no = 1;
		var start_idx = ((_self.per_page * page_no) - (_self.per_page - 1)) - 1;  
		
		var fd = {
			category: "person",
			start: start_idx,
			end: _self.per_page,
			folder_code: (code == 'all' ? '' : code),
			ky: gap.userinfo.rinfo.ky
		}

		return $.ajax({
			type: 'POST',
			url: this.gptserver_fast + 'folder/upload_list',
			crossDomain: true,
			contentType : "application/json; charset=utf-8",
			data: JSON.stringify(fd),
			success: function(res){
				clearTimeout(_self.req_list);
				$('#md_file_list').empty();
				
				// 제목 삽입
				$('#filelist_title').html('"<span style="color:#0000ff;">' + name + '</span>"&nbsp;&nbsp;' + gap.lang.file_list);
				
				if (res[0].totalcount == 0) {
					$('#md_file_list').append('<li class="empty-file">' + gap.lang.nothing_to_show + '</li>');
				}

				if (is_init) {
					_self.total_cnt = res[0].totalcount;
					_self.start_page = 1;
					_self.page_type = 'type_1';
				}				
				_self.init_page();
				
				// 파일 리스트 추가
				$.each(res[1], function(){
					_self.addFile(this);
				});
			}
		});
	},
	
	"addFile" : function(info){
		var _self = this;
		var $list = $('#md_file_list');
		
		var ty = '';
		if (info.type == '1') {
			ty = 'File';
		} else if (info.type == '2') {
			ty = 'Text';
		} else {
			ty = 'Web';
		}
		
		/*
		var html = 
			'<li data-key="' + info.key + '">' +
			'	<div class="file-wrap">' +
			'		<div class="file-name-cont">' +
			'			<span class="file-type type-' + info.type + '">' + ty + '</span>' +
			'			<span class="file-name"></span>' +
			'		</div>' +
			'		<div class="file-btn-wrap">' +
			'			<button class="ico ico-add_to_ai_notebook" title=""></button>' +
			'			<button class="ico ico-down" title="' + gap.lang.download + '"></button>' +
			'			<button class="ico ico-del" title="' + gap.lang.basic_delete + '"></button>' +
			'		</div>' +
			'	</div>' +
			'</li>';
		*/
		var html = "";
		html += "<li data-key='" + info.key + "'>";
		html += "	<div class='file-wrap'>";
		html += "		<div class='file-name-cont'>";
		html += "			<span class='file-type type-" + info.type + "'>" + ty + "</span>";
		html += "			<span class='file-name'></span>";
		html += "		</div>";
		html += "		<div class='file-btn-wrap'>";
		if (gptmd.callFrom ==  "ai_notebook"){
			html += "			<button class='ico ico-add_to_ai_notebook' data-ty='"+ty+"' title='"+gap.lang.va123+"'></button>";
		}		
		html += "			<button class='ico ico-down' title='" + gap.lang.download + "'></button>";
		html += "			<button class='ico ico-del' title='" + gap.lang.basic_delete + "'></button>";
		html += "		</div>";
		html += "	</div>";
		html += "</li>"
		
		var filename = info.filename ? info.filename : info.title; 
		var $li = $(html);
		$li.data('info', info);
		$li.find('.file-name').text(filename);
				
		// 파일 타입인 경우만 다운로드 아이콘 표시
		if (info.type != '1') {
			$li.find('.ico-down').remove();
		}
		
		if (info.train == 'T') {
			$li.addClass('train');
		}
		
		// 편집
		$li.on('click', function(){
			_self.showAddFileLayer($(this).data('info'));
		});
		
		// AI 노트북 소스 추가
		$li.find('.ico-add_to_ai_notebook').on('click', function(e){
			var filekey = $(this).closest('li').data('key');
			var filename = $(this).closest('li').data('info').filename;
			var type = $(this).data("ty");
			
			var url = gap.channelserver + "/ai_notebook_control_file.km";
			var data = JSON.stringify({
				"filename" : filename,
				"filekey" : filekey,
				"type" : type,
				"opt" : "add",
				"notebook_code" : gnote.current_notebook
			});			
			gap.ajaxCall(url, data,
				function(res){					
					gnote.insert_note_file(type, filename, filekey);
				}
			)			
			return false;
		});
		
		
		// 파일 다운로드
		$li.find('.ico-down').on('click', function(){
			var param = {
				filename: info.filename,
				key: info.upload_path
			}			
			var down_url = _self.gptserver + '/file_download?' + $.param(param); 			
			window.open(down_url);			
			return false;
		});
		
		// 삭제
		$li.find('.ico-del').on('click', function(){
			var filekey = $(this).closest('li').data('key');
			var filename = $(this).closest('li').data('info').filename;
			_self.showRemoveFileLayer(filekey, filename);
			return false;
		});
		
		$list.append($li);
	},
	
	"showRemoveFileLayer" : function(filekey, filename){
		var _self = this;
		
		var $temp = $('<temp/>').text(filename);
		var f_nm = $temp.html();
		
		var html = 
			'<div class="pop-layer remove-folder-layer show">' +
			'	<div class="layer-inner">' +
			'		<div class="btn-close"></div>' +
			'		<h4>' + gap.lang.delete_file + '</h4>' +
			'		<div class="layer-cont">' + 
			'			<div class="inner-wr">' +
			'				<div class="nor-txt">' + f_nm + '</div>' +
			'				<span style="color:#ff0000;font-size:13px">' + gap.lang.confirm_delete + '</span>' +
			'			</div>' +
			'		</div>' +
			'		<div class="btn-wr">' +
			'			<button class="confirm">' + gap.lang.Confirm + '</button>' +
			'			<button class="cancel">' + gap.lang.Cancel + '</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		var $layer = $(html);
		// 파일삭제창 표시하기
		$('#my_data_layer').parent().append($layer);
		
		// index 값 조정
		var block_idx = parseInt($('#blockui').css('z-index'));
		$('#my_data_layer').css('z-index', block_idx - 1);
		$layer.css('z-index', block_idx + 1);			
		
		// 이벤트 처리
		$layer.find('.btn-close').on('click', function(){
			$layer.remove();

			var my_data_idx = parseInt($('#my_data_layer').css('z-index'));
			var block_idx = parseInt($('#blockui').css('z-index'));
		
			// My Data 페이지가 열려있는 상황인 경우 처리
			if (my_data_idx && block_idx) {
				$('#my_data_layer').css('z-index', block_idx+1);
			}
		});
		
		// 확인 버튼
		$layer.find('.confirm').on('click', function(){
			_self.removeFile(filekey).then(function(){
				$layer.find('.btn-close').click();
				mobiscroll.toast({message:gap.lang.del_file, color:'info'});
				_self.drawUploadList(_self.cur_page);
			});
		});
		
		// 취소 버튼
		$layer.find('.cancel').on('click', function(){
			$layer.find('.btn-close').click();
		});
	},
	
	"removeFile" : function(filekey){
		var _self = this;
		var data = {
			key: filekey,
			category: "person",
			ky : gap.userinfo.rinfo.ky
		};
		
		return $.ajax({
			type: 'POST',
			url: this.gptserver_fast + 'folder/delete_index',
			crossDomain: true,
			contentType : "application/json; charset=utf-8",
			data: JSON.stringify(data),
			success: function(res){
				
			},
			error: function(){
			//	_self.hideBlock();
			}
		});
	},
	
	"drawQuestionList" : function(page_no, is_init){
		// 요청로그
		var _self = this;
		
		
		if (isNaN(page_no)) page_no = 1;
		var start_idx = ((_self.per_page * page_no) - (_self.per_page - 1)) - 1;
		
		var fd = {
			start: start_idx,
			end: _self.per_page
		}
		
		return $.ajax({
			type: 'POST',
			url: this.gptserver + '/question_list',
			crossDomain: true,
			contentType : "application/json; charset=utf-8",
			beforeSend: function(){
				_self.req_list = setTimeout(function(){
					_self.showLoading('Loading');
				}, 200);
			},
			data: JSON.stringify(fd),
			success: function(res){
				
				clearTimeout(_self.req_list);
				$('#md_file_list').empty();
				
				// 제목 삽입
				$('#filelist_title').html('요청 로그 리스트');
				
				if (res[0].totalcount == 0) {
					$('#md_file_list').append('<li class="empty-file">표시할 내용이 없습니다</li>');
				}

				if (is_init) {
					_self.total_cnt = res[0].totalcount;
					_self.start_page = 1;
					_self.page_type = 'type_2';
				}				
				_self.init_page();
				
				// 파일 리스트 추가
				$.each(res[1], function(){
					_self.addLog(this);
				});
				
				_self.hideBlock();
			}
		});
	},
	
	"drawComplainList" : function(page_no, is_init){
		// 요청로그
		var _self = this;
		
		
		if (isNaN(page_no)) page_no = 1;
		var start_idx = ((_self.per_page * page_no) - (_self.per_page - 1)) - 1;
		
		var fd = {
			start: start_idx,
			end: _self.per_page
		}
		
		return $.ajax({
			type: 'POST',
			url: this.gptserver + '/complain_list',
			crossDomain: true,
			contentType : "application/json; charset=utf-8",
			beforeSend: function(){
				_self.req_list = setTimeout(function(){
					_self.showLoading('Loading');
				}, 200);
			},
			data: JSON.stringify(fd),
			success: function(res){
				
				clearTimeout(_self.req_list);
				$('#md_file_list').empty();
				
				// 제목 삽입
				$('#filelist_title').html('컴플레인 로그 리스트');
				
				if (res[0].totalcount == 0) {
					$('#md_file_list').append('<li class="empty-file">표시할 내용이 없습니다</li>');
				}

				if (is_init) {
					_self.total_cnt = res[0].totalcount;
					_self.start_page = 1;
					_self.page_type = 'type_3';
				}				
				_self.init_page();
				
				// 파일 리스트 추가
				$.each(res[1], function(){
					_self.addLog(this);
				});
				
				_self.hideBlock();
			}
		});
	},
	
	"addLog" : function(info){
		var _self = this;
		var $list = $('#md_file_list');
		
		var html = 
			'<li class="log">' +
			'	<div class="file-wrap">' +
			'		<div class="file-name-cont">' +
			'			<span class="file-name"></span>' +
			'		</div>' +
			'		<div class="file-btn-wrap">' +
			'			<div class="log-user"></div>' +
			'			<div class="log-date"></div>' +
			'		</div>' +
			'	</div>' +
			'</li>';
		
		var $li = $(html);
		$li.data('info', info);
		$li.find('.file-name').text(info.msg);
		$li.find('.log-user').text(info.user);
		
		var dt = info.GMT.substr(0,8) + 'T' + info.GMT.substr(8) + 'Z';
		$li.find('.log-date').text(moment(dt).format('YYYY-MM-DD HH:mm'));
		
		
		$list.append($li);
	},
	
	"drawPluginHead" : function(){
		var html =
			//'<div class="plugin-cont">' +
			'	<div class="tit-wr">' +
			'		<div class="se_right">' +
			'			<div class="input-field selectbox t_sec_sel">' +
			'				<select id="plugin_search_field">' +
			'					<option value="title">플러그인명</option>' +
			'					<option value="code">Key</option>' +
			'				</select>' +
			'			</div>' +
			'			<div class="f_between">' +
			'				<input type="text" id="txt_plugin_search" class="input" style="width:200px; padding:0 15px;" placeholder="검색어를 입력하세요" autocomplete="off">' +
			'				<div id="btn_search_close" class="btn-search-close"></div>' +
			'				<button id="btn_plugin_search" class="type_icon"></button>' +
			'				<button id="btn_plugin_upload" class="btn-upload">업로드</button>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'	<div class="table-wr">' +
			'		<table id="plugin_table"></table>' +
			'	</div>' +
			'	<div class="paging">' +
			'		<ul id="plugin_paging_area"></ul>' +
			'	</div>';
			//'</div>';
		
		$('#main_plugin_cont').html(html);
		$('#plugin_search_field').material_select();
		
		
		html =
			'<thead>' +
			'	<tr>' +
			'		<th style="width: 100px" class="inb">아이콘</th>' +
			'		<th style="width: 150px" class="inb">Key</th>' +
			'		<th style="width: 150px" class="inb">플러그인명</th>' +
			'		<th style="width: 150px" class="inb">권한설정</th>' +
			'		<th style="width: 150px" class="inb">삭제</th>' +
			'		<th style="width: auto;" class="inb">설명</th>' +
			'	</tr>' +
			'</thead>' +
			'<tbody id="plugin_list" class="menu-list-table">' +
			'</tbody>';
		
		$('#plugin_table').html(html);

	},
	"drawPluginList" : function(page_no, is_init){
		// 요청로그
		var _self = this;
		
		if (isNaN(page_no)) page_no = 1;
		var start_idx = ((_self.per_page * page_no) - (_self.per_page - 1)) - 1;
				
		var fd = {
				"start" : start_idx,
				"perpage" : _self.per_page,
				"query" : _self.admin_log_query,
				"admin" : "T"
			};
		
		// 검색인 경우 카테고리 삽입
		if (_self.admin_log_query) {
			fd['category'] = ($('#plugin_search_field').val());
		}
		
		
		return $.ajax({
			type: 'POST',
			url: root_path + '/plugin_list_gpt.km',
			contentType : "application/json; charset=utf-8",
			dataType: "text",
			beforeSend: function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				
				_self.req_list = setTimeout(function(){
					_self.showLoading('Loading');
				}, 200);
			},
			data: JSON.stringify(fd),
			success: function(__res){
				
				clearTimeout(_self.req_list);
				
				var res = JSON.parse(__res);
				var _list = res.data.response;
				
				
				if (_self.admin_log_query != ""){
					$("#btn_search_close").show();	
				}
				$("#plugin_list").empty();
				
				
				for (var i = 0; i < _list.length; i++){
					var _info = _list[i];						
					var _key = _info.code;
					var _icon_src = gap.channelserver + "/plugin_download_gpt.do?code=" + _key + '&ver=' + _info.last_update;
					var _icon_img = '<div class="menu-list-icon-preview" style="background-image:url(' + _icon_src + ');"></div>';
					_icon_img = '<div class="menu-list-icon-preview-wrap">' + _icon_img + '</div>';
					
					var _is_per = (_info.readers[0] == 'all' && _info.im_disable != 'T' ? false : true);
					
					
					var _html = "";					
					_html += '<tr id="' + _info._id + '" class="menu-list-tr">';
					_html += '	<td>' + _icon_img + '</td>';
					_html += '	<td>' + _key + '</td>';
					_html += '	<td>' + _info.menu_kr + '</td>';
					//_html += '	<td>' + (_info.im_disable == 'T' ? '✔' : '') + '</td>';
					_html += '	<td>' + (_is_per ? '✔' : '') + '</td>';
					_html += '	<td><button type="button" class="btn-menu-remove" data-key="' + _key + '" data-name="' + _info.menu_kr + '">삭제</button></td>';
					_html += '	<td><span class="menu-content">' + _info.content + '</span></td>';
					_html += '</tr>';
					
					$("#plugin_list").append(_html);
					$("#" + _info._id).data('info', _info);
				}
				
				if (_list.length == 0) {
					var _html = '<tr style="height:80px;"><td colspan="6" style="text-align:center;">표시할 데이터가 없습니다</td></tr>';
					$("#plugin_list").append(_html);
				}
				
				if (is_init) {
					_self.total_cnt = res.data.total;
					_self.start_page = 1;
					_self.page_type = 'type_4';
				}
				_self.init_page();

				
				// 이벤츠 처리
				_self.eventPluginList();
				
				_self.hideBlock();
			}
		});
	},
	
	"eventPluginHead" : function(){
		var _self = this;
		
		// 업로드
		$('#btn_plugin_upload').on('click', function(){
			_self.showPluginUploadLayer();
		});
		
		// 검색기능
		$('#txt_plugin_search').on("keydown", function(e){
			if (e.keyCode == 13){
				// validation 체크
				var qry = $.trim($(this).val());
				qry.replace(/\[\]\*/g, '');
				$(this).val(qry);

				if (qry.length < 2) {
					mobiscroll.toast({message:gap.lang.valid_search_keyword, color:'danger'});
					return false;
				}
				
				_self.admin_log_query = $(this).val();
				_self.drawPluginList(1, true);
			}
		});
		
		// 검색 버튼
		$('#btn_plugin_search').on('click', function(){
			// validation 체크
			var qry = $.trim($('#txt_plugin_search').val());
			qry.replace(/\[\]\*/g, '');
			$(this).val(qry);

			if (qry.length < 2) {
				mobiscroll.toast({message:gap.lang.valid_search_keyword, color:'danger'});
				return false;
			}
			
			_self.admin_log_query = $('#txt_plugin_search').val();
			_self.draw_admin_log_list(1, true);
		});
		
		// 검색 초기화
		$("#btn_search_close").on("click", function(){
			_self.admin_log_query = "";
			$("#txt_plugin_search").val("");
			$(this).hide();
			_self.drawPluginList(1, true);
		});
		
	},
	
	
	"eventPluginList" : function(){
		var _self = this;
		
		// 메뉴 편집
		$("#plugin_list").find('.menu-list-tr').on('click', function(){
			var _info = $(this).data('info');
			
			_self.showPluginUploadLayer(_info);
		});
		
		
		// 메뉴 삭제
		$("#plugin_list").find('.btn-menu-remove').on('click', function(){
			var _code = $(this).data('key');
			var _name = $(this).data('name');
			
			_self.menu_remove(_code, _name);				
			return false;
		});
	},
	
	
	
	"showPluginUploadLayer" : function(info){
		var _self = this;
		
		
		this.showBlock();
				
		var html = 
			'<div id="menu_upload_layer" class="reg-menu-ly pop-layer">' +
			'	<div class="layer-inner">' +
			'		<div class="btn-close pop_btn_close"></div>' +
			'		<h4>플러그인 등록</h4>' +
			'		<div class="layer-cont">' +
			'			<div class="left-cont">' + // 왼쪾 메뉴 S
			'				<div class="each">' +
			'					<div class="menu-title">Key</div>' +
			'					<div style="display:flex">' +
			'						<input id="reg_menu_code" placeholder="플러그인Key를 입력하세요 ex) aprv, crm">' +
			'					</div>' +
			'				</div>' +
			'				<div class="each"">' +
			'					<div>' +
			'						<div class="menu-title">이미지</div>' +
			'						<div style="display:flex;">' +
			'							<div id="reg_menu_icon" class="reg-menu-preview dropzone-previews"></div>' +
			'							<button id="reg_menu_add_file" class="btn-menu">이미지 선택</button>' +
			'						</div>' +
			'					</div>' +
			'				</div>' +			
			'				<div class="each" style="display:flex;">' +
			'					<div style="margin-right:7px;width:50%;">' +
			'						<div class="menu-title">플러그인명 (한글)</div>' +
			'						<input id="reg_menu_name_kr">' +
			'					</div>' +
			'					<div style="width:50%;">' +
			'						<div class="menu-title">플러그인명 (영문)</div>' +
			'						<input id="reg_menu_name_en">' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">설명</div>' +
			'					<textarea id="reg_menu_cont"></textarea>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">프롬프트</div>' +
			'					<textarea id="reg_menu_prompt"></textarea>' +
			'				</div>' +
			'				<div class="each" style="display:none;">' +
			'					<div class="menu-title">담당자</div>' +
			'					<div style="display:flex;">' +
			'						<input id="reg_menu_mng">' +
			'						<div class="btn-menu-mng-org"></div>' +
			'					</div>' +
			'					<div id="menu_mng_user_wrap" style="display:none;">' +
			'						<ul id="menu_mng_user_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +
			'				</div>' +
			
			'			</div>' +	// 왼쪽 메뉴 E
			
			'			<div class="right-cont">' + // 오른쪽 메뉴 S
			'				<div class="each">' +
			'					<div class="menu-title">권한 (회사)</div>' +
			'					<div class="grant-com-sel-wrap"><span id="grant_com_allsel">전체선택</span> | <span id="grant_com_desel">선택해제</span></div>' +
			'					<div id="menu_grant_com_wrap">' +
			'						<ul id="menu_grant_com_list" class="menu-usermng-wrap grant-com-list"></ul>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<div class="menu-title">권한 (부서,개인)</div>' +
			'					<div style="display:flex;">' +
			'						<input id="reg_menu_grant">' +
			'						<div class="btn-menu-grant-org"></div>' +
			'					</div>' +
			'					<div id="menu_grant_wrap" style="display:none;">' +
			'						<ul id="menu_grant_list" class="menu-usermng-wrap"></ul>' +
			'					</div>' +
			'				</div>' +
			'				<div class="each">' +
			'					<label><input type="checkbox" id="menu_disable_im" value="T">im사번 표시 안함</label>' +
			'				</div>' +
			'			</div>' +	//오른쪽 메뉴 E
			'		</div>' +
			'		<div style="margin-top:20px;text-align:center;">' +
			'			<button class="btn-ok">확인</button>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		// 컨펌창 표시하기
		$('body').append(html);
		
		// index 값 조정
		var block_idx = parseInt($('#blockui').css('z-index'));
		$('#menu_upload_layer').css('z-index', block_idx + 1);
		$('#menu_upload_layer').addClass('show');
		
		var _company = '';
		// 회사정보 가져오기
		$.ajax({
			url: root_path + "/api/user/search_company.km",
			async: false,
			success: function(res){
				$.each(res, function(){
					_company += 
						'<li data-key="' + this.cpc + '">' +
						'	<label>' +
						'		<input type="checkbox" value="' + this.cpc + '">' +
						'		<span>' + this.cp + '</span>' +
						'	</label>' +
						'</li>';
				});
				$('#menu_grant_com_list').html(_company);
			}
		});
		
		var is_edit = (info ? true : false);
		
		this.menu_upload_event(is_edit);
		
		// 편집으로 여는 경우
		if (is_edit) {
			$('#reg_menu_code').val(info.code).prop('readonly', true);
			$('#reg_menu_code').data('sort', info.sort);
			$('#reg_menu_bgcolor').val(info.bg);
			$('#reg_menu_name_kr').val(gap.textToHtml(info.menu_kr));
			$('#reg_menu_name_en').val(gap.textToHtml(info.menu_en));
			$('#reg_menu_cont').val(gap.textToHtml(info.content));
			$('#reg_menu_prompt').val(gap.textToHtml(info.prompt));
			
			$('#reg_menu_key_check').hide();
			
			// 아이콘
			var icon_src = gap.channelserver + "/plugin_download_gpt.do?code=" + info.code + '&ver=' + info.last_update;
			var preview_icon = '<div class="menu-preview-icon" style="background-image:url(' + icon_src + ')"></div>';
			$('#reg_menu_icon').append(preview_icon);
			
			
			// 담당자 정보 입력
			if (info.manager) {
				$.each(info.manager, function(){
					_self.add_menu_mnguser(this);					
				});
			}
			
			// 권한 (회사)
			if (info.readers_company) {
				$.each(info.readers_company, function(){
					$('input[value="' + this + '"]').prop('checked', true);
				});
			}
			
			// 권한 (부서,개인)
			if (info.readers_deptuser) {
				$.each(info.readers_deptuser, function(){
					_self.add_menu_grant(this);
				});
			}
			
			// im사번 표시
			if (info.im_disable == 'T') {
				$('#menu_disable_im').prop('checked', true);
			}
		}
	},
	
	"hidePluginUploadLayer" : function(){
		$('#menu_upload_layer').remove();
		this.hideBlock();		
	},
	
	"menu_remove" : function(code, menu_nm){
		var _self = this;
		
		gap.showConfirm({
			title: '메뉴삭제',
			//iconClass: 'remove',
			contents: '<span>' + menu_nm + '</span><br>플러그인을 정말 삭제할까요?',
			callback: function(){
				gap.show_loading('처리 중');
				
				$.ajax({
					type: 'POST',
					url: root_path + '/plugin_delete.km',
					dataType: 'json',
					data: JSON.stringify({code: code}),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success: function(res){
						mobiscroll.toast({message:'삭제되었습니다', color:'info'});
						
						$('#show_loading_layer').remove();
						var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
						var block_idx = parseInt($('#blockui').css('z-index'));
						
						// Admin 페이지가 열려있는 상황인 경우 처리
						if (admin_menu_idx && block_idx) {
							$('#admin_log_layer').css('z-index', block_idx+1);
						}
						
						_self.drawPluginList(_self.cur_page);
						
					},
					error: function(){
						$('#show_loading_layer').remove();
						var admin_menu_idx = parseInt($('#admin_log_layer').css('z-index'));
						var block_idx = parseInt($('#blockui').css('z-index'));
						
						// Admin 페이지가 열려있는 상황인 경우 처리
						if (admin_menu_idx && block_idx) {
							$('#admin_log_layer').css('z-index', block_idx+1);
						}
					}
					
				});
			}
		});
	},
	
	"menu_upload_event" : function(is_edit){
		var _self = this;
		
		// 이벤트 처리
		var $menu_ly = $('#menu_upload_layer');
		$menu_ly.find('.btn-close').on('click', function(){
			_self.hidePluginUploadLayer();
		});
		
		if (window.myDropzone_menuico) {
			myDropzone_menuico.destroy();
			myDropzone_menuico = null;
		}
		
		var selectid = 'reg_menu_icon';
		window.myDropzone_menuico = new Dropzone("#" + selectid, { // Make the whole body a dropzone
			url: gap.channelserver + "/FileControl_plugin.do",
			autoProcessQueue: false, 
			parallelUploads: 100, 
			maxFiles: 1,
			maxFilesize: 1024,
			timeout: 180000,
			uploadMultiple: true,
			acceptedFiles: 'image/png',
			withCredentials: false,
			previewsContainer: "#reg_menu_icon",
			clickable: "#" + selectid,
			renameFile: function(file){		
				return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			},
			init: function() {
				myDropzone_menuico = this;
				this.imagelist = new Array();
				
				this.on('dragover', function(e,xhr,formData){
					$("#"+selectid).css("border", "2px dotted #005295");
					return false;
				});
				this.on('dragleave', function(e,xhr,formData){
					$("#"+selectid).css("border", "");
					return false;
				});
				
			},
			success : function(file, json){
				//alert('이미지 등록 성공');
				_self.reg_menu_save();
			},
			error: function(){
				
			}
		});
		
		myDropzone_menuico.is_edit = is_edit;
		
		myDropzone_menuico.on("totaluploadprogress", function(progress) {	
			//$("#show_loading_progress").text(parseInt(progress) + "%");
		});
		
		myDropzone_menuico.on("addedfiles", function (file) {
			// 파일은 하나만 저장되도록 처리함
			if (myDropzone_menuico.files.length >= 2) {
				myDropzone_menuico.removeFile(myDropzone_menuico.files[0]);
			}
			
			// 편집상태인 경우 기존 등록한 미리보기 엘리먼트 삭제
			$('#reg_menu_icon .menu-preview-icon').remove();
		});
		
		myDropzone_menuico.on("sending", function (file, xhr, formData) {
			gap.show_loading(gap.lang.saving);
			
			//$("#"+selectid).css("border", "");
			
			_code = $.trim($('#reg_menu_code').val());
			formData.append("code",_code);
			//formData.append("ky", gap.userinfo.rinfo.ky);
			//formData.append("orikey", (myDropzone_menuico.is_edit ? myDropzone_menuico.orikey : gCol.orikey));
			//formData.append("owner", JSON.stringify(gap.userinfo.rinfo));
			//formData.append("fserver", gap.channelserver);
			//formData.append("saveFolder", "menu");
			//myDropzone_menuico.files_info = "";
		});
		
		// 파일추가
		$('#reg_menu_add_file').on('click', function(){
			$('#reg_menu_icon').click();
		});
		
		
		
		// 담당자 입력
		$('#reg_menu_mng').on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			var terms = $.trim($(this).val());
			if (terms == '') return;
			
			var users = terms.split(',');
			
			gsn.requestSearch('', terms, function(res){
				$.each(res, function(){
					_self.add_menu_mnguser(this);
				});
				$('#reg_menu_mng').focus();				
			});					
			
			
			$(this).val('');
		})
		
		
		// 담당자 입력 (조직도 선택)
		$menu_ly.find('.btn-menu-mng-org').on('click', function(){
			var block_idx = parseInt($('#blockui').css('z-index'));
			$menu_ly.css('z-index', block_idx-1);
			window.ORG.show(
				{
					'title': '담당자 선택',
					'single': false,
					'show_ext' : false, // 외부 사용자 표시 여부
					'select': 'person' // [all, team, person]
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length == 0) return;
						for (var i = 0; i < items.length; i++){
							var _res = gap.convert_org_data(items[i]);
							_self.add_menu_mnguser(_res);
						}
					},
					onClose: function(){
						$menu_ly.css('z-index', block_idx+1);
					}
				}
			);
		});
		
		// 회사 전채선택
		$('#grant_com_allsel').on('click', function(){
			$('#menu_grant_com_list input[type="checkbox"]').prop('checked', true);
		});
		$('#grant_com_desel').on('click', function(){
			$('#menu_grant_com_list input[type="checkbox"]').prop('checked', false);
		});
		
		
		
		// 권한 등록
		$('#reg_menu_grant').on('keydown', function(e){
			if (e.keyCode != 13) return;
			
			var terms = $.trim($(this).val());
			if (terms == '') return;
			
			var users = terms.split(',');
			
			gsn.requestSearch('', terms, function(res){
				$.each(res, function(){
					_self.add_menu_grant(this);
				});
				$('#reg_menu_grant').focus();				
			});					
			
			
			$(this).val('');
		})
		
		// 권한 입력 (조직도 선택)
		$menu_ly.find('.btn-menu-grant-org').on('click', function(){
			var block_idx = parseInt($('#blockui').css('z-index'));
			$menu_ly.css('z-index', block_idx-1);
			window.ORG.show(
				{
					'title': '권한 설정',
					'single': false,
					'show_ext' : false // 외부 사용자 표시 여부
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length == 0) return;
						for (var i = 0; i < items.length; i++){
							var _res = gap.convert_org_data(items[i]);
							_self.add_menu_grant(_res);
						}
					},
					onClose: function(){
						$menu_ly.css('z-index', block_idx+1);
					}
				}
			);
		});
		
		// 저장하기
		$menu_ly.find('.btn-ok').on('click', function(){
			var $this = $(this);
			// 중복 수행 방지
			if ($this.hasClass('process')) return;
			
			$this.addClass('process');

			var valid = _self.reg_menu_valid();
			
			if (!valid) {
				$this.removeClass('process');
				return false;
			}
			

			if (is_edit) {

				_save_menu();
				
			} else {
				var _code = $.trim($('#reg_menu_code').val());
				$.ajax({
					type: "POST",
					async: false,
					url: root_path + "/plugin_dual_check.km",
					dataType : "json",
					data : JSON.stringify({code:_code}),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success: function(res){
						if (res.data.data.exist == 'T') {
							mobiscroll.toast({message:"중복된 Key가 있습니다.", color:"danger"});
							$('#reg_menu_code').focus();
							$this.removeClass('process');
						} else {
							
							// 키 중복 체크 후 최종 저장하는 부분
							_save_menu();							
						}
					},
					error: function(){
						mobiscroll.toast({message:"Key 중복 체크 수행중 오류가 발생했습니다", color:"danger"});
						$this.removeClass('process');
					}
				});
			}
		});
		
		function _save_menu(){
			if (myDropzone_menuico.files.length == 0){
				_self.reg_menu_save();
			}else{
				myDropzone_menuico.processQueue();
			}
		}

	},
	"reg_menu_valid" : function(){
		var _code = $.trim($('#reg_menu_code').val());
		if (_code == '') {
			alert('Key를 입력해주세요');
			$('#reg_menu_code').focus();
			return false;
		}
		
		// 이미지 선택 여부
		// 신규 등록인데 이미지가 없으면 안됨
		if (!myDropzone_menuico.is_edit && myDropzone_menuico.files.length == 0) {
			alert('이미지를 선택해주세요');
			$('#reg_menu_add_file').click();
			return false;
		}
		
		// 메뉴명 (한글, 영문)
		var _menu_kr = $.trim($('#reg_menu_name_kr').val());
		var _menu_en = $.trim($('#reg_menu_name_en').val());
		if (!_menu_kr) {
			alert('메뉴명(한글)을 입력해주세요.');
			$('#reg_menu_name_kr').focus();
			return false;
		}
		if (!_menu_en) {
			alert('메뉴명(영문)을 입력해주세요.');
			$('#reg_menu_name_en').focus();
			return false;
		}
		
		// 설명
		var _content = $.trim($('#reg_menu_cont').val());
		if (!_content) {
			alert('설명을 입력해주세요.');
			$('#reg_menu_cont').focus();
			return false;
		}
		
		return true;
	},
	"reg_menu_save" : function(){
		// 최종 완료 처리
		var _self = this;
		
		gap.show_loading('');
		
		var _code = $.trim($('#reg_menu_code').val());
		var _bgcolor = $.trim($('#reg_menu_bgcolor').val());
		var _menu_kr = $.trim($('#reg_menu_name_kr').val());
		var _menu_en = $.trim($('#reg_menu_name_en').val());
		var _sort = $('#reg_menu_code').data('sort');
		var _content = $.trim($('#reg_menu_cont').val());
		var _prompt = $.trim($('#reg_menu_prompt').val());
		var _mng_user = [];
		var _readers_all = [];
		var _readers_company = [];
		var _readers_deptuser = [];
		var _im_disable = $('#menu_disable_im').is(':checked') ? 'T' : 'F'; 
		
		// 담당자
		$('#menu_mng_user_list li').each(function(){
			_mng_user.push($(this).data('info'));
		});
		
		// 권한 (회사)
		$('#menu_grant_com_list input[type="checkbox"]:checked').each(function(){
			_readers_all.push($(this).val() + "");
			_readers_company.push($(this).val() + "");
		});
		// 권한 (부서,개인)
		$('#menu_grant_list li').each(function(){
			_readers_all.push($(this).data('key') + "");
			_readers_deptuser.push($(this).data('info'));
		});
		// 권한 설정 안한경우 전체 권한 부여
		if (_readers_all.length == 0) {
			_readers_all.push('all');
		}
		
		var obj = JSON.stringify({
			code: _code,
			bg: _bgcolor,
			menu_kr: _menu_kr,
			menu_en: _menu_en,
			content: _content,
			prompt: _prompt,
			manager: _mng_user,
			readers: _readers_all,
			readers_company: _readers_company,
			readers_deptuser: _readers_deptuser,
			im_disable: _im_disable,
			sort: _sort ? _sort : moment().format('YYYYMMDDHHmmss'),	// 소트는 처음 생성시 만들어지고 업데이트 안함
			//sort: moment().format('YYYYMMDDHHmmss'),
			last_update: moment().format('YYYYMMDDHHmmss')
		});

		$.ajax({
			type: 'POST',
			url: root_path + '/plugin_save.km',
			dataType: 'json',
			data: obj,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success: function(res){
				mobiscroll.toast({message:'저장되었습니다', color:'info'});
				$('#show_loading_layer').remove();
				$('#menu_upload_layer .btn-close').click();

				// 리스트를 새로고침해야 함
				if (myDropzone_menuico.is_edit) {
					_self.drawPluginList(_self.cur_page);
				} else {
					_self.drawPluginList(1);					
				}
			},
			error: function(){
				
			}
			
		});		
	},
	
	"add_menu_mnguser" : function(user_info){	// 담당자 추가
		var $list = $('#menu_mng_user_list');
		var ck = $list.find('li[data-key="' + user_info.ky + '"]');
		if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
		
				
		var disp_txt = '';
		user_info = gap.user_check(user_info);
		disp_txt = '<a onclick="gap.showUserDetailLayer(\'' + user_info.ky + '\')">' + user_info.name + ' ' + user_info.jt + ' | ' + user_info.dept + '</a>';
				
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
				$('#menu_mng_user_wrap').hide();
			}
		});
		
		$list.append($li);
		$('#menu_mng_user_wrap').show();
	},
	
	"add_menu_grant" : function(user_info){	// 권한 추가
		var $list = $('#menu_grant_list');
		var ck = $list.find('li[data-key="' + user_info.ky + '"]');
		if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
		
				
		var disp_txt = '';
		user_info = gap.user_check(user_info);
		
		
		
		if (user_info.dsize == 'group'){
			disp_txt = '<a class="grant-group">' + user_info.name + ' | ' + user_info.cp + '</a>';
		} else {
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
				$('#menu_grant_wrap').hide();
			}
		});
		
		$list.append($li);
		$('#menu_grant_wrap').show();
	},

	
	
	
	
	
	
	
	
	
	
	"callRealtimeTraining" : function(){
		var _self = this;
		var postData = {"ky":gap.userinfo.rinfo.ky};	
		
		$.ajax({
			type: 'POST',
			url: this.gptserver_fast + 'run_script',
			dataType : "json",
			data : JSON.stringify(postData),
			contentType : "application/json; charset=utf-8",
			crossDomain: true,
			success: function(res){
				if (res.result == 'OK') {
					setTimeout(function(){
						mobiscroll.toast({message:gap.lang.req_normally, color:'info'});
					}, 2000);					
				} else {
					mobiscroll.toast({message:gap.lang.err_processing, color:'danger'});
				}
			},
			error: function(){
				mobiscroll.toast({message:gap.lang.err_processing, color:'danger'});
			}
		});
	},


	"maxZindex" : function(){
		var zIndexMax = 0;
		$("header, div, article, section, nav, aside, #alram_layer").not("[class*='mbsc-']").each(function(){
			if (!$(this).is(':visible')) return true;
			var z = parseInt($(this).css("z-index"));
			if (z > zIndexMax) zIndexMax = z;
		});
		return parseInt(zIndexMax);
	},
	
	"showBlock" : function(no_close){
		if ($('.pop-layer').length > 0) {
    		return;
    	}
		
		var _self = this;
		var inx = parseInt(_self.maxZindex()) + 1;
		$('#blockui').css("z-index", inx);
		if (no_close) {
			$('#blockui').addClass('no-close');
		}
		$('#blockui').show();
    },
    
    "hideBlock" : function(force_close){
    	if ($('.pop-layer').length > 0) {
    		return;
    	}
    	if ($('#blockui').hasClass('no-close')) {
    		if (force_close) {
    			$('#blockui').removeClass('no-close');
    		} else {
    			return;
       		}
    	}
    	$('#show_loading_layer').remove();
    	$('#blockui').hide();
    },
    
    
    
    "showLoading" : function(text){
    	// 레이어가 떠 있는 상황에서는 표시 안함
    	if ($('.pop-layer').length > 0) {
    		return;
    	}
    	
    	$("#show_loading_layer").remove();
		
		this.showBlock();
		
		var inx = parseInt(this.maxZindex()) + 1;
		
		var html = "";
		html += "<div class='loader' id='show_loading_layer' style='z-index:"+inx+"'>";
		html += "	<div class='sk-circle'>";
		html += "		<div class='sk-circle1 sk-child'></div>";
		html += "		<div class='sk-circle2 sk-child'></div>";
		html += "		<div class='sk-circle3 sk-child'></div>";
		html += "		<div class='sk-circle4 sk-child'></div>";
		html += "		<div class='sk-circle5 sk-child'></div>";
		html += "		<div class='sk-circle6 sk-child'></div>";
		html += "		<div class='sk-circle7 sk-child'></div>";
		html += "		<div class='sk-circle8 sk-child'></div>";
		html += "		<div class='sk-circle9 sk-child'></div>";
		html += "		<div class='sk-circle10 sk-child'></div>";
		html += "		<div class='sk-circle11 sk-child'></div>";
		html += "		<div class='sk-circle12 sk-child'></div>";
		html += "	</div>";
		
		if (text) html += "	<p id='show_loading_text'>"+text+"</p>";
		
		html += "	<div id='show_loading_progress'></div>";
		html += "</div>";
		
		$("body").append(html);
    },
    "hideLoading" : function(){
    	this.hideBlock();
    	var loader_idx = $(".loader").css('z-index');
    	$('#blockui').css('z-index', loader_idx);
		$("#show_loading_layer").fadeOut();
		$(".loader").remove();
    },
    
    
    /*
     * 페이지 관련 함수 S
     */
    "init_page" : function(){
		this.total_page_count = this.get_page_count(this.total_cnt, this.per_page);
		this.initialize_page();
	},
	

	"get_page_count" : function(doc_count, rows){
	//	return ret_page_count = Math.floor(gBody2.total_file_count / rows) + (((gBody2.total_file_count % rows) > 0) ? 1 : 0);
		return ret_page_count = Math.floor(doc_count / rows) + (((doc_count % rows) > 0) ? 1 : 0);
	},
	
	"initialize_page" : function(){
		var _self = this;
		var alldocuments = gptmd.total_cnt;
		if (alldocuments % gptmd.per_page > 0 & alldocuments % gptmd.per_page < gptmd.per_page/2 ){
			gptmd.all_page = Number(Math.round(alldocuments/gptmd.per_page)) + 1
		}else{
			gptmd.all_page = Number(Math.round(alldocuments/gptmd.per_page))
		}	

		if (gptmd.start_page % gptmd.per_page > 0 & gptmd.start_page % gptmd.per_page < gptmd.per_page/2 ){
			gptmd.cur_page = Number(Math.round(gptmd.start_page/this.per_page)) + 1
		}else{
			gptmd.cur_page = Number(Math.round(gptmd.start_page/this.per_page))
		}

		gptmd.initialize_navigator();		
	},
	
	"initialize_navigator" : function(){
		var alldocuments = gptmd.total_cnt;

		if (gptmd.total_page_count == 0){
			gptmd.total_page_count = 1;
		}

		if (alldocuments == 0){
			alldocuments = 1;
			gptmd.total_page_count = 1;
			gptmd.cur_page = 1;
		}

		if (alldocuments != 0) {
			
			if (gptmd.total_page_count % 10 > 0 & gptmd.total_page_count % 10 < 5 ){
				var all_frame = Number(Math.round(gptmd.total_page_count / 10)) + 1
			}else{
				var all_frame = Number(Math.round(gptmd.total_page_count / 10))	
			}

			if (gptmd.cur_page % 10 > 0 & gptmd.cur_page % 10 < 5 ){
				var c_frame = Number(Math.round(gptmd.cur_page / 10)) + 1
			}else{
				var c_frame = Number(Math.round(gptmd.cur_page / 10))
			}

			var nav = new Array();
			if (c_frame == 1){
				nav[0] = '';
			}else{
				nav[0] = '<li title="이전" class="p-prev" onclick="gptmd.goto_page(' + ((((c_frame-1) * 10) - 1)*gptmd.per_page + 1) + ',' + ((c_frame - 1) * 10) + ');"><span>&lt;</span></li>';
			}			

			var pIndex = 1;
			var start_page = ((c_frame-1) * 10) + 1;

			for (var i = start_page; i < start_page + 10; i++){
				if (i == gptmd.cur_page){
					if (i == '1'){
						nav[pIndex] = '<li class="active">' + i + '</li>';
					}else{
						if (i % 10 == '1'){
							nav[pIndex] = '<li class="active">' + i + '</li>';
						}else{
							nav[pIndex] = '<li class="active">' + i + '</li>';
						}
					}
				}else{
					if (i == '1'){
						nav[pIndex] = '<li onclick="gptmd.goto_page(' + (((i-1) * gptmd.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
					}else{
						if (i % 10 == '1' ){
							nav[pIndex] = '<li onclick="gptmd.goto_page(' + (((i-1) * gptmd.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}else{
							nav[pIndex] = '<li onclick="gptmd.goto_page(' + (((i-1) * gptmd.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}
					}
				}				

				if (i == gptmd.total_page_count) {
					break;
				}
				pIndex++;				
			}

			if (c_frame < all_frame){
				nav[nav.length] = '<li title="다음" class="p-next" onclick="gptmd.goto_page(' + ((c_frame * gptmd.per_page * 10) + 1) + ',' + ((c_frame * 10) + 1) + ');"><span>&gt;</span></li>';
			}
			var nav_html = '';

			if (c_frame != 1 ){
				nav_html = '<li title="처음" class="p-first" onclick="gptmd.goto_page(1,1);"><span>&lt;&lt;</span></li>';
			}		    
			for( var i = 0 ; i < nav.length ; i++){	
				nav_html += nav[i];
			}
					
			nav_html += "</TD>"; 

			if (c_frame < all_frame){
				nav_html += '<li title="마지막" class="p-last" onclick="gptmd.goto_page(' + ((gptmd.all_page - 1) * gptmd.per_page + 1) + ',' + gptmd.all_page + ')"><span>&gt;&gt;</span></li>';
			}
			
			if (gptmd.page_type == "type_4"){
				$("#plugin_paging_area").html(nav_html);
			} else {
				$("#paging_area").html(nav_html);				
			}
		}		
	},
	
	"goto_page" : function(idx, page_num){
	
		if (gptmd.total_cnt < idx) {
			gptmd.start_page = idx - 10;
			if ( gptmd.start_page < 1 ) {
				return;
			}
		}else{
			gptmd.start_page = idx;
		}
		cur_page = page_num;
		
		if (gptmd.page_type == "type_1"){
			gptmd.drawUploadList(page_num);
		} else if (gptmd.page_type == "type_2"){
			gptmd.drawQuestionList(page_num);
		} else if (gptmd.page_type == "type_3"){
			gptmd.drawComplainList(page_num);
		} else if (gptmd.page_type == "type_4"){
			gptmd.drawPluginList(page_num);
		}

	}
    // 페이지 관련 함수 E
 }