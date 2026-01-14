

function gRightMenu(){
	this.my_timeformat = (gap.userinfo.userLang == "ko" ? "HH:mm" : "h:mmA");
	this.browser = gap.browser_check();
	this.right_side_open_layer = "";
	this.select_buddy_id = "";
	this.memo_list = [];
	this.memo_sender_list = [];
	this.memo_file_limit_size = 3145728;	//3 MB
	this.memo_file_total_size = 0;
	this.memo_file_upload_list = [];
	this.memo_file_upload_dir = "";
	this.user_ky = gap.userinfo.rinfo.ky;	//"CN=백성호,OU=dune22,O=APG";
	this.user_id = gap.userinfo.rinfo.id;	//"AC920209";
	this.user_nm = gap.userinfo.rinfo.nm;	//"백성호";
	this.user_enm = gap.userinfo.rinfo.enm;	//영문이름;
	this.user_em = gap.userinfo.rinfo.em;	//"dune22@amorepacific.com";
	this.user_el = gap.userinfo.rinfo.el;	//user eip_lang;

	this.memo_fileupload_server_url = gap.getHostUrl() + "/fud";

	this.file_cur_cnt = 0;					//우축에 있는 파일 리스트 스크롤에 사용
	this.file_total_cnt = 0;				//우축에 있는 파일 리스트 스크롤에 사용
	this.image_cur_cnt = 0;					//우축에 있는 이미지 리스트 스크롤에 사용
	this.image_total_cnt = 0;				//우축에 있는 이미지 리스트 스크롤에 사용
	
	this.file_more_cur_cnt = 0;				//우축에 있는 파일 리스트 스크롤에 사용
	this.file_more_total_cnt = 0;			//우축에 있는 파일 리스트 스크롤에 사용
	this.image_more_cur_cnt = 0;			//우축에 있는 이미지 리스트 스크롤에 사용
	this.image_more_total_cnt = 0;			//우축에 있는 이미지 리스트 스크롤에 사용
	
	this.file_more_search_cur_cnt = 0;		//우축에 있는 파일 리스트 스크롤에 사용
	this.file_more_search_total_cnt = 0;	//우축에 있는 파일 리스트 스크롤에 사용
	this.image_more_search_cur_cnt = 0;		//우축에 있는 이미지 리스트 스크롤에 사용
	this.image_more_search_total_cnt = 0;	//우축에 있는 이미지 리스트 스크롤에 사용	
	
	this.link_cur_cnt = 0;					//우축에 있는 링크 리스트 스크롤에 사용
	this.link_total_cnt = 0;				//우축에 있는 링크 리스트 스크롤에 사용
	
	this.is_box_layer_open = false;

}

