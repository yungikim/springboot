/* jshint esversion : 6 */

function gPortlet(){
	_this = this;
	_this.main_item_position = "";
	_this.weather_retry_cnt = 3;
	_this.sidecal = null;
	
	/// 포틀릿 메인설정에서 위젯 추가 시 ajax 중복 호출 방지 변수
	_this.portlet_draw_flag = true;
}

gPortlet.prototype = {
	
	"init": function(){
		
	},
	
	"ceo_data_load": function(){
		var _self = this;
		
		$.ajax({
			type: "GET",
			url: location.protocol + "//" + window.mailserver + "/board/ceo.nsf/getContents?open",
			cache: false,
			xhrFields : {
				withCredentials : true
			},						
			success: function(data){
				if (data != ""){
					var strVal = data.split("^#^");
					if (strVal[3]){
						var ceo_msg = strVal[3].slice(0, 300) + "..";
						
						/// CEO 메시지 표시				
						$("#ceo_contents").html(ceo_msg);
						$("#ceo_contents").addClass("active");
						
						$("#btn_to_ceo_mail").off().on("click", function(){
							var _url = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/board/ceo.nsf/0/" + strVal[2] + "?opendocument";
							gap.open_subwin(_url, "1200","900", "yes" , "", "yes");
						});							
					}
				}
				//console.log(">>>>>>>>> CEO 메시지 로드 성공");
			},
			error: function(xhr, error){
				console.log(error);
			}
		});
	},
	
	/////////	메인포틀릿 불러오는 함수 //////////
	"main_portlet_load": function(){
		var _self = this;
		var grid = gport.main_grid_init();
		
		var surl = gap.channelserver + "/portlet_person_list_portal.km";
		var postData = JSON.stringify({});
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			cache : false,
			async : false,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.data && res.data.position){
					_self.main_item_position = res.data.position;
				}
			},
			error : function(e){
			}
		});	

		
		//// 메인설정 저장이 되어있지 않을 때는 기본 포틀릿을 표시한다.
		if(this.main_item_position == ""){
			
			//콘텐츠 그리는 함수들을 담은 배열
			var content_arr = [
				gport.news_data_load("init"),
				gport.approval_data_load("init"),
				//gport.weather_data_load(),
				gport.schedule_data_load("init"),
				gport.holiday_data_load("init"),
				//gport.mail_data_load("init"),
				gport.board_data_load("init"),
				gport.emp_search_box_draw("init"),
				gport.chat_data_load("init"),
				gport.bookmark_data_load("init"),
				gport.survey_data_load("init")
			];
		
			$.when.apply($, content_arr).done(function() {
				
				var weather = "";
				
				weather +=	"<div id='weather_box' class='content_item' idx='1'>";
				weather +=		"<div class='content_title_wrap'><h4 class='content_title'>날씨정보</h4><button type='button' id='btn_weather_refresh' class='btn btn_refresh'></button></div>";
				weather +=		"<div id='weather_wait'><div class='loading_icon'></div><span>날씨 정보를 불러오는 중...</span></div>";
	        	weather +=	"</div>";
				
				weather = { w: 4,  h: 3, content: weather, id: "item-weather" }
				
				grid.addWidget(weather);
				
				gport.main_layout_load();
				
				$("#portlet_loading").remove();
				// 포틀릿이 불러와지면 표시
				$("#content_container").addClass("block");
				
				$("#btn_weather_refresh").off().on("click", function(){
					var text = weather += 	"<div id='weather_wait'><div class='loading_icon'></div><span>날씨 정보를 불러오는 중...</span></div>";
					
					if($("#weather_wait").length === 0){
						$("#weather_box").find(".weather_info_wrap").html(text);
					}
					
					gport.getCurrentPosition().then(function(data){
						
						// data = 위치좌표, 좌표에 해당하는 장소 데이터
						return gport.weather_data_load(data, "");
					});
				});
				
				gport.getCurrentPosition().then(function(data){
					// data = 위치좌표, 좌표에 해당하는 장소 데이터
					return gport.weather_data_load(data, "");
				});
				
				grid.movable('.grid-stack-item:not([gs-id=item-news])', false);
				grid.resizable('.grid-stack-item:not([gs-id=item-news])', false);
				
			  //  console.log("!!!>!!!>>!!>>>>>>>>>>사용자 컨텐츠 모두 로드성공<<<<<<<<<<<<!!");
				
			}).catch(function(error) {
			    console.error("사용자 컨텐츠 로드 실패", error);
			});
			
		} else {
			/////////포틀릿을 저장한 상태일 때
			
			////추가되는 콘텐츠에 이벤트 바인드
			grid.on('added', function(event, items) {
				if(gport.portlet_draw_flag){
					//로딩상태 콘텐츠 제거
					$("#portlet_loading").remove();
					
					items.forEach(function(item) {
						
					////////// 뉴스 //////////
						if(item.id === "item-news"){
							gport.news_data_load();
						}
					////////// 결재 //////////
						if(item.id === "item-appr"){
							gport.approval_data_load();
						}
					////////// 오늘일정 //////////
						if(item.id === "item-schedule"){
							gport.schedule_data_load();
						}
					////////// 나의연차 //////////
						if(item.id === "item-holiday"){
							gport.holiday_data_load();
						}
					////////// 메일 //////////
						if(item.id === "item-mail"){
							gport.mail_data_load();
						}
					////////// 게시판 //////////
						if(item.id === "item-board"){
							gport.board_data_load();
						}
					////////// 직원조회 //////////
						if(item.id === "item-emp_search"){
							gport.emp_search_box_draw();
						}
					////////// 채팅방 //////////
						if(item.id === "item-chat"){
							gport.chat_data_load();
						}
					////////// 즐겨찾는 APP //////////
						if(item.id === "item-bookmark_app"){
							gport.bookmark_data_load();
						}
					////////// 설문조사 //////////
						if(item.id === "item-survey"){
							gport.survey_data_load()
						}
					////////// 날씨 //////////
						if(item.id === "item-weather"){
							
							var item = "";
					
							item +=	"<div id='weather_box' class='content_item' idx='1'>";
							item +=		"<div class='content_title_wrap'><h4 class='content_title'>날씨 정보</h4><button type='button' id='btn_weather_refresh' class='btn btn_refresh'></button></div>";
							item +=		"<div id='weather_wait'><div class='loading_icon'></div><span>날씨 정보를 불러오는 중...</span></div>";
				        	item +=	"</div>";
							
							$("[gs-id=item-weather] .grid-stack-item-content").find(".content_item").remove();
							$("[gs-id=item-weather] .grid-stack-item-content").append(item);
							$("[gs-id=item-weather]").hide();
							
							gport.getCurrentPosition().then(function(data){
								$("[gs-id=item-weather]").show();
								
								// data = 위치좌표, 좌표에 해당하는 장소 데이터
								return gport.weather_data_load(data, "");
							});
						}
						
					});
					
					gport.portlet_draw_flag = false;
				}
			});
				

			/// 포틀릿 레이아웃 정보를 가져온다.
			gport.main_layout_load();
			
			// 포틀릿이 불러와지면 표시
			$("#content_container").addClass("block");
			
			grid.movable('.grid-stack-item:not([gs-id=item-news])', false);
			grid.resizable('.grid-stack-item:not([gs-id=item-news])', false);
		}
		
	},
	
	//메인 포틀릿 컨테이너를 그리드 레이아웃으로 반환해주는 함수
	"main_grid_init": function(){
		
		var col2_w = 1539; // 포틀릿이 2열로 표시될 때의 브라우저 너비
		
		var grid = GridStack.init({
			margin: '8px',
			columnOpts: {
				layout: "compact",
				float: true,
				acceptWidgets: function(el) { return true },
				breakpointForWindow: true,	// 기준점을 브라우저 해상도 너비크기로 잡는다. false 일 경우 포틀릿 컨테이너("#content_container")의 너비를 기준점으로 잡음.
				breakpoints: [
					{ w: col2_w, c: 8 },
					{ w: 1600, c: 12 }
				]
			}
		});
		
		///dragstop
		grid.on('dragstart drag', function(e){
			
			var trg = $(e.target);
			
			$("#area_right").off().on("mousewheel", function(e, delta){
				
				$("#area_right").css({
					"scroll-behavior" : "smooth"
				});
				
				if(delta > 0) {
					/// 위로 스크롤 했을 때
					window.scrollTo({
						top : $("#area_right")[0].scrollTop -= trg.outerHeight() - 100,
						behavior: "smooth"
					});
					//$("#area_right")[0].scrollTop -= trg.outerHeight() - 100;
					
				} else if (delta < 0){
					/// 아래로 스크롤 했을 때
					window.scrollTo({
						top : $("#area_right")[0].scrollTop += trg.outerHeight() - 100,
						behavior: "smooth"
					});
				}
				
				$("#area_right").css({
					"scroll-behavior" : "auto"
				});
				
			});
			
		}).on('dragstop', function(event, el) {
			
			$(el).find(".item_mask").animate({
			    "background-color": "#518dcf"
			}, 200, 
				function() {
					$(el).find(".item_mask").animate({
						"background-color": "rgba(255,255,255, 0.7)"
					});
				}
			);
		/*	
			//빈 공간 채우기 체크되어있을 때
			if($("#portlet_sort").prop("checked")){
				grid.compact();
			}*/
			
			grid.compact();
			
			$("#area_right").off("mousewheel");
		});
		
		/// 포틀릿의 위치나 크기가 변할 때
		grid.on('change', function(event, el){
			//// item-news가 왼쪽 최상단에 위치하지 않을 때
			var news_pos_chk = $("[gs-id=item-news]").attr("gs-x") !== "0" || $("[gs-id=item-news]").attr("gs-y") !== "0";
			
			if(news_pos_chk) {
				///// item-news은 항상 왼쪽 상단 고정
				grid.update("[gs-id=item-news]",{
					x: 0,
					y: 0
				});
			}
		});
		
		if(grid !== null){
			return grid;
		}
	},
	
	//메인 레이아웃 위치 저장하는 함수
	"main_layout_save": function(){
		
		var save_data = GridStack.init().save();
		
		for(var i = 0; i < save_data.length; i++){
			/// html 제거
			delete save_data[i].content;
		}
		
		var surl = gap.channelserver + "/save_person_portlet.km";
		var postData = JSON.stringify({
			"ky" : gap.userinfo.rinfo.ky,
			"position" : save_data
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
					// do nothing...
					
					gport.main_layout_load();
				//	console.log(">>>>>>> 포틀릿 저장--성공--");
				} else {
					console.log(">>>>>>> 포틀릿 저장--실패--");
				}
			},
			error : function(e){
			}
		});			
	},
	
	//저장된 메인 레이아웃 위치 불러오는 함수
    "main_layout_load": function() {
		
		gport.portlet_draw_flag = true;
		
		//로딩아이콘 제거
		$("#portlet_loading").remove();
		
		var _self = this;
		var grid = gport.main_grid_init();
		
		var surl = gap.channelserver + "/portlet_person_list_portal.km";
		var postData = JSON.stringify({});
		$.ajax({
			type : "POST",
			url : surl,
			dataType : "json",
			data : postData,
			cache : false,
			async : false,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.data && res.data.position){
					_self.main_item_position = res.data.position;
				}
			},
			error : function(e){
			}
		});
		
		var itemPos = _self.main_item_position;
		
		if(itemPos != ""){
			grid.removeWidget();
			GridStack.init().load(itemPos);
			
			$("#app_area, .input_folder_name, #folder_title_btn_wrap, .item_mask").remove();
	        $(".user_folder_title, #btn_folder_setting").show();
			$(".personal_box").show();
		}
		$("#content_container .item_mask").remove();
		
		grid.compact();
		
		/*
		var col2_w = 1539;
		
		if($(window).width() <= col2_w){
		//////// 3열 -> 2열 ///////
			//GridStack.init().opts.columnOpts.layout = "moveScale";
			grid.compact();
			
		} else {
			grid.compact();
		//////// 2열 -> 3열 ///////
			//GridStack.init().opts.columnOpts.layout = "compact";
		}
		*/
		
		grid.movable('.grid-stack-item:not([gs-id=item-news])', false);

    },
	
	"news_data_load": function(flag){
		var _self = this;
		
		return new Promise(function(resolve, reject) {
		
			$.ajax({
				type: "GET",
				url: root_path +  "/resource/data/news_data.txt",
				dataType: "json",
				success: function(data){

					var item = "";
					
					item += "<div id='news_box' class='content_item stamp' idx='-1'>";
					item += "	<div class='new_wrap_container'>";
					
					for(var i = 0; i < data.length; i++){
						item += "	<div class='news_wrap'><div class='news_img' style='background-image: url(" + data[i].img + ")'></div>";
						item += "		<div class='news_title_wrap'>";
						item += "			<div class='date'><span>" + data[i].title + "</span></div>";
						item += "			<div class='title'>" + data[i].desc + "</div>";
						item += "		</div>";
						item += "	</div>";
					}
					
					item += "	</div>";
					item += "	<div class='btn_wrap'>";
					item += "		<button type='button' class='btn_prev'><span class='prev_btn'></span></button>";
					item += "		<button type='button' class='btn_next'><span class='next_btn'></span></button>";
					item += "	</div>";
					
					item += "	<div class='dot_wrap'>";
					
					for(var i = 0; i < data.length; i++){
						if(i === 0){
                            item += "<span class='page_dot active'></span>";
						} else {
							item += "<span class='page_dot'></span>";
						}
					}
					
					item += "	</div>";
					item += "</div>";


					var item_id = "item-news";
					
					if( flag === "init" ){
						//뉴스 데이터는 고정(stamp)
						item = { w: 4, h: 5, id: item_id, content: item, x: 0, y: 0, locked: true, noResize: true, noMove: true }
						GridStack.init().addWidget(item);
						
					} else {
						$("[gs-id=" + item_id + "] .grid-stack-item-content").find(".content_item").remove();
						$("[gs-id=" + item_id + "] .grid-stack-item-content").append(item);
					}
					
					//뉴스콘텐츠 마우스 이벤트
			        $("#news_box").on("mouseenter", function(){
			            $(this).children(".btn_wrap").fadeIn(150);
			        });
			        $("#news_box").on("mouseleave", function(){
			            $(this).children(".btn_wrap").fadeOut(150);
		       		});
	
					var count = 0; //배너 이전/다음버튼 클릭 횟수
					var animate_speed = 200; //애니메이트 속도
					
					//캐러셀 배너 이전버튼
					$("#news_box .btn_prev").on("click", function(){
						
						$("#news_box .btn_next").show();
						
						if(count > 0){
							count -= 1;
						}
						if(count === 0){ //첫번쨰 배너일때는 이전버튼을 숨긴다.
							$("#news_box .btn_prev").hide();
						}
						
						$(".page_dot").removeClass("active");
						$(".page_dot").eq(count).addClass("active");
						
						$(".new_wrap_container").animate({
							"margin-left": -($(".content_item").outerWidth() * count)
						}, animate_speed);
						
					});
					//캐러셀 배너 다음버튼
					$("#news_box .btn_next").on("click", function(){
						
						$("#news_box .btn_prev").show();
						
						if(count < $(".page_dot").length - 1){
							count += 1;
						}
						if(count === $(".page_dot").length - 1){ //마지막 배너일때는 다음버튼을 숨긴다.
							$("#news_box .btn_next").hide();
						}
						
						$(".page_dot").removeClass("active");
						$(".page_dot").eq(count).addClass("active");
						
						$(".new_wrap_container").animate({
							"margin-left": - ($(".content_item").outerWidth() * count)
						}, animate_speed);
						
					});
					
					//페이지 버튼(점)
					$(".page_dot").on("click", function(){
						
						$(this).siblings().removeClass("active");
						$(this).addClass("active");
						
						count = $(this).index(); //현재 클릭한 페이지 버튼이 몇번째인지
						
						if(count === 0){ //첫번쨰 배너일때는 이전버튼을 숨긴다.
							$("#news_box .btn_prev").hide();
							$("#news_box .btn_next").show();
						}
						if(count !== 0 && count !== $(".page_dot").length - 1){ ////첫번쨰 배너, 마지막 배너가 아닐 때는 이전/다음을 모두 표시한다.
							$("#news_box .btn_prev").show();
							$("#news_box .btn_next").show();
						}
						if(count === $(".page_dot").length - 1){ //마지막 배너일때 다음버튼을 숨긴다.
							$("#news_box .btn_prev").show();
							$("#news_box .btn_next").hide();
						}
						
						//console.log($(this).index());
						//console.log($(".content_item").outerWidth());
						
						$(".new_wrap_container").animate({
							"margin-left": - ($(".content_item").outerWidth() * count)
						}, animate_speed);
						
					});
	
				//	console.log(">>>>>>>>> 뉴스 데이터 로드 성공");
					resolve(item);
				},
				error: function(xhr, error){
					console.log(error);
					reject(error);
				}
			});
		});
		
	},
	
	//결재문서 데이터 불러오는 함수
	"approval_data_load": function(flag){
		var _self = this;
		
		return new Promise(function(resolve, reject) {
		
			$.ajax({
				type: "GET",
				url: location.protocol + "//" + window.mailserver + "/" + window.aprvdbpath + "/getAprvStatusCount?open&owner=" + gap.userinfo.rinfo.ky,
				xhrFields : {
					withCredentials : true
				},
				cache: false,
			//	dataType: "json",
				success: function(data){
					
					var item = "";
					item += "<div id='approval_box' class='content_item' app='approval' idx='0'>";
					item += "	<div style='overflow: hidden;margin-bottom: 16px;display: flex;flex-direction: column;height: 100%;'>";
					//item += "		<div class='content_title_wrap'><h4 class='content_title'>" + gap.lang.aprv + "</h4><button type='button' class='btn arrow_right'></button></div>";
					item += "		<div class='content_title_wrap'><h4 class='content_title'>" + gap.lang.aprv + "</h4></div>";
					item += "		<div class='list_wrap'>";
					item += "			<div id='approval_category' class='category_wrap'></div>";
					item += "			<div id='approval_ul' class='doc_ul'></div>";
					item += "		</div>";
					item += "	</div>";
					item += "	<div class='btn_wrap'>";
					item += "		<button type='button' class='btn_white' id='btn_aprv_view_all'><span>" + gap.lang.expand + "</span></button>";
					item += "		<button type='button' class='btn_blue' id='btn_aprv_compose'><span>" + gap.lang.compose_doc + "</span></button>";
					item += "	</div>";
					item += "</div>";

					
					var item_id = "item-appr";
					
					if( flag === "init" ){
						item = { w: 4,  h: 5, id: item_id, content: item, x: 4, y: 0 }					
	               	 	GridStack.init().addWidget(item);
					} else {
						$("[gs-id=" + item_id + "] .grid-stack-item-content").find(".content_item").remove();
						$("[gs-id=" + item_id + "] .grid-stack-item-content").append(item);
					}
					
					if(flag === 'add'){
						item = { w: 4,  h: 5, id: item_id, content: item, noResize: true }
						//item = { w: 4,  h: 5, id: item_id, content: item }
						GridStack.init().addWidget(item);
						
		            	gport.portlet_mask_draw(item_id);
		            }
					
					
					//////// event ////////
					
					// 폴더아이템 제거 버튼
					$(".btn_item_delete").on("click", function(){
						//제거하려는 아이템
						var item = $(this).closest(".content_item");
						//제거하려는 아이템의 키
						var key = item.attr("app");
						
						$(this).closest(".item_mask").remove();
						$("#content_container").packery('remove', item).packery('layout');
						$(".app_box[key='" + key + "']").removeClass("select");
					});
					
					var approval_show_length = 8; //메인에서 보여질 갯수
					var category = '';
					
					var wait = data.wait ? data.wait : 0;
					var progress = data.progress ? data.progress : 0;
					var reject = data.reject ? data.reject : 0;
					var complete = data.complete ? data.complete : 0;
					
					category += "<li class='category category_approval wait active' id='tab_aprv_wait' title='" + gap.lang.wait + "'><span class='category_name'>" + gap.lang.wait + "</span><span class='doc_count'>" + wait + "</span></li>";
					category += "<li class='category category_approval progress' id='tab_aprv_progress' title='" + gap.lang.doing + "'><span class='category_name'>" + gap.lang.doing + "</span><span class='doc_count'>" + progress + "</span></li>";
					category += "<li class='category category_approval reject' id='tab_aprv_reject' title='" + gap.lang.reject + "'><span class='category_name'>" + gap.lang.reject + "</span><span class='doc_count'>" + reject + "</span></li>";
					category += "<li class='category category_approval complete' id='tab_aprv_complete' title='" + gap.lang.done + "'><span class='category_name'>" + gap.lang.done + "</span><span class='doc_count'>" + complete + "</span></li>";
					
					$("#approval_category").append(category);
					$(".category_approval").on("click", function(){
					
						$(this).siblings().removeClass("active");
						$(this).addClass("active");
						
						var cate = $(this).attr("id").replace("tab_aprv_", "");
						
						$.ajax({
							type : "GET",
							url : location.protocol + "//" + window.mailserver + "/" + window.aprvdbpath + "/api/data/collections/name/vwAprvList_" + cate + "_EmpNo?restapi&category=" + gap.userinfo.rinfo.ky + "&start=0&ps=10&entrycount=false",
							xhrFields : {
								withCredentials : true
							},
							cache: false,			
						//	dataType : "json",
							success : function(res){
								$('#approval_ul').empty();
								var data_cnt = res.length;
								
								if (res.indexOf("/domcfg.nsf/") == -1){
									for(var i = 0; i < res.length; i++){	
										var unid = res[i]['@unid'];
										if (unid && unid != ""){
											var href = res[i]['@link']['href'];
											var link = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + href.replace('api/data/documents/unid', '0') + '?opendocument&viewname=vwAprvList_' + cate + '&opentype=popup&calloption=search';
											var title = res[i].title;
											var createddate = res[i].createdDate;
											var authorinfo = res[i].writerinfo;
											var aprv_data = {
												"unid" : unid,
												"title" : title,
												"link" : link
											}
											var html = '';
											html += "<li class='doc_li approval_li' id='" + unid + "' title='" + title + "'>";
											html += "<span class='item_title'>" + title + "</span>";
											html += "<div class='item_writer_wrap'>";
											html += "<span class='item_writer'>" + authorinfo + "</span>";
											html += "<span> · </span>";
											html += "<span class='item_date'>" + moment.utc(createddate).local().format('YYYY-MM-DD') + "</span>";
											html += "</div>";
											html += "</li>";
											
											$('#approval_ul').append(html);
											$('#' + unid).data('info', aprv_data);
											$('#' + unid).data('link', link);
										}
									}
								}else{
									data_cnt = 0;
								}
								
								//해당 카테고리의 결재문서가 없을 때
								if(data_cnt === 0){
									var html2 = "<div class='null_doc'><span>" + gap.lang.no_aprv_doc + "</span></div>";
									$('#approval_ul').append(html2);
								}
								
								// 제목 클릭
								$(".approval_li").off().on('click', function(){
									var _id = $(this).attr('id');
									var _link = $('#' + _id).data('link');
									var _url = _link;
									gap.open_subwin(_url, "1200","900", "yes" , "", "yes");
								});
								
								// 버튼 클릭
								$("#btn_aprv_view_all").off().on('click', function(){
									var aprv_domain = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + window.aprvdbpath;
									var url = aprv_domain + "/FrameApproval?openform";
									window.open(url, "", "");
								});
								
								$("#btn_aprv_compose").off().on('click', function(){
									var aprv_domain = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + window.aprvdbpath;
									var url = aprv_domain + "/FrameApproval?openform";
									window.open(url, "", "");
								});								
							},
							error : function(e){
								gap.gAlert(gap.lang.errormsg);
								return false;
							}
						});
	                });
					
					$(".category_approval.wait").click();
					
				//	console.log(">>>>>>>>> 결재문서 데이터 로드 성공");
					
					resolve(item);
				},
				error: function(xhr, error){
					console.log(error);
					reject(error);
				}
			});
		});
	},	
	
	//날씨 데이터 불러오는 함수
	"weather_data_load": function(coord_data, flag){
		
		var _self = this;
		
		return new Promise(function(resolve, reject) {
			
			//현재위치 좌표, 지역 데이터
			//console.log(coord_data);
			
			var coords = coord_data[0];
			
			//현재위치 격자좌표
			var gridX = coords.x;
			var gridY = coords.y;
			
			var today = new Date().getFullYear() + gcom.addZero(new Date().getMonth()+1) + gcom.addZero(new Date().getDate());
			//var yesterday = new Date().getFullYear() + gcom.addZero(new Date().getMonth()+1) + gcom.addZero(new Date().getDate() - 1);
			
			var time = new Date().getHours() + gcom.addZero(new Date().getMinutes());
			
			time = gcom.getCurrentHour();
			
			
			var url = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst'; /*URL*/
		
			var service_key = "fGpAn9315HOhU7BC4dKUpBMGHXdMoQySEajyzLn6xfkwt9QiyCkCTPexAg%2Bh8IlYMTciuKKGFXXaQ0EcRooZhQ%3D%3D";
			
			var queryParams = '?' + encodeURIComponent('serviceKey') + '='+ service_key;
			queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1');
			queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1000');
			
			queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('JSON');
			queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(today);
			queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(time);
			queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(gridX);
			queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(gridY);
			
			/*
			//// 6초가 지난 상태에서 재호출해서 응답을 받았을 때 성공했을 때 timeout 해제하기 위한 변수
			var success_chk = false;
			*/
			
			///////// 날씨 데이터 가져오기 실패했을 때 HTML
			var reject_html = "";
			
			reject_html += 	"<div id='weather_reject'>";
			reject_html +=		"<span>날씨정보를 불러오는데 실패했습니다. <br>잠시후 다시 새로고침 해주세요.</span>";
			reject_html +=	"</div>";
			/*
			var startTime = Date.now();
	        var timeoutId = setTimeout(function () {
		
				if(success_chk){// 응답을 받았다면 타이머 해제
					clearTimeout(timeoutId);
				}

				// 이 함수가 호출될 때 마다 재시도 횟수 감소, 
				gport.weather_retry_cnt = gport.weather_retry_cnt - 1;
				
	       //     console.log("6초 초과! 날씨 API 재호출");

				if (gport.weather_retry_cnt > 1) {
					gport.weather_data_load(coord_data);
	            } else {
					/// 3번의 재호출에도 응답이 실패했을 때
					clearTimeout(timeoutId);
					
					$("#weather_wait").remove();
					$("#weather_box .weather_info_wrap").remove();
					
					if( $("#weather_reject").length === 0 ){							
						$("#weather_box").append(reject_html);
					}
					
				//	console.log(">>>>>>> 데이터를 가져오기위해 3번의 호출을 했지만 날씨 정보를 가져오는데 실패했습니다.");
				//	console.log(">>>>>> 잠시후 다시 새로고침 해주세요.");
					
					/// 데이터 요청 가능 재시도 횟수 초기화
					gport.weather_retry_cnt = 3;
					
					return;
				}

	        }, 6000); // 6초 초과시 호출 재시도
*/
			$.ajax({
	            type: "GET",
	            //url: "./resource/data/weather_data.txt",
				url: url + queryParams,
				//dataType: "json",
	            success: function(data){
					/*
                	var elapsedTime = Date.now() - startTime;
				//	console.log("응답 시간: " + elapsedTime + "ms");
					*/
					var data = data.response;
					
					//데이터를 정상적으로 가져왔을 때
					if(data !== undefined && data.header.resultCode === "00"){
						/*success_chk = true;
						clearTimeout(timeoutId);
						
						if( gport.weather_retry_cnt < 2 ) {
							return;
						}*/
						
						data = data.body.items.item;
						var ﻿current_data = "";
						
						var tmp = ""; //기온
						var sky = ""; //하늘상태
						var pty = ""; // 비, 눈
						var ﻿reh = ""; //습도
						var ﻿vec = ""; //풍향 각도
						var wsd = ""; //풍속
						
						for(var i = 0; i < data.length; i++){
							
							//현재시각에 근접하는 가장 최근 데이터
							current_data = gcom.findClosestTime(data, data[i].baseTime).fcstTime;
	
							if(data[i].fcstTime === current_data){
								
								if(data[i].category === "T1H"){
									tmp = data[i].fcstValue;
								}
								if(data[i].category === "SKY"){
									sky = data[i].fcstValue;
								}
								if(data[i].category === "PTY"){
									pty = data[i].fcstValue;	
								}
								if(data[i].category === "REH"){
									reh = data[i].fcstValue;
								}
								if(data[i].category === "VEC"){
									vec = data[i].fcstValue;
								}
								if(data[i].category === "WSD"){
									wsd = data[i].fcstValue;
								}
							}
						}
						
						var sky_state = "";
						
						///// 눈 또는 비가 내리는 체크 변수
						var chk_rain_snow = pty === "1" || pty === "2" || pty === "3"
						
						////// 눈이나 비가 내릴 때
						if(chk_rain_snow){
							if(pty === "1"){
								/// 비
								sky = "rain";
								sky_state = "비";
							}
							if(pty === "2"){
								/// 눈과 비가 같이 올 때
								sky = "snow_and_rain";
								sky_state = "눈, 비";
							}
							if(pty === "3"){
								/// 눈
								sky = "snow";
								sky_state = "눈";
							}
							if(pty === "4"){
								/// 소나기
								sky = "rain";
								sky_state = "소나기";
							}
						} else {
							////// 눈이나 비가 내릴 때가 아니면 구름상태를 표시
							if(sky < 4) {
								sky = "sun";
								sky_state = "맑음";
							} else if(sky < 8) {
								sky = "cloudy";
								sky_state = "구름 많음";
							} else {
								sky = "fog";
								sky_state = "흐림";
							}
						}
	
						var wci = gcom.calculateWindChill(tmp, wsd); //체감온도
						
						var wind_direction = ""; //풍향 각도를 텍스트로 변환할 변수
						
						//vec = 풍향 각도
						if ( vec < 90 ) {
							wind_direction = "북동";
						}
						if ( vec === 90 ) {
							wind_direction = "동";
						}
						if ( vec > 90 && vec < 180 ) {
							wind_direction = "남동";
						}
						if ( vec === 180 ) {
							wind_direction = "남";
						}
						if ( vec > 180 && vec < 270 ) {
							wind_direction = "남서";
						}
						if ( vec === 270 ) {
							wind_direction = "서";
						}
						if ( vec > 270 && vec < 360 ) {
							wind_direction = "북서";
						}
						if ( vec === 360 ) {
							wind_direction = "북";
						}
						
						var city = "null";
						var town = "null";
						
						if(coord_data[1] !== null){
							
							var region_data = coord_data[1];
							
							/// 서울특별시
							//city = region_data.area1.name;
							
							// 서울
							city = region_data.area1.alias;
							
							town = region_data.area3.name;
							
							/*var region_data = coord_data[1];
							city = region_data.structure.level1;
							town = region_data.structure.level4L;*/
						}
						
						
						
		                var item = "";
	
						item += "<div class='content_title_wrap'><h4 class='content_title'>날씨 정보</h4><button type='button' id='btn_weather_refresh' class='btn btn_refresh'></button></div>";
						
						item += "<div class='weather_info_wrap'>";
						item +=		"<div class='weather_info_top'>";
						item += 		"<div class='loacation_wrap'>";
				        item +=         	"<div class='location_img'></div>";
						item += 			"<div class='location_info_box'>";
						item += 				"<div class='city'>" + city + "</div>/<div class='town'>" + region_data.area2.name + " " + town + "</div>";
						item += 			"</div>";
			            item +=  		"</div>";
				        item +=			"<div class='weather_info'>";
				        item +=				"<div class='weather'>";
				        item +=					"<div class='weather_img' style='background-image: url(../resource/images/weather/" + sky + ".svg)'></div>";
				        item +=					"<div class='temperatures'>" + tmp + "°</div>";
				        item +=				"</div>";
	                    item +=				"<div class='weather_desc'>";
						item +=					"<div>" + sky_state + "</div>";
						//item +=					"<div>어제보다 약 ??° 높아요!</div>";
				        item += 	        "</div>";
	                 	item +=			"</div>";
						item +=		"</div>";
			            item +=		"<div class='detail_info'>";
			            item +=			"<div class= 'detail_box'>";
			            item +=				"<div class='detail_title'>체감</div>";
			            item +=				"<div class='detail_data'>" + wci + "°</div>";
			            item +=			"</div>";
			            item +=			"<div class='detail_box'>";
			            item +=				"<div class='detail_title'>습도</div>";
	                    item +=				"<div class='detail_data'>" + reh + "%</div>";
			            item +=			"</div>";
			            item +=			"<div class='detail_box'>";
			            item +=				"<div class='detail_title'>바람(" + wind_direction + "풍)</div>";
			            item +=				"<div class='detail_data'>" + wsd + "m/s</div>";
			            item +=			"</div>";
			            item +=		"</div>";
						item +=	"</div>";
		                
		                $("#weather_box").empty();
						$("#weather_box").append(item);
						
		          //      console.log(">>>>>>>>> 날씨정보 데이터 로드 성공");
						resolve(item);
						
					} else {
						///////// 날씨 데이터 가져오기 실패했을 때
						
	                	$("#weather_wait").remove();
						$("#weather_box .weather_info_wrap").remove();
						
						if( $("#weather_reject").length === 0 ){							
							$("#weather_box").append(reject_html);
						}
						
					//	console.log("날씨 정보를 가져오는데 실패했습니다.");
						
						gport.weather_retry_cnt = 3;

					}
					
					var item_id = "item-weather";
						
					if(flag === 'add'){
						var item =	"<div id='weather_box' class='content_item' idx='1'>" + item + "</div>";
						
						item = { w: 4,  h: 3, id: item_id, content: item, noResize: true }
						
						if($("#weather_box").length === 0){
							GridStack.init().addWidget(item);
						}
		            	gport.portlet_mask_draw(item_id);
		            }
					
					/// event
					
					//날씨 새로고침 버튼
					$("#btn_weather_refresh").off().on("click", function(){
						var text = "<div id='weather_wait'><div class='loading_icon'></div><span>날씨 정보를 불러오는 중...</span></div>";;
						$("#weather_box .weather_info_wrap").remove();
						$("#weather_reject").remove();
						
						if($("#weather_wait").length === 0){
							$("#weather_box").append(text);
						}
						
						gport.getCurrentPosition().then(function(data){	
							// data = 위치좌표, 좌표에 해당하는 장소 데이터
							//return gport.weather_data_load(data, "refresh");

							return gport.weather_data_load(coord_data, "");
							
						});
						
					});

	            },
	            error: function(xhr, error){
                	console.error("API 요청 실패:", error);
					reject(error);
	            }
	        });
				
			

		});

	},
	/*
	//날씨 데이터 불러오는 함수
	"weather_data_load_backup": function(){
		var _self = this;
		
		return new Promise(function(resolve, reject) {
			
			$.ajax({
	            type: "GET",
	            url: "./resource/data/" + (userlang == "ko" ? "weather_data.txt" : "weather_data_en.txt"),
	            dataType: "json",
	            success: function(data){
	                
	                var item = `
	                	<div id='weather_box' class='content_item' idx='1'>
	                        <div class='content_title_wrap'><h4 class='content_title'>${gap.lang.weather_info}</h4><button type='button' class='btn btn_refresh'></button></div>
	               		</div>
	                `;
	                
	                $("#content_container").append(item);
	                
	                var html = '';
	
	                html = `
	                    <div class='weather_info_wrap'>
							<div class='weather_info_top'>
			                    <div class='loacation_wrap'>
			                        <div class='location_img'></div>
									<div class='location_info_box'>
										<div class='city'>${data[0].location.city}</div>/<div class='town'>${data[0].location.town}</div>
									</div>
			                    </div>
			                    <div class='weather_info'>
			                        <div class='weather'>
			                            <div class='weather_img' style='background-image: url(${data[0].sky.img})'></div>
			                            <div class='temperatures'>${data[0].temperature.now}°</div>
			                        </div>
			                        <div class='weather_desc'>
			                            <div>${data[0].sky.status}</div>`
			                            if(Math.ceil(data[0].temperature.now - data[0].temperature.yesterday) > 0){
			                                html += `<div>어제보다 약 ${Math.abs(Math.ceil(data[0].temperature.now - data[0].temperature.yesterday))}° 높아요!</div>`;
			                            } else {
			                                html += `<div>어제보다 약 ${Math.abs(Math.ceil(data[0].temperature.now - data[0].temperature.yesterday))}° 낮아요!</div>`;
			                            }
			                        html += `</div>
			                    </div>
							</div>
		                    <div class='detail_info'>
		                        <div class='detail_box'>
		                            <div class='detail_title'>체감</div>
		                            <div class='detail_data'>${data[0].temperature.perceived}°</div>
		                        </div>
		                        <div class='detail_box'>
		                            <div class='detail_title'>습도</div>
		                            <div class='detail_data'>${data[0].humidity}%</div>
		                        </div>
		                        <div class='detail_box'>
		                            <div class='detail_title'>바람(${data[0].wind.direction})</div>
		                            <div class='detail_data'>${data[0].wind.speed}m/s</div>
		                        </div>
		                    </div>
	                `;
	                
	                $("#weather_box").append(html);
	                
	           //     console.log(">>>>>>>>> 날씨정보 데이터 로드 성공");
					resolve(item);
	            },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });
		});
		
	},
	*/
	
	//메일 데이터 불러오는 함수
	"mail_data_load": function(flag){
		var _self = this;
		
		return new Promise(function(resolve, reject) {
			$.ajax({
				type: "GET",
				url: location.protocol + "//" + window.mailserver + "/" + window.maildbpath + "/getMailCount?open",
				xhrFields : {
					withCredentials : true
				},
				dataType: "json",
	            success: function(data){
					
					var item = "";
					item += "<div id='mail_box' class='content_item' app='mail' idx='2'>";
					item += "	<div class='content_title_wrap'><h4 class='content_title'>" + gap.lang.mail + "</h4></div>";
					item += "	<div style='overflow: hidden; flex: 1; margin-bottom: 16px;'>";
					item += "		<div class='list_wrap'>";
					item += "			<div id='mail_category' class='category_wrap'></div>";
					item += "			<div id='mail_ul' class='msg_ul'></div>";
					item += "		</div>";
					item += "	</div>";
					item += "	<div class='btn_wrap'>";
					item += "		<button type='button' class='btn_white' id='btn_mail_view_all'><span>" + gap.lang.expand + "</span></button>";
					item += "		<button type='button' class='btn_blue' id='btn_mail_compose'><span>" + gap.lang.create_mail + "</span></button>";
					item += "	</div>";
					item += "</div>";
					
					var item_id = "item-mail";
					
					item = $.trim(item).replaceAll("\n\t", "");
					
					
					if( flag === "init" ){
						item = { w: 4,  h: 5, id: item_id, content: item }
						GridStack.init().addWidget(item);
					} else {
						$("[gs-id=" + item_id + "] .grid-stack-item-content").find(".content_item").remove();
						$("[gs-id=" + item_id + "] .grid-stack-item-content").append(item);
					}
					
					
			/////////// 앱 추가 /////////////
					if(flag === 'add'){
						item = { w: 4,  h: 5, id: item_id, content: item, noResize: true }
						GridStack.init().addWidget(item);
						
		            	gport.portlet_mask_draw(item_id);
		            }
					
					
					//////////// event
					// 폴더아이템 제거 버튼
					$(".btn_item_delete").on("click", function(){
						//제거하려는 아이템
						var item = $(this).closest(".content_item");
						//제거하려는 아이템의 키
						var key = item.attr("app");
						
						$(this).closest(".item_mask").remove();
						$("#content_container").packery('remove', item).packery('layout');
						
						$(".app_box[key='" + key + "']").removeClass("select");
					});
					
					var category = '';
					var inbox_unread = data.inbox_unread ? data.inbox_unread : 0;
					var inbox = data.inbox ? data.inbox : 0;
					
					category += "<li class='category category_mail mail_unread unread active' id='tab_mail_inbox_unread'><span class='category_name'>" + gap.lang.unread_mail + "</span><span id='unread_mail_count' class='doc_count'>" + inbox_unread + "</span></li>";
					//category += "<li class='category category_mail mail_all'><span class='category_name'>" + gap.lang.inbox_mail + "</span><span class='doc_count'>" + inbox + "</span></li>";
					category += "<li class='category category_mail mail_all' id='tab_mail_inbox'><span class='category_name'>" + gap.lang.inbox_mail + "</span><span class='doc_count'></span></li>";
					
					$("#mail_category").append(category);
					
					$(".category_mail").on("click", function(){
						
						$(this).siblings().removeClass("active");
						$(this).addClass("active");
						
						var cate = $(this).attr("id").replace("tab_mail_", "");
	
	                    var mail_li = '';
	                    var date = '';

	                    var condition = '';

						$("#mail_ul").scrollTop(0);
						
						//안읽은 메일함 탭
						if( $(this).attr("id") === "tab_mail_inbox_unread" ){
							
							// 카운트를 업데이트 한 후 목록을 그린다.
							_self.update_unread_mail_count($(this));
						} else {
							//받은 메일함 탭 (전체)
							_self.draw_mail_list($(this));
						}
						
	                });

					// 하단 버튼 클릭
					$("#btn_mail_view_all").off().on('click', function(){
						var mail_domain = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + window.maildbpath;
						var url = mail_domain + "/FrameMail?openform";
						window.open(url, "", "");
					});
					
					$("#btn_mail_compose").off().on('click', function(){
						var mail_domain = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + window.maildbpath;
						var url = mail_domain + "/Memo?openform&opentype=popup";
						gap.open_subwin(url, "1200","900", "yes" , "", "yes");
					});	

					_self.draw_mail_list($("#tab_mail_inbox_unread"));
					//$(".category_mail.unread").click();
					
			//		console.log(">>>>>>>>> 메일문서 데이터 로드 성공");
					
					resolve(item);
	            },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
					return;
	            }
	        });

		});
		
	},
	
	
	/// 안읽은 메일 갯수 업데이트 하는 함수
	"update_unread_mail_count" : function(target){
		
		$.ajax({
			type: "GET",
			url: location.protocol + "//" + window.mailserver + "/" + window.maildbpath + "/getMailCount?open",
			xhrFields : {
				withCredentials : true
			},
			dataType: "json",
            success: function(data){
				var unread_count = data.inbox_unread;
				$("#unread_mail_count").html(unread_count);
				
				gport.draw_mail_list(target);
			},
			error: function(xhr, error){
				console.log(error);
			}
		});
		
	},
	
	//// 메일 위젯 목록 그리는 함수
	"draw_mail_list": function(target){

		var cate = target.attr("id").replace("tab_mail_", "");
	
        var mail_li = '';
        var date = '';
        var condition = '';


		var observer;
		var start = 0;
		
		/// 무한스크롤 데이터 로딩 html
		//var loading = "<div id='list_loading'><span class='loading_icon'></span><span>목록 불러오는 중..</span></div>";
		var loading = "<div id='list_loading'><span class='loading_icon'></span></div>";
		
		/// 게시판 데이터 로드
		data_load();
		
		
		function data_load(opt){
			
			$.ajax({
				type : "GET",
				url : location.protocol + "//" + window.mailserver + "/" + window.maildbpath + "/api/data/collections/name/XML_" + cate + "?restapi&&start=" + start + "&ps=10&entrycount=false",
				xhrFields : {
					withCredentials : true
				},				
				dataType : "json",
				beforeSend: function(){
					if( $("#mail_box").find("#list_loading").length === 0 && $("#mail_box .msg_li").length === 0) {
						
						$('#mail_ul').empty();
						//// 페이지를 불러오기 전에 로딩
						$('#mail_ul').append(loading);
					}
				},
				success : function(res){
					
					if(opt !== "add"){
						$('#mail_ul').empty();
					}
					

					if( res.length === 0 ){
						
						if(observer){
							observer.disconnect();
						}
						
						$("#list_loading").remove();
						
						if($("#mail_ul").find(".msg_li").length === 0){
							
							var html = "<div class='null_msg'>" + gap.lang.no_emails + "</div>";
							
							$('#mail_ul').append(html);
						}
						
						return;
						
					} else {
						/// 데이터가 존재하면 start를 10씩 증가시킨다.
						start += 10;
					}

					$("#mail_ul").find(".null_msg").remove();
					$("#list_loading").remove(); // 로딩 제거
					
					if(res.length !== 0){
						
						for(var i = 0; i < res.length; i++){
							var unid = res[i]['@unid'];
							if (unid != ""){
								var href = res[i]['@link']['href'];
								var link = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + href.replace('api/data/documents/unid', 'XML_' + cate) + '?opendocument&viewname=XML_' + cate + '&folderkey=&opentype=popup&relatedyn=N';
								var xsubject = res[i].xsubject;
								var xdate = res[i].xdate;
								var xname = res[i].xname;
								var xsize = res[i].xsize;
								var sizeKB = parseInt(xsize);
								var sizeMB = (sizeKB/1024).toFixed(2);
								if (sizeMB > 0.9) {
									xsize = sizeMB + 'MB';
								} else {
									xsize = sizeKB + 'KB';
								}
								var mail_data = {
									"unid" : unid,
									"title" : xsubject,
									"link" : link
								}
								var html = '';
								
								html += "<li class='msg_li' id='" + unid + "' title='" + xsubject + "'>";
								html += "	<div class='msg_title_wrap'>";
							//	html += "		<div class='sender_img' style='background-image: url(${data[i].img})'></div>";
								html += "		<div class='msg_info'>";
								html += "			<div class='sender_wrap'>";
								html += "				<span class='sender_name'>" + xname.split("-=spl=-")[0] + "</span>";
								html += "				<div class='msg_send_time_wrap'>";
								html += "					<span class='send_time'>" + moment.utc(xdate).local().format('YYYY-MM-DD HH:mm') + "</span>";
								//html += "					<div class='msg_btn_wrap'>";
								//html += "						<button type='button' class='btn btn_bookmark_mail active'></button>";
								//html += "						<button type='button' class='btn btn_mail_remove'></button>";
								//html += "					</div>";
								html += "				</div>";
								html += "			</div>";
								html += "			<div class='item_title_box_wrap'>";
								html += "				<div class='item_title_box'>";
								html += "					<span class='item_title'>" + xsubject + "</span>";
								html +=	"					<span class='mail_size'>" + xsize + "</span>";
								html += "				</div>";
								
								html += "			</div>";
								html += "		</div>";
								html += "	</div>";
								html += "</li>";

								$('#mail_ul').append(html);
								$('#' + unid).data('info', mail_data);
								$('#' + unid).data('link', link);
							}
						}
						
					} else {

						//$("#list_loading").remove();
						var html = "<div class='null_msg'>" + gap.lang.no_emails + "</div>";
						
						$('#mail_ul').append(html);
						
						return false;
					}
					
					
					/********** 무한 스크롤 *********/
					if (observer) {
						// 기존 감지 중지
						observer.disconnect();
					}

					/// observer가 감지할 요소
					var lastItem = $("#mail_ul").find(".msg_li").last()[0];
					if (!lastItem) return;
					
				    observer = new IntersectionObserver(entries => {
					
						///// 마지막 요소가 보여지면 목록 데이터를 불러온다.
				        if (entries[0].isIntersecting) {
							//console.log(">>>>>>>>>>>>>>>메일 새 목록 불러온다.");
							if( $("#chat_ul .null_msg").length === 0 ){								
								$(".null_msg").remove();
							}
							//data_load("add");
							
							if($("#mail_box .msg_li").length > 3){
								data_load("add");
							}
							
				        }

				    }, { root: $("#mail_ul")[0], threshold: 0 } );
				
				    observer.observe(lastItem); // 마지막 요소 감지시 시작

					/********** 무한 스크롤 *********/
					
					
					// 제목 클릭
					$("#mail_box .msg_li").off().on('click', function(){
						var _id = $(this).attr('id');
						var _link = $('#' + _id).data('link');
						var _url = _link;
						gap.open_subwin(_url, "1200","900", "yes" , "", "yes");
						
						// 목록 리로드
						if (cate == "inbox_unread"){
							var inbox_unread = $("#tab_mail_inbox_unread .doc_count").html();
							inbox_unread = parseInt(inbox_unread) - 1;
							if (inbox_unread < 0){
								inbox_unread = 0;
							}
							if (inbox_unread == 0){
								var html = "<div class='null_msg'>" + gap.lang.no_emails + "</div>";
								$('#mail_ul').html(html);											
							}
							$("#tab_mail_inbox_unread .doc_count").html(inbox_unread);
							$(this).remove();
							
						/*	setTimeout(function(){
								$.ajax({
									type: "GET",
									url: location.protocol + "//" + window.mailserver + "/" + window.maildbpath + "/getMailCount?open",
									xhrFields : {
										withCredentials : true
									},
									dataType: "json",
									success: function(data){
										var inbox_unread = data.inbox_unread ? data.inbox_unread : 0;
										$("#tab_mail_inbox_unread .doc_count").html(inbox_unread);
										$(".category_mail.unread").click();													
									},
									error: function(xhr, error){
										console.log(error);
									}
								});
							}, 1000);*/
						}
					});
				},
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
				
			});
			
		}


	},
	
	//나의연차 데이터 불러오는 함수
	"holiday_data_load": function(flag){
		var _self = this;
		
		return new Promise(function(resolve, reject) {
			
			$.ajax({
	            type: "GET",
	            url: root_path +  "/resource/data/" + (userlang == "ko" ? "holiday_data.txt" : "holiday_data_en.txt"),
	            dataType: "json",
	            success: function(data){
	            	
					var item = "";

	            	item += "<div id='holidays_box' class='content_item' idx='3'>";
	                item += 	"<div class='content_title_wrap'><h4 class='content_title'>" + gap.lang.my_annual_leave + "</h4></div>";
					item +=		"<div style='overflow: auto;'>";
	                item +=			"<div class='holiday_info_wrap'>";
					item +=				"<div class='holiday_info'>";
	                item +=					"<div class='remain_title_wrap'><span class='remain_title'>" + gap.lang.remaining_annual_leave + "</span><span class='remain_count'>" + (data[0].all - data[0].used) + gap.lang.day+ "</span></div>";
	                item +=					"<div class='detail_count_wrap'><span class='detail_count_title'>" + gap.lang.accrued_annual_leave + "</span><span class='detail_count'>" + data[0].all + "</span></div>";
	                item +=					"<div class='detail_count_wrap'><span class='detail_count_title'>" + gap.lang.used_annual_leave + "</span><span class='detail_count'>" + data[0].used + "</span></div>";
	                item +=				"</div>";
	                item +=				"<div class='holiday_img'></div>";
					item +=			"</div>";
					item +=		"</div>";
	                item +=		"<div class='btn_wrap'>";
	                item +=			"<button type='button' id='btn_aprv_req' class='btn_blue'><span>" + gap.lang.annual_leave_application + "</span></button>";
	                item +=		"</div>";
	                item +=	"</div>";

	            	var item_id = "item-holiday";

					if( flag === "init" ){
						item = { w: 4,  h: 3, content: item, id: item_id }
						GridStack.init().addWidget(item);
					} else {
						$("[gs-id=" + item_id + "] .grid-stack-item-content").find(".content_item").remove();
						$("[gs-id=" + item_id + "] .grid-stack-item-content").append(item);
					}
					
			/////////// 앱 추가 /////////////
					if(flag === 'add'){
						item = { w: 4,  h: 3, content: item, id: item_id, noResize: true }
						GridStack.init().addWidget(item);
		            	gport.portlet_mask_draw(item_id);
		            }

					// 버튼 클릭
					$("#btn_aprv_req").off().on('click', function(){
						var aprv_domain = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + window.aprvdbpath;
						var url = aprv_domain + "/F2?Openform&opentype=popup&tabtitle=new0";
						gap.open_subwin(url, "1200","900", "yes" , "", "yes");
					});

					resolve(item);
	            },
	            error: function(xhr, error){
	               console.log(error);
					reject(error);
	            }
	        });
		});
	},
	
	//오늘일정 날짜 데이터 불러오는 함수
	"schedule_data_load": function(flag){
		var _self = this;
		
/*		return new Promise(function(resolve, reject) {
			
			$.ajax({
	            type: "GET",
	            url: root_path +  "/resource/data/schedule_data.txt",
	            dataType: "json",
	            success: function(data){
		
					var item = "";
					
					item += "<div id='schedule_box' class='content_item' app='calendar' idx='4'>";
					item += "	<div class='content_title_wrap'>";
					item += "		<h4 class='content_title'>" + gap.lang.today_cal + "</h4>";
					item += "		<button type='button' class='btn arrow_right'></button>";
					item += "	</div>";
					item += "	<div class='calendar_wrap'>";
					item += "		<div id='calendar'></div>";
					item += "		<div id='schedule_info_box'>";
					item += "			<div class='schedule_info_wrap'></div>";
					item += "		</div>";
					item += "	</div>";
					item += "	<div class='btn_wrap'>";
					item += "		<button type='button' class='btn_white'><span>" + gap.lang.expand + "</span></button>";
					item += "		<button type='button' class='btn_blue'><span>" + gap.lang.tab_reg_cal + "</span></button>";
					item += "	</div>";
					item += "</div>";
		        
	

			        var item_id = "item-schedule";
						
					item = $.trim(item).replaceAll("\n\t", "");
					
					if( flag === "init" ){
						item = { w: 4,  h: 6, content: item, id: item_id }
						GridStack.init().addWidget(item);
					} else {
						$("[gs-id=" + item_id + "] .grid-stack-item-content").find(".content_item").remove();
						$("[gs-id=" + item_id + "] .grid-stack-item-content").append(item);
					}
					
			/////////// 앱 추가 /////////////
					if(flag === 'add'){
						item = { w: 4,  h: 6, content: item, id: item_id, noResize: true }
						GridStack.init().addWidget(item);
						
		            	gport.portlet_mask_draw(item_id);
		            }
					
					/////////// 달력 초기화 ///////////////
					var today_time = new Date().setHours(0, 0, 0, 0); // 오늘 날짜의 시간(0시 0분 0초)		
				
					var data = data;
					
				    $("#calendar").mobiscroll().datepicker({
				        controls: ['calendar'],
				        display: 'inline',
				        touchUI: true,
				        locale: mobiscroll.localeKo,
				        defaultSelection: new Date(),
				        renderCalendarHeader: function () {
				            return '<div mbsc-calendar-prev class="custom-prev"></div>' +
				                '<div mbsc-calendar-nav class="custom-nav"></div>' +
				                '<div mbsc-calendar-next class="custom-next"></div>';
				        },
				        onCellClick: function(e, inst){
				            var select_date = inst._lastSelected; // 선택한 날짜
				            _self.datepicker_event(select_date, today_time, data);
				        },
				        onPageLoaded: function (e, inst) {
				            var select_date = new Date(inst._active); // 선택한 날짜
				            _self.datepicker_event(select_date, today_time, data);
				            
				        },
				        
				    });
						
	             //   console.log(">>>>>>>>> 오늘일정 데이터 로드 성공");	
					resolve(item);

	            },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });
		});*/
		
		return new Promise(function(resolve, reject) {
			
			/*$.ajax({
	            type: "GET",
	            url: root_path +  "/resource/data/schedule_data.txt",
	            dataType: "json",
	            success: function(data){*/
		
					var item = "";
					
					item += "<div id='schedule_box' class='content_item' app='calendar' idx='4'>";
					item += "	<div class='content_title_wrap'>";
					item += "		<h4 class='content_title'>" + gap.lang.today_cal + "</h4>";
					
					item += "	</div>";
					item += "	<div class='calendar_wrap'>";
					item += "		<div id='calendar'></div>";
					item += "		<div id='schedule_info_box'>";
					item += "			<div class='schedule_info_wrap'></div>";
					item += "		</div>";
					item += "	</div>";
					item += "	<div class='btn_wrap'>";
					item += "		<button type='button' id='btn_cal_view_all' class='btn_white'><span>" + gap.lang.expand + "</span></button>";
					item += "		<button type='button' id='btn_cal_compose' class='btn_blue'><span>" + gap.lang.tab_reg_cal + "</span></button>";
					item += "	</div>";
					item += "</div>";
		        
	

			        var item_id = "item-schedule";
						
					item = $.trim(item).replaceAll("\n\t", "");
					
					gport.sidecal = null;
										
					if( flag === "init" ){
						item = { w: 4,  h: 6, content: item, id: item_id }
						GridStack.init().addWidget(item);
					} else {
						$("[gs-id=" + item_id + "] .grid-stack-item-content").find(".content_item").remove();
						$("[gs-id=" + item_id + "] .grid-stack-item-content").append(item);
					}
					
			/////////// 앱 추가 /////////////
					if(flag === 'add'){
						item = { w: 4,  h: 6, content: item, id: item_id, noResize: true }
						GridStack.init().addWidget(item);
						
		            	gport.portlet_mask_draw(item_id);
		            }
					
					// 달력 설정
					_self.initSideCal();

					// 버튼 클릭
					$("#btn_cal_view_all").off().on('click', function(){
						var cal_domain = location.protocol + "//" + window.mailserver + "/" + caldbpath;
						var url = cal_domain + "/main?readform";
						window.open(url, "", "");
					});
					
					$("#btn_cal_compose").off().on('click', function(){
						var sel_dt = _self.sidecal._selected;
						var s_dt = moment(sel_dt).format('YYYY-MM-DD');
						
						_self.showRegLayer(s_dt, s_dt);
					});					
						
	            //    console.log(">>>>>>>>> 오늘일정 데이터 로드 성공");	
					resolve(item);

	        /*    },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });*/
		});		
	},
	
	"initSideCal" : function(dt, pass_status){
		var _self = this;
		
		if (this.sidecal) {
			// 페이지가 전환되었다가 표시된 경우
			if (!dt) dt = new Date();
			
			// 오늘 날짜로 이동
			this.sidecal.navigate(dt);

			// 상태값 초기화
			if (!pass_status) {
				$('#side_cal .mbsc-calendar-cell-inner').removeClass('day_1 day_2 day_3 day_4 day_5 day_6 day_7 day_8 day_9 day_10 day_11').data('type', '');
			}
			
			// 신규로 데이터 불러오기
			var first_day = this.sidecal._calendarView._firstPageDay;
			var last_day = this.sidecal._calendarView._lastPageDay;
			var s_key = moment(first_day).add(-1, 'days').format('YYYYMMDD[T000000Z]');
			var e_key = moment(last_day).add(1, 'days').format('YYYYMMDD[T235959Z]');
			
			this.getUserEventBySide(s_key, e_key, pass_status, this.sidecal);
		} else {
		    this.sidecal = $("#calendar").mobiscroll().eventcalendar({
				theme: 'ios',
				themeVariant : 'light',
				clickToCreate: 'double',	// 더블클릭으로 신규 작성
				locale: mobiscroll.localeKo,
				view: {
					calendar: {
						type: 'month',
						popover: false,
						/*weekNumbers: true,*/
						labels: false
					}
				},
		        renderCalendarHeader: function () {
		            return '<div mbsc-calendar-prev class="custom-prev"></div>' +
		                '<div mbsc-calendar-nav class="custom-nav"></div>' +
		                '<div mbsc-calendar-next class="custom-next"></div>';
		        },
				onInit: function(event, inst){
					var s_moment = moment(event.value).date(1).startOf('week'); // 해당월 주차의 첫째날로 셋팅
					var s_key = s_moment.add(-1, 'days').format('YYYYMMDD[T000000Z]'); // 타임존 때문에 데이터 안나오는 경우 없도록 시작일 -1
					var e_key = s_moment.add(43, 'days').format('YYYYMMDD[T235959Z]'); // Mini캘린더에 뿌려지는 날짜수 +1
					_self.getUserEventBySide(s_key, e_key, null, inst);
				},
				onPageChange: function(event, inst){
					// 월을 변경할 때 호출
					var s_key = moment(event.firstDay).add(-1, 'days').format('YYYYMMDD[T000000Z]');
					var e_key = moment(event.lastDay).add(1, 'days').format('YYYYMMDD[T235959Z]');
					_self.getUserEventBySide(s_key, e_key, null, inst);
				},
		        onPageLoaded: function (event, inst) {
					// 여러번 호출되는 현상 방지
					var call_start = moment(event.firstDay).format();
					if (_self.side_loaded_view == call_start) {
						return;
					}
					
					var $sun = $('#side_cal div[aria-label*="Sunday"]');
					var $sat = $('#side_cal div[aria-label*="Saturday"]');
					$sun.find('.mbsc-calendar-day-text').addClass('sunday');
					$sat.find('.mbsc-calendar-day-text').addClass('saturday');
					$sun.find('.mbsc-calendar-cell-inner').addClass('sunday-cell');
					$sat.find('.mbsc-calendar-cell-inner').addClass('saturday-cell');
					
					_self.side_loaded_view = call_start;
		        },
				renderLabel: function(data){
					var cls = (data.original.type == 'private' ? 'event-private' : 'event-work');
					
					var pri_cls = 'priority_';
					if (data.original.priority) {
						pri_cls += data.original.priority;
					} else {
						pri_cls += '3';
					}
					
					if (gap.curLang == 'ko') {
						data.start = data.start.replace(/^AM/g, '오전');
						data.start = data.start.replace(/^PM/g, '오후');
					}

					var _title = (data.start ? '<span>' + data.start + '</span> ' + data.title : data.title);
					var html = 
						'<div class="mbsc-calendar-label-background ' + cls + '"></div>' +
						'<div class="main-cal-event ' + pri_cls + '">' +
						'	<span class="marker"></span>' +
						'	<span class="event-text' + (data.original.completed == 'T' ? ' complete' : '') + '">' + _title + '</span>' +
						'</div>';
					
					return html;
				},
				renderDay: function(day){
					var date = day.date;
				    var formatDate = mobiscroll.util.datetime.formatDate;
				    var tmp = moment(day.date).format('YYYYMMDD');
				    var now = moment().format('YYYYMMDD');
				    var today_cls = '';
				    
				    // 오늘인 경우
				    //if ('20230430' == tmp) {
				    if (now == tmp) {
				    	today_cls = ' mbsc-calendar-today';
				    }
					
				    var html =
				    	'<div class="main-day-wrap' + today_cls + '" data-date="' + tmp + '">' +
				    	'	<div class="mbsc-calendar-cell-text mbsc-calendar-day-text mbsc-ios">'+ formatDate('D', date) +'</div>' +
				    	'	<div class="main-holi-wrap">' +
				    	'		<div class="main-holi"></div>' +
				    	'		<div class="maincal_status_' + tmp + ' main-cal-status biz_check"></div>' +
				    	'	</div>' +
				    	'	<div class="side-cal-info">' +
				    	'		<div class="info work"></div>' +
				    	'		<div class="info private"></div>' +
				    	'	</div>' +
				    	'</div>';
				    	
				    return html;
				},
				onSelectedDateChange: function(event, inst){
					var dt = moment(event.date).format('YYYY-MM-DD');
					var events = inst._eventMap[dt];
					_self.showDayLayer(dt, events);
				},
				dateFormat: 'YYYY/MM/DD',
				timeFormat: gap.curlang == 'ko' ? 'A h:mm' : 'h:mm A'
		    }).mobiscroll('getInst');			
		}		
	},
	
	// 오늘일정 데이트피커 이벤트함수
	"datepicker_event": function(select, today, data){
		var _self = this;
		var html = "";
	        
        if(select.getTime() === today){
            html += "<div class='schedule_title'>TODAY</div>";
        } else {
            html += "<div class='schedule_title'>" + (select.getMonth()+1) + "월 " + select.getDate() + "일" + "</div>";
        }
        
        html += "<ul class='schedule_ul'>";
        for(var i = 0; i < data.length; i++){

            if(new Date(data[i].date).getTime() === select.getTime()){

                if(data[i].schedule[0].title !== ''){
                    for(var j = 0; j < data[i].schedule.length; j++){
                        html += "<li class='schedule_li'>- " + data[i].schedule[j].title + "</li>";
                    }
                }
                
            }
        }

        html += "</ul>";
        
        $(".schedule_info_wrap").empty();
        $(".schedule_info_wrap").append(html);

        if($(".schedule_ul").html() === ''){
            $(".schedule_ul").html("<li>" + gap.lang.no_schedule + "</li>");
        }
	},
	
	"getUserEventBySide" : function(s_key, e_key, pass_status, inst){
		var _self = this;
				
		// 사용자에 따라 mailfile을 계산해줘야 함
		var mf = window.maildbpath;
		
		// 등록되고 체크된 전체 사용자의 데이터를 가져옴
		var url = location.protocol + '//' + window.mailserver + '/' + mf + '/CustomEventList?ReadViewEntries&count=9999&StartKey=' + s_key + '&UntilKey=' + e_key + '&KeyType=time&outputformat=json';
		
		_self.setSideCalEvent(url, inst);
		
	/*	if (!pass_status) {
			if (_self.req_status) {
				_self.req_status.abort();
			}
			_self.req_status = _self.setUserStatus(s_key, e_key);
		}*/
	},
	
	"setSideCalEvent" : function(url, inst){
		var is_my_event = true;	//mailfile == this.getUserMailPath();
		var _self = this;
		$.ajax({
			url: url,
			xhrFields : {
				withCredentials : true
			},			
			success: function(res){
				var dupl_doc = {};	//중복체크
				var evt_list = {};	// {20220518:{"work":1, "}}
				var events = [];
				var side_events = {};
				
				$.each(res.viewentry, function(idx, val){
					
					var evt = _self.getEventJson(val);
					if (!evt) return true;
					
					// 초대 양식은 표시 안함
					if (evt.type == 'Notice') return true;
									
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
					var limit_cnt = 45; // 최대 45개까지 카운트 (1개월 달력에 표시가능한 개수만큼만 체크)
					var ck_cnt = 0;
					while (ck_start.format("YYYYMMDD") <= ck_end.format("YYYYMMDD")) {
						ck_cnt++;
						if (ck_cnt >= limit_cnt) break;
						
						// 날짜 중복 체크 (이벤트가 여러개여도 마킹을 하나만 하기 위해 날짜 중복 체크)
						ck_date = ck_start.format("YYYYMMDD");
						_self.addEventCount(evt_list, ck_date, evt);
						
						
						// 상태 셋팅  (5:출장, 7:교육, 10:휴무, 12:성찰)
					/*	if (evt.apt_cate == '5') { // 출장
							_self.checkStatus(ck_date, '7', 'side');
						} else if (evt.apt_cate == '7') { // 교육
							_self.checkStatus(ck_date, '8', 'side');
						} else if (evt.apt_cate == '10' && evt.system_code != 'task') { // 휴무 (d)
							_self.checkStatus(ck_date, '10', 'side');
						} else if (evt.system_code == 'chw'){
							_self.checkStatus(ck_date, '12', 'side');
						}*/

						// 사이드에 이벤트 점 찍기 위해 임시로 만든 배열						
						var ev_ky = moment(ck_start).format('YYYYMMDD');
						var ev_ty = _self.getEventType(evt);
						if (!side_events[ev_ky]) {
							side_events[ev_ky] = {};
						}
						side_events[ev_ky][ev_ty] = 'T';

						ck_start.add(1, "days");
					}

					evt.type = _self.getEventType(evt);
					events.push(evt);
				});
				
				//_self.sidecal.setEvents(_self.makeEventList(evt_list));
				inst.setEvents(events);
				
				setTimeout(function(){
					// 캘린더 하단에 하루 일정 표시
					var dt = moment(inst._selected).format('YYYY-MM-DD');
					var day_events = inst._eventMap[dt];
					_self.showDayLayer(dt, day_events);					
				}, 100);
				
				
				// 이벤트가 있는 날짜에 점찍어주기
				_self.drawSideCalEvent(side_events);
			},
			error: function(){
				_self.sidecal.setEvents([]);
			}
		});
	},
	
	"showDayLayer" : function(dt, events){
		// 포틀릿 캘린더에서 일정 목록 뿌려주는 함수
		
		var _self = this;
		
		var date_title = (gap.curLang == 'ko' ? moment(dt).format("M월 D일 dddd") : moment(dt).format("M.D dddd"));
		var html = "";
	        
		html += "<div class='schedule_title'>" + date_title + "</div>";
        html += "<ul class='schedule_ul'>";
  /*      for(var i = 0; i < data.length; i++){

            if(new Date(data[i].date).getTime() === select.getTime()){

                if(data[i].schedule[0].title !== ''){
                    for(var j = 0; j < data[i].schedule.length; j++){
                        html += "<li class='schedule_li'>- " + data[i].schedule[j].title + "</li>";
                    }
                }
                
            }
        }*/

		_self.eventSort(events);
		$.each(events, function(){
			html += "<li class='schedule_li'>- " + this.title + "</li>";
		});

        html += "</ul>";
        
        $(".schedule_info_wrap").empty();
        $(".schedule_info_wrap").append(html);

        if($(".schedule_ul").html() === ''){
            $(".schedule_ul").html("<li>" + gap.lang.no_schedule + "</li>");
        }		
	},		

	"drawSideCalEvent" : function(events){
		var _self = this;
		var $cal = $('#calendar');
		$cal.find('.side-cal-info').removeClass('has-work has-private');

		$.each(events, function(key, val){			
			var $cell = $cal.find('.main-day-wrap[data-date=' + key + ']');

			if (val['work'] == 'T') {
				$cell.find('.side-cal-info').addClass('has-work');
			} 
			if (val['private'] == 'T') {
				$cell.find('.side-cal-info').addClass('has-private');
			}
		});
	},	
	
	"addEventCount" : function(evt_list, dt, evt){
		
		if (!evt_list[dt]) {evt_list[dt] = {};}
		
		// 기존에 해당 날짜에 값이 있는 경우
		var type = this.getEventType(evt);	//work, private
		
		if ( evt_list[dt][type] ) {
			evt_list[dt][type] = evt_list[dt][type] + 1;
		} else {
			evt_list[dt][type] = 1;
		}
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
		data.start 			= _self.getValueByName(val, '$144');
		data.start 			= (data.start == '' ? _self.getValueByName(val, '$134') : data.start);

		data.date_type 		= _self.getValueByName(val, '_DateType');
		data.date_type 		= data.date_type == undefined || data.date_type == "undefined" ? "" : data.date_type;
		
		var _allday	 		= _self.getValueByName(val, '_AllDay');
		data.allday			= data.apt_type == '1' || (data.apt_type == '2' && data.date_type != '2') || _allday == '1' ? true : false;
		
		data.end			= _self.getValueByName(val, '$146');
		data.title 			= _self.getValueByName(val, '$147').replace(/\[\$NOSUBJECT\$\]/g, gap.lang.no_subject); // TODO(lang)
		
		data.type 			= _self.getValueByName(val, '$Type');
		data.apt_type 		= _self.getValueByName(val, '$152');
		data.colorinfo 		= _self.getValueByName(val, '$Color').split('|');
		data.chair			= _self.getValueByName(val, 'Chair_id');
		data.owner			= _self.getValueByName(val, 'Owner_id');
		data.attendee		= _self.getValueByName(val, '$Custom').split('|')[0];
		data.location		= _self.getValueByName(val, '$Custom').split('|')[1];
		data.notice_type	= _self.getValueByName(val, '$Custom').split('|')[2];
		data.org_confideltial = _self.getValueByName(val, '$154');
		data.ShowPS 		= _self.getValueByName(val, '_ShowPS');			
		data.chair_notesid 	= _self.getValueByName(val, '_ChairNotesID');
		data.sd				= _self.getValueByName(val, '$StartDate');
		data.ed				= _self.getValueByName(val, '$EndDate');
		data.apt_cate		= _self.getValueByName(val, '_ApptCategory');
		
		
		data.completed		= _self.getValueByName(val, '_Completion');
		data.priority		= _self.getValueByName(val, '_Priority');
		data.system_code	= _self.getValueByName(val, '_SystemCode');
		data.system_key		= _self.getValueByName(val, '_SystemKeyCode');
		
		
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
		/*if (window.mailfile != this.getUserMailPath()) {
			if (data.ShowPS == '2') {
				data.title = gap.lang.private_schedule2;
			}
		}*/
		
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
	},
	
	"genWorkLayer" : function(){
		var html = 
			'<div class="content-work content-wrap" style="display:none;">' +
			'	<div class="label-background"></div>' +
			'	<div class="table-wrap">' +
			'		<table>' +
			'			<tbody>' +
			'				<tr>' +
			'					<th>' + gap.lang.ws_channel + '</th>' +
			'					<td><div class="td-inner ws-ch-content"><select id="ws_category"></select></div></td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.ws_title + '</th>' +
			'					<td><div class="td-inner"><input type="text" id="ws_title" autocomplete="off" placeholder="' + gap.lang.placeholder_title + '"></div></td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.todo_name + '</th>' +
			'					<td><textarea id="ws_content" class="ws-content"></textarea></td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.ws_period + '</th>' +
			'					<td>' +
			'						<div class="td-inner">' +
			'							<div class="date-wrap">' +
			'								<input type="text" id="ws_s_date" class="ws-date">' +
			'								<div class="icon"></div>' +
			'							</div>' +
			'							<span>~</span>' +
			'							<div class="date-wrap">' +
			'								<input type="text" id="ws_e_date" class="ws-date">' +
			'								<div class="icon"></div>' +
			'							</div>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.priority + '</th>' +
			'					<td>' +
			'						<div class="td-inner">' +
			'							<select id="ws_priority">' +
			'								<option value="1">' + gap.lang.ws_priority_1 + '</option>' +
			'								<option value="2">' + gap.lang.ws_priority_2 + '</option>' +
			'								<option value="3" selected>' + gap.lang.ws_priority_3 + '</option>' +
			'								<option value="4">' + gap.lang.ws_priority_4 + '</option>' +
			'							</select>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.asign + '</th>' +
			'					<td style="padding-bottom:10px;">' +
			'						<div class="td-inner">' +
			'							<select id="ws_asignee">' +
			'							</select>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'			</tbody>' +
			'		</table>' +
			'	</div>' +
			'</div>';
			
		var $content = $(html);
		$('#work_simple_write_layer').append($content);
		$('#ws_priority').material_select();
	},	
	
	"genCalLayer" : function(){
		var html = 
			'<div class="content-cal content-wrap">' +
			'	<div class="label-background"></div>' +
			'	<div class="table-wrap">' +
			'		<table>' +
			'			<tbody>' +
			'				<tr>' +
			'					<th>' + gap.lang.basic_title + '</th>' +
			'					<td><div class="td-inner"><input type="text" id="cs_title" autocomplete="off" placeholder="' + gap.lang.placeholder_title + '"></div></td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.ws_period + '</th>' +
			'					<td>' +
			'						<div class="td-inner">' +
			'							<div class="date-wrap">' +
			'								<input type="text" id="cs_s_date" class="cs-date" readonly>' +
			'								<div class="icon"></div>' +
			'							</div>' +
			'							<div class="time-wrap" style="display:none;">' +
			'								<select id="cs_s_time"></select>' +
			'							</div>' +
			'							<span>~</span>' +
			'							<div class="date-wrap">' +
			'								<input type="text" id="cs_e_date" class="cs-date" readonly>' +
			'								<div class="icon"></div>' +
			'							</div>' +
			'							<div class="time-wrap" style="display:none;">' +
			'								<select id="cs_e_time"></select>' +
			'							</div>' +
			'							<label class="cs-allday" style="display:none;"><input type="checkbox" id="cs_allday">' + gap.lang.allday + '</label>' +
			'							<div class="btn" id="sel_time">' + gap.lang.select_time + '</div>' +
			'							<div class="btn" id="sel_allday" style="display:none;">' + gap.lang.allday + '</div>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.share_user + '</th>' +
			'					<td>' +
			'						<div style="position:relative;">' +
			'							<input type="text" id="cs_attendee" class="cs-user" autocomplete="off" placeholder="' + gap.lang.share_user_ph + '">' +
			'							<div class="org-icon"></div>' +
			'							<div class="cs-user-info" style="display:none;">' +
			'								<ul id="cs_attendee_list" class="cs-attendee-wrap"></ul>' +
			'							</div>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.ws_type + '</th>' +
			'					<td>' +
			'						<div class="td-inner">' +
			'							<select id="cs_type">' +
			'								<option value="" selected>' + gap.lang.ws_type_0 + '</option>' +
			'								<option value="5">' + gap.lang.ws_type_5 + '</option>' +
			'								<option value="7">' + gap.lang.ws_type_7 + '</option>' +
			//'								<option value="10">' + gap.lang.ws_type_10 + '</option>' +
			'							</select>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.priority + '</th>' +
			'					<td>' +
			'						<div class="td-inner">' +
			'							<select id="cs_priority">' +
			'								<option value="1">' + gap.lang.ws_priority_1 + '</option>' +
			'								<option value="2">' + gap.lang.ws_priority_2 + '</option>' +
			'								<option value="3" selected>' + gap.lang.ws_priority_3 + '</option>' +
			'								<option value="4">' + gap.lang.ws_priority_4 + '</option>' +
			'							</select>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.ws_public + '</th>' +
			'					<td>' +
			'						<div class="td-inner">' +
			'							<div class="radio-wrap">' +
			'								<input type="radio" id="cs_public_y" name="cs_public" value="Y" checked>' +
			'								<label for="cs_public_y">' + gap.lang.disclosure + '</label>' +
			'								<input type="radio" id="cs_public_n" value="N" name="cs_public">' +
			'								<label for="cs_public_n" style="margin-left:15px;">' + gap.lang.nondisclosure + '</label>' +
			'							</div>' +
			'						</div>' +
			'					</td>' +
			'				</tr>' +
			'				<tr>' +
			'					<th>' + gap.lang.notice_body + '</th>' +
			'					<td>' +
			'						<textarea id="cs_content" class="cs-content long"></textarea>' +
			'					</td>' +
			'				</tr>' +
			'			</tbody>' +
			'		</table>' +
			'	</div>' +
			'</div>';
		
		var $content = $(html);
		$('#work_simple_write_layer').append($content);
		$('#cs_type').material_select();
		$('#cs_priority').material_select();
	},	
	
	"showRegLayer" : function(s_dt, e_dt){
		var _self = this;
		
		gap.showBlock();
		
		$('#work_simple_write_layer').remove();
		
		var html = 
			'<div id="work_simple_write_layer" class="work-simple-layer">' +
			'	<div class="title-wrap">' +
			'		<ul>' +
		//	'			<li data-menu="cal" class="on"><span>' + gap.lang.tab_reg_cal + '</span></li>' +
			'			<li data-menu="cal"><span>' + gap.lang.tab_reg_cal + '</span></li>' +
		//	'			<li data-menu="work"><span>' + gap.lang.tab_reg_work + '</span></li>' +
			'		</ul>' +
			'		<div class="btn-close"><span></span><span></span></div>' +
			'	</div>' +
			'</div>';
		
		var $layer = $(html);
		$('body').append($layer);
		
		this.genCalLayer();
	//	this.genWorkLayer();
		
		
		// 버튼 등록
		html = 
			'<div class="btn-wrap">' +
			'	<button id="btn_simple_ok" class="btn-popup">' + gap.lang.btn_reg + '</button>' +
			'</div>';
		var $btn_area = $(html);
		$('#work_simple_write_layer').append($btn_area);
		
		$layer.find('#ws_title').attr('placeholder', gap.lang.placeholder_title);
		
		
		this.regEventBind(s_dt, e_dt);
		
		// 레이어 표시
		$layer.show();
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx).addClass('show-layer');
		
		$('#cs_title').focus();
	},
	
	"hideWorkLayer" : function(){
		var _self = this;
		var $layer = $('#work_simple_write_layer');
		$layer.removeClass('show-layer');
		
		gap.hideBlock();
		
		//setTimeout(function(){
			$layer.hide().remove();
		//}, 300);
	},
	
	"regEventBind" : function(s_dt, e_dt){
		var _self = this;
		var $layer = $('#work_simple_write_layer');
		
		
		function _getTimeHtml() {
			var html_time = '';
			var now = moment();
			
			// 한글 사용자는 오전/오후로 표시
			if (gap.userinfo.userLang == 'ko') {
				now.locale('ko-kr');
			}
			
			now.set({'hour':0, 'minute':0, 'second':0, 'millisecond':0});
			
			var ckdate = now.clone();
			ckdate.add(1, 'day');
			
			while (now.format() != ckdate.format()) {
				html_time += '<option value="' + now.format('HH:mm') + '">' + now.format('LT') + '</option>';
				now.add(30, 'minutes');
			}
			return html_time;
		}
		
		function _setDiffDate(e_val) {
			var s_date = moment($('#cs_s_date').val() + 'T' + $('#cs_s_time').val()); 
			var e_date = moment((e_val ? e_val : $('#cs_e_date').val()) + 'T' + $('#cs_e_time').val());
			
			
			var diff = e_date.diff(s_date, 'm');
			if (diff >= 0) {
				$('#cs_s_date').data('diff_min', diff);
			}
			 
		}
		
		function _changeEndDate(event) {
			var diff = $('#cs_s_date').data('diff_min');
			var s_txt = (event ? event.valueText : $('#cs_s_date').val()) + 'T' + $('#cs_s_time').val();
			
			if (diff >= 0) {
				var e_dt = moment(s_txt).add(diff, 'm');
				$('#cs_e_date').val(e_dt.format('YYYY-MM-DD'));
				$('#cs_e_time').val(e_dt.format('HH:mm')).material_select();				
			}
		}
		
		function _checkEndDate(s_val, e_val) {
			if ($('#cs_allday').is(':checked')) {
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
				var s_date = moment((s_val ? s_val : $('#cs_s_date').val()) + 'T' + $('#cs_s_time').val()); 
				var e_date = moment((e_val ? e_val : $('#cs_e_date').val()) + 'T' + $('#cs_e_time').val());
				if (e_date.diff(s_date) <= 0) {
					// 종료일을 시작일보다 이전으로 설정하는 경우
					$('#cs_e_date').addClass('invalid');
					$('#cs_e_time').parent().find('input').addClass('invalid');
				} else {
					$('#cs_e_date').removeClass('invalid');
					$('#cs_e_time').parent().find('input').removeClass('invalid');
				}
			}
		}
		
		function _searchUser(){
			var terms = $.trim($('#cs_attendee').val());
			if (terms == '') return;
			
			var users = terms.split(',');

			gsn.requestSearch('', terms, function(res){
				$.each(res, function(){
					_addAttendee(this);
				});
			});			
			
			$('#cs_attendee').val('');
		}
		
		function _addAttendee(user_info){
			var $list = $('#cs_attendee_list');
			var ck = $list.find('li[data-key="' + user_info.ky + '"]');
			if (ck.length) return;	// 기존에 선택된 값이 있으면 추가 안함
			
			if (user_info.ky == gap.userinfo.rinfo.ky) {
				mobiscroll.toast({message:gap.lang.mt_alert_2, color:'danger'});
				return;
			}
			
			var disp_txt = '';
			if (user_info.ky.indexOf('@') != -1){
				return;				
			} else {
				user_info = gap.user_check(user_info);
				disp_txt = '<a onclick="gap.showUserDetailLayer(\'' + user_info.ky + '\')">' + user_info.disp_user_info + '</a>';
			}
			
			var html =
				'<li class="cs-attendee" data-key="' + user_info.ky + '">' +
				'	<span class="txt ko">' + disp_txt + '</span>' +
				'	<button class="btn-user-remove"></button>' +
				'</li>';
			
			var $li = $(html);
			
			$li.data('info', user_info);
			$li.find('.btn-user-remove').on('click', function(){
				$(this).closest('li').remove();
				
				if ($list.find('li').length == 0) {
					$('.cs-user-info').hide();
					$('#cs_content').addClass('long');
				}
			});
			
			$list.append($li);
			
			var $scroll_wrap = $('.cs-user-info');
			$scroll_wrap.show();
			$scroll_wrap.scrollLeft($scroll_wrap[0].scrollWidth);
			$('#cs_content').removeClass('long');
		}
		
		
		// 탭 이벤트
		$layer.find('.title-wrap li').on('click', function(){
			if ($(this).hasClass('on')) return;
			
			$layer.find('.title-wrap li.on').removeClass('on');
			$(this).addClass('on');
			
			var disp_menu = $(this).data('menu');
			$layer.find('.content-wrap').hide();
			$layer.find('.content-' + disp_menu).show();
			
			if ($(this).data('menu') == 'cal') {
				
			} else {
				
			}
		});
		
		
		
		// 일정 관련
		// 현재 시간 정보 셋팅
		var time_html = _getTimeHtml();
		var s_date = moment().startOf('h').add(1, 'h');
		var e_date = moment().startOf('h').add(2, 'h');
		
		if (s_dt && e_dt) {
			// 메인에서 드래그하여 넘어온 경우
			$('#cs_s_date').val(s_dt);
			$('#cs_e_date').val(e_dt);
			$('#cs_allday').prop('checked', true);
			$('#cs_s_time').append(time_html).val(s_date.format('HH:mm')).prop('disabled', true).material_select();
			$('#cs_e_time').append(time_html).val(e_date.format('HH:mm')).prop('disabled', true).material_select();
			s_date = moment($('#cs_s_date').val() + 'T' + s_date.format('HH:mm'));
			e_date = moment($('#cs_e_date').val() + 'T' + e_date.format('HH:mm'));
		} else {
			$('#cs_s_date').val(s_date.format('YYYY-MM-DD'));
			$('#cs_e_date').val(e_date.format('YYYY-MM-DD'));
			$('#cs_s_time').append(time_html).val(s_date.format('HH:mm')).material_select();
			$('#cs_e_time').append(time_html).val(e_date.format('HH:mm')).material_select();
		}
		
		// 기간 선택
		$('#cs_s_date').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			theme: 'ios',
			defaultSelection: $('#cs_s_date').val(),
			themeVariant : 'light',
			controls: ['calendar'],			
			dateFormat: 'YYYY-MM-DD',	
			display: 'anchored',
			animation: 'pop',
			calendarType: 'month',	
			startInput: '#cs_s_date',
			pages : 1,
			touchUi: false,
			onChange: function(event, inst){
				_checkEndDate(event.valueText, $('#cs_e_date').val());
				
				// 시작일을 종료일보다 이후로 선택했는지 체크
				if ($('#cs_e_date').hasClass('invalid')) {
					$('#cs_e_date').val(event.valueText);
					_checkEndDate(event.valueText, $('#cs_e_date').val());
				}
			}
		});
		
		$('#cs_e_date').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			theme: 'ios',
			themeVariant : 'light',
			controls: ['calendar'],				
			dateFormat: 'YYYY-MM-DD',	
			display: 'anchored',
			animation: 'pop',
			calendarType: 'month',	
			startInput: '#cs_e_date',
			pages : 1,
			touchUi: false,
			onChange: function(event, inst){
				_setDiffDate(event.valueText);
				_checkEndDate($('#cs_s_date').val(), event.valueText);
			}
		});
		
		
		// 종일 이벤트
		$('#cs_allday').on('click', function(){
			if ($(this).is(':checked')) {
				$('#cs_s_time').prop('disabled', true).material_select();
				$('#cs_e_time').prop('disabled', true).material_select();
				$layer.find('.time-wrap').hide();
				$('#sel_time').show();
				$('#sel_allday').hide();
			} else {
				$('#cs_s_time').prop('disabled', false).material_select();
				$('#cs_e_time').prop('disabled', false).material_select();
				$layer.find('.time-wrap').show();
				$('#sel_time').hide();
				$('#sel_allday').show();
			}
			_checkEndDate();
		});
		
		$('#cs_s_time').on('change', function(){
			_changeEndDate();
			_checkEndDate();
		});
		
		$('#cs_e_time').on('change', function(){
			// 종료시간을 시작시간 이후로 설정하면 시간 차이만큼 셋팅
			_setDiffDate();
			_checkEndDate();
		});
		
		// 종료일과의 시간을 계산해서 처리
		$('#cs_s_date').data('diff_min', e_date.diff(s_date, 'm'));
		
		
		//////////////  일정 등록 이벤트 끝   ////////////// 
		
		// 채널 정보 가져오기
		//_self.getChannelList();
		
		// 기간 선택
		$('#ws_s_date').mobiscroll().datepicker({
			locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
			theme: 'ios',
			controls: ['calendar'],
			select: 'range',				
			dateFormat: 'YYYY-MM-DD',	
			//display: 'anchored',
			animation: 'pop',
			calendarType: 'month',	
			startInput: '#ws_s_date',
		    endInput: '#ws_e_date',
			pages : 2,
			touchUi: false
		});
		
		if (s_dt && e_dt) {
			$('#ws_s_date').val(s_dt);
			$('#ws_e_date').val(e_dt);
		}
		
		// 시간 설정 기능 변경 (2023.5.3)
		$('#sel_time').on('click', function(){
			$('#cs_allday').click();
			
			// 자동으로 열렬다 닫히는 오류로 인해 setTimeout 설정
			$('#work_simple_write_layer').click(); //다른 열려있는 레이어들을 닫기 위해 호출
			setTimeout(function(){
				$('#cs_s_time').parent().find('input').trigger('mousedown').trigger('focus');			
			}, 200);
		});
		$('#sel_allday').on('click', function(){
			$('#cs_allday').click();
		});
		
		
		
		// 공유 대상자 입력
		$('#cs_attendee').on('keydown', function(e){
			if (e.keyCode == 13) {
				_searchUser();
			}
		}).on('blur', function(e){
			var temp = $.trim($(this).val());
			if (temp != '') {
				_searchUser();
			}
		}).on('paste', function(e){
			gap.change_paste_text(e, this);
		});
		
		// 공유 대상자 조직도
		$layer.find('.org-icon').on('click', function(){
			window.ORG.show(
				{
					'title': gap.lang.share_user,
					'single': false,
					'select': 'person' // [all, team, person]
				}, 
				{
					getItems:function() { return []; },
					setItems:function(items) { /* 반환되는 Items */
						if (items.length == 0) return;
						for (var i = 0; i < items.length; i++){
							var _res = gap.convert_org_data(items[i]);
							//_res = gap.user_check(_res);
							_addAttendee(_res);
						}
					}
				}
			);
		});
				
		// 저장
		$('#btn_simple_ok').on('click', function(){
			var menu = $layer.find('.title-wrap li.on').data('menu');
		//	if (menu == 'cal') {
				_self.simpleCalendarSave();
		//	} else {
		//		_self.simpleWorkSave();
		//	}
		});
		
		// 닫기
		$layer.find('.btn-close').on('click', function(){
			_self.hideWorkLayer();
		});
		
		
		$layer.find('.date-wrap .icon').on('click', function(){
			$(this).parent().find('input').click();
			//$('#ws_s_date').click();
			return false;
		});
	},
	
	"getChannelList" : function(sel_code){
		var _self = this;
		
		// 업무 카테고리
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : gap.channelserver + "/channel_info_list.km",
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
				
				html += '<option value="make_channel">+ ' + gap.lang.select_create_channel + '</option>';
				
				
				$('#ws_category').html(html);
				$('#ws_category').material_select();
				
				// 셀렉트 박스 변경될 때, 담당자 정보 가져와야 함
				$('#ws_category').off().on('change', function(){
					_self.getChannelMember(this.value);
				});
			},
			error : function(){
				
			}
		});
	},	
	
	"getChannelMember" : function(ch_code){
		var _self = this;
		var $user_list = $('#ws_asignee');
		$user_list.empty();
		
		if (ch_code == 'none') {
			$user_list.material_select();
			return;
		} else if (ch_code == 'make_channel') {
			$('#ws_category').val('none').material_select();
			gBody2.create_channel(undefined, undefined, undefined, function(data){
				_self.createChannelComplete(data);
			});
			return;
		}
		
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
				if (res.result != "OK"){
					mobiscroll.toast({message:gap.lang.error_get_data, color:'danger'});
					return;
				}
				
				var html = '';
				var owner = res.data.owner;
				
			/*	
			 * 전체 사용자 소트를 위해 사용하지 않음 - 2022.10.21
			 * // 채널 작성자 정보
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
		var _self = this;
		var res = JSON.parse(data);
		if (res.result == 'OK') {
			gBody2.update_channel_info();	// 채널방에 대한 정보를 업데이트 해야 함
			gap.add_todo_plugin("add", res.ch_code);	// 방금 생성한 채널방에 TODO 플러그인 등록
			_self.getChannelList(res.ch_code);
			_self.getChannelMember(res.ch_code);
		}
		
	},
	
	"simpleWorkSave" : function(){
		var _self = this;
		
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
						_self.refreshPage(true);
						_self.hideWorkLayer();
					});
				} else {
					mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				}
			}
		});
	},
	
	"simpleCalendarSave" : function(){
		var _self = this;
		
		// Validation 체크
		var _title = $.trim($('#cs_title').val()),
			_s_dt = $('#cs_s_date').val(),
			_e_dt = $('#cs_e_date').val(),
			_s_time = $('#cs_s_time').val(),
			_e_time = $('#cs_e_time').val(),
			_allday = $('#cs_allday').is(':checked');
			_priority = parseInt($('#cs_priority').find('option:selected').val()),
			_category = $('#cs_type').val(),
			_public = $(':radio[name="cs_public"]:checked').val(),
			_express = $.trim($('#cs_content').val()),
			_attendee = '';
		
		$('#cs_title').val(_title);

		
		// 업무명 선택
		if (_title == '') {
			mobiscroll.toast({message:gap.lang.error_ws_title, color:'danger'});
			$('#cs_title').focus();
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
			
			if (obj.start > obj.end) {
				mobiscroll.toast({message:gap.lang.invalid_period, color:'danger'});
				return;
			}
		} else {
			obj.start = moment(_s_dt + 'T' + _s_time).format();
			obj.end = moment(_e_dt + 'T' + _e_time).format();
			
			if (obj.start >= obj.end) {
				mobiscroll.toast({message:gap.lang.invalid_period, color:'danger'});
				return;
			}
		}

		this.calendarAPI(obj).then(function(data){
			var res = data.split('^');
			if (res[0] == 'SUCCESS') {
				mobiscroll.toast({message:gap.lang.reg_complete, color:'info'});
				_self.refreshPage();
				_self.hideWorkLayer();				
			} else {
				mobiscroll.toast({message:gap.lang.mt_err_1, color:'danger'});
				
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
            'SystemCode': obj.system ? obj.system : 'task',	//연동 시스템 코드 (예 : 화상회의 예약)
            'ms': window.cur_mailserver	// 현재 접속한 메일서버 정보를 넘김
        };
		
		var url = location.protocol + "//" + window.mailserver + "/" + window.caldbpath + "/fmmeeting?openform";
		return $.ajax({
			type: 'POST',
            url: url,
            data: _form_data,
            dataType: "text",
            success: function(data) {
                
            }
		}).then(function(data){
			return data;
		}, function(){
			return 'ERROR';
		});
	},
	
	"refreshPage" : function(pass_status){
		var sel_date = moment(this.sidecal._selected);
		this.initSideCal(sel_date, pass_status);
		//this.popupRefresh();	// 팝업에서 작업된  경우 팝업 새로고침
	},	
	
	//게시판 데이터 불러오는 함수
	"board_data_load": function(flag){
		var _self = this;
		
		return new Promise(function(resolve, reject) {

			/*$.ajax({
	            type: "GET",
	            url: root_path +  "/resource/data/" + (userlang == "ko" ? "board_data.txt" : "board_data_en.txt"),
	            dataType: "json",
	            success: function(data){*/
		
					var item = "";
					
					item += "<div id='board_box' class='content_item' idx='5'>";
					item += "	<div class='content_title_wrap'><h4 class='content_title'>" + gap.lang.bbs + "</h4></div>";
					item += "	<div style='overflow: hidden; flex: 1; margin-bottom: 16px;'>";
					item += "		<div class='list_wrap'>";
					item += "			<div class='category_wrap'>";
					item += "				<li class='category category_board board_notice active' id='tab_bbs_notice' title='" + gap.lang.notice2 + "'><span class='category_name'>" + gap.lang.notice2 + "</span></li>";
					item += "				<li class='category category_board board_square' id='tab_bbs_square' title='" + gap.lang.square + "'><span class='category_name'>" + gap.lang.square + "</span></li>";
					item += "				<li class='category category_board board_cnc' id='tab_bbs_cnc' title='" + gap.lang.cnc + "'><span class='category_name'>" + gap.lang.cnc + "</span></li>";
					item += "				<li class='category category_board board_tip' id='tab_bbs_tip' title='" + gap.lang.tipntech + "'><span class='category_name'>" + gap.lang.tipntech + "</span></li>";
					item += "			</div>";
					item += "			<div id='board_ul' class='doc_ul'></div>";
					item += "		</div>";
					item += "	</div>";
					item += "	<div class='btn_wrap'>";
					item += "		<button type='button' class='btn_white' id='btn_bbs_view_all'><span>" + gap.lang.expand + "</span></button>";
					item += "	</div>";
					item += "</div>";
					
					
					var item_id = "item-board";
					
					item = $.trim(item).replaceAll("\n\t", "");
					
					if( flag === "init" ){
						item = { w: 4,  h: 5, content: item, id: item_id }
						GridStack.init().addWidget(item);
					} else {
						$("[gs-id=" + item_id + "] .grid-stack-item-content").find(".content_item").remove();
						$("[gs-id=" + item_id + "] .grid-stack-item-content").append(item);
					}
					
			/////////// 앱 추가 /////////////
					if(flag === 'add'){
						item = { w: 4,  h: 5, content: item, id: item_id, noResize: true }
						GridStack.init().addWidget(item);
						
		            	gport.portlet_mask_draw(item_id);
		            }
					
					// 게시판 탭 버튼
	                $(".category_board").off().on("click", function(){
	                    
	                    $(this).siblings().removeClass("active");
	                    $(this).addClass("active");
						
						/// 탭을 누르면 스크롤을 최상단으로 움직여야 observer가 
						/// 마지막 리스트를 감지하여 다른 페이지까지 호출하는 것을 방지할 수 있음.
						$("#board_ul").scrollTop(0);

						gport.draw_board_list($(this));
						
	                });

					//$("#tab_bbs_notice").click();
					
					gport.draw_board_list($("#tab_bbs_notice"));

	             //   console.log(">>>>>>>>> 게시판 데이터 로드 성공");
					
					resolve(item);

	        /*    },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });*/
	
		});
		
	},
	
	//// 게시판 위젯 리스트 그리는 함수
	"draw_board_list": function(target){

		var cate = target.attr("id").replace("tab_bbs_", "");
		var bbsdbpath = "";
		var viewname = (cate == "cnc" ? "vwEventDocsBox" : "vwAllDocsBox");
		
		if (cate == "notice"){
			bbsdbpath = window.noticedbpath;
			
		} else if (cate == "square" || cate == "cnc"){
			bbsdbpath = window.boarddbpath;
			
		} else if (cate == "tip"){
			bbsdbpath = window.tipdbpath;
		}

		var observer;
		var start = 0;
		
		/// 무한스크롤 데이터 로딩 html
		//var loading = "<div id='list_loading'><span class='loading_icon'></span><span>목록 불러오는 중..</span></div>";
		var loading = "<div id='list_loading'><span class='loading_icon'></span></div>";
		
		/// 게시판 데이터 로드
		data_load();
		
		function data_load(opt){
			
			$.ajax({
				type : "GET",
				url : location.protocol + "//" + window.mailserver + "/" + bbsdbpath + "/api/data/collections/name/" + viewname + "?restapi&&start=" + start + "&ps=10&entrycount=false",
				xhrFields : {
					withCredentials : true
				},
				cache: false,				
			//	dataType : "json",
				beforeSend: function(){
					if( $("#list_loading").length === 0 ) {
						//// 페이지를 불러오기 전에 로딩
						$('#board_ul').append(loading);
					}
				},
				success : function(res){
					var data_cnt = res.length;
					if (res.indexOf("/domcfg.nsf/") > -1){
						data_cnt = 0;
					}	
					
					if(opt !== "add"){
						$('#board_ul').empty();
					}
								
					if( data_cnt === 0 ){
						/// 목록 데이터가 없다면 감지 중단
						if (observer){
							observer.disconnect();
						}
						$("#list_loading").remove();
						if ($('#board_ul').children().length == 0){
							var html2 = "<div class='null_doc'><span>" + gap.lang.list_no_document + "</span></div>";
							$('#board_ul').append(html2);							
						}
						return;
						
					} else {
						/// 데이터가 존재하면 start를 10씩 증가시킨다.
						start += 10;
					}
					
					$("#list_loading").remove(); // 로딩 제거
					
					/**** 목록 그리기 ****/
					for(var i = 0; i < res.length; i++){
	
						var unid = res[i]['@unid'];
						if (unid != ""){
							var href = res[i]['@link']['href'];
							var link = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + href.replace('api/data/documents/unid', 'vwAllDocs') + '?opendocument&viewname=vwAllDocs&folderkey=&opentype=popup&relatedyn=N';
							var title = res[i].title;
							var createddate = res[i].pubdate;
							var authorinfo = res[i].writerinfo;
							var bbs_data = {
								"unid" : unid,
								"title" : title,
								"link" : link
							}
							var html = '';
							
							html += "<li class='doc_li' id='" + unid + "' title='" + title + "'>";
							html += "<span class='item_title'>" + title + "</span>";
							html += "<div class='item_writer_wrap'>";
						//	html += "<span class='item_writer'>" + authorinfo + "</span>";
						//	html += "<span> · </span>";
							html += "<span class='item_date'>" + moment.utc(createddate).local().format('YYYY-MM-DD') + "</span>";
							html += "</div>";
							html += "</li>";
							
							$('#board_ul').append(html);
							$('#' + unid).data('info', bbs_data);
							$('#' + unid).data('link', link);
						}
					}
					/**** 목록 그리기 ****/
					
				
				
				/********** 무한 스크롤 *********/
				
					if (observer) {
						// 기존 감지 중지
						observer.disconnect();
					}

					/// observer가 감지할 요소
					var lastItem = $("#board_ul").find(".doc_li").last()[0];
					if (!lastItem) return;
					
				    observer = new IntersectionObserver(entries => {
					
						///// 마지막 요소가 보여지면 목록 데이터를 불러온다.
				        if (entries[0].isIntersecting) {
							//console.log(">>>>>>>>>>>>>>>게시판 새 목록 불러온다.");
							data_load("add");
				        }

				    }, { root: $("#board_ul")[0], threshold: 0 } );
				
				    observer.observe(lastItem); // 마지막 요소 감지시 시작

				/********** 무한 스크롤 *********/

					// 제목 클릭
					$(".doc_li").off().on('click', function(){
						var _id = $(this).attr('id');
						var _link = $('#' + _id).data('link');
						var _url = _link;
						gap.open_subwin(_url, "1200","900", "yes" , "", "yes");
					});
					
					// 버튼 클릭
					$("#btn_bbs_view_all").off().on('click', function(){
						var bbs_domain = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/" + bbsdbpath;
						var url = bbs_domain + "/FrameBBS?openform" + (cate == "cnc" ? "&vn=vwEventDocs" : "");
						window.open(url, "", "");
					});
	
				},
				/*complete: function () {
					$("#list_loading").remove(); // 로딩 제거
				},*/
				error : function(e){
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			});

		}

	},

	/*"infinite_scroll" : function(ul, ul_type){
		
		var observer;
		
		if (observer) {
			// 기존 감시 중지
			observer.disconnect();
		}
	
	    var lastItem = ul.find(".doc_li").last()[0]; // 마지막 요소 선택
		if (!lastItem) return;
	
	    observer = new IntersectionObserver(entries => {
	        if (entries[0].intersectionRatio > 0) {
				console.log(1);
	            gport.draw_board_list(ul_type, "add");
	        }
	    }, { root: ul[0], threshold: 1 } );
	
	    observer.observe(lastItem); // 마지막 요소 감시 시작
		
	},*/

	"emp_search_box_draw": function(flag){
		var _self = this;
		
		return new Promise(function(resolve, reject) {
			
			/*$.ajax({
	    		type: "GET",
	    		url: root_path +  "/resource/data/emp_search_box_data.txt",
	    		dataType: "html",
	    		success: function(data){*/
	    			var item = "";
					item += "<div id='emp_search_box' class='content_item' idx='6'>";
					item += "	<div class='content_title_wrap'><h4 class='content_title'>" + gap.lang.employee_inquiry + "</h4></div>";
					item += "	<div class='emp_content'>";
					item += "		<div class='category_wrap'>";
					item += "			<li class='category active'><span class='category_name'>" + gap.lang.all + "</span></li>";
					item += "			<li class='category'><span class='category_name'>" + gap.lang.dept + "</span></li>";
					item += "			<li class='category'><span class='category_name'>" + gap.lang.name + "</span></li>";
					item += "		</div>";
					item += "		<div class='search_input_wrap'>";
					item += "            <input type='text' id='emp_info_input' class='search_input' placeholder='" + gap.lang.input_search_query + "'>";
					item += "		</div>";
					item += "	</div>";
					item += "	<div class='btn_wrap'>";
					item += "		<button type='button' id='btn_emp_search' class='btn_blue'><span>" + gap.lang.search + "</span></button>";
					item += "	</div>";
					item += "</div>";
			
					var item_id = "item-emp_search";
					
					if( flag === "init" ){
						item = { w: 4,  h: 3, id: item_id, content: item, minH: 3 }
						GridStack.init().addWidget(item);
					} else {
						$("[gs-id=" + item_id + "] .grid-stack-item-content").find(".content_item").remove();
						$("[gs-id=" + item_id + "] .grid-stack-item-content").append(item);
					}
					
			/////////// 앱 추가 /////////////
					if(flag === 'add'){
						item = $.trim(item).replaceAll("\n\t", "");
						item = { w: 4,  h: 3, id: item_id, content: item, noResize: true }
						GridStack.init().addWidget(item);
						
		            	gport.portlet_mask_draw(item_id);
		            }

					// 이벤트 처리
					// 탭 버튼
	                $("#emp_search_box .category").off().on("click", function(){
	                    $(this).siblings().removeClass("active");
	                    $(this).addClass("active");
	                });
					
					// 입력창 엔터
					$("#emp_info_input").on("keypress", function(e){
						if(e.keyCode === 13){
							$("#btn_emp_search").click();
						}
					});
					
					// 검색
					$("#btn_emp_search").off().on("click", function(){
						var _qry = $.trim($('#emp_info_input').val());
						if (_qry == '') {
							mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
							$('#emp_info_input').focus();
							return false;
						}
						
						$("#btn_menu_tree").siblings().removeClass("active");
						$("#btn_menu_tree").addClass("active");	
						$("#right_menu").hide();
						$("#btn_notification").removeClass("active");						
			
						// 알림센터가 떠있으면 제거한다 /////////////////////////////////////
						$("#alarm_center_layer").fadeOut(function(){
							$("#alarm_center_layer").empty();
						});
						//////////////////////////////////////////////////////////////
						
						// 포틀릿 일정 초기화
						if (typeof(gport) != "undefined"){
							gport.sidecal = null;
						}						
						
						var query = $("#emp_info_input").val();
						gap.LoadPage("area_content", root_path + "/page/organ.jsp?query=" + encodeURIComponent(query));
						gap.cur_window = "org";
						gap.history_save("org");
						$("#emp_info_input").val("");
					});

					resolve(item);
					
	    		/*},
	    		error: function(xhr, error){
					console.log(error);
					reject(error);
	    		}
	    	});*/
		});
		
	},
	
	//채팅방 데이터 불러오는 함수
	"chat_data_load": function(flag){
		var _self = this;
		
		return new Promise(function(resolve, reject) {
			/*$.ajax({
	            type: "get",
	            url: root_path +  "/resource/data/" + (userlang == "ko" ? "chat_data.txt" : "chat_data_en.txt"),
	            dataType: "json",
	            success: function(data){*/

					var obj = gap.chat_room_info;
					var sbj = obj.ct;
					var item = "";
					
					item += "<div id='chat_box' class='content_item' idx='7'>";
					item += "	<div class='content_title_wrap'>";
					item += "		<h4 class='content_title'>" + gap.lang.chatroom + "</h4>";
					item += "		";
					item += "	</div>";
					item += "	<div style='overflow: hidden; flex: 1; margin-bottom: 16px;'>";
					item += "		<div class='list_wrap'>";
					item += "			<div id='chat_category' class='category_wrap'></div>";
					item += "			<div id='chat_ul' class='msg_ul'></div>";
					item += "		</div>";
					item += "	</div>";
					item += "	<div class='btn_wrap'>";
					item += "		<button type='button' id='btn_chat_view_all' class='btn_white'><span>" + gap.lang.expand + "</span></button>";
					item += "	</div>";
					item += "</div>";
					

					var item_id = "item-chat";
					
					item = $.trim(item).replaceAll("\n\t", "");
					if( flag === "init" ){
						item = { w: 4,  h: 5, content: item, id: item_id }
						GridStack.init().addWidget(item);
					} else {
						$("[gs-id=" + item_id + "] .grid-stack-item-content").find(".content_item").remove();
						$("[gs-id=" + item_id + "] .grid-stack-item-content").append(item);
					}
					
			/////////// 앱 추가 /////////////
					if(flag === 'add'){
						item = { w: 4,  h: 5, content: item, id: item_id, noResize: true }
						GridStack.init().addWidget(item);
						
		            	gport.portlet_mask_draw(item_id);
		            }
	
	
					
					/// html
					var category = "";
					category += "<li class='category category_chat chat_unread active'>";
					category += "	<span class='category_name'>" + gap.lang.unread_chat + "</span>";
				//	category += "	<span class='doc_count'>" + personal_chat_count + "</span>";
					category += "	<span class='doc_count'></span>";
					category += "</li>";
					category += "<li class='category category_chat chat_favorite'>";
					category += "	<span class='category_name'>" + gap.lang.favorite + "</span>";
				//	category += "	<span class='doc_count'>" + group_chat_count + "</span>";
					category += "	<span class='doc_count'></span>";
					category +=	"</li>";
					
	                $("#chat_category").append(category);
	
	                $(".category_chat").on("click", function(){ 
	
	                    var chat_li = '';
	                    var condition = '';
	
	                    $(this).siblings().removeClass("active");
	                    $(this).addClass("active");
	                    
	
	                /*    for(var i = 0; i < data.length; i++){
	                        if($(this).hasClass("chat_unread")){
	                            condition = data[i].type === "personal";
	                            
	                        }
	                        if($(this).hasClass("chat_favorite")){
	                            condition = data[i].type === "group";
	                        }
	                        
	                        if(condition){
								chat_li += "<li class='msg_li'>";
	                            if($(this).hasClass("chat_unread")){
	                                chat_li += "<div class='sender_img' style='background-image: url(" + data[i].img + ")'></div>";
	                            }
	                            if($(this).hasClass("chat_favorite")){
	                                var img_arr = data[i].img.split(",");
	                                chat_li += "<div class='sender_img_wrap'>";

	                                for(var j = 0; j < img_arr.length; j++){
	                                    chat_li += "<div class='sender_img_group' style='background-image: url(" + img_arr[j] + ")'></div>";
	                                }
	                                chat_li += "</div>";
	                            }
								chat_li += "	<div class='msg_desc_wrap'>";
								chat_li += "	<div class='msg_title_wrap'>";
								

	                            chat_li += "	<div class='msg_info'>";

								if($(this).hasClass("chat_unread")){
                                    chat_li += "	<span class='sender_name'>" + data[i].name + "</span>";
                                }

                                if($(this).hasClass("chat_favorite")){
                                    var count = data[i].name.split(",").length;
                                    chat_li += "	<span class='sender_name'><span class='senders' title='" + data[i].name + "'>" + data[i].name + "</span><span class='people_count'>" + count + "</span></span>";
                                }
								if(new Date(data[i].date) < new Date().setHours(0, 0, 0, 0)){ //오늘 이전날짜에 전송된 메일인 경우
	                                if(new Date(data[i].date).getFullYear() < new Date().getFullYear()){ // 올해 이전의 날짜에 전송된 메일인 경우
	                                    //연,월,일 모두 표시
	                                    date = new Date(data[i].date).getFullYear() + "년 " + (new Date(data[i].date).getMonth()+1) + "월 " + new Date(data[i].date).getDate() + "일";
	                                    chat_li += "<span class='send_time'>" + date + "</span>";
	                                } else { // 오늘 이전의 날짜이지만 올해안에 전송된 메일인 경우
	                                    //월,일까지 표시
										if (userlang == "ko"){
											date = (new Date(data[i].date).getMonth()+1) + "월 " + new Date(data[i].date).getDate() + "일";
										}else{
											date = (new Date(data[i].date).getMonth()+1) + "-" + new Date(data[i].date).getDate();
										}
	                                    chat_li += "<span class='send_time'>" + date + "</span>";
	                                }
	                            } else { //오늘 전송된 메일인 경우
	                                //시간만 표시, 단 오전, 오후 구분
	                                if(new Date(data[i].date).getHours() < 12) { //오전 시간대 인경우
	                                    date = "오전 " + new Date(data[i].date).getHours() + ":" + addZero(new Date(data[i].date).getMinutes());
	                                } else {
	                                    date = "오후 " + (new Date(data[i].date).getHours() - 12) + ":" + addZero(new Date(data[i].date).getMinutes());
	                                }
	                                chat_li += "<span class='send_time'>" + date + "</span>";
	                            }

								chat_li += "	</div>"; // msg_info
								chat_li += "</div>"; /// msg_li
								
								chat_li += "<div class='msg_send_time_wrap'>";
								
	                           	chat_li += "		<span class='item_title' title='" + data[i].msg + "'>" + data[i].msg + "</span>";
	                            // chat_li += "<span class='send_time'>${data[i].date}</span>";
	                            if(data[i].unread_count !== 0){ // 안읽은 메시지가 있을경우만 표시
	                                chat_li += "<div class='unread_count_wrap'><span class='unread_count'>" + data[i].unread_count + "</span></div>";
	                            }
	                            chat_li += "</div>";
								chat_li += "</div>";
								chat_li += "</li>";
	                        }
	                    }*/


						///////////////////////////////////////////////////////////////////////////////////////////////////////////
						// 채팅 데이터 재설정
						var obj = gap.chat_room_info;
						var sbj = obj.ct;
	
						//팝업 채팅에서 사용할 대화방 리스트 묶음 함수
						var alarm_infos = [];
						for (var i = 0 ; i < sbj.length; i++){			
							//팝업 채팅에 표시할 각 방의 정보 변수
							var alarm_data = new Object();
							var info = sbj[i];			
							var wd = info.wdt;
							var wdfull = wd;
							alarm_data.wd = wd;					

							var temail = "";
							var tuid = "";
							var nam = "";
							var last_sq = "";		
							if (info.cty == 10){				
								last_sq = info.rsq;
								tuid = info.att[0];			
								if (gap.cur_el == tuid.el){
									nam = tuid.nm;
								}else{
									nam = tuid.enm;
								}
							}else{
								for (var j = 0 ; j < info.att.length; j++){
									var spl = info.att[j];				
									if (gap.search_cur_ky() == spl.ky){
										last_sq = spl.rsq;
									}else{
										tuid = spl;
										//내가 한국어면 무조건 한국어 ==> 같은 언어 타입이면 자국어 다른 언어 타입이면 영어로 표시
										if (gap.cur_el == "ko"){
											nam = spl.nm;
										}else{
											if (gap.cur_el == spl.el){
												nam = spl.onm;
											}else{
												nam = spl.enm;
											}
										}						
										break;
									}
								}
							}						
							var person_img = gap.person_photo_url(tuid);	
							if (info.att.length > 2){
								person_img = gap.team_photo_url();
							}			
							var html = "";
							var time = gap.change_date_localTime_only_time(wdfull.toString());					
							var bun = 0;
							var disname = "";
							var gubun = info.cid.substring(0,1);
							if (info.tle != ""){
								disname = info.tle;
							}else if (gubun == "n"){
								var rex = [];
								for (var ii = 0 ; ii < info.att.length; ii++){
									var xin = info.att[ii];
									if (xin.ky != gap.userinfo.rinfo.ky){
										if (typeof(xin.dpc) != "undefined"){
											rex.push(xin.nm);
										}						
									}
								}
								if (rex.length == 0){
									disname = gap.lang.no_chatroom;
									person_img = gap.team_photo();
								}else{
									disname = rex.join(",");
								}				
							}else if (gubun == "s"){
								if (nam == ""){
									disname = gap.lang.no_chatroom;
								}else{
									disname = nam + gap.lang.hoching;
								}				
							}			
							bun = info.att.length;
							var xid = gap.encodeid(info.cid);			
							alarm_data.xid = xid;			
	
							if (info.wty == 5 || info.wty == 6){		
								var xhtml = info.wmsg;
								//if ((info.wty == 6) && (typeof(info.ex.files) != "undefined")){
								if ((info.wty == 6) && info.ex && info.ex.files){
									info.ex = info.ex.files[0];
								}
								if (typeof(info.ex) != "undefined"){	
									if (typeof(info.ex.nm) != "undefined"){						
										var fname = info.ex.nm;
										fname = fname.replace("'","`");
										var url = gap.search_fileserver(info.ex.nid);	
										var downloadurl = url+ "/filedown" + info.ex.sf + "/" + info.ex.sn + "/" + encodeURIComponent(fname);						
										if (typeof(info.ex.caller) != "undefined"){
											if (info.ex.caller == "1" || info.ex.caller == "3"){
												var spl = downloadurl.split("/");
												var id = spl[6];
												var path = spl[5];
												var filename = spl[7];
												var fserver = "https://" + spl[2] + "/WMeet"
												downloadurl = gap.search_file_convert_server(fserver) + "/FDownload.do?id=" + path + "&ty=chat&md5=" + id + "&fn=" + filename + "&ky="+gap.search_cur_ky();
											}
										}						
										alarm_data.wmsg = fname;
										
									}else{
										alarm_data.wmsg = info.wmsg;
									}
									
								}else{
									alarm_data.wmsg = info.wmsg;
								}
								
							}else if (info.wty == 4){				
								alarm_data.wmsg = gap.HtmlToText(info.wmsg);
								
							}else if (info.wty == 3){	
								if (typeof(info.wmsg.msg) == "undefined"){
									alarm_data.wmsg =  "<img style=' height:35px' src='/resource/images/emoticons/"+info.wmsg+"' alt=''>";
									
								}else{
									alarm_data.wmsg =  "<img style=' height:35px' src='/resource/images/emoticons/"+info.wmsg.msg+"' alt=''>";
								}

							}else if (info.wty == 2){	
								//시스템 메시지 입장과 퇴장
								var spl = info.wmsg.split(" ");
								var opt = spl[0];					
								var lastr = info.wmsg.substring(2, info.wmsg.length); //영문명에 공백이 들어갈 수 있기 때문에 " "으로 split하면 잘못 계산되어 index로 짤라야 한다.
								var name = "";			
								var cel = lastr.split(":")[3];
								if (gap.cur_el == cel){
									name = lastr.split(":")[1];
								}else{
									name = lastr.split(":")[2];
									if (typeof(name) == "undefined"){
										name = lastr.split(":")[1];
									}
								}				
								var dis = "";
								if (opt == "e"){
									dis = name + gap.lang.enter_chat;
								}else{
									dis = name + gap.lang.exit_chat;
								}				
								alarm_data.wmsg = dis;
								
							}else if (info.wty == 3){	
								//이모티콘이 마지막 메시지일 경우 표시하지 않는다.
								
							}else if (info.wty == 21){				
								var lx = info.wmsg.split("-spl-");
								var tpx = lx[0];				
								if (tpx == "mail_link"){
									var mxg =  lx[1];

								}else{
									var mxg = info.wmsg.split("-spl-")[0];
								}				
								alarm_data.wmsg = mxg;
							}else{				
								if (info.wty == 100){
									//회수된 메세지인 경우
									alarm_data.wmsg = gap.lang.re_msg;

								}else{
									var xxx = gap.HtmlToText(info.wmsg);
									alarm_data.wmsg = xxx;
								}
							}			
							alarm_data.bun = 0;
							if (gubun == "n"){
								alarm_data.bun = bun;
							}			
							alarm_data.ucnt = 0;
							if (info.ucnt > 0){
								alarm_data.ucnt = info.ucnt;
							}			
	
							//팝업 채팅창의 데이터를 수집한다.
							alarm_data.nam = nam;
							alarm_data.person_img = person_img;
							alarm_data.time = time;
							alarm_data.disname = disname;
							alarm_data.wty = info.wty;
							alarm_data.pt = info.pt;
							alarm_infos.push(alarm_data);
						}
						///////////////////////////////////////////////////////////////////////////////////////////////////////////
						
						var chat_type;
						var sortingField = "wd";
						var list = alarm_infos.sort(function(a, b){
							return b[sortingField] - a[sortingField];
						});
						
						for(var i = 0; i < list.length; i++){
							var info = list[i];

							if($(this).hasClass("chat_unread")){
								condition = info.ucnt > 0;
							//	condition = info.pt === 0;
							}

							if($(this).hasClass("chat_favorite")){
								condition = info.pt > 0;
							}
							
							if(condition){
								if($(this).hasClass("chat_unread")){
									chat_type = "unread";
								}else if($(this).hasClass("chat_favorite")){
									chat_type = "favorite";
								}
								
								var dis_time = gap.change_date_default_for_popupchat(info.wd);
								
								chat_li += "<li class='msg_li' data-key='" + info.xid + "'>";
								chat_li += "<div class='sender_img' style='background-image: url(" + info.person_img + ")'></div>";
								chat_li += "	<div class='msg_desc_wrap'>";
								chat_li += "	<div class='msg_title_wrap'>";
								
	                            chat_li += "	<div class='msg_info'>";
								chat_li += "	<span class='sender_name'><span class='senders' title='" + info.disname + "'>" + info.disname + "</span>";
								if (info.bun != 0){
									chat_li += "		<span class='people_count'>" + info.bun + "</span>";
								}								
								chat_li += "	</span>";

								chat_li += "	<span class='send_time'>" + dis_time + "</span>";

								chat_li += "	</div>"; // msg_info
								chat_li += "</div>"; /// msg_li
								
								chat_li += "<div class='msg_send_time_wrap'>";
								
	                      //     	chat_li += "		<span class='item_title' title='" + data[i].msg + "'>" + data[i].msg + "</span>";

								if (info.wty == 5 || info.wty == 6){
									var ico = gap.file_icon_check(info.wmsg);
									chat_li += "<div class='item_img_wrap'>";
									chat_li += "	<span class='ico ico-attach "+ ico + "' id='chat_msg_icon_popup_" + info.xid + "'></span>";
									chat_li += "	<span class='item_title' style='line-height:15px;' id='chat_msg_popup_" + info.xid + "'>&nbsp;" + info.wmsg + "</span>";
									chat_li += "</div>";
								}else if (info.wty == 4){
									chat_li += "		<span class='item_title' id='chat_msg_popup_" + info.xid + "'>" + info.wmsg + "</span>";
								}else{				
									if (info.wty != 3){
										chat_li += "		<span class='item_title' id='chat_msg_popup_" + info.xid + "'>" + gap.textToHtml(info.wmsg) + "</span>";
									}else{
										chat_li += "		<span class='item_title' id='chat_msg_popup_" + info.xid + "'>" + info.wmsg + "</span>";
									}	
								}

	                            if(info.ucnt !== 0){ // 안읽은 메시지가 있을경우만 표시
	                                chat_li += "<div class='unread_count_wrap'><span class='unread_count'>" + info.ucnt + "</span></div>";
	                            }
	                            chat_li += "</div>";
								chat_li += "</div>";
								chat_li += "</li>";
	                        }
						}
						
						$("#chat_ul").empty();
						
						/// 미확인 채팅방이 없을 때
						if( chat_li === "" ){
							chat_li += "<div class='null_msg'>채팅방이 없습니다.</div>";	
						}
						
						$("#chat_ul").append(chat_li);
						
						// 이벤트 처리
						$("#chat_ul li").off().on('click', function(){
							var cid = $(this).data("key");
							if (chat_type == "unread"){
								$(this).remove();
								
							}else if (chat_type == "favorite"){
								$(this).find(".unread_count").remove();
							}
							
							// 안읽은 갯수 초기화
							var chat_list = gap.chat_room_info.ct;
							for (var i = 0 ; i < chat_list.length; i++){
								var info = chat_list[i];
								if (gap.encodeid(info.cid) == cid){
									info.ucnt = 0;				
									break;
								}
							}

							gap.chatroom_create_after2(cid);						
						});
					});
					
					// 버튼 클릭 처리
					if (sbj && sbj.length > 0){
						$(".category_chat.chat_unread").click();
					}
														
					$("#btn_chat_view_all").off().on('click', function(){
						$("#btn_menu_chat").click();
					});
					
				//	console.log(">>>>>>>>> 채팅 데이터 로드 성공");
					resolve(item);

	            /*},
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });*/

		});
		
	},
	
	
	//진행중인 설문 데이터 가져오는 함수
	"survey_data_load": function(flag){
		var _self = this;
		
		return new Promise(function(resolve, reject) {
			$.ajax({
	            type: "GET",
	            url: root_path +  "/resource/data/" + (userlang == "ko" ? "survey_data.txt" : "survey_data_en.txt"),
	            dataType: "json",
	            success: function(data){
					
					var item = "";
					
					item += "<div id='survey_box' class='content_item' idx='8'>";
					item += "	<div class='content_title_wrap'>";
					item += "		<h4 class='content_title'>" + gap.lang.ongoing_survey + "</h4>";
					
					item += "	</div>";
					item += "	<div class='btn_wrap'>";
					item += "		<button type='button' class='btn_blue'><span>" + gap.lang.survey_participation + "</span></button>";
					item += "	</div>";
					item += "</div>";
					

	    			var item_id = "item-survey";

					item = $.trim(item).replaceAll("\n\t", "");
					if( flag === "init" ){
						item = { w: 4,  h: 4, content: item, id: item_id }
						GridStack.init().addWidget(item);
					} else {
						$("[gs-id=" + item_id + "] .grid-stack-item-content").find(".content_item").remove();
						$("[gs-id=" + item_id + "] .grid-stack-item-content").append(item);
					}
					
				/////////// 앱 추가 /////////////
					if(flag === 'add'){
						item = { w: 4,  h: 4, content: item, id: item_id, noResize: true }
						GridStack.init().addWidget(item);
						
		            	gport.portlet_mask_draw(item_id);
		            }
	
	                var html = "";
	            
	                var today = new Date().setHours(0,0,0,0);
	                var end = new Date(data[0].period.end);
	
	                var start_day = new Date(data[0].period.start).getDay();
	                var end_day = new Date(data[0].period.end).getDay();
					
					html += "<div class='survey_content'>";
					html += "	<div class='survey_title_wrap'>";
					html += "		<div class='survey_desc_wrap'>";
					html += "			<li class='survey_desc'>" + ((today - end) / (1000 * 60 * 60 * 24)) + gap.lang.day + " " + gap.lang.remaining + "</li>";
					
					if(data[0].anonymous === "yes"){
                        html += "		<li class='survey_desc _anonymous'>" + gap.lang.real_name + "</li>"
                    }
                    if(data[0].anonymous === "no"){
                        html += "		<li class='survey_desc '>" + gap.lang.real_name + "</li>"
                    }
					
					html += "		</div>";
					html +=	"		<h4 class='survey_title' title='" + data[0].title + "'>" + data[0].title + "</h4>";
					html += "	</div>";
					html += "	<div class='survey_info_wrap'>";
					html += "		<div class='survey_info'>";
					
					/// 작성자 (이름 / 부서 / 직급)
					html += "			<div class='info_title'>" + gap.lang.maker + "</div><div>" + data[0].writer.name + " / " + data[0].writer.dept + " / " + data[0].writer.hierarchy + "</div>";
					html += "		</div>";
					html += "		<div class='survey_info'>";
					html += "			<div class='info_title'>" + gap.lang.survey_period + "</div>";
					html += "			<div>" + data[0].period.start + "(" + gcom.return_day(start_day) + ")" + " ~ " + data[0].period.end + "(" + gcom.return_day(end_day) + ")</div>";
					html += "		</div>";
					html += "	</div>";
					html += "</div>";
	
	                $("#survey_box .content_title_wrap").after(html);
	
	             //   console.log(">>>>>>>>> 설문조사 데이터 로드 성공");
					resolve(item);

	            },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });

		});
		
	},
	
	"bookmark_data_load": function(flag){
		var _self = this;
		
		return new Promise(function(resolve, reject) {
			
			$.ajax({
	    		type: "GET",
	    		url: root_path +  "/resource/data/bookmark_data.txt",
	    		dataType: "json",
	    		success: function(data){
					
					var item = "";
					
					item += "<div id='bookmark_app_box' class='content_item' idx='9'>";
					item += "	<div class='content_title_wrap'>";
					item += "		<h4 class='content_title'>즐겨찾는 APP</h4>";
					item += "		<button type='button' class='btn btn_setting'></button>";
					item += "	</div>";
					item += "	<div class='app_box_wrap'></div>";
					item += "</div>";
					
					
	    			var item_id = "item-bookmark_app";
					
					item = $.trim(item).replaceAll("\n\t", "");
					
					if( flag === "init" ){
						item = { w: 4,  h: 5, content: item, id: item_id }
						GridStack.init().addWidget(item);
					} else {
						$("[gs-id=" + item_id + "] .grid-stack-item-content").find(".content_item").remove();
						$("[gs-id=" + item_id + "] .grid-stack-item-content").append(item);
					}

			/////////// 앱 추가 /////////////
					if(flag === 'add'){
						item = { w: 4,  h: 5, content: item, id: item_id, noResize: true }
						GridStack.init().addWidget(item);
						
		            	gport.portlet_mask_draw(item_id);
		            }
	    			
	    			var html = '';
	    			
	    			for(var i = 0; i < data.length; i++){
						html += "<div class='app_box'>";
						html += "	<div class='app_info_wrap'>";
						html += "		<div class='app_img' style='background-image: url(" + data[i].img + ")'></div>";
						html += "		<div class='app_title'>" + data[i].title + "</div>";
						html += "	</div>";
						html += "</div>";
	                }
	                
	                $("#bookmark_app_box .app_box_wrap").append(html);
	    			
	    		//	console.log(">>>>>>>>> 북마크 데이터 로드 성공");
					resolve(item);

	    		},
	    		error: function(xhr, error){
	    			console.log(error);
					reject(error);
	    		}
	    	});

		});
		
	},
	
	"add_favorite_person": function(items){
		var _self = this;
		var _list = [];
		for (var i = 0; i < items.length; i++){
		//	if (i < 5){	// 5명까지만 저장 가능
				var _res = gap.convert_org_data(items[i]);
				_list.push(_res);				
		//	}
		}

		var surl = gap.channelserver + "/portal_favorite_save.km";
		var postData = JSON.stringify({
			"ky" : gap.userinfo.rinfo.ky,
			"list" : _list
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
					_self.draw_favorite_info();
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});				
	},
	
	"showCalEventDetail": function(event, callfrom, userinfo){
		var _self = this;
		var is_own = false;
		
		if ($('#todo_work_area .emp_item').hasClass('select')) {
			is_own = true;
		}

		// 내 일정이 아닌데 비공개 일정인 경우
		if (!is_own && event.event.ShowPS == '2') {
			return false;			
		}
		
		// 사용자 정보가 안넘어오면 즐겨찾기에 선택된 대상자를 기준으로 표시
		if (!userinfo) {
			var sel_user = $('#todo_work_area').find('.emp_item.select');	
			userinfo = sel_user.data('info');
			userinfo.is_own = (userinfo.ky == window.userky ? true : false);
		}

		var param = {
			unid : event.event.id,
			mailServer : event.event.mailServer ? event.event.mailServer : window.cur_mailserver,	//userinfo.mailServer,
			mailFile : event.event.mailFile ? event.event.mailFile : userinfo.mf,	//userinfo.mailFile,
			notesid : "CN=" + userinfo.ky + " " + userinfo.nm + "/O=Kmslab/C=kr"	//userinfo.id.replace(/\,/g, '/')
		};

		var url = location.protocol + "//" + window.mailserver + "/" + window.caldbpath + "/(ag_schedule_preview)?OpenAgent&" + $.param(param);
		this.preview_req = $.ajax({
			url : url,
			success: function(data){
				if (data.system_code == 'todo' || data.system_code == 'checklist') {                				
					// To-Do는 바로 레이어 표시
					var arr = data.system_key.split('^');
					var todo_key = arr[1];
					gTodo.compose_layer(todo_key);
					
				}else{
					// 일반 일정은 IFrame으로 내용 표시
					var sel_event_date = moment(event.event.sd).format('YYYY-MM-DD');
					_self.showDetailCalApp(event.event.id, sel_event_date, event.event);					
				}
			},
			error : function(){
				
			}
		});		
	},
	
	"showDetailCalApp" : function(unid, this_date, event){
		var user_info = $('#todo_work_area').find('.emp_item.select').data('info');
		
		// 일정 데이터 상세 페이지 연결
		var param = {
			unid: unid,
			ThisStartDate: this_date,
			callfrom: 'boxmain'
		};
		
		// 내 캘린더가 아닌 경우 사용자의 메일서버, 파일 정보 추가
		if (user_info.ky != window.userky) {
			param['opencalinfo'] = btoa(encodeURIComponent(user_info.ky));
		}
		
		var cal_url = location.protocol + "//" + window.mailserver + "/" + window.caldbpath + "/main?open&" + $.param(param);
		$('.calapp-detail-layer').remove();
		
		var $layer = $('<div class="calapp-detail-layer iframe"></div>');
		var $ifm = $('<iframe class="calapp-iframe"></iframe>');
		$ifm.attr('src', cal_url);
		$layer.append($ifm);
		
		gap.showBlock();
		
		var inx = parseInt(gap.maxZindex()) + 1;
		$layer.css('z-index', inx);
		
		$('body').append($layer);
	},
	
	"hideDetailCalApp" : function(is_refresh){
		$('.calapp-detail-layer').remove();
		gap.hideBlock();
	/*	if (is_refresh) {
			this.refreshPage();
		}*/
	},
	
	"draw_favorite_info": function(){
		var _self = this;
		var surl = gap.channelserver + "/portal_favorite_info.km";
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
				if (res.result == "OK"){
					var org_popup_data = [];
					$("#emp_bookmark .emp_img_wrap").empty();
					
					var list = [];
					if (res.data != null){
						for (var i = 0; i < res.data.list.length; i++) {
							var html = "";
							var user_info = gap.user_check(res.data.list[i]);
							html += "<div class='user_status_wrap' id='emp_bookmark_" + user_info.ky +"'>";
							html +=	"	<div class='user_img' data-empno='" + user_info.emp + "' style='background-image: url(" + user_info.user_img_url + "), url("+gap.none_img+")'>";
							html += "		<span class='user_status offline' data-status='pstatus_"+user_info.emp+"'>";
							html += "			<span class='status_circle'></span>";
							html +=	"		</span>";
							html +=	"	</div>";
							html +=	"</div>";
							
							list.push(user_info.emp);
							
							$("#emp_bookmark .emp_img_wrap").append(html);
							$("#emp_bookmark_" + user_info.ky).data("info", user_info);
							
							org_popup_data.push(gap.convert_org_data_reverse(res.data.list[i]));
						}						
					}

					var btn_html = "<div class='btn_plus_bookmark'><span class='add_img'></span></div>";
					$("#emp_bookmark .emp_img_wrap").append(btn_html);
					
					gcom.favorite_list = list;
						
				/*** 페이지에 처음 들어왔을 때,
					 즐겨찾기 목록이 다 표시된 후 즐겨찾기를 펼친다. ***/
					$("#emp_bookmark .emp_img_wrap").slideDown();
					
					/////// 즐겨찾기한 사원 마우스 이벤트 /////
					$("#emp_bookmark .user_status_wrap .user_img").on("click", function(e){
						var empno = e.currentTarget.dataset['empno'];
						
						gcom.todo_work_layer_draw("calendar", empno);
					});					
					
					//// 즐겨찾기한 인물 사진에 마우스올렸을 때 업무팝업창 표시
					$("#emp_bookmark .user_status_wrap").on("mouseenter", function(){
						gcom.emp_mask_draw($(this));
						$(this).find(".btn_del_bookmark_emp").show();
						gcom.bookmark_emp_popup_draw($(this));
					});
					
					$("#emp_bookmark .user_status_wrap").on("mouseleave", function(){
						$(this).find(".emp_mask").remove();
						$(this).find(".emp_work_popup").remove();
					});
					$("#emp_bookmark .user_status_wrap").on("mousewheel", function(e){
						e.preventDefault();
					});
					
					// 즐겨찾기 추가
					$("#emp_bookmark .btn_plus_bookmark").on("click", function(e){
						gap.showBlock();
						window.ORG.show(
							{
								'title': '대상자 선택',
								'single': false,
								'show_ext' : false, // 외부 사용자 표시 여부
								'select': 'person' // [all, team, person]
							}, 
							{
							//	getItems:function() { return []; },
								getItems:function() { return org_popup_data; },
								setItems:function(items) { /* 반환되는 Items */
									if (items.length == 0) return;
									_self.add_favorite_person(items);
								},
								onClose: function(){
									gap.hideBlock();
								}
							}
						);					
					});
					
					// 즐겨찾기 사용자 상태 가져오기
					//setTimeout(function(){
						gap.getUserStatus(gcom.favorite_list, "portal_favorite");		
					//}, 2000)
							
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});				
	},
	
	//사용자 개인영역(왼쪽영역)에 앱 목록 데이터 불러오는 함수
	"app_area_data_load": function(_qry){
		var _self = this;
		var surl = root_path + "/appstore_list.km";
		var postData = {
				"start" : "0",
				"perpage" : "100",
				"query" : _qry ? _qry : "",
				"admin" : "",
				"type" : "portlet"
			};
			
		if (_qry) {
			postData['category'] = "title";
		}			
		
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
					var _list = res.data.response;
					var _html = "";
					$("#app_area").remove();

					_html += "<div id='app_area'>";
					_html += "	<div class='inner'>";
					_html += "		<div class='app_search_wrap'>";
					_html += "			<div class='search_input_wrap'>";
					_html += "				<input type='text' id='input_app_search' class='search_input' value='" + (_qry ? _qry : "") + "' placeholder='" + gap.lang.input_search_query + "'>";
					_html += "				<div class='app_search_close_btn' style='display:none;'></div>"
					_html += "			</div>";
					_html += "			<button type='button' id='btn_app_search' class='app_search_btn'><span>" + gap.lang.search + "</span></button>";
					_html += "		</div>";
					_html += "		<div class='app_wrap_container'>";					

					_html += _self.draw_portlet_app(_list);

					_html += "		</div>";
					_html += "	</div>";
					_html += "</div>";
					
					$("#personal_area").append(_html);
					
					if (_qry){
						$("#app_area .app_search_close_btn").show();
					}
					
					$("#input_app_search").off().on("keydown", function(e){
						var keyword = $.trim($(this).val());
						
						if(e.keyCode === 13){
							if(keyword.length === 0){
								mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
								return false;
							} else {
								_self.app_area_data_load(keyword);
							}
						}
					});
					
					$("#btn_app_search").off().on("click", function(){
						var keyword = $.trim($("#input_app_search").val());
						
						if(keyword.length === 0){
							mobiscroll.toast({message:gap.lang.input_search_query, color:'danger'});
							return false;
						} else {
							_self.app_area_data_load(keyword);
						}						
					});
					
					$("#app_area .app_search_close_btn").off().on("click", function(){
						_self.app_area_data_load();
					});
					
					$("#app_area .app_box").off().on("click", function(e){
						
						var key = $(this).attr("key");
						
						//해당 key를 가진 아이템이 존재하지 않을 때만 추가
						if(key !== undefined && $("[gs-id=" + key + "]").length === 0){
							$(this).addClass("select");
						} else {
							$(this).removeClass("select");
							if(!$(this).hasClass("select")){ //선택해제한 앱의 콘텐츠를 제거한다.
								GridStack.init().removeWidget($("[gs-id=" + key + "]")[0]);
							}
						}
						
						if($(this).hasClass("select")){ //선택한 앱의 콘텐츠를 그린다.
							
							if(key === 'item-mail'){
								gport.mail_data_load('add');
							}
							if(key === 'item-schedule'){
								gport.sidecal = null;
								gport.schedule_data_load('add');
							}
							if(key === 'item-chat'){
								gport.chat_data_load('add');
							}
							if(key === 'item-appr'){
								gport.approval_data_load('add');
							}
							if(key === 'item-board'){
								gport.board_data_load('add');
							}
							if(key === 'item-holiday'){
								gport.holiday_data_load('add');
							}
							if(key === 'item-emp_search'){
								gport.emp_search_box_draw('add');
							}
							if(key === 'item-bookmark_app'){
								gport.bookmark_data_load('add');
							}
							if(key === 'item-survey'){
								gport.survey_data_load('add');
							}
							if(key === 'item-weather'){
								$("[gs-id=item-weather]").remove();
								if($("[gs-id=item-weather]").length === 0){

									gport.getCurrentPosition().then(function(data){
										//$("[gs-id=item-weather] .grid-stack-item-content").find(".content_item").remove();
									
										// data = 위치좌표, 좌표에 해당하는 장소 데이터
										return gport.weather_data_load(data, "add");
									});
									
								}
							}
						}

					});

					$("#app_area .app_box_title").off().on("click", function(){
						$(this).find(".btn_fold").toggleClass("open");
						$(this).closest(".app_wrap").find(".app_list").slideToggle(150);
					});
			
	              //  console.log(">>>>>>>>> 앱 목록 데이터 로드 성공");   					
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});			
	},
	
	"draw_portlet_app": function(_list){
		var _self = this;
		var _html = "";
		
		//// 사용자의 포틀릿 저장여부 확인하는 변수
		var save_chk = "";
		
		//// 저장되어있는 포틀릿 정보를 담을 변수
		var saved_portlet_data = "";
		
		//// 저장된 포틀릿의 이름을 담을 변수
		var saved_portlet = [];
		
		//// 저장된 포틀릿이 있는 경우
		if(this.main_item_position != ""){
			save_chk = true;
			saved_portlet_data = this.main_item_position;
			
			saved_portlet_data.forEach(function(portlet) {
			    saved_portlet.push(portlet.id);
			});
		} else {
			/// 저장된 포틀릿이 없는 경우
			save_chk = false;
		}		
		
		var myapps = $.map(_list, function(ret, key) {
		     if (ret.category_code == "MYAPPS"){
		        return ret;
		     }
		});
		myapps = myapps.sort(SortByDateTime);
		if (myapps.length > 0){

			_html += "			<div class='app_wrap'>";
			_html += "				<div class='app_box_title'><h4>" + myapps[0].category_name + "</h4><button type='button' id='' class='btn btn_fold open'></button></div>";
			_html += "				<div class='app_list'>";
			$.each(myapps, function(){
				//앱 버튼 아이콘 표시에 사용할 className만 뽑아낸다.
				var app_className = this.code.toLowerCase().replace("kp_", "");
				var app_key = "item-" + app_className;

				/// 저장한 포틀릿이 있는 경우
				if(save_chk){
					/// 사용자가 저장한 포틀릿만 선택한다.
					if(saved_portlet.includes(app_key)){
						_html += "					<div class='app_box " + app_className + " select' key='" + app_key + "'>";
					} else{
						_html += "					<div class='app_box " + app_className + " ' key='" + app_key + "'>";											
					}
				} else {
					/// 저장한 포틀릿이 없는 경우
					_html += "					<div class='app_box " + app_className + " select' key='" + app_key + "'>";
				}
				
				_html += "						<div class='app_box_inner'>";
				_html += "							<div class='app_box_img'></div>";
				_html += "							<span class='app_box_name'>" + (gap.curLang == "ko" ? this.menu_kr : this.menu_en) + "</span>";
				_html += "						</div>";
				_html +="					</div>";							
			});
			_html += "				</div>";
			_html += "			</div>";						
		}
		
		var workplace = $.map(_list, function(ret, key) {
		     if (ret.category_code == "WORKPLACE"){
		        return ret;
		     }
		});
		workplace = workplace.sort(SortByDateTime);
		if (workplace.length > 0){

			_html += "			<div class='app_wrap'>";
			_html += "				<div class='app_box_title'><h4>" + workplace[0].category_name + "</h4><button type='button' id='' class='btn btn_fold open'></button></div>";
			_html += "				<div class='app_list'>";
			$.each(workplace, function(){
				//앱 버튼 아이콘 표시에 사용할 className만 뽑아낸다.
				var app_className = this.code.toLowerCase().replace("kp_", "");
				var app_key = "item-" + app_className;

				/// 저장한 포틀릿이 있는 경우
				if(save_chk){
					/// 사용자가 저장한 포틀릿만 선택한다.
					if(saved_portlet.includes(app_key)){
						_html += "					<div class='app_box " + app_className + " select' key='" + app_key + "'>";
					} else{
						_html += "					<div class='app_box " + app_className + " ' key='" + app_key + "'>";											
					}
				} else {
					/// 저장한 포틀릿이 없는 경우
					_html += "					<div class='app_box " + app_className + " select' key='" + app_key + "'>";
				}
				
				_html += "						<div class='app_box_inner'>";
				_html += "							<div class='app_box_img'></div>";
				_html += "							<span class='app_box_name'>" + (gap.curLang == "ko" ? this.menu_kr : this.menu_en) + "</span>";
				_html += "						</div>";
				_html +="					</div>";							
			});
			_html += "				</div>";
			_html += "			</div>";						
		}
		
		var cowork = $.map(_list, function(ret, key) {
		     if (ret.category_code == "COWORK"){
		        return ret;
		     }
		});
		cowork = cowork.sort(SortByDateTime);
		if (cowork.length > 0){

			_html += "			<div class='app_wrap'>";
			_html += "				<div class='app_box_title'><h4>" + cowork[0].category_name + "</h4><button type='button' id='' class='btn btn_fold open'></button></div>";
			_html += "				<div class='app_list'>";
			$.each(cowork, function(){
				//앱 버튼 아이콘 표시에 사용할 className만 뽑아낸다.
				var app_className = this.code.toLowerCase().replace("kp_", "");
				var app_key = "item-" + app_className;

				/// 저장한 포틀릿이 있는 경우
				if(save_chk){
					/// 사용자가 저장한 포틀릿만 선택한다.
					if(saved_portlet.includes(app_key)){
						_html += "					<div class='app_box " + app_className + " select' key='" + app_key + "'>";
					} else{
						_html += "					<div class='app_box " + app_className + " ' key='" + app_key + "'>";											
					}
				} else {
					/// 저장한 포틀릿이 없는 경우
					_html += "					<div class='app_box " + app_className + " select' key='" + app_key + "'>";
				}
				
				_html += "						<div class='app_box_inner'>";
				_html += "							<div class='app_box_img'></div>";
				_html += "							<span class='app_box_name'>" + (gap.curLang == "ko" ? this.menu_kr : this.menu_en) + "</span>";
				_html += "						</div>";
				_html +="					</div>";							
			});
			_html += "				</div>";
			_html += "			</div>";						
		}
		
		var etc = $.map(_list, function(ret, key) {
		     if (ret.category_code == "ETC"){
		        return ret;
		     }
		});
		etc = etc.sort(SortByDateTime);
		if (etc.length > 0){

			_html += "			<div class='app_wrap'>";
			_html += "				<div class='app_box_title'><h4>" + etc[0].category_name + "</h4><button type='button' id='' class='btn btn_fold open'></button></div>";
			_html += "				<div class='app_list'>";
			$.each(etc, function(){
				//앱 버튼 아이콘 표시에 사용할 className만 뽑아낸다.
				var app_className = this.code.toLowerCase().replace("kp_", "");
				var app_key = "item-" + app_className;

				/// 저장한 포틀릿이 있는 경우
				if(save_chk){
					/// 사용자가 저장한 포틀릿만 선택한다.
					if(saved_portlet.includes(app_key)){
						_html += "					<div class='app_box " + app_className + " select' key='" + app_key + "'>";
					} else{
						_html += "					<div class='app_box " + app_className + " ' key='" + app_key + "'>";											
					}
				} else {
					/// 저장한 포틀릿이 없는 경우
					_html += "					<div class='app_box " + app_className + " select' key='" + app_key + "'>";
				}
				
				_html += "						<div class='app_box_inner'>";
				_html += "							<div class='app_box_img'></div>";
				_html += "							<span class='app_box_name'>" + (gap.curLang == "ko" ? this.menu_kr : this.menu_en) + "</span>";
				_html += "						</div>";
				_html +="					</div>";							
			});
			_html += "				</div>";
			_html += "			</div>";						
		}
		
		return _html;
		
		function SortByDateTime(a, b){
			var aSort = a.sort;
			var bSort = b.sort; 
			return ((aSort < bSort) ? -1 : ((aSort > bSort) ? 1 : 0));
		}		
	},

	//폴더 개인화
	"folder_personalize": function(){
		
            // 포틀릿 상단 버튼 영역 html
			var title_html = "";
			
			title_html += "<div id='folder_title_btn_wrap' class='btn_wrap'>";
			//title_html += "		<button type='button' id='btn_portlet_init' class='folder_btn'><span class='btn_img'></span><span>포틀릿 초기화</span></button>";
			/*title_html += "		<div id='layout_chkbox_wrap' class='chkbox_wrap'>";
			title_html += "			<label for='portlet_sort' class='chkbox_label'>";
			title_html += "				<input id='portlet_sort' class='layout_sort_chkbox' type='checkbox'>";
			title_html += "				<span class='chkbox'></span><span class='label_txt'>빈 공간 채우기</span>";
			title_html += "			</label>";
			title_html += "		</div>";*/
			title_html += "		<button type='button' id='btn_folder_cancel' class='folder_btn'><span class='btn_img'></span><span>" + gap.lang.Cancel + "</span></button>";
			title_html += "		<button type='button' id='btn_folder_save' class='folder_btn'><span class='btn_img'></span><span>" + gap.lang.basic_save + "</span></button>";
			title_html += "</div>";
            
            $("#btn_folder_setting").hide();

			gport.sidecal = null;
			
            gport.app_area_data_load();
			
			$(".user_folder_title_wrap").find("#folder_title_btn_wrap").remove();
            $(".user_folder_title_wrap").prepend(title_html);
			
			$("#content_container .item_mask").remove();
			
			//폴더 아이템에 씌울 마스크
            var mask_html = "<div class='item_mask'><button type='button' class='btn_item_delete'></button></div>";

			// 뉴스를 제외한 나머지 폴더아이템에 마스크를 씌운다
			for(var i = 0; i < $(".content_item").length; i++){
				if(!$(".content_item").eq(i).hasClass("stamp")){
					$(".content_item").closest(".grid-stack-item-content").eq(i).append(mask_html);
				}
			}
			
			//드래그 활성화
			gport.main_content_draggable();
			
			GridStack.init().movable('.grid-stack-item:not([gs-id=item-news])', true);
			//GridStack.init().resizable('.grid-stack-item:not([gs-id=item-news])', true);
			
            // 포틀릿 메인설정에서 아이템 제거 버튼
            $("#content_container .btn_item_delete").on("click", function(){
            	//제거하려는 아이템
            	var item = $(this).parent().siblings(".content_item");
				//제거하려는 아이템의 키
            	var key = $(this).closest(".grid-stack-item").attr("gs-id");

				GridStack.init().removeWidget($("[gs-id=" + key + "]")[0]);
				
    			$(this).closest(".item_mask").remove();
            	$(".app_box[key='" + key + "']").removeClass("select");
            });
			
			/*
			//포틀릿 빈 공간 채우기 버튼
			$("#portlet_sort").on("change", function(){
				if($(this).prop("checked")){
				
					GridStack.init().compact();
					var guide = $("<span id='portlet_sort_guide' style='display: none;'>드래그 시 빈 공간을 채웁니다. 비활성화하려면 체크해제 해주세요.</span>").fadeIn(150);
					
					if($("#portlet_sort_guide").length === 0){
						$(this).closest(".chkbox_wrap").append(guide);
					}
					
					if($(guide).length !== 0){
						setTimeout(function(){
							$(guide).fadeOut(150);
						}, 2000);						
					}
					
				} else {
					$("#portlet_sort_guide").fadeOut(150).remove();
				}
				
			});
			*/
			
			// 포틀릿 저장 버튼
			$("#btn_folder_save").on("click", function(){

				gport.portlet_draw_flag = true;
								
				$("#app_area, .input_folder_name, #folder_title_btn_wrap, #content_container .item_mask").remove();
                $(".user_folder_title, #btn_folder_setting").show();
				$(".personal_box").show();
				
				$("#content_container").append("<div id='portlet_loading'><span class='icon'></span>포틀릿 불러오는 중..</div>");
				//GridStack.init().removeWidget();
				$("#content_container").children(".grid-stack-item").hide();
	            
				gport.main_layout_save(); //위치좌표 저장
				
				//스크롤 최상단으로
				$("#area_right").scrollTop(0);
				
				//저장한 포틀릿 데이터가 없을 때
				if(gport.main_item_position === ""){
					////추가되는 콘텐츠에 이벤트 바인드
					GridStack.init().on('added', function(event, items) {
						//로딩 아이콘 제거
						$("#portlet_loading").remove();
						
						items.forEach(function(item) {
						////////// 뉴스 //////////
							if(item.id === "item-news"){
								gport.news_data_load();
							}
						////////// 결재 //////////
							if(item.id === "item-appr"){
								gport.approval_data_load();
							}
						////////// 오늘일정 //////////
							if(item.id === "item-schedule"){
								gport.sidecal = null;
								gport.schedule_data_load();
							}
						////////// 나의연차 //////////
							if(item.id === "item-holiday"){
								gport.holiday_data_load();
							}
						////////// 메일 //////////
							if(item.id === "item-mail"){
								gport.mail_data_load();
							}
						////////// 게시판 //////////
							if(item.id === "item-board"){
								gport.board_data_load();
							}
						////////// 직원조회 //////////
							if(item.id === "item-emp_search"){
								gport.emp_search_box_draw();
							}
						////////// 채팅방 //////////
							if(item.id === "item-chat"){
								gport.chat_data_load();
							}
						////////// 즐겨찾는 APP //////////
							if(item.id === "item-bookmark_app"){
								gport.bookmark_data_load();
							}
						////////// 설문조사 //////////
							if(item.id === "item-survey"){
								gport.survey_data_load()
							}
						////////// 날씨 //////////
							if(item.id === "item-weather"){
								
								var item = "";
						
								item +=	"<div id='weather_box' class='content_item' idx='1'>";
								item +=		"<div class='content_title_wrap'><h4 class='content_title'>날씨정보</h4><button type='button' id='btn_weather_refresh' class='btn btn_refresh'></button></div>";
								item +=		"<div id='weather_wait'><div class='loading_icon'></div><span>날씨 정보를 불러오는 중...</span></div>";;
					        	item +=	"</div>";
	
								$("[gs-id=item-weather] .grid-stack-item-content").find(".content_item").remove();
								$("[gs-id=item-weather] .grid-stack-item-content").append(item);
								
								gport.getCurrentPosition().then(function(data){
									// data = 위치좌표, 좌표에 해당하는 장소 데이터
									return gport.weather_data_load(data, "");
								});
							}
							
						});
						
					});
					
				}
				
				//GridStack.init().removeWidget(); // 포틀릿 초기화된 시점
				// 포틀릿 초기화된 시점에 로딩중인 시점에 포틀릿 로딩 표시
				
				//gport.main_layout_load();

			});
            // 취소버튼
            $("#btn_folder_cancel").on("click", function(){
	
				gport.portlet_draw_flag = true;
	
                $("#app_area, .input_folder_name, #folder_title_btn_wrap, #content_container .item_mask").remove();
                $("#btn_folder_setting").show();
				$("#personal_area .personal_box").show();
				
				// 포틀릿을 이전의 상태로 되돌린다.
				gport.main_layout_load();
				GridStack.init().disable();
				
				//스크롤 최상단으로
				$("#area_right").scrollTop(0);

				$("#content_container .item_mask").remove();
            });
		
	},
	
	//사용자 콘텐츠 드래그 활성화하는 함수
	"main_content_draggable": function(){
		
		var grid = gport.main_grid_init();
		
		if(grid !== null){
			grid.enable();			
		}
	},
	
	///메인설정에서 포틀릿 위젯 추가 시 마스크 씌우는 함수
	"portlet_mask_draw": function(app_id){
		 
		var item_mask = "<div class='item_mask'><button type='button' class='btn_item_delete'></button></div>";
		
		if( $("[gs-id=" + app_id + "] .grid-stack-item-content").length <= 1 && $("[gs-id=" + app_id + "] .item_mask").length === 0 ){
			$("[gs-id=" + app_id + "] .grid-stack-item-content").append(item_mask);						
		}

		/************ 위젯이 추가되고 해당 위젯의 위치로 스크롤 이동 ************/
		setTimeout(function(){
			if($("[gs-id=" + app_id + "]").length !== 0){
				$("#area_right").animate({
					/// 해당 위젯으로 스크롤 이동
					"scrollTop": $("#area_right").scrollTop() + $("[gs-id=" + app_id + "]").offset().top
				}, 400, function(){
					
						/// 스크롤 이동 후 해당 위젯 배경색 효과
							$("[gs-id=" + app_id + "] .grid-stack-item-content").find(".item_mask").animate({
					    	"background-color": "#518dcf"
						}, 200, function() {
							$("[gs-id=" + app_id + "] .grid-stack-item-content").find(".item_mask").animate({
								"background-color": "rgba(255,255,255, 0.7)"
							});
						}
					);
					
				});
			}
		}, 300);
		/************ 위젯이 추가되고 해당 위젯의 위치로 스크롤 이동 ************/
		
        //$(".content_item").addClass("item_show");

		//드래그 활성화	
		gport.main_content_draggable();
		
		// 포틀릿 콘텐츠 좌측상단 제거(-) 버튼
        $("[gs-id=" + app_id + "] .grid-stack-item-content .btn_item_delete").off().on("click", function(){
        	//제거하려는 아이템의 키
        	var key = $(this).closest(".grid-stack-item").attr("gs-id");
			
			GridStack.init().removeWidget($("[gs-id=" + key + "]")[0]);
			
			$(this).closest(".item_mask").remove();
        	$(".app_box[key='" + key + "']").removeClass("select");
        });
		
	},
	
