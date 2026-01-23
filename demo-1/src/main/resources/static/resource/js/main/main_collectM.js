

function gColM(){
	this.per_page = "10";
	this.all_page = "1";
	this.start_skp = "";
	this.start_page = "1";
	this.cur_page = "1";
	this.total_page_count = "";
	this.total_data_count = "";
	this.qna_count = 0;
	this.qna_total_count = 0;
	this.search_collection_type = "";
	this.search_collection_opt = "1";
	this.collect_key = "";
} 

$(document).ready(function(){

});

gColM.prototype = {
	"init" : function(){
	//	gColM.user_lang_set();
	//	gColM.all_close_layer();
	},
	
	"user_lang_set" : function(){
		var lan = "";
		if (typeof(gap.etc_info.ct) != "undefined"){
			lan = gap.etc_info.ct.lg;
		}else{
			lan = userlang;
		}
		if ((lan == "") || (typeof(lan) == "undefined")){
			lan = gap.curLang;
		}else{
			gap.curLang = lan;
		}
		
		if (typeof(mobile_lang) != "undefined"){
			lan = mobile_lang;
			gap.curLang = lan;
		}

		$.ajax({
			method : "get",
			url : cdbpath + "/lang/m_" + lan + ".json?open&ver="+jsversion,
			dataType : "json",			
			contentType : "application/json; charset=utf-8",
			async : false,
			success : function(data){	
				gap.lang = data;					
			},
			error : function(e){
				gap.error_alert();
			}
		});
	},
	
	"all_close_layer" : function(){
		gap.hideBlock();
		
		$("div").each(function(){
			if ($(this).attr("data") == "_layer"){
				$('#' + $(this).attr("id")).hide();	
			}
		});
		$('#dis').empty();
		$('#dis').show();
	},	
	
	"tab1" : function(){
		// 받은 취합
		gColM.search_collection_type = "2";
		
		var _main = gColM.drawCollectMain();
		$('#dis').html(_main);
		
		// 취합 리스트
		gColM.drawCollectList(1);
		
		//이벤트 처리
		gColM.eventCollectMain();
	},
	
	"tab2" : function(){
		// 보낸 취합
		gColM.search_collection_type = "3";

		var _main = gColM.drawCollectMain();
		$('#dis').html(_main);
		
		// 취합 리스트
		gColM.drawCollectList(1);
		
		//이벤트 처리
		gColM.eventCollectMain();
	},
	
	"tab3" : function(){
		// 참조
		gColM.search_collection_type = "4";
		
		var _main = gColM.drawCollectMain();
		$('#dis').html(_main);
		
		// 취합 리스트
		gColM.drawCollectList(1);
		
		//이벤트 처리
		gColM.eventCollectMain();
	},
	
	"drawCollectMain" : function(){
		var html = 
			'<div class="wrap">' +
			'	<div id="container" class="mu_mobile">' +
			'		<section class="gathering">' +
			'			<div>' +
			'				<!-- 셀렉트박스 -->' +
			'				<div class="f-right">' +                      
			'					<div class="input-field selectbox">' +
			'						<select id="collect_status_type">' +
			'							<option value="1">' + gap.lang.status_collection + '</option>' +
			'							<option value="2">' + gap.lang.ing_collection + '</option>' +
			'							<option value="3">' + gap.lang.close_collection + '</option>' +
			'							<option value="4">' + gap.lang.before_submission + '</option>' +
			'							<option value="5">' + gap.lang.close_submission + '</option>' +
			'						</select>' +
			'					</div>' +
			'				</div>' +
			'				<!-- 취합카드 -->' +
			'				<div class="gather-list-wr" id="collect_list">' +
			'				</div>' +
			'			</div>' +
			'		</section>' +
			'	</div>' +
			'</div>';
		
		return html;
	},
	
	"drawCollectList" : function(page_no){
		gColM.start_skp = (parseInt(gColM.per_page) * (parseInt(page_no))) - (parseInt(gColM.per_page) - 1);
		var surl = gap.channelserver + "/api/collection/search_collection.km";
		
		var postData = {
				"start" : (gColM.start_skp - 1).toString(),
				"perpage" : gColM.per_page,
				"day" : moment.utc().format(),
				"dcode" : gap.userinfo.rinfo.dpc,
				"type" : gColM.search_collection_type,
				"opt" : gColM.search_collection_opt
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
					var _list = res.data.data;
					var _today_date = moment(new Date()).utc().local().format('YYYY-MM-DD');	//moment(new Date());

				/*	$("#all_coll span").html(res.data.total);
					$("#receive_coll span").html(res.data.t1);
					$("#send_coll span").html(res.data.t2);
					$("#ref_coll span").html(res.data.t3);*/
					
					if (page_no == 1){
						$("#collect_list").empty();
					}
					
					if (_list.length == 0){
						//데이터가 없는 경우
						var no_collect_html = '';
						no_collect_html += '<div class="wrap box-empty">';
						no_collect_html += '	<dl>';
						no_collect_html += '		<dt><span class="ico-etc no-box"></span></dt>';
						no_collect_html += '		<dd style="font-size:15px;">' + gap.lang.nocontent + '</dd>';
						no_collect_html += '	</dl>';
						no_collect_html += '</div>';
						
						$("#collect_list").html(no_collect_html);			
						return false;
					}
					
					for (var i = 0; i < _list.length; i++){
						var _info = _list[i];
						var _title = _info.name;
						var _content = _info.content;
						var _disp_date = moment.utc(_info.due_date).local().format('YYYY.MM.DD')
						var _due_date =  moment(_info.due_date).utc().local().format('YYYY-MM-DD');	//moment(_info.due_date);
						var _diff_days = moment(_due_date).diff(moment(_today_date), 'days');	//_due_date.diff(_today_date, 'days') + 1;
						var _owner_info = gap.user_check(_info.owner);
						var _folder = (_info.file_info != "" ? _info.file_info.folder : _info.key);
						var _cyear = (_info.file_info != "" ? _info.file_info.cyear : _info.key.substr(0,4));
						var _col_id = _info._id;
						var _type = "";
						var _status_txt = "";				// 취합 상태
						var _type_response_btn = "";		// 응답버튼 유형 (P : 개인 / D : 부서)
						var _show_response_btn = false;		// 제출담당자 등답버튼 보이기
						var _show_edit_btn = false;			// 제출담당자 수정버튼 보이기
						var _show_del_btn = false;			// 삭제버튼 보이기
						var _has_response = false;			// 응답문서가 있는지 여부
						var _res_count = 0;					// 응답 갯수
						var _file_info = "";
						var _request_html = "";
						var _html = "";
						
						var t1 = moment(_info.due_date).utc().local().format('YYYY-MM-DD HH:mm'); 
						var t2 = moment(); 
						var dif = moment.duration(t2.diff(t1)).asMinutes();
						
						if (_folder == "undefined"){
							_folder = _info.key;
						}
						
						// 취합 마감 기한 체크
						if (dif > 0){
							_diff_days = -1;
						}
		
						if (typeof(_info.file_info) != "undefined" && _info.file_info != ""){
							_file_info = _info.file_info.files;
						}

						if (typeof(_info.res_members) != "undefined"){
							_has_response = true;
							_res_count = _info.res_members.length;
						} 
						
						for (var j = 0; j < _info.submitter.length; j++){
							var _submitter = _info.submitter[j];
							if ((_submitter.ky == gap.userinfo.rinfo.ky) || (_submitter.dsize == "group" && (_submitter.dpc == gap.userinfo.rinfo.dpc))){
								_type = gap.lang.receive_collection;
								var _ky = "";
								if (_submitter.ky == gap.userinfo.rinfo.ky){
									_type_response_btn = "P";
									_ky = _submitter.ky;
								}else{
									_type_response_btn = "D";
									_ky = _submitter.dpc;
								}
								
								if (_diff_days > -1){
									_status_txt = gap.lang.before_submission;
									_show_response_btn = true;								
								}
								
								if (_has_response){
									for(h = 0; h < _info.res_members.length; h++){
										var res_member = _info.res_members[h];
										if (res_member == _ky){
											_status_txt = gap.lang.complete_submission;
											_show_response_btn = false;
											_show_edit_btn = true;
										}
									}
								}
								
								break;
							}
						}
						
						for (var k = 0; k < _info.referrer.length; k++){
							var _referrer = _info.referrer[k];
							if (_referrer.ky == gap.userinfo.rinfo.ky){
								_type = gap.lang.reference;
								if (_diff_days > -1){
									_status_txt = gap.lang.ing_collection;
								}
								if (_res_count == _info.submitter.length){
									_status_txt = gap.lang.close_collection;
								}								
								break;
							}
						}
						
						if (_owner_info.ky == gap.userinfo.rinfo.ky){
							_show_response_btn = false;
							_show_edit_btn = false;
							_show_del_btn = true;
							_type = gap.lang.sent_collection;
							if (gColM.search_collection_type == "2"){
								_type = gap.lang.receive_collection;
								
							}else if (gColM.search_collection_type == "3"){
								_type = gap.lang.sent_collection;
							}
							if (_diff_days > -1){
								_status_txt = gap.lang.ing_collection;
							}
						}
						
						if (_diff_days < 0){
							//취합 마감
							_show_response_btn = false;
							_show_edit_btn = false;
							_status_txt = gap.lang.close_collection;
						}

						_html += '<div class="gather-list" id="' + _folder + '">';
						_html += '	<div class="rel">';
					//	_html += '		<button class="abs ico ico-more">더보기</button>';
						_html += '		<span class="gather desc text-elips">' + _type + '</span>';                              
						_html += '		<span class="gather tit">' + _title + '</span>'; 
						_html += '		<div class="gather line-box">';
						_html += '			<p class="txt">' + gap.lang.deadline + ' ' + _disp_date + '(' + moment(_info.due_date).format('ddd') + ') ' + _info.due_time + '</p>';
						if (_diff_days > 0){
							_html += '			<span class="dday">D-' + _diff_days + '</span>';	
						}
						_html += '		</div>';
						_html += '		<div class="gather sub_desc f_between">';
						_html += '			<span>' + _owner_info.disp_user_info + '</span>';
						_html += '			<span>' + _status_txt + '(' + _res_count + '/' + _info.submitter.length + gap.lang.myung + ')</span>';
						_html += '		</div>';
						_html += '	</div>';
						_html += '</div>';

						
						$("#collect_list").append(_html);
						$("#" + _folder).data("folder", _folder);
					}
					
					//페이징
					gColM.total_data_count = res.data.total;
					gColM.total_page_count = gColM.getPageCount(gColM.total_data_count, gColM.per_page);
					
					// 이벤트 처리
					gColM.eventCollectList();
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
				return false;
			}
		});		
	},
	
	"eventCollectMain" : function(){
		$('#collect_status_type').val('1');
		$('#collect_status_type').material_select();
		$('#collect_status_type').off().on("change", function(){
			gColM.search_collection_opt = $(this).val();
			gColM.drawCollectList(1);
		});
	},
	
	"eventCollectList" : function(){
		$('.gather-list').off().on('click', function(){
			var _id = $(this).attr('id');
			var url = gap.getBaseUrl() + "collect?readform&t=detail&k1=" + _id + "&k2=&k3=";
			var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(url);
			gBodyM.connectApp(url_link);
			return false;		
		});
	},
	
	// 응답 작성
	"createCollectResponse" : function(_folder, _res_type){
		var surl = gap.channelserver + "/api/collection/search_collection_item.km";
		var postData = {
				"key" : _folder
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
					var main = res.data.ori;
					var main_content = main.content;
					var main_finfo = main.file_info;
					var _fserver = main.fserver;
					var _folder = (main_finfo != "" ? main_finfo.folder : main.key);
					var _cyear = (main_finfo != "" ? main_finfo.cyear : main.key.substr(0,4));
					var _ky = "";
					var _file_info = "";
					var _file_html = "";
					
					var _endtime = moment(main.due_date).format('YYYY-MM-DD') + ' ' + main.due_time;
					var _deadline = false;
					var t1 = moment(_endtime, 'YYYY-MM-DD HH:mm'); 
					var t2 = moment(); 
					var dif = moment.duration(t2.diff(t1)).asMinutes();
					
					if (_folder == "undefined"){
						_folder = main.key;
					}
					
					// 취합 마감 기한 체크
					if (dif > 0){
						_deadline = true;
					}
					
					if (typeof(main_finfo) != "undefined" && main_finfo != ""){
						_file_info = main_finfo.files;
					}
					
					for (var i = 0; i < _file_info.length; i++){
						var _file = _file_info[i];
						_file_html += '<div><a href="#" class="download-file">' + _file.filename + '</a></div>';
					}
					
					if (_res_type == 'P'){
						_ky = gap.userinfo.rinfo.ky;
						
					}else{
						_ky = gap.userinfo.rinfo.dpc;
					}
					
					var html =
						'<div class="wrap">' +
						'	<div id="container" class="mu_mobile">' +
						'		<section class="gathering mo_gathering new_gathering">' +
						'			<div class="m_g_pop" style="overflow-y:auto;">' +
						'				<div class="pop_tit">' +
						'					<h1>' + gap.lang.collection_write + '</h1>' +
						'				</div>' +
						'				<div class="m_write">' +
						'					<div class="sub_txt">' +
						'						<span>' + main_content +
						'						</span>' +
						'					</div>' +
						'					<div class="tit_write">' +
						'						<textarea rows="" cols="" id="collect_response_express" placeholder="' + gap.lang.input_content + '"></textarea>' +
						'					</div>' +
						'					<div class="file_write_sec">' +
						'						<div class="file_write_tit">' +
						'							<span>' + gap.lang.attachment + '</span>' +
						'							<button type="button" id="file_add_btn">' + gap.lang.addFile + '</button>' +
						'						</div>' +
						'						<div class="file_sec">' +
						'							<div id="add_file_list" class="file_down_link">' +
						'							</div>' +
						'						</div>' +
						'					</div>';
					
					if (_file_html != ""){
						html += 
							'					<div class="down_sec" style="padding-top:8px;">' +
							'						<div class="file_write_tit">' +
							'							<span>' + gap.lang.download_template_file + '</span>' +
							'						</div>' +
							'						<div class="file_down_link">' +
							'							<span>' + _file_html + '</span>' +
							'						</div>';
							'					</div>';
					}
					
					html +=
						'				<div class="write_b_sec" style="padding-top:30px;">' +
					//	'					<button type="button" class="temp">임시저장</button>' +
						'					<button type="button" id="submit_btn" class="subm">' + gap.lang.submission + '</button>' +
						'				</div>' +
						'			</div>' +
						'		</section>' +
						'	</div>' +
						'</div>';
					
					$('#dis').html(html);
					
					$layer = $('#container');
					$layer.data('folder', _folder);
					$layer.data('cyear', _cyear);
					
					// 파일 추가
					$layer.find('#file_add_btn').on('click', function(){
						//여기에 파일을 업로드할 수 있는 네이티브콜 선언						
						var url_link = "kPortalMeet://NativeCall/callAddFile?folder=" + _folder + "&cyear=" + _cyear;
						gBodyM.connectApp(url_link);
						return false;
						
					});
					
					
					// 템픞릿 파일
					$layer.find('.download-file').on('click', function(){
						var _folder = $layer.data('folder');
						var url = gap.getBaseUrl() + "collect?readform&t=mainfile&k1=" + _folder + "&k2=&k3=";
						var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(url);
						gBodyM.connectApp(url_link);
						return false;	
					});
			
					// 제출
					$layer.find('#submit_btn').on('click', function(){
					/*
					 *	체크하지 않게 처리 요청 - 황수진 (2022.11.21)
					 * 	if (_deadline){
							mobiscroll.toast({message:gap.lang.close_collect, color:'info'});
							return false;
						}*/
						
					/*	var upload_file_info = "";
						$('#add_file_list div').each(function(idx, val){
							if (upload_file_info == ""){
								upload_file_info = $(val).data('info');
								upload_file_info.folder = _folder;
								
							}else{
								var finfo = $(val).data('info');
								upload_file_info.files.push(finfo.files[0]);
							}
						});
						
						if (upload_file_info == ""){
							upload_file_info = new Object();
							upload_file_info.files = [];
							upload_file_info.folder = _folder;
							upload_file_info.fserver = "";
						}*/
						
						var upload_file_info = new Object();
						upload_file_info.files = [];
						upload_file_info.folder = _folder;
						upload_file_info.fserver = _fserver;
						
						$('#add_file_list div').each(function(idx, val){
							var finfo = $(val).data('info');
							upload_file_info.files.push(finfo);
						});

						var $content = $layer.find('#collect_response_express');
						if ($content.val() ==  "" && (upload_file_info == ""
							|| (typeof(upload_file_info.files) != "undefined" && upload_file_info.files.length == 0))){
							mobiscroll.toast({message:gap.lang.input_content, color:'danger'});
							return false;
						}

						var surl = gap.channelserver + "/save_collection_response.km";
						var postData = {
								"ky" : _ky,
								"writer" : gap.userinfo.rinfo,
								"content" : $content.val(),
								"fserver" : gap.channelserver,
								"file_info" : upload_file_info
							};
						
						var post_data = postData;
						
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
								
								// 일정 완료 처리
								gap.schedule_update_collection(post_data, 'T', true);
								
								var url_link = "kPortalMeet://NativeCall/callCloseLayer?done=yes&reload=yes";
								gBodyM.connectApp(url_link);
								return false;
							},
							error : function(e){
								gap.gAlert(gap.lang.errormsg);
								return false;
							}
						});
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
	},
	
	// 응답 수정
	"editCollectResponse" : function(_folder, _res_type){
		var surl = gap.channelserver + "/api/collection/search_collection_item.km";
		var postData = {
				"key" : _folder
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
					var main = res.data.ori;
					var response = res.data.response;
					var main_content = main.content;
					var main_finfo = main.file_info;
					var _fserver = main.fserver;
					var _folder = (main_finfo != "" ? main_finfo.folder : main.key);
					var _cyear = (main_finfo != "" ? main_finfo.cyear : main.key.substr(0,4));
					var _file_info = "";
					var _file_html = "";
					var my_response = "";
					
					if (_folder == "undefined"){
						_folder = main.key;
					}
					
					if (typeof(main_finfo) != "undefined" && main_finfo != ""){
						_file_info = main_finfo.files;
					}
					
					for (var i = 0; i < _file_info.length; i++){
						var _file = _file_info[i];
						_file_html += '<div><a href="#" class="download-file">' + _file.filename + '</a></div>';
					}
					
					if (_res_type == 'P'){
						_ky = gap.userinfo.rinfo.ky;
						
					}else{
						_ky = gap.userinfo.rinfo.dpc;
					}
					
					for (var i = 0; i < response.length; i++){
						var res_info = response[i];
						
						if (res_info.owner.dsize == "group" && (res_info.owner.dpc == gap.userinfo.rinfo.dpc)){
							my_response = res_info;
							break;
							
						}else{
							if (res_info.owner.ky == gap.userinfo.rinfo.ky){
								my_response = res_info;
								break;
							}
						}
					}
					
					if (my_response != ""){
						var res_content = my_response.content;
						var res_finfo = my_response.file_info;
						var res_id = my_response._id;

						var html =
							'<div class="wrap">' +
							'	<div id="container" class="mu_mobile">' +
							'		<section class="gathering mo_gathering new_gathering">' +
							'			<div class="m_g_pop" style="overflow-y:auto;">' +
							'				<div class="pop_tit">' +
							'					<h1>' + gap.lang.collection_modify + '</h1>' +
							'				</div>' +
							'				<div class="m_write">' +
							'					<div class="sub_txt">' +
							'						<span>' + main_content +
							'						</span>' +
							'					</div>' +
							'					<div class="tit_write">' +
							'						<textarea rows="" cols="" id="collect_response_express" placeholder="' + gap.lang.input_content + '"></textarea>' +
							'					</div>' +
							'					<div class="file_write_sec">' +
							'						<div class="file_write_tit">' +
							'							<span>' + gap.lang.attachment + '</span>' +
							'							<button type="button" id="file_add_btn">' + gap.lang.addFile + '</button>' +
							'						</div>' +
							'						<div class="file_sec">' +
							'							<div id="add_file_list" class="file_down_link">' +
							'							</div>' +
							'						</div>' +
							'					</div>';
						
						if (_file_html != ""){
							html += 
								'					<div class="down_sec" style="padding-top:8px;">' +
								'						<div class="file_write_tit">' +
								'							<span>' + gap.lang.download_template_file + '</span>' +
								'						</div>' +
								'						<div class="file_down_link">' +
								'							<span>' + _file_html + '</span>' +
								'						</div>';
								'					</div>';
						}
						
						html +=
							'				<div class="write_b_sec" style="padding-top:30px;">' +
						//	'					<button type="button" class="temp">임시저장</button>' +
							'					<button type="button" id="submit_btn" class="subm">' + gap.lang.basic_modify + '</button>' +
							'				</div>' +
							'			</div>' +
							'		</section>' +
							'	</div>' +
							'</div>';
						
						$('#dis').html(html);
						
						$layer = $('#container');
						$layer.data('folder', _folder);
						$layer.data('cyear', _cyear);

						// 콘첸츠 내용 세팅
						$layer.find('#collect_response_express').val(res_content);
						
						// 파일 추가
						$layer.find('#file_add_btn').on('click', function(){
							//여기에 파일을 업로드할 수 있는 네이티브콜 선언						
							var url_link = "kPortalMeet://NativeCall/callAddFile?folder=" + _folder + "&cyear=" + _cyear;
							gBodyM.connectApp(url_link);
							return false;
							
						});

						// 첨부파일 리스트
						if(typeof(res_finfo) != "undefined" && res_finfo.length != 0){
							$(res_finfo).each(function(idx, val){
								gColM.drawUploadFile(val);
							});
						}
						
						// 템픞릿 파일
						$layer.find('.download-file').on('click', function(){
							var _folder = $layer.data('folder');
							var url = gap.getBaseUrl() + "collect?readform&t=mainfile&k1=" + _folder + "&k2=&k3=";
							var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(url);
							gBodyM.connectApp(url_link);
							return false;	
						});
						
						// 수정
						$layer.find('#submit_btn').on('click', function(){
						/*
						 *	체크하지 않게 처리 요청 - 황수진 (2022.11.21)
						 * 	if (_deadline){
								mobiscroll.toast({message:gap.lang.close_collect, color:'info'});
								return false;
							}*/
							
							var upload_file_info = new Object();
							upload_file_info.files = [];
							upload_file_info.folder = _folder;
							upload_file_info.fserver = _fserver;
							
							$('#add_file_list div').each(function(idx, val){
								var finfo = $(val).data('info');
								upload_file_info.files.push(finfo);
							});

							var $content = $layer.find('#collect_response_express');
							if ($content.val() ==  "" && (upload_file_info == ""
								|| (typeof(upload_file_info.files) != "undefined" && upload_file_info.files.length == 0))){
								mobiscroll.toast({message:gap.lang.input_content, color:'danger'});
								return false;
							}

							var surl = gap.channelserver + "/update_collection_response.km";
							var postData = {
									"id" : res_id,
									"writer" : gap.userinfo.rinfo,
									"content" : $content.val(),
									"file_info" : upload_file_info
								};
							
							var post_data = postData;
							
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
										var url_link = "kPortalMeet://NativeCall/callCloseLayer?done=yes&reload=yes";
										gBodyM.connectApp(url_link);
										return false;										
									}
								},
								error : function(e){
									gap.gAlert(gap.lang.errormsg);
									return false;
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
	},
	
	"drawUploadFile" : function(info){
		var finfo = (typeof(info.files) != "undefined" ? info.files[0] : info);
		var md5_id = (typeof(finfo.md5) != "undefined" ? finfo.md5.replace(".", "_") : "");
		var filename_ext = gap.file_extension_check(finfo.filename);
		var filename_only = finfo.filename.substr(0, finfo.filename.lastIndexOf('.')) || finfo.filename;
		var filename = (filename_only.length > 30 ? filename_only.substr(0, 30) + '...' + filename_ext : finfo.filename);
		
		var html = 
			'<div class="file_down_link"' + (md5_id != "" ? ' id="' + md5_id + '"' : "") + '>' +
			'	<span>' + filename + ' <span class="close_icon"></span></span>' +
			'</div>';

	/*	if ($('#' + md5_id).length > 0){
			mobiscroll.toast({message:gap.lang.exist_file, color:'danger'});
			return false;
		}*/
		$('#add_file_list').append(html);
		$('#' + md5_id).data('info', finfo);
		
		// 파일 삭제
		$('.file_down_link .close_icon').off().on('click', function(){
			var _file_info = $(this).closest('div').data('info');
			var _folder = $('#container').data('folder');
			var _cyear = $('#container').data('cyear');
			
			gColM.removeResponseTempFile(_file_info, _folder, _cyear);
		});
	},
	
	"removeResponseTempFile" : function(_file_info, _folder, _cyear){
		var finfo = (typeof(_file_info.files) != "undefined" ? _file_info.files[0] : _file_info);
		var filename = finfo.savefilename;
		var md5_id = finfo.md5.replace(".", "_");
		
		var surl = gap.channelserver + "/collection_response_file_delete_temp.km";
		var postData = {
				"cyear" : _cyear,
				"folder" : _folder,
				"fn" : filename
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
					$('#' + md5_id).remove();

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
	
	"getPageCount" : function(doc_count, rows){
		return ret_page_count = Math.floor(gColM.total_data_count / rows) + (((gColM.total_data_count % rows) > 0) ? 1 : 0);
	},
	
	"callCollectDetailView" : function(_folder){
		var surl = gap.channelserver + "/api/collection/search_collection_item.km";
		var postData = {
				"key" : _folder
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
					gColM.drawCollectDetailView(res);

				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});	
	},
	
	"drawCollectDetailView" : function(res){
		var _html = '';
		var _info = res.data.ori;
		var _response = res.data.response;
		var _qna_count = res.data.qnacount;
		var _created_date = gColM.convertGMTLocalDateTime(_info.GMT);
		var _today_date = moment(new Date()).utc().local().format('YYYY-MM-DD');	//moment(new Date());
		var _disp_date = moment(_info.due_date).utc().local().format('YYYY.MM.DD');
		var _due_date = moment(_info.due_date).utc().local().format('YYYY-MM-DD');
		var _diff_days = moment(_due_date).diff(moment(_today_date), 'days');
		var _owner_info = gap.user_check(_info.owner);
		var _folder = (_info.file_info != "" ? _info.file_info.folder : _info.key);
		var _fserver = _info.file_info.fserver;
		var _col_id = _info._id;
		var _status_txt = "";					// 취합 상태
		var _submit_status_txt = "";			// 제출상태
		var _role_txt = "";						// 내 역할
		var _type_response_btn = "";			// 응답버튼 유형 (P : 개인 / D : 부서)
		var _show_main_edit_btn = false;		// 메인문서 수정버튼 보이기
		var _show_response_btn = false;			// 등답버튼 보이기
		var _show_response_edit_btn = false;	// 응답문서 수정버튼 보이기
		var _has_response = false;				// 응답문서가 있는지 여부
		var _res_count = 0;						// 응답 갯수
		var _file = "";							// 첨부파일 이름
		var _file_md5 = "";						// 첨부파일 md5
		var _file_count = 0;					// 첨부파일 갯수
		var _kys = [];
		
		var t1 = moment(_info.due_date).utc().local().format('YYYY-MM-DD HH:mm'); 
		var t2 = moment(); 
		var dif = moment.duration(t2.diff(t1)).asMinutes();
		
		if (_folder == "undefined"){
			_folder = _info.key;
		}
		
		// 취합 마감 기한 체크
		if (dif > 0){
			_diff_days = -1;	
		}
		
		if (typeof(_info.file_info) != "undefined" && _info.file_info != "" && _info.file_info.files.length > 0){
			_file = (_info.file_info.files.length == 1 ? _info.file_info.files[0].filename : _info.file_info.files[0].filename + " " + gap.lang.other + " " + (_info.file_info.files.length - 1) + " " + gap.lang.total_attach_count_txt);
			_file_md5 = _info.file_info.files[0].md5;
			_file_count = _info.file_info.files.length;
		}
		
		gColM.collect_submitter_list = _info.submitter;
		
		if (typeof(_info.res_members) != "undefined"){
			_has_response = true;
			_res_count = _info.res_members.length;
		} 

		for (var j = 0; j < _info.submitter.length; j++){
			var _submitter = _info.submitter[j];
			if ((_submitter.ky == gap.userinfo.rinfo.ky) || (_submitter.dsize == "group" && _submitter.dpc == gap.userinfo.rinfo.dpc)){
				var _ky = "";
				if (_submitter.ky == gap.userinfo.rinfo.ky){
					_type_response_btn = "P";
					_ky = _submitter.ky;
				}else{
					_type_response_btn = "D";
					_ky = _submitter.dpc;
				}
				
				if (_diff_days > -1){
					_status_txt = gap.lang.ing_collection;	//취합중
					_submit_status_txt = gap.lang.before_submission;	//제출전
					_show_response_btn = true;								
				}
				
				if (_has_response){
					for(h = 0; h < _info.res_members.length; h++){
						var res_member = _info.res_members[h];
						if (res_member == _ky){
							_submit_status_txt = gap.lang.complete_submission;	//제출완료
							_show_response_btn = false;
							_show_response_edit_btn = true;
						}
					}
				}
				
				_role_txt = gap.lang.collect_submitter;	//"제출담당자"
				
				break;
			}
		}
		
		for (var k = 0; k < _info.referrer.length; k++){
			var _referrer = _info.referrer[k];
			if (_referrer.ky == gap.userinfo.rinfo.ky){
				_role_txt = gap.lang.collect_referrer;	//"참조인"
				break;
			}
		}
		
		if (_owner_info.ky == gap.userinfo.rinfo.ky){
			_show_main_edit_btn = true;
		//	_show_response_edit_btn = false;
			if (_diff_days > -1){
				_status_txt = gap.lang.ing_collection	//취합중
			}
			_role_txt = gap.lang.manager_collection;		//취합담당자
		}
		
		if (_diff_days < 0){
			//취합 마감
			_status_txt = gap.lang.close_collection;	//취합 마감
			_submit_status_txt = gap.lang.close_submission;	//제출 마감
			_show_response_edit_btn = false;
		}
		
		if (_info.temp == "T"){
			_status_txt = gap.lang.temps;
		}
		
		_html += '<div class="wrap">';
		_html += '	<div id="container" class="mu_mobile">';
		_html += '		<section class="gathering mo_gathering">';
		_html += '			<div class="m_marketing">';
		_html += '				<div class="tit">';
		_html += '					<h1>' + _info.name + ' <span>(Created : ' + _created_date + ')</span></h1>';
		_html += '					<span>' + _info.content + '</span>';
		_html += '				</div>';
		_html += '				<div class="m_mem">';
		_html += '					<div class="list_info">';
		_html += '						<span class="com">' + _owner_info.disp_user_info + '</span>';
		_html += '						<span class="day">' + _status_txt + '(' + _res_count + '/' + _info.submitter.length + gap.lang.myung + ')</span>';
		_html += '					</div>';
		_html += '					<div class="gather line-box">';
		_html += '						<p class="txt">' + gap.lang.deadline + ' ' + _disp_date + '(' + moment(_info.due_date).format('ddd') + ') ' + _info.due_time + '</p>';
		if (_diff_days > 0){
			_html += '						<span class="dday">D-' + _diff_days + '</span>';			
		}
		_html += '					</div>';
		
		if (_file_count > 0){
			_html += '					<div id="main_file" class="down_sec" style="padding-top:8px;">';
			_html += '						<div class="file_down_link">';
			_html += '							<span>' + _file + '</span>';
			_html += '						</div>';
			_html += '					</div>';
		}
		
		_html += '				</div>';	
		_html += '				<div class="m_list">';
		_html += '					<div class="t_btn_sec">';
	//	_html += '						<button type="button" class="m_qna_btn">Q&A(<span id="qna_btn_total_count">0</span>)</button>';
		_html += '						<button type="button" id="qna_btn" class="m_qna_btn">Q&A(' + _qna_count + ')</button>';
		_html += '					</div>';
		_html += '					<div class="list_inner" id="collect_response_list" style="height:100%;">';
		_html += '					</div>';
		_html += '				</div>';
		_html += '			</div>';
		_html += '		</section>';
		_html += '	</div>';
		_html += '</div>';

		$("#dis").html(_html);
		
		$("#main_file").data("folder", _folder);
		$("#qna_btn").data("folder", _folder);
		
		// 응답문서 그리기
	//	gColM.drawCollectResponseList((_role_txt == gap.lang.collect_submitter ? true : false), _owner_info, _response, _submit_status_txt);
		gColM.drawCollectResponseList(false, _show_response_edit_btn, _owner_info, _info, _response, _submit_status_txt);
		
		// 이벤트 처리
		gColM.eventCollectDetailView();
	},
	
	"drawCollectResponseList" : function(_is_submitter, _show_response_edit_btn, _owner_info, _info, _response, _submit_status_txt){
		$("#collect_response_list").empty();

		if (_is_submitter){
			// 제출담당자
			for (var k = 0; k < _response.length; k++){
				var _html = '';
				var _res_info = _response[k];
				var _res_id = _res_info._id;
				var _res_content = (_res_info.content ? _res_info.content : "");
				var _res_owner = gap.user_check(_res_info.owner);
				var _res_datetime = "";
				var _res_time = "";
				var _res_file = "";
				var _res_file_md5 = "";
				var _res_file_count = 0;
				
				if (typeof(_res_info.GMT) != "undefined"){
					_res_datetime = gColM.convertGMTLocalDateTime(_res_info.GMT);
				}
				if (typeof(_res_info.file_info) != "undefined" && _res_info.file_info.length > 0){
					_res_file = (_res_info.file_info.length == 1 ? _res_info.file_info[0].filename : _res_info.file_info[0].filename + gap.lang.other + (_res_info.file_info.length - 1) + gap.lang.total_attach_count_txt);
					_res_file_md5 = _res_info.file_info[0].md5;
					_res_file_count = _res_info.file_info.length;
				}
						
				if (_res_owner.ky == gap.userinfo.rinfo.ky){
					_html += '<div class="m_list_count">';
					_html += '	<div class="list_info">';
					_html += '		<span class="com">' + _submit_status_txt + '</span>';
					_html += '		<span class="day">' + _res_datetime + '</span>';
					_html += '		<span class="txt">' + _res_content + '</span>';
					_html += '	</div>';
					_html += '	<div class="list_btn">';
					_html += '		<button type="button" id="' + _res_id + '"></button>';
					_html += '	</div>';
					_html += '</div>';
					
					$("#collect_response_list").append(_html);
					
					$("#" + _res_id).data("folder", _res_info.key);
					$("#" + _res_id).data("md5", _res_file_md5);
					$("#" + _res_id).data("fcount", _res_file_count);
					$("#" + _res_id).data("finfo", _res_info.file_info);
					$("#" + _res_id).data("content", _res_content);
					
					break;
				}
			}
			
		}else{
			// 내 부서 or 내 것만 표시한다.
			for (var k = 0; k < _response.length; k++){
				var _res_info = _response[k];
				
				if (_res_info.owner.dsize == "group" && (_res_info.owner.dpc == gap.userinfo.rinfo.dpc)){
					gColM.drawCollectResponseHtml('D', _owner_info, _info, _res_info);
					
				}else{
					if (_res_info.owner.ky == gap.userinfo.rinfo.ky){
						gColM.drawCollectResponseHtml('P', _owner_info, _info, _res_info);
					}
				}
			}
			
			// 내 부서 or 내 것을 제외한 나머지
			for (var k = 0; k < _response.length; k++){
				var _res_info = _response[k];
				
				if (_res_info.owner.dsize == "group" && (_res_info.owner.dpc != gap.userinfo.rinfo.dpc)){
					gColM.drawCollectResponseHtml('', _owner_info, _info, _res_info);
					
				}else{
					if (_res_info.owner.dsize != "group" && _res_info.owner.ky != gap.userinfo.rinfo.ky){
						gColM.drawCollectResponseHtml('', _owner_info, _info, _res_info);
					}
				}
			}		
		}
	},
	
	"drawCollectResponseHtml" : function(_res_type, _owner_info, _info, _response){
		var _html = '';
		var _res_info = _response;
		var _res_id = _res_info._id;
		var _res_submit = (_res_info.complete == "T" ? gap.lang.complete_submission : gap.lang.unsubmitted);
		var _res_content = (_res_info.content ? _res_info.content : "");
		var _res_owner = gap.user_check(_res_info.owner);
		var _res_writer = (typeof(_res_info.writer) != "undefined" ? gap.user_check(_res_info.writer) : "");
		var _res_disp_user_info = "";
		var _res_datetime = "";
		var _res_modify_datetime = "";
		var _res_time = "";
		var _res_file = "";
		var _res_file_md5 = "";
		var _res_file_count = 0;
		var _show_response_btn = false;
		var _show_response_edit_btn = false;
		
		if (_res_type == "D"){
			// 제출담당자가 부서인 경우 제출자 정보를 표시한다.
			if (_res_writer != ""){
				_res_disp_user_info = _res_owner.name + " (" + _res_writer.disp_user_info + ")";
				
			}else{
				_res_disp_user_info = _res_owner.name;
			}

		}else{
			if (typeof(_res_owner.dsize) != "undefined" && _res_owner.dsize == "group"){
				if (_res_writer != ""){
					_res_disp_user_info = _res_owner.name + " (" + _res_writer.disp_user_info + ")";
					
				}else{
					_res_disp_user_info = _res_owner.name;
				}
				
			}else{
				_res_disp_user_info = _res_owner.disp_user_info;	
			}
		}
		
		if (typeof(_res_info.GMT) != "undefined"){
			_res_datetime = gColM.convertGMTLocalDateTime(_res_info.GMT);
		}
		if (typeof(_res_info.GMT2) != "undefined"){
			_res_modify_datetime = gColM.convertGMTLocalDateTime(_res_info.GMT2);
		}
		if (typeof(_res_info.file_info) != "undefined" && _res_info.file_info.length > 0){
			_res_file = (_res_info.file_info.length == 1 ? _res_info.file_info[0].filename : _res_info.file_info[0].filename + gap.lang.other + (_res_info.file_info.length - 1) + gap.lang.total_attach_count_txt);
			_res_file_md5 = _res_info.file_info[0].md5;
			_res_file_count = _res_info.file_info.length;
		}
		
		
		if (_res_type == 'P' || _res_type == 'D'){
			var _ky = (_res_type == 'P' ? gap.userinfo.rinfo.ky : gap.userinfo.rinfo.dpc);
			if (typeof(_info.res_members) != "undefined"){
				for(h = 0; h < _info.res_members.length; h++){
					var res_member = _info.res_members[h];
					if (res_member == _ky){
						_show_response_btn = false;
						_show_response_edit_btn = true;
					}
				}
			}
			
			if (!_show_response_edit_btn){
				if (_info.temp != "T"){
					_show_response_btn = true;
				}		
			}
		}
		
		_html += '<div class="m_list_count">';
		_html += '	<div class="list_info" style="padding-right:42px;">';
		_html += '		<span class="com">' + _res_submit + '</span>';

		if (_show_response_btn){
			var btn_id = "create_response_btn";
			if (_res_type == 'D'){
				btn_id = "create_group_response_btn";
			}
			_html += '		<span class="day"><button type="button" id="' + btn_id + '" class="m_qna_btn">' + gap.lang.basic_write + '</button></span>';
			
		}else if (_show_response_edit_btn){
			var btn_id = "edit_response_btn";
			if (_res_type == 'D'){
				btn_id = "edit_group_response_btn";
			}
			_html += '	<span class="day"><button id="' + btn_id + '" class="m_qna_btn">' + gap.lang.basic_modify + '</button></td>';
			
		}else{
			_html += '		<span class="day">' + _res_datetime + '</span>';
		}
		_html += '		<span class="txt">' + _res_content + '</span>';
		_html += '		<span class="com nm">' + _res_owner.disp_name_info + '</span>';
		_html += '		<span class="day part">' + _res_owner.dept + '</span>';
		_html += '	</div>';
		if (_res_file != ""){
			_html += '	<div class="list_btn">';
			_html += '		<button type="button" id="' + _res_id + '"></button>';
			_html += '	</div>';					
		}
		_html += '</div>';
		
		$("#collect_response_list").append(_html);
		
		
		if (_show_response_btn || _show_response_edit_btn){
			$("#" + btn_id).data("folder", _info.key);
			$("#" + btn_id).data("cyear", _info.key.substr(0,4));			
		}
		$("#" + _res_id).data("folder", _res_info.key);
		$("#" + _res_id).data("md5", _res_file_md5);
		$("#" + _res_id).data("fcount", _res_file_count);
		$("#" + _res_id).data("finfo", _res_info.file_info);
		$("#" + _res_id).data("content", _res_content);
	},
	
	"eventCollectDetailView" : function(){
		// 응답문서 작성 버튼
		$("#create_response_btn").off().on("click", function(){
			var _folder = $(this).data('folder');
			var _cyear = $(this).data('cyear');
			var url = gap.getBaseUrl() + "collect?readform&t=cresponse&k1=" + _folder + "&k2=P&k3=";
			var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(url);
			gBodyM.connectApp(url_link);
			return false;	
		});
		
		// 응답문서 작성 버튼 - 그룹
		$("#create_group_response_btn").off().on("click", function(){
			var _folder = $(this).data('folder');
			var _cyear = $(this).data('cyear');
			var url = gap.getBaseUrl() + "collect?readform&t=cresponse&k1=" + _folder + "&k2=D&k3=";
			var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(url);
			gBodyM.connectApp(url_link);
			return false;	
		});	
		
		// 응답문서 수정 버튼
		$("#edit_response_btn, #edit_group_response_btn").off().on("click", function(){
			var btn_id = $(this).attr('id');
			var _folder = $(this).data('folder');
			var _cyear = $(this).data('cyear');
			var url = gap.getBaseUrl() + "collect?readform&t=eresponse&k1=" + _folder + "&k2=" + (btn_id == "edit_response_btn" ? "P" : "D") + "&k3=";
			var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(url);
			gBodyM.connectApp(url_link);
			return false;	
			
		});		
		
		// 응답 파일
		$('.list_btn button').off().on('click', function(){
			var _folder = $(this).data('folder');
			var _id = $(this).attr('id');
			var url = gap.getBaseUrl() + "collect?readform&t=file&k1=" + _folder + "&k2=" + _id + "&k3=";
			var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(url);
			gBodyM.connectApp(url_link);
			return false;		
		});
		
		// Q&A
		$('.t_btn_sec button').off().on('click', function(){
			var _folder = $(this).data('folder');
			var _id = $(this).attr('id');
			var url = gap.getBaseUrl() + "collect?readform&t=qna&k1=" + _folder + "&k2=&k3=";
			var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(url);
			gBodyM.connectApp(url_link);
			return false;	
		});
		
		// 메인 파일
		$('#main_file').off().on('click', function(){
			var _folder = $(this).data('folder');
			var url = gap.getBaseUrl() + "collect?readform&t=mainfile&k1=" + _folder + "&k2=&k3=";
			var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(url);
			gBodyM.connectApp(url_link);
			return false;		
		});
	},
	
	
	"qnaCollectionInit" : function(_folder){
		gColM.collect_key = _folder;
		
		var _qna_main = gColM.drawQnaCollectionMain();
		$('#dis').html(_qna_main);
		
		// Q&A 리스트 가져오기
		gColM.drawQnaCollectionList(1);
		
		// 이벤트 처리
		gColM.eventQnaCollection();
	},
	
	"drawQnaCollectionMain" : function(){
		var _html = "";
		
		_html += '<div class="wrap">';
		_html += '	<div id="container" class="mu_mobile">';
		_html += '		<section class="gathering mo_gathering">';
		_html += '			<div id="qna_list" class="m_g_pop">';
		_html += '				<div class="pop_tit">';
		_html += '					<h1>Q&A(<span id="qna_total_count">0</span>)</h1>';
	//	_html += '					<button type="button" class="m_close_btn"></button>';
		_html += '				</div>';
		_html += '				<div id="qna_data_list" class="m_chat_list" style="height: calc(100% - 65px); overflow-y:auto;">';
		_html += '					<div class="g_r_qna_txt_wr">';
		_html += '					</div>';
		_html += '				</div>';
		_html += '				<div class="sand_sec">';
		_html += '					<input type="text" id="input_qna" placeholder="' + gap.lang.input_content + '"/>';
		_html += '					<button id="save_qna_btn" >' + gap.lang.basic_save + '</button>';
		_html += '				</div>';
		_html += '			</div>';
		_html += '		</section>';
		_html += '	</div>';
		_html += '</div>';
		
		return _html;
	},
	
	"drawQnaCollectionList" : function(page_no){
		var $layer = $('#qna_list');
		
		if (page_no == 1){
			$layer.find('.g_r_qna_txt_wr').empty();
			
			gColM.qna_count = 0;
			gColM.qna_total_count = 0;
		}
		gColM.start_skp = (parseInt(gColM.per_page) * (parseInt(page_no))) - (parseInt(gColM.per_page) - 1);

		var surl = gap.channelserver + "/api/collection/search_collection_chat.km";
		var postData = {
				"start" : gColM.start_skp - 1,
				"perpage" : gColM.per_page,
				"key" : gColM.collect_key
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
					gColM.qna_count += res.data.data.length;
					gColM.qna_total_count = res.data.totalcount;

					$layer.find("#qna_total_count").html(gColM.qna_total_count);
					$layer.find("#qna_btn_total_count").html(gColM.qna_total_count);
					
					for (var i = 0; i < res.data.data.length; i++){
						var _html = '';
						var _info = res.data.data[i];
						var _owner = gap.user_check(_info.owner);

						_html += '<div class="g_r_qna_box">';
						_html += '	<div class="user_box">';
						_html += '		<div class="user">';
						_html += '			' + _owner.user_img;
					//	_html += '			<span class="status online"></span>';					
						_html += '		</div>';
						_html += '	</div>';
						_html += '	<div class="qna_txt_box">';
						_html += '		<div class="qna_txt_top">';
						_html += '			<span class="qna_name">' + _owner.name + '</span>';
						_html += '			<span class="qna_time en">' + gColM.convertGMTLocalDateTime(_info.GMT) + '</span>';
						_html += '		</div>';
						_html += '		<div class="qna_txt_bot">';
						_html += '			<span class="qna_txt">' + _info.content;
						_html += '			</span>';
						_html += '		</div>';
						_html += '	</div>';
						_html += '</div>';
						
						$layer.find('.g_r_qna_txt_wr').append(_html);
					}
					
					var d = $('#qna_data_list');
					d.scrollTop(d.prop("scrollHeight"));

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
	
	"addQnaCollectionList" : function(page_no){
		var is_continue = false;
		if (gColM.qna_total_count > gColM.qna_count){
			is_continue = true;
		}
		if (is_continue){
			page_no++;
			gColM.drawQnaCollectionList(page_no);	
		}
	},
	
	"saveQnaContent" : function(){
		var $layer = $('#qna_list');
		var _folder = gColM.collect_key;
		var _content = $layer.find('#input_qna').val();
		
		if (_content == ""){
			mobiscroll.toast({message:gap.lang.input_content, color:'danger'});
			return false;
		}
		
		var surl = gap.channelserver + "/save_collection_chat.km";
		var postData = {
				"key" : _folder,
				"content" : _content,
				"owner" : gap.userinfo.rinfo
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
					$layer.find('#input_qna').val('');
					gColM.drawQnaCollectionList(1);

				}else{
					mobiscroll.toast({message:gap.lang.errormsg, color:'danger'});
					return false;
				}
			},
			error : function(e){
				mobiscroll.toast({message:gap.lang.errormsg, color:'danger'});
				return false;
			}
		});
		
	},
	
	"eventQnaCollection" : function(){
		var $layer = $('#qna_list');
		
		// 텍스즈 저장
		$layer.find('#save_qna_btn').on('click', function(){
			gColM.saveQnaContent();
		});
	},
	
	/*
	 * 첨부파일 데이터 가져오기
	 */
	"downloadFileListGet" : function(_folder, _id){
		var surl = gap.channelserver + "/api/collection/search_collection_item.km";
		var postData = {
				"key" : _folder
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
					var _info = res.data.ori;
					var _response = res.data.response;
					
					if (typeof(_id) != "undefined" && _id != ""){
						// 응답문서
						for (k = 0; k < _response.length; k++){
							var _res_info = _response[k];
							var _res_id = _res_info._id;
							
							if (_res_id == _id){
								gColM.downloadFileListInit(gap.channelserver, _res_info.key, _res_info.file_info, _res_info.owner.ky, 'response', _res_id);
								break;
							}
						}
						
					}else{
						// 메인문서
						gColM.downloadFileListInit(gap.channelserver, _info.key, _info.file_info.files, _info.owner.ky, 'main', '');
					}


				}else{
					gap.gAlert(gap.lang.errormsg);
					return false;
				}
			},
			error : function(e){
				gap.gAlert(gap.lang.errormsg);
			}
		});	
	},
	
	/*
	 * 파일 클릭
	 * gColM.downloadFileListInit(_fserver, _folder, _finfo, _owner_ky, _doc_kind, _res_id);
	 * gColM.downloadFileListInit(gap.channelserver, '20220906090506_VFT4JUJDIGUW5EL', '[{"file_size":{"$numberLong":"5465791"},"filename":"EOS_50D_웹카다로그.pdf","file_type":"pdf","savefilename":"10im0966_EOS_50D_웹카다로그.pdf","md5":"7869daf67a5d8b4f34e37af76f1846e5.5465791"},{"file_size":{"$numberLong":"533615"},"filename":"대상DSW_취합.pptx","file_type":"pptx","savefilename":"10im0966_대상DSW_취합.pptx","md5":"a4a4e36f69e19a04ba0dc7e510f68989.533615"}]', '10im0966', 'response', '63168eb305dd81408d8793ac')
	 */
	"downloadFileListInit" : function(_fserver, _folder, _finfo, _owner_ky, _doc_kind, _res_id){
		var _file_main = gColM.drawFileCollectionMain();
		$('#dis').html(_file_main);
		
		//_finfo = JSON.parse(_finfo);
		
		// 파일리스트 가져오기
		gColM.drawFileCollectionList(_fserver, _folder, _finfo, _owner_ky, _doc_kind, _res_id);
		
		// 이벤트 처리
		gColM.eventFileCollection();
	},
	
	"drawFileCollectionMain" : function(){
		var _html = '';
		
		_html += '<div class="wrap">';
		_html += '	<div id="container" class="mu_mobile">';
		_html += '		<section class="gathering mo_gathering">';
		_html += '			<div id="file_list" class="m_g_pop file_pop">';
		_html += '				<div class="pop_tit">';
		_html += '					<h1>' + gap.lang.file + '(<span id="file_total_count"></span>)</h1>';
	//	_html += '					<button type="button" class="m_close_btn"></button>';
		_html += '				</div>';
		_html += '				<div class="m_file_list" style="height: calc(100% - 30px); overflow-y:auto;">';
		_html += '				</div>';
		_html += '			</div>';
		_html += '		</section>';
		_html += '	</div>';
		_html += '</div>';
		
		
		return _html;		
	},
	
	"drawFileCollectionList" : function(_file_server, _file_folder, _file_info, _owner_ky, _doc_kind, _res_id){
		var $layer = $('#file_list');
		$layer.find(".m_file_list").empty();
		$layer.find("#file_total_count").html(_file_info.length);
		
		for (var i = 0; i < _file_info.length; i++){
			var _html = '';
			var _info = _file_info[i];
			var _fname = _info.filename;
			var _fid = _info.md5.replace(".", "_");
			
			_html += '<div class="m_list_count">';
			_html += '	<div class="list_info" style="margin-right: 65px;">';
			_html += '		<span class="txt">' + _fname + '</span></span>';
			_html += '	</div>';
			_html += '	<div class="list_btn" id="finfo_' +  _fid + '">';
			_html += '		<button type="button"></button>';
			_html += '	</div>';
			_html += '</div>';
			
			$layer.find(".m_file_list").append(_html);
			$layer.find('#finfo_' + _fid).data('fserver', _file_server);
			$layer.find('#finfo_' + _fid).data('folder', _file_folder);
			$layer.find('#finfo_' + _fid).data('finfo', _info);
			$layer.find('#finfo_' + _fid).data('ownerky', _owner_ky);
			$layer.find('#finfo_' + _fid).data('dockind', _doc_kind);
			$layer.find('#finfo_' + _fid).data('resid', _res_id);
		}
	},
	
	"eventFileCollection" : function(){
		var $layer = $('#file_list');
		
		// 미리보기
		$layer.find('.list_btn button').on('click', function(){
			var _fserver = $(this).parent().data('fserver');
			var _folder = $(this).parent().data('folder');
			var _finfo = $(this).parent().data('finfo');
			var _dockind = $(this).parent().data('dockind');	// main or response
			var _fname = $(this).parent().data('ownerky') + '_' + _finfo.filename;
			var _md5  = _finfo.md5;
			
			var _info = {
					"fserver" : _fserver,
					"folder" : _folder,
					"dockind" : _dockind,
					"md5" : _md5,
					"fname" : _fname
			}
			
			var url = gap.getBaseUrl() + "collect?readform&t=fileconvert&k1=" + encodeURIComponent(JSON.stringify(_info)) + "&k2=&k3=";
			var url_link = "kPortalMeet://NativeCall/callNewLayer?url=" + encodeURIComponent(url) + "&title=" + encodeURIComponent(gap.lang.preview);
			gBodyM.connectApp(url_link);
			return false;		
			
		//	gColM.fileConvert(_fserver, _fname, _md5, _dkind, 'collect', '', '', _folder);
		});
	},
	
	"fileConvertInit" : function(_data){
		var _info = JSON.parse(decodeURIComponent(_data));
		var _fserver = _info.fserver;
		var _folder = _info.folder;
		var _dockind = _info.dockind;
		var _md5 = _info.md5;
		var _fname = gap.textToHtml(_info.fname);

		gColM.fileConvert(_fserver, _fname, _md5, _dockind, 'collect', '', '', _folder);
	},
	
	"fileConvert" : function(fserver, fname, md5, item_id, ty, ft, email, upload_path){
		var filePath = "";
		var year = upload_path.substring(0,4);
		if (item_id == "response"){
			filePath = gap.synapserver + gap.filesepa + "upload" + gap.filesepa + "collect" + gap.filesepa + year + gap.filesepa + upload_path + gap.filesepa + "response" + gap.filesepa + fname;
			
		}else{
			filePath = gap.synapserver + gap.filesepa + "upload" + gap.filesepa + "collect" + gap.filesepa + year + gap.filesepa + upload_path + gap.filesepa + fname;
		}
				
		//싸이냅 소프트 파일 미리보기로 변경한다.
		var fid = "CONVERTTEST_" + md5 + "_" + new Date().getTime();	 // UNID 입력
		
		var server = "";
		if (gap.isDev){
			server = "dswdv.daesang.com";
			
		}else{
			server = "dswext.daesang.com";
		}
		
		//로그를 남긴다.
		var log = new Object();
		log.fserver = fserver;
		log.filename = fname;
		log.md5 = md5;
		log.item_id = item_id;
		log.ty = ty;
		log.ft = ft;
		log.email = email;
		log.upload_path = upload_path;
		log.actor = gap.userinfo.rinfo;
		log.synpath = filePath;
		log.action = "collect";
		log.action_os = "Mobile";
		
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

		$.ajax({
			type: "GET",
			url: "https://" + server + "/SynapDocViewServer/job", // Server Address Setting
			data: {
				"fid": fid,
				"filePath": filePath,
				"convertType": "1",
				"fileType": "Local",
				"convertLocale": "ko_KR",
				"sync": false
			},
			contentType: "application/json;charset=utf-8",
			dataType: 'json',
			async: false,
			success: function (data) {
				location.href = "https://" + server + "/SynapDocViewServer/" + data.viewUrlPath;
			},
			error: function (error) {
				//alert(error.status + " : " + error.statusText);
				mobiscroll.toast({message:error.statusText, color:'danger'});
				return false;
			}
		});					
	},
	
	"changePage" : function(){
		if (gap.param1 == "tab1"){
			gColM.tab1();
			
		}else if (gap.param1 == "tab2"){
			gColM.tab2();
			
		}else if (gap.param1 == "tab3"){
			gColM.tab3();
			
		}else if (gap.param1 == "detail"){
			//취합 상세 보기
			gColM.callCollectDetailView(gap.param2);
			
		}else if (gap.param1 == "mainfile"){
			// 메인 파일 리스트
			gColM.downloadFileListGet(gap.param2);	
			
		}else if (gap.param1 == "file"){
			// 응답 파일 리스트
			gColM.downloadFileListGet(gap.param2, gap.param3);
			
				
		}else if (gap.param1 == "qna"){
			//Q&A 클릭
			gColM.qnaCollectionInit(gap.param2);
			
		}else if (gap.param1 == "fileconvert"){
			// 파일 미리보기
			gColM.fileConvertInit(gap.param2);
			
		}else if (gap.param1 == "cresponse"){
			// 응답 작성
			gColM.createCollectResponse(gap.param2, gap.param3);
			
		}else if (gap.param1 == "eresponse"){
			// 응답 수정
			gColM.editCollectResponse(gap.param2, gap.param3);			
		}
	},
	
	"convertGMTLocalDateTime" : function(val){
		var _date = moment(val, 'YYYYMMDDHHmmss').utc().local().format('YYYY-MM-DD[T]HH:mm:00[Z]')
		var ret = moment.utc(_date).local().format('YYYY.MM.DD') + '(' + moment.utc(_date).local().format('ddd') + ') ' + moment.utc(_date).local().format('HH:mm');
		return ret;
	}
}
