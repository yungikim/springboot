$(function () {
    
    /* todo_그래프 그리는 함수 */
    function todo_graph_draw() {

        var ctx = $("#todo_graph");

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [
                    '메일',
                    '쪽지',
                    '일정',
                    '결재',
                    '업무'
                ],
                datasets: [{
                    label: 'label',
                    data: [50, 5, 3, 15, 25],
                    backgroundColor: [
                        '#1668BC',
                        '#E871DC',
                        '#F69D52',
                        '#81D84F',
                        '#3BC3D7'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4,
                }]
            },
            options: {
                scales: {
                    x: {
                        border: false,
                        grid: {
                            color: "transparent",
                            borderColor: "transparent"
                        },
                        ticks: {
                            display: false
                        },
                    },
                    y: {
                        border: false,
                        grid: {
                            color: "transparent",
                            borderColor: "transparent"
                        },
                        ticks: {
                            display: false
                        },
                        beginAtZero: true,
                    }
                },
                plugins: {
                    subtitle: {
                        display: true,
                        text: 'Custom Chart Subtitle'
                    },
                    legend: {
                        position: "bottom",
                        title: {
                            padding: 10
                        },
                        labels: {
                            boxWidth: 8,
                            boxHeight: 8,
                            font: {
                                color: "#777777",
                                size: 14,
                            },
                            usePointStyle: true,
                            pointStyle: "circle",
                        }
                    }
                },
                radius: 128,
                cutout: 110
            }
        });

    }
    
	function todo_list_data_load(){
		
		$.ajax({
			type: "GET",
			url: "./resource/data/todo_list_data.txt",
			dataType: "json",
			success: function(data){
				
				var html = "<div id='todo_list_ul'>";
				
				for(var i = 0; i < data.length; i++){
					if(data[i].checked === 'false'){
						html += "<div class='todo_li' key='" + data[i].key + "'><input type='checkbox' id='" + data[i].key + "' value='value'><label for='" + data[i].key + "'></label>" + data[i].title + "</div>";						
						
					} else {
						html += "<div class='todo_li checked' key='" + data[i].key + "'><input type='checkbox' id='" + data[i].key + "' value='value'><label for='" + data[i].key + "'></label>" + data[i].title + "</div>";
					}
				}
				html += "<div></div>";
				html += "</div>";
				
				$("#todo_list_wrap .box_content").append(html);
				
				console.log(">>>>>>>>>>todo 리스트 로드 성공");
				
			},
			error: function(xhr, error){
				console.log(error);				
			}
		});
		
	}

    function login_data_load(){
        $.ajax({
            type: "GET",
            url: "./resource/data/login_data.txt",
            dataType: "json",
            success: function(data){
                
                //왼쪽영역 즐겨찾기 사원이미지 표시
                $(".user_name").text(data[0].user_data.name); // 현재 사용자의 이름 표시
                $("#area_top_status .user_img").css({   //상단영역 유저이미지 표시
                    "background-image": "url(" + data[0].user_data.img + ""
                })
                var html = "";

                html = `
                    <div id="user_content_wrap" class="personal_box">
                        <div class='content_box'>
                            <div class='user_wrap'>
                                <div class='user_img' style='background-image: url(${data[0].user_data.img}'></div>
                                <div class='user_info_wrap'>
                                    <div class='user_dept'>${data[0].user_data.dept}</div>
                                    <div class='user_name'>${data[0].user_data.name}</div>
                                </div>
                            </div>
                            <button type='button' class='btn btn_setting'></button>
                        </div>
                    </div>
                    <div id='emp_bookmark' class="personal_box">
                        <div class='title_wrap'><h4 class='title'>즐겨찾기</h4><button type='button' id='emp_folder' class='btn btn_fold open'></button></div>
                            <div class='box_content emp_img_wrap'>
                `;

                for (var i = 0; i < data[0].emp_data.length; i++) {

                    html += `<div class="user_status_wrap">`;
                    html += `<div class="user_img" style='background-image: url(${data[0].emp_data[i].img})'>`;
                    if (data[0].emp_data[i].status === "on") {
                        html += `<span class="user_status on">`
                    }
                    if (data[0].emp_data[i].status === "off") {
                        html += `<span class="user_status off">`
                    }

                    html += `<span class="status_circle"></span>
                                </span>
                            </div>
                            </div> `;
                }

                html += `
                            <div class='btn_plus_bookmark'><span class='add_img'></span></div>
                        </div>
                        </div>
                    </div>
                    <div id='todo_graph_wrap' class="personal_box">
                        <div class='title_wrap'><h4 class='title'>TO-DO 그래프</h4><button type='button' class='btn btn_fold open'></button></div>
                        <div class='box_content'>
                            <canvas id='todo_graph'></canvas>
                            <div class='btn_wrap'>
                                <button type='button' class='btn_white'><span>전체보기</span></button>
                            </div>
                        </div>
                    </div>
                    <div id='todo_list_wrap' class="personal_box">
                        <div class='title_wrap'><h4 class='title'>TO-DO LIST</h4><button type='button' class='btn btn_fold'></button></div>
                        <div class='box_content'></div>
                    </div>
                    `;
                    
                var folder_title_html = `
                    <div id='folder_title_wrap' class='user_folder_title_wrap'>
                        <h2 class='user_folder_title'>${data[0].user_data.name} 폴더</h2>
                        <button type='button' id='btn_folder_setting'><span class='setting_img'></span><span>메인설정</span></button>
                    </div>
                `

                $("#personal_area").append(html); //사용자 개인영역 안의 콘텐츠를 그린다
                $("#user_folder_content").prepend(folder_title_html);
                
                //왼쪽 영역 사용자영역 폴더 열고닫기
                $(".btn_fold").on("click", function(){
                    $(this).toggleClass("open")
                    $(this).parent().siblings(".box_content").toggle();
                });

                //폴더 메인설정 버튼
                $("#btn_folder_setting").on("click", function(){
                    folder_personalize();
                });

                todo_graph_draw();
				todo_list_data_load();
				
				console.log(">>>>>>>>로그인 데이터 로드 성공");
            },
            error: function(xhr, error){
                console.log(error);
            }
        });

		/*$.ajax({
			type: "GET",
			url: "./resource/data/left_menu_data.txt",
			dataType: "json",
			success: function(data){
				console.log(">>>>>>>>왼쪽 메뉴 데이터 로드 성공");
			},
			error: function(xhr, error){
				console.log(error);
			}
		});*/
    }
    
    //오른쪽 영역 그리는 함수
    function area_right_draw(){
		
		news_data_load(); //뉴스
        approval_data_load(); //결재문서
        weather_data_load(); //날씨정보
        schedule_data_load(); //오늘일정
        holiday_data_load(); //나의연차
        mail_data_load(); //메일
        board_data_load(); //게시판
        emp_search_box_draw(); //직원조회
        chat_data_load(); //채팅방
		bookmark_data_load(); //즐겨찾는 APP
        survey_data_load(); //설문조사
		
		
        //folder_masonry_layout(); //masonry 레이아웃으로 표시
    }

    // 폴더 안의 콘텐츠를 MASONRY 레이아웃으로 보여주는 함수
    function folder_masonry_layout(){
        $("#content_container").masonry({
            columnWidth: '.content_item',
            itemSelector: '.content_item',
            gutter: 16,
            percentPosition: true
        });
    }
	
	function news_data_load(){
		$.ajax({
			type: "GET",
			url: "./resource/data/news_data.txt",
			dataType: "json",
			success: function(data){
				
				var item = `
					<div id='news_box' class='content_item'>
					<div class='new_wrap_container'>`;
										
					for(var i = 0; i < data.length; i++){
		                item += `<div class='news_wrap'><div class='news_img' style='background-image: url(${data[i].img})'></div>
		                <div class='news_title_wrap'>
		                        <div class='date'><span>${data[i].date}</span></div>
		                        <div class='title'>${data[i].title}</div>
                        </div>
						</div>`;
					}
                        item += `
						</div>
						<div class='btn_wrap'>
                            <button type='button' class='btn btn_prev'>
                            <button type='button' class='btn btn_next'>
                        </div>
                        <div class='dot_wrap'>`
						for(var i = 0; i < data.length; i++){
							if(i === 0){
	                            item += "<span class='page_dot active'></span>";
							} else {
								item += "<span class='page_dot'></span>";
							}
						}
                        item += `</div>
                </div>
				`;
				
				//뉴스 데이터는 고정(stamp)
				$("#content_container").append(item).masonry( 'stamp', $("#news_box") );
				
				//뉴스콘텐츠 마우스 이벤트
		        $("#news_box").on("mouseenter", function(){
		            $(this).children(".btn_wrap").fadeIn(150);
		        });
		        $("#news_box").on("mouseleave", function(){
		            $(this).children(".btn_wrap").fadeOut(150);
	       		});
			},
			error: function(xhr, error){
			}
		});
	}
	
    //결재문서 데이터 불러오는 함수
    function approval_data_load(flag){
        $.ajax({
            type: "GET",
            url: "./resource/data/approval_data.txt",
            dataType: "json",
            success: function(data){
				
				var item = `
					<div id='approval_box' class='content_item' app='approval'>
		                <div>
		                    <div class='content_title_wrap'><h4 class='content_title'>결재문서</h4><button type='button' class='btn arrow_right'></button></div>
		                    <div class='list_wrap'>
		                        <div id='approval_category' class='category_wrap'></div>
		                        <div id='approval_ul' class='doc_ul'></div>
		                    </div>
		                </div>
	                    <div class='btn_wrap'>
	                        <button type='button' class='btn_white'><span>전체보기</span></button>
	                        <button type='button' class='btn_blue'><span>문서작성</span></button>
	                    </div>
	                </div>
				`;
				
				
				if(flag === 'add'){
                	var item_mask = `
                		<div class='item_mask'><button type='button' class='btn_item_delete'></button></div>
                	`;
	                $("#content_container").append(item).masonry( 'prepended', $("#approval_box"));
	                $("#approval_box").append(item_mask);
	                
                } else {
					$("#content_container").append(item).masonry( 'appended', $("#approval_box"));
                }
				
				// 폴더아이템 제거 버튼
	            $(".btn_item_delete").on("click", function(){
	            	//제거하려는 아이템
	            	var item = $(this).closest(".content_item");
					//제거하려는 아이템의 키
	            	var key = item.attr("app");
	            					
	    			$(this).closest(".item_mask").remove();
					$("#content_container").masonry('remove', item).masonry('layout');
	
	            	$(".app_box[key='" + key + "']").removeClass("select");
	            });
				
				
				
				
                var approval_show_length = 8; //메인에서 보여질 갯수
                
                var category = '';
                
                var wating = 0;
                var proceeding = 0;
                var companion = 0;
                var complete = 0;
					
                for(var i = 0; i < data.length; i++){
                    if(data[i].status === 'wating'){
                        wating += 1;
                    }
                    if(data[i].status === 'proceeding'){
                        proceeding += 1;
                    }
                    if(data[i].status === 'companion'){
                        companion += 1;
                    }
                    if(data[i].status === 'complete'){
                        complete += 1;
                    }
                }

                category += "<li class='category category_approval wating active'><span class='category_name'>진행대기</span><span class='doc_count'>" + wating + "</span></li>";
                category += "<li class='category category_approval proceeding'><span class='category_name'>진행중</span><span class='doc_count'>" + proceeding + "</span></li>";
                category += "<li class='category category_approval companion'><span class='category_name'>반려</span><span class='doc_count'>" + companion + "</span></li>";
                category += "<li class='category category_approval complete'><span class='category_name'>완료</span><span class='doc_count'>" + complete + "</span></li>";
                
                $("#approval_category").append(category);
                $(".category_approval").on("click", function(){
                    
                    $(this).siblings().removeClass("active");
                    $(this).addClass("active");

                    var html = '';

                    for(var i = 0; i < data.length; i++){

                        if($(this).hasClass(data[i].status)){

                            html += "<li class='doc_li approval_li'>";
                            html += "<span class='item_title'>" + data[i].doc_title + "</span>";
                            html += "<div class='item_writer_wrap'>";
                            html += "<span class='item_writer'>" + data[i].writer + "</span>";
                            html += "<span> · </span>";
                            html += "<span class='item_date'>" + data[i].created + "</span>";
                            html += "</div>";
                            html += "</li>";
                            
                        }
                    }
                    $("#approval_ul").empty();
                    $("#approval_ul").append(html);

                });

                $(".category_approval.wating").click();

                console.log(">>>>>>>>결재문서 데이터 로드 성공");
            },
            error: function(xhr, error){
                console.log(error);
            }
        });
    }

    //날씨 데이터 불러오는 함수
    function weather_data_load(){

        $.ajax({
            type: "GET",
            url: "./resource/data/weather_data.txt",
            dataType: "json",
            success: function(data){
                
                var item = `
                	<div id='weather_box' class='content_item'>
                        <div class='content_title_wrap'><h4 class='content_title'>날씨정보</h4><button type='button' class='btn btn_refresh'></button></div>
               		</div>
                `;
                
                $("#content_container").append(item).masonry( 'appended', $("#weather_box") );
                
                var html = '';

                html = `
                    <div class='weather_info_wrap'>
                    <div class='loacation_wrap'>
                        <div class='location_img'></div><div class='city'>${data[0].location.city}</div>/<div class='town'>${data[0].location.town}</div>
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
                `
                
                $("#weather_box").append(html);
                
                console.log(">>>>>>>>>>날씨정보 데이터 로드 성공");
            },
            error: function(xhr, error){
                console.log(error);
            }
        });
        
    }

    //메일 데이터 불러오는 함수
    function mail_data_load(flag){

        $.ajax({
            type: "GET",
            url: "./resource/data/mail_data.txt",
            dataType: "json",
            success: function(data){
				
				var item = `
				<div id='mail_box' class='content_item' app='mail'>
                <div>
                    <div class='content_title_wrap'><h4 class='content_title'>메일</h4><button type='button' class='btn arrow_right'></button></div>
                    <div class='list_wrap'>
                        <div id='mail_category' class='category_wrap'></div>
                        <div id='mail_ul' class='msg_ul'></div>
                    </div>
                </div>
                    <div class='btn_wrap'>
                        <button type='button' class='btn_white'><span>전체보기</span></button>
                        <button type='button' class='btn_blue'><span>메일작성</span></button>
                    </div>
                </div>`;
                
                if(flag === 'add'){
                	var item_mask = `
                		<div class='item_mask'><button type='button' class='btn_item_delete'></button></div>
                	`;
	                $("#content_container").append(item).masonry( 'prepended', $("#mail_box") );
	                $("#mail_box").append(item_mask);
	                
                } else {
					$("#content_container").append(item).masonry( 'appended', $("#mail_box") );                
                }
				
				// 폴더아이템 제거 버튼
	            $(".btn_item_delete").on("click", function(){
	            	//제거하려는 아이템
	            	var item = $(this).closest(".content_item");
					//제거하려는 아이템의 키
	            	var key = item.attr("app");
	            					
	    			$(this).closest(".item_mask").remove();
					$("#content_container").masonry('remove', item).masonry('layout');
	
	            	$(".app_box[key='" + key + "']").removeClass("select");
	            });
            
                var unread_count = 0;
                
                for(var i = 0; i < data.length; i++){
                    if(data[i].category === 'unread'){
                        unread_count += 1;
                    }
                }
                
                var category = '';

                category += "<li class='category category_mail mail_unread unread active'><span class='category_name'>안읽은메일함</span><span class='doc_count'>" + unread_count + "</span></li>";
                category += "<li class='category category_mail mail_all'><span class='category_name'>받은메일함</span><span class='doc_count'>" + data.length + "</span></li>";
				
                $("#mail_category").append(category);
                
                $(".category_mail").on("click", function(){

                    $(this).siblings().removeClass("active");
                    $(this).addClass("active");

                    // if($(this).hasClass("unread")){ //안읽은메일함
                    //     mail_list_draw(data, "unread");
                    // } else { //받은 메일함(모든 메일)
                    //     mail_list_draw(data, "all");
                    // }

                    var mail_li = '';
                    var date = '';
                    
                    var condition = '';

                    for(var i = 0; i < data.length; i++){
                        if($(this).hasClass('mail_unread')) {
                            condition = data[i].category === "unread";
                        }
                        if($(this).hasClass('mail_all')){
                            condition = data[i].category === "unread" || data[i].category === "read";
                        }
                        
                        if(condition){ //조건에 맞는 메일만 목록에 표시
                            mail_li += `<li class='msg_li'>
                            <div class='msg_title_wrap'>
                            <div class='sender_img' style='background-image: url(${data[i].img})'></div>
                            <div class='msg_info'>`
                            mail_li += "<span class='sender_name'>" + data[i].sender + "</span>";
                            mail_li += "<span class='item_title'>" + data[i].title + "</span>";
                            mail_li += `</div>
                            </div>
                            <div class='msg_send_time_wrap'>`
                            if(new Date(data[i].date) < new Date().setHours(0, 0, 0, 0)){ //오늘 이전날짜에 전송된 메일인 경우
                                if(new Date(data[i].date).getFullYear() < new Date().getFullYear()){ // 올해 이전의 날짜에 전송된 메일인 경우
                                    //연,월,일 모두 표시
                                    date = new Date(data[i].date).getFullYear() + "년 " + (new Date(data[i].date).getMonth()+1) + "월 " + new Date(data[i].date).getDate() + "일";
                                    mail_li += "<span class='send_time'>" + date + "</span>";
                                } else { // 오늘 이전의 날짜이지만 올해안에 전송된 메일인 경우
                                    //월,일까지 표시
                                    date = (new Date(data[i].date).getMonth()+1) + "월 " + new Date(data[i].date).getDate() + "일";
                                    mail_li += "<span class='send_time'>" + date + "</span>";
                                }
                            } else { //오늘 전송된 메일인 경우
                                //시간만 표시, 단 오전, 오후 구분
                                if(new Date(data[i].date).getHours() < 12) { //오전 시간대 인경우
                                    date = "오전 " + new Date(data[i].date).getHours() + ":" + addZero(new Date(data[i].date).getMinutes());
                                } else {
                                    date = "오후 " + (new Date(data[i].date).getHours() - 12) + ":" + addZero(new Date(data[i].date).getMinutes());
                                }
                                mail_li += "<span class='send_time'>" + date + "</span>";
                            }
                            mail_li += `<div class='msg_btn_wrap'>`
                                if(data[i].bookmark === 'yes'){
                                    mail_li += `
                                        <button type='button' class='btn btn_bookmark_mail active'></button>
                                        <button type='button' class='btn btn_mail_remove'></button>
                                        `;
                                } else {
                                    mail_li += `
                                        <button type='button' class='btn btn_bookmark_mail'>
                                        <button type='button' class='btn btn_mail_remove'></button>
                                        `;
                                }
                                mail_li += `</div>
                                </div>
                                </li>`
                        }
                    }

                    $("#mail_ul").empty();
                    $("#mail_ul").append(mail_li);
					
                });

                $(".category_mail.unread").click();
            },
            error: function(xhr, error){
                console.log(error);
            }
        });
        
    }

    //나의연차 데이터 불러오는 함수
    function holiday_data_load(){
        $.ajax({
            type: "GET",
            url: "./resource/data/holiday_data.txt",
            dataType: "json",
            success: function(data){
            	
            	var item = `
            		<div id='holidays_box' class='content_item'>
                    <div class='content_title_wrap'><h4 class='content_title'>나의연차</h4><button type='button' class='btn arrow_right'></button></div>
                    <div class='holiday_info_wrap'></div>
                    <div class='btn_wrap'>
                        <button type='button' class='btn_blue'><span>연차신청</span></button>
                    </div>
                </div>
            	`;
            	
            	$("#content_container").append(item).masonry( 'appended', $("#holidays_box") );
            	
                var html = `
                    <div class='holiday_info'>
                        <div class='remain_title_wrap'><span class='remain_title'>잔여연차</span><span class='remain_count'>${data[0].all - data[0].used}일</span></div>
                        <div class='detail_count_wrap'><span class='detail_count_title'>발생연차</span><span class='detail_count'>${data[0].all}</span></div>
                        <div class='detail_count_wrap'><span class='detail_count_title'>사용연차</span><span class='detail_count'>${data[0].used}</span></div>
                    </div>
                    <div class='holiday_img'></div>
                `;

                $(".holiday_info_wrap").append(html);
            },
            error: function(xhr, error){
               console.log(error); 
            }
        })
    }
    
    //오늘일정 날짜 데이터 불러오는 함수
    function schedule_data_load(flag){
        $.ajax({
            type: "GET",
            url: "./resource/data/schedule_data.txt",
            dataType: "json",
            success: function(data){
                                
                var item = `
                                
	        	<div id='schedule_box' class='content_item' app='calendar'>
	            <div class='content_title_wrap'><h4 class='content_title'>오늘일정</h4><button type='button' class='btn arrow_right'></button></div>
	            <div class='calendar_wrap'>
	                <div id='calendar'></div>
	                <div id='schedule_info_box'><div class='schedule_info_wrap'></div></div>
	            </div>
	            <div class='btn_wrap'>
	                <button type='button' class='btn_white'><span>전체보기</span></button>
	                <button type='button' class='btn_blue'><span>일정작성</span></button>
	            </div>
	        </div>
	        `;
	        
	        if(flag === 'add'){
            	var item_mask = `
            		<div class='item_mask'><button type='button' class='btn_item_delete'></button></div>
            	`;
                $("#content_container").append(item).masonry( 'prepended', $("#schedule_box") );
                $("#schedule_box").append(item_mask);
                
            } else {
				$("#content_container").append(item).masonry( 'appended', $("#schedule_box") );
            }
			
			// 폴더아이템 제거 버튼
            $(".btn_item_delete").on("click", function(){
            	//제거하려는 아이템
            	var item = $(this).closest(".content_item");
				//제거하려는 아이템의 키
            	var key = item.attr("app");
            					
    			$(this).closest(".item_mask").remove();
				$("#content_container").masonry('remove', item).masonry('layout');

            	$(".app_box[key='" + key + "']").removeClass("select");
            });
            
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
		            datepicker_event(select_date, today_time, data);
		        },
		        onPageLoaded: function (e, inst) {
		            var select_date = new Date(inst._active); // 선택한 날짜
		            datepicker_event(select_date, today_time, data);
		            
		        },
		        
		    });
				
                console.log(">>>>>오늘일정 데이터 로드 성공");
            },
            error: function(xhr, error){
                console.log(error);
            }
        })
    }

    // 오늘일정 데이트피커 이벤트
    function datepicker_event(select, today, data){
        
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
	            $(".schedule_ul").html("<li>일정 없음</li>");
	        }
        
    }

    //게시판 데이터 불러오는 함수
    function board_data_load() {
        $.ajax({
            type: "GET",
            url: "./resource/data/board_data.txt",
            dataType: "json",
            success: function(data){
				
				var item = `
					<div id='board_box' class='content_item'>
                <div>
                    <div class='content_title_wrap'><h4 class='content_title'>게시판</h4><button type='button' class='btn arrow_right'></button></div>
                    <div class='list_wrap'>
                        <div class='category_wrap'>
                            <li class='category category_board board_all active'><span class='category_name'>전체</span></li>
                            <li class='category category_board board_notif'><span class='category_name'>공지</span></li>
                            <li class='category category_board board_holiday'><span class='category_name'>경조사</span></li>
                            <li class='category category_board board_manual'><span class='category_name'>매뉴얼</span></li>
                        </div>
                        <div id='board_ul' class='doc_ul'></div>
                    </div>
                </div>
                    <div class='btn_wrap'>
                        <button type='button' class='btn_white'><span>전체보기</span></button>
                    </div>
                </div>
				`;
				
				$("#content_container").append(item).masonry( 'appended', $("#board_box") );
				
                $(".category_board").on("click", function(e){
                    
                    $(this).siblings().removeClass("active");
                    $(this).addClass("active");
                    
                    var html = '';
                    var condition = '';

                    for(var i = 0; i < data.length; i++){
                        if($(this).hasClass("board_all")){
                            condition = data[i].category === "notification" || data[i].category === "holiday" || data[i].category === "manual";
                        }
                        if($(this).hasClass("board_notif")){
                            condition = data[i].category === "notification";
                        }
                        if($(this).hasClass("board_holiday")){
                            condition = data[i].category === "holiday";
                        }
                        if($(this).hasClass("board_manual")){
                            condition = data[i].category === "manual";
                        }
                        if(condition){
                            html += `
                            <li class='doc_li'>
                            <span class='item_title'>${data[i].title}</span>
                            <div class='item_writer_wrap'>
                            <span class='item_date'>${data[i].date}</span>
                            </div>
                            </li>`
                        }
                    }
                      
                    $("#board_ul").empty();
                    $("#board_ul").append(html);
                });

                $(".category_board.board_all").click();
                
                console.log(">>>>>>>>>>>>게시판 데이터 로드 성공");
            },
            error: function(xhr, error){
                console.log(error);
            }
        });
    }
    
    function emp_search_box_draw(){
    	$.ajax({
    		type: "GET",
    		url: "./resource/data/emp_search_box_data.txt",
    		dataType: "html",
    		success: function(data){
    			var item = data;			
    	
    			$("#content_container").append(item).masonry( 'appended', $("#emp_search_box") );
    		},
    		error: function(xhr, error){
    		}
    	});
    	
    }
    
    //채팅방 데이터 불러오는 함수
    function chat_data_load(){

        $.ajax({
            type: "get",
            url: "./resource/data/chat_data.txt",
            dataType: "json",
            success: function(data){
				
				var item = `
					<div id='chat_box' class='content_item'>
                <div>
                    <div class='content_title_wrap'><h4 class='content_title'>채팅방</h4><button type='button' class='btn arrow_right'></button></div>
                    <div class='list_wrap'>
                        <div id='chat_category' class='category_wrap'></div>
                        <div id='chat_ul' class='msg_ul'></div>
                    </div>
                </div>
                    <div class='btn_wrap'>
                        <button type='button' class='btn_white'><span>전체보기</span></button>
                    </div>
                </div>
				`;
		
				$("#content_container").append(item).masonry( 'appended', $("#chat_box") );

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
                
                var category = `<li class='category category_chat chat_personal active'><span class='category_name'>개인</span><span class='doc_count'>${personal_chat_count}</span></li>
                <li class='category category_chat chat_group'><span class='category_name'>그룹</span><span class='doc_count'>${group_chat_count}</span></li>`;

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

                            chat_li += `<li class='msg_li'>
                            <div class='msg_title_wrap'>`;
                            
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
                            chat_li += `<div class='msg_info'>`;
                                if($(this).hasClass("chat_personal")){
                                    chat_li += `<span class='sender_name'>${data[i].name}</span>`;
                                }
                                if($(this).hasClass("chat_group")){
                                    var count = data[i].name.split(",").length;
                                    chat_li += `<span class='sender_name'>${data[i].name} <span class='people_count'>${count}</span></span>`;
                                }
                                chat_li +=`<span class='item_title'>${data[i].msg}</span>
                            </div>
                            </div>
                            <div class='msg_send_time_wrap'>`;
                            if(new Date(data[i].date) < new Date().setHours(0, 0, 0, 0)){ //오늘 이전날짜에 전송된 메일인 경우
                                if(new Date(data[i].date).getFullYear() < new Date().getFullYear()){ // 올해 이전의 날짜에 전송된 메일인 경우
                                    //연,월,일 모두 표시
                                    date = new Date(data[i].date).getFullYear() + "년 " + (new Date(data[i].date).getMonth()+1) + "월 " + new Date(data[i].date).getDate() + "일";
                                    chat_li += "<span class='send_time'>" + date + "</span>";
                                } else { // 오늘 이전의 날짜이지만 올해안에 전송된 메일인 경우
                                    //월,일까지 표시
                                    date = (new Date(data[i].date).getMonth()+1) + "월 " + new Date(data[i].date).getDate() + "일";
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
                            // chat_li += "<span class='send_time'>${data[i].date}</span>";
                            if(data[i].unread_count !== 0){ // 안읽은 메시지가 있을경우만 표시
                                chat_li += `<div class='unread_count_wrap'><span class='unread_count'>${data[i].unread_count}</span></div>`
                            }
                            chat_li += `
                            </div>
                            </li>`
                        }
                    }

                    $("#chat_ul").empty();
                    $("#chat_ul").append(chat_li);

                });

                $(".category_chat.chat_personal").click();

                console.log(">>>>>>>>>채팅 데이터 로드 성공");
            },
            error: function(xhr, error){
                console.log(error);
            }
        });
        
    }
    
    //진행중인 설문 데이터 가져오는 함수
    function survey_data_load(){

        $.ajax({
            type: "GET",
            url: "./resource/data/survey_data.txt",
            dataType: "json",
            success: function(data){
            
            	var item = `
            		<div id='survey_box' class='content_item'>
                    <div class='content_title_wrap'><h4 class='content_title'>진행중인 설문</h4><button type='button' class='btn arrow_right'></button></div>
                    
                    <div class='btn_wrap'>
                        <button type='button' class='btn_blue'><span>설문참여</span></button>
                    </div>
                </div>
            	`;
            	
    			$("#content_container").append(item).masonry( 'appended', $("#survey_box") );

                var html = "";
            
                var today = new Date().setHours(0,0,0,0);
                var end = new Date(data[0].period.end);

                var start_day = new Date(data[0].period.start).getDay();
                var end_day = new Date(data[0].period.end).getDay();

                

                html += `
                        <div class='survey_title_wrap'>
                        <div class='survey_desc_wrap'>
                        <li class='survey_desc'>${(today - end) / (1000 * 60 * 60 * 24)}일 남음</li>
                        `
                            if(data[0].anonymous === "yes"){
                                html += "<li class='survey_desc _anonymous'>실명</li>"
                            }
                            if(data[0].anonymous === "no"){
                                html += "<li class='survey_desc '>실명</li>"
                            }
                        html += `</div>
                        <div>
                            <h4>${data[0].title}</h4>
                        </div>
                    </div>
                    <div class='survey_info_wrap'>
                        <div class='survey_info'>
                            <div class='info_title'>작성자</div><div>${data[0].writer.dept} ${data[0].writer.name} ${data[0].writer.hierarchy}</div>
                        </div>
                        <div class='survey_info'>
                            <div class='info_title'>설문기간</div><div>${data[0].period.start}${"(" + return_day(start_day) + ")"} ~ ${data[0].period.end}${"(" + return_day(end_day) + ")"}</div>
                        </div>
                    </div>
                `;

                $("#survey_box .content_title_wrap").after(html);

                console.log(">>>>>>>>설문조사 데이터 로드 성공");
            },
            error: function(xhr, error){
                console.log(error);
            }
        })
        
    }
    
    function bookmark_data_load(){
    	$.ajax({
    		type: "GET",
    		url: "./resource/data/bookmark_data.txt",
    		dataType: "json",
    		success: function(data){
    		
    			var item = `
    				<div id='bookmark_app_box' class='content_item'>
                    <div class='content_title_wrap'><h4 class='content_title'>즐겨찾는 APP</h4><button type='button' class='btn btn_setting'></button></div>
                    <div class='app_box_wrap'>`;
                    
                    /*for(var i = 0; i < bookmark_app_list.length; i++){
                        html += `<div class='app_box'>
                                <div class='app_info_wrap'>
                                    <div class='app_img' style='background-image: url(./resource/images/${bookmark_app_list[i].img}'></div>
                                    <div class='app_title'>${bookmark_app_list[i].title}</div>
                                </div>
                            </div>`;
                    }*/
                    html += `</div>
                </div>
    			`;
    			
    			$("#content_container").append(item).masonry( 'appended', $("#bookmark_app_box") );
				folder_masonry_layout();
    			
    			var html = '';
    			
    			for(var i = 0; i < data.length; i++){
                    html += `<div class='app_box'>
                            <div class='app_info_wrap'>
                                <div class='app_img' style='background-image: url(${data[i].img})'></div>
                                <div class='app_title'>${data[i].title}</div>
                            </div>
                        </div>`;
                }
                
                $("#bookmark_app_box .app_box_wrap").append(html);
    			
    			console.log(">>>>>>>북마크 데이터 로드 성공");
    		},
    		error: function(xhr, error){
    			console.log(error);
    		}
    	});
    }
    
    //폴더 개인화
    function folder_personalize(){

        var folder_name = $(".user_folder_title").text(); // 폴더 명
            
            // 폴더 타이틀 영역에 넣을 html
            var title_html = `
                <input type='text' class='input_folder_name' value='${folder_name}'>
                <div id='folder_title_btn_wrap' class='btn_wrap'>
                    <button type='button' id='btn_folder_cancel' class='folder_btn'><span class='btn_img'></span><span>취소</span></button>
                    <button type='button' id='btn_folder_save' class='folder_btn'><span class='btn_img'></span><span>저장</span></button>
                </div>
            `;
            
            //폴더 아이템에 씌울 마스크
            var mask_html = `
                <div class='item_mask'><button type='button' class='btn_item_delete'></button></div>
            `;
            
            $(".user_folder_title, #btn_folder_setting").hide();

            app_area_data_load();
            $(".user_folder_title_wrap").prepend(title_html);
            $("#content_container").find(".content_item:not('#news_box')").append(mask_html); // 뉴스를 제외한 나머지 폴더아이템에 마스크를 씌운다
            
            // 폴더아이템 제거 버튼
            $(".btn_item_delete").on("click", function(){
            	//제거하려는 아이템
            	var item = $(this).closest(".content_item");
				//제거하려는 아이템의 키
            	var key = item.attr("app");
            					
    			$(this).closest(".item_mask").remove();
				$("#content_container").masonry('remove', item).masonry('layout');

            	$(".app_box[key='" + key + "']").removeClass("select");
            });
            
            // 취소버튼
            $("#btn_folder_cancel").on("click", function(){
            	
                $("#app_area, .input_folder_name, #folder_title_btn_wrap, .item_mask").remove();
                $(".user_folder_title, #btn_folder_setting").show();
                
                $("#content_container").empty();
                area_right_draw();
            });

    }

    //사용자 개인영역(왼쪽영역)에 앱 목록 데이터 불러오는 함수
    function app_area_data_load(){
        
        $.ajax({
            type: "GET",
            url: "./resource/data/app_area_data.txt",
            dataType: "json",
            success: function(data){
				
				
                var html = '';
        
                html += `
                    <div id='app_area'>
                        <div class='inner'>
                            <div class='app_search_wrap'>
                                <div class='searcch_input_wrap'><input type='text' id='input_app_search' class='search_input' placeholder='검색어를 입력해주세요'></div>
                                <button type='button' id='btn_app_search' class='app_search_btn'><span>검색</span></button>
                            </div>`;

                            for(var i = 0; i < data.length; i++){
                                html += "<div class='app_wrap'>";
                           		html += "<div class='app_box_title'><h4>" + data[i].name + "</h4><button type='button' id='' class='btn btn_fold open'></button></div>";
                           		html += "<div class='app_list'>";
								for(var j = 0; j < data[i].apps.length; j++){
									if(data[i].apps[j]['select'] === 'on'){
										html += "<div class='app_box select' key='" + data[i].apps[j]['key'] + "'>";
									} else {
										html += "<div class='app_box'>";
									}
									
									html += "<div class='app_box_inner'>";
									html += "<div class='app_box_img' style='background-image: url(" + data[i].apps[j]['img'] + ")'></div>";
									html += "<span class='app_box_name'>" + data[i].apps[j]['app_name'] + "</span>";
									html += "</div></div>";
                            	}
                            	html += "</div>";
                            	html += "</div>";
                            }
                            
                        html += `</div>
                    </div>
                `;
                
                $("#personal_area").append(html);
	
				$(".app_box").on("click", function(e){
				
					var key = $(this).attr("key");
					
					//선택되지 않은 앱을 눌럿을 경우
					if(!$(this).hasClass("select")){
						$(this).addClass("select");
						
						if(key === 'mail'){
							mail_data_load('add');
						}
						if(key === 'calendar'){
							schedule_data_load('add');
						}
						if(key === 'approval'){
							approval_data_load('add');
						}
					}
					
				});
		
                console.log(">>>>>>앱 목록 데이터 로드 성공");                

            },
            error: function(xhr, error){
                console.log(error);
            }
        });

    }

    function event_bind() {
        
        

    };


    //날짜요일 반환하는 함수
    function return_day(day){
        if(day === 0){
            day = "일";
        }
        if(day === 1){
            day = "월";
        }
        if(day === 2){
            day = "화";
        }
        if(day === 3){
            day = "수";
        }
        if(day === 4){
            day = "목";
        }
        if(day === 5){
            day = "금";
        }
        if(day === 6){
            day = "토";
        }
        return day;
    }
    
    function addZero(num) {
        return (num < 10 ? '0' : '') + num;
    }

    login_data_load();
    
    area_right_draw();
    event_bind();
    
});