/////// 현재 위치의 정보 가져오는 함수 ////
	"get_location_data": function(position){
		return new Promise(function(resolve, reject) {
		
			naver.maps.Service.reverseGeocode({
		        coords: new naver.maps.LatLng(position.lat, position.lng),
		    }, function(status, response) {
		        if (status !== naver.maps.Service.Status.OK) {
					reject("위치 데이터 로드 실패!!!!");
		            return alert('Something wrong!');
		        }
		
		        var result = response.v2, // 검색 결과의 컨테이너
		            items = result.results, // 검색 결과의 배열
		            address = result.address; // 검색 결과로 만든 주소
			
					var data = result.results[0].region;
					
				//	console.log(">>>>>>>>> 위치 데이터 로드 성공!!!!");
					resolve(data);
					
		        // do Something
		    });
			
			/*
			var pos = [position.lng, position.lat].join(",");
			var apiKey = "19FDA370-44CC-3990-AB36-4136267A9DC1";
			
			$.ajax({
				url: "https://api.vworld.kr/req/address?",	
				type: "GET",	
				dataType: "jsonp",	
				data: {	
					service: "address",	
					request: "getaddress",	
					version: "2.0",	
					crs: "EPSG:4326",	
					type: "parcel",
					point: pos,
					format: "json",	
					errorformat: "json",
					key: apiKey
				},
				success: function (result) {
					if(result.response.status === "OK") {
						var data = result.response.result[0];
						if(data !== undefined){
							resolve(data);						
						}
					} else {
						resolve(null);
					}
					
				},
				error: function(xhr, error) {
					reject(error);
				}
			});*/
			
		});
	},
	
	// 현재위치의 좌표 리턴해주는 함수
	"getCurrentPosition": function() {
	  
		return new Promise( function(resolve, reject) {
			
			//옵션
			var options = {
		    	timeout: 15000, // 15초 내에 위치 정보를 가져오지 못하면 실패로 처리
			    maximumAge: 0, // 이전 위치 정보를 사용하지 않음
			   	enableHighAccuracy: true // 가능한 정확한 위치를 요청
		  	};
	
		  	if (navigator.geolocation) {
			    navigator.geolocation.getCurrentPosition(
					async function(position) { // 위치정보 가져왔을 때
						//격자 좌표로 변환
						var gridXY = gport.dfs_xy_conv("toXY", position.coords.latitude, position.coords.longitude);
						
						//지역 데이터 로드
						var location = await gport.get_location_data(gridXY);
			        	resolve([gridXY, location]);

			      	},
			      	function(error) { // 위치정보 가져오는데 실패했을 때
			        	reject(error);
			      	},
				  	options //위치정보 가져오는 옵션
				);
		  	} else {
			    reject("이 브라우저에서는 위치정보가 지원되지 않습니다.");
			}
			
		});
	},
	
	//위경도 변환 함수
	"dfs_xy_conv": function(code, v1, v2) {
			
			var RE = 6371.00877; // 지구 반경(km)
		    var GRID = 5.0; // 격자 간격(km)
		    var SLAT1 = 30.0; // 투영 위도1(degree)
		    var SLAT2 = 60.0; // 투영 위도2(degree)
		    var OLON = 126.0; // 기준점 경도(degree)
		    var OLAT = 38.0; // 기준점 위도(degree)
		    var XO = 43; // 기준점 X좌표(GRID)
		    var YO = 136; // 기1준점 Y좌표(GRID)
			
	        var DEGRAD = Math.PI / 180.0;
	        var RADDEG = 180.0 / Math.PI;
	
	        var re = RE / GRID;
	        var slat1 = SLAT1 * DEGRAD;
	        var slat2 = SLAT2 * DEGRAD;
	        var olon = OLON * DEGRAD;
	        var olat = OLAT * DEGRAD;
	
	        var sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
	        sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
	        var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
	        sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
	        var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
	        ro = re * sf / Math.pow(ro, sn);
	        var rs = {};
	        if (code == "toXY") {
	            rs['lat'] = v1;
	            rs['lng'] = v2;
	            var ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
	            ra = re * sf / Math.pow(ra, sn);
	            var theta = v2 * DEGRAD - olon;
	            if (theta > Math.PI) theta -= 2.0 * Math.PI;
	            if (theta < -Math.PI) theta += 2.0 * Math.PI;
	            theta *= sn;
	            rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
	            rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
	        }
	        else {
	            rs['x'] = v1;
	            rs['y'] = v2;
	            var xn = v1 - XO;
	            var yn = ro - v2 + YO;
	            ra = Math.sqrt(xn * xn + yn * yn);
	            if (sn < 0.0) - ra;
	            var alat = Math.pow((re * sf / ra), (1.0 / sn));
	            alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;
	
	            if (Math.abs(xn) <= 0.0) {
	                theta = 0.0;
	            }
	            else {
	                if (Math.abs(yn) <= 0.0) {
	                    theta = Math.PI * 0.5;
	                    if (xn < 0.0) - theta;
	                }
	                else theta = Math.atan2(xn, yn);
	            }
	            var alon = theta / sn + olon;
	            rs['lat'] = alat * RADDEG;
	            rs['lng'] = alon * RADDEG;
	        }
			
	        return rs;

    },

}