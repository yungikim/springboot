
function gFilesFN(){

	this.disp_view_mode = (localStorage.getItem('view_mode') == null ? "list" : localStorage.getItem('view_mode'));
	this.select_left_menu = "";
	this.select_drive_code = "";
	this.select_drive_name = "";
	this.select_folder_code = "";
	this.select_folder_name = "";
	this.title_path_name = [];
	this.title_path_code = [];
	this.per_page = (this.disp_view_mode == "list" ? "10" : "20");
	this.all_page = "1";
	this.start_skp = "";
	this.start_page = "1";
	this.cur_page = "1";
	this.start_nav = "1";	
	this.total_page_count = "";
	this.total_file_count = "";
	this.query_str = "";
	this.cur_file_count = 0;
	this.cur_file_total_count = 0;
	this.fisrt = "";
	this.my_channel_info = "";
	this.my_drive_info = "";
	this.my_folder_info = "";
	this.ts_per_page = "20";
	this.ts_query = "";
	this.ts_category = "";
	this.ts_select_id = "";
	this.aleady_select_user_count = 0;
	this.all_files_selected_tab = "";
	this.all_files_selected_member = "";
	this.is_dev = false;
	this.is_before_block = false;
	this.top_layer_element = null;
	this.quick_cal = null;
	this.menu_length = 19;
	this.select_channel_code = "";
	this.select_channel_name = "";
	this.parent_folder_info = "";			//현재 클릭된 폴더의 상위폴더 정보 배열
	this.cur_folder_info = "";				//현재 클릭된 폴더의 정보 배열	
	this.cur_drive_list_info = ""; 			//현재 가입된 드라이브의 정보 배열
	this.cur_drive_folder_list_info = "";	//드라이브 폴더 리스트 정보 배열	
	this.click_filter_image = "";   		//파일 필터링 선택한 형식
	this.select_file_info = "";
	this.is_box_layer_open = false;
	this.right_window_open = false;
	this.files_dropdown_flag = true;

	try{
		this.is_dev = document.location.host.search(/dev/i) != -1;
	}catch(err){}
} 

gFilesFN.prototype = {
	"init" : function(){

	},
	
	"showMainFiles" : function(){
		var _self = this;
		
		gap.cur_window = "drive";
		$("#left_main").css("width","312px");
		$("#left_main").show();
		$("#center_content").show();
		$("#center_content").off();
		$("#center_content").removeAttr("class");
		
		// 가운데 화면, 우측 화면 처리
		$('#center_content').html('').css('width', '100%');
		
		
		this.drive_left_draw();		
		this.show_drive();		
		$("#main_body").css("right","0px").css("left","378px").css("background","#F7F7F7");
	},
	
	"drive_left_draw" : function(){
		var _self = this;
		
		var html = 	
			'<div class="nav-wide" id="nav_left_menu">' +
			'	<div  class="mu_work" style="overflow:hidden; height:100%; background-color:white">' +
			'		<h2 class="left-title" style="border:0px"></h2>' +
			'		<div class="nav-channel" id="left_channel" style="display:none; overflow:hidden ">' +
			'			<div class="filter" id="channel_filter">' +
			'				<ul>' +
			'					<li><button class="ico btn-filter-ppt" title="ppt"></button></li>' +
			'					<li><button class="ico btn-filter-word" title="word"></button></li>' +
			'					<li><button class="ico btn-filter-excel" title="excel"></button></li>' +
			'					<li><button class="ico btn-filter-pdf" title="pdf"></button></li>' +
			'					<li><button class="ico btn-filter-img" title="image"></button></li>' +
			'					<li><button class="ico btn-filter-video" title="video"></button></li>' +
			'				</ul>' +
			'			</div>' +
			'			<div class="lnb" id="channel_option">' +
			'				<ul>' +
			'					<li class="lnb-all on" id="allcontent_drive"><em><span class="ico"  style="margin-top:8px"></span></em></li>' +
			'					<li class="lnb-upload" id="mycontent_drive"><em><span class="ico" style="margin-top:8px"></span></em></li>' +
			'					<li class="lnb-share" id="sharecontent_drive"><em><span class="ico" style="margin-top:8px"></span></em></li>' +
			'					<li class="lnb-bookmark" id="favoritecontent_drive"><em><span class="ico" style="margin-top:8px"></span></em></li>' +
			'				</ul>' +
			'			</div>' +
			'			<div class="folder-area" id="left_channel_list" style="border-top:none; margin-top:0px; overflow:hidden; height:calc(100% - 200px)">' +
			'			</div>' +
			'			<div id="left_drive_btn">' +	
			'				<button class="btn-work-add" id="create_drive_room_left"><span class="ico ico-plus" style="left:80px"></span>' + gap.lang.create_drive + '</button>' +	
			'			</div>' +
			'		</div>' +
			'		<div class="nav-list room" id="left_mail" style="display:none; padding-right:5px; overflow:hidden">' +
			'			<div class="nav-list-top">' +
			'				<div class="nav-category">' +
			'					<div class="input-field selectbox">' +
			'						<select id="mailbox_select">' +
			'							<option value="1" selected id="menu_inbox">Inbox</option>' +
			'							<option value="2" id="menu_sent">Sent</option>' +
			'						</select>' +
			'					</div>' +
			'				</div>' +
			'				<button class="ico btn-search" id="btn_search">Search</button>' +
			'				<button class="ico btn-search-close" id="btn_search_close" style="">Close</button>' +
			'				<button class="ico btn-mail-write" id="mail_compose_btn">Compose</button>' +
			'				<div class="mail-search" id="left_mail_search" style="display:none;">' +
			'					<div class="input-field">' +
			'						<input type="text" id="mail_search_query_field" autocomplete="off" class="formInput" placeholder="">' +
			'						<span class="bar"></span>' +
			'					</div>' +
			'					<button class="ico btn-search" id="mail_search_btn">Search</button>' +
			'				</div>' +
			'			</div>' +
			'			<div id="left_mail_list" class="ui-droppable" style="height:calc(100% - 50px)">' +
			'				<div id="left_mail_sub" style=""></div>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'</div>'
			
	//	$("#nav_left_menu").html(html);	
		$("#left_main").html(html);			
		this.drive_left_event_handler();
		this.channel_right_frame_close();
		this.draw_first_list();
	},
	
	"drive_left_event_handler" : function(){
		var _self = this;
		
		$("#create_drive_room_left").off().on("click", function(e){
			_self.create_drive();
		});	
		$("#channel_option li").off().on("click", function(e){			
			//Plugin 실행후 다시 Box UI로 돌아가는 함수 호출
			_self.backto_box_layout();
			//////////////////////////////////////////////					
			var id = e.currentTarget.id;					
			_self.removeClass_channel();
			$("#" + id).addClass("on");			
			//필터링 설정한 부분을 초기화 한다.
			_self.click_filter_image = "";
			$("#channel_filter ul li button").removeClass("on");	
					
			//1-전체파일, 2-내가올린 파일, 3-공유된 파일, 4-즐겨찾기
			if (id == "allcontent_drive"){
				_self.select_left_menu = "1";				
			}else if (id == "mycontent_drive"){
				_self.select_left_menu = "2";				
			}else if (id == "sharecontent_drive"){
				_self.select_left_menu = "3";				
			}else if (id == "favoritecontent_drive"){
				_self.select_left_menu = "4";
			}			
			_self.channel_right_frame_close();			
			$("#ch_query").val("");
			_self.query_str = "";
			
			if (_self.select_left_menu == "4"){
				//즐겨찾기 호출
				_self.draw_favorite_data(1);				
			}else{
				_self.draw_main_data(1);
			}
		});	
		$("#channel_filter ul li button").on("click", function(e){
			//Plugin 실행후 다시 Box UI로 돌아가는 함수 호출
			_self.backto_box_layout();
			/////////////////////////////////////////////		
			$("#channel_filter ul li button").removeClass("on");		
			var id = $(this).get(0).className;
			var filter = "";
			var pre_filter = _self.click_filter_image;			
			if ( (id.indexOf(pre_filter) > -1) && (pre_filter != "")){
			//	alert("기존에 클릭한 거 클릭");
				_self.click_filter_image = "";				
				if (_self.select_left_menu == "4"){
					//즐겨찾기 호출
					_self.draw_favorite_data(1);					
				}else{
					if (_self.select_left_menu == ""){
						_self.draw_drive_data(1);						
					}else{
						_self.draw_main_data(1);
					}
				}				
				$(this).removeClass("on");
			}else{			
				if (id == "ico btn-filter-ppt"){
					//filter = "ppt-spl-pptx";
					_self.click_filter_image = "ppt";
				}else if (id == "ico btn-filter-word"){
					//filter = "doc-spl-docs";
					_self.click_filter_image = "word";
				}else if (id == "ico btn-filter-excel"){
					//filter = "xls-spl-xlsx";
					_self.click_filter_image = "excel";
				}else if (id == "ico btn-filter-pdf"){
					//filter = "pdf";
					_self.click_filter_image = "pdf";
				}else if (id == "ico btn-filter-img"){
					//filter = "jpg-spl-jpeg-spl-gif-spl-bmp-spl-png";
					_self.click_filter_image = "img";
				}else if (id == "ico btn-filter-video"){
					//filter = "avi-spl-wmv-spl-mp4-spl-mkv-spl-mov";
					_self.click_filter_image = "video";
				}				
				$(this).addClass("on");				
				if (_self.select_left_menu == "4"){
					//즐겨찾기 호출
					_self.draw_favorite_data(1);					
				}else{
					if (_self.select_left_menu == ""){
						_self.draw_drive_data(1);						
					}else{
						_self.draw_main_data(1);
					}
				}
			}
		});	
	},
	
	"clear_dropzone_folder" : function(){
		$("#total-progress_folder").hide();
		myDropzone_folder.removeAllFiles(true);		
	},
	
	"complete_process_folder" : function(){
		$("#total-progress_folder").fadeOut(function(){
			document.querySelector("#folder_process").style.display = "none";
			document.querySelector("#folder_process").style.width = "0%";

		});
	},		
	
	"folder_file_upload_event" : function(){
		var _self = this;
		var isdropzone = $("#sub_channel_content")[0].dropzone;
		if (isdropzone) {
			isdropzone.destroy();
			//return false;
		}		
		if ($("#drive_file_upload_btn").length == 0){
			return false;
		}		
		//gBody2의 폴더에서 업로드 파일 클릭할 때 호출 되는 함수
			myDropzone_folder = new Dropzone("#sub_channel_content", { // Make the whole body a dropzone
		    url: gap.channelserver + "/FileControl.do", // Set the url
		 //     url : gap.fileupload_server_url + "/" + gap.search_today_only(),
		    autoProcessQueue : true, 
			parallelUploads : 100,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
			maxFilesize: 1500,
			timeout: 2000000,
		  	uploadMultiple: true,
		  	withCredentials: false,
		  	previewsContainer: "#previews_channel", // Define the container to display the previews
		  	clickable: "#drive_file_upload_btn", // Define the element that should be used as click trigger to select files.		  	
		  	renameFile: function(file){
				return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			},		  	
		  	init: function() {			
				myDropzone_folder = this;
				this.imagelist = new Array();
				this.on('dragover', function(e,xhr,formData){
					if (_self.drive_size_over){
						_self.alert_size_over();
						return false;
					}
		        	$("#wrap_drive_data_list").css("border", "2px dotted #005295");		        	
		        	return false;
		        });
		        this.on('dragleave', function(e,xhr,formData){
		        	$("#wrap_drive_data_list").css("border", "");
		        	return false;
		        });					
		    },		    
		    addedfile: function (file) {		    	
		    	$("#wrap_drive_data_list").css("border", "");		    	
		    	gap.dropzone_upload_limit(this, file, "box");
		    },		    
		    success : function(file, json){			    	
		     	var jj = JSON.parse(json);	    	  		    	 		
		    }
		});
		
		myDropzone_folder.on("sending", function (file, xhr, formData) {
			gap.show_loading(gap.lang.saving);			
			$("#wrap_drive_data_list").css("border", "");			
			$("#total-progress_folder").show();
			document.querySelector("#folder_process").style.display = "";			
			formData.append("email", gap.userinfo.rinfo.ky);
			formData.append("ky", gap.userinfo.rinfo.ky);
		//	formData.append("content", $("#fileupload_content").val());			
			formData.append("drive_code", _self.select_drive_code);
			formData.append("drive_name", _self.select_drive_name);
			formData.append("folder_code", _self.select_folder_code);
			formData.append("folder_name", _self.select_folder_name);					
			formData.append("owner", JSON.stringify(gap.userinfo.rinfo));
			formData.append("fserver", gap.channelserver);
			formData.append("type", "folder");
			formData.append("folder_depth", _self.title_path_code);			
			xhr.ontimeout = (function() {
	          /*Execute on case of timeout only*/
	            alert('Server Connection Timeout');
	            gap.hide_loading();					
				_self.clear_dropzone_folder();
				var xtime1 = setTimeout(function(){
					_self.complete_process_folder();
					clearTimeout(xtime1);
					_self.draw_drive_data(1);
				}, 800);
		    });			
		});		
		myDropzone_folder.on("totaluploadprogress", function(progress) {		
			$("#show_loading_progress").text(parseInt(progress) + "%");
			document.querySelector("#folder_process").style.width = progress + "%";			
		});
		myDropzone_folder.on("queuecomplete", function (file) {	
			//파일을 컨텐트 영역에 그린다. ////////////		
			//console.log("파일 업로드가 완료되었습니다.");					
			//폴더에 파일이 등록되었다고 멤버에게 알린다.
			
			var is_folder = "";
			if (_self.select_folder_code == "root"){
				//드라이브를 클릭한 경우
			//	is_folder = "[" +gBody2.select_drive_name + "]" + gap.lang.mydrive + " " + gap.lang.reg_file;
				is_folder = "[" +_self.select_drive_name + "] " +  gap.lang.reg_file;
				var list = _self.search_drive_members(_self.select_drive_code);
			}else{
				//특정 폴더에 들어간 경우
			//	is_folder = "[" +gBody2.select_folder_name + "]" + gap.lang.folder + " " + gap.lang.reg_file; 
				is_folder = "[" +_self.select_folder_name + "] " + gap.lang.reg_file; 
				var list = _self.search_folder_members();
			}			
			/////////////////////////////////////////////////////////////////////////////////////////
			var sender_list = [];
			if (typeof(list.member) != "undefined"){
				for (var i = 0 ; i < list.member.length; i++){
					var mk = list.member[i].ky;
					if (mk != gap.userinfo.rinfo.ky){					
						sender_list.push(mk);
					}
				}				
				if (sender_list.length > 0){
					var obj = new Object();
					obj.type = "drive_upload";  //파일엄로드
					obj.p_code = _self.select_drive_code;
					obj.p_name = _self.select_drive_name;
					obj.title = _self.select_folder_name;
					obj.sender = sender_list;  //해당 프로젝트의 owner에게만 전송한다.							
					_wsocket.send_drive_msg(obj);	
				}
			}		
			if (list.owner.ky != gap.userinfo.rinfo.ky){
				var obj = new Object();
				obj.type = "drive_upload";  //파일 업로드
				obj.p_code = _self.select_drive_code;
				obj.p_name = _self.select_drive_name;
				obj.title = _self.select_folder_name;
			//	obj.sender = list.owner.ky;  //해당 프로젝트의 owner에게만 전송한다.		
				var xlist = [];
				xlist.push(list.owner.ky);
				obj.sender = xlist;
				_wsocket.send_drive_msg(obj);				
				sender_list.push(list.owner.ky);
			}			
			 //모바일  Push를 날린다. ///////////////////////////////////						
			var smsg = new Object();
			smsg.msg = is_folder
			smsg.title = gap.systemname + "["+gap.lang.drive+"]";		
			smsg.type = "drive_upload";
			smsg.key1 = _self.select_drive_code;
			smsg.key2 = _self.select_folder_code;			
			if (_self.select_folder_name == ""){
				smsg.key3 = _self.select_drive_name;
			}else{
				smsg.key3 = _self.select_folder_name;
			}			
			smsg.fr = gap.userinfo.rinfo.nm;
			//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
			smsg.sender = sender_list.join("-spl-");										
		//	gap.push_noti_mobile(smsg);		
			
			//알림센터에 푸쉬 보내기
			var rid = gBody2.select_drive_code;
			var receivers = sender_list;
			var msg2 = is_folder;
			var sendername = "["+gap.lang.drive+" : "+ gap.textToHtml(smsg.key3) +"]"
			gap.alarm_center_msg_save(receivers, "kp_files", sendername, msg2, rid, smsg);	
			////////////////////////////////////////////////////
			/////////////////////////////////////////////////////////////////////////////////////////
			gap.hide_loading();	
			_self.clear_dropzone_folder();
			var xtime1 = setTimeout(function(){
				_self.complete_process_folder();
				clearTimeout(xtime1);
				_self.draw_drive_data(1);
			}, 800);
		});	
	},	
	
	"removeClass_channel" : function(){
		$("#channel_option li").removeClass("on");
		$("#left_channel_list .drive-code").removeClass("on");
		$("#left_channel_list .channel-code").removeClass("on");
		$("#left_channel_list li").removeClass("on");
		$("#left_channel_list .folder-code").removeClass("on");
	},

	"backto_box_layout" : function(){	
		$("#channel_list").empty();
		$("#channel_top_list").css("padding", "20px 20px 14px 20px");
		$("#channel_list").css("height", "100%");
		$("#channel_list").addClass("wrap-channel");
		$("#channel_list").removeClass("left-area todo fold-temp");				
		$("#channel_right").show();
		$("#member_layer_close2").click();	
		//우측 상단 검색창을 연다.
		$(".channel-search").show();	
	},
	
	"channel_right_frame_close" : function(){		
		$(".left-area").css("width", "100%");							
		$("#ext_body").hide();
		$("#user_profile").hide();
		$("#chat_profile").hide();		
		$("#channel_right").hide();		
		$("#main_body").css("width", "");
	},
	
	"box_layer_open" : function(){
		var _self = this;

		$("#ext_body").addClass("view-info");
		$("#ext_body").css("overflow", "hidden");
		$("#ext_body").css("width", gap.right_box_page_width);
		$("#ext_body").fadeIn(function(){
			$(".left-area").css("width", "calc(100% - " + gap.right_box_page_width + ")");
		});
		$("#drive_data_list").addClass("line2");
		$("#favorite_data_list").addClass("line2");
		$("#files_data_list").addClass("line2");
		this.is_box_layer_open = true;
	},
	
	"box_layer_close" : function(){
		var _self = this;
		
		if (this.check_selected_top_menu()){
			$(".left-area").css("width", "100%");
		}else{
			$(".left-area").css("width", "calc(100% - " + gap.right_page_width + ")");
		}
			
		$("#ext_body").removeClass("view-info");
		$("#ext_body").empty();
		$("#ext_body").fadeOut();
		$("#drive_data_list").removeClass("line2");
		$("#favorite_data_list").removeClass("line2");
		$("#files_data_list").removeClass("line2");
		$("#main_data_list").removeClass("line2");
		this.box_search_layer_close();
		this.is_box_layer_open = false;
	},
	
	"box_search_layer_close" : function(){
		$("#ext_body_search").removeClass("channel");
		$("#ext_body_search").removeClass("chat-area");
	},	
	
	"check_my_drive_size" : function(){
		var _self = this;
		var url = gap.channelserver + "/api/files/my_drive_size.km";
		var data = JSON.stringify({});
		
		$.ajax({
			type : "POST",
			dataType : "json",
			url : url,
			data : data,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){				
				if (res.result == "OK"){					
					var usesize = parseFloat(res.data.sum.$numberLong);
					var fullsize = parseFloat(res.data.dsize);
					if (res.data.dsize == "0" || res.data.dsize== ""){
						//값이 지정되지 않을 경우 10G로 설정한다.
						fullsize = 10737418240;
					}
					var rate = parseInt((usesize / fullsize) * 100);
					var us = gap.file_size_setting(usesize);
					var fs = gap.file_size_setting(fullsize);					
					if (rate > 99){
						gBody.drive_size_over = true;
					}					
					$("#userate").css("width", rate + "%");
					$("#usesize").html(us);
					$("#fsize").html(fs);
				}else{
					gap.gAlert(gap.lang.errormsg);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		})
	},		
	
	"show_drive" : function(){
		var _self = this;
		var html = "";	
				
		//드라이브 목록 표시하기
		$("#allcontent_drive em").html("<span class='ico' style='margin-top:8px'></span>" + gap.lang.allcontent_drive);	
		$("#sharecontent_drive em").html("<span class='ico' style='margin-top:8px'></span>" + gap.lang.sharecontent_drive);	
		$("#mycontent_drive em").html("<span class='ico' style='margin-top:8px'></span>" + gap.lang.mycontent_drive);		
		$("#favoritecontent_drive em").html("<span class='ico' style='margin-top:8px'></span>" + gap.lang.ff);	
	
		html += "<div class='amount-used'>";
		html += "	<div class='bar'><span id='userate' style='width: 0%;'></span></div>";
		html += "	<div class='size'><span class='current-size'><span id='usesize'>0</span></span>/<span class='limit-size' id='fsize'></span></div>";
		html += "</div>";
		html += '<div class="lnb-drive channel-category">';
		html += '	<h3><button class="top-btn-fold on">접기</button><a href="#">' + gap.lang.und + '</a></h3>';
		html += '	<button class="ico btn-more driveinfo" id="create_share_drive">더보기</button>';
		html += '	<ul id="share_drive_list">';
		html += '	</ul>';
		html += '</div>';		
		html += '<div class="lnb-drive channel-category">';
		html += '	<h3><button class="top-btn-fold on">접기</button><a href="#">' + gap.lang.ccd + '</a></h3>';
		html += '	<button class="ico btn-more driveinfo" id="create_person_drive">더보기</button>';
		html += '	<ul id="person_drive_list">';
		html += '	</ul>';
		html += '</div>';	
		$("#left_channel_list").mCustomScrollbar('destroy');	
		$("#left_channel_list").html(html);	
		
		//내 사이즈 체크해서 표시한다.
		this.check_my_drive_size();	
			
		// 드라이브 리스트 정보 가져오기
		var surl = gap.channelserver + "/api/files/drive_list_all.km";
		var postData = JSON.stringify({});
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){				
				_self.draw_drive_left(res);
				_self.__drive_left_event();
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
		
		$("#left_channel_list").mCustomScrollbar({
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
			autoHideScrollbar : true
		});
		
		$(".ico.btn-more.driveinfo").off().on("click", function(){
			$.contextMenu({
				selector : ".ico.btn-more.driveinfo",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){
					_self.context_menu_call_drive_mng(key, options, $(this).parent().attr("id"));
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
	            	},
	            	show : function (options){
	            	}
				},			
				build : function($trigger, options){
					var is_drive_share = ($trigger.attr("id") == "create_share_drive" ? "Y" : "N");
					return {
						items: _self.drive_info_menu_content(is_drive_share)
					}
				}
			});			
		});
		
		// left frame collapse/expand
		$("#nav_left_menu .btn-left-fold").off().on("click", function(e){			
			$("#nav_left_menu").hide();
			$("#todo_left_col").show();			
			$("#left_main").css("width", "15px");
			$("#main_body").css("left", "70px");			
			$("#main_body").css("width", "");
		});
		
		$("#todo_left_col").off().on("click", function(e){			
			$("#nav_left_menu").show();
			$("#todo_left_col").hide();			
			$("#left_main").css("width", "312px");
			$("#main_body").css("left", "366px");
		});					
	},	
	
	"draw_first_list" : function(){
		var _self = this;
		
		this.select_left_menu = "1";	//1-전체파일, 2-내가올린 파일, 3-공유된 파일
		this.draw_main_data(1);
	},
	
	"draw_main_data" : function(page_no){
		var _self = this;
		
		this.select_drive_code = "";
		
		if (page_no == 1){
			$("#sub_channel_content").empty();
			$("#sub_channel_content").addClass("drive");
			
			this.start_page = "1";
			this.cur_page = "1";
			this.per_page = (this.disp_view_mode == "list" ? "10" : "20");
			this.cur_file_count = 0;
			this.cur_file_total_count = 0;
			
			var title = "";
			if (this.select_left_menu == "1"){
				title = gap.lang.allcontent_drive;
				
			}else if (this.select_left_menu == "2"){
				title = gap.lang.mycontent_drive;
				
			}else if (this.select_left_menu == "3"){
				title = gap.lang.sharecontent_drive;
			}
			
			var html = "";
			
			html += '<div class="chat-area">';
			html += '	<div class="channel-header">';
		//	html += '		<h2>' + title + gBody3.expand_collapse_btn() + '</h2>';
			html += '		<h2>' + title + '</h2>';
			html += '		<div class="channel-search-wrap">';
			html += '			<div class="channel-search">';
			html += '				<div class="input-field">';
			html += '					<input type="text" autocomplete="off" value="' + this.query_str + '" id="ch_query" placeholder="' + gap.lang.input_search_query + '" />';
			html += '				</div>';
			html += '				<button class="ico btn-channel-search" id="ch_query_btn">검색</button> ';
			html += '			</div>';
			html += '		</div>';
			html += '		<div class="drive-btns">';
			if (this.select_left_menu != "3"){
				html += '			<button id="drive_file_download_btn">' + gap.lang.download + '</button>';
				html += '			<button id="drive_move_file_btn"><span>' + gap.lang.move + '</span></button>';
				html += '			<button id="drive_delete_file_btn"><span>' + gap.lang.basic_delete + '</span></button>';
				html += '			<button id="drive_select_all_btn"><span>' + gap.lang.selectall + '</span></button>';
				html += '			<button id="drive_deselect_all_btn"><span>' + gap.lang.deselection + '</span></button>';

			}				
			html += '			<button id="view_mode_list" class="ico btn-mode-list' + (this.disp_view_mode == "list" ? " on" : "") + '"><span>리스트보기</span></button>';
			html += '			<button id="view_mode_image" class="ico btn-mode-img' + (this.disp_view_mode == "image" ? " on" : "") + '"><span>이미지보기</span></button>';
	//		html += '			<button id="view_mode_gallery" class="ico btn-mode-gallery' + (this.disp_view_mode == "gallery" ? " on" : "") + '"><span>갤러리보기</span></button>';
			html += '		</div>';
			html += '	</div>';
			
			
			html += '	<div class="wrap-channel" id="wrap_main_data_list" style="overflow:hidden; height:100%;padding-top:30px;">';
			if (this.disp_view_mode == "list"){
				html += '		<div class="list" id="main_data_list">';
				html += '			<ul id="main_file_list_area">';		
				html += '			</ul>';
				html += '		</div>';
				html += '		<div class="paging">';
				html += '			<ul id="paging_area">';
				html += '			</ul>';
				html += '		</div>';
				
			}else{
				html += '		<div id="main_data_gallery">';
				html += '			<ul class="gallery" id="main_data_gallery_area">';
				html += '			</ul>';
				html += '		</div>';			
			}

			html += '	</div>';
			html += '</div>';
			
			$("#sub_channel_content").html(html);
		}

		if (gRM.is_box_layer_open){
			$("main_data_list").addClass("line2");
		}
		
		//채탱화면에서 드라이브를 바로 클릭한 경우 화면을 전환해야 한다.
		gap.show_content("channel");
		$("#left_channel").show();
		$("#chat_profile").hide();
		//////////////////////////////////////////////////////////////////////		
		
		this.start_skp = (parseInt(this.per_page) * (parseInt(page_no))) - (parseInt(this.per_page) - 1);
		var surl = gap.channelserver + "/api/files/folder_list_main.km";
		
		//"dtype" : 은 파일 형식으로 필터링 할때 사용한다. ppt, xls, doc, pdf, image, movie, hwp, txt, etc
	
		var postData = {
				"start" : (this.start_skp - 1).toString(),
				"perpage" : this.per_page,
				"q_str" : this.query_str,
				"dtype" : this.click_filter_image,
				"type" : this.select_left_menu
			};	

		$.ajax({
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
				if (res.result == "OK"){
					_self.cur_file_count += res.data.filelist.length;
					_self.cur_file_total_count = res.data.totalcount;
					_self.draw_main_data_list(page_no, res.data);	
					
				}else{
					if (_self.query_str != "" && res.filelist == null){
						_self.cur_file_count = 0;
						_self.cur_file_total_count = 0;
						_self.draw_main_data_list(1, {data:[], totalcount:0});	
						return false;
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}					
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
		
		$("#ch_query").keypress(function(e){
			if (e.keyCode == 13){
				_self.search_enter(_self.select_left_menu);
			}
		});
		$("#ch_query_btn").on("click", function(e){
			_self.search_enter(_self.select_left_menu);
		});
		$("#drive_file_download_btn").on("click", function(){
			_self.drive_download_file();
		});
		$("#drive_move_file_btn").on("click", function(){
			_self.drive_move_file();
		});
		$("#drive_delete_file_btn").on("click", function(){
			if (_self.select_left_menu == "4"){
				_self.delete_favorite_file();
				
			}else{
				_self.drive_delete_select_item();
			}
			
		});
		$("#drive_select_all_btn").on("click", function(){
			_self.drive_select_all_item();
		});
		$("#drive_deselect_all_btn").on("click", function(){
			_self.drive_deselect_item();
		});
		$("#view_mode_list").on("click", function(){
			localStorage.setItem('view_mode', 'list');
			_self.disp_view_mode = "list";
			_self.draw_main_data(1);
		});
		$("#view_mode_image").on("click", function(){
			localStorage.setItem('view_mode', 'image');
			_self.disp_view_mode = "image";
			_self.draw_main_data(1);
		});
		$("#view_mode_gallery").on("click", function(){
			localStorage.setItem('view_mode', 'gallery');
			_self.disp_view_mode = "gallery";
			_self.draw_main_data(1);
		});	
	},	
	
	"draw_main_data_list" : function(page_no, res){
		var _self = this;
		
		if (this.query_str == "" && res.filelist.length == 0){
			//데이터가 없는 경우
			var html = '<div class="msg-empty"><img src="' + window.root_path + '/resource/images/empty.png" alt="" />' + gap.lang.no_upload_file + '</div>';
			$("#wrap_main_data_list").empty();
			$("#wrap_main_data_list").html(html);
			return false;
		}
		
		if (this.query_str != "" && res.filelist.length == 0){
			//검색된 파일이 없는 경우
			var html = '<div class="msg-empty"><img src="' + window.root_path + '/resource/images/empty.png" alt="" />' + gap.lang.searchnoresult + '</div>';
			$("#wrap_main_data_list").empty();
			$("#wrap_main_data_list").html(html);
			return false;
		}
		
		if (this.disp_view_mode == "list"){
			$("#main_file_list_area").html('');		
		}

		for (var k = 0;  k < res.filelist.length; k++){
			var file_info = res.filelist[k];
			var file_id = file_info._id.$oid;
			var user_info = gap.user_check(file_info.owner);
			var disp_file_name = gap.get_bun_filename(file_info);
			var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(typeof(file_info.lastupdate) != "undefined" ? file_info.lastupdate : file_info.GMT));
			var disp_time = gap.change_date_localTime_only_time(String(typeof(file_info.lastupdate) != "undefined" ? file_info.lastupdate : file_info.GMT));
			var icon_kind = gap.file_icon_check(file_info.filename);
			var downloadurl = gap.search_file_convert_server(file_info.fserver) + "FDownload.do?id=" + file_info._id.$oid + "&ty=" + (this.select_left_menu == "4" ? "3" : "1") + "&ky="+gap.userinfo.rinfo.ky;
			var show_thumb = false;
			var file_html = '';
			
			if (this.disp_view_mode == "list"){
				file_html += '	<li id="' + file_id + '" style="list-style:none;' + (this.select_left_menu == "3" ? "padding-left:60px;'" : "") + '">';
				if (this.select_left_menu != "3"){
					file_html += '		<div class="checkbox">';
					file_html += '			<label>';
					file_html += '				<input type="checkbox" name="file_checkbox" value="' + file_id + '"><span class="checkbox-material"><span class="check"></span></span>';
					file_html += '			</label>';
					file_html += '		</div>';					
				}
					
				file_html += '		<a style="cursor:pointer" id="file_' + file_id + '" owner="' + file_info.owner.ky + '" fserver="' + file_info.fserver + '" fname="' + disp_file_name + '" fsize="' + file_info.file_size.$numberLong + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '">';
				file_html += '			<span class="ico ico-file ' + icon_kind + '"' + (this.select_left_menu == "3" ? " style='left:20px'" : "") + '></span>';
				file_html += '			<dl>';
				file_html += '				<dt class="files-main"><strong>' + disp_file_name + '</strong> <span>(' + gap.file_size_setting(file_info.file_size.$numberLong) + ')</span></dt>';
				file_html += '				<dd><span>' + user_info.name + gap.lang.hoching + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
				file_html += '				<dd><span class="channel-name">' + file_info.drive_name + '</span></dd>';
				file_html += '			</dl>';
				file_html += '		</a>';
				file_html += '		<button class="ico btn-more main-file-menu"></button>';
				file_html += '	</li>';
				
				$("#main_file_list_area").append(file_html);
				
			}else{
				file_html += '<li class="gallery-info" id="' + file_id + '" style="list-style:none;">';
				if (this.select_left_menu != "3"){
					file_html += '	<div class="checkbox">';
					file_html += '		<label>';
					file_html += '			<input type="checkbox" name="file_checkbox" value="' + file_id + '" id="chk_' + file_id + '"><span class="checkbox-material"><span class="check"></span></span>';
					file_html += '		</label>';
					file_html += '	</div>';					
				}

			//	file_html += '	<div class="thm' + (icon_kind == "video" ? " video-thm" : "") + '" id="file_' + file_id + '" fserver="' + file_info.fserver + '" fname="' + file_info.filename + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '">';
				file_html += '	<div class="thm" id="file_' + file_id + '" owner="' + file_info.owner.ky + '" fserver="' + file_info.fserver + '" fname="' + disp_file_name + '" fsize="' + file_info.file_size.$numberLong + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '">';

				if (this.disp_view_mode == "image" && icon_kind == "img"){
					show_thumb = true;
				}
				if (this.disp_view_mode == "gallery" && file_info.thumbOK == "T"){
					show_thumb = true;
				}
				
				if (show_thumb){
					file_html += '		<img src="' + gap.search_file_convert_server(file_info.fserver) + '/FDownload_thumb.do?id=' + file_id + '&ty=' + (this.select_left_menu == "4" ? "3" : "1") + '">' + (icon_kind == "video" ? '<span class="ico ico-video-b">재생</span>' : "");	
				}else{
					file_html += '		<span class="ico ico ico-' + icon_kind + '-b"></span>';	
				}
				file_html += '	</div>';
				file_html += '	<dl id="file_bottom_' + file_id + '" class="' + (show_thumb ? "gallery-attach" : "") + '">';
				file_html += '		<dt>' + (show_thumb ? '<span class="ico ico-attach ' + icon_kind + '"></span>' : "") + '<strong title="' + disp_file_name + '">' + disp_file_name + '</strong><span>&nbsp;(' + gap.file_size_setting(file_info.file_size.$numberLong) + ')</span></dt>';
				file_html += '		<dd><span>' + user_info.name + gap.lang.hoching + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
				file_html += '		<dd><span class="channel-name">' + file_info.drive_name + '</span></dd>';
				file_html += '	</dl>';
				file_html += '	<button class="ico btn-more main-file-menu"></button>';
				file_html += '</li>';
				
				$("#main_data_gallery_area").append(file_html);				
			}
			
			$("#file_bottom_" + file_id).bind("click", file_id, function(event){
				$("#file_" + event.data).click();
			});

			$("#file_" + file_id).bind("click", file_info, function(event){
				_self.box_layer_close();
				var furl = $(this).attr("furl");
				var fserver = $(this).attr('fserver');
				var fname = $(this).attr('fname');
				var md5 = $(this).attr('md5');
				var fid = $(this).attr('id').replace("file_", "");
				var thmok = $(this).attr('thmok');				
				
				if (gap.checkFileExtension(fname)){
					var url = gap.channelserver + "office/" + fid + "/files";
					gap.popup_url_office(url);	
					return false;
				}else{
					var ext = gap.is_file_type_filter(fname);
					if (ext == "img"){
						var url = gap.channelserver + "FDownload.do?id="+fid+"&ty=1&ky=" + gap.userinfo.rinfo.ky;
						gap.show_image(url, fname);
						return false;
					}else if (ext == "movie"){
						var url = gap.channelserver + "FDownload.do?id="+fid+"&ty=1&ky="+gap.userinfo.rinfo.ky;
						gap.show_video(url, fname);	
						return false;
					}					
				}		
				var surl = gap.channelserver + "/file_info.km";
				var postData = {
						"id" : fid,
						"md5" : md5,
						"ty" : "1"
					};		
					
				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(postData),
					success : function(res){
						if (res.result == "OK"){
							var file_info = res.data;
						
							$("#owner_info_dis").hide();
							$("#member_info_dis").hide();
							
							_self.draw_file_detail_info(file_info, "1")
							
							$(".detail-info").mCustomScrollbar({
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
						}else{
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				});
			});
			
			$("#chk_" + file_id).bind("click", file_id, function(event){
				if ($(this).prop("checked")){
					$("#" + event.data).addClass("on");
				}else{
					$("#" + event.data).removeClass("on");
				}
			});
		}
		
		$(".ico.btn-more.main-file-menu").off();
		$(".ico.btn-more.main-file-menu").on("click", function(){
			$.contextMenu({
				selector : ".ico.btn-more.main-file-menu",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){
					var $selector = (_self.disp_view_mode == "list" ? $(this).prev() : $(this).prev().prev());
					var f_id = $selector.attr("id").replace("file_", "");
					var f_server = $selector.attr("fserver");
					var f_name = $selector.attr("fname");
					var f_md5 = $selector.attr("md5");
					var f_url = $selector.attr("furl");
					_self.context_menu_call_file_mng(key, options, f_id, f_server, f_name, f_md5, f_url);
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
					}
				},			
				build : function($trigger, options){
					var $selector = (_self.disp_view_mode == "list" ? $trigger.prev() : $trigger.prev().prev());
					var fowner = $selector.attr("owner");
					var fname = $selector.attr('fname');
					var thmok = $selector.attr('thmok');
					var icon_kind = gap.file_icon_check(fname);
					var is_preview = true;
					if (icon_kind == "img" || icon_kind == "video"){
					//	is_preview = false;
					}else{
						if (!_self.check_preview_file(fname)){
							is_preview = false;
						}
					}
					options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
					return {
						items: _self.file_menu_content(is_preview, fowner)
					}
				}
			});
		});	
		
		
		//페이징
		this.total_file_count = res.totalcount;
		this.total_page_count = this.get_page_count(this.total_file_count, this.per_page);
		if (this.disp_view_mode == "list"){
			this.initialize_page();
		}
				
		$("#wrap_main_data_list").mCustomScrollbar({
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
			autoHideScrollbar : false,
		//	setTop : ($("#wrap_favorite_data_list").height()) + "px",
			callbacks : {
				onTotalScrollBackOffset: 100,
				onTotalScroll: function(){
					if (_self.disp_view_mode != "list"){
						page_no++;
						_self.add_main_data_list(page_no);
					}
				},
				onTotalScrollOffset: 100,
				alwaysTriggerOffsets:true
			}
		});
	},	
	
	"add_main_data_list" : function(page_no){
		var _self = this;
		var is_continue = false;
		
		if (this.disp_view_mode == "list"){
			is_continue = true;
		}else{
			if (this.cur_file_total_count > this.cur_file_count){
				is_continue = true;
			}
		}
		if (is_continue){
			this.start_skp = (parseInt(this.per_page) * (parseInt(page_no))) - (parseInt(this.per_page) - 1);
			var surl = gap.channelserver + "/api/files/folder_list_main.km";
			var postData = {
					"start" : (this.start_skp - 1).toString(),
					"perpage" : this.per_page,
					"q_str" : this.query_str,
					"dtype" : this.click_filter_image,
					"type" : this.select_left_menu
				};				

			$.ajax({
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
					if (res.result == "OK"){
						_self.cur_file_count += res.data.filelist.length;
						_self.cur_file_total_count = res.data.totalcount;
						_self.draw_main_data_list(page_no, res.data);	
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});		
		}		
	},	
	
	"draw_main_sub_folder" : function(res){
		var _self = this;
		
		for (var i = 0; i < res.length; i++){
			var folder_info = res[i];
			var drive_key = folder_info.drive_key;
			var folder_id = folder_info._id.$oid;
			var folder_name = folder_info.folder_name;
			var parent_folder_key = folder_info.parent_folder_key;
			var depth = folder_info.depth;
			var margin_left = depth * 10;
			var _html = '';

			_html += '<ul id="ul_fl_' + folder_id + '" style="display:none;">';
			_html += '	<li style="padding-left:10px">';
			_html += '		<div id="main_' + folder_id + '" class="folder-code" data="' + drive_key + '" style="margin-left:' + margin_left + 'px;">';
			_html += '			<span id="btn_fold_' + folder_id + '"></span>';
			_html += '			<span class="ico ico-lnb-folder"></span><em id="em_folder_' + folder_id + '" style="padding-left:20px">' + folder_name + '</em>';
			if (folder_info.owner.ky == gap.userinfo.rinfo.ky){
				// 폴더 owner에게만 표시.
				_html += '			<button class="ico btn-more folder-menu">더보기</button>';
			}
			_html += '		</div>';
			_html += '	</li>';
			_html += '</ul>';
			
			if (depth == "1"){
				$("#btn_fold_" + drive_key).empty();
				$("#btn_fold_" + drive_key).html('<button class="btn-fold"></button>');
				$("#main_" + drive_key).parent().append(_html);
				
			}else{
				$("#btn_fold_" + parent_folder_key).empty();
				$("#btn_fold_" + parent_folder_key).html('<button class="btn-fold"></button>');
				$("#main_" + parent_folder_key).parent().append(_html);
			}
			

			this.__tree_folder_event(drive_key, folder_id);
		}
	},
	
	"get_folder_fullpath" : function(_selector, _path, _title){
		var _self = this;
		
		if (_selector.attr("data") == "root"){
			return _path
			
		}else{
			var _name = $("#" + _selector.parent().parent().siblings("div").attr("id") + " em").text();
			var _id = _selector.parent().parent().siblings("div").attr("id").replace("main_", "");
			var _ele = _selector.parent().parent().siblings("div");
			var _fullpath = _id + "-spl-" + _path;
			var _fulltitle = _name + "-spl-" + _title;
			
			if (_selector.parent().parent().siblings("div").attr("data") == "root"){
				return _fullpath + "-=spl=-" + _fulltitle;
			}else{
				return this.get_folder_fullpath(_ele, _fullpath, _fulltitle);
			}		
		}
	},
	
	"get_file_path" : function(drive_code, folder_code){
		var _self = this;
		
		if (folder_code == "root"){
			for (var i = 0; i < this.cur_drive_list_info.length; i++){
				var drive_info = this.cur_drive_list_info[i];
				if (drive_info.ch_code == drive_code){
					return drive_info.ch_name;
					break;
				}
			}
			
		}else{
			for (var j = 0; j < this.cur_drive_folder_list_info.length; j++){
				var folder_info = this.cur_drive_folder_list_info[j];
				if (folder_info._id.$oid == folder_code){
					return this.get_file_fullpath(drive_code, folder_info.parent_folder_key, folder_info.folder_name);
					break;
				}
			}
		}
	},
	
	"get_file_fullpath" : function(drive_code, folder_code, fullpath){
		var _self = this;
		
		for (var j = 0; j < this.cur_drive_folder_list_info.length; j++){
			var folder_info = this.cur_drive_folder_list_info[j];
			
			if (folder_code == "root"){
				for (var i = 0; i < this.cur_drive_list_info.length; i++){
					var drive_info = this.cur_drive_list_info[i];
					if (drive_info.ch_code == drive_code){
						return drive_info.ch_name + " > " + fullpath;
						break;
					}
				}
				
			}else if (folder_info._id.$oid == folder_code){
				var ret_fullpath = folder_info.folder_name + " > " + fullpath;
				return this.get_file_fullpath(drive_code, folder_info.parent_folder_key, ret_fullpath);
				break;
			}
		}
	},
	
	"__tree_folder_event" : function(drive_key, folder_id){
		var _self = this;
		
		$("#main_" + folder_id).on("click", function(e){
			_self.select_left_menu = ""; //초기화
			if (e.target.className == "ico btn-more folder-menu"){
				$.contextMenu({
					selector : ".ico.btn-more.folder-menu",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
						_self.context_menu_call_folder_mng(key, options, $(this).parent().attr("id"));
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
						}
					},			
					build : function($trigger, options){
						options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
						return {
							items: _self.folder_menu_content()
						}
					}
				});
				
			}else if (e.target.className == "btn-fold"){
				$("#" + $(this).attr("id") + " .btn-fold").addClass("on");
				var ul_len = $("#" + $(this).attr("id")).siblings('ul').length;
				for (var i = 0; i < ul_len; i++){
					$("#" + $(this).attr("id")).siblings('ul').eq(i).show();
				}
				
			}else if (e.target.className == "btn-fold on"){
				$("#" + $(this).attr("id") + " .btn-fold").removeClass("on");
				var ul_len = $("#" + $(this).attr("id")).siblings('ul').length;
				for (var i = 0; i < ul_len; i++){
					$("#" + $(this).attr("id")).siblings('ul').eq(i).hide();
				}
				
			}else {
				var full_path_info = _self.get_folder_fullpath($(this), $(this).attr("id").replace("main_", ""), $("#" + $(this).attr("id") + " em").text());
				var full_code = full_path_info.split("-=spl=-")[0].split("-spl-");
				var full_name = full_path_info.split("-=spl=-")[1].split("-spl-");
				var folder_id = $(this).attr("id").replace("main_", "");
				
				_self.title_path_code = [];
				_self.title_path_name = [];
				
				for (var j = 1; j < full_code.length; j++){
					_self.title_path_code.push(full_code[j]);
				}
				for (var k = 1; k < full_name.length; k++){
					_self.title_path_name.push(full_name[k]);
				}
				
				id = drive_key;
				var parent_folder_id = $(this).parent().parent().siblings("div").attr("id").replace("main_", "");
				var cur_folder_id = $(this).attr("id").replace("main_", "");
				
				_self.select_drive_code = $("#" + $(this).attr("id")).attr("data");
				_self.select_drive_name = $("#main_" + _self.select_drive_code + " em").text();

				for (var i = 0; i < _self.cur_drive_folder_list_info.length; i++){
					_self.parent_folder_info = "";
					var _data = _self.cur_drive_folder_list_info[i];
					if (parent_folder_id == _data._id.$oid){
						_self.parent_folder_info = _data;
						break;
					}
				}
				for (var j = 0; j < _self.cur_drive_folder_list_info.length; j++){
					_self.cur_folder_info = "";
					var _data = _self.cur_drive_folder_list_info[j];
					if (cur_folder_id == _data._id.$oid){
						_self.cur_folder_info = _data;
						break;
					}
				}
				_self.select_folder_code = folder_id;
				_self.select_folder_name = $("#" + $(this).attr("id") + " em").text();
				_self.draw_folder_members();
				_self.draw_drive_data(1);
				
				_self.removeClass_channel();
				$("#main_" + folder_id).addClass("on");
			}
		});		
	},
	
	"search_drive_members" : function(driveid){
		//드라이브의 멤버를 찾는다.
		var infos = this.cur_drive_list_info;
		var members = new Object();		
		for (var i = 0 ; i < infos.length; i++){
			var info = infos[i];
			if (info.ch_code == driveid){
				members.member = info.member;
				members.owner = info.owner;
				return members;
				break;
			}
		}
	},	
	
	"search_folder_members" : function(folderid){
		//폴더에 멤버를 찾는다.
		var info = this.cur_folder_info;
		var members = new Object();		
		members.member = info.member;
		members.owner = info.owner;
		return members;				
	},
	
	"draw_drive_members" : function(id){		
		var list = this.search_drive_members(id);
		this.draw_members('D', list);
	},	
	
	"draw_folder_members" : function(){
		var list = this.search_folder_members();
		this.draw_members('F', list);
	},
	
	"member_list_show" : function(){		
		$("#main_body").css("width","calc(100% - 379px)");
		$("#channel_right").show();		
	//	gma.refreshPos();
	},
	
	"member_list_event" : function(){
		var _self = this;
		
		$("#member_layer_close2").off();
		$("#member_layer_close2").on("click", function(e){			
			_self.right_window_open = false;			
			$("#main_body").css("width", "");
			$("#sub_channel_content").css("width", "100%");			
			$("#channel_right").hide();			
		//	gma.refreshPos();
		});
		
		$(".owner-btns .btn-mail").off();
		$(".owner-btns .btn-mail").on("click", function(e){			
			var email = $(e.currentTarget).attr("data");
			var name = $(e.currentTarget).attr("data2");			
			_self.open_email_send(encodeURIComponent(name) + "<" + email + ">");	
		});
		
		$(".ico-chat").off();
		$(".ico-chat").on("click", function(e){			
			_self.cur_room_att_info_list = [];			
			var ky = $(e.currentTarget).data("key");
			var name = $(e.currentTarget).data("name");			
			var room_key = _wsocket.make_room_id(ky); // + "^" + gap.userinfo.rinfo.cpc;
			//대상자 정보를 넣어주서야 새창에서 기존에 채팅방이 없는 경우 해당 사용자와 1:1 방을 만들고 들어간다.	
			_self.cur_chat_user = ky;
			_self.cur_chat_name = name;			
			gap.chatroom_create_after2(room_key);
		});
		
		$(".ico-phone").off();
		$(".ico-phone").on("click", function(e){
			var ky = $(e.currentTarget).data("ky");
			gap.phone_call(ky, "");  //핸드폰으로 전화 건다.
		});
		
		$(".ico-profile").off();
		$(".ico-profile").on("click", function(e){
			var ky = $(e.currentTarget).data("ky");
			gap.showUserDetailLayer(ky);
		});	
		
		$(".owner-btns .btn-chat").off();
		$(".owner-btns .btn-chat").on("click", function(e){			
			//기존에 대화한 기록이 없는 사용자를 새창으로 띄우면 해당 데이터를 참조 (gBody : enter_chatroom_for_chatroomlist_popup_empty) 하는데
			//채팅창에 들어갔다가 바로 이 버튼을 클릭하면 기존에 클릭한 사용자와 대롸한 것 처럼 이루어 진다.
			//이 값이 없을 경울 room_key로 재설정하기 때문에 공백 배열로 처리하고 호출해야 한다.			
			_self.cur_room_att_info_list = [];			
			var ky = $(e.currentTarget).attr("data");
			var name = $(e.currentTarget).attr("data2");			
			var room_key = _wsocket.make_room_id(ky); // + "^" + gap.userinfo.rinfo.cpc;
			//대상자 정보를 넣어주서야 새창에서 기존에 채팅방이 없는 경우 해당 사용자와 1:1 방을 만들고 들어간다.	
			_self.cur_chat_user = ky;
			_self.cur_chat_name = name;			
			gap.chatroom_create_after2(room_key);
		});		
		
		$(".btn-invite-add").off();
		$(".btn-invite-add").on("click", function(e){			
			_self.context_menu_call_channel_mng("modify", "", _self.cur_opt);			
		});		
		
		$("#channel_right .user-remove").off();
		$("#channel_right .user-remove").on("click", function(e){			
			_self.member_process(e);	
		});
		
		$(".owner-btns .btn-invite-del").off();
		$(".owner-btns .btn-invite-del").on("click", function(e){			
			var ty = "1";  //기본은 채널에서 멤버를 삭제하는 옵션이다.
			var id = _self.cur_opt;
			if (gap.cur_window == "drive"){
				if (_self.select_folder_code == "root"){
					id = _self.select_drive_code;
					ty = "2";					
				}else{
					id = _self.select_folder_code;
					ty = "3";
				}				
			}else if (gap.cur_window == "todo"){
				ty = "4";
			}			
			var pid = $(e.currentTarget).parent().parent().parent().parent().attr("id");
			if (pid == "owner_info_dis"){
				//Owner를 변경하는 창이 띄워진다.				
				window.ORG.show(
						{
							'title': "Change Owner",
							'single': true
						}, 
						{
							getItems:function() { return []; },
							setItems:function(items) { /* 반환되는 Items */																
								var _res = gap.convert_org_data(items[0]);
								var url = gap.channelserver + "/change_owner.km";
								var data = JSON.stringify({
									owner : _res,
									id : id,
									type : ty
								});							
								$.ajax({
									type : "POST",
									dataType : "json",
									contentType : "applcation/json; charset=utf-8",
									url : url,
									data : data,
									success : function(res){
										if (res.result == "ERROR"){
											gap.error_alert();
										}else{						
											$("#li_cl_" + id).remove();	
											
											$("#allcontent").click();
											_self.update_channel_info();
										}
									},
									error : function(e){
										gap.error_alert();
									}
								});		
							}
						});			
			}else{						
				var _self_el = $(this);
				var email = $(e.currentTarget).attr("data");
				var url = gap.channelserver + "/channel_delete_member.km";
				var data = JSON.stringify({
					email : email,
					id : id,
					type : ty
				});
				$.ajax({
					type : "POST",
					dataType : "json",
					contentType : "applcation/json; charset=utf-8",
					url : url,
					data : data,
					success : function(res){
						if (res.result == "ERROR"){
							gap.error_alert();
						}else{						
							$(_self_el).parent().parent().parent().remove();							
							var count = $(".invite-info .btn-invite-del").length;
							$("#right_frame_member_count").html("("+count+")");							
							if (_self.select_folder_code == "root"){
								_self.drive_members_delete(gBody2.select_drive_code, email);
								_self.update_drive_info();
							}else{
								_self.drive_folder_members_delete(gBody2.select_folder_code, email);
								_self.update_folder_info();
							}							
						}
					},
					error : function(e){
						gap.error_alert();
					}
				});
			}			
		});
	},
	
	"drive_members_delete" : function(driveid, email){
		//로컬에 저장된 채널 정보에서 특정 채널에 특정 멤버를 제거한다.
		var _self = this;
		var infos = this.cur_drive_list_info;
		var members = new Object();		
		for (var i = 0 ; i < infos.length; i++){
			var info = infos[i];
			if (info.ch_code == driveid){
				var list = info.member;
				var mlist = [];
				for (var k = 0 ; k < list.length; k++){
					if (email == list[k].ky){						
					}else{
						mlist.push(list[k]);
					}
				}
				info.member = mlist;				
				break;
			}
		}
	},
	
	"drive_folder_members_delete" : function(folderid, email){
		//로컬에 저장된 드라이브 폴더 정보에서 특정 폴더에 특정 멤버를 제거한다.
		var _self = this;		
		var infos = this.cur_drive_folder_list_info;
		var members = new Object();		
		for (var i = 0 ; i < infos.length; i++){
			var info = infos[i];
			if (info._id.$oid == folderid){
				var list = info.member;
				var mlist = [];
				for (var k = 0 ; k < list.length; k++){
					if (email == list[k].ky){						
					}else{
						mlist.push(list[k]);
					}
				}
				info.member = mlist;				
				break;
			}
		}
	},		
	
	"member_process" : function(e){		
		//채널과 TODO에서 Owner를 변경하거나 멤버를 제거하는 경우 처리되는 함수
		var _self = this;
		var ty = "1";  //기본은 채널에서 멤버를 삭제하는 옵션이다.
		var id = gBody3.cur_opt;
		if (gap.cur_window == "drive"){
			if (this.select_folder_code == "root"){
				id = this.select_drive_code;
				ty = "2";				
			}else{
				id = this.select_folder_code;
				ty = "3";
			}			
		}else if (gap.cur_window == "todo"){
			//ty = "4";
			ty = "1"; //채널멤버를 제거하면 TODO 멤버도 제거된다.
		}
		var pid = $(e.currentTarget).parent().attr("id");
		if (pid == "owner-info"){
			//Owner를 변경하는 창이 띄워진다.
			gap.showBlock_todo();
			window.ORG.show(
					{
						'title': "Change Owner",
						'single': true
					}, 
					{
						getItems:function() { return []; },
						
						onClose : function(){
							gap.hideBlock_todo();
							//gap.hideBlock();
						},
						setItems:function(items) { /* 반환되는 Items */
							var _res = gap.convert_org_data(items[0]);
							_self.update_display_members(ty, id, _res);						
						}
					});
			setTimeout(function(){
				var inx = parseInt(gap.maxZindex()) + 1;
				$(".card-panel").css("zIndex", inx);
			}, 500);
				
		}else{			
			var mmx = gap.lang.channel + gap.lang.extwork;
			var pp = $(e.currentTarget).data("ty");
			if (pp == "D"){
				//드라이브를 나간다는 문구로 변경되어야 한다.
				mmx = gap.lang.folder + gap.lang.extwork;
			}			
			gap.showConfirm({
 				title: "Confirm",
 				contents: mmx,
 				callback: function(){
					var _self_el = $(e.currentTarget);
					var email = $(e.currentTarget).data("key");
					var url = gap.channelserver + "/channel_delete_member.km";
					var data = JSON.stringify({
						email : email,
						id : id,
						type : ty
					});
					$.ajax({
						type : "POST",
						dataType : "json",
						contentType : "applcation/json; charset=utf-8",
						url : url,
						data : data,
						success : function(res){
							if (res.result == "ERROR"){
								gap.error_alert();
							}else{								
								$(_self_el).parent().parent().parent().parent().remove();								
								var count = $(".invite-info .btn-invite-del").length;
								$("#right_frame_member_count").html("("+count+")");								
								if (gap.cur_window == "drive"){
									if (_self.select_folder_code == "root"){
										_self.drive_members_delete(_self.select_drive_code, email);
										_self.update_drive_info();
									}else{
										_self.drive_folder_members_delete(_self.select_folder_code, email);
										_self.update_folder_info();
									}						
								}else{
									_self.channel_members_delete(_self.cur_opt, email);
								}							
								if (email == gap.userinfo.rinfo.ky){
									//본인이 삭제 하는 경우 업무방 리스트에서 제거한다.
									$("#li_cl_" + id).remove();									
									//즐겨찾기도 삭제한다.
									$("#" + id).remove();									
									//메인으로 나간다.
									$("#channel_back").click();
								}						
							}
						},
						error : function(e){
							gap.error_alert();
						}
					});
 				}
 			});		
		}
	},	
	
	"draw_members" : function(kind, list){
		var _self = this;
		
		$("#sub_channel_content").css("width","calc(100% - 315px)"); //확장하고 접고하는 과정에서 수정되기 때문에 초기화 해준다.
		this.right_window_open = true;
		this.member_list_show();		
		if (typeof(list) == "undefined"){
			return false;
		}	
		var owner = list.owner;
		var owner_info = gap.user_check(owner);
		var html = "";		
		var is_admin = false;
		if (owner.ky == gap.userinfo.rinfo.ky){
			if (kind != "F"){
				//폴더는 owner 변경을 하지 않는다.
				is_admin = true;	
			}
		}		
		var user_photo = gap.person_profile_photo(owner);		
		$("#user_profile").hide();
		var html = "";
		html += "	<div class='aside-wide' style='height:100%' >";
		html += "		<div class='close_box'><button type='button' class='pop_btn_close' id='member_layer_close2'></button></div>";
		html += "		<div class='office_const'>";
		html += "			<h2>Owner</h2>";
		html += "			<div class='o_const_list' style='margin-top:10px'>";
		html += "				<div class='office_mem_card'>";
		html += "					<div class='office_prof user'>";
		html += '						<div class="photo-wrap" style="background-image:url(' + gap.person_photo_url(owner) + '),url('+gap.none_img+');"></div>';				
		html += "						<span data-status='status_"+owner.ky+"' style='top:6px; left:7px' class='status offline'></span>";
		html += " 						<button data-phone='phone_"+owner.ky+"' type='button' style='position:absolute'></button>";
		html += "					</div>";
		html += "					<div class='office_right' style='width: 64%;'>";	
		html += "						<div class='office_mem_name'>";
		html += "							<span data-day='day_"+owner.ky+"' style='display:none'></span>";
		html += "							" + owner_info.name + "";
		html += "							<span class='rank'>" + owner_info.jt + "</span>";	
		html += "						</div>";		
		html += "						<div class='office_mem_info'>";
		html += "							<p>" + owner_info.dept + "</p>";
		html += "							<p class='company'>" + owner_info.company + "</p>";
		html += "						</div>";		
//		html += "						<div class='office_mem_info'>";
//		html += "							<p class='company' style='font-size:12px; color:blue' data-smsg='smsg_"+owner.ky+"'>여기 표시되어야 한다. 여기 표시되어야 한다. 여기 표시되어야 한다.</p>";
//		html += "						</div>";
		html += "					</div>";
		html += "					<div class='abs hover-box'>";
		html += "						<div class='inner f_between f_middle'>";
		html += "							<span class='ico ico-chat' title='"+gap.lang.startChat+"' data-name='"+name+"' data-key='"+owner.ky+"'>채팅</span>";
//		if (use_tel == "1"){
			html += "							<span class='ico ico-phone' data-ky='"+owner.ky+"' title='"+gap.lang.mobile+"'>전화</span>";
//		}		
		html += "							<span class='ico ico-profile' data-ky='"+owner.ky+"' title='"+gap.lang.openprofile+"'>프로필</span>";		
		var expire = "";
		if ( typeof(gap.cur_room_search_info(this.cur_opt).owner_expire) != "undefined"){
			expire = gap.cur_room_search_info(this.cur_opt).owner_expire;
		}
		if (is_admin || expire == "T"){
			html += "							<div class='group_right_pop' style='position:unset;width:0px' id='owner-info'><div class='user-remove' data-key='"+owner.ky+"'><span></span></div></div>";		
		}		
		html += "						</div>";
		html += "					</div>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		html += "";	
		var lists = [];
		lists.push(owner.ky);		
		var members = list.member;
		if ( (typeof(members) == "undefined") || (members.length == 0)){
			//return false;
		}else{			
			html += "<div class='office_part' style='height:100%' >";
			html += "	<h2 style='margin-bottom:10px'>Member ("+members.length+")<button class='ico btn-more bl' id='members_fnc_box'>더보기</button></h2>";
			html += "	<div class='o_p_list' style='height : calc(100% - 280px); padding:0 17px' id='memberframe'>";
			html += "";			
			members = sorted=$(members).sort(gap.sortNameDesc);				
			for (var i = 0 ; i < members.length; i++){
				var member = members[i];
				lists.push(member.ky);				
				var user_info = gap.user_check(member);
				var ky = user_info.ky;			
				var ex = user_info.email.replace("@","").replace(" ","");				
				html += "		<div class='office_mem_card' style='margin:5px 15px 0px 4px' id='member_list_"+ky+"'>";
				html += "			<div class='office_prof user'>";
				html += '				<div class="photo-wrap" style="background-image:url(' + gap.person_photo_url(member) + '),url('+gap.none_img+');"></div>'
				html += "				<span data-status='status_"+user_info.ky+"' class='status online' style='top:6px; left:7px'></span>";
				html += "				<button data-phone='phone_"+user_info.ky+"' type='button' style='position:absolute'></button>";
				html += "			</div>";
				html += "			<div class='office_right' style='width: 64%;'>";
				html += "				<div class='office_mem_name'>";
				html += "					<span data-day='day_"+user_info.ky+"' style='display:none'></span>";
				html += "					" + user_info.name + "";
				html += "					<span class='rank'>" + user_info.jt + "</span>";
				html += "				</div>";
				html += "				<div class='office_mem_info'>";
				html += "					<p>" + user_info.dept + "</p>";
				html += "					<p class='company'>" + user_info.company + "</p>";
				html += "				</div>";
				html += "			</div>";			
				if (typeof(member.dsize) != "undefined" && member.dsize == "group"){
					if (is_admin  ){
						html += "			<div class='abs hover-box'>";
						html += "				<div class='inner f_between f_middle'>";
						html += "					<div class='group_right_pop' style='position:unset;width:0px'><div class='user-remove' data-key='"+user_info.ky+"'><span></span></div></div>";
						html += "				</div>";
						html += "			</div>";						
					}				
				}else{
					html += "			<div class='abs hover-box'>";
					html += "				<div class='inner f_between f_middle'>";
					html += "					<span class='ico ico-chat' title='"+gap.lang.startChat+"' data-name='"+user_info.name+"' data-key='"+user_info.ky+"' >채팅</span>";
				//	if (use_tel == "1"){
						html += "					<span class='ico ico-phone' data-ky='"+user_info.ky+"'  title='"+gap.lang.mobile+"' >전화</span>";
				//	}				
					html += "					<span class='ico ico-profile' data-ky='"+user_info.ky+"' title='"+gap.lang.openprofile+"' >프로필</span>";
					if (is_admin  || gap.userinfo.rinfo.ky == user_info.ky){
						html += "					<div class='group_right_pop' style='position:unset;width:0px'><div class='user-remove' data-ty='"+kind+"' data-key='"+user_info.ky+"'><span></span></div></div>";
					}
					html += "				</div>";
					html += "			</div>";					
				}				
				html += "		</div>";				
			}			
			html += "	</div>";
			html += "</div>";			
		}
		$("#channel_right").html(html);		
		//상태값을 검사한다.
		var opt = 1;
		var ty = "channel";		
		gap.status_check(lists, opt, ty);		
		$("#memberframe").mCustomScrollbar({
			theme:"dark",
			//autoExpandScrollbar: true,
			scrollButtons:{
				enable: false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : true
		});

		$("#members_fnc_box").off();
		$("#members_fnc_box").on("click", function(){			
			var html = "";
			html += "<div class='layer layer-menu opt-enter' id='member_list_opt_box'>";
			html += "<ul>";		
			html += "<li style='padding-left : 10px !important; text-align:left' onclick='gFiles.all_send_opt_box(1)'>"+gap.lang.groupmail+"</li>";
			html += "<li style='padding-left : 10px !important; text-align:left' onclick='gFiles.all_send_opt_box(2)'>"+gap.lang.groupchat+"</li>";
			
			if (is_admin){
				html += "<li style='padding-left : 10px !important; text-align:left' onclick='gFiles.all_send_opt_box(3)'>"+gap.lang.member_invite+"</li>";	
				
			}
			html += "<li style='padding-left : 10px !important; text-align:left; border-top:1px solid #d5d2d2' onclick='gFiles.all_send_opt_box(4)'>"+gap.lang.up_mem+"</li>";
			html += "</ul>";
			html += "</div>";			
			$("#members_fnc_box").qtip({
				overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
				content : {
					text : html
				},
				show : {
					event: 'click',
					ready: true
				},
				hide : {
					event : 'click unfocus',
					//event : 'mouseout',
					fixed : true
				},
				style : {
					classes : 'qtip-bootstrap',
					tip : false
				},
				position : {
					my : 'top right',
					at : 'bottom left',
					//target : $(this)
					adjust: {
					  x: 10,
					  y: 5
					}
				},
				events : {
					show : function(event, api){	
						
					},
					hidden : function(event, api){
						api.destroy(true);
					}
				}
			});			
		});			
		this.member_list_event();	
	},
	
	"all_send_opt_box" : function(opt){	
		//멤버에서 more버튼 클릭한 결과 처리 함수
		var _self = this;	
		var att_list_all = "";
		var att_list = "";
		var att_list_temp = "";
		if (gap.cur_window == "drive"){
			if (this.select_folder_code == "root"){
				att_list_all = this.search_drive_members(this.select_drive_code);
			}else{
				att_list_all = this.search_folder_members();
			}			
		}else{
			att_list_all = this.search_channel_members(this.cur_opt);			
		}		
		att_list_temp = att_list_all.member;	
		var att_list = att_list_temp.concat(att_list_all.owner);	
		if (opt == "1"){
			//참석자 전체 메일 발송			
			var all_sender_list = "";
			for (var i = 0 ; i < att_list.length; i++){
				var info = att_list[i];
				var user_info = gap.user_check(info);
				var name = user_info.name;
				var email = info.em;				
				if (info.ky != gap.search_cur_ky()){
					if (all_sender_list == ""){					
						all_sender_list = encodeURIComponent(name) + "<" + email + ">";
					}else{
						all_sender_list += ";" + encodeURIComponent(name) + "<" + email + ">";
					}
				}				
			}			
			gap.open_email_send(all_sender_list);
						
		}else if (opt == "2"){
			//참석자를 포함한 채팅차 열기
			//DSW형식으로 다중 채팅을 처리함			
			gap.chatroom_create(att_list);			
			return false;
			//하단 방식은 아모레 버전으로 이전 방식임
			$("#user_profile").show();
			$("#sub_channel_content").hide();
			$("#box_search_content").hide();
			$(".left-area").css("width", "calc(100% - " + gap.right_page_width + ")");				
			$("#add_group_btn").show();		
			$(".chat-bottom").show();					
			gap.show_content("subsearch");
			this.search_type = "makeroom";
			this.open_add_member_search_layer("makeroom");		
			$("#sub_search_profile").find("p").remove();
			//멤버를 선택 창에 추가한다.			
			for (var i = 0 ; i < att_list.length; i++){
				var info = att_list[i].ky;
				var user_info = gap.user_check(att_list[i]);
				var name = user_info.name;
				var company = user_info.company;				
				if (info != gap.search_cur_ky()){
					var id = gap.seach_canonical_id(info);
					id = gap.encodeid(id);
					var callid = id;
					var person_img = gap.person_profile_photo(info);
					var html = "";
					html += "<div class='member-profile' id='"+callid+"' data='"+info+"'>";
					html += "	<button class='ico btn-member-del'>삭제</button>";
					html += "	<div class='user-result-thumb'>"+person_img+"</div>";
					html += "		<dl>";
					html += "			<dt><span class='status online'></span>"+name+"</dt><dd>"+company+"</dd>";
					html += "		</dl>";
					html += "	</div>";
					html += "</div>";
					$("#addUser_frame").append(html);
				}			
			}			
			$("#addUser_frame .member-profile button").on("click", function(){
				//선택한 화면에 선택 상태를 제거한다.				
				var cid = $(this).parent().attr("id").replace("sub_","");
				$("#result_" + cid).find("button").removeClass("on");				
				//현재 박스에서 객체를 삭제한다.
				$(this).parent().remove();				
				var cnt = $("#addUser_frame .member-profile").length;				
				if (cnt  == 0){
					$("#search_invite_btn").addClass("disabled");
					$("#search_invite_btn").attr("style","");					
					$("#video_invite_btn").addClass("disabled");
					$("#video_invite_btn").attr("style","");					
					$("#sub_search_profile").find("p").show();
				}					
			});

			var cnt = $("#addUser_frame .member-profile").length;				
			if (cnt > 0){
				$("#search_invite_btn").removeClass("disabled");
				$("#search_invite_btn").attr("style","cursor:pointer");				
				$("#video_invite_btn").removeClass("disabled");
				$("#video_invite_btn").attr("style","cursor:pointer");
			}
				
		}else if (opt == "3"){
			if (gap.cur_window == "drive"){
				if (this.select_folder_code == "root"){
					this.modify_drive(this.select_drive_code);
				}else{
					this.drive_modify_folder(this.select_folder_code);
				}
			}else{
				this.context_menu_call_channel_mng("modify", "", this.cur_opt);
			}
			
		}else if (opt == "4"){
			this.update_member_last();
				
		}else if (opt == "5"){
			// 일정등록
			gap.addEventRegist(att_list);			
		}
		
	},
	
	"update_member_last" : function(){
		//멤버의 부서 / 직급등이 정보를 최신 데이터로 업데이트하는 함수 호출하기	
		var _self = this;
		var url = gap.channelserver + "/update_members.km";		
		if (gap.cur_window == "drive"){
			//드라이브의 정보 업데이트
			var data = "";
			var scode = "";
			if (this.select_folder_code == "root"){
				//드라이브 멤버업데이트	
				scode = this.select_drive_code;
				data = JSON.stringify({
					code : scode ,
					category : "drive"
				});
			}else{
				//폴더 멤버업데이트
				scode = this.select_folder_code;
				data = JSON.stringify({
					code : scode,
					category : "folder"
				});
			}
			
			$.ajax({
				type : "POST",
				url : url,
				data : data,
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				success : function(res){
					if (res.result == "OK"){
						
						_self.update_drive_info(scode, false);	
					}									
				},
				error : function(e){
					gap.error_alert();
				}
			});
			
		}else{
			//채널의 멤버 정보 업데이트			
			var data = JSON.stringify({
				code : this.cur_opt,
				category : "channel"
			});
			$.ajax({
				type : "POST",
				url : url,
				data : data,
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				success : function(res){
					if (res.result == "OK"){
						_self.update_channel_info(gBody3.cur_opt, false);	
					}									
				},
				error : function(e){
					gap.error_alert();
				}
			});			
		}
	},	
	
	"search_channel_members" : function(channelid){
		var infos = gap.cur_channel_list_info;
		var members = new Object();		
		for (var i = 0 ; i < infos.length; i++){
			var info = infos[i];
			if (info.ch_code == channelid){
				members.member = info.member;
				members.owner = info.owner;
				return members;
				break;
			}
		}
	},	
	
	"new_chat_layer_html" : function(){
		var html = '';
		
		html += '<div id="new_chat_layer" class="layer_wrap center" style="width: 400px;">';
		html += '	<div class="layer_inner">';
		html += '		<div id="close_chat_layer" class="pop_btn_close"></div>';
		html += '		<h4>' + gap.lang.newchat + '</h4>';
		html += '		<div class="layer_cont left">';
		html += '			<div class="cont_wr rel" style="height: 230px">';
		html += '				<h5>' + gap.lang.inviteContact + '</h5>';
		html += '				<div class="before_select f_between">';
		html += '					<input type="text" id="input_chat_user" class="input" placeholder="' + gap.lang.inputname + '">';
		html += '					<button id="org_pop_btn" class="type_icon"></button>';
		html += '				</div>';
		html += '				<!-- 선택하면 나오면 화면 -->';
		html += '				<div class="after_select until_wr" style="display:none;">';
		html += '					<ul id="chat_member_list" class="scroll until p5" style="overflow-y:auto;">';
		html += '					</ul>';
		html += '				</div>';
		html += '			</div>';
		html += '		</div>';
		html += '		<div class="btn_wr">';
		html += '			<button id="create_chat_btn" class="btn_layer confirm">' + gap.lang.chat + '</button>';
		html += '		</div>';
		html += '	</div>';
		html += '</div>';
		
		return html;
	},
	
	"create_chatroom" : function(){
		var _self = this;
		var html = this.new_chat_layer_html();	
		
		gap.showBlock();
		$("#common_work_layer").show();
		$("#common_work_layer").html(html);
		
		$("#input_chat_user").focus();
		
//		$(html).appendTo('body');
		var $layer = $('#new_chat_layer');
//		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
//		$layer.wrap('<div id="common_work_layer" class="mu_container mu_work" style="top:-50%;"></div>')
//		
		$("#input_chat_user").keydown(function(evt){
			if (evt.keyCode == 13){
				if ($("#input_chat_user").val().trim() == ""){
					mobiscroll.toast({message:gap.lang.inputname, color:'danger'});
					return false;
				}
				
				_self.channel_user_search("T", $("#input_chat_user").val(), true);				
			}
		})
		.bind('paste', function(e){
			gap.change_paste_text(e, this);
		});
		
		$("#org_pop_btn").on("click", function(){
			window.ORG.show(
					{
						'title': gap.lang.invite_user,
						'single':false,
						'pergroup': false,
						'peraddr': false,
						'select': 'person'
					}, 
					{
						getItems:function() { return []; },
						setItems:function(items) { /* 반환되는 Items */
						
							_self.aleady_select_user_count = 0;
							for (var i = 0; i < items.length; i++){
								var _res = gap.convert_org_data(items[i]);
								if (_res.ky.toLowerCase() != gap.userinfo.rinfo.ky.toLowerCase()){
									_self.channel_add_user('T', _res);
								}
							}
							_self.alert_aleady_select_user();
						}
					});
		});
		
		$("#create_chat_btn").on("click", function(){
	
			if ($("#chat_member_list").children().length == 0){
				mobiscroll.toast({message:gap.lang.inputname, color:'danger'});
				return false;
			}
						
			var member_count = $("#chat_member_list").children().length;
			var list = new Array();
			var select_name = "";
			for(var i = 0; i < member_count; i++){
				var user_info = $("#chat_member_list").children().eq(i).data("user");	//JSON.parse( $("#chat_member_list").children().eq(i).attr("data-user"));
				list.push(user_info.ky);
				if (user_info.ky != gap.userinfo.rinfo.ky){
					if (gap.userLang == "ko"){
						select_name = user_info.nm;
					}else if (user_info.el == gap.userinfo.rinfo.el){
						select_name = user_info.onm;
					}else{
						select_name = user_info.enm;
					}
					
				}
			}
			_self.select_name = select_name;
			list.push(gap.search_cur_ky());
			
			
			//기존에 팀
			if (member_count > 1){
				var res = gap.search_exist_chatroom_nn(list);
				if (res != ""){
					//기존에 참석자가 포함된 방이 있다는 이야기임
					 $("#close_chat_layer").click();
					 _self.enter_chatroom_for_chatroomlist(res, "", "");
					 return false;
				}
			}		
			$("#close_chat_layer").click();
			_wsocket.search_user_makeroom(list);
		});
		
		$("#close_chat_layer").on("click", function(){
			gap.remove_layer('new_chat_layer');
		//	gap.remove_layer('common_work_layer');
		});
	},	
	
	"drive_layer_html" : function(is_update, is_drive_share){
		var html = '';
	
		html += '<div id="update_drive_layer" class="layer_wrap center" style="width: 400px;">';
		html += '	<div class="layer_inner">';
		html += '		<div id="close_drive_layer" class="pop_btn_close"></div>';
		html += '		<h4>' + (is_update ? gap.lang.update_drive_info : gap.lang.create_drive) + '</h4>';
		html += '		<div class="layer_cont left">';
		html += '			<div class="cont_wr rel">';
		html += '				<h5>' + gap.lang.drive_name + '</h5>';
		html += '				<div class="before_select">';
		html += '					<input type="text" id="input_drive" class="input" placeholder="' + gap.lang.input_drive_name + '">';
		html += '				</div>';
	//	html += '				<div class="limit_wr">';
	//	html += '					<span class="num">0</span>/60';
	//	html += '				</div>';
		html += '			</div>';
		html += '			<div class="cont_wr rel" style="height: 230px">';
		html += '				<h5>' + gap.lang.invite_member + '</h5>';
		html += '				<div class="before_select f_between">';
		html += '					<input type="text" id="input_drive_user" class="input" placeholder="' + gap.lang.input_invite_member + '">';
		html += '					<button id="org_pop_btn" class="type_icon"></button>';
		html += '				</div>';
		html += '				<!-- 선택하면 나오면 화면 -->';
		html += '				<div class="after_select until_wr" style="display:none;">';
		html += '					<ul id="drive_member_list" class="scroll until p5" style="max-height:125px; overflow-y:auto;">';
		html += '					</ul>';
		html += '				</div>';
		html += '			</div>';
		html += '		</div>';
		html += '		<div class="btn_wr">';
		html += '			<button id="create_drive_btn" class="btn_layer confirm">' + (is_update ? gap.lang.basic_save : gap.lang.create) + '</button>';
		html += '		</div>';
		html += '	</div>';
		html += '</div>';
		
		return html;
	},
	
	"create_drive" : function(obj, flag){
		var _self = this;
		var is_update = (obj != undefined ? true : false);
		var is_drive_share = (flag != undefined ? flag : "");
		var html = this.drive_layer_html(is_update, is_drive_share);	
		
		
		gap.showBlock();
	//	$(html).appendTo('body');
		$("#common_work_layer").show();
		$("#common_work_layer").html(html);
		
		$("#input_drive").focus();
		var $layer = $('#update_drive_layer');
		
//		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
	//	$layer.wrap('<div id="common_work_layer" class="mu_container mu_work" style="top:-50%;"></div>')
		
		if (is_update){
			//드라이브 정보 update인 경우
			$("#input_drive").val(gap.textToHtmlBox(obj.ch_name));
			$("#input_drive").parent().find("label").addClass("on");
			if (obj.ch_share == "Y"){
				this.aleady_select_user_count = 0;
				for (var i = 0; i < obj.member.length; i++){
					this.channel_add_user("D", obj.member[i]);
				}
				this.alert_aleady_select_user();
			}
		}
		
		$("#input_drive_user").keydown(function(evt){
			if (evt.keyCode == 13){
				if ($("#input_drive_user").val().trim() == ""){
					mobiscroll.toast({message:gap.lang.input_invite_user, color:'danger'});
					return false;
				}

				_self.channel_user_search("D", $("#input_drive_user").val());
			}
		})
		.bind('paste', function(e){
			gap.change_paste_text(e, this);
		});
		
		$("#org_pop_btn").on("click", function(){
			window.ORG.show(
					{
						'title': gap.lang.invite_user,
						'single':false
					}, 
					{
						getItems:function() { return []; },
						setItems:function(items) { /* 반환되는 Items */
						
							_self.aleady_select_user_count = 0;
							for (var i = 0; i < items.length; i++){
								var _res = gap.convert_org_data(items[i]);
								if (_res.ky.toLowerCase() != gap.userinfo.rinfo.ky.toLowerCase()){
									_self.channel_add_user('D', _res);
								}
							}
							_self.alert_aleady_select_user();
						}
					});
		});		
		
		$("#create_drive_btn").on("click", function(){
			if ($("#input_drive").val().trim() == ""){
				mobiscroll.toast({message:gap.lang.input_drive_name, color:'danger'});
				return false;
			}
			if ($("#input_drive_user").val().trim() != ""){
				_self.channel_user_search("D", $("#input_drive_user").val());
				return false;
			}
			
			var readers = [];
			var user_list = [];
			var user_ky_list = [];
			var new_member_ky = "";
			var del_member_ky = "";
			var delete_members = "";
			var channel_name = $("#input_drive").val();
			var member_count = $("#drive_member_list").children().length;
			
			readers.push(gap.userinfo.rinfo.ky);
			
			if (member_count == 0){
				var postData = {
					"ch_name" : channel_name,
					"ch_share" : "N",
					"owner" : gap.userinfo.rinfo,
					"readers" : readers,	//gap.userinfo.rinfo.em
					"member" : user_list
				};	
			}else{
				for(var i = 0; i < member_count; i++){
					var user_info = $("#drive_member_list").children().eq(i).data("user");	//JSON.parse( $("#drive_member_list").children().eq(i).attr("data-user") );
					readers.push(user_info.ky);
					user_list.push(user_info);
					user_ky_list.push(user_info.ky);
				}
				var postData = {
					"ch_name" : channel_name,
					"ch_share" : "Y",
					"owner" : gap.userinfo.rinfo,
					"readers" : readers,	//readers.join(" "),
					"member" : user_list
				};
			}
			
			if (is_update){
				var delete_members_em = [];
				var pre_member = obj.member
				var pre_member_ky = $.map(pre_member, function(ret, key) {
					return ret.ky;
				});
				var pre_member_em = $.map(pre_member, function(ret, key) {
					return ret.em;
				});
				new_member_ky = $(user_ky_list).not(pre_member_ky);
				del_member_ky = $(pre_member_ky).not(user_ky_list);
				delete_members = $(pre_member_em).not(readers);
				
				if (delete_members.length > 0){
					for (var i = 0; i < delete_members.length; i++){
						delete_members_em.push(delete_members[i]);
					}
				}
				
				postData.delete_members = delete_members_em;	// 하취 폴더에서 해당 사용자 삭제
				postData.ch_code = obj.ch_code;
			}
						
			var surl = gap.channelserver + "/" + (is_update ? "drive_update.km" : "create_person_drive.km");
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "text",
				data : JSON.stringify(postData),
				success : function(ress){
					var res = JSON.parse(ress);
					if (res.result == "OK"){
						var _html = '';
						if (is_update){
							
							if (obj.ch_share == "Y" && member_count == 0){
								// 공개 드라이브에서 비공개 드라이브로 변경된 경우
								$("#li_dl_" + obj.ch_code).remove();
								_html += '		<li id="li_dl_' + obj.ch_code + '">';
								_html += '			<div id="' + obj.ch_code + '" owner="' + gap.search_cur_ky() + '" class="drive-code"><span class="ico ico-drive' + (member_count != 0 ? "-share" : "") + '"></span><em style="padding-left:20px;">' + channel_name + '</em><button class="ico btn-more drive-area">더보기</button></div>';
								_html += '		</li>';
								$("#person_drive_list").append(_html);
								
							} else if (obj.ch_share != "Y" && member_count != 0){
								// 비공개 드라이브에서 공개 드라이브로 변경된 경우
								$("#li_dl_" + obj.ch_code).remove();
								_html += '		<li id="li_dl_' + obj.ch_code + '">';
								_html += '			<div id="' + obj.ch_code + '" owner="' + gap.search_cur_ky() + '" class="drive-code"><span class="ico ico-drive' + (member_count != 0 ? "-share" : "") + '"></span><em style="padding-left:20px;">' + channel_name + '</em><button class="ico btn-more drive-area">더보기</button></div>';
								_html += '		</li>';
								$("#share_drive_list").append(_html);
								
							}else{
								/*$("#main_" + obj.ch_code).empty();
								_html += '<span class="ico ico-drive' + (member_count != 0 ? "-share" : "") + '"></span><em>' + channel_name + '</em><button class="ico btn-more drive-area">더보기</button>';
								$("#main_" + obj.ch_code).append(_html);*/
								
								$("#main_" + obj.ch_code + " em").html(channel_name);
							}
	
											
							if (new_member_ky.length > 0){
								var _noti = new Object();
								_noti.type = "drive_member";								
								_noti.p_code = obj.ch_code;
								_noti.p_name = gap.textToHtml(obj.ch_name);
								_noti.title = "";
								_noti.sender = new_member_ky;
								_wsocket.send_drive_msg(_noti);
							}
							

							if (del_member_ky.length > 0){
								var _obj = new Object();
								_obj.sender = del_member_ky;
								_obj.ch_code = obj.ch_code;
								_obj.type = "deld";
								_wsocket.send_box_msg(_obj, 'chmng');
							}
							
							
							//모바일  Push를 날린다. ///////////////////////////////////
							if (new_member_ky.length > 0){
								var new_member_ky_list = [];
								for (var j = 0; j < new_member_ky.length; j++){
									new_member_ky_list.push(new_member_ky[j]);
								}
								
								var smsg = new Object();
								smsg.msg = "[" + obj.ch_name + "] " + gap.lang.miv;
								smsg.title = gap.systemname + "["+gap.lang.drive+"]";
								smsg.type = "drive_member";
								smsg.key1 = obj.ch_code;
								smsg.key2 = "root";		// 드라이브인 경우 key2(폴더코드)는 root
								smsg.key3 = obj.ch_name;
								smsg.fr = gap.userinfo.rinfo.nm;
								smsg.sender = new_member_ky_list.join("-spl-");										
								//gap.push_noti_mobile(smsg);		
								
								//알림센터에 푸쉬 보내기
								var rid = obj.ch_code;
								var receivers = new_member_ky_list;
								var msg2 = "[" + gap.textToHtml(obj.ch_name) + "] " + gap.lang.miv;
								var sendername = "[Files : "+ gap.textToHtml(obj.ch_name) +"]"
								var data = smsg;
								gap.alarm_center_msg_save(receivers, "kp_files", sendername, msg2, rid, smsg);
							}
							////////////////////////////////////////////////////
							
						}else{
							/*_html += '		<li id="li_dl_' + res.ch_code + '">';
							_html += '			<div id="main_' + res.ch_code + '" owner="' + gap.search_cur_em() + '" class="drive-code"><span class="ico ico-drive' + (member_count != 0 ? "-share" : "") + '"></span><em>' + channel_name + '</em><button class="ico btn-more drive-area">더보기</button></div>';
							_html += '		</li>';*/

							_html += '		<li id="li_dl_' + res.ch_code + '">';
							_html += '			<div id="main_' + res.ch_code + '" owner="' + gap.search_cur_ky() + '" class="drive-code" data="root">';
							_html += '				<span id="btn_fold_' + res.ch_code + '"></span>';
							_html += '				<span class="ico ico-drive' + (member_count != 0 ? "-share" : "") + '"></span><em style="padding-left:20px;">' + channel_name + '</em>';
							_html += '				<button class="ico btn-more drive-area">더보기</button>';
							_html += '			</div>';
							_html += '		</li>';
							
							$((member_count != 0 ? "#share_drive_list" : "#person_drive_list")).append(_html);
							
							_self.__drive_left_event();
							
							// 생성된 드라이브로 이동
							//$("#main_" + res.ch_code).click();
							
							// member에게 소켓 전송
							var sender_list = [];
							if (member_count != 0){
								for (var i = 0; i < user_list.length; i++){
									
									
									if (user_list[i].dsize != "group"){
										sender_list.push(user_list[i].ky);
									}
								}
								
								if (sender_list.length > 0){
									// 드라이브에 초대되었음을 알림.
									var _noti = new Object();
									_noti.type = "drive_member";								
									_noti.p_code = (is_update ? obj.ch_code : res.ch_code);
									_noti.p_name = channel_name;	//(is_update ? obj.ch_name : res.ch_name);
									_noti.title = "";
									_noti.sender = sender_list;
									_wsocket.send_drive_msg(_noti);
									
									// 신규생성된 드라이브를 화면에 추가
									var _obj = new Object();
									_obj.sender = sender_list;
									_obj.ch_code = (is_update ? obj.ch_code : res.ch_code);
									_obj.ch_name = gap.textToHtml(channel_name);
									_obj.owner = gap.userinfo.rinfo.ky;
									_obj.type = "cd";
									_wsocket.send_box_msg(_obj, 'chmng');
								}
								
								
								
								//모바일  Push를 날린다. ///////////////////////////////////						
								var smsg = new Object();
								smsg.msg = "[" + channel_name + "] " + gap.lang.miv;
								smsg.title = gap.systemname + "["+gap.lang.drive+"]";
								smsg.type = "drive_member";
								smsg.key1 = (is_update ? obj.ch_code : res.ch_code);
								smsg.key2 = "root";	// 드라이브인 경우 key2(폴더코드)는 root
								smsg.key3 = channel_name;
								smsg.fr = gap.userinfo.rinfo.nm;
								//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
								smsg.sender = sender_list.join("-spl-");										
							//	gap.push_noti_mobile(smsg);		
							//	
								if (sender_list.length > 0){
									//알림센터에 푸쉬 보내기
									var rid = (is_update ? obj.ch_code : res.ch_code);
									var receivers = sender_list;
								//	var msg2 = "[" + gap.textToHtml(channel_name) + "] " + gap.lang.miv;
									var msg2 = gap.lang.miv;
									var sendername = "[Files : "+ gap.textToHtml(channel_name) +"]"
									var data = smsg;
									gap.alarm_center_msg_save(receivers, "kp_files", sendername, msg2, rid, smsg);
								}				
								////////////////////////////////////////////////////
							}
						}						

						gap.remove_layer('update_drive_layer');
						//gap.remove_layer('common_work_layer');
						
						
						// 드라이브 우측 상단 드라이브명 변경
						var ch_code = (is_update ? obj.ch_code : res.ch_code);
						
						if (!_self.check_selected_top_menu()){
							if (_self.select_folder_code == "root"){
								if (_self.select_drive_code == ch_code){
									$("#drive_title_path span").html(channel_name);
								}
								
							}else{
								if (_self.select_drive_code == ch_code){
									$("#title_" + _self.select_drive_code).html(channel_name);
								}
							}
						}
						
						if (_self.select_drive_code == ch_code){
							_self.update_drive_info(ch_code);
							
						}else{
							_self.update_drive_info();
						}

					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;						
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;					
				}
			});			
		});
		
		$("#close_drive_layer").on("click", function(){
			gap.remove_layer('update_drive_layer');
		//	$("#common_work_layer").hdie();
		//	gap.remove_layer('common_work_layer');
		});
	},
	
	"check_selected_top_menu" : function(){
		var _self =  this;
		if ( (this.select_left_menu=="1") || (this.select_left_menu=="2") || (this.select_left_menu=="3") || (this.select_left_menu=="4") ){
			return true;
		}
		return false;
	},	
	
	"show_drive_data" : function(drive_code){
		var _self = this;
		
		id = drive_code;
		this.box_layer_close();
		this.select_left_menu = "";
		this.select_drive_code = drive_code;
		this.select_drive_name = $("#main_" + drive_code + " em").text();
		this.select_folder_code = "root";
		this.select_folder_name = "";
		this.title_path_name = [];
		this.title_path_code = [];
		this.query_str = "";
		this.per_page = (this.disp_view_mode == "list" ? "10" : "20");
		this.cur_opt = "";
		this.draw_drive_members(drive_code);
		this.draw_drive_data(1);
		this.removeClass_channel();
		$("#main_" + drive_code).addClass("on");		
	},
	
	"drive_menu_content" : function(owner){
		if (owner == gap.search_cur_ky()){
			var items = {
					"exit" : {name : gap.lang.hidden},
					"sep01" : "-------------",
					"modify" : {name : gap.lang.modify_drive},
					"delete" : {name : gap.lang.delete_drive}
			}			
		}else{
			var items = {
					"exit" : {name : gap.lang.hidden}
			}			
		}
		return items;
	},
	
	"drive_info_menu_content" : function(is_drive_share){
		if (is_drive_share == "Y"){
			var items = {
					"create_share" : {name : gap.lang.create_drive},
					"exit_list" : {name : gap.lang.exit_drive_list}
			}
			
		}else{
			var items = {
					"create_person" : {name : gap.lang.create_drive},
					"exit_list" : {name : gap.lang.exit_drive_list}
			}			
		}

		return items;
	},	
	
	"context_menu_call_drive_mng" : function(key, options, _id){
		var _self = this;
		
		if (_id){
			_id = _id.replace("main_", "");
		}
	
		if (key == "modify"){
			this.modify_drive(_id);
			
		}else if (key == "delete"){
			this.delete_drive(_id);
			
		}else if (key == "exit"){
			this.exit_drive(_id);
			
		}else if (key == "create_share"){
			this.create_drive(null, 'Y');
			
		}else if (key == "create_person"){
			this.create_drive(null, 'N');	
			
		}else if (key == "exit_list"){
			this.draw_exit_info_list("1");				
		}
	},
	
	"modify_drive" : function(ch_code){
		var _self = this;
		var surl = gap.channelserver + "/search_info.km";
		var postData = {
				"type" : "D",
				"ch_code" : ch_code
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					_self.create_drive(res.data, res.data.ch_share);
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},	
	
	"delete_drive" : function(ch_code){
		var _self = this;
		var msg = gap.lang.confirm_delete;
		
		gap.showConfirm({
			title: "Confrim",
			contents: msg,
			callback: function(){
			var surl = gap.channelserver + "/drive_delete.km";
				var postData = {
						"ch_code" : ch_code
					};

				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(postData),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},							
					success : function(res){
						if (res.result == "OK"){
							var member_data = $.map(_self.cur_drive_list_info, function(ret, key) {
							     if (ret.ch_code == ch_code){
							        return ret.member;
							     }
							});
							
							var list = [];
							for (var i = 0; i < member_data.length; i++){
								list.push(member_data[i].ky);				
							}
							
							if (list.length > 0){
								var _obj = new Object();
								_obj.sender = list;
								_obj.ch_code = ch_code;
								_obj.type = "deld";
								_wsocket.send_box_msg(_obj, 'chmng');
							}
									
							
							
							$("#li_dl_" + ch_code).remove();
							$("#allcontent_drive").click();
							_self.update_drive_info();
							_self.removeClass_channel();
							$("#allcontent_drive").addClass("on");
							
						}else{
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				});	
			}
		});
	},
	
	"exit_drive" : function(drive_code){
		var _self = this;
		var surl = gap.channelserver + "/exit_info.km";
		var postData = {
				"id" : drive_code,
				"ty" : "2"
			};		

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					$("#li_dl_" + drive_code).remove();
					$("#allcontent_drive").click();
					
					
					//멤버중에 접속해 있는 사용자의 상태를 실시간 업데이트 해 준다. ////////////////////////////////////
					var members = gap.cur_drive_search_info(drive_code);
					var lists = [];
					for (var i = 0 ; i < members.member.length; i++){
						lists.push(members.member[i].ky);
					}
					lists.push(members.owner.ky);
					
					var _noti = new Object();
					_noti.type = "member_exit_drive";								
					_noti.p_code = drive_code;			
					_noti.sender = lists;
					_noti.user = gap.userinfo.rinfo.ky;
					_wsocket.send_box_msg(_noti, _noti.type);
					/////////////////////////////////////////////////////////////////////

					_self.update_drive_info();
					_self.removeClass_channel();
					$("#allcontent_drive").addClass("on");
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},	
	
	"update_drive_info" : function(ch_code){
		// 드라이브 리스트 정보 가져오기
		var _self = this;
		var is_member_update = (ch_code != undefined ? true : false);
		var surl = gap.channelserver + "/api/files/drive_list_all.km";
		var postData = JSON.stringify({});
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				_self.cur_drive_list_info = res.drive;
				_self.cur_drive_folder_list_info = res.folder;
				
				if (is_member_update){
					// 변경된 멤버 바로 표시
					if (_self.select_drive_code != ""){
						// 드라이브가 선택된 경우만 멤버 표시
						_self.draw_drive_members(ch_code);
					}
				}
			},
			error : function(e){
			}
		});		
	},
	
	"update_drive_channel_html" : function(res){
		var _sef = this;		
		var data = JSON.parse(res.f1);
		var _html = '';

		if (data.type == "deld"){
			$("#li_dl_" + data.ch_code).remove();
			this.update_drive_info();
			
		}else if (data.type == "delc"){
			$("#li_cl_" + data.ch_code).remove();
			this.update_channel_info();
			
		}else if (data.type == "cd"){
			if ($("#li_dl_" + data.ch_code).length != 0){
				return false;
			}

			_html += '<li id="li_dl_' + data.ch_code + '">';
			_html += '	<div id="main_' + data.ch_code + '" owner="' + data.owner + '" class="drive-code" data="root">';
			_html += '		<span id="btn_fold_' + data.ch_code + '"></span>';
			_html += '		<span class="ico ico-drive-share"></span><em style="padding-left:20px">' + data.ch_name + '</em>';
			_html += '		<button class="ico btn-more drive-area">더보기</button>';
			_html += '	</div>';
			_html += '</li>';
			
			$("#share_drive_list").append(_html);

			
			$("#share_drive_list .drive-code").off();
			$("#share_drive_list .drive-code").on("click", function(e){
				if (e.target.className == "ico btn-more drive-area"){
					$.contextMenu({
						selector : ".ico.btn-more.drive-area",
						autoHide : false,
						trigger : "left",
						callback : function(key, options){
							_self.context_menu_call_drive_mng(key, options, $(this).parent().attr("id"));
						},
						events : {
							hide: function (options) {
								$(this).removeClass("on");
		                	},
		                	show : function (options){
		                	}
						},			
						build : function($trigger, options){
							return {
								items: _self.drive_menu_content($($trigger).parent().attr("owner"))
							}
						}
					});
				}else{
					var id = e.currentTarget.id;
					_self.show_drive_data(id);
				}
			});				
			
			this.update_drive_info();			
			
		}else if (data.type == "cc"){
			if ($("#li_cl_" + data.ch_code).length != 0){
				return false;
			}
			
			_html += '<li id="li_cl_' + data.ch_code + '" style="padding-left:45px">';
			_html += '	<div id="' + data.ch_code + '" owner="' + data.owner + '" class="channel-code ' + data.ch_code + '">';
			var dischname = data.ch_name;
			if (data.ch_name.length > this.menu_length){
				dischname = data.ch_name.substring(0, this.menu_length) + "...";
			}
			_html += '	<span class="ico ico-people"></span><em>' + dischname + '</em>';
			_html += '	<span id="clist_'+data.ch_code+'" style="color:red;font-weight:bold;margin-left:2px" class="clistxx"></span>';
			_html += '	<button class="ico btn-more channel-area">더보기</button></div>';
			_html += '</li>';
			
			$("#share_channel_list").append(_html);
				
			$("#share_channel_list .channel-code").off();
			$("#share_channel_list .channel-code").on("click", function(e){
				
				if (e.target.className == "ico btn-more channel-area"){
					
					$.contextMenu({
						selector : ".ico.btn-more.channel-area",
						autoHide : false,
						trigger : "left",
						callback : function(key, options){
							_self.context_menu_call_channel_mng(key, options, $(this).parent().attr("id"));						
						},
						events : {
							hide: function (options) {
								$(this).removeClass("on");
		                	}
						},			
						build : function($trigger, options){
							return {
								items: _self.channel_menu_content($($trigger).parent().attr("owner"),$($trigger))
							}
						}
					});
				}else{
					var id = e.currentTarget.id;
					
					_self.click_oob = e;
					_self.show_channel_data(id);						

				}					
			});	
			
			this.update_channel_info();	
		}
	},	
	
	"channel_menu_content" : function(owner, obj){	
		var _self = this;
		var tid = $(obj).parent().attr("id");
		
		this.channel_menu_content_click_id = tid;
		
		if (typeof(tid) == "undefined"){
			tid = $(obj).data("key");
		}
		var is_star = false;
		if (tid != undefined){
			for (var i = 0; i < gap.cur_channel_list_info.length; i++){
				var item = gap.cur_channel_list_info[i];
				if (tid == item.ch_code){
					if (typeof(item.favorite) != "undefined"){
						for (var k = 0 ; k < item.favorite.length; k++){
							if (item.favorite[k] == gap.userinfo.rinfo.ky){
								is_star = true;
								break;
							}
						}
					}			
				}
			}
		}
		
		
		var items = {};
		
		if (owner == gap.search_cur_ky()){
			items["exit"] = {name : gap.lang.hidden};
			items["sep01"] = "-------------";
			items["modify"] = {name : gap.lang.modify_channel};
			items["delete"] = {name : gap.lang.delete_channel};
			items["move"] = {name : gap.lang.move_to_folder};
			items["sep03"] = "-------------";
			if (is_star){
				items["del_favorite"] = {name : gap.lang.fix2};
			}else{
				items["add_favorite"] = {name : gap.lang.fix};				
			}
			
		}else{
			items["move"] = {name : gap.lang.move_to_folder};
			items["exit"] = {name : gap.lang.hidden};
			items["sep01"] = "-------------";
			if (is_star){
				items["del_favorite"] = {name : gap.lang.fix2};				
			}else{
				items["add_favorite"] = {name : gap.lang.fix};
			}
		}		
		return items;
	},
	
	"channel_info_menu_content" : function(is_folder_share){
		if (is_folder_share == "Y"){
			var items = {
					"create_folder_share" : {name : gap.lang.create_folder},
					"create_share" : {name : gap.lang.create_channel},
					"sep01" : "-------------",
					"exit_list" : {name : gap.lang.exit_channel_list}
			}
			
		}else{
			var items = {
					"create_folder_person" : {name : gap.lang.create_folder},
					"create_person" : {name : gap.lang.create_channel},
					"sep01" : "-------------",
					"exit_list" : {name : gap.lang.exit_channel_list}
			}
		}
		return items;
	},	
	
	"context_menu_call_channel_mng" : function(key, options, _id){
		var _self = this;
		
		if (key == "modify"){
			this.modify_channel(_id);
			
		}else if (key == "delete"){
			this.delete_channel(_id);
			
		}else if (key == "exit"){
			this.exit_channel(_id);
			
		}else if (key == "create_share"){
			this.create_channel(null, null, 'Y');
			
		}else if (key == "create_person"){
			this.create_channel(null, null, 'N');
			
		}else if (key == "exit_list"){
			this.draw_exit_info_list("2");
			
		}else if (key == "member"){
			this.draw_channel_members(_id);
			
		}else if (key == "create_folder_share"){
			this.channel_create_folder(null, 'Y');
			
		}else if (key == "create_folder_person"){
			this.channel_create_folder(null, 'N');
			
		}else if (key == "move"){
			this.draw_channel_folder(_id);
			
		}else if (key == "add_favorite"){
			this.favorite_channel_folder(_id, "add");
			
		}else if (key == "del_favorite"){
			this.favorite_channel_folder(_id, "del");
		}
	},
	
	
	"favorite_channel_folder" : function(ch_code, _type){
		var _self = this;
		var surl = gap.channelserver + "/update_folder_favorite_channel.km";
		var postData = JSON.stringify({
			"channel_code" : ch_code,
			"ty" : _type
		});

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					_self.update_channel_info(null, true);
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});	
	},
	
	
	"modify_channel" : function(ch_code){
		var _self = this;
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
				if (res.result == "OK"){
					_self.create_channel(res.data, null, res.data.ch_share);
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},	
	
	"delete_channel" : function(ch_code){
		var _self = this;
		var msg = gap.lang.confirm_delete;
		gap.showConfirm({
			title: "Confrim",
			contents: msg,
			callback: function(){
			//채널 삭제가 완료되면 Plugin To Do을 삭제한다.
			gap.add_todo_plugin("del", ch_code);


			var surl = gap.channelserver + "/channel_delete.km";
			var postData = {
					"ch_code" : ch_code
				};			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){
						var member_data = $.map(gap.cur_channel_list_info, function(ret, key) {
						     if (ret.ch_code == ch_code){
						        return ret.member;
						     }
						});
						
						var list = [];
						for (var i = 0; i < member_data.length; i++){
							list.push(member_data[i].ky);
						}
						if (list.length > 0){
							var _obj = new Object();
							_obj.sender = list;
							_obj.ch_code = ch_code;
							_obj.type = "delc";
							_wsocket.send_box_msg(_obj, 'chmng');	
							
						}
						
						$("#li_cl_" + ch_code).remove();
						$("#li_cl_" + ch_code).remove();  //favorite에 있을수 있어서 한번더 지운다...
						$("#allcontent").click();
						_self.update_channel_info();
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
					
					

				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
			}
		});
	},
	
	"exit_channel" : function(ch_code){
		var _self = this;
		var msg = gap.lang.msg_exit;
		gap.showConfirm({
			title: "Confirm",
			contents: msg,
			callback: function(){
				var surl = gap.channelserver + "/exit_info.km";
				var postData = {
						"id" : ch_code,
						"ty" : "1"
					};
						
				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(postData),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success : function(res){
						if (res.result == "OK"){
							$("#li_cl_" + ch_code).remove();
							$("#li_cl_" + ch_code).remove();   //Favorite에 있을 수 있는 항목까지 제거한다.

							//멤버중에 접속해 있는 사용자의 상태를 실시간 업데이트 해 준다. ////////////////////////////////////
							var members = gap.cur_room_search_info(ch_code);
							var lists = [];
							for (var i = 0 ; i < members.member.length; i++){
								lists.push(members.member[i].ky);
							}
							lists.push(members.owner.ky);
							
							var _noti = new Object();
							_noti.type = "member_exit_channel";								
							_noti.p_code = ch_code;			
							_noti.sender = lists;
							_noti.user = gap.userinfo.rinfo.ky;
							_wsocket.send_box_msg(_noti, _noti.type);
							/////////////////////////////////////////////////////////////////////
							
							_self.update_channel_info();
							_self.removeClass_channel();
							_self.main_re_draw();

						}else{
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				});	
			}
		});
	},		
	
	"update_channel_info" : function(ch_code, draw_left){
		// 채널 리스트 정보 가져오기
		var _self = this;
		
		var is_member_update = (ch_code != undefined ? true : false);
		var is_draw_left = (draw_left != undefined ? draw_left : false);
		var surl = gap.channelserver + "/api/channel/channel_info_list.km";
	/*	var postData = JSON.stringify({
				"email" : gap.search_cur_em_sec(),
				"depts" : gap.full_dept_codes()
			});*/
		
		var postData = JSON.stringify({});	

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : postData,
			async : false,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				gap.cur_channel_list_info = res;
				if (is_member_update){
					// 변경된 멤버 바로 표시
					gBody3.draw_channel_members(ch_code);
				}
				
				if (is_draw_left){
					// 채널 정보 다시 그리기
					_self.draw_channel_left(res);
					_self.__channel_left_event();
				}
			},
			error : function(e){
			}
		});		
	},
	
	"channel_user_search" : function(ch_type, str, selectme){
		/*
		 * ch_type : D(드라이브), C(채널), F(폴더), B(버디리스트)
		 */
		var _self = this;
		if (ch_type == "D"){
			$("#input_drive_user").val("");
			
		}else if (ch_type == "C"){
			$("#input_channel_user").val("");
		}else if (ch_type == "CO"){
			$("#input_reg_user").val("");
		}else if (ch_type == "T"){
			$("#input_chat_user").val("");	
		}else if (ch_type == "B"){
			$("#input_chat_user").val("");	
		}
		
		gsn.requestSearch('', str, function(sel_data){
			
			for (var i = 0 ; i < sel_data.length; i++){
				var info = sel_data[i];
				if (selectme){	
					gFiles.aleady_select_user_count = 0;
					gFiles.channel_add_user(ch_type, info);
					gFiles.alert_aleady_select_user();					
				}else{
					if (info.ky.toLowerCase() == gap.userinfo.rinfo.ky.toLowerCase()){
						mobiscroll.toast({message:gap.lang.me_not_add_invite_user, color:'danger'});
						
					}else{
						gFiles.aleady_select_user_count = 0;
						gFiles.channel_add_user(ch_type, info);
						gFiles.alert_aleady_select_user();
					}
				}
				
			}
		});
	},
	
	"channel_list_user" : function(ch_type, obj){
		$("#same_name_list").hide();
		if (obj.em.toLowerCase() == gap.userinfo.rinfo.em.toLowerCase()){
			gap.gAlert(gap.lang.me_not_add_invite_user);
			return false;

		}else{
			gFiles.aleady_select_user_count = 0;
			gFiles.channel_add_user(ch_type, obj);
			gFiles.alert_aleady_select_user();
		}
	},
	
	"channel_add_user" : function(ch_type, obj){
		if (obj == undefined){
			mobiscroll.toast({message:gap.lang.searchnoresult, color:'danger'});
			return false;
		}
		
		var $el;
		var id = obj.ky;
		if (ch_type == "D"){	// 드라이브
			$el = $("#drive_member_list");
		}else if (ch_type == "C"){	// 채널
			$el = $("#channel_member_list");			
		}else if (ch_type == "CO"){	// 채널 옵션
			$el = $("#reg_member_list");		
		}else if (ch_type == "T"){	// 새로운 채팅(대화방)
			$el = $("#chat_member_list");
		}else if (ch_type == "F"){	// 폴더
			$el = $("#folder_member_list");
		}else if (ch_type == "I"){	// 폴더 (초대 가능 멤버 표시)
			$el = $("#folder_add_member_list");
		}else if (ch_type == "B"){   //버디리스트
			$el = $("#buddylist_member_list");
		}
		var len = $el.find("#member_" + id).length;
		
		if (len > 0){
		//	gap.gAlert(gap.lang.existuser);
			gFiles.aleady_select_user_count += len;
			return false;
		}
		
		var user_info = gap.user_check(obj);
		var person_img = gap.person_profile_photo(obj);
		var html = "";

		if (ch_type == "C" || ch_type == "CO" || ch_type == "D" || ch_type == "T" || ch_type == "B"){
			html += '<li class="f_between" id="member_' + id + '" data1="'+id+'" data2="'+user_info.nm+'">';
			html += '	<span class="txt ko">' + user_info.disp_user_info + '</span>';
			html += '	<button class="file_remove_btn" onClick="gFiles.channel_delete_user(this,\'' + ch_type + '\')"></button>';
			html += '</li>';			
			
		}else{
			html += '	<div class="member-profile" id="member_' + id + '"' + (ch_type == "I" ? " style='cursor:pointer' onClick='gFiles.add_folder_member(this)'" : "") + '>';
			if (ch_type != "I"){
				html += '		<button class="ico btn-member-del" onClick="gFiles.channel_delete_user(this,\'' + ch_type + '\')">삭제</button>';
			}
			html += '		<div class="user-result-thumb">' + person_img + '</div>';
			html += '		<dl>';
			html += '			<dt><span class="status online"></span>' + user_info.name + '</dt><dd>' + user_info.dept + '</dd><dd>' + user_info.company + '</dd>';
			html += '		</dl>';
			html += '	</div>';
		}

		
		if (ch_type == "F" || ch_type == "I"){
			$el.append($(html));
		} else {
			$el.append($(html));
			
			if ($el.children().length > 0){
				$el.parent().show();
			}
		}
				
		delete obj['_id'];
		$el.find("#member_" + id).data('user', obj);
	},
	
	"alert_aleady_select_user" : function(){
		if (gFiles.aleady_select_user_count == 0){
			//nothing
			
		}else if (gFiles.aleady_select_user_count == 1){
			gap.gAlert(gap.lang.existuser);
			return false;
			
		}else{
			gap.gAlert(gap.lang.existuser + " (" + gFiles.aleady_select_user_count + " " + gap.lang.myung + ")");
			return false;	
		}
		
	},
	
	"add_folder_member" : function(obj){
		var user_info = $(obj).data("user");	//JSON.parse( $(obj).attr("data-user") );
		var emp = (user_info.emp ? user_info.emp : user_info.id);
		var person_img = gap.person_profile_photo(user_info);
		var html = "";
		
		var mem_info = gap.user_check(user_info);
		
		html += '	<div class="member-profile" id="member_' + emp + '">';
		html += '		<button class="ico btn-member-del" onClick="gFiles.channel_delete_user(this,\'I\')">삭제</button>';
		html += '		<div class="user-result-thumb">' + person_img + '</div>';
		html += '		<dl>';
		html += '			<dt><span class="status online"></span>' + mem_info.name + '</dt><dd>' + mem_info.dept + '</dd><dd>' + mem_info.company + '</dd>';
		html += '		</dl>';
		html += '	</div>';
		
		$("#folder_member_list").append($(html));
		$(obj).remove();
		
		$("#member_" + emp).data('user', user_info);
		
		if ($("#folder_add_member_list").children().length < 6){
			$("#folder_member_list").css("max-height", "366px")
			
		}
	},
	
	"channel_delete_user" : function(obj, ch_type){
		
		var user_info = $(obj).parent().data("user");	//JSON.parse( $(obj).parent().attr("data-user") );
		var id = $(obj).parent().attr("id");
		
		if (ch_type == "C") {
			$("#channel_member_list #" + id).remove();
		} else if (ch_type == "CO") {
			$("#reg_member_list #" + id).remove();
		} else {			
			$("#" + id).remove();
		}
		
		if (ch_type == "C"){
			if ($("#channel_member_list").children().length == 0){
				$("#channel_member_list").parent().hide();
			}
			
		}else if (ch_type == "CO"){
			if ($("#reg_member_list").children().length == 0){
				$("#reg_member_list").parent().hide();
			}
				
		}else if (ch_type == "D"){
			if ($("#drive_member_list").children().length == 0){
				$("#drive_member_list").parent().hide();
			}
			
		}else if (ch_type == "T"){
			if ($("#chat_member_list").children().length == 0){
				$("#chat_member_list").parent().hide();
			}
		}else if (ch_type == "B"){
			if ($("#buddylist_member_list").children().length == 0){
				$("#buddylist_member_list").parent().hide();
			}
		}
		
		var mem_info = gap.user_check(user_info);
		
		if (ch_type == "F" || ch_type == "I"){
			var id = user_info.ky;
			var person_img = gap.person_profile_photo(user_info);
			var html = "";
			
			html += '	<div class="member-profile" id="member_' + id + '" style="cursor:pointer" onClick="gFiles.add_folder_member(this)">';
			html += '		<div class="user-result-thumb">' + person_img + '</div>';
			html += '		<dl>';
			html += '			<dt><span class="status online"></span>' + mem_info.name + '</dt><dd>' + mem_info.dept + '</dd><dd>' + mem_info.company + '</dd>';
			html += '		</dl>';
			html += '	</div>';
			
			$("#folder_add_member_list").append($(html));
			$("#member_" + id).data('user', user_info);
			
			if ($("#folder_add_member_list").children().length > 5){
				$("#folder_member_list").css("max-height", "244px")
				
			}
		}
	},
	
	"draw_drive_data" : function(page_no){
		var _self = this;
		
		if (page_no == 1){
			$("#sub_channel_content").empty();
			$("#sub_channel_content").addClass("drive");
			
			this.start_page = "1";
			this.cur_page = "1";
			this.per_page = (this.disp_view_mode == "list" ? "10" : "20");
			this.cur_file_count = 0;
			this.cur_file_total_count = 0;
			
			var html = "";
			
			html += '<div class="chat-area">';
			html += '	<div class="channel-header">';
			html += '		<h2 id="drive_title_path"></h2>';
			html += '		<div class="channel-search-wrap">';
			html += '			<div class="channel-search">';
			html += '				<div class="input-field">';
			html += '					<input type="text" autocomplete="off" value="' + this.query_str + '" id="ch_query" placeholder="' + gap.lang.input_search_query + '" />';
			html += '				</div>';
			html += '				<button class="ico btn-channel-search" id="ch_query_btn">검색</button> ';
			html += '			</div>';
			html += '		</div>';
			html += '		<div class="drive-btns" style="display: flex; align-items: center; gap: 2px;">';
			if (gBody.drive_size_over){
				//html += '			<button id="drive_file_upload_btn" style="display:none;">' + gap.lang.upload + '</button>';
				
			}else{
				//html += '			<button id="drive_file_upload_btn">' + gap.lang.upload + '</button>';
			}
			
			//html += '			<button id="drive_create_folder_btn"><span>' + gap.lang.new_folder + '</span></button>';
			
			/** 생성 또는 업로드 버튼 **/
			html += '			<button id="drive_create_or_upload_btn">';
			html += '				<span class="btn_inner">';
			html += '					<span class="btn_ico"></span>';
			html += '					<span>' + gap.lang.create_or_upload + '</span>';
			html += '				</span>';
			html += '			</button>';
			/** 생성 또는 업로드 버튼 **/
			
			html += '			<button id="drive_file_download_btn">' + gap.lang.download + '</button>';
			html += '			<button id="drive_move_file_btn"><span>' + gap.lang.move + '</span></button>';
			html += '			<button id="drive_delete_file_btn"><span>' + gap.lang.basic_delete + '</span></button>';
			html += '			<button id="drive_select_all_btn"><span>' + gap.lang.selectall + '</span></button>';
			html += '			<button id="drive_deselect_all_btn"><span>' + gap.lang.deselection + '</span></button>';
//			html += '			<button class="ico btn-drive-more">더보기</button>';
			html += '			<button id="view_mode_list" class="ico btn-mode-list' + (this.disp_view_mode == "list" ? " on" : "") + '"><span>리스트보기</span></button>';
			html += '			<button id="view_mode_image" class="ico btn-mode-img' + (this.disp_view_mode == "image" ? " on" : "") + '"><span>이미지보기</span></button>';
	//		html += '			<button id="view_mode_gallery" class="ico btn-mode-gallery' + (this.disp_view_mode == "gallery" ? " on" : "") + '"><span>갤러리보기</span></button>';
			html += '		</div>';
			html += '	</div>';

			html += '   <div class="progress-bar top-progress-bar" id="total-progress_folder" style="display:none;">';
			html += '   	<span id="folder_process" style="width:50%"></span>';
			html += '   </div>';
			
			html += '	<div class="wrap-channel" id="wrap_drive_data_list" style="overflow:hidden; height:calc(100% - 20px);margin-top:30px;">';
			if (gFiles.disp_view_mode == "list"){
				html += '		<div class="list" id="drive_data_list">';
				html += '			<ul id="drive_folder_list_area">';
				html += '			</ul>';
				html += '			<ul id="drive_file_list_area">';		
				html += '			</ul>';
				html += '		</div>';
				html += '		<div class="paging">';
				html += '			<ul id="paging_area">';
				html += '			</ul>';
				html += '		</div>';
				
			}else{
				html += '		<div id="drive_data_gallery">';
				html += '			<div class="folder" id="drive_data_folder_area" style="display:none;">';
				html += '				<h3>' + gap.lang.folder + '(<span id="drive_folder_count">0</span>)</h3>';
				html += '				<ul id="drive_folder_list_area">';
				html += '				</ul>';
				html += '			</div>';	
				html += '			<div class="gallery" id="drive_data_gallery_area" style="display:none;">';
				html += '				<h3>' + gap.lang.file + '(<span id="drive_file_count">0</span>)</h3>';
				html += '				<ul id="drive_file_list_area">';
				html += '				</ul>';
				html += '			</div>';
				html += '		</div>';				
			}
			html += '	</div>';
			html += '</div>';
			
			$("#sub_channel_content").html(html);	
			
		}
		var query_str = this.query_str;

		if (this.is_box_layer_open){
			$("#drive_data_list").addClass("line2");
		}	
		
		this.draw_drive_title_path();
		
		//채탱화면에서 드라이브를 바로 클릭한 경우 화면을 전환해야 한다.
		gap.show_content("channel");
		$("#left_channel").show();
		$("#chat_profile").hide();
		//$("#user_profile").show();
		//////////////////////////////////////////////////////////////////////
		
		this.start_skp = (parseInt(this.per_page) * (parseInt(page_no))) - (parseInt(this.per_page) - 1);
		
		//"dtype" : 은 파일 형식으로 필터링 할때 사용한다. ppt, xls, doc, pdf, image, movie, hwp, txt, etc
		var surl = gap.channelserver + "/folder_list.km";
		var postData = {
				"ty" : (this.disp_view_mode == "list" ? "1" : (page_no == 1 ? "1" : "2")), //(page_no == 1 ? "1" : "2"),
				"drive_key" : this.select_drive_code,
				"parent_folder_key" : this.select_folder_code,
				"start" : (this.start_skp - 1).toString(),
				"perpage" : this.per_page,
				"dtype" : this.click_filter_image,
				"q_str" : this.query_str
			};

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text",	//json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(__res){
				var res = JSON.parse(__res);
				if (res.result == "OK"){
					_self.cur_file_count += res.data.datalist.length;
					_self.cur_file_total_count = res.data.totalcount;
					_self.draw_drive_data_list(page_no, res.data);	
				}else{
					if (_self.query_str != "" && res.data == null){
						_self.cur_file_count = 0;
						_self.cur_file_total_count = 0;
						_self.draw_drive_data_list(1, {datalist:[], totalcount:0});	
						return false;
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});				
		
		$("#ch_query").keypress(function(e){
			if (e.keyCode == 13){
				_self.search_enter("d");
			}
		});
		$("#ch_query_btn").on("click", function(e){
			_self.search_enter("d");
		});
		
		
		///// 생성 또는 업로드 버튼
		$("#drive_create_or_upload_btn").off().on("click", function(e){
			if($("#drive_create_or_upload_dropdown").length === 0){
				// 드롭다운 열기
				$("#drive_create_or_upload_btn").addClass("active");
				_self.draw_drive_btn_dropdown_menu();
			} else {
				// 드롭다운 닫기
				$("#drive_create_or_upload_btn").removeClass("active");
				$("#drive_create_or_upload_dropdown").slideUp(300, function(){
					$("#drive_create_or_upload_dropdown").remove();
				});
				$("#drive_create_or_upload_dropdown .inner").animate({
					"opacity" : 0.3
				}, 250);
				_self.files_dropdown_flag = true;
			}
		});
		
		
		$("#drive_create_folder_btn").on("click", function(){
			if (_self.title_path_name.length == 7){
				// 7 depth면 생성 불가
				gap.gAlert(gap.lang.create_folder_alert);
				return false;
			}
			_self.drive_create_folder();
		});
		$("#drive_file_download_btn").on("click", function(){
			_self.drive_download_file();
		});
		$("#drive_move_file_btn").on("click", function(){
			_self.drive_move_file();
		});
		$("#drive_delete_file_btn").on("click", function(){
			_self.drive_delete_select_item();
		});
		$("#drive_select_all_btn").on("click", function(){
			_self.drive_select_all_item();
		});
		$("#drive_deselect_all_btn").on("click", function(){
			_self.drive_deselect_item();
		});
		$("#view_mode_list").on("click", function(){
			localStorage.setItem('view_mode', 'list');
			_self.disp_view_mode = "list";
			_self.draw_drive_data(1);
		});
		$("#view_mode_image").on("click", function(){
			localStorage.setItem('view_mode', 'image');
			_self.disp_view_mode = "image";
			_self.draw_drive_data(1);
		});
		$("#view_mode_gallery").on("click", function(){
			localStorage.setItem('view_mode', 'gallery');
			_self.disp_view_mode = "gallery";
			_self.draw_drive_data(1);
		});		
		
		this.folder_file_upload_event();	
	},
	
	"draw_drive_btn_dropdown_menu": function(){
		var _self = this;
		
		var html = "";
		html += "<div id='drive_create_or_upload_dropdown'>";
		html += "	<div class='inner'>";
		html += "		<div class='btn_wrap'>";
		html += "			<button type='button' id='drive_create_folder_btn'>";
		html += "				<span class='btn_ico folder_create'></span>";
		html += "				<span>" + gap.lang.create_folder + "</span>";
		html += "			</button>";
		html += "		</div>";
		html += "		<div class='btn_wrap'>";
		html += "			<button type='button' id='drive_file_upload_btn'>";
		html += "				<span class='btn_ico file_upload'></span>";
		html += "				<span>" + gap.lang.file_upload + "</span>";
		html += "			</button>";
	//	html += "			<button type='button'>";
	//	html += "				<span class='btn_ico folder_upload'></span>";
	//	html += "				<span>폴더 업로드</span>";
	//	html += "			</button>";
		html += "		</div>";
		html += "		<div class='btn_wrap'>";
		html += "			<button type='button' id='create_word_btn'>";
		html += "				<span class='btn_ico word'></span>";
		html += "				<span>Word</span>";
		html += "			</button>";
		html += "			<button type='button' id='create_excel_btn'>";
		html += "				<span class='btn_ico excel'></span>";
		html += "				<span>Excel</span>";
		html += "			</button>";
		html += "			<button type='button' id='create_ppt_btn'>";
		html += "				<span class='btn_ico ppt'></span>";
		html += "				<span>PowerPoint</span>";
		html += "			</button>";
		html += "			<button type='button' id='create_pdf_btn'>";
		html += "				<span class='btn_ico pdf'></span>";
		html += "				<span>PDF</span>";
		html += "			</button>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";
		
		html = $(html);
		
		$("#drive_create_or_upload_btn").append(html);

		$(document).on("click", function(e){
			
			/// true일 때만 드롭다운 메뉴를 열수 있음
			// false일 때만 닫을 수 있음.
			if(!_self.files_dropdown_flag){
			
				if(!$(e.target).closest("#drive_create_or_upload_btn").length && !$(e.target).closest("#drive_create_or_upload_dropdown").length){
					$("#drive_create_or_upload_dropdown").remove();
					$("#drive_create_or_upload_btn").removeClass("active");
				}
				_self.files_dropdown_flag = true;
			}
				
		});
		
		html.stop().slideDown(250, function(){
			_self.files_dropdown_flag = false;
		});
		
		$("#drive_create_or_upload_dropdown .inner").animate({
			"opacity" : 1
		}, 250);
		
		// 드롭다운 내부 이벤트 초기화
		$("#drive_create_or_upload_dropdown .inner, #drive_create_or_upload_dropdown button").off().on("click", function(e){
			e.stopPropagation();
		});

		// 버튼 이벤트 처리
		this.folder_file_upload_event();
		
		$("#drive_create_folder_btn").on("click", function(){
			$("#drive_create_or_upload_btn").click();
			if (_self.title_path_name.length == 7){
				// 7 depth면 생성 불가
				gap.gAlert(gap.lang.create_folder_alert);
				return false;
			}
			_self.drive_create_folder();
		});

		$("#create_word_btn").off().on("click", function(){
			$("#drive_create_or_upload_btn").click();
			_self.create_share_office_file('word');

		});
		
		$("#create_excel_btn").off().on("click", function(){
			$("#drive_create_or_upload_btn").click();
			_self.create_share_office_file('excel');

		});
		
		$("#create_ppt_btn").off().on("click", function(){
			$("#drive_create_or_upload_btn").click();
			_self.create_share_office_file('ppt');

		});
		
		$("#create_pdf_btn").off().on("click", function(){
			$("#drive_create_or_upload_btn").click();
			_self.create_share_office_file('pdf');

		});
		
	},
	
	"create_share_office_file" : function(opt){
		var _self = this;
		var file_info = new Object();
		var file_name = "";
		
		if (opt == "word"){
			file_name = "new.docx";
		} else if (opt == "excel"){
			file_name = "new.xlsx";
		} else if (opt == "ppt"){
			file_name = "new.pptx";
		} else if (opt == "pdf"){
			file_name = "new.pdf";
		}
		
		file_info.drive_code = this.select_drive_code;
		file_info.drive_name = this.select_drive_name;
		file_info.folder_code = this.select_folder_code;
		file_info.folder_name = this.select_folder_name;
		file_info.filename = file_name;
		
		gap.create_office_file(opt, file_info);
	},
	
	"draw_drive_data_list" : function(page_no, res){
		var _self = this;
		
		if (page_no == 1){
			if (this.select_folder_code == "root"){
				if (this.query_str == "" && res.folderlist.length == 0 && res.datalist.length == 0){
					//데이터가 없는 경우
					var html = '<div class="msg-empty"><img src="' + window.root_path + '/resource/images/empty.png" alt="" />' + gap.lang.no_upload_file + '<br />' + gap.lang.upload_use_file + '</div>';
					$("#wrap_drive_data_list").empty();
					$("#wrap_drive_data_list").html(html);
					return false;
				}
				
				if (this.query_str != "" && res.datalist.length == 0){
					//검색된 파일이 없는 경우
					var html = '<div class="msg-empty"><img src="' + window.root_path + '/resource/images/empty.png" alt="" />' + gap.lang.searchnoresult + '</div>';
					$("#wrap_drive_data_list").empty();
					$("#wrap_drive_data_list").html(html);
					return false;
				}				
			}			
		}
		
		if (this.disp_view_mode == "list"){
			$("#drive_folder_list_area").html('');
			$("#drive_file_list_area").html('');			
		}

		if (typeof res.folderlist != "undefined"){
			// 상위폴더 이동
			var parent_folder_html = '';
			if (this.select_folder_code != "root"){
				if (this.disp_view_mode == "list"){
					parent_folder_html += '<li id="move_parent_folder">';
					parent_folder_html += '	<a style="cursor:pointer">';
					parent_folder_html += '		<span class="ico ico-folder-path"></span>';
					parent_folder_html += '		<dl>';
					parent_folder_html += '			<dt><strong>' + gap.lang.parent_folder + '</strong></dt>';
					parent_folder_html += '		</dl>';
					parent_folder_html += '	</a>';
					parent_folder_html += '</li>';
					
					$("#drive_folder_list_area").append(parent_folder_html);
					
				}else{
					parent_folder_html += '<li class="gallery-info" id="move_parent_folder">';
				//	parent_folder_html += '	<div class="thm"><span class="ico ico ico-folder-path-b"></span></div>';
					parent_folder_html += '	<dl class="">';
					parent_folder_html += '		<dt><span class="ico ico ico-folder"></span></dt>';
					parent_folder_html += '		<dd><strong >' + gap.lang.parent_folder + '</strong></dd>';
					parent_folder_html += '	</dl>';
					parent_folder_html += '</li>';
					
					$("#drive_folder_list_area").append(parent_folder_html);
					$("#drive_folder_count").html(res.folderlist.length);
					$("#drive_data_folder_area").show();
				}
				
				$("#move_parent_folder").on("click", function(){
					if (_self.title_path_code.length == 1){
						_self.cur_folder_info = "";
						_self.parent_folder_info = "";
						_self.select_folder_code = "root";
						_self.select_folder_name = "";
						_self.title_path_name = [];
						_self.title_path_code = [];
						_self.start_page = "1";
						_self.cur_page = "1";
						_self.draw_drive_members(_self.select_drive_code);
						_self.draw_drive_data(1);
						
					}else{
						var array_cnt = _self.title_path_code.length;
						
						_self.cur_folder_info = _self.parent_folder_info;
						_self.select_folder_code = _self.title_path_code[array_cnt - 2];
						_self.select_folder_name = _self.title_path_name[array_cnt - 2];
						_self.title_path_name.pop();
						_self.title_path_code.pop();
						_self.start_page = "1";
						_self.cur_page = "1";
						_self.draw_folder_members();
						_self.draw_drive_data(1);
					}
				});
				
			}else{
				if (this.disp_view_mode != "list"){
					if (res.folderlist.length > 0){
						$("#drive_folder_count").html(res.folderlist.length);
						$("#drive_data_folder_area").show();
					}
				}				
			}
			
			for (var i = 0;  i < res.folderlist.length; i++){
				var folder_info = res.folderlist[i];
				var folder_id = folder_info._id.$oid;
				var folder_name = folder_info.folder_name;
				var user_info = gap.user_check(folder_info.owner);
				var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(folder_info.GMT));
				var disp_time = gap.change_date_localTime_only_time(String(folder_info.GMT));
				var folder_html = '';
				
				if (this.disp_view_mode == "list"){
					folder_html += '<li id="' + folder_id + '" style="list-style:none;">';
					folder_html += '	<div class="checkbox">';
					folder_html += '		<label>';
					folder_html += '			<input type="checkbox" name="folder_checkbox" value="' + folder_id + '" owner="' + folder_info.owner.ky + '"><span class="checkbox-material"><span class="check"></span></span>';
					folder_html += '		</label>';
					folder_html += '	</div>';
					folder_html += '	<a style="cursor:pointer" id="folder_' + folder_id + '">';
				//	folder_html += '		<span class="ico ico-folder' + (folder_info.folder_share == "Y" ? "-share" : "") + '"></span>';
					folder_html += '		<span class="ico ico-folder"></span>';
					folder_html += '		<dl>';
					folder_html += '			<dt><strong>' + folder_name + '</strong></dt>';
					folder_html += '			<dd><span>' + user_info.name + gap.lang.hoching + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
					folder_html += '		</dl>';
					folder_html += '	</a>';
					
					/*if (folder_info.folder_share == "Y"){
						folder_html += '	<div class="share-member share-folder-member" id="member_' + folder_id + '">';
						folder_html += '		<div class=""><button class="btn-view-member"><span class="ico ico-share-member"></span>' + folder_info.member.length + gap.lang.myung + '</button></div>';
						folder_html += '	</div>';				
					}*/
					
					if (folder_info.owner.ky == gap.userinfo.rinfo.ky){
						folder_html += '	<button class="ico btn-more folder-menu"></button>';
					}
					folder_html += '</li>';
					
					$("#drive_folder_list_area").append(folder_html);
					
				}else{
					folder_html += '<li class="gallery-info" id="' + folder_id + '" style="list-style:none;">';
					folder_html += '	<div class="checkbox">';
					folder_html += '		<label>';
					folder_html += '			<input type="checkbox" name="folder_checkbox" value="' + folder_id + '" owner="' + folder_info.owner.ky + '"><span class="checkbox-material"><span class="check"></span></span>';
					folder_html += '		</label>';
					folder_html += '	</div>';
				//	folder_html += '	<div class="thm" id="folder_' + folder_id + '"><span class="ico ico ico-folder' + (folder_info.folder_share == "Y" ? "-share" : "") + '-b"></span></div>';
					folder_html += '	<dl id="folder_' + folder_id + '" class="">';
				/*	folder_html += '		<dt><strong title="' + folder_name + '">' + folder_name + '</strong></dt>';
					folder_html += '		<dd><span>' + folder_info.owner.nm + gap.lang.hoching + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';*/
					folder_html += '		<dt><span class="ico ico ico-folder"></span></dt>';
					folder_html += '		<dd><strong >' + folder_name + '</strong></dd>';
					folder_html += '	</dl>';
					if (folder_info.owner.ky == gap.userinfo.rinfo.ky){
						folder_html += '	<button class="ico btn-more folder-menu"></button>';	
					}
										
				/*	if (folder_info.folder_share == "Y"){
						folder_html += '	<div class="share-member" id="member_' + folder_id + '">';
						folder_html += '		<div class=""><button class="btn-view-member"><span class="ico ico-share-member"></span>' + folder_info.member.length + gap.lang.myung + '</button></div>';
						folder_html += '	</div>';
					}*/
					folder_html += '</li>';
					
					$("#drive_folder_list_area").append(folder_html);
				}
				
				$("#folder_bottom_" + folder_id).bind("click", folder_id, function(event){
					$("#folder_" + event.data).click();
				});				

				$("#folder_" + folder_id).bind("click", folder_info, function(event){
					var select_id = $(this).attr("id")
					var folder_id = select_id.split("folder_")[1];
					_self.parent_folder_info = _self.cur_folder_info;
					_self.cur_folder_info = event.data;
					_self.select_folder_code = folder_id;
					_self.select_folder_name = (_self.disp_view_mode == "list" ? $("#" + select_id + " dl dt strong").text() : $("#" + folder_id + " dl dd strong").text());
					_self.title_path_code.push(_self.select_folder_code);
					_self.title_path_name.push(_self.select_folder_name);
					_self.draw_folder_members();
					_self.draw_drive_data(1);
				});
				
				$("#member_" + folder_id).bind("click", folder_info.member, function(event){
					_self.show_folder_member($(this), event.data);
				});

			}
			
			$(".ico.btn-more.folder-menu").off();
			$(".ico.btn-more.folder-menu").on("click", function(){
				$.contextMenu({
					selector : ".ico.btn-more.folder-menu",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
						_self.context_menu_call_folder_mng(key, options, $(this).parent().attr("id"));
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
						}
					},			
					build : function($trigger, options){
						options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
						return {
							items: _self.folder_menu_content()
						}
					}
				});
			});			
		}
		
		if (this.disp_view_mode != "list"){
			if (res.datalist.length > 0){
				$("#drive_file_count").html(res.datalist.length);
				$("#drive_data_gallery_area").show();
				
			}else{
				$("#drive_data_gallery_area").hide();
			}
		}
				
		for (var k = 0;  k < res.datalist.length; k++){
			var file_info = res.datalist[k];
			var file_id = file_info._id.$oid;
			var user_info = gap.user_check(file_info.owner);
			var disp_file_name = gap.get_bun_filename(file_info);
			var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(typeof(file_info.lastupdate) != "undefined" ? file_info.lastupdate : file_info.GMT));
			var disp_time = gap.change_date_localTime_only_time(String(typeof(file_info.lastupdate) != "undefined" ? file_info.lastupdate : file_info.GMT));
			var icon_kind = gap.file_icon_check(file_info.filename);
			var downloadurl = gap.search_file_convert_server(file_info.fserver) + "FDownload.do?id=" + file_info._id.$oid + "&ty=1&ky="+gap.userinfo.rinfo.ky;
			var show_thumb = false;
			var file_html = '';
			
			if (this.disp_view_mode == "list"){
				file_html += '	<li id="' + file_id + '" style="list-style:none;">';
				file_html += '		<div class="checkbox">';
				file_html += '			<label>';
				file_html += '				<input type="checkbox" name="file_checkbox" value="' + file_id + '"><span class="checkbox-material"><span class="check"></span></span>';
				file_html += '			</label>';
				file_html += '		</div>';
				file_html += '		<a style="cursor:pointer" id="file_' + file_id + '" owner="' + file_info.owner.ky + '" fserver="' + file_info.fserver + '" fname="' + disp_file_name + '" fsize="' + file_info.file_size.$numberLong + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '">';
				file_html += '			<span class="ico ico-file ' + icon_kind + '"></span>';
				file_html += '			<dl>';
				file_html += '				<dt><strong>' + disp_file_name + '</strong> <span>(' + gap.file_size_setting(file_info.file_size.$numberLong) + ')</span></dt>';
				file_html += '				<dd><span>' + user_info.name + gap.lang.hoching + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
				file_html += '			</dl>';
				file_html += '		</a>';
				file_html += '		<button class="ico btn-more file-menu"></button>';
				file_html += '	</li>';
				
				$("#drive_file_list_area").append(file_html)
				
			}else{
				file_html += '<li class="gallery-info" id="' + file_id + '" style="list-style:none;">';
				file_html += '	<div class="checkbox">';
				file_html += '		<label>';
				file_html += '			<input type="checkbox" name="file_checkbox" value="' + file_id + '" id="chk_' + file_id + '"><span class="checkbox-material"><span class="check"></span></span>';
				file_html += '		</label>';
				file_html += '	</div>';
			//	file_html += '	<div class="thm' + (icon_kind == "video" ? " video-thm" : "") + '" id="file_' + file_id + '" owner="' + file_info.owner.em + '" fserver="' + file_info.fserver + '" fname="' + file_info.filename + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '">';
				file_html += '	<div class="thm" id="file_' + file_id + '" owner="' + file_info.owner.ky + '" fserver="' + file_info.fserver + '" fname="' + file_info.filename + '" fsize="' + file_info.file_size.$numberLong + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '">';

				if (this.disp_view_mode == "image" && icon_kind == "img"){
					show_thumb = true;
				}
				if (this.disp_view_mode == "gallery" && file_info.thumbOK == "T"){
					show_thumb = true;
				}
				
				if (show_thumb){
					file_html += '		<img src="' + gap.search_file_convert_server(file_info.fserver) + '/FDownload_thumb.do?id=' + file_id + '&ty=1">' + (icon_kind == "video" ? '<span class="ico ico-video-b">재생</span>' : "");	
				}else{
					file_html += '		<span class="ico ico ico-' + icon_kind + '-b"></span>';	
				}
				file_html += '	</div>';
				file_html += '	<dl id="file_bottom_' + file_id + '" class="' + (show_thumb ? "gallery-attach" : "") + '">';
				file_html += '		<dt>' + (show_thumb ? '<span class="ico ico-attach ' + icon_kind + '"></span>' : "") + '<strong title="' + disp_file_name + '">' + disp_file_name + '</strong><span>&nbsp;(' + gap.file_size_setting(file_info.file_size.$numberLong) + ')</span></dt>';
				file_html += '		<dd><span>' + user_info.name + gap.lang.hoching + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
				file_html += '	</dl>';
				file_html += '	<button class="ico btn-more file-menu"></button>';
				file_html += '</li>';
				
				$("#drive_data_gallery_area").append(file_html);				
			}
			
			$("#file_bottom_" + file_id).bind("click", file_id, function(event){
				$("#file_" + event.data).click();
			});

			$("#file_" + file_id).on("click", function(e){
				_self.box_layer_close();
				var furl = $(this).attr("furl");
				var fname = $(this).attr('fname');
				var md5 = $(this).attr('md5');
				var fid = $(this).attr('id').replace("file_", "");
				
				if (gap.checkFileExtension(fname)){
					var url = gap.channelserver + "office/" + fid + "/files";
					gap.popup_url_office(url);	
					return false;
				}else{
					var ext = gap.is_file_type_filter(fname);
					if (ext == "img"){
						var url = gap.channelserver + "FDownload.do?id="+fid+"&ty=1&ky=" + gap.userinfo.rinfo.ky;
						gap.show_image(url, fname);
						return false;
					}else if (ext == "movie"){
						var url = gap.channelserver + "FDownload.do?id="+fid+"&ty=1&ky="+gap.userinfo.rinfo.ky;
						gap.show_video(url, fname);	
						return false;
					}
					
				}
				

				var surl = gap.channelserver + "/file_info.km";
				var postData = {
						"id" : fid,
						"md5" : md5,
						"ty" : "1"
					};		

				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(postData),
					success : function(res){
						if (res.result == "OK"){
							var file_info = res.data;

							_self.draw_file_detail_info(file_info, "1")
							
							$(".detail-info").mCustomScrollbar({
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
						}else{
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				});
			});
			
			$("#chk_" + file_id).bind("click", file_id, function(event){
				if ($(this).prop("checked")){
					$("#" + event.data).addClass("on");
				}else{
					$("#" + event.data).removeClass("on");
				}
			});
		}
		
		$(".ico.btn-more.file-menu").off();
		$(".ico.btn-more.file-menu").on("click", function(){
			$.contextMenu({
				selector : ".ico.btn-more.file-menu",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){
					var $selector = (_self.disp_view_mode == "list" ? $(this).prev() : $(this).prev().prev());
					var f_id = $selector.attr("id").replace("file_", "");
					var f_server = $selector.attr("fserver");
					var f_name = $selector.attr("fname");
					var f_md5 = $selector.attr("md5");
					var f_url = $selector.attr("furl");

					_self.context_menu_call_file_mng(key, options, f_id, f_server, f_name, f_md5, f_url);
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
					}
				},			
				build : function($trigger, options){
					var $selector = (_self.disp_view_mode == "list" ? $trigger.prev() : $trigger.prev().prev());
					var fowner = $selector.attr("owner");
					var fname = $selector.attr('fname');
					var thmok = $selector.attr('thmok');
					var icon_kind = gap.file_icon_check(fname);
					var is_preview = true;
					if (icon_kind == "img" || icon_kind == "video"){
					//	is_preview = false;
					}else{
						if (!_self.check_preview_file(fname)){
							is_preview = false;
						}
					}							
					options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
					
					return {
						items: _self.file_menu_content(is_preview, fowner)
					}
				}
			});				
		});		
	
		
		//페이징
		this.total_file_count = res.totalcount;
		this.total_page_count = this.get_page_count(this.total_file_count, this.per_page);
		if (this.disp_view_mode == "list"){
			this.initialize_page();
		}
		
		$("#wrap_drive_data_list").mCustomScrollbar({
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
			autoHideScrollbar : false,
		//	setTop : ($("#wrap_drive_data_list").height()) + "px",
			callbacks : {
				onTotalScrollBackOffset: 100,
				onTotalScroll: function(){
					if (_self.disp_view_mode != "list"){
						page_no++;
						_self.add_drive_data_list(page_no);
					}
				},
				onTotalScrollOffset: 100,
				alwaysTriggerOffsets:true
			}
		});
	},
	
	"add_drive_data_list" : function(page_no){
		var _self = this;
		var is_continue = false;
		
		if (gFiles.disp_view_mode == "list"){
			is_continue = true;
		}else{
			if (this.cur_file_total_count > this.cur_file_count){
				is_continue = true;
			}
		}
		if (is_continue){
			this.start_skp = (parseInt(this.per_page) * (parseInt(page_no))) - (parseInt(this.per_page) - 1);
			var surl = gap.channelserver + "/folder_list.km";
			var postData = {
					"ty" : (this.disp_view_mode == "list" ? "1" : (page_no == 1 ? "1" : "2")), //(page_no == 1 ? "1" : "2"),
					"drive_key" : this.select_drive_code,
					"parent_folder_key" : this.select_folder_code,
					"start" : (this.start_skp - 1).toString(),
					"perpage" : this.per_page,
					"dtype" : this.click_filter_image,
					"q_str" : this.query_str
				};

			$.ajax({
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
					if (res.result == "OK"){
						_self.cur_file_count += res.data.datalist.length;
						_self.cur_file_total_count = res.data.totalcount;
						_self.draw_drive_data_list(page_no, res.data);
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});		
		}
	},
	
	"show_folder_member" : function(selector, data){
		var _html = '';
		_html += '<div class="layer-member" style="width:500px">';
		_html += '<h2>' + gap.lang.shared_member + '</h2>';
		_html += '<ul class="list-member" id="share_member_dis">';
		for (var k = 0; k < data.length; k++){
			var _member = data[k];
			var mem_info = gap.user_check(_member);
			var person_img = gap.person_profile_photo(_member);
			_html += '	<li>';
			_html += '		<dl>';
			_html += '			<dt>' + mem_info.name + '</dt>';
			_html += '			<dd>' + mem_info.dept + '</dd>';
			_html += '		</dl>';
			_html += '		<span>' + person_img + '</span>';
			_html += '	</li>';					
		}
		_html += '</ul>';
		_html += '</div>';

		selector.qtip({
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			content : {
				text : _html
			},
			show : {
				event: 'click',
				ready: true
			},
			hide : {
				event : 'click unfocus',
				fixed : true
			},
			style : {
				classes : 'qtip-bootstrap',
				tip : true
			},
			position: {
				my : 'top right',
				viewport: $('#window')
		    },
			events : {
				show : function(event, api){		
					$("#share_member_dis").mCustomScrollbar({
						theme:"dark",
						autoExpandScrollbar: true,
						scrollButtons:{
							enable:false
						},
						mouseWheelPixels : 200, // 마우스휠 속도
						scrollInertia : 400, // 부드러운 스크롤 효과 적용
						advanced:{
							updateOnContentResize: true
						},
						autoHideScrollbar : true
					});						
				},
				hidden : function(event, api){
					api.destroy(true);
				}
			}
		});			
	},
	
	"draw_drive_title_path" : function(){
		var _self = this;
		var html = '';
		
		if (this.select_folder_code == "root"){
			html += '<span>' + this.select_drive_name + '</span>';
		}else{
			html += '<a style="cursor:pointer" id="title_' + this.select_drive_code + '">' + this.select_drive_name + '</a>';
		}
	//	$("#drive_title_path").html(html + gBody3.expand_collapse_btn());
		$("#drive_title_path").html(html);
		$("#title_" + this.select_drive_code).on("click", function(){
			_self.select_folder_code = "root";
			_self.select_folder_name = "";
			_self.title_path_name = [];
			_self.title_path_code = [];
			_self.start_page = "1";
			_self.cur_page = "1";
			_self.draw_drive_data(1);
		});
		
		for (var i = 0; i < this.title_path_name.length; i++){
			var _html = '';
			if (i == (this.title_path_name.length - 1)){
				_html += '<span>' + this.title_path_name[i] + '</span>';
			}else{
				_html += '<a style="cursor:pointer" id="title_' + this.title_path_code[i] + '">' + this.title_path_name[i] + '</a>';
			}
			$("#drive_title_path").append(_html);
			$("#title_" + gFiles.title_path_code[i]).on("click", function(){
				var select_id = $(this).attr("id");
				_self.select_folder_code = select_id.split("title_")[1];
				_self.select_folder_name = $(this).text();
				_self.title_path_name = [];
				_self.title_path_code = [];
				_self.start_page = "1";
				_self.cur_page = "1";
				$("#drive_title_path a").each(function(idx) {
					if (idx != 0){
						_self.title_path_name.push($(this).text());
						_self.title_path_code.push($(this).attr("id").split("title_")[1]);
						if (select_id == $(this).attr("id")){
							return false;
						}
					}
				});
				_self.draw_drive_data(1);				
			});
		}
	},
	
	"folder_layer_html" : function(is_update, is_share){
		// 레이어 높이 설정

		if (is_share == "Y"){
			$("#create_channel_layer").css("height", "730px");
		}
				
		var html = "";

		html += '<h2>' + (is_update ? gap.lang.update_folder_info : gap.lang.create_folder) + '</h2>';
		html += '<button class="ico btn-close" id="close_folder_layer">닫기</button>';

		html += '<div class="input-field">';
		html += '	<input type="text" autocomplete="off" class="formInput" id="input_folder">';
		html += '	<label for="input_folder" class="">' + gap.lang.folder_name + '</label>';
		html += '	<span class="bar"></span>';
		html += '</div>';

		if (is_share == "Y"){
			html += '<h4 style="float:left;">' + gap.lang.members_can_invited + '</h4>';
			html += '<h4 style="float:right;cursor:pointer;" id="add_all_members">+' + gap.lang.add_all + '</h4>';
			html += '<div class="channel-invite-user" id="folder_add_member_list" style="min-height:132px;max-height:264px;">';
			html += '</div>';
			html += '<div style="height:10px;border-bottom:1px solid #ccc"></div>';
			html += '<h4 style="margin-top:20px;">' + gap.lang.folder_members + '</h4>';
		}
		html += '<div class="channel-invite-user" id="folder_member_list">';
		html += '</div>';
		html += '<ul class="same-name" style="top:160px; display:none;" id="same_name_list">';
		html += '</ul>';		

		html += '<div class="layer-bottom">';
		html += '	<button class="btn-point" id="create_folder_btn"><strong>' + (is_update ? gap.lang.basic_save : gap.lang.basic_make) + '</strong></button>';
		html += '</div>';
		
		return html;
	},
	
	"drive_create_folder" : function(obj){
		var _self = this;
		var is_update = (obj != undefined ? true : false);
		var _drive_info = $.map(this.cur_drive_list_info, function(ret, key) {
			if (ret.ch_code == _self.select_drive_code){
				return ret;
			}
		});
		var is_folder_share = (obj != undefined ? obj.folder_share : _drive_info[0].ch_share);
		var html = this.folder_layer_html(is_update, is_folder_share);
		
		$("#create_channel_layer").html(html);

		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#create_channel_layer')
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();
		
		
		var folder_member = (is_update && is_folder_share == "Y" ? obj.member : "");
		
		if (is_update){
			//폴더 정보 update인 경우
			$("#input_folder").val(gap.textToHtml(obj.folder_name));
			$("#input_folder").parent().find("label").addClass("on");
			
					
			/////////////////////////////////////////////////////////////
			if (obj.folder_share == "Y"){
				var _parent_member = "";
				var _owner = "";
				
				if (obj.parent_folder_key == "root"){
					// 드라이브 멤버
					_parent_member = $.map(this.cur_drive_list_info, function(ret, key) {
						if (ret.ch_code == obj.drive_key){
							var ret_member = [];
							ret_member = ret.member;
							_owner = ret.owner;
							return ret_member;
						}
					});
					
					if (_owner.ky != gap.userinfo.rinfo.ky){
						_parent_member.push(_owner);
					}
					
				}else{
					_parent_member = $.map(this.cur_drive_folder_list_info, function(ret, key) {
						if (ret._id.$oid == obj.parent_folder_key){
							var ret_member = [];
							ret_member = ret.member;
							_owner = ret.owner;
							return ret_member;
						}
					});
					
					if (_owner.ky != gap.userinfo.rinfo.ky){
						_parent_member.push(_owner);
					}
				}
				
				for (var i = 0; i < obj.member.length; i++){
					// parent 멤버 중 초대 가능 멤버 구하기
					for (var k = 0; k < _parent_member.length; k++){
						var pminfo = _parent_member[k];
						if (pminfo.ky == obj.member[i].ky){
							_parent_member.splice(k, 1);
						}
						if (pminfo.ky == obj.owner.ky){
							_parent_member.splice(k, 1);
						}
					}

					// 폴더 멤버 표시
					this.channel_add_user("F", obj.member[i]);
				}
				
				for (var j = 0; j < _parent_member.length; j++){
					// parent 멤버 중 초대 가능 멤버 표시
					this.channel_add_user("I", _parent_member[j]);
				}
			}
			/////////////////////////////////////////////////////////////

		}else{
			/////////////////////////////////////////////////////////////
			if (this.select_folder_code == "root"){
				if (_drive_info[0].owner.ky != gap.userinfo.rinfo.ky){
					this.channel_add_user("I", _drive_info[0].owner);
				}
				if (_drive_info[0].member){
					var _member = _drive_info[0].member;
					for (var i = 0; i < _member.length; i++){
						if (_member[i].ky != gap.userinfo.rinfo.ky){
							this.channel_add_user("I", _member[i]);
						}
					}
				}
				
			}else{
				if (this.cur_folder_info.owner.ky != gap.userinfo.rinfo.ky){
					this.channel_add_user("I", this.cur_folder_info.owner);
				}
				if (this.cur_folder_info.member){
					var _member = this.cur_folder_info.member;
					for (var i = 0; i < _member.length; i++){
						if (_member[i].ky != gap.userinfo.rinfo.ky){
							this.channel_add_user("I", _member[i]);
						}
					}
				}
			}

			/////////////////////////////////////////////////////////////
		}
		
		var drive_key = (is_update ? obj.drive_key : this.select_drive_code);
		var parent_folder_key = (is_update ? obj.parent_folder_key : this.select_folder_code);
		var folder_depth = (is_update ? obj.depth : (this.title_path_code.length + 1).toString());
				
		$("#input_folder").on("change", function(){
			if($(this).val() == ""){
				$(this).parent().find("label").removeClass("on");
			} else {
				$(this).parent().find("label").addClass("on");
			}
		});
		
		$("#add_all_members").off().on("click", function(){
			if ($("#folder_add_member_list").children().length == 0){
			}
			$("#folder_add_member_list").children().each(function(idx, val){
				_self.add_folder_member(val);
			});
		});

		$("#input_folder_user").keydown(function(evt){
			if (evt.keyCode == 13){
				$("#same_name_list").empty();
				$("#same_name_list").hide();
				if ($("#input_folder_user").val().trim() == ""){
					gap.gAlert(gap.lang.input_invite_user);
					return;
				}
				_self.channel_user_search("F", $("#input_folder_user").val() );
			}else{
				$("#same_name_list").empty();
				$("#same_name_list").hide();
			}
			
		}).on("change", function(){
			if($(this).val() == ""){
				$(this).parent().find("label").removeClass("on");
			} else {
				$(this).parent().find("label").addClass("on");
			}
		});		
		
		$("#org_pop_btn").on("click", function(){
			window.ORG.show(
					{
						'title': gap.lang.invite_user,
						'single':false
					}, 
					{
						getItems:function() { return []; },
						setItems:function(items) { /* 반환되는 Items */
							
							_self.aleady_select_user_count = 0;
							for (var i = 0; i < items.length; i++){
								var _res = gap.convert_org_data(items[i]);
								_self.channel_add_user('F', _res);
							}
							_self.alert_aleady_select_user();
						}
					});
		});		
		
		$("#create_folder_btn").on("click", function(){
			if ($("#input_folder").val().trim() == ""){
				gap.gAlert(gap.lang.input_folder_name);
				return;
			}

			var readers = [];
			var user_list = [];
			var user_ky_list = [];
			var memeber_list = [];
			var new_member_ky = "";
			var delete_members = "";
			var folder_name = $("#input_folder").val();

			if (is_folder_share == "N"){
				readers.push(gap.userinfo.rinfo.ky);
				var postData = {
					"drive_key" : drive_key,
					"parent_folder_key" : parent_folder_key,
					"depth" : folder_depth,
					"folder_name" : folder_name,
					"folder_share" : "N",
					"owner" : gap.userinfo.rinfo,
					"readers" : readers	//gap.userinfo.rinfo.em
				};
				
			}else{
				var parent_member_count = $("#folder_add_member_list").children().length;
				var member_count = $("#folder_member_list").children().length;
				
				if (parent_member_count > 0 && member_count == 0){
					// 추가 가능한 멤버는 있는데 선택된 멤버가 하나도 없는 경우
					gap.gAlert(gap.lang.select_folder_member);
					return;
				}
				
				readers.push(gap.userinfo.rinfo.ky);
				
				for(var i = 0; i < member_count; i++){
					var user_info = $("#folder_member_list").children().eq(i).data("user");	//JSON.parse( $("#folder_member_list").children().eq(i).attr("data-user") );
					readers.push(user_info.ky);
					user_list.push(user_info);
					user_ky_list.push(user_info.ky);
				}

				var postData = {
					"drive_key" : drive_key,
					"parent_folder_key" : parent_folder_key,
					"depth" : folder_depth,
					"folder_name" : folder_name,
					"folder_share" : "Y",
					"owner" : gap.userinfo.rinfo,
					"readers" : readers,	//readers.join(" "),
					"member" : user_list
				};
			}
			
			if (is_update){
				var delete_members_em = [];
				var folder_member = obj.member
				var folder_member_em = $.map(folder_member, function(ret, key) {
					return ret.em;
				});
				delete_members = $(folder_member_em).not(readers);
								
				if (delete_members.length > 0){
					for (var i = 0; i < delete_members.length; i++){
						delete_members_em.push(delete_members[i]);
					}
				}
				
				postData.delete_members = delete_members_em;	// 하취 폴더에서 해당 사용자 삭제
				postData.id = obj._id.$oid;
			}

			
			var surl = gap.channelserver + "/" + (is_update ? "update_folder.km" : "make_folder.km");
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){
						var user_info = gap.user_check(gap.userinfo.rinfo);
						var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(res.GMT));
						var disp_time = gap.change_date_localTime_only_time(String(res.GMT));
						var folder_id = (is_update ? obj._id.$oid : res.folder_id);
						var html = '';
						if (is_update){
							$("#" + folder_id).empty();
							if (_self.disp_view_mode == "list"){
								html += '	<div class="checkbox">';
								html += '		<label>';
								html += '			<input type="checkbox" name="folder_checkbox" value="' + folder_id + '" owner="' + gap.userinfo.rinfo.ky + '"><span class="checkbox-material"><span class="check"></span></span>';
								html += '		</label>';
								html += '	</div>';
								html += '	<a style="cursor:pointer" id="folder_' + folder_id + '">';
							//	html += '		<span class="ico ico-folder' + (member_count != 0 ? "-share" : "") + '"></span>';
								html += '		<span class="ico ico-folder"></span>';
								html += '		<dl>';
								html += '			<dt><strong>' + folder_name + '</strong></dt>';
								html += '			<dd><span>' + user_info.name + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
								html += '		</dl>';
								html += '	</a>';
								html += '	<button class="ico btn-more folder-menu"></button>';
								
							}else{
								html += '	<div class="checkbox">';
								html += '		<label>';
								html += '			<input type="checkbox" name="folder_checkbox" value="' + folder_id + '" owner="' + gap.userinfo.rinfo.ky + '"><span class="checkbox-material"><span class="check"></span></span>';
								html += '		</label>';
								html += '	</div>';
							//	html += '	<div class="thm" id="folder_' + folder_id + '"><span class="ico ico ico-folder' + (member_count != 0 ? "-share" : "") + '-b"></span></div>';
								html += '	<div class="thm" id="folder_' + folder_id + '"><span class="ico ico ico-folder-b"></span></div>';
								html += '	<dl class="">';
								html += '		<dt><strong title="' + folder_name + '">' + folder_name + '</strong></dt>';
								html += '		<dd><span>' + user_info.name + gap.lang.hoching + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
								html += '	</dl>';
								html += '	<button class="ico btn-more folder-menu"></button>';
							}
							$("#" + folder_id).html(html);
							

						}else{
							if ($(".msg-empty").length > 0){
								$("#wrap_drive_data_list").empty();
								var _html = '';
								if (_self.disp_view_mode == "list"){
									_html += '		<div class="list" id="drive_data_list">';
									_html += '			<ul id="drive_folder_list_area">';
									_html += '			</ul>';
									_html += '			<ul id="drive_file_list_area">';		
									_html += '			</ul>';
									_html += '		</div>';
									_html += '		<div class="paging">';
									_html += '			<ul id="paging_area">';
									_html += '			</ul>';
									_html += '		</div>';									
									
								}else{
									_html += '		<div id="drive_data_gallery">';
									_html += '			<ul class="gallery" id="drive_data_gallery_area">';
									_html += '			</ul>';
									_html += '		</div>';	
								}
								$("#wrap_drive_data_list").html(_html);
							}
							
							if (_self.disp_view_mode == "list"){
								html += '	<li id="' + folder_id + '" style="list-style:none;">';
								html += '		<div class="checkbox">';
								html += '			<label>';
								html += '				<input type="checkbox" name="folder_checkbox" value="' + folder_id + '" owner="' + gap.userinfo.rinfo.ky + '"><span class="checkbox-material"><span class="check"></span></span>';
								html += '			</label>';
								html += '		</div>';
								html += '		<a style="cursor:pointer" id="folder_' + folder_id + '">';
							//	html += '			<span class="ico ico-folder' + (member_count != 0 ? "-share" : "") + '"></span>';
								html += '			<span class="ico ico-folder"></span>';
								html += '			<dl>';
								html += '				<dt><strong>' + folder_name + '</strong></dt>';
								html += '				<dd><span>' + user_info.name + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
								html += '			</dl>';
								html += '		</a>';
								html += '		<button class="ico btn-more folder-menu"></button>';
								html += '	</li>';
								$("#drive_folder_list_area").append(html);	
								
							}else{
								html += '<li class="gallery-info" id="' + folder_id + '">';
								html += '	<div class="checkbox">';
								html += '		<label>';
								html += '			<input type="checkbox" name="folder_checkbox" value="' + folder_id + '" owner="' + gap.userinfo.rinfo.ky + '"><span class="checkbox-material"><span class="check"></span></span>';
								html += '		</label>';
								html += '	</div>';
							//	html += '	<div class="thm" id="folder_' + folder_id + '"><span class="ico ico ico-folder' + (member_count != 0 ? "-share" : "") + '-b"></span></div>';
								html += '	<div class="thm" id="folder_' + folder_id + '"><span class="ico ico ico-folder-b"></span></div>';
								html += '	<dl class="">';
								html += '		<dt><strong title="' + folder_name + '">' + folder_name + '</strong></dt>';
								html += '		<dd><span>' + user_info.name + gap.lang.hoching + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
								html += '	</dl>';
								html += '	<button class="ico btn-more folder-menu"></button>';
								html += '</li>';
								
								$("#drive_data_gallery_area").append(html);
							}
						
						}
						
						//폴더 클릭 시
						$("#folder_" + folder_id).on("click", function(){
							var select_id = $(this).attr("id")
							var folder_id = select_id.split("folder_")[1];
													
							var _info = new Object();	
							_info.member = user_list;
							_info.owner = gap.userinfo.rinfo;
							_info.drive_key = drive_key;
							_info.folder_name = folder_name;
							_self.parent_folder_info = _self.cur_folder_info;
							_self.cur_folder_info = _info;
							
							_self.select_folder_code = folder_id;
							_self.select_folder_name = $("#" + (_self.disp_view_mode == "list" ? select_id : folder_id) + " dl dt strong").text();
							_self.title_path_code.push(_self.select_folder_code);
							_self.title_path_name.push(_self.select_folder_name);
							_self.draw_folder_members();
							_self.draw_drive_data(1);
						});
						
						//폴더 더보기 메뉴 틀릭 시
						$(".ico.btn-more.folder-menu").off();
						$(".ico.btn-more.folder-menu").on("click", function(){
							$.contextMenu({
								selector : ".ico.btn-more.folder-menu",
								autoHide : false,
								trigger : "left",
								callback : function(key, options){
									_self.context_menu_call_folder_mng(key, options, $(this).parent().attr("id"));
								},
								events : {
									hide: function (options) {
										$(this).removeClass("on");
				                	}
								},			
								build : function($trigger, options){
									options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
									return {
										items: _self.folder_menu_content()
									}
								}
							});
						});							
						
						//공유멤버 보기
						$("#member_" + folder_id).bind("click", user_list, function(event){
							_self.show_folder_member($(this), event.data);
						});
						
						gap.close_layer('create_channel_layer');
						$("#create_channel_layer").css("height", "");
						_self.update_drive_info();
						
						// 왼쪽 트리에 추가
						if (is_update){
							$("#em_folder_" + folder_id).html(folder_name);
							
						}else{
							var margin_left = folder_depth * 10;
							var _tree_html = '';

							_tree_html += '<ul id="ul_fl_' + folder_id + '" style="display:none;">';
							_tree_html += '	<li style="padding-left:10px">';
							_tree_html += '		<div id="main_' + folder_id + '" class="folder-code" data="' + drive_key + '" style="margin-left:' + margin_left + 'px;">';
							_tree_html += '			<span id="btn_fold_' + folder_id + '"></span>';
							_tree_html += '			<span class="ico ico-lnb-folder"></span><em id="em_folder_' + folder_id + '" style="padding-left:20px">' + folder_name + '</em>';
							_tree_html += '			<button class="ico btn-more folder-menu">더보기</button>';
							_tree_html += '		</div>';
							_tree_html += '	</li>';
							_tree_html += '</ul>';
							
							if (folder_depth == "1"){
								$("#main_" + drive_key).parent().append(_tree_html);
								
								var btn_fold_class = $("#btn_fold_" + drive_key + " button").attr("class");
								if (btn_fold_class == undefined){
									$("#btn_fold_" + drive_key).html('<button class="btn-fold on"></button>');
									$("#ul_fl_" + folder_id).show();
									
								}else if (btn_fold_class == "btn-fold on"){
									$("#ul_fl_" + folder_id).show();
								}
								
							}else{
								$("#main_" + parent_folder_key).parent().append(_tree_html);
								
								var btn_fold_class = $("#btn_fold_" + parent_folder_key + " button").attr("class");
								if (btn_fold_class == undefined){
									$("#btn_fold_" + parent_folder_key).html('<button class="btn-fold on"></button>');
									$("#ul_fl_" + folder_id).show();
									
								}else if (btn_fold_class == "btn-fold on"){
									$("#ul_fl_" + folder_id).show();
								}
							}
							
							gFiles.__tree_folder_event(drive_key, folder_id);						
						}
						
						// 드라이브 title path 변경
						if (!_self.check_selected_top_menu()){
							if (_self.select_folder_code == folder_id){
								$("#drive_title_path span").html(folder_name);
								
							}else{
								$("#title_" + folder_id).html(folder_name);
							}
						}
						
						// 오른쪽 멤버 업데이트
						if (_self.select_folder_code == folder_id){
							_self.update_folder_info(folder_id);
							
						}else{
							_self.update_folder_info();
						}
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;					
				}
			});			
		});
		
		$("#close_folder_layer").on("click", function(){
			gap.close_layer('create_channel_layer');
			$("#create_channel_layer").css("height", "");
		});
	},
	
	"update_folder_info" : function(folder_code){
		// 드라이브/폴더 리스트 정보 가져오기
		var _self = this;
		var is_member_update = (folder_code != undefined ? true : false);
		var surl = gap.channelserver + "/api/files/drive_list_all.km";
		var postData = JSON.stringify({});
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				_self.cur_drive_list_info = res.drive;
				_self.cur_drive_folder_list_info = res.folder;
				
				if (is_member_update){
					// 변경된 멤버 바로 표시
					if (_self.select_folder_code != ""){
						// 폴더가 선택된 경우만 멤버 표시
						for (var j = 0; j < gBody.cur_drive_folder_list_info.length; j++){
							_self.cur_folder_info = "";
							var _data = _self.cur_drive_folder_list_info[j];
							if (folder_code == _data._id.$oid){
								_self.cur_folder_info = _data;
								break;
							}
						}					
						
						_self.draw_folder_members();
					}
				}
			},
			error : function(e){
			}
		});		
	},
	
	"folder_menu_content" : function(){
		var items = {
				"modify" : {name : gap.lang.modify_folder},
				"delete" : {name : gap.lang.delete_folder}
		}

		return items;
	},
	
	"context_menu_call_folder_mng" : function(key, options, _id){
		var _self = this;
		
		if (_id != undefined){
			_id = _id.replace("main_", "");
		}
		if (key == "modify"){
			this.drive_modify_folder(_id);
			
		}else if (key == "delete"){
			this.drive_delete_folder(_id);
		}
	},
	
	"drive_delete_folder" : function(folder_id){
		var _self = this;
		var msg = gap.lang.confirm_delete;
		gap.showConfirm({
			title: "Confrim",
			contents: msg,
			callback: function(){
			var surl = gap.channelserver + "/delete_folder_new.km";
			/*	var postData = JSON.stringify({
						"id" : folder_id,
						"email" : gap.userinfo.rinfo.em,
						"depts" : gap.full_dept_codes()
					});*/
				
				var postData = JSON.stringify({
					"id" : folder_id
				});

				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : postData,
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success : function(res){
						if (res.result == "OK"){
							// 트리 폴더에 있는 expand/collape 아이콘 처리
							var same_level_folder_len = $("#ul_fl_" + folder_id).siblings().length;
							if (same_level_folder_len == 1){
								var parent_folder_id = $("#ul_fl_" + folder_id).siblings("div").attr("id").replace("main_", "");
								$("#btn_fold_" + parent_folder_id).empty();
							}
							
							$("#" + folder_id).remove();			// 목록에 있는 폴더 삭제
							$("#ul_fl_" + folder_id).remove();		// 트리에 있는 폴더 삭제
							
							if (folder_id == gFiles.select_folder_code){
								// 현재 화면에 표시된 폴더가 삭제되는 경우 전체파일 클릭
								$("#allcontent_drive").click();
								
								_self.removeClass_channel();
								$("#allcontent_drive").addClass("on");
							}
							_self.update_drive_info();
							
						}else{
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				});	
			}
		});
	},
	
	"drive_modify_folder" : function(folder_id){
		var _self = this;
		var surl = gap.channelserver + "/load_folder.km";
		var postData = {
				"id" : folder_id
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					_self.drive_create_folder(res.data);
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;					
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},		
	
	"file_menu_content" : function(is_preview, fowner){
		var items = {};
		if (is_preview){
			items["do_share"] = {name : gap.lang.do_share}
			items["sep00"] = "-------------";
		}
		items["download"] = {name : gap.lang.download}
		items["favorite"] = {name : gap.lang.favorite}
	//	items["copyurl"] = {name : gap.lang.copyurl};

		if (fowner == gap.search_cur_ky()){
			items["sep01"] = "-------------";
			items["move"] = {name : gap.lang.move}
			items["delete"] = {name : gap.lang.basic_delete}
		}
		return items;
	},
	
	"favorite_file_menu_content" : function(is_preview){
		var items = {};

		if (is_preview){
			items["favorite_do_share"] = {name : gap.lang.do_share}
			items["sep00"] = "-------------";
		}
		items["download"] = {name : gap.lang.download}
	//	items["copyurl"] = {name : gap.lang.copyurl};
		items["sep01"] = "-------------";
		items["favorite_delete"] = {name : gap.lang.basic_delete}			
		return items;
	},
	
	"files_file_menu_content" : function(is_preview, fowner){
		
		var items = {};
		
		if (is_preview){
			items["files_preview"] = {name : gap.lang.preview}
		}
		items["download"] = {name : gap.lang.download}
		items["files_favorite"] = {name : gap.lang.favorite}
	//	items["copyurl"] = {name : gap.lang.copyurl};
		items["sep00"] = "-------------";
		items["regdrive"] = {name : gap.lang.reg_on_drive};
		if (fowner == gap.search_cur_ky()){
			items["sep01"] = "-------------";
			items["files_delete"] = {name : gap.lang.basic_delete}				
		}
		
		return items;
	},
	
	"context_menu_call_file_mng" : function(key, options, _id, _fserver, _fname, _md5, _furl, is_search, owner, upload_path, ftype){
		var _self = this;
		var call_from_search = (is_search == undefined ? false : is_search);
		
		if (key == "favorite"){
			this.add_favorite_file(_id, _md5, "1");
			
		}else if (key == "files_favorite"){
			this.add_favorite_file(_id, _md5, "2");
			
		}else if (key == "download"){
			gap.file_download_normal(_furl, _fname);
			
		}else if (key == "move"){
			this.drive_move_file(_id);
			
		}else if (key == "delete"){
			this.drive_delete_select_item(_id);
			
		}else if (key == "favorite_delete"){
			this.delete_favorite_file(_id);
			
		}else if (key == "files_delete"){
			if (_id.split("_").length > 1){
				//댓글의 파일을 삭제하는 경우     )" : function(channel_id, rid, md5, ftype, obj){
				this.del_reply_att(_id.split("_")[0], _id, _md5, ftype, "reply");
			}else{
				this.delete_files_file(_id, _fname, _md5, options);
			}
			
		}else if (key == "preview"){
			var show_video = gap.file_show_video(_fname);
			var icon_kind = gap.file_icon_check(_fname);
			
			if (show_video){
				gap.show_video(_furl, _fname)
				
			}else if (icon_kind == "img"){
				gap.image_gallery = new Array();  //변수 초기화 해준다.
				gap.image_gallery_current = 1;
				gap.show_image(_furl, _fname);
				
			}else{
				this.file_convert(_fserver, _fname, _md5, _id, "1", call_from_search);				
			}
			
		}else if (key == "favorite_preview"){
			var show_video = gap.file_show_video(_fname);
			var icon_kind = gap.file_icon_check(_fname);
			
			if (show_video){
				gap.show_video(_furl, _fname)
				
			}else if (icon_kind == "img"){
				gap.image_gallery = new Array();  //변수 초기화 해준다.
				gap.image_gallery_current = 1;
				
				gap.show_image(_furl, _fname);
				
			}else{
				this.file_convert(_fserver, _fname, _md5, _id, "3", call_from_search);			
			}
			
		}else if (key == "files_preview"){
			var show_video = gap.file_show_video(_fname);
			var icon_kind = gap.file_icon_check(_fname);
			
			if (show_video){
				gap.show_video(_furl, _fname)
				
			}else if (icon_kind == "img"){
				gap.image_gallery = new Array();  //변수 초기화 해준다.
				gap.image_gallery_current = 1;
				
				gap.show_image(_furl, _fname);
				
			}else{
				ty = "2"
				if (_id.split("_").length > 1){
					ty = "reply";
					var ppl = _id.split("_");
					upload_path = upload_path + "/reply/" + ppl[1] + "_" + ppl[2];
					this.file_convert(_fserver, _fname, _md5, _id, ty, ftype, owner, upload_path);	
				}else{
					this.file_convert(_fserver, _fname, _md5, _id, ty, call_from_search);	
				}
				
			}
			
		}else if (key == "do_share"){
			if (gap.checkFileExtension(_fname)){
				var url = gap.channelserver + "office/" + _id + "/files";
				gptpt.draw_layer_share_chat_history(url);
				return false;
			}else{
				gptpt.draw_layer_share_chat_history(_furl);
				return false;			
			}
			
		}else if (key == "favorite_do_share"){
			if (gap.checkFileExtension(_fname)){
				var url = gap.channelserver + "office/" + _id + "/filesfavorite";
				gptpt.draw_layer_share_chat_history(url);
				return false;
			}else{
				gptpt.draw_layer_share_chat_history(_furl);
				return false;			
			}			
			
		}else if (key == "copyurl"){
			this.copy_file_url(_furl);
			
		}else if (key == "regdrive"){
			this.files_reg_drive_select_item(_id + "-spl-" + _md5);
			
		}
	},
	
	"add_favorite_file" : function(_id, _md5, _ty){
		var surl = gap.channelserver + "/copy_favorite.km";
		var postData = {
				"id" : _id,
			    "md5" : _md5, 
			    "type" : _ty, 
			    "fserver" : gap.channelserver 
			};
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					gap.gAlert(gap.lang.added_favorite_menu);
					
				}else if (res.result == "EXIST"){
					gap.gAlert(gap.lang.exist_file); 
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;					
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},
	
	"drive_download_file" : function(){
		var folder_check = [], file_check = [];
		
		$("input[name=folder_checkbox]:checked").each(function() {
			folder_check.push($(this).val());
		});
		$("input[name=file_checkbox]:checked").each(function() {
			_me = $(this).val();
			if (_me.indexOf('-spl-')>-1) {
				var _me_split = _me.split('-spl-');
				file_check.push(_me_split[2]);
			} else {
				file_check.push(_me);	
			}
			
		});
		
		if (folder_check.length > 0){
			//폴더는 다운로드할 수 없습니다.
			gap.gAlert(gap.lang.folder_cannot_download, function(){
				$("input[name=folder_checkbox]:checked").each(function() {
					$(this).prop("checked", false);
				});				
			});
			return false;
		}
		
		if (file_check.length == 0){
			gap.gAlert(gap.lang.select_file);
			return false;
		}

		var _fileList = [];
		$.each(file_check, function(index, v){
			var _fileObj = $('#file_' + v);
			var file_info = {
					order: index,
					fileDownUrl: _fileObj.attr("furl"),
					filename: _fileObj.attr("fname").replace(/^\s*|\s*$/g, ''),
					size: _fileObj.attr("fsize")
			};
			_fileList.push(file_info);              
		});
        if (_fileList.length == 0) {
        	//파일이 없습니다.
        	gap.gAlert(gap.lang.failmsg);
        	return false;
        }
        // saveZip.zipStart(다운로드할 파일목록, 다운로드 완료 후 호출될 함수명);
        saveZip.zipStart(_fileList, gFiles.drive_deselect_item);
        
     //   gap.file_download_option(_fileList);
      
	},		
	
	
	"drive_move_file" : function(_id){
		var _self = this;
		var is_single = (_id != undefined ? true : false);
		if (is_single){
			var file_check = [];
			file_check.push(_id);
			
		}else{
			var folder_check = [];
			var file_check = [];
			
			$("input[name=folder_checkbox]:checked").each(function() {
				folder_check.push($(this).val());
			});
			$("input[name=file_checkbox]:checked").each(function() {
				var file_owner = $("#file_" + $(this).val()).attr("owner");
				
				//내가 올린 파일만 이동
				if (file_owner == gap.userinfo.rinfo.ky){
					file_check.push($(this).val());
					
				}else{
					$(this).prop("checked", false);
				}
			});
			
			if (folder_check.length > 0){
				//폴더는 이동할 수 없습니다.
				gap.gAlert(gap.lang.folder_cannot_move, function(){
					$("input[name=folder_checkbox]:checked").each(function() {
						$(this).prop("checked", false);
					});				
				});
				return false;
			}
			
			if (file_check.length == 0){
				gap.gAlert(gap.lang.select_folder_file);
				return false;
			}			
		}
		
		var html = "";
		html += '<h2>' + gap.lang.move_location + '</h2>';
		html += '<button class="ico btn-close" id="close_move_file_layer">닫기</button>';
		html += '<div class="folder-tree">';
		html += '	<ul id="drive_tree">';
		html += '	</ul>';
		html += '</div>';
	//	html += '<button class="btn-folder-create"><span>새폴더 만들기</span></button>';
		html += '<div class="layer-bottom">';
		html += '	<button id="run_move_file" class="btn-point"><strong>' + gap.lang.move + '</strong></button>';
		html += '	<button id="cancel_move_file"><span>' + gap.lang.Cancel + '</span></button>';
		html += '</div>';		
		
		$("#move_file_layer").html(html);
		
		// 개인채널 (드라이브)리스트 정보 가져오기
		var surl = gap.channelserver + "/drive_list.km";
		var postData = {};

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				for (var i = 0; i < res.length; i++){
					var data = res[i];
					var _html = '';
					_html += '		<li>';
					_html += '			<div id="move_' + data.ch_code + '" data="root"><span class="ico-fold"></span><span class="ico ico-drive' + (data.ch_share == "Y" ? "-share-s" : "-s") + '"></span>' + data.ch_name + '</div>';
					_html += '		</li>';
					
					$("#drive_tree").append(_html);
					$("#move_" + data.ch_code).on("click", function(e){
						if (e.target.className == "ico-fold"){
							var drive_code = $(this).attr("id").replace("move_", "");
							var folder_code = $(this).attr("data");
							$("#" + $(this).attr("id") + " .ico-fold").addClass("on");
							_self.draw_sub_folder(drive_code, folder_code, 24, true);
							
						}else if (e.target.className == "ico-fold on"){
							$("#" + $(this).attr("id") + " .ico-fold").removeClass("on");
							$("#" + $(this).attr("id")).parent().find("ul").remove();

						}else{
							$("#drive_tree div").removeClass("on");
							$("#" + $(this).attr("id")).addClass("on");
						}
					});
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		

		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#move_file_layer')
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();

		
		$("#close_move_file_layer").on("click", function(){
			gap.close_layer('move_file_layer');
		});
		$("#cancel_move_file").on("click", function(){
			gap.close_layer('move_file_layer');
		});
		$("#run_move_file").on("click", function(){
			var drive_code = "";
			var folder_code = "";
			var full_path_code = "";
			$("#drive_tree div").each(function(idx){
				if ($(this).hasClass("on")){
					if ($(this).attr("data") == "root"){
						//최상위 드라이브를 선택한 경우
						drive_code = $(this).attr("id").replace("move_", "");
						folder_code = $(this).attr("data");
						
					}else{
						drive_code = $(this).attr("data");
						folder_code = $(this).attr("id").replace("move_", "");
					}
					full_path_code = _self.get_move_fullpath($(this), $(this).attr("id").replace("move_", ""));
				}
			});
			
			if (full_path_code == ""){
				gap.gAlert(gap.lang.select_location_to_move);
				return false;
			}
			
			var surl = gap.channelserver + "/move_folder.km";
			var postData = {
					"drive_code" : drive_code,
					"folder_code" : folder_code,
					"target_path" : full_path_code,
					"file_item" : file_check.join("-spl-"),
					"fserver" : gap.channelserver
				};			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){
						if (_self.disp_view_mode == "list"){
							var key1 = (_self.total_file_count - file_check.join().split(",").length);
							var key2 = (_self.cur_page * _self.per_page - _self.per_page);
							if (key1 > key2){
								if (_self.select_left_menu == ""){	// 개별 드라이브를 클릭한 경우
									_self.draw_drive_data(_self.cur_page);
									
								}else{	// 전체/내가올린/공유된/즐겨찾기 클 클릭한 경우
									_self.draw_main_data(_self.cur_page);
								}
								
							}else{
								var page = _self.cur_page - 1;
								if (page <= 0){
									page = 1;
								}
								if (_self.select_left_menu == ""){	// 개별 드라이브를 클릭한 경우
									_self.draw_drive_data(page);
									
								}else{	// 전체/내가올린/공유된/즐겨찾기 클 클릭한 경우
									_self.draw_main_data(page);
								}
							}
							
						}else{
							for (var k = 0; k < file_check.length; k++){
								$("#" + file_check[k]).remove();
							}
						}
						
						gap.close_layer('move_file_layer');
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
		});
	},	
	
	"draw_sub_folder" : function(drive_code, folder_code, padding_left, first_call){
		var _self = this;
		var surl = gap.channelserver + "/folder_list.km";
		var postData = {
				"ty" : "3", //폴더만
				"drive_key" : drive_code,
				"parent_folder_key" : folder_code,
				"start" : "0",
				"perpage" : "1000",
				"dtype" : "",
				"q_str" : ""
			};

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					if (res.data.folderlist.length == 0){
						// 하위 폴더가 없는 경우 접기/펼치기 아이콘 remove
						$("#move_" + folder_code + " .ico-fold").remove();
						return;
					}
					
					for (var i = 0; i < res.data.folderlist.length; i++){
						var folder_info = res.data.folderlist[i];
						var drive_key = folder_info.drive_key;
						var folder_id = folder_info._id.$oid;
						var folder_name = folder_info.folder_name;
						var _html = '';
						
						_html += '<ul>';
						_html += '	<li>';
						_html += '		<div id="move_' + folder_id + '" data="' + drive_key + '" data-pl="' + padding_left + '" style="padding-left:' + padding_left + 'px;">';
					//	_html += '			<span class="ico-fold"></span><span class="ico ico-folder' + (folder_info.folder_share == "Y" ? "-share-s" : "-s") + '"></span>' + folder_name;
						_html += '			<span class="ico-fold"></span><span class="ico ico-folder-s"></span>' + folder_name;
						_html += '		</div>';
						_html += '	</li>';
						_html += '</ul>';
						
						if (first_call){
							$("#move_" + drive_code).parent().append(_html);
							
						}else{
							$("#move_" + folder_code).parent().append(_html);
						}
						

						$("#move_" + folder_id).on("click", function(e){
							if (e.target.className == "ico-fold"){
								var drive_code = $(this).attr("data");
								var folder_code = $(this).attr("id").replace("move_", "");
								var padding_left_set = parseInt($(this).attr("data-pl")) + 24;
								$("#" + $(this).attr("id") + " .ico-fold").addClass("on");
								_self.draw_sub_folder(drive_code, folder_code, padding_left_set, false);
								
							}else if (e.target.className == "ico-fold on"){
								$("#" + $(this).attr("id") + " .ico-fold").removeClass("on");
								$("#" + $(this).attr("id")).parent().find("ul").remove();

							}else{
								$("#drive_tree div").removeClass("on");
								$("#" + $(this).attr("id")).addClass("on");
							}
						});						
					}
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},

	"get_move_fullpath" : function(_selector, _path){
		var _self = this;
		
		if (_selector.attr("data") == "root"){
			return _path
		}else{
			var _id = _selector.parent().parent().siblings("div").attr("id").replace("move_", "");
			var _ele = _selector.parent().parent().siblings("div");
			var _fullpath = _id + "/" + _path
			
			if (_selector.parent().parent().siblings("div").attr("data") == "root"){
				return _fullpath;
			}else{
				return this.get_move_fullpath(_ele, _fullpath);
			}		
		}
	},
	
	"drive_delete_select_item" : function(_id){
		var _self = this;
		var is_single = (_id != undefined ? true : false);
		var folder_check = [];
		var file_check = [];
		var not_me_folder_check = [];
		var not_me_file_check = [];
		
		if (is_single){
			file_check.push(_id);
			
		}else{
			$("input[name=folder_checkbox]:checked").each(function() {
				var folder_owner = $(this).attr("owner");
				
				//내가 생성한 폴더만 삭제
				if (folder_owner == gap.userinfo.rinfo.ky){
					folder_check.push($(this).val());
					
				}else{
					not_me_folder_check.push($(this).val());
					$(this).prop("checked", false);
				}
			});
			$("input[name=file_checkbox]:checked").each(function() {
				var file_owner = $("#file_" + $(this).val()).attr("owner");
				
				//내가 올린 파일만 삭제
				if (file_owner == gap.userinfo.rinfo.ky){
					file_check.push($(this).val());
					
				}else{
					not_me_file_check.push($(this).val());
					$(this).prop("checked", false);
				}
			});
			
			if (folder_check.length == 0 && file_check.length == 0){
				if (not_me_folder_check.length != 0 || not_me_file_check != 0){
					gap.gAlert(gap.lang.can_delete_my_file);
					
				}else{
					gap.gAlert(gap.lang.select_folder_file);
				}
				return false;
			}			
		}

		var msg = gap.lang.confirm_delete;
		$.confirm({
			title : "Confirm",
			content : msg,
			type : "default",  
			closeIcon : true,
			closeIconClass : "fa fa-close",
			columnClass : "s", 			 				
			animation : "top", 
			animateFromElement : false,
			closeAnimation : "scale",
			animationBounce : 1,	
			backgroundDismiss: false,
			escapeKey : false,
			buttons : {		
				confirm : {
					keys: ['enter'],
					text : gap.lang.OK,
					btnClass : "btn-default",
					action : function(){
						var surl = gap.channelserver + "/delete_file_list.km";
						var postData = {
								"folder_item" : folder_check.join("-spl-"),
								"file_item" : file_check.join("-spl-"),
								"drive_code" : gFiles.select_drive_code,
								"folder_depth" : gFiles.title_path_code
							};			

						$.ajax({
							type : "POST",
							url : surl,
							dataType : "json",
							data : JSON.stringify(postData),
							success : function(res){
								if (res.result == "OK"){
									if (_self.disp_view_mode == "list"){
										var key1 = (_self.total_file_count - file_check.join().split(",").length);
										var key2 = (_self.cur_page * _self.per_page - _self.per_page);
										if (key1 > key2){
											if (_self.select_left_menu == ""){	// 개별 드라이브를 클릭한 경우
												_self.draw_drive_data(_self.cur_page);
												
											}else{	// 전체/내가올린/공유된/즐겨찾기 클 클릭한 경우
												_self.draw_main_data(_self.cur_page);
											}
											
										}else{
											var page = gFiles.cur_page - 1;
											if (page <= 0){
												page = 1;
											}
											if (_self.select_left_menu == ""){	// 개별 드라이브를 클릭한 경우
												_self.draw_drive_data(page);
												
											}else{	// 전체/내가올린/공유된/즐겨찾기 클 클릭한 경우
												_self.draw_main_data(page);
											}
										}
										
									}else{
										for (var k = 0; k < file_check.length; k++){
											$("#" + file_check[k]).remove();
										}
									}

									// 트리 폴더에 있는 expand/collape 아이콘 처리
									if (folder_check.length > 0){
										for (var i = 0; i < folder_check.length; i++){
											var folder_id = folder_check[i];
											var same_level_folder_len = $("#ul_fl_" + folder_id).siblings().length;
											if (same_level_folder_len == 1){
												var parent_folder_id = $("#ul_fl_" + folder_id).siblings("div").attr("id").replace("main_", "");
												$("#btn_fold_" + parent_folder_id).empty();
											}
											$("#ul_fl_" + folder_id).remove();		// 트리에 있는 폴더 삭제
										}
									}
								//	gFiles.draw_drive_data(1);	
								}else{
									gap.gAlert(gap.lang.errormsg);
									return false;
								}
							},
							error : function(e){
								gap.gAlert(gap.lang.errormsg);
								return false;
							}
						});						
					}
				},
				cancel : {
					keys: ['esc'],
					text : gap.lang.Cancel,
					btnClass : "btn-default",
					action : function(){
						_self.drive_deselect_item();
					}
				}
			}		 			
		});
	},
	
	"delete_favorite_file" : function(_id){
		var _self = this;
		var is_single = (_id != undefined ? true : false);
		
		if (is_single){
			var file_check = [];
			file_check.push(_id);
			
		}else{
			var file_check = [];
			
			$("input[name=file_checkbox]:checked").each(function() {
				file_check.push($(this).val());
			});
			
			if (file_check.length == 0){
				gap.gAlert(gap.lang.select_file);
				return false;
			}			
		}
		
		var msg = gap.lang.confirm_delete;
		$.confirm({
			title : "Confirm",
			content : msg,
			type : "default",  
			closeIcon : true,
			closeIconClass : "fa fa-close",
			columnClass : "s", 			 				
			animation : "top", 
			animateFromElement : false,
			closeAnimation : "scale",
			animationBounce : 1,	
			backgroundDismiss: false,
			escapeKey : false,
			buttons : {		
				confirm : {
					keys: ['enter'],
					text : gap.lang.OK,
					btnClass : "btn-default",
					action : function(){
						var surl = gap.channelserver + "/delete_favorite.km";
						var postData = {
								"id" : file_check.join("-spl-")
							};			

						$.ajax({
							type : "POST",
							url : surl,
							dataType : "json",
							data : JSON.stringify(postData),
							success : function(res){
								if (res.result == "OK"){
									if (_self.disp_view_mode == "list"){
										var key1 = (_self.total_file_count - file_check.join().split(",").length);
										var key2 = (_self.cur_page * _self.per_page - _self.per_page);
										if (key1 > key2){
											_self.draw_favorite_data(_self.cur_page);
										}else{
											var page = _self.cur_page - 1;
											if (page <= 0){
												page = 1;
											}
											_self.draw_favorite_data(page);
										}
										
									}else{
										for (var k = 0; k < file_check.length; k++){
											$("#" + file_check[k]).remove();
										}
									}

								//	gFiles.draw_favorite_data(1);	
								}else{
									gap.gAlert(gap.lang.errormsg);
									return false;
								}
							},
							error : function(e){
								gap.gAlert(gap.lang.errormsg);
								return false;
							}
						});						
					}
				},
				cancel : {
					keys: ['esc'],
					text : gap.lang.Cancel,
					btnClass : "btn-default",
					action : function(){
						if (!is_single){
							_self.drive_deselect_item();
						}
					}
				}
			}		 			
		});
	},	
	
	"delete_files_file" : function(_id, _fname, _md5, _options){
		//더보기 메뉴에서 삭제하는 경우
		var _self = this;
		var select_id = _options.$trigger.parent().attr("id");
		var msg = gap.lang.confirm_delete;
		
		gap.showConfirm({
			title: "Confrim",
			contents: msg,
			callback: function(){
				var surl = gap.channelserver + "/delete_sub_file.km";
				var postData = {
						"id" : _id,
						"md5" : _md5,
						"ft" : gap.file_extension_check(_fname)
					};			

				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(postData),
					success : function(res){
						if (res.result == "OK"){
							if (_self.disp_view_mode == "list"){
								var key1 = (_self.total_file_count - 1);
								var key2 = (_self.cur_page * _self.per_page - _self.per_page);
								if (key1 > key2){
									_self.draw_files(_self.cur_page);
								}else{
									var page = gFiles.cur_page - 1;
									if (page <= 0){
										page = 1;
									}
									_self.draw_files(page);
								}									
							}else{
								$("#" + select_id).remove();
								if ($("#files_data_gallery_area").children().length == 0){
									//데이터가 없는 경우
									var html = '<div class="msg-empty"><img src="' + window.root_path + '/resource/images/empty.png" alt="" />' + gap.lang.no_upload_file + '</div>';
									$("#wrap_files_data_list").empty();
									$("#wrap_files_data_list").html(html);
									return false;
								}
							}
							
						}else{
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				});		
			}
		});
	},	
	
	"files_delete_select_item" : function(){
		var _self = this;
		var id_array = new Array();
		var md5_array = new Array();
		var fid_array = new Array();
		
		$("input[name=file_checkbox]:checked").each(function() {
			var _val = $(this).val().split("-spl-");
			var file_owner = $("#file_" + _val[2]).attr("owner");
			
			//내가 올린 파일만 삭제
			if (file_owner == gap.userinfo.rinfo.em){
				id_array.push(_val[0]);
				md5_array.push(_val[1]);
				fid_array.push(_val[2]);				
			}else{
				$(this).prop("checked", false);
			}
		});
		
		if (id_array.length == 0 && md5_array.length == 0){
			gap.gAlert(gap.lang.select_file);
			return false;
		}
		
		var msg = gap.lang.confirm_delete;
		$.confirm({
			title : "Confirm",
			content : msg,
			type : "default",  
			closeIcon : true,
			closeIconClass : "fa fa-close",
			columnClass : "s", 			 				
			animation : "top", 
			animateFromElement : false,
			closeAnimation : "scale",
			animationBounce : 1,	
			backgroundDismiss: false,
			escapeKey : false,
			buttons : {		
				confirm : {
					keys: ['enter'],
					text : gap.lang.OK,
					btnClass : "btn-default",
					action : function(){
						var surl = gap.channelserver + "/delete_sub_file_list2.km";
						var postData = {
								"id" : id_array,
								"md5" : md5_array
							};			

						$.ajax({
							type : "POST",
							url : surl,
							dataType : "json",
							data : JSON.stringify(postData),
							success : function(res){
								if (res.result == "OK"){
									if (_self.disp_view_mode == "list"){
										var key1 = (_self.total_file_count - fid_array.join().split(",").length);
										var key2 = (_self.cur_page * _self.per_page - _self.per_page);
										if (key1 > key2){
											_self.draw_files(gFiles.cur_page);
										}else{
											var page = gFiles.cur_page - 1;
											if (page <= 0){
												page = 1;
											}
											_self.draw_files(page);
										}									
									}else{
										for (var i = 0; i < fid_array.length; i++){
											$("#" + fid_array[i]).remove();
										}
										
										if ($("#files_data_gallery_area").children().length == 0){
											//데이터가 없는 경우
											var html = '<div class="msg-empty"><img src="' + window.root_path + '/resource/images/empty.png" alt="" />' + gap.lang.no_upload_file + '</div>';
											$("#wrap_files_data_list").empty();
											$("#wrap_files_data_list").html(html);
											return false;
										}
									}
								}else{
									gap.gAlert(gap.lang.errormsg);
									return false;
								}
							},
							error : function(e){
								gap.gAlert(gap.lang.errormsg);
								return false;
							}
						});						
					}
				},
				cancel : {
					keys: ['esc'],
					text : gap.lang.Cancel,
					btnClass : "btn-default",
					action : function(){
						_self.drive_deselect_item();
					}
				}
			}		 			
		});		
	},
	
	"files_reg_drive_select_item" : function(_info){
		var _self = this;
		var fid_array = new Array();
		var md5_array = new Array();
		
		var is_single = (_info != undefined ? true : false);
		if (is_single){
			var _val = _info.split("-spl-");
			fid_array.push(_val[0]);
			md5_array.push(_val[1]);
			
		}else{
			$("input[name=file_checkbox]:checked").each(function() {
				var _val = $(this).val().split("-spl-");
				fid_array.push(_val[0]);
				md5_array.push(_val[1]);
			});
			
			if (fid_array.length == 0 && md5_array.length == 0){
				gap.gAlert(gap.lang.select_file);
				return false;
			}			
		}	
		
		var html = "";
		html += '<h2>' + gap.lang.reg_location + '</h2>';
		html += '<button class="ico btn-close" id="close_move_file_layer">닫기</button>';
		html += '<div class="folder-tree">';
		html += '	<ul id="drive_tree">';
		html += '	</ul>';
		html += '</div>';
		html += '<div class="layer-bottom">';
		html += '	<button id="run_move_file" class="btn-point"><strong>' + gap.lang.registration + '</strong></button>';
		html += '	<button id="cancel_move_file"><span>' + gap.lang.Cancel + '</span></button>';
		html += '</div>';		
		
		$("#move_file_layer").html(html);
		
		// 드라이브 리스트 정보 가져오기
		var surl = gap.channelserver + "/drive_list.km";
		var postData = {};

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				for (var i = 0; i < res.length; i++){
					var data = res[i];
					var _html = '';
					_html += '		<li>';
					_html += '			<div id="move_' + data.ch_code + '" data="root"><span class="ico-fold"></span><span class="ico ico-drive' + (data.ch_share == "Y" ? "-share-s" : "-s") + '"></span>' + data.ch_name + '</div>';
					_html += '		</li>';
					
					$("#drive_tree").append(_html);
					$("#move_" + data.ch_code).on("click", function(e){
						if (e.target.className == "ico-fold"){
							var drive_code = $(this).attr("id").replace("move_", "");
							var folder_code = $(this).attr("data");
							$("#" + $(this).attr("id") + " .ico-fold").addClass("on");
							_self.draw_sub_folder(drive_code, folder_code, 24, true);
							
						}else if (e.target.className == "ico-fold on"){
							$("#" + $(this).attr("id") + " .ico-fold").removeClass("on");
							$("#" + $(this).attr("id")).parent().find("ul").remove();

						}else{
							$("#drive_tree div").removeClass("on");
							$("#" + $(this).attr("id")).addClass("on");
						}
					});
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		

		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#move_file_layer')
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();

		
		$("#close_move_file_layer").on("click", function(){
			gap.close_layer('move_file_layer');
		});
		$("#cancel_move_file").on("click", function(){
			gap.close_layer('move_file_layer');
		});
		$("#run_move_file").on("click", function(){
			var drive_code = "";
			var drive_name = "";
			var folder_code = "";
			var folder_name = "";
			var full_path_code = "";
			$("#drive_tree div").each(function(idx){
				if ($(this).hasClass("on")){
					if ($(this).attr("data") == "root"){
						//최상위 드라이브를 선택한 경우
						drive_code = $(this).attr("id").replace("move_", "");
						drive_name = $(this).text().trim();
						folder_code = $(this).attr("data");
						folder_name = "";
						
					}else{
						drive_code = $(this).attr("data");
						drive_name = $("#move_" + drive_code).text().trim();
						folder_code = $(this).attr("id").replace("move_", "")
						folder_name = $(this).text().trim();;
					}
					full_path_code = _self.get_move_fullpath($(this), $(this).attr("id").replace("move_", ""));
				}
			});
			if (full_path_code == ""){
				gap.gAlert(gap.lang.select_location_to_move);
				return false;
			}

			var surl = gap.channelserver + "/channel_file_copy_drive.km";
			var postData = {
					"md5s" : md5_array,
					"channel_ids" : fid_array,
					"drive_code" : drive_code,
					"drive_name" : drive_name,
					"folder_code" : folder_code,
					"folder_name" : folder_name,
					"owner" : gap.userinfo.rinfo,
					"fserver" : gap.channelserver,
					"type" : "folder",
					"folder_depth" : full_path_code.replace(/\//gi, ",")
				};

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : JSON.stringify(postData),
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){
					if (res.result == "OK"){
						gap.gAlert(gap.lang.reg_success);
						gap.close_layer('move_file_layer');
						_self.drive_deselect_item();
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});					
		});		
	},
	
	"drive_select_all_item" : function(){
		$("input[name=folder_checkbox]").each(function() {
			$(this).prop("checked", true);
			if (gFiles.disp_view_mode != "list"){
				var select_id = ($(this).val().indexOf("-spl-") > -1 ? $(this).val().split("-spl-")[2] : $(this).val())
				$("#" + select_id).addClass("on");
			}
		});
		$("input[name=file_checkbox]").each(function() {
			$(this).prop("checked", true);
			if (gFiles.disp_view_mode != "list"){
				var select_id = ($(this).val().indexOf("-spl-") > -1 ? $(this).val().split("-spl-")[2] : $(this).val())
				$("#" + select_id).addClass("on");
			}
		});		
	},
	
	"drive_deselect_item" : function(){
		$("input[name=folder_checkbox]:checked").each(function() {
			$(this).prop("checked", false);
			if (gFiles.disp_view_mode != "list"){
				var select_id = ($(this).val().indexOf("-spl-") > -1 ? $(this).val().split("-spl-")[2] : $(this).val())
				$("#" + select_id).removeClass("on");
			}
		});
		$("input[name=file_checkbox]:checked").each(function() {
			$(this).prop("checked", false);
			if (gFiles.disp_view_mode != "list"){
				var select_id = ($(this).val().indexOf("-spl-") > -1 ? $(this).val().split("-spl-")[2] : $(this).val())
				$("#" + select_id).removeClass("on");
			}
		});		
	},
	
	"file_convert" : function(fserver, fname, md5, item_id, ty, is_search){
		/*
		 * ty : 1 / 2 / 3 (드라이브 / 채널 / 즐겨찾기)
		 */
		var _self = this;
		var call_from_search = (is_search == undefined ? false : is_search);
		var surl = gap.search_file_convert_server(fserver) + "/FileConvert.km";
		var postData = {
				"id" : item_id,
				"ty" : ty
			};	
		
		if (ty == "2"){
			postData["md5"] = md5;
			postData["ft"] = gap.file_extension_check(fname);
		}
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					if (isNaN(res.data.count) || res.data.count == 0){
						if (call_from_search){
		                	_self.draw_empty_search_content();
		                }	
						gap.hide_loading();
						gap.gAlert(gap.lang.noimage);
						return false;

					}else{
						var obj = new Object();
						obj.id = item_id;
						obj.md5 = md5;
						obj.ty = ty;
						obj.filename = fname;
						obj.fserver = fserver;
						_self.click_file_info = obj;

		                if (call_from_search){
		                	_self.show_convert_search_file_info(fname, md5, res.data.count);
		                	
		                }else{
		                	_self.show_convert_file_info(fname, md5, res.data.count);
		                }
					}

				}else{
					if (call_from_search){
	                	_self.draw_empty_search_content();
	                }					
					gap.hide_loading();
					gap.gAlert(gap.lang.noimage);
					return false;
				}
			},
			error : function(e){
				if (call_from_search){
					_self.draw_empty_search_content();
                }
				gap.hide_loading();
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});						
	},
	
	"draw_favorite_data" : function(page_no){
		var _self = this;
		
		if (page_no == 1){
			$("#sub_channel_content").empty();
			$("#sub_channel_content").addClass("drive");
			
			this.start_page = "1";
			this.cur_page = "1";
			this.per_page = (this.disp_view_mode == "list" ? "10" : "20");
			this.cur_file_count = 0;
			this.cur_file_total_count = 0;
			
			var html = "";
			
			html += '<div class="chat-area">';
			html += '	<div class="channel-header">';
		//	html += '		<h2>' + gap.lang.ff + gBody3.expand_collapse_btn() + '</h2>';
			html += '		<h2>' + gap.lang.ff + '</h2>';
			html += '		<div class="channel-search-wrap">';
			html += '			<div class="channel-search">';
			html += '				<div class="input-field">';
			html += '					<input type="text" autocomplete="off" value="' + this.query_str + '" id="ch_query" placeholder="' + gap.lang.input_search_query + '" />';
			html += '				</div>';
			html += '				<button class="ico btn-channel-search" id="ch_query_btn">검색</button> ';
			html += '			</div>';
			html += '		</div>';
			html += '		<div class="drive-btns">';
			html += '			<button id="drive_delete_file_btn"><span>' + gap.lang.basic_delete + '</span></button>';
			html += '			<button id="drive_select_all_btn"><span>' + gap.lang.selectall + '</span></button>';
			html += '			<button id="drive_deselect_all_btn"><span>' + gap.lang.deselection + '</span></button>';
			html += '			<button id="view_mode_list" class="ico btn-mode-list' + (this.disp_view_mode == "list" ? " on" : "") + '"><span>리스트보기</span></button>';
			html += '			<button id="view_mode_image" class="ico btn-mode-img' + (this.disp_view_mode == "image" ? " on" : "") + '"><span>이미지보기</span></button>';
	//		html += '			<button id="view_mode_gallery" class="ico btn-mode-gallery' + (gFiles.disp_view_mode == "gallery" ? " on" : "") + '"><span>갤러리보기</span></button>';
			html += '		</div>';
			html += '	</div>';
			
			html += '	<div class="wrap-channel" id="wrap_favorite_data_list" style="overflow:hidden; height:100%;padding-top:30px;">';
			if (this.disp_view_mode == "list"){
				html += '		<div class="list" id="favorite_data_list">';
				html += '			<ul id="favorite_file_list_area">';		
				html += '			</ul>';
				html += '		</div>';
				html += '		<div class="paging">';
				html += '			<ul id="paging_area">';
				html += '			</ul>';
				html += '		</div>';
				
			}else{
				html += '		<div id="favorite_data_gallery">';
				html += '			<ul class="gallery" id="favorite_data_gallery_area">';
				html += '			</ul>';
				html += '		</div>';			
			}

			html += '	</div>';
			html += '</div>';
			
			$("#sub_channel_content").html(html);
		}

		if (this.is_box_layer_open){
			$("#favorite_data_list").addClass("line2");
		}
		
		this.start_skp = (parseInt(this.per_page) * (parseInt(page_no))) - (parseInt(this.per_page) - 1);
				
		//"dtype" : 은 파일 형식으로 필터링 할때 사용한다. ppt, xls, doc, pdf, image, movie, hwp, txt, etc
		
		var surl = gap.channelserver + "/channel_list.km";
		var postData = {
				"channel_code" : "",
				"query_type" : "favoritecontent",
				"start" : (this.start_skp - 1).toString(),
				"perpage" : this.per_page,
				"q_str" : this.query_str,
				"dtype" : this.click_filter_image,
				"type" : (gap.cur_window == "channel" ? "channel" : "drive")
			};	

		$.ajax({
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
				if (res.result == "OK"){
					_self.cur_file_count += res.data.data.length;
					_self.cur_file_total_count = res.data.totalcount;
					_self.draw_favorite_data_list(page_no, res.data);	
					
				}else{
					if (_self.query_str != "" && res.data == null){
						_self.cur_file_count = 0;
						_self.cur_file_total_count = 0;
						_self.draw_favorite_data_list(1, {data:[], totalcount:0});	
						return false;
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}					
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
		
		$("#ch_query").keypress(function(e){
			if (e.keyCode == 13){
				_self.search_enter("f");
			}
		});
		$("#ch_query_btn").on("click", function(e){
			_self.search_enter("f");
		});		
		$("#drive_delete_file_btn").on("click", function(){
			_self.delete_favorite_file();
		});
		$("#drive_select_all_btn").on("click", function(){
			_self.drive_select_all_item();
		});
		$("#drive_deselect_all_btn").on("click", function(){
			_self.drive_deselect_item();
		});
		$("#view_mode_list").on("click", function(){
			localStorage.setItem('view_mode', 'list');
			_self.disp_view_mode = "list";
			_self.draw_favorite_data(1);
		});
		$("#view_mode_image").on("click", function(){
			localStorage.setItem('view_mode', 'image');
			_self.disp_view_mode = "image";
			_self.draw_favorite_data(1);
		});
		$("#view_mode_gallery").on("click", function(){
			localStorage.setItem('view_mode', 'gallery');
			_self.disp_view_mode = "gallery";
			_self.draw_favorite_data(1);
		});	
	},	
	
	"draw_favorite_data_list" : function(page_no, res){
		var _self = this;
		
		if (this.query_str == "" && res.data.length == 0){
			//데이터가 없는 경우
			var html = '<div class="msg-empty"><img src="' + window.root_path + '/resource/images/empty.png" alt="" />' + gap.lang.no_favorite_file + '</div>';
			$("#wrap_favorite_data_list").empty();
			$("#wrap_favorite_data_list").html(html);
			return false;
		}
		
		if (this.query_str != "" && res.data.length == 0){
			//검색된 파일이 없는 경우
			var html = '<div class="msg-empty"><img src="' + window.root_path + '/resource/images/empty.png" alt="" />' + gap.lang.searchnoresult + '</div>';
			$("#wrap_favorite_data_list").empty();
			$("#wrap_favorite_data_list").html(html);
			return false;
		}
		
		if (this.disp_view_mode == "list"){
			$("#favorite_file_list_area").html('');		
		}
		var user_info = gap.user_check(gap.userinfo.rinfo);
		for (var k = 0;  k < res.data.length; k++){
			var file_info = res.data[k];
			
			var file_id = file_info._id.$oid;
			var disp_file_name = gap.get_bun_filename(file_info);
			var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(typeof(file_info.lastupdate) != "undefined" ? file_info.lastupdate : file_info.GMT));
			var disp_time = gap.change_date_localTime_only_time(String(typeof(file_info.lastupdate) != "undefined" ? file_info.lastupdate : file_info.GMT));
			var icon_kind = gap.file_icon_check(file_info.filename);
			var downloadurl = gap.search_file_convert_server(file_info.fserver) + "FDownload.do?id=" + file_info._id.$oid + "&ty=3&ky="+gap.userinfo.rinfo.ky;
			var show_thumb = false;
			var file_html = '';
			
			if (this.disp_view_mode == "list"){
				file_html += '	<li id="' + file_id + '" style="list-style:none;">';
				file_html += '		<div class="checkbox">';
				file_html += '			<label>';
				file_html += '				<input type="checkbox" name="file_checkbox" value="' + file_id + '"><span class="checkbox-material"><span class="check"></span></span>';
				file_html += '			</label>';
				file_html += '		</div>';
				file_html += '		<a style="cursor:pointer" id="file_' + file_id + '" fserver="' + file_info.fserver + '" fname="' + disp_file_name + '" fsize="' + file_info.size.$numberLong + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '">';
				file_html += '			<span class="ico ico-file ' + icon_kind + '"></span>';
				file_html += '			<dl>';
				file_html += '				<dt class="files-main"><strong>' + disp_file_name + '</strong> <span>(' + gap.file_size_setting(file_info.size.$numberLong) + ')</span></dt>';
				file_html += '				<dd><span>' + user_info.name + gap.lang.hoching  + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
				file_html += '			</dl>';
				file_html += '		</a>';
				file_html += '		<button class="ico btn-more favorite-file-menu"></button>';
				file_html += '	</li>';
				
				$("#favorite_file_list_area").append(file_html);
				
			}else{
				file_html += '<li class="gallery-info" id="' + file_id + '" style="list-style:none;">';
				file_html += '	<div class="checkbox">';
				file_html += '		<label>';
				file_html += '			<input type="checkbox" name="file_checkbox" value="' + file_id + '" id="chk_' + file_id + '"><span class="checkbox-material"><span class="check"></span></span>';
				file_html += '		</label>';
				file_html += '	</div>';
			//	file_html += '	<div class="thm' + (icon_kind == "video" ? " video-thm" : "") + '" id="file_' + file_id + '" fserver="' + file_info.fserver + '" fname="' + file_info.filename + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '">';
				file_html += '	<div class="thm" id="file_' + file_id + '" fserver="' + file_info.fserver + '" fname="' + disp_file_name + '" fsize="' + file_info.size.$numberLong + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '">';

				if (this.disp_view_mode == "image" && icon_kind == "img"){
					show_thumb = true;
				}
				if (this.disp_view_mode == "gallery" && file_info.thumbOK == "T"){
					show_thumb = true;
				}
				
				if (show_thumb){
					file_html += '		<img src="' + gap.search_file_convert_server(file_info.fserver) + '/FDownload_thumb.do?id=' + file_id + '&ty=3">' + (icon_kind == "video" ? '<span class="ico ico-video-b">재생</span>' : "");	
				}else{
					file_html += '		<span class="ico ico ico-' + icon_kind + '-b"></span>';	
				}
				file_html += '	</div>';
				file_html += '	<dl id="file_bottom_' + file_id + '" class="' + (show_thumb ? "gallery-attach" : "") + '">';
				file_html += '		<dt>' + (show_thumb ? '<span class="ico ico-attach ' + icon_kind + '"></span>' : "") + '<strong title="' + disp_file_name + '">' + disp_file_name + '</strong><span>&nbsp;(' + gap.file_size_setting(file_info.size.$numberLong) + ')</span></dt>';
				file_html += '		<dd><span>' + user_info.name + gap.lang.hoching + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
				file_html += '	</dl>';
				file_html += '	<button class="ico btn-more favorite-file-menu"></button>';
				file_html += '</li>';
				
				$("#favorite_data_gallery_area").append(file_html);				
			}
			
			$("#file_bottom_" + file_id).bind("click", file_id, function(event){
				$("#file_" + event.data).click();
			});

			$("#file_" + file_id).bind("click", file_info, function(event){
				
				_self.box_layer_close();
				var furl = $(this).attr("furl");
				var fserver = $(this).attr('fserver');
				var fname = $(this).attr('fname');
				var md5 = $(this).attr('md5');
				var fid = $(this).attr('id').replace("file_", "");
				var thmok = $(this).attr('thmok');
				
				if (gap.checkFileExtension(fname)){
					var url = gap.channelserver + "office/" + fid + "/filesfavorite";
					gap.popup_url_office(url);	
					return false;
				}else{
					var ext = gap.is_file_type_filter(fname);
					if (ext == "img"){
						var url = gap.channelserver + "FDownload.do?id="+fid+"&ty=1&ky=" + gap.userinfo.rinfo.ky;
						gap.show_image(url, fname);
						return false;
					}else if (ext == "movie"){
						var url = gap.channelserver + "FDownload.do?id="+fid+"&ty=1&ky="+gap.userinfo.rinfo.ky;
						gap.show_video(url, fname);	
						return false;
					}
					
				}			

				var surl = gap.channelserver + "/file_info.km";
				var postData = {
						"id" : fid,
						"md5" : md5,
						"ty" : "3"
					};		

				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(postData),
					success : function(res){
						if (res.result == "OK"){
							var file_info = res.data;
							
							$("#owner_info_dis").hide();
							$("#member_info_dis").hide();
							
							gFiles.draw_file_detail_info(file_info, "3")
							
							$(".detail-info").mCustomScrollbar({
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
						}else{
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				});
			});
			
			$("#chk_" + file_id).bind("click", file_id, function(event){
				if ($(this).prop("checked")){
					$("#" + event.data).addClass("on");
				}else{
					$("#" + event.data).removeClass("on");
				}
			});
		}
		
		$(".ico.btn-more.favorite-file-menu").off();
		$(".ico.btn-more.favorite-file-menu").on("click", function(){
			$.contextMenu({
				selector : ".ico.btn-more.favorite-file-menu",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){
					var $selector = (_self.disp_view_mode == "list" ? $(this).prev() : $(this).prev().prev());
					var f_id = $selector.attr("id").replace("file_", "");
					var f_server = $selector.attr("fserver");
					var f_name = $selector.attr("fname");
					var f_md5 = $selector.attr("md5");
					var f_url = $selector.attr("furl");
					_self.context_menu_call_file_mng(key, options, f_id, f_server, f_name, f_md5, f_url);
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
					}
				},			
				build : function($trigger, options){
					var $selector = (_self.disp_view_mode == "list" ? $trigger.prev() : $trigger.prev().prev());
					var fname = $selector.attr('fname');
					var thmok = $selector.attr('thmok');
					var icon_kind = gap.file_icon_check(fname);
					var is_preview = true;
					if (icon_kind == "img" || icon_kind == "video"){
					//	is_preview = false;
					}else{
						if (!_self.check_preview_file(fname)){
							is_preview = false;
						}
					}
					options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
					return {
						items: _self.favorite_file_menu_content(is_preview)
					}
				}
			});
		});	
		
		
		//페이징
		this.total_file_count = res.totalcount;
		this.total_page_count = this.get_page_count(this.total_file_count, this.per_page);
		if (this.disp_view_mode == "list"){
			this.initialize_page();
		}
				
		$("#wrap_favorite_data_list").mCustomScrollbar({
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
			autoHideScrollbar : false,
		//	setTop : ($("#wrap_favorite_data_list").height()) + "px",
			callbacks : {
				onTotalScrollBackOffset: 100,
				onTotalScroll: function(){
					if (_self.disp_view_mode != "list"){
						page_no++;
						_self.add_favorite_data_list(page_no);
					}
				},
				onTotalScrollOffset: 100,
				alwaysTriggerOffsets:true
			}
		});
	},	
	
	"add_favorite_data_list" : function(page_no){
		var _self = this;
		var is_continue = false;
		
		if (this.disp_view_mode == "list"){
			is_continue = true;
		}else{
			if (this.cur_file_total_count > this.cur_file_count){
				is_continue = true;
			}
		}
		if (is_continue){
			this.start_skp = (parseInt(this.per_page) * (parseInt(page_no))) - (parseInt(this.per_page) - 1);
			var surl = gap.channelserver + "/channel_list.km";
			var postData = {
					"channel_code" : "",
					"query_type" : "favoritecontent",
					"start" : (this.start_skp - 1).toString(),
					"perpage" : this.per_page,
					"q_str" : this.query_str,
					"dtype" : this.click_filter_image,
					"type" : "1"
				};

			$.ajax({
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
					if (res.result == "OK"){
						_self.cur_file_count += res.data.data.length;
						_self.cur_file_total_count = res.data.totalcount;
						_self.draw_favorite_data_list(page_no, res.data);	
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});		
		}		
	},
	

	"draw_files" : function(page_no){
		var _self = this;
		
		if (page_no == 1){
			this.start_page = "1";
			this.cur_page = "1";
			this.per_page = (this.disp_view_mode == "list" ? "10" : "20");
			this.cur_file_count = 0;
			this.cur_file_total_count = 0;
			this.query_str = $("#ch_query").val();
			
			var html = "";
			
			html += '	<div class="wrap-channel" id="wrap_files_data_list" style="overflow:hidden; height:100%;">';
			if (this.disp_view_mode == "list"){
				html += '		<div class="list" id="files_data_list">';
				html += '			<ul id="files_data_list_area">';		
				html += '			</ul>';
				html += '		</div>';
				html += '		<div class="paging">';
				html += '			<ul id="paging_area">';
				html += '			</ul>';
				html += '		</div>';
				
			}else{
				html += '		<div id="files_data_gallery">';
				html += '			<ul class="gallery" id="files_data_gallery_area">';
				html += '			</ul>';
				html += '		</div>';			
			}

			html += '	</div>';
			html += '</div>';
			
			$("#channel_list").html(html);
			
			//버튼 이벤트 처리
			$("#files_download_file_btn").off().on("click", function(){
				_self.drive_download_file();
			});
			
			$("#files_delete_file_btn").off();
			$("#files_delete_file_btn").on("click", function(){
				_self.files_delete_select_item();
			});
			$("#files_reg_drive_file_btn").off();
			$("#files_reg_drive_file_btn").on("click", function(){
				_self.files_reg_drive_select_item();
			});
			$("#files_select_all_btn").off();
			$("#files_select_all_btn").on("click", function(){
				_self.drive_select_all_item();
			});
			$("#files_deselect_all_btn").off();
			$("#files_deselect_all_btn").on("click", function(){
				_self.drive_deselect_item();
			});
			$("#view_mode_list").off();
			$("#view_mode_list").on("click", function(){
				localStorage.setItem('view_mode', 'list');
				_self.disp_view_mode = "list";
				
				$("#view_mode_list").addClass("on");
				$("#view_mode_image").removeClass("on");
				$("#view_mode_gallery").removeClass("on");
				_self.draw_files(1);
			});
			$("#view_mode_image").off();
			$("#view_mode_image").on("click", function(){
				localStorage.setItem('view_mode', 'image');
				_self.disp_view_mode = "image";
				
				$("#view_mode_list").removeClass("on");
				$("#view_mode_image").addClass("on");
				$("#view_mode_gallery").removeClass("on");
				_self.draw_files(1);
			});
			$("#view_mode_gallery").off();
			$("#view_mode_gallery").on("click", function(){
				localStorage.setItem('view_mode', 'gallery');
				_self.disp_view_mode = "gallery";
				
				$("#view_mode_list").removeClass("on");
				$("#view_mode_image").removeClass("on");
				$("#view_mode_gallery").addClass("on");
				_self.draw_files(1);
			});	
		}
		
		if (this.is_box_layer_open){
			$("#favorite_data_list").addClass("line2");
		}
		
		this.start_skp = (parseInt(this.per_page) * (parseInt(page_no))) - (parseInt(this.per_page) - 1);
				
		//"dtype" : 은 파일 형식으로 필터링 할때 사용한다. ppt, xls, doc, pdf, image, movie, hwp, txt, etc
		var surl = gap.channelserver + "/channel_list.km";
		var postData = {
				"channel_code" : this.select_channel_code,
				"query_type" : this.cur_opt,
				"start" : (this.start_skp - 1).toString(),
				"perpage" : this.per_page,
				"q_str" : this.query_str,
				"dtype" : this.click_filter_image,
				"type" : "2"	//파일만
			};

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text", //"json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(__res){
				var res = JSON.parse(__res);
				if (res.result == "OK"){
					_self.cur_file_count += res.data.data.length;
					_self.cur_file_total_count = res.data.totalcount;
					_self.draw_files_data_list(page_no, res.data);
					
				}else{
					if (_self.query_str != "" && res.data == null){
						_self.cur_file_count = 0;
						_self.cur_file_total_count = 0;
						_self.draw_files_data_list(1, {data:[], totalcount:0});	
						return false;
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}					
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},	
	
	"draw_files_data_list" : function(page_no, res){
		var _self = this;
		
		if (this.query_str == "" && res.data.length == 0){
			//데이터가 없는 경우
			var html = '<div class="msg-empty"><img src="' + root_path +'/resource/images/empty.png" alt="" />' + gap.lang.no_upload_file + '</div>';
			$("#wrap_files_data_list").empty();
			$("#wrap_files_data_list").html(html);
			return false;
		}
		
		if (this.query_str != "" && res.data.length == 0){
			//검색된 파일이 없는 경우
			var html = '<div class="msg-empty"><img src="' + root_path + '/resource/images/empty.png" alt="" />' + gap.lang.searchnoresult + '</div>';
			$("#wrap_files_data_list").empty();
			$("#wrap_files_data_list").html(html);
			return false;
		}
		
		if (this.disp_view_mode == "list"){
			$("#files_data_list_area").html('');		
		}
		
		for (var k = 0;  k < res.data.length; k++){
			var data = res.data[k];
			var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(String(data.GMT)));
			var disp_time = gap.change_date_localTime_only_time(String(data.GMT));
			var chcode = data.channel_code;
			var chname = data.channel_name;
			var owner_info = gap.user_check(data.owner);
			var file_id = data._id.$oid;
			var file_info = data.info;
			var fname = file_info.filename;
			var fsize = file_info.file_size.$numberLong;
			var ftype = file_info.file_type;
			var icon_kind = gap.file_icon_check(fname);
			var url = gap.search_fileserver(file_info.nid);			
			
			
			var ty = "2";
			if (data.id.split("_").length > 1){
				ty = "reply";
			}
			
			var downloadurl = gap.search_file_convert_server(data.fserver) + "FDownload.do?id=" + data.id + "&md5=" + file_info.md5 + "&ty="+ty+"&ky="+gap.userinfo.rinfo.ky;
			var checkbox_val = data.id + "-spl-" + file_info.md5 + "-spl-" + file_id;
			var show_thumb = false;
			var file_html = '';
			var upload_path = data.upload_path;
			
			
			if (this.disp_view_mode == "list"){
				file_html += '	<li id="' + file_id + '" style="list-style:none;">';
				file_html += '		<div class="checkbox">';
				file_html += '			<label>';
				file_html += '				<input type="checkbox" name="file_checkbox" value="' + checkbox_val + '"><span class="checkbox-material"><span class="check"></span></span>';
				file_html += '			</label>';
				file_html += '		</div>';
				file_html += '		<a style="cursor:pointer" up="'+upload_path+'" id="file_' + file_id + '" dataid="' + data.id + '" owner="' + data.ky + '" fserver="' + data.fserver + '" fname="' + fname + '" ftype="' + ftype + '" fsize="' + fsize + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '">';
				file_html += '			<span class="ico ico-file ' + icon_kind + '"></span>';
				file_html += '			<dl>';
				file_html += '				<dt><strong>' + fname + '</strong> <span>(' + gap.file_size_setting(fsize) + ')</span></dt>';
				file_html += '				<dd><span>' + owner_info.name + gap.lang.hoching  + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
				if (this.check_top_menu2()){
					file_html += '		<dd><span class="channel-name">' + chname + '</span></dd>';
				}
				file_html += '			</dl>';
				file_html += '		</a>';
				file_html += '		<button class="ico btn-more files-file-menu"></button>';
				file_html += '	</li>';
				
				$("#files_data_list_area").append(file_html);
				
			}else{
				file_html += '<li class="gallery-info" id="' + file_id + '" style="list-style:none;">';
				file_html += '	<div class="checkbox">';
				file_html += '		<label>';
				file_html += '			<input type="checkbox" name="file_checkbox" value="' + checkbox_val + '" id="chk_' + file_id + '"><span class="checkbox-material"><span class="check"></span></span>';
				file_html += '		</label>';
				file_html += '	</div>';
		//		file_html += '	<div class="thm' + (icon_kind == "video" ? " video-thm" : "") + '" id="file_' + file_id + '" dataid="' + data.id + '" owner="' + data.email + '" fserver="' + data.fserver + '" fname="' + fname + '" ftype="' + ftype + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '">';
				file_html += '	<div class="thm" up="'+upload_path+'" id="file_' + file_id + '" dataid="' + data.id + '" owner="' + data.ky + '" fserver="' + data.fserver + '" fname="' + fname + '" ftype="' + ftype + '" fsize="' + fsize + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '">';

				if (this.disp_view_mode == "image" && icon_kind == "img"){
					show_thumb = true;
				}
				if (this.disp_view_mode == "gallery" && file_info.thumbOK == "T"){
					show_thumb = true;
				}
				
				if (show_thumb){
					file_html += '		<img src="' + gap.search_file_convert_server(data.fserver) + '/FDownload_thumb.do?id=' + data.id + '&md5=' + file_info.md5 + '&ty=2">' + (icon_kind == "video" ? '<span class="ico ico-video-b">재생</span>' : "");	
				}else{
					file_html += '		<span class="ico ico ico-' + icon_kind + '-b"></span>';	
				}
				file_html += '	</div>';
				file_html += '	<dl id="file_bottom_' + file_id + '" class="' + (show_thumb ? "gallery-attach" : "") + '">';
				file_html += '		<dt>' + (show_thumb ? '<span class="ico ico-attach ' + icon_kind + '"></span>' : "") + '<strong title="' + fname + '">' + fname + '</strong><span>&nbsp;(' + gap.file_size_setting(fsize) + ')</span></dt>';				
				file_html += '		<dd><span>' + owner_info.name + gap.lang.hoching + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
				if (this.check_top_menu2()){
					file_html += '		<dd><span class="channel-name">' + chname + '</span></dd>';
				}
				file_html += '	</dl>';
				file_html += '	<button class="ico btn-more files-file-menu"></button>';
				file_html += '</li>';
				
				$("#files_data_gallery_area").append(file_html);				
			}
			
			$("#file_bottom_" + file_id).bind("click", file_id, function(event){
				$("#file_" + event.data).click();
			});

			$("#file_" + file_id).bind("click", file_info, function(event){
			//	gRM.box_layer_close();
				var furl = $(this).attr("furl");
				var fserver = $(this).attr('fserver');
				var fname = $(this).attr('fname');
				var md5 = $(this).attr('md5');
				var dataid = $(this).attr('dataid');
				var thmok = $(this).attr('thmok');
				
				if (gap.checkFileExtension(fname)){
					var url = gap.channelserver + "office/" + fid + "/files";
					gap.popup_url_office(url);	
					return false;
				}else{
					var ext = gap.is_file_type_filter(fname);
					if (ext == "img"){
						var url = gap.channelserver + "FDownload.do?id="+fid+"&ty=1&ky=" + gap.userinfo.rinfo.ky;
						gap.show_image(url, fname);
						return false;
					}else if (ext == "movie"){
						var url = gap.channelserver + "FDownload.do?id="+fid+"&ty=1&ky="+gap.userinfo.rinfo.ky;
						gap.show_video(url, fname);	
						return false;
					}
					
				}			

				var surl = gap.channelserver + "/file_info.km";
				var postData = {
						"id" : dataid,
						"md5" : md5,
						"ty" : "2"
					};		

				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(postData),
					success : function(res){
						if (res.result == "OK"){
							var file_info = res.data;
							_self.draw_file_detail_info(file_info, "2")
							
							$(".detail-info").mCustomScrollbar({
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
						}else{
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				});			
			});
			
			$("#chk_" + file_id).bind("click", file_id, function(event){
				if ($(this).prop("checked")){
					$("#" + event.data).addClass("on");
				}else{
					$("#" + event.data).removeClass("on");
				}
			});
		}
		
		$(".ico.btn-more.files-file-menu").off();
		$(".ico.btn-more.files-file-menu").on("click", function(){
			
			$.contextMenu({
				selector : ".ico.btn-more.files-file-menu",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){
					var $selector = (_self.disp_view_mode == "list" ? $(this).prev() : $(this).prev().prev());
					var f_id = $selector.attr("dataid");
					var f_server = $selector.attr("fserver");
					var f_name = $selector.attr("fname");
					var f_md5 = $selector.attr("md5");
					var f_url = $selector.attr("furl");
					
					var f_type = $selector.attr("ftype");
					var f_owner = $selector.attr("owner");
					var f_upload_path = $selector.attr("up");
					_self.context_menu_call_file_mng(key, options, f_id, f_server, f_name, f_md5, f_url, false,  f_owner, f_upload_path, f_type);
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
					}
				},			
				build : function($trigger, options){
					var $selector = (_self.disp_view_mode == "list" ? $trigger.prev() : $trigger.prev().prev());
					var fname = $selector.attr('fname');
					var fowner = $selector.attr('owner');
					var thmok = $selector.attr('thmok');
					var icon_kind = gap.file_icon_check(fname);
					var is_preview = true;
					if (icon_kind == "img" || icon_kind == "video"){
					//	is_preview = false;
					}else{
						if (!gBody3.check_preview_file(fname)){
							is_preview = false;
						}
					}			
					options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
					return {
						items: _self.files_file_menu_content(is_preview, fowner)
					}
				}
			});
		});	
		
		
		//페이징
		this.total_file_count = res.totalcount;
		this.total_page_count = this.get_page_count(this.total_file_count, this.per_page);
		if (this.disp_view_mode == "list"){
			this.initialize_page();
		}
				
		$("#wrap_files_data_list").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable: true
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : false,
		//	setTop : ($("#wrap_favorite_data_list").height()) + "px",
			callbacks : {
				onTotalScrollBackOffset: 100,
				onTotalScroll: function(){
					if (_self.disp_view_mode != "list"){
						page_no++;
						_self.add_files_data_list(page_no);
					}
				},
				onTotalScrollOffset: 100,
				alwaysTriggerOffsets:true
			}
		});
	},	
	
	"add_files_data_list" : function(page_no){
		var _self = this;
		var is_continue = false;
		if (this.disp_view_mode == "list"){
			is_continue = true;
		}else{
			if (this.cur_file_total_count > this.cur_file_count){
				is_continue = true;
			}
		}
		if (is_continue){
			this.start_skp = (parseInt(this.per_page) * (parseInt(page_no))) - (parseInt(this.per_page) - 1);
			var surl = gap.channelserver + "/channel_list.km";
			var postData = {
					"channel_code" : this.select_channel_code,
					"query_type" : this.cur_opt,
					"start" : (this.start_skp - 1).toString(),
					"perpage" : this.per_page,
					"q_str" : this.query_str,
					"dtype" : this.click_filter_image,
					"type" : "2"	//파일만
				};

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "text", //"json",
				data : JSON.stringify(postData),
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(__res){
					var res = JSON.parse(__res);
					if (res.result == "OK"){
						_self.cur_file_count += res.data.data.length;
						_self.cur_file_total_count = res.data.totalcount;
						_self.draw_files_data_list(page_no, res.data);	
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});		
		}		
	},
	
	"draw_file_detail_info" : function(info, ty){
		var _self = this;
		
		$("#main_body").css("width", "");   //댓글이 열릴때 가운데 컨텐츠 창을 줄여야 우측 프레임이 열린다.
		$("#channel_right").show();		
		_self.box_layer_close(); //우측 프레임을 연다
		
		//////////////////////////////////////////////////////////////////////////////////////////////////
		// 채널 전체/내가 올린/공유된/즐겨찾기 메뉴 : 좌측 파일정보 프레임이 안열려서 아래 코드 추가 - 2022.01.12
		if (this.check_selected_top_menu()){
			$("#main_body").css("width", "calc(100% - 365px)");   //댓글이 열릴때 가운데 컨텐츠 창을 줄여야 우측 프레임이 열린다.
			$("#sub_channel_content").css("width", "calc(100% - 315px)");
		}else{
			$("#main_body").css("width", "");   //댓글이 열릴때 가운데 컨텐츠 창을 줄여야 우측 프레임이 열린다.
		}
		//////////////////////////////////////////////////////////////////////////////////////////////////
		
		//미리보기 창이 떠 있는 경우 숨긴다.
		$("#channel_file_layer_close").click();

		this.select_file_info = info;
		
		if ($("#right_menu_collpase_btn").hasClass("on")){
			$("#right_menu_collpase_btn").click();
		}
		
		var owner_img = "";
		if (ty == "3"){
			owner_img = gap.person_profile_photo(gap.userinfo.rinfo);
		}else{
			owner_img = gap.person_profile_photo(info.owner);
		}
		
		
		
		
		var pinfo = info;
		if (typeof(info.id) != "undefined"){
			if (info.id.split("_").length > 1){
				//댓글에 첨부된 파일의 경우 예외처맇ㄴ다.
				info = info.info;
			}
		}else{
			info = pinfo;
		}
		
		
	//	var owner_img = gap.person_profile_uid(ty == "3" ? gap.search_cur_ky() : info.owner.ky);
		
		var filename = gap.get_bun_filename(info);	//info.filename;
		var size = gap.file_size_setting(parseInt(typeof info.file_size == "undefined" ? info.size.$numberLong : info.file_size.$numberLong));
		var ext = gap.is_file_type_filter(filename);
		var h = this.check_member_top_height();
		
		info = pinfo;
		
		var dis_date = gap.change_date_localTime_full2(info.GMT);
		if (ty == "3"){
			var name = gap.user_check(gap.userinfo.rinfo).name;
			var email = gap.userinfo.rinfo.em;
			
		}else{
			var name = gap.user_check(info.owner).name;
			var email = info.owner.ky;
		}
		
		
	
		
		var html = "";
		html += "<div class='detail-info' id='detail_info_dis' style='height:calc(100% - 10px); margin-top:5px'>";

		if (this.check_preview_file(filename) || ext == "movie" || ext == "img"){
				html += "<button class='ico btn-file-view' id='detail_file_info_preview' style='width:16px;height:16px;position:absolute;top:20px;right:45px;background-position: -652px -20px;'>미리보기</button>";			
		}
		html += "<button class='ico btn-right-close' id='detail_file_info_close'>닫기</button>";
		html += "<dl class='owner'>";
		html += "	<dt>";
		html += "		<div class='user'>";
		html += "			<div class='user-thumb showorg' data='" + (ty == "3" ? gap.search_cur_ky() : info.owner.ky) + "'>" + owner_img + "</div>";
		html += "		</div>";
		html += "	</dt>";
		html += "	<dd>";
		html += "		<span>" + name + "</span>";
		html += "		<div class='date'>" + dis_date + "</div>";
		html += "	</dd>";
		html += "</dl>";
		html += "<div class='file-info'>";

		if (info.thumbOK == "T"){
			var thumbnail_url = gap.search_file_convert_server(info.fserver) + "/FDownload_thumb.do?id=" + (ty == "2" ? info._id.$oid + "&md5=" + info.md5 : info._id.$oid) + "&ty=" + ty;
			html += "	<div class='file-thm'>";
			html += "		<img src='" + thumbnail_url + "' alt='' />";
			html += "	</div>";
		}
		
	/*	html += "	<div class='file-path'>";
		html += gap.lang.file_path + " : " + gFiles.get_file_path(info.drive_code, info.folder_code);
		html += "	</div>";*/

		if ( (typeof(info.meta) != "undefined") && (info.meta != "")){		
			html += "	<button class='ico btn-detail-open'>펼치기</button>";
			html += "	<a>" + filename + "<span>&nbsp;(" + size + ")</span></a>";
			html += "	<div class='file-info-detail'>";
			html += "		<table>";
			html += "			<tbody>";
			
			var metainfo = JSON.parse(info.meta);
			var file_type = gap.is_file_type(filename);
			metainfo.size = size;
			html += gap.draw_file_info(metainfo, file_type);
			
			
			if (typeof(info.drive_code) != "undefined"){
				html += "<tr>"
				html += "	<th colspan='2'>" + gap.lang.file_path + "</th>"
				html += "</tr>"
				html += "<tr>"
				html += "	<td colspan='2' style='padding-left:20px;'><strong>" + this.get_file_path(info.drive_code, info.folder_code) + "</strong></td>"
				html += "</tr>"
			}
						
				
			html += "			</tbody>";
			html += "		</table>";
			html += "	</div>";

		}else{
			html += "	<a class='no-meta'>" + filename + "<span>&nbsp;(" + size + ")</span></a>";
			html += "	<div class='file-info-detail'>";
			html += "		<table>";
			html += "			<tbody>";
			
			if (typeof(info.drive_code) != "undefined"){
				html += "<tr>"
				html += "	<th colspan='2'>" + gap.lang.file_path + "</th>"
				html += "</tr>"
				html += "<tr>"
				html += "	<td colspan='2' style='padding-left:20px;'><strong>" + this.get_file_path(info.drive_code, info.folder_code) + "</strong></td>"
				html += "</tr>"
			}
		
			
			html += "			</tbody>";
			html += "		</table>";
			html += "	</div>";			
		}
		html += "</div>";
		html += "</div>";
		
		$("#user_profile").hide();
		$("#chat_profile").hide();
		$("#detail_info_dis").remove();
		$(".channel-right-reply").remove();
		
		$("#channel_right").empty();
		$("#channel_right").append(html);
		
		$("#detail_file_info_close").off();
		$("#detail_file_info_close").on("click", function(e){
			_self.channel_right_frame_close();
		});
		
		$(".file-info .btn-detail-open").off();
		$(".file-info .btn-detail-open").on("click", function(e){	
			if ($(this).attr("class") == "ico btn-detail-open"){
				$(".file-info-detail").fadeOut();
				$(this).attr("class", "ico btn-detail-close");

			}else{
				$(".file-info-detail").fadeIn();
				$(this).attr("class", "ico btn-detail-open");
			}
		});
		
		$(".user-thumb.showorg").off().on("click", function(e){
			var ky = $(e.currentTarget).find("img").data("key");
			gap.showUserDetailLayer(ky);
		});
		
		$("#detail_file_info_preview").off();
		$("#detail_file_info_preview").on("click", function(e){
			
			var info = _self.select_file_info;
			//일반 파일 미리 보기 클릭 한  경우
			
			if (info.file_type == "mp4" || info.file_type == "mov"){
			//	var download_url = info.fserver + "/FDownload_thumb.do?id=" + (ty == "2" ? info._id.$oid + "&md5=" + info.md5 : info._id.$oid) + "&ty=" + ty;
				var download_url = gap.search_file_convert_server(info.fserver) + "FDownload.do?id=" + (ty == "2" ? info._id.$oid + "&md5=" + info.md5 : info._id.$oid) + "&ty=" + ty + "&ky="+gap.userinfo.rinfo.ky;
				gap.show_video(download_url, filename);		
				
			}else{
				
				
				var fserver = gap.search_file_convert_server(info.fserver);
				var fname = gap.get_bun_filename(info);	//info.filename;
				var md5 = info.md5;
			//	var id = (ty == "2" ? info.id : info._id.$oid);
				var id = info._id.$oid;
				var icon_kind = gap.file_icon_check(fname);
				var file_type = info.file_type;
				var upload_path = info.upload_path;
				
				if (typeof(info.id) != "undefined"){
					fname = gap.get_bun_filename(info.info);	//info.filename;
					md5 = info.info.md5;
					id = info.id;
					file_type = info.info.file_type;
					icon_kind = gap.file_icon_check(fname);
					ty = "reply";
					spl = info.id.split("_");
					upload_path = info.upload_path + "/reply/" + spl[1] + "_" + spl[2];
				}
				
				var pt = "";
				_self.file_convert(fserver, fname, md5, id, ty, file_type ,info.email, upload_path);	
					
			}
			return false;
		});
		
	},

	"draw_search_file_detail_info" : function(info, ty){
		var _self = this;
		var owner_img = "";
		
		this.select_file_info = info;
	
		if (ty == "3"){
			owner_img = gap.person_profile_photo(gap.userinfo.rinfo);
		}else{
			owner_img = gap.person_profile_photo(info.owner);
		}
	//	var owner_img = gap.person_profile_uid(ty == "3" ? gap.search_cur_ky() : info.owner.ky);
		var dis_date = gap.change_date_localTime_full2(info.GMT);
		var filename = info.filename;
		var size = gap.file_size_setting(parseInt(typeof info.file_size == "undefined" ? info.size.$numberLong : info.file_size.$numberLong));
		
		if (ty == "3"){
			var name = gap.user_check(gap.userinfo.rinfo).name;
			var email = gap.userinfo.rinfo.em;
			
		}else{
			var name = gap.user_check(info.owner).name;
			var email = info.owner.ky;
		}
		
		var html = "";
		html += "<div class='detail-info' id='detail_info_dis' style='height:100%;'>";
		html += "<dl class='owner'>";
		html += "	<dt>";
		html += "		<div class='user'>";
		html += "			<div class='user-thumb' data='" + (ty == "3" ? gap.search_cur_ky() : info.owner.ky) + "'>" + owner_img + "</div>";
		html += "		</div>";
		html += "	</dt>";
		html += "	<dd>";
		html += "		<span>" + name + "</span>";
		html += "		<div class='date'>" + dis_date + "</div>";
		html += "	</dd>";
		html += "</dl>";
		html += "<div class='file-info'>";

		if (info.thumbOK == "T"){
			var thumbnail_url = gap.search_file_convert_server(info.fserver) + "/FDownload_thumb.do?id=" + (ty == "2" ? info._id.$oid + "&md5=" + info.md5 : info._id.$oid) + "&ty=" + ty;
			html += "	<div class='file-thm'>";
			html += "		<img src='" + thumbnail_url + "' alt='' />";
			html += "	</div>";
		}

		if ( (typeof(info.meta) != "undefined") && (info.meta != "")){
			html += "	<button class='ico btn-detail-open'>펼치기</button>";
			html += "	<a>" + filename + "<span>&nbsp;(" + size + ")</span></a>";
			html += "	<div class='file-info-detail'>";
			html += "		<table>";
			html += "			<tbody>";
			
			var metainfo = JSON.parse(info.meta);
			var file_type = gap.is_file_type(filename);
			metainfo.size = size;
			html += gap.draw_file_info(metainfo, file_type);	
			
			html += "			</tbody>";
			html += "		</table>";
			html += "	</div>";

		}else{
			html += "	<a>" + filename + "<span>&nbsp;(" + size + ")</span></a>";
		}
		html += "</div>";
		html += "</div>";
		
		$("#ext_body").html(html);
	},	
	
	"check_preview_file" : function(file){
		var reg = /(.*?)\.(ppt|pptx|xls|xlsx|doc|docx|pdf|hwp|txt|zip|csv)$/;
	  	if(file.toLowerCase().match(reg)) {
			return true;
		} else {
			return false;
		}
	},	
	
	"channel_files_menu_content" : function(is_preview, fowner){
		var items = {};
		if (is_preview){
			items["preview"] = {name : gap.lang.preview};
		}
		items["favorite"] = {name : gap.lang.favorite};
		items["download"] = {name : gap.lang.download};
	//	items["copyurl"] = {name : gap.lang.copyurl};
		if (fowner == gap.search_cur_ky()){
			items["sep01"] = "-------------";
			items["delete"] = {name : gap.lang.basic_delete};
		}
		return items;
	},
	
	"context_menu_call_channel_files_mng" : function(key, options, _id, _fserver, _fname, _md5, _furl){
		if (key == "favorite"){
			gFiles.channel_favorite_file(_id, _md5);
			
		}else if (key == "preview"){
			gFiles.file_convert(_fserver, _fname, _md5, _id, "2");
			
		}else if (key == "download"){
			gap.file_download_normal(_furl, _fname);
			
		}else if (key == "copyurl"){
			gFiles.copy_file_url(_furl);
			
		}else if (key == "delete"){
			var _selector = options.$trigger.parent();
			var msg = gap.lang.confirm_delete;
			gap.showConfirm({
				title: "Confrim",
				contents: msg,
				callback: function(){
					var surl = gap.channelserver + "/delete_sub_file.km";
					var postData = {
							"id" : _id,
							"md5" : _md5,
							"ft" : gap.file_extension_check(_fname)
						};			
	
					$.ajax({
						type : "POST",
						url : surl,
						dataType : "json",
						data : JSON.stringify(postData),
						success : function(res){
							if (res.result == "OK"){
								_selector.remove();
								$('#grid_wrap').masonry('reloadItems');
								$('#grid_wrap').masonry('layout');
							}else{
								gap.gAlert(gap.lang.errormsg);
								return false;
							}
						},
						error : function(e){
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					});
				}
			});
			
			
//			$.confirm({
//				title : "Confirm",
//				content : msg,
//				type : "default",  
//				closeIcon : true,
//				closeIconClass : "fa fa-close",
//				columnClass : "s", 			 				
//				animation : "top", 
//				animateFromElement : false,
//				closeAnimation : "scale",
//				animationBounce : 1,	
//				backgroundDismiss: false,
//				escapeKey : false,
//				buttons : {		
//					confirm : {
//						keys: ['enter'],
//						text : gap.lang.OK,
//						btnClass : "btn-default",
//						action : function(){
//							var surl = gap.channelserver + "/delete_sub_file.km";
//							var postData = {
//									"id" : _id,
//									"md5" : _md5,
//									"ft" : gap.file_extension_check(_fname)
//								};			
//
//							$.ajax({
//								type : "POST",
//								url : surl,
//								dataType : "json",
//								data : JSON.stringify(postData),
//								success : function(res){
//									if (res.result == "OK"){
//										_selector.remove();
//										$('#grid_wrap').masonry('reloadItems');
//										$('#grid_wrap').masonry('layout');
//									}else{
//										gap.gAlert(gap.lang.errormsg);
//										return false;
//									}
//								},
//								error : function(e){
//									gap.gAlert(gap.lang.errormsg);
//									return false;
//								}
//							});
//						}
//					},
//					cancel : {
//						keys: ['esc'],
//						text : gap.lang.Cancel,
//						btnClass : "btn-default",
//						action : function(){
//						}
//					}
//				}		 			
//			});
			
		}
	},
	
	"channel_favorite_file" : function(_id, _md5){
		var surl = gap.channelserver + "/copy_favorite.km";
	/*	var postData = {
				"id" : _id,
			    "md5" : _md5, 
			    "type" : "2", 
			    "email" : gap.userinfo.rinfo.em, 
			    "fserver" : gap.channelserver 
			};*/
		
		var postData = {
				"id" : _id,
			    "md5" : _md5, 
			    "type" : "2", 
			    "fserver" : gap.channelserver 
			};	
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					gap.gAlert(gap.lang.added_favorite_menu);
					
				}else if (res.result == "EXIST"){
					gap.gAlert(gap.lang.exist_file); 
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;					
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},
	
	"copy_file_url" : function(_furl){
		var _textarea_id = '_hidden_textarea_clipboard';
		var _textarea = document.createElement("textarea");
		_textarea.id = _textarea_id;
		_textarea.style.position = 'fixed';
		_textarea.style.top = 0;
		_textarea.style.left = 0;
		_textarea.style.width = '1px';
		_textarea.style.height = '1px';
		_textarea.style.padding = 0;
		_textarea.style.border = 'none';
		_textarea.style.outline = 'none';
		_textarea.style.boxShadow = 'none';
		_textarea.style.background = 'transparent';
		document.querySelector("body").appendChild(_textarea);

		var _hidden_textarea = document.getElementById(_textarea_id);
		_hidden_textarea.value = _furl;
		_hidden_textarea.select();

		document.execCommand("copy");
		document.body.removeChild(_hidden_textarea);
		
		gap.gAlert(gap.lang.copy_url_clipboard);
	},
	
	"drive_fileupload_layer_html" : function(){
		var html = '';
		html += '<h2>' + gap.lang.drive_file_upload + '</h2>';
		html += '<button class="ico btn-close" id="close_drive_fileupload_layer">닫기</button>';
		html += '<div class="input-field select-share">';
		html += '	<h3>' + gap.lang.channel_to_share + '</h3>';
		html += '	<select id="share_channel_option_list">';
		html += '		<optgroup label="' + gap.lang.sharechannel + '">';
		html += '		</optgroup>';
		html += '	</select>';
		html += '</div>';
		html += '<div class="path" id="selected_path_layer">';
		html += '</div>';
		html += '<div class="wrap-upload-file">';
		html += '	<div class="upload-left">';
		html += '		<div class="input-field select-share">';
		html += '			<h3>' + gap.lang.mydrive + '</h3>';
		html += '			<select id="drive_option_list">';
		html += '			</select>';
		html += '		</div>';
		html += '		<ul class="attach-list drive-list" id="wrap_upload_folder_file_list" style="overflow-y:hidden;">';
		html += '			<div id="upload_folder_file_list">';
		html += '			</div>';
		html += '		</ul>';
		html += '	</div>';
		html += '	<div class="upload-right">';
		html += '		<h3>' + gap.lang.selected_file + '</h3>';
		html += '		<button class="btn-attach-del" id="delete_all_drive_fileupload_layer"><span>' + gap.lang.delete_all + '</span></button>';
		html += '		<div class="selected-files" id="selected_file_area">';
		html += '			<p>' + gap.lang.select_file_disp_upload_list + '</p>';
		html += '		</div>';
		html += '	</div>';
		html += '</div>';
		html += '<div class="input-field">';
		html += '	<textarea class="formInput" id="drive_upload_textarea" placeholder="' + gap.lang.input_message + '"></textarea>';
		html += '	<span class="bar"></span>';
		html += '</div>';
		html += '<div class="layer-bottom">';
		html += '	<button id="drive_fileupload_btn"><strong>' + gap.lang.upload + '</strong></button>';
		html += '	<button id="cancel_drive_fileupload_layer"><span>' + gap.lang.Cancel + '</span></button>';
		html += '</div>';
		
		return html;
	},
	
	"drive_file_upload" : function(){
		gFiles.init_select_drive_folder();
		
		var html = gFiles.drive_fileupload_layer_html();
		$("#drive_fileupload_layer").html(html);

		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#drive_fileupload_layer')
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();		
		
		//공유채널 리스트
		var channel_option_list = '';
		channel_option_list += '<optgroup label="'+gap.lang.sharechannel+'">';
		channel_option_list += '<option value="">'+gap.lang.channelchoice+'</option>';
		
		/*$("#share_channel_list .channel-code").each(function(idx){
			channel_option_list += '<option value="' + $(this).attr("id") + '">' + $(this).find("em").text() + '</option>';
		});*/
		
		for (var i = 0; i < gap.cur_channel_list_info.length; i++){
			var _info = gap.cur_channel_list_info[i];
			if (_info.type && _info.type == "folder"){
				//nothing
			}else{
				channel_option_list += '<option value="' + _info.ch_code + '">' + _info.ch_name + '</option>';
			}
		}
		
		channel_option_list += '</optgroup>';
		
		$("#share_channel_option_list").html(channel_option_list);
		$('#share_channel_option_list').val(gBody.select_channel_code);
		$('#share_channel_option_list').material_select();
		
		//드라이브 리스트
		var surl = gap.channelserver + "/api/files/drive_list_all.km";
	/*	var postData = JSON.stringify({
				"email" : gap.userinfo.rinfo.em,
				"depts" : gap.full_dept_codes()
			});*/
		
		var postData = JSON.stringify({});

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},			
			success : function(res){
				var drive_option_list = '';
				var drive_list = [];
				
				for (var i = 0; i < res.drive.length; i++){
					var _data = res.drive[i];
				//	if (_data.ch_share == "Y"){
						drive_option_list += '<option value="' + _data._id.$oid + '">' + _data.ch_name + '</option>';
						drive_list.push(_data);
				//	}
				}
				$("#drive_option_list").html(drive_option_list);
				$('#drive_option_list').material_select();
				$("#drive_option_list").on("change", function(){
					gFiles.select_drive_code = $(this).val();
					gFiles.select_drive_name = $('option:selected',this).text();
					gFiles.select_folder_code = "root";
					gFiles.select_folder_name = "";
					gFiles.title_path_code = [];
					gFiles.title_path_name = [];
					gFiles.drive_folder_file_list(1);
					$("#selected_path_layer").html("<strong>" + $('option:selected',this).text() + "</strong>");
				});
				
				//드라이브 내 폴더 및 파일 리스트
				var first_drive_code = drive_list[0]._id.$oid;
				if (typeof first_drive_code != "undefined"){
					gFiles.select_drive_code = first_drive_code;
					gFiles.select_drive_name = drive_list[0].ch_name;
					gFiles.drive_folder_file_list(1);
					$("#selected_path_layer").html("<strong>" + drive_list[0].ch_name + "</strong>");
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
		
		//버튼 처리
		$("#delete_all_drive_fileupload_layer").on("click", function(){
			$("#selected_file_area").html('<p>' + gap.lang.select_file_disp_upload_list + '</p>')
			$("input[name=check_upload]:checked").each(function() {
				$(this).prop("checked", false);
			});
		});
		$("#close_drive_fileupload_layer").on("click", function(){
			gFiles.init_select_drive_folder();
			gap.close_layer('drive_fileupload_layer');
		});	
		$("#cancel_drive_fileupload_layer").on("click", function(){
			gFiles.init_select_drive_folder();
			gap.close_layer('drive_fileupload_layer');
		});
		$("#drive_fileupload_btn").on("click", function(){
			if ($('#share_channel_option_list').val() == null){
				gap.gAlert(gap.lang.select_share_channel);
				return false;
			}
			if ($("#selected_upload_file_list").children().length == 0){
				gap.gAlert(gap.lang.select_upload_file);
				return false;
			}
			var upload_file_list = [];
			$("#selected_upload_file_list").children().each(function(idx){
				var file_id = $(this).attr("id").replace("upload_", "");
				upload_file_list.push(file_id);
			});
			
			var content = $('#drive_upload_textarea').val();
			var surl = gap.channelserver + "/drive_upload.km";
			var og = gBody3.og_search(content);
			
			var postData = {
					"id" : upload_file_list.join("-spl-"),
					"owner" : gap.userinfo.rinfo,
					"email" : gap.userinfo.rinfo.em,
					"ky" : gap.userinfo.rinfo.ky,
					"content" : content,
					"channel_code" : $('#share_channel_option_list').val(),
					"channel_name" : $('#share_channel_option_list option:selected').text(),
					"fserver" : gap.channelserver,
					"og" : og
				};			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "text",
				data : JSON.stringify(postData),
				success : function(ress){
					var res = JSON.parse(ress);
					if (res.result == "OK"){
					//	gFiles.draw_folder_file_list(page_no, res.data);
						gFiles.init_select_drive_folder();
						gap.close_layer('drive_fileupload_layer');
						
						//레이어 하단에 바로 전송한 정보를 표시해 주고 소켓으로 전달한다.
						gBody3.send_file_drive(res.data);
						
						//모바일로 Push를 전송해 준다.
						gBody3.mobile_push_drive(res.data);
						
						//현재 채널에 마지막 읽은 시간을 변경해준다.
						gap.change_cur_channel_read_time(gBody3.cur_opt, res.data.GMT2);
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			})					
		});
	},
	
	"init_select_drive_folder" : function(){
		gFiles.select_drive_code = "";
		gFiles.select_drive_name = "";
		gFiles.select_folder_code = "root";
		gFiles.select_folder_name = "";
		gFiles.title_path_code = [];
		gFiles.title_path_name = [];
	},

	"drive_folder_file_list" : function(page_no){
		if (page_no == 1){
			gFiles.start_page = "1";
			gFiles.cur_page = "1";
			gFiles.cur_file_count = 0;
			gFiles.cur_file_total_count = 0;
		}else{
			if (gFiles.cur_file_count == gFiles.cur_file_total_count){
				return false;
			}				
		}

		gFiles.start_skp = (parseInt(gFiles.per_page) * (parseInt(page_no))) - (parseInt(gFiles.per_page) - 1);
		var surl = gap.channelserver + "/folder_list.km";
	/*	var postData = {
				"ty" : (page_no == 1 ? "1" : "2"),
				"drive_key" : gFiles.select_drive_code,
				"parent_folder_key" : gFiles.select_folder_code,
				"email" : gap.userinfo.rinfo.em,
				"start" : (gFiles.start_skp - 1).toString(),
				"perpage" : gFiles.per_page,
				"dtype" : "",
				"q_str" : "",
				"depts" : gap.full_dept_codes()
			};*/
		
		var postData = {
				"ty" : (page_no == 1 ? "1" : "2"),
				"drive_key" : gFiles.select_drive_code,
				"parent_folder_key" : gFiles.select_folder_code,
				"start" : (gFiles.start_skp - 1).toString(),
				"perpage" : gFiles.per_page,
				"dtype" : "",
				"q_str" : ""
			};

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					gFiles.cur_file_count += res.data.datalist.length;
					gFiles.cur_file_total_count = res.data.totalcount;
					gFiles.draw_folder_file_list(page_no, res.data);
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		})		
	},
	
	"draw_folder_file_list" : function(page_no, res){
		gFiles.draw_selected_folder_path();
		
		if (page_no == 1){
			$("#upload_folder_file_list").empty();
			
		/*	
		 * 상위 폴더 이동 기능 - 일단 숨김
		 * if (typeof res.folderlist != "undefined"){
				// 상위폴더 이동
				var parent_folder_html = '';
				if (gFiles.select_folder_code != "root"){
					parent_folder_html += '<li class="folder-list" id="move_parent_folder">';
					parent_folder_html += '	<span class="ico ico-folder"></span>';
					parent_folder_html += '	<div class="attach-name folder-file"><span>' + gap.lang.parent_folder + '</span></div>';
					parent_folder_html += '</li>';
					
					$("#upload_folder_file_list").append(parent_folder_html);
					
					$("#move_parent_folder").on("click", function(){
						if (gFiles.title_path_code.length == 1){
							gFiles.select_folder_code = "root";
							gFiles.select_folder_name = "";
							gFiles.title_path_name = [];
							gFiles.title_path_code = [];
							gFiles.start_page = "1";
							gFiles.cur_page = "1";
							gFiles.drive_folder_file_list(1);
							
						}else{
							var array_cnt = gFiles.title_path_code.length;
							
							gFiles.select_folder_code = gFiles.title_path_code[array_cnt - 2];
							gFiles.select_folder_name = gFiles.title_path_name[array_cnt - 2];
							gFiles.title_path_name.pop();
							gFiles.title_path_code.pop();
							gFiles.start_page = "1";
							gFiles.cur_page = "1";
							gFiles.drive_folder_file_list(1);
						}
					});
				}
			}*/
			
			//폴더 리스트
			for (var i = 0; i < res.folderlist.length; i++){
				var folder_info = res.folderlist[i];
				var folder_id = folder_info._id.$oid;
				var folder_html = '';
				
				folder_html += '<li class="folder-list" id="fl_' + folder_id + '">';
			//	folder_html += '	<span class="ico ico-folder' + (folder_info.folder_share == "Y" ? "-share" : "") + '"></span>';
				folder_html += '	<span class="ico ico-folder"></span>';
				folder_html += '	<div class="attach-name folder-file"><span>' + folder_info.folder_name + '</span></div>';
				folder_html += '</li>';
				
				$("#upload_folder_file_list").append(folder_html);
				
				$("#fl_" + folder_id).on("click", function(){
					gFiles.select_folder_code = $(this).attr("id").replace("fl_", "");
					gFiles.select_folder_name = $(this).find(".attach-name span").text();
					gFiles.title_path_code.push(gFiles.select_folder_code);
					gFiles.title_path_name.push(gFiles.select_folder_name);
					
					gFiles.drive_folder_file_list(1);
				});
			}			
		}
		
		//파일 리스트
		for (var k = 0; k < res.datalist.length; k++){
			var file_info = res.datalist[k];
			var file_name = gap.get_bun_filename(file_info);	//file_info.filename;
			var icon_kind = gap.file_icon_check(file_name);
			var file_size = gap.file_size_setting(file_info.file_size.$numberLong);
			var file_html = '';
			
			file_html += '<li>';
			file_html += '	<div class="checkbox folder-file">';
			file_html += '		<label>';
			file_html += '			<input type="checkbox" name="check_upload" id="chk_' + file_info._id.$oid + '" value="' + file_info._id.$oid + '" fname="' + file_name + '" fsize="' + file_size + '"><span class="checkbox-material"><span class="check"></span></span>';
			file_html += '		</label>';
			file_html += '	</div>';
			file_html += '	<span class="ico ico-file ' + icon_kind + '"></span>';
			file_html += '	<div class="attach-name folder-file" title="' + file_name + '"><span>' + file_name + '</span><em>' + file_size + '</em></div>';
			file_html += '</li>';
			
			$("#upload_folder_file_list").append(file_html);
			
			$("#chk_" + file_info._id.$oid).on("click", function(){
				var file_id = $(this).attr("id").replace("chk_", "upload_");
				if ($(this).prop("checked")){
					var file_name = $(this).attr("fname");
					var icon_kind = gap.file_icon_check(file_name);
					var file_size = $(this).attr("fsize");
					var _html = '';
					if ($("#selected_file_area").children().eq(0).prop("tagName") == "P"){
						_html += '<ul class="attach-list drive-list" id="selected_upload_file_list">';
						_html += '	<li id="' + file_id + '">';
						_html += '		<span class="ico ico-file ' + icon_kind + '"></span>';
						_html += '		<div class="attach-name" title="' + file_name + '"><span>' + file_name + '</span><em>' + file_size + '</em></div>';
						_html += '		<button class="ico btn-delete" id="del_' + file_id + '">삭제</button>';
						_html += '	</li>';
						_html += '</ul>';
						$("#selected_file_area").html(_html);
						
					}else{
						_html += '<li id="' + file_id + '">';
						_html += '	<span class="ico ico-file ' + icon_kind + '"></span>';
						_html += '	<div class="attach-name" title="' + file_name + '"><span>' + file_name + '</span><em>' + file_size + '</em></div>';
						_html += '	<button class="ico btn-delete" id="del_' + file_id + '">삭제</button>';
						_html += '</li>';
						$("#selected_upload_file_list").append(_html);
					}
					$("#del_" + file_id).on("click", function(){
						var remove_file_id = $(this).parent().attr("id");
						var check_file_id = remove_file_id.replace("upload_", "chk_");
						$("#" + remove_file_id).remove();
						$("#" + check_file_id).prop("checked", false);
						if ($("#selected_file_area li").length == 0){
							$("#selected_file_area").html('<p>' + gap.lang.select_file_disp_upload_list + '</p>')
						}
					});
				}else{
					$("#" + file_id).remove();
				}
			});
		}
		
		$("#wrap_upload_folder_file_list").mCustomScrollbar('destroy');
		$("#wrap_upload_folder_file_list").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
			scrollButtons:{
				enable: true
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : true,
			setTop : ($("#wrap_upload_folder_file_list").height()) + "px",
			callbacks : {
				onTotalScroll: function(){
					page_no++;
					gFiles.drive_folder_file_list(page_no);
				},
				onTotalScrollOffset:100,
				alwaysTriggerOffsets:true
			}
		});	
	},
	
	"draw_selected_folder_path" : function(){
		var folder_code_list = gFiles.title_path_code;
		var folder_name_list = gFiles.title_path_name;
		
		if (folder_code_list.length > 0){
			var html = '<span ty="drive" data-id="' + gFiles.select_drive_code + '">' + gFiles.select_drive_name + '</span>';
			for (var i = 0; i < folder_code_list.length; i++){
				if (i == folder_code_list.length - 1){
					html += '<strong>' + folder_name_list[i] + '</strong>';
				}else{
					html += '<span ty="folder" data-id="' + folder_code_list[i] + '">' + folder_name_list[i] + '</span>';
				}
			}
			$("#selected_path_layer").html(html);
			
			$("#selected_path_layer span").on("click", function(){
				var ty = $(this).attr("ty");
				if (ty == "drive"){
					gFiles.select_folder_code = "root";
					gFiles.select_folder_name = "";
					gFiles.title_path_code = [];
					gFiles.title_path_name = [];
					gFiles.drive_folder_file_list(1);
					
				}else if (ty == "folder"){
					var idx = $.inArray($(this).attr("data-id"), folder_code_list);
					var tmp_code_list = [];
					var tmp_name_list = [];
					
					for (var k = 0; k < (idx + 1); k++){
						tmp_code_list.push(folder_code_list[k]);
						tmp_name_list.push(folder_name_list[k]);
					}
					gFiles.select_folder_code = $(this).attr("data-id");
					gFiles.select_folder_name = $(this).text();
					gFiles.title_path_code = tmp_code_list;
					gFiles.title_path_name = tmp_name_list;
					gFiles.drive_folder_file_list(1);
				}
			});
		}else{
			var html = '<strong>' + gFiles.select_drive_name + '</strong>';
			$("#selected_path_layer").html(html);
		}
	},
	
	"draw_exit_info_list" : function(ty){
		var html = '';
		html += '<h2>' + (ty == "1" ? gap.lang.exit_drive_list : gap.lang.exit_channel_list) + '</h2>';
		html += '<button class="ico btn-close" id="close_exit_info_layer">닫기</button>';
		html += '<ul class="folder-tree" id="exit_info_list">';
		html += '</ul>';
		html += '<div class="layer-bottom">';
//		html += '	<button><strong>' + gap.lang.OK + '</strong></button>';
		html += '	<button id="cancel_exit_info_layer"><span>' + gap.lang.Cancel + '</span></button>';
		html += '</div>';
		
		$("#exit_info_layer").html(html);

		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#exit_info_layer')
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();

		
		//나간 드라이브/채널 리스트 가져오기
		var surl = gap.channelserver + "/exit_list.km";
	/*	var postData = JSON.stringify({
				"ty" : ty
			});*/
		
		var postData = JSON.stringify({
			"ty" : ty
		});	

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					for (var i = 0; i < res.data.data.length; i++){
						var _info = res.data.data[i];
						var _html = '';
						_html += '<li>';
						if (ty == "1"){
							// 드라이브
							_html += '	<div style=""><span class="ico ico-drive' + (_info.ch_share == "Y" ? "-share" : "") + '-s"></span><span>' + _info.ch_name + '</span><button class="btn-entry" id="enter_' + _info.ch_code + '"><span>' + gap.lang.enter + '</span></button></div>';							
						}else{
							// 채널
							_html += '	<div style=""><span class="ico ico-' + (_info.ch_share == "Y" ? "people" : "person") + '" style="margin-top:12px;"></span><span style="padding-left:32px;">' + _info.ch_name + '</span><button class="btn-entry" id="enter_' + _info.ch_code + '"><span>' + gap.lang.enter + '</span></button></div>';							
						}

						_html += '</li>';
						$("#exit_info_list").append(_html);

						//등러가기 버튼 클릭
						$("#enter_" + _info.ch_code).bind("click", _info, function(event){
							gFiles.enter_info(event.data, ty);
						});
						
					}
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
		
		$("#close_exit_info_layer").on("click", function(){
			gap.close_layer('exit_info_layer');
		});
		$("#cancel_exit_info_layer").on("click", function(){
			gap.close_layer('exit_info_layer');
		});
	},
	
	"enter_info" : function(_info, _ty){
		var surl = gap.channelserver + "/enter_info.km";
	/*	var postData = JSON.stringify({
				"id" : _info.ch_code,
				"ty" : _ty,
				"email" : gap.userinfo.rinfo.em,
				"owner" : gap.userinfo.rinfo
			});	*/
		
		var postData = JSON.stringify({
			"id" : _info.ch_code,
			"ty" : _ty,
			"owner" : gap.userinfo.rinfo
		});
		
		var members = "";
		var xtype = "";

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					
					
					var _html = '';				
					
					if (_ty == "1"){
						
						xtype = "member_enter_drive"
						// 드라이브
						/*
						 * 나중에 지워도 됨.
						_html += '		<li id="li_dl_' + _info.ch_code + '">';
						_html += '			<div id="' + _info.ch_code + '" owner="' + _info.owner.em + '" class="drive-code"><span class="ico ico-drive' + (_info.ch_share == "Y" ? "-share" : "") + '"></span><em>' + _info.ch_name + '</em><button class="ico btn-more drive-area">더보기</button></div>';
						_html += '		</li>';*/
						
						_html += '		<li id="li_dl_' + _info.ch_code + '">';
						_html += '			<div id="main_' + _info.ch_code + '" owner="' + _info.owner.ky + '" class="drive-code" data="root">';
						_html += '				<span id="btn_fold_' + _info.ch_code + '"></span>';
						_html += '				<span class="ico ico-drive' + (_info.ch_share == "Y" ? "-share" : "") + '"></span><em style="padding-left:20px;">' + _info.ch_name + '</em>';
						_html += '				<button class="ico btn-more drive-area">더보기</button>';
						_html += '			</div>';
						_html += '		</li>';
						
						if (_info.ch_share == "Y"){
							$("#share_drive_list").append(_html);
							
						}else{
							$("#person_drive_list").append(_html);
						}
						
						//하위 폴더 그리기
						var res_list = [];
						var folder_list = gBody.cur_drive_folder_list_info;
						for (var i = 0; i < folder_list.length; i++){
							var folder_info = folder_list[i];
							if (_info.ch_code == folder_info.drive_key){
								res_list.push(folder_info);
							}
						}
						gFiles.draw_main_sub_folder(res_list);
						
						//전체 드라이브 정보 업데이트
						gFiles.update_drive_info();
						
						gFiles.__drive_left_event()
						
					}else if (_ty == "2"){
						
						xtype = "member_enter_channel"
						// 채널
						_html += '		<li id="li_cl_' + _info.ch_code + '" style="padding-left:45px;">';
						
						var dischname = _info.ch_name;
						if (_info.ch_name.length > gFiles.menu_length){
							dischname = _info.ch_name.substring(0,gFiles.menu_length) + "...";
						}
						_html += '			<div id="' + _info.ch_code + '" owner="' + _info.owner.ky + '" class="channel-code"><span class="ico ico-' + (_info.ch_share == "Y" ? "people" : "person") + '"></span><em>' + dischname + '</em><button class="ico btn-more channel-area">더보기</button></div>';
						_html += '		</li>';
						if (_info.ch_share == "Y"){
							$("#share_channel_list").append(_html);
							
						}else{
							$("#person_channel_list").append(_html);
						}
						gFiles.update_channel_info();
						
						gFiles.__channel_left_event();					
					}
					gap.close_layer('exit_info_layer');
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
				
			
				//같은 방의 멤버들에게 들어옴을 알린다..
				var mm = res.data.member;
				var lists = [];
				for (var i = 0 ; i < mm.length; i++){
					lists.push(mm[i].ky);
				}
				lists.push(res.data.owner.ky);

				var _noti = new Object();
				_noti.type = xtype;								
				_noti.p_code = _info.ch_code;			
				_noti.sender = lists;
				_noti.user = gap.userinfo.rinfo.ky;
				_noti.members = mm;
				_wsocket.send_box_msg(_noti, _noti.type);
				/////////////////////////////////////////////////////////////////////
				
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},
	
	"search_enter" : function(ty){
		var _self = this;
		
		this.query_str = $("#ch_query").val();
		if (ty == "d"){
			this.draw_drive_data(1);
			
		}else if (ty == "f"){
			this.draw_favorite_data(1);
			
		}else{
			this.draw_main_data(1);
		}
	},
	
	"file_convert" : function(fserver, fname, md5, item_id, ty, ft, email, upload_path){
		var _self = this;	
		var islog = true;
		var log = new Object();
		var filePath = "";
		
		this.callsys = ty;
		
		//미리보기 로그를 남겨야 한다. 하단에 file_info.km을 호출하는 경우 해당 함수에서 log:T인 경우 처리하기 되어 있어 추가하지 않는다.
		log.fserver = fserver;
		log.filename = fname;
		log.md5 = md5;
		log.item_id = item_id;
		log.ty = ty;
		log.ft = ft;
		log.email = email;
		log.upload_path = upload_path;
		log.actor = gap.userinfo.rinfo;
		log.action_os = "PC";
		//////////////////////////////////////////////////////////////////////////////	
		
		if (ty == "todo"){				
			if (gap.isDev){			
				filePath = gap.synapserver + gap.filesepa + fname.replace(gap.synapserver,"") + gap.filesepa + md5 + "." + ft;	
			}else{
				filePath = gap.synapserver + gap.filesepa + fname.replace(gap.nasfolder,"") + gap.filesepa + md5 + "." + ft;	
			}					
			log.action = "todo";
			log.filename = upload_path;
			log.upload_path = fname;
			log.fserver = email;		
		}else if (ty == "manual"){
			filePath = gap.synapserver + gap.filesepa + "upload"+gap.filesepa+"manual"+ gap.filesepa + upload_path + gap.filesepa + fname;	
			islog = false;			
		}else if (ty == "collect"){			
			var year = upload_path.substring(0,4);
			if (item_id == "response"){
				filePath = gap.synapserver + gap.filesepa +"upload"+gap.filesepa+"collect"+ gap.filesepa + year + gap.filesepa + upload_path + gap.filesepa + "response" + gap.filesepa + fname;
			}else{
				filePath = gap.synapserver + gap.filesepa + "upload"+gap.filesepa+"collect" + gap.filesepa + year + gap.filesepa + upload_path + gap.filesepa + fname;
			}
			log.action = "collect";			
		}else if (ty == "chat"){
			var inx = fname.indexOf("/filedown");
			var inx2 = fname.substring(inx+9, fname.length).lastIndexOf("/");
			var subpath = fname.substring(inx+9, fname.length).substring(0, inx2);
			subpath = subpath.replace(/\//gi, "\\\\");				
			if (gap.isDev){		
				filePath = gap.synapserver + gap.filesepa + "vol_epchat"+gap.filesepa+"data"+gap.filesepa+"upload_root" + subpath;
			}else{			
				filePath = gap.synapserver.replace("dswsynap","dswchat") + gap.filesepa + "data"+gap.filesepa+"upload_root" + subpath;				
				if (ft == "1" || ft == "3"){
					filePath = gap.synapserver + gap.filesepa + "vol_epchat"+gap.filesepa+"data"+gap.filesepa+"upload_root" + subpath;
				}
			}			
			log.upload_path = fname;
			log.filename = upload_path;
			log.md5 = md5;
			log.action = "chat";
		}else if (ty == "reply"){
			filePath = gap.synapserver + gap.filesepa + "upload"+gap.filesepa+ email + gap.filesepa  + upload_path + gap.filesepa + md5 + "." + ft;			
			log.upload_path = upload_path;
			log.filename = fname;
			log.md5 = md5;
			log.action = "reply";
		}else if (ty == "notice"){
			var file_ext = fname.substr(fname.lastIndexOf('.') + 1);
			filePath = gap.synapserver + gap.filesepa + "upload" + gap.filesepa + "notice" + gap.filesepa + email + gap.filesepa + upload_path + gap.filesepa + md5 + "." + file_ext;	
		}else{
			islog = false;
			//정보를 가져오지 못해서 찾아서 설정한다.
			var surl = gap.channelserver + "/file_info.km";
			var postData = {
				"id" : item_id,
				"md5" : md5,
				"ty" : ty,
				"log" : "T",
				"actor" : gap.userinfo.rinfo,
				"fname" : fname				
			};	
			$.ajax({
				type : "POST",
				url : surl,
				async : false,
				dataType : "json",
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){					
						var file_info = res.data;												
						//3 - 즐겨찾기 : dpath = dir + "/favorite/" + sdoc.getString("email") + "/" + sdoc.getString("upload_path") + "/" + sdoc.getString("md5") + "." + sdoc.getString("file_type");
						//2 - 채널 : dpath = dir + "/" + sdoc.getString("email") + "/" + sdoc.getString("upload_path") + "/" + xdoc.getString("md5") + "." + xdoc.getString("file_type");
						//1 - 드라이비 : dpath = sdoc.getString("fpath") + "/" + sdoc.getString("md5") + "." + sdoc.getString("file_type");
						//todo : dir + "/todo/" + id + "/" + xdoc.getString("md5") + "." + xdoc.getString("file_type");						
						if (_self.callsys == "1"){
							//드라이브인 경우
							filePath = gap.synapserver + gap.filesepa+ file_info.fpath.replace(gap.nasfolder,"").replace(gap.synapserver, "") + gap.filesepa + file_info.md5 + "." + file_info.file_type;	
						}else if (_self.callsys == "2"){
							//채널
							filePath = gap.synapserver + gap.filesepa + "upload" + gap.filesepa + file_info.owner.ky + gap.filesepa + file_info.upload_path + gap.filesepa + file_info.md5 + "." + file_info.file_type;	
						}else if (_self.callsys == "3"){
							//즐겨찾기
							filePath = gap.synapserver + gap.filesepa + "upload"+gap.filesepa+"favorite"+ gap.filesepa + file_info.email + gap.filesepa + file_info.upload_path + gap.filesepa + file_info.md5 + "." + file_info.file_type;	
						}			
						if (_self.callsys == "todo"){
							gap.hide_loading2();
						}else if (_self.call_system == "admin"){
						}else{
							gap.hide_loading();
						}
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
		}
		
		if (islog){
			//로그를 서버에 전송한다.		
		//	if (gBody3.call_system == "admin"){
				//관리자 모듈에서 보는 로그는 기록하지 않는다.
		//	}else{
				var surl = gap.channelserver + "/preivew_log.km";			
				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(log),
					success : function(res){
					},
					error : function(e){}
				});
		//	}		
		}		
		gap.call_synap(md5, filePath, fname, "F");		
		return false;					
	},	
	
	
	
	"get_page_count" : function(doc_count, rows){
	//	return ret_page_count = Math.floor(gFiles.total_file_count / rows) + (((gFiles.total_file_count % rows) > 0) ? 1 : 0);
		return ret_page_count = Math.floor(doc_count / rows) + (((doc_count % rows) > 0) ? 1 : 0);
	},
	
	"initialize_page" : function(){
		var _self = this;
		var alldocuments = gFiles.total_file_count;
		
		if (alldocuments % this.per_page > 0 & alldocuments % this.per_page < this.per_page/2 ){
			this.all_page = Number(Math.round(alldocuments/this.per_page)) + 1
		}else{
			this.all_page = Number(Math.round(alldocuments/this.per_page))
		}	

		if (this.start_page % this.per_page > 0 & this.start_page % this.per_page < this.per_page/2 ){
			this.cur_page = Number(Math.round(this.start_page/this.per_page)) + 1
		}else{
			this.cur_page = Number(Math.round(this.start_page/this.per_page))
		}

		this.initialize_navigator();		
	},
	
	"initialize_navigator" : function(){
		var _self = this;
		var alldocuments = this.total_file_count;

		if (this.total_page_count == 0){
			this.total_page_count = 1;
		}

		if (alldocuments == 0){
			alldocuments = 1;
			this.total_page_count = 1;
			this.cur_page = 1;
		}

		if (alldocuments != 0) {
			if (this.total_page_count % 10 > 0 & this.total_page_count % 10 < 5 ){
				var all_frame = Number(Math.round(this.total_page_count / 10)) + 1
			}else{
				var all_frame = Number(Math.round(this.total_page_count / 10))	
			}

			if (this.cur_page % 10 > 0 & this.cur_page % 10 < 5 ){
				var c_frame = Number(Math.round(this.cur_page / 10)) + 1
			}else{
				var c_frame = Number(Math.round(this.cur_page / 10))
			}

			var nav = new Array();
			if (c_frame == 1){
				nav[0] = '';
			}else{
				nav[0] = '<li class="p-prev" onclick="gFiles.goto_page(' + ((((c_frame-1) * 10) - 1)*this.per_page + 1) + ',' + ((c_frame - 1) * 10) + ');"><span>이전</span></li>';
			}			

			var pIndex = 1;
			var start_page = ((c_frame-1) * 10) + 1;

			for (var i = start_page; i < start_page + 10; i++){
				if (i == this.cur_page){
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
						nav[pIndex] = '<li onclick="gFiles.goto_page(' + (((i-1) * this.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
					}else{
						if (i % 10 == '1' ){
							nav[pIndex] = '<li onclick="gFiles.goto_page(' + (((i-1) * this.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}else{
							nav[pIndex] = '<li onclick="gFiles.goto_page(' + (((i-1) * this.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}
					}
				}				

				if (i == this.total_page_count) {
					break;
				}
				pIndex++;				
			}

			if (c_frame < all_frame){
				nav[nav.length] = '<li class="p-next" onclick="gFiles.goto_page(' + ((c_frame * this.per_page * 10) + 1) + ',' + ((c_frame * 10) + 1) + ');"><span>다음</span></li>';
			}
			var nav_html = '';

			if (c_frame != 1 ){
				nav_html = '<li class="p-first" onclick="gFiles.goto_page(1,1);"><span>처음</span></li>';
			}		    
			for( var i = 0 ; i < nav.length ; i++){	
				nav_html += nav[i];
			}
					
			nav_html += "</TD>"; 

			if (c_frame < all_frame){
				nav_html += '<li class="p-last" onclick="gFiles.goto_page(' + ((this.all_page - 1) * this.per_page + 1) + ',' + this.all_page + ')"><span>마지막</span></li>';
			}
			$("#paging_area").html(nav_html);
		}		
	},
	
	"goto_page" : function(idx, page_num){
		var _self = this;
		
		if (this.total_file_count < idx) {
			this.start_page = idx - 10;
			if ( this.start_page < 1 ) {
				return;
			}
		}else{
			this.start_page = idx;
		}
		cur_page = page_num;
		
		if (this.select_files_tab){
			// Files 탭이 클리된 경우
			this.add_files_data_list(page_num);
			
		}else if (this.cur_opt == "favoritecontent"){
			// 즐겨찾기
			this.add_favorite_data_list(page_num);
			
		}else{
			// 드라이브
			if (gap.cur_window == "drive" && this.select_left_menu != ""){
				// 전체 / 내가올린/ 공유된 / 즐겨찾기
				this.add_main_data_list(page_num);
				
			}else{
				this.add_drive_data_list(page_num);
			}
		}
	},
	
	
	/*
	 * 
	 * 
	 * 
	 * 
	 * 통합 검색 관련 함수 시작
	 */
	"draw_empty_search_content" : function(){
		var is_empty = ($("#ext_body_search").find('div.msg-empty').length == 0 ? true : false);
		if (is_empty){
			var empty_html = '';
			empty_html += '<div class="msg-empty">';
			empty_html += '	<img src="' + window.root_path + '/resource/images/doc.png" alt="" />';
			empty_html += gap.lang.click_search_result;
			empty_html += '</div>';
			$("#ext_body_search").html(empty_html);				
		}
	},
	
	"box_search" : function(query, category, page_no){
		
		var html = "";
		html += "<span class='result_txt'>";
		html += "	<span id='ts_result_txt'></span>";
		html += "</span>";
		html += "<div class='tab' id='portal_tab'>";
		html += "	<ul style='list-style:none'>";
		html += "		<li class='on' id='ts_all'>" + gap.lang.All + "</li>";
		html += "		<li id='ts_channel'>"+ gap.lang.channel +"</li>";
		html += "		<li id='ts_drive'>"+ gap.lang.drive +"</li>";
		html += "		<li id='ts_favorite'>"+ gap.lang.favorite +"</li>";
		html += "	</ul>";
		html += "</div>";
		html += "<div class='tab_cont all' id='wrap_box_search_list' style='height:calc(100% - 230px);'>";
		html += "	<div class='result_list' style='overflow:hidden;' id='box_search_list'>";
		
		html += "	</div>";
		html += "</div>";
			
		
		$("#portal_search_result").html(html);
		
		gFiles.box_search_data(query, category, page_no);
		
		// Tab 클릭 이벤트 처리
		$("#portal_tab li").on("click", function(e){
			var ts_categry = $(this).attr("id").replace("ts_", "");
			gTop.select_search_type = "1";			
			$("#portal_tab li").removeClass("on");
			$(this).addClass("on");
			
			gFiles.box_search_data(gFiles.ts_query, ts_categry, 1);
		});
		
		
		return false;
		var _html = '';

		_html += '<div class="chat-area">';
		_html += '	<div class="channel-header">';
		_html += '		<h2 id="ts_result_txt"></h2>';
		_html += '		<div class="channel-tab">';
		_html += '			<ul id="ts_result_tabs" class="tabs">';
		_html += '				<li class="tab" id="ts_all"><a href="" class="active">' + gap.lang.All + '</a></li>';
		_html += '				<li class="tab" id="ts_channel"><a href="#">' + gap.lang.channel + '</a></li>';
		_html += '				<li class="tab" id="ts_drive"><a href="#">' + gap.lang.drive + '</a></li>';
		_html += '				<li class="tab" id="ts_favorite"><a href="#">' + gap.lang.favorite + '</a></li>';
		_html += '			</ul>';
		_html += '		</div>';
/*		_html += '		<div class="drive-btns">';
		_html += '			<button class="btn-align on"><span>생성순-정렬</span></button> <!-- 클릭 시 on 클래스 토글 -->';
		_html += '		</div>';*/
		_html += '	</div>';
		_html += '	<div class="wrap-channel" id="wrap_box_search_list" style="height:100%;">';
		_html += '		<ul class="list line2" id="box_search_list" style="margin-top:0;"> <!-- 오른쪽 영역 클릭 시 line2 클래스 추가 -->';
		_html += '		</ul>';
		_html += '	</div>';
		_html += '</div>';

		$("#box_search_content").html(_html);
		$('.channel-header .tabs').tabs();
		
		gFiles.box_search_data(query, category, page_no);
		
		// Tab 클릭 이벤트 처리
		$(".channel-tab li").on("click", function(){
			var ts_categry = $(this).attr("id").replace("ts_", "");
			gTop.select_search_type = "1";
			gFiles.box_search_data(gFiles.ts_query, ts_categry, 1);
		});
	},
	
	"box_search_data" : function(query, category, page_no){
		
		if (page_no == 1){
			gFiles.ts_query = query;
			gFiles.ts_category = category;
			gFiles.cur_file_count = 0;
			gFiles.cur_file_total_count = 0;
			$("#box_search_list").empty();
		}
		gFiles.draw_empty_search_content();
		gFiles.start_skp = (parseInt(gFiles.ts_per_page) * (parseInt(page_no))) - (parseInt(gFiles.ts_per_page) - 1);
		
		var surl = gap.channelserver + "/msearch.km";
	/*	var postData = JSON.stringify({
				"q_str" : gFiles.ts_query.toLowerCase(),
				"email" : gap.search_cur_em(),
				"channels" : gFiles.my_channel_info,
				"drives" : gFiles.my_drive_info,
				"folders" : gFiles.my_folder_info,
				"category" : gFiles.ts_category,
				"gubun" : gTop.select_search_type,
				"start" : (gFiles.start_skp - 1).toString(),
				"perpage" : gFiles.ts_per_page
			});	*/
		
		var postData = JSON.stringify({
			"q_str" : gFiles.ts_query.toLowerCase(),
			"channels" : gFiles.my_channel_info,
			"drives" : gFiles.my_drive_info,
			"folders" : gFiles.my_folder_info,
			"category" : gFiles.ts_category,
			"gubun" : gTop.select_search_type,
			"start" : (gFiles.start_skp - 1).toString(),
			"perpage" : gFiles.ts_per_page
		});

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					gFiles.cur_file_count += res.data.hits.hits.length;
					gFiles.cur_file_total_count = res.data.hits.total;
					gBody3.draw_box_search_list(page_no, res.data.hits.hits);
					
					// 검색결과 카운트 표시
					var ts_result_html = gap.lang.searchresultcount;
					ts_result_html = ts_result_html.replace("-qry-", '"<strong>' + query + '</strong>"');
					ts_result_html = ts_result_html.replace("-cnt-", res.data.hits.total);
					$("#ts_result_txt").html(ts_result_html);
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},	
	
	
	
	"add_box_search_list" : function(page_no){
		if (gFiles.cur_file_total_count > gFiles.cur_file_count){
			gFiles.start_skp = (parseInt(gFiles.ts_per_page) * (parseInt(page_no))) - (parseInt(gFiles.ts_per_page) - 1);
			
			var surl = gap.channelserver + "/msearch.km";
		/*	var postData = JSON.stringify({
					"q_str" : gFiles.ts_query.toLowerCase(),
					"email" : gap.search_cur_em(),
					"channels" : gFiles.my_channel_info,
					"drives" : gFiles.my_drive_info,
					"folders" : gFiles.my_folder_info,
					"category" : gFiles.ts_category,
					"gubun" : gTop.select_search_type,
					"start" : (gFiles.start_skp - 1).toString(),
					"perpage" : gFiles.ts_per_page
				});*/
			
			var postData = JSON.stringify({
				"q_str" : gFiles.ts_query.toLowerCase(),
				"channels" : gFiles.my_channel_info,
				"drives" : gFiles.my_drive_info,
				"folders" : gFiles.my_folder_info,
				"category" : gFiles.ts_category,
				"gubun" : gTop.select_search_type,
				"start" : (gFiles.start_skp - 1).toString(),
				"perpage" : gFiles.ts_per_page
			});

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : postData,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){
					if (res.result == "OK"){
						gFiles.cur_file_count += res.data.hits.hits.length;
						gFiles.cur_file_total_count = res.data.hits.total;
						gBody3.draw_box_search_list(page_no, res.data.hits.hits);
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});			
		}		
	},
	
	"show_search_content" : function(obj){
		var _self = this;
		var obj = $(obj).parent().parent();
		var item_type = obj.attr("itemty");
		
		if (item_type == "msg" || item_type == "reply"){
			var id = (item_type == "msg" ? obj.attr("id") : obj.attr("cdataid"));
			var surl = gap.channelserver + "/file_info_all.km";
			var postData = JSON.stringify({
					"id" : id
				});			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : postData,
				success : function(res){
					if (res.result == "OK"){
						var info = res.data
						var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(info.GMT));
						var disp_time = gap.change_date_localTime_only_time(String(info.GMT));
						var docid = "";		
						var like_count = 0;

						// 메일은 바로 레이어를 오픈
						if (info.ex != undefined && info.ex.type == "mail"){
							var tunid = info.ex.target_unid;
							var tdb = info.ex.target_db;
							var tserver = info.ex.target_server;
							
							gBody4.openMail(tunid, 'body', tdb, tserver);
							return false;
						}
						
						if ($("#ext_body_search").attr("class") == "right-area view-info"){
							$("#ext_body_search").removeClass("view-info");
							$("#ext_body_search").addClass("channel view-info chat-area");
						}
						$("#ext_body_search").css("padding-right", "10px");
						
						if (info.direct == "T"){
							docid = item._id;
							
						}else{
							docid = info._id.$oid;
							if (info.like_count.$numberLong != undefined){
								like_count = info.like_count.$numberLong;

							}else{
								like_count = info.like_count;
							}
						}
						
					//	var person_img = info.owner.pu;
						var person_img = gap.person_profile_photo(info.owner);
						var user_info = gap.user_check(info.owner);
						var name = user_info.name;
						var deptname = user_info.dept;
						
						var messagex = info.content;
						var rcount = messagex.split(/\r\n|\r|\n/).length;
						var mcount = messagex.length;
						var rdis = false;
						if ((rcount > 10) || (mcount > 800)){
							rdis = true;
						}
						
						var message = gBody3.message_check(messagex);
						message = gap.textToHtml(message).replace(/&nbsp;/g, " ");
						if ((info.editor != undefined) && (info.editor != "")){
							var editor_html = info.editor.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
							message = message + editor_html;
						}

						var html = '';
						
						html += '<div id="ts_content" style="height:100%;margin-top:20px;">';
						html += '<div class="wrap-channel" id="wrap_search_content">';
						html += '	<div class="' + (info.owner.ky == gap.search_cur_ky() ? "me" : "you") + '" style="margin-top:0;">';
						html += '		<div class="user">';
						html += '			<div class="user-thumb">' + person_img + '</div>';
						html += '		</div>';
						html += '		<div class="talk">';
						html += '			<br>';
						html += '			<div class="wrap-message" style="margin-bottom:30px;">';
						html += '				<div class="balloon">';
						html += '					<div>';
						html += '						<span class="name">' + name + '<em class="team">' + deptname + '</em><em class="time">' + disp_date + ' ' + disp_time + '</em></span>';
						html += '						<span class="channel-name">' + info.channel_name + '</span>';
						
						if (info.type == "emoticon"){
							html += '						<div><img src="' + info.epath + '"></div>';
						}
						
						if ((info.editor != undefined) && (info.editor != "")){
							html += '						<h3 class="ts-result-content">' + info.title + '</h3>';
							html += '						<div class="wrap-editor-area ts-result-content">';
							html += '							<p>' + message + '</p>';
							html += '						</div>';
							
						}else{
							if (rdis){
								html += '						<p class="msg-fold ts-result-content">' + message + '</p>';
								html += '						<span class="fold-btns" style="cursor:pointer"><button class="btn-expand"><span>' + gap.lang.expand + '</span></button></span>';
								
							}else{
								html += '						<p class="ts-result-content">' + message + '</p>';
							}
						}
												
						if ((info.og != undefined) && (info.og.msg != undefined)){
							var og = info.og.ex;
							if (og != undefined){
								var imgurl = og.img;
								var title = og.tle;
								var url = og.lnk;
								var desc = og.desc;
								var dmn = (og.dmn != undefined ? og.dmn : url);
							//	var emppath = window.root_path + "/resource/images/thm_link.png";
								var im = gap.og_url_check(imgurl);

								html += '<div class="link-content">';
								html += '	<a href="' + url + '" target="_blank">';
								html += '		<div class="link-thumb">' + im + '</div>';
								html += '		<ul>';
								html += '			<li class="link-title">' + title + '</li>';
								html += '			<li class="link-summary">' + desc + '</li>';
								html += '			<li class="link-site">' + dmn + '</li>';
								html += '		</ul>';
								html += '	</a>';
								html += '</div>';
							}
							
						}else if (info.ex != undefined){
							if (info.ex.type == "mail"){
								var from = info.ex.sender;
								var title = info.ex.title;
								
								var tunid = info.ex.target_unid;
								var tdb = info.ex.target_db;
								var tserver = info.ex.target_server;
								
								var attach_list = info.ex.attach.split("*?*");
								var attach_size = info.ex.attachsize.split("*?*");
								var acount = 0;
								if (info.ex.attach != ""){
									acount = attach_list.length;
								}
								
								html += "<div class='chat-mail'>";
								html += "<div>";
								html += "	<span class='ico ico-mail'></span>";
								html += "	<dl style='cursor:pointer' onclick=\"gBody4.openMail('" + tunid + "','body', '" + tdb + "', '" + tserver + "')\">";
								html += "		<dt>" + from + "</dt>";
								html += "		<dd>" + title + "</dd>";
								html += "	</dl>";
								
								if (acount > 0){
									html += "	<div class='mail-attach-list'>";
									html += "		<button class='ico btn-fold'>접기</button> <!-- 클릭 시 .on 클래스 토글 -->";
									html += "		<h4>" + gap.lang.attachment + " <span>" + acount + "</span></h4>";
									html += "		<ul>";	
									
									for (var i = 0 ; i < attach_list.length ; i++){
										var attname = attach_list[i];
										var attsize = attach_size[i];
										var icon = gap.file_icon_check(attname);
										var target_server = info.ex.target_server;
									
										html += "			<li data-target='"+target_server+"' data-tunid='"+tunid+"' data-attname='"+attname+"' data-tdb='"+tdb+"' onclick=\"gBody3.mail_file_down2(this)\"><span class='ico ico-attach " + icon + "'></span><span>" + attname + "</span><em>(" + gap.file_size_setting(attsize) + ")</em>";
									//	html += "			<li onclick=\"gBody3.mail_file_down('" + tunid + "','" + attname + "', '" + tdb + "')\"><span class='ico ico-attach " + icon + "'></span><span>" + attname + "</span><em>(" + gap.file_size_setting(attsize) + ")</em>";
										html += "			</li>";
									}
									html += "		</ul>";
									html += "	</div>";
								}
								html += "	</div>";
								html += "</div>";
							}
						}
						
						// 파일 처리
						if (info.info != undefined){
							var files = info.info;
							var image_files = new Array();
							var normal_files = new Array();
							
							for (var i = 0; i < files.length; i++){
								var file = files[i];
								var isImage = gap.check_image_file(file.filename);
								if (isImage){
									image_files.push(file);
								}else{
									normal_files.push(file);
								}
							}
							
							//이미지 파일일 경우 표시하기
							if (image_files.length > 0){
								for (var i = 0; i < image_files.length; i++){
									var image = image_files[i];
									var size = gap.file_size_setting(parseInt(image.file_size.$numberLong));
									var image_url = gap.search_file_convert_server(info.fserver) + "/FDownload_thumb.do?id=" + docid + "&md5=" + image.md5 + "&ty=2";
									
									html += "<div class='img-content' id='msg_file_"+ docid + "_" + image.md5.replace(".","_")+"'>";		
									html += "	<div class='img-thumb'>";
									html += "		<img src='" + image_url + "' data='" + image.filename + "' data1='" + image.md5 + "' data2='" + image.file_type + "' data3='" + docid + "'  data4='" + info.email + "' data5='" + info.channel_code + "' data8='" + info.channel_name + "'>";
									html += "	</div>";
									html += "	<ul>";
									html += "		<li class='img-title'>" + image.filename + "</li>";
									html += "		<li class='img-size'>" + size + "</li>";
									html += "		<li class='img-btns'>";
									html += "   		<button class='ico btn-view'>크게보기</button>";
									html += "   		<button class='ico btn-download' title='" + gap.lang.download + "'>다운로드</button>";
									html += "   		<button class='ico btn-more'>더보기</button>";
									html += "   	</li>";
									html += "	</ul>";
									html += "</div>";
								}
							}
							
							
							//일반 파일일 경우 표시하기
							if (normal_files.length > 0){
								html += '<ul class="message-file">';
								
								for (var i = 0 ; i < normal_files.length; i++){
									var file_info = normal_files[i];
									var fname = file_info.filename;
									var md5 = file_info.md5;
									var fsize = gap.file_size_setting(parseInt(file_info.file_size.$numberLong));
									var add_dt_html = "data1='" + info.fserver + "' data2='" + info.upload_path + "' data3='" + file_info.md5 + "' data4='" + info.email + "' data5='" + file_info.file_type + "' data6='" + docid + "' data7='" + info.channel_code + "' data8='" + info.channel_name + "' title='" + file_info.filename + "'"
									var icon_kind = gap.file_icon_check(fname);
									var show_video = gap.file_show_video(fname);
									
									html += '	<li id="msg_file_' + docid + '_' + md5.replace('.', '_') + '">';
									html += '		<div class="chat-attach">';
									html += '			<div>';
									html += '				<span class="ico ico-file ' + icon_kind + '"></span>';
									html += '				<dl>';
									html += '					<dt ' + add_dt_html + '>' + fname + '</dt>';
									html += '					<dd>' + fsize + '</dd>';
									html += '				</dl>';
									
									if (_self.check_preview_file(fname)){
										html += '				<button class="ico btn-file-view">파일보기</button>';
									}else if (show_video){
										html += '				<button class="ico btn-file-view">파일보기</button>';
									}
									
									html += '				<button class="ico btn-file-view">파일보기</button>';
									html += '				<button class="ico btn-file-download">다운로드</button>';
									html += '				<button class="ico btn-more">더보기</button>';
									html += '			</div>';
									html += '		</div>';
									html += '	</li>';								
								}
								html += '</ul>';								
								
							}
						}
				
						// reply 처처리
						if (info.reply != undefined){
							if (info.reply.length > 0){
								html += '<div class="message-reply">';
								
								for (var i = 0; i < info.reply.length; i++){
									var reply_info = info.reply[i];
									var reply_disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(reply_info.GMT));
									var reply_disp_time = gap.change_date_localTime_only_time(String(reply_info.GMT));
									var reply_content = gBody3.message_check(reply_info.content);
									var reply_person_img = gap.person_profile_photo(reply_info.owner);
									var reply_owner_info = gap.user_check(reply_info.owner);

									html += '	<dl>';
									html += '		<dt>';
									html += '			<div class="user">';
									html += '				<div class="user-thumb">' + reply_person_img + '</div>';
									html += '			</div>';
									html += '		</dt>';
									html += '		<dd>';
									html += '			<span>' + reply_owner_info.name + '<em class="team">' + reply_owner_info.dept + '</em><em>' + reply_disp_date + ' ' + reply_disp_time + '</em></span>';
									html += '			<p class="ts-result-content">' + reply_content + '</p>';
									html += '		</dd>';
									html += '	</dl>';
								}
								html += '</div>';
							}							
						}

						
						html += '						<ul class="message-btns">';
					//	html += '							<li><button class="ico btn-reply" title="' + gap.lang.reply + '"></button><span>' + (info.reply != undefined ? info.reply.length : "0") + '</span></li>';
						html += '							<li><button class="ico btn-like" title="' + gap.lang.like + '" onclick="gBody3.like_channel_data(\'' + docid + '\', \'' + info.email.toLowerCase() + '\')"></button><span id="like_' + docid + '">' + like_count + '</span></li>';
						if (info.email.toLowerCase() == gap.userinfo.rinfo.em.toLowerCase()){
							html += '							<li><button class="ico btn-del" title="' + gap.lang.basic_delete + '" onclick="gBody3.delete_channel_data(\'' + docid + '\', \'' + info.channel_code + '\', \'' + info.channel_name + '\')"></button></li>';
					//		html += '							<li><button class="ico btn-edit" title="' + gap.lang.basic_modify + '" onclick="gBody3.edit_channel_data(\'' + docid + '\', \'' + info.channel_code + '\', \'' + info.channel_name + '\')"></button></li>';
						}
						html += '						</ul>';
						html += '					</div>';
						html += '				</div>';
						html += '			</div>';
						html += '		</div>';
						html += '	</div>';
						html += '</div>';
						html += '</div>';
							
						$("#ext_body_search").css("padding-top", "0px");
						$("#ext_body_search").html(html);
						
												
						var html = "";
						html += "<div class='info_pop'>";
						html += "	<div class='info_pop_inner'>";
						html += "		<div class='l_img_box prof' style='height:46px'>";
						html += "			 "+person_img;
						html += "		 </div>";

						html += "		 <div class='result_box' style='margin-bottom:50px'>";
						html += "			<div class='w_info'>";
						html += "				 <div class='flex'>";
						html += "					<p class='f_in name'>"+name+ " " + deptname + "</p>";
						html += "					<p class='f_in time'>"+disp_date + ' ' + disp_time +"</p>";
						html += "					<p class='red_txt'>"+info.channel_name+"</p>";
						html += "				</div>"; 
//						html += "				<div class='re_txt'>";
//						html += "					"+message;
//						html += "				</div>";			
						html += "			</div>";					
						html += "		</div>";
			//			html += "		 <button type='button' class='close_btn'></button>";
			//			html += "		<textarea rows='' cols=''></textarea>";
						
						
						if (info.type == "emoticon"){
							html += '						<div><img src="' + info.epath + '"></div>';
						}						
						if ((info.editor != undefined) && (info.editor != "")){
							html += '						<h3 class="ts-result-content">' + info.title + '</h3>';
							html += '						<div class="wrap-editor-area ts-result-content">';
							html += '							<p>' + message + '</p>';
							html += '						</div>';							
						}else{
							if (rdis){
								html += '						<p class="msg-fold ts-result-content">' + message + '</p>';
								html += '						<span class="fold-btns" style="cursor:pointer"><button class="btn-expand"><span>' + gap.lang.expand + '</span></button></span>';
								
							}else{
								html += '						<p class="ts-result-content">' + message + '</p>';
							}
						}					
						
						
						if ((info.og != undefined) && (info.og.msg != undefined)){
							var og = info.og.ex;
							if (og != undefined){
								var imgurl = og.img;
								var title = og.tle;
								var url = og.lnk;
								var desc = og.desc;
								var dmn = (og.dmn != undefined ? og.dmn : url);
							//	var emppath = window.root_path + "/resource/images/thm_link.png";
								var im = gap.og_url_check(imgurl);

								html += '<div class="link-content">';
								html += '	<a href="' + url + '" target="_blank">';
								html += '		<div class="link-thumb">' + im + '</div>';
								html += '		<ul>';
								html += '			<li class="link-title">' + title + '</li>';
								html += '			<li class="link-summary">' + desc + '</li>';
								html += '			<li class="link-site">' + dmn + '</li>';
								html += '		</ul>';
								html += '	</a>';
								html += '</div>';
							}
							
						}else if (info.ex != undefined){
							if (info.ex.type == "mail"){
								var from = info.ex.sender;
								var title = info.ex.title;
								
								var tunid = info.ex.target_unid;
								var tdb = info.ex.target_db;
								var tserver = info.ex.target_server;
								
								var attach_list = info.ex.attach.split("*?*");
								var attach_size = info.ex.attachsize.split("*?*");
								var acount = 0;
								if (info.ex.attach != ""){
									acount = attach_list.length;
								}
								
								html += "<div class='chat-mail'>";
								html += "<div>";
								html += "	<span class='ico ico-mail'></span>";
								html += "	<dl style='cursor:pointer' onclick=\"gBody4.openMail('" + tunid + "','body', '" + tdb + "', '" + tserver + "')\">";
								html += "		<dt>" + from + "</dt>";
								html += "		<dd>" + title + "</dd>";
								html += "	</dl>";
								
								if (acount > 0){
									html += "	<div class='mail-attach-list'>";
									html += "		<button class='ico btn-fold'>접기</button> <!-- 클릭 시 .on 클래스 토글 -->";
									html += "		<h4>" + gap.lang.attachment + " <span>" + acount + "</span></h4>";
									html += "		<ul>";	
									
									for (var i = 0 ; i < attach_list.length ; i++){
										var attname = attach_list[i];
										var attsize = attach_size[i];
										var icon = gap.file_icon_check(attname);
										var target_server = info.ex.target_server;
										
										html += "			<li data-target='"+target_server+"' data-tunid='"+tunid+"' data-attname='"+attname+"' data-tdb='"+tdb+"' onclick=\"gBody3.mail_file_down2(this)\"><span class='ico ico-attach " + icon + "'></span><span>" + attname + "</span><em>(" + gap.file_size_setting(attsize) + ")</em>";
									
									//	html += "			<li onclick=\"gBody3.mail_file_down('" + tunid + "','" + attname + "', '" + tdb + "')\"><span class='ico ico-attach " + icon + "'></span><span>" + attname + "</span><em>(" + gap.file_size_setting(attsize) + ")</em>";
										html += "			</li>";
									}
									html += "		</ul>";
									html += "	</div>";
								}
								html += "	</div>";
								html += "</div>";
							}
						}
						
						// 파일 처리
						if (info.info != undefined){
							var files = info.info;
							var image_files = new Array();
							var normal_files = new Array();
							
							for (var i = 0; i < files.length; i++){
								var file = files[i];
								var isImage = gap.check_image_file(file.filename);
								if (isImage){
									image_files.push(file);
								}else{
									normal_files.push(file);
								}
							}
							
							//이미지 파일일 경우 표시하기
							if (image_files.length > 0){
								for (var i = 0; i < image_files.length; i++){
									var image = image_files[i];
									var size = gap.file_size_setting(parseInt(image.file_size.$numberLong));
									var image_url = gap.search_file_convert_server(info.fserver) + "/FDownload_thumb.do?id=" + docid + "&md5=" + image.md5 + "&ty=2";
									
									html += "<div class='img-content' id='msg_file_"+ docid + "_" + image.md5.replace(".","_")+"'>";		
									html += "	<div class='img-thumb'>";
									html += "		<img src='" + image_url + "' data='" + image.filename + "' data1='" + image.md5 + "' data2='" + image.file_type + "' data3='" + docid + "'  data4='" + info.email + "' data5='" + info.channel_code + "' data8='" + info.channel_name + "'>";
									html += "	</div>";
									html += "	<ul>";
									html += "		<li class='img-title'>" + image.filename + "</li>";
									html += "		<li class='img-size'>" + size + "</li>";
									html += "		<li class='img-btns'>";
									html += "   		<button class='ico btn-view'>크게보기</button>";
									html += "   		<button class='ico btn-download' title='" + gap.lang.download + "'>다운로드</button>";
									html += "   		<button class='ico btn-more'>더보기</button>";
									html += "   	</li>";
									html += "	</ul>";
									html += "</div>";
								}
							}
							
							
							//일반 파일일 경우 표시하기
							if (normal_files.length > 0){
								html += '<ul class="message-file">';
								
								for (var i = 0 ; i < normal_files.length; i++){
									var file_info = normal_files[i];
									var fname = file_info.filename;
									var md5 = file_info.md5;
									var fsize = gap.file_size_setting(parseInt(file_info.file_size.$numberLong));
									var add_dt_html = "data1='" + info.fserver + "' data2='" + info.upload_path + "' data3='" + file_info.md5 + "' data4='" + info.email + "' data5='" + file_info.file_type + "' data6='" + docid + "' data7='" + info.channel_code + "' data8='" + info.channel_name + "' title='" + file_info.filename + "'"
									var icon_kind = gap.file_icon_check(fname);
									var show_video = gap.file_show_video(fname);
									
									html += '	<li id="msg_file_' + docid + '_' + md5.replace('.', '_') + '">';
									html += '		<div class="chat-attach">';
									html += '			<div>';
									html += '				<span class="ico ico-file ' + icon_kind + '"></span>';
									html += '				<dl>';
									html += '					<dt ' + add_dt_html + '>' + fname + '</dt>';
									html += '					<dd>' + fsize + '</dd>';
									html += '				</dl>';
									
									if (_self.check_preview_file(fname)){
										html += '				<button class="ico btn-file-view">파일보기</button>';
									}else if (show_video){
										html += '				<button class="ico btn-file-view">파일보기</button>';
									}
									
									html += '				<button class="ico btn-file-view">파일보기</button>';
									html += '				<button class="ico btn-file-download">다운로드</button>';
									html += '				<button class="ico btn-more">더보기</button>';
									html += '			</div>';
									html += '		</div>';
									html += '	</li>';								
								}
								html += '</ul>';								
								
							}
						}
				
						// reply 처처리
						if (info.reply != undefined){
							if (info.reply.length > 0){
								html += '<div class="message-reply">';
								
								for (var i = 0; i < info.reply.length; i++){
									var reply_info = info.reply[i];
									var reply_disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(reply_info.GMT));
									var reply_disp_time = gap.change_date_localTime_only_time(String(reply_info.GMT));
									var reply_content = gBody3.message_check(reply_info.content);
									var reply_person_img = gap.person_profile_photo(reply_info.owner);
									var reply_owner_info = gap.user_check(reply_info.owner);

									html += '	<dl>';
									html += '		<dt>';
									html += '			<div class="user">';
									html += '				<div class="user-thumb">' + reply_person_img + '</div>';
									html += '			</div>';
									html += '		</dt>';
									html += '		<dd>';
									html += '			<span>' + reply_owner_info.name + '<em class="team">' + reply_owner_info.dept + '</em><em>' + reply_disp_date + ' ' + reply_disp_time + '</em></span>';
									html += '			<p class="ts-result-content">' + reply_content + '</p>';
									html += '		</dd>';
									html += '	</dl>';
								}
								html += '</div>';
							}							
						}
						html += "	</div>";
						html += "</div>";
						$("#portal_search_right").html(html);
		
						_self.event_init_ts_search_file();
						
						// 하이라이트 처리
						var qry_list = _self.ts_query.split(" ");
						for (var k = 0; k < qry_list.length; k++){
							$(".ts-result-content").highlight(qry_list[k]);
						}
						
						$("#ts_content").mCustomScrollbar({
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
						
						
						$(".wrap-message mention").css("cursor", "pointer");
						 $(".wrap-message mention").off();
						 $(".wrap-message mention").on("click", function(e){
							 var id = $(this).attr("data");
							 _self.click_img_obj = this;
							 _wsocket.search_user_one_for_popup(id);
						 });

						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
			
		}else{
			var id = "";
			var fserver = obj.attr("fserver");
			var fname = obj.attr("fname");
			var md5 = obj.attr("md5");
			var furl = obj.attr("furl");
			var thumbOK = obj.attr("thmok");
			var show_video = gap.file_show_video(fname);
			var icon_kind = gap.file_icon_check(fname);
			var ty = "";
			
			if (item_type == "file"){
				ty = "1";
				id = obj.attr("id");
				
			}else if (item_type == "channel_file"){
				ty = "2";
				id = obj.attr("dataid");
				
			}else if (item_type == "favorite"){
				ty = "3";
				id = obj.attr("id");
			}
			
			if (show_video){
				gap.show_video(furl, fname)
				
			}else if (icon_kind == "img"){
				gap.image_gallery = new Array();  //변수 초기화 해준다.
				gap.image_gallery_current = 1;
				gap.show_image(furl, fname);
				
			}else{
				this.file_convert(fserver, fname, md5, id, ty, true);	
			}
		}
	},
	
	"event_init_ts_search_list" : function(){
		var _self = this;
		
		$(".w_info div, .result_box button").off();
		$(".w_info div, .result_box button").on("click", function(e){

			if (e.target.className == "ico btn-more file-menu"){
				$.contextMenu({
					selector : ".ico.btn-more.file-menu",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
						var $selector = $(this).parent().parent();;
						var f_id = $selector.attr("id");
						var f_server = $selector.attr("fserver");
						var f_name = $selector.attr("fname");
						var f_md5 = $selector.attr("md5");
						var f_url = $selector.attr("furl");
						_self.ts_select_id = f_id;
						_self.context_menu_call_file_mng(key, options, f_id, f_server, f_name, f_md5, f_url, true);
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
						}
					},			
					build : function($trigger, options){
						var $selector = $trigger.parent().parent();
						var fowner = $selector.attr("owner");
						var fname = $selector.attr('fname');
						var thmok = $selector.attr('thmok');
						var icon_kind = gap.file_icon_check(fname);
						var is_preview = true;
						if (icon_kind == "img" || icon_kind == "video"){
						//	is_preview = false;
						}else{
							if (!_self.check_preview_file(fname)){
								is_preview = false;
							}
						}							
						options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
						
						return {
							items: _self.file_menu_content(is_preview, fowner)
						}
					}
				});				
				
			}else if (e.target.className == "ico btn-more files-file-menu"){
				$.contextMenu({
					selector : ".ico.btn-more.files-file-menu",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
						var $selector = $(this).parent().parent();
						var f_id = $selector.attr("dataid");
						var f_server = $selector.attr("fserver");
						var f_name = $selector.attr("fname");
						var f_md5 = $selector.attr("md5");
						var f_url = $selector.attr("furl");
						_self.ts_select_id = $selector.attr("id");;
						_self.context_menu_call_file_mng(key, options, f_id, f_server, f_name, f_md5, f_url, true);
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
						}
					},			
					build : function($trigger, options){
						var $selector = $trigger.parent().parent();
						var fname = $selector.attr('fname');
						var fowner = $selector.attr('owner');
						var thmok = $selector.attr('thmok');
						var icon_kind = gap.file_icon_check(fname);
						var is_preview = true;
						if (icon_kind == "img" || icon_kind == "video"){
						//	is_preview = false;
						}else{
							if (!gBody3.check_preview_file(fname)){
								is_preview = false;
							}
						}			
						options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
						return {
							items: _self.files_file_menu_content(is_preview, fowner)
						}
					}
				});
				
			}else if (e.target.className == "ico btn-more favorite-file-menu"){
				$.contextMenu({
					selector : ".ico.btn-more.favorite-file-menu",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
						var $selector = $(this).parent().parent();
						var f_id = $selector.attr("id");
						var f_server = $selector.attr("fserver");
						var f_name = $selector.attr("fname");
						var f_md5 = $selector.attr("md5");
						var f_url = $selector.attr("furl");
						_self.ts_select_id = f_id;
						_self.context_menu_call_file_mng(key, options, f_id, f_server, f_name, f_md5, f_url, true);
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
						}
					},			
					build : function($trigger, options){
						var $selector = $trigger.parent().parent();
						var fname = $selector.attr('fname');
						var thmok = $selector.attr('thmok');
						var icon_kind = gap.file_icon_check(fname);
						var is_preview = true;
						if (icon_kind == "img" || icon_kind == "video"){
						//	is_preview = false;
						}else{
							if (!_self.check_preview_file(fname)){
								is_preview = false;
							}
						}					
						options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
						return {
							items: _self.favorite_file_menu_content(is_preview)
						}
					}
				});				
				
			}else{
				_self.ts_select_id = $(this).attr("id");
				_self.show_search_content($(this))
			}
		});
	},
	
	"event_init_ts_search_file" : function(){
		var _self = this;
		
		$(".img-content .img-thumb").off();
		$(".img-content .img-thumb").on("click", function(e){
			//이미지 직접 클릭해서 미리보기 전체 창으로 띄우기
			var url = $(this).find("img").attr("src");
			url = url.replace("_thumb.do",".do");
			
			var title = $(this).find("img").attr("data");
			
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;
			
		
			gap.show_image(url, title);
		});
		
		$(".img-btns .btn-view").off();
		$(".img-btns .btn-view").on("click", function(e){
			//이미지 마우스 오버시 확장 버튼으로 전체 창으로 띄우기
			var url = $(this).parent().parent().prev().find("img").attr("src");
			url = url.replace("_thumb.do",".do");
			
			var title = $(this).parent().parent().prev().find("img").attr("data");
			
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;
			
			gap.show_image(url, title);
		});
		
		$(".img-btns .btn-download").off();
		$(".img-btns .btn-download").on("click", function(e){
			//이미지 마우스 오버시 다운로드 클릭으로 파일 다운로드 하기
			var url = $(this).parent().parent().prev().find("img").attr("src");
			url = url.replace("ty=2", "ty=1");
			
			var title = $(this).parent().parent().prev().find("img").attr("data");
			gap.file_download_normal(url, title);
		});		
		
		$(".chat-attach .btn-file-view").off();
		$(".chat-attach .btn-file-view").on("click", function(e){
			
			e.preventDefault();

			//일반 파일 미리 보기 클릭 한  경우				
			var citem =  $(this).parent().find("dt");
			var filename = citem.text();
			var fserver = citem.attr("data1");
			var upload_path = citem.attr("data2");
			var md5 = citem.attr("data3");
			var email = citem.attr("data4");
			var ty = citem.attr("data5");
			var id = citem.attr("data6");
		
			if (ty == "mp4" || ty == "avi" || ty == "mov" || ty == "mkv" || ty == "wmv"){	
				var vserver = gap.search_video_server(fserver);
				var url = vserver + "/2/" + email + "/" + upload_path + "/" + md5 + "/" + ty;
				
				gap.show_video(url, filename);	
				return false;
							
			}else{
				var id = $(this).parent().find("dl dt").attr("data6");
				var ft = $(this).parent().find("dl dt").attr("data5");		
			
				var obj = new Object();
				obj.id = id;
				obj.md5 = md5;
				obj.ty = "2";
				obj.filename = filename;
				obj.fserver = fserver;
				gBody3.click_file_info = obj;
				
			//	gFiles.channel_file_convert(fserver, filename, md5, id, "2", ft, email, upload_path);
				//AP-ON 용
			//	gFiles.channel_file(fserver, filename, md5, id, "2", ft, email, upload_path);
				//대상용
				_self.file_convert(fserver, filename, md5, id, "2", ft, email, upload_path);
				
			}
			return false;
		});
		
		$(".chat-attach .btn-file-download").off();
		$(".chat-attach .btn-file-download").on("click", function(e){
			//일반 파일 다운로드 클릭한 경우
			var citem =  $(this).parent().find("dt");
			var filename = citem.text();
			var fserver = citem.attr("data1");
			var upload_path = citem.attr("data2");
			var md5 = citem.attr("data3");
			var email = citem.attr("data4");
			var ty = citem.attr("data5");
			var download_url = fserver + "FileDownload.do?em=" + email + "&fd=" + upload_path + "&ty=1&m5=" + md5 + "&fn=" + encodeURIComponent(filename);
			
			gap.file_download_normal(download_url, filename);
			return false;
		});
		
		$(".chat-attach .btn-more").off();
		$(".chat-attach .btn-more").on("click", function(e){
			$.contextMenu({
				selector : ".chat-attach .btn-more",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){
					var info = $(this).parent().find("dl dt");
					var id = info.attr("data6");
					var md5 = info.attr("data3");
					var ft = info.attr("data5");
					var channel_code = info.attr("data7");
					var channel_name = info.attr("data8");
					var fs  = info.attr("data1");

					_self.context_menu_call_file(key, id, md5, ft, channel_code, fs, channel_name);
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
					},
					show : function (options){
					}
				},			
				build : function($trigger, options){
					options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
						return {
						items: _self.file_context($trigger.parent().find("dl dt").attr("data4"))
					}
				}
			});
		});
		
		$(".img-btns .btn-more").off();
		$(".img-btns .btn-more").on("click", function(e){
			$.contextMenu({
				selector : ".img-btns .btn-more",
				autoHide : false,
				trigger : "left",
				callback : function(key, options){
					var info = $(this).parent().parent().parent().find("img");
					var id = info.attr("data3");
					var md5 = info.attr("data1");
					var ft = info.attr("data2");
					var channel_code = info.attr("data5");
					var channel_name = info.attr("data8");
					var fs = info.attr("data1");

					_self.context_menu_call_file(key, id, md5, ft, channel_code, fs, channel_name);
				},
				events : {
					hide: function (options) {
						$(this).removeClass("on");
					},
					show : function (options){
					}
				},			
				build : function($trigger, options){
					options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
					return {
						items: _self.file_context($trigger.parent().parent().parent().find("img").attr("data4"))
					}
				}
			});
		});
	},
	
	"channel_file_convert" : function(fserver, fname, md5, item_id, ty, ft){
		var surl = gap.search_file_convert_server(fserver) + "/FileConvert.km";
		var postData = {
				"id" : item_id,
				"md5" : md5,
				"ft" : ft,
				"ty" : ty
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					if (gBody3.isNumberic(res.data.count)){
						gRM.show_file_fullscreen(fname, md5, res.data.count);
						
					}else{
						gap.gAlert(gap.lang.noimage);
					}
					gap.hide_loading();
				}else{
					gap.hide_loading();
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.hide_loading();
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});			
	},
	
	"init_org" : function(){
		
		var actionId = ''
		var lang = ''		
		$('#orgModal')
		.empty()
		.append('<iframe src="' + '/' + libdb + '/org?readform&act=' + actionId + '&lang=' + lang + '" style="width:100%;height:100%"></iframe>')
		.css({'width':'768px','max-width':'768px','height':'550px'})
		.position({
			my: 'center',
			at: 'center',
			of: window
		})	
	},
	
	"channel_folder_layer_html" : function(is_update){
		var html = '';

		html += '<h2>' + (is_update ? gap.lang.todo_update_folder : gap.lang.todo_create_folder) + '</h2>';
		html += '<button class="ico btn-close" id="close_folder_layer">닫기</button>';
		html += '<div class="input-field">';
		html += '	<input type="text" class="formInput" autocomplete="off" id="input_folder_name" placeholder="">';
		html += '	<label for="input_folder_name">' + gap.lang.todo_folder_name + '</label>';
		html += '	<span class="bar"></span>';
		html += '</div>';
		html += '<div class="layer-bottom">';
		html += '	<button id="create_folder_btn"><strong>' + gap.lang.OK + '</strong></button>';
		html += '	<button id="cancel_folder_btn"><span>' + gap.lang.Cancel + '</span></button>';
		html += '</div>';		
		
		return html;
	},
	
	"channel_create_folder" : function(obj, is_share){
		var is_update = (obj != undefined ? true : false);
		var is_folder_share = (is_share != undefined ? is_share : "Y");

		if (is_update){
			ch_code = obj.ch_code;
		}
		var html = gFiles.channel_folder_layer_html(is_update);
		$("#create_todo_layer").html(html);

		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#create_todo_layer')
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();
		
		if (is_update){
			//폴더 정보 update인 경우
			$("#input_folder_name").val(gap.textToHtml(obj.name));
			$("#input_folder_name").parent().find("label").addClass("on");
			$("#input_folder_name").focus();
		}
		
		$("#input_folder_name").on("change", function(){
			if($(this).val() == ""){
				$(this).parent().find("label").removeClass("on");
			} else {
				$(this).parent().find("label").addClass("on");
			}
		});			
		
		$("#create_folder_btn").on("click", function(){
	
			if ($("#input_folder_name").val().trim() == ""){
				gap.gAlert(gap.lang.input_foldername);
				return;
			}
			var folder_name = $("#input_folder_name").val();
			var readers = [];
			
			readers.push(gap.search_cur_ky());
			var postData = {
					"name" : folder_name,
					"share" : is_folder_share,
					"sort" : 1,			// folder : 1, project : 2
					"type" : "folder",	// type : folder / project
					"owner" : gap.userinfo.rinfo,
					"readers" : readers
				};
			
			if (is_update){
				postData.key = obj._id.$oid;
				postData.email = gap.search_cur_ky();
			}
			
			var surl = gap.channelserver + "/" + (is_update ? "modify_folder_channel.km" : "make_folder_channel.km");
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "text",
				data : JSON.stringify(postData),
				success : function(ress){
					var res = JSON.parse(ress);
					if (res.result == "OK"){
						gap.close_layer('create_todo_layer');
						gFiles.update_channel_info(null, true);
						
					}else{
						gap.gAlert(gap.lang.errormsg);
						return false;						
					}
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;					
				}
			});			
		});
		
		$("#close_folder_layer").on("click", function(){
			gap.close_layer('create_todo_layer');
		});
		$("#cancel_folder_btn").on("click", function(){
			gap.close_layer('create_todo_layer');
		});		
	},
	
	"channel_modify_folder" : function(_id){
		var surl = gap.channelserver + "/search_folder_channel.km";
	/*	var postData = {
				"key" : _id,
				"email" : gap.search_cur_em()
			};*/
		
		var postData = {
				"key" : _id
			};

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					gFiles.channel_create_folder(res.data, res.data.share);
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},
	
	"channel_delete_folder" : function(_id){
		var msg = gap.lang.confirm_delete;
		gap.showConfirm({
			title: "Confrim",
			contents: msg,
			callback: function(){
			var surl = gap.channelserver + "/delete_folder_channel.km";
			/*	var postData = {
						"key" : _id,
						"email" : gap.search_cur_em()
					};*/
				
				var postData = {
						"key" : _id
					};

				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(postData),
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success : function(res){
						if (res.result == "OK"){
							$("#li_" + _id).remove();
							gFiles.update_channel_info(null, true);
							
						}else{
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				});		
			}
		});
		
		
//		$.confirm({
//			title : "Confirm",
//			content : msg,
//			type : "default",  
//			closeIcon : true,
//			closeIconClass : "fa fa-close",
//			columnClass : "s", 			 				
//			animation : "top", 
//			animateFromElement : false,
//			closeAnimation : "scale",
//			animationBounce : 1,	
//			backgroundDismiss: false,
//			escapeKey : false,
//			buttons : {		
//				confirm : {
//					keys: ['enter'],
//					text : gap.lang.OK,
//					btnClass : "btn-default",
//					action : function(){
//						var surl = gap.channelserver + "/delete_folder_channel.km";
//					/*	var postData = {
//								"key" : _id,
//								"email" : gap.search_cur_em()
//							};*/
//						
//						var postData = {
//								"key" : _id
//							};
//
//						$.ajax({
//							type : "POST",
//							url : surl,
//							dataType : "json",
//							data : JSON.stringify(postData),
//							beforeSend : function(xhr){
//								xhr.setRequestHeader("auth", gap.get_auth());
//								xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
//							},
//							success : function(res){
//								if (res.result == "OK"){
//									$("#li_" + _id).remove();
//									gFiles.update_channel_info(null, true);
//									
//								}else{
//									gap.gAlert(gap.lang.errormsg);
//									return false;
//								}
//							},
//							error : function(e){
//								gap.gAlert(gap.lang.errormsg);
//								return false;
//							}
//						});				
//					}
//				},
//				cancel : {
//					keys: ['esc'],
//					text : gap.lang.Cancel,
//					btnClass : "btn-default",
//					action : function(){
//					}
//				}
//			}		 			
//		});
	},
	
	"draw_channel_left" : function(res){
		
		gap.cur_channel_list_info = res;
		var unread_count = 0;
		
		$("#share_channel_list").empty();
		$("#person_channel_list").empty();
		$("#favorite_channel_list").empty();
		
		for (var i = 0; i < res.length; i++){
			
			var data = res[i];
			var _type = (data.type != undefined ? data.type : "channel");
			var _html = "";	
			
			if (_type == "folder"){
				var _id = data._id.$oid;
				var _name = data.name;
				var _owner = data.owner.ky;
				
				_html += '<li id="li_' + _id + '" style="padding-left:20px; ">';
				_html += '	<div id="div_' + _id + '" owner="' + _owner + '" class="folder-code" >';
				_html += '		<span id="btn_fold_' + _id + '"></span>';
		//		_html += '		<span class="ico ico-lnb-folder"></span>';
				_html += '		<h3><span class="ico ico-filefolder"></span>';
				_html += '		<em id="em_' + _id + '">' + _name + '</em><button class="ico btn-more ch-folder-mng">더보기</button></h3>';
				_html += '	</div>';
				_html += '</li>';
				
				if (data.share == "Y"){
					$("#share_channel_list").append(_html);
					
				}else{
					$("#person_channel_list").append(_html);
				}
				
			}else{
				
				_html += '<li id="li_cl_' + data.ch_code + '" style="padding-left:45px">';
				_html += '	<div id="' + data.ch_code + '" owner="' + data.owner.ky + '" class="channel-code ' + data.ch_code + '">';
			//	_html += '	<span class="ico ico-channel' + (data.ch_share == "Y" ? "-share" : "") + '"></span><em>' + data.ch_name + '</em>';
				
				
				var dischname = data.ch_name;
				if (data.ch_name.length > gFiles.menu_length){
					dischname = data.ch_name.substring(0,gFiles.menu_length) + "...";
				}
				
				if (data.ch_share == "Y"){
					_html += '	<span class="ico ico-people"></span><em>' + dischname + '</em>';
				}else{
					_html += '	<span class="ico ico-person"></span><em>' + dischname + '</em>';
				}
				
				var is_unread = false;
				
				if (data.ch_share == "Y"){
					if (typeof(data.lastupdate) != "undefined"){
						
						if (gBody3.readTime_check(data)){
							is_unread = true;
							unread_count += 1;
						}
					}						
				}		
				if (is_unread){
					_html += '	<span id="clist_'+data.ch_code+'" style="color:red;font-weight:bold;margin-left:2px" class="clistxx"><span class="ico-new"></span></span>';
				}else{
					_html += '	<span id="clist_'+data.ch_code+'" style="color:red;font-weight:bold;margin-left:2px" class="clistxx"></span>';
				}
				
				_html += '	<button class="ico btn-more channel-area">더보기</button></div>';
				_html += '</li>';
				
				
				
				if (typeof(data.favorite) != "undefined"){
					for (var k = 0 ; k < data.favorite.length; k++){
						if (data.favorite[k] == gap.userinfo.rinfo.ky){
							$("#favorite_channel_list").append(_html);
							break;
						}
					}
					
				}
				
				
				if (data.folderkey && data.folderkey != ""){
					if ($("#li_" + data.folderkey).length == 0){
						// 폴더키는 있지만 해당 폴더가 존재하지 않는 경우
					//	if (data.ch_share == "Y"){
							$("#share_channel_list").append(_html);
							
					//	}else{
					//		$("#person_channel_list").append(_html);
					//	}

					}else{
						if ($("#li_" + data.folderkey).find("li").length == 0){
							var _ul_html = '<ul id="ul_' + data.folderkey + '" style="display:none;">' + _html.replace("45px","30px") + '</ul>';
							$("#li_" + data.folderkey).append(_ul_html);
				
						}else{
							$("#ul_" + data.folderkey).append(_html.replace("45px","30px"));
						}
						
						$("#btn_fold_" + data.folderkey).html('<button class="btn-fold"></button>');
					
						$("#share_channel_list #" + data.ch_code).css("margin-left", "10px");
						
						//폴더안에 빨콩이 있으면 폴더도 빨콩 처리해 준다.
						$("#div_"+data.folderkey).find("em").remove(".ico-new");
						if (is_unread){	
							$("#div_"+data.folderkey).find("em").append("<span class='ico-new'></span>");
						}
					}
				}else{
				//	if (data.ch_share == "Y"){
						$("#share_channel_list").append(_html);
						
				//	}else{
				//		$("#person_channel_list").append(_html);
				//	}
				}
			}
		}
		
		if (unread_count > 0){
			$("#tab3_sub").html(gap.lang.channel + "<span class='ico-new'></span>");
		}		
		
		
	},
	
	"dragset" : function(){		
		$("#share_channel_list li").off();
		$("#share_channel_list li").draggable({
			 revert: "invalid",
			 stack: ".draggable",     //가장위에 설정해 준다.
			 opacity: 1,
		//	 containment: "window",
			 scroll: false,
		//	 helper: 'clone',
			 cursorAt: { top: 10, left:30},
			 helper: function (e) { 
				//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.			
				var sid = $(e.currentTarget).attr("id");
				var xtxt = "";
				if (sid.indexOf("mCSB_") > -1){
					//엣지는 정상인데 크롬 브라우저에서 드래그할때 전체 채널명이 따라오는 것을 방지 하기 위해 예외 처리함  
					//gBody2 에서 channel_menu_content 함수에서 gFiles.channel_menu_content_click_id 값을 설정함
					xtxt = $("#"+ gFiles.channel_menu_content_click_id).parent().find("em").text();
				}else{
					xtxt = $(e.currentTarget).find("em").text();
				}
				var spp = "<span style='width:300px'  id='"+sid+"' data-type='share'>" + xtxt + "<span>";
				return $(spp).clone().appendTo("#nav_left_menu").css("zIndex",2000).show();
		     },			 			     
		     cursor: 'move',	     
			 start : function(event, ui){		    	
				$(this).draggable("option", "revert", false);
			},
			stop : function(event, ui){						
			}
		});		
		$(".folder-code").off();
		$(".folder-code").droppable({
			activeClass : 'active',
			hoverClass : 'chat_hovered',
			drop : function(event, ui){				
				try{						
					var droppable = $(this);
			 		var draggable = ui.draggable;
			 		var folderid = $(droppable).attr("id").replace("div_","");
			 		var dragid = ui.draggable.attr("id").replace("li_cl_","");			 		
			 		var type = $(draggable).parent().attr("id");
			 		var tp = $(droppable).parent().parent().attr("id");
			 		gFiles.move_channel_to_folder(dragid, folderid);			 		
				}catch(e){}
			}
		});	
		$(".lnb-channel h2").off();
		$(".lnb-channel h2").droppable({
			activeClass : 'active',
			hoverClass : 'chat_hovered',
			drop : function(event, ui){				
				try{					
					var droppable = $(this);
			 		var draggable = ui.draggable;
			 	//	var folderid = $(droppable).attr("id").replace("div_","");
			 		var dragid = ui.draggable.attr("id").replace("li_cl_","");			 		
			 	//	if ($(droppable).parent().find("#favorite_channel_list").length > 0){
			 		if ($(droppable).parent().attr("class") == "favorit"){
			 			//즐겨찾기 영역에 드롭한 경우이다.
			 			gFiles.favorite_channel_folder(dragid, "add");
			 		}else{
			 			var type = $(draggable).parent().parent().parent().attr("id");
				 		var tp = $(droppable).parent().parent().attr("id");				 		
				 	//	if (type == tp){
				 			gFiles.move_channel_to_folder(dragid, "root");
				 	//	}	 
			 		}		 		
				}catch(e){}
			}
		});	
	},
	
	"__channel_left_event" : function(){
		var _self =  this;
		
		//채널 드래그 & 드롭으로 이동하기
		this.dragset();
		
		$("#share_channel_list .channel-code, #person_channel_list .channel-code, #favorite_channel_list .channel-code").off();
		$("#share_channel_list .channel-code, #person_channel_list .channel-code, #favorite_channel_list .channel-code").on("click", function(e){
			
			
			if (e.target.className == "ico btn-more channel-area"){
				$.contextMenu({
					selector : ".ico.btn-more.channel-area",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){						
						_self.context_menu_call_channel_mng(key, options, $(this).parent().attr("id"));						
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
	                	}
					},			
					build : function($trigger, options){
						return {
							items: _self.channel_menu_content($($trigger).parent().attr("owner"), $($trigger))
						}
					}
				});
				
			}else{
				var res = gap.checkEditor();
				if (!res) return false;
				
				//Plugin 실행후 다시 Box UI로 돌아가는 함수 호출
				_self.backto_box_layout();
				//////////////////////////////////////
				_self.click_oob = e;
				var id = e.currentTarget.id;
				_self.show_channel_data(id);						

			}					
		});
		
		
		
		
		
		$("#share_channel_list .folder-code, #person_channel_list .folder-code").off();
		$("#share_channel_list .folder-code, #person_channel_list .folder-code").on("click", function(e){
			if (e.target.className == "ico btn-more ch-folder-mng"){
				$.contextMenu({
					selector : ".ico.btn-more.ch-folder-mng",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){					
						//gFiles.context_menu_call_channel_folder_mng(key, options, $(this).parent().attr("id"));
						gFiles.context_menu_call_channel_folder_mng(key, options, $(this).parent().parent().attr("id"));
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
		            	},
		            	show : function (options){
		            	}
					},			
					build : function($trigger, options){
					//	var owner = $($trigger).parent().attr("owner");
					//	var folderkey = $($trigger).parent().attr("id").replace("div_", "");
						
						var owner = $($trigger).parent().parent().attr("owner");
						var folderkey = $($trigger).parent().parent().attr("id").replace("div_", "");
						
						var is_channel_share = ($("#li_" + folderkey).parent().attr("id") == "share_channel_list" ? "Y" : "N");
						return {
							items: gFiles.channel_folder_menu_content(owner, is_channel_share)
						}
					}
				});
				
			}else if (e.target.className == "btn-fold"){
				$("#" + $(this).attr("id") + " .btn-fold").addClass("on");
				var ul_len = $("#" + $(this).attr("id")).siblings('ul').length;
				for (var i = 0; i < ul_len; i++){
					$("#" + $(this).attr("id")).siblings('ul').eq(i).show();
				}
				
			}else if (e.target.className == "btn-fold on"){
				$("#" + $(this).attr("id") + " .btn-fold").removeClass("on");
				var ul_len = $("#" + $(this).attr("id")).siblings('ul').length;
				for (var i = 0; i < ul_len; i++){
					$("#" + $(this).attr("id")).siblings('ul').eq(i).hide();
				}
				
			}else{
				// 폴더명 클릭 시 expand/collapse
				var folder_id = $(this).attr("id").replace("div_", "");
				if ($("#btn_fold_" + folder_id).children().length > 0){
					var class_name = $("#btn_fold_" + folder_id).children().eq(0).attr("class");
					if (class_name == "btn-fold"){
						$("#" + $(this).attr("id") + " .btn-fold").addClass("on");
						var ul_len = $("#" + $(this).attr("id")).siblings('ul').length;
						for (var i = 0; i < ul_len; i++){
							$("#" + $(this).attr("id")).siblings('ul').eq(i).show();
						}
						
					}else if (class_name == "btn-fold on"){
						$("#" + $(this).attr("id") + " .btn-fold").removeClass("on");
						var ul_len = $("#" + $(this).attr("id")).siblings('ul').length;
						for (var i = 0; i < ul_len; i++){
							$("#" + $(this).attr("id")).siblings('ul').eq(i).hide();
						}
					}
				}
			}
		});		
	},
	
	"context_menu_call_channel_folder_mng" : function(key, options, _id){
		
		if (_id != undefined){
			_id = _id.replace("div_", "");
		}

		if (key == "modify_folder"){
			gFiles.channel_modify_folder(_id);
			
		}else if (key == "delete_folder"){
			gFiles.channel_delete_folder(_id);
			
		}else if (key == "create_share_channel"){
			gFiles.create_channel(null, _id, 'Y');
			
		}else if (key == "create_person_channel"){
			gFiles.create_channel(null, _id, 'N');
		}
	},
	
	"channel_folder_menu_content" : function(_owner, is_channel_share){
		
		var is_owner = (_owner == gap.search_cur_ky() ? true : false);
		var items = {};
		if (is_owner){
			items["modify_folder"] = {name : gap.lang.todo_update_folder};
			items["delete_folder"] = {name : gap.lang.todo_delete_folder};
			items["sep01"] = "-------------";
		}
		if (is_channel_share == "Y"){
			items["create_share_channel"] = {name : gap.lang.create_channel};
			
		}else{
			items["create_person_channel"] = {name : gap.lang.create_channel};
		}

		return items;
	},
	
	"draw_channel_folder" : function(cid){
		// cid : channel key
		var is_share = false;
		if ($("#" + cid).children().first().hasClass("ico-people")){
			is_share = true;
		}
		var html = '';
		html += '<h2>' + gap.lang.move_channel + '</h2>';
		html += '<button class="ico btn-close" id="close_folder_info_layer">닫기</button>';
		html += '<ul class="folder-tree" id="folder_info_list">';
		html += '	<li>';
		html += '		<div style=""><span class="ico ico-todo-folder"></span>Root<button class="btn-entry" id="enter_root"><span>' + gap.lang.move + '</span></button></div>';
		html += '	</li>';		
		html += '</ul>';
		html += '<div class="layer-bottom">';
//		html += '	<button><strong>' + gap.lang.OK + '</strong></button>';
		html += '	<button id="cancel_folder_info_layer"><span>' + gap.lang.Cancel + '</span></button>';
		html += '</div>';
		
		$("#exit_info_layer").html(html);

		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#exit_info_layer')
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();

		
		//폴더 리스트 가져오기
		var surl = gap.channelserver + "/api/channel/channel_info_list.km";
	/*	var postData = JSON.stringify({
			email : gap.search_cur_em_sec(),
			depts : gap.full_dept_codes()
		});*/
		
		var postData = JSON.stringify({});
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : surl,
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				for (var i = 0; i < res.length; i++){
					var _info = res[i];
					if (_info.type && _info.type == "folder"){
						var _html = '';
						var _folder_html = '';
						_folder_html += '<li>';
						_folder_html += '	<div style=""><span class="ico ico-todo-folder"></span>' + _info.name + '<button class="btn-entry" id="enter_' + _info._id.$oid + '"><span>' + gap.lang.move + '</span></button></div>';
						_folder_html += '</li>';
						if (is_share){
							if (_info.share == "Y"){
								_html += _folder_html;
							}
						}else{
							if (_info.share == "N"){
								_html += _folder_html;
							}
						}

						$("#folder_info_list").append(_html);
					}
				}
			
				//이동 버튼 클릭
				$(".btn-entry").off();
				$(".btn-entry").on("click", function(){
					var fid = $(this).attr("id").replace("enter_", "");
					fid = (fid == "root" ? "" : fid);
					gFiles.move_channel_to_folder(cid, fid);
				});
			},
			error : function(e){
				gap.error_alert();
			}
		})		

		
		$("#close_folder_info_layer").on("click", function(){
			gap.close_layer('exit_info_layer');
		})
		$("#cancel_folder_info_layer").on("click", function(){
			gap.close_layer('exit_info_layer');
		})
	},
	
	"move_channel_to_folder" : function(pkey, fkey){
		
		var surl = gap.channelserver + "/move_folder_channel.km";
		var postData = JSON.stringify({
				"key" : pkey,
				"folderkey" : fkey
			});			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					gap.close_layer('exit_info_layer');
					gFiles.update_channel_info(null, true);
					
				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},
	
	"draw_drive_left" : function(res){
		var _self = this;
	
		if (typeof(res.data) != "undefined"){
			this.cur_drive_list_info = res.data.drive;
			this.cur_drive_folder_list_info = res.data.folder;
			
			$("#share_drive_list").empty();
			$("#person_drive_list").empty();
		
			// 드라이브 그리기
			for (var i = 0; i < res.data.drive.length; i++){
				var data = res.data.drive[i];
				var _html = "";
				
				_html += '		<li id="li_dl_' + data.ch_code + '">';
				_html += '			<div id="main_' + data.ch_code + '" owner="' + data.owner.ky + '" class="drive-code" data="root">';
				_html += '				<span id="btn_fold_' + data.ch_code + '"></span>';
				_html += '				<span class="ico ico-drive' + (data.ch_share == "Y" ? "-share" : "") + '"></span><em style="padding-left:20px">' + data.ch_name + '</em>';
				_html += '				<button class="ico btn-more drive-area">더보기</button>';
				_html += '			</div>';
				_html += '		</li>';
				
				if (data.ch_share == "Y"){
					$("#share_drive_list").append(_html);
					
				}else{
					$("#person_drive_list").append(_html);
				}
			}
			
			// 드라이브 하위 폴더 그리기
			this.draw_main_sub_folder(res.data.folder);		
		}
		
	},
	
	"__drive_left_event" : function(){
		var _self = this;
		
		$("#share_drive_list .drive-code, #person_drive_list .drive-code").off();
		$("#share_drive_list .drive-code, #person_drive_list .drive-code").on("click", function(e){
			if (e.target.className == "ico btn-more drive-area"){
				$.contextMenu({
					selector : ".ico.btn-more.drive-area",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
						_self.context_menu_call_drive_mng(key, options, $(this).parent().attr("id"));
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
	                	},
	                	show : function (options){
	                	}
					},			
					build : function($trigger, options){
						return {
							items: _self.drive_menu_content($($trigger).parent().attr("owner"))
						}
					}
				});
				
			}else if (e.target.className == "btn-fold"){
				$("#" + $(this).attr("id") + " .btn-fold").addClass("on");
				var ul_len = $("#" + $(this).attr("id")).siblings('ul').length;
				for (var i = 0; i < ul_len; i++){
					$("#" + $(this).attr("id")).siblings('ul').eq(i).show();
				}
				
			}else if (e.target.className == "btn-fold on"){
				$("#" + $(this).attr("id") + " .btn-fold").removeClass("on");
				var ul_len = $("#" + $(this).attr("id")).siblings('ul').length;
				for (var i = 0; i < ul_len; i++){
					$("#" + $(this).attr("id")).siblings('ul').eq(i).hide();
				}
				
			}else{
				//Plugin 실행후 다시 Box UI로 돌아가는 함수 호출
				_self.backto_box_layout();
				//////////////////////////////////////
				
				var id = e.currentTarget.id.replace("main_", "");
				_self.show_drive_data(id);
			}
		});
	},
	
	"alert_size_over" : function(){
		gap.gAlert(gap.lang.size_over);
		return false;
	},
	
	"update_todo_list_info" : function(draw){
		// Todo 폴더/프로젝트  리스트 정보 가져오기
		var is_draw = (draw != undefined ? draw : false);
		var surl = gap.channelserver + "/folder_list_todo.km";
	/*	var postData = JSON.stringify({
				email : gap.search_cur_em_sec()
			});	*/
		
		var postData = JSON.stringify({});		


		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : postData,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (is_draw){
					gTodoC.draw_todo_left(res);
					
				}else{
					var _data = res.data.data;
					var _favorite = res.data.favorite;

					gBody.cur_todo_list = _data;
					gBody.cur_todo_star_list = _favorite;
				}
				gTodoC.__todo_left_event();
			},
			error : function(e){
			}
		});		
	},
	
	"check_member_top_height" : function(){
		var _self = this;
		var h = $("#member_info_dis").height();
		if ($("#member_info_dis").length == 0){
			h = 0;
		}
		var h2 = $(".owner-info").height();		
		if (typeof(h2) == "undefined"){
			h = 40;
			//$(".owner-info").hide();
		}else{
			//$(".owner-info").show();
			//h = $("#member_info_dis").height() + ;
			if (this.check_selected_top_menu()){
				h = 30;
			}else{
				var hk = (parseInt(h) + parseInt(h2));
				if (h == 0){
					h = hk + 400;
				}else{
					h = hk + 50;
				}
			}		
		}
		return h;
	},	
	
	"show_all_files" : function(user_obj){
		gFiles.all_files_selected_member = "";
		
		var html =
			'<div id="all_files_layer" class="inner mu_container" style="top:50%;left:50%;transform: translate(-50%, -50%);">' + 
			'	<div id="work-chat" class="mu_work">' + 
			'		<div class="dsw_pjt_inner pjt_h_flex">' + 
			'			<div class="work-tab">' + 
			'				<div class="pop_btn_close"></div>' + 
			'				<ul class="flex">' + 
			'					 <!-- 활성화 on 클래스 추가 -->' + 
			'					<li class="on" id="workroom_files"><span>' + gap.lang.channel_files + '</span></li>' + 
			'					<li id="chatroom_files"><span>' + gap.lang.chatroom_files + '</span></li>' + 
			'					<li id="all_files"><span>Files</span></li>' + 
			'				</ul>' + 
			'			</div>' + 
			'		</div>' + 
			'		<div class="chat-wide">' + 
			'			<div class="file-btn-wrap f_between">' + 
			'				<ul class="flex">' + 
			'					<li id="select_all_files">' + gap.lang.selectall + '</li>' + 
			'					<li id="deselect_all_files">' + gap.lang.deselection + '</li>' + 
			'				</ul>' + 
			'				<div class="drop-s search-bx">' + 
			'					<div class="bx f_between search-field">' + 
			'						<span class="ico ico-search"></span>' + 
			'						<input type="text" name="" id="input_files_search" class="input" placeholder="' + gap.lang.input_search_query + '">' + 
			'						<div class="btn-search-close" style="display:none;top:12px;right:100px;"></div>' +'' +
			'						<button class="type_icon" id="file_transfer" style="background:none;">' + gap.lang.file_transfer + '</button>' + 
			'					</div>' + 
			'				</div>' + 
			'			</div>' + 
			'			<div class="chat-body wokr-file">' + 
			'				<div class="tab_cont_wr">' + 
			'					<table class="table_type_a">' + 
			'						<colgroup>' + 
			'							<col style="width: 8%;">' + 
			'							<col style="width: 62%;">' + 
			'							<col style="width: 15%;">' + 
			'							<col style="width: 15%;">' + 
			'						</colgroup>' + 
			'						<tbody id="file_list">' + 
			'						</tbody>' + 
			'					</table>' + 
			'				</div>' + 
			'				<div class="pagination_wr" id="paging_area">' + 
			'				</div>' + 
			'			</div>' +             
			'		</div>' +        
			'	</div>' + 
			'</div>';
				
		gap.showBlock();
		$(html).appendTo('body');
	//	$("#common_work_layer").show();
	//	$("#common_work_layer").html(html);
		var $layer = $('#all_files_layer');
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
		$layer.wrap('<div id="common_work_layer" class="drop-pop-mu" style="top:-50%;"></div>')
		
		gFiles.all_files_selected_tab = "workroom_files";
		gFiles.all_files_selected_member = user_obj;
		
		// 기본 호출 목록
		gFiles.get_channel_all_files(1);
		
		// 이벤트 처리
		gFiles.event_all_files($layer);
	},
	
	"event_all_files" : function($layer){
		// 닫기
		$layer.find('.pop_btn_close').off().on('click', function(){
			gap.remove_layer('all_files_layer');
		//	gap.remove_layer('common_work_layer');
		});
		
		// 탭 선택
		$layer.find('.work-tab li').off().on('click', function(){
			if ($(this).hasClass('on')) return;
			$('.work-tab li').removeClass('on');
			$(this).addClass('on');
			
			// 선택된 탭
			gFiles.all_files_selected_tab = $(this).attr('id');
			if (gFiles.all_files_selected_tab == "workroom_files"){
				gFiles.get_channel_all_files(1);
				
			}else if (gFiles.all_files_selected_tab == "chatroom_files"){
				gFiles.get_chat_all_files(1);
				
			}else if (gFiles.all_files_selected_tab == "all_files"){
				gFiles.get_all_files(1);
			}
		});
		
		// 전체 선택
		$layer.find('#select_all_files').off().on('click', function(){
			$("input[name=file_checkbox]").each(function() {
				$(this).prop("checked", true);
			});
		});
		
		// 선택 해제
		$layer.find('#deselect_all_files').off().on('click', function(){
			$("input[name=file_checkbox]").each(function() {
				$(this).prop("checked", false);
			});
		});
		
		// 파일 전송
		$layer.find('#file_transfer').off().on('click', function(){	
			
			$("input[name=file_checkbox]:checked").each(function() {
				
				var file_check = [];
				var file_size = [];
				var file_md5 = [];
				var file_name = [];
				var file_path = [];
				
				var file_check2 = [];
				var file_size2 = [];
				var file_md52 = [];
				var file_name2 = [];
				var file_path2 = [];	
				
				
				file_check.push($(this).val());
				file_size.push($(this).data('fsize'));
				file_name.push($(this).data('fname'));
				if (gFiles.all_files_selected_tab != "chatroom_files"){
					file_md5.push($(this).data('md5'));
				}
				
				file_check2 = $(this).data('fdownload2');
				file_size2 = $(this).data('fsize2');
				file_md52 = $(this).data('fmd52');
				file_name2 = $(this).data('fname2');
				file_path2 = $(this).data('fpath2');	
				
				
				if (file_check.length == 0){
					mobiscroll.toast({message:gap.lang.select_file, color:'danger'});
					return false;
				}
					
				var ty = "";
				if (gFiles.all_files_selected_tab == "workroom_files"){
					ty = "1";
					
				}else if (gFiles.all_files_selected_tab == "chatroom_files"){
					ty = "2";
					
				}else if (gFiles.all_files_selected_tab == "all_files"){
					ty = "3";
				}
				
				if (ty == "2"){	
					if (file_check2.length > 1){
						gBody.send_files_chat("6", file_check2, file_md52, file_size2, file_name2, gFiles.all_files_selected_member, file_path2);
					}else{
						gBody.send_files_chat("6", file_check[0], file_md5[0], file_size[0], file_name[0], gFiles.all_files_selected_member, file_path[0]);
					}				
				}else{
					gBody3.send_files(ty, file_check, file_md5, file_size, file_name, gFiles.all_files_selected_member);
				}	
				
			});

			
			
			
//			var file_check = [];
//			var file_size = [];
//			var file_md5 = [];
//			var file_name = [];
//			var file_path = [];
//			
//			var file_check2 = [];
//			var file_size2 = [];
//			var file_md52 = [];
//			var file_name2 = [];
//			var file_path2 = [];			
//			
//			$("input[name=file_checkbox]:checked").each(function() {
//				file_check.push($(this).val());
//				file_size.push($(this).data('fsize'));
//				file_name.push($(this).data('fname'));
//				if (gFiles.all_files_selected_tab != "chatroom_files"){
//					file_md5.push($(this).data('md5'));
//				}
//				
//				file_check2 = $(this).data('fdownload2');
//				file_size2 = $(this).data('fsize2');
//				file_md52 = $(this).data('fmd52');
//				file_name2 = $(this).data('fname2');
//				file_path2 = $(this).data('fpath2');				
//				
//			});
//
//			if (file_check.length == 0){
//				mobiscroll.toast({message:gap.lang.select_file, color:'danger'});
//				return false;
//			}
//				
//			var ty = "";
//			if (gFiles.all_files_selected_tab == "workroom_files"){
//				ty = "1";
//				
//			}else if (gFiles.all_files_selected_tab == "chatroom_files"){
//				ty = "2";
//				
//			}else if (gFiles.all_files_selected_tab == "all_files"){
//				ty = "3";
//			}
//			
//			if (ty == "2"){	
//				if (file_check2.length > 1){
//					gBody.send_files_chat("6", file_check2, file_md52, file_size2, file_name2, gFiles.all_files_selected_member, file_path2);
//				}else{
//					gBody.send_files_chat("6", file_check[0], file_md5[0], file_size[0], file_name[0], gFiles.all_files_selected_member, file_path[0]);
//				}				
//			}else{
//				gBody3.send_files(ty, file_check, file_md5, file_size, file_name, gFiles.all_files_selected_member);
//			}			
		});
		
		// 검색어 입력 후 엔터
		$layer.find('#input_files_search').keypress(function(e){
			if (e.keyCode == 13){
				var qry = $.trim($(this).val());
				qry.replace(/\[\]\*/g, '');
				$(this).val(qry);

				if (qry.length < 2) {
					mobiscroll.toast({message:gap.lang.valid_search_keyword, color:'danger'});
					return false;
				}
				gap.query_str = $(this).val();
				
				if (gFiles.all_files_selected_tab == "workroom_files"){
					gFiles.get_channel_all_files(1);
					
				}else if (gFiles.all_files_selected_tab == "chatroom_files"){
					gFiles.get_chat_all_files(1);
					
				}else if (gFiles.all_files_selected_tab == "all_files"){
					gFiles.get_all_files(1);
				}
			}
		});
		
		// 검색 초기화
		$layer.find(".btn-search-close").on("click", function(){
			gap.query_str = "";
			$layer.find("#input_files_search").val("");
			$layer.find(".btn-search-close").hide();
			
			if (gFiles.all_files_selected_tab == "workroom_files"){
				gFiles.get_channel_all_files(1);
				
			}else if (gFiles.all_files_selected_tab == "chatroom_files"){
				gFiles.get_chat_all_files(1);
				
			}else if (gFiles.all_files_selected_tab == "all_files"){
				gFiles.get_all_files(1);
			}
		});
	},
	
	"get_channel_all_files" : function(page_no){
		var _self = this;
		
		this.get_channel_info_list();
		
		if (page_no == 1){
			gap.start_page = "1";
			gap.cur_page = "1";
			gap.total_data_count = 0;
		}
		
		gap.start_skp = (parseInt(gap.per_page) * (parseInt(page_no))) - (parseInt(gap.per_page) - 1);
		var surl = gap.channelserver + "/channel_list.km";
		
		var postData = {
			"channel_code" : this.select_channel_code,
			"query_type" : "allcontent",
			"start" : (gap.start_skp - 1).toString(),
			"perpage" : gap.per_page,
			"q_str" : gap.query_str,
			"dtype" : "",
			"type" : "2"
		};
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text", //"json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(__res){
				var res = JSON.parse(__res);
				if (res.result == "OK"){
					var $layer = $('#all_files_layer');
					var list = res.data.data;
					
					if (gap.query_str != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find('#file_list').empty();
					
					for (var i = 0; i < list.length; i++){
						var info = list[i];
						var owner_info = gap.user_check(info.owner);
						var file_info = info.info;
												
						var ty = "2";
						if (info.id.split("_").length > 1){
							ty = "reply";
						}
						var downloadpath = gap.search_file_convert_server(info.fserver) + "FDownload.do?id=" + info.id + "&md5=" + file_info.md5 + "&ty="+ty+"&ky="+gap.userinfo.rinfo.ky;
						
						var html = 
							'<tr class="type_file">' +
							'	<td class="mu_chk_box">' +
							'		<!-- input id값 변경 가능, label for과 동일한 id값 사용필요 -->' +
							'		<span class="chk_box">' +
							'			<input type="checkbox" name="file_checkbox" id="' + info._id.$oid + '" value="' + downloadpath + '">' +
							'			<label for="' + info._id.$oid + '"></label>' +
							'		</span>' +
							'	</td>' +
							'	<td><span class="ico ico-ex-min ico-' + gap.file_icon_check_mu(file_info.filename) + '"></span>' + file_info.filename + '&nbsp;<b class="size">(' + gap.file_size_setting(file_info.file_size.$numberLong) + ')</b></td>' +
							'	<td>' + owner_info.name + '</td>' +
							'	<td class="c08">' + gap.convertGMTLocalDateTime(info.GMT) + '</td>' +
							'</tr>';
						
						$layer.find('#file_list').append(html);
						
						$layer.find('#' + info._id.$oid).data('fsize', file_info.file_size.$numberLong);
						$layer.find('#' + info._id.$oid).data('fname', file_info.filename);
						$layer.find('#' + info._id.$oid).data('md5', file_info.md5.split(".")[0]);
					}

					//페이징
					gap.total_data_count = res.data.totalcount;
					gap.total_page_count = gFiles._getPageCount(gap.total_data_count, gap.per_page);
					gFiles._initializePage();

				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;					
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},
	
	"get_channel_info_list" : function(){
		var _self = this;
		var url = gap.channelserver + "api/channel//channel_info_list.km";
		var data = JSON.stringify({});
		
		$.ajax({
			type : "POST",
			dataType : "text",
			async : false,
			data : data,
			url : url,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(ress){
				var res = JSON.parse(ress);
				
				gap.cur_channel_list_info = res;
				
				var list = "";
				for (var i = 0 ; i < res.length; i++){
					var info = res[i];
					
					if (typeof(info.type) != "undefined" && info.type == "folder"){
						// do nothing...
					}else{
						if (list == ""){
							list = info.ch_code;
						}else{
							list += "-spl-" + info.ch_code;
						}	
					}
				}
				_self.select_channel_code = list;
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"get_chat_all_files" : function(page_no){
		if (page_no == 1){
			gap.start_page = "1";
			gap.cur_page = "1";
			gap.total_data_count = 0;
		}
		
		gap.start_skp = (parseInt(gap.per_page) * (parseInt(page_no))) - (parseInt(gap.per_page) - 1);
		_wsocket.chat_room_all_files("", [5, 6], [], gap.query_str, parseInt(gap.per_page), (gap.start_skp - 1));
	},
	
	"draw_chat_all_files" : function(obj){
		
		var $layer = $('#all_files_layer');
		
		if (obj.skp == 0){
			gap.total_data_count = obj.cnt;
		}
		
		if (gap.query_str != ""){
			$layer.find(".btn-search-close").show();	
		}
		$layer.find('#file_list').empty();
		
		for (var i = 0; i < obj.rt.length; i++){
			var file_info = obj.rt[i];
			var fserver = gap.search_fileserver(file_info.nid);
			var downloadpath = fserver + "/filedown" +  file_info.sf + "/" + file_info.sn + "/" + encodeURIComponent(file_info.nm);
			
			var isgp = file_info.isgp;
			
			var html = "";
			
			var fname = [];
			var fsize = [];
			var fpath = [];
			var fdownload = [];
			var fmd5 = [];
			
			if (isgp){
				//묶음으로 보낸 경우 별도로 처리한다.				
				for (var u = 0 ; u < file_info.grp.length; u++){
					var item = file_info.grp[u];
					fname.push(item.nm);
					fsize.push(item.sz);
					var pp = fserver + "/filedown" +  item.sf + "/" + item.sn + "/" + encodeURIComponent(item.nm);
					fdownload.push(pp);
					fpath.push(item.sf);					
				}
			
				html += "<tr class='type_file'>";
				html += "	<td class='mu_chk_box'>";
				html += " 		<span class='chk_box'>";
				html += "			<input type='checkbox' name='file_checkbox' id='chat_file_" + file_info.sq + "' value='" + downloadpath + "'>";
				html += "     		<label for='chat_file_" + file_info.sq + "'></label>";
				html += "		</span>";
				html += "	</td>";
				html += "	<td>";
				html += "		<span style='margin-left:8px;margin-right:18px'><img src='common/img/multi_image.png' style='width:20px;height:20px'></span>";
				html += "		" + file_info.grp[0].nm;
				html += "		&nbsp;<b class='size'>(" + gap.file_size_setting(file_info.sz) + ")</b></td>";
				html += "	</td><td>";
				html += "	<td class='c08'>" + gap.convertGMTLocalDateTime(file_info.dt) + "</td>";
				html += "</tr>";
			}else{
				html += '<tr class="type_file">' +
				'	<td class="mu_chk_box">' +
				'		<!-- input id값 변경 가능, label for과 동일한 id값 사용필요 -->' +
				'		<span class="chk_box">' +
				'			<input type="checkbox" name="file_checkbox" id="chat_file_' + file_info.sq + '" value="' + downloadpath + '">' +
				'			<label for="chat_file_' + file_info.sq + '"></label>' +
				'		</span>' +
				'	</td>' +
				'	<td>' +
				'		<span class="ico ico-ex-min ico-' + gap.file_icon_check_mu(file_info.nm) + '"></span>' + 
				file_info.nm + 
				'&nbsp;<b class="size">(' + gap.file_size_setting(file_info.sz) + ')</b></td>' +
				'	<td></td>' +
				'	<td class="c08">' + gap.convertGMTLocalDateTime(file_info.dt) + '</td>' +
				'</tr>';
			}
			
			
			$layer.find('#file_list').append(html);
			
			$layer.find('#chat_file_' + file_info.sq).data('fsize', file_info.sz);
			$layer.find('#chat_file_' + file_info.sq).data('fname', file_info.nm);
			
			$layer.find('#chat_file_' + file_info.sq).data('fname2', fname);
			$layer.find('#chat_file_' + file_info.sq).data('fsize2', fsize);
			$layer.find('#chat_file_' + file_info.sq).data('fpath2', fpath);
			$layer.find('#chat_file_' + file_info.sq).data('fdownload2', fdownload);
			$layer.find('#chat_file_' + file_info.sq).data('fmd52', fmd5);

		}
		
		//페이징
		gap.total_page_count = gFiles._getPageCount(gap.total_data_count, gap.per_page);
		gFiles._initializePage();
	},
	
	"get_all_files" : function(page_no){
		if (page_no == 1){
			gap.start_page = "1";
			gap.cur_page = "1";
			gap.total_data_count = 0;
		}
		
		gap.start_skp = (parseInt(gap.per_page) * (parseInt(page_no))) - (parseInt(gap.per_page) - 1);
		var surl = gap.channelserver + "/api/files/folder_list_main.km";
		
		var postData = {
			"start" : (gap.start_skp - 1).toString(),
			"perpage" : gap.per_page,
			"q_str" : gap.query_str,
			"dtype" : "",
			"type" : "1"
		};		
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text", //"json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(__res){
				var res = JSON.parse(__res);
				if (res.result == "OK"){
					var $layer = $('#all_files_layer');
					var list = res.data.filelist;
					
					if (gap.query_str != ""){
						$layer.find(".btn-search-close").show();	
					}
					$layer.find('#file_list').empty();
					
					for (var i = 0; i < list.length; i++){
						var file_info = list[i];
						var owner_info = gap.user_check(file_info.owner);
						var downloadpath = gap.search_file_convert_server(file_info.fserver) + "FDownload.do?id=" + file_info._id.$oid + "&ty=1&ky="+gap.userinfo.rinfo.ky;
						
						var html = 
							'<tr class="type_file">' +
							'	<td class="mu_chk_box">' +
							'		<!-- input id값 변경 가능, label for과 동일한 id값 사용필요 -->' +
							'		<span class="chk_box">' +
							'			<input type="checkbox" name="file_checkbox" id="' + file_info._id.$oid + '" value="' + downloadpath + '">' +
							'			<label for="' + file_info._id.$oid + '"></label>' +
							'		</span>' +
							'	</td>' +
							'	<td><span class="ico ico-ex-min ico-' + gap.file_icon_check_mu(file_info.filename) + '"></span>' + file_info.filename + '&nbsp;<b class="size">(' + gap.file_size_setting(file_info.file_size.$numberLong) + ')</b></td>' +
							'	<td>' + owner_info.name + '</td>' +
							'	<td class="c08">' + gap.convertGMTLocalDateTime(file_info.GMT) + '</td>' +
							'</tr>';
						
						$layer.find('#file_list').append(html);
						
						$layer.find('#' + file_info._id.$oid).data('fsize', file_info.file_size.$numberLong);
						$layer.find('#' + file_info._id.$oid).data('fname', file_info.filename);
						$layer.find('#' + file_info._id.$oid).data('md5', file_info.md5.split(".")[0]);
					}

					//페이징
					gap.total_data_count = res.data.totalcount;
					gap.total_page_count = gFiles._getPageCount(gap.total_data_count, gap.per_page);
					gFiles._initializePage();

				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;					
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},
	
	"_getPageCount" : function(doc_count, rows){
		return ret_page_count = Math.floor(gap.total_data_count / rows) + (((gap.total_data_count % rows) > 0) ? 1 : 0);
	},
	
	"_initializePage" : function(){
		var alldocuments = gap.total_data_count;
		if (alldocuments % gap.per_page > 0 & alldocuments % gap.per_page < gap.per_page/2 ){
			gap.all_page = Number(Math.round(alldocuments/gap.per_page)) + 1
		}else{
			gap.all_page = Number(Math.round(alldocuments/gap.per_page))
		}	

		if (gap.start_page % gap.per_page > 0 & gap.start_page % gap.per_page < gap.per_page/2 ){
			gap.cur_page = Number(Math.round(gap.start_page/gap.per_page)) + 1
		}else{
			gap.cur_page = Number(Math.round(gap.start_page/gap.per_page))
		}

		gFiles._initializeNavigator();		
	},
	
	"_initializeNavigator" : function(){
		var $layer = $('#all_files_layer');
		var alldocuments = gap.total_data_count;

		if (gap.total_page_count == 0){
			gap.total_page_count = 1;
		}

		if (alldocuments == 0){
			alldocuments = 1;
			gap.total_page_count = 1;
			gap.cur_page = 1;
		}

		if (alldocuments != 0) {
			if (gap.total_page_count % 10 > 0 & gap.total_page_count % 10 < 5 ){
				var all_frame = Number(Math.round(gap.total_page_count / 10)) + 1
			}else{
				var all_frame = Number(Math.round(gap.total_page_count / 10))	
			}

			if (gap.cur_page % 10 > 0 & gap.cur_page % 10 < 5 ){
				var c_frame = Number(Math.round(gap.cur_page / 10)) + 1
			}else{
				var c_frame = Number(Math.round(gap.cur_page / 10))
			}

			var nav = new Array();
			if (c_frame == 1){
				nav[0] = '<ul class="pagination inb">';
			}else{
				nav[0] = '<div class="arrow prev" onclick="gFiles._gotoPage(' + ((((c_frame-1) * 10) - 1)*gap.per_page + 1) + ',' + ((c_frame - 1) * 10) + ');"></div><ul class="pagination inb">';
			}			
			
			var pIndex = 1;
			var start_page = ((c_frame-1) * 10) + 1;

			for (var i = start_page; i < start_page + 10; i++){
				if (i == gap.cur_page){
					if (i == '1'){
						nav[pIndex] = '<li class="on">' + i + '</li>';
					}else{
						if (i % 10 == '1'){
							nav[pIndex] = '<li class="on">' + i + '</li>';
						}else{
							nav[pIndex] = '<li class="on">' + i + '</li>';
						}
					}
				}else{
					if (i == '1'){
						nav[pIndex] = '<li onclick="gFiles._gotoPage(' + (((i-1) * gap.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
					}else{
						if (i % 10 == '1' ){
							nav[pIndex] = '<li onclick="gFiles._gotoPage(' + (((i-1) * gap.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}else{
							nav[pIndex] = '<li onclick="gFiles._gotoPage(' + (((i-1) * gap.per_page) + 1 ) + ', ' + i + ', this)">' + i + '</li>';
						}
					}
				}				

				if (i == gap.total_page_count) {
					break;
				}
				pIndex++;				
			}

			if (c_frame < all_frame){
				nav[nav.length] = '</ul><div class="arrow next" onclick="gFiles._gotoPage(' + ((c_frame * gap.per_page * 10) + 1) + ',' + ((c_frame * 10) + 1) + ');"></div>';
				
			}else{
				nav[nav.length] = '</ul>';
			}
			
		
			var nav_html = '';

			if (c_frame != 1 ){
			//	nav_html = '<li class="p-first" onclick="gFiles._gotoPage(1,1);"><span>처음</span></li>';
			}		    
			for( var i = 0 ; i < nav.length ; i++){	
				nav_html += nav[i];
			}
					

			if (c_frame < all_frame){
			//	nav_html += '<li class="p-last" onclick="gFiles._gotoPage(' + ((gFiles.all_page - 1) * gap.per_page + 1) + ',' + gFiles.all_page + ')"><span>마지막</span></li>';
			}

			$layer.find("#paging_area").html(nav_html);
		}		
	},
	
	"_gotoPage" : function(idx, page_num){
		if (gap.total_data_count < idx) {
			gap.start_page = idx - 10;
			if ( gap.start_page < 1 ) {
				return;
			}
		}else{
			gap.start_page = idx;
		}
		cur_page = page_num;
		
		if (gFiles.all_files_selected_tab == "workroom_files"){
			gFiles.get_channel_all_files(cur_page);
			
		}else if (gFiles.all_files_selected_tab == "chatroom_files"){
			gFiles.get_chat_all_files(cur_page);
			
		}else if (gFiles.all_files_selected_tab == "all_files"){
			gFiles.get_all_files(cur_page);			
		}
	},
	
	"update_display_members" : function(ty, id, new_owner){
		/*
		 * ty : 1 >>> channel and todo
		 * ty : 2 >>> drive
		 */
		var list = "";
		
		if (ty == "1"){
			if (gap.cur_window == "channel"){
				// channel 처리
				list = gBody3.search_channel_members(id);
				
			}else if (gap.cur_window == "todo"){
				// todo 처리
				list = gTodo.cur_project_info;
			}
			
			
			//변경 전 owner는 나이므로 멤버에 내가 없으면 나를 추가한다.
			var res = list.member.filter(function (data) {
				return data.ky == gap.userinfo.rinfo.ky;
			});
			
			if (res.length == 0){
				list.member.push(gap.userinfo.rinfo);
				
			}

			//변경된 owner가 멤버에 있는 경우 삭제한다.
			var mem = list.member.filter(function (data) {
				return data.ky != new_owner.ky;
			});
			
			if (mem.length > 0){
				list.member = mem
				
			}

			var readers = [];
			var user_list = [];
			var user_ky_list = [];
			var new_member_ky = "";
			var del_member_ky = "";
			var channel_name = $("#input_channel").val();
			var member_count = list.member;
			
			readers.push(new_owner.ky);
			
			for(var i = 0; i < list.member.length; i++){
				var user_info = list.member[i]
				readers.push(user_info.ky);
				user_list.push(user_info);
			}
			
			// channel 처리
			var postData = {
					"ch_code" : id,
					"ch_name" : gBody.select_channel_name,
					"owner" : new_owner,
					"readers" : readers,
					"member" : user_list
				};
				
			var surl = gap.channelserver + "/create_channel.km";
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "text",
				data : JSON.stringify(postData),
				success : function(ress){
					var res = JSON.parse(ress);
					if (res.result == "OK"){
						if (gap.cur_window == "channel"){
							gFiles.update_channel_info(id);							
						}
					}
				},
				error : function(e){
				}
			});
			
		}else if (ty == "2"){
			list = gBody3.search_drive_members(id);
			
			//변경 전 owner는 나이므로 멤버에 내가 없으면 나를 추가한다.
			var res = list.member.filter(function (data) {
				return data.ky == gap.userinfo.rinfo.ky;
			});
			
			if (res.length == 0){
				list.member.push(gap.userinfo.rinfo);
				
			}

			//변경된 owner가 멤버에 있는 경우 삭제한다.
			var mem = list.member.filter(function (data) {
				return data.ky != new_owner.ky;
			});
			
			if (mem.length > 0){
				list.member = mem
				
			}

			var readers = [];
			var user_list = [];
			var user_ky_list = [];
			var new_member_ky = "";
			var del_member_ky = "";
			var channel_name = $("#input_channel").val();
			var member_count = list.member;
			
			readers.push(new_owner.ky);
			
			for(var i = 0; i < list.member.length; i++){
				var user_info = list.member[i]
				readers.push(user_info.ky);
				user_list.push(user_info);
			}
			
			// channel 처리
			var postData = {
					"ch_code" : id,
					"ch_name" : gFiles.select_drive_name,
					"owner" : new_owner,
					"readers" : readers,
					"member" : user_list
				};
				
			var surl = gap.channelserver + "/drive_update.km";
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "text",
				data : JSON.stringify(postData),
				success : function(ress){
					var res = JSON.parse(ress);
					if (res.result == "OK"){
						gFiles.update_drive_info(id);
					}
				},
				error : function(e){
				}
			});			
		}
	},
	
	"draw_user_schedule" : function(list){
		// 최초 그릴 때 사용, 사용자 정보가 배열로 넘어옴
		var default_height = 130;
		var total_height = default_height;
		var members_ky = [];
		var members_info = [];
		var shifts = [];
		var members_ky_list = "";
		
		if (typeof(list) == "undefined" || (typeof(list) != "undefined" && list.length == 0)){
			return false;
		}

		for (var i = 0; i < list.length; i++){
			members_ky.push(list[i].ky);
		};
		
		members_ky_list = members_ky.join(",");
		total_height = (120 * list.length) + default_height;
		
		// 사용자 메일정보 가져오기
		var surl = gap.channelserver + "/api/user/search_user_multi.km";
		var postData = {
				"name" : members_ky_list,
				"companycode" : ""
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			async : false,
			data : JSON.stringify(postData),
			success : function(res){
				$(res).each(function(idx, val){
					var info = gap.user_check(val[0]);
					var user_info = {
							"id" : info.ky,
							"name" : info.name,
							"dept" : info.dept,
							"cpc" : info.cpc,
							"emp" : info.emp,
							"ky" : info.ky,
							"mf" : val[0].mf,
							"ms" : val[0].ms
					}
					members_info.push(user_info);
				})
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
		
		if (gFiles.quick_cal){
			$('#user_schedule').mobiscroll('destroy');						
		}
		
		gFiles.quick_cal = $('#user_schedule').mobiscroll().eventcalendar({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			theme: 'ios',
			themeVariant: 'light',
			view: {
				timeline: {
					type: 'week',
					weekNumbers: true,
					eventList: true,
					startDay: 1,
					endDay: 6
				}
			},
			onInit: function(event, inst){
				var first_day = inst._firstDay;
				var last_day = inst._lastDay;
				var s_key = moment(first_day).format('YYYYMMDD[T000000Z]');
				var e_key = moment(last_day).format('YYYYMMDD[T235959Z]');
				
				gFiles.getQuickUserEvent(s_key, e_key, members_info, members_ky_list);
			},
			onPageLoaded: function (event, inst) {
				setTimeout(function(){
					var list = $("#user_schedule .mbsc-timeline-resource.mbsc-ios.mbsc-ltr");
					for (var i = 0 ; i < list.length; i++){
						var item = list[i];
						var kk = $(item).css("min-height").replace("px","");
						if (kk < 100){
							$(item).css("min-height", "130px");
						}
					}							
					var list = $("#user_schedule .mbsc-flex.mbsc-timeline-row.mbsc-ios");
					for (var i = 0 ; i < list.length; i++){
						var item = list[i];
						var kk = $(item).css("min-height").replace("px","");
						if (kk < 100){
								$(item).css("min-height", "130px");
						}
					}						
				}, 10);
			},
			onPageChange: function(event, inst){
				var first_day = event.firstDay;
				var last_day = event.lastDay;
				var s_key = moment(first_day).format('YYYYMMDD[T000000Z]');
				var e_key = moment(last_day).format('YYYYMMDD[T235959Z]');
				var evt = gFiles.quick_cal.getEvents(s_key, e_key);

				var members_info = [];
				var members_ky = [];
				var members_ky_list = ""
				var prev_rsc_list = gFiles.quick_cal._resourcesMap;
			
				$(Object.values(prev_rsc_list)).each(function(idx, val){
					members_info.push(val);
					members_ky.push(val.ky);
				});
				members_ky_list = members_ky.join(",");
			
				// 이벤트 삭제
				$(evt).each(function(idx, val){
					gFiles.quick_cal.removeEvent(val.id);
				});
				gFiles.getQuickUserEvent(s_key, e_key, members_info, members_ky_list);	
			},
			dragToCreate: false,
			dragToResize: false,
			dragToMove: false,
			clickToCreate: false,
			resources: members_info,
			onEventClick: function (event, inst) {
				gFiles.showEventPreview(event);
				return false;
			},
			renderDay: function (day) {
				console.log(day);
			},
			renderScheduleEvent: function (data) {
				var ev = data.original;
				var color = "";
				var fcolor = "";
				var preText = "";
				if (ev.priority == "1"){
					color = "#FFEAE7";
					fcolor = "#ec5f78";
					preText = "<span style='color:" + fcolor + "; margin-right:10px'>1순위</span>";
					
				}else if (ev.priority == "2"){
					color = "#FDF5D9";
					fcolor = "#f39562";
					preText = "<span style='color:" + fcolor + "; margin-right:10px'>2순위</span>";
					
				}else if (ev.priority == "3"){
					color = "#E6F0FF";
					fcolor = "#7194ec";
					preText = "<span style='color:" + fcolor + "; margin-right:10px'>3순위</span>";
					
				}else if (ev.priority == "4"){
					color = "#F4EFF6";
					fcolor = "#71368d";
					preText = "<span style='color:" + fcolor + "; margin-right:10px'>4순위</span>";
				}
				
				var html = "";
				html += "<div class='nonewline'>";
				html += "	<div class='main-cal-event event-work' style='font-weight:bold; background-color:" + color + "'>";
				html += "		<span class='marker' style='background:" + fcolor + "'></span>";
				
				if (ev.status == '3'){
					html += "		<span class='event-text' style='text-decoration:line-through' title='" + ev.title + "'>" + preText + " " + ev.title + "</span>"
				}else{
					html += "		<span class='event-text' title='" + ev.title + "'>" + preText + " " + ev.title + "</span>"
				}
				
				html += "	</div>";
				html += "</div>";
				
				return html;
			},
			renderResource: function (resource) {
				var css_img = 'url(' + gap.person_photo_url({cpc:resource.cpc, emp:resource.emp}) + '),url(../resource/images/none.jpg)';
				var html =
					'<li style="list-style:none" class="user-li" id="ky_' + resource.ky + '" data-key="' + resource.id + '" data-ms="' + resource.ms + '" data-mf="' + resource.mf + '">' +
					'	<div class="user-wrap">' +
					'		<div class="user-photo" style="background-image:' + css_img + '"></div>' +
					'		<div class="info-wrap">' +
					'			<div class="user-name" title="' + resource.name + '">' + resource.name + '</div>' +
					'			<div class="user-dept" title="' + resource.dept + '">' + resource.dept + '</div>' +
					'		</div>' +
					'	</div>' +
					'</li>';
				
				return html;
			}
		}).mobiscroll('getInst');
	},
	
	"add_user_schedule" : function(user){
		// 사용자 1명 추가 userkey가 넘어옴	
		if (gFiles.quick_cal){
			var surl = gap.channelserver + "/api/user/search_user_multi.km";
			var postData = {
					"name" : user,
					"companycode" : ""
				};
			
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				async : false,
				data : JSON.stringify(postData),
				success : function(__res){
					var res = __res[0][0];	
					var rsc_list = [];
					var prev_rsc_list = gFiles.quick_cal._resourcesMap;
					var members_info = [];
				
					$(Object.values(prev_rsc_list)).each(function(idx, val){
						rsc_list.push(val);
					});
				
					var info = gap.user_check(res);
					var user_info = {
							"id" : info.ky,
							"name" : info.name,
							"dept" : info.dept,
							"cpc" : info.cpc,
							"emp" : info.emp,
							"ky" : info.ky,
							"mf" : res.mf,
							"ms" : res.ms
					}
					rsc_list.push(user_info);
					members_info.push(user_info);
					
					gFiles.quick_cal.setOptions({
						resources: rsc_list
					});
					
					var first_day = gFiles.quick_cal._firstDay;
					var last_day = gFiles.quick_cal._lastDay;
					var s_key = moment(first_day).format('YYYYMMDD[T000000Z]');
					var e_key = moment(last_day).format('YYYYMMDD[T235959Z]');
					
					gFiles.getQuickUserEvent(s_key, e_key, members_info, info.ky);
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});	
		}
	},
	
	"remove_user_schedule" : function(user){
		// 사용자 1명 삭제 userkey가 넘어옴
		if (gFiles.quick_cal){
			var rsc_list = [];
			var prev_rsc_list = gFiles.quick_cal._resourcesMap;
			delete prev_rsc_list[user];
			
			$(Object.values(prev_rsc_list)).each(function(idx, val){
				rsc_list.push(val);
			});
			
			gFiles.quick_cal.setOptions({
				resources: rsc_list
			});			
		}
	},
	
	"getQuickUserEvent" : function(s_key, e_key, members_info, members_ky_list){
		for (var i = 0; i < members_info.length; i++){
			var mf = members_info[i].mf;
			var ky = members_info[i].ky;
			
			// 등록되고 체크된 전체 사용자의 데이터를 가져옴
			var url = '/' + mf + '/CustomEventList?ReadViewEntries&count=9999&StartKey=' + s_key + '&UntilKey=' + e_key + '&KeyType=time&outputformat=json';
			
			gFiles.setQuickCalEvent(url, mf, ky);
		}
		gFiles.setQuickUserStatus(members_ky_list);	
	},
	
	"getCalEventJson" : function(val, is_my_event){
		var data = {};
		data.id				= val['@unid'];
		data.start 			= gHome.getValueByName(val, '$144');
		data.start 			= (data.start == '' ? gHome.getValueByName(val, '$134') : data.start);

		data.date_type 		= gHome.getValueByName(val, '_DateType');
		data.date_type 		= data.date_type == undefined || data.date_type == "undefined" ? "" : data.date_type;
		
		var _allday	 		= gHome.getValueByName(val, '_AllDay');
		data.allday			= data.apt_type == '1' || (data.apt_type == '2' && data.date_type != '2') || _allday == '1' ? true : false;
		
		data.end			= gHome.getValueByName(val, '$146');
		data.title 			= gHome.getValueByName(val, '$147').replace(/\[\$NOSUBJECT\$\]/g, gap.lang.no_subject); // TODO(lang)
		
		data.type 			= gHome.getValueByName(val, '$Type');
		data.apt_type 		= gHome.getValueByName(val, '$152');
		data.colorinfo 		= gHome.getValueByName(val, '$Color').split('|');
		data.chair			= gHome.getValueByName(val, 'Chair_id');
		data.owner			= gHome.getValueByName(val, 'Owner_id');
		data.attendee		= gHome.getValueByName(val, '$Custom').split('|')[0];
		data.location		= gHome.getValueByName(val, '$Custom').split('|')[1];
		data.notice_type	= gHome.getValueByName(val, '$Custom').split('|')[2];
		data.org_confideltial = gHome.getValueByName(val, '$154');
		data.ShowPS 		= gHome.getValueByName(val, '_ShowPS');			
		data.chair_notesid 	= gHome.getValueByName(val, '_ChairNotesID');
		data.sd				= gHome.getValueByName(val, '$StartDate');
		data.ed				= gHome.getValueByName(val, '$EndDate');
		data.apt_cate		= gHome.getValueByName(val, '_ApptCategory');
		
		
		data.completed		= gHome.getValueByName(val, '_Completion');
		data.priority		= gHome.getValueByName(val, '_Priority');
		data.system_code	= gHome.getValueByName(val, '_SystemCode');
		data.system_key		= gHome.getValueByName(val, '_SystemKeyCode');
		
		
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
		if (!is_my_event) {
			if (data.ShowPS == '2') {
				data.title = gap.lang.private_schedule2;
			}
		}
		
		return data;
	},
	
	"setQuickCalEvent" : function(url, mf, ky){
		var is_my_event = mf == window.mailfile;
		$.ajax({
			url: url,
			success: function(res){
				var cal_type = '';
				var dupl_doc = {};	//중복체크
				var evt_list = {};	// {20220518:{"work":1, "}}
				var events = [];

				$.each(res.viewentry, function(idx, val){
					
					var evt = gFiles.getCalEventJson(val, is_my_event);
					if (!evt) return true;
					
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
					var limit_cnt = 5; // 최대 45개까지 카운트 (1개월 달력에 표시가능한 개수만큼만 체크)
					var ck_cnt = 0;
					while (ck_start.format("YYYYMMDD") <= ck_end.format("YYYYMMDD")) {
						ck_cnt++;
						if (ck_cnt >= limit_cnt) break;
						
						// 날짜 중복 체크 (이벤트가 여러개여도 마킹을 하나만 하기 위해 날짜 중복 체크)
						ck_date = ck_start.format("YYYYMMDD");
						gHome.addEventCount(evt_list, ck_date, evt);
						ck_start.add(1, "days");
					}
					
					evt.resource = ky;				
					evt.type = gHome.getEventType(evt);
					events.push(evt);
				});

				var event_type_1 = gHome.makeEventList(evt_list);
				var event_type_2 = events;				
				
				if (gHome.getMainType() == '1') {
					gFiles.quick_cal.addEvent(event_type_1);
					
				} else {
					gFiles.quick_cal.addEvent(event_type_2);
				}
				
			},
			error: function(){
			}
		});
	},
	
	"setQuickUserStatus" : function(members_ky_list){
		//휴가 정보 처리
		var param = {
				user: members_ky_list,
				viewname: 'vwUser'
			};
		var url = gap.getHostUrl() + "/" + opath + "/cal/calendar.nsf/(ag_get_vaca_info)?OpenAgent&" + $.param(param);
		$.ajax({
			url: url,
			dataType: 'json',
			success: function(data){
				if (Array.isArray(data.result)) {
					if (data.result.length == 0){
						return false;
					}

					for (var i = 0; i < data.result.length; i++){
						var event = [];
						var list = data.result[i];

						for (var j = 0; j < list.vaca_info.length; j++){
							var result = list.vaca_info[j];
/*							var s_key = "";
							var e_key = "";
							
							if (result.VacaType == "3"){
								//오전 반차
								s_key = moment(result.VacaDate).format('YYYYMMDD[T000000Z]');
								e_key = moment(result.VacaDate).format('YYYYMMDD[T115959Z]');
								
							}else if (result.VacaType == "4"){
								//오후 반차
								s_key = moment(result.VacaDate).format('YYYYMMDD[T120000Z]');
								e_key = moment(result.VacaDate).format('YYYYMMDD[T235959Z]');
								
							}else{
								//etc.
								s_key = moment(result.VacaDate).format('YYYYMMDD[T000000Z]');
								e_key = moment(result.VacaDate).format('YYYYMMDD[T235959Z]');
							}*/
							
							var s_key = moment(result.VacaDate).format('YYYYMMDD[T000000Z]');
							var e_key = moment(result.VacaDate).format('YYYYMMDD[T235959Z]');

							result.title = result.Title;
							result.start = s_key;
							result.end = e_key;
							result.resource = list.id;
							result.type = "vaca";
							event.push(result);

							gFiles.quick_cal.addEvent(event);
						}
					}
				}
			}
		});
	},
	
	"showVacation" : function(data){
		// 이전에 표시되던 사항을 안보이게 처리한다
		$('.main-cal-status').each(function(){
			$(this).removeClass('day_1 day_2 day_3 day_4 day_5 day_6 day_7 day_8').text('');
		});
		
		$.each(data, function(){
			var txt = gOrg.userDayText(this.VacaType);
			var dt = moment(this.VacaDate).format('YYYYMMDD');
			$('.maincal_status_' + dt).text(txt).addClass('day_' + this.VacaType);
		});
	},
	
	"showEventPreview" : function(event, is_main){
		if (event.event.type == "vaca"){
			// 휴가 데이터인 경우
			mobiscroll.toast({message:gap.lang.not_support_preview, color:'danger'});
			return false;
		}
		
		var sel_user = $('#ky_' + event.event.resource);
		var data = {
			unid : event.event.id,
			mailServer : sel_user.data('ms'),
			mailFile : sel_user.data('mf')
		};

		var url = gap.getHostUrl() + "/" + opath + "/cal/calendar.nsf/(ag_schedule_preview)?OpenAgent&" + $.param(data);
		$.ajax({
			url : url,
			success: function(data){
				if (data.system_code == 'todo' || data.system_code == 'checklist') {
				
					// To-Do는 바로 레이어 표시
					var arr = data.system_key.split('^');
					var todo_key = arr[data.system_code == 'todo' ? 1 : 2];
					gTodo.compose_layer(todo_key);
				
				} else if (data.system_code == 'task') {
				
					mobiscroll.toast({message:gap.lang.not_support_preview, color:'danger'});
					return false;
				
				} else {
				
					// 일반 일정은 IFrame으로 내용 표시
					var sel_event_date = moment(event.event.sd).format('YYYY-MM-DD');
					gHome.showDetailCalApp(event.event.id, sel_event_date);
				
				}
			},
			error : function(){
			}
		});
	},
	
	"dispNoticeFile" : function($el){
		var info = $el.data('info');
		var finfos = info.data.info;
		
		if (!finfos) return;
		if (finfos.length == 0) return;
		
		var $file_list = $el.find('.notice-filelist');
		if ($file_list.length == 0) {
			$file_list = $('<div class="notice-filelist"></div>');
			$el.find('.notice-writer').before($file_list);
		}
		
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
			
		$el.find('.notice-writer').before($file_list);
	},
	
	"drawNoticeChat" : function(is_quick){
		var _self = this;
		var cur_cid = is_quick ? gma.cur_cid_popup : gBody.cur_cid;
		$.ajax({
			type : "POST",
			url : gap.channelserver + "/read_notice.km",
			dataType : "json",
			data : JSON.stringify({key:cur_cid}),
			success : function(res){
				// 공지가 없을 경우 예외처리
				if (!res.data) {
					if (is_quick){
						_self.hideNoticeQuickChat();
					} else {
						_self.hideNoticeChat();						
					}
					return;
				}
				
				var el_id = is_quick ? 'alarm_notice' : 'notice_top_chat';
				var $el = $('#' + el_id);
				if (is_quick) {
					res.data.response.callfrom = 'quick_chat';
				} else {
					res.data.response.callfrom = 'chat';
				}
				$el.data('info', res.data.response);

				
				var data = res.data.response.data;
				var title = _self.getNoticeTitle(data);
				
				// 공지 타입에 맞게 표시
				$el.removeClass().addClass('notice-top');
				$el.find('.notice-filelist').remove();
				$el.find('.notice-img').remove();
				
				if (data.editor) {
					// 에디터 타입인 경우
					if (data.info && data.info.length > 0) {
						_self.dispNoticeFile($el);
					}
					
				} else if (data.info && data.info.length > 0) {
					if (data.ty == 5) {
						
						_self.dispNoticeFile($el);
						$el.addClass('type-file');
						
					} else if (data.ty == 6) {
						var finfo = data.info[0];
						var file_ext = finfo.filename.substr(finfo.filename.lastIndexOf('.') + 1);
						var upload_path = res.data.response.data.upload_path;
						var upload_ky = res.data.response.owner.ky;
						var upload_file = finfo.md5 + '.' + file_ext;
						var fname = gap.textToHtml(finfo.filename);						
						
						
						var thumb_path = upload_ky + '/' + upload_path + '/thumbnail/' + upload_file;
						var img_path = upload_ky + '/' + upload_path + '/' + upload_file;
											
						
						var thumb_url = gap.channelserver + '/FDownload_noticefile.do?path=' + thumb_path + '&fn=' + encodeURIComponent(fname);
						var img_url = gap.channelserver + '/FDownload_noticefile.do?path=' + img_path + '&fn=' + encodeURIComponent(fname);

						
						var $img = $('<img class="notice-img">');
						
						$img.attr('src', thumb_url);
						$img.data('url', img_url);
						$img.data('filename', fname);
						
						$el.addClass('type-img');
						$el.find('.notice-writer').before($img);					
					}
				}
				
				
				// 제목 & 본문
				$el.find('.notice-head').html(title);
				
				// 작성자 정보
				var owner = gap.user_check(res.data.response.owner);
				var writer = owner.disp_user_info + " | ";
				var notice_date = res.data.response.GMT;
				var html = '<span class="userinfo">' + owner.disp_user_info + '</span>';
				html += '<span class="dt">' + gap.convertGMTLocalDateTime(notice_date) + '</span>';
				$el.find('.notice-writer').html(html);
				
				$el.find('.btn-notice-detail').text(gap.lang.view_detail);
				$el.find('.btn-notice-modify').text(gap.lang.basic_modify);
				$el.find('.btn-notice-remove').text(gap.lang.basic_delete);
				
				// 수정, 삭제 버튼 표시
				if (gap.userinfo.rinfo.ky == owner.ky) {
					$el.find('.btn-notice-modify').show();
					$el.find('.btn-notice-remove').show();
				} else {
					$el.find('.btn-notice-modify').hide();
					$el.find('.btn-notice-remove').hide();
				}
				
				
				// 이벤트 처리
				_self.eventNotice($el, is_quick ? 'quick_chat' : 'chat');
				
				// 공지 표시
				var p_id = is_quick ? 'alarm_chat' : 'chat_content';
				$('#' + p_id).addClass('show-notice');
				
				// 댓글 개수 표시
				if (res.data.response.reply && res.data.response.reply.length > 0) {
					$el.find('.reply-cnt').text(res.data.response.reply.length);
				} else {
					$el.find('.reply-cnt').text(0);
				}
				
				if (!is_quick) gBody.chatroom_dis_height();
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"hideNoticeChat" : function(){
		$('#chat_content').removeClass('show-notice');
		$('#notice_top_chat').removeClass('expand');
		gBody.chatroom_dis_height();
	},
	
	"hideNoticeQuickChat" : function(){
		$('#alarm_chat').removeClass('show-notice');
	},
	
	"hideNoticeWork" : function(){
		$('#sub_channel_content').removeClass('show-notice');
		$('#notice_top_work').removeClass('expand');
		this.workRefreshHeight();
	},
	
	"getNoticeTitle" : function(data){
		var title = '';
		
		if (data.ex) {
			
			// 업무방 컨텐츠인지 먼저 확인한다
			title = '<span class="notice-work-title">' + data.ex.title + '</span>';
			
			if (data.ex.type == 'vote') {
				var _vote = data.ex;
				var _info = {
						"key" : _vote.key,
						"title" : _vote.title,
						"comment" : _vote.comment,
						"endtime" : _vote.end_date + ' ' + _vote.end_time,
						"anonymous" : _vote.anonymous_vote,
						"multi" : _vote.multi_choice,
						"owner" : data.ky
				};
				
				title += '<button type="button" class="btn-notice-vote" data-vote=\'' + JSON.stringify(JSON.stringify(_info)) + '\'>' + gap.lang.vote + '</button>';
			} else if (data.ex.type == 'aprv') {
				title += '<button type="button" class="btn-notice-newwin" data-url="' + data.ex.link + '">' + gap.lang.openNewWin + '</button>';
			} else if (data.ex.type == 'bbs') {
				title += '<button type="button" class="btn-notice-newwin" data-url="' + data.ex.link + '">' + gap.lang.openNewWin + '</button>';
			}
				
		} else if (data.editor) {
			
			// 에디터로 작성된 경우
			if (data.title) {
				title = data.title;
			} else {
				title = gap.lang.mn3;;
			}
			title += '<br>' + gap.textToHtml(data.editor);
			
		} else {
			if (data.ty == 5) {
				// 파일
				title = gap.lang.mn1;
			} else if (data.ty == 6) {
				// 이미지
				title = gap.lang.mn2;
			} else {
				// 그 외
				if (data.content) {
					title = data.content.replace(/\r\n|\n/g, '<br/>');;
				} else if (data.msg){
					title = data.msg.replace(/\r\n|\n/g, '<br/>');;
				} else {
					title = gap.lang.mn3;
				}
			}
		}
		
		return title;
	},
	
	"eventNotice" : function($layer, type){
		var _self = this;
		var data = $layer.data('info').data;
		var ty = data.ty;	// 공지 타입 (6:이미지)

		
		// 파일 미리보기
		$layer.find('.notice-file-wr').off().on('click', function(){
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
				var download_url = gap.channelserver + 'FDownload_noticefile.do?path=' + path + '&fn=' + encodeURIComponent(fn);
				
				gap.show_video(download_url, fn);	
			} else {
				var f_info = $(this).data('fileinfo');
				var fs = gap.channelserver;
				var md5 = f_info.md5;
				var id = info._id['$oid'];
				var ft = f_info.file_type;
				var ky = data.ky;
				var upload_path = info.data.upload_path;
				
				_self.file_convert(fs, fn, md5, id, "notice", ft, ky, upload_path);
				
			}
			
			return false;
		});
		
		
		// 파일 다운로드
		$layer.find('.btn-notice-filedown').off().on('click', function(){
			var $wr = $(this).parent();
			var path = $wr.data('url');
			var fn =  $wr.data('filename');
			var download_url = gap.channelserver + 'FDownload_noticefile.do?path=' + path + '&fn=' + encodeURIComponent(fn);
			
			gap.file_download_normal(download_url, fn);
			return false;
		});

		
		// 이미지 미리보기
		$layer.find('.notice-img').off().on('click', function(){
			//var img_src = gap.fileupload_server_url + '/filedown/' + data.ex.sf + '/' + data.ex.sn + '/' + encodeURIComponent(data.ex.nm);
			var img_src = $(this).data('url');
			var fname = $(this).data('filename');
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;
			gap.show_image(img_src, fname);
			return false;
		});
		
		
		// 투표하기
		$layer.find('.btn-notice-vote').off().on('click', function(){
			var _vote = $(this).data('vote');
			gBody3.response_vote(_vote);
			return false;
		});
		
		// 결재, 게시판
		$layer.find('.btn-notice-newwin').off().on('click', function(){
			var link = $(this).data('url');
			gap.open_subwin(link, "1240","760", "yes" , "", "yes");
			return false;
		});
		
		// 펼쳐보기/접어보기
		$layer.find('.notice-detail-inner').off().on('click', function(){
			$layer.toggleClass('expand');
		});
		
		// 작성자 프로필
		$layer.find('.userinfo').off().on('click', function(){
			var info = $layer.data('info');
			gap.showUserDetailLayer(info.owner.ky);
			return false;
		});
		
		// 상세보기
		$layer.find('.btn-notice-detail').off().on('click', function(){
			var info = $layer.data('info');
			gap.noticeOpen(info._id.$oid, type);
			return false;
		});
		
		// 수정
		$layer.find('.btn-notice-modify').off().on('click', function(){
			gap.noticeWrite($layer.data('info'));
			return false;
		});
		
		// 삭제
		$layer.find('.btn-notice-remove').off().on('click', function(){
			var docid = $layer.data('info')._id.$oid;
			_self.removeNotice(docid, type);
			return false;
		});
	},
	
	"drawNoticeWork" : function(){
		var _self = this;
		var cur_cid = gBody3.cur_opt;
		$.ajax({
			type : "POST",
			url : gap.channelserver + "/read_notice.km",
			dataType : "json",
			data : JSON.stringify({key:cur_cid}),
			success : function(res){
				
				// 공지가 없을 경우 예외처리
				if (!res.data) {
					_self.hideNoticeWork();
					return;
				}
				
				var $el = $('#notice_top_work');
				res.data.response.callfrom = 'work';
				$el.data('info', res.data.response);
				
				var data = res.data.response.data;
				var title = _self.getNoticeTitle(data);
				
				// 공지 타입에 맞게 표시
				$el.removeClass().addClass('notice-top');
				$el.find('.notice-filelist').remove();
				$el.find('.notice-img').remove();
				
				
				_self.dispNoticeFile($el);
				
				if (data.editor){
					
				} else if (data.type == 'file') {
					$el.addClass('type-file');
				} else if (data.ex) {
					// vote, aprv, bbs
					$el.addClass('type-' + data.ex.type);
					$el.addClass('special-type');
				}
				
				
				
				////////////// 데이터 확인 후 뿌릴 것 //////////////
				
				// 제목 & 본문
				$el.find('.notice-head').html(title);
				
				// 작성자 정보
				var owner = gap.user_check(res.data.response.owner);
				var writer = owner.disp_user_info + " | ";
				var notice_date = res.data.response.GMT;
				var html = '<span class="userinfo">' + owner.disp_user_info + '</span>';
				html += '<span class="dt">' + gap.convertGMTLocalDateTime(notice_date) + '</span>';
				$el.find('.notice-writer').html(html);

				
				// 디스플레이 초기화
				$el.find('.notice-btn-wr').show();
				$el.find('.btn-notice-detail').show();
				$el.find('.reply-cnt').show();
				
				// 수정, 삭제 버튼 표시
				if (gap.userinfo.rinfo.ky == owner.ky) {
					$el.find('.btn-notice-modify').show();
					$el.find('.btn-notice-remove').show();
				} else {
					$el.find('.btn-notice-modify').hide();
					$el.find('.btn-notice-remove').hide();
					if (data.ex) {
						$el.find('.notice-btn-wr').hide();
					}
				}
				
				// 업무방 투표, 게시판, 결재 등은 상세보기, 수정 버튼 숨김
				if (data.ex) {
					$el.find('.btn-notice-detail').hide();
					$el.find('.btn-notice-modify').hide();
					$el.find('.reply-cnt').hide();
				} 
				
				// 이벤트 처리
				_self.eventNotice($el, 'work');
				
				
				// 공지 표시
				$('#sub_channel_content').addClass('show-notice');
				
				
				// 댓글 개수 표시
				if (res.data.response.reply && res.data.response.reply.length > 0) {
					$el.find('.reply-cnt').text(res.data.response.reply.length);
				} else {
					$el.find('.reply-cnt').text(0);
				}
				
				_self.workRefreshHeight();
			}
		});
	},
	
	"workRefreshHeight" : function(){
		var minus_h = 50;
		
		// 공지 표시 여부
		if ($('#notice_top_work').is(':visible')) {
			minus_h += $('#notice_top_work').outerHeight(true);
		}
		
		var is_write_atuh = gap.checkAuth();
		
		
		if (!is_write_atuh){
			//작성 권한이 없는 경우
			minus_h = minus_h - 50;
			$("#chat_bottom_dis").addClass('hide');
			$("#btn_editor_change").addClass('hide');
		}else{
			$("#chat_bottom_dis").removeClass('hide');
			$("#btn_editor_change").removeClass('hide');
		}
		
		$("#channel_top_list").css("height", "calc(100% - " + minus_h + "px)");

	},
	
	"removeNotice" : function(docid, type){
		var _self = this;
		gap.showConfirm({
			title: gap.lang.basic_delete,
			iconClass: 'remove',
			contents: gap.lang.confirm_delete,
			callback: function(){
				gap.delete_notice(docid, type);
			}
		});
	},
	
	"saveNoticeReply" : function(){
		var _self = this;
		var $layer = $('#notice_ly');
		var info = $layer.data('info');
		var txt = $layer.find('.txt-notice-reply').val();
		var $list = $layer.find('.reply-list');
		
		var postData = {
				"key" : info._id.$oid,
				"owner" : gap.userinfo.rinfo,
				"content" : txt
			};
		
		$.ajax({
			type : "POST",
			url : gap.channelserver + "/save_notice_reply.km",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == 'ERROR') {
					gap.gAlert(gap.lang.mt_err_1);
					return;
				}
			
				var res = res.data;
				
				gHome.noticeAddReply(info._id.$oid, res);
				
				// 스크롤 최상단
				var reply_body = $layer.find('.cont-inner').get(0); 
				reply_body.scroll({left:0, top:reply_body.scrollHeight, behavior:'smooth'});
				
				// 값 비우기
				$layer.find('.txt-notice-reply').val('');
				$layer.find('.btn-notice-reply-reg').removeClass('enable');
				
				var p_id = '';
				if (info.callfrom == 'quick_chat') {
					p_id = 'alarm_chat';
				} else if (info.callfrom == 'chat') {
					p_id = 'notice_top_chat';
				} else {
					p_id = 'notice_top_work';
				}
				
				var reply_cnt = parseInt($('#' + p_id).find('.reply-cnt').text()) + 1;
				$('#' + p_id).find('.reply-cnt').text(reply_cnt);
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"removeNoticeReply" : function(rinfo){
		var _self = this;
		var postData = {
				"key" : rinfo.key,
				"rid" : rinfo.rid
			};
		
		$.ajax({
			type : "POST",
			url : gap.channelserver + "/delete_notice_reply.km",
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == 'ERROR') {
					gap.gAlert(gap.lang.mt_err_1);
					return;
				}
				
				var info = $('#notice_ly').data('info');
				$('#notice_reply_' + rinfo.rid).remove();
				
				// 메인 공지 댓글 수 조정
				var p_id = '';
				if (info.callfrom == 'quick_chat') {
					p_id = 'alarm_chat';
				} else if (info.callfrom == 'chat') {
					p_id = 'notice_top_chat';
				} else {
					p_id = 'notice_top_work';
				}
				
				var reply_cnt = parseInt($('#'+p_id).find('.reply-cnt').text()) - 1;
				if (reply_cnt < 0) reply_cnt = 0;
				$('#'+p_id).find('.reply-cnt').text(reply_cnt);
			},
			error : function(e){
				gap.error_alert();
			}
		});		
	}
}

