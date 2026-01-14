
function gBodyTODO(){
	this.cur_todo_code = "";
	this.cur_todo_name = "";
	this.cur_item_code = "";
	
	this.cur_project_info = "";
	this.cur_project_item_list = "";
	
	this.cur_type = "card"; //기본보기는 card 형태이고 list를 클릭하면 list로 이동한다.
	this.is_dragdrop = false;
	this.view_mode = "list"; // list일 경우 목록 조회형태이고 read일 경우 팝업으로 조회하고 있는 모드일 경우
	this.select_todo = "";
	
	this.filtering = false;   //현재 필터링을 활용해서 데이터를 표시하고 있는지 여부를 판단한다.
	
	this.draw_graph_info = new Object();
	
	this.compose_admin = false;
	this.compose_asignee = false;
	
	this.ck = "";
	this.cklist = [];
	
	this.todo_reply_status = "";
	this.open_todo_mention = false;
	
	this.file_max_upload_size_todo = 100;    //40M (53000000)
	this.dropzone = "";
	this.cur_todo = "";
} 

$(document).ready(function(){
	
});

gBodyTODO.prototype = {
		
	"init" : function(){		
		
	},
	
	
	"init_load" : function(){

		//통합검색창이 떠 있으면 숨긴다.
		$("#ext_body").hide();
		
		gTodoC.todo_left();		
		gTodo.draw_my_static();		
		
		gTodo.click_display("my_job_menu");
		
	
		$("#nav_left_menu .btn-left-fold").off();
		$("#nav_left_menu .btn-left-fold").on("click", function(e){
						
			$("#nav_left_menu").hide();
			$("#todo_left_col").show();
			
			$("#left_main").css("width", "15px");
			$("#main_body").css("left", "70px");
			
		});
	
		$("#todo_left_col").off();
		$("#todo_left_col").on("click", function(e){
						
			$("#nav_left_menu").show();
			$("#todo_left_col").hide();
			
			$("#left_main").css("width", "312px");
			$("#main_body").css("left", "366px");
		});
		
	//	gTodo.todo_attachment();	
	//	gTodo.todo_members();
	//	gTodo.todo_channel();
		

	//	gTodo.todo_call_status();

		// mention 설정 (댓글 수정란)
		//gTodo.init_mention_userdata('rmtext');
		
		
	},
	
	"click_display" : function(id){
		
		gTodo.open_todo_mention = false;
		
		$(".nav-todo em").removeClass("on");
		$(".nav-todo li").removeClass("on");
		$("#" + id).addClass("on");
	},
	
	"todo_call_status_myspace" : function(id){
		gTodo.click_display(id);
		gTodo.todo_center_status();				
		
		gTodo.__init_event();
		//$('select').material_select();
	},
	
	"todo_call_status" : function(){
		
		gTodo.cur_todo = "status";
		gTodo.cur_type = "card";
			
	//	gTodoC.todo_left();		
		gTodo.todo_center_status();				
		
		gTodo.__init_event();
		//$('select').material_select();
	},
	
	"todo_call_status_compose" : function(){
		//메뉴 클릭할때 card형으로 기본 설정한다.li
		gTodo.cur_todo = "status";
		gTodo.cur_type = "card";					
		gTodo.todo_center_status();				
		
		gTodo.__init_event();
		//$('select').material_select();
	},
	
	"todo_call_status_plugin" : function(){
		//메뉴 클릭할때 card형으로 기본 설정한다.li
		
		gTodo.cur_todo = "status";
		gTodo.cur_type = "card";					
		gTodo.todo_center_status();				
		
		gTodo.__init_event();
	},
	
	"todo_call_users2" : function(){
		gTodo.todo_center_user();
	},
	
	"todo_call_calendar" : function(){
		gTodo.draw_calendar();
	},
	
	"draw_calendar" : function(){
		var html2 = "";
		
		html2 += gTodo.center_top_menu_draw(3);
		
		html2 += "<div id='todo_calendar_area' class='todo-calendar'>";
		html2 += "</div>";	
		
		html2 += "</div>";
		
		if (gTodo.cur_todo_caller == "plugin"){
		//	$(".left-area").hide();
			$("#channel_list").show();
			$("#channel_list").off();
			$("#channel_list").removeAttr("class");
			$("#channel_list").addClass("left-area todo fold-temp");
			$("#channel_list").html(html2);
		}else{
			$(".left-area").hide();
			$("#center_content").show();
			$("#center_content").off();
			$("#center_content").removeAttr("class");
			$("#center_content").addClass("left-area todo fold-temp");
			$("#center_content").html(html2);
		}


		
		gTodoC.draw_calendar();		//임시로 호출하는거임

		gTodo.__todo_center_event();
	},
	
	
	"__init_event" : function(){
			
		$(".todo-menu li").off();
		$(".todo-menu li").on("click", function(e){
			
			gTodo.ck = "";
			gTodo.cklist = [];
			
			$(".todo-menu li").removeClass("on");
			var clickid = $(e.currentTarget).attr("id");
			if (clickid == "todo_tab_status"){
				$(this).addClass("on");
				
				gTodo.todo_call_status();
				gTodo.cur_todo = "status";
				$(".view-type").show();
			}else if (clickid == "todo_tab_users"){
				
				$(this).addClass("on");
				gTodo.todo_call_users();
				gTodo.cur_todo = "user";
				$(".view-type").show();
			}else if (clickid == "todo_tab_calendar"){
				$(this).addClass("on");
				gTodo.todo_call_calendar();
				gTodo.cur_todo = "calendar";
				gTodo.cur_type = "calendar";
				$(".view-type").hide();
			}
			
			//$('select').material_select();
		});
	},
	
	
	
	
	"draw_my_static" : function(){
		
	/*	var data = JSON.stringify({
			email : gap.search_cur_em_sec()
		});*/
		var data = JSON.stringify({});
		var url = gap.channelserver + "/my_space.km";
		
		
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : data,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			url : url,
			success : function(res){
			
				gTodo.cur_todo = "main";
				
				var list = res.data;
				var my_create = list.my_create;
				var my_create_list = list.my_create_list;
				var my_member = list.my_member;
				var my_member_list = list.my_member_list;
				
				
				var my_member_c1 = 0;
				var my_member_c2 = 0;
				var my_member_c3 = 0;
				var my_member_c4 = 0;
				
				var my_create_c1 = 0;
				var my_create_c2 = 0;
				var my_create_c3 = 0;
				var my_create_c4 = 0;
				
				var html2 = "";
				
				html2 += "<div class='todo-contents'>";
				html2 += "<div class='todo-main'>";
				
		
				html2 += "	<div class='todo-group' style='margin-bottom:30px'>";
				
				html2 += "		<h2><span class='ico ico-my-todo'></span> "+gap.lang.myasignwork+"</h2>";
				html2 += "		<div class='d-dashboard'>";
				html2 += "			<div class='d-group'>";
			//	html2 += "				<h3>"+gap.lang.todolist+"</h3>";
				html2 += "				<div class='d-table' style='max-height:350px' id='my_space_asign'>";
				html2 += "					<table>";
				html2 += "						<colgroup>";
				html2 += "							<col style='' />";
				html2 += "							<col style='width:60px;' />";
				html2 += "							<col style='width:60px;' />";
				html2 += "							<col style='width:60px;' />";
				html2 += "							<col style='width:60px;' />";
				html2 += "						</colgroup>";
				html2 += "						<tr>";
				html2 += "							<th>"+gap.lang.todo_project_name+"</th>";
				html2 += "							<th>"+gap.lang.wait+"</th>";
				html2 += "							<th>"+gap.lang.doing+"</th>";
				html2 += "							<th>"+gap.lang.delay+"</th>";
				html2 += "							<th>"+gap.lang.done+"</th>";
				html2 += "						</tr>";
				
				
				for (var i = 0 ; i < my_member.length; i++){
					var info = my_member[i];
					
					if (typeof(info.count_1) == "undefined"){
						info.count_1 = 0;
					}
					if (typeof(info.count_2) == "undefined"){
						info.count_2 = 0;
					}
					if (typeof(info.count_3) == "undefined"){
						info.count_3 = 0;
					}
					if (typeof(info.count_4) == "undefined"){
						info.count_4 = 0;
					}
					
					
					html2 += "						<tr>";
					if (info.count_4 > 0){
						html2 += "							<td class='c-red'><div data='"+info._id.$oid+"' data2='"+info.name+"'>"+info.name+"</div></td>";
						html2 += "							<td>"+info.count_1+"</td>";
						html2 += "							<td>"+info.count_2+"</td>";
						html2 += "							<td class='c-red'>"+info.count_4+"</td>";
						html2 += "							<td>"+info.count_3+"</td>";
					}else{
						html2 += "							<td><div data='"+info._id.$oid+"' data2='"+info.name+"'>"+info.name+"</div></td>";
						html2 += "							<td>"+info.count_1+"</td>";
						html2 += "							<td>"+info.count_2+"</td>";
						html2 += "							<td>"+info.count_4+"</td>";
						html2 += "							<td>"+info.count_3+"</td>";
					}
					

					html2 += "						</tr>";
					
					my_member_c1 = my_member_c1 + info.count_1;
					my_member_c2 = my_member_c2 + info.count_2;
					my_member_c3 = my_member_c3 + info.count_3;
					my_member_c4 = my_member_c4 + info.count_4;
				}
			
				html2 += "					</table>";
				html2 += "				</div>";
				html2 += "			</div>";
				html2 += "			<div class='d-right-group'>";
				html2 += "				<ul class='todo-all-status'>";
				html2 += "					<li data-opt='1' data-status='1'>";
				html2 += "						<span class='ico ico-d-wait'></span>";
				html2 += "						<h3>"+gap.lang.wait+"</h3>";
				html2 += "						<span>"+my_member_c1+"</span>";
				html2 += "					</li>";
				html2 += "					<li  data-opt='1' data-status='2'>";
				html2 += "						<span class='ico ico-d-continue'></span>";
				html2 += "						<h3>"+gap.lang.doing+"</h3>";
				html2 += "						<span>"+my_member_c2+"</span>";
				html2 += "					</li>";
				html2 += "					<li  data-opt='1' data-status='4'>";
				html2 += "						<span class='ico ico-d-delay'></span>";
				html2 += "						<h3>"+gap.lang.delay+"</h3>";
				html2 += "						<span>"+my_member_c4+"</span>";
				html2 += "					</li>";
				html2 += "					<li  data-opt='1' data-status='3'>";
				html2 += "						<span class='ico ico-d-complete'></span>";
				html2 += "						<h3>"+gap.lang.done+"</h3>";
				html2 += "						<span>"+my_member_c3+"</span>";
				html2 += "					</li>";
				html2 += "				</ul>";
				html2 += "				<div class='wrap-2cell'>";
				html2 += "					<div class='d-group'>";
				html2 += "						<h3>"+gap.lang.ingwork+"</h3>";
				html2 += "						<div class='d-list' style='max-height:210px'>";
				
				for (var k = 0 ; k < my_member_list.length; k++){
					var kinfo = my_member_list[k];
					var user= gap.user_check(kinfo.owner);
					var et = "";
					if (typeof(kinfo.enddate) != "undefined"){
						et = "~ " + moment.utc(new Date(kinfo.enddate)).format("YYYY.MM.DD");
					}
					
					html2 += "							<dl data='"+kinfo._id.$oid+"'>";
					html2 += "								<dt>";
					html2 += "									<div class='user'>";
					html2 += "										<div class='user-thumb'>"+user.user_img+"</div>";
					html2 += "									</div>";
					html2 += "								</dt>";
					html2 += "								<dd>";
					html2 += "									<p style='max-width:230px' title='"+kinfo.title+"'>"+kinfo.title+"</p>";
					html2 += "									<span>"+user.name+"<em class='date'>"+et+"</em></span>";
					html2 += "								</dd>";
					html2 += "							</dl>";					
				}
				
				html2 += "						</div>";
				html2 += "					</div>";
				html2 += "					<div class='d-group'>";
				html2 += "						<h3>"+gap.lang.sg+"</h3>";
				html2 += "						<div class='d-graph'  id='todo_graph1'><canvas id='chart-area'></canvas></div>";
				html2 += "					</div>";
				html2 += "				</div>";
				html2 += "			</div>";
				html2 += "		</div>";
				html2 += "	</div>";
				
				
				
				
				
				html2 += "	<div class='todo-group' style='margin-bttom:30px'>";
				
				html2 += "		<h2><span class='ico ico-request-todo'></span> "+gap.lang.mycallwork+"</h2>";
				html2 += "		<div class='d-dashboard'>";
				html2 += "			<div class='d-group'>";
		//		html2 += "				<h3>"+gap.lang.todolist+"</h3>";
				html2 += "				<div class='d-table' style='max-height:350px' id='my_space_create'>";
				html2 += "					<table>";
				html2 += "						<colgroup>";
				html2 += "							<col style='' />";
				html2 += "							<col style='width:60px;' />";
				html2 += "							<col style='width:60px;' />";
				html2 += "							<col style='width:60px;' />";
				html2 += "							<col style='width:60px;' />";
				html2 += "						</colgroup>";
				html2 += "						<tr>";
				html2 += "							<th>"+gap.lang.todo_project_name+"</th>";
				html2 += "							<th>"+gap.lang.wait+"</th>";
				html2 += "							<th>"+gap.lang.doing+"</th>";
				html2 += "							<th>"+gap.lang.delay+"</th>";
				html2 += "							<th>"+gap.lang.done+"</th>";
				html2 += "						</tr>";
				
				for (var i = 0 ; i < my_create.length; i++){
					var info = my_create[i];
					html2 += "						<tr>";
					
					if (typeof(info.count_1) == "undefined"){
						info.count_1 = 0;
					}
					if (typeof(info.count_2) == "undefined"){
						info.count_2 = 0;
					}
					if (typeof(info.count_3) == "undefined"){
						info.count_3 = 0;
					}
					if (typeof(info.count_4) == "undefined"){
						info.count_4 = 0;
					}
					
					if (info.count_4 > 0){
						html2 += "							<td class='c-red'><div data='"+info._id.$oid+"' data2='"+info.name+"'>"+info.name+"</div></td>";
						html2 += "							<td>"+info.count_1+"</td>";
						html2 += "							<td>"+info.count_2+"</td>";
						html2 += "							<td class='c-red'>"+info.count_4+"</td>";
						html2 += "							<td>"+info.count_3+"</td>";
					}else{
						html2 += "							<td><div data='"+info._id.$oid+"' data2='"+info.name+"'>"+info.name+"</div></td>";
						html2 += "							<td>"+info.count_1+"</td>";
						html2 += "							<td>"+info.count_2+"</td>";
						html2 += "							<td>"+info.count_4+"</td>";
						html2 += "							<td>"+info.count_3+"</td>";
					}

					html2 += "						</tr>";
					
					
					my_create_c1 = my_create_c1 + info.count_1;
					my_create_c2 = my_create_c2 + info.count_2;					
					my_create_c3 = my_create_c3 + info.count_3;
					my_create_c4 = my_create_c4 + info.count_4;
				}
				
				
				html2 += "					</table>";
				html2 += "				</div>";
				html2 += "			</div>";
				html2 += "			<div class='d-right-group'>";
				html2 += "				<ul class='todo-all-status'>";
				html2 += "					<li  data-opt='2' data-status='1'>";
				html2 += "						<span class='ico ico-d-wait'></span>";
				html2 += "						<h3>"+gap.lang.wait+"</h3>";
				html2 += "						<span>"+my_create_c1+"</span>";
				html2 += "					</li>";
				html2 += "					<li  data-opt='2' data-status='2'>";
				html2 += "						<span class='ico ico-d-continue'></span>";
				html2 += "						<h3>"+gap.lang.doing+"</h3>";
				html2 += "						<span>"+my_create_c2+"</span>";
				html2 += "					</li>";
				html2 += "					<li  data-opt='2' data-status='4'>";
				html2 += "						<span class='ico ico-d-delay'></span>";
				html2 += "						<h3>"+gap.lang.delay+"</h3>";
				html2 += "						<span>"+my_create_c4+"</span>";
				html2 += "					</li>";
				html2 += "					<li  data-opt='2' data-status='3'>";
				html2 += "						<span class='ico ico-d-complete'></span>";
				html2 += "						<h3>"+gap.lang.done+"</h3>";
				html2 += "						<span>"+my_create_c3+"</span>";
				html2 += "					</li>";
				html2 += "				</ul>";
				html2 += "				<div class='wrap-2cell'>";
				html2 += "					<div class='d-group'>";
				html2 += "						<h3>"+gap.lang.ingwork2+"</h3>";
				html2 += "						<div class='d-list'  style='max-height:210px'>";
				
				
				for (var k = 0 ; k < my_create_list.length; k++){
					var kinfo = my_create_list[k];
					var user= "";
					var is_none = false;
					if (typeof(kinfo.asignee) != "undefined"){
						user= gap.user_check(kinfo.asignee);
					}else{
						is_none = true;
						user= gap.user_check_none();
					}
									
					var et = "";
					if (typeof(kinfo.enddate) != "undefined"){
						et = "~ " + moment.utc(new Date(kinfo.enddate)).format("YYYY.MM.DD");
					}
					
					html2 += "							<dl data='"+kinfo._id.$oid+"'>";
					html2 += "								<dt>";
					html2 += "									<div class='user'>";
					html2 += "										<div class='user-thumb'>"+user.user_img+"</div>";
					html2 += "									</div>";
					html2 += "								</dt>";
					html2 += "								<dd>";
					html2 += "									<p style='max-width:230px' title='"+kinfo.title+"'>"+kinfo.title+"</p>";
				//	if (is_none){
				//		html2 += "									<span><em class='date'>"+et+"</em></span>";
				//	}else{
						html2 += "									<span>"+user.name+"<em class='date'>"+et+"</em></span>";
				//	}
					
					html2 += "								</dd>";
					html2 += "							</dl>";					
				}		
				
				
				html2 += "						</div>";
				html2 += "					</div>";
				html2 += "					<div class='d-group'>";
				html2 += "						<h3>"+gap.lang.sg+"</h3>";
				html2 += "						<div class='d-graph'  id='todo_graph2'><canvas id='chart-area2'></canvas></div>";
				html2 += "					</div>";
				html2 += "				</div>";
				html2 += "			</div>";
				html2 += "		</div>";
				html2 += "	</div>";
					
				
				html2 += "</div>";
				html2 += "</div>";
				
				
				var obb = new Object();
				obb.my_member_c1 = my_member_c1;
				obb.my_member_c2 = my_member_c2;
				obb.my_member_c3 = my_member_c3;
				obb.my_member_c4 = my_member_c4;
				
				obb.my_create_c1 = my_create_c1;
				obb.my_create_c2 = my_create_c2;
				obb.my_create_c3 = my_create_c3;
				obb.my_create_c4 = my_create_c4;
				
				gTodo.draw_graph_info = obb;

				
				$("#center_content").css("width", "100%");
				$("#user_profile").css("width", "0px");
				$(".left-area").hide();
				$("#center_content").show();
				$("#center_content").off();
				$("#center_content").removeAttr("class");
				$("#center_content").addClass("left-area todo fold-temp");
				$("#center_content").css("overflow", "auto");
			//	$("#center_content").css("width","calc(100% - 300px)");
				$("#center_content").html(html2);
				
				/*
				$(".d-table").mCustomScrollbar({
					theme:"dark",
					autoExpandScrollbar: true,
					scrollButtons:{
						enable: false
					},
					mouseWheelPixels : 200, // 마우스휠 속도
					scrollInertia : 400, // 부드러운 스크롤 효과 적용
					mouseWheel:{ preventDefault: false },
					advanced:{
						updateOnContentResize: true
					},
					autoHideScrollbar : false
				});
				*/
				
				if (my_member > 0){
					$("#my_space_asign").mCustomScrollbar({
						theme:"dark",
						autoExpandScrollbar: true,
						scrollButtons:{
							enable: false
						},
						mouseWheelPixels : 200, // 마우스휠 속도
						scrollInertia : 400, // 부드러운 스크롤 효과 적용
						mouseWheel:{ preventDefault: false },
						advanced:{
							updateOnContentResize: true
						},
						autoHideScrollbar : false
					});
				}
				
				if (my_create > 0){
					$("#my_space_create").mCustomScrollbar({
						theme:"dark",
						autoExpandScrollbar: true,
						scrollButtons:{
							enable: false
						},
						mouseWheelPixels : 200, // 마우스휠 속도
						scrollInertia : 400, // 부드러운 스크롤 효과 적용
						mouseWheel:{ preventDefault: false },
						advanced:{
							updateOnContentResize: true
						},
						autoHideScrollbar : false
					});
				}
				
				
				
				$(".d-list").mCustomScrollbar({
					theme:"dark",
					autoExpandScrollbar: true,
					scrollButtons:{
						enable: false
					},
					mouseWheelPixels : 200, // 마우스휠 속도
					scrollInertia : 400, // 부드러운 스크롤 효과 적용
					mouseWheel:{ preventDefault: false },
					advanced:{
						updateOnContentResize: true
					},
					autoHideScrollbar : false
				});
				
				$(".d-group table div").off();
				$(".d-group table div").on("click", function(e){
					
					var id = $(e.currentTarget).attr("data");		
					var name = $(e.currentTarget).attr("data2");
					gTodo.cur_todo_code = id;			
					gTodo.cur_todo_name = name;
					gTodo.cur_todo_caller = "todo";
					
					gTodo.todo_call_status_compose();
					gTodo.click_display(id);
					
				});
							
				
				$(".d-group dl").off();
				$(".d-group dl").on("click", function(e){
					var id = $(e.currentTarget).attr("data");
					gTodo.compose_layer(id);
				});
				
				
				//나에게 할당된 업무가 없으면 그래프를 숨긴다.
				var cnt1 = $("#my_space_asign td div").length;
				if (cnt1 == 0) $("#todo_graph1").hide();
				//내가 지시한 업무가 없으면 그래프를 숨긴다.
				var cnt1 = $("#my_space_create td div").length;
				if (cnt1 == 0){
					$("#todo_graph2").hide();
				}
				
				
				// * 2차 프로젝트 범위 - 오픈때까지 막음
				$(".todo-all-status li").off();
				$(".todo-all-status li").on("click", function(e){
					gTodo.draw_status_todo($(this).data("opt"), $(this).data("status"), $(this).find("h3").text());
				});
				
				$(".todo-all-status li").css("cursor", "pointer");
				
				gTodo.draw_graph();
				
				
			},
			error : function(e){
				gap.error_alert();
			}
		})
	
		
		
	},
	
	"draw_graph" : function(){
		var randomScalingFactor = function() {
			return Math.round(Math.random() * 100);
		};
		
		var config = {
			type: 'doughnut',
			data: {
				datasets: [{
//					data: [
//						randomScalingFactor(),
//						randomScalingFactor(),
//						randomScalingFactor(),
//						randomScalingFactor(),
//					],
					backgroundColor: [
						window.chartColors.yellow,
						window.chartColors.green,
						window.chartColors.red,
						"#964BAC",
					],
					label: 'Dataset 1'
				}],
				labels: [
					gap.lang.wait,
					gap.lang.doing,
					gap.lang.delay,					
					gap.lang.done,
				]
			},
			options: {
				responsive: false,
				legend: {
					position: 'right',
					align : 'end'
				},
				title: {
					display: true,
					text: '내가 해야할 일 비율',
					position : 'top'
				},
				animation: {
					animateScale: true,
					animateRotate: true
				},
				layout : {
					left : 0,
					right : 0,
					top : 0,
					bottom : 0
				},
				lengendCallback: function(chart){
					
				}
			}
		};
		
		var config2 = {
			type: 'doughnut',
			data: {
				datasets: [{
//						data: [
//							randomScalingFactor(),
//							randomScalingFactor(),
//							randomScalingFactor(),
//							randomScalingFactor(),
//						],
					backgroundColor: [
						window.chartColors.yellow,
						window.chartColors.green,
						window.chartColors.red,						
						"#964BAC",
					],
					label: 'Dataset 1'
				}],
				labels: [
					gap.lang.wait,
					gap.lang.doing,
					gap.lang.delay,					
					gap.lang.done,
				]
			},
			options: {
				responsive: false,
				legend: {
					position: 'right',
					align : 'end'
				},
				title: {
					display: true,
					text: '내가 해야할 일 비율',
					position : 'top'
				},
				animation: {
					animateScale: true,
					animateRotate: true
				},
				layout : {
					left : 0,
					right : 0,
					top : 0,
					bottom : 0
				},
				lengendCallback: function(chart){
					
				}
			}
		};
		
		
		var ctx = document.getElementById('chart-area').getContext('2d');
		window.myDoughnut = new Chart(ctx, config);		
		window.myDoughnut.options.title.text = gap.lang.myasignwork;
		window.myDoughnut.data.datasets[0].data = [gTodo.draw_graph_info.my_member_c1,gTodo.draw_graph_info.my_member_c2,gTodo.draw_graph_info.my_member_c4,gTodo.draw_graph_info.my_member_c3];
		window.myDoughnut.update();
		
		var ctx2 = document.getElementById('chart-area2').getContext('2d');
		window.myDoughnut2 = new Chart(ctx2, config2);
		window.myDoughnut2.options.title.text = gap.lang.mycallwork;
		window.myDoughnut2.data.datasets[0].data = [gTodo.draw_graph_info.my_create_c1,gTodo.draw_graph_info.my_create_c2,gTodo.draw_graph_info.my_create_c4,gTodo.draw_graph_info.my_create_c3];
		window.myDoughnut2.update();
		
	},
	
	
	
	
	
	"center_top_menu_draw" : function(opt){
		var html2 = "";
		html2 += "<div class='temp fold' id='hidden_folder'>";
		html2 += "	<div class='temp-fold-contents'>";
		html2 += "		<button class='ico btn-temp-fold' id='hidden_folder_expand'>접기</button>";
		html2 += "		<span class='ico ico-info' id='collapse_info'>정보</span>";
		html2 += "	</div>";
		html2 += "</div>";
			
		html2 += "<div class='temp' style='display:none' id='show_folder'>";
		html2 += "	<div class='temp-contents' >";
		html2 += "		<button class='ico btn-temp-fold' id='expand_folder_collapse'>접기</button>";
		html2 += "		<h2>"+gap.lang.temps+"<span id='temp_count'> </span></h2>";
		html2 += "		<div class='input-field'>";
		html2 += "			<input type='text' autocomplete='off' class='formInput' autocomplete='off' placeholder='+ "+gap.lang.addtodo+"' />";
		html2 += "			<span class='bar'></span>";
		html2 += "		</div>";
		html2 += "			<div class='card' id='card_0' style='min-height:300px'>";	
		html2 += "			</div>";	
//		html2 += "		<ul class='temp-list'>";
//		html2 += "			<li>";
//		html2 += "				<h3><span class='temp-bar'></span>업무만들기</h3>";
//		html2 += "			</li>";
//		html2 += "		</ul>";
		html2 += "	</div>";		
		html2 += "</div>";
		
		html2 += "<div class='todo-contents' style='height:calc(100% - 5px)'>";
		html2 += "	<div class='todo-header'>";
		if (gTodo.cur_todo_caller != "plugin"){
			html2 += "		<h2>";
			html2 += "		<button class='ico btn-star on' id='todo_top_favorite_btn'>즐겨찾기</button><span style='font-size:18px' id='todo_top_title'></span> <!-- 즐겨찾기 해제 시 on 클래스 제거 -->";
			html2 += "		<P class='explain' id='todo_top_express'></P>";
			html2 += "		</h2>";
		}

		html2 += "		<ul class='todo-menu' style='list-style:none'>";
		html2 += "			<li class='"+(opt == "1" ? "on" : "")+"' id='todo_tab_status'><span class='ico ico-todo-status'></span>"+gap.lang.status+"</li>";
		html2 += "			<li class='"+(opt == "2" ? "on" : "")+"' id='todo_tab_users'><span class='ico ico-todo-user'></span>"+gap.lang.users+"</li>";
		html2 += "			<li class='"+(opt == "3" ? "on" : "")+"' id='todo_tab_calendar'><span class='ico ico-todo-calendar'></span>"+gap.lang.calendar+"</li>";
		html2 += "		</ul>";
		html2 += "		<ul class='todo-right-btns'>";
		html2 += "			<li><button class='ico btn-invite-user' id='btn_todo_invite'>참석자</button><span id='todo_top_member_count'></span></li>";
		html2 += "			<li><button class='ico btn-clip' id='btn_todo_file'>파일</button></li>";
		if (gTodo.cur_todo_caller != "plugin"){
			html2 += "			<li><button class='ico btn-channel' id='btn_todo_channel'>채널</button></li>";	//조지혜님 요청으로 뺌 - 2021.10.07
			
		}
		html2 += "			<li><button class='ico btn-line-star' id='btn_todo_star'>즐겨찾기</button></li>";
		html2 += "			<li><button class='ico btn-archive' id='btn_todo_archive'>아카이브</button></li>";
		
		if (useMention == "T"){
			html2 += "			<li><button class='ico btn-mention' id='btn_todo_mention'>Mention</button></li>";			
		}

		html2 += "		</ul>";
		
		html2 += "		<div class='todo-option' >";
		
		html2 += "		<div class='option-tag' id='todo_tag_btn' style='display:none'>";
		html2 += "			<button class='btn-txt' id='x_tag'><em class='caret'></em><span>"+gap.lang.tag+"</span></button> <!-- 클릭시 on 클래스 토글 -->";
		html2 += "		</div>";		
		
		html2 += "		<div class='option-priority' id='todo_priority_btn'>";
		html2 += "			<button class='btn-txt' id='x_priority'><em class='caret'></em><span>"+gap.lang.priority+"</span></button>";
		html2 += "		</div>";
		
		html2 += "		<div class='option-color' id='todo_color_btn' style='display:none'>";
		html2 += "			<button class='btn-txt' id='x_color'><em class='caret'></em><span>"+gap.lang.color+"</span></button>";
		html2 += "		</div>";
		
		html2 += "		<div class='option-filter' id='todo_filter_btn'>";
		html2 += "			<button class='btn-txt' id='x_filter'><em class='caret'></em><span>"+gap.lang.filter+"</span></button>";
		html2 += "		</div>";
		
		
		html2 += "      <div class='view-type'>";
		if (gTodo.cur_type == "card"){
			html2 += "			<button class='ico btn-view-card' style='display:none'>카드형</button>";
			html2 += "			<button class='ico btn-view-list'>리스트형</button>";
		}else{
			html2 += "			<button class='ico btn-view-card'>카드형</button>";
			html2 += "			<button class='ico btn-view-list' style='display:none'>리스트형</button>";
		}

		html2 += "		</div>"
		
		
		html2 += "		</div>";
		html2 += "	</div>";
		

		
		return html2;
		
	},
	
	
	"todo_center_default" : function(){
	
		var html2 = "";
		html2 += " <div id='todo_scroll'>";
		html2 += "	<div class='todo-card' id='todo_main_content'>";
		
		html2 += "		<div class='card-list card-wait' >";
		html2 += "			<div>";
		html2 += "				<h2>"+gap.lang.wait+"<span id='wait_count'> </span></h2>";
		html2 += "				<div class='input-field'>";
		html2 += "					<input type='text'  autocomplete='off' class='formInput' placeholder='+ "+gap.lang.addtodo+"' />";
		html2 += "					<span class='bar'></span>";
		html2 += "				</div>";
		html2 += "			</div>";
		html2 += "			<div class='card' id='card_1' style='min-height:300px; height : calc(100% - 100px)'>";
		html2 += "			</div>";
		html2 += "		</div>";
		
		html2 += "		<div class='card-list card-continue' >";
		html2 += "			<div>";
		html2 += "				<h2>"+gap.lang.doing+"<span id='continue_count'> </span></h2>";
		html2 += "				<div class='input-field'>";
		html2 += "					<input type='text'  autocomplete='off' class='formInput' placeholder='+ "+gap.lang.addtodo+"' />";
		html2 += "					<span class='bar'></span>";
		html2 += "				</div>";
		html2 += "			</div>";
		html2 += "			<div class='card' id='card_2' style='min-height:300px; height : calc(100% - 100px)'>";
		html2 += "			</div>";
		html2 += "		</div>";
		
		html2 += "		<div class='card-list card-complete'>";
		html2 += "			<div>";
		html2 += "				<h2>"+gap.lang.done+"<span id='complete_count'> </span></h2>";
		html2 += "				<div class='input-field'>";
		html2 += "					<input type='text'  autocomplete='off' class='formInput' placeholder='+ "+gap.lang.addtodo+"' />";
		html2 += "					<span class='bar'></span>";
		html2 += "				</div>";
		html2 += "			</div>";
		html2 += "			<div class='card' id='card_3' style='min-height:300px; height : calc(100% - 100px)'>";
		html2 += "			</div>";
		html2 += "		</div>";
		
		html2 += "	</div>";
		
		html2 += "	</div>";
	
		return html2;
	},
	
	"todo_center_status" : function(){
		//////////////////////////// 가운데 영역 ///////////////////////////////////////////////////////////////////
		
		var html2 = "";
		
		html2 += gTodo.center_top_menu_draw(1);			
		
		html2 += gTodo.todo_center_default();		
		
		html2 += "</div>";
		
		//var html3 = "<div id='todo_main' style='width:100%'>" + html2 + "</div>";
		
		if (gTodo.cur_todo_caller == "plugin"){
			$("#chat_bottom_dis").hide();
			$("#channel_list").show();
			$("#channel_top_list").css("padding", "0");
			$("#channel_list").css("width", "100%");
			$("#channel_list").css("height", "100vh");
			$("#channel_list").off();
			$("#channel_list").removeAttr("class");
			$("#channel_list").addClass("left-area todo fold-temp");
		//	$("#center_content").css("width","calc(100% - 300px)");
			
			var isdropzone = $("#channel_list")[0].dropzone;
			if (isdropzone) {
				isdropzone.destroy();
				$("#channel_list").droppable("destroy");
			}
			
			
			
			$("#view_mode_tab").hide();
			
			$("#channel_list").html(html2);

			
			$("#todo_scroll").css("height", "calc(100% - 280px)");
			$("#todo_main").css("height", "calc(100% - 50px)");
			$("#channel_list").css("overflow","hidden");
		}else{
			$(".left-area").hide();
			$("#center_content").show();
			$("#center_content").off();
			$("#center_content").removeAttr("class");
			$("#center_content").addClass("left-area todo fold-temp");
		//	$("#center_content").css("width","calc(100% - 300px)");
			$("#center_content").html(html2);

			
			$("#todo_scroll").css("height", "calc(100% - 130px)");
			$("#todo_main").css("height", "calc(100% - 50px)");
			$("#center_content").css("overflow","hidden");
		}

		
		
		var url = gap.channelserver + "/list_item_todo.km";
	/*	var data = JSON.stringify({
			project_code : gTodo.cur_todo_code,
			email : gap.search_cur_em_sec(),
			category : "1"
		});*/
		
		var data = JSON.stringify({
			project_code : gTodo.cur_todo_code,
			category : "1"
		});
		
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : url,
			data : data,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
				if (res.result == "OK"){
					var list = res.data.data;
					
					//드래그 & 드롭으로 이동할때 id값으로 정보를 모두 가져오기 위해서 변수에 담아 놓는다.
					gTodo.cur_project_item_list = list;
					
					var pinfo = res.data.project_info;		
					gTodo.todo_top_title_change(pinfo.name, pinfo.comment);			
					var favorite = res.data.favorite;
					if (favorite == "T"){
						$("#todo_top_favorite_btn").addClass("on");
					}else{
						$("#todo_top_favorite_btn").removeClass("on");
					}
				
					//우측에 멤버 프레임 표시할때 참조해서 사용한다.
					gTodo.cur_project_info = pinfo;
					gTodo.cur_project_info.favorite = favorite;
					
					//TOP Menu 버튼 엽에 해당 프로젝트 멤버수를 표시힌다.
					var member_count = pinfo.member.length;
					$("#todo_top_member_count").html("(" + (member_count+1) + ")");
					
					//우측 프레임 멥버를 그린다.
					gTodo.todo_members();
					
//					for (var i = 0 ; i < list.length; i++){
//						var info = list[i];
//						var html = gTodo.todo_make_card(info);
//						$("#card_"+ info.status).append(html);							
//					}						
//					gTodo.__after_draw_event();					
//					gTodo.__draganddrop();	
					
					//가운데 카드를 그리는 함수
					gTodo.draw_todo_body_card();
					
					
					//특정 업무방의 경우 업무지시 창이 먼저 표시되게 예외처리한다. caller 황수진 2023.07.03
					if (gTodo.cur_todo_code == gBody3.temp_room_key){
						$(".view-type .ico.btn-view-list").click();
//						$(".view-type .ico.btn-view-card").show();
//						$(".view-type .ico.btn-view-list").hide();
						$("#chat_bottom_dis").hide();
					}
					
					
				}else{
					gap.error_alert();
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});

		gTodo.__todo_center_event();
	},
	
	"draw_todo_body_card" : function(info){
		
		var list = gTodo.cur_project_item_list;
		for (var i = 0 ; i < list.length; i++){
			var info = list[i];
			var html = gTodo.todo_make_card(info);
			$("#card_"+ info.status).append(html);							
		}						
		gTodo.__after_draw_event();					
		gTodo.__draganddrop();		
	},
	
	
	
	
	"get_column_list_ids" : function(id){
		//id : card_1, card_2, card_3, card_0 형태로 넣어야 한다.
	
		var res = "";
		var target_list = [];
		var list = $("#" + id).find(".g-card");
		for (var i = 0 ; i < list.length; i++){
			var doc = list[i];
			target_list.push($(doc).attr("id").replace("card_",""));
		}
		
		res = target_list.join("-");
		return res;
	},
	
	"get_column_list_ids_list" : function(id){
		//id : card_1, card_2, card_3, card_0 형태로 넣어야 한다.
	
		var res = "";
		var target_list = [];
		var list = $("#" + id).find(".g-list");
		for (var i = 0 ; i < list.length; i++){
			var doc = list[i];
			target_list.push($(doc).attr("id").replace("list_card_",""));
		}
		
		res = target_list.join("-");
		return res;
	},
	
	
	"todo_center_status_change" : function(){
		//////////////////////////// 가운데 영역 ///////////////////////////////////////////////////////////////////
		//상태 표시에서 리스트보기로 갔다가 다시 카드 보기로 이동할 경우 별도로 서버에 요청하지 않고 처리한다.
		
		$("#todo_scroll").css("height", "calc(100% - 130px)");
		$("#hidden_folder_expand").show();
	
		var html = gTodo.todo_center_default();
		$("#todo_main_content").html(html);
		
		var html2 = "";
		
		var list = "";
		
		if (gTodo.filtering){
			list = gTodo.cur_project_item_list_temp;
		}else{
			list = gTodo.cur_project_item_list;
		}
		
		//temp쪽 초기화 해주지 않으면 계속 쌓인다.
		$("#card_0").empty();
		
		
		for (var i = 0 ; i < list.length; i++){
			var info = list[i];
			var html = gTodo.todo_make_card(info);
			$("#card_"+ info.status).append(html);							
		}
		
		
		gTodo.__todo_center_event();
		gTodo.__after_draw_event();		
		gTodo.__draganddrop();	
	},
	
	
	"todo_center_status_list" : function(){
		//////////////////////////// 가운데 영역 ///////////////////////////////////////////////////////////////////
		//상태 표시에서 카드보기에서 리스트 보기로 이동하는 경우 별도로 서버에 요청하지 않고 처리한다.
		
		//임시저장, 대기, 진행, 완료의 리스트 기본 모듈을 적용한다.
		if (gTodo.cur_todo_caller == "plugin"){
			$("#todo_scroll").css("height", "calc(100% - 280px)");			
		}else{
			$("#todo_scroll").css("height", "calc(100% - 130px)");
		}
	
		
		
		var html = "";
		if (gTodo.cur_todo == "status"){
			html = gTodo.todo_center_default_list_mode();	
		}else if (gTodo.cur_todo == "user"){
			html = gTodo.todo_center_default_list_mode_user();	
		}
			
		$("#todo_main_content").html(html);
		
		// 기본 리스트 모듈에 대해서 데이터를 추가해 준다.
		var list = "";
		
		if (gTodo.filtering){
			list = gTodo.cur_project_item_list_temp;
		}else{
			list = gTodo.cur_project_item_list;
		}
		
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];
			var status = item.status;
			var docid = item._id.$oid;
			
			
			
			var title = item.title;
			var reply_count = 0;
			if (typeof(item.reply) != "undefined"){
				reply_count = item.reply.length;
			}
			
			var html2 = "";
			html2 += "<div class='xlist'>";
			
			
			
			var hm = "";
			var is_delay = false;
			if (typeof(item.startdate) != "undefined"){
				var dinfo = gTodo.date_diff(item.startdate, item.enddate);
				if (item.status != "3"){
					if (dinfo.rate > 100){
						is_delay = true;
					}
				}					
				hm += "	<div class='todo-period'><span><div class='bar' style='width:"+dinfo.rate+"%;'></div>";
				hm += "	<em>"+dinfo.st+"~"+dinfo.et+" ("+dinfo.term+"day)</em></span></div>";
			}else{
				hm += "	<div class='todo-period'><span><div class='bar'></div><em></em></span></div>";
			}
			
			
			var asign = "";
			var own = "";
			var is_asignee = false;
			if (typeof(item.asignee) != "undefined"){
				asign = item.asignee.em;
				if (asign == gap.userinfo.rinfo.em){
					is_asignee = true;
				}
			}
			if (typeof(item.owner) != "undefined"){
				own = item.owner.em;
			}
			
			var is_admin = false;			
			if (item.owner.em == gap.userinfo.rinfo.em){
				is_admin = true;
			}
			
			if (is_delay){
				html2 += "<div class='g-list delay' id='list_card_"+docid+"' data='"+own+"' data2='"+asign+"'>";
			}else{
				html2 += "<div class='g-list' id='list_card_"+docid+"'  data='"+own+"' data2='"+asign+"'>";
			}		
						
			
			if (typeof(item.color) != "undefined"){
				html2 += "	<div class='color-bar "+item.color+"'></div> <!-- 사용자 지정색상  -->";
			}else{
				html2 += "	<div class='color-bar '></div> <!-- 사용자 지정색상  -->";
			}
			
			
			var disdate = gap.change_date_default(gap.search_today_only3(item.GMT));
			html2 += "	<div class='todo-sbj' style='padding-left:0'><h3>"+title + " [" +disdate +"]</h3><button class='ico btn-more'>더보기</button></div>";
			html2 += "	<div class='icons'><span class='ico ico-reply on'></span><em>"+reply_count+"</em></div>";
			
			
			//특정 업무방의 경우 업무지시 창이 먼저 표시되게 예외처리한다. caller 황수진 2023.07.03
			if (gTodo.cur_todo_code != gBody3.temp_room_key){
			
				html2 += "	<div class='user'>";		
					if (typeof(item.asignee) != "undefined"){
						var user_info = gap.user_check(item.asignee)
						html2 += "		<div class='user-thumb'>"+user_info.user_img+"</div>";
					}else{
						html2 += "		<div class='user-thumb'><img src='"+root_path+"/resource/images/user_d.jpg' alt=''></div>";
					}				
				html2 += "	</div>";
						
			
				var cls = "temp";
				var cls_txt = gap.lang.temps;
				if (status == "1"){
					cls = "wait";
					cls_txt = gap.lang.wait;
				}else if (status == "2"){
					cls = "continue";
					cls_txt = gap.lang.doing;
				}else if (status == "3"){
					cls = "complete";
					cls_txt = gap.lang.done;
				}
				html2 += "	<div class='status'><span class='"+cls+"'>"+cls_txt+"</span></div>";				
				html2 += hm;
					

				if (typeof(item.checklist) != "undefined"){
					var totalcount = item.checklist.length;
					if (totalcount != 0){
						var checked = item.checklist.filter( function(item){return (item.complete=="T");} ).length;				
						var rate = parseInt(checked) / parseInt(totalcount);
						rate = parseInt(rate * 100);				
						html2 += "	<div class='todo-progress'><div class='graph'><span class='bar' style='width:"+rate+"%;'></span></div><em>"+rate+"%</em></div>";
					}else{
						html2 += "	<div class='todo-progress'><div class='graph'><span class='bar' style='width:0%;'></span></div><em>0%</em></div>";
					}

				}else{
					html2 += "	<div class='todo-progress'><div class='graph'><span class='bar' style='width:0%;'></span></div><em>0%</em></div>";
				}
			}	
				
			
			
			
			if (typeof(item.priority) != "undefined"){
				var tx = "priority" + item.priority;
				var txt = gap.lang[tx]
				html2 += "	<div class='todo-priority'><span class='ico p"+item.priority+"'></span>"+txt+"</div>";
			}else{
				html2 += "	<div class='todo-priority'><span class='ico'></span></div>";
			}
			
			
		
			
			
			var fcount = item.file.length;
			html2 += "	<div class='icons'><span class='ico ico-clip'></span><em>"+fcount+"</em></div>";
			html2 += "</div>";
			
			html2 += "</div>";
			
			if (gTodo.cur_todo == "status"){
				$("#list_card_" + status).append(html2);
			}else if (gTodo.cur_todo == "user"){
				
				var em = "";
				if ( (typeof(item.asignee) != "undefined") && (item.asignee != "")){
					var ex = item.asignee.em;
					em = "list_" + gTodo.ch_em(ex);
				}else{
					em = "list_unasign";
				}
				$("#" + em).append(html2);
			}
			
		}
		
		gTodo.all_status_count_check_user();
		
		
		
		
		$(".todo-list .formInput").off();
		$(".todo-list .formInput").keypress(function(evt){
			if (evt.keyCode == 13){			
				
				if (gTodo.cur_todo == "status"){
					var _self = this;
					var msg = $(this).val();
					var xstatus = "1";
					
					var cn = $(this).parent().parent().attr("id");					
					xstatus = cn.replace("l_card_","");
					
									
					var tlist = gTodo.get_column_list_ids_list("list_card_" + xstatus);
					
					//메시지를 저장하고 id값을 받아와서 하단에 카드를 추가한다. //todo_make_item.km
					var url = gap.channelserver + "/make_item_todo.km";
					var data = JSON.stringify({
						title : msg,
						owner : gap.userinfo.rinfo,
						status : xstatus,
						project_code : gTodo.cur_todo_code,
						project_name : gTodo.cur_todo_name,
						tlist : tlist,
						priority : 3,
						checklist : [],
						file : [],
						reply : []
					});
					$.ajax({
						type : "POST",
						datatype : "json",
						contentType : "application/json; charset=utf-8",
						url : url,
						data : data,
						success : function(res){
							
							var info = new Object();
							info.id = res.data.id;
							info.title = msg;
							info.status = xstatus;
							
						
														
							var status = res.data.status;
							gTodoC.update_todo_progress_icon(gTodo.cur_todo_code, status);
							
							gTodo.cur_project_item_list = res.data.data;

							var ht = gTodo.todo_make_card_first_list(info);
							if (xstatus == "0"){
								if ($("#list_card_0 .xlist").length == 0){
									$("#list_card_0").append($(ht));
								}else{
									$(ht).insertAfter($("#list_card_0").children().first());	
								}	
								var cnt = $("#list_card_0 .xlist").length;
								$("#list_count_0").html(" ("+cnt+")");
							}else if (xstatus == "1"){
								if ($("#list_card_1 .xlist").length == 0){
									$("#list_card_1").append($(ht));
								}else{
									$(ht).insertAfter($("#list_card_1").children().first());	
								}	
								var cnt = $("#list_card_1 .xlist").length;
								$("#list_count_1").html(" ("+cnt+")");
							}else if (xstatus == "2"){
								if ($("#list_card_2 .xlist").children().length == 0){
									$("#list_card_2").append($(ht));
								}else{
									$(ht).insertAfter($("#list_card_2").children().first());	
								}				
								var cnt = $("#list_card_2 .xlist").length;
								$("#list_count_2").html(" ("+cnt+")");
							}else if (xstatus == "3"){
								if ($("#list_card_3 .xlist").children().length == 0){
									$("#list_card_3").append($(ht));
								}else{
									$(ht).insertAfter($("#list_card_3").children().first());	
								}
								var cnt = $("#list_card_3 .xlist").length;
								$("#list_count_3").html(" ("+cnt+")");
							}
							$(_self).val("");
							
							gTodo.__draganddrop_list();
							gTodo.__event_status_list();
						},
						error : function(e){
							gap.error_alert();
						}
					})
					
					
				}else if (gTodo.cur_todo == "user"){
					
					
					var _self = this;
					var msg = $(this).val();
					var xstatus = "1";
					
					var id = $(evt.currentTarget).parent().parent().attr("id");  //"cc_ces9867-spl-kmslab-sp-com"
					var tm = id.replace("l_","");
					var em = gTodo.dh_em(tm);
					
					var key = $(evt.currentTarget).parent().parent().find(".g-list").get(0).id;
					
					
					var owner = "";
					var tlist = "";
				
					owner = gTodo.search_user_list_item(key.replace("list_card_",""));
					tlist = gTodo.get_column_list_ids_list("list_" + tm);
					
					
					//메시지를 저장하고 id값을 받아와서 하단에 카드를 추가한다. //todo_make_item.km
					var url = gap.channelserver + "/make_item_todo.km";
					var data = JSON.stringify({
						title : msg,
						owner : gap.userinfo.rinfo,
						status : xstatus,
						project_code : gTodo.cur_todo_code,
						project_name : gTodo.cur_todo_name,
						asignee : owner,
						tlist : tlist,
						priority : 3,
						checklist : [],
						file : [],
						reply : []
					});
					$.ajax({
						type : "POST",
						datatype : "json",
						contentType : "application/json; charset=utf-8",
						url : url,
						data : data,
						success : function(res){
						
							var info = new Object();
							info.id = res.data.id;
							info.title = msg;
							info.status = xstatus;
							info.asignee = owner;
							
							var status = res.data.status;
							gTodoC.update_todo_progress_icon(gTodo.cur_todo_code, status);
							
							
							var list = res.data.data;
							gTodo.cur_project_item_list = list;
							
							var ht = gTodo.todo_make_card_first_list(info);
								
							$(ht).insertBefore($("#list_" + tm).find(".xlist").first());	 //여기서는 insertBefoer만 발생할 수 있다.
							
							
							$(_self).val("");
							
							gTodo.__draganddrop_list();
							gTodo.__event_status_list();
							
							
							
//							$(_self).val("");
//							
//							//생성된 카드에 이벤트를 부여한다.
//							gTodo.__after_draw_event();
//							
//							gTodo.__draganddrop();
						},
						error : function(e){
							gap.error_alert();
						}
					})
					
				}
				
			}
		});
				
		gTodo.all_status_count_check_list();
		gTodo.__draganddrop_list();
		gTodo.__event_status_list();

	},
	
	"__event_status_list" : function(){
		
		$(".todo-sbj .btn-more").off();
		$(".todo-sbj .btn-more").on("click", function(e){
		
			if (e.target.className == "ico btn-more"){
				
				$.contextMenu({
					selector : ".todo-card .card .btn-more",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
						
						gTodo.context_menu_call(key, options, $(this).parent().parent().attr("id"));
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
						},
						show : function (options){
						}
					},			
					build : function($trigger, options){	
						var owner = $trigger.parent().parent().attr("data");
						var status = $trigger.parent().parent().parent().parent().attr("id").replace("list_card_", "");
						return {							
							items: gTodo.todo_info_menu_content('card_menu', owner, status)
						}
					}
				});
			}					
		});
		
		$(".card-list h2 button").off();
		$(".card-list h2 button").on("click", function(e){
		
			var id = $(this).attr("id");
			if (id == "list_temp_col"){
				if ($(this).hasClass("on")){
					$(this).removeClass("on");
					$("#list_card_0").hide();
				}else{
					$(this).addClass("on");
					$("#list_card_0").show();
				}
			}else if (id == "list_wait_col"){
				if ($(this).hasClass("on")){
					$(this).removeClass("on");
					$("#list_card_1").hide();
				}else{
					$(this).addClass("on");
					$("#list_card_1").show();
				}
			}else if (id == "list_continue_col"){
				if ($(this).hasClass("on")){
					$(this).removeClass("on");
					$("#list_card_2").hide();
				}else{
					$(this).addClass("on");
					$("#list_card_2").show();
				}
			}else if (id == "list_complete_col"){
				if ($(this).hasClass("on")){
					$(this).removeClass("on");
					$("#list_card_3").hide();
				}else{
					$(this).addClass("on");
					$("#list_card_3").show();
				}
			}
		});
		
		$(".g-list .status").off();
		$(".g-list .status").on("click", function(e){		
			var owner = $(e.currentTarget).parent().attr("data");
			var asignee = $(e.currentTarget).parent().attr("data2");
			var user = gap.userinfo.rinfo.em;
			var admin = false;
			if (user == gTodo.cur_project_info.owner.em){
				admin = true;
			}
			
			if ( (owner == user) || (asignee == user) || (admin)){
				gTodo.todo_change_status_listmode_layer(e);
			}else{
				gap.gAlert(gap.lang.cppi);
			}			
		});
		
		$(".g-list .todo-priority").off();
		$(".g-list .todo-priority").on("click", function(e){			
			
			var owner = $(e.currentTarget).parent().attr("data");
			var asignee = $(e.currentTarget).parent().attr("data2");
			var user = gap.userinfo.rinfo.em;
			var admin = false;
			if (user == gTodo.cur_project_info.owner.em){
				admin = true;
			}
			if ( (owner == user) || (admin)){
				gTodo.todo_change_priority_listmode_layer(e);
			}else{
				gap.gAlert(gap.lang.cppi);
			}			
		});
		
		$(".g-list .user").off();
		$(".g-list .user").on("click", function(e){	
			
			var owner = $(e.currentTarget).parent().attr("data");
			var asignee = $(e.currentTarget).parent().attr("data2");
			var user = gap.userinfo.rinfo.em;
			var admin = false;
			if (user == gTodo.cur_project_info.owner.em){
				admin = true;
			}
			if ( (owner == user) || (admin)){
				gTodo.todo_change_user_layer(e);
			}else{
				gap.gAlert(gap.lang.cppi);
			}		
			
			
		});
		
		
		$(".g-list .todo-sbj").off();
		$(".g-list .todo-sbj").on("click", function(e){
			gTodo.todo_list_click(e);	
		});
		
		$(".g-list .icons").off();
		$(".g-list .icons").on("click", function(e){
			gTodo.todo_list_click(e);
		});
		
		$(".g-list .todo-period").off();
		$(".g-list .todo-period").on("click", function(e){
			gTodo.todo_list_click(e);
		});
		
		$(".g-list .todo-progress").off();
		$(".g-list .todo-progress").on("click", function(e){
			gTodo.todo_list_click(e);
		});	
	},
	
	"todo_list_click" : function(e){
		if (gTodo.is_dragdrop){				
		}else{
			if (e.target.className == "ico btn-more"){				
			}else{
				
				//alert("백성호가 알려주는 코드로 함수를 호출해야 한다.");
				var id = $(e.currentTarget).parent().attr("id").replace("list_card_","");
				gTodo.compose_layer(id);
			}	
		}
		gTodo.is_dragdrop = false;	
	},
	
	"todo_show_other_app" : function(id){
		gTodo.compose_layer(id);
	//	alert("todo code : " + id + "백성호가 알려주는 코드로 함수를 호출해야 한다.");
	},
	
	"todo_change_user_layer" : function(e){
		
		gTodo._click_obj = $(e.currentTarget);

		var html = "";
		html += "<div class='qtip-default' style='border:none'>";
		html += "	<div class='layer-option-member'>";
//		html += "		<div class='input-field'> ";
//		html += "			<input type='text' class='formInput' placeholder='"+gap.lang.inputname+".'>";
//		html += "			<span class='bar'></span>";
//		html += "		</div>";
//		html += "		<button class='btn-file-search ico'>검색</button>";
		
	//	var list = gTodo.cur_project_info.member;
		var list = [];
		$(gTodo.cur_project_info.member).each(function(idx, val){
			list.push(val);
		});
		list.push(gTodo.cur_project_info.owner);

		list = sorted=$(list).sort(gap.sortNameDesc);
		
		html += "		<ul class='layer-option-list' id='search_user_list'>";
		html += "			<li><em>Member</em></li>";
		
		for (var i = 0 ; i < list.length; i++){
			var member = list[i];			
			var user_info = gap.user_check(member);						
			html += "			<li>";
			html += "				<div class='user' data='"+user_info.ky+"'>";
			html += "					<div class='user-thumb'>"+user_info.user_img+"</div>";
			html += "					<dl>";
			html += "						<dt>"+user_info.name + gap.lang.hoching + "</dt>";
			html += "						<dd>"+user_info.jt+" / "+user_info.dept+"</dd>";
			html += "					</dl>";
			html += "				</div>";
			html += "			</li>";			
		}	
		
		
	/*	var user_info = gap.user_check(gTodo.cur_project_info.owner);
		
		html += "			<li>";
		html += "				<div class='user' data='"+user_info.ky+"'>";
		html += "					<div class='user-thumb'>"+user_info.user_img+"</div>";
		html += "					<dl>";
		html += "						<dt>"+user_info.name+ gap.lang.hoching + "</dt>";
		html += "						<dd>"+user_info.jt+" / "+user_info.dept+"</dd>";
		html += "					</dl>";
		html += "				</div>";
		html += "			</li>";*/
		
		
		html += "		</ul>";
		html += "	</div>";
		html += "</div>";
		
	
		gTodo.show_qtip(e, html, -30);
		
	},
	
	
	"todo_change_status_listmode_layer" : function(e){
		
		gTodo._click_obj = $(e.currentTarget);
		
		var html = "";
		html += "<div class='qtip-default' style='border:none;'>";
		html += "	<ul class='layer-status-list' id='search_status_list'>";
		html += "		<li class='temp' data='0'>"+gap.lang.temps+"</li>";
		html += "		<li class='wait' data='1'>"+gap.lang.wait+"</li>";
		html += "		<li class='continue' data='2'>"+gap.lang.doing+"</li>";
		html += "		<li class='complete' data='3'>"+gap.lang.done+"</li>";
		html += "	</ul>";
		html += "</div>";

		gTodo.show_qtip(e, html, -50);
		
	},
	"todo_change_priority_listmode_layer" : function(e){
		
		gTodo._click_obj = $(e.currentTarget);
			
		var html = "";
//		html += "<div class='qtip' style='display:block;left:auto;right:450px;top:114px;z-index:100;'>";
		html += "<div class='qtip-default' style='border:none;'>";
		html += "	<ul class='layer-option-list' id='search_option_list'>";
		html += "		<li data='1'>";
		html += "			<span class='ico p1'></span> <em>"+gap.lang.priority1+"</em>";
		html += "		</li>";
		html += "		<li  data='2'>";
		html += "			<span class='ico p2'></span> <em>"+gap.lang.priority2+"</em>";
		html += "		</li>";
		html += "		<li data='3'>";
		html += "			<span class='ico p3'></span> <em>"+gap.lang.priority3+"</em>";
		html += "		</li>";
		html += "		<li data='4'>";
		html += "			<span class='ico p4'></span> <em>"+gap.lang.priority4+"</em>";
		html += "		</li>";
//		html += "		<li data='5'>";
//		html += "			<span class='ico p5'></span> <em>"+gap.lang.priority5+"</em>";
//		html += "		</li>";
		html += "	</ul>";
		html += "</div>";
//		html += "</div>";
		
		gTodo.show_qtip(e, html, -50);
		
	},
	
	"show_qtip" : function(e, html, leftposition){
	
		var target_id = $(e.currentTarget).parent().attr("id");
		gTodo.sid = target_id.replace("list_card_","");
		
		$(e.currentTarget).qtip({
			overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
			content : {
				text : html
			},
			show : {
				event: 'click',
				ready: true
			},
			hide : {
				//event : 'click unfocus',
				//event : 'mouseout',
				event : 'unfocus',
				fixed : true
			},
			style : {
				classes : 'qtip-bootstrap',
				tip : true
			},
			position : {
				
				viewport: $("#todo_scroll"),
				my : 'top center',
//				at : 'bottom bottom',			
				adjust: {
				  x: leftposition,
				  y: -5
				}
				
			},
			events : {
				show : function(event, api){	
				
				
					//목록에서 태그로 필터링을 선택한 경우
					$("#option_change_tag li").off();
					$("#option_change_tag li").on("change", function(e){
						
						var listCheckItems = $("#option_change_tag :checkbox");
						var chlist = listCheckItems.filter(":checked");
						var keys = []
						for (var i = 0 ; i < chlist.length; i++){
							var key = chlist[i];
							keys.push(key.value);
						}						
												

						gTodo.show_filter("tag", keys);
					});
					
					//목록에서 우선선위를 필터링을 선택한 경우
					$("#option_change_priority li").off();
					$("#option_change_priority li").on("change", function(e){
						var listCheckItems = $("#option_change_priority :checkbox");
						var chlist = listCheckItems.filter(":checked");
						var keys = []
						for (var i = 0 ; i < chlist.length; i++){
							var key = chlist[i];
							keys.push(parseInt(key.value));
						}						

						gTodo.show_filter("priority", keys);
					});
					
					//목록에서 color로 필터링을 선택한 경우
					$("#option_change_color li").off();
					$("#option_change_color li").on("click", function(e){	
						var dc = $(e.currentTarget).hasClass("on");
						if (dc){
							$("#option_change_color li").removeClass("on");	
							gTodo.show_filter("color", []);	
						}else{
							$("#option_change_color li").removeClass("on");	
							var keys = [];
							var pp = $(e.currentTarget).attr("class");	
							keys.push(pp);
							gTodo.show_filter("color", keys);						
							$(e.currentTarget).addClass("on");
						}

					});
					
					//목록에서 asignee로 필터링을 선택한 경우
					$("#option_change_asignee li").off();
					$("#option_change_asignee li").on("change", function(e){
						var listCheckItems = $("#option_change_asignee :checkbox");
						var chlist = listCheckItems.filter(":checked");
						var keys = []
						for (var i = 0 ; i < chlist.length; i++){
							var key = chlist[i];
							keys.push(key.value);
						}						
						gTodo.show_filter("asignee", keys);
					});
				
				
				
					//우선순위 레이어 선택한 경우
					$("#search_option_list li").off();
					$("#search_option_list li").on("click", function(e){

						
						var skey = $(this).attr("data");
						
						var data = JSON.stringify({
						//	project_code : gTodo.cur_todo_code,
							project_code : gTodo.select_todo.project_code,
							update_key : "priority",
							update_data : skey,
							select_key : "_id",
							select_id : gTodo.sid
						});

						
						var url = gap.channelserver + "/update_todo_item_sub.km";
						$.ajax({
							type : "POST",
							dataType : "json",
							contentType : "application/json; charset=utf-8",
							data : data,
							url : url,
							success : function(res){
								if (res.result == "OK"){
									
									var status = res.data.status;
									gTodoC.update_todo_progress_icon(gTodo.cur_todo_code, status);
									
									//우선 순위를 변경한다.
									var html = "";
									if (skey == "1"){
										html += "<span class='ico p1'></span>" + gap.lang.priority1;
									}else if (skey == "2"){
										html += "<span class='ico p2'></span>" + gap.lang.priority2;
									}else if (skey == "3"){
										html += "<span class='ico p3'></span>" + gap.lang.priority3;
									}else if (skey == "4"){
										html += "<span class='ico p4'></span>" + gap.lang.priority4;
									}
//									else if (skey == "5"){
//										html += "<span class='ico p5'></span>" + gap.lang.priority5;
//									}
									
									$(gTodo._click_obj).qtip("destroy");
									$(gTodo._click_obj).html(html);
									
									//로컬 데이터 변경
									gTodo.select_id = gTodo.sid;
									var change_doc = res.data.doc;
									gTodo.change_local_data(change_doc);
									
									// 캘린더 이벤트 업데이트
									gTodoC.update_calendar_event(gTodo.select_id);
									
								}else{
									gap.error_alert();
								}
								
							},
							error : function(e){
								gap.error_alert();
							}
						});
						
					});
				
					//리스트 모드에서 상태를 변경한 경우
					$("#search_status_list li").off();
					$("#search_status_list li").on("click", function(e){
						
						var skey = $(e.currentTarget).attr("data");
						
						var data = JSON.stringify({
							project_code : gTodo.cur_todo_code,
						//	project_code : gTodo.select_todo.project_code,
							update_key : "status",
							update_data : skey,
							select_key : "_id",
							select_id : gTodo.sid
						});

						
						var url = gap.channelserver + "/update_todo_item_sub.km";
						$.ajax({
							type : "POST",
							dataType : "json",
							contentType : "application/json; charset=utf-8",
							data : data,
							url : url,
							success : function(res){
							
								if (res.result == "OK"){
									
									var status = res.data.status;
									gTodoC.update_todo_progress_icon(gTodo.cur_todo_code, status);
									
									$(gTodo._click_obj).qtip("destroy");
									
									//로컬 데이터를 변경하는 기준이 선택한 양식의 key값으로 되어 있어 gTodo.select_id를 설정해 줘야 로컬 데이터를 수정 할 수 있다.
									//양식을 띄운 상태에서 데이터 변경을 로컬 데이터에 적용하는 함수를 공통으로 사용한다.									
									gTodo.select_id = gTodo.sid;
									
									var change_doc = res.data.doc;
									gTodo.change_local_data(change_doc);
									
									gTodo.todo_center_status_list();
									
									
									
									//상태가 변경될 경우 알려주는 함수를 호출한다. //////////////
									//알려주는 대상자는 1. 프로젝트 Owner, 2. TODO 작성자
															
									
									var obj = new Object();
									obj.id = change_doc._id.$oid;
									obj.type = "cs";  //change status
									obj.p_code = change_doc.project_code;
									obj.p_name = gap.textToHtml(change_doc.project_name);
									obj.title = change_doc.title;
									obj.status = change_doc.status;
									
									var tsender = [];
									if (gTodo.cur_project_info.owner.ky != gap.userinfo.rinfo.ky){							
										//obj.sender = gTodo.cur_project_info.owner.ky;  //해당 프로젝트의 owner에게만 전송한다.		
										var list = [];
										list.push(gTodo.cur_project_info.owner.ky);
										obj.sender = list;
										_wsocket.send_todo_msg(obj);		
										tsender.push(gTodo.cur_project_info.owner.ky);
									}
									//현재 수정하는 사용자가  TODO생성자가 아닐 경우 TODO생성자에게 알림을 전송한다.				
									if (change_doc.owner.ky != gap.userinfo.rinfo.ky){
									//	obj.sender = change_doc.owner.ky;  //TODO생성자에게 전송한다.	
										var list = [];
										list.push(change_doc.owner.ky);
										obj.sender = list;
										_wsocket.send_todo_msg(obj);
										tsender.push(change_doc.owner.ky);
									}
									
									
									 //모바일  Push를 날린다. ///////////////////////////////////		
									var mx = "";
									if (obj.status == "0"){
										mx = gap.lang.temps;
									}else if (obj.status == "1"){
										mx = gap.lang.wait;
									}else if (obj.status == "2"){
										mx = gap.lang.doing;
									}else if (obj.status == "3"){
										mx = gap.lang.done;
									}
									var smsg = new Object();
									smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";
									smsg.msg = "[" + change_doc.project_name + "]" + gTodo.short_title(obj.title) + " " + gap.lang.cs.replace("$s",mx);		
									smsg.type = "todo";
									smsg.key1 = change_doc.project_code;
									smsg.key2 = change_doc._id.$oid;
									smsg.key3 = "";
									smsg.fr = gap.userinfo.rinfo.nm;
									//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
									if (tsender != ""){
										smsg.sender = tsender.join("-spl-");										
									//	gap.push_noti_mobile(smsg);
										
										//알림센터에 푸쉬 보내기
										var rid = change_doc.project_code;
										var receivers = tsender;
										var msg2 = "[" + gTodo.short_title(obj.title) + "]" + " " + gap.lang.cs.replace("$s",mx);	
										var sendername = "["+gap.lang.todo+" : "+ gap.textToHtml(change_doc.project_name) +"]"
										var data = smsg;
										gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
									}																				
									//////////////////////////////////////////////////////
									
									
									//$(gTodo._click_obj).parent().parent().parent().attr("id")
									//일정 연동되는 부분에 "3"일 경우 완료 처리해 준다.
									if (change_doc.status == "3"){
										gap.todo_connect_schedule_update(change_doc, "T", "");
									}
									
								}else{
									gap.error_alert();
								}
								
							},
							error : function(e){
								gap.error_alert();
							}
						});
						
					})
				
					//리스트 모드에서 담당자를 변경했을 경우
					$("#search_user_list .user").off();
					$("#search_user_list .user").on("click", function(e){
						
						
						
						var ky = $(e.currentTarget).attr("data");
						var info = gTodo.search_user_cur_project_info(ky);	
						
//						var orginal_column = $(e.target).attr("id");
//						var orignal_empno2 = gTodo.orginal_column.replace("card_", "").replace("-spl-", "@").replace(/-sp-/gi,".");
//						gTodo.orignal_empno = gTodo.search_user_cur_project_info_email(orignal_empno2).emp;
						
	//					var select_user_img = gap.person_photo(info.pu);
						var user_info = gap.user_check(info);
						
						//TODO 전체 담당자를 선택한 경우 별도 처리해 준다.
						var data = JSON.stringify({
							asignee : info,
							todo_id : gTodo.sid,
							ty : "add"
						});
						
						var url = "";
					
						url = gap.channelserver + "/update_asignee_todo.km";					
						
						$.ajax({
							type : "POST",
							dataType : "json",
							conteType : "application/json; charset=utf-8",
							data : data,
							url : url,
							success : function(res){
								
								if (res.result == "OK"){
									
									var person_img = "<div class='user-thumb'>"+user_info.user_img+"</div>";
									$(gTodo._click_obj).html(person_img);

									//gTodo._click_obj는 체크리스트에서 사용자 선택 버튼을 클릭 할때 설정했음
									$(gTodo._click_obj).qtip("destroy");
									
									//기존에 지정되어 있던 담당자가 변경되는 경우와 신규로 추가되는 경우를 판단해서 일정연동을 처리해야 한다.
									var ori_asignee = "";
									for (var i = 0 ; i < gTodo.cur_project_item_list.length; i++){
										var pp = gTodo.cur_project_item_list[i];
										if (pp._id.$oid == gTodo.sid){
											if (typeof(pp.asignee) == "undefined"){
												//일정에 신규로 추가한다.
												gap.schedule_update(res.data.doc, "asignee", "U");
											}else{
												//현재 선택되 사용자와 동일한지 판단해서 다른 경우 기존 사용자 일정 제거하고 신규 사용자 일정을 추가한다.
												if (pp.asignee.ky != res.data.doc.asignee.ky){
													var obb = new Object();						
													obb.del_id = res.data.doc.project_code + "^" + res.data.doc._id.$oid;
													obb.del_emp = pp.asignee.ky;
													gap.schedule_update(obb, "asignee", "D");
													//신규 담당자의 업무를 등록한다.
													gap.schedule_update(res.data.doc, "asignee", "U");
												}
												
											}
											break;
										}										
									}
									
																	
									//로컬 데이터를 변경하는 기준이 선택한 양식의 key값으로 되어 있어 gTodo.select_id를 설정해 줘야 로컬 데이터를 수정 할 수 있다.
									//양식을 띄운 상태에서 데이터 변경을 로컬 데이터에 적용하는 함수를 공통으로 사용한다.
									
									gTodo.select_id = gTodo.sid;
									
									var change_doc = res.data.doc;
									gTodo.change_local_data(change_doc);
									
									
									if (gTodo.cur_todo == "status"){
									}else if (gTodo.cur_todo == "user"){															
										gTodo.todo_center_status_list();	
									}
									
									//TODO에 담당자를 지정할 경우 해당 사용자에게 TODO가 할당되었음을 실시간 알려준다.
									if (change_doc.asignee.ky != gap.userinfo.rinfo.ky){
										var obj = new Object();
										obj.id = change_doc._id.$oid;
										obj.type = "as";  //change status
										obj.p_code = change_doc.project_code;
										obj.p_name = gap.textToHtml(change_doc.project_name);
										obj.title = change_doc.title;
									//	obj.sender = change_doc.asignee.ky;  //해당 프로젝트의 owner에게만 전송한다.	
										var list = [];
										list.push(change_doc.asignee.ky);
										obj.sender = list;
										_wsocket.send_todo_msg(obj);	
										
										
										var smsg = new Object();
									//	smsg.msg = "[" + change_doc.project_name + "]" + obj.title + " " + gap.lang.csm;
										smsg.msg = "[" + change_doc.project_name + "] " +  gap.lang.csm;
										smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";
										smsg.type = "as";
										smsg.key1 = change_doc.project_code;
										smsg.key2 = change_doc._id.$oid;
										smsg.key3 = "";
										smsg.fr = gap.userinfo.rinfo.nm;
										//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
										//smsg.sender = change_doc.asignee.ky.join("-spl-");	
										smsg.sender = change_doc.asignee.ky;	
									//	gap.push_noti_mobile(smsg);		
										
										//알림센터에 푸쉬 보내기
										var rid = change_doc.project_code;
										var receivers = [];
										receivers.push(change_doc.asignee.ky);
										var msg2 = "[" + gap.textToHtml(change_doc.project_name) + "] " +  gap.lang.csm;
										var sendername = "["+gap.lang.todo+" : "+ gap.textToHtml(change_doc.project_name) +"]"
										var data = smsg;
										gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);																							
										
									}
									
									
						
								}else{
									gap.error_alert();
								}
								
							},
							error : function(e){
								gap.error_alert();
							}
						});
						
					});
					
			
					$(".layer-option-member .formInput").off();
					$(".layer-option-member .formInput").keypress(function(e){
						if (e.keyCode == 13){
							var q = $(this).val();
							var companycode = gap.userinfo.rinfo.cpc;
							
							var data = JSON.stringify({
								name : q,
								companycode : companycode
							});
							
							if (q.length < 2){
								gap.gAlert(gap.lang.valid_search_keyword);
								return false;
							}
							var url = gap.channelserver + "/search_user.km";
							$.ajax({
								type : "POST",
								dataType : "json",
								contentType : "application/json; charset=utf-8",
								url : url,
								data : data,
								success : function(res){						
									
									if (res.length > 0){
										
										var list = res;
										var html = "";
											
										for (var i = 0 ; i < list.length; i++){
											var member = list[i];
											
											var user_info = gap.user_check(member);
												
											html += "			<li>";
											html += "				<div class='user'>";
											html += "					<div class='user-thumb'>"+user_info.user_img+"</div>";
											html += "					<dl>";
											html += "						<dt>"+user_info.name+ gap.lang.hoching + "</dt>";
											html += "						<dd>"+user_info.jt+" / "+user_info.dept+"</dd>";
											html += "					</dl>";
											html += "				</div>";
											html += "			</li>";
											
										}
									
										$("#search_user_list").empty();
										$("#search_user_list").html(html);
									}							
								},
								error : function(e){
									gap.error_alert();
								}
							})
							
							return false;
						}						
					});
								
					
				},
				hidden : function(event, api){
					
					gTodo.filtering = false;
					if (gTodo.cur_type == "list"){
					//	gTodo.todo_center_status_list();
					}else if (gTodo.cur_type == "card"){
						if (gTodo.cur_todo == "status"){
						//	 gTodo.todo_center_status_change();
						}else if (gTodo.cur_todo == "user"){
							
						//	gTodo.todo_call_users();
						}
					}else if (gTodo.cur_type == "calendar"){
					//	gTodoC.redraw_calendar_event();
					}
					
					api.destroy(true);
				}
			}
		});
	},
	
	"todo_change_status_listmode" : function(){
		
	},
	
	
	"todo_center_default_list_mode" : function(){
		var html = "";
		html += "<div class='todo-list' style='width:calc(100% - 3px)'>";		
		
		html += "<div class='card-list' id='l_card_0'>";
		html += "	<h2><button class='ico btn-collapse on' id='list_temp_col'><span>접기</span></button>"+gap.lang.temps+"<span id='list_count_0'> (0)</span></h2>";
		html += "	<div class='card' id='list_card_0' style='min-height:40px'>";
		html += "		<div class='card-title title-top'>";
		html += "			<div class='color-bar c0'></div> ";
		html += "			<div class='todo-sbj'></div>";
		
		if (gTodo.cur_todo_code != gBody3.temp_room_key){
			html += "			<div class='icons'></div>";
			html += "			<div class='user'>"+gap.lang.asign+"</div>";
			html += "			<div class='status'>"+gap.lang.status+"</div>";
			html += "			<div class='todo-period'>"+gap.lang.todo_period+"</div>";
			html += "			<div class='todo-progress'>"+gap.lang.todo_rate+"</div>";
		}
		
		
		
		html += "			<div class='todo-priority'>"+gap.lang.priority+"</div>";
		html += "			<div class='icons'>"+gap.lang.file+"</div>";
		html += "		</div>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text'  autocomplete='off' class='formInput' placeholder='+ "+gap.lang.addtodo+"' />";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "</div>";
		
		html += "<div class='card-list' id='l_card_1'>";
		html += "	<h2><button class='ico btn-collapse on' id='list_wait_col'><span>접기</span></button>"+gap.lang.wait+"<span id='list_count_1'> (0)</span></h2>";
		html += "	<div class='card' id='list_card_1' style='min-height:40px'>";
		html += "		<div class='card-title title-top' >";
		html += "			<div class='color-bar c0'></div> ";
		html += "			<div class='todo-sbj'></div>";
		
		if (gTodo.cur_todo_code != gBody3.temp_room_key){
			html += "			<div class='icons'></div>";
			html += "			<div class='user'>"+gap.lang.asign+"</div>";
			html += "			<div class='status'>"+gap.lang.status+"</div>";
			html += "			<div class='todo-period' >"+gap.lang.todo_period+"</div>";
			html += "			<div class='todo-progress'>"+gap.lang.todo_rate+"</div>";
		}

		html += "			<div class='todo-priority'>"+gap.lang.priority+"</div>";
		html += "			<div class='icons'>"+gap.lang.file+"</div>";
		html += "		</div>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput'  autocomplete='off' placeholder='+ "+gap.lang.addtodo+"' />";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "</div>";
		
		html += "<div class='card-list' id='l_card_2'>";
		html += "	<h2><button class='ico btn-collapse on' id='list_continue_col'><span>접기</span></button>"+gap.lang.doing+"<span id='list_count_2'> (0)</span></h2>";
		html += "	<div class='card' id='list_card_2' style='min-height:40px'>";
		html += "		<div class='card-title title-top'>";
		html += "			<div class='color-bar c0'></div> ";
		html += "			<div class='todo-sbj'></div>";
		
		if (gTodo.cur_todo_code != gBody3.temp_room_key){
			html += "			<div class='icons'></div>";
			html += "			<div class='user'>"+gap.lang.asign+"</div>";
			html += "			<div class='status'>"+gap.lang.status+"</div>";
			html += "			<div class='todo-period'>"+gap.lang.todo_period+"</div>";
			html += "			<div class='todo-progress' >"+gap.lang.todo_rate+"</div>";
		}
		
		html += "			<div class='todo-priority'>"+gap.lang.priority+"</div>";
		html += "			<div class='icons'>"+gap.lang.file+"</div>";
		html += "		</div>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput'  autocomplete='off' placeholder='+ "+gap.lang.addtodo+"' />";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "</div>";
		
		html += "<div class='card-list' id='l_card_3'>";
		html += "	<h2><button class='ico btn-collapse on' id='list_complete_col'><span>접기</span></button>"+gap.lang.done+"<span id='list_count_3'> (0)</span></h2>";
		html += "	<div class='card' id='list_card_3' style='min-height:40px'>";
		html += "		<div class='card-title title-top'>";
		html += "			<div class='color-bar c0'></div> ";
		html += "			<div class='todo-sbj'></div>";
		if (gTodo.cur_todo_code != gBody3.temp_room_key){
			html += "			<div class='icons'></div>";
			html += "			<div class='user'>"+gap.lang.asign+"</div>";
			html += "			<div class='status'>"+gap.lang.status+"</div>";
			html += "			<div class='todo-period' >"+gap.lang.todo_period+"</div>";
			html += "			<div class='todo-progress'>"+gap.lang.todo_rate+"</div>";
		}

		html += "			<div class='todo-priority'>"+gap.lang.priority+"</div>";
		html += "			<div class='icons'>"+gap.lang.file+"</div>";
		html += "		</div>";
		html += "	</div>";
		html += "	<div class='input-field'>";
		html += "		<input type='text' class='formInput'  autocomplete='off' placeholder='+ "+gap.lang.addtodo+"' />";
		html += "		<span class='bar'></span>";
		html += "	</div>";
		html += "</div>";
		
		
		html += "</div>";

		return html;
		
	},
	
	
	"todo_center_default_list_mode_user" : function(){
		
	
		var list = gTodo.cur_project_item_list;
		var users = [];
		var emails = [];
		var is_unsign = false;
		var unsign_count = 0;
		for (var i = 0 ; i < list.length; i++){					
			if ( (typeof(list[i].asignee) != "undefined") && (list[i].asignee != "") ){
				var ix = list[i].asignee.nm;
				users.push(ix);
				var email = list[i].asignee.em;
				emails.push(email);
			}else{
				is_unsign = true;	
				unsign_count ++;
			}				
		}
		var ux = [];
		var ems = [];
		var kk = 0;
		
		$.each(users, function(i,el){
			if ($.inArray(el, ux) === -1){
				ux.push(el);
				ems.push(emails[kk]);
			}
			kk++;
		});
		
		var html = "";
		html += "<div class='todo-list' style='width:calc(100% - 3px)'>";		
		
		if (is_unsign){
			html += "<div class='card-list' id='l_unasign'>";
			html += "	<h2><button class='ico btn-collapse on' id='list_temp_col'><span>접기</span></button>"+gap.lang.Unassigned+"<span id='list_unasign_count'> (0)</span></h2>";
			html += "	<div class='card' id='list_unasign' style='min-height:40px'>";
			html += "		<div class='card-title'>";
			html += "			<div class='color-bar c0'></div> ";
			html += "			<div class='todo-sbj'></div>";
			html += "			<div class='icons'></div>";
			html += "			<div class='user'>"+gap.lang.asign+"</div>";
			html += "			<div class='status'>"+gap.lang.status+"</div>";
			html += "			<div class='todo-period'>"+gap.lang.todo_period+"</div>";
			html += "			<div class='todo-progress'>"+gap.lang.todo_rate+"</div>";
			html += "			<div class='todo-priority'>"+gap.lang.priority+"</div>";
			html += "			<div class='icons'>"+gap.lang.file+"</div>";
			html += "		</div>";
			html += "	</div>";
			html += "	<div class='input-field'>";
			html += "		<input type='text' class='formInput'  autocomplete='off' placeholder='+ "+gap.lang.addtodo+"' />";
			html += "		<span class='bar'></span>";
			html += "	</div>";
			html += "</div>";
			
		}
		
		for (var i = 0 ; i < ux.length; i++){
			var username = ux[i];
			var em = gTodo.ch_em(ems[i]);
			
			html += "<div class='card-list' id='l_"+em+"'>";
			html += "	<h2><button class='ico btn-collapse on' id='list_"+em+"_col'><span>접기</span></button>"+username+"<span id='list_"+em+"_count'> (0)</span></h2>";
			html += "	<div class='card' id='list_"+em+"' style='min-height:40px'>";
			html += "		<div class='card-title'>";
			html += "			<div class='color-bar c0'></div> ";
			html += "			<div class='todo-sbj'></div>";
			html += "			<div class='icons'></div>";
			html += "			<div class='user'>"+gap.lang.asign+"</div>";
			html += "			<div class='status'>"+gap.lang.status+"</div>";
			html += "			<div class='todo-period'>"+gap.lang.todo_period+"</div>";
			html += "			<div class='todo-progress'>"+gap.lang.todo_rate+"</div>";
			html += "			<div class='todo-priority'>"+gap.lang.priority+"</div>";
			html += "			<div class='icons'>"+gap.lang.file+"</div>";
			html += "		</div>";
			html += "	</div>";
			html += "	<div class='input-field'>";
			html += "		<input type='text' class='formInput'  autocomplete='off' placeholder='+ "+gap.lang.addtodo+"' />";
			html += "		<span class='bar'></span>";
			html += "	</div>";
			html += "</div>";
			
		}
		
		
		
		
		
		
		html += "</div>";

		return html;
		
	},
	
	
	
	
	
	
	"todo_top_title_change" : function(title, express){
		$("#todo_top_title").html(title);
		$("#todo_top_express").html(express);
	},
	
	
	
	"__todo_center_event" : function(){
		
		
		gTodo.__init_event();
		
		//스크롤 처리 todo_main_content
		try{			
			$("#todo_scroll").mCustomScrollbar('destroy');
			//$("#todo_main").mCustomScrollbar('destroy');
			
		}catch(e){}
		
		$("#todo_scroll").mCustomScrollbar({
		//$("#todo_main").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
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
		
		$(".temp-contents .formInput").keypress(function(evt){
			if (evt.keyCode == 13){
				
				
				var _self = this;
				var msg = $(this).val();
				var xstatus = "0";
				
				var tlist = gTodo.get_column_list_ids("card_" + status);
				
				var url = gap.channelserver + "/make_item_todo.km";
				var data = JSON.stringify({
					title : msg,
					owner : gap.userinfo.rinfo,
					status : xstatus,
					project_code : gTodo.cur_todo_code,
					project_name : gTodo.cur_todo_name,
					tlist : tlist,
					priority: 3,
					checklist : [],
					file : [],
					reply : []
				});
				$.ajax({
					type : "POST",
					datatype : "json",
					contentType : "application/json; charset=utf-8",
					url : url,
					data : data,
					success : function(res){
						if (res.result == "OK"){
							var info = new Object();
							info.id = res.data.id;
							info.title = msg;
							info.status = xstatus;
							
							
							var status = res.data.status;
							gTodoC.update_todo_progress_icon(gTodo.cur_todo_code, status);
							
							var list = res.data.data;
							gTodo.cur_project_item_list = list;
							
							var ht = gTodo.todo_make_card_first(info);
							if ($(".temp-contents .card").children().length == 0){
								$(".temp-contents .card").append($(ht));
							}else{
								$(ht).insertBefore($(".temp-contents .card").children().first());	
							}	
							var cnt = $(".temp-contents .card").children().length;
							$("#temp_count").html(" ("+cnt+")");
							
							$(_self).val("");
							
							//생성된 카드에 이벤트를 부여한다.
							gTodo.__after_draw_event();
							
							gTodo.__draganddrop();
							
						}

					},
					error : function(e){
						gap.error_alert();
					}
				})
			}
		});
		
		$(".todo-card .formInput").keypress(function(evt){
			
			if (evt.keyCode == 13){		
							
				
				if (gTodo.cur_todo == "status"){
					
					var _self = this;
					var msg = $(this).val();
					var xstatus = "1";
					var cn = $(this).parent().parent().parent().attr("class");
					if (cn.indexOf("card-waid") > -1){
						xstatus = "1";
					}else if (cn.indexOf("card-continue") > -1){
						xstatus = "2";
					}else if (cn.indexOf("card-complete") > -1){
						xstatus = "3";
					}
					
									
					var tlist = gTodo.get_column_list_ids("card_" + xstatus);
					
					//메시지를 저장하고 id값을 받아와서 하단에 카드를 추가한다. //todo_make_item.km
					var url = gap.channelserver + "/make_item_todo.km";
					var data = JSON.stringify({
						title : msg,
						owner : gap.userinfo.rinfo,
						status : xstatus,
						project_code : gTodo.cur_todo_code,
						project_name : gTodo.cur_todo_name,
						tlist : tlist,
						priority : 3,
						checklist : [],
						file : [],
						reply : []
					});
					$.ajax({
						type : "POST",
						datatype : "json",
						contentType : "application/json; charset=utf-8",
						url : url,
						data : data,
						success : function(res){
							
							var info = new Object();
							info.id = res.data.id;
							info.title = msg;
							info.status = xstatus;
							
							var status = res.data.status;
							gTodoC.update_todo_progress_icon(gTodo.cur_todo_code, status);
							
							var list = res.data.data;
							gTodo.cur_project_item_list = list;
							
							var ht = gTodo.todo_make_card_first(info);
							if (xstatus == "1"){
								if ($(".card-wait .card").children().length == 0){
									$(".card-wait .card").append($(ht));
								}else{
									$(ht).insertBefore($(".card-wait .card").children().first());	
								}	
								var cnt = $(".card-wait .card").children().length;
								$("#wait_count").html(" ("+cnt+")");
							}else if (xstatus == "2"){
								if ($(".card-continue .card").children().length == 0){
									$(".card-continue .card").append($(ht));
								}else{
									$(ht).insertBefore($(".card-continue .card").children().first());	
								}				
								var cnt = $(".card-continue .card").children().length;
								$("#continue_count").html(" ("+cnt+")");
							}else if (xstatus == "3"){
								if ($(".card-complete .card").children().length == 0){
									$(".card-complete .card").append($(ht));
								}else{
									$(ht).insertBefore($(".card-complete .card").children().first());	
								}
								var cnt = $(".card-complete .card").children().length;
								$("#complete_count").html(" ("+cnt+")");
							}
							$(_self).val("");
							
							//생성된 카드에 이벤트를 부여한다.
							gTodo.__after_draw_event();
							
							gTodo.__draganddrop();
						},
						error : function(e){
							gap.error_alert();
						}
					})
					
					
				}else if (gTodo.cur_todo == "user"){
			
					var _self = this;
					var msg = $(this).val();
					var xstatus = "1";
					
					var id = $(evt.currentTarget).parent().parent().parent().attr("id");  //"cc_ces9867-spl-kmslab-sp-com"
					var tm = id.replace("cc_","");
					var em = gTodo.dh_em(tm);
					
					var key = $(evt.currentTarget).parent().parent().parent().find(".g-card").get(0).id;
					
					
					var owner = "";
					var tlist = "";
					if (id == "card_unasingn"){						
						tlist = gTodo.get_column_list_ids("card_unasign_div");
					}else{
						owner = gTodo.search_user_list_item(key.replace("card_",""));
						tlist = gTodo.get_column_list_ids("card_" + tm);
					}
					
					
					
									
					//메시지를 저장하고 id값을 받아와서 하단에 카드를 추가한다. //todo_make_item.km
					var url = gap.channelserver + "/make_item_todo.km";
					var data = JSON.stringify({
						title : msg,
						owner : gap.userinfo.rinfo,
						status : xstatus,
						project_code : gTodo.cur_todo_code,
						project_name : gTodo.cur_todo_name,
						asignee : owner,
						tlist : tlist,
						priority : 3,
						checklist : [],
						file : [],
						reply : []
					});
					$.ajax({
						type : "POST",
						datatype : "json",
						contentType : "application/json; charset=utf-8",
						url : url,
						data : data,
						success : function(res){
							
							var info = new Object();
							info.id = res.data.id;
							info.title = msg;
							info.status = xstatus;
							info.asignee = owner;
							
							var list = res.data.data;
							gTodo.cur_project_item_list = list;
							
							var ht = gTodo.todo_make_card_first(info);
							
														
							var status = res.data.status;
							gTodoC.update_todo_progress_icon(gTodo.cur_todo_code, status);
						
							
							if (id == "card_unasingn"){
								$(ht).insertBefore($("#card_unasign_div").children().first());	 //여기서는 insertBefoer만 발생할 수 있다.
							}else{
								$(ht).insertBefore($("#card_" + tm).children().first());	 //여기서는 insertBefoer만 발생할 수 있다.
							}
							
							$(_self).val("");
							
							//생성된 카드에 이벤트를 부여한다.
							gTodo.__after_draw_event();
							
							gTodo.__draganddrop();
						},
						error : function(e){
							gap.error_alert();
						}
					})
				}
				
			}
		});
		
	
		
		$("#hidden_folder_expand").off();
		$("#hidden_folder_expand").on("click", function(e){			
			$("#hidden_folder").hide();
			$("#show_folder").fadeIn();
			$(".todo-contents").css("width","calc(100% - 280px)");
		});
		$("#expand_folder_collapse").off();
		$("#expand_folder_collapse").on("click", function(e){
			$("#show_folder").hide();
			$("#hidden_folder").fadeIn();		
			$(".todo-contents").css("width","calc(100% - 32px)");
		});
		$("#btn_todo_file").off();
		$("#btn_todo_file").on("click", function(e){
			
			$("#center_content").removeAttr("class");
			$("#center_content").addClass("left-area todo fold-temp");
			
			gTodoC.todo_attachment();
			if (gTodo.cur_type == "calendar"){
				gTodoC.calendar.render();
			}
			//$('select').material_select();
		});
		$("#btn_todo_channel").off();
		$("#btn_todo_channel").on("click", function(e){
	
			gTodo.todo_channel();
			if (gTodo.cur_type == "calendar"){
				gTodoC.calendar.render();
			}
			//$('select').material_select();
		});

		$("#btn_todo_invite").off();
		$("#btn_todo_invite").on("click", function(e){
		
			$("#center_content").removeAttr("class");
			$("#center_content").addClass("left-area todo fold-temp");
			
			gTodo.todo_members();
			if (gTodo.cur_type == "calendar"){
				gTodoC.calendar.render();
			}
			//$('select').material_select();
		});
		
		$("#btn_todo_star").off();
		$("#btn_todo_star").on("click", function(e){
			$("#center_content").removeAttr("class");
			$("#center_content").addClass("left-area todo fold-temp");
			
		//	gTodo.todo_stars();
			gTodoC.todo_star();
			if (gTodo.cur_type == "calendar"){
				gTodoC.calendar.render();
			}
		});
		
		$("#btn_todo_archive").off();
		$("#btn_todo_archive").on("click", function(e){
			$("#center_content").removeAttr("class");
			$("#center_content").addClass("left-area todo fold-temp");
			
		//	gTodo.todo_stars();
			gTodoC.todo_archive();
			if (gTodo.cur_type == "calendar"){
				gTodoC.calendar.render();
			}
		});
		
		$("#btn_todo_mention").off();
		$("#btn_todo_mention").on("click", function(e){
			$("#center_content").removeAttr("class");
			$("#center_content").addClass("left-area todo fold-temp");
			
		//	gTodo.todo_stars();
			gTodoC.todo_mention();
			if (gTodo.cur_type == "calendar"){
				gTodoC.calendar.render();
			}
		});
		
		$("#todo_top_favorite_btn").off();
		$("#todo_top_favorite_btn").on("click", function(e){
		
			var gubun = "";
			if ($(this).hasClass("on")){
				$(this).removeClass("on");
				gubun = "del";
			}else{
				$(this).addClass("on");
				gubun = "add";
			}
			
			//즐겨찾기를 선택 추가 호추 해제 하는 프로세스 호출
			var url = gap.channelserver + "/update_folder_favorite_todo.km";
		/*	data = JSON.stringify({
				email : gap.userinfo.rinfo.em,
				project_code : gTodo.cur_todo_code,
				project_name : gTodo.cur_todo_name,
				ty : gubun
			});*/
			
			data = JSON.stringify({
				project_code : gTodo.cur_todo_code,
				project_name : gTodo.cur_todo_name,
				ty : gubun
			});
			
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "applcation/json; charset=utf-8",
				url : url,
				data : data,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){
					if (res.result == "OK"){
						gTodo.cur_project_info.favorite = (gubun == "add" ? "T" : "F");
						gTodoC.draw_favorite_list(gubun, gTodo.cur_project_info);
						
					}else{
						gap.error_alert();
					}
					/*if (res.result == "ERROR"){
						gap.error_alert();
					}*/
				},
				error : function(e){
					gap.error_alert();
				}
			})
			
		});
		
		
		
		
		gap.draw_qtip_left("#btn_todo_file", gap.lang.sharefile);	
		gap.draw_qtip_left("#btn_todo_channel", gap.lang.boxcon);	
		gap.draw_qtip_left("#btn_todo_invite", gap.lang.shareuser);	
		gap.draw_qtip_left("#btn_todo_star", gap.lang.favorite);
		gap.draw_qtip_left("#btn_todo_archive", gap.lang.goarchive);
		gap.draw_qtip_left("#btn_todo_mention", gap.lang.mention);
		
		
		
		gap.draw_qtip_right("#collapse_info", gap.lang.collapse_info);	
		
	},
	
	
	"draw_status_todo" : function(opt, status, title){
		
				
		var html = "";
		
		html += "<div class='todo-bookmark' style='height:100%;'>";
		html += "	<h2>" + title + "</h2>";
		html += "	<button class='ico btn-right-close' id='status_layer_close'>닫기</button>";

		html += "	<div class='card-list'  id='wrap_todo_status_list' style='height:calc(100% - 30px); margin-top:15px'>";
		html += "			<ul class='card' id='todo_status_list' style='padding-right:13px; list-style:none; margin-bottom:3px'>";
		html += "			</ul>";
		html += "	</div>";
		html += "</div>";
		
		$("#center_content").css("width","calc(100% - 300px)");
	//	$("#user_profile").css("width", "290px");
		$(".right-area").hide();
		$("#user_profile").css("width", "290px");
		$("#user_profile").show();
		$("#user_profile").off();
		$("#user_profile").removeAttr("class");
		$("#user_profile").addClass("right-area channel-info");
		$("#user_profile").html(html);
		
				
		gTodoC.__todo_status_event();
		gTodoC.draw_todo_status(opt, status);
		
		
		
		
	},
	
	
	
	"draw_my_all_mention" : function(){
		var data = JSON.stringify({});
		var url = gap.channelserver + "/todo_my_all_mention.km";
		
		gTodo.open_todo_mention = true;
		
		//우측 프레임을 열어야 하기 때문에 넓이를 조정한다.
		$("#center_content").css("width", "calc(100% - 290px)");
		$("#user_profile").css("width", "290px");
		
		gTodo.todo_my_mention("all");
	},
	
	"todo_my_mention" : function(opt){
		var html = "";
		
		html += "<div class='todo-bookmark' style='height:100%;'>";
		html += "	<h2>" + gap.lang.mention + " (<span id='mention_unread_count'></span>)</h2>";
		html += "	<button class='ico btn-right-close' id='mention_layer_close'>닫기</button>";
		html += "	<div class='todo-option'>";
		html += "		<div class='todo-align'>";
		html += "			<div class='selectbox'>";
		html += "				<select id='todo_project_select'>";
		html += "				</select>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		html += "	<div class='card-list' id='wrap_todo_mention_list' style='height:calc(100% - 70px)'>";
		html += "		<ul class='card' id='todo_mention_list' style='padding-right:13px;'>";
		html += "		</ul>";
		html += "	</div>";
		html += "</div>";
		
		$("#center_content").css("width","calc(100% - 300px)");
	//	$("#user_profile").css("width", "290px");
		$(".right-area").hide();
		$("#user_profile").css("width", "290px");
		$("#user_profile").show();
		$("#user_profile").off();
		$("#user_profile").removeAttr("class");
		$("#user_profile").addClass("right-area channel-info");
		$("#user_profile").html(html);
		
		var _h = "";
		_h += "<option value=''>" + gap.lang.All + "</option>";
		for (var i = 0; i < gap.cur_channel_list_info.length; i++){
			var item = gap.cur_channel_list_info[i];
			if (item.type != "folder"){
				_h += "<option value='" + item._id.$oid + "'>" + item.ch_name + "</option>";
			}
		}
		$("#todo_project_select").html(_h).val('').material_select();		
		
		gTodoC.__todo_mention_event();
		gTodoC.draw_todo_mention(1, opt);
	},
	
	"all_status_count_check" : function(){
	
		if (gTodo.cur_type == "card"){
			if (gTodo.cur_todo == "status"){
				
				var cnt = $(".temp-contents .card").children().length;
				$("#temp_count").html(" (" + cnt + ")");
				
				$("#wait_count").html(" (" + $(".card-wait .g-card").length + ")");
				$("#continue_count").html(" (" +$(".card-continue .g-card").length+ ")");
				$("#complete_count").html(" (" +$(".card-complete .g-card").length+ ")");
			}else if (gTodo.cur_todo == "user"){
				var list = $("#todo_main_content .card");
				for (var i = 0 ; i < list.length; i++){
					var item = list[i];
					var id = item.id;
					var cnt = item.children.length;
					$("#" + id.replace("card_","count_")).html(" (" + cnt + ")");
				}
			}
			
		}else{
			if (gTodo.cur_todo == "status"){				
				var list = $("#todo_main_content .card");
				for (var i = 0 ; i < list.length; i++){
					var item = list[i];
					var id = item.id;
					if (gTodo.cur_type == "card"){
						var cnt = item.children.length;
						$("#" + id.replace("card_","count_")).html(" (" + cnt + ")");
					}else{
						var cnt = $(item).find(".xlist").length;
						$("#" + id.replace("card_","count_")).html(" (" + cnt + ")");	
					}					
				}				
			}else if (gTodo.cur_todo == "user"){
				var list = $("#todo_main_content .card");
				for (var i = 0 ; i < list.length; i++){
					var item = list[i];
					var id = item.id;
					if (gTodo.cur_type == "card"){
						var cnt = item.children.length;
						$("#" + id.replace("card_","count_")).html(" (" + cnt + ")");
					}else{
						var cnt = $(item).find(".xlist").length;
						$("#" + id + "_count").html(" (" + cnt + ")");	
					}					
				}	
			}
			
		}

	},
	
	
	"all_status_count_check_user" : function(){
		
		if (gTodo.cur_type == "card"){
			var list = $("#todo_main_content .card");
			for (var i = 0 ; i < list.length; i++){
				var item = list[i];
				var id = item.id;
				var cnt = item.children.length;
				$("#" + id.replace("card_","count_")).html(" (" + cnt + ")");
				
				
			}
		}else{			
			var list = $("#todo_main_content .card");
			for (var i = 0 ; i < list.length; i++){
				var item = list[i];
				var id = item.id;
				
				var cnt = $(item).find(".xlist").length;
				$("#" + id + "_count").html(" (" + cnt + ")");	
				
				if (cnt == 0){
				//	gTodo.todo_call_users();
				}
									
			}	
		
		}
		
		
	},
	
	"all_status_count_check_list" : function(){
		$("#list_count_0").html(" (" + $("#list_card_0 .xlist").length + ")");
		$("#list_count_1").html(" (" + $("#list_card_1 .xlist").length + ")");
		$("#list_count_2").html(" (" +$("#list_card_2 .xlist").length+ ")");
		$("#list_count_3").html(" (" +$("#list_card_3 .xlist").length+ ")");
	},
	
	
	"check_in_array" : function(val){
		var arr = gTodo.cklist;
		var res = false;
		if (arr.length > 0){
			for (var i = 0 ; i < arr.length; i++){
				if (arr[i] == val){
					res = true;
					return res;
				}
			}
		}		
		return res;
	},
	
	"__after_draw_event" : function(){
		
		//각 상태별 건수를 표시해 준다.
		
		gTodo.all_status_count_check();
		
		
		$(".todo-option button").off();
		$(".todo-option button").on("click", function(e){
			
			var bol = $(this).hasClass("on");
			var cls = $(this).parent().attr("class");
			
			
			$("#y_tag").fadeOut();			
			$("#y_priority").fadeOut();
			$("#y_color").fadeOut();
			$("#y_filter").fadeOut();
			$("#x_tag").removeClass("on");
			$("#x_priority").removeClass("on");
			$("#x_color").removeClass("on");
			$("#x_filter").removeClass("on");
			
			
			if (cls == "option-tag"){				
				var list = gTodo.cur_project_item_list;
				var arr = [];
				for (var i = 0 ; i < list.length; i++){
					var info = list[i];
					if (typeof(info.tag) != "undefined"){
						var ln = info.tag;
						for (var k = 0; k < ln.length; k++){
							arr.push(ln[k]);
						}
					}					
				}
				var ux = [];
				$.each(arr, function(i,el){
					if ($.inArray(el, ux) === -1){
						ux.push(el);						
					}
				});
				
				
				if (ux.length == 0){
					gap.gAlert(gap.lang.nocontent);
				}else{
					var html2 = "";
					html2 += "<div class='qtip-default' style='border:none'>";
					html2 += "	<ul class='layer-option-list' id='option_change_tag'>";
					
					for (var u = 0 ; u < ux.length; u++){
						var ct = false;					
						if (gTodo.check_in_array(ux[u])){
							ct = true;
						}									
						html2 += "		<li class='on'> <!-- 체크박스 체크 on 클래스 추가 -->";
						html2 += "			<div class='checkbox'>";
						html2 += "				<label>";
						if (ct){
							html2 += "				<input type='checkbox' value='"+ux[u]+"' checked>";
						}else{
							html2 += "				<input type='checkbox' value='"+ux[u]+"'>";
						}
						
						html2 += "				<span class='checkbox-material'><span class='check'></span></span> <em>"+ux[u]+"</em>";
						html2 += "				</label>";
						html2 += "			</div>";
						html2 += "		</li>";
					}
					html2 += "	</ul>";
					html2 += "</div>";
//									html2 += "</div>";
					
					gTodo.show_qtip(e, html2, 0);
				}
				
				
			}else if (cls == "option-priority"){
				
				var html2 = "";
				html2 += "<div class='qtip-default'  style='border:none'>";
				html2 += "	<ul class='layer-option-list' id='option_change_priority'>";
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "			<label>";
				
				var ct = false;					
				if (gTodo.check_in_array("1")){
					ct = true;
				}	
				if (ct){
					html2 += "				<input type='checkbox' value='1' checked>";
				}else{
					html2 += "				<input type='checkbox' value='1'>";
				}
				
				html2 += "					<span class='checkbox-material'><span class='check'></span></span> <span class='ico p1'></span> <em>"+gap.lang.priority1+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "				<label>";
				
				var ct = false;					
				if (gTodo.check_in_array("2")){
					ct = true;
				}	
				if (ct){
					html2 += "					<input type='checkbox' value='2' checked>";
				}else{
					html2 += "					<input type='checkbox' value='2'>";
				}
				
				html2 += "						<span class='checkbox-material' ><span class='check'></span></span> <span class='ico p2'></span> <em>"+gap.lang.priority2+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "				<label>";
				
				var ct = false;					
				if (gTodo.check_in_array("3")){
					ct = true;
				}	
				if (ct){
					html2 += "					<input type='checkbox' value='3' checked>";
				}else{
					html2 += "					<input type='checkbox' value='3'>";
				}
				
				html2 += "						<span class='checkbox-material'><span class='check'></span></span> <span class='ico p3'></span> <em>"+gap.lang.priority3+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "				<label>";
				
				var ct = false;					
				if (gTodo.check_in_array("4")){
					ct = true;
				}	
				if (ct){
					html2 += "					<input type='checkbox' value='4' checked>";
				}else{
					html2 += "					<input type='checkbox' value='4'>";
				}
				
				html2 += "						<span class='checkbox-material'><span class='check'></span></span> <span class='ico p4'></span> <em>"+gap.lang.priority4+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
//				html2 += "		<li>";
//				html2 += "			<div class='checkbox'>";
//				html2 += "				<label>";
//				
//				var ct = false;					
//				if (gTodo.check_in_array("5")){
//					ct = true;
//				}	
//				if (ct){
//					html2 += "					<input type='checkbox' value='5' checked>";
//				}else{
//					html2 += "					<input type='checkbox' value='5'>";
//				}
//				
//				html2 += "						<span class='checkbox-material'><span class='check'></span></span> <span class='ico p5'></span> <em>"+gap.lang.priority5+"</em>";
//				html2 += "				</label>";
//				html2 += "			</div>";
//				html2 += "		</li>";
				html2 += "	</ul>";
				html2 += "</div>";
				
				gTodo.show_qtip(e, html2, 0);
//				if (bol){
//					$(this).removeClass("on");					
//					$("#y_priority").fadeOut();
//				}else{
//					$(this).addClass("on");
//					$("#y_priority").fadeIn();
//				}
			}else if (cls == "option-color"){
				
				var tk = gTodo.cklist[0];
				
				var html2 = "";
				html2 += "<div class='qtip-default' style='border:none'>";
				html2 += "	<ul class='layer-color' id='option_change_color'>";
				for (var i = 1 ; i < 11; i++){
					if (tk == "c" + i){
						html2 += "		<li class='c"+i+" on'></li>";
					}else{
						html2 += "		<li class='c"+i+"'></li>";
					}
					
				}
				
				html2 += "		</ul>";
				html2 += "</div>";
				
				
				gTodo.show_qtip(e, html2, 0);
//				if (bol){
//					$(this).removeClass("on");					
//					$("#y_color").fadeOut();
//				}else{
//					$(this).addClass("on");
//					$("#y_color").fadeIn();
//				}
			}else if (cls == "option-filter"){
								
				var html2 = "";
				html2 += "<div class='qtip-default' style='border:none'>";
				html2 += "	<ul class='layer-option-list' id='option_change_asignee'>";
				
				//내가 담당자인 업무
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "				<label>";
				var ct = false;					
				if (gTodo.check_in_array("2")){
					ct = true;
				}	
				if (ct){
					html2 += "					<input type='checkbox' value='2' checked>";
				}else{
					html2 += "					<input type='checkbox' value='2'>";
				}
				
				html2 += "						<span class='checkbox-material'><span class='check'></span></span> <em> "+gap.lang.t2+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				
				//내가 업무 세부항목 담당자로 지정된 경우
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "				<label>";
				
				var ct = false;					
				if (gTodo.check_in_array("3")){
					ct = true;
				}	
				if (ct){
					html2 += "					<input type='checkbox' value='3' checked>";
				}else{
					html2 += "					<input type='checkbox' value='3'>";
				}
				
				html2 += "						<span class='checkbox-material'><span class='check'></span></span> <em> "+gap.lang.t3+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				
				
				//내가 요청한 업무
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "				<label>";
				
				var ct = false;					
				if (gTodo.check_in_array("1")){
					ct = true;
				}	
				if (ct){
					html2 += "					<input type='checkbox' value='1' checked>";
				}else{
					html2 += "					<input type='checkbox' value='1'>";
				}
				
				html2 += "						<span class='checkbox-material'><span class='check'></span></span> <em> "+gap.lang.t1+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				
				

				
				

				
				
				//내가 참조로 지정된 업무 필터링 하기
				html2 += "		<li>";
				html2 += "			<div class='checkbox'>";
				html2 += "				<label>";
				
				var ct = false;					
				if (gTodo.check_in_array("4")){
					ct = true;
				}	
				if (ct){
					html2 += "					<input type='checkbox' value='4' checked>";
				}else{
					html2 += "					<input type='checkbox' value='4'>";
				}
				
				html2 += "						<span class='checkbox-material'><span class='check'></span></span> <em> "+gap.lang.t4+"</em>";
				html2 += "				</label>";
				html2 += "			</div>";
				html2 += "		</li>";
				
				
				
				
				html2 += "	</ul>";
				html2 += "</div>";
				
				gTodo.show_qtip(e, html2, 0);
//				if (bol){
//					$(this).removeClass("on");					
//					$("#y_filter").fadeOut();
//				}else{
//					$(this).addClass("on");
//					$("#y_filter").fadeIn();
//				}
			}
		});
		
		if (gTodo.cur_todo != "calendar"){
			gTodo.__card_drag_after_event();
		}
		
		
		$(".view-type button").off();
		$(".view-type button").on("click", function(e){
			
			var cls = $(e.currentTarget).attr("class");
			if (cls.indexOf("card") > -1){
				//리스트형으로 변경해야 한다.
				$(".view-type .btn-view-list").show();
				$(".view-type .btn-view-card").hide();
				
				gTodo.cur_type = "card";
				
				if (gTodo.cur_todo == "status"){
					gTodo.todo_center_status_change();
				}else if (gTodo.cur_todo == "user"){
					gTodo.todo_call_users();
				}		
				
			}else{
				//카드형으로 변경해야 한다.
				$(".view-type .btn-view-list").hide();
				$(".view-type .btn-view-card").show();
				
				gTodo.cur_type = "list";
				
				
				if (gTodo.cur_todo == "status"){
					gTodo.todo_center_status_list();
				}else if (gTodo.cur_todo == "user"){
					gTodo.todo_center_status_list();
				}
			}
		});
	},
	
	
	"__card_drag_after_event" : function(){
		
		$(".todo-card .g-card").off();
		$(".todo-card .g-card").on("click", function(e){	
			//드래그&드롭으로 위치 이동시 클릭 이벤트가 실행되어 예외처리 한다.
			
			if (gTodo.is_dragdrop){				
			}else{
				if (e.target.className == "ico btn-more"){				
				}else{
					
					var id = $(e.currentTarget).attr("id").replace("card_","");
					//alert("백성호가 알려주는 코드로 함수를 호출해야 한다.");
					
					gTodo.compose_layer(id);
				}	
			}
			gTodo.is_dragdrop = false;		
		});
		
		$(".todo-card .g-card .btn-more").off();
		$(".todo-card .g-card .btn-more").on("click", function(e){			
			if (e.target.className == "ico btn-more"){
				$.contextMenu({
					selector : ".todo-card .card .btn-more",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
					
						var id = "";
						if (gTodo.cur_type == "card"){
							id = $(this).parent().attr("id");
						}else{
							id = $(this).parent().parent().attr("id");
						}
						gTodo.context_menu_call(key, options, id);
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
						},
						show : function (options){
						}
					},			
					build : function($trigger, options){
						
						var owner = $trigger.parent().attr("data");
						var status = $trigger.parent().parent().parent().attr("id").replace("card_", "");
						return {
							items: gTodo.todo_info_menu_content('card_menu', owner, status)
						}
					}
				});
			}					
		});
		
		
		//임시저장에 등록된 카트도 이벤트를 부여해야 한다.
//		$("#card_0 li").off();
//		$("#card_0 li").on("click", function(e){
//			if (e.target.className == "ico btn-more"){				
//			}else{
//				alert("백성호가 알려주는 코드로 함수를 호출해야 한다.");
//			}	
//		});
		
		//임시저장에 등록된 카트도 이벤트를 부여해야 한다.
		$("#card_0 .g-card").off();
		$("#card_0 .g-card").on("click", function(e){
			
			if (e.target.className == "ico btn-more"){				
			}else{
				var id = $(e.currentTarget).attr("id").replace("card_","");
				//alert("백성호가 알려주는 코드로 함수를 호출해야 한다.");
				gTodo.compose_layer(id);
				//alert("백성호가 알려주는 코드로 함수를 호출해야 한다.");
			}	
		});
		
		$("#card_0 .btn-more").off();
		$("#card_0 .btn-more").on("click", function(e){		
			
			if (e.target.className == "ico btn-more"){
				$.contextMenu({
					selector : "#card_0 .btn-more",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
						gTodo.context_menu_call(key, options, $(this).parent().attr("id"));
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
						},
						show : function (options){
						}
					},			
					build : function($trigger, options){
						var owner = $trigger.parent().attr("data");
						var status = 0;
						return {
							items: gTodo.todo_info_menu_content('card_menu', owner, status)
						}
					}
				});
			}				
		});
	},
	
	
	"__draganddrop" : function(){
	
		var _self = this;
		
		
		$( ".card" ).sortable({
			// 드래그 앤 드롭 단위 css 선택자
			appendTo: "body",
			connectWith: ".card",
			revert: true,
			opacity: 0.8,
			// 움직이는 css 선택자
			handle: ".g-card",
			// 움직이지 못하는 css 선택자
			cancel: ".no-move",
			// 이동하려는 location에 추가 되는 클래스
			placeholder: "card-placeholder",
			delay : 150,
			
			helper : "clone",
			
		//	helper : function (e) { 
				//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.		
		//		return $(this).clone().appendTo("body").css("zIndex",2000).show();
		 //    },	
			
			start : function(event, ui){	
				
				gTodo.iscancel = false;
				gTodo.iscancel2 = false;
				
				var owner = ui.helper.children().attr("data");
				var asign = ui.helper.children().attr("data2");
				var user = gap.userinfo.rinfo.em;
				if ( (owner == user) ||(asign == user) || (gTodo.cur_project_info.owner.em == user)){
					gTodo.is_dragdrop = true;
				}else{
					//$(this).sortable('cancel');
					//return false;
					gTodo.iscancel = true;
				}
				//gTodo.is_dragdrop = true;
				
			},
			
			sort : function(event, ui){
			//	return false;
			//	$( ".card" ).sortable('cancel');
			//	$(this).sortable('cancel');
			},
			
			stop : function(event, ui){
		
				if (gTodo.iscancel){
					$(this).sortable('cancel');    
					gap.gAlert(gap.lang.cppi);
					return false;
				}
				
				if (gTodo.iscancel2){
					//채널로 드래그 & 드롭할 경우 원래 자리로 돌아가야 하는데 중간에 걸쳐서 이동하면 이동한 자리로 잘못 들어간다.
					$(this).sortable('cancel');    
					return false;
				}
				
				var orginal_column = $(event.target).attr("id");   //card_1, card_2, card_3
				gTodo.orginal_column = orginal_column;
				var docid = $(ui.item).children().attr("id").replace("card_","");
				var target_column = $(ui.item).parent().attr("id");  //card_1, card_2, card_3
				
				
				if (gTodo.cur_todo == "user"){
					
					var orignal_empno2 = gTodo.orginal_column.replace("card_", "").replace("-spl-", "@").replace(/-sp-/gi,".");
					gTodo.orignal_empno = gTodo.search_user_cur_project_info_email(orignal_empno2).ky;
					
					//사용자별 보기에서 드래그 & 드롭할 경우
					//asignee값을 변경해 주고 다시 그려 줘야 한다.
					var xdocid = ui.item.children().attr("id").replace("card_","");
					var oemail = gTodo.dh_em(target_column).replace("card_","");
									
					var list = $("#" + target_column).children().find(".g-card");
					var dx = "";
					for (var i = 0 ; i < list.length; i++){
						var ck = $(list[i]).attr("id").replace("card_","");
						if (xdocid != ck){
							xdocid = ck;
							break;
						}
					}
					var owner = gTodo.search_user_list_item(xdocid);
					var tlist = gTodo.get_column_list_ids(target_column);
					
					var data = "";
					if (owner == ""){
						data = JSON.stringify({
							todo_id : docid,
							target_list : tlist,
							ty : "add"
						});
					}else{
						data = JSON.stringify({
							asignee : owner,
							todo_id : docid,
							target_list : tlist,
							ty : "add"
						});
					}
					var url = gap.channelserver + "/update_asignee_todo.km";
					
					
					$.ajax({
						type : "POST",
						dataType : "json",
						contentType : "application/json; charset=utf-8",
						data : data,
						url : url,
						success : function(res){						
							//상태별 카운트를 재계산한다.				
						
							//드래그 & 드롭으로 이동할때 id값으로 정보를 모두 가져오기 위해서 변수에 담아 놓는다.
							if (res.result == "OK"){							
//								var list = res.data.data;
//								gTodo.cur_project_item_list = list;
								var change_doc = res.data.doc;
								gTodo.select_id = change_doc._id.$oid; //change_local_data에서 현재 문서의 기준을 select_id로 잡기 때문에 설정해 준다.								
								gTodo.change_local_data(change_doc);
													
								gTodo.todo_call_users();		
															
								
								
								//담당자가 변경되면 알려주는 프로세스. //////////////
								if (change_doc.asignee.ky != gap.userinfo.rinfo.ky){
									var obj = new Object();
									obj.id = change_doc._id.$oid;
									obj.type = "as";  //change status
									obj.p_code = change_doc.project_code;
									obj.p_name = gap.textToHtml(change_doc.project_name);
									obj.title = change_doc.title;
								//	obj.sender = change_doc.asignee.ky; 
									var list = [];
									list.push(change_doc.asignee.ky);
									obj.sender = list;
									_wsocket.send_todo_msg(obj);
									
									
									var smsg = new Object();
									smsg.msg = "[" + gap.textToHtml(change_doc.project_name) + "]" + gap.lang.csm;
									smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";		
									smsg.type = "as";
									smsg.key1 = change_doc.project_code;
									smsg.key2 = change_doc._id.$oid;
									smsg.key3 = "";
									smsg.fr = gap.userinfo.rinfo.nm;									
									//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
									//smsg.sender = change_doc.asignee.ky.join("-spl-");		
									smsg.sender = change_doc.asignee.ky;		
									//gap.push_noti_mobile(smsg);	
									
									//알림센터에 푸쉬 보내기
									var rid = change_doc.project_code;
									var receivers = [];
									receivers.push(change_doc.asignee.ky)
									var msg2 = smsg.msg = "[" + gap.textToHtml(change_doc.project_name) + "]" + gap.lang.csm;
									var sendername = "["+gap.lang.todo+" : "+ gap.textToHtml(change_doc.project_name) +"]"
									var data = smsg;
									gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
								}

																		
								//////////////////////////////////////////////////////
								
							
								//일정과 연동을 위해서 처리한다.
								if (gTodo.orignal_empno != change_doc.asignee.emp){
									//기존 사용자는 일정에서 제거해야 한다.
									var obb = new Object();						
									obb.del_id = change_doc.project_code + "^" + change_doc._id.$oid;
									obb.del_emp = gTodo.orignal_empno;
									gap.schedule_update(obb, "asignee", "D");
									//신규 담당자의 업무를 등록한다.
									gap.schedule_update(change_doc, "asignee", "U");
								}
								
								
							}else{
								gap.error_alert();
							}
						
							
						},
						error : function(e){
							gap.error_alert();
						}
					});
					
				}else{
					//상태별 인 상황에서 드래그 & 드롭할 경우
					
					var target_list = [];
										
					var tlist = gTodo.get_column_list_ids(target_column);
					
					if (orginal_column != target_column){
						var sp = "";
						if (target_column == "card_0"){		
							sp = "";						
						}else if (target_column == "card_1"){
							sp = "<span class='ico ico-wait-c'></span>"+gap.lang.wait;	
						}else if (target_column == "card_2"){
							sp = "<span class='ico ico-continue-c'></span>"+gap.lang.doing;	
						}else if (target_column == "card_3"){
							sp = "<span class='ico ico-complete-c'></span>"+gap.lang.done;	
						}
						$(ui.item).find(".status").html(sp);
					}
					
					
					//현재 이동한 docid값을 target_column 상태로 변경하고 순서를 조정한다.
					
					var project_code = gTodo.cur_project_info._id.$oid;
					var data = JSON.stringify({
						docid : docid,
						target_column : target_column.replace("card_",""),
						target_list : tlist,
						project_code : project_code
					});
					
					var url = gap.channelserver + "/update_todo.km";
					
					$.ajax({
						type : "POST",
						dataType : "json",
						contentType : "application/json; charset=utf-8",
						data : data,
						url : url,
						success : function(res){
						
							//상태별 카운트를 재계산한다.
							
							//드래그 & 드롭으로 이동할때 id값으로 정보를 모두 가져오기 위해서 변수에 담아 놓는다.
							if (res.result == "OK"){
							
								
								var status = res.data.status;
								gTodoC.update_todo_progress_icon(gTodo.cur_todo_code, status);
															
								var list = res.data.data;
								gTodo.cur_project_item_list = list;
													
								gTodo.all_status_count_check();							
								gTodo.__card_drag_after_event();	
								
								gTodo.delay_check(docid);
								
								//상태 변경시 프로젝트 Owner와 TODO생성자에게 변경 사항을 알려준다.
								var change_doc = "";
								for (var i = 0 ; i < list.length; i++){
									if (list[i]._id.$oid == docid){
										change_doc = list[i];
										break;
									}
								}
								
								//상태가 변경될 경우 알려주는 함수를 호출한다. //////////////
								//알려주는 대상자는 1. 프로젝트 Owner, 2. TODO 작성자
														
								var obj = new Object();
								obj.id = change_doc._id.$oid;
								obj.type = "cs";  //change status
								obj.p_code = change_doc.project_code;
								obj.p_name = gap.textToHtml(change_doc.project_name);
								obj.title = change_doc.title;
								obj.status = change_doc.status;

								var tsender = [];
								if (gTodo.cur_project_info.owner.ky != gap.userinfo.rinfo.ky){							
								//	obj.sender = gTodo.cur_project_info.owner.ky;  //해당 프로젝트의 owner에게만 전송한다.		
									var list = [];
									list.push(gTodo.cur_project_info.owner.ky);
									obj.sender = list;
									_wsocket.send_todo_msg(obj);	
									tsender.push(gTodo.cur_project_info.owner.ky);
								}
								//현재 수정하는 사용자가  TODO생성자가 아닐 경우 TODO생성자에게 알림을 전송한다.				
								if (change_doc.owner.ky != gap.userinfo.rinfo.ky){
								//	obj.sender = change_doc.owner.ky;  //TODO생성자에게 전송한다.
									var list = [];
									list.push(change_doc.owner.ky);
									obj.sender = list;
									_wsocket.send_todo_msg(obj);		
									tsender.push(change_doc.owner.ky);
								}
																	
								
								 //모바일  Push를 날린다. ///////////////////////////////////		
								var mx = "";
								if (obj.status == "0"){
									mx = gap.lang.temps;
								}else if (obj.status == "1"){
									mx = gap.lang.wait;
								}else if (obj.status == "2"){
									mx = gap.lang.doing;
								}else if (obj.status == "3"){
									mx = gap.lang.done;
								}
								var smsg = new Object();
								smsg.msg = "[" + gap.textToHtml(change_doc.project_name) + "]" + gap.lang.cs.replace("$s",mx);
								smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";
								smsg.type = "cs";
								smsg.key1 = change_doc.project_code;
								smsg.key2 = change_doc._id.$oid;
								smsg.key3 = "";
								smsg.fr = gap.userinfo.rinfo.nm;
								//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
								if (tsender != ""){
									smsg.sender = tsender.join("-spl-");										
								//	gap.push_noti_mobile(smsg);
									
									//알림센터에 푸쉬 보내기
									var rid = change_doc.project_code;
									var receivers = tsender;
									var msg2 = "[" + gap.textToHtml(change_doc.project_name) + "]" + gap.lang.cs.replace("$s",mx);	
									var sendername = "["+gap.lang.todo+" : "+ gap.textToHtml(change_doc.project_name) +"]"
									var data = smsg;
									gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
								}																				
								//////////////////////////////////////////////////////
								//////////////////////////////////////////////////////
							
								if (gTodo.orginal_column == "card_3"){
									if (change_doc.status != "3"){
										//완료 처리 취소한다.
										gap.todo_connect_schedule_update(change_doc, "P", "");
									}
								}else{
									if (change_doc.status == "3"){
										//완료 처리 한다.
										gap.todo_connect_schedule_update(change_doc, "T", "");
									}
								}
								
							}else{
								gap.error_alert();
							}
						
							
						},
						error : function(e){
							gap.error_alert();
						}
					})
				}
				
				
			}
		
		});
		// 해당 클래스 하위의 텍스트 드래그를 막는다.
		//$( ".card-list .card").disableSelection();
		//});
		
		
		
		
//		$(".card .g-card").off();		
//		$(".card .g-card").draggable({
//			revert: "invalid",
//			stack: "draggable",
//		
//			opacity: 1,
//			scroll: false,
//		//	helper: 'clone',
//			helper : function(e){
//				return $(this).clone().appendTo("#nav_left_menu").css("zIndex",2000).show();
//			},
//			cursor: "move",
//			start : function(event, ui){
//
//				$(this).draggable("option", "revert", true);
//				
//				var docid = $(ui.helper).attr("id");	
//			
//				
////				$(ui.helper).attr("id", docid);	
//				$(ui.helper).css("width", "270px");	
////				
//				var html = "<ul class='card'>";
//				html += $(ui.helper).get(0).outerHTML;
//				html += "</div>";
//		
//				$(ui.helper).html(html);
//				
//			},
//			stop: function(event, ui){
//				var docid = event.target.id;
//				$("#"+docid).remove();
//			
//				$(".card-list").removeClass("chat-area drop-area");
//			}
//		});
////		
//		$(".xman").off();
//		$(".xman").droppable({
//			drop : function(event, ui){
//			
//			
//				try{
//					var droppable = $(this);
//					var draggable = ui.draggable;
//					var dragid = ui.draggable.attr("id");
//					
//			
//					var status = "0";
//					var cls = $(droppable).attr("class");
//					if (cls.indexOf("card-wait") > -1){
//						//대기중으로 이동한 경우
//						status = "1";
//					}else if (cls.indexOf("card-continue") > -1){
//						//진행중으로 이동한 경우
//						status = "2";
//					}else if (cls.indexOf("card-complete") > -1){
//						//완료중으로 이동한 경우
//						status = "3";
//					}
//					
//					
//				}catch(e){}
//				$(ui.helper).css("width", "290px");
//								
////				var x = ui.helper.clone();
////				var top = ui.helper.position().top;
////				var left = ui.helper.position().left;
////				left = left - 320;
////			//	top = "20px";
////			//	left = "50px";
////				x.css({ 'top': top +"px", 'left': left +"px" }).appendTo($(this)).fadeOut(1000);	
//							
////				var obj = $(draggable).children(0);
////				
////				
////				$(draggable).remove();
//			},
//			hoverClass: "chat-area drop-area"
//		});
	},
	
	"align_reset" : function(){
		$('.todo-list .card').each(function(){
		    var $card      = $(this);
		    var $first     = $card.children().eq(0);
		    var $cardTitle = $card.children('.card-title').first();
		
		    // 첫 번째 자식이 .xlist 라면 순서 변경
		    if ($first.hasClass('xlist') && $cardTitle.length) {
		      $cardTitle.insertBefore($first);
		    }
		 });
			
	},

	"__draganddrop_list" : function(){

		var _self = this;
		
		
		$( ".card" ).sortable({
			// 드래그 앤 드롭 단위 css 선택자
			appendTo: "body",
			connectWith: ".card",
			revert: true,
			opacity: 0.8,
			// 움직이는 css 선택자
			handle: ".g-list",
			// 움직이지 못하는 css 선택자
			cancel: ".input-field",
			delay : 150, 
			// 이동하려는 location에 추가 되는 클래스
			placeholder: "card-placeholder-list",
			tolerance: "pointer",
			
			helper : "clone",

			receive: function(event, ui){
			//	debugger;	
			},
			
			start : function(event, ui){	
				
				// 원본 요소의 계산된 스타일 저장
		        var $original = ui.item;
		        var $helper = ui.helper.find(".g-list");           
				
				 $helper.css({
					"width" : "900",
					"height" : " 44px"
				});
      
      			ui.helper.find(".btn-more").remove();
      			ui.helper.find(".user-thumb").remove();
					
				 ui.helper.find(".g-list").css({
			            "display": "flex",
			            "margin-top": 0,
			            "padding": 0,
			            "border-radius" : 0,
			            "align-items" : "center"
			        });	    
				
			//	$(".todo-option").append(ui.helper.html());
				
				gTodo.iscancel = false;
				var owner = ui.helper.children().attr("data");
				var asign = ui.helper.children().attr("data2");
				var user = gap.userinfo.rinfo.em;
				if ( (owner == user) ||(asign == user) || (gTodo.cur_project_info.owner.em == user)){
					gTodo.is_dragdrop = true;
				}else{
					//$(this).sortable('cancel');
					//return false;
					gTodo.iscancel = true;
				}
			//	gTodo.is_dragdrop = true;
			},
			
			
			
			stop : function(event, ui){
				
				if (gTodo.iscancel){
					$(this).sortable('cancel');    
					gap.gAlert(gap.lang.cppi);
					return false;
				}
			
				var orginal_column = $(event.target).attr("id");   //list_card_1, list_card_2, list_card_3
				var target_column = $(ui.item).parent().attr("id");  //list_card_1, list_card_2, list_card_3
				var docid = $(ui.item).children().attr("id").replace("list_card_","");
				
				var orignal_empno2 = orginal_column.replace("list_", "").replace("-spl-", "@").replace(/-sp-/gi,".");
			
				var pux = gTodo.search_user_cur_project_info_email(orignal_empno2);
				if (typeof(pux) != "undefined"){
					gTodo.orignal_empno = gTodo.search_user_cur_project_info_email(orignal_empno2).ky;
				}

				
				if (gTodo.cur_todo == "user"){
					
					//사용자별 보기에서 드래그 & 드롭할 경우
					//asignee값을 변경해 주고 다시 그려 줘야 한다.
					var xdocid = ui.item.children().attr("id").replace("list_card_","");
					var oemail = gTodo.dh_em(target_column).replace("list_","");
									
					var list = $("#" + target_column).children().find(".g-list");
					var dx = "";
					for (var i = 0 ; i < list.length; i++){
						var ck = $(list[i]).attr("id").replace("list_card_","");
						if (xdocid != ck){
							xdocid = ck;
							break;
						}
					}
					var owner = gTodo.search_user_list_item(xdocid);
					var tlist = gTodo.get_column_list_ids_list(target_column);
					
					var url = gap.channelserver + "/update_asignee_todo_list.km";
					var data = "";
					if (owner == ""){
						data = JSON.stringify({
							todo_id : docid,
							target_list : tlist,
							ty : "add"
						});
					}else{
						data = JSON.stringify({
							asignee : owner,
							todo_id : docid,
							target_list : tlist,
							ty : "add"
						});
					}
					
					
					$.ajax({
						type : "POST",
						dataType : "json",
						contentType : "application/json; charset=utf-8",
						data : data,
						url : url,
						success : function(res){						
							//상태별 카운트를 재계산한다.							
							//드래그 & 드롭으로 이동할때 id값으로 정보를 모두 가져오기 위해서 변수에 담아 놓는다.
							
							if (res.result == "OK"){							
								var list = res.data.data;
								gTodo.cur_project_item_list = list;
													
								gTodo.todo_center_status_list();	
							//	gTodo.todo_call_users();
								
								//담당자가 변경되면 알려주는 프로세스. //////////////
								var change_doc = res.data.doc;
								
							
							//	if (change_doc.asignee.emp != gap.userinfo.rinfo.ky){
								if (change_doc.asignee.ky != gTodo.orignal_empno){
									
									var obj = new Object();
									obj.id = change_doc._id.$oid;
									obj.type = "as";  //change status
									obj.p_code = change_doc.project_code;
									obj.p_name = gap.textToHtml(change_doc.project_name);
									obj.title = change_doc.title;
								//	obj.sender = change_doc.asignee.ky;  
									var list = [];
									list.push(change_doc.asignee.ky);
									obj.sender = list;
									_wsocket.send_todo_msg(obj);	
									
									//모바일 Push 알린다 /////////////////////////////////////
									var smsg = new Object();
									smsg.msg = "[" + gap.textToHtml(change_doc.project_name) + "]" + gap.lang.csm;	
									smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";
									smsg.type = "as";
									smsg.key1 = change_doc.project_code;
									smsg.key2 = change_doc._id.$oid;
									smsg.key3 = "";
									smsg.fr = gap.userinfo.rinfo.nm;
									//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
								//	smsg.sender = change_doc.asignee.ky.join("-spl-");	
									smsg.sender = change_doc.asignee.ky;										
								//	gap.push_noti_mobile(smsg);	
								//	gap.push_noti_mobile(smsg);	
									
									//알림센터에 푸쉬 보내기
									var rid = change_doc.project_code;
									var receivers = [];
									receivers.push(change_doc.asignee.ky)
									var msg2 = "[" + gap.textToHtml(change_doc.project_name) + "]" + gap.lang.csm;
									var sendername = "["+gap.lang.todo+" : "+ gap.textToHtml(change_doc.project_name) +"]"
									var data = smsg;
									gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
									
									//기존 사용자는 일정에서 제거해야 한다.
									var obb = new Object();						
									obb.del_id = change_cod.project_code + "^" + change_doc._id.$oid;
									obb.del_emp = gTodo.orignal_empno;
									gap.schedule_update(obb, "asignee", "D");
									//신규 담당자의 업무를 등록한다.
									gap.schedule_update(change_doc, "asignee", "U");
								}
								
								
								
								
							}else{
								gap.error_alert();
							}
						
							
						},
						error : function(e){
							gap.error_alert();
						}
					});
					
					
				}else if (gTodo.cur_todo == "status"){
					var target_list = [];
					
					
					
					var tlist = gTodo.get_column_list_ids_list(target_column);
					gTodo.ocol = orginal_column.replace("list_card_", "");
					gTodo.scol = target_column.replace("list_card_", "");
					
					if (orginal_column != target_column){
						var sp = "";
						if (target_column == "list_card_0"){		
							sp = "";						
						}else if (target_column == "list_card_1"){
							sp = "	<div class='status'><span class='wait'>"+gap.lang.wait+"</span></div>";
						}else if (target_column == "list_card_2"){
							sp = "	<div class='status'><span class='continue'>"+gap.lang.doing+"</span></div>";
						}else if (target_column == "list_card_3"){
							sp = "	<div class='status'><span class='complete'>"+gap.lang.done+"</span></div>";
						}
						$(ui.item).find(".status").html(sp);					
					}
					
					
					//현재 이동한 docid값을 target_column 상태로 변경하고 순서를 조정한다.
					var project_code = gTodo.cur_project_info._id.$oid;
					var data = JSON.stringify({
						docid : docid,
						target_column : target_column.replace("list_card_",""),
						target_list : tlist,
						project_code : project_code
					});
					
					var url = gap.channelserver + "/update_todo.km";
					
					$.ajax({
						type : "POST",
						dataType : "json",
						contentType : "application/json; charset=utf-8",
						data : data,
						url : url,
						success : function(res){
							
							//상태별 카운트를 재계산한다.						
							if (res.result == "OK"){
								
								var status = res.data.status;
								gTodoC.update_todo_progress_icon(gTodo.cur_todo_code, status);
								
								
								var list = res.data.data;
								gTodo.cur_project_item_list = list;
								gTodo.all_status_count_check_list();
								
								
								gTodo.delay_check(docid);
								
								
								//상태 변경시 프로젝트 Owner와 TODO생성자에게 변경 사항을 알려준다.
								var change_doc = "";
								for (var i = 0 ; i < list.length; i++){
									if (list[i]._id.$oid == docid){
										change_doc = list[i];
										break;
									}
								}
								
								//상태가 변경될 경우 알려주는 함수를 호출한다. //////////////
								//알려주는 대상자는 1. 프로젝트 Owner, 2. TODO 작성자
														
								var obj = new Object();
								obj.id = change_doc._id.$oid;
								obj.type = "cs";  //change status
								obj.p_code = change_doc.project_code;
								obj.p_name = gap.textToHtml(change_doc.project_name);
								obj.title = change_doc.title;
								obj.status = change_doc.status;

								var tsender = "";
								if (gTodo.cur_project_info.owner.ky != gap.userinfo.rinfo.ky){							
								//	obj.sender = gTodo.cur_project_info.owner.ky;  //해당 프로젝트의 owner에게만 전송한다.		
									var list = [];
									list.push(gTodo.cur_project_info.owner.ky);
									obj.sender = list;
									_wsocket.send_todo_msg(obj);
									tsender = gTodo.cur_project_info.owner.ky;
								}
								//현재 수정하는 사용자가  TODO생성자가 아닐 경우 TODO생성자에게 알림을 전송한다.				
								if (change_doc.owner.ky != gap.userinfo.rinfo.ky){
								//	obj.sender = change_doc.owner.ky;  //TODO생성자에게 전송한다.
									var list = [];
									list.push(change_doc.owner.ky);
									obj.sender = list;
									_wsocket.send_todo_msg(obj);		
									tsender = change_doc.owner.ky;
								}
																		
								//////////////////////////////////////////////////////
								
								 //모바일  Push를 날린다. ///////////////////////////////////		
								var mx = "";
								if (obj.status == "0"){
									mx = gap.lang.temps;
								}else if (obj.status == "1"){
									mx = gap.lang.wait;
								}else if (obj.status == "2"){
									mx = gap.lang.doing;
								}else if (obj.status == "3"){
									mx = gap.lang.done;
								}
								var smsg = new Object();
								smsg.msg = "[" + change_doc.project_code + "]" + gTodo.short_title(obj.title) + " - " + gap.lang.cs.replace("$s",mx);
								smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";
								smsg.type = "cs";
								smsg.key1 = change_doc.project_code;
								smsg.key2 = change_doc._id.$oid;
								smsg.key3 = "";
								smsg.fr = gap.userinfo.rinfo.nm;
								//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
								if (tsender != ""){
									smsg.sender = tsender; //.join("-spl-");										
								//	gap.push_noti_mobile(smsg);
									
									//알림센터에 푸쉬 보내기
									var rid = change_doc.project_code;
									var receivers = tsender;
									var msg2 = "[" + change_doc.project_code + "]" + gTodo.short_title(obj.title) + " - " + gap.lang.cs.replace("$s",mx);
									var sendername = "["+gap.lang.todo+" : "+ gap.textToHtml(change_doc.project_name) +"]"
									var data = smsg;
									gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
								}																				
								//////////////////////////////////////////////////////
						
								if (gTodo.ocol == "3"){
									if (gTodo.scol != "3"){
										//완료를 취소해야 한다.
										gap.todo_connect_schedule_update(change_doc, "P", "");
									}
								}
								if (gTodo.scol == "3"){
									gap.todo_connect_schedule_update(change_doc, "T", "");
								}
								
								
							}else{
								gap.error_alert();
							}
						},
						error : function(e){
							gap.error_alert();
						}
					})
				}
				
				gTodo.align_reset();
				
				
			}
		
		});
		
		//$(".card.title-top").sortable({ disabled: true });
		// 해당 클래스 하위의 텍스트 드래그를 막는다.
		//$( ".title-top").parent().disableSelection();
		//$( ".title-top").parent().sortable({ disabled: true });
		
	},
	
	
	
	"delay_check" : function(id){
		var info = gTodo.search_item_info(id);
			
		if (typeof(info.enddate) != "undefined"){
			var now = moment.utc(new Date());
			var ets = moment.utc(new Date(info.enddate));
			
			var df = ets.diff(now, "days");
			if (df < 0){			
				if (gTodo.cur_type == "card"){
					if (info.status == "3"){
						$("#card_" + id).removeClass("delay");
					}else{
						$("#card_" + id).addClass("delay");
					}					
				}else if (gTodo.cur_type == "list"){
					if (info.status == "3"){
						$("#list_card_" + id).removeClass("delay");
					}else{
						$("#list_card_" + id).addClass("delay");
					}	
				}
			}else{
				if (gTodo.cur_type == "card"){
					$("#card_" + id).removeClass("delay");
				}else if (gTodo.cur_type == "list"){
					$("#list_card_" + id).removeClass("delay");
				}
			}			
		}

	},	
	
	
	"todo_info_menu_content" : function(_key, _owner, _status){
	
		var items = {};
		var is_admin = (gap.userinfo.rinfo.em == gTodo.cur_project_info.owner.em ? true : false);
		var is_owner = (_owner == gap.userinfo.rinfo.em ? true : false);
		
		if (_key == "card_menu"){
						
			if (is_admin || is_owner){
				items["Move_Task"] = {name : gap.lang.mtask};
				items["Copy_Task"] = {name : gap.lang.ctask};	
				items["sep01"] = "-------------";
				items["Share_to_channel"] = {name : gap.lang.staskc};	
				items["sep02"] = "-------------";
				items["Star_task"] = {name : gap.lang.stask};	
				items["sep03"] = "-------------";
				items["Delete_task"] = {name : gap.lang.dtask};
				if (_status == "3"){
					items["sep04"] = "-------------";
					items["Move_archive"] = {name : gap.lang.m_a};
				}
			}else{
				items["Share_to_channel"] = {name : gap.lang.staskc};	
				items["sep02"] = "-------------";
				items["Star_task"] = {name : gap.lang.stask};	
			}
	
		}else if (_key == "checklist"){
			items["Change_Task"] = {name : gap.lang.changetask};
			items["sep01"] = "-------------";
			items["Edit_Checklist"] = {name : gap.lang.basic_modify};	
			items["Delete_Checklist"] = {name : gap.lang.basic_delete};	
		}
		
		return items;
	},
	
	"delete_admin" : function(docid){
		var email = gap.userinfo.rinfo.em;
		var list = gTodo.cur_project_item_list;
		for (var i = 0 ; i < list.length; i++){
			if (docid == list[i]._id.$oid){
				if (list[i].owner.em == email){
					return true;
				}
			}
			
		}
		var cemail = gTodo.cur_project_info.owner.em;
		if (cemail == email){
			return true;
		}		
		return false;
	},
	
	"search_user_list_item" : function(docid){
		//문서 아이디값과 email 정보를 활용해서 사용자의 전체 정보를 리턴한다.
		var list = gTodo.cur_project_item_list;
		for (var i = 0 ; i < list.length; i++){
			if (list[i]._id.$oid == docid){
				return list[i].asignee;
				break;
			}
		}
	},
	
	
	"search_item_info" : function(docid){
		//문서 아이디를 활용해서 문서 정보를 리턴한다.
		var list = gTodo.cur_project_item_list;
		for (var i = 0 ; i < list.length; i++){
			if (list[i]._id.$oid == docid){
				return list[i];
				break;
			}
		}
	},
	
	
	"context_menu_call" : function(key, options, id){
		
		
		var docid = id.replace("card_","");
		docid = docid.replace("list_","");
		
		if (key == "Delete_task"){		
			
			var dcheck = gTodo.delete_admin(docid);
			//프로젝트 관리자나 할일 등록한 사람만 삭제할 수 있다.
			if (dcheck){
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
								
								var url = gap.channelserver + "/delete_todo.km";
							/*	var data = JSON.stringify({
									key : docid,
									email : gap.userinfo.rinfo.em,
									project_code : gTodo.cur_project_info._id.$oid
								});*/
								var data = JSON.stringify({
									key : docid,
									project_code : gTodo.cur_project_info._id.$oid
								});
								$.ajax({
									type : "POST",
									dataType : "json",
									contentType : "application/json; charset=utf-8",
									data : data,
									url : url,
									beforeSend : function(xhr){
										xhr.setRequestHeader("auth", gap.get_auth());
										xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
									},
									success : function(res){
										
										if (res.result == "OK"){
											
											var status = res.data.status;
											gTodoC.update_todo_progress_icon(gTodo.cur_todo_code, status);
											
											if (gTodo.view_mode == "read"){
												
												$("#card_"+id).parent().remove();
												$("#list_card_"+id).parent().remove();
												
												$("#todo_compose_close").click();
												
											}										
											
											
											var list = res.data.data;
											gTodo.cur_project_item_list = list;
																				
																							
											if (gTodo.cur_todo == "user"){
												if (gTodo.cur_type == "card"){
													$("#"+id).parent().remove();
													gTodo.all_status_count_check_user();
												}else{
													$("#"+id).parent().remove();
													gTodo.all_status_count_check_user();
												}
												
											}else if (gTodo.cur_todo == "status"){
												if (gTodo.cur_type == "card"){
													$("#"+id).parent().remove();
													gTodo.all_status_count_check();
												}else{
													$("#"+id).parent().remove();
													gTodo.all_status_count_check();
												}
												
											}
											
											if (gTodo.cur_todo == "calendar"){
												// 캘린더에 있는 이벤트 삭제
												gTodoC.calendar.getEventById(docid).remove();
											}
											
											//일정에 등록된 담당자와 체크리스트 사용자의 정보를 삭제해 준다.
											var data2 = res.data.data2;
											gap.todo_connect_schedule_update(data2, "D", "");

											
										}
									},
									error : function(e){
										gap.error_alert();
									}
								});
								
							}
						},
						cancel : {
							keys: ['esc'],
							text : gap.lang.Cancel,
							btnClass : "btn-default",
							action : function(){
								//$("#" + xid).css("border","");
							}
						}
					}		 			
				});
			}else{
				gap.gAlert("삭제할 권한이 없습니다.");
			}
			
			
						
		}else if (key == "Move_Task"){
			//var docid = id.replace("card_","");
			gTodo.move_task(docid);
		}else if (key == "Copy_Task"){
			//var docid = id.replace("card_","");
			gTodo.copy_task(docid);
		}else if (key == "Share_to_channel"){
			//var docid = id.replace("card_","");
			
			var is_compose_auth = gap.checkAuth();
			
			if (!is_compose_auth){
				gap.gAlert(gap.lang.ba4);
				return false;
			}
			
			gTodo.share_task(docid);
		}else if (key == "Star_task"){
			//var docid = id.replace("card_","");
			gTodo.update_star_task(docid);
		}else if (key == "Move_archive"){
			gTodo.move_archive(docid);
		}
	},
	
	"move_archive" : function(id){
		var data = JSON.stringify({
			project_code : gTodo.cur_project_info._id.$oid,
			docid : id
		});
		var url = gap.channelserver + "/move_archive_todo.km";
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "aplication/json; charset=utf-8",
			data : data,
			url : url,
			success : function(res){
				if (res.result == "OK"){				

					var status = res.data.status;
					gTodoC.update_todo_progress_icon(gTodo.cur_todo_code, status);				

					if (gTodo.view_mode == "read"){
						$("#card_"+id).remove();
						$("#list_card_"+id).remove();
						$("#todo_compose_close").click();
					}else{		
						
						var list = res.data.data;
						gTodo.cur_project_item_list = list;																	

						if (gTodo.cur_todo == "user"){
							if (gTodo.cur_type == "card"){
								$("#card_"+id).parent().remove();
								gTodo.all_status_count_check_user();
							}else{
								$("#list_card_"+id).parent().remove();
								gTodo.all_status_count_check_user();
							}
						}else if (gTodo.cur_todo == "status"){
							if (gTodo.cur_type == "card"){
								$("#card_"+id).parent().remove();
								gTodo.all_status_count_check();
							}else{
								$("#list_card_"+id).parent().remove();
								gTodo.all_status_count_check();
							}
						}
					}
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"move_task" : function(id){
		
		gTodo.select_id = id;
	//	var list = gTodo.cur_todo_list;
		var list = gap.cur_channel_list_info;
		
		var html = "";
		
		html += "<h2>"+gap.lang.todo+" "+gap.lang.move+"</h2>";
		html += "<button class='ico btn-close' id='mt_close'>닫기</button>";
		html += "<div class='selectbox'>";
		html += "	<h3>"+gap.lang.todo+"</h3>";
		html += "	<select id='todo_s_1'>";
		
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];
			var id = item._id.$oid;
//			if (item.type == "project" && gTodo.cur_project_info._id.$oid != id){				
//				html += "		<option value='"+id+"'>"+item.name+"</option>";
//			}	
			if (item.type != "folder" && gTodo.cur_project_info._id.$oid != id){				
				html += "		<option value='"+id+"'>"+item.ch_name+"</option>";
			}
		}
		
		html += "	</select>";
		html += "</div>";
		html += "<div class='selectbox'>";
		html += "	<h3>"+gap.lang.status+"</h3>";
		html += "	<select id='todo_s_2'>";
		html += "		<option value='0'>"+gap.lang.temps+"</option>";
		html += "		<option value='1'>"+gap.lang.wait+"</option>";
		html += "		<option value='2'>"+gap.lang.doing+"</option>";
		html += "		<option value='3'>"+gap.lang.done+"</option>";
		html += "	</select>";
		html += "</div>";
		html += "<div class='todo-check'>";
		html += "	<h3>"+gap.lang.option+"</h3>";
		html += "	<ul>";
		html += "		<li>";
		html += "			<div class='checkbox'>";
		html += "				<label>";
		html += "					<input type='checkbox' id='todo_c_1' checked><span class='checkbox-material'><span class='check'></span></span> " + gap.lang.asign + " " + gap.lang.contain;
		html += "				</label>";
		html += "			</div>";
		html += "		</li>";
		html += "		<li style='display:none'>";
		html += "			<div class='checkbox'>";
		html += "				<label>";
		html += "					<input type='checkbox' id='todo_c_2' checked><span class='checkbox-material'><span class='check'></span></span> " + gap.lang.member + " " + gap.lang.contain;
		html += "				</label>";
		html += "			</div>";
		html += "		</li>";
		html += "	</ul>";
		html += "</div>";
		html += "<div class='layer-bottom'>";
		html += "	<button id='mt_ok'><strong>"+gap.lang.move+"</strong></button>";
		html += "	<button id='mt_cancel'><span>"+gap.lang.Cancel+"</span></button>";
		html += "</div>";
	
		$("#create_todo_layer").removeAttr("class");
		$("#create_todo_layer").addClass("layer layer-todo-move");
		$("#create_todo_layer").html(html);
		
		$('#create_todo_layer select').material_select();
		
		// to do 상태를 동일하게 이동
		var prj_st = "0";
		for (var k = 0; k < gTodo.cur_project_item_list.length; k++){
			var item = gTodo.cur_project_item_list[k];
			if (item._id.$oid == gTodo.select_id){
				prj_st = item.status;
				break;
			}
		}
		$("#todo_s_2").val(prj_st).material_select();			

		if (gTodo.view_mode != "read"){
			gap.showBlock();
		}
		
		var max_idx = gap.maxZindex();
		$('#create_todo_layer').css({'zIndex': parseInt(max_idx) + 1}).fadeIn();
		
		$("#mt_close").on("click", function(e){
			$("#create_todo_layer").hide();
			if (gTodo.view_mode == "read"){
				gap.close_layer_todo('create_todo_layer');
			}else{
				gap.close_layer('create_todo_layer');
			}
			
		});
		
		$("#mt_cancel").on("click", function(e){
			$("#mt_close").click();
		});
		
		$("#mt_ok").on("click", function(e){
			
			var key = $("#todo_s_1").val();
			var key_txt = $("#todo_s_1 option:checked").text();
			var status = $("#todo_s_2").val();
			
			var opt1 = $('input:checkbox[id="todo_c_1"]').is(":checked");
			var opt2 = $('input:checkbox[id="todo_c_2"]').is(":checked");
			
			var source_id = gTodo.select_id;
			var target_id = key;
			
			var data = JSON.stringify({
				project_code : gTodo.cur_project_info._id.$oid,
				source_id : source_id,
				target_project : target_id,
				key_txt : key_txt,
				status : status,
				opt1 : opt1,
				opt2 : opt2,
				ty : "move"
			})
			
			var url = gap.channelserver + "/update_item_todo.km";
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "aplication/json; charset=utf-8",
				data : data,
				url : url,
				success : function(res){
					if (res.result == "OK"){
												
					
						//삭제된 아이템을 제거하고 현재 프로젝트의 아이템을 재정리한다.
						var list = res.data.data;
						gTodo.cur_project_item_list = list;
						
						//이동 후 현재 프로젝트에 있는 아이템은 제거한다.
						
						if (gTodo.cur_type == "card"){
							$("#card_" + gTodo.select_id).parent().remove();
						}else{
							$("#list_card_" + gTodo.select_id).parent().remove();
						}
						
						
						//레이어틀 닫는다.
						$("#mt_close").click();		
						
						if (gTodo.view_mode == "read"){
							//이동했기 때문에 띄워져 있는 레이어를 닫는다.
							$("#todo_compose_close").click();
						}
						
						//변경된 Count를 재정리한다.
						gTodo.all_status_count_check();
						
						//해당 업무가 기간이 등록되어 있는 경우 일정에 연동되기 때문에 담당자와 체크리스트 담당자의 일정을 업데이트해 주어야 한다.
						var startdate = $("#todo_startdate").val();
						if (startdate != ""){
							
							//기존 일정을 삭제한다.							
							gap.todo_connect_schedule_update(gTodo.select_todo, "D", "");
							//신규 일정을 등록한다.
							//담당자를 등롥한다..
							gap.schedule_update(res.data.ex, "asignee", "U");	
							//체크리스트를 등록한다.
							gap.checklist_all_update_schedule(res.data.ex);
							
						}
						
					}else{
						gap.error_alert();
					}
					
				},
				error : function(e){
					gap.error_alert();
				}
			})
		});
		
		
	},
	
	
	"copy_task" : function(id){
		
		gTodo.select_id = id;
//		var list = gTodo.cur_todo_list;
		var list = gap.cur_channel_list_info;
		
		var html = "";
		
		html += "<h2>"+gap.lang.todo+" "+gap.lang.copy+"</h2>";
		html += "<button class='ico btn-close' id='mt_close'>닫기</button>";
		html += "<div class='selectbox'>";
		html += "	<h3>"+gap.lang.todo+"</h3>";
		html += "	<select id='todo_ss_1'>";
		
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];
			var id = item._id.$oid;
//			if (item.type == "project" && gTodo.cur_project_info._id.$oid != id){				
//				html += "		<option value='"+id+"'>"+item.name+"</option>";
//			}	
			if (item.type != "folder" && gTodo.cur_project_info._id.$oid != id){	
		//	if (item.type != "folder" ){	
				html += "		<option value='"+id+"'>"+item.ch_name+"</option>";
			}
		}
		
		html += "	</select>";
		html += "</div>";
		
		html += "<div class='selectbox'>";
		html += "	<h3>"+gap.lang.status+"</h3>";
		html += "	<select id='todo_ss_2'>";
		html += "		<option value='0'>"+gap.lang.temps+"</option>";
		html += "		<option value='1'>"+gap.lang.wait+"</option>";
		html += "		<option value='2'>"+gap.lang.doing+"</option>";
		html += "		<option value='3'>"+gap.lang.done+"</option>";
		html += "	</select>";
		html += "</div>";
		
		html += "<div class='input-field todo-sbj'>";
		html += "	<input type='text'  autocomplete='off' class='formInput' id=''>";
		html += "	<label for='' class=''>"+gap.lang.input_title+"</label> <!-- 텍스트 필스 포커스, 입력값 있을때 on 클래스 추가 -->";
		html += "	<span class='bar'></span>";
		html += "</div>";
		
		
		html += "<div class='todo-check'>";
		html += "	<h3>"+gap.lang.option+"</h3>";
		html += "	<ul>";
		html += "		<li>";
		html += "			<div class='checkbox'>";
		html += "				<label>";
		html += "					<input type='checkbox' id='todo_cc_1' checked><span class='checkbox-material'><span class='check'></span></span> " + gap.lang.todo_project_comment;
		html += "				</label>";
		html += "			</div>";
		html += "		</li>";
		html += "		<li>";
		html += "			<div class='checkbox'>";
		html += "				<label>";
		html += "					<input type='checkbox' id='todo_cc_2' checked><span class='checkbox-material'><span class='check'></span></span> " + gap.lang.asign;
		html += "				</label>";
		html += "			</div>";
		html += "		</li>";
		
		html += "		<li>";
		html += "			<div class='checkbox'>";
		html += "				<label>";
		html += "					<input type='checkbox' id='todo_cc_3' checked><span class='checkbox-material'><span class='check'></span></span> " + gap.lang.checklist;
		html += "				</label>";
		html += "			</div>";
		html += "		</li>";
		html += "		<li style='display:none'>";
		html += "			<div class='checkbox'>";
		html += "				<label>";
		html += "					<input type='checkbox' id='todo_cc_4' checked><span class='checkbox-material'><span class='check'></span></span> " + gap.lang.member;
		html += "				</label>";
		html += "			</div>";
		html += "		</li>";
		html += "		<li>";
		html += "			<div class='checkbox'>";
		html += "				<label>";
		html += "					<input type='checkbox' id='todo_cc_5' checked><span class='checkbox-material'><span class='check'></span></span> " + gap.lang.status;
		html += "				</label>";
		html += "			</div>";
		html += "		</li>";
//		html += "		<li>";
//		html += "			<div class='checkbox'>";
//		html += "				<label>";
//		html += "					<input type='checkbox' id='todo_cc_6' checked><span class='checkbox-material'><span class='check'></span></span> " + gap.lang.tag;
//		html += "				</label>";
//		html += "			</div>";
//		html += "		</li>";
		html += "		<li>";
		html += "			<div class='checkbox'>";
		html += "				<label>";
		html += "					<input type='checkbox' id='todo_cc_7' checked><span class='checkbox-material'><span class='check'></span></span> " + gap.lang.priority;
		html += "				</label>";
		html += "			</div>";
		html += "		</li>";
//		html += "		<li>";
//		html += "			<div class='checkbox'>";
//		html += "				<label>";
//		html += "					<input type='checkbox' id='todo_cc_8' checked><span class='checkbox-material'><span class='check'></span></span> " + gap.lang.color;
//		html += "				</label>";
//		html += "			</div>";
//		html += "		</li>";
		
		html += "	</ul>";
		html += "</div>";
		html += "<div class='layer-bottom'>";
		html += "	<button id='mt_ok'><strong>"+gap.lang.copy+"</strong></button>";
		html += "	<button id='mt_cancel'><span>"+gap.lang.Cancel+"</span></button>";
		html += "</div>";
	
		$("#create_todo_layer").removeAttr("class");
		$("#create_todo_layer").addClass("layer layer-todo-copy");
		$("#create_todo_layer").html(html);
		
		$('#create_todo_layer select').material_select();

		if (gTodo.view_mode != "read"){
			gap.showBlock();
		}
		
		var max_idx = gap.maxZindex();
		$('#create_todo_layer').css({'zIndex': parseInt(max_idx) + 1}).fadeIn();
		
		$("#mt_close").on("click", function(e){
			$("#create_todo_layer").hide();
			if (gTodo.view_mode == "read"){
				gap.close_layer_todo('create_todo_layer');
			}else{
				gap.close_layer('create_todo_layer');	
			}
			
		});
		
		$("#mt_cancel").on("click", function(e){
			$("#mt_close").click();
		});
		
		$(".todo-sbj .formInput").on("focusout", function(e){
			var txt = $(this).val();
			if (txt.length > 0){
				$(".todo-sbj label").addClass("on");
			}
		});
		
		$("#mt_ok").on("click", function(e){
			var key = $("#todo_ss_1").val();
			var key_txt = $("#todo_ss_1 option:checked").text();
			var status = $("#todo_ss_2").val();
			
			var title = $(".todo-sbj .formInput").val();
			
			var opt1 = $('input:checkbox[id="todo_cc_1"]').is(":checked");
			var opt2 = $('input:checkbox[id="todo_cc_2"]').is(":checked");
			var opt3 = $('input:checkbox[id="todo_cc_3"]').is(":checked");
			var opt4 = $('input:checkbox[id="todo_cc_4"]').is(":checked");
			var opt5 = $('input:checkbox[id="todo_cc_5"]').is(":checked");
			var opt6 = $('input:checkbox[id="todo_cc_6"]').is(":checked");
			var opt7 = $('input:checkbox[id="todo_cc_7"]').is(":checked");
			var opt8 = $('input:checkbox[id="todo_cc_8"]').is(":checked");
			
			var source_id = gTodo.select_id;
			var target_id = key;
			
			var data = JSON.stringify({
				project_code : gTodo.cur_project_info._id.$oid,
				title : title,
				source_id : source_id,
				target_project : target_id,
				key_txt : key_txt,
				status : status,
				opt1 : opt1,
				opt2 : opt2,
				opt3 : opt3,
				opt4 : opt4,
				opt5 : opt5,
				opt6 : opt6,
				opt7 : opt7,
				opt8 : opt8,
				ty : "copy"
			})
			
			var url = gap.channelserver + "/update_item_todo.km";
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "aplication/json; charset=utf-8",
				data : data,
				url : url,
				success : function(res){
					if (res.result == "OK"){			
						//레이어틀 닫는다.
						$("#mt_close").click();		
						
						
						//변경된 Count를 재정리한다.
						gTodo.all_status_count_check();
					}else{
						gap.error_alert();
					}
					
				},
				error : function(e){
					gap.error_alert();
				}
			})
		});
		
	},
	
	
	
	"share_task" : function(id){
		
		gTodo.select_id = id;
		
		//사용자가 가지고 있는 Box 재널 리스트를 가져온다.
	/*	var data = JSON.stringify({
			"email" : gap.search_cur_em_sec(),
			"depts" : gap.full_dept_codes()
		});*/
		
		var data = JSON.stringify({});
		var url = channelserver + "/channel_info_list.km";
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : url,
			data : data,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){
			
				if (res.length > 0){
					
					var list = res;
					
					var html = "";
					
					html += "<h2>"+gap.lang.todo+" "+gap.lang.share+"</h2>";
					html += "<button class='ico btn-close' id='mshare_close'>닫기</button>";
					
					
					html += "<div class='selectbox'>";
					html += "	<h3>"+gap.lang.select_share_channel+"</h3>";
					html += "	<select id='share_todo_box_select'>";
					for (var i = 0 ; i < list.length; i++){
						var item = list[i];
						if (item.type != "folder"){
							html += "		<option value='"+item.ch_code+"'>"+item.ch_name+"</option>";
						}						
					}
					
					html += "	</select>";
					html += "</div>";
					
					
					html += "<div class='layer-bottom'>";
					html += "	<button id='mshare_ok'><strong>"+gap.lang.share+"</strong></button>";
					html += "	<button id='mshare_cancel'><span>"+gap.lang.Cancel+"</span></button>";
					html += "</div>";
				
					$("#create_todo_layer").removeAttr("class");
					$("#create_todo_layer").addClass("layer layer-todo-move");
					$("#create_todo_layer").html(html);
					
					$('#create_todo_layer select').material_select();
		
					if (gTodo.view_mode != "read"){
						gap.showBlock();
					}
					
					var max_idx = gap.maxZindex();
					$('#create_todo_layer').css({'zIndex': parseInt(max_idx) + 1}).fadeIn();
					
					$("#mshare_close").on("click", function(e){
						$("#create_todo_layer").hide();
						if (gTodo.view_mode == "read"){
							gap.close_layer_todo('create_todo_layer');
						}else{
							gap.close_layer('create_todo_layer');
						}
						
					});
					
					$("#mshare_cancel").on("click", function(e){
						$("#mshare_close").click();
					});
					
					$("#mshare_ok").on("click", function(e){
						
						
						var ch_code = $("#share_todo_box_select").val();
						var ch_name = $("#share_todo_box_select option:checked").text();
						
						//아래 설정을 해야 gBody3에서 인식한다. send_socket에서
						gBody3.select_channel_code = ch_code;
						gBody3.select_channel_name = gap.textToHtml(ch_name);
						
		
						var select_todo_id = gTodo.select_id;
						
					/*	var data2 = JSON.stringify({
							email : gap.userinfo.rinfo.em,
							key : select_todo_id
						});*/
						
						var data2 = JSON.stringify({
							key : select_todo_id
						});
						
						var url = gap.channelserver + "/search_item_todo.km";
						$.ajax({
							type : "POST",
							dataType : "json",
							contentType : "application/json; charset=utf-8",
							url : url,
							data : data2,
							beforeSend : function(xhr){
								xhr.setRequestHeader("auth", gap.get_auth());
								xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
							},
							success : function(res){
								
								var dx = res.data;
								dx.type = "todo";
							
								var xdata = JSON.stringify({
									"type" : "msg",
									"channel_code" : ch_code,
									"channel_name" : ch_name,
									"email" : gap.userinfo.rinfo.em,
									"ky" : gap.userinfo.rinfo.ky,
									"owner" : gap.userinfo.rinfo,
									"content" : "",
									"edit" : "",
									"msg_edit" : "",
									"id" : "",
									"ex" : dx,
									"fserver" : gap.channelserver
								});
								
								
								gBody3.send_msg_to_server(xdata);
								
								$("#mshare_close").click();				
							},
							error : function(e){
								gap.error_alert();
							}
						})
					});
				}else{
					gap.gAlert(gap.lang.noch);					
				}		
			},
			error : function(e){
				gap.error_alert();
			}
		});	
	},
	
	
	"update_star_task" : function(id){		
		var url = gap.channelserver + "/favorite_todo_item.km";
	/*	var data = JSON.stringify({
			key : id,
			email : gap.userinfo.rinfo.em
		});*/
		
		var data = JSON.stringify({
			key : id
		});
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data : data,
			url : url,
			beforeSend : function(xhr){
				xhr.setRequestHeader("auth", gap.get_auth());
				xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
			},
			success : function(res){	
				
				if (res.result == "OK"){					
					if (gTodo.view_mode == "read"){
						$(".todo-view-left .btn-star").addClass("on");
					}
					gTodoC.update_todo_star_list('add');
					gap.gAlert(gap.lang.added_favorite_menu);
					
				}else if (res.result == "RELEASE"){
					if (gTodo.view_mode == "read"){
						$(".todo-view-left .btn-star").removeClass("on");
					}
					gTodoC.update_todo_star_list('del');
					gap.gAlert(gap.lang.release_favorite_menu);
					
				}else{
					gap.error_alert();
				}
				
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	
		
	"todo_center_user" : function(){
		
	
		var html2 = "";
		
		html2 += gTodo.center_top_menu_draw(2);		
		
		html2 += "	<div class='todo-card'>";
		html2 += "		<!-- 대기중 -->";
		html2 += "		<div class='card-list card-wait'>";
		html2 += "		<h2><span> (2)</span></h2>";
		html2 += "			<div class='input-field'>";
		html2 += "				<input type='text' class='formInput'  autocomplete='off' placeholder='+ "+gap.lang.addtodo+"' />";
		html2 += "				<span class='bar'></span>";
		html2 += "			</div>";
		html2 += "			<ul class='card'>";	
		html2 += gTodo.todo_make_card();	
		html2 += "			</ul>";		
		html2 += "		</div>";
		html2 += "";		
		html2 += "		<!-- 진행중 -->";
		html2 += "		<div class='card-list card-wait'>";		
		html2 += "			<h2><span> (2)</span></h2>";
		html2 += "			<div class='input-field'>";		
		html2 += "				<input type='text' class='formInput'  autocomplete='off' placeholder='+ "+gap.lang.addtodo+"' />";
		html2 += "				<span class='bar'></span>";		
		html2 += "			</div>";
		html2 += "			<ul class='card'>";		
		html2 += gTodo.todo_make_card();
		html2 += "			</ul>";
		html2 += "		</div>";
		html2 += "";
		html2 += "		<!-- 완료 -->";
		html2 += "		<div class='card-list card-wait'>";
		html2 += "			<h2><span> (2)</span></h2>";
		html2 += "			<div class='input-field'>";
		html2 += "				<input type='text' class='formInput'  autocomplete='off' placeholder='+ "+gap.lang.addtodo+"' />";
		html2 += "				<span class='bar'></span>";
		html2 += "			</div>";
		html2 += "			<ul class='card'>";
		
		html2 += gTodo.todo_make_card();

		html2 += "			</ul>";
		html2 += "		</div>";
		

		html2 += "	</div>";
		html2 += "</div>";
		
		
		$(".left-area").hide();
		$("#center_content").show();
		$("#center_content").off();
		$("#center_content").removeAttr("class");
		$("#center_content").addClass("left-area todo fold-temp");
		//$("#center_content").css("width","calc(100% - 300px)");
		$("#center_content").html(html2);
		
		gTodo.__todo_center_event();
	},
	
			
	
	
	"todo_make_card_first_list" : function(info){
		
		var id = info.id;
		var title = info.title;
		var status = info.status;
		
		
	
		var html2 = "";
		html2 += "<div class='xlist'>"
			
			
		html2 += "<div class='g-list' id='list_card_"+id+"' data='"+gap.userinfo.rinfo.em+"' data2='"+gap.userinfo.rinfo.ky+"'>";
		html2 += "	<div class='color-bar c3'></div> <!-- 사용자 지정색상  -->";
		html2 += "	<div class='todo-sbj' style='padding-left:2px'><h3>"+title+"</h3><button class='ico btn-more'>더보기</button></div>";
		html2 += "	<div class='icons'><span class='ico ico-reply on'></span><em>0</em></div>";
		
		
		if (gTodo.cur_todo_code != gBody3.temp_room_key){
			html2 += "	<div class='user'>";
		//	html2 += "		<div class='user-thumb'><img src='"+cdbpath+"/img/user.jpg' alt=''></div>";
			if (typeof(info.asignee) != "undefined"){
				var user_info = gap.user_check(info.asignee)
				html2 += "		<div class='user-thumb'>"+user_info.user_img+"</div>";
			}else{
				html2 += "		<div class='user-thumb'><img src='"+root_path+"/resource/images/user_d.jpg' alt=''></div>";
			}
			html2 += "	</div>";
			
			
			
			var cls = "temp";
			var cls_txt = gap.lang.temps;
			if (status == "1"){
				cls = "wait";
				cls_txt = gap.lang.wait;
			}else if (status == "2"){
				cls = "continue";
				cls_txt = gap.lang.doing;
			}else if (status == "3"){
				cls = "complete";
				cls_txt = gap.lang.done;
			}
			html2 += "	<div class='status'><span class='"+cls+"'>"+cls_txt+"</span></div>";
		
		
			html2 += "	<div class='todo-period'><span><div class='bar'></div><em></em></span></div>";
			html2 += "	<div class='todo-progress'><div class='graph'><span class='bar' style='width:0%;'></span></div><em>0%</em></div>";

		}
		
		if (typeof(info.priority) != "undefined"){
			var tx = "priority" + info.priority;
			var txt = gap.lang[tx]
			html2 += "	<div class='todo-priority'><span class='ico p"+info.priority+"'></span>"+txt+"</div>";
		}else{
			html2 += "	<div class='todo-priority'><span class='ico p3'></span>"+gap.lang.priority3+"</div>";
		}
		
		html2 += "	<div class='icons'><span class='ico ico-clip'></span><em>0</em></div>";
		html2 += "</div>";
		
		html2 += "</div>";
		
		
		return html2;
	},
	
	
	
	
	"todo_make_card_first" : function(info){
		
		var id = info.id;
		var title = info.title;
		var status = info.status;
		
		var html2 = "";
	
		html2 += "<div class='xcard'>";
		html2 += "<div class='g-card' id='card_"+id+"' data='"+gap.userinfo.rinfo.em+"'>";
		html2 += "	<div class='color-bar'></div> <!-- 사용자 지정 색상 -->";
		html2 += "	<button class='ico btn-more'>더보기</button>";
		if (status == "1"){
			html2 += "	<div class='status'><span class='ico ico-wait-c'></span>"+gap.lang.wait+"</div>";
		}else if (status == "2"){
			html2 += "	<div class='status'><span class='ico ico-continue-c'></span>"+gap.lang.doing+"</div>";
		}else if (status == "3"){
			html2 += "	<div class='status'><span class='ico ico-complete-c'></span>"+gap.lang.done+"</div>";
		}

		html2 += "	<h3><span class='ico p3'></span>"+title+"</h3>";
		
		html2 += "	<span class='todo-period' style='padding-left:2px; display:none'></span>";
		
		html2 += "	<div class='todo-tag' style='display:none; padding-left:2px'>";
		html2 += "	</div>";
		

		
		
		if (typeof(info.asignee) != "undefined" && info.asignee != ""){
			var mp = info.asignee;
			var user_info = gap.user_check(mp);
			
			html2 += "	<div class='user' style='padding-left:2px'>";
			html2 += "		<div class='user-thumb'>"+user_info.user_img+"</div>";
			html2 += "		<dl>";
			html2 += "			<dt>"+user_info.name+"</dt>";
			html2 += "			<dd>"+user_info.jt+" / "+user_info.dept+"</dd>";
			html2 += "		</dl>";
			html2 += "	</div>";
		}else{
			html2 += "	<div class='user' style='display:none; padding-left:2px'>";
			html2 += "	</div>";
		}
		
		
		
		
		html2 += "	<dl class='icons' style='display:none'>";
		html2 += "		<dd style='display:none'><span class='ico ico-checklist'></span><em id='ck_"+id+"'>0/0</em></dd>";   // class='checked'
		html2 += "		<dd style='display:none'><span class='ico ico-clip'></span><em id='file_"+id+"'>0</em></dd>";
		html2 += "		<dd style='display:none'><span class='ico ico-reply'></span><em id='rep_"+id+"'>0</em></dd>";
		html2 += "  </dl>";
		
		html2 += "</div>";		
		html2 += "</div>";	
		
		return html2;
	},
	
	
	
	"todo_make_card" : function(info){
		//색상, 상태, 제목, 기간(시작일, 종료일), 태그, 담당자 정보, 첨부파일 개수, 응답 개수, 체크리스트 개수
		//<!-- 	컬러정의 .c1 : 흰색 (기본).c2 : 빨강.c3 : 주황.c4 : 노랑.c5 : 초록.c6 : 파랑.c7 : 남색.c8 : 보라	.c9 : 분홍.c10 : 청록-->
	
		var id = info._id.$oid;
		var item = gTodo.code_change_status(info.status);
		var is_delay = false;
	
		var html2 = "";
		
		html2 += "<div class='xcard'>";
		
		
		/////////////////////// delay체크를 위해서 날짜 계산을 먼저 한다. /////////////////////////////////////////
		var hm = "";
		if (typeof(info.startdate) != "undefined"){
			
			var dinfo = gTodo.date_diff(info.startdate, info.enddate);
			if (info.status != "3"){
				if (dinfo.rate > 100){
					is_delay = true;
				}
			}	
			hm = "	<div class='todo-period' style='padding-left:2px'><span style='text-align:center'><div class='bar' style='width:"+dinfo.rate+"%;'></div><em>"+dinfo.st+" ~ "+dinfo.et+" ("+dinfo.term+"day)</em></span></div>";
		}else{
			hm = "	<div class='todo-period' style='padding-left:2px; display:none'></div>";
		}
		
		///////////////////////////////////////////////////////////////////////////////////////
	
		
		var asign = "";
		var own = "";
		if (typeof(info.asignee) != "undefined"){
			asign = info.asignee.em;
		}
		if (typeof(info.owner) != "undefined"){
			own = info.owner.em;
		}
		
		if (is_delay){
			html2 += "<div class='g-card delay' id='card_"+id+"' data='"+own+"' data2='"+asign+"'>";
		}else{
			html2 += "<div class='g-card' id='card_"+id+"' data='"+own+"' data2='"+asign+"'>";
		}
		
		if (typeof(info.color) != "undefined"){
			html2 += "	<div class='color-bar "+info.color+"'></div> <!-- 사용자 지정 색상 -->";
		}else{
			html2 += "	<div class='color-bar'></div> <!-- 사용자 지정 색상 -->";
		}

		html2 += "	<button class='ico btn-more' style='position:absolute; top:15px; right:9px'>더보기</button>";
		if (info.status != "0"){
			html2 += "	<div class='status'><span class='ico ico-"+item.style+"-c'></span>"+item.txt+"</div>";
		}
		
		var priority = info.priority;
		if (typeof(info.priority) != "undefined" || priority == ""){
			html2 += "	<h3><span class='ico p"+priority+"'></span>"+info.title+"</h3>";
		}else{
			html2 += "	<h3>"+info.title+"</h3>";
		}
		
		
		html2 += hm;
		
	
		if (typeof(info.tag) != "undefined"){
			html2 += "	<div class='todo-tag' style='padding-left:2px'>";
			for (var i = 0 ; i < info.tag.length; i++){
				html2 += "		<span>"+info.tag[i]+"</span>";
			}
			
			html2 += "	</div>";
		}else{
			html2 += "	<div class='todo-tag' style='display:none; padding-left:2px'>";
			html2 += "	</div>";
		}
		
		if (typeof(info.asignee) != "undefined" && info.asignee != ""){
			var mp = info.asignee;
		//	var user_info = gap.user_info_check(mp);
			var user_info = gap.user_check(mp);

			html2 += "	<div class='user' style='padding-left:2px'>";
			html2 += "		<div class='user-thumb'>"+user_info.user_img+"</div>";
			html2 += "		<dl>";
			html2 += "			<dt>"+user_info.name+"</dt>";
			html2 += "			<dd>"+user_info.jt+" / "+user_info.dept+"</dd>";
			html2 += "		</dl>";
			html2 += "	</div>";
		}else{
			html2 += "	<div class='user' style='display:none'>";
			html2 += "	</div>";
		}

		
		if (info.checklist.length == 0 && info.file.length == 0 && info.reply.length == 0){	
			html2 += "	<dl class='icons' style='display:none'>";
			html2 += "		<dd style='display:none'><span class='ico ico-checklist'></span><em id='ck_"+id+"'>0/0</em></dd>";   // class='checked'
			html2 += "		<dd style='display:none'><span class='ico ico-clip'></span><em id='file_"+id+"'>0</em></dd>";
			html2 += "		<dd style='display:none'><span class='ico ico-reply'></span><em id='rep_"+id+"'>0</em></dd>";
			html2 += "	</dl>";
		}else{
			html2 += "	<dl class='icons'>";
			if (info.checklist.length > 0){
				//var clist = info.checklist.filter(x => x.complete === "T").length;  젠장 IE에서 동작하지 않네...
				var clist = gTodo.check_complete_todo(info.checklist);
				var tlist = info.checklist.length;
				if (clist == tlist){
					html2 += "		<dd class='checked' style='padding:0 5px'><span class='ico ico-checklist'></span><em  id='ck_"+id+"'>"+clist+"/"+tlist+"</em></dd>";   // class='checked'
				}else{
					html2 += "		<dd style='padding:0 5px'><span class='ico ico-checklist'></span><em  id='ck_"+id+"'>"+clist+"/"+tlist+"</em></dd>";   // class='checked'
				}
				
			}else{
				html2 += "		<dd style='display:none'><span class='ico ico-checklist'></span><em  id='ck_"+id+"'>"+clist+"/"+tlist+"</em></dd>";   // class='checked'
			}
			if (info.file.length > 0){
				html2 += "		<dd><span class='ico ico-clip'></span><em id='file_"+id+"'>"+info.file.length+"</em></dd>";
			}else{
				html2 += "		<dd style='display:none'><span class='ico ico-clip'></span><em id='file_"+id+"'>"+info.file.length+"</em></dd>";
			}
			if (info.reply.length > 0){
				html2 += "		<dd><span class='ico ico-reply'></span><em id='rep_"+id+"'>"+info.reply.length+"</em></dd>";
			}else{
				html2 += "		<dd style='display:none'><span class='ico ico-reply'></span><em id='rep_"+id+"'>"+info.reply.length+"</em></dd>";
			}
			html2 += "	</dl>";
		}	

		html2 += "</div>";		
		html2 += "</div>";
		
			
		return html2;
		
		
		
	},
	
	"check_complete_todo" : function(list){
		var count = 0;
		for (var i = 0 ; i < list.length; i++){
			var ck = list[i];
			if (ck != null && typeof(ck) != "undefined"){
				if (ck.complete == "T"){
					count ++;
				}
			}			
		}
		return count;
	},
	
	
/*	
	"todo_attachment" : function(){
		var html3= "";
		html3 += "	<div class='todo-files'>";
		html3 += "	<h2>파일</h2>";
		html3 += "	<button class='ico btn-right-close' id='file_layer_close'>닫기</button>";
		html3 += "	<div class='todo-option'>";
		
		html3 += "		<div class='option-file' id='todo_option_file_select'>";
		html3 += "			<button class='btn-txt'><em class='caret'></em><span>전체파일</span></button>";
//		html3 += "			<div class='qtip' style='display:none;left:0;top:30px;z-index:100;'>";
//		html3 += "				<div class='qtip-default'>";
//		html3 += "					<ul class='layer-option-list'>";
//		html3 += "						<li><em>모든파일</em></li>";
//		html3 += "						<li><em>이미지</em></li>";
//		html3 += "						<li><em>비디오</em></li>";
//		html3 += "						<li><em>문서</em></li>";
//		html3 += "						<li><em>기타</em></li>";
//		html3 += "					</ul>";
//		html3 += "				</div>";
//		html3 += "			</div>";
		html3 += "		</div>";
		html3 += "		<div class='option-folder' id='todo_option_folder_select'>";
		html3 += "			<button class='btn-txt'><em class='caret'></em><span>전체폴더</span></button>";
//		html3 += "			<div class='qtip' style='display:none;left:-87px;top:30px;z-index:100;'>";
//		html3 += "				<div class='qtip-default'>";
//		html3 += "					<div class='layer-option-folder'>";
//		html3 += "						<div class='input-field'> ";
//		html3 += "							<input type='text' class='formInput' placeholder='폴더명을 검색하세요.'>";
//		html3 += "							<span class='bar'></span>";
//		html3 += "						</div>";
//		html3 += "						<button class='btn-file-search ico'>검색</button>";
//		html3 += "						<ul class='layer-option-list'>";
//		html3 += "							<li class='on'><em>전체폴더</em></li>";
//		html3 += "						</ul>";
//		html3 += "						<div class='option-group'>";
//		html3 += "							<h2>Todo</h2>";
//		html3 += "							<ul class='layer-option-list'>";
//		html3 += "								<li><em>프로젝트 관리</em></li>";
//		html3 += "								<li><em>AP-ON Ver3</em></li>";
//		html3 += "							</ul>";
//		html3 += "						</div>";
//		html3 += "						<div class='option-group'>";
//		html3 += "							<h2>Box Todo List</h2>";
//		html3 += "							<ul class='layer-option-list'>";
//		html3 += "								<li><em>프로젝트 관리</em></li>";
//		html3 += "								<li><em>AP-ON Ver3</em></li>";
//		html3 += "							</ul>";
//		html3 += "						</div>";
//		html3 += "					</div>";
//		html3 += "				</div>";
//		html3 += "			</div>";
		html3 += "		</div>";
		
		html3 += "		<div class='option-member' id='todo_option_member_select'>";
		html3 += "			<button class='btn-txt'><em class='caret'></em><span>전체멤버</span></button>";
//		html3 += "			<div class='qtip' style='display:none;left:-173px;top:30px;z-index:100;'>";
//		html3 += "				<div class='qtip-default'>";
//		html3 += "					<div class='layer-option-member'>";
//		html3 += "						<div class='input-field'> ";
//		html3 += "							<input type='text' class='formInput' placeholder='이름을 검색하세요.'>";
//		html3 += "							<span class='bar'></span>";
//		html3 += "						</div>";
//		html3 += "						<button class='btn-file-search ico'>검색</button>";
//		html3 += "						<ul class='layer-option-list'>";
//		html3 += "							<li><em>전체멤버</em></li>";
//		html3 += "							<li>";
//		html3 += "								<div class='user'>";
//		html3 += "									<div class='user-thumb'><img src='./img/m1.jpg' alt=''></div>";
//		html3 += "									<dl>";
//		html3 += "										<dt>박신혜님</dt>";
//		html3 += "										<dd>대리 / 기술전략팀</dd>";
//		html3 += "									</dl>";
//		html3 += "								</div>";
//		html3 += "							</li>";
//		html3 += "							<li>";
//		html3 += "								<div class='user'>";
//		html3 += "									<div class='user-thumb'><img src='./img/m1.jpg' alt=''></div>";
//		html3 += "									<dl>";
//		html3 += "										<dt>박신혜님</dt>";
//		html3 += "										<dd>대리 / 기술전략팀</dd>";
//		html3 += "									</dl>";
//		html3 += "								</div>";
//		html3 += "							</li>";
//		html3 += "							<li>";
//		html3 += "								<div class='user'>";
//		html3 += "									<div class='user-thumb'><img src='./img/m1.jpg' alt=''></div>";
//		html3 += "									<dl>";
//		html3 += "										<dt>박신혜님</dt>";
//		html3 += "										<dd>대리 / 기술전략팀</dd>";
//		html3 += "									</dl>";
//		html3 += "								</div>";
//		html3 += "							</li>";
//		html3 += "						</ul>";
//		html3 += "					</div>";
//		html3 += "				</div>";
//		html3 += "			</div>";
		html3 += "		</div>";
	
		
		html3 += "	</div>";
		html3 += "	<div class='card-list'>";
		html3 += "		<ul class='card'>";
		html3 += "			<li>";
		html3 += "				<span class='name'>김소현님<em class='date'>2021.03.10</em></span>";
		html3 += "				<div class='todo-attach'>";
		html3 += "					<span class='ico ico-file ppt'></span>";
		html3 += "					<dl>";						
		html3 += "						<dt>빅데이터기반특허모델.pptx</dt>";
		html3 += "						<dd>1,424KB</dd>";
		html3 += "					</dl>";
		html3 += "				</div>";
		html3 += "				<div class='todo-sbj'><span class='ico ico-wait-c'></span>K-Portal Solution 제안</div>";
		html3 += "				<div class='card-btns'>";
		html3 += "					<div class='wrap-btns'>";
		html3 += "						<button class='ico btn-c-preview'></button>";
		html3 += "						<button class='ico btn-c-download'></button>";
		html3 += "						<button class='ico btn-c-delete'></button>";
		html3 += "					</div>";
		html3 += "				</div>";
			
		html3 += "			</li>";
		html3 += "			<li>";
		html3 += "				<span class='name'>김소현님<em class='date'>2021.03.10</em></span>";
		html3 += "				<div class='todo-attach'>";
		html3 += "					<span class='ico ico-file excel'></span>";
		html3 += "					<dl>";
		html3 += "						<dt>빅데이터기반특허모델.xlsx</dt>";
		html3 += "						<dd>1,424KB</dd>";
		html3 += "					</dl>";
		html3 += "				</div>";
		html3 += "				<div class='todo-sbj'><span class='ico ico-continue-c'></span>AP-ON 제안</div>";
		html3 += "				<div class='card-btns'>";
		html3 += "					<div class='wrap-btns'>";
		html3 += "						<button class='ico btn-c-preview'></button>";
		html3 += "						<button class='ico btn-c-download'></button>";
		html3 += "						<button class='ico btn-c-delete'></button>";
		html3 += "					</div>";
		html3 += "				</div>";
		html3 += "			</li>";
		html3 += "		</ul>";
		html3 += "	</div>";
		html3 += "</div>";
		
		
		$("#center_content").css("width","calc(100% - 300px)");
	//	$("#user_profile").css("width", "290px");
		$(".right-area").hide();
		$("#user_profile").css("width", "290px");
		$("#user_profile").show();
		$("#user_profile").off();
		$("#user_profile").removeAttr("class");
		$("#user_profile").addClass("right-area channel-info");
		$("#user_profile").html(html3);
		
		gTodo.__todo_attachment_event();
	},
	
	
	"__todo_attachment_event" : function(){
		$("#file_layer_close").off();
		$("#file_layer_close").on("click", function(e){
			$("#center_content").css("width","calc(100% - 10px)");
			$("#user_profile").hide();
		});
		
		
		$(".todo-option .btn-txt").on("click", function(e){
			
			
			var cls = $(this).parent().attr("class");
			var html3 = "";
			if (cls == "option-file"){				
				html3 += "<div class='qtip-default' style='border:none'>";
				html3 += "	<ul class='layer-option-list'>";
				html3 += "		<li><em>모든파일</em></li>";
				html3 += "		<li><em>이미지</em></li>";
				html3 += "		<li><em>비디오</em></li>";
				html3 += "		<li><em>문서</em></li>";
				html3 += "		<li><em>기타</em></li>";
				html3 += "	</ul>";			
				html3 += "</div>";
			}else if (cls == "option-folder"){
				html3 += "<div class='qtip-default'  style='border:none'>";
//				html3 += "	<div class='layer-option-folder'>";
//				html3 += "		<div class='input-field'> ";
//				html3 += "		<input type='text' class='formInput' placeholder='폴더명을 검색하세요.'>";
//				html3 += "			<span class='bar'></span>";
//				html3 += "	</div>";
//				html3 += "		<button class='btn-file-search ico'>검색</button>";
				html3 += "		<ul class='layer-option-list'>";
				html3 += "			<li class='on'><em>전체폴더</em></li>";
				html3 += "		</ul>";
				html3 += "		<div class='option-group'>";
//				html3 += "			<h2>Todo</h2>";
				html3 += "			<ul class='layer-option-list'>";
				html3 += "				<li><em>프로젝트 관리</em></li>";
				html3 += "				<li><em>AP-ON Ver3</em></li>";
				html3 += "			</ul>";
				html3 += "		</div>";
//				html3 += "		<div class='option-group'>";
//				html3 += "			<h2>Box Todo List</h2>";
//				html3 += "			<ul class='layer-option-list'>";
//				html3 += "				<li><em>프로젝트 관리</em></li>";
//				html3 += "				<li><em>AP-ON Ver3</em></li>";
//				html3 += "			</ul>";
//				html3 += "		</div>";
				html3 += "	</div>";
				html3 += "</div>";
			}else if (cls == "option-member"){
				html3 += "<div class='qtip-default' style='border:none'>";
				html3 += "	<div class='layer-option-member'>";
				html3 += "	<div class='input-field'> ";
				html3 += "		<input type='text' class='formInput' placeholder='이름을 검색하세요.'>";
				html3 += "		<span class='bar'></span>";
				html3 += "	</div>";
				html3 += "	<button class='btn-file-search ico'>검색</button>";
				html3 += "	<ul class='layer-option-list'>";
				html3 += "		<li><em>전체멤버</em></li>";
				html3 += "		<li>";
				html3 += "			<div class='user'>";
				html3 += "				<div class='user-thumb'><img src='./img/m1.jpg' alt=''></div>";
				html3 += "				<dl>";
				html3 += "					<dt>박신혜님</dt>";
				html3 += "					<dd>대리 / 기술전략팀</dd>";
				html3 += "				</dl>";
				html3 += "			</div>";
				html3 += "		</li>";
				html3 += "		<li>";
				html3 += "			<div class='user'>";
				html3 += "				<div class='user-thumb'><img src='./img/m1.jpg' alt=''></div>";
				html3 += "				<dl>";
				html3 += "					<dt>박신혜님</dt>";
				html3 += "					<dd>대리 / 기술전략팀</dd>";
				html3 += "				</dl>";
				html3 += "			</div>";
				html3 += "		</li>";
				html3 += "		<li>";
				html3 += "			<div class='user'>";
				html3 += "				<div class='user-thumb'><img src='./img/m1.jpg' alt=''></div>";
				html3 += "				<dl>";
				html3 += "					<dt>박신혜님</dt>";
				html3 += "					<dd>대리 / 기술전략팀</dd>";
				html3 += "				</dl>";
				html3 += "			</div>";
				html3 += "		</li>";
				html3 += "	</ul>";
				html3 += "</div>";
				html3 += "</div>";
			}

			gTodo.show_qtip(e, html3, 0);

		});
		
		

		
		
	},
*/	
	
	"todo_members" : function(){
		//데이터가 초기화 될때 변수로 저장된 데이터를 활용해서 멤버를 호출한다.
	
		
		var info = gTodo.cur_project_info;
		
		var owner = info.owner;
		var members = info.member;
		
		var members = sorted=$(members).sort(gap.sortNameDesc);	
		
//		var owner_img = gap.person_photo(owner.pu);
//		var owner_name = owner.nm;
//		var company = owner.cp;
//		var dept = owner.dp;
//		var email = owner.em;
//		var mobile = owner.mp;
//		if (gap.curLang != "ko"){
//			owner_name = owner.enm;
//		}
		
		
		var user_info = gap.user_check(owner);
		
		var ky = owner.ky;
		var cur_email = gap.userinfo.rinfo.em;
		var is_admin = false;
		if (owner.em == cur_email){
			is_admin = true;
		}
		
		var html = "";
		
//		html += "<div class='owner-info invite-info'>";
//		html += "<h2>Owner</h2>";
//		html += "	<button class='ico btn-right-close' id='member_layer_close2'>닫기</button>";
//		html += "	<div class='owner-detail'>";
//		html += "		<div class='owner-thumb'>"+user_info.user_img+"</div>";
//		html += "		<ul>";
//		html += "			<li class='kname'>"+user_info.name+"</li>";
//		html += "			<li>"+user_info.dept+"/"+user_info.company+"</li>";
//		html += "			<li class='email'>"+user_info.email+"</li> 	";
//		html += "			<li>"+user_info.mobile+"</li>";
//		html += "		</ul>";
//		
//		html += "		<div class='owner-btns'>";
//		html += "			<div class='wrap-btns'>";
//		html += "				<button class='ico btn-chat' data='"+ky+"' title='"+gap.lang.startChat+"'>채팅</button>";
//		html += "				<button class='ico btn-mail' data='"+user_info.email+"' data2='"+user_info.name+"' title='"+gap.lang.sendmail+"'>메일</button>";
//	//	html += "				<button class='btn-invite-del'>삭제하기</button>";
//		html += "			</div>";
//		html += "		</div>";
//
//		html += "	</div>";
//		html += "</div>";
//		
//		
//		html += "<div class='owner-info invite-info' id='memberframe' style='padding-right:0px; height:calc(100% - 160px)'>";
////		if (is_admin){
////			html += "<h2>Member <span id='right_frame_member_count'>("+members.length+")</span><button class='btn-invite-add'>초대하기</button></h2>";
////		}else{
////			html += "<h2>Member <span id='right_frame_member_count'>("+members.length+")</span></h2>";
////		}
//		
//		html += "<h2>Member <span id='right_frame_member_count'>("+members.length+")</span><button id='members_fnc_todo' class='ico btn-more' style='right:20px'>더보기</button></h2>";
//		
//	//	html += "<button class='ico btn-right-close' id='member_layer_close'>닫기</button>";
//		
//		for (var i = 0 ; i < members.length; i++){
//			var member = members[i];
//			
//			var user_info = gap.user_check(member);
//			
//			var ky = user_info.ky;			
//			var ex = user_info.email.replace("@","").replace(" ","");
//			
//			html += "	<div class='owner-detail' style='margin-right:20px' >";
//		//	html += "		<button class='btn-invite-del' data='"+email+"'>삭제하기</button>";		
//			html += "		<div class='owner-thumb'>"+user_info.user_img+"</div>";
//			html += "		<ul>";
//			html += "			<li class='kname'>"+user_info.name+"</li> ";
//			html += "			<li>"+user_info.dept+"/"+user_info.company+"</li>";
//			html += "			<li class='email'>"+user_info.email+"</li> ";
//			html += "			<li>"+user_info.mobile+"</li>";
//			html += "		</ul>";		
//			
//			html += "		<div class='owner-btns'>";
//			html += "			<div class='wrap-btns'>";
//			html += "				<button class='ico btn-chat' data='"+ky+"' title='"+gap.lang.startChat+"'>채팅</button>";
//			html += "				<button class='ico btn-mail' data='"+user_info.email+"' data2='"+user_info.name+"' title='"+gap.lang.sendmail+"'>메일</button>";
//			if (is_admin){
//				html += "				<button class='btn-invite-del' data='"+user_info.email+"' title='"+gap.lang.basic_delete+"'>삭제하기</button>";
//			}
//			
//			html += "			</div>";
//			html += "		</div>";
//			
//			html += "	</div>";
//		}
//
//		html += "</div>";
		
		html += "	<div class='aside-wide' style='height:100%' >";
		html += "		<div class='close_box'><button type='button' class='pop_btn_close' id='member_layer_close9'></button></div>";
		html += "		<div class='office_const'>";
		html += "			<h2>Owner</h2>";
		html += "			<div class='o_const_list' style='margin-top:10px'>";
		html += "				<div class='office_mem_card'>";
		html += "					<div class='office_prof user'>";
		html += '						<div class="photo-wrap" style="background-image:url(' + gap.person_photo_url(owner) + '),url(../resource/images/none.jpg);"></div>';				
		html += "						<span data-status='status_"+user_info.ky+"' style='top:6px; left:7px' class='status offline'></span>";
		html += " 						<button data-phone='phone_"+user_info.ky+"' type='button' style='position:absolute'></button>";
		html += "					</div>";
		html += "					<div class='office_right' style='width: 64%;'>";
		html += "						<div class='office_mem_name'>";
		html += "							<span data-day='day_"+owner.ky+"' style='display:none'></span>";
		html += "							"+user_info.name+"";
		html += "							<span class='rank'>"+owner.jt+"</span>";
		html += "						</div>";
		html += "						<div class='office_mem_info'>";
		html += "							<p>"+owner.dp+"</p>";
		html += "							<p class='company'>"+owner.cp+"</p>";
		html += "						</div>";		
		html += "					</div>";
		html += "					<div class='abs hover-box'>";
		html += "						<div class='inner f_between f_middle'>";
		html += "							<span class='ico ico-chat' title='"+gap.lang.startChat+"'>채팅</span>";
	//	if (use_tel == "1"){
			html += "							<span class='ico ico-phone' data-ky='"+user_info.ky+"' title='"+gap.lang.mobile+"'>전화</span>";
	//	}		
		html += "							<span class='ico ico-profile' data-ky='"+owner.ky+"' title='"+gap.lang.openprofile+"'>프로필</span>";
		
		if (is_admin){
			html += "					<div class='group_right_pop' style='position:unset;width:0px' id='owner-info'><div class='user-remove' data-key='"+owner.ky+"'><span></span></div></div>";
			
		}
		
		html += "						</div>";
		html += "					</div>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		
		var lists = [];
		lists.push(owner.ky);
		
		
	//	var members = list.member;
		if ( (typeof(members) == "undefined") || (members.length == 0)){
			//return false;
		}else{
			
			html += "<div class='office_part' style='height:100%' >";
			html += "	<h2 style='margin-bottom:10px'>Member <span id='right_frame_member_count'>("+members.length+")</span><button class='ico btn-more bl' id='members_fnc_todo'>더보기</button></h2>";
			html += "	<div class='o_p_list' style='height : calc(100% - 280px); padding:0 17px' id='memberframe2'>";
			html += "";
			
			members = sorted=$(members).sort(gap.sortNameDesc);	
			
			for (var i = 0 ; i < members.length; i++){
				var member = members[i];
				
				lists.push(member.ky);
				
				var user_info = gap.user_check(member);
				
				var ky = user_info.ky;			
				var ex = user_info.email.replace("@","").replace(" ","");
				
				html += "		<div class='office_mem_card' style='margin:5px 15px 0px 4px'>";
				html += "			<div class='office_prof user'>";
			//	html += "				<div class='owner-thumb'>"+user_info.user_img+"</div>";
				html += '				<div class="photo-wrap" style="background-image:url(' + gap.person_photo_url(member) + '),url(../resource/images/none.jpg);"></div>'
				html += "				<span data-status='status_"+user_info.ky+"' class='status online' style='top:6px; left:7px'></span>";
				html += "				<button data-phone='phone_"+user_info.ky+"' type='button' style='position:absolute'></button>";
				html += "			</div>";
				html += "			<div class='office_right' style='width: 64%;'>";
				html += "				<div class='office_mem_name'>";
				html += "					<span data-day='day_"+user_info.ky+"'style='display:none'></span>";
				html += "					"+user_info.name+"";
				html += "					<span class='rank'>"+user_info.jt+"</span>";
				html += "				</div>";
				html += "				<div class='office_mem_info'>";
				html += "					<p>"+user_info.dept+"</p>";
				html += "					<p class='company'>"+user_info.company+"</p>";
				html += "				</div>";
				html += "			</div>";
				html += "			<div class='abs hover-box'>";
				html += "				<div class='inner f_between f_middle'>";
				html += "					<span class='ico ico-chat' title='"+gap.lang.startChat+"' data-name='"+user_info.name+"' data-key='"+user_info.ky+"' >채팅</span>";
		//		if (use_tel == "1"){
					html += "					<span class='ico ico-phone' data-ky='"+user_info.ky+"'  title='"+gap.lang.mobile+"' >전화</span>";
		//		}				
				html += "					<span class='ico ico-profile' data-ky='"+user_info.ky+"' title='"+gap.lang.openprofile+"' >프로필</span>";
				
				if (is_admin){
					html += "					<div class='group_right_pop' style='position:unset;width:0px'><div class='user-remove' data-key='"+user_info.ky+"'><span></span></div></div>";
					
				}
				
				
				html += "				</div>";
				html += "			</div>";
				html += "		</div>";
				
			}
			
			html += "	</div>";
			html += "</div>";
			
		}
		
		
		
		$("#todo_top_member_count").html("(" + (members.length+1) + ")");
					
		$("#center_content").css("width","calc(100% - 315px)");
		$("#sub_channel_content").css("width","calc(100% - 315px)");   //채널에서 To Do 우측 프레임 닫았다가 다시 열때 사용함
		
		$("#user_profile").css("width", "314px");
	//	$("#user_profile").css("height", "calc(100% - 30px)");
		$("#user_profile").css("overflow-y", "hidden");
	//	$(".right-area").hide();
		$("#user_profile").show();
		$("#user_profile").off();
		$("#user_profile").removeAttr("class");
		$("#user_profile").addClass("right-area channel-info");
		$("#user_profile").html(html);
		
		
		
		//상태값을 검사한다.
		var opt = 1;
		var ty = "channel";
		gap.status_check(lists, opt, ty);	
		
		
		
		
		$("#memberframe2").mCustomScrollbar({
			theme:"dark",
			autoExpandScrollbar: true,
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
		
		
	//	gap.draw_qtip_right(".owner-btns .btn-chat", gap.lang.startChat);	
	//	gap.draw_qtip_right(".owner-btns .btn-mail", gap.lang.sendmail);	
	//	gap.draw_qtip_right(".owner-btns .btn-invite-del", gap.lang.basic_delete);	
		
		$("#members_fnc_todo").on("click", function(){			
			var html = "";
			html += "<div class='layer layer-menu opt-enter' id='member_list_opt_box'>";
			html += "<ul>";		
			html += "<li style='padding-left : 10px !important; text-align:left' onclick='gTodo.all_send_opt_todo(1)'>"+gap.lang.groupmail+"</li>";
		//	html += "<li style='padding-left : 10px !important; text-align:left' onclick='gTodo.all_send_opt_todo(2)'>"+gap.lang.groupchat+"</li>";			
			if (is_admin){
				html += "<li style='padding-left : 10px !important; text-align:left' onclick='gBody3.all_send_opt_box(3)'>"+gap.lang.member_invite+"</li>";		
			}
			html += "</ul>";
			html += "</div>"		
			
			$("#members_fnc_todo").qtip({
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
		
		
			
		gTodo.__todo_members_event();
	},
	
	
	"all_send_opt_todo" : function(opt){	
		//멤버에서 more버튼 클릭한 결과 처리 함수
		
		
		var info = gTodo.cur_project_info;
		
		var owner = info.owner;
		var members = info.member;
		
		var att_list = members.concat(owner);
		
		if (opt == "1"){
			//참석자 전체 메일 발송
			var all_sender_list = "";
			for (var i = 0 ; i < att_list.length; i++){
				var info = att_list[i];
				var name = info.nm;
				
			//	if (gap.curLang != "ko"){
				if (gap.cur_el != info.el){
					name = info.enm;
				}
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
		
			$("#user_profile").show();

			$("#sub_channel_content").hide();
			$("#box_search_content").hide();
			$(".left-area").css("width", "calc(100% - " + gap.right_page_width + ")");
				
			$("#add_group_btn").show();		
			$(".chat-bottom").show();
					
			gap.show_content("subsearch");
			gTodo.search_type = "makeroom";
			gTodo.open_add_member_search_layer("makeroom");
			
			//멤버를 선택 창에 추가한다.
			
			for (var i = 0 ; i < att_list.length; i++){
				var info = att_list[i].ky;
				var name = att_list[i].nm;
				var company = att_list[i].cp;
				
				if (info != gap.search_cur_ky()){
					var id = gap.seach_canonical_id(info);
					id = gap.encodeid(id);
					var callid = id;
					
					var person_img = gap.person_profile_uid(info);

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
			gTodoC.modify_project(gTodo.cur_todo_code);		
		}
	},
	
	
	
	
	
	
	
	
	
	
	
	"__todo_members_event" : function(){
		
		
		
		$("#member_layer_close9").off();
		$("#member_layer_close9").on("click", function(e){
			
			$("#center_content").css("width","calc(100% - 10px)");
			$("#sub_channel_content").css("width","calc(100% - 10px)");
			
			$("#user_profile").hide();
		});
		
		
		
		
		
		
		$("#user_profile .user-remove").off();
		$("#user_profile .user-remove").on("click", function(e){
			
			//이함수로 통일한다.
			gBody3.member_process(e);	
			
			return false;
			
			var _self = $(this);
			var email = $(e.currentTarget).data("key");
			gTodo.ce = email;
			var url = gap.channelserver + "/delete_member_todo.km";
			var data = JSON.stringify({
				email : email,
				project_code : gTodo.cur_todo_code
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
						$(_self).parent().parent().parent().parent().remove();
						
						var count = $("#memberframe2 .user-remove").length;
						$("#right_frame_member_count").html("("+count+")");
						$("#todo_top_member_count").html("("+(count+1)+")");
						
					
						gBody3.channel_members_delete(gTodo.cur_todo_code, gTodo.ce);
						
					}
				},
				error : function(e){
					gap.error_alert();
				}
			})
		});
		
		
		
		
		
		
//		$(".owner-btns .btn-invite-del").off();
//		$(".owner-btns .btn-invite-del").on("click", function(e){
//			
//			var _self = $(this);
//			var email = $(e.currentTarget).attr("data");
//			var url = gap.channelserver + "/delete_member_todo.km";
//			var data = JSON.stringify({
//				email : email,
//				project_code : gTodo.cur_todo_code
//			});
//			$.ajax({
//				type : "POST",
//				dataType : "json",
//				contentType : "applcation/json; charset=utf-8",
//				url : url,
//				data : data,
//				success : function(res){
//					if (res.result == "ERROR"){
//						gap.error_alert();
//					}else{
//						$(_self).parent().parent().parent().remove();
//						
//						var count = $(".invite-info .btn-invite-del").length;
//						$("#right_frame_member_count").html("("+count+")");
//						$("#todo_top_member_count").html("("+(count+1)+")");
//					}
//				},
//				error : function(e){
//					gap.error_alert();
//				}
//			})
//		});
		
		
//		$(".owner-btns .btn-mail").off();
//		$(".owner-btns .btn-mail").on("click", function(e){
//			var _self = $(this);
//			var email = $(e.currentTarget).attr("data");
//			var name = $(e.currentTarget).attr("data2");
//			
//			gBody.open_email_send(encodeURIComponent(name) + "<" + email + ">");	
//		});
//		
//		$(".owner-btns .btn-chat").off();
//		$(".owner-btns .btn-chat").on("click", function(e){
//			
//			var ky = $(e.currentTarget).attr("data");
//		
//			var room_key = _wsocket.make_room_id(ky); // + "^" + gap.userinfo.rinfo.cpc;
//			//대상자 정보를 넣어주서야 새창에서 기존에 채팅방이 없는 경우 해당 사용자와 1:1 방을 만들고 들어간다.
//			gBody.cur_chat_user = ky;
//
//			var url = cdbpath + "/chat?readform&key=" + $.base64.encode(room_key);
//			gap.open_subwin(url, "995","900", "yes" , "", "yes");			
//		});
		
		
		$(".btn-invite-add").off();
		$(".btn-invite-add").on("click", function(e){
			gTodoC.modify_project(gTodo.cur_todo_code);
		});
		
		
		
		
		$(".owner-btns .btn-mail").off();
		$(".owner-btns .btn-mail").on("click", function(e){
			
			var _self = $(this);
			var email = $(e.currentTarget).attr("data");
			var name = $(e.currentTarget).attr("data2");
			
			gap.open_email_send(encodeURIComponent(name) + "<" + email + ">");	
		});
		
		$(".ico-chat").off();
		$(".ico-chat").on("click", function(e){
			
			gap.cur_room_att_info_list = [];
			
			var ky = $(e.currentTarget).data("key");
			var name = $(e.currentTarget).data("name");
			
			var room_key = _wsocket.make_room_id(ky); // + "^" + gap.userinfo.rinfo.cpc;
			//대상자 정보를 넣어주서야 새창에서 기존에 채팅방이 없는 경우 해당 사용자와 1:1 방을 만들고 들어간다.
			
		
			gap.cur_chat_user = ky;
			gap.cur_chat_name = name;

//			var url = cdbpath + "/chat?readform&key=" + $.base64.encode(room_key);
//			gap.open_subwin(url, "1200","850", "yes" , "", "yes");	
			
			gap.chatroom_create_after2(room_key);
		});
		
		$(".ico-phone").off();
		$(".ico-phone").on("click", function(e){
			//전화 걸기
			var ky = $(e.currentTarget).data("ky");
			gap.phone_call(ky, "");
		});
		
		$(".ico-profile").off();
		$(".ico-profile").on("click", function(e){
			//프로필 보기
			var ky = $(e.currentTarget).data("ky");
			gap.showUserDetailLayer(ky);
		});
		
		
	},
	
	
	"todo_channel" : function(){
		var html = "";
		
		
		html += "<div class='right-channel-header'>";
		html += "<h2>"+gap.lang.channel+"</h2>";
		html += "	<button class='ico btn-right-close' id='channel_layer_close'>닫기</button>";
		html += "	<div class='selectbox'>";
		html += "		<select id='channel_list_opt'>";
		html += "			<option value=''>"+gap.lang.channel_name+"</option>";
		html += "		</select>";
		html += "	</div>";
		html += "   <button class='btn-all-fold on' id='channel_excol'><span id='all_reply_excol'>"+gap.lang.allfold+"</span></button> <!-- 클릭 시 on 클릭시 추가, 전체댓글 보기 텍스트 변경 -->"
		html += "</div>";
		html += "<div class='chat-area' id='todo_channel_top' style='margin:10px; padding:0 0 0 10px; height:calc(100% - 30px)'>";
		html += "	<div class='wrap-channel' id='todo_channel_list' style='height:calc(100% - 40px)'>";
		html += "	</div>";
		html += "</div>";
		
		
		$("#center_content").removeAttr("class");
		$("#center_content").addClass("left-area todo todo-channel");
		$("#center_content").css("width", "calc(60% - 10px)");
				
		
		$("#user_profile").css("width", "40%");
		$(".right-area").hide();
		$("#channel_right").show();
		$("#user_profile").show();
		$("#user_profile").off();
		$("#user_profile").removeAttr("class");
		$("#user_profile").addClass("right-area chatting channel");
	//	$("#user_profile").css("width", "290px");
		$("#user_profile").css("overflow-y","hidden");
//		$("#todo_channel_top").css("height","calc(100% - 100px)");
//		$("#todo_channel_list").css("height","calc(100% - 120px)");
		
		$("#user_profile").html(html);
		
		
		
		$("#todo_channel_top").droppable({
			activeClass : 'active',
			hoverClass : 'chat_hovered',
		//	accept : ".drop",
			
					
			drop : function(event, ui){
				
			
				gTodo.iscancel2 = true;
				//$(this).sortable('cancel');
			
				//ui.helper.remove();
				//return false;
				var ch_code = $("#channel_list_opt").val();
				var ch_name = $("#channel_list_opt option:checked").text();
				
				//아래 설정을 해야 gBody3에서 인식한다. send_socket에서
				gBody3.select_channel_code = ch_code;
				gBody3.select_channel_name = gap.textToHtml(ch_name);
								
				var select_todo_id = ui.helper.children().attr("id").replace("card_","");
				
			/*	var data2 = JSON.stringify({
					email : gap.userinfo.rinfo.em,
					key : select_todo_id
				});	*/			
				
				var data2 = JSON.stringify({
					key : select_todo_id
				});	
				
				var url = gap.channelserver + "/search_item_todo.km";
				$.ajax({
					type : "POST",
					dataType : "json",
					contentType : "application/json; charset=utf-8",
					url : url,
					data : data2,
					beforeSend : function(xhr){
						xhr.setRequestHeader("auth", gap.get_auth());
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
					},
					success : function(res){
						
						var dx = res.data;
						dx.type = "todo";
					
						var xdata = JSON.stringify({
							"type" : "msg",
							"channel_code" : ch_code,
							"channel_name" : ch_name,
							"email" : gap.userinfo.rinfo.em,
							"ky" : gap.userinfo.rinfo.ky,
							"owner" : gap.userinfo.rinfo,
							"content" : "",
							"edit" : "",
							"msg_edit" : "",
							"id" : "",
							"ex" : dx
						});
						
						
						gBody3.send_msg_to_server(xdata);
						
						$("#mshare_close").click();				
					},
					error : function(e){
						gap.error_alert();
					}
				});
				
				
			}
		});
		
		
				
		gBody3.channel_item_add();
				
		//로컬 스토리지에 저장되어 있는 default channel값을 가져온다.
		
		
		var ls = localStorage.getItem("todocode");
		if (ls != null && ls != ""){
			var channel_code = "";
			var channel_name = "";
			
			if (typeof(gTodo.cur_project_info.opt) != "undefined"){
				channel_code = gTodo.cur_todo_code;
				channel_name = gTodo.cur_todo_name;			
			}else{
				channel_code = ls.split("-spl-")[0];
				channel_name = ls.split("-spl-")[1];
			}
			
			$('#channel_list_opt').val(channel_code);
			
			 gBody3.select_channel_code = channel_code;
		     gBody3.select_channel_name = channel_name;
		     id = channel_code;
			
			gBody3.channel_viewer(channel_code,"todo_channel_list", "todo_channel_top");
		}
		
		gTodo.__todo_channel_event();		
		
	},
	
	
	"__todo_channel_event" : function(){	
		$("#channel_layer_close").off();
		$("#channel_layer_close").on("click", function(e){
			$("#center_content").css("width","calc(100% - 10px)");
			//$("#user_profile").hide();
			$("#btn_todo_invite").click();
		});
		
		$("#channel_excol").off();
		$("#channel_excol").on("click", function(e){
			
			if ($(this).hasClass("on")){
				$(this).removeClass("on");
				$("#all_reply_excol").html(gap.lang.allexpand);
				
				$(".message-reply").fadeOut();
				$(".btn-reply-fold").find("span").first().text(gap.lang.reply + " " + gap.lang.ex);
				
				$(".btn-reply-fold").addClass("btn-reply-expand");
				$(".btn-reply-fold").removeClass("btn-reply-fold");

			}else{
				$(this).addClass("on");
				$("#all_reply_excol").html(gap.lang.allfold);
				
				$(".message-reply").fadeIn();
				$(".btn-reply-expand").find("span").first().text(gap.lang.reply + " " + gap.lang.fold);
				$(".btn-reply-expand").addClass("btn-reply-fold");
				$(".btn-reply-expand").removeClass("btn-reply-expand");
				
				

			}
		});
	},
	
	
	"todo_stars" : function(){
		
		var html = "";
		
		html += "<div class='todo-bookmark'>";
		html += "	<h2>즐겨찾기</h2>";
		html += "	<button class='ico btn-right-close' id='star_layer_close'>닫기</button>";
		html += "	<div class='todo-option'>";
		html += "		<div class='todo-align'>";
		html += "			<div class='selectbox'>";
		html += "				<select>";
		html += "					<option value=''>AP-ON제안</option>";
		html += "				</select>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		html += "	<div class='card-list'>";
		html += "		<ul class='card'>";
		html += "			<li>";
		html += "				<div class='color-bar c3'></div>";
		html += "				<button class='ico btn-more'>더보기</button>";
		html += "				<span class='name'>김소현님<em class='team'>대리/기술전략팀</em></span>";
		html += "				<h3>2021년 디자인 트렌드 조사</h3>";
		html += "				<span class='todo-period'>2020.12.16 ~ 2020.12.18 (3일)</span>";
		html += "				<dl class='icons'>";
		html += "					<dd><span class='ico ico-clip'></span><em>0</em></dd>";
		html += "					<dd><span class='ico ico-reply'></span><em>2</em></dd>";
		html += "					<dd><span class='ico ico-checklist'></span><em>1/2</em></dd>";
		html += "				</dl>";
		html += "			</li>";
		html += "			<li>";
		html += "				<div class='color-bar c1'></div>";
		html += "				<button class='ico btn-more'>더보기</button>";
		html += "				<span class='name'>김소현님<em class='team'>대리/기술전략팀</em></span>";
		html += "				<h3>2021년 디자인 트렌드 조사</h3>";
		html += "				<span class='todo-period'>2020.12.16 ~ 2020.12.18 (3일)</span>";
		html += "				<dl class='icons'>";
		html += "					<dd><span class='ico ico-clip'></span><em>0</em></dd>";
		html += "					<dd><span class='ico ico-reply'></span><em>2</em></dd>";
		html += "					<dd><span class='ico ico-checklist'></span><em>1/2</em></dd>";
		html += "				</dl>";
		html += "			</li>";
		html += "		</ul>";
		html += "	</div>";
		html += "</div>";
		
		
		
		$("#center_content").css("width","calc(100% - 300px)");
	//	$("#user_profile").css("width", "290px");
		$(".right-area").hide();
		$("#user_profile").css("width", "290px");
		$("#user_profile").show();
		$("#user_profile").off();
		$("#user_profile").removeAttr("class");
		$("#user_profile").addClass("right-area channel-info");
		$("#user_profile").html(html);
		
		gTodo.__todo_stars_event();
	},
	
	"__todo_stars_event" : function(){
		//$('select').material_select();
		
		$("#star_layer_close").off();
		$("#star_layer_close").on("click", function(e){
			$("#center_content").css("width","calc(100% - 10px)");
			$("#user_profile").hide();
		});
	},
	
	
	"code_change_status" : function(opt){
		var res = new Object();
		
		if (opt == "1"){
			res.txt = gap.lang.wait;
			res.style = "wait";
		}else if (opt == "2"){
			res.txt = gap.lang.doing;
			res.style = "continue";
		}else if (opt == "3"){
			res.txt = gap.lang.done;
			res.style = "complete";
		}else if (opt == "0"){
			res.txt = gap.lang.temps;
			res.style = "temp";
		}
		
		return res;
	},
	
	
	"compose_todo_channel" : function(){
		var html = '';
		html += '<h2>' + gap.lang.addtodo + '</h2>';
		html += '<button id="close_todo_channel" class="ico btn-close">닫기</button>';
		html += '<div class="input-field">';
		html += '	<input type="text" class="formInput"  autocomplete="off" id="new_todo_name">';
		html += '	<label for="new_todo_name" class="">' + gap.lang.todo + '</label>';
		html += '	<span class="bar"></span>';
		html += '</div>';
//		html += '<div class="calendar-date">';
//		html += '	<h3>' + gap.lang.todo_period + '</h3>';
//		html += '	<p>' + start_date + ' ~ ' + end_date + '</p>';
//		html += '</div>';
		html += '<div class="layer-bottom">';
		html += '	<button id="ok_todo_channel"><strong>' + gap.lang.OK + '</strong></button>';
		html += '	<button id="cancel_todo_channel"><span>' + gap.lang.Cancel + '</span></button>';
		html += '</div>';
		$('#compose_todo_calendar').html(html);
		
		
				
		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#compose_todo_calendar')
		.css({'zIndex': parseInt(max_idx) + 1})
		.fadeIn();
		
		
		
		$("#new_todo_name").focus();		
		$("#new_todo_name").bind("keypress", function(e){
			if (e.keyCode == 13){
				$("#ok_todo_channel").click();
			}
		});
		
		$("#close_todo_channel").on("click", function(){
			gap.close_layer('compose_todo_calendar');
		});
		$("#cancel_todo_channel").on("click", function(){
			gap.close_layer('compose_todo_calendar');
		});
		$("#ok_todo_channel").on("click", function(){
	
			var title = $("#new_todo_name").val();
			if (title == ""){
				gap.gAlert(gap.lang.input_title);
				return;
			}
			var status = "1";
			var tlist = gTodo.get_column_list_ids_list("list_card_" + status);
//			var startdate = moment.utc(start_date).format();
//			var enddate = moment.utc(end_date).format();
//			var cal_end_date = moment(end_date).add(1, "days").format("YYYY-MM-DD")
			
			
			var url = gap.channelserver + "/make_item_todo.km";
			var data = JSON.stringify({
				title : title,
				owner : gap.userinfo.rinfo,
				status : status,
				project_code : gBody3.select_channel_code,
				project_name : gBody3.select_channel_name,
				tlist : tlist,
				priority : 3,
				checklist : [],
				file : [],
				reply : []
			});
			$.ajax({
				type : "POST",
				datatype : "json",
				contentType : "application/json; charset=utf-8",
				url : url,
				data : data,
				success : function(res){
					if (res.result == "OK"){
						
						var sid = res.data.id;
						//해당 채널에 메시지로 전달해야 한다.
					/*	var data2 = JSON.stringify({
							email : gap.userinfo.rinfo.em,
							key : sid
						});*/
						
						var data2 = JSON.stringify({
							key : sid
						});
						
						var url = gap.channelserver + "/search_item_todo.km";
						$.ajax({
							type : "POST",
							dataType : "json",
							contentType : "application/json; charset=utf-8",
							url : url,
							data : data2,
							beforeSend : function(xhr){
								xhr.setRequestHeader("auth", gap.get_auth());
								xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
							},
							success : function(res){
								
								var dx = res.data;
								dx.type = "todo";
							
								var xdata = JSON.stringify({
									"type" : "msg",
									"channel_code" : gBody3.select_channel_code,
									"channel_name" : gBody3.select_channel_name,
									"email" : gap.userinfo.rinfo.em,
									"owner" : gap.userinfo.rinfo,
									"ky" : gap.userinfo.rinfo.ky,
									"content" : "",
									"edit" : "",
									"msg_edit" : "",
									"id" : "",
									"ex" : dx
								});
								
								
								gBody3.send_msg_to_server(xdata);								
										
								setTimeout(function(){
									gTodo.todo_show_other_app(res.data._id.$oid);
								}, 1000);
								
								//창을 닫는다.
								gap.close_layer('compose_todo_calendar');
							},
							error : function(e){
								gap.error_alert();
							}
						})
						
						
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			})			
		});
	},
	
	
	
	"compose_layer" : function(id){
		
		//	if (id == ""){
			//신규 작성을 요청한 경우
	//		gTodo.compose_layer_draw();
	//	}else{
			//기존 데이터 조회를 요청한 경우
			var data = JSON.stringify({
				key : id
			});
			var url = gap.channelserver + "/search_item_todo.km";
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				url : url,
				data : data,
				success : function(res){
					if (res.result == "OK"){
						if (typeof(res.data.project_info) == "undefined"){
							gap.gAlert(gap.lang.donplz);
							return false;
						}
						
						$("#compose_todo").css("left", "68px");
						gTodo.cur_project_info = res.data.project_info;
						gTodo.compose_layer_draw(res);
					}else{
						gap.gAlert(gap.lang.donplz);
					}
					
				},
				error : function(e){
					gap.error_alert();
				}
			});
	//	}	
	},
	
	"compose_layer_draw-------------------------------------------------------------" : function(item){
		
		var html = "";
		
		html += "<div id='container' class='mu_container mu_work mu_pjt'>";
		html += "	<div class='contents scroll'>";
		html += "		<div id='layerDimDark'></div>";
		html += "		<div class='layer_wrap center dsw_pjt_wr' style='width: 1018px;'>";
		html += "			<div class='layer_inner rel'>";
		html += "				<div class='layer_head'>";
		html += "					<div class='pop_fav_more_btn'>";
		html += "						<div class='pop_fav_more'>";
		html += "							<div class='share'>채널로 업무 공유</div>";
		html += "							<div>업무 즐겨찾기</div>";
		html += "						</div>";
		html += "					</div>";
		html += "					<div class='pop_btn_close'></div>";
		html += "					<h4>";
		html += "						DSW PJT";
		html += "						<button type='button' class='dsw_fav_btn'></button>";
		html += "					</h4>";
		html += "				</div>";
		html += "				<div class='pop_w_wr'>";
		html += "					<div class='layer_cont left'>";
		html += "						<div class='pjt_work_tit'>";
		html += "							<span>업무명</span>";
		html += "							<input type='text' name='' id='' class='input' placeholder='업무 제목을 입력해 주세요.'>";
		html += "						</div>";
		html += "						<div class='pjt_work_explan'>";
		html += "							<span>업무 설명</span>";
		html += "							<input type='text' name='' id='' class='input' placeholder='업무 설명을 입력해 주세요.'>";
		html += "						</div>";
		html += "						<div class='work-tab rel'>";
		html += "							<ul class='flex'>";
		html += "								<li class='on'><span>"+gap.lang.rdata+"<p id='rdata_cnt'>(1)</p></span></li>";
		html += "								<li><span>"+gap.lang.checklist+"<p id='rdata2_cnt'>(2)</p></span></li>";
		html += "							</ul>";
		html += "							<button type='button' class='more_btn abs'>";
		html += "								<span class='more_icon'></span>";
		html += "								<span>파일추가</span>";
		html += "							</button>";
		html += "						</div>";
		html += "						<div class='pjt_file_cont'>";
		html += "							<div class='pjt_file_list'>";
		html += "								<div class='pjt_file_count rel'>";
		html += "									<div class='p_file_icon'></div>";
		html += "									<div class='p_file_r_box'>";
		html += "										<div class='p_file_tit'>";
		html += "											<span>[DSW] 취합 수정사항.pdf</span>";
		html += "											<span class='volume'>(9KB)</span>";
		html += "										</div>";
		html += "										<div class='p_file_info'>";
		html += "											<span class='p_file_name'>김윤기</span>";
		html += "											<span class='p_file_time'>2022.06.02.08:55</span>";
		html += "										</div>";
		html += "									</div>";
		html += "									<button type='button' class='p_file_more_btn abs'></button>";
		html += "								</div>";
		html += "								<div class='pjt_file_count rel'>";
		html += "									<div class='p_file_icon'></div>";
		html += "									<div class='p_file_r_box'>";
		html += "										<div class='p_file_tit'>";
		html += "											<span>[DSW] 취합 수정사항.pdf</span>";
		html += "											<span class='volume'>(9KB)</span>";
		html += "										</div>";
		html += "										<div class='p_file_info'>";
		html += "											<span class='p_file_name'>김윤기</span>";
		html += "											<span class='p_file_time'>2022.06.02.08:55</span>";
		html += "										</div>";
		html += "									</div>";
		html += "									<button type='button' class='p_file_more_btn abs'></button>";
		html += "								</div>";
		html += "								<div class='pjt_file_count rel'>";
		html += "									<div class='p_file_icon'></div>";
		html += "									<div class='p_file_r_box'>";
		html += "										<div class='p_file_tit'>";
		html += "											<span>[DSW] 취합 수정사항.pdf</span>";
		html += "											<span class='volume'>(9KB)</span>";
		html += "										</div>";
		html += "										<div class='p_file_info'>";
		html += "											<span class='p_file_name'>김윤기</span>";
		html += "											<span class='p_file_time'>2022.06.02.08:55</span>";
		html += "										</div>";
		html += "									</div>";
		html += "									<button type='button' class='p_file_more_btn abs'></button>";
		html += "								</div>";
		html += "								<div class='pjt_file_count rel'>";
		html += "									<div class='p_file_icon'></div>";
		html += "									<div class='p_file_r_box'>";
		html += "										<div class='p_file_tit'>";
		html += "											<span>[DSW] 취합 수정사항.pdf</span>";
		html += "											<span class='volume'>(9KB)</span>";
		html += "										</div>";
		html += "										<div class='p_file_info'>";
		html += "											<span class='p_file_name'>김윤기</span>";
		html += "											<span class='p_file_time'>2022.06.02.08:55</span>";
		html += "										</div>";
		html += "									</div>";
		html += "									<button type='button' class='p_file_more_btn abs'></button>";
		html += "								</div>";
		html += "								<div class='pjt_file_count rel'>";
		html += "									<div class='p_file_icon'></div>";
		html += "									<div class='p_file_r_box'>";
		html += "										<div class='p_file_tit'>";
		html += "											<span>[DSW] 취합 수정사항.pdf</span>";
		html += "											<span class='volume'>(9KB)</span>";
		html += "										</div>";
		html += "										<div class='p_file_info'>";
		html += "											<span class='p_file_name'>김윤기</span>";
		html += "											<span class='p_file_time'>2022.06.02.08:55</span>";
		html += "										</div>";
		html += "									</div>";
		html += "									<button type='button' class='p_file_more_btn abs'></button>";
		html += "								</div>";
		html += "								<div class='pjt_file_count rel'>";
		html += "									<div class='p_file_icon'></div>";
		html += "									<div class='p_file_r_box'>";
		html += "										<div class='p_file_tit'>";
		html += "											<span>[DSW] 취합 수정사항.pdf</span>";
		html += "											<span class='volume'>(9KB)</span>";
		html += "										</div>";
		html += "										<div class='p_file_info'>";
		html += "											<span class='p_file_name'>김윤기</span>";
		html += "											<span class='p_file_time'>2022.06.02.08:55</span>";
		html += "										</div>";
		html += "									</div>";
		html += "									<button type='button' class='p_file_more_btn abs'></button>";
		html += "								</div>";
		html += "								<div class='pjt_file_count rel'>";
		html += "									<div class='p_file_icon'></div>";
		html += "									<div class='p_file_r_box'>";
		html += "										<div class='p_file_tit'>";
		html += "											<span>[DSW] 취합 수정사항.pdf</span>";
		html += "											<span class='volume'>(9KB)</span>";
		html += "										</div>";
		html += "										<div class='p_file_info'>";
		html += "											<span class='p_file_name'>김윤기</span>";
		html += "											<span class='p_file_time'>2022.06.02.08:55</span>";
		html += "										</div>";
		html += "									</div>";
		html += "									<button type='button' class='p_file_more_btn abs'></button>";
		html += "								</div>";
		html += "								<div class='pjt_file_count rel'>";
		html += "									<div class='p_file_icon'></div>";
		html += "									<div class='p_file_r_box'>";
		html += "										<div class='p_file_tit'>";
		html += "											<span>[DSW] 취합 수정사항.pdf</span>";
		html += "											<span class='volume'>(9KB)</span>";
		html += "										</div>";
		html += "										<div class='p_file_info'>";
		html += "											<span class='p_file_name'>김윤기</span>";
		html += "											<span class='p_file_time'>2022.06.02.08:55</span>";
		html += "										</div>";
		html += "									</div>";
		html += "									<button type='button' class='p_file_more_btn abs'></button>";
		html += "								</div>";
		html += "								<div class='pjt_file_count rel'>";
		html += "									<div class='p_file_icon'></div>";
		html += "									<div class='p_file_r_box'>";
		html += "										<div class='p_file_tit'>";
		html += "											<span>[DSW] 취합 수정사항.pdf</span>";
		html += "											<span class='volume'>(9KB)</span>";
		html += "										</div>";
		html += "										<div class='p_file_info'>";
		html += "											<span class='p_file_name'>김윤기</span>";
		html += "											<span class='p_file_time'>2022.06.02.08:55</span>";
		html += "										</div>";
		html += "									</div>";
		html += "									<button type='button' class='p_file_more_btn abs'></button>";
		html += "								</div>";
		html += "								<div class='pjt_file_count rel'>";
		html += "									<div class='p_file_icon'></div>";
		html += "									<div class='p_file_r_box'>";
		html += "										<div class='p_file_tit'>";
		html += "											<span>[DSW] 취합 수정사항.pdf</span>";
		html += "											<span class='volume'>(9KB)</span>";
		html += "										</div>";
		html += "										<div class='p_file_info'>";
		html += "											<span class='p_file_name'>김윤기</span>";
		html += "											<span class='p_file_time'>2022.06.02.08:55</span>";
		html += "										</div>";
		html += "									</div>";
		html += "									<button type='button' class='p_file_more_btn abs'></button>";
		html += "								</div>";
		html += "								<div class='pjt_file_count rel'>";
		html += "									<div class='p_file_icon'></div>";
		html += "									<div class='p_file_r_box'>";
		html += "										<div class='p_file_tit'>";
		html += "											<span>[DSW] 취합 수정사항.pdf</span>";
		html += "											<span class='volume'>(9KB)</span>";
		html += "										</div>";
		html += "										<div class='p_file_info'>";
		html += "											<span class='p_file_name'>김윤기</span>";
		html += "											<span class='p_file_time'>2022.06.02.08:55</span>";
		html += "										</div>";
		html += "									</div>";
		html += "									<button type='button' class='p_file_more_btn abs'></button>";
		html += "								</div>";
		html += "								<div class='pjt_file_count rel'>";
		html += "									<div class='p_file_icon'></div>";
		html += "									<div class='p_file_r_box'>";
		html += "										<div class='p_file_tit'>";
		html += "											<span>[DSW] 취합 수정사항.pdf</span>";
		html += "											<span class='volume'>(9KB)</span>";
		html += "										</div>";
		html += "										<div class='p_file_info'>";
		html += "											<span class='p_file_name'>김윤기</span>";
		html += "											<span class='p_file_time'>2022.06.02.08:55</span>";
		html += "										</div>";
		html += "									</div>";
		html += "									<button type='button' class='p_file_more_btn abs'></button>";
		html += "								</div>";
		
		
		
		
		html += "							</div>";
		html += "						</div>";
		html += "						<div class='pjt_comment_cont'>";
		html += "							<div class='pjt_comment_list'>";
		html += "								<span class='pjt_comment_count'>댓글(0)</span>";
		
		html += "								<div class='pjt_com_box'>";
		html += "									<div class='pjt_comment'>";
		html += "										<div class='pjt_com_prof'>";
		html += "											<div class='user'>";
		html += "												<img src='../../images/common/profile.png' alt='daesang'>";
		html += "												<span class='status online'></span>";
		html += "											</div>";
		html += "										</div>";
		html += "										<div class='pjt_com_info'>";
		html += "											<span class='pjt_com_name'>조현</span>";
		html += "											<span class='pjt_com_j'>프로젝트 인력</span>";
		html += "											<span class='pjt_com_time'>11:42</span>";
		html += "											<span class='pjt_com_more'>";
		html += "												<button type='button' class='chk_more_btn'></button>";
		html += "											</span>";
		html += "											<div class='pjt_com_txt'>";
		html += "												<span>기간 내 완료 부탁드립니다.</span>";
		html += "											</div>";
		html += "										</div>";
		html += "									</div>";
		html += "									<div class='pjt_comment'>";
		html += "										<div class='pjt_com_prof'>";
		html += "											<div class='user'>";
		html += "												<img src='../../images/common/profile.png' alt='daesang'>";
		html += "												<span class='status online'></span>";
		html += "											</div>";
		html += "										</div>";
		html += "										<div class='pjt_com_info'>";
		html += "											<span class='pjt_com_name'>조현</span>";
		html += "											<span class='pjt_com_j'>프로젝트 인력</span>";
		html += "											<span class='pjt_com_time'>11:42</span>";
		html += "											<span class='pjt_com_more'>";
		html += "												<button type='button' class='chk_more_btn'></button>";
		html += "											</span>";
		html += "											<div class='pjt_com_txt'>";
		html += "												<span>기간 내 완료 부탁드립니다.</span>";
		html += "											</div>";
		html += "										</div>";
		html += "									</div>";
		html += "									<div class='pjt_comment'>";
		html += "										<div class='pjt_com_prof'>";
		html += "											<div class='user'>";
		html += "												<img src='../../images/common/profile.png' alt='daesang'>";
		html += "												<span class='status online'></span>";
		html += "											</div>";
		html += "										</div>";
		html += "										<div class='pjt_com_info'>";
		html += "											<span class='pjt_com_name'>조현</span>";
		html += "											<span class='pjt_com_j'>프로젝트 인력</span>";
		html += "											<span class='pjt_com_time'>11:42</span>";
		html += "											<span class='pjt_com_more'>";
		html += "												<button type='button' class='chk_more_btn'></button>";
		html += "											</span>";
		html += "											<div class='pjt_com_txt'>";
		html += "												<span>기간 내 완료 부탁드립니다.</span>";
		html += "											</div>";
		html += "										</div>";
		html += "									</div>";
		html += "									<div class='pjt_comment'>";
		html += "										<div class='pjt_com_prof'>";
		html += "											<div class='user'>";
		html += "												<img src='../../images/common/profile.png' alt='daesang'>";
		html += "												<span class='status online'></span>";
		html += "											</div>";
		html += "										</div>";
		html += "										<div class='pjt_com_info'>";
		html += "											<span class='pjt_com_name'>조현</span>";
		html += "											<span class='pjt_com_j'>프로젝트 인력</span>";
		html += "											<span class='pjt_com_time'>11:42</span>";
		html += "											<span class='pjt_com_more'>";
		html += "												<button type='button' class='chk_more_btn'></button>";
		html += "											</span>";
		html += "											<div class='pjt_com_txt'>";
		html += "												<span>기간 내 완료 부탁드립니다.</span>";
		html += "											</div>";
		html += "										</div>";
		html += "									</div>";
		html += "									<div class='pjt_comment'>";
		html += "										<div class='pjt_com_prof'>";
		html += "											<div class='user'>";
		html += "												<img src='../../images/common/profile.png' alt='daesang'>";
		html += "												<span class='status online'></span>";
		html += "											</div>";
		html += "										</div>";
		html += "										<div class='pjt_com_info'>";
		html += "											<span class='pjt_com_name'>조현</span>";
		html += "											<span class='pjt_com_j'>프로젝트 인력</span>";
		html += "											<span class='pjt_com_time'>11:42</span>";
		html += "											<span class='pjt_com_more'>";
		html += "												<button type='button' class='chk_more_btn'></button>";
		html += "											</span>";
		html += "											<div class='pjt_com_txt'>";
		html += "												<span>기간 내 완료 부탁드립니다.</span>";
		html += "											</div>";
		html += "										</div>";
		html += "									</div>";
		
		
		
		
		html += "								</div>";
		html += "";
		html += "";
		html += "";
		
		
		html += "							</div>";
		html += "							<div class='pjt_comment_input_box'>";
		html += "								<input type='text' name='' id='' class='input' placeholder='댓글을 입력해주세요'>";
		html += "								<button type='button' class='pjt_c_send_btn'></button>";
		html += "							</div>";
		html += "						</div>";
		html += "					</div>";
		html += "";
		html += "					<div class='layer_cont right' style='padding-top:0px'>";
		html += "						<div class='layer_cont_r_list'>";
		html += "							<div class='r_cont writer'>";
		html += "								<h1>기간</h1>";
		html += "								<div class='writer_cont'>";
		html += "									<div class='writer_img user'>";
		html += "										<img src='../../images/common/profile.png'>";
		html += "										<span class='status online'></span>";
		html += "									</div>";
		html += "									<div class='writer_info'>";
		html += "										<span class='w_name'>김윤기</span>";
		html += "										<span class='w_pos'>프로젝트 인력 / 대상주식회사</span>";
		html += "									</div>";
		html += "								</div>";
		html += "							</div>";
		html += "							<div class='r_cont period'>";
		html += "								<h1>작성자</h1>";
		html += "								<div class='period_cont'>";
		html += "									<div class='period_start mu_calendar rel'>";
		html += "										<span>시작일</span>";
		html += "										<button type='button' class='abs type_icon'></button>";
		html += "									</div>";
		html += "									<p>~</p>";
		html += "									<div class='period_finish mu_calendar rel'>";
		html += "										<span>종료일</span>";
		html += "										<button type='button' class='abs type_icon'></button>";
		html += "									</div>";
		html += "								</div>";
		html += "							</div>";
		html += "							<div class='r_cont situ'>";
		html += "								<h1>상태</h1>";
		html += "								<div class='input-field selectbox'>";
		html += "									<select>";
		html += "										<option value=''>대기중</option>";
		html += "										<option value=''>대기중</option>";
		html += "										<option value=''>대기중</option>";
		html += "									</select>";
		html += "								</div>";
		html += "							</div>";
		html += "							<div class='r_cont priority'>";
		html += "								<h1>우선순위</h1>";
		html += "								<div class='input-field selectbox'>";
		html += "									<select>";
		html += "										<option value=''>1순위</option>";
		html += "										<option value=''>2순위</option>";
		html += "										<option value=''>3순위</option>";
		html += "										<option value=''>4순위</option>";
		html += "									</select>";
		html += "								</div>";
		html += "							</div>";
		html += "							<div class='r_cont manager'>";
		html += "								<h1>담당자</h1>";
		html += "								<div class='manager_list'>";
		html += "									<div class='manager_prof'>";
		html += "										<img src='../../img/icon/manager.png' alt='daesang'>";
		html += "									</div>";
		html += "								</div>";
		html += "							</div>";
		html += "							<div class='r_cont reference'>";
		html += "								<h1 class='rel'>";
		html += "								참고자";
		html += "								<button type='button' class='ref_btn abs type_icon'></button>";
		html += "								</h1>";
		html += "								<div class='reference_list'>";
		html += "									<div class='reference_prof user'>";
		html += "										<img src='../../images/common/profile.png' alt='daesang'>";
		html += "										<span class='status online'></span>";
		html += "									</div>";
		html += "									<div class='reference_prof user'>";
		html += "										<img src='../../images/common/profile.png' alt='daesang'>";
		html += "										<span class='status online'></span>";
		html += "									</div>";
		html += "								</div>";
		html += "							</div>";
		html += "";
		html += "";
		html += "";
		html += "";
		html += "						</div>";
		html += "					</div>";
		
		html += "					</div>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
		html += "</div>";
		
		
		
		$("#compose_todo").html(html);
		
		
		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#compose_todo').css({'zIndex': parseInt(max_idx) + 1}).fadeIn();
		
		
		
		$("select").material_select();
		
	},
	
	"compose_layer_draw" : function(item){
		
		gTodo.isupdate = false;
		gTodo.view_mode = "read" //현재 조회창 형태로 띄워져 있는 상태를 표시한다.
		var info = item.data;
		var status = info.status;
		var list = gTodo.cur_todo_list;		
		var files = info.file;
		
		gTodo.select_todo = info;
		gTodo.select_id = info._id.$oid;
		
		
		//현재 접속한 사용자가 편집을 할 수 있는 사용자인지 판단한다.
		
		var is_admin = (gap.userinfo.rinfo.em == gTodo.cur_project_info.owner.em ? true : false);
		var is_owner = (gTodo.select_todo.owner.em == gap.userinfo.rinfo.em ? true : false);
		var is_asignee = false;
		if (typeof(gTodo.select_todo.asignee) != "undefined"){
			is_asignee = (gTodo.select_todo.asignee.em == gap.userinfo.rinfo.em ? true : false);
		}
		if (is_admin || is_owner){
			gTodo.compose_admin = true;
		}else{
			gTodo.compose_admin = false;
		}
		
		if (is_asignee){
			gTodo.compose_asignee = true;
		}else{
			gTodo.compose_asignee = false;
		}
	
		var star = false;
		if (typeof(info.favorite) != "undefined"){
			if ($.inArray(gap.userinfo.rinfo.em , info.favorite) > -1){
				star = true;
			}
		}
		
		var html = "";
		html += "	<div class='layer layer-todo-view' >";
		html += "		<button class='ico btn-close' id='todo_compose_close'>닫기</button>";
		html += "		<div class='todo-view-left'>";
		html += "			<button class='ico btn-more btn-top-more'>더보기</button>";
		html += "			<button class='ico btn-star'>즐겨찾기</button>";
		
		html += "		<h2>"+info.project_name+"</h2>";
		
		
//		html += "			<div class='selectbox'>";
//		html += "				<select id='todo_compose_sel'>";
//		for (var i = 0 ; i < list.length; i++){
//			var ix = list[i];
//			var id = ix._id.$oid;
//			if (ix.type == "project"){
//				if (gTodo.cur_project_info._id.$oid == id){
//					html += "		<option value='"+id+"' selected>"+ix.name+"</option>";
//				}else{
//					html += "		<option value='"+id+"'>"+ix.name+"</option>";
//				}				
//			}			
//		}
//		html += "				</select>";
//		html += "			</div>";
		
		
		////////////////////////////////////// 상단 타이틀 과 설명 영역 ////////////////////////////////////////////////////////////////////
		
		html += "			<div class='input-field todo-sbj' style='display:none; cursor:pointer' id='todo_top_title_input'>";
		html += "				<input type='text' class='formInput' id='todo_compose_title'  autocomplete='off' value='"+info.title+"'>";
		if (gap.lang.input_title != ""){
			html += "				<label for='' class='on'>"+gap.lang.todo+"</label> <!-- 텍스트 필스 포커스, 입력값 있을때 on 클래스 추가 -->";
		}else{
			html += "				<label for='' class=''>"+gap.lang.todo+"</label> <!-- 텍스트 필스 포커스, 입력값 있을때 on 클래스 추가 -->";
		}
		
		html += "				<span class='bar'></span>";
		html += "			</div>";
		
		html += "			<div class='todo-sbj' id='todo_top_title_input2' style='cursor:pointer'>";
		html += "           	<h3>"+gap.lang.todo+"</h3>";
		html += "           	<p id='todo_top_title_show_p'>"+info.title+"</p>";
		html += "			</div>";
		
		
		
		
		html += "			<div class='todo-explain' style='display:none; cursor:pointer' id='todo_top_express_input'>";
		html += "				<h3>"+gap.lang.todo_name+"</h3>";
		html += "				<div class='input-field'>";
		html += "					<textarea class='formInput' placeholder='"+gap.lang.input_todo_comment+"' id='todo_compose_express_edit'></textarea>";
		html += "					<span class='bar'></span>";
		html += "				</div>";
		html += "				<div class='todo-right' id='todo_compse_express_save' style='display:none'>";
		html += "					<button class='btn-ok' id='todo_compose_express_save_btn'><span>확인</span></button>";
		html += "					<button  id='todo_compose_express_cancel_btn'><span>취소</span></button>";
		html += "				</div>";
		html += "			</div>";
		
		html += "			<div class='todo-explain' id='todo_top_express_input2' style='cursor:pointer'>";
		html += "           	<h3>"+gap.lang.todo_name+"</h3>";
		html += "           	<p id='todo_compose_express'></p>";
		html += "			</div>";
		
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		
		html += "			<div class='work-tab-rel'>";
		html += "				<ul class='flex'>";
		
		
		html += "					<li class='on' id='todo_tap2' ><span>"+gap.lang.checklist+"&nbsp;<span id='rdata2_cnt' style='float:right'>(2)</span></span></li>";
		
		html += "					<li id='todo_tap1' style='padding-left:20px'><span>"+gap.lang.rdata+"&nbsp;<div id='rdata_cnt' style='float:right'>(1)</div></span></li>";
		
		html += "				</ul>";
		html += "			</div>";
		
		/////////////////////////////// 체크 리스트 영역 ///////////////////////////////////////////////////////////////////////////////////////////////
		
		
		
		html += "			<div class='todo-checklist' >";
		html += "				<h3 >"+gap.lang.checklist+"<span id='todo_checklist_count'> </span></h3>";
	//	html += "				<h3></h3>";
		if ((gTodo.compose_admin) || (is_asignee)){
			html += "				<button class='btn-attach-del'><span>"+gap.lang.delete_all+"</span></button>";			
		}
		
		html += "				<div class='check-graph'>";
		html += "					<div class='bar'  style='border-radius:5px;'><span style='width:0%; border-radius:5px'></span></div>";
		html += "					<em>0/0</em>";
		html += "				</div>";
		html += "				<ul id='todo_compose_checklist' style='cursor:pointer; max-height:415px; overflow-y:auto'>";
		
		var cnt2 = 0;
		if (typeof(info.checklist) != "undefined"){
			var chlist = info.checklist;
			cnt2 = chlist.length;
			for (var i = 0 ; i < chlist.length; i++){
				var citem = chlist[i];
				
				var owner = "";
				var okey = "";
				if (typeof(citem.asign) != "undefined"){
					owner = citem.asign.em;
					okey = citem.asign.ky;
				}
				if (citem.complete == "T"){
					html += "					<li id='"+citem.tid+"' data='"+owner+"' data2='"+okey+"' class='list-checked'>";
					html += "						<button class='ico btn-check on'>체크</button>";
				}else{
					html += "					<li id='"+citem.tid+"' data='"+owner+"' data2='"+okey+"'>";
					html += "						<button class='ico btn-check'>체크</button>";
				}
				
				
				html += "						<p style='white-space: nowrap; overflow:hidden; text-overflow:ellipsis;'>"+citem.txt+"</p>";
				html += "						<dl class='todo-list-right'>";
				
				
				if (typeof(citem.complete_date) != "undefined"){
					var sdt = moment.utc(citem.start_date).format("YYYY-MM-DD");
					var dt = moment.utc(citem.complete_date).format("YYYY-MM-DD");
					if (citem.complete == "T"){
						html += "							<dd><span class='btn-time checked'><button class='ico ico-time'>시간</button><em>"+sdt+"~"+dt+"</em></span></dd>";
					}else{
						html += "							<dd><span class='btn-time'><button class='ico ico-time'>시간</button><em>"+sdt+"~"+dt+"</em></span></dd>";
					}				
				}else{
					if (citem.complete == "T"){
						html += "							<dd><span class='btn-time checked'><button class='ico ico-time'>시간</button></span></dd>";
					}else{
						html += "							<dd><span class='btn-time'><button class='ico ico-time'>시간</button><em></em></span></dd>";
					}
					
					
				}
				
				if (typeof(citem.asign) != "undefined"){
//					var select_user_img = gap.person_photo(citem.asign.pu);
					var user_info = gap.user_check(citem.asign);
					var person_img = "<div class='user-thumb showorg' style='cursor:pointer' data-ky='"+user_info.ky+"'>"+user_info.user_img+"</div>";
					
					html += "							<dd>"+person_img+"</dd>";
				}else{
					html += "							<dd><button class='ico btn-user-add'>사용자추가</button></dd>";
				}
				if ((gTodo.compose_admin) || (is_asignee)){
					html += "							<dd><button class='ico btn-more'>더보기</button></dd>";
				}
				
				html += "						</dl>";
				html += "					</li>";
			}
		}

		html += "				</ul>";
		
		html += "				<div class='input-field'>";
		
		if ((gTodo.compose_admin) || (is_asignee)){
			html += "					<input type='text' class='formInput' id='todo_compose_checklist_save'  autocomplete='off' placeholder='"+gap.lang.input_checklist+".'>";
			html += "					<span class='bar'></span>";
		}
		
		

		html += "				</div>";
		

		html += "			</div>";
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		
		
		///////////////////////////////// 파일 첨부 영역 ///////////////////////////////////////////////////////////////////////////////////////
		
		
		html += "			<div class='todo-attach' id='todo_file_area' style='display:none'>";
		html += "				<h3>"+gap.lang.attachment+"<span id='todo_file_count'> </span></h3>";
		html += "				<button class='btn-attach-add' id='todo_add_file_btn'><span>"+gap.lang.addFile+"</span></button>";
	
		html += "				<div id='total-progress_todo' class='' style='height:2px;width: calc(100% - 1px);'>";
		html += "					<div class='progress-bar' style='width:0%;background:#337ab7' data-dz-uploadprogress></div>";
		html += "				</div>";
		
		html += "				<ul class='attach-list' id='todo_compose_view_attach'>";
		html += "					<!-- 조회일때 -->";
		
		
		var cnt1 = 0;
		if (typeof(files) != "undefined"){
			cnt1 = files.length;
			for (var k = 0 ; k < files.length; k++){			
				var f = files[k];
	    		var icon = gap.file_icon_check(f.filename);
	    		var fsize = gap.file_size_setting(f.file_size.$numberLong);
	    		var md5 = f.md5.replace(".","_");
	    		var owner = f.owner;
	    		var name = owner.nm;
	    		var dept = owner.dp;
	    		if (gap.curLang != "ko"){
	    			name = owner.enm;
	    		}    		
	    		var ftype = f.file_type;
	    	    		
	    		var time = gap.change_date_localTime_full2(f.GMT);

	    		html += "					<li id='"+md5+"' data1='"+gap.HtmlToText(f.filename)+"' data2='"+f.fserver+"'>";
	    		html += "						<span class='ico ico-file "+icon+"'></span>";
	    		html += "						<div class='attach-name'><span>"+f.filename+"</span><em>("+fsize+")</em></div>";
	    		html += "						<div class='attach-info'>";
	    		html += "							<span>"+name+"<em class='team'>"+dept+"</em><em>"+time+"</em></span>";
	    		html += "						</div>";
	    		
	    		var is_show = gap.check_preview_file(f.filename);
	    		var is_pre = gap.is_file_type(f.filename);
	    		
	    	
	    		if (is_show || is_pre == "img" || is_pre == "movie"){
	    			html += "						<button class='ico btn-file-view'>파일보기</button>";
	    		}
	    		
	    		html += "						<button class='ico btn-file-download' >다운로드</button>";
	    		if (owner.ky == gap.userinfo.rinfo.ky){
	    			html += "						<button class='ico btn-delete'>삭제</button>";
	    		}
	    		
	    		html += "					</li>";	
			}
		}

		html += "				</ul>";
		html += "			</div>";
		
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				
		
		
		///////////////////////////////////// 댓글 영역 /////////////////////////////////////////////////////////////////////

		html += "			<div class='todo-reply'>";
		html += "				<h3>"+gap.lang.reply+"<span id='todo_reply_count'> </span></h3>";

		var rcount = 0;
		if (typeof(item.data.reply) != "undefined"){
			rcount = item.data.reply.length;
			cnt1 = cnt1 + rcount;
			html += "				<div class='message-reply' id='todo_compose_reply_list' style='background-color:#fff !important'>";				
			for (var k = 0 ; k < item.data.reply.length; k++){
				
				var rinfo = item.data.reply[k];
				var id = rinfo.key;
				var msg = rinfo.msg;
				msg = gap.message_check(msg);
				
				if (msg.indexOf("&lt;/mention&gt;") > -1){
					//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
					msg = gap.textToHtml(msg).replace(/&nbsp;/g, " ");
				}
				
				var GMT = rinfo.GMT;
				
				var owner = rinfo.owner;
				var user_info = gap.user_check(owner);
				var time = gap.change_date_localTime_full2(GMT);				

				html += "<dl id='"+id+"'>";
				html += "	<dt>";
				html += "		<div class='user'>";
				html += "				<div class='user-thumb showorg'>"+user_info.user_img+"</div>";
				html += "		</div>";
				html += "	</dt>";
				html += "	<dd>";
				
				
				html += "		<span>"+user_info.name+"<em class='team'>"+user_info.dept+"</em><em>"+time+"</em></span>";
				if (user_info.ky == gap.userinfo.rinfo.ky){
					html += "		<button class='btn-reply-more'><span class='ico ico-reply-more'>더보기</span></button>";
				}
				
				html += "		<!--<button class='btn-reply-del'><span>삭제</span></button>-->";
				html += "		<p style='font-size:13px'>"+msg+"</p>";
				html += "	</dd>";
				html += "</dl>";
			}
			html += "				</div>";
		}else{
			html += "				<div class='message-reply' id='todo_compose_reply_list' style='display:none;background-color:#fff !important'>";				
			html += "				</div>";
		}
		html += "			</div>";
		
		
		
		html += "			<div class='chat-bottom'> ";
	//	html += "				<div class='progress-bar'><span style='width:50%'></span></div>";
		html += "				<div class='input-area' style='padding: 0 10px'>";
		html += "					<button class='btn-choose ico'>추가</button>";
		html += "					<textarea class='txt-chat' id='todo_reply_input' placeholder='"+gap.lang.input_replay+".'></textarea>";
//		html += "					<button class='btn-emoticon ico'>이모티콘</button>";
//		html += "					<button class='btn-more ico'>더보기</button>	";
		html += "				</div>";
		html += "				<div class='layer layer-menu opt-enter' style='right:10px;bottom:42px;display:none'>";
		html += "					<ul>";
		html += "						<li class='on'>Enter 전송 (Shift+Enter 줄바꿈)</li>";
		html += "						<li>Shift+Enter 전송 (Enter 줄바꿈)</li>";
		html += "					</ul>";
		html += "				</div>";
		html += "			</div>";
		html += "		</div>";
		
		
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
				
		
		var start_date = "";
		var end_date = "";

		if (typeof(info.startdate) != "undefined"){
			start_date = moment.utc(new Date(info.startdate)).format("YYYY.MM.DD");
			end_date = moment.utc(new Date(info.enddate)).format("YYYY.MM.DD");
		}
		html += "		<div class='todo-view-right' style=' background-color: #f7f7f7;padding:10px 10px 0 10px; border-radius:5px'>";

	
		var user_info = gap.user_check(info.owner);
		
		
		html += "<div class='group g-owner' data-ky='"+info.owner.ky+"' style='background-color:white'>";
		html += "<h3>"+gap.lang.maker+"</h3>";
		html += "<div class='user'>";
		html += "<div class='user-thumb showorg'>"+user_info.user_img+"</div>	";
		html += "</div>";
		
	
		html += "<dl>";
		html += "	<dt>"+user_info.name+"</dt> ";
	//	html += "	<li class='email'>"+user_info.email+"</li> ";
	//	html += "	<li>010-1234-5678</li>";
		html += "	<dd>"+user_info.dept+"/"+user_info.company+"</dd>";		
		html += "</dl>";
		html += "</div>";
			
		var disdate = gap.change_date_default(gap.search_today_only3(info.GMT));
		html += "			<div class='group g-period' id='todo_cal_select' style='background-color:white; font-size:13px'>";
		html += "				<h3>"+gap.lang.todo_period+ " <span style='font-size:12px; font-weight:400'>["+gap.lang.created+" : "+ disdate +"]</span></h3>";
		
		if (gTodo.compose_admin){
			html += "				<div class='input-field'>";
			html += "					<input type='text' class='formInput' id='todo_startdate'  autocomplete='off' placeholder='"+gap.lang.startdate+"' value='"+start_date+"'>";
			html += "					<span class='bar'></span>";
			html += "				</div>";
			html += "				~";
			html += "				<div class='input-field '>";
			html += "					<input type='text' class='formInput' id='todo_enddate'  autocomplete='off' placeholder='"+gap.lang.enddate+"' value='"+end_date+"'>";
			html += "					<span class='bar'></span>";
			html += "				</div>";
		}else{
			html += "				<div >";
			html += "					<p>"+start_date+" ~ "+end_date+"</p>";
			html += "					<span class='bar'></span>";
			html += "				</div>";

		}

//		html += "				<input type='text' class='formInput' id='todo_term_field' style='height:1px'>";
		html += "			</div>";
		
		
		
		
		
		html += "			<div class='group g-status' style='background-color:white'>";
		html += "				<h3>"+gap.lang.status+"</h3>";
		if (gTodo.compose_admin || gTodo.compose_asignee){
			html += "				<div class='selectbox'>";
			html += "					<select id='st_sel'>";
			html += "						<option value='' data-icon='"+root_path+"/resource/images/temp.png' id='chx_0' value='0'>"+gap.lang.temps+"</option>";
			html += "						<option value='' data-icon='"+root_path+"/resource/images/wait.png' id='chx_1' value='1'>"+gap.lang.wait+"</option>";
			html += "						<option value='' data-icon='"+root_path+"/resource/images/continue.png' id='chx_2' value='2'>"+gap.lang.doing+"</option>";
			html += "						<option value='' data-icon='"+root_path+"/resource/images/complete.png' id='chx_3' value='3'>"+gap.lang.done+"</option>";
			if (info.status == "4"){
				html += "						<option value='' data-icon=''"+root_path+"/resource/images/archive.png' id='chx_4' value='4'>"+gap.lang.archive+"</option>";			
			}
			html += "					</select>";
			html += "				</div>";
		}else{
			html += "				<div class='selectbox'>";
			html += "					<p id='sx_1' style='padding-top:10px'></p>";
			html += "				</div>";
		}

		html += "			</div>";
		
		
		
		html += "			<div class='group g-level' style='background-color:white'>";
		html += "				<h3>"+gap.lang.priority+"</h3>";
		if (gTodo.compose_admin){
			html += "				<div class='selectbox'>";
			html += "					<select id='pt_sel'>";
			html += "						<option value='' data-icon='"+root_path+"/resource/images/arrow1.png' id='chp_1' value='1'>"+gap.lang.priority1+"</option>";
			html += "						<option value='' data-icon='"+root_path+"/resource/images/arrow2.png' id='chp_2' value='2'>"+gap.lang.priority2+"</option>";
			html += "						<option value='' data-icon='"+root_path+"/resource/images/bar.png' id='chp_3' value='3'>"+gap.lang.priority3+"</option>";
			html += "						<option value='' data-icon='"+root_path+"/resource/images/arrow3.png' id='chp_4' value='4'>"+gap.lang.priority4+"</option>";
		//	html += "						<option value='' data-icon='"+root_path+"/resource/images/arrow4.png' id='chp_5' value='5'>"+gap.lang.priority5+"</option>";
			html += "					</select>";
			html += "				</div>";
		}else{
			html += "				<div class='selectbox'>";
			html += "					<p id='sx_2' style='padding-top:10px'></p>";
			html += "				</div>";
		}

		html += "			</div>";
		
		
		html += "			<div class='group g-owner' style='background-color:white'>";
//		html += "				<button class='btn-g-add'>추가</button>";
		html += "				<h3>"+gap.lang.asign+"</h3>";
		
		
		
		var asi = "";
		var atitle = "";
		if (typeof(info.asignee) != "undefined"){
			asi = info.asignee.ky;
			atitle = info.asignee.nm + "/" + info.asignee.dp + "/" + info.asignee.cp
		}
		
		
		if (gTodo.compose_admin){
			html += "				<div class='user'>";
			if (typeof(info.asignee) == "undefined" || info.asignee == ""){
				html += "					<div class='user-thumb' id='asignee_btn' data-ky='"+asi+"' style='cursor:pointer' title='"+atitle+"'><img src='"+root_path+"/resource/images/user_d.jpg' alt=''>김윤기1</div>";
			}else{
				var user_info = gap.user_check(info.asignee);		
				html += "					<button class='btn-g-del'></button>";
				html += "					<div class='user-thumb' id='asignee_btn'  data-ky='"+asi+"'  style='cursor:pointer' title='"+atitle+"'>"+user_info.user_img+"</div>";
			}				               
			html += "				</div>";
		}else{
			html += "				<div class='user'>";
			if (typeof(info.asignee) == "undefined" || info.asignee == ""){
				html += "					<div class='user-thumb' id='asignee_btn'  data-ky='"+asi+"' title='"+atitle+"'><img src='"+root_path+"/resource/images/user_d.jpg' alt=''>김윤기3</div>";
			}else{
				var user_info = gap.user_check(info.asignee);		
				html += "					<div class='user-thumb' id='asignee_btn'  data-ky='"+asi+"' title='"+atitle+"'>"+user_info.user_img+"김윤기4</div>";
			}				               
			html += "				</div>";
		}	
		html += "			</div>";
				
		
		
		html += "			<div class='group g-owner' id='refer_list' style='background-color:white'>";
//		html += "				<button class='btn-g-add'>추가</button>";
		html += "				<h3>"+gap.lang.ref+"</h3>";		
			
		if (gTodo.compose_admin){
			html += "				<button class='btn-g-add' id='btn_ref_add'>추가</button>";
		}
		
		if (typeof(info.ref) != "undefined"){
			for (var k = 0 ; k < info.ref.length; k++){
				var us = info.ref[k];
				var user_info = gap.user_check(us);
				
				var ctitle = us.nm + "/" + us.dp + "/" + us.cp;
				if (gTodo.compose_admin){
					html += "<div class='user'><button class='btn-g-del'></button><div class='user-thumb' data-ky='"+user_info.ky+"' title='"+ctitle+"'>"+user_info.user_img+"</div></div>";
				}else{
					html += "<div class='user'><div class='user-thumb' data-ky='"+user_info.ky+"' title='"+ctitle+"'>"+user_info.user_img+"</div></div>";
				}			
			}
		}
			
		
		html += "			</div>";
		
				
		
        /*
		html += "			<div class='group g-tag'>";
		if (gTodo.compose_admin){
			html += "				<button class='btn-g-add' id='btn_tag_add'>추가</button>";
		}
		
		html += "				<h3>"+gap.lang.tag+"</h3>";
		html += "				<div class='todo-tag' id='tag_list_div'>";
		
		if (typeof(info.tag) != "undefined"){
			if (gTodo.compose_admin){
				for (var i = 0 ; i < info.tag.length; i++){
					html += "					<span>"+info.tag[i]+"<button class='btn-g-del'></button></span>";
				}
			}else{
				for (var i = 0 ; i < info.tag.length; i++){
					html += "					<span>"+info.tag[i]+"</span>";
				}
			}

		}
		html += "				</div>";
		html += "			</div>";
		
		
		
		html += "			<!--컬러정의.c1 : 흰색 (기본).c2 : 빨강.c3 : 주황.c4 : 노랑.c5 : 초록.c6 : 파랑	.c7 : 남색.c8 : 보라.c9 : 분홍.c10 : 청록-->";
		html += "			<div class='group g-color'>";
		if (gTodo.compose_admin){
			html += "				<button class='btn-g-add' id='btn_color_add'>추가</button>";
		}
		
		html += "				<h3>"+gap.lang.color+"</h3>";
		if (typeof(info.color) != "undefined"){
			if (gTodo.compose_admin){
				html += "				<div class='color "+info.color+"'><button class='btn-g-del'></button></div>";
			}else{
				html += "				<div class='color "+info.color+"'></div>";
			}
			
		}
		
		*/
	//	
		html += "			</div>";
		html += "		</div>";
		html += "	</div>";
			
		
		
		$("#compose_todo").html(html);
		
		
		$("#rdata_cnt").html("(" + cnt1 + ")");
		$("#rdata2_cnt").html("(" + cnt2 + ")");
		
		$(".work-tab-rel .flex li").off();
		$(".work-tab-rel .flex li").on("click", function(e){
			$(".work-tab-rel .flex li").removeClass("on");
			$(e.currentTarget).addClass("on");
			
			var id = $(e.currentTarget).attr("id");
			if (id == "todo_tap1"){
				$("#todo_compose_view_attach").fadeIn();
				$(".todo-reply").fadeIn();
				$(".todo-view-left .chat-bottom").fadeIn();
				$(".todo-checklist").hide();
				$("#todo_file_area").show();
			}else{
				$("#todo_compose_view_attach").hide();
				$(".todo-reply").hide();
				$(".todo-view-left.chat-bottom").hide();
				$(".todo-checklist").fadeIn();
				$("#todo_file_area").hide();
			}
		});
		
		
		
		if (status == "3" || status == "4"){
			$("#todo_compose_checklist_save").hide();
		}
		
		gap.showBlock();
		var max_idx = gap.maxZindex();
		$('#compose_todo').css({'zIndex': parseInt(max_idx) + 1}).fadeIn();
		
		//설명 초기화 하기
		if (typeof(info.express) != "undefined"){
			$("#todo_compose_express").html(gap.message_check(info.express));
			$("#todo_compose_express_edit").val(gap.textToHtml(info.express));
		}
		
		//댓글 스크롤 하단으로 이동
		$("#todo_reply_count").html(" ("+ rcount +")");
		$("#todo_compose_reply_list").animate({ scrollTop: $('#todo_compose_reply_list').prop("scrollHeight")},1);
		
		//파일 건수 표시
		var fcount = $("#todo_compose_view_attach li").length;
		$("#todo_file_count").html(" ("+ fcount +")");
		
		
		if (gTodo.compose_admin || gTodo.compose_asignee){
			//상태 변경하기
			var st = item.data.status;
			$("#chx_" + st).prop("selected", true);
		
			//우선 순위 변경하기
			var pt = item.data.priority;
			$("#chp_" + pt).prop("selected", true);
		}else{
			//상태 변경하기
			var st = item.data.status;

			var tx = "";
			if (st == "0"){
				tx = gap.lang.temps;
			}else if (st == "1"){
				tx = gap.lang.wait;
			}else if (st == "2"){
				tx = gap.lang.doing;
			}else if (st == "3"){
				tx = gap.lang.done;
			}else if (st == "4"){
				tx = gap.lang.archive;
			}
			
			$("#sx_1").html(tx);
			
			//우선 순위 변경하기
			var pt = item.data.priority;
			var tt = gap.lang["priority" + pt];
			$("#sx_2").html(tt)
		}
		
		
		//즐겨찾기 설정 변경하기
		if (star){
			$(".todo-view-left .btn-star").addClass("on");
		}else{
			$(".todo-view-left .btn-star").removeClass("on");
		}
		
		
		
		//체크리스트 Drag & Drop으로 이동하기
		$("#todo_compose_checklist").sortable({
			opacity : 1,
			helper : "clone",
			delay : 150, 
			revert : true,
			start : function(event, ui){
			
			},
			stop : function(event, ui){
				
				var xlist = $("#todo_compose_checklist li");
				var ar = new Array();
				
				for (var i = 0 ; i < xlist.length; i++){
					var key = xlist[i].id;
					ar.push(key);
				}
				var list = ar.join("-");
				
				var url = gap.channelserver + "/update_checklist_sort_todo.km";
				var data = JSON.stringify({
					"todo_id" : gTodo.select_id,
					"keylist" : list
				});
				
				$.ajax({
					type : "POST",
					dataType : "json",
					contentType : "application/json; charset=utf-8",
					data : data,
					url : url,
					success : function(res){
						//로컬 데이터 변경
						var change_doc = res.data.doc;
						gTodo.change_local_data(change_doc);
					},
					error : function(e){
						gap.error_alert();
					}
				})
			}
		});
		
		
		//멘션 클릭 이벤트 추가
		gTodo.mention_event();
		 
		 
		if (gTodo.compose_admin){
			gTodo.__todo_selectDate_event();			
			gTodo.__item_delete_event();
		}

		
		$("select").material_select();
		
	
		//체크리스트 건수 표시하기
		gTodo.checklist_count_check();
		///////////////////////////////////////////////////////////////////////////////////
		
		gTodo.__todo_compose_event();
		
		gTodo.checklist_qtip();
		
		//댓글 입력 이벤트 처리	////////////////////////////////////////////////////	
		$("#todo_reply_input").off();
		$("#todo_reply_input").bind("keypress", function(e){
			if (e.keyCode == 13){
				
				var enter_opt = gap.enter_opt;		
		        if (e.keyCode == 13 && !e.shiftKey){          	
		        	if (enter_opt == "1" || enter_opt == ""){
		        		gTodo.sendMessage(e);            
		        	}else if (enter_opt == "2"){
		        		//다음줄로 내려간다.    
		        		gTodo.enter_next_line_todo(e);
		        	}
		        }           
		        if (e.keyCode == 13 && e.shiftKey) {
		        	if (enter_opt == "1"){
		        		//다음줄로 내려간다.
		        		gTodo.enter_next_line_todo(e);
		        	}else{
		        		gTodo.sendMessage(e);  
		        	}       	
		        }
			}
		});
		
		$("#todo_reply_input").bind("keyup", function(e){
			if (e.keyCode == 8 || e.keyCode == 46){		// backspace or delete key
				gTodo.enter_line_control_todo(e);
			}
		});
		////////////////////////////////////////////////////////////////////////
		
		// 저당된 댓글 '더보기' 메뉴 버튼 이벤트 처리 /////////////////////////////////////////////
		$(".btn-reply-more").off();
		$(".btn-reply-more").on("click", function(e){
			$.contextMenu({
				selector : ".btn-reply-more",			
				autoHide : false,
				trigger : "left",
				callback : function(key, options){
					
					var todo_id = gTodo.select_id;
					var rid = $(this).parent().parent().attr("id");
					
					gTodo.context_menu_call_reply_todo(key, todo_id, rid);
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
						items: gBody3.reply_context()
					}
				}
			});
		});
		////////////////////////////////////////////////////////////////////////
		
		// mention 설정 (댓글 입력란)
		gTodo.init_mention_userdata('todo_reply_input');
		
		// mention 설정 (댓글 수정란)
		gTodo.init_mention_userdata('rmtext_reply_todo');
		
		
		
		$(".user-thumb.showorg").off().on("click", function(e){
			var ky = $(e.currentTarget).find("img").data("key");
			gap.showUserDetailLayer(ky);
		});
			 
	},
	
	"mention_event" : function(){
		//멘션을 클릭한 경우 사용자 정보를 표시한다.
		 $("#todo_compose_reply_list mention").off();
		 $("#todo_compose_reply_list mention").on("click", function(e){
			 var id = $(this).attr("data");
			 gTodo.click_img_obj = this;
			 _wsocket.search_user_one_for_popup(id);
		 });
		 $("#todo_compose_reply_list mention").css("cursor", "pointer");
		/////////////////////////////////////////////////////////////////////
	},
	
	"checklist_qtip" : function(){
		//체크리스트 qtip 지저하기
		$("#todo_compose_checklist li p").each(function(){
			var text = $(this).text();
			if (text.length > 20){
				gap.draw_qtip_right_bottom(this, text);
			}			
		});
	},
	
	"__todo_file_event" : function(){
		
		
		$("#btn_ref_add").off();
		$("#btn_ref_add").on("click", function(e){
			
			gap.showBlock_todo();
			
			var th = $(e.currentTarget);
			window.ORG.show(
			{
				'title': gap.lang.addref,
				'pergroup': false,
				'peraddr': false,
				'single': false
			}, 
			{
				getItems:function() { return []; },
				onClose : function(){
					gap.hideBlock_todo();
				},
				setItems:function(items) { /* 반환되는 Items */													
					
					var arr = new Array();			
					
					//현재 참조자 리스트를 가져와서 미리 정리한다.
					var plist = gTodo.select_todo.ref;
					if (typeof(plist) != "undefined"){
						for (var k = 0 ; k < plist.length; k++){
							arr.push(plist[k]);
						}
					}
					
									
					for (var i = 0 ; i < items.length; i++){
						var _res = gap.convert_org_data(items[i]);
						
						if (!gTodo.check_ref_exist(_res)){
							arr.push(_res);
						}						
					}
					
					
										
					var url = gap.channelserver + "/add_referer.km";
					var data = JSON.stringify({
						id : gTodo.select_id,
						lists : arr
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
																
								
								var change_doc = res.data.doc;
								gTodo.change_local_data(change_doc);
								
								var ref = change_doc.ref;
								
								$("#refer_list .user").empty();
								for (var i = 0 ; i < ref.length; i++){
									var info = ref[i];
									var user_info = gap.user_check(info);
									
									var person_img = "<div class='user'><button class='btn-g-del'></button><div class='user-thumb' data-ky='"+user_info.ky+"'>"+user_info.user_img+"</div></div>";
									$("#refer_list").append(person_img);
								}
								
								gTodo.__item_delete_event();
								
								
							}
						},
						error : function(e){
							gap.error_alert();
						}
					});
					
					
					
				}
			});
		});
		
		$("#todo_compose_view_attach .btn-file-view").off();
		$("#todo_compose_view_attach .btn-file-view").on("click", function(e){
			
			var filename = $(this).parent().attr("data1");
			var fserver = $(this).parent().attr("data2");
			var md5 = $(this).parent().attr("id").replace("_",".");
			
			var url = gap.search_file_convert_server(fserver) + "FDownload.do?id=" + gTodo.select_id + "&md5=" + md5 + "&ty=todo";
			if (gap.checkFileExtension(filename)){				
				var spl = url.split("/");
				var id = spl[6];
				var surl = gap.channelserver + "officeview/ov.jsp?url=" +encodeURIComponent(url) + "&filename="+filename + "&dockey=" + md5;
				gap.popup_url_office(surl);	
				
				return false;
			}else{
				alert(gap.lang.not_support_preview);
			}
					
			var flist = gTodo.cur_project_item_list;
			var fpath = "";
			var ft = "";
			for (var k = 0 ; k < flist.length; k++){
				var info = flist[k];
				if (info._id.$oid == gTodo.select_id){
					var finfo = info.file;
					for (var i = 0 ; i < finfo.length; i++){
						var kinfo = finfo[i];
						if (kinfo.md5 == md5){
							fpath = kinfo.fpath;
							ft = kinfo.file_type;
							break;
						}
					}
				}
			}
			
		
		//	gBody3.file_convert(gTodo.cur_todo_name, fpath , md5, gTodo.select_id, "todo", ft, gTodo.cur_todo_name, filename);
			
		//	"file_convert" : function(fserver, fname, md5, item_id, ty, ft, email, upload_path){
			
		//	gTodo.show_file_fullscreen_todo(filename, fserver, md5);
		});
		
		$("#todo_compose_view_attach .btn-file-download").off();
		$("#todo_compose_view_attach .btn-file-download").on("click", function(e){
			
			var filename = gap.textToHtml($(this).parent().attr("data1"));
			var fserver = $(this).parent().attr("data2");
			var md5 = $(this).parent().attr("id").replace("_",".");
			
			var downloadurl = gap.search_file_convert_server(fserver) + "/FDownload.do?id=" + gTodo.select_id + "&md5=" + md5 + "&ty=todo"
			gap.file_download_normal_todo(downloadurl, filename);
			return false;
			
		});
		
		$("#todo_compose_view_attach .btn-delete").off();
		$("#todo_compose_view_attach .btn-delete").on("click", function(e){
			
			
			var filename = gap.textToHtml($(this).parent().attr("data1"));
			var fserver = $(this).parent().attr("data2");
			var pid = $(this).parent().attr("id");
			var md5 = $(this).parent().attr("id").replace("_",".");
			
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
				escapeKey : true,
				buttons : {
					confirm : {
					keys: ['enter'],
					text : gap.lang.OK,
					btnClass : "btn-default",
					action : function(){
						
						var data = JSON.stringify({
							"id" : gTodo.select_id,
							"md5" : md5
						});			
						url = gap.channelserver + "/delete_sub_file_todo.km";
						$.ajax({
							type : "POST",
							dataType : "json",
							url : url,
							data : data,
							success : function (res){
							
								if (res.result == "OK"){								
									
									$("#" + pid).remove();
									gTodo.file_count_check();
									
									var change_doc = res.data.doc;
									gTodo.change_local_data(change_doc);
								}else{
									gap.gAlert(gap.lang.errormsg);
								}
							},
							error : function(e){
								gap.gAlert(gap.lang.errormsg);
							}
						});
					}
				},
				cancel : {
					keys: ['esc'],
					text : gap.lang.Cancel,
					btnClass : "btn-default",
					action : function(){
						//$("#" + xid).css("border","");
					}
				}
				}
			});
			
		});
	},
	
	
	"check_ref_exist" : function(obj){
		
		var res = false;
		var olist = $("#refer_list .user-thumb");  //기존에 등록된 사용자와 중복을 체크한다.
		for (var i = 0  ; i < olist.length; i++){
			var info = olist[i];
			if ($(info).data("ky") == obj.ky){
				//기존에 있는 사용자를 추가했다.
				res = true;
				return res;
			}
		}
		return res;
	},
	
	
	"enter_next_line_todo" : function(evt){
//		$("#message_txt_channel").height($("#message_txt_channel").height() + 23);      	
//    	var countRows = $("#message_txt_channel").val().split(/\r|\r\n|\n/).length;   
//    	$("#message_txt_channel").attr("rows", countRows + 1);
		// mention 으로 인해 기존 ling-height 23px -> 20px 로 변경
    	var id = $(evt.currentTarget).attr("id");
		$("#" + id).height($("#"+id).height() + 20);      	
    	var countRows = $("#" + id).val().split(/\r|\r\n|\n/).length;   
    	$("#"+id).attr("rows", countRows + 1);
    	
    	evt.stopPropagation();
	},	
	
	"enter_line_control_todo" : function(evt){
		// mention 으로 인해 기존 ling-height 23px -> 20px 로 변경
		var id = $(evt.currentTarget).attr("id");
		var countRows = $("#" + id).val().split(/\r|\r\n|\n/).length;
		if (countRows == 1){
			$("#" + id).height('29');
			
		}else{
			$("#" + id).height((countRows * 20) + 6);
		}
		$("#" + id).attr("rows", countRows);
    	evt.stopPropagation();
	},
	
	"sendMessage" : function(e){
		
		var msg = $(e.currentTarget).val();
		
		if (msg.trim() == ""){
			gap.gAlert(gap.lang.input_message);
			return false;
		}
		
		var owner = gap.userinfo.rinfo;
		
		//mention 처리 /////////////////////////////////////////////////////////////
		var mentions_msg = "";
		var mentions_data = "";
		var mentions_ky = "";
		var mentions_em = "";
		$(e.currentTarget).mentionsInput('val', function(text){
			mentions_msg = gap.textMentionToHtml(text);
		});
	//	console.log(mentions_msg);
		$(e.currentTarget).mentionsInput('getMentions', function(data) {
			mentions_data = data;
			mentions_ky = $.map(data, function(ret, key) {
				return ret.id;
			});
			mentions_em = $.map(data, function(ret, key) {
				return ret.em;
			});
			
		});
	//	console.log(JSON.stringify(mentions_data));
		///////////////////////////////////////////////////////////////////////////
		
		var data = JSON.stringify({
			id : gTodo.select_id,
			owner : owner,
			msg : mentions_msg,	//msg
			mention : mentions_data
		});
		
		
		
		var url = gap.channelserver + "/reply_todo_save.km";
		$.ajax({
			type : "POST",
			dataType : "text",
			url : url,
			data : data,
			success : function(res){
							
				var rrx = JSON.parse(res);
				
				if (rrx.result == "OK"){
					$("#todo_compose_reply_list").show();
					
					var id = rrx.data.tkey;
					var GMT = rrx.data.GMT;
					
//					var member_img = gap.person_photo(owner.pu);
//					var member_name = owner.nm;
//					var company = owner.cp;
//					var dept = owner.dp;
//					var email = owner.em;
//					var jt = owner.jt;
//					if (gap.curLang != "ko"){
//						member_name = owner.enm;
//						jt = owner.ejt;
//					}
					
					var user_info = gap.user_check(owner);
					
					var time = gap.change_date_localTime_full2(GMT);
					msg = msg = gap.message_check(msg);
					
					
					if (mentions_msg.indexOf("<mention data") > -1){
						//멘션이 포함된 메시지는 HTML형식이 적용되도록 처리한다.
						msg = gap.textToHtml(mentions_msg).replace(/&nbsp;/g, " ");
					}
					
					var html = "";

					html += "<dl id='"+id+"'>";
					html += "	<dt>";
					html += "		<div class='user'>";
					html += "				<div class='user-thumb'>"+user_info.user_img+"</div>";
					html += "		</div>";
					html += "	</dt>";
					html += "	<dd>";
					html += "		<span>"+user_info.name+"<em class='team'>"+user_info.dept+"</em><em>"+time+"</em></span>";
					html += "		<button class='btn-reply-more'><span class='ico ico-reply-more'>더보기</span></button>";
					html += "		<!--<button class='btn-reply-del'><span>삭제</span></button>-->";
					html += "		<p>"+msg+"</p>";
					html += "	</dd>";
					html += "</dl>";
					
					$("#todo_compose_reply_list").append(html);
					
					//댓글 스크롤 하단으로 이동
					$("#todo_compose_reply_list").animate({ scrollTop: $('#todo_compose_reply_list').prop("scrollHeight")}, 1000);
					
					gTodo.reply_count_check();
					
					//멘션 클릭 이벤트 추가
					gTodo.mention_event();

				
					// mention div 영역 초기화
					gap.reset_mentions_div();
					
					//텍스트 박스 초기화
					$(e.currentTarget).val("");
					
					
					var change_doc = rrx.data.doc.doc;
					gTodo.change_local_data(change_doc);
					
					
				//	gTodo.__todo_compose_event();	// 원래 해당 함수를 호출하였으나 멘션 호출에 문제가 있어서 호출하지 않고 아래 저장된 댓글의 버튼 이벤트만 별도로 호출하여 추리
					
					// 저당된 댓글 '더보기' 메뉴 버튼 이벤트 처리
					$(".btn-reply-more").off();
					$(".btn-reply-more").on("click", function(e){
						$.contextMenu({
							selector : ".btn-reply-more",			
							autoHide : false,
							trigger : "left",
							callback : function(key, options){
								
								var todo_id = gTodo.select_id;
								var rid = $(this).parent().parent().attr("id");
								
								gTodo.context_menu_call_reply_todo(key, todo_id, rid);
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
									items: gBody3.reply_context()
								}
							}
						});
					});
					
					
					//본인을 제외한 멤버들에게 Push 알림을 전송한다.
					
					var rdoc = rrx.data.doc.doc;
												
					var member_list = $.unique(gap.check_cur_todo_members());
//					for (var i = 0 ; i < member_list.length; i++){
//						var mk = member_list[i];
//						
//					}
					if (member_list.length > 0){
						var obj = new Object();
						obj.id = rdoc._id.$oid;             // gTodo.select_id;
						obj.type = "reply";  //change status
						obj.p_code = rdoc.project_code;    //gTodo.cur_todo_code;
						obj.p_name = gap.textToHtml(rdoc.project_name);    //gTodo.cur_todo_name;
						obj.title = rdoc.title;            //gTodo.select_todo.title;
						obj.sender = member_list;  //해당 프로젝트의 owner에게만 전송한다.							
						_wsocket.send_todo_msg(obj);	
					}
					
					
			//		if (member_list.length > 0){
						var smsg = new Object();
						smsg.msg = "[" + gap.textToHtml(rdoc.project_name) + "] " + gTodo.short_title(rdoc.title) + " - " + gap.lang.reg_reply;  //"[" + gTodo.cur_todo_name + "] " + obj.title + " - " + gap.lang.reg_reply;
						smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";
						smsg.type = "reply";
						smsg.key1 = rdoc.project_code;
						smsg.key2 = rdoc._id.$oid;
						smsg.key3 = "";
						smsg.fr = gap.userinfo.rinfo.nm;
						//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
						smsg.sender = member_list.join("-spl-");
						
						if (mentions_data.length > 0){
							smsg.mention_log = "T";
							smsg.project_name = gap.textToHtml(rdoc.project_name);
							smsg.emails = mentions_em.join("-spl-");
							smsg.sender = mentions_ky.join("-spl-");
							smsg.content = mentions_msg;
						//	gap.push_noti_mobile(smsg);		
							
						}else if (member_list.length > 0){
						//	gap.push_noti_mobile(smsg);		
						}
						
						//알림센터에 푸쉬 보내기 ///////////////////////////////////////////////////////////////////////////
						
						var rid = rdoc.project_code;
						var receivers = member_list;
						var msg2 = "[" + gTodo.short_title(rdoc.title) + "] " + gap.lang.reg_reply;	
						var sendername = "[" +  gTodo.short_title(rdoc.title) + "] " + gap.lang.reg_reply;
						var data = smsg;
						gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
						
						/////////////////////////////////////////////////////////////////////////////////////////
						
						
			//		}
				
					
//					return false;
//					var member_list = gTodo.cur_project_info.member;
//					var mlist = [];
//					for (var i = 0 ; i < member_list.length; i++){
//						var mk = member_list[i].ky;
//						if (mk != gap.userinfo.rinfo.ky){
//							var obj = new Object();
//							obj.id = gTodo.select_id;
//							obj.type = "reply";  //change status
//							obj.p_code = gTodo.cur_todo_code;
//							obj.p_name = gTodo.cur_todo_name;
//							obj.title = gTodo.select_todo.title;
//							obj.sender = mk;  //해당 프로젝트의 owner에게만 전송한다.							
//							_wsocket.send_todo_msg(obj);	
//							mlist.push(mk);
//						}
//					}
//					if (gTodo.cur_project_info.owner.ky != gap.userinfo.rinfo.ky){
//						var obj = new Object();
//						obj.id = gTodo.select_id;
//						obj.type = "reply";  //change status
//						obj.p_code = gTodo.cur_todo_code;
//						obj.p_name = gTodo.cur_todo_name;
//						obj.title = gTodo.select_todo.title;
//						obj.sender = gTodo.cur_project_info.owner.ky;  //해당 프로젝트의 owner에게만 전송한다.							
//						_wsocket.send_todo_msg(obj);
//						mlist.push(gTodo.cur_project_info.owner.ky);
//					}
//					
//					if (mlist.length > 0){
//						var smsg = new Object();
//						smsg.msg = "Todo";
//						smsg.title = obj.title + " " + gap.lang.reg_reply;		
//						smsg.type = "todo";
//						smsg.key1 = gTodo.cur_todo_code;
//						smsg.key2 = gTodo.select_id;
//						smsg.key3 = "";
//						smsg.fr = gap.userinfo.rinfo.nm;
//						//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
//						smsg.sender = mlist.join("-spl-");										
//						gap.push_noti_mobile(smsg);		
//					}
					
					if (gTodo.open_todo_mention){
						//왼쪽 멘션 메뉴 클릭 -> 오른쪽 레이어가 열려 있는 경우 해당 리스트 재호출
						setTimeout(function(){
							gTodoC.draw_todo_mention(1);
						}, 800);
					}						
				}
				
			},
			error : function(e){
				gap.error_alert();
			}
		})
		
		
		
	    e.stopPropagation();
	    e.preventDefault();
		
	},
	
	"__item_delete_event" : function(){

		$(".g-owner .btn-g-del").off();
		$(".g-owner .btn-g-del").on("click", function(e){
			
			
			var pa = $(e.currentTarget).parent().parent().attr("id");
			var uu = $(e.currentTarget).next().get(0).dataset.ky;
			var ty = "owner";
			if (pa == "refer_list"){
				ty = "refer";
			}
			
			var del_text = $(this).parent().text();
			var data = JSON.stringify({
				todo_id : gTodo.select_id,
				ty : ty,
				user : uu
			});
			var url = gap.channelserver + "/delete_sub_item_todo.km";
			$.ajax({
				type : "POST",
				dataType : "text",
				url : url,
				data : data,
				success : function(res){
					var rres = JSON.parse(res);
					if (rres.result == "OK"){
						
						
						var type = rres.data.call;
						
						var change_doc = rres.data.doc;
						
						
						
						if (type == "refer"){
							
							var ref = change_doc.ref;
							$("#refer_list").find(".user").remove();
							
							for (var i = 0 ; i < ref.length; i++){
								var info = ref[i];
								var user_info = gap.user_check(info);
								
								var person_img = "<div class='user'><button class='btn-g-del'></button><div class='user-thumb' data-ky='"+user_info.ky+"'>"+user_info.user_img+"</div></div>";
								$("#refer_list").append(person_img);
							}
							
						}else{
							var html = "<img src='"+root_path+"/resource/images/user_d.jpg' alt=''>";
						//	$(".g-owner .user-thumb").html(html);
							
							$("#asignee_btn").html(html);
							
							$(".g-owner .btn-g-del").remove();
							
							//하단에 사용자 제거한다.
							if (gTodo.cur_todo == "user"){
								gTodo.todo_call_users();
							}else{
								$("#card_" + gTodo.select_id + " .user").hide();
							}
						}
												
						
						gTodo.__item_delete_event();
						
						if (type != "refer"){
							//담당자 지정할 경우만 사용한다.
							//일정에 삭제를 요청한다.
							var obb = new Object();						
							obb.del_id = gTodo.select_todo.project_code + "^" +  gTodo.select_todo._id.$oid;
							obb.del_emp = gTodo.select_todo.asignee.ky;
							gap.schedule_update(obb, "asignee", "D");
						}

						
						//다 정리하고 로컬을 정리해야 한다.
						gTodo.change_local_data(change_doc);
						
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});
		});
		
		$(".todo-tag .btn-g-del").off();
		$(".todo-tag .btn-g-del").on("click", function(e){
			
			
			$(this).parent().remove();
			var del_text = $(this).parent().text();
			var data = JSON.stringify({
				todo_id : gTodo.select_id,
				del_text : del_text,
				ty : "tag"
			});
			var url = gap.channelserver + "/delete_sub_item_todo.km";
			$.ajax({
				type : "POST",
				dataType : "text",
				url : url,
				data : data,
				success : function(res){
					var rres = JSON.parse(res);
					if (rres.result == "OK"){
												
						var list = $("#tag_list_div span");
						var html = "";
						for (var i = 0 ; i < list.length; i++){
							var txt = list[i].textContent;
							html += "<span>" + txt + "</span>";
						}
						
						//하단 부분 정보 변경한다.
						$("#card_" + gTodo.select_id  + " .todo-tag").html(html);
						
						var change_doc = rres.data.doc;
						gTodo.change_local_data(change_doc);
						
						
						gTodo.__item_delete_event();
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});
			
		});
		
		$(".g-color .btn-g-del").off();
		$(".g-color .btn-g-del").on("click", function(e){
			
			var cls = $(this).parent().attr("class").replace("color ", "");
			var del_text = $(this).parent().text();
			var data = JSON.stringify({
				todo_id : gTodo.select_id,
				ty : "color"
			});
			var url = gap.channelserver + "/delete_sub_item_todo.km";
			$.ajax({
				type : "POST",
				dataType : "text",
				url : url,
				data : data,
				success : function(res){
					var rres = JSON.parse(res);
					if (rres.result == "OK"){
						
						
						var change_doc = rres.data.doc;
						gTodo.change_local_data(change_doc);
						
						$(".g-color .color").remove();
						
						
						//하단에 색상 제거한다.
						if (gTodo.cur_type == "status"){
							$("#card_" + gTodo.select_id + " .color-bar").removeClass(cls);
						}else if (gTodo.cur_type == "list"){
							$("#list_card_" + gTodo.select_id + " .color-bar").removeClass(cls);
						}
						
						
						gTodo.__item_delete_event();
						
						// 캘린더 이벤트 업데이트
						gTodoC.update_calendar_event(gTodo.select_id);
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});
		});
	},
	
	"__todo_compose_event" : function(){
		
		
//댓글에 more버튼 이벤트 처리
		
		
		
		
		//달력 설정하는 부분을 지정해야 댓글 작성하고 달력 클릭시 오류가 발생하지 않는다.
		//gTodo.__todo_selectDate_event();
		
		//기존에 체크리스트에 대한 이벤트를 적용한다.
		gTodo.__todo_checklist_after_event();
		
		
		//여러번 호출되면 안되서 최초 양식 그릴때 한번만 호출하기 위해서 다른 함수(compose_layer_draw)로 이동한다.
	//	if (gTodo.compose_admin){
	//		gTodo.__todo_selectDate_event();			
	//		gTodo.__item_delete_event();
	//	}
		
		$("#asignee_btn").off();
		$("#asignee_btn").on("click", function(e){
			
			if (gTodo.compose_admin){
				
				gTodo._click_obj = $(e.currentTarget);
				
				var click_id = $(this).attr("id");
				gTodo.click_checklist_id = click_id;
				gTodo.todo_select_user_layer(e);
			}
			
		});
		
//		$(".g-owner .user-thumb").off();
//		$(".g-owner .user-thumb").on("click", function(e){
//			
//			if (gTodo.compose_admin){
//				gTodo._click_obj = $(e.currentTarget);
//				
//				var click_id = $(this).attr("id");
//				gTodo.click_checklist_id = click_id;
//				gTodo.todo_select_user_layer(e);
//			}
//			
//		});
		
		
		$(".g-tag .btn-g-add").off();
		$(".g-tag .btn-g-add").on("click", function(e){
			
			gTodo._click_obj = $(e.currentTarget);
			
			var click_id = $(this).attr("id");
			gTodo.click_checklist_id = click_id;
			gTodo.todo_select_tag_layer(e);	
		});
		
		
		$(".g-color .btn-g-add").off();
		$(".g-color .btn-g-add").on("click", function(e){
			
			gTodo._click_obj = $(e.currentTarget);
			
			var click_id = $(this).attr("id");
			gTodo.click_checklist_id = click_id;
			gTodo.todo_select_color_layer(e);
		});
		
		
		
		//상태값 변경시 호출
		$("#st_sel").off();
		$("#st_sel").on("change", function(e){
			
			var key = $("#st_sel option:selected").attr("id");
			var skey = key.replace("chx_", "");
		
			var data = JSON.stringify({
			//	project_code : gTodo.cur_todo_code,
				project_code : gTodo.select_todo.project_code,
				update_key : "status",
				update_data : skey,
				select_key : "_id",
				select_id : gTodo.select_id
			});

			var url = gap.channelserver + "/update_todo_item_sub.km";
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				data : data,
				url : url,
				success : function(res){
					if (res.result == "OK"){
											
						//리스트 모드 인지 카드 모드 인지에 따라 선택된 데이터를 이동한다.				
						var change_doc = res.data.doc;
						gTodo.change_local_data(change_doc);
																	
						//아카이브 목록에서 상태를 변경한 경우 해당 아카이브를 화면에서 삭제
						if (skey != "4" && gTodo.select_todo.status == "4"){
							//이전 상태가 아키이브이고 현재 선택한 상태가 아카이브가 아닐 경우 처리하는 로직
							$("#archive_" + gTodo.select_id).remove();
							gTodo.cur_project_item_list.push(change_doc);
						}
						//////////////////////////////////////////////////
																
						if (gTodo.cur_type == "card"){
							
							$("#card_0").empty();
							$("#card_1").empty();
							$("#card_2").empty();
							$("#card_3").empty();
							
							gTodo.draw_todo_body_card();
						}else if (gTodo.cur_type == "list"){
							gTodo.todo_center_status_list();
						}
						
						
						
						//상태가 변경될 경우 알려주는 함수를 호출한다. //////////////
						//알려주는 대상자는 1. 프로젝트 Owner, 2. TODO 작성자
												
						var obj = new Object();
						obj.id = change_doc._id.$oid;
						obj.type = "cs";  //change status
						obj.p_code = change_doc.project_code;
						obj.p_name = gap.textToHtml(change_doc.project_name);
						obj.title = change_doc.title;
						obj.status = change_doc.status;
						
					
						var tsender = [];
						if (gTodo.cur_project_info.owner.ky != gap.userinfo.rinfo.ky){							
						//	obj.sender = gTodo.cur_project_info.owner.ky;  //해당 프로젝트의 owner에게만 전송한다.		
							var list = [];
							list.push(gTodo.cur_project_info.owner.ky);
							obj.sender = list;
							_wsocket.send_todo_msg(obj);
							tsender.push(gTodo.cur_project_info.owner.ky);
						}
						//현재 수정하는 사용자가  TODO생성자가 아닐 경우 TODO생성자에게 알림을 전송한다.		
						if (gTodo.cur_project_info.owner.ky != gTodo.select_todo.owner.ky){	
							if (gTodo.select_todo.owner.ky != gap.userinfo.rinfo.ky){
							//	obj.sender = gTodo.select_todo.owner.ky;  //TODO생성자에게 전송한다.		
								var list = [];
								list.push(gTodo.select_todo.owner.ky);
								obj.sender = list;
								_wsocket.send_todo_msg(obj);	
								gTodo.cur_project_info.owner.ky 
								tsender.push(gTodo.select_todo.owner.ky);
							}
						}
						
						
						 //모바일  Push를 날린다. ///////////////////////////////////		
						var mx = "";
						if (obj.status == "0"){
							mx = gap.lang.temps;
						}else if (obj.status == "1"){
							mx = gap.lang.wait;
						}else if (obj.status == "2"){
							mx = gap.lang.doing;
						}else if (obj.status == "3"){
							mx = gap.lang.done;
						}
						var smsg = new Object();
						smsg.msg = "[" + gap.textToHtml(change_doc.project_name) + "] " + gTodo.short_title(obj.title) + " - " + gap.lang.cs.replace("$s",mx);
						smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";
						smsg.type = "cs";
						smsg.key1 = change_doc.project_code;
						smsg.key2 = change_doc._id.$oid;
						smsg.key3 = "";
						smsg.fr = gap.userinfo.rinfo.nm;
						//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.
						if (tsender != ""){
							smsg.sender = tsender.join("-spl-");
						//	gap.push_noti_mobile(smsg);
							
							//알림센터에 푸쉬 보내기
							var rid = change_doc.project_code;
							var receivers = tsender;
							var msg2 = "[" + gTodo.short_title(obj.title) + "] "  + gap.lang.cs.replace("$s",mx);	
							var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(change_doc.project_name) +"]"
							var data = smsg;
							gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
						}	
																
						//////////////////////////////////////////////////////
						
						
						//일정 연동되는 부분에 "3"일 경우 완료 처리해 준다.
						if (change_doc.status == "3"){
							gap.todo_connect_schedule_update(change_doc, "T", "");
							$("#todo_compose_checklist_save").hide();
						}else{
							if (gTodo.select_todo.status == "3"){
								gap.todo_connect_schedule_update(change_doc, "P", "");
								$("#todo_compose_checklist_save").show();
							}							
						}
						
						gTodo.select_todo = change_doc;
						
						
					}else{
						gap.error_alert();
					}
					
				},
				error : function(e){
					gap.error_alert();
				}
			});
			
			
		});
		
		
		//우선 순위 변경시 호출
		$("#pt_sel").off();
		$("#pt_sel").on("change", function(e){
		
			var key = $("#pt_sel option:selected").attr("id");
			var skey = parseInt(key.replace("chp_", ""));
			
			var data = JSON.stringify({
			//	project_code : gTodo.cur_todo_code,
				project_code : gTodo.select_todo.project_code,
				update_key : "priority",
				update_data : skey,
				select_key : "_id",
				select_id : gTodo.select_id
			});

			var url = gap.channelserver + "/update_todo_item_sub.km";
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				data : data,
				url : url,
				success : function(res){
					if (res.result == "OK"){
						
						//하단에 우선 순위를 변경한다.
						gTodo.priority_status_check(skey);
						
						var change_doc = res.data.doc;
						gTodo.change_local_data(change_doc);
						
						
					}else{
						gap.error_alert();
					}
					
				},
				error : function(e){
					gap.error_alert();
				}
			});
			
			
		});
/*	
 * 		댓글 저장 후 해당 이벤트 설정으로 변경 - 2022.03.31	
		$(".btn-reply-more").off();
		$(".btn-reply-more").on("click", function(e){
			
			$.contextMenu({
				selector : ".btn-reply-more",			
				autoHide : false,
				trigger : "left",
				callback : function(key, options){
					
					var todo_id = gTodo.select_id;
					var rid = $(this).parent().parent().attr("id");
					
					gTodo.context_menu_call_reply_todo(key, todo_id, rid);
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
						items: gBody3.reply_context()
					}
				}
			});
		});
*/		
//		$("#todo_compose_reply_list .ico-reply-more").off();
//		$("#todo_compose_reply_list .ico-reply-more").on("click", function(e){
//		
//			$.contextMenu({
//				selector : "#todo_compose_reply_list .ico-reply-more",			
//				autoHide : false,
//				trigger : "left",
//				callback : function(key, options){
//					
//					var todo_id = gTodo.select_id;
//					var rid = $(this).parent().parent().parent().attr("id");
//					
//					gTodo.context_menu_call_reply_todo(key, todo_id, rid);
//				},
//				events : {
//					hide: function (options) {
//						$(this).removeClass("on");
//					},
//					show : function (options){
//					}
//				},			
//				build : function($trigger, options){
//					options.handleObj.data.zIndex = parseInt(gap.maxZindex()) + 1;
//						return {
//						items: gBody3.reply_context()
//					}
//				}
//			});
//		});
//		
		
/*
 * 		작성창 띄울 때 한번만 호출로 변경 - 2022.03.31		
		//댓글 입력 이벤트 처리	////////////////////////////////////////////////////	
		$("#todo_reply_input").off();
		$("#todo_reply_input").bind("keypress", function(e){
			
			if (e.keyCode == 13){
				
				var enter_opt = gTodo.enter_opt;		
		        if (e.keyCode == 13 && !e.shiftKey){          	
		        	if (enter_opt == "1" || enter_opt == ""){
		        		gTodo.sendMessage(e);            
		        	}else if (enter_opt == "2"){
		        		//다음줄로 내려간다.    
		        		gTodo.enter_next_line_todo(e);
		        	}
		        }           
		        if (e.keyCode == 13 && e.shiftKey) {
		        	if (enter_opt == "1"){
		        		//다음줄로 내려간다.
		        		gTodo.enter_next_line_todo(e);
		        	}else{
		        		gTodo.sendMessage(e);  
		        	}       	
		        }
			}
		});
		
		$("#todo_reply_input").bind("keyup", function(e){
			if (e.keyCode == 8 || e.keyCode == 46){		// backspace or delete key
				gTodo.enter_line_control_todo(e);
			}
		});
		////////////////////////////////////////////////////////////////////////
*/		
		//즐겨찾기 버튼 클릭시
		$(".todo-view-left .btn-star").off();
		$(".todo-view-left .btn-star").on("click", function(e){
			gTodo.update_star_task(gTodo.select_id);
		});
		
		 
		//할일 조회 화면에서 more버튼 클릭시
		$(".todo-view-left .btn-top-more").off();
		$(".todo-view-left .btn-top-more").on("click", function(e){
					
			if (e.target.className == "ico btn-more btn-top-more"){
				$.contextMenu({
					selector : ".todo-view-left .btn-top-more",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
						gTodo.context_menu_call(key, options, gTodo.select_id);
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
						},
						show : function (options){
						}
					},			
					build : function($trigger, options){
						var owner = gTodo.select_todo.owner.em;
						var status = gTodo.select_todo.status;
						return {
							items: gTodo.todo_info_menu_content('card_menu', owner, status)
						}
					}
				});
			}				
			
		});
		
		
		//////////////////////////////////////////////////////////////////////////
		
		$("#todo_top_title_show_p").off();
		$("#todo_top_title_show_p").on("mouseover", function(e){
			$(this).css("border", "1px solid #e4e4e9");
		});
		
		$("#todo_top_title_show_p").off();
		$("#todo_top_title_show_p").on("mouseout", function(e){
			$(this).css("border", "none");
		});
		
		$("#todo_compose_express").off();
		$("#todo_compose_express").on("mouseover", function(e){
			$(this).css("border", "1px solid #e4e4e9");
		});
		
		$("#todo_compose_express").off();
		$("#todo_compose_express").on("mouseout", function(e){
			$(this).css("border", "none");
		});
		
		$("#todo_top_title_input2").off();
		$("#todo_top_title_input2").on("click", function(e){
						
			if (gTodo.compose_admin){
				$("#todo_top_title_input").show();
				$(this).hide();
			}

		});
		
		$("#todo_top_express_input2").off();
		$("#todo_top_express_input2").on("click", function(e){
			if (gTodo.compose_admin){
				$("#todo_top_express_input").show();
			//	$("#todo_compse_express_save").show();
				$(this).hide();
			}

		});
		
		
		gTodo.__todo_file_event();
		
			
		
		var selectid = "todo_file_area";
		
		//파일 업로드하기 ////////////////////////////////////////////////////////////////////////
		//todo_add_file_btn
		var isdropzone2 = $("#" + selectid)[0].dropzone;
		if (isdropzone2) {
			isdropzone2.destroy();
			//return false;
		}
		myDropzone_todo = new Dropzone("#" + selectid, { // Make the whole body a dropzone
		      url: gap.channelserver + "/FileControl_todo.do", // Set the url
		//      autoProcessQueue : true, 
			  parallelUploads : 100,     //병렬로 여러개 올리면 각각 계산해야 하기 때문에 서버에 부하를 많이 준다... 전체가 완료된 상태에서 한번에 데이터를 추가하는 방식으로 변경한다.
			  maxFilesize: 1000,
			  timeout: 36000000,
		  	  uploadMultiple: true,
		  	  withCredentials: false,
		  	  previewsContainer: "#previews_channel", // Define the container to display the previews
		  	  clickable: "#todo_add_file_btn", // Define the element that should be used as click trigger to select files.
		  	  renameFile: function(file){
				return file.name = (gap.browser == "msie" ? file.name : file.name.normalize());		//macOS에서 업로드 시 한글파일명 자소가 깨지는 현상 방지
			  },
		  	  init: function() {		
					myDropzone_todo = this;
					gTodo.dropzone = this;
				//	this.imagelist = new Array();
				//	this.on('error', function(file, response){			        	
			    //    	gap.gAlert(response);       	
			     //   	return false;
			    //    });
//					this.on('dragover', function(e,xhr,formData){
//			        	$("#"+selectid).css("border", "2px dotted #005295");
//			        	return false;
//			        });
//			        this.on('dragleave', function(e,xhr,formData){
//			        	$("#"+selectid).css("border", "");
//			        	return false;
//			        });	    		              
					
		      },
		      success : function(file, json){		    
		 
		    	  var jj = JSON.parse(json);	    	  
		    	  if (jj.result == "OK"){	    	
		    		  
		    		  myDropzone_todo.ucount ++;
		    		  myDropzone_todo.files_info = jj;
		    	  }
		    	 		
		      }		
		});
		
		myDropzone_todo.on("totaluploadprogress", function(progress) {				
			$("#show_loading_progress").text(parseInt(progress) + "%");
			document.querySelector("#total-progress_todo .progress-bar").style.width = progress + "%";
		});
		
		myDropzone_todo.on("queuecomplete", function (file) {
			
			gap.hide_loading2();
			
			if (typeof(myDropzone_todo.files_info.data) == "undefined"){
				//동일한 파일을 업로드 한 경우 예외처리 한다.
				gTodo.clear_dropzone();
				var xtime1 = setTimeout(function(){
					gTodo.complete_process_todo();
					clearTimeout(xtime1);
				}, 800);
				
				return false;
			}
			
			var change_doc = myDropzone_todo.files_info.data.doc;
			gTodo.change_local_data(change_doc);
			
			var list = myDropzone_todo.files_info.files;
			var fserver = myDropzone_todo.files_info.fserver;
			var ucount = myDropzone_todo.ucount;
			var rest_count = parseInt(ucount) - parseInt(list.length);
			
			if (rest_count > 0){
				gap.gAlert(gap.lang.replc.replace("#",rest_count));
			}
			
			for (var i = 0 ; i < list.length; i++){

	    		var f = list[i];
	    		var icon = gap.file_icon_check(f.filename);
	    		var fsize = gap.file_size_setting(f.file_size.$numberLong);
	    		var md5 = f.md5.replace(".","_");
	    		var owner = f.owner;
	    		var name = owner.nm;
	    		var dept = owner.dp;
	    		if (gap.curLang != "ko"){
	    			name = owner.enm;
	    		}    		
	    	    		
	    		var time = gap.change_date_localTime_full2(f.GMT);
	    		var html = "";
	    		html += "					<li id='"+md5+"' data1='"+gap.HtmlToText(f.filename)+"' data2='"+fserver+"'>";
	    		html += "						<span class='ico ico-file "+icon+"'></span>";
	    		html += "						<div class='attach-name'><span>"+f.filename+"</span><em>("+fsize+")</em></div>";
	    		html += "						<div class='attach-info'>";
	    		html += "							<span>"+name+"<em class='team'>"+dept+"</em><em>"+time+"</em></span>";
	    		html += "						</div>";
	    		
	    		var is_show = gap.check_preview_file(f.filename);
	    		var is_pre = gap.is_file_type(f.filename);
	    		
	    	
	    		if (is_show || is_pre == "img" || is_pre == "movie"){
	    			html += "						<button class='ico btn-file-view'>파일보기</button>";
	    		}
	    		
	    		html += "						<button class='ico btn-file-download' >다운로드</button>";
	    		if (owner.ky == gap.userinfo.rinfo.ky){
	    			html += "						<button class='ico btn-delete'>삭제</button>";
	    		}
	    		
	    		html += "					</li>";	
	    		
	    			    			
	    		$("#todo_compose_view_attach").append(html);
			}
			
			
			//파일 건수 표시
			var fcount = $("#todo_compose_view_attach li").length;
			$("#todo_file_count").html(" ("+ fcount +")");
						
			gTodo.file_count_check();
			
			//파일관련 이벤트를 재설정 한다.
			gTodo.__todo_file_event();
			
			
			gTodo.clear_dropzone();
			var xtime1 = setTimeout(function(){
				gTodo.complete_process_todo();
				clearTimeout(xtime1);
			}, 800);
			
	
			//본인을 제외한 멤버들에게 Push 알림을 전송한다.
			
			var member_list = $.unique(gap.check_cur_todo_members());
//			for (var i = 0 ; i < member_list.length; i++){
//				var mk = member_list[i];
//				
//			}
			if (member_list.length > 0){
				var obj = new Object();
				obj.id = gTodo.select_id;
				obj.type = "attach";  //change status
				obj.p_code = gTodo.cur_todo_code;
				obj.p_name = gap.textToHtml(gTodo.cur_todo_name);
				obj.title = gTodo.select_todo.title;
				obj.sender = member_list;  //해당 프로젝트의 owner에게만 전송한다.							
				_wsocket.send_todo_msg(obj);	
			}
			
			
			if (member_list.length > 0){
				var smsg = new Object();
				smsg.msg = "[" + gap.textToHtml(gTodo.cur_todo_name) + "]" + gTodo.short_title(gTodo.select_todo.title) + " - " + gap.lang.reg_file;
				smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";
				smsg.type = "attach";
				smsg.key1 = gTodo.cur_todo_code;
				smsg.key2 = gTodo.select_id;
				smsg.key3 = "";
				smsg.fr = gap.userinfo.rinfo.nm;
				//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
				smsg.sender = member_list.join("-spl-");										
			//	gap.push_noti_mobile(smsg);	
				
				//알림센터에 푸쉬 보내기
				var rid = gTodo.cur_todo_code;
				var receivers = member_list;
				var msg2 = "[" + gTodo.short_title(gTodo.select_todo.title) + "] " + gap.lang.reg_file;
				var sendername = "["+gap.lang.ch_tab3+" : " + gap.textToHtml(change_doc.project_name) +"]"
				var data = smsg;
				gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
			}
				
			
		});
		
		myDropzone_todo.on("addedfiles", function (file) {			
			
 	        $("#"+selectid).css("border", "");
//			gBody3.popup_status = "file";
//			gBody3.add_upload_file_list(file, "file");	
//			
//			$("#f_u1").text(gap.lang.file + " " + gap.lang.upload);
//			$("#f_u2").text(gap.lang.scpp);
//			
//			gap.showBlock();
//	
//			var inx = parseInt(gap.maxZindex()) + 1;
//			$("#fileupload_layer").css("z-index", inx);
//			$("#fileupload_layer").fadeIn();
//			
//
//			$("#total-progress_todo").show();
 	        	       
 	       for (var i = 0 ; i < file.length; i++){
				var fx = file[i];
				
				// gap.dropzone_upload_limit(this, fx, "box");
						
				//일반 파일일 경우 사이즈를 100M로 설정한다.
				//alert(fx.size + "/" + gTodo.file_max_upload_size);
				if (fx.size > (gTodo.file_max_upload_size_todo * 1024 * 1024)){
					gap.gAlert("'" + fx.name + "'" + "" + gap.lang.file_ex + "<br>(MaxSize : " + gTodo.file_max_upload_size_todo + "M)");
											
					$("#total-progress_todo").hide();
					
				//	gTodo.removeF(fx);		
					gTodo.dropzone.removeFile(fx);
				//	return false;
					
					if (!myDropzone_todo.sendOK){
						myDropzone_todo.sendOK = false;
					}	
					
					//return false;
				}else{
					
					if (gap.no_upload_file_type_check(fx.name)){
						$("#total-progress_todo").hide();
						gTodo.dropzone.removeFile(fx);						
						gap.gAlert(fx.name + " " + gap.lang.nofileup);		
					}else{
						myDropzone_todo.sendOK = true;
					}
					
				}			
					
			}
// 	       
 	      if (myDropzone_todo.sendOK == false){					
			//	var curid = this.element.id;
			//	$("#"+curid).css("border", "");
 	    	  
 	    	  	$("#total-progress_todo").hide();
				return false;
			}
// 	      
 	     $("#total-progress_todo").show();			
//			
////			var imcount = 0; 
////			for (var i = 0 ; i < file.length; i++){
////				var fx = file[i];					
////				if (gap.check_image_file(fx.name)){	
////					//이미지는 썸네일 만든는 작업이 필요해서 한번에 이미지가 2개 이상일 경우 하나씩 올리는 형태로 처리한다.
////					imcount++;
////				}
////			}
////			myDropzone_todo.imcount = imcount;
//		//	if (imcount > 1){
//		//	myDropzone_todo.options.parallelUploads = 1;
//		//	myDropzone_todo.options.uploadMultiple = true;
//		//	}else{
// 	      	myDropzone_todo.options.parallelUploads = 1;
// 	      	myDropzone_todo.options.uploadMultiple = true;
//		//	}
//			
 	        myDropzone_todo.options.autoProcessQueue = true;		 
			myDropzone_todo.processQueue();
 	        
 	        
		});
		
		
		
		myDropzone_todo.on("sending", function (file, xhr, formData) {	
			
			
			gap.show_loading2(gap.lang.saving);
			
			myDropzone_todo.ucount = 0;
			
			$("#"+selectid).css("border", "");
			
		
					
			formData.append("email", gap.userinfo.rinfo.em);
			formData.append("todo_item_code", gTodo.select_id);
			formData.append("owner", JSON.stringify(gap.userinfo.rinfo));
			formData.append("fserver", gap.channelserver);
			formData.append("saveFolder", "todo");
		
			myDropzone_todo.files_info = "";
			$("#total-progress_todo").show();	
	       // $("#chat_msg").css("border","");
	        document.querySelector("#total-progress_todo .progress-bar").style.display = "";
		});
		
		
		///////////////////////////////////////////////////////////////////////////////////
		
		gTodo.__checklist_box_click_event();
		
		
		$("#todo_compose_close").off();
		$("#todo_compose_close").on("click", function(e){
			gTodo.view_mode = "list" //리스트 모드로 돌아감을 표시한다.
			$("#rmclose_reply_todo").click();		//댓글 수정창이 열려 있으면 닫음
			$("#rmclose_checklist_todo").click();	//체크리스트 수정창이 열려 있으면 닫음
			$('#compose_todo').hide();
			$(".qtip").remove();
			
			//호출한 화면이 메인인 경우 메인화면을 Refresh해준다.
			if (gap.cur_window == "boxmain"){
				gHome.refreshPage();
			}
			gap.hideBlock();
		});
		
		
		//체크리스트 전테 삭제
		$(".btn-attach-del").off();
		$(".btn-attach-del").on("click", function(e){
			
			var delete_id = gTodo.select_id;
			var url = gap.channelserver + "/delete_all_checklist.km";
			var data = JSON.stringify({
				delete_id : delete_id
			});
			
			$.ajax({
				type : "POST",
				dataType : "text",
				url : url,
				data : data,
				success : function(res){
					var rres = JSON.parse(res);
					if (rres.result == "OK"){
						$("#todo_compose_checklist li").remove();
						
						var change_doc = rres.data.doc;
						gTodo.change_local_data(change_doc);
						
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			})
			
		});
		
		
		//체크리스트를 등록한다.
		$("#todo_compose_checklist_save").off();
		$("#todo_compose_checklist_save").keypress(function(e){
			if (e.keyCode == 13){
				
				var tid = new Date().getTime() + "_" + Math.random().toString(26).substr(2,11);
				var txt = $(this).val();
				
				var data = JSON.stringify({
					tid : tid,
					txt : txt,
					key : gTodo.select_id,
					type : "checklist",
					action : "add",
					complete : "F"
				});
				var url = channelserver + "/update_todo_item_list.km";
				$.ajax({
					type : "POST",
					dataType : "text",
					url : url,
					data : data,
					success : function(res){
						var rres = JSON.parse(res);
					
						$("#card_" + gTodo.select_id + " .icons").show();
						$("#ck_" + gTodo.select_id).parent().show();
						
						var total_count = $("#todo_compose_checklist li").length;
						
						if (gTodo.cur_type == "card"){
							if (total_count == 1){
								//체크리스트를 처음 등록한다.							
								$("#ck_" + + gTodo.select_id).html("0/1");
							}else{
								var checked_count = $("#todo_compose_checklist .list-checked").length;							
								$("#ck_" + + gTodo.select_id).html(checked_count + "/" + total_count);
							}
						}else if (gTodo.cur_type == "list"){
							
						}
						
						
						
						
						
						var change_doc = rres.data.doc;
						gTodo.change_local_data(change_doc);
												
						
						gTodo.__checklist_box_click_event();						
						gTodo.__todo_checklist_after_event();
						
						//전체 건수를 표시해야 한다.
						gTodo.checklist_count_check();
						
						
						//체크리스트 qtip설정
						gTodo.checklist_qtip();
					},	
					error : function(e){
						gap.error_alert();
					}
				})
								
				
				var html = "";
				html += "<li id='"+tid+"'>";
				html += "	<button class='ico btn-check'>체크</button>";
				html += "	<p>"+txt+"</p>";
				html += "	<dl class='todo-list-right'>";
				html += "		<dd><span class='btn-time'><button class='ico ico-time'>시간</button><em></em></span></dd>";
				html += "		<dd><button class='ico btn-user-add'>사용자추가</button></dd>";
				html += "		<dd><button class='ico btn-more'>더보기</button></dd>";
				html += "	</dl>";
				html += "</li>";
				
				$("#todo_compose_checklist").append(html);
				$(this).val("");
				
				
			}
		});
		
		//설명문구에 포커스가 들어가면 저장 버튼이 표시딘다.
		$("#todo_compose_express").focus(function(e){
		//	$("#todo_compse_express_save").show();
		});

		
		$("#todo_compose_express_edit").blur(function(e){
		//	$("#todo_compse_express_save").hide();
			$("#todo_compose_express_save_btn").click();
		});
		
		$("#todo_compose_express_save_btn").off();
		$("#todo_compose_express_save_btn").on("click", function(e){
			//할일 설명을 업데이트 한다.
			
			var data = JSON.stringify({
				key : gTodo.select_id,
				express : $("#todo_compose_express_edit").val(),
			//	project_code : gTodo.cur_todo_code
				project_code : gTodo.select_todo.project_code
			});
			var url = gap.channelserver + "/update_todo_item.km";
			$.ajax({
				type : "POST",
				dataType : "text",
			//	contentType : "application/json; charset=utf-8",
				data : data,
				url : url,
				success : function(res){
					
					var rres = JSON.parse(res);
					if (rres.result == "OK"){
						$("#todo_compse_express_save").hide();
									
						$("#todo_top_express_input2").show();
						$("#todo_top_express_input").hide();
						$("#todo_compose_express").html( gap.message_check($("#todo_compose_express_edit").val()));
						
						
						var change_doc = rres.data.doc;
						gTodo.change_local_data(change_doc);
						
						// 캘린더 이벤트 업데이트
						gTodoC.update_calendar_event(gTodo.select_id);
						
						//담당자의 일정을 업데이트 한다.
						gap.schedule_update(change_doc, "asignee", "U");
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});
		});
		
		$("#todo_compose_express_cancel_btn").off();
		$("#todo_compose_express_cancel_btn").on("click", function(e){
			$("#todo_compse_express_save").hide();
			
			$("#todo_top_express_input2").show();
			$("#todo_top_express_input").hide();
			//$("#todo_compose_express").html( gap.message_check($("#todo_compose_express_edit").val()));
		});
		
		
		$("#todo_compose_title").focus(function(e){
			gTodo.title = $(this).val();
		});
		
		$("#todo_compose_title").blur(function(e){
		
			if (gTodo.title != $(this).val()){
				var data = JSON.stringify({
					key : gTodo.select_id,
					title : $("#todo_compose_title").val()
				});
				var url = gap.channelserver + "/update_todo_item.km";
				$.ajax({
					type : "POST",
					dataType : "text",
				//	contentType : "application/json; charset=utf-8",
					data : data,
					url : url,
					success : function(res){
						
						var rres = JSON.parse(res);
						
						$("#todo_top_title_input").hide();
						$("#todo_top_title_input2").show();
						$("#todo_top_title_show_p").text($("#todo_compose_title").val());
						
					
						if (gTodo.cur_type == "card"){
							var hm = $("#card_" + gTodo.select_id + " h3").html();
							var ot = $("#card_" + gTodo.select_id + " h3").text();
							var ct = $("#todo_compose_title").val();
							var tm = hm.replace(ot, ct);
							$("#card_" + gTodo.select_id + " h3").html(tm);
						}else if (gTodo.cur_type == "list"){
					
							var tm = $("#todo_compose_title").val();
							$("#list_card_" + gTodo.select_id + " .todo-sbj h3").html(tm);
						}
					

						
						var change_doc = rres.data.doc;
						gTodo.change_local_data(change_doc);
						
						//담당자의 일정을 업데이트 한다.
						gap.schedule_update(change_doc, "asignee", "U");
														
						
					},
					error : function(e){
						gap.error_alert();
					}
				});
			}
		});
	},
	
	
//	"checklist_contain" : function(email, check_id){
//		var list = gTodo.select_todo.checklist;
//		var res = false;
//		for (var i = 0 ; i < list.length; i++){
//			var info = list[i];
//			if (info.tid == check_id){
//				var res = "";
//				if (typeof(info.asign) != "undefined"){
//					if (info.asign.em == email){
//						return true;
//						break;
//					}
//				}
//			}
//		}
//		
//		return res;
//	},
	
	
	"removeF" : function(obj){
		$(obj).parent().remove();
		
		var filename = $(obj).attr("data");
		var size = $(obj).attr("data2");
				
		var list = myDropzone_todo.files;		
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];
			if ( (filename == item.name) && (size == item.size)){
				$("#total-progress_channel").hide();
				myDropzone_todo.removeFile(item);
				break;
			}
		}

	},
	
	
	"__checklist_box_click_event" : function(){
		//체크박스 클릭할 경우
		$("#todo_compose_checklist .btn-check").off();
		$("#todo_compose_checklist .btn-check").on("click", function(e){
		
			var email = $(e.currentTarget).parent().attr("data");
			var check_id = $(e.currentTarget).parent().attr("id");
			var is_checklist_owner = false;
			if (email == gap.userinfo.rinfo.em){
				is_checklist_owner = true;
			}
			
		
			if (gTodo.compose_admin || is_checklist_owner || gTodo.compose_asignee){
				var cc = "F";
				if ($(this).hasClass("on")){
					//선택된 것을 푼다.
					$(this).parent().removeClass("list-checked");
					$(this).removeClass("on");
					$(this).parent().find(".btn-time").removeClass("checked");
					
					//해당 체크 리스트를 완료 취소로 처리한다.
				}else{
					//클릭한것을 선택한다.
					$(this).parent().addClass("list-checked");
					$(this).addClass("on");
					$(this).parent().find(".btn-time").addClass("checked");		
					cc = "T";
				}
				
				//해당 체크 리스트를 제크 완료로 처리한다.
			
				//현재 클릭한 아이디의 배열에 완료예정일을 업데이트 한다.
				var click_id = $(this).parent().attr("id");
				var data = JSON.stringify({
				//	project_code : gTodo.cur_todo_code,
					project_code : gTodo.select_todo.project_code,
					update_key : "checklist.$.complete",
					update_data : cc,
					select_key : "checklist.tid",
					select_id : click_id,
					sid : gTodo.select_id
				});
				
			
				var url = gap.channelserver + "/update_todo_item_sub.km";
				$.ajax({
					type : "POST",
					dataType : "text",
				//	contentType : "application/json; charset=utf-8",
					data : data,
					url : url,
					success : function(res){
						
						var rres = JSON.parse(res);
						if (rres.result == "OK"){
							
							
							var change_doc = rres.data.doc;
							gTodo.change_local_data(change_doc);
							
							var st = "";
							if (cc == "T"){
								//완료 처리하기
								st = "T";
							}else{
								//완료 취소하기
								st = "P"
							}
														
							gap.todo_complete_one(change_doc, st, click_id, "");
							
						}else{
							gap.error_alert();
						}
						
					},
					error : function(e){
						gap.error_alert();
					}
				});
				
				gTodo.checklist_count_check();
			}else{
				gap.gAlert(gap.lang.cppi);
			}
			
		});
	},
	
	"complete_process_todo" : function(){
		$("#total-progress_todo .progress-bar").fadeOut(function(){
			document.querySelector("#total-progress_todo .progress-bar").style.display = "none";
			document.querySelector("#total-progress_todo .progress-bar").style.width = "0%";

		});
	},
	
	"clear_dropzone" : function(){
		$("#total-progress_todo").hide();
		myDropzone_todo.removeAllFiles(true);
		$("#todo_compose_add_attach").empty();
	},
	
	
	"todo_item_file_delete" : function(md5){
		//TODO item에 업로드한 특정 파일을 삭제한다.
		var data = JSON.stringify({
			id : gTodo.select_id,
			delete_key : md5
		});
				
		var url = gap.channelserver + "/delete_file_todo_item.km";
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : url,
			data : data,
			success : function(res){
				
			},
			error : function(e){
				gap.error_alert();
			}
		})
		
	},
	
	
	"item_list_count" : function(){
		//체크리스트, 파일, 댓글 의 전체 카운트를 계산한다.
		//만약 전체합이 0일 경우 icons 자체를 숨긴다.
	
		var checklist_count = $("#todo_compose_checklist li").length;
		var file_count = $("#todo_compose_view_attach li").length;
		var reply_count = $("#todo_compose_reply_list dl").length;
		
		var tcount = parseInt(checklist_count) + parseInt(file_count) + parseInt(reply_count);
		if (tcount == 0){
			$("#card_" + gTodo.select_id + " .icons").hide();
		}
		
	},
	
	"checklist_count_check" : function(){
		
		
		var checked_count = $("#todo_compose_checklist .list-checked").length;
		var total_count = $("#todo_compose_checklist li").length;
		
		var ck = checked_count + "/" + total_count;
		$(".check-graph em").html(ck);
		
		

		var rate = parseInt(checked_count) / parseInt(total_count);		
		rate = parseInt(rate * 100);
		if (total_count == 0){
			rate = 0;
		}
		$(".check-graph span").css("width", rate +"%");
		
		//하단이 리스트 모드일 경우 rate를 변경해 준다.
		$("#list_card_"+gTodo.select_id+" .todo-progress .bar").css("width", rate + "%")
		$("#list_card_"+gTodo.select_id+" .todo-progress em").html(rate + "%");
		
		//하단 리스트에 건수를 수정한다.		
		if (total_count == 0){
			$("#ck_" + gTodo.select_id).parent().hide();
		}
		
		if (total_count == checked_count){
			$("#ck_" + gTodo.select_id).parent().addClass("checked");
		}else{
			$("#ck_" + gTodo.select_id).parent().removeClass("checked");
		}
		$("#ck_" + gTodo.select_id).html(ck);
		
		
		//체크리스트 건수 표시
		var fcount = $("#todo_compose_checklist li").length;
		$("#todo_checklist_count").html(" ("+ fcount +")");
		$("#rdata2_cnt").html(" ("+ fcount +")");
		
		//하단의 숨김여부를 판단한다.
		gTodo.item_list_count();
		
	},
	
	
	"file_count_check" : function(){
		
		var tcount = $("#todo_compose_view_attach li").length;
				
		//하단 리스트에 건수를 수정한다.		
		$("#card_" + gTodo.select_id + " .icons").show();
		$("#file_" + gTodo.select_id).parent().show();
		$("#file_" + gTodo.select_id).html(tcount);		
		
		//파일 건수 표시
		var fcount = $("#todo_compose_view_attach li").length;
		
		if (gTodo.cur_type == "card"){
			$("#todo_file_count").html(" ("+ fcount +")");
		}else if (gTodo.cur_type == "list"){
			$("#list_card_" + gTodo.select_id + " .ico-clip").next().html(fcount);
		}
			
		//하단의 숨김여부를 판단한다.
		gTodo.item_list_count();
		
	},
	
	
	"reply_count_check" : function(){
		
		var tcount = $("#todo_compose_reply_list dl").length;
		
		//하단 리스트에 건수를 수정한다.		
		$("#card_" + gTodo.select_id + " .icons").show();
		$("#rep_" + gTodo.select_id).parent().show();
		$("#rep_" + gTodo.select_id).html(tcount);	
		
		//댓글 건수 표시
		var fcount = $("#todo_compose_reply_list dl").length;
		if (gTodo.cur_type == "card"){			
			$("#todo_reply_count").html(" ("+ fcount +")");
		}else if (gTodo.cur_type == "list"){
			$("#list_card_" + gTodo.select_id + " .ico-reply").next().html(fcount);
		}
		
		
		
		
		
		//하단의 숨김여부를 판단한다.
		gTodo.item_list_count();
		
	},
	
	
	"date_change_check" : function(startdate, enddate){
		
	
		var dinfo = gTodo.date_diff(startdate, enddate);
		var is_delay = false;
		
		
		if (gTodo.cur_type == "card"){
				
			if ($("#card_" + gTodo.select_id + " .status").length > 0){
				var status = $("#card_" + gTodo.select_id + " .status .ico").attr("class");
				if (status.indexOf("-complete") == -1){
					if (dinfo.rate > 100){
						is_delay = true;
					}
				}
			}else{
				//임시저장일 경우
				if (dinfo.rate > 100){
					is_delay = true;
				}
			}
			
			
			var html2="";
			html2 += "";
			html2 += "<span style='text-align:center'><div class='bar' style='width:"+dinfo.rate+"%;'></div>";
			html2 += "<em>"+dinfo.st+" ~ "+dinfo.et+" ("+dinfo.term+"day)</em></span>";
			
			$("#card_" + gTodo.select_id + " .todo-period").show();
			$("#card_" + gTodo.select_id + " .todo-period").html(html2);
			
			if (is_delay){
				$("#card_" + gTodo.select_id).addClass("delay");
			}else{
				$("#card_" + gTodo.select_id).removeClass("delay");
			}
			
			
		}else if (gTodo.cur_type == "list"){
			
			var status = $("#list_card_" + gTodo.select_id + " .status span").attr("class");
			if (status.indexOf("complete") == -1){
				if (dinfo.rate > 100){
					is_delay = true;
				}
			}
					
			$("#list_card_" + gTodo.select_id + " .todo-period .bar").css("width", dinfo.rate +"%");
			$("#list_card_" + gTodo.select_id + " .todo-period em").html(dinfo.st + "~" + dinfo.et + " ("+dinfo.term+"day)");
		
			if (is_delay){
				$("#list_card_" + gTodo.select_id).addClass("delay");
			}else{
				$("#list_card_" + gTodo.select_id).removeClass("delay");
			}
			
		}

		
		
	},
	
	"priority_status_check" : function(skey){
		if (gTodo.cur_type == "card"){
			$("#card_" + gTodo.select_id + " h3 span").removeAttr("class");		
			$("#card_" + gTodo.select_id + " h3 span").addClass("ico p"+skey);
		}else if (gTodo.cur_type == "list"){

			var tp = "<span class='ico p"+skey+"'></span>" + gap.lang["priority" + skey]
			$("#list_card_" + gTodo.select_id + " .todo-priority").html(tp);
		}

	},
	
	
	"tag_change_check" : function(tag){
		$("#card_" + gTodo.select_id + " .todo-tag").show();
		$("#card_" + gTodo.select_id + " .todo-tag").append("<span>" + tag + "</span>");	
	},
	
	
	"color_change_check" : function(color){
		if (gTodo.cur_type == "card"){
			$("#card_" + gTodo.select_id + " .color-bar").removeAttr("class");
			$("#card_" + gTodo.select_id).children().first().addClass("color-bar " + color);
		}else if (gTodo.cur_type == "list"){
			$("#list_card_" + gTodo.select_id + " .color-bar").removeAttr("class");
			$("#list_card_" + gTodo.select_id).children().first().addClass("color-bar " + color);
		}
	

	},
	
	
	"asignee_change_check" : function(info){
				
		if (gTodo.cur_todo == "user"){
		//	gTodo.todo_center_default_user();
			gTodo.todo_call_users();

		}else{
			var user_info = gap.user_check(info);

			var html2 = "";
			html2 += "		<div class='user-thumb' style='cursor:pointer'>"+user_info.user_img+"</div>";
			html2 += "		<dl>";
			html2 += "			<dt>"+user_info.name+"</dt>";
			html2 += "			<dd>"+user_info.jt+" / "+user_info.dept+"</dd>";
			html2 += "		</dl>";

			
			if (gTodo.cur_type == "card"){
				$("#card_" + gTodo.select_id + " .user").show();
				$("#card_" + gTodo.select_id + " .user").html(html2);
			}else if (gTodo.cur_type == "list"){
				
				$("#list_card_" + gTodo.select_id + " .user-thumb").html(user_info.user_img);
			}
		}
		

		
	},
	
	
	"change_local_data" : function(doc){	
		gTodo.select_todo = doc;
		var list = gTodo.cur_project_item_list;		
		for (var i = 0 ; i < list.length; i++){
			var item = list[i];
			if (item._id.$oid == gTodo.select_id){
				gTodo.cur_project_item_list[i] = doc;
				break;
			}
		}		
	},
	
		
	
	"__todo_checklist_after_event" : function(){
		
		$(".todo-list-right .ico-time").off();		
		$(".todo-list-right .ico-time").on("click", function(e){	
			if ( (gTodo.compose_admin) || (gTodo.compose_asignee)){						
			}else{
				return false;
			}
			
			
			if ($("#todo_startdate").val() == ""){
				//alert("할일의 기간을 먼저 설정하셔야 합니다.");
				//gap.gAlert(gap.lang.chdate);
				mobiscroll.toast({message:gap.lang.chdate, color:'danger'});
				return false;
			}
			
			//업무 기간내에 체크리스트가 포함되어야 한다.
			
			
			var _this = this;
			
			if (gap.browser_check() == "msie"){
				$(this).dateRangePicker({
					container:'body',
					showShortcuts: false,
					format: "YYYY-MM-DD",
					singleDate : true,
					singleMonth: true,
					autoClose: true
				}).bind('datepicker-change', function(evt,obj){
					//var select_date = obj.date1.YYYYMMDDHHMMSS();
					var select_date = moment.utc(obj.date1).format();
					$(this).parent().find("em").remove();
					$(this).parent().append("<em>"+obj.value+"</em>");
					
					//현재 클릭한 아이디의 배열에 완료예정일을 업데이트 한다.
					var click_id = $(this).parent().parent().parent().parent().attr("id");
					var data = JSON.stringify({
					//	project_code : gTodo.cur_todo_code,
						project_code : gTodo.select_todo.project_code,
						update_key : "checklist.$.complete_date",
						update_data : select_date,
						select_key : "checklist.tid",
						select_id : click_id,
						sid : gTodo.select_id
					});
		
					
					var url = gap.channelserver + "/update_todo_item_sub.km";
					$.ajax({
						type : "POST",
						dataType : "text",
					//	contentType : "application/json; charset=utf-8",
						data : data,
						url : url,
						success : function(res){
							
							var rres = JSON.parse(res);
							if (rres.result == "OK"){
								
								
								var change_doc = rres.data.doc;
								gTodo.change_local_data(change_doc);
								
							}else{
								gap.error_alert();
							}
							
						},
						error : function(e){
							gap.error_alert();
						}
					});
					
					
				}).bind('datepicker-closed',function(){
					var obj = $(this).data('dateRangePicker');
					if (typeof(obj) != "undefined"){
						$(this).data('dateRangePicker').destroy();	
					}
				});

				e.stopPropagation();
				$(this).data('dateRangePicker').open();
				var max_idx = gap.maxZindex();
				$('.date-picker-wrapper').css( 'top', e.pageY + 10 );
			    $('.date-picker-wrapper').css( 'left', e.pageX );
				$(".date-picker-wrapper").css({'zIndex': parseInt(max_idx) + 1});
				
			}else{
				
				var picker = $(this).mobiscroll().datepicker({
					locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
					theme: 'ios',
					themeVariant : 'light',
					display: 'anchored',
					controls: ['calendar'],
					select: 'range',	
					dateFormat: 'YYYY-MM-DD',	
					calendarType: 'month',	
			//		buttons: ['cancel'],
					pages : 2,
					touchUi : true,
					onInit: function (event, inst) {
						//하단에서 처리함 'setVal'
					},
					onChange : function (event, inst){
						
						var spl = event.valueText.split(" - ");
						var st = spl[0];
						var et = spl[1];
						
						var dis_start = moment.utc(st).format("YYYY-MM-DD");
						var dis_end = moment.utc(et).format("YYYY-MM-DD");
						
						var startdate = moment.utc(st).format();
						var enddate = moment.utc(et).format();
						
						//업무의 사직일과 종료일 사이에 있는지 체크한다.
						if (gTodo.select_todo.startdate > startdate){
							mobiscroll.toast({message:gap.lang.chbefore, color:'danger'});
							return false;
						}
						
						if (gTodo.select_todo.enddate < enddate){
							mobiscroll.toast({message:gap.lang.chafter, color:'danger'});
							return false;
						}
						//////////////////////////////////////////////////////////////////////
						
						//선택된 날짜로 기간을 변경한다.
						$(_this).parent().find("em").text(dis_start + "~" + dis_end);
						
						//종료일은 59부59초 설정을 별도로 해준다. timeline에서 선을 마지막까지 그리기 위해서
						var xxp = event.value[1];
						var select_date = moment.utc(xxp).add(1, 'days').subtract(1, 's');
						//현재 클릭한 아이디의 배열에 완료예정일을 업데이트 한다.
						var click_id = $(_this).parent().parent().parent().parent().attr("id");
						gTodo.click_id = click_id;
						var data = JSON.stringify({
						//	project_code : gTodo.cur_todo_code,
							project_code : gTodo.select_todo.project_code,
							update_key : "checklist.$.complete_date",
							update_data : select_date,
							start_date : startdate,
							select_key : "checklist.tid",
							select_id : click_id,
							sid : gTodo.select_id
						});
			
					
						var url = gap.channelserver + "/update_todo_item_sub.km";
						$.ajax({
							type : "POST",
							dataType : "text",
						//	contentType : "application/json; charset=utf-8",
							data : data,
							url : url,
							success : function(res){
								
								var rres = JSON.parse(res);
								if (rres.result == "OK"){
																	
									var change_doc = rres.data.doc;
									gTodo.change_local_data(change_doc);
								
									//날짜를 변경했을때 일정을 업데이트 해준다.
									gap.checklist_update_schedule(gTodo.click_id, change_doc, "");
									
								}else{
									gap.error_alert();
								}
								
							},
							error : function(e){
								gap.error_alert();
							}
						});
						
						
					}
					
					
				}).mobiscroll('getInst');
				picker.open();
				
				//기본 날짜 설정하기
				if ($(_this).parent().find("em").text() != ""){
					var dt = $(_this).parent().find("em").text().split("~");
					var st = dt[0];
					var et = dt[1];		
					$(this).mobiscroll('setVal', [new Date(st), new Date(et)]);
				}

				return false;
				
				
				
//				var picker = $(this).mobiscroll().datepicker({
//					locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
//					theme: 'ios',
//					themeVariant : 'light',
//					display: 'anchored',
//					buttons: ['cancel'],
//					onCellClick: function (event, inst) {
//						
//						debugger;
//					
//						var new_date = new Date(event.date);
//						new_date = moment(new_date).format("YYYY-MM-DD")
//						
//						var select_date = moment.utc(new_date).format();
//						
//						if (gTodo.select_todo.startdate > select_date){
//							mobiscroll.toast({message:gap.lang.chbefore, color:'danger'});
//							return false;
//						}
//						
//						if (gTodo.select_todo.enddate < select_date){
//							mobiscroll.toast({message:gap.lang.chafter, color:'danger'});
//							return false;
//						}
//						
//						
//					//	var select_date = moment.utc(new_date).add(1, 'days').subtract(1, 's');
//						
//						$(_this).parent().find("em").remove();
//						$(_this).parent().append("<em>"+new_date+"</em>");
//						
//						//현재 클릭한 아이디의 배열에 완료예정일을 업데이트 한다.
//						var click_id = $(_this).parent().parent().parent().parent().attr("id");
//						gTodo.click_id = click_id;
//						var data = JSON.stringify({
//						//	project_code : gTodo.cur_todo_code,
//							project_code : gTodo.select_todo.project_code,
//							update_key : "checklist.$.complete_date",
//							update_data : select_date,
//							select_key : "checklist.tid",
//							select_id : click_id,
//							sid : gTodo.select_id
//						});
//			
//					
//						var url = gap.channelserver + "/update_todo_item_sub.km";
//						$.ajax({
//							type : "POST",
//							dataType : "text",
//						//	contentType : "application/json; charset=utf-8",
//							data : data,
//							url : url,
//							success : function(res){
//								
//								var rres = JSON.parse(res);
//								if (rres.result == "OK"){
//																	
//									var change_doc = rres.data.doc;
//									gTodo.change_local_data(change_doc);
//								
//									//날짜를 변경했을때 일정을 업데이트 해준다.
//									gap.checklist_update_schedule(gTodo.click_id, change_doc, "");
//									
//								}else{
//									gap.error_alert();
//								}
//								
//							},
//							error : function(e){
//								gap.error_alert();
//							}
//						});
//				    }
//				}).mobiscroll('getInst');
//				picker.open();
//				$(this).mobiscroll('setVal', new Date($(_this).parent().find("em").text()));
//				return false;				
			}
		});
		
		$(".todo-list-right .btn-user-add").off();
		$(".todo-list-right .btn-user-add").on("click", function(e){
			
			if ( (gTodo.compose_admin) || (gTodo.compose_asignee)){				
			}else{
				return false;
			}
			
			gTodo._click_obj = $(e.currentTarget);
			
			var click_id = $(this).parent().parent().parent().attr("id");
			gTodo.click_checklist_id = click_id;
			gTodo.todo_select_user_layer(e);
		});
		
		
		$(".todo-list-right .user-thumb").off();
		$(".todo-list-right .user-thumb").on("click", function(e){
			
			if  (gTodo.compose_admin){		
			}else{
				return false;
			}
			
			gTodo._click_obj = $(e.currentTarget);
			
			var click_id = $(this).parent().parent().parent().attr("id");
			gTodo.click_checklist_id = click_id;
			gTodo.todo_select_user_layer(e);
		});

		$(".todo-list-right .btn-more").off();
		$(".todo-list-right .btn-more").on("click", function(e){
			
			if ( (gTodo.compose_admin) || (gTodo.compose_asignee)){			
			}else{
				return false;
			}
			
			if (e.target.className == "ico btn-more"){				
				$.contextMenu({
					selector : ".todo-list-right .btn-more",
					autoHide : false,
					trigger : "left",
					callback : function(key, options){
						gTodo.context_menu_call_compose(key, options, $(this).parent().parent().parent().attr("id"));
					},
					events : {
						hide: function (options) {
							$(this).removeClass("on");
						},
						show : function (options){
						}
					},			
					build : function($trigger, options){
						
						var owner = gTodo.select_todo.owner.em;
						var status = 0;
						return {
							items: gTodo.todo_info_menu_content('checklist', owner, status)
						}
					}
				});
			}					
		});
		
		
		if ( (gTodo.compose_admin) || (gTodo.compose_asignee)){		
			gap.draw_qtip_right(".todo-list-right .ico-time", gap.lang.select_cd);	
		}
		
	//	gap.draw_qtip_right(".todo-list-right .btn-user-add", gap.lang.select_mg);	
	},
	
	
	"context_menu_call_compose" : function(key, options, id){
		gTodo.select_check_item = id;
		gTodo.select_type = key;
		var data = "";
		if (key == "Change_Task"){
			data = JSON.stringify({
				id : id,
				sid : gTodo.select_id,
				ty : "change"
			});
		}else if (key == "Delete_Checklist"){
			data = JSON.stringify({
				id : id,
				sid : gTodo.select_id,
				ty : "del"
			});
		}else if (key == "Edit_Checklist"){
			gTodo.edit_checklist(key, options, id);
			return false;
		}
		
		var url = gap.channelserver + "/update_todo_checklist.km";
		$.ajax({
			type : "POST",
			dataType : "text",
			url : url,
			data : data,
			success : function(res){	
				var rres = JSON.parse(res);
				if (rres.result == "OK"){
										
					if (key == "Delete_Checklist" || key == "Change_Task"){
						
						var ky = $("#"+gTodo.select_check_item).attr("data2");					
						var obb = new Object();						
					//	obb.del_id = gTodo.select_check_item;
						obb.del_id = gTodo.cur_todo_code + "^" + gTodo.select_id + "^" + gTodo.select_check_item;
						obb.del_emp = ky;
						gap.schedule_update(obb, "asignee", "D");
					}
					
					$("#" + gTodo.select_check_item).remove();
				
					if (key == "Change_Task"){
					
						var info = new Object();
						info.id = rres.data.id;
						info.title = rres.data.title;
						info.status = rres.data.status;

						var list = rres.data.data;
						gTodo.cur_project_item_list = list;
											
						var status = info.status;
						
						var kid = "";
						
						if (status == "0"){
							kid = "temp_count";
						}else if (status == "1"){
							kid = "wait_count";
						}else if (status == "2"){
							kid = "continue_count";
						}else if (status == "3"){
							kid = "complete_count";
						}
						
					
												
						if (gTodo.cur_type == "card"){
							var ht = gTodo.todo_make_card_first(info);
							
							if ($("#card_"+status+" .xcard").length == 0){
								$("#card_"+status).append($(ht));
							}else{
								//$(ht).insertAfter($("#card_"+status).children().first());	
								$(ht).insertBefore($("#card_"+status).children().first());	
							}	
							var cnt = $("#card_"+status+" .xcard").length;
													
							
							gTodo.__draganddrop();
						//	gTodo.__event_status();
						}else if (gTodo.cur_type == "list"){
							kid = "list_" + kid;
							
							var ht = gTodo.todo_make_card_first_list(info);
							
							if ($("#list_card_"+status+" .xlist").length == 0){
								$("#list_card_"+status).append($(ht));
							}else{
								$(ht).insertAfter($("#list_card_"+status).children().first());	
							}	
							var cnt = $("#list_card_"+status+" .xlist").length;
													
							
							gTodo.__draganddrop_list();
							gTodo.__event_status_list();
						}
						
						gTodo.__after_draw_event();
					
						$("#"+kid).html(" ("+cnt+")");
						
						
											
						
					}else{
						//체크리스트를 삭제하는 경우
												
						var change_doc = rres.data.doc;
						gTodo.change_local_data(change_doc);
						
						
						
					}
					
					//전체 건수를 표시해야 한다.
					gTodo.checklist_count_check();
		
				}else{
					gap.error_alert();
				}
			},
			error : function(e){
				gap.error_alert();
			}
		});
		
	},
	
	"edit_checklist" : function(key, options, id){
		var mx = $("#" + id + " p").text();
		$("#rmtext_checklist_todo").val(mx);
		
		$("#rmtitle_checklist_todo").text(gap.lang.basic_modify);
		$("#rmsave_checklist_todo").text(gap.lang.basic_modify);
		$("#rmcancel_checklist_todo").text(gap.lang.Cancel);
		
		var inx = parseInt(gap.maxZindex()) + 1;
		$("#rmlayer_checklist_todo").css("z-index", inx);
		$("#rmlayer_checklist_todo").show();
		
		$("#rmclose_checklist_todo").off();
		$("#rmclose_checklist_todo").on("click", function(e){	
			$("#rmlayer_checklist_todo").hide();
		});
		
		$("#rmcancel_checklist_todo").off();
		$("#rmcancel_checklist_todo").on("click", function(e){
			$("#rmclose_checklist_todo").click();
		});
		
		$("#rmsave_checklist_todo").off();
		$("#rmsave_checklist_todo").on("click", function(e){		
							
			
			var sel_item = gTodo.select_check_item;
			var sel_todo = gTodo.select_id;
			var mx = $("#rmtext_checklist_todo").val();
			
			var msg = $("#rmtext_checklist_todo").val();
			var data = JSON.stringify({
				todo_id : sel_todo,
				cid : sel_item,
				msg : mx
			})
			var url = gap.channelserver + "/modify_checklist_title_todo.km";
			                               
			$.ajax({
				type : "POST",
				dataType : "text",
				url : url,
				data : data,
				success : function(res){
					var rx = JSON.parse(res);
					if (rx.result == "OK"){
					
						
						$("#rmlayer_checklist_todo").hide();
						
						$("#" + id + " p").text(mx);
						
						///////////////////// 로컬 데이터 업데이트 ///////////
						var change_doc = rx.data.doc;
						gTodo.change_local_data(change_doc);
						
						//체크리스트 제목이 변경했을때 일정을 업데이트 해준다.
						gap.checklist_update_schedule(sel_item, change_doc, "");
						
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			})
			
		});
	},
	
	
	"todo_select_tag_layer" : function(e){
		var html = "";
		html += "<div class='qtip-default' style='border:none'>";
		html += "	<div class='layer-option-member'>";
		html += "		<div class='input-field'> ";
		html += "			<input type='text' class='formInput'  autocomplete='off'  placeholder='"+gap.lang.input_tag+".'>";
		html += "			<span class='bar'></span>";
		html += "		</div>";
	//	html += "		<button class='btn-file-search ico'>검색</button>";	
		html += "	</div>";
		html += "</div>";
		
	
		gTodo.show_qtip_user(e, html, -10);
	},
	
	"todo_select_color_layer" : function(e){
		var html = "";

		html += "	<div class='qtip-default' style='border:none'>";
		html += "		<ul class='layer-color'>";
		html += "			<li class='c1'></li>";
		html += "			<li class='c2'></li>";
		html += "			<li class='c3'></li>";
		html += "			<li class='c4'></li>";
		html += "			<li class='c5'></li>";
		html += "			<li class='c6'></li>";
		html += "			<li class='c7'></li>";
		html += "			<li class='c8'></li>";
		html += "			<li class='c9'></li>";
		html += "			<li class='c10'></li>";
		html += "		</ul>";
		html += "	</div>";
	
		gTodo.show_qtip_user(e, html, -10);
	},
	
	
	"todo_select_user_layer" : function(e){

		var html = "";
		html += "<div class='qtip-default' style='max-height:350px'>";
		html += "	<div class='layer-option-member' style='max-height:350px'>";
//		html += "		<div class='input-field'> ";
//		html += "			<input type='text' class='formInput' placeholder='"+gap.lang.inputname+".'>";
//		html += "			<span class='bar'></span>";
//		html += "		</div>";
//		html += "		<button class='btn-file-search ico'>검색</button>";
		
	//	var list = gTodo.cur_project_info.member;
		var list = [];
		$(gTodo.cur_project_info.member).each(function(idx, val){
			if (val.dsize != "group"){
				list.push(val);
			}			
		});
		
		
		list.push(gTodo.cur_project_info.owner);
		
		list = sorted=$(list).sort(gap.sortNameDesc);
		
		html += "		<ul class='layer-option-list' id='search_user_list_item'>";
		html += "			<li><em>Member</em></li>";
		
		for (var i = 0 ; i < list.length; i++){
			var member = list[i];
			
//			var member_img = gap.person_photo(member.pu);
//			var member_name = member.nm;
//			var company = member.cp;
//			var dept = member.dp;
//			var email = member.em;
//			var mobile = member.mop;
//			var jt = member.jt;
//			if (gap.curLang != "ko"){
//				member_name = member.enm;
//				jt = member.ejt;
//			}
			
			var user_info = gap.user_check(member);
			
			html += "			<li>";
			html += "				<div class='user' data='"+user_info.ky+"'>";
			html += "					<div class='user-thumb'>"+user_info.user_img+"</div>";
			html += "					<dl>";
			html += "						<dt>"+user_info.name+ gap.lang.hoching + "</dt>";
			html += "						<dd>"+user_info.jt+" / "+user_info.dept+"</dd>";
			html += "					</dl>";
			html += "				</div>";
			html += "			</li>";
			
		}
		
	/*	var user_info = gap.user_check(gTodo.cur_project_info.owner);
		
		html += "			<li>";
		html += "				<div class='user' data='"+user_info.ky+"'>";
		html += "					<div class='user-thumb'>"+user_info.user_img+"</div>";
		html += "					<dl>";
		html += "						<dt>"+user_info.name+ gap.lang.hoching + "</dt>";
		html += "						<dd>"+user_info.jt+" / "+user_info.dept+"</dd>";
		html += "					</dl>";
		html += "				</div>";
		html += "			</li>";*/

		
		html += "		</ul>";
		html += "	</div>";
		html += "</div>";
		

		gTodo.show_qtip_user(e, html, -10);
		
	},
	
	
	"show_qtip_user" : function(e, html, leftposition){
		//	var target_id = $(e.currentTarget).parent().attr("id");
		//	var sid = target_id.replace("list_card_","");
			
		//	gTodo.select_checklist_email = $(e.currentTarget).parent().parent().parent().attr("data");
			gTodo.select_checklist_ky = $(e.target).data("key");
			
			$(e.currentTarget).qtip({
				overwrite: false,   //옵션 주지 않으면 'show is null' 오류 발생
				content : {
					text : html
				},
				show : {
					event: 'click',
					ready: true
				},
				hide : {
					//event : 'click unfocus',
					//event : 'mouseout',
					event : 'unfocus',
					fixed : true
				},
				style : {
					classes : 'qtip-bootstrap',
					tip : true
				},
				position : {
					
					viewport: $("#compose_todo"),
					my : 'top center',
//					at : 'bottom bottom',			
					adjust: {
					  x: leftposition,
					  y: 0
					}
					
				},
				events : {
					
					show : function(event, api){			
						
						$("#search_user_list_item .user").off();
						$("#search_user_list_item .user").on("click", function(e){
							
							
							//기존에 등록된 담당자가 있는 체크한다.
							
							var ori_asignee_key = "";
							var info2 = "";
							if (typeof(gTodo.select_todo.asignee) != "undefined"){
								ori_asignee_key = gTodo.select_todo.asignee.ky;
								info2 = gTodo.search_user_cur_project_info(ori_asignee_key);
							}							
						
							var ky = $(e.currentTarget).attr("data");
							var info = gTodo.search_user_cur_project_info(ky);	
							
						//	var select_user_img = gap.person_photo(info.pu);
							var user_info = gap.user_check(info);
							
							
														
							
							if (gTodo.click_checklist_id == "asignee_btn"){
								//TODO 전체 담당자를 선택한 경우 별도 처리해 준다.
								var data = JSON.stringify({
									asignee : info,
									todo_id : gTodo.select_id,
									ty : "add"
								});
								var url = gap.channelserver + "/update_asignee_todo.km";
								$.ajax({
									type : "POST",
									dataType : "json",
									conteType : "application/json; charset=utf-8",
									data : data,
									url : url,
									success : function(res){
									
										if (res.result == "OK"){
																					
											var person_img = "<button class='btn-g-del'></button><div class='user-thumb' id='asignee_btn' data-ky='"+user_info.ky+"'>"+user_info.user_img+"</div>";
											$(gTodo._click_obj).parent().append(person_img);
						
											//gTodo._click_obj는 체크리스트에서 사용자 선택 버튼을 클릭 할때 설정했음
											$(gTodo._click_obj).qtip("destroy");
											$(gTodo._click_obj).remove();
																				
											
											
											var change_doc = res.data.doc;
											gTodo.change_local_data(change_doc);
											
																						
											if (gTodo.cur_todo == "status"){
												gTodo.asignee_change_check(info);
											}else if (gTodo.cur_todo == "user"){
												if (gTodo.cur_type == "card"){
													gTodo.todo_call_users();	
												}else{
													gTodo.todo_center_status_list();	
												}											
											}										
											
											gTodo.__item_delete_event();
											gTodo.__todo_compose_event();
											
											
											//현재 선택된 정보를 최신 정보로 변경한다.
											gTodo.select_todo = change_doc;
											
											//신규 등록 또는 업데이트 인 경우
											if (ori_asignee_key == "" || ori_asignee_key == change_doc.asignee.ky){
												//alert("기존 담당자와 신규 선택 담당자가 동일할 경우 또는 최초 등록인 경우")
												//기존 담당자와 신규 선택 담당자가 동일할 경우 또는 최초 등록인 경우
												//기존 데이터를 업데이트 한다.
												gap.schedule_update(change_doc, "asignee", "U");
											}else{
												//기존 담담자와 신규 담당자가 틀릴 경우
												// 기존 담당자의 업무를 제거한다.
												//alert("기존 담담자와 신규 담당자가 틀릴 경우");
												
												var obb = new Object();						
												obb.del_id = gTodo.select_todo.project_code + "^" + gTodo.select_todo._id.$oid;
												obb.del_emp = info2.ky;
												gap.schedule_update(obb, "asignee", "D");
												//신규 담당자의 업무를 등록한다.
												gap.schedule_update(change_doc, "asignee", "U");
											}
										
											
											
											
											//TODO에 담당자를 지정할 경우 해당 사용자에게 TODO가 할당되었음을 실시간 알려준다.
											if (change_doc.asignee.ky != gap.userinfo.rinfo.ky){
												var obj = new Object();
												obj.id = change_doc._id.$oid;
												obj.type = "as";  //change status
												obj.p_code = change_doc.project_code;
												obj.p_name = gap.textToHtml(change_doc.project_name);
												obj.title = change_doc.title;
											//	obj.sender = change_doc.asignee.ky;  //해당 프로젝트의 owner에게만 전송한다.	
												var list = [];
												list.push(change_doc.asignee.ky);
												obj.sender = list;
												_wsocket.send_todo_msg(obj);	
												
												
												//모바일 Push를 전송한다.
												var smsg = new Object();
												smsg.msg = "[" + gap.textToHtml(change_doc.project_name) + "]" + gTodo.short_title(obj.title) + " - " + gap.lang.csm;
												smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";
												smsg.type = "as";
												smsg.key1 = change_doc.project_code;
												smsg.key2 = change_doc._id.$oid;
												smsg.key3 = "";
												smsg.fr = gap.userinfo.rinfo.nm;
												//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
												//smsg.sender = change_doc.asignee.ky.join("-spl-");	
												smsg.sender = change_doc.asignee.ky;	
												//gap.push_noti_mobile(smsg);	
												
												//알림센터에 푸쉬 보내기
												var rid = change_doc.project_code;
												var receivers = [];
												receivers.push(change_doc.asignee.ky)
												var msg2 = gap.lang.csm;
												var sendername = "["+gap.lang.ch_tab3+" : " + gap.textToHtml(change_doc.project_name) +"]"
												var data = smsg;
												gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
											}
											
											
																				
											
										}else{
											gap.error_alert();
										}
										
									},
									error : function(e){
										gap.error_alert();
									}
								})
								
							}else{
								//체크리스트 목록에서 담당자를 선택한 경우								
								
								var click_id = gTodo.click_checklist_id;
								gTodo.ssid = click_id;
								var data = JSON.stringify({
								//	project_code : gTodo.cur_todo_code,
									project_code : gTodo.select_todo.project_code,
									update_key : "checklist.$.asign",
									update_data : info,
									select_key : "checklist.tid",
									select_id : click_id,
									sid : gTodo.select_id
								});
								
							
					
								var url = gap.channelserver + "/update_todo_item_sub.km";
								$.ajax({
									type : "POST",
									dataType : "text",
								//	contentType : "application/json; charset=utf-8",
									data : data,
									url : url,
									success : function(res){
										var rres = JSON.parse(res);
										if (rres.result == "OK"){
											
											var person_img = "<div class='user-thumb' style='cursor:pointer' data-ky='"+user_info.ky+"'>"+user_info.user_img+"</div>";
											$(gTodo._click_obj).parent().append(person_img);
											
											//일정연동시 바로 선택하고 바로 수정할 경우 선택된 사용자의 이메일 주소를 li에 등록해 주서야 하단에서 비교할 수 있다.
											$(gTodo._click_obj).parent().parent().parent().attr("data", user_info.email)
											$(gTodo._click_obj).parent().parent().parent().attr("data2", user_info.ky)
						
											//gTodo._click_obj는 체크리스트에서 사용자 선택 버튼을 클릭 할때 설정했음
											$(gTodo._click_obj).qtip("destroy");
											$(gTodo._click_obj).remove();
											
											
											var change_doc = rres.data.doc;
											gTodo.change_local_data(change_doc);
											
											gTodo.__todo_compose_event();
											
											//체크리스트 등록시 일정과 연동한다.
											//기존 사용자를 변경한 것인지 / 신규로 등록한 것인지 체크해야 한다.
											
											
											//gTodo.select_checklist_email
											//gTodo.ssid
											
											for (var k = 0 ; k < change_doc.checklist.length; k++){
												var inn = change_doc.checklist[k];
												if (inn.tid == gTodo.ssid){													
													if (gTodo.select_checklist_ky == inn.asign.ky){														
													}else{					
														if (typeof(gTodo.select_checklist_ky) != "undefined"){
													        var obb = new Object();
													   //     var ip = gTodo.search_user_cur_project_info_email(gTodo.select_checklist_ky);
															obb.del_emp = gTodo.select_checklist_ky;															
															obb.del_id = gTodo.select_todo.project_code + "^" + gTodo.select_todo._id.$oid + "^" + gTodo.ssid;
															gap.schedule_update(obb, "checklist", "D");															
														}
														break;														
													}
												}
											}
											
											gap.checklist_update_schedule(gTodo.ssid, JSON.parse(res).data.doc, "");
											
											//TODO에 체크리스트에 담당자를 지정할 경우 지정된 사용자에게 알림을 보내준다.
											if (info.ky != gap.userinfo.rinfo.ky){
												var obj = new Object();
												obj.id = change_doc._id.$oid;
												obj.type = "checklist";  //change status
												obj.p_code = change_doc.project_code;
												obj.p_name = gap.textToHtml(change_doc.project_name);
												obj.title = change_doc.title;
										//		obj.sender = info.ky;  //해당 프로젝트의 owner에게만 전송한다.		
												var list = [];
												list.push(info.ky);
												obj.sender = list;
												_wsocket.send_todo_msg(obj);	
												
												var smsg = new Object();
												smsg.msg = "[" + gap.textToHtml(change_doc.project_name) + "] " + gTodo.short_title(obj.title) + " - " + gap.lang.checklist + " " + gap.lang.csm;	
												smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";
												smsg.type = "checklist";
												smsg.key1 = change_doc.project_code;
												smsg.key2 = change_doc._id.$oid;
												smsg.key3 = "";
												smsg.fr = gap.userinfo.rinfo.nm;
												//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
												//smsg.sender = info.ky.join("-spl-");	
												smsg.sender = info.ky;	
												//gap.push_noti_mobile(smsg);	
												
												//알림센터에 푸쉬 보내기
												var rid = change_doc.project_code;
												var receivers = [];
												receivers.push(info.ky);
												var msg2 = "[" + gTodo.short_title(obj.title)+ "] " +  gap.lang.checklist + " " + gap.lang.csm;		
												var sendername = "["+gap.lang.ch_tab3+" : " + gap.textToHtml(change_doc.project_name) +"]"
												var data = smsg;
												gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
											}
											
											
										}else{
											gap.error_alert();
										}
									},
									error : function(e){
										gap.error_alert();
									}
								});
							}
							
							
						});
						
									
						$(".layer-option-member .formInput").off();
						$(".layer-option-member .formInput").keypress(function(e){							
							if (e.keyCode == 13){
																
								if (gTodo.click_checklist_id == "btn_tag_add"){
									//태그를 입력한 경우
									var tag = $(this).val();
									
									
									var data = JSON.stringify({
										tag : tag,
										todo_id : gTodo.select_id,
										ty : "add"
									});
									var url = gap.channelserver + "/update_tag_todo.km";
									$.ajax({
										type : "POST",
										dataType : "text",
										url : url,
										data : data,
										success : function(res){
											var rrx = JSON.parse(res);
											if (rrx.result == "OK"){
												$("#tag_list_div").append("<span>"+tag+"<button class='btn-g-del'></button></span>");
												$(".layer-option-member .formInput").val("");
												
												gTodo.tag_change_check(tag);
												
												var change_doc = rrx.data.doc;
												gTodo.change_local_data(change_doc);
												
												gTodo.__item_delete_event();
											}
										},
										error : function(e){
											gap.error_alert();
										}
									});
									
									
								}else{
									//사용자 검색일 경우
									var q = $(this).val();
									var companycode = gap.userinfo.rinfo.cpc;
									
									var data = JSON.stringify({
										name : q,
										companycode : companycode
									});
									
									if (q.length < 2){
										gap.gAlert(gap.lang.valid_search_keyword);
										return false;
									}
									var url = gap.channelserver + "/search_user.km";
									$.ajax({
										type : "POST",
										dataType : "json",
										contentType : "application/json; charset=utf-8",
										url : url,
										data : data,
										success : function(res){						
											
											if (res.length > 0){
												
												var list = res;
												var html = "";
													
												for (var i = 0 ; i < list.length; i++){
													var member = list[i];
													var user_info = gap.user_check(member);
//													var member_img = gap.person_photo(member.pu);
//													var member_name = member.nm;
//													var dept = member.dp;
//													var jt = member.jt;
//													if (gap.curLang != "ko"){
//														member_name = member.enm;
//														jt = member.ejt;
//													}												
													html += "			<li>";
													html += "				<div class='user'>";
													html += "					<div class='user-thumb'>"+user_info.user_img+"</div>";
													html += "					<dl>";
													html += "						<dt>"+user_info.name+ gap.lang.hoching + "</dt>";
													html += "						<dd>"+user_info.jt+" / "+user_info.dept+"</dd>";
													html += "					</dl>";
													html += "				</div>";
													html += "			</li>";
													
												}
											
												$("#search_user_list").empty();
												$("#search_user_list").html(html);
											}							
										},
										error : function(e){
											gap.error_alert();
										}
									})
								}
								
								
								
								return false;
							}						
						});
						
						
						//Color를 선택하는 경우
						$(".layer-color li").off();
						$(".layer-color li").on("click", function(e){
							
							var color = $(this).attr("class");
							$(".layer-color li").removeClass("on");
							$(this).addClass("on");
														
							var data = JSON.stringify({
								color : color,
								todo_id : gTodo.select_id,
								ty : "add"
							});
							var url = gap.channelserver + "/update_color_todo.km";
							$.ajax({
								type : "POST",
								dataType : "text",
								url : url,
								data : data,
								success : function(res){
									var rrx = JSON.parse(res);
									if (rrx.result == "OK"){
										
										$(".g-color .color").remove();
										$(".g-color").append("<div class='color "+color+"'><button class='btn-g-del'></button></div>");
																				
										gTodo.color_change_check(color);
																				
										$(gTodo._click_obj).qtip("destroy");
										//$(gTodo._click_obj).remove();
										
										var change_doc = rrx.data.doc;
										gTodo.change_local_data(change_doc);
										
										gTodo.__item_delete_event();
										
										// 캘린더 이벤트 업데이트
										gTodoC.update_calendar_event(gTodo.select_id);
									}
								},
								error : function(e){
									gap.error_alert();
								}
							})
							
							
						});
						
						
						
						$(".layer-option-member").mCustomScrollbar({
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
							autoHideScrollbar : false
						});
						
							
						
					},
					hidden : function(event, api){
						api.destroy(true);
					}
				}
			});
		},
		
		
		"search_user_cur_project_info" : function(ky){
			var list = gTodo.cur_project_info.member;
	//		list.push(gTodo.cur_project_info.owner);
			for (var i = 0 ; i < list.length; i++){
				var item = list[i];
				if (item.ky == ky){
					return item;
					break;
				}
			}
			
			if (gTodo.cur_project_info.owner.ky == ky){
				return gTodo.cur_project_info.owner;
			}			
		},
		
		"search_user_cur_project_info_email" : function(ky){
			
			var list = gTodo.cur_project_info.member;
	//		list.push(gTodo.cur_project_info.owner);
			for (var i = 0 ; i < list.length; i++){
				var item = list[i];
				if (item.em == ky){
					return item;
					break;
				}
			}
			
			if (gTodo.cur_project_info.owner.em == ky){
				return gTodo.cur_project_info.owner;
			}			
		},
		
		
		
		//gTodo.show_file_fullscreen_todo(todo_code, md5, is_show, is_type, ext);
		"show_file_fullscreen_todo" : function(filename, fserver, md5, tid){
		
			//이미 변환된 파일인지 체크하고 아닐꼉우 변환하고 건수를 넘겨준다.
			var obj = new Object();
			obj.md5 = md5;
			obj.fserver = fserver;
			obj.filename = filename;
			gTodo.click_file_info = obj;
			
			var todo_id = (tid != undefined ? tid : gTodo.select_id);	// tid : 우측 파일리스트에서 사용하는 todo id		
    		var is_pre = gap.is_file_type(filename);   	
			
			if (is_pre == "img"){
				var url = gap.search_file_convert_server(fserver) + "/FDownload.do?id=" + todo_id + "&md5=" + md5 + "&ty=todo";
				
				gap.image_gallery = new Array();  //변수 초기화 해준다.
				gap.image_gallery_current = 1;
				
				gap.show_image(url, filename);
			}else if (is_pre == "movie"){
				
				var vserver = gap.search_video_server(fserver);
				var fname = md5 + filename.substring(filename.lastIndexOf("."), filename.length);
				//var url = vserver + "/2/" + email + "/" + upload_path + "/" + md5 + "/" + ty; 패턴을 맞춰야 한다.
				var url = vserver + "/4//" + todo_id + "/" +fname +"/";

				gap.show_video(url, filename);	
			}else{
				gap.show_loading2(gap.lang.changeimg);
				var surl = fserver + "/FileConvert_todo.km";
				var postData = {
						"id" : todo_id,
						"filename" : filename,
						"md5" : md5
					};			

				$.ajax({
					type : "POST",
					url : surl,
					dataType : "json",
					data : JSON.stringify(postData),
					success : function(res){
						
						if (res.result == "OK"){
							console.log(">>>>> File Convert <<<<<");
							gap.hide_loading2();
							
							if (gBody3.isNumberic(res.data.count)){
								
							//	gRM.show_convert_file_info(filename, md5, res.data.count);
								gTodo.show_file_fullscreen_todo_view(filename, md5, res.data.count, fserver);
								
							
							}else{
								gap.gAlert(gap.lang.noimage);
							}
											
							//gap.hide_loading();
						}else{
							gap.hide_loading2();
							gap.gAlert(gap.lang.errormsg);
							return false;
						}
					},
					error : function(e){
						gap.hide_loading2();
						gap.gAlert(gap.lang.errormsg);
						return false;
					}
				});	
			}		
		},
		
		
		"show_file_fullscreen_todo_view" : function(_fname, _md5, _count, fserver){
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
			

			// 일반의 경우
			for (var i = 0; i < _count; i++){
				var _html = '<li' + (i == 0 ? ' class="on"' : '') + ' id="slide_thm_' + (i + 1) + '"><img src="' + fserver + '/FilePreview.do?m5=' + _md5 + '&ty=2&bun=' + (i + 1) + '" alt="" /></li>';
				html += _html;			
			}			
			

			html += "		</ul>";
			html += "	</div>";
			html += "	<div class='wrap-preview'>";
			html += '		<img id="xfull_img" style="max-width:65%" src="' + fserver + '/FilePreview.do?m5=' + _md5 + '&ty=1&bun=' + (is_array ? _count[0] : "1") + '" alt="" />';
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
				
				var data = gTodo.click_file_info;
				data.id = gTodo.select_id;
				data.ty = "todo";
				
				
				var downloadurl = gap.search_file_convert_server(data.fserver) + "/FDownload.do?id=" + data.id + "&md5=" + data.md5 + "&ty=" + data.ty;
				gap.file_download_normal(downloadurl, data.filename);
				return false;
			});
			
			$("#fullscreen_file_info .btn-close").on("click", function(e){			
				$("#fullscreen_file_info").fadeOut();
			});
		},
		
		//gTodo.context_menu_call_reply_todo(key, todo_id, rid);
		"context_menu_call_reply_todo" : function(key, todo_id, rid){
			gTodo.todo_reply_status = key;
			
			if (key == "edit"){
				//수정을 클릭한 경우
				//편집창을 띄운다.		
				
				var mx = gap.message_check_reverse($("#" + rid +" p").html());
				
				if (mx.indexOf("<mention") > -1){
					var mk = $("<span>" + mx + "</span>");
					var ctext = "";
					var lk = $(mk).find("mention");
					for (var i = 0 ; i < lk.length; i++){
						var item = lk[i];
						var cn = $(item).attr("data");
						var na = $(item).text();
						var txt = "@[" + na + "](contact:" + cn + ")";

						mx = mx.replace($(item).get(0).outerHTML, txt);
					}
				}
							

			//	$("#rmtext").val(mx);
				$("#rmtext_reply_todo").mentionsInput('edit', mx);
				
				$("#rmtitle_reply_todo").text(gap.lang.reply + " " + gap.lang.basic_modify);
				$("#rmsave_reply_todo").text(gap.lang.basic_modify);
				$("#rmcancel_reply_todo").text(gap.lang.Cancel);
				
				var inx = parseInt(gap.maxZindex()) + 1;
				$("#rmlayer_reply_todo").css("z-index", inx);
				$("#rmlayer_reply_todo").show();
				
				$("#rmclose_reply_todo").off();
				$("#rmclose_reply_todo").on("click", function(e){
					gTodo.todo_reply_status = "";
					$("#rmlayer_reply_todo").hide();
					
					$("#rmtext_reply_todo").removeAttr("style");
					$("#rmtext_reply_todo").removeAttr("rows");
				});
				
				$("#rmcancel_reply_todo").off();
				$("#rmcancel_reply_todo").on("click", function(e){
					$("#rmclose_reply_todo").click();
				});
				
				$("#rmsave_reply_todo").off();
				$("#rmsave_reply_todo").on("click", function(e){		
									
					var msg = $("#rmtext_reply_todo").val();
					
					//mention 처리 /////////////////////////////////////////////////////////////
					var mentions_msg = "";
					var mentions_data = "";
					var mentions_ky = "";
					var mentions_em = "";
					$("#rmtext_reply_todo").mentionsInput('val', function(text){
						mentions_msg = gap.textMentionToHtml(text);;
					});
					$("#rmtext_reply_todo").mentionsInput('getMentions', function(data) {
						mentions_data = data;
						mentions_ky = $.map(data, function(ret, key) {
							return ret.id;
						});
						mentions_em = $.map(data, function(ret, key) {
							return ret.em;
						});
					});
					///////////////////////////////////////////////////////////////////////////
					
					var data = JSON.stringify({
						todo_id : todo_id,
						rid : rid,
						msg : mentions_msg,	//msg
						mention : mentions_data
					})
					var url = gap.channelserver + "/modify_reply_todo.km";
					$.ajax({
						type : "POST",
						dataType : "text",
						url : url,
						data : data,
						success : function(res){
							var rx = JSON.parse(res);
							if (rx.result == "OK"){
								gTodo.todo_reply_status = "";
								
								$("#rmlayer_reply_todo").hide();
							//	msg = gap.message_check(msg);
								msg = gap.message_check(mentions_msg);
								msg = gap.textToHtml(msg).replace(/&nbsp;/g, " ");
								$("#" + rid + " p").html(msg);
								
								gTodo.mention_event();
								
								//모바일 푸시
								var member_list = $.unique(gap.check_cur_todo_members());
								var smsg = new Object();
								smsg.msg = "[" + gTodo.select_todo.project_name + "] " + gTodo.short_title(gTodo.select_todo.title) + " - " + gap.lang.modify_reply;
								smsg.title = gap.systemname + "["+gap.lang.ch_tab3+"]";
								smsg.type = "reply";
								smsg.key1 = gTodo.select_todo.project_code;
								smsg.key2 = gTodo.select_todo._id.$oid;
								smsg.key3 = "";
								smsg.fr = gap.userinfo.rinfo.nm;
								//현재 채널방에 멤버리스트와 Owner값을 합치고 본인을 제거한 리스트를 가져온다.										
								smsg.sender = member_list.join("-spl-");
								
								if (mentions_data.length > 0){
									smsg.mention_log = "T";
									smsg.project_name = gTodo.select_todo.project_name;
									smsg.emails = mentions_em.join("-spl-");
									smsg.sender = mentions_ky.join("-spl-");
									smsg.content = mentions_msg;
									//gap.push_noti_mobile(smsg);		
									
								}else if (member_list.length > 0){
									//gap.push_noti_mobile(smsg);		
								}
								
								//알림센터에 푸쉬 보내기
								var rid = gTodo.select_todo.project_code;
								var receivers = member_list;
								var msg2 = "[" + gTodo.short_title(gTodo.select_todo.title) + "] " + gap.lang.modify_reply;	
								var sendername = "["+gap.lang.todo+" : " + gap.textToHtml(gTodo.select_todo.project_name) +"]"
								var data = smsg;
								gap.alarm_center_msg_save(receivers, "kp_channel", sendername, msg2, rid, smsg);
								
							}else{
								gap.error_alert();
							}
						},
						error : function(e){
							gap.error_alert();
						}
					})
					
				});
				
				$("#rmtext_reply_todo").bind("keypress", function(e){  
				   if (e.keyCode == 13) {
					   //다음줄로 내려간다.
						$(this).height($(this).height() + 23);      	
				    	var countRows = $(this).val().split(/\r|\r\n|\n/).length;   
				    	$(this).attr("rows", countRows + 1);
				    	e.stopPropagation(); 	
				   }
				});
				
				return false;
				
			}else if (key == "delete"){
				var todo_id = todo_id;
				var rid = rid;
								
				var url = gap.channelserver + "/delete_reply_todo.km";
				var data = JSON.stringify({
					"todo_id" :  todo_id,				
					"rid" : rid
				});
				
				$.ajax({
					type : "POST",
					dataType : "json",
					url : url,
					data : data,
					success : function(res){						
						if (res.result == "OK"){
							gTodo.todo_reply_status = "";
							
							$("#" + rid).remove();
							gTodo.reply_count_check();
							
							var change_doc = res.data.doc;
							gTodo.change_local_data(change_doc);
							
						}else{
							gap.gAlert(gap.lang.errormsg);
						}
					},
					error : function(e){
						gap.gAlert(gap.lang.errormsg);
					}
				});
			}
		},
		
		
		"__todo_selectDate_event" : function(){
			
			if (gap.browser_check() == "msie"){
			//	$("#todo_startdate").off();
				$("#todo_startdate").dateRangePicker({
					container:'body',
					showShortcuts: false,
					format: "YYYY-MM-DD",
					singleDate : false,
					singleMonth: false,
					autoClose: true
				}).bind('datepicker-change', function(evt,obj){
					//var select_date = obj.date1.YYYYMMDDHHMMSS();				
//					
//					if (!gTodo.select_date){
//						return false;
//					}			
					
					$(this).val("");				
												
					var dis_start = moment.utc(obj.date1).format("YYYY.MM.DD");
					var dis_end = moment.utc(obj.date2).format("YYYY.MM.DD");
					
					var startdate = moment.utc(obj.date1).format();
					var enddate = moment.utc(obj.date2).format();
					
				
					$("#todo_startdate").val(dis_start);
					$("#todo_enddate").val(dis_end);
								

					var data = JSON.stringify({
						startdate : startdate,
						enddate : enddate,
						select_id : gTodo.select_id,
					//	project_code : gTodo.cur_todo_code
						project_code : gTodo.select_todo.project_code
					});

					var url = gap.channelserver + "/update_todo_item_sub_date.km";
					$.ajax({
						type : "POST",
						dataType : "json",
						contentType : "application/json; charset=utf-8",
						data : data,
						url : url,					
						success : function(res){
							
							if (res.result == "OK"){
								var status = res.data.status;
								gTodoC.update_todo_progress_icon(gTodo.cur_todo_code, status);
								
								//레이어 하단에 날짜 값을 변경한다.
								gTodo.date_change_check(startdate, enddate);
								
								var change_doc = res.data.doc;
								gTodo.change_local_data(change_doc);
								
								// 캘린더 이벤트 업데이트
								gTodoC.update_calendar_event(gTodo.select_id);
								
							}else{
								gap.error_alert();
							}
							
						},
						error : function(e){
							gap.error_alert();
						}
					});
					
				}).bind('datepicker-first-date-selected', function(event, obj){
					
				//	gTodo.select_date = true;
									
				}).bind('datepicker-closed',function(){
					
					var obj = $("#todo_startdate").data('dateRangePicker');
					if (typeof(obj) != "undefined"){
				//		$(sel_id).data('dateRangePicker').destroy();	
					}
					
				});

				
			//	$("#todo_startdate").off();
				$("#todo_startdate").on("click", function(e){		
								
					
					e.stopPropagation();
					
					var st = $("#todo_startdate").val();
					var et = $("#todo_enddate").val();
					if (st != ""){
					//	$("#todo_startdate").data('dateRangePicker').setDateRange(st,et);
					//	$('#todo_startdate').dateRangePicker({ startDate: st, endDate: et });
					}
					
					$("#todo_startdate").data('dateRangePicker').open();
					var max_idx = gap.maxZindex();
					$(".date-picker-wrapper").css({'zIndex': parseInt(max_idx) + 1});
				});
				
			//	$("#todo_enddate").off();
				$("#todo_enddate").on("click", function(e){		
					
					
					e.stopPropagation();
//					var st = moment.utc($("#todo_startdate").val()).format("YYYY.MM.DD");
//					var et = moment.utc($("#todo_enddate").val()).format("YYYY.MM.DD");
					
					var st = $("#todo_startdate").val();
					var et = $("#todo_enddate").val();
					if (st != ""){
					//	$("#todo_startdate").data('dateRangePicker').setDateRange(st,et);
					}
				
					
					$("#todo_startdate").data('dateRangePicker').open();

					var max_idx = gap.maxZindex();
					$(".date-picker-wrapper").css({'zIndex': parseInt(max_idx) + 1});
					
					
					
				});				
				
			}else{
				$('#todo_startdate').off();
				$('#todo_startdate').mobiscroll().datepicker({
					locale: (gap.curLang == "ko" ? mobiscroll.localeKo : (gap.curLang == "cn" ? mobiscroll.localeZh : mobiscroll.localeEn)),
					theme: 'ios',
					themeVariant : 'light',
					controls: ['calendar'],
					select: 'range',				
					dateFormat: 'YYYY.MM.DD',	
					display: 'anchored',
					calendarType: 'month',	
					startInput: '#todo_startdate',
				    endInput: '#todo_enddate',
					pages : 2,
					touchUi: true,
					onInit: function (event, inst) {
						inst.setVal([new Date($("#todo_startdate").val()), new Date($("#todo_enddate").val())])
				    },
				    onChange : function(event, inst){
				    	
				    	var _period = "";
				    	
				    	if ( $("#todo_startdate").val() == "" && $("#todo_enddate").val() == "" ){
				    		_period = "";			    			
				    	}else{
				    		_period = $("#todo_startdate").val() + " - " + $("#todo_enddate").val();
				    	}
				    	
				    	
				    	
				    	if (_period != event.valueText){
					    	var spl = event.valueText.split(" - ");
					    	var st = spl[0];
					    	var et = spl[1];
					    	
					    	var dis_start = moment.utc(st).format("YYYY.MM.DD");
							var dis_end = moment.utc(et).format("YYYY.MM.DD");
							
							var startdate = moment.utc(st).format();
							var enddate = moment.utc(et).format();
							
//							var startdate = moment.utc(st).format();
//							var enddate = moment.utc(et).add(1, 'days').subtract(1, 's');
												
							$("#todo_startdate").val(dis_start);
							$("#todo_enddate").val(dis_end);										
				
							var data = JSON.stringify({
								startdate : startdate,
								enddate : enddate,
								select_id : gTodo.select_id,
							//	project_code : gTodo.cur_todo_code
								project_code : gTodo.select_todo.project_code
							});
				
							var url = gap.channelserver + "/update_todo_item_sub_date.km";
							$.ajax({
								type : "POST",
								dataType : "json",
								contentType : "application/json; charset=utf-8",
								data : data,
								url : url,					
								success : function(res){
									if (res.result == "OK"){
										var status = res.data.status;
										gTodoC.update_todo_progress_icon(gTodo.cur_todo_code, status);
										
										//레이어 하단에 날짜 값을 변경한다.
										gTodo.date_change_check(startdate, enddate);
										
										var change_doc = res.data.doc;
										gTodo.change_local_data(change_doc);
										
										// 캘린더 이벤트 업데이트
										gTodoC.update_calendar_event(gTodo.select_id);
										
										
										//날짜가 변경될 경우 담당자의 일정을 수정해 준다.										
										if (typeof(change_doc.asignee) != "undefined"){											
											gap.schedule_update(change_doc, "asignee", "U");
										}
										
										
									}else{
										gap.error_alert();
									}
									
								},
								error : function(e){
									gap.error_alert();
								}
							});						
						}
				    }
				});				
			}


		},
		
		
		"todo_call_users" : function(){
			
			
			gTodo.cur_type = "card"				
		//	gTodoC.todo_left();		
			gTodo.todo_center_user();	
			
			
			
			//$('select').material_select();
		},
		
		"todo_center_user" : function(){
			//////////////////////////// 가운데 영역 ///////////////////////////////////////////////////////////////////
		
			
			
			//var html3 = "<div id='todo_main' style='width:100%'>" + html2 + "</div>";
			if (gTodo.cur_todo_caller == "plugin"){
			//	$(".left-area").hide();
				$("#channel_list").show();
				$("#channel_list").off();
				$("#channel_list").removeAttr("class");
				$("#channel_list").addClass("left-area todo fold-temp");
			}else{
				$(".left-area").hide();
				$("#center_content").show();
				$("#center_content").off();
				$("#center_content").removeAttr("class");
				$("#center_content").addClass("left-area todo fold-temp");
			}

		//	$("#center_content").css("width","calc(100% - 300px)");
			
			
			
								

			var url = gap.channelserver + "/list_item_todo.km";
		/*	var data = JSON.stringify({
				project_code : gTodo.cur_todo_code,
				email : gap.search_cur_em_sec(),
				category : "1"
			});*/
			
			var data = JSON.stringify({
				project_code : gTodo.cur_todo_code,
				category : "1"
			});
			
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				url : url,
				data : data,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){
					if (res.result == "OK"){
						var list = res.data.data;
						
						//드래그 & 드롭으로 이동할때 id값으로 정보를 모두 가져오기 위해서 변수에 담아 놓는다.
						gTodo.cur_project_item_list = list;
						
						///////////////////////////////////////////////
						var html2 = "";						
						html2 += gTodo.center_top_menu_draw(2);							
						html2 += gTodo.todo_center_default_user();					
						html2 += "</div>";
						
						
						if (gTodo.cur_todo_caller == "plugin"){
							$("#channel_list").html(html2);
							$("#todo_scroll").css("height", "calc(100% - 280px)");
							$("#todo_main").css("height", "calc(100% - 50px)");
							$("#channel_list").css("overflow","hidden");
						}else{
							$("#center_content").html(html2);
							$("#todo_scroll").css("height", "calc(100% - 130px)");
							$("#todo_main").css("height", "calc(100% - 50px)");
							$("#center_content").css("overflow","hidden");
						}
						
						
						////////////////////////////////////////////////
						//가운데 카드를 그리는 함수
						gTodo.draw_todo_body_card_user();
						
						///////////////////////////////////////////////
						
						var pinfo = res.data.project_info;		
						gTodo.todo_top_title_change(pinfo.name, pinfo.comment);			
						var favorite = res.data.favorite;
						if (favorite == "T"){
							$("#todo_top_favorite_btn").addClass("on");
						}else{
							$("#todo_top_favorite_btn").removeClass("on");
						}
					
						//우측에 멤버 프레임 표시할때 참조해서 사용한다.
						gTodo.cur_project_info = pinfo;
						
						//TOP Menu 버튼 엽에 해당 프로젝트 멤버수를 표시힌다.
						var member_count = pinfo.member.length;
						$("#todo_top_member_count").html("(" + (member_count+1) + ")");
						
						//우측 프레임 멥버를 그린다.
						gTodo.todo_members();						
						
										
						gTodo.__todo_center_event();
						
						
					}else{
						gap.error_alert();
					}
				},
				error : function(e){
					gap.error_alert();
				}
			});
		
			
			

			
		},
		
		"draw_todo_body_card_user" : function(){
			
			var list = "";
			
			if (gTodo.filtering){
				list = gTodo.cur_project_item_list_temp;
			}else{
				list = gTodo.cur_project_item_list;
			}
			
			
			for (var i = 0 ; i < list.length; i++){
				var info = list[i];
				var html = gTodo.todo_make_card(info);
				if ( (typeof(info.asignee) != "undefined") && (info.asignee != "")){
					var em = gTodo.ch_em(info.asignee.em);
					$("#card_"+ em).append(html);		
				}else{
					
					$("#card_unasign_div").append(html);		
				}							
			}						
			
			//각 항목별 카운트를 계산한다.
			
			var lx = $("#todo_main_content .card");
			for (var i = 0 ; i < lx.length; i++){
				var key = lx[i];
				var cnt = $("#" + key.id + " .xcard").length;
				$("#" + key.id.replace("card_","count_")).html("(" + cnt + ")");
			}
			
			
			gTodo.__after_draw_event();					
			gTodo.__draganddrop();		
		},
	
		"todo_center_default_user" : function(){
			var html2 = "";
			html2 += " <div id='todo_scroll'>";
			html2 += "	<div class='todo-card' id='todo_main_content'>";
			
			var list = gTodo.cur_project_item_list;
			var users = [];
			var emails = [];
			var is_unsign = false;
			var unsign_count = 0;
			for (var i = 0 ; i < list.length; i++){					
				if ( (typeof(list[i].asignee) != "undefined") && (list[i].asignee != "") ){
					var ix = list[i].asignee.nm;
					users.push(ix);
					var email = list[i].asignee.em;
					emails.push(email);
				}else{
					is_unsign = true;	
					unsign_count ++;
				}				
			}
			var ux = [];
			var ems = [];
			var kk = 0;
			
			$.each(users, function(i,el){
				if ($.inArray(el, ux) === -1){
					ux.push(el);
					ems.push(emails[kk]);
				}
				kk++;
			});
			
			if (is_unsign){
				html2 += "		<div class='card-list ' id='card_unasingn'>";
				html2 += "			<div>";
				html2 += "				<h2>"+gap.lang.Unassigned+"<span id='count_unasign_div'> ("+unsign_count+")</span></h2>";
				html2 += "				<div class='input-field'>";
				html2 += "					<input type='text' class='formInput'  autocomplete='off' placeholder='+ "+gap.lang.addtodo+"' />";
				html2 += "					<span class='bar'></span>";
				html2 += "				</div>";
				html2 += "			</div>";
				html2 += "			<div class='card' id='card_unasign_div' style='min-height:300px'>";
				html2 += "			</div>";
				html2 += "		</div>";
			}
			
			for (var i = 0 ; i < ux.length; i++){
				var username = ux[i];
			
				var em = gTodo.ch_em(ems[i]);
				html2 += "		<div class='card-list ' id='cc_"+em+"'>";
				html2 += "			<div>";
				html2 += "				<h2>"+username+"<span id='count_"+em+"'> </span></h2>";
				html2 += "				<div class='input-field'>";
				html2 += "					<input type='text' class='formInput'  autocomplete='off' placeholder='+ "+gap.lang.addtodo+"' />";
				html2 += "					<span class='bar'></span>";
				html2 += "				</div>";
				html2 += "			</div>";
				html2 += "			<div class='card' id='card_"+em+"' style='min-height:300px'>";
				html2 += "			</div>";
				html2 += "		</div>";
			}


			html2 += "	</div>";
			
			html2 += "	</div>";
		
			return html2;
		},
		
		"ch_em" : function(email){
			return email.replace("@","-spl-").replace(/\./gi,"-sp-");
		},
		
		"dh_em" : function(id){
			return id.replace("-spl-", "@").replace(/-sp-/gi, ".");
		},
		
		"date_diff" : function(startdate, enddate){
			
			var sdate = new Object();
			var st = moment.utc(new Date(startdate)).format("YYYY.MM.DD");
			var et = moment.utc(new Date(enddate)).format("YYYY.MM.DD");
			var duration = moment.duration(moment.utc(new Date(enddate)).diff(moment.utc(new Date(startdate))));
			var term = duration.asDays();
			term = term.toFixed(0);
			
			var now = moment.utc(new Date());
			var sts = moment.utc(new Date(startdate));
			var ets = moment.utc(new Date(enddate));
			var df = sts.diff(now, "days");
			var rate = 0;
			if (df < 0){
				//시작일이 오늘을 지났기 때문에 비율을 계산해야 한다.
				var df1 = ets.diff(sts, "days")+1;
				var df2 = now.diff(sts, "days")+1;
				rate = parseInt((parseInt(df2) / parseInt(df1)) * 100);
			}	
			
			sdate.st = st;
			sdate.et = et;
			sdate.rate = rate;
			sdate.term = term;
			
			return sdate;
		},
		
		"show_filter" : function(opt, arr){
			
			gTodo.ck = opt;
			gTodo.cklist = arr;
			
			gTodo.filtering = true;
			
			var url = "";
			var data = "";
			if (arr.length == 0){
				url = gap.channelserver + "/list_item_todo.km";
			/*	data = JSON.stringify({
					project_code : gTodo.cur_todo_code,
					email : gap.search_cur_em_sec(),
					category : "1"
				});*/
				
				data = JSON.stringify({
					project_code : gTodo.cur_todo_code,
					category : "1"
				});
				
			}else{
				url = gap.channelserver + "/list_item_todo_filter.km";
			/*	data = JSON.stringify({
					project_code : gTodo.cur_todo_code,
					opt : opt,
					arr : arr,
					email : gap.userinfo.rinfo.em
				});*/
				
				data = JSON.stringify({
					project_code : gTodo.cur_todo_code,
					opt : opt,
					arr : arr
				});
			}
 
			$("#todo_tag_btn span").removeClass("select_style");
			$("#todo_priority_btn span").removeClass("select_style");
			$("#todo_color_btn span").removeClass("select_style");
			$("#todo_filter_btn span").removeClass("select_style");
			
			if (arr.length > 0){
				if (opt == "tag"){
					$("#todo_tag_btn span").addClass("select_style");
				}else if (opt == "priority"){
					$("#todo_priority_btn span").addClass("select_style");
				}else if (opt == "color"){
					$("#todo_color_btn span").addClass("select_style");					
				}else if (opt == "asignee"){
					$("#todo_filter_btn span").addClass("select_style");		
				}
			}else{
				if (opt == "tag"){
					$("#todo_tag_btn span").removeClass("select_style");					
				}else if (opt == "priority"){
					$("#todo_priority_btn span").removeClass("select_style");
				}else if (opt == "color"){
					$("#todo_color_btn span").removeClass("select_style");		
				}else if (opt == "asignee"){					
					$("#todo_filter_btn span").removeClass("select_style");		
				}
			}
			
			
			
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				url : url,
				data : data,
				beforeSend : function(xhr){
					xhr.setRequestHeader("auth", gap.get_auth());
					xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
				},
				success : function(res){
					if (res.result == "OK"){
						
						var list = res.data.data;
						gTodo.cur_project_item_list_temp = list;
						
						if (gTodo.cur_type == "list"){
							gTodo.todo_center_status_list();
						}else if (gTodo.cur_type == "card"){
							if (gTodo.cur_todo == "status"){
								 gTodo.todo_center_status_change();
							}else if (gTodo.cur_todo == "user"){								
								gTodo.todo_call_users();
							}
						}else if (gTodo.cur_type == "calendar"){
							
							gTodoC.redraw_calendar_event();
						}
						
					}
				},
				error : function(e){
					
				}
			});
		},
		
		
		
		"cur_display_refresh" : function(id){
			gTodo.select_id = id;
			var data = JSON.stringify({
				key : id
			});
			var url = gap.channelserver + "/search_item_todo.km";
			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				url : url,
				data : data,
				success : function(res){
					if (res.result == "OK"){				
						
						gTodo.change_local_data(res.data);							
						if (gTodo.cur_type == "card"){
							
							$("#card_0").empty();
							$("#card_1").empty();
							$("#card_2").empty();
							$("#card_3").empty();
							
							gTodo.draw_todo_body_card();
						}else if (gTodo.cur_type == "list"){
							gTodo.todo_center_status_list();
						}
						
					}else{
						gap.gAlert(gap.lang.donplz);
					}
					
				},
				error : function(e){
					gap.error_alert();
				}
			});
		},
		
		"short_title" : function(title){
			var len = 10; 
			if (title.length > len){
				title = title.substr(0, len - 2) + '...';
			}
			return title;
		},
		
		/*
		 * mention 입력할때 필요한 데이터를 미리 가져온다
		 */
		"init_mention_userdata" : function(elem_id){
			if (elem_id == "rmtext_reply_todo"){
				$("#" + elem_id).closest('.mentions-input-box').children('.mentions').remove();
			}
			
			$('#' + elem_id).mentionsInput({
				onDataRequest:function (mode, query, callback) {
					$(".mentions-input-box .mentions-autocomplete-list").css("position", (elem_id == "rmtext_reply_todo" ? "absolute" : (gap.browser == "msie" ? "-ms-page" : "fixed")));

					var list = gTodo.cur_project_info;
					var data = JSON.parse(gap.convert_mention_userdata(list));
					
					data = _.filter(data, function(item) { return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1 });
					callback.call(this, data);
				}
			});
		},
		
		"dragset" : function(){
			return false;
			$("#todo_folder_list li").draggable({
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
					var spp = "<span id='"+sid+"' data-type='share' style='border:1px solid gray; padding:5px'>" + $(e.currentTarget).find("em").text() + "<span>";
					return $(spp).clone().appendTo("#nav_left_menu").css("zIndex",2000).show();
			     },			 			     
			     cursor: 'move',	  
			     
				 start : function(event, ui){
					$(this).draggable("option", "revert", false);
				},
				stop : function(event, ui){						
				}
			});		
			
			$(".folder-cls").droppable({
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
				 		
				 		
				 		gBody2.move_channel_to_folder(dragid, folderid);
				 				
				 		
					}catch(e){}
				}
			});
			
			
			$(".lnb-channel h3").droppable({
				activeClass : 'active',
				hoverClass : 'chat_hovered',
				drop : function(event, ui){
					
					try{
						
						
						var droppable = $(this);
				 		var draggable = ui.draggable;
				 	//	var folderid = $(droppable).attr("id").replace("div_","");
				 		var dragid = ui.draggable.attr("id").replace("li_cl_","");
				 		
				 		var type = $(draggable).parent().parent().parent().attr("id");
				 		var tp = $(droppable).parent().parent().attr("id");
				 		
				 	//	if (type == tp){
				 			gBody2.move_channel_to_folder(dragid, "root");
				 	//	}	 		
				 		
					}catch(e){}
				}
			});	
			
			$("#person_channel_list li").draggable({
				 revert: "invalid",
				 stack: ".draggable",     //가장위에 설정해 준다.
				 opacity: 1,
			//	 containment: "window",
				 scroll: false,
			//	 helper: 'clone',
				 cursorAt: { top: 10, left:30},
				 helper: function (e) { 	//이렇게 해야 스크롤 안에 overflow관련 CSS와 상관없이 드래그해서 옮길수 있다.		
				
					var sid = $(e.currentTarget).attr("id");
					var spp = "<span id='"+sid+"' data='person'>" + $(e.currentTarget).find("em").text() + "<span>";
					return $(spp).clone().appendTo("#nav_left_menu").css("zIndex",2000).show();
			     },			 			     
			     cursor: 'move',	  
			     
				 start : function(event, ui){
					$(this).draggable("option", "revert", false);
				},
				stop : function(event, ui){						
				}
			});					
			
		}
	
}