gRightMenu.prototype = {
	"init" : function(){
		//초기화 이벤트 핸들러 정의한다.
		this._eventHandler();			
	},
	
	"_eventHandler" : function(){

		$("#show_attach_layer").on("click", function(){
			
			$("#preview_download").off();
			$("#preview_download").on("click", function(e){
				e.preventDefault();
				gap.close_preview_download();
				return false;
			});				
			
			gRM.attach_count_init();
			
			gRM.draw_all_attach('all', '');			
			gRM.right_side_open_layer = "attach";			
			gRM.layer_open();
		
		});
		
		$("#show_link_layer").on("click", function(){
			gRM.link_cur_cnt = 0;				//링크 갯수 초기화
			gRM.link_total_cnt = 0;				//링크 갯수 초기화
			gRM.draw_all_link();
			
			gRM.right_side_open_layer = "link";			
			gRM.layer_open();		
		});
		
		$("#show_memo_layer").on("click", function(){
	
		//	$(".left-area").css("width", "calc(100% - "+gap.right_page_width+")");
			gRM.draw_memo_to_right_frame();
			gRM.right_side_open_layer = "memo";			
			gRM.layer_open();

		});
		
		$("#show_video_layer").on("click", function(){
			
			if (gap.IE_Check()){
				gap.gAlert(gap.lang.IE_Notsupport);
			}else{
				gBody.rigth_btn_change_empty();			
				gBody.open_video_popup("T", "");
			}
		});
		
		
		$("#show_chat_layer").on("click", function(){
			//alert("WebChat메인으로 이동한다.");
			gap.cur_window = "chat";
			gap.LoadPage("body_content", cdbpath + "/html/main_body.html");  
			//gap.load_init();
		});
		
		$("#show_todo_layer").on("click", function(){
			gRM.right_side_open_layer = "todo";		
			gap.cur_window = "todo";
			gBody3.show_todo_init();
			gTodoC.init_load();
		});
	},
	
	"layer_open" : function(){
				
		
		
		if ($("#ext_body").hasClass("view-info")){
			$("#ext_body").removeClass("view-info");
			$("#ext_body").css("width", "calc(" + gap.right_page_width + " - 10px)");			
		}
		
		if (call_key != ""){
			var width = $(window).width();
			var cp = width - 356;
			$("#ext_body").css("left", cp + "px");
		}else{
			$(".left-area").css("width", "calc(100% - "+gap.right_page_width+")");
		}
		
		
	},
	
	"layer_close" : function(){
				
		if (gap.curpage == "" || gap.tmppage == "usearch" || gap.tmppage == "history"){
			$(".left-area").css("width", "100%");
		}
		
		if ($(window).width() < 730){
			$(".left-area").css("width", "100%");
		}	
		
		var cpage = gap.curpage;		
		if ($("#right_menu_collpase_btn").hasClass("on")){
			if (cpage == "main"){
				//$("#user_profile").show();
				$("#center_content").css("width", "100%");
			}else if (cpage == "chat"){		
				$(".left-area").css("width", "100%");
				//$("#chat_profile").show();
			}
		}else{
			
		}
	},
	
	
	"box_layer_open" : function(){

		$("#ext_body").addClass("view-info");
		$("#ext_body").css("overflow", "hidden");
		$("#ext_body").css("width", gap.right_box_page_width);
		$("#ext_body").fadeIn(function(){
			$(".left-area").css("width", "calc(100% - " + gap.right_box_page_width + ")");
/*			$('#grid_wrap').masonry('reloadItems');
			$('#grid_wrap').masonry('layout');*/
		});
		$("#drive_data_list").addClass("line2");
		$("#favorite_data_list").addClass("line2");
		$("#files_data_list").addClass("line2");
		gRM.is_box_layer_open = true;
	},
	
	"box_layer_close" : function(){
		
		if (gBody.cur_todo != ""){
			//현재 todo화면에서 미리보기 창을 호출한 경우에 닫기를 클릭한 경우이다.
			$("#ext_body").empty();
			$("#ext_body").fadeOut();
			$("#center_content").css("width", "calc(60% - 10px)");
		}else{
			//Box내부에서 닫기를 호출한 경우			
		//	if (gBody3.cur_opt == "allcontent" || gBody3.cur_opt == "mycontent" || gBody3.cur_opt == "sharecontent"){
			if (gBody3.check_top_menu_new()){
				$(".left-area").css("width", "100%");
			}else{
				$(".left-area").css("width", "calc(100% - " + gap.right_page_width + ")");
			}
			
			$("#ext_body").removeClass("view-info");
			$("#ext_body").empty();
			$("#ext_body").fadeOut();
			/*$('#grid_wrap').masonry('reloadItems');
			$('#grid_wrap').masonry('layout');*/
			$("#drive_data_list").removeClass("line2");
			$("#favorite_data_list").removeClass("line2");
			$("#files_data_list").removeClass("line2");
			$("#main_data_list").removeClass("line2");
			gRM.box_search_layer_close();
			gRM.is_box_layer_open = false;
		}

	},	
	
	"box_search_layer_close" : function(){
		$("#ext_body_search").removeClass("channel");
		$("#ext_body_search").removeClass("chat-area");
	},
	
	"attach_count_init" : function(){
		//파일 갯수 초기화
		gRM.file_cur_cnt = 0;
		gRM.file_total_cnt = 0;
		gRM.image_cur_cnt = 0;
		gRM.image_total_cnt = 0;
		
		gRM.file_more_cur_cnt = 0;
		gRM.file_more_total_cnt = 0;
		gRM.image_more_cur_cnt = 0;
		gRM.image_more_total_cnt = 0;
		
		gRM.file_more_search_cur_cnt = 0;
		gRM.file_more_search_total_cnt = 0;
		gRM.image_more_search_cur_cnt = 0;
		gRM.image_more_search_total_cnt = 0;
	},
	
	"draw_chat_room_image" : function(obj, is_chatroom){
		gap.show_content("ext");
		gBody.rigth_btn_change_empty();
	//	gBody.rigth_btn_change("attach");

		var lists = obj.log;
		if (lists.length == 0){
			return false;
		}		
		
		if (gRM.image_cur_cnt == 0){
			var html = "";
			html += "<div class='file-search'>";
			html += "	<h2>" + gap.lang.shareimage
			html += "		<span>";
			html += "			(<span style='margin-left:0px' id='room_image_ccount'>0</span>/<span style='margin-left:0px' id='room_image_tcount'>0</span>)";
			html += "		</span>";
			html += "	</h2>";
			html += " 	<button class='ico btn-right-close' id='file_layer_close'>닫기</button>";
			html += " 	<div class='input-field'> ";
			html += "	 	<input type='text' id='file_search_query' class='formInput'  />";
			html += "	 	<span class='bar'></span>";
			html += "		<button class='btn-file-back ico' id='file_search_back' style='display:none;'>뒤로가기</button>";
			html += " 	</div>";
			html += " 	<button class='btn-file-search ico' id='chat_room_file_search_btn'>검색</button>";
			html += "</div>";
			
			html += "<div id='right_layer_ext_wrap' style='height: calc(100% - 150px); overflow-y:visible;'>";
			html += "	<div class='share-photo'>";
			html += "		<div class='group-img'>";
			html += "			<ul id='chat_room_img_result'>";
			html += "			</ul>";
			html += "			<ul id='chat_room_img_search_result' style='display:none;'>";
			html += "			</ul>";
			html += "		</div>";
			html += "	</div>";
			html += "</div>";
			
			$("#ext_body").html(html);			
		}	

		for (var i = 0 ; i < lists.length; i++){
			var _html = "";			
			var iit = lists[i];			
			var dis_date = gap.change_date_default(gap.search_today_only3(iit.dt));
			var exist = $("#chat_room_img_result").find("[data='"+dis_date+"']");
			if (exist.length ==0){
				var htm = "<li data='"+dis_date+"' style='font-size:12px; font-weight:bold;  width:250px'><div>"+dis_date+"</div></li>";
				$("#chat_room_img_result").append(htm);
			}
			
			var info = iit.ex;
			
			var sq = iit.sq;
			if (typeof(lists[i].ex.files) != "undefined"){
				sq = sq + "_0";
			}
			var isMulti = false;
			if ((typeof(info.files) != "undefined")  && (info.files.length > 0)){
				info = info.files[0];
				isMulti = true;
			}

			var fserver = gap.search_fileserver(info.nid);
			var preview_img = fserver + info.sf + "/thumbnail/" + info.sn;
			var downloadpath = fserver + "/filedown" + info.sf + "/" + info.sn;
			
			_html += "<li class='chat_img'>";
			_html += "	<span>";
			_html += "		<img style='width:75px; ' data1='" + info.nm + "' data2='" + downloadpath + "' data3='" + info.sz + "' data4='"+sq+"' src='" + preview_img + "' onerror='this.src=\"../resource/images/thm_img_s.png\"' alt='' />";
			
			if (isMulti){
				_html += "<div class='submulti' style='position:absolute; bottom:5px; right:5px;  width:20px; height:20px' id='multi_"+sq+"'>";
				_html += "<img src='common/img/multi_image.png'>";
				_html += "</div>";
			}
			
			_html += "	</span>";
			_html += "</li>";
			
			$("#chat_room_img_result").append(_html);
		}
		
		

		$("#file_search_query").attr("placeholder",gap.lang.filenamesearch);
		$("#file_search_query").keypress(function(e) { 
		    if (e.keyCode == 13){
		    	$("#chat_room_file_search_btn").click();
		    }    
		});
		
		$("#file_search_back").on("click", function(){
			$("#room_image_ccount").text(gRM.image_cur_cnt);
			$("#room_image_tcount").text(gRM.image_total_cnt);
			$("#file_search_query").val("");
			$("#file_search_back").hide();
			$("#chat_room_img_result").show();
			$("#chat_room_img_search_result").empty();
			$("#chat_room_img_search_result").hide();
		})
		
		$("#chat_room_file_search_btn").on("click", function(){
			var query = $("#file_search_query").val();
			if (query == 0){
				gap.gAlert(gap.lang.input_search_query);
				$("#file_search_query").val("");
				$("#file_search_query").focus();
				return false;
			}
			/*
			 * param : 대화방 ID, 검색대상 파일 종류, 확장자 배열값, 검색어, 번환 검색 갯수, 반환 검색 갯수 시작점
			 */
			_wsocket.chat_room_file_search_right_frame(obj.cid, [6], "", query, 100, 0);
		});
		
		$("#file_layer_close").on("click", function(){
			gRM.layer_close();
			
			gBody.rigth_btn_change_empty();
			$("#ext_body").empty();
			$("#ext_body").fadeOut();
		});
		
		$(".share-photo span").on("click", function(){
//			var fname = $(this).find("img").attr("data1");
//			var url = $(this).children().attr("data2") + "/" + encodeURIComponent(fname);
//			
//		
//			gap.image_gallery = new Array();  //변수 초기화 해준다.
//			gap.image_gallery_current = 1;
//			
//			var image_list = $(this).parent().parent().find("img");
//			if (image_list.length > 0){				
//				var k = 1;
//				for (var i = 0 ; i < image_list.length; i++){
//					var image_object = new Object();
//					var image_info = image_list[i];
//					
//					var fname = $(image_info).attr("data1");
//					var turl = $(image_info).attr("data2") + "/" + encodeURIComponent(fname);
//
//					image_object.title = fname;
//					image_object.url = turl;
//					image_object.sort = k;
//					
//					gap.image_gallery.push(image_object);
//					if (turl == url){
//						gap.image_gallery_current = k;
//					}
//					k++;
//				}
//			}
//			
//			
//			
//			gap.show_image(url, fname);	
		
			var sq = $(this).find("img").attr("data4");
			gBody.chat_gallery_show(sq);

		});
		
		$(".group-img ul li").on("mouseover", function(){
			$(this).css("cursor","pointer");
			$(this).draggable({
				revert: "invalid",
				stack: ".draggable",     //가장위에 설정해 준다.
				opacity: 1,
				scroll: false,
			//	helper: 'clone',
				cursorAt: { top: 5, left:5},
				helper: function (e) { 
					//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.					
					//$('table').css({ 'position': 'relative' });
					return $(this).clone().appendTo("#top_content").css("zIndex",3000).show();
			    },
			    cursor: 'move',			 
			    start : function(event, ui){
			    	
			    	$(this).draggable("option", "revert", false);
					
					var html = "";
					var iorg = ui.helper.find("img");
					html += "<img style='width:60px' data1=" + iorg.attr("data1") + " data2=" + iorg.attr("data2") + " data3=" + iorg.attr("data3") + " src=" + iorg.attr("src") + " onerror='this.src=\"../resource/images/thm_img_s.png\"'>";
					ui.helper.html(html);
			    },
			    stop : function(event, ui){						
				}
			});
		});
		
		if (gRM.image_cur_cnt == 0){
			$("#right_layer_ext_wrap").mCustomScrollbar('destroy');
			$("#right_layer_ext_wrap").mCustomScrollbar({
				theme:"dark",
				autoExpandScrollbar: false,
				scrollButtons:{
					enable:false
				},
				mouseWheelPixels : 200, // 마우스휠 속도
				scrollInertia : 400, // 부드러운 스크롤 효과 적용
				mouseWheel:{ preventDefault: false },
				advanced:{
					updateOnContentResize: true
				},
				autoHideScrollbar : false,
			//	setTop : ($("#chat_msg").height() + 100) + "px"
				callbacks:{
					//	onTotalScrollBack: function(){addContent2(this)},
						onTotalScrollBackOffset: 100,
						onTotalScroll:function(){ gRM.add_chat_room_image(obj.cid) },
						onTotalScrollOffset:100,
						alwaysTriggerOffsets:true
				}
			});								
		}

		if (typeof(obj.cnt) != "undefined"){
			if (gRM.image_cur_cnt == 0){
				gRM.image_total_cnt = obj.cnt;
			}
			$("#room_image_tcount").text(gRM.image_total_cnt);
		}

		gRM.image_cur_cnt += lists.length;
		$("#room_image_ccount").text(gRM.image_cur_cnt);		
	},
	
	"add_chat_room_image" : function(cid){
		if (gRM.image_total_cnt > gRM.image_cur_cnt){
			_wsocket.chat_room_image_list_right_frame(cid, gRM.image_cur_cnt);
		}
	},
	
	"draw_chat_room_file" : function(obj, is_chatroom){
		gap.show_content("ext");
		gBody.rigth_btn_change_empty();
	//	gBody.rigth_btn_change("attach");

		var lists = obj.log;
		if (lists.length == 0){
			return false;
		}		
		
		if (gRM.file_cur_cnt == 0){
			var html = "";
			html += "<div class='file-search'>";
			html += "	<h2>" + gap.lang.sharefile
			html += "		<span>";
			html += "			(<span style='margin-left:0px' id='room_file_ccount'>0</span>/<span style='margin-left:0px' id='room_file_tcount'>0</span>)";
			html += "		</span>";
			html += "	</h2>";
			html += " 	<button class='ico btn-right-close' id='file_layer_close'>닫기</button>";
			html += " 	<div class='input-field'> ";
			html += "	 	<input type='text' id='file_search_query' class='formInput'  />";
			html += "	 	<span class='bar'></span>";
			html += "		<button class='btn-file-back ico' id='file_search_back' style='display:none;'>뒤로가기</button>";
			html += " 	</div>";
			html += " 	<button class='btn-file-search ico' id='chat_room_file_search_btn'>검색</button>";
			html += "</div>";
			
			html += "<div id='right_layer_ext_wrap' style='height: calc(100% - 150px); overflow-y:visible;'>";
			html += "	<div class='share-file'>";
			html += "		<div class='group-file'>";
			html += "			<ul id='chat_room_file_result'>";
			html += "			</ul>";
			html += "			<ul id='chat_room_file_search_result' style='display:none;'>";
			html += "			</ul>";
			html += "		</div>";
			html += "	</div>";
			html += "</div>";
			
			$("#ext_body").html(html);			
		}
		
		var _html = "";
		for (var i = 0 ; i < lists.length; i++){
			var item = lists[i];
			var key = lists[i].ky;
			var info = lists[i].ex;
/*			
			dt: 20191028013114012
			ex:
			nid: "ko_1"
			nm: "00_guide.html"
			sf: "/20191028"
			sn: "upload_789ee76449192899dcd5e1e9afa35ff7.html"
			sz: 3265
			ty: "html"
*/
			var ext = gap.file_icon_check(info.nm);
			var fserver = gap.search_fileserver(info.nid);
			var downloadpath = fserver + "/filedown" +  info.sf + "/" + info.sn + "/" + encodeURIComponent(info.nm);
			
			var fname = info.nm;
			if (fname.length > 22){
				fname = info.nm.substring(0,22);
			}
			
			var dis_date = gap.change_date_default(gap.search_today_only3(item.dt));
			
			_html += "		<li class='chat_file' title=\"" + info.nm + "\">";
			_html += "			<span class='ico ico-file " + ext + "' data1=\"" + info.nm + "\" data2='" + downloadpath + "'  data3='" + info.sz + "' data-key='"+key+"'></span>" + fname;
			_html += "			<button class='ico btn-file-download' style='width: 16px; height: 16px; left:237px; top: 50%; margin-top: -8px; background-position: -210px -20px;position : absolute;' title='File download'>다운로드</button>";
			_html += "			<br><span>"+item.nm+" | "+dis_date+" | "+gap.file_size_setting(info.sz)+"</span>"
			_html += "		</li>";
		}
		
		$("#chat_room_file_result").append(_html);

		$("#file_search_query").attr("placeholder",gap.lang.filenamesearch);
		$("#file_search_query").keypress(function(e) { 
		    if (e.keyCode == 13){
		    	$("#chat_room_file_search_btn").click();
		    }    
		});
		
		$("#file_search_back").on("click", function(){
			$("#room_file_ccount").text(gRM.file_cur_cnt);
			$("#room_file_tcount").text(gRM.file_total_cnt);
			$("#file_search_query").val("");
			$("#file_search_back").hide();
			$("#chat_room_file_result").show();
			$("#chat_room_file_search_result").empty();
			$("#chat_room_file_search_result").hide();
		})
		
		$("#chat_room_file_search_btn").on("click", function(){
			var query = $("#file_search_query").val();
			if (query == 0){
				gap.gAlert(gap.lang.input_search_query);
				$("#file_search_query").val("");
				$("#file_search_query").focus();
				return false;
			}
			/*
			 * param : 대화방 ID, 검색대상 파일 종류, 확장자 배열값, 검색어, 번환 검색 갯수, 반환 검색 갯수 시작점
			 */
			_wsocket.chat_room_file_search_right_frame(obj.cid, [5], "", query, 100, 0);
		});
		
		$("#file_layer_close").on("click", function(){		
			gRM.layer_close();
			
			gBody.rigth_btn_change_empty();
			$("#ext_body").empty();
			$("#ext_body").fadeOut();
		});
		
		$(".group-file .chat_file").off();
		$(".group-file .chat_file").on("click", function(e){
			
			
			var url = $(this).find("span").attr("data2");
			var key = $(e.target).children(0).data("key");
			var filename = $(e.target).children(0).attr("data1");
			if (typeof(filename) == "undefined"){
				filename = $(e.target).prev().attr("data1");
			}
			
			if ($(e.target).attr("class") == "ico btn-file-download"){
				filename = $(e.target).prev().attr("data1");
				gap.file_download_normal(url, filename);
			}else{
				if (gap.check_preview_file(filename)){
					gBody3.file_convert("", url, "", gBody.cur_cid, "chat", "", key, filename);	
				}else if (gap.file_show_video(filename)){
					gap.show_video(url, filename);
				}else{
					gap.file_download_normal(url, filename);
				}
				
			}
			//gap.file_download(url);
		});
		
		$(".group-file ul li").on("mouseover", function(){
			$(this).css("cursor","pointer");
			$(this).draggable({
				 revert: "invalid",
				 stack: ".draggable",     //가장위에 설정해 준다.
				 opacity: 1,
				 scroll: false,
			//	 helper: 'clone',
				 cursorAt: { top: 5, left:5},
				 helper: function (e) { 
					 //이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.
					 return $(this).clone().appendTo("#top_content").css("zIndex",3000).show();
			     },			 
			     cursor: 'move',			 		     
				 start : function(event, ui){
					$(this).draggable("option", "revert", false);

					var html = "";
					html += "<div class='balloon drag' style='padding:10px; white-space:nowrap;  '>";
					html += ui.helper.get(0).innerHTML;
					html + "</div>";
					ui.helper.html(html);
				},
				stop : function(event, ui){						
				}
			});
		});
		
		$(".group-file ul li").on("mouseout", function(){
			$(this).draggable( "destroy" )
		});		
		
		
		if (gRM.file_cur_cnt == 0){
			$("#right_layer_ext_wrap").mCustomScrollbar('destroy');
			$("#right_layer_ext_wrap").mCustomScrollbar({
				theme:"dark",
				autoExpandScrollbar: false,
				scrollButtons:{
					enable:false
				},
				mouseWheelPixels : 200, // 마우스휠 속도
				scrollInertia : 400, // 부드러운 스크롤 효과 적용
				mouseWheel:{ preventDefault: false },
				advanced:{
					updateOnContentResize: true
				},
				autoHideScrollbar : false,
			//	setTop : ($("#chat_msg").height() + 100) + "px"
				callbacks:{
				//	onTotalScrollBack: function(){addContent2(this)},
					onTotalScrollBackOffset: 100,
					onTotalScroll:function(){ gRM.add_chat_room_file(obj.cid) },
					onTotalScrollOffset:100,
					alwaysTriggerOffsets:true
				}
			});								
		}

		if (typeof(obj.cnt) != "undefined"){
			if (gRM.file_cur_cnt == 0){
				gRM.file_total_cnt = obj.cnt;
			}
			$("#room_file_tcount").text(gRM.file_total_cnt);
		}

		gRM.file_cur_cnt += lists.length;
		$("#room_file_ccount").text(gRM.file_cur_cnt);		
	},
	
	"add_chat_room_file" : function(cid){
		if (gRM.file_total_cnt > gRM.file_cur_cnt){
			_wsocket.chat_room_file_list_right_frame(cid, gRM.file_cur_cnt);
		}
	},	
	
	"draw_chat_room_file_search_result" : function(obj, search_kind){
		//대화방 파일 검색 결과 그리기
		var is_image = (search_kind == "image" ? true : false);
		var lists = obj.rt;
		
		$("#file_search_back").show();
		if (lists && lists.length == 0){
			if (search_kind == "image"){
				$("#room_image_ccount").text("0");
				$("#room_image_tcount").text("0");		
				$("#chat_room_img_result").hide();
				$("#chat_room_img_search_result").show();
				$("#chat_room_img_search_result").html(_html);				
			}
			
			if (search_kind == "file"){
				$("#all_file_ccnt").text("0");
				$("#all_file_tcnt").text("0");		
				$("#chat_room_file_result").hide();
				$("#chat_room_file_search_result").show();
				$("#chat_room_file_search_result").html(_html);					
			}
			return false;
		}
		
		var _html = "";
		
		var mul_imgs = [];
		for (var i = 0 ; i < lists.length; i++){
			
			var info = lists[i];
			var key = info.ky;
			
			var sq = lists[i].sq;
			if (lists[i].grp){
				sq = sq + "_0";	
				mul_imgs.push(lists[i]);			
			}
			var isMulti = false;
			if ((typeof(info.grp) != "undefined")  && (info.grp.length > 0)){
				info = info.grp[0];
				info.ty = lists[i].ty;
				isMulti = true;
			}
			
			var fserver = gap.search_fileserver(info.nid);
				
			if (info.ty == "6"){
				var preview_img = fserver + info.sf + "/thumbnail/" + info.sn;
				var downloadpath = fserver + "/filedown" + info.sf + "/" + info.sn;
				
				_html += "			<li class='chat_img'>";
				_html += "				<span style='border:1px solid #DDDAE2'>";
				_html += "					<img style='width:75px; ' data1='" + info.nm + "' data2='" + downloadpath + "' data3='" + info.sz + "' data4='"+sq+"' src='" + preview_img + "' onerror='this.src=\"../resource/images/thm_img_s.png\"' alt='' />";
				
				if (isMulti){
					_html += "<div class='submulti' style='position:absolute; bottom:5px; right:5px; width:20px; height:20px' id='multi_"+sq+"'>";
					_html += "<img src='common/img/multi_image.png'>";
					_html += "</div>";
				}
				
				_html += "				</span>";
				_html += "			</li>";				
				
			}else{
				var ext = gap.file_icon_check(info.nm);
				var downloadpath = fserver + "/filedown" +  info.sf + "/" + info.sn + "/" + encodeURIComponent(info.nm);
				
				_html += "		<li class='chat_file' title=\"" + info.nm + "\">";
				_html += "			<span class='ico ico-file " + ext + "' data1=\"" + info.nm + "\"  data2='" + downloadpath + "'  data3='" + info.sz + "'  data-key='"+key+"'></span>" + info.nm;
				_html += "		</li>";			
			}
		}
		$("#room_file_ccount").text(obj.cnt);
		if (is_image){
			$("#room_image_ccount").text(lists.length);
			$("#room_image_tcount").text(obj.cnt);	
			
			$("#chat_room_img_result").hide();
			$("#chat_room_img_search_result").show();
			$("#chat_room_img_search_result").html(_html);
			
		}else{
			$("#room_file_ccount").text(lists.length);
			$("#room_file_tcount").text(obj.cnt);	
			
			$("#chat_room_file_result").hide();
			$("#chat_room_file_search_result").show();
			$("#chat_room_file_search_result").html(_html);				
		}
		
		$(".share-photo span").on("click", function(){
			var fname = $(this).find("img").attr("data1");
			var url = $(this).children().attr("data2") + "/" + encodeURIComponent(fname);
			
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;

		//	gap.show_image(url, fname);
			
			var sq = $(this).find("img").attr("data4");
			gBody.chat_gallery_show(sq);

		});
		
		$(".share-file .chat_file").off();
		$(".share-file .chat_file").on("click", function(e){
			
		//	var url = $(this).find("span").attr("data2");
		//	gap.file_download(url);
			
			
			var url = $(this).find("span").attr("data2");
			var key = $(this).find("span").data("key");
			var filename = $(this).find("span").attr("data1");
			if (typeof(filename) == "undefined"){
				filename = $(e.target).prev().attr("data1");
			}
			if ($(e.target).attr("class") == "ico btn-file-download"){
				filename = $(e.target).prev().attr("data1");
				gap.file_download_normal(url, filename);
			}else{
				if (gap.check_preview_file(filename)){
					gBody3.file_convert("", url, "", gBody.cur_cid, "chat", "", key, filename);	
				}else if (gap.file_show_video(filename)){
					gap.show_video(url, filename);
				}else{
					gap.file_download_normal(url, filename);
				}				
			}
			
			
		});		
	},
	
	"draw_all_attach" : function(disp_kind, search_query){
		
		var sc_suffix = (disp_kind == "all" ? "" : "_more");
		gap.show_content("ext" + sc_suffix);
		gBody.rigth_btn_change_empty();
		gBody.rigth_btn_change("attach");

		var last_search_query = "";
		var html = "";
		
		html += "<div class='file-search'>";
		html += " 	<h2>"+gap.lang.file+"</h2>";
		html += " 	<button class='ico btn-right-close' id='file_layer_close" + sc_suffix + "'>닫기</button>";
		html += " 	<div class='input-field' id='all_attach_input" + sc_suffix + "'> ";
		html += "	 	<input type='text' id='file_search_query" + sc_suffix + "' class='formInput' placeholder='파일명을 검색하세요.' />";
		html += "	 	<span class='bar'></span>";
		if (disp_kind == "all"){
			html += "	 	<button class='btn-file-filter ico' id='file_detail_filter'>상세검색</button>";
		}
		html += "		<button class='btn-file-back ico' id='file_search_back" + sc_suffix + "' style='display:none;'>뒤로가기</button>";
		html += " 	</div>";
		html += " 	<button class='btn-file-search ico' id='all_attach_search_btn" + sc_suffix + "'>검색</button>";
		html += " 	<div class='filter' id='filter_icon' style='display:none'>";
		html += "	 	<ul>";
		html += "			<li><button class='ico btn-filter-ppt' title='ppt'>ppt</button></li>";
		html += "			<li><button class='ico btn-filter-word' title='word'>word</button></li>";
		html += "			<li><button class='ico btn-filter-excel' title='excel'>excel</button></li>";
		html += "			<li><button class='ico btn-filter-pdf' title='pdf'>pdf</button></li>";
		html += "			<li><button class='ico btn-filter-img' title='image'>img</button></li>";
		html += "			<li><button class='ico btn-filter-video' title='video'>video</button></li>";
		html += "		</ul>";
		html += "	</div>";
		html += "</div>";
		
		
		html += "<div id='right_layer_ext_wrap" + sc_suffix + "' style='height: calc(100% - 120px)'>";
		if (disp_kind == "all"){
			html += "<div class='share-photo'>";
			html += "	<h2>Photo<span>(<span style='margin-left:0px' id='all_image_ccnt'>0</span>/<span style='margin-left:0px' id='all_image_tcnt'>0</span>)</span></h2>";
			html += "	<button class='ico btn-right-more' id='all_image_more' onclick=\"gRM.more_attach_list('image','" + last_search_query + "')\">더보기</button>";
			html += "	<div class='group-img'>";
			html += "		<ul id='all_image_list'>";
			html += "		</ul>";
			html += "		<ul id='all_image_search_result' style='display:none;'>";
			html += "		</ul>";		
			html += "	</div>";
			html += "</div>";
			html += "<div class='share-file' id='share-file-right'>";
			html += "	<h2>File<span>(<span style='margin-left:0px' id='all_file_ccnt'>0</span>/<span style='margin-left:0px' id='all_file_tcnt'>0</span>)</span></h2>";
			html += "	<button class='ico btn-right-more' id='all_file_more' onclick=\"gRM.more_attach_list('file','" + last_search_query + "')\">더보기</button>";
			html += "	<ul id='all_file_list'>";
			html += "	</ul>";
			html += "	<ul id='all_file_search_result' style='display:none;'>";
			html += "	</ul>";
			html += "</div>";
			
		}else if (disp_kind == "image"){
			html += "<div class='share-photo'>";
			html += "	<h2>Photo<span>(<span style='margin-left:0px' id='all_image_ccnt" + sc_suffix + "'>0</span>/<span style='margin-left:0px' id='all_image_tcnt" + sc_suffix + "'>0</span>)</span></h2>";
		//	html += "	<button class='ico btn-right-more'>더보기</button>";
			html += "	<div class='group-img'>";
			html += "		<ul id='all_image_list" + sc_suffix + "'>";
			html += "		</ul>";
			html += "		<ul id='all_image_search_result" + sc_suffix + "' style='display:none;'>";
			html += "		</ul>";		
			html += "	</div>";
			html += "</div>";
			
		}else if (disp_kind == "file"){
			html += "<div class='share-file' id='share-file-right" + sc_suffix + "'>";
			html += "	<h2>File<span>(<span style='margin-left:0px' id='all_file_ccnt" + sc_suffix + "'>0</span>/<span style='margin-left:0px' id='all_file_tcnt" + sc_suffix + "'>0</span>)</span></h2>";
		//	html += "	<button class='ico btn-right-more'>더보기</button>";
			html += "	<ul id='all_file_list" + sc_suffix + "'>";
			html += "	</ul>";
			html += "	<ul id='all_file_search_result" + sc_suffix + "' style='display:none;'>";
			html += "	</ul>";
			html += "</div>";			
		}

		html += "</div>";
		
		
		
		$("#ext_body" + sc_suffix).html(html);
		$("#file_search_query" + sc_suffix).attr("placeholder",gap.lang.filenamesearch);
		$("#file_search_query" + sc_suffix).keypress(function(e) { 
		    if (e.keyCode == 13){
		    	$("#all_attach_search_btn" + sc_suffix).click();
		    }    
		});
		
		$("#file_search_back" + sc_suffix).on("click", function(){
			last_search_query = "";
			$("#file_search_query" + sc_suffix).val("");
			$("#file_search_back" + sc_suffix).hide();
			$("#all_attach_input" + sc_suffix).removeClass("result");

			$("#all_image_ccnt" + sc_suffix).text(eval('gRM.image' + sc_suffix + '_cur_cnt'));
			$("#all_image_tcnt" + sc_suffix).text(eval('gRM.image' + sc_suffix + '_total_cnt'));
			$("#all_image_list" + sc_suffix).show();
			$("#all_image_search_result" + sc_suffix).empty();
			$("#all_image_search_result" + sc_suffix).hide();
			
			$("#all_file_ccnt" + sc_suffix).text(eval('gRM.file' + sc_suffix + '_cur_cnt'));
			$("#all_file_tcnt" + sc_suffix).text(eval('gRM.file' + sc_suffix + '_total_cnt'));
			$("#all_file_list" + sc_suffix).show();
			$("#all_file_search_result" + sc_suffix).empty();
			$("#all_file_search_result" + sc_suffix).hide();
			
			$("#filter_icon ul li button").each(function(idx){
				$(this).removeClass("on")
			});
			if ($("#file_detail_filter").hasClass("on")){
				$("#file_detail_filter").removeClass("on");
			}
	//		$("#filter_icon").hide();
			
			if (sc_suffix != ""){
				gRM.file_more_search_cur_cnt = 0;
				gRM.file_more_search_total_cnt = 0;
				gRM.image_more_search_cur_cnt = 0;
				gRM.image_more_search_total_cnt = 0;
			}
		})
		
		$("#all_attach_search_btn" + sc_suffix).on("click", function(){
			var query = $("#file_search_query" + sc_suffix).val();
			if (query == 0){
				gap.gAlert(gap.lang.input_search_query);
				$("#file_search_query" + sc_suffix).val("");
				$("#file_search_query" + sc_suffix).focus();
				return false;
			}
			
			last_search_query = query;		// 마지막 검색어 (검색 후 더보기 시 사용 - 검색어 입력란에 있는 검색어를 사용자가 삭제하고 '더보기' 클릭 시  마지막에 검색한 검색어로 호출)
			
			var select_file_type = [];
			var ext_array = [];
			
			$("#filter_icon ul li button").each(function(idx){
				if ($(this).hasClass("on")){
					select_file_type.push($(this).text());
				}
			});
						
			for (var i = 0; i < select_file_type.length; i++){
				if (select_file_type[i] == "ppt"){
					ext_array.push("ppt");
					ext_array.push("pptx");
				}else if (select_file_type[i] == "word"){
					ext_array.push("doc");
					ext_array.push("docx");
				}else if (select_file_type[i] == "excel"){
					ext_array.push("xls");
					ext_array.push("xlsx");
				}else if (select_file_type[i] == "pdf"){
					ext_array.push("pdf");
				}else if (select_file_type[i] == "img"){
					ext_array.push("jpg");
					ext_array.push("jpeg");
					ext_array.push("png");
					ext_array.push("gif");
				}else if (select_file_type[i] == "video"){
					ext_array.push("avi");
					ext_array.push("mpg");
					ext_array.push("mp4");
					ext_array.push("mov");
				}
				
			}
			/*
			 * param : 대화방 ID, 검색대상 파일 종류, 확장자 배열값, 검색어, 번환 검색 갯수, 반환 검색 갯수 시작점
			 */
			if (disp_kind == "all"){
				_wsocket.chat_room_file_search_right_frame((ext_array == "" ? "" : "ext_filter"), [5], ext_array, query, 9, 0);
				_wsocket.chat_room_file_search_right_frame((ext_array == "" ? "" : "ext_filter"), [6], ext_array, query, 9, 0);
				
			}else if (disp_kind == "image"){
				_wsocket.chat_room_file_search_right_frame("", [6], ext_array, query, (sc_suffix == "" ? 9 : 40), 0);		
				
			}else if (disp_kind == "file"){
				_wsocket.chat_room_file_search_right_frame("", [5], ext_array, query, (sc_suffix == "" ? 9 : 40), 0);
			}

		});
		
		$("#file_detail_filter").off();
		$("#file_detail_filter").on("click", function(){
			if ($(this).hasClass("on")){
				$(this).removeClass("on");
				$("#filter_icon").fadeOut();			
			}else{
				$(this).addClass("on");
				$("#filter_icon").fadeIn();			
			}		
		});
		
		$("#filter_icon ul li button").off();
		$("#filter_icon ul li button").on("click", function(){
			if ($(this).hasClass("on")){
				$(this).removeClass("on");
			}else{
				$(this).addClass("on");
			}

			var query = $("#file_search_query" + sc_suffix).val();
			last_search_query = query;		// 마지막 검색어 (검색 후 더보기 시 사용 - 검색어 입력란에 있는 검색어를 사용자가 삭제하고 '더보기' 클릭 시  마지막에 검색한 검색어로 호출)
			
			var select_file_type = [];
			var ext_array = [];
			
			$("#filter_icon ul li button").each(function(idx){
				if ($(this).hasClass("on")){
					select_file_type.push($(this).text());
				}
			});
						
			for (var i = 0; i < select_file_type.length; i++){
				if (select_file_type[i] == "ppt"){
					ext_array.push("ppt");
					ext_array.push("pptx");
				}else if (select_file_type[i] == "word"){
					ext_array.push("doc");
					ext_array.push("docx");
				}else if (select_file_type[i] == "excel"){
					ext_array.push("xls");
					ext_array.push("xlsx");
				}else if (select_file_type[i] == "pdf"){
					ext_array.push("pdf");
				}else if (select_file_type[i] == "img"){
					ext_array.push("jpg");
					ext_array.push("png");
					ext_array.push("gif");
				}else if (select_file_type[i] == "video"){
					ext_array.push("avi");
					ext_array.push("mpg");
					ext_array.push("mp4");
					ext_array.push("mov");
				}
				
			}
			/*
			 * param : 대화방 ID, 검색대상 파일 종류, 확장자 배열값, 검색어, 번환 검색 갯수, 반환 검색 갯수 시작점
			 */
			if (disp_kind == "all"){
				_wsocket.chat_room_file_search_right_frame("ext_filter", [5], ext_array, query, 9, 0);
				_wsocket.chat_room_file_search_right_frame("ext_filter", [6], ext_array, query, 9, 0);
				
			}else if (disp_kind == "image"){
				_wsocket.chat_room_file_search_right_frame("ext_filter", [6], ext_array, query, 9, 0);	

			}else if (disp_kind == "file"){
				_wsocket.chat_room_file_search_right_frame("ext_filter", [5], ext_array, query, 9, 0);
			}
		});
		
		$("#file_layer_close" + sc_suffix).on("click", function(){
			gRM.layer_close();
			
			gBody.rigth_btn_change_empty();
			$("#ext_body" + sc_suffix).empty();
			$("#ext_body" + sc_suffix).fadeOut();
		});
		
		$("#right_layer_ext_wrap" + sc_suffix).mCustomScrollbar("destroy");
		$("#right_layer_ext_wrap" + sc_suffix).mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable:false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : false,
		//	setTop : ($("#chat_msg").height() + 100) + "px"
			callbacks:{
				//	onTotalScrollBack: function(){addContent2(this)},
					onTotalScrollBackOffset: 100,
					onTotalScroll:function(){gRM.add_attach_list(last_search_query, disp_kind)},
					onTotalScrollOffset:100,
					alwaysTriggerOffsets:true
			}
		});
		
		
		/*
		 * param : 대화방 ID, 검색대상 파일 종류, 확장자 배열값, 검색어, 번환 검색 갯수, 반환 검색 갯수 시작점
		 */
		if (disp_kind == "all"){
			_wsocket.chat_room_file_search_right_frame("", [6], "", "", 9, 0);		//photo
			_wsocket.chat_room_file_search_right_frame("", [5], "", "", 9, 0);		//file		
			
		}else if (disp_kind == "image"){
			_wsocket.chat_room_file_search_right_frame("", [6], "", search_query, 40, 0);		//photo	
			
		}else if (disp_kind == "file"){
			_wsocket.chat_room_file_search_right_frame("", [5], "", search_query, 40, 0);		//file		
		}		
		
		
	},
	
	"more_attach_list" : function(disp_kind, last_search_query){
		if (disp_kind == "image"){
			gRM.image_more_cur_cnt = 0;				//파일 갯수 초기화
			gRM.image_more_total_cnt = 0;			//파일 갯수 초기화
			gRM.image_more_search_cur_cnt = 0;		//파일 갯수 초기화
			gRM.image_more_search_total_cnt = 0;	//파일 갯수 초기화
			
		}else if (disp_kind == "file"){
			gRM.file_more_cur_cnt = 0;				//파일 갯수 초기화
			gRM.file_more_total_cnt = 0;			//파일 갯수 초기화
			gRM.file_more_search_cur_cnt = 0;		//파일 갯수 초기화
			gRM.file_more_search_total_cnt = 0;		//파일 갯수 초기화						
		}
		
		gRM.draw_all_attach(disp_kind, last_search_query);
	},
	
	"add_attach_list" : function(_query, disp_kind){

		var cur_cnt = 0;
		var total_cnt = 0;
		var sc_suffix = ($("#ext_body_more").css("display") == "none" ? "" : "_more");
		
		if (disp_kind == "image"){
			var is_search = ($("#all_image_list" + sc_suffix).css("display") == "none" ? true : false);
			
			if (is_search){
				cur_cnt = gRM.image_more_search_cur_cnt;
				total_cnt = gRM.image_more_search_total_cnt;
			}else{
				cur_cnt = gRM.image_more_cur_cnt;
				total_cnt = gRM.image_more_total_cnt;
			}
			
		}else if (disp_kind == "file"){
			var is_search = ($("#all_file_list" + sc_suffix).css("display") == "none" ? true : false);
			
			if (is_search){
				cur_cnt = gRM.file_more_search_cur_cnt;
				total_cnt = gRM.file_more_search_total_cnt;
			}else{
				cur_cnt = gRM.file_more_cur_cnt;
				total_cnt = gRM.file_more_total_cnt;
			}
		}
		
		if (total_cnt > cur_cnt){
			if (disp_kind == "image"){
				_wsocket.chat_room_file_search_right_frame("", [6], "", _query, 40, cur_cnt);		//photo	
				
			}else if (disp_kind == "file"){
				_wsocket.chat_room_file_search_right_frame("", [5], "", _query, 40, cur_cnt);		//file		
			}		
		}
	},	
	
	"draw_all_attach_search_result" : function(obj, search_kind, attach_search, ext_search){
		var is_image = (search_kind == "image" ? true : false);
		var sc_suffix = ($("#ext_body_more").css("display") == "none" ? "" : "_more");
		var search_query = $("#file_search_query" + sc_suffix).val();
		var lists = (typeof(obj) != "undefined" ? obj.rt : []);
		
	
	
		if (attach_search){
			$("#all_attach_input" + sc_suffix).addClass("result");
			$("#file_search_back" + sc_suffix).show();
		}		
		if (lists && lists.length == 0){
			if (search_kind == "image"){
				$("#all_image_ccnt" + sc_suffix).text("0");
				$("#all_image_tcnt" + sc_suffix).text("0");			
				$("#all_image_list" + sc_suffix).hide();
				$("#all_image_search_result" + sc_suffix).show();
				$("#all_image_search_result" + sc_suffix).html("");				
			}

			if (search_kind == "file"){
				$("#all_file_ccnt" + sc_suffix).text("0");
				$("#all_file_tcnt" + sc_suffix).text("0");
				$("#all_file_list" + sc_suffix).hide();
				$("#all_file_search_result" + sc_suffix).show();
				$("#all_file_search_result" + sc_suffix).html("");	
			}
			return false;
		}

		var _html = "";
		var mul_imgs = [];
		
		for (var i = 0 ; i < lists.length; i++){
			var info = lists[i];
			var fserver = gap.search_fileserver(info.nid);
			
			var sq = lists[i].sq;
			if (lists[i].grp){
				sq = sq + "_0";	
				mul_imgs.push(lists[i]);			
			}
			var isMulti = false;
			if ((typeof(info.grp) != "undefined")  && (info.grp.length > 0)){
				info = info.grp[0];
				info.ty = lists[i].ty;
				isMulti = true;
			}
			
			if (info.ty == "6"){
				var preview_img = fserver + info.sf + "/thumbnail/" + info.sn;
				var downloadpath = fserver + "/filedown" + info.sf + "/" + info.sn;

				
				_html += "			<li class='chat_img'>";
				_html += "				<span style='border:1px solid #DDDAE2'>";
				_html += "					<img style='width:75px; ' data1=\"" + info.nm + "\" data2='" + downloadpath + "' data3='" + info.sz + "' data4='"+sq+"' src='" + preview_img + "' onerror='this.src=\"../resource/images/thm_img_s.png\"' alt='' />";
				
				if (isMulti){
					_html += "<div class='submulti' style='position:absolute; bottom:5px; right:5px; width:20px; height:20px' id='multi_"+sq+"'>";
					_html += "<img src='common/img/multi_image.png'>";
					_html += "</div>";
				}
				
				_html += "				</span>";
				_html += "			</li>";				
				
			}else{
				
				var item = lists[i];
				var dis_date = gap.change_date_default(gap.search_today_only3(item.dt));
				var ext = gap.file_icon_check(info.nm);
				var downloadpath = fserver + "/filedown" + info.sf + "/" + info.sn + "/" + encodeURIComponent(info.nm);
				
				_html += "		<li class='chat_file' title=\"" + info.nm + "\">";
				_html += "			<span class='ico ico-file " + ext + "' data1=\"" + info.nm + "\" data2='" + downloadpath + "' data3='" + info.sz + "'></span>" + info.nm;
				_html += "			<br><span>"+dis_date+" | "+gap.file_size_setting(info.sz)+"</span>"
				_html += "		</li>";	
			}
		}

		if (is_image){
			if (attach_search){
				if (sc_suffix == ""){
					$("#all_image_ccnt").text(lists.length);
					$("#all_image_tcnt").text(obj.cnt);
					
				}else{
					if (gRM.image_more_search_cur_cnt == 0){
						gRM.image_more_search_total_cnt = obj.cnt;	
					}
					gRM.image_more_search_cur_cnt += lists.length;
					
					$("#all_image_ccnt" + sc_suffix).text(gRM.image_more_search_cur_cnt);
					$("#all_image_tcnt" + sc_suffix).text(gRM.image_more_search_total_cnt);					
				}
				
				$("#all_image_list" + sc_suffix).hide();
				$("#all_image_search_result" + sc_suffix).show();
				if (ext_search){
					$("#all_image_search_result" + sc_suffix).html(_html);
				}else{
					$("#all_image_search_result" + sc_suffix).append(_html);
				}

			}else{
				if (sc_suffix == ""){
					gRM.image_cur_cnt = lists.length;
					gRM.image_total_cnt = obj.cnt;
					
				}else{
					if (gRM.image_more_cur_cnt == 0){
						gRM.image_more_total_cnt = obj.cnt;	
					}
					gRM.image_more_cur_cnt += lists.length;
				}
				$("#all_image_ccnt" + sc_suffix).text(sc_suffix == "" ? gRM.image_cur_cnt : gRM.image_more_cur_cnt);
				$("#all_image_tcnt" + sc_suffix).text(sc_suffix == "" ? gRM.image_total_cnt : gRM.image_more_total_cnt);
				$("#all_image_list" + sc_suffix).append(_html);					
			}

		}else{
			if (attach_search){			
				if (sc_suffix == ""){
					$("#all_file_ccnt" + sc_suffix).text(lists.length);
					$("#all_file_tcnt" + sc_suffix).text(obj.cnt);
					
				}else{
					if (gRM.file_more_search_cur_cnt == 0){
						gRM.file_more_search_total_cnt = obj.cnt;	
					}
					gRM.file_more_search_cur_cnt += lists.length;
					
					$("#all_file_ccnt" + sc_suffix).text(gRM.file_more_search_cur_cnt);
					$("#all_file_tcnt" + sc_suffix).text(gRM.file_more_search_total_cnt);					
				}				
				
				$("#all_file_list" + sc_suffix).hide();
				$("#all_file_search_result" + sc_suffix).show();
				if (ext_search){
					$("#all_file_search_result" + sc_suffix).html(_html);
				}else{
					$("#all_file_search_result" + sc_suffix).append(_html);
				}
				
			}else{
				if (sc_suffix == ""){
					gRM.file_cur_cnt = lists.length;
					gRM.file_total_cnt = obj.cnt;
					
				}else{
					if (gRM.file_more_cur_cnt == 0){
						gRM.file_more_total_cnt = obj.cnt;	
					}
					gRM.file_more_cur_cnt += lists.length;					
				}
				$("#all_file_ccnt" + sc_suffix).text(sc_suffix == "" ? gRM.file_cur_cnt : gRM.file_more_cur_cnt);
				$("#all_file_tcnt" + sc_suffix).text(sc_suffix == "" ? gRM.file_total_cnt : gRM.file_more_total_cnt);
				$("#all_file_list" + sc_suffix).append(_html);
			}
		}
		
		$(".share-photo span").on("click", function(){
			var fname = $(this).find("img").attr("data1");
			var url = $(this).children().attr("data2") + "/" + encodeURIComponent(fname);
			
			gap.image_gallery = new Array();  //변수 초기화 해준다.
			gap.image_gallery_current = 1;
			
		//	gap.show_image(url, fname);
			var sq = $(this).find("img").attr("data4");
			gBody.chat_gallery_show(sq);

		});
		
		$("#share-file-right" + sc_suffix + " .chat_file").off();
		$("#share-file-right" + sc_suffix + " .chat_file").on("click", function(){
			
			var url = $(this).find("span").attr("data2");
			gap.file_download(url);
		});
		
		$(".group-img ul li").on("mouseover", function(){
			$(this).css("cursor","pointer");
			$(this).draggable({
				 revert: "invalid",
				 stack: ".draggable",     //가장위에 설정해 준다.
				 opacity: 1,
				 scroll: false,
			//	 helper: 'clone',
				 cursorAt: { top: 5, left:5},
				 helper: function (e) { 
					//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.
					//$('table').css({ 'position': 'relative' });
					return $(this).clone().appendTo("#top_content").css("zIndex",3000).show();
			     },			 
			     cursor: 'move',			 
				 start : function(event, ui){
					$(this).draggable("option", "revert", false);
					
					var html = "";
					var iorg = ui.helper.find("img");
					if (ui.helper.find("img").attr("src") == "../resource/images/thm_img_s.png"){						
						return false;
					}
					html += "<img style='width:60px' data1=" + iorg.attr("data1") + " data2=" + iorg.attr("data2") + " data3=" + iorg.attr("data3") + " src=" + iorg.attr("src") + " onerror='this.src=\"../resource/images/thm_img_s.png\"'>";
					ui.helper.html(html);;
				},
				stop : function(event, ui){						
				}
			});
		});		

		$("#share-file-right" + sc_suffix + " ul li").on("mouseover", function(){
			$(this).css("cursor","pointer");
			$(this).draggable({
				revert: "invalid",
				stack: ".draggable",     //가장위에 설정해 준다.
				opacity: 1,
				scroll: false,
			//	helper: 'clone',
				cursorAt: { top: 5, left:5},
				helper: function (e) { 
					//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.
					return $(this).clone().appendTo("#top_content").css("zIndex",3000).show();
				},			 
				cursor: 'move',			 		     
				start : function(event, ui){
					$(this).draggable("option", "revert", false);
					
					var html = "";
					html += "<div class='balloon drag' style='padding:10px; white-space:nowrap;  '>";
					html += ui.helper.get(0).innerHTML;
					html += "</div>";
					ui.helper.html(html);
				},
				stop : function(event, ui){						
				}
			});
		});
		
		$("#share-file-right" + sc_suffix + " ul li").on("mouseout", function(){
			$(this).draggable( "destroy" )
		});
	},	
	
	"draw_all_link" : function(obj){

		gap.show_content("ext");
		gBody.rigth_btn_change_empty();
		gBody.rigth_btn_change("link");	
		
		var search_result = false;
		var last_link_cur_cnt = 0;
		var last_link_total_cnt = 0;
		var last_search_query = "";
		
		var html = "";
		
		html += "<div class='link-list' style='height:100%'>";
		html += "	<div class='link-list-header'>"
		html += "		<h2>" + gap.lang.link
		html += "			<span>";
		html += "				(<span style='margin-left:0px' id='link_ccnt'>0</span>/<span style='margin-left:0px' id='link_tcnt'>0</span>)";
		html += "			</span>";
		html += "		</h2>";
		html += "		<button class='ico btn-right-close' id='link_layer_close'>닫기</button>";
		html += " 		<div class='input-field' id='all_link_input'> ";
		html += "		 	<input type='text' id='link_search_query' class='formInput' />";
		html += "		 	<span class='bar'></span>";
		html += "			<button class='btn-file-back ico' id='link_search_back' style='display:none;'>뒤로가기</button>";
		html += " 		</div>";
		html += " 		<button class='btn-file-search ico' id='link_search_btn'>검색</button>";
		html += "	</div>"
		
		html += "	<div id='right_layer_ext_wrap' style='height: calc(100% - 90px); overflow-y:auto'>";
		html += "		<div id='all_link_list' style='padding-right:20px;'></div>";
		html += "		<div id='all_link_search_result' style='display:none;'></div>";
		html += "	</div>";
		html += "</div>";
		
		$("#ext_body").html(html);
		
		$("#link_layer_close").on("click", function(){
			gRM.layer_close();
			
			gBody.rigth_btn_change_empty();
			$("#ext_body").empty();
			$("#ext_body").fadeOut();
		});
		
		
		$("#link_search_query").attr("placeholder",gap.lang.input_search_query);
		$("#link_search_query").keypress(function(e) { 
		    if (e.keyCode == 13){
		    	$("#link_search_btn").click();
		    }    
		});
		
		$("#link_search_back").on("click", function(){
			gRM.link_cur_cnt = last_link_cur_cnt;
			gRM.link_total_cnt = last_link_total_cnt;
			$("#link_ccnt").text(gRM.link_cur_cnt);
			$("#link_tcnt").text(gRM.link_total_cnt);
			$("#link_search_query").val("");
			$("#link_search_back").hide();
			$("#all_link_input").removeClass("result");
			$("#all_link_list").show();
			$("#all_link_search_result").empty();
			$("#all_link_search_result").hide();
			last_search_query = "";
			search_result = false;
		})
		
		$("#link_search_btn").on("click", function(){
			var query = $("#link_search_query").val();
			if (query == 0){
				gap.gAlert(gap.lang.input_search_query);
				$("#link_search_query").val("");
				$("#link_search_query").focus();
				return false;
			}
			if (!search_result){
				last_link_cur_cnt = gRM.link_cur_cnt;
				last_link_total_cnt = gRM.link_total_cnt;				
			}
			search_result = true;
			gRM.link_cur_cnt = 0;
			gRM.link_total_cnt = 0;
			last_search_query = query;
			/*
			 * param : 검색어, 반환 검색 갯수 시작점
			 */
			_wsocket.chat_room_link_list_search_right_frame(query, gRM.link_cur_cnt);
		});		
		
		
		$("#right_layer_ext_wrap").mCustomScrollbar("destroy");
		$("#right_layer_ext_wrap").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable:false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			mouseWheel:{ preventDefault: false },
			advanced:{
				updateOnContentResize: true
			},
			autoHideScrollbar : false,
		//	setTop : ($("#chat_msg").height() + 100) + "px"
			callbacks:{
				//	onTotalScrollBack: function(){addContent2(this)},
					onTotalScrollBackOffset: 100,
					onTotalScroll:function(){gRM.add_link_list(last_search_query, gRM.link_cur_cnt)},
					onTotalScrollOffset:100,
					alwaysTriggerOffsets:true
			}
		});
		
		/*
		 * param : 검색어, 반환 검색 갯수 시작점
		 */
		_wsocket.chat_room_link_list_search_right_frame("", gRM.link_cur_cnt);		
	},
	
	"add_link_list" : function(_query){
		if (gRM.link_total_cnt > gRM.link_cur_cnt){
			_wsocket.chat_room_link_list_search_right_frame(_query, gRM.link_cur_cnt);
		}
	},
	
	"draw_all_link_search_result" : function(obj, search_result){
		var lists = (typeof(obj) != "undefined" ? obj.rt : []);
		
		if (search_result){
			$("#all_link_input").addClass("result");
			$("#link_search_back").show();
		}	
		
		if (lists && lists.length == 0){
			$("#link_ccnt").text("0");
			$("#link_tcnt").text("0");			
			$("#all_link_list").hide();
			$("#all_link_search_result").show();
			$("#all_link_search_result").html("");				
			return false;
		}
		
		if (search_result && gRM.link_cur_cnt == 0){
			//최초 검색인 경우 empty 하고 시작함
			$("#all_link_search_result").empty();
		}
		
		for (var i = 0 ; i < lists.length; i++){
			var info = lists[i];
			
			var localDate = String(info.dt).substring(0,8);
			var dispDate = gap.change_date_default(gap.search_today_only3(localDate));
			var dispTime = gap.change_date_localTime_only_time(String(info.dt));
			var dispName = (gRM.user_el == info.el ? info.nm : info.enm);
			
			var _html = "";
			var el_cnt = $("#link_" + (search_result ? "search_": "") + localDate).length;
			
			if (el_cnt == 0){
				var wrap_html = "";
				
				if (search_result){
					wrap_html += "			<div class='link-group' id='link_group_search_" + localDate + "'>";
					wrap_html += "			</div>";
					$("#all_link_search_result").append(wrap_html);		
					
					var ymd_html = "				<div class='date' id='link_search_" + localDate + "'><span>" + dispDate + "</span></div>";
					$("#link_group_search_" + localDate).append(ymd_html);	
					
				}else{
					wrap_html += "			<div class='link-group' id='link_group_" + localDate + "'>";
					wrap_html += "			</div>";
					$("#all_link_list").append(wrap_html);
					
					var ymd_html = "				<div class='date' id='link_" + localDate + "'><span>" + dispDate + "</span></div>";
					$("#link_group_" + localDate).append(ymd_html);				
				}
			}
			
			_html += "				<a href='" + info.lnk + "' target='_blank'>";

			if (typeof(info.img) != "undefined"){
				_html += "					<div class='link-thumb'><img alt='' src='" + info.img + "' onerror='this.src=\"img/thm_link.png\"'></div>";
				_html += "					<ul>";
				_html += "						<li class='link-title'>" + (typeof(info.tle) != "undefined" ? info.tle : "") + "</li>";
				_html += "						<li class='link-summary'>" + (typeof(info.desc) != "undefined" ? info.desc : "") + "</li>";
			//	_html += "						<li class='link-user'>" + gap.search_username(info.ky) + "<span class='time'>" + dispTime + "</span></li>";
				_html += "						<li class='link-user'>" + dispName + "<span class='time'>" + dispTime + "</span></li>";
				_html += "					</ul>";
				
			}else{
				_html += "					<div class='link-thumb'><img alt='' src='img/thm_link.png'></div>";
				_html += "					<ul>";
				_html += "						<li class='link-title'>" + info.lnk + "</li>";
			//	_html += "						<li class='link-user'>" + gap.search_username(info.ky) + "<span class='time'>" + dispTime + "</span></li>";
				_html += "						<li class='link-user'>" + dispName + "<span class='time'>" + dispTime + "</span></li>";
				_html += "					</ul>";			
			}
			_html += "				</a>";
			
			$("#link_group_" + (search_result ? "search_": "") + localDate).append(_html);
		}

		if (gRM.link_cur_cnt == 0){
			gRM.link_total_cnt = obj.cnt;	
		}
		gRM.link_cur_cnt += lists.length;
		
		if (search_result){
			$("#link_ccnt").text(gRM.link_cur_cnt);
			$("#link_tcnt").text(gRM.link_total_cnt);				
			
			$("#all_link_list").hide();
			$("#all_link_search_result").show();
				
		}else{
			$("#link_ccnt").text(gRM.link_cur_cnt);
			$("#link_tcnt").text(gRM.link_total_cnt);
		}
	},	
	
	"show_channel_file_info" : function(fname){
		// Box 파일 상세 정보
		gRM.right_side_open_layer = "box";			
		gRM.box_layer_open();
	
		var html = "";
		html += '<div class="view-title">';
		html += '	<h2>' + fname + '</h2>';
		html += '	<button class="ico btn-right-close" id="channel_file_layer_close">닫기</button>';
		html += '	<button class="ico btn-view" id="fullsize_layout">크게보기</button>';
		html += '</div>';
		html += '<div class="slider">';
		html += '	<div class="thm-b"><img src="' + gap.channelserver + '/FilePreview.do?m5=ba67aa363f5125e83b77c2dc0772ea36.1985756&ty=1&bun=1" alt="" /></div>';
		html += '	<div class="thm-s">';
		html += '		<div class="thm-s-contents">';
		html += '			<ul style="width:610px">';
		html += '				<li><img src="' + gap.channelserver + '/FilePreview.do?m5=ba67aa363f5125e83b77c2dc0772ea36.1985756&ty=2&bun=1" alt="" /></li>';
		html += '				<li><img src="' + gap.channelserver + '/FilePreview.do?m5=ba67aa363f5125e83b77c2dc0772ea36.1985756&ty=2&bun=2" alt="" /></li>';
		html += '				<li class="active"><img src="' + gap.channelserver + '/FilePreview.do?m5=ba67aa363f5125e83b77c2dc0772ea36.1985756&ty=2&bun=3" alt="" /></li>';
		html += '				<li><img src="' + gap.channelserver + '/FilePreview.do?m5=ba67aa363f5125e83b77c2dc0772ea36.1985756&ty=2&bun=4" alt="" /></li>';
		html += '				<li><img src="' + gap.channelserver + '/FilePreview.do?m5=ba67aa363f5125e83b77c2dc0772ea36.1985756&ty=2&bun=5" alt="" /></li>';
		html += '			</ul>';
		html += '		</div>';
		html += '		<button class="slider-prev">이전</button>';
		html += '		<button class="slider-next">다음</button>';
		html += '	</div>';
		html += '</div>';
		$("#ext_body").html(html);
		
		$("#channel_file_layer_close").on("click", function(){
			gRM.box_layer_close();
			
			
		});
	},
	
	"show_convert_file_info" : function(_fname, _md5, _count){
		gap.hide_loading();
		// 드라이브/체날 파일 상세 정보
		gRM.right_side_open_layer = "box";			
		gRM.box_layer_open();
		
		var html = "";
		html += '<div class="view-title">';
		html += '	<h2>' + _fname + '</h2>';
		html += '	<button class="ico btn-right-close" id="channel_file_layer_close">닫기</button>';
		html += '	<button class="ico btn-view" id="fullsize_layout">크게보기</button>';
		html += '</div>';
		html += '<div class="slider">';
		html += '	<div class="thm-b" id="thm_big" style="min-height:550px;"><img src="' + gap.channelserver + '/FilePreview.do?m5=' + _md5 + '&ty=1&bun=1" alt="" /></div>';
		html += '	<div class="thm-s">';
		html += '		<div class="thm-s-contents">';
		html += '			<ul id="thm_small" class="owl-carousel">';
		html += '			</ul>';
		html += '		</div>';
		html += '		<button class="slider-prev" id="slider_prev">이전</button>';
		html += '		<button class="slider-next" id="slider_next">다음</button>';
		html += '	</div>';
		html += '</div>';
		$("#ext_body").html(html);
		
		
		
		for (var i = 0; i < _count; i++){
			var _html = '<li' + (i == 0 ? ' class="active"' : '') + ' id="slide_thm_' + (i + 1) + '"><img src="' + gap.channelserver + '/FilePreview.do?m5=' + _md5 + '&ty=2&bun=' + (i + 1) + '" alt="" /></li>';
			$("#thm_small").append(_html);
			
			$("#slide_thm_" + (i + 1)).bind("click", (i + 1), function(event){
				
				//var he = $("#thm_big").height();
				//$("#thm_big").css("min-height", "550px");
				//$("#thm_big").css("height", he + "px");
				//$("#thm_big").css("overflow", "hidden");
				
				var url_html = '<img src="' + gap.channelserver + '/FilePreview.do?m5=' + _md5 + '&ty=1&bun=' + event.data + '" alt="" />';
				$("#thm_small li").removeClass("active");
				$("#slide_thm_" + event.data).addClass("active");
				$("#thm_big").hide();
				$("#thm_big").html(url_html).fadeIn(1000);
				
				event.preventDefault();
				event.stopPropagation();
			});
		}
		
		$('.owl-carousel').owlCarousel('destroy'); 
		var owl = $(".owl-carousel");
		owl.owlCarousel({
			loop:false,
			margin:5,
			navigation:false,
			dots:false,
			responsive:{
				0:{
					items:3,
					slideBy: 3
				},
				1150:{
					items:4,
					slideBy: 4
				},
				1350:{
					items:5,
					slideBy: 5
				},				
				1550:{
					items:6,
					slideBy: 6
				},				
				1700:{
					items:7,
					slideBy: 7
				}				
			}
		});

		$("#slider_prev").on("click", function(){
			 owl.trigger('prev.owl.carousel', [300]);
		});
		$("#slider_next").on("click", function(){
			owl.trigger('next.owl.carousel');
		});
		
		$("#channel_file_layer_close").on("click", function(){
			gRM.box_layer_close();
			
			$(".message-file").removeClass("line1");
		});
		
		$("#fullsize_layout").on("click", function(e){
			gRM.show_file_fullscreen(_fname, _md5, _count);
		});


		$("#thm_big").css("height", "calc(100% - 81px)")
	
	},	
	
	"show_convert_search_file_info" : function(_fname, _md5, _count){
		$("#ext_body_search").removeClass("channel view-info chat-area");
		$("#ext_body_search").addClass("view-info");
		$("#ext_body_search").css("padding-right", "30px");
		$("#ext_body_search").css("padding-top", "");
		gap.hide_loading();

		var html = "";
		var slider_html = "";
		var no_result_html = "";
		var res_bun_list = "";
		
		html += '<div class="view-title">';
		html += '	<h2>' + _fname + '</h2>';
		html += '	<button class="ico btn-right-close" id="search_file_layer_close">닫기</button>';
		html += '	<button class="ico btn-view" id="fullsize_layout">크게보기</button>';
		html += '</div>';
		html += '<div class="slider">';
		html += '	<div class="view-info-tab">';
		html += '		<ul id="ts_img_result_tabs" class="tabs">';
		html += '			<li class="tab" id="disp_all"><a href="" class="active">전체보기</a></li>';
		html += '			<li class="tab" id="disp_result"><a href="#">검색결과만 보기</a></li>';
		html += '		</ul>';
		html += '	</div>';
		html += '	<div id="ts_content" style="height:100%;">';
		
		slider_html += '	<div class="thm-b" id="thm_big" style="min-height:550px;"><img src="' + gap.channelserver + '/FilePreview.do?m5=' + _md5 + '&ty=1&bun=1" alt="" /></div>';
		slider_html += '	<div class="thm-s">';
		slider_html += '		<div class="thm-s-contents">';
		slider_html += '			<ul id="thm_small" class="owl-carousel">';
		slider_html += '			</ul>';
		slider_html += '		</div>';
		slider_html += '		<button class="slider-prev" id="slider_prev">이전</button>';
		slider_html += '		<button class="slider-next" id="slider_next">다음</button>';
		slider_html += '	</div>';
		
		no_result_html += '	<div class="msg-search-result">';
		no_result_html += '		<img src="' + cdbpath + '/img/search.png" alt="">' + gap.lang.searchnoresult;
		no_result_html += '	</div>';
		
		html += slider_html;
		html += '	</div>';
		html += '</div>';
		
		$("#ext_body_search").html(html);
		$('.view-info-tab .tabs').tabs();
		
		for (var i = 0; i < _count; i++){
			var _html = '<li' + (i == 0 ? ' class="active"' : '') + ' id="slide_thm_' + (i + 1) + '"><img src="' + gap.channelserver + '/FilePreview.do?m5=' + _md5 + '&ty=2&bun=' + (i + 1) + '" alt="" /></li>';
			$("#thm_small").append(_html);
		}

		gRM.event_init_owl_carousel(_md5);
		
		
		$("#disp_all").on("click", function(){
			$("#fullsize_layout").show();
			$("#ts_content").html(slider_html);
			$("#thm_small").empty();
			
			for (var i = 0; i < _count; i++){
				var _html = '<li' + (i == 0 ? ' class="active"' : '') + ' id="slide_thm_' + (i + 1) + '"><img src="' + gap.channelserver + '/FilePreview.do?m5=' + _md5 + '&ty=2&bun=' + (i + 1) + '" alt="" /></li>';
				$("#thm_small").append(_html);
			}
			
			var thm_big_html = '<img src="' + gap.channelserver + '/FilePreview.do?m5=' + _md5 + '&ty=1&bun=1">';
			$("#thm_big").html(thm_big_html);
			$("#thm_big").css("height", "calc(100% - 121px)");

			gRM.event_init_owl_carousel(_md5);
			
		});

		$("#disp_result").on("click", function(){
			var surl = gap.channelserver + "/msearch_sub.km";
			var postData = JSON.stringify({
					"q_str" : gBody2.ts_query.toLowerCase(),
					"md5" : _md5
				});			

			$.ajax({
				type : "POST",
				url : surl,
				dataType : "json",
				data : postData,
				success : function(res){
					if (res.result == "OK"){
						res_bun_list = new Array();
						var _result = res.data.hits.hits;
						
						if (_result.length == 0){
							$("#fullsize_layout").hide();
							$("#ts_content").html(no_result_html);
							return false;
							
						}else{
							$("#ts_content").html(slider_html);
							$("#thm_small").empty();
						}
						
						for (var k = 0; k < _result.length; k++){
							res_bun_list.push(_result[k]._source.bun.toString());
						}
						
						for (var i = 0; i < res_bun_list.length; i++){
							var _html = '<li' + (i == 0 ? ' class="active"' : '') + ' id="slide_thm_' + res_bun_list[i] + '"><img src="' + gap.channelserver + '/FilePreview.do?m5=' + _md5 + '&ty=2&bun=' + res_bun_list[i] + '" alt="" /></li>';
							$("#thm_small").append(_html);
						}
						
						var thm_big_html = '<img src="' + gap.channelserver + '/FilePreview.do?m5=' + _md5 + '&ty=1&bun=' + res_bun_list[0] + '">';
						$("#thm_big").html(thm_big_html);
						$("#thm_big").css("height", "calc(100% - 121px)");
						
						gRM.event_init_owl_carousel(_md5);

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
		

		$("#search_file_layer_close").off();
		$("#search_file_layer_close").on("click", function(){
			if ($("#ext_body_search").attr("class") == "right-area view-info"){
				$("#ext_body_search").removeClass("view-info");
				$("#ext_body_search").addClass("channel view-info chat-area");
			}			
			gBody2.draw_empty_search_content();
		});
		
		$("#fullsize_layout").off();
		$("#fullsize_layout").on("click", function(e){
			var selected_tab = ""
			$("#ts_img_result_tabs li a").each(function(idx, item){
				if ($(item).hasClass("active")){
					selected_tab = $(item).parent().attr("id")
				}
			});
			
			if (selected_tab == "disp_all"){
				gRM.show_file_fullscreen(_fname, _md5, _count);
				
			}else if (selected_tab == "disp_result"){
				gRM.show_file_fullscreen(_fname, _md5, res_bun_list);
			}
		});

		$("#thm_big").css("height", "calc(100% - 121px)");
	},
	
	"event_init_owl_carousel" : function(_md5){
		$('.owl-carousel').owlCarousel('destroy'); 
		var owl = $(".owl-carousel");
		owl.owlCarousel({
			loop:false,
			margin:5,
			navigation:false,
			dots:false,
			responsive:{
				0:{
					items:3,
					slideBy: 3
				},
				1150:{
					items:4,
					slideBy: 4
				},
				1350:{
					items:5,
					slideBy: 5
				},				
				1550:{
					items:6,
					slideBy: 6
				},				
				1700:{
					items:7,
					slideBy: 7
				}				
			}
		});
		
		$("#thm_small li").off();
		$("#thm_small li").on("click", function(){
			var _select_id = $(this).attr("id");
			var _bun = _select_id.replace("slide_thm_", "");
			var url_html = '<img src="' + gap.channelserver + '/FilePreview.do?m5=' + _md5 + '&ty=1&bun=' + _bun + '" alt="" />';
			
			$("#thm_small li").removeClass("active");
			$("#slide_thm_" + _bun).addClass("active");
			$("#thm_big").hide();
			$("#thm_big").html(url_html).fadeIn(1000);
			
			event.preventDefault();
			event.stopPropagation();
		});
		
		$("#slider_prev").off();
		$("#slider_prev").on("click", function(){
			 owl.trigger('prev.owl.carousel', [300]);
		});
		
		$("#slider_next").off();
		$("#slider_next").on("click", function(){
			owl.trigger('next.owl.carousel');
		});		
	},
	
	"show_file_fullscreen" : function(_fname, _md5, _count){
		var is_array = $.isArray(_count);
		var html = "";
		
		html += "<header>";
		html += "	<h1>"+_fname+"</h1>";
		html += "	<button class='ico btn-download'>다운로드</button>";
		html += "	<button class='ico btn-close'>닫기</button>";
		html += "</header>";
		html += "<div class='doc-view-contents'>";
		html += "	<div class='left-thm' style='height:calc(100% - 50px)'>";
	//	html += "	<div class='left-thm' style='height:600px'>";
		html += "		<ul>";
		
		if (is_array){
			// 낱장 검색 결과인 경우
			for (var i = 0; i < _count.length; i++){
				var _html = '<li' + (i == 0 ? ' class="on"' : '') + ' id="slide_thm_' + _count[i] + '"><img src="' + gap.channelserver + '/FilePreview.do?m5=' + _md5 + '&ty=2&bun=' + _count[i] + '" alt="" /></li>';
				html += _html;			
			}
			
		}else{
			// 일반의 경우
			for (var i = 0; i < _count; i++){
				var _html = '<li' + (i == 0 ? ' class="on"' : '') + ' id="slide_thm_' + (i + 1) + '"><img src="' + gap.channelserver + '/FilePreview.do?m5=' + _md5 + '&ty=2&bun=' + (i + 1) + '" alt="" /></li>';
				html += _html;			
			}			
		}

		html += "		</ul>";
		html += "	</div>";
		html += "	<div class='wrap-preview'>";
		html += '		<img id="xfull_img" style="max-width:65%" src="' + gap.channelserver + '/FilePreview.do?m5=' + _md5 + '&ty=1&bun=' + (is_array ? _count[0] : "1") + '" alt="" />';
		html += "	</div>";
		html += "<div>";
		
		var inx = gap.maxZindex();
		$("#fullscreen_file_info").css("z-index", parseInt(inx) + 1);
		
		$("#fullscreen_file_info").html(html);
		$("#fullscreen_file_info").show();
		
		
		$(".left-thm ul li").on("click", function(e){
			$(".left-thm ul li").each(function(inx){
				$(this).removeClass("on");
			});
			$(this).addClass("on");
						
			var bun = $(this).attr("id").replace("slide_thm_","");
			var img_src = $("#xfull_img").attr("src");
			var inx1 = img_src.indexOf("&bun=");
			var inx2 = img_src.length;
			var tmp = img_src.substring(inx1, inx2);
			var nurl = img_src.replace(tmp, "") + "&bun=" + bun;
			$("#xfull_img").attr("src", nurl);
			
			
			//var url_html = '<img src="' + gap.channelserver + '/FilePreview.do?m5=' + _md5 + '&ty=1&bun=' + event.data + '" alt="" />';
		});
		
		
		$(".left-thm").mCustomScrollbar({
			theme:"light",
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
			autoHideScrollbar : false
		});
		
		
		$("#fullscreen_file_info .btn-download").on("click", function(e){
			
			var data = gBody3.click_file_info;
			
			var downloadurl = gap.search_file_convert_server(data.fserver) + "/FDownload.do?id=" + data.id + "&md5=" + data.md5 + "&ty=" + data.ty;
			gap.file_download_normal(downloadurl, data.filename);
			return false;
		});
		
		$("#fullscreen_file_info .btn-close").on("click", function(e){			
			$("#fullscreen_file_info").fadeOut();
		});
	},
	
	
	
	"draw_memo_to_right_frame" : function(){
		gap.show_content("ext");			
		gBody.rigth_btn_change_empty();
		gBody.rigth_btn_change("memo");	

		var html = "";
		html += "<div class='memo' style='height:100%'>";
		html += "	<h2>"+gap.lang.noti+"</h2>";
		html += "	<button class='ico btn-right-close' id='memo_layer_close'>닫기</button>";
		html += "	<div class='memo-write-area'>";
		html += "		<div class='get-user'>";
		html += "			<div class='input-field'> ";
		html += "				<input type='text' class='formInput' id='search_noti_query' placeholder='" + gap.lang.input_sender_name + "' />";
		html += "				<span class='bar'></span>";
		html += "			</div>";
		html += "			<div id='wrap_memo_user_list'>";
		html += "				<ul class='get-user-list'></ul>";
		html += "			</div>";
		html += "		</div>";
		html += "		<div class='input-field comment' id='textarea_noti_memo'>";
		html += "			<textarea class='materialize-textarea textarea' id='search_noti_memo' placeholder='" + gap.lang.noti_express + "'></textarea>";
		html += "			<span class='bar'></span>";
		html += "		</div>";
		
		
		html += "		<h3 class='tit-attach'>" + gap.lang.attachment + "</h3>";
		html += " 		<button class='btn-attach' id='att_noti'><span>" + gap.lang.atting + "</span></button>";
		
		html += "		<div class='memo-attach' id='att_area'>";
//		html += "			<div class='empty'><button class='ico btn-memo-attach' id='att_noti'>첨부하기</button><p>"+gap.lang.niti_drag+"</p></div>";
		html += "			<div class='empty' id='noti_empty'><p>" + gap.lang.niti_drag + "</p></div>";
		html += "		</div>";
		
		html += "		<div class='progress-bar' id='total_upload_progress_wrap' style='display:none'><span class='progress-bar' id='total_upload_progress'></span></div>";

		html += "		<div class='checkbox'>";
		html += "			<label>";
		html += "				<input type='checkbox' id='reservation_memo_option' onchange='gRM.check_reserve();' autocomplete='off'><span class='checkbox-material'><span class='check'></span></span>"
		html += "				<span id='reserve_txt'>" + gap.lang.reserve_noti + "</span>";
		html += "			</label>";
		html += "		</div>";
		html += "		<div id='reservation_select_date' class='set-date' style='display:none;'>";
		html += "			<div class='input-field date' style='width:95px;'>";
		html += "				<input type='text' id='fm_start_date' name='rdate' class='formInput'>";
		html += "				<span class='bar'></span>";
		html += "			</div>";
		html += "			<div class='input-field selectbox'><select id='fm_start_time' class='input-time'></select></div>";
		html += "		</div>";
		html += "		<button class='btn-memo-send' id='noti_send_btn'><span>"+gap.lang.send_noti+"</span></button>";
		html += "	</div>";
		html += "	<div class='memo-list-area' id='memo_list_layer' style='height:100%'>";
		html += "		<div class='memo-tab'>";
		html += "			<ul class='tabs'>";
		html += "				<li class='tab' onclick=\"gRM.get_memo_list('r');return false;\"><a href='#'>"+gap.lang.noti_inbox+"</a></li>";
		html += "				<li class='tab' onclick=\"gRM.get_memo_list('s');return false;\"><a href='#'>"+gap.lang.noti_sent+"</a></li>";
		html += "				<li class='tab' onclick=\"gRM.get_memo_list('v');return false;\"><a href='#'>"+gap.lang.noti_reserve+"</a></li>";
		html += "			</ul>";
		html += "		</div>";
//		html += "		<div class='memo-list' id='memo_list_layer_sub' style='display:block; height: calc(100% - 440px) '>";
		html += "		<div class='memo-list' id='memo_list_layer_sub' style='display:block; height: calc(100% - 550px) '>";
		html += "			<div id='memo_list_layer_scroll' style='padding-right:15px;'></div>"
		html += "		</div>";
		html += "	</div>";
		
		html += "<div class='memo-view' id='memo_view_layer' style='height: calc(100% - 35px)'>";
		html += "</div>";
		
		html += "</div>";
		
		$("#ext_body").html(html);
		$('#memo_list_layer .tabs').tabs();

		// 예약메일 날짜 & 시간 셋팅
		var sdateEl = $('#fm_start_date');
		var stimeEl = $('#fm_start_time');
	 	var _now = new Date();
	 	
	 	
	
		sdateEl.bsdatepicker({
			format: 'yyyy-mm-dd (D)',
			startDate: new Date(),
			maxViewMode: 2,
			orientation: 'bottom auto',
			language: gap.userinfo.userLang,
			autoclose: true,
			todayHighlight: true
		}).bsdatepicker("update", _now.getFullYear()+"."+(_now.getMonth()+1)+"."+ _now.getDate()) ;
     	
	    // 시작시간 SelectBox
		var arr_time = [];
		var now = moment();
		now.set({'hour':0, 'minute':0, 'second':0, 'millisecond':0});

		var ckdate = now.clone();
		ckdate.add(1, 'day');
        
	 	while (now.format() != ckdate.format()) {
	  		var timeinfo = now.format('HH:mm');
			arr_time.push(now.format('HH:mm') + '^' + timeinfo);            
			now.add(10 || 30, 'minutes');
		}
  
		var html_time = "";
		$.each(arr_time, function(idx, val) {
			var info = val.split('^');
			var hour = info[0].split(':')[0],
			min = info[0].split(':')[1];
			html_time += '<option value="' + info[1] + '" data-hour="' + hour + '" data-min="' + min + '">' + info[1] + '</option>';
		});
		stimeEl.html(html_time).val(moment().add(1, "hours").startOf("hours").format(gRM.my_timeformat)).material_select();
		
		// 쪽지 목록 가져오기 (수신목록)
		gRM.get_memo_list('r');
   
		$("#noti_send_btn").on("click", function(){
			var is_valid = gRM.check_valid_send_memo();
			if (is_valid == false) return;
			
			gRM.memo_file_upload_dir = gRM.get_file_upload_dir();													//파일 업로드 경로 설정
			gRM.memo_file_upload_list = [];																			//파일정보 초기화
			myDrop.options.url = gRM.memo_fileupload_server_url + "/announce/";										//업로드 URL 재설정
			if (myDrop.files.length > 0){
				//파일 업로드 후 쪽지 발송
				myDrop.processQueue();
			}else{
				//쪽지 발송
				gRM.send_memo(false);
			}
			return false;
		});

		//파일 업로드 세팅
		var myDrop = new Dropzone(".memo-attach", { // Make the whole body a dropzone
			url: gRM.memo_fileupload_server_url + "/announce/",
			autoProcessQueue: false,
			parallelUploads: 100,
		//	maxFilesize: 3,
			maxFiles: 100,
			uploadMultiple: false,
			thumbnailWidth: null,
			thumbnailHeight: null,
			renameFile: function(file){
				return file.name = (gRM.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			},
			init: function() {
				
			},
			success : function(file, json){
				gRM.memo_file_upload_list.push(json.files[0]);
			},
			previewTemplate: $("#preview-template").html(),
			clickable: "#att_noti" // Define the element that should be used as click trigger to select files.
		});

		myDrop.on("totaluploadprogress", function(progress) {
		//	console.log("progress : " + progress);
			document.querySelector("#total_upload_progress").style.width = progress + "%";
		});
		
		myDrop.on("queuecomplete", function (file) {
		//	setTimeout("gRM.complete_process_notification_file()", 10);
			var xtim9 = setTimeout(function(){
				gRM.complete_process_notification_file();
				clearTimeout(xtim9);
			}, 10);
			this.removeAllFiles();
			gRM.send_memo(false);
		});
			
		myDrop.on("addedfiles", function (file) {
			for (var i = 0; i < file.length; i++){
				gRM.memo_file_total_size += file[i].size

				if (gRM.memo_file_total_size > gRM.memo_file_limit_size){
					myDrop.removeFile(file[i]);
					gap.gAlert(gap.lang.memo_file_ex);
					break;
				}
			}
			//$("#att_area").empty();
			$("#noti_empty").css("display","none");
		});
		
		myDrop.on("removedfile", function (file) {
			gRM.memo_file_total_size = gRM.memo_file_total_size - file.size;
		});			

		myDrop.on('sending', function(file, xhr, formData){
			//this gets triggered
		    document.querySelector("#total_upload_progress_wrap").style.display = "";
		});

	
		$("#memo_list_layer_sub").mCustomScrollbar("destroy");
		$("#memo_list_layer_sub").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable:false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			autoHideScrollbar : true
		});
		
		
		$("#memo_layer_close").on("click", function(){
			gRM.layer_close();
			
			if (gap.tmppage == "memo_search"){
				$("#search_window_close").click();
				if (gap.curpage == "main"){
					$("#user_profile").show();
				}else if(gap.curpage == "chat"){
					$("#chat_profile").show();
				}
			}
			gBody.rigth_btn_change_empty();
			$("#ext_body").empty();
			$("#ext_body").fadeOut();
		});
		
		$("#search_noti_query").keypress(function(e) { 
			if (e.keyCode == 13){
				gap.tmppage = "memo_search";
				var noti_query = $("#search_noti_query").val();
				if (noti_query == 0){
					gap.gAlert(gap.lang.input_sender_name);
					$("#search_noti_query").val("");
					$("#search_noti_query").focus();
					return false;					
				}
				gRM.search_memo_user(noti_query);
				$("#search_noti_query").val("");
			}
		}).bind('paste', function(e){
			gap.change_paste_text(e, this);
		});
		
		gRM.reset_send_memo();		//메모 수신자 초기화
	},
	
	// 쪽지 - 사용자 검색
	"search_memo_user" : function(str, is_popup){
		gsn.requestSearch('', str, function(sel_data){
			for (var i = 0; i < sel_data.length; i++){
				var info = gap.user_check(sel_data[i]);
				gRM.show_memo_sender(info.ky, info.email, info.name, info.nm, info.enm, info.dept, info.el, is_popup);
			}
		});
	},
	
	"complete_process_notification_file" : function(){
		$("#total_upload_progress_wrap").fadeOut(function(){
			document.querySelector("#total_upload_progress_wrap").style.display = "none";
			document.querySelector("#total_upload_progress").style.width = "0%";
		});
	},
	
	"get_file_upload_dir" : function(){
		var _d = new Date();
		var tmpYear = _d.getFullYear().toString();
		var tmpMonth = gRM.make_two_digit(_d.getMonth() + 1);
		var tmpDay = gRM.make_two_digit(_d.getDate());
		var tmpHourr = gRM.make_two_digit(_d.getHours());
		var tmpMin = gRM.make_two_digit(_d.getMinutes());
		var tmpSec = gRM.make_two_digit(_d.getSeconds());
		var nowDay = tmpYear + tmpMonth + tmpDay + tmpHourr + tmpMin + tmpSec;
		
		return nowDay + "@" + gRM.user_id;
	},
	
	"get_memo_list" : function(memo_type){
		_wsocket.get_memo_list(memo_type);
	},
	
	"draw_memo_list" : function(data){
		var html = "";
		var memo_type = data.ct.ty;
		var _res = data.ct.rt;

		html += "<ul>";
		for (var i = 0; i < _res.length; i++){
			var _val = _res[i];
	 		html += "<li id='wrap_" + _val.sq + "' onclick=\"gRM.show_memo_body('" + memo_type + "','" + _val.sq + "')\">";
			html += "	<a href='#'>";
			
			if (memo_type == "r"){
				html += "		<div class='name'>" + _val.nm + "</div>";
				html += "		<div class='time'>" + gap.change_date_localTime_full2(_val.dt.toString()) + "</div>";
				html += "		<p" + (_val.st == "1" ? " class='unread'" : "") + " id='memo_subject_" + _val.sq + "'>" + _val.tle + "</p>";
			
			}else{
				var name_list = _val.usr;
				if (name_list.length > 1){
					var bun = name_list.length - 1;
				//	var disp_name = name_list[0].nm + gap.lang.hoching + " " + gap.lang.other + " " + bun + " " + gap.lang.myung;
					var disp_name = name_list[0].nm + " " + gap.lang.other + " " + bun + " " + gap.lang.myung;
				}else{
					var disp_name = name_list[0].nm;
				}
				
				html += "		<div class='name'>" + disp_name + "</div>";
				html += "		<div class='time'>" + gap.change_date_localTime_full2(_val.dt.toString()) + "</div>";
				html += "		<p>" + _val.tle + "</p>";
			}

			html += "	</a>";
			html += "</li>";	

			gRM.memo_list.push({id:_val.sq, data:_val});
		}
		html += "</ul>";
		$("#memo_list_layer_scroll").html(html);
		
		gRM.process_mCustomScrollbar("#memo_list_layer_sub");		
	},
	
	"process_mCustomScrollbar" : function(selector){
		var _selector = $(selector);
		
	//	_selector.mCustomScrollbar("destroy");
		_selector.mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable:false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			autoHideScrollbar : true
		});			
	},
	
	"check_reserve" : function(){
		if ($('#reservation_memo_option').prop('checked') == true){
			$('#reservation_select_date').css('display','inline-block');
			$('#reserve_txt').css('display','none');
		}else{
			$('#reservation_select_date').css('display','none');
			$('#reserve_txt').css('display','inline-block');
		}		
	},
	
	"get_memo_body" : function(memo_type, selector_id){
		_wsocket.get_memo_body(memo_type, selector_id);
	},
	
	"show_memo_body" : function(memo_type, selector_id){
		
		gRM.reset_send_memo();		//쪽지 발송 영역 초기화
		
		var memo_data = $.map(gRM.memo_list, function(ret, key) {
		     if (ret.id == selector_id){
		        return ret.data;
		     }
		});
		var _mval = memo_data[0];
		var html = "";
		
		html += "<h2>" + gap.lang.noti_read + "</h2>";
		html += "<button class='ico btn-right-close' id='show_memo_full_close'>닫기</button>";
		html += "<div id='show_memo_full' style='height: calc(100% - 420px)'>"
		
		if (memo_type == "r"){
			//쪽지 읽음 처리
			if (_mval.st == "1"){
				
				var cint = parseInt(selector_id,10);
				_wsocket.set_memo_read(cint);
			}
			var sender_info = gap.user_check(_mval)
			var _userinfo = new Object();
			_userinfo.cpc = _mval.ky.substring(0, 2);
			_userinfo.emp = _mval.ky.replace();
			
			var photo_img = gap.person_profile_photo(_userinfo);
			var name_list = _mval.usr;

			var my_info = gap.user_check(gap.userinfo.rinfo);
			var disp_name = my_info.disp_user_info;
			for (var j = 0; j < name_list.length; j++){
				var user_info = gap.user_check(name_list[j]);
				disp_name += ", " + user_info.disp_user_info;
			}
			html += "<div class='user'>";
			html += "	<div class='user-thumb'>" + photo_img + "</div>";
			html += "	<dl>";
			html += "		<dt>" + sender_info.disp_user_info + "</dt>";
			html += "		<dd>" + gap.change_date_localTime_full2(_mval.dt.toString())+ "</dd>";
			html += "	</dl>";
			html += "</div>";
			html += "<div class='view-get-user'>";
			html += "	<dl>";
			html += "		<dt>" + gap.lang.sendto + " :</dt>";
			html += "		<dd style='padding-right:15px;'>" + disp_name+ "</dd>";
			html += "	</dl>";
			html += "</div>";	
			
		}else{
			var my_info = gap.user_check(gap.userinfo.rinfo);
			var photo_img = my_info.user_img;
			var name_list = _mval.usr;
			var disp_name = "";
			for (var j = 0; j < name_list.length; j++){
				var user_info = gap.user_check(name_list[j]);
				if (j == 0){
					disp_name = user_info.disp_user_info;
					
				}else{
					disp_name += "," + user_info.disp_user_info;
				}
			}			
			html += "<div class='user'>";
			html += "	<div class='user-thumb'>" + photo_img + "</div>";
			html += "	<dl>";
			html += "		<dt>" + my_info.disp_user_info + "</dt>";
			html += "		<dd>" + gap.change_date_localTime_full2(_mval.dt.toString())+ "</dd>";
			html += "	</dl>";
			html += "</div>";
			html += "<div class='view-get-user'>";
			html += "	<dl>";
			html += "		<dt>" + gap.lang.sendto + " :</dt>";
			html += "		<dd style='padding-right:15px;'>" + disp_name + "</dd>";
			html += "	</dl>";
			html += "</div>";			
		}			

		
		if (typeof(_mval.att) != "undefined" && _mval.att.length > 0){
			var memo_attach = _mval.att;
			html += "<div class='view-attach'>";
			html += "	<h3>" + gap.lang.attachment + "<span>(" + memo_attach.length + ")</span></h3>";
			html += "	<ul>";
			for (var i = 0; i < memo_attach.length; i++){
				var download_file_name = memo_attach[i].nm;
				var download_url = gRM.memo_fileupload_server_url + "/announcedown" + memo_attach[i].sf + "/" + memo_attach[i].sn + "/" + encodeURIComponent(download_file_name);
				//html += "		<li><a href='" + download_url + "' target='_new'>" + download_file_name + "</a></li>";	
				html += "		<li data='" + download_url + "' style='cursor:pointer' title='" + download_file_name + "'>" + download_file_name + "</li>";	
			}
			html += "	</ul>";
			html += "</div>";			
		}
		
		html += "<div class='view-message'>";
		
		html += gap.message_check(_mval.msg);

		html += "</div>";
		
		html += "<div class='right-bottom-btns'>";
		if (memo_type == "r"){
			html += "	<button onclick=\"gRM.forward_memo('" + selector_id + "')\"><span>" + gap.lang.mail_reply + "</span></button>"
			html += "	<button onclick=\"gRM.forward_all_memo('" + selector_id + "')\"><span>" + gap.lang.replyall + "</span></button>";
		}
		html += "	<button onclick=\"gRM.remove_memo('" + memo_type + "', '" + selector_id + "')\"><span>" + gap.lang.basic_delete + "</span></button>";
		html += "</div>";	
		
		html += "</div>";
		
		$("#memo_view_layer").show();
		$("#memo_list_layer").hide();
		$("#memo_view_layer").html(html);
		
		$(".view-attach ul li").off();
		$(".view-attach ul li").on("click", function(e){
			e.preventDefault();
			var url  = $(this).attr("data");
			
			gap.file_download_memo(url);
			return false;
		});
		
		
		
		$("#show_memo_full").mCustomScrollbar("destroy");
		$("#show_memo_full").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable:false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			autoHideScrollbar : true
		});
		
		$("#show_memo_full_close").on("click", function(){
			$("#memo_list_layer").show();
			$("#memo_view_layer").hide();
		});		
	},
	
	"set_memo_read" : function(data){
		if (data.rc === 0){
			$("#memo_subject_" + data.ct.sq[0]).removeClass("unread");
		}
	},
	
	"show_memo_noti_body" : function(obj){
		
		try{
        	$('#chat_history_dialog').empty();
        	$('#chat_history_dialog').hide();
        	gap.hideBlock();
		}catch(e){}
		
		
		gap.change_title("1","");
		gRM.reset_send_memo();		//쪽지 발송 영역 초기화
		
		//쪽지 읽음 처리
		_wsocket.set_memo_read(obj.sq);
		
		var memo_body = "";
		var memo_attach_info = "";
		var html = "";
		var user_html = "";
		var body_html = "";
		var btn_html = "";
		
		memo_body = obj.msg;
		memo_attach_info = obj.att;

		html += "<div class='layer-result' id='chat_history_content' style='left:50%;top:50%;transform:translate(-50%,-50%);'>";
		html += "	<h2>" + gap.lang.noti_read + "</h2>";
		html += "	<button class='ico btn-article-close'>닫기</button>";
		
		html += "	<section class='memo-noti'>";
		html += "		<div id='memo_noti_user'>";
		html += "		</div>";
		html += "		<div id='wrap_memo_noti_body'>";
		html += "			<div id='memo_noti_body' class='memo-noti-body'>";
		html += "			</div>";
		html += "		</div>";
		html += "		<div id='memo_noti_btn'>";
		html += "		</div>";		
		html += "	</section";
		html += "</div>";		
		
		var _userinfo = new Object();
		_userinfo.cpc = obj.ky.substring(0, 2);
		_userinfo.emp = obj.ky;
		
		var photo_img = gap.person_profile_photo(_userinfo);
		var name_list = obj.usr;
		var disp_name = "";
		for (var j = 0; j < name_list.length; j++){
			if (j == 0){
				disp_name = name_list[j].nm;
			}else{
				disp_name = disp_name + ", " + name_list[j].nm;
			}
		}
		
   	 	var _now = new Date();		
   	 	var _date = _now.YYYYMMDDHHMMSS();
   	 	var disp_date = String(_date).substring(0,4) + "." + String(_date).substring(4,6) + "." + String(_date).substring(6,8)
   	 					+ " " + String(_date).substring(8,10) + ":" + String(_date).substring(10,12)
		
		user_html += "<div class='user'>";
   	 	user_html += "	<div class='user-thumb'>" + photo_img + "</div>";
   	 	user_html += "	<dl>";
   	 	user_html += "		<dt>" + obj.nm + "</dt>";
   	 	user_html += "		<dd>" + disp_date + "</dd>";
   	 	user_html += "	</dl>";
   	 	user_html += "</div>";
   	 	user_html += "<div class='view-get-user'>";
   	 	user_html += "	<dl>";
   	 	user_html += "		<dt>" + gap.lang.sendto + " :</dt>";
   	 	user_html += "		<dd>" + disp_name+ "</dd>";
   	 	user_html += "	</dl>";
   	 	user_html += "</div>";
		
		if (memo_attach_info){
			body_html += "<div class='view-attach'>";
			body_html += "	<h3>" + gap.lang.attachment + "<span>(" + (memo_attach_info.length) + ")</span></h3>";
			body_html += "	<ul>";
			for (var i = 0; i < memo_attach_info.length; i++){
				var download_file_name = memo_attach_info[i].nm;
			//	var download_url = gRM.memo_fileupload_server_url + "/memodown/" + memo_attach_info[i].sf + "/" + encodeURIComponent(download_file_name);
				var download_url = gRM.memo_fileupload_server_url + "/announcedown" + memo_attach_info[i].sf + "/" + memo_attach_info[i].sn + "/" + encodeURIComponent(download_file_name);
				//html += "		<li><a href='" + download_url + "' target='_new'>" + download_file_name + "</a></li>";	
				body_html += "		<li data='" + download_url + "' style='cursor:pointer' title='" + download_file_name + "'>" + download_file_name + "</li>";	
			}
			body_html += "	</ul>";
			body_html += "</div>";			
		}		
		
		body_html += "<div class='view-message' style='border-bottom:none;'>";
		body_html += gap.message_check(memo_body);

		body_html += "</div>";
		
		btn_html += "<div class='right-bottom-btns'>";
		btn_html += "	<button id='forward_memo_noti' ><span>" + gap.lang.mail_reply + "</span></button>"
		btn_html += "	<button id='forward_all_memo_noti' ><span>" + gap.lang.replyall + "</span></button>";
		btn_html += "	<button onclick=\"gRM.remove_memo_noti('r', '" + obj.sq + "')\"><span>" + gap.lang.basic_delete + "</span></button>";
		btn_html += "</div>";			
		

		$("#chat_history_dialog").html(html);
		$("#memo_noti_user").html(user_html);
		$("#memo_noti_body").html(body_html);
		$("#memo_noti_btn").html(btn_html);
		
		$("#memo_noti_body").mCustomScrollbar("destroy");
		$("#memo_noti_body").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable:true
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			autoHideScrollbar : true
		});
		
		$(".view-attach ul li").off();
		$(".view-attach ul li").on("click", function(e){
			e.preventDefault();
			var url  = $(this).attr("data");
			
			gap.file_download_memo(url);
			return false;
		});
		
		$('#forward_memo_noti').off();
		$('#forward_memo_noti').on('click', function() {
        	$('#chat_history_dialog').empty();
        	$('#chat_history_dialog').hide();
        	gap.hideBlock();
        	
			gRM.draw_memo_to_right_frame();
			gRM.right_side_open_layer = "memo";
			gRM.layer_open();
        	gRM.forward_memo_noti(obj);
        });
		
		$('#forward_all_memo_noti').off();
		$('#forward_all_memo_noti').on('click', function() {
        	$('#chat_history_dialog').empty();
        	$('#chat_history_dialog').hide();
        	gap.hideBlock();
        	
			gRM.draw_memo_to_right_frame();
			gRM.right_side_open_layer = "memo";
			gRM.layer_open();
        	gRM.forward_all_memo_noti(obj);
        });
		
        $('#chat_history_dialog').find('.btn-article-close').on('click', function() {
        	$('#chat_history_dialog').empty();
        	$('#chat_history_dialog').hide();
        	gap.hideBlock();
        });		
		
        gap.showBlock();	
        var max_idx = gap.maxZindex();
		$('#chat_history_dialog')
        .css({'width':'600px','height':'300px','zIndex': parseInt(max_idx) + 1})
        .fadeIn()
        .position({
            my: 'center',
            at: 'center',
            of: window
        });	
        
        
        var id = obj.sq;
        var list = $(".jq-toast-single").find(["data="+id]).prevObject;
		for (var i = 0 ; i < list.length; i++){
			//동일한 채팅창에서 온 메시지는 모두 사라지게 처리한다.
			var oob = list[i];
			$(oob).parent().find(".close-jq-toast-single").click();
		}
	},
	
	"forward_memo" : function(selector_id){
		gRM.reset_send_memo();		//쪽지 발송 영역 초기화
		
		var memo_data = $.map(gRM.memo_list, function(ret, key) {
		     if (ret.id == selector_id){
		        return ret.data;
		     }
		});

		var _mval = memo_data[0];
		var sender_ky = _mval.ky;
		var sender_email = "";
		var sender_name = "";
		var sender_kname = "";
		var sender_ename = "";
		var sender_dept = "";
		var sender_el = "";

		if (sender_ky != gRM.user_ky){		//나(본인)는 포함하지 않음
			$.ajax({
				type : "GET",
				url : "getUserInfo?openagent&query=" + encodeURIComponent(sender_ky),
				dataType : "json",
				async : false,
				success : function(data){
					sender_email = data.email;
					sender_name = (gap.curLang == "ko" ? data.user_name : data.user_name_eng);
					sender_kname = data.user_name;
					sender_ename = data.user_name_eng;
					sender_dept = data.dept_name;
					sender_el = data.eiplan;
					gRM.show_memo_sender(sender_ky, sender_email, sender_name, sender_kname, sender_ename, sender_dept, sender_el);
				},
				error : function(e){
					gap.error_alert();
				}
			});			
		}
		
		var memo_body = "";
		
		memo_body = _mval.msg;
		memo_body = "\n---------- Original Message ----------\n\n" + memo_body;
		
		$("#search_noti_memo").val(memo_body);
		
		$("#memo_list_layer").show();
		$("#memo_view_layer").hide();		
	},
	
	"forward_memo_noti" : function(obj){
		gRM.reset_send_memo();		//쪽지 발송 영역 초기화
		
		var sender_ky = obj.ky;
		var sender_email = "";
		var sender_name = "";
		var sender_kname = "";
		var sender_ename = "";
		var sender_dept = "";
		var sender_el = "";

		if (sender_ky != gRM.user_ky){		//나(본인)는 포함하지 않음
			$.ajax({
				type : "GET",
				url : "getUserInfo?openagent&query=" + encodeURIComponent(sender_ky),
				dataType : "json",
				async : false,
				success : function(data){
					sender_email = data.email;
					sender_name = (gap.curLang == "ko" ? data.user_name : data.user_name_eng);
					sender_kname = data.user_name;
					sender_ename = data.user_name_eng;
					sender_dept = data.dept_name;
					sender_el = data.eiplan;
					gRM.show_memo_sender(sender_ky, sender_email, sender_name, sender_kname, sender_ename, sender_dept, sender_el);
				},
				error : function(e){
					gap.error_alert();
				}
			});			
		}
		
		var memo_body = "";

		memo_body = obj.msg;
		memo_body = "\n---------- Original Message ----------\n\n" + memo_body;
		
		$("#search_noti_memo").val(memo_body);		
	},	
	
	"forward_all_memo" : function(selector_id){
		gRM.reset_send_memo();		//쪽지 발송 영역 초기화
		
		var memo_data = $.map(gRM.memo_list, function(ret, key) {
		     if (ret.id == selector_id){
		        return ret.data;
		     }
		});
		var _mval = memo_data[0];

		//보낸사람 세팅
		var sender_ky = _mval.ky;
		var sender_email = "";
		var sender_name = "";
		var sender_kname = "";
		var sender_ename = "";
		var sender_dept = "";
		var sender_el = "";

		if (sender_ky != gRM.user_ky){		//나(본인)는 포함하지 않음
			$.ajax({
				type : "GET",
				url : "getUserInfo?openagent&query=" + encodeURIComponent(sender_ky),
				dataType : "json",
				async : false,
				success : function(data){
					sender_email = data.email;
					sender_name = (gap.curLang == "ko" ? data.user_name : data.user_name_eng);
					sender_kname = data.user_name;
					sender_ename = data.user_name_eng;
					sender_dept = data.dept_name;
					sender_el = data.eiplan;
					gRM.show_memo_sender(sender_ky, sender_email, sender_name, sender_kname, sender_ename, sender_dept, sender_el);
				},
				error : function(e){
					gap.error_alert();
				}
			});			
		}
	

		//받는사람 세팅
		for (var i = 0; i < _mval.usr.length; i++){
			var _user = _mval.usr[i]
			var to_ky = _user.ky;
			var to_email = _user.em;
			var to_name = (gap.curLang == "ko" ? _user.nm : _user.enm);
			var to_kname = _user.nm;
			var to_ename = _user.enm;
			var to_dept = _user.dp;
			var to_el = _user.el;
			
			//나(본인)는 포함하지 않음
			if (to_ky != gRM.user_ky){	
				gRM.show_memo_sender(to_ky, to_email, to_name, to_kname, to_ename, to_dept, to_el);				  
			}
		}
				
		var memo_body = "";
		memo_body = _mval.msg;
		memo_body = "\n---------- Original Message ----------\n\n" + memo_body;

		$("#search_noti_memo").val(memo_body);
		
		$("#memo_list_layer").show();
		$("#memo_view_layer").hide();				
	},
	
	"forward_all_memo_noti" : function(obj){
		gRM.reset_send_memo();		//쪽지 발송 영역 초기화
		
		var sender_ky = obj.ky;
		var sender_email = "";
		var sender_name = "";
		var sender_kname = "";
		var sender_ename = "";
		var sender_dept = "";
		var sender_el = "";

		if (sender_ky != gRM.user_ky){		//나(본인)는 포함하지 않음
			$.ajax({
				type : "GET",
				url : "getUserInfo?openagent&query=" + encodeURIComponent(sender_ky),
				dataType : "json",
				async : false,
				success : function(data){
					sender_email = data.email;
					sender_name = (gap.curLang == "ko" ? data.user_name : data.user_name_eng);
					sender_kname = data.user_name;
					sender_ename = data.user_name_eng;
					sender_ename = data.user_name_eng;
					sender_dept = data.dept_name;
					sender_el = data.eiplan;
					gRM.show_memo_sender(sender_ky, sender_email, sender_name, sender_kname, sender_ename, sender_dept, sender_el);
				},
				error : function(e){
					gap.error_alert();
				}
			});			
		}
		
		//받는사람 세팅
		var to_info = obj.usr;
		
		for (var i = 0; i < to_info.length; i++){
			var to_notesid = to_info[i].ky;
			var to_email = to_info[i].em;
			var to_name = (gap.curLang == "ko" ? to_info[i].nm : to_info[i].enm);
			var to_kname = to_info[i].nm;
			var to_ename = to_info[i].enm;
			var to_dept = to_info[i].dp;
			var to_el = to_info[i].el;
			
			//나(본인)는 포함하지 않음
			if (to_notesid != gRM.user_ky){	
				gRM.show_memo_sender(to_notesid, to_email, to_name, to_kname, to_ename, to_dept, to_el);				  
			}
		}		
		
		var memo_body = "";

		memo_body = obj.msg;
		memo_body = "\n---------- Original Message ----------\n\n" + memo_body;

		$("#search_noti_memo").val(memo_body);		
	},		
	
	"remove_memo" : function(memo_type, selector_id){
		_wsocket.remove_memo(memo_type, selector_id);
	},
	
	"after_remove_memo" : function(obj){
		if (obj.rc == 0){
			$("#wrap_" + obj.ct.sq[0]).remove();
			$("#memo_list_layer").show();
			$("#memo_view_layer").fadeOut();
		}
	},
	
	"remove_memo_noti" : function(memo_type, selector_id){
		$.confirm({
			title : "Confirm",
			content : gap.lang.confirm_delete + "<hr>",
			type : "default",  
			closeIcon : true,
			closeIconClass : "fa fa-close",
			columnClass : "small",  
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
						//확인을 클릭한 경우
						_wsocket.remove_memo(memo_type, selector_id, true);
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
	
	"show_memo_sender" : function(ky, email, disname, kname, ename, dept, el, is_popup){
		if (is_popup){
			// 레이어 팝업인 경우
			if ($.isArray(ky)){
				for (var i = 0; i < ky.length; i++){
					var title_str = (email[i] == "undefined" ? disname[i] : disname[i] + "&nbsp;(" + email[i] + ")");
					var html = 
						'<li id="memo_sender_' + ky + '">' +
						'	<div class="f_between">' +
						'		<span class="txt ko">' + disname[i] + '/' + dept[i] + '</span>' +
						'		<button class="file_remove_btn" onclick="gRM.remove_memo_sender(\''+ ky + '\')"></button>' +
						'	</div>' +
						'</li>';
					gRM.memo_sender_list.push({userid:ky[i], username:disname[i], ky:ky[i], email:email[i], nm:kname[i], enm:ename[i], dp:dept[i], el:el[i]});
					$("#memo_sender_list").append(html);
					gap.draw_qtip_left("#memo_sender_" + ky[i], title_str);
				}
			}else{
				var title_str = (email == "undefined" ? disname : disname + "&nbsp;(" + email + ")");
				var html = 
					'<li id="memo_sender_' + ky + '">' +
					'	<div class="f_between">' +
					'		<span class="txt ko">' + disname + '/' + dept + '</span>' +
					'		<button class="file_remove_btn" onclick="gRM.remove_memo_sender(\''+ ky + '\')"></button>' +
					'	</div>' +
					'</li>';
				gRM.memo_sender_list.push({userid:ky, username:disname, ky:ky, email:email, nm:kname, enm:ename, dp:dept, el:el});
				$("#memo_sender_list").append(html);
				gap.draw_qtip_left("#memo_sender_" + ky, title_str);
			}

		}else{
			if ($.isArray(ky)){
				for (var i = 0; i < ky.length; i++){
					var title_str = (email[i] == "undefined" ? disname[i] : disname[i] + "&nbsp;(" + email[i] + ")");
					var html = "<li id='memo_sender_" + ky + "'>" + disname[i] + '/' + dept[i] + "<button class='ico btn-user-del' onclick=\"gRM.remove_memo_sender('" + ky + "')\">삭제</button></li>"
					gRM.memo_sender_list.push({userid:ky[i], username:disname[i], ky:ky[i], email:email[i], nm:kname[i], enm:ename[i], dp:dept[i], el:el[i]});
					$(".get-user-list").append(html);
					gap.draw_qtip_left("#memo_sender_" + ky[i], title_str);
				}
			}else{
				var title_str = (email == "undefined" ? disname : disname + "&nbsp;(" + email + ")");
				var html = "<li id='memo_sender_" + ky + "'>" + disname + '/' + dept + "<button class='ico btn-user-del' onclick=\"gRM.remove_memo_sender('" + ky + "')\">삭제</button></li>"
				gRM.memo_sender_list.push({userid:ky, username:disname, ky:ky, email:email, nm:kname, enm:ename, dp:dept, el:el});
				$(".get-user-list").append(html);
				gap.draw_qtip_left("#memo_sender_" + ky, title_str);
			}
		}
	},
	
	"remove_memo_sender" : function(userid){
		$("#memo_sender_" + userid).qtip("destroy", true);
		$("#memo_sender_" + userid).remove();
		gRM.memo_sender_list = $.grep(gRM.memo_sender_list, function(ret){
			return ret.userid != userid;
		});
	},
	
	"check_valid_send_memo" : function(){
		var _szUIDs2 = $.map(gRM.memo_sender_list, function(ret, key){
			return ret.ky
		}).join(";");
		var _szContent = $("#search_noti_memo").val();
		
		if (_szUIDs2 == ""){
			mobiscroll.toast({message:gap.lang.no_user_selected, color:'danger'});
			return false;
		}
		if (_szContent == ""){
			mobiscroll.toast({message:gap.lang.enter_memo_contents, color:'danger'});
			return false;
		}
		if ($('#reservation_memo_option').prop('checked') == true){
			var _reservTime = gRM.Left($('#fm_start_date').val(), " ") + " " + $('#fm_start_time').val() + ":00";
			var _res = new Date(_reservTime.replace(/-/gi, "/"));
			var _now = new Date();
			var _gap = _res.getTime() - _now.getTime();
			var _min_gap = _gap/1000/60;
			if (_min_gap < 5){
				mobiscroll.toast({message:gap.lang.memo_reserve_time_check, color:'danger'});
				return false;
			}
		}
	},
	
	"send_memo" : function(is_popup){
		//웹소켓용 값 세팅
		var is_reserve = $('#reservation_memo_option').prop('checked');
		var _content = (is_popup ? $("#create_memo_layer").find("#search_noti_memo").val() : $("#search_noti_memo").val());
		var _title = _content.split("\n")[0];
		if (_title.length >= 58){
			_title = _title.substr(0, 58) + "...";
		}
		var sender_list = [];
		for (var i = 0; i < gRM.memo_sender_list.length; i++){
			var info = gRM.memo_sender_list[i];
			var sender = new Object();
			sender.ky = info.ky;
			sender.nm = info.nm;
			sender.enm = info.enm;
		//	sender.em = info.email;
			sender.el = info.el;
			
			sender_list.push(sender);
		}
		
		var att_list = [];
		if (gRM.memo_file_upload_list.length > 0){
			for (var j = 0; j < gRM.memo_file_upload_list.length; j++){
				var info = gRM.memo_file_upload_list[j];
				var att = new Object();
				att.nid = "ko_1";	//고정값
				att.nm = info.r_name;
				att.sn = info.savefilename;
				att.sf = info.savefolder;
				att.sz = info.size;
				
				att_list.push(att);
			}
		}
		
		var obj = new Object();
		obj.rsv = (is_reserve ? true : false);
		if (is_reserve){
			var reserve_time = gRM.Left($('#fm_start_date').val(), " ") + " " + $('#fm_start_time').val() + ":00";
			obj.dt = parseInt(moment(reserve_time).utc().format('YYYYMMDDHHmmss'));
		}
		obj.ky = gRM.user_ky;
		obj.nm = gRM.user_nm;
		obj.enm = gRM.user_enm;
		obj.el = gRM.user_el;
		obj.tle = _title;
		obj.msg = _content;
		obj.usr = sender_list;
		obj.att = att_list;

		_wsocket.send_memo(obj);
		gRM.reset_send_memo();
		
		if (is_popup){
			gap.remove_layer('create_memo_layer');
		//	gap.remove_layer('common_work_layer');
			mobiscroll.toast({message:gap.lang.memo_has_been_sent, color:'success'});
			return false;
		}
	},
	

	"reset_send_memo" : function(){
		gRM.memo_file_total_size = 0;		//total 파일사이즈 초기화
		gRM.memo_file_upload_dir = "";		//파일업로드경로 재설정
		gRM.memo_sender_list = [];			//쪽지 수신자 초기화
		$(".get-user-list").html("");		//쪽지 수신자 초기화	
		$("#search_noti_memo").val("");		//쪽지 본문 초기화
		if ($('#reservation_memo_option').prop('checked') == true){
			$('#reservation_memo_option').prop('checked', false);
			gRM.check_reserve();
		}
	},

	"create_memo" : function(user_obj){
		gRM.reset_send_memo();		//메모 수신자 초기화
		
		var html =
		//	'<div id="create_memo_layer" class="mu_container" style="width: 400px;">' + 
			'	<div id="create_memo_layer" class="drop-pop-mu layer_wrap center">' + 
			'		<div class="layer_inner layer_cont ">' + 
			'			<div class="pop_btn_close"></div>' + 
			'			<h4>' + gap.lang.noti + '</h4>' + 
			'				<div class="layer_cont left">' + 
			'				<div class="cont_wr rel">' + 
			'					<div class="before_select f_between">' +
			'						<input type="text" name="" id="search_noti_query" class="input" placeholder="' + gap.lang.input_sender_name + '">' + 
			'						<button class="type_icon"></button>' + 
			'					</div>' + 
			'					<div class="after_select until_wr top-sec" id="selected_memo_sender" style="display:none;">' + 
			'						<ul id="memo_sender_list" class="custom-scroll-row until p4">' + 
			'						</ul>' + 
			'					</div>' + 
			'					<div class="before_select send-txt">' + 
			'						<textarea name="" id="search_noti_memo" placeholder="' + gap.lang.noti_express + '"></textarea>' + 
			'					</div>' + 
			'				</div>' + 
			'				<div class="cont_wr rel file-bx">' + 
			'					<h5>' + gap.lang.attachment + '</h5>' + 
			'					<button id="add_att_noti" class="file-add">' + gap.lang.addFile + '</button>' + 
			'					<!-- 선택하면 나오면 화면 -->' + 
			'					<div class="after_select until_wr">' + 
			'						<ul id="memo_upload_file_list" class="scroll until p5">' + 
			'						</ul>' + 
			'					</div>' + 
			'				</div>' + 
			'			</div>' + 
			'			<div class="btn_wr">' + 
			'				<button class="btn_layer confirm">' + gap.lang.send_noti + '</button>' + 
			'			</div>' + 
			'		 </div>' + 
		//	'	</div>' + 
			'</div>';
		
		gap.showBlock();
		$("#common_work_layer").show();
		$("#common_work_layer").html(html);
//		$(html).appendTo('body');
		var $layer = $('#create_memo_layer');
//		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
//		$layer.wrap('<div id="common_work_layer" class="mu_container" style="top:-50%;"></div>')
		
		// 수신자 인자로 전달받은 사용자 설정
		if (typeof(user_obj) != "undefined"){
			for (var i = 0; i < user_obj.length; i++){
				var info = gap.user_check(user_obj[i]);
				gRM.show_memo_sender(info.ky, info.email, info.name, info.nm, info.enm, info.dept, info.el, true);
			}
			$layer.find('#selected_memo_sender').show();
		}
		
		// 닫기
		$layer.find('.pop_btn_close').off().on('click', function(){
			gap.remove_layer('create_memo_layer');
			//gap.remove_layer('common_work_layer');
		});
		
		// 쪽지 보내기
		$layer.find('.confirm').off().on("click", function(){
			var is_valid = gRM.check_valid_send_memo();
			if (is_valid == false) return;
			
			gRM.memo_file_upload_dir = gRM.get_file_upload_dir();													//파일 업로드 경로 설정
			gRM.memo_file_upload_list = [];																			//파일정보 초기화
			popMemoDrop.options.url = gRM.memo_fileupload_server_url + "/announce/";										//업로드 URL 재설정
			if (popMemoDrop.files.length > 0){
				//파일 업로드 후 쪽지 발송
				popMemoDrop.processQueue();
			}else{
				//쪽지 발송
				gRM.send_memo(true);
			}
			return false;
		});
		
		// 수신자 검색
		$layer.find('#search_noti_query').keypress(function(e) { 
			if (e.keyCode == 13){
				gap.tmppage = "memo_search";
				var noti_query = $("#search_noti_query").val();
				if (noti_query == 0){
					$layer.find('#search_noti_query').val('');
					$layer.find('#search_noti_query').focus();
					mobiscroll.toast({message:gap.lang.input_sender_name, color:'danger'});
					return false;					
				}
				gRM.search_memo_user(noti_query, true);
				$layer.find('#search_noti_query').val('');
			}
		})
		.bind('paste', function(e){
			gap.change_paste_text(e, this);
		});
		
		// 조직도 호출
		$layer.find('.type_icon').off().on('click', function(){
			window.ORG.show(
				{
					'title': gap.lang.invite_user,
					'single': false,
					'select': 'person'
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) {  
						//반환되는 Items
						for (var i = 0; i < items.length; i++){
							var _res = gap.convert_org_data(items[i]);
							var info = gap.user_check(_res);
							gRM.show_memo_sender(info.ky, info.email, info.name, info.nm, info.enm, info.dept, info.el, true);
						}
					}
				});		
		});
		
		// 파일 추가
		$layer.find('#add_att_noti').off().on('click', function(){
			$("#memo_add_file").click();
			return false;
		});
		
		//파일 업로드 세팅
		if (typeof(popMemoDrop) != "undefined" && popMemoDrop){
			return;
		}
		popMemoDrop = new Dropzone(".file-bx", { // Make the whole body a dropzone
			url: gRM.memo_fileupload_server_url + "/announce/",
			autoProcessQueue: false,
			parallelUploads: 100,
		//	maxFilesize: 3,
			maxFiles: 100,
			uploadMultiple: false,
			thumbnailWidth: null,
			thumbnailHeight: null,
			renameFile: function(file){
				return file.name = (gRM.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			},
			init: function() {
				
			},
			success : function(file, json){
				gRM.memo_file_upload_list.push(json.files[0]);
			},
		//	previewTemplate: $("#preview-template").html(),
			previewsContainer: "#previews_channel",
			clickable: "#memo_add_file" // Define the element that should be used as click trigger to select files.
		});

		popMemoDrop.on("totaluploadprogress", function(progress) {
		//	console.log("progress : " + progress);
		//	document.querySelector("#total_upload_progress").style.width = progress + "%";
		});
		
		popMemoDrop.on("queuecomplete", function (file) {
		//	setTimeout("gRM.complete_process_notification_file()", 10);
			var xtim9 = setTimeout(function(){
				gRM.complete_process_notification_file();
				clearTimeout(xtim9);
			}, 10);
			this.removeAllFiles();
			gRM.send_memo(true);
		});
			
		popMemoDrop.on("addedfiles", function (file) {
			for (var i = 0; i < file.length; i++){
				gRM.memo_file_total_size += file[i].size

				if (gRM.memo_file_total_size > gRM.memo_file_limit_size){
					popMemoDrop.removeFile(file[i]);
					mobiscroll.toast({message:gap.lang.memo_file_ex, color:'danger'});
					break;
				}
			}
			gRM.add_memo_upload_file(file, 'memo_upload_file_list');
			
		});
		
		popMemoDrop.on("removedfile", function (file) {
			gRM.memo_file_total_size = gRM.memo_file_total_size - file.size;
		});			

		popMemoDrop.on('sending', function(file, xhr, formData){
			//this gets triggered
		//	document.querySelector("#total_upload_progress_wrap").style.display = "";
		});
		
		$(".after_select.until_wr").mCustomScrollbar("destroy");
		$(".after_select.until_wr").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: false,
			scrollButtons:{
				enable:false
			},
			mouseWheelPixels : 200, // 마우스휠 속도
			scrollInertia : 400, // 부드러운 스크롤 효과 적용
			autoHideScrollbar : true
		});
	},
	
	"add_memo_upload_file" : function(file_info, selector){
		for (var i = 0; i < file_info.length; i++){
			var info = file_info[i];
			var _html =
				'<li class="f_between">' +
				'	<span class="txt ko">' + info.name + '</span>' +
				'	<button class="file_remove_btn" data-name="' + info.name + '" data-size="' + info.size + '" onclick="gRM.remove_memo_file(this)"></button>' +
				'</li>';
			
			$("#" + selector).append(_html);
		}
	},
	
	"remove_memo_file" : function(obj){
		$(obj).parent().remove();
		
		var filename = $(obj).data("name");
		var size = $(obj).data("size");
				
		var list = popMemoDrop.files;		
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];
			if ( (filename == item.name) && (size == item.size)){
				$("#total-progress_channel").hide();
				popMemoDrop.removeFile(item);
				break;
			}
		}
	},
	
	
	"replace_edit_ascii_to_string" : function(str){
		var regExA = new RegExp(String.fromCharCode(16), "gi");
		var regExB = new RegExp(String.fromCharCode(17), "gi");
		var regExC = new RegExp(String.fromCharCode(18), "gi");
		var regExD = new RegExp(String.fromCharCode(19), "gi");
		str = str.replace(regExA, "&");
		str = str.replace(regExB, "\n");
		str = str.replace(regExC, " ");
		str = str.replace(regExD, "%");
		return str;
	},
	
	"replace_read_ascii_to_string" : function(str){
		var regExA = new RegExp(String.fromCharCode(16), "gi");
		var regExB = new RegExp(String.fromCharCode(17), "gi");
		var regExC = new RegExp(String.fromCharCode(18), "gi");
		var regExD = new RegExp(String.fromCharCode(19), "gi");
		str = str.replace(regExA, "&amp;");
		str = str.replace(regExB, "<br>");
		str = str.replace(regExC, "&nbsp;");
		str = str.replace(regExD, "%");
		return str;
	},
	
	"replace_string_to_ascii" : function(str){
		var regExA = new RegExp("&", "gi");
		var regExB = new RegExp("\n", "gi");
		var regExC = new RegExp(" ", "gi");
		var regExD = new RegExp("%", "gi");
		str = str.replace(regExA, String.fromCharCode(16));
		str = str.replace(regExB, String.fromCharCode(17));
		str = str.replace(regExC, String.fromCharCode(18));
		str = str.replace(regExD, String.fromCharCode(19));
		return str;
	},
	
	"make_two_digit" : function(val){
		var ret = (val.toString().length == 1 ? "0" + val : val);
		return ret;		
	},
	
	"Left" : function(SourceStr, FindStr){
		var Index = SourceStr.indexOf(FindStr);
		if (Index < 0) {
			return ("");
		} else {
			return (SourceStr.substring(0, Index));
		}
	}
	
}

