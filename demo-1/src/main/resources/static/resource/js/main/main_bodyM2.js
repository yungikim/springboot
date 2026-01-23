
function gBodyM2(){
	this.disp_view_mode = (localStorage.getItem('view_mode') == null ? "list" : localStorage.getItem('view_mode'));
	this.select_drive_code = "";
	this.select_drive_name = "";
	this.select_folder_code = "";
	this.select_folder_name = "";
	this.title_path_name = [];
	this.title_path_code = [];	
	this.per_page = (screen.height > 1000 ? "20" : "15");
	this.start_skp = "";
	this.start_page = "1";
	this.cur_page = "1";
	this.total_page_count = "";
	this.total_file_count = "";
	this.query_str = "";
	this.cur_file_count = 0;
	this.cur_file_total_count = 0;
	this.cur_select_display = "";
	this.cur_drive_list_info = "";
	this.cur_folder_list_info = "";
	this.cur_drive_info = "";
	this.cur_channel_info = "";
	this.click_filter_image = "";
	this.click_file_info = "";
	this.move_file_check = "";
	this.files_page_no = "";
	this.load_folder_info = "";
	this.drive_main_menu = "";
	this.callfrom_favorite = "";
	this.parent_folderkey = "";
	this.is_channel_share = "";
	this.scroll_bottom = false;
	this.aleady_select_user_count = 0;
} 

$(document).ready(function(){

});

