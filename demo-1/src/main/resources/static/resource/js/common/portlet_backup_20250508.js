/* jshint esversion : 6 */

function gPortlet(){
	_this = this;
	_this.main_item_position = "";
	_this.weather_retry_cnt = 3;
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
				var strVal = data.split("^#^");
				
				var ceo_msg = strVal[3].slice(0, 300) + "..";
				
				/// CEO 메시지 표시				
				$("#ceo_contents").html(ceo_msg);
				$("#ceo_contents").addClass("active");
				
				$("#btn_to_ceo_mail").off().on("click", function(){
					var _url = location.protocol + "//" + window.mailserver.replace("one", "mail2") + "/board/ceo.nsf/0/" + strVal[2] + "?opendocument";
					gap.open_subwin(_url, "1200","900", "yes" , "", "yes");
				});
				console.log(">>>>>>>>>CEO 메시지 로드 성공");
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
				
			    console.log("!!!>!!!>>!!>>>>>>>>>>사용자 컨텐츠 모두 로드성공<<<<<<<<<<<<!!");
				
			}).catch(function(error) {
			    console.error("사용자 컨텐츠 로드 실패", error);
			});
			
		} else {
			/////////포틀릿을 저장한 상태일 때
			
			////추가되는 콘텐츠에 이벤트 바인드
			grid.on('added', function(event, items) {
				
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
					console.log(">>>>>>> 포틀릿 저장--성공--");
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
	
					console.log(">>>>>>>>>뉴스 데이터 로드 성공");
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
				dataType: "json",
				success: function(data){
					
					var item = "";
					item += "<div id='approval_box' class='content_item' app='approval' idx='0'>";
					item += "	<div style='overflow: hidden;margin-bottom: 16px;display: flex;flex-direction: column;height: 100%;'>";
					item += "		<div class='content_title_wrap'><h4 class='content_title'>" + gap.lang.aprv + "</h4><button type='button' class='btn arrow_right'></button></div>";
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
							dataType : "json",
							success : function(res){
								$('#approval_ul').empty();
								
								for(var i = 0; i < res.length; i++){	
									var unid = res[i]['@unid'];
									if (unid != ""){
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
								
								//해당 카테고리의 결재문서가 없을 때
								if(res.length === 0){
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
					
					console.log(">>>>>>>>결재문서 데이터 로드 성공");
					
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
			console.log(coord_data);
			
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
				
	            console.log("6초 초과! 날씨 API 재호출");

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
					
					console.log(">>>>>>> 데이터를 가져오기위해 3번의 호출을 했지만 날씨 정보를 가져오는데 실패했습니다.");
					console.log(">>>>>> 잠시후 다시 새로고침 해주세요.");
					
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
					console.log("응답 시간: " + elapsedTime + "ms");
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
						
		                console.log(">>>>>>>>>>날씨정보 데이터 로드 성공");
						resolve(item);
						
					} else {
						///////// 날씨 데이터 가져오기 실패했을 때
						
	                	$("#weather_wait").remove();
						$("#weather_box .weather_info_wrap").remove();
						
						if( $("#weather_reject").length === 0 ){							
							$("#weather_box").append(reject_html);
						}
						
						console.log("날씨 정보를 가져오는데 실패했습니다.");
						
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
	                
	                console.log(">>>>>>>>>>날씨정보 데이터 로드 성공");
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
					item += "	<div class='content_title_wrap'><h4 class='content_title'>" + gap.lang.mail + "</h4><button type='button' class='btn arrow_right'></button></div>";
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
					
					category += "<li class='category category_mail mail_unread unread active' id='tab_mail_inbox_unread' title='" + gap.lang.unread_mail + "'><span class='category_name'>" + gap.lang.unread_mail + "</span><span class='doc_count'>" + inbox_unread + "</span></li>";
					//category += "<li class='category category_mail mail_all'><span class='category_name'>" + gap.lang.inbox_mail + "</span><span class='doc_count'>" + inbox + "</span></li>";
					category += "<li class='category category_mail mail_all' id='tab_mail_inbox' title='" + gap.lang.inbox_mail + "'><span class='category_name'>" + gap.lang.inbox_mail + "</span><span class='doc_count'></span></li>";
					
					$("#mail_category").append(category);
					
					$(".category_mail").on("click", function(){
						
						$(this).siblings().removeClass("active");
						$(this).addClass("active");
						
						var cate = $(this).attr("id").replace("tab_mail_", "");
	
	                    var mail_li = '';
	                    var date = '';
	                    var condition = '';

						$.ajax({
							type : "GET",
							url : location.protocol + "//" + window.mailserver + "/" + window.maildbpath + "/api/data/collections/name/XML_" + cate + "?restapi&&start=0&ps=10&entrycount=false",
							xhrFields : {
								withCredentials : true
							},				
							dataType : "json",
							success : function(res){
								$('#mail_ul').empty();
								
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
									var html = "<div class='null_msg'>" + gap.lang.no_emails + "</div>";
									
									$('#mail_ul').append(html);
								}
								
								
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
							},
							error : function(e){
								gap.gAlert(gap.lang.errormsg);
								return false;
							}
						});
	                });

					$(".category_mail.unread").click();
					
					console.log(">>>>>>>>메일문서 데이터 로드 성공");
					
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
	                item += 	"<div class='content_title_wrap'><h4 class='content_title'>" + gap.lang.my_annual_leave + "</h4><button type='button' class='btn arrow_right'></button></div>";
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
		
		return new Promise(function(resolve, reject) {
			
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
						
	                console.log(">>>>>오늘일정 데이터 로드 성공");	
					resolve(item);

	            },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });

		});
		
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
	
	//게시판 데이터 불러오는 함수
	"board_data_load": function(flag){
		var _self = this;
		
		return new Promise(function(resolve, reject) {

			$.ajax({
	            type: "GET",
	            url: root_path +  "/resource/data/" + (userlang == "ko" ? "board_data.txt" : "board_data_en.txt"),
	            dataType: "json",
	            success: function(data){
		
					var item = "";
					
					item += "<div id='board_box' class='content_item' idx='5'>";
					item += "	<div class='content_title_wrap'><h4 class='content_title'>" + gap.lang.bbs + "</h4><button type='button' class='btn arrow_right'></button></div>";
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

	                console.log(">>>>>>>>>>>>게시판 데이터 로드 성공");
					
					resolve(item);

	            },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });
	
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
		var loading = "<div id='list_loading'><span class='loading_icon'></span><span>목록 불러오는 중..</span></div>";
		
		/// 게시판 데이터 로드
		data_load();
		
		function data_load(opt){
			
			$.ajax({
				type : "GET",
				url : location.protocol + "//" + window.mailserver + "/" + bbsdbpath + "/api/data/collections/name/" + viewname + "?restapi&&start=" + start + "&ps=10&entrycount=false",
				xhrFields : {
					withCredentials : true
				},				
				dataType : "json",
				beforeSend: function(){
					if( $("#list_loading").length === 0 ) {
						//// 페이지를 불러오기 전에 로딩
						$('#board_ul').append(loading);
					}
				},
				success : function(res){
					
					if(opt !== "add"){
						$('#board_ul').empty();
					}
					
					if( res.length === 0 ){
						/// 목록 데이터가 없다면 감지 중단
						observer.disconnect();
						$("#list_loading").remove();
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
							console.log(">>>>>>>>>>>>>>>게시판 새 목록 불러온다.");
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
			
			$.ajax({
	    		type: "GET",
	    		url: root_path +  "/resource/data/" + (userlang == "ko" ? "emp_search_box_data.txt" : "emp_search_box_data_en.txt"),
	    		dataType: "html",
	    		success: function(data){
	    			var item = $(data);

					var item_id = "item-emp_search";
					
					if( flag === "init" ){
						item = { w: 4,  h: 3, id: item_id, content: data, minH: 3 }
						GridStack.init().addWidget(item);
					} else {
						$("[gs-id=" + item_id + "] .grid-stack-item-content").find(".content_item").remove();
						$("[gs-id=" + item_id + "] .grid-stack-item-content").append(item);
					}
					
			/////////// 앱 추가 /////////////
					if(flag === 'add'){
						item = $.trim(item).replaceAll("\n\t", "");
						item = { w: 4,  h: 3, id: item_id, content: data, noResize: true }
						GridStack.init().addWidget(item);
						
		            	gport.portlet_mask_draw(item_id);
		            }

					resolve(item);
					
	    		},
	    		error: function(xhr, error){
					console.log(error);
					reject(error);
	    		}
	    	});
		});
		
	},
	
	//채팅방 데이터 불러오는 함수
	"chat_data_load": function(flag){
		var _self = this;
		
		return new Promise(function(resolve, reject) {
			$.ajax({
	            type: "get",
	            url: root_path +  "/resource/data/" + (userlang == "ko" ? "chat_data.txt" : "chat_data_en.txt"),
	            dataType: "json",
	            success: function(data){

					var item = "";
					
					item += "<div id='chat_box' class='content_item' idx='7'>";
					item += "	<div class='content_title_wrap'>";
					item += "		<h4 class='content_title'>" + gap.lang.chatroom + "</h4>";
					item += "		<button type='button' class='btn arrow_right'></button>";
					item += "	</div>";
					item += "	<div style='overflow: hidden; flex: 1; margin-bottom: 16px;'>";
					item += "		<div class='list_wrap'>";
					item += "			<div id='chat_category' class='category_wrap'></div>";
					item += "			<div id='chat_ul' class='msg_ul'></div>";
					item += "		</div>";
					item += "	</div>";
					item += "	<div class='btn_wrap'>";
					item += "		<button type='button' class='btn_white'><span>" + gap.lang.expand + "</span></button>";
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
	
	
					/// Event
					
	                var personal_chat_count = 0;
	                    group_chat_count = 0;
	                for(var i = 0; i < data.length; i++){
	                    if(data[i].type === 'personal'){
	                        personal_chat_count += 1;
	                    }
	                    if(data[i].type === 'group'){
	                        group_chat_count += 1;
	                    }
	                }

					var category = "";
					
					category += "<li class='category category_chat chat_personal active'>";
					category += "	<span class='category_name'>" + gap.lang.individual + "</span>";
					category += "	<span class='doc_count'>" + personal_chat_count + "</span>";
					category += "</li>";
					category += "<li class='category category_chat chat_group'>";
					category += "	<span class='category_name'>" + gap.lang.group + "</span>";
					category += "	<span class='doc_count'>" + group_chat_count + "</span>";
					category +=	"</li>";
					
	                $("#chat_category").append(category);
	
	                $(".category_chat").on("click", function(){ 
	
	                    var chat_li = '';
	
	                    var condition = '';
	
	                    $(this).siblings().removeClass("active");
	                    $(this).addClass("active");
	                    
	
	                    for(var i = 0; i < data.length; i++){
	                        if($(this).hasClass("chat_personal")){
	                            condition = data[i].type === "personal";
	                            
	                        }
	                        if($(this).hasClass("chat_group")){
	                            condition = data[i].type === "group";
	                        }
	                        
	                        if(condition){
								chat_li += "<li class='msg_li'>";
	                            if($(this).hasClass("chat_personal")){
	                                chat_li += "<div class='sender_img' style='background-image: url(" + data[i].img + ")'></div>";
	                            }
	                            if($(this).hasClass("chat_group")){
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

								if($(this).hasClass("chat_personal")){
                                    chat_li += "	<span class='sender_name'>" + data[i].name + "</span>";
                                }

                                if($(this).hasClass("chat_group")){
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
	                    }
	
	                    $("#chat_ul").empty();
	                    $("#chat_ul").append(chat_li);
	
	                });
	
	                $(".category_chat.chat_personal").click();
	
	                console.log(">>>>>>>>>채팅 데이터 로드 성공");
					resolve(item);

	            },
	            error: function(xhr, error){
	                console.log(error);
					reject(error);
	            }
	        });

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
					item += "		<button type='button' class='btn arrow_right'></button>";
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
	
	                console.log(">>>>>>>>설문조사 데이터 로드 성공");
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
	    			
	    			console.log(">>>>>>>북마크 데이터 로드 성공");
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
			if (i < 5){	// 5명까지만 저장 가능
				var _res = gap.convert_org_data(items[i]);
				_list.push(_res);				
			}
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
					
					if (res.data != null){
						for (var i = 0; i < res.data.list.length; i++) {
							var html = "";
							var user_info = gap.user_check(res.data.list[i]);
							html += "<div class='user_status_wrap' id='emp_bookmark_" + user_info.ky +"'>";
							html +=	"	<div class='user_img' data-empno='" + user_info.emp + "' style='background-image: url(" + user_info.user_img_url + "), url("+gap.none_img+")'>";
							html += "		<span class='user_status off'>";
							html += "			<span class='status_circle'></span>";
							html +=	"		</span>";
							html +=	"	</div>";
							html +=	"</div>";
							
							$("#emp_bookmark .emp_img_wrap").append(html);
							$("#emp_bookmark_" + user_info.ky).data("info", user_info);
							
							org_popup_data.push(gap.convert_org_data_reverse(res.data.list[i]));
						}						
					}

					var btn_html = "<div class='btn_plus_bookmark'><span class='add_img'></span></div>";
					$("#emp_bookmark .emp_img_wrap").append(btn_html);
					
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
			
	                console.log(">>>>>>앱 목록 데이터 로드 성공");   					
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
					
					console.log("위치 데이터 로드 성공!!!!");
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