gBodyM2.prototype = {
	"init" : function(){

	},
	
	"load_drive_main" : function(menu, query_str){
		/*
		 * 드라이브 초기화면 전체 / 내가 올린 / 공유된 파일 호출
		 */
		gBodyM2.drive_main_menu = menu;
		gBodyM2.query_str = (query_str == undefined ? "" : query_str);
		gBodyM2.click_filter_image = "";
		gBodyM2.draw_drive_main_data(1);
	},
	
	"draw_drive_main_data" : function(page_no){
		/*
		 * 드라이브 전체 / 내가 올린 / 공유된 파일 그리기
		 */
		if (page_no == 1){
			$(window).off("scroll");
			gBodyM2.scroll_bottom = false;
			gBodyM2.start_page = "1";
			gBodyM2.cur_page = "1";
			gBodyM2.cur_file_count = 0;
			gBodyM2.cur_file_total_count = 0;
			gBodyM.cur_opt = ""
			
//			var filter_html = "";	
//			filter_html += '	<dl class="filter" id="file_filter">';
//			filter_html += '		<dd><button><span class="ico btn-filter ppt' + (gBodyM2.click_filter_image == "ppt" ? " on" : "") + '">PPT</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter word' + (gBodyM2.click_filter_image == "word" ? " on" : "") + '">word</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter excel' + (gBodyM2.click_filter_image == "excel" ? " on" : "") + '">excel</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter pdf' + (gBodyM2.click_filter_image == "pdf" ? " on" : "") + '">pdf</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter img' + (gBodyM2.click_filter_image == "img" ? " on" : "") + '">image</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter video' + (gBodyM2.click_filter_image == "video" ? " on" : "") + '">video</span></button></dd>';
//			filter_html += '	</dl>';
				
			var filter_html = "";	
			filter_html += '	<dl class="filter mu_mobile" style="min-height:50px" id="file_filter">';
			filter_html += '		<dd><button><span class="ico btn-filter ppt' + (gBodyM2.click_filter_image == "ppt" ? " on" : "") + '">PPT</span></button></dd>';
			filter_html += '		<dd><button><span class="ico btn-filter word' + (gBodyM2.click_filter_image == "word" ? " on" : "") + '">word</span></button></dd>';
			filter_html += '		<dd><button><span class="ico btn-filter excel' + (gBodyM2.click_filter_image == "excel" ? " on" : "") + '">excel</span></button></dd>';
			filter_html += '		<dd><button><span class="ico btn-filter pdf' + (gBodyM2.click_filter_image == "pdf" ? " on" : "") + '">pdf</span></button></dd>';
			filter_html += '		<dd><button><span class="ico btn-filter img' + (gBodyM2.click_filter_image == "img" ? " on" : "") + '">image</span></button></dd>';
			filter_html += '		<dd><button><span class="ico btn-filter video' + (gBodyM2.click_filter_image == "video" ? " on" : "") + '">video</span></button></dd>';
			filter_html += '	</dl>';
			
			var html = "";
			if (gBodyM2.disp_view_mode == "list"){
				html += '<div class="wrap list">';
				html += filter_html;
				html += '	<section id="section_drive_main_list">';
				html += '		<ul id="drive_file_list_area" style="list-style:none">';		
				html += '		</ul>';
				html += '	</section>';
				html += '</div>';
				
			}else{
				html += '<div class="wrap">';
				html += filter_html;
				html += '	<section id="section_drive_main_list">';
				html += '		<div class="wrap-channel">';
				html += '			<ul class="gallery" id="drive_file_data_gallery_area" style="list-style:none">';
				html += '			</ul>';
				html += '		</div>';		
				html += '	</section>';
				html += '</div>';					
			}
			
			$("#dis").html(html);
		}

		gBodyM2.start_skp = (parseInt(gBodyM2.per_page) * (parseInt(page_no))) - (parseInt(gBodyM2.per_page) - 1);
		var surl = gap.channelserver + "/api/files/folder_list_main.km";
		
		//"dtype" : 은 파일 형식으로 필터링 할때 사용한다. ppt, xls, doc, pdf, image, movie, hwp, txt, etc
		var postData = {
				"email" : gap.userinfo.rinfo.ky,
			//	"email" : gap.search_cur_em_sec(),
				"start" : (gBodyM2.start_skp - 1).toString(),
				"perpage" : gBodyM2.per_page,
				"q_str" : gBodyM2.query_str,
				"dtype" : gBodyM2.click_filter_image,
				"type" : gBodyM2.drive_main_menu,
				"depts" : gap.full_dept_codes()
			};

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text",	//"json",
			data : JSON.stringify(postData),
			success : function(__res){
				var res = JSON.parse(__res);
				if (res.result == "OK"){
					gBodyM2.cur_file_count += res.data.filelist.length;
					gBodyM2.cur_file_total_count = res.data.totalcount;
					gBodyM2.draw_drive_main_data_list(page_no, res.data);	
					
				}else{
					if (gBodyM2.query_str != "" && res.data == null){
						gBodyM2.cur_file_count = 0;
						gBodyM2.cur_file_total_count = 0;
						gBodyM2.draw_drive_main_data_list(1, {data:[], totalcount:0});	
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
		
		$("#file_filter dd button span").on("click", function(e){
			$("#file_filter dd button span").removeClass("on");
			
			var id = $(this).get(0).className;
			var filter = "";
			var pre_filter = gBodyM2.click_filter_image;
			
			if ((id.indexOf(pre_filter) > -1) && (pre_filter != "")){
				//alert("기존에 클릭한 거 클릭");
				gBodyM2.click_filter_image = "";
				gBodyM2.draw_drive_main_data(1);
				$(this).removeClass("on");
					
			}else{
				//alert("다른거 클릭");		
				gBodyM2.click_filter_image = id.replace("ico btn-filter ", "");
					
				$(this).addClass("on");
				gBodyM2.draw_drive_main_data(1);
			}
		});		
	},
	
	"draw_drive_main_data_list" : function(page_no, res){		
		if (gBodyM2.query_str == "" && res.filelist.length == 0){
			//데이터가 없는 경우
			var no_file_html = '';
			no_file_html += '<div class="wrap box-empty">';
			no_file_html += '	<dl>';
			no_file_html += '		<dt><span class="ico no-box"></span></dt>';
			no_file_html += '		<dd>' + gap.lang.no_reg_file + '</dd>';
			no_file_html += '	</dl>';
			no_file_html += '</div>';
			
			$("#section_drive_main_list").html(no_file_html);
			gBodyM.mobile_finish();
			return false;
		}
			
		if (gBodyM2.query_str != "" && res.filelist.length == 0){
			//검색된 파일이 없는 경우
			var no_file_html = '';
			no_file_html += '<div class="wrap box-empty">';
			no_file_html += '	<dl>';
			no_file_html += '		<dt><span class="ico no-box"></span></dt>';
			no_file_html += '		<dd>' + gap.lang.searchnoresult + '</dd>';
			no_file_html += '	</dl>';
			no_file_html += '</div>';
			
			$("#section_drive_main_list").html(no_file_html);
			gBodyM.mobile_finish();
			return false;
		}
					
		for (var k = 0;  k < res.filelist.length; k++){
			var file_info = res.filelist[k];
			var file_id = file_info._id;
			var disp_file_name = gap.get_bun_filename(file_info);
			var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(typeof(file_info.lastupdate) != "undefined" ? file_info.lastupdate : file_info.GMT));
			var disp_time = gap.change_date_localTime_only_time(String(typeof(file_info.lastupdate) != "undefined" ? file_info.lastupdate : file_info.GMT));
			var disp_date_time = disp_date + ' ' + disp_time;
			var user_info = gap.user_check(file_info.owner);
			var owner_nm = user_info.name;
			var icon_kind = gap.file_icon_check(file_info.filename);
			var fserver = gap.server_check(file_info.fserver);
			var downloadurl = fserver + "/FDownload.do?id=" + file_info._id + "&ty=" + (gBodyM2.drive_main_menu == "4" ? "3" : "1");
			var file_ext = file_info.file_type;
			var upload_path = file_info.upload_path;
			var show_thumb = false;
			var file_html = '';
			
			if (gBodyM2.disp_view_mode == "list"){
				file_html += '	<li id="' + file_id + '" fserver="' + fserver + '" fname="' + disp_file_name + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '" fdate="' + disp_date_time + '" owner_nm="' + owner_nm + '" fext="' + file_ext + '" upath="' + upload_path + '">';
				file_html += '		<span class="ico ico-file ' + icon_kind + '"></span>';
				file_html += '		<dl>';
				file_html += '			<dt><strong>' + disp_file_name + '</strong></dt>';
				file_html += '			<dd><span>' + owner_nm + gap.lang.hoching + '</span><em>' + disp_date_time + '</em></dd>';
				file_html += '			<dd><span class="channel-name">' + file_info.drive_name + '</span></dd>';
				file_html += '		</dl>';
				file_html += '		<button class="ico btn-more drive-main-file-menu"></button>';
				file_html += '	</li>';
				
				$("#drive_file_list_area").append(file_html);				
					
			}else{
				file_html += '<li class="gallery-info" id="' + file_id + '" fserver="' + fserver + '" fname="' + disp_file_name + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '" fdate="' + disp_date_time + '" owner_nm="' + owner_nm + '" fext="' + file_ext + '" upath="' + upload_path + '">';
				file_html += '	<div class="thm">';
				if (gBodyM2.disp_view_mode == "image" && icon_kind == "img"){
					show_thumb = true;
				}
				if (gBodyM2.disp_view_mode == "gallery" && file_info.thumbOK == "T"){
					show_thumb = true;
				}
				
				if (show_thumb){
					file_html += '		<img src="' + fserver + '/FDownload_thumb.do?id=' + file_id + '&ty=' + (gBodyM2.drive_main_menu == "4" ? "3" : "1") + '">' + (icon_kind == "video" ? '<span class="ico ico-video-b">재생</span>' : "");
				}else{
					file_html += '		<span class="ico ico-b ico-' + icon_kind + '-b"></span>';	
				}
				file_html += '	</div>';
				file_html += '	<dl id="file_bottom_' + file_id + '" class="' + (show_thumb ? "gallery-attach" : "") + '">';
			//	file_html += '		<dt>' + (show_thumb ? '<span class="ico ico-s ' + icon_kind + '"></span>' : "") + '<strong title="' + file_info.filename + '">' + file_info.filename + '</strong><span>&nbsp;(' + gap.file_size_setting(file_info.file_size.$numberLong) + ')</span></dt>';
				file_html += '		<dt>' + (show_thumb ? '<span class="ico ico-s ' + icon_kind + '"></span>' : "") + '<strong title="' + disp_file_name + '">' + disp_file_name + '</strong></dt>';
				file_html += '		<dd><span>' + owner_nm + gap.lang.hoching + '</span><em>' + disp_date_time + '</em></dd>';
				file_html += '		<dd><span class="channel-name">' + file_info.drive_name + '</span></dd>';
				file_html += '	</dl>';
				file_html += '	<button class="ico btn-more drive-main-file-menu"></button>';
				file_html += '</li>';
					
				$("#drive_file_data_gallery_area").append(file_html);				
			}
		}
			
		gBodyM2.event_init_drive_main_list();
		gBodyM2.total_file_count = res.totalcount;
		gBodyM.mobile_finish();
		
		$(window).scroll(function(){
			if($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
				if (!gBodyM2.scroll_bottom) {
					gBodyM2.scroll_bottom = true;
					page_no++;
					gBodyM2.add_drive_main_data_list(page_no);
						
				}else{
					gBodyM2.scroll_bottom = false;
				}
			}
		});		
	},
	
	"add_drive_main_data_list" : function(page_no){
		if (gBodyM2.cur_file_total_count > gBodyM2.cur_file_count){
			gBodyM2.start_skp = (parseInt(gBodyM2.per_page) * (parseInt(page_no))) - (parseInt(gBodyM2.per_page) - 1);
			var surl = gap.channelserver + "/api/files/folder_list_main.km";
			var postData = {
					"email" : gap.userinfo.rinfo.ky,
				//	"email" : gap.search_cur_em_sec(),
					"start" : (gBodyM2.start_skp - 1).toString(),
					"perpage" : gBodyM2.per_page,
					"q_str" : gBodyM2.query_str,
					"dtype" : gBodyM2.click_filter_image,
					"type" : gBodyM2.drive_main_menu,
					"depts" : gap.full_dept_codes()
				};
	
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "text",	//"json",
				data : JSON.stringify(postData),
				async : false,
				success : function(__res){
					var res = JSON.parse(__res);
					if (res.result == "OK"){
						gBodyM2.cur_file_count += res.data.filelist.length;
						gBodyM2.cur_file_total_count = res.data.totalcount;
						gBodyM2.draw_drive_main_data_list(page_no, res.data);	
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
		}
	},
	
	"event_init_drive_main_list" : function(){
		$("#section_drive_main_list li").off();
		$("#section_drive_main_list li").on("click", function(e){
			if (e.target.className == "ico btn-more drive-main-file-menu"){
				//클릭된 파일 정보 세팅
				gBodyM2.click_file_info = "";
				var $selector = $(this);
				var f_id = $selector.attr("id");
				var f_server = $selector.attr("fserver");
				var f_name = $selector.attr("fname");
				var f_md5 = $selector.attr("md5");
				var f_url = $selector.attr("furl");
				var f_date = $selector.attr("fdate");
				var f_owner_nm = $selector.attr("owner_nm");
				var f_ext = $selector.attr("fext");
				var f_upload_path = $selector.attr("upath");
				var ext = gap.is_file_type_filter(f_name);
				var is_preview = true;
				
				if (!gap.check_preview_file(f_name)){
					is_preview = false;
					
					if (ext == "movie" || ext == "img"){
						is_preview = true;
					}
				}
				
				var obj = new Object();
				obj.f_id = f_id;
				obj.f_server = f_server;
				obj.f_name = f_name;
				obj.f_md5 = f_md5;
				obj.f_url = f_url;
				if (ext == "movie"){
					var vserver = gap.search_video_server(f_server);
				//	obj.f_video_url = vserver + "/1/" + f_owner + "/" + f_upload_path + "/" + f_md5 + "/" + f_ext;
					obj.f_video_url = f_server + "/FDownload.do?id=" + f_id + "&ty=1";
				}else{
					obj.f_video_url = "";
				}
				obj.f_type = "drive";
				gBodyM2.click_file_info = obj;
				
	
				//App 팝업 메뉴에서 정보를 표시하기 위해 설정 (파일명, 작성자, 날짜)
				var _disp_file_info = new Object();
		
				_disp_file_info.filename = f_name;
				_disp_file_info.name = f_owner_nm;			
				_disp_file_info.date = f_date;

				/*
				 * 1 : 즐겨찾기, 2 : 상세보기, 3 : URL 복사, 4 : 드라이브 등록, 5 : 미리보기, 6 : 다운로드, 7 : 이동하기, 8 : 삭제하기
				 * favorite 메뉴 : 상세보기 / URL 복사 / 미리보기 / 다운로드 / 삭제하기 
				 */
				var url_link = "kPortalMeet://NativeCall/callChannelMenu"
								+ "?param1="
								+ "&param2=2"
								+ "&param3="
								+ "&param4="
								+ "&param5=" + (is_preview ? "5" : "")
								+ "&param6="
								+ "&param7="
								+ "&param8=8"
								+ "&json=" + encodeURIComponent(JSON.stringify(_disp_file_info))
								+ "&mode=gBodyM2";
				gBodyM.connectApp(url_link);
				return false;

			}else{
				var furl = $(this).attr("furl");
				var fserver = $(this).attr('fserver');
				var fname = $(this).attr('fname');
				var md5 = $(this).attr('md5');
				var fid = $(this).attr('id');
				var thmok = $(this).attr('thmok');
				
				if (is_mobile){
					//모바일 기기에서 호출하는 경우
					
					var url_link = "kPortalMeet://NativeCall/callDetailBox?id=" + fid + "&md5=" + md5 + "&fname=" + fname + "&ty=1&mode=gBodyM2";
					gBodyM.connectApp(url_link);
					return false;
					
				}else{
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
								gBodyM2.draw_file_detail_info(file_info, "1")

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
			}			
		});
	},	
	
	
	"load_favorite" : function(callfrom, query_str){
		/*
		 * 즐겨찾기 호출
		 */
		gBodyM2.callfrom_favorite = callfrom;
		gBodyM2.query_str = (query_str == undefined ? "" : query_str);
		gBodyM2.click_filter_image = "";
		gBodyM2.draw_favorite_data(1);
	},
	
	"draw_favorite_data" : function(page_no){
		/*
		 * 즐겨찾기 그리기
		 */
		if (page_no == 1){
			$(window).off("scroll");
			gBodyM2.scroll_bottom = false;
			gBodyM2.start_page = "1";
			gBodyM2.cur_page = "1";
			gBodyM2.cur_file_count = 0;
			gBodyM2.cur_file_total_count = 0;
			gBodyM.cur_opt = ""
			
//			var filter_html = "";	
//			filter_html += '	<dl class="filter" id="file_filter">';
//			filter_html += '		<dd><button><span class="ico btn-filter ppt' + (gBodyM2.click_filter_image == "ppt" ? " on" : "") + '">PPT</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter word' + (gBodyM2.click_filter_image == "word" ? " on" : "") + '">word</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter excel' + (gBodyM2.click_filter_image == "excel" ? " on" : "") + '">excel</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter pdf' + (gBodyM2.click_filter_image == "pdf" ? " on" : "") + '">pdf</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter img' + (gBodyM2.click_filter_image == "img" ? " on" : "") + '">image</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter video' + (gBodyM2.click_filter_image == "video" ? " on" : "") + '">video</span></button></dd>';
//			filter_html += '	</dl>';
			
			var filter_html = "";	
			filter_html += '	<dl class="filter mu_mobile" style="min-height:50px" id="file_filter">';
			filter_html += '		<dd><button><span  class="ico btn-filter ppt' + (gBodyM2.click_filter_image == "ppt" ? " on" : "") + '">PPT</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter word' + (gBodyM2.click_filter_image == "word" ? " on" : "") + '">word</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter excel' + (gBodyM2.click_filter_image == "excel" ? " on" : "") + '">excel</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter pdf' + (gBodyM2.click_filter_image == "pdf" ? " on" : "") + '">pdf</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter img' + (gBodyM2.click_filter_image == "img" ? " on" : "") + '">image</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter video' + (gBodyM2.click_filter_image == "video" ? " on" : "") + '">video</span></button></dd>';
			filter_html += '	</dl>';
			
			var html = "";
			if (gBodyM2.disp_view_mode == "list"){
				html += '<div class="wrap list">';
				html += filter_html;
				html += '	<section id="section_favorite_list">';
				html += '		<ul id="favorite_file_list_area" style="list-style:none">';		
				html += '		</ul>';
				html += '	</section>';
				html += '</div>';
				
			}else{
				html += '<div class="wrap">';
				html += filter_html;
				html += '	<section id="section_favorite_list">';
				html += '		<div class="wrap-channel">';
				html += '			<ul class="gallery" id="favorite_data_gallery_area" style="list-style:none">';
				html += '			</ul>';
				html += '		</div>';		
				html += '	</section>';
				html += '</div>';					
			}
			
			$("#dis").html(html);
		}

		gBodyM2.start_skp = (parseInt(gBodyM2.per_page) * (parseInt(page_no))) - (parseInt(gBodyM2.per_page) - 1);
		var surl = gap.channelserver + "/api/channel/channel_list.km";
		
		//"dtype" : 은 파일 형식으로 필터링 할때 사용한다. ppt, xls, doc, pdf, image, movie, hwp, txt, etc
		var postData = {
				"channel_code" : "",
				"query_type" : "favoritecontent",
				"email" : gap.userinfo.rinfo.ky,
				"start" : (gBodyM2.start_skp - 1).toString(),
				"perpage" : gBodyM2.per_page,
				"q_str" : gBodyM2.query_str,
				"dtype" : gBodyM2.click_filter_image,
				"type" : gBodyM2.callfrom_favorite
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",	//"json",
			contentType : "application/json; charset=utf-8",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					gBodyM2.cur_file_count += res.data.data.length;
					gBodyM2.cur_file_total_count = res.data.totalcount;
					gBodyM2.draw_favorite_data_list(page_no, res.data);	
					
				}else{
					if (gBodyM2.query_str != "" && res.data == null){
						gBodyM2.cur_file_count = 0;
						gBodyM2.cur_file_total_count = 0;
						gBodyM2.draw_favorite_data_list(1, {data:[], totalcount:0});	
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
		
		$("#file_filter dd button span").on("click", function(e){
			$("#file_filter dd button span").removeClass("on");
			
			var id = $(this).get(0).className;
			var filter = "";
			var pre_filter = gBodyM2.click_filter_image;
			
			if ((id.indexOf(pre_filter) > -1) && (pre_filter != "")){
				//alert("기존에 클릭한 거 클릭");
				gBodyM2.click_filter_image = "";
				gBodyM2.draw_favorite_data(1);
				$(this).removeClass("on");
					
			}else{
				//alert("다른거 클릭");		
				gBodyM2.click_filter_image = id.replace("ico btn-filter ", "");
					
				$(this).addClass("on");
				gBodyM2.draw_favorite_data(1);
			}
		});		
	},
	
	"draw_favorite_data_list" : function(page_no, res){
		if (gBodyM2.query_str == "" && res.data.length == 0){
			//데이터가 없는 경우
			var no_file_html = '';
			no_file_html += '<div class="wrap box-empty">';
			no_file_html += '	<dl>';
			no_file_html += '		<dt><span class="ico no-box"></span></dt>';
			no_file_html += '		<dd>' + gap.lang.no_reg_file + '</dd>';
			no_file_html += '	</dl>';
			no_file_html += '</div>';
			
			$("#section_favorite_list").html(no_file_html);
			gBodyM.mobile_finish();
			return false;
		}
		
		if (gBodyM2.query_str != "" && res.data.length == 0){
			//검색된 파일이 없는 경우
			var no_file_html = '';
			no_file_html += '<div class="wrap box-empty">';
			no_file_html += '	<dl>';
			no_file_html += '		<dt><span class="ico no-box"></span></dt>';
			no_file_html += '		<dd>' + gap.lang.searchnoresult + '</dd>';
			no_file_html += '	</dl>';
			no_file_html += '</div>';
			
			$("#section_favorite_list").html(no_file_html);
			gBodyM.mobile_finish();
			return false;
		}
		
		
		for (var k = 0;  k < res.data.length; k++){
			var file_info = res.data[k];
			var file_id = file_info._id;
			var disp_file_name = gap.get_bun_filename(file_info);
			var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(typeof(file_info.lastupdate) != "undefined" ? file_info.lastupdate : file_info.GMT));
			var disp_time = gap.change_date_localTime_only_time(String(typeof(file_info.lastupdate) != "undefined" ? file_info.lastupdate : file_info.GMT));
			var disp_date_time = disp_date + ' ' + disp_time;
			var owner_info = gap.user_check(gap.userinfo.rinfo);
			var owner_nm = owner_info.name;
			var icon_kind = gap.file_icon_check(file_info.filename);
			var fserver = gap.server_check(file_info.fserver);
			var downloadurl = fserver + "/FDownload.do?id=" + file_info._id + "&ty=3";
			var file_ext = file_info.file_type;
			var upload_path = file_info.upload_path;
			var show_thumb = false;
			var file_html = '';
			
			if (gBodyM2.disp_view_mode == "list"){
				file_html += '	<li id="' + file_id + '" fserver="' + fserver + '" fname="' + disp_file_name + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '" fdate="' + disp_date_time + '" owner_nm="' + owner_nm + '" fext="' + file_ext + '" upath="' + upload_path + '">';
				file_html += '		<span class="ico ico-file ' + icon_kind + '"></span>';
				file_html += '		<dl>';
				file_html += '			<dt><strong>' + disp_file_name + '</strong></dt>';
				file_html += '			<dd><span>' + owner_nm + gap.lang.hoching + '</span><em>' + disp_date_time + '</em></dd>';
				file_html += '		</dl>';
				file_html += '		<button class="ico btn-more favorite-file-menu"></button>';
				file_html += '	</li>';
				
				$("#favorite_file_list_area").append(file_html);				
				
			}else{
				file_html += '<li class="gallery-info" id="' + file_id + '" fserver="' + fserver + '" fname="' + disp_file_name + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '" fdate="' + disp_date_time + '" owner_nm="' + owner_nm + '" fext="' + file_ext + '" upath="' + upload_path + '">';
				file_html += '	<div class="thm">';

				if (gBodyM2.disp_view_mode == "image" && icon_kind == "img"){
					show_thumb = true;
				}
				if (gBodyM2.disp_view_mode == "gallery" && file_info.thumbOK == "T"){
					show_thumb = true;
				}
				
				if (show_thumb){
					file_html += '		<img src="' + fserver + '/FDownload_thumb.do?id=' + file_id + '&ty=3">' + (icon_kind == "video" ? '<span class="ico ico-video-b">재생</span>' : "");	
				}else{
					file_html += '		<span class="ico ico-b ico-' + icon_kind + '-b"></span>';	
				}
				file_html += '	</div>';
				file_html += '	<dl id="file_bottom_' + file_id + '" class="' + (show_thumb ? "gallery-attach" : "") + '">';
				file_html += '		<dt>' + (show_thumb ? '<span class="ico ico-s ' + icon_kind + '"></span>' : "") + '<strong title="' + disp_file_name + '">' + disp_file_name + '</strong><span>&nbsp;(' + gap.file_size_setting(file_info.size.$numberLong) + ')</span></dt>';
				file_html += '		<dd><span>' + owner_nm + gap.lang.hoching + '</span><em>' + disp_date_time + '</em></dd>';
				file_html += '	</dl>';
				file_html += '	<button class="ico btn-more favorite-file-menu"></button>';
				file_html += '</li>';
				
				$("#favorite_data_gallery_area").append(file_html);				
			}
		}
		
		gBodyM2.event_init_favorite_list();
		gBodyM2.total_file_count = res.totalcount;
		gBodyM.mobile_finish();
		
		$(window).scroll(function(){
			if($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
				if (!gBodyM2.scroll_bottom) {
					gBodyM2.scroll_bottom = true;
					page_no++;
					gBodyM2.add_favorite_data_list(page_no);
					
				}else{
					gBodyM2.scroll_bottom = false;
				}
			}
		});		
	},
	
	"add_favorite_data_list" : function(page_no){
		if (gBodyM2.cur_file_total_count > gBodyM2.cur_file_count){
			gBodyM2.start_skp = (parseInt(gBodyM2.per_page) * (parseInt(page_no))) - (parseInt(gBodyM2.per_page) - 1);
			var surl = gap.channelserver + "/api/channel/channel_list.km";
			var postData = {
					"channel_code" : "",
					"query_type" : "favoritecontent",
					"email" : gap.search_cur_em_sec(),
					"start" : (gBodyM2.start_skp - 1).toString(),
					"perpage" : gBodyM2.per_page,
					"q_str" : gBodyM2.query_str,
					"dtype" : gBodyM2.click_filter_image,
					"type" : "1"
				};			
	
			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",	//"json",
				contentType : "application/json; charset=utf-8",
				data : JSON.stringify(postData),
				async : false,
				success : function(res){
					if (res.result == "OK"){
						gBodyM2.cur_file_count += res.data.data.length;
						gBodyM2.cur_file_total_count = res.data.totalcount;
						gBodyM2.draw_favorite_data_list(page_no, res.data);	
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
		}
	},
	
	"event_init_favorite_list" : function(){
		$("#section_favorite_list li").off();
		$("#section_favorite_list li").on("click", function(e){
			if (e.target.className == "ico btn-more favorite-file-menu"){
				//클릭된 파일 정보 세팅
				gBodyM2.click_file_info = "";
				var $selector = $(this);
				var f_id = $selector.attr("id");
				var f_server = $selector.attr("fserver");
				var f_name = $selector.attr("fname");
				var f_md5 = $selector.attr("md5");
				var f_url = $selector.attr("furl");
				var f_date = $selector.attr("fdate");
				var f_owner_nm = $selector.attr("owner_nm");
				var f_ext = $selector.attr("fext");
				var f_upload_path = $selector.attr("upath");
				var ext = gap.is_file_type_filter(f_name);
				var is_preview = true;
				
				if (!gap.check_preview_file(f_name)){
					is_preview = false;
					
					if (ext == "movie" || ext == "img"){
						is_preview = true;
					}
				}
				
				var obj = new Object();
				obj.f_id = f_id;
				obj.f_server = f_server;
				obj.f_name = f_name;
				obj.f_md5 = f_md5;
				obj.f_url = f_url;
				if (ext == "movie"){
					var vserver = gap.search_video_server(f_server);
				//	obj.f_video_url = vserver + "/3/" + gap.userinfo.rinfo.em + "/" + f_upload_path + "/" + f_md5 + "/" + f_ext;
					obj.f_video_url = f_server + "/FDownload.do?id=" + f_id + "&ty=3";
				}else{
					obj.f_video_url = "";
				}
				obj.f_type = "favorite";
				gBodyM2.click_file_info = obj;
				
	
				//App 팝업 메뉴에서 정보를 표시하기 위해 설정 (파일명, 작성자, 날짜)
				var _disp_file_info = new Object();
		
				_disp_file_info.filename = f_name;
				_disp_file_info.name = f_owner_nm;			
				_disp_file_info.date = f_date;

				/*
				 * 1 : 즐겨찾기, 2 : 상세보기, 3 : URL 복사, 4 : 드라이브 등록, 5 : 미리보기, 6 : 다운로드, 7 : 이동하기, 8 : 삭제하기
				 * favorite 메뉴 : 상세보기 / URL 복사 / 미리보기 / 다운로드 / 삭제하기 
				 */
				var url_link = "kPortalMeet://NativeCall/callChannelMenu"
								+ "?param1="
								+ "&param2=2"
								+ "&param3="
								+ "&param4="
								+ "&param5=" + (is_preview ? "5" : "")
								+ "&param6="
								+ "&param7="
								+ "&param8=8"
								+ "&json=" + encodeURIComponent(JSON.stringify(_disp_file_info))
								+ "&mode=gBodyM2";
				gBodyM.connectApp(url_link);
				return false;

			}else{
				var furl = $(this).attr("furl");
				var fserver = $(this).attr('fserver');
				var fname = $(this).attr('fname');
				var md5 = $(this).attr('md5');
				var fid = $(this).attr('id');
				var thmok = $(this).attr('thmok');
				
				if (is_mobile){
					//모바일 기기에서 호출하는 경우
					
					var url_link = "kPortalMeet://NativeCall/callDetailBox?id=" + fid + "&md5=" + md5 + "&fname=" + fname + "&ty=3&mode=gBodyM2";
					gBodyM.connectApp(url_link);
					return false;
					
				}else{
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
								gBodyM2.draw_file_detail_info(file_info, "3")

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
			}			
		});
	},
	
	"mobile_file_detail_info" : function(id, md5, ty){
		
		var surl = gap.channelserver + "/file_info.km";
		var postData = {
				"id" : id,
				"md5" : md5,
				"ty" : ty
			};		

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					var file_info = res.data;
					
					gBodyM2.draw_file_detail_info(file_info, ty)

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
	
	"draw_file_detail_info" : function(info, ty){
		gBodyM.all_close_layer();
		
		//var owner_img = gap.person_photo(ty == "3" ? gap.search_my_photo() : info.owner.pu);
		var owner_img = "";
		if (ty == "3"){
			owner_img = gap.person_profile_photo(gap.userinfo.rinfo);
		}else{
			owner_img = gap.person_profile_photo(info.owner);
		}
		
		var dis_date = gap.change_date_localTime_full2(info.GMT);
		var filename = gap.get_bun_filename(info);	//nfo.filename;
		var size = gap.file_size_setting(parseInt(typeof info.file_size == "undefined" ? info.size.$numberLong : info.file_size.$numberLong));
		var ext = gap.is_file_type_filter(filename);
		
		if (ty == "3"){
			var user_info = gap.user_check(gap.userinfo.rinfo);
			var name = user_info.name;
			var email = user_info.ky;
			
		}else{
			var user_info = gap.user_check(info.owner);
			var name = user_info.name;
			var email = user_info.ky;
		}
		
		var html = "";
		html += "<div class='wrap detail-info'>";
		html += "<section>";
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
	//	if (info.thumbOK == "T"){
		if (gap.check_preview_file(filename) || ext == "movie" || ext == "img"){
			if (ext == "movie" && is_ios){
				// ios는 mp4만 미리보기 가능
				var _ext = "";
				att_names = filename.toString();
				if(att_names.lastIndexOf(".") != -1){
					_ext = att_names.substring(att_names.lastIndexOf(".") + 1);
					if(_ext.search(/[^A-Za-z0-9]/) != -1){
						_ext = _ext.substring(0, _ext.search(/[^A-Za-z0-9]/));
					}
				}
				if (_ext.toLowerCase() == "mp4"){
					html += "<button class='ico btn-file-view' id='detail_file_info_preview'>미리보기</button>";				
				}				
				
			}else{
				html += "<button class='ico btn-file-view' id='detail_file_info_preview'>미리보기</button>";
			}		
		}		
	//	html += "<button class='ico btn-more'>더보기</button>";
		html += "<div class='file-info'>";

		if (gBodyM.check_preview_file(filename) && info.thumbOK == "T"){
			var thumbnail_url = gap.server_check(info.fserver) + "/FDownload_thumb.do?id=" + (ty == "2" ? info._id + "&md5=" + info.md5 : info._id) + "&ty=" + ty;
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
		html += "</section>";
		html += "</div>";
		
		if (ty == "1"){
			$("#member_info_dis").remove();
		}
		$("#dis").html(html);
		
		gBodyM.mobile_finish();
		
		$(".user .user-thumb").off();
		$(".user .user-thumb").on("click", function(e){	
			gBody.click_img_obj = this;	  
    	  	var uid = $(this).attr("data");
    	  	var url_link = "kPortalMeet://NativeCall/callUserProfile?ky=" + encodeURIComponent(uid);
			gBodyM.connectApp(url_link);
        	//_wsocket.search_user_one_for_popup(uid);  
		});
		
		$("#detail_file_info_preview").off();
		$("#detail_file_info_preview").bind("click", info, function(e){
			var info = e.data;
			var fserver = gap.server_check(info.fserver);
			var fname = gap.get_bun_filename(info);	//info.filename;
			var ftype = info.file_type;
			var md5 = info.md5;
			var id = info._id;
			var ext = gap.is_file_type_filter(fname);

			if (ty == "1"){
				var info_fpath = info.fpath.replace(/\\/gi, "/");
				var fpath = info_fpath.split("/upload/")[1];
				var tmp_fpath = fpath.split("/");
				var fpath_array = [];
				for (var i = 0; i < tmp_fpath.length; i++){
					if (i > 0){
						fpath_array.push(tmp_fpath[i]);
					}
				}
				var upload_path = fpath_array.join("-spl-");
				
			}else{
				var upload_path = info.upload_path;
			}

			if (ext == "movie"){
				var vserver = gap.search_video_server(fserver);
			//	var furl = vserver + "/" + ty + "/" + email + "/" + upload_path + "/" + md5 + "/" + ftype;
				var furl = fserver + "/FDownload.do?id=" + (ty == "2" ? id + "&md5=" + md5 : id) + "&ty=" + ty;
				
				gBodyM.call_preview(furl, fname, 'video');
				
			}else if (ext == "img"){	
				var furl = fserver + "/FDownload.do?id=" + (ty == "2" ? id + "&md5=" + md5 : id) + "&ty=" + ty;
				gBodyM.call_preview(furl, fname, 'image');
				
			}else{
			//	gap.show_loading(gap.lang.changeimg);
				gBodyM.mobile_start();
				gBodyM2.file_convert(fserver, fname, md5, id, ty, (ty == "1" ? "drive" : (ty == "2" ? "channel" : "favorite")));

			}
			return false;			
		});
	},
	
	"load_drive" : function(drive_code, drive_name, query_str){
		/*
		 * App 초리화면에서 선택된 드라이브 호출
		 */
		gBodyM2.select_drive_code = drive_code;
		gBodyM2.select_drive_name = drive_name;
		gBodyM2.select_folder_code = "root";
		gBodyM2.select_folder_name = "";
		gBodyM2.title_path_name = [];
		gBodyM2.title_path_code = [];
		gBodyM2.query_str = (query_str == undefined ? "" : query_str);
		gBodyM2.click_filter_image = "";
		
		var surl = gap.channelserver + "/api/files/drive_list_all.km";
		var postData = JSON.stringify({
				"email" : gap.userinfo.rinfo.ky,
				"depts" : gap.full_dept_codes()
			});			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			success : function(res){
				gBodyM2.cur_drive_list_info = res.drive;
				gBodyM2.cur_folder_list_info = res.folder;
				gBodyM2.draw_drive_data(1);
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},
	
	"load_folder" : function(drive_code, folder_code, folder_name){
		/*
		 * App 초리화면에서 선택된 폴더 호출
		 */
		
		gBodyM2.title_path_name = [];
		gBodyM2.title_path_code = [];

		if (gBodyM2.cur_folder_list_info == ""){
			//폴더 리스트 - 최초 1번만 실행
			var surl = gap.channelserver + "/api/files/drive_list_all.km";
			var postData = JSON.stringify({
					"email" : gap.userinfo.rinfo.ky,
					"depts" : gap.full_dept_codes()
				});			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : postData,
				success : function(res){
					gBodyM2.cur_drive_list_info = res.drive;
					gBodyM2.cur_folder_list_info = res.folder;
					gBodyM2.get_folder_path(folder_code);

					gBodyM2.select_drive_code = drive_code;
					for (var i = 0; i < gBodyM2.cur_drive_list_info.length; i++){
						var info = gBodyM2.cur_drive_list_info[i];
						if (info.ch_code == drive_code){
							gBodyM2.select_drive_name = info.ch_name;
							break;
						}
					}
					gBodyM2.select_folder_code = folder_code;
					gBodyM2.select_folder_name = folder_name;
					gBodyM2.title_path_name = gBodyM2.title_path_name.reverse();
					gBodyM2.title_path_code = gBodyM2.title_path_code.reverse();
					gBodyM2.draw_drive_data(1);

				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});
			
		}else{
			gBodyM2.get_folder_path(folder_code);

			gBodyM2.select_drive_code = drive_code;
			for (var i = 0; i < gBodyM2.cur_drive_list_info.length; i++){
				var info = gBodyM2.cur_drive_list_info[i];
				if (info.ch_code == drive_code){
					gBodyM2.select_drive_name = info.ch_name;
					break;
				}
			}
			gBodyM2.select_folder_code = folder_code;
			gBodyM2.select_folder_name = folder_name;
			gBodyM2.title_path_name = gBodyM2.title_path_name.reverse();
			gBodyM2.title_path_code = gBodyM2.title_path_code.reverse();
			gBodyM2.draw_drive_data(1);			
		}
	},
	
	"search_drive" : function(query_str){
		/*
		 * 드라이브/폴더에서 검색 시
		 */
		gBodyM2.query_str = (query_str == undefined ? "" : query_str);
		gBodyM2.draw_drive_data(1);
	},
	
	"init_search_drive" : function(){
		/*
		 * 드라이브/폴더에서 검색 후 취소하는 경우
		 */
		gBodyM2.query_str = "";
		gBodyM2.click_filter_image = "";
		gBodyM2.draw_drive_data(1);
	},
	
	"get_drive_folder_info" : function(){
		var ret = new Object();
		ret.drive_code = gBodyM2.select_drive_code;
		ret.drive_name = gBodyM2.select_drive_name;
		ret.folder_code = gBodyM2.select_folder_code;
		ret.folder_name = gBodyM2.select_folder_name;
		
		return ret;
	},
	
	"get_folder_path" : function(folder_code){
		for (var i = 0; i < gBodyM2.cur_folder_list_info.length; i++){
			var item = gBodyM2.cur_folder_list_info[i];
			if (item._id == folder_code){
				gBodyM2.title_path_code.push(item._id)
				gBodyM2.title_path_name.push(item.folder_name)
				if (item.parent_folder_key != "root"){
					gBodyM2.get_folder_path(item.parent_folder_key);
				}
				break;
			}
		}
		
	},
	
	/*
	 * 드라이브에서 파일 업로드 후 호출
	 * 드라이브에서 파일 이동 후 호출
	 */
	"drive_file_send_complete" : function(){
		if (gBodyM2.select_folder_code == "root"){
			// 드라이브 호출
			gBodyM2.load_drive(gBodyM2.select_drive_code, gBodyM2.select_drive_name, '');
			
		}else{
			// 폴더 호출
			//gBodyM2.cur_folder_list_info = "";
			gBodyM2.load_folder(gBodyM2.select_drive_code, gBodyM2.select_folder_code, gBodyM2.select_folder_name);
		}
		
		// 푸시 발송
		gBodyM2.upload_push();
	},
	
	"draw_drive_data" : function(page_no){
		
		if (page_no == 1){
			$(window).off("scroll");
			gBodyM2.scroll_bottom = false;
			gBodyM2.start_page = "1";
			gBodyM2.cur_page = "1";
			gBodyM2.cur_file_count = 0;
			gBodyM2.cur_file_total_count = 0;
			gBodyM.cur_opt = ""
				
//			var filter_html = "";	
//			filter_html += '	<dl class="filter" id="file_filter">';
//			filter_html += '		<dd><button><span class="ico btn-filter ppt' + (gBodyM2.click_filter_image == "ppt" ? " on" : "") + '">PPT</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter word' + (gBodyM2.click_filter_image == "word" ? " on" : "") + '">word</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter excel' + (gBodyM2.click_filter_image == "excel" ? " on" : "") + '">excel</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter pdf' + (gBodyM2.click_filter_image == "pdf" ? " on" : "") + '">pdf</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter img' + (gBodyM2.click_filter_image == "img" ? " on" : "") + '">image</span></button></dd>';
//			filter_html += '		<dd><button><span class="ico btn-filter video' + (gBodyM2.click_filter_image == "video" ? " on" : "") + '">video</span></button></dd>';
//			filter_html += '	</dl>';		
			
			var filter_html = "";	
			filter_html += '	<dl class="filter mu_mobile" style="min-height:50px" id="file_filter">';
			filter_html += '		<dd><button><span  class="ico btn-filter ppt' + (gBodyM2.click_filter_image == "ppt" ? " on" : "") + '">PPT</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter word' + (gBodyM2.click_filter_image == "word" ? " on" : "") + '">word</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter excel' + (gBodyM2.click_filter_image == "excel" ? " on" : "") + '">excel</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter pdf' + (gBodyM2.click_filter_image == "pdf" ? " on" : "") + '">pdf</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter img' + (gBodyM2.click_filter_image == "img" ? " on" : "") + '">image</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter video' + (gBodyM2.click_filter_image == "video" ? " on" : "") + '">video</span></button></dd>';
			filter_html += '	</dl>';
			
			var html = "";
			if (gBodyM2.disp_view_mode == "list"){
				html += '<div class="wrap list">';
				html += filter_html;
				html += '	<section id="section_drive_list">';
				html += '		<ul id="drive_folder_list_area" style="list-style:none">';
				html += '		</ul>';
				html += '		<ul id="drive_file_list_area" style="list-style:none">';		
				html += '		</ul>';
				html += '	</section>';
				html += '</div>';
				
			}else{
				html += '<div class="wrap">';
				html += filter_html;
				html += '	<section id="section_drive_list">';
				html += '		<div class="wrap-channel">';
				html += '			<ul class="gallery" id="drive_data_gallery_area" style="list-style:none">';
				html += '			</ul>';
				html += '		</div>';		
				html += '	</section>';
				html += '</div>';				
			}

			$("#dis").html(html);
		}
		var query_str = gBodyM2.query_str;

	//	gBodyM2.draw_drive_title_path();
	
		gBodyM2.start_skp = (parseInt(gBodyM2.per_page) * (parseInt(page_no))) - (parseInt(gBodyM2.per_page) - 1);
		var surl = gap.channelserver + "/api/files/folder_list.km";

		//"dtype" : 은 파일 형식으로 필터링 할때 사용한다. ppt, xls, doc, pdf, image, movie, hwp, txt, etc
		var postData = {
				"ty" : (page_no == 1 ? "1" : "2"),	//(gBodyM2.disp_view_mode == "list" ? "1" : (page_no == 1 ? "1" : "2")),
				"drive_key" : gBodyM2.select_drive_code,
				"parent_folder_key" : gBodyM2.select_folder_code,
				"email" : gap.userinfo.rinfo.ky,
				"start" : (gBodyM2.start_skp - 1).toString(),
				"perpage" : gBodyM2.per_page,
				"dtype" : gBodyM2.click_filter_image,
				"q_str" : gBodyM2.query_str,
				"depts" : gap.full_dept_codes()
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text",	//json",
			data : JSON.stringify(postData),
			success : function(__res){
				var title_name = (gBodyM2.select_folder_code == "root" ? gBodyM2.select_drive_name : gBodyM2.select_folder_name);
				var res = JSON.parse(__res);
				if (res.result == "OK"){
					gBodyM2.cur_file_count += res.data.datalist.length;
					gBodyM2.cur_file_total_count = res.data.totalcount;
					gBodyM2.draw_drive_data_list(page_no, res.data);
					
					// APP 좌측 상단에 폴더(드라이브)명 표시
					var url_link = "kPortalMeet://NativeCall/callFolderName?name=" + title_name;
					gBodyM.connectApp(url_link);
					return false;
					
				}else{
					if (gBodyM2.query_str != "" && res.data == null){
						gBodyM2.cur_file_count = 0;
						gBodyM2.cur_file_total_count = 0;
						gBodyM2.draw_drive_data_list(1, {datalist:[], totalcount:0});
						
						// APP 좌측 상단에 폴더(드라이브)명 표시
						var url_link = "kPortalMeet://NativeCall/callFolderName?name=" + title_name;
						gBodyM.connectApp(url_link);
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
		
		$("#file_filter dd button span").on("click", function(e){
			$("#file_filter dd button span").removeClass("on");
			
			var id = $(this).get(0).className;
			var filter = "";
			var pre_filter = gBodyM2.click_filter_image;
			
			if ((id.indexOf(pre_filter) > -1) && (pre_filter != "")){
				//alert("기존에 클릭한 거 클릭");
				gBodyM2.click_filter_image = "";
				gBodyM2.draw_drive_data(1);
				$(this).removeClass("on");
					
			}else{
				//alert("다른거 클릭");		
				gBodyM2.click_filter_image = id.replace("ico btn-filter ", "");
					
				$(this).addClass("on");
				gBodyM2.draw_drive_data(1);
			}
		});
	},
	
	"draw_drive_data_list" : function(page_no, res){
		if (page_no == 1){
			if (gBodyM2.select_folder_code == "root"){
				if (gBodyM2.query_str == "" && res.folderlist.length == 0 && res.datalist.length == 0){
					//데이터가 없는 경우
					var no_file_html = '';
					no_file_html += '<div class="wrap box-empty">';
					no_file_html += '	<dl>';
					no_file_html += '		<dt><span class="ico no-box"></span></dt>';
					no_file_html += '		<dd>' + gap.lang.no_reg_file + '</dd>';
					no_file_html += '	</dl>';
					no_file_html += '</div>';
					
					$("#section_drive_list").html(no_file_html);
					gBodyM.mobile_finish();
					return false;
				}
				
				if (gBodyM2.query_str != "" && res.datalist.length == 0){
					//검색된 파일이 없는 경우
					var no_file_html = '';
					no_file_html += '<div class="wrap box-empty">';
					no_file_html += '	<dl>';
					no_file_html += '		<dt><span class="ico no-box"></span></dt>';
					no_file_html += '		<dd>' + gap.lang.searchnoresult + '</dd>';
					no_file_html += '	</dl>';
					no_file_html += '</div>';
					
					$("#section_drive_list").html(no_file_html);
					gBodyM.mobile_finish();
					return false;
				}
			}
		}

/*		if (gBodyM2.disp_view_mode == "list"){
			$("#drive_folder_list_area").html('');
			$("#drive_file_list_area").html('');			
		}*/

		if (typeof res.folderlist != "undefined"){
			// 상위폴더 이동
			var parent_folder_html = '';
			if (gBodyM2.select_folder_code != "root"){
				if (gBodyM2.disp_view_mode == "list"){
					parent_folder_html += '<li class="parent" id="move_parent_folder" dataty="folder">';
					parent_folder_html += '	<span class="ico ico-file folder-path"></span>';
					parent_folder_html += '	<dl>';
					parent_folder_html += '		<dt><strong>' + gap.lang.parent_folder + '</strong></dt>';
					parent_folder_html += '	</dl>';
					parent_folder_html += '</li>';
					
					$("#drive_folder_list_area").append(parent_folder_html);
					
				}else{
					parent_folder_html += '<li class="gallery-info" id="move_parent_folder" dataty="folder">';
					parent_folder_html += '	<div class="thm"><span class="ico ico-b ico-folder-path-b"></span></div>';
					parent_folder_html += '	<dl class="">';
					parent_folder_html += '		<dt><strong>' + gap.lang.parent_folder + '</strong></dt>';
					parent_folder_html += '	</dl>';
					parent_folder_html += '</li>';
					
					$("#drive_data_gallery_area").append(parent_folder_html);
				}
			}
			
			for (var i = 0;  i < res.folderlist.length; i++){
				var folder_info = res.folderlist[i];
				var folder_id = folder_info._id;
				var folder_name = folder_info.folder_name;
				var user_info = gap.user_check(folder_info.owner);
				var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(folder_info.GMT));
				var disp_time = gap.change_date_localTime_only_time(String(folder_info.GMT));
				var folder_html = '';
				
				if (gBodyM2.disp_view_mode == "list"){
					if (gBodyM2.select_folder_code != "root"){
						
					}
					folder_html += '<li id="' + folder_id + '" dataty="folder">';
				//	folder_html += '	<span class="ico ico-file folder' + (folder_info.folder_share == "Y" ? "-share" : "") + '"></span>';
					folder_html += '	<span class="ico ico-file folder"></span>';
					folder_html += '	<dl>';
					folder_html += '		<dt><strong>' + folder_name + '</strong></dt>';
					folder_html += '		<dd><span>' + user_info.name + gap.lang.hoching + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
					folder_html += '	</dl>';
					
					/*if (folder_info.folder_share == "Y"){
						folder_html += '	<div class="share-member share-folder-member" id="member_' + folder_id + '">';
						folder_html += '		<div class=""><button class="btn-view-member"><span class="ico ico-share-member"></span>' + folder_info.member.length + gap.lang.myung + '</button></div>';
						folder_html += '	</div>';				
					}
					
					if (folder_info.owner.em == gap.userinfo.rinfo.em){
						folder_html += '	<button class="ico btn-more folder-menu"></button>';
					}*/
					folder_html += '</li>';
					
					$("#drive_folder_list_area").append(folder_html);
					
				}else{
					folder_html += '<li class="gallery-info" id="' + folder_id + '" dataty="folder">';
					folder_html += '	<div class="thm" id="folder_' + folder_id + '"><span class="ico ico-b ico-folder-b"></span></div>';
					/*folder_html += '	<div class="thm" id="folder_' + folder_id + '"><span class="ico ico-b ico-folder' + (folder_info.folder_share == "Y" ? "-share" : "") + '-b"></span></div>';
					if (folder_info.folder_share == "Y"){
						folder_html += '	<div class="share-member" id="member_' + folder_id + '">';
						folder_html += '		<div class=""><button class="btn-view-member"><span class="ico ico-share-member"></span>' + folder_info.member.length + gap.lang.myung + '</button></div>';
						folder_html += '	</div>';
					}*/
					folder_html += '	<dl id="folder_bottom_' + folder_id + '" class="">';
					folder_html += '		<dt><strong title="' + folder_name + '">' + folder_name + '</strong></dt>';
					folder_html += '		<dd><span>' + user_info.name + gap.lang.hoching + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
					folder_html += '	</dl>';
					/*if (folder_info.owner.em == gap.userinfo.rinfo.em){
						folder_html += '	<button class="ico btn-more folder-menu"></button>';	
					}*/
					folder_html += '</li>';
					
					$("#drive_data_gallery_area").append(folder_html);					
				}
			}		
		}
				
		for (var k = 0;  k < res.datalist.length; k++){
			var file_info = res.datalist[k];
			var file_id = file_info._id;
			var disp_file_name = gap.get_bun_filename(file_info);
			var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(typeof(file_info.lastupdate) != "undefined" ? file_info.lastupdate : file_info.GMT));
			var disp_time = gap.change_date_localTime_only_time(String(typeof(file_info.lastupdate) != "undefined" ? file_info.lastupdate : file_info.GMT));
			var disp_date_time = disp_date + ' ' + disp_time;
			var owner_info = gap.user_check(file_info.owner);
			var owner_nm = owner_info.name;
			var icon_kind = gap.file_icon_check(file_info.filename);
			var fserver = gap.server_check(file_info.fserver);
			var downloadurl = fserver + "/FDownload.do?id=" + file_info._id + "&ty=1";
			var file_ext = file_info.file_type;
			var upload_path = file_info.fpath;
			var show_thumb = false;
			var file_html = '';
			
			if (gBodyM2.disp_view_mode == "list"){
				file_html += '	<li id="' + file_id + '" dataty="file" owner="' + file_info.owner.em + '" fserver="' + fserver + '" fname="' + disp_file_name + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '" fdate="' + disp_date_time + '" owner_nm="' + owner_nm + '" fext="' + file_ext + '" upath="' + upload_path + '">';
				file_html += '		<span class="ico ico-file ' + icon_kind + '"></span>';
				file_html += '		<dl>';
				file_html += '			<dt><strong>' + disp_file_name + '</strong></dt>';
				file_html += '			<dd><span>' + owner_nm + gap.lang.hoching + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
				file_html += '		</dl>';
				file_html += '		<button class="ico btn-more file-menu"></button>';
				file_html += '	</li>';
				
				$("#drive_file_list_area").append(file_html)				
				
			}else{
				file_html += '<li class="gallery-info" id="' + file_id + '" dataty="file" owner="' + file_info.owner.em + '" fserver="' + fserver + '" fname="' + disp_file_name + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '" fdate="' + disp_date_time + '" owner_nm="' + owner_nm + '" fext="' + file_ext + '" upath="' + upload_path + '">';
				file_html += '	<div class="thm">';

				if (gBodyM2.disp_view_mode == "image" && icon_kind == "img"){
					show_thumb = true;
				}
				if (gBodyM2.disp_view_mode == "gallery" && file_info.thumbOK == "T"){
					show_thumb = true;
				}
				
				if (show_thumb){
					file_html += '		<img src="' + fserver + '/FDownload_thumb.do?id=' + file_id + '&ty=1">' + (icon_kind == "video" ? '<span class="ico ico-video-b">재생</span>' : "");	
				}else{
					file_html += '		<span class="ico ico-b ico-' + icon_kind + '-b"></span>';	
				}
				file_html += '	</div>';
				file_html += '	<dl id="file_bottom_' + file_id + '" class="' + (show_thumb ? "gallery-attach" : "") + '">';
				file_html += '		<dt>' + (show_thumb ? '<span class="ico ico-s ' + icon_kind + '"></span>' : "") + '<strong title="' + disp_file_name + '">' + disp_file_name + '</strong><span>&nbsp;(' + gap.file_size_setting(file_info.file_size.$numberLong) + ')</span></dt>';
				file_html += '		<dd><span>' + owner_nm + gap.lang.hoching + '</span><em>' + disp_date + ' ' + disp_time + '</em></dd>';
				file_html += '	</dl>';
				file_html += '	<button class="ico btn-more file-menu"></button>';
				file_html += '</li>';
				
				$("#drive_data_gallery_area").append(file_html);				
			}
		}
		
		gBodyM2.event_init_drive_list();
		gBodyM2.total_file_count = res.totalcount;
		gBodyM.mobile_finish();
		
		$(window).scroll(function(){
			if($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
				if (!gBodyM2.scroll_bottom) {
					gBodyM2.scroll_bottom = true;
					page_no++;
					gBodyM2.add_drive_data_list(page_no);
					
				}else{
					gBodyM2.scroll_bottom = false;
				}
			}
		});
	},
	
	"add_drive_data_list" : function(page_no){
		if (gBodyM2.cur_file_total_count > gBodyM2.cur_file_count){
			gBodyM2.start_skp = (parseInt(gBodyM2.per_page) * (parseInt(page_no))) - (parseInt(gBodyM2.per_page) - 1);
			var surl = gap.channelserver + "/api/files/folder_list.km";
			var postData = {
					"ty" : (page_no == 1 ? "1" : "2"), //(gBodyM2.disp_view_mode == "list" ? "1" : (page_no == 1 ? "1" : "2")),
					"drive_key" : gBodyM2.select_drive_code,
					"parent_folder_key" : gBodyM2.select_folder_code,
					"email" : gap.userinfo.rinfo.ky,
					"start" : (gBodyM2.start_skp - 1).toString(),
					"perpage" : gBodyM2.per_page,
					"dtype" : gBodyM2.click_filter_image,
					"q_str" : gBodyM2.query_str
				};			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "text",	//"json",
				data : JSON.stringify(postData),
				async : false,
				success : function(__res){
					var res = JSON.parse(__res);
					if (res.result == "OK"){
						gBodyM2.cur_file_count += res.data.datalist.length;
						gBodyM2.cur_file_total_count = res.data.totalcount;
						gBodyM2.draw_drive_data_list(page_no, res.data);
						
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
	
	"event_init_drive_list" : function(){
		$("#section_drive_list li").off();
		$("#section_drive_list li").on("click", function(e){
			var data_type = $(this).attr("dataty");
			
			if (data_type == "folder"){
				// 폴더 클릭
				var folder_id = $(this).attr("id");
				if (folder_id == "move_parent_folder"){
					// 상위폴더 이동 클릭 시 
					if (gBodyM2.title_path_code.length == 1){
						gBodyM2.select_folder_code = "root";
						gBodyM2.select_folder_name = "";
						gBodyM2.title_path_name = [];
						gBodyM2.title_path_code = [];
						gBodyM2.start_page = "1";
						gBodyM2.cur_page = "1";
						gBodyM2.draw_drive_data(1);
						
					}else{
						var array_cnt = gBodyM2.title_path_code.length;
						gBodyM2.select_folder_code = gBodyM2.title_path_code[array_cnt - 2];
						gBodyM2.select_folder_name = gBodyM2.title_path_name[array_cnt - 2];
						gBodyM2.title_path_name.pop();
						gBodyM2.title_path_code.pop();
						gBodyM2.start_page = "1";
						gBodyM2.cur_page = "1";
						gBodyM2.draw_drive_data(1);
					}
					
				}else{
					gBodyM2.select_folder_code = folder_id;
					gBodyM2.select_folder_name = $(this).find("dl dt strong").text();
					gBodyM2.title_path_code.push(gBodyM2.select_folder_code);
					gBodyM2.title_path_name.push(gBodyM2.select_folder_name);
					gBodyM2.draw_drive_data(1);				
				}
				
			}else if (data_type == "file"){
				// 파일 클릭
				if (e.target.className == "ico btn-more file-menu"){
					//클릭된 파일 정보 세팅
					gBodyM2.click_file_info = "";

					var $selector = $(this);
					var f_id = $selector.attr("id");
					var f_server = $selector.attr("fserver");
					var f_name = $selector.attr("fname");
					var f_md5 = $selector.attr("md5");
					var f_url = $selector.attr("furl");
					var f_owner = $selector.attr("owner");
					var f_date = $selector.attr("fdate");
					var f_owner_nm = $selector.attr("owner_nm");
					var f_ext = $selector.attr("fext");
					var f_upload_path = $selector.attr("upath");
					var ext = gap.is_file_type_filter(f_name);
					var is_preview = true;
					
					if (!gap.check_preview_file(f_name)){
						is_preview = false;
						
						if (ext == "movie" || ext == "img"){
							is_preview = true;
						}
					}
					
					var obj = new Object();
					obj.f_id = f_id;
					obj.f_server = f_server;
					obj.f_name = f_name;
					obj.f_md5 = f_md5;
					obj.f_url = f_url;
					if (ext == "movie"){
						var info_fpath = f_upload_path.replace(/\\/gi, "/");
						var fpath = info_fpath.split("/upload/")[1];
						var tmp_fpath = fpath.split("/");
						var fpath_array = [];
						for (var i = 0; i < tmp_fpath.length; i++){
							if (i > 0){
								fpath_array.push(tmp_fpath[i]);
							}
						}
						var upload_path = fpath_array.join("-spl-");
						var vserver = gap.search_video_server(f_server);
					//	obj.f_video_url = vserver + "/1/" + f_owner + "/" + upload_path + "/" + f_md5 + "/" + f_ext;
						obj.f_video_url = f_server + "/FDownload.do?id=" + f_id + "&ty=1";
					//	gap.check_alert(f_server + "/FDownload.do?id=" + f_id + "&ty=1");
					}else{
						obj.f_video_url = "";
					}
					obj.f_type = "drive";
					gBodyM2.click_file_info = obj;
					
					//App 팝업 메뉴에서 정보를 표시하기 위해 설정 (파일명, 작성자, 날짜)
					var _disp_file_info = new Object();
					
					_disp_file_info.filename = f_name;
					_disp_file_info.name = f_owner_nm;			
					_disp_file_info.date = f_date;
					
					
					/*
					 * 1 : 즐겨찾기, 2 : 상세보기, 3 : URL 복사, 4 : 드라이브 등록, 5 : 미리보기, 6 : 다운로드, 7 : 이동하기, 8 : 삭제하기
					 * drive 메뉴 : 즐겨찾기 / 상세보기 / URL 복사 / 미리보기 / 다운로드 / 이동하기 / 삭제하기
					 */
					var url_link = "kPortalMeet://NativeCall/callChannelMenu"
									+ "?param1=1"
									+ "&param2=2"
									+ "&param3="
									+ "&param4="
									+ "&param5=" + (is_preview ? "5" : "")
									+ "&param6="
									+ "&param7=" + (f_owner == gap.search_cur_em() ? "7" : "")
									+ "&param8=" + (f_owner == gap.search_cur_em() ? "8" : "")
									+ "&json=" + encodeURIComponent(JSON.stringify(_disp_file_info))
									+ "&mode=gBodyM2";
					gBodyM.connectApp(url_link);
					return false;
					
				}else{
					var furl = $(this).attr("furl");
					var fname = $(this).attr('fname');
					var md5 = $(this).attr('md5');
					var fid = $(this).attr('id').replace("file_", "");

					if (is_mobile){
						//모바일 기기에서 호출하는 경우
						
						var url_link = "kPortalMeet://NativeCall/callDetailBox?id=" + fid + "&md5=" + md5 + "&fname=" + fname + "&ty=1&mode=gBodyM2";
						gBodyM.connectApp(url_link);
						return false;
						
					}else{
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
									gBodyM2.draw_file_detail_info(file_info, "1")
									
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
				}						
			}
		});
	},	
	
	"load_files_direct" : function(code){
		gBodyM.cur_opt = code;
		gBodyM.select_channel_code = code;
		gBodyM2.load_files();
	},

	"load_files" : function(query_str){
		gBodyM.select_files_tab = true;
		gBodyM2.query_str = (query_str == undefined ? "" : query_str);
		gBodyM2.click_filter_image = "";
		gBodyM2.draw_files(1);
	},	
	
	"draw_files" : function(page_no){
		if (page_no == 1){
			$(window).off("scroll");
			gBodyM2.scroll_bottom = false;
			gBodyM2.start_page = "1";
			gBodyM2.cur_page = "1";
			gBodyM2.cur_file_count = 0;
			gBodyM2.cur_file_total_count = 0;
			
			var filter_html = "";	
			filter_html += '	<dl class="filter mu_mobile" style="min-height:50px" id="file_filter">';
			filter_html += '		<dd><button><span  class="ico btn-filter ppt' + (gBodyM2.click_filter_image == "ppt" ? " on" : "") + '">PPT</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter word' + (gBodyM2.click_filter_image == "word" ? " on" : "") + '">word</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter excel' + (gBodyM2.click_filter_image == "excel" ? " on" : "") + '">excel</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter pdf' + (gBodyM2.click_filter_image == "pdf" ? " on" : "") + '">pdf</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter img' + (gBodyM2.click_filter_image == "img" ? " on" : "") + '">image</span></button></dd>';
			filter_html += '		<dd><button><span  class="ico btn-filter video' + (gBodyM2.click_filter_image == "video" ? " on" : "") + '">video</span></button></dd>';
			filter_html += '	</dl>';			
			
			var html = "";
			if (gBodyM2.disp_view_mode == "list"){
				html += '<div class="wrap list">';
				html += filter_html;
				html += '	<section id="section_files_list">';
				html += '		<ul id="files_data_list_area" style="list-style:none">';		
				html += '		</ul>';
				html += '	</section>';
				html += '</div>';
				
			}else{
				html += '<div class="wrap">';
				html += filter_html;
				html += '	<section id="section_files_list">';
				html += '		<div class="wrap-channel">';
				html += '			<ul class="gallery" id="files_data_gallery_area" style="list-style:none">';
				html += '			</ul>';
				html += '		</div>';		
				html += '	</section>';
				html += '</div>';					
			}
			
			$("#dis").html(html);
		}
		
		gBodyM2.start_skp = (parseInt(gBodyM2.per_page) * (parseInt(page_no))) - (parseInt(gBodyM2.per_page) - 1);
		var surl = gap.channelserver + "/api/channel/channel_list.km";
		
		//"dtype" : 은 파일 형식으로 필터링 할때 사용한다. ppt, xls, doc, pdf, image, movie, hwp, txt, etc
		var postData = {
				"channel_code" : gBodyM.select_channel_code,
				"query_type" : (gBodyM.cur_opt == "" ? "allcontent" : gBodyM.cur_opt),	//gBodyM.cur_opt,
				"start" : (gBodyM2.start_skp - 1).toString(),
				"perpage" : gBodyM2.per_page,
				"q_str" : gBodyM2.query_str,
				"dtype" : gBodyM2.click_filter_image,
				"type" : "2"	//파일만
			};		

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json", //"json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					gBodyM2.cur_file_count += res.data.data.length;
					gBodyM2.cur_file_total_count = res.data.totalcount;
					gBodyM2.draw_files_data_list(page_no, res.data);
					
				}else{
					if (gBodyM2.query_str != "" && res.data == null){
						gBodyM2.cur_file_count = 0;
						gBodyM2.cur_file_total_count = 0;
						gBodyM2.draw_files_data_list(1, {data:[], totalcount:0});	
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
		
		$("#file_filter dd button span").on("click", function(e){
			$("#file_filter dd button span").removeClass("on");
			
			var id = $(this).get(0).className;
			var filter = "";
			var pre_filter = gBodyM2.click_filter_image;
			
			if ((id.indexOf(pre_filter) > -1) && (pre_filter != "")){
				//alert("기존에 클릭한 거 클릭");
				gBodyM2.click_filter_image = "";
				gBodyM2.draw_files(1);
				$(this).removeClass("on");
					
			}else{
				//alert("다른거 클릭");		
				gBodyM2.click_filter_image = id.replace("ico btn-filter ", "");
					
				$(this).addClass("on");
				gBodyM2.draw_files(1);
			}
		});		
	},
	
	"draw_files_data_list" : function(page_no, res){
		gBodyM2.files_page_no = page_no;
		
		if (gBodyM2.query_str == "" && res.data.length == 0){
			//데이터가 없는 경우
			var no_file_html = '';
			no_file_html += '<div class="wrap box-empty">';
			no_file_html += '	<dl>';
			no_file_html += '		<dt><span class="ico no-box"></span></dt>';
			no_file_html += '		<dd>' + gap.lang.no_reg_file + '</dd>';
			no_file_html += '	</dl>';
			no_file_html += '</div>';
			
			$("#section_files_list").html(no_file_html);
			gBodyM.mobile_finish();
			return false;
		}
		
		if (gBodyM2.query_str != "" && res.data.length == 0){
			//검색된 파일이 없는 경우
			var no_file_html = '';
			no_file_html += '<div class="wrap box-empty">';
			no_file_html += '	<dl>';
			no_file_html += '		<dt><span class="ico no-box"></span></dt>';
			no_file_html += '		<dd>' + gap.lang.searchnoresult + '</dd>';
			no_file_html += '	</dl>';
			no_file_html += '</div>';
			
			$("#section_files_list").html(no_file_html);			
			return false;
		}
		
		for (var k = 0;  k < res.data.length; k++){
			var data = res.data[k];
			var disp_date = gap.change_date_default2(gap.change_date_localTime_only_date(String(data.GMT)));
			var disp_time = gap.change_date_localTime_only_time(String(data.GMT));
			var disp_date_time = disp_date + ' ' + disp_time;
			var chcode = data.channel_code;
			var chname = data.channel_name;
			var owner_info = gap.user_check(data.owner);
			var owner_nm = owner_info.name;
			var file_id = data._id;
			var file_info = data.info;
			var fname = file_info.filename;
			var fsize = file_info.file_size.$numberLong;
			var ftype = file_info.file_type;
			var icon_kind = gap.file_icon_check(fname);
			var url = gap.search_fileserver(file_info.nid);
			var fserver = gap.server_check(data.fserver);
			var downloadurl = fserver + "/FDownload.do?id=" + data.id + "&md5=" + file_info.md5 + "&ty=2";
			var file_ext = file_info.file_type;
			var upload_path = data.upload_path;
			var checkbox_val = data.id + "-spl-" + file_info.md5 + "-spl-" + file_id;
			var show_thumb = false;
			var file_html = '';
			
			if (gBodyM2.disp_view_mode == "list"){
				file_html += '	<li id="' + file_id + '"  dataid="' + data.id + '" owner="' + data.email + '" fserver="' + fserver + '" fname="' + fname + '" ftype="' + ftype + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '" fdate="' + disp_date_time + '" owner_nm="' + owner_nm + '" fext="' + file_ext + '" upath="' + upload_path + '">';
				file_html += '		<span class="ico ico-file ' + icon_kind + '"></span>';
				file_html += '		<dl>';
				file_html += '			<dt><strong>' + fname + '</strong></dt>';
				file_html += '			<dd><span>' + owner_nm + gap.lang.hoching  + '</span><em>' + disp_date_time + '</em></dd>';
		//		if (gBody3.check_top_menu2()){
					file_html += '			<dd><span class="channel-name">' + chname + '</span></dd>';
		//		}
				file_html += '		</dl>';
				file_html += '		<button class="ico btn-more files-file-menu"></button>';
				file_html += '	</li>';
				
				$("#files_data_list_area").append(file_html);
				
			}else{
				file_html += '<li class="gallery-info" id="' + file_id + '" dataid="' + data.id + '" owner="' + data.email + '" fserver="' + fserver + '" fname="' + fname + '" ftype="' + ftype + '" md5="' + file_info.md5 + '" furl="' + downloadurl + '" thmok="' + file_info.thumbOK + '" fdate="' + disp_date_time + '" owner_nm="' + owner_nm + '" fext="' + file_ext + '" upath="' + upload_path + '">';
				file_html += '	<div class="thm">';

				if (gBodyM2.disp_view_mode == "image" && icon_kind == "img"){
					show_thumb = true;
				}
				if (gBodyM2.disp_view_mode == "gallery" && file_info.thumbOK == "T"){
					show_thumb = true;
				}
				
				if (show_thumb){
					file_html += '		<img src="' + fserver + '/FDownload_thumb.do?id=' + data.id + '&md5=' + file_info.md5 + '&ty=2">' + (icon_kind == "video" ? '<span class="ico ico-video-b">재생</span>' : "");	
				}else{
					file_html += '		<span class="ico ico-b ico-' + icon_kind + '-b"></span>';	
				}
				file_html += '	</div>';
				file_html += '	<dl class="' + (show_thumb ? "gallery-attach" : "") + '">';
				file_html += '		<dt>' + (show_thumb ? '<span class="ico ico-s ' + icon_kind + '"></span>' : "") + '<strong title="' + fname + '">' + fname + '</strong></dt>';				
				file_html += '		<dd><span>' + owner_nm + gap.lang.hoching + '</span><em>' + disp_date_time + '</em></dd>';
		//		if (gBody3.check_top_menu2()){
					file_html += '		<dd><span class="channel-name">' + chname + '</span></dd>';
		//		}
				file_html += '	</dl>';
				file_html += '	<button class="ico btn-more files-file-menu"></button>';
				file_html += '</li>';
				
				$("#files_data_gallery_area").append(file_html);				
			}
		}
		gBodyM2.event_init_files_list();		
		gBodyM2.total_file_count = res.totalcount;
		gBodyM.mobile_finish();
		
/*		$(window).scroll(function(){
			if($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
				if (!gBodyM2.scroll_bottom) {
					gBodyM2.scroll_bottom = true;
					page_no++;
					gBodyM2.add_files_data_list(page_no);
					
				}else{
					gBodyM2.scroll_bottom = false;
				}
			}
		});*/
	},

	"add_files_data_list" : function(page_no){
		if (gBodyM2.cur_file_total_count > gBodyM2.cur_file_count){
			gBodyM2.start_skp = (parseInt(gBodyM2.per_page) * (parseInt(page_no))) - (parseInt(gBodyM2.per_page) - 1);
			var surl = gap.channelserver + "/api/channel/channel_list.km";
			var postData = {
					"channel_code" : gBodyM.select_channel_code,
					"query_type" : gBodyM.cur_opt,
					"email" : gap.search_cur_em_sec(),
					"start" : (gBodyM2.start_skp - 1).toString(),
					"perpage" : gBodyM2.per_page,
					"q_str" : gBodyM2.query_str,
					"dtype" : gBodyM2.click_filter_image,
					"type" : "2"	//파일만
				};		

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "text", //"json",
				contentType : "application/json; charset=utf-8",
				data : JSON.stringify(postData),
				async : false,
				success : function(res){
					if (res.result == "OK"){
						gBodyM2.cur_file_count += res.data.data.length;
						gBodyM2.cur_file_total_count = res.data.totalcount;
						gBodyM2.draw_files_data_list(page_no, res.data);
												
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
	
	"event_init_files_list" : function(){
		$("#section_files_list li").off()
		$("#section_files_list li").on("click", function(e){
			
			
			if (e.target.className == "ico btn-more files-file-menu"){
				//클릭된 파일 정보 세팅
				gBodyM2.click_file_info = "";
				var $selector = $(this);
				var f_id = $selector.attr("id");
				var f_dataid = $selector.attr("dataid");
				var f_server = $selector.attr("fserver");
				var f_name = $selector.attr("fname");
				var f_md5 = $selector.attr("md5");
				var f_url = $selector.attr("furl");
				var f_date = $selector.attr("fdate");
				var f_owner = $selector.attr("owner");
				var f_owner_nm = $selector.attr("owner_nm");
				var f_ext = $selector.attr("fext");
				var f_upload_path = $selector.attr("upath");
				var ext = gap.is_file_type_filter(f_name);
				var is_preview = true;
				
				if (!gap.check_preview_file(f_name)){
					is_preview = false;
					
					if (ext == "movie" || ext == "img"){
						is_preview = true;
					}
				}
				
				var obj = new Object();
				obj.f_id = f_id;
				obj.f_dataid = f_dataid;
				obj.f_server = f_server;
				obj.f_name = f_name;
				obj.f_md5 = f_md5;
				obj.f_url = f_url;
				if (ext == "movie"){
					var vserver = gap.search_video_server(f_server);
				//	obj.f_video_url = vserver + "/2/" + f_owner + "/" + f_upload_path + "/" + f_md5 + "/" + f_ext;
					obj.f_video_url = f_server + "/FDownload.do?id=" + f_id + "&md5=" + f_md5 + "&ty=2";
				}else{
					obj.f_video_url = "";
				}
				obj.f_type = "files";
				gBodyM2.click_file_info = obj;
				
	
				//App 팝업 메뉴에서 정보를 표시하기 위해 설정 (파일명, 작성자, 날짜)
				var _disp_file_info = new Object();
		
				_disp_file_info.filename = f_name;
				_disp_file_info.name = f_owner_nm;			
				_disp_file_info.date = f_date;

				/*
				 * 1 : 즐겨찾기, 2 : 상세보기, 3 : URL 복사, 4 : 드라이브 등록, 5 : 미리보기, 6 : 다운로드, 7 : 이동하기, 8 : 삭제하기
				 * files 메뉴 : 상세보기 / URL 복사 / 드라이브 등록 / 미리보기 / 다운로드 / 삭제하기
				 */ 
				 
				var url_link = "kPortalMeet://NativeCall/callChannelMenu"
								+ "?param1=1"
								+ "&param2=2"
								+ "&param3="
								+ "&param4=4"
								+ "&param5=" + (is_preview ? "5" : "")
								+ "&param6="
								+ "&param7="
								+ "&param8=" + (f_owner == gap.userinfo.rinfo.em ? "8" : "")
								+ "&json=" + encodeURIComponent(JSON.stringify(_disp_file_info))
								+ "&mode=gBodyM2";
				gBodyM.connectApp(url_link);
				return false;

			}else{
				var furl = $(this).attr("furl");
				var fserver = $(this).attr('fserver');
				var fname = $(this).attr('fname');
				var md5 = $(this).attr('md5');
				var dataid = $(this).attr('dataid');
				var thmok = $(this).attr('thmok');

				if (is_mobile){
					//모바일 기기에서 호출하는 경우
				
					var url_link = "kPortalMeet://NativeCall/callDetailBox?id=" + dataid + "&md5=" + md5 + "&fname=" + fname + "&ty=2&mode=gBodyM2";
					gBodyM.connectApp(url_link);
					return false;
					
				}else{
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
								gBodyM2.draw_file_detail_info(file_info, "2")

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
			}
		});		
	},
	
	"file_convert" : function(fserver, fname, md5, item_id, ty, call){
		/*
		 * ty : 1 / 2 / 3 (드라이브 / 채널 / 즐겨찾기)
		 */
	
		//정보를 가져오지 못해서 찾아서 설정한다.
		var surl = gap.channelserver + "/file_info.km";
		var postData = {
			"id" : item_id,
			"md5" : md5,
			"ty" : ty,
			"log" : "T",
			"type" : "mobile",
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
											
					
		
					if (ty == "1"){
						//드라이브인 경우
						filePath = gap.synapserver + "\\"+ file_info.fpath.replace(gap.nasfolder,"").replace(gap.synapserver, "") + "\\" + file_info.md5 + "." + file_info.file_type;	
					}else if (ty == "2"){
						//채널
						filePath = gap.synapserver + "\\upload\\" + file_info.owner.ky + "\\" + file_info.upload_path + "\\" + file_info.md5 + "." + file_info.file_type;	
					}else if (ty == "3"){
						//즐겨찾기
						filePath = gap.synapserver + "\\upload\\favorite\\" + file_info.ky + "\\" + file_info.upload_path + "\\" + file_info.md5 + "." + file_info.file_type;	
					}			
									
					
					
					if (ty == "todo"){
						gap.hide_loading2();
					}else if (ty == "admin"){
					}else{
						gap.hide_loading();
					}
					
					gap.call_synap(md5, filePath, fname, "TT", call);
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
		
		
		
		
//		return false;
//		var surl = fserver + "/FileConvert.km";
//		var postData = {
//				"id" : item_id,
//				"ty" : ty
//			};	
//
//		if (ty == "2"){
//			postData["md5"] = md5;
//			postData["ft"] = gap.file_extension_check(fname);
//		}
//		
//		$.ajax({
//			type : "POST",
//			url : surl,
//			dataType : "json",
//			data : JSON.stringify(postData),
//			success : function(res){
//				gBodyM.mobile_finish();
//				
//				if (res.result == "OK"){
//					if (isNaN(res.data.count)){
//						mobiscroll.toast({message:gap.lang.noimage, color:'danger'});
//						return false;
//						
//					}else{
//						var url_link = "kPortalMeet://NativeCall/callAfterImage?fserver=" + gap.channelserver + "&fname=" + fname + "&md5=" + md5 + "&totalPage=" + res.data.count;
//						gBodyM.connectApp(url_link);
//						return false;
//					}
//					
//				}else{
//					gap.gAlert(gap.lang.noimage);
//					return false;
//				}
//			},
//			error : function(e){
//				gBodyM.mobile_finish();
//				gap.gAlert(gap.lang.errormsg);
//				return false;
//			}
//		});						
	},
	
	"mobile_file_mng" : function(opt){
		var _ftype = gBodyM2.click_file_info.f_type;
		var _id = (_ftype == "files" ? gBodyM2.click_file_info.f_dataid : gBodyM2.click_file_info.f_id);
		var _fserver = gBodyM2.click_file_info.f_server;
		var _fname = gBodyM2.click_file_info.f_name;
		var _md5 = gBodyM2.click_file_info.f_md5;
		var _furl = gBodyM2.click_file_info.f_url;
		var _fvurl = gBodyM2.click_file_info.f_video_url;
		
		/*
		 * 1 : 즐겨찾기, 2 : 상세보기, 3 : URL 복사, 4 : 드라이브 등록, 5 : 미리보기, 6 : 다운로드, 7 : 이동하기, 8 : 삭제하기
		 */

		if (opt == "1"){
			// 즐겨찾기
			gBodyM2.add_favorite_file(_id, _md5, (_ftype == "drive" ? "1" : "2"));
			
		}else if (opt == "2"){
			//상세보기
			var _ty = (_ftype == "drive" ? "1" : (_ftype == "files" ? "2" : "3"));
			var url_link = "kPortalMeet://NativeCall/callDetailBox?id=" + _id + "&md5=" + _md5 + "&fname=" + _fname + "&ty=" + _ty + "&mode=gBodyM2";
			gBodyM.connectApp(url_link);
			
		}else if (opt == "3"){
			// URL 복사
			gBodyM2.copy_file_url(_furl);
			
		}else if (opt == "4"){
			// 드라이브 등록
			var _dataid = gBodyM2.click_file_info.f_dataid;
			var url_link = "kPortalMeet://NativeCall/callChannelMove?id=" + _dataid + "-spl-" + _md5 + "&mode=gBodyM2";
			gBodyM.connectApp(url_link);
			
		}else if (opt == "5"){
			// 미리보기
			var ext = gap.is_file_type_filter(_fname);
			
			if (ext == "movie"){
				gBodyM.call_preview(_fvurl, _fname, 'video');
				
			}else if (ext == "img"){
				gBodyM.call_preview(_furl, _fname, 'image');
				
			}else{
			//	gap.show_loading(gap.lang.changeimg);
				gBodyM.mobile_start();
				gBodyM2.file_convert(_fserver, _fname, _md5, _id, (_ftype == "drive" ? "1" : (_ftype == "files" ? "2" : "3")), (_ftype == "drive" ? "drive" : (_ftype == "files" ? "channel" : "favorite")));				
			}
			
		}else if (opt == "6"){
			// 다운로드
			gap.file_download_normal(_furl, _fname);
			
		}else if (opt == "7"){
			// 이동하기
			var url_link = "kPortalMeet://NativeCall/callFileMove?id=" + _id + "&mode=gBodyM2";
			gBodyM.connectApp(url_link);
			
		}else if (opt == "8"){
			// 삭제하기
			if (_ftype == "favorite"){
				gBodyM2.delete_favorite_file(_id);
							
			}else if (_ftype == "drive"){
				gBodyM2.drive_delete_select_item(_id);
							
			}else if (_ftype == "files"){
				gBodyM2.delete_files_file(_id, _fname, _md5);
			}			
		}
	},
	
	"add_favorite_file" : function(_id, _md5, _ty){
	//	gBodyM.mobile_finish();
		
		var surl = gap.channelserver + "/api/files/copy_favorite.km";
		var postData = {
				"id" : _id,
			    "md5" : _md5, 
			    "type" : _ty, 
			    "email" : gap.userinfo.rinfo.ky, 
			    "fserver" : gap.channelserver 
			};	
		
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					mobiscroll.toast({message:gap.lang.added_favorite_menu, color:'success'});
					return false;	
					
				}else if (res.result == "EXIST"){
					mobiscroll.toast({message:gap.lang.exist_file, color:'success'});
					return false;	
					
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
	
	"drive_delete_select_item" : function(_id){
	//	gBodyM.mobile_finish();
		
		var is_single = (_id != undefined ? true : false);
		var folder_check = [];
		var file_check = [];
		
		if (is_single){
			file_check.push(_id);
			
		}else{
			$("input[name=folder_checkbox]:checked").each(function() {
				var folder_owner = $(this).attr("owner");
				
				//내가 생성한 폴더만 삭제
				if (folder_owner == gap.userinfo.rinfo.em){
					folder_check.push($(this).val());
					
				}else{
					$(this).prop("checked", false);
				}
			});
			$("input[name=file_checkbox]:checked").each(function() {
				var file_owner = $("#file_" + $(this).val()).attr("owner");
				
				//내가 올린 파일만 삭제
				if (file_owner == gap.userinfo.rinfo.em){
					file_check.push($(this).val());
					
				}else{
					$(this).prop("checked", false);
				}
			});
			
			if (folder_check.length == 0 && file_check.length == 0){
				mobiscroll.toast({message:gap.lang.select_folder_file, color:'danger'});
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
						var surl = gap.channelserver + "/api/files/delete_file_list.km";
						var postData = {
								"folder_item" : folder_check.join("-spl-"),
								"file_item" : file_check.join("-spl-"),
								"drive_code" : gBodyM2.select_drive_code,
								"folder_depth" : gBodyM2.title_path_code
							};			

						$.ajax({
							type : "POST",
							url : surl,
							dataType : "json",
							data : JSON.stringify(postData),
							success : function(res){
								if (res.result == "OK"){
									$("#" + _id).remove();
									
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
					}
				}
			}		 			
		});
	},	
	
	"delete_favorite_file" : function(_id){
	//	gBodyM.mobile_finish();
		
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
				mobiscroll.toast({message:gap.lang.select_file, color:'danger'});
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
									$("#" + _id).remove();
									
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
					}
				}
			}		 			
		});
	},
	
	"delete_files_file" : function(_id, _fname, _md5){
		//더보기 메뉴에서 삭제하는 경우
	//	gBodyM.mobile_finish();
		
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
									$("#" + _id).remove();
									
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
					}
				}
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
		
	//	gBodyM.mobile_finish();
		mobiscroll.toast({message:gap.lang.copy_url_clipboard, color:'success'});
		return false;
	},
	
	"drive_move_file" : function(_id){
		gBodyM2.move_file_check = _id;			//이동 대상 파일의 id
		
		var html = "";
		html += '<div class="wrap drive-path">';
		html += '	<div class="folder-tree">';
		html += '		<ul id="drive_tree" style="list-style:none">';
		html += '		</ul>';
		html += '	</div>';
		html += '</div>';
		
		$("#move_file_layer").html(html);

		// 개인채널 (드라이브)리스트 정보 가져오기
		var surl = gap.channelserver + "/api/files/drive_list.km";
		var postData = {
				"email" : gap.userinfo.rinfo.ky
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				for (var i = 0; i < res.length; i++){
					var data = res[i];
					var _html = '';
					_html += '<li>';
					_html += '	<div id="move_' + data.ch_code + '" data="root">';
					_html += '		<div class="wrap-dummy-fold">';
					_html += '			<span class="ico-fold"></span><span class="ico ico-category drive' + (data.ch_share == "Y" ? "-share" : "") + '"></span>' + data.ch_name
					_html += '		</div>';
					_html += '		<div class="radio">';
					_html += '			<label>';
					_html += '				<input id="radio_' + data.ch_code + '" name="group1" class="with-gap" type="radio">';
					_html += '				<span></span>';
					_html += '			</label>';
					_html += '		</div>';
					_html += '	</div>';
					_html += '</li>';
					
					$("#drive_tree").append(_html);
					
					$("#move_" + data.ch_code).on("click", function(e){
						if (e.target.className == "wrap-dummy-fold on" || e.target.className == "ico-fold on" 
							|| e.target.className == "ico ico-category drive on" || e.target.className == "ico ico-category drive-share on"){
							$("#" + $(this).attr("id") + " .wrap-dummy-fold").removeClass("on");
							$("#" + $(this).attr("id") + " .ico-fold").removeClass("on");
							$("#" + $(this).attr("id") + " .ico-category").removeClass("on");
							$("#" + $(this).attr("id")).parent().find("ul").remove();
							
						}else if (e.target.className == "wrap-dummy-fold" || e.target.className == "ico-fold" 
							|| e.target.className == "ico ico-category drive" || e.target.className == "ico ico-category drive-share"){
							var drive_code = $(this).attr("id").replace("move_", "");
							var folder_code = $(this).attr("data");
							$("#" + $(this).attr("id") + " .wrap-dummy-fold").addClass("on");
							$("#" + $(this).attr("id") + " .ico-fold").addClass("on");
							$("#" + $(this).attr("id") + " .ico-category").addClass("on");
							gBodyM2.draw_sub_folder(drive_code, folder_code, 40, true);

						}else{
							$("#drive_tree div").removeClass("on");
							$("#" + $(this).attr("id")).addClass("on");
						}
					});
					
/*					$("#radio_" + data.ch_code).on("click", function(e){
						gBodyM2.move_file_action();	
					});*/
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
		
		gBodyM.mobile_open_layer('move_file_layer');
	},
	
	"files_reg_drive_select_item" : function(_info){
		gBodyM2.move_file_check = _info;		//드라이브 등록 대상 파일의 id와 md5
				
		var html = "";
		html += '<div class="wrap drive-path">';
		html += '	<div class="folder-tree">';
		html += '		<ul id="drive_tree" style="list-style:none">';
		html += '		</ul>';
		html += '	</div>';
		html += '</div>';
		
		$("#move_file_layer").html(html);

		// 개인채널 (드라이브)리스트 정보 가져오기
		var surl = gap.channelserver + "/api/files/drive_list.km";
		var postData = {
				"email" : gap.userinfo.rinfo.ky
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				for (var i = 0; i < res.length; i++){
					var data = res[i];
					var _html = '';
					_html += '<li>';
					_html += '	<div id="move_' + data.ch_code + '" data="root">';
					_html += '		<div class="wrap-dummy-fold" style="text-overflow:ellipsis; overflow:auto">';
					_html += '			<span class="ico-fold"></span><span class="ico ico-category drive' + (data.ch_share == "Y" ? "-share" : "") + '"></span>' + data.ch_name
					_html += '		</div>';
					_html += '		<div class="radio">';
					_html += '			<label>';
					_html += '				<input id="radio_' + data.ch_code + '" name="group1" class="with-gap" type="radio">';
					_html += '				<span></span>';
					_html += '			</label>';
					_html += '		</div>';
					_html += '	</div>';
					_html += '</li>';
					
					$("#drive_tree").append(_html);
					
					$("#move_" + data.ch_code).on("click", function(e){
						if (e.target.className == "wrap-dummy-fold on" || e.target.className == "ico-fold on" 
							|| e.target.className == "ico ico-category drive on" || e.target.className == "ico ico-category drive-share on"){
							$("#" + $(this).attr("id") + " .wrap-dummy-fold").removeClass("on");
							$("#" + $(this).attr("id") + " .ico-fold").removeClass("on");
							$("#" + $(this).attr("id") + " .ico-category").removeClass("on");
							$("#" + $(this).attr("id")).parent().find("ul").remove();
							
						}else if (e.target.className == "wrap-dummy-fold" || e.target.className == "ico-fold" 
							|| e.target.className == "ico ico-category drive" || e.target.className == "ico ico-category drive-share"){
							var drive_code = $(this).attr("id").replace("move_", "");
							var folder_code = $(this).attr("data");
							$("#" + $(this).attr("id") + " .wrap-dummy-fold").addClass("on");
							$("#" + $(this).attr("id") + " .ico-fold").addClass("on");
							$("#" + $(this).attr("id") + " .ico-category").addClass("on");
							gBodyM2.draw_sub_folder(drive_code, folder_code, 40, true);

						}else{
							$("#drive_tree div").removeClass("on");
							$("#" + $(this).attr("id")).addClass("on");
						}
					});
					
/*					$("#radio_" + data.ch_code).on("click", function(e){
						gBodyM2.move_file_action();	
					});*/
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});

		gBodyM.mobile_open_layer('move_file_layer');		
	},	
	
	"draw_sub_folder" : function(drive_code, folder_code, padding_left, first_call){
		var surl = gap.channelserver + "/api/files/folder_list.km";
		var postData = {
				"ty" : "3", //폴더만
				"drive_key" : drive_code,
				"parent_folder_key" : folder_code,
				"email" : gap.userinfo.rinfo.ky,
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
			success : function(res){
				if (res.result == "OK"){
					if (res.data.folderlist.length == 0){
						if (folder_code == "root"){
							$("#move_" + drive_code + " .ico-fold").remove();
							
						}else{
							$("#move_" + folder_code + " .ico-fold").remove();
						}
						return false;
					}

					for (var i = 0; i < res.data.folderlist.length; i++){
						var folder_info = res.data.folderlist[i];
						var drive_key = folder_info.drive_key;
						var folder_id = folder_info._id;
						var folder_name = folder_info.folder_name;
						var _html = '';
						
						_html += '<ul style="list-style:none">';
						_html += '	<li>';
						_html += '		<div id="move_' + folder_id + '" data="' + drive_key + '" data-pl="' + padding_left + '" style="padding-left:' + padding_left + 'px;">';
						_html += '			<div class="wrap-dummy-fold" style="text-overflow:ellipsis; overflow:auto">';
						_html += '				<span class="ico-fold"></span><span class="ico ico-category folder' + (folder_info.folder_share == "Y" ? "-share" : "") + '"></span>' + folder_name ;
						_html += '			</div>';
						_html += '			<div class="radio">';
						_html += '				<label>';
						_html += '					<input id="radio_' + folder_id + '" name="group1" class="with-gap" type="radio">';
						_html += '					<span></span>';
						_html += '				</label>';
						_html += '			</div>';
						_html += '		</div>';
						_html += '	</li>';
						_html += '</ul>';
						
						if (first_call){
							$("#move_" + drive_code).parent().append(_html);
							
						}else{
							$("#move_" + folder_code).parent().append(_html);
						}

						$("#move_" + folder_id).on("click", function(e){
							if (e.target.className == "wrap-dummy-fold on" || e.target.className == "ico-fold on" 
								|| e.target.className == "ico ico-category folder on" || e.target.className == "ico ico-category folder-share on"){
								$("#" + $(this).attr("id") + " .wrap-dummy-fold").removeClass("on");
								$("#" + $(this).attr("id") + " .ico-fold").removeClass("on");
								$("#" + $(this).attr("id") + " .ico-category").removeClass("on");
								$("#" + $(this).attr("id")).parent().find("ul").remove();
								
							}else if (e.target.className == "wrap-dummy-fold" || e.target.className == "ico-fold" 
								|| e.target.className == "ico ico-category folder" || e.target.className == "ico ico-category folder-share"){
								if (e.target.className == "wrap-dummy-fold"){
									if ($(e.target).children().eq(0).hasClass('on')){
										$("#" + $(this).attr("id") + " .wrap-dummy-fold").removeClass("on");
										$("#" + $(this).attr("id") + " .ico-fold").removeClass("on");
										$("#" + $(this).attr("id") + " .ico-category").removeClass("on");
										$("#" + $(this).attr("id")).parent().find("ul").remove();
										return false;
									}
								}
								var drive_code = $(this).attr("data");
								var folder_code = $(this).attr("id").replace("move_", "");
								var padding_left_set = parseInt($(this).attr("data-pl")) + 20;
								$("#" + $(this).attr("id") + " .wrap-dummy-fold").addClass("on");
								$("#" + $(this).attr("id") + " .ico-fold").addClass("on");
								$("#" + $(this).attr("id") + " .ico-category").addClass("on");
								gBodyM2.draw_sub_folder(drive_code, folder_code, padding_left_set, false);

							}else{
								$("#drive_tree div").removeClass("on");
								$("#" + $(this).attr("id")).addClass("on");
							}
						});
						
/*						$("#radio_" + folder_id).on("click", function(e){
							gBodyM2.move_file_action();
						});		*/				
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
		if (_selector.attr("data") == "root"){
			return _path
		}else{
			var _id = _selector.parent().parent().siblings("div").attr("id").replace("move_", "");
			var _ele = _selector.parent().parent().siblings("div");
			var _fullpath = _id + "/" + _path
			
			if (_selector.parent().parent().siblings("div").attr("data") == "root"){
				return _fullpath;
			}else{
				return gBodyM2.get_move_fullpath(_ele, _fullpath);
			}		
		}
	},	

	"move_file_action" : function(){
		var is_selected = false;
		$("#drive_tree div").each(function(idx){
			if ($(this).hasClass("on")){
				is_selected = true;
			}
		});
		
		if (is_selected == false){
			mobiscroll.toast({message:gap.lang.select_location_to_move, color:'danger'});
			return false;
		}		
		
		var msg = gap.lang.confirm_file_move;
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
						var drive_code = "";
						var folder_code = "";
						var full_path_code = "";
						$("#drive_tree div").each(function(idx){
							if ($(this).hasClass("on")){
								if ($(this).attr("data") == "root"){
									//최상위 드라이브를 선택한 경우
									drive_code = $(this).attr("id").replace("move_", "")
									folder_code = $(this).attr("data")
			
								}else{
									drive_code = $(this).attr("data")
									folder_code = $(this).attr("id").replace("move_", "")
								}
								full_path_code = gBodyM2.get_move_fullpath($(this), $(this).attr("id").replace("move_", ""));
							}
						});
		
						var surl = gap.channelserver + "/move_folder.km";
						var postData = {
								"drive_code" : drive_code,
								"folder_code" : folder_code,
								"target_path" : full_path_code,
								"file_item" : gBodyM2.move_file_check,
								"fserver" : gap.channelserver
						};

						$.ajax({
							type : "POST",
							url : surl,
							dataType : "json",
							data : JSON.stringify(postData),
							success : function(res){
								if (res.result == "OK"){
									for (var k = 0; k < gBodyM2.move_file_check.length; k++){
										$("#" + gBodyM2.move_file_check[k]).remove();
									}
									gBodyM.mobile_close_layer('move_file_layer');
									var url_link = "kPortalMeet://NativeCall/callMoveFinish?done=yes&from=drive";
									gBodyM.connectApp(url_link);
									return false;
									
									/*
									 * kPortalMeet://NativeCall/callMoveFinish?done=yes&from=drive 호출 후 App에서
									 * gBodyM2.drive_file_send_complete(); 호출
									 */
									
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
					}
				}
			}		 			
		});				
	},
	
	"reg_drive_file_action" : function(){
		var is_selected = false;
		$("#drive_tree div").each(function(idx){
			if ($(this).hasClass("on")){
				is_selected = true;
			}
		});
		
		if (is_selected == false){
			mobiscroll.toast({message:gap.lang.select_location_to_reg, color:'danger'});
			return false;
		}
		
		var msg = gap.lang.confirm_reg;
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
									drive_name = $.trim($(this).text());	//$(this).text().trim();
									folder_code = $(this).attr("data");
									folder_name = "";
						
								}else{
									drive_code = $(this).attr("data");
									drive_name = $.trim($("#move_" + drive_code).text());	//$("#move_" + drive_code).text().trim();
									folder_code = $(this).attr("id").replace("move_", "")
									folder_name = $.trim($(this).text());	//$(this).text().trim();;
								}
								full_path_code = gBodyM2.get_move_fullpath($(this), $(this).attr("id").replace("move_", ""));
							}
						});
						
						var fid_array = new Array();
						var md5_array = new Array();
						
						var _val = gBodyM2.move_file_check.split("-spl-");
						fid_array.push(_val[0]);
						md5_array.push(_val[1]);

						var surl = gap.channelserver + "/channel_file_copy_drive.km";
						var postData = {
								"md5s" : md5_array,
								"channel_ids" : fid_array,
								"email" : gap.userinfo.rinfo.ky,
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
							success : function(res){
								if (res.result == "OK"){
									gBodyM.mobile_close_layer('move_file_layer');
									gBodyM.mobile_close();
									return false;

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
					}
				}
			}		 			
		});				
	},	
	
	"remove_selected_item" : function(_id){
		$("#" + _id).remove();
	},
	
	"draw_exit_info_list" : function(ty){
		/*
		 * 나간 드라이브/채널 목록
		 */
		var html = '';
		html += '<div class="wrap list list-exit">';
		html += '	<ul id="exit_info_list" style="list-style:none">';
		html += '	</ul>';
		html += '</div>';
		
		$("#exit_info_layer").html(html);

		//나간 드라이브/채널 리스트 가져오기
		var surl = gap.channelserver + "/api/files/exit_list.km";
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
					for (var i = 0; i < res.data.length; i++){
						var _info = res.data[i];
						var _html = '';
						_html += '<li>';
						_html += '	<span class="ico ico-category ' + (ty == "1" ? "drive" : "channel") + (_info.ch_share == "Y" ? "-share" : "") + '" style="width:18px; height:18px;"></span>';
						_html += '	<dl>';
						_html += '		<dt><strong>'+ _info.ch_name + '</strong></dt>';
						_html += '	</dl>';
						_html += '	<button class="btn-entry" id="enter_' + _info.ch_code + '"><span>' + gap.lang.enter + '</span></button>';
						_html += '</li>';
						$("#exit_info_list").append(_html);

						//등러가기 버튼 클릭
						$("#enter_" + _info.ch_code).bind("click", _info, function(event){
							var msg = gap.lang.confirm_enter;
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
											gBodyM2.enter_info(event.data, ty);
										}
									},
									cancel : {
										keys: ['esc'],
										text : gap.lang.Cancel,
										btnClass : "btn-default",
										action : function(){
										}
									}
								}		 			
							});								
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

		gBodyM.mobile_open_layer('exit_info_layer');
		gBodyM.mobile_finish();
	},
	
	"enter_info" : function(_info, _ty){
		/*
		 * 나간 드라이브/채털 들어가기
		 */
		var surl = gap.channelserver + "/enter_info.km";
		var postData = JSON.stringify({
				"id" : _info.ch_code,
				"ty" : _ty,
				"owner" : gap.userinfo.rinfo
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
					gBodyM.mobile_close_layer('exit_info_layer');
					var url_link = "kPortalMeet://NativeCall/callCloseLayer?done=yes";
					gBodyM.connectApp(url_link);
					return false;					
					
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
	
	"set_view_mode" : function(opt){
		/*
		 * 보기 모드 설정
		 * [opt] 1 : list, 2 : image, 3 : gallery
		 */
		if (opt == "1"){
			localStorage.setItem('view_mode', 'list');
			gBodyM2.disp_view_mode = "list";
			
		}else if (opt == "2"){
			localStorage.setItem('view_mode', 'image');
			gBodyM2.disp_view_mode = "image";
			
		}else if (opt == "3"){
			localStorage.setItem('view_mode', 'gallery');
			gBodyM2.disp_view_mode = "gallery";
		}
		gBodyM2.query_str = "";		//검색어 초기화
	},
	
	"favorite_view_mode" : function(opt){
		/*
		 * 즐겨찾기 보기 모드 선택
		 * [opt] 1 : list, 2 : image, 3 : gallery
		 */
		gBodyM2.set_view_mode(opt);
		gBodyM2.draw_favorite_data(1);
	},	
	
	"drive_view_mode" : function(opt){
		/*
		 * 드라이브 보기 모드 선택
		 * [opt] 1 : list, 2 : image, 3 : gallery
		 */
		gBodyM2.set_view_mode(opt);
		gBodyM2.draw_drive_data(1);
	},
	
	"drive_main_view_mode" : function(opt){
		/*
		 * 드라이브 보기 모드 선택
		 * [opt] 1 : list, 2 : image, 3 : gallery
		 */
		gBodyM2.set_view_mode(opt);
		gBodyM2.draw_drive_main_data(1);
	},
	
	"channel_view_mode" : function(opt){
		/*
		 * 채널 보기 모드 선택
		 * [opt] 1 : list, 2 : image, 3 : gallery
		 */
		gBodyM2.set_view_mode(opt);
		gBodyM2.draw_files(1);
	},
	
	"drive_layer_html" : function(is_drive_share){
		is_drive_share = 'Y';
		var html = '';
		
		var html =
			'<div class="mu_mobile mo_popup drive-create-mu" style="padding:10px; border-radius;0">' +
			'	<div class="mo_table_box">' +
			'		<div class="search_sec">' +
			'			<input type="text" id="input_drive" placeholder="' + gap.lang.input_drive_name + '">' +
			'		</div>' +
			'		<div class="search_sec" style="margin-top:10px;">' +
			'			<input type="text" id="input_drive_user" placeholder="' + gap.lang.input_invite_user + '">' +
			'			<button type="button" id="search_user" class="mo_ico ico-org-search">' + gap.lang.search + '</button>';
		
		if (gap.is_show_org(gap.userinfo.rinfo.ky)) {
			html +=
				'			<button type="button" id="search_org" class="mo_ico ico-org"></button>';			
		}
		
		html +=
			'		</div>' +
			'		<div class="after_select search-result-wrap" style="display:none;">' +
			'			<ul id="drive_member_list" class="search-result-list"></ul>' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		return html;
	},
	
	"create_drive" : function(ch_code, flag){
		/*
		 * 드라이브 생성 화면 표시
		 */
		var is_update = (ch_code != undefined ? true : false);
		var is_drive_share = (flag != undefined ? flag : "");
		var html = gBodyM2.drive_layer_html(is_drive_share);
		$("#create_channel_layer").html(html);
		
		if (is_update){
			//드라이브 정보 update인 경우
			gBodyM2.cur_drive_info = "";	//초기화
			var surl = gap.channelserver + "/api/channel/search_info.km";
			var postData = {
					"type" : "D",
					"ch_code" : ch_code
				};			

			$.ajax({
				type : "POST",
				contentType : "application/json; charset=utf-8",
				url : surl,
				dataType : "json",
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){
						gBodyM2.cur_drive_info = res.data;
						$("#input_drive").val(gap.textToHtml(res.data.ch_name));
						if (res.data.ch_share == "Y"){
							for (var i = 0; i < res.data.member.length; i++){
								gBodyM2.channel_add_user("D", res.data.member[i]);
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
		
		$("#search_user").on("click", function(){
			if ($.trim($("#input_drive_user").val()) == ""){
				mobiscroll.toast({message:gap.lang.input_invite_user, color:'danger'});
				return;
			}
			gBodyM.org_search(false, $("#input_drive_user").val(), 'gBodyM2', 'drive_org_user');
			$("#input_drive_user").val('');
		});
		
		$("#input_drive_user").keydown(function(evt){
			if (evt.keyCode == 13){
				if ($.trim($("#input_drive_user").val()) == ""){
					mobiscroll.toast({message:gap.lang.input_invite_user, color:'danger'});
					return;
				}
				gBodyM.org_search(false, $("#input_drive_user").val(), 'gBodyM2', 'drive_org_user');
				$("#input_drive_user").val('');
			}

		});
		
		$("#search_org").on("click", function(){
			gBodyM.org_open(false, 'gBodyM2', 'drive_org_user');
		});

		gBodyM.mobile_open_layer('create_channel_layer');
		gBodyM.mobile_finish();
	},
	
	"create_drive_action" : function(ch_code){
		/*
		 * 드라이브 생성/수정
		 */
		var is_update = (ch_code != undefined ? true : false);
		if ($.trim($("#input_drive").val()) == ""){
			mobiscroll.toast({message:gap.lang.input_drive_name, color:'danger'});
			return false;
		}
		var readers = [];
		var user_list = [];
		var user_ky_list = [];
		var new_member_ky = "";
		var delete_members = "";
		var channel_name = $("#input_drive").val();
		var member_count = $("#drive_member_list").children().length;
		
		readers.push(gap.userinfo.rinfo.ky);
		
		if (member_count == 0){
			var postData = {
				"ch_name" : channel_name,
				"ch_share" : "N",
				"owner" : gap.userinfo.rinfo,
				"readers" : readers,	//gap.userinfo.rinfo.ky
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
			var pre_member_ky = $.map(gBodyM2.cur_drive_info.member, function(ret, key) {
				return ret.ky;
			});
			new_member_ky = $(user_ky_list).not(pre_member_ky);
			var pre_member_em = $.map(gBodyM2.cur_drive_info.member, function(ret, key) {
				return ret.em;
			});
			delete_members = $(pre_member_em).not(readers);
			
			if (delete_members.length > 0){
				for (var i = 0; i < delete_members.length; i++){
					delete_members_em.push(delete_members[i]);
				}
			}
			
			postData.delete_members = delete_members_em;
			postData.ch_code = ch_code;
		}
					
		var surl = gap.channelserver + "/api/files/" + (is_update ? "drive_update.km" : "create_person_drive.km");
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text",
			data : JSON.stringify(postData),
			success : function(ress){
				var res = JSON.parse(ress);
				if (res.result == "OK"){
					// member에게 소켓 전송
					
					if (is_update){
						// 새로 추가된 멤버
						var list = [];
//						for (var k = 0; k < new_member_ky.length; k++){
//							
//						}
						if (new_member_ky.length > 0){
							var _noti = new Object();
							_noti.type = "drive_member";								
							_noti.p_code = ch_code;
							_noti.p_name = channel_name;
							_noti.f_code = "root";
							_noti.title = "";
							_noti.sender = new_member_ky;
							//_wsocket.send_drive_msg(_noti);
							gBodyM.send_box_msg(_noti, 'drive');
						}

						
						//모바일  Push를 날린다. ///////////////////////////////////
						if (new_member_ky.length > 0 ){
							var new_member_ky_list = [];
							for (var j = 0; j < new_member_ky.length; j++){
								new_member_ky_list.push(new_member_ky[j]);
							}
							
							var smsg = new Object();
							smsg.msg = "[" + channel_name + "] " + gap.lang.miv;
							smsg.title = "DSW[Drive]";		
							smsg.type = "drive_member";
							smsg.key1 = ch_code;
							smsg.key2 = "";
							smsg.key3 = channel_name;
							smsg.fr = gap.userinfo.rinfo.nm;
							smsg.sender = new_member_ky_list.join("-spl-");										
						//	gap.push_noti_mobile(smsg);
							
							//알림센터에 푸쉬 보내기
							var rid = ch_code;
							var receivers = new_member_ky_list;
							var msg2 = "[" + gap.textToHtml(channel_name) + "] " + gap.lang.miv;
							var sendername = "["+gap.lang.drive+" : "+ gap.textToHtml(channel_name) +"]"
							var data = smsg;
							gap.alarm_center_msg_save(receivers, "kp_files", sendername, msg2, rid, smsg);
						}
						////////////////////////////////////////////////////
						
					}else{
						if (member_count != 0){
							var sender_list = [];
							for (var i = 0; i < user_list.length; i++){
								
								
								if (user_list[i].dsize != "group"){
									sender_list.push(user_list[i].ky);
								}
							}
							
							
							// 드라이브에 초대되었음을 알림.
							if (sender_list.length > 0){
								var _noti = new Object();
								_noti.type = "drive_member";
								_noti.p_code = (is_update ? ch_code : res.ch_code);
								_noti.p_name = channel_name;	//(is_update ? obj.ch_name : res.ch_name);
								_noti.f_code = "root";
								_noti.title = "";
								_noti.sender = sender_list;
								//_wsocket.send_drive_msg(_noti);
								gBodyM.send_box_msg(_noti, 'drive');

								// 신규생성된 드라이브를 PC화면에 추가
								var _obj = new Object();
								_obj.sender = sender_list;
								_obj.ch_code = res.ch_code;
								_obj.ch_name = channel_name;
								_obj.owner = gap.userinfo.rinfo.ky;
								_obj.type = "cd";
							//	_wsocket.send_box_msg(_obj, 'chmng');
								gBodyM.send_box_msg(_obj, 'chmng');
								
							}
							
							
							//모바일 Push발송 등록 ////////////////////////////////////////////////////////	
							if (sender_list.length > 0){
								var smsg = new Object();
								smsg.msg = "[" + channel_name + "] " + gap.lang.miv;	
								smsg.title = "DSW[Drive]";
								smsg.type = "drive_member";		
								smsg.key1 = res.ch_code;
								smsg.key2 = "";
								smsg.key3 = channel_name;
								smsg.fr = gap.userinfo.rinfo.nm;
								//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.	
								smsg.sender = sender_list.join("-spl-");			
							//	gap.push_noti_mobile(smsg);	
								
								//알림센터에 푸쉬 보내기
								var rid = res.ch_code;
								var receivers = sender_list;
								var msg2 = "[" + gap.textToHtml(channel_name) + "] " + gap.lang.miv;
								var sendername = "["+gap.lang.drive+" : "+ gap.textToHtml(channel_name) +"]"
								var data = smsg;
								gap.alarm_center_msg_save(receivers, "kp_files", sendername, msg2, rid, smsg);
							}
					
							/////////////////////////////////////////////////////////////////////	
						}						
					}

					gBodyM.mobile_close_layer('create_channel_layer');
					var url_link = "kPortalMeet://NativeCall/callCloseLayer?done=yes&title=" + encodeURIComponent(channel_name);
					gBodyM.connectApp(url_link);
					return false;										
					
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
	
	"channel_layer_html" : function(is_channel_share){
		is_channel_share = 'Y';
	
		var html =
			'<div class="mu_mobile mo_popup drive-create-mu" style="padding:15px 20px; border-radius;0">' +
			'	<div class="mo_table_box">' +
			'		<div class="search_sec">' +
			'			<input type="text" id="input_channel" placeholder="' + gap.lang.input_channel_name + '">' +
			'		</div>' +
			'		<div class="search_sec" style="margin-top:10px;">' +
			'			<input type="text" id="input_channel_user" placeholder="' + gap.lang.input_invite_user + '">' +
			'			<button type="button" id="search_user" class="mo_ico ico-org-search">' + gap.lang.search + '</button>';
		
		if (gap.is_show_org(gap.userinfo.rinfo.ky)) {
			html +=
				'			<button type="button" id="search_org" class="mo_ico ico-org"></button>';			
		}
		
		html +=
			'		</div>' +
			'		<div class="after_select search-result-wrap" style="display:none;">' +
			'			<ul id="channel_member_list" class="search-result-list"></ul>' +
			'		</div>' +
			'	</div>' +
			
			// 권한 관련 설정
			'	<div class="mo_table_box grant">' +
			'		<div class="cont_wr">' +
			'			<h4>' + gap.lang.cont_reg + '</h4>' +
			'			<div class="radio"><label><input type="radio" id="work_opt_reg_on" class="with-gap" name="work_opt_reg" value="all" checked><span>' + gap.lang.reg_all + '</span></label></div>' +
			'			<div class="radio" style="padding-left:20px;"><label><input type="radio" class="with-gap" id="work_opt_reg_off" name="work_opt_reg" value="user"><span>' + gap.lang.reg_user + '</span></label></div>' +
			'		</div>' +
			'		<div id="reg_opt_wr" style="display:none;">' +
			'			<div class="search_sec" style="margin-top:10px;">' +
			'				<input type="text" id="reg_input_channel_user" placeholder="' + gap.lang.reg_user_ph + '">' +
			'				<button type="button" id="reg_search_user" class="mo_ico ico-org-search">' + gap.lang.search + '</button>';
		
		if (gap.is_show_org(gap.userinfo.rinfo.ky)) {
			html +=
				'			<button type="button" id="reg_search_org" class="mo_ico ico-org"></button>';			
		}
		
		html +=
			'			</div>' +
			'			<div class="after_select search-result-wrap" style="display:none;">' +
			'				<ul id="reg_member_list" class="search-result-list"></ul>' +
			'			</div>' +
			'		</div>' +
			
			'		<div class="cont_wr">' +
			'			<h4>' + gap.lang.cont_del + '</h4>' +
			'			<div class="radio"><label><input type="radio" id="work_opt_del_on" class="with-gap" name="work_opt_del" value="T"><span>' + gap.lang.enable + '</span></label></div>' +
			'			<div class="radio" style="padding-left:20px;"><label><input type="radio" id="work_opt_del_off" class="with-gap" name="work_opt_del" value="F" checked><span>' + gap.lang.disable + '</span></label></div>' +
			'		</div>' +
			
			'		<div class="cont_wr">' +
			'			<h4>' + gap.lang.cont_copy + '</h4>' +
			'			<div class="radio"><label><input type="radio" id="work_opt_copy_on" class="with-gap" name="work_opt_copy" value="T" checked><span>' + gap.lang.enable + '</span></label></div>' +
			'			<div class="radio" style="padding-left:20px;"><label><input type="radio" id="work_opt_copy_off" class="with-gap" name="work_opt_copy" value="F"><span>' + gap.lang.disable + '</span></label></div>' +
			'		</div>' +
			
			'		<div class="cont_wr">' +
			'			<h4>' + gap.lang.opt_reply + '</h4>' +
			'			<div class="radio"><label><input type="radio" id="work_opt_reply_on" class="with-gap" name="work_opt_reply" value="T" checked><span>' + gap.lang.enable + '</span></label></div>' +
			'			<div class="radio" style="padding-left:20px;"><label><input type="radio" id="work_opt_reply_off" class="with-gap" name="work_opt_reply" value="F"><span>' + gap.lang.disable + '</span></label></div>' +
			'		</div>' +
			'	</div>' +
			// 권한 설정 기능 End
			
			'</div>';
		
		return html;
	},
	
	"create_channel" : function(ch_code, f_code, flag){
		/*
		 * 채널 생성/수정 화면 표시
		 */
		gBodyM2.parent_folderkey = "";
		var is_update = (ch_code != undefined ? true : false);
		var folderkey = (f_code != undefined ? f_code : "");
		gBodyM2.is_channel_share = (flag != undefined ? flag : "");
		
		gBodyM2.parent_folderkey = folderkey;
		
		var html = gBodyM2.channel_layer_html(gBodyM2.is_channel_share);
		$("#create_channel_layer").html(html);
		
		if (is_update){
			//채널 정보 update인 경우
			gBodyM2.cur_channel_info = "";	//초기화
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
					if (res.result == "OK"){
						gBodyM2.cur_channel_info = res.data;
						folderkey = (res.data.folderkey != undefined ? res.data.folderkey : "");
						gBodyM2.parent_folderkey = folderkey;
						
						$("#input_channel").val(gap.textToHtml(res.data.ch_name));
						if (res.data.ch_share == "Y"){
							for (var i = 0; i < res.data.member.length; i++){
								gBodyM2.channel_add_user("C", res.data.member[i]);
							}			
						}
						
						// 옵션 처리
						var obj = res.data;
						if (obj.opt_reg){
							$('[name="work_opt_reg"][value="' + obj.opt_reg + '"]').prop('checked', true);
							$('[name="work_opt_del"][value="' + obj.opt_del + '"]').prop('checked', true);
							$('[name="work_opt_copy"][value="' + obj.opt_copy + '"]').prop('checked', true);
							$('[name="work_opt_reply"][value="' + obj.opt_reply + '"]').prop('checked', true);
							
							if (obj.opt_reg == 'all'){
								$('#reg_opt_wr').hide();
							} else {
								$('#reg_opt_wr').show();
								
								$.each(obj.opt_reg_list, function(){
									gBodyM2.channel_add_user("CO", this);
								});
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
		
		$("#search_user").on("click", function(){
			if ($.trim($("#input_channel_user").val()) == ""){
				mobiscroll.toast({message:gap.lang.input_invite_user, color:'danger'});
				return;
			}
			gBodyM.org_search(false, $("#input_channel_user").val(), 'gBodyM2', 'channel_org_user');
			$("#input_channel_user").val('');
		});
		
		$("#input_channel_user").keydown(function(evt){
			if (evt.keyCode == 13){
				if ($.trim($("#input_channel_user").val()) == ""){
					mobiscroll.toast({message:gap.lang.input_invite_user, color:'danger'});
					return;
				}
				gBodyM.org_search(false, $("#input_channel_user").val(), 'gBodyM2', 'channel_org_user');
				$("#input_channel_user").val('');
			}
		});
		
		$("#search_org").on("click", function(){
			gBodyM.org_open(false, 'gBodyM2', 'channel_org_user');
		});
		
		
		// 권한 관련 이벤트
		$('[name="work_opt_reg"]').on('change', function(){
			var _opt = $(this).val();
			if (_opt == "all") {
				$('#reg_opt_wr').hide();
			} else {
				$('#reg_opt_wr').show();
			}
		});
		$("#reg_search_user").on("click", function(){
			if ($.trim($("#reg_input_channel_user").val()) == ""){
				mobiscroll.toast({message:gap.lang.input_invite_user, color:'danger'});
				return;
			}
			gBodyM.org_search(false, $("#reg_input_channel_user").val(), 'gBodyM2', 'reg_org_user');
			$("#reg_input_channel_user").val('');
		});
		
		$("#reg_input_channel_user").keydown(function(evt){
			if (evt.keyCode == 13){
				if ($.trim($("#reg_input_channel_user").val()) == ""){
					mobiscroll.toast({message:gap.lang.input_invite_user, color:'danger'});
					return;
				}
				gBodyM.org_search(false, $("#reg_input_channel_user").val(), 'gBodyM2', 'reg_org_user');
				$("#reg_input_channel_user").val('');
			}
		});
		
		$("#reg_search_org").on("click", function(){
			gBodyM.org_open(false, 'gBodyM2', 'reg_org_user');
		});
		

		gBodyM.mobile_open_layer('create_channel_layer');
		gBodyM.mobile_finish();
	},
	
	"create_channel_action" : function(ch_code){
		/*
		 * 채널 생성/수정
		 */
		var is_update = (ch_code != undefined ? true : false);
		if ($.trim($("#input_channel").val()) == ""){
			mobiscroll.toast({message:gap.lang.input_channel_name, color:'danger'});
			return false;
		}
		var readers = [];
		var user_list = [];
		var user_ky_list = [];
		var new_member_ky = "";
		
		var channel_name = $("#input_channel").val();
		var member_count = $("#channel_member_list").children().length;
		
	/*	if (gBodyM2.is_channel_share == "Y" && member_count == 0){
			gap.gAlert(gap.lang.input_invite_user);
			return;
		}*/
		
		readers.push(gap.userinfo.rinfo.ky);
		
		if (member_count == 0){
			var postData = {
				"ch_name" : channel_name,
				"ch_share" : "N",
				"folderkey" : gBodyM2.parent_folderkey,
				"owner" : gap.userinfo.rinfo,
				"readers" : readers,	//gap.userinfo.rinfo.em
				"member" : user_list
			};	
		}else{
			for(var i = 0; i < member_count; i++){
				var user_info = $("#channel_member_list").children().eq(i).data("user");	//JSON.parse( $("#channel_member_list").children().eq(i).attr("data-user") );
				readers.push(user_info.ky);
				user_list.push(user_info);
				user_ky_list.push(user_info.ky);
			}
			var postData = {
				"ch_name" : channel_name,
				"ch_share" : "Y",
				"folderkey" : gBodyM2.parent_folderkey,
				"owner" : gap.userinfo.rinfo,
				"readers" : readers,	//readers.join(" "),
				"member" : user_list
			};
		}
		
		// 업무방 옵션 처리
		var reg_opt = $('[name="work_opt_reg"]:checked').val();
		var reg_userlist = [];
		$('#reg_member_list li').each(function(){
			var user_info = $(this).data("user");
			reg_userlist.push(user_info);
		});
		postData.opt_reg = reg_opt;
		postData.opt_reg_list = reg_userlist;
		postData.opt_del = $('[name="work_opt_del"]:checked').val();
		postData.opt_copy = $('[name="work_opt_copy"]:checked').val();
		postData.opt_reply = $('[name="work_opt_reply"]:checked').val();
					
		if (is_update){
			postData.ch_code = ch_code;
			
			var pre_member_ky = $.map(gBodyM2.cur_channel_info.member, function(ret, key) {
				return ret.ky;
			});
			new_member_ky = $(user_ky_list).not(pre_member_ky);
		}		
					
		var surl = gap.channelserver + "/create_channel.km";
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text",
			data : JSON.stringify(postData),
			success : function(ress){
				var res = JSON.parse(ress);
				if (res.result == "OK"){
					// member에게 소켓 전송
					
					if (is_update){
						// 새로 추가된 멤버
//						for (var i = 0; i < new_member_ky.length; i++){
//							
//						}
						
						if (new_member_ky.length > 0){
							var _obj = new Object();
							_obj.sender = new_member_ky;
							_obj.ch_code = ch_code;
							_obj.ch_name = channel_name;
							_obj.owner = gap.userinfo.rinfo.ky;
							_obj.type = "cc";
							//_wsocket.send_box_msg(_obj, 'chmng');
							gBodyM.send_box_msg(_obj, 'chmng');
						}
						
						
						
						//모바일 Push발송 등록 ////////////////////////////////////////////////////////	
						if (new_member_ky.length > 0 ){
							var new_member_ky_list = [];
							for (var j = 0; j < new_member_ky.length; j++){
								new_member_ky_list.push(new_member_ky[j]);
							}
							
							var smsg = new Object();
							smsg.msg = "[" + channel_name + "] " + gap.lang.memberadd
							smsg.title = "DSW[" + gap.lang.channel + "]";
							smsg.type = "cc";		
							smsg.key1 = ch_code;
							smsg.key2 = "";
							smsg.key3 = channel_name;
							smsg.fr = gap.userinfo.rinfo.nm;
							smsg.sender = new_member_ky_list.join("-spl-");			
						//	gap.push_noti_mobile(smsg);		
							
							//알림센터에 푸쉬 보내기
							var rid = ch_code;
							var receivers = new_member_ky_list;
							var msg2 = "[" + gap.textToHtml(channel_name) + "] " + gap.lang.memberadd;
							var sendername = "["+gap.lang.channel+" : "+ gap.textToHtml(channel_name) +"]"
							var data = smsg;
							gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);	
						}
						/////////////////////////////////////////////////////////////////////	
						
					}else{
						if (member_count != 0){
							var list = [];
							for (var i = 0; i < user_list.length; i++){
								list.push(user_list[i].ky);
							}
							
							if (list.length > 0){
								var _obj = new Object();
								_obj.sender = list;
								_obj.ch_code = res.ch_code;
								_obj.ch_name = channel_name;
								_obj.owner = gap.userinfo.rinfo.ky;
								_obj.type = "cc";
							//	_wsocket.send_box_msg(_obj, 'chmng');
								gBodyM.send_box_msg(_obj, 'chmng');
							}
							
							
							//모바일 Push발송 등록 ////////////////////////////////////////////////////////		
							if (user_ky_list.length > 0){
								var smsg = new Object();
								smsg.msg = "[" + channel_name + "] " + gap.lang.memberadd
								smsg.title = "DSW[" + gap.lang.channel + "]";
								smsg.type = "cc";		
								smsg.key1 = res.ch_code;
								smsg.key2 = "";
								smsg.key3 = channel_name;
								smsg.fr = gap.userinfo.rinfo.nm;
								//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.	
								smsg.sender = user_ky_list.join("-spl-");			
							//gap.push_noti_mobile(smsg);	
								
								//알림센터에 푸쉬 보내기
								var rid = res.ch_code;
								var receivers = user_ky_list;
								var msg2 = "[" + gap.textToHtml(channel_name) + "] " + gap.lang.memberadd;
								var sendername = "["+gap.lang.channel+" : "+ gap.textToHtml(channel_name) +"]"
								var data = smsg;
								gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
							}
					
							/////////////////////////////////////////////////////////////////////				
						}	
						
					
						var obb = new Object();
						obb.id = res.ch_code;			
						obb.name = channel_name;
						obb.owner = gap.userinfo.rinfo;
						obb.readers = readers;
						obb.member = user_list;
						obb.item = "TO-DO";	
						obb.ty = "add";   //add or del							
						gBodyM2.add_todo_plugin(obb);
					}	
					
					gBodyM.mobile_close_layer('create_channel_layer');
					var url_link = "kPortalMeet://NativeCall/callCloseLayer?done=yes&title=" + encodeURIComponent(channel_name);
					gBodyM.connectApp(url_link);
					return false;										
					
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
	
	
	"add_todo_plugin" : function(obb){
			
		//플러그인 설치하기		
		
		var url = gap.channelserver + "/plugin.km";	
		var data = JSON.stringify(obb);				
		$.ajax({
			type : "POST",
			dataType : "json",
			data : data,
			url : url,
			success : function(res){
				
			},
			error : function(e){
				gap.error_alert();
			}
		});	
	},
	
	"channel_user_search" : function(ch_type, str){
		/*
		 * 드라이브/채널 생성 화면에서 사용자 검색
		 * ch_type : D(드라이브), C(채널), F(폴더)
		 */
		if (ch_type == "D"){
			$("#input_drive_user").val("");
			
		}else if (ch_type == "C"){
			$("#input_channel_user").val("");
			
		}else if (ch_type == "F"){
			$("#input_folder_user").val("");	
		}
		var surl = gap.channelserver + "/search_user.km";
		var postData = {
				"name" : str,
				"companycode" : ""
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				var info = res;
				
				if (info.length == 0){
					mobiscroll.toast({message:gap.lang.searchnoresult, color:'danger'});
					return false;
				}		
				
				if (info.length > 1){
					//동명이인이 있는 경우
					var _html = '<ul id="same_name_list_ul" style="list-style:none"></ul>';
					$("#same_name_list").html(_html);
					
					for (var i = 0; i < info.length; i++){
						var user = info[i];
						var user_info = gap.user_check(user);
						var name = user_info.name;
						var dept = user_info.dept;
						var pos = user_info.jt;
						var notesid = user_info.ky;
						var empno = user_info.emp;
						/*var photo_url = "";
						if (user.pu == ""){
							photo_url = "https://meet.kmslab.com/photo/none.jpg";
						}else{
							photo_url = user.pu;
						}*/
						var person_img = gap.person_profile_uid(notesid);
						var html = '';
						
					//	var	html = "<li style='cursor:pointer' id='uschres_" + empno + "'><a>" + name + " / " + dept + " / " + pos + "</a></li>";
						
						html += '<li id="uschres_' + empno + '">'
						html += '	<div class="invite-user">';
						html += '		<div class="user">';
						html += '			<div class="user-thumb">' + person_img + '</div>';
						html += '		</div>';
						html += '		<dl>';
						html += '			<dt>' + name + '</dt>';
						html += '			<dd>' + dept + '</dd>';
						html += '		</dl>';
						html += '	</div>';
						html += '</li>'
						
						$("#same_name_list_ul").append(html);
						$("#uschres_" + empno).bind("click", user, function(event) {
							gBodyM2.channel_list_user(ch_type, event.data);
						});
					}
					$("#same_name_list").show();
				
				}else{
					//결과가 1명인 경우				
					if (info[0].ky.toLowerCase() == gap.userinfo.rinfo.ky.toLowerCase()){
						mobiscroll.toast({message:gap.lang.me_not_add_invite_user, color:'danger'});
						return false;
					}else{
						gBodyM2.channel_add_user(ch_type, info[0]);
					}	
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
	},
	
	"channel_list_user" : function(ch_type, obj){
		if (obj.ky.toLowerCase() == gap.userinfo.rinfo.ky.toLowerCase()){
			mobiscroll.toast({message:gap.lang.me_not_add_invite_user, color:'danger'});
			return false;

		}else{
			gBodyM2.channel_add_user(ch_type, obj);
		}
	},
	
	"channel_org_user" : function(obj){
		// App 조직도에서 검색 결과를 내려줌
		gBodyM2.aleady_select_user_count = 0;
		for (var i = 0; i < obj.length; i++){
		//	var _res = JSON.parse(obj[i]);
			var _res = obj[i];
			if (_res.ky.toLowerCase() != gap.userinfo.rinfo.ky.toLowerCase()){
				gBodyM2.channel_add_user('C', _res);
			}
		}
		gBodyM2.alert_aleady_select_user();
	},
	
	"reg_org_user" : function(obj){
		// App 조직도에서 검색 결과를 내려줌
		gBodyM2.aleady_select_user_count = 0;
		for (var i = 0; i < obj.length; i++){
			var _res = obj[i];
			if (_res.ky.toLowerCase() != gap.userinfo.rinfo.ky.toLowerCase()){
				gBodyM2.channel_add_user('CO', _res);
			}
		}
		gBodyM2.alert_aleady_select_user();
	},
	
	"drive_org_user" : function(obj){
		//App 조직도에서 검색 결과를 내려줌
		gBodyM2.aleady_select_user_count = 0;
		for (var i = 0; i < obj.length; i++){
		//	var _res = JSON.parse(obj[i]);
			var _res = obj[i];
			if (_res.ky.toLowerCase() != gap.userinfo.rinfo.ky.toLowerCase()){
				gBodyM2.channel_add_user('D', _res);
			}
		}
		gBodyM2.alert_aleady_select_user();
	},
	
	"channel_add_user" : function(ch_type, obj){
		/*
		 * 검색된 사용자 화면에 추가
		 */
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
		}else if (ch_type == "CO"){	// 채널권한
			$el = $("#reg_member_list");
		}else if (ch_type == "F"){	// 폴더
			$el = $("#folder_member_list");
		}else if (ch_type == "I"){	// 폴더 (초대 가능 멤버 표시)
			$el = $("#folder_add_member_list");
		}
		var len = $el.find("#member_" + id).length;

		if (len > 0){
			mobiscroll.toast({message:gap.lang.existuser, color:'danger'});
			return false;
		}
		
	//	var person_img = gap.person_profile_box_uid(obj);
		var user_info = gap.user_check(obj);
		var html = "";
		
		if (ch_type == "I" || ch_type == "F"){
			html += '<li id="member_' + id + '"' + (ch_type == "I" ? " onClick='gBodyM2.add_folder_member(this)'" : "") + '>';
			html += '	<div class="invite-user">';
			html += '		<div class="user">';
			html += '			<div class="user-thumb">' + user_info.user_img + '</div>';
			html += '		</div>';
			html += '		<dl>';
			html += '			<dt>' + user_info.name + '</dt>';
			html += '			<dd>' + user_info.dept + '</dd>';
			html += '		</dl>';
			if (ch_type != "I"){
				html += '		<button class="ico btn-del1" onClick="gBodyM2.channel_delete_user(this,\'' + ch_type + '\')">삭제</button>';			
			}			
			html += '	</div>';			
			html += '</li>';
			
		}else{
			html += '<li class="f_between" id="member_' + id + '">';
			html += '	<span class="txt ko">' + user_info.disp_user_info + '</span>';
			html += '	<button class="file_remove_btn" onClick="gBodyM2.channel_delete_user(this,\'' + ch_type + '\')"></button>';	
			html += '</li>';				
		}
		
		if (ch_type == "I"){
			$el.append($(html));
		} else {
			$el.append($(html));
			
			if ($el.children().length > 0){
				$el.parent().show();
			}
		}
		
		if ($(document).height() > $(window).height()){
			$(".drive-create").height('100%');
		}
				
		delete obj['_id'];
		$el.find("#member_" + id).data('user', obj);
	},
	
	"alert_aleady_select_user" : function(){
		if (gBodyM2.aleady_select_user_count == 0){
			//nothing
			
		}else if (gBodyM2.aleady_select_user_count == 1){
			mobiscroll.toast({message:gap.lang.existuser, color:'danger'});
			return false;
			
		}else{
			mobiscroll.toast({message:gap.lang.existuser + " (" + gBody2.aleady_select_user_count + " " + gap.lang.myung + ")", color:'danger'});
			return false;	
		}
	},
	
	"add_folder_member" : function(obj){
		var info = $(obj).data("user");	//JSON.parse( $(obj).attr("data-user") );
		var user_info = gap.user_check(info);
		var emp = (info.emp ? info.emp : info.id);
		var html = "";
		
		var html = "";
		html += '<li id="member_' + emp + '">'
		html += '	<div class="invite-user">';
		html += '		<div class="user">';
		html += '			<div class="user-thumb">' + user_info.user_img + '</div>';
		html += '		</div>';
		html += '		<dl>';
		html += '			<dt>' + user_info.name + '</dt>';
		html += '			<dd>' + user_info.dept + '</dd>';
		html += '		</dl>';
		html += '		<button class="ico btn-del1" onClick="gBodyM2.channel_delete_user(this,\'I\')">삭제</button>';	
		html += '	</div>';
		html += '</li>'
		
		$("#folder_member_list").append($(html));
		$(obj).remove();
		
	//	$("#member_" + emp).attr('data-user', JSON.stringify(info));
		$("#member_" + emp).data('user', info);
	},
	
	"channel_delete_user" : function(obj, ch_type){
		/*
		 * 드라이브/채널 생성화면에서 추가된 사용자 삭제
		 */
		var info = "";
		var id = "";
		
		if (ch_type == "I" || ch_type == "F"){
			info = $(obj).parent().parent().data("user");	//JSON.parse( $(obj).parent().parent().attr("data-user") );
			id = $(obj).parent().parent().attr("id");
			
		}else{
			info = $(obj).parent().data("user");	//JSON.parse( $(obj).parent().attr("data-user") );
			id = $(obj).parent().attr("id");
		}
		var user_info = gap.user_check(info);
		
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
			
		} else if (ch_type == "CO"){
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
		}
		
		if (ch_type == "F" || ch_type == "I"){
			var emp = (info.emp ? info.emp : info.id);
			var html = "";

			html += '<li id="member_' + emp + '" onClick="gBodyM2.add_folder_member(this)">'
			html += '	<div class="invite-user">';
			html += '		<div class="user">';
			html += '			<div class="user-thumb">' + user_info.user_img + '</div>';
			html += '		</div>';
			html += '		<dl>';
			html += '			<dt>' + user_info.name + '</dt>';
			html += '			<dd>' + user_info.dept + '</dd>';
			html += '		</dl>';
			html += '	</div>';
			html += '</li>'
			
			$("#folder_add_member_list").append($(html));
		//	$("#member_" + emp).attr('data-user', JSON.stringify(info));
			$("#member_" + emp).data('user', info);
		}
	},
	
	"search_data_list" : function(ty, query_str){
		/*
		 * App에서 검색 시 호출되는 함수
		 * [ty] 1 : 드라이브, 2 : 채널, 3 : 즐겨찾기
		 * [query_str] : 검색어
		 */
		gBodyM2.query_str = query_str;
		
		if (ty == "1"){
			gBodyM2.draw_drive_data(1);
			
		}else if (ty == "2"){
			gBodyM2.draw_files(1);
			
		}else if (ty == "3"){
			gBodyM2.draw_favorite_data(1);
		}
	},
	
	"drive_info_member" : function(){
		var surl = gap.channelserver + "/drive_info_member.km";
		var postData = {
				"drive_code" : gBodyM2.select_drive_code,
				"folder_code" : (gBodyM2.select_folder_code == "root" ? "" : gBodyM2.select_folder_code)
			};		

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					var url_link = "kPortalMeet://NativeCall/callUserInfo?info=" + encodeURIComponent(JSON.stringify(res.data));
					gBodyM.connectApp(url_link);
					return false;	

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
	
	"upload_push" : function(){
		// 파일 업로드 후 푸시 알림	
		var surl = gap.channelserver + "/drive_info_member.km";
		var postData = {
				"drive_code" : gBodyM2.select_drive_code,
				"folder_code" : (gBodyM2.select_folder_code == "root" ? "" : gBodyM2.select_folder_code)
			};		

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					// 푸시
					
					//폴더에 파일이 등록되었다고 멤버에게 알린다.
					var is_folder = "";
					if (gBodyM2.select_folder_code == "root"){
						//드라이브를 클릭한 경우
						//is_folder = "[" +gBodyM2.select_drive_name + "]" + gap.lang.mydrive + " " + gap.lang.reg_file;
						is_folder = "[" +gBodyM2.select_drive_name + "]" +  gap.lang.reg_file;

					}else{
						//특정 폴더에 들어간 경우
						//is_folder = "[" +gBodyM2.select_folder_name + "]" + gap.lang.folder + " " + gap.lang.reg_file; 
						is_folder = "[" +gBodyM2.select_folder_name + "]" + gap.lang.reg_file; 
					}
					/////////////////////////////////////////////////////////////////////////////////////////
					var sender_list = [];
					if (typeof(res.data.member) != "undefined"){
						var list = res.data.member.list;
						for (var i = 0 ; i < list.length; i++){
							var mk = list[i].ky;
							if (mk != gap.userinfo.rinfo.ky){
								
								
								sender_list.push(mk);
							}
						}
						
						if (sender_list.length > 0){
							var obj = new Object();
							obj.type = "drive_upload";  //파일엄로드
							obj.p_code = gBodyM2.select_drive_code;
							obj.p_name = gBodyM2.select_drive_name;
							obj.f_code = gBodyM2.select_folder_code;
							obj.title = is_folder;
							obj.sender = sender_list;  //해당 프로젝트의 owner에게만 전송한다.							
							//_wsocket.send_drive_msg(obj);
							gBodyM.send_box_msg(obj, 'drive');
						}
						
					}
					
					
					if (res.data.owner.owner.ky != gap.userinfo.rinfo.ky){
						var obj = new Object();
						obj.type = "drive_upload";  //파일 업로드
						obj.p_code = gBodyM2.select_drive_code;
						obj.p_name = gBodyM2.select_drive_name;
						obj.f_code = gBodyM2.select_folder_code;
						obj.title = is_folder;
						var list = [];
						list.push(res.data.owner.owner.ky);
						obj.sender = list;  //해당 프로젝트의 owner에게만 전송한다.							
						//_wsocket.send_drive_msg(obj);
						gBodyM.send_box_msg(obj, 'drive');
						
						sender_list.push(res.data.owner.owner.ky);
					}		
					
					
					
					 //모바일  Push를 날린다. ///////////////////////////////////						
					var smsg = new Object();
					smsg.msg = is_folder;	
					smsg.title = "DSW[Drive]";
					smsg.type = "drive_upload";
					smsg.key1 = gBodyM2.select_drive_code;
					smsg.key2 = gBodyM2.select_folder_code;
					
					if (gBodyM2.select_folder_name == ""){
						smsg.key3 = gBodyM2.select_drive_name;
					}else{
						smsg.key3 = gBodyM2.select_folder_name;
					}
					
					smsg.fr = gap.userinfo.rinfo.nm;
					//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
					smsg.sender = sender_list.join("-spl-");										
				//	gap.push_noti_mobile(smsg);		
					
					//알림센터에 푸쉬 보내기
					var rid = gBodyM2.select_drive_code;
					var receivers = sender_list;
					var msg2 = is_folder;	
					var sendername = "["+gap.textToHtml(gap.lang.drive)+" : "+ smsg.key3 +"]";
					var data = smsg;
					gap.alarm_center_msg_save(receivers, "kp_files", sendername, msg2, rid, smsg);	
					////////////////////////////////////////////////////
					/////////////////////////////////////////////////////////////////////////////////////////					
					
					
					
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});			
	},
	
	"drive_fileupload_layer_html" : function(){
		var html = '';
		html += '<section style="padding:0 2rem 0 2rem;">';
		html += '	<div class="">';
		html += '		<div class="drive-option">';
		html += '			<h3>' + gap.lang.channel_to_share + '</h3>';
		html += '			<div class="selectbox">';
		html += '				<select id="share_channel_option_list">';
		html += '				</select>';
		html += '			</div>';
		html += '		</div>';
		html += '	</div>';
		html += '	<div class="">';
		html += '		<div class="drive-option">';
		html += '			<h3>' + gap.lang.drive + '</h3>';
		html += '			<div class="selectbox">';
		html += '				<select id="drive_option_list">';
		html += '				</select>';
		html += '			</div>';
		html += '		</div>';
		html += '	</div>';
		html += '	<div class="list">';
		html += '		<ul id="wrap_upload_folder_file_list" style="list-style:none;">';
		html += '			<div id="upload_folder_file_list">';
		html += '			</div>';
		html += '		</ul>';
		html += '		<button class="btn-selected-file">' + gap.lang.selected_file + ' <span id="selected_upload_file_count">0</span></button>';
		html += '	</div>';
		html += '	<div class="list" style="display:block"> <!-- 선택된 파일 클릭시 노출 -->';
		html += '		<h3>' + gap.lang.selected_file + '</h3>';
		html += '		<div class="selected-files" id="selected_file_area">';
		html += '			<P>&nbsp;</P>';
		html += '		</div>';
		html += '	</div>';
		html += '	<div class="input-field textarea">';
		html += '		<textarea id="drive_upload_textarea" class="formInput" placeholder="' + gap.lang.input_message + '"></textarea>';
		html += '		<span class="bar"></span>';
		html += '	</div>';
		html += '</section>';
		
		return html;
	},
	
	"drive_file_upload" : function(channel_code){
		gBodyM2.init_select_drive_folder();
		var html = gBodyM2.drive_fileupload_layer_html();
		$("#drive_fileupload_layer").html(html);
		
		//공유채널 리스트
		var channel_option_list = '';
		channel_option_list += '<optgroup label="'+gap.lang.sharechannel+'">';
		channel_option_list += '<option value="">'+gap.lang.channelchoice+'</option>';
		
		
		var infos = gBodyM.cur_channel_list_info;
		if (infos == ""){
			gBodyM.load_channel_list_info();
			infos = gBodyM.cur_channel_list_info;
		}
		
		for (var i = 0; i < infos.length; i++){
			var _info = infos[i];
			if (_info.type && _info.type == "folder"){
				//nothing
			}else{
				channel_option_list += '<option value="' + _info.ch_code + '">' + _info.ch_name + '</option>';
			}
		}
		channel_option_list += '</optgroup>';
		$("#share_channel_option_list").html(channel_option_list);
		$('#share_channel_option_list').val(channel_code);
		$('#share_channel_option_list').material_select();
		
		//드라이브 리스트
		var surl = gap.channelserver + "/api/files/drive_list_all.km";
		var postData = JSON.stringify({
				"email" : gap.userinfo.rinfo.ky,
				"depts" : gap.full_dept_codes()
			});			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			success : function(res){
				var drive_option_list = '';
				var drive_list = [];
				
				for (var i = 0; i < res.drive.length; i++){
					var _data = res.drive[i];
				//	if (_data.ch_share == "Y"){
						drive_option_list += '<option value="' + _data._id + '">' + _data.ch_name + '</option>';
						drive_list.push(_data);
				//	}
				}
				$("#drive_option_list").html(drive_option_list);
				$('#drive_option_list').material_select();
				$("#drive_option_list").on("change", function(){
					gBodyM2.select_drive_code = $(this).val();
					gBodyM2.select_drive_name = $('option:selected',this).text();
					gBodyM2.select_folder_code = "root";
					gBodyM2.select_folder_name = "";
					gBodyM2.title_path_code = [];
					gBodyM2.title_path_name = [];
					gBodyM2.drive_folder_file_list(1);
					$("#selected_path_layer").html("<strong>" + $('option:selected',this).text() + "</strong>");
				});
				
				//드라이브 내 폴더 및 파일 리스트
				var first_drive_code = drive_list[0]._id;
				if (typeof first_drive_code != "undefined"){
					gBodyM2.select_drive_code = first_drive_code;
					gBodyM2.select_drive_name = drive_list[0].ch_name;
					gBodyM2.drive_folder_file_list(1);
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
			gBodyM2.init_select_drive_folder();
			gap.close_layer('drive_fileupload_layer');
		});	
		$("#cancel_drive_fileupload_layer").on("click", function(){
			gBodyM2.init_select_drive_folder();
			gap.close_layer('drive_fileupload_layer');
		});
		
		gBodyM.mobile_open_layer('drive_fileupload_layer');
	},
	
	"drive_file_upload_action" : function(){
		if ($('#share_channel_option_list').val() == null || $('#share_channel_option_list').val() == ""){
			mobiscroll.toast({message:gap.lang.select_share_channel, color:'danger'});
			return false;
		}
	//	if ($("#selected_file_area").children().eq(0).prop("tagName") == "P"){
		if ($("#selected_upload_file_list").children().length == 0){
			mobiscroll.toast({message:gap.lang.select_upload_file, color:'danger'});
			return false;
		}
		var upload_file_list = [];
		$("#selected_upload_file_list").children().each(function(idx){
			var file_id = $(this).attr("id").replace("upload_", "");
			upload_file_list.push(file_id);
		});
		
		var content = $('#drive_upload_textarea').val();
		var surl = gap.channelserver + "/drive_upload.km";
		var og = gBodyM2.og_search(content);

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
					
					//모바일  Push를 날린다. ///////////////////////////////////
					var smsg = new Object();
					smsg.title = "DSW[" + gap.lang.channel + "]";
					smsg.msg = "[" + gap.textToHtml(res.data.channel_name) + "] " + gap.lang.nmsg;
					smsg.type = "ms";
					smsg.key1 = res.data.channel_code;
					smsg.key2 = "";
					smsg.key3 = gap.textToHtml(res.data.channel_name);
					smsg.fr = gap.userinfo.rinfo.nm;
					//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
					smsg.sender = gBodyM.search_channel_member(res.data.channel_code).join("-spl-");
							
					//gap.push_noti_mobile(smsg);
					
					//알림센터에 푸쉬 보내기
					var rid = res.data.channel_code;
					var receivers = mlist;
					var msg2 = "[" + gap.textToHtml(res.data.channel_name) + "] " + gap.lang.nmsg;
					var sendername = "["+gap.lang.channel+" : "+ gap.textToHtml(res.data.channel_name); +"]"
					var data = smsg;
					gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
					/////////////////////////////////////////////////////
					
					gBodyM.mobile_close_layer('drive_fileupload_layer');
					var url_link = "kPortalMeet://NativeCall/callMoveFinish?done=yes&from=channel";
					gBodyM.connectApp(url_link);
					return false;
					
					/*
					 * kPortalMeet://NativeCall/callMoveFinish?done=yes&from=channel 호출 후 App에서
					 * gBodyM.load_channel(gBodyM.cur_opt, gBodyM.cur_name, gBodyM.q_str); 호출
					 */
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
		
	"init_select_drive_folder" : function(){
		gBodyM2.select_drive_code = "";
		gBodyM2.select_drive_name = "";
		gBodyM2.select_folder_code = "root";
		gBodyM2.select_folder_name = "";
		gBodyM2.title_path_code = [];
		gBodyM2.title_path_name = [];
	},
	
	"drive_folder_file_list" : function(page_no){
		if (page_no == 1){
			gBodyM2.start_page = "1";
			gBodyM2.cur_page = "1";
			gBodyM2.cur_file_count = 0;
			gBodyM2.cur_file_total_count = 0;
		}else{
			if (gBodyM2.cur_file_count == gBodyM2.cur_file_total_count){
				return false;
			}				
		}

		gBodyM2.start_skp = (parseInt(gBodyM2.per_page) * (parseInt(page_no))) - (parseInt(gBodyM2.per_page) - 1);
		var surl = gap.channelserver + "/api/files/folder_list.km";
		var postData = {
				"ty" : (page_no == 1 ? "1" : "2"),
				"drive_key" : gBodyM2.select_drive_code,
				"parent_folder_key" : gBodyM2.select_folder_code,
				"email" : gap.userinfo.rinfo.ky,
				"start" : "0",	//(gBodyM2.start_skp - 1).toString(),
				"perpage" : "9999",	//gBodyM2.per_page,
				"dtype" : "",
				"q_str" : "",
				"depts" : gap.full_dept_codes()
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					gBodyM2.cur_file_count += res.data.datalist.length;
					gBodyM2.cur_file_total_count = res.data.totalcount;
					gBodyM2.draw_folder_file_list(page_no, res.data);
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
		if (page_no == 1){
			$("#upload_folder_file_list").empty();
			
/*			
 * 			상위 폴더 이동 기능 - 일단 숨김
 * 			if (typeof res.folderlist != "undefined"){
				// 상위폴더 이동
				var parent_folder_html = '';
				if (gBodyM2.select_folder_code != "root"){
					parent_folder_html += '<li id="move_parent_folder">';
					parent_folder_html += '	<span class="ico ico-file folder"></span>';
					parent_folder_html += '	<dt><strong style="margin-top:22px;">' + gap.lang.parent_folder + '</strong></dt>';
					parent_folder_html += '</li>';
					
					$("#upload_folder_file_list").append(parent_folder_html);
					
					$("#move_parent_folder").on("click", function(){
						if (gBodyM2.title_path_code.length == 1){
							gBodyM2.select_folder_code = "root";
							gBodyM2.select_folder_name = "";
							gBodyM2.title_path_name = [];
							gBodyM2.title_path_code = [];
							gBodyM2.start_page = "1";
							gBodyM2.cur_page = "1";
							gBodyM2.drive_folder_file_list(1);
							
						}else{
							var array_cnt = gBodyM2.title_path_code.length;
							
							gBodyM2.select_folder_code = gBody2.title_path_code[array_cnt - 2];
							gBodyM2.select_folder_name = gBody2.title_path_name[array_cnt - 2];
							gBodyM2.title_path_name.pop();
							gBodyM2.title_path_code.pop();
							gBodyM2.start_page = "1";
							gBodyM2.cur_page = "1";
							gBodyM2.drive_folder_file_list(1);
						}
					});
				}
			}*/
			
			//폴더 리스트
			for (var i = 0; i < res.folderlist.length; i++){
				var folder_info = res.folderlist[i];
				var folder_id = folder_info._id;
				var folder_html = '';
				
				folder_html += '<li id="fl_' + folder_id + '">';
			//	folder_html += '	<span class="ico ico-folder' + (folder_info.folder_share == "Y" ? "-share" : "") + '"></span>';
				folder_html += '	<span class="ico ico-file folder"></span>';
				folder_html += '	<dt><strong style="margin-top:22px;">' + folder_info.folder_name + '</strong></dt>';
				folder_html += '</li>';
				
				$("#upload_folder_file_list").append(folder_html);
				
				$("#fl_" + folder_id).on("click", function(){
					gBodyM2.select_folder_code = $(this).attr("id").replace("fl_", "");
					gBodyM2.select_folder_name = $(this).find("dt strong").text();
					gBodyM2.title_path_code.push(gBody2.select_folder_code);
					gBodyM2.title_path_name.push(gBody2.select_folder_name);
					
					gBodyM2.drive_folder_file_list(1);
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
			file_html += '	<span class="ico ico-file ' + icon_kind + '"></span>';
			file_html += '	<dl>';
			file_html += '		<dt><strong style="margin-top:22px;">' + file_name + '&nbsp;(' + file_size + ')</strong></dt>';
			file_html += '	</dl>';
			file_html += '	<button class="ico btn-check" id="chk_' + file_info._id + '" fname="' + file_name + '" fsize="' + file_size + '">체크</button>';
			file_html += '</li>';
			
			$("#upload_folder_file_list").append(file_html);
		}
		
		gBodyM2.__upload_file_click_event();
		
		/*
		 * 사용안함
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
		//	setTop : ($("#wrap_upload_folder_file_list").height()) + "px",
			callbacks : {
				onTotalScroll: function(){gBodyM2.drive_folder_file_list(page_no + 1)},
				onTotalScrollOffset:100,
				alwaysTriggerOffsets:true
			}
		});*/
	},
	
	"__upload_file_click_event" : function(){
		//체크박스 클릭할 경우
		$("#upload_folder_file_list .btn-check").off();
		$("#upload_folder_file_list .btn-check").on("click", function(e){
			var file_id = $(this).attr("id").replace("chk_", "upload_");
		
			if ($(this).hasClass("on")){
				//선택된 것을 푼다.
				$(this).removeClass("on");
				$("#" + file_id).remove();
				
			}else{
				//클릭한것을 선택한다.
				$(this).addClass("on");
				
				var file_name = $(this).attr("fname");
				var icon_kind = gap.file_icon_check(file_name);
				var file_size = $(this).attr("fsize");
				var _html = '';
				var _li_html = '';
				
				_li_html += '<li id="' + file_id + '">';
				_li_html += '	<span class="ico ico-file ' + icon_kind + '"></span>';
				_li_html += '	<dl>';
				_li_html += '		<dt><strong style="margin-top:22px;">' + file_name + '&nbsp;(' + file_size + ')</strong></dt>';
				_li_html += '	</dl>';
				_li_html += '	<button class="ico btn-select-del" id="del_' + file_id + '">삭제</button>';
				_li_html += '</li>';		

				if ($("#selected_file_area").children().eq(0).prop("tagName") == "P"){
					_html += '<ul id="selected_upload_file_list" style="list-style:none">';
					_html += _li_html;
					_html += '</ul>';
					$("#selected_file_area").html(_html);
					
				}else{
					$("#selected_upload_file_list").append(_li_html);
				}
				
				$("#del_" + file_id).on("click", function(){
					var remove_file_id = $(this).parent().attr("id");
					var check_file_id = remove_file_id.replace("upload_", "chk_");
					$("#" + remove_file_id).remove();
					$("#" + check_file_id).removeClass("on")
					if ($("#selected_file_area li").length == 0){
						$("#selected_file_area").html('<p>&nbsp;</p>')
					}
					$("#selected_upload_file_count").html($("#selected_file_area li").length);
				});
			}
			$("#selected_upload_file_count").html($("#selected_file_area li").length);
		});
	},
	
	"folder_layer_html" : function(is_update){
	/*	var html = '';

		html += '<div class="wrap drive-create">';
		html += '	<div class="input-field">';
		html += '		<input type="text" class="formInput" id="input_folder_name" placeholder="">';
		html += '		<label for="input_folder_name">' + gap.lang.folder_name + '</label>';
		html += '		<span class="bar"></span>';
		html += '	</div>';
		html += '</div>';*/
		
		var html =
			'<div class="mu_mobile drive-create-mu" style="padding:10px; border-radius;0">' +
			'	<div class="mo_table_box">' +
			'		<div class="search_sec">' +
			'			<input type="text" id="input_folder_name" placeholder="' + gap.lang.input_folder_name + '">' +
			'		</div>' +
			'	</div>' +
			'</div>';
		
		return html;
	},
	
	"drive_folder_layer_html" : function(is_update, is_share){
		var html = '';

	//	html += '<h2>' + (is_update ? gap.lang.todo_update_folder : gap.lang.todo_create_folder) + '</h2>';
		html += '<div class="wrap drive-create">';
		html += '	<div class="input-field">';
		html += '		<input type="text" class="formInput" id="input_folder_name" placeholder="">';
		html += '		<label for="input_folder_name">' + gap.lang.folder_name + '</label>';
		html += '		<span class="bar"></span>';
		html += '	</div>';
		if (is_share == "Y"){
			html += '	<h4>' + gap.lang.members_can_invited + '</h4>';
			html += '	<ul id="folder_add_member_list" style="margin-top:0;list-style:none;max-height:40%;overflow-y:auto;">';
			html += '	</ul>';
			html += '	<div style="height:10px;border-bottom:1px solid #ccc"></div>';
			html += '	<h4 style="margin-top:10px;">' + gap.lang.folder_members + '</h4>';
		}
		html += '	<ul id="folder_member_list" style="margin-top:0;list-style:none;max-height:40%;overflow-y:auto;">';
		html += '	</ul>';
		html += '</div>';
		
		return html;
	},
	
	"native_drive_modify_folder" : function(){
		gBodyM2.drive_modify_folder(gBodyM2.select_folder_code);
	},
	
	"drive_modify_folder" : function(_code){
		//폴더 정보 update인 경우
		
		gBodyM2.load_folder_info = "";
		var is_update = (_code != undefined ? true : false);
	//	var html = gBodyM2.drive_folder_layer_html(is_update);
	//	$("#create_channel_layer").html(html);
				
		var surl = gap.channelserver + "/api/files/load_folder.km";
		var postData = {
				"id" : _code
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					var obj = res.data;
					gBodyM2.load_folder_info = obj;
					
					var is_share = obj.folder_share;
					var html = gBodyM2.drive_folder_layer_html(is_update, is_share);
					$("#create_channel_layer").html(html);
					
					$("#input_folder_name").val(gap.textToHtml(obj.folder_name));
					$("#input_folder_name").parent().find("label").addClass("on");
					$("#input_folder_name").focus();
					
					for (var i = 0; i < obj.member.length; i++){
						gBodyM2.channel_add_user('F', obj.member[i]);
					}
					
					if (is_share == "Y"){
						if (obj.parent_folder_key == "root"){
							// parent가 드라이브인 경우
							var _surl = gap.channelserver + "/api/channel/search_info.km";
							var postData = {
									"type" : "D",
									"ch_code" : obj.drive_key
								};			

							$.ajax({
								type : "POST",
								url : _surl,
								dataType : "json",
								contentType : "application/json; charset=utf-8",
								data : JSON.stringify(postData),
								success : function(res){
									if (res.result == "OK"){
										gBodyM2.draw_parent_member(res, obj);
									}
								},
								error : function(e){
									gap.gAlert(gap.lang.errormsg);
									return false;
								}
							});
						}else{
							// parent가 폴더인 경우
							var _surl = gap.channelserver + "/api/files/load_folder.km";
							var postData = {
									"id" : _code
								};			

							$.ajax({
								type : "POST",
								url : _surl,
								dataType : "json",
								data : JSON.stringify(postData),
								success : function(res){
									if (res.result == "OK"){
										gBodyM2.draw_parent_member(res, obj);
									}
								},
								error : function(e){
									gap.gAlert(gap.lang.errormsg);
									return false;
								}
							});
							
						}							
					}
					
					$("#input_folder_name").on("change", function(){
						if($(this).val() == ""){
							$(this).parent().find("label").removeClass("on");
						} else {
							$(this).parent().find("label").addClass("on");
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
		
		gBodyM.mobile_open_layer('create_channel_layer');
		gBodyM.mobile_finish();
	},
	
	"drive_create_folder" : function(drive_code, folder_code){
		//드라이브 리스트 
		//gap.gAlert("drive_code >> " + drive_code + " / folder_code >> " + folder_code);
		gBodyM2.load_folder_info = "";
		var is_update = false;
		var surl = gap.channelserver + "/api/files/drive_list_all.km";
		var postData = JSON.stringify({
				"email" : gap.userinfo.rinfo.ky,
				"depts" : gap.full_dept_codes()
			});			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			success : function(res){
				gBodyM2.cur_drive_list_info = res.drive;

				var _drive_info = $.map(gBodyM2.cur_drive_list_info, function(ret, key) {
					if (ret.ch_code == drive_code){
						return ret;
					}
				});
				_drive_info = _drive_info[0];
				var is_share = _drive_info.ch_share;
				var html = gBodyM2.drive_folder_layer_html(is_update, is_share);
				$("#create_channel_layer").html(html);

				if (folder_code == "root"){
					// parent가 드라이브인 경우
					var _surl = gap.channelserver + "/api/channel/search_info.km";
					var postData = {
							"type" : "D",
							"ch_code" : drive_code
						};			

					$.ajax({
						type : "POST",
						url : _surl,
						dataType : "json",
						contentType : "application/json; charset=utf-8",
						data : JSON.stringify(postData),
						success : function(res){
							gBodyM.mobile_finish();
							
							var tmp_info = new Object();
							tmp_info.depth = "0";
							tmp_info.drive_key = drive_code;
							tmp_info.folder_share = is_share;
							tmp_info.parent_folder_key = folder_code;
							tmp_info._id = {"$oid" : folder_code};
							gBodyM2.load_folder_info = tmp_info;
							
							if (res.result == "OK"){
								if (is_share == "Y"){
									gBodyM2.draw_parent_member(res, null);
								}
							}
						},
						error : function(e){
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					});
					
				}else{
					// parent가 폴더인 경우
					var _surl = gap.channelserver + "/api/files/load_folder.km";
					var postData = {
							"id" : folder_code
						};			

					$.ajax({
						type : "POST",
						url : _surl,
						dataType : "json",
						data : JSON.stringify(postData),
						success : function(res){
							gBodyM.mobile_finish();
							gBodyM2.load_folder_info = res.data;

							if (res.result == "OK"){
								if (is_share == "Y"){
									gBodyM2.draw_parent_member(res, null);	
								}
							}
						},
						error : function(e){
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					});
				}
				
				$("#input_folder_name").on("change", function(){
					if($(this).val() == ""){
						$(this).parent().find("label").removeClass("on");
					} else {
						$(this).parent().find("label").addClass("on");
					}
				});
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});
		
		gBodyM.mobile_open_layer('create_channel_layer');
		gBodyM.mobile_finish();
	},
	
	"drive_create_folder_action" : function(code){
		/*
		 * 드라이브 폴더 생성/수정
		 * 현재(2021.10.20) 모바일에서는 폴더 수정/삭제만 있음
		 */
		var is_update = (code != undefined ? true : false);
		if ($.trim($("#input_folder_name").val()) == ""){
			mobiscroll.toast({message:gap.lang.input_foldername, color:'danger'});
			return;
		}
		var folder_name = $("#input_folder_name").val();
		var folder_info = gBodyM2.load_folder_info;
		
		var readers = [];
		var user_list = [];
		var delete_members = "";
		
		if (folder_info.folder_share == "N"){
			readers.push(gap.userinfo.rinfo.ky);
			var postData = {
				"drive_key" : folder_info.drive_key,
				"parent_folder_key" : (is_update ? folder_info.parent_folder_key : folder_info._id),
				"depth" : (is_update ? folder_info.depth : (parseInt(folder_info.depth) + 1).toString()),
				"folder_name" : folder_name,
				"folder_share" : "N",
				"owner" : gap.userinfo.rinfo,
				"readers" : (is_update ? folder_info.readers : readers)
			};
			
		}else{
			var parent_member_count = $("#folder_add_member_list").children().length;
			var member_count = $("#folder_member_list").children().length;
			
			if (parent_member_count > 0 && member_count == 0){
				// 추가 가능한 멤버는 있는데 선택된 멤버가 하나도 없는 경우
				mobiscroll.toast({message:gap.lang.select_folder_member, color:'danger'});
				return;
			}
			
			readers.push(gap.userinfo.rinfo.ky);
			
			for(var i = 0; i < member_count; i++){
				var user_info = $("#folder_member_list").children().eq(i).data("user");	//JSON.parse( $("#folder_member_list").children().eq(i).attr("data-user") );
				readers.push(user_info.ky);
				user_list.push(user_info);
			}

			var postData = {
				"drive_key" : folder_info.drive_key,
				"parent_folder_key" : (is_update ? folder_info.parent_folder_key : folder_info._id),
				"depth" : (is_update ? folder_info.depth : (parseInt(folder_info.depth) + 1).toString()),
				"folder_name" : folder_name,
				"folder_share" : "Y",
				"owner" : gap.userinfo.rinfo,
				"readers" : readers,
				"member" : user_list
			};
		}
		
		if (is_update){
			var delete_members_em = [];
			var folder_member = folder_info.member
			var folder_member_em = $.map(folder_member, function(ret, key) {
				return ret.em;
			});
			delete_members = $(folder_member_em).not(readers);
			
			if (delete_members.length > 0){
				for (var i = 0; i < delete_members.length; i++){
					delete_members_em.push(delete_members[i]);
				}
			}
			
			postData.delete_members = delete_members_em;
			postData.id = code;
		}
		
		var surl = gap.channelserver + "/api/files/" + (is_update ? "update_folder.km" : "make_folder.km");
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "text",
			contentType : "application/json; charset=utf-8",
			data : JSON.stringify(postData),
			success : function(ress){
				var res = JSON.parse(ress);
				if (res.result == "OK"){
					
					gBodyM.mobile_close_layer('create_channel_layer');
					var url_link = "kPortalMeet://NativeCall/callCloseLayer?done=yes&title=" + encodeURIComponent(folder_name);
					gBodyM.connectApp(url_link);
					return false;
					
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
	
	"draw_parent_member" : function(res, obj){
		var _parent_member = "";
		_parent_member = res.data.member;
		_parent_member.push(res.data.owner)

		if (obj){
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
			}			
		}

		for (var j = 0; j < _parent_member.length; j++){
			// parent 멤버 중 초대 가능 멤버 표시
			if (_parent_member[j].ky != gap.userinfo.rinfo.ky){
				gBodyM2.channel_add_user("I", _parent_member[j]);	
			}
		}
	},
	
	"channel_create_folder" : function(_code, is_share){
		gBodyM2.load_folder_info = "";
		var is_update = (_code != undefined ? true : false);
		var is_folder_share = (is_share != undefined ? is_share : "Y");
		
		var html = gBodyM2.folder_layer_html(is_update);
		$("#create_channel_layer").html(html);
		
		if (is_update){
			//폴더 정보 update인 경우
			
			var surl = gap.channelserver + "/search_folder_channel.km";
			var postData = {
					"key" : _code,
					"email" : gap.userinfo.rinfo.ky
				};			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){
						var obj = res.data;
						gBodyM2.load_folder_info = obj;
						
						$("#input_folder_name").val(gap.textToHtml(obj.name));
						$("#input_folder_name").parent().find("label").addClass("on");
						$("#input_folder_name").focus();
						
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
		
		$("#input_folder_name").on("change", function(){
			if($(this).val() == ""){
				$(this).parent().find("label").removeClass("on");
			} else {
				$(this).parent().find("label").addClass("on");
			}
		});			
		
		gBodyM.mobile_open_layer('create_channel_layer');
		gBodyM.mobile_finish();
	},
	
	"channel_create_folder_action" : function(code, is_folder_share){
		/*
		 * 채널 폴더 생성/수정
		 */
		var is_update = (code != undefined ? true : false);
		if ($.trim($("#input_folder_name").val()) == ""){
			mobiscroll.toast({message:gap.lang.input_foldername, color:'danger'});
			return;
		}
		var folder_name = $("#input_folder_name").val();
		var folder_info = gBodyM2.load_folder_info;
		var readers = [];
		
		readers.push(gap.userinfo.rinfo.ky);
		var postData = {
				"name" : folder_name,
				"share" : is_folder_share,
				"sort" : 1,			// folder : 1, project : 2
				"type" : "folder",	// type : folder / project
				"owner" : gap.userinfo.rinfo,
				"readers" : readers
			};
		
		if (is_update){
			postData.key = folder_info._id;
			postData.email = gap.search_cur_em();
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
					gBodyM.mobile_close_layer('create_channel_layer');
					var url_link = "kPortalMeet://NativeCall/callCloseLayer?done=yes";
					gBodyM.connectApp(url_link);
					return false;
					
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
	
	
	
	
	"og_search" : function(content){
		var isURL = gBodyM2.findUrls(content);
		var og = "";
		if (isURL.length > 0){
			og = gBodyM2.search_og_only_search(isURL[0]);
		}else{
			og = {};
		}
		
		return og;
	},
	
	"findUrls" : function(text){
		 var source = (text || '').toString();
		    var urlArray = [];
		    var url;
		    var matchArray;
		    // Regular expression to find FTP, HTTP(S) and email URLs.
		//    var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;
		    var regexToken = /(((https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)/g;
		    // Iterate through any URLs in the text.
		    while( (matchArray = regexToken.exec( source )) !== null )
		    {
		        var token = matchArray[0];
		        urlArray.push( token );
		    }
		    return urlArray;
	},	
	
	"domain_search" : function(url){
		var domain;
	    //find & remove protocol (http, ftp, etc.) and get domain
	    if (url.indexOf("://") > -1) {
	        domain = url.split('/')[2];
	    }
	    else {
	        domain = url.split('/')[0];
	    }
	    domain = domain.split(':')[0];
	    return domain;
	},
	
	"search_og_only_search" : function(str){
		//url을 넘기면 해당 ogTag 정보만 리턴해 주는 함수로 드래그 & 드롭으로 ogTag을 특정사용자에게 전달할때 정보를 읽어오기 위해서 만들었음.
		
		var urlstr = gBodyM2.findUrls(str);		
		if (urlstr.length == 0){
			return false;
		}
		var data = JSON.stringify({
			url : urlstr[0]
		});
	
		
		var res = false;

		//var input_domain = urlstr[0].match(/(?<=https?:\/\/)(.*?)(?=$|[\/?\&])/)[0]; <== IE에서 적용되지 않는 정규식이라서 교체
		var input_domain = gBodyM2.domain_search(urlstr[0]);
		var input_h = urlstr[0].match(/(.*?)(?=$|[\/?\&])/)[0];
		var input_url = input_h + "//" + input_domain;
		
		var obj = new Object();

		var surl = gap.ogtag_search_url;
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : surl,
			async : false,
			data : data,
			success : function(res){
				
				var og = res.data;
				if (res.success){
					var html = "";
					var linkurl = og.ogUrl;
									
					if (typeof(og.ogTitle) != "undefined"){				
					}
					if (typeof(og.ogDescription) != "undefined"){				
					}
					if (typeof(og.ogImage) != "undefined"){
						var cnt = og.ogImage.length;
						var url = og.ogImage.url;
						if (cnt > 1) {
							url = og.ogImage[0].url;
						}					
						
						var msgid = gap.make_msg_id();   //랜덤한 키값을 생성한다.					
						
				    	obj.ty = 4;
				    	obj.msg = str;
				    	obj.cid = '';	//gBody.cur_cid;
				    	obj.mid = msgid;
						
						if (typeof(url) != "undefined" && url != ""){
							if (url.indexOf("http") < 0){
								var rurl = input_url;					

								var turl = input_domain;
								if (url.indexOf("//" + turl) > -1){
									//https://www.kookmin.ac.kr 이 경우
									url = rurl.replace("//" + turl, "") + url.replace("./","/");
								}else if (url.indexOf(turl) > -1){
									url = rurl.replace(turl, "") + url.replace("./","/");
								}else if (url.substring(0,2) == "//"){
									if (rurl.indexOf("https") > -1){
										url = "https:" + url;
									}else{
										url = "http:" + url;
									}
									
								}else{
									url = rurl + url.replace("./","/");
								}						
							}
							
							url = url.replace("cdn.ddaily.co.kr","www.ddaily.co.kr");
							
							var regexToken = /(http(s)?:\/\/)([a-z0-9\w]+\.*)+[a-z0-9]{2,4}/g;						    
							var domain = regexToken.exec( og.ogUrl );
							
							
							var title  = og.ogTitle;
							var desc = og.ogDescription;
							
							if (domain != null){
								domain = domain[0];
							}else{
								domain = "";
							}
							
							if (typeof(title) == "undefined"){
								title = "";
							}
							if (typeof(desc) == "undefined"){
								desc = "";
							}

					    	 var exobj = new Object();		    	 		    	 
					    	 exobj.tle = title;
					    	 exobj.lnk = linkurl;
					    	 exobj.img = url;
					    	 exobj.desc = desc;
					    	 exobj.dmn = domain;
					    
					    	 obj.ex = exobj;						
						}else{					
							
						}						
					}else{					
					}
					
				}else{							
				}
			},
			error : function(e){
				alert(e);
			}
		});
		return obj;
	},
	
	"config_channel_view" : function(key){
		// 채널 설정 전역변수 설정
		
		var surl = gap.channelserver + "/api/channel/channel_options_read.km";
		var postData = {
				"key" : key	//gBodyM.cur_select_info.channel_code
			};			

		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",	//"json",
			data : JSON.stringify(postData),
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			async : false,
			success : function(__res){
				var res = __res;
				if (res.result == "OK"){
					gBodyM.prevent_auto_scrolling = (res.data.opt1 != "" ? res.data.opt1 : "1");
					gBodyM.collapse_reply = (res.data.opt2 != "" ? res.data.opt2 : "2");
					gBodyM.post_view_type = (res.data.opt3 != "" ? res.data.opt3 : "1");
					gBodyM.push_receive = (res.data.opt4 != "" ? res.data.opt4 : "1");
					gBodyM.collapse_editor = (res.data.opt5 != "" && typeof(res.data.opt5 != "undefined") ? res.data.opt5 : "2");
				}
			},
			error : function(e){
			}
		});		
		
		var html = "";

		html += "<div class='wrap drive-create'>";
	//	html += "	<h2>" + gap.lang.userConfig + "</h2>";
		html += "	<div class='set-language' style='margin-top:30px;'>";
		html += "		<h4 style='font-size:14px;'>"+gap.lang.prevent_auto_scrolling+"</h4>";
		html += "		<div class='radio'>";
		html += "			<label>";
		html += "				<input name='prevent_auto_scrolling' class='with-gap' type='radio' value='1'" + (gBodyM.prevent_auto_scrolling == "1" ? " checked" : "") + ">";
		html += "				<span>"+gap.lang.use+"</span>";
		html += "			</label>";
		html += "		</div>";
		html += "		<div class='radio' style='padding-left:20px;'>";
		html += "			<label>";
		html += "				<input name='prevent_auto_scrolling' class='with-gap' type='radio' value='2'" + (gBodyM.prevent_auto_scrolling == "2" ? " checked" : "") + ">";
		html += "				<span>"+gap.lang.not_used+"</span>";
		html += "			</label>";
		html += "		</div>";
		html += "	</div>";
		
		html += "	<div class='set-language' style='margin-top:30px;'>";
		html += "		<h4 style='font-size:14px;'>"+gap.lang.collapse_reply+"</h4>";
		html += "		<div class='radio'>";
		html += "			<label>";
		html += "				<input name='collapse_reply' class='with-gap' type='radio' value='1'" + (gBodyM.collapse_reply == "1" ? " checked" : "") + ">";
		html += "				<span>"+gap.lang.use+"</span>";
		html += "			</label>";
		html += "		</div>";
		html += "		<div class='radio'style='padding-left:20px;'>";
		html += "			<label>";
		html += "				<input name='collapse_reply' class='with-gap' type='radio' value='2'" + (gBodyM.collapse_reply == "2" ? " checked" : "") + ">";
		html += "				<span>"+gap.lang.not_used+"</span>";
		html += "			</label>";
		html += "		</div>";
		html += "	</div>";
		
		html += "	<div class='set-language' style='margin-top:30px;'>";
		html += "		<h4 style='font-size:14px;'>"+gap.lang.editor_title+"</h4>";
		html += "		<div class='radio'>";
		html += "			<label>";
		html += "				<input name='collapse_editor' class='with-gap' type='radio' value='1'" + (gBodyM.collapse_editor == "1" ? " checked" : "") + ">";
		html += "				<span>"+gap.lang.use+"</span>";
		html += "			</label>";
		html += "		</div>";
		html += "		<div class='radio'style='padding-left:20px;'>";
		html += "			<label>";
		html += "				<input name='collapse_editor' class='with-gap' type='radio' value='2'" + (gBodyM.collapse_editor == "2" ? " checked" : "") + ">";
		html += "				<span>"+gap.lang.not_used+"</span>";
		html += "			</label>";
		html += "		</div>";
		html += "	</div>";
		
		html += "	<div class='set-language' style='margin-top:30px;'>";
		html += "		<h4 style='font-size:14px;'>"+gap.lang.post_view_type+"</h4>";
		html += "		<div class='radio'>";
		html += "			<label>";
		html += "				<input name='post_view_type' class='with-gap' type='radio' value='1'" + (gBodyM.post_view_type == "1" ? " checked" : "") + ">";
		html += "				<span>"+gap.lang.by_modified_date+"</span>";
		html += "			</label>";
		html += "		</div>";
		html += "		<div class='radio'style='padding-left:20px;'>";
		html += "			<label>";
		html += "				<input name='post_view_type' class='with-gap' type='radio' value='2'" + (gBodyM.post_view_type == "2" ? " checked" : "") + ">";
		html += "				<span>"+gap.lang.by_registration_date+"</span>";
		html += "			</label>";
		html += "		</div>";	
		html += "	</div>";
		
		html += "	<div class='set-language' style='margin-top:30px;'>";
		html += "		<h4 style='font-size:14px;'>"+gap.lang.push_noti+"</h4>";
		html += "		<div class='radio'>";
		html += "			<label>";
		html += "				<input name='push_receive' class='with-gap' type='radio' value='1'" + (gBodyM.push_receive == "1" ? " checked" : "") + ">";
		html += "				<span>"+gap.lang.receive+"</span>";
		html += "			</label>";
		html += "		</div>";
		html += "		<div class='radio'style='padding-left:20px;'>";
		html += "			<label>";
		html += "				<input name='push_receive' class='with-gap' type='radio' value='2'" + (gBodyM.push_receive == "2" ? " checked" : "") + ">";
		html += "				<span>"+gap.lang.do_not_receive+"</span>";
		html += "			</label>";
		html += "		</div>";	
		html += "	</div>";
		html += "</div>";
		
		$("#create_channel_layer").html(html);
		
		$("[name=prevent_auto_scrolling]").on("click", function(){
			gBodyM.prevent_auto_scrolling = $(this).val();
			gBodyM.save_channel_option(key);
		//	localStorage.setItem('prevent_auto_scrolling', $(this).val());
		});
		
		$("[name=collapse_reply]").on("click", function(){
			gBodyM.collapse_reply = $(this).val();
			gBodyM.save_channel_option(key);
		//	localStorage.setItem('collapse_reply', $(this).val());
		});
		
		$("[name=collapse_editor]").on("click", function(){
			gBodyM.collapse_editor = $(this).val();
			gBodyM.save_channel_option(key);
		//	localStorage.setItem('collapse_reply', $(this).val());
		});
		
		$("[name=post_view_type]").on("click", function(){
			gBodyM.post_view_type = $(this).val();
			gBodyM.save_channel_option(key);
		//	localStorage.setItem('post_view_type', $(this).val());
		});		
		
		$("[name=push_receive]").on("click", function(){
			gBodyM.push_receive = $(this).val();
			gBodyM.save_channel_option(key);
		//	localStorage.setItem('post_view_type', $(this).val());
		});	
		
		gBodyM.mobile_open_layer('create_channel_layer');
	},
	
	"update_drive_folder" : function(){
		if (gBodyM2.select_folder_code == "root"){
			// 드라이브 호출
			gBodyM2.load_drive(gBodyM2.select_drive_code, gBodyM2.select_drive_name, '');
			
		}else{
			// 폴더 호출
			gBodyM2.load_folder(gBodyM2.select_drive_code, gBodyM2.select_folder_code, gBodyM2.select_folder_name);
		}
	},
	
	"unread_test" : function(){
		var data = JSON.stringify({
			"email" : gap.userinfo.rinfo.ky,
			"depts" : gap.full_dept_codes()
		});
		
		var url = gap.channelserver + "/api/channel/channel_info_unread.km";
		$.ajax({
			type : "POST",
			data : data,
			url : url,
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			success : function(res){
			
				console.log(res);
			},
			error : function(e){
				gap.error_alert();
			}
		})
	},
	
	"check_channel_owner" : function(){
		var ret = "";
		var surl = gap.channelserver + "/api/channel/search_info.km";
		var postData = {
				"type" : "C",
				"ch_code" : gBodyM.select_channel_code
			};			

		$.ajax({
			type : "POST",
			url : surl,
			async : false,
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					if (res.data.owner.ky == gap.userinfo.rinfo.ky){
						ret = "T";
					}else{
						ret = "F";
					}

				}else{
					ret = "F";
				}
			},
			error : function(e){
				ret = "F";
			}
		});
		
		return ret;
	},
	
	"check_drive_folder_owner" : function(){
		if (gBodyM2.select_folder_code == "root"){
			// 드라이브
			var ret = "";
			var surl = gap.channelserver + "/api/channel/search_info.km";
			var postData = {
					"type" : "D",
					"ch_code" : gBodyM2.select_drive_code
				};			

			$.ajax({
				type : "POST",
				url : surl,
				async : false,
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){
						if (res.data.owner.ky == gap.userinfo.rinfo.ky){
							ret = "drive-spl-T-spl-" + gBodyM2.select_drive_code + "-spl-T";
						}else{
							ret = "drive-spl-F-spl-" + gBodyM2.select_drive_code + "-spl-F";
						}
						
					}else{
						ret = "drive-spl-F-spl-" + gBodyM2.select_drive_code + "-spl-F";
					}
				},
				error : function(e){
					ret = "drive-spl-F-spl-" + gBodyM2.select_drive_code + "-spl-F";
				}
			});	
			
			return ret;
			
		}else{
			// 폴더
			var ret = "";
			var surl = gap.channelserver + "/api/channel/search_info.km";
			var postData = {
					"type" : "D",
					"ch_code" : gBodyM2.select_drive_code
				};			

			$.ajax({
				type : "POST",
				url : surl,
				async : false,
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				data : JSON.stringify(postData),
				success : function(res){
					if (res.result == "OK"){
						var drive_owner = "F";
						if (res.data.owner.ky == gap.userinfo.rinfo.ky){
							drive_owner = "T";
						}
						
						ret = "folder-spl-F-spl-" + gBodyM2.select_folder_code + "-spl-" + drive_owner;
						for (var i = 0; i < gBodyM2.cur_folder_list_info.length; i++){
							var item = gBodyM2.cur_folder_list_info[i];
							if ( (item._id == gBodyM2.select_folder_code) && (item.owner.ky == gap.userinfo.rinfo.ky) ){
								ret = "folder-spl-T-spl-" + gBodyM2.select_folder_code + "-spl-" + drive_owner;
								break;
							}
						}
						
					}else{
						ret = "folder-spl-F-spl-" + gBodyM2.select_folder_code + "-spl-F";
					}

				},
				error : function(e){
					ret = "folder-spl-F-spl-" + gBodyM2.select_folder_code + "-spl-F";
				}
			});
			
			return ret;
		}
	},
	
	"get_drive_owner" : function(drive_code){
		for (var i = 0; i < gBodyM2.cur_drive_list_info.length; i++){
			var drive_info = gBodyM2.cur_drive_list_info[i];
			if (drive_info.ch_code == drive_code){
				return drive_info.owner;
				break;
			}
		}
	},
	
	"check_todo_project_owner" : function(){
		var ret = "";
		var surl = gap.channelserver + "/search_folder_todo.km";
		var postData = {
				"key" : gTodoM.cur_project_code,
				"email" : gap.search_cur_em()
			};			

		$.ajax({
			type : "POST",
			url : surl,
			async : false,
			dataType : "json",
			data : JSON.stringify(postData),
			success : function(res){
				if (res.result == "OK"){
					if (res.data.owner.ky == gap.userinfo.rinfo.ky){
						ret = "T";
					}else{
						ret = "F";
					}
				
				}else{
					ret = "F";
				}
			},
			error : function(e){
				ret = "F";
			}
		});
		
		return ret;
	},
	
	"clear_layer" : function(selector){
		var layer_list = [];
		
		layer_list.push('create_channel_layer');
		layer_list.push('move_file_layer');
		layer_list.push('drive_fileupload_layer');
		layer_list.push('exit_info_layer');
		layer_list.push('preview_img');
		layer_list.push('preview_video');
		
		for (var i = 0; i < layer_list.length; i++){
			if (layer_list[i] != selector){
				$('#' + layer_list[i]).empty();
				$('#' + layer_list[i]).hide();				
			}
		}
	}
